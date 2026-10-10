# BI Vella — instruções para agentes e assistentes

Este repositório é o aplicativo multi-entidade/multi-sistema BI Vella (Tributos, Contabilidade, Compras e Folha).

## Ferramentas conectadas / política de uso
- **GitHub**: usar para leitura, testes, commits, revisão e controle de alterações.
- **Figma**: usar para especificações de interfaces, sem alterar permissões do BI.
- **Firecrawl (conectado no ChatGPT)**: consultar SOMENTE documentação técnica pública e autorizada da Betha ou outras APIs para conferir contratos, alterações e exemplos. Registrar URL original, data de acesso, versão e incertezas.
- **GSC Wizard (conectado no ChatGPT)**: **não aplicar ao conteúdo do BI protegido por login**. Serve apenas a eventual site institucional público, se futuramente houver propriedade GSC verificada.
- **Consensus (conectado no ChatGPT)**: não faz parte do fluxo operacional/tributário do BI; não invocar por padrão.

## Regras de segurança
1. Plugins conectados ao ChatGPT não são bibliotecas do Worker e não concedem automaticamente acesso ao backend, à Cloudflare D1 ou às APIs Betha.
2. Não transmitir Bearer, OAuth, cookies, User-Access, X-Tenant-Id, identificadores pessoais, registros tributários/folha ou dados de prefeituras a ferramentas de pesquisa na web.
3. Nunca colocar tokens/chaves em GitHub, HTML, prompts de terceiros, respostas ou logs.
4. Preservar isolamento entre entidades, autenticação, filtros, paginação segura, checkpoints de carga e esquema D1. Uma consulta a documentação não autoriza deploy.
5. Validar mudanças de API em branch com testes e revisão antes de publicar.
6. Se uma ferramenta do ChatGPT não estiver disponível na execução, usar documentação oficial manualmente e registrar a limitação; sem introduzir serviços pagos obrigatórios.

Detalhamento: [docs/INTEGRACOES_IA.md](docs/INTEGRACOES_IA.md).
