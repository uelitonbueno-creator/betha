window.BI_DASHBOARDS = {
  "visao-geral": {
    title: "Visão geral",
    description: "Leitura executiva do município: arrecadação, carteira a receber, dívida ativa, cadastros e tendência.",
    level: "macro",
    kpis: [
      { id:"arrecadado", label:"Arrecadado no período", format:"currency", source:"bi:pagamentos", field:"valorPago" },
      { id:"lancado", label:"Valor lançado", format:"currency", source:"bi:debitos", field:"vlLancado" },
      { id:"divida", label:"Saldo da dívida ativa", format:"currency", source:"base:encerramento-dividas", field:"valorSaldo" },
      { id:"parcelado", label:"Parcelamentos ativos", format:"number", source:"bi:parcelamentos", field:"id" },
      { id:"contribuintes", label:"Contribuintes", format:"number", source:"bi:contribuintes", field:"id" },
      { id:"imoveis", label:"Imóveis", format:"number", source:"bi:imoveis", field:"id" }
    ],
    charts: [
      { id:"receita-mensal", title:"Arrecadação mensal", subtitle:"Evolução do valor efetivamente pago.", type:"line", source:"bi:pagamentos", dimension:"dataPagamento:mês", measures:["valorPago"], drill:"pagamentos" },
      { id:"lancado-pago-saldo", title:"Lançado × pago × saldo", subtitle:"Visão consolidada da carteira tributária.", type:"bar", source:"base:encerramento-lancamentos", dimension:"mesEncerramento", measures:["valorLancado","valorSaldo"], drill:"debitos" },
      { id:"divida-evolucao", title:"Evolução do estoque da dívida ativa", subtitle:"Saldo no fechamento de cada mês.", type:"line", source:"base:encerramento-dividas", dimension:"mesEncerramento", measures:["valorSaldo"], drill:"divida" },
      { id:"receita-credito", title:"Arrecadação por crédito tributário", subtitle:"Participação dos principais créditos.", type:"bar", source:"bi:pagamentos-detalhados", dimension:"creditoTributario.descricao", measures:["valorPagoLancado"], drill:"arrecadacao" },
      { id:"situacao-divida", title:"Dívida ativa por situação", subtitle:"Composição da carteira por status.", type:"doughnut", source:"bi:dividas", dimension:"statusDivida", measures:["count"], drill:"divida" },
      { id:"cadastros", title:"Base cadastral", subtitle:"Contribuintes, imóveis e econômicos.", type:"bar", source:"bi:contribuintes|imoveis|economicos", dimension:"cadastro", measures:["count"], drill:"cadastros" }
    ]
  },

  "arrecadacao": {
    title: "Arrecadação",
    description: "Do total arrecadado até cada pagamento, receita e componente financeiro.",
    level: "macro-micro",
    kpis: [
      {id:"total-pago",label:"Total pago",format:"currency",source:"bi:pagamentos",field:"valorPago"},
      {id:"tributo-pago",label:"Tributo",format:"currency",source:"bi:pagamentos",field:"valorPagoLancado"},
      {id:"juros-pagos",label:"Juros",format:"currency",source:"bi:pagamentos",field:"valorPagoJuro"},
      {id:"multa-paga",label:"Multa",format:"currency",source:"bi:pagamentos",field:"valorPagoMulta"},
      {id:"correcao-paga",label:"Correção",format:"currency",source:"bi:pagamentos",field:"valorPagoCorrecao"},
      {id:"descontos",label:"Descontos concedidos",format:"currency",source:"bi:pagamentos",field:"valorConcedidoDescontos"}
    ],
    charts: [
      {id:"arrecadacao-dia",title:"Arrecadação diária",subtitle:"Pagamentos por dia.",type:"line",source:"bi:pagamentos",dimension:"dataPagamento:dia",measures:["valorPago"],drill:"pagamentos"},
      {id:"arrecadacao-mes",title:"Arrecadação mensal",subtitle:"Tendência mês a mês.",type:"line",source:"bi:pagamentos",dimension:"dataPagamento:mês",measures:["valorPago"],drill:"pagamentos"},
      {id:"arrecadacao-credito",title:"Por crédito tributário",subtitle:"Ranking dos créditos que mais arrecadam.",type:"bar",source:"bi:pagamentos-detalhados",dimension:"creditoTributario.descricao",measures:["valorPagoLancado"],drill:"pagamentos-detalhados"},
      {id:"arrecadacao-receita",title:"Por receita",subtitle:"Distribuição pela classificação de receita.",type:"bar",source:"bi:pagamentos-detalhados",dimension:"receita.descricao",measures:["valorPagoLancado"],drill:"pagamentos-detalhados"},
      {id:"composicao-pagamento",title:"Composição do pagamento",subtitle:"Tributo, correção, juros e multa.",type:"doughnut",source:"bi:pagamentos",dimension:"componente",measures:["valorPagoLancado","valorPagoCorrecao","valorPagoJuro","valorPagoMulta"],drill:"pagamentos"},
      {id:"tipo-pagamento",title:"Tipo de pagamento",subtitle:"Quantidade e valor por modalidade.",type:"bar",source:"bi:pagamentos",dimension:"tipoPagamento",measures:["valorPago","count"],drill:"pagamentos"},
      {id:"tipo-baixa",title:"Tipo de baixa",subtitle:"Distribuição das baixas registradas.",type:"bar",source:"bi:pagamentos",dimension:"tipoBaixa",measures:["valorPago"],drill:"pagamentos"},
      {id:"retroativos",title:"Pagamentos retroativos",subtitle:"Evolução de pagamentos marcados como retroativos.",type:"line",source:"bi:pagamentos",dimension:"dataPagamento:mês",filter:"pagamentoRetroativo",measures:["valorPago"],drill:"pagamentos"},
      {id:"estornos",title:"Estornos",subtitle:"Valor e quantidade de pagamentos estornados.",type:"line",source:"bi:pagamentos",dimension:"dataHoraEstorno:mês",measures:["valorPago","count"],drill:"pagamentos"},
      {id:"descontos-anistias",title:"Descontos, anistias e remissões",subtitle:"Benefícios aplicados aos pagamentos.",type:"bar",source:"bi:pagamentos-detalhados-valores",dimension:"benefício",measures:["descontos","anistias","remissões"],drill:"pagamentos-detalhados"},
      {id:"acrescimos",title:"Acréscimos arrecadados",subtitle:"Correção, juros e multa ao longo do tempo.",type:"line",source:"bi:pagamentos",dimension:"dataPagamento:mês",measures:["valorPagoCorrecao","valorPagoJuro","valorPagoMulta"],drill:"pagamentos"},
      {id:"guias",title:"Classificação das guias",subtitle:"Arrecadação por classificação/tipo de guia.",type:"bar",source:"bi:pagamentos",dimension:"classificacaoGuia",measures:["valorPago"],drill:"pagamentos"}
    ]
  },

  "debitos": {
    title: "Lançamentos e débitos",
    description: "Carteira lançada: origem, vencimento, situação, descontos e conversão em pagamento.",
    level: "macro-micro",
    kpis: [
      {id:"vl-lancado",label:"Valor lançado",format:"currency",source:"bi:debitos",field:"vlLancado"},
      {id:"qtd-debitos",label:"Débitos",format:"number",source:"bi:debitos",field:"id"},
      {id:"vencidos",label:"Débitos vencidos",format:"number",source:"bi:debitos",field:"dtVcto"},
      {id:"pagos",label:"Débitos pagos",format:"number",source:"bi:debitos",field:"dtPgto"},
      {id:"descontos-debito",label:"Descontos",format:"currency",source:"bi:debitos",field:"vlDesconto"}
    ],
    charts: [
      {id:"lancamentos-mensais",title:"Lançamentos por mês",subtitle:"Volume lançado ao longo do exercício.",type:"line",source:"bi:debitos",dimension:"dhDebito:mês",measures:["vlLancado"],drill:"debitos"},
      {id:"debitos-situacao",title:"Débitos por situação",subtitle:"Quantidade e valor por situação.",type:"bar",source:"bi:debitos",dimension:"situacao",measures:["vlLancado","count"],drill:"debitos"},
      {id:"debitos-credito",title:"Débitos por crédito",subtitle:"Ranking do valor lançado por crédito.",type:"bar",source:"bi:debitos",dimension:"idCredito",measures:["vlLancado"],drill:"debitos"},
      {id:"aging-debitos",title:"Aging de vencimentos",subtitle:"Faixas de atraso da carteira em aberto.",type:"bar",source:"bi:debitos",dimension:"faixaAtraso",measures:["vlLancado"],drill:"debitos"},
      {id:"debitos-ano",title:"Carteira por exercício",subtitle:"Valor lançado por ano de origem.",type:"bar",source:"bi:debitos",dimension:"ano",measures:["vlLancado"],drill:"debitos"},
      {id:"unica-parcelada",title:"Parcela única × parcelada",subtitle:"Distribuição pela característica do débito.",type:"doughnut",source:"bi:debitos",dimension:"unica",measures:["vlLancado"],drill:"debitos"},
      {id:"origem-cadastro",title:"Origem cadastral",subtitle:"Imobiliário, econômico, receita diversa, obra, ITBI e demais referentes.",type:"bar",source:"bi:debitos",dimension:"referente/tipo",measures:["vlLancado"],drill:"debitos"},
      {id:"devido-pago-receita",title:"Devido × pago por receita",subtitle:"Comparação entre valor devido e realizado.",type:"bar",source:"bi:debitos-receitas",dimension:"idReceitasCreditos",measures:["vlDevido","vlPago"],drill:"debitos-receitas"}
    ]
  },

  "divida": {
    title: "Dívida ativa",
    description: "Estoque, inscrições, recuperação, cobrança, execução e detalhamento por contribuinte.",
    level: "macro-micro",
    kpis: [
      {id:"saldo-divida",label:"Saldo atual",format:"currency",source:"base:encerramento-dividas",field:"valorSaldo"},
      {id:"inscrito",label:"Valor inscrito",format:"currency",source:"base:encerramento-dividas",field:"valorInscrito"},
      {id:"qtd-dividas",label:"Dívidas",format:"number",source:"bi:dividas",field:"id"},
      {id:"executadas",label:"Em execução",format:"number",source:"bi:dividas",field:"sitExecucao"},
      {id:"protestadas",label:"Protestadas",format:"number",source:"bi:dividas",field:"protesto"},
      {id:"cda",label:"Com CDA emitida",format:"number",source:"bi:dividas",field:"possuiCdaEmitida"}
    ],
    charts: [
      {id:"estoque-divida",title:"Estoque da dívida ativa",subtitle:"Saldo no encerramento de cada mês.",type:"line",source:"base:encerramento-dividas",dimension:"mesEncerramento",measures:["valorSaldo"],drill:"dividas"},
      {id:"inscricoes-mes",title:"Novas inscrições",subtitle:"Valor inscrito por mês.",type:"line",source:"base:encerramento-dividas",dimension:"dataInscricao:mês",measures:["valorInscrito"],drill:"dividas"},
      {id:"composicao-divida",title:"Composição do estoque",subtitle:"Tributo, correção, juros e multa.",type:"bar",source:"base:encerramento-dividas",dimension:"mesEncerramento",measures:["valorSaldo","valorCorrecao","valorJuros","valorMulta"],drill:"dividas"},
      {id:"status-divida",title:"Situação da dívida",subtitle:"Quantidade por status.",type:"doughnut",source:"bi:dividas",dimension:"statusDivida",measures:["count"],drill:"dividas"},
      {id:"aging-divida",title:"Idade da dívida",subtitle:"Saldo por ano de inscrição/origem.",type:"bar",source:"base:encerramento-dividas",dimension:"anoDivida",measures:["valorSaldo"],drill:"dividas"},
      {id:"divida-credito",title:"Dívida por crédito",subtitle:"Saldo por crédito tributário.",type:"bar",source:"base:encerramento-dividas",dimension:"idCreditoTributario",measures:["valorSaldo"],drill:"dividas"},
      {id:"cobranca",title:"Execução, protesto e penhora",subtitle:"Ações de cobrança incidentes sobre a carteira.",type:"bar",source:"bi:dividas",dimension:"ação",measures:["count"],drill:"dividas"},
      {id:"recuperacao",title:"Recuperação da dívida",subtitle:"Pagamentos associados a dívida ativa.",type:"line",source:"bi:pagamentos-detalhados",dimension:"pagamento.dataPagamento:mês",filter:"idDivida",measures:["valorPagoLancado"],drill:"pagamentos-detalhados"},
      {id:"saldo-receitas-divida",title:"Saldo por receita da dívida",subtitle:"Inscrito e saldo por receita vinculada.",type:"bar",source:"bi:dividas-receitas",dimension:"idCreditosTributariosRec",measures:["vlInscritoCredito","vlSaldo"],drill:"dividas-receitas"},
      {id:"cancelamentos",title:"Cancelamentos e prescrições",subtitle:"Evolução das saídas administrativas da carteira.",type:"line",source:"base:dividas",dimension:"dataCancelamento/dataPrescricao:mês",measures:["count"],drill:"dividas"},
      {id:"top-devedores",title:"Maiores devedores",subtitle:"Ranking de contribuintes por saldo da dívida.",type:"bar",source:"base:dividas",dimension:"contribuinte",measures:["saldoCalculado"],drill:"dividas"}
    ]
  },

  "parcelamentos": {
    title: "Parcelamentos",
    description: "Acordos, entradas, parcelas, inadimplência, cancelamentos e origem dos débitos.",
    level: "macro-micro",
    kpis: [
      {id:"qtd-parcelamentos",label:"Parcelamentos",format:"number",source:"bi:parcelamentos",field:"id"},
      {id:"ativos",label:"Ativos",format:"number",source:"bi:parcelamentos",field:"situacao"},
      {id:"parcelas-vencidas",label:"Parcelas vencidas",format:"number",source:"bi:parcelamentos",field:"qtdParcelasVencidas"},
      {id:"entradas",label:"Valor de entrada",format:"currency",source:"bi:parcelamentos",field:"vlEntrada"},
      {id:"qtd-parcelas",label:"Parcelas contratadas",format:"number",source:"bi:parcelamentos",field:"qtdParcela"},
      {id:"cancelados",label:"Cancelados",format:"number",source:"bi:parcelamentos",field:"dtCancelamento"}
    ],
    charts: [
      {id:"parcelamentos-mes",title:"Novos parcelamentos",subtitle:"Quantidade de acordos por mês.",type:"line",source:"bi:parcelamentos",dimension:"dtParcelamento:mês",measures:["count"],drill:"parcelamentos"},
      {id:"situacao-parcelamentos",title:"Situação dos acordos",subtitle:"Ativos, quitados, cancelados e demais situações.",type:"doughnut",source:"bi:parcelamentos",dimension:"situacao",measures:["count"],drill:"parcelamentos"},
      {id:"faixa-parcelas",title:"Quantidade de parcelas",subtitle:"Distribuição por faixas de prazo.",type:"bar",source:"bi:parcelamentos",dimension:"qtdParcela:faixa",measures:["count"],drill:"parcelamentos"},
      {id:"vencidas-parcelamento",title:"Inadimplência dos parcelamentos",subtitle:"Acordos por quantidade de parcelas vencidas.",type:"bar",source:"bi:parcelamentos",dimension:"qtdParcelasVencidas:faixa",measures:["count"],drill:"parcelamentos"},
      {id:"parcelas-situacao",title:"Situação das parcelas",subtitle:"Quantidade e valor das parcelas.",type:"bar",source:"bi:parcelamentos-parcelas",dimension:"situacao",measures:["vlParcela","count"],drill:"parcelamentos-parcelas"},
      {id:"entradas-tipo",title:"Entrada dos acordos",subtitle:"Valor por tipo de entrada.",type:"bar",source:"bi:parcelamentos",dimension:"tipoEntrada",measures:["vlEntrada"],drill:"parcelamentos"},
      {id:"execucao-protesto",title:"Parcelamentos com dívida executada/protestada",subtitle:"Perfil de cobrança dos acordos.",type:"bar",source:"bi:parcelamentos",dimension:"cobrança",measures:["count"],drill:"parcelamentos"},
      {id:"origem-parcelamento",title:"Origem dos parcelamentos",subtitle:"Distribuição por origem/referente.",type:"bar",source:"bi:parcelamentos-referentes",dimension:"tipoReferente",measures:["count"],drill:"parcelamentos-referentes"},
      {id:"cancelamentos-parcelamento",title:"Cancelamentos",subtitle:"Acordos cancelados por mês.",type:"line",source:"bi:parcelamentos",dimension:"dtCancelamento:mês",measures:["count"],drill:"parcelamentos"},
      {id:"pagamentos-parcelas",title:"Recebimento de parcelas",subtitle:"Tributo, correção, juros e multa das parcelas quitadas.",type:"bar",source:"base:parcelamentos-parcelas",dimension:"dtQuitacao:mês",measures:["vlPagoTributo","vlPagoCorrecao","vlPagoJuro","vlPagoMulta"],drill:"parcelamentos-parcelas"}
    ]
  },

  "economicos": {
    title: "Econômicos e ISS",
    description: "Perfil da atividade econômica municipal: cadastros, abertura, encerramento, atividades e localização.",
    level: "macro-micro",
    kpis: [
      {id:"economicos",label:"Cadastros econômicos",format:"number",source:"bi:economicos",field:"id"},
      {id:"ativos-economicos",label:"Ativos",format:"number",source:"bi:economicos",field:"situacao"},
      {id:"novos-economicos",label:"Abertos no período",format:"number",source:"bi:economicos",field:"dtInicioAtiv"},
      {id:"fechados",label:"Encerrados no período",format:"number",source:"bi:economicos",field:"dtFechamento"},
      {id:"atividades",label:"Atividades vinculadas",format:"number",source:"bi:economicos-atividades",field:"id"}
    ],
    charts: [
      {id:"aberturas",title:"Aberturas de econômicos",subtitle:"Novos cadastros por mês.",type:"line",source:"bi:economicos",dimension:"dtInicioAtiv:mês",measures:["count"],drill:"economicos"},
      {id:"fechamentos",title:"Encerramentos",subtitle:"Baixas/fechamentos por mês.",type:"line",source:"bi:economicos",dimension:"dtFechamento:mês",measures:["count"],drill:"economicos"},
      {id:"situacao-economicos",title:"Situação cadastral",subtitle:"Distribuição dos econômicos por situação.",type:"doughnut",source:"bi:economicos",dimension:"situacao",measures:["count"],drill:"economicos"},
      {id:"tipo-economico",title:"Tipo de econômico",subtitle:"Distribuição por tipo/tipo de cadastro.",type:"bar",source:"bi:economicos",dimension:"tipoCadastro",measures:["count"],drill:"economicos"},
      {id:"atividades-top",title:"Principais atividades",subtitle:"Ranking por descrição da atividade.",type:"bar",source:"bi:economicos-atividades",dimension:"descricaoAtividade",measures:["count"],drill:"economicos-atividades"},
      {id:"atividade-principal",title:"Principal × secundária",subtitle:"Composição dos vínculos de atividades.",type:"doughnut",source:"bi:economicos-atividades",dimension:"principal",measures:["count"],drill:"economicos-atividades"},
      {id:"bairro-economicos",title:"Econômicos por bairro",subtitle:"Distribuição territorial dos estabelecimentos.",type:"bar",source:"bi:economicos",dimension:"nomeBairro",measures:["count"],drill:"economicos"},
      {id:"iss-arrecadacao",title:"Arrecadação associada ao cadastro econômico",subtitle:"Pagamentos relacionados a econômicos por mês.",type:"line",source:"bi:pagamentos-detalhados",dimension:"pagamento.dataPagamento:mês",filter:"idEconomico",measures:["valorPagoLancado"],drill:"pagamentos-detalhados"}
    ]
  },

  "imobiliario": {
    title: "Imobiliário e IPTU",
    description: "Estoque imobiliário, territorialização, responsáveis, movimentações e arrecadação vinculada.",
    level: "macro-micro",
    kpis: [
      {id:"imoveis-total",label:"Imóveis",format:"number",source:"bi:imoveis",field:"id"},
      {id:"imoveis-ativos",label:"Ativos",format:"number",source:"bi:imoveis",field:"desativado"},
      {id:"rurais",label:"Rurais",format:"number",source:"bi:imoveis",field:"rural"},
      {id:"responsaveis",label:"Vínculos de responsáveis",format:"number",source:"bi:imoveis-responsaveis",field:"id"},
      {id:"transferencias",label:"Transferências",format:"number",source:"bi:transferencias-imoveis",field:"id"}
    ],
    charts: [
      {id:"bairro-imoveis",title:"Imóveis por bairro",subtitle:"Distribuição territorial do cadastro.",type:"bar",source:"bi:imoveis",dimension:"nomeBairro",measures:["count"],drill:"imoveis"},
      {id:"setor-imoveis",title:"Imóveis por setor",subtitle:"Distribuição por setor cadastral.",type:"bar",source:"bi:imoveis",dimension:"setor",measures:["count"],drill:"imoveis"},
      {id:"rural-urbano",title:"Rural × urbano",subtitle:"Composição da base imobiliária.",type:"doughnut",source:"bi:imoveis",dimension:"rural",measures:["count"],drill:"imoveis"},
      {id:"ativos-inativos-imoveis",title:"Ativos × desativados",subtitle:"Situação dos registros imobiliários.",type:"doughnut",source:"bi:imoveis",dimension:"desativado",measures:["count"],drill:"imoveis"},
      {id:"condominios",title:"Imóveis por condomínio",subtitle:"Maiores concentrações condominiais.",type:"bar",source:"bi:imoveis",dimension:"nomeCondominio",measures:["count"],drill:"imoveis"},
      {id:"loteamentos",title:"Imóveis por loteamento",subtitle:"Distribuição por loteamento.",type:"bar",source:"bi:imoveis",dimension:"nomeLoteamento",measures:["count"],drill:"imoveis"},
      {id:"tipo-imovel",title:"Tipo de imóvel",subtitle:"Classificação detalhada disponível na fonte base.",type:"bar",source:"base:imoveis",dimension:"tipoImovel",measures:["count"],drill:"imoveis"},
      {id:"planta-valores",title:"Valor do m² por região",subtitle:"Planta de valores por bairro/logradouro.",type:"bar",source:"base:planta-valores",dimension:"bairro/logradouro",measures:["vlMetroQuadrado"],drill:"planta-valores"},
      {id:"iptu-pagamentos",title:"Arrecadação imobiliária",subtitle:"Pagamentos vinculados a imóveis por mês.",type:"line",source:"bi:pagamentos-detalhados",dimension:"pagamento.dataPagamento:mês",filter:"idImovel",measures:["valorPagoLancado"],drill:"pagamentos-detalhados"},
      {id:"responsabilidade",title:"Percentual de titularidade",subtitle:"Distribuição dos vínculos de responsáveis.",type:"bar",source:"bi:imoveis-responsaveis",dimension:"percentual:faixa",measures:["count"],drill:"imoveis-responsaveis"}
    ]
  },

  "itbi": {
    title: "Transferências e ITBI",
    description: "Solicitações, transferências, valores declarados, financiamento e imposto.",
    level: "macro-micro",
    kpis: [
      {id:"solicitacoes",label:"Solicitações",format:"number",source:"bi:solicitacoes-transferencias-imoveis",field:"id"},
      {id:"transferencias-itbi",label:"Transferências",format:"number",source:"bi:transferencias-imoveis",field:"id"},
      {id:"itbi",label:"ITBI apurado",format:"currency",source:"bi:solicitacoes-transferencias-imoveis-itens",field:"valorITBI"},
      {id:"declarado",label:"Valor declarado",format:"currency",source:"bi:solicitacoes-transferencias-imoveis-itens",field:"valorDeclarado"},
      {id:"financiado",label:"Valor financiado",format:"currency",source:"bi:solicitacoes-transferencias-imoveis-itens",field:"valorFinanciado"}
    ],
    charts: [
      {id:"solicitacoes-mes",title:"Solicitações por mês",subtitle:"Volume de solicitações de transferência.",type:"line",source:"bi:solicitacoes-transferencias-imoveis",dimension:"dataHoraSolicitacao:mês",measures:["count"],drill:"solicitacoes-transferencias-imoveis"},
      {id:"transferencias-mes",title:"Transferências concluídas",subtitle:"Evolução das transferências.",type:"line",source:"bi:transferencias-imoveis",dimension:"dataHoraTransferencia:mês",measures:["count"],drill:"transferencias-imoveis"},
      {id:"situacao-solicitacoes",title:"Situação das solicitações",subtitle:"Distribuição do fluxo de atendimento.",type:"doughnut",source:"bi:solicitacoes-transferencias-imoveis",dimension:"situacao",measures:["count"],drill:"solicitacoes-transferencias-imoveis"},
      {id:"situacao-transferencias",title:"Situação das transferências",subtitle:"Status do processo de transferência.",type:"doughnut",source:"bi:transferencias-imoveis",dimension:"situacao",measures:["count"],drill:"transferencias-imoveis"},
      {id:"certidao-itbi",title:"Status da certidão de ITBI",subtitle:"Certidões por situação.",type:"bar",source:"bi:transferencias-imoveis",dimension:"statusCertidaoITBI",measures:["count"],drill:"transferencias-imoveis"},
      {id:"declarado-ajustado",title:"Declarado × ajustado",subtitle:"Comparação dos valores declarados e ajustados.",type:"bar",source:"bi:solicitacoes-transferencias-imoveis-itens",dimension:"competência",measures:["valorDeclarado","valorDeclaradoAjustado"],drill:"solicitacoes-transferencias-imoveis-itens"},
      {id:"itbi-ajustado",title:"ITBI original × ajustado",subtitle:"Comparação do imposto calculado.",type:"bar",source:"bi:solicitacoes-transferencias-imoveis-itens",dimension:"competência",measures:["valorITBI","valorITBIAjustado"],drill:"solicitacoes-transferencias-imoveis-itens"},
      {id:"financiamento",title:"Financiamento nas operações",subtitle:"Valor financiado e à vista.",type:"bar",source:"bi:solicitacoes-transferencias-imoveis-itens",dimension:"competência",measures:["valorFinanciado","valorAvista"],drill:"solicitacoes-transferencias-imoveis-itens"},
      {id:"tipo-cobranca",title:"Tipo de cobrança",subtitle:"Distribuição das transferências por cobrança.",type:"bar",source:"bi:transferencias-imoveis",dimension:"tipoCobranca",measures:["count"],drill:"transferencias-imoveis"},
      {id:"compradores",title:"Compradores e participação vendida",subtitle:"Detalhamento dos compradores e percentual vendido.",type:"bar",source:"bi:transferencias-imoveis-compra",dimension:"comprador",measures:["percVendido"],drill:"transferencias-imoveis-compra"}
    ]
  },

  "contribuintes": {
    title: "Contribuintes",
    description: "Perfil cadastral, distribuição territorial, contatos e características empresariais.",
    level: "macro-micro",
    kpis: [
      {id:"contribuintes-total",label:"Contribuintes",format:"number",source:"bi:contribuintes",field:"id"},
      {id:"pf",label:"Pessoas físicas",format:"number",source:"bi:contribuintes",field:"tipoPessoa"},
      {id:"pj",label:"Pessoas jurídicas",format:"number",source:"bi:contribuintes",field:"tipoPessoa"},
      {id:"simples",label:"Optantes do Simples",format:"number",source:"bi:contribuintes",field:"optanteSimples"},
      {id:"inativos",label:"Desativados",format:"number",source:"bi:contribuintes",field:"desativado"}
    ],
    charts: [
      {id:"tipo-pessoa",title:"Pessoa física × jurídica",subtitle:"Composição do cadastro.",type:"doughnut",source:"bi:contribuintes",dimension:"tipoPessoa",measures:["count"],drill:"contribuintes"},
      {id:"optante-simples",title:"Optantes do Simples",subtitle:"Distribuição da opção pelo Simples Nacional.",type:"doughnut",source:"bi:contribuintes",dimension:"optanteSimples",measures:["count"],drill:"contribuintes"},
      {id:"porte-empresa",title:"Porte das empresas",subtitle:"Distribuição das pessoas jurídicas por porte.",type:"bar",source:"bi:contribuintes",dimension:"porteEmpresa",measures:["count"],drill:"contribuintes"},
      {id:"bairro-contribuintes",title:"Contribuintes por bairro",subtitle:"Distribuição territorial.",type:"bar",source:"bi:contribuintes",dimension:"nomeBairro",measures:["count"],drill:"contribuintes"},
      {id:"cidade-contribuintes",title:"Contribuintes por cidade",subtitle:"Cadastros locais e de outros municípios.",type:"bar",source:"bi:contribuintes",dimension:"nomeCidade",measures:["count"],drill:"contribuintes"},
      {id:"completude-contato",title:"Completude de contato",subtitle:"Percentual com e-mail, telefone e celular informados.",type:"bar",source:"bi:contribuintes",dimension:"campo",measures:["percentualPreenchido"],drill:"contribuintes"},
      {id:"situacao-cadastro",title:"Ativos × desativados",subtitle:"Situação dos cadastros.",type:"doughnut",source:"bi:contribuintes",dimension:"desativado",measures:["count"],drill:"contribuintes"},
      {id:"atualizacoes",title:"Atualizações cadastrais",subtitle:"Operações de integração ao longo do tempo.",type:"line",source:"bi:contribuintes",dimension:"dhOperacao:mês",measures:["count"],drill:"contribuintes"}
    ]
  },

  "encerramento": {
    title: "Encerramento mensal",
    description: "Fotografia histórica do estoque de lançamentos e dívida no fechamento de cada competência.",
    level: "macro-micro",
    kpis: [
      {id:"saldo-lancamentos",label:"Saldo de lançamentos",format:"currency",source:"base:encerramento-lancamentos",field:"valorSaldo"},
      {id:"saldo-dividas",label:"Saldo de dívidas",format:"currency",source:"base:encerramento-dividas",field:"valorSaldo"},
      {id:"acrescimos-lancamentos",label:"Acréscimos lançamentos",format:"currency",source:"base:encerramento-lancamentos",field:"valorCorrecao+valorJuros+valorMulta"},
      {id:"acrescimos-dividas",label:"Acréscimos dívida",format:"currency",source:"base:encerramento-dividas",field:"valorCorrecao+valorJuros+valorMulta"}
    ],
    charts: [
      {id:"saldo-lancamentos-mes",title:"Saldo dos lançamentos",subtitle:"Evolução mensal do saldo em aberto.",type:"line",source:"base:encerramento-lancamentos",dimension:"mesEncerramento",measures:["valorSaldo"],drill:"encerramento-lancamentos"},
      {id:"saldo-divida-mes",title:"Saldo da dívida",subtitle:"Evolução mensal do estoque inscrito.",type:"line",source:"base:encerramento-dividas",dimension:"mesEncerramento",measures:["valorSaldo"],drill:"encerramento-dividas"},
      {id:"lancado-saldo",title:"Lançado × saldo",subtitle:"Conversão do valor lançado em saldo remanescente.",type:"bar",source:"base:encerramento-lancamentos",dimension:"mesEncerramento",measures:["valorLancado","valorSaldo"],drill:"encerramento-lancamentos"},
      {id:"inscrito-saldo",title:"Inscrito × saldo da dívida",subtitle:"Comparação da inscrição com o saldo remanescente.",type:"bar",source:"base:encerramento-dividas",dimension:"mesEncerramento",measures:["valorInscrito","valorSaldo"],drill:"encerramento-dividas"},
      {id:"acrescimos-lancamentos-mes",title:"Acréscimos dos lançamentos",subtitle:"Correção, juros e multa acumulados.",type:"line",source:"base:encerramento-lancamentos",dimension:"mesEncerramento",measures:["valorCorrecao","valorJuros","valorMulta"],drill:"encerramento-lancamentos"},
      {id:"acrescimos-divida-mes",title:"Acréscimos da dívida",subtitle:"Correção, juros e multa acumulados.",type:"line",source:"base:encerramento-dividas",dimension:"mesEncerramento",measures:["valorCorrecao","valorJuros","valorMulta"],drill:"encerramento-dividas"},
      {id:"fluxo-acrescimos",title:"Acréscimos gerados no mês",subtitle:"Correção, juros e multa do próprio mês.",type:"bar",source:"base:encerramento-dividas",dimension:"mesEncerramento",measures:["valorCorrecaoMes","valorJurosMes","valorMultaMes"],drill:"encerramento-dividas"}
    ]
  },

  "obras": {
    title: "Obras",
    description: "Visão complementar da fonte base do Tributos para obras, responsáveis e movimentações.",
    level: "macro-micro",
    kpis: [
      {id:"obras-total",label:"Obras",format:"number",source:"base:obras",field:"id"},
      {id:"obras-situacao",label:"Em andamento",format:"number",source:"base:obras",field:"situacao"},
      {id:"medida",label:"Medida total",format:"number",source:"base:obras",field:"medida"},
      {id:"liberadas",label:"Liberadas no período",format:"number",source:"base:obras",field:"dataLiberacao"}
    ],
    charts: [
      {id:"obras-situacao-grafico",title:"Obras por situação",subtitle:"Distribuição do cadastro de obras.",type:"doughnut",source:"base:obras",dimension:"situacao",measures:["count"],drill:"obras"},
      {id:"obras-entrada",title:"Entrada de obras",subtitle:"Novos processos por mês.",type:"line",source:"base:obras",dimension:"dataEntrada:mês",measures:["count"],drill:"obras"},
      {id:"obras-liberacao",title:"Liberações",subtitle:"Obras liberadas por mês.",type:"line",source:"base:obras",dimension:"dataLiberacao:mês",measures:["count"],drill:"obras"},
      {id:"obras-medida",title:"Medida por situação",subtitle:"Soma da medida cadastrada por situação.",type:"bar",source:"base:obras",dimension:"situacao",measures:["medida"],drill:"obras"},
      {id:"obras-responsaveis",title:"Responsáveis por execução",subtitle:"Ranking de responsáveis técnicos.",type:"bar",source:"base:obras-responsaveis",dimension:"responsável",measures:["count"],drill:"obras-responsaveis"}
    ]
  },

  "qualidade": {
    title: "Qualidade e auditoria",
    description: "Indicadores de completude, consistência e atualização dos cadastros que sustentam o BI.",
    level: "micro",
    kpis: [
      {id:"sem-documento",label:"Sem CPF/CNPJ",format:"number",source:"bi:contribuintes",field:"cpf/cnpj"},
      {id:"sem-contato",label:"Sem contato",format:"number",source:"bi:contribuintes",field:"email/telefone/celular"},
      {id:"imoveis-sem-endereco",label:"Imóveis sem endereço completo",format:"number",source:"bi:imoveis",field:"nomeLogradouro/cep"},
      {id:"economicos-sem-atividade",label:"Econômicos sem atividade",format:"number",source:"bi:economicos-atividades",field:"idEconomico"}
    ],
    charts: [
      {id:"completude-contribuintes",title:"Completude dos contribuintes",subtitle:"Documento, endereço, e-mail e telefone.",type:"bar",source:"bi:contribuintes",dimension:"campo",measures:["percentualPreenchido"],drill:"contribuintes"},
      {id:"completude-imoveis",title:"Completude dos imóveis",subtitle:"Inscrição, endereço, responsável, matrícula e CIB.",type:"bar",source:"bi:imoveis",dimension:"campo",measures:["percentualPreenchido"],drill:"imoveis"},
      {id:"completude-economicos",title:"Completude dos econômicos",subtitle:"Contribuinte, endereço, situação e atividade.",type:"bar",source:"bi:economicos",dimension:"campo",measures:["percentualPreenchido"],drill:"economicos"},
      {id:"operacoes-integracao",title:"Operações de integração",subtitle:"Inclusões/alterações ao longo do tempo.",type:"line",source:"bi:contribuintes|imoveis|economicos",dimension:"dhOperacao:mês",measures:["count"],drill:"auditoria"},
      {id:"registros-desativados",title:"Cadastros desativados",subtitle:"Comparativo de desativação por cadastro.",type:"bar",source:"bi:contribuintes|imoveis",dimension:"cadastro",measures:["count"],drill:"auditoria"},
      {id:"campos-adicionais",title:"Uso de campos adicionais",subtitle:"Cobertura das informações complementares.",type:"bar",source:"bi:imoveis-campos-adicionais",dimension:"campoAdicional",measures:["count"],drill:"imoveis-campos-adicionais"}
    ]
  }
};


Object.assign(window.BI_DASHBOARDS, {
  "receitas-creditos": {
    title: "Receitas e créditos tributários",
    description: "Estrutura das receitas, créditos tributários e vínculos com a arrecadação efetivamente realizada.",
    level: "macro-micro",
    kpis: [
      {id:"receitas-total",label:"Receitas cadastradas",format:"number",source:"bi:receitas",field:"id"},
      {id:"creditos-total",label:"Créditos tributários",format:"number",source:"base:creditos-tributarios",field:"id"},
      {id:"vinculos-total",label:"Vínculos crédito × receita",format:"number",source:"base:creditos-tributarios-receitas",field:"id"},
      {id:"arrecadado-creditos",label:"Arrecadação vinculada",format:"currency",source:"bi:pagamentos-detalhados",field:"valorPagoLancado"}
    ],
    charts: [
      {id:"receitas-classificacao",title:"Receitas por classificação",subtitle:"Distribuição pela classificação informada no cadastro de receitas.",type:"bar",source:"bi:receitas",dimension:"classificacao",measures:["count"],drill:"receitas"},
      {id:"creditos-situacao",title:"Créditos ativos × desativados",subtitle:"Situação real do cadastro conforme o campo desativado.",type:"doughnut",source:"base:creditos-tributarios",dimension:"desativado.descricao",measures:["count"],drill:"creditos-tributarios"},
      {id:"creditos-tipo",title:"Créditos por tipo de cadastro",subtitle:"Distribuição conforme tipoCadastro.descricao e abreviatura.",type:"bar",source:"base:creditos-tributarios",dimension:"tipoCadastro.descricao",measures:["count"],drill:"creditos-tributarios"},
      {id:"vinculos-receita",title:"Vínculos por receita",subtitle:"Quantidade de relações entre crédito tributário e receita.",type:"bar",source:"base:creditos-tributarios-receitas",dimension:"receita.descricao",measures:["count"],drill:"creditos-tributarios-receitas"},
      {id:"arrecadacao-credito",title:"Arrecadação por crédito tributário",subtitle:"Ranking financeiro dos créditos no período.",type:"bar",source:"bi:pagamentos-detalhados",dimension:"creditoTributario.descricao",measures:["valorPagoLancado"],drill:"pagamentos-detalhados"},
      {id:"arrecadacao-receita",title:"Arrecadação por receita",subtitle:"Participação das receitas no valor efetivamente pago.",type:"bar",source:"bi:pagamentos-detalhados",dimension:"receita.descricao",measures:["valorPagoLancado"],drill:"pagamentos-detalhados"}
    ]
  },

  "guias": {
    title: "Guias e documentos",
    description: "Emissão, baixas, vencimentos, registro bancário e composição financeira das guias unificadas.",
    level: "macro-micro",
    kpis: [
      {id:"guias-total",label:"Guias emitidas",format:"number",source:"base:guias-unificadas",field:"id"},
      {id:"guias-valor",label:"Valor total das guias",format:"currency",source:"base:guias-unificadas",field:"vlTotalGuiaUnificada"},
      {id:"guias-pagas",label:"Guias com baixa",format:"number",source:"base:guias-unificadas",field:"nroBaixa"},
      {id:"guias-vencidas",label:"Guias vencidas sem baixa",format:"number",source:"base:guias-unificadas",field:"dtVencimento"}
    ],
    charts: [
      {id:"guias-emissao",title:"Guias emitidas por mês",subtitle:"Evolução mensal por dtEmissao.",type:"line",source:"base:guias-unificadas",dimension:"dtEmissao:mês",measures:["count"],drill:"guias-unificadas"},
      {id:"guias-situacao",title:"Situação operacional das guias",subtitle:"Com baixa, vencidas sem baixa e em aberto.",type:"doughnut",source:"base:guias-unificadas",dimension:"nroBaixa/dtVencimento",measures:["count"],drill:"guias-unificadas"},
      {id:"guias-boleto",title:"Registro bancário",subtitle:"Guias com e sem boleto registrado.",type:"doughnut",source:"base:guias-unificadas",dimension:"boletoRegistrado",measures:["count"],drill:"guias-unificadas"},
      {id:"guias-composicao",title:"Composição financeira das guias",subtitle:"Tributo, correção, juros, multa e taxa de expediente.",type:"bar",source:"base:guias-unificadas",dimension:"componente",measures:["vlTributo","vlTotalCorrecao","vlTotalJuros","vlTotalMulta","vlTaxaExpediente"],drill:"guias-unificadas"},
      {id:"guias-vencimento",title:"Vencimentos por mês",subtitle:"Distribuição mensal por dtVencimento.",type:"line",source:"base:guias-unificadas",dimension:"dtVencimento:mês",measures:["count"],drill:"guias-unificadas"}
    ]
  },

  "indexadores": {
    title: "Indexadores e atualização monetária",
    description: "Indexadores cadastrados, condição corrente e histórico real dos valores de atualização.",
    level: "macro-micro",
    kpis: [
      {id:"indexadores-total",label:"Indexadores",format:"number",source:"bi:indexadores",field:"id"},
      {id:"indexadores-ativos",label:"Indexadores correntes",format:"number",source:"bi:indexadores",field:"corrente"},
      {id:"valores-indexadores",label:"Valores históricos",format:"number",source:"bi:indexadores-valores",field:"id"},
      {id:"valores-periodo",label:"Valores no período",format:"number",source:"bi:indexadores-valores",field:"dtIdx"}
    ],
    charts: [
      {id:"indexadores-tipo",title:"Indexadores cadastrados",subtitle:"Quantidade de registros por nome/sigla.",type:"bar",source:"bi:indexadores",dimension:"nome",measures:["count"],drill:"indexadores"},
      {id:"indexadores-situacao",title:"Corrente × não corrente",subtitle:"Situação conforme o campo corrente.",type:"doughnut",source:"bi:indexadores",dimension:"corrente",measures:["count"],drill:"indexadores"},
      {id:"valores-por-indexador",title:"Histórico por indexador",subtitle:"Quantidade de valores históricos associados a cada moeda/indexador.",type:"bar",source:"bi:indexadores-valores",dimension:"moeda.nome",measures:["count"],drill:"indexadores-valores"},
      {id:"evolucao-indexadores",title:"Evolução dos indexadores",subtitle:"Séries históricas por dtIdx utilizando vlIdx, sem somar indexadores diferentes.",type:"line",source:"bi:indexadores-valores",dimension:"dtIdx",measures:["vlIdx"],drill:"indexadores-valores"}
    ]
  },

  "territorio": {
    title: "Território cadastral",
    description: "Bairros, distritos, logradouros e distribuição territorial real da base imobiliária.",
    level: "macro-micro",
    kpis: [
      {id:"bairros-total",label:"Bairros",format:"number",source:"base:bairros",field:"id"},
      {id:"distritos-total",label:"Distritos",format:"number",source:"base:distritos",field:"id"},
      {id:"logradouros-total",label:"Logradouros",format:"number",source:"base:logradouros",field:"id"},
      {id:"logradouros-geo",label:"Logradouros com coordenadas",format:"number",source:"base:logradouros",field:"latitude/longitude"},
      {id:"territorio-imoveis",label:"Imóveis no cadastro",format:"number",source:"bi:imoveis",field:"id"}
    ],
    charts: [
      {id:"imoveis-bairro",title:"Imóveis por bairro",subtitle:"Concentração da base imobiliária por nomeBairro.",type:"bar",source:"bi:imoveis",dimension:"nomeBairro",measures:["count"],drill:"imoveis"},
      {id:"imoveis-setor",title:"Imóveis por setor",subtitle:"Distribuição por setor cadastral.",type:"bar",source:"bi:imoveis",dimension:"setor",measures:["count"],drill:"imoveis"},
      {id:"logradouros-tipo",title:"Logradouros por tipo",subtitle:"Composição conforme tipoLogradouroDescricao.",type:"bar",source:"base:logradouros",dimension:"tipoLogradouroDescricao",measures:["count"],drill:"logradouros"},
      {id:"bairros-zona",title:"Bairros urbanos × rurais",subtitle:"Classificação territorial conforme zonaRural.descricao.",type:"doughnut",source:"base:bairros",dimension:"zonaRural.descricao",measures:["count"],drill:"bairros"},
      {id:"logradouros-zona-fiscal",title:"Logradouros por zona fiscal",subtitle:"Distribuição dos logradouros conforme zonaFiscal.",type:"bar",source:"base:logradouros",dimension:"zonaFiscal",measures:["count"],drill:"logradouros"},
      {id:"cadastros-territoriais",title:"Cobertura territorial",subtitle:"Comparativo entre bairros, distritos, logradouros e imóveis.",type:"bar",source:"base:bairros|distritos|logradouros|bi:imoveis",dimension:"cadastro",measures:["count"],drill:"territorio"}
    ]
  }
});

window.BI_MENU = [
  { id:"visao-geral", descricao:"Visão geral", icone:"view-dashboard", rota:"visao-geral", possuiPermissao:true },
  { id:"financeiro", descricao:"Financeiro", icone:"cash-multiple", possuiPermissao:true, submenus:[
    {id:"arrecadacao",descricao:"Arrecadação",rota:"arrecadacao",possuiPermissao:true},
    {id:"debitos",descricao:"Lançamentos e débitos",rota:"debitos",possuiPermissao:true},
    {id:"divida",descricao:"Dívida ativa",rota:"divida",possuiPermissao:true},
    {id:"parcelamentos",descricao:"Parcelamentos",rota:"parcelamentos",possuiPermissao:true},
    {id:"receitas-creditos",descricao:"Receitas e créditos",rota:"receitas-creditos",possuiPermissao:true},
    {id:"guias",descricao:"Guias e documentos",rota:"guias",possuiPermissao:true},
    {id:"indexadores",descricao:"Indexadores",rota:"indexadores",possuiPermissao:true},
    {id:"encerramento",descricao:"Encerramento mensal",rota:"encerramento",possuiPermissao:true}
  ]},
  { id:"cadastros", descricao:"Cadastros", icone:"database", possuiPermissao:true, submenus:[
    {id:"economicos",descricao:"Econômicos e ISS",rota:"economicos",possuiPermissao:true},
    {id:"imobiliario",descricao:"Imobiliário e IPTU",rota:"imobiliario",possuiPermissao:true},
    {id:"contribuintes",descricao:"Contribuintes",rota:"contribuintes",possuiPermissao:true},
    {id:"territorio",descricao:"Território cadastral",rota:"territorio",possuiPermissao:true},
    {id:"obras",descricao:"Obras",rota:"obras",possuiPermissao:true}
  ]},
  { id:"itbi", descricao:"Transferências e ITBI", icone:"home-switch", rota:"itbi", possuiPermissao:true },
  { id:"qualidade", descricao:"Qualidade e auditoria", icone:"shield-check", rota:"qualidade", possuiPermissao:true },
  { id:"administrando", descricao:"Administrando", icone:"cog", possuiPermissao:true, submenus:[
    {id:"usuarios-admin",descricao:"Usuários",rota:"usuarios-admin",possuiPermissao:true}
  ]}
];