# Receptor SIAFIC - Robonuvem DEMO

Aplicacao independente de laboratorio para receber eventos do CeleriFlow. Ela persiste apenas cadastros e instrumentos recebidos; nao executa empenho, liquidacao, pagamento ou escrituração contabil.

## Local

Instale as dependencias dentro desta pasta e inicie em outra porta do ERP:

```powershell
npm install
$env:APP_ENV = "DEMO"
$env:SIAFIC_RECEIVER_ID = "ROBONUVEM-SIAFIC-RECEIVER-DEMO-01"
$env:SIAFIC_ALLOWED_SOURCE_INSTANCE = "CELERIFLOW-DEMO-01"
$env:SIAFIC_ALLOWED_DATASET = "SIAFIC-POC-2026-RUN-001"
$env:SIAFIC_CLIENT_TOKEN_HASH = "sha256:<hash-do-token-do-erp>"
$env:SIAFIC_RECEIVER_DATABASE_PATH = ".\\data"
npm run start
```

O painel autenticado esta em `/dashboard`; informe o mesmo token da integracao no formulario local ou use Bearer em um cliente HTTP. A sessao do painel e HTTP-only, fica somente na memoria do processo e expira em oito horas. A API usa `/api/demo/v1/*` e nunca deve receber o banco, Firebase ou segredos do CeleriFlow.

As mesmas variaveis podem ficar em `.env.local` nesta pasta; o receptor a carrega antes de `.env`. O diretorio local de dados tambem e ignorado pelo Git.

`SIAFIC_FAULT_INJECTION_ENABLED=true` com `SIAFIC_FAULT_SCENARIO=FAIL_BEFORE_COMMIT_ONCE` ou `FAIL_AFTER_COMMIT_ONCE` habilita falhas controladas locais para os testes da POC. Informe tambem `SIAFIC_FAULT_DATASET_ID` igual ao dataset autorizado ou um `SIAFIC_FAULT_EVENT_ID` UUID; a falha nunca e aplicada fora desse escopo.
