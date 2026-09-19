# CeleriFlow SIAFIC DEMO - Operacao REV01

## Finalidade

Esta entrega demonstra interoperabilidade controlada entre o CeleriFlow e um receptor externo independente. O protocolo e `ROBONUVEM-SIAFIC-DEMO` versao `1.0`, usa somente registros sinteticos e nao representa homologacao, conectividade ou validade perante um SIAFIC oficial, PNCP, Tribunal de Contas ou ente publico.

O recorte funcional cobre fornecedor e contrato. Nao cria empenho, liquidacao, pagamento, escrituracao contabil, publicacao oficial ou transmissao a qualquer ambiente governamental real.

## Arquitetura

1. A origem grava fornecedor ou contrato e o snapshot imutavel no mesmo commit.
2. `SiaficOutboxEvent`, `SiaficDelivery` e `SiaficDeliveryAttempt` preservam versao, hash, idempotencia, lease e tentativas.
3. O worker envia eventos ao receptor somente apos o commit da origem.
4. O receptor independente persiste entidade, versao e recibo em PGlite.
5. A origem valida o recibo, grava `SiaficExternalLink` e reconcilia hashes e versoes.

O contrato depende da confirmacao do fornecedor. Uma falha ou resposta incerta consulta primeiro o recibo pelo `eventId`; o mesmo evento nao e recriado para reenviar.

## Protecoes

- O adaptador exige `APP_ENV=DEMO`, `SIAFIC_PROVIDER=robonuvem_demo` e `SIAFIC_ENABLED=true`.
- `APP_ENV=PRODUCAO` bloqueia o adaptador.
- A URL do receptor precisa coincidir com a configuracao do servidor e pertencer a `SIAFIC_ALLOWED_HOSTS`.
- HTTPS e obrigatorio, exceto HTTP loopback no ambiente DEMO.
- Token, senha, certificado e chave nao sao persistidos em `IntegrationConnection`; apenas `env:SIAFIC_API_TOKEN` e aceita como referencia.
- O token do worker e separado do token do receptor.
- O receptor valida Bearer token, instancia de origem e dataset antes de gravar dados.
- Eventos transportam somente dados sinteticos classificados como `SYNTHETIC_DEMO`.

## Pre-requisitos

1. Aplicar as migrations no banco DEMO autorizado. Nao use banco compartilhado ou de producao.

```powershell
npx prisma migrate deploy
```

2. Configurar estas variaveis na origem, sem inserir valores de segredos em arquivos versionados:

```text
APP_ENV=DEMO
SIAFIC_ENABLED=true
SIAFIC_PROVIDER=robonuvem_demo
SIAFIC_SOURCE_INSTANCE_ID=CELERIFLOW-DEMO-01
SIAFIC_DATASET_ID=SIAFIC-POC-2026-RUN-001
SIAFIC_RECEIVER_BASE_URL=http://127.0.0.1:4010
SIAFIC_ALLOWED_HOSTS=127.0.0.1
SIAFIC_API_TOKEN=<token-exclusivo-do-receptor-demo>
SIAFIC_WORKER_TOKEN=<token-diferente-do-receptor>
SIAFIC_DEMO_FIXTURES_ENABLED=true
```

`SIAFIC_DATASET_ID` precisa iniciar com `SIAFIC-POC-` para executar a massa sintetica. O token nao deve aparecer em telas, logs, commits ou capturas de evidencia.

3. Instalar e iniciar o receptor em processo separado:

```powershell
Set-Location tools/siafic-demo-receiver
npm install
$env:APP_ENV = "DEMO"
$env:SIAFIC_RECEIVER_ID = "ROBONUVEM-SIAFIC-RECEIVER-DEMO-01"
$env:SIAFIC_ALLOWED_SOURCE_INSTANCE = "CELERIFLOW-DEMO-01"
$env:SIAFIC_ALLOWED_DATASET = "SIAFIC-POC-2026-RUN-001"
$env:SIAFIC_CLIENT_TOKEN_HASH = "sha256:<hash-do-SIAFIC_API_TOKEN>"
$env:SIAFIC_RECEIVER_DATABASE_PATH = ".\\data"
npm run start
```

O receptor inicia vazio. Nao compartilha banco, Firebase, sessao ou segredo com a origem.

## Roteiro Reproduzivel

Execute os comandos na raiz do CeleriFlow, em outro terminal do receptor:

```powershell
npm run siafic:validate-config
npm run siafic:prepare-demo -- --dispatch
npm run siafic:reconcile
```

`prepare-demo` e opt-in: exige `SIAFIC_DEMO_FIXTURES_ENABLED=true`, valida o receptor antes de ativar a conexao e cria/atualiza somente fixtures com marcador `SIAFIC-POC-2026`. A carga e idempotente e cria duas unidades gestoras, quatro fornecedores sinteticos e cinco contratos sinteticos.

Sem `--dispatch`, o comando apenas enfileira a baseline. Para processar de forma continua, inicie o ERP e configure:

```text
SIAFIC_WORKER_URL=http://127.0.0.1:3000/api/integracoes/siafic/process
SIAFIC_WORKER_INTERVAL_MS=2000
```

Depois execute:

```powershell
npm run siafic:worker
```

Use `npm run siafic:prepare-demo -- --requeue --dispatch` somente para gerar nova versao de baseline deliberadamente. Esse comando nao apaga eventos, recibos ou vinculos anteriores.

## Verificacao Automatizada

```powershell
npm run test:siafic
npm run test:siafic:e2e
Set-Location tools/siafic-demo-receiver; npm run check
```

- `test:siafic` aplica a migration incremental em PGlite, testa outbox transacional, snapshot de fornecedor, snapshot de contrato e rollback atomico.
- `test:siafic:e2e` inicia o receptor como processo separado e cobre autenticacao, idempotencia, dependencia fornecedor-contrato, falha antes do commit e falha apos o commit.

## Operacao e Limites

- A configuracao central testa o receptor antes de marcar a conexao como `ATIVA`.
- O endpoint autenticado do worker e `/api/integracoes/siafic/process`.
- A reconciliacao compara somente links confirmados da origem com o inventario do receptor.
- Retentativas de negocio devem ser feitas pelo worker; nao altere payload, hash ou chave de idempotencia manualmente.
- O Console Tecnico de Integracoes exibe os ultimos oito eventos SIAFIC, status, tentativa, recibo e erro. O botao de reenfileirar e auditado e nunca altera snapshot, hash ou idempotencia.
- Falhas injetadas no receptor sao exclusivas de DEMO, exigem escopo por dataset ou evento e devem ser habilitadas apenas para roteiro de teste.

## Evidencias

Registre por execucao: dataset, instante, versao da aplicacao, hash/ID do evento sem segredos, status da entrega, recibo, URL mascarada do receptor e resultado da reconciliacao. A matriz de rastreabilidade esta em `CeleriFlow_POC_Compras_Licitacoes_Contratos_Matriz_REV01.md`.
