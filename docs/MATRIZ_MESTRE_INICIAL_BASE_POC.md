# Matriz Mestre Inicial - Base Reutilizável e POC

**Data-base:** 16 de agosto de 2026  
**Escopo:** requisitos P0/P1 dos Ciclos 0, 1 e 2 da evolução da base reutilizável.  
**Referências:** `PLANO_MELHORIA_CELERIFLOW_POC_DIVINO_SAO_LOURENCO.md`, `Divino_Sao_Lourenco_POC_Requisitos_Sistema.md` e `PLANEJAMENTO_EVOLUCAO_BASE_REUTILIZAVEL.md`.

## 1. Finalidade e limite desta versão

Esta é a primeira versão operacional da Matriz Mestre. Ela transforma os requisitos transversais prioritários em backlog verificável e classifica cada item como produto comum, configuração municipal, adaptador externo ou pacote de POC.

Ela **não representa ainda 100% do TR**. Os requisitos setoriais de Compras, Financeiro, Tributário, RH, Educação, Saúde e demais módulos serão incorporados nas próximas iterações. Por isso, nenhum percentual de aderência global pode ser declarado a partir desta versão.

## 2. Legenda

| Campo | Significado |
| --- | --- |
| Situação | `Parcial` indica capacidade existente, mas sem cobertura completa, evidência ou padronização; `Não comprovado` exige validação técnica/operacional; `Não atende` não possui capacidade identificada. |
| Camada | `Produto comum`: regra igual para municípios; `Configuração`: variação sem código; `Adaptador`: conexão/transformação externa; `POC`: dados, usuários, roteiro ou evidência de demonstração. |
| Prioridade | `P0`: bloqueia a fundação da POC; `P1`: alta prioridade, mas pode ocorrer depois da fundação. |

## 3. Matriz inicial

| ID | Requisito resumido | Referência do TR | Situação atual | Camada | Dependências | Evidência de POC | Prioridade |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PLT-001 | Base web responsiva, integrada, multiusuário e sem duplicação funcional. | Ambiente tecnológico, p. 28-29; requisitos gerais, p. 40-42. | Parcial: stack web e telas responsivas existem; não há prova automatizada de navegadores, acessibilidade ou múltiplas janelas. | Produto comum | Autenticação, banco e layouts responsivos. | Dois usuários/perfis em desktop e celular, navegando entre módulos e observando o mesmo dado. | P1 |
| PLT-002 | Base reutilizável com módulos habilitados por instância e bancos separados por município. | Ambiente tecnológico, p. 29, itens 13-16. | Parcial: há `ConfiguracaoModulo` e bloqueio por módulo; existe apenas uma base municipal ativa. | Produto comum | Configuração de módulos, RBAC e estratégia de implantação isolada. | Ativar/bloquear módulo e montar uma instância municipal sintética em banco separado. | P0 |
| PLT-003 | Pacote repetível de seed, usuários, roteiro e evidência da POC. | Seção POC, p. 332-335. | Parcial: há seeds, verificadores e testes, mas não um pacote municipal formal e separado. | POC | Dados sintéticos, perfis, checklists e ambiente isolado. | Executar roteiro com avaliador e registrar passos, resultado, relatório/documento e auditoria. | P0 |
| SEC-001 | Acesso por usuário, perfil, módulo, ação, setor e unidade gestora. | Segurança de acesso, p. 32-33; requisitos gerais, p. 40-42. | Parcial/forte: RBAC, escopo de departamento/UG e módulos ativos existem; operações de criar, alterar e excluir ainda são agregadas no controle de edição. | Produto comum | Perfis, usuários, organograma e módulos contratados. | Solicitante cria, aprovador aprova e usuário externo não acessa dados internos. | P0 |
| SEC-002 | Login individual, recuperação, expiração/bloqueio e mitigação de automação. | Requisitos gerais, p. 40-44, itens 5, 10-12 e 45-55. | Parcial: Firebase, cookie HTTP-only, sessão de cinco dias e rate limit existem; bloqueio persistente, política de senha e CAPTCHA não estão comprovados. | Produto comum | Firebase, política de segurança e provedor de e-mail. | Login, recuperação, tentativa negada/rate-limited, logout e registro de acesso. | P0 |
| SEC-003 | Auditoria consultável de acesso, alteração, permissões e emissão de relatórios. | Segurança de dados, p. 31-33; requisitos gerais, p. 40-44. | Parcial: eventos append-only, login, páginas, interações, download e relatórios existem; IP, antes/depois e eventos de domínio são incompletos ou heterogêneos. | Produto comum | RBAC, política LGPD/retenção e eventos de domínio. | Alterar cadastro, emitir relatório e consultar a trilha por usuário, período, entidade e resultado. | P0 |
| SEC-004 | HTTPS/SSL, backup, recuperação, monitoramento, firewall e dossiê de infraestrutura. | Ambiente e recuperação de falhas, p. 29-31 e p. 34-35. | Não comprovado no repositório. | Produto comum | Provedor, procedimentos de backup/DR e evidências externas. | Certificado HTTPS, política e teste de restauração, health check e dossiê do provedor. | P1 |
| REP-001 | Serviço único de relatório com filtros, preview, PDF, XLSX, CSV, TXT, impressão e auditoria. | Relatórios, p. 28 e p. 33; requisitos gerais, p. 41-42. | Parcial: há CSV/PDF e relatórios financeiros; não há `ReportEngine` transversal, XLSX/TXT, preview ou uso padronizado. | Produto comum | Dataset comum, autorização, GED/Blob e templates. | Mesmo relatório em preview, PDF, XLSX e TXT, com filtros e auditoria. | P0 |
| REP-002 | Template institucional, brasão, assinatura, textos e histórico de relatórios. | Relatórios, p. 33; requisitos gerais, p. 42. | Parcial: relatórios possuem metadados e armazenamento pontual; não há template institucional versionado. | Configuração | REP-001, dados institucionais, GED e assinatura. | Trocar brasão, rodapé e assinante por configuração e reemitir sem código. | P1 |
| DOC-001 | GED privado: anexos, versões, hash, bloqueio de assinados, download autorizado e histórico. | Gestão de processos/GED, p. 55-63. | Parcial: documentos, versões, assinatura, Blob privado e hash existem; classificação, temporalidade, pesquisa e auditoria uniforme não estão comprovadas. | Produto comum | Blob, RBAC, auditoria e processos. | Subir documento, vinculá-lo ao processo, criar versão, baixar autorizado e consultar hash/histórico. | P0 |
| DOC-002 | Assinatura, múltiplos assinantes, autenticidade pública e QR Code. | Gestão de processos/GED, p. 56-61; segurança, p. 43. | Parcial: assinatura interna, reautenticação, hash, bloqueio e código de verificação existem; QR Code e consulta pública não foram identificados. | Produto comum | DOC-001, certificado/adapter ICP quando exigido e rota pública. | Dois usuários assinam, edição é bloqueada e documento é validado por QR/código anonimamente. | P0 |
| DOC-003 | Modelos, mesclagem, PDF e classificação/temporalidade documental. | Gestão de processos/GED, p. 56-63. | Parcial: telas de modelos e GED existem; cobertura de mesclagem, temporalidade e arquivamento parametrizado não foi comprovada. | Configuração | DOC-001, workflow, dados institucionais e REP-001. | Criar modelo municipal, gerar termo, assinar e arquivar conforme prazo configurado. | P1 |
| CAD-001 | Cadastro canônico de PF/PJ, documentos, contatos, endereços, vínculos e reutilização entre módulos. | Requisitos gerais, p. 42; Gestão Tributária, p. 91-92. | Parcial/forte: pessoas, empresas, endereços e representantes possuem relações; contatos/documentos ainda são parcialmente específicos por módulo. | Produto comum | Modelo canônico, GED, permissões e módulos consumidores. | Cadastrar PF/PJ uma vez e reutilizar como fornecedor, interessado e contribuinte. | P0 |
| CAD-002 | Detecção, revisão e unificação auditável de duplicidades. | Requisitos gerais, p. 42; Gestão Tributária, p. 91-92. | Parcial: CPF/CNPJ são únicos, mas não há fluxo transversal de sugestão, fusão, reversão e auditoria. | Produto comum | CAD-001, auditoria detalhada e regras de sobrevivência de dados. | Criar duplicidade controlada, revisar, fundir e preservar vínculos/histórico. | P0 |
| CAD-003 | Validação de CPF/CNPJ, CEP e preparação de consulta nacional. | Requisitos gerais, p. 42; Gestão Tributária, p. 91-92. | Parcial/não comprovado: schema contém os campos, mas validação consolidada, CEP e contrato SERPRO não foram identificados. | Produto comum | CAD-001, regras de validação e contratos de integração. | Validar CPF/CNPJ localmente e preencher CEP por retorno MOCK identificado como simulado. | P0 |
| WFL-001 | Workflow parametrizável: etapas, setor, responsável, ordem, SLA e histórico. | Gestão de processos/GED, p. 55-63. | Parcial: etapas de processos possuem sequência, setor, rótulo e SLA; não existe motor reutilizável para todos os módulos. | Produto comum | Processos, organograma, RBAC, notificações e auditoria. | Configurar fluxo por assunto e tramitar entre setores com SLA e histórico. | P0 |
| WFL-002 | Aprovar, rejeitar, devolver, exigir documento e segregar funções por regra. | Requisitos gerais, p. 42; Gestão de processos/GED, p. 55-63. | Parcial: há segregações no Financeiro e Patrimônio; não há modelo comum de decisão, condições e exigência documental. | Produto comum | WFL-001, RBAC granular, GED e auditoria. | Solicitante abre, aprovador distinto aprova/devolve e sistema bloqueia avanço sem anexo obrigatório. | P0 |
| WFL-003 | Visão gráfica, métricas de prazo/gargalo e versionamento de workflow. | Gestão de processos/GED, p. 58-63. | Não comprovado/parcial: há histórico e SLA, sem diagrama, métricas padronizadas ou versão da definição. | Configuração | WFL-001, eventos e REP-001. | Diagrama, etapa atual, responsável, prazo e relatório de atrasos. | P1 |
| NTF-001 | Central interna: leitura, prioridade, vínculo com entidade e eventos de processo/prazo. | Requisitos gerais, p. 42; Processos, p. 54-55. | Parcial: notificações de protocolo e cron de prazo existem; não há prioridade ou serviço transversal. | Produto comum | Processos, WFL-001, RBAC e jobs/cron. | Tramitar processo, gerar aviso, marcar como lido e abrir entidade relacionada. | P0 |
| NTF-002 | Arquitetura desacoplada para e-mail, SMS, WhatsApp e push, inicialmente MOCK. | Requisitos gerais, p. 42; DTEL, p. 127-128. | Não atende como serviço comum: há catálogo e runtime MOCK, não há `NotificationService`, providers ou fila. | Adaptador | NTF-001, INT-001, consentimento e configuração de canais. | Evento gera notificação interna real e canais externos MOCK claramente identificados. | P0 |
| CFG-001 | Configuração municipal de instituição, identidade, módulos, organograma, usuários e perfis. | Ambiente tecnológico, p. 29; requisitos gerais, p. 42. | Parcial: instância, módulos, perfis, usuários e integrações têm telas; não existe catálogo unificado para identidade e parâmetros. | Configuração | PLT-002, SEC-001, REP-002 e WFL-001. | Alterar nome, módulos ativos, perfil e dados institucionais sem código. | P0 |
| CFG-002 | Configurações auditáveis/versionadas: parâmetros, modelos, SLA, fluxos, assinantes e feature flags. | Documentação e requisitos gerais, p. 33 e p. 42. | Não atende plenamente: configurações persistem, mas não há modelo transversal de versão, aprovação, rollback e comparação. | Configuração | SEC-003, CFG-001, WFL-001 e REP-002. | Alterar SLA/modelo, consultar versão anterior e verificar auditoria da mudança. | P0 |
| INT-001 | Padrão interno de integração: objeto validado, contrato, provider/adapter, MOCK/SANDBOX/PRODUÇÃO, logs e retorno. | Ambiente tecnológico, p. 28; plano de melhoria, etapa de integrações. | Parcial: catálogo, conexão e runtime existem; faltam contratos/schemas/adapters/filas/webhooks genéricos. | Adaptador | Objetos de domínio, CFG-001, SEC-003 e observabilidade. | Executar operação MOCK e consultar configuração, payload sanitizado, resposta e log. | P0 |
| INT-002 | Console de integração com ambiente, referência segura de credencial, teste e histórico. | Ambiente tecnológico, p. 28; requisitos gerais, p. 42. | Parcial: `IntegrationConnection` e `IntegrationRun` registram configuração/teste; execuções gerais não persistem runs e não há health check comum. | Adaptador | INT-001, cofre de segredos, auditoria e monitoramento. | Configurar integração MOCK, testar, ativar e consultar histórico sem expor segredo. | P0 |
| INT-003 | Mocks de SERPRO, CEP, e-mail, SMS, WhatsApp e conectores governamentais selecionados. | Requisitos gerais, p. 42; Gestão Tributária, p. 91-92; DTEL, p. 127-128. | Parcial: MOCK genérico atende catálogo existente; SERPRO, CEP, TCE-ES, SIOPE e SIOPS não foram identificados no catálogo. | Adaptador | INT-001/002 e decisão de itens selecionados na POC. | Cadastro, notificação e prestação de contas mostram retorno MOCK e ambiente visível. | P1 |

## 4. Decisões e bloqueios abertos

| ID | Decisão ou bloqueio | Impacto | Responsável necessário |
| --- | --- | --- | --- |
| DEC-001 | Confirmar critérios e itens que a comissão selecionará na POC. | Define os requisitos externos que podem deixar de ser P3. | Produto/comercial/jurídico. |
| DEC-002 | Manter bancos isolados por prefeitura enquanto não houver projeto de multi-tenancy. | Define a estratégia segura de reutilização e implantação. | Arquitetura/produto. |
| DEC-003 | Definir base legal, retenção e visibilidade de IP, consultas sigilosas e valores antes/depois na auditoria. | Evita conflito entre rastreabilidade e LGPD. | Jurídico, segurança e produto. |
| DEC-004 | Definir política de senha, bloqueio persistente, MFA/certificado e CAPTCHA. | Fecha lacunas de autenticação do TR. | Segurança/produto. |
| DEC-005 | Definir quando assinatura interna é suficiente e quando ICP-Brasil/X.509 é obrigatória. | Afeta GED, certificados e roteiro de POC. | Jurídico/produto. |
| DEC-006 | Aprovar contrato mínimo do `ReportEngine`. | Evita relatórios paralelos por módulo. | Produto, técnico e especialistas funcionais. |
| DEC-007 | Aprovar modelo comum de aprovações, devoluções e documentos obrigatórios. | Evita workflows específicos e não reutilizáveis. | Produto e áreas de negócio. |
| DEC-008 | Definir governança de configuração: versionamento, aprovação, rollback e segregação. | Permite parametrização municipal segura. | Produto, segurança e administração. |
| DEC-009 | Fixar nomenclatura e estratégia de MOCK, SANDBOX, HOMOLOGAÇÃO e PRODUÇÃO por conector. | Evita declarar integração inexistente na POC. | Arquitetura/produto. |
| DEC-010 | Obter evidências de SSL, backup/restauração, redundância, firewall e monitoramento. | Bloqueia o dossiê de infraestrutura. | DevOps/infraestrutura/provedor. |

## 5. Backlog inicial dos Ciclos 1 e 2

### Ciclo 1 - Contratos e controles de plataforma

| ID | História | Requisitos da matriz | Entregável verificável | Dependências |
| --- | --- | --- | --- | --- |
| C1-001 | Como produto, quero um catálogo de configuração por instância para não codificar variações municipais. | PLT-002, CFG-001, CFG-002 | Modelo e interface administrativa para dados institucionais, módulos e parâmetros com auditoria de alteração. | DEC-002, SEC-003. |
| C1-002 | Como administrador, quero permissões independentes de criar, alterar, excluir e emitir relatório. | SEC-001 | Política reutilizável por módulo/ação, aplicada em ações críticas, com testes positivo e negativo. | Perfis, módulos e auditoria. |
| C1-003 | Como auditor, quero consultar ações relevantes com filtros e retenção definida. | SEC-003 | Contrato de evento de auditoria, filtros de consulta e cobertura para login, alteração e relatório. | DEC-003, C1-002. |
| C1-004 | Como usuário, quero relatórios consistentes em todos os módulos. | REP-001, REP-002 | Contrato do `ReportEngine`, dataset autorizado, preview e renderização inicial PDF/CSV com auditoria. | DEC-006, C1-003, GED. |
| C1-005 | Como integração, quero um contrato único independente do fornecedor. | INT-001, INT-002 | Interfaces de provider/adapter, ambientes, payload sanitizado, execução MOCK e persistência de histórico. | C1-001, C1-003, DEC-009. |
| C1-006 | Como operador, quero uma central interna de notificações reutilizável. | NTF-001 | Entidade/serviço transversal para criar, listar, ler e navegar por notificações internas. | RBAC, jobs/cron e auditoria. |

**Aceite do Ciclo 1:** uma instância sintética altera módulos e dados institucionais por configuração; dois usuários demonstram permissão positiva/negativa; uma alteração, relatório, notificação e execução MOCK ficam auditáveis.

### Ciclo 2 - Fluxos reutilizáveis e prova de portabilidade

| ID | História | Requisitos da matriz | Entregável verificável | Dependências |
| --- | --- | --- | --- | --- |
| C2-001 | Como usuário, quero gerar relatórios em todos os formatos exigidos e com template institucional. | REP-001, REP-002 | Renderizadores XLSX/TXT, impressão, cabeçalho/rodapé configurável, armazenamento/histórico quando exigido. | C1-001, C1-004. |
| C2-002 | Como usuário autorizado, quero gerenciar documentos assináveis e validáveis publicamente. | DOC-001, DOC-002, DOC-003 | Versão, hash, múltiplos assinantes, QR Code/consulta pública, modelo e retenção configurável. | C1-003, C1-004, DEC-005. |
| C2-003 | Como município, quero cadastrar pessoas uma vez e corrigir duplicidades preservando vínculos. | CAD-001, CAD-002, CAD-003 | Contatos/documentos canônicos, validação local, sugestão/revisão/fusão auditável e mock CEP/CPF/CNPJ. | C1-003, C1-005. |
| C2-004 | Como administrador, quero configurar workflows reutilizáveis com segregação e documentos obrigatórios. | WFL-001, WFL-002, WFL-003 | Motor de etapa/decisão, SLA, devolução, documento obrigatório, versão e relatório de atraso. | C1-001, C1-002, C2-002, DEC-007/008. |
| C2-005 | Como usuário, quero receber eventos internos e canais externos simulados sem acoplamento ao módulo. | NTF-001, NTF-002, INT-003 | Providers interno e MOCK; prioridade, link de entidade, fila/reprocessamento e histórico de entrega. | C1-005, C1-006, C2-004. |
| C2-006 | Como equipe de POC, quero preparar e repetir cenários sem alterar a base padrão. | PLT-003, PLT-002 | Pacote de seed sintético, perfis, roteiro, evidências e segunda configuração municipal de validação. | C1-001 a C2-005. |

**Aceite do Ciclo 2:** a base é instalada em duas configurações sintéticas diferentes; ambas executam login, RBAC, cadastro, processo/workflow, documento assinado/validado, notificação e relatório sem alteração de código. A POC de Divino passa então a ser apenas um pacote de configuração, seed e roteiro.

## 6. Próxima revisão

Ao concluir o Ciclo 1, esta matriz deve receber os requisitos de Administração, Processos/GED, Atendimento e Transparência. Ao concluir o Ciclo 2, deve incorporar Compras, Almoxarifado, Patrimônio e Financeiro/Contábil antes de avançar às especialidades municipais e integrações reais.
