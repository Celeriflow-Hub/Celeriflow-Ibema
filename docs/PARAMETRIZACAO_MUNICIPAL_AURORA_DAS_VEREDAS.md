# Parametrização municipal — Aurora das Veredas

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
