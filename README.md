# BI Tributos — integração Betha

Front-end de BI tributário no padrão visual Betha, preparado para operar de forma **multi-entidade**.

## Arquitetura

```text
Betha Suíte / Studio
        |
        v
GitHub Pages (front único)
        |
        v
Backend multi-tenant
        |
        +---------------------+
        |                     |
        v                     v
Tributos Integrações BI   Fonte base Tributos
(preferencial)            (complementar)
```

## Estado atual

- Interface no padrão visual Betha.
- Front sem credenciais.
- Backend multi-entidade preparado.
- 26 endpoints do OpenAPI **Tributos - Integrações BI** cadastrados em allowlist.
- `User-Access` resolvido por tenant somente no backend.
- Camada `base` pronta para APIs oficiais do Tributos que precisarmos adicionar futuramente.
- Rotas de dados bloqueadas por padrão até a integração de autenticação/SSO.

## Endpoints internos

```text
/api/catalog
/api/data/pagamentos?source=bi
/api/data/dividas?source=bi
/api/data/economicos?source=bi
/api/data/{recurso}?source=base
```

Veja [docs/api-integracoes-bi.md](docs/api-integracoes-bi.md) e [backend/SOURCES.md](backend/SOURCES.md).

## Multi-entidade

O mesmo front atende várias prefeituras. O front envia um identificador lógico do tenant; o backend recupera o `User-Access` correto de um secret e nunca o devolve ao navegador.

## Publicação

```text
https://uelitonbueno-creator.github.io/betha/
```

## Segurança

Veja [SECURITY.md](SECURITY.md).

## Próximas etapas

1. Integrar autenticação/contexto do usuário vindo da Betha.
2. Cadastrar a primeira prefeitura no registry secreto.
3. Publicar o backend.
4. Testar chamadas reais da Integrações BI.
5. Definir agregações/cache dos indicadores.
6. Mapear a API base apenas quando um dado necessário não existir na Integrações BI.