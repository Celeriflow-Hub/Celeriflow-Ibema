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

Formatos de configuração e limites: `docs/RH_FOLHA_POLITICAS_OPERACIONAIS.md`.

## Configuração do motor

O conjunto deve estar ativo e cobrir toda a competência e escopo escolhido. `HALF_UP`, escala 2. Produção exige aprovação efetiva, referência legal e `isDemo=false`.

Variáveis de expressão: `SALARIO_BASE`, `DIAS`, `JORNADA` e códigos de outras rubricas. `DIAS=30` para mês integral; períodos parciais usam dias civis limitados a 30. A regra de proporcionalidade municipal precisa ser conferida antes do uso oficial. Bases de previdência vêm das incidências RGPS/RPPS/COMPLEMENTAR.

`IRRF_FAIXAS`: regra JSON com lista de `{ lowerLimit: string, upperLimit: string | null, employeeRate: string }`. O cálculo agrega os vínculos da mesma PF e deduz contribuição previdenciária e dependentes marcados para IRRF, usando `IRRF_DEDUCAO_DEPENDENTE`. Quando `IRRF_DEDUCAO_SIMPLIFICADA` está configurada, escolhe a maior dedução por PF, uma única vez. Seleção incompleta dos vínculos é rejeitada. **Elegibilidade documental/etária dos dependentes, pensão, exterior, pagamentos fora da competência e bases de folhas especiais ainda precisam ser completadas.** Esta tabela não equivale à homologação de todas as situações de IRRF.

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
| F1 Cadastro | Parcial | Cargos/vagas/níveis, multivínculo temporal completo, campos configuráveis, cessões/estágio, pasta funcional e consultas integrais. |
| F2 Motor | Parcial | IRRF completo, múltiplos esquemas/competências, regras de arredondamento, alocação temporal e conferência completa. |
| F3 Movimentos/benefícios | Parcial | Completar múltiplas linhas/calendários de VT, família/documentos, pensões, contratos/parcelas/reservas de consignação e reflexos das demais origens. Importação, VT/VA e controle de margem agregada disponíveis. |
| F4 Direitos/frequência | Parcial | Médias, horas extras reconhecidas e cancelamento compensatório entregues; completar perdas/prorrogações/férias especiais, gozo de múltiplos aquisitivos, licença prêmio/ATS/averbação e banco de horas completo. |
| F5 Folhas especiais | Parcial | Mensal oficial e cenários isolados dos oito tipos especiais disponíveis. Fluxos oficiais de rescisão/RRA/13º/férias, tributação, direitos e reintegração continuam pendentes. Reajuste contratual coletivo disponível. |
| F6 Contabilidade | Parcial | Solicitações de despesa integradas ao Financeiro com retomada; completar empenho, provisões, retenções/repasses, baixa, pagamentos, diárias e produtividade. |
| F7 Portal | Parcial | PDF próprio, publicação futura, solicitações, campanhas/deferimento e consulta de margem histórica disponíveis; faltam renda anual fiscal, reserva de margem e demais jornadas. |
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

## Cemitérios

Nesta continuidade, as duas migrations cemiteriais foram novamente conferidas: `APPLIED_CHECKSUM_VERIFIED`. Os **18 testes** passaram. O navegador retornou `[browser.disconnected]`; visual, percurso autenticado e impressão seguem pendentes, assim como parâmetros/fundamento legal municipais. Roteiro: `CEMITERIOS_AMBIENTE_E_HOMOLOGACAO.md`.
