# bi-vella-mcp

Worker MCP remoto do BI Vella.

## Estado

**Implementação canônica SDK v2 / fail-closed.**

A rota `/mcp` retorna indisponível enquanto `MCP_AUTH_READY` não for explicitamente ativado e a introspecção de token não estiver configurada.

## Segurança

- somente leitura;
- ferramentas derivadas do catálogo real de painéis;
- ferramenta só é registrada se o usuário tiver a permissão correspondente;
- tenant solicitado é validado contra a lista autorizada no principal;
- multi-entidade continua baseada em `database + entity` no BI;
- o MCP chama o BI com sessão curta, nunca com `User-Access` no cliente;
- auditoria não registra o payload de dados retornado.

## Variáveis

- `BI_API_BASE`: URL do Worker BI.
- `MCP_AUTH_READY`: deve permanecer `false` até OAuth/introspecção passar nos testes.
- `MCP_INTROSPECTION_URL`: endpoint do BI que valida o access token MCP e devolve principal, permissões, tenants e sessão curta do BI.
- `MCP_AUDIT_URL`: sink interno opcional para auditoria.
- `MCP_INTERNAL_AUDIT_TOKEN`: segredo opcional do sink de auditoria.

## Teste de build

```bash
npm install
npm run check
```

## Estado de liberação

Concluído:

1. OAuth 2.1 completo;
2. endpoint de introspecção;
3. auditoria persistente;
4. guard automático tenant A × tenant B;
5. ferramentas analíticas especializadas em paridade com o endpoint de produção;
6. resolução segura de contribuinte/econômico com desambiguação e documentos mascarados;
7. visão executiva MCP de Contabilidade, Compras e Folha usando as amostras locais sintéticas de 100 registros.

Pendente antes do cutover definitivo para o Worker SDK v2:

1. MCP Inspector;
2. credenciais de deploy Cloudflare do Worker isolado;
3. validação de `get_arrecadacao`, `get_imobiliario` e das ferramentas analíticas com dados reais;
4. substituição das amostras sintéticas de Contabilidade, Compras e Folha pelas APIs reais antes de tratar esses três módulos como produção.
