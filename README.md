# BI Tributos — Betha

Front-end de BI tributário no padrão visual Betha, preparado para operar de forma **multi-entidade** e navegar sempre do **macro para o micro**.

## Estado atual

- 16 visões analíticas.
- 55 KPIs.
- 95 gráficos/visualizações cadastradas.
- Drill-down preparado: visão geral → composição → registros → detalhe individual.
- Front único para várias prefeituras.
- Tenant lógico enviado pelo front; `User-Access` permanece no backend.
- API **Tributos - Integrações BI** como fonte preferencial.
- API **Dados do Tributos** como fonte complementar.
- Endpoints de leitura em allowlist.
- Nenhuma credencial no GitHub Pages.
- Sessão OAuth Betha integrada no front/Worker.
- Pós-login multi-entidade: uma entidade entra automaticamente; múltiplas exibem seletor.
- Rotas de dados protegidas por validação de database + entity no backend.

## Visões

1. Visão geral
2. Arrecadação
3. Lançamentos e débitos
4. Dívida ativa
5. Parcelamentos
6. Econômicos e ISS
7. Imobiliário e IPTU
8. Transferências e ITBI
9. Contribuintes
10. Encerramento mensal
11. Obras
12. Qualidade e auditoria

## Arquitetura

```text
Betha Suíte
    |
    v
GitHub Pages
(front único / layout)
    |
    | tenant + filtros
    v
Backend multi-tenant
    |
    +------------------------+
    |                        |
    v                        v
Integrações BI          Dados do Tributos
fonte principal         fonte complementar
    |                        |
    +-----------+------------+
                v
         agregação / cache
                |
                v
      KPIs + gráficos + drill-down
```

## Publicação do front

```text
https://uelitonbueno-creator.github.io/betha/
```

## Arquivos principais

- `dashboard-catalog.js`: catálogo completo das visões, KPIs e gráficos.
- `app.js`: navegação, renderização e drill-down.
- `backend/worker.js`: gateway seguro multi-entidade.
- `backend/SOURCES.md`: política das fontes BI/base.
- `docs/api-integracoes-bi.md`: endpoints da Integrações BI.
- `docs/visoes-macro-micro.md`: arquitetura analítica.
- `SECURITY.md`: regras para credenciais.

## Segurança

O front nunca recebe:

- Access Token Betha;
- User-Access;
- chave privada;
- client_secret.

Esses valores pertencem exclusivamente ao backend.

## Próxima etapa de execução

Para transformar a estrutura em dados reais:

1. publicar a versão atual do Worker no Cloudflare;
2. validar o login real e os acessos retornados por `/api/me/tenants`;
3. cadastrar/confirmar as entidades no cofre do backend;
4. validar os números dos dashboards contra o Tributos;
5. liberar progressivamente as demais entidades.

Nenhum gráfico do front utiliza valores fictícios: enquanto a fonte real não estiver conectada, o componente permanece em estado **aguardando dados**.

## Carga dos painéis

Os 15 painéis além da Visão Geral consultam as fontes em lotes de 250 registros,
com continuidade automática e recálculo sobre todos os registros já carregados.
A cobertura permanece **PARCIAL** até a fonte confirmar o fim da paginação.
Respostas de consultas anteriores são ignoradas quando o usuário muda o painel,
os filtros ou a prefeitura. Erros de fonte não são apresentados como KPIs zerados.

Os lotes brutos permanecem somente no backend, em cache temporário de uma hora,
isolado pelo contexto da prefeitura. Cada lote continua exigindo sessão e as
permissões existentes. DETALHAR e MCP mantêm seus fluxos atuais de leitura.

Validação de paginação, erros, isolamento e cobertura dos 15 builders:
`node --test tests/dashboard-loading.test.cjs`.
