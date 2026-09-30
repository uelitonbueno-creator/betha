# BI Tributos — integração Betha

Protótipo de BI tributário com interface inspirada nos produtos Betha e preparado para consumir a API **Tributos integrações BI**.

## Estado atual

- Layout inicial no padrão visual Betha.
- Uso dos Web Components oficiais `@betha-plataforma/estrutura-componentes`.
- Material Design Icons.
- Dashboard responsivo com módulos e indicadores.
- Front-end sem credenciais.
- Contrato preparado para backend seguro.
- Exibição do contexto recebido ao abrir o produto pela Suíte.
- Esqueleto de backend em `backend/`.

## Arquitetura

```text
Betha Suíte / Studio
        |
        v
GitHub Pages
(front-end)
        |
        v
Backend seguro
(secrets)
        |
        v
Tributos integrações BI
        |
        v
Dados da entidade Betha
```

## Publicação do front-end

GitHub Pages:

```text
https://uelitonbueno-creator.github.io/betha/
```

No Studio Aplicações, esta é a URL a utilizar no campo **URL do produto** depois que o Pages estiver habilitado.

## Credenciais

**Não colocar chave privada, Access Token ou User-Access neste repositório.**

A documentação Betha usa os cabeçalhos:

```http
Authorization: Bearer <ACCESS_TOKEN>
User-Access: <USER_ACCESS>
```

Esses valores ficam apenas no backend.

Veja [SECURITY.md](SECURITY.md).

## Próxima etapa técnica

1. Mapear os endpoints do Swagger **Tributos integrações BI**.
2. Preencher o host e paths no backend.
3. Configurar `BETHA_ACCESS_TOKEN` e `BETHA_USER_ACCESS` como secrets.
4. Publicar o backend.
5. Informar a URL do backend em `config.js`.
6. Ligar os indicadores e gráficos aos retornos reais.

## Referências oficiais

- Design System Betha: https://docs.plataforma.betha.cloud/
- Estrutura Componentes: https://github.com/betha-plataforma/estrutura-componentes
- Tema Bootstrap 5: https://github.com/betha-plataforma/theme-bootstrap5
- Studio Aplicações: https://studio.ajuda.betha.cloud/aplicacoes/studio/
