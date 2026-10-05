# Mapa de Painéis — BI Tributos

## Painéis implementados no catálogo atual
| ID | Painel | Domínio | Nível |
|---|---|---|---|
| visao-geral | Visão geral | Executivo | Macro |
| arrecadacao | Arrecadação | Financeiro | Macro → micro |
| debitos | Lançamentos e débitos | Crédito | Macro → micro |
| divida | Dívida ativa | Cobrança | Macro → micro |
| parcelamentos | Parcelamentos | Cobrança | Macro → micro |
| economicos | Econômicos e ISS | ISS | Macro → micro |
| imobiliario | Imobiliário e IPTU | IPTU | Macro → micro |
| itbi | Transferências e ITBI | ITBI | Macro → micro |
| contribuintes | Contribuintes | Cadastro | Macro → micro |
| encerramento | Encerramento mensal | Gerencial | Macro |
| obras | Obras | Cadastro | Macro → micro |
| qualidade | Qualidade e auditoria | Governança | Micro/auditoria |
| receitas-creditos | Receitas e créditos tributários | Receita | Macro → micro |
| guias | Guias e documentos | Arrecadação | Macro → micro |
| indexadores | Indexadores e atualização monetária | Monetário | Macro → micro |
| territorio | Território cadastral | Geográfico | Macro → micro |

## Padrão obrigatório
Cada painel deve ter, quando a fonte permitir: KPIs, gráficos, filtros, status de cobertura, DETALHAR, tabela micro paginada/ordenável/pesquisável, exportação e ferramenta MCP equivalente.

## Próximas extensões de cobertura
- Débitos por receita: usar `debitos-receitas`.
- Pagamentos de parcelamentos: usar `pagamentos-parcelamentos`.
- Funil/tempo de tramitação do ITBI: usar `solicitacoes-transferencias-imoveis-movimentacoes`.
- ISS e IPTU podem permanecer como domínios especializados dentro de Econômicos/Imobiliário enquanto reutilizam a mesma verdade analítica; criar páginas dedicadas somente quando trouxerem análise adicional real, evitando duplicação cosmética.

## Estado de dados
Um KPI só pode mostrar zero quando a fonte carregou com sucesso e o valor calculado é realmente zero. Fonte ausente, parcial ou com erro deve ser explicitada como tal.
