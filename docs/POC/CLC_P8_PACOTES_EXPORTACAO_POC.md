# CLC P8 - Pacotes de Exportacao POC

## Escopo entregue

`/compras/exportacoes` organiza os pacotes de saida de Compras para:

| Pacote | Requisito | Destino | Origem |
| --- | --- | --- | --- |
| Prestacao de contas de licitacao | CLC-038 | TCE-PB / SAGRES | Licitacao e processo de compra |
| Prestacao de contas de contrato | CLC-038 | TCE-PB / SAGRES | Contrato e processo de compra |
| Compra e licitacao | CLC-040 | PNCP | Licitacao e processo de compra |
| Procedimento e resultado | CLC-048 | PNCP | Licitacao com resultado atual em todos os lotes |
| Contexto contratual | CLC-079 | PNCP | Contrato e processo de compra |

Os tres contextos PNCP usam a mesma `IntegrationConnection` de codigo `PNCP`; nao ha tres conectores ou tres publicacoes do mesmo fato.

Os valores de exemplo em maiusculas devem ser substituidos. Eles mantem a conexao bloqueada e nao constituem identificacao oficial de leiaute.

## Configuracao obrigatoria

TCE-PB / SAGRES e PNCP permanecem em `PENDING_CONFIGURATION` enquanto a conexao nao estiver `ATIVA` e nao contiver:

- referencia de credencial no cofre, por exemplo `secret://integracoes/pncp`;
- `layout.code`, `layout.version` e `layout.specificationReference` no JSON publico;
- `layout.competence` no formato `AAAA-MM` para TCE-PB / SAGRES;
- operacoes declaradas em `operations`.

Exemplo TCE-PB / SAGRES:

```json
{
  "layout": {
    "code": "IDENTIFICADOR_OFICIAL_DO_LEIAUTE",
    "version": "VERSAO_OFICIAL",
    "specificationReference": "URL_OU_REFERENCIA_DA_ESPECIFICACAO_OFICIAL",
    "competence": "2026-09"
  },
  "operations": ["BIDDING_ACCOUNTABILITY", "CONTRACT_ACCOUNTABILITY"]
}
```

Exemplo PNCP:

```json
{
  "layout": {
    "code": "IDENTIFICADOR_OFICIAL_DO_CONTRATO_TECNICO",
    "version": "VERSAO_OFICIAL",
    "specificationReference": "URL_OU_REFERENCIA_DA_ESPECIFICACAO_OFICIAL"
  },
  "operations": ["PROCUREMENT", "PROCEDURE_RESULT", "CONTRACT"]
}
```

A declaracao de leiaute identifica a dependencia, mas nao substitui validacao oficial, adaptador homologado, endpoint ou credencial real. O ambiente permitido atualmente para esses conectores continua `MOCK`; nenhum teste da tela envia dados a TCE ou PNCP.

## Estados e evidencia

| Estado | Significado verificavel |
| --- | --- |
| `PENDING_CONFIGURATION` | Credencial, leiaute, operacao declarada ou ativacao da conexao esta ausente. Nenhum pacote baixavel e gerado. |
| `QUEUED` | Snapshot JSON POC foi preparado para entrega externa manual. Nenhuma chamada de rede, envio ou recibo e alegado. |
| `CONFIRMED` | Um operador registrou uma referencia externa de comprovacao. O registro identifica a origem manual e nao a transforma em confirmacao automatica. |
| `REJECTED` | Validacao local recusou o pacote, por exemplo resultado atual ausente em CLC-048, ou o operador registrou uma referencia externa de rejeicao. |

Cada criacao, retorno manual e download gera evidencia em `AuditEvent`. O pacote persiste em `IntegrationRun` com chave de idempotencia deterministica baseada em pacote, conexao, configuracao declarada e snapshot de origem. Repeticoes sequenciais da mesma chave reutilizam o historico existente.

`IntegrationRun` nao possui indice unico para essa chave, fila generica, lease ou tentativas de entrega. Portanto esta POC nao declara idempotencia distribuida, worker, retry ou lease para TCE/PNCP. O mecanismo de outbox com lease permanece exclusivo do SIAFIC DEMO e nao foi reutilizado para destinos oficiais.

## Convites de pesquisa de precos

O convite existente continua registrado como `PRICE_RESEARCH_INVITATION_PENDING_DELIVERY`. A acao **Lembretes internos** cria notificacoes no centro interno para usuarios autorizados de Compras e usa a auditoria ja existente de notificacoes.

Nao existe provedor SMTP configurado neste escopo. A interface e os registros nao afirmam envio, entrega ou leitura de e-mail pelo fornecedor; a entrega do link segue manual e deve ser registrada no canal autorizado.

## Limites de aceite

Os arquivos baixaveis sao manifestos JSON de POC com snapshot e metadados do leiaute declarado. Eles nao sao apresentados como arquivo oficial do Tribunal nem como payload PNCP compativel. CLC-038, CLC-040, CLC-048 e CLC-079 continuam dependentes do leiaute/contrato tecnico, credenciais e homologacao oficiais antes de qualquer aceite de integracao externa.
