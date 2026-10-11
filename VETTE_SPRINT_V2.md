# Sprint V2 — Portal da Frota e SAGRES Frota

Branch exclusiva: `vette`. Nenhum merge para `main` antes das cinco sprints. Não executar deploy manual, migrações ou transmissão com dados reais.

## Entregas de código iniciadas

- `src/lib/frotas/fuel-order.ts`: serviço compartilhado de finalização para a baixa administrativa e o portal do posto. Usa transação PostgreSQL, bloqueia a ordem e depois o veículo, valida credenciais, litros, preço e leitura, gera um único consumo e registra a origem da confirmação.
- `src/app/app-domain/frotas/gestao/actions.ts`: baixa administrativa delega ao serviço compartilhado, preservando permissões e auditoria.
- `src/app/portal/frota/actions.ts`: confirmação pelo posto delega ao mesmo serviço, mantendo verificação do trio de credenciais.
- `src/app/app-domain/portal-frota/actions.ts`: saídas e chegadas bloqueiam motorista e veículo na mesma ordem das operações administrativas; verificam viagens abertas, setor do servidor, CNH e leitura. Upload de foto limitado a JPEG/PNG/WebP com no máximo 5 MB (usa armazenamento privado já configurado).
- `src/app/app-domain/portal-frota/page.tsx`: lista de veículos restringida ao setor ativo do servidor.
- `tests/frotas.integration.test.ts`: cenários em banco isolado para rejeitar credenciais incorretas e litros excessivos, registrar um consumo com valor exato e rejeitar repetição da baixa.
- `.github/workflows/vette-frota-v1.yml`: cobertura das rotas do Portal da Frota e execução de testes unitários do portal e da frota; memória do typecheck ajustada.

## Ainda pendente para encerrar a V2

- [ ] Executar o CI completo após os commits finais, verificar testes, typecheck e build seguro; não alegar sucesso enquanto houver execução pendente.
- [ ] Teste de concorrência real com conexões independentes PostgreSQL, inclusive portal do posto contra baixa administrativa e saídas/chegadas simultâneas. PGlite com conexão única não prova essa condição.
- [x] Implementar limitação de tentativas compartilhada entre instâncias no portal dos postos e oficinas, com teste em fixture PGlite. Validação no CI atual ainda pendente.
- [x] Vincular oficina por CNPJ à OS, usar código de uso único e impedir duplicidade de submissões pendentes. [ ] Revisar conclusão administrativa da OS e idempotência de eventuais apropriações financeiras.
- [x] Implantar projeção pública sanitizada de frota ativa, filtro mensal e por setor, custos conhecidos de combustível/manutenção e download CSV sem fórmulas. [ ] Obter política municipal de publicação, definir acesso aos registros históricos/inativos, demais filtros, exportação XLSX/PDF e reconciliação integral com relatório oficial.
- [ ] Obter documentação e credenciais oficiais SAGRES Frota aplicáveis ao edital; substituir o layout provisório CF-2026.1 sem declarar arquivo homologado prematuramente.
- [ ] Validar fluxo oficial da API, retorno assíncrono, remessa, protocolo e tratamento das pendências em ambiente de homologação com dados fictícios.
- [ ] Confirmar que a integração de builds Cloudflare não publica `vette` no ambiente final; commits podem iniciar builds automaticamente, mesmo sem deploy manual.

## Dependências herdadas da V1

Uma execução subsequente da vette aprovou testes unitários, testes de integração, TypeScript e build após o ajuste de memória. Isso não homologa automaticamente os commits posteriores da V2; a execução referente ao HEAD mais recente é requisito para aceite.

## Atualização: oficinas, limite de tentativas e integração SAGRES

- Oficina: a emissão do código exige CNPJ válido e nome da oficina autorizada; a ordem grava os dois campos. O envio somente é aceito do CNPJ vinculado, com token de uso único. A recusa permite emissão posterior de outro código; um registro recebido ou conferido bloqueia novo envio.
- Migração `20260929000000_frota_oficina_autorizada`: cria campos de vínculo na OS e revoga tokens anteriores que não estavam vinculados formalmente a uma oficina. Sem migração executada na produção.
- Segurança: `FleetPortalRateLimit` controla tentativas por fonte e código, com UPSERT atômico no PostgreSQL e retenção de somente hashes SHA-256. Migração `20260929010000_frota_portal_rate_limit`. A identificação de IP é uma pista operacional, não mecanismo de autenticação.
- Serviço de oficinas isolado e testável: `src/lib/frotas/workshop-report.ts`; testes adicionais de rejeição de CNPJ/token, repetição, recusa e nova autorização.
- Cliente SAGRES: `src/lib/integrations/sagres/captura-frota-sandbox.ts`. Suporta abertura vazia e consulta de remessa BALANCETE_FROTA apenas no domínio de homologação documentado, mediante token explicitamente informado. Ainda não mapeia nem envia entidades reais. Testes usam função fetch simulada, sem conexão externa.
- Fontes oficiais verificadas: https://docs-api.tce.pb.gov.br/docs/openapi-sagres-captura e https://tce.pb.gov.br/noticias/tce-apresenta-sagres-2-0-para-o-recebimento-de-dados-sobre-gastos-com-folha-frota-e-farmacia/.

O layout texto `CF-2026.1` continua expressamente provisório; o SAGRES Captura 2.0 não foi homologado. Não inserir token de produção nesta fase.

## Atualização: portal público e exportação

- `src/lib/frotas/public-report.ts`: extrai dados públicos selecionados diretamente das tabelas da Frota. Não inclui motoristas, itinerários, fotos privadas ou códigos de conferência. Abastecimentos consideram `FleetConsumption`; gastos de manutenção consideram `FleetExpense` com natureza `MANUTENCAO`.
- `src/app/portal/frota/page.tsx`: filtro por mês e secretaria/setor, totais conhecidos de combustível e manutenção, distinção entre ausência de despesa e despesa de valor não informado.
- `src/app/api/portal/frota/exportar/route.ts`: CSV com a mesma origem de dados, escape contra fórmulas em planilhas e limite distribuído por origem.
- `tests/fleet-portal.test.ts`: testes puros do período e da sanitização CSV. Confirmação de execução ainda depende de CI para o HEAD atual.
- Atenção: as informações exibidas limitam-se aos veículos **atualmente ativos**. A política de publicação e a conciliação histórica com SAGRES exigem definição específica antes da homologação. O arquivo SAGRES atual ainda é provisório.

## Etapa SAGRES: situações históricas certificadas

- A documentação oficial exige mensalmente SITUACAO_FROTA e ABASTECIMENTO. A página de situação está identificada pelo TCE-PB como **WIP**, portanto o esquema e os códigos precisam ser reconfirmados antes de homologar uma transmissão.
- `src/lib/integrations/sagres/captura-frota-situation.ts`: adaptador OFFLINE para os dados de situação confirmados pelo setor da Frota. Exige uma situação no primeiro dia da competência; aceita alterações de estado com data, rejeita duplicidades, códigos desconhecidos e movimentação posterior à baixa definitiva.
- `src/lib/integrations/sagres/captura-frota-prepare.ts`: combina situações e abastecimentos já validados. Não forma pacote parcial com pendências e não tenta reconstruir meses passados usando o status atual do cadastro.
- `tests/sagres.test.ts`: adicionados cenários de histórico mensal, manutenção temporária, duplicidade, baixa definitiva e preparação conjunta de combustível/situação.
- **Limitação estrutural ainda aberta:** persistir/coletar o histórico mensal certificado e o cadastro oficial de veículos/máquinas vinculado a cada unidade gestora; manter trilha de aprovação e compatibilizar dados de propriedade/locação com os demais cadastros. Os novos conversores não geram esse histórico automaticamente.
- **Bloqueio de segurança:** não há envio para o TCE nem aplicação de migrações externas. A versão oficial publicada para a POC precisa ser confrontada com o edital, layouts e homologação.

Documentação de referência:
- https://docs.tcepb.tc.br/books/entidades/page/wip-situacao-frota-2025
- https://docs.tcepb.tc.br/books/entidades-frota/page/abastecimento-2025


## Persistência do histórico certificado (código na vette, não aplicado na produção)

Implementados na branch `vette`:
- `prisma/frota-sagres.prisma` e `prisma.config.ts`: novos modelos Prisma em esquema multi-file para competência, identidade histórica do veículo, situações datadas, revisões e eventos de auditoria.
- `prisma/migrations-cacimba/20260929020000_frota_sagres_historico/migration.sql`: migração isolada contendo as tabelas relacionais, índices e restrições; NÃO executada no banco da Prefeitura.
- `src/lib/integrations/sagres/frota-history.ts`: rascunhos mensais, inclusão/exclusão justificada de veículos e situações por competência, escopo de acesso e eventos de auditoria transacionais.
- `src/lib/integrations/sagres/frota-history-certify.ts`: prévia cruzando histórico certificado e consumo na competência; certificação administrativa com snapshot de identidade, evidências, combustível e payload validados; SHA-256 canônico e versões imutáveis preservadas após reabertura justificada.
- `src/app/app-domain/frotas/gestao/sagres/`: tela e ações administrativas para registrar identidade histórica e situações, visualizar pendências, certificar e reabrir versões; acesso apenas por administrador da Frota.
- `tests/frotas.integration.test.ts`: fixture de banco isolado atualizada e novos cenários de permissões, certificação, bloqueio de edição após certificação, correção e preservação de versões.

Limitações pendentes de aceite:
- O histórico não é reconstruído automaticamente a partir do status atual da Frota; cada competência depende de atestação documental responsável.
- Os códigos/contrato de SITUACAO_FROTA permanecem preliminares enquanto a documentação oficial constar em elaboração.
- A transmissão de quaisquer dados ao TCE-PB continua desabilitada nesta fase; o pacote persistido só estará disponível após migração e homologação em ambiente de teste separado.
- Submeter à homologação de negócios a política de preservação de históricos, a cadeia de custódia de evidências e o procedimento de competência já enviada ao TCE.

## Continuação: conciliação, aprovação de oficinas e transporte isolado

- `src/lib/integrations/sagres/frota-reconciliation.ts`: diagnóstico puro de ordens confirmadas, consumos e despesas, incluindo vínculos repetidos, custos diferentes e alterações posteriores à certificação.
- `src/lib/integrations/sagres/frota-reconciliation-db.ts`: consulta somente leitura por competência e, quando aplicável, comparação com a revisão certificada e conferida por SHA-256.
- `src/lib/integrations/sagres/frota-history-certify.ts`: bloqueia certificações com pendências de conciliação; congela custo, origem e referência no extrato imutável. Transação de certificação com isolamento REPEATABLE READ.
- `src/app/app-domain/frotas/gestao/sagres/page.tsx`: apresenta pendências de conciliação antes da certificação e divergências após certificação.
- Oficinas: revisão administrativa pode ocorrer apenas uma vez, serializada pelo bloqueio da OS; a conclusão de OS vinculada à oficina exige um único laudo conferido e custo coincidente. A despesa permanece centralizada na conclusão da OS, sem nova apropriação ao conferir o laudo.
- `src/lib/integrations/sagres/captura-frota-transport.ts`: cliente separado para API **exclusivamente SANDBOX**, com envio explícito de entidades, consolidação e leitura de validações/agregados, sem retry automático de POSTs nem leitura de credenciais de produção. O envio de SITUACAO_FROTA provisório exige confirmação explícita no chamador. **Não foi executada nenhuma transmissão**.
- `tests/sagres.test.ts` e `tests/frotas.integration.test.ts`: testes simulados de transporte e de conciliação financeira, além da exigência de laudo aprovado na conclusão de OS.
- **Ajuste financeiro posterior:** a baixa compartilhada de ordens de combustível agora registra o consumo e sua única apropriação em `FleetExpense` dentro da mesma transação. Sem essa alteração, o relatório interno `Gastos` poderia omitir abastecimentos do posto. A conciliação passa a exigir despesa vinculada também para esses consumos.
- `prisma/migrations-cacimba/20260929030000_frota_orders_financial/migration.sql`: backfill idempotente para ordens antigas confirmadas que tinham consumo, mas não a despesa; não altera valores desconhecidos nem cria nova despesa se já houver apropriação. Incluído teste de reaplicação na base fictícia. **Nenhuma migração foi executada no banco da Prefeitura.**

**Pendências preservadas:** executar e aprovar CI sobre o HEAD mais recente; confirmar a nova suíte `tests/frota-concurrency.pg.test.ts`, que usa dois clientes independentes em PostgreSQL temporário via GitHub Actions para simular corridas entre posto/posto e oficina/oficina (PGlite continua cobrindo integrações); ampliar depois as corridas portal do motorista versus gestão interna; homologar com Prefeitura/TCE as entidades e os códigos oficiais ainda em revisão, incluindo VEICULO/MAQUINA/PROPRIETARIO_FROTA quando exigíveis; definir política municipal de publicação histórica; homologar a execução da migração em banco de teste isolado; verificar controle de branch no Cloudflare antes de qualquer promoção ao ambiente final.

**Documentação oficial consultada:**
- https://docs.tcepb.tc.br/books/wiki/page/fluxos-fluxo-envio-das-informacoes
- https://docs.tcepb.tc.br/books/wiki/page/envios-entidades-por-tipo-de-envio-e-exercicio
- https://docs.tcepb.tc.br/books/entidades-frota/page/abastecimento-2025
