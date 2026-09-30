# Fontes de dados do BI Tributos

O backend está preparado com duas camadas de fonte.

## Fonte `bi`

Usa a API **Tributos - Integrações BI**, no servidor `https://tributos.suite.betha.cloud`.

Exemplos:

```text
GET /api/data/contribuintes?source=bi&limit=50
GET /api/data/imoveis?source=bi
GET /api/data/pagamentos?source=bi
GET /api/data/dividas?source=bi
```

Somente os parâmetros `offset`, `limit`, `filter`, `fields`, `cpaFields` e `sort` são encaminhados.

## Fonte `base`

Reservada para informações que não existam na Integrações BI ou que precisem de maior detalhamento no sistema Tributos.

Configuração:

```text
BETHA_BASE_API_BASE
BETHA_BASE_RESOURCE_MAP_JSON
```

Exemplo conceitual do mapa permitido:

```json
{
  "contribuintes-detalhe": "/endpoint-oficial-a-mapear",
  "configuracoes-tributos": "/endpoint-oficial-a-mapear"
}
```

A chamada então segue:

```text
GET /api/data/contribuintes-detalhe?source=base
```

Não há proxy genérico de URL. Cada endpoint da fonte base precisa ser cadastrado explicitamente na allowlist.

## Multi-entidade

O front envia somente um identificador lógico do tenant em `X-Tenant-Id`. O backend resolve internamente as credenciais da entidade e nunca devolve o `User-Access` ao navegador.

## Segurança

As rotas de dados permanecem bloqueadas por padrão até a integração de sessão/SSO Betha. A opção `ALLOW_UNAUTHENTICATED_DEV=true` existe somente para teste controlado.