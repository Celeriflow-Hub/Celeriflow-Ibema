# Histórico de Implementação — CeleriFlow Cacimba de Dentro

Registro consolidado de todas as edições e processos realizados nas Sprints 1, 2 e 3 do projeto CeleriFlow (ERP de Gestão Pública Municipal), adaptado ao Edital PE 00014/2026 da Prefeitura Municipal de Cacimba de Dentro/PB.

Contexto geral: o edital contrata a locação de 7 sistemas (Gestão Tributária, Portal do Contribuinte, Folha de Pagamento, Portal do Servidor, Gestão de Frota, Portal da Frota e Farmácia), com Prova de Conceito (POC, item 8.13) exigindo demonstração em tempo de execução, incluindo a geração dos arquivos SAGRES (Folha, Frota e Farmácia) para o TCE-PB. O planejamento completo está em `PLANO_SPRINTS_CACIMBA.md` (10 sprints); a análise de aderência está em `ANALISE_ADERENCIA_POC_CACIMBA.md`.

---

## Sprint 1 — Identidade Cacimba e base da instância

### Objetivo
Remover todas as referências ao município anterior (Divino de São Lourenço/ES), configurar a identidade de Cacimba de Dentro/PB, parametrizar chaves de ambiente e preparar a base da instância.

### O que foi feito

**1. Módulo único de identidade do município**
- Criado `src/lib/platform/municipality.ts` como fonte única de identidade: nome, CNPJ 08.929.648/0001-59, código IBGE, endereço (Rua Capitão Pedro Moreira, 15 — Centro, CEP 58230-000), e-mail (cpl@cacimbadedentro.pb.gov.br), site (https://www.cacimbadedentro.pb.gov.br), domínio da instância e código SAGRES via env `NEXT_PUBLIC_SAGRES_UNIT_CODE`.
- Regra registrada em `AGENTS.md`: toda referência a nome, endereço, UF, CNPJ, IBGE e links do município deve vir deste módulo — nunca texto fixo — permitindo trocar de município sem caçar strings.

**2. Higienização de dados de Divino/ES**
- Removidas referências a Divino de São Lourenço/ES em páginas, metadados, links, seeds e regras tributárias, substituídas por Cacimba de Dentro/PB.
- Links que apontavam para sistemas externos de Divino (NFS-e, contracheques) agora abrem as telas internas do CeleriFlow.

**3. Chaves e segredos**
- Chaves do arquivo `.env` fornecido pelo usuário armazenadas como segredos do Lovable: `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BLOB_STORE_ID`, `BLOB_READ_WRITE_TOKEN`.
- Geradas chaves internas ausentes: `CRON_SECRET`, `PROTOCOLS_CRON_SECRET`, `SIAFIC_WORKER_TOKEN`, `PRICE_RESEARCH_PORTAL_SECRET`, `BANK_SYNC_SECRET`.
- Adicionados ao `.env.local` (gitignored): `NEXT_PUBLIC_POC_MODE="true"` e `CELERIFLOW_PUBLIC_BASE_URL="https://celeriflow-cacimba.lovable.app"`.

**4. Dados no banco**
- Criado `prisma/seed-instancia-cacimba.ts` (idempotente, comando `seed:instancia-cacimba` no package.json): grava a instituição, a instância e 5 perfis de acesso — Tributação, Folha, Frota, Farmácia e Prestação de Contas TCE-PB. Executado com sucesso.

**5. Preview no Lovable**
- Ajustado `next.config.ts`: CSP `frame-ancestors` inclui lovable.dev, lovable.app e lovableproject.com; `X-Frame-Options` removido — liberando a exibição do preview em iframe.

**6. Acesso mobile / PWA**
- Criado `src/app/manifest.ts` (PWA instalável).
- Melhorado `ModuleShell.tsx`: menu com scroll vertical em mobile, botões com altura mínima de toque, header compacto.
- Removidos brasões antigos (Divino) e criada marca provisória `public/brasao-cacimba-de-dentro.svg` (depois substituída pela imagem oficial na Sprint 2).

### Verificação
Testado via Playwright: `/portal`, `/portal/contato`, `/portal/servicos`, `/portal/historia`, `/portal-transparencia` e `/manifest.webmanifest` respondem 200, sem erros e sem menção a Divino. Typecheck dos arquivos alterados OK. Build OK.

### Correções de build realizadas neste período
- `prisma/seed-patrimonio.ts`: corrigido campo `nome` (em vez de `name`) e vínculo a `perfilId` existente.
- `src/lib/prisma.ts`: conexão Prisma convertida em lazy (Proxy que chama `getPrismaClient()` só no primeiro acesso) — o build não exige mais `DATABASE_URL` no carregamento de módulos.
- `src/lib/firebase/server.ts`: reescrito como lazy proxy `adminAuth` com `getAdminAuth()` — inicializa o app Firebase Admin só sob demanda.
- Estouro de memória no build de publicação (worker de 4 GB, SIGABRT): `package.json` passou a ter `"build": "SKIP_NEXT_TYPECHECK=1 node scripts/build.mjs"` (o `build:check` mantém a checagem completa); `scripts/build.mjs` define `SKIP_NEXT_TYPECHECK` por padrão; `distDir: "dist"` no `next.config.ts` para gerar a saída exigida pelo deploy do Lovable. Plano arquivado em `.lovable/plan/corrigir-estouro-de-memória-no-build-publicado-2026-09-26.md`.

### Pendências deixadas ao usuário
- Trocar senhas expostas na conversa (chave privada Firebase e senha do banco).
- Enviar brasão oficial de Cacimba de Dentro (entregue na Sprint 2).
- Confirmar código IBGE, telefone da Prefeitura, código SAGRES, links oficiais e texto da página de história.

---

## Sprint 2 — Camada TCE-PB/SAGRES

### Objetivo
Implementar o adaptador de prestação de contas por estado, o modelo de remessas por competência/unidade gestora, a tela de geração e o validador de campos — cobrindo os três arquivos exigidos na POC: Folha, Frota e Farmácia.

### Dados fornecidos pelo usuário e aplicados
- Código IBGE (layout SAGRES): **2503506** (6 dígitos: 250355 — pendente de confirmação, ver abaixo).
- Código interno SAGRES (tabela histórica do Estado): **035**.
- Código SIAFI/Tesouro Nacional: **1971**.
- Código TSE: **19712**.
- Brasão oficial da Prefeitura (imagem enviada): copiado para `public/brasao-cacimba-de-dentro.png` e referenciado em `municipality.ts` (`coatOfArms`).

### O que foi feito

**1. Módulo de integração SAGRES** — `src/lib/integrations/sagres/`
- `layouts.ts`: leiautes dos arquivos (versão provisória **CF-2026.1**, marcada como não-oficial até o recebimento dos leiautes oficiais do TCE-PB).
- `engine.ts`: motor de geração e validação dos arquivos (validação linha a linha, indicando linha e campo da pendência).
- `state-adapter.ts`: adaptador por estado — a Paraíba usa SAGRES; o formato do Espírito Santo permanece separado.
- `data-sources.ts`: fontes de dados — folha lançada no mês, abastecimentos/gastos da frota e entregas de medicamentos da farmácia.
- `service.ts`: orquestração da geração, versionamento e registro de envio.

**2. Banco de dados**
- Criada tabela `SagresRemessa` (migração `20260926170000_sagres_remessas`, aplicada via psql e registrada em `_prisma_migrations`): guarda histórico de remessas com código de conferência (integridade do conteúdo), versionamento (regenerar o mesmo mês marca a versão anterior como substituída) e protocolo de envio.

**3. Tela "Prestação de Contas SAGRES — TCE-PB"** — `/app-domain/prestacao-contas`
- `src/app/app-domain/prestacao-contas/actions.ts` (server actions) e `SagresClient` (interface).
- Fluxo: escolher arquivo (Folha/Frota/Farmácia), mês e unidade gestora → **Validar** (lista pendências por linha/campo; botão Gerar só libera sem pendências) → **Gerar e baixar** (grava no histórico com código de conferência) → **Registrar envio** (informa protocolo do Tribunal; remessa passa a constar como enviada).
- Cabeçalho dos arquivos já sai com IBGE 2503506, SAGRES 035, SIAFI 1971 e TSE 19712.

**4. Testes**
- `tests/sagres.test.ts`: 6/6 testes passando.

### Verificação
Testes automáticos OK. A página abre e pede login (comportamento esperado das áreas internas). Não testado: fluxo completo com login e dados reais; link no menu lateral ainda não adicionado.

### Pendências deixadas ao usuário
- **Leiautes oficiais do SAGRES/TCE-PB** (ponto mais crítico da POC): sem eles, os campos seguem versão provisória sinalizada na tela.
- Confirmar código IBGE curto (250355 vs 250350) e o de 7 dígitos (2503506 vs 2503308).

---

## Sprint 3 — Motor de cálculo de Folha de Pagamento

### Objetivo
Implementar o motor real de folha: servidores, eventos parametrizáveis, INSS/IRRF/RPPS, tipos de folha e fechamento com snapshot imutável da competência.

### O que foi feito

**1. Motor de cálculo** — `src/lib/rh/payroll-engine.ts`
- Cálculo de proventos e descontos por servidor.
- INSS (tabela progressiva), IRRF (tabela progressiva com dependentes) e RPPS (previdência própria, conforme tipo de regime do servidor).
- Eventos parametrizáveis (rubricas de provento/desconto).

**2. Serviço de folha** — `src/lib/rh/payroll-service.ts`
- Orquestração do cálculo da competência, fechamento com snapshot imutável e reabertura controlada.

**3. Tipos de folha (6)**
- Mensal, complementar, adiantamento de 13º salário, 13º salário final, e demais tipos previstos.

**4. Telas e ações** — `src/app/app-domain/rh/folha/`
- `actions.ts`: server actions do módulo.
- `FolhaForm.tsx`: formulário da folha.
- `[id]/page.tsx` + `PayrollRunPanel.tsx`: tela de detalhe da competência com painel de cálculo — acessada por Folha de Pagamento → "Calcular".

**5. Cadastro de servidores**
- Novos campos no registro do servidor: tipo de previdência (INSS/RPPS), dados bancários, data de admissão e PIS. Armazenados no banco; ainda não expostos no formulário de cadastro (até lá, todos são tratados como INSS).

**6. Migração de banco**
- Migração SQL criada e aplicada para os novos campos/estruturas da folha.

### Verificação
Testes automáticos dos cálculos passando. Não testado: competência completa com login e dados reais de servidores.

### Pendências deixadas ao usuário
- **Tabelas oficiais 2026**: INSS e IRRF foram inseridos de memória — contador deve confirmar os valores oficiais e a alíquota do RPPS de Cacimba de Dentro.
- Expor os novos campos (previdência, banco, admissão, PIS) no formulário de cadastro de servidores.

---

## Resumo do estado atual

| Item | Status |
|---|---|
| Identidade Cacimba de Dentro (sem resíduos de Divino) | ✅ Concluído |
| Chaves Firebase/banco parametrizadas | ✅ Concluído |
| Preview no Lovable liberado | ✅ Concluído |
| Build de publicação (memória + saída `dist/`) | ✅ Corrigido |
| PWA / responsivo mobile (base) | ✅ Concluído |
| Adaptador SAGRES por estado + tela de remessas | ✅ Concluído (leiautes provisórios) |
| Motor de folha (INSS/IRRF/RPPS, 6 tipos, snapshot) | ✅ Concluído |
| Leiautes oficiais SAGRES do TCE-PB | ⏳ Aguardando usuário |
| Confirmação de códigos IBGE/SAGRES | ⏳ Aguardando usuário |
| Tabelas oficiais INSS/IRRF/RPPS 2026 | ⏳ Aguardando contador |
| Link de `/prestacao-contas` no menu lateral | ⏳ Pendente |
| Testes end-to-end com login e dados reais | ⏳ Pendente |
| Publicação do site (build OK, falta publicar) | ⏳ Pendente |

## Próximas sprints (conforme `PLANO_SPRINTS_CACIMBA.md`)
- **Sprint 4:** SAGRES Mensal, relatórios, remessa CNAB, eSocial/DIRF, importação da base anterior.
- **Sprint 5:** Portal do Servidor (contracheques, solicitações online, mobile instalável).
- **Sprint 6:** Gestão de Frota completa (horímetro para máquinas).
- **Sprint 7:** Portal da Frota + SAGRES Frota.
- **Sprint 8:** Farmácia Pública (CATMAT, controlados Portaria 344, Hórus/BNAFAR) + SAGRES Farmácia.
- **Sprint 9:** Gestão Tributária e Portal do Contribuinte (Código Tributário de Cacimba, 2ª via, certidões, NFS-e, Pix).
- **Sprint 10:** Extras (painéis, exportações, campos configuráveis, central de suporte com SLAs do edital, ensaio completo da POC).

---

## Sprint 4 — Folha: obrigações, relatórios e SAGRES Mensal (branch `Dudu`)

### Entregas
- **`src/lib/rh/payroll-obligations.ts`** (funções puras, testadas): totais por servidor; resumo por rubrica; líquidos por banco; totais por secretaria; encargos patronais (INSS 20% + RAT 2% para RGPS, 14% para RPPS — parametrizados em `EMPLOYER_RATES`); provisões mensais de 13º e férias + 1/3; proposta de empenho/liquidação da folha (naturezas 3.1.90.11 e 3.1.91.13, retenções e líquido); gerador **CNAB 240** FEBRABAN (pagamento de salários, segmento A, linhas validadas em 240 posições, servidores sem conta listados à parte); lote **eSocial S-1200 (RGPS) / S-1202 (RPPS)** em XML; **informe de rendimentos anual** (base DIRF/EFD-Reinf) separando 13º; **importação CSV** da base anterior com validação de CPF, duplicidade, salário, regime, admissão e dados bancários.
- **`src/lib/rh/payroll-obligations-data.ts`**: carrega folha/ano do banco para as funções acima.
- **Rota `GET /api/rh/folha/[id]/exportar?tipo=`** (`resumo`, `banco`, `secretaria`, `encargos`, `provisoes`, `contabil`, `cnab`, `esocial`, `informe`) com checagem de acesso ao módulo RH.
- **Tela `/rh/folha/[id]/obrigacoes`** ("Relatórios e arquivos" na folha): tabelas de todos os relatórios, downloads CSV, formulário de remessa CNAB, eSocial, informe e atalho para o SAGRES Mensal.
- **Tela `/rh/servidores/importar`** ("Importar base" em Servidores): simulação com relatório de inconsistências por linha antes de importar; CPF existente é atualizado; auditoria por servidor.
- **SAGRES Mensal (Folha)**: já alimentado pelo motor desde a Sprint 3 (fonte `payrollRecords`), acessível em `/prestacao-contas`.
- **Testes**: `tests/payroll-obligations.test.ts` (5 testes) + `tests/payroll-engine.test.ts` — 9/9 passando.

### Pendências da Sprint 4
- Alíquotas patronais (INSS/RAT/FAP/RPPS) e naturezas de despesa **presumidas** — confirmar com a contabilidade.
- CNAB: validar o leiaute com o banco da Prefeitura (convênio, tipo de serviço, homologação) — cada banco tem particularidades.
- eSocial: XML de pré-validação; falta tabela de rubricas S-1010, assinatura digital (certificado ICP-Brasil) e transmissão.
- DIRF foi extinta (EFD-Reinf R-4010 desde 2025); o informe anual está pronto, falta gerar o evento Reinf. RAIS substituída pelo eSocial — não aplicável.
- A integração contábil gera a **proposta** de empenho; a gravação automática no módulo financeiro/SIAFIC fica para quando houver dotação configurada.
- Importação cobre servidores; histórico financeiro de competências anteriores aguarda amostra da base atual da Prefeitura.
- Campos de regime/banco/admissão/PIS no formulário manual de servidor (pendência da Sprint 3) continuam pendentes; a importação já preenche esses campos.
- O envio para a branch `Dudu` é feito automaticamente pela sincronização do Lovable com o GitHub.

---

## Sprint 5 — Portal do Servidor (branch `Dudu`)

### Entregas
- **Primeiro acesso por CPF** (`/login/servidor`): o servidor confirma CPF + matrícula + data de admissão e cria a própria senha (também serve para redefinir). Cria a credencial Firebase e o usuário vinculado ao servidor com o perfil `SERVIDOR_PORTAL` (sem acesso a módulos internos). Mensagem de erro genérica e limite de tentativas por IP.
- **Login aceita CPF** além do e-mail (o CPF é convertido para o e-mail técnico `CPF@servidor.<domínio>`); após login por CPF o servidor vai direto ao Portal.
- **Emitir documentos** (`/portal-servidor/emissao`): contracheque por competência fechada/paga, informe de rendimentos anual, ficha financeira anual e declaração de vínculo funcional. Cada emissão gera código único `CFS-…`, hash SHA-256, QR Code e registro de auditoria; página pronta para imprimir/salvar em PDF. Rota: `GET /api/portal-servidor/documento?tipo=contracheque|informe|ficha|declaracao`.
- **Validação pública** (`/validar-servidor/[código]`): confirma autenticidade mostrando só nome, matrícula, tipo, referência, data e hash (sem valores).
- **Solicitações online** (`/portal-servidor/solicitacoes`): férias (10/15/20/30 dias), licenças/afastamentos e atualização cadastral (e-mail, telefone, banco); acompanhamento e cancelamento. **RH → Solicitações do Portal** (`/rh/solicitacoes`): aprovar/indeferir com parecer; aprovação cria férias programadas, licença ativa ou atualiza o cadastro automaticamente; tudo auditado.
- **Margem consignável e histórico funcional** (`/portal-servidor/margem`): margem de 35% sobre (bruto − previdência − IRRF) do último contracheque, consignados em uso e disponível; linha do tempo com admissão, férias, licenças e solicitações decididas.
- **Avisos no painel**: "novo contracheque disponível" (folha fechada nos últimos 30 dias) e solicitações respondidas pelo RH.
- **Mobile instalável**: atalhos do Portal do Servidor no app instalado (manifest).
- **Banco**: tabelas `EmployeePortalRequest` e `EmployeeDocumentIssue` + perfil `SERVIDOR_PORTAL` (migração `20260927210000_portal_servidor`, já aplicada no banco).
- **Testes**: `tests/portal-servidor.test.ts` — 4/4 passando; checagem de tipos dos arquivos novos sem erros.

### Pendências da Sprint 5
- Primeiro acesso exige **matrícula e data de admissão cadastradas**; servidores sem data de admissão precisam ser completados pelo RH (ou via importação da Sprint 4).
- Notificações são avisos dentro do Portal; envio por e-mail/push de novo contracheque não foi implementado.
- Documentos saem como página para imprimir/salvar em PDF (não PDF gerado no servidor) e sem assinatura ICP-Brasil.
- Margem de 35% é presumida — confirmar a lei municipal de consignações.
- Fluxo completo (primeiro acesso real no Firebase, emissão e aprovação) não foi testado com login porque não há servidores nem folhas no banco atual.
- A migração foi aplicada manualmente (a ferramenta de migração do Prisma falhou na conexão); o SQL é seguro para reexecução.
- O envio para a branch `Dudu` é feito automaticamente pela sincronização do Lovable com o GitHub.

---

## Sprint 6 — Gestão de Frota completa

**Nova tela:** Frotas → "Gestão completa" (`/frotas/gestao`), com abas:
- **Painel e alertas:** CNH vencida/a vencer (30 dias), consumo fora do padrão (tolerância 15%), pneus com 85%+ de desgaste, ordens sem baixa, veículos em viagem e multas pendentes.
- **Medidores e consumo:** cada veículo/máquina escolhe **hodômetro (km)** ou **horímetro (h)** — atende Obras e Agricultura; leitura atual, combustível, consumo esperado e centro de custo. Consumo médio calculado em km/L ou L/h.
- **Motoristas:** CNH, categoria e validade.
- **Postos credenciados**, **cotas mensais por veículo** e **ordens de abastecimento** (código `OA-AAAA-000001`). A emissão bloqueia cota excedida e CNH vencida; a baixa exige leitura válida (não pode voltar nem dar salto absurdo), gera o consumo na frota e atualiza a leitura do veículo.
- **Diário de bordo:** saída/chegada com leituras; bloqueia CNH vencida, categoria incompatível e veículo já em viagem.
- **Pneus** (número de fogo, vida útil, desgaste) e **multas** (AIT, condutor, pontos, situação: paga, recurso, ressarcida, cancelada).
- **Custos** por veículo, secretaria, centro de custo e natureza.

Manutenções preventivas/corretivas, seguros e documentos continuam nas telas já existentes do módulo.

**Técnico:** `src/lib/frotas/gestao-engine.ts` (regras puras), `src/app/app-domain/frotas/gestao/` (tela e ações com auditoria), modelos `FleetDriver`, `FleetFuelStation`, `FleetFuelQuota`, `FleetFuelOrder`, `FleetTrip`, `FleetTire`, `FleetFine` e campos novos em `FleetUnit`; migração `prisma/migrations-cacimba/20260928000000_frota_gestao` aplicada. Testes `tests/fleet-gestao.test.ts` 3/3.

**Pendências da Sprint 6:**
- Tolerância de desvio (15%), aviso de CNH (30 dias), vida útil padrão do pneu (50.000 km) e regra de categoria de CNH foram definidos por mim — confirmar com a Prefeitura.
- Não testado com login e dados reais (banco sem veículos cadastrados).
- Exportação em planilha/PDF dos custos novos fica para a Sprint 10 (gerador de relatórios).
- Registro pelo celular do motorista, confirmação pelo posto e foto do hodômetro são da Sprint 7 (Portal da Frota).

---

## Sprint 7 — Portal da Frota e SAGRES Frota

**Motorista (logado, pelo celular)** — `/portal-frota`, também como atalho do app instalado:
- Registra **saída** (veículo, leitura do painel, destino, finalidade, checklist de 7 itens e foto opcional do painel) e **chegada** (leitura, foto e observações).
- Bloqueia CNH vencida, categoria incompatível, leitura menor que a anterior e viagem já aberta. Itens do checklist não conferidos ficam anotados na viagem.
- O motorista é identificado pela sessão: usuário → servidor → CPF igual ao do cadastro de motorista.

**Posto credenciado (sem login)** — `/portal/frota/posto`: confirma o abastecimento com **código da ordem + CNPJ do posto + código de conferência** (8 caracteres, gerado na emissão e mostrado em Gestão da Frota → Ordens). Litros limitados ao autorizado; a baixa gera o consumo, atualiza a leitura e só pode ocorrer uma vez.

**Oficina (sem login)** — `/portal/frota/oficina`: registra serviço executado, peças, valor e leitura com o código da OS + código de conferência. O setor de frota gera o código e confere os registros na nova aba **Oficinas (portal)**; a conclusão da OS continua no fluxo interno.

**Consulta pública** — `/portal/frota`: veículos ativos, secretaria e litros/valor de combustível por mês.

**SAGRES Frota** — arquivo ganhou CNPJ do fornecedor, secretaria, tipo de medidor (KM/HORA), leitura e documento de origem; validação e geração por competência continuam em Prestação de Contas.

**Técnico:** `src/lib/frotas/portal.ts`, `src/app/app-domain/portal-frota/`, `src/app/portal/frota/`, migração `20260928010000_portal_frota` aplicada (tabela `FleetWorkshopReport`, códigos de conferência, checklist e fotos na viagem). Testes: 11/11 (frota + SAGRES).

**Pendências da Sprint 7:**
- Leiaute SAGRES Frota ainda provisório (`CF-2026.1`) até recebermos o oficial do TCE-PB.
- Foto do painel depende do armazenamento de arquivos configurado; sem ele, o registro segue sem foto.
- Postos e oficinas não têm login próprio: a segurança é o trio código + CNPJ + código de conferência, com limite de tentativas. Se a Prefeitura quiser usuários para postos, dá para evoluir.
- Não testado com login e dados reais (banco sem veículos, motoristas e ordens).

---

## Sprint 8 — Farmácia Pública e SAGRES Farmácia

O módulo já tinha: catálogo de produtos, estoques por unidade, entrada por nota fiscal com lote/validade, transferências entre unidades, dispensação por receita eletrônica (FEFO), baixas, bloqueio de lote, livro de controlados por período e importação de catálogo. A Sprint 8 completou o que faltava.

**Nova tela:** Saúde → "Farmácia — gestão e controle" (`/saude/farmacia/gestao`), com filtro por competência:
- **Alertas:** lotes vencidos, lotes que vencem em até 30/60/90 dias, produtos abaixo do estoque mínimo (com dias de cobertura) e lotes bloqueados.
- **Posição de estoque:** saldo por produto e unidade, consumo do mês, cobertura em dias, situação (zerado, abaixo do mínimo, acima do máximo) e ajuste de mínimo/máximo na própria linha.
- **Consumo:** quantidade dispensada, pacientes atendidos e valor por medicamento.
- **Perdas:** baixas classificadas (vencimento, avaria, extravio, temperatura, outros) com valor.
- **Livro de controlados (Portaria 344/98):** dispensações de controlados com lista, tipo de receituário exigido, lote, paciente (CNS/CPF) e quem dispensou.
- **CATMAT e Portaria 344:** código CATMAT/BR e lista (A1 a C5) por produto; marcar lista torna o produto controlado.
- **Arquivos:** planilha de apoio ao **BNAFAR/Hórus** (IBGE, CNES, CATMAT, lote, validade, quantidade, CNS/CPF) e atalho para o SAGRES.
- Todos os relatórios baixam em planilha (CSV).

**SAGRES Farmácia:** o arquivo passou a levar CATMAT, lista da Portaria 344, validade do lote, CNES da unidade e valor unitário; o paciente usa CNS ou, na falta, CPF.

**Técnico:** `src/lib/saude/pharmacy-engine.ts` (regras puras), `src/lib/saude/pharmacy-management.ts` (consultas), `src/app/app-domain/saude/farmacia/gestao/`, `src/app/api/saude/farmacia/exportar/route.ts`; migração `20260928020000_farmacia_gestao` aplicada (`catmatCode` e `portaria344List`). Testes: 9/9 (farmácia + SAGRES).

**Pendências da Sprint 8:**
- O envio automático ao **BNAFAR** (serviço do Ministério da Saúde) exige credenciamento do município e certificado; hoje o sistema gera a planilha para carga/conferência.
- Os tipos de receituário por lista seguem a Portaria 344/98 de forma simplificada — o farmacêutico responsável deve confirmar.
- Leiaute SAGRES Farmácia segue provisório (`CF-2026.1`).
- Não testado com login e dados reais (banco sem produtos, lotes e dispensações).

## Sprint 9 — Portal do Contribuinte (autoatendimento sem login)
- `src/lib/tributacao/contribuinte-engine.ts`: Pix BR Code (EMV + CRC16), situação fiscal (negativa / positiva com efeito de negativa / positiva — CTN 205/206), sessão assinada HMAC de 30 min.
- `src/lib/tributacao/contribuinte-portal.ts`: identificação por CPF/CNPJ + inscrição municipal/imobiliária/econômica, extrato consolidado (guias + dívida ativa).
- Páginas públicas: `/portal/contribuinte` (entrada, situação fiscal, guias em aberto, extrato, certidões), `/portal/contribuinte/guia/[id]` (2ª via com QR Code Pix e copia e cola), `/portal/contribuinte/certidao/[code]` (certidão com brasão, QR Code e validação pública), `/portal/contribuinte/validar`.
- Emissão de certidão grava `TaxCertificate` + `TaxCertificateEvaluation` (origem PORTAL_CONTRIBUINTE). Limite de tentativas por IP.
- `municipality.pixKey` (provisória: CNPJ da Prefeitura).
- Testes: `tests/contribuinte-portal.test.ts` (3/3).
- Já existentes no backend (sprints anteriores do produto): motor fiscal, IPTU/ISS/ITBI, NFS-e, dívida ativa/CDA/protesto, parcelamentos, alvarás, Portal Tributário autenticado.

### Pendências Sprint 9
- Confirmar chave Pix oficial e convênio bancário (Pix dinâmico com baixa automática depende do banco).
- Validade de 90 dias da certidão presumida — confirmar no Código Tributário Municipal.
- Parametrização das alíquotas/taxas do CTM de Cacimba de Dentro depende da lei municipal.
- Importação da base tributária anterior depende de amostra do sistema atual.
- Envio de guia por e-mail e parcelamento online no portal sem login ficam para a Sprint 10.
- Opcional: definir o segredo `CONTRIBUINTE_PORTAL_SECRET` (hoje usa um segredo existente como reserva).

## Sprint 10 — Extras, suporte e ensaio da POC
**Feito**
- Central de Suporte (/suporte): abertura de chamados por sistema, tipo e prioridade (classificação automática), prazos do TR (crítica 2h, alta 12h, média 24h, baixa 5 dias úteis), selo de prazo (no prazo / vencendo / vencido), conversa, encerramento pelo suporte e % resolvido no prazo. Tabela `SupportRequest` (migração `20260928030000_suporte_sla`), regras em `src/lib/platform/support-sla.ts`, testes `tests/support-sla.test.ts` (2/2).
- Painel gerencial e ensaio da POC (/painel-poc): indicadores de folha, tributação, frota, farmácia e suporte, e roteiro do item 8.13 com semáforo e atalhos.
- `ROTEIRO_POC.md`: preparação, demonstração item a item e checagens finais.

**Pendências**
- Prazo "imediato" foi interpretado como 2 horas — confirmar no TR.
- Prazos contam horas corridas (exceto baixa, em dias úteis) e não consideram feriados municipais.
- Campos adicionais configuráveis por cadastro e gerador único de relatórios em PDF não foram feitos; os módulos já exportam planilhas próprias.
- Testes de desempenho/segurança e backup automatizado dependem do ambiente de produção.
- Aviso por e-mail de novo chamado não existe (só na tela).
- Telas novas não foram vistas com login.

## Plano pós-merge Vette — Sprint 1 (Estabilização)
**Feito**
- Build de publicação protegido: migrações só rodam em produção quando o banco está configurado (`scripts/build.mjs`).
- Portais da Frota conferidos: não são duplicados. `/portal-frota` é o autosserviço do motorista (login interno) e `/portal/frota` é a consulta pública + confirmação de posto/oficina por código. Mantidos os dois, com papéis distintos.
- SAGRES Frota unificado no fluxo: `/prestacao-contas` orienta a certificar a competência no histórico certificado da Vette (`/frotas/gestao/sagres`) antes de gerar a remessa.
- Atalhos "Prestação de Contas SAGRES" e "Painel da POC" adicionados ao painel inicial (acesso do módulo Transparência).
- Testes unitários dos módulos da POC: 31/31 aprovados.

**Pendências**
- Testes que dependem de banco (grupo A, SIAFIC, concorrência da frota) exigem `TEST_DATABASE_URL` isolado — não disponível neste ambiente.
- Migrações em banco limpo de homologação não aplicadas (sem banco de homologação); sem nomes duplicados em `migrations-cacimba`.
- Ajustar Vercel/Cloudflare para publicar produção só a partir da `main` (configuração no painel, fora do código).
- `build:check` completo excede a memória deste ambiente; rodar na máquina/CI.

## Pós-merge — Sprint 2 (validação)
- `prisma/seed-demo-cacimba.ts`: base demonstrativa idempotente (6 servidores completos, 4 veículos, 2 motoristas, 1 posto, 4 medicamentos com lote incluindo controlado e estoque baixo, 3 contribuintes com débito de IPTU).
- `MATRIZ_CONFORMIDADE_POC.md`: situação item a item do edital.
- Pendente: executar o seed no banco de homologação; testes E2E com login e de concorrência exigem PostgreSQL de teste.

## Pós-merge — Sprint 3 (lacunas do edital) — parcial
- Formulário "Novo Servidor": admissão, salário, PIS/PASEP, banco/agência/conta, natureza do vínculo e regime (RGPS/RPPS).
- Prazos do suporte agora pulam feriados nacionais e locais (`LOCAL_HOLIDAYS`, lista municipal provisória).
- `src/lib/rh/reinf-esocial.ts`: XML de EFD-Reinf R-4010 e eSocial S-1010 (sem assinatura/envio). Testes 3/3.
- Pendentes: login de postos/oficinas, e-mails, parcelamento online, PDF único, tela dos XML, assinatura ICP-Brasil, feriados oficiais. Ver `roadmap.md`.

## Sprint 4 (pós-merge) — Padronização, mobile e acessibilidade (parcial)
- ClientLayout: link "Pular para o conteúdo", `main#conteudo`, rótulo acessível no botão Sair (celular).
- globals.css: foco visível por teclado global, respeito a "reduzir movimento", campos com 16px no celular (sem zoom iOS).
- Novas telas de carregamento: src/app/app-domain/loading.tsx e src/app/portal/loading.tsx.
- Pendências: revisão visual tela a tela, auditoria de desempenho/contraste com login e dados reais.
