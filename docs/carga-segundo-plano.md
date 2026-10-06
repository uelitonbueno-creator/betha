# Carga dos painéis em segundo plano

Administração → Configurações → Entidades e prefeituras. Selecione uma prefeitura salva, configure a frequência e clique em **Carga inicial / Atualizar todos**.

O servidor consulta as 44 fontes em lotes de até oito páginas por minuto. A carga pode levar vários minutos, conforme o volume e o tempo de resposta da Betha. A execução continua com o navegador fechado. O status informa fontes concluídas, registros e fontes indisponíveis. Uma execução ativa não é reiniciada pelo botão.

As opções são manual, 15 ou 30 minutos, 1, 3, 6 ou 12 horas e diariamente. O intervalo é contado a partir da conclusão da carga anterior, evitando sobreposição. O Cron Trigger verifica trabalhos a cada minuto. Novos triggers da Cloudflare podem levar alguns minutos para propagar.

Os 222 gráficos das 44 fontes e seus detalhes consultam a última carga concluída. Filtros continuam sendo aplicados aos registros dessa carga. Durante uma atualização, a carga anterior permanece disponível. Os detalhes conservam a versão do gráfico aberto. Fontes com falha são identificadas; seus números não são tratados como totais completos. O cadastro das credenciais permanece disponível no mesmo formulário.

Os registros ficam no backend, em snapshots temporários com validade de sete dias, separados por prefeitura, entidade, database e credenciais. A rotação de credenciais exige nova carga. A autorização de cada fonte é conferida antes da leitura, inclusive no detalhamento. Uma carga manual com mais de sete dias deve ser executada novamente.

A implantação registra `* * * * *` no Worker `betha-bi-api`. A configuração equivalente está em `wrangler.jsonc`.
