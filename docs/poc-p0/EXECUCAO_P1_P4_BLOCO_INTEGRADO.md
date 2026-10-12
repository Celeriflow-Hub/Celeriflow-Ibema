# Continuação P1–P4 — catálogos, créditos, tesouraria e alienação

## Situação das fases

**P1 e P2 em andamento; P3 e P4 receberam correções de produtores neste bloco.** As entregas abaixo são verificadas tecnicamente; não representam conclusão integral das quatro fases ou dos 1.052 requisitos.

## P1 — catálogo oficial e leitura autorizada

- Migration aditiva `20261012170000_shared_official_catalog_accounts` aplicada ao banco atual. Expande o registro de versões existente para ACCOUNT/CNAE/CBO/SERVICE e graus até 12; cria índice de vínculo canônico. Não exclui registros.
- Importador `scripts/import-poc-p1-official-catalogs.ts`: leitura por streaming, aba explícita, hash original, resultado preservado das fórmulas (não executa fórmulas), validação de ano/código/nome/duplicidade/nível, árvore e origem por linha.
- Importados **8.760 ACCOUNT**, **1.808 REVENUE**, **3.926 EXPENSE**, nas três versões oficiais de 2026 descritas em `fontes/README.md`. Aplicação e reaplicação aprovadas. Evidência: `CATALOGOS_OFICIAIS_P1.json`.
- Entradas mantêm o código externo textual separado do vínculo canônico. `canonicalId` com prefixo `UNMAPPED:` identifica explicitamente o de-para pendente. As versões permanecem DRAFT; publicação recusa entradas sem vínculo.
- Postagem consulta as classificações ACCOUNT publicadas: exige versão vigente única, atributo explícito de escrituração, vigência e natureza do saldo. Conta sintética é recusada mesmo sem descendentes cadastrados localmente. O fallback legado por prefixo permanece para contas ainda não vinculadas a versão publicada.
- Motor fiscal, guias e detalhe da conta-corrente restringem lançamentos pela UG persistida; créditos/restituições usam seu próprio escopo. Integrações visíveis no motor são filtradas pelas origens autorizadas.

### Pendências de P1

De-para local e homologação/adopção das classificações, fontes/MSC, versões históricas aplicáveis, relações CNAE/CBO/serviços, matriz municipal e revisão integral de todos os demais produtores/leitores/jobs/GED/centros de custo. Importar um arquivo oficial não comprova sua adoção municipal nem a segregação de todos os módulos.

## P2 — ingresso do excedente, compensação e restituição

- O valor aplicado ao débito continua gerando a receita canônica e o realizado de Planejamento. O **excedente** agora gera movimento de entrada extraorçamentária e partida `TAX_COLLECTION_EXCESS`, com a obrigação vinculada ao crédito. Ele não gera uma segunda receita orçamentária.
- Ingresso excedente exige conta contábil bancária e evento configurado. Sua falha reverte pagamento, receita, realizado, tesouraria, partidas, crédito e integração na mesma transação.
- Crédito movimentado exige escopo conciliado e ingresso financeiro vinculado. Transferência preserva origem/ente/UG/ingresso; compensação exige mesmo contribuinte e UG, saldo livre e ausência de guias concorrentes sobre o valor compensado.
- Compensação posta `TAX_CREDIT_COMPENSATED`, registra a extinção sem nova entrada de caixa e reduz o saldo disponível para emissão. Guia posterior cobra somente o restante; baixa subsequente considera o montante já compensado ao determinar quitação.
- Restituição segue reserva do crédito → decisão → pagamento. Pagamento exige autorização também no Financeiro, comprovante GED válido, conta compatível com UG/fonte, saldo e competência aberta; posta `TAX_CREDIT_REFUNDED`, gera saída extraorçamentária e conclui o pedido atomicamente.
- Replay de crédito e restituição verifica autorização e conteúdo. Nova tela de pagamento utiliza seletores de pedido aprovado, conta e comprovante.
- Eventos de referência das fixtures são apenas POC. No banco atual esses eventos precisam da matriz de contas efetivamente configurada; não foi inserida uma parametrização artificial de produção.

### Pendências de P2

Estorno tributário completo e de créditos já utilizados, ciclo integral dívida/guia/benefícios/extinções e eventos contábeis próprios da constituição/revisão/inscrição, renúncia prevista/realizada em todos os produtores, transferências ITBI e escrita/NFS-e, verificação das actions/portais restantes e aceite autenticado. O ciclo de crédito implementado não equivale à compensação fiscal LRF.

## P3 — transferências bancárias

- Autorização da UG de ambas as contas é conferida antes de devolver replay.
- Replay valida valor/data/contas/histórico/origem/evento; lock transacional da chave previne repetição concorrente da mesma origem.
- Exige vínculo de ambas as UGs à mesma entidade, competência aberta e saldo suficiente. Locks bancários usam ordem estável dos IDs.
- Movimento de saída e entrada permanece atômico. Testes comprovam saldo das duas contas e recusa de mês fechado.

### Pendências de P3

Escrituração de transferências diretas e dimensões completas por fonte/UG, estornos parciais, subempenhos, itens/documentos múltiplos, lotes/cronologia/pré-autorização, retenções/extras restantes, conciliação N:N/parcial e fechamento/abertura/RP em todos os estágios. Este bloco não certifica o ciclo anual nem todos os fatos e reversões.

## P4 — alienação patrimonial

- Retiradas as escolhas implícitas da primeira natureza/fonte/conta/exercício.
- Tela e action recebem seleção explícita de UG, conta arrecadadora, natureza e fonte. Serviço valida autorização e compatibilidade com lotação administrativa quando disponível; a arrecadação exige permissão de criação no Financeiro.
- Alienação recebida usa `recordConfirmedRevenue` na mesma transação da baixa: conserva ID do bem/baixa, grava receita/tesouraria/partida e alimenta realizado de Planejamento com a origem patrimonial.
- Resultado de ganho/perda resolve o exercício pela entidade da UG selecionada, sem escolher um exercício de outra entidade. Falta de configuração mantém a pendência explícita existente.
- Mês fechado reverte a baixa e todos os registros financeiros; o bem permanece ativo.

### Pendências de P4

Escopo patrimonial histórico próprio/replay e reversão integral, incorporação e depreciação/amortização/exaustão contabilizadas, consumo valorizado e estoque, cadeia folha→empenho→liquidação→pagamento, origens e devoluções de Compras restantes, obras/instrumentos/diárias/adiantamentos/consórcios/precatórios/PPP exigidos. A ponte RH atual chega a solicitações de despesa, não comprova a conclusão digital de pagamento da folha.

## Validação em bloco

Comandos após as alterações integradas:

```powershell
node --conditions=react-server --import tsx --test --test-concurrency=1 --test-reporter=spec tests/tax-financial-chain.test.ts tests/financial-producers-p3-p4.test.ts tests/planning-execution.test.ts src/lib/patrimonio/__tests__/asset-lifecycle.test.ts
node --conditions=react-server --import tsx --test --test-concurrency=1 --test-reporter=spec tests/tax-financial-chain.test.ts tests/planning-accounting.test.ts tests/planning-completion.test.ts
```

- Rodada integrada: **23 aprovados, zero falhas, três não executados** por ausência de PostgreSQL externo de teste.
- Regressão adicional: **15/15 aprovados**, incluindo repetição dos cinco cenários tributários após ajuste do destino da operação de crédito. São **33 cenários distintos aprovados** entre as duas rodadas, não 38.
- A primeira rodada encontrou dois asserts incompatíveis com a mensagem real de competência e ausência da regra de excedente na fixture antiga; ajustes na fixture/asserts e reexecução passaram.
- ESLint direcionado passou; `git diff --check`, controle P0 e inventário de escopo passaram. Inventário continua sem fatos financeiros artificiais no banco atual; as operações foram ensaiadas nas bases isoladas.
- A verificação da P0 preservou os 1.052 IDs/15 checklists e não promoveu aceite operacional.
- **Build completo do bloco em execução**; resultado será registrado após conclusão. Geração Prisma aproveitada do build, sem execução isolada.
- Navegação autenticada e concorrência PostgreSQL externa não comprovadas neste bloco.

## Continuação necessária

Usar os critérios de saída integrais do plano para cada fase. Fechar as pendências das origens antes de certificar seus relatórios e custos; manter evidência técnica e aceite por requisito/ente separados. As quatro fases só podem ser declaradas concluídas após atender seus critérios completos.
