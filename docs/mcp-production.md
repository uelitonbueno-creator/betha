# MCP do BI Tributário — fila de produção

## Objetivo

Expor o BI multi-entidade como servidor MCP remoto para clientes de IA compatíveis, preservando o mesmo isolamento já usado no backend do BI.

## Arquitetura de produção

```text
Cliente de IA compatível com MCP
        |
        | OAuth 2.1
        v
Servidor MCP remoto /mcp
        |
        | identidade + escopos
        v
Autorização MCP
        |
        | resolve acesso permitido
        v
tenant autorizado (database + entity)
        |
        v
betha-bi-api
        |
        +--> Integrações BI
        +--> Dados do Tributos
        +--> cache/Supabase
```

## Segurança obrigatória

1. V1 somente leitura.
2. E-mail nunca concede acesso sozinho; ele é um atributo da identidade autenticada.
3. O servidor valida `database + entity` a cada chamada.
4. O argumento `tenant_id` nunca é confiável por si só.
5. Access Token, User-Access e segredos permanecem no backend.
6. Toda ferramenta recebe escopo/permissão derivado do Page Mapping.
7. Ferramentas sem permissão mapeada não devem ser publicadas.
8. Auditoria registra ferramenta, tenant, duração, resultado e parâmetros seguros, sem copiar dados pessoais retornados.
9. Operações de escrita em tributos ficam fora da V1.

## Catálogo automático

O arquivo `scripts/generate-mcp-tools.mjs` lê os builders reais de `backend/worker.js` e cruza com `config/page-mapping.json`.

Saída:

`config/mcp-tools.generated.json`

Assim, painel novo implica ferramenta MCP nova ou falha explícita de autorização até o Page Mapping ser atualizado.

## Comandos iniciais

O catálogo atual possui 16 comandos principais:

- get_visao_geral
- get_arrecadacao
- get_debitos
- get_divida
- get_parcelamentos
- get_economicos
- get_imobiliario
- get_itbi
- get_contribuintes
- get_encerramento
- get_obras
- get_qualidade
- get_receitas_creditos
- get_guias
- get_indexadores
- get_territorio

Todos os 16 painéis atuais possuem constraints próprios no Page Mapping nesta branch. O gerador bloqueia a liberação futura se surgir painel novo sem permissão correspondente.

## Transporte e autenticação

Produção alvo:

- Streamable HTTP em `/mcp`;
- servidor stateless para consultas;
- OAuth 2.1;
- health check independente;
- deploy isolado do Worker principal até os testes de tenant concluírem.

## Critérios de liberação

- `tools/list` lista apenas ferramentas autorizadas;
- `tools/call` não funciona sem usuário autenticado;
- teste cruzado entre dois tenants prova isolamento;
- arrecadação semanal e total de imóveis respondem com dados reais;
- auditoria disponível;
- sem regressão no `betha-bi-api`;
- catálogo gerado sem `missingPermissions`.
