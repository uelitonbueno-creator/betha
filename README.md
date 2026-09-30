# BI Tributos — Betha

Front-end de BI tributário no padrão visual Betha, preparado para operar de forma **multi-entidade** e navegar sempre do **macro para o micro**.

## Estado atual

- 12 visões analíticas.
- 55 KPIs.
- 95 gráficos/visualizações cadastradas.
- Drill-down preparado: visão geral → composição → registros → detalhe individual.
- Front único para várias prefeituras.
- Tenant lógico enviado pelo front; `User-Access` permanece no backend.
- API **Tributos - Integrações BI** como fonte preferencial.
- API **Dados do Tributos** como fonte complementar.
- Endpoints de leitura em allowlist.
- Nenhuma credencial no GitHub Pages.
- Rotas de dados protegidas até a integração da sessão/SSO Betha.

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

1. integrar a sessão/contexto do usuário Betha;
2. cadastrar a primeira entidade no cofre do backend;
3. publicar o backend;
4. implementar/cachear as agregações dos dashboards;
5. validar os números contra o Tributos;
6. liberar progressivamente as demais entidades.

Nenhum gráfico do front utiliza valores fictícios: enquanto a fonte real não estiver conectada, o componente permanece em estado **aguardando dados**.
