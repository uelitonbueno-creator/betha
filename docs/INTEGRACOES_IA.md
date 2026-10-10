# Integrações de IA e pesquisa externa — BI Vella
Atualização: 2026-10-09

## Objetivo e escopo
Esta integração operacionaliza a pesquisa **externa e pública** para auxiliar a manutenção do BI Vella, sem tocar nas cargas existentes, no Worker, na D1 ou nos dados das entidades. Ferramentas são conectores da sessão ChatGPT, não dependências runtime.

## Fluxo recomendado: atualização de documentação de APIs
1. Ler [MAPA_API_BETHA.md](MAPA_API_BETHA.md) e [api-integracoes-bi.md](api-integracoes-bi.md).
2. Selecionar documentos oficiais e públicos dos sistemas Tributos, Contabilidade, Compras e Folha. Usar **Firecrawl**, se disponível na sessão autorizada, para leitura pontual e metadados, nunca crawling de páginas internas autenticadas.
3. Conferir assinatura do endpoint, parâmetros, paginação, permissões, estruturas, campos e casos de erro com a documentação original.
4. Gerar um registro comparativo: `data | fonte URL | sistema/recurso | atual no BI | documentado | divergência | risco | recomendação | revisão`.
5. Abrir issue/PR de ajuste somente quando houver evidência. Preservar cargas avançadas, checkpoints, tentativas idempotentes e comportamento da troca de entidade.
6. Revisar alterações com testes e sem publicar dados/sigilos.

## Plugins relevantes
| Plugin | Uso neste repositório | Status |
| --- | --- | --- |
| Firecrawl | pesquisa na documentação técnica pública | Conectado ao ChatGPT; uso sob demanda |
| GitHub | revisão de código, commits, PRs | Conectado |
| Figma | análise de layout, componentes e acessibilidade | Conectado |
| GSC Wizard | apenas site de marketing público, não dashboards privados | Sem aplicação operacional atual |
| Consensus | não necessário para implementação de BI | Não aplicável |

## Critérios de aceite de uma pesquisa
- URL oficial, data, edição/versão quando publicada, comparação explícita contra código, riscos e passos de validação.
- Não citar trecho encontrado por buscador como contrato suficiente: confirmar em fonte oficial.
- Não copiar dados pessoais, credenciais, logs sensíveis ou payloads administrativos para serviços externos.
- Não implementar mudanças de produção automaticamente em consequência de uma pesquisa.

**Importante:** instalação do plugin dentro do ChatGPT não corresponde à instalação de uma integração no Cloudflare Worker. Uma integração backend futura requer API oficial, credenciais próprias guardadas em secrets e testes específicos, sem dependência de assinatura não autorizada.
