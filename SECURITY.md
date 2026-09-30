# Segurança das credenciais Betha

Este repositório é público. Nunca gravar aqui chave privada, Access Token, User-Access, client_secret, cookies/sessões ou respostas fiscais.

## Autenticação da Integrações BI

O backend envia:

```http
Authorization: Bearer <ACCESS_TOKEN>
User-Access: <USER_ACCESS>
```

O navegador nunca recebe esses valores.

## Multi-entidade

```text
GitHub Pages
   |
   | tenant lógico + filtros
   v
Backend BI Tributos
   |
   +-- valida sessão/autorização
   +-- resolve tenant
   +-- recupera User-Access secreto
   +-- escolhe fonte BI ou fonte base
   v
API Betha
```

Na fase inicial, os tenants ficam em `BETHA_TENANTS_JSON`, cadastrado como secret. Cada prefeitura tem seu próprio `User-Access`. Um `accessToken` específico por tenant também é suportado; na ausência dele, o backend usa `BETHA_ACCESS_TOKEN`.

## Fonte base

A fonte base é complementar e usa apenas endpoints explicitamente cadastrados em `BETHA_BASE_RESOURCE_MAP_JSON`. Não há proxy livre de URLs.

## Trava antes do SSO

Por padrão, `/api/data/*` fica bloqueado enquanto a autenticação da aplicação não estiver integrada. `ALLOW_UNAUTHENTICATED_DEV=true` serve apenas para teste controlado.

## Secrets

GitHub Pages não é cofre de runtime. Para um Worker, configure por exemplo:

```bash
wrangler secret put BETHA_ACCESS_TOKEN
wrangler secret put BETHA_TENANTS_JSON
```

Para dezenas/centenas de prefeituras, o registry poderá ser migrado para armazenamento persistente criptografado, mantendo apenas uma chave mestra no cofre do backend.