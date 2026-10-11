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

**Atenção ao estado da entrega:** esse bloco implementa partes de F0–F3; **não encerra as fases nem os 99 requisitos de cada ente**. Emendas possuem tabelas iniciais, mas ainda não possuem fluxo completo. Nenhuma caixa de aceite integral foi promovida automaticamente.

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

**Ainda pendentes de implantação, conforme Prisma:**

1. `20261011120000_harden_sst_clinical_integrity`.
2. `20261011150000_add_planning_scoped_instruments`.
3. `20261011160000_add_planning_import_batches`.

A correção de finais de linha **não executou migrate deploy, não reaplicou SQL e não alterou `_prisma_migrations`**. As páginas novas dependem das tabelas das migrations de Planejamento; seu funcionamento na instância exige implantação dessas tabelas, vínculos/perfis e dados configurados.

## Verificações concluídas

- `npx prisma validate` e geração Prisma aprovados.
- Lint direcionado de Planejamento, rotas/components Câmara, scripts e novos testes aprovado.
- `npm run build` completo **após pull/reconciliação**, com geração, TypeScript e 53 páginas estáticas aprovados. Executado com `VERCEL_ENV=development`, evitando deploy automático de migrations.
- **42 testes aprovados, zero falhas**, incluindo restauração de bytes, domínio/SQL/serviços Planejamento, RH, permissões dos módulos e regressões financeiras:

```powershell
node --conditions=react-server --import tsx --test --test-concurrency=1 --test-reporter=spec tests/hr-foundation-bytes.test.mjs tests/planning-domain.test.ts tests/planning-postgres.test.ts tests/hr-calculation.test.ts tests/hr-workforce-service.test.ts tests/planning-sst-modules.test.ts tests/public-finance.test.ts
```

- Testes PostgreSQL isolados comprovam cadeia canônica, recusa de entidade/UG estrangeira, rateio/total LOA, importação idempotente/rollback e audiência/decisão.
- `git diff --check` aprovado; diff dos três SQLs RH ignorando finais de linha vazio.
- Navegador, conexão de integrações e homologação individual dos 99 itens ainda não executados.

## Continuidade obrigatória para 100%

1. Concluir F0/F1: manutenção completa dos cadastros, árvore/classificações/vigências oficiais, códigos automáticos/reordenação, migração explícita dos registros antigos, revisão da paginação de seções secundárias e perfis das duas jornadas.
2. Concluir F2: transferências previstas, obras/conservação, manutenção de metas/realizado, prioridades/riscos, vínculos legais/anexos, projeções anuais completas e dados de todos os cenários.
3. Concluir F3/F4: importação do realizado/configurações, mapeamento de exercícios, relatório de críticas completo, versões efetivas, alterações de receita/despesa por data, consistências e compatibilização bidirecional.
4. F5–F7: emendas/itens/bloqueio/sanção parcial/efetivação; programação mensal/cotas/contingenciamento/redistribuição; créditos, prévia com reserva, implantação e workflow legal completo.
5. F8: consultas e **todas** as saídas do catálogo exigido, incluindo demonstrativos fiscais e filtros/versões/entes.
6. F9: conectar consumidores Financeiro/Tributação/Compras/Câmara/GED/transparência e serviços externos; solicitar materiais pendentes na etapa final; retirar rotinas duplicadas dos menus após a troca validada.
7. F10: validar 99/99 por ente e preencher evidências individualmente. Código parcial, build e testes não substituem esse aceite.

As integrações e a retirada das rotinas financeiras/tributárias ainda não foram executadas neste bloco. O estado foi registrado para permitir commit do progresso e continuidade da execução integral, conforme solicitado pelo usuário.
