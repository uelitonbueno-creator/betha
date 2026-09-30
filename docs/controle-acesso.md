# Controle de acesso do BI Tributos

O BI usa a Central de Usuários e o Sistema de Autorizações da Betha como fonte oficial de identidade e permissões.

## Regras

1. O usuário precisa autenticar pela credencial Browser (OAuth PKCE).
2. O backend consulta `@me/access`.
3. O contexto `database + entity` do usuário deve coincidir com o tenant solicitado.
4. O backend usa o User-Access secreto da entidade somente depois dessa validação.
5. Administradores/técnicos podem consultar a lista de acessos da entidade e autorizar/remover usuários.
6. O Page Mapping define permissões por módulo e as operações administrativas.

## Page Mapping

Arquivo: `config/page-mapping.json`.

Para publicá-lo na Betha é necessário ativar a API **Autorizações Dados** em uma credencial com o escopo:

`autorizacoes.plataforma.betha.cloud/parceiro.escrita`

Endpoint oficial:

`PUT https://autorizacoes.suite.betha.cloud/dados/v1/page-mapping`

O arquivo já utiliza os contextos `database` e `entity`.

## Segurança multi-entidade

A seleção de entidade no front é apenas visual. A autorização real é feita novamente no Worker. Alterar manualmente `?tenant=` não concede acesso a outra prefeitura.

O retorno de `@me/access` contém `values.database` e `values.entity`, usados para o isolamento por contexto.
