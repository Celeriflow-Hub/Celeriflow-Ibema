# Evidências técnicas da continuação P1–P4

Este registro complementa o controle P0 sem alterar o texto original, os subcritérios ou o aceite dos 1.052 requisitos. Resultado de teste técnico não constitui aceite integral do requisito. O aceite autenticado pela interface foi adiado pelo usuário.

| Requisito | Ente | Evidência obtida | Fechamento ainda necessário |
|---|---|---|---|
| EXE-02.17 | Prefeitura | Lote nativo reserva → empenho com partidas/documentos/cotas, a partir do plano da folha oficial; rollback tardio e replay em `tests/payroll-financial-cycle.test.ts`. | Matriz real por tipo de folha, classificação homologada e ensaio autenticado integral. |
| LEG-02.17 | Câmara | Cadeia nativa da folha testada separadamente em fixture legislativa no PostgreSQL real, com rollback e replay. | Matriz real por tipo de folha, classificação homologada e ensaio autenticado integral. |
| EXE-02.22 | Prefeitura | Liquidação, pagamentos com comprovante GED e conclusão documentada; pagamento do lote é atômico e conclusão bloqueia ordens não pagas/obrigações retidas não recolhidas. | Liberação e conclusão digital homologadas, assinaturas aplicáveis e cenários com descontos/encargos reais. |
| LEG-02.22 | Câmara | Liquidação/pagamento/conclusão GED testados em fixture legislativa no PostgreSQL real. | Liberação e conclusão digital homologadas, assinaturas aplicáveis e cenários com descontos/encargos reais. |
| EXE-02.19 / LEG-02.19 | Prefeitura / Câmara | Cadeia financeira da folha agora possui empenho/liquidação/pagamento nativos. | Conectar provisões de férias/13º e encargos à baixa efetiva e validar saldos; vínculo de provisão no empenho não encerra esse requisito. |
| EXE-02.21 / LEG-02.21 | Prefeitura / Câmara | Não há evidência de fechamento deste requisito no bloco. | Desmovimentação da competência com reversões e impedimento por liquidação/pagamento, seguida de nova geração rastreável. |
| EXE-13.2 | Prefeitura | 1.332 subclasses CNAE oficiais em versão DRAFT, com código textual, hierarquia e origem/hash. | De-para canônico, vigência e relação CNAE ↔ lista de serviços com interface e ensaios. |
| EXE-13.3 | Prefeitura | 2.694 ocupações CBO oficiais em versão DRAFT; candidatos/conflitos de cadastro identificados sem sobrescrever registros. | Relacionamento atividade ↔ CBO para autônomos, vigência, de-para e ensaio. |
| EXE-16.31 | Prefeitura | Excedente como obrigação, compensação, transferência, restituição e reversões de crédito não pago; testes de saldo, atomicidade, autorização e replay em `tests/tax-financial-chain.test.ts`. | Catálogo/tipos municipais, compensação autorizada de outro contribuinte, estorno de restituição já paga e ensaio integral. |
| EXE-25.32 | Prefeitura | Fluxo interno de solicitação/aprovação de restituição e compensação possui base de saldo rastreável. | Solicitação/deferimento pelo portal do contribuinte e aplicação em competências futuras, com evidência de interface. |

## Execução e preservação

- `tests/planning-execution.test.ts`: 11/11 aprovados em PostgreSQL descartável real, incluindo os três cenários concorrentes antes não executados.
- `tests/payroll-financial-cycle.test.ts`: cadeia ampliada aprovada em PGlite e **2/2 cenários aprovados no PostgreSQL real, Prefeitura e Câmara separadamente**, incluindo rollback integral por falha tardia de empenho e por saldo insuficiente na segunda ordem.
- `tests/tax-financial-chain.test.ts`: sete cenários tributários aprovados após reversão de compensação; cenário adicional de transferência/restituição não paga aprovado separadamente.
- `scripts/verify-poc-p1-scope.ts`: banco atual com 10 versões/18.775 entradas de classificação; ledger, receitas, empenhos, liquidações e pagamentos permanecem vazios. Identidades sem ausência/ambiguidade nos três modelos auditados, sem divergência Decimal/Float nos cinco modelos auditados.
- Catálogos derivados POC não equivalem a homologação municipal. CNAE/CBO DRAFT não foram adotados e não substituem códigos canônicos locais.

## Pendências de fundação identificadas na revisão

- Fechamentos mensais ainda necessitam ensaio de disputa entre postagem e solicitação/autorização de fechamento, incluindo lock comum de competência.
- Compras ainda possui caminhos em que reserva, empenho e evento de lifecycle são transações independentes; ampliar uso das variantes transacionais nativas e testar rollback completo dessas pontes.
- As fases P1–P4 continuam em andamento. Nenhum percentual de aceite integral é inferido deste bloco.
