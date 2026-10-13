# Parametrização municipal — Aurora das Veredas

## Contas analíticas de pessoal adotadas em 12/10/2026

Edição municipal `aurora-payroll-accounts-2026-v1`, publicada aditivamente a partir de `p1-tce-pr-account-2026-1.0d` (PCASPM TCE-PR 2026 v1.0d). Hash municipal `e934a1a19fd50d898a41f3aeeee784143d2d514b4c3c57c57acdb5c4c9521f32`. Script `scripts/adopt-aurora-payroll-accounts.ts` validou origem/hash, natureza patrimonial, D/C, conta escritural e vigência; aplicação e replay aprovados com modo `MUNICIPAL` explícito. Nenhuma conta anterior foi renomeada ou substituída; edição oficial preservada.

| Código externo TCE-PR | Uso disponível | ID canônico |
| --- | --- | --- |
| 2.1.1.1.1.01.02.00.00.00.00.00 | Passivo de décimo terceiro | `aurora-account:2.1.1.1.1.01.02.00.00.00.00.00` |
| 2.1.1.1.1.01.03.00.00.00.00.00 | Passivo de férias | `aurora-account:2.1.1.1.1.01.03.00.00.00.00.00` |
| 2.1.1.4.1.01.01.00.00.00.00.00 | Contribuições RGPS sobre salários/remunerações | `aurora-account:2.1.1.4.1.01.01.00.00.00.00.00` |
| 3.1.1.1.1.01.21.00.00.00.00.00 | VPD de férias vencidas/proporcionais | `aurora-account:3.1.1.1.1.01.21.00.00.00.00.00` |
| 3.1.1.1.1.01.22.00.00.00.00.00 | VPD de décimo terceiro | `aurora-account:3.1.1.1.1.01.22.00.00.00.00.00` |
| 3.1.2.2.1.01.00.00.00.00.00.00 | VPD de contribuições previdenciárias RGPS | `aurora-account:3.1.2.2.1.01.00.00.00.00.00.00` |

A adoção disponibiliza classificações, sem criar folha, direito, provisão, obrigação, lançamento ou caixa fictício. A classificação por regime, abono e encargo usa a memória RH; quando há encargo patronal, a operação de contabilização exige contas próprias de VPD/passivo e gera parcelas separadas. Reservas novas vinculam remuneração/encargos ao componente da despesa no plano financeiro da folha; baixas respeitam esse componente e o saldo efetivo de cada passivo. Memórias legadas sem componente conservam o consumo histórico. Pagamento parcial e estorno mantêm referência à baixa, partida e caixa nativos, com bruto/líquido/retenções distintos. A edição não altera a configuração geral de modo contábil da instalação.

## Política municipal de diárias adotada em 12/10/2026

Script `scripts/adopt-aurora-travel-policy.ts --apply`, aplicação/replay aprovados. Hash `94043dba0c3ff941ed664fca482c2b39374965e26f03d4f046bba7da1e60909d`. Conjunto `aurora-travel-rules-2026-v1`, regime `aurora-travel-regime-2026-v1` e regra `aurora-travel-2026-v1:aurora-travel-rules-2026-v1`. Vigência inicial 01/01/2026 a 31/12/2026, escopo de produção, com decisão estimada registrada. O conjunto trata viagens; não representa parametrização completa de cálculo da folha. Contratos/regimes antigos não foram convertidos.

| Destino | Valor unitário inicial |
| --- | --- |
| Distrito Federal | R$ 600,00 |
| Capital | R$ 450,00 |
| Interior | R$ 300,00 |
| Internacional | USD 200,00, convertido pela cotação informada |

Distância elegível estritamente superior a 50 km; períodos de 24 h contam uma diária; fração superior a 12 h com pernoite conta uma diária, superior a 8 h conta meia diária; demais frações não geram valor. Arredondamento `HALF_UP` para centavos. Premissas ajustáveis por nova vigência, sem número de lei municipal presumido. UG explícita e centro de custo do contrato devem pertencer ao mesmo ente. Concessão exige autorização numerada; despacho financeiro exige dotação da UG e credor correspondente à pessoa do servidor. Prestação exige pagamento nativo integral e relatório GED válido.

### Roteiros municipais de liberação

Aplicação/replay: `scripts/adopt-aurora-travel-workflows.ts --apply`. Hash `dc631c31ea498eef61a8a3aa90b576a7d56a103ccd653ba1a2ad665c4686591d`. Roteiro executivo `aurora-travel-workflow:p0-current-exe:v1`; legislativo `aurora-travel-workflow:p0-current-leg:v1`. Cada ente tem um tipo/assunto de viagens, uma versão publicada e dois setores próprios, ligados à sua secretaria canônica: **Revisão RH → Autorização e empenho**, com três dias corridos por etapa. Todas as UGs vinculadas ao mesmo ente podem utilizar seu roteiro, mantendo a classificação financeira da solicitação.

Solicitação protocolada guarda a versão do roteiro e o plano financeiro. Responsável final deve ser distinto de quem abriu o processo e de quem solicitou a diária, possuir autorização RH/Financeiro e UG adequada. A conclusão emite automaticamente despesa, aprovação, reserva, empenho, nota e autorização `DIARIA-<processId>`; permanece atômica com o estado do processo. Rejeição não cria despesa/empenho. A configuração usa as telas existentes de Processos; alteração de etapas publica uma nova versão. Não houve alteração dos roteiros/processos anteriores nem atribuição de usuários aos novos setores.

## Adiantamentos e controle da prestação

Edição `aurora-advance-controls-2026-v1`, origem `p1-tce-pr-account-2026-1.0d`, hash municipal `3780b2dd74644743490f499c78dbbb0d557c348e8dfa1d9c9706c73cbb00c377`. Aplicação/replay de `scripts/adopt-aurora-advance-accounting.ts --apply` aprovados, com validação do hash de origem oficial, natureza de informação de controle, natureza D/C, escrituração e vigência 2026. Contas anteriores/edição fonte preservadas.

| Conta oficial TCE-PR | Uso |
| --- | --- |
| 7.9.1.2.1.00.00.00.00.00.00.00 | Controle dos adiantamentos concedidos |
| 8.9.1.2.1.01.00.00.00.00.00.00 | A comprovar |
| 8.9.1.2.1.02.00.00.00.00.00.00 | Comprovados, em revisão |
| 8.9.1.2.1.03.00.00.00.00.00.00 | Aprovados |
| 8.9.1.2.1.04.00.00.00.00.00.00 | Impugnados |

Eventos operacionais: `ADVANCE_GRANTED` (D7/C8 a comprovar), `ADVANCE_REPORTED` (D8 a comprovar/C8 comprovados), `ADVANCE_APPROVED` (D8 comprovados/C8 aprovados), `ADVANCE_DISALLOWED` (D8 comprovados/C8 impugnados). A despesa e o caixa são nativos; essas partidas registram somente o controle da concessão/prestação, sem duplicar VPD ou pagamento.

Procedimento inicial estimado: um adiantamento pendente por titular/pessoa no mesmo ente, valor positivo e prazo explícito não anterior à concessão, roteiro publicado e liberação independente. Apresentação exige comprovação integral com GED e pagamento confirmado; revisão é independente do solicitante/apresentante. Estorno financeiro desfaz as etapas de controle da prestação e reabre pendência; anulação nativa do empenho desfaz a concessão e libera nova solicitação. `/rh/adiantamentos` apresenta os comandos e o estado por UG. Restituições parciais continuam em implementação.

Prestação impugnada pode ser reaberta por responsável independente com parecer GED e fundamento. A reabertura reverte as partidas da rodada anterior na data autorizada e cria novo ciclo de apresentação/revisão, sem alterar documentos ou decisões originais. O titular permanece com pendência até aprovação. Histórico completo, inclusive rodadas estornadas, disponível em PDF/CSV/XLSX na página do adiantamento, com acesso autorizado por UG.

## Diretriz vigente

Em 12/10/2026, o responsável determinou que a ausência de documentos municipais não interrompa a implementação. Os fluxos devem funcionar com dados e parâmetros iniciais estimados, ajustáveis na implantação, apresentados como operações municipais. Prefeitura e Câmara permanecem segregadas.

As estimativas são registradas na trilha interna de configuração. Referências legais específicas somente são preenchidas quando conhecidas; a decisão de parametrização não é convertida em número de lei presumido.

## Matriz tributária operacional aplicada

Identidades municipais configuradas no banco atual: **Prefeitura Municipal de Aurora das Veredas** (`AURORA-EXEC`) e **Câmara Municipal de Aurora das Veredas** (`AURORA-LEG`). IDs e vínculos de entidade/UG/exercício mantidos; denominações administrativas atualizadas e valores anteriores preservados na auditoria. Aplicação/replay: `scripts/configure-aurora-identity.ts --apply`.

Versão: `aurora-tax-accounting-2026-v1`.

Hash: `7e9247930a97cbe6a656185686ab6ae801a3747cf24038db9ec1e5318f625799`.

Fonte das contas: subconjunto PCASPM/TCE-PR 2026 já importado. Mantidos os IDs canônicos, códigos e atributos de escrituração, natureza D/C e vigência. A edição anterior permanece imutável; a edição municipal referencia explicitamente suas entradas antecessoras.

| Operação | Procedimento inicial |
|---|---|
| Excedente arrecadado | Ingresso extraorçamentário, obrigação de restituir e crédito disponível, sem segunda receita orçamentária. |
| Compensação do próprio contribuinte | Extingue o saldo livre de débito na mesma entidade/UG; não movimenta caixa. |
| Compensação entre contribuintes | Vincula crédito de origem, débito de destino e autorização GED válida; mesma entidade/UG, destino ativo e saldo disponível. |
| Restituição | Solicitação consome a disponibilidade; decisão administrativa antecede a saída de tesouraria; pagamento exige comprovante GED, conta/fonte compatíveis e saldo. |
| Estorno de restituição paga | Exige comprovante GED do retorno, inverte a partida original, registra entrada na conta original e recompõe o crédito. Preserva o pagamento original. |
| Reversões de compensação/transferência | Recompõem o crédito e o débito/destino correspondente, sem criar nova receita nem apagar o histórico. |
| Competência fechada | Recusa novos fatos; replay autorizado do mesmo ato preserva a origem e não duplica valores. |

Aplicação/reaplicação: `scripts/adopt-aurora-tax-accounting.ts --apply`. Aplicação e replay conferidos no banco atual; regras dos três eventos tributários são operacionais, sem dependência do modo restrito anterior.

## Continuidade

A adoção acima cobre os três eventos tributários identificados. A matriz completa de eventos, classificações fonte/MSC, benefícios/extinções, produtores financeiros e demais itens P1–P4 continuam em execução. A falta de documento municipal passa a ser tratada por configuração inicial rastreável, não por bloqueio de desenvolvimento.

O responsável realizará a autenticação e a conferência pela interface. A conclusão integral depende da execução e evidência de todos os requisitos, e não apenas da aprovação de build.
