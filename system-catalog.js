/* BI Vella - catálogo multi-sistema.
 * Grupos principais são genéricos; submenus e painéis mudam conforme o sistema.
 * Os módulos Contábil, Compras e Folha usam amostras locais enquanto o Worker está indisponível.
 */
(() => {
  const dashboards=window.BI_DASHBOARDS=window.BI_DASHBOARDS||{};

  const src=id=>"sample:"+id;
  const local=(system,file)=>({system,file:"data/samples/"+file,sourceKey:system,mode:"sample"});

  function add(id,system,file,title,description,kpis,charts){
    dashboards[id]={
      title,description,level:"macro-micro",system,
      localSample:local(system,file),
      kpis:kpis.map(k=>({...k,source:src(system)})),
      charts:charts.map(c=>({...c,source:src(system)}))
    };
  }
  const k=(id,label,format,sample)=>({id,label,format,sample});
  const ch=(id,title,type,sample,subtitle="")=>({id,title,type,subtitle,sample});

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
    ]);

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
    ]);

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
    ]);

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

  const generic=(home,financeiro=[],operacoes=[],cadastros=[],controle=[])=>[
    {id:home,descricao:"Início",icone:"home-outline",rota:home,possuiPermissao:true},
    {id:"grupo-financeiro",descricao:"Financeiro",icone:"cash-multiple",possuiPermissao:true,submenus:financeiro},
    {id:"grupo-operacoes",descricao:"Operações",icone:"view-dashboard-outline",possuiPermissao:true,submenus:operacoes},
    {id:"grupo-cadastros",descricao:"Cadastros",icone:"database-outline",possuiPermissao:true,submenus:cadastros},
    {id:"grupo-controle",descricao:"Controle",icone:"shield-check-outline",possuiPermissao:true,submenus:controle}
  ];

  const item=(id,descricao,icone="chart-box-outline")=>({id,descricao,icone,rota:id,possuiPermissao:true});

  const tributosMenu=generic("visao-geral",
    [item("arrecadacao","Arrecadação","chart-line"),item("debitos","Lançamentos e débitos","file-document-edit-outline"),item("divida","Dívida ativa","bank-outline"),item("parcelamentos","Parcelamentos","calendar-check-outline"),item("receitas-creditos","Receitas e créditos","cash-multiple"),item("guias","Guias e documentos","receipt")],
    [item("encerramento","Encerramento mensal","calendar-month-outline"),item("itbi","Transferências e ITBI","home-switch-outline"),item("obras","Obras","hammer-wrench")],
    [item("contribuintes","Contribuintes","account-group-outline"),item("economicos","Econômicos e ISS","storefront-outline"),item("imobiliario","Imobiliário e IPTU","home-city-outline"),item("territorio","Território cadastral","map-marker-outline"),item("indexadores","Indexadores","chart-timeline-variant")],
    [item("qualidade","Qualidade e auditoria","shield-check-outline")]
  );

  const contabilMenu=generic("contabil-visao-geral",
    [item("contabil-receita","Receita"),item("contabil-despesa","Despesa")],
    [item("contabil-movimentos","Movimentos contábeis")],
    [item("contabil-credores","Credores")],
    [item("contabil-controle","Controle contábil")]
  );
  const comprasMenu=generic("compras-visao-geral",
    [item("compras-contratos","Contratos")],
    [item("compras-processos","Processos"),item("compras-licitacoes","Licitações")],
    [item("compras-fornecedores","Fornecedores")],
    [item("compras-controle","Prazos e situações")]
  );
  const folhaMenu=generic("folha-visao-geral",
    [item("folha-mensal","Folha mensal"),item("folha-encargos","Encargos")],
    [item("folha-eventos","Eventos")],
    [item("folha-servidores","Servidores")],
    [item("folha-controle","Situação funcional")]
  );

  window.BI_SYSTEMS=[
    {id:"tributos",name:"Tributos",enabled:true,homeView:"visao-geral",menu:tributosMenu},
    {id:"contabil",name:"Contábil",enabled:true,homeView:"contabil-visao-geral",menu:contabilMenu,sampleMode:true},
    {id:"compras",name:"Compras",enabled:true,homeView:"compras-visao-geral",menu:comprasMenu,sampleMode:true},
    {id:"folha",name:"Folha de pagamento",enabled:true,homeView:"folha-visao-geral",menu:folhaMenu,sampleMode:true}
  ];
  window.BI_MENU=tributosMenu;
})();