# Roadmap de Implementação — BI Tributos

Atualizado em 05/10/2026.

| Bloco | Estado | Evidência / próximo passo |
|---|---|---|
| Frontend e 16 painéis | IMPLEMENTADO | `dashboard-catalog.js` |
| Rotas de dashboard | IMPLEMENTADO | Worker possui builders e rotas dos 16 painéis |
| Atualização após snapshot/cache | IMPLEMENTADO | commit `6aaee0ef402318943290ab5887b3ad6a86474850` remove retorno prematuro |
| Multi-entidade | IMPLEMENTADO/PARCIAL | tenant + database/entity + validação; validar nova entidade ponta a ponta |
| Macro → micro | PARCIAL | infraestrutura de drill/detail existe; completar cobertura por recurso |
| Busca global | IMPLEMENTADO/PARCIAL | cliente e /api/search; ampliar cobertura |
| Exportações | PARCIAL | validar PDF/CSV/TXT conforme macro/micro |
| MCP read-only | IMPLEMENTADO/PARCIAL | contexto, lista, dashboard/KPIs, receita, ISS empresa e imóveis pessoa; ampliar para todos os domínios |
| RBAC/Page Mapping | IMPLEMENTADO | manter fail-closed |
| Auditoria | IMPLEMENTADO | histórico, filtros, exportação e anomalias recentes |
| Cadastro seguro de entidades | PENDENTE PRIORITÁRIO | retirar dependência operacional do painel Cloudflare sem expor segredos |
| Cobertura completa dos 26 recursos BI | PARCIAL | integrar 3 recursos ainda ausentes do catálogo visual |
| OpenAPI completa | PENDENTE | comparar `BI_RESOURCES` com especificação oficial e adicionar somente endpoints comprovados |
| Teste de dados reais | PENDENTE PRIORITÁRIO | confirmar Network /api/dashboard/*, paginação, sourceAudit e valores reais |
| Nova prefeitura | PENDENTE | executar fluxo completo após cadastro seguro |

## Ordem de execução
1. Validar alimentação real após a correção de cache.
2. Integrar os 3 recursos BI já allowlisted e ainda não usados visualmente.
3. Completar MCP para todos os painéis autorizados e micros úteis.
4. Finalizar cadastro seguro de entidades.
5. Testar nova prefeitura, permissões, exportações e responsividade.
6. Comparar OpenAPI oficial contra os 26 recursos atuais e expandir cobertura sem inventar endpoints.
