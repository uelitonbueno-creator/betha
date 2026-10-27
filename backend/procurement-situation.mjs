// Read-only reconstruction of procurement situation counts from archived R2 pages.
// The D1 summary is the source of truth for page count and expected row count.
// Never list extra R2 pages: a stale page beyond the checkpoint may duplicate rows.
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

export async function readProcurementSituationCounts({bucket,tenantId,summary,pageKey}) {
  const pages = Number(summary?.pages);
  const expectedRows = Number(summary?.count);
  if (!bucket || typeof bucket.get !== "function" || typeof pageKey !== "function") {
    return {status:"unavailable",reason:"R2_UNAVAILABLE",groups:{}};
  }
  if (summary?.loadStatus !== "complete" ||
      !Number.isSafeInteger(pages) || pages < 1 || pages > 250 ||
      !Number.isSafeInteger(expectedRows) || expectedRows < 1) {
    return {status:"unavailable",reason:"SOURCE_INCOMPLETE_OR_UNBOUNDED",groups:{}};
  }
  const tenant = String(tenantId);
  const key = JSON.stringify([tenant,pages,expectedRows,summary?.updatedAt||summary?.updated_at||""]);
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.until > now) return cached.promise;

  const promise = (async () => {
    const counts = Object.create(null);
    const ids = new Set();
    let rowCount = 0;
    for (let start = 0; start < pages; start += 6) {
      const batch = await Promise.all(Array.from(
        {length:Math.min(6,pages-start)},
        async (_,i) => {
          const page = start+i;
          const object = await bucket.get(pageKey(page));
          if (!object) throw new Error("ARCHIVE_PAGE_MISSING");
          const saved = await object.json();
          if (saved?.tenantId !== tenant ||
              saved?.system !== "compras" ||
              saved?.resource !== "processos-administrativos" ||
              Number(saved?.page) !== page ||
              !Array.isArray(saved?.rows) ||
              !Array.isArray(saved?.fields) ||
              !saved.fields.includes("situacao")) {
            throw new Error("ARCHIVE_PAGE_INVALID");
          }
          return saved.rows;
        }
      ));
      for (const rows of batch) {
        for (const row of rows) {
          const id = row?.id == null ? "" : String(row.id);
          const situation = typeof row?.situacao === "string" ? row.situacao.trim() : "";
          if (!id || !situation || ids.has(id)) {
            throw new Error("ARCHIVE_ROWS_INVALID_OR_DUPLICATED");
          }
          ids.add(id);
          counts[situation] = (counts[situation] || 0) + 1;
          rowCount++;
        }
      }
    }
    if (rowCount !== expectedRows) throw new Error("ARCHIVE_COUNT_MISMATCH");
    return {status:"complete",reason:null,groups:{...counts},rows:rowCount,pages};
  })().catch(error => ({
    status:"unavailable",
    reason:String(error?.message||"ARCHIVE_READ_ERROR").slice(0,80),
    groups:{}
  }));

  cache.set(key,{promise,until:now+CACHE_TTL_MS});
  const result = await promise;
  if (result.status !== "complete") cache.delete(key);
  if (cache.size > 50) {
    for (const [cacheKey,value] of cache) if (value.until <= Date.now()) cache.delete(cacheKey);
  }
  return result;
}
