/* BI Vella - catálogo multi-sistema.
 * Grupos principais são genéricos; submenus e painéis mudam conforme o sistema.
 * Os módulos Contábil, Compras e Folha usam amostras locais enquanto o Worker está indisponível.
 */
(() => {
  const dashboards=window.BI_DASHBOARDS=window.BI_DASHBOARDS||{};

  const src=id=>"sample:"+id;
  const local=(system,file)=>({system,file:"data/samples/"+file,sourceKey:system,mode:"sample"});

  const systemFilters={
    contabil:[
      {id:"unidade",field:"unidade",label:"Unidade",type:"select"},
      {id:"status",field:"status",label:"Situação",type:"select"},
      {id:"fonteRecurso",field:"fonteRecurso",label:"Fonte de recurso",type:"select"},
      {id:"credor",field:"credor",label:"Credor",type:"select"}
    ],
    compras:[
      {id:"secretaria",field:"secretaria",label:"Secretaria",type:"select"},
      {id:"modalidade",field:"modalidade",label:"Modalidade",type:"select"},
      {id:"status",field:"status",label:"Situação",type:"select"},
      {id:"fornecedor",field:"fornecedor",label:"Fornecedor",type:"select"}
    ],
    folha:[
      {id:"secretaria",field:"secretaria",label:"Secretaria",type:"select"},
      {id:"vinculo",field:"vinculo",label:"Vínculo",type:"select"},
      {id:"status",field:"status",label:"Situação",type:"select"},
      {id:"cargo",field:"cargo",label:"Cargo",type:"select"}
    ]
  };

  function autoSummaryTables(charts=[]){
    return charts
      .filter(chart=>chart?.sample?.group)
      .slice(0,2)
      .map(chart=>{
        const sample=chart.sample||{};
        const columns=Array.isArray(sample.fields)&&sample.fields.length
          ? sample.fields.map((field,index)=>({
              id:field.id||field.field||("valor-"+index),
              label:field.label||field.field||("Valor "+(index+1)),
              field:field.field,
              agg:sample.agg||"sum",
              format:field.format||sample.format||"number"
            }))
          : [{
              id:"valor",
              label:sample.agg==="count"||sample.agg==="distinct"?"Quantidade":(chart.title||"Valor"),
              field:sample.field,
              agg:sample.agg||(sample.field?"sum":"count"),
              format:sample.format||"number"
            }];
        return {
          id:"table-"+chart.id,
          title:chart.title,
          subtitle:chart.subtitle||"Detalhamento analítico do recorte atual",
          group:sample.group,
          columns,
          sortBy:columns[0]?.id||"valor",
          limit:8
        };
      });
  }

  function add(id,system,file,title,description,kpis,charts,options={}){
    dashboards[id]={
      title,description,level:"macro-micro",system,
      localSample:local(system,file),
      filters:Array.isArray(options.filters)?options.filters:(systemFilters[system]||[]),
      summaryTables:Array.isArray(options.summaryTables)?options.summaryTables:autoSummaryTables(charts),
      kpis:kpis.map(k=>({...k,source:src(system)})),
      charts:charts.map(c=>({...c,source:src(system)}))
    };
  }
  const k=(id,label,format,sample)=>({id,label,format,sample});
  const ch=(id,title,type,sample,subtitle="")=>({id,title,type,subtitle,sample});
  const tbl=(id,title,group,columns,options={})=>({id,title,group,columns,...options});

  add("contabil-visao-geral","contabil","contabil-100.json","Visão geral","Resumo executivo da execução contábil e orçamentária.",
    [
      k("empenhado","Empenhado","currency",{agg:"sum",field:"valorEmpenhado"}),
      k("liquidado","Liquidado","currency",{agg:"sum",field:"valorLiquidado"}),
      k("pago","Pago","currency",{agg:"sum",field:"valorPago"}),
      k("arrecadado","Receita arrecadada","currency",{agg:"sum",field:"receitaArrecadada"}),
      k("credores","Credores","number",{agg:"distinct",field:"credor"})
    ],
    [
      ch("execucao-mensal","Execução mensal","line",{group:"mes",fields:[{field:"valorEmpenhado",label:"Empenhado"},{field:"valorLiquidado",label:"Liquidado"},{field:"valorPago",label:"Pago"}],agg:"sum",format:"currency"}),
      ch("despesa-funcao","Despesa por função","bar",{group:"funcao",field:"valorEmpenhado",agg:"sum",format:"currency"}),
      ch("receita-mensal","Receita mensal","bar",{group:"mes",fields:[{field:"receitaPrevista",label:"Prevista"},{field:"receitaArrecadada",label:"Arrecadada"}],agg:"sum",format:"currency"})
    ],
    {summaryTables:[
      tbl("contabil-despesa-natureza","Despesa por natureza","natureza",[
        {id:"empenhado",label:"Empenhado",field:"valorEmpenhado",agg:"sum",format:"currency"},
        {id:"liquidado",label:"Liquidado",field:"valorLiquidado",agg:"sum",format:"currency"},
        {id:"pago",label:"Pago",field:"valorPago",agg:"sum",format:"currency"}
      ],{subtitle:"Principais naturezas da despesa",sortBy:"empenhado",limit:8}),
      tbl("contabil-receita-fonte","Receita por fonte de recurso","fonteRecurso",[
        {id:"prevista",label:"Prevista",field:"receitaPrevista",agg:"sum",format:"currency"},
        {id:"arrecadada",label:"Arrecadada",field:"receitaArrecadada",agg:"sum",format:"currency"}
      ],{subtitle:"Composição das receitas",sortBy:"arrecadada",limit:8})
    ]});

  add("contabil-despesa","contabil","contabil-100.json","Despesa","Empenho, liquidação e pagamento por unidade, função e natureza.",
    [
      k("empenhado","Empenhado","currency",{agg:"sum",field:"valorEmpenhado"}),
      k("liquidado","Liquidado","currency",{agg:"sum",field:"valorLiquidado"}),
      k("pago","Pago","currency",{agg:"sum",field:"valorPago"}),
      k("pendentes","Registros pendentes","number",{agg:"count",where:{status:"Pendente"}})
    ],
    [
      ch("despesa-unidade","Despesa por unidade","bar",{group:"unidade",field:"valorEmpenhado",agg:"sum",format:"currency"}),
      ch("despesa-natureza","Despesa por natureza","bar",{group:"natureza",field:"valorEmpenhado",agg:"sum",format:"currency"}),
      ch("despesa-status","Movimentos por situação","doughnut",{group:"status",agg:"count",format:"number"})
    ]);

  add("contabil-receita","contabil","contabil-100.json","Receita","Previsão e arrecadação orçamentária.",
    [
      k("prevista","Receita prevista","currency",{agg:"sum",field:"receitaPrevista"}),
      k("arrecadada","Receita arrecadada","currency",{agg:"sum",field:"receitaArrecadada"}),
      k("realizacao","Realização","percent",{agg:"ratio",numerator:"receitaArrecadada",denominator:"receitaPrevista"}),
      k("unidades","Unidades","number",{agg:"distinct",field:"unidade"})
    ],
    [
      ch("receita-evolucao","Prevista × arrecadada","line",{group:"mes",fields:[{field:"receitaPrevista",label:"Prevista"},{field:"receitaArrecadada",label:"Arrecadada"}],agg:"sum",format:"currency"}),
      ch("receita-unidade","Arrecadação por unidade","bar",{group:"unidade",field:"receitaArrecadada",agg:"sum",format:"currency"})
    ]);

  add("contabil-movimentos","contabil","contabil-100.json","Movimentos contábeis","Débitos, créditos e movimentação por período.",
    [
      k("debitos","Débitos","currency",{agg:"sum",field:"debito"}),
      k("creditos","Créditos","currency",{agg:"sum",field:"credito"}),
      k("saldo","Saldo da amostra","currency",{agg:"sum",field:"saldoConta"}),
      k("movimentos","Movimentos","number",{agg:"count"})
    ],
    [
      ch("debitos-creditos","Débitos × créditos","line",{group:"mes",fields:[{field:"debito",label:"Débitos"},{field:"credito",label:"Créditos"}],agg:"sum",format:"currency"}),
      ch("movimentos-status","Situação dos movimentos","doughnut",{group:"status",agg:"count",format:"number"})
    ]);

  add("contabil-credores","contabil","contabil-100.json","Credores","Concentração de despesas e fornecedores/credores.",
    [
      k("credores","Credores distintos","number",{agg:"distinct",field:"credor"}),
      k("empenhado","Empenhado","currency",{agg:"sum",field:"valorEmpenhado"}),
      k("pago","Pago","currency",{agg:"sum",field:"valorPago"})
    ],
    [
      ch("credor-empenhado","Empenhado por credor","bar",{group:"credor",field:"valorEmpenhado",agg:"sum",format:"currency"}),
      ch("credor-pago","Pago por credor","bar",{group:"credor",field:"valorPago",agg:"sum",format:"currency"})
    ]);

  add("contabil-controle","contabil","contabil-100.json","Controle contábil","Indicadores de conferência da amostra contábil.",
    [
      k("registros","Registros analisados","number",{agg:"count"}),
      k("saldo","Saldo acumulado","currency",{agg:"sum",field:"saldoConta"}),
      k("pendentes","Pendências","number",{agg:"count",where:{status:"Pendente"}})
    ],
    [
      ch("controle-status","Registros por situação","doughnut",{group:"status",agg:"count",format:"number"}),
      ch("controle-unidade","Movimentos por unidade","bar",{group:"unidade",agg:"count",format:"number"})
    ]);

  add("compras-visao-geral","compras","compras-100.json","Visão geral","Resumo executivo das compras e contratações.",
    [
      k("processos","Processos","number",{agg:"count"}),
      k("estimado","Valor estimado","currency",{agg:"sum",field:"valorEstimado"}),
      k("homologado","Valor homologado","currency",{agg:"sum",field:"valorHomologado"}),
      k("economia","Economia estimada","currency",{agg:"sum",field:"economia"}),
      k("fornecedores","Fornecedores","number",{agg:"distinct",field:"fornecedor"})
    ],
    [
      ch("compras-mensal","Valores por mês","line",{group:"mes",fields:[{field:"valorEstimado",label:"Estimado"},{field:"valorHomologado",label:"Homologado"}],agg:"sum",format:"currency"}),
      ch("compras-modalidade","Processos por modalidade","doughnut",{group:"modalidade",agg:"count",format:"number"}),
      ch("compras-secretaria","Contratações por secretaria","bar",{group:"secretaria",field:"valorHomologado",agg:"sum",format:"currency"})
    ],
    {summaryTables:[
      tbl("compras-fornecedores-ranking","Principais fornecedores","fornecedor",[
        {id:"valor",label:"Valor homologado",field:"valorHomologado",agg:"sum",format:"currency"},
        {id:"processos",label:"Processos",agg:"count",format:"number"}
      ],{subtitle:"Ranking por valor homologado",sortBy:"valor",limit:8}),
      tbl("compras-contratos-situacao","Situação dos contratos","contratoAtivo",[
        {id:"quantidade",label:"Quantidade",agg:"count",format:"number"},
        {id:"valor",label:"Valor homologado",field:"valorHomologado",agg:"sum",format:"currency"}
      ],{subtitle:"Contratos ativos e inativos na amostra",sortBy:"valor",limit:8,labelMap:{"true":"Ativo","false":"Inativo"}})
    ]});

  add("compras-processos","compras","compras-100.json","Processos","Volume, situação e tramitação dos processos de compra.",
    [
      k("processos","Processos","number",{agg:"count"}),
      k("andamento","Em andamento","number",{agg:"count",where:{status:"Em andamento"}}),
      k("dias","Tempo médio de tramitação","number",{agg:"average",field:"diasTramitacao"}),
      k("secretarias","Secretarias","number",{agg:"distinct",field:"secretaria"})
    ],
    [
      ch("processos-status","Processos por situação","doughnut",{group:"status",agg:"count",format:"number"}),
      ch("processos-secretaria","Processos por secretaria","bar",{group:"secretaria",agg:"count",format:"number"}),
      ch("processos-tempo","Tempo médio por modalidade","bar",{group:"modalidade",field:"diasTramitacao",agg:"average",format:"number"})
    ]);

  add("compras-licitacoes","compras","compras-100.json","Licitações","Modalidades, valores e resultados das licitações.",
    [
      k("licitacoes","Registros licitatórios","number",{agg:"count"}),
      k("estimado","Estimado","currency",{agg:"sum",field:"valorEstimado"}),
      k("homologado","Homologado","currency",{agg:"sum",field:"valorHomologado"}),
      k("economia","Economia","currency",{agg:"sum",field:"economia"})
    ],
    [
      ch("licitacao-modalidade","Valor por modalidade","bar",{group:"modalidade",field:"valorHomologado",agg:"sum",format:"currency"}),
      ch("licitacao-status","Situação das licitações","doughnut",{group:"status",agg:"count",format:"number"})
    ]);

  add("compras-contratos","compras","compras-100.json","Contratos","Contratos ativos, valores e distribuição por secretaria.",
    [
      k("ativos","Contratos ativos","number",{agg:"count",where:{contratoAtivo:true}}),
      k("valor","Valor homologado","currency",{agg:"sum",field:"valorHomologado"}),
      k("fornecedores","Fornecedores","number",{agg:"distinct",field:"fornecedor"})
    ],
    [
      ch("contratos-secretaria","Valor contratado por secretaria","bar",{group:"secretaria",field:"valorHomologado",agg:"sum",format:"currency"}),
      ch("contratos-fornecedor","Valor por fornecedor","bar",{group:"fornecedor",field:"valorHomologado",agg:"sum",format:"currency"})
    ]);

  add("compras-fornecedores","compras","compras-100.json","Fornecedores","Participação e concentração de fornecedores.",
    [
      k("fornecedores","Fornecedores distintos","number",{agg:"distinct",field:"fornecedor"}),
      k("valor","Valor homologado","currency",{agg:"sum",field:"valorHomologado"}),
      k("processos","Processos","number",{agg:"count"})
    ],
    [
      ch("fornecedor-valor","Valor homologado por fornecedor","bar",{group:"fornecedor",field:"valorHomologado",agg:"sum",format:"currency"}),
      ch("fornecedor-processos","Processos por fornecedor","bar",{group:"fornecedor",agg:"count",format:"number"})
    ]);

  add("compras-controle","compras","compras-100.json","Controle","Prazos, economia e situações que exigem acompanhamento.",
    [
      k("suspensos","Suspensos","number",{agg:"count",where:{status:"Suspenso"}}),
      k("economia","Economia acumulada","currency",{agg:"sum",field:"economia"}),
      k("dias","Tramitação média","number",{agg:"average",field:"diasTramitacao"})
    ],
    [
      ch("controle-status-compras","Situação dos processos","doughnut",{group:"status",agg:"count",format:"number"}),
      ch("controle-prazo-compras","Prazo médio por secretaria","bar",{group:"secretaria",field:"diasTramitacao",agg:"average",format:"number"})
    ]);

  add("folha-visao-geral","folha","folha-100.json","Visão geral","Resumo executivo da folha de pagamento e quadro funcional.",
    [
      k("servidores","Servidores","number",{agg:"distinct",field:"servidorId"}),
      k("bruto","Folha bruta","currency",{agg:"sum",field:"bruto"}),
      k("liquido","Folha líquida","currency",{agg:"sum",field:"liquido"}),
      k("descontos","Descontos","currency",{agg:"sum",field:"descontos"}),
      k("encargos","Encargos","currency",{agg:"sum",field:"encargos"})
    ],
    [
      ch("folha-mensal","Evolução da folha","line",{group:"mes",fields:[{field:"bruto",label:"Bruto"},{field:"liquido",label:"Líquido"},{field:"encargos",label:"Encargos"}],agg:"sum",format:"currency"}),
      ch("folha-secretaria","Custo bruto por secretaria","bar",{group:"secretaria",field:"bruto",agg:"sum",format:"currency"}),
      ch("folha-vinculo","Servidores por vínculo","doughnut",{group:"vinculo",field:"servidorId",agg:"distinct",format:"number"})
    ],
    {summaryTables:[
      tbl("folha-despesa-secretaria","Despesa por secretaria","secretaria",[
        {id:"bruto",label:"Despesa bruta",field:"bruto",agg:"sum",format:"currency"},
        {id:"servidores",label:"Servidores",field:"servidorId",agg:"distinct",format:"number"}
      ],{subtitle:"Custo e quadro por secretaria",sortBy:"bruto",limit:8}),
      tbl("folha-servidores-situacao","Servidores por situação","status",[
        {id:"servidores",label:"Quantidade",field:"servidorId",agg:"distinct",format:"number"},
        {id:"bruto",label:"Despesa bruta",field:"bruto",agg:"sum",format:"currency"}
      ],{subtitle:"Situação funcional do quadro",sortBy:"servidores",limit:8})
    ]});

  add("folha-mensal","folha","folha-100.json","Folha mensal","Valores brutos, líquidos e descontos por competência.",
    [
      k("bruto","Bruto","currency",{agg:"sum",field:"bruto"}),
      k("liquido","Líquido","currency",{agg:"sum",field:"liquido"}),
      k("descontos","Descontos","currency",{agg:"sum",field:"descontos"}),
      k("servidores","Servidores","number",{agg:"distinct",field:"servidorId"})
    ],
    [
      ch("folha-competencia","Bruto × líquido","line",{group:"mes",fields:[{field:"bruto",label:"Bruto"},{field:"liquido",label:"Líquido"}],agg:"sum",format:"currency"}),
      ch("folha-descontos","Descontos por secretaria","bar",{group:"secretaria",field:"descontos",agg:"sum",format:"currency"})
    ]);

  add("folha-servidores","folha","folha-100.json","Servidores","Distribuição do quadro funcional por secretaria e vínculo.",
    [
      k("servidores","Servidores","number",{agg:"distinct",field:"servidorId"}),
      k("ativos","Ativos","number",{agg:"distinct",field:"servidorId",where:{status:"Ativo"}}),
      k("afastados","Afastados","number",{agg:"distinct",field:"servidorId",where:{status:"Afastado"}}),
      k("ferias","Em férias na amostra","number",{agg:"count",where:{ferias:true}})
    ],
    [
      ch("servidores-secretaria","Servidores por secretaria","bar",{group:"secretaria",field:"servidorId",agg:"distinct",format:"number"}),
      ch("servidores-vinculo","Servidores por vínculo","doughnut",{group:"vinculo",field:"servidorId",agg:"distinct",format:"number"}),
      ch("servidores-status","Situação funcional","doughnut",{group:"status",field:"servidorId",agg:"distinct",format:"number"})
    ]);

  add("folha-eventos","folha","folha-100.json","Eventos","Incidência e valores associados aos eventos da folha.",
    [
      k("eventos","Eventos distintos","number",{agg:"distinct",field:"evento"}),
      k("registros","Lançamentos","number",{agg:"count"}),
      k("bruto","Base bruta","currency",{agg:"sum",field:"bruto"})
    ],
    [
      ch("eventos-volume","Lançamentos por evento","bar",{group:"evento",agg:"count",format:"number"}),
      ch("eventos-valor","Valor bruto por evento","bar",{group:"evento",field:"bruto",agg:"sum",format:"currency"})
    ]);

  add("folha-encargos","folha","folha-100.json","Encargos","Encargos patronais e distribuição por unidade.",
    [
      k("encargos","Encargos","currency",{agg:"sum",field:"encargos"}),
      k("bruto","Base bruta","currency",{agg:"sum",field:"bruto"}),
      k("servidores","Servidores","number",{agg:"distinct",field:"servidorId"})
    ],
    [
      ch("encargos-mes","Encargos por competência","line",{group:"mes",field:"encargos",agg:"sum",format:"currency"}),
      ch("encargos-secretaria","Encargos por secretaria","bar",{group:"secretaria",field:"encargos",agg:"sum",format:"currency"})
    ]);

  add("folha-controle","folha","folha-100.json","Controle","Situações funcionais e pontos de conferência.",
    [
      k("afastados","Afastados","number",{agg:"distinct",field:"servidorId",where:{status:"Afastado"}}),
      k("ferias","Férias","number",{agg:"count",where:{ferias:true}}),
      k("descontos","Descontos","currency",{agg:"sum",field:"descontos"})
    ],
    [
      ch("controle-folha-status","Situação funcional","doughnut",{group:"status",field:"servidorId",agg:"distinct",format:"number"}),
      ch("controle-folha-vinculo","Vínculos","bar",{group:"vinculo",field:"servidorId",agg:"distinct",format:"number"})
    ]);


  add("contabil-execucao-orcamentaria","contabil","contabil-100.json","Execução Orçamentária","Acompanhe a execução da receita e da despesa, do orçamento previsto ao pagamento.",
    [
      k("receita-prevista","Receita prevista","currency",{agg:"sum",field:"receitaPrevista"}),
      k("receita-arrecadada","Receita arrecadada","currency",{agg:"sum",field:"receitaArrecadada"}),
      k("despesa-empenhada","Despesa empenhada","currency",{agg:"sum",field:"valorEmpenhado"}),
      k("despesa-liquidada","Despesa liquidada","currency",{agg:"sum",field:"valorLiquidado"}),
      k("despesa-paga","Despesa paga","currency",{agg:"sum",field:"valorPago"}),
      k("resultado","Resultado arrecadado - pago","currency",{agg:"difference",minuend:"receitaArrecadada",subtrahend:"valorPago"})
    ],
    [
      ch("execucao-receita-despesa","Receita arrecadada × despesa paga","line",{group:"mes",fields:[{field:"receitaArrecadada",label:"Receita arrecadada"},{field:"valorPago",label:"Despesa paga"}],agg:"sum",format:"currency"}),
      ch("execucao-estagios-despesa","Empenhado × liquidado × pago","bar",{group:"mes",fields:[{field:"valorEmpenhado",label:"Empenhado"},{field:"valorLiquidado",label:"Liquidado"},{field:"valorPago",label:"Pago"}],agg:"sum",format:"currency"}),
      ch("execucao-unidade","Despesa empenhada por unidade","bar",{group:"unidade",field:"valorEmpenhado",agg:"sum",format:"currency"}),
      ch("execucao-fonte","Receita arrecadada por fonte","doughnut",{group:"fonteRecurso",field:"receitaArrecadada",agg:"sum",format:"currency"})
    ]);

  add("contabil-relatorios","contabil","contabil-100.json","Relatórios e Balanços","Visão consolidada para conferência e preparação de relatórios contábeis.",
    [
      k("receita","Receita arrecadada","currency",{agg:"sum",field:"receitaArrecadada"}),
      k("empenhado","Despesa empenhada","currency",{agg:"sum",field:"valorEmpenhado"}),
      k("liquidado","Despesa liquidada","currency",{agg:"sum",field:"valorLiquidado"}),
      k("pago","Despesa paga","currency",{agg:"sum",field:"valorPago"})
    ],
    [
      ch("relatorio-receita-unidade","Receita por unidade","bar",{group:"unidade",field:"receitaArrecadada",agg:"sum",format:"currency"}),
      ch("relatorio-despesa-natureza","Despesa por natureza","bar",{group:"natureza",field:"valorEmpenhado",agg:"sum",format:"currency"}),
      ch("relatorio-resultado-mensal","Receita × pagamento por mês","line",{group:"mes",fields:[{field:"receitaArrecadada",label:"Receita"},{field:"valorPago",label:"Pago"}],agg:"sum",format:"currency"})
    ]);

  add("contabil-empenhos","contabil","contabil-100.json","Empenhos","Acompanhamento dos empenhos por unidade, credor e situação.",
    [
      k("empenhado","Valor empenhado","currency",{agg:"sum",field:"valorEmpenhado"}),
      k("liquidado","Valor liquidado","currency",{agg:"sum",field:"valorLiquidado"}),
      k("pago","Valor pago","currency",{agg:"sum",field:"valorPago"}),
      k("empenhos","Empenhos","number",{agg:"distinct",field:"empenho"})
    ],
    [
      ch("empenhos-unidade","Empenhado por unidade","bar",{group:"unidade",field:"valorEmpenhado",agg:"sum",format:"currency"}),
      ch("empenhos-credor","Empenhado por credor","bar",{group:"credor",field:"valorEmpenhado",agg:"sum",format:"currency"}),
      ch("empenhos-status","Empenhos por situação","doughnut",{group:"status",field:"empenho",agg:"distinct",format:"number"})
    ]);

  add("contabil-restos","contabil","contabil-100.json","Restos a pagar","Saldo estimado entre empenhado e pago na amostra local.",
    [
      k("restos","Restos a pagar","currency",{agg:"sum",field:"restosPagar"}),
      k("credores","Credores com saldo","number",{agg:"distinct",field:"credor"}),
      k("empenhado","Empenhado","currency",{agg:"sum",field:"valorEmpenhado"}),
      k("pago","Pago","currency",{agg:"sum",field:"valorPago"})
    ],
    [
      ch("restos-credor","Restos por credor","bar",{group:"credor",field:"restosPagar",agg:"sum",format:"currency"}),
      ch("restos-natureza","Restos por natureza","bar",{group:"natureza",field:"restosPagar",agg:"sum",format:"currency"}),
      ch("restos-status","Registros por situação","doughnut",{group:"status",agg:"count",format:"number"})
    ]);

  add("contabil-demonstrativos","contabil","contabil-100.json","Demonstrativos","Síntese de receita e despesa para conferência executiva.",
    [
      k("receita-prevista","Receita prevista","currency",{agg:"sum",field:"receitaPrevista"}),
      k("receita-arrecadada","Receita arrecadada","currency",{agg:"sum",field:"receitaArrecadada"}),
      k("despesa-empenhada","Despesa empenhada","currency",{agg:"sum",field:"valorEmpenhado"}),
      k("despesa-paga","Despesa paga","currency",{agg:"sum",field:"valorPago"})
    ],
    [
      ch("demonstrativo-receita","Receita prevista × arrecadada","line",{group:"mes",fields:[{field:"receitaPrevista",label:"Prevista"},{field:"receitaArrecadada",label:"Arrecadada"}],agg:"sum",format:"currency"}),
      ch("demonstrativo-despesa","Despesa empenhada × paga","line",{group:"mes",fields:[{field:"valorEmpenhado",label:"Empenhada"},{field:"valorPago",label:"Paga"}],agg:"sum",format:"currency"}),
      ch("demonstrativo-fonte","Receita por fonte de recurso","bar",{group:"fonteRecurso",field:"receitaArrecadada",agg:"sum",format:"currency"})
    ]);

  add("compras-atas","compras","compras-100.json","Atas de Registro de Preço","Atas, valores homologados e distribuição por secretaria.",
    [
      k("atas","Atas ativas na amostra","number",{agg:"distinct",field:"ata",where:{ataRegistro:true}}),
      k("valor","Valor homologado","currency",{agg:"sum",field:"valorHomologado",where:{ataRegistro:true}}),
      k("fornecedores","Fornecedores","number",{agg:"distinct",field:"fornecedor",where:{ataRegistro:true}}),
      k("itens","Itens vinculados","number",{agg:"sum",field:"quantidadeItens",where:{ataRegistro:true}})
    ],
    [
      ch("atas-secretaria","Valor de atas por secretaria","bar",{group:"secretaria",field:"valorHomologado",agg:"sum",format:"currency",where:{ataRegistro:true}}),
      ch("atas-fornecedor","Valor de atas por fornecedor","bar",{group:"fornecedor",field:"valorHomologado",agg:"sum",format:"currency",where:{ataRegistro:true}}),
      ch("atas-modalidade","Atas por modalidade","doughnut",{group:"modalidade",agg:"count",format:"number",where:{ataRegistro:true}})
    ]);

  add("compras-itens","compras","compras-100.json","Catálogo de Itens","Itens e categorias observados nos processos de compra.",
    [
      k("itens","Quantidade de itens","number",{agg:"sum",field:"quantidadeItens"}),
      k("categorias","Categorias","number",{agg:"distinct",field:"itemCategoria"}),
      k("processos","Processos","number",{agg:"distinct",field:"processo"}),
      k("valor","Valor homologado","currency",{agg:"sum",field:"valorHomologado"})
    ],
    [
      ch("itens-categoria","Itens por categoria","bar",{group:"itemCategoria",field:"quantidadeItens",agg:"sum",format:"number"}),
      ch("itens-secretaria","Itens por secretaria","bar",{group:"secretaria",field:"quantidadeItens",agg:"sum",format:"number"}),
      ch("itens-modalidade","Categorias por modalidade","doughnut",{group:"modalidade",agg:"count",format:"number"})
    ]);

  add("folha-vinculos","folha","folha-100.json","Vínculos","Distribuição dos vínculos funcionais e seus custos.",
    [
      k("servidores","Servidores","number",{agg:"distinct",field:"servidorId"}),
      k("vinculos","Tipos de vínculo","number",{agg:"distinct",field:"vinculo"}),
      k("bruto","Folha bruta","currency",{agg:"sum",field:"bruto"}),
      k("liquido","Folha líquida","currency",{agg:"sum",field:"liquido"})
    ],
    [
      ch("vinculos-servidores","Servidores por vínculo","doughnut",{group:"vinculo",field:"servidorId",agg:"distinct",format:"number"}),
      ch("vinculos-custo","Custo bruto por vínculo","bar",{group:"vinculo",field:"bruto",agg:"sum",format:"currency"})
    ]);

  add("folha-cargos","folha","folha-100.json","Cargos","Quadro de cargos e custo bruto associado.",
    [
      k("cargos","Cargos","number",{agg:"distinct",field:"cargo"}),
      k("servidores","Servidores","number",{agg:"distinct",field:"servidorId"}),
      k("bruto","Custo bruto","currency",{agg:"sum",field:"bruto"}),
      k("encargos","Encargos","currency",{agg:"sum",field:"encargos"})
    ],
    [
      ch("cargos-servidores","Servidores por cargo","bar",{group:"cargo",field:"servidorId",agg:"distinct",format:"number"}),
      ch("cargos-custo","Custo bruto por cargo","bar",{group:"cargo",field:"bruto",agg:"sum",format:"currency"})
    ]);

  add("folha-departamentos","folha","folha-100.json","Departamentos","Distribuição funcional por secretaria e unidade de lotação.",
    [
      k("departamentos","Departamentos","number",{agg:"distinct",field:"departamento"}),
      k("servidores","Servidores","number",{agg:"distinct",field:"servidorId"}),
      k("bruto","Custo bruto","currency",{agg:"sum",field:"bruto"}),
      k("encargos","Encargos","currency",{agg:"sum",field:"encargos"})
    ],
    [
      ch("departamentos-servidores","Servidores por departamento","bar",{group:"departamento",field:"servidorId",agg:"distinct",format:"number"}),
      ch("departamentos-custo","Custo por secretaria","bar",{group:"secretaria",field:"bruto",agg:"sum",format:"currency"})
    ]);

  add("folha-beneficios","folha","folha-100.json","Benefícios","Benefícios registrados na amostra e valores associados.",
    [
      k("beneficios","Tipos de benefício","number",{agg:"distinct",field:"beneficio"}),
      k("valor","Valor de benefícios","currency",{agg:"sum",field:"beneficioValor"}),
      k("servidores","Servidores","number",{agg:"distinct",field:"servidorId"}),
      k("ativos","Ativos","number",{agg:"distinct",field:"servidorId",where:{status:"Ativo"}})
    ],
    [
      ch("beneficios-tipo","Servidores por benefício","doughnut",{group:"beneficio",field:"servidorId",agg:"distinct",format:"number"}),
      ch("beneficios-valor","Valor por benefício","bar",{group:"beneficio",field:"beneficioValor",agg:"sum",format:"currency"})
    ]);

  add("folha-despesas","folha","folha-100.json","Despesas da Folha","Composição financeira da folha por secretaria.",
    [
      k("bruto","Despesa bruta","currency",{agg:"sum",field:"bruto"}),
      k("liquido","Despesa líquida","currency",{agg:"sum",field:"liquido"}),
      k("encargos","Encargos","currency",{agg:"sum",field:"encargos"}),
      k("descontos","Descontos","currency",{agg:"sum",field:"descontos"})
    ],
    [
      ch("despesas-secretaria","Despesa bruta por secretaria","bar",{group:"secretaria",field:"bruto",agg:"sum",format:"currency"}),
      ch("despesas-mes","Evolução das despesas","line",{group:"mes",fields:[{field:"bruto",label:"Bruto"},{field:"liquido",label:"Líquido"},{field:"encargos",label:"Encargos"}],agg:"sum",format:"currency"})
    ]);

  const sf=(id,label,options={})=>({id,field:id,label,type:"select",...options});
  const qf=(id,label,placeholder)=>({id,field:id,label,type:"search",primary:false,placeholder});
  const bf=(id,label,trueLabel="Sim",falseLabel="Não")=>({
    id,field:id,label,type:"select",primary:false,dynamic:false,
    options:[{value:"true",label:trueLabel},{value:"false",label:falseLabel}]
  });
  const secondary=filter=>({...filter,primary:false});

  const panelFilters={
    "contabil-visao-geral":[sf("unidade","Unidade"),sf("fonteRecurso","Fonte de recurso"),secondary(sf("status","Situação")),secondary(sf("credor","Credor"))],
    "contabil-execucao-orcamentaria":[sf("unidade","Unidade"),sf("fonteRecurso","Fonte de recurso"),secondary(sf("funcao","Função")),secondary(sf("status","Situação"))],
    "contabil-receita":[sf("unidade","Unidade"),sf("fonteRecurso","Fonte de recurso"),secondary(sf("status","Situação"))],
    "contabil-despesa":[sf("unidade","Unidade"),sf("funcao","Função"),secondary(sf("natureza","Natureza")),secondary(sf("credor","Credor")),secondary(sf("status","Situação"))],
    "contabil-empenhos":[sf("unidade","Unidade"),sf("status","Situação"),secondary(sf("natureza","Natureza")),secondary(sf("credor","Credor")),qf("empenho","Empenho","Pesquisar número do empenho")],
    "contabil-movimentos":[sf("unidade","Unidade"),sf("status","Situação"),secondary(sf("natureza","Natureza")),secondary(sf("funcao","Função"))],
    "contabil-restos":[sf("unidade","Unidade"),sf("credor","Credor"),secondary(sf("natureza","Natureza")),secondary(sf("status","Situação"))],
    "contabil-credores":[sf("credor","Credor"),sf("unidade","Unidade"),secondary(sf("natureza","Natureza")),secondary(sf("status","Situação"))],
    "contabil-demonstrativos":[sf("unidade","Unidade"),sf("funcao","Função"),secondary(sf("natureza","Natureza")),secondary(sf("fonteRecurso","Fonte de recurso"))],
    "contabil-relatorios":[sf("unidade","Unidade"),sf("funcao","Função"),secondary(sf("natureza","Natureza")),secondary(sf("fonteRecurso","Fonte de recurso"))],
    "contabil-controle":[sf("status","Situação"),sf("unidade","Unidade"),secondary(sf("natureza","Natureza")),secondary(sf("funcao","Função"))],

    "compras-visao-geral":[sf("secretaria","Secretaria"),sf("modalidade","Modalidade"),secondary(sf("status","Situação")),secondary(sf("fornecedor","Fornecedor"))],
    "compras-processos":[sf("secretaria","Secretaria"),sf("status","Situação"),secondary(sf("modalidade","Modalidade")),qf("processo","Processo","Pesquisar número do processo")],
    "compras-licitacoes":[sf("modalidade","Modalidade"),sf("status","Situação"),secondary(sf("secretaria","Secretaria")),secondary(sf("fornecedor","Fornecedor"))],
    "compras-contratos":[sf("secretaria","Secretaria"),sf("fornecedor","Fornecedor"),bf("contratoAtivo","Contrato","Ativo","Inativo"),secondary(sf("status","Situação"))],
    "compras-fornecedores":[sf("fornecedor","Fornecedor"),sf("secretaria","Secretaria"),secondary(sf("modalidade","Modalidade")),secondary(sf("status","Situação"))],
    "compras-atas":[sf("secretaria","Secretaria"),sf("fornecedor","Fornecedor"),bf("ataRegistro","Ata de registro","Com ata","Sem ata"),secondary(sf("modalidade","Modalidade")),qf("ata","Número da ata","Pesquisar ata")],
    "compras-itens":[sf("itemCategoria","Categoria do item"),sf("secretaria","Secretaria"),secondary(sf("fornecedor","Fornecedor")),secondary(sf("status","Situação"))],
    "compras-controle":[sf("status","Situação"),sf("secretaria","Secretaria"),secondary(sf("modalidade","Modalidade")),secondary(sf("fornecedor","Fornecedor"))],

    "folha-visao-geral":[sf("secretaria","Secretaria"),sf("vinculo","Vínculo"),secondary(sf("status","Situação")),secondary(sf("cargo","Cargo"))],
    "folha-servidores":[sf("secretaria","Secretaria"),sf("status","Situação"),secondary(sf("vinculo","Vínculo")),secondary(sf("cargo","Cargo")),bf("ferias","Férias","Em férias","Fora de férias"),bf("afastado","Afastamento","Afastado","Não afastado"),qf("servidor","Servidor","Pesquisar servidor")],
    "folha-vinculos":[sf("vinculo","Vínculo"),sf("secretaria","Secretaria"),secondary(sf("status","Situação")),secondary(sf("cargo","Cargo"))],
    "folha-cargos":[sf("cargo","Cargo"),sf("secretaria","Secretaria"),secondary(sf("vinculo","Vínculo")),secondary(sf("status","Situação"))],
    "folha-departamentos":[sf("departamento","Departamento"),sf("secretaria","Secretaria"),secondary(sf("cargo","Cargo")),secondary(sf("status","Situação"))],
    "folha-mensal":[sf("secretaria","Secretaria"),sf("cargo","Cargo"),secondary(sf("vinculo","Vínculo")),secondary(sf("status","Situação"))],
    "folha-eventos":[sf("evento","Evento"),sf("secretaria","Secretaria"),secondary(sf("vinculo","Vínculo")),secondary(sf("cargo","Cargo"))],
    "folha-encargos":[sf("secretaria","Secretaria"),sf("vinculo","Vínculo"),secondary(sf("cargo","Cargo")),secondary(sf("status","Situação"))],
    "folha-beneficios":[sf("beneficio","Benefício"),sf("secretaria","Secretaria"),secondary(sf("vinculo","Vínculo")),secondary(sf("cargo","Cargo"))],
    "folha-despesas":[sf("secretaria","Secretaria"),sf("cargo","Cargo"),secondary(sf("vinculo","Vínculo")),secondary(sf("status","Situação"))],
    "folha-controle":[sf("status","Situação"),sf("secretaria","Secretaria"),bf("ferias","Férias","Em férias","Fora de férias"),bf("afastado","Afastamento","Afastado","Não afastado"),secondary(sf("vinculo","Vínculo"))]
  };

  for(const [view,filters] of Object.entries(panelFilters)){
    if(dashboards[view]) dashboards[view].filters=filters;
  }

  const item=(id,descricao,icone="chart-box-outline")=>({id,descricao,icone,rota:id,possuiPermissao:true});
  const directMenu=(home,items=[])=>[
    {id:home,descricao:"Início",icone:"home-outline",rota:home,possuiPermissao:true},
    ...items
  ];

  const tributosMenu=directMenu("visao-geral",[
    item("arrecadacao","Arrecadação","chart-line"),
    item("divida","Dívida ativa","bank-outline"),
    item("parcelamentos","Parcelamentos","calendar-check-outline"),
    item("guias","Guias e boletos","receipt"),
    item("contribuintes","Contribuintes","account-group-outline"),
    item("imobiliario","Imóveis","home-city-outline"),
    item("economicos","Econômicos e ISS","storefront-outline"),
    item("receitas-creditos","Receitas e créditos","cash-multiple"),
    item("debitos","Lançamentos e débitos","file-document-edit-outline"),
    item("itbi","Transferências e ITBI","home-switch-outline"),
    item("encerramento","Encerramento mensal","calendar-month-outline"),
    item("obras","Obras","hammer-wrench"),
    item("territorio","Território cadastral","map-marker-outline"),
    item("indexadores","Indexadores","chart-timeline-variant"),
    item("qualidade","Qualidade e auditoria","shield-check-outline")
  ]);

  const contabilMenu=directMenu("contabil-visao-geral",[
    item("contabil-execucao-orcamentaria","Execução Orçamentária","chart-areaspline"),
    item("contabil-receita","Receitas","cash-plus"),
    item("contabil-despesa","Despesas","cash-minus"),
    item("contabil-empenhos","Empenhos","file-sign"),
    item("contabil-movimentos","Movimentos Contábeis","swap-horizontal"),
    item("contabil-restos","Restos a Pagar","calendar-alert"),
    item("contabil-credores","Credores","account-cash-outline"),
    item("contabil-demonstrativos","Demonstrativos","file-chart-outline"),
    item("contabil-relatorios","Relatórios / Balanços","file-document-multiple-outline"),
    item("contabil-controle","Controle","shield-check-outline")
  ]);

  const comprasMenu=directMenu("compras-visao-geral",[
    item("compras-processos","Processos","clipboard-text-outline"),
    item("compras-licitacoes","Licitações","gavel"),
    item("compras-contratos","Contratos","file-sign"),
    item("compras-fornecedores","Fornecedores","truck-outline"),
    item("compras-atas","Atas de Registro de Preço","file-certificate-outline"),
    item("compras-itens","Catálogo de Itens","format-list-bulleted"),
    item("compras-controle","Controle","shield-check-outline")
  ]);

  const folhaMenu=directMenu("folha-visao-geral",[
    item("folha-servidores","Servidores","account-group-outline"),
    item("folha-vinculos","Vínculos","account-switch-outline"),
    item("folha-cargos","Cargos","badge-account-outline"),
    item("folha-departamentos","Departamentos","office-building-outline"),
    item("folha-mensal","Folha mensal","calendar-month-outline"),
    item("folha-eventos","Eventos","format-list-checks"),
    item("folha-encargos","Encargos","bank-transfer"),
    item("folha-beneficios","Benefícios","gift-outline"),
    item("folha-despesas","Despesas","cash-multiple"),
    item("folha-controle","Controle","shield-check-outline")
  ]);

  window.BI_SYSTEMS=[
    {id:"tributos",name:"Tributos",icon:"bank-outline",enabled:true,homeView:"visao-geral",heading:"Arrecadação, dívida, parcelamentos e situação dos contribuintes",menu:tributosMenu},
    {id:"contabil",name:"Contabilidade",icon:"calculator-variant-outline",enabled:true,homeView:"contabil-visao-geral",heading:"Receitas, despesas, execução orçamentária e resultados fiscais",menu:contabilMenu,sampleMode:true},
    {id:"compras",name:"Compras",icon:"cart-outline",enabled:true,homeView:"compras-visao-geral",heading:"Processos, licitações, contratos e fornecedores",menu:comprasMenu,sampleMode:true},
    {id:"folha",name:"Folha de Pagamento",icon:"account-group-outline",enabled:true,homeView:"folha-visao-geral",heading:"Servidores, vínculos, cargos e custos da folha",menu:folhaMenu,sampleMode:true}
  ];
  window.BI_MENU=tributosMenu;
})();