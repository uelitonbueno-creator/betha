# BI Vella — Betha

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

### Cadastro de entidades no próprio BI

Em **Configurações → Entidades e prefeituras**, administradores e técnicos podem cadastrar ou editar nome, tenant, entityId, databaseId, User-Access e Access Token. O BI exige acesso administrativo Betha ao contexto informado e valida as credenciais antes de salvar. As chaves não são retornadas ao navegador; campos vazios na edição preservam os valores existentes. O token compartilhado é uma opção explícita no formulário.

As novas configurações são armazenadas por tenant no KV `BI_SESSIONS`, cifradas com AES-GCM e uma chave independente `BETHA_TENANT_CONFIG_KEY`, que deve permanecer estável entre publicações. Elas têm prioridade sobre `BETHA_TENANTS_JSON`; a configuração legada continua válida. Não remova ou troque a chave de cifragem sem migrar os registros existentes. O cadastro não cria licenças ou acessos na Central Betha.

O analítico oferece busca, filtro por campos efetivamente presentes na fonte e intervalo de datas quando houver colunas de data. Parcelas vinculadas consultam todos os exercícios e a exportação preserva o vínculo e os filtros locais. A busca paginada informa a continuidade até concluir a fonte e não transforma falhas da API em resultado vazio.


## Seletor de sistemas

O BI Vella separa a marca da aplicação do sistema de origem. O contexto do usuário segue o padrão **Entidade → Sistema → Painel**. Atualmente o sistema registrado é **Tributos**; novos sistemas podem ser adicionados ao catálogo público `window.BI_SYSTEMS`, preservando o tenant e redirecionando para a aplicação/rota configurada.


## Sistemas no BI Vella

O seletor de sistema mantém o contexto da prefeitura e troca o catálogo de navegação. Os grupos principais são genéricos em todos os módulos: **Início, Financeiro, Operações, Cadastros e Controle**.

- **Tributos**: dados reais pelo backend existente.
- **Contábil**: painéis iniciais de visão geral, receita, despesa, movimentos, credores e controle.
- **Compras**: painéis iniciais de visão geral, processos, licitações, contratos, fornecedores e controle.
- **Folha de pagamento**: painéis iniciais de visão geral, folha mensal, servidores, eventos, encargos e controle.

Enquanto a cota do Worker estiver indisponível, Contábil, Compras e Folha usam amostras locais de 100 registros por sistema. Essas amostras são sintéticas e servem somente para validar interface e análise. A coleta real sem Worker pode ser feita por `scripts/import-betha-samples.mjs` em um ambiente seguro com as credenciais Betha.
