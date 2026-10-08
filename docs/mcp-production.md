# MCP do BI Vella — fila de produção

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

O catálogo gerado possui 16 comandos de painel:

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

Todos os 16 painéis atuais possuem constraints próprios no Page Mapping. O gerador bloqueia a liberação futura se surgir painel novo sem permissão correspondente.

Além dos painéis, o MCP publica 4 ferramentas analíticas de alto nível:

- `bi_revenue_breakdown`: arrecadação por receita, crédito tributário, tipo de pagamento, tipo de baixa ou classificação da guia;
- `bi_debt_portfolio`: carteira de débitos abertos, vencidos ou pagos com aging, crédito, origem e receita;
- `bi_active_debt_summary`: estoque e recuperação da dívida ativa sem ranking nominal de devedores;
- `bi_installments_summary`: parcelamentos, parcelas vencidas, entradas e recebimentos.

No Worker SDK v2 o total esperado passa a ser 29 ferramentas.

A primeira expansão multi-sistema adiciona três painéis genéricos e três ferramentas executivas:

- `get_contabil_visao_geral` + `bi_accounting_execution`: receita prevista/arrecadada, empenhado, liquidado, pago, resultado e restos a pagar;
- `get_compras_visao_geral` + `bi_procurement_summary`: processos, valores estimados/homologados, economia, contratos ativos e fornecedores;
- `get_folha_visao_geral` + `bi_payroll_summary`: servidores, bruto, líquido, descontos, encargos e custos agregados.

**Importante:** Contabilidade, Compras e Folha ainda usam `data/samples/*-100.json`, dados sintéticos/determinísticos. Toda resposta MCP desses módulos informa `dataMode: "sample"` e um aviso explícito para impedir interpretação como dado real da prefeitura.

A camada de consultas por sujeito adiciona:

- `bi_resolve_subject`: resolve nome/documento em candidatos com IDs estáveis e documento mascarado;
- `bi_company_iss_detail`: ISS de um econômico específico, com desambiguação, evolução mensal e composição;
- `bi_subject_financial_summary`: resumo agregado de débitos e dívida ativa de um contribuinte, sem endereço, documento completo ou lançamentos individualizados.

Ferramentas financeiras por sujeito exigem simultaneamente as permissões funcionais dos painéis envolvidos.

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
