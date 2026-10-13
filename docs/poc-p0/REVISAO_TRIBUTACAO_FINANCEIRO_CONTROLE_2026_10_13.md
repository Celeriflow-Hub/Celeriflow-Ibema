# Revisão de Tributação, Financeiro e Controle Interno — 13/10/2026

## Escopo e estado do controle

Fontes: `CONTROLE_REQUISITOS.json`, EXE-02/LEG-02, EXE-03, EXE-12–17 e EXE-24–26, plano consolidado P1–P4 e plano de Custos/Controle Interno. São 823 registros de checklist: 378 financeiros nos dois entes, 36 de Controle Interno e 409 tributários. Os 189 textos financeiros são compartilhados entre Prefeitura/Câmara, mas exigem verificação operacional independente.

Esta revisão **não substitui a matriz individual, não promove busca lexical a atendimento e não registra aceite integral**. A matriz P0 conserva a fotografia original. Os desenvolvimentos abaixo têm evidências próprias e limites identificados.

## Desenvolvimentos desta continuação

| Área / requisito relacionado | Implementação e evidência | Limite de encerramento |
|---|---|---|
| Controle, EXE-03.7 e .13 | Checklists publicados por plano, categoria, grupos e números únicos; editor operacional; pesquisa por categoria. `control-checklists.ts`, `ControlChecklistsClient.tsx`. | Conferência autenticada de interface pendente. Reutilização entre planos e revisão de todo o catálogo municipal ainda não verificadas. |
| Controle, EXE-03.8 e .12 | Respostas configuráveis por grupo, resposta irregular configurada, avaliação fundamentada e abertura atômica do apontamento; replay sem duplicação. Regra `BANK_ACCOUNT_SOURCE` consulta contas bancárias ativas da UG, aplica a primeira resposta como regular ou a resposta irregular configurada e preserva IDs da origem no histórico. | Diagnóstico implementado cobre fonte das contas; os demais diagnósticos orçamentários/constitucionais e produtores continuam pendentes. Não considerar os itens completos. |
| Controle, EXE-03.9 | Apontamentos preservados; responsável conferido na secretaria da UG; eventos de criação com ator e evidências referenciadas. | Revisão integral das permissões GED continua pendente. |
| Controle, EXE-03.10 e .11 | Parecer e providência corretiva por apontamento; identificação canônica do servidor em parecer de contratação; guarda de secretaria/UG e histórico aditivo. | Uso real com processos municipais e conferência de tela pendentes. |
| Controle, ciclo de decisão | Resolução exige fundamento; conclusão exige apontamentos resolvidos e todas as perguntas publicadas respondidas; reabertura justificada. Locks plano → apontamento e rollback do histórico. | Não substitui notificações, agenda, relatório circunstanciado ou publicação na Transparência. |
| Tributação, saldo e emissão de DAM | `assessmentPosition` conta pagamentos confirmados inclusive em guia documentalmente cancelada. Recusa pagamentos sem Decimal conciliado; não reabre disponibilidade artificialmente. | Demais regras de acréscimos, parcelamento e períodos ainda exigem encerramento próprio. |
| Tributação, reconhecimento/DA | Fixtures reconciliadas ao schema e ao fluxo real: endereço/CDA disponíveis, origem do catálogo explícita, emissão de CDA e extinção pela baixa DA canônica. | Sem enfraquecer a guarda que impede extinção de DA pelo fluxo de lançamento comum. |

Migration aditiva: `20261013100000_internal_control_decision_history`, aplicada por `prisma migrate deploy`. Cliente Prisma regenerado. Nenhum dado financeiro foi inserido para simular operação municipal.

## Verificações já aprovadas

- Dívida/guia/arrecadação parcial, replay, estorno e rollback: **2/2**, Prefeitura e Câmara, PostgreSQL real isolado.
- Diárias autorizadas/pagas, prestação, GED, UG e replay: **2/2**, Prefeitura e Câmara.
- Controle: isolamento por UG, parecer, resolução, fechamento/reabertura e rollback do histórico: **1/1**.
- Controle: edição de checklist, resposta irregular, rollback do achado, respostas concorrentes, replay e fechamento: **2/2**, Prefeitura e Câmara.
- Reconhecimento tributário, VPA sem duplicação, benefícios, extinção, DA, retorno à origem e estornos históricos: **2/2**, Prefeitura e Câmara, após corrigir as fixtures.
- Rodada adicional de cadeia fiscal, reconhecimento tributário (incluindo saldo pago em guia cancelada), conciliação e patrimônio: **26/26 aprovados** em PostgreSQL real isolado.
- Diagnóstico bancário nos dois entes: **2/2 aprovados**, no mesmo teste de checklist ampliado: ausência de dados sem resultado regular inferido, fonte faltante em outra UG ignorada, regra manual recusada, replay do diagnóstico, fatos alterados exigindo nova edição e resultado anterior preservado.
- ESLint do bloco aprovado. `npm run build` completo **aprovado, saída 0**, após o diagnóstico automático: geração Prisma, tipos de rotas, TypeScript integral e compilação/prerenderização Next. Comandos anteriores em background foram cancelados pelo reinício do servidor; o build em primeiro plano os substituiu.

## Dependências operacionais confirmadas por leitura do banco

`npx tsx scripts/verify-municipal-module-readiness.ts`, em 13/10/2026, confirmou: **0 contas bancárias, 0 mapeamentos financeiros tributários e 0 perfis de reconhecimento ativos**. A configuração exige dados de contas efetivas, fonte, UG/ente e vínculos arrecadadores. Não inferir agência/conta nem ativar reconhecimento sobre vínculos inexistentes.

## Desenvolvimento ainda pendente — responsabilidade técnica

As pendências abaixo **não dependem apenas do usuário** e não podem ser convertidas em aceite por falta de cadastro operacional:

- P1: consumidores/produtores remanescentes, adoção/de-para/vigência CNAE/CBO/serviços, fonte/MSC e conciliação de legados.
- P2: gestão operacional de perfis DA, regularização de posições históricas, acréscimos/longo prazo e integração completa ITBI/NFS-e/escrita/fiscalização/LRF.
- P3: itens/documentos/subempenhos, estornos parciais, lotes/cronologia/pré-autorização/extras, pendências bancárias e ciclo anual/RP integral.
- P4: tratamento equivalente das restituições nas diárias; matrizes/consumo/amortização/exaustão patrimonial e demais produtores RH/Compras/obras/convênios. Regularização de prestação aprovada e devolução parcial do exercício corrente para adiantamentos foram implementadas e verificadas nas continuações abaixo.
- Controle: diagnósticos automáticos além da fonte das contas, cadastros/ciclo completos de controladores/notificados, notificações e resposta, agenda/obrigações, consultas canônicas Ouvidoria/Jurídico, relatórios RH/constitucionais, circunstanciado/anexos/publicação e demais subcritérios EXE-03.
- Reconciliação individual das evidências de todos os requisitos e testes pertinentes. Os resultados positivos deste bloco não são certificação dos 823 registros.

**P1–P4 e os três checklists completos permanecem em desenvolvimento. Não há autorização técnica de encerramento integral neste documento.**

## Continuação — regularização de prestação aprovada e restituição anterior

- `reopenAdvanceReport` aceita prestação aprovada ou impugnada, conciliando o estágio com a decisão registrada. Exige responsável distinto do solicitante/apresentante, parecer GED válido, data posterior ou igual à revisão e permissões financeiras de criação/alteração. A interface oferece a regularização da prestação aprovada.
- Inverte as partidas históricas de revisão e apresentação, preserva payload/documentos/IDs dos eventos originais, registra a decisão anterior e abre novo ciclo. Confere origem, UG/ente, data e valores Decimal das partidas antes da inversão. Serialização do titular usa a mesma chave da concessão.
- A restituição usada em prestação ativa continua protegida. Após reabertura, o ciclo novo não referencia a restituição antiga; o estorno financeiro nativo pode ocorrer e a prestação posterior precisa conciliar apenas os recebimentos vigentes.
- `advance-prior-year-refund.test.ts`: pagamentos nativos em 2025 e devoluções em 2026 nos dois entes; recebimentos parciais, concorrência/replay, limite acumulado, prestação/aprovação, estorno recusado antes de regularização, rollback por trigger na reabertura aprovada, preservação das aprovações anteriores, estorno com caixa exato e aprovação de novo ciclo. O relógio da fixture é controlado no teste para executar a aprovação nativa no exercício original; nenhum relógio/dado de produção foi alterado.
- A fixture compartilhada passou a criar colunas enum com o tipo PostgreSQL correspondente. O teste positivo revelou que a coluna de estágio da receita era TEXT enquanto Prisma enviava `RevenueStage`; corrigida a preparação, sem contornar a consulta de produção.
- **4/4 testes aprovados** de restituição anterior/regularização e diárias/adiantamentos, Prefeitura e Câmara. Após a correção da fixture, regressão de cadeia fiscal, conciliação, patrimônio e Controle Interno: **27/27 aprovados**. ESLint do bloco aprovado; novo `npm run build` completo aprovado, saída 0.
- A continuação seguinte implementa o produtor de recomposição parcial do corrente para adiantamentos. O tratamento equivalente de restituições nas diárias permanece em desenvolvimento.

## Continuação — devolução parcial do exercício corrente de adiantamentos

- `src/lib/financeiro/allowance-expense-refunds.ts`: recebimento e estorno transacionais por solicitação/pagamento. Exige pagamento integral da concessão sem retenções, mesmo exercício aberto, UG/ente/fonte/conta original, comprovante válido e servidor responsável vinculado ao usuário.
- Cada recebimento cria movimento de anulação parcial do empenho, registros corretivos negativos de liquidação/pagamento na **data da devolução**, documentos financeiros próprios, inversões proporcionais das linhas históricas de empenho/liquidação/pagamento e entrada de tesouraria. Recompõe cotas/cronograma de Planejamento. Os registros e documentos originais conservam valores, IDs e datas. **Não cria receita orçamentária para a devolução do corrente.**
- Os registros corretivos pertencem à execução financeira canônica: somam aos originais nos saldos liquidados/pagos, sem reescrever o passado. Não são ordens bancárias pendentes de transmissão. A origem RH guarda IDs das correções, caixa, movimento e partidas, com chave única/replay e limite acumulado entre devoluções do corrente e receitas de restituição anterior.
- Estorno preserva os registros negativos e acrescenta correções positivas na data do estorno; recompõe empenho/liquidação/pagamento/cotas, inverte as partidas da devolução e retira o ingresso de caixa. Recusa falta de saldo/dotação, exercício/período fechado e prestação ativa. Retoma a prestação após regularização independente já implementada.
- Guardas nativas impedem estorno isolado do pagamento original enquanto existem devoluções vigentes e cancelamento/estorno isolado dos registros corretivos. Depois de estornar todas as devoluções, a cadeia original pode ser estornada/anulada integralmente: os pares corretivos preservados e conciliados não bloqueiam a anulação final do empenho.
- A prestação exclui correções técnicas da comprovação do pagamento original e exige despesas + **todas** as restituições vigentes = concessão. Referência do corrente: `DESPESA:<id do evento>`; referências de receita anterior conservam o ID da receita. A interface de adiantamentos tem os dois comandos novos e o histórico documental inclui recebimentos/estornos do corrente.
- Testes nos dois entes: rollback por trigger no final do recebimento, concorrência/replay, limite acumulado, recomposição de disponibilidade, totais liquidados/pagos e caixa exatos, documentos originais preservados, ausência de receita RH no corrente, registro corretivo protegido, restituição omitida recusada, revisão/reabertura, estorno com replay/divergência e cancelamento integral posterior da cadeia original.
- Rodada integrada: **33/33 aprovados** em PostgreSQL real isolado. Após ampliar a anulação integral pós-estornos e exigir autor da liquidação, rodada focal: **6/6 aprovados**. Build completo com TypeScript/Next **aprovado, saída 0**. A primeira tentativa de build detectou opcionalidade do autor da liquidação; corrigida com exigência explícita de vínculo do usuário ao servidor responsável.
- Esta entrega encerra a pendência específica do corrente em adiantamentos, **não encerra automaticamente P1–P4** nem certifica os demais subcritérios financeiros/fiscais/Controle Interno.
