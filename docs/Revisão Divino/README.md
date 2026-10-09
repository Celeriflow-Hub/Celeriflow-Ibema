# Implantacao do CeleriFlow em Ibema

Este pacote prepara um banco PostgreSQL/Neon vazio para a versao atual do
CeleriFlow Divino, sem copiar dados pessoais, dados operacionais, credenciais,
arquivos ou configuracoes municipais de Divino.

## Conteudo

1. `prisma/migrations-ibema/20261009232000_baseline/migration.sql`: todas as
   tabelas, enums, indices e chaves estrangeiras declaradas no
   `prisma/schema.prisma` atual. `001_full_schema.sql` preserva a copia de
   revisao que originou esse baseline.
2. `prisma/migrations-ibema/20261009232100_database_guards/migration.sql`:
   constraints, indices parciais, funcoes e triggers PostgreSQL que nao podem
   ser representados integralmente pelo Prisma.
3. `prisma/migrations-ibema/20261009232200_reference_data/migration.sql`:
   classes de documento e catalogo de modulos, sem dados de demonstracao.
4. `004_ibema_bootstrap.example.sql`: modelo comentado para cadastrar a
   prefeitura e a instancia de Ibema depois de informar CNPJ e dominio reais.
5. `validate-package.mjs`: aplica o pacote em PostgreSQL temporario local para
   validar o SQL sem acessar o Neon.
6. `register-legacy-migrations.ps1`: referencia da estrategia anterior. Nao e
   usado por Ibema porque o projeto agora possui migrations proprias completas.

As migrations sao executadas automaticamente nessa ordem pelo Prisma.

## Por que nao usar diretamente `prisma migrate deploy`

A migration `prisma/migrations/20260801000000_baseline/migration.sql` nao cria
tabelas. Ela apenas registra que o schema legado ja existia no banco de Divino.
As migrations seguintes dependem desse schema anterior e, por isso, nao formam
uma instalacao valida para um Neon novo.

O arquivo `001_full_schema.sql` foi gerado diretamente do schema Prisma atual:

```powershell
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script --output docs/Ibema/001_full_schema.sql
```

Ele representa o estado final atual. Nao execute depois dele as migrations
incrementais antigas, pois elas tentariam recriar tabelas e colunas.

## Modulos abrangidos

O baseline completo e intencional: os modulos compartilham muitas tabelas e
servicos. Recortar apenas algumas tabelas deixaria fluxos quebrados.

- Administracao e organograma
- Cadastros gerais
- Processos e protocolos
- GED, documentos e assinaturas
- Atendimento e ouvidoria
- Portal institucional e transparencia
- Tributacao, incluindo os blocos S1 a S10
- Financeiro, planejamento, contabilidade e tesouraria
- Compras, licitacoes e contratos
- RH, folha e Portal do Servidor
- Almoxarifado e patrimonio
- Frotas
- Educacao
- Saude, farmacia e Portal do Paciente
- Assistencia social
- Meio ambiente
- Saneamento
- Obras
- Cultura
- Camara
- Seguranca e mobilidade
- Configuracoes, auditoria e integracoes/SIAFIC

## Aplicacao no Neon

Use a URL sem pool para operacoes de schema e execute:

```powershell
npx prisma migrate deploy
npx prisma migrate status
```

O `004_ibema_bootstrap.example.sql` e um modelo. Preencha CNPJ, dominio,
endereco e demais dados reais antes de executar seus comandos.

O `prisma.config.ts` aponta para `prisma/migrations-ibema`. As 88 migrations
legadas permanecem no repositorio apenas para consulta e nao sao executadas em
Ibema. Nao use `register-legacy-migrations.ps1` neste projeto.

## Configuracao da aplicacao

Crie variaveis novas para Ibema. Nao reutilize tokens ou identificadores de
Divino.

Obrigatorias para o nucleo:

```text
DATABASE_URL=<URL pooled do Neon de Ibema>
DATABASE_URL_UNPOOLED=<URL direta do Neon de Ibema>
BLOB_READ_WRITE_TOKEN=<token do Blob de Ibema>
CELERIFLOW_INSTANCE_ID=ibema
CELERIFLOW_PUBLIC_BASE_URL=https://ibema.celeriflow.com.br
FIREBASE_PROJECT_ID=<projeto de Ibema>
FIREBASE_CLIENT_EMAIL=<service account de Ibema>
FIREBASE_PRIVATE_KEY=<chave de Ibema>
NEXT_PUBLIC_FIREBASE_API_KEY=<chave web de Ibema>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<auth domain de Ibema>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<projeto de Ibema>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<bucket de Ibema>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender de Ibema>
NEXT_PUBLIC_FIREBASE_APP_ID=<app id de Ibema>
SYSTEM_ADMIN_EMAIL=<email do administrador inicial>
SYSTEM_ADMIN_NAME=<nome do administrador inicial>
```

O Blob usa o prefixo `instances/{CELERIFLOW_INSTANCE_ID}/documents/...`.
Definir `CELERIFLOW_INSTANCE_ID=ibema` evita mistura de arquivos entre
municipios. O banco armazena URLs dos arquivos; nao copie URLs de Divino.

Variaveis adicionais devem ser configuradas somente para os recursos usados:

- Bancos/financeiro: `BANK_SANDBOX_*`, `BANK_SYNC_SECRET` e
  `CELERIFLOW_ACCOUNTING_MODE`.
- Tributacao: `NFSE_WEBSERVICE_TOKEN` e `DESIF_WEBSERVICE_TOKEN`.
- Compras: `PRICE_RESEARCH_PORTAL_SECRET`.
- Notificacoes: `CRON_SECRET` ou `PROTOCOLS_CRON_SECRET`.
- ICP-Brasil: `ICP_BRASIL_A1_*` e `ICP_BRASIL_TRUSTED_ROOT_CERT_PEM`.
- SIAFIC: `SIAFIC_*` e `APP_ENV`.

Nao habilite em producao as variaveis `NEXT_PUBLIC_POC_MODE`,
`CELERIFLOW_POC_RESET_ENABLED` ou `SIAFIC_DEMO_FIXTURES_ENABLED`.

## Bootstrap

1. Execute `npx prisma migrate deploy`.
2. Confirme o resultado com `npx prisma migrate status`.
3. Cadastre `Institution` e `ConfiguracaoInstancia` com dados reais de Ibema.
4. Configure um usuario no Firebase de Ibema.
5. Defina `SYSTEM_ADMIN_EMAIL` com o mesmo email.
6. Execute `npm run bootstrap:admin`.
7. Revise perfis, permissoes e modulos ativos antes de liberar usuarios.
8. Cadastre organograma, exercicio financeiro, unidades orcamentarias,
   parametros tributarios, unidades de saude e regras municipais de RH.

O catalogo em `003_reference_data.sql` registra os modulos como ativos para
espelhar o sistema atual. Desative no banco ou na tela de configuracoes tudo que
nao fizer parte do contrato de Ibema.

## O que nao deve ser copiado

- `.env` ou `.env.local` de Divino.
- `clean.sql`.
- Seeds POC, Taipas ou Lagoa Seca.
- Pessoas, servidores, contribuintes, pacientes ou alunos de demonstracao.
- Contas bancarias, saldos, empenhos, folhas ou dividas de demonstracao.
- A regra de folha `MUNICIPAL_DEMO_2026`; Ibema precisa de parametrizacao
  validada conforme sua legislacao.
- URLs ou objetos do Vercel Blob de Divino.

## Validacao recomendada

Depois da instalacao:

```powershell
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
npx prisma generate
npm run build
```

O pacote tambem pode ser validado localmente, sem alterar banco externo:

```powershell
node "docs/Revisão Divino/validate-package.mjs"
```

No primeiro comando, diferencas relativas apenas aos checks, indices parciais,
funcoes e triggers do arquivo `002_database_guards.sql` sao intencionais, pois
esses objetos nao sao todos representados pelo schema Prisma.

Valide tambem:

- login do administrador;
- leitura e gravacao em pelo menos um fluxo de cada modulo contratado;
- upload e download usando o Blob de Ibema;
- ausencia de referencias a Divino, Taipas ou Lagoa Seca no banco;
- triggers listadas em `pg_trigger` e funcoes listadas em `pg_proc`.

## Manutencao futura

Este pacote e um snapshot do `prisma/schema.prisma` no momento em que foi
gerado. Novas alteracoes do sistema devem ser aplicadas por novas migrations,
sem regenerar e reaplicar o baseline em um banco que ja contenha dados.
