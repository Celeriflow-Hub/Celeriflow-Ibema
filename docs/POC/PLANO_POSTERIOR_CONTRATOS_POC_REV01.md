# CeleriFlow - Plano Posterior de Contratos POC
## Revisao 01 - 19/09/2026

## 1. Finalidade

Este documento preserva o plano de continuidade da POC de Compras, Licitacoes, Contratos e Convenios apos a publicacao do lote funcional atual. Ele separa o que ja esta entregue do que permanece planejado, para evitar que pendencias estruturais sejam confundidas com falhas do fluxo atual.

O plano nao transforma a SIAFIC DEMO, pacotes PNCP ou pacotes Tribunal em integracoes oficiais. Credenciais, leiautes, contratos tecnicos e homologacao externa continuam obrigatorios para qualquer transmissao oficial.

## 2. Marco Atual

| Item | Situacao verificavel |
| --- | --- |
| Commit publicado | `a508f16 feat: strengthen procurement execution controls` |
| Migration mais recente | `20260919220000_add_bidding_number_uniqueness` |
| Banco Neon DEMO | 53 migrations aplicadas e schema atualizado |
| Build | `npm run build` aprovado |
| TypeScript | `npx tsc --noEmit --pretty false` aprovado |
| Integridade focal | 9 testes de Contratos e Licitacoes aprovados |
| SIAFIC DEMO | 6 testes aprovados |

O lote publicado inclui numero unico de licitacao, limite acumulado de valor para medicoes e parcelas, validacao de vigencia, GED em medicoes, cancelamento controlado de medicao atestada, sincronizacao SIAFIC de convenios e bloqueio de exclusao de convenio exportado.

## 3. Escopo Funcional Atual

Contratos e Convenios possuem cadastro, vigencia, aditivos monetarios/de prazo, partes, grupos de responsabilidade, medicoes, parcelas, eventos de ciclo de vida, relatorios individuais e snapshots SIAFIC DEMO. O fluxo atual e suficiente para a demonstracao POC prevista, mas ainda nao representa uma cadeia financeira oficial completa por item e saldo.

As fases abaixo sao melhorias posteriores. Elas nao devem bloquear o uso do lote atual, mas devem ser executadas antes de declarar a vertical como operacional para liquidacao, pagamento, prestacao de contas ou integracao oficial.

## 4. Fase 1 - Cadeia AE, AF e AL por Linhas

| Objetivo | Entrega planejada | Criterio de aceite |
| --- | --- | --- |
| Autorizar execucao | Entidades e linhas duraveis para AE, AF e AL, vinculadas a contrato ou convenio, itens, dotacao e valores. | Cada documento possui numero, origem, responsavel, data, situacao e linhas auditaveis. |
| Controlar saldos | Saldos por item, valor e quantidade para evitar AF ou AL acima da autorizacao anterior. | A cadeia AE -> empenho -> AF -> execucao -> AL bloqueia excesso e duplicidade. |
| Preservar evidencia | Eventos append-only e documentos GED para cada autorizacao. | Consulta mostra a sequencia, os valores e os usuarios responsaveis. |

## 5. Fase 2 - Anulacoes e Reversoes

| Objetivo | Entrega planejada | Criterio de aceite |
| --- | --- | --- |
| Anular execucao | Acoes explicitas de cancelamento para recebimento, medicao, AE, AF e AL com motivo e data. | Nenhuma anulacao apaga evidencia original. |
| Reverter efeitos | Reversao ordenada de estoque, patrimonio, empenho, liquidacao e pagamento quando aplicavel. | O sistema bloqueia a anulacao enquanto existir dependencia ativa posterior. |
| Evitar concorrencia | Locks e controle de versao entre atestacao, liquidacao e cancelamento. | Uma medicao cancelada nao pode receber liquidacao ativa depois da operacao. |

## 6. Fase 3 - Parcelas e Pagamentos

| Objetivo | Entrega planejada | Criterio de aceite |
| --- | --- | --- |
| Pagamento parcial | Modelo de alocacao de pagamento por parcela, sem depender de um unico `paymentId`. | Uma parcela suporta nenhum, um ou varios pagamentos sem exceder seu saldo. |
| Conciliacao | Vinculo entre parcela, AF, AL, pagamento e eventual estorno. | Relatorio apresenta saldo previsto, autorizado, liquidado, pago e cancelado. |
| Protecao de dados legados | Migracao aditiva e backfill controlado para registros existentes. | Nenhuma referencia financeira existente e removida ou reescrita silenciosamente. |

## 7. Fase 4 - Aditivos e Convenios Estruturados

| Objetivo | Entrega planejada | Criterio de aceite |
| --- | --- | --- |
| Aditivos por item | Linhas versionadas de contrato e aditivo para quantidade, valor, prazo e dotacao. | Reducao ou complemento respeita saldo ja executado e evidencia a versao anterior. |
| Convenio completo | Origem, UG, contraparte canonica, itens, repasse, contrapartida e atos versionados. | O cabecalho e a execucao representam integralmente o roteiro POC do convenio. |
| SIAFIC DEMO atual | Snapshot de cada alteracao relevante, com versao monotona por instrumento. | Destino DEMO recebe a representacao mais recente sem apagar historico. |

## 8. Fase 5 - Governanca, Razao e Exportacoes

| Objetivo | Entrega planejada | Criterio de aceite |
| --- | --- | --- |
| Escopo por UG | Predicados centralizados de leitura e mutacao por Unidade Gestora. | Listas, detalhes, relatorios e exportacoes nao vazam instrumento de UG nao autorizada. |
| Razao consolidada | Consulta filtravel por instrumento, tipo de ato, periodo, UG e situacao. | Relatorios de contrato e convenio exibem AE, AF, AL, anulacoes, saldos e eventos. |
| Integracoes oficiais | Adaptadores com leiaute, credencial, recibo, rejeicao e homologacao. | PNCP e Tribunal so sao marcados como transmitidos apos confirmacao da contraparte. |

## 9. Regras de Execucao da Retomada

1. Criar somente migrations aditivas posteriores a `20260919220000_add_bidding_number_uniqueness`; nunca reescrever migrations ja aplicadas no DEMO.
2. Verificar todos os consumidores antes de alterar assinatura ou retorno de Server Actions. Actions chamadas por clientes devem manter retorno `{ error: string }` quando esse for o contrato existente.
3. Preservar o padrao de telas em `PAdrão de tela e tabelas.txt` para listas, filtros, tabela e paginacao.
4. Executar testes focais, `npx prisma validate`, `npx tsc --noEmit --pretty false` e `npm run build` antes de publicar cada fase.
5. Aplicar migrations no Neon DEMO com `npx prisma migrate deploy` somente depois de revisao do diff e validacao local.

## 10. Referencias

- `CeleriFlow_POC_Compras_Licitacoes_Contratos_Desenvolvimento_REV01.md`
- `CeleriFlow_POC_Compras_Licitacoes_Contratos_Matriz_REV01.md`
- `CeleriFlow_SIAFIC_DEMO_Operacao_REV01.md`
- `CLC_P8_PACOTES_EXPORTACAO_POC.md`
- `PAdrão de tela e tabelas.txt`
