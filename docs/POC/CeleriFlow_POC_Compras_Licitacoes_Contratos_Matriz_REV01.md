# CeleriFlow POC Compras, Licitacoes e Contratos - Matriz REV01

## Criterio de Status

- `IMPLEMENTADO-TESTADO`: codigo e teste automatizado isolado presentes.
- `PARCIAL`: ha estrutura ou CRUD, mas falta fluxo, regra, UI ou evidencia exigida.
- `PENDENTE`: nao ha entrega verificavel neste recorte.
- `DEPENDENCIA EXTERNA`: exige credencial, leiaute ou homologacao ainda indisponivel.

Esta matriz e um registro honesto do estado atual. Ela nao substitui o documento de requisitos `CeleriFlow_POC_Compras_Licitacoes_Contratos_Desenvolvimento_REV01.md` nem transforma a simulacao SIAFIC em integracao oficial.

| IDs | Escopo | Status atual | Evidencia ou proxima acao |
| --- | --- | --- | --- |
| CLC-001, CLC-004, CLC-020 | ME/EPP e CNAE | PARCIAL | Campos de empresa e fornecedor existem; falta roteiro de consulta e evidencia funcional. |
| CLC-002, CLC-009 | Pesquisa de fornecedor | PARCIAL | Tela de fornecedores existe; validar filtros exigidos pela POC. |
| CLC-003, CLC-007 | Certidoes, validades e regularidade | PENDENTE | Implementar documentos, alertas, relatorios e links funcionais. |
| CLC-005, CLC-006 | Fornecedor PF/PJ e campos condicionais | PARCIAL | Formulario de contrato aceita fornecedor PF/PJ; cobrir formulario/validacao de fornecedor e teste. |
| CLC-008 | Exportacao de fornecedor ao SIAFIC | IMPLEMENTADO-TESTADO | `src/lib/siafic/source.ts`, outbox e T01 automatizado/E2E. |
| CLC-010 a CLC-019 | Pesquisa de precos e portal do fornecedor | PARCIAL | Esta POC acrescenta somente lembretes internos auditados para convites pendentes. Nao ha provedor nem evidencia de entrega por e-mail, e o fluxo completo nao esta aceito por esta evidencia. |
| CLC-021, CLC-022, CLC-024 | Ciclo de compras, processo e planejamento | PARCIAL | Solicitacao/processo basicos existem; falta fluxo completo e planejamento futuro. |
| CLC-023 | Solicitacoes por unidades autorizadas | IMPLEMENTADO-TESTADO | Origem e edicao/exclusao sao restritas no servidor ao servidor, secretaria e departamento autenticados; administrador e excecao explicita. Cobertura em `tests/purchase-request-origin-policy.test.ts`. |
| CLC-025, CLC-031 | Dotacao por item | PENDENTE | Modelar e validar vinculo por item, sem duplicar informacao contabil. |
| CLC-026 | Comissao, pregoeiro e leiloeiro | PENDENTE | Implementar papeis, designacao e trilha. |
| CLC-027 | Integracao Estoque, Compras, Licitacoes e Contratos | PARCIAL | Relacoes de processo e itens existem; falta demonstracao sem redundancia. |
| CLC-028 a CLC-037 | Procedimento, fases, numeracao, documentos e vencedores | PARCIAL | Estrutura basica de processo existe; fluxos e evidencias permanecem pendentes. |
| CLC-038 | Arquivos de prestacao de contas ao Tribunal | PARCIAL / DEPENDENCIA EXTERNA | Controle de pacotes, configuracao declarada e auditoria existem; arquivo oficial continua bloqueado sem leiaute, competencia, credencial e validacao do Tribunal. |
| CLC-039, CLC-041, CLC-043, CLC-046 | Lances e disputa mobile | PENDENTE | Implementar portal responsivo, sessao, lotes, lances e concorrencia. |
| CLC-040, CLC-048 | PNCP | PARCIAL / DEPENDENCIA EXTERNA | Um conector PNCP controla pacotes por contexto e estados verificaveis, mas nao transmite nem confirma automaticamente sem contrato tecnico, credencial e homologacao oficial. |
| CLC-042, CLC-044, CLC-045, CLC-047 | Participantes, pregoeiro e resultado | PENDENTE | Implementar administracao de disputa e transicoes auditaveis. |
| CLC-049, CLC-072 | Contratos/convenios e vigencia | PARCIAL | CRUD de contrato, unidade gestora de origem e snapshot existem; convenios e calculos completos faltam. |
| CLC-050, CLC-073 | Aditivos, suspensoes e rescisoes | PARCIAL | Modelo de aditivo existe; fluxo completo, motivos e efeitos exigem validacao. |
| CLC-051, CLC-074 | Responsaveis, representantes e grupos | PENDENTE | Implementar partes, signatarios e grupos de convenio/contrato. |
| CLC-052, CLC-075 | Exportacao de contrato ao SIAFIC | IMPLEMENTADO-TESTADO | Snapshot imutavel, dependencia de fornecedor, recibo e T14 E2E. |
| CLC-053, CLC-076 | Razao de contratos/convenios | PENDENTE | Implementar relatorio e filtros auditaveis. |
| CLC-054, CLC-077 | Medicoes e etapas | PENDENTE | Implementar registros, validacao e reflexos. |
| CLC-055, CLC-078 | Parcelas | PENDENTE | Implementar cronograma, parcelas e controles. |
| CLC-056 a CLC-071 | AE, AF, AL, empenho, liquidacao, anulacoes e relatorios | PARCIAL | O bridge de Compras gera AE por dotacao, AF/AL por fato de origem e encaminha empenho/liquidacao ao nucleo financeiro nativo, inclusive reversoes permitidas pela origem. Anulacao de AE, complementacao e relatorios especificos ainda nao possuem fluxo/modelo completo. |
| CLC-079 | PNCP no contexto contratual | PARCIAL / DEPENDENCIA EXTERNA | O pacote contratual preserva o contexto de origem; versao documental, operacao PNCP e confirmacao externa permanecem dependencias do contrato tecnico oficial. |

## SIAFIC DEMO

| Caso | Resultado automatizado | Arquivo |
| --- | --- | --- |
| Migration incremental | Aplica em PGlite sem banco compartilhado | `tests/siafic.migration.test.ts` |
| Criacao de fornecedor | Evento, versao, hash e entrega pendente | `tests/siafic.integration.test.ts` |
| Criacao de contrato | Fornecedor canonico, item, unidade e valor no snapshot | `tests/siafic.integration.test.ts` |
| Rollback local | Falha de outbox reverte fornecedor | `tests/siafic.integration.test.ts` |
| Receptor independente | Entrega autenticada e dependencia | `tests/siafic.e2e.test.ts` |
| Idempotencia | Reenvio retorna recibo sem duplicar | `tests/siafic.e2e.test.ts` |
| Falhas T17/T18 | Antes/depois do commit confirmam sem duplicar | `tests/siafic.e2e.test.ts` |
| Credencial invalida T30 | Receptor responde 401 | `tests/siafic.e2e.test.ts` |

## Aceite POC

O aceite desta vertical exige executar o roteiro de `CeleriFlow_SIAFIC_DEMO_Operacao_REV01.md` contra um ambiente DEMO provisionado, arquivar os recibos e a reconciliacao e preencher a evidencia de cada CLC aplicavel. Sem isso, o status permanece de implementacao automatizada, nao de demonstracao operacional homologada.

Para CLC-038, CLC-040, CLC-048 e CLC-079, consultar tambem `CLC_P8_PACOTES_EXPORTACAO_POC.md`. Pacotes JSON POC, retorno manual registrado e configuracao declarada nao equivalem a remessa Tribunal/PNCP homologada.
