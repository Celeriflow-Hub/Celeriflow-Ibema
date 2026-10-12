# P1 — fundação de escopo contábil por entidade e UG

**Executado:** 12/10/2026. **Estado:** P1 iniciada e fundação de escrituração/consultas contábeis aplicada no banco atual. A fase P1 ainda **não está integralmente concluída**.

## Entregue

1. `AccountingTransaction` passa a guardar `governmentEntityId` e `budgetUnitId`, com relações para `GovernmentEntity` e `BudgetUnit`.
2. Migration `20261012100000_accounting_entity_unit_scope`, aditiva, aplicada via `prisma migrate deploy` ao banco atual. Não exclui tabelas nem colunas; as linhas contábeis antigas permanecem sem escopo (`NULL`) e não são atribuídas por inferência.
3. Migration `20261012110000_entity_scoped_financial_years` substitui a unicidade global de ano por chave (entidade, ano), mantém índice parcial para legado sem entidade e cria exercícios escopados para os entes oficiais e de ensaio. Referências das peças LDO/LOA de ensaio são religadas aos exercícios correspondentes.
4. Migration `20261012120000_accounting_year_entity_guard` impede lançamento contábil cuja entidade diverge da entidade do exercício.
5. Migration `20261012130000_scoped_year_requires_accounting_scope` impede partidas sem dimensões em exercícios escopados.
6. Constraint pareia os dois IDs; FK preserva integridade; trigger exige que `PlanningEntityUnit` vincule aquela UG à entidade informada.
7. Serviço de postagem propaga o escopo informado e infere a UG de origens canônicas já cobertas: empenho/anulação/movimento, liquidação, pagamento, retenção, conta bancária, classificação de extrato e movimentação/linha orçamentária do Planejamento. UG ambígua, vínculo ausente, entidade divergente ou autorização de UG inválida são recusados.
8. Estorno copia o escopo da partida original.
9. Postagem manual pela tela exige entidade e UG. As opções vêm das UGs autorizadas pelo contexto; a action envia as permissões do usuário e o serviço valida a relação novamente.
10. Diário, Razão e Balancete aceitam filtro por entidade e/ou UG. O Balancete interno da tela e o diário recente são restringidos às UGs autorizadas. A geração de relatórios financeiros internos recebe as UGs autorizadas pelo contexto autenticado.
11. Fixture de PostgreSQL/PGlite aplica as migrations; testes cobrem postagem escopada, recusa de UG não autorizada, interseção de filtros, leitura segregada das três consultas, pendências bancárias restritas à entidade, fechamento/reabertura mensal e encerramento anual independentes de Prefeitura/Câmara, com segregação de responsáveis.
12. Arrecadação, lançamento prévio, coleta, redistribuição de fonte, estorno e confirmação de pagamento tributário usam a UG da origem/conta para escolher o exercício. A confirmação tributária grava receita, tesouraria e partida no mesmo escopo, preservando replay e rollback transacional.
13. A seleção de exercícios e as actions de fechamento da tela contábil validam acesso à entidade; o administrador técnico conserva o acesso previsto pelo contexto.

### Migrations e banco

- Antes da P1: 68 migrations locais, todas aplicadas.
- Depois da P1: 72 migrations locais, `prisma migrate status` atualizado.
- A primeira tentativa da migration de exercícios parou ao encontrar o índice único legado `FinancialYear_year_key`; não havia inserido/atualizado linhas. A tentativa foi marcada como rollback, somente os objetos parciais dessa tentativa foram removidos e a migration corrigida foi aplicada. O registro de rollback permanece no histórico de migrations; a execução mais recente está concluída e a base está atualizada.
- As migrations adicionam dimensões/índices/guards e os exercícios por entidade; não removem tabelas. Exercícios legados e chaves de negócio existentes são preservados. Referências P0 LDO/LOA são apontadas ao novo exercício da mesma entidade/ano.
- O inventário prévio da P0 mostrava **zero lançamentos contábeis** na base; portanto não havia partidas existentes a migrar ou classificar. Se surgirem registros históricos legados no futuro, continuam explicitamente sem escopo até reconciliação baseada em evidência.
- Verificação read-only pós-migration: migrations concluídas, duas colunas e triggers presentes, 0 partidas, 0 sem vínculo, 0 mal vinculadas; fixtures P0 confirmadas (2 entidades, 42 UGs, 8 exercícios entidade/ano e 18 instrumentos; quatro exercícios legados permanecem preservados). Também foram criados exercícios em preparação para os entes operacionais atuais. Registro de execução: `AMBIENTE_ATUAL_VERIFICACAO.json`.
- Conferência posterior em leitura: os registros `POC P0` continuam íntegros. A idempotência por entidade/ano está implementada na carga; a verificação de repetição com escrita registrada no fechamento P0 antecede estas migrations.

## Ainda falta na P1

1. A unicidade do exercício agora é por entidade, mantendo índice parcial separado para os exercícios legados sem entidade. Porém, os consumidores ainda precisam receber/selecionar a entidade em todos os fluxos de Financeiro, Planejamento e Tributação antes de declarar a migração integral concluída.
2. A confirmação canônica de pagamento tributário já segue o exercício da entidade arrecadadora. Cadastros/constituição de créditos tributários e o caminho paralelo `sendAccountingReference` em `src/lib/tributacao/s2-service.ts` ainda usam o exercício legado. Completar esses consumidores e reconciliar a referência paralela para evitar dupla contabilização continua dentro da P1.
3. Relatórios RREO/RGF/DCASP, snapshots/publicação, jobs e filtros gerais ainda necessitam revisão integral de escopo; nesta entrega a implementação explícita cobre Diário/Razão/Balancete e o dataset interno que os compõe. O aceite legal dos demonstrativos permanece pendente.
4. Contas/naturezas/fontes do P0 são sintéticas. Homologar e relacionar versões/códigos vigentes do plano de contas e classificações municipais/PCASP/TCE/STN com os documentos da seção 8 do plano consolidado; não publicar nem contabilizar os códigos `POC` como classificados oficialmente.
5. Centros de custo estão vinculados às entidades de ensaio, mas `CostCenter` não é dimensão de contabilização aprovada; o domínio de apropriação por objeto/item vem na F11/P6.

## Verificações

- `npx prisma validate`: aprovado.
- `npx prisma generate`: aprovado.
- `npx prisma migrate deploy`: aplicou as quatro migrations P1, com recuperação registrada da tentativa inicial de exercícios.
- `npx prisma migrate status`: todas as 72 migrations atualizadas.
- ESLint direcionado: aprovado.
- `src/lib/financeiro/__tests__/accounting-scope.test.ts`: 2/2 aprovados em PostgreSQL embarcado e migrations aplicadas.
- `tests/planning-accounting.test.ts`: 5/5 aprovados.
- `tests/planning-completion.test.ts`: 5/5 aprovados.
- `tests/planning-execution.test.ts`: 6 aprovados, 3 de concorrência PostgreSQL real não executados por falta de conexão de teste configurada. Os dois cenários inicialmente falhos (lançamento prévio e confirmação tributária) foram corrigidos e passaram na reexecução direcionada.
- `tests/planning-postgres.test.ts`: 1/1 aprovado, incluindo as jornadas da Prefeitura, Câmara e fundo com exercícios próprios.
- Total: 19 cenários aprovados; 3 de concorrência externa não executados.
- `scripts/verify-poc-p1-scope.ts`: inventário de leitura apenas aprovado no banco atual.
- `npm run build`, após o ajuste da confirmação tributária: aprovado, incluindo Prisma Client, tipos de rotas, typecheck completo, compilação Next e geração das páginas.
- Verificação da matriz P0: aprovada; o hash do schema é conferido contra o commit histórico da baseline para preservar a evidência original após a evolução P1.
- Navegação autenticada pelo navegador não foi executada nesta sessão.

## Próxima continuação da P1

- Concluir a propagação de exercício/entidade em todos os consumidores de `FinancialYear` e `MonthlyAccountingClose` (chamadas de Financeiro, Tributação, Planejamento e rotas de impressão); o modelo de dados agora permite fechamento independente por entidade/ano.
- Completar dimensões de UG/ente nos fluxos e relatórios financeiros restantes, sem inferir escopo quando a origem não oferece vínculo.
- Mapear cadastros/classificações oficiais por vigência e validar a matriz de contas.
- Reexecutar typecheck completo, build, testes transacionais/regressão e uma demonstração normal pelo contexto autenticado, antes de dar P1 como concluída.

**P0 concluída:** [controle e fechamento](FECHAMENTO_P0.md). **Aceite da POC:** nenhum item recebe ATENDE nesta execução; o teste técnico da P1 não substitui os roteiros oficiais.
