# BI Vella — ativação do construtor de painéis

## Banco de dados existente

O deploy usa `wrangler.jsonc` com `AUTH_DB` apontando para o D1 `betha-bi-auth`.
O endpoint `/api/panel-drafts` agora usa `BI_PANEL_DB`, **se fornecido**, ou `AUTH_DB` como alternativa. Não é necessário criar outro banco para começar.

Na primeira requisição autenticada aos rascunhos, `ensurePanelDraftSchema` cria `bi_panel_drafts` se necessário; caso uma versão anterior da tabela exista, adiciona `view_id` e `sort_order` quando faltarem. Índices são criados com `IF NOT EXISTS`. A inicialização é compartilhada dentro de uma instância do Worker e é repetível após erro. Isso não executa importações das APIs Betha.

## Implantação e verificações

1. Executar localmente `node tests/panel-builder-core.test.cjs`, `node tests/panel-builder-security.test.cjs`, `node tests/panel-builder-d1.test.cjs`, `node tests/panel-builder-schema.test.cjs` e `python3 tests/panel-builder-migrations.test.py`.
2. Conferir o workflow **Panel Builder Checks** no GitHub Actions. Código na `main` não é prova de que o job passou.
3. Publicar o Worker pelo procedimento normal do repositório. O frontend já aponta para `betha-bi-api.ueliton-bueno.workers.dev`.
4. Fazer login normalmente e acessar um painel autorizado. O editor e o layout personalizado usarão a entidade ativa no estado do BI.
5. Verificar `GET /api/panel-drafts?system=contabil` usando a sessão autenticada e o cabeçalho `X-Tenant-Id`. Um retorno `items: []` indica uma consulta válida sem rascunhos, não falha de persistência.
6. Criar um gráfico autorizado, editar, trocar ordem e excluir, sem executar carga inicial de dados para isso.

Os arquivos `backend/migrations/20261009_panel_drafts.sql`, `20261009_panel_placement.sql` e `20261009_panel_sort_order.sql` ainda podem ser usados para migração **antecipada**, nesta ordem. **Não executar as instruções `ALTER TABLE` dos dois últimos arquivos depois que a inicialização automática já tiver criado essas colunas.** Não são scripts de reexecução incondicional.

## Filtro de gráficos

O editor aceita **até um filtro por igualdade** por gráfico, no formato `{field, op:"eq", value}`. A escolha do campo é limitada aos identificadores marcados `filterable` no catálogo da fonte autorizada. O valor é texto exato com até 120 caracteres; não são aceitas expressões, operadores livres ou consultas SQL.

Ao salvar ou editar, o Worker valida novamente fonte, campo e operação. A prévia efetua o filtro **antes** de agregar os valores, tanto nos arquivos locais de demonstração quanto nas páginas já cacheadas no R2. O resultado ainda é parcial: até cinco páginas ou 500 registros do cache real.

O endpoint `source-status` só retorna estatísticas das fontes cuja visualização funcional é permitida ao usuário. Indicadores de presença de dados não concedem permissão de consulta.

## Segurança e limites

Todos os rascunhos usam filtro por `tenant_id`, `system_id` e `owner_id`. A prévia de fontes cacheadas revalida fontes/campos e lê no máximo cinco páginas ou 500 registros do R2. A gravação no D1 persiste a **definição** do gráfico, não cópias dos dados municipais. As amostras `sample:` permanecem em modo demonstrativo.

A implantação e as migrações do banco real não são consideradas validadas até que o deploy e os testes autenticados sejam observados.
