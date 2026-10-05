# Mapa da API Betha — BI Tributos

Atualizado em 05/10/2026 a partir do `BI_RESOURCES` do Worker em produção no repositório.

## Contrato
- Base: `https://tributos.suite.betha.cloud`
- Namespace: `/integracoes-bi/v1`
- Autorização permanece no backend; nunca expor Bearer/User-Access no frontend.
- Paginação deve percorrer `content` enquanto houver próxima página; erro/parcial nunca equivale a zero.

## Recursos BI atualmente mapeados
| Recurso | Endpoint | Domínio | Uso analítico |
|---|---|---|---|
| contribuintes | /contribuintes | Cadastro | contribuintes, qualidade, busca, 360° |
| imoveis | /imoveis | Imobiliário | imóveis/IPTU, território, qualidade |
| imoveis-responsaveis | /imoveis/responsaveis | Imobiliário | titularidade, micro/360° |
| imoveis-corresponsaveis | /imoveis/corresponsaveis | Imobiliário | corresponsabilidade, micro |
| imoveis-campos-adicionais | /imoveis/campos-adicionais | Imobiliário | atributos complementares/qualidade |
| economicos | /economicos | Econômico/ISS | cadastro econômico, ISS, 360° |
| economicos-atividades | /economicos/atividades | Econômico/ISS | atividades, situação e qualidade |
| indexadores | /indexadores | Monetário | indexadores |
| indexadores-valores | /indexadores/valores | Monetário | série histórica |
| receitas | /receitas | Receita | receitas/créditos |
| debitos | /debitos | Lançamentos | lançado, saldo, inadimplência |
| debitos-receitas | /debitos/receitas | Lançamentos | composição por receita; integrar |
| dividas | /dividas | Dívida ativa | estoque, situação, cobrança |
| dividas-receitas | /dividas/receitas | Dívida ativa | composição por receita |
| parcelamentos | /parcelamentos | Parcelamento | contratos/situação |
| parcelamentos-referentes | /parcelamentos/referentes | Parcelamento | origem/referência |
| parcelamentos-parcelas | /parcelamentos/parcelas | Parcelamento | parcelas, vencimento e saldo |
| pagamentos | /pagamentos | Arrecadação | pagamentos e evolução |
| pagamentos-parcelamentos | /pagamentos/parcelamentos | Arrecadação | pagamentos ligados a parcelamento; integrar |
| pagamentos-detalhados | /pagamentos-detalhados | Arrecadação | crédito/receita/documento |
| pagamentos-detalhados-valores | /pagamentos-detalhados/valores | Arrecadação | tributo, juros, multa, correção e descontos |
| solicitacoes-transferencias-imoveis | /solicitacoes-transferencias-imoveis | ITBI | solicitações |
| solicitacoes-transferencias-imoveis-itens | /solicitacoes-transferencias-imoveis/itens | ITBI | valores declarados/ITBI |
| solicitacoes-transferencias-imoveis-movimentacoes | /solicitacoes-transferencias-imoveis/movimentacoes | ITBI | fluxo/movimentações; integrar |
| transferencias-imoveis | /transferencias-imoveis | ITBI | transferências |
| transferencias-imoveis-compra | /transferencias-imoveis/compra | ITBI | compra/transação |

## Lacunas de cobertura identificadas
Os três recursos abaixo já existem no Worker, mas ainda não aparecem como fonte `bi:` no catálogo visual:
1. `debitos-receitas` — enriquecer Lançamentos e débitos/Receitas.
2. `pagamentos-parcelamentos` — enriquecer Arrecadação/Parcelamentos.
3. `solicitacoes-transferencias-imoveis-movimentacoes` — enriquecer ITBI com etapas e tempo de tramitação.

## Regra para novos endpoints
Qualquer endpoint adicional encontrado na OpenAPI deve entrar primeiro na allowlist `BI_RESOURCES`, depois em builder analítico, catálogo visual, micro/drill-down, permissões e MCP. Não criar proxy genérico.
