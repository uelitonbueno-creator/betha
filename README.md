# BI Vella — teste Betha

Protótipo de front-end para uso como **URL do produto** no Betha Studio Aplicações.

## Arquitetura

- **GitHub Pages:** hospeda apenas arquivos públicos do front-end (HTML/CSS/JS).
- **Betha:** permanece como fonte dos dados consumidos pelas APIs autorizadas.
- **Segredos:** nunca devem ser gravados no front-end ou neste repositório público.
- Se uma integração exigir `client_secret` ou processamento protegido, deve existir um backend seguro.

## URL esperada do GitHub Pages

https://uelitonbueno-creator.github.io/betha/

Depois de habilitar o GitHub Pages na branch `main`, use essa URL no campo **URL do produto** do Studio Aplicações.

## Primeiro teste

Ao abrir a aplicação, o painel mostra:
- URL atual;
- referrer;
- parâmetros de query recebidos;
- data/hora local.

Isso serve para identificar qual contexto o Studio/Suíte Betha envia ao produto antes de conectarmos APIs reais.
