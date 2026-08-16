# Análise do Sistema Atual - CeleriFlow

**Data da análise:** 16 de agosto de 2026  
**Versão identificada:** `1.235.0`  
**Base da análise:** código-fonte, esquema Prisma, scripts, configuração de CI e testes versionados no repositório.

## 1. Resumo executivo

O CeleriFlow é uma plataforma web de gestão pública municipal. A solução reúne os fluxos administrativos, financeiros, operacionais e de atendimento ao cidadão em uma única aplicação, com controle de acesso por perfil, módulo, departamento e, nas operações financeiras, unidade gestora.

O sistema possui um núcleo funcional consistente para administração, protocolo, documentos, transparência, financeiro, patrimônio, atendimento e parametrização. Também contempla módulos setoriais para educação, saúde, assistência social, saneamento, obras, meio ambiente, cultura, Câmara e segurança. A arquitetura já inclui autenticação, auditoria, armazenamento privado de documentos e banco de dados relacional.

As integrações externas devem ser lidas com distinção importante: existe um catálogo amplo e uma integração concreta de POC com o Banco Virtual Robonuvem; para os demais conectores governamentais, fiscais, bancários e de comunicação, o código informa que o adaptador de produção ainda precisa ser homologado. Portanto, a existência de uma opção na tela de integrações não comprova uma conexão produtiva ativa.

Foram identificados **14 arquivos de teste** e **66 casos `test(...)`**. A maior cobertura está nos domínios financeiro, patrimônio, transparência, permissões e auditoria. Não há testes de navegador, de componentes React, de acessibilidade automatizada, de carga ou medição de cobertura.

## 2. Arquitetura e componentes técnicos

| Camada | Implementação identificada | Finalidade |
| --- | --- | --- |
| Aplicação web | Next.js 16.2.12, React 19.2.4 e TypeScript | Páginas server/client, rotas API e Server Actions. |
| Interface | Tailwind CSS, Base UI, componentes próprios e Lucide | Design responsivo, formulários, diálogos, tabelas e navegação. |
| Dados | PostgreSQL via Neon e Prisma 7.9.1 | Modelo relacional, transações, regras de domínio e migrations. |
| Autenticação | Firebase Authentication e Firebase Admin | Login por e-mail/senha, recuperação de senha, validação de token e sessão. |
| Sessão | Cookie HTTP-only `celeriflow_session` | Sessão de cinco dias, `SameSite=lax` e proteção inicial de rotas. |
| Arquivos | Vercel Blob | Armazenamento privado de anexos, documentos, relatórios e extratos. |
| Validação | Zod e React Hook Form | Validação de entrada e gestão de formulários. |
| Documentos | `docx`, Mammoth e PDFKit | Geração e tratamento de documentos DOCX e PDF. |
| Auditoria | Eventos internos append-only e rastreador de uso | Rastreabilidade de operações, consultas, interações e exportações. |
| Entrega | Vercel/Next e GitHub Actions | Build, validação Prisma, testes e auditoria de dependências no CI. |

### Organização de rotas

As páginas autenticadas estão internamente em `src/app/app-domain`. O arquivo `src/proxy.ts` protege a navegação no subdomínio `app.celeriflow.com.br`, redireciona usuários sem sessão para `/login` e reescreve, por exemplo, `/dashboard` para `/app-domain/dashboard`. A pasta interna não é exposta diretamente por URL.

O Portal da Transparência e suas APIs públicas ficam fora da área autenticada. Isto permite consulta cidadã sem login, preservando a separação entre operação interna e publicação pública.

### Segurança e permissões

O modelo de autorização é RBAC e combina:

- Perfil de usuário com permissões por módulo: visualizar, editar, criar, atualizar, excluir e emitir relatórios.
- Módulos permitidos, bloqueados ou somente leitura por perfil.
- Administrador do sistema com acesso total.
- Escopo operacional por departamento em atendimento e processos.
- Escopo de unidade gestora nas operações financeiras.
- Módulos ativos ou contratados por instância.
- Rate limit no endpoint de criação de sessão.
- Controle de upload e download de arquivos por módulo e vínculo do documento.
- Auditoria de autenticação, operações protegidas, downloads, exportações, páginas visualizadas e interações de interface.

Os eventos de auditoria possuem migration com proteção contra alteração, e existem testes que confirmam a rejeição de mutação no banco. O rastreador de uso armazena identificadores de rota e controle, sem registrar valores digitados em formulários, URL completa ou conteúdo de relatórios.

## 3. Módulos e funcionalidades

| Módulo | Funcionalidades identificadas |
| --- | --- |
| Administração | Instituição, secretarias, departamentos, unidades, servidores, cargos, demandas, calendário e controles da POC. |
| Cadastros gerais | Pessoas físicas e jurídicas, imóveis, fornecedores e documentos, formando a base cadastral transversal. |
| Protocolos e processos | Abertura, numeração anual, tramitação, distribuição por setor, SLA, despachos, anexos, assinaturas, notificações, busca, arquivamento e relatórios. |
| Documentos e GED | Gestão de documentos, modelos, versões, upload, download controlado, hash SHA-256, bloqueio de versão assinada e assinatura interna reautenticada. |
| Atendimento ao cidadão | Chamados, central, fila, atribuição, encaminhamento, resposta, conclusão, reabertura, relatórios e transformação em processo. |
| Ouvidoria e e-SIC | Manifestações, protocolos, tratamento de sigilo, controle de identidade e permissões específicas para ouvidores. |
| Transparência | Administração de páginas, notícias, banners, licitações, contratos e Diário Oficial; Portal público para receitas, despesas, contratos, licitações e relatórios. |
| Tributação | Cadastro imobiliário e econômico, NFS-e, operações, guias, alvarás, certidões, dívida ativa e fiscalização com cruzamentos de divergência de ISS. |
| Financeiro e orçamento | PPA, LDO, LOA, créditos, reservas, empenhos, liquidações, pagamentos, retenções, receitas, tesouraria, bancos, conciliação, restos a pagar, contabilidade e relatórios legais. |
| Compras, licitações e contratos | Catálogo de itens, solicitações, processos de compra, licitações, dispensas e contratos. |
| RH e folha | Servidores, ponto, férias, benefícios, dependentes, licenças, atos, folha e eventos de folha. |
| Patrimônio e almoxarifado | Bens, materiais, almoxarifados, requisições, inventários e ciclo de vida patrimonial. Inclui depreciação, reavaliação, impairment, baixa e alienação. |
| Educação | Escolas, matrículas, professores, merenda, transporte e calendário escolar. |
| Saúde | Unidades, profissionais, equipes, pacientes, agenda, atendimentos, farmácia, vacinação, e-SUS e relatórios. |
| Assistência social | Famílias, benefícios, atendimentos, visitas, prontuário e unidades; regras locais para CadÚnico, Bolsa Família, BPC e SUAS/RMA. |
| Meio ambiente | Solicitações, licenciamento, fiscalização, empreendimentos, resíduos, denúncias, áreas verdes, educação ambiental e documentos. |
| Água e saneamento | Cadastros, unidades consumidoras, serviços, leituras, faturamento, faturas, qualidade, relatórios e portal. Calcula consumo por faixa, taxas, linha digitável e QR Code Pix. |
| Obras e serviços urbanos | Obras e projetos, ordens de serviço, serviços urbanos, medições, fiscalização, máquinas/equipes, iluminação, documentos e relatórios. |
| Cultura, esporte e lazer | Gestão cultural, fomento/projetos, eventos, esporte/lazer, espaços e reservas, conselhos/fundos e documentos. |
| Câmara Municipal | Portal legislativo, vereadores, legislaturas, comissões, sessões, proposições, leis e audiências. |
| Segurança e mobilidade | Guardas, ocorrências, rondas, ordens, trânsito, infrações, mobilidade, defesa civil e documentos. |
| Configurações | Instância, módulos ativos, perfis, usuários, processos, integrações e auditoria. |
| Indicadores | Rota criada para BI e indicadores executivos, mas a tela atual está marcada como "em breve". |

### Fluxos transversais relevantes

- **Despesa pública:** há controles de disponibilidade, exercício aberto, origem de contratação, segregação de funções, documentos financeiros e restrição de pagamento sem liquidação.
- **Receita e tesouraria:** lançamento, arrecadação, redistribuição de fonte, estorno, movimentos bancários, transferências e conciliação.
- **Patrimônio:** o inventário bloqueia movimentações regulares; sua aprovação gera ajuste e exige segregação entre inventoriante e aprovador.
- **Documentos e assinaturas:** documentos financeiros podem ser vinculados a fatos financeiros; versões assinadas são protegidas contra alteração.
- **Atendimento e processo:** chamados e manifestações podem ser encaminhados e convertidos em processo administrativo.
- **Transparência:** dados publicados passam por projeção pública para não expor identificadores internos ou dados pessoais indevidos; há exportação de CSV e APIs específicas.

## 4. Integrações

### Integrações implementadas ou com uso concreto identificado

| Integração | Situação identificada | Uso no sistema |
| --- | --- | --- |
| Firebase Authentication | Implementada | Login por e-mail/senha, recuperação de senha, validação de token e criação de sessão. |
| Neon PostgreSQL + Prisma | Implementada | Persistência relacional de todos os módulos e health check de banco. |
| Vercel Blob | Implementada | Arquivos privados por instância, com validação de tipo/tamanho e download autorizado. |
| Banco Virtual Robonuvem | Implementação de POC/sandbox | Autenticação, contas, transações, extratos, OFX/JSON, rendimentos, receitas constitucionais e ordens de pagamento. |
| Webhook bancário | Implementado para o fluxo configurado | Recebimento autenticado de receitas externas com deduplicação e auditoria. |
| Assinatura ICP-Brasil A1 | Implementação local | Uso de `node:crypto`, certificado/chave configurados no ambiente e validação de cadeia. |
| Portal da Transparência | Implementado internamente | APIs públicas de despesas, receitas, contratos, licitações e relatórios, com exportação CSV. |
| Notificações de prazo | Implementado internamente | Endpoint cron cria notificações persistidas para processos; não foi identificado envio de e-mail ou SMS nesse fluxo. |

### Catálogo configurável, sem conector produtivo homologado identificado

O catálogo contém SAGRES/TCE-PB, SICONFI, eSocial, EFD-Reinf, DIRF/SEFIP, PNCP, NF-e/CT-e, NFS-e, CNAB, OFX, API bancária, Pix/Boleto, SMTP, WhatsApp, ICP-Brasil e Diário Oficial.

O runtime de integrações deixa claro que:

- No ambiente `MOCK`, a operação é simulada e nenhuma chamada externa é realizada.
- No ambiente `SANDBOX`, há tratamento específico para `BANCO_API` da POC.
- Nos demais casos, a execução é bloqueada com mensagem de que o adaptador real ainda não foi homologado.

Assim, esses itens devem ser tratados como capacidade planejada/configurável até que cada conector possua credenciais, homologação, monitoramento e testes de ponta a ponta próprios.

### Observabilidade

Não foram encontradas integrações explícitas com Sentry, Datadog, New Relic, PostHog ou OpenTelemetry. A observabilidade existente está centrada em auditoria interna de uso e eventos de domínio. A tela global de erro registra no console, mas a afirmação de que a equipe foi notificada não está conectada, no código analisado, a um serviço externo de alerta.

## 5. Usabilidade e acessibilidade

### Recursos de usabilidade presentes

- Login com estado de carregamento, mensagens de falha, exibição/ocultação de senha e recuperação por e-mail.
- Dashboard responsivo, com grade entre duas e sete colunas e indicação visual de módulo bloqueado ou não contratado.
- Menu mobile em painel lateral e layouts responsivos para desktop, tablet e celular.
- Navegação financeira por grupos, destaque de rota ativa, recolhimento lateral em desktop e menu específico em telas menores.
- Busca, filtros de status, filtros por período, paginação, badges de prioridade/situação e ações rápidas em diversos módulos.
- Tabelas com rolagem horizontal em telas estreitas, principalmente em Processos e Atendimento.
- Estados de carregamento, botões desabilitados durante submissões, mensagens de lista vazia e feedback de upload.
- Portal da Transparência sem login, com filtros responsivos, abas, paginação e exportação de dados.
- Tela global de erro com nova tentativa e retorno ao início.

### Acessibilidade observada

- Componentes-base possuem foco visível, estados desabilitados e suporte a `aria-invalid`.
- Diálogos e painéis laterais usam primitivas acessíveis, overlay, título, descrição e controle de fechamento com texto oculto.
- Há uso pontual de `aria-label`, `role="status"` e `role="alert"` em áreas de Obras, Patrimônio e Financeiro.

### Pontos de evolução de usabilidade e acessibilidade

- Alguns botões apenas com ícone não têm `aria-label` de forma consistente.
- Campos de busca em Processos e Atendimento dependem de placeholder, sem rótulo associado visível.
- Erros do login não usam `role="alert"` ou região `aria-live`.
- Tabelas não possuem `caption` ou `scope` explicitamente em todos os casos.
- Parte da console de integrações utiliza `alert()`, menos consistente e menos acessível do que avisos persistentes com região viva.
- O menu financeiro é estático no cliente; a autorização é verificada no servidor, mas a navegação pode exibir opções que o perfil não pode operar.
- Não há teste automatizado de acessibilidade ou de interação em navegador.

## 6. Testes existentes

### Como a suíte é executada

O comando `npm run test:unit` chama `scripts/run-group-a-tests.mjs`, que localiza arquivos de teste versionados e executa `tsx --test`. Apesar do nome, a suíte mistura testes unitários, testes de serviço com mocks e testes de integração com Prisma/base POC.

O inventário atual contém **14 arquivos** e **66 casos `test(...)`**:

| Arquivo | Tipo | Cenários cobertos |
| --- | --- | --- |
| `tests/public-finance.test.ts` | Unitário/serviço com mocks | Retenções, filtros públicos, neutralização de fórmulas em CSV/TXT, projeção pública sem PII, integração mock, relatórios, snapshots, Diário, balancete, conciliação, PCA, LOA, extrato e FAQ. **19 casos.** |
| `tests/poc-bank.test.ts` | Unitário | Restringe a POC ao Banco Virtual Robonuvem e às contas provisionadas. **2 casos.** |
| `tests/financial-report-access.test.ts` | Unitário | Permissão explícita de relatório financeiro, exigência de edição no módulo e exceção para administrador total. **3 casos.** |
| `tests/blob-namespace.test.ts` | Unitário | Namespace de documentos por instância e rejeição de identificador inválido. **2 casos.** |
| `tests/audit-evidence.test.ts` | Unitário e integração Prisma | Persistência mínima de evento, catálogo, permissões, perfil POC, migration append-only, índices e rejeição de alteração no banco. **8 casos.** |
| `src/lib/patrimonio/__tests__/stock-service.test.ts` | Serviço com mocks | Lote, ajustes, validação de quantidade/custo, liquidação em saída, gravação transacional, auditoria e bloqueio durante inventário. **7 casos.** |
| `src/lib/patrimonio/__tests__/inventory-service.test.ts` | Serviço com mocks | Ajuste e desbloqueio após inventário aprovado; segregação entre inventoriante e aprovador. **2 casos.** |
| `src/lib/patrimonio/__tests__/asset-lifecycle.test.ts` | Unitário/serviço | Depreciação linear, competência, ganho/perda, reavaliação, impairment, custo subsequente e pendência contábil em baixa. **7 casos.** |
| `src/lib/financeiro/__tests__/revenue-lifecycle.test.ts` | Integração Prisma/POC | Lançamento, arrecadação, redistribuição, estorno, tesouraria, contabilização e auditoria de receita. **1 caso abrangente.** |
| `src/lib/financeiro/__tests__/procurement-origin-policy.test.ts` | Integração Prisma/POC | Políticas de origem da contratação, contrato não vigente, fornecedor divergente e contrato válido. **1 caso abrangente.** |
| `src/lib/financeiro/__tests__/financial-documents.test.ts` | Integração Prisma/POC | Nota de empenho, nota de liquidação, ordem de pagamento, snapshots e vínculo com ordem de serviço/GED. **1 caso abrangente.** |
| `src/lib/financeiro/__tests__/commitment-protocol-gate.test.ts` | Integração Prisma/POC | Emissão de empenho libera protocolo aguardando contabilidade e registra evento. **1 caso.** |
| `src/lib/financeiro/__tests__/accounting-close-workflow.test.ts` | Integração Prisma/POC | Segregação para fechamento/reabertura, fechamento anual e cancelamento/reinscrição de restos a pagar. **3 casos.** |
| `src/lib/financeiro/__tests__/financeiro-lagoaseca.test.ts` | Integração Prisma/POC | Pagamento sem liquidação, retenções, teto contratual, seed POC, CSV idempotente, conciliação, relatórios, planejamento, transferência e workflow legal. **9 casos.** |

### Verificações e utilitários já disponíveis

| Comando | Objetivo | Observação |
| --- | --- | --- |
| `npm run test:unit` | Executa as 14 suítes Group A. | Inclui testes que usam Prisma e dados POC. |
| `npm run build` / `npm run build:check` | Gera cliente Prisma e executa build do Next. | Executado no CI. |
| `npm run lint` | Executa ESLint. | Existe, mas não é chamado no workflow de CI. |
| `npm run verify:poc-users` | Confere usuários da POC em Prisma e Firebase. | Verificação manual. |
| `npm run verify:poc-base` | Confere UG, exercícios, contas, integração bancária, regras constitucionais e saldos iniciais da POC. | Verificação manual. |
| `npm run verify:group-a-evidence` | Verifica runner Group A e marcações de evidência em relatórios. | Verificação estática. |
| `npm run finance:decimal:reconcile` | Reconcilia pares de campos numéricos/decimais em modo somente leitura. | Verificação financeira. |
| `npm run finance:decimal:backfill` | Preenche dados financeiros ausentes conforme a reconciliação. | Altera dados; não é somente leitura. |

O arquivo `test-prisma.ts` é apenas uma verificação manual de conectividade e contagem de secretarias. Não usa `node:test`, não possui asserções e não faz parte do comando de teste ou do CI.

### CI atual

O workflow `.github/workflows/ci.yml` roda em pull requests e pushes para `main`, com Node 22:

1. `npm ci`
2. `npx prisma validate`
3. `npm run test:unit`
4. `npm run build:check`
5. `npm audit --omit=dev --audit-level=high`

### Limites da cobertura atual

- Não há ferramenta, relatório ou meta mínima de cobertura.
- Não há testes de páginas, componentes React, formulários, rotas HTTP, Server Actions ou comportamento de browser.
- Não há testes automatizados de acessibilidade, regressão visual, carga, concorrência ou segurança ofensiva.
- Diversos testes financeiros dependem de `DATABASE_URL`, dados específicos da POC e usuários previamente semeados; alguns podem ser ignorados quando os pré-requisitos não existem.
- Testes de integração inserem/removem dados e preservam intencionalmente certos eventos de auditoria; exigem ambiente de banco apropriado e isolado.
- Integrações reais, especialmente governamentais e bancárias fora da POC, não têm testes ponta a ponta identificados.

**Nota:** esta análise inventaria os testes presentes no repositório. Ela não executou a suíte, pois parte dela realiza operações em banco/POC e pode alterar dados de ambiente configurado.

## 7. Pontos fortes observados

- Cobertura funcional extensa para um ERP municipal, incluindo áreas finalísticas e áreas de controle.
- Modelo de dados relacional amplo e regras de domínio explícitas para financeiro e patrimônio.
- Controle de acesso granular, com escopo por módulo, departamento e unidade gestora.
- Auditoria de eventos e evidência append-only verificada por teste de banco.
- Portal público de transparência com projeção de dados e preocupação explícita em não expor identificadores internos ou dados pessoais.
- Armazenamento de documentos privados e downloads sujeitos a autorização.
- Fluxos financeiros com salvaguardas importantes: liquidação antes de pagamento, origem de contratação, retenções, segregação de funções e fechamento contábil.
- Interface responsiva com filtros, buscas, feedback de operação e navegação adaptada a dispositivos menores.
- CI já executa validação de schema, testes, build e auditoria de dependências de produção.

## 8. Riscos e prioridades recomendadas

| Prioridade | Recomendação | Motivo |
| --- | --- | --- |
| Alta | Homologar e testar conectores de produção exigidos por cada município: TCE, SICONFI, PNCP, eSocial, EFD-Reinf, NFS-e, bancos e Diário Oficial. | O catálogo não substitui integração regulatória efetiva. |
| Alta | Isolar a base usada por testes de integração e tornar o provisionamento repetível no CI. | Evita dependência de dados externos da POC e alterações acidentais. |
| Alta | Adicionar testes de rotas/API, autorização e fluxos críticos de navegador. | A camada web e os controles de acesso nas ações não possuem cobertura automatizada identificada. |
| Média | Incluir `npm run lint` no CI e implantar relatório/limiar de cobertura. | Melhora a prevenção de regressões e a visibilidade da qualidade. |
| Média | Padronizar feedback de interface com componentes acessíveis, substituindo `alert()` onde aplicável. | Melhora consistência e suporte a leitores de tela. |
| Média | Corrigir rótulos, regiões vivas, descrições de ícones e semântica de tabelas. | Reduz barreiras de acessibilidade sem alterar fluxos de negócio. |
| Média | Integrar monitoramento e alerta de exceções/saúde. | Atualmente a auditoria interna não substitui observabilidade operacional. |
| Média | Parametrizar e filtrar visualmente a navegação conforme RBAC. | Evita que usuários visualizem opções que não podem executar. |
| Baixa | Evoluir o módulo de Indicadores de "em breve" para painéis executivos. | Completa a camada de gestão e apoio à decisão. |

## 9. Conclusão

O CeleriFlow já apresenta uma base de ERP municipal integrada, com arquitetura moderna, grande abrangência de módulos, controles de autorização e auditoria, além de regras relevantes para os fluxos financeiro, patrimonial, documental e de transparência. A suíte existente prova regras críticas de negócio, em especial no Financeiro e Patrimônio.

Para evolução a uma operação produtiva e auditável em cenários municipais diversos, os próximos passos mais importantes são transformar os conectores catalogados em integrações homologadas, ampliar os testes para a camada web e de acessibilidade, medir cobertura e garantir isolamento confiável da base de testes de integração.

## 10. Referências principais no repositório

- `package.json`
- `src/proxy.ts`
- `src/lib/platform/tenant-context.ts`
- `src/lib/platform/audit-evidence.ts`
- `src/lib/platform/blob.ts`
- `src/lib/integrations/registry.ts`
- `src/lib/integrations/runtime.ts`
- `src/lib/financeiro/`
- `src/lib/patrimonio/`
- `prisma/schema.prisma`
- `tests/`
- `src/lib/financeiro/__tests__/`
- `src/lib/patrimonio/__tests__/`
- `scripts/run-group-a-tests.mjs`
- `.github/workflows/ci.yml`
