# Segurança das credenciais Betha

## Regra principal

Este repositório é público. Nunca gravar aqui:

- chave privada;
- Access Token;
- User-Access;
- client_secret;
- cookies/sessões;
- respostas da API que contenham dados pessoais ou fiscais.

## Arquitetura adotada

```text
GitHub Pages (front-end público)
        |
        | HTTPS sem credenciais Betha
        v
Backend serverless / API própria
        |
        | Authorization: Bearer <token>
        | User-Access: <user-access>
        v
API Betha
```

O navegador conhece apenas a URL do nosso backend. As credenciais Betha permanecem no cofre de segredos do provedor do backend.

## Credencial de Serviço

Para BI, a documentação do Studio indica a credencial de Serviço, usando Client Credentials.

No nosso caso inicial:

- **Chave pública:** pode ser usada no fluxo de autorização da entidade, mas não precisa ficar no front.
- **Chave privada:** manter fora do GitHub e fora do navegador.
- **Access Token:** guardar como secret do backend.
- **User-Access:** guardar como secret do backend; é específico por contexto/entidade.
- **Client secret:** se for usado para renovar/obter token, somente no backend.

Se o token for gerado manualmente no Studio e for de longa duração, não há necessidade de guardar a chave privada no ambiente de execução.

## GitHub Secrets

GitHub Actions Secrets são adequados para CI/CD, mas **não são um cofre de runtime para GitHub Pages**. Uma página estática não consegue usar um secret sem que ele acabe exposto no navegador.

## Provedor sugerido para o backend

O projeto contém `backend/worker.js`, preparado para um serviço serverless com secrets. Uma opção simples é Cloudflare Workers:

```bash
wrangler secret put BETHA_ACCESS_TOKEN
wrangler secret put BETHA_USER_ACCESS
```

Os valores não entram no Git nem no JavaScript entregue ao usuário.
