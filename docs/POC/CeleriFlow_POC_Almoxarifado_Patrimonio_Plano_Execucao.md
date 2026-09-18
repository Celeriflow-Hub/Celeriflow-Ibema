# CeleriFlow - Plano e Matriz de Execucao da POC
## Almoxarifado e Patrimonio | Atualizado em 18/09/2026

**Fonte:** `CeleriFlow_POC_Almoxarifado_Patrimonio_Desenvolvimento.md`.

## Limites desta entrega

Esta matriz foi criada apos o diagnostico do repositorio. Nenhuma carga foi
executada contra o banco configurado e nenhum requisito esta marcado como
`VALIDADO` sem uma evidencia reproduzivel em ambiente de desenvolvimento ou
homologacao.

**Estado tecnico:** a migration
`20260918100000_add_poc_asset_receipt_consumption` foi aplicada ao banco
configurado em 18/09/2026. Ela e incremental e nao carregou dados ficticios.
Como esta instancia e de producao, nenhuma fixture ou ensaio destrutivo deve
ser executado sem autorizacao especifica para essa base.

As alteracoes desta etapa tornam testavel, pelas telas reais, o primeiro fluxo
vertical de POC:

1. Cadastrar almoxarifado e material, com vinculo opcional e univoco ao catalogo de Compras.
2. Criar uma solicitacao de compra com o material compartilhado; o vinculo e copiado para o processo.
3. Confirmar o recebimento aprovado em Compras; a linha recebida cria o saldo de estoque.
4. Tombar uma unidade recebida em Patrimonio; a unidade e reservada por compare-and-swap, removida do estoque livre e ligada ao movimento de saida.
5. Criar requisicao interna pelo usuario solicitante, aprovar com outro usuario e entregar todas as linhas pendentes numa unica transacao.

Os testes unitarios correspondentes sao:

- `src/lib/patrimonio/__tests__/asset-acquisition-service.test.ts`
- `src/lib/patrimonio/__tests__/material-request-fulfillment.test.ts`
- `tests/c5-procurement-policy.test.ts`

## Plano por pacote

| Pacote | Estado | Entrega e criterio de saida |
|---|---|---|
| P0 - diagnostico e rastreabilidade | Concluido | Esta matriz, estados honestos por ID e roteiro de evidencia. |
| P1 - mestres e fluxo vertical | Em execucao | Cadastros de almoxarifado/material/requisicao, material compartilhado em Compras, recebimento e tombamento com consumo atomico. |
| P2 - movimentos completos | A implementar | Abertura idempotente, doacao, devolucao, outros, transferencia em duas pontas, enderecos e lotes por posicao. |
| P3 - consultas e relatorios | A implementar | Balancete, boletim de entradas, historico, transferencias, relacoes patrimoniais e exportacoes coerentes. |
| P4 - ciclo patrimonial | A implementar | Formulas versionadas, avaliacoes em rascunho, estornos, inventario patrimonial, baixa, transferencia e comissoes/GED. |
| P5 - evidencia final | A implementar | Fixture segura, ensaio completo, provas de UI/API/concorrencia e documentos gerados. |
| P6 - Tribunal | Bloqueado externo | Leiaute, versao, competencia e validador oficial ainda nao foram fornecidos. |

## Roteiro de teste atual

1. Em `/patrimonio/almoxarifados/novo`, criar os depositos ficticios Central e Educacao.
2. Em `/patrimonio/materiais/novo`, criar os materiais POC e, quando forem compraveis, vincular cada um a um unico item de catalogo.
3. Em `/compras/solicitacoes/nova`, abrir a solicitacao de compra com o item de catalogo. A criacao agora replica o `materialId` para a cadeia de processo e recebimento.
4. Apos aprovacao, processo e contrato vigentes, usar `/compras/recebimentos` para registrar a NF e o saldo. O servidor rejeita material diferente do item aprovado.
5. Em `/patrimonio/bens/novo`, tombar os itens permanentes. Conferir em `/patrimonio/materiais` a saida do estoque livre e em `/patrimonio/bens` a origem do bem.
6. Em `/patrimonio/requisicoes/nova`, criar requisicao com papel e caneta. Outro usuario com servidor vinculado aprova e, no detalhe, seleciona uma posicao por item para "Entregar saldo integral".

Os passos de aprovacao, recebimento e entrega exigem usuarios distintos com
vinculo de servidor, conforme as validacoes existentes. A fixture de dados
ficticios e o ensaio F-ALM completo ainda pertencem ao P5.

## Matriz de Almoxarifado

| ID | Estado | Rota/servico/persistencia atual | Teste ou pendencia de evidencia |
|---|---|---|---|
| ALM-001 | PARCIAL | `stock-service.ts`, `MaterialStock`, `MaterialMovement`; entradas de recebimento, saidas e ajustes. | Lotes e bloqueio de inventario possuem teste; faltam transferencia e F-ALM completo. |
| ALM-002 | PARCIAL | `/patrimonio/materiais/novo`, `Material`, `CatalogItem`. | Cria catalogo com ID estavel; falta edicao preservando historico. |
| ALM-003 | PARCIAL | `Supplier` compartilhado por Compras, estoque e bens. | Falta prova PF/PJ reutilizada na POC. |
| ALM-004 | A_VERIFICAR | Cadastros de fornecedor compartilhados. | Validar PF/CPF e PJ/CNPJ em UI/API com testes incompatíveis. |
| ALM-005 | PARCIAL | `batchNumber` e `expirationDate` em saldo/recebimento. | Faltam demonstracao de saida por lote e saldo por validade. |
| ALM-006 | A_IMPLEMENTAR | `Warehouse.address` nao modela enderecos de estoque. | Criar posicoes fisicas e saldo por endereco. |
| ALM-007 | PARCIAL | `Material.name` e `Material.description`; tela sem limite funcional na descricao. | Faltam campos sucinto/detalhado e teste de textos longos. |
| ALM-008 | PARCIAL | Busca atual por codigo e nome em `/patrimonio/materiais`. | Falta busca de fragmento na descricao e casos de teste. |
| ALM-009 | PARCIAL | `approvePurchaseReceipt`, `PurchaseReceiptItem`, `applyStockMovement`. | Material da solicitacao agora e preservado e validado; falta emissao automatica da AF e evidencia completa. |
| ALM-010 | A_IMPLEMENTAR | Entrada manual continua bloqueada por politica C5. | Implementar doacao, devolucao vinculada e outros com justificativa. |
| ALM-011 | PARCIAL | `Warehouse` e saldos por almoxarifado. | Faltam consolidacao e isolacao demonstrada Central/Educacao. |
| ALM-012 | A_IMPLEMENTAR | Nao ha servico de transferencia em duas pontas. | Implementar transacao debitada/creditada com vinculo unico. |
| ALM-013 | A_IMPLEMENTAR | Requisicao usa setor; nao existe centro de consumo separado. | Modelar e vincular centro de custo/consumo. |
| ALM-014 | PARCIAL | `MaterialRequest` possui solicitante e setor. | Nova tela usa servidor autenticado; falta vinculo opcional de usuario e teste de segregacao. |
| ALM-015 | PARCIAL | Categoria de material e indicador de perecivel existem. | Falta classificacao configuravel consumo/permanente/outra. |
| ALM-016 | A_IMPLEMENTAR | Sem relatorio de credito de transferencia. | Depende de ALM-012. |
| ALM-017 | A_IMPLEMENTAR | Sem relatorio de debito de transferencia. | Depende de ALM-012. |
| ALM-018 | PARCIAL | Mesmo suporte de lote de ALM-005. | Registrar evidencia independente quando o cenario existir. |
| ALM-019 | PARCIAL | `minStock` e `maxStock` por material. | Falta configuracao por almoxarifado, media e alerta comprovado. |
| ALM-020 | PARCIAL | `/patrimonio/requisicoes/nova`, `createMaterialRequest`, `MaterialRequest`. | Criacao autenticada implementada; falta ensaio com requisitante externo e consulta posterior. |
| ALM-021 | A_IMPLEMENTAR | Sem balancete por classe/periodo. | Gerar a partir de movimentos confirmados. |
| ALM-022 | PARCIAL | `inventory-service.ts` e bloqueio em `stock-service.ts`. | Teste unitario cobre bloqueio; falta prova UI/API/concorrencia para todos os caminhos. |
| ALM-023 | A_IMPLEMENTAR | Sem boletim de entradas externas. | Depende de naturezas de entrada de ALM-010. |
| ALM-024 | PARCIAL | `MaterialMovement` preserva movimentos. | Falta tela/relatorio cronologico com todos os campos. |
| ALM-025 | PARCIAL | `/patrimonio/requisicoes/[id]`, `issueMaterialRequestInFull`. | Entrega integral atomica possui teste unitario; falta ensaio de falta em uma linha e evidencia UI. |
| ALM-026 | A_IMPLEMENTAR | Sem duplicacao segura de material/modelo. | Copiar somente atributos descritivos/classificacao. |
| ALM-027 | A_IMPLEMENTAR | Sem evento de abertura/implantacao idempotente. | Implementar via servico de dominio, sem depender de importacao. |

## Matriz de Patrimonio

| ID | Estado | Rota/servico/persistencia atual | Teste ou pendencia de evidencia |
|---|---|---|---|
| PAT-001 | PARCIAL | `Department` e `AssetTransfer` existem. | Faltam transferencia funcional, snapshots historicos e teste de ciclos. |
| PAT-002 | A_IMPLEMENTAR | Depreciacao e calculada em codigo. | Faltam formulas restritas, versoes e parametrizacao real. |
| PAT-003 | PARCIAL | `/patrimonio/bens` lista e filtra parcialmente. | Faltam todos os filtros e rotulos de datas/valores exigidos. |
| PAT-004 | A_IMPLEMENTAR | Sem duplicacao de bem como modelo. | Criar novo tombamento sem copiar historicos/origem. |
| PAT-005 | PARCIAL | `recordAssetDisposal` e `AssetWriteOff`. | Falta cobertura de todos os motivos, documento e ensaio com bens independentes. |
| PAT-006 | PARCIAL | `acquireAssetFromPurchaseReceipt`, `Asset.stockMovementId`, `PurchaseReceiptItem.quantityIncorporated`. | Tombamento agora consome uma unidade e rastreia a saida; falta ensaio F-INTEGRACAO pela UI. |
| PAT-007 | PARCIAL | `Material` e `PurchaseReceiptItem.materialId` sao reutilizados. | Falta demonstracao completa de contexto historico na tela/relatorio. |
| PAT-008 | PARCIAL | `Asset.supplierId` aponta para fornecedor compartilhado. | Falta ensaio PF e PJ. |
| PAT-009 | A_VERIFICAR | Atalhos patrimoniais para fornecedor nao existem. | Validar regras PF/CPF e PJ/CNPJ em UI/API. |
| PAT-010 | PARCIAL | `AssetCategory` existe. | Faltam grupos distintos de moveis, imoveis, semoventes e intangiveis. |
| PAT-011 | A_IMPLEMENTAR | Nao ha classe patrimonial separada da categoria. | Vincular a referencias contabeis existentes. |
| PAT-012 | A_IMPLEMENTAR | Sem estorno de avaliacao. | Criar evento vinculado, justificado e nao duplicavel. |
| PAT-013 | A_IMPLEMENTAR | Sem relatorio de estornos. | Depende de PAT-012, PAT-014 e PAT-015. |
| PAT-014 | A_IMPLEMENTAR | Sem estorno de depreciacao. | Restaurar valores e preservar competencia/formula. |
| PAT-015 | A_IMPLEMENTAR | Sem estorno de reavaliacao. | Respeitar dependencias cronologicas. |
| PAT-016 | PARCIAL | Historicos de valor e baixa persistem. | Falta relatorio unificado de historico do bem. |
| PAT-017 | A_IMPLEMENTAR | Ajustes sao efetivos diretamente. | Criar rascunho, confirmacao e evento reversivel. |
| PAT-018 | PARCIAL | `asset-lifecycle.ts` calcula depreciacao. | Faltam preview, residual parametrizavel e confirmacao rastreavel. |
| PAT-019 | A_IMPLEMENTAR | Ha inventario de estoque, nao patrimonial. | Criar bloqueio de transferencia/baixa de bens enquanto aberto. |
| PAT-020 | A_IMPLEMENTAR | Sem comissao patrimonial integrada a GED. | Criar membros, vigencia, nomeacao e abertura protegida. |
| PAT-021 | A_IMPLEMENTAR | Sem duplicacao de material exposta em Patrimonio. | Reutilizar ALM-026 sem gerar bem/saldo. |
| PAT-022 | PARCIAL | Grid de tombamento mostra saldo elegivel de `quantityIncorporated`. | Falta grade com fornecedor/NF e teste concorrente com cinco notebooks. |
| PAT-023 | PARCIAL | `Asset` possui dados basicos e referencia a imovel. | Faltam campos proprios obrigatorios de imovel e relatorio. |
| PAT-024 | A_IMPLEMENTAR | Sem etiqueta/QR Code protegido. | Gerar QR unico e validar acesso ao bem correto. |
| PAT-025 | PARCIAL | Reutiliza `AssetWriteOff`. | Registrar evidencia separada para o requisito repetido. |
| PAT-026 | A_IMPLEMENTAR | GED existe, sem integracao patrimonial comprovada. | Vincular anexos, autorizar abertura e testar negacao. |
| PAT-027 | BLOQUEADO_EXTERNO | Sem leiaute oficial, versao ou validador recebido. | Nao gerar nem transmitir arquivo generico como prestacao de contas. |
| PAT-028 | A_IMPLEMENTAR | Modelo `AssetTransfer` sem fluxo/UI/termo. | Implementar transferencia efetiva e termo condicionado ao inventario. |
| PAT-029 | A_IMPLEMENTAR | Sem relatorio de baixas. | Gerar somente a partir de baixas confirmadas. |
| PAT-030 | PARCIAL | `recordAssetDisposal` evita baixa repetida e preserva historico. | Faltam bloqueio de inventario, versao e evidencia de efeitos contabeis. |
| PAT-031 | A_IMPLEMENTAR | Sem comissao patrimonial. | Reutilizar PAT-020 com evidencia separada. |
| PAT-032 | A_IMPLEMENTAR | Sem relacao sintetica por data de cadastro. | Criar filtros, totais e comportamento de periodo vazio. |

## Evidencias ainda obrigatorias

- Base `POC - dados ficticios` isolada, idempotente e nunca aplicada em producao.
- F-ALM completo, incluindo resultados 128/20/148 e canetas, com persistencia apos recarga.
- F-INTEGRACAO com cinco notebooks, dois tombamentos e tres unidades elegiveis.
- Testes de concorrencia, falha atomica e bloqueio de inventario via UI e API.
- Provas de RBAC, escopo organizacional, anexos e QR.
- Relatorios e arquivos emitidos a partir dos movimentos reais, com filtros e totais conciliados.
