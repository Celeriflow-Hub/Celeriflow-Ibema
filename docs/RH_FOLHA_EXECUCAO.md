# RH/Folha — registro de execução

## Integração recebida

Em 11/10/2026 foi executado `git pull --ff-only origin main`, de `a9a6b11` para **`7f28090`**. As alterações locais foram preservadas no stash `opencode-rh-before-sst-pull-20261011`, reaplicadas e os conflitos de schema e das duas telas/actions compartilhadas de Folha resolvidos.

Os arquivos do domínio SST recebidos permanecem preservados. O processamento de origens de planos usa `postBenefitPayrollBatch`, mantendo autorização por UG, valores Decimal, histórico funcional e seus bloqueios. Não foram aplicadas migrations de SST por esta frente.

## Entregas locais em andamento

- Migration aditiva de RH: contratos por servidor, revisões, movimentos imutáveis, cálculos e demonstrativos Decimal, saldos de direitos/provisões, solicitações Portal, outbox e origem da projeção dos itens legados.
- Motor de expressões sem `eval`, bases/incidências, contribuição por esquema e teto agregado entre contratos, rateio de centavos e IRRF configurável por tabela.
- Simulação isolada; execução oficial, cancelamento de cálculo aberto, fechamento explícito e proteção contra alteração de dados depois do cálculo.
- Integração das origens SST já lançadas: exige Decimal, rubrica manual canônica e `details.functionalPeriodId`; não infere vínculo a partir de salário/cargo atual. Multivínculo com origens ainda requer alocação explícita, sem duplicar valores.
- Fechamento projeta somente os valores adicionais, com mapeamento explícito `FOLHA_EVENTOS`, preservando itens SST; reconcilia líquido e Decimal com a folha legada.
- `/rh/operacoes`: contratos/revisões, vinculação ao Cadastro Único, movimentos, direitos, cálculos e eventos pendentes. Listagens com 20 registros e referências pesquisáveis/paginadas.
- `/rh/operacoes/calculos/[id]`: conferência, snapshot, fechamento e liberação futura.
- `/portal-servidor/demonstrativos`: totais integrais por contrato e PDF completo; o acesso ao PDF exige titularidade, liberação efetiva e versão oficial fechada.
- Outbox de Financeiro e eSocial criada junto com fechamento, no estado `AGUARDANDO_CONFIGURACAO`. Não representa empenho nem transmissão.
- Bloqueados edição manual de status Fechada/Paga, exclusão de folha com histórico e alteração de competência/tipo após cálculo.
- Cadastro RH e Administração resolvem pessoa física no Cadastro Único; dados pessoais gravados em Employee são projeção de compatibilidade, não editáveis como fonte independente.
- Importações de verbas fixas/variáveis por CSV com prévia, rollback do lote inteiro, hash/arquivo preservados na evidência e replay inclusive entre operadores. O mesmo arquivo com outra chave é rejeitado.
- VT/VA diário por regra JSON e direito existente do servidor; dias da semana, férias/afastamentos e limite percentual explícitos, custo servidor/entidade e geração única do movimento na competência.
- Relatórios integrais de contratos, folha oficial fechada e saldos de direitos: CSV, XLSX real e PDF multipágina.
- `/rh/esocial`: configurações independentes de Produção/Produção Restrita, referências protegidas de credencial e pacote XSD. Continua sem transmissão; origem JSON de conferência não é XML oficial.
- Solicitações autenticadas do Portal e análise pelo RH, com decisão fundamentada, replay e preservação da decisão anterior.
- Revisões contratuais por vigência: histórico paginado, salário/lotação/jornada selecionados pela competência e preservação das folhas fechadas diante de alterações futuras. Mudanças intramês exigem rateio ainda pendente.
- Reajuste coletivo percentual assinado, prévia sem gravação, hash de conferência, detecção de revisão concorrente, aplicação transacional integral e replay entre operadores.
- Conferência da memória por rubrica e das bases em `/rh/operacoes/demonstrativos/[id]`, com consulta a snapshots e PDF integral.
- Cancelamento de reservas futuras de gozo com entrada compensatória e restauração do saldo; histórico e motivos preservados. Folha fechada no período impede a restauração automática.
- Horas extras reconhecidas no ponto geram movimentos Decimal pela regra explícita, salário/jornada temporal e contrato escolhido; replay não duplica e a mesma origem não pode ser alocada a outro vínculo. Ponto integrado fica protegido contra edição/exclusão pela rotina RH.
- Relatórios integrais de resumo por rubrica/regime/centro/local, bases e contribuições previdenciárias e contratos simultâneos. Dados de folhas fechadas usam identidade/lotação do snapshot.
- Memória de médias por janela, rubricas explícitas, percentuais de seleção (incluindo 80%), arredondamento da quantidade, política de meses faltantes e fatores de atualização documentados.
- Campanhas de recadastramento em `/rh/recadastramento` e `/portal-servidor/recadastramento`, com público definido, campos autorizados, vigência, acompanhamento paginado, diff e deferimento transacional no Cadastro Único. Conflito com atualização central posterior bloqueia o deferimento.
- Adaptador interno de solicitações de despesa no Financeiro: classificação explícita por centro/componente, prévia, plano durável, controle de acesso à UG, recuperação de falha parcial e idempotência. Não cria empenho, liquidação nem pagamento.
- Cenários persistidos de simulação dos oito tipos especiais mediante política de rubricas e parâmetros com fonte explícita. Sem fechamento oficial, tributos automáticos, consumo de direitos ou alteração do vínculo.
- Margem consignável por PF, agregada entre vínculos, com base/descontos/rubricas definidos explicitamente e percentual na política de cálculo; excesso bloqueia a execução antes de persistir. Memória imutável por demonstrativo, conferência em tela/PDF e consulta autenticada em `/portal-servidor/margem`.
- `/rh/consignacoes`: contratos imutáveis vinculados ao credor central, cronograma de parcelas iguais, reserva de margem por competência, lançamento único e cancelamento compensatório de parcelas não lançadas. `/portal-servidor/consignacoes`: consulta do próprio titular, a partir de referências liberadas.
- Dependentes vinculados a `Person`, com nome/CPF/nascimento projetados do Cadastro Único, flags de candidatura e proteção contra duplicidade/troca de titular. Elegibilidade de IRRF e salário-família por parentesco/idade/documentos vigentes; quotas e renda agregadas por PF, rateio entre vínculos e memória em tela/PDF. Fechamento rejeita elegibilidade alterada após o cálculo.
- Alteração coletiva de cargo/regime/lotação/centro/nível/salário/jornada/término com prévia, hash, revisão temporal e rollback integral. Matrícula/identidade/admissão não são modificadas por esse lote.
- Banco de horas reconhecido no ponto: créditos/débitos Decimal por origem, limites de saldo e somatórios diários, rejeição de déficit anterior financiado por crédito futuro, política de coexistência com horas extras pagas e preservação da origem integrada. Estorno compensatório único valida saldos posteriores e mantém entrada original. Extrato próprio por escopo em `/portal-servidor/banco-horas`.

Formatos de configuração e limites: `docs/RH_FOLHA_POLITICAS_OPERACIONAIS.md`.

## Configuração do motor

O conjunto deve estar ativo e cobrir toda a competência e escopo escolhido. `HALF_UP`, escala 2. Produção exige aprovação efetiva, referência legal e `isDemo=false`.

Variáveis de expressão: `SALARIO_BASE`, `DIAS`, `JORNADA` e códigos de outras rubricas. `DIAS=30` para mês integral; períodos parciais usam dias civis limitados a 30. A regra de proporcionalidade municipal precisa ser conferida antes do uso oficial. Bases de previdência vêm das incidências RGPS/RPPS/COMPLEMENTAR.

`IRRF_FAIXAS`: regra JSON com lista de `{ lowerLimit: string, upperLimit: string | null, employeeRate: string }`. O cálculo agrega os vínculos da mesma PF e deduz contribuição previdenciária e dependentes marcados para IRRF, usando `IRRF_DEDUCAO_DEPENDENTE`. Quando `DEPENDENTES_IRRF` está configurada, aplica elegibilidade por idade/parentesco/documentos e preserva memória; conjuntos legados sem essa regra continuam com a contagem por flag. Quando `IRRF_DEDUCAO_SIMPLIFICADA` está configurada, escolhe a maior dedução por PF, uma única vez. Seleção incompleta dos vínculos é rejeitada. **Exceções de elegibilidade, pensão, exterior, pagamentos fora da competência e bases de folhas especiais ainda precisam ser completadas.** Esta tabela não equivale à homologação de todas as situações de IRRF.

`FGTS_ALIQUOTA`: percentual configurável, aplicado quando há base FGTS. O valor é informativo e integra encargos da entidade, sem reduzir o líquido do servidor.

`PREVIDENCIA_BASE_PATRONAL_<codigoDoEsquema>`: regra textual obrigatória quando há encargo patronal; valores `SEM_TETO` ou `TETO_SERVIDOR`. O teto do segurado não é aplicado implicitamente ao empregador.

O rateio monetário usa maiores frações com desempate estável por ordem dos contratos, preservando centavos e impedindo parcela residual negativa.

Solicitações do Portal: `/portal-servidor/solicitacoes-rh`, titularidade exclusiva pela sessão, replay e acompanhamento; `/rh/solicitacoes`, análise e decisão fundamentada com outbox transacional. A decisão não cria automaticamente férias, benefício, usuário ou documento: a providência funcional tem registro próprio. Convites de acesso são separados e não podem ser deferidos por esse formulário.

Férias: geração explícita de aquisitivos completos pela política vigente, reserva de gozo/pecúnia, fracionamento, saldo e replay. Aquisitivo com afastamento é bloqueado até haver regra de perda/prorrogação; não se infere seu efeito. Actions legadas de RH verificam conflitos nos dois sentidos e preservam férias com reservas. Essa proteção não modifica as rotinas clínicas de SST.

`FOLHA_EVENTOS`: regra JSON com objeto `códigoDaRubrica → ID do PayrollEvent`. Eventos ativos, tipo compatível e sem fórmula concorrente. Inclui as rubricas calculadas `PREVIDENCIA_<codigoDoEsquema>` e `IRRF` quando presentes. Nenhum evento é escolhido pelo nome.

Movimentos usam chave estável de origem. Correções criam movimentos compensatórios em vez de atualizar/apagar. O saldo de direitos/provisões também usa entradas assinadas; uma baixa não pode exceder o saldo, e replay com outros dados é rejeitado.

## Situação das dez fases do plano

O plano usa **F0–F9**, totalizando dez fases. Esta execução ainda está em andamento: não declarar as dez concluídas nem 134 requisitos homologados.

| Fase | Estado deste incremento | Próximos desenvolvimentos internos |
|---|---|---|
| F0 Fundação | Parcial | Temporalidade mensal entregue; completar rateios intramês, transições de regime e consolidação dos demais consumidores. |
| F1 Cadastro | Parcial | Dependentes canônicos, alterações coletivas, campos configuráveis, quadro temporal de cargos/vagas/níveis, ocorrências e pasta funcional agregada disponíveis; completar progressões, multivínculo temporal completo, extensões de funções/designações, cessões/estágio, anexos específicos de contrato e consultas integrais. |
| F2 Motor | Parcial | IRRF completo, múltiplos esquemas/competências, regras de arredondamento, alocação temporal e conferência completa. |
| F3 Movimentos/benefícios | Parcial | Completar múltiplas linhas/calendários de VT, exceções/faixas/elegibilidade especiais de família, pensões, submargens por produto, renegociação/compensações de consignação e reflexos das demais origens. Importação, VT/VA, salário-família parametrizado, margem agregada e contratos/parcelas/reservas simples disponíveis. |
| F4 Direitos/frequência | Parcial | Médias, horas extras, banco de horas reconhecido/extrato e cancelamento compensatório entregues; completar perdas/prorrogações/férias especiais, gozo de múltiplos aquisitivos, licença prêmio/ATS/averbação, expiração e conversão financeira do banco. |
| F5 Folhas especiais | Parcial | Mensal oficial e cenários isolados dos oito tipos especiais disponíveis. Fluxos oficiais de rescisão/RRA/13º/férias, tributação, direitos e reintegração continuam pendentes. Reajuste contratual coletivo disponível. |
| F6 Contabilidade | Parcial | Solicitações de despesa integradas ao Financeiro com retomada; completar empenho, provisões, retenções/repasses, baixa, pagamentos, diárias e produtividade. |
| F7 Portal | Parcial | PDF próprio, publicação futura, solicitações, campanhas/deferimento, margem histórica e consulta de cronogramas consignados disponíveis; faltam renda anual fiscal, solicitação de crédito pelo titular e demais jornadas. |
| F8 eSocial/obrigações | Parcial | Origens/outbox disponíveis; faltam layouts/validadores/cliente/worker e exportadores históricos. Configuração externa posterior não substitui esses desenvolvimentos internos. |
| F9 POC | Parcial | Testes iniciais e regressão; ampliar casos ouro, relatórios e evidências item a item, além do percurso autenticado. |

## Comandos de verificação e implantação

```powershell
node --conditions=react-server --import tsx --test --test-concurrency=1 tests/hr-calculation.test.ts tests/hr-workforce-service.test.ts
npx tsx scripts/deploy-hr-migrations.ts
# Somente após as dependências compartilhadas estarem disponíveis:
npx tsx scripts/deploy-hr-migrations.ts --apply
$env:NODE_OPTIONS='--max-old-space-size=8192'
npm run build
```

O deploy dirigido aplica somente a migration de RH e verifica checksums, dependências de runtime e transação. Não usa `prisma migrate deploy` geral, para preservar a implantação de SST conduzida no outro PC.

O preview encontrou **zero dependências de runtime ausentes** no banco configurado. A migration `20261011030000_hr_workforce_foundation` foi aplicada pelo comando dirigido com resultado `APPLIED`. Nenhuma migration de SST foi executada por esta frente.

A migration `20261011130000_hr_contract_temporal_revisions` foi aplicada por `npx tsx scripts/deploy-hr-migrations.ts --temporal --apply`, com resultado `APPLIED` e zero dependências ausentes. Acrescenta `effectiveFrom`, backfill e índice, restaurando o trigger imutável na mesma transação. Revisões legadas recebem baseline de admissão; a data histórica real de alterações antigas não é reconstruída. As folhas antigas continuam com seus snapshots.

Seed preparado: `npx tsx scripts/seed-hr-engine-demo.ts` / `--apply`. Cria somente parâmetros sintéticos do motor, sem pessoas, servidores, usuários, permissões ou folhas. A tentativa de aplicação encontrou nome/município/UF ausentes em **Administração > Dados da Prefeitura**. A transação foi revertida; o conjunto não foi criado e nenhum dado institucional fictício foi preenchido.

## Verificações desta continuidade

- **18 testes cemiteriais aprovados**, migrations cemiteriais com checksums conferidos.
- **14 testes das integrações SST→Folha aprovados** após o pull.
- **6 testes novos de RH aprovados**, com as verificações integradas descritas abaixo, e ESLint dos arquivos desta frente aprovado.
- Após o reinício do servidor, os seis testes foram repetidos com sucesso, incluindo solicitação/decisão do Portal, rateio de centavos e base patronal explícita. A migration RH retornou `APPLIED_CHECKSUM_VERIFIED`, sem dependências de runtime ausentes; ESLint também passou.
- Testes novos de RH exercitam Decimal/fórmulas, tetos e deduções, simulação/replay/rollback, projeção da folha, titularidade/PDF, direitos/aquisitivos/conflitos, importação, VT/VA e **501 contratos** com exportação integral. A leitura do XLSX confere a última linha e o texto do PDF multipágina confere o último contrato.
- O primeiro build encontrou um bloco FGTS inserido no escopo de fechamento em vez de cálculo; foi corrigido e os testes passaram novamente. Build integrado atualizado em execução; não declarar aprovação antes do resultado final.
- Uma repetição paralela dos testes encontrou falha nativa V8/JIT no processo do PGlite. A execução sequencial (`--test-concurrency=1`) passou, incluindo o teste PostgreSQL integral; não foi necessário alterar código funcional para contornar essa falha de runtime.
- Dois builds foram interrompidos durante a checagem de tipos pelas interrupções/reinícios da sessão. Esses resultados não são aprovação do build. Uma nova execução foi iniciada sobre os arquivos atualizados.
- Nova tentativa do navegador após o reinício manteve `[browser.disconnected]`; não há evidência de homologação visual autenticada.

### Incremento temporal e operacional de 11/10/2026

- Sete testes RH aprovados após inclusão de revisões futuras, reajuste coletivo/rollback, férias compensatórias, horas extras, relatórios agregados, médias, recadastramento e ponte Financeiro. O teste PostgreSQL inclui falha forçada no segundo lançamento financeiro, recuperação e ausência de duplicação.
- Cenário sintético de 13º verifica salário temporal, parâmetros/fonte, persistência/replay, preservação da folha legada e bloqueio de fechamento/publicação oficial.
- ESLint aprovado para os arquivos RH/Portal e scripts alterados. **Build completo atualizado aprovado** (`npm run build`), incluindo TypeScript e geração das rotas de recadastramento, Financeiro e cenários especiais. `git diff --check` aprovado.
- Migration temporal novamente conferida: `APPLIED_CHECKSUM_VERIFIED`, sem dependências de runtime ausentes. Regressão SST→Folha repetida após o incremento: **14 testes aprovados**.
- Todos os estados da tabela acima continuam parciais. As pendências internas não são tratadas como dependências do município ou de acesso externo.

### Continuidade — controle de margem consignável

- Oito testes RH aprovados, incluindo soma Decimal de vínculos, arredondamento único, rejeição de rubricas ausentes/incompatíveis, excesso sem execução parcial, compensação e fechamento/publicação com memória.
- Teste integrado confirma que atualização de movimentos não altera a memória anterior, que o titular não acessa a simulação pelo Portal e que outro titular não acessa o demonstrativo publicado.
- Snapshots legados permanecem sem margem; a consulta explicita sua indisponibilidade, sem aplicar parâmetros atuais ao passado.
- ESLint, `git diff --check` e **build completo atualizado (`npm run build`) aprovados**, incluindo TypeScript e a nova rota do Portal.

### Continuidade — contratos, reservas e parcelas de consignação

- Migration aditiva `20261011160000_hr_consignment_schedule`: contratos, parcelas e entradas de reserva/lançamento/cancelamento imutáveis, integridade referencial, sinais de ledger e unicidades de contrato/origem.
- Cronograma com parcelas iguais (até o limite explícito da política), referência mensal oficial mais recente do titular, consignatárias autorizadas do cadastro central e preservação de política/margem/autorização em snapshot.
- Reserva serializada entre todos os contratos do titular, por competência e escopo; falha em uma competência reverte contrato e cronograma inteiros. Replay não duplica contrato/parcela/movimento; mesmo número/credor/vínculo/escopo não aceita cadastro com outra chave.
- Parcelas gerenciadas já presentes na referência são identificadas pelos movimentos preservados no snapshot para evitar desconto duplicado da margem futura. Descontos não gerenciados da referência permanecem como ocupação conservadora.
- Cálculo e fechamento verificam parcelas reservadas pendentes de lançamento. Parcela lançada não aceita cancelamento automático; exige conciliação/compensação própria, ainda pendente. Cancelar parcela não lançada cria entrada negativa e preserva a reserva original.
- Testes PostgreSQL aprovados para reserva/replay/excesso sem gravação parcial, lançamento/replay, cancelamento, cronograma pendente, recência da referência, margem gerenciada e triggers imutáveis. TypeScript e ESLint aprovados; build atualizado ainda em validação.
- Migration aplicada pelo deploy dirigido e reconferida com `APPLIED_CHECKSUM_VERIFIED`, sem dependências de runtime ausentes. `git diff --check` aprovado. O build foi interrompido e retomado em segundo plano, posteriormente aprovado conforme registro abaixo. A nova tentativa de navegador retornou `[browser.disconnected]`.
- O build retomado concluiu com sucesso, incluindo as rotas RH/Portal de contratos e cronogramas consignados.

### Continuidade — dependentes, alterações coletivas e banco de horas

- Testes RH ampliados para vínculo central/projeções/duplicidade, idade civil/validade documental, quota única entre contratos, cessação futura, histórico preservado e fechamento bloqueado após alteração de elegibilidade.
- Testes de alteração coletiva verificam hash invalidado por revisão concorrente, aplicação/replay e rollback do lote diante de limite de prazo em outro contrato.
- Banco de horas exercita quatro casas decimais, replay entre operadores, alocação única, déficit sem gravação parcial e limites diários agregados. O extrato do Portal não mistura demonstração/homologação/produção, nem presume escopo de entradas legadas.
- Dez testes RH aprovados após os ajustes de somatório diário e estorno compensatório. O teste PostgreSQL verifica bloqueio de estorno de crédito consumido, estorno de débito/crédito, replay sem duplicação, divergência de fundamento e preservação da entrada original.
- ESLint aprovado nos serviços RH, operações, dependentes, ponto alterado, nova rota Portal e testes. `npm run build` completo aprovado, incluindo TypeScript, coleta de dados e geração das rotas. As dez fases permanecem parciais conforme a tabela, com pendências internas explícitas.
- Regressão SST→Folha reexecutada neste incremento: 14 testes aprovados em `sst-functional-payroll-origin`, `sst-functional-leave-posting` e `sst-benefits-posting`. `git diff --check` aprovado após atualização documental.

### Continuidade — campos configuráveis do contrato funcional (F1 / FOL-001 parcial)

- Regra JSON `CAMPOS_CONTRATO` no conjunto do regime, validada em Parametrizações e no serviço contratual. Tipos TEXTO/INTEIRO/DECIMAL/DATA/BOOLEANO/OPCAO, obrigatoriedade, limites e opções explícitos; códigos desconhecidos e datas civis inválidas são rejeitados. Comparação numérica usa inteiros escalados, preservando quatro casas e limites grandes.
- `/rh/operacoes`: formulário gera campos conforme o regime selecionado e confere hash da definição antes de salvar; não aceita ficha aberta com definição alterada. Valores e definição oficial da regra ficam em `details` e no snapshot da revisão, preservando demais informações adicionais.
- Reajustes/alterações coletivas reaproveitam a validação e mantêm os valores configuráveis. Retirada de um campo histórico ou desativação da política bloqueia alterações que descartariam os dados e exige saneamento explícito.
- Consulta por código/valor exato, totais e paginação de 20. Exportação integral de contratos CSV/XLSX/PDF respeita o mesmo filtro e inclui os valores configuráveis. Consulta/exportação de contratos usa a última revisão cadastrada; revisões anteriores continuam na ficha histórica.
- Onze testes RH aprovados, incluindo limites decimais grandes, booleans falsos, tipos/opções/datas, valores inválidos sem criação parcial, parâmetros alterados, revisões preservadas e filtros/exportação. ESLint aprovado. Checagem TypeScript identificou incompatibilidade de literais BigInt com o target do projeto, corrigida para construção via `BigInt()`. `npm run build` completo aprovado após a correção, incluindo TypeScript, coleta de dados e geração das rotas.
- Este incremento usa tabelas e revisões existentes; nenhuma migration nova foi necessária. FOL-001 e F1 continuam parciais pelas demais pendências da matriz.

### Continuidade — quadro de cargos, ocorrências e pasta funcional (F1)

- `QUADRO_CARGOS` reutiliza cargos centrais (`Role`) e conjuntos/regimes RH. Vigências explícitas definem vagas autorizadas, enquadramento, CBO, escolaridade, leis, atribuições, competências, referências GED e escala por níveis/posição vertical-horizontal/salário/jornada. `/rh/quadro-cargos` confere ocupação máxima e disponibilidade mínima por vigência, com filtros, totais e paginação de 20.
- Gravação de contrato/revisão confere enquadramento exato e vagas em todos os trechos temporais alcançados, incluindo contratos futuros e regimes que compartilham o conjunto. Locks por conjunto serializam uso de vagas; lotes validam o estado final após gravar todas as revisões na mesma transação. Falha reverte contrato/revisão/lote. Definição do quadro fica no snapshot contratual; desativação da política não autoriza descartar o histórico.
- Testes verificam excesso de vagas, centavo incompatível na escala, troca de ocupante na fronteira civil sem dupla ocupação, prorrogação inválida com rollback e reajuste de dois contratos para tabela futura, sem rejeitar um estado intermediário do lote. FOL-014/015 seguem parciais: referências e escalas disponíveis, mas progressão automática e a jornada completa de anexos/cadastro ainda precisam de ampliação.
- `/rh/ocorrencias`: advertência/elogio/multa/outra, motivo/data/ato/observação e documentos GED. Registros e cancelamentos compensatórios usam origem única e payload imutável; repetição com dados diferentes é rejeitada. Atos vinculados não podem ser editados/excluídos pelas actions RH. Ocorrência de multa registra valor, sem inferir desconto na folha.
- Documentos de outro titular ou de Saúde/SST clínico são rejeitados na vinculação; anexar exige acesso ao GED na action. Testes cobrem replay entre operadores, data inválida, anexo ausente/protegido, guarda do ato e cancelamento sem alteração da ocorrência original.
- `/rh/pasta-funcional/[employeeId]` agrega contratos/revisões, atos, documentos da pessoa central, ocorrências (inclusive canceladas) e entradas de direitos. Todas as seções têm filtros/totais/paginação de 20. Documentos dependem de acesso ao GED; arquivos clínicos/atestados permanecem em Saúde/SST. A ficha não cria cópias dos registros nem expõe URLs de arquivos de origem.
- Doze testes RH e catorze de regressão SST→Folha aprovados em execução sequencial final (**26/26**). ESLint aprovado e TypeScript aprovado após regenerar o cliente Prisma do schema compartilhado. `npm run build` completo aprovado, incluindo as rotas de quadro de cargos, ocorrências e pasta funcional. Não foram criadas migrations neste incremento.

## Cemitérios

Nesta continuidade, as duas migrations cemiteriais foram novamente conferidas: `APPLIED_CHECKSUM_VERIFIED`. Os **18 testes** passaram. O navegador retornou `[browser.disconnected]`; visual, percurso autenticado e impressão seguem pendentes, assim como parâmetros/fundamento legal municipais. Roteiro: `CEMITERIOS_AMBIENTE_E_HOMOLOGACAO.md`.
