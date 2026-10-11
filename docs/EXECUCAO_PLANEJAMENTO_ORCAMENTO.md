# Planejamento e Orçamento — execução e continuidade

Data: 11/10/2026. Meta: **99/99 Prefeitura e 99/99 Câmara**. Plano: [PLANO_IMPLEMENTACAO_PLANEJAMENTO_ORCAMENTO.md](PLANO_IMPLEMENTACAO_PLANEJAMENTO_ORCAMENTO.md).

## Entrega implementada neste bloco

- Jornadas próprias `/planejamento/*` e `/camara/planejamento/*`, com item/card no menu da Câmara e componentes ERP compartilhados.
- Listas/detalhes de PPA, LDO e LOA; criação transacional sobre as peças canônicas existentes, com cadeia por entidade e exercício.
- Vínculos explícitos entidade↔UG e jurisdição Executivo/Legislativo; política de acesso nas páginas e actions, com filtros aplicados antes de count/totais/listas.
- Formulários de programas com origem, diretrizes, público-alvo, financiamento, gerente, objetivo e indicador; cadastro de ações.
- Previsões de receita/despesa por ano/UG/fonte, classificação de despesa, produto e meta física; espelhos das previsões/fixações e totais da LOA canônica na mesma transação.
- Cadastro de fontes com campos TCE/STN, naturezas de receita/despesa, grau/código reduzido e percentuais de distribuição de receita. Rateio Decimal com conservação de centavos e validação de 100% para efetivação.
- Audiências, solicitações comunitárias com contato/bairro/órgão e decisões auditadas.
- Memórias com cálculo de projeção a partir de base/taxa; renúncia prevista e medida de compensação.
- Importação de estrutura ou estrutura+valores entre peças autorizadas da mesma entidade, seleção por códigos, visualização da origem, lote/fingerprint/idempotência e rollback transacional. Programas/ações são referenciados ou copiados para o PPA de destino, sem alterar silenciosamente PPA pai de LDO/LOA.
- Migrações aditivas: `20261011150000_add_planning_scoped_instruments` e `20261011160000_add_planning_import_batches`. Incluem tabelas específicas e constraints/triggers de entidade/UG, vigência e cadeia.

**Estado do bloco inicial:** partes de F0–F3 implementadas; não encerrou os 99 requisitos por ente. A continuação abaixo implementou os fluxos internos F4–F8. Nenhuma caixa de aceite integral foi promovida automaticamente.

### Registro do primeiro bloco F4 — histórico financeiro legal por data

- Serviço `src/lib/planejamento/revisions.ts`: acréscimos/reduções assinados em Decimal, ato/texto jurídico, motivo, responsável e vigência. Exige permissão de atualização, peça sancionada/publicada, sanção registrada, UG autorizada e ato vigente posterior ou igual à sanção. A data legal pode anteceder o exercício de um orçamento futuro já sancionado.
- Lock transacional da peça e de sua referência canônica. Reenvio concorrente com a mesma chave/dados retorna o mesmo movimento; reutilização com dados diferentes é recusada. Ato retroativo que gere saldo negativo em qualquer corte diário é recusado.
- Consulta por `asOf` nos detalhes de Prefeitura e Câmara: original e valor alterado no corte, totais escopados calculados no servidor e histórico separado com paginação de 20. O corte é de **vigência financeira**, não uma reprodução completa do cadastro como era conhecido naquela data; movimentos registrados posteriormente com vigência retroativa entram no corte.
- Valores originais não são sobrescritos. Na LOA, previsão/fixação e total canônico são atualizados na mesma transação; ausência/ambiguidade do espelho reverte o ato. A revisão numérica é incrementada uma única vez por movimento efetivado.
- Nova migration aditiva `20261011170000_planning_immutable_movements`: impede UPDATE/DELETE de movimentos e alteração de valor/classificação original de linhas com histórico; exige movimento não nulo. **Não aplicada ao banco configurado nesta execução.**
- Teste PostgreSQL ampliado: replay concorrente, conflito de chave, cortes antes/depois dos atos, redução, conservação do original, totais/espelhos LOA, rollback por saldo histórico negativo e espelho ausente, isolamento de jurisdição, data civil inválida e imutabilidade SQL. Os 42 testes de regressão continuam aprovados; lint direcionado, TypeScript e build completo aprovados após esta implementação.
- Naquele bloco F4 ainda era parcial. A continuação implementou versões, histórico físico, consistências, compatibilização, emendas, programação e créditos, conforme o registro a seguir. O aceite integral continua separado da verificação técnica.

### Continuação atual — fluxos internos F4–F8

Registro detalhado: [PLANEJAMENTO_F4_F8_EVIDENCIAS.md](PLANEJAMENTO_F4_F8_EVIDENCIAS.md).

| Fase | Implementação interna desta continuação |
|---|---|
| F4 | Versões imutáveis/hash/classificações; cortes financeiros/físicos; críticas; mapeamento e propagação anual PPA/LDO/LOA; transferências com contraparte e eliminações |
| F5 | Emendas estruturadas, bloqueio, autorização legal, decisão integral/rejeição/parcial e efeitos idempotentes somente dos itens sancionados |
| F6 | Quatro métodos mensais; períodos 2/3/6 meses; consumo, desembolso separado, contingenciamento/liberação, fechamento/redistribuição e reflexo de alterações |
| F7 | Créditos associados ao cadastro canônico, reserva de anulação, tramitação/efetivação/cancelamento, implantação única, reconciliação legada, códigos reduzidos, cópia anual e contratos de consumo |
| F8 | Catálogo de 37 entradas, filtros/consolidação/versões, PDF/CSV, composições fiscais explícitas, snapshots e downloads autorizados |

**Verificação:** 47 testes aprovados, lint/Prisma/TypeScript e build completo aprovados (55 páginas estáticas). Isso não certifica layouts oficiais, não comprova publicação e não substitui os 99 aceites independentes por ente. Avaliação financeira real/RCL executada, contabilidade, Compras, GED e publicação dependem das conexões F9; ensaio/homologação seguem em F10.

### Continuação F9 — validação das conexões internas (11/10/2026)

**Estado: em implementação; não encerra F9/F10 nem os 99 aceites de cada ente.**

- Indicadores de Frotas passaram a ler exclusivamente a projeção canônica `FleetExpense`, com escopo de setor e cobertura de valores. A escrita legada `FleetOperation` foi retirada dos serviços/actions após conferência dos consumidores; a tabela histórica permanece preservada.
- Ponte contábil de Planejamento adicionada para abertura e alterações de receita/despesa, condicionada às seis regras de eventos configuradas e ao responsável servidor. Configuração/sincronização bloqueiam a peça antes de ler seu estado e exigem acesso a todas as suas UGs; entrega bloqueia e relê o comando, verificando a UG de origem. O sucesso das partidas e o rollback contábil conectado ainda precisam de cenários específicos.
- Ponte de execução adicionada aos consumidores financeiros: reservas/cotas, empenhamento, anulações, pagamentos e estornos. Cenários PostgreSQL isolados com `planningInternalExecution=true` comprovam consumo, realocação dentro do período, estorno parcial, replay de estorno e de pagamento estornado, conflito de valor e rollback por excesso de desembolso. Essa configuração é preparação explícita da fixture; não demonstra a ativação completa pela UI, a reserva futura em Compras nem toda a concorrência Financeiro/Planejamento.
- Vínculo GED preserva `documentVersionId`; download usa essa versão e confere seu SHA-256. Nova versão GED não substitui automaticamente o anexo histórico; o replay de vinculação conserva a versão anterior. A solicitação de assinatura limita a seleção à versão vinculada dentro da transação GED. Recusa de audiência incompatível, leitura em outra jurisdição, alteração SQL do vínculo e assinatura da versão substituída foram verificadas em PostgreSQL isolado. Download via storage e navegador autenticado ainda não foram ensaiados.
- Migration aditiva `20261011190000_planning_internal_connections`: configuração JSON da LOA e vínculos documentais com FK de versão, proteção de alteração e validação de audiência/documento/destino. Foi aplicada somente nas fixtures isoladas desta rodada; não houve implantação no banco configurado.

**Verificações desta rodada:** Prisma validate/generate, TypeScript, lint direcionado e build completo aprovados; build com `VERCEL_ENV=development`, **57 páginas estáticas**. A suíte abaixo teve **43 testes aprovados, zero falhas**:

```powershell
node --conditions=react-server --import tsx --test --test-concurrency=1 --test-reporter=spec tests/fleet-indicators.test.ts tests/planning-domain.test.ts tests/planning-operations.test.ts tests/planning-postgres.test.ts tests/public-finance.test.ts tests/procurement-finance-bridge.test.ts tests/document-flow.test.ts tests/construction-documents-service.test.ts
```

Os testes com adaptador PostgreSQL emitiram aviso de depreciação de consultas simultâneas do `pg`; os cenários concluíram sem falhas.

**Retomada:** comprovar abertura/alterações contábeis conectadas e falha com rollback; completar reservas futuras e concorrência dos consumidores; concluir Tributação/renúncia, tramitação Câmara e publicação/Transparência; completar pesquisa/paginação de seletores GED; registrar dependências oficiais por requisito e executar o ensaio autenticado dos dois entes. As migrations `170000`, `180000` e a nova `190000` exigem conferência/implantação antes do uso operacional destas conexões. A consulta de status anterior abaixo é histórica e não inclui a migration nova.

## Base municipal plausível

- Dataset: `src/lib/planejamento/municipal-data.ts`.
- Carga: `scripts/seed-municipal-planning.ts`, exclusiva de conexão isolada explícita e execução `--apply`. Não é executada em build/deploy; não foi aplicada nesta conferência.
- Município: **Vila das Araucárias**, com Prefeitura, Câmara, secretarias/UG, programas de saúde/educação/administração/obras e gestão legislativa, indicadores/metas e PPA/LDO/LOA coerentes.
- Nove vereadores e nove assessores com nomes completos, gabinetes, legislatura, mesa e comissão, ligados a pessoas/servidores canônicos. Ex.: Helena Cristina Duarte, João Henrique da Silva, Beatriz Oliveira Santos e Rafael Augusto Pereira.
- Cadastros/interface/documentos apresentados ao cliente não usam rótulos “demo”, “POC” ou “teste”. Isolamento da base fictícia é configuração técnica. Operações e integrações incompletas não são representadas como concluídas.
- O vínculo de assessores é estruturado em `CamAdvisor`; gestão de pessoal/contratos RH continua canônica e não é simulada pelo cadastro.

## Migrações RH reconciliadas após pull

Recebido o trabalho remoto até `17ff495` com pull fast-forward. Foi necessário guardar **somente** `prisma/schema.prisma` em stash `planning-schema-before-rh-checksum-pull-20261011`, reaplicado sem conflitos. O stash de segurança foi mantido; não reaplicar novamente.

O documento [RH_MIGRATION_FOUNDATION_CORRECAO_CHECKSUM.md](RH_MIGRATION_FOUNDATION_CORRECAO_CHECKSUM.md) permitiu restaurar os bytes originais de três migrations, preservando SQL e checksum do banco. `.gitattributes` protege a foundation de finais mistos e as duas seguintes em LF. O restaurador `scripts/restore-hr-foundation-bytes.mjs` confere hashes e registro concluído do banco antes de escrever um arquivo por execução.

Validação dos três previews: `APPLIED_CHECKSUM_VERIFIED`, `missingRuntimeDependencies: []`.

Conferência geral: `{"checked":59,"mismatches":[],"missing":[]}`. Não é certificação de ausência de drift.

**Consulta atual do Prisma: 64 migrations locais; somente duas pendentes:**

1. `20261011170000_planning_immutable_movements`.
2. `20261011180000_planning_legal_operations`.

As migrations SST `20261011120000` e Planejamento `20261011150000`/`20261011160000` aparecem aplicadas na consulta atual. Esta execução não implantou as duas novas.

A correção de finais de linha **não executou migrate deploy, não reaplicou SQL e não alterou `_prisma_migrations`**. As páginas novas dependem das tabelas das migrations de Planejamento; seu funcionamento na instância exige implantação dessas tabelas, vínculos/perfis e dados configurados.

## Verificações concluídas

- `npx prisma validate` e geração Prisma aprovados.
- Lint direcionado de Planejamento, rotas/components Câmara, scripts e novos testes aprovado.
- `npm run build` completo **após F4–F8**, com geração, TypeScript e 55 páginas estáticas aprovados. Executado com `VERCEL_ENV=development`, evitando deploy automático das novas migrations.
- **47 testes aprovados, zero falhas**, incluindo restauração de bytes, domínio/SQL/serviços Planejamento, RH, permissões dos módulos e regressões financeiras:

```powershell
node --conditions=react-server --import tsx --test --test-concurrency=1 --test-reporter=spec tests/hr-foundation-bytes.test.mjs tests/planning-domain.test.ts tests/planning-operations.test.ts tests/planning-postgres.test.ts tests/hr-calculation.test.ts tests/hr-workforce-service.test.ts tests/planning-sst-modules.test.ts tests/public-finance.test.ts
```

- Testes PostgreSQL isolados comprovam cadeia canônica, recusa de entidade/UG estrangeira, rateio/total LOA, importação idempotente/rollback e audiência/decisão.
- `git diff --check` aprovado; diff dos três SQLs RH ignorando finais de linha vazio.
- Navegador, conexão de integrações e homologação individual dos 99 itens ainda não executados.

## Continuidade obrigatória para 100%

### Avaliação anterior a F9/F10 — Custos e Controle Interno

Em 11/10/2026 foram analisados os checklists oficiais **EXE-04, 31 itens (páginas 40–44)** e **EXE-03, 36 itens (páginas 35–40)**. O [registro de aderência](ANALISE_ADERENCIA_CUSTOS_CONTROLE_INTERNO.md) mapeia cada requisito, o domínio responsável e a relação com Planejamento.

**Resultado atualizado após as novas orientações:** aderência parcial por integração com Planejamento. O checkup dos 28 módulos recomenda **Custos no Financeiro e Contábil, com indicadores em Administração/BI**; **Controle Interno em Auditoria foi confirmado pelo usuário**. F11/F12 estão planejadas nas áreas próprias **antes de F9/F10**, conforme [PLANO_IMPLEMENTACAO_CUSTOS_CONTROLE_INTERNO.md](PLANO_IMPLEMENTACAO_CUSTOS_CONTROLE_INTERNO.md) e [CHECKUP_28_MODULOS_ADERENCIA_CUSTOS.md](CHECKUP_28_MODULOS_ADERENCIA_CUSTOS.md). Conexões obrigatórias dos 31/36 itens pertencem às próprias F11/F12. Esta análise não executou as fases nem comprova os 67 requisitos.

### Próximas etapas do checklist de Planejamento

1. Concluir F0/F1: manutenção completa dos cadastros, árvore/classificações/vigências oficiais, códigos automáticos/reordenação, migração explícita dos registros antigos, revisão da paginação de seções secundárias e perfis das duas jornadas.
2. Concluir as pendências F2 de manutenção, prioridades/riscos, anexos e cenários completos. Transferências, obras/conservação e realizado receberam serviços nesta continuação, mas dados/ensaios completos continuam necessários.
3. Concluir F3: importação de realizado, mapeamento completo de exercícios/configurações e migração de históricos antigos. Reconciliação recusa divergências em vez de inferir saldos.
4. Ensaiar os fluxos internos F4–F7 em instância implantada, com perfis/dados de todas as decisões e cenários das duas jornadas; conectar os contratos na etapa seguinte.
5. F8: conferir layouts/cálculos oficiais e particularidades legislativas de cada saída, composição da RCL executada e avaliação financeira real. Catálogo/dataset interno não equivale a saída estatutária homologada.
   - Antes da etapa seguinte: executar F11 Custos/Financeiro e indicadores Administração, depois F12 Controle Interno/Auditoria, segundo o plano próprio e seus 31/36 aceites.
6. F9: conectar consumidores Financeiro/Tributação/Compras/Câmara/GED/transparência e serviços externos; solicitar materiais pendentes na etapa final; retirar rotinas duplicadas dos menus após a troca validada.
7. F10: validar 99/99 por ente e preencher evidências individualmente. Código parcial, build e testes não substituem esse aceite.

As integrações e a retirada das rotinas financeiras/tributárias ainda não foram executadas neste bloco. O estado foi registrado para permitir commit do progresso e continuidade da execução integral, conforme solicitado pelo usuário.
