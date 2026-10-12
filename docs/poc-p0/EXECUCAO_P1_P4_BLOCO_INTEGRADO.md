# Continuação P1–P4 — catálogos, créditos, tesouraria e alienação

## Situação das fases

### Continuação autorizada — matriz de ensaio e reversões

- Usuário autorizou montar matriz de ensaio a partir dos catálogos oficiais, com homologação municipal pendente. O modo local `CELERIFLOW_ACCOUNTING_MODE=POC` habilita as regras de referência; contas de catálogo `pocOnly` são recusadas fora desse modo.
- `scripts/configure-poc-p1-tax-matrix.ts` aplicado e reaplicado: três contas patrimoniais oficiais, versão POC derivada publicada e três regras `isReference` para excedente/compensação/restituição. Hash, códigos e vínculos em `MATRIZ_TRIBUTARIA_POC_P1.json`. Catálogos oficiais originais continuam DRAFT. Não foram criados fatos financeiros pelo script; contas/regras locais conflitantes interrompem a operação em vez de serem substituídas.
- Transferências diretas passam a exigir conta analítica e fonte compatível e escriturar na mesma transação do caixa. UGs distintas recebem pernas balanceadas pela mesma conta de trânsito configurada. Aplicação/resgate reutilizam a postagem feita pelo serviço de transferência.
- Inscrição tributária considera saldo após pagamentos confirmados/compensações; autorização também antecede o replay. Parcelamento bloqueia segunda programação ativa. Solicitações vinculadas e declarações ISS recebem guardas de escopo, e ISS preserva entidade/UG/exercício no snapshot.
- Fechamento/reabertura mensal e anual validam autorização de todas as UGs da entidade no serviço. RP valida UG no serviço, reinscrição confere entidade dos exercícios, e acompanhamento de pagamento recusa alocação acumulada superior ao pagamento e reutilização com outro valor.
- Novo estorno tributário reverte receita, realizado, partidas originais e excedente ainda disponível, preservando histórico. Compensação possui reversão contábil, recompõe crédito e saldo do débito, inclusive após pagamento do restante; transferência ainda disponível e restituição ainda não paga têm reversão de saldo. Restituição já paga continua exigindo fluxo próprio de estorno de caixa. Formulários nas guias e no motor fiscal propagam UGs autorizadas; estorno da arrecadação exige permissões Tributação e Financeiro.
- Regressão integrada: **24 cenários aprovados**, zero falhas e três cenários PostgreSQL não executados nessa rodada. Regressões tributárias após a reversão da compensação: **7/7 aprovadas** (sobreposição com a suíte integrada, não somar como cenários distintos). A primeira execução ampliada atingiu o limite de 120 s; a reexecução com concorrência de arquivos limitada a dois concluiu em 142 s. ESLint direcionado e `git diff --check` aprovados. **Build completo aprovado**, saída 0: Prisma 100 s, tipos de rotas 1 s, TypeScript 171 s e Next.js 180 s; 59 páginas estáticas, aproximadamente 7 min 32 s.
- PostgreSQL descartável instalado fora do projeto no diretório temporário aprovado; **11/11 cenários aprovados com conexões reais**, incluindo os três anteriormente não executados (disputa reserva/contingenciamento, crédito/reserva e cancelamento/empenhamento). Servidor encerrado ao final, sem utilizar o banco atual. Comando: `node scripts/verify-planning-postgres.mjs tests/planning-execution.test.ts`, com módulo e diretório temporário configurados por variáveis de ambiente.
- Usuário decidiu realizar o aceite autenticado pela interface posteriormente; navegador desta sessão continua desconectado. Essa evidência permanece pendente, sem interromper o desenvolvimento interno.

### Próximo bloco — ponte RH

- Em implementação: lotes transacionais por etapa de reserva/empenhamento, liquidação com GED/retenções e pagamento com comprovação GED para todas as despesas do plano imutável de uma folha oficial fechada. Os serviços nativos receberam variantes transacionais, preservando as assinaturas anteriores.
- Novo comando RH e formulário no detalhe do cálculo recebem números/tipos por despesa; guardas de aprovação, escopo, dotação, período, conta e evento continuam no motor nativo. Replay confere plano/data/números/tipos antes de reutilizar os vínculos.
- Pagamento reconcilia bruto, descontos, líquido e encargos por componente com as retenções da liquidação. Conclusão documentada exige pagamentos efetivos e obrigações retidas recolhidas, preservando o cálculo original. Comandos e formulários adicionados ao detalhe do cálculo.
- Teste intermediário do empenhamento aprovado após corrigir comparação de objetos JSONB no replay por parsing canônico do schema. **Teste ampliado da cadeia aprovado, 2/2 no PostgreSQL real — Prefeitura e Câmara separadamente**: reserva/empenho/liquidação/pagamento/conclusão, replay e rollback de lote com falta de saldo na segunda ordem. Regressão PostgreSQL dos serviços nativos **11/11 aprovada** após extração transacional. Build do bloco RH em execução; tentativa anterior interrompida durante checagem TypeScript prolongada, seguida de anotação explícita dos retornos nativos e reexecução.
- Este bloco não conclui P4: matriz e cenários reais de provisões/encargos/descontos, assinaturas digitais e demais produtores/instrumentos ainda precisam de fechamento e evidências específicas.

### Catálogos CNAE/CBO oficiais em revisão

- Capturadas **1.332 subclasses CNAE** da API oficial IBGE e **2.694 ocupações CBO** do CSV oficial MTE, preservando códigos textuais, bytes, origem, hash e codificação da fonte. Arquivos e metadados em `docs/poc-p0/fontes/`.
- Importadores `scripts/import-poc-p1-cnae.ts` e `scripts/import-poc-p1-cbo.ts` aplicados/reaplicados de forma aditiva e idempotente. Evidências em `CATALOGO_CNAE_P1.json` e `CATALOGO_CBO_P1.json`. Ambos permanecem **DRAFT**, com `UNMAPPED:` e vigência/de-para pendentes; captura em 2026 não declara vigência normativa em 2026.
- CBO reutiliza a consulta ao cadastro canônico existente para identificar candidatos sem alterá-los. Detectado código `252305`: fonte “Secretária(o) executiva(o)” versus cadastro “Secretário executivo”; divergência registrada, cadastro preservado.
- Ensaio adicional aprovado para desfazer restituição não paga e transferência de crédito em ordem inversa de consumo, recompondo crédito original sem novas partidas ou caixa.

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
- **Build completo do bloco aprovado**, com saída 0: Prisma 67 s, tipos de rotas 1 s, TypeScript 279 s e Next.js 166 s; 59 páginas estáticas geradas. Tempo total registrado de aproximadamente 8 min 33 s. Geração Prisma aproveitada do build, sem execução isolada.
- Navegação autenticada e concorrência PostgreSQL externa não comprovadas neste bloco.

## Continuação necessária

Usar os critérios de saída integrais do plano para cada fase. Fechar as pendências das origens antes de certificar seus relatórios e custos; manter evidência técnica e aceite por requisito/ente separados. As quatro fases só podem ser declaradas concluídas após atender seus critérios completos.
