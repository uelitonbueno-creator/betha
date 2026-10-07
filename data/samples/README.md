# Amostras multi-sistema do BI Vella

## Estado atual

Os arquivos `contabil-100.json`, `compras-100.json` e `folha-100.json` possuem **100 registros sintéticos/determinísticos cada** para validar menu, KPIs, gráficos, responsividade, filtros e exportações sem consumir o Cloudflare Worker.

Eles **não são dados reais da prefeitura** e nunca devem ser tratados como produção.

## Importação real sem Cloudflare

O script `scripts/import-betha-samples.mjs` consulta diretamente uma URL de API Betha a partir de um ambiente seguro (máquina local, executor ou CI privado) e grava até 100 registros brutos em `data/raw/`.

Variáveis exigidas:

- `BETHA_ACCESS_TOKEN`
- `BETHA_USER_ACCESS`
- `BETHA_CONTABIL_SAMPLE_URL`
- `BETHA_COMPRAS_SAMPLE_URL`
- `BETHA_FOLHA_SAMPLE_URL`

Exemplo:

```powershell
$env:BETHA_ACCESS_TOKEN = "Bearer ..."
$env:BETHA_USER_ACCESS = "..."
$env:BETHA_CONTABIL_SAMPLE_URL = "https://...endpoint-oficial..."
node scripts/import-betha-samples.mjs contabil
```

Não versionar tokens/chaves. Depois da primeira coleta real, os campos retornados devem ser mapeados para o catálogo analítico antes de substituir os dados sintéticos.
