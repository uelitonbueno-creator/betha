# BI Tributos — desenho macro → micro

O front foi estruturado para nunca começar pela listagem bruta. A navegação segue quatro níveis:

1. **Macro** — KPIs e tendência geral.
2. **Composição** — crédito, receita, situação, origem ou território.
3. **Ocorrência** — pagamento, débito, dívida, parcela, imóvel, econômico etc.
4. **Registro** — detalhe individual preservando os filtros usados no nível anterior.

## Catálogo atual

A configuração em `dashboard-catalog.js` possui **12 visões**, **55 KPIs** e **95 gráficos/visualizações analíticas**.

### Visões

- Visão geral
- Arrecadação
- Lançamentos e débitos
- Dívida ativa
- Parcelamentos
- Econômicos e ISS
- Imobiliário e IPTU
- Transferências e ITBI
- Contribuintes
- Encerramento mensal
- Obras
- Qualidade e auditoria

## Fonte preferencial

A regra é:

```text
Integrações BI
      |
      | dado insuficiente?
      v
Dados do Tributos
      |
      v
normalização / agregação
      |
      v
dashboard
```

A API `Integrações BI` é a fonte principal para pagamentos, débitos, dívidas, parcelamentos, econômicos, imóveis, contribuintes e transferências.

A API `Dados` complementa principalmente:

- histórico mensal de lançamentos;
- histórico mensal da dívida;
- planta de valores;
- dados mais ricos do imóvel;
- obras;
- créditos tributários;
- guias unificadas;
- detalhamento adicional de parcelamentos e dívida.

## Regra de drill-down

Todo gráfico deve preservar o contexto:

```text
Entidade
+ período
+ exercício
+ filtros
+ categoria clicada
        |
        v
lista dos registros que compõem o ponto
        |
        v
registro individual
```

Nenhum total deve existir sem ser rastreável até os registros que o formam.

## Performance

Os dashboards não devem baixar a base inteira para o navegador. O backend deve:

- paginar a Betha;
- selecionar somente os campos necessários;
- agregar no servidor;
- usar cache por tenant/período;
- fazer carga incremental quando `dhOperacao` estiver disponível;
- devolver ao navegador somente KPIs, séries agregadas e as linhas do drill-down solicitado.

Para histórico financeiro, os endpoints de encerramento mensal são preferíveis a recalcular fotografias antigas a partir do estado atual.
