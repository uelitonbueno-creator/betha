/**
 * BI Tributos - backend multi-entidade.
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

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const raw = env.ALLOWED_ORIGINS || "https://uelitonbueno-creator.github.io";
  const allowed = String(raw).split(",").map(v => v.trim()).filter(Boolean);
  const allowOrigin = allowed.includes(origin) ? origin : "";
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

function resolveTenant(env, tenantId) {
  if (!tenantId) throw new Error("TENANT_REQUIRED");
  const tenants=parseJsonObject(env.BETHA_TENANTS_JSON,{});
  const tenant=tenants[tenantId];
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

async function createStoredSession(env,accessToken,ttlSeconds) {
  if (!env.BI_SESSIONS) throw new Error("SESSION_STORE_NOT_CONFIGURED");
  if (!accessToken) throw new Error("USER_TOKEN_REQUIRED");

  const ttl=Math.max(60,Math.min(Number(ttlSeconds)||8*60*60,8*60*60));
  const sid=createSessionId();
  const exp=Date.now()+ttl*1000;

  await env.BI_SESSIONS.put(
    "session:"+sid,
    JSON.stringify({kind:"user-session",accessToken,exp}),
    {expirationTtl:ttl}
  );

  return {sid,exp,ttl};
}

async function readStoredSession(request,env) {
  if (!env.BI_SESSIONS) throw new Error("SESSION_STORE_NOT_CONFIGURED");

  const sid=readCookie(request,SESSION_COOKIE);
  if (!sid) return null;

  const raw=await env.BI_SESSIONS.get("session:"+sid);
  if (!raw) return null;

  try {
    const payload=JSON.parse(raw);
    if (!payload || !payload.accessToken) {
      await env.BI_SESSIONS.delete("session:"+sid);
      return null;
    }
    if (payload.exp && Date.now()>=Number(payload.exp)) {
      await env.BI_SESSIONS.delete("session:"+sid);
      return null;
    }
    return {sid,...payload};
  } catch {
    await env.BI_SESSIONS.delete("session:"+sid);
    return null;
  }
}

async function destroyStoredSession(request,env) {
  const sid=readCookie(request,SESSION_COOKIE);
  if (sid && env.BI_SESSIONS) {
    await env.BI_SESSIONS.delete("session:"+sid);
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
  const [accesses,context]=await Promise.all([
    getUserAccesses(userToken),
    getTenantContext(userToken,tenant)
  ]);
  const access=matchAccess(accesses,context);
  if (!access) throw new Error("TENANT_ACCESS_DENIED");
  if (access.expiresIn && new Date(access.expiresIn).getTime() < Date.now()) throw new Error("TENANT_ACCESS_EXPIRED");
  return {userToken,access,context};
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
  const response=await fetch(target,{
    method:"GET",
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
    const n=Number(value);
    if(Number.isFinite(n)&&n>=0){offset=n;break;}
  }

  let limit=requestedLimit;
  for(const value of limitCandidates){
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

async function fetchBethaRows(env,tenant,source,resource,{limit=1000,maxPages=null,startOffset=0}={}) {
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
    const body=await bethaGet(env,tenant,source,resource,"limit="+limit+"&offset="+requestOffset);
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

async function safeBethaRows(env,tenant,source,resource,options={}) {
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
    ? [requestedLimit]
    : (heavyFinancial.has(resource) ? [500,250,100,50] : [1000,500,250]);

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

  const detail=lastError && lastError.remoteBody
    ? (typeof lastError.remoteBody==="string"
        ? lastError.remoteBody.slice(0,240)
        : JSON.stringify(lastError.remoteBody).slice(0,240))
    : null;

  console.warn("dashboard source failed",source,resource,lastError && lastError.message,detail);

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

  const closingKey=row=>{
    const year=Number(firstValue(row,["anoEncerramento"]));
    const month=Number(firstValue(row,["mesEncerramento.valor","mesEncerramento"]));
    if(Number.isFinite(year)&&year>1900&&Number.isFinite(month)&&month>=1&&month<=12) return year*100+month;
    const d=dateValue(row,["dataFinalMes"]);
    return d ? d.getFullYear()*100+(d.getMonth()+1) : 0;
  };

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

  const recoveryBase=payvals.rows
    .filter(r=>firstValue(r,["idDivida"])!==undefined)
    .filter(r=>!firstValue(r,["pagamento.dhEstorno"]));

  const recoveryRows=(Object.keys(activeFilters).length
    ? recoveryBase.filter(r=>latestDebtIds.has(String(firstValue(r,["idDivida"])||"")))
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
    datePaths:["dtPagamento","pagamento.dtPagamento"],valuePaths:["__totalPaid"],periodo,exercicio
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
  const parcelRows=parcelas.rows.filter(r=>periodo==="todos"||selectedIds.has(String(firstValue(r,["idParcelamentos"])||"")));
  const refRows=refs.rows.filter(r=>periodo==="todos"||selectedIds.has(String(firstValue(r,["idParcelamentos"])||"")));

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
    return periodo==="todos" || !agreementId || selectedIds.has(agreementId);
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

async function buildRealEstateDashboard(env,tenant,url) {
  const periodo=url.searchParams.get("periodo")||"ano";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const filters={
    bairro:dashboardFilterValue(url,"bairro"),
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

  const bairros=groupCount(imoRows,["nomeBairro","bairro.nome","bairro"],15);
  const setores=groupCount(imoRows,["setor","setor.codigo","nomeSetor"],15);
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
      "bairro-imoveis":chartGroups(bairros,"Imóveis","number"),
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
    if(filters.tipoPessoa&&!matchesDashboardFilter(row,filters.tipoPessoa,["tipoPessoa","tipoPessoa.descricao","pessoa.tipo"])) return false;
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

  const tipo=groupCount(rows,["tipoPessoa","tipoPessoa.descricao","pessoa.tipo"],5);
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
      tipoPessoa:filterOptionsFromRows(allRows,["tipoPessoa","tipoPessoa.descricao","pessoa.tipo"]),
      cidade:filterOptionsFromRows(allRows,["nomeCidade","cidade.nome","municipio.nome"])
    },
    kpis:{
      "contribuintes-total":rows.length,
      pf:countWhere(rows,r=>/fis|pf|física/i.test(stringValue(r,["tipoPessoa","tipoPessoa.descricao"],""))),
      pj:countWhere(rows,r=>/jur|pj|jurídica/i.test(stringValue(r,["tipoPessoa","tipoPessoa.descricao"],""))),
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
  const labelFor=row=>String(firstValue(row,competenciaPaths)||"Não informado");
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
  const periodo=url.searchParams.get("periodo")||"todos";
  const exercicio=Number(url.searchParams.get("exercicio")||new Date().getFullYear());
  const def=DETAIL_RESOURCES[resource]||{};

  let out=rows;
  if(periodo!=="todos" && Array.isArray(def.datePaths) && def.datePaths.length){
    out=out.filter(row=>periodIncludes(row,{
      periodo,exercicio,
      datePaths:def.datePaths,
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
      out=out.filter(row=>matchesDashboardFilter(row,parcelamentoId,["idParcelamentos","idParcelamento","parcelamento.id"]));
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

  return out;
}

async function buildDetailPage(env,tenant,resource,url) {
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
    const setor=dashboardFilterValue(url,"setor");
    const zona=dashboardFilterValue(url,"zona");
    const cadastro=dashboardFilterValue(url,"cadastro");
    if(bairro||setor||zona||cadastro){
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

  // O dashboard pode contar registros de todo o exercício enquanto a primeira
  // página física da API não contém itens do recorte. Para o micro, avance
  // páginas até encontrar registros compatíveis (ou esgotar a fonte), em vez
  // de devolver "nenhum registro" prematuramente.
  let scanOffset=src.nextOffset;
  let scanHasMore=src.hasMore===true;
  let scanPages=1;
  const scanMaxPages=20;
  while(filtered.length===0 && scanHasMore && scanOffset!==null && scanOffset!==undefined && scanPages<scanMaxPages){
    const page=await safeBethaRows(env,tenant,def.source,def.resource,{
      limit,
      maxPages:1,
      startOffset:Number(scanOffset),
      chunkMode:true
    });
    if(page.error) break;
    filtered=detailFilterRows(resource,page.rows,url,detailContext);
    scanOffset=page.nextOffset;
    scanHasMore=page.hasMore===true;
    scanPages++;
  }

  const columns=def.columns.map(([key,label,paths,format])=>({key,label,format}));
  const rows=filtered.map((row,index)=>{
    const item={};
    for(const [key,,paths,format] of def.columns){
      item[key]=detailScalar(row,paths,format);
    }
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
      hasMore:scanHasMore,
      nextOffset:scanOffset
    }
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
  territorio:"Território cadastral"
});

const MCP_PERMISSION_VIEW_MAP = Object.freeze({
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
  BIQualidadePage:"qualidade"
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
    territorio:buildTerritoryDashboard
  };
  return builders[String(view||"")] || null;
}

function permissionViewsForAccess(access) {
  if (access && (access.admin===true || access.technical===true)) {
    return Object.keys(MCP_VIEW_LABELS);
  }

  let serialized="";
  try { serialized=JSON.stringify(access||{}); } catch {}

  const out=[];
  for (const [permissionId,view] of Object.entries(MCP_PERMISSION_VIEW_MAP)) {
    if (serialized.includes(permissionId)) out.push(view);
  }

  // Fallback conservador: usuário autorizado sem Page Mapping reconhecido
  // recebe apenas a visão executiva, nunca acesso adicional.
  return out.length ? [...new Set(out)] : ["visao-geral"];
}

const DETAIL_PERMISSION_VIEWS = Object.freeze({
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
    const title=MCP_VIEW_LABELS[view]||view;
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

async function writeAuditEvent(env,{tenantId="",actor="",category="system",action="",status="ok",subject="",meta={}}={}) {
  if(!env.BI_SESSIONS || !tenantId || !action) return;
  try{
    const ts=Date.now();
    const key="audit:"+String(tenantId)+":"+String(ts).padStart(13,"0")+":"+createSessionId().slice(0,8);
    const event={
      ts:new Date(ts).toISOString(),
      tenantId:String(tenantId),
      actor:String(actor||"authenticated-user").slice(0,120),
      category:String(category||"system").slice(0,60),
      action:String(action||"").slice(0,120),
      status:String(status||"ok").slice(0,30),
      subject:String(subject||"").slice(0,160),
      meta:safeAuditMeta(meta)
    };
    await env.BI_SESSIONS.put(key,JSON.stringify(event),{expirationTtl:30*24*60*60});
  }catch{}
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

async function listAuditEvents(env,tenantId,limit=100) {
  if(!env.BI_SESSIONS) throw new Error("SESSION_STORE_NOT_CONFIGURED");

  const safeLimit=Math.max(10,Math.min(Number(limit)||100,1000));
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
  const selectedKeys=keyNames.slice(0,safeLimit);
  const values=await Promise.all(selectedKeys.map(key=>env.BI_SESSIONS.get(key)));
  const events=values.map(raw=>{
    try{return JSON.parse(raw||"null");}catch{return null;}
  }).filter(Boolean);

  return {
    events,
    loaded:events.length,
    totalIndexed:keyNames.length,
    indexTruncated:!listComplete,
    hasMore:keyNames.length>safeLimit || !listComplete,
    limit:safeLimit,
    maxLimit:1000,
    retentionDays:30
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
  const allowedViews=permissionViewsForAccess(auth.access);
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
  const tenant=resolveTenant(env,String(payload.tenantId));
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

  if (credential.allowedViews.includes("economicos")) {
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

  return tools;
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
  mcpRequireViews(credential,["economicos"]);
  const empresa=String(args.empresa||"").trim();
  if(empresa.length<2) throw new Error("MCP_QUERY_REQUIRED");

  const url=mcpDashboardUrl(request,{
    view:"economicos",
    periodo:args.periodo||"ano",
    exercicio:args.exercicio||new Date().getFullYear(),
    filters:{busca:empresa}
  });
  const body=await buildEconomicsDashboard(env,credential.tenant,url);
  const chart=body.charts&&body.charts["iss-arrecadacao"] ? body.charts["iss-arrecadacao"] : null;
  const matched=Number(body.kpis&&body.kpis.economicos||0);

  return {
    tenant:body.tenant,
    query:empresa,
    period:body.period,
    matchedEconomics:matched,
    ambiguous:matched>1,
    activeEconomics:Number(body.kpis&&body.kpis["ativos-economicos"]||0),
    activities:Number(body.kpis&&body.kpis.atividades||0),
    issArrecadado:mcpChartTotal(chart),
    mensal:chart ? {
      labels:chart.labels||[],
      valores:chart.datasets&&chart.datasets[0] ? chart.datasets[0].data||[] : []
    } : {labels:[],valores:[]},
    note:matched===0
      ? "Nenhum econômico encontrado para a busca informada."
      : matched>1
        ? "A busca encontrou mais de um econômico; refine o nome para obter um resultado individual."
        : "Resultado individual encontrado."
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
    credential=await readMcpCredential(request,env);
  } catch(error) {
    const code=error&&error.message?error.message:"MCP_TOKEN_INVALID";
    return new Response(JSON.stringify({error:code}),{
      status:401,
      headers:{
        "Content-Type":"application/json; charset=utf-8",
        "WWW-Authenticate":'Bearer realm="BI Tributos MCP"',
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
        serverInfo:{name:"BI Tributos MCP",version:"1.0.0"},
        instructions:"Servidor somente leitura. As respostas respeitam prefeitura, tenant e permissões vinculadas à credencial MCP."
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
    BI_RESOURCE_NOT_ALLOWED:404,
    BASE_RESOURCE_NOT_CONFIGURED:501,
    BETHA_ACCESS_TOKEN_NOT_CONFIGURED:503,
    INVALID_SOURCE:400,
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

export default {
  async fetch(request,env) {
    const url=new URL(request.url);
    if (request.method==="OPTIONS") return new Response(null,{status:204,headers:corsHeaders(request,env)});

    if (url.pathname==="/api/health" && request.method==="GET") {
      return json(request,env,200,{
        ok:true,
        buildVersion:"2026-10-05-audit-history-v62",
        dashboardAggregatePublic:false,
        dashboardAuthorization:"betha-session+tenant+page-permission",
        detailAuthorization:"betha-session+tenant+resource-permission",
        dataAuthorization:"betha-session+tenant+source-resource-permission",
        securityAudit:"blocked-permission-events-30d",
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
        sessionStoreConfigured:Boolean(env.BI_SESSIONS),
        supabaseCacheConfigured:Boolean(env.SUPABASE_CACHE_KEY),
        devLoginConfigured:Boolean(env.BI_DEV_LOGIN_USER && env.BI_DEV_LOGIN_PASSWORD),
        mcpEnabled:true,
        mcpEndpoint:"/mcp",
        mcpAuthentication:"opaque-bearer"
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

    if (url.pathname==="/api/cache/snapshot" && request.method==="POST") {
      try {
        const tenant=resolveTenant(env,getTenantId(request,url));
        await authorizeTenant(request,env,tenant);
        const body=await request.json();
        const result=await persistSupabaseCache(env,body);
        return json(request,env,200,result);
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    const overviewPartMatch=url.pathname.match(/^\/api\/dashboard\/visao-geral\/part\/([a-z0-9-]+)$/);
    if (overviewPartMatch && request.method==="GET") {
      let tenant=null;
      let auth=null;
      try {
        tenant=resolveTenant(env,getTenantId(request,url));
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
        tenant=resolveTenant(env,getTenantId(request,url));
        auth=await authorizeTenant(request,env,tenant);
        requireViewPermission(auth,view);

        // Dashboard autorizado por sessão Betha + contexto entity/database
        // + permissão funcional do Page Mapping.
        // O navegador recebe apenas agregados do tenant validado.
        const builder=dashboardBuilder(view);
        if (!builder) return json(request,env,501,{error:"DASHBOARD_NOT_IMPLEMENTED",view});

        const body=await builder(env,tenant,url);
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
        const tenant=resolveTenant(env,getTenantId(request,url));
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
        tenant=resolveTenant(env,getTenantId(request,url));
        auth=await authorizeTenant(request,env,tenant);
        requireDetailPermission(auth,resource);
        const result=await buildDetailPage(env,tenant,resource,url);
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
        const tenant=resolveTenant(env,getTenantId(request,url));
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
        await authTrace(env,"TENANTS_ACCESSES_OK",{count:Array.isArray(accesses)?accesses.length:0});

        const registry=parseJsonObject(env.BETHA_TENANTS_JSON,{});
        const tenants=[];
        const tenantErrors=[];

        for (const id of Object.keys(registry)) {
          try {
            const tenant=resolveTenant(env,id);
            const context=await getTenantContext(userToken,tenant);
            const contextMatches=matchingAccesses(accesses,context);
            const access=matchAccess(accesses,context);

            await authTrace(env,"TENANT_ACCESS_MATCHES",{
              tenant:id,
              count:contextMatches.length
            });

            if (!access) {
              await authTrace(env,"TENANT_ACCESS_NOT_MATCHED",{tenant:id});
              continue;
            }

            tenants.push({
              id:tenant.id,
              name:tenant.name,
              entityId:context.entity,
              databaseId:context.database,
              admin:Boolean(access.admin),
              technical:Boolean(access.technical),
              allowedViews:permissionViewsForAccess(access),
              allowedAdminViews:adminViewsForAccess(access)
            });
            await authTrace(env,"TENANT_AUTHORIZED",{tenant:id});
          } catch(error) {
            await authTrace(env,"TENANT_VALIDATION_ERROR",{
              tenant:id,
              code:error && error.message ? error.message : "TENANT_VALIDATION_FAILED"
            });
            tenantErrors.push(error && error.message ? error.message : "TENANT_VALIDATION_FAILED");
            console.warn("tenant validation",id,error.message);
          }
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


    if (url.pathname==="/api/mcp/tokens" && request.method==="GET") {
      try {
        const tenant=resolveTenant(env,getTenantId(request,url));
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
        const tenant=resolveTenant(env,getTenantId(request,url));
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
        const tenant=resolveTenant(env,getTenantId(request,url));
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
        const tenant=resolveTenant(env,getTenantId(request,url));
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
            retentionDays:audit.retentionDays
          }
        });
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/admin/page-mapping/status" && request.method==="GET") {
      try {
        const tenant=resolveTenant(env,getTenantId(request,url));
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
        const tenant=resolveTenant(env,getTenantId(request,url));
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
        const tenant=resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        requireConstraintPermission(auth,"BIUsuariosPage");
        const body=await listContextUsers(auth.userToken,tenant,url);
        return json(request,env,200,body);
      } catch(error) {
        return errorResponse(request,env,error);
      }
    }

    if (url.pathname==="/api/admin/user-search" && request.method==="GET") {
      try {
        const tenant=resolveTenant(env,getTenantId(request,url));
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
        const tenant=resolveTenant(env,getTenantId(request,url));
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

        const created=await createContextUser(auth.userToken,tenant,payload);
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
        const tenant=resolveTenant(env,getTenantId(request,url));
        const auth=await authorizeTenant(request,env,tenant);
        if (!auth.access || (!auth.access.admin && !auth.access.technical)) throw new Error("ADMIN_REQUIRED");
        const body=await deleteContextUser(auth.userToken,tenant,deleteUserMatch[1]);
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
        tenant=resolveTenant(env,getTenantId(request,url));
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