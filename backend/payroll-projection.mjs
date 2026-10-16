// Read immutable R2 pages after the existing import tick. Never changes import cursors.
export function payrollMoneyCents(value) {
  if(value===null||value===undefined||value===''||typeof value==='boolean')return null;
  if(typeof value==='string'&&!/^-?\d+(?:\.\d+)?$/.test(value.trim()))return null;
  const number=Number(value);
  if(!Number.isFinite(number)||Math.abs(number)>9e12)return null;
  return Math.round(number*100);
}
export function payrollCompetence(value) {
  if(value&&typeof value==='object')value=value.valor??value.data??value.competencia;
  const match=String(value??'').match(/^(\d{4})-(\d{2})(?:$|[-T])/);
  if(!match||Number(match[2])<1||Number(match[2])>12)return null;
  return match[1]+'-'+match[2];
}
export function payrollProjectedRow(row) {
  const id=row?.id;
  if((typeof id!=='string'&&typeof id!=='number')||!String(id).trim())return null;
  const matricula=row.matricula?.id??row.codigoMatricula;
  return {
    id:String(id),matricula:matricula==null?null:String(matricula),
    competence:payrollCompetence(row.competencia),
    gross:payrollMoneyCents(row.totalBruto),discount:payrollMoneyCents(row.totalDesconto),net:payrollMoneyCents(row.valorLiquido)
  };
}
export async function ensurePayrollProjection(db) {
  await db.prepare('CREATE TABLE IF NOT EXISTS bi_payroll_values (tenant_id TEXT NOT NULL, remuneration_id TEXT NOT NULL, matricula_id TEXT, competence TEXT, gross_cents INTEGER, discount_cents INTEGER, net_cents INTEGER, PRIMARY KEY(tenant_id,remuneration_id))').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_bi_payroll_values_period ON bi_payroll_values(tenant_id,competence)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS bi_payroll_projection (tenant_id TEXT PRIMARY KEY, next_page INTEGER NOT NULL DEFAULT 0, rows_seen INTEGER NOT NULL DEFAULT 0, missing_ids INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL, error TEXT, updated_at TEXT NOT NULL)').run();
}
export async function advancePayrollProjection({db,bucket,tenantId,pageCount,sourceComplete,pageKey,batchSize=32}) {
  await ensurePayrollProjection(db);
  const state=await db.prepare('SELECT * FROM bi_payroll_projection WHERE tenant_id=?1').bind(tenantId).first();
  let next=Number(state?.next_page)||0,seen=Number(state?.rows_seen)||0,missing=Number(state?.missing_ids)||0;
  if(next>pageCount)throw new Error('PAYROLL_ARCHIVE_SHRANK');
  const end=Math.min(pageCount,next+Math.min(64,Math.max(1,batchSize)));
  try {
    for(;next<end;next++) {
      const object=await bucket.get(pageKey(next));
      if(!object)throw new Error('PAYROLL_ARCHIVE_PAGE_MISSING:'+next);
      const saved=JSON.parse(await object.text());
      if(saved.tenantId!==tenantId||saved.system!=='folha'||saved.resource!=='remuneracoes'||saved.page!==next||!Array.isArray(saved.rows)||saved.rows.length>5000)throw new Error('PAYROLL_ARCHIVE_SCOPE_INVALID:'+next);
      const valid=[];let absent=0;
      for(const row of saved.rows){const value=payrollProjectedRow(row);if(value)valid.push(value);else absent++;}
      const statements=[];
      // Seven parameters per row: bound inserts remain below D1's parameter limit.
      for(let offset=0;offset<valid.length;offset+=10){
        const chunk=valid.slice(offset,offset+10),params=chunk.flatMap(r=>[tenantId,r.id,r.matricula,r.competence,r.gross,r.discount,r.net]);
        statements.push(db.prepare('INSERT INTO bi_payroll_values (tenant_id,remuneration_id,matricula_id,competence,gross_cents,discount_cents,net_cents) VALUES '+chunk.map(()=>'(?,?,?,?,?,?,?)').join(',')+' ON CONFLICT(tenant_id,remuneration_id) DO UPDATE SET matricula_id=excluded.matricula_id,competence=excluded.competence,gross_cents=excluded.gross_cents,discount_cents=excluded.discount_cents,net_cents=excluded.net_cents').bind(...params));
      }
      const now=new Date().toISOString();
      const status=next+1===pageCount&&sourceComplete?'complete':'partial';
      statements.push(db.prepare("INSERT INTO bi_payroll_projection (tenant_id,next_page,rows_seen,missing_ids,status,error,updated_at) VALUES (?1,?2,?3,?4,?5,NULL,?6) ON CONFLICT(tenant_id) DO UPDATE SET next_page=excluded.next_page,rows_seen=excluded.rows_seen,missing_ids=excluded.missing_ids,status=excluded.status,error=NULL,updated_at=excluded.updated_at").bind(tenantId,next+1,seen+saved.rows.length,missing+absent,status,now));
      // Atomic: no page is checkpointed unless every deduplicated numeric row was stored.
      await db.batch(statements);
      seen+=saved.rows.length;missing+=absent;
    }
    return {nextPage:next,rowsSeen:seen,missingIds:missing,complete:next===pageCount&&sourceComplete};
  }catch(error){
    await db.prepare("INSERT INTO bi_payroll_projection (tenant_id,next_page,rows_seen,missing_ids,status,error,updated_at) VALUES (?1,?2,?3,?4,'error',?5,?6) ON CONFLICT(tenant_id) DO UPDATE SET status='error',error=excluded.error,updated_at=excluded.updated_at").bind(tenantId,next,seen,missing,String(error.message).slice(0,180),new Date().toISOString()).run();
    throw error;
  }
}
export async function readPayrollProjection(db,tenantId,monthKeys) {
  let snapshot;
  try{
    snapshot=await db.batch([
      db.prepare('SELECT * FROM bi_payroll_projection WHERE tenant_id=?1').bind(tenantId),
      db.prepare('SELECT competence,COUNT(*) records,COUNT(gross_cents) gross_count,COUNT(discount_cents) discount_count,COUNT(net_cents) net_count,SUM(gross_cents) gross,SUM(discount_cents) discount,SUM(net_cents) net FROM bi_payroll_values WHERE tenant_id=?1 GROUP BY competence ORDER BY competence').bind(tenantId)
    ]);
  }catch(error){if(/no such table/i.test(String(error.message)))return null;throw error;}
  const state=snapshot[0]?.results?.[0];
  if(!state)return null;
  const all=snapshot[1]?.results||[],unknown=all.find(row=>row.competence===null)?.records||0;
  const uniqueRemunerations=all.reduce((n,row)=>n+Number(row.records),0);
  const rows=all.filter(row=>row.competence&&(!monthKeys||monthKeys.has(row.competence)));
  const count=rows.reduce((n,r)=>n+Number(r.records),0);
  const metric=key=>count>0&&!unknown&&!Number(state.missing_ids)&&rows.every(row=>Number(row[key+'_count'])===Number(row.records))?rows.reduce((n,r)=>n+Number(r[key]),0)/100:null;
  return {state,rows,records:count,uniqueRemunerations,duplicateRows:Math.max(0,Number(state.rows_seen)-uniqueRemunerations),unknownCompetence:Number(unknown),gross:metric('gross'),discount:metric('discount'),net:metric('net')};
}
