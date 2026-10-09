/**
 * BI Vella - backend multi-entidade.
 *
 * Segurança:
 * - Token de serviço e User-Access nunca saem do backend.
 * - O token do usuário autenticado é usado apenas para validar identidade/acessos
 *   e para operações de administração permitidas pela Betha.
 * - Todo acesso a dados valida se o usuário possui vínculo com o database+entity
 *   do tenant solicitado.
 */
const BI_BASE_DEFAULT = "https://tributos.suite.betha.cloud";
const AUTH_BASE = "https://plataforma-autorizacoes.betha.cloud";
const PAGE_MAPPING_BASE = "https://autorizacoes.suite.betha.cloud/dados/v1";
const USERS_BASE = "https://plataforma-usuarios.betha.cloud";
const LICENSES_BASE = "https://plataforma-licencas.betha.cloud";
const OAUTH_AUTHORIZE_URL = "https://plataforma-oauth.betha.cloud/auth/oauth2/authorize";
const OAUTH_TOKEN_URL = "https://plataforma-oauth.betha.cloud/auth/oauth2/token";
const OAUTH_TOKENINFO_URL = "https://oauth.cloud.betha.com.br/auth/oauth2/tokeninfo";
const LOGIN_REDIRECT_DEFAULT = "https://betha-bi-api.ueliton-bueno.workers.dev/api/auth/callback";
const FRONT_URL_DEFAULT = "https://uelitonbueno-creator.github.io/betha/";
const FRONT_SOURCE_BASE = "https://uelitonbueno-creator.github.io/betha";
const SESSION_COOKIE = "__Host-betha_bi_sid";
const LOGIN_SCOPES_DEFAULT = "contas-usuarios.suite,user-accounts.suite,licenses.suite";
const SUPABASE_CACHE_WRITE_URL = "https://mliurxyjznxoafkwwtae.supabase.co/functions/v1/bi-cache-write";

const BI_PAGE_MAPPING = [
  {
    "contexts": [
      "database",
      "entity"
    ],
    "constraints": [
      {
        "id": "BIVisaoGeralPage",
        "description": "Visão geral",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/visao-geral",
            "methods": [
              "GET"
            ]
          },
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/visao-geral/.*",
            "methods": [
              "GET"
            ]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BIArrecadacaoPage",
        "description": "Arrecadação",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/arrecadacao",
            "methods": [
              "GET"
            ]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BIDebitosPage",
        "description": "Lançamentos e débitos",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/debitos",
            "methods": [
              "GET"
            ]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BIDividaPage",
        "description": "Dívida ativa",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/divida",
            "methods": [
              "GET"
            ]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BIParcelamentosPage",
        "description": "Parcelamentos",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/parcelamentos",
            "methods": [
              "GET"
            ]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BIReceitasCreditosPage",
        "description": "Receitas e créditos",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/receitas-creditos",
            "methods": [
              "GET"
            ]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BIGuiasPage",
        "description": "Guias e documentos",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/guias",
            "methods": [
              "GET"
            ]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BIIndexadoresPage",
        "description": "Indexadores",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/indexadores",
            "methods": [
              "GET"
            ]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BIEncerramentoPage",
        "description": "Encerramento mensal",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/encerramento",
            "methods": [
              "GET"
            ]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BIEconomicosPage",
        "description": "Econômicos e ISS",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/economicos",
            "methods": [
              "GET"
            ]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BIImobiliarioPage",
        "description": "Imobiliário e IPTU",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/imobiliario",
            "methods": [
              "GET"
            ]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BIContribuintesPage",
        "description": "Contribuintes",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/contribuintes",
            "methods": [
              "GET"
            ]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BITerritorioPage",
        "description": "Território cadastral",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/territorio",
            "methods": [
              "GET"
            ]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BIObrasPage",
        "description": "Obras",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/obras",
            "methods": [
              "GET"
            ]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BIITBIPage",
        "description": "Transferências e ITBI",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/itbi",
            "methods": [
              "GET"
            ]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BIQualidadePage",
        "description": "Qualidade e auditoria",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/qualidade",
            "methods": [
              "GET"
            ]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BIContabilVisaoGeralPage",
        "description": "Contabilidade · Visão geral",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/contabil-visao-geral",
            "methods": ["GET"]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BIComprasVisaoGeralPage",
        "description": "Compras · Visão geral",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/compras-visao-geral",
            "methods": ["GET"]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BIFolhaVisaoGeralPage",
        "description": "Folha · Visão geral",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/dashboard/folha-visao-geral",
            "methods": ["GET"]
          }
        ],
        "accessControll": []
      },
      {
        "id": "BIUsuariosPage",
        "description": "Usuários e acessos",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/admin/users",
            "methods": [
              "GET"
            ]
          },
          {
            "accessControll": null,
            "urlPattern": "/api/admin/user-search",
            "methods": [
              "GET"
            ]
          },
          {
            "accessControll": "manage",
            "urlPattern": "/api/admin/users",
            "methods": [
              "POST"
            ]
          },
          {
            "accessControll": "manage",
            "urlPattern": "/api/admin/users/.*",
            "methods": [
              "DELETE"
            ]
          }
        ],
        "accessControll": [
          {
            "id": "manage",
            "description": "Adicionar e remover usuários"
          }
        ]
      },
      {
        "id": "BIConfiguracoesPage",
        "description": "Configurações do BI",
        "resources": [
          {
            "accessControll": null,
            "urlPattern": "/api/admin/page-mapping/status",
            "methods": [
              "GET"
            ]
          },
          {
            "accessControll": "manage",
            "urlPattern": "/api/admin/page-mapping",
            "methods": [
              "PUT"
            ]
          }
        ],
        "accessControll": [
          {
            "id": "manage",
            "description": "Publicar configuração de permissões"
          }
        ]
      }
    ],
    "resources": [
      {
        "urlPattern": "/api/health",
        "methods": [
          "GET"
        ]
      },
      {
        "urlPattern": "/api/auth/.*",
        "methods": [
          "GET",
          "POST"
        ]
      },
      {
        "urlPattern": "/api/me/tenants",
        "methods": [
          "GET"
        ]
      }
    ],
    "groups": [
      {
        "id": "geral",
        "description": "Geral",
        "constraints": [
          "BIVisaoGeralPage"
        ]
      },
      {
        "id": "financeiro",
        "description": "Financeiro",
        "constraints": [
          "BIArrecadacaoPage",
          "BIDebitosPage",
          "BIDividaPage",
          "BIParcelamentosPage",
          "BIReceitasCreditosPage",
          "BIGuiasPage",
          "BIIndexadoresPage",
          "BIEncerramentoPage"
        ]
      },
      {
        "id": "cadastros",
        "description": "Cadastros",
        "constraints": [
          "BIEconomicosPage",
          "BIImobiliarioPage",
          "BIContribuintesPage",
          "BITerritorioPage",
          "BIObrasPage"
        ]
      },
      {
        "id": "transferencias",
        "description": "Transferências",
        "constraints": [
          "BIITBIPage"
        ]
      },
      {
        "id": "auditoria",
        "description": "Auditoria",
        "constraints": [
          "BIQualidadePage"
        ]
      },
      {
        "id": "contabilidade",
        "description": "Contabilidade",
        "constraints": ["BIContabilVisaoGeralPage"]
      },
      {
        "id": "compras",
        "description": "Compras",
        "constraints": ["BIComprasVisaoGeralPage"]
      },
      {
        "id": "folha",
        "description": "Folha de pagamento",
        "constraints": ["BIFolhaVisaoGeralPage"]
      },
      {
        "id": "administracao",
        "description": "Configurações",
        "constraints": [
          "BIUsuariosPage",
          "BIConfiguracoesPage"
        ]
      }
    ]
  }
];

const DETAIL_RESOURCES = Object.freeze({
"pagamentos":{"source": "bi", "resource": "pagamentos", "columns": [["id", "ID", ["id"], "text"], ["data", "Pagamento", ["dataPagamento", "dtPagamento", "dtPgto", "dhPagamento"], "date"], ["contribuinte", "Contribuinte", ["pessoa.nome", "contribuinte.nome"], "text"], ["situacao", "Situação", ["situacao"], "text"], ["valor", "Valor pago", ["vlPago", "valorPago"], "currency"]], "datePaths": ["dataPagamento", "dtPagamento", "dtPgto", "dhPagamento"]},
"dividas-receitas":{"source": "bi", "resource": "dividas-receitas", "columns": [["id", "ID", ["id"], "text"], ["divida", "ID dívida", ["idDividas", "idDivida"], "text"], ["credito", "Crédito / receita", ["idCreditosTributariosRec"], "text"], ["inscrito", "Inscrito", ["vlInscritoCredito"], "currency"], ["saldo", "Saldo", ["vlSaldo"], "currency"]], "datePaths": []},
"parcelamentos-referentes":{"source": "bi", "resource": "parcelamentos-referentes", "columns": [["id", "ID", ["id"], "text"], ["parcelamento", "ID parcelamento", ["idParcelamentos"], "text"], ["tipo", "Tipo referente", ["tipoReferente"], "text"], ["referente", "Referente", ["idReferente", "referente"], "text"], ["valor", "Valor", ["vlReferente", "valor"], "currency"]], "datePaths": []},
"encerramento-dividas":{"source": "base", "resource": "encerramento-dividas", "columns": [["id", "ID", ["id"], "text"], ["ano", "Ano encerramento", ["anoEncerramento"], "number"], ["mes", "Mês encerramento", ["mesEncerramento"], "number"], ["divida", "ID dívida", ["idDivida", "divida.id"], "text"], ["credito", "Crédito", ["creditoTributario.descricao", "credito.descricao"], "text"], ["situacao", "Situação", ["situacao", "statusDivida"], "text"], ["inscrito", "Inscrito", ["valorInscrito"], "currency"], ["saldo", "Saldo", ["valorSaldo"], "currency"]], "datePaths": []},
"encerramento-lancamentos":{"source": "base", "resource": "encerramento-lancamentos", "columns": [["id", "ID", ["id"], "text"], ["ano", "Ano encerramento", ["anoEncerramento"], "number"], ["mes", "Mês encerramento", ["mesEncerramento"], "number"], ["credito", "Crédito", ["creditoTributario.descricao", "credito.descricao"], "text"], ["lancado", "Lançado", ["valorLancado"], "currency"], ["pago", "Pago", ["valorPago"], "currency"], ["saldo", "Saldo", ["valorSaldo"], "currency"]], "datePaths": []},
"indexadores":{"source": "bi", "resource": "indexadores", "columns": [["id", "ID", ["id"], "text"], ["nome", "Indexador", ["nome"], "text"], ["sigla", "Sigla", ["sigla"], "text"], ["corrente", "Corrente", ["corrente"], "text"]], "datePaths": []},
"bairros":{"source": "base", "resource": "bairros", "columns": [["id", "ID", ["id"], "text"], ["nome", "Bairro", ["nome"], "text"], ["zonaFiscal", "Zona fiscal", ["zonaFiscal"], "text"]], "datePaths": []},
"distritos":{"source": "base", "resource": "distritos", "columns": [["id", "ID", ["id"], "text"], ["nome", "Distrito", ["nome"], "text"]], "datePaths": []},
"obras-responsaveis":{"source": "base", "resource": "obras-responsaveis", "columns": [["id", "ID", ["id"], "text"], ["obra", "Obra", ["obra.id", "idObra"], "text"], ["responsavel", "Responsável", ["responsavel.nome", "pessoa.nome"], "text"], ["tipo", "Tipo", ["tipoResponsabilidade.descricao", "tipo"], "text"]], "datePaths": []},
"creditos-tributarios-receitas":{"source": "base", "resource": "creditos-tributarios-receitas", "columns": [["id", "ID", ["id"], "text"], ["credito", "Crédito", ["creditoTributario.descricao", "credito.descricao"], "text"], ["receita", "Receita", ["receita.descricao"], "text"], ["tipo", "Tipo", ["tipoReceita.descricao", "tipo"], "text"]], "datePaths": []},
"transferencias-imoveis-compra":{"source": "bi", "resource": "transferencias-imoveis-compra", "columns": [["id", "ID", ["id"], "text"], ["transferencia", "Transferência", ["idTransferencia", "transferencia.id"], "text"], ["comprador", "Comprador", ["comprador.nome", "pessoa.nome"], "text"], ["valor", "Valor da compra", ["vlCompra", "valorCompra", "valor"], "currency"]], "datePaths": []},

  "pagamentos-detalhados-valores":{
    source:"bi",resource:"pagamentos-detalhados-valores",
    datePaths:["dtPagamento","pagamento.dtPagamento"],
    columns:[
      ["id","ID",["id"],"text"],
      ["data","Pagamento",["dtPagamento","pagamento.dtPagamento"],"date"],
      ["receita","Receita",["receita.descricao","receita.abreviatura"],"text"],
      ["tipoPagamento","Tipo pagamento",["pagamento.tipoPagamento.descricao"],"text"],
      ["tipoBaixa","Tipo baixa",["pagamento.tipoBaixa.descricao"],"text"],
      ["tributo","Tributo",["valorPagoLancado"],"currency"],
      ["correcao","Correção",["valorPagoCorrecao"],"currency"],
      ["juros","Juros",["valorPagoJuros"],"currency"],
      ["multa","Multa",["valorPagoMulta"],"currency"]
    ]
  },
  "debitos-receitas":{
    source:"bi",resource:"debitos-receitas",
    columns:[
      ["id","ID",["id"],"text"],
      ["debito","ID débito",["idDebito","debito.id","idDebitos"],"text"],
      ["receita","Receita",["receita.descricao","receita.abreviatura","idReceita"],"text"],
      ["valor","Valor lançado",["vlLancado","valorLancado","valor","vlReceita"],"currency"]
    ]
  },
  "pagamentos-parcelamentos":{
    source:"bi",resource:"pagamentos-parcelamentos",
    datePaths:["dtPagamento","dataPagamento","pagamento.dataPagamento","dtPgto"],
    columns:[
      ["id","ID",["id"],"text"],
      ["parcelamento","ID parcelamento",["idParcelamento","idParcelamentos","parcelamento.id"],"text"],
      ["data","Pagamento",["dtPagamento","dataPagamento","pagamento.dataPagamento","dtPgto"],"date"],
      ["valor","Valor pago",["valorPago","vlPago","valor"],"currency"]
    ]
  },
  "solicitacoes-transferencias-imoveis-movimentacoes":{
    source:"bi",resource:"solicitacoes-transferencias-imoveis-movimentacoes",
    datePaths:["dataHoraMovimentacao","dhMovimentacao","dataMovimentacao","dataHora","dhOperacao"],
    columns:[
      ["id","ID",["id"],"text"],
      ["solicitacao","ID solicitação",["idSolicitacao","solicitacaoTransferencia.id","solicitacao.id"],"text"],
      ["data","Movimentação",["dataHoraMovimentacao","dhMovimentacao","dataMovimentacao","dataHora","dhOperacao"],"date"],
      ["situacao","Situação / etapa",["situacao.descricao","situacao","status","tipoMovimentacao.descricao","tipoMovimentacao"],"text"]
    ]
  },
  "pagamentos-detalhados":{
    source:"bi",resource:"pagamentos-detalhados",
    datePaths:["pagamento.dataPagamento","dataPagamento","dtPagamento"],
    columns:[
      ["id","ID",["id"],"text"],
      ["data","Pagamento",["pagamento.dataPagamento","dataPagamento","dtPagamento"],"date"],
      ["credito","Crédito",["creditoTributario.descricao","creditoTributario.abreviatura"],"text"],
      ["vencimento","Vencimento",["dataVcto"],"date"],
      ["economico","Econômico",["idEconomico"],"text"],
      ["imovel","Imóvel",["idImovel"],"text"]
    ]
  },
  debitos:{
    source:"bi",resource:"debitos",datePaths:["dhDebito"],yearPaths:["ano"],
    columns:[
      ["id","ID",["id"],"text"],
      ["ano","Ano",["ano"],"number"],
      ["contribuinte","Contribuinte",["pessoa.nome","pessoa.nomeFantasia"],"text"],
      ["documento","Documento",["pessoa.cpf","pessoa.cnpj"],"document"],
      ["situacao","Situação",["situacao"],"text"],
      ["lancamento","Lançamento",["dhDebito"],"date"],
      ["vencimento","Vencimento",["dtVcto"],"date"],
      ["pagamento","Pagamento",["dtPgto"],"date"],
      ["valor","Valor lançado",["vlLancado"],"currency"],
      ["desconto","Desconto",["vlDesconto"],"currency"]
    ]
  },
  dividas:{
    source:"bi",resource:"dividas",datePaths:["dtInscricao"],yearPaths:["ano"],
    columns:[
      ["id","ID",["id"],"text"],
      ["ano","Ano",["ano"],"number"],
      ["contribuinte","Contribuinte",["pessoa.nome","pessoa.nomeFantasia"],"text"],
      ["documento","Documento",["pessoa.cpf","pessoa.cnpj"],"document"],
      ["status","Status",["statusDivida","situacao"],"text"],
      ["inscricao","Inscrição",["dtInscricao"],"date"],
      ["vencimento","Vencimento",["dtVcto"],"date"],
      ["execucao","Execução",["sitExecucao"],"boolean"],
      ["protesto","Protesto",["protesto"],"boolean"],
      ["cda","CDA",["possuiCdaEmitida"],"boolean"]
    ]
  },
  parcelamentos:{
    source:"bi",resource:"parcelamentos",yearPaths:["anoParcelamento"],
    columns:[
      ["id","ID",["id"],"text"],
      ["numero","Parcelamento",["nroParcelamento"],"text"],
      ["contribuinte","Contribuinte",["contribuinte.nome","contribuinte.nomeFantasia"],"text"],
      ["documento","Documento",["contribuinte.cpfCnpj"],"document"],
      ["data","Data",["dtParcelamento"],"date"],
      ["situacao","Situação",["situacao.descricao","situacao"],"text"],
      ["parcelas","Parcelas",["qtdParcela"],"number"],
      ["vencidas","Vencidas",["qtdParcelasVencidas"],"number"],
      ["entrada","Entrada",["vlEntrada"],"currency"]
    ]
  },
  "parcelamentos-parcelas":{
    source:"bi",resource:"parcelamentos-parcelas",datePaths:["dtVcto","dtPgto"],
    columns:[
      ["id","ID",["id"],"text"],
      ["parcelamento","ID parcelamento",["idParcelamentos"],"text"],
      ["parcela","Parcela",["parcela"],"number"],
      ["vencimento","Vencimento",["dtVcto"],"date"],
      ["pagamento","Pagamento",["dtPgto"],"date"],
      ["situacao","Situação",["situacao"],"text"],
      ["valor","Valor",["vlParcela"],"currency"],
      ["desconto","Desconto",["vlDesconto"],"currency"]
    ]
  },
  "guias-unificadas":{
    source:"base",resource:"guias-unificadas",datePaths:["dtEmissao"],yearPaths:["ano"],
    columns:[
      ["id","ID",["id"],"text"],
      ["emissao","Emissão",["dtEmissao"],"date"],
      ["vencimento","Vencimento",["dtVencimento"],"date"],
      ["baixa","Baixa",["nroBaixa"],"text"],
      ["boleto","Boleto registrado",["boletoRegistrado"],"boolean"],
      ["tributo","Tributo",["vlTributo"],"currency"],
      ["correcao","Correção",["vlTotalCorrecao"],"currency"],
      ["juros","Juros",["vlTotalJuros"],"currency"],
      ["multa","Multa",["vlTotalMulta"],"currency"],
      ["total","Total",["vlTotalGuiaUnificada"],"currency"]
    ]
  },
  contribuintes:{
    source:"bi",resource:"contribuintes",
    columns:[
      ["id","ID",["id","idPessoas"],"text"],
      ["nome","Nome",["nome","nomeFantasia"],"text"],
      ["documento","Documento",["cpf","cnpj","cpfCnpj"],"document"],
      ["tipo","Tipo",["tipoPessoa","tipoPessoa.descricao"],"text"],
      ["cidade","Cidade",["nomeCidade","municipio.nome"],"text"],
      ["bairro","Bairro",["nomeBairro","bairro.nome"],"text"],
      ["situacao","Situação",["situacao","desativado"],"text"]
    ]
  },
  imoveis:{
    source:"bi",resource:"imoveis",
    columns:[
      ["id","ID",["id","idImovel"],"text"],
      ["codigo","Cadastro",["codOrig","codigo"],"text"],
      ["bairro","Bairro",["nomeBairro"],"text"],
      ["logradouro","Logradouro",["nomeLogradouro"],"text"],
      ["numero","Número",["numero"],"text"],
      ["setor","Setor",["setor"],"text"],
      ["rural","Rural",["rural"],"boolean"],
      ["desativado","Desativado",["desativado"],"boolean"]
    ]
  },
  "imoveis-responsaveis":{
    source:"bi",resource:"imoveis-responsaveis",
    columns:[
      ["id","ID",["id"],"text"],
      ["imovel","ID imóvel",["iImoveis"],"text"],
      ["responsavel","Responsável",["responsavel.nome","responsavel.nomeFantasia"],"text"],
      ["documento","Documento",["responsavel.cpf","responsavel.cnpj"],"document"],
      ["percentual","Percentual",["percentual"],"number"],
      ["inicio","Início titularidade",["inicioTitularidade"],"date"],
      ["fim","Fim titularidade",["fimTitularidade"],"date"]
    ]
  },
  "imoveis-corresponsaveis":{
    source:"bi",resource:"imoveis-corresponsaveis",
    columns:[
      ["id","ID",["id"],"text"],
      ["imovel","ID imóvel",["iImoveis"],"text"],
      ["corresponsavel","Corresponsável",["corresponsavel.nome","corresponsavel.nomeFantasia"],"text"],
      ["documento","Documento",["corresponsavel.cpf","corresponsavel.cnpj"],"document"],
      ["tipo","Tipo",["tipoCorresponsavel.descricao","tipoCorresponsavel.id"],"text"],
      ["inicio","Início titularidade",["inicioTitularidade"],"date"],
      ["fim","Fim titularidade",["fimTitularidade"],"date"]
    ]
  },
  economicos:{
    source:"bi",resource:"economicos",
    columns:[
      ["id","ID",["id","idEconomico"],"text"],
      ["nome","Nome / razão social",["nome","nomeFantasia","pessoa.nome"],"text"],
      ["inicio","Início atividade",["dtInicioAtiv"],"date"],
      ["fechamento","Fechamento",["dtFechamento"],"date"],
      ["situacao","Situação",["situacao","situacao.descricao"],"text"],
      ["bairro","Bairro",["nomeBairro"],"text"],
      ["logradouro","Logradouro",["nomeLogradouro"],"text"]
    ]
  },
  "economicos-atividades":{
    source:"bi",resource:"economicos-atividades",datePaths:["dhOperacao"],
    columns:[
      ["id","ID",["id"],"text"],
      ["economico","ID econômico",["idEconomico"],"text"],
      ["identificador","Identificador",["identificador"],"text"],
      ["atividade","Atividade",["descricaoAtividadeEconomico","descricaoAtividade"],"text"],
      ["tipo","Tipo",["tipo"],"text"],
      ["principal","Principal",["principal"],"text"],
      ["emAtividade","Em atividade",["emAtividade"],"text"],
      ["operacao","Operação",["operacao"],"text"],
      ["dataHora","Data / hora operação",["dhOperacao"],"date"]
    ]
  },
  receitas:{
    source:"bi",resource:"receitas",
    columns:[
      ["id","ID",["id"],"text"],
      ["descricao","Receita",["descricao","nome"],"text"],
      ["abreviatura","Abreviatura",["abreviatura"],"text"],
      ["classificacao","Classificação",["classificacao"],"text"]
    ]
  },
  "creditos-tributarios":{
    source:"base",resource:"creditos-tributarios",
    columns:[
      ["id","ID",["id"],"text"],
      ["descricao","Crédito",["descricao"],"text"],
      ["abreviatura","Abreviatura",["abreviatura"],"text"],
      ["tipo","Tipo",["tipoCadastro.descricao"],"text"],
      ["desativado","Desativado",["desativado.descricao","desativado.valor"],"text"]
    ]
  },
  "indexadores-valores":{
    source:"bi",resource:"indexadores-valores",datePaths:["dtIdx"],
    columns:[
      ["id","ID",["id"],"text"],
      ["indexador","Indexador",["moeda.nome","moeda.sigla"],"text"],
      ["data","Data",["dtIdx"],"date"],
      ["valor","Valor",["vlIdx"],"number"]
    ]
  },
  logradouros:{
    source:"base",resource:"logradouros",
    columns:[
      ["id","ID",["id"],"text"],
      ["nome","Logradouro",["nome"],"text"],
      ["tipo","Tipo",["tipoLogradouroDescricao"],"text"],
      ["zonaFiscal","Zona fiscal",["zonaFiscal"],"text"],
      ["latitude","Latitude",["latitude"],"number"],
      ["longitude","Longitude",["longitude"],"number"]
    ]
  },
  "imoveis-campos-adicionais":{
    source:"bi",resource:"imoveis-campos-adicionais",yearPaths:["ano"],datePaths:["dhCampo"],
    columns:[
      ["id","ID",["id"],"text"],
      ["imovel","ID imóvel",["idImovel"],"text"],
      ["ano","Ano",["ano"],"number"],
      ["campo","Campo adicional",["campoAdicional.titulo"],"text"],
      ["tipo","Tipo",["campoAdicional.tipo"],"text"],
      ["numero","Valor numérico",["vlCampo"],"number"],
      ["texto","Texto",["texto","areaTexto"],"text"],
      ["opcoes","Opções",["opcoes"],"text"],
      ["dataHora","Data / hora",["dhCampo"],"date"]
    ]
  },
  "planta-valores":{
    source:"base",resource:"planta-valores",
    columns:[
      ["id","ID",["id"],"text"],
      ["ano","Ano",["ano"],"number"],
      ["bairro","Bairro",["bairro.nome"],"text"],
      ["logradouro","Logradouro",["logradouro.nome"],"text"],
      ["secao","Seção",["secao.nroSecao"],"number"],
      ["face","Face",["face.descricao","face.abreviatura"],"text"],
      ["indexador","Indexador",["indexador.nome","indexador.sigla"],"text"],
      ["valorMetro","Valor do m²",["vlMetroQuadrado"],"currency"]
    ]
  },
  obras:{
    source:"base",resource:"obras",
    columns:[
      ["id","ID",["id"],"text"],
      ["descricao","Obra",["descricao","nome"],"text"],
      ["situacao","Situação",["situacao","situacao.descricao"],"text"],
      ["inicio","Início",["dataInicio","dtInicio"],"date"],
      ["fim","Fim",["dataFim","dtFim"],"date"]
    ]
  },
  "solicitacoes-transferencias-imoveis":{
    source:"bi",resource:"solicitacoes-transferencias-imoveis",
    columns:[
      ["id","ID",["id"],"text"],
      ["codigo","Código",["codigo"],"number"],
      ["protocolo","Protocolo",["protocolo"],"text"],
      ["dataHora","Solicitação",["dataHoraSolicitacao"],"date"],
      ["situacao","Situação",["situacao"],"text"],
      ["solicitante","Solicitante",["solicitante.nome"],"text"],
      ["documento","Documento solicitante",["solicitante.cpfCnpj"],"document"],
      ["responsavel","Responsável",["responsavel.nome"],"text"],
      ["cartorio","Cartório",["cartorio.nome"],"text"],
      ["motivo","Motivo",["motivo","motivoTransferencia.motivo.descricao"],"text"]
    ]
  },
  "solicitacoes-transferencias-imoveis-itens":{
    source:"bi",resource:"solicitacoes-transferencias-imoveis-itens",
    columns:[
      ["id","ID",["id"],"text"],
      ["solicitacao","ID solicitação",["solicitacaoTransferencia.id"],"text"],
      ["protocolo","Protocolo",["solicitacaoTransferencia.protocolo"],"text"],
      ["imovel","Imóvel",["imovel.codigo","imovel.id"],"text"],
      ["denominacao","Denominação",["denominacao"],"text"],
      ["declarado","Valor declarado",["valorDeclarado"],"currency"],
      ["declaradoAjustado","Declarado ajustado",["valorDeclaradoAjustado"],"currency"],
      ["itbi","ITBI",["valorITBI"],"currency"],
      ["itbiAjustado","ITBI ajustado",["valorITBIAjustado"],"currency"],
      ["financiado","Financiado",["valorFinanciado"],"currency"],
      ["avista","À vista",["valorAvista"],"currency"]
    ]
  },
  "transferencias-imoveis":{
    source:"bi",resource:"transferencias-imoveis",
    columns:[
      ["id","ID",["id"],"text"],
      ["data","Data",["dataTransferencia","dtTransferencia"],"date"],
      ["imovel","Imóvel",["idImovel","imovel.id"],"text"],
      ["situacao","Situação",["situacao","status"],"text"],
      ["valor","Valor",["valor","valorTransacao"],"currency"]
    ]
  }
});

const BI_RESOURCES = Object.freeze({
  contribuintes: "/integracoes-bi/v1/contribuintes",
  imoveis: "/integracoes-bi/v1/imoveis",
  "imoveis-responsaveis": "/integracoes-bi/v1/imoveis/responsaveis",
  "imoveis-corresponsaveis": "/integracoes-bi/v1/imoveis/corresponsaveis",
  "imoveis-campos-adicionais": "/integracoes-bi/v1/imoveis/campos-adicionais",
  economicos: "/integracoes-bi/v1/economicos",
  "economicos-atividades": "/integracoes-bi/v1/economicos/atividades",
  indexadores: "/integracoes-bi/v1/indexadores",
  "indexadores-valores": "/integracoes-bi/v1/indexadores/valores",
  receitas: "/integracoes-bi/v1/receitas",
  debitos: "/integracoes-bi/v1/debitos",
  "debitos-receitas": "/integracoes-bi/v1/debitos/receitas",
  dividas: "/integracoes-bi/v1/dividas",
  "dividas-receitas": "/integracoes-bi/v1/dividas/receitas",
  parcelamentos: "/integracoes-bi/v1/parcelamentos",
  "parcelamentos-referentes": "/integracoes-bi/v1/parcelamentos/referentes",
  "parcelamentos-parcelas": "/integracoes-bi/v1/parcelamentos/parcelas",
  pagamentos: "/integracoes-bi/v1/pagamentos",
  "pagamentos-parcelamentos": "/integracoes-bi/v1/pagamentos/parcelamentos",
  "pagamentos-detalhados": "/integracoes-bi/v1/pagamentos-detalhados",
  "pagamentos-detalhados-valores": "/integracoes-bi/v1/pagamentos-detalhados/valores",
  "solicitacoes-transferencias-imoveis": "/integracoes-bi/v1/solicitacoes-transferencias-imoveis",
  "solicitacoes-transferencias-imoveis-itens": "/integracoes-bi/v1/solicitacoes-transferencias-imoveis/itens",
  "solicitacoes-transferencias-imoveis-movimentacoes": "/integracoes-bi/v1/solicitacoes-transferencias-imoveis/movimentacoes",
  "transferencias-imoveis": "/integracoes-bi/v1/transferencias-imoveis",
  "transferencias-imoveis-compra": "/integracoes-bi/v1/transferencias-imoveis/compra"
});

const BASE_RESOURCES = Object.freeze({
  imoveis: "/dados/v1/imoveis",
  bairros: "/dados/v1/bairros",
  distritos: "/dados/v1/distritos",
  logradouros: "/dados/v1/logradouros",
  loteamentos: "/dados/v1/loteamentos",
  contribuintes: "/dados/v1/contribuintes",
  "planta-valores": "/dados/v1/planta-valores",
  obras: "/dados/v1/obras",
  "obras-responsaveis": "/dados/v1/obras/responsaveis-execucao",
  "creditos-tributarios": "/dados/v1/creditos-tributarios",
  "creditos-tributarios-receitas": "/dados/v1/creditos-tributarios/receitas",
  "guias-unificadas": "/dados/v1/guias-unificadas",
  parcelamentos: "/dados/v1/parcelamentos",
  "parcelamentos-parcelas": "/dados/v1/parcelamentos/parcelas",
  "encerramento-dividas": "/dados/v1/encerramento-mensal/movimentacoes-dividas",
  "encerramento-lancamentos": "/dados/v1/encerramento-mensal/movimentacoes-lanctos",
  dividas: "/dados/v1/dividas",
  "imoveis-transferencias": "/dados/v1/imoveis/transferencias"
});

const API_HOME_GROUPS=Object.freeze([{"id": "cadastros", "label": "Imóveis e contribuintes", "icon": "home-city-outline", "cards": [{"id": "bi:imoveis", "source": "bi", "resource": "imoveis", "label": "Imóveis", "view": "imobiliario"}, {"id": "bi:imoveis-responsaveis", "source": "bi", "resource": "imoveis-responsaveis", "label": "Responsáveis dos imóveis", "view": "imobiliario"}, {"id": "bi:imoveis-corresponsaveis", "source": "bi", "resource": "imoveis-corresponsaveis", "label": "Corresponsáveis dos imóveis", "view": "imobiliario"}, {"id": "bi:imoveis-campos-adicionais", "source": "bi", "resource": "imoveis-campos-adicionais", "label": "Características dos imóveis", "view": "qualidade"}, {"id": "bi:contribuintes", "source": "bi", "resource": "contribuintes", "label": "Contribuintes", "view": "contribuintes"}, {"id": "bi:economicos", "source": "bi", "resource": "economicos", "label": "Cadastros econômicos", "view": "economicos"}, {"id": "bi:economicos-atividades", "source": "bi", "resource": "economicos-atividades", "label": "Atividades econômicas", "view": "economicos"}, {"id": "base:imoveis", "source": "base", "resource": "imoveis", "label": "Imóveis — cadastro complementar", "view": "imobiliario"}, {"id": "base:contribuintes", "source": "base", "resource": "contribuintes", "label": "Contribuintes — cadastro complementar", "view": "contribuintes"}]}, {"id": "arrecadacao", "label": "Arrecadação e receitas", "icon": "cash-multiple", "cards": [{"id": "bi:pagamentos", "source": "bi", "resource": "pagamentos", "label": "Pagamentos", "view": "arrecadacao"}, {"id": "bi:pagamentos-parcelamentos", "source": "bi", "resource": "pagamentos-parcelamentos", "label": "Pagamentos de parcelamentos", "view": "parcelamentos"}, {"id": "bi:pagamentos-detalhados", "source": "bi", "resource": "pagamentos-detalhados", "label": "Pagamentos detalhados", "view": "arrecadacao"}, {"id": "bi:pagamentos-detalhados-valores", "source": "bi", "resource": "pagamentos-detalhados-valores", "label": "Composição dos pagamentos", "view": "arrecadacao"}, {"id": "bi:receitas", "source": "bi", "resource": "receitas", "label": "Receitas", "view": "receitas-creditos"}, {"id": "base:creditos-tributarios", "source": "base", "resource": "creditos-tributarios", "label": "Créditos tributários", "view": "receitas-creditos"}, {"id": "base:creditos-tributarios-receitas", "source": "base", "resource": "creditos-tributarios-receitas", "label": "Receitas dos créditos tributários", "view": "receitas-creditos"}, {"id": "base:guias-unificadas", "source": "base", "resource": "guias-unificadas", "label": "Guias unificadas", "view": "guias"}]}, {"id": "lancamentos", "label": "Lançamentos e débitos", "icon": "file-document-edit-outline", "cards": [{"id": "bi:debitos", "source": "bi", "resource": "debitos", "label": "Débitos", "view": "debitos"}, {"id": "bi:debitos-receitas", "source": "bi", "resource": "debitos-receitas", "label": "Receitas dos débitos", "view": "debitos"}, {"id": "base:encerramento-lancamentos", "source": "base", "resource": "encerramento-lancamentos", "label": "Encerramento dos lançamentos", "view": "encerramento"}]}, {"id": "divida", "label": "Dívida ativa", "icon": "bank-outline", "cards": [{"id": "bi:dividas", "source": "bi", "resource": "dividas", "label": "Dívidas", "view": "divida"}, {"id": "bi:dividas-receitas", "source": "bi", "resource": "dividas-receitas", "label": "Receitas das dívidas", "view": "divida"}, {"id": "base:dividas", "source": "base", "resource": "dividas", "label": "Dívidas — cadastro complementar", "view": "divida"}, {"id": "base:encerramento-dividas", "source": "base", "resource": "encerramento-dividas", "label": "Encerramento da dívida ativa", "view": "divida"}]}, {"id": "parcelamentos", "label": "Parcelamentos", "icon": "calendar-check-outline", "cards": [{"id": "bi:parcelamentos", "source": "bi", "resource": "parcelamentos", "label": "Parcelamentos", "view": "parcelamentos"}, {"id": "bi:parcelamentos-referentes", "source": "bi", "resource": "parcelamentos-referentes", "label": "Referentes dos parcelamentos", "view": "parcelamentos"}, {"id": "bi:parcelamentos-parcelas", "source": "bi", "resource": "parcelamentos-parcelas", "label": "Parcelas dos parcelamentos", "view": "parcelamentos"}, {"id": "base:parcelamentos", "source": "base", "resource": "parcelamentos", "label": "Parcelamentos — cadastro complementar", "view": "parcelamentos"}, {"id": "base:parcelamentos-parcelas", "source": "base", "resource": "parcelamentos-parcelas", "label": "Parcelas — cadastro complementar", "view": "parcelamentos"}]}, {"id": "itbi", "label": "Transferências e ITBI", "icon": "swap-horizontal", "cards": [{"id": "bi:solicitacoes-transferencias-imoveis", "source": "bi", "resource": "solicitacoes-transferencias-imoveis", "label": "Solicitações de transferência", "view": "itbi"}, {"id": "bi:solicitacoes-transferencias-imoveis-itens", "source": "bi", "resource": "solicitacoes-transferencias-imoveis-itens", "label": "Imóveis das solicitações", "view": "itbi"}, {"id": "bi:solicitacoes-transferencias-imoveis-movimentacoes", "source": "bi", "resource": "solicitacoes-transferencias-imoveis-movimentacoes", "label": "Movimentações das solicitações", "view": "itbi"}, {"id": "bi:transferencias-imoveis", "source": "bi", "resource": "transferencias-imoveis", "label": "Transferências de imóveis", "view": "itbi"}, {"id": "bi:transferencias-imoveis-compra", "source": "bi", "resource": "transferencias-imoveis-compra", "label": "Compras vinculadas às transferências", "view": "itbi"}, {"id": "base:imoveis-transferencias", "source": "base", "resource": "imoveis-transferencias", "label": "Transferências — cadastro complementar", "view": "itbi"}]}, {"id": "territorio", "label": "Território e valores imobiliários", "icon": "map-marker-outline", "cards": [{"id": "base:bairros", "source": "base", "resource": "bairros", "label": "Bairros", "view": "territorio"}, {"id": "base:distritos", "source": "base", "resource": "distritos", "label": "Distritos", "view": "territorio"}, {"id": "base:logradouros", "source": "base", "resource": "logradouros", "label": "Ruas e logradouros", "view": "territorio"}, {"id": "base:loteamentos", "source": "base", "resource": "loteamentos", "label": "Loteamentos", "view": "imobiliario"}, {"id": "base:planta-valores", "source": "base", "resource": "planta-valores", "label": "Planta de valores", "view": "imobiliario"}]}, {"id": "obras", "label": "Obras", "icon": "office-building-outline", "cards": [{"id": "base:obras", "source": "base", "resource": "obras", "label": "Obras", "view": "obras"}, {"id": "base:obras-responsaveis", "source": "base", "resource": "obras-responsaveis", "label": "Responsáveis pela execução de obras", "view": "obras"}]}, {"id": "indexadores", "label": "Indexadores", "icon": "currency-usd", "cards": [{"id": "bi:indexadores", "source": "bi", "resource": "indexadores", "label": "Indexadores", "view": "indexadores"}, {"id": "bi:indexadores-valores", "source": "bi", "resource": "indexadores-valores", "label": "Valores dos indexadores", "view": "indexadores"}]}]);
// Source panel engine: explicit paths only. No recursive ID guessing or fabricated zeros.
const PANEL_FIELDS={
 id:['id','codigo','idIntegracao'],nome:['corresponsavel.nome','solicitante.nome','nome','nomeFantasia','descricao','pessoa.nome','contribuinte.nome','responsavel.nome','responsavel.pessoa.nome','requerente.nome'],
 pessoaId:['corresponsavel.id','solicitante.id','responsavel.pessoa.id','idPessoa','idPessoas','idContribuinte','idResponsavel','pessoa.id','contribuinte.id','responsavel.id','responsavel.idPessoa','requerente.id'],
 imovelId:['iImoveis','idImovel','imovel.id','imovelId','referente.idImovel'],economicoId:['iEconomicos','idEconomico','economico.id'],
 bairro:['nomeBairro','bairro.nome','bairro.descricao','endereco.bairro.nome'],bairroId:['iBairros','idBairro','bairro.id','endereco.bairro.id'],
 rua:['nomeLogradouro','logradouro.nome','endereco.logradouro.nome'],ruaId:['iLogradouros','idLogradouro','logradouro.id','endereco.logradouro.id'],
 distritoId:['iDistritos','idDistrito','distrito.id'],cidade:['nomeCidade','municipio.nome','cidade.nome','endereco.municipio.nome'],
 setor:['nroSecao','iSecoes','setor.codigo','setor','nomeSetor'],quadra:['quadra.codigo','quadra','nroQuadra'],lote:['lote.codigo','lote','nroLote'],
 loteamentoId:['idLoteamento','loteamento.id'],plantaId:['idPlantaValores','plantaValores.id','idPlantaValor'],
 tipo:['tipoLogradouroDescricao','tipoCadastro.descricao','tipo.descricao','tipo.valor','tipo','tipoImovel.descricao','tipoImovel','tipoTransferencia.descricao','tipoTransferencia','naturezaTransferencia.descricao','tipoObra.descricao','tipoLogradouro.descricao','tipoIndexador.descricao','tipoCredito.descricao'],
 situacao:['situacao.descricao','situacao.valor','situacao','statusDivida.descricao','statusDivida','status.descricao','status','situacaoDivida','situacaoParcelamento'],
 zona:['tipoZona.descricao','tipoZona','zona.descricao','zona','rural'],tipoPessoa:['tipoPessoa.descricao','tipoPessoa.valor','tipoPessoa','pessoa.tipoPessoa'],
 natureza:['naturezaJuridica.descricao','naturezaJuridica'],atividade:['descricaoAtividadeEconomico','atividade.descricao','atividade.codigo','atividade.cnae','descricaoAtividade','codigoCnae','cnae','descricao'],principal:['principal','atividadePrincipal','tipoAtividade.descricao','tipoAtividade'],
 areaTerreno:['areaTerreno','areaTotalTerreno','metragemTerreno'],areaConstruida:['areaConstruida','areaTotalConstruida','areaObra','area'],
 documento:['cpfCnpj','documento','cpf','cnpj','pessoa.cpfCnpj','pessoa.cpf','pessoa.cnpj'],email:['email','pessoa.email'],telefone:['telefone','celular','pessoa.telefone'],
 caracteristica:['campoAdicional.titulo','campoAdicional.descricao','campoAdicional.nome','nomeCampo','descricaoCampo','caracteristica.descricao','nome'],caracteristicaValor:['vlCampo','texto','areaTexto','valor','valorTexto','valorNumerico','valorCampo'],
 receita:['receita.descricao','receita.abreviatura','creditoTributario.descricao','descricaoReceita','receita.nome'],receitaId:['idReceita','receita.id','iReceitas'],creditoId:['idCreditoTributario','creditoTributario.id','iCreditosTributarios'],classificacao:['classificacao.descricao','classificacao','classificacaoReceita.descricao','codigoClassificacao'],
 ano:['ano','exercicio','anoDivida','anoReferencia','anoVigencia'],valor:['vlReferente','valorDeclarado','vlIdx','vlTotalGuiaUnificada','valorInscrito','vlTotalParcelamento','vlParcelamento','vlTotal','valorTotal','vlParcelado','valorParcelado','vlParcela','valorParcela','vlCompra','valorCompra','valor','vlLancado','valorLancado'],
 lancado:['vlReceita','vlLancado','valorLancado','valorOriginal','vlOriginal','valor'],saldo:['vlSaldoAtualizado','valorSaldo','vlSaldo','saldo','valorAtualizado','vlSaldoAtual','vlSaldoDevedor'],
 pago:['valorPagoParcela','valorPago','vlPago','valorPagoLancado','valorTotalPago','vlTotalPago'],principal:['valorPagoLancado','valorPrincipal','vlPrincipal'],juros:['valorPagoJuros','valorJuros','vlJuros'],multa:['valorPagoMulta','valorMulta','vlMulta'],correcao:['valorPagoCorrecao','valorCorrecao','vlCorrecao'],
 desconto:['valorDesconto','vlDesconto','valorDescontoConcedidoLancado','valorDescontoConcedido','valorDescontoConcedidoJuros','valorDescontoConcedidoMulta'],
 pagamentoId:['idPagamento','pagamento.id','iPagamentos'],parcelamentoId:['idParcelamentos','idParcelamento','parcelamento.id','iParcelamentos'],parcelaId:['idParcela','parcela.id','idParcelamentosParcelas'],
 debitoId:['idDebitos','idDebito','debito.id','iDebitos'],dividaId:['idDividas','idDivida','divida.id','iDividas'],guiaId:['idGuiaUnificada','guiaUnificada.id','idGuia','guia.id'],
 pagamento:['dhPagamento','dtPgto','dataPagamento','dtPagamento','pagamento.dataPagamento','pagamento.dtPagamento'],vencimento:['dtVcto','dataVencimento','dtVencimento','vencimento','parcela.dataVencimento'],
 emissao:['dataEmissao','dtEmissao','dhEmissao'],abertura:['dtInicioAtiv','dataInicioAtividade','dataAbertura','dtInicioAtividade','dtAbertura'],cadastro:['dataCadastro','dtCadastro','dhOperacao'],
 inscricao:['dataInscricao','dtInscricao','dataInscricaoDivida'],formalizacao:['dtParcelamento','dataParcelamento','dataFormalizacao','dtFormalizacao'],encerramento:['dataEncerramento','dtEncerramento','mesEncerramento','dataMovimento','dtMovimento'],motivo:['motivo.descricao','motivo','tipoMovimentacao.descricao','tipoMovimentacao'],
 origem:['tipoReferente.descricao','tipoReferente','tipoReferencia.descricao','tipoReferencia','origem.descricao','origem','tipoDebito.descricao'],modalidade:['modalidade.descricao','modalidade','tipoParcelamento.descricao'],quantidadeParcelas:['qtdParcela','quantidadeParcelas','qtdParcelas','nroParcelas','numeroParcelas'],obrigacoes:['quantidadeDebitos','quantidadeReferentes','qtdReferentes'],
 solicitacaoId:['idSolicitacao','idSolicitacaoTransferencia','solicitacao.id','solicitacaoTransferencia.id'],solicitacao:['dataHoraSolicitacao','dataSolicitacao','dtSolicitacao','dhSolicitacao','dataCadastro'],transferencia:['dataTransferencia','dtTransferencia','data','dhTransferencia'],transferenciaId:['idTransferencia','transferencia.id'],movimentacao:['dataHoraMovimentacao','dataHora','dhOperacao','dataMovimentacao','dhMovimentacao','dtMovimentacao','data'],etapa:['situacao.descricao','situacao','etapa.descricao','etapa','descricaoMovimentacao','tipoMovimentacao.descricao'],
 percentual:['percentual','percentualTransferido','percentualTransmitido','fracaoIdeal'],avaliacao:['valorAvaliacao','vlAvaliacao','valorAvaliado'],adquirente:['adquirente.nome','comprador.nome','nomeAdquirente','pessoa.nome'],transmitente:['transmitente.nome','vendedor.nome','nomeTransmitente'],
 regiao:['regiao.descricao','regiao.nome','zona.descricao','nomeBairro','bairro.nome','nomeLogradouro','logradouro.nome'],metroQuadrado:['vlMetroQuadrado','valorMetroQuadrado','valorM2'],obraId:['idObra','obra.id','iObras'],funcao:['tipoResponsabilidade.descricao','funcao.descricao','funcao','tipoResponsavel.descricao','tipoResponsavel'],
 indexadorId:['moeda.id','idIndexador','indexador.id','iIndexadores'],dataValor:['dtIdx','dataValor','dtValor','dataVigencia','dtVigencia','data','competencia']
};
const PANEL_NUMBER_FIELDS=new Set(['areaTerreno','areaConstruida','valor','lancado','saldo','pago','principal','juros','multa','correcao','desconto','quantidadeParcelas','obrigacoes','percentual','avaliacao','metroQuadrado']);
const PANEL_LABELS={id:'ID',nome:'Nome / responsável',pessoaId:'Pessoa',imovelId:'Imóvel',economicoId:'Econômico',bairro:'Bairro',rua:'Rua',zona:'Zona',situacao:'Situação',tipo:'Tipo',ano:'Exercício',receita:'Receita',valor:'Valor',lancado:'Lançado',saldo:'Saldo',pago:'Pago',principal:'Principal',juros:'Juros',multa:'Multa',correcao:'Correção',desconto:'Desconto',areaTerreno:'Área do terreno (m²)',areaConstruida:'Área construída (m²)',pagamento:'Pagamento',vencimento:'Vencimento',parcelamentoId:'Parcelamento',caracteristica:'Característica',caracteristicaValor:'Valor da característica',metroQuadrado:'Valor por m²',tramitation:'Dias de tramitação',stageDays:'Dias na etapa',paymentRatio:'Percentual pago',indexadorId:'Indexador',dataValor:'Vigência',category:'Categoria',metric:'Medida do gráfico'};
function panelValue(row,paths) {
 for(const path of paths){const v=valueAt(row,path);if(v!==undefined&&v!=null&&v!=='')return v;}
 return null;
}
function panelScalar(v) {
 if(v==null||v===undefined)return null;
 if(typeof v==='object')return v.nome??v.descricao??v.valor??v.codigo??v.id??null;
 return v;
}
function panelNumber(v) {
 if(v==null||v===undefined||v==='')return null;
 if(typeof v==='string'&&v.includes(','))v=v.replace(/\./g,'').replace(',','.');
 const n=Number(v);return Number.isFinite(n)?n:null;
}
function panelDate(v) {
 if(v==null||v==='')return null;
 const s=String(v);const d=new Date(/^\d{4}-\d{2}$/.test(s)?s+'-01':s);
 return Number.isNaN(d.getTime())?null:d;
}
function normalizePersonType(value){
 const raw=String(panelScalar(value)??"").trim();
 if(!raw)return "";
 const plain=raw.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
 if(/^(f|pf)$/.test(plain)||plain.includes("fisic"))return "Pessoa física";
 if(/^(j|pj)$/.test(plain)||plain.includes("jurid"))return "Pessoa jurídica";
 return raw;
}
function closingMonthNumber(value){
 const raw=panelScalar(value);
 if(raw==null||raw==="")return null;
 const numeric=Number(raw);
 if(Number.isInteger(numeric)&&numeric>=1&&numeric<=12)return numeric;
 const plain=String(raw).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
 const names=["janeiro","fevereiro","marco","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
 const index=names.findIndex(name=>plain===name||plain.startsWith(name.slice(0,3)));
 return index>=0?index+1:null;
}
function closingPeriod(row){
 const year=Number(panelScalar(panelValue(row,["anoEncerramento","ano","exercicio"])));
 const month=closingMonthNumber(panelValue(row,[
  "mesEncerramento.valor","mesEncerramento.codigo","mesEncerramento.descricao",
  "mesEncerramento.nome","mesEncerramento","mes","competencia"
 ]));
 if(Number.isFinite(year)&&year>1900&&month){
  return {key:year*100+month,label:String(month).padStart(2,"0")+"/"+year,date:String(year)+"-"+String(month).padStart(2,"0")+"-01"};
 }
 const date=panelDate(panelScalar(panelValue(row,["dataFinalMes","dataEncerramento","dtEncerramento","dataMovimento","dtMovimento","competencia"])));
 if(date)return {key:date.getFullYear()*100+(date.getMonth()+1),label:String(date.getMonth()+1).padStart(2,"0")+"/"+date.getFullYear(),date:date.toISOString().slice(0,10)};
 return null;
}
function normalizePanelRow(raw,source,index=0) {
 const r={_source:source,_key:source+':'+index};
 for(const [f,paths] of Object.entries(PANEL_FIELDS)){
  const v=panelScalar(panelValue(raw,paths));r[f]=PANEL_NUMBER_FIELDS.has(f)?panelNumber(v):v==null?null:String(v);
 }
 if(source.endsWith(':contribuintes'))r.pessoaId=r.id;
 if(source.endsWith(':imoveis'))r.imovelId=r.id;
 if(source==='bi:receitas'){r.receita=r.nome;r.receitaId=r.id;}
 if(source.endsWith(':economicos'))r.economicoId=r.id;
 if(source.endsWith(':obras'))r.obraId=r.id;
 if(source.endsWith(':indexadores'))r.indexadorId=r.id;
 if(/pagamentos|debitos|dividas|parcelamentos/.test(source))r.nome=panelScalar(panelValue(raw,['pessoa.nome','contribuinte.nome','responsavel.nome','nomeContribuinte','nomePessoa','nome']))??(r.pessoaId?'Pessoa '+r.pessoaId:null);
 if(source.startsWith('base:encerramento-')){const period=closingPeriod(raw);r.encerramento=period?.date||null;}
 if(source==='bi:pagamentos-parcelamentos'&&r.pago==null)r.pago=panelNumber(panelValue(raw,['valor','vlParcela']));
 if(source==='base:guias-unificadas'&&r.obrigacoes==null){const list=panelValue(raw,['referentes','debitos','itens']);if(Array.isArray(list))r.obrigacoes=list.length;}
 if(source.endsWith('economicos-atividades'))r.principal=panelScalar(panelValue(raw,['principal','atividadePrincipal','tipoAtividade.descricao','tipoAtividade']));
 else r.principal=panelNumber(panelValue(raw,PANEL_FIELDS.principal));
 if(source.endsWith('pagamentos-detalhados-valores')){
  const components=['principal','juros','multa','correcao'].map(k=>r[k]).filter(v=>v!=null);
  if(components.length)r.pago=components.reduce((a,b)=>a+b,0);
  const discounts=Object.entries(raw).filter(([k,v])=>/^valorDescontoConcedido/.test(k)&&panelNumber(v)!=null).map(([,v])=>panelNumber(v));
  if(discounts.length)r.desconto=discounts.reduce((a,b)=>a+b,0);
 }
 const extras=['juros','multa','correcao'].map(k=>r[k]).filter(v=>v!=null);r.acrescimos=extras.length?extras.reduce((a,b)=>a+b,0):null;
 if(r.zona!=null){const t=String(r.zona).toLowerCase();r.zona=/rural|^true$|^1$|^s$/.test(t)?'Rural':/urban|^false$|^0$|^n$/.test(t)?'Urbana':r.zona;}
 if(r.tipoPessoa!=null)r.tipoPessoa=normalizePersonType(r.tipoPessoa);
 if(r.situacao==null&&Object.hasOwn(raw,'desativado'))r.situacao=raw.desativado===true?'Inativo':'Ativo';
 const status=String(r.situacao||'');r.open=r.situacao!=null?!/pago|quitad|cancel|encerr|liquidad/i.test(status):null;
 const due=panelDate(r.vencimento);r.overdue=due&&r.open!=null?r.open&&due.getTime()<new Date().setHours(0,0,0,0):null;
 r.setorQuadra=[r.setor,r.quadra,r.lote].filter(v=>v!=null).join(' / ')||null;
 r.preenchido=r.caracteristicaValor==null?0:100;r.preenchimento=r.caracteristicaValor==null?'Sem preenchimento':'Preenchido';
 r.contactQuality=(r.documento?'Documento informado':'Documento ausente')+' · '+(r.email||r.telefone?'Com contato':'Sem contato');
 r.documento=r.documento?String(r.documento).replace(/\D/g,''):null;
 if(r.nome==null&&r.pessoaId!=null)r.nome='Pessoa '+r.pessoaId;
 if(source.includes('responsaveis')&&r.nome!=null&&r.pessoaId!=null)r.nome+=' [ID '+r.pessoaId+']';
 const reversed=panelValue(raw,['dataHoraEstorno','dhEstorno','pagamento.dataHoraEstorno','pagamento.dhEstorno']);r._reversed=Boolean(reversed);
 if(r.origem!=null){if(/divida|dívida/i.test(r.origem))r.origem='Dívida ativa';else if(/debito|débito/i.test(r.origem))r.origem='Débito';}
 if(!source.includes('contribuintes'))delete r.contactQuality;
 if(!source.includes('campos-adicionais')){delete r.preenchido;delete r.preenchimento;}
 for(const key of Object.keys(r))if(r[key]==null)delete r[key];
 return r;
}
function panelCard(sourceKey) {return API_PANEL_CATALOG.groups.flatMap(g=>g.cards).find(c=>c.id===sourceKey);}
function panelDependencies(p) {
 return [...new Set([p.input,...(p.joins||[]).map(j=>j.source),p.presence?.source,p.restrict?.source,p.compare,p.events,p.amounts,...(p.totals||[]).map(t=>t.source)].filter(Boolean))];
}
function panelReadAuthorized(auth,key) {const [source,resource]=key.split(':');requireDataPermission(auth,source,resource);}
function panelJoin(rows,target,j) {
 const index=new Map();for(const t of target){const key=t[j.right];if(key!=null&&key!==undefined){const k=String(key);if(index.has(k)){const old=index.get(k);if(j.latest&&old){const a=panelDate(old[j.latest]),b=panelDate(t[j.latest]);if(a&&b&&a.getTime()!==b.getTime())index.set(k,a>b?old:t);else index.set(k,null);}else index.set(k,null);}else index.set(k,t);}}
 let matched=0,missing=0;
 const result=rows.map(r=>{const key=r[j.left];const t=key==null||key===undefined?null:index.get(String(key));if(!t){missing++;return r;}matched++;const out={...r};for(const [f,v]of Object.entries(t))if(!f.startsWith('_'))out[j.prefix+'.'+f]=v;return out;});
 return {rows:result,matched,missing};
}
function panelTransform(p,data) {
 let rows=(data[p.input]||[]).map(r=>({...r}));const notes=[];
 for(const j of p.joins||[]){const joined=panelJoin(rows,data[j.source]||[],j);rows=joined.rows;if(joined.missing)notes.push(joined.missing+' registro(s) sem vínculo único em '+j.source+'.');}
 if(p.presence||p.restrict){
  const j=p.presence||p.restrict;const target=data[j.source]||[];const ids=new Set(target.map(r=>r[j.right]).filter(v=>v!=null).map(String));
  const identifiable=target.length===0||target.some(r=>r[j.right]!=null);
  if(!identifiable)throw new Error('A fonte relacionada não informou a chave '+j.right+'.');
  if(p.restrict)rows=rows.filter(r=>r[j.left]!=null&&ids.has(String(r[j.left])));
  else rows=rows.map(r=>({...r,presence:r[j.left]==null?'Vínculo não informado':ids.has(String(r[j.left]))?'Com vínculo':'Sem vínculo',guidePayment:ids.has(String(r[j.left]))?'Com pagamento vinculado':'Sem pagamento vinculado'}));
 }
 if(p.compare){
  const index=new Map((data[p.compare]||[]).filter(r=>r.id!=null).map(r=>[String(r.id),r]));const original=new Set(rows.map(r=>String(r.id)));
  rows=rows.map(r=>{const other=index.get(String(r.id));let comparable=0,diff=0;for(const f of p.compareFields||[])if(r[f]!=null&&other?.[f]!=null&&other?.[f]!==undefined){comparable++;if(String(r[f])!==String(other[f]))diff++;}return {...r,comparison:!other?'Somente nesta fonte':!comparable?'Campos sem comparação':diff?'Campos divergentes':'Campos coincidentes'};});
  for(const r of data[p.compare]||[])if(r.id!=null&&!original.has(String(r.id)))rows.push({...r,comparison:'Somente na fonte comparada'});
  notes.push('Comparação por ID; diferenças são sinais para conferência, sem alteração dos cadastros.');
 }
 if(p.transform==='links'||p.transform==='duplicates'){
  const map=new Map();for(const r of rows){const key=r[p.entity];if(key==null)continue;const entry=map.get(String(key))||{first:r,values:new Set(),count:0};const link=p.linked?r[p.linked]:r.id;if(link!=null)entry.values.add(String(link));entry.count++;map.set(String(key),entry);}
  rows=[...map.values()].filter(e=>p.transform!=='duplicates'||e.count>1).filter(e=>!p.minLinks||e.values.size>=p.minLinks).map(e=>({...e.first,linkCount:p.transform==='duplicates'?e.count:e.values.size,duplicate:'Documento repetido ('+e.count+' cadastros)',countband:e.values.size===1?'1 vínculo':e.values.size<=5?'2 a 5 vínculos':e.values.size<=10?'6 a 10 vínculos':'Mais de 10 vínculos',_members:[...e.values]}));
 }
 if(p.transform==='agreementAmounts'){const sums=new Map();for(const r of data[p.amounts]||[]){if(r.parcelamentoId==null||r.valor==null)continue;const k=String(r.parcelamentoId);sums.set(k,(sums.get(k)||0)+r.valor);}rows=rows.map(r=>({...r,valor:sums.has(String(r.id))?sums.get(String(r.id)):null}));}
 if(p.transform==='agreementRatio'){
  const grouped=new Map();for(const r of rows){if(r.parcelamentoId==null||r.pago==null)continue;const key=String(r.parcelamentoId);const e=grouped.get(key)||{...r,_paid:0};e._paid+=r.pago;grouped.set(key,e);}
  const amounts=new Map();for(const r of data[p.amounts]||[]){if(r.parcelamentoId==null||r.valor==null)continue;const k=String(r.parcelamentoId);amounts.set(k,(amounts.get(k)||0)+r.valor);}
  rows=[...grouped.values()].map(r=>{const denominator=amounts.get(String(r.parcelamentoId))??r['j.valor'];return {...r,paymentRatio:denominator>0?100*r._paid/denominator:null};});
 }
 if(p.transform==='tramitation'||p.transform==='recent'){
  const key=p.eventKey||'solicitacaoId',dateField=p.eventDate||'movimentacao';const events=new Map();for(const e of data[p.events]||[]){const d=panelDate(e[dateField]);if(e[key]==null||!d)continue;const k=String(e[key]);if(!events.has(k)||d>events.get(k))events.set(k,d);}
  rows=rows.map(r=>{const last=events.get(String(r.id));const start=panelDate(r.solicitacao);return {...r,tramitation:last&&start?Math.max(0,(last-start)/86400000):null,recent:!last?'Sem data de movimentação':(Date.now()-last)/86400000>30?'Há mais de 30 dias':'Nos últimos 30 dias'};});
  if(p.transform==='tramitation')notes.push('Dias entre a solicitação e a última movimentação registrada; inclui processos em andamento.');
 }
 if(p.transform==='stages'){
  const groups=new Map();for(const r of rows){if(r.solicitacaoId==null)continue;const key=String(r.solicitacaoId);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);}
  rows=[];for(const list of groups.values()){list.sort((a,b)=>(panelDate(a.movimentacao)||0)-(panelDate(b.movimentacao)||0));for(let i=0;i<list.length-1;i++){const a=panelDate(list[i].movimentacao),b=panelDate(list[i+1].movimentacao);if(a&&b)rows.push({...list[i],stageDays:Math.max(0,(b-a)/86400000)});}}notes.push('Tempo até a próxima movimentação; etapas ainda abertas não entram na média.');
 }
 if(p.transform==='compareTotals')rows=p.totals.flatMap(t=>(data[t.source]||[]).filter(r=>!r._reversed).map(r=>({...r,_series:t.label,_metric:r[t.measure]})));
 if(p.transform==='missingPeriods'){
  const groups=new Map();for(const r of rows){const d=panelDate(r.dataValor);if(r.indexadorId==null||!d)continue;const k=String(r.indexadorId);const month=d.toISOString().slice(0,7);if(!groups.has(k))groups.set(k,{months:new Set(),first:month,last:month,row:r});const e=groups.get(k);e.months.add(month);e.first=e.first<month?e.first:month;e.last=e.last>month?e.last:month;}
  rows=[];for(const [id,e]of groups){const d=new Date(e.first+'-01'),end=new Date(e.last+'-01');let n=0;while(d<=end&&n++<1200){const m=d.toISOString().slice(0,7);if(!e.months.has(m))rows.push({...e.row,id:null,dataValor:m+'-01',missingPeriod:m+' · Indexador '+id});d.setUTCMonth(d.getUTCMonth()+1);}}notes.push('Lacunas mensais entre a primeira e a última vigência observadas; confira a periodicidade do indexador.');
 }
 return {rows,notes};
}
function panelDimension(r,dim) {
 if(dim==='all')return 'Total';
 if(dim==='dueState'){if(r.open==null||!panelDate(r.vencimento))return null;return !r.open?'Quitada / encerrada':r.overdue?'Vencida':'A vencer';}
 if(dim==='paymentTiming'){const paid=panelDate(r.pagamento),due=panelDate(r['j.vencimento']);return paid&&due?(paid>due?'Em atraso':'No prazo'):null;}
 if(dim==='districtZone')return r['j.nome']&&r.zona?r['j.nome']+' · '+r.zona:null;
 if(dim==='built')return r.areaConstruida!=null?(r['j.nome']||'Loteamento não informado')+' · '+(r.areaConstruida>0?'Com construção':'Sem construção'):null;
 if(dim==='caracteristicaValor')return r.caracteristica==null?null:r.caracteristica+' · '+(r.caracteristicaValor??'Não informado');
 if(dim.startsWith('month:')||dim.startsWith('year:')){const d=panelDate(r[dim.split(':')[1]]);return d?d.toISOString().slice(0,dim.startsWith('year:')?4:7):null;}
 if(dim.startsWith('range:')){const v=panelNumber(r[dim.slice(6)]);if(v==null)return null;const money=!/area|percentual/.test(dim);const bounds=money?[100,1000,10000,100000,1000000]:[0,50,100,250,500,1000,10000];for(let i=0;i<bounds.length;i++)if(v<=bounds[i])return (i?'Acima de '+bounds[i-1]+' até ':'Até ')+bounds[i];return 'Acima de '+bounds.at(-1);}
 if(dim.startsWith('aging:')){const due=panelDate(r[dim.slice(6)]);if(!due||r.open!==true)return null;const days=Math.floor((new Date().setHours(0,0,0,0)-due)/86400000);return days<0?'A vencer':days<=30?'Até 30 dias':days<=90?'31 a 90 dias':days<=180?'91 a 180 dias':days<=365?'181 a 365 dias':'Mais de 365 dias';}
 const v=r[dim];return v==null||v===undefined||v===''?null:String(v);
}
function panelDateInPeriod(r,p,url) {
 const period=url.searchParams.get('periodo')||'todos';if(period==='todos')return true;
 let field=/^(month|year):/.test(p.dim)?p.dim.split(':')[1]:null;
 if(!field&&/pagamentos/.test(p.input))field='pagamento';
 if(!field)return true;
 const d=panelDate(r[field]);if(!d)return true; // Missing dates are counted separately, never presented as dated records.
 const year=Number(url.searchParams.get('exercicio')||new Date().getFullYear());
 if(period==='ano')return d.getUTCFullYear()===year;
 if(period==='mes')return d.getUTCFullYear()===new Date().getFullYear()&&d.getUTCMonth()===new Date().getMonth();
 if(period==='12m'){const from=new Date();from.setMonth(from.getMonth()-11,1);from.setHours(0,0,0,0);return d>=from&&d<=new Date();}
 return true;
}
function evaluateApiPanel(p,sources,url,scopeKey=p.input) {
 const unavailable=panelDependencies(p).filter(k=>!sources[k]||sources[k].error);
 if(unavailable.length)return {status:'unavailable',note:'Fonte indisponível ou sem permissão: '+unavailable.join(', '),labels:[],datasets:[],records:[]};
 const data={};for(const key of panelDependencies(p))data[key]=sources[key].normalized||sources[key].rows.map((r,i)=>normalizePanelRow(r,key,i));
 let transformed;try{transformed=panelTransform(p,data);}catch(e){return {status:'unavailable',note:e.message,labels:[],datasets:[],records:[]};}
 let rows=transformed.rows.filter(r=>!(/pagamentos/.test(p.input)&&r._reversed));
 const panelFilters=[...url.searchParams].filter(([k,v])=>k.startsWith('panel_')&&v);
 if(panelFilters.length&&(p.input!==scopeKey||p.transform==='compareTotals')){
  if(!sources[scopeKey]||sources[scopeKey].error)return {status:'unavailable',note:'Não foi possível verificar os filtros na fonte principal.',labels:[],datasets:[],records:[]};
  const primary=sources[scopeKey].normalized||sources[scopeKey].rows.map((r,i)=>normalizePanelRow(r,scopeKey,i));
  const selected=primary.filter(r=>panelFilters.every(([key,v])=>String(r[key.slice(6)]??'')===v));
  const identities={imoveis:'imovelId',contribuintes:'pessoaId',economicos:'economicoId',receitas:'receitaId',parcelamentos:'parcelamentoId',bairros:'bairroId',distritos:'distritoId',logradouros:'ruaId',loteamentos:'loteamentoId',obras:'obraId',indexadores:'indexadorId',pagamentos:'pagamentoId'};
  const resource=scopeKey.split(':')[1];const joined=(p.joins||[]).find(j=>j.source===scopeKey);
  const linked=joined?.left||identities[resource];
  if(!linked)return {status:'unavailable',note:'Este cruzamento não informou uma chave para aplicar os filtros da fonte principal.',labels:[],datasets:[],records:[]};
  const selectedIds=new Set(selected.map(r=>r.id).filter(v=>v!=null).map(String));
  const linkRows=rows.length?rows:data[p.input]||[];
  if(selected.length&&!selectedIds.size||linkRows.length&&!linkRows.some(r=>r[linked]!=null))return {status:'missing-fields',note:'A fonte relacionada não informou a chave '+linked+' necessária para manter o recorte selecionado.',labels:[],datasets:[],records:[]};
  rows=rows.filter(r=>r[linked]!=null&&selectedIds.has(String(r[linked])));
 }else for(const [key,v]of panelFilters)rows=rows.filter(r=>String(r[key.slice(6)]??'')===v);
 if(p.where&&rows.length&&!rows.some(r=>r[p.where[0]]!=null&&r[p.where[0]]!==undefined))return {status:'missing-fields',note:'A fonte não informou o campo necessário para o recorte: '+p.where[0]+'.',labels:[],datasets:[],records:[],partial:panelDependencies(p).some(k=>!sources[k].complete)};
 if(p.where)rows=rows.filter(r=>r[p.where[0]]===p.where[1]);
 if(p.whereRegex)rows=rows.filter(r=>new RegExp(p.whereRegex[1],'i').test(String(r[p.whereRegex[0]]||'')));
 rows=rows.filter(r=>panelDateInPeriod(r,p,url));
 const partial=panelDependencies(p).some(k=>sources[k].complete!==true);
 const groups=new Map(),records=[];let missing=0;
 const add=(r,category,measure,series='Quantidade')=>{
  if(category==null||measure==null||measure===undefined){missing++;return;}
  const key=String(category);if(!groups.has(key))groups.set(key,new Map());const g=groups.get(key);if(!g.has(series))g.set(series,{sum:0,n:0,ids:new Set(),denom:0});const e=g.get(series);
  if(p.agg==='distinct'){e.ids.add(String(measure));e.sum=e.ids.size;}else e.sum+=Number(measure);e.n++;if(p.denominator)e.denom+=Number(r[p.denominator]||0);
  records.push({...r,category:key,metric:measure,_series:series});
 };
 for(const r of rows){
  if(p.components){for(const field of p.components){if(p.partyMode){add(r,r[field],1,field==='adquirente'?'Adquirente':'Transmitente');}else add(r,PANEL_LABELS[field]||field,r[field],p.dim==='closingBalance'?'Valores':'Valor');}continue;}
  const cat=panelDimension(r,p.dim);const measure=p.transform==='compareTotals'?r._metric:p.measure==='count'?1:r[p.measure];
  add(r,cat,measure,p.transform==='compareTotals'?r._series:p.series?'Indexador / região '+String(r[p.series]??'Não informado'):PANEL_LABELS[p.measure]||'Quantidade');
 }
 const dateDimension=/^(month|year):/.test(p.dim)||p.transform==='missingPeriods';
 const labels=[...groups.keys()].sort((a,b)=>dateDimension?a.localeCompare(b):[...groups.get(b).values()].reduce((s,v)=>s+v.sum,0)-[...groups.get(a).values()].reduce((s,v)=>s+v.sum,0));
 const series=[...new Set([...groups.values()].flatMap(g=>[...g.keys()]))];
 const datasets=series.map(label=>({label,data:labels.map(k=>{const e=groups.get(k).get(label);if(!e)return null;if(p.agg==='average')return e.sum/e.n;if(p.agg==='ratio')return e.denom?100*e.sum/e.denom:null;return e.sum;})}));
 if(['change','indexed'].includes(p.agg))for(const ds of datasets){const raw=labels.map(k=>{const e=groups.get(k).get(ds.label);return e?e.sum/e.n:null;});const base=raw.find(v=>v!=null&&v!==0);ds.data=raw.map((v,i)=>p.agg==='indexed'?v!=null&&base?100*(v/base-1):null:i&&v!=null&&raw[i-1]!=null&&raw[i-1]!==0?100*(v/raw[i-1]-1):null);}
 const percent=['ratio','change','indexed'].includes(p.agg)||['paymentRatio','preenchido'].includes(p.measure);
 const format=percent?'percent':p.input.includes('indexador')?'number':/valor|pago|lancado|saldo|principal|juros|multa|correcao|desconto|acrescimos|metroQuadrado/.test(p.measure)||p.components&&!p.partyMode?'currency':'number';
 const notes=[...(p.definition?[p.definition]:[]),...transformed.notes];if(missing)notes.push(missing+' ocorrência(s) sem dimensão ou medida necessária, excluída(s) do cálculo.');if(partial)notes.push('Carga parcial: os números podem mudar até concluir as fontes.');
 if(!records.length&&rows.length)notes.unshift('Os campos necessários não foram informados neste recorte.');
 if(['change','indexed'].includes(p.agg)&&datasets.every(ds=>ds.data.every(v=>v==null)))notes.push('São necessários valores comparáveis em mais de uma competência.');
 return {nonAdditive:['average','ratio','change','indexed'].includes(p.agg),status:records.length?'ready':rows.length?'missing-fields':'empty',note:notes.join(' '),labels,datasets,format,selectionValues:labels,records,partial,missing};
}
function panelDetailPayload(result,p,url) {
 const category=url.searchParams.get('panelCategory');let rows=result.records.filter(r=>!category||r.category===category);
 const preferred=['id','nome','pessoaId','imovelId','parcelamentoId','economicoId','bairro','rua','zona','situacao','receita','ano','pagamento','vencimento','valor','lancado','saldo','pago','areaTerreno','areaConstruida','caracteristica','caracteristicaValor','indexadorId','dataValor'];
 const fields=[...new Set(['category','metric',...preferred.filter(f=>rows.some(r=>r[f]!=null&&r[f]!==undefined)),...Object.keys(rows[0]||{}).filter(f=>f.includes('.')&&!f.startsWith('_')&&rows.some(r=>r[f]!=null))])];
 const columns=fields.map(key=>({key,label:key.includes('.')?'Vínculo · '+(PANEL_LABELS[key.split('.').at(-1)]||key.split('.').at(-1)):key==='metric'&&['change','indexed'].includes(p.agg)?'Valor de referência':PANEL_LABELS[key]||key,format:key==='metric'?(p.agg==='distinct'?'text':['change','indexed'].includes(p.agg)?'number':result.format):/^(pagamento|vencimento|dataValor)$/.test(key)?'date':PANEL_NUMBER_FIELDS.has(key)?(/area|quantidade|percentual/.test(key)?'number':'currency'):'text'}));
 const safe=rows.map(r=>Object.fromEntries(fields.map(f=>[f,r[f]??null])));
 const search=normalizeGlobalSearch(url.searchParams.get('detailSearch')||'');const value=normalizeGlobalSearch(url.searchParams.get('detailValue')||'');const field=url.searchParams.get('detailField');const dateField=url.searchParams.get('detailDateField');const from=url.searchParams.get('detailFrom'),to=url.searchParams.get('detailTo');
 rows=safe.filter(r=>{if(search&&!Object.values(r).some(v=>normalizeGlobalSearch(v).includes(search)))return false;if(value&&!(field?[r[field]]:Object.values(r)).some(v=>normalizeGlobalSearch(v).includes(value)))return false;if(from||to){const d=panelDate(r[dateField]);if(!d)return false;const day=d.toISOString().slice(0,10);if(from&&day<from||to&&day>to)return false;}return true;});
 const offset=Math.max(0,Number(url.searchParams.get('offset'))||0),limit=Math.min(100,Math.max(1,Number(url.searchParams.get('limit'))||25));
 return {resource:'painel',columns,rows:rows.slice(offset,offset+limit),note:result.note,pagination:{offset,loaded:Math.min(limit,Math.max(0,rows.length-offset)),total:rows.length,hasMore:offset+limit<rows.length,nextOffset:offset+limit},partial:result.partial};
}
async function panelLoadScope(tenant,auth,key,loadId) {
 if(!/^[a-f0-9-]{36}$/i.test(loadId))throw new Error('DASHBOARD_LOAD_ID_INVALID');
 const scope=await sha256Hex(JSON.stringify([tenant.id,tenant.userAccess,tenant.accessToken,auth.userToken||'',auth.context?.entity,auth.context?.database,key]));
 return 'api-panels:v1:'+scope+':'+loadId;
}
const DASHBOARD_CACHE_BLOCK_PAGES=5;

async function dashboardTempGetJson(env,key) {
  if(env.AUTH_DB){
    try{
      const row=await env.AUTH_DB.prepare(
        "SELECT payload,expires_at FROM bi_temp_cache WHERE cache_key=?1 LIMIT 1"
      ).bind(String(key)).first();
      if(row&&Number(row.expires_at)>Date.now()){
        return JSON.parse(String(row.payload));
      }
      if(row){
        await env.AUTH_DB.prepare("DELETE FROM bi_temp_cache WHERE cache_key=?1").bind(String(key)).run().catch(()=>{});
      }
    }catch{}
  }
  if(env.BI_SESSIONS){
    try{return await env.BI_SESSIONS.get(key,'json');}catch{}
  }
  return null;
}

async function dashboardTempPutJson(env,key,value,ttlSeconds=3600) {
  const payload=JSON.stringify(value);
  if(env.AUTH_DB){
    const expiresAt=Date.now()+Math.max(60,Number(ttlSeconds)||3600)*1000;
    await env.AUTH_DB.prepare(
      "INSERT INTO bi_temp_cache (cache_key,payload,expires_at,updated_at) VALUES (?1,?2,?3,?4) ON CONFLICT(cache_key) DO UPDATE SET payload=excluded.payload,expires_at=excluded.expires_at,updated_at=excluded.updated_at"
    ).bind(String(key),payload,expiresAt,new Date().toISOString()).run();
    return;
  }
  if(env.BI_SESSIONS){
    await env.BI_SESSIONS.put(key,payload,{expirationTtl:Math.max(60,Number(ttlSeconds)||3600)});
    return;
  }
  throw new Error('SESSION_STORE_NOT_CONFIGURED');
}

async function readPanelSnapshot(env,key,sourceKey,pages) {
 const prefix=key+':'+sourceKey;const manifest=await dashboardTempGetJson(env,prefix+':manifest');
 if(!manifest||manifest.pages<pages)throw new Error('DASHBOARD_BATCH_PENDING');
 const chunks=[];for(let i=0;i<Math.ceil(pages/DASHBOARD_CACHE_BLOCK_PAGES);i++){const block=await dashboardTempGetJson(env,prefix+':block:'+i);if(!block)throw new Error('DASHBOARD_BATCH_PENDING');chunks.push(...block);}
 chunks.length=pages;const seen=new Set(),rows=[];for(const c of chunks)for(const r of c.rows){const id=panelValue(r,['id','codigo','idIntegracao','uuid']);if(id!=null){if(seen.has(String(id)))continue;seen.add(String(id));}rows.push(r);}
 return {rows,loaded:rows.length,complete:manifest.complete&&manifest.pages===pages,error:null,pages};
}
// Background source snapshots are scoped to the saved credentials and entity.
const SYNC_TTL=7*24*3600;
const SYNC_INTERVALS=[0,15,30,60,180,360,720,1440];
const SYNC_SOURCES_PER_TICK=3;
const SYNC_CONCURRENCY=2;
const SYNC_MAX_RETRIES=6;
const SYNC_PAGE_SIZES=[250,100,50];
const SYNC_TIMEOUT_BY_PAGE={250:20000,100:30000,50:30000};
const SYNC_HEAVY_RESOURCES=new Set([
 "pagamentos","pagamentos-parcelamentos","pagamentos-detalhados",
 "pagamentos-detalhados-valores","debitos","debitos-receitas",
 "dividas","dividas-receitas","guias-unificadas"
]);
function syncInitialPageSize(resource){
 if(resource==="pagamentos-detalhados"||resource==="pagamentos-detalhados-valores")return 50;
 if(SYNC_HEAVY_RESOURCES.has(resource))return 100;
 return 250;
}

async function syncScope(tenant){return 'bi-sync:v1:'+await sha256Hex(JSON.stringify([tenant.id,tenant.entityId,tenant.databaseId,tenant.userAccess,tenant.accessToken]));}
async function syncConfig(env,tenant){return await env.BI_SESSIONS.get(await syncScope(tenant)+':config','json')||{enabled:false,intervalMinutes:60};}
async function syncJob(env,tenant,id){if(!/^[a-f0-9-]{36}$/i.test(id||''))throw new Error('DASHBOARD_CURSOR_INVALID');return env.BI_SESSIONS.get(await syncScope(tenant)+':job:'+id,'json');}
function publicSyncJob(job){if(!job)return null;const {id,state,startedAt,finishedAt,completed,total,rows,failures}=job;return {id,state,startedAt,finishedAt,completed,total,rows,failures};}

function syncErrorCode(error){
 return String(error&&error.message||'SOURCE_UNAVAILABLE');
}
function syncIsTransientCode(code){
 return code==='The operation was aborted'||code==='AbortError'||code==='REQUEST_TIMEOUT'||
   /^BETHA_HTTP_(408|409|425|429|5\d\d)$/.test(String(code||''));
}
function syncNextPageSize(size){
 const n=Number(size)||250;
 if(n>100)return 100;
 return 50;
}
function normalizeSyncEntry(raw={},defaultPageSize=250){
 const complete=raw.complete===true,error=raw.error||null;
 const loaded=Math.max(0,Number(raw.loaded)||0);
 const hasOffset=raw.nextOffset!==null&&raw.nextOffset!==undefined&&raw.nextOffset!=='';
 const candidateOffset=hasOffset?Number(raw.nextOffset):NaN;
 return {
  ...raw,
  pages:Math.max(0,Number(raw.pages)||0),
  loaded,
  complete,
  error,
  nextOffset:Number.isFinite(candidateOffset)&&candidateOffset>=0?candidateOffset:(complete||error?null:loaded),
  pageSize:SYNC_PAGE_SIZES.includes(Number(raw.pageSize))?Number(raw.pageSize):defaultPageSize,
  retryCount:Math.max(0,Number(raw.retryCount)||0),
  stablePages:Math.max(0,Number(raw.stablePages)||0),
  lastError:raw.lastError||null,
  lastErrorAt:raw.lastErrorAt||null
 };
}
function setSyncFailure(job,source,entry){
 job.failures=(job.failures||[]).filter(item=>item&&item.source!==source);
 if(entry.error){
  const failure={source,error:entry.error};
  if(entry.errorDetail)failure.detail=entry.errorDetail;
  job.failures.push(failure);
 }
}
function normalizeRunningSyncJob(job,cards){
 job.sources=job.sources&&typeof job.sources==='object'?job.sources:{};
 job.failures=Array.isArray(job.failures)?job.failures:[];
 for(const card of cards){
  if(!job.sources[card.id])continue;
  const entry=normalizeSyncEntry(job.sources[card.id],syncInitialPageSize(card.resource));
  // Jobs created by older versions marked timeouts as permanent. Reopen
  // transient failures and retry the additional-fields 422 once because newer
  // builds now send Betha's required cpaFields=true parameter.
  const retryAdditionalFields=card.id==='bi:imoveis-campos-adicionais'&&
   entry.error==='BETHA_HTTP_422'&&entry.additionalFieldsCriterionRetry!==true;
  const retryLegacyPageLimit=entry.error==='SOURCE_PAGE_LIMIT';
  if(entry.error&&(syncIsTransientCode(entry.error)||retryAdditionalFields||retryLegacyPageLimit)){
   entry.lastError=entry.error;
   entry.lastErrorAt=entry.lastErrorAt||new Date().toISOString();
   entry.error=null;
   entry.complete=false;
   entry.retryCount=retryAdditionalFields||retryLegacyPageLimit?0:Math.max(1,entry.retryCount);
   entry.pageSize=retryAdditionalFields?100:(retryLegacyPageLimit?entry.pageSize:syncNextPageSize(entry.pageSize));
   // Never restart a large source: continue from the last committed row.
   entry.nextOffset=entry.loaded;
   if(retryAdditionalFields){
    entry.cpaFieldsRetry=true;
    entry.additionalFieldsCriterionRetry=true;
   }
  }
  job.sources[card.id]=entry;
  setSyncFailure(job,card.id,entry);
 }
 job.completed=cards.reduce((count,card)=>{
  const entry=job.sources[card.id];
  return count+(entry&&(entry.complete||entry.error)?1:0);
 },0);
 job.total=cards.length;
 job.sourceIndex=((Number(job.sourceIndex)||0)%Math.max(1,cards.length)+Math.max(1,cards.length))%Math.max(1,cards.length);
 delete job.offset;
 return job;
}
function pendingSyncIndexes(job,cards,limit=SYNC_SOURCES_PER_TICK){
 const out=[];
 if(!cards.length)return out;
 const start=job.sourceIndex%cards.length;
 let scanned=0;
 while(scanned<cards.length&&out.length<limit){
  const index=(start+scanned)%cards.length;
  const entry=job.sources[cards[index].id];
  if(!entry||(!entry.complete&&!entry.error))out.push(index);
  scanned++;
 }
 job.sourceIndex=(start+scanned)%cards.length;
 return out;
}
async function advanceSyncSource(env,tenant,scope,job,card){
 const entry=normalizeSyncEntry(job.sources[card.id]||{},syncInitialPageSize(card.resource));
 try{
  const pageSize=entry.pageSize||250;
  const timeout=SYNC_TIMEOUT_BY_PAGE[pageSize]||14000;
  const result=await fetchBethaRows({...env,BI_SOURCE_TIMEOUT_MS:timeout},tenant,card.source,card.resource,{
   limit:pageSize,
   maxPages:1,
   startOffset:entry.nextOffset||0
  });
  const fingerprint=JSON.stringify(result.rows.slice(0,10).map(r=>r.id??r.codigo??r));
  if(entry.fingerprint&&entry.fingerprint===fingerprint&&result.loaded)throw new Error('SOURCE_PAGINATION_REPEATED');
  const pageNo=entry.pages;
  await env.BI_SESSIONS.put(scope+':rows:'+job.id+':'+card.id+':'+pageNo,JSON.stringify(result.rows),{expirationTtl:SYNC_TTL});
  entry.pages++;
  entry.loaded+=result.loaded;
  entry.fingerprint=fingerprint;
  entry.complete=result.complete===true;
  entry.nextOffset=entry.complete?null:result.nextOffset;
  entry.error=null;
  delete entry.errorDetail;
  entry.lastError=null;
  entry.lastErrorAt=null;
  entry.retryCount=0;
  entry.stablePages=(entry.stablePages||0)+1;
  // Once a reduced page size has been stable for several pages, cautiously
  // restore throughput. Any new timeout immediately backs it down again.
  if(!entry.complete&&entry.stablePages>=8&&entry.pageSize<250){
   entry.pageSize=entry.pageSize===50?100:250;
   entry.stablePages=0;
  }
  return {entry,added:result.loaded,page:{pageNo,rows:result.rows,nextOffset:entry.nextOffset,complete:entry.complete}};
 }catch(error){
  const code=syncErrorCode(error);
  entry.lastError=code;
  entry.lastErrorAt=new Date().toISOString();
  entry.stablePages=0;
  if(syncIsTransientCode(code)&&entry.retryCount<SYNC_MAX_RETRIES){
   entry.retryCount++;
   entry.pageSize=syncNextPageSize(entry.pageSize);
   entry.error=null;
   entry.complete=false;
   // Keep the same committed offset: failed pages are retried, never skipped.
   if(entry.nextOffset==null)entry.nextOffset=entry.loaded;
  }else{
   entry.error=code;
   entry.complete=false;
   const detail=error&&error.remoteBody
    ? (typeof error.remoteBody==='string'?error.remoteBody:JSON.stringify(error.remoteBody)).slice(0,240)
    : null;
   if(detail)entry.errorDetail=detail;
   if(card.id==='bi:imoveis-campos-adicionais'&&code==='BETHA_HTTP_422'&&!entry.errorDetail){
    entry.errorDetail='A API Betha recusou a fonte de campos adicionais mesmo com cpaFields=true e filtro id > 0; a carga das demais fontes continua normalmente.';
   }
  }
  return {entry,added:0,page:null};
 }
}
async function beginSync(env,tenant,config){
 const scope=await syncScope(tenant);const previous=config.activeJob?await syncJob(env,tenant,config.activeJob):null;
 if(previous?.state==='running')return previous;
 const cards=API_PANEL_CATALOG.groups.flatMap(g=>g.cards);
 const job={id:crypto.randomUUID(),state:'running',startedAt:new Date().toISOString(),sourceIndex:0,completed:0,total:cards.length,rows:0,failures:[],sources:{}};
 await env.BI_SESSIONS.put(scope+':job:'+job.id,JSON.stringify(job),{expirationTtl:SYNC_TTL});
 await env.BI_SESSIONS.put(scope+':config',JSON.stringify({...config,enabled:true,activeJob:job.id}));return job;
}
async function advanceSync(env,tenant,config){
 const scope=await syncScope(tenant);let job=config.activeJob?await syncJob(env,tenant,config.activeJob):null;
 if(!job||job.state!=='running'){
  if(!config.enabled||!config.intervalMinutes||config.nextRunAt&&Date.parse(config.nextRunAt)>Date.now())return;
  job=await beginSync(env,tenant,config);
 }
 const cards=API_PANEL_CATALOG.groups.flatMap(g=>g.cards);
 normalizeRunningSyncJob(job,cards);
 const indexes=pendingSyncIndexes(job,cards);
 let next=0;
 await Promise.all(Array.from({length:Math.min(SYNC_CONCURRENCY,indexes.length)},async()=>{
  while(next<indexes.length){
   const index=indexes[next++],card=cards[index];
   const result=await advanceSyncSource(env,tenant,scope,job,card);
   job.sources[card.id]=result.entry;
   job.rows=(Number(job.rows)||0)+result.added;
   setSyncFailure(job,card.id,result.entry);
   try{
    await persistBackgroundSourceProgress(env,tenant,job,card,result.entry,result.page);
   }catch(error){
    job.persistenceFailures=Array.isArray(job.persistenceFailures)?job.persistenceFailures:[];
    job.persistenceFailures=job.persistenceFailures.filter(item=>item.source!==card.id);
    job.persistenceFailures.push({source:card.id,error:String(error?.message||error),at:new Date().toISOString()});
   }
  }
 }));
 job.completed=cards.reduce((count,card)=>{
  const entry=job.sources[card.id];
  return count+(entry&&(entry.complete||entry.error)?1:0);
 },0);
 if(job.completed===cards.length){
  job.state=job.failures.length?'completed-with-warnings':'completed';
  job.finishedAt=new Date().toISOString();
  config={...config,latestJob:job.id,nextRunAt:config.intervalMinutes?new Date(Date.now()+config.intervalMinutes*60000).toISOString():null};
 }
 try{await persistBackgroundJobSummary(env,tenant,job);}catch(error){
  job.persistenceFailures=Array.isArray(job.persistenceFailures)?job.persistenceFailures:[];
  job.persistenceFailures.push({source:"job",error:String(error?.message||error),at:new Date().toISOString()});
 }
 await env.BI_SESSIONS.put(scope+':job:'+job.id,JSON.stringify(job),{expirationTtl:SYNC_TTL});
 await env.BI_SESSIONS.put(scope+':config',JSON.stringify({...config,activeJob:job.id}));
}
async function backgroundSources(env,tenant,keys,url){
 const config=await syncConfig(env,tenant);const requested=url.searchParams.get('cacheJob');const id=requested||config.latestJob||config.activeJob;
 if(!id){if(config.enabled)throw new Error('INITIAL_LOAD_IN_PROGRESS');return null;}
 const job=await syncJob(env,tenant,id);if(!job)throw new Error('INITIAL_LOAD_REQUIRED');
 let frozen=null;const pageParam=url.searchParams.get('cachePages');
 if(pageParam){try{frozen=JSON.parse(pageParam);}catch{throw new Error('DASHBOARD_CURSOR_INVALID');}if(!frozen||typeof frozen!=='object'||Array.isArray(frozen)||Object.values(frozen).some(v=>!Number.isInteger(v)||v<0))throw new Error('DASHBOARD_CURSOR_INVALID');}
 const scope=await syncScope(tenant),sources={},pages={};let pending=false;
 for(const key of keys){const entry=job.sources[key];const count=frozen?frozen[key]:entry?.pages||0;
  if(frozen&&(!Number.isInteger(count)||count>(entry?.pages||0)))throw new Error('DASHBOARD_CURSOR_INVALID');
  pages[key]=count;
  if(!entry){sources[key]={rows:[],loaded:0,error:'Fonte aguardando a carga inicial',complete:false,pages:0};pending=job.state==='running';continue;}
  const rows=[];for(let i=0;i<count;i++){const page=await env.BI_SESSIONS.get(scope+':rows:'+id+':'+key+':'+i,'json');if(!page)throw new Error('DASHBOARD_BATCH_PENDING');rows.push(...page);}
  sources[key]={...entry,rows,loaded:rows.length,pages:count,complete:entry.complete&&count===entry.pages};
  if(!entry.complete&&!entry.error&&job.state==='running')pending=true;
 }
 return {id,updatedAt:job.finishedAt||job.startedAt,sources,pages,pending};
}

async function runBackgroundSync(env){
 const registry=await tenantRegistry(env);
 for(const [id,record]of Object.entries(registry)){if(record.enabled===false)continue;try{const tenant=await resolveTenant(env,id),config=await syncConfig(env,tenant);if(config.enabled)await advanceSync(env,tenant,config);}catch(error){console.error('Background sync failed',id,error.message);}}
}

async function buildApiPanels(env,tenant,auth,key,url,detailId=null) {
 const card=panelCard(key);if(!card)throw new Error('DATA_RESOURCE_PERMISSION_DENIED');panelReadAuthorized(auth,key);
 if(!env.BI_SESSIONS)throw new Error('SESSION_STORE_NOT_CONFIGURED');
 const prefix=await panelLoadScope(tenant,auth,key,url.searchParams.get('loadId')||'');
 let expected;try{expected=JSON.parse(url.searchParams.get('cursor')||'{}');}catch{throw new Error('DASHBOARD_CURSOR_INVALID');}
 const dependencies=[...new Set(card.panels.flatMap(panelDependencies))];
 if(!expected||typeof expected!=='object'||Array.isArray(expected)||Object.entries(expected).some(([k,v])=>!dependencies.includes(k)||!Number.isInteger(v)||v<0))throw new Error('DASHBOARD_CURSOR_INVALID');
 const panels=detailId?card.panels.filter(p=>p.id===detailId):card.panels;if(!panels.length)throw new Error('DASHBOARD_CURSOR_INVALID');
 const keys=detailId?[...new Set([key,...panels.flatMap(panelDependencies)])]:dependencies;
 const load={prefix,expected,cursors:{},hasMore:false,pending:new Map()},sources={};let next=0;
 const authorizedKeys=keys.filter(source=>{try{panelReadAuthorized(auth,source);return true;}catch{return false;}});
 const cached=await backgroundSources(env,tenant,authorizedKeys,url);
 if(cached){Object.assign(sources,cached.sources);for(const source of keys)if(!sources[source])sources[source]={rows:[],loaded:0,error:'Sem permissão para esta fonte',complete:false};}
 else
 await Promise.all(Array.from({length:Math.min(3,keys.length)},async()=>{while(next<keys.length){const sourceKey=keys[next++];try{panelReadAuthorized(auth,sourceKey);}catch{sources[sourceKey]={rows:[],loaded:0,error:'Sem permissão para esta fonte',complete:false};continue;}const [source,resource]=sourceKey.split(':');if(detailId){if(!Number.isInteger(expected[sourceKey])||expected[sourceKey]<1)throw new Error('DASHBOARD_BATCH_PENDING');sources[sourceKey]=await readPanelSnapshot(env,prefix,sourceKey,expected[sourceKey]);}else sources[sourceKey]=await safeBethaRows({...env,BI_DASHBOARD_LOAD:load},tenant,source,resource);}}));
 for(const [source,entry]of Object.entries(sources))entry.normalized=entry.rows.map((row,i)=>normalizePanelRow(row,source,i));
 const charts={};for(const p of panels){const result=evaluateApiPanel(p,sources,url,key);if(!detailId){delete result.records;if(result.labels.length>100){const total=result.labels.length;const start=/^(month|year):/.test(p.dim)?total-100:0;result.labels=result.labels.slice(start,start+100);result.selectionValues=result.labels;for(const ds of result.datasets)ds.data=ds.data.slice(start,start+100);result.note=(result.note?result.note+' ':'')+'Exibindo 100 de '+total+' categorias; o detalhamento inclui todas.';}}charts[p.id]=result;}
 if(detailId)return panelDetailPayload(charts[detailId],panels[0],url);
 const filterOptions={};for(const [key]of [...url.searchParams].filter(([k])=>k.startsWith('panel_')))filterOptions[key]=[];
 for(const f of ['situacao','bairro','rua','zona','nome','receita','tipo','ano'])filterOptions['panel_'+f]=[...new Set((sources[key]?.normalized||[]).map(r=>r[f]).filter(v=>v!=null))].sort().map(v=>({value:String(v),label:String(v)}));
 const sourceRows={},sourceAudit={};for(const [source,r]of Object.entries(sources)){sourceRows[source]=r.loaded||0;sourceAudit[source]={loaded:r.loaded||0,pages:r.pages||0,complete:r.complete===true,error:r.error||null,reportedTotal:r.reportedTotal??null,totalMismatch:r.totalMismatch===true};}
 for(const result of Object.values(charts))delete result.records;
 const payload={view:card.panelView,kpis:{'source-count':sources[key]?.error?null:sources[key]?.loaded??null},charts,loading:{hasMore:cached?cached.pending:load.hasMore,background:Boolean(cached),cursor:load.cursors},meta:{sourceRows,sourceAudit,filterOptions,updatedAt:cached?.updatedAt||new Date().toISOString(),snapshot:{loadId:url.searchParams.get('loadId'),cursor:load.cursors,cacheJob:cached?.id||null,cachePages:cached?.pages||null},warnings:Object.entries(sourceAudit).filter(([,a])=>a.error).map(([source,a])=>({source,error:a.error}))}};
 try{await persistApiPanelSnapshot(env,tenant,card,url,payload);}catch(error){console.warn("API panel snapshot not persisted",card.id,error?.message||error);}
 return payload;
}

const API_PANEL_CATALOG={"version":1,"groups":[{"id":"cadastros","label":"Imóveis e contribuintes","icon":"home-city-outline","cards":[{"id":"bi:imoveis","source":"bi","resource":"imoveis","label":"Imóveis","view":"imobiliario","panels":[{"id":"p1","title":"Geral: imóveis urbanos e rurais","dim":"zona","measure":"count","agg":"count","input":"bi:imoveis"},{"id":"p2","title":"Imóveis por bairro","dim":"bairro","measure":"count","agg":"count","input":"bi:imoveis"},{"id":"p3","title":"Imóveis por rua","dim":"rua","measure":"count","agg":"count","input":"bi:imoveis"},{"id":"p4","title":"Imóveis por situação cadastral","dim":"situacao","measure":"count","agg":"count","input":"bi:imoveis"},{"id":"p5","title":"Imóveis por contribuinte","dim":"nome","measure":"imovelId","agg":"distinct","input":"bi:imoveis-responsaveis","restrict":{"source":"bi:imoveis","left":"imovelId","right":"id"}},{"id":"p6","title":"Imóveis urbanos por bairro","dim":"bairro","measure":"count","agg":"count","input":"bi:imoveis","where":["zona","Urbana"]},{"id":"p7","title":"Imóveis rurais por bairro","dim":"bairro","measure":"count","agg":"count","input":"bi:imoveis","where":["zona","Rural"]}],"panelView":"api-bi-imoveis","permissionViews":["imobiliario","qualidade","territorio"]},{"id":"bi:imoveis-responsaveis","source":"bi","resource":"imoveis-responsaveis","label":"Responsáveis dos imóveis","view":"imobiliario","panels":[{"id":"p1","title":"Responsáveis distintos","dim":"all","measure":"pessoaId","agg":"distinct","input":"bi:imoveis-responsaveis"},{"id":"p2","title":"Imóveis por responsável","dim":"nome","measure":"imovelId","agg":"distinct","input":"bi:imoveis-responsaveis"},{"id":"p3","title":"Imóveis com um ou vários responsáveis","dim":"countband","measure":"count","agg":"count","input":"bi:imoveis-responsaveis","transform":"links","entity":"imovelId","linked":"pessoaId"},{"id":"p4","title":"Responsáveis por bairro","dim":"j.bairro","measure":"pessoaId","agg":"distinct","input":"bi:imoveis-responsaveis","joins":[{"source":"bi:imoveis","left":"imovelId","right":"id","prefix":"j"}]},{"id":"p5","title":"Responsáveis por quantidade de imóveis","dim":"countband","measure":"count","agg":"count","input":"bi:imoveis-responsaveis","transform":"links","entity":"pessoaId","linked":"imovelId"}],"panelView":"api-bi-imoveis-responsaveis","permissionViews":["imobiliario"]},{"id":"bi:imoveis-corresponsaveis","source":"bi","resource":"imoveis-corresponsaveis","label":"Corresponsáveis dos imóveis","view":"imobiliario","panels":[{"id":"p1","title":"Imóveis com corresponsáveis","dim":"all","measure":"imovelId","agg":"distinct","input":"bi:imoveis-corresponsaveis"},{"id":"p2","title":"Corresponsáveis por imóvel","dim":"imovelId","measure":"pessoaId","agg":"distinct","input":"bi:imoveis-corresponsaveis"},{"id":"p3","title":"Imóveis por corresponsável","dim":"nome","measure":"imovelId","agg":"distinct","input":"bi:imoveis-corresponsaveis"},{"id":"p4","title":"Corresponsabilidade por bairro","dim":"j.bairro","measure":"imovelId","agg":"distinct","input":"bi:imoveis-corresponsaveis","joins":[{"source":"bi:imoveis","left":"imovelId","right":"id","prefix":"j"}]},{"id":"p5","title":"Imóveis com e sem corresponsabilidade","dim":"presence","measure":"count","agg":"count","input":"bi:imoveis","presence":{"source":"bi:imoveis-corresponsaveis","left":"id","right":"imovelId"}}],"panelView":"api-bi-imoveis-corresponsaveis","permissionViews":["imobiliario"]},{"id":"bi:imoveis-campos-adicionais","source":"bi","resource":"imoveis-campos-adicionais","label":"Características dos imóveis","view":"qualidade","panels":[{"id":"p1","title":"Preenchimento por característica","dim":"caracteristica","measure":"preenchido","agg":"average","input":"bi:imoveis-campos-adicionais"},{"id":"p2","title":"Imóveis por valor da característica","dim":"caracteristicaValor","measure":"count","agg":"count","input":"bi:imoveis-campos-adicionais"},{"id":"p3","title":"Características por bairro","dim":"j.bairro","measure":"count","agg":"count","input":"bi:imoveis-campos-adicionais","joins":[{"source":"bi:imoveis","left":"imovelId","right":"id","prefix":"j"}]},{"id":"p4","title":"Características: urbanos e rurais","dim":"j.zona","measure":"count","agg":"count","input":"bi:imoveis-campos-adicionais","joins":[{"source":"bi:imoveis","left":"imovelId","right":"id","prefix":"j"}]},{"id":"p5","title":"Imóveis com características sem preenchimento","dim":"preenchimento","measure":"imovelId","agg":"distinct","input":"bi:imoveis-campos-adicionais"}],"panelView":"api-bi-imoveis-campos-adicionais","permissionViews":["qualidade"]},{"id":"bi:contribuintes","source":"bi","resource":"contribuintes","label":"Contribuintes","view":"contribuintes","panels":[{"id":"p1","title":"Pessoas físicas e jurídicas","dim":"tipoPessoa","measure":"count","agg":"count","input":"bi:contribuintes"},{"id":"p2","title":"Contribuintes por situação cadastral","dim":"situacao","measure":"count","agg":"count","input":"bi:contribuintes"},{"id":"p3","title":"Contribuintes por município","dim":"cidade","measure":"count","agg":"count","input":"bi:contribuintes"},{"id":"p4","title":"Documentos e contatos: preenchimento","dim":"contactQuality","measure":"count","agg":"count","input":"bi:contribuintes"},{"id":"p5","title":"Contribuintes por quantidade de imóveis","dim":"countband","measure":"count","agg":"count","input":"bi:imoveis-responsaveis","transform":"links","entity":"pessoaId","linked":"imovelId"}],"panelView":"api-bi-contribuintes","permissionViews":["contribuintes","qualidade"]},{"id":"bi:economicos","source":"bi","resource":"economicos","label":"Cadastros econômicos","view":"economicos","panels":[{"id":"p1","title":"Cadastros econômicos por situação","dim":"situacao","measure":"count","agg":"count","input":"bi:economicos"},{"id":"p2","title":"Cadastros econômicos por bairro","dim":"bairro","measure":"count","agg":"count","input":"bi:economicos"},{"id":"p3","title":"Cadastros por natureza jurídica","dim":"natureza","measure":"count","agg":"count","input":"bi:economicos"},{"id":"p4","title":"Aberturas por período","dim":"month:abertura","measure":"count","agg":"count","input":"bi:economicos"},{"id":"p5","title":"Cadastros por atividade econômica","dim":"atividade","measure":"economicoId","agg":"distinct","input":"bi:economicos-atividades"}],"panelView":"api-bi-economicos","permissionViews":["economicos","qualidade"]},{"id":"bi:economicos-atividades","source":"bi","resource":"economicos-atividades","label":"Atividades econômicas","view":"economicos","panels":[{"id":"p1","title":"Cadastros por atividade/CNAE","dim":"atividade","measure":"economicoId","agg":"distinct","input":"bi:economicos-atividades"},{"id":"p2","title":"Atividades principais e secundárias","dim":"principal","measure":"count","agg":"count","input":"bi:economicos-atividades"},{"id":"p3","title":"Quantidade de atividades por cadastro","dim":"economicoId","measure":"atividade","agg":"distinct","input":"bi:economicos-atividades"},{"id":"p4","title":"Atividades por bairro","dim":"j.bairro","measure":"count","agg":"count","input":"bi:economicos-atividades","joins":[{"source":"bi:economicos","left":"economicoId","right":"id","prefix":"j"}]},{"id":"p5","title":"Atividades por situação do cadastro","dim":"j.situacao","measure":"count","agg":"count","input":"bi:economicos-atividades","joins":[{"source":"bi:economicos","left":"economicoId","right":"id","prefix":"j"}]}],"panelView":"api-bi-economicos-atividades","permissionViews":["economicos","qualidade"]},{"id":"base:imoveis","source":"base","resource":"imoveis","label":"Imóveis — cadastro complementar","view":"imobiliario","panels":[{"id":"p1","title":"Imóveis por tipo cadastral","dim":"tipo","measure":"count","agg":"count","input":"base:imoveis"},{"id":"p2","title":"Imóveis por setor, quadra e lote","dim":"setorQuadra","measure":"count","agg":"count","input":"base:imoveis"},{"id":"p3","title":"Imóveis por faixa de área do terreno","dim":"range:areaTerreno","measure":"count","agg":"count","input":"base:imoveis"},{"id":"p4","title":"Imóveis por faixa de área construída","dim":"range:areaConstruida","measure":"count","agg":"count","input":"base:imoveis"},{"id":"p5","title":"Comparação cadastral Base e BI","dim":"comparison","measure":"count","agg":"count","input":"base:imoveis","compare":"bi:imoveis","compareFields":["bairro","rua","zona"]}],"panelView":"api-base-imoveis","permissionViews":["imobiliario","territorio"]},{"id":"base:contribuintes","source":"base","resource":"contribuintes","label":"Contribuintes — cadastro complementar","view":"contribuintes","panels":[{"id":"p1","title":"Contribuintes por tipo de pessoa","dim":"tipoPessoa","measure":"count","agg":"count","input":"base:contribuintes"},{"id":"p2","title":"Contribuintes por localização","dim":"cidade","measure":"count","agg":"count","input":"base:contribuintes"},{"id":"p3","title":"Contatos completos e incompletos","dim":"contactQuality","measure":"count","agg":"count","input":"base:contribuintes"},{"id":"p4","title":"Possíveis duplicidades por documento","dim":"duplicate","measure":"count","agg":"count","input":"base:contribuintes","transform":"duplicates","entity":"documento"},{"id":"p5","title":"Comparação cadastral Base e BI","dim":"comparison","measure":"count","agg":"count","input":"base:contribuintes","compare":"bi:contribuintes","compareFields":["nome","cidade","tipoPessoa"]}],"panelView":"api-base-contribuintes","permissionViews":["contribuintes","qualidade"]}]},{"id":"arrecadacao","label":"Arrecadação e receitas","icon":"cash-multiple","cards":[{"id":"bi:pagamentos","source":"bi","resource":"pagamentos","label":"Pagamentos","view":"arrecadacao","panels":[{"id":"p1","title":"Arrecadação por período","dim":"month:pagamento","measure":"pago","agg":"sum","input":"bi:pagamentos"},{"id":"p2","title":"Quantidade de pagamentos por período","dim":"month:pagamento","measure":"count","agg":"count","input":"bi:pagamentos"},{"id":"p3","title":"Pagamentos por contribuinte","dim":"nome","measure":"pago","agg":"sum","input":"bi:pagamentos"},{"id":"p4","title":"Valor médio dos pagamentos por mês","dim":"month:pagamento","measure":"pago","agg":"average","input":"bi:pagamentos"},{"id":"p5","title":"Arrecadação por receita","dim":"receita","measure":"pago","agg":"sum","input":"bi:pagamentos-detalhados-valores"}],"panelView":"api-bi-pagamentos","permissionViews":["arrecadacao"]},{"id":"bi:pagamentos-parcelamentos","source":"bi","resource":"pagamentos-parcelamentos","label":"Pagamentos de parcelamentos","view":"parcelamentos","panels":[{"id":"p1","title":"Valor pago por período","dim":"month:pagamento","measure":"pago","agg":"sum","input":"bi:pagamentos-parcelamentos"},{"id":"p2","title":"Pagamentos por acordo","dim":"parcelamentoId","measure":"pago","agg":"sum","input":"bi:pagamentos-parcelamentos"},{"id":"p3","title":"Pagamentos por contribuinte","dim":"j.nome","measure":"pago","agg":"sum","input":"bi:pagamentos-parcelamentos","joins":[{"source":"bi:parcelamentos","left":"parcelamentoId","right":"id","prefix":"j"}]},{"id":"p4","title":"Pagamentos no prazo e em atraso","dim":"paymentTiming","measure":"count","agg":"count","input":"bi:pagamentos-parcelamentos","joins":[{"source":"bi:parcelamentos-parcelas","left":"parcelaId","right":"id","prefix":"j"}]},{"id":"p5","title":"Percentual pago por parcelamento","dim":"parcelamentoId","measure":"paymentRatio","agg":"average","input":"bi:pagamentos-parcelamentos","joins":[{"source":"bi:parcelamentos","left":"parcelamentoId","right":"id","prefix":"j"}],"transform":"agreementRatio","amounts":"bi:parcelamentos-parcelas","definition":"Pagamentos vinculados divididos pela soma das parcelas do acordo."}],"panelView":"api-bi-pagamentos-parcelamentos","permissionViews":["arrecadacao","parcelamentos"]},{"id":"bi:pagamentos-detalhados","source":"bi","resource":"pagamentos-detalhados","label":"Pagamentos detalhados","view":"arrecadacao","panels":[{"id":"p1","title":"Arrecadação por tributo/receita","dim":"receita","measure":"pago","agg":"sum","input":"bi:pagamentos-detalhados"},{"id":"p2","title":"Arrecadação por exercício de origem","dim":"ano","measure":"pago","agg":"sum","input":"bi:pagamentos-detalhados"},{"id":"p3","title":"Pagamentos por tipo de obrigação","dim":"origem","measure":"pago","agg":"sum","input":"bi:pagamentos-detalhados"},{"id":"p4","title":"Pagamentos por contribuinte","dim":"j.nome","measure":"pago","agg":"sum","input":"bi:pagamentos-detalhados","joins":[{"source":"bi:pagamentos","left":"pagamentoId","right":"id","prefix":"j"}]},{"id":"p5","title":"Composição de receitas de cada pagamento","dim":"pagamentoId","measure":"pago","agg":"sum","input":"bi:pagamentos-detalhados"}],"panelView":"api-bi-pagamentos-detalhados","permissionViews":["arrecadacao","economicos","imobiliario","receitas-creditos"]},{"id":"bi:pagamentos-detalhados-valores","source":"bi","resource":"pagamentos-detalhados-valores","label":"Composição dos pagamentos","view":"arrecadacao","panels":[{"id":"p1","title":"Principal, juros, multa e correção","dim":"component","measure":"count","agg":"count","input":"bi:pagamentos-detalhados-valores","components":["principal","juros","multa","correcao"]},{"id":"p2","title":"Acréscimos arrecadados por período","dim":"month:j.pagamento","measure":"acrescimos","agg":"sum","input":"bi:pagamentos-detalhados-valores","joins":[{"source":"bi:pagamentos","left":"pagamentoId","right":"id","prefix":"j"}]},{"id":"p3","title":"Descontos por período","dim":"month:j.pagamento","measure":"desconto","agg":"sum","input":"bi:pagamentos-detalhados-valores","joins":[{"source":"bi:pagamentos","left":"pagamentoId","right":"id","prefix":"j"}]},{"id":"p4","title":"Composição dos valores por receita","dim":"receita","measure":"pago","agg":"sum","input":"bi:pagamentos-detalhados-valores"},{"id":"p5","title":"Participação dos acréscimos no total pago","dim":"receita","measure":"acrescimos","agg":"ratio","input":"bi:pagamentos-detalhados-valores","denominator":"pago"}],"panelView":"api-bi-pagamentos-detalhados-valores","permissionViews":["arrecadacao","divida"]},{"id":"bi:receitas","source":"bi","resource":"receitas","label":"Receitas","view":"receitas-creditos","panels":[{"id":"p1","title":"Receitas por classificação","dim":"classificacao","measure":"count","agg":"count","input":"bi:receitas"},{"id":"p2","title":"Receitas por situação cadastral","dim":"situacao","measure":"count","agg":"count","input":"bi:receitas"},{"id":"p3","title":"Receitas com e sem movimentação","dim":"presence","measure":"count","agg":"count","input":"bi:receitas","presence":{"source":"bi:pagamentos-detalhados-valores","left":"id","right":"receitaId"}},{"id":"p4","title":"Arrecadação por receita","dim":"j.nome","measure":"pago","agg":"sum","input":"bi:pagamentos-detalhados-valores","joins":[{"source":"bi:receitas","left":"receitaId","right":"id","prefix":"j"}]},{"id":"p5","title":"Lançado e arrecadado por receita","dim":"receita","measure":"count","agg":"count","input":"bi:receitas","transform":"compareTotals","totals":[{"source":"bi:debitos-receitas","measure":"lancado","label":"Lançado"},{"source":"bi:pagamentos-detalhados-valores","measure":"pago","label":"Arrecadado"}]}],"panelView":"api-bi-receitas","permissionViews":["receitas-creditos"]},{"id":"base:creditos-tributarios","source":"base","resource":"creditos-tributarios","label":"Créditos tributários","view":"receitas-creditos","panels":[{"id":"p1","title":"Créditos por tipo","dim":"tipo","measure":"count","agg":"count","input":"base:creditos-tributarios"},{"id":"p2","title":"Créditos por situação","dim":"situacao","measure":"count","agg":"count","input":"base:creditos-tributarios"},{"id":"p3","title":"Créditos por exercício","dim":"ano","measure":"count","agg":"count","input":"base:creditos-tributarios"},{"id":"p4","title":"Créditos por faixa de valor","dim":"range:valor","measure":"count","agg":"count","input":"base:creditos-tributarios"},{"id":"p5","title":"Créditos por contribuinte","dim":"nome","measure":"count","agg":"count","input":"base:creditos-tributarios"}],"panelView":"api-base-creditos-tributarios","permissionViews":["debitos","receitas-creditos"]},{"id":"base:creditos-tributarios-receitas","source":"base","resource":"creditos-tributarios-receitas","label":"Receitas dos créditos tributários","view":"receitas-creditos","panels":[{"id":"p1","title":"Composição dos créditos por receita","dim":"receita","measure":"count","agg":"count","input":"base:creditos-tributarios-receitas"},{"id":"p2","title":"Receitas por crédito tributário","dim":"creditoId","measure":"receitaId","agg":"distinct","input":"base:creditos-tributarios-receitas"},{"id":"p3","title":"Créditos por quantidade de receitas","dim":"countband","measure":"count","agg":"count","input":"base:creditos-tributarios-receitas","transform":"links","entity":"creditoId","linked":"receitaId"},{"id":"p4","title":"Distribuição por classificação da receita","dim":"j.classificacao","measure":"count","agg":"count","input":"base:creditos-tributarios-receitas","joins":[{"source":"bi:receitas","left":"receitaId","right":"id","prefix":"j"}]},{"id":"p5","title":"Arrecadação por receita dos créditos","dim":"receita","measure":"pago","agg":"sum","input":"bi:pagamentos-detalhados-valores","restrict":{"source":"base:creditos-tributarios-receitas","left":"receitaId","right":"receitaId"}}],"panelView":"api-base-creditos-tributarios-receitas","permissionViews":["receitas-creditos"]},{"id":"base:guias-unificadas","source":"base","resource":"guias-unificadas","label":"Guias unificadas","view":"guias","panels":[{"id":"p1","title":"Guias emitidas por período","dim":"month:emissao","measure":"count","agg":"count","input":"base:guias-unificadas"},{"id":"p2","title":"Guias por situação","dim":"situacao","measure":"count","agg":"count","input":"base:guias-unificadas"},{"id":"p3","title":"Valor das guias por vencimento","dim":"month:vencimento","measure":"valor","agg":"sum","input":"base:guias-unificadas"},{"id":"p4","title":"Quantidade de obrigações por guia","dim":"id","measure":"obrigacoes","agg":"sum","input":"base:guias-unificadas"},{"id":"p5","title":"Guias emitidas e pagas","dim":"guidePayment","measure":"count","agg":"count","input":"base:guias-unificadas","presence":{"source":"bi:pagamentos","left":"id","right":"guiaId"}}],"panelView":"api-base-guias-unificadas","permissionViews":["guias"]}]},{"id":"lancamentos","label":"Lançamentos e débitos","icon":"file-document-edit-outline","cards":[{"id":"bi:debitos","source":"bi","resource":"debitos","label":"Débitos","view":"debitos","panels":[{"id":"p1","title":"Valor lançado por exercício","dim":"ano","measure":"lancado","agg":"sum","input":"bi:debitos"},{"id":"p2","title":"Débitos por situação","dim":"situacao","measure":"count","agg":"count","input":"bi:debitos"},{"id":"p3","title":"Débitos por vencimento","dim":"month:vencimento","measure":"count","agg":"count","input":"bi:debitos"},{"id":"p4","title":"Débitos por contribuinte","dim":"nome","measure":"lancado","agg":"sum","input":"bi:debitos"},{"id":"p5","title":"Débitos por faixa de valor","dim":"range:lancado","measure":"count","agg":"count","input":"bi:debitos"}],"panelView":"api-bi-debitos","permissionViews":["debitos"]},{"id":"bi:debitos-receitas","source":"bi","resource":"debitos-receitas","label":"Receitas dos débitos","view":"debitos","panels":[{"id":"p1","title":"Valor lançado por receita","dim":"receita","measure":"lancado","agg":"sum","input":"bi:debitos-receitas"},{"id":"p2","title":"Composição de receitas dos débitos","dim":"receita","measure":"count","agg":"count","input":"bi:debitos-receitas"},{"id":"p3","title":"Receitas por exercício","dim":"j.ano","measure":"lancado","agg":"sum","input":"bi:debitos-receitas","joins":[{"source":"bi:debitos","left":"debitoId","right":"id","prefix":"j"}]},{"id":"p4","title":"Saldo em aberto por receita","dim":"receita","measure":"saldo","agg":"sum","input":"bi:debitos-receitas"},{"id":"p5","title":"Receitas por bairro do imóvel","dim":"j.bairro","measure":"lancado","agg":"sum","input":"bi:debitos-receitas","joins":[{"source":"bi:debitos","left":"debitoId","right":"id","prefix":"d"},{"source":"bi:imoveis","left":"d.imovelId","right":"id","prefix":"j"}]}],"panelView":"api-bi-debitos-receitas","permissionViews":["debitos"]},{"id":"base:encerramento-lancamentos","source":"base","resource":"encerramento-lancamentos","label":"Encerramento dos lançamentos","view":"encerramento","panels":[{"id":"p1","title":"Encerramentos por período","dim":"month:encerramento","measure":"count","agg":"count","input":"base:encerramento-lancamentos"},{"id":"p2","title":"Encerramentos por motivo","dim":"motivo","measure":"count","agg":"count","input":"base:encerramento-lancamentos"},{"id":"p3","title":"Valor dos lançamentos encerrados","dim":"month:encerramento","measure":"lancado","agg":"sum","input":"base:encerramento-lancamentos"},{"id":"p4","title":"Encerramentos por receita","dim":"receita","measure":"lancado","agg":"sum","input":"base:encerramento-lancamentos"},{"id":"p5","title":"Lançamentos encerrados e em aberto","dim":"closingBalance","measure":"count","agg":"count","input":"base:encerramento-lancamentos","components":["lancado","saldo"]}],"panelView":"api-base-encerramento-lancamentos","permissionViews":["encerramento"]}]},{"id":"divida","label":"Dívida ativa","icon":"bank-outline","cards":[{"id":"bi:dividas","source":"bi","resource":"dividas","label":"Dívidas","view":"divida","panels":[{"id":"p1","title":"Saldo por exercício de origem","dim":"ano","measure":"c.saldo","agg":"sum","input":"bi:dividas","joins":[{"source":"base:encerramento-dividas","left":"id","right":"dividaId","prefix":"c","latest":"encerramento"}],"definition":"Saldo do último fechamento disponível para cada dívida."},{"id":"p2","title":"Dívidas por situação","dim":"situacao","measure":"count","agg":"count","input":"bi:dividas"},{"id":"p3","title":"Dívidas por contribuinte","dim":"nome","measure":"c.saldo","agg":"sum","input":"bi:dividas","joins":[{"source":"base:encerramento-dividas","left":"id","right":"dividaId","prefix":"c","latest":"encerramento"}],"definition":"Saldo do último fechamento disponível para cada dívida."},{"id":"p4","title":"Dívidas por faixa de valor","dim":"range:c.saldo","measure":"count","agg":"count","input":"bi:dividas","joins":[{"source":"base:encerramento-dividas","left":"id","right":"dividaId","prefix":"c","latest":"encerramento"}],"definition":"Saldo do último fechamento disponível para cada dívida."},{"id":"p5","title":"Dívidas por tempo de atraso","dim":"aging:vencimento","measure":"count","agg":"count","input":"bi:dividas"}],"panelView":"api-bi-dividas","permissionViews":["divida"]},{"id":"bi:dividas-receitas","source":"bi","resource":"dividas-receitas","label":"Receitas das dívidas","view":"divida","panels":[{"id":"p1","title":"Saldo por receita","dim":"receita","measure":"saldo","agg":"sum","input":"bi:dividas-receitas"},{"id":"p2","title":"Composição das receitas da dívida ativa","dim":"receita","measure":"count","agg":"count","input":"bi:dividas-receitas"},{"id":"p3","title":"Receitas por exercício","dim":"j.ano","measure":"saldo","agg":"sum","input":"bi:dividas-receitas","joins":[{"source":"bi:dividas","left":"dividaId","right":"id","prefix":"j"}]},{"id":"p4","title":"Recuperação da dívida por receita","dim":"receita","measure":"pago","agg":"sum","input":"bi:pagamentos-detalhados-valores","where":["origem","Dívida ativa"]},{"id":"p5","title":"Receitas por bairro do imóvel","dim":"j.bairro","measure":"saldo","agg":"sum","input":"bi:dividas-receitas","joins":[{"source":"bi:dividas","left":"dividaId","right":"id","prefix":"d"},{"source":"bi:imoveis","left":"d.imovelId","right":"id","prefix":"j"}]}],"panelView":"api-bi-dividas-receitas","permissionViews":["divida"]},{"id":"base:dividas","source":"base","resource":"dividas","label":"Dívidas — cadastro complementar","view":"divida","panels":[{"id":"p1","title":"Dívidas por situação de cobrança","dim":"situacao","measure":"count","agg":"count","input":"base:dividas"},{"id":"p2","title":"Inscrições em dívida por período","dim":"month:inscricao","measure":"count","agg":"count","input":"base:dividas"},{"id":"p3","title":"Dívidas por contribuinte","dim":"nome","measure":"saldo","agg":"sum","input":"base:dividas"},{"id":"p4","title":"Dívidas por faixa de saldo","dim":"range:saldo","measure":"count","agg":"count","input":"base:dividas"},{"id":"p5","title":"Comparação de dívidas Base e BI","dim":"comparison","measure":"count","agg":"count","input":"base:dividas","compare":"bi:dividas","compareFields":["saldo","situacao","ano"]}],"panelView":"api-base-dividas","permissionViews":["divida"]},{"id":"base:encerramento-dividas","source":"base","resource":"encerramento-dividas","label":"Encerramento da dívida ativa","view":"divida","panels":[{"id":"p1","title":"Encerramentos por período","dim":"month:encerramento","measure":"count","agg":"count","input":"base:encerramento-dividas"},{"id":"p2","title":"Encerramentos por motivo","dim":"motivo","measure":"count","agg":"count","input":"base:encerramento-dividas"},{"id":"p3","title":"Valores encerrados","dim":"month:encerramento","measure":"valor","agg":"sum","input":"base:encerramento-dividas"},{"id":"p4","title":"Encerramentos por exercício de origem","dim":"ano","measure":"count","agg":"count","input":"base:encerramento-dividas"},{"id":"p5","title":"Dívidas encerradas e abertas","dim":"closingBalance","measure":"count","agg":"count","input":"base:encerramento-dividas","components":["valor","saldo"]}],"panelView":"api-base-encerramento-dividas","permissionViews":["divida","encerramento"]}]},{"id":"parcelamentos","label":"Parcelamentos","icon":"calendar-check-outline","cards":[{"id":"bi:parcelamentos","source":"bi","resource":"parcelamentos","label":"Parcelamentos","view":"parcelamentos","panels":[{"id":"p1","title":"Acordos por situação","dim":"situacao","measure":"count","agg":"count","input":"bi:parcelamentos"},{"id":"p2","title":"Acordos formalizados por período","dim":"month:formalizacao","measure":"count","agg":"count","input":"bi:parcelamentos"},{"id":"p3","title":"Valor negociado por período","dim":"month:formalizacao","measure":"valor","agg":"sum","input":"bi:parcelamentos","transform":"agreementAmounts","amounts":"bi:parcelamentos-parcelas","definition":"Valor negociado calculado pela soma dos valores das parcelas vinculadas; não representa saldo em aberto."},{"id":"p4","title":"Acordos por quantidade de parcelas","dim":"quantidadeParcelas","measure":"count","agg":"count","input":"bi:parcelamentos"},{"id":"p5","title":"Parcelamentos por contribuinte","dim":"nome","measure":"count","agg":"count","input":"bi:parcelamentos"}],"panelView":"api-bi-parcelamentos","permissionViews":["parcelamentos"]},{"id":"bi:parcelamentos-referentes","source":"bi","resource":"parcelamentos-referentes","label":"Referentes dos parcelamentos","view":"parcelamentos","panels":[{"id":"p1","title":"Acordos por tipo de obrigação de origem","dim":"origem","measure":"parcelamentoId","agg":"distinct","input":"bi:parcelamentos-referentes"},{"id":"p2","title":"Quantidade de obrigações por acordo","dim":"parcelamentoId","measure":"count","agg":"count","input":"bi:parcelamentos-referentes"},{"id":"p3","title":"Obrigações parceladas por exercício","dim":"ano","measure":"count","agg":"count","input":"bi:parcelamentos-referentes"},{"id":"p4","title":"Valor parcelado por receita","dim":"receita","measure":"valor","agg":"sum","input":"bi:parcelamentos-referentes"},{"id":"p5","title":"Débitos e dívida ativa nos acordos","dim":"origem","measure":"valor","agg":"sum","input":"bi:parcelamentos-referentes"}],"panelView":"api-bi-parcelamentos-referentes","permissionViews":["parcelamentos"]},{"id":"bi:parcelamentos-parcelas","source":"bi","resource":"parcelamentos-parcelas","label":"Parcelas dos parcelamentos","view":"parcelamentos","panels":[{"id":"p1","title":"Parcelas por situação","dim":"situacao","measure":"count","agg":"count","input":"bi:parcelamentos-parcelas"},{"id":"p2","title":"Parcelas por mês de vencimento","dim":"month:vencimento","measure":"count","agg":"count","input":"bi:parcelamentos-parcelas"},{"id":"p3","title":"Valores vencidos e a vencer","dim":"dueState","measure":"valor","agg":"sum","input":"bi:parcelamentos-parcelas"},{"id":"p4","title":"Atrasos por faixa de dias","dim":"aging:vencimento","measure":"count","agg":"count","input":"bi:parcelamentos-parcelas","where":["open",true]},{"id":"p5","title":"Evolução dos pagamentos por acordo","dim":"month:j.pagamento","measure":"j.pago","agg":"sum","input":"bi:pagamentos-parcelamentos","joins":[{"source":"bi:pagamentos","left":"pagamentoId","right":"id","prefix":"j"}]}],"panelView":"api-bi-parcelamentos-parcelas","permissionViews":["parcelamentos"]},{"id":"base:parcelamentos","source":"base","resource":"parcelamentos","label":"Parcelamentos — cadastro complementar","view":"parcelamentos","panels":[{"id":"p1","title":"Acordos por modalidade","dim":"modalidade","measure":"count","agg":"count","input":"base:parcelamentos"},{"id":"p2","title":"Acordos por situação","dim":"situacao","measure":"count","agg":"count","input":"base:parcelamentos"},{"id":"p3","title":"Acordos por faixa de valor","dim":"range:valor","measure":"count","agg":"count","input":"base:parcelamentos"},{"id":"p4","title":"Acordos por contribuinte","dim":"nome","measure":"count","agg":"count","input":"base:parcelamentos"},{"id":"p5","title":"Comparação de acordos Base e BI","dim":"comparison","measure":"count","agg":"count","input":"base:parcelamentos","compare":"bi:parcelamentos","compareFields":["valor","situacao","quantidadeParcelas"]}],"panelView":"api-base-parcelamentos","permissionViews":["parcelamentos"]},{"id":"base:parcelamentos-parcelas","source":"base","resource":"parcelamentos-parcelas","label":"Parcelas — cadastro complementar","view":"parcelamentos","panels":[{"id":"p1","title":"Calendário de vencimentos","dim":"month:vencimento","measure":"count","agg":"count","input":"base:parcelamentos-parcelas"},{"id":"p2","title":"Distribuição dos valores das parcelas","dim":"range:valor","measure":"count","agg":"count","input":"base:parcelamentos-parcelas"},{"id":"p3","title":"Parcelas por situação","dim":"situacao","measure":"count","agg":"count","input":"base:parcelamentos-parcelas"},{"id":"p4","title":"Parcelas em atraso por acordo","dim":"parcelamentoId","measure":"count","agg":"count","input":"base:parcelamentos-parcelas","where":["overdue",true]},{"id":"p5","title":"Comparação de parcelas Base e BI","dim":"comparison","measure":"count","agg":"count","input":"base:parcelamentos-parcelas","compare":"bi:parcelamentos-parcelas","compareFields":["valor","vencimento","situacao"]}],"panelView":"api-base-parcelamentos-parcelas","permissionViews":["parcelamentos"]}]},{"id":"itbi","label":"Transferências e ITBI","icon":"swap-horizontal","cards":[{"id":"bi:solicitacoes-transferencias-imoveis","source":"bi","resource":"solicitacoes-transferencias-imoveis","label":"Solicitações de transferência","view":"itbi","panels":[{"id":"p1","title":"Solicitações por período","dim":"month:solicitacao","measure":"count","agg":"count","input":"bi:solicitacoes-transferencias-imoveis"},{"id":"p2","title":"Solicitações por situação","dim":"situacao","measure":"count","agg":"count","input":"bi:solicitacoes-transferencias-imoveis"},{"id":"p3","title":"Solicitações por tipo de transmissão","dim":"tipo","measure":"count","agg":"count","input":"bi:solicitacoes-transferencias-imoveis"},{"id":"p4","title":"Solicitações por requerente","dim":"nome","measure":"count","agg":"count","input":"bi:solicitacoes-transferencias-imoveis"},{"id":"p5","title":"Tempo médio de tramitação","dim":"situacao","measure":"tramitation","agg":"average","input":"bi:solicitacoes-transferencias-imoveis","transform":"tramitation","events":"bi:solicitacoes-transferencias-imoveis-movimentacoes"}],"panelView":"api-bi-solicitacoes-transferencias-imoveis","permissionViews":["itbi"]},{"id":"bi:solicitacoes-transferencias-imoveis-itens","source":"bi","resource":"solicitacoes-transferencias-imoveis-itens","label":"Imóveis das solicitações","view":"itbi","panels":[{"id":"p1","title":"Quantidade de imóveis por solicitação","dim":"solicitacaoId","measure":"imovelId","agg":"distinct","input":"bi:solicitacoes-transferencias-imoveis-itens"},{"id":"p2","title":"Imóveis solicitados por bairro","dim":"j.bairro","measure":"imovelId","agg":"distinct","input":"bi:solicitacoes-transferencias-imoveis-itens","joins":[{"source":"bi:imoveis","left":"imovelId","right":"id","prefix":"j"}]},{"id":"p3","title":"Imóveis urbanos e rurais","dim":"j.zona","measure":"imovelId","agg":"distinct","input":"bi:solicitacoes-transferencias-imoveis-itens","joins":[{"source":"bi:imoveis","left":"imovelId","right":"id","prefix":"j"}]},{"id":"p4","title":"Participação transmitida por faixa","dim":"range:percentual","measure":"count","agg":"count","input":"bi:solicitacoes-transferencias-imoveis-itens"},{"id":"p5","title":"Valores dos imóveis por faixa","dim":"range:valor","measure":"count","agg":"count","input":"bi:solicitacoes-transferencias-imoveis-itens"}],"panelView":"api-bi-solicitacoes-transferencias-imoveis-itens","permissionViews":["itbi"]},{"id":"bi:solicitacoes-transferencias-imoveis-movimentacoes","source":"bi","resource":"solicitacoes-transferencias-imoveis-movimentacoes","label":"Movimentações das solicitações","view":"itbi","panels":[{"id":"p1","title":"Movimentações por etapa","dim":"etapa","measure":"count","agg":"count","input":"bi:solicitacoes-transferencias-imoveis-movimentacoes"},{"id":"p2","title":"Movimentações por período","dim":"month:movimentacao","measure":"count","agg":"count","input":"bi:solicitacoes-transferencias-imoveis-movimentacoes"},{"id":"p3","title":"Tempo médio em cada etapa","dim":"etapa","measure":"stageDays","agg":"average","input":"bi:solicitacoes-transferencias-imoveis-movimentacoes","transform":"stages"},{"id":"p4","title":"Solicitações sem movimentação recente","dim":"recent","measure":"count","agg":"count","input":"bi:solicitacoes-transferencias-imoveis","transform":"recent","events":"bi:solicitacoes-transferencias-imoveis-movimentacoes"},{"id":"p5","title":"Retornos e reaberturas","dim":"etapa","measure":"count","agg":"count","input":"bi:solicitacoes-transferencias-imoveis-movimentacoes","whereRegex":["etapa","retorn|reabert"]}],"panelView":"api-bi-solicitacoes-transferencias-imoveis-movimentacoes","permissionViews":["itbi"]},{"id":"bi:transferencias-imoveis","source":"bi","resource":"transferencias-imoveis","label":"Transferências de imóveis","view":"itbi","panels":[{"id":"p1","title":"Transferências por período","dim":"month:transferencia","measure":"count","agg":"count","input":"bi:transferencias-imoveis"},{"id":"p2","title":"Transferências por tipo","dim":"tipo","measure":"count","agg":"count","input":"bi:transferencias-imoveis"},{"id":"p3","title":"Transferências por bairro","dim":"j.bairro","measure":"count","agg":"count","input":"bi:transferencias-imoveis","joins":[{"source":"bi:imoveis","left":"imovelId","right":"id","prefix":"j"}]},{"id":"p4","title":"Imóveis transferidos mais de uma vez","dim":"countband","measure":"count","agg":"count","input":"bi:transferencias-imoveis","transform":"links","entity":"imovelId","linked":"id","minLinks":2},{"id":"p5","title":"Transferências por adquirente ou transmitente","dim":"parties","measure":"count","agg":"count","input":"bi:transferencias-imoveis","components":["adquirente","transmitente"],"partyMode":true}],"panelView":"api-bi-transferencias-imoveis","permissionViews":["imobiliario","itbi"]},{"id":"bi:transferencias-imoveis-compra","source":"bi","resource":"transferencias-imoveis-compra","label":"Compras vinculadas às transferências","view":"itbi","panels":[{"id":"p1","title":"Valor das compras por período","dim":"month:j.transferencia","measure":"valor","agg":"sum","input":"bi:transferencias-imoveis-compra","joins":[{"source":"bi:transferencias-imoveis","left":"transferenciaId","right":"id","prefix":"j"}]},{"id":"p2","title":"Compras por faixa de valor","dim":"range:valor","measure":"count","agg":"count","input":"bi:transferencias-imoveis-compra"},{"id":"p3","title":"Valor médio por bairro","dim":"j.bairro","measure":"valor","agg":"average","input":"bi:transferencias-imoveis-compra","joins":[{"source":"bi:transferencias-imoveis","left":"transferenciaId","right":"id","prefix":"t"},{"source":"bi:imoveis","left":"t.imovelId","right":"id","prefix":"j"}]},{"id":"p4","title":"Valor declarado e avaliação","dim":"component","measure":"count","agg":"count","input":"bi:transferencias-imoveis-compra","components":["valor","avaliacao"]},{"id":"p5","title":"Compras por adquirente","dim":"adquirente","measure":"valor","agg":"sum","input":"bi:transferencias-imoveis-compra"}],"panelView":"api-bi-transferencias-imoveis-compra","permissionViews":["itbi"]},{"id":"base:imoveis-transferencias","source":"base","resource":"imoveis-transferencias","label":"Transferências — cadastro complementar","view":"itbi","panels":[{"id":"p1","title":"Histórico de transferências por imóvel","dim":"imovelId","measure":"count","agg":"count","input":"base:imoveis-transferencias"},{"id":"p2","title":"Transferências por natureza","dim":"tipo","measure":"count","agg":"count","input":"base:imoveis-transferencias"},{"id":"p3","title":"Transferências por período","dim":"month:transferencia","measure":"count","agg":"count","input":"base:imoveis-transferencias"},{"id":"p4","title":"Transferências por região","dim":"j.bairro","measure":"count","agg":"count","input":"base:imoveis-transferencias","joins":[{"source":"bi:imoveis","left":"imovelId","right":"id","prefix":"j"}]},{"id":"p5","title":"Comparação de transferências Base e BI","dim":"comparison","measure":"count","agg":"count","input":"base:imoveis-transferencias","compare":"bi:transferencias-imoveis","compareFields":["imovelId","transferencia","tipo"]}],"panelView":"api-base-imoveis-transferencias","permissionViews":["imobiliario","itbi"]}]},{"id":"territorio","label":"Território e valores imobiliários","icon":"map-marker-outline","cards":[{"id":"base:bairros","source":"base","resource":"bairros","label":"Bairros","view":"territorio","panels":[{"id":"p1","title":"Bairros por distrito","dim":"j.nome","measure":"count","agg":"count","input":"base:bairros","joins":[{"source":"base:distritos","left":"distritoId","right":"id","prefix":"j"}]},{"id":"p2","title":"Imóveis por bairro","dim":"j.nome","measure":"count","agg":"count","input":"bi:imoveis","joins":[{"source":"base:bairros","left":"bairroId","right":"id","prefix":"j"}]},{"id":"p3","title":"Ruas por bairro","dim":"j.nome","measure":"count","agg":"count","input":"base:logradouros","joins":[{"source":"base:bairros","left":"bairroId","right":"id","prefix":"j"}]},{"id":"p4","title":"Cadastros econômicos por bairro","dim":"j.nome","measure":"count","agg":"count","input":"bi:economicos","joins":[{"source":"base:bairros","left":"bairroId","right":"id","prefix":"j"}]},{"id":"p5","title":"Arrecadação dos imóveis por bairro","dim":"j.bairro","measure":"pago","agg":"sum","input":"bi:pagamentos-detalhados","joins":[{"source":"bi:imoveis","left":"imovelId","right":"id","prefix":"j"}]}],"panelView":"api-base-bairros","permissionViews":["territorio"]},{"id":"base:distritos","source":"base","resource":"distritos","label":"Distritos","view":"territorio","panels":[{"id":"p1","title":"Bairros por distrito","dim":"j.nome","measure":"count","agg":"count","input":"base:bairros","joins":[{"source":"base:distritos","left":"distritoId","right":"id","prefix":"j"}]},{"id":"p2","title":"Imóveis por distrito","dim":"j.nome","measure":"count","agg":"count","input":"bi:imoveis","joins":[{"source":"base:distritos","left":"distritoId","right":"id","prefix":"j"}]},{"id":"p3","title":"Urbanos e rurais por distrito","dim":"districtZone","measure":"count","agg":"count","input":"bi:imoveis","joins":[{"source":"base:distritos","left":"distritoId","right":"id","prefix":"j"}]},{"id":"p4","title":"Cadastros econômicos por distrito","dim":"j.nome","measure":"count","agg":"count","input":"bi:economicos","joins":[{"source":"base:distritos","left":"distritoId","right":"id","prefix":"j"}]},{"id":"p5","title":"Arrecadação dos imóveis por distrito","dim":"j.nome","measure":"pago","agg":"sum","input":"bi:pagamentos-detalhados","joins":[{"source":"bi:imoveis","left":"imovelId","right":"id","prefix":"i"},{"source":"base:distritos","left":"i.distritoId","right":"id","prefix":"j"}]}],"panelView":"api-base-distritos","permissionViews":["territorio"]},{"id":"base:logradouros","source":"base","resource":"logradouros","label":"Ruas e logradouros","view":"territorio","panels":[{"id":"p1","title":"Logradouros por tipo","dim":"tipo","measure":"count","agg":"count","input":"base:logradouros"},{"id":"p2","title":"Logradouros por bairro","dim":"j.nome","measure":"count","agg":"count","input":"base:logradouros","joins":[{"source":"base:bairros","left":"bairroId","right":"id","prefix":"j"}]},{"id":"p3","title":"Imóveis por rua","dim":"j.nome","measure":"count","agg":"count","input":"bi:imoveis","joins":[{"source":"base:logradouros","left":"ruaId","right":"id","prefix":"j"}]},{"id":"p4","title":"Cadastros econômicos por rua","dim":"j.nome","measure":"count","agg":"count","input":"bi:economicos","joins":[{"source":"base:logradouros","left":"ruaId","right":"id","prefix":"j"}]},{"id":"p5","title":"Ruas com e sem imóveis vinculados","dim":"presence","measure":"count","agg":"count","input":"base:logradouros","presence":{"source":"bi:imoveis","left":"id","right":"ruaId"}}],"panelView":"api-base-logradouros","permissionViews":["territorio"]},{"id":"base:loteamentos","source":"base","resource":"loteamentos","label":"Loteamentos","view":"imobiliario","panels":[{"id":"p1","title":"Loteamentos por situação","dim":"situacao","measure":"count","agg":"count","input":"base:loteamentos"},{"id":"p2","title":"Loteamentos por localização","dim":"bairro","measure":"count","agg":"count","input":"base:loteamentos"},{"id":"p3","title":"Imóveis por loteamento","dim":"j.nome","measure":"count","agg":"count","input":"bi:imoveis","joins":[{"source":"base:loteamentos","left":"loteamentoId","right":"id","prefix":"j"}]},{"id":"p4","title":"Área dos terrenos por loteamento","dim":"j.nome","measure":"areaTerreno","agg":"sum","input":"base:imoveis","joins":[{"source":"base:loteamentos","left":"loteamentoId","right":"id","prefix":"j"}]},{"id":"p5","title":"Lotes com e sem construção","dim":"built","measure":"count","agg":"count","input":"base:imoveis","joins":[{"source":"base:loteamentos","left":"loteamentoId","right":"id","prefix":"j"}]}],"panelView":"api-base-loteamentos","permissionViews":["imobiliario","territorio"]},{"id":"base:planta-valores","source":"base","resource":"planta-valores","label":"Planta de valores","view":"imobiliario","panels":[{"id":"p1","title":"Valores por exercício de vigência","dim":"ano","measure":"metroQuadrado","agg":"average","input":"base:planta-valores"},{"id":"p2","title":"Valores por região ou zona","dim":"regiao","measure":"metroQuadrado","agg":"average","input":"base:planta-valores"},{"id":"p3","title":"Distribuição do preço por m²","dim":"range:metroQuadrado","measure":"count","agg":"count","input":"base:planta-valores"},{"id":"p4","title":"Variação dos valores entre exercícios","dim":"ano","measure":"metroQuadrado","agg":"change","input":"base:planta-valores","series":"regiao"},{"id":"p5","title":"Imóveis com e sem referência na planta","dim":"presence","measure":"count","agg":"count","input":"base:imoveis","presence":{"source":"base:planta-valores","left":"plantaId","right":"id"}}],"panelView":"api-base-planta-valores","permissionViews":["imobiliario"]}]},{"id":"obras","label":"Obras","icon":"office-building-outline","cards":[{"id":"base:obras","source":"base","resource":"obras","label":"Obras","view":"obras","panels":[{"id":"p1","title":"Obras por situação","dim":"situacao","measure":"count","agg":"count","input":"base:obras"},{"id":"p2","title":"Obras por tipo","dim":"tipo","measure":"count","agg":"count","input":"base:obras"},{"id":"p3","title":"Obras por bairro","dim":"bairro","measure":"count","agg":"count","input":"base:obras"},{"id":"p4","title":"Área das obras por faixa","dim":"range:areaConstruida","measure":"count","agg":"count","input":"base:obras"},{"id":"p5","title":"Obras cadastradas por período","dim":"month:cadastro","measure":"count","agg":"count","input":"base:obras"}],"panelView":"api-base-obras","permissionViews":["obras"]},{"id":"base:obras-responsaveis","source":"base","resource":"obras-responsaveis","label":"Responsáveis pela execução de obras","view":"obras","panels":[{"id":"p1","title":"Obras por responsável","dim":"nome","measure":"obraId","agg":"distinct","input":"base:obras-responsaveis"},{"id":"p2","title":"Responsáveis por função","dim":"funcao","measure":"count","agg":"count","input":"base:obras-responsaveis"},{"id":"p3","title":"Quantidade de responsáveis por obra","dim":"obraId","measure":"pessoaId","agg":"distinct","input":"base:obras-responsaveis"},{"id":"p4","title":"Responsáveis por tipo de obra","dim":"j.tipo","measure":"pessoaId","agg":"distinct","input":"base:obras-responsaveis","joins":[{"source":"base:obras","left":"obraId","right":"id","prefix":"j"}]},{"id":"p5","title":"Obras com e sem responsável","dim":"presence","measure":"count","agg":"count","input":"base:obras","presence":{"source":"base:obras-responsaveis","left":"id","right":"obraId"}}],"panelView":"api-base-obras-responsaveis","permissionViews":["obras"]}]},{"id":"indexadores","label":"Indexadores","icon":"currency-usd","cards":[{"id":"bi:indexadores","source":"bi","resource":"indexadores","label":"Indexadores","view":"indexadores","panels":[{"id":"p1","title":"Indexadores por tipo","dim":"tipo","measure":"count","agg":"count","input":"bi:indexadores"},{"id":"p2","title":"Indexadores por situação","dim":"situacao","measure":"count","agg":"count","input":"bi:indexadores"},{"id":"p3","title":"Indexadores com e sem valores","dim":"presence","measure":"count","agg":"count","input":"bi:indexadores","presence":{"source":"bi:indexadores-valores","left":"id","right":"indexadorId"}},{"id":"p4","title":"Cobertura histórica dos indexadores","dim":"j.nome","measure":"dataValor","agg":"distinct","input":"bi:indexadores-valores","joins":[{"source":"bi:indexadores","left":"indexadorId","right":"id","prefix":"j"}]},{"id":"p5","title":"Indexadores com valores desatualizados","dim":"recent","measure":"count","agg":"count","input":"bi:indexadores","transform":"recent","events":"bi:indexadores-valores","eventKey":"indexadorId","eventDate":"dataValor"}],"panelView":"api-bi-indexadores","permissionViews":["indexadores"]},{"id":"bi:indexadores-valores","source":"bi","resource":"indexadores-valores","label":"Valores dos indexadores","view":"indexadores","panels":[{"id":"p1","title":"Evolução histórica dos valores","dim":"month:dataValor","measure":"valor","agg":"average","input":"bi:indexadores-valores","series":"indexadorId"},{"id":"p2","title":"Variação percentual mensal","dim":"month:dataValor","measure":"valor","agg":"change","input":"bi:indexadores-valores","series":"indexadorId"},{"id":"p3","title":"Variação percentual anual","dim":"year:dataValor","measure":"valor","agg":"change","input":"bi:indexadores-valores","series":"indexadorId"},{"id":"p4","title":"Comparação percentual entre indexadores","dim":"month:dataValor","measure":"valor","agg":"indexed","input":"bi:indexadores-valores","series":"indexadorId"},{"id":"p5","title":"Períodos sem valor cadastrado","dim":"missingPeriod","measure":"count","agg":"count","input":"bi:indexadores-valores","transform":"missingPeriods"}],"panelView":"api-bi-indexadores-valores","permissionViews":["indexadores"]}]}]};

function homeCatalog(auth) {
  const allowed=permissionViewsForAccess(auth?.access);
  return API_PANEL_CATALOG.groups.map(group=>({...group,cards:group.cards.filter(card=>{
    try {requireDataPermission(auth,card.source,card.resource);return true;} catch {return false;}
  }).map(card=>({...card,view:allowed.includes(card.view)?card.view:(DATA_PERMISSION_VIEWS[card.id]||[]).find(view=>allowed.includes(view))||"visao-geral"}))})).filter(group=>group.cards.length);
}
async function buildHomeGroupSummary(env,tenant,auth,groupId) {
  const group=homeCatalog(auth).find(group=>group.id===groupId);
  if(!group) throw new Error("DATA_RESOURCE_PERMISSION_DENIED");
  const config=await syncConfig(env,tenant);
  if(config.latestJob||config.activeJob){const job=await syncJob(env,tenant,config.latestJob||config.activeJob);if(job)return {group:group.id,sync:publicSyncJob(job),cards:group.cards.map(card=>{const source=job.sources[card.id];return {id:card.id,count:source?.error?null:source?.loaded??null,partial:source?!source.complete:false,state:source?.error?'unavailable':!source?job.state==='running'?'loading':'unavailable':source.complete?'complete':'partial'};})};}
  if(config.enabled)return {group:group.id,cards:group.cards.map(card=>({id:card.id,count:null,partial:false,state:'loading'}))};
  const cards=new Array(group.cards.length);
  let next=0;
  await Promise.all(Array.from({length:Math.min(4,group.cards.length)},async()=>{
    while(next<group.cards.length) {
      const index=next++,card=group.cards[index];
      try {
        const result=await fetchBethaRows({...env,BI_SOURCE_TIMEOUT_MS:6000},tenant,card.source,card.resource,{limit:250,maxPages:1});
        const suspicious=result.hasMore&&result.reportedTotal===result.loaded+1;
        const known=!suspicious&&result.reportedTotal!==null&&result.reportedTotal>=result.loaded&&!(result.hasMore&&result.reportedTotal===result.loaded);
        cards[index]={id:card.id,count:result.complete?result.loaded:known?result.reportedTotal:result.loaded,partial:!result.complete&&!known,state:result.complete?"complete":known?"reported":"partial",updatedAt:new Date().toISOString()};
      } catch(error) {
        cards[index]={id:card.id,count:null,partial:false,state:"unavailable",error:error.message,updatedAt:new Date().toISOString()};
      }
    }
  }));
  return {group:group.id,cards};
}

const FORWARDED_QUERY_PARAMS = new Set(["offset","limit","filter","fields","cpaFields","sort"]);

async function persistSupabaseCache(env,body) {
  if (!env.SUPABASE_CACHE_KEY) {
    return {ok:false,skipped:true,error:"SUPABASE_CACHE_KEY_NOT_CONFIGURED"};
  }

  const response=await fetch(SUPABASE_CACHE_WRITE_URL,{
    method:"POST",
    headers:{
      "content-type":"application/json",
      "x-bi-cache-key":String(env.SUPABASE_CACHE_KEY)
    },
    body:JSON.stringify(body)
  });

  const data=await response.json().catch(()=>({}));
  if(!response.ok){
    const error=new Error(data.error||("SUPABASE_CACHE_HTTP_"+response.status));
    error.status=response.status;
    error.detail=data.detail||null;
    throw error;
  }
  return data;
}

async function persistBackgroundSourceProgress(env,tenant,job,card,entry,page=null){
  const now=new Date().toISOString();
  const status=entry.error?"error":entry.complete?"complete":"partial";
  return persistSupabaseCache(env,{
    snapshot:{
      tenant_id:tenant.id,
      painel:"__sync__",
      periodo:"todos",
      exercicio:new Date().getFullYear(),
      fonte:card.id,
      payload_json:{
        source:card.id,
        syncRunId:job.id,
        registrosCarregados:Number(entry.loaded||0),
        paginas:Number(entry.pages||0),
        nextOffset:entry.nextOffset??null,
        completo:entry.complete===true,
        error:entry.error||null,
        errorDetail:entry.errorDetail||null,
        pageNo:page?.pageNo??null,
        rows:page?.rows||undefined,
        updatedAt:now
      },
      status
    },
    progress:[{
      tenant_id:tenant.id,
      painel:"__sync__",
      periodo:"todos",
      exercicio:new Date().getFullYear(),
      fonte:card.id,
      registros_carregados:Number(entry.loaded||0),
      paginas:Number(entry.pages||0),
      next_offset:entry.nextOffset??null,
      completo:entry.complete===true,
      reported_total:entry.reportedTotal??null,
      status,
      detalhe:{
        syncRunId:job.id,
        error:entry.error||null,
        errorDetail:entry.errorDetail||null,
        pageSize:entry.pageSize||null,
        retryCount:entry.retryCount||0
      }
    }]
  });
}

async function persistBackgroundJobSummary(env,tenant,job){
  const status=job.state==="completed"?"complete":"partial";
  return persistSupabaseCache(env,{
    snapshot:{
      tenant_id:tenant.id,
      painel:"__sync__",
      periodo:"todos",
      exercicio:new Date().getFullYear(),
      fonte:"job",
      payload_json:{
        syncRunId:job.id,
        state:job.state,
        startedAt:job.startedAt,
        finishedAt:job.finishedAt||null,
        completedSources:Number(job.completed||0),
        totalSources:Number(job.total||0),
        rows:Number(job.rows||0),
        failures:job.failures||[],
        persistenceFailures:job.persistenceFailures||[],
        updatedAt:new Date().toISOString()
      },
      status
    },
    progress:[]
  });
}

async function persistApiPanelSnapshot(env,tenant,card,url,payload){
  const hasFilters=[...url.searchParams].some(([key,value])=>key.startsWith("panel_")&&value);
  if(hasFilters)return {ok:false,skipped:true,error:"FILTERED_PANEL_NOT_CACHED"};
  const audits=Object.values(payload?.meta?.sourceAudit||{});
  const complete=audits.length>0&&audits.every(a=>a&&a.complete===true);
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const progress=Object.entries(payload?.meta?.sourceAudit||{}).map(([fonte,audit])=>({
    tenant_id:tenant.id,
    painel:card.panelView,
    periodo,
    exercicio,
    fonte,
    registros_carregados:Number(audit?.loaded||0),
    paginas:Number(audit?.pages||0),
    next_offset:audit?.nextOffset??null,
    completo:audit?.complete===true,
    reported_total:audit?.reportedTotal??null,
    status:audit?.error?"error":audit?.complete===true?"complete":"partial",
    detalhe:{error:audit?.error||null}
  }));
  return persistSupabaseCache(env,{
    snapshot:{
      tenant_id:tenant.id,
      painel:card.panelView,
      periodo,
      exercicio,
      fonte:"auto",
      payload_json:{...payload,meta:{...(payload.meta||{}),cachedInSupabase:true}},
      status:complete?"complete":"partial"
    },
    progress
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const raw = env.ALLOWED_ORIGINS || "";
  const allowed = new Set(
    String(raw).split(",").map(v => v.trim()).filter(Boolean)
  );
  // Production UI must remain allowed even when ALLOWED_ORIGINS is configured
  // in Cloudflare with an older/stale value. The Worker also proxies the
  // frontend, so same-origin POSTs legitimately arrive from workers.dev.
  allowed.add("https://uelitonbueno-creator.github.io");
  try { allowed.add(new URL(request.url).origin); } catch {}
  const allowOrigin = allowed.has(origin) ? origin : "";
  return {
    ...(allowOrigin ? {"Access-Control-Allow-Origin": allowOrigin} : {}),
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Accept,Authorization,X-Tenant-Id,MCP-Protocol-Version,Mcp-Method,Mcp-Name,Mcp-Session-Id,Last-Event-ID",
    "Vary": "Origin",
    "Cache-Control": "no-store"
  };
}

function json(request, env, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {"Content-Type":"application/json; charset=utf-8", ...corsHeaders(request, env)}
  });
}

function parseJsonObject(value, fallback={}) {
  if (!value) return fallback;
  try {
    const parsed=JSON.parse(value);
    return parsed && typeof parsed==="object" && !Array.isArray(parsed) ? parsed : fallback;
  } catch { return fallback; }
}

function getTenantId(request,url) {
  return (request.headers.get("X-Tenant-Id") || url.searchParams.get("tenant") || "").trim();
}

const TENANT_CONFIG_PREFIX="tenant-config:v1:";

async function tenantConfigKey(env) {
  if(!env.BETHA_TENANT_CONFIG_KEY) throw new Error("TENANT_CONFIG_KEY_REQUIRED");
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(env.BETHA_TENANT_CONFIG_KEY));
  return crypto.subtle.importKey("raw",digest,{name:"AES-GCM"},false,["encrypt","decrypt"]);
}
async function encodeTenantConfig(env,id,config) {
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const encrypted=await crypto.subtle.encrypt({name:"AES-GCM",iv,additionalData:new TextEncoder().encode(id)},await tenantConfigKey(env),new TextEncoder().encode(JSON.stringify(config)));
  return JSON.stringify({iv:Array.from(iv),data:Array.from(new Uint8Array(encrypted))});
}
async function decodeTenantConfig(env,id,value) {
  const envelope=typeof value==="string"?JSON.parse(value):value;
  const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:new Uint8Array(envelope.iv),additionalData:new TextEncoder().encode(id)},await tenantConfigKey(env),new Uint8Array(envelope.data));
  return JSON.parse(new TextDecoder().decode(plain));
}
async function tenantRegistry(env) {
  const registry=parseJsonObject(env.BETHA_TENANTS_JSON,{});

  // Legacy KV remains read-only fallback for configurations already saved there.
  if(env.BI_SESSIONS) {
    try {
      let cursor;
      do {
        const page=await env.BI_SESSIONS.list({prefix:TENANT_CONFIG_PREFIX,...(cursor?{cursor}: {})});
        for(const entry of page.keys||[]) {
          const id=entry.name.slice(TENANT_CONFIG_PREFIX.length);
          const stored=await env.BI_SESSIONS.get(entry.name);
          if(!stored) continue;
          try { registry[id]=await decodeTenantConfig(env,id,stored); } catch {}
        }
        cursor=page.list_complete===false?page.cursor:null;
      } while(cursor);
    } catch {}
  }

  // D1 is the primary persistent store for new/updated tenant configurations.
  if(env.AUTH_DB) {
    try {
      const rows=await env.AUTH_DB.prepare(
        "SELECT id,payload FROM bi_tenant_configs ORDER BY id"
      ).all();
      for(const row of rows.results||[]) {
        try { registry[String(row.id)]=await decodeTenantConfig(env,String(row.id),row.payload); } catch {}
      }
    } catch {}
  }

  return registry;
}

async function storedTenantConfig(env,tenantId) {
  if(env.AUTH_DB) {
    try {
      const row=await env.AUTH_DB.prepare(
        "SELECT payload FROM bi_tenant_configs WHERE id=?1 LIMIT 1"
      ).bind(String(tenantId)).first();
      if(row&&row.payload) return decodeTenantConfig(env,String(tenantId),row.payload);
    } catch {}
  }
  if(env.BI_SESSIONS) {
    try {
      const stored=await env.BI_SESSIONS.get(TENANT_CONFIG_PREFIX+tenantId);
      if(stored) return decodeTenantConfig(env,String(tenantId),stored);
    } catch {}
  }
  return null;
}

async function persistTenantConfig(env,id,config) {
  const encoded=await encodeTenantConfig(env,id,config);
  if(env.AUTH_DB) {
    await env.AUTH_DB.prepare(
      "INSERT INTO bi_tenant_configs (id,payload,updated_at) VALUES (?1,?2,?3) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at"
    ).bind(String(id),encoded,String(config.updatedAt||new Date().toISOString())).run();
    return;
  }
  if(env.BI_SESSIONS) {
    await env.BI_SESSIONS.put(TENANT_CONFIG_PREFIX+id,encoded);
    return;
  }
  throw new Error("SESSION_STORE_NOT_CONFIGURED");
}
function publicTenantConfig(id,config,env) {
  return {id,name:config.name||id,entityId:String(config.entityId||""),databaseId:String(config.databaseId||""),enabled:config.enabled!==false,userAccessConfigured:Boolean(config.userAccess),accessTokenConfigured:Boolean(config.accessToken||env.BETHA_ACCESS_TOKEN),usesSharedToken:!config.accessToken,updatedAt:config.updatedAt||null};
}
function validateTenantConfig(input,previous={}) {
  const id=String(input.id||"").trim();
  if(!/^[a-z0-9][a-z0-9_-]{1,79}$/.test(id)) throw new Error("TENANT_CONFIG_INVALID");
  const config={...previous,name:String(input.name||"").trim(),entityId:String(input.entityId||"").trim(),databaseId:String(input.databaseId||"").trim(),enabled:input.enabled!==false};
  if(!config.name||config.name.length>160||!/^\d+$/.test(config.entityId)||!/^\d+$/.test(config.databaseId)) throw new Error("TENANT_CONFIG_INVALID");
  for(const key of ["userAccess","accessToken"]) {
    const value=String(input[key]||"").trim();
    if(value.length>8192||/[\r\n]/.test(value)) throw new Error("TENANT_CONFIG_INVALID");
    if(value) config[key]=value;
  }
  if(input.useSharedToken===true) delete config.accessToken;
  if(!config.userAccess) throw new Error("TENANT_USER_ACCESS_NOT_CONFIGURED");
  return {id,config};
}
function requireTenantConfigAdmin(auth) {
  requireConstraintPermission(auth,"BIConfiguracoesPage");
  if(auth?.access?.admin!==true&&auth?.access?.technical!==true) throw new Error("TENANT_CONFIG_FORBIDDEN");
}

async function resolveTenant(env, tenantId) {
  if (!tenantId) throw new Error("TENANT_REQUIRED");
  const tenants=parseJsonObject(env.BETHA_TENANTS_JSON,{});
  const stored=await storedTenantConfig(env,tenantId);
  const tenant=stored||tenants[tenantId];
  if (!tenant || tenant.enabled===false) throw new Error("TENANT_NOT_FOUND");
  if (!tenant.userAccess) throw new Error("TENANT_USER_ACCESS_NOT_CONFIGURED");
  return {
    id:tenantId,
    name:tenant.name || tenantId,
    entityId:tenant.entityId ? String(tenant.entityId) : null,
    databaseId:tenant.databaseId ? String(tenant.databaseId) : null,
    userAccess:tenant.userAccess,
    accessToken:tenant.accessToken || env.BETHA_ACCESS_TOKEN || ""
  };
}

function bytesToBase64Url(bytes) {
  let binary="";
  for (const b of bytes) binary+=String.fromCharCode(b);
  return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}

function base64UrlToBytes(value) {
  let normalized=String(value||"").replace(/-/g,"+").replace(/_/g,"/");
  while (normalized.length%4) normalized+="=";
  const binary=atob(normalized);
  const out=new Uint8Array(binary.length);
  for (let i=0;i<binary.length;i++) out[i]=binary.charCodeAt(i);
  return out;
}

async function sessionKey(secret) {
  if (!secret) throw new Error("LOGIN_CLIENT_SECRET_NOT_CONFIGURED");
  const raw=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw",raw,{name:"AES-GCM"},false,["encrypt","decrypt"]);
}

async function sealSession(payload, secret) {
  const key=await sessionKey(secret);
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const plain=new TextEncoder().encode(JSON.stringify(payload));
  const encrypted=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,plain);
  return "v1."+bytesToBase64Url(iv)+"."+bytesToBase64Url(new Uint8Array(encrypted));
}

async function openSession(token, secret) {
  const parts=String(token||"").split(".");
  if (parts.length!==3 || parts[0]!=="v1") throw new Error("APPLICATION_SESSION_INVALID");
  try {
    const key=await sessionKey(secret);
    const iv=base64UrlToBytes(parts[1]);
    const encrypted=base64UrlToBytes(parts[2]);
    const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv},key,encrypted);
    const payload=JSON.parse(new TextDecoder().decode(plain));
    if (!payload || !payload.accessToken) throw new Error("APPLICATION_SESSION_INVALID");
    if (payload.exp && Date.now()>=Number(payload.exp)) throw new Error("APPLICATION_SESSION_EXPIRED");
    return payload;
  } catch(error) {
    if (error.message==="APPLICATION_SESSION_EXPIRED") throw error;
    throw new Error("APPLICATION_SESSION_INVALID");
  }
}

async function oauthStateKey(secret) {
  if (!secret) throw new Error("LOGIN_CLIENT_SECRET_NOT_CONFIGURED");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {name:"HMAC",hash:"SHA-256"},
    false,
    ["sign","verify"]
  );
}

async function createOAuthState(secret) {
  const ts=Date.now().toString(36);
  const nonce=bytesToBase64Url(crypto.getRandomValues(new Uint8Array(12)));
  const payload=ts+"."+nonce;
  const key=await oauthStateKey(secret);
  const sig=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(payload));
  return payload+"."+bytesToBase64Url(new Uint8Array(sig));
}

async function validateOAuthState(state, secret) {
  const parts=String(state||"").split(".");
  if (parts.length!==3) throw new Error("OAUTH_STATE_INVALID");

  const [ts,nonce,signature]=parts;
  const created=parseInt(ts,36);
  if (!Number.isFinite(created) || Date.now()-created>10*60*1000 || created>Date.now()+60*1000) {
    throw new Error("OAUTH_STATE_INVALID");
  }

  const payload=ts+"."+nonce;
  const key=await oauthStateKey(secret);
  const valid=await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToBytes(signature),
    new TextEncoder().encode(payload)
  );
  if (!valid) throw new Error("OAUTH_STATE_INVALID");
  return true;
}

function devSessionSecret(env) {
  return env.BI_DEV_SESSION_SECRET || env.BETHA_LOGIN_CLIENT_SECRET || "";
}

function normalizeDevCredential(value) {
  let text=String(value ?? "").trim();
  if (
    text.length>=2 &&
    ((text.startsWith('"') && text.endsWith('"')) ||
     (text.startsWith("'") && text.endsWith("'")))
  ) {
    text=text.slice(1,-1).trim();
  }
  return text;
}

async function devHmacKey(secret) {
  if (!secret) throw new Error("DEV_SESSION_SECRET_NOT_CONFIGURED");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {name:"HMAC",hash:"SHA-256"},
    false,
    ["sign","verify"]
  );
}

async function createDevSession(env, username) {
  const secret=devSessionSecret(env);
  if (!secret) throw new Error("DEV_SESSION_SECRET_NOT_CONFIGURED");

  const payload={
    v:1,
    u:String(username||""),
    exp:Date.now()+8*60*60*1000
  };

  const encoded=bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key=await devHmacKey(secret);
  const signature=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(encoded));

  return "d1."+encoded+"."+bytesToBase64Url(new Uint8Array(signature));
}

async function validateDevSession(request, env) {
  const header=request.headers.get("Authorization") || "";
  const match=header.match(/^DevSession\s+(.+)$/i);
  if (!match) throw new Error("DEV_SESSION_REQUIRED");

  const secret=devSessionSecret(env);
  if (!secret) throw new Error("DEV_SESSION_SECRET_NOT_CONFIGURED");

  const token=match[1].trim();
  const parts=token.split(".");
  if (parts.length!==3 || parts[0]!=="d1") throw new Error("DEV_SESSION_INVALID");

  try {
    const encoded=parts[1];
    const signature=base64UrlToBytes(parts[2]);
    const key=await devHmacKey(secret);
    const valid=await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(encoded)
    );
    if (!valid) throw new Error("DEV_SESSION_INVALID");

    const payload=JSON.parse(new TextDecoder().decode(base64UrlToBytes(encoded)));
    if (!payload || payload.v!==1 || !payload.u) throw new Error("DEV_SESSION_INVALID");
    if (!payload.exp || Date.now()>=Number(payload.exp)) throw new Error("DEV_SESSION_EXPIRED");

    return {
      kind:"dev-session",
      username:String(payload.u),
      exp:Number(payload.exp)
    };
  } catch(error) {
    if (error.message==="DEV_SESSION_EXPIRED") throw error;
    throw new Error("DEV_SESSION_INVALID");
  }
}

function readCookie(request,name) {
  const raw=request.headers.get("Cookie") || "";
  for (const part of raw.split(";")) {
    const idx=part.indexOf("=");
    if (idx<0) continue;
    const key=part.slice(0,idx).trim();
    if (key!==name) continue;
    try { return decodeURIComponent(part.slice(idx+1).trim()); }
    catch { return part.slice(idx+1).trim(); }
  }
  return "";
}

function sessionCookieHeader(sessionId,maxAge) {
  const seconds=Math.max(0,Number(maxAge)||0);
  return [
    SESSION_COOKIE+"="+encodeURIComponent(sessionId||""),
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age="+seconds
  ].join("; ");
}

function createSessionId() {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

function authSessionStores(env) {
  return [env.AUTH_SESSIONS,env.BI_SESSIONS].filter((store,index,list)=>store&&list.indexOf(store)===index);
}

async function createStoredSession(env,accessToken,ttlSeconds) {
  if (!env.AUTH_DB && !env.AUTH_SESSIONS && !env.BI_SESSIONS) throw new Error("SESSION_STORE_NOT_CONFIGURED");
  if (!accessToken) throw new Error("USER_TOKEN_REQUIRED");

  const ttl=Math.max(60,Math.min(Number(ttlSeconds)||8*60*60,8*60*60));
  const sid=createSessionId();
  const exp=Date.now()+ttl*1000;
  const payload=JSON.stringify({kind:"user-session",accessToken,exp});

  if (env.AUTH_DB) {
    await env.AUTH_DB.prepare(
      "INSERT OR REPLACE INTO sessions (sid,payload,exp) VALUES (?1,?2,?3)"
    ).bind(sid,payload,exp).run();
    return {sid,exp,ttl};
  }

  const store=env.AUTH_SESSIONS || env.BI_SESSIONS;
  await store.put("session:"+sid,payload,{expirationTtl:ttl});
  return {sid,exp,ttl};
}

async function readStoredSession(request,env) {
  if (!env.AUTH_DB && !env.AUTH_SESSIONS && !env.BI_SESSIONS) throw new Error("SESSION_STORE_NOT_CONFIGURED");

  const sid=readCookie(request,SESSION_COOKIE);
  if (!sid) return null;

  if (env.AUTH_DB) {
    const row=await env.AUTH_DB.prepare(
      "SELECT payload,exp FROM sessions WHERE sid=?1 LIMIT 1"
    ).bind(sid).first();
    if (row && row.payload) {
      try {
        const payload=JSON.parse(String(row.payload));
        const exp=Number(row.exp||payload.exp||0);
        if (!payload.accessToken || (exp && Date.now()>=exp)) {
          await env.AUTH_DB.prepare("DELETE FROM sessions WHERE sid=?1").bind(sid).run().catch(()=>{});
          return null;
        }
        return {sid,...payload};
      } catch {
        await env.AUTH_DB.prepare("DELETE FROM sessions WHERE sid=?1").bind(sid).run().catch(()=>{});
        return null;
      }
    }
  }

  for (const store of authSessionStores(env)) {
    const raw=await store.get("session:"+sid);
    if (!raw) continue;
    try {
      const payload=JSON.parse(raw);
      if (!payload || !payload.accessToken) {
        await store.delete("session:"+sid).catch(()=>{});
        return null;
      }
      if (payload.exp && Date.now()>=Number(payload.exp)) {
        await store.delete("session:"+sid).catch(()=>{});
        return null;
      }
      return {sid,...payload};
    } catch {
      await store.delete("session:"+sid).catch(()=>{});
      return null;
    }
  }
  return null;
}

async function destroyStoredSession(request,env) {
  const sid=readCookie(request,SESSION_COOKIE);
  if (!sid) return;
  if (env.AUTH_DB) {
    await env.AUTH_DB.prepare("DELETE FROM sessions WHERE sid=?1").bind(sid).run().catch(()=>{});
  }
  for (const store of authSessionStores(env)) {
    await store.delete("session:"+sid).catch(()=>{});
  }
}

async function serverAuthState(request,env) {
  try {
    const sid=readCookie(request,SESSION_COOKIE);
    const session=await readStoredSession(request,env);

    if (session) {
      await authTrace(env,"ROOT_SESSION_FOUND",{cookiePresent:Boolean(sid),sidLength:sid.length});
      return {authenticated:true,reason:"",kind:String(session.kind||"user-session")};
    }

    await authTrace(env,"ROOT_SESSION_MISSING",{cookiePresent:Boolean(sid),sidLength:sid.length});
    return {authenticated:false,reason:"NO_SESSION_COOKIE",kind:""};
  } catch(error) {
    await authTrace(env,"ROOT_SESSION_ERROR",{code:error && error.message ? error.message : "SESSION_STORE_FAILED"});
    return {
      authenticated:false,
      reason:error && error.message ? error.message : "SESSION_STORE_FAILED",
      kind:""
    };
  }
}

async function authTrace(env,stage,meta={}) {
  if (!env.BI_SESSIONS) return;
  try {
    const key="debug:auth:last";
    const raw=await env.BI_SESSIONS.get(key);
    let events=[];
    if (raw) {
      try { events=JSON.parse(raw); } catch {}
    }
    if (!Array.isArray(events)) events=[];
    events.push({
      ts:new Date().toISOString(),
      stage:String(stage||""),
      meta:meta && typeof meta==="object" ? meta : {}
    });
    events=events.slice(-25);
    await env.BI_SESSIONS.put(key,JSON.stringify(events),{expirationTtl:3600});
  } catch {}
}

async function proxyFront(request,env) {
  const incoming=new URL(request.url);
  const sourcePath=incoming.pathname==="/" ? "/" : incoming.pathname;
  const target=new URL(FRONT_SOURCE_BASE+sourcePath);
  target.search=incoming.search;

  const accept=request.headers.get("Accept") || "*/*";
  const source=await fetch(target.toString(),{
    method:"GET",
    headers:{"Accept":accept},
    redirect:"follow"
  });

  const headers=new Headers(source.headers);
  headers.delete("Set-Cookie");
  headers.set("X-BI-Front-Proxy","cloudflare-worker");

  const isHtml=
    incoming.pathname==="/" ||
    incoming.pathname.endsWith(".html") ||
    String(source.headers.get("Content-Type")||"").includes("text/html");

  if (isHtml) {
    headers.set("Cache-Control","no-store");
    headers.delete("Content-Length");

    let html=await source.text();
    const auth=await serverAuthState(request,env);
    const marker=
      '<script>window.__BI_SERVER_AUTH='+JSON.stringify({
        authenticated:auth.authenticated,
        reason:auth.reason,
        kind:auth.kind
      })+';<\/script>';

    if (html.includes("</head>")) {
      html=html.replace("</head>",marker+"</head>");
    } else {
      html=marker+html;
    }

    return new Response(html,{
      status:source.status,
      statusText:source.statusText,
      headers
    });
  }

  if (incoming.pathname.endsWith(".js")) {
    headers.set("Cache-Control","no-store");
  }

  return new Response(source.body,{
    status:source.status,
    statusText:source.statusText,
    headers
  });
}

async function getUserToken(request, env) {
  const header=request.headers.get("Authorization") || "";
  const sessionMatch=header.match(/^Session\s+(.+)$/i);
  if (sessionMatch) {
    const session=await openSession(sessionMatch[1].trim(),env.BETHA_LOGIN_CLIENT_SECRET);
    return session.accessToken;
  }

  const storedSession=await readStoredSession(request,env);
  if (storedSession && storedSession.accessToken) {
    return storedSession.accessToken;
  }

  // Compatibilidade temporária durante a migração.
  const bearerMatch=header.match(/^Bearer\s+(.+)$/i);
  return bearerMatch ? bearerMatch[1].trim() : "";
}

async function readJsonResponse(response) {
  const text=await response.text();
  let body=null;
  try { body=text ? JSON.parse(text) : null; } catch { body=text; }
  return {body,text};
}

async function platformRequest(url, options={}) {
  const response=await fetch(url,options);
  const parsed=await readJsonResponse(response);
  if (!response.ok) {
    const error=new Error("PLATFORM_HTTP_"+response.status);
    error.status=response.status;
    error.remoteBody=typeof parsed.body==="string" ? parsed.body.slice(0,500) : parsed.body;
    throw error;
  }
  return parsed.body;
}

async function getUserAccesses(userToken) {
  if (!userToken) throw new Error("USER_TOKEN_REQUIRED");
  const payload=await platformRequest(
    AUTH_BASE+"/user-accounts/v0.1/api/suite/users/@me/access",
    {headers:{"Accept":"application/json","Authorization":"Bearer "+userToken}}
  );
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.content)) return payload.content;
  return [];
}

function parseContextString(context) {
  if (!context || typeof context!=="string") return {};
  try {
    let normalized=context.replace(/-/g,"+").replace(/_/g,"/");
    while(normalized.length%4) normalized+="=";
    const decoded=atob(normalized);
    const out={};
    decoded.split(",").forEach(part=>{
      const idx=part.indexOf(":");
      if(idx>0) out[part.slice(0,idx).trim()]=part.slice(idx+1).trim();
    });
    return out;
  } catch { return {}; }
}

function accessValues(access) {
  const values=(access && access.values && typeof access.values==="object") ? access.values : {};
  const decoded=parseContextString(access && access.context);
  return {
    database:String(values.database ?? decoded.database ?? ""),
    entity:String(values.entity ?? decoded.entity ?? "")
  };
}

function unwrapEntity(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload[0] || null;
  if (payload.content && Array.isArray(payload.content)) return payload.content[0] || null;
  if (payload.data && typeof payload.data==="object") return unwrapEntity(payload.data);
  return payload;
}

function scalar(value) {
  if (value===null || value===undefined) return "";
  if (typeof value==="object") return String(value.id ?? value.codigo ?? value.value ?? "");
  return String(value);
}

function extractTenantContext(payload, tenant) {
  const obj=unwrapEntity(payload) || {};
  const entity=tenant.entityId || scalar(obj.entityId) || scalar(obj.entidadeId) ||
    scalar(obj.entity) || scalar(obj.entidade) || scalar(obj.id);
  const database=tenant.databaseId || scalar(obj.databaseId) || scalar(obj.database) ||
    scalar(obj.banco) || scalar(obj.database?.id);
  return {entity:String(entity||""),database:String(database||""),raw:obj};
}

async function getTenantContext(userToken, tenant) {
  if (tenant.entityId && tenant.databaseId) {
    return {entity:tenant.entityId,database:tenant.databaseId};
  }

  const contextToken=tenant.accessToken || userToken;
  if (!contextToken) throw new Error("BETHA_ACCESS_TOKEN_NOT_CONFIGURED");

  try {
    const entityPayload=await platformRequest(
      LICENSES_BASE+"/licenses/v0.1/api/entidades/atual/",
      {headers:{
        "Accept":"application/json",
        "Authorization":"Bearer "+contextToken,
        "User-Access":tenant.userAccess
      }}
    );

    const ctx=extractTenantContext(entityPayload,tenant);
    let entity=String(ctx.entity||"");
    let database=String(ctx.database||"");

    if (!entity) throw new Error("TENANT_CONTEXT_UNRESOLVED");

    if (!database) {
      const databasePayload=await platformRequest(
        LICENSES_BASE+"/licenses/v0.1/api/databases?entity="+encodeURIComponent(entity),
        {headers:{
          "Accept":"application/json",
          "Authorization":"Bearer "+contextToken,
          "User-Access":tenant.userAccess
        }}
      );

      const rows=Array.isArray(databasePayload)
        ? databasePayload
        : (databasePayload && Array.isArray(databasePayload.content)
          ? databasePayload.content
          : [databasePayload].filter(Boolean));

      const first=rows[0] || {};
      database=
        scalar(first.databaseId) ||
        scalar(first.database) ||
        scalar(first.id) ||
        scalar(first.codigo);
    }

    if (entity && database) return {entity,database};
  } catch(error) {
    console.warn("tenant context via licensing failed",tenant.id,error.message);
    if (error && error.message==="PLATFORM_HTTP_403") throw new Error("SERVICE_LICENSE_SCOPE_REQUIRED");
    if (error && error.message==="PLATFORM_HTTP_401") throw new Error("SERVICE_ACCESS_TOKEN_INVALID");
    if (error && error.message==="TENANT_CONTEXT_UNRESOLVED") throw error;
  }

  throw new Error("TENANT_CONTEXT_UNRESOLVED");
}

function matchingAccesses(accesses, context) {
  return accesses.filter(access=>{
    const values=accessValues(access);
    return values.entity===String(context.entity) && values.database===String(context.database);
  });
}

function matchAccess(accesses, context) {
  const matches=matchingAccesses(accesses,context);
  if (!matches.length) return null;

  // O endpoint @me/access já representa acessos vinculados ao usuário atual.
  // Havendo mais de um registro para o mesmo contexto, prefere um registro
  // ainda válido e com aceite explícito quando disponível, mas não bloqueia
  // todo o contexto somente porque um registro legado veio accepted=false.
  const now=Date.now();
  const usable=matches.filter(access=>{
    if (access.expiresIn && new Date(access.expiresIn).getTime() < now) return false;
    return true;
  });

  if (!usable.length) return null;

  return usable.find(access=>access.accepted===true) ||
    usable.find(access=>access.accepted===undefined || access.accepted===null) ||
    usable[0];
}

async function authorizeTenant(request, env, tenant) {
  const userToken=await getUserToken(request,env);
  if (!userToken) throw new Error("USER_TOKEN_REQUIRED");
  const [accesses,context,userId]=await Promise.all([
    getUserAccesses(userToken),
    getTenantContext(userToken,tenant),
    currentOAuthUserId(userToken)
  ]);
  const bethaAccess=matchAccess(accesses,context);
  if (bethaAccess && bethaAccess.expiresIn && new Date(bethaAccess.expiresIn).getTime() < Date.now()) {
    throw new Error("TENANT_ACCESS_EXPIRED");
  }

  const aliases=biUserAliases(userId,accesses);
  const tenantAdmin=!bethaAccess && await isBiTenantAdmin(env,tenant.id,aliases);
  if (!bethaAccess && !tenantAdmin) throw new Error("TENANT_ACCESS_DENIED");

  const grant=userId?await getBiUserGrant(env,tenant.id,userId):null;
  if(bethaAccess && !grant && bethaAccess.admin!==true && bethaAccess.technical!==true) {
    throw new Error("BI_USER_NOT_AUTHORIZED");
  }

  const baseAccess=bethaAccess || {
    accepted:true,
    admin:true,
    technical:true,
    user:userId||aliases[0]||"",
    userName:userId||aliases[0]||""
  };
  const access=tenantAdmin ? baseAccess : applyBiGrantToAccess(baseAccess,grant);
  return {userToken,userId,access,bethaAccess,grant,tenantAdmin,context};
}

function buildForwardedQuery(url) {
  const out=new URLSearchParams();
  for (const [key,value] of url.searchParams.entries()) {
    if (FORWARDED_QUERY_PARAMS.has(key)) out.append(key,value);
  }
  return out.toString();
}

function baseResourceMap(env) {
  return {...BASE_RESOURCES, ...parseJsonObject(env.BETHA_BASE_RESOURCE_MAP_JSON,{})};
}

function resolveResource(env,source,resource) {
  if (source==="bi") {
    const path=BI_RESOURCES[resource];
    if (!path) throw new Error("BI_RESOURCE_NOT_ALLOWED");
    return {base:env.BETHA_BI_API_BASE || BI_BASE_DEFAULT,path};
  }
  if (source==="base") {
    const map=baseResourceMap(env);
    const path=map[resource];
    if (!path || typeof path!=="string" || !path.startsWith("/")) throw new Error("BASE_RESOURCE_NOT_CONFIGURED");
    return {base:env.BETHA_BASE_API_BASE || BI_BASE_DEFAULT,path};
  }
  throw new Error("INVALID_SOURCE");
}

async function bethaGet(env,tenant,source,resource,query="") {
  const {base,path}=resolveResource(env,source,resource);
  if (!tenant.accessToken) throw new Error("BETHA_ACCESS_TOKEN_NOT_CONFIGURED");
  const target=String(base).replace(/\/$/,"")+path+(query?"?"+query:"");
  const controller=new AbortController();
  const timer=env.BI_SOURCE_TIMEOUT_MS
    ? setTimeout(()=>controller.abort(),env.BI_SOURCE_TIMEOUT_MS)
    : null;
  try {
  const response=await fetch(target,{
    method:"GET",
    signal:controller.signal,
    headers:{
      "Accept":"application/json",
      "Authorization":"Bearer "+tenant.accessToken,
      "User-Access":tenant.userAccess
    }
  });
  const parsed=await readJsonResponse(response);
  if (!response.ok) {
    const error=new Error("BETHA_HTTP_"+response.status);
    error.status=response.status;
    error.remoteBody=typeof parsed.body==="string"?parsed.body.slice(0,300):parsed.body;
    throw error;
  }
  return parsed.body;
  } finally {
    if (timer!==null) clearTimeout(timer);
  }
}

function payloadRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload!=="object") return [];
  if (Array.isArray(payload.content)) return payload.content;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.content)) return payload.data.content;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

function payloadTotal(payload) {
  if (!payload || typeof payload!=="object") return null;
  const candidates=[
    payload.total,
    payload.totalElements,
    payload.totalRegistros,
    payload.totalRecords,
    payload.count,
    payload.pagination && payload.pagination.total,
    payload.page && payload.page.totalElements,
    payload.metadata && payload.metadata.total
  ];
  for (const value of candidates) {
    if(value===null||value===undefined||value==="") continue;
    const n=Number(value);
    if (Number.isFinite(n) && n>=0) return n;
  }
  return null;
}

function payloadPageMeta(payload, requestedOffset, requestedLimit, rowCount) {
  const root=(payload && typeof payload==="object") ? payload : {};
  const nested=root.pagination || root.page || root.metadata || {};

  const offsetCandidates=[root.offset,nested.offset,nested.number!=null ? Number(nested.number)*Number(root.limit||nested.size||requestedLimit) : null];
  const limitCandidates=[root.limit,nested.limit,nested.size];
  const hasNextCandidates=[root.hasNext,nested.hasNext,nested.last===false ? true : nested.last===true ? false : undefined];

  let offset=requestedOffset;
  for(const value of offsetCandidates){
    if(value===null||value===undefined||value==="") continue;
    const n=Number(value);
    if(Number.isFinite(n)&&n>=0){offset=n;break;}
  }

  let limit=requestedLimit;
  for(const value of limitCandidates){
    if(value===null||value===undefined||value==="") continue;
    const n=Number(value);
    if(Number.isFinite(n)&&n>0){limit=n;break;}
  }

  let hasNext=null;
  for(const value of hasNextCandidates){
    if(typeof value==="boolean"){hasNext=value;break;}
    if(value==="true"||value==="false"){hasNext=value==="true";break;}
  }

  return {
    offset,
    limit,
    total:payloadTotal(payload),
    hasNext,
    nextOffset:offset + (limit>0 ? limit : rowCount)
  };
}

async function fetchBethaRows(env,tenant,source,resource,{limit=1000,maxPages=null,startOffset=0,filter=null}={}) {
  const rows=[];
  const seenIds=new Set();
  const seenFingerprints=new Set();
  const pageMeta=[];
  let reportedTotal=null;
  let truncated=false;
  let repeatedPage=false;
  let offset=Math.max(0,Number(startOffset)||0);
  let pages=0;
  let reachedEnd=false;

  // Quando maxPages é informado, trata-se de um lote controlado.
  // Sem maxPages, 500 páginas é apenas a trava extrema contra loop.
  const chunkMode=maxPages!==null && maxPages!==undefined;
  const safetyMaxPages=chunkMode ? Math.max(1,Number(maxPages)) : 500;

  for (let page=0;page<safetyMaxPages;page++) {
    const requestOffset=offset;
    const requestQuery=new URLSearchParams({limit:String(limit),offset:String(requestOffset)});
    // The additional-fields source refuses an unbounded request. Betha's BI
    // guidance uses an id criterion for initial loads, so keep the request broad
    // but explicit and ask the platform to include custom fields.
    if(filter) requestQuery.set("filter",String(filter));
    if(resource==="imoveis-campos-adicionais"){
      requestQuery.set("cpaFields","true");
      requestQuery.set("filter",filter ? "("+String(filter)+") and id > 0" : "id > 0");
    }
    const body=await bethaGet(env,tenant,source,resource,requestQuery.toString());
    pages++;

    const pageRows=payloadRows(body);
    const meta=payloadPageMeta(body,requestOffset,limit,pageRows.length);
    if (reportedTotal===null && meta.total!==null) reportedTotal=meta.total;
    pageMeta.push({
      offset:meta.offset,
      limit:meta.limit,
      total:meta.total,
      hasNext:meta.hasNext,
      returned:pageRows.length
    });

    const fingerprint=pageRows.slice(0,10).map((row,index)=>{
      const id=firstValue(row,["id","codigo","idIntegracao","uuid"]);
      return id!==undefined ? String(id) : JSON.stringify(row||{}).slice(0,220)+":"+index;
    }).join("|");

    if (fingerprint && seenFingerprints.has(fingerprint)) {
      repeatedPage=true;
      truncated=true;
      break;
    }
    if (fingerprint) seenFingerprints.add(fingerprint);

    let newRows=0;
    for (const row of pageRows) {
      const id=firstValue(row,["id","codigo","idIntegracao","uuid"]);
      if (id!==undefined && id!==null && id!=="") {
        const key=String(id);
        if (seenIds.has(key)) continue;
        seenIds.add(key);
      }
      rows.push(row);
      newRows++;
    }

    if (meta.hasNext===false) {
      reachedEnd=true;
      offset=meta.nextOffset;
      break;
    }

    if (meta.hasNext===null && (!pageRows.length || pageRows.length<meta.limit)) {
      reachedEnd=true;
      offset=meta.nextOffset;
      break;
    }

    // Alguns endpoints da Betha mantêm hasNext=true mesmo na página seguinte ao fim.
    // Página vazia é tratada como encerramento normal da paginação.
    if (!pageRows.length) {
      reachedEnd=true;
      offset=meta.nextOffset;
      break;
    }

    if (!newRows) {
      repeatedPage=true;
      truncated=true;
      break;
    }

    const nextOffset=meta.nextOffset;
    if (!Number.isFinite(nextOffset) || nextOffset<=requestOffset) {
      truncated=true;
      break;
    }
    offset=nextOffset;

    // Em modo lote, chegar ao fim do lote NÃO é truncamento:
    // o front pedirá o próximo offset em uma nova invocação.
    if (page===safetyMaxPages-1 && !chunkMode) truncated=true;
  }

  if (reportedTotal!==null && rows.length>reportedTotal) {
    reportedTotal=null;
  }

  const totalMismatch=!chunkMode && reportedTotal!==null && reachedEnd && reportedTotal!==rows.length;
  const complete=reachedEnd && !truncated;
  const hasMore=!complete && !truncated && !repeatedPage;

  return {
    rows,
    total:chunkMode ? rows.length : (complete ? rows.length : Math.max(reportedTotal||0,rows.length)),
    reportedTotal,
    loaded:rows.length,
    pages,
    complete,
    hasMore,
    nextOffset:hasMore ? offset : null,
    startOffset:Math.max(0,Number(startOffset)||0),
    truncated,
    repeatedPage,
    totalMismatch,
    pageMeta
  };
}

function publicBethaSourceErrorDetail(error) {
  const code=String(error?.message||"");
  const status=Number(error?.status)||Number((code.match(/BETHA_HTTP_(\d{3})/)||[])[1])||null;
  if(status===401) return "Credencial da fonte não autorizada.";
  if(status===403) return "Integração sem permissão para consultar esta fonte.";
  if(status===429) return "Limite temporário de requisições atingido; nova tentativa será feita automaticamente.";
  if(status&&status>=500) return "Falha temporária na fonte Betha; nova tentativa será feita automaticamente.";
  if(code==="The operation was aborted"||code==="AbortError"||code==="REQUEST_TIMEOUT") {
    return "A fonte demorou para responder; nova tentativa será feita automaticamente.";
  }
  if(code==="SOURCE_PAGE_LIMIT") return "A fonte possui mais páginas do que o limite atual de processamento.";
  return code ? "Não foi possível consultar esta fonte neste momento." : null;
}

async function safeBethaRows(env,tenant,source,resource,options={}) {
  if (env.BI_DASHBOARD_LOAD && Object.keys(options).length===0) {
    const load=env.BI_DASHBOARD_LOAD;
    const sourceKey=source+":"+resource;
    if (!load.pending.has(sourceKey)) {
      load.pending.set(sourceKey,loadDashboardSourceBatch(env,tenant,source,resource));
    }
    return load.pending.get(sourceKey);
  }
  const heavyFinancial=new Set([
    "pagamentos",
    "pagamentos-detalhados",
    "pagamentos-detalhados-valores",
    "debitos",
    "debitos-receitas",
    "dividas",
    "dividas-receitas",
    "guias-unificadas"
  ]);

  const requestedLimit=Number(options.limit || 0);
  const limits=requestedLimit>0
    ? [...new Set(heavyFinancial.has(resource)&&requestedLimit>50
        ? [requestedLimit,Math.min(100,requestedLimit),50]
        : [requestedLimit])]
    : (heavyFinancial.has(resource) ? [250,100,50] : [1000,500,250]);

  let lastError=null;

  for (const limit of limits) {
    try {
      const result=await fetchBethaRows(env,tenant,source,resource,{...options,limit});
      // Alguns endpoints BI retornam 1001 como marcador/limite, e não como total global.
      // Se o "total" informado for menor que o que efetivamente foi percorrido,
      // descartamos esse número e confiamos no fim real da paginação.
      if (result.reportedTotal!==null && result.loaded>result.reportedTotal) {
        result.reportedTotal=null;
        result.totalMismatch=false;
        result.total=result.loaded;
      }
      return {...result,error:null,errorStatus:null,errorDetail:null,pageLimit:limit};
    } catch(error) {
      lastError=error;
      // Tenta página menor para endpoints pesados/instáveis.
      // 401/403/404 não melhoram reduzindo a página.
      if ([401,403,404].includes(Number(error.status))) break;
    }
  }

  const diagnosticDetail=lastError && lastError.remoteBody
    ? (typeof lastError.remoteBody==="string"
        ? lastError.remoteBody.slice(0,240)
        : JSON.stringify(lastError.remoteBody).slice(0,240))
    : null;
  const detail=publicBethaSourceErrorDetail(lastError);

  console.warn("dashboard source failed",source,resource,lastError && lastError.message,diagnosticDetail);

  return {
    rows:[],
    total:0,
    reportedTotal:null,
    loaded:0,
    pages:0,
    complete:false,
    truncated:false,
    repeatedPage:false,
    totalMismatch:false,
    pageMeta:[],
    pageLimit:null,
    hasMore:false,
    nextOffset:null,
    startOffset:Number(options.startOffset||0),
    error:lastError ? lastError.message : "UNKNOWN_ERROR",
    errorStatus:lastError ? (lastError.status || null) : null,
    errorDetail:detail
  };
}

// Each authorized dashboard request advances one page per source. Raw rows
// stay in temporary, tenant/context-scoped KV entries; only aggregates leave
// the Worker. Existing full-read consumers and detail routes are unchanged.
async function loadDashboardSourceBatch(env,tenant,source,resource) {
  const load=env.BI_DASHBOARD_LOAD;
  const sourceKey=source+":"+resource;
  const prefix=load.prefix+":"+sourceKey;
  const manifestKey=prefix+":manifest";
  let manifest=await dashboardTempGetJson(env,manifestKey);
  const expected=Number(load.expected[sourceKey]||0);
  if ((!manifest && expected>0) || (manifest && manifest.pages<expected)) {
    throw new Error("DASHBOARD_BATCH_PENDING");
  }
  manifest=manifest||{pages:0,nextOffset:0,complete:false,truncated:false};
  const chunks=[];
  // Bound concurrent KV reads as well as Betha requests.
  const blockCount=Math.ceil(manifest.pages/DASHBOARD_CACHE_BLOCK_PAGES);
  for (let start=0;start<blockCount;start+=10) {
    const batch=await Promise.all(Array.from({length:Math.min(10,blockCount-start)},(_,i)=>
      dashboardTempGetJson(env,prefix+":block:"+(start+i))));
    if (batch.some(chunk=>!chunk)) throw new Error("DASHBOARD_BATCH_PENDING");
    chunks.push(...batch.flat());
  }
  if (chunks.length<manifest.pages) throw new Error("DASHBOARD_BATCH_PENDING");
  chunks.length=manifest.pages;
  if (!manifest.complete && !manifest.truncated && manifest.pages===expected) {
    const plainEnv={...env};
    delete plainEnv.BI_DASHBOARD_LOAD;
    // Fontes financeiras da Betha podem levar mais de 12s para 250 linhas.
    // Buscar lotes menores e dar tempo ao gateway antes de marcar aborto.
    plainEnv.BI_SOURCE_TIMEOUT_MS=30000;
    const chunk=await safeBethaRows(plainEnv,tenant,source,resource,{
      limit:/pagamentos|dividas/.test(resource)?100:250,
      maxPages:1,
      startOffset:manifest.nextOffset,
      filter:load.sourceFilters?.[sourceKey]||null
    });
    if (chunk.error) {
      // Preserve prior rows, while explicitly reporting an interrupted source.
      chunks.push(chunk);
    } else {
      const fingerprint=JSON.stringify(chunk.rows.slice(0,10));
      const repeated=chunk.rows.length>0 && chunks.some(previous=>
        JSON.stringify(previous.rows.slice(0,10))===fingerprint);
      chunk.repeatedPage=chunk.repeatedPage||repeated;
      chunk.truncated=chunk.truncated||repeated||(!chunk.complete && manifest.pages>=499);
      chunk.hasMore=!chunk.complete&&!chunk.truncated;
      if (repeated) chunk.rows=[];
      chunks.push(chunk);
      const block=Math.floor(manifest.pages/DASHBOARD_CACHE_BLOCK_PAGES);
      await dashboardTempPutJson(env,prefix+":block:"+block,chunks.slice(block*DASHBOARD_CACHE_BLOCK_PAGES),3600);
      manifest={pages:manifest.pages+1,nextOffset:chunk.nextOffset,
        complete:chunk.complete,truncated:chunk.truncated};
      await dashboardTempPutJson(env,manifestKey,manifest,3600);
    }
  }
  const seen=new Set();
  const rows=[];
  for (const chunk of chunks) for (const row of chunk.rows) {
    const id=firstValue(row,["id","codigo","idIntegracao","uuid"]);
    if (id!==undefined&&id!==null&&id!=="") {
      if (seen.has(String(id))) continue;
      seen.add(String(id));
    }
    rows.push(row);
  }
  const last=chunks[chunks.length-1]||{};
  let reportedTotal=chunks.find(chunk=>chunk.reportedTotal!==null&&chunk.reportedTotal!==undefined)?.reportedTotal??null;
  if (reportedTotal!==null&&rows.length>reportedTotal) reportedTotal=null;
  const complete=manifest.complete&&!last.error;
  const result={...last,rows,loaded:rows.length,pages:chunks.reduce((n,c)=>n+(c.pages||0),0),
    pageMeta:chunks.flatMap(chunk=>chunk.pageMeta||[]),startOffset:0,
    reportedTotal,total:complete?rows.length:Math.max(reportedTotal||0,rows.length),
    complete,truncated:Boolean(manifest.truncated),
    totalMismatch:complete&&reportedTotal!==null&&reportedTotal!==rows.length,
    hasMore:!complete&&!manifest.truncated&&!last.error,nextOffset:manifest.nextOffset};
  load.cursors[sourceKey]=manifest.pages;
  if (result.hasMore) load.hasMore=true;
  return result;
}

function valueAt(obj,path) {
  if (!obj || !path) return undefined;
  if (!String(path).includes(".")) return obj[path];
  return String(path).split(".").reduce((acc,key)=>acc==null?undefined:acc[key],obj);
}

function normalizeFieldName(value) {
  return String(value||"")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-zA-Z0-9]/g,"")
    .toLowerCase();
}

function findFieldAdaptive(obj,candidates,maxDepth=4) {
  if (!obj || typeof obj!=="object") return undefined;
  const wanted=new Set(candidates.map(c=>normalizeFieldName(String(c).split(".").pop())));

  const queue=[{value:obj,depth:0}];
  const visited=new Set();

  while(queue.length){
    const current=queue.shift();
    const value=current.value;
    if(!value || typeof value!=="object" || visited.has(value)) continue;
    visited.add(value);

    for(const [key,val] of Object.entries(value)){
      if(wanted.has(normalizeFieldName(key)) && val!==undefined && val!==null && val!==""){
        return val;
      }
      if(current.depth<maxDepth && val && typeof val==="object" && !Array.isArray(val)){
        queue.push({value:val,depth:current.depth+1});
      }
    }
  }
  return undefined;
}

function firstValue(obj,paths) {
  for (const path of paths) {
    const value=valueAt(obj,path);
    if (value!==undefined && value!==null && value!=="") return value;
  }
  return findFieldAdaptive(obj,paths);
}

function numericValue(obj,paths) {
  const raw=firstValue(obj,paths);
  if (raw===undefined) return 0;
  if (typeof raw==="number") return Number.isFinite(raw)?raw:0;
  const text=String(raw).trim();
  const normalized=text.includes(",")
    ? text.replace(/\./g,"").replace(",",".")
    : text;
  const n=Number(normalized);
  return Number.isFinite(n)?n:0;
}

function stringValue(obj,paths,fallback="Não informado") {
  const raw=firstValue(obj,paths);
  if (raw===undefined || raw===null || raw==="") return fallback;
  if (typeof raw==="object") {
    return String(raw.descricao ?? raw.nome ?? raw.codigo ?? raw.id ?? fallback);
  }
  return String(raw);
}

function dateValue(obj,paths) {
  const raw=firstValue(obj,paths);
  if (!raw) return null;
  if (raw instanceof Date) return Number.isNaN(raw.getTime())?null:raw;

  const text=String(raw).trim();

  // dd/MM/yyyy ou dd/MM/yyyy HH:mm:ss
  let match=text.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (match) {
    const d=new Date(
      Number(match[3]),Number(match[2])-1,Number(match[1]),
      Number(match[4]||0),Number(match[5]||0),Number(match[6]||0)
    );
    return Number.isNaN(d.getTime())?null:d;
  }

  // yyyy-MM-dd e ISO
  const d=new Date(text);
  return Number.isNaN(d.getTime())?null:d;
}

function yearValue(obj,datePaths,yearPaths=[]) {
  const explicit=Number(firstValue(obj,yearPaths));
  if (Number.isFinite(explicit) && explicit>1900) return explicit;
  const d=dateValue(obj,datePaths);
  return d?d.getFullYear():null;
}

function periodIncludes(obj,{periodo,exercicio,datePaths,yearPaths=[]}) {
  if (periodo==="todos") return true;
  const selectedYear=Number(exercicio);
  const d=dateValue(obj,datePaths);
  const y=yearValue(obj,datePaths,yearPaths);

  if (periodo==="ano") {
    return y===selectedYear || (y===null && !d);
  }

  if (periodo==="mes") {
    if (d) return d.getFullYear()===selectedYear && d.getMonth()===new Date().getMonth();
    return y===selectedYear || y===null;
  }

  if (periodo==="12m") {
    if (!d) return y===selectedYear || y===null;
    const end=new Date();
    const start=new Date(end.getFullYear(),end.getMonth()-11,1);
    return d>=start && d<=end;
  }

  return true;
}

function leafFieldPaths(obj,maxDepth=4) {
  const paths=[];
  const queue=[{value:obj,prefix:"",depth:0}];
  const visited=new Set();

  while(queue.length){
    const {value,prefix,depth}=queue.shift();
    if(!value || typeof value!=="object" || Array.isArray(value) || visited.has(value)) continue;
    visited.add(value);

    for(const [key,child] of Object.entries(value)){
      const path=prefix ? prefix+"."+key : key;
      if(child && typeof child==="object" && !Array.isArray(child) && depth<maxDepth){
        queue.push({value:child,prefix:path,depth:depth+1});
      } else {
        paths.push(path);
      }
    }
  }
  return paths;
}

function resolveNumericPath(rows,preferredPaths,tokenSets=[]) {
  // Preferência explícita/documentada.
  for(const path of preferredPaths){
    for(const row of rows.slice(0,20)){
      const raw=valueAt(row,path);
      if(raw===undefined || raw===null || raw==="") continue;
      const n=numericValue(row,[path]);
      if(Number.isFinite(n)) return path;
    }
  }

  const sampleRows=rows.slice(0,20);
  const candidates=new Map();

  for(const row of sampleRows){
    for(const path of leafFieldPaths(row)){
      const raw=valueAt(row,path);
      if(raw===undefined || raw===null || raw==="") continue;

      let numeric=false;
      if(typeof raw==="number") numeric=Number.isFinite(raw);
      else {
        const text=String(raw).trim();
        const normalized=text.includes(",")
          ? text.replace(/\./g,"").replace(",",".")
          : text;
        numeric=normalized!=="" && Number.isFinite(Number(normalized));
      }
      if(!numeric) continue;

      const normalizedPath=normalizeFieldName(path);
      let score=0;
      for(const tokens of tokenSets){
        const ok=tokens.every(token=>normalizedPath.includes(normalizeFieldName(token)));
        if(ok) score=Math.max(score,tokens.length*10);
      }
      if(!score) continue;

      const current=candidates.get(path)||0;
      candidates.set(path,Math.max(current,score));
    }
  }

  return [...candidates.entries()]
    .sort((a,b)=>b[1]-a[1] || a[0].length-b[0].length)[0]?.[0] || null;
}

function sumRows(rows,paths) {
  return rows.reduce((total,row)=>total+numericValue(row,paths),0);
}

function hasAnyValue(rows,paths) {
  return rows.some(row=>{
    const value=firstValue(row,paths);
    return value!==undefined && value!==null && value!=="";
  });
}

function sumRowsOrNull(rows,paths) {
  if (!hasAnyValue(rows,paths)) return null;
  return sumRows(rows,paths);
}

function monthSeries(rows,{datePaths,valuePaths,periodo,exercicio}) {
  const buckets=new Map();
  const selectedYear=Number(exercicio);
  let months=[];

  if (periodo==="12m") {
    const now=new Date();
    for (let i=11;i>=0;i--) months.push(new Date(now.getFullYear(),now.getMonth()-i,1));
  } else {
    for (let m=0;m<12;m++) months.push(new Date(selectedYear,m,1));
  }

  for (const m of months) buckets.set(m.getFullYear()+"-"+String(m.getMonth()+1).padStart(2,"0"),0);

  for (const row of rows) {
    const d=dateValue(row,datePaths);
    if (!d) continue;
    if (!periodIncludes(row,{periodo,exercicio,datePaths})) continue;
    const key=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
    if (!buckets.has(key)) continue;
    buckets.set(key,buckets.get(key)+numericValue(row,valuePaths));
  }

  return {
    labels:months.map(d=>d.toLocaleDateString("pt-BR",{month:"short",year:periodo==="12m"?"2-digit":undefined}).replace(".","")),
    values:[...buckets.values()]
  };
}

function topGroups(rows,{labelPaths,valuePaths,limit=10,countOnly=false,filter=null}) {
  const grouped=new Map();
  for (const row of rows) {
    if (filter && !filter(row)) continue;
    const label=stringValue(row,labelPaths);
    const current=grouped.get(label)||0;
    grouped.set(label,current+(countOnly?1:numericValue(row,valuePaths)));
  }
  return [...grouped.entries()]
    .sort((a,b)=>b[1]-a[1])
    .slice(0,limit);
}

function debtYearSeries(rows) {
  const grouped=new Map();
  for (const row of rows) {
    const year=yearValue(row,["dataInscricao","dtInscricao","dataDivida"],["anoDivida","ano"]);
    if (!year) continue;
    const saldo=numericValue(row,["vlSaldo","valorSaldo","saldo","saldoCalculado"]);
    grouped.set(year,(grouped.get(year)||0)+saldo);
  }
  return [...grouped.entries()].sort((a,b)=>a[0]-b[0]);
}

async function loadOverviewSource(env,tenant,source,resource,url) {
  const chunked=url.searchParams.get("chunked")==="1";
  if (!chunked) return safeBethaRows(env,tenant,source,resource);

  const startOffset=Math.max(0,Number(url.searchParams.get("chunkOffset")||0));
  const maxPages=Math.min(25,Math.max(1,Number(url.searchParams.get("chunkPages")||20)));
  const limit=Math.min(1000,Math.max(50,Number(url.searchParams.get("chunkLimit")||1000)));

  return safeBethaRows(env,tenant,source,resource,{limit,maxPages,startOffset});
}

async function buildOverviewPart(env,tenant,url,part) {
  const periodo=url.searchParams.get("periodo") || "ano";
  const exercicio=Number(url.searchParams.get("exercicio") || new Date().getFullYear());
  const paymentDatePaths=["dataPagamento","dtPagamento","dhPagamento","pagamento.dataPagamento"];
  const debitDatePaths=["dhDebito","dataDebito","dtDebito","dataLancamento","dtLancamento"];

  if (part==="pagamentos") {
    const src=await loadOverviewSource(env,tenant,"bi","pagamentos",url);
    const rows=src.rows.filter(row=>periodIncludes(row,{
      periodo,exercicio,datePaths:paymentDatePaths,yearPaths:["ano","exercicio"]
    }));
    const paymentValuePath=resolveNumericPath(
      src.rows,
      ["valorPago","vlPago","valorTotalPago","vlTotalPago","valorArrecadado"],
      [["valor","pago"],["vl","pago"],["arrecad"]]
    );
    const monthly=monthSeries(src.rows,{
      datePaths:paymentDatePaths,
      valuePaths:paymentValuePath?[paymentValuePath]:["valorPago","vlPago","valorTotalPago","vlTotalPago","valorArrecadado"],
      periodo,exercicio
    });
    return {
      part,kpis:{
        arrecadado:paymentValuePath?sumRowsOrNull(rows,[paymentValuePath]):null
      },
      charts:{
        "receita-mensal":{
          format:"currency",labels:monthly.labels,
          datasets:[{label:"Arrecadado",data:monthly.values}]
        },
        "lancado-pago-saldo":{
          format:"currency",labels:monthly.labels,
          datasets:[{label:"Pago",data:monthly.values}]
        }
      },
      meta:dashboardMeta([["pagamentos",src]],{
        fieldMapping:{paymentValue:paymentValuePath}
      })
    };
  }

  if (part==="debitos") {
    const src=await loadOverviewSource(env,tenant,"bi","debitos",url);
    const rows=src.rows.filter(row=>periodIncludes(row,{
      periodo,exercicio,datePaths:debitDatePaths,yearPaths:["ano","anoDebito","exercicio"]
    }));
    const lancadoPath=resolveNumericPath(
      src.rows,
      ["vlLancado","valorLancado","valorDebito","vlDebito","valorOriginal"],
      [["lanc"],["valor","debito"],["vl","debito"],["valor","original"]]
    );
    const lancado=monthSeries(src.rows,{
      datePaths:debitDatePaths,
      valuePaths:lancadoPath?[lancadoPath]:["vlLancado","valorLancado","valorDebito","vlDebito","valorOriginal"],
      periodo,exercicio
    });
    const saldo=monthSeries(src.rows,{
      datePaths:debitDatePaths,
      valuePaths:["vlSaldo","valorSaldo","saldo"],
      periodo,exercicio
    });
    const datasets=[{label:"Lançado",data:lancado.values}];
    if (saldo.values.some(v=>v!==0)) datasets.push({label:"Saldo",data:saldo.values});
    return {
      part,kpis:{
        lancado:lancadoPath?sumRowsOrNull(rows,[lancadoPath]):null
      },
      charts:{
        "lancado-pago-saldo":{format:"currency",labels:lancado.labels,datasets}
      },
      meta:dashboardMeta([["debitos",src]],{
        fieldMapping:{lancado:lancadoPath}
      })
    };
  }

  if (part==="dividas") {
    let src=await loadOverviewSource(env,tenant,"base","encerramento-dividas",url);
    let sourceKey="encerramentoDividas";
    let sourceUsed="base:encerramento-dividas";

    // A API Base pode não estar liberada na credencial atual.
    // Nesse caso mantém o BI funcional usando a fonte BI de dívidas.
    if (src.error && [401,403].includes(Number(src.errorStatus))) {
      src=await loadOverviewSource(env,tenant,"bi","dividas",url);
      sourceKey="dividas";
      sourceUsed="bi:dividas";
    }

    const saldoPath=resolveNumericPath(
      src.rows,
      [
        "valorSaldo","vlSaldo","saldo","saldoCalculado","saldoDevedor",
        "valorAtualizado","vlAtualizado","valorAtual","valorPendente",
        "valorRestante","valorAberto","valorDevido","vlDevido",
        "valorDivida","vlDivida","valorInscrito","vlInscrito"
      ],
      [
        ["saldo"],
        ["valor","atualiz"],
        ["valor","pendente"],
        ["valor","restante"],
        ["valor","aberto"],
        ["valor","devido"],
        ["valor","divida"],
        ["valor","inscrito"]
      ]
    );
    const debtStatus=groupCount(src.rows,["statusDivida","situacaoDivida","situacao","status"],12);
    const debtYears=groupSum(
      src.rows,
      ["anoDivida","ano","exercicio","dataInscricao"],
      saldoPath?[saldoPath]:["valorSaldo","vlSaldo","saldo","saldoCalculado","valorAtualizado","valorPendente","valorDevido","valorDivida"],
      30
    );
    return {
      part,kpis:{
        divida:saldoPath?sumRowsOrNull(src.rows,[saldoPath]):null
      },
      charts:{
        "divida-evolucao":{
          format:"currency",
          labels:debtYears.map(([year])=>String(year)),
          datasets:[{label:"Saldo da dívida",data:debtYears.map(([,value])=>value)}]
        },
        "situacao-divida":chartGroups(debtStatus,"Dívidas","number")
      },
      meta:dashboardMeta([[sourceKey,src]],{
        fieldMapping:{saldo:saldoPath},
        sourceUsed:{divida:sourceUsed}
      })
    };
  }

  if (part==="parcelamentos") {
    const src=await loadOverviewSource(env,tenant,"bi","parcelamentos",url);
    const rows=src.rows.filter(row=>periodIncludes(row,{
      periodo,exercicio,datePaths:["dtParcelamento","dataParcelamento","dhParcelamento"],yearPaths:["ano","exercicio"]
    }));
    return {
      part,kpis:{parcelado:periodo==="todos"?src.total:rows.length},
      meta:dashboardMeta([["parcelamentos",src]])
    };
  }

  if (part==="contribuintes") {
    const src=await loadOverviewSource(env,tenant,"bi","contribuintes",url);
    return {
      part,kpis:{contribuintes:src.loaded},
      charts:{cadastros:chartFixed(["Contribuintes"],[src.loaded],"Cadastros","number")},
      meta:dashboardMeta([["contribuintes",src]])
    };
  }

  if (part==="imoveis") {
    const src=await loadOverviewSource(env,tenant,"bi","imoveis",url);
    return {
      part,kpis:{imoveis:src.loaded},
      charts:{cadastros:chartFixed(["Imóveis"],[src.loaded],"Cadastros","number")},
      meta:dashboardMeta([["imoveis",src]])
    };
  }

  if (part==="economicos") {
    const src=await loadOverviewSource(env,tenant,"bi","economicos",url);
    return {
      part,
      charts:{cadastros:chartFixed(["Econômicos"],[src.loaded],"Cadastros","number")},
      meta:dashboardMeta([["economicos",src]])
    };
  }

  if (part==="pagamentos-detalhados") {
    const src=await loadOverviewSource(env,tenant,"bi","pagamentos-detalhados",url);
    const rows=src.rows.filter(row=>periodIncludes(row,{
      periodo,exercicio,
      datePaths:["pagamento.dataPagamento","dataPagamento","dtPagamento"],
      yearPaths:["ano","exercicio"]
    }));
    const groups=groupSum(rows,
      ["creditoTributario.descricao","creditoTributario.nome","descricaoCreditoTributario","idCreditoTributario"],
      ["valorPagoLancado","vlPagoLancado","valorPago","vlPago"],10
    );
    return {
      part,
      charts:{"receita-credito":chartGroups(groups,"Arrecadado","currency")},
      meta:dashboardMeta([["pagamentosDetalhados",src]])
    };
  }

  throw new Error("OVERVIEW_PART_INVALID");
}

async function buildOverviewDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo") || "ano";
  const exercicio=Number(url.searchParams.get("exercicio") || new Date().getFullYear());

  const [
    pagamentos,
    debitos,
    dividas,
    parcelamentos,
    contribuintes,
    imoveis,
    economicos,
    pagamentosDetalhados
  ]=await Promise.all([
    safeBethaRows(env,tenant,"bi","pagamentos"),
    safeBethaRows(env,tenant,"bi","debitos"),
    safeBethaRows(env,tenant,"bi","dividas"),
    safeBethaRows(env,tenant,"bi","parcelamentos"),
    safeBethaRows(env,tenant,"bi","contribuintes"),
    safeBethaRows(env,tenant,"bi","imoveis"),
    safeBethaRows(env,tenant,"bi","economicos"),
    safeBethaRows(env,tenant,"bi","pagamentos-detalhados")
  ]);

  const paymentDatePaths=["dataPagamento","dtPagamento","dhPagamento","pagamento.dataPagamento"];
  const debitDatePaths=["dhDebito","dataDebito","dtDebito","dataLancamento","dtLancamento"];

  const filteredPayments=pagamentos.rows.filter(row=>periodIncludes(row,{
    periodo,exercicio,datePaths:paymentDatePaths,yearPaths:["ano","exercicio"]
  }));

  const filteredDebits=debitos.rows.filter(row=>periodIncludes(row,{
    periodo,exercicio,datePaths:debitDatePaths,yearPaths:["ano","anoDebito","exercicio"]
  }));

  const filteredParcels=parcelamentos.rows.filter(row=>periodIncludes(row,{
    periodo,exercicio,datePaths:["dtParcelamento","dataParcelamento","dhParcelamento"],yearPaths:["ano","exercicio"]
  }));

  const paymentMonthly=monthSeries(pagamentos.rows,{
    datePaths:paymentDatePaths,
    valuePaths:["valorPago","vlPago","valorTotalPago"],
    periodo,
    exercicio
  });

  const debitMonthly=monthSeries(debitos.rows,{
    datePaths:debitDatePaths,
    valuePaths:["vlLancado","valorLancado","valorDebito"],
    periodo,
    exercicio
  });

  const debitPaidMonthly=monthSeries(debitos.rows,{
    datePaths:debitDatePaths,
    valuePaths:["vlPago","valorPago"],
    periodo,
    exercicio
  });

  const debitSaldoMonthly=monthSeries(debitos.rows,{
    datePaths:debitDatePaths,
    valuePaths:["vlSaldo","valorSaldo","saldo"],
    periodo,
    exercicio
  });

  const creditRows=pagamentosDetalhados.rows.filter(row=>periodIncludes(row,{
    periodo,exercicio,
    datePaths:["pagamento.dataPagamento","dataPagamento","dtPagamento"],
    yearPaths:["ano","exercicio"]
  }));

  const creditGroups=topGroups(creditRows,{
    labelPaths:["creditoTributario.descricao","creditoTributario.nome","descricaoCreditoTributario","idCreditoTributario"],
    valuePaths:["valorPagoLancado","vlPagoLancado","valorPago","vlPago"],
    limit:10
  });

  const debtStatus=topGroups(dividas.rows,{
    labelPaths:["statusDivida","situacaoDivida","situacao","status"],
    countOnly:true,
    limit:12
  });

  const debtYears=debtYearSeries(dividas.rows);
  const debtSaldo=sumRows(dividas.rows,["vlSaldo","valorSaldo","saldo","saldoCalculado"]);

  const warnings=[
    ["pagamentos",pagamentos],
    ["debitos",debitos],
    ["dividas",dividas],
    ["parcelamentos",parcelamentos],
    ["contribuintes",contribuintes],
    ["imoveis",imoveis],
    ["economicos",economicos],
    ["pagamentos-detalhados",pagamentosDetalhados]
  ].filter(([,src])=>src.error || src.truncated)
   .map(([name,src])=>({source:name,error:src.error,truncated:src.truncated}));

  return {
    view:"visao-geral",
    tenant:{id:tenant.id,name:tenant.name},
    period:{periodo,exercicio},
    kpis:{
      arrecadado:sumRowsOrNull(filteredPayments,["valorPago","vlPago","valorTotalPago","vlTotalPago","valorArrecadado"]),
      lancado:sumRowsOrNull(filteredDebits,["vlLancado","valorLancado","valorDebito","vlDebito","valorOriginal"]),
      divida:hasAnyValue(dividas.rows,["vlSaldo","valorSaldo","saldo","saldoCalculado"])
        ? debtSaldo
        : null,
      parcelado:periodo==="todos" ? parcelamentos.total : filteredParcels.length,
      contribuintes:contribuintes.total,
      imoveis:imoveis.total
    },
    charts:{
      "receita-mensal":{
        format:"currency",
        labels:paymentMonthly.labels,
        datasets:[{label:"Arrecadado",data:paymentMonthly.values}]
      },
      "lancado-pago-saldo":{
        format:"currency",
        labels:debitMonthly.labels,
        datasets:[
          {label:"Lançado",data:debitMonthly.values},
          {label:"Pago",data:debitPaidMonthly.values.some(v=>v!==0)?debitPaidMonthly.values:paymentMonthly.values},
          ...(debitSaldoMonthly.values.some(v=>v!==0)?[{label:"Saldo",data:debitSaldoMonthly.values}]:[])
        ]
      },
      "divida-evolucao":{
        format:"currency",
        labels:debtYears.map(([year])=>String(year)),
        datasets:[{label:"Saldo da dívida",data:debtYears.map(([,value])=>value)}]
      },
      "receita-credito":{
        format:"currency",
        labels:creditGroups.map(([label])=>label),
        datasets:[{label:"Arrecadado",data:creditGroups.map(([,value])=>value)}]
      },
      "situacao-divida":{
        format:"number",
        labels:debtStatus.map(([label])=>label),
        datasets:[{label:"Dívidas",data:debtStatus.map(([,value])=>value)}]
      },
      cadastros:{
        format:"number",
        labels:["Contribuintes","Imóveis","Econômicos"],
        datasets:[{
          label:"Cadastros",
          data:[contribuintes.total,imoveis.total,economicos.total]
        }]
      }
    },
    meta:{
      generatedAt:new Date().toISOString(),
      publicAggregateMode:true,
      warnings,
      sourceRows:{
        pagamentos:pagamentos.rows.length,
        debitos:debitos.rows.length,
        dividas:dividas.rows.length,
        parcelamentos:parcelamentos.rows.length,
        contribuintes:contribuintes.rows.length,
        imoveis:imoveis.rows.length,
        economicos:economicos.rows.length,
        pagamentosDetalhados:pagamentosDetalhados.rows.length
      },
      sourceTotals:{
        pagamentos:pagamentos.total,
        debitos:debitos.total,
        dividas:dividas.total,
        parcelamentos:parcelamentos.total,
        contribuintes:contribuintes.total,
        imoveis:imoveis.total,
        economicos:economicos.total,
        pagamentosDetalhados:pagamentosDetalhados.total
      },
      auditMode:"FULL",
      sourceAudit:Object.fromEntries([
        ["pagamentos",pagamentos],
        ["debitos",debitos],
        ["dividas",dividas],
        ["parcelamentos",parcelamentos],
        ["contribuintes",contribuintes],
        ["imoveis",imoveis],
        ["economicos",economicos],
        ["pagamentosDetalhados",pagamentosDetalhados]
      ].map(([name,src])=>[name,{
        reportedTotal:src.reportedTotal,
        loaded:src.loaded,
        pages:src.pages,
        complete:Boolean(src.complete),
        truncated:Boolean(src.truncated),
        repeatedPage:Boolean(src.repeatedPage),
        totalMismatch:Boolean(src.totalMismatch),
        pageMeta:Array.isArray(src.pageMeta)?src.pageMeta:[],
        pageLimit:src.pageLimit,
        hasMore:Boolean(src.hasMore),
        nextOffset:src.nextOffset!==undefined?src.nextOffset:null,
        startOffset:src.startOffset!==undefined?src.startOffset:0,
        error:src.error,
        errorStatus:src.errorStatus,
        errorDetail:src.errorDetail,
        detectedFields:diagnosticFieldNames(src.rows)
      }]))
    }
  };
}


function truthyValue(row,paths) {
  const raw=firstValue(row,paths);
  if (raw===undefined || raw===null || raw==="") return false;
  if (typeof raw==="boolean") return raw;
  const v=String(raw).trim().toLowerCase();
  return ["true","1","sim","s","yes","y","ativo","a","principal"].includes(v);
}

function countWhere(rows,predicate) {
  let count=0;
  for (const row of rows) if (predicate(row)) count++;
  return count;
}

function countPresent(rows,paths) {
  return countWhere(rows,row=>firstValue(row,paths)!==undefined);
}

function groupCount(rows,labelPaths,limit=12,filter=null) {
  return topGroups(rows,{labelPaths,countOnly:true,limit,filter});
}

function groupSum(rows,labelPaths,valuePaths,limit=12,filter=null) {
  return topGroups(rows,{labelPaths,valuePaths,limit,filter});
}

function chartGroups(groups,label="Quantidade",format="number") {
  return {
    format,
    labels:groups.map(([k])=>String(k)),
    datasets:[{label,data:groups.map(([,v])=>v)}]
  };
}

function chartFixed(labels,values,label="Quantidade",format="number") {
  return {format,labels,datasets:[{label,data:values}]};
}

function monthlyCount(rows,datePaths,periodo,exercicio,filter=null) {
  const selected=filter?rows.filter(filter):rows;
  const base=monthSeries(selected,{datePaths,valuePaths:["__count__"],periodo,exercicio});
  const buckets=new Map(base.labels.map((label,i)=>[label,i]));
  const values=new Array(base.labels.length).fill(0);
  let months=[];
  if (periodo==="12m") {
    const now=new Date();
    for(let i=11;i>=0;i--) months.push(new Date(now.getFullYear(),now.getMonth()-i,1));
  } else {
    for(let m=0;m<12;m++) months.push(new Date(Number(exercicio),m,1));
  }
  for(const row of selected){
    const d=dateValue(row,datePaths);
    if(!d) continue;
    if(!periodIncludes(row,{periodo,exercicio,datePaths})) continue;
    const idx=months.findIndex(m=>m.getFullYear()===d.getFullYear()&&m.getMonth()===d.getMonth());
    if(idx>=0) values[idx]++;
  }
  return {labels:base.labels,values};
}

function monthlyMulti(rows,datePaths,measures,periodo,exercicio,filter=null) {
  const selected=filter?rows.filter(filter):rows;
  const first=monthSeries(selected,{datePaths,valuePaths:measures[0].paths,periodo,exercicio});
  return {
    labels:first.labels,
    datasets:measures.map(m=>({
      label:m.label,
      data:monthSeries(selected,{datePaths,valuePaths:m.paths,periodo,exercicio}).values
    }))
  };
}

function dailySeries(rows,datePaths,valuePaths,exercicio) {
  const grouped=new Map();
  for(const row of rows){
    const d=dateValue(row,datePaths);
    if(!d || d.getFullYear()!==Number(exercicio)) continue;
    const key=d.toISOString().slice(0,10);
    grouped.set(key,(grouped.get(key)||0)+numericValue(row,valuePaths));
  }
  const entries=[...grouped.entries()].sort((a,b)=>a[0].localeCompare(b[0])).slice(-60);
  return {
    labels:entries.map(([k])=>new Date(k+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})),
    values:entries.map(([,v])=>v)
  };
}

function numberBucket(value,bounds) {
  const n=Number(value);
  if(!Number.isFinite(n)) return "Não informado";
  for(const [max,label] of bounds) if(n<=max) return label;
  return bounds.length?("Acima de "+bounds[bounds.length-1][0]):String(n);
}

function dashboardWarnings(entries) {
  return entries
    .filter(([,src])=>src && (src.error||src.truncated||src.totalMismatch))
    .map(([source,src])=>({
      source,
      error:src.error,
      truncated:Boolean(src.truncated),
      totalMismatch:Boolean(src.totalMismatch),
      errorStatus:src.errorStatus||null,
      errorDetail:src.errorDetail||null
    }));
}

function diagnosticFieldNames(rows,maxRows=3,maxDepth=3) {
  const names=new Set();

  function walk(value,prefix,depth) {
    if (!value || typeof value!=="object" || Array.isArray(value) || depth>maxDepth) return;
    for (const [key,child] of Object.entries(value)) {
      const path=prefix ? prefix+"."+key : key;
      names.add(path);
      if (child && typeof child==="object" && !Array.isArray(child)) {
        walk(child,path,depth+1);
      }
    }
  }

  for (const row of rows.slice(0,maxRows)) walk(row,"",0);
  return [...names].sort().slice(0,160);
}

function dashboardMeta(entries,extra={}) {
  return {
    generatedAt:new Date().toISOString(),
    publicAggregateMode:true,
    auditMode:"FULL",
    warnings:dashboardWarnings(entries),
    sourceRows:Object.fromEntries(entries.map(([name,src])=>[name,src?src.rows.length:0])),
    sourceTotals:Object.fromEntries(entries.map(([name,src])=>[name,src?src.total:0])),
    sourceAudit:Object.fromEntries(entries.map(([name,src])=>[name,{
      reportedTotal:src?src.reportedTotal:null,
      loaded:src?src.loaded:0,
      pages:src?src.pages:0,
      complete:Boolean(src&&src.complete),
      truncated:Boolean(src&&src.truncated),
      repeatedPage:Boolean(src&&src.repeatedPage),
      totalMismatch:Boolean(src&&src.totalMismatch),
      pageMeta:src&&Array.isArray(src.pageMeta)?src.pageMeta:[],
      pageLimit:src?src.pageLimit:null,
      hasMore:Boolean(src&&src.hasMore),
      nextOffset:src&&src.nextOffset!==undefined?src.nextOffset:null,
      startOffset:src&&src.startOffset!==undefined?src.startOffset:0,
      error:src?src.error:null,
      errorStatus:src?src.errorStatus:null,
      errorDetail:src?src.errorDetail:null,
      detectedFields:src?diagnosticFieldNames(src.rows):[]
    }])),
    ...extra
  };
}


function dashboardFilterValue(url,key) {
  return String(url.searchParams.get(key)||"").trim();
}

function filterOptionsFromRows(rows,paths,limit=80) {
  const seen=new Map();
  for(const row of rows||[]) {
    const value=stringValue(row,paths,"").trim();
    if(!value || value==="Não informado") continue;
    const normalized=value.toLocaleLowerCase("pt-BR");
    if(!seen.has(normalized)) seen.set(normalized,value);
    if(seen.size>=limit) break;
  }
  return [...seen.values()]
    .sort((a,b)=>a.localeCompare(b,"pt-BR",{numeric:true,sensitivity:"base"}))
    .map(value=>({value,label:value}));
}

function matchesDashboardFilter(row,value,paths) {
  if(!value) return true;
  const actual=stringValue(row,paths,"").trim();
  return actual.localeCompare(String(value).trim(),"pt-BR",{sensitivity:"base"})===0;
}

function activeFilterObject(values) {
  return Object.fromEntries(
    Object.entries(values||{}).filter(([,value])=>value!==undefined&&value!==null&&String(value)!=="")
  );
}

async function buildRevenueDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());

  const filters={
    tipoPagamento:dashboardFilterValue(url,"tipoPagamento"),
    tipoBaixa:dashboardFilterValue(url,"tipoBaixa"),
    receita:dashboardFilterValue(url,"receita"),
    classificacaoGuia:dashboardFilterValue(url,"classificacaoGuia")
  };

  const [pag,det,val]=await Promise.all([
    safeBethaRows(env,tenant,"bi","pagamentos"),
    safeBethaRows(env,tenant,"bi","pagamentos-detalhados"),
    safeBethaRows(env,tenant,"bi","pagamentos-detalhados-valores")
  ]);

  const pagRows=pag.rows.filter(r=>periodIncludes(r,{
    periodo,exercicio,datePaths:["dataPagamento"],yearPaths:["ano","exercicio"]
  }));

  const detPeriod=det.rows.filter(r=>periodIncludes(r,{
    periodo,exercicio,
    datePaths:["pagamento.dataPagamento","dataPagamento","dtPagamento"],
    yearPaths:["ano","exercicio"]
  }));

  const valPeriod=val.rows.filter(r=>periodIncludes(r,{
    periodo,exercicio,
    datePaths:["dtPagamento","pagamento.dtPagamento"],
    yearPaths:["ano","exercicio"]
  }));

  const paymentMeta=new Map();
  for(const row of pagRows){
    const id=String(firstValue(row,["id"])||"");
    if(!id) continue;
    paymentMeta.set(id,{
      classification:stringValue(row,["classificacaoGuia.descricao","classificacaoGuia.valor"],"Não informado"),
      retroactive:truthyValue(row,["pagamentoRetroativo"]) || Boolean(firstValue(row,["dataPagamentoRetroativo"]))
    });
  }

  const totalPaidRow=row=>
    numericValue(row,["valorPagoLancado"])+
    numericValue(row,["valorPagoCorrecao"])+
    numericValue(row,["valorPagoJuros"])+
    numericValue(row,["valorPagoMulta"]);

  const enrichedAll=valPeriod.map(row=>{
    const paymentId=String(firstValue(row,["idPagamento","pagamento.id"])||"");
    const meta=paymentMeta.get(paymentId)||{};
    return {
      ...row,
      __paymentId:paymentId,
      __classification:meta.classification||"Não informado",
      __retroactive:Boolean(meta.retroactive),
      __totalPaid:totalPaidRow(row)
    };
  });

  const filterOptions={
    tipoPagamento:filterOptionsFromRows(enrichedAll,["pagamento.tipoPagamento.descricao","pagamento.tipoPagamento.valor"]),
    tipoBaixa:filterOptionsFromRows(enrichedAll,["pagamento.tipoBaixa.descricao","pagamento.tipoBaixa.valor"]),
    receita:filterOptionsFromRows(enrichedAll,["receita.descricao","receita.abreviatura"]),
    classificacaoGuia:filterOptionsFromRows(enrichedAll,["__classification"])
  };

  const filteredAll=enrichedAll.filter(row=>
    matchesDashboardFilter(row,filters.tipoPagamento,["pagamento.tipoPagamento.descricao","pagamento.tipoPagamento.valor"]) &&
    matchesDashboardFilter(row,filters.tipoBaixa,["pagamento.tipoBaixa.descricao","pagamento.tipoBaixa.valor"]) &&
    matchesDashboardFilter(row,filters.receita,["receita.descricao","receita.abreviatura"]) &&
    matchesDashboardFilter(row,filters.classificacaoGuia,["__classification"])
  );

  const financialRows=filteredAll.filter(r=>!firstValue(r,["pagamento.dhEstorno","pagamento.dataHoraEstorno"]));
  const reversedRows=filteredAll.filter(r=>Boolean(firstValue(r,["pagamento.dhEstorno","pagamento.dataHoraEstorno"])));

  const activeFilterCount=Object.keys(activeFilterObject(filters)).length;
  const allowedPaymentIds=new Set(financialRows.map(r=>r.__paymentId).filter(Boolean));
  const detRows=activeFilterCount
    ? detPeriod.filter(row=>allowedPaymentIds.has(String(firstValue(row,["pagamento.id","idPagamento"])||"")))
    : detPeriod.filter(row=>!firstValue(row,["pagamento.dataHoraEstorno","pagamento.dhEstorno"]));

  const day=dailySeries(
    financialRows.map(r=>({dtPagamento:firstValue(r,["dtPagamento","pagamento.dtPagamento"]),__totalPaid:r.__totalPaid})),
    ["dtPagamento"],["__totalPaid"],exercicio
  );
  const mon=monthSeries(
    financialRows,
    {datePaths:["dtPagamento","pagamento.dtPagamento"],valuePaths:["__totalPaid"],periodo,exercicio}
  );

  const credit=groupSum(
    detRows,
    ["creditoTributario.descricao","creditoTributario.abreviatura","idCreditoTributario"],
    ["valorPagoLancado"],
    12
  );
  const receita=groupSum(financialRows,["receita.descricao","receita.abreviatura"],["__totalPaid"],12);
  const tipo=groupSum(financialRows,["pagamento.tipoPagamento.descricao","pagamento.tipoPagamento.valor"],["__totalPaid"],12);
  const baixa=groupSum(financialRows,["pagamento.tipoBaixa.descricao","pagamento.tipoBaixa.valor"],["__totalPaid"],12);
  const guias=groupSum(financialRows,["__classification"],["__totalPaid"],12);

  const retro=monthSeries(
    financialRows.filter(r=>r.__retroactive),
    {datePaths:["dtPagamento","pagamento.dtPagamento"],valuePaths:["__totalPaid"],periodo,exercicio}
  );

  const est=monthlyCount(
    reversedRows,
    ["pagamento.dhEstorno","pagamento.dataHoraEstorno"],
    periodo,exercicio
  );

  const acres=monthlyMulti(
    financialRows,
    ["dtPagamento","pagamento.dtPagamento"],
    [
      {label:"Correção",paths:["valorPagoCorrecao"]},
      {label:"Juros",paths:["valorPagoJuros"]},
      {label:"Multa",paths:["valorPagoMulta"]}
    ],
    periodo,exercicio
  );

  const descontosConcedidos=
    sumRows(financialRows,["valorDescontoConcedidoLancado"])+
    sumRows(financialRows,["valorDescontoConcedidoCorrecao"])+
    sumRows(financialRows,["valorDescontoConcedidoJuros"])+
    sumRows(financialRows,["valorDescontoConcedidoMulta"]);

  const descontosAplicados=
    sumRows(financialRows,["valorDescontoLancado"])+
    sumRows(financialRows,["valorDescontoCorrecao"])+
    sumRows(financialRows,["valorDescontoJuros"])+
    sumRows(financialRows,["valorDescontoMulta"]);

  const descontos=descontosConcedidos||descontosAplicados;
  const anistias=
    sumRows(financialRows,["valorAnistiadoLancado"])+
    sumRows(financialRows,["valorAnistiadoCorrecao"])+
    sumRows(financialRows,["valorAnistiadoJuros"])+
    sumRows(financialRows,["valorAnistiadoMulta"]);
  const remissoes=
    sumRows(financialRows,["valorRemidoLancado"])+
    sumRows(financialRows,["valorRemidoCorrecao"])+
    sumRows(financialRows,["valorRemidoJuros"])+
    sumRows(financialRows,["valorRemidoMulta"]);

  const tributo=sumRows(financialRows,["valorPagoLancado"]);
  const correcao=sumRows(financialRows,["valorPagoCorrecao"]);
  const juros=sumRows(financialRows,["valorPagoJuros"]);
  const multa=sumRows(financialRows,["valorPagoMulta"]);
  const totalPago=tributo+correcao+juros+multa;

  return {
    view:"arrecadacao",
    tenant:{id:tenant.id,name:tenant.name},
    period:{periodo,exercicio},
    filters:activeFilterObject(filters),
    kpis:{
      "total-pago":totalPago,
      "tributo-pago":tributo,
      "juros-pagos":juros,
      "multa-paga":multa,
      "correcao-paga":correcao,
      descontos
    },
    charts:{
      "arrecadacao-dia":{format:"currency",labels:day.labels,datasets:[{label:"Arrecadado",data:day.values}]},
      "arrecadacao-mes":{format:"currency",labels:mon.labels,datasets:[{label:"Arrecadado",data:mon.values}]},
      "arrecadacao-credito":chartGroups(credit,"Tributo arrecadado","currency"),
      "arrecadacao-receita":chartGroups(receita,"Arrecadado","currency"),
      "composicao-pagamento":chartFixed(["Tributo","Correção","Juros","Multa"],[tributo,correcao,juros,multa],"Valor","currency"),
      "tipo-pagamento":chartGroups(tipo,"Arrecadado","currency"),
      "tipo-baixa":chartGroups(baixa,"Arrecadado","currency"),
      retroativos:{format:"currency",labels:retro.labels,datasets:[{label:"Retroativos",data:retro.values}]},
      estornos:{format:"number",labels:est.labels,datasets:[{label:"Estornos",data:est.values}]},
      "descontos-anistias":chartFixed(["Descontos","Anistias","Remissões"],[descontos,anistias,remissoes],"Valor","currency"),
      acrescimos:{format:"currency",labels:acres.labels,datasets:acres.datasets},
      guias:chartGroups(guias,"Arrecadado","currency")
    },
    meta:dashboardMeta(
      [["pagamentos",pag],["pagamentosDetalhados",det],["pagamentosDetalhadosValores",val]],
      {
        calculationBasis:"pagamentos-detalhados-valores",
        excludesReversedPayments:true,
        filterOptions,
        appliedFilters:activeFilterObject(filters),
        fieldMapping:{
          data:"dtPagamento",
          tributo:"valorPagoLancado",
          correcao:"valorPagoCorrecao",
          juros:"valorPagoJuros",
          multa:"valorPagoMulta",
          tipoPagamento:"pagamento.tipoPagamento.descricao",
          tipoBaixa:"pagamento.tipoBaixa.descricao"
        }
      }
    )
  };
}

async function buildDebtsDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const filters={
    situacao:dashboardFilterValue(url,"situacao"),
    credito:dashboardFilterValue(url,"credito"),
    origem:dashboardFilterValue(url,"origem"),
    carteira:dashboardFilterValue(url,"carteira")
  };

  const [deb,debRec,creditos]=await Promise.all([
    safeBethaRows(env,tenant,"bi","debitos"),
    safeBethaRows(env,tenant,"bi","debitos-receitas"),
    safeBethaRows(env,tenant,"base","creditos-tributarios")
  ]);

  const periodRows=deb.rows.filter(r=>periodIncludes(r,{
    periodo,exercicio,datePaths:["dhDebito"],yearPaths:["ano"]
  }));

  const creditNames=new Map();
  for(const row of creditos.rows){
    const id=String(firstValue(row,["id"])||"");
    if(id) creditNames.set(id,stringValue(row,["descricao","abreviatura","nome"],id));
  }

  const now=Date.now();
  const enrichedAll=periodRows.map(row=>{
    const creditId=String(firstValue(row,["idCredito"])||"");
    let origem="Outros";
    if(firstValue(row,["imovel.id","imovel.idImovel","idContribImoveis"])!==undefined) origem="Imobiliário";
    else if(firstValue(row,["economico.id","economico.idEconomico"])!==undefined) origem="Econômico";
    else if(firstValue(row,["idReceitasDiversas","idReceitaDiversaLancto"])!==undefined) origem="Receita diversa";
    else if(firstValue(row,["idObra"])!==undefined) origem="Obras";
    else if(firstValue(row,["idTransferenciaImoveis"])!==undefined) origem="ITBI";
    else if(firstValue(row,["idNotasAvulsas"])!==undefined) origem="Nota avulsa";

    const paid=Boolean(firstValue(row,["dtPgto"]));
    const situation=stringValue(row,["situacao"],"");
    const open=!paid && !/cancel|quit|pago|baix/i.test(situation);
    const due=dateValue(row,["dtVcto"]);
    const overdue=open && Boolean(due&&due.getTime()<now);

    return {
      ...row,
      __creditoLabel:creditNames.get(creditId)||creditId||"Não informado",
      __origem:origem,
      __open:open,
      __paid:paid,
      __overdue:overdue
    };
  });

  const filterOptions={
    situacao:filterOptionsFromRows(enrichedAll,["situacao"]),
    credito:filterOptionsFromRows(enrichedAll,["__creditoLabel"]),
    origem:filterOptionsFromRows(enrichedAll,["__origem"])
  };

  const rows=enrichedAll.filter(row=>{
    if(!matchesDashboardFilter(row,filters.situacao,["situacao"])) return false;
    if(!matchesDashboardFilter(row,filters.credito,["__creditoLabel"])) return false;
    if(!matchesDashboardFilter(row,filters.origem,["__origem"])) return false;
    if(filters.carteira==="aberto" && !row.__open) return false;
    if(filters.carteira==="vencido" && !row.__overdue) return false;
    if(filters.carteira==="pago" && !row.__paid) return false;
    return true;
  });

  const paidRows=rows.filter(r=>r.__paid);
  const openRows=rows.filter(r=>r.__open);
  const month=monthSeries(rows,{datePaths:["dhDebito"],valuePaths:["vlLancado"],periodo,exercicio});
  const sit=groupSum(rows,["situacao"],["vlLancado"],12);
  const credito=groupSum(rows,["__creditoLabel"],["vlLancado"],12);

  const aging=new Map();
  for(const row of openRows){
    const d=dateValue(row,["dtVcto"]);
    let label="Sem vencimento";
    if(d){
      const days=Math.floor((now-d.getTime())/86400000);
      label=days<=0?"A vencer":days<=30?"1–30 dias":days<=90?"31–90 dias":days<=180?"91–180 dias":days<=365?"181–365 dias":"Acima de 1 ano";
    }
    aging.set(label,(aging.get(label)||0)+numericValue(row,["vlLancado"]));
  }

  const years=groupSum(rows,["ano"],["vlLancado"],20);
  const unica=groupSum(rows,["unica"],["vlLancado"],10);
  const origem=groupSum(rows,["__origem"],["vlLancado"],12);
  const descontos=groupSum(rows,["situacao"],["vlDesconto"],12);
  const selectedDebtIds=new Set(rows.map(r=>String(firstValue(r,["id"])||"")).filter(Boolean));
  const debtRevenueRows=debRec.rows.filter(row=>{
    const debtId=String(firstValue(row,["idDebito","debito.id","idDebitos"])||"");
    return !debtId || selectedDebtIds.has(debtId);
  });
  const receitaDebitos=groupSum(
    debtRevenueRows,
    ["receita.descricao","receita.abreviatura","idReceita"],
    ["vlLancado","valorLancado","valor","vlReceita"],
    12
  );

  return {
    view:"debitos",
    tenant:{id:tenant.id,name:tenant.name},
    period:{periodo,exercicio},
    filters:activeFilterObject(filters),
    kpis:{
      "vl-lancado":sumRowsOrNull(rows,["vlLancado"]),
      "qtd-debitos":rows.length,
      vencidos:countWhere(rows,r=>r.__overdue),
      pagos:paidRows.length,
      "descontos-debito":sumRowsOrNull(rows,["vlDesconto"])
    },
    charts:{
      "lancamentos-mensais":{format:"currency",labels:month.labels,datasets:[{label:"Lançado",data:month.values}]},
      "debitos-situacao":chartGroups(sit,"Lançado","currency"),
      "debitos-credito":chartGroups(credito,"Lançado","currency"),
      "aging-debitos":chartGroups([...aging.entries()],"Carteira em aberto","currency"),
      "debitos-ano":chartGroups(years,"Lançado","currency"),
      "unica-parcelada":chartGroups(unica,"Lançado","currency"),
      "origem-cadastro":chartGroups(origem,"Lançado","currency"),
      "descontos-situacao":chartGroups(descontos,"Descontos","currency"),
      "debitos-receita":chartGroups(receitaDebitos,"Lançado por receita","currency")
    },
    meta:dashboardMeta(
      [["debitos",deb],["debitosReceitas",debRec],["creditosTributarios",creditos]],
      {
        agingOpenOnly:true,
        filterOptions,
        appliedFilters:activeFilterObject(filters),
        fieldMapping:{
          dataLancamento:"dhDebito",
          vencimento:"dtVcto",
          pagamento:"dtPgto",
          situacao:"situacao",
          credito:"idCredito",
          valor:"vlLancado",
          desconto:"vlDesconto"
        }
      }
    )
  };
}

async function buildActiveDebtDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const filters={
    situacao:dashboardFilterValue(url,"situacao"),
    credito:dashboardFilterValue(url,"credito"),
    anoDivida:dashboardFilterValue(url,"anoDivida"),
    cobranca:dashboardFilterValue(url,"cobranca")
  };

  const [div,enc,rec,payvals,baseDiv]=await Promise.all([
    safeBethaRows(env,tenant,"bi","dividas"),
    safeBethaRows(env,tenant,"base","encerramento-dividas"),
    safeBethaRows(env,tenant,"bi","dividas-receitas"),
    safeBethaRows(env,tenant,"bi","pagamentos-detalhados-valores"),
    safeBethaRows(env,tenant,"base","dividas")
  ]);

  const closingKey=row=>closingPeriod(row)?.key||0;

  const closingKeys=enc.rows.map(closingKey).filter(Boolean);
  const latestKey=closingKeys.length?Math.max(...closingKeys):0;

  const creditNames=new Map();
  const contributorNames=new Map();
  for(const row of baseDiv.rows){
    const creditId=String(firstValue(row,["creditoTributario.id"])||"");
    if(creditId&&!creditNames.has(creditId)){
      creditNames.set(creditId,stringValue(row,["creditoTributario.descricao","creditoTributario.abreviatura"],creditId));
    }
    const contributorId=String(firstValue(row,["contribuinte.id"])||"");
    if(contributorId&&!contributorNames.has(contributorId)){
      contributorNames.set(contributorId,stringValue(row,["contribuinte.nome","contribuinte.nomeFantasia"],contributorId));
    }
  }

  const debtState=new Map();
  for(const row of div.rows){
    const id=String(firstValue(row,["id"])||"");
    if(!id) continue;
    debtState.set(id,{
      execucao:truthyValue(row,["sitExecucao"]),
      protesto:truthyValue(row,["protesto"]),
      penhora:Boolean(firstValue(row,["penhora"])),
      cda:truthyValue(row,["possuiCdaEmitida"])
    });
  }

  const enrichClosing=row=>{
    const debtId=String(firstValue(row,["idDivida"])||"");
    const creditId=String(firstValue(row,["idCreditoTributario"])||"");
    const contributorId=String(firstValue(row,["idContribuinte"])||"");
    const state=debtState.get(debtId)||{};
    return {
      ...row,
      __debtId:debtId,
      __creditoLabel:creditNames.get(creditId)||creditId||"Não informado",
      __contribuinteLabel:contributorNames.get(contributorId)||("Contribuinte "+(contributorId||"não identificado")),
      __execucao:Boolean(state.execucao),
      __protesto:Boolean(state.protesto),
      __penhora:Boolean(state.penhora),
      __cda:Boolean(state.cda)
    };
  };

  const closingAll=enc.rows.map(enrichClosing);
  const latestAll=latestKey?closingAll.filter(r=>closingKey(r)===latestKey):[];

  const filterOptions={
    situacao:filterOptionsFromRows(latestAll,["situacaoDivida.descricao","situacaoDivida"]),
    credito:filterOptionsFromRows(latestAll,["__creditoLabel"]),
    anoDivida:filterOptionsFromRows(latestAll,["anoDivida"])
  };

  const passFilters=row=>{
    if(!matchesDashboardFilter(row,filters.situacao,["situacaoDivida.descricao","situacaoDivida"])) return false;
    if(!matchesDashboardFilter(row,filters.credito,["__creditoLabel"])) return false;
    if(!matchesDashboardFilter(row,filters.anoDivida,["anoDivida"])) return false;
    if(filters.cobranca==="execucao"&&!row.__execucao) return false;
    if(filters.cobranca==="protesto"&&!row.__protesto) return false;
    if(filters.cobranca==="penhora"&&!row.__penhora) return false;
    return true;
  };

  const latestRows=latestAll.filter(passFilters);
  const activeFilters=activeFilterObject(filters);
  const closingRows=Object.keys(activeFilters).length?closingAll.filter(passFilters):closingAll;

  const stockByMonth=new Map();
  for(const row of closingRows){
    const key=closingKey(row);
    if(!key) continue;
    stockByMonth.set(key,(stockByMonth.get(key)||0)+numericValue(row,["valorSaldo"]));
  }
  const stockEntries=[...stockByMonth.entries()].sort((a,b)=>a[0]-b[0]).slice(-24);
  const stockChart={
    format:"currency",
    labels:stockEntries.map(([key])=>String(key%100).padStart(2,"0")+"/"+Math.floor(key/100)),
    datasets:[{label:"Saldo",data:stockEntries.map(([,value])=>value)}]
  };

  const currentSaldo=sumRows(latestRows,["valorSaldo"]);
  const currentCorrecao=sumRows(latestRows,["valorCorrecao"]);
  const currentJuros=sumRows(latestRows,["valorJuros"]);
  const currentMulta=sumRows(latestRows,["valorMulta"]);
  const currentPrincipal=Math.max(0,currentSaldo-currentCorrecao-currentJuros-currentMulta);

  const latestDebtIds=new Set(latestRows.map(r=>r.__debtId).filter(Boolean));

  const basePeriodAll=baseDiv.rows.filter(r=>periodIncludes(r,{
    periodo,exercicio,datePaths:["dataInscricao"],yearPaths:["ano"]
  }));

  const basePeriodRows=basePeriodAll.filter(row=>{
    const creditLabel=stringValue(row,["creditoTributario.descricao","creditoTributario.abreviatura","creditoTributario.id"],"");
    if(filters.credito&&creditLabel.localeCompare(filters.credito,"pt-BR",{sensitivity:"base"})!==0) return false;
    if(filters.anoDivida&&!matchesDashboardFilter(row,filters.anoDivida,["ano"])) return false;
    if(filters.situacao&&!matchesDashboardFilter(row,filters.situacao,["situacaoDivida.descricao","situacaoDivida"])) return false;
    if(filters.cobranca==="execucao"&&!truthyValue(row,["executada.valor","executada.descricao","executada"])) return false;
    if(filters.cobranca==="protesto"&&!truthyValue(row,["protestada.valor","protestada.descricao","protestada"])) return false;
    if(filters.cobranca==="penhora"&&!Boolean(firstValue(row,["penhora"]))) return false;
    return true;
  });

  const inscriptionRows=basePeriodRows.map(row=>({
    ...row,
    __valorInscrito:
      numericValue(row,["valorTributoInscrito"])+
      numericValue(row,["valorCorrecaoInscrito"])+
      numericValue(row,["valorJurosInscrito"])+
      numericValue(row,["valorMultaInscrito"])
  }));

  const inscriptions=monthSeries(inscriptionRows,{
    datePaths:["dataInscricao"],valuePaths:["__valorInscrito"],periodo,exercicio
  });

  const status=groupCount(latestRows,["situacaoDivida.descricao","situacaoDivida"],12);
  const aging=groupSum(latestRows,["anoDivida"],["valorSaldo"],20);
  const credito=groupSum(latestRows,["__creditoLabel"],["valorSaldo"],12);
  const topDevedores=groupSum(latestRows,["__contribuinteLabel"],["valorSaldo"],15);

  const cobranca=chartFixed(
    ["Execução","Protesto","Penhora"],
    [
      countWhere(latestRows,r=>r.__execucao),
      countWhere(latestRows,r=>r.__protesto),
      countWhere(latestRows,r=>r.__penhora)
    ],
    "Dívidas","number"
  );

  const debtReferencePaths=["idDivida","idDividas","divida.id","iDividas"];
  const recoveryBase=payvals.rows
    .filter(r=>firstValue(r,debtReferencePaths)!==undefined)
    .filter(r=>!firstValue(r,["pagamento.dhEstorno","pagamento.dataHoraEstorno","dhEstorno","dataHoraEstorno"]));

  const recoveryRows=(Object.keys(activeFilters).length
    ? recoveryBase.filter(r=>latestDebtIds.has(String(firstValue(r,debtReferencePaths)||"")))
    : recoveryBase
  ).map(r=>({
    ...r,
    __totalPaid:
      numericValue(r,["valorPagoLancado"])+
      numericValue(r,["valorPagoCorrecao"])+
      numericValue(r,["valorPagoJuros"])+
      numericValue(r,["valorPagoMulta"])
  }));

  const recup=monthSeries(recoveryRows,{
    datePaths:["dtPagamento","dataPagamento","dhPagamento","pagamento.dtPagamento","pagamento.dataPagamento","pagamento.dhPagamento"],valuePaths:["__totalPaid"],periodo,exercicio
  });

  const recRows=Object.keys(activeFilters).length
    ? rec.rows.filter(r=>latestDebtIds.has(String(firstValue(r,["idDividas"])||"")))
    : rec.rows;

  const recGroups=new Map();
  for(const row of recRows){
    const label=stringValue(row,["idCreditosTributariosRec"],"Não informado");
    const item=recGroups.get(label)||{inscrito:0,saldo:0};
    item.inscrito+=numericValue(row,["vlInscritoCredito"]);
    item.saldo+=numericValue(row,["vlSaldo"]);
    recGroups.set(label,item);
  }
  const topReceitas=[...recGroups.entries()].sort((a,b)=>b[1].saldo-a[1].saldo).slice(0,12);

  const cancel=monthlyCount(
    basePeriodRows,
    ["dataCancelamento","dataPrescricao"],
    periodo,exercicio,
    r=>Boolean(firstValue(r,["dataCancelamento","dataPrescricao"]))
  );

  return {
    view:"divida",
    tenant:{id:tenant.id,name:tenant.name},
    period:{periodo,exercicio},
    filters:activeFilters,
    kpis:{
      "saldo-divida":currentSaldo,
      inscrito:sumRows(latestRows,["valorInscrito"]),
      "qtd-dividas":latestRows.length,
      executadas:countWhere(latestRows,r=>r.__execucao),
      protestadas:countWhere(latestRows,r=>r.__protesto),
      cda:countWhere(latestRows,r=>r.__cda)
    },
    charts:{
      "estoque-divida":stockChart,
      "inscricoes-mes":{format:"currency",labels:inscriptions.labels,datasets:[{label:"Inscrito",data:inscriptions.values}]},
      "composicao-divida":chartFixed(["Principal","Correção","Juros","Multa"],[currentPrincipal,currentCorrecao,currentJuros,currentMulta],"Saldo atual","currency"),
      "status-divida":chartGroups(status,"Dívidas","number"),
      "aging-divida":chartGroups(aging,"Saldo atual","currency"),
      "divida-credito":chartGroups(credito,"Saldo atual","currency"),
      cobranca,
      recuperacao:{format:"currency",labels:recup.labels,datasets:[{label:"Recuperado",data:recup.values}]},
      "saldo-receitas-divida":{
        format:"currency",
        labels:topReceitas.map(([key])=>key),
        datasets:[
          {label:"Inscrito",data:topReceitas.map(([,value])=>value.inscrito)},
          {label:"Saldo",data:topReceitas.map(([,value])=>value.saldo)}
        ]
      },
      cancelamentos:{format:"number",labels:cancel.labels,datasets:[{label:"Cancelamentos/prescrições",data:cancel.values}]},
      "top-devedores":chartGroups(topDevedores,"Saldo atual","currency")
    },
    meta:dashboardMeta(
      [["dividas",div],["encerramentoDividas",enc],["dividasReceitas",rec],["pagamentosDetalhadosValores",payvals],["baseDividas",baseDiv]],
      {
        currentClosingKey:latestKey||null,
        currentClosingRows:latestRows.length,
        calculationBasis:"último encerramento mensal disponível",
        filterOptions,
        appliedFilters:activeFilters,
        fieldMapping:{
          saldo:"valorSaldo",
          inscrito:"valorInscrito",
          encerramento:"anoEncerramento/mesEncerramento",
          inscricao:"dataInscricao",
          contribuinte:"idContribuinte"
        }
      }
    )
  };
}

async function buildInstallmentsDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const filters={
    situacao:dashboardFilterValue(url,"situacao"),
    tipoEntrada:dashboardFilterValue(url,"tipoEntrada"),
    cobranca:dashboardFilterValue(url,"cobranca"),
    inadimplencia:dashboardFilterValue(url,"inadimplencia")
  };

  const [par,parcelas,refs,pagPar]=await Promise.all([
    safeBethaRows(env,tenant,"bi","parcelamentos"),
    safeBethaRows(env,tenant,"bi","parcelamentos-parcelas"),
    safeBethaRows(env,tenant,"bi","parcelamentos-referentes"),
    safeBethaRows(env,tenant,"bi","pagamentos-parcelamentos")
  ]);

  const periodRows=par.rows.filter(r=>periodIncludes(r,{
    periodo,exercicio,datePaths:["dtParcelamento","dhParcelamento"],yearPaths:["anoParcelamento"]
  }));

  const filterOptions={
    situacao:filterOptionsFromRows(periodRows,["situacao.descricao","situacao.valor"]),
    tipoEntrada:filterOptionsFromRows(periodRows,["tipoEntrada"])
  };

  const rows=periodRows.filter(row=>{
    if(!matchesDashboardFilter(row,filters.situacao,["situacao.descricao","situacao.valor"])) return false;
    if(!matchesDashboardFilter(row,filters.tipoEntrada,["tipoEntrada"])) return false;
    if(filters.cobranca==="executada"&&!truthyValue(row,["dividaExecutada.valor","dividaExecutada.descricao","dividaExecutada"])) return false;
    if(filters.cobranca==="protestada"&&!truthyValue(row,["dividaProtestada.valor","dividaProtestada.descricao","dividaProtestada"])) return false;
    const vencidas=numericValue(row,["qtdParcelasVencidas"]);
    if(filters.inadimplencia==="com-vencidas"&&vencidas<=0) return false;
    if(filters.inadimplencia==="sem-vencidas"&&vencidas>0) return false;
    return true;
  });

  const selectedIds=new Set(rows.map(r=>String(firstValue(r,["id"])||"")).filter(Boolean));
  const parcelRows=parcelas.rows.filter(r=>selectedIds.has(String(firstValue(r,["idParcelamentos"])||"")));
  const refRows=refs.rows.filter(r=>selectedIds.has(String(firstValue(r,["idParcelamentos"])||"")));

  const mon=monthlyCount(rows,["dtParcelamento","dhParcelamento"],periodo,exercicio);
  const situ=groupCount(rows,["situacao.descricao","situacao.valor"],10);

  const qtdBuckets=new Map();
  const vencBuckets=new Map();
  for(const row of rows){
    const q=Number(firstValue(row,["qtdParcela"]));
    const v=Number(firstValue(row,["qtdParcelasVencidas"]));
    const qb=numberBucket(q,[[1,"1"],[6,"2–6"],[12,"7–12"],[24,"13–24"],[48,"25–48"]]);
    const vb=numberBucket(v,[[0,"Nenhuma"],[1,"1"],[3,"2–3"],[6,"4–6"],[12,"7–12"]]);
    qtdBuckets.set(qb,(qtdBuckets.get(qb)||0)+1);
    vencBuckets.set(vb,(vencBuckets.get(vb)||0)+1);
  }

  const parcelSit=groupSum(parcelRows,["situacao"],["vlParcela"],10);
  const entrada=groupSum(rows,["tipoEntrada"],["vlEntrada"],10);
  const cobr=chartFixed(
    ["Dívida executada","Dívida protestada"],
    [
      countWhere(rows,r=>truthyValue(r,["dividaExecutada.valor","dividaExecutada.descricao","dividaExecutada"])),
      countWhere(rows,r=>truthyValue(r,["dividaProtestada.valor","dividaProtestada.descricao","dividaProtestada"]))
    ],
    "Parcelamentos","number"
  );

  const origem=groupCount(refRows,["tipoReferente"],12);
  const canc=monthlyCount(rows,["dtCancelamento"],periodo,exercicio,r=>Boolean(firstValue(r,["dtCancelamento"])));
  const paidParcelRows=parcelRows.filter(r=>Boolean(firstValue(r,["dtPgto"])));
  const linkedPaymentRows=pagPar.rows.filter(row=>{
    const agreementId=String(firstValue(row,["idParcelamento","idParcelamentos","parcelamento.id"])||"");
    return selectedIds.has(agreementId);
  });
  const paymentRows=linkedPaymentRows.length ? linkedPaymentRows : paidParcelRows;
  const pay=monthSeries(paymentRows,{
    datePaths:["dtPagamento","dataPagamento","pagamento.dataPagamento","dtPgto"],
    valuePaths:["valorPago","vlPago","valor","vlParcela"],
    periodo,exercicio
  });

  return {
    view:"parcelamentos",
    tenant:{id:tenant.id,name:tenant.name},
    period:{periodo,exercicio},
    filters:activeFilterObject(filters),
    kpis:{
      "qtd-parcelamentos":rows.length,
      ativos:countWhere(rows,r=>/ativ|abert|vigent/i.test(stringValue(r,["situacao.descricao","situacao"],""))),
      "parcelas-vencidas":rows.reduce((sum,row)=>sum+numericValue(row,["qtdParcelasVencidas"]),0),
      entradas:sumRowsOrNull(rows,["vlEntrada"]),
      "qtd-parcelas":rows.reduce((sum,row)=>sum+numericValue(row,["qtdParcela"]),0),
      cancelados:countWhere(rows,r=>Boolean(firstValue(r,["dtCancelamento"])))
    },
    charts:{
      "parcelamentos-mes":{format:"number",labels:mon.labels,datasets:[{label:"Parcelamentos",data:mon.values}]},
      "situacao-parcelamentos":chartGroups(situ,"Parcelamentos","number"),
      "faixa-parcelas":chartGroups([...qtdBuckets.entries()],"Parcelamentos","number"),
      "vencidas-parcelamento":chartGroups([...vencBuckets.entries()],"Parcelamentos","number"),
      "parcelas-situacao":chartGroups(parcelSit,"Valor das parcelas","currency"),
      "entradas-tipo":chartGroups(entrada,"Entrada","currency"),
      "execucao-protesto":cobr,
      "origem-parcelamento":chartGroups(origem,"Parcelamentos","number"),
      "cancelamentos-parcelamento":{format:"number",labels:canc.labels,datasets:[{label:"Cancelamentos",data:canc.values}]},
      "pagamentos-parcelas":{format:"currency",labels:pay.labels,datasets:[{label:"Parcelas recebidas",data:pay.values}]}
    },
    meta:dashboardMeta(
      [["parcelamentos",par],["parcelas",parcelas],["referentes",refs],["pagamentosParcelamentos",pagPar]],
      {
        parcelRowsFilteredByAgreement:true,
        filterOptions,
        appliedFilters:activeFilterObject(filters),
        fieldMapping:{
          data:"dtParcelamento",
          situacao:"situacao.descricao",
          quantidadeParcelas:"qtdParcela",
          vencidas:"qtdParcelasVencidas",
          entrada:"vlEntrada",
          parcelaValor:"vlParcela",
          parcelaPagamento:"dtPgto"
        }
      }
    )
  };
}

async function buildEconomicsDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const filters={
    busca:dashboardFilterValue(url,"busca"),
    situacao:dashboardFilterValue(url,"situacao"),
    bairro:dashboardFilterValue(url,"bairro")
  };
  const [eco,ativ,pagdet]=await Promise.all([
    safeBethaRows(env,tenant,"bi","economicos"),
    safeBethaRows(env,tenant,"bi","economicos-atividades"),
    safeBethaRows(env,tenant,"bi","pagamentos-detalhados")
  ]);

  const allEcoRows=eco.rows;
  const normalizedSearch=filters.busca.toLocaleLowerCase("pt-BR");
  const ecoRows=allEcoRows.filter(row=>{
    if(filters.situacao&&!matchesDashboardFilter(row,filters.situacao,["situacao","situacao.descricao","status"])) return false;
    if(filters.bairro&&!matchesDashboardFilter(row,filters.bairro,["nomeBairro","bairro.nome","bairro"])) return false;
    if(normalizedSearch){
      const searchable=[
        stringValue(row,["nome"],""),
        stringValue(row,["nomeFantasia"],""),
        stringValue(row,["pessoa.nome"],"")
      ].join(" ").toLocaleLowerCase("pt-BR");
      if(!searchable.includes(normalizedSearch)) return false;
    }
    return true;
  });

  const economicIds=new Set(ecoRows.map(row=>String(firstValue(row,["id","idEconomico"])||"")).filter(Boolean));
  const linkedToEconomic=(row,paths)=>{
    const id=firstValue(row,paths);
    return id!==undefined&&id!==null&&economicIds.has(String(id));
  };
  const ativRows=ativ.rows.filter(row=>linkedToEconomic(row,["idEconomico","economico.id","economicoId"]));
  const issRows=pagdet.rows.filter(row=>linkedToEconomic(row,["idEconomico","economico.id","referente.idEconomico"]));

  const openDates=["dtInicioAtiv","dataInicioAtividade","dataAbertura","dtAbertura"];
  const closeDates=["dtFechamento","dataFechamento","dataEncerramento","dtEncerramento"];
  const opened=monthlyCount(ecoRows,openDates,periodo,exercicio);
  const closed=monthlyCount(ecoRows,closeDates,periodo,exercicio,r=>Boolean(firstValue(r,closeDates)));
  const situ=groupCount(ecoRows,["situacao","situacao.descricao","status"],12);
  const tipos=groupCount(ecoRows,["tipoCadastro","tipoEconomico","tipo"],12);
  const atividade=groupCount(ativRows,["descricaoAtividade","atividade.descricao","atividade.nome","cnae.descricao"],15);
  const principal=groupCount(ativRows,["principal","atividadePrincipal"],5);
  const bairros=groupCount(ecoRows,["nomeBairro","bairro.nome","bairro"],15);
  const iss=monthSeries(issRows,{
    datePaths:["pagamento.dataPagamento","dataPagamento","dtPagamento"],
    valuePaths:["valorPagoLancado","vlPagoLancado","valorPago","vlPago"],periodo,exercicio
  });

  return {
    view:"economicos",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    filters:activeFilterObject(filters),
    filterOptions:{
      situacao:filterOptionsFromRows(allEcoRows,["situacao","situacao.descricao","status"]),
      bairro:filterOptionsFromRows(allEcoRows,["nomeBairro","bairro.nome","bairro"])
    },
    kpis:{
      economicos:ecoRows.length,
      "ativos-economicos":countWhere(ecoRows,r=>!/inativ|baixad|encerr|cancel/i.test(stringValue(r,["situacao","situacao.descricao","status"],""))&&!truthyValue(r,["desativado"])),
      "novos-economicos":ecoRows.filter(r=>periodIncludes(r,{periodo,exercicio,datePaths:openDates,yearPaths:["anoInicio","exercicio"]})).length,
      fechados:ecoRows.filter(r=>Boolean(firstValue(r,closeDates))&&periodIncludes(r,{periodo,exercicio,datePaths:closeDates})).length,
      atividades:ativRows.length
    },
    charts:{
      aberturas:{format:"number",labels:opened.labels,datasets:[{label:"Aberturas",data:opened.values}]},
      fechamentos:{format:"number",labels:closed.labels,datasets:[{label:"Encerramentos",data:closed.values}]},
      "situacao-economicos":chartGroups(situ,"Econômicos","number"),
      "tipo-economico":chartGroups(tipos,"Econômicos","number"),
      "atividades-top":chartGroups(atividade,"Vínculos","number"),
      "atividade-principal":chartGroups(principal,"Vínculos","number"),
      "bairro-economicos":chartGroups(bairros,"Econômicos","number"),
      "iss-arrecadacao":{format:"currency",labels:iss.labels,datasets:[{label:"Arrecadação",data:iss.values}]}
    },
    meta:dashboardMeta([["economicos",eco],["atividades",ativ],["pagamentosDetalhados",pagdet]],{
      filteredRows:{economicos:ecoRows.length,atividades:ativRows.length,pagamentosDetalhados:issRows.length}
    })
  };
}

function propertyRelationIdentity(row) {
  const strict=paths=>paths.map(path=>valueAt(row,path)).find(value=>value!==undefined&&value!==null&&value!==""&&typeof value!=="object");
  const id=strict(["responsavel.id","responsavel.idPessoa","idPessoa","idPessoas","idContribuinte","idResponsavel","pessoa.id","contribuinte.id"]);
  const name=String(strict(["responsavel.nome","responsavel.nomeFantasia","pessoa.nome","contribuinte.nome","nomeResponsavel"])||"");
  const propertyId=String(strict(["iImoveis","idImovel","imovel.id","imovelId"])||"");
  const key=id!==undefined?"id:"+String(id):name?"nome:"+normalizeGlobalSearch(name):"";
  return {key,name:name||(id!==undefined?"Contribuinte "+id:"Responsável não identificado"),propertyId};
}
function propertiesByContributor(relations,propertyIds) {
  const groups=new Map();
  for(const row of relations) {
    const relation=propertyRelationIdentity(row);
    if(!relation.key||!propertyIds.has(relation.propertyId)) continue;
    const group=groups.get(relation.key)||{key:relation.key,label:relation.name,ids:new Set()};
    group.ids.add(relation.propertyId);groups.set(relation.key,group);
  }
  const ordered=[...groups.values()].sort((a,b)=>b.ids.size-a.ids.size||a.label.localeCompare(b.label,"pt-BR"));
  const repeated=new Map();for(const group of ordered)repeated.set(group.label,(repeated.get(group.label)||0)+1);
  return {format:"number",labels:ordered.map(group=>group.label+(repeated.get(group.label)>1&&group.key.startsWith("id:")?" ("+group.key.slice(3)+")":"")),datasets:[{label:"Imóveis",data:ordered.map(group=>group.ids.size)}],selectionValues:ordered.map(group=>group.key)};
}
async function loadPropertyRelationIndex(env,tenant) {
  const scope=await sha256Hex(JSON.stringify([tenant.id,tenant.userAccess,tenant.accessToken]));
  const key="property-relations:v1:"+scope;
  if(env.BI_SESSIONS) {
    const cached=await env.BI_SESSIONS.get(key);
    if(cached) {try {const parsed=typeof cached==="string"?JSON.parse(cached):cached;if(Array.isArray(parsed.rows)&&parsed.complete===true)return parsed;} catch {}}
  }
  const source=await safeBethaRows(env,tenant,"bi","imoveis-responsaveis");
  if(source.error) throw new Error(source.error);
  const result={rows:source.rows.map(propertyRelationIdentity),complete:source.complete===true};
  if(env.BI_SESSIONS&&result.complete)await env.BI_SESSIONS.put(key,JSON.stringify(result),{expirationTtl:300});
  return result;
}

async function buildRealEstateDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const filters={
    bairro:dashboardFilterValue(url,"bairro"),
    logradouro:dashboardFilterValue(url,"logradouro"),
    setor:dashboardFilterValue(url,"setor"),
    zona:dashboardFilterValue(url,"zona"),
    cadastro:dashboardFilterValue(url,"cadastro")
  };
  const [imo,resp,corresp,trans,baseImo,planta,pagdet]=await Promise.all([
    safeBethaRows(env,tenant,"bi","imoveis"),
    safeBethaRows(env,tenant,"bi","imoveis-responsaveis"),
    safeBethaRows(env,tenant,"bi","imoveis-corresponsaveis"),
    safeBethaRows(env,tenant,"bi","transferencias-imoveis"),
    safeBethaRows(env,tenant,"base","imoveis"),
    safeBethaRows(env,tenant,"base","planta-valores"),
    safeBethaRows(env,tenant,"bi","pagamentos-detalhados")
  ]);

  const allImoRows=imo.rows;
  const isRural=row=>truthyValue(row,["rural"])||/rural/i.test(stringValue(row,["tipoZona","zona"],""));
  const isInactive=row=>truthyValue(row,["desativado"])||/inativ|desativ|cancel/i.test(stringValue(row,["situacao","status"],""));
  const imoRows=allImoRows.filter(row=>{
    if(filters.bairro&&!matchesDashboardFilter(row,filters.bairro,["nomeBairro","bairro.nome","bairro"])) return false;
    if(filters.logradouro&&!matchesDashboardFilter(row,filters.logradouro,["nomeLogradouro","logradouro.nome"])) return false;
    if(filters.setor&&!matchesDashboardFilter(row,filters.setor,["setor","setor.codigo","nomeSetor"])) return false;
    if(filters.zona==="rural"&&!isRural(row)) return false;
    if(filters.zona==="urbana"&&isRural(row)) return false;
    if(filters.cadastro==="ativo"&&isInactive(row)) return false;
    if(filters.cadastro==="inativo"&&!isInactive(row)) return false;
    return true;
  });

  const propertyIds=new Set(imoRows.map(row=>String(firstValue(row,["id","idImovel"])||"")).filter(Boolean));
  const linkedToProperty=(row,paths)=>{
    const id=firstValue(row,paths);
    return id!==undefined&&id!==null&&propertyIds.has(String(id));
  };
  const respRows=resp.rows.filter(row=>linkedToProperty(row,["iImoveis","idImovel","imovel.id","imovelId"]));
  const correspRows=corresp.rows.filter(row=>linkedToProperty(row,["iImoveis","idImovel","imovel.id","imovelId"]));
  const transRows=trans.rows.filter(row=>linkedToProperty(row,["idImovel","imovel.id","imovelId"]));
  const iptuRows=pagdet.rows.filter(row=>linkedToProperty(row,["idImovel","imovel.id","referente.idImovel"]));

  const bairros=groupCount(imoRows,["nomeBairro","bairro.nome","bairro"],Infinity);
  const ruas=groupCount(imoRows,["nomeLogradouro","logradouro.nome"],Infinity);
  const setores=groupCount(imoRows,["setor","setor.codigo","nomeSetor"],Infinity);
  const rural=groupCount(imoRows,["rural","tipoZona","zona"],6);
  const ativo=groupCount(imoRows,["desativado","situacao","status"],8);
  const condo=groupCount(imoRows,["nomeCondominio","condominio.nome","condominio"],12);
  const lote=groupCount(imoRows,["nomeLoteamento","loteamento.nome","loteamento"],12);
  const tipo=groupCount(baseImo.rows,["tipoImovel","tipoImovel.descricao","tipo"],12);
  const plantaGroups=groupSum(planta.rows,["bairro.nome","nomeBairro","logradouro.nome","nomeLogradouro"],["vlMetroQuadrado","valorMetroQuadrado","valor"],12);
  const iptu=monthSeries(iptuRows,{
    datePaths:["pagamento.dataPagamento","dataPagamento","dtPagamento"],
    valuePaths:["valorPagoLancado","vlPagoLancado","valorPago","vlPago"],periodo,exercicio
  });
  const perc=new Map();
  for(const r of respRows){
    const p=numericValue(r,["percentual","percentualTitularidade","percResponsabilidade"]);
    const b=numberBucket(p,[[25,"Até 25%"],[50,"26–50%"],[75,"51–75%"],[99.99,"76–99%"],[100,"100%"]]);
    perc.set(b,(perc.get(b)||0)+1);
  }
  const tiposCorresponsaveis=groupCount(correspRows,["tipoCorresponsavel.descricao","tipoCorresponsavel.id"],12);
  return {
    view:"imobiliario",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    filters:activeFilterObject(filters),
    filterOptions:{
      bairro:filterOptionsFromRows(allImoRows,["nomeBairro","bairro.nome","bairro"]),
      setor:filterOptionsFromRows(allImoRows,["setor","setor.codigo","nomeSetor"])
    },
    kpis:{
      "imoveis-total":imoRows.length,
      "imoveis-ativos":countWhere(imoRows,r=>!isInactive(r)),
      rurais:countWhere(imoRows,r=>isRural(r)),
      responsaveis:respRows.length,
      transferencias:transRows.length
    },
    charts:{
      "imoveis-geral":chartFixed(["Urbanos","Rurais"],[countWhere(imoRows,row=>!isRural(row)),countWhere(imoRows,isRural)],"Imóveis","number"),
      "imoveis-urbanos":chartGroups(groupCount(imoRows.filter(row=>!isRural(row)),["nomeBairro","bairro.nome","bairro"],Infinity),"Imóveis urbanos","number"),
      "imoveis-rurais":chartGroups(groupCount(imoRows.filter(isRural),["nomeBairro","bairro.nome","bairro"],Infinity),"Imóveis rurais","number"),
      "imoveis-contribuinte":propertiesByContributor(respRows,propertyIds),
      "bairro-imoveis":chartGroups(bairros,"Imóveis","number"),
      "logradouro-imoveis":chartGroups(ruas,"Imóveis","number"),
      "setor-imoveis":chartGroups(setores,"Imóveis","number"),
      "rural-urbano":chartGroups(rural,"Imóveis","number"),
      "ativos-inativos-imoveis":chartGroups(ativo,"Imóveis","number"),
      condominios:chartGroups(condo,"Imóveis","number"),
      loteamentos:chartGroups(lote,"Imóveis","number"),
      "tipo-imovel":chartGroups(tipo,"Imóveis","number"),
      "planta-valores":chartGroups(plantaGroups,"Valor m²","currency"),
      "iptu-pagamentos":{format:"currency",labels:iptu.labels,datasets:[{label:"Arrecadação",data:iptu.values}]},
      responsabilidade:chartGroups([...perc.entries()],"Responsáveis","number"),
      "corresponsaveis-tipo":chartGroups(tiposCorresponsaveis,"Corresponsáveis","number")
    },
    meta:dashboardMeta([["imoveis",imo],["responsaveis",resp],["corresponsaveis",corresp],["transferencias",trans],["baseImoveis",baseImo],["plantaValores",planta],["pagamentosDetalhados",pagdet]],{
      filterOptions:{bairro:filterOptionsFromRows(allImoRows,["nomeBairro","bairro.nome","bairro"],10000),logradouro:filterOptionsFromRows(allImoRows,["nomeLogradouro","logradouro.nome"],10000),setor:filterOptionsFromRows(allImoRows,["setor","setor.codigo","nomeSetor"],10000)},
      filteredRows:{imoveis:imoRows.length,responsaveis:respRows.length,corresponsaveis:correspRows.length,transferencias:transRows.length,pagamentosDetalhados:iptuRows.length}
    })
  };
}

async function buildItbiDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const filters={
    situacao:dashboardFilterValue(url,"situacao"),
    certidao:dashboardFilterValue(url,"certidao"),
    cobranca:dashboardFilterValue(url,"cobranca")
  };
  const [sol,itens,mov,trans,compra]=await Promise.all([
    safeBethaRows(env,tenant,"bi","solicitacoes-transferencias-imoveis"),
    safeBethaRows(env,tenant,"bi","solicitacoes-transferencias-imoveis-itens"),
    safeBethaRows(env,tenant,"bi","solicitacoes-transferencias-imoveis-movimentacoes"),
    safeBethaRows(env,tenant,"bi","transferencias-imoveis"),
    safeBethaRows(env,tenant,"bi","transferencias-imoveis-compra")
  ]);
  const transRows=trans.rows.filter(row=>{
    if(filters.situacao&&!matchesDashboardFilter(row,filters.situacao,["situacao","situacao.descricao","status"])) return false;
    if(filters.certidao&&!matchesDashboardFilter(row,filters.certidao,["statusCertidaoITBI","statusCertidao","certidaoStatus"])) return false;
    if(filters.cobranca&&!matchesDashboardFilter(row,filters.cobranca,["tipoCobranca","tipoCobranca.descricao","cobranca"])) return false;
    return true;
  });
  const solMon=monthlyCount(sol.rows,["dataHoraSolicitacao","dataSolicitacao","dhSolicitacao"],periodo,exercicio);
  const transMon=monthlyCount(transRows,["dataHoraTransferencia","dataTransferencia","dhTransferencia"],periodo,exercicio);
  const sitSol=groupCount(sol.rows,["situacao","situacao.descricao","status"],10);
  const sitTrans=groupCount(transRows,["situacao","situacao.descricao","status"],10);
  const cert=groupCount(transRows,["statusCertidaoITBI","statusCertidao","certidaoStatus"],10);
  const compGroups=new Map();
  for(const r of itens.rows){
    const label=stringValue(r,["competencia","ano","exercicio"],"Sem competência");
    const x=compGroups.get(label)||{declarado:0,ajustado:0,itbi:0,itbiAj:0,fin:0,vista:0};
    x.declarado+=numericValue(r,["valorDeclarado","vlDeclarado"]);
    x.ajustado+=numericValue(r,["valorDeclaradoAjustado","vlDeclaradoAjustado"]);
    x.itbi+=numericValue(r,["valorITBI","vlITBI","valorItbi"]);
    x.itbiAj+=numericValue(r,["valorITBIAjustado","vlITBIAjustado","valorItbiAjustado"]);
    x.fin+=numericValue(r,["valorFinanciado","vlFinanciado"]);
    x.vista+=numericValue(r,["valorAvista","vlAvista","valorAVista"]);
    compGroups.set(label,x);
  }
  const comps=[...compGroups.entries()].sort((a,b)=>String(a[0]).localeCompare(String(b[0]))).slice(-12);
  const cobr=groupCount(transRows,["tipoCobranca","tipoCobranca.descricao","cobranca"],10);
  const movRows=mov.rows.filter(row=>periodIncludes(row,{
    periodo,exercicio,
    datePaths:["dataHoraMovimentacao","dhMovimentacao","dataMovimentacao","dataHora","dhOperacao"],
    yearPaths:["ano","exercicio"]
  }));
  const movStatus=groupCount(movRows,["situacao","situacao.descricao","status","tipoMovimentacao","tipoMovimentacao.descricao"],12);
  const soldGroups=new Map();
  for(const r of compra.rows){
    const p=numericValue(r,["percVendido","percentualVendido","percentual"]);
    const b=numberBucket(p,[[25,"Até 25%"],[50,"26–50%"],[75,"51–75%"],[99.99,"76–99%"],[100,"100%"]]);
    soldGroups.set(b,(soldGroups.get(b)||0)+1);
  }
  return {
    view:"itbi",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    filters:activeFilterObject(filters),
    filterOptions:{
      situacao:filterOptionsFromRows(trans.rows,["situacao","situacao.descricao","status"]),
      certidao:filterOptionsFromRows(trans.rows,["statusCertidaoITBI","statusCertidao","certidaoStatus"]),
      cobranca:filterOptionsFromRows(trans.rows,["tipoCobranca","tipoCobranca.descricao","cobranca"])
    },
    kpis:{
      solicitacoes:sol.total,
      "transferencias-itbi":transRows.length,
      itbi:sumRowsOrNull(itens.rows,["valorITBI","vlITBI","valorItbi"]),
      declarado:sumRowsOrNull(itens.rows,["valorDeclarado","vlDeclarado"]),
      financiado:sumRowsOrNull(itens.rows,["valorFinanciado","vlFinanciado"])
    },
    charts:{
      "solicitacoes-mes":{format:"number",labels:solMon.labels,datasets:[{label:"Solicitações",data:solMon.values}]},
      "transferencias-mes":{format:"number",labels:transMon.labels,datasets:[{label:"Transferências",data:transMon.values}]},
      "situacao-solicitacoes":chartGroups(sitSol,"Solicitações","number"),
      "situacao-transferencias":chartGroups(sitTrans,"Transferências","number"),
      "certidao-itbi":chartGroups(cert,"Transferências","number"),
      "declarado-ajustado":{format:"currency",labels:comps.map(([k])=>k),datasets:[
        {label:"Declarado",data:comps.map(([,v])=>v.declarado)},
        {label:"Ajustado",data:comps.map(([,v])=>v.ajustado)}
      ]},
      "itbi-ajustado":{format:"currency",labels:comps.map(([k])=>k),datasets:[
        {label:"ITBI",data:comps.map(([,v])=>v.itbi)},
        {label:"ITBI ajustado",data:comps.map(([,v])=>v.itbiAj)}
      ]},
      financiamento:{format:"currency",labels:comps.map(([k])=>k),datasets:[
        {label:"Financiado",data:comps.map(([,v])=>v.fin)},
        {label:"À vista",data:comps.map(([,v])=>v.vista)}
      ]},
      "tipo-cobranca":chartGroups(cobr,"Transferências","number"),
      "movimentacoes-itbi":chartGroups(movStatus,"Movimentações","number"),
      compradores:chartGroups([...soldGroups.entries()],"Operações","number")
    },
    meta:dashboardMeta([["solicitacoes",sol],["itens",itens],["movimentacoes",mov],["transferencias",trans],["compras",compra]],{filteredRows:{transferencias:transRows.length,movimentacoes:movRows.length}})
  };
}

function completenessChart(rows,fields) {
  const counts=fields.map(field=>rows.filter(row=>{
    const value=firstValue(row,field.paths);
    return value!==undefined&&value!==null&&String(value).trim()!=="";
  }).length);
  return {
    format:"percent",
    labels:fields.map(field=>field.label),
    datasets:[{label:"Preenchimento (%)",data:counts.map(count=>rows.length?count*100/rows.length:0)}]
  };
}

async function buildTaxpayersDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const filters={
    busca:dashboardFilterValue(url,"busca"),
    tipoPessoa:dashboardFilterValue(url,"tipoPessoa"),
    simples:dashboardFilterValue(url,"simples"),
    cidade:dashboardFilterValue(url,"cidade"),
    situacao:dashboardFilterValue(url,"situacao")
  };
  const con=await safeBethaRows(env,tenant,"bi","contribuintes");
  const allRows=con.rows;
  const normalizedSearch=filters.busca.toLocaleLowerCase("pt-BR");
  const isInactive=row=>truthyValue(row,["desativado"])||/inativ|desativ/i.test(stringValue(row,["situacao","status"],""));
  const rows=allRows.filter(row=>{
    if(filters.tipoPessoa&&normalizePersonType(firstValue(row,["tipoPessoa","tipoPessoa.descricao","pessoa.tipo"])).localeCompare(normalizePersonType(filters.tipoPessoa),"pt-BR",{sensitivity:"base"})!==0) return false;
    if(filters.cidade&&!matchesDashboardFilter(row,filters.cidade,["nomeCidade","cidade.nome","municipio.nome"])) return false;
    if(filters.simples==="sim"&&!truthyValue(row,["optanteSimples","simplesNacional","optanteSimplesNacional"])) return false;
    if(filters.simples==="nao"&&truthyValue(row,["optanteSimples","simplesNacional","optanteSimplesNacional"])) return false;
    if(filters.situacao==="ativo"&&isInactive(row)) return false;
    if(filters.situacao==="inativo"&&!isInactive(row)) return false;
    if(normalizedSearch){
      const searchable=[
        stringValue(row,["nome"],""),
        stringValue(row,["nomeFantasia"],""),
        stringValue(row,["cpf"],""),
        stringValue(row,["cnpj"],""),
        stringValue(row,["cpfCnpj"],""),
        stringValue(row,["documento"],"")
      ].join(" ").toLocaleLowerCase("pt-BR");
      if(!searchable.includes(normalizedSearch)) return false;
    }
    return true;
  });

  const tipoMap=new Map();
  for(const row of rows){
    const label=normalizePersonType(firstValue(row,["tipoPessoa","tipoPessoa.descricao","pessoa.tipo"]))||"Não informado";
    tipoMap.set(label,(tipoMap.get(label)||0)+1);
  }
  const tipo=[...tipoMap.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);
  const simples=groupCount(rows,["optanteSimples","simplesNacional","optanteSimplesNacional"],5);
  const porte=groupCount(rows,["porteEmpresa","porteEmpresa.descricao","porte"],10);
  const bairro=groupCount(rows,["nomeBairro","bairro.nome","bairro"],15);
  const cidade=groupCount(rows,["nomeCidade","cidade.nome","municipio.nome"],15);
  const ativo=groupCount(rows,["desativado","situacao","status"],8);
  const updates=monthlyCount(rows,["dhOperacao","dataHoraOperacao","dataAtualizacao","dhAtualizacao"],periodo,exercicio);
  const completion=completenessChart(rows,[
    {label:"CPF/CNPJ",paths:["cpf","cnpj","cpfCnpj","documento"]},
    {label:"E-mail",paths:["email","emailPrincipal"]},
    {label:"Telefone",paths:["telefone","fone","celular"]},
    {label:"CEP",paths:["cep","endereco.cep"]},
    {label:"Logradouro",paths:["nomeLogradouro","logradouro.nome","endereco.logradouro"]}
  ]);
  return {
    view:"contribuintes",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    filters:activeFilterObject(filters),
    filterOptions:{
      tipoPessoa:[...new Set(allRows.map(row=>normalizePersonType(firstValue(row,["tipoPessoa","tipoPessoa.descricao","pessoa.tipo"]))).filter(Boolean))]
        .sort((a,b)=>a.localeCompare(b,"pt-BR",{sensitivity:"base"})).map(value=>({value,label:value})),
      cidade:filterOptionsFromRows(allRows,["nomeCidade","cidade.nome","municipio.nome"])
    },
    kpis:{
      "contribuintes-total":rows.length,
      pf:countWhere(rows,r=>normalizePersonType(firstValue(r,["tipoPessoa","tipoPessoa.descricao","pessoa.tipo"]))==="Pessoa física"),
      pj:countWhere(rows,r=>normalizePersonType(firstValue(r,["tipoPessoa","tipoPessoa.descricao","pessoa.tipo"]))==="Pessoa jurídica"),
      simples:countWhere(rows,r=>truthyValue(r,["optanteSimples","simplesNacional","optanteSimplesNacional"])),
      inativos:countWhere(rows,r=>isInactive(r))
    },
    charts:{
      "tipo-pessoa":chartGroups(tipo,"Contribuintes","number"),
      "optante-simples":chartGroups(simples,"Contribuintes","number"),
      "porte-empresa":chartGroups(porte,"Contribuintes","number"),
      "bairro-contribuintes":chartGroups(bairro,"Contribuintes","number"),
      "cidade-contribuintes":chartGroups(cidade,"Contribuintes","number"),
      "completude-contato":completion,
      "situacao-cadastro":chartGroups(ativo,"Contribuintes","number"),
      atualizacoes:{format:"number",labels:updates.labels,datasets:[{label:"Atualizações",data:updates.values}]}
    },
    meta:dashboardMeta([["contribuintes",con]],{filteredRows:{contribuintes:rows.length}})
  };
}


async function buildClosingDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const filters={competencia:dashboardFilterValue(url,"competencia")};
  const [lan,div]=await Promise.all([
    safeBethaRows(env,tenant,"base","encerramento-lancamentos"),
    safeBethaRows(env,tenant,"base","encerramento-dividas")
  ]);

  const competenciaPaths=["mesEncerramento","competencia","mes","referencia"];
  const allRows=[...lan.rows,...div.rows];
  const filterByCompetencia=rows=>filters.competencia
    ? rows.filter(row=>matchesDashboardFilter(row,filters.competencia,competenciaPaths))
    : rows;
  const lanRows=filterByCompetencia(lan.rows);
  const divRows=filterByCompetencia(div.rows);
  const labelFor=row=>closingPeriod(row)?.label||String(panelScalar(firstValue(row,competenciaPaths))||"Não informado");
  const aggregate=(rows)=>{
    const map=new Map();
    for(const r of rows){
      const k=labelFor(r);
      const x=map.get(k)||{saldo:0,lancado:0,inscrito:0,correcao:0,juros:0,multa:0,correcaoMes:0,jurosMes:0,multaMes:0};
      x.saldo+=numericValue(r,["valorSaldo","vlSaldo","saldo"]);
      x.lancado+=numericValue(r,["valorLancado","vlLancado","lancado"]);
      x.inscrito+=numericValue(r,["valorInscrito","vlInscrito","inscrito"]);
      x.correcao+=numericValue(r,["valorCorrecao","vlCorrecao"]);
      x.juros+=numericValue(r,["valorJuros","vlJuros"]);
      x.multa+=numericValue(r,["valorMulta","vlMulta"]);
      x.correcaoMes+=numericValue(r,["valorCorrecaoMes","vlCorrecaoMes"]);
      x.jurosMes+=numericValue(r,["valorJurosMes","vlJurosMes"]);
      x.multaMes+=numericValue(r,["valorMultaMes","vlMultaMes"]);
      map.set(k,x);
    }
    return [...map.entries()].sort((a,b)=>String(a[0]).localeCompare(String(b[0])));
  };

  const l=aggregate(lanRows), d=aggregate(divRows);
  return {
    view:"encerramento",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    filters:activeFilterObject(filters),
    filterOptions:{competencia:filterOptionsFromRows(allRows,competenciaPaths)},
    kpis:{
      "saldo-lancamentos":sumRowsOrNull(lanRows,["valorSaldo","vlSaldo","saldo"]),
      "saldo-dividas":sumRowsOrNull(divRows,["valorSaldo","vlSaldo","saldo"]),
      "acrescimos-lancamentos":hasAnyValue(lanRows,["valorCorrecao","vlCorrecao","valorJuros","vlJuros","valorMulta","vlMulta"])
        ? sumRows(lanRows,["valorCorrecao","vlCorrecao"])+sumRows(lanRows,["valorJuros","vlJuros"])+sumRows(lanRows,["valorMulta","vlMulta"])
        : null,
      "acrescimos-dividas":hasAnyValue(divRows,["valorCorrecao","vlCorrecao","valorJuros","vlJuros","valorMulta","vlMulta"])
        ? sumRows(divRows,["valorCorrecao","vlCorrecao"])+sumRows(divRows,["valorJuros","vlJuros"])+sumRows(divRows,["valorMulta","vlMulta"])
        : null
    },
    charts:{
      "saldo-lancamentos-mes":{format:"currency",labels:l.map(([k])=>k),datasets:[{label:"Saldo",data:l.map(([,v])=>v.saldo)}]},
      "saldo-divida-mes":{format:"currency",labels:d.map(([k])=>k),datasets:[{label:"Saldo",data:d.map(([,v])=>v.saldo)}]},
      "lancado-saldo":{format:"currency",labels:l.map(([k])=>k),datasets:[
        {label:"Lançado",data:l.map(([,v])=>v.lancado)},
        {label:"Saldo",data:l.map(([,v])=>v.saldo)}
      ]},
      "inscrito-saldo":{format:"currency",labels:d.map(([k])=>k),datasets:[
        {label:"Inscrito",data:d.map(([,v])=>v.inscrito)},
        {label:"Saldo",data:d.map(([,v])=>v.saldo)}
      ]},
      "acrescimos-lancamentos-mes":{format:"currency",labels:l.map(([k])=>k),datasets:[
        {label:"Correção",data:l.map(([,v])=>v.correcao)},
        {label:"Juros",data:l.map(([,v])=>v.juros)},
        {label:"Multa",data:l.map(([,v])=>v.multa)}
      ]},
      "acrescimos-divida-mes":{format:"currency",labels:d.map(([k])=>k),datasets:[
        {label:"Correção",data:d.map(([,v])=>v.correcao)},
        {label:"Juros",data:d.map(([,v])=>v.juros)},
        {label:"Multa",data:d.map(([,v])=>v.multa)}
      ]},
      "fluxo-acrescimos":{format:"currency",labels:d.map(([k])=>k),datasets:[
        {label:"Correção",data:d.map(([,v])=>v.correcaoMes)},
        {label:"Juros",data:d.map(([,v])=>v.jurosMes)},
        {label:"Multa",data:d.map(([,v])=>v.multaMes)}
      ]}
    },
    meta:dashboardMeta([["encerramentoLancamentos",lan],["encerramentoDividas",div]],{filteredRows:{lancamentos:lanRows.length,dividas:divRows.length}})
  };
}

async function buildWorksDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const filters={
    situacao:dashboardFilterValue(url,"situacao"),
    liberacao:dashboardFilterValue(url,"liberacao")
  };
  const [obras,resp]=await Promise.all([
    safeBethaRows(env,tenant,"base","obras"),
    safeBethaRows(env,tenant,"base","obras-responsaveis")
  ]);

  const allRows=obras.rows;
  const filterOptions={
    situacao:filterOptionsFromRows(allRows,["situacao","situacao.descricao","status"])
  };
  const isReleased=row=>Boolean(firstValue(row,["dataLiberacao","dtLiberacao"]));
  const rows=allRows.filter(row=>{
    if(filters.situacao&&!matchesDashboardFilter(row,filters.situacao,["situacao","situacao.descricao","status"])) return false;
    if(filters.liberacao==="liberada"&&!isReleased(row)) return false;
    if(filters.liberacao==="pendente"&&isReleased(row)) return false;
    return true;
  });

  const obraIds=new Set(
    rows
      .map(row=>String(firstValue(row,["id","idObra","obra.id"])??"").trim())
      .filter(Boolean)
  );
  const respObraPaths=["idObra","obra.id","obraId"];
  const hasRespObraLink=resp.rows.some(row=>{
    const value=firstValue(row,respObraPaths);
    return value!==undefined&&value!==null&&String(value).trim()!=="";
  });
  const respRows=hasRespObraLink
    ? resp.rows.filter(row=>obraIds.has(String(firstValue(row,respObraPaths)??"").trim()))
    : resp.rows;

  const entrada=monthlyCount(rows,["dataEntrada","dtEntrada","dataCadastro"],periodo,exercicio);
  const liber=monthlyCount(rows,["dataLiberacao","dtLiberacao"],periodo,exercicio,r=>isReleased(r));
  const sit=groupCount(rows,["situacao","situacao.descricao","status"],12);
  const medida=groupSum(rows,["situacao","situacao.descricao","status"],["medida","area","metragem"],12);
  const respGrouped=new Map();
  for(const r of respRows){
    const tipo=stringValue(r,["tipoResponsavel","tipo","funcao"],"Responsável");
    respGrouped.set(tipo,(respGrouped.get(tipo)||0)+1);
  }

  return {
    view:"obras",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    filters:activeFilterObject(filters),
    kpis:{
      "obras-total":rows.length,
      "obras-situacao":countWhere(rows,r=>/andamento|execu|abert/i.test(stringValue(r,["situacao","situacao.descricao","status"],""))),
      medida:sumRowsOrNull(rows,["medida","area","metragem"]),
      liberadas:rows.filter(r=>isReleased(r)&&periodIncludes(r,{periodo,exercicio,datePaths:["dataLiberacao","dtLiberacao"]})).length
    },
    charts:{
      "obras-situacao-grafico":chartGroups(sit,"Obras","number"),
      "obras-entrada":{format:"number",labels:entrada.labels,datasets:[{label:"Entradas",data:entrada.values}]},
      "obras-liberacao":{format:"number",labels:liber.labels,datasets:[{label:"Liberações",data:liber.values}]},
      "obras-medida":chartGroups(medida,"Medida","number"),
      "obras-responsaveis":chartGroups([...respGrouped.entries()],"Vínculos","number")
    },
    meta:dashboardMeta([["obras",obras],["responsaveis",resp]],{
      filterOptions,
      appliedFilters:activeFilterObject(filters),
      filteredRows:{obras:rows.length,responsaveis:respRows.length},
      fieldMapping:{
        situacao:"situacao",
        entrada:"dataEntrada",
        liberacao:"dataLiberacao",
        medida:"medida",
        responsavelObra:"idObra"
      }
    })
  };
}

async function buildRevenueCodesDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const filters={
    classificacaoReceita:dashboardFilterValue(url,"classificacaoReceita"),
    tipoCredito:dashboardFilterValue(url,"tipoCredito"),
    situacaoCredito:dashboardFilterValue(url,"situacaoCredito")
  };

  const [receitas,creditos,vinculos,det]=await Promise.all([
    safeBethaRows(env,tenant,"bi","receitas"),
    safeBethaRows(env,tenant,"base","creditos-tributarios"),
    safeBethaRows(env,tenant,"base","creditos-tributarios-receitas"),
    safeBethaRows(env,tenant,"bi","pagamentos-detalhados")
  ]);

  const detRows=det.rows.filter(r=>periodIncludes(r,{
    periodo,exercicio,
    datePaths:["pagamento.dataPagamento","dataPagamento","dtPagamento"],
    yearPaths:["ano","exercicio"]
  }));

  const paymentPaths=["valorPagoLancado","vlPagoLancado","valorPago","vlPago"];
  const receitaClassificacaoPaths=["classificacao","tipoCadastro","abreviatura"];
  const creditoTipoPaths=["tipoCadastro.descricao","tipoCadastro.valor","abreviatura","descricao"];
  const isDisabledCredit=r=>{
    const raw=firstValue(r,["desativado.valor","desativado.descricao","desativado"]);
    if (typeof raw==="boolean") return raw;
    return /^(true|1|sim|s|yes|desativado|inativo)$/i.test(String(raw||"").trim());
  };
  const receitaRows=receitas.rows.filter(r=>!filters.classificacaoReceita||matchesDashboardFilter(r,filters.classificacaoReceita,receitaClassificacaoPaths));
  const creditoRows=creditos.rows.filter(r=>{
    if(filters.tipoCredito&&!matchesDashboardFilter(r,filters.tipoCredito,creditoTipoPaths)) return false;
    if(filters.situacaoCredito==="ativo"&&isDisabledCredit(r)) return false;
    if(filters.situacaoCredito==="inativo"&&!isDisabledCredit(r)) return false;
    return true;
  });

  const disabledCredits=countWhere(creditoRows,isDisabledCredit);

  return {
    view:"receitas-creditos",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    filters:activeFilterObject(filters),
    filterOptions:{
      classificacaoReceita:filterOptionsFromRows(receitas.rows,receitaClassificacaoPaths),
      tipoCredito:filterOptionsFromRows(creditos.rows,creditoTipoPaths)
    },
    kpis:{
      "receitas-total":receitaRows.length,
      "creditos-total":creditoRows.length,
      "vinculos-total":vinculos.loaded,
      "arrecadado-creditos":sumRows(detRows,paymentPaths)
    },
    charts:{
      "receitas-classificacao":chartGroups(
        groupCount(receitaRows,receitaClassificacaoPaths,12),
        "Receitas","number"
      ),
      "creditos-situacao":chartFixed(
        ["Ativos","Desativados"],
        [Math.max(0,creditoRows.length-disabledCredits),disabledCredits],
        "Créditos","number"
      ),
      "creditos-tipo":chartGroups(
        groupCount(creditoRows,creditoTipoPaths,12),
        "Créditos","number"
      ),
      "vinculos-receita":chartGroups(
        groupCount(vinculos.rows,["receita.descricao","receita.abreviatura","idReceita"],12),
        "Vínculos","number"
      ),
      "arrecadacao-credito":chartGroups(
        groupSum(detRows,["creditoTributario.descricao","creditoTributario.nome","descricaoCreditoTributario","idCreditoTributario"],paymentPaths,12),
        "Arrecadado","currency"
      ),
      "arrecadacao-receita":chartGroups(
        groupSum(detRows,["receita.descricao","receita.nome","descricaoReceita","idReceita"],paymentPaths,12),
        "Arrecadado","currency"
      )
    },
    meta:dashboardMeta([
      ["receitas",receitas],["creditos",creditos],["vinculos",vinculos],["pagamentosDetalhados",det]
    ],{
      appliedFilters:activeFilterObject(filters),
      filteredRows:{receitas:receitaRows.length,creditos:creditoRows.length},
      fieldMapping:{
        receitaClassificacao:"classificacao",
        creditoSituacao:"desativado",
        creditoTipo:"tipoCadastro.descricao",
        vinculoReceita:"receita.descricao"
      }
    })
  };
}

async function buildGuidesDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const filters={
    situacao:dashboardFilterValue(url,"situacao"),
    boleto:dashboardFilterValue(url,"boleto")
  };

  const guias=await safeBethaRows(env,tenant,"base","guias-unificadas");
  const datePaths=["dtEmissao"];
  const duePaths=["dtVencimento"];
  const totalPaths=["vlTotalGuiaUnificada"];

  const periodRows=guias.rows.filter(r=>periodIncludes(r,{
    periodo,exercicio,datePaths,yearPaths:["ano","exercicio"]
  }));

  const hasBaixa=r=>{
    const value=firstValue(r,["nroBaixa"]);
    return value!==undefined && value!==null && String(value).trim()!=="";
  };

  const now=Date.now();
  const isOverdue=r=>{
    if (hasBaixa(r)) return false;
    const d=dateValue(r,duePaths);
    return Boolean(d && d.getTime()<now);
  };
  const rows=periodRows.filter(r=>{
    if(filters.situacao==="paga"&&!hasBaixa(r)) return false;
    if(filters.situacao==="vencida"&&!isOverdue(r)) return false;
    if(filters.situacao==="aberta"&&(hasBaixa(r)||isOverdue(r))) return false;
    const boletoRegistrado=truthyValue(r,["boletoRegistrado"]);
    if(filters.boleto==="sim"&&!boletoRegistrado) return false;
    if(filters.boleto==="nao"&&boletoRegistrado) return false;
    return true;
  });
  const paid=countWhere(rows,hasBaixa);
  const overdue=countWhere(rows,isOverdue);
  const open=Math.max(0,rows.length-paid-overdue);
  const registered=countWhere(rows,r=>truthyValue(r,["boletoRegistrado"]));

  const issue=monthlyCount(rows,datePaths,periodo,exercicio);
  const due=monthlyCount(rows,duePaths,periodo,exercicio);

  return {
    view:"guias",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    filters:activeFilterObject(filters),
    kpis:{
      "guias-total":rows.length,
      "guias-valor":sumRows(rows,totalPaths),
      "guias-pagas":paid,
      "guias-vencidas":overdue
    },
    charts:{
      "guias-emissao":{
        format:"number",
        labels:issue.labels,
        datasets:[{label:"Guias emitidas",data:issue.values}]
      },
      "guias-situacao":chartFixed(
        ["Com baixa","Vencidas sem baixa","Em aberto"],
        [paid,overdue,open],
        "Guias","number"
      ),
      "guias-boleto":chartFixed(
        ["Boleto registrado","Sem registro"],
        [registered,Math.max(0,rows.length-registered)],
        "Guias","number"
      ),
      "guias-composicao":chartFixed(
        ["Tributo","Correção","Juros","Multa","Taxa de expediente"],
        [
          sumRows(rows,["vlTributo"]),
          sumRows(rows,["vlTotalCorrecao"]),
          sumRows(rows,["vlTotalJuros"]),
          sumRows(rows,["vlTotalMulta"]),
          sumRows(rows,["vlTaxaExpediente"])
        ],
        "Valor","currency"
      ),
      "guias-vencimento":{
        format:"number",
        labels:due.labels,
        datasets:[{label:"Vencimentos",data:due.values}]
      }
    },
    meta:dashboardMeta([["guias",guias]],{
      appliedFilters:activeFilterObject(filters),
      filteredRows:{guias:rows.length},
      fieldMapping:{
        emissao:"dtEmissao",
        vencimento:"dtVencimento",
        baixa:"nroBaixa",
        boletoRegistrado:"boletoRegistrado",
        total:"vlTotalGuiaUnificada"
      }
    })
  };
}

function indexerHistorySeries(rows,periodo,exercicio) {
  const filtered=rows
    .map(row=>({
      date:dateValue(row,["dtIdx"]),
      name:stringValue(row,["moeda.nome","moeda.sigla","moeda.id"],"Não informado"),
      value:numericValue(row,["vlIdx"])
    }))
    .filter(item=>item.date && periodIncludes(
      {dtIdx:item.date.toISOString()},
      {periodo,exercicio,datePaths:["dtIdx"],yearPaths:[]}
    ))
    .sort((a,b)=>a.date-b.date);

  const dayKeys=[...new Set(filtered.map(item=>item.date.toISOString().slice(0,10)))].slice(-36);
  const daySet=new Set(dayKeys);
  const seriesNames=[...new Set(filtered.filter(item=>daySet.has(item.date.toISOString().slice(0,10))).map(item=>item.name))].slice(0,8);

  const values=new Map();
  for (const item of filtered) {
    const day=item.date.toISOString().slice(0,10);
    if (!daySet.has(day) || !seriesNames.includes(item.name)) continue;
    values.set(item.name+"|"+day,item.value);
  }

  return {
    format:"number",
    labels:dayKeys.map(day=>new Date(day+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"2-digit"})),
    datasets:seriesNames.map(name=>({
      label:name,
      data:dayKeys.map(day=>values.has(name+"|"+day)?values.get(name+"|"+day):null)
    }))
  };
}

async function buildIndexersDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const filters={
    indexador:dashboardFilterValue(url,"indexador"),
    corrente:dashboardFilterValue(url,"corrente")
  };

  const [idx,val]=await Promise.all([
    safeBethaRows(env,tenant,"bi","indexadores"),
    safeBethaRows(env,tenant,"bi","indexadores-valores")
  ]);

  const idxPaths=["nome","sigla"];
  const valIdxPaths=["moeda.nome","moeda.sigla","moeda.id"];
  const idxRows=idx.rows.filter(r=>{
    if(filters.indexador&&!matchesDashboardFilter(r,filters.indexador,idxPaths)) return false;
    const corrente=truthyValue(r,["corrente"]);
    if(filters.corrente==="sim"&&!corrente) return false;
    if(filters.corrente==="nao"&&corrente) return false;
    return true;
  });
  const valIndexadorRows=val.rows.filter(r=>!filters.indexador||matchesDashboardFilter(r,filters.indexador,valIdxPaths));
  const valRows=valIndexadorRows.filter(r=>periodIncludes(r,{
    periodo,exercicio,datePaths:["dtIdx"],yearPaths:["ano","exercicio"]
  }));

  const current=countWhere(idxRows,r=>truthyValue(r,["corrente"]));

  return {
    view:"indexadores",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    filters:activeFilterObject(filters),
    filterOptions:{
      indexador:filterOptionsFromRows(idx.rows,idxPaths)
    },
    kpis:{
      "indexadores-total":idxRows.length,
      "indexadores-ativos":current,
      "valores-indexadores":valIndexadorRows.length,
      "valores-periodo":valRows.length
    },
    charts:{
      "indexadores-tipo":chartGroups(
        groupCount(idxRows,idxPaths,12),
        "Indexadores","number"
      ),
      "indexadores-situacao":chartFixed(
        ["Corrente","Não corrente"],
        [current,Math.max(0,idxRows.length-current)],
        "Indexadores","number"
      ),
      "valores-por-indexador":chartGroups(
        groupCount(valIndexadorRows,valIdxPaths,12),
        "Registros","number"
      ),
      "evolucao-indexadores":indexerHistorySeries(valIndexadorRows,periodo,exercicio)
    },
    meta:dashboardMeta([["indexadores",idx],["indexadoresValores",val]],{
      appliedFilters:activeFilterObject(filters),
      filteredRows:{indexadores:idxRows.length,valores:valIndexadorRows.length,valoresPeriodo:valRows.length},
      fieldMapping:{
        corrente:"corrente",
        indexador:"moeda.nome",
        data:"dtIdx",
        valor:"vlIdx"
      }
    })
  };
}

async function buildTerritoryDashboard(env,tenant,url) {
  const filters={
    setor:dashboardFilterValue(url,"setor"),
    tipoLogradouro:dashboardFilterValue(url,"tipoLogradouro"),
    zonaFiscal:dashboardFilterValue(url,"zonaFiscal")
  };
  const [bairros,distritos,logradouros,imoveis]=await Promise.all([
    safeBethaRows(env,tenant,"base","bairros"),
    safeBethaRows(env,tenant,"base","distritos"),
    safeBethaRows(env,tenant,"base","logradouros"),
    safeBethaRows(env,tenant,"bi","imoveis")
  ]);

  const setorPaths=["setor","nroSecao","iSecoes"];
  const tipoLogradouroPaths=["tipoLogradouroDescricao","tipoLogradouroAbreviatura"];
  const zonaFiscalPaths=["zonaFiscal"];
  const imovelRows=imoveis.rows.filter(r=>!filters.setor||matchesDashboardFilter(r,filters.setor,setorPaths));
  const logradouroRows=logradouros.rows.filter(r=>{
    if(filters.tipoLogradouro&&!matchesDashboardFilter(r,filters.tipoLogradouro,tipoLogradouroPaths)) return false;
    if(filters.zonaFiscal&&!matchesDashboardFilter(r,filters.zonaFiscal,zonaFiscalPaths)) return false;
    return true;
  });

  const geocoded=countWhere(logradouroRows,r=>{
    const lat=firstValue(r,["latitude"]);
    const lng=firstValue(r,["longitude"]);
    return lat!==undefined && lat!==null && lat!=="" &&
      lng!==undefined && lng!==null && lng!=="";
  });

  return {
    view:"territorio",tenant:{id:tenant.id,name:tenant.name},
    filters:activeFilterObject(filters),
    filterOptions:{
      setor:filterOptionsFromRows(imoveis.rows,setorPaths),
      tipoLogradouro:filterOptionsFromRows(logradouros.rows,tipoLogradouroPaths),
      zonaFiscal:filterOptionsFromRows(logradouros.rows,zonaFiscalPaths)
    },
    kpis:{
      "bairros-total":bairros.loaded,
      "distritos-total":distritos.loaded,
      "logradouros-total":logradouroRows.length,
      "logradouros-geo":geocoded,
      "territorio-imoveis":imovelRows.length
    },
    charts:{
      "imoveis-bairro":chartGroups(
        groupCount(imovelRows,["nomeBairro","iBairros"],15),
        "Imóveis","number"
      ),
      "imoveis-setor":chartGroups(
        groupCount(imovelRows,setorPaths,15),
        "Imóveis","number"
      ),
      "logradouros-tipo":chartGroups(
        groupCount(logradouroRows,tipoLogradouroPaths,12),
        "Logradouros","number"
      ),
      "bairros-zona":chartGroups(
        groupCount(bairros.rows,["zonaRural.descricao","zonaRural.valor"],6),
        "Bairros","number"
      ),
      "logradouros-zona-fiscal":chartGroups(
        groupCount(logradouroRows,zonaFiscalPaths,12),
        "Logradouros","number"
      ),
      "cadastros-territoriais":chartFixed(
        ["Bairros","Distritos","Logradouros","Imóveis"],
        [bairros.loaded,distritos.loaded,logradouroRows.length,imovelRows.length],
        "Cadastros","number"
      )
    },
    meta:dashboardMeta([
      ["bairros",bairros],["distritos",distritos],["logradouros",logradouros],["imoveis",imoveis]
    ],{
      appliedFilters:activeFilterObject(filters),
      filteredRows:{bairros:bairros.rows.length,distritos:distritos.rows.length,logradouros:logradouroRows.length,imoveis:imovelRows.length},
      fieldMapping:{
        bairroImovel:"nomeBairro",
        setorImovel:"setor",
        tipoLogradouro:"tipoLogradouroDescricao",
        zonaRural:"zonaRural.descricao",
        zonaFiscal:"zonaFiscal"
      }
    })
  };
}

async function buildQualityDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const filters={situacao:dashboardFilterValue(url,"situacao")};
  const [con,imo,eco,ativ,campos]=await Promise.all([
    safeBethaRows(env,tenant,"bi","contribuintes"),
    safeBethaRows(env,tenant,"bi","imoveis"),
    safeBethaRows(env,tenant,"bi","economicos"),
    safeBethaRows(env,tenant,"bi","economicos-atividades"),
    safeBethaRows(env,tenant,"bi","imoveis-campos-adicionais")
  ]);

  const isInactive=r=>truthyValue(r,["desativado"])||/inativ|desativ/i.test(stringValue(r,["situacao","situacao.descricao","status"],""));
  const filterSituacao=rows=>rows.filter(r=>{
    if(filters.situacao==="ativo") return !isInactive(r);
    if(filters.situacao==="inativo") return isInactive(r);
    return true;
  });
  const conRows=filterSituacao(con.rows);
  const imoRows=filterSituacao(imo.rows);
  const ecoRows=filterSituacao(eco.rows);
  const ecoWithActivity=new Set(ativ.rows.map(r=>String(firstValue(r,["idEconomico","economico.id"])||"")).filter(Boolean));
  const opCon=monthlyCount(conRows,["dhOperacao","dataHoraOperacao","dataAtualizacao"],periodo,exercicio);
  const opImo=monthlyCount(imoRows,["dhOperacao","dataHoraOperacao","dataAtualizacao"],periodo,exercicio);
  const opEco=monthlyCount(ecoRows,["dhOperacao","dataHoraOperacao","dataAtualizacao"],periodo,exercicio);
  const campoGroups=groupCount(campos.rows,["campoAdicional.descricao","descricaoCampo","campoAdicional","campo"],12);

  const completionCon=completenessChart(conRows,[
    {label:"CPF/CNPJ",paths:["cpf","cnpj","cpfCnpj","documento"]},
    {label:"E-mail",paths:["email","emailPrincipal"]},
    {label:"Telefone",paths:["telefone","fone","celular"]},
    {label:"CEP",paths:["cep","endereco.cep"]},
    {label:"Logradouro",paths:["nomeLogradouro","logradouro.nome","endereco.logradouro"]}
  ]);
  const completionImo=completenessChart(imoRows,[
    {label:"Logradouro",paths:["nomeLogradouro","logradouro.nome"]},
    {label:"Número",paths:["numero","numeroImovel"]},
    {label:"CEP",paths:["cep","endereco.cep"]},
    {label:"Bairro",paths:["nomeBairro","bairro.nome"]},
    {label:"Setor",paths:["setor","setor.codigo"]}
  ]);
  const completionEco=completenessChart(ecoRows,[
    {label:"Início atividade",paths:["dtInicioAtiv","dataInicioAtividade"]},
    {label:"Situação",paths:["situacao","situacao.descricao"]},
    {label:"Bairro",paths:["nomeBairro","bairro.nome"]},
    {label:"Logradouro",paths:["nomeLogradouro","logradouro.nome"]},
    {label:"Tipo cadastro",paths:["tipoCadastro","tipoEconomico"]}
  ]);

  return {
    view:"qualidade",tenant:{id:tenant.id,name:tenant.name},period:{periodo,exercicio},
    filters:activeFilterObject(filters),
    kpis:{
      "sem-documento":countWhere(conRows,r=>firstValue(r,["cpf","cnpj","cpfCnpj","documento"])===undefined),
      "sem-contato":countWhere(conRows,r=>firstValue(r,["email","emailPrincipal","telefone","fone","celular"])===undefined),
      "imoveis-sem-endereco":countWhere(imoRows,r=>firstValue(r,["nomeLogradouro","logradouro.nome"])===undefined||firstValue(r,["cep","endereco.cep"])===undefined),
      "economicos-sem-atividade":countWhere(ecoRows,r=>{
        const id=String(firstValue(r,["id","idEconomico"])||"");
        return id&&!ecoWithActivity.has(id);
      })
    },
    charts:{
      "completude-contribuintes":completionCon,
      "completude-imoveis":completionImo,
      "completude-economicos":completionEco,
      "operacoes-integracao":{format:"number",labels:opCon.labels,datasets:[
        {label:"Contribuintes",data:opCon.values},
        {label:"Imóveis",data:opImo.values},
        {label:"Econômicos",data:opEco.values}
      ]},
      "registros-desativados":chartFixed(["Contribuintes","Imóveis"],[
        countWhere(conRows,isInactive),
        countWhere(imoRows,isInactive)
      ],"Desativados","number"),
      "campos-adicionais":chartGroups(campoGroups,"Registros","number")
    },
    meta:dashboardMeta([["contribuintes",con],["imoveis",imo],["economicos",eco],["atividades",ativ],["camposAdicionais",campos]],{
      appliedFilters:activeFilterObject(filters),
      filteredRows:{contribuintes:conRows.length,imoveis:imoRows.length,economicos:ecoRows.length}
    })
  };
}


function pageMappingSummary(payload) {
  const blocks=Array.isArray(payload)?payload:[];
  const constraints=blocks.flatMap(block=>Array.isArray(block&&block.constraints)?block.constraints:[]);
  const groups=blocks.flatMap(block=>Array.isArray(block&&block.groups)?block.groups:[]);
  return {
    configured:blocks.length>0 && constraints.length>0,
    contexts:[...new Set(blocks.flatMap(block=>Array.isArray(block&&block.contexts)?block.contexts:[]))],
    constraints:constraints.map(item=>({id:String(item&&item.id||""),description:String(item&&item.description||"")})).filter(x=>x.id),
    constraintCount:constraints.length,
    groupCount:groups.length
  };
}

async function getPageMappingStatus(tenant) {
  if (!tenant.accessToken) {
    return {available:false,configured:false,error:"BETHA_ACCESS_TOKEN_NOT_CONFIGURED"};
  }

  const response=await fetch(PAGE_MAPPING_BASE+"/page-mapping",{
    method:"GET",
    headers:{
      "Accept":"application/json",
      "Authorization":"Bearer "+tenant.accessToken
    }
  });
  const parsed=await readJsonResponse(response);

  if (response.status===401) {
    return {available:false,configured:false,error:"PAGE_MAPPING_TOKEN_INVALID",httpStatus:401};
  }
  if (response.status===403) {
    return {available:false,configured:false,error:"PAGE_MAPPING_SCOPE_REQUIRED",httpStatus:403};
  }
  if (!response.ok) {
    return {
      available:false,
      configured:false,
      error:"PAGE_MAPPING_HTTP_"+response.status,
      httpStatus:response.status
    };
  }

  return {
    available:true,
    httpStatus:response.status,
    ...pageMappingSummary(parsed.body)
  };
}

async function publishPageMapping(tenant) {
  if (!tenant.accessToken) throw new Error("BETHA_ACCESS_TOKEN_NOT_CONFIGURED");

  const response=await fetch(PAGE_MAPPING_BASE+"/page-mapping",{
    method:"PUT",
    headers:{
      "Accept":"application/json",
      "Content-Type":"application/json",
      "Authorization":"Bearer "+tenant.accessToken
    },
    body:JSON.stringify(BI_PAGE_MAPPING)
  });
  const parsed=await readJsonResponse(response);

  if (response.status===401) throw new Error("PAGE_MAPPING_TOKEN_INVALID");
  if (response.status===403) throw new Error("PAGE_MAPPING_WRITE_SCOPE_REQUIRED");
  if (!response.ok) {
    const error=new Error("PAGE_MAPPING_PUBLISH_HTTP_"+response.status);
    error.status=response.status;
    throw error;
  }

  return {
    ok:true,
    message:parsed.body && typeof parsed.body==="object"
      ? String(parsed.body.message||"Page Mapping publicado")
      : "Page Mapping publicado",
    ...pageMappingSummary(BI_PAGE_MAPPING)
  };
}

async function listContextUsers(userToken, tenant, url) {
  const params=new URLSearchParams();
  params.set("limit",url.searchParams.get("limit") || "100");
  params.set("offset",url.searchParams.get("offset") || "0");
  const target=AUTH_BASE+"/user-accounts/v0.1/api/management/access?"+params.toString();
  return platformRequest(target,{headers:{
    "Accept":"application/json",
    "Authorization":"Bearer "+userToken,
    "User-Access":tenant.userAccess
  }});
}

function escapeFilterValue(value) {
  return String(value||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'");
}

async function searchCentralUser(userToken, user) {
  const filter="id='"+escapeFilterValue(user)+"'";
  const target=USERS_BASE+"/usuarios/v0.1/api/usuarios/?filter="+encodeURIComponent(filter);
  return platformRequest(target,{headers:{
    "Accept":"application/json",
    "Authorization":"Bearer "+userToken
  }});
}

function centralUserRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.content)) return payload.content;
  if (payload && payload.data && Array.isArray(payload.data.content)) return payload.data.content;
  if (payload && payload.data && Array.isArray(payload.data)) return payload.data;
  return payload && typeof payload==="object" ? [payload] : [];
}

function centralUserId(user) {
  if (!user || typeof user!=="object") return "";
  return String(user.id ?? user.user ?? user.login ?? user.username ?? user.idUsuario ?? "").trim();
}

function centralUserName(user) {
  if (!user || typeof user!=="object") return "";
  return String(user.nomeCompleto ?? user.fullName ?? user.nome ?? user.name ?? user.userName ?? centralUserId(user)).trim();
}

function centralUserEmail(user) {
  if (!user || typeof user!=="object") return "";
  return String(user.email ?? user.mail ?? "").trim();
}

function tokenInfoUserId(payload) {
  const candidates=[
    payload&&payload.user,
    payload&&payload.username,
    payload&&payload.user_name,
    payload&&payload.userName,
    payload&&payload.usuario,
    payload&&payload.idUsuario,
    payload&&payload.sub
  ];
  for(const value of candidates){
    if(value&&typeof value==="object"){
      const nested=centralUserId(value);
      if(nested) return nested;
    } else if(value!==undefined&&value!==null&&String(value).trim()){
      return String(value).trim();
    }
  }
  return "";
}

async function currentOAuthUserId(userToken) {
  if(!userToken) throw new Error("USER_TOKEN_REQUIRED");
  try{
    const response=await fetch(OAUTH_TOKENINFO_URL+"?access_token="+encodeURIComponent(userToken),{
      headers:{"Accept":"application/json"}
    });
    const parsed=await readJsonResponse(response);
    if(response.ok){
      const userId=tokenInfoUserId(parsed.body);
      if(userId) return userId;
    }
  }catch{}
  return "";
}

function parseGrantPermissions(value) {
  if(Array.isArray(value)) return value;
  if(!value) return [];
  try{
    const parsed=JSON.parse(String(value));
    return Array.isArray(parsed)?parsed:[];
  }catch{return [];}
}

function biGrantActive(grant) {
  if(!grant) return false;
  if(grant.expiresIn && new Date(grant.expiresIn).getTime()<Date.now()) return false;
  return true;
}

async function getBiUserGrant(env,tenantId,userId) {
  if(!env.AUTH_DB || !tenantId || !userId) return null;
  const row=await env.AUTH_DB.prepare(
    "SELECT tenant_id,user_id,user_name,email,admin,technical,permissions,expires_in,created_at,updated_at,created_by FROM bi_user_grants WHERE tenant_id=?1 AND lower(user_id)=lower(?2) LIMIT 1"
  ).bind(String(tenantId),String(userId)).first();
  if(!row) return null;
  const grant={
    id:String(row.user_id),
    accessId:String(row.user_id),
    tenantId:String(row.tenant_id),
    user:String(row.user_id),
    userName:String(row.user_name||row.user_id),
    email:String(row.email||""),
    admin:Number(row.admin)===1,
    technical:Number(row.technical)===1,
    permissions:parseGrantPermissions(row.permissions),
    expiresIn:row.expires_in?String(row.expires_in):null,
    createAt:String(row.created_at||""),
    updatedAt:String(row.updated_at||""),
    createdBy:String(row.created_by||""),
    source:"bi-local"
  };
  return biGrantActive(grant)?grant:null;
}

function biUserAliases(userId,accesses=[]) {
  const aliases=new Set();
  const add=value=>{
    if(value===undefined||value===null) return;
    const text=String(value).trim();
    if(text) aliases.add(text);
  };
  add(userId);
  for(const access of Array.isArray(accesses)?accesses:[]){
    add(access&&access.user);
    add(access&&access.userName);
    add(access&&access.login);
    add(access&&access.idUsuario);
    add(access&&access.username);
  }
  return [...aliases];
}

async function ensureBiTenantAdminStore(env) {
  if(!env.AUTH_DB) return false;
  await env.AUTH_DB.prepare(
    "CREATE TABLE IF NOT EXISTS bi_tenant_admins (tenant_id TEXT NOT NULL,user_id TEXT NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY (tenant_id,user_id))"
  ).run();
  return true;
}

async function isBiTenantAdmin(env,tenantId,aliases=[]) {
  if(!env.AUTH_DB||!tenantId||!aliases.length) return false;
  await ensureBiTenantAdminStore(env);
  for(const alias of aliases){
    const row=await env.AUTH_DB.prepare(
      "SELECT 1 AS ok FROM bi_tenant_admins WHERE tenant_id=?1 AND lower(user_id)=lower(?2) LIMIT 1"
    ).bind(String(tenantId),String(alias)).first();
    if(row&&Number(row.ok)===1) return true;
  }
  return false;
}

async function rememberTenantAdminAliases(env,tenantId,aliases=[]) {
  if(!env.AUTH_DB||!tenantId||!aliases.length) return;
  await ensureBiTenantAdminStore(env);
  const now=new Date().toISOString();
  for(const alias of new Set(aliases.map(value=>String(value||"").trim()).filter(Boolean))){
    await env.AUTH_DB.prepare(
      "INSERT OR IGNORE INTO bi_tenant_admins (tenant_id,user_id,created_at) VALUES (?1,?2,?3)"
    ).bind(String(tenantId),alias,now).run();
  }
}

async function rememberBiTenantAdmin(env,tenantId,auth) {
  if(!auth) return;
  await rememberTenantAdminAliases(env,tenantId,[
    ...biUserAliases(auth.userId,[auth.access,auth.bethaAccess].filter(Boolean)),
    auditActorLabel(auth.access)
  ]);
}

function auditActorMatchesAliases(actor,aliases=[]) {
  const normalized=String(actor||"").trim().toLowerCase();
  if(!normalized || normalized==="authenticated-user") return false;
  return aliases.some(alias=>String(alias||"").trim().toLowerCase()===normalized);
}

async function legacyTenantOwnershipFromAudit(env,targetTenantId,sourceTenantIds,aliases,auditCache=new Map()) {
  if(!env.BI_SESSIONS||!targetTenantId||!sourceTenantIds.length||!aliases.length) return false;
  for(const sourceTenantId of [...new Set(sourceTenantIds)]){
    let events=auditCache.get(sourceTenantId);
    if(!events){
      try{
        const result=await listAuditEvents(env,sourceTenantId,500);
        events=Array.isArray(result.events)?result.events:[];
      }catch{
        events=[];
      }
      auditCache.set(sourceTenantId,events);
    }
    const owned=events.some(event=>
      event?.category==="configuration" &&
      event?.action==="entity.save" &&
      String(event?.subject||"")===String(targetTenantId) &&
      auditActorMatchesAliases(event?.actor,aliases)
    );
    if(owned){
      await rememberTenantAdminAliases(env,targetTenantId,aliases);
      return true;
    }
  }
  return false;
}

function applyBiGrantToAccess(access,grant) {
  if(!grant) return access;
  return {
    ...access,
    user:grant.user,
    userName:grant.userName,
    admin:grant.admin===true,
    technical:grant.technical===true,
    permissions:Array.isArray(grant.permissions)?grant.permissions:[],
    expiresIn:grant.expiresIn||null,
    biManaged:true,
    biGrantId:grant.accessId
  };
}

async function saveBiUserGrant(env,tenantId,centralUser,payload,actor) {
  if(!env.AUTH_DB) throw new Error("SESSION_STORE_NOT_CONFIGURED");
  const userId=centralUserId(centralUser)||String(payload.user||"").trim();
  if(!userId) throw new Error("USER_REQUIRED");
  const now=new Date().toISOString();
  const permissions=JSON.stringify(Array.isArray(payload.permissions)?payload.permissions:[]);
  await env.AUTH_DB.prepare(
    "INSERT INTO bi_user_grants (tenant_id,user_id,user_name,email,admin,technical,permissions,expires_in,created_at,updated_at,created_by) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11) ON CONFLICT(tenant_id,user_id) DO UPDATE SET user_name=excluded.user_name,email=excluded.email,admin=excluded.admin,technical=excluded.technical,permissions=excluded.permissions,expires_in=excluded.expires_in,updated_at=excluded.updated_at,created_by=excluded.created_by"
  ).bind(
    String(tenantId),userId,centralUserName(centralUser),centralUserEmail(centralUser),
    payload.admin?1:0,payload.technical?1:0,permissions,payload.expiresIn||null,
    now,now,String(actor||"authenticated-user")
  ).run();
  return getBiUserGrant(env,tenantId,userId);
}

async function listBiUserGrants(env,tenantId,{limit=100,offset=0}={}) {
  if(!env.AUTH_DB) throw new Error("SESSION_STORE_NOT_CONFIGURED");
  const safeLimit=Math.max(1,Math.min(Number(limit)||100,500));
  const safeOffset=Math.max(0,Number(offset)||0);
  const rows=await env.AUTH_DB.prepare(
    "SELECT tenant_id,user_id,user_name,email,admin,technical,permissions,expires_in,created_at,updated_at,created_by FROM bi_user_grants WHERE tenant_id=?1 ORDER BY lower(user_name),lower(user_id) LIMIT ?2 OFFSET ?3"
  ).bind(String(tenantId),safeLimit,safeOffset).all();
  const content=(rows.results||[]).map(row=>{
    const permissions=parseGrantPermissions(row.permissions);
    return {
      id:String(row.user_id),
      accessId:String(row.user_id),
      user:String(row.user_id),
      userName:String(row.user_name||row.user_id),
      email:String(row.email||""),
      admin:Number(row.admin)===1,
      technical:Number(row.technical)===1,
      permissions,
      permissionCount:permissions.length,
      expiresIn:row.expires_in?String(row.expires_in):null,
      createAt:String(row.created_at||""),
      updatedAt:String(row.updated_at||""),
      totalRestrictions:0,
      connected:false,
      blocked:false,
      source:"bi-local"
    };
  });
  return {content};
}

async function deleteBiUserGrant(env,tenantId,userId) {
  if(!env.AUTH_DB) throw new Error("SESSION_STORE_NOT_CONFIGURED");
  const result=await env.AUTH_DB.prepare(
    "DELETE FROM bi_user_grants WHERE tenant_id=?1 AND lower(user_id)=lower(?2)"
  ).bind(String(tenantId),String(userId)).run();
  return {ok:true,removed:Number(result.meta&&result.meta.changes||0)>0};
}

async function createContextUser(userToken, tenant, body) {
  return platformRequest(AUTH_BASE+"/user-accounts/v0.1/api/management/access",{
    method:"POST",
    headers:{
      "Accept":"application/json",
      "Content-Type":"application/json",
      "Authorization":"Bearer "+userToken,
      "User-Access":tenant.userAccess
    },
    body:JSON.stringify(body)
  });
}

async function deleteContextUser(userToken, tenant, accessId) {
  return platformRequest(AUTH_BASE+"/user-accounts/v0.1/api/management/access/"+encodeURIComponent(accessId),{
    method:"DELETE",
    headers:{
      "Accept":"application/json",
      "Authorization":"Bearer "+userToken,
      "User-Access":tenant.userAccess
    }
  });
}


function maskDetailDocument(value) {
  const raw=String(value??"").replace(/\D/g,"");
  if(!raw) return "";
  if(raw.length<=5) return raw.slice(0,1)+"***"+raw.slice(-1);
  return raw.slice(0,3)+"***"+raw.slice(-2);
}

function detailScalar(row,paths,format) {
  const raw=firstValue(row,paths);
  if(raw===undefined||raw===null||raw==="") return null;

  if(format==="document") return maskDetailDocument(raw);
  if(format==="currency"||format==="number") return numericValue(row,paths);
  if(format==="boolean") {
    if(typeof raw==="boolean") return raw;
    const text=String(raw.descricao??raw.valor??raw).trim().toLowerCase();
    return ["true","1","sim","s","yes","ativo","executada","protestada"].includes(text);
  }
  if(typeof raw==="object") return String(raw.descricao??raw.nome??raw.codigo??raw.id??"");
  return String(raw);
}

function detailFilterRows(resource,rows,url,context={}) {
  if(url.searchParams.get("detailNoMatch")==="1") return [];
  if(resource==="imoveis"&&context.contributorPropertyIds instanceof Set) rows=rows.filter(row=>context.contributorPropertyIds.has(String(valueAt(row,"id")??valueAt(row,"idImovel")??"")));
  const periodo=url.searchParams.get("periodo")||"todos";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const def=DETAIL_RESOURCES[resource]||{};

  let out=rows;
  if(periodo!=="todos" && !["contribuintes","imoveis","economicos","economicos-atividades","imoveis-responsaveis","imoveis-corresponsaveis"].includes(resource) && !(resource==="parcelamentos-parcelas"&&url.searchParams.get("parcelamentoId")) && ((def.datePaths||[]).length||(def.yearPaths||[]).length)){
    out=out.filter(row=>periodIncludes(row,{
      periodo,exercicio,
      datePaths:def.datePaths||[],
      yearPaths:def.yearPaths||[]
    }));
  }

  if(resource==="pagamentos-detalhados-valores"){
    const tipoPagamento=dashboardFilterValue(url,"tipoPagamento");
    const tipoBaixa=dashboardFilterValue(url,"tipoBaixa");
    const receita=dashboardFilterValue(url,"receita");
    out=out.filter(row=>
      matchesDashboardFilter(row,tipoPagamento,["pagamento.tipoPagamento.descricao"]) &&
      matchesDashboardFilter(row,tipoBaixa,["pagamento.tipoBaixa.descricao"]) &&
      matchesDashboardFilter(row,receita,["receita.descricao","receita.abreviatura"])
    );
  } else if(resource==="debitos"){
    const situacao=dashboardFilterValue(url,"situacao");
    const carteira=dashboardFilterValue(url,"carteira");
    const now=Date.now();
    out=out.filter(row=>{
      if(!matchesDashboardFilter(row,situacao,["situacao"])) return false;
      const paid=Boolean(firstValue(row,["dtPgto"]));
      const status=stringValue(row,["situacao"],"");
      const open=!paid&&!/cancel|quit|pago|baix/i.test(status);
      const d=dateValue(row,["dtVcto"]);
      const overdue=open&&Boolean(d&&d.getTime()<now);
      if(carteira==="aberto"&&!open) return false;
      if(carteira==="vencido"&&!overdue) return false;
      if(carteira==="pago"&&!paid) return false;
      return true;
    });
  } else if(resource==="dividas"){
    const situacao=dashboardFilterValue(url,"situacao");
    const ano=dashboardFilterValue(url,"anoDivida");
    const cobranca=dashboardFilterValue(url,"cobranca");
    out=out.filter(row=>{
      if(!matchesDashboardFilter(row,situacao,["situacao","statusDivida"])) return false;
      if(ano&&!matchesDashboardFilter(row,ano,["ano"])) return false;
      if(cobranca==="execucao"&&!truthyValue(row,["sitExecucao"])) return false;
      if(cobranca==="protesto"&&!truthyValue(row,["protesto"])) return false;
      if(cobranca==="penhora"&&!Boolean(firstValue(row,["penhora"]))) return false;
      return true;
    });
  } else if(resource==="parcelamentos"){
    const parcelamentoId=dashboardFilterValue(url,"parcelamentoId");
    const situacao=dashboardFilterValue(url,"situacao");
    const tipoEntrada=dashboardFilterValue(url,"tipoEntrada");
    const cobranca=dashboardFilterValue(url,"cobranca");
    const inadimplencia=dashboardFilterValue(url,"inadimplencia");
    out=out.filter(row=>{
      if(parcelamentoId&&!matchesDashboardFilter(row,parcelamentoId,["id","idParcelamentos"])) return false;
      if(!matchesDashboardFilter(row,situacao,["situacao.descricao","situacao"])) return false;
      if(!matchesDashboardFilter(row,tipoEntrada,["tipoEntrada"])) return false;
      if(cobranca==="executada"&&!truthyValue(row,["dividaExecutada.valor","dividaExecutada"])) return false;
      if(cobranca==="protestada"&&!truthyValue(row,["dividaProtestada.valor","dividaProtestada"])) return false;
      const vencidas=numericValue(row,["qtdParcelasVencidas"]);
      if(inadimplencia==="com-vencidas"&&vencidas<=0) return false;
      if(inadimplencia==="sem-vencidas"&&vencidas>0) return false;
      return true;
    });
  } else if(resource==="parcelamentos-parcelas"){
    const parcelamentoId=dashboardFilterValue(url,"parcelamentoId");
    if(parcelamentoId){
      out=out.filter(row=>["idParcelamentos","idParcelamento","parcelamento.id","parcelamento.idParcelamentos","parcelamento.idParcelamento","idAcordo","acordo.id","parcelamentoId"].some(path=>String(valueAt(row,path)??"")===parcelamentoId));
    }
  } else if(["contribuintes","imoveis","economicos"].includes(resource)){
    const situacao=dashboardFilterValue(url,"situacao");
    const qualityIssue=dashboardFilterValue(url,"qualityIssue");
    const isInactive=row=>truthyValue(row,["desativado"])||/inativ|desativ/i.test(stringValue(row,["situacao","situacao.descricao","status"],""));
    out=out.filter(row=>{
      const inactive=isInactive(row);
      if(situacao==="ativo"&&inactive) return false;
      if(situacao==="inativo"&&!inactive) return false;
      if(resource==="contribuintes"&&qualityIssue==="sem-documento"&&firstValue(row,["cpf","cnpj","cpfCnpj","documento"])!==undefined) return false;
      if(resource==="contribuintes"&&qualityIssue==="sem-contato"&&firstValue(row,["email","emailPrincipal","telefone","fone","celular"])!==undefined) return false;
      if(resource==="imoveis"&&qualityIssue==="sem-endereco"){
        if(firstValue(row,["nomeLogradouro","logradouro.nome"])!==undefined&&firstValue(row,["cep","endereco.cep"])!==undefined) return false;
      }
      if(resource==="economicos"&&qualityIssue==="sem-atividade"){
        const id=String(firstValue(row,["id","idEconomico"])||"");
        if(!id||context.ecoWithActivity?.has(id)) return false;
      }
      return true;
    });
  } else if(resource==="economicos-atividades"&&context.economicIds instanceof Set){
    out=out.filter(row=>{
      const id=firstValue(row,["idEconomico","economico.id","economicoId"]);
      return id!==undefined&&id!==null&&context.economicIds.has(String(id));
    });
  } else if(["imoveis-responsaveis","imoveis-corresponsaveis"].includes(resource)&&context.propertyIds instanceof Set){
    out=out.filter(row=>{
      const id=firstValue(row,["iImoveis","idImovel","imovel.id","imovelId"]);
      return id!==undefined&&id!==null&&context.propertyIds.has(String(id));
    });
  }

  // Local analytic filters reference real columns of this source.
  const search=normalizeGlobalSearch(url.searchParams.get("detailSearch")||url.searchParams.get("busca")||"");
  const field=url.searchParams.get("detailField")||"";
  const value=normalizeGlobalSearch(url.searchParams.get("detailValue")||"");
  const situation=url.searchParams.get("detailSituation")||"";
  const dateField=def.columns?.find(column=>column[0]===(url.searchParams.get("detailDateField")||"data")&&column[3]==="date");
  const from=url.searchParams.get("detailFrom")||"";
  const to=url.searchParams.get("detailTo")||"";
  const selectedColumn=def.columns?.find(column=>column[0]===field);
  const ownerNames=row=>context.propertyResponsibleNames?.get(String(valueAt(row,"id")??valueAt(row,"idImovel")??""))||"";
  const situationColumn=def.columns?.find(column=>column[0]==="situacao");
  const mainPaths={
    logradouro:["nomeLogradouro","logradouro.nome"],bairro:["nomeBairro","bairro.nome","bairro"],setor:["setor.codigo","setor","nomeSetor"],cidade:["nomeCidade","cidade.nome"],
    tipoPessoa:["tipoPessoa.descricao","tipoPessoa"],credito:["creditoTributario.descricao","credito.descricao","idCreditosTributarios"],origem:["tipoReferente","origem"],
    classificacaoReceita:["classificacao"],tipoCredito:["tipoCadastro.descricao"],tipoLogradouro:["tipoLogradouroDescricao"],zonaFiscal:["zonaFiscal"],indexador:["moeda.nome","moeda.sigla"]
  };
  const mainKeys={contribuintes:["tipoPessoa","cidade"],imoveis:["bairro","logradouro","setor"],economicos:["bairro"],debitos:["credito","origem"],dividas:["credito"],receitas:["classificacaoReceita"],"creditos-tributarios":["tipoCredito"],logradouros:["tipoLogradouro","zonaFiscal"],"indexadores-valores":["indexador"]};
  out=out.filter(row=>{
    for(const key of mainKeys[resource]||[]) if(!matchesDashboardFilter(row,dashboardFilterValue(url,key),mainPaths[key])) return false;
    if(search&&!normalizeGlobalSearch((def.columns||[]).map(column=>stringValue(row,column[2],"")).join(" ")+" "+ownerNames(row)).includes(search)) return false;
    if(value&&!normalizeGlobalSearch(field==="responsavel"?ownerNames(row):selectedColumn?stringValue(row,selectedColumn[2],""):(def.columns||[]).map(column=>stringValue(row,column[2],"")).join(" ")).includes(value)) return false;
    if(situation&&situationColumn&&!matchesDashboardFilter(row,situation,situationColumn[2])) return false;
    if((from||to)&&dateField) {
      const date=dateValue(row,dateField[2]);
      if(!date) return false;
      const day=date.toISOString().slice(0,10);
      if(from&&day<from||to&&day>to) return false;
    }
    if(["obras","transferencias-imoveis","solicitacoes-transferencias-imoveis"].includes(resource)&&!matchesDashboardFilter(row,dashboardFilterValue(url,"situacao"),["situacao","situacao.descricao","status"])) return false;
    if(resource==="obras") {
      const released=Boolean(firstValue(row,["dataLiberacao","dtLiberacao"]));
      const filter=dashboardFilterValue(url,"liberacao");
      if(filter==="liberada"&&!released||filter==="pendente"&&released) return false;
    }
    if(resource==="transferencias-imoveis") {
      if(!matchesDashboardFilter(row,dashboardFilterValue(url,"certidao"),["statusCertidaoITBI","statusCertidao","certidaoStatus"])||!matchesDashboardFilter(row,dashboardFilterValue(url,"cobranca"),["tipoCobranca","tipoCobranca.descricao","cobranca"])) return false;
    }
    if(resource==="guias-unificadas") {
      const paid=Boolean(firstValue(row,["nroBaixa"]));
      const due=dateValue(row,["dtVencimento"]);
      const overdue=!paid&&Boolean(due&&due.getTime()<Date.now());
      const situation=dashboardFilterValue(url,"situacao"),boleto=dashboardFilterValue(url,"boleto");
      if(situation==="paga"&&!paid||situation==="vencida"&&!overdue||situation==="aberta"&&(paid||overdue)) return false;
      const registered=truthyValue(row,["boletoRegistrado"]);
      if(boleto==="sim"&&!registered||boleto==="nao"&&registered) return false;
    }
    if(resource==="indexadores") {
      if(!matchesDashboardFilter(row,dashboardFilterValue(url,"indexador"),["nome","sigla"])) return false;
      const current=truthyValue(row,["corrente"]),filter=dashboardFilterValue(url,"corrente");
      if(filter==="sim"&&!current||filter==="nao"&&current) return false;
    }
    if(resource.startsWith("encerramento-")) {
      if(!matchesDashboardFilter(row,dashboardFilterValue(url,"competencia"),["mesEncerramento","competencia","mes","referencia"])) return false;
    }
    if(resource==="creditos-tributarios") {
      const inactive=truthyValue(row,["desativado.valor","desativado"]),filter=dashboardFilterValue(url,"situacaoCredito");
      if(filter==="ativo"&&inactive||filter==="inativo"&&!inactive) return false;
    }
    if(resource==="imoveis") {
      const rural=truthyValue(row,["rural"])||/rural/i.test(stringValue(row,["tipoZona","zona"],""));
      const inactive=truthyValue(row,["desativado"])||/inativ|desativ|cancel/i.test(stringValue(row,["situacao","status"],""));
      const zona=dashboardFilterValue(url,"zona"),cadastro=dashboardFilterValue(url,"cadastro");
      if(zona==="rural"&&!rural||zona==="urbana"&&rural||cadastro==="ativo"&&inactive||cadastro==="inativo"&&!inactive) return false;
    }
    if(resource==="contribuintes") {
      const simples=dashboardFilterValue(url,"simples");
      const opted=truthyValue(row,["optanteSimples","simplesNacional","optanteSimplesNacional"]);
      if(simples==="sim"&&!opted||simples==="nao"&&opted) return false;
    }
    return true;
  });
  return out;
}

async function buildDetailPage(env,tenant,resource,url,options={}) {
  const def=DETAIL_RESOURCES[resource];
  if(!def) throw new Error("DETAIL_RESOURCE_NOT_ALLOWED");

  const limit=Math.max(5,Math.min(50,Number(url.searchParams.get("limit")||25)));
  const startOffset=Math.max(0,Number(url.searchParams.get("offset")||0));

  const src=await safeBethaRows(env,tenant,def.source,def.resource,{
    limit,
    maxPages:1,
    startOffset,
    chunkMode:true
  });
  if(src.error) {
    const error=new Error(src.error);
    error.status=src.errorStatus||502;
    throw error;
  }

  const qualityIssue=dashboardFilterValue(url,"qualityIssue");
  const detailContext={};
  let propertyRelations=null;
  if(resource==="imoveis"&&(options.ownerNames||url.searchParams.get("contribuinteId"))) {
    if(!options.ownerNames) throw new Error("PAGE_PERMISSION_DENIED");
    propertyRelations=await loadPropertyRelationIndex(env,tenant);
    detailContext.propertyResponsibleNames=new Map();
    for(const relation of propertyRelations.rows){const old=detailContext.propertyResponsibleNames.get(relation.propertyId)||"";detailContext.propertyResponsibleNames.set(relation.propertyId,old+(old?"; ":"")+relation.name);}
    const selected=url.searchParams.get("contribuinteId");
    if(selected) {
      if(!propertyRelations.complete) throw new Error("DETAIL_RELATION_SOURCE_INCOMPLETE");
      detailContext.contributorPropertyIds=new Set(propertyRelations.rows.filter(row=>row.key===selected).map(row=>row.propertyId));
    }
  }

  if(resource==="economicos"&&qualityIssue==="sem-atividade"){
    const atividades=await safeBethaRows(env,tenant,"bi","economicos-atividades");
    if(atividades.error){
      const error=new Error(atividades.error);
      error.status=atividades.errorStatus||502;
      throw error;
    }
    detailContext.ecoWithActivity=new Set(
      atividades.rows
        .map(row=>String(firstValue(row,["idEconomico","economico.id"])||""))
        .filter(Boolean)
    );
  }
  if(resource==="economicos-atividades"){
    const busca=dashboardFilterValue(url,"busca");
    const situacao=dashboardFilterValue(url,"situacao");
    const bairro=dashboardFilterValue(url,"bairro");
    if(busca||situacao||bairro){
      const economicos=await safeBethaRows(env,tenant,"bi","economicos");
      if(economicos.error){
        const error=new Error(economicos.error);
        error.status=economicos.errorStatus||502;
        throw error;
      }
      const normalizedSearch=busca.toLocaleLowerCase("pt-BR");
      const economicRows=economicos.rows.filter(row=>{
        if(situacao&&!matchesDashboardFilter(row,situacao,["situacao","situacao.descricao","status"])) return false;
        if(bairro&&!matchesDashboardFilter(row,bairro,["nomeBairro","bairro.nome","bairro"])) return false;
        if(normalizedSearch){
          const searchable=[
            stringValue(row,["nome"],""),
            stringValue(row,["nomeFantasia"],""),
            stringValue(row,["pessoa.nome"],"")
          ].join(" ").toLocaleLowerCase("pt-BR");
          if(!searchable.includes(normalizedSearch)) return false;
        }
        return true;
      });
      detailContext.economicIds=new Set(
        economicRows.map(row=>String(firstValue(row,["id","idEconomico"])||"")).filter(Boolean)
      );
    }
  }
  if(["imoveis-responsaveis","imoveis-corresponsaveis"].includes(resource)){
    const bairro=dashboardFilterValue(url,"bairro");
    const logradouro=dashboardFilterValue(url,"logradouro");
    const setor=dashboardFilterValue(url,"setor");
    const zona=dashboardFilterValue(url,"zona");
    const cadastro=dashboardFilterValue(url,"cadastro");
    if(bairro||logradouro||setor||zona||cadastro){
      const imoveis=await safeBethaRows(env,tenant,"bi","imoveis");
      if(imoveis.error){
        const error=new Error(imoveis.error);
        error.status=imoveis.errorStatus||502;
        throw error;
      }
      const isRural=row=>truthyValue(row,["rural"])||/rural/i.test(stringValue(row,["tipoZona","zona"],""));
      const isInactive=row=>truthyValue(row,["desativado"])||/inativ|desativ|cancel/i.test(stringValue(row,["situacao","status"],""));
      const propertyRows=imoveis.rows.filter(row=>{
        if(bairro&&!matchesDashboardFilter(row,bairro,["nomeBairro","bairro.nome","bairro"])) return false;
        if(logradouro&&!matchesDashboardFilter(row,logradouro,["nomeLogradouro","logradouro.nome"])) return false;
        if(setor&&!matchesDashboardFilter(row,setor,["setor","setor.codigo","nomeSetor"])) return false;
        if(zona==="rural"&&!isRural(row)) return false;
        if(zona==="urbana"&&isRural(row)) return false;
        if(cadastro==="ativo"&&isInactive(row)) return false;
        if(cadastro==="inativo"&&!isInactive(row)) return false;
        return true;
      });
      detailContext.propertyIds=new Set(
        propertyRows.map(row=>String(firstValue(row,["id","idImovel"])||"")).filter(Boolean)
      );
    }
  }

  let filtered=detailFilterRows(resource,src.rows,url,detailContext);

  // Parcelas podem estar muito distantes no conjunto global. Para um
  // parcelamento específico, a busca precisa atravessar a fonte inteira até
  // encontrar o vínculo, não apenas as primeiras páginas.
  const relationScan = resource==="parcelamentos-parcelas" && Boolean(dashboardFilterValue(url,"parcelamentoId"));

  // O dashboard pode contar registros de todo o exercício enquanto a primeira
  // página física da API não contém itens do recorte. Para o micro, avance
  // páginas até encontrar registros compatíveis (ou esgotar a fonte), em vez
  // de devolver "nenhum registro" prematuramente.
  let scanOffset=src.nextOffset;
  let scanHasMore=src.hasMore===true;
  let scanPages=1;
  const scanMaxPages=4;
  while(filtered.length===0 && scanHasMore && scanOffset!==null && scanOffset!==undefined && scanPages<scanMaxPages){
    const page=await safeBethaRows(env,tenant,def.source,def.resource,{
      limit,
      maxPages:1,
      startOffset:Number(scanOffset),
      chunkMode:true
    });
    if(page.error) {const error=new Error(page.error);error.status=page.errorStatus||502;throw error;}
    filtered=detailFilterRows(resource,page.rows,url,detailContext);
    scanOffset=page.nextOffset;
    scanHasMore=page.hasMore===true;
    scanPages++;
  }

  const columns=def.columns.map(([key,label,paths,format])=>({key,label,format}));
  const responsibleNames=new Map();
  if(propertyRelations) {
    columns.splice(2,0,{key:"responsavel",label:"Responsáveis cadastrados",format:"text"});
    for(const relation of propertyRelations.rows){const names=responsibleNames.get(relation.propertyId)||new Set();names.add(relation.name);responsibleNames.set(relation.propertyId,names);}
  }
  const rows=filtered.map((row,index)=>{
    const item={};
    for(const [key,,paths,format] of def.columns){
      item[key]=detailScalar(row,paths,format);
    }
    if(propertyRelations)item.responsavel=[...(responsibleNames.get(String(valueAt(row,"id")??valueAt(row,"idImovel")??""))||[])].join("; ");
    if(resource==="parcelamentos"){
      item._drill={
        resource:"parcelamentos-parcelas",
        filterKey:"parcelamentoId",
        filterValue:String(firstValue(row,["id","idParcelamentos"])||""),
        label:"Parcelas do parcelamento "+String(firstValue(row,["nroParcelamento","id"])||"")
      };
    }
    return item;
  });

  return {
    resource,
    columns,
    rows,
    pagination:{
      offset:startOffset,
      loaded:rows.length,
      sourceLoaded:src.loaded,
      scannedPages:scanPages,
      searching:rows.length===0&&scanHasMore,
      hasMore:scanHasMore,
      nextOffset:scanOffset
    }
  };
}



const MULTISYSTEM_BOOTSTRAP_TENANT="paulafreitas";
const MULTISYSTEM_PAGE_SIZE=100;
const MULTISYSTEM_MAX_PAGES_PER_RESOURCE=5000;
const MULTISYSTEM_FIELD_DISCOVERY_VERSION=1;
const MULTISYSTEM_FIELD_PROBES_PER_TICK=4;

const MULTISYSTEM_BOOTSTRAP_SOURCES=Object.freeze({
  contabil:[
    {
      resource:"empenhos",
      base:"https://contabil.suite.betha.cloud",
      path:"/dados/v1/empenhos",
      fieldCandidates:[
        "numero","ano","data","dataEmpenho","dataEmissao","valor","valorEmpenhado",
        "situacao","credor","unidadeOrcamentaria","naturezaDespesa","recurso",
        "funcao","subfuncao","programa","acao"
      ]
    },
    {
      resource:"movimentacoes-despesas",
      base:"https://contabil.suite.betha.cloud",
      path:"/dados/v1/movimentacoes/despesas",
      fieldCandidates:["data","ano","valor","tipo","situacao","empenho","credor","unidadeOrcamentaria","naturezaDespesa"]
    },
    {
      resource:"movimentacoes-receitas",
      base:"https://contabil.suite.betha.cloud",
      path:"/dados/v1/movimentacoes/receitas",
      fieldCandidates:["data","ano","valor","tipo","situacao","receita","recurso","unidadeOrcamentaria"]
    },
    {
      resource:"credores",
      base:"https://contabil.suite.betha.cloud",
      path:"/dados/v1/credores",
      fieldCandidates:["nome","razaoSocial","nomeFantasia","cpfCnpj","documento","tipoPessoa","situacao"]
    }
  ],
  compras:[
    {
      resource:"processos-administrativos",
      base:"https://compras.suite.betha.cloud",
      path:"/dados/v1/processos-administrativos",
      fieldCandidates:[
        "numero","ano","data","objeto","descricao","situacao","modalidade",
        "valorEstimado","valorHomologado","secretaria","unidade","formaContratacao"
      ]
    },
    {
      resource:"fornecedores",
      base:"https://compras.suite.betha.cloud",
      path:"/dados/v1/fornecedores",
      fieldCandidates:["nome","razaoSocial","nomeFantasia","cpfCnpj","documento","tipoPessoa","situacao"]
    }
  ],
  folha:[
    {
      resource:"matriculas",
      base:"https://folha.suite.betha.cloud",
      path:"/dados/v1/matriculas",
      fieldCandidates:["numero","matricula","pessoa","nome","cargo","vinculo","lotacao","situacao","dataAdmissao"]
    },
    {
      resource:"funcionarios-cargos",
      base:"https://folha.suite.betha.cloud",
      path:"/dados/v1/funcionarios-cargos",
      fieldCandidates:["funcionario","pessoa","cargo","lotacao","dataInicio","dataFim","situacao"]
    },
    {
      resource:"remuneracoes",
      base:"https://folha.suite.betha.cloud",
      path:"/dados/v1/remuneracoes",
      fieldCandidates:["competencia","matricula","valor","valorBruto","valorLiquido","descontos","encargos","evento"]
    }
  ]
});

async function ensureMultiSystemLoadSchema(env){
  if(!env.AUTH_DB)return;
  await env.AUTH_DB.prepare(
    "CREATE TABLE IF NOT EXISTS bi_multisystem_loads (tenant_id TEXT NOT NULL, system TEXT NOT NULL, resource TEXT NOT NULL, status TEXT NOT NULL, loaded INTEGER NOT NULL DEFAULT 0, pages INTEGER NOT NULL DEFAULT 0, http_status INTEGER, error TEXT, object_key TEXT, fields_json TEXT, updated_at TEXT NOT NULL, PRIMARY KEY (tenant_id,system,resource))"
  ).run();
  await env.AUTH_DB.prepare(
    "CREATE INDEX IF NOT EXISTS idx_bi_multisystem_loads_status ON bi_multisystem_loads (tenant_id,system,status)"
  ).run();
  await env.AUTH_DB.prepare(
    "CREATE TABLE IF NOT EXISTS bi_multisystem_summaries (tenant_id TEXT NOT NULL, system TEXT NOT NULL, resource TEXT NOT NULL, summary_json TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (tenant_id,system,resource))"
  ).run();
}

function multiSystemSimpleValue(value){
  if(value===null||value===undefined)return null;
  if(typeof value==="string"||typeof value==="number"||typeof value==="boolean")return value;
  if(value&&typeof value==="object"&&!Array.isArray(value)){
    for(const key of ["descricao","nome","numero","codigo","id"]){
      const nested=value[key];
      if(nested!==null&&nested!==undefined&&nested!=="")return nested;
    }
  }
  return null;
}

function multiSystemMapAdd(target,key,amount=1,maxKeys=160){
  const label=String(key??"").trim()||"Não informado";
  if(!Object.prototype.hasOwnProperty.call(target,label)&&Object.keys(target).length>=maxKeys)return;
  target[label]=(Number(target[label])||0)+(Number(amount)||0);
}

function multiSystemMonthKey(value){
  if(!value)return null;
  const text=String(value);
  const direct=text.match(/^(\d{4})-(\d{2})/);
  if(direct)return direct[1]+"-"+direct[2];
  const br=text.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if(br)return br[3]+"-"+br[2];
  const date=new Date(text);
  if(Number.isNaN(date.getTime()))return null;
  return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0");
}

function emptyMultiSystemSummary(system,resource){
  return {
    version:1,
    system,
    resource,
    lastPage:-1,
    count:0,
    totalValue:0,
    monthly:{},
    groups:{},
    secondaryGroups:{},
    updatedAt:null
  };
}

async function updateMultiSystemSummary(env,tenant,system,source,pageNo,rows){
  if(!env.AUTH_DB||!Array.isArray(rows)||!rows.length)return;
  const current=await env.AUTH_DB.prepare(
    "SELECT summary_json FROM bi_multisystem_summaries WHERE tenant_id=?1 AND system=?2 AND resource=?3 LIMIT 1"
  ).bind(String(tenant.id),system,source.resource).first();

  let summary=emptyMultiSystemSummary(system,source.resource);
  try{
    const parsed=JSON.parse(String(current?.summary_json||"null"));
    if(parsed&&typeof parsed==="object")summary={...summary,...parsed};
  }catch{}

  const numericPage=Math.max(0,Number(pageNo)||0);
  if(Number(summary.lastPage)>=numericPage)return;

  for(const row of rows){
    if(!row||typeof row!=="object")continue;
    summary.count=(Number(summary.count)||0)+1;

    if(system==="contabil"&&source.resource==="empenhos"){
      const value=Number(multiSystemSimpleValue(row.valor));
      if(Number.isFinite(value))summary.totalValue=(Number(summary.totalValue)||0)+value;
      const month=multiSystemMonthKey(multiSystemSimpleValue(row.data));
      if(month)multiSystemMapAdd(summary.monthly,month,Number.isFinite(value)?value:0,180);
      const creditor=multiSystemSimpleValue(row.credor);
      if(creditor!==null)multiSystemMapAdd(summary.groups,creditor,Number.isFinite(value)?value:0,160);
    }else if(system==="compras"&&source.resource==="processos-administrativos"){
      const situation=multiSystemSimpleValue(row.situacao);
      const hiring=multiSystemSimpleValue(row.formaContratacao);
      const object=multiSystemSimpleValue(row.objeto);
      if(situation!==null)multiSystemMapAdd(summary.groups,situation,1,80);
      if(hiring!==null)multiSystemMapAdd(summary.secondaryGroups,hiring,1,80);
      if(object!==null)multiSystemMapAdd(summary.monthly,object,1,120);
    }else if(system==="compras"&&source.resource==="fornecedores"){
      const name=multiSystemSimpleValue(row.nome??row.razaoSocial??row.nomeFantasia);
      if(name!==null)multiSystemMapAdd(summary.groups,name,1,160);
    }
  }

  summary.lastPage=numericPage;
  summary.updatedAt=new Date().toISOString();
  await env.AUTH_DB.prepare(
    "INSERT INTO bi_multisystem_summaries (tenant_id,system,resource,summary_json,updated_at) VALUES (?1,?2,?3,?4,?5) ON CONFLICT(tenant_id,system,resource) DO UPDATE SET summary_json=excluded.summary_json,updated_at=excluded.updated_at"
  ).bind(String(tenant.id),system,source.resource,JSON.stringify(summary),summary.updatedAt).run();
}

async function resetMultiSystemSummary(env,tenantId,system,resource){
  if(!env.AUTH_DB)return;
  await env.AUTH_DB.prepare(
    "DELETE FROM bi_multisystem_summaries WHERE tenant_id=?1 AND system=?2 AND resource=?3"
  ).bind(String(tenantId),system,resource).run();
}

async function getMultiSystemSummary(env,tenantId,system,resource){
  if(!env.AUTH_DB)return null;
  const row=await env.AUTH_DB.prepare(
    "SELECT s.summary_json,s.updated_at,l.status,l.loaded,l.pages,l.http_status,l.error,l.fields_json FROM bi_multisystem_summaries s LEFT JOIN bi_multisystem_loads l ON l.tenant_id=s.tenant_id AND l.system=s.system AND l.resource=s.resource WHERE s.tenant_id=?1 AND s.system=?2 AND s.resource=?3 LIMIT 1"
  ).bind(String(tenantId),system,resource).first();
  if(!row)return null;
  try{
    const summary=JSON.parse(String(row.summary_json||"null"));
    return summary&&typeof summary==="object"?{
      ...summary,
      loadStatus:row.status||null,
      loaded:Number(row.loaded)||0,
      pages:Number(row.pages)||0,
      httpStatus:row.http_status||null,
      error:row.error||null,
      fieldsProfile:parseMultiSystemFieldProfile(row.fields_json)
    }:null;
  }catch{return null;}
}

function multiSystemResourcePrefix(tenantId,system,resource){
  return "multisystem/"+encodeURIComponent(String(tenantId))+"/"+encodeURIComponent(String(system))+"/"+encodeURIComponent(String(resource))+"/";
}

function multiSystemPageObjectKey(tenantId,system,resource,pageNo){
  return multiSystemResourcePrefix(tenantId,system,resource)+"page-"+String(Math.max(0,Number(pageNo)||0)).padStart(6,"0")+".json";
}

function multiSystemFieldNames(rows){
  const fields=new Set();
  for(const row of (rows||[]).slice(0,20)){
    if(!row||typeof row!=="object"||Array.isArray(row))continue;
    for(const key of Object.keys(row))fields.add(key);
    if(fields.size>=200)break;
  }
  return [...fields].slice(0,200);
}

function parseMultiSystemFieldProfile(raw){
  let parsed=null;
  try{parsed=JSON.parse(String(raw||"null"));}catch{}
  if(Array.isArray(parsed)){
    return {
      selected:[...new Set(parsed.map(String).filter(Boolean))],
      probeIndex:0,
      discoveryDone:false,
      version:0
    };
  }
  if(parsed&&typeof parsed==="object"&&!Array.isArray(parsed)){
    return {
      selected:Array.isArray(parsed.selected)?[...new Set(parsed.selected.map(String).filter(Boolean))]:["id"],
      probeIndex:Math.max(0,Number(parsed.probeIndex)||0),
      discoveryDone:parsed.discoveryDone===true,
      version:Math.max(0,Number(parsed.version)||0)
    };
  }
  return {selected:["id"],probeIndex:0,discoveryDone:false,version:0};
}

function serializeMultiSystemFieldProfile(profile){
  return JSON.stringify({
    selected:[...new Set((profile?.selected||["id"]).map(String).filter(Boolean))].slice(0,200),
    probeIndex:Math.max(0,Number(profile?.probeIndex)||0),
    discoveryDone:profile?.discoveryDone===true,
    version:MULTISYSTEM_FIELD_DISCOVERY_VERSION
  });
}

function mergeMultiSystemFields(profile,rows){
  const selected=new Set((profile?.selected||["id"]).map(String).filter(Boolean));
  for(const field of multiSystemFieldNames(rows))selected.add(field);
  return {...profile,selected:[...selected].slice(0,200)};
}

async function multiSystemGetPage(env,tenant,source,offset,limit,fields=[]){
  const query=new URLSearchParams({limit:String(limit),offset:String(offset)});
  const requested=[...new Set((fields||[]).map(String).filter(Boolean))];
  if(requested.length)query.set("fields",requested.join(","));
  const target=String(source.base).replace(/\/$/,"")+source.path+"?"+query.toString();
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),30000);
  try{
    const response=await fetch(target,{
      method:"GET",
      signal:controller.signal,
      headers:{
        "Accept":"application/json",
        "Authorization":"Bearer "+tenant.accessToken,
        "User-Access":tenant.userAccess
      }
    });
    const parsed=await readJsonResponse(response);
    if(!response.ok){
      const error=new Error("BETHA_HTTP_"+response.status);
      error.status=response.status;
      throw error;
    }
    return {
      rows:payloadRows(parsed.body),
      body:parsed.body,
      status:response.status
    };
  }finally{
    clearTimeout(timer);
  }
}

async function discoverMultiSystemFields(env,tenant,source,state){
  const candidates=Array.isArray(source.fieldCandidates)?source.fieldCandidates:[];
  let profile=parseMultiSystemFieldProfile(state?.fields_json);
  if(profile.version!==MULTISYSTEM_FIELD_DISCOVERY_VERSION){
    profile={selected:["id"],probeIndex:0,discoveryDone:false,version:MULTISYSTEM_FIELD_DISCOVERY_VERSION};
  }
  if(profile.discoveryDone||!candidates.length)return profile;

  const end=Math.min(candidates.length,profile.probeIndex+MULTISYSTEM_FIELD_PROBES_PER_TICK);
  for(let index=profile.probeIndex;index<end;index++){
    const candidate=String(candidates[index]||"").trim();
    if(!candidate)continue;
    try{
      const probe=await multiSystemGetPage(env,tenant,source,0,1,["id",candidate]);
      const keys=multiSystemFieldNames(probe.rows||[]);
      if(keys.includes(candidate))profile.selected.push(candidate);
      else{
        for(const key of keys)if(key!=="id")profile.selected.push(key);
      }
    }catch(error){
      const status=Number(error?.status)||0;
      if([401,403].includes(status))throw error;
      // Campo não suportado (normalmente 400/422) é simplesmente descartado.
      if(![400,404,422].includes(status))console.warn("multi-system field probe",source.resource,candidate,error?.message||error);
    }
  }

  profile.selected=[...new Set(profile.selected)].slice(0,200);
  profile.probeIndex=end;
  profile.discoveryDone=end>=candidates.length;
  return profile;
}

async function loadMultiSystemIncrementalResource(env,tenant,system,source,state,profile){
  const loaded=Math.max(0,Number(state?.loaded)||0);
  const pages=Math.max(0,Number(state?.pages)||0);
  if(pages>=MULTISYSTEM_MAX_PAGES_PER_RESOURCE)throw new Error("MULTISYSTEM_PAGE_LIMIT");

  const fields=(profile?.selected||["id"]).filter(Boolean);
  const result=await multiSystemGetPage(env,tenant,source,loaded,MULTISYSTEM_PAGE_SIZE,fields);
  const rows=result.rows||[];
  const meta=payloadPageMeta(result.body,loaded,MULTISYSTEM_PAGE_SIZE,rows.length);
  const complete=meta.hasNext===false||rows.length===0||rows.length<MULTISYSTEM_PAGE_SIZE;

  let pageObjectKey=null;
  if(rows.length){
    pageObjectKey=multiSystemPageObjectKey(tenant.id,system,source.resource,pages);
    await env.BI_SYNC_RAW.put(pageObjectKey,JSON.stringify({
      tenantId:tenant.id,
      system,
      resource:source.resource,
      source:"betha-api",
      fields,
      offset:loaded,
      page:pages,
      loaded:rows.length,
      loadedAt:new Date().toISOString(),
      rows
    }),{httpMetadata:{contentType:"application/json"}});
  }

  const nextLoaded=loaded+rows.length;
  const nextPages=pages+(rows.length?1:0);
  const merged=mergeMultiSystemFields(profile,rows);
  return {
    loaded:nextLoaded,
    pages:nextPages,
    httpStatus:result.status,
    complete,
    objectKey:complete
      ? multiSystemResourcePrefix(tenant.id,system,source.resource)
      : (pageObjectKey||state?.object_key||multiSystemResourcePrefix(tenant.id,system,source.resource)),
    profile:merged,
    pageNo:pages,
    rows
  };
}

function multiSystemStateNeedsWork(source,state,configUpdatedAt){
  if(!state)return true;
  if(state.status==="error"){
    const httpStatus=Number(state.http_status)||0;
    const failedAt=Date.parse(String(state.updated_at||""))||0;
    if([401,403].includes(httpStatus))return configUpdatedAt>failedAt;
    if(httpStatus===404)return false;
    return Date.now()-failedAt>=5*60*1000;
  }

  const profile=parseMultiSystemFieldProfile(state.fields_json);
  const hasCandidates=Array.isArray(source?.fieldCandidates)&&source.fieldCandidates.length>0;
  if(hasCandidates&&(!profile.discoveryDone||profile.version!==MULTISYSTEM_FIELD_DISCOVERY_VERSION))return true;

  if(state.status==="complete"){
    return String(state.object_key||"").endsWith("/bootstrap.json");
  }
  return true;
}

async function advanceMultiSystem(env,tenant,system,configUpdatedAt){
  const sources=MULTISYSTEM_BOOTSTRAP_SOURCES[system]||[];
  if(!sources.length)return;

  const states=await env.AUTH_DB.prepare(
    "SELECT resource,status,loaded,pages,http_status,error,object_key,fields_json,updated_at FROM bi_multisystem_loads WHERE tenant_id=?1 AND system=?2"
  ).bind(String(tenant.id),system).all();
  const byResource=new Map((states.results||[]).map(row=>[String(row.resource),row]));

  // A credential update must be validated against previously unauthorized
  // resources before a long-running source monopolizes the system queue.
  const staleAuthRetry=sources.find(item=>{
    const state=byResource.get(item.resource);
    if(!state||state.status!=="error"||![401,403].includes(Number(state.http_status)))return false;
    const failedAt=Date.parse(String(state.updated_at||""))||0;
    return configUpdatedAt>failedAt;
  });

  const source=staleAuthRetry||
    sources.find(item=>multiSystemStateNeedsWork(item,byResource.get(item.resource),configUpdatedAt));
  if(!source)return;

  let previous=byResource.get(source.resource)||null;
  const existingProfile=parseMultiSystemFieldProfile(previous?.fields_json);
  const needsDiscovery=Array.isArray(source.fieldCandidates)&&source.fieldCandidates.length>0&&
    (!existingProfile.discoveryDone||existingProfile.version!==MULTISYSTEM_FIELD_DISCOVERY_VERSION);

  if(needsDiscovery){
    try{
      const profile=await discoverMultiSystemFields(env,tenant,source,previous);
      const discoveryFinished=profile.discoveryDone===true;
      const hasUsefulFields=profile.selected.some(field=>field!=="id");
      const shouldRestart=discoveryFinished&&hasUsefulFields&&Math.max(0,Number(previous?.loaded)||0)>0;

      if(shouldRestart)await resetMultiSystemSummary(env,tenant.id,system,source.resource);

      await env.AUTH_DB.prepare(
        "INSERT INTO bi_multisystem_loads (tenant_id,system,resource,status,loaded,pages,http_status,error,object_key,fields_json,updated_at) VALUES (?1,?2,?3,?4,?5,?6,200,NULL,?7,?8,?9) ON CONFLICT(tenant_id,system,resource) DO UPDATE SET status=excluded.status,loaded=excluded.loaded,pages=excluded.pages,http_status=excluded.http_status,error=NULL,object_key=excluded.object_key,fields_json=excluded.fields_json,updated_at=excluded.updated_at"
      ).bind(
        String(tenant.id),
        system,
        source.resource,
        discoveryFinished?(hasUsefulFields?"running":"schema-limited"):"discovering-fields",
        shouldRestart?0:Math.max(0,Number(previous?.loaded)||0),
        shouldRestart?0:Math.max(0,Number(previous?.pages)||0),
        shouldRestart?multiSystemResourcePrefix(tenant.id,system,source.resource):(previous?.object_key||multiSystemResourcePrefix(tenant.id,system,source.resource)),
        serializeMultiSystemFieldProfile(profile),
        new Date().toISOString()
      ).run();
    }catch(error){
      const code=String(error?.message||error||"MULTISYSTEM_FIELD_DISCOVERY_FAILED");
      const httpStatus=Number(error?.status)||null;
      await env.AUTH_DB.prepare(
        "INSERT INTO bi_multisystem_loads (tenant_id,system,resource,status,loaded,pages,http_status,error,fields_json,updated_at) VALUES (?1,?2,?3,'error',?4,?5,?6,?7,?8,?9) ON CONFLICT(tenant_id,system,resource) DO UPDATE SET status='error',http_status=excluded.http_status,error=excluded.error,fields_json=excluded.fields_json,updated_at=excluded.updated_at"
      ).bind(
        String(tenant.id),system,source.resource,
        Math.max(0,Number(previous?.loaded)||0),
        Math.max(0,Number(previous?.pages)||0),
        httpStatus,
        code.slice(0,240),
        serializeMultiSystemFieldProfile(existingProfile),
        new Date().toISOString()
      ).run();
    }
    return;
  }

  if(previous?.status==="schema-limited")return;

  // If aggregation was introduced after a source had already advanced, its
  // summary can start in the middle of the dataset. Rewind that source once so
  // count/value/group totals cover every page from offset zero.
  if(Math.max(0,Number(previous?.loaded)||0)>0){
    const summaryState=await getMultiSystemSummary(env,tenant.id,system,source.resource);
    const summarized=Number(summaryState?.count)||0;
    const loadedState=Math.max(0,Number(previous.loaded)||0);
    if(!summaryState || summarized!==loadedState){
      await resetMultiSystemSummary(env,tenant.id,system,source.resource);
      await env.AUTH_DB.prepare(
        "UPDATE bi_multisystem_loads SET status='running',loaded=0,pages=0,http_status=200,error=NULL,object_key=?1,updated_at=?2 WHERE tenant_id=?3 AND system=?4 AND resource=?5"
      ).bind(
        multiSystemResourcePrefix(tenant.id,system,source.resource),
        new Date().toISOString(),
        String(tenant.id),
        system,
        source.resource
      ).run();
      return;
    }
  }

  const startedAt=new Date().toISOString();
  await env.AUTH_DB.prepare(
    "INSERT INTO bi_multisystem_loads (tenant_id,system,resource,status,loaded,pages,updated_at) VALUES (?1,?2,?3,'running',0,0,?4) ON CONFLICT(tenant_id,system,resource) DO UPDATE SET status='running',error=NULL,updated_at=excluded.updated_at"
  ).bind(String(tenant.id),system,source.resource,startedAt).run();

  try{
    const profile=parseMultiSystemFieldProfile(previous?.fields_json);
    const result=await loadMultiSystemIncrementalResource(env,tenant,system,source,previous,profile);
    await updateMultiSystemSummary(env,tenant,system,source,result.pageNo,result.rows);
    await env.AUTH_DB.prepare(
      "UPDATE bi_multisystem_loads SET status=?1,loaded=?2,pages=?3,http_status=?4,error=NULL,object_key=?5,fields_json=?6,updated_at=?7 WHERE tenant_id=?8 AND system=?9 AND resource=?10"
    ).bind(
      result.complete?"complete":"running",
      result.loaded,
      result.pages,
      result.httpStatus,
      result.objectKey,
      serializeMultiSystemFieldProfile(result.profile),
      new Date().toISOString(),
      String(tenant.id),
      system,
      source.resource
    ).run();
  }catch(error){
    const code=String(error?.message||error||"MULTISYSTEM_LOAD_FAILED");
    const httpStatus=Number(error?.status)||null;
    await env.AUTH_DB.prepare(
      "UPDATE bi_multisystem_loads SET status='error',http_status=?1,error=?2,updated_at=?3 WHERE tenant_id=?4 AND system=?5 AND resource=?6"
    ).bind(httpStatus,code.slice(0,240),new Date().toISOString(),String(tenant.id),system,source.resource).run();
  }
}

async function runMultiSystemBootstrap(env){
  if(!env.AUTH_DB||!env.BI_SYNC_RAW)return;
  await ensureMultiSystemLoadSchema(env);

  let tenant;
  try{
    tenant=await resolveTenant(env,MULTISYSTEM_BOOTSTRAP_TENANT);
  }catch(error){
    console.warn("Multi-system bootstrap tenant unavailable",error?.message||error);
    return;
  }

  const tenantConfigState=await env.AUTH_DB.prepare(
    "SELECT updated_at FROM bi_tenant_configs WHERE id=?1 LIMIT 1"
  ).bind(String(tenant.id)).first();
  const configUpdatedAt=Date.parse(String(tenantConfigState?.updated_at||""))||0;

  await Promise.allSettled(
    ["contabil","compras","folha"].map(system=>advanceMultiSystem(env,tenant,system,configUpdatedAt))
  );
}

const MULTISYSTEM_SAMPLE_FILES=Object.freeze({
  contabil:"contabil-100.json",
  compras:"compras-100.json",
  folha:"folha-100.json"
});
const MULTISYSTEM_SAMPLE_CACHE=new Map();

async function loadMultiSystemSample(system) {
  const key=String(system||"");
  const file=MULTISYSTEM_SAMPLE_FILES[key];
  if(!file) throw new Error("MULTISYSTEM_SAMPLE_NOT_FOUND");

  const cached=MULTISYSTEM_SAMPLE_CACHE.get(key);
  if(cached&&cached.expiresAt>Date.now()) return cached;

  const sourceUrl=FRONT_SOURCE_BASE+"/data/samples/"+file;
  const response=await fetch(sourceUrl,{
    headers:{"Accept":"application/json"},
    cf:{cacheTtl:300,cacheEverything:true}
  });
  if(!response.ok) throw new Error("MULTISYSTEM_SAMPLE_HTTP_"+response.status);
  const body=await response.json();
  if(!Array.isArray(body)) throw new Error("MULTISYSTEM_SAMPLE_INVALID");

  const rows=body.slice(0,100);
  const value={rows,sourceUrl,expiresAt:Date.now()+5*60*1000};
  MULTISYSTEM_SAMPLE_CACHE.set(key,value);
  return value;
}

function sampleNumber(row,field) {
  const value=Number(row&&row[field]);
  return Number.isFinite(value)?value:0;
}

function sampleSum(rows,field) {
  return (rows||[]).reduce((sum,row)=>sum+sampleNumber(row,field),0);
}

function sampleDistinct(rows,field) {
  return new Set((rows||[]).map(row=>String((row&&row[field])??"").trim()).filter(Boolean)).size;
}

function sampleFilterRows(rows,url,filterFields=[]) {
  const periodo=String(url.searchParams.get("periodo")||"ano");
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  let out=(rows||[]).filter(row=>{
    if(periodo==="todos") return true;
    const mes=String(row&&row.mes||row&&row.competencia||row&&row.data||"");
    return !Number.isFinite(exercicio) || !mes || mes.startsWith(String(exercicio));
  });

  for(const field of filterFields){
    const selected=dashboardFilterValue(url,field);
    if(!selected) continue;
    const expected=String(selected).localeCompare("true","pt-BR",{sensitivity:"base"})===0
      ? "true"
      : String(selected).localeCompare("false","pt-BR",{sensitivity:"base"})===0
        ? "false"
        : String(selected);
    out=out.filter(row=>String((row&&row[field])??"").localeCompare(expected,"pt-BR",{sensitivity:"base"})===0);
  }
  return out;
}

function sampleGroup(rows,groupField,valueField,{agg="sum",distinctField="",limit=12}={}) {
  const map=new Map();
  for(const row of rows||[]){
    const label=String((row&&row[groupField])??"Não informado").trim()||"Não informado";
    if(!map.has(label)) map.set(label,agg==="distinct"?new Set():0);
    if(agg==="count"){
      map.set(label,Number(map.get(label)||0)+1);
    }else if(agg==="distinct"){
      const set=map.get(label);
      const value=String((row&&row[distinctField])??"").trim();
      if(value) set.add(value);
    }else{
      map.set(label,Number(map.get(label)||0)+sampleNumber(row,valueField));
    }
  }
  const entries=[...map.entries()].map(([label,value])=>[
    label,
    agg==="distinct" ? value.size : Number(value)||0
  ]);
  entries.sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0]),"pt-BR",{sensitivity:"base"}));
  return entries.slice(0,Math.max(1,Math.min(20,Number(limit)||12)));
}

function sampleMonthlyChart(rows,fields) {
  const map=new Map();
  for(const row of rows||[]){
    const month=String(row&&row.mes||row&&row.competencia||row&&row.data||"").slice(0,7);
    if(!month) continue;
    if(!map.has(month)) map.set(month,Object.fromEntries(fields.map(field=>[field.field,0])));
    const bucket=map.get(month);
    for(const field of fields) bucket[field.field]+=sampleNumber(row,field.field);
  }
  const labels=[...map.keys()].sort();
  return {
    format:"currency",
    labels,
    datasets:fields.map(field=>({
      label:field.label,
      data:labels.map(label=>Number(map.get(label)[field.field]||0))
    }))
  };
}

function sampleGroupChart(rows,groupField,valueField,label,format="currency",options={}) {
  const entries=sampleGroup(rows,groupField,valueField,options);
  return {
    format,
    labels:entries.map(([name])=>name),
    datasets:[{label,data:entries.map(([,value])=>value)}]
  };
}

function multiSystemSampleMeta(system,sample,rows) {
  return {
    dataMode:"sample",
    sample:true,
    sampleSystem:system,
    sampleSize:Array.isArray(sample&&sample.rows)?sample.rows.length:0,
    filteredRows:Array.isArray(rows)?rows.length:0,
    source:sample&&sample.sourceUrl?sample.sourceUrl:"",
    warning:"AMOSTRA LOCAL SINTÉTICA – 100 registros. Não representa dados reais da prefeitura."
  };
}

function multiSystemSortedEntries(values,limit=12){
  return Object.entries(values&&typeof values==="object"?values:{})
    .map(([label,value])=>[String(label),Number(value)||0])
    .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],"pt-BR"))
    .slice(0,Math.max(1,Number(limit)||12));
}

function multiSystemMonthlyEntries(summary,periodo,exercicio){
  const entries=Object.entries(summary?.monthly||{})
    .filter(([key])=>/^\d{4}-\d{2}$/.test(String(key)))
    .map(([key,value])=>[String(key),Number(value)||0])
    .sort((a,b)=>a[0].localeCompare(b[0]));

  if(periodo==="todos")return entries;
  const year=String(Number(exercicio)||new Date().getFullYear());
  if(periodo==="12m"){
    const anchor=new Date(Number(year),new Date().getMonth(),1);
    const start=new Date(anchor.getFullYear(),anchor.getMonth()-11,1);
    const startKey=start.getFullYear()+"-"+String(start.getMonth()+1).padStart(2,"0");
    const endKey=anchor.getFullYear()+"-"+String(anchor.getMonth()+1).padStart(2,"0");
    return entries.filter(([key])=>key>=startKey&&key<=endKey);
  }
  if(periodo==="mes"){
    const month=new Date().getMonth()+1;
    const key=year+"-"+String(month).padStart(2,"0");
    return entries.filter(([candidate])=>candidate===key);
  }
  return entries.filter(([key])=>key.startsWith(year+"-"));
}

function multiSystemMonthLabel(key){
  const [year,month]=String(key).split("-");
  const names=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const index=Number(month)-1;
  return (names[index]||month)+"/"+String(year).slice(-2);
}

function multiSystemRealMeta(system,summaries,extra={}){
  const list=(summaries||[]).filter(Boolean);
  const loaded=list.reduce((sum,item)=>sum+(Number(item.loaded)||Number(item.count)||0),0);
  const pages=list.reduce((sum,item)=>sum+(Number(item.pages)||0),0);
  const complete=list.length>0&&list.every(item=>item.loadStatus==="complete");
  const errors=list.filter(item=>item.error).map(item=>({source:item.resource,error:item.error}));
  const updatedAt=list.map(item=>item.updatedAt).filter(Boolean).sort().at(-1)||new Date().toISOString();
  return {
    dataMode:complete?"real":"real-partial",
    realData:true,
    sampleMode:false,
    generatedAt:updatedAt,
    updatedAt,
    warning:complete?null:"DADOS REAIS DA BETHA · carga incremental em andamento.",
    sourceRows:{[system]:loaded},
    sourceTotals:{[system]:loaded},
    sourceAudit:{
      [system]:{
        loaded,
        reportedTotal:null,
        complete,
        pages,
        error:errors.length?errors.map(item=>item.error).join("; "):null,
        errorStatus:null,
        fields:[...new Set(list.flatMap(item=>item.fieldsProfile?.selected||[]))]
      }
    },
    warnings:errors,
    realSources:list.map(item=>({
      resource:item.resource,
      loaded:Number(item.loaded)||0,
      pages:Number(item.pages)||0,
      status:item.loadStatus||"partial",
      fields:item.fieldsProfile?.selected||[]
    })),
    ...extra
  };
}

async function buildAccountingDashboard(env,tenant,url){
  const summary=await getMultiSystemSummary(env,tenant.id,"contabil","empenhos");
  if(!summary||Number(summary.count)<=0)return buildAccountingSampleDashboard(env,tenant,url);

  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const monthly=multiSystemMonthlyEntries(summary,periodo,exercicio);
  const hasPeriodData=monthly.length>0;
  const inProgress=summary.loadStatus!=="complete";
  const empenhado=hasPeriodData
    ? monthly.reduce((sum,[,value])=>sum+Number(value||0),0)
    : (inProgress?null:0);
  const creditors=multiSystemSortedEntries(summary.groups,12);
  const charts={
    "execucao-mensal":{
      format:"currency",
      labels:monthly.map(([key])=>multiSystemMonthLabel(key)),
      datasets:[{label:"Empenhado",data:monthly.map(([,value])=>value)}]
    }
  };
  const tables=creditors.length?[{
    id:"contabil-credores-reais",
    title:"Empenhado por credor",
    subtitle:"Dados reais carregados da API de empenhos.",
    groupLabel:"Credor",
    columns:[{id:"empenhado",label:"Empenhado",format:"currency"}],
    rows:creditors.map(([label,value])=>({label,values:[value]})),
    totalRows:creditors.length
  }]:[];

  return {
    view:"contabil-visao-geral",
    tenant:{id:tenant.id,name:tenant.name},
    period:{periodo,exercicio},
    filters:{},
    kpis:{
      empenhado,
      liquidado:null,
      pago:null,
      arrecadado:null,
      credores:creditors.length?Object.keys(summary.groups||{}).length:null
    },
    charts,
    tables,
    meta:multiSystemRealMeta("contabil",[summary],{
      periodDataAvailable:hasPeriodData,
      unavailableMetrics:["liquidado","pago","arrecadado"],
      note:inProgress
        ?"Empenhos reais em carga. Liquidação, pagamento e receita permanecem indisponíveis até as respectivas fontes serem autorizadas/carregadas."
        :"Empenhos reais consolidados. Métricas adicionais dependem das demais fontes contábeis."
    })
  };
}

async function buildProcurementDashboard(env,tenant,url){
  const processSummary=await getMultiSystemSummary(env,tenant.id,"compras","processos-administrativos");
  if(!processSummary||Number(processSummary.count)<=0)return buildProcurementSampleDashboard(env,tenant,url);
  const supplierSummary=await getMultiSystemSummary(env,tenant.id,"compras","fornecedores");
  const hiring=multiSystemSortedEntries(processSummary.secondaryGroups,12);
  const situations=multiSystemSortedEntries(processSummary.groups,12);

  const charts={};
  if(hiring.length){
    charts["compras-modalidade"]={
      format:"number",
      labels:hiring.map(([label])=>label),
      datasets:[{label:"Processos",data:hiring.map(([,value])=>value)}]
    };
  }

  const tables=situations.length?[{
    id:"compras-situacao-real",
    title:"Processos por situação",
    subtitle:"Distribuição dos processos administrativos carregados.",
    groupLabel:"Situação",
    columns:[{id:"processos",label:"Processos",format:"number"}],
    rows:situations.map(([label,value])=>({label,values:[value]})),
    totalRows:situations.length
  }]:[];

  return {
    view:"compras-visao-geral",
    tenant:{id:tenant.id,name:tenant.name},
    period:{
      periodo:url.searchParams.get("periodo")||"ano",
      exercicio:Number(url.searchParams.get("exercicio")||new Date().getFullYear())
    },
    filters:{},
    kpis:{
      processos:Number(processSummary.count)||0,
      estimado:null,
      homologado:null,
      economia:null,
      fornecedores:supplierSummary&&Number(supplierSummary.count)>0?Number(supplierSummary.count):null
    },
    charts,
    tables,
    meta:multiSystemRealMeta("compras",[processSummary,supplierSummary].filter(Boolean),{
      unavailableMetrics:["estimado","homologado","economia"],
      note:"Dados reais dos processos administrativos. Valores financeiros serão habilitados quando a API disponibilizar campos compatíveis."
    })
  };
}

async function buildAccountingSampleDashboard(env,tenant,url) {
  const sample=await loadMultiSystemSample("contabil");
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const rows=sampleFilterRows(sample.rows,url,["unidade","status","fonteRecurso","credor"]);
  const filters=activeFilterObject({
    unidade:dashboardFilterValue(url,"unidade"),
    status:dashboardFilterValue(url,"status"),
    fonteRecurso:dashboardFilterValue(url,"fonteRecurso"),
    credor:dashboardFilterValue(url,"credor")
  });

  const empenhado=sampleSum(rows,"valorEmpenhado");
  const liquidado=sampleSum(rows,"valorLiquidado");
  const pago=sampleSum(rows,"valorPago");
  const receitaPrevista=sampleSum(rows,"receitaPrevista");
  const receitaArrecadada=sampleSum(rows,"receitaArrecadada");

  return {
    view:"contabil-visao-geral",
    tenant:{id:tenant.id,name:tenant.name},
    period:{periodo,exercicio},
    filters,
    kpis:{
      "receita-prevista":receitaPrevista,
      "receita-arrecadada":receitaArrecadada,
      "despesa-empenhada":empenhado,
      "despesa-liquidada":liquidado,
      "despesa-paga":pago,
      resultado:receitaArrecadada-pago,
      "restos-pagar":sampleSum(rows,"restosPagar"),
      credores:sampleDistinct(rows,"credor")
    },
    charts:{
      "execucao-mensal":sampleMonthlyChart(rows,[
        {field:"valorEmpenhado",label:"Empenhado"},
        {field:"valorLiquidado",label:"Liquidado"},
        {field:"valorPago",label:"Pago"}
      ]),
      "receita-mensal":sampleMonthlyChart(rows,[
        {field:"receitaPrevista",label:"Prevista"},
        {field:"receitaArrecadada",label:"Arrecadada"}
      ]),
      "despesa-unidade":sampleGroupChart(rows,"unidade","valorEmpenhado","Empenhado"),
      "despesa-natureza":sampleGroupChart(rows,"natureza","valorEmpenhado","Empenhado"),
      "credor-pago":sampleGroupChart(rows,"credor","valorPago","Pago")
    },
    meta:multiSystemSampleMeta("contabil",sample,rows)
  };
}

async function buildProcurementSampleDashboard(env,tenant,url) {
  const sample=await loadMultiSystemSample("compras");
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const rows=sampleFilterRows(sample.rows,url,["secretaria","modalidade","status","fornecedor"]);
  const filters=activeFilterObject({
    secretaria:dashboardFilterValue(url,"secretaria"),
    modalidade:dashboardFilterValue(url,"modalidade"),
    status:dashboardFilterValue(url,"status"),
    fornecedor:dashboardFilterValue(url,"fornecedor")
  });

  return {
    view:"compras-visao-geral",
    tenant:{id:tenant.id,name:tenant.name},
    period:{periodo,exercicio},
    filters,
    kpis:{
      processos:rows.length,
      estimado:sampleSum(rows,"valorEstimado"),
      homologado:sampleSum(rows,"valorHomologado"),
      economia:sampleSum(rows,"economia"),
      fornecedores:sampleDistinct(rows,"fornecedor"),
      "contratos-ativos":rows.filter(row=>row&&row.contratoAtivo===true).length
    },
    charts:{
      "compras-mensal":sampleMonthlyChart(rows,[
        {field:"valorEstimado",label:"Estimado"},
        {field:"valorHomologado",label:"Homologado"}
      ]),
      "compras-secretaria":sampleGroupChart(rows,"secretaria","valorHomologado","Homologado"),
      "compras-modalidade":sampleGroupChart(rows,"modalidade","", "Processos","number",{agg:"count"}),
      "compras-fornecedor":sampleGroupChart(rows,"fornecedor","valorHomologado","Homologado")
    },
    meta:multiSystemSampleMeta("compras",sample,rows)
  };
}

async function buildPayrollSampleDashboard(env,tenant,url) {
  const sample=await loadMultiSystemSample("folha");
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const rows=sampleFilterRows(sample.rows,url,["secretaria","vinculo","status","cargo"]);
  const filters=activeFilterObject({
    secretaria:dashboardFilterValue(url,"secretaria"),
    vinculo:dashboardFilterValue(url,"vinculo"),
    status:dashboardFilterValue(url,"status"),
    cargo:dashboardFilterValue(url,"cargo")
  });

  const activeIds=new Set(rows.filter(row=>String(row&&row.status||"").toLocaleLowerCase("pt-BR")==="ativo").map(row=>String(row.servidorId||"")).filter(Boolean));
  const awayIds=new Set(rows.filter(row=>/afast/i.test(String(row&&row.status||""))).map(row=>String(row.servidorId||"")).filter(Boolean));

  return {
    view:"folha-visao-geral",
    tenant:{id:tenant.id,name:tenant.name},
    period:{periodo,exercicio},
    filters,
    kpis:{
      servidores:sampleDistinct(rows,"servidorId"),
      bruto:sampleSum(rows,"bruto"),
      liquido:sampleSum(rows,"liquido"),
      descontos:sampleSum(rows,"descontos"),
      encargos:sampleSum(rows,"encargos"),
      ativos:activeIds.size,
      afastados:awayIds.size
    },
    charts:{
      "folha-mensal":sampleMonthlyChart(rows,[
        {field:"bruto",label:"Bruto"},
        {field:"liquido",label:"Líquido"},
        {field:"encargos",label:"Encargos"}
      ]),
      "folha-secretaria":sampleGroupChart(rows,"secretaria","bruto","Bruto"),
      "folha-vinculo":sampleGroupChart(rows,"vinculo","", "Servidores","number",{agg:"distinct",distinctField:"servidorId"}),
      "folha-status":sampleGroupChart(rows,"status","", "Servidores","number",{agg:"distinct",distinctField:"servidorId"}),
      "folha-cargo":sampleGroupChart(rows,"cargo","bruto","Bruto")
    },
    meta:multiSystemSampleMeta("folha",sample,rows)
  };
}

const MCP_VIEW_LABELS = Object.freeze({
  "visao-geral":"Visão geral",
  arrecadacao:"Arrecadação",
  debitos:"Lançamentos e débitos",
  divida:"Dívida ativa",
  parcelamentos:"Parcelamentos",
  economicos:"Econômicos e ISS",
  imobiliario:"Imobiliário e IPTU",
  itbi:"Transferências e ITBI",
  contribuintes:"Contribuintes",
  encerramento:"Encerramento mensal",
  obras:"Obras",
  qualidade:"Qualidade e auditoria",
  "receitas-creditos":"Receitas e créditos",
  guias:"Guias e documentos",
  indexadores:"Indexadores",
  territorio:"Território cadastral",
  "contabil-visao-geral":"Contabilidade · Visão geral",
  "compras-visao-geral":"Compras · Visão geral",
  "folha-visao-geral":"Folha · Visão geral"
});

const BI_VIEW_LABELS = Object.freeze({
  ...MCP_VIEW_LABELS,
  "contabil-visao-geral":"Contabilidade · Visão geral",
  "contabil-execucao-orcamentaria":"Contabilidade · Execução Orçamentária",
  "contabil-receita":"Contabilidade · Receitas",
  "contabil-despesa":"Contabilidade · Despesas",
  "contabil-empenhos":"Contabilidade · Empenhos",
  "contabil-movimentos":"Contabilidade · Movimentos Contábeis",
  "contabil-restos":"Contabilidade · Restos a Pagar",
  "contabil-credores":"Contabilidade · Credores",
  "contabil-demonstrativos":"Contabilidade · Demonstrativos",
  "contabil-relatorios":"Contabilidade · Relatórios / Balanços",
  "contabil-controle":"Contabilidade · Controle",
  "compras-visao-geral":"Compras · Visão geral",
  "compras-processos":"Compras · Processos",
  "compras-licitacoes":"Compras · Licitações",
  "compras-contratos":"Compras · Contratos",
  "compras-fornecedores":"Compras · Fornecedores",
  "compras-atas":"Compras · Atas de Registro de Preço",
  "compras-itens":"Compras · Catálogo de Itens",
  "compras-controle":"Compras · Controle",
  "folha-visao-geral":"Folha · Visão geral",
  "folha-servidores":"Folha · Servidores",
  "folha-vinculos":"Folha · Vínculos",
  "folha-cargos":"Folha · Cargos",
  "folha-departamentos":"Folha · Departamentos",
  "folha-mensal":"Folha · Folha mensal",
  "folha-eventos":"Folha · Eventos",
  "folha-encargos":"Folha · Encargos",
  "folha-beneficios":"Folha · Benefícios",
  "folha-despesas":"Folha · Despesas",
  "folha-controle":"Folha · Controle"
});

const BI_PERMISSION_VIEW_MAP = Object.freeze({
  BIVisaoGeralPage:"visao-geral",
  BIArrecadacaoPage:"arrecadacao",
  BIDebitosPage:"debitos",
  BIDividaPage:"divida",
  BIParcelamentosPage:"parcelamentos",
  BIReceitasCreditosPage:"receitas-creditos",
  BIGuiasPage:"guias",
  BIIndexadoresPage:"indexadores",
  BIEncerramentoPage:"encerramento",
  BIEconomicosPage:"economicos",
  BIImobiliarioPage:"imobiliario",
  BIContribuintesPage:"contribuintes",
  BITerritorioPage:"territorio",
  BIObrasPage:"obras",
  BIITBIPage:"itbi",
  BIQualidadePage:"qualidade",

  BIContabilVisaoGeralPage:"contabil-visao-geral",
  BIContabilExecucaoOrcamentariaPage:"contabil-execucao-orcamentaria",
  BIContabilReceitaPage:"contabil-receita",
  BIContabilDespesaPage:"contabil-despesa",
  BIContabilEmpenhosPage:"contabil-empenhos",
  BIContabilMovimentosPage:"contabil-movimentos",
  BIContabilRestosPage:"contabil-restos",
  BIContabilCredoresPage:"contabil-credores",
  BIContabilDemonstrativosPage:"contabil-demonstrativos",
  BIContabilRelatoriosPage:"contabil-relatorios",
  BIContabilControlePage:"contabil-controle",

  BIComprasVisaoGeralPage:"compras-visao-geral",
  BIComprasProcessosPage:"compras-processos",
  BIComprasLicitacoesPage:"compras-licitacoes",
  BIComprasContratosPage:"compras-contratos",
  BIComprasFornecedoresPage:"compras-fornecedores",
  BIComprasAtasPage:"compras-atas",
  BIComprasItensPage:"compras-itens",
  BIComprasControlePage:"compras-controle",

  BIFolhaVisaoGeralPage:"folha-visao-geral",
  BIFolhaServidoresPage:"folha-servidores",
  BIFolhaVinculosPage:"folha-vinculos",
  BIFolhaCargosPage:"folha-cargos",
  BIFolhaDepartamentosPage:"folha-departamentos",
  BIFolhaMensalPage:"folha-mensal",
  BIFolhaEventosPage:"folha-eventos",
  BIFolhaEncargosPage:"folha-encargos",
  BIFolhaBeneficiosPage:"folha-beneficios",
  BIFolhaDespesasPage:"folha-despesas",
  BIFolhaControlePage:"folha-controle"
});

function dashboardBuilder(view) {
  const builders={
    "visao-geral":buildOverviewDashboard,
    arrecadacao:buildRevenueDashboard,
    debitos:buildDebtsDashboard,
    divida:buildActiveDebtDashboard,
    parcelamentos:buildInstallmentsDashboard,
    economicos:buildEconomicsDashboard,
    imobiliario:buildRealEstateDashboard,
    itbi:buildItbiDashboard,
    contribuintes:buildTaxpayersDashboard,
    encerramento:buildClosingDashboard,
    obras:buildWorksDashboard,
    qualidade:buildQualityDashboard,
    "receitas-creditos":buildRevenueCodesDashboard,
    guias:buildGuidesDashboard,
    indexadores:buildIndexersDashboard,
    territorio:buildTerritoryDashboard,
    "contabil-visao-geral":buildAccountingDashboard,
    "compras-visao-geral":buildProcurementDashboard,
    "folha-visao-geral":buildPayrollSampleDashboard
  };
  return builders[String(view||"")] || null;
}

function permissionViewsForAccess(access) {
  if (access && (access.admin===true || access.technical===true)) {
    return Object.keys(BI_VIEW_LABELS);
  }

  let serialized="";
  try { serialized=JSON.stringify(access||{}); } catch {}

  const out=[];
  for (const [permissionId,view] of Object.entries(BI_PERMISSION_VIEW_MAP)) {
    if (serialized.includes(permissionId)) out.push(view);
  }

  // Fallback conservador: usuário autorizado sem Page Mapping reconhecido
  // recebe apenas a visão executiva, nunca acesso adicional.
  return out.length ? [...new Set(out)] : ["visao-geral"];
}

const DETAIL_PERMISSION_VIEWS = Object.freeze({
  "debitos-receitas":["debitos"],
  "pagamentos-parcelamentos":["arrecadacao","parcelamentos"],
  "solicitacoes-transferencias-imoveis-movimentacoes":["itbi"],
"pagamentos":["visao-geral", "arrecadacao"],
"dividas-receitas":["divida"],
"parcelamentos-referentes":["parcelamentos"],
"encerramento-dividas":["divida", "encerramento"],
"encerramento-lancamentos":["encerramento"],
"indexadores":["indexadores"],
"bairros":["territorio"],
"distritos":["territorio"],
"obras-responsaveis":["obras"],
"creditos-tributarios-receitas":["receitas-creditos"],
"transferencias-imoveis-compra":["itbi"],

  "pagamentos-detalhados-valores":["arrecadacao","divida"],
  "pagamentos-detalhados":["visao-geral","arrecadacao","economicos","imobiliario","receitas-creditos"],
  debitos:["visao-geral","debitos"],
  dividas:["visao-geral","divida"],
  parcelamentos:["visao-geral","parcelamentos"],
  "parcelamentos-parcelas":["parcelamentos"],
  "guias-unificadas":["guias"],
  contribuintes:["visao-geral","contribuintes","qualidade"],
  imoveis:["visao-geral","imobiliario","qualidade","territorio"],
  "imoveis-responsaveis":["imobiliario"],
  "imoveis-corresponsaveis":["imobiliario"],
  economicos:["visao-geral","economicos","qualidade"],
  "economicos-atividades":["economicos","qualidade"],
  receitas:["receitas-creditos"],
  "creditos-tributarios":["debitos","receitas-creditos"],
  "indexadores-valores":["indexadores"],
  logradouros:["territorio"],
  "imoveis-campos-adicionais":["qualidade"],
  "planta-valores":["imobiliario"],
  obras:["obras"],
  "solicitacoes-transferencias-imoveis":["itbi"],
  "solicitacoes-transferencias-imoveis-itens":["itbi"],
  "transferencias-imoveis":["imobiliario","itbi"]
});

const DATA_PERMISSION_VIEWS = Object.freeze({
  "bi:contribuintes":["contribuintes","qualidade"],
  "bi:imoveis":["imobiliario","qualidade","territorio"],
  "bi:imoveis-responsaveis":["imobiliario"],
  "bi:imoveis-corresponsaveis":["imobiliario"],
  "bi:imoveis-campos-adicionais":["qualidade"],
  "bi:economicos":["economicos","qualidade"],
  "bi:economicos-atividades":["economicos","qualidade"],
  "bi:indexadores":["indexadores"],
  "bi:indexadores-valores":["indexadores"],
  "bi:receitas":["receitas-creditos"],
  "bi:debitos":["debitos"],
  "bi:debitos-receitas":["debitos"],
  "bi:dividas":["divida"],
  "bi:dividas-receitas":["divida"],
  "bi:parcelamentos":["parcelamentos"],
  "bi:parcelamentos-referentes":["parcelamentos"],
  "bi:parcelamentos-parcelas":["parcelamentos"],
  "bi:pagamentos":["arrecadacao"],
  "bi:pagamentos-parcelamentos":["arrecadacao","parcelamentos"],
  "bi:pagamentos-detalhados":["arrecadacao","economicos","imobiliario","receitas-creditos"],
  "bi:pagamentos-detalhados-valores":["arrecadacao","divida"],
  "bi:solicitacoes-transferencias-imoveis":["itbi"],
  "bi:solicitacoes-transferencias-imoveis-itens":["itbi"],
  "bi:solicitacoes-transferencias-imoveis-movimentacoes":["itbi"],
  "bi:transferencias-imoveis":["imobiliario","itbi"],
  "bi:transferencias-imoveis-compra":["itbi"],
  "base:imoveis":["imobiliario","territorio"],
  "base:bairros":["territorio"],
  "base:distritos":["territorio"],
  "base:logradouros":["territorio"],
  "base:loteamentos":["imobiliario","territorio"],
  "base:contribuintes":["contribuintes","qualidade"],
  "base:planta-valores":["imobiliario"],
  "base:obras":["obras"],
  "base:obras-responsaveis":["obras"],
  "base:creditos-tributarios":["debitos","receitas-creditos"],
  "base:creditos-tributarios-receitas":["receitas-creditos"],
  "base:guias-unificadas":["guias"],
  "base:parcelamentos":["parcelamentos"],
  "base:parcelamentos-parcelas":["parcelamentos"],
  "base:encerramento-dividas":["divida","encerramento"],
  "base:encerramento-lancamentos":["encerramento"],
  "base:dividas":["divida"],
  "base:imoveis-transferencias":["imobiliario","itbi"]
});

const GLOBAL_SEARCH_RESOURCES = Object.freeze([
  {resource:"contribuintes",label:"Contribuinte",icon:"account-outline",preferredViews:["contribuintes","visao-geral"],idPaths:["id","idPessoas","idPessoa"],titlePaths:["nome","nomeFantasia","pessoa.nome"],searchPaths:["id","idPessoas","nome","nomeFantasia","cpf","cnpj","cpfCnpj","documento","nomeCidade","nomeBairro","pessoa.nome"],documentPaths:["cpf","cnpj","cpfCnpj","documento"],metaPaths:["tipoPessoa.descricao","tipoPessoa","nomeCidade","nomeBairro"]},
  {resource:"economicos",label:"Econômico",icon:"store-outline",preferredViews:["economicos","visao-geral"],idPaths:["id","idEconomico"],titlePaths:["nome","nomeFantasia","pessoa.nome"],searchPaths:["id","idEconomico","nome","nomeFantasia","pessoa.nome","pessoa.cpf","pessoa.cnpj","pessoa.cpfCnpj","nomeBairro","nomeLogradouro"],documentPaths:["pessoa.cpf","pessoa.cnpj","pessoa.cpfCnpj"],metaPaths:["situacao.descricao","situacao","nomeBairro"]},
  {resource:"imoveis",label:"Imóvel",icon:"home-city-outline",preferredViews:["imobiliario","territorio","visao-geral"],idPaths:["id","idImovel"],titlePaths:["codOrig","codigo","id","idImovel"],searchPaths:["id","idImovel","codOrig","codigo","nomeLogradouro","numero","nomeBairro","setor","cep"],documentPaths:[],metaPaths:["nomeLogradouro","numero","nomeBairro","setor"]},
  {resource:"debitos",label:"Débito",icon:"file-document-edit-outline",preferredViews:["debitos","visao-geral"],idPaths:["id"],titlePaths:["id"],searchPaths:["id","ano","pessoa.nome","pessoa.nomeFantasia","pessoa.cpf","pessoa.cnpj","situacao"],documentPaths:["pessoa.cpf","pessoa.cnpj"],metaPaths:["pessoa.nome","pessoa.nomeFantasia","situacao","ano"]},
  {resource:"dividas",label:"Dívida ativa",icon:"bank-outline",preferredViews:["divida","visao-geral"],idPaths:["id","idDivida"],titlePaths:["id","idDivida"],searchPaths:["id","idDivida","ano","anoDivida","pessoa.nome","pessoa.nomeFantasia","pessoa.cpf","pessoa.cnpj","statusDivida","situacao"],documentPaths:["pessoa.cpf","pessoa.cnpj"],metaPaths:["pessoa.nome","pessoa.nomeFantasia","statusDivida","situacao","ano","anoDivida"]}
]);

function normalizeGlobalSearch(value) {
  return String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR").trim();
}

function globalSearchScalar(row,path) {
  const raw=firstValue(row,[path]);
  if(raw===undefined||raw===null) return "";
  if(typeof raw==="object") return String(raw.nome??raw.descricao??raw.nomeFantasia??raw.codigo??raw.id??"");
  return String(raw);
}

function globalSearchScore(row,query,paths) {
  const normalized=normalizeGlobalSearch(query);
  const digits=String(query||"").replace(/\D/g,"");
  let best=0;
  for(const path of paths||[]){
    const raw=globalSearchScalar(row,path);
    if(!raw) continue;
    const text=normalizeGlobalSearch(raw);
    if(text===normalized) best=Math.max(best,100);
    else if(text.startsWith(normalized)) best=Math.max(best,82);
    else if(text.includes(normalized)) best=Math.max(best,64);
    if(digits.length>=3){
      const rowDigits=raw.replace(/\D/g,"");
      if(rowDigits===digits) best=Math.max(best,98);
      else if(rowDigits.startsWith(digits)) best=Math.max(best,86);
      else if(rowDigits.includes(digits)) best=Math.max(best,70);
    }
  }
  return best;
}

function maskGlobalSearchDocument(value) {
  const digits=String(value||"").replace(/\D/g,"");
  if(!digits) return "";
  if(digits.length<=4) return "••••";
  return "••••••"+digits.slice(-4);
}

function globalSearchMeta(row,paths) {
  const values=[];
  for(const path of paths||[]){
    const value=globalSearchScalar(row,path).trim();
    if(value&&!values.includes(value)) values.push(value);
    if(values.length>=3) break;
  }
  return values.join(" · ");
}

function globalSearchTitle(def,row,id) {
  const value=(def.titlePaths||[]).map(path=>globalSearchScalar(row,path).trim()).find(Boolean);
  if(def.resource==="imoveis") return value ? "Imóvel "+value : "Imóvel";
  if(def.resource==="debitos") return value ? "Débito "+value : "Débito";
  if(def.resource==="dividas") return value ? "Dívida "+value : "Dívida ativa";
  return value || (def.label+(id ? " "+id : ""));
}

function globalSearchAllowedView(def,allowedViews) {
  return (def.preferredViews||[]).find(view=>allowedViews.includes(view)) || (DETAIL_PERMISSION_VIEWS[def.resource]||[]).find(view=>allowedViews.includes(view)) || "";
}

async function buildGlobalSearch(env,tenant,auth,url) {
  const query=String(url.searchParams.get("q")||"").trim().slice(0,120);
  if(query.length<2) return {query,results:[],partial:false,scanned:0,message:"Digite pelo menos 2 caracteres."};
  const requestedLimit=Math.max(5,Math.min(30,Number(url.searchParams.get("limit")||20)));
  const allowedViews=permissionViewsForAccess(auth&&auth.access);
  const normalizedQuery=normalizeGlobalSearch(query);
  const dashboardResults=allowedViews.map(view=>{
    const title=BI_VIEW_LABELS[view]||view;
    const normalizedTitle=normalizeGlobalSearch(title);
    const score=normalizedTitle===normalizedQuery ? 110 : normalizedTitle.startsWith(normalizedQuery) ? 94 : normalizedTitle.includes(normalizedQuery) ? 72 : 0;
    return {kind:"dashboard",category:"Painel",icon:"view-dashboard-outline",view,id:view,title,subtitle:"Abrir painel autorizado",score};
  }).filter(item=>item.score>0);
  const defs=GLOBAL_SEARCH_RESOURCES.filter(def=>{
    const required=DETAIL_PERMISSION_VIEWS[def.resource]||[];
    return required.some(view=>allowedViews.includes(view));
  });
  const batches=await Promise.all(defs.map(async def=>{
    const detail=DETAIL_RESOURCES[def.resource];
    if(!detail) return {def,src:null,matches:[]};
    const src=await safeBethaRows(env,tenant,detail.source,detail.resource,{limit:250,maxPages:4,startOffset:0});
    if(src.error) return {def,src,matches:[]};
    const matches=src.rows.map(row=>({row,score:globalSearchScore(row,query,def.searchPaths)})).filter(item=>item.score>0).sort((a,b)=>b.score-a.score).slice(0,8);
    return {def,src,matches};
  }));
  const results=[];
  let partial=false;
  let scanned=0;
  for(const batch of batches){
    const {def,src,matches}=batch;
    if(src){
      scanned+=Number(src.loaded||0);
      partial=partial||src.hasMore===true||src.truncated===true||src.complete===false;
    }
    const view=globalSearchAllowedView(def,allowedViews);
    for(const item of matches){
      const row=item.row;
      const id=String(firstValue(row,def.idPaths)||"");
      const documentRaw=firstValue(row,def.documentPaths||[]);
      const maskedDocument=maskGlobalSearchDocument(documentRaw);
      const meta=globalSearchMeta(row,def.metaPaths);
      results.push({kind:"record",resource:def.resource,category:def.label,icon:def.icon,view,id,title:globalSearchTitle(def,row,id),subtitle:[maskedDocument,meta].filter(Boolean).join(" · "),score:item.score});
    }
  }
  results.push(...dashboardResults);
  results.sort((a,b)=>b.score-a.score||a.category.localeCompare(b.category,"pt-BR"));
  return {query,results:results.slice(0,requestedLimit).map(({score,...item})=>item),partial,scanned,resources:defs.map(def=>def.resource)};
}

function accessHasConstraintPermission(access,permissionId) {
  if (!access || !permissionId) return false;
  if (access.admin===true || access.technical===true) return true;

  let serialized="";
  try { serialized=JSON.stringify(access); } catch {}
  return serialized.includes(String(permissionId));
}

function requireConstraintPermission(auth,permissionId) {
  if (!accessHasConstraintPermission(auth&&auth.access,permissionId)) {
    throw new Error("PAGE_PERMISSION_DENIED");
  }
}

function adminViewsForAccess(access) {
  const out=[];
  if (accessHasConstraintPermission(access,"BIUsuariosPage")) out.push("usuarios-admin");
  if (accessHasConstraintPermission(access,"BIConfiguracoesPage")) out.push("configuracoes-admin");
  return out;
}

function requireViewPermission(auth,view) {
  const allowedViews=permissionViewsForAccess(auth&&auth.access);
  if (!allowedViews.includes(String(view||""))) {
    throw new Error("PAGE_PERMISSION_DENIED");
  }
}

function requireDetailPermission(auth,resource) {
  const requiredViews=DETAIL_PERMISSION_VIEWS[String(resource||"")];
  if (!requiredViews) return;
  const allowedViews=permissionViewsForAccess(auth&&auth.access);
  if (!requiredViews.some(view=>allowedViews.includes(view))) {
    throw new Error("PAGE_PERMISSION_DENIED");
  }
}

function requireDataPermission(auth,source,resource) {
  if (auth&&auth.access&&(auth.access.admin===true||auth.access.technical===true)) return;
  const key=String(source||"")+":"+String(resource||"");
  const requiredViews=DATA_PERMISSION_VIEWS[key];
  if (!requiredViews) throw new Error("DATA_RESOURCE_PERMISSION_DENIED");
  const allowedViews=permissionViewsForAccess(auth&&auth.access);
  if (!requiredViews.some(view=>allowedViews.includes(view))) {
    throw new Error("DATA_RESOURCE_PERMISSION_DENIED");
  }
}

async function sha256Hex(value) {
  const digest=await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(String(value||""))
  );
  return [...new Uint8Array(digest)]
    .map(byte=>byte.toString(16).padStart(2,"0"))
    .join("");
}

const MCP_OAUTH_SCOPE="bi:read";
const MCP_OAUTH_CLIENT_PREFIX="mcp-oauth-client:";
const MCP_OAUTH_FLOW_PREFIX="mcp-oauth-flow:";
const MCP_OAUTH_LOGIN_STATE_PREFIX="mcp-oauth-login-state:";
const MCP_OAUTH_CODE_PREFIX="mcp-oauth-code:";
const MCP_OAUTH_ACCESS_PREFIX="mcp-oauth-access:";
const MCP_SDK_RESOURCE_DEFAULT="https://bi-vella-mcp.ueliton-bueno.workers.dev/mcp";

function mcpOAuthStore(env) {
  const store=env.BI_SESSIONS || env.AUTH_SESSIONS;
  if(!store) throw new Error("SESSION_STORE_NOT_CONFIGURED");
  return store;
}

function mcpOAuthIssuer(request,env) {
  const configured=String(env.MCP_AUTH_ISSUER||"").trim();
  return configured ? configured.replace(/\/$/,"") : new URL(request.url).origin;
}

function mcpOAuthAllowedResources(request,env) {
  const values=[
    new URL("/mcp",request.url).toString(),
    MCP_SDK_RESOURCE_DEFAULT,
    String(env.MCP_RESOURCE_URL||"").trim(),
    ...String(env.MCP_RESOURCE_URLS||"").split(",").map(v=>v.trim())
  ].filter(Boolean);
  return [...new Set(values)];
}

function mcpOAuthResourceAllowed(request,env,resource) {
  return mcpOAuthAllowedResources(request,env).includes(String(resource||"").trim());
}

function mcpOAuthMetadata(request,env) {
  const issuer=mcpOAuthIssuer(request,env);
  return {
    issuer,
    authorization_endpoint:issuer+"/oauth/authorize",
    token_endpoint:issuer+"/oauth/token",
    registration_endpoint:issuer+"/oauth/register",
    response_types_supported:["code"],
    grant_types_supported:["authorization_code"],
    code_challenge_methods_supported:["S256"],
    token_endpoint_auth_methods_supported:["none"],
    scopes_supported:[MCP_OAUTH_SCOPE],
    client_id_metadata_document_supported:false,
    authorization_response_iss_parameter_supported:true
  };
}

function mcpOAuthNormalizeScope(scope) {
  const requested=String(scope||"").split(/\s+/).filter(Boolean);
  if(!requested.length) return MCP_OAUTH_SCOPE;
  if(requested.some(item=>item!==MCP_OAUTH_SCOPE)) throw new Error("MCP_OAUTH_SCOPE_INVALID");
  return MCP_OAUTH_SCOPE;
}

function mcpOAuthValidRedirectUri(value) {
  try {
    const url=new URL(String(value||""));
    return url.protocol==="https:" && !url.username && !url.password;
  } catch { return false; }
}

async function mcpOAuthReadClient(env,clientId) {
  const raw=await mcpOAuthStore(env).get(MCP_OAUTH_CLIENT_PREFIX+String(clientId||""));
  if(!raw) return null;
  try {
    const parsed=JSON.parse(raw);
    return parsed&&parsed.kind==="mcp-oauth-client" ? parsed : null;
  } catch { return null; }
}

async function mcpOAuthRegisterClient(request,env) {
  const body=await request.json().catch(()=>null);
  if(!body || typeof body!=="object" || Array.isArray(body)) {
    return json(request,env,400,{error:"invalid_client_metadata"});
  }

  const redirectUris=Array.isArray(body.redirect_uris)
    ? [...new Set(body.redirect_uris.map(v=>String(v||"").trim()).filter(Boolean))]
    : [];
  if(!redirectUris.length || redirectUris.length>10 || redirectUris.some(uri=>!mcpOAuthValidRedirectUri(uri))) {
    return json(request,env,400,{error:"invalid_redirect_uri"});
  }

  const authMethod=String(body.token_endpoint_auth_method||"none");
  if(authMethod!=="none") {
    return json(request,env,400,{error:"invalid_client_metadata",error_description:"Only public PKCE clients are supported."});
  }

  const grantTypes=Array.isArray(body.grant_types)?body.grant_types.map(String):["authorization_code"];
  const responseTypes=Array.isArray(body.response_types)?body.response_types.map(String):["code"];
  if(!grantTypes.includes("authorization_code") || !responseTypes.includes("code")) {
    return json(request,env,400,{error:"invalid_client_metadata"});
  }

  const clientId="mcpclient_"+createSessionId();
  const now=Math.floor(Date.now()/1000);
  const record={
    kind:"mcp-oauth-client",
    clientId,
    clientName:String(body.client_name||"MCP client").slice(0,120),
    redirectUris,
    tokenEndpointAuthMethod:"none",
    grantTypes:["authorization_code"],
    responseTypes:["code"],
    createdAt:new Date().toISOString()
  };
  await mcpOAuthStore(env).put(
    MCP_OAUTH_CLIENT_PREFIX+clientId,
    JSON.stringify(record),
    {expirationTtl:90*24*60*60}
  );

  return json(request,env,201,{
    client_id:clientId,
    client_id_issued_at:now,
    client_name:record.clientName,
    redirect_uris:record.redirectUris,
    token_endpoint_auth_method:"none",
    grant_types:["authorization_code"],
    response_types:["code"]
  });
}

async function mcpOAuthIssueAuthorizationCode(env,flow,userToken) {
  if(!userToken) throw new Error("USER_TOKEN_REQUIRED");
  await currentOAuthUserId(userToken);

  const code="mcpcode_"+createSessionId();
  const hash=await sha256Hex(code);
  const ttl=5*60;
  await mcpOAuthStore(env).put(
    MCP_OAUTH_CODE_PREFIX+hash,
    JSON.stringify({
      kind:"mcp-oauth-code",
      clientId:flow.clientId,
      redirectUri:flow.redirectUri,
      codeChallenge:flow.codeChallenge,
      resource:flow.resource,
      scope:flow.scope,
      tenantId:String(flow.tenantId||""),
      userToken,
      exp:Date.now()+ttl*1000
    }),
    {expirationTtl:ttl}
  );
  return code;
}

function mcpOAuthClientRedirect(flow,params={}) {
  const target=new URL(flow.redirectUri);
  for(const [key,value] of Object.entries(params)) {
    if(value!==undefined && value!==null && String(value)!=="") target.searchParams.set(key,String(value));
  }
  if(flow.clientState) target.searchParams.set("state",String(flow.clientState));
  if(flow.issuer) target.searchParams.set("iss",String(flow.issuer));
  return target.toString();
}

async function mcpOAuthAuthorize(request,env) {
  if(!env.BETHA_LOGIN_CLIENT_ID || !env.BETHA_LOGIN_CLIENT_SECRET) {
    return json(request,env,503,{error:"temporarily_unavailable",error_description:"BI login is not configured."});
  }

  const url=new URL(request.url);
  const responseType=String(url.searchParams.get("response_type")||"");
  const clientId=String(url.searchParams.get("client_id")||"");
  const redirectUri=String(url.searchParams.get("redirect_uri")||"");
  const codeChallenge=String(url.searchParams.get("code_challenge")||"");
  const codeChallengeMethod=String(url.searchParams.get("code_challenge_method")||"");
  const clientState=String(url.searchParams.get("state")||"");
  const resource=String(url.searchParams.get("resource")||"");
  let scope;

  try { scope=mcpOAuthNormalizeScope(url.searchParams.get("scope")||MCP_OAUTH_SCOPE); }
  catch { return json(request,env,400,{error:"invalid_scope"}); }

  if(responseType!=="code" || !clientId || !redirectUri || !codeChallenge || codeChallengeMethod!=="S256") {
    return json(request,env,400,{error:"invalid_request",error_description:"Authorization code with PKCE S256 is required."});
  }
  if(!mcpOAuthResourceAllowed(request,env,resource)) {
    return json(request,env,400,{error:"invalid_target",error_description:"Unknown MCP resource."});
  }

  const client=await mcpOAuthReadClient(env,clientId);
  if(!client) return json(request,env,400,{error:"invalid_client"});
  if(!client.redirectUris.includes(redirectUri)) {
    return json(request,env,400,{error:"invalid_redirect_uri"});
  }

  const flowId=createSessionId();
  const flow={
    kind:"mcp-oauth-flow",
    clientId,
    redirectUri,
    codeChallenge,
    resource,
    scope,
    clientState,
    issuer:mcpOAuthIssuer(request,env),
    createdAt:new Date().toISOString()
  };
  await mcpOAuthStore(env).put(MCP_OAUTH_FLOW_PREFIX+flowId,JSON.stringify(flow),{expirationTtl:10*60});

  const existing=await readStoredSession(request,env);
  if(existing&&existing.accessToken) {
    try {
      return await mcpOAuthContinueAuthorization(request,env,flowId,existing.accessToken);
    } catch {}
  }

  const bethaState=await createOAuthState(env.BETHA_LOGIN_CLIENT_SECRET);
  await mcpOAuthStore(env).put(
    MCP_OAUTH_LOGIN_STATE_PREFIX+bethaState,
    JSON.stringify({kind:"mcp-oauth-login-state",flowId}),
    {expirationTtl:10*60}
  );

  const authorize=new URL(OAUTH_AUTHORIZE_URL);
  authorize.searchParams.set("response_type","code");
  authorize.searchParams.set("client_id",env.BETHA_LOGIN_CLIENT_ID);
  authorize.searchParams.set("redirect_uri",env.BETHA_LOGIN_REDIRECT_URI || LOGIN_REDIRECT_DEFAULT);
  const requestedScopes=String(env.BETHA_LOGIN_SCOPES || "").trim();
  if(requestedScopes) authorize.searchParams.set("scopes",requestedScopes);
  authorize.searchParams.set("state",bethaState);

  return new Response(null,{
    status:302,
    headers:{"Location":authorize.toString(),"Cache-Control":"no-store"}
  });
}


function mcpOAuthEscapeHtml(value) {
  return String(value||"")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

async function mcpOAuthContinueAuthorization(request,env,flowId,userToken) {
  const store=mcpOAuthStore(env);
  const raw=await store.get(MCP_OAUTH_FLOW_PREFIX+String(flowId||""));
  let flow=null;
  try { flow=raw?JSON.parse(raw):null; } catch {}
  if(!flow || flow.kind!=="mcp-oauth-flow") throw new Error("MCP_OAUTH_FLOW_EXPIRED");

  const tenants=await mcpAuthorizedTenantGrants(env,userToken);
  if(!tenants.length) throw new Error("MCP_NO_AUTHORIZED_TENANT");

  if(tenants.length===1) {
    flow.tenantId=String(tenants[0].id);
    const code=await mcpOAuthIssueAuthorizationCode(env,flow,userToken);
    await store.delete(MCP_OAUTH_FLOW_PREFIX+String(flowId));
    return Response.redirect(mcpOAuthClientRedirect(flow,{code}),302);
  }

  flow.userToken=userToken;
  flow.tenantChoices=tenants.map(tenant=>({
    id:String(tenant.id),
    name:String(tenant.name||tenant.id),
    entityId:String(tenant.entityId||""),
    databaseId:String(tenant.databaseId||"")
  }));
  await store.put(
    MCP_OAUTH_FLOW_PREFIX+String(flowId),
    JSON.stringify(flow),
    {expirationTtl:10*60}
  );

  const target=new URL("/oauth/tenant-select",request.url);
  target.searchParams.set("flow",String(flowId));
  return Response.redirect(target.toString(),302);
}

async function mcpOAuthTenantSelectPage(request,env) {
  const url=new URL(request.url);
  const flowId=String(url.searchParams.get("flow")||"");
  if(!flowId) return json(request,env,400,{error:"invalid_request"});

  const raw=await mcpOAuthStore(env).get(MCP_OAUTH_FLOW_PREFIX+flowId);
  let flow=null;
  try { flow=raw?JSON.parse(raw):null; } catch {}
  if(!flow || flow.kind!=="mcp-oauth-flow" || !flow.userToken) {
    return json(request,env,400,{error:"MCP_OAUTH_FLOW_EXPIRED"});
  }

  const current=await mcpAuthorizedTenantGrants(env,flow.userToken);
  const allowed=new Map(current.map(tenant=>[String(tenant.id),tenant]));
  const choices=(Array.isArray(flow.tenantChoices)?flow.tenantChoices:[])
    .filter(choice=>allowed.has(String(choice.id)));

  if(!choices.length) return json(request,env,403,{error:"MCP_NO_AUTHORIZED_TENANT"});

  const options=choices.map(choice=>
    '<option value="'+mcpOAuthEscapeHtml(choice.id)+'">'+
    mcpOAuthEscapeHtml(choice.name)+
    '</option>'
  ).join("");

  const html='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">'+
    '<meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<title>BI Vella · Selecionar entidade</title>'+
    '<style>body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;display:grid;place-items:center;min-height:100vh;margin:0}'+
    '.card{width:min(520px,calc(100% - 32px));background:#111827;border:1px solid #334155;border-radius:16px;padding:24px;box-sizing:border-box}'+
    'h1{font-size:20px;margin:0 0 8px}p{color:#94a3b8;line-height:1.5}label{display:block;margin:20px 0 8px;font-weight:600}'+
    'select,button{width:100%;box-sizing:border-box;border-radius:10px;padding:12px;font-size:15px}select{background:#0f172a;color:#e2e8f0;border:1px solid #475569}'+
    'button{margin-top:14px;border:0;background:#2563eb;color:white;font-weight:700;cursor:pointer}</style></head><body>'+
    '<main class="card"><h1>BI Vella</h1><p>Selecione a entidade que o ChatGPT poderá consultar nesta conexão.</p>'+
    '<form method="post" action="/oauth/tenant-select"><input type="hidden" name="flow" value="'+mcpOAuthEscapeHtml(flowId)+'">'+
    '<label for="tenant">Entidade</label><select id="tenant" name="tenant_id" required>'+options+'</select>'+
    '<button type="submit">Continuar</button></form></main></body></html>';

  return new Response(html,{
    status:200,
    headers:{
      "Content-Type":"text/html; charset=utf-8",
      "Cache-Control":"no-store",
      "Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      "X-Frame-Options":"DENY"
    }
  });
}

async function mcpOAuthTenantSelectSubmit(request,env) {
  const contentType=String(request.headers.get("Content-Type")||"").toLowerCase();
  if(!contentType.includes("application/x-www-form-urlencoded")) {
    return json(request,env,400,{error:"invalid_request"});
  }

  const form=new URLSearchParams(await request.text());
  const flowId=String(form.get("flow")||"");
  const tenantId=String(form.get("tenant_id")||"");
  if(!flowId || !tenantId) return json(request,env,400,{error:"invalid_request"});

  const store=mcpOAuthStore(env);
  const raw=await store.get(MCP_OAUTH_FLOW_PREFIX+flowId);
  let flow=null;
  try { flow=raw?JSON.parse(raw):null; } catch {}
  if(!flow || flow.kind!=="mcp-oauth-flow" || !flow.userToken) {
    return json(request,env,400,{error:"MCP_OAUTH_FLOW_EXPIRED"});
  }

  const tenants=await mcpAuthorizedTenantGrants(env,flow.userToken);
  const selected=tenants.find(tenant=>String(tenant.id)===tenantId);
  if(!selected) return json(request,env,403,{error:"MCP_TENANT_ACCESS_DENIED"});

  flow.tenantId=tenantId;
  delete flow.tenantChoices;
  const code=await mcpOAuthIssueAuthorizationCode(env,flow,flow.userToken);
  await store.delete(MCP_OAUTH_FLOW_PREFIX+flowId);
  return Response.redirect(mcpOAuthClientRedirect(flow,{code}),302);
}

async function mcpOAuthPkceMatches(verifier,challenge) {
  const value=String(verifier||"");
  if(value.length<43 || value.length>128) return false;
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(digest))===String(challenge||"");
}

async function mcpOAuthToken(request,env) {
  const contentType=String(request.headers.get("Content-Type")||"").toLowerCase();
  if(!contentType.includes("application/x-www-form-urlencoded")) {
    return json(request,env,400,{error:"invalid_request",error_description:"Form encoded token request required."});
  }

  const form=new URLSearchParams(await request.text());
  if(String(form.get("grant_type")||"")!=="authorization_code") {
    return json(request,env,400,{error:"unsupported_grant_type"});
  }

  const clientId=String(form.get("client_id")||"");
  const code=String(form.get("code")||"");
  const redirectUri=String(form.get("redirect_uri")||"");
  const verifier=String(form.get("code_verifier")||"");
  const resource=String(form.get("resource")||"");
  if(!clientId || !code || !redirectUri || !verifier || !resource) {
    return json(request,env,400,{error:"invalid_request"});
  }

  const client=await mcpOAuthReadClient(env,clientId);
  if(!client) return json(request,env,401,{error:"invalid_client"});
  if(!client.redirectUris.includes(redirectUri)) {
    return json(request,env,400,{error:"invalid_grant"});
  }

  const codeHash=await sha256Hex(code);
  const store=mcpOAuthStore(env);
  const raw=await store.get(MCP_OAUTH_CODE_PREFIX+codeHash);
  if(!raw) return json(request,env,400,{error:"invalid_grant"});

  let grant=null;
  try { grant=JSON.parse(raw); } catch {}
  await store.delete(MCP_OAUTH_CODE_PREFIX+codeHash);

  if(!grant || grant.kind!=="mcp-oauth-code" || !grant.userToken || Date.now()>=Number(grant.exp||0)) {
    return json(request,env,400,{error:"invalid_grant"});
  }
  if(grant.clientId!==clientId || grant.redirectUri!==redirectUri || grant.resource!==resource) {
    return json(request,env,400,{error:"invalid_grant"});
  }
  if(!(await mcpOAuthPkceMatches(verifier,grant.codeChallenge))) {
    return json(request,env,400,{error:"invalid_grant"});
  }

  const accessToken="mcpat_"+createSessionId();
  const accessHash=await sha256Hex(accessToken);
  const ttl=60*60;
  await store.put(
    MCP_OAUTH_ACCESS_PREFIX+accessHash,
    JSON.stringify({
      kind:"mcp-oauth-access",
      clientId,
      resource,
      scope:grant.scope||MCP_OAUTH_SCOPE,
      tenantId:String(grant.tenantId||""),
      userToken:grant.userToken,
      createdAt:new Date().toISOString(),
      exp:Date.now()+ttl*1000
    }),
    {expirationTtl:ttl}
  );

  return json(request,env,200,{
    access_token:accessToken,
    token_type:"Bearer",
    expires_in:ttl,
    scope:grant.scope||MCP_OAUTH_SCOPE,
    resource
  });
}

function mcpPermissionIdForView(view) {
  const needle="/api/dashboard/"+String(view||"");
  const constraints=(BI_PAGE_MAPPING[0]&&BI_PAGE_MAPPING[0].constraints)||[];
  const found=constraints.find(item=>
    Array.isArray(item.resources) &&
    item.resources.some(resource=>
      String(resource.urlPattern||"")===needle ||
      String(resource.urlPattern||"").startsWith(needle+"/")
    )
  );
  return found ? String(found.id||"") : "";
}

async function mcpAuthorizedTenantGrants(env,userToken) {
  const registry=await tenantRegistry(env);
  const internalRequest=new Request("https://internal.bi-vella.invalid/",{
    headers:{"Authorization":"Bearer "+userToken}
  });
  const tenants=[];

  for(const id of Object.keys(registry)) {
    try {
      const tenant=await resolveTenant(env,id);
      const auth=await authorizeTenant(internalRequest,env,tenant);
      const allowedViews=permissionViewsForAccess(auth.access).filter(view=>Boolean(dashboardBuilder(view)));
      const permissions=[...new Set(allowedViews.map(mcpPermissionIdForView).filter(Boolean))];
      tenants.push({
        id:tenant.id,
        name:tenant.name,
        entityId:auth.context.entity,
        databaseId:auth.context.database,
        permissions
      });
    } catch(error) {
      const code=error&&error.message?error.message:"";
      if([
        "TENANT_ACCESS_DENIED","TENANT_ACCESS_EXPIRED","BI_USER_NOT_AUTHORIZED",
        "PAGE_PERMISSION_DENIED","TENANT_CONTEXT_UNRESOLVED"
      ].includes(code)) continue;
      console.warn("mcp tenant introspection",id,code);
    }
  }

  tenants.sort((a,b)=>String(a.name||a.id).localeCompare(String(b.name||b.id),"pt-BR"));
  return tenants;
}

async function mcpOAuthIntrospect(request,env) {
  const header=String(request.headers.get("Authorization")||"");
  const match=header.match(/^Bearer\s+(mcpat_[A-Za-z0-9_-]+)$/i);
  if(!match) {
    return json(request,env,401,{active:false,error:"invalid_token"});
  }

  const body=await request.json().catch(()=>({}));
  const expectedAudience=String(body.audience||"");
  const requestedResource=String(body.resource||"");
  if(expectedAudience && expectedAudience!=="bi-vella-mcp") {
    return json(request,env,401,{active:false,error:"invalid_token"});
  }

  const hash=await sha256Hex(match[1]);
  const raw=await mcpOAuthStore(env).get(MCP_OAUTH_ACCESS_PREFIX+hash);
  if(!raw) return json(request,env,401,{active:false,error:"invalid_token"});

  let token=null;
  try { token=JSON.parse(raw); } catch {}
  if(!token || token.kind!=="mcp-oauth-access" || !token.userToken || Date.now()>=Number(token.exp||0)) {
    return json(request,env,401,{active:false,error:"invalid_token"});
  }
  if(requestedResource && token.resource!==requestedResource) {
    return json(request,env,401,{active:false,error:"invalid_token"});
  }

  const userId=await currentOAuthUserId(token.userToken);
  const authorizedTenants=await mcpAuthorizedTenantGrants(env,token.userToken);
  const tenants=authorizedTenants.filter(tenant=>String(tenant.id)===String(token.tenantId||""));
  if(!tenants.length) {
    return json(request,env,403,{active:false,error:"MCP_TENANT_ACCESS_DENIED"});
  }

  const remaining=Math.max(60,Math.min(15*60,Math.floor((Number(token.exp)-Date.now())/1000)));
  const biSession=await sealSession({
    kind:"user-session",
    accessToken:token.userToken,
    exp:Date.now()+remaining*1000
  },env.BETHA_LOGIN_CLIENT_SECRET);

  return json(request,env,200,{
    active:true,
    subject:String(userId||""),
    clientId:String(token.clientId||""),
    scopes:String(token.scope||MCP_OAUTH_SCOPE).split(/\s+/).filter(Boolean),
    permissions:[],
    tenants,
    biSession,
    expiresAt:Number(token.exp)
  });
}


function auditActorLabel(access) {
  const candidates=[
    access&&access.userName,
    access&&access.name,
    access&&access.nome,
    access&&access.user,
    access&&access.login,
    access&&access.idUsuario
  ];
  for(const value of candidates){
    if(value!==undefined&&value!==null&&String(value).trim()) return String(value).trim().slice(0,120);
  }
  return "authenticated-user";
}

function safeAuditMeta(meta) {
  const out={};
  const blocked=/token|secret|authorization|password|document|cpf|cnpj|userToken|query|filter/i;
  for(const [key,value] of Object.entries(meta||{})){
    if(blocked.test(key)) continue;
    if(["string","number","boolean"].includes(typeof value)){
      out[key]=typeof value==="string" ? value.slice(0,180) : value;
    }
  }
  return out;
}

let auditStoreReadyPromise=null;

async function ensureAuditStore(env) {
  if(!env.AUTH_DB) return false;
  if(!auditStoreReadyPromise){
    auditStoreReadyPromise=(async()=>{
      await env.AUTH_DB.prepare(
        "CREATE TABLE IF NOT EXISTS bi_audit_events ("+
        "tenant_id TEXT NOT NULL,"+
        "event_id TEXT NOT NULL,"+
        "ts TEXT NOT NULL,"+
        "actor TEXT NOT NULL,"+
        "category TEXT NOT NULL,"+
        "action TEXT NOT NULL,"+
        "status TEXT NOT NULL,"+
        "subject TEXT NOT NULL,"+
        "meta_json TEXT NOT NULL DEFAULT '{}',"+
        "created_at TEXT NOT NULL,"+
        "PRIMARY KEY (tenant_id,event_id))"
      ).run();
      await env.AUTH_DB.prepare(
        "CREATE INDEX IF NOT EXISTS idx_bi_audit_events_tenant_ts ON bi_audit_events(tenant_id,ts DESC)"
      ).run();
      return true;
    })().catch(error=>{
      auditStoreReadyPromise=null;
      console.error("audit store init",error&&error.message?error.message:String(error));
      return false;
    });
  }
  return auditStoreReadyPromise;
}

async function pruneAuditStore(env,tenantId) {
  if(!env.AUTH_DB || !tenantId) return;
  try{
    const cutoff=new Date(Date.now()-30*24*60*60*1000).toISOString();
    await env.AUTH_DB.prepare(
      "DELETE FROM bi_audit_events WHERE tenant_id=?1 AND ts<?2"
    ).bind(String(tenantId),cutoff).run();
  }catch(error){
    console.warn("audit store prune",error&&error.message?error.message:String(error));
  }
}

async function writeAuditEvent(env,{tenantId="",actor="",category="system",action="",status="ok",subject="",meta={}}={}) {
  if(!tenantId || !action) return;
  const ts=Date.now();
  const eventId=createSessionId();
  const event={
    eventId,
    ts:new Date(ts).toISOString(),
    tenantId:String(tenantId),
    actor:String(actor||"authenticated-user").slice(0,120),
    category:String(category||"system").slice(0,60),
    action:String(action||"").slice(0,120),
    status:String(status||"ok").slice(0,30),
    subject:String(subject||"").slice(0,160),
    meta:safeAuditMeta(meta)
  };

  let d1Stored=false;
  if(env.AUTH_DB && await ensureAuditStore(env)){
    try{
      await env.AUTH_DB.prepare(
        "INSERT OR REPLACE INTO bi_audit_events "+
        "(tenant_id,event_id,ts,actor,category,action,status,subject,meta_json,created_at) "+
        "VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)"
      ).bind(
        event.tenantId,event.eventId,event.ts,event.actor,event.category,event.action,
        event.status,event.subject,JSON.stringify(event.meta||{}),event.ts
      ).run();
      d1Stored=true;
      if((ts%17)===0) await pruneAuditStore(env,event.tenantId);
    }catch(error){
      console.error("audit d1 write",error&&error.message?error.message:String(error));
    }
  }

  if(env.BI_SESSIONS){
    try{
      const key="audit:"+event.tenantId+":"+String(ts).padStart(13,"0")+":"+eventId.slice(0,8);
      await env.BI_SESSIONS.put(key,JSON.stringify(event),{expirationTtl:30*24*60*60});
    }catch(error){
      if(!d1Stored) console.error("audit kv write",error&&error.message?error.message:String(error));
    }
  }
}

async function writeSecurityDenial(env,tenant,auth,{surface="",subject="",code="",view="",source="",resource="",part=""}={}) {
  if(!tenant || !auth) return;
  await writeAuditEvent(env,{
    tenantId:tenant.id,
    actor:auditActorLabel(auth.access),
    category:"security",
    action:"access.denied",
    status:"blocked",
    subject:String(subject||surface||"acesso").slice(0,160),
    meta:{surface,code,view,source,resource,part}
  });
}

function normalizeAuditRow(row) {
  if(!row) return null;
  let meta={};
  try { meta=JSON.parse(String(row.meta_json||"{}")); } catch {}
  return {
    eventId:String(row.event_id||""),
    ts:String(row.ts||""),
    tenantId:String(row.tenant_id||""),
    actor:String(row.actor||""),
    category:String(row.category||""),
    action:String(row.action||""),
    status:String(row.status||""),
    subject:String(row.subject||""),
    meta
  };
}

function auditEventDedupeKey(event) {
  return String(event&&event.eventId||"") ||
    [event&&event.ts,event&&event.tenantId,event&&event.actor,event&&event.category,event&&event.action,event&&event.subject]
      .map(value=>String(value||"")).join("|");
}

async function listAuditEvents(env,tenantId,limit=100) {
  const safeLimit=Math.max(10,Math.min(Number(limit)||100,1000));
  const events=[];
  const seen=new Set();
  let d1Count=0;
  let d1Ready=false;

  if(env.AUTH_DB && await ensureAuditStore(env)){
    d1Ready=true;
    try{
      const [rows,countRow]=await Promise.all([
        env.AUTH_DB.prepare(
          "SELECT tenant_id,event_id,ts,actor,category,action,status,subject,meta_json "+
          "FROM bi_audit_events WHERE tenant_id=?1 ORDER BY ts DESC LIMIT ?2"
        ).bind(String(tenantId),safeLimit).all(),
        env.AUTH_DB.prepare(
          "SELECT COUNT(*) AS total FROM bi_audit_events WHERE tenant_id=?1"
        ).bind(String(tenantId)).first()
      ]);
      d1Count=Number(countRow&&countRow.total||0);
      for(const row of (rows.results||[])){
        const event=normalizeAuditRow(row);
        if(!event) continue;
        const key=auditEventDedupeKey(event);
        if(seen.has(key)) continue;
        seen.add(key);
        events.push(event);
      }
    }catch(error){
      d1Ready=false;
      console.error("audit d1 read",error&&error.message?error.message:String(error));
    }
  }

  let kvIndexed=0;
  let kvTruncated=false;
  if(env.BI_SESSIONS && events.length<safeLimit){
    const prefix="audit:"+String(tenantId)+":";
    const keyNames=[];
    let cursor="";
    let listComplete=false;
    let pages=0;

    while(!listComplete && pages<10){
      const options={prefix,limit:1000};
      if(cursor) options.cursor=cursor;
      const listed=await env.BI_SESSIONS.list(options);
      for(const item of (listed.keys||[])){
        if(item&&item.name) keyNames.push(item.name);
      }
      listComplete=Boolean(listed.list_complete);
      cursor=listed.cursor||"";
      pages++;
      if(listComplete || !cursor) break;
    }

    keyNames.sort().reverse();
    kvIndexed=keyNames.length;
    kvTruncated=!listComplete;
    const values=await Promise.all(
      keyNames.slice(0,Math.max(safeLimit*2,100)).map(key=>env.BI_SESSIONS.get(key))
    );
    for(const raw of values){
      let event=null;
      try { event=JSON.parse(raw||"null"); } catch {}
      if(!event) continue;
      const key=auditEventDedupeKey(event);
      if(seen.has(key)) continue;
      seen.add(key);
      events.push(event);
      if(events.length>=safeLimit) break;
    }
  }

  events.sort((a,b)=>String(b.ts||"").localeCompare(String(a.ts||"")));
  if(events.length>safeLimit) events.length=safeLimit;

  return {
    events,
    loaded:events.length,
    totalIndexed:d1Ready?Math.max(d1Count,events.length):kvIndexed,
    indexTruncated:d1Ready?false:kvTruncated,
    hasMore:d1Ready?d1Count>safeLimit:(kvIndexed>safeLimit||kvTruncated),
    limit:safeLimit,
    maxLimit:1000,
    retentionDays:30,
    storage:d1Ready?"d1-primary+kv-mirror":"kv-fallback"
  };
}

function analyzeAuditSecurity(events,{now=Date.now(),windowMinutes=10,warningThreshold=5,criticalThreshold=10}={}) {
  const windowMs=Math.max(1,Number(windowMinutes)||10)*60*1000;
  const cutoff=Number(now)-windowMs;
  const previousCutoff=cutoff-windowMs;
  const counters=new Map();
  const surfaceCounts=new Map();
  const targetCounts=new Map();
  let currentBlocked=0;
  let previousBlocked=0;
  let latestBlockedAt="";

  for(const event of (Array.isArray(events)?events:[])){
    if(event?.category!=="security" || event?.status!=="blocked") continue;
    const ts=Date.parse(event.ts||"");
    if(!Number.isFinite(ts) || ts>Number(now)+60*1000) continue;

    if(ts>=cutoff){
      currentBlocked++;
      if(!latestBlockedAt || ts>Date.parse(latestBlockedAt)) latestBlockedAt=new Date(ts).toISOString();

      const meta=event.meta&&typeof event.meta==="object" ? event.meta : {};
      const surface=String(meta.surface||"").trim();
      if(surface) surfaceCounts.set(surface,(surfaceCounts.get(surface)||0)+1);

      const target=String(meta.view||meta.resource||event.subject||"").trim();
      if(target) targetCounts.set(target,(targetCounts.get(target)||0)+1);

      const actor=String(event.actor||"").trim();
      if(actor && actor!=="authenticated-user"){
        counters.set(actor,(counters.get(actor)||0)+1);
      }
    }else if(ts>=previousCutoff){
      previousBlocked++;
    }
  }

  const flags=new Map();
  let maxCount=0;
  for(const [actor,count] of counters.entries()){
    if(count<warningThreshold) continue;
    const level=count>=criticalThreshold ? "high" : "attention";
    flags.set(actor,{level,count});
    if(count>maxCount) maxCount=count;
  }

  const enriched=(Array.isArray(events)?events:[]).map(event=>{
    if(event?.category!=="security" || event?.status!=="blocked") return event;
    const actor=String(event.actor||"").trim();
    const flag=flags.get(actor);
    if(!flag) return event;
    const ts=Date.parse(event.ts||"");
    if(!Number.isFinite(ts) || ts<cutoff) return event;
    return {
      ...event,
      securitySignal:{
        level:flag.level,
        count:flag.count,
        windowMinutes:Number(windowMinutes)||10
      }
    };
  });

  const topEntry=map=>{
    let bestName="";
    let bestCount=0;
    for(const [name,count] of map.entries()){
      if(count>bestCount || (count===bestCount && bestName && String(name).localeCompare(String(bestName),"pt-BR")<0)){
        bestName=name;
        bestCount=count;
      }
    }
    return {name:bestName,count:bestCount};
  };

  const topSurface=topEntry(surfaceCounts);
  const topTarget=topEntry(targetCounts);
  const trendDelta=currentBlocked-previousBlocked;
  const trend=trendDelta>0 ? "up" : (trendDelta<0 ? "down" : "stable");
  const level=maxCount>=criticalThreshold ? "high" : (flags.size ? "attention" : "normal");

  return {
    events:enriched,
    security:{
      level,
      recentBlocked:[...counters.values()].reduce((sum,count)=>sum+count,0),
      flaggedActors:flags.size,
      maxBlockedByActor:maxCount,
      windowMinutes:Number(windowMinutes)||10,
      warningThreshold,
      criticalThreshold,
      automaticBlocking:false,
      summary:{
        currentBlocked,
        previousBlocked,
        trend,
        trendDelta,
        topSurface:topSurface.name,
        topSurfaceCount:topSurface.count,
        topTarget:topTarget.name,
        topTargetCount:topTarget.count,
        latestBlockedAt
      }
    }
  };
}

async function mcpOwnerHash(auth) {
  return sha256Hex(auth&&auth.userToken ? auth.userToken : "");
}

async function listMcpCredentials(env,tenantId,{ownerHash="",includeAll=false,limit=100}={}) {
  if(!env.BI_SESSIONS) throw new Error("SESSION_STORE_NOT_CONFIGURED");
  const safeLimit=Math.max(10,Math.min(Number(limit)||100,250));
  const listed=await env.BI_SESSIONS.list({prefix:"mcp-token:",limit:500});
  const items=[];
  for(const key of (listed.keys||[])){
    if(items.length>=safeLimit) break;
    const raw=await env.BI_SESSIONS.get(key.name);
    if(!raw) continue;
    let payload=null;
    try{payload=JSON.parse(raw);}catch{}
    if(!payload || payload.kind!=="mcp-token" || String(payload.tenantId)!==String(tenantId)) continue;
    if(!includeAll && ownerHash && payload.ownerHash && payload.ownerHash!==ownerHash) continue;
    if(!includeAll && ownerHash && !payload.ownerHash) continue;
    const exp=Number(payload.exp||0);
    items.push({
      tokenId:key.name.slice("mcp-token:".length,"mcp-token:".length+16),
      label:String(payload.label||""),
      tenantId:String(payload.tenantId||""),
      tenantName:String(payload.tenantName||""),
      createdAt:String(payload.createdAt||""),
      expiresAt:exp?new Date(exp).toISOString():"",
      expired:Boolean(exp&&Date.now()>=exp),
      allowedViews:Array.isArray(payload.allowedViews)?payload.allowedViews:[],
      admin:Boolean(payload.admin),
      technical:Boolean(payload.technical),
      owner:String(payload.ownerLabel||"")
    });
  }
  return items.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function revokeMcpCredential(env,tenantId,tokenId,{ownerHash="",includeAll=false}={}) {
  if(!env.BI_SESSIONS) throw new Error("SESSION_STORE_NOT_CONFIGURED");
  const prefix="mcp-token:"+String(tokenId||"").trim();
  if(prefix==="mcp-token:") throw new Error("MCP_TOKEN_INVALID");
  const listed=await env.BI_SESSIONS.list({prefix,limit:20});
  for(const key of (listed.keys||[])){
    const raw=await env.BI_SESSIONS.get(key.name);
    if(!raw) continue;
    let payload=null;
    try{payload=JSON.parse(raw);}catch{}
    if(!payload || String(payload.tenantId)!==String(tenantId)) continue;
    if(!includeAll){
      if(!ownerHash || !payload.ownerHash || payload.ownerHash!==ownerHash) continue;
    }
    await env.BI_SESSIONS.delete(key.name);
    return {ok:true,tokenId:key.name.slice("mcp-token:".length,"mcp-token:".length+16),label:String(payload.label||"")};
  }
  throw new Error("MCP_TOKEN_INVALID");
}

async function createMcpCredential(env,auth,tenant,{label="",ttlSeconds=8*60*60}={}) {
  if (!env.BI_SESSIONS) throw new Error("SESSION_STORE_NOT_CONFIGURED");

  const ttl=Math.max(15*60,Math.min(Number(ttlSeconds)||8*60*60,8*60*60));
  const rawToken="bimcp_"+createSessionId();
  const hash=await sha256Hex(rawToken);
  const exp=Date.now()+ttl*1000;
  const allowedViews=permissionViewsForAccess(auth.access).filter(view=>Boolean(dashboardBuilder(view)));
  const ownerHash=await mcpOwnerHash(auth);
  const ownerLabel=auditActorLabel(auth.access);

  await env.BI_SESSIONS.put(
    "mcp-token:"+hash,
    JSON.stringify({
      kind:"mcp-token",
      tenantId:tenant.id,
      tenantName:tenant.name,
      userToken:auth.userToken,
      ownerHash,
      ownerLabel,
      allowedViews,
      admin:Boolean(auth.access&&auth.access.admin),
      technical:Boolean(auth.access&&auth.access.technical),
      label:String(label||"").slice(0,80),
      createdAt:new Date().toISOString(),
      exp
    }),
    {expirationTtl:ttl}
  );

  return {
    token:rawToken,
    tokenId:hash.slice(0,16),
    tenant:{id:tenant.id,name:tenant.name},
    allowedViews,
    expiresAt:new Date(exp).toISOString(),
    expiresIn:ttl
  };
}

async function readMcpCredential(request,env) {
  if (!env.BI_SESSIONS) throw new Error("SESSION_STORE_NOT_CONFIGURED");

  const header=String(request.headers.get("Authorization")||"");
  const match=header.match(/^Bearer\s+(bimcp_[A-Za-z0-9_-]+)$/i);
  if (!match) throw new Error("MCP_TOKEN_REQUIRED");

  const rawToken=match[1];
  const hash=await sha256Hex(rawToken);
  const raw=await env.BI_SESSIONS.get("mcp-token:"+hash);
  if (!raw) throw new Error("MCP_TOKEN_INVALID");

  let payload=null;
  try { payload=JSON.parse(raw); } catch {}
  if (!payload || payload.kind!=="mcp-token" || !payload.tenantId || !payload.userToken) {
    await env.BI_SESSIONS.delete("mcp-token:"+hash);
    throw new Error("MCP_TOKEN_INVALID");
  }

  if (!payload.exp || Date.now()>=Number(payload.exp)) {
    await env.BI_SESSIONS.delete("mcp-token:"+hash);
    throw new Error("MCP_TOKEN_EXPIRED");
  }

  // Revalida o vínculo do usuário na Betha em toda chamada MCP.
  const tenant=await resolveTenant(env,String(payload.tenantId));
  const [accesses,context]=await Promise.all([
    getUserAccesses(payload.userToken),
    getTenantContext(payload.userToken,tenant)
  ]);
  const access=matchAccess(accesses,context);
  if (!access) throw new Error("TENANT_ACCESS_DENIED");
  if (access.expiresIn && new Date(access.expiresIn).getTime()<Date.now()) {
    throw new Error("TENANT_ACCESS_EXPIRED");
  }

  const currentViews=permissionViewsForAccess(access);
  const storedViews=Array.isArray(payload.allowedViews)?payload.allowedViews:[];
  const allowedViews=storedViews.filter(view=>currentViews.includes(view));

  return {
    tokenId:hash.slice(0,16),
    tenant,
    context,
    access,
    userToken:payload.userToken,
    allowedViews,
    exp:Number(payload.exp),
    label:String(payload.label||"")
  };
}


async function readMcpOAuthCredential(request,env) {
  const header=String(request.headers.get("Authorization")||"");
  const match=header.match(/^Bearer\s+(mcpat_[A-Za-z0-9_-]+)$/i);
  if(!match) throw new Error("MCP_TOKEN_REQUIRED");

  const rawToken=match[1];
  const hash=await sha256Hex(rawToken);
  const raw=await mcpOAuthStore(env).get(MCP_OAUTH_ACCESS_PREFIX+hash);
  if(!raw) throw new Error("MCP_TOKEN_INVALID");

  let token=null;
  try { token=JSON.parse(raw); } catch {}
  if(!token || token.kind!=="mcp-oauth-access" || !token.userToken || !token.tenantId) {
    throw new Error("MCP_TOKEN_INVALID");
  }
  if(!token.exp || Date.now()>=Number(token.exp)) throw new Error("MCP_TOKEN_EXPIRED");

  const resource=new URL(request.url);
  resource.search="";
  resource.hash="";
  if(String(token.resource||"")!==resource.toString()) throw new Error("MCP_TOKEN_RESOURCE_MISMATCH");

  const scopes=String(token.scope||"").split(/\s+/).filter(Boolean);
  if(!scopes.includes(MCP_OAUTH_SCOPE)) throw new Error("MCP_SCOPE_REQUIRED");

  const tenant=await resolveTenant(env,String(token.tenantId));
  const internalRequest=new Request("https://internal.bi-vella.invalid/",{
    headers:{"Authorization":"Bearer "+token.userToken}
  });
  const auth=await authorizeTenant(internalRequest,env,tenant);
  const allowedViews=permissionViewsForAccess(auth.access).filter(view=>Boolean(dashboardBuilder(view)));

  return {
    authKind:"oauth2",
    tokenId:hash.slice(0,16),
    tenant,
    context:auth.context,
    access:auth.access,
    userToken:token.userToken,
    allowedViews,
    exp:Number(token.exp),
    label:"OAuth "+String(token.clientId||"client").slice(0,60)
  };
}

async function readAnyMcpCredential(request,env) {
  const header=String(request.headers.get("Authorization")||"");
  if(/^Bearer\s+mcpat_/i.test(header)) return readMcpOAuthCredential(request,env);
  const legacy=await readMcpCredential(request,env);
  return {...legacy,authKind:"legacy"};
}

function mcpToolSecurity(tool) {
  return {
    ...tool,
    securitySchemes:[{type:"oauth2",scopes:[MCP_OAUTH_SCOPE]}],
    annotations:{
      readOnlyHint:true,
      destructiveHint:false,
      openWorldHint:false
    }
  };
}

function mcpToolDefinitions(credential) {
  const tools=[
    {
      name:"bi_context",
      description:"Retorna a prefeitura vinculada à credencial MCP e os painéis que o usuário pode consultar.",
      inputSchema:{type:"object",properties:{},additionalProperties:false}
    },
    {
      name:"bi_list_dashboards",
      description:"Lista os painéis do BI autorizados para este usuário e prefeitura.",
      inputSchema:{type:"object",properties:{},additionalProperties:false}
    },
    {
      name:"bi_get_dashboard",
      description:"Consulta KPIs e gráficos agregados de um painel autorizado do BI para período, exercício e filtros informados.",
      inputSchema:{
        type:"object",
        required:["view"],
        properties:{
          view:{type:"string",enum:credential.allowedViews},
          periodo:{type:"string",description:"Período do painel, por exemplo ano, mes, trimestre ou todos."},
          exercicio:{type:"integer",minimum:2000,maximum:2100},
          filters:{
            type:"object",
            additionalProperties:{type:["string","number","boolean"]}
          }
        },
        additionalProperties:false
      }
    },
    {
      name:"bi_get_kpis",
      description:"Retorna somente os indicadores principais (KPIs) de um painel autorizado, reduzindo o volume da resposta.",
      inputSchema:{
        type:"object",
        required:["view"],
        properties:{
          view:{type:"string",enum:credential.allowedViews},
          periodo:{type:"string"},
          exercicio:{type:"integer",minimum:2000,maximum:2100},
          filters:{
            type:"object",
            additionalProperties:{type:["string","number","boolean"]}
          }
        },
        additionalProperties:false
      }
    }
  ];

  if (credential.allowedViews.includes("arrecadacao")) {
    tools.push({
      name:"bi_revenue_summary",
      description:"Retorna um resumo executivo da arrecadação: total, tributo, correção, juros, multa, descontos e evolução mensal.",
      inputSchema:{
        type:"object",
        properties:{
          periodo:{type:"string",description:"Período, por exemplo ano, mes, trimestre ou todos."},
          exercicio:{type:"integer",minimum:2000,maximum:2100},
          filters:{
            type:"object",
            additionalProperties:{type:["string","number","boolean"]}
          }
        },
        additionalProperties:false
      }
    });
  }

  if (
    credential.allowedViews.includes("economicos") &&
    credential.allowedViews.includes("arrecadacao")
  ) {
    tools.push({
      name:"bi_company_iss",
      description:"Consulta quanto uma empresa ou econômico arrecadou de ISS no período, pesquisando pelo nome ou nome fantasia.",
      inputSchema:{
        type:"object",
        required:["empresa"],
        properties:{
          empresa:{type:"string",minLength:2,maxLength:120},
          periodo:{type:"string",description:"Período, por exemplo ano, mes, trimestre ou todos."},
          exercicio:{type:"integer",minimum:2000,maximum:2100}
        },
        additionalProperties:false
      }
    });
  }

  if (
    credential.allowedViews.includes("contribuintes") &&
    credential.allowedViews.includes("imobiliario")
  ) {
    tools.push({
      name:"bi_person_properties",
      description:"Localiza um contribuinte por nome ou documento e retorna quantos imóveis estão vinculados a ele, sem expor endereços ou documentos completos.",
      inputSchema:{
        type:"object",
        required:["busca"],
        properties:{
          busca:{type:"string",minLength:2,maxLength:120},
          limite:{type:"integer",minimum:1,maximum:10}
        },
        additionalProperties:false
      }
    });
  }

  if (credential.allowedViews.includes("arrecadacao")) {
    tools.push({
      name:"bi_revenue_breakdown",
      description:"Analisa a arrecadação agrupada por receita, crédito tributário, tipo de pagamento, tipo de baixa ou classificação da guia, com totais e participação percentual.",
      inputSchema:{
        type:"object",
        required:["dimensao"],
        properties:{
          dimensao:{type:"string",enum:["receita","credito","tipo_pagamento","tipo_baixa","classificacao_guia"]},
          periodo:{type:"string",description:"Período, por exemplo ano, mes, trimestre ou todos."},
          exercicio:{type:"integer",minimum:2000,maximum:2100},
          limite:{type:"integer",minimum:1,maximum:20},
          filters:{type:"object",additionalProperties:{type:["string","number","boolean"]}}
        },
        additionalProperties:false
      }
    });
  }

  if (credential.allowedViews.includes("debitos")) {
    tools.push({
      name:"bi_debt_portfolio",
      description:"Resume a carteira de débitos lançados, permitindo consultar abertos, vencidos ou pagos e detalhar aging, crédito, origem e receita sem expor dados pessoais.",
      inputSchema:{
        type:"object",
        properties:{
          carteira:{type:"string",enum:["aberto","vencido","pago"],default:"aberto"},
          periodo:{type:"string",description:"Período, por exemplo ano, mes, trimestre ou todos."},
          exercicio:{type:"integer",minimum:2000,maximum:2100},
          limite:{type:"integer",minimum:1,maximum:20},
          filters:{type:"object",additionalProperties:{type:["string","number","boolean"]}}
        },
        additionalProperties:false
      }
    });
  }

  if (credential.allowedViews.includes("divida")) {
    tools.push({
      name:"bi_active_debt_summary",
      description:"Resume o estoque da dívida ativa, composição do saldo, situação, aging, crédito tributário, cobrança e recuperação no período, sem retornar ranking nominal de devedores.",
      inputSchema:{
        type:"object",
        properties:{
          periodo:{type:"string",description:"Período, por exemplo ano, mes, trimestre ou todos."},
          exercicio:{type:"integer",minimum:2000,maximum:2100},
          limite:{type:"integer",minimum:1,maximum:20},
          filters:{type:"object",additionalProperties:{type:["string","number","boolean"]}}
        },
        additionalProperties:false
      }
    });
  }

  if (credential.allowedViews.includes("parcelamentos")) {
    tools.push({
      name:"bi_installments_summary",
      description:"Resume parcelamentos, quantidade de parcelas, parcelas vencidas, entradas, situações e recebimentos no período.",
      inputSchema:{
        type:"object",
        properties:{
          periodo:{type:"string",description:"Período, por exemplo ano, mes, trimestre ou todos."},
          exercicio:{type:"integer",minimum:2000,maximum:2100},
          limite:{type:"integer",minimum:1,maximum:20},
          filters:{type:"object",additionalProperties:{type:["string","number","boolean"]}}
        },
        additionalProperties:false
      }
    });
  }

  if (
    credential.allowedViews.includes("contribuintes") ||
    credential.allowedViews.includes("economicos")
  ) {
    tools.push({
      name:"bi_resolve_subject",
      description:"Resolve nome ou documento em candidatos seguros de contribuinte/econômico antes de uma consulta específica. Retorna IDs estáveis e documento mascarado para desambiguação.",
      inputSchema:{
        type:"object",
        required:["busca"],
        properties:{
          busca:{type:"string",minLength:2,maxLength:120},
          tipo:{type:"string",enum:["ambos","contribuinte","economico"],default:"ambos"},
          limite:{type:"integer",minimum:1,maximum:10}
        },
        additionalProperties:false
      }
    });
  }

  if (
    credential.allowedViews.includes("economicos") &&
    credential.allowedViews.includes("arrecadacao")
  ) {
    tools.push({
      name:"bi_company_iss_detail",
      description:"Consulta ISS pago por um econômico específico, com resolução de ambiguidades, total, evolução mensal e composição por crédito/receita quando disponível.",
      inputSchema:{
        type:"object",
        required:["busca"],
        properties:{
          busca:{type:"string",minLength:2,maxLength:120},
          economico_id:{type:"string",minLength:1,maxLength:80},
          periodo:{type:"string",description:"Período, por exemplo ano, mes, trimestre ou todos."},
          exercicio:{type:"integer",minimum:2000,maximum:2100},
          limite:{type:"integer",minimum:1,maximum:12}
        },
        additionalProperties:false
      }
    });
  }

  if (
    credential.allowedViews.includes("contribuintes") &&
    credential.allowedViews.includes("debitos") &&
    credential.allowedViews.includes("divida")
  ) {
    tools.push({
      name:"bi_subject_financial_summary",
      description:"Resume débitos lançados e dívida ativa de um contribuinte específico, com resolução de ambiguidades e sem expor documentos completos, endereços ou lançamentos individualizados.",
      inputSchema:{
        type:"object",
        required:["busca"],
        properties:{
          busca:{type:"string",minLength:2,maxLength:120},
          contribuinte_id:{type:"string",minLength:1,maxLength:80},
          periodo:{type:"string",description:"Período dos débitos lançados; use todos para histórico completo."},
          exercicio:{type:"integer",minimum:2000,maximum:2100}
        },
        additionalProperties:false
      }
    });
  }

  if (credential.allowedViews.includes("contabil-visao-geral")) {
    tools.push({
      name:"bi_accounting_execution",
      description:"Resumo executivo da Contabilidade com receita prevista/arrecadada, despesa empenhada/liquidada/paga, resultado, restos a pagar e distribuições. Atualmente usa AMOSTRA LOCAL SINTÉTICA de 100 registros.",
      inputSchema:{
        type:"object",
        properties:{
          periodo:{type:"string"},
          exercicio:{type:"integer",minimum:2000,maximum:2100},
          filters:{type:"object",additionalProperties:{type:["string","number","boolean"]}}
        },
        additionalProperties:false
      }
    });
  }

  if (credential.allowedViews.includes("compras-visao-geral")) {
    tools.push({
      name:"bi_procurement_summary",
      description:"Resumo executivo de Compras com processos, valores estimados/homologados, economia, contratos ativos, fornecedores e distribuições. Atualmente usa AMOSTRA LOCAL SINTÉTICA de 100 registros.",
      inputSchema:{
        type:"object",
        properties:{
          periodo:{type:"string"},
          exercicio:{type:"integer",minimum:2000,maximum:2100},
          filters:{type:"object",additionalProperties:{type:["string","number","boolean"]}}
        },
        additionalProperties:false
      }
    });
  }

  if (credential.allowedViews.includes("folha-visao-geral")) {
    tools.push({
      name:"bi_payroll_summary",
      description:"Resumo executivo da Folha com servidores, bruto, líquido, descontos, encargos e custo agregado por secretaria/vínculo/status/cargo. Não expõe nomes de servidores. Atualmente usa AMOSTRA LOCAL SINTÉTICA de 100 registros.",
      inputSchema:{
        type:"object",
        properties:{
          periodo:{type:"string"},
          exercicio:{type:"integer",minimum:2000,maximum:2100},
          filters:{type:"object",additionalProperties:{type:["string","number","boolean"]}}
        },
        additionalProperties:false
      }
    });
  }

  return tools.map(mcpToolSecurity);
}

function mcpJsonRpc(request,env,id,result,status=200,extraHeaders={}) {
  return new Response(JSON.stringify({jsonrpc:"2.0",id,result}),{
    status,
    headers:{
      "Content-Type":"application/json; charset=utf-8",
      "MCP-Protocol-Version":"2025-11-25",
      ...corsHeaders(request,env),
      ...extraHeaders
    }
  });
}

function mcpJsonRpcError(request,env,id,code,message,status=200,data=null,extraHeaders={}) {
  const error={code,message};
  if (data!==null && data!==undefined) error.data=data;
  return new Response(JSON.stringify({jsonrpc:"2.0",id:id??null,error}),{
    status,
    headers:{
      "Content-Type":"application/json; charset=utf-8",
      "MCP-Protocol-Version":"2025-11-25",
      ...corsHeaders(request,env),
      ...extraHeaders
    }
  });
}

function mcpToolResult(value) {
  return {
    content:[{
      type:"text",
      text:JSON.stringify(value,null,2)
    }],
    structuredContent:value,
    isError:false
  };
}

function mcpDashboardUrl(request,args) {
  const url=new URL(request.url);
  url.pathname="/api/dashboard/"+encodeURIComponent(String(args.view||""));
  url.search="";
  url.searchParams.set("periodo",String(args.periodo||"ano"));
  url.searchParams.set("exercicio",String(Number(args.exercicio)||new Date().getFullYear()));

  const filters=args.filters && typeof args.filters==="object" && !Array.isArray(args.filters)
    ? args.filters
    : {};
  for (const [key,value] of Object.entries(filters)) {
    if (value===null || value===undefined || value==="") continue;
    url.searchParams.set(String(key),String(value));
  }
  return url;
}

function mcpRequireViews(credential,views) {
  const required=Array.isArray(views)?views:[views];
  if(!required.every(view=>credential.allowedViews.includes(view))) {
    throw new Error("MCP_VIEW_FORBIDDEN");
  }
}

function mcpChartTotal(chart) {
  if(!chart || !Array.isArray(chart.datasets)) return 0;
  let total=0;
  for(const dataset of chart.datasets){
    for(const value of (Array.isArray(dataset&&dataset.data)?dataset.data:[])){
      const n=Number(value);
      if(Number.isFinite(n)) total+=n;
    }
  }
  return total;
}

function normalizeMcpLookup(value) {
  return String(value||"")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function mcpLookupMatches(row,query,paths) {
  const normalized=normalizeMcpLookup(query);
  if(!normalized) return false;

  const digits=String(query||"").replace(/\D/g,"");
  for(const path of paths){
    const raw=firstValue(row,[path]);
    if(raw===undefined||raw===null) continue;
    const text=normalizeMcpLookup(typeof raw==="object"
      ? (raw.nome??raw.descricao??raw.nomeFantasia??raw.id??"")
      : raw);
    if(text.includes(normalized)) return true;

    if(digits.length>=5){
      const rowDigits=String(typeof raw==="object" ? (raw.cpfCnpj??raw.cpf??raw.cnpj??"") : raw).replace(/\D/g,"");
      if(rowDigits && rowDigits.includes(digits)) return true;
    }
  }
  return false;
}


function mcpPublicSubjectCandidate(candidate) {
  return {
    kind:candidate.kind,
    id:candidate.id,
    name:candidate.name,
    fantasyName:candidate.fantasyName||"",
    document:candidate.documentRaw ? maskDetailDocument(candidate.documentRaw) : "",
    status:candidate.status||"",
    score:Number(candidate.score||0)
  };
}

function mcpSubjectCandidatesFromRows(rows,query,kind,limit=10) {
  const config=kind==="economico"
    ? {
        idPaths:["id","idEconomico"],
        namePaths:["nome","razaoSocial","pessoa.nome"],
        fantasyPaths:["nomeFantasia","pessoa.nomeFantasia"],
        documentPaths:["pessoa.cpf","pessoa.cnpj","pessoa.cpfCnpj","cpf","cnpj","cpfCnpj"],
        statusPaths:["situacao.descricao","situacao","status"]
      }
    : {
        idPaths:["id","idPessoas","idPessoa"],
        namePaths:["nome","pessoa.nome"],
        fantasyPaths:["nomeFantasia","pessoa.nomeFantasia"],
        documentPaths:["cpf","cnpj","cpfCnpj","documento","pessoa.cpf","pessoa.cnpj"],
        statusPaths:["situacao","status","desativado"]
      };

  const searchPaths=[
    ...config.idPaths,
    ...config.namePaths,
    ...config.fantasyPaths,
    ...config.documentPaths
  ];

  const candidates=[];
  for(const row of rows||[]){
    const score=globalSearchScore(row,query,searchPaths);
    if(score<=0) continue;
    const id=String(firstValue(row,config.idPaths)||"").trim();
    if(!id) continue;
    candidates.push({
      kind,
      id,
      name:stringValue(row,config.namePaths,kind==="economico"?"Econômico":"Contribuinte"),
      fantasyName:stringValue(row,config.fantasyPaths,""),
      documentRaw:firstValue(row,config.documentPaths),
      status:stringValue(row,config.statusPaths,""),
      score,
      row
    });
  }

  candidates.sort((a,b)=>
    b.score-a.score ||
    a.name.localeCompare(b.name,"pt-BR",{sensitivity:"base"}) ||
    a.id.localeCompare(b.id,"pt-BR",{numeric:true})
  );

  const seen=new Set();
  return candidates.filter(candidate=>{
    const key=candidate.kind+":"+candidate.id;
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0,Math.max(1,Math.min(10,Number(limit)||10)));
}

function mcpSelectResolvedCandidate(candidates,explicitId="") {
  const requested=String(explicitId||"").trim();
  if(requested){
    const selected=(candidates||[]).find(candidate=>String(candidate.id)===requested);
    return selected
      ? {status:"resolved",selected,candidates:[selected]}
      : {status:"not_found",selected:null,candidates:[]};
  }

  if(!Array.isArray(candidates)||!candidates.length){
    return {status:"not_found",selected:null,candidates:[]};
  }
  if(candidates.length===1){
    return {status:"resolved",selected:candidates[0],candidates};
  }

  const top=candidates[0];
  const second=candidates[1];
  if(Number(top.score)>=98 && Number(top.score)>Number(second.score)){
    return {status:"resolved",selected:top,candidates};
  }
  return {status:"ambiguous",selected:null,candidates};
}

async function mcpResolveSubject(env,credential,args) {
  const query=String(args.busca||"").trim();
  if(query.length<2) throw new Error("MCP_QUERY_REQUIRED");
  const type=String(args.tipo||"ambos");
  const limit=Math.max(1,Math.min(10,Number(args.limite)||8));
  if(!["ambos","contribuinte","economico"].includes(type)) throw new Error("MCP_SUBJECT_TYPE_INVALID");

  const canContrib=credential.allowedViews.includes("contribuintes");
  const canEco=credential.allowedViews.includes("economicos");
  const wantsContrib=(type==="ambos"||type==="contribuinte")&&canContrib;
  const wantsEco=(type==="ambos"||type==="economico")&&canEco;

  const [contributors,economics]=await Promise.all([
    wantsContrib ? safeBethaRows(env,credential.tenant,"bi","contribuintes") : Promise.resolve({rows:[],loaded:0,complete:true}),
    wantsEco ? safeBethaRows(env,credential.tenant,"bi","economicos") : Promise.resolve({rows:[],loaded:0,complete:true})
  ]);

  const candidates=[
    ...(wantsContrib?mcpSubjectCandidatesFromRows(contributors.rows,query,"contribuinte",limit):[]),
    ...(wantsEco?mcpSubjectCandidatesFromRows(economics.rows,query,"economico",limit):[])
  ].sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,"pt-BR",{sensitivity:"base"})).slice(0,limit);

  return {
    tenant:{id:credential.tenant.id,name:credential.tenant.name},
    query,
    type,
    count:candidates.length,
    ambiguous:candidates.length>1 && !(candidates[0]&&candidates[1]&&candidates[0].score>=98&&candidates[0].score>candidates[1].score),
    candidates:candidates.map(mcpPublicSubjectCandidate),
    sourceStatus:{
      contributorsLoaded:Number(contributors.loaded||0),
      economicsLoaded:Number(economics.loaded||0),
      contributorsComplete:contributors.complete===true,
      economicsComplete:economics.complete===true
    }
  };
}

function mcpIssCreditLabel(row) {
  return [
    stringValue(row,["creditoTributario.abreviatura","credito.abreviatura"],""),
    stringValue(row,["creditoTributario.descricao","credito.descricao"],"")
  ].filter(Boolean).join(" · ");
}

function mcpIsIssPaymentDetail(row) {
  const label=normalizeMcpLookup(mcpIssCreditLabel(row));
  if(!label) return false;
  return /(^|[^a-z])iss(qn)?([^a-z]|$)/.test(label) ||
    label.includes("imposto sobre servicos");
}

function mcpPaymentTotal(row) {
  return numericValue(row,["valorPagoLancado","vlPagoLancado","valorPago","vlPago"])+
    numericValue(row,["valorPagoCorrecao","vlPagoCorrecao"])+
    numericValue(row,["valorPagoJuros","vlPagoJuros"])+
    numericValue(row,["valorPagoMulta","vlPagoMulta"]);
}

function mcpEconomicLinked(row,economicId) {
  const id=firstValue(row,["idEconomico","economico.id","economicoId","referente.idEconomico"]);
  return id!==undefined&&id!==null&&String(id)===String(economicId);
}

async function mcpCompanyIssDetail(request,env,credential,args) {
  mcpRequireViews(credential,["economicos","arrecadacao"]);
  const query=String(args.busca||"").trim();
  if(query.length<2) throw new Error("MCP_QUERY_REQUIRED");
  const limit=Math.max(1,Math.min(12,Number(args.limite)||8));

  const economics=await safeBethaRows(env,credential.tenant,"bi","economicos");
  const candidates=mcpSubjectCandidatesFromRows(economics.rows,query,"economico",10);
  const resolution=mcpSelectResolvedCandidate(candidates,args.economico_id);

  if(resolution.status!=="resolved"){
    return {
      tenant:{id:credential.tenant.id,name:credential.tenant.name},
      query,
      status:resolution.status,
      ambiguous:resolution.status==="ambiguous",
      candidates:resolution.candidates.slice(0,limit).map(mcpPublicSubjectCandidate),
      note:resolution.status==="ambiguous"
        ? "Mais de um econômico corresponde à busca. Informe economico_id para consultar valores financeiros."
        : "Nenhum econômico encontrado para a busca informada."
    };
  }

  const selected=resolution.selected;
  const period=String(args.periodo||"ano");
  const exercise=Number(args.exercicio)||new Date().getFullYear();
  const payments=await safeBethaRows(env,credential.tenant,"bi","pagamentos-detalhados");

  const linked=payments.rows
    .filter(row=>mcpEconomicLinked(row,selected.id))
    .filter(row=>periodIncludes(row,{
      periodo:period,
      exercicio:exercise,
      datePaths:["pagamento.dataPagamento","dataPagamento","dtPagamento"],
      yearPaths:["ano","exercicio"]
    }))
    .filter(row=>!firstValue(row,["pagamento.dataHoraEstorno","pagamento.dhEstorno","dataHoraEstorno","dhEstorno"]));

  const issRows=linked
    .filter(mcpIsIssPaymentDetail)
    .map(row=>({...row,__totalPaid:mcpPaymentTotal(row)}));

  const tributo=sumRows(issRows,["valorPagoLancado","vlPagoLancado","valorPago","vlPago"]);
  const correcao=sumRows(issRows,["valorPagoCorrecao","vlPagoCorrecao"]);
  const juros=sumRows(issRows,["valorPagoJuros","vlPagoJuros"]);
  const multa=sumRows(issRows,["valorPagoMulta","vlPagoMulta"]);
  const total=tributo+correcao+juros+multa;

  const monthly=monthSeries(issRows,{
    datePaths:["pagamento.dataPagamento","dataPagamento","dtPagamento"],
    valuePaths:["__totalPaid"],
    periodo:period,
    exercicio:exercise
  });
  const byCredit=groupSum(issRows,["creditoTributario.descricao","creditoTributario.abreviatura"],["__totalPaid"],limit);
  const byRevenue=groupSum(issRows,["receita.descricao","receita.abreviatura"],["__totalPaid"],limit);

  return {
    tenant:{id:credential.tenant.id,name:credential.tenant.name},
    query,
    status:"resolved",
    subject:mcpPublicSubjectCandidate(selected),
    period:{periodo:period,exercicio:exercise},
    iss:{
      total,
      tributo,
      correcao,
      juros,
      multa,
      pagamentosClassificados:issRows.length,
      pagamentosVinculados:linked.length
    },
    mensal:{labels:monthly.labels||[],valores:monthly.values||[]},
    porCredito:byCredit.map(([label,value])=>({label,value:Number(value)||0})),
    porReceita:byRevenue
      .filter(([label])=>String(label)!=="Não informado")
      .map(([label,value])=>({label,value:Number(value)||0})),
    note:linked.length&&!issRows.length
      ? "Há pagamentos vinculados ao econômico, mas nenhum pôde ser classificado como ISS pelos campos de crédito tributário disponíveis."
      : "",
    sourceStatus:{
      economicsLoaded:Number(economics.loaded||0),
      paymentsLoaded:Number(payments.loaded||0),
      economicsComplete:economics.complete===true,
      paymentsComplete:payments.complete===true
    }
  };
}

function mcpSubjectRowMatches(row,subject) {
  const subjectId=String(subject&&subject.id||"");
  const rowId=firstValue(row,[
    "idPessoa","idPessoas","idContribuinte","pessoa.id","contribuinte.id","responsavel.id"
  ]);
  if(subjectId && rowId!==undefined&&rowId!==null&&String(rowId)===subjectId) return true;

  const subjectDigits=String(subject&&subject.documentRaw||"").replace(/\D/g,"");
  if(subjectDigits.length>=5){
    const rowDocument=firstValue(row,[
      "pessoa.cpf","pessoa.cnpj","pessoa.cpfCnpj",
      "contribuinte.cpf","contribuinte.cnpj","contribuinte.cpfCnpj",
      "cpf","cnpj","cpfCnpj","documento"
    ]);
    const rowDigits=String(rowDocument||"").replace(/\D/g,"");
    if(rowDigits&&rowDigits===subjectDigits) return true;
  }

  const subjectName=normalizeMcpLookup(subject&&subject.name||"");
  const rowName=normalizeMcpLookup(stringValue(row,[
    "pessoa.nome","pessoa.nomeFantasia","contribuinte.nome","contribuinte.nomeFantasia",
    "nomeContribuinte","nomePessoa","nome"
  ],""));
  return Boolean(subjectName&&rowName&&subjectName===rowName);
}

async function mcpSubjectFinancialSummary(request,env,credential,args) {
  mcpRequireViews(credential,["contribuintes","debitos","divida"]);
  const query=String(args.busca||"").trim();
  if(query.length<2) throw new Error("MCP_QUERY_REQUIRED");

  const contributors=await safeBethaRows(env,credential.tenant,"bi","contribuintes");
  const candidates=mcpSubjectCandidatesFromRows(contributors.rows,query,"contribuinte",10);
  const resolution=mcpSelectResolvedCandidate(candidates,args.contribuinte_id);

  if(resolution.status!=="resolved"){
    return {
      tenant:{id:credential.tenant.id,name:credential.tenant.name},
      query,
      status:resolution.status,
      ambiguous:resolution.status==="ambiguous",
      candidates:resolution.candidates.map(mcpPublicSubjectCandidate),
      note:resolution.status==="ambiguous"
        ? "Mais de um contribuinte corresponde à busca. Informe contribuinte_id para consultar dados financeiros."
        : "Nenhum contribuinte encontrado para a busca informada."
    };
  }

  const selected=resolution.selected;
  const period=String(args.periodo||"todos");
  const exercise=Number(args.exercicio)||new Date().getFullYear();
  const [debits,baseDebts,closings]=await Promise.all([
    safeBethaRows(env,credential.tenant,"bi","debitos"),
    safeBethaRows(env,credential.tenant,"base","dividas"),
    safeBethaRows(env,credential.tenant,"base","encerramento-dividas")
  ]);

  const now=Date.now();
  const subjectDebits=debits.rows
    .filter(row=>mcpSubjectRowMatches(row,selected))
    .filter(row=>periodIncludes(row,{
      periodo:period,
      exercicio:exercise,
      datePaths:["dhDebito"],
      yearPaths:["ano"]
    }))
    .map(row=>{
      const paid=Boolean(firstValue(row,["dtPgto"]));
      const status=stringValue(row,["situacao"],"");
      const open=!paid&&!/cancel|quit|pago|baix/i.test(status);
      const due=dateValue(row,["dtVcto"]);
      return {
        ...row,
        __paid:paid,
        __open:open,
        __overdue:open&&Boolean(due&&due.getTime()<now)
      };
    });

  const subjectBaseDebts=baseDebts.rows.filter(row=>mcpSubjectRowMatches(row,selected));
  const subjectDebtIds=new Set(
    subjectBaseDebts.map(row=>String(firstValue(row,["id","idDivida"])||"")).filter(Boolean)
  );

  const closingKey=row=>closingPeriod(row)?.key||0;
  const allKeys=closings.rows.map(closingKey).filter(Boolean);
  const latestKey=allKeys.length?Math.max(...allKeys):0;
  const subjectClosingRows=closings.rows.filter(row=>{
    if(latestKey&&closingKey(row)!==latestKey) return false;
    const contributorId=firstValue(row,["idContribuinte","contribuinte.id"]);
    if(contributorId!==undefined&&contributorId!==null&&String(contributorId)===String(selected.id)) return true;
    const debtId=String(firstValue(row,["idDivida","divida.id"])||"");
    return debtId&&subjectDebtIds.has(debtId);
  });

  const openRows=subjectDebits.filter(row=>row.__open);
  const overdueRows=subjectDebits.filter(row=>row.__overdue);
  const paidRows=subjectDebits.filter(row=>row.__paid);
  const activeBalance=sumRows(subjectClosingRows,["valorSaldo"]);
  const activeCorrection=sumRows(subjectClosingRows,["valorCorrecao"]);
  const activeInterest=sumRows(subjectClosingRows,["valorJuros"]);
  const activePenalty=sumRows(subjectClosingRows,["valorMulta"]);

  return {
    tenant:{id:credential.tenant.id,name:credential.tenant.name},
    query,
    status:"resolved",
    subject:mcpPublicSubjectCandidate(selected),
    period:{periodo:period,exercicio:exercise},
    debitos:{
      quantidade:subjectDebits.length,
      lancado:sumRows(subjectDebits,["vlLancado"]),
      descontos:sumRows(subjectDebits,["vlDesconto"]),
      abertos:{quantidade:openRows.length,valor:sumRows(openRows,["vlLancado"])},
      vencidos:{quantidade:overdueRows.length,valor:sumRows(overdueRows,["vlLancado"])},
      pagos:{quantidade:paidRows.length,valor:sumRows(paidRows,["vlLancado"])}
    },
    dividaAtiva:{
      fechamento:latestKey||null,
      quantidade:subjectClosingRows.length,
      saldo:activeBalance,
      principal:Math.max(0,activeBalance-activeCorrection-activeInterest-activePenalty),
      correcao:activeCorrection,
      juros:activeInterest,
      multa:activePenalty,
      executadas:countWhere(subjectBaseDebts,row=>truthyValue(row,["executada.valor","executada.descricao","executada"])),
      protestadas:countWhere(subjectBaseDebts,row=>truthyValue(row,["protestada.valor","protestada.descricao","protestada"])),
      comCda:countWhere(subjectBaseDebts,row=>truthyValue(row,["possuiCdaEmitida","cdaEmitida"]))
    },
    privacy:"Resumo agregado. Não retorna endereço, documento completo nem lançamentos individualizados.",
    sourceStatus:{
      contributorsLoaded:Number(contributors.loaded||0),
      debitsLoaded:Number(debits.loaded||0),
      activeDebtsLoaded:Number(baseDebts.loaded||0),
      closingsLoaded:Number(closings.loaded||0),
      contributorsComplete:contributors.complete===true,
      debitsComplete:debits.complete===true,
      activeDebtsComplete:baseDebts.complete===true,
      closingsComplete:closings.complete===true
    }
  };
}

async function mcpRevenueSummary(request,env,credential,args) {
  mcpRequireViews(credential,["arrecadacao"]);
  const url=mcpDashboardUrl(request,{
    view:"arrecadacao",
    periodo:args.periodo||"ano",
    exercicio:args.exercicio||new Date().getFullYear(),
    filters:args.filters||{}
  });
  const body=await buildRevenueDashboard(env,credential.tenant,url);
  const monthly=body.charts&&body.charts["arrecadacao-mes"] ? body.charts["arrecadacao-mes"] : null;

  return {
    tenant:body.tenant,
    period:body.period,
    filters:body.filters||{},
    totalArrecadado:Number(body.kpis&&body.kpis["total-pago"]||0),
    tributo:Number(body.kpis&&body.kpis["tributo-pago"]||0),
    correcao:Number(body.kpis&&body.kpis["correcao-paga"]||0),
    juros:Number(body.kpis&&body.kpis["juros-pagos"]||0),
    multa:Number(body.kpis&&body.kpis["multa-paga"]||0),
    descontos:Number(body.kpis&&body.kpis.descontos||0),
    mensal:monthly ? {
      labels:monthly.labels||[],
      valores:monthly.datasets&&monthly.datasets[0] ? monthly.datasets[0].data||[] : []
    } : {labels:[],valores:[]},
    calculationBasis:body.meta&&body.meta.calculationBasis ? body.meta.calculationBasis : null
  };
}

async function mcpCompanyIss(request,env,credential,args) {
  return mcpCompanyIssDetail(request,env,credential,{
    ...args,
    economico_id:args.economico_id||""
  });
}


function mcpChartRows(chart,limit=12) {
  if(!chart || !Array.isArray(chart.labels) || !Array.isArray(chart.datasets)) return [];
  const safeLimit=Math.max(1,Math.min(20,Number(limit)||12));
  return chart.labels.slice(0,safeLimit).map((label,index)=>{
    const values={};
    for(const dataset of chart.datasets){
      const key=String(dataset&&dataset.label||"Valor");
      const raw=Array.isArray(dataset&&dataset.data)?dataset.data[index]:null;
      const value=Number(raw);
      values[key]=Number.isFinite(value)?value:null;
    }
    const names=Object.keys(values);
    return names.length===1
      ? {label:String(label),value:values[names[0]]}
      : {label:String(label),values};
  });
}

function mcpSingleSeriesTotal(items) {
  return (Array.isArray(items)?items:[]).reduce((sum,item)=>{
    const value=Number(item&&item.value);
    return Number.isFinite(value)?sum+value:sum;
  },0);
}

function mcpWithParticipation(items,total) {
  const denominator=Number(total)||0;
  return (Array.isArray(items)?items:[]).map(item=>({
    ...item,
    ...(typeof item.value==="number" ? {
      percentual:denominator>0 ? Number(((item.value/denominator)*100).toFixed(2)) : 0
    } : {})
  }));
}

async function mcpRevenueBreakdown(request,env,credential,args) {
  mcpRequireViews(credential,["arrecadacao"]);
  const dimension=String(args.dimensao||"");
  const chartMap={
    receita:"arrecadacao-receita",
    credito:"arrecadacao-credito",
    tipo_pagamento:"tipo-pagamento",
    tipo_baixa:"tipo-baixa",
    classificacao_guia:"guias"
  };
  const chartKey=chartMap[dimension];
  if(!chartKey) throw new Error("MCP_DIMENSION_INVALID");

  const url=mcpDashboardUrl(request,{
    view:"arrecadacao",
    periodo:args.periodo||"ano",
    exercicio:args.exercicio||new Date().getFullYear(),
    filters:args.filters||{}
  });
  const body=await buildRevenueDashboard(env,credential.tenant,url);
  const total=Number(body.kpis&&body.kpis["total-pago"]||0);
  const items=mcpChartRows(body.charts&&body.charts[chartKey],args.limite||12);

  return {
    tenant:body.tenant,
    period:body.period,
    filters:body.filters||{},
    dimensao:dimension,
    totalArrecadado:total,
    grupos:mcpWithParticipation(items,total),
    calculationBasis:body.meta&&body.meta.calculationBasis ? body.meta.calculationBasis : null
  };
}

async function mcpDebtPortfolio(request,env,credential,args) {
  mcpRequireViews(credential,["debitos"]);
  const carteira=String(args.carteira||"aberto");
  if(!["aberto","vencido","pago"].includes(carteira)) throw new Error("MCP_PORTFOLIO_INVALID");

  const filters={
    ...(args.filters&&typeof args.filters==="object"&&!Array.isArray(args.filters)?args.filters:{}),
    carteira
  };
  const url=mcpDashboardUrl(request,{
    view:"debitos",
    periodo:args.periodo||"ano",
    exercicio:args.exercicio||new Date().getFullYear(),
    filters
  });
  const body=await buildDebtsDashboard(env,credential.tenant,url);
  const limit=args.limite||12;

  return {
    tenant:body.tenant,
    period:body.period,
    filters:body.filters||{},
    carteira,
    totalLancado:Number(body.kpis&&body.kpis["vl-lancado"]||0),
    quantidadeDebitos:Number(body.kpis&&body.kpis["qtd-debitos"]||0),
    vencidos:Number(body.kpis&&body.kpis.vencidos||0),
    pagos:Number(body.kpis&&body.kpis.pagos||0),
    descontos:Number(body.kpis&&body.kpis["descontos-debito"]||0),
    aging:mcpChartRows(body.charts&&body.charts["aging-debitos"],limit),
    porCredito:mcpChartRows(body.charts&&body.charts["debitos-credito"],limit),
    porOrigem:mcpChartRows(body.charts&&body.charts["origem-cadastro"],limit),
    porReceita:mcpChartRows(body.charts&&body.charts["debitos-receita"],limit)
  };
}

async function mcpActiveDebtSummary(request,env,credential,args) {
  mcpRequireViews(credential,["divida"]);
  const url=mcpDashboardUrl(request,{
    view:"divida",
    periodo:args.periodo||"ano",
    exercicio:args.exercicio||new Date().getFullYear(),
    filters:args.filters||{}
  });
  const body=await buildActiveDebtDashboard(env,credential.tenant,url);
  const limit=args.limite||12;

  return {
    tenant:body.tenant,
    period:body.period,
    filters:body.filters||{},
    saldoAtual:Number(body.kpis&&body.kpis["saldo-divida"]||0),
    valorInscrito:Number(body.kpis&&body.kpis.inscrito||0),
    quantidadeDividas:Number(body.kpis&&body.kpis["qtd-dividas"]||0),
    executadas:Number(body.kpis&&body.kpis.executadas||0),
    protestadas:Number(body.kpis&&body.kpis.protestadas||0),
    comCda:Number(body.kpis&&body.kpis.cda||0),
    composicao:mcpChartRows(body.charts&&body.charts["composicao-divida"],limit),
    situacoes:mcpChartRows(body.charts&&body.charts["status-divida"],limit),
    aging:mcpChartRows(body.charts&&body.charts["aging-divida"],limit),
    porCredito:mcpChartRows(body.charts&&body.charts["divida-credito"],limit),
    cobranca:mcpChartRows(body.charts&&body.charts.cobranca,limit),
    recuperacaoMensal:mcpChartRows(body.charts&&body.charts.recuperacao,limit),
    calculationBasis:body.meta&&body.meta.calculationBasis ? body.meta.calculationBasis : null
  };
}

async function mcpInstallmentsSummary(request,env,credential,args) {
  mcpRequireViews(credential,["parcelamentos"]);
  const url=mcpDashboardUrl(request,{
    view:"parcelamentos",
    periodo:args.periodo||"ano",
    exercicio:args.exercicio||new Date().getFullYear(),
    filters:args.filters||{}
  });
  const body=await buildInstallmentsDashboard(env,credential.tenant,url);
  const limit=args.limite||12;

  return {
    tenant:body.tenant,
    period:body.period,
    filters:body.filters||{},
    quantidadeParcelamentos:Number(body.kpis&&body.kpis["qtd-parcelamentos"]||0),
    ativos:Number(body.kpis&&body.kpis.ativos||0),
    quantidadeParcelas:Number(body.kpis&&body.kpis["qtd-parcelas"]||0),
    parcelasVencidas:Number(body.kpis&&body.kpis["parcelas-vencidas"]||0),
    valorEntradas:Number(body.kpis&&body.kpis.entradas||0),
    cancelados:Number(body.kpis&&body.kpis.cancelados||0),
    situacoes:mcpChartRows(body.charts&&body.charts["situacao-parcelamentos"],limit),
    faixaParcelas:mcpChartRows(body.charts&&body.charts["faixa-parcelas"],limit),
    vencidasPorParcelamento:mcpChartRows(body.charts&&body.charts["vencidas-parcelamento"],limit),
    recebimentosMensais:mcpChartRows(body.charts&&body.charts["pagamentos-parcelas"],limit)
  };
}

async function mcpPersonProperties(env,credential,args) {
  mcpRequireViews(credential,["contribuintes","imobiliario"]);
  const query=String(args.busca||"").trim();
  if(query.length<2) throw new Error("MCP_QUERY_REQUIRED");
  const limit=Math.max(1,Math.min(10,Number(args.limite)||5));

  const [contributors,responsibilities,properties]=await Promise.all([
    safeBethaRows(env,credential.tenant,"bi","contribuintes"),
    safeBethaRows(env,credential.tenant,"bi","imoveis-responsaveis"),
    safeBethaRows(env,credential.tenant,"bi","imoveis")
  ]);

  const contributorPaths=[
    "nome","nomeFantasia","cpf","cnpj","cpfCnpj","documento",
    "pessoa.nome","pessoa.nomeFantasia"
  ];
  const matches=contributors.rows
    .filter(row=>mcpLookupMatches(row,query,contributorPaths))
    .slice(0,limit);

  const propertyById=new Map();
  for(const row of properties.rows){
    const id=firstValue(row,["id","idImovel","imovel.id"]);
    if(id!==undefined&&id!==null&&String(id)!=="") propertyById.set(String(id),row);
  }

  const results=[];
  for(const contributor of matches){
    const contributorId=String(firstValue(contributor,["id","idPessoas","idPessoa","pessoa.id"])||"");
    const contributorName=stringValue(contributor,["nome","nomeFantasia","pessoa.nome"],"Contribuinte");
    const documentRaw=firstValue(contributor,["cpf","cnpj","cpfCnpj","documento"]);

    const linkedPropertyIds=new Set();
    for(const rel of responsibilities.rows){
      const responsibleId=firstValue(rel,[
        "idPessoa","idPessoas","idContribuinte","idResponsavel",
        "pessoa.id","contribuinte.id","responsavel.id","responsavel.idPessoa"
      ]);
      const relName=stringValue(rel,[
        "pessoa.nome","contribuinte.nome","responsavel.nome","nomeResponsavel"
      ],"");
      const idMatches=contributorId && responsibleId!==undefined && responsibleId!==null &&
        String(responsibleId)===contributorId;
      const nameMatches=!idMatches && relName && normalizeMcpLookup(relName)===normalizeMcpLookup(contributorName);
      if(!idMatches&&!nameMatches) continue;

      const propertyId=firstValue(rel,["iImoveis","idImovel","imovel.id","imovelId","idContribImoveis"]);
      if(propertyId!==undefined&&propertyId!==null&&String(propertyId)!=="") {
        linkedPropertyIds.add(String(propertyId));
      }
    }

    // Fallback para APIs que já trazem o responsável diretamente no imóvel.
    if(!linkedPropertyIds.size){
      for(const [propertyId,row] of propertyById.entries()){
        const responsibleId=firstValue(row,[
          "idPessoaResponsavel","idResponsavel","responsavel.id","proprietario.id",
          "contribuinte.id","pessoa.id"
        ]);
        if(contributorId && responsibleId!==undefined&&responsibleId!==null&&String(responsibleId)===contributorId){
          linkedPropertyIds.add(propertyId);
        }
      }
    }

    const linkedRows=[...linkedPropertyIds]
      .map(id=>propertyById.get(id))
      .filter(Boolean);

    const bairros=groupCount(linkedRows,["nomeBairro","bairro.nome","bairro"],8)
      .map(([label,count])=>({label,count:Number(count)||0}));
    const setores=groupCount(linkedRows,["setor","setor.codigo","nomeSetor"],8)
      .map(([label,count])=>({label,count:Number(count)||0}));

    results.push({
      contributorId:contributorId||null,
      name:contributorName,
      document:documentRaw ? maskDetailDocument(documentRaw) : "",
      propertyCount:linkedPropertyIds.size,
      bairros,
      setores
    });
  }

  return {
    tenant:{id:credential.tenant.id,name:credential.tenant.name},
    query,
    matchedContributors:results.length,
    truncatedMatches:contributors.rows.filter(row=>mcpLookupMatches(row,query,contributorPaths)).length>limit,
    results,
    sourceStatus:{
      contributorsLoaded:contributors.loaded,
      responsibilitiesLoaded:responsibilities.loaded,
      propertiesLoaded:properties.loaded,
      contributorsComplete:contributors.complete,
      responsibilitiesComplete:responsibilities.complete,
      propertiesComplete:properties.complete
    }
  };
}

function mcpDashboardSampleWarning(body) {
  return body&&body.meta&&body.meta.warning
    ? String(body.meta.warning)
    : "AMOSTRA LOCAL SINTÉTICA – 100 registros. Não representa dados reais da prefeitura.";
}

async function mcpAccountingExecution(request,env,credential,args) {
  mcpRequireViews(credential,["contabil-visao-geral"]);
  const url=mcpDashboardUrl(request,{
    view:"contabil-visao-geral",
    periodo:args.periodo||"ano",
    exercicio:args.exercicio||new Date().getFullYear(),
    filters:args.filters||{}
  });
  const body=await buildAccountingSampleDashboard(env,credential.tenant,url);
  return {
    tenant:body.tenant,
    period:body.period,
    filters:body.filters||{},
    dataMode:"sample",
    warning:mcpDashboardSampleWarning(body),
    receitaPrevista:Number(body.kpis&&body.kpis["receita-prevista"]||0),
    receitaArrecadada:Number(body.kpis&&body.kpis["receita-arrecadada"]||0),
    despesaEmpenhada:Number(body.kpis&&body.kpis["despesa-empenhada"]||0),
    despesaLiquidada:Number(body.kpis&&body.kpis["despesa-liquidada"]||0),
    despesaPaga:Number(body.kpis&&body.kpis["despesa-paga"]||0),
    resultado:Number(body.kpis&&body.kpis.resultado||0),
    restosAPagar:Number(body.kpis&&body.kpis["restos-pagar"]||0),
    credores:Number(body.kpis&&body.kpis.credores||0),
    execucaoMensal:mcpChartRows(body.charts&&body.charts["execucao-mensal"],12),
    despesaPorUnidade:mcpChartRows(body.charts&&body.charts["despesa-unidade"],10),
    despesaPorNatureza:mcpChartRows(body.charts&&body.charts["despesa-natureza"],10)
  };
}

async function mcpProcurementSummary(request,env,credential,args) {
  mcpRequireViews(credential,["compras-visao-geral"]);
  const url=mcpDashboardUrl(request,{
    view:"compras-visao-geral",
    periodo:args.periodo||"ano",
    exercicio:args.exercicio||new Date().getFullYear(),
    filters:args.filters||{}
  });
  const body=await buildProcurementSampleDashboard(env,credential.tenant,url);
  return {
    tenant:body.tenant,
    period:body.period,
    filters:body.filters||{},
    dataMode:"sample",
    warning:mcpDashboardSampleWarning(body),
    processos:Number(body.kpis&&body.kpis.processos||0),
    valorEstimado:Number(body.kpis&&body.kpis.estimado||0),
    valorHomologado:Number(body.kpis&&body.kpis.homologado||0),
    economia:Number(body.kpis&&body.kpis.economia||0),
    contratosAtivos:Number(body.kpis&&body.kpis["contratos-ativos"]||0),
    fornecedores:Number(body.kpis&&body.kpis.fornecedores||0),
    evolucaoMensal:mcpChartRows(body.charts&&body.charts["compras-mensal"],12),
    porSecretaria:mcpChartRows(body.charts&&body.charts["compras-secretaria"],10),
    porModalidade:mcpChartRows(body.charts&&body.charts["compras-modalidade"],10),
    porFornecedor:mcpChartRows(body.charts&&body.charts["compras-fornecedor"],10)
  };
}

async function mcpPayrollSummary(request,env,credential,args) {
  mcpRequireViews(credential,["folha-visao-geral"]);
  const url=mcpDashboardUrl(request,{
    view:"folha-visao-geral",
    periodo:args.periodo||"ano",
    exercicio:args.exercicio||new Date().getFullYear(),
    filters:args.filters||{}
  });
  const body=await buildPayrollSampleDashboard(env,credential.tenant,url);
  return {
    tenant:body.tenant,
    period:body.period,
    filters:body.filters||{},
    dataMode:"sample",
    warning:mcpDashboardSampleWarning(body),
    servidores:Number(body.kpis&&body.kpis.servidores||0),
    bruto:Number(body.kpis&&body.kpis.bruto||0),
    liquido:Number(body.kpis&&body.kpis.liquido||0),
    descontos:Number(body.kpis&&body.kpis.descontos||0),
    encargos:Number(body.kpis&&body.kpis.encargos||0),
    ativos:Number(body.kpis&&body.kpis.ativos||0),
    afastados:Number(body.kpis&&body.kpis.afastados||0),
    evolucaoMensal:mcpChartRows(body.charts&&body.charts["folha-mensal"],12),
    custoPorSecretaria:mcpChartRows(body.charts&&body.charts["folha-secretaria"],10),
    servidoresPorVinculo:mcpChartRows(body.charts&&body.charts["folha-vinculo"],10),
    servidoresPorSituacao:mcpChartRows(body.charts&&body.charts["folha-status"],10),
    custoPorCargo:mcpChartRows(body.charts&&body.charts["folha-cargo"],10),
    privacy:"Resumo agregado; nomes de servidores não são retornados."
  };
}

async function executeMcpTool(request,env,credential,name,args={}) {
  if (name==="bi_context") {
    return {
      tenant:{
        id:credential.tenant.id,
        name:credential.tenant.name,
        entityId:credential.context.entity,
        databaseId:credential.context.database
      },
      expiresAt:new Date(credential.exp).toISOString(),
      allowedDashboards:credential.allowedViews.map(view=>({
        id:view,
        title:MCP_VIEW_LABELS[view]||view
      }))
    };
  }

  if (name==="bi_list_dashboards") {
    return {
      dashboards:credential.allowedViews.map(view=>({
        id:view,
        title:MCP_VIEW_LABELS[view]||view
      }))
    };
  }

  if (name==="bi_get_dashboard" || name==="bi_get_kpis") {
    const view=String(args.view||"");
    if (!credential.allowedViews.includes(view)) throw new Error("MCP_VIEW_FORBIDDEN");

    const builder=dashboardBuilder(view);
    if (!builder) throw new Error("DASHBOARD_NOT_IMPLEMENTED");

    const url=mcpDashboardUrl(request,args);
    const body=await builder(env,credential.tenant,url);

    const base={
      view:body.view,
      tenant:body.tenant,
      period:body.period,
      filters:body.filters||{},
      kpis:body.kpis||{}
    };

    if (name==="bi_get_kpis") return base;

    return {
      ...base,
      charts:body.charts||{},
      meta:{
        appliedFilters:body.meta&&body.meta.appliedFilters ? body.meta.appliedFilters : {},
        calculationBasis:body.meta&&body.meta.calculationBasis ? body.meta.calculationBasis : null
      }
    };
  }

  if (name==="bi_revenue_summary") {
    return mcpRevenueSummary(request,env,credential,args);
  }

  if (name==="bi_company_iss") {
    return mcpCompanyIss(request,env,credential,args);
  }

  if (name==="bi_person_properties") {
    return mcpPersonProperties(env,credential,args);
  }

  if (name==="bi_revenue_breakdown") {
    return mcpRevenueBreakdown(request,env,credential,args);
  }

  if (name==="bi_debt_portfolio") {
    return mcpDebtPortfolio(request,env,credential,args);
  }

  if (name==="bi_active_debt_summary") {
    return mcpActiveDebtSummary(request,env,credential,args);
  }

  if (name==="bi_installments_summary") {
    return mcpInstallmentsSummary(request,env,credential,args);
  }

  if (name==="bi_resolve_subject") {
    return mcpResolveSubject(env,credential,args);
  }

  if (name==="bi_company_iss_detail") {
    return mcpCompanyIssDetail(request,env,credential,args);
  }

  if (name==="bi_subject_financial_summary") {
    return mcpSubjectFinancialSummary(request,env,credential,args);
  }

  if (name==="bi_accounting_execution") {
    return mcpAccountingExecution(request,env,credential,args);
  }

  if (name==="bi_procurement_summary") {
    return mcpProcurementSummary(request,env,credential,args);
  }

  if (name==="bi_payroll_summary") {
    return mcpPayrollSummary(request,env,credential,args);
  }

  throw new Error("MCP_TOOL_NOT_FOUND");
}

async function handleMcpRequest(request,env) {
  if (request.method!=="POST") {
    return new Response(JSON.stringify({error:"MCP_POST_REQUIRED"}),{
      status:405,
      headers:{
        "Content-Type":"application/json; charset=utf-8",
        "Allow":"POST",
        ...corsHeaders(request,env)
      }
    });
  }

  let credential;
  try {
    credential=await readAnyMcpCredential(request,env);
  } catch(error) {
    const code=error&&error.message?error.message:"MCP_TOKEN_INVALID";
    return new Response(JSON.stringify({error:code}),{
      status:401,
      headers:{
        "Content-Type":"application/json; charset=utf-8",
        "WWW-Authenticate":'Bearer realm="BI Vella MCP", resource_metadata="'+new URL("/.well-known/oauth-protected-resource",request.url).toString()+'", scope="'+MCP_OAUTH_SCOPE+'", error="invalid_token"',
        ...corsHeaders(request,env)
      }
    });
  }

  let body;
  try { body=await request.json(); }
  catch { return mcpJsonRpcError(request,env,null,-32700,"Parse error",400); }

  if (!body || typeof body!=="object" || Array.isArray(body) || body.jsonrpc!=="2.0" || !body.method) {
    return mcpJsonRpcError(request,env,body&&body.id,-32600,"Invalid Request",400);
  }

  const id=body.id??null;
  const method=String(body.method||"");
  const headerMethod=request.headers.get("Mcp-Method");
  const headerName=request.headers.get("Mcp-Name");
  const principalName=method==="tools/call" ? String(body.params&&body.params.name||"") : "";

  if (headerMethod && headerMethod!==method) {
    return mcpJsonRpcError(request,env,id,-32020,"MCP header/body method mismatch",400);
  }
  if (headerName && principalName && headerName!==principalName) {
    return mcpJsonRpcError(request,env,id,-32020,"MCP header/body name mismatch",400);
  }

  if (method==="initialize" || method==="server/discover") {
    const requestedVersion=String(body.params&&body.params.protocolVersion||"");
    const supportedVersions=["2026-07-28","2025-11-25"];
    const protocolVersion=method==="server/discover"
      ? "2026-07-28"
      : (supportedVersions.includes(requestedVersion) ? requestedVersion : "2026-07-28");
    return new Response(JSON.stringify({
      jsonrpc:"2.0",
      id,
      result:{
        protocolVersion,
        capabilities:{tools:{listChanged:false}},
        serverInfo:{name:"BI Vella MCP",version:"1.1.0"},
        instructions:"Servidor somente leitura com OAuth 2.1. A entidade é escolhida durante a autorização e todas as ferramentas respeitam as permissões do usuário nessa prefeitura."
      }
    }),{
      status:200,
      headers:{
        "Content-Type":"application/json; charset=utf-8",
        "MCP-Protocol-Version":protocolVersion,
        ...corsHeaders(request,env)
      }
    });
  }

  if (method==="notifications/initialized") {
    return new Response(null,{status:202,headers:corsHeaders(request,env)});
  }

  if (method==="ping") {
    return mcpJsonRpc(request,env,id,{});
  }

  if (method==="tools/list") {
    return mcpJsonRpc(request,env,id,{
      tools:mcpToolDefinitions(credential)
    });
  }

  if (method==="tools/call") {
    const name=String(body.params&&body.params.name||"");
    const args=body.params&&body.params.arguments&&typeof body.params.arguments==="object"
      ? body.params.arguments
      : {};
    try {
      const result=await executeMcpTool(request,env,credential,name,args);
      await writeAuditEvent(env,{
        tenantId:credential.tenant.id,
        actor:credential.label || "MCP "+credential.tokenId,
        category:"mcp",
        action:"tool.call",
        status:"ok",
        subject:name,
        meta:{view:String(args&&args.view||""),tokenId:credential.tokenId}
      });
      return mcpJsonRpc(request,env,id,mcpToolResult(result));
    } catch(error) {
      const code=error&&error.message?error.message:"MCP_TOOL_FAILED";
      await writeAuditEvent(env,{
        tenantId:credential.tenant.id,
        actor:credential.label || "MCP "+credential.tokenId,
        category:"mcp",
        action:"tool.call",
        status:"error",
        subject:name,
        meta:{view:String(args&&args.view||""),code}
      });
      return mcpJsonRpc(request,env,id,{
        content:[{type:"text",text:code}],
        isError:true
      });
    }
  }

  return mcpJsonRpcError(request,env,id,-32601,"Method not found");
}

function publicCatalog(env) {
  const base=baseResourceMap(env);
  return {
    bi:Object.entries(BI_RESOURCES).map(([id,path])=>({id,path})),
    baseConfigured:Object.keys(base).sort()
  };
}

function errorResponse(request,env,error) {
  const code=error && error.message ? error.message : "UNKNOWN_ERROR";
  const statusByCode={
    DASHBOARD_BATCH_PENDING:409,
    DASHBOARD_LOAD_ID_INVALID:400,
    DASHBOARD_CURSOR_INVALID:400,
    TENANT_REQUIRED:400,
    TENANT_NOT_FOUND:403,
    TENANT_USER_ACCESS_NOT_CONFIGURED:503,
    USER_TOKEN_REQUIRED:401,
    ADMIN_REQUIRED:403,
    PAGE_PERMISSION_DENIED:403,
    DATA_RESOURCE_PERMISSION_DENIED:403,
    PAGE_MAPPING_SCOPE_REQUIRED:503,
    PAGE_MAPPING_WRITE_SCOPE_REQUIRED:503,
    PAGE_MAPPING_TOKEN_INVALID:503,
    APPLICATION_SESSION_INVALID:401,
    APPLICATION_SESSION_EXPIRED:401,
    LOGIN_CLIENT_ID_NOT_CONFIGURED:503,
    LOGIN_CLIENT_SECRET_NOT_CONFIGURED:503,
    SESSION_STORE_NOT_CONFIGURED:503,
    AUTH_HANDOFF_REQUIRED:400,
    AUTH_HANDOFF_INVALID:401,
    AUTH_HANDOFF_EXPIRED:401,
    DEV_LOGIN_NOT_CONFIGURED:503,
    DEV_SESSION_SECRET_NOT_CONFIGURED:503,
    DEV_SESSION_REQUIRED:401,
    DEV_SESSION_INVALID:401,
    DEV_SESSION_EXPIRED:401,
    DEV_LOGIN_INVALID:401,
    DEV_LOGIN_USER_INVALID:401,
    DEV_LOGIN_PASSWORD_INVALID:401,
    TENANT_CONTEXT_UNRESOLVED:503,
    SERVICE_LICENSE_SCOPE_REQUIRED:503,
    SERVICE_ACCESS_TOKEN_INVALID:503,
    TENANT_ACCESS_DENIED:403,
    TENANT_ACCESS_NOT_ACCEPTED:403,
    TENANT_ACCESS_EXPIRED:403,
    BI_USER_NOT_AUTHORIZED:403,
    USER_NOT_FOUND:404,
    BI_RESOURCE_NOT_ALLOWED:404,
    BASE_RESOURCE_NOT_CONFIGURED:501,
    BETHA_ACCESS_TOKEN_NOT_CONFIGURED:503,
    INVALID_SOURCE:400,
    DETAIL_RELATION_SOURCE_INCOMPLETE:503,
    TENANT_CONFIG_INVALID:400,
    TENANT_CONFIG_FORBIDDEN:403,
    ORIGIN_FORBIDDEN:403,
    TENANT_CONFIG_KEY_REQUIRED:503,
    DETAIL_RESOURCE_NOT_ALLOWED:404,
    MCP_TOKEN_REQUIRED:401,
    MCP_TOKEN_INVALID:401,
    MCP_TOKEN_EXPIRED:401,
    MCP_VIEW_FORBIDDEN:403,
    MCP_TOOL_NOT_FOUND:404,
    MCP_QUERY_REQUIRED:400
  };
  if (code.startsWith("BETHA_HTTP_") || code.startsWith("PLATFORM_HTTP_")) {
    return json(request,env,error.status===401?401:error.status===403?403:502,{error:code});
  }
  return json(request,env,statusByCode[code]||500,{error:code});
}



const PANEL_PREVIEW_FIELDS=Object.freeze({
  pagamentos:{systemId:"tributos",fields:[
    {id:"dataPagamento",type:"string",dimension:true,filterable:true},
    {id:"valorPago",type:"number",measure:true},
    {id:"id",type:"string",dimension:true,measure:true,filterable:true}
  ]},
  debitos:{systemId:"tributos",fields:[
    {id:"situacao",type:"string",dimension:true,filterable:true},
    {id:"vlLancado",type:"number",measure:true},
    {id:"id",type:"string",dimension:true,measure:true,filterable:true}
  ]}
});
async function panelMultiSystemStatus(env,tenant,auth,system){
  if(!env.AUTH_DB)return {available:false,reason:"LOAD_DB_NOT_CONFIGURED",resources:[]};
  if(!env.BI_SYNC_RAW)return {available:false,reason:"RAW_STORAGE_NOT_CONFIGURED",resources:[]};
  const permitted=PANEL_CACHED_RESOURCE_VIEWS[system]||{};
  const privileged=auth.access?.admin===true||auth.access?.technical===true||auth.tenantAdmin;
  const views=new Set(permissionViewsForAccess(auth.access));
  const rows=await env.AUTH_DB.prepare(
    "SELECT resource,status,loaded,pages,fields_json,updated_at FROM bi_multisystem_loads WHERE tenant_id=? AND system=? ORDER BY resource LIMIT 50"
  ).bind(tenant.id,system).all();
  const resources=(rows.results||[]).filter(row=>
    Object.prototype.hasOwnProperty.call(permitted,row.resource)&&
    (privileged||permitted[row.resource].some(view=>views.has(view)))
  ).map(row=>{
    const profile=parseMultiSystemFieldProfile(row.fields_json);
    return {resource:row.resource,status:row.status,records:Number(row.loaded)||0,
      pages:Number(row.pages)||0,fieldCount:profile.selected.length,updatedAt:row.updated_at};
  });
  return {available:resources.some(item=>item.records>0),resources};
}


// Primeira fonte real do construtor: somente cache R2 existente, nunca consulta Betha.
const PANEL_CACHED_SOURCES=Object.freeze({
 contabil:{
  empenhos:{dimensions:["ano","situacao","dataEmpenho","numero","unidadeOrcamentaria","funcao"],measures:["valor","valorEmpenhado"]},
  "movimentacoes-despesas":{dimensions:["ano","situacao","tipo","unidadeOrcamentaria"],measures:["valor"]},
  "movimentacoes-receitas":{dimensions:["ano","tipo","situacao","unidadeOrcamentaria"],measures:["valor"]}
 },
 compras:{
  "processos-administrativos":{dimensions:["ano","situacao","modalidade","secretaria","formaContratacao"],measures:["valorEstimado","valorHomologado"]}
 },
 folha:{
  remuneracoes:{dimensions:["competencia","evento"],measures:["valor","valorBruto","valorLiquido","descontos","encargos"]}
 }
});
const PANEL_CACHED_RESOURCE_VIEWS=Object.freeze({
 contabil:Object.freeze({
  empenhos:["contabil-empenhos","contabil-despesa","contabil-execucao-orcamentaria"],
  "movimentacoes-despesas":["contabil-movimentos","contabil-despesa"],
  "movimentacoes-receitas":["contabil-movimentos","contabil-receita"]
 }),
 compras:Object.freeze({
  "processos-administrativos":["compras-processos","compras-licitacoes"]
 }),
 folha:Object.freeze({
  remuneracoes:["folha-mensal","folha-despesas"]
 })
});
async function cachedPanelSources(env,tenant,auth,system){
 if(!env.AUTH_DB||!env.BI_SYNC_RAW||!PANEL_CACHED_SOURCES[system])return [];
 const privileged=auth.access?.admin===true||auth.access?.technical===true||auth.tenantAdmin;
 const accessible=new Set(permissionViewsForAccess(auth.access));

 const allowed=PANEL_CACHED_SOURCES[system];
 const results=await env.AUTH_DB.prepare("SELECT resource,loaded,pages,status,fields_json FROM bi_multisystem_loads WHERE tenant_id=? AND system=? ORDER BY resource LIMIT 30").bind(tenant.id,system).all();
 const sources=[];
 for(const state of results.results||[]){
  const spec=allowed[state.resource];
  if(!spec||Number(state.loaded)<=0||Number(state.pages)<=0)continue;
  if(!privileged&&!(PANEL_CACHED_RESOURCE_VIEWS[system]?.[state.resource]||[]).some(view=>accessible.has(view)))continue;
  const selected=new Set(parseMultiSystemFieldProfile(state.fields_json).selected);
  const dimensions=spec.dimensions.filter(id=>selected.has(id)).map(id=>({id,type:"string",dimension:true,filterable:true}));
  const measures=spec.measures.filter(id=>selected.has(id)).map(id=>({id,type:"number",measure:true}));
  if(!dimensions.length||!measures.length)continue;
  sources.push({id:"cache:"+system+":"+state.resource,systemId:system,mode:"cached-real",
   fields:[...dimensions,...measures],availablePages:Math.min(5,Number(state.pages)),loaded:Number(state.loaded),status:state.status});
 }
 return sources;
}
async function previewCachedPanel(env,tenant,auth,system,definition){
 const sources=await cachedPanelSources(env,tenant,auth,system);
 const source=sources.find(x=>x.id===definition?.sourceId);
 if(!source)throw new Error("PANEL_SOURCE_NOT_ALLOWED");
 const spec=source.id.split(":")[2];
 const fields=new Map(source.fields.map(x=>[x.id,x]));
 if(typeof definition.title!=="string"||definition.title.length>120||
 !["bar","line","doughnut","table","kpi"].includes(definition.type)||
 !fields.get(definition.dimension)?.dimension||
 !Array.isArray(definition.measures)||definition.measures.length!==1||
 !Array.isArray(definition.filters)||definition.filters.length>1)throw new Error("INVALID_PANEL_DRAFT");
 for(const filter of definition.filters)if(filter.op!=="eq"||typeof filter.value!=="string"||filter.value.length>120||!fields.get(filter.field)?.filterable)throw new Error("PANEL_FIELD_NOT_ALLOWED");
 const metric=definition.measures[0];
 if(!metric||!["count","sum","avg","min","max"].includes(metric.aggregation)||
 !(metric.field==="*"&&metric.aggregation==="count")&&!fields.get(metric.field)?.measure||
 (metric.field==="*"&&metric.aggregation!=="count"))throw new Error("INVALID_PANEL_DRAFT");
 const groups=new Map();let scanned=0,pagesRead=0;
 for(let page=0;page<source.availablePages&&scanned<500;page++){
  const object=await env.BI_SYNC_RAW.get(multiSystemPageObjectKey(tenant.id,system,spec,page));
  if(!object)break;
  const saved=await object.json();
  if(saved.tenantId!==tenant.id||saved.system!==system||saved.resource!==spec||!Array.isArray(saved.rows))throw new Error("PANEL_CACHE_INVALID");
  pagesRead++;
  for(const row of saved.rows){
   if(scanned>=500)break;
   scanned++;
   if(definition.filters.some(filter=>String(multiSystemSimpleValue(row?.[filter.field])??"")!==filter.value))continue;
   const raw=multiSystemSimpleValue(row?.[definition.dimension]);
   const label=String(raw??"Não informado").slice(0,100);
   if(!groups.has(label)){if(groups.size>=100)continue;groups.set(label,{dimension:label,n:0,sum:0,min:Infinity,max:-Infinity});}
   const bucket=groups.get(label);
   const rawValue=metric.field==="*"?1:multiSystemSimpleValue(row?.[metric.field]);
   if(metric.aggregation==="count"){if(metric.field==="*"||rawValue!=null)bucket.n++;}
   else if(rawValue!==null&&rawValue!==""&&Number.isFinite(Number(rawValue))){
    const value=Number(rawValue);bucket.n++;bucket.sum+=value;bucket.min=Math.min(bucket.min,value);bucket.max=Math.max(bucket.max,value);
   }
  }
 }
 return {source:source.id,mode:"cached-real",partial:true,scanned,pagesRead,
  rows:[...groups.values()].map(v=>({dimension:v.dimension,values:[metric.aggregation==="count"?v.n:!v.n?null:metric.aggregation==="sum"?v.sum:metric.aggregation==="avg"?v.sum/v.n:metric.aggregation==="min"?v.min:v.max]})),
  note:"Prévia parcial limitada a 500 registros e 5 páginas R2; sem requisições à API Betha."};
}
function panelPreviewCatalog(system){
  if(system!=="tributos")return [];
  return Object.entries(PANEL_PREVIEW_FIELDS).map(([id,v])=>({id:"bi:"+id,systemId:v.systemId,fields:v.fields}));
}
async function handlePanelPreview(request,env,url){
  let tenant,auth;
  try{
    tenant=await resolveTenant(env,getTenantId(request,url));
    auth=await authorizeTenant(request,env,tenant);
    const system=String(url.searchParams.get("system")||"");
    if(!["tributos","contabilidade","compras","folha"].includes(system))return json(request,env,400,{error:"INVALID_SYSTEM"});
    if(url.pathname==="/api/panel-builder/source-status"&&request.method==="GET"){
      if(system==="tributos")return json(request,env,200,{system,mode:"authorized-api",available:true,resources:[]});
      const result=await panelMultiSystemStatus(env,tenant,auth,system);
      const sources=await cachedPanelSources(env,tenant,auth,system);
      return json(request,env,200,{system,tenantId:tenant.id,mode:"cached-load",...result,
        previewEnabled:sources.length>0,executionEnabled:false,
        note:"Prévia parcial do cache disponível somente nas fontes e campos autorizados. Consolidação completa ainda não habilitada."});
    }
    if(url.pathname==="/api/panel-builder/catalog"&&request.method==="GET"){
      const sources=panelPreviewCatalog(system).filter(s=>{
        try{requireDataPermission(auth,"bi",s.id.slice(3));return true;}catch{return false;}
      });
      sources.push(...await cachedPanelSources(env,tenant,auth,system));
      return json(request,env,200,{system,tenantId:tenant.id,sources});
    }
    if(url.pathname!=="/api/panel-builder/preview"||request.method!=="POST")return json(request,env,405,{error:"METHOD_NOT_ALLOWED"});
    const raw=await request.text();
    if(raw.length>18000)return json(request,env,413,{error:"PANEL_DRAFT_TOO_LARGE"});
    let body;try{body=JSON.parse(raw);}catch{return json(request,env,400,{error:"INVALID_JSON"});}
    const d=validatePanelDraftPayload(body);
    if(d.sourceId.startsWith("cache:"))return json(request,env,200,await previewCachedPanel(env,tenant,auth,system,d));
    const resource=d.sourceId.slice(3),allowed=PANEL_PREVIEW_FIELDS[resource];
    if(!allowed||system!=="tributos")return json(request,env,403,{error:"PANEL_SOURCE_NOT_ALLOWED"});
    requireDataPermission(auth,"bi",resource);
    const fields=new Map(allowed.fields.map(f=>[f.id,f]));
    if(!fields.get(d.dimension)?.dimension)return json(request,env,400,{error:"PANEL_DIMENSION_NOT_ALLOWED"});
    for(const m of d.measures)if(!(m.field==="*"&&m.aggregation==="count")&&(!fields.get(m.field)?.measure||!["sum","avg","min","max","count"].includes(m.aggregation)))return json(request,env,400,{error:"PANEL_MEASURE_NOT_ALLOWED"});
    for(const filter of d.filters)if(!fields.get(filter.field)?.filterable||filter.op!=="eq")return json(request,env,400,{error:"PANEL_FILTER_NOT_ALLOWED"});
    const payload=await bethaGet(env,tenant,"bi",resource,"limit=500");
    const rows=payloadRows(payload).slice(0,500),buckets=new Map();
    for(const row of rows){
      if(!row||typeof row!=="object")continue;
      if(d.filters.some(filter=>String(row[filter.field]??"")!==filter.value))continue;
      const dim=row[d.dimension],label=dim==null?"Não informado":String(dim).slice(0,160);
      if(!buckets.has(label)){if(buckets.size>=200)break;buckets.set(label,{dimension:label,values:d.measures.map(()=>({n:0,total:0,min:Infinity,max:-Infinity}))});}
      const entry=buckets.get(label);
      d.measures.forEach((m,i)=>{
        const x=m.field==="*"?1:row[m.field],v=entry.values[i];
        if(m.aggregation==="count"){if(m.field==="*"||x!=null)v.n++;return;}
        if(typeof x!=="number"||!Number.isFinite(x))return;
        v.n++;v.total+=x;v.min=Math.min(v.min,x);v.max=Math.max(v.max,x);
      });
    }
    const result=[...buckets.values()].map(x=>({dimension:x.dimension,values:x.values.map((v,i)=>{const op=d.measures[i].aggregation;return op==="count"?v.n:!v.n?null:op==="sum"?v.total:op==="avg"?v.total/v.n:op==="min"?v.min:v.max;})}));
    return json(request,env,200,{rows:result,scanned:rows.length,partial:true,source:d.sourceId,note:"Prévia parcial: somente até 500 registros, sem paginação completa."});
  }catch(err){return errorResponse(request,env,err);}
}

function validatePanelDraftPayload(input){
  if(!input||typeof input!=="object"||Array.isArray(input))throw new Error("INVALID_PANEL_DRAFT");
  const d=input.definition;
  if(!d||typeof d!=="object"||Array.isArray(d))throw new Error("INVALID_PANEL_DRAFT");
  if(typeof d.title!=="string"||!d.title.trim()||d.title.length>120)throw new Error("INVALID_PANEL_DRAFT");
  if(typeof d.sourceId!=="string"||! /^(?:bi:[a-z0-9-]{1,100}|cache:(?:contabil|compras|folha):[a-z0-9-]{1,100})$/.test(d.sourceId))throw new Error("INVALID_PANEL_DRAFT");
  if(!["bar","line","doughnut","table","kpi"].includes(d.type))throw new Error("INVALID_PANEL_DRAFT");
  if(typeof d.dimension!=="string"||!/^[a-zA-Z_][a-zA-Z0-9_.]{0,119}$/.test(d.dimension))throw new Error("INVALID_PANEL_DRAFT");
  if(!Array.isArray(d.measures)||d.measures.length<1||d.measures.length>5)throw new Error("INVALID_PANEL_DRAFT");
  for(const m of d.measures){
    if(!m||typeof m!=="object"||!["sum","avg","min","max","count"].includes(m.aggregation)||!(m.field==="*"&&m.aggregation==="count")&&!/^[a-zA-Z_][a-zA-Z0-9_.]{0,119}$/.test(m.field||""))throw new Error("INVALID_PANEL_DRAFT");
  }
  if(!Array.isArray(d.filters)||d.filters.length>1)throw new Error("INVALID_PANEL_DRAFT");
  for(const filter of d.filters){
    if(!filter||typeof filter!=="object"||Array.isArray(filter)||typeof filter.field!=="string"||
      !/^[a-zA-Z_][a-zA-Z0-9_.]{0,119}$/.test(filter.field)||filter.op!=="eq"||
      typeof filter.value!=="string"||!filter.value.trim()||filter.value.length>120)
      throw new Error("INVALID_PANEL_DRAFT");
  }
  if(JSON.stringify(d).length>16000)throw new Error("PANEL_DRAFT_TOO_LARGE");
  // Persistência de rascunho não implica autorização para consultar a fonte.
  return {title:d.title.trim(),sourceId:d.sourceId,type:d.type,dimension:d.dimension,measures:d.measures.map(m=>({field:m.field,aggregation:m.aggregation})),filters:d.filters.map(f=>({field:f.field,op:"eq",value:f.value.trim()}))};
}
async function authorizePanelDefinition(env,tenant,auth,system,d){
 if(d.sourceId.startsWith("cache:")){
  const sources=await cachedPanelSources(env,tenant,auth,system);
  const source=sources.find(x=>x.id===d.sourceId);
  if(!source)throw new Error("PANEL_SOURCE_NOT_ALLOWED");
  const fields=new Map(source.fields.map(x=>[x.id,x]));
  if(!fields.get(d.dimension)?.dimension||d.measures.length!==1)throw new Error("PANEL_FIELD_NOT_ALLOWED");
  for(const filter of d.filters)if(!fields.get(filter.field)?.filterable||filter.op!=="eq")throw new Error("PANEL_FIELD_NOT_ALLOWED");
  for(const metric of d.measures){
   if(!(metric.field==="*"&&metric.aggregation==="count")&&!fields.get(metric.field)?.measure)throw new Error("PANEL_FIELD_NOT_ALLOWED");
  }
 }else{
  if(system!=="tributos")throw new Error("PANEL_SOURCE_NOT_ALLOWED");
  const resource=d.sourceId.slice(3);
  requireDataPermission(auth,"bi",resource);
  const allowed=PANEL_PREVIEW_FIELDS[resource];
  if(!allowed||!allowed.fields.some(x=>x.id===d.dimension&&x.dimension))throw new Error("PANEL_FIELD_NOT_ALLOWED");
  for(const metric of d.measures){
   if(!(metric.field==="*"&&metric.aggregation==="count")&&!allowed.fields.some(x=>x.id===metric.field&&x.measure))throw new Error("PANEL_FIELD_NOT_ALLOWED");
  }
  for(const filter of d.filters)if(filter.op!=="eq"||!allowed.fields.some(x=>x.id===filter.field&&x.filterable))throw new Error("PANEL_FIELD_NOT_ALLOWED");
 }
}

// D1 já configurado como AUTH_DB; o construtor usa a mesma base quando não
// existe uma ligação BI_PANEL_DB dedicada. Inicialização é idempotente por isolate.
const PANEL_DRAFT_SCHEMA_TASKS=new WeakMap();
async function ensurePanelDraftSchema(db){
  let task=PANEL_DRAFT_SCHEMA_TASKS.get(db);
  if(!task){
    task=(async()=>{
      await db.prepare("CREATE TABLE IF NOT EXISTS bi_panel_drafts (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, system_id TEXT NOT NULL, owner_id TEXT NOT NULL, title TEXT NOT NULL, definition_json TEXT NOT NULL, view_id TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
      const columns=await db.prepare("PRAGMA table_info(bi_panel_drafts)").all();
      const names=new Set((columns.results||[]).map(row=>String(row.name)));
      if(!names.has("view_id")){
        try{await db.prepare("ALTER TABLE bi_panel_drafts ADD COLUMN view_id TEXT NOT NULL DEFAULT ''").run();}
        catch(error){if(!/duplicate column name/i.test(String(error?.message||error)))throw error;}
      }
      if(!names.has("sort_order")){
        try{await db.prepare("ALTER TABLE bi_panel_drafts ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0").run();}
        catch(error){if(!/duplicate column name/i.test(String(error?.message||error)))throw error;}
      }
      await db.prepare("CREATE INDEX IF NOT EXISTS idx_bi_panel_drafts_scope ON bi_panel_drafts(tenant_id,system_id,owner_id,updated_at)").run();
      await db.prepare("CREATE INDEX IF NOT EXISTS idx_bi_panel_drafts_view ON bi_panel_drafts(tenant_id,system_id,owner_id,view_id)").run();
      await db.prepare("CREATE INDEX IF NOT EXISTS idx_bi_panel_sort ON bi_panel_drafts(tenant_id,system_id,owner_id,view_id,sort_order)").run();
    })();
    PANEL_DRAFT_SCHEMA_TASKS.set(db,task);
  }
  try{await task;}catch(error){PANEL_DRAFT_SCHEMA_TASKS.delete(db);throw error;}
}
async function handlePanelDrafts(request,env,url){
  const db=env.BI_PANEL_DB||env.AUTH_DB;
  if(!db)return json(request,env,503,{error:"PANEL_D1_NOT_CONFIGURED"});
  let tenant,auth;
  try{tenant=await resolveTenant(env,getTenantId(request,url));auth=await authorizeTenant(request,env,tenant);}
  catch(err){return errorResponse(request,env,err);}
  const owner=String(auth.userId||"").trim();
  if(!owner)return json(request,env,403,{error:"USER_ID_REQUIRED"});
  const system=String(url.searchParams.get("system")||"");
  if(!/^(tributos|contabilidade|compras|folha)$/.test(system))return json(request,env,400,{error:"INVALID_SYSTEM"});
  try{await ensurePanelDraftSchema(db);}catch(error){console.error("Panel drafts D1 schema",error?.message||error);return json(request,env,503,{error:"PANEL_DRAFT_STORAGE_UNAVAILABLE"});}
  const viewOf=input=>{const view=String(input?.viewId||"");if(view&&!/^[a-z0-9][a-z0-9-]{0,79}$/.test(view))throw new Error("INVALID_PANEL_VIEW");return view;};
  const requirePlacementPermission=view=>{
    if(!view)return;
    if(auth.access?.admin===true||auth.access?.technical===true||auth.tenantAdmin)return;
    const views=permissionViewsForAccess(auth.access);
    const prefix=system==="contabil"?"contabil-":system==="compras"?"compras-":system==="folha"?"folha-":null;
    if(!views.includes(view)||(prefix?!view.startsWith(prefix):!["visao-geral","arrecadacao","debitos","divida","parcelamentos"].includes(view)))throw new Error("PANEL_VIEW_FORBIDDEN");
  };
  const orderOf=input=>{const n=Number(input?.sortOrder??0);if(!Number.isSafeInteger(n)||n<0||n>100000)throw new Error("INVALID_PANEL_ORDER");return n;};
  const itemMatch=url.pathname.match(/^\/api\/panel-drafts\/([0-9a-f-]{36})$/);
  try{
    if(url.pathname==="/api/panel-drafts/reorder"&&request.method==="POST"){
      const raw=await request.text();
      if(raw.length>5000)return json(request,env,413,{error:"ORDER_REQUEST_TOO_LARGE"});
      let data;try{data=JSON.parse(raw);}catch{return json(request,env,400,{error:"INVALID_JSON"});}
      const viewId=viewOf(data);
      requirePlacementPermission(viewId);
      const ids=data?.ids;
      if(!viewId||!Array.isArray(ids)||ids.length>100||ids.length<1||new Set(ids).size!==ids.length||ids.some(id=>typeof id!=="string"||!/^[0-9a-f-]{36}$/.test(id)))return json(request,env,400,{error:"INVALID_PANEL_ORDER"});
      const existing=await db.prepare("SELECT id FROM bi_panel_drafts WHERE tenant_id=? AND system_id=? AND owner_id=? AND view_id=?").bind(tenant.id,system,owner,viewId).all();
      const all=(existing.results||[]).map(r=>r.id);
      if(all.length!==ids.length||all.some(id=>!ids.includes(id)))return json(request,env,409,{error:"PANEL_ORDER_CONFLICT"});
      const queries=ids.map((id,index)=>db.prepare("UPDATE bi_panel_drafts SET sort_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND tenant_id=? AND system_id=? AND owner_id=? AND view_id=?").bind(index+1,id,tenant.id,system,owner,viewId));
      await db.batch(queries);
      return json(request,env,200,{ok:true,viewId,ordered:ids.length});
    }
    if(request.method==="GET"&&!itemMatch){
      const data=await db.prepare("SELECT id, title, definition_json, view_id, sort_order, created_at, updated_at FROM bi_panel_drafts WHERE tenant_id=? AND system_id=? AND owner_id=? ORDER BY updated_at DESC LIMIT 100").bind(tenant.id,system,owner).all();
      return json(request,env,200,{items:(data.results||[]).map(r=>({id:r.id,title:r.title,definition:JSON.parse(r.definition_json),viewId:r.view_id||"",sortOrder:Number(r.sort_order)||0,createdAt:r.created_at,updatedAt:r.updated_at}))});
    }
    if(request.method==="POST"&&!itemMatch){
      const raw=await request.text();
      if(raw.length>18000)return json(request,env,413,{error:"PANEL_DRAFT_TOO_LARGE"});
      let data;try{data=JSON.parse(raw);}catch{return json(request,env,400,{error:"INVALID_JSON"});}
      const d=validatePanelDraftPayload(data),id=crypto.randomUUID(),viewId=viewOf(data),sortOrder=orderOf(data);
      requirePlacementPermission(viewId);
      await authorizePanelDefinition(env,tenant,auth,system,d);
      await db.prepare("INSERT INTO bi_panel_drafts(id,tenant_id,system_id,owner_id,title,definition_json,view_id,sort_order) VALUES(?,?,?,?,?,?,?,?)").bind(id,tenant.id,system,owner,d.title,JSON.stringify(d),viewId,sortOrder).run();
      return json(request,env,201,{id,title:d.title,definition:d,viewId,sortOrder});
    }
    if(itemMatch&&request.method==="DELETE"){
      const result=await db.prepare("DELETE FROM bi_panel_drafts WHERE id=? AND tenant_id=? AND system_id=? AND owner_id=?").bind(itemMatch[1],tenant.id,system,owner).run();
      return json(request,env,result.meta?.changes?200:404,result.meta?.changes?{deleted:true}:{error:"NOT_FOUND"});
    }
    if(itemMatch&&request.method==="PUT"){
      const raw=await request.text();
      if(raw.length>18000)return json(request,env,413,{error:"PANEL_DRAFT_TOO_LARGE"});
      let data;try{data=JSON.parse(raw);}catch{return json(request,env,400,{error:"INVALID_JSON"});}
      const d=validatePanelDraftPayload(data),viewId=viewOf(data),sortOrder=orderOf(data);
      requirePlacementPermission(viewId);
      await authorizePanelDefinition(env,tenant,auth,system,d);
      const result=await db.prepare("UPDATE bi_panel_drafts SET title=?,definition_json=?,view_id=?,sort_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND tenant_id=? AND system_id=? AND owner_id=?").bind(d.title,JSON.stringify(d),viewId,sortOrder,itemMatch[1],tenant.id,system,owner).run();
      return json(request,env,result.meta?.changes?200:404,result.meta?.changes?{id:itemMatch[1],definition:d,viewId,sortOrder}:{error:"NOT_FOUND"});
    }
    return json(request,env,405,{error:"METHOD_NOT_ALLOWED"});
  }catch(err){
    if(["INVALID_PANEL_DRAFT","FILTER_DRAFTS_NOT_ENABLED","PANEL_DRAFT_TOO_LARGE","INVALID_PANEL_VIEW","INVALID_PANEL_ORDER","PANEL_FIELD_NOT_ALLOWED","PANEL_SOURCE_NOT_ALLOWED","PANEL_VIEW_FORBIDDEN"].includes(err.message))return json(request,env,err.message==="PANEL_VIEW_FORBIDDEN"||err.message==="PANEL_SOURCE_NOT_ALLOWED"||err.message==="PANEL_FIELD_NOT_ALLOWED"?403:400,{error:err.message});
    return json(request,env,503,{error:"PANEL_DRAFT_STORAGE_UNAVAILABLE"});
  }
}

export default {
  async scheduled(event,env,ctx){ctx.waitUntil(Promise.allSettled([runBackgroundSync(env),runMultiSystemBootstrap(env)]));},
  async fetch(request,env) {
    const url=new URL(request.url);
    if (request.method==="OPTIONS") return new Response(null,{status:204,headers:corsHeaders(request,env)});
    if (url.pathname==="/api/panel-builder/catalog" || url.pathname==="/api/panel-builder/preview" || url.pathname==="/api/panel-builder/source-status") return handlePanelPreview(request,env,url);
    if (url.pathname==="/api/panel-drafts" || url.pathname==="/api/panel-drafts/reorder" || /^\/api\/panel-drafts\/[0-9a-f-]{36}$/.test(url.pathname)) return handlePanelDrafts(request,env,url);

    if (url.pathname==="/.well-known/oauth-authorization-server" && request.method==="GET") {
      return json(request,env,200,mcpOAuthMetadata(request,env));
    }

    if (url.pathname==="/.well-known/oauth-protected-resource" && request.method==="GET") {
      const resource=new URL("/mcp",request.url).toString();
      return json(request,env,200,{
        resource,
        authorization_servers:[mcpOAuthIssuer(request,env)],
        scopes_supported:[MCP_OAUTH_SCOPE],
        bearer_methods_supported:["header"],
        resource_documentation:"https://github.com/uelitonbueno-creator/betha/blob/main/docs/mcp-production.md"
      });
    }

    if (url.pathname==="/oauth/register" && request.method==="POST") {
      try { return await mcpOAuthRegisterClient(request,env); }
      catch(error) { return errorResponse(request,env,error); }
    }

    if (url.pathname==="/oauth/authorize" && request.method==="GET") {
      try { return await mcpOAuthAuthorize(request,env); }
      catch(error) {
        console.error("mcp oauth authorize",error);
        return json(request,env,400,{error:"server_error"});
      }
    }

    if (url.pathname==="/oauth/token" && request.method==="POST") {
      try { return await mcpOAuthToken(request,env); }
      catch(error) {
        console.error("mcp oauth token",error);
        return json(request,env,400,{error:"server_error"});
      }
    }

    if (url.pathname==="/oauth/tenant-select" && request.method==="GET") {
      try { return await mcpOAuthTenantSelectPage(request,env); }
      catch(error) {
        console.error("mcp oauth tenant page",error);
        return json(request,env,400,{error:"server_error"});
      }
    }

    if (url.pathname==="/oauth/tenant-select" && request.method==="POST") {
      try { return await mcpOAuthTenantSelectSubmit(request,env); }
      catch(error) {
        console.error("mcp oauth tenant select",error);
        return json(request,env,400,{error:"server_error"});
      }
    }

    if (url.pathname==="/api/mcp/introspect" && request.method==="POST") {
      try { return await mcpOAuthIntrospect(request,env); }
      catch(error) {
        console.error("mcp introspection",error);
        return json(request,env,401,{active:false,error:"invalid_token"});
      }
    }

    if (url.pathname==="/api/health" && request.method==="GET") {
      return json(request,env,200,{
        ok:true,
        buildVersion:"2026-10-07-worker-persistence-v93",
        progressiveDashboards:true,
        dashboardAggregatePublic:false,
        dashboardAuthorization:"betha-session+tenant+page-permission",
        detailAuthorization:"betha-session+tenant+resource-permission",
        dataAuthorization:"betha-session+tenant+source-resource-permission",
        securityAudit:"blocked-permission-events-30d",
        auditPersistence:env.AUTH_DB?"d1-primary+kv-mirror":"kv-fallback",
        securityAnomalyDetection:"10m:attention>=5,high>=10,no-auto-block",
        securityExecutiveSummary:"current-vs-previous-window+top-surface+top-target",
        auditProductivity:"client-filtering+sanitized-csv-export",
        auditHistory:"paginated-kv-index+load-more-up-to-1000",
        biApiBase:env.BETHA_BI_API_BASE || BI_BASE_DEFAULT,
        accessTokenConfigured:Boolean(env.BETHA_ACCESS_TOKEN),
        tenantsConfigured:Boolean(env.BETHA_TENANTS_JSON),
        userAuthorizationRequired:String(env.ALLOW_UNAUTHENTICATED_DEV || "").toLowerCase()!=="true",
        loginCredentialConfigured:Boolean(env.BETHA_LOGIN_CLIENT_ID && env.BETHA_LOGIN_CLIENT_SECRET),
        loginClientIdConfigured:Boolean(env.BETHA_LOGIN_CLIENT_ID),
        loginClientSecretConfigured:Boolean(env.BETHA_LOGIN_CLIENT_SECRET),
        loginRedirectUri:env.BETHA_LOGIN_REDIRECT_URI || LOGIN_REDIRECT_DEFAULT,
        frontUrl:env.BETHA_FRONT_URL || FRONT_URL_DEFAULT,
        sameOriginApp:true,
        sessionStoreConfigured:Boolean(env.AUTH_DB||env.AUTH_SESSIONS||env.BI_SESSIONS),
        supabaseCacheConfigured:Boolean(env.SUPABASE_CACHE_KEY),
        devLoginConfigured:Boolean(env.BI_DEV_LOGIN_USER && env.BI_DEV_LOGIN_PASSWORD),
        mcpEnabled:true,
        mcpEndpoint:"/mcp",
        mcpAuthentication:"oauth2.1+legacy-opaque-bearer",
        mcpOAuthIssuer:mcpOAuthIssuer(request,env),
        mcpOAuthDiscovery:"/.well-known/oauth-authorization-server",
        mcpProtectedResourceDiscovery:"/.well-known/oauth-protected-resource",
        mcpRegistrationEndpoint:"/oauth/register",
        mcpAuthorizationEndpoint:"/oauth/authorize",
        mcpTokenEndpoint:"/oauth/token",
        mcpIntrospectionEndpoint:"/api/mcp/introspect"
      });
    }

    if (url.pathname==="/api/auth/session-check" && request.method==="GET") {
      await authTrace(env,"SESSION_CHECK_START",{});
      try {
        const userToken=await getUserToken(request,env);
        if (!userToken) throw new Error("USER_TOKEN_REQUIRED");
        return json(request,env,200,{
          ok:true,
          sessionValid:true
        });
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/auth/logout" && request.method==="GET") {
      await destroyStoredSession(request,env);

      const target=new URL(request.url);
      target.pathname="/";
      target.search="";
      target.hash="";

      return new Response(null,{
        status:302,
        headers:{
          "Location":target.toString(),
          "Set-Cookie":sessionCookieHeader("",0),
          "Cache-Control":"no-store"
        }
      });
    }

    if (url.pathname==="/api/dev/login" && request.method==="POST") {
      try {
        if (!env.BI_DEV_LOGIN_USER || !env.BI_DEV_LOGIN_PASSWORD) {
          throw new Error("DEV_LOGIN_NOT_CONFIGURED");
        }

        const body=await request.json().catch(()=>({}));
        const username=normalizeDevCredential(body.username).toLowerCase();
        const password=normalizeDevCredential(body.password);

        const expectedUser=normalizeDevCredential(env.BI_DEV_LOGIN_USER).toLowerCase();
        const expectedPassword=normalizeDevCredential(env.BI_DEV_LOGIN_PASSWORD);

        if (username!==expectedUser) {
          throw new Error("DEV_LOGIN_USER_INVALID");
        }
        if (password!==expectedPassword) {
          throw new Error("DEV_LOGIN_PASSWORD_INVALID");
        }

        const session=await createDevSession(env,username);
        return json(request,env,200,{
          ok:true,
          session,
          expires_in:8*60*60
        });
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/dev/session-check" && request.method==="GET") {
      try {
        const session=await validateDevSession(request,env);
        return json(request,env,200,{
          ok:true,
          sessionValid:true,
          username:session.username || ""
        });
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/auth/login" && request.method==="GET") {
      await authTrace(env,"LOGIN_START",{path:url.pathname});
      if (!env.BETHA_LOGIN_CLIENT_ID) {
        return json(request,env,503,{error:"LOGIN_CLIENT_ID_NOT_CONFIGURED"});
      }
      if (!env.BETHA_LOGIN_CLIENT_SECRET) {
        return json(request,env,503,{error:"LOGIN_CLIENT_SECRET_NOT_CONFIGURED"});
      }

      const state=await createOAuthState(env.BETHA_LOGIN_CLIENT_SECRET);

      const authorize=new URL(OAUTH_AUTHORIZE_URL);
      authorize.searchParams.set("response_type","code");
      authorize.searchParams.set("client_id",env.BETHA_LOGIN_CLIENT_ID);
      authorize.searchParams.set("redirect_uri",env.BETHA_LOGIN_REDIRECT_URI || LOGIN_REDIRECT_DEFAULT);
      // No Authorization Code de credencial de servidor, os escopos devem estar
      // vinculados à credencial no Studio Betha. Só envia "scopes" quando
      // explicitamente configurado no Worker.
      const requestedScopes=String(env.BETHA_LOGIN_SCOPES || "").trim();
      if (requestedScopes) authorize.searchParams.set("scopes",requestedScopes);
      authorize.searchParams.set("state",state);

      return new Response(null,{
        status:302,
        headers:{
          "Location":authorize.toString(),
          "Cache-Control":"no-store"
        }
      });
    }

    if (url.pathname==="/api/auth/callback" && request.method==="GET") {
      await authTrace(env,"CALLBACK_RECEIVED",{hasCode:Boolean(url.searchParams.get("code")),hasState:Boolean(url.searchParams.get("state")),hasError:Boolean(url.searchParams.get("error"))});
      const front=env.BETHA_FRONT_URL || FRONT_URL_DEFAULT;
      const error=url.searchParams.get("error");
      const code=url.searchParams.get("code");
      const state=url.searchParams.get("state");

      if (error) {
        const target=new URL(request.url);
        target.pathname="/";
        target.search="";
        target.searchParams.set("auth_error",error);
        return Response.redirect(target.toString(),302);
      }

      try {
        if (!env.BETHA_LOGIN_CLIENT_ID) {
          throw new Error("LOGIN_CLIENT_ID_NOT_CONFIGURED");
        }
        if (!env.BETHA_LOGIN_CLIENT_SECRET) {
          throw new Error("LOGIN_CLIENT_SECRET_NOT_CONFIGURED");
        }
        if (!code || !state) throw new Error("OAUTH_CALLBACK_INCOMPLETE");

        await validateOAuthState(state,env.BETHA_LOGIN_CLIENT_SECRET);

        const form=new URLSearchParams();
        form.set("grant_type","authorization_code");
        form.set("client_id",env.BETHA_LOGIN_CLIENT_ID);
        form.set("client_secret",env.BETHA_LOGIN_CLIENT_SECRET);
        form.set("code",code);
        form.set("redirect_uri",env.BETHA_LOGIN_REDIRECT_URI || LOGIN_REDIRECT_DEFAULT);

        const oauthResponse=await fetch(OAUTH_TOKEN_URL,{
          method:"POST",
          headers:{"Content-Type":"application/x-www-form-urlencoded","Accept":"application/json"},
          body:form
        });
        const parsed=await readJsonResponse(oauthResponse);

        if (!oauthResponse.ok || !parsed.body || !parsed.body.access_token) {
          console.error("server oauth exchange",oauthResponse.status,parsed.body);
          throw new Error("OAUTH_TOKEN_EXCHANGE_FAILED");
        }

        const returnedScope=String(parsed.body.scope || parsed.body.scopes || "");
        await authTrace(env,"TOKEN_OK",{
          expiresIn:Number(parsed.body.expires_in || parsed.body.expires || 0),
          userAccountsScope:returnedScope.includes("user-accounts.suite"),
          licensesScope:returnedScope.includes("licenses.suite"),
          scopeReported:Boolean(returnedScope)
        });

        const oauthSeconds=Number(parsed.body.expires_in || parsed.body.expires || 0);
        const sessionSeconds=oauthSeconds>0 ? Math.min(oauthSeconds,8*60*60) : 8*60*60;

        const mcpLoginStateRaw=(env.BI_SESSIONS||env.AUTH_SESSIONS)
          ? await mcpOAuthStore(env).get(MCP_OAUTH_LOGIN_STATE_PREFIX+state)
          : null;
        if(mcpLoginStateRaw){
          let mcpLoginState=null;
          try { mcpLoginState=JSON.parse(mcpLoginStateRaw); } catch {}
          await mcpOAuthStore(env).delete(MCP_OAUTH_LOGIN_STATE_PREFIX+state);
          const flowId=mcpLoginState&&mcpLoginState.flowId ? String(mcpLoginState.flowId) : "";
          const flowRaw=flowId ? await mcpOAuthStore(env).get(MCP_OAUTH_FLOW_PREFIX+flowId) : null;
          let flow=null;
          try { flow=flowRaw?JSON.parse(flowRaw):null; } catch {}
          if(!flow || flow.kind!=="mcp-oauth-flow") throw new Error("MCP_OAUTH_FLOW_EXPIRED");

          const storedMcpSession=await createStoredSession(env,parsed.body.access_token,sessionSeconds);
          const next=await mcpOAuthContinueAuthorization(request,env,flowId,parsed.body.access_token);
          const headers=new Headers(next.headers);
          headers.set("Set-Cookie",sessionCookieHeader(storedMcpSession.sid,storedMcpSession.ttl));
          return new Response(next.body,{status:next.status,statusText:next.statusText,headers});
        }

        const stored=await createStoredSession(
          env,
          parsed.body.access_token,
          sessionSeconds
        );

        await authTrace(env,"KV_SESSION_SAVED",{sidLength:stored.sid.length,ttl:stored.ttl});

        const appUrl=new URL(request.url);
        appUrl.pathname="/";
        appUrl.search="";
        appUrl.hash="";

        return new Response(null,{
          status:302,
          headers:{
            "Location":appUrl.toString(),
            "Set-Cookie":sessionCookieHeader(stored.sid,stored.ttl),
            "Cache-Control":"no-store"
          }
        });
      } catch(authError) {
        await authTrace(env,"CALLBACK_ERROR",{code:authError && authError.message ? authError.message : "AUTH_CALLBACK_FAILED"});
        console.error("oauth callback",authError);
        const target=new URL(request.url);
        target.pathname="/";
        target.search="";
        target.searchParams.set("auth_error",authError.message || "AUTH_CALLBACK_FAILED");
        return Response.redirect(target.toString(),302);
      }
    }

    if (url.pathname==="/api/auth/session-exchange" && request.method==="POST") {
      try {
        if (!env.BETHA_LOGIN_CLIENT_SECRET) throw new Error("LOGIN_CLIENT_SECRET_NOT_CONFIGURED");

        const body=await request.json().catch(()=>({}));
        const handoff=String(body.handoff || "").trim();
        if (!handoff) return json(request,env,400,{error:"AUTH_HANDOFF_REQUIRED"});

        const payload=await openSession(handoff,env.BETHA_LOGIN_CLIENT_SECRET);
        if (!payload || payload.kind!=="auth-handoff" || !payload.accessToken) {
          return json(request,env,401,{error:"AUTH_HANDOFF_INVALID"});
        }

        const oauthExp=Number(payload.oauthExp || 0);
        const remaining=oauthExp>0
          ? Math.floor((oauthExp-Date.now())/1000)
          : 8*60*60;

        if (remaining<=0) {
          return json(request,env,401,{error:"AUTH_HANDOFF_EXPIRED"});
        }

        const sessionSeconds=Math.max(60,Math.min(remaining,8*60*60));
        const session=await sealSession({
          kind:"user-session",
          accessToken:payload.accessToken,
          exp:Date.now()+sessionSeconds*1000
        },env.BETHA_LOGIN_CLIENT_SECRET);

        return json(request,env,200,{
          ok:true,
          session,
          expires_in:sessionSeconds
        });
      } catch(error) {
        const code=error && error.message ? error.message : "AUTH_HANDOFF_INVALID";
        if (code==="APPLICATION_SESSION_EXPIRED") {
          return json(request,env,401,{error:"AUTH_HANDOFF_EXPIRED"});
        }
        if (code==="APPLICATION_SESSION_INVALID") {
          return json(request,env,401,{error:"AUTH_HANDOFF_INVALID"});
        }
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/auth/exchange" && request.method==="POST") {
      try {
        const body=await request.json();
        const code=String(body.code||"").trim();
        const verifier=String(body.codeVerifier||"").trim();
        const state=String(body.state||"").trim();

        if (!code || !verifier) {
          return json(request,env,400,{error:"AUTH_EXCHANGE_MISSING_DATA"});
        }
        if (verifier.length < 43 || verifier.length > 128) {
          return json(request,env,400,{error:"PKCE_VERIFIER_INVALID"});
        }

        const form=new URLSearchParams();
        form.set("grant_type","authorization_code");
        form.set("client_id",BROWSER_CLIENT_ID);
        form.set("code_verifier",verifier);
        form.set("code",code);
        form.set("redirect_uri",BROWSER_REDIRECT_URI);
        form.set("scope",BROWSER_SCOPES);

        const oauthResponse=await fetch(OAUTH_TOKEN_URL,{
          method:"POST",
          headers:{"Content-Type":"application/x-www-form-urlencoded","Accept":"application/json"},
          body:form
        });

        const parsed=await readJsonResponse(oauthResponse);
        if (!oauthResponse.ok) {
          console.error("oauth exchange",oauthResponse.status,parsed.body);
          return json(request,env,oauthResponse.status,{
            error:"OAUTH_TOKEN_EXCHANGE_FAILED",
            status:oauthResponse.status,
            detail:parsed.body && typeof parsed.body==="object"
              ? (parsed.body.error_description || parsed.body.error || null)
              : null
          });
        }

        if (!parsed.body || !parsed.body.access_token) {
          return json(request,env,502,{error:"OAUTH_TOKEN_MISSING"});
        }

        return json(request,env,200,{
          access_token:parsed.body.access_token,
          token_type:parsed.body.token_type || "bearer",
          expires_in:parsed.body.expires_in ?? parsed.body.expires ?? 0,
          scope:parsed.body.scope || "",
          state
        });
      } catch(error) {
        console.error("auth exchange",error);
        return json(request,env,500,{error:"AUTH_EXCHANGE_INTERNAL_ERROR"});
      }
    }

    if (url.pathname==="/api/auth/session-check" && request.method==="GET") {
      try {
        const userToken=await getUserToken(request,env);
        if (!userToken) throw new Error("USER_TOKEN_REQUIRED");

        // Valida também se o token Betha continua aceito, sem retornar dados pessoais.
        const accesses=await getUserAccesses(userToken);
        return json(request,env,200,{
          ok:true,
          sessionValid:true,
          accessCount:Array.isArray(accesses)?accesses.length:0
        });
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if(url.pathname==='/api/admin/sync'&&['GET','POST','PUT'].includes(request.method)){
      try{
        const tenant=await resolveTenant(env,url.searchParams.get('entity')||getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);requireTenantConfigAdmin(auth);
        const config=await syncConfig(env,tenant);
        if(request.method==='POST'){const job=await beginSync(env,tenant,config);return json(request,env,202,{job:publicSyncJob(job),config:{...config,enabled:true}});}
        if(request.method==='PUT'){const body=await request.json();const interval=Number(body.intervalMinutes);if(!SYNC_INTERVALS.includes(interval))throw new Error('TENANT_CONFIG_INVALID');const next={...config,intervalMinutes:interval,enabled:config.enabled,nextRunAt:interval?new Date(Date.now()+interval*60000).toISOString():null};await env.BI_SESSIONS.put(await syncScope(tenant)+':config',JSON.stringify(next));return json(request,env,200,{config:next});}
        return json(request,env,200,{config,job:config.activeJob?publicSyncJob(await syncJob(env,tenant,config.activeJob)):null});
      }catch(error){return errorResponse(request,env,error);}
    }

    if(url.pathname.startsWith("/api/admin/entities") && ["GET","POST","PUT"].includes(request.method)) {
      try {
        if(!["/api/admin/entities","/api/admin/entities/test"].includes(url.pathname)) return json(request,env,404,{error:"NOT_FOUND"});
        const current=await resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,current);
        requireTenantConfigAdmin(auth);
        if(!env.AUTH_DB&&!env.BI_SESSIONS) throw new Error("SESSION_STORE_NOT_CONFIGURED");
        const registry=await tenantRegistry(env);
        // Reaching this route already requires BIConfiguracoesPage plus
        // administrator/technical profile in the authenticated current tenant.
        // Do not make the configuration screen depend on a second @me/access
        // call for every municipality: that upstream call can return 503 and
        // used to block both listing and onboarding a new entity.
        if(request.method==="GET") {
          if(url.pathname!=="/api/admin/entities") return json(request,env,405,{error:"METHOD_NOT_ALLOWED"});
          const entities=Object.entries(registry).map(([id,config])=>publicTenantConfig(id,config,env));
          const response=json(request,env,200,{entities});
          response.headers.set("Cache-Control","no-store");
          return response;
        }
        const origin=request.headers.get("Origin");
        if(origin&&!corsHeaders(request,env)["Access-Control-Allow-Origin"]) throw new Error("ORIGIN_FORBIDDEN");
        if(!/^application\/json(?:;|$)/i.test(request.headers.get("Content-Type")||"")) throw new Error("TENANT_CONFIG_INVALID");
        const text=await request.text();
        if(text.length>20000) throw new Error("TENANT_CONFIG_INVALID");
        let input; try {input=JSON.parse(text);} catch {throw new Error("TENANT_CONFIG_INVALID");}
        const previous=Object.hasOwn(registry,String(input.id||""))?registry[String(input.id)]:{};
        // Existing entities may be maintained by a BI configuration admin.
        // Candidate Betha credentials are always validated below before any
        // configuration is persisted, so invalid context cannot replace a
        // working entity.
        const {id,config}=validateTenantConfig(input,previous);
        const candidate={id,...config,accessToken:config.accessToken||env.BETHA_ACCESS_TOKEN||""};
        // Test before persistence: invalid credentials never replace a working configuration.
        await bethaGet(env,candidate,"bi","contribuintes","limit=1&fields=id");
        if(url.pathname.endsWith("/test")) return json(request,env,200,{ok:true,message:"Conexão Betha validada."});
        config.updatedAt=new Date().toISOString();
        await persistTenantConfig(env,id,config);
        await rememberBiTenantAdmin(env,id,auth);
        await writeAuditEvent(env,{tenantId:current.id,actor:auditActorLabel(auth.access),category:"configuration",action:"entity.save",subject:id,meta:{enabled:config.enabled,entityId:config.entityId,databaseId:config.databaseId}});
        return json(request,env,200,{ok:true,entity:publicTenantConfig(id,config,env)});
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/cache/snapshot" && request.method==="POST") {
      try {
        const tenant=await resolveTenant(env,getTenantId(request,url));
        await authorizeTenant(request,env,tenant);
        const body=await request.json();
        const result=await persistSupabaseCache(env,body);
        return json(request,env,200,result);
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    const apiPanelMatch=url.pathname.match(/^\/api\/panels\/(bi|base)\/([a-z0-9-]+)(?:\/detail\/(p[0-9]+))?$/);
    if(apiPanelMatch&&request.method==="GET") {
      try {
        const tenant=await resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        const body=await buildApiPanels(env,tenant,auth,apiPanelMatch[1]+":"+apiPanelMatch[2],url,apiPanelMatch[3]||null);
        return json(request,env,200,body);
      } catch(error) {return errorResponse(request,env,error);}
    }

    const homeMatch=url.pathname.match(/^\/api\/home(?:\/([a-z-]+))?$/);
    if(homeMatch&&request.method==="GET") {
      try {
        const tenant=await resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        const body=homeMatch[1]?await buildHomeGroupSummary(env,tenant,auth,homeMatch[1]):{groups:homeCatalog(auth)};
        return json(request,env,200,body);
      } catch(error) {return errorResponse(request,env,error);}
    }

    const overviewPartMatch=url.pathname.match(/^\/api\/dashboard\/visao-geral\/part\/([a-z0-9-]+)$/);
    if (overviewPartMatch && request.method==="GET") {
      let tenant=null;
      let auth=null;
      try {
        tenant=await resolveTenant(env,getTenantId(request,url));
        auth=await authorizeTenant(request,env,tenant);
        requireViewPermission(auth,"visao-geral");
        const body=await buildOverviewPart(env,tenant,url,overviewPartMatch[1]);
        return json(request,env,200,body);
      } catch(error) {
        if (error&&error.message==="PAGE_PERMISSION_DENIED") {
          await writeSecurityDenial(env,tenant,auth,{
            surface:"dashboard-part",
            subject:"visao-geral",
            code:error.message,
            view:"visao-geral",
            part:overviewPartMatch[1]
          });
        }
        return errorResponse(request,env,error);
      }
    }

    const dashboardMatch=url.pathname.match(/^\/api\/dashboard\/([a-z0-9-]+)$/);
    if (dashboardMatch && request.method==="GET") {
      let tenant=null;
      let auth=null;
      const view=dashboardMatch[1];
      try {
        tenant=await resolveTenant(env,getTenantId(request,url));
        auth=await authorizeTenant(request,env,tenant);
        requireViewPermission(auth,view);

        // Dashboard autorizado por sessão Betha + contexto entity/database
        // + permissão funcional do Page Mapping.
        // O navegador recebe apenas agregados do tenant validado.
        const builder=dashboardBuilder(view);
        if (!builder) return json(request,env,501,{error:"DASHBOARD_NOT_IMPLEMENTED",view});

        let dashboardEnv=env;
        if (url.searchParams.get("progressive")==="1" && view!=="visao-geral") {
          if (!env.AUTH_DB&&!env.BI_SESSIONS) throw new Error("SESSION_STORE_NOT_CONFIGURED");
          const loadId=url.searchParams.get("loadId")||"";
          if (!/^[a-f0-9-]{36}$/i.test(loadId)) throw new Error("DASHBOARD_LOAD_ID_INVALID");
          const cursorText=url.searchParams.get("cursor")||"{}";
          if (cursorText.length>5000) throw new Error("DASHBOARD_CURSOR_INVALID");
          let expected;
          try { expected=JSON.parse(cursorText); } catch { throw new Error("DASHBOARD_CURSOR_INVALID"); }
          if (!expected||Array.isArray(expected)||typeof expected!=="object"||
              Object.values(expected).some(value=>!Number.isInteger(value)||value<0)) {
            throw new Error("DASHBOARD_CURSOR_INVALID");
          }
          const scope=await sha256Hex(JSON.stringify([tenant.id,tenant.userAccess,auth.context.database,auth.context.entity]));
          const sourceFilters={};
          if(view==="debitos"){
            const exercise=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
            const period=url.searchParams.get("periodo")||"ano";
            if(Number.isInteger(exercise)&&exercise>=1900&&exercise<=2200&&period!=="todos"){
              sourceFilters["bi:debitos"]=period==="12m"
                ? "ano >= "+String(exercise-1)
                : "ano = "+String(exercise);
            }
          }
          dashboardEnv={...env,BI_DASHBOARD_LOAD:{
            prefix:"dashboard-batch:v2:"+scope+":"+loadId,
            expected,cursors:{},hasMore:false,pending:new Map(),sourceFilters
          }};
        }
        const body=await builder(dashboardEnv,tenant,url);
        if (dashboardEnv.BI_DASHBOARD_LOAD) {
          const load=dashboardEnv.BI_DASHBOARD_LOAD;
          body.loading={hasMore:load.hasMore,cursor:load.cursors};
          body.meta.auditMode="PROGRESSIVE";
        }
        return json(request,env,200,body);
      } catch(error) {
        if (error&&error.message==="PAGE_PERMISSION_DENIED") {
          await writeSecurityDenial(env,tenant,auth,{
            surface:"dashboard",
            subject:view,
            code:error.message,
            view
          });
        }
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/search" && request.method==="GET") {
      try {
        const query=String(url.searchParams.get("q")||"").trim();
        if(query.length<2) return json(request,env,400,{error:"SEARCH_QUERY_REQUIRED"});
        const tenant=await resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        const result=await buildGlobalSearch(env,tenant,auth,url);
        return json(request,env,200,result);
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    const detailMatch=url.pathname.match(/^\/api\/detail\/([^/]+)$/);
    if (detailMatch && request.method==="GET") {
      let tenant=null;
      let auth=null;
      const resource=decodeURIComponent(detailMatch[1]);
      try {
        tenant=await resolveTenant(env,getTenantId(request,url));
        auth=await authorizeTenant(request,env,tenant);
        requireDetailPermission(auth,resource);
        const result=await buildDetailPage(env,tenant,resource,url,{ownerNames:permissionViewsForAccess(auth.access).includes("imobiliario")});
        return json(request,env,200,result);
      } catch(error) {
        if (error&&error.message==="PAGE_PERMISSION_DENIED") {
          await writeSecurityDenial(env,tenant,auth,{
            surface:"detail",
            subject:resource,
            code:error.message,
            resource
          });
        }
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/catalog" && request.method==="GET") {
      return json(request,env,200,publicCatalog(env));
    }

    // Teste de credencial de serviço: consulta mínima e não devolve dados cadastrais.
    if (url.pathname==="/api/connection-test" && request.method==="GET") {
      try {
        await validateDevSession(request,env);
        const tenant=await resolveTenant(env,getTenantId(request,url));
        const body=await bethaGet(env,tenant,"bi","contribuintes","limit=1&fields=id");
        return json(request,env,200,{
          ok:true,
          bethaAuthenticated:true,
          tenant:tenant.id,
          sampleReturned:body && Array.isArray(body.content) ? body.content.length : 0
        });
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/me/access" && request.method==="GET") {
      try {
        const accesses=await getUserAccesses(await getUserToken(request,env));
        return json(request,env,200,{accesses});
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/me/tenants" && request.method==="GET") {
      await authTrace(env,"TENANTS_START",{cookiePresent:Boolean(readCookie(request,SESSION_COOKIE))});

      try {
        const userToken=await getUserToken(request,env);
        if (!userToken) throw new Error("USER_TOKEN_REQUIRED");
        await authTrace(env,"TENANTS_TOKEN_OK",{});

        // Consulta os acessos Betha uma única vez e cruza no backend com cada
        // tenant configurado. O front nunca decide database/entity sozinho.
        const accesses=await getUserAccesses(userToken);
        const userId=await currentOAuthUserId(userToken);
        await authTrace(env,"TENANTS_ACCESSES_OK",{count:Array.isArray(accesses)?accesses.length:0});

        const registry=await tenantRegistry(env);
        const tenants=[];
        const tenantErrors=[];
        const candidates=[];
        const directTenantIds=[];
        const userAliases=biUserAliases(userId,accesses);

        // Primeira passagem: resolve todos os contextos e identifica quais
        // prefeituras têm acesso Betha direto para esta sessão.
        for (const id of Object.keys(registry)) {
          try {
            const tenant=await resolveTenant(env,id);
            const context=await getTenantContext(userToken,tenant);
            const contextMatches=matchingAccesses(accesses,context);
            const access=matchAccess(accesses,context);

            await authTrace(env,"TENANT_ACCESS_MATCHES",{
              tenant:id,
              count:contextMatches.length
            });

            if(access) directTenantIds.push(tenant.id);
            candidates.push({id,tenant,context,access});
          } catch(error) {
            await authTrace(env,"TENANT_VALIDATION_ERROR",{
              tenant:id,
              code:error && error.message ? error.message : "TENANT_VALIDATION_FAILED"
            });
            tenantErrors.push(error && error.message ? error.message : "TENANT_VALIDATION_FAILED");
            console.warn("tenant validation",id,error.message);
          }
        }

        // Segunda passagem: além do acesso direto, aceita o administrador que
        // cadastrou a prefeitura no BI. Para cadastros anteriores à tabela de
        // vínculo, o histórico auditado de entity.save faz a migração uma vez.
        const auditCache=new Map();
        for (const candidate of candidates) {
          const {id,tenant,context,access}=candidate;
          let tenantAdmin=false;

          if(!access){
            tenantAdmin=await isBiTenantAdmin(env,tenant.id,userAliases);
            if(!tenantAdmin){
              tenantAdmin=await legacyTenantOwnershipFromAudit(
                env,
                tenant.id,
                directTenantIds,
                userAliases,
                auditCache
              );
            }
          }

          if (!access && !tenantAdmin) {
            await authTrace(env,"TENANT_ACCESS_NOT_MATCHED",{tenant:id});
            continue;
          }

          const grant=userId?await getBiUserGrant(env,tenant.id,userId):null;
          if(access && !grant && access.admin!==true && access.technical!==true){
            await authTrace(env,"TENANT_BI_GRANT_MISSING",{tenant:id});
            continue;
          }

          const baseAccess=access || {
            accepted:true,
            admin:true,
            technical:true,
            user:userId||userAliases[0]||"",
            userName:userId||userAliases[0]||""
          };
          const effective=tenantAdmin ? baseAccess : applyBiGrantToAccess(baseAccess,grant);
          tenants.push({
            id:tenant.id,
            name:tenant.name,
            entityId:context.entity,
            databaseId:context.database,
            admin:Boolean(effective.admin),
            technical:Boolean(effective.technical),
            allowedViews:permissionViewsForAccess(effective),
            allowedAdminViews:adminViewsForAccess(effective)
          });
          await authTrace(env,"TENANT_AUTHORIZED",{tenant:id,biManaged:Boolean(grant),tenantAdmin});
        }

        if (!tenants.length && tenantErrors.includes("SERVICE_LICENSE_SCOPE_REQUIRED")) {
          throw new Error("SERVICE_LICENSE_SCOPE_REQUIRED");
        }
        if (!tenants.length && tenantErrors.includes("SERVICE_ACCESS_TOKEN_INVALID")) {
          throw new Error("SERVICE_ACCESS_TOKEN_INVALID");
        }

        tenants.sort((a,b)=>String(a.name||a.id).localeCompare(String(b.name||b.id),"pt-BR"));
        await authTrace(env,"TENANTS_RESULT",{count:tenants.length});

        return json(request,env,200,{
          tenants,
          count:tenants.length,
          selectionRequired:tenants.length>1
        });
      } catch(error) {
        await authTrace(env,"TENANTS_ERROR",{
          code:error && error.message ? error.message : "TENANTS_FAILED"
        });
        return errorResponse(request,env,error);
      }
    }


    if (url.pathname==="/api/mcp/analytics/resolve-subject" && request.method==="GET") {
      try {
        const tenant=await resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        const credential={
          tenant,
          allowedViews:permissionViewsForAccess(auth.access).filter(view=>Boolean(dashboardBuilder(view)))
        };
        const result=await mcpResolveSubject(env,credential,{
          busca:url.searchParams.get("busca")||"",
          tipo:url.searchParams.get("tipo")||"ambos",
          limite:url.searchParams.get("limite")||8
        });
        await writeAuditEvent(env,{
          tenantId:tenant.id,
          actor:auditActorLabel(auth.access),
          category:"mcp",
          action:"tool.call.sdk",
          status:"ok",
          subject:"bi_resolve_subject",
          meta:{candidateCount:Number(result.count||0)}
        });
        return json(request,env,200,result);
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/mcp/analytics/company-iss" && request.method==="GET") {
      try {
        const tenant=await resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        requireViewPermission(auth,"economicos");
        requireViewPermission(auth,"arrecadacao");
        const credential={
          tenant,
          allowedViews:permissionViewsForAccess(auth.access).filter(view=>Boolean(dashboardBuilder(view)))
        };
        const result=await mcpCompanyIssDetail(request,env,credential,{
          busca:url.searchParams.get("busca")||"",
          economico_id:url.searchParams.get("economico_id")||"",
          periodo:url.searchParams.get("periodo")||"ano",
          exercicio:Number(url.searchParams.get("exercicio"))||new Date().getFullYear(),
          limite:Number(url.searchParams.get("limite"))||8
        });
        await writeAuditEvent(env,{
          tenantId:tenant.id,
          actor:auditActorLabel(auth.access),
          category:"mcp",
          action:"tool.call.sdk",
          status:"ok",
          subject:"bi_company_iss_detail",
          meta:{resolved:result&&result.status==="resolved"}
        });
        return json(request,env,200,result);
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/mcp/analytics/subject-financial" && request.method==="GET") {
      try {
        const tenant=await resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        requireViewPermission(auth,"contribuintes");
        requireViewPermission(auth,"debitos");
        requireViewPermission(auth,"divida");
        const credential={
          tenant,
          allowedViews:permissionViewsForAccess(auth.access).filter(view=>Boolean(dashboardBuilder(view)))
        };
        const result=await mcpSubjectFinancialSummary(request,env,credential,{
          busca:url.searchParams.get("busca")||"",
          contribuinte_id:url.searchParams.get("contribuinte_id")||"",
          periodo:url.searchParams.get("periodo")||"todos",
          exercicio:Number(url.searchParams.get("exercicio"))||new Date().getFullYear()
        });
        await writeAuditEvent(env,{
          tenantId:tenant.id,
          actor:auditActorLabel(auth.access),
          category:"mcp",
          action:"tool.call.sdk",
          status:"ok",
          subject:"bi_subject_financial_summary",
          meta:{resolved:result&&result.status==="resolved"}
        });
        return json(request,env,200,result);
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/mcp/tokens" && request.method==="GET") {
      try {
        const tenant=await resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        const ownerHash=await mcpOwnerHash(auth);
        const includeAll=Boolean(auth.access&&(auth.access.admin===true||auth.access.technical===true));
        const tokens=await listMcpCredentials(env,tenant.id,{ownerHash,includeAll,limit:url.searchParams.get("limit")||100});
        return json(request,env,200,{tokens,count:tokens.length});
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/mcp/tokens" && request.method==="POST") {
      try {
        const tenant=await resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        const body=await request.json().catch(()=>({}));
        const ttlHours=Math.max(0.25,Math.min(Number(body.ttlHours)||8,8));
        const credential=await createMcpCredential(env,auth,tenant,{
          label:String(body.label||"").trim(),
          ttlSeconds:Math.round(ttlHours*60*60)
        });
        await writeAuditEvent(env,{
          tenantId:tenant.id,
          actor:auditActorLabel(auth.access),
          category:"mcp",
          action:"credential.create",
          status:"ok",
          subject:credential.tokenId,
          meta:{label:String(body.label||""),expiresIn:credential.expiresIn,viewCount:credential.allowedViews.length}
        });
        return json(request,env,201,{
          ok:true,
          endpoint:new URL("/mcp",request.url).toString(),
          token:credential.token,
          tokenId:credential.tokenId,
          tenant:credential.tenant,
          allowedViews:credential.allowedViews,
          expiresAt:credential.expiresAt,
          expiresIn:credential.expiresIn,
          authorizationHeader:"Bearer "+credential.token
        });
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    const deleteMcpTokenMatch=url.pathname.match(/^\/api\/mcp\/tokens\/([A-Fa-f0-9]{8,64})$/);
    if (deleteMcpTokenMatch && request.method==="DELETE") {
      try {
        const tenant=await resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        const ownerHash=await mcpOwnerHash(auth);
        const includeAll=Boolean(auth.access&&(auth.access.admin===true||auth.access.technical===true));
        const revoked=await revokeMcpCredential(env,tenant.id,deleteMcpTokenMatch[1],{ownerHash,includeAll});
        await writeAuditEvent(env,{
          tenantId:tenant.id,
          actor:auditActorLabel(auth.access),
          category:"mcp",
          action:"credential.revoke",
          status:"ok",
          subject:revoked.tokenId,
          meta:{label:revoked.label}
        });
        return json(request,env,200,revoked);
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/admin/audit" && request.method==="GET") {
      try {
        const tenant=await resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        requireConstraintPermission(auth,"BIConfiguracoesPage");
        const audit=await listAuditEvents(env,tenant.id,url.searchParams.get("limit")||100);
        const analysis=analyzeAuditSecurity(audit.events);
        return json(request,env,200,{
          events:analysis.events,
          count:analysis.events.length,
          security:analysis.security,
          history:{
            loaded:audit.loaded,
            totalIndexed:audit.totalIndexed,
            indexTruncated:audit.indexTruncated,
            hasMore:audit.hasMore,
            limit:audit.limit,
            maxLimit:audit.maxLimit,
            retentionDays:audit.retentionDays,
            storage:audit.storage
          }
        });
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/admin/page-mapping/status" && request.method==="GET") {
      try {
        const tenant=await resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        if (!auth.access || (!auth.access.admin && !auth.access.technical)) throw new Error("ADMIN_REQUIRED");
        const status=await getPageMappingStatus(tenant);
        return json(request,env,200,{
          ok:true,
          tenant:{id:tenant.id,name:tenant.name},
          expected:pageMappingSummary(BI_PAGE_MAPPING),
          ...status
        });
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/admin/page-mapping" && request.method==="PUT") {
      try {
        const tenant=await resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        if (!auth.access || auth.access.admin!==true) throw new Error("ADMIN_REQUIRED");
        const result=await publishPageMapping(tenant);
        await writeAuditEvent(env,{
          tenantId:tenant.id,
          actor:auditActorLabel(auth.access),
          category:"permissions",
          action:"page-mapping.publish",
          status:"ok",
          subject:"BI Page Mapping",
          meta:{constraintCount:Number(result.constraintCount||0),groupCount:Number(result.groupCount||0)}
        });
        return json(request,env,200,result);
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/admin/users" && request.method==="GET") {
      try {
        const tenant=await resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        requireConstraintPermission(auth,"BIUsuariosPage");
        const body=await listBiUserGrants(env,tenant.id,{
          limit:url.searchParams.get("limit")||100,
          offset:url.searchParams.get("offset")||0
        });
        return json(request,env,200,body);
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/admin/user-search" && request.method==="GET") {
      try {
        const tenant=await resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        requireConstraintPermission(auth,"BIUsuariosPage");
        const user=url.searchParams.get("user") || "";
        if (!user.trim()) return json(request,env,400,{error:"USER_REQUIRED"});
        const body=await searchCentralUser(auth.userToken,user.trim());
        return json(request,env,200,body);
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/admin/users" && request.method==="POST") {
      try {
        const tenant=await resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        if (!auth.access || (!auth.access.admin && !auth.access.technical)) throw new Error("ADMIN_REQUIRED");
        const body=await request.json();
        const user=String(body && body.user || "").trim();
        if (!user) throw new Error("USER_REQUIRED");

        const payload={
          user,
          admin:Boolean(body && body.admin),
          technical:Boolean(body && body.technical),
          permissions:Array.isArray(body && body.permissions) ? body.permissions : [],
          expiresIn:body && body.expiresIn ? String(body.expiresIn) : null
        };

        const centralPayload=await searchCentralUser(auth.userToken,user);
        const centralRows=centralUserRows(centralPayload);
        const selected=centralRows.find(item=>centralUserId(item).toLocaleLowerCase("pt-BR")===user.toLocaleLowerCase("pt-BR"))||centralRows[0];
        if(!selected) throw new Error("USER_NOT_FOUND");
        const created=await saveBiUserGrant(env,tenant.id,selected,payload,auditActorLabel(auth.access));
        await writeAuditEvent(env,{
          tenantId:tenant.id,
          actor:auditActorLabel(auth.access),
          category:"users",
          action:"access.create",
          status:"ok",
          subject:user,
          meta:{admin:payload.admin,technical:payload.technical,permissionCount:payload.permissions.length,hasExpiry:Boolean(payload.expiresIn)}
        });
        return json(request,env,201,created);
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    const deleteUserMatch=url.pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
    if (deleteUserMatch && request.method==="DELETE") {
      try {
        const tenant=await resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        if (!auth.access || (!auth.access.admin && !auth.access.technical)) throw new Error("ADMIN_REQUIRED");
        const body=await deleteBiUserGrant(env,tenant.id,deleteUserMatch[1]);
        await writeAuditEvent(env,{
          tenantId:tenant.id,
          actor:auditActorLabel(auth.access),
          category:"users",
          action:"access.revoke",
          status:"ok",
          subject:"access",
          meta:{accessId:String(deleteUserMatch[1]).slice(0,80)}
        });
        return json(request,env,200,body || {ok:true});
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    const dataMatch=url.pathname.match(/^\/api\/data\/([a-z0-9-]+)$/);
    if (dataMatch && request.method==="GET") {
      let tenant=null;
      let auth=null;
      const resource=dataMatch[1];
      const source=(url.searchParams.get("source") || "bi").toLowerCase();
      try {
        tenant=await resolveTenant(env,getTenantId(request,url));
        auth=await authorizeTenant(request,env,tenant);
        // Valida primeiro a allowlist técnica e depois a permissão funcional.
        // Recursos customizados sem mapeamento permanecem fail-closed para usuários comuns.
        resolveResource(env,source,resource);
        requireDataPermission(auth,source,resource);
        const query=buildForwardedQuery(url);
        const body=await bethaGet(env,tenant,source,resource,query);
        return json(request,env,200,{
          source,
          tenant:{id:tenant.id,name:tenant.name,entityId:auth.context.entity,databaseId:auth.context.database},
          resource,
          data:body
        });
      } catch(error) {
        if (error&&error.message==="DATA_RESOURCE_PERMISSION_DENIED") {
          await writeSecurityDenial(env,tenant,auth,{
            surface:"data",
            subject:source+":"+resource,
            code:error.message,
            source,
            resource
          });
        }
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/mcp") {
      return handleMcpRequest(request,env);
    }

    if (request.method==="GET" && !url.pathname.startsWith("/api/")) {
      return proxyFront(request,env);
    }

    if (!["GET","POST","PUT","DELETE"].includes(request.method)) {
      return json(request,env,405,{error:"METHOD_NOT_ALLOWED"});
    }

    return json(request,env,404,{error:"ROUTE_NOT_FOUND"});
  }
};
