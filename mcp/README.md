# betha-bi-mcp

Worker MCP remoto do BI Tributário.

## Estado

**Fila de produção / fail-closed.**

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

## Não liberar ainda

A publicação fica bloqueada até:

1. OAuth 2.1 completo;
2. endpoint de introspecção;
3. auditoria persistente;
4. teste tenant A × tenant B;
5. MCP Inspector;
6. validação de `get_arrecadacao` e `get_imobiliario` com dados reais.
