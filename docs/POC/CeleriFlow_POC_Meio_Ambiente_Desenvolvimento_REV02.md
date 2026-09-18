# CeleriFlow — Plano de desenvolvimento e demonstração da POC
## Gestão de Meio Ambiente | Divino de São Lourenço/ES

**Revisão 02 — 18/09/2026 — webapp no Chrome do celular e dependências de outros módulos destacadas.**  
**Destinatário:** agente de desenvolvimento Codex/Antigravity com acesso ao repositório real.  
**Fonte funcional:** `termo de referencia (Ratificado)(1).pdf`, Processo Administrativo nº 1026/2026, seção 19, bloco **GESTÃO DE MEIO AMBIENTE**, páginas **151–155**, itens **1–63**.  
**Identificadores deste plano:** `MEA-001` a `MEA-063`. Esses prefixos são de rastreabilidade, não nova numeração do edital.  
**Objetivo:** adaptar o CeleriFlow existente, com persistência, operações integradas e demonstrações reproduzíveis com dados fictícios.
**Substitui:** `CeleriFlow_POC_Meio_Ambiente_Desenvolvimento_REV01.md`. Usar somente esta revisão como instrução de execução.

> **Decisões do usuário nesta revisão:** (1) o atendimento mobile será pelo **mesmo site/portal responsivo do CeleriFlow, acessado no Chrome do celular**, sem criar aplicativo separado; (2) quando houver dados ou serviços de outro módulo, **destacar a origem e a dependência**, consumindo o que já existir, sem incluir desenvolvimento do módulo de origem neste trabalho.

**Limite da mudança:** mantidos os 63 itens e suas citações do TR. A decisão de canal é de implementação do usuário; não altera a expressão “aplicativo mobile” da fonte. A distinção entre demonstração técnica do webapp e aceitação formal está registrada em Q-03. Nenhuma dependência sinalizada é considerada atendida sem funcionamento real.

> **Instrução ao agente:** examine o código, localize o que já funciona, implemente as lacunas, teste pela interface e pelos serviços e entregue evidência de cada ID. Não entregue somente componentes visuais, botão sem operação, dados fixos ou outro planejamento. Não declare um item atendido porque seu título aparece no menu.

**Situação documental:** os 63 requisitos foram extraídos do PDF e conferidos na composição deste documento. O repositório, o funcionamento do site no Chrome do celular, as credenciais, a matriz ambiental oficial, a emissão de DUA e as integrações externas não foram inspecionados. Cobertura do plano não equivale a funcionalidades implementadas, homologadas ou à aprovação da comissão.

**Como usar:** fornecer este MD e o TR ratificado ao agente. A REV02 de Almoxarifado/Patrimônio é referência de método/UX, não lista de exclusões para Meio Ambiente: aqui existem exigências expressas de mapa, funcionalidades mobile, simulação, notificações, trâmite e assinatura. Para os itens mobile, a solução de desenvolvimento definida é o próprio site no Chrome do celular, conforme Q-03. Não excluir essas funcionalidades nem criar um aplicativo separado.

**Fontes e distinções:** a indicação **TR** reproduz o texto original do item, normalizando apenas espaços e quebras de linha, inclusive mantendo imperfeições de redação. Os títulos resumidos, campos técnicos, demonstrações, dados e critérios de teste são propostas de implementação, não roteiro oficial da comissão. Referências ao PDF usam o número da página do arquivo de 335 páginas. Nenhuma taxa, prazo, regra ambiental, layout de arrecadação ou integração não fornecida foi presumida como oficial.

**Navegação:** [Escopo](#escopo) · [Dados de outros módulos](#dados-outros-modulos) · [Lista dos 63 itens](#lista) · [Contratos técnicos](#contratos) · [Interface ERP](#ux) · [Base fictícia](#base) · [Desenvolvimento item a item](#itens) · [Pacotes](#pacotes) · [Testes e evidências](#testes) · [Pendências](#pendencias) · [Auditoria e fontes](#fontes)

---
<a id="escopo"></a>
## 1. Escopo controlado e diagnóstico do sistema existente

### 1.1 Regras de execução

Ler `AGENTS.md`, quando existir, manifests, lockfile, migrations e testes do repositório. Localizar Meio Ambiente, Pessoas, autenticação interna/externa, site/portal responsivo, Processos/Protocolo, GED, assinatura, modelos/relatórios, Tributos/Arrecadação, e-mail, rotinas agendadas, mapas e estoque de mudas. Nos outros módulos, fazer somente diagnóstico de leitura para identificar dados/serviços já disponíveis; não incluir alterações desses módulos no pacote ambiental. Usar a arquitetura efetiva: não impor bibliotecas, rotas, provedor, ORM ou nomes de tabelas a partir deste documento.

O contexto de trabalho é um CeleriFlow web já existente; confirmar a implementação de TypeScript/React/Next.js/PostgreSQL e autenticação no código antes de agir. Não atualizar a stack, mudar infraestrutura ou recriar o ERP para esta POC. Preservar trabalho de terceiros e fazer alterações incrementais, sem reset ou migração destrutiva do banco. Criar estruturas novas somente para requisitos que a estrutura atual não suporte.

| Natureza | Significado | Regra |
|---|---|---|
| **TR-E** | Item específico de Meio Ambiente, 1–63. | Entregar o resultado e todas as partes do texto do item. |
| **TR-G** | Requisito geral citado no PDF, transversal ao módulo. | Reaproveitar o núcleo e registrar lacunas gerais separadamente. |
| **TEC** | Integridade, segurança, persistência e testes necessários à operação real. | Não autoriza novos processos de negócio; usar solução equivalente existente. |
| **UX** | Padrão de telas/paginação solicitado pelo usuário. | Aplicar sem retirar campos ou recursos do TR. |
| **CANAL** | Solução mobile definida pelo usuário. | Mesmo site no Chrome do celular; sem cliente, aplicativo ou backend separado. |
| **DEP-MOD** | Dado ou serviço de outro módulo/núcleo. | Identificar origem, informação consumida e disponibilidade; usar o serviço existente. Alteração no módulo de origem fica fora deste pacote. |
| **EXTRA** | Função sem relação com TR-E, TR-G ou a orientação de UX. | Não desenvolver nesta adaptação; preservar recursos existentes sem torná-los condição dos 63 itens. |

Antes de criar ação de negócio ou campo obrigatório, apontar o ID que a justifica. Identificadores internos, usuário e data de registro devem ser obtidos automaticamente quando possível. Uma funcionalidade pode atender vários IDs; não criar 63 telas.

### 1.2 Limites de escopo

**Mobile definido, sem novo produto:** adaptar as páginas existentes para operação no Chrome do celular. Não criar APK, IPA, projeto nativo/híbrido, aplicativo separado, backend exclusivo, wrapper, empacotamento ou publicação em loja. Não exigir instalação de PWA, manifesto, service worker, push ou offline para concluir esta adaptação. Preservar recursos já existentes, sem transformá-los em nova tarefa. “Webapp”, neste MD, significa o próprio site responsivo acessado pela URL.

**Não acrescentar por suposição:** IA para deferir licenças, previsão de risco, integração nominal com órgão que o TR não identifica, fiscalização com auto de infração/multa, emissão automática de ART por conselho profissional, regularização fundiária, cálculo de faixas legais de APP, sensoriamento por drone, portal de pagamentos novo, PIX/boleto sem especificação, gestão agronômica de irrigação/adubação, loja de mudas, WhatsApp/SMS/push, operação offline ou publicação obrigatória nas lojas de aplicativos. Uma necessidade oficial posterior pode alterar esse limite mediante registro, nunca de forma silenciosa.

**Não retirar como se fossem extras:** denúncia e consulta de licenciamentos pelo celular (18/36), implementadas neste pacote no site responsivo aberto no Chrome, simulação de licenciamento (30), delimitação/marcação geográfica e datum (26/28/44), mapa de processos por situação (57), notificações e antecedências (42/43/50/51), documentos assinados e autenticidade (56/58/59), e integração externa (60).

Não exigir novos graus de aprovação só para aparentar profissionalismo. O fluxo de credenciamento/licenciamento deve ser configurado com os responsáveis e as transições fornecidos pela Administração ou reutilizado do CeleriFlow. Um fluxo fictício de ensaio será identificado como tal.

### 1.3 Dependências gerais selecionadas do TR

| Dependência | Uso nesta adaptação | Referência |
|---|---|---|
| Web, responsividade e integração | Mesma base/identidade entre interno, externo e mobile; conservar operações existentes. | Ambiente Tecnológico, itens 1, 4, 7 e 16, pp. 28–29. |
| Integridade e operações online | Requisição/processo/documento/valor não ficam parcialmente confirmados. | Recuperação de Falhas, itens 5–8, p. 31; Caracterização Operacional, itens 1–2, p. 32. |
| Perfis, setor e auditoria | Autorizar no servidor, inclusive anexos, mapa e portal; registrar ações relevantes. | Caracterização Operacional, itens 3–7, pp. 32–33; Requisitos Gerais, itens 9–13 e 27, pp. 41–42. |
| Relatórios, arquivos e impressão | Reaproveitar visualização/geração e formatos gerais aplicáveis: PDF, XLSX, TXT e CSV. Não converter um simples relatório em DUA oficial. | Ambiente Tecnológico, itens 8–9, p. 28; Relatórios, itens 1–3, p. 33; Requisitos Gerais, itens 14–16, p. 41. |
| Cadastro único, ajuda e assinatura | Reutilizar Pessoas, ajuda e assinatura. Consultas externas do núcleo continuam sendo dependências próprias, não comprovação pelo cadastro de dados fictícios. | Requisitos Gerais, itens 17, 21 e 33–38, pp. 41–42. |

Este recorte não é auditoria completa de todos os requisitos gerais nem de todos os módulos da licitação.

<a id="dados-outros-modulos"></a>
### 1.4 Dados de outros módulos — destacar, consumir o existente e não reconstruir

**Origem prevista, não inventário confirmado:** os nomes abaixo identificam as responsabilidades de dados sugeridas pelo plano. O agente deve confirmar no repositório qual módulo/serviço realmente fornece cada informação. Não afirmar que há API, tela, tabela ou integração pronta sem localizá-la.

| Referência | Módulo/serviço de origem previsto | Dado ou capacidade utilizados por Meio Ambiente | Limite deste pacote |
|---|---|---|---|
| **DEP-01** | Pessoas / Cadastros / Endereços | Identificador da pessoa, nome, tipo PF/PJ quando aplicável, contatos, e-mail e endereço; consulta CEP já configurada. | Selecionar e reutilizar dados. Não criar outro cadastro geral de pessoas nem contratar novo provedor de CEP por suposição. |
| **DEP-02** | Administração / Autenticação / Organograma | Usuário, perfil, permissões, órgão, setor e vínculo de acesso externo. | Aplicar controles existentes nas funções ambientais. Não criar autenticação, perfis administrativos ou organograma paralelos. |
| **DEP-03** | Processos / Protocolo | Número/ID, caixa/setor, situação, trâmite, histórico, peças e atos de homologação. | Ler a situação e acionar operações existentes a partir de Meio Ambiente. Não reconstruir workflow/Protocolo. |
| **DEP-04** | GED / Tipos documentais / Modelos / Relatórios | Arquivos, versões, identificação, tipos, modelos, conteúdo, imagens, visualização e geração de documentos. | Usar os serviços para os documentos ambientais. Não desenvolver outro GED ou editor geral. |
| **DEP-05** | Núcleo de assinatura / Autenticidade | Arquivo assinado, identificação da versão, informações das assinaturas e resultado de verificação disponível. | Acionar o mecanismo existente e publicar a versão correta. Não criar outro assinador nem tratar hash como certificado. |
| **DEP-06** | Tributos / Arrecadação / Financeiro | Débitos ambientais, sujeito, valores, vencimentos/situação, referência da DUA e resultado/arquivo da emissão. | Consultar débitos e solicitar emissão pelo serviço existente. Não criar arrecadação, cobrança, baixa financeira ou emissor de DUA paralelos. |
| **DEP-07** | Serviços compartilhados de acesso, e-mail e agendamento | Link de acesso, destinatário, evento, data agendada e resultado real do envio. | Fornecer os eventos/prazos ambientais e usar os serviços existentes; não reconstruir provedor, autenticação ou agendador geral. |
| **DEP-08** | Portal / Canal web de atendimento ou Ouvidoria, se já usado | Sessão externa, formulário/registro/protocolo de denúncia e exibição de dados autorizados. | Reutilizar as mesmas páginas e serviços no desktop e no Chrome do celular. Não criar portal, app ou Ouvidoria independentes. |
| **DEP-09** | Almoxarifado / Catálogo / Estoque, **somente se o viveiro já usar essa origem** | Identificador de material, local/canteiro, movimentos e posição de mudas. | Não impor vínculo novo com Almoxarifado. Se já houver, consumir sua fonte; caso contrário, executar apenas o controle de mudas previsto em Meio Ambiente. |
| **DEP-10** | Núcleo cartográfico, **se compartilhado** | Referência geográfica/datum, camada de imagens e componente de mapa. | Reutilizar o componente disponível. APPs, áreas e localização do licenciamento continuam dados ambientais; não criar um módulo SIG separado. |
| **DEP-11** | Núcleo de integrações / Processos, **se existente** | Contrato identificado, dados de intercâmbio com órgão externo, referência de operação e retorno. | Usar a integração já disponível quando aplicável. Ausência de conector/contrato é dependência a destacar, não autorização para desenvolver integrações de outros módulos. |

**Regra operacional:** este pacote implementa as telas, validações, vínculos e chamadas necessárias do lado de Meio Ambiente. No módulo de origem, não criar telas, novos cadastros gerais, tabelas paralelas, mudanças de regras, migrations ou integrações adicionais. Quando a fonte não estiver disponível, descrever a informação/serviço faltante, registrar `DEPENDENCIA_OUTRO_MODULO` e continuar os itens independentes. Não preencher a lacuna com dado inventado, não gravar diretamente na base do outro módulo para contornar seu serviço e não marcar o requisito integrado como validado.

Não remover exigências ambientais por chamá-las de dependência. Matriz de enquadramento, relação de atividades, cálculo/simulação ambiental, condicionantes, viveiros e vínculos ambientais continuam no escopo dos seus IDs. A execução da parte dependente só termina quando a fonte real puder ser consumida; o destaque não é dispensa do requisito.

**Formato do destaque por item:** `Dados de outro módulo / serviço compartilhado: DEP-xx — origem prevista; informação utilizada; falta identificada, se houver.` Os detalhes reais de rotas/serviços são preenchidos após diagnóstico, sem fazer afirmações sobre código ainda não inspecionado.

**Dados fictícios de origem:** o usuário vai popular os módulos pertinentes pelas rotinas já disponíveis. O Codex apenas identifica quais registros serão necessários aos ensaios, não cria um importador nem implementa o módulo de origem para prepará-los. Dados simulados em teste unitário ficam identificados como simulação e não comprovam a integração.

<a id="lista"></a>
## 2. Lista dos itens e rastreabilidade

A tabela a seguir preserva **a ordem original**. Os títulos são resumos de navegação; a transcrição integral está na seção 6. A coluna de atenção remete às pendências da seção 9 e não afirma bloqueio do software existente.

| ID / item do TR | Ação resumida | Página | Atenção de implementação |
|---|---|---:|---|
| [MEA-001 / 1](#mea-001) | Preenchimento da localização pelo CEP | 151 | Q-08: fonte de CEP |
| [MEA-002 / 2](#mea-002) | Parecer técnico e relatório ambiental | 151 | — |
| [MEA-003 / 3](#mea-003) | Atividades ligadas ao licenciamento e ao enquadramento | 151 | Q-01: matriz e regras |
| [MEA-004 / 4](#mea-004) | Potencial poluidor vinculado ao licenciamento | 151 | Q-01: classificação aplicada |
| [MEA-005 / 5](#mea-005) | Lista de consultores credenciados | 151 | Q-07: acesso/divulgação |
| [MEA-006 / 6](#mea-006) | Envio de link e informações de acesso | 151 | Q-08: e-mail e acesso |
| [MEA-007 / 7](#mea-007) | E-mail de abertura e análise do processo | 151 | Q-08: e-mail; Q-07: fluxo |
| [MEA-008 / 8](#mea-008) | Movimentação de mudas em viveiros | 151 | — |
| [MEA-009 / 9](#mea-009) | Cálculo automático do tributo ambiental | 152 | Q-01: matriz e valores |
| [MEA-010 / 10](#mea-010) | Visibilidade conforme autorização do usuário | 152 | — |
| [MEA-011 / 11](#mea-011) | Cadastro de APPs e locais com restrições | 152 | Q-04: referência/camada; Q-07: restrição |
| [MEA-012 / 12](#mea-012) | Tipos de documentos exigidos por tipo de pessoa credenciada | 152 | Q-07: tipos e exigências |
| [MEA-013 / 13](#mea-013) | Atividades secundárias no licenciamento | 152 | Q-01: combinação de atividades |
| [MEA-014 / 14](#mea-014) | Documentos digitais no credenciamento do consultor | 152 | — |
| [MEA-015 / 15](#mea-015) | Solicitação de licenças, anuências e outros documentos | 152 | Q-07: tipos/fluxo |
| [MEA-016 / 16](#mea-016) | Visualização dos anexos pelo técnico para homologação | 152 | Q-07: fluxo de homologação |
| [MEA-017 / 17](#mea-017) | Anexação durante o credenciamento | 152 | — |
| [MEA-018 / 18](#mea-018) | Denúncia ambiental no Chrome do celular — webapp | 152 | Q-03: canal webapp definido; aceite formal não confirmado |
| [MEA-019 / 19](#mea-019) | Espécies relacionadas às mudas | 152 | — |
| [MEA-020 / 20](#mea-020) | Caixa de entrada da Secretaria | 152 | — |
| [MEA-021 / 21](#mea-021) | E-mails dos responsáveis por acompanhar prazos | 152 | Q-08: envio e destinatários |
| [MEA-022 / 22](#mea-022) | Cadastro da matriz de enquadramento ambiental | 152 | Q-01: matriz oficial |
| [MEA-023 / 23](#mea-023) | Confecção de vários modelos de documentos | 152 | Q-05: modelos documentais |
| [MEA-024 / 24](#mea-024) | Documentos necessários conforme o tipo do credenciado | 152 | Q-07: obrigatoriedade documental |
| [MEA-025 / 25](#mea-025) | Extrato ambiental do licenciado | 152 | Q-05: conteúdo do extrato |
| [MEA-026 / 26](#mea-026) | Escolha de datum na informação geográfica | 152 | Q-04: datums e referências |
| [MEA-027 / 27](#mea-027) | Escolha de vários modelos na impressão | 152 | — |
| [MEA-028 / 28](#mea-028) | Marcação de licenciamento sobre imagens de área ou satélite | 152 | Q-04: imagem cartográfica |
| [MEA-029 / 29](#mea-029) | Autocredenciamento do consultor ou interessado | 153 | Q-07: tipos e fluxo |
| [MEA-030 / 30](#mea-030) | Simulação de licenciamento pelo interessado | 153 | Q-01: matriz da simulação |
| [MEA-031 / 31](#mea-031) | Denúncia ambiental pelo website | 153 | Q-07: política do canal |
| [MEA-032 / 32](#mea-032) | Aceite do credenciamento pelo fluxo definido | 153 | Q-07: fluxo de aceite |
| [MEA-033 / 33](#mea-033) | Tramitação conforme o processo definido | 153 | Q-07: fluxo institucional |
| [MEA-034 / 34](#mea-034) | Modelos relacionados aos tipos de documentos | 153 | — |
| [MEA-035 / 35](#mea-035) | Visualização das licenças emitidas no município | 153 | Q-07: alcance da consulta |
| [MEA-036 / 36](#mea-036) | Consulta de licenciamentos no Chrome do celular — webapp | 153 | Q-03: webapp no Chrome; Q-07: acesso |
| [MEA-037 / 37](#mea-037) | Cadastro de atividades licenciáveis | 153 | Q-01: catálogo aplicável |
| [MEA-038 / 38](#mea-038) | Cadastro de canteiros | 153 | — |
| [MEA-039 / 39](#mea-039) | Cadastro dos tipos de credenciado | 153 | Q-07: tipos de pessoa/credenciado |
| [MEA-040 / 40](#mea-040) | Cadastro dos tipos de potencial poluidor | 153 | Q-01: tipos oficiais |
| [MEA-041 / 41](#mea-041) | Cadastro de mudas | 153 | — |
| [MEA-042 / 42](#mea-042) | Vencimentos e e-mails das condicionantes | 153 | Q-08: agendador/e-mail; Q-07: dados do prazo |
| [MEA-043 / 43](#mea-043) | Vencimentos e e-mails das licenças e documentos similares | 153 | Q-08: e-mail/agendamento; Q-07: prazos |
| [MEA-044 / 44](#mea-044) | Delimitação de áreas | 153 | Q-04: geometria e referência |
| [MEA-045 / 45](#mea-045) | Consulta e crítica de débitos ambientais | 153 | Q-02: fonte de débitos; Q-07: efeito da crítica |
| [MEA-046 / 46](#mea-046) | Enquadramento automático do licenciamento | 153 | Q-01: regras de enquadramento |
| [MEA-047 / 47](#mea-047) | Relatórios ambientais com imagens | 153 | — |
| [MEA-048 / 48](#mea-048) | Emissão de DUA do licenciamento ambiental | 153 | Q-02: DUA — dependência externa prioritária |
| [MEA-049 / 49](#mea-049) | Responsabilidade técnica e solicitação de documentos correlatos | 154 | Q-05: documentos técnicos; Q-07: solicitação |
| [MEA-050 / 50](#mea-050) | Antecedência em dias, meses ou anos para condicionantes | 154 | Q-08: calendário/agendador |
| [MEA-051 / 51](#mea-051) | Antecedência em dias, meses ou anos para licenças | 154 | Q-08: calendário/agendador |
| [MEA-052 / 52](#mea-052) | Sinalização de processos pendentes de análise | 154 | — |
| [MEA-053 / 53](#mea-053) | Tipo de pessoa no credenciamento e e-mail de acesso | 154 | Q-07: tipos; Q-08: e-mail/acesso |
| [MEA-054 / 54](#mea-054) | Documentos obrigatórios e formação de processo digital | 154 | Q-07: documentos/fluxo |
| [MEA-055 / 55](#mea-055) | Acompanhamento digital pelo solicitante | 154 | Q-07: acesso externo |
| [MEA-056 / 56](#mea-056) | Licença assinada disponível no portal e vinculada ao processo | 154 | Q-05: assinatura/certificado; Q-07: publicação |
| [MEA-057 / 57](#mea-057) | Processos digitais em mapa com situações por cores | 154 | Q-04: geografia; Q-07: alcance de “todos” |
| [MEA-058 / 58](#mea-058) | Trâmite, anexos, pareceres, licenças e assinatura por certificado | 154 | Q-05: certificado/assinatura; Q-07: fluxo |
| [MEA-059 / 59](#mea-059) | Pesquisa de autenticidade de cada documento ambiental | 154 | Q-05: autenticidade e assinatura |
| [MEA-060 / 60](#mea-060) | Integração de processos digitais com órgãos externos | 154 | Q-06: órgão e contrato técnico — dependência prioritária |
| [MEA-061 / 61](#mea-061) | Interação externa e homologação interna com retorno | 154 | Q-07: fluxo/acesso; Q-08 quando houver e-mail |
| [MEA-062 / 62](#mea-062) | Inclusão de peças em processo em andamento | 155 | — |
| [MEA-063 / 63](#mea-063) | Visualização de toda a juntada documental | 155 | — |

<a id="contratos"></a>
## 3. Contratos técnicos — operações reais, sem criar outro ERP

### 3.1 Cadastros e vínculos mínimos [TEC]

| Conceito | Dados e relações a mapear | IDs principais |
|---|---|---|
| Pessoa e credenciamento | Pessoa, tipo do credenciado, usuário, e-mail, documentos exigidos/entregues, processo e situação. Tipo de credenciado não é automaticamente o mesmo conceito que PF/PJ. | 5–7, 12, 14, 16–17, 24, 29, 32, 39, 53–54. |
| Licenciamento | Interessado/licenciado, consultor quando pertinente, atividade(s), potencial poluidor, enquadramento, processo, localização e documentos emitidos. | 3–4, 13, 15, 25, 35–37, 40, 46, 49, 55. |
| Matriz e cálculo | Critérios de correspondência, enquadramento resultante, valor/regra configurada, referência/versão e memória do cálculo. | 3, 9, 22, 30, 46, 48. |
| Processo e peças | Processo, setor/caixa, trâmite, autoria, anexos, pareceres, versões, solicitações e homologação. | 2, 20, 32–33, 52, 54–63. |
| Tipo/modelo/documento | Tipo documental, modelo, conteúdo, imagens, versão gerada, assinatura e consulta de autenticidade. | 2, 23, 25, 27, 34, 47, 49, 56, 58–59. |
| Geografia | Local, datum/referência de coordenadas, ponto/polígono, processo e situação. Restrições/APPs em camada identificada. | 1, 11, 26, 28, 44, 57. |
| Prazos e notificações | Objeto de prazo, vencimento, número/unidade de antecedência, responsáveis, destinatários e registro de envio. | 6–7, 21, 42–43, 50–51, 53, 61. |
| Viveiro | Viveiro, canteiro, espécie, muda e movimentos com quantidades. | 8, 19, 38, 41. |
| Arrecadação | Débito ambiental, sujeito, processo/licenciamento, valor calculado e referência da DUA. | 9, 45, 48. |
| Canais externos | Usuário do mesmo portal/site no desktop ou celular, denúncia, solicitação/interação e integração institucional. | 5, 18, 29–31, 36, 55–57, 60–61. |

São entidades conceituais, não nomes de tabelas impostos. Compartilhar um serviço não significa fundir conceitos diferentes nem dar a todo usuário acesso a toda informação. Para dados de outro módulo, prevalece a seção 1.4: destacar a fonte e usar o serviço disponível; não alterar a origem para completar este pacote.

### 3.2 Credenciamento, processo e documentos obrigatórios

O cadastro de tipos alimenta a lista de documentos exigidos. Mostrar o que falta antes de enviar e validar também no servidor. A simples gravação de rascunho não comprova protocolo: o envio completo deve originar um processo digital rastreável, suas peças e a caixa de entrada correspondente, uma única vez. Preservar a configuração aplicada à submissão para que mudança posterior dos requisitos documentais não reescreva o passado.

Usar o mecanismo de trâmite existente para encaminhar, receber/analisar e homologar, nas transições permitidas pelo fluxo escolhido. Validar permissão e versão da situação; duas sessões não podem homologar ou tramitar simultaneamente a mesma versão de modo contraditório. Guardar a trilha de origem/destino, autor e momento. Usuário externo pode interagir/enviar peças, mas não assumir competências de homologação interna.

Documentos pertencem ao processo real. Upload armazena bytes, metadados e vínculo. Uma peça em andamento entra na sequência sem apagar outras peças, sem recriar o processo e sem invalidar assinaturas de documentos já finalizados. Se upload falhar, não mostrar documento incorporado; se protocolo falhar, informar a situação sem gerar e-mail de sucesso. Não criar um novo motor de workflow ou outro GED se o atual suporta esses resultados.

### 3.3 Atividade → enquadramento automático → cálculo → DUA

Preservar quatro entregas distintas: **cadastrar a matriz** (22), **vincular as atividades** (3/13), **determinar automaticamente o enquadramento** (46) e **calcular automaticamente o valor** (9). Selecionar manualmente um enquadramento e digitar o valor não comprova a sequência.

O cálculo usa a mesma regra na simulação e no processo para os mesmos dados/versão. Guardar entradas, regra correspondente e resultado. Se nenhuma regra corresponder, ou regras igualmente aplicáveis conflitarem sem prioridade configurada, apresentar pendência explícita; não escolher a primeira silenciosamente nem assumir isenção. Revalidar a regra antes da confirmação. Alterar parâmetros de demonstração não altera débitos/documentos já emitidos sem operação controlada no módulo competente.

Usar o mecanismo já existente de matriz/valores/fórmulas, com decimais e validação. Não implementar um motor tributário paralelo ou codificar taxas municipais presumidas. A relação entre atividades secundárias e valor, limiares, critérios de enquadramento e vigência depende da matriz informada. Os valores da seção 5 são fixtures, não referência tributária real. A simulação não emite licença, DUA, débito ou homologação por si só.

A emissão de DUA (48) deve reutilizar o emissor/arrecadação adequado, conservando a ligação ao licenciamento e o valor. Uma tela de cálculo pode funcionar antes da definição do emissor; a DUA não fica validada por isso. Não inventar órgão arrecadador, código de receita, linha digitável, código de barras, QR de pagamento ou identificação bancária. Ver Q-02.

Para débitos (45), consultar a fonte efetiva de arrecadação para o envolvido selecionado; exibir os débitos ambientais e a crítica correspondente. Falha de consulta é **situação não verificada**, não ausência de débitos. A crítica não autoriza indeferir automaticamente um licenciamento sem regra definida.

### 3.4 E-mail e antecedência — envio demonstrável

Reutilizar serviço de e-mail e agendamento existentes. Há eventos separados: acesso (6/53), abertura/análise (7), vencimentos (42/43) e atualização/homologação (61). Consolidar mensagens do mesmo evento quando adequado, mantendo evidência de todos os IDs. Não enviar senha de produção em texto claro: usar o mecanismo de ativação/acesso existente, com link funcional e instruções suficientes.

O evento de envio só surge depois da operação confirmada. Guardar destinatário, objeto/evento, data programada, situação e referência do provedor; reexecução e retry não criam avisos duplicados para o mesmo evento/destinatário. Chaves de envio não devem eliminar um novo aviso legítimo após alteração válida de prazo. Falha de envio não deve apagar um processo já protocolado: mostrar pendência e permitir a recuperação pelo mecanismo existente.

Campos de antecedência precisam guardar **número e unidade: dias, meses ou anos**; não reduzir meses/anos a constantes de 30/365 dias. Usar calendário consistente, fuso e política documentada para fim do mês/dia inexistente. É decisão técnica deste plano preservar o dia quando possível e usar o último dia do mês de destino quando ele não existir. Não tratar isso como prazo legal definido no TR. Aplicar a mesma regra na tela e no agendador.

Em homologação, usar caixas de teste autorizadas e comprovar recebimento. Inspeção de payload em log não prova entrega de e-mail. Captura local de e-mail é teste técnico útil, mas deve ser rotulada como captura, sem alegar integração com provedor externo. Nenhum teste deve enviar notificações fictícias a munícipes reais. Os nomes de variáveis das caixas de teste não são endereços operacionais fornecidos por este MD.

### 3.5 Geografia — datum, marcação, delimitação e mapa

Não fundir quatro requisitos: escolher datum (26), marcar licenciamento sobre imagem de área/satélite (28), delimitar área (44) e mostrar os processos/situações em mapa (57). Uma lista com coluna de latitude não substitui nenhum mapa; um ponto não substitui uma delimitação de área.

Reutilizar o componente cartográfico e o catálogo de referências geográficas existentes. Guardar coordenadas originais e sua referência; identificar ordem dos eixos, unidades e a referência usada na visualização. Se houver conversão, usar operação suportada e testada, sem somente trocar o rótulo de datum. O TR não lista datums nem tolerâncias: registrar os que forem efetivamente suportados e confirmar o conjunto necessário em Q-04. Não aceitar um datum que o backend não saiba persistir/interpretar.

As camadas de imagem exigem fonte disponível e autorizada; não usar imagem estática com pin falso. Salvar e reabrir a geometria real do processo. Delimitação deve produzir área fechada/recuperável; validar geometria inválida em vez de gravar desenho incompleto como área. Não impor levantamento topográfico, CAD ou cálculo de APP por largura legal.

O cadastro de APPs/restrições (11) identifica locais e sua relação pertinente ao licenciamento. Sinalizar restrição cadastrada e permitir análise; não inferir proibição definitiva nem inventar buffer legal. Análise automática de sobreposição só é necessária se essa for a solução adotada para a relação, não é um novo motor obrigatório de decisão ambiental.

**Mapa e paginação são independentes:** todas as geometrias autorizadas do recorte devem ser alcançáveis no mapa, não só as dez linhas visíveis da lista. Consultar por extensão/agrupamento quando necessário, com contagens consistentes. Cores devem vir do estado real, com legenda textual. Processo sem coordenadas fica identificável como pendência de localização, sem pin aleatório; isso não dispensa completar sua posição quando ela for necessária à demonstração de “todos os processos”. Não colocar processos diferentes no centro do município para aparentar cobertura.

### 3.6 Parecer, modelo, assinatura digital e autenticidade

Parecer técnico e relatório ambiental devem ser redigíveis, persistidos, vinculados e gerados a partir do conteúdo real. Os modelos ambientais usam os serviços configuráveis do núcleo de documentos, são relacionados a tipos e escolhidos na impressão; se faltar a capacidade de origem, destacar DEP-04 em vez de desenvolver outro editor. Imagem inserida no relatório deve compor o documento, não apenas aparecer como anexo separado.

O processo contém versões identificadas. Assinar digitalmente (58) deve produzir a assinatura verificável com certificado sobre o arquivo efetivamente disponibilizado. Reutilizar a integração existente; não coletar chave privada/senha em logs nem colocá-las em fixture. Imagem de assinatura, nome digitado, hash isolado ou certificado fictício sem cadeia de confiança não comprovam assinatura válida. Um certificado de teste pode exercitar a mecânica, com essa limitação expressa; a validação final exige credencial/ambiente adequados.

Após assinar, não alterar os bytes para adicionar marca d'água, rodapé ou conteúdo: preparar tudo antes. Guardar o arquivo assinado e disponibilizar **essa mesma versão** no portal (56), com assinaturas e vínculo ao processo. Incluir uma nova peça não altera os documentos anteriores.

A autenticidade (59) identifica cada documento ambiental, não apenas o processo inteiro. Usar chave/identificação consultável e mecanismos de conferência existentes, relacionados à versão emitida. Autenticidade de emissão e validação criptográfica são verificações complementares, não sinônimos. Não anunciar “assinatura válida” apenas porque o hash da cópia coincide. Expor somente os dados permitidos na consulta, sem tornar todo processo público.

### 3.7 Mesmo site no Chrome do celular, website, portal e integração externa

**Implementação definida pelo usuário:** MEA-018 e MEA-036 serão executados no próprio site/portal do CeleriFlow aberto no **Chrome do celular**. MEA-031 usa o mesmo formulário web. Reaproveitar frontend, rotas, autenticação e backend; o layout responsivo adapta a apresentação, sem criar um novo aplicativo ou canal de dados.

No celular, devem funcionar de verdade o preenchimento/envio de denúncia, a confirmação/protocolo, a consulta dos licenciamentos e a atualização dos dados. Testar em aparelho real: sessão, toque, teclado virtual, rede, tratamento de falha e recarga. Os testes de MEA-018, MEA-031 e MEA-036 continuam registrados separadamente, mas podem usar os mesmos componentes e serviços. Não criar rastreamento de dispositivo/origem só para distinguir os testes; identificar o contexto na evidência.

Não exigir instalação, atalho na tela inicial, PWA instalável, manifesto, service worker, wrapper, publicação em loja ou projeto mobile separado. Uma captura de navegador estreito não basta como teste: executar as operações no Chrome do celular. **A decisão de arquitetura está fechada para este desenvolvimento; a redação do TR e a ressalva sobre aceitação formal permanecem em Q-03.**

Os formulários de denúncia precisam de conteúdo/localização suficiente ao registro, aproveitando o padrão existente. Foto, anonimato, geolocalização automática, GPS e regras de identificação não estão detalhados nesses dois itens: não torná-los novos requisitos obrigatórios nem importar outra política por suposição. Evitar exigir credenciamento ambiental de consultor para a simples denúncia se o canal existente não exige isso.

O portal mostra solicitações, licenças, assinaturas, peças e mapa de acordo com permissões e divulgação configuradas. A palavra “todos” do item 57 não autoriza vazamento de anexos sigilosos ou acesso por ID de outro usuário. Confirmar o escopo de publicação em Q-07 sem remover as consultas exigidas.

Integração externa (60) requer capacidade de intercâmbio real, mas o TR não identifica órgão, sistema ou contrato técnico. Destacar DEP-11: módulo/serviço de origem, dados utilizados e contrato disponível. Consumir a integração existente pelo lado ambiental; se faltar conector, contrato ou autorização, registrar a dependência em Q-06, sem desenvolver o módulo de origem ou criar conectores novos neste pacote. Um mock isolado comprova teste de contrato, não integração com um órgão. Não transmitir dados a produção para “testar”.

### 3.8 Viveiros e mudas

Manter espécie, cadastro de muda e canteiro identificáveis. Um cadastro não é saldo. Movimentos devem registrar muda, viveiro/canteiro pertinente, quantidade, natureza, data e origem/responsável disponíveis no ERP, atualizando a posição com transação e proteção a duplo envio. Reutilizar estoque/movimentação se compatível, sem herdar todas as telas de Almoxarifado ou exigir compra/NF para cada muda.

A demonstração-base usa entradas e saída, não acrescenta rotina autônoma de remanejamento, produção agrícola ou reserva. Não alterar saldo editando o cadastro. Se já houver transferência de canteiros, preservar a conservação do total; ela não é uma nova exigência numerada deste plano.

<a id="ux"></a>
## 4. Interface ERP profissional — mesma diretriz da REV02 [UX]

### 4.1 Composição e tipografia

Preservar o shell, a identidade e os componentes do CeleriFlow. Organizar listagens como **título/contexto + busca/filtros + tabela + paginação/ações**. No desktop, priorizar uma área de trabalho sem rolagem global, ajustando o número de linhas ao espaço real. Não criar dashboard de indicadores grandes para substituir caixa de entrada ou alerta de processos pendentes.

| Elemento | Tamanho / entrelinha de referência | Peso |
|---|---|---|
| Título da página | 20 / 26 px | 600 |
| Título de seção | 16 / 22 px | 600 |
| Tabela, campo, filtro, botão e erro | 14 / 20 px | 400; cabeçalhos/ênfase 600 |
| Metadado secundário | 12 / 16 px | 400 |

Estes são **parâmetros de projeto reutilizados da REV02**, não dimensões do TR nem afirmação de padrão universal de ERP. Manter a família atual quando consistente; na ausência de padrão, usar fonte de sistema com preferência por Segoe UI e alternativas sans-serif. Aplicar tokens equivalentes em `rem`, sem reduzir artificialmente a raiz global. Não baixar/distribuir fontes nem introduzir framework visual novo.

Referência de controles/linhas: mínimo aproximado de 36 px no desktop; 44 px no toque; espaçamentos de 4/8/12/16/24 px. Usar altura mínima, não altura rígida que corte conteúdo. Números e valores alinhados à direita, unidade/moeda identificadas; datas/estados consistentes. No mobile, referência de fonte de campos de 16 px e alvos confortáveis. Rótulos e erros não dependem apenas de tooltip; cores de situação têm texto/legenda. Adotar contraste de texto comum de pelo menos 4,5:1 como meta de UX já definida, com foco visível, sem declarar certificação de acessibilidade por causa desses números.

### 4.2 Paginação, mapa e formulários

Começar com 10 registros por página no viewport menor; reduzir se a área útil não comportar dez linhas legíveis. Consultar paginação/filtro/ordenação e total no servidor com escopo. Busca não se limita à página carregada. Ao abrir uma ficha e voltar, preservar busca e página; mudança de filtro volta à primeira. Informar o intervalo real, por exemplo “1–10 de 27”. Não criar linhas falsas para preencher a grade.

Relatórios abrangem o recorte inteiro, não só a página. A juntada de documentos em várias páginas continua totalmente acessível; a impressão de vários modelos deve incluir todos os selecionados, mesmo fora da página atual. A seleção para qualquer ação indica seu alcance sem aplicar alterações silenciosas a outra página.

Organizar fichas em abas/seções: dados, atividades/enquadramento, geografia, documentos, tramitação e prazos, conforme pertinentes. São divisões visuais, não aprovações novas. Salvar valida todas as partes; erro em outra aba aponta sua localização. Não perder rascunho ao trocar aba. Formulários simples de cadastro não precisam virar wizards.

Mapa pode ter aba própria ou área reservada com lista compacta. Pan/zoom no mapa são interações necessárias, não defeito de “rolagem”. O mapa de processos é exigido mesmo que uma tabela seja mais compacta. Documentos, relatório extenso com imagens, leitura de peças, largura pequena e zoom podem usar uma região de rolagem vertical com ações acessíveis. Não usar `overflow: hidden` para esconder conteúdo, não cortar anexos e não diminuir a fonte operacional para 10–11 px.

### 4.3 Grupos de telas — mapear às rotas existentes

| Grupo conceitual | Conteúdo e ação | Rastreabilidade principal |
|---|---|---|
| Parâmetros ambientais | Atividades, tipos de potencial, matriz, tipos de credenciado e exigências documentais. | 3–4, 9, 12–13, 22, 24, 37, 39–40, 46, 53. |
| Credenciamento/consultores | Solicitação, anexos, lista de credenciados, acesso, análise e aceite. | 5–7, 14, 16–17, 29, 32, 54. |
| Caixa de entrada/processos | Pendências reais, trâmite, peças, homologação e histórico. | 20, 33, 52, 58, 61–63. |
| Licenciamento/solicitações | Tipo documental, interessado, atividades, enquadramento, valor, débitos, DUA e responsabilidade técnica. | 3–4, 9, 13, 15, 25, 30, 35, 45–46, 48–49, 55. |
| Geografia | Datum, localização, APPs/restrições, marcação, delimitação e situação colorida. | 1, 11, 26, 28, 44, 57. |
| Documentos/pareceres | Modelos, relatório com imagens, impressão, assinatura, publicação e autenticidade. | 2, 23, 27, 34, 47, 56, 58–59, 62–63. |
| Prazos | Condicionantes, licenças/outros documentos, antecedência e destinatários. | 21, 42–43, 50–51. |
| Viveiros | Canteiros, espécies, mudas, movimento e posição. | 8, 19, 38, 41. |
| Site/portal responsivo — desktop e Chrome do celular | Mesmas páginas de denúncia, simulação, consulta e interação sobre registros reais. | 5, 18, 29–31, 35–36, 55–57, 59, 61. |
| Dependências compartilhadas | Destacar origem dos dados e consumir o serviço existente; sem desenvolver módulos de origem. | 1, 6–7, 42–43, 48, 53, 56, 58, 60. |

Não é obrigatório criar um menu novo para cada linha. Configurações podem pertencer ao núcleo; a função deve estar encontrável no contexto da POC.

### 4.4 Aceite de UX e eficiência

Testar viewport CSS **1366×650, 1440×800 e 1920×900**, além do equipamento de apresentação. Testar zoom/texto ampliado a 200%, largura de 320 CSS px no portal e operação real do mesmo site no Chrome do celular, inclusive com teclado virtual aberto. Teclado deve alcançar filtros, paginação, anexos e confirmações, com foco preservado. Não prometer “zero rolagem” sob todas as condições; preservar conteúdo tem prioridade.

A eficiência deve resultar de dados herdados do credenciamento, documentos reutilizados, enquadramento/cálculo automáticos, trâmite com histórico e mensagens disparadas pelo evento real. Não pedir a mesma informação em cada tela. Exibir carregamento, vazio, erro e sucesso distintamente; sucesso somente após confirmação real.

Como metas iniciais de projeto herdadas da REV02: retorno visual de processamento em até 200 ms e consulta paginada em até 1,5 s no percentil 95, registrando volume, rede, amostra e ambiente. Não são exigências do TR nem medições já realizadas. Processamentos externos demorados devem mostrar seu estado; não fingir que assinatura, e-mail ou DUA foram concluídos para atingir a meta de tela.

<a id="base"></a>
## 5. Base fictícia coerente de homologação

### 5.1 Pessoas, papéis e documentos

Usar órgão/ambiente **“POC — dados fictícios”**. Nomes, coordenadas, regras e valores abaixo são de demonstração e não representam empreendimento real nem decisão da prefeitura. O usuário vai popular a base; o agente deve fornecer formulários funcionais e, somente se útil, fixtures/seed de teste protegido contra produção. Não é necessário desenvolver um importador.

| Código de ensaio | Registro | Uso |
|---|---|---|
| PESS-CONS-A | Ana Ribeiro — Consultora DEMO | Credenciamento de consultora e recebimento dos próprios avisos. |
| PESS-EMP-A | Empreendimento Horizonte — DEMO | Interessado/licenciado principal. |
| PESS-EMP-B | Empreendimento Bosque — DEMO | Outro interessado, usado em teste de isolamento e débito. |
| USR-TEC-A | Técnica ambiental — DEMO | Análise/homologação nas permissões configuradas. |
| USR-SETOR | Secretaria ambiental — DEMO | Caixa e acompanhamento autorizado. |
| T-CONS / T-EMP | Tipos demonstrativos de credenciado | Não são automaticamente PF/PJ; reaproveitar a classificação de pessoa existente. |
| DOC-ID-DEMO / DOC-HAB-DEMO | Tipos de documentos de credenciamento | Na fixture T-CONS exige ambos; T-EMP exige DOC-ID-DEMO. A exigência real depende da definição administrativa. |
| PROC-CRED-A | Processo de credenciamento da consultora | Anexos, análise, aceite e avisos de acesso. |
| PROC-LIC-A | Processo de licenciamento do interessado A | Atividades, documentos, mapa, cálculo, assinatura e consulta. |
| PROC-ANU-A | Solicitação de Anuência DEMO | Provar que a solicitação/documentação não se limita à licença. |
| CX-CONS / CX-EMP / CX-TEC | Caixas de e-mail de teste | Substituir por endereços controlados/autorizados; não usar endereços de terceiros. |

Os arquivos de identificação, parecer, fotografia e responsabilidade técnica devem conter aviso de demonstração. Não inventar número de registro de conselho, selo oficial ou autorização de órgão externo. Usar os validadores reais com dados sintéticos apropriados, sem desativá-los na aplicação de produção.

**Fluxo de ensaio:** envio completo → em análise → homologado, com interação externa e juntada de documento durante a análise. É exemplo configurado para os testes, não fluxo oficial prescrito. Se o CeleriFlow já tiver estrutura equivalente, usá-la. Não obrigar etapas adicionais de pagamento, publicação ou vistoria sem fonte.

### 5.2 F-ENQ — matriz demonstrativa e cálculo automático

Atividades A-01 e A-02 têm descrições explicitamente fictícias. PB e PM são tipos de potencial poluidor **demonstrativos**, sem afirmar que representam a classificação municipal. Utilizar entradas distintas da matriz que discriminem a combinação completa; não presumir uma soma de tributos para atividades secundárias.

| Regra de fixture | Atividade principal | Atividades secundárias | Potencial | Enquadramento resultante | Valor final de teste |
|---|---|---|---|---|---:|
| R1 | A-01 | Nenhuma | PB | E-DEMO-01 | R$ 240,00 |
| R2 | A-01 | A-02 | PB | E-DEMO-02 | R$ 320,00 |
| R3 | A-01 | Nenhuma | PM | E-DEMO-03 | R$ 480,00 |

Testar R1 na simulação; adicionar A-02 e obter R2. Em outro ensaio, retirar A-02, mudar PB para PM e obter R3. O processo com dados de R2 deve obter automaticamente E-DEMO-02 e R$ 320,00, iguais à simulação. O valor R$ 320,00 é a saída configurada na fixture, não aplicação de uma lei nem soma calculada presumida de atividades.

Usar uma combinação sem regra e uma matriz ambígua em testes isolados: a aplicação deve identificar a pendência, não usar zero/primeira regra. Não criar um novo gerenciador de fórmulas caso a matriz existente já suporte o resultado necessário. Esses testes não determinam como enquadrar um empreendimento real.

**Dados de outro módulo — DEP-06:** para este ensaio, o usuário deve preparar pelas rotinas existentes de Tributos/Arrecadação um débito ambiental demonstrativo de R$ 80,00 para PESS-EMP-B; PESS-EMP-A sem débito pendente nesse recorte. Conferir a crítica de B, a ausência real para A e a distinção de falha de consulta. A DUA de PROC-LIC-A deve referenciar seus R$ 320,00, não incorporar o débito de outra pessoa. Não somar débitos anteriores ao documento de arrecadação sem regra definida.

### 5.3 F-CRED/F-DOC — credenciamento, parecer, licença e peças

Submeter T-CONS inicialmente sem DOC-HAB-DEMO: mostrar a exigência. Anexar os dois arquivos, enviar uma única vez e abrir o processo interno. O técnico abre os documentos e homologa pelo fluxo de ensaio. Confirmar envio/recebimento do aviso e acesso pelo link com a conta externa.

No licenciamento, solicitar Licença DEMO; em outro documento, Anuência DEMO. Cadastrar um parecer e um relatório com **duas imagens distintas** e legendas demonstrativas. Criar dois modelos para o mesmo tipo e um para o outro tipo; associar os modelos e escolher/imprimir mais de um. Nenhum texto prévio obriga modelos oficiais ainda não fornecidos.

Preparar **13 peças** identificáveis em PROC-LIC-A para testar três páginas de 5, ou duas páginas de 10, conforme a tabela usada. Guardar a quantidade anterior N e incluir uma nova peça: total N+1. Os arquivos de teste podem ser pequenos; não acrescentar tipos documentais obrigatórios por causa da quantidade da fixture.

Assinar um documento por certificado/serviço autorizado no ambiente de teste, registrar versão e identificação, disponibilizar o mesmo arquivo no portal e verificar sua autenticidade. Comparar a versão interna com o download externo. Alterar uma cópia local e comprovar que ela não é tratada como o original assinado. Não modificar o documento oficial de teste apenas para realizar o cenário negativo.

### 5.4 F-GEO — geometrias e mapa

Escolher datum e referência **realmente suportados** pelo componente existente. Preparar duas fixtures técnicas com referências geográficas distintas e resultados de conversão conferidos quando houver conversão; registrar valores e origem dessas fixtures no relatório do agente. Este MD não inventa equivalência numérica de datums.

Na referência selecionada para o teste, preparar pontos de três processos, uma área delimitada para PROC-LIC-A e um local identificado “APP DEMO — não oficial”. Identificar coordenadas como demonstração e não como cadastro oficial do município. Salvar os pontos/área sobre camada de imagens disponível. Reabrir e verificar a mesma posição. O cadastro de APP deve ser relacionável à análise; não equivale a demarcação ambiental legal.

Criar **23 processos geolocalizados de teste** no escopo autorizado: 8 em análise, 9 em situação de homologação definida no ensaio e 6 concluídos conforme esse fluxo. Com paginação de 10 na lista, o mapa deve representar o conjunto de 23, não somente 10. Ao filtrar “Em análise”, lista e mapa devem corresponder aos 8. Mudar um dos 8 para o outro estado no teste: ficam 7 em análise, 10 no segundo estado e 6 no terceiro. Nenhuma cor pode ser estática e desvinculada da situação persistida.

Separadamente, usar um processo sem localização para testar tratamento explícito dessa falta. Não misturá-lo ao conjunto de 23 da comprovação cartográfica.

### 5.5 F-PRAZOS — antecedência e e-mails sem duplicação

Relógio controlado do ensaio: **18/09/2026**. Usar injeção de data apenas em testes ou ambiente de homologação, não mudar a data global de produção. Para cada objeto, cadastrar destinatário externo CX-EMP e interno CX-TEC. Demonstrar dias, meses e anos em condicionantes **e** licenças/documentos.

| Objeto de prazo de teste | Vencimento | Antecedência | Data esperada de aviso |
|---|---|---|---|
| COND-D | 28/09/2026 | 10 dias | 18/09/2026 |
| COND-M | 18/10/2026 | 1 mês | 18/09/2026 |
| COND-A | 18/09/2027 | 1 ano | 18/09/2026 |
| LIC-D | 28/09/2026 | 10 dias | 18/09/2026 |
| LIC-M | 18/10/2026 | 1 mês | 18/09/2026 |
| LIC-A | 18/09/2027 | 1 ano | 18/09/2026 |

No modelo de teste de um envio por objeto/destinatário: **6 objetos × 2 destinatários = 12 entregas esperadas**. Se o provedor agrupa destinatários, conferir doze destinatários-objeto, não presumir que haja doze mensagens no sistema. Reexecutar a mesma janela não duplica os avisos concluídos. Usar um documento de outra natureza em cenário separado para comprovar o trecho “qualquer outro documento” do item 43.

Incluir um vencimento fora da janela e um envio que falha. O primeiro não é avisado antes do programado; o segundo permanece pendente/falho, nunca entregue ficticiamente. Não renovar licença ou aprovar condicionante automaticamente ao enviar lembrete.

### 5.6 F-VIVEIRO — catálogo e movimentação

Viveiro V-DEMO, canteiros C-A e C-B. Muda M-A associada à espécie demonstrativa “Ipê-amarelo — DEMO”, muda M-B à espécie “Quaresmeira — DEMO”. Não impor classificação científica ou certificação botânica.

| Operação | Posição de M-A em C-A | Posição de M-B em C-B |
|---|---:|---:|
| Entradas iniciais de teste registradas | 100 | 40 |
| Entrada de mais 20 M-A | 120 | 40 |
| Saída de 30 M-A | 90 | 40 |

Esperado: **90 M-A, 40 M-B, 130 mudas no viveiro**. Repetir a confirmação da saída não gera 60 unidades de saída. Mudar nome cadastral da espécie não deve mudar o saldo. Um cadastro de muda novo sem movimento inicia sem saldo artificial.

### 5.7 F-CANAIS e reinício dos ensaios

Abrir o mesmo site no Chrome do celular e registrar DEN-MOB-DEMO; no navegador do computador, enviar DEN-WEB-DEMO com outro texto. Usar o mesmo formulário, serviços e base; distinguir dispositivo/contexto no registro de evidência, sem criar campo de canal novo obrigatório. No Chrome do celular, consultar a licença emitida no fluxo web e conferir a mesma situação após atualização. Usuário de outro interessado não deve receber as peças privadas desse processo. Não há instalação de aplicativo como passo do ensaio.

Executar integração externa e DUA pelos serviços já existentes apenas em ambiente autorizado com contrato/configuração adequados. Quando faltar o serviço do ERP, registrar `DEPENDENCIA_OUTRO_MODULO`; quando o impedimento for órgão/provedor/credencial externos, registrar `BLOQUEADO_EXTERNO`. Destacar a falta, sem desenvolver o módulo de origem. Mock/arquivo demonstrativo pode apoiar teste de unidade, mas não comprova órgão externo, DUA válida ou assinatura confiável.

Preparar cenários isolados quando um depende de estado anterior. Registrar condições iniciais; fixtures devem ser idempotentes e separadas de dados reais. Não apagar histórico na aplicação para repetir a POC. Dados fictícios podem ser realistas, mas devem permanecer explicitamente fictícios.

---
<a id="itens"></a>
## 6. Desenvolvimento item a item — os 63 requisitos do TR

Em cada item, **Implementação**, **Demonstração** e **Aceite técnico** são instruções de desenvolvimento/ensaio; somente a citação **TR** é reprodução da exigência. **Atenção/limite** impede interpretar escolhas auxiliares como regra oficial. Uma funcionalidade compartilhada conserva evidência para cada ID correspondente.


<a id="mea-001"></a>
### MEA-001 — Preenchimento da localização pelo CEP

**TR — GESTÃO DE MEIO AMBIENTE, item 1, p. 151:**

> Ao digitar o CEP retornar com as informações de localização;

**Dados de outro módulo / serviço compartilhado:** DEP-01 — Endereços/consulta CEP existente: localização retornada. Confirmar a fonte real; não criar novo serviço de CEP.

**Implementação:** Reaproveitar a consulta de CEP do cadastro de endereços. Ao informar CEP válido, consultar a fonte configurada e preencher os campos de localização retornados. Preservar número/complemento quando não forem fornecidos pela consulta e impedir que resposta atrasada sobrescreva um CEP posteriormente alterado.

**Demonstração:** Informar um CEP conhecido pela fonte de teste, conferir logradouro/bairro/município/UF efetivamente retornados, completar número e salvar. Trocar o CEP; testar inexistente e indisponibilidade.

**Aceite técnico:** Campos retornados são preenchidos e persistem. Erro de consulta é informado; não aparece endereço fixo para qualquer CEP.

**Atenção/limite:** CEP não comprova delimitação nem localização exata do empreendimento. Não impor provedor comercial ou geocodificação automática não pedidos. **Q-08: fonte de CEP.**


<a id="mea-002"></a>
### MEA-002 — Parecer técnico e relatório ambiental

**TR — GESTÃO DE MEIO AMBIENTE, item 2, p. 151:**

> Deixar cadastrar parecer técnico, deixar montar seu relatório ambiental;

**Dados de outro módulo / serviço compartilhado:** DEP-03/04 — Processo e GED/relatórios: ID do processo, conteúdo, imagens, modelos e arquivo gerado. Parecer e relatório ambiental continuam neste escopo.

**Implementação:** Na ficha/processo ambiental, permitir cadastrar parecer técnico e compor relatório ambiental com conteúdo editável, autoria e vínculo ao processo. Reutilizar editor, modelos e geração existentes; salvar conteúdo e gerar documento real.

**Demonstração:** Em PROC-LIC-A, redigir parecer de análise demonstrativa e montar relatório com identificação do processo, texto de análise e conclusão fictícia. Salvar, reabrir e gerar o relatório.

**Aceite técnico:** Parecer e relatório ficam recuperáveis no processo; alteração do conteúdo é refletida na versão gerada correspondente. Não há PDF estático de exemplo.

**Atenção/limite:** Parecer não homologa o processo automaticamente. Imagens do relatório são detalhadas no MEA-047; não criar um segundo editor.


<a id="mea-003"></a>
### MEA-003 — Atividades ligadas ao licenciamento e ao enquadramento

**TR — GESTÃO DE MEIO AMBIENTE, item 3, p. 151:**

> Deixar relacionar as atividades ao licenciamento ambiental, bem como estar relacionado ao enquadramento para cálculo do valor dos tributos referentes ao licenciamento ambiental;

**Implementação:** Vincular atividades do cadastro ao licenciamento e à matriz de enquadramento usada para calcular o tributo. A operação deve guardar referências estruturadas, não apenas descrever a atividade em observação. Compartilhar o motor dos itens 9/22/46.

**Demonstração:** Em F-ENQ, selecionar A-01 em PROC-LIC-A e verificar a correspondência configurada R1; relacionar A-02 conforme MEA-013 e conferir R2, enquadramento e valor.

**Aceite técnico:** Licenciamento, atividades, enquadramento e cálculo têm vínculos consultáveis e coerentes. Dados iguais na mesma versão da regra resultam no mesmo enquadramento.

**Atenção/limite:** Critérios e tratamento das atividades secundárias vêm da matriz, não de taxa ou fórmula presumida pelo agente. **Q-01: matriz e regras.**


<a id="mea-004"></a>
### MEA-004 — Potencial poluidor vinculado ao licenciamento

**TR — GESTÃO DE MEIO AMBIENTE, item 4, p. 151:**

> Deixar relacionar o cadastro do tipo do potencial poluidor ao licenciamento ambiental;

**Implementação:** Permitir relacionar o tipo do potencial poluidor cadastrado ao licenciamento. Mostrar a descrição do tipo e conservar seu identificador; reaproveitar os tipos do MEA-040 e a dependência que a matriz efetivamente usar.

**Demonstração:** Selecionar PB em um licenciamento de teste, salvar e reabrir. Em outro cenário não emitido, selecionar PM e verificar o vínculo, sem alterar uma licença já assinada.

**Aceite técnico:** O tipo selecionado persiste e pode ser recuperado na análise e no enquadramento quando integrar os critérios configurados.

**Atenção/limite:** Não criar classificação automática de risco por IA nem impor tipos oficiais que não foram fornecidos. **Q-01: classificação aplicada.**


<a id="mea-005"></a>
### MEA-005 — Lista de consultores credenciados

**TR — GESTÃO DE MEIO AMBIENTE, item 5, p. 151:**

> Disponibilizar lista de consultores para que os empreendedores e outros possam consultar os consultores já credenciados no município;

**Dados de outro módulo / serviço compartilhado:** DEP-01/08 — Pessoas e portal: identificação/dados divulgáveis do consultor e canal existente. A situação de credenciamento vem do cadastro ambiental/processo vinculado.

**Implementação:** Disponibilizar consulta paginada dos consultores com credenciamento aceito, no canal de consulta previsto para empreendedores e demais interessados. Reutilizar a mesma base do credenciamento; expor apenas dados próprios dessa divulgação.

**Demonstração:** Cadastrar um consultor homologado e outro ainda em análise. Acessar a lista como interessado; encontrar o homologado e verificar que o pendente não é apresentado como já credenciado.

**Aceite técnico:** Lista consulta registros reais e seu estado vigente; não depende de cadastro manual paralelo para publicar o consultor.

**Atenção/limite:** Confirmar campos/alcance da divulgação. Não publicar documentos pessoais do credenciamento nem adicionar avaliações comerciais de consultores. **Q-07: acesso/divulgação.**


<a id="mea-006"></a>
### MEA-006 — Envio de link e informações de acesso

**TR — GESTÃO DE MEIO AMBIENTE, item 6, p. 151:**

> Enviar link, bem como informações de acesso ao credenciado;

**Dados de outro módulo / serviço compartilhado:** DEP-01/02/07 — Pessoa, acesso e e-mail: nome, destinatário, vínculo externo, link e resultado real de envio. Sem nova autenticação.

**Implementação:** Usar o serviço de acesso/convite existente para enviar ao credenciado link funcional e instruções suficientes. Integrar com o cadastro e o e-mail do item 53; registrar envio sem expor senha permanente ou chave de ativação nos logs.

**Demonstração:** Credenciar PESS-CONS-A na base de teste, receber a mensagem em CX-CONS, abrir o link e acessar o perfil correspondente. Testar link inválido/expirado conforme o mecanismo existente.

**Aceite técnico:** A mensagem chega ao destinatário controlado e o link conduz ao acesso correto. A conta não recebe privilégios internos.

**Atenção/limite:** Reutilizar a mesma mensagem de MEA-053 quando cobrir ambos. Não criar outro sistema de autenticação. **Q-08: e-mail e acesso.**


<a id="mea-007"></a>
### MEA-007 — E-mail de abertura e análise do processo

**TR — GESTÃO DE MEIO AMBIENTE, item 7, p. 151:**

> Envio de e-mail para o credenciado informando que seu processo foi aberto está sobre analise;

**Dados de outro módulo / serviço compartilhado:** DEP-01/03/07 — Contato, processo e e-mail: destinatário, número, situação e resultado de envio. Não recriar o processo nem a infraestrutura de mensagens.

**Implementação:** Após abertura efetiva do processo e encaminhamento à análise no fluxo adotado, enviar ao credenciado aviso com referência e situação verdadeira. Não enviar antes do protocolo nem declarar análise iniciada em um rascunho.

**Demonstração:** Enviar PROC-CRED-A completo; verificar a caixa interna e receber em CX-CONS o aviso de processo aberto/em análise. Repetir o mesmo evento técnico e conferir ausência de duplicação.

**Aceite técnico:** Mensagem, número do processo e situação correspondem à base. Falha no envio é rastreável e não aparece como entrega concluída.

**Atenção/limite:** A frase do TR é preservada; não inventar SLA de análise ou enviar comunicação a endereço real não autorizado. **Q-08: e-mail; Q-07: fluxo.**


<a id="mea-008"></a>
### MEA-008 — Movimentação de mudas em viveiros

**TR — GESTÃO DE MEIO AMBIENTE, item 8, p. 151:**

> Fazer controle de movimentação de mudas em viveiros;

**Dados de outro módulo / serviço compartilhado:** DEP-09, somente se já adotada — estoque/catálogo: identificador de muda/material, local, movimentos e saldo. Não impor Almoxarifado como nova dependência.

**Implementação:** Registrar movimentos reais de entrada/saída de mudas, com viveiro/canteiro, muda/espécie, quantidade e data pertinentes. Atualizar a posição e o histórico atomicamente, reutilizando serviço de estoque compatível.

**Demonstração:** Executar F-VIVEIRO: 100 M-A e 40 M-B de abertura por entradas registradas; entrar 20 M-A e sair 30. Consultar posição e repetir a confirmação da saída.

**Aceite técnico:** Restam 90 M-A e 40 M-B, total 130. Repetição não baixa novamente e recarga mantém os resultados. Não há movimento sem reflexo na posição.

**Atenção/limite:** Não acrescentar produção agrícola, irrigação, adubação, compra/NF obrigatória ou importação em massa para demonstrar o controle.


<a id="mea-009"></a>
### MEA-009 — Cálculo automático do tributo ambiental

**TR — GESTÃO DE MEIO AMBIENTE, item 9, p. 152:**

> No que tange o cálculo do tributo ambiental o valor do mesmo deve ser baseado automaticamente no seu enquadrado pré-definido;

**Implementação:** Executar o cálculo/obtenção do valor a partir do enquadramento pré-definido na matriz configurada. Usar valores decimais e memória do resultado; não solicitar digitação manual como substituto do cálculo automático.

**Demonstração:** Na fixture R2, gerar o enquadramento E-DEMO-02 e valor R$ 320,00; comparar à simulação. Testar regra ausente e reenvio da mesma operação.

**Aceite técnico:** Valor é determinado automaticamente pela regra correta. Regra ausente/conflitante gera pendência identificada, não isenção ou valor inventado.

**Atenção/limite:** A regra demonstrativa não comprova correção tributária municipal. Este item não equivale à emissão de DUA. **Q-01: matriz e valores.**


<a id="mea-010"></a>
### MEA-010 — Visibilidade conforme autorização do usuário

**TR — GESTÃO DE MEIO AMBIENTE, item 10, p. 152:**

> O usuário visualizará somente as opções do sistema para as quais ele foi autorizado;

**Dados de outro módulo / serviço compartilhado:** DEP-02 — Administração/autenticação: usuário, escopo e permissões. Aplicar no módulo ambiental; não recriar o gestor de acesso.

**Implementação:** Mapear permissões existentes a menus, abas e ações ambientais. Renderizar apenas opções autorizadas e aplicar os mesmos controles no servidor para leitura, gravação, documentos e geometrias.

**Demonstração:** Entrar como interessado, consultor e técnico. Conferir opções visíveis; tentar acessar por URL/API a homologação e documentos de outro interessado com a conta externa.

**Aceite técnico:** A conta externa não vê a ação interna nem consegue executá-la diretamente. A conta autorizada continua conseguindo trabalhar no seu escopo.

**Atenção/limite:** Não criar novos perfis obrigatórios quando os atuais suportarem as permissões. Ocultar botão sozinho não comprova o controle.


<a id="mea-011"></a>
### MEA-011 — Cadastro de APPs e locais com restrições

**TR — GESTÃO DE MEIO AMBIENTE, item 11, p. 152:**

> Permitir cadastrar locais de APPs ou outros do tipo que possam restringir ação do licenciamento ambiental;

**Dados de outro módulo / serviço compartilhado:** DEP-10, se compartilhado — referência/localização e mapa existentes. O cadastro de APP/restrição é ambiental, não importação obrigatória de outro módulo.

**Implementação:** Permitir cadastrar local de APP ou outra restrição, com identificação/localização e informação da restrição a considerar. Tornar esse local relacionável/consultável na análise do licenciamento, reutilizando a geografia existente.

**Demonstração:** Criar “APP DEMO — não oficial”, localizar no cadastro/mapa e relacionar à análise de PROC-LIC-A. Reabrir o processo e consultar a restrição registrada.

**Aceite técnico:** O local e sua relação com a análise persistem e são visíveis ao técnico. O cadastro não é apenas texto sem localização recuperável.

**Atenção/limite:** Não inferir faixas legais, limites oficiais, sobreposição obrigatória ou indeferimento automático. Confirmar a definição de uso administrativo. **Q-04: referência/camada; Q-07: restrição.**


<a id="mea-012"></a>
### MEA-012 — Tipos de documentos exigidos por tipo de pessoa credenciada

**TR — GESTÃO DE MEIO AMBIENTE, item 12, p. 152:**

> Permitir definir tipo de documentos digitais que serão necessários de acordo com tipo de pessoa credenciada;

**Dados de outro módulo / serviço compartilhado:** DEP-01/04 — Tipo de pessoa quando aplicável e tipos documentais existentes. A relação de exigências por credenciado é configurada em Meio Ambiente.

**Implementação:** No cadastro de exigências, relacionar tipos documentais ao tipo de pessoa/credenciado adotado, indicando obrigatoriedade segundo a configuração. Reutilizar a mesma matriz documental dos itens 24/39/53/54.

**Demonstração:** Configurar T-CONS exigindo DOC-ID-DEMO e DOC-HAB-DEMO; T-EMP exige DOC-ID-DEMO. Iniciar os dois credenciamentos e comparar as exigências.

**Aceite técnico:** A lista varia conforme o tipo selecionado, com vínculos estruturados e persistidos; não é uma lista única hardcoded.

**Atenção/limite:** Tipo de pessoa e categoria do credenciado precisam de mapeamento explícito. Não impor documentos ou registros profissionais que o TR não enumera. **Q-07: tipos e exigências.**


<a id="mea-013"></a>
### MEA-013 — Atividades secundárias no licenciamento

**TR — GESTÃO DE MEIO AMBIENTE, item 13, p. 152:**

> Permitir incluir atividades secundários ao licenciamento ambiental;

**Implementação:** Permitir incluir mais de uma atividade secundária usando o cadastro de atividades, distinguindo-as da principal. Persistir os vínculos sem duplicatas e encaminhar o conjunto ao enquadramento conforme a matriz.

**Demonstração:** Adicionar A-02 como secundária à A-01 em F-ENQ; reabrir e conferir R2. Tentar adicionar novamente A-02 e testar a atualização antes da emissão.

**Aceite técnico:** Atividade principal e secundárias ficam identificáveis e participam dos dados usados pela regra quando configurado. Não são perdidas ao reabrir.

**Atenção/limite:** Não presumir soma de taxas, maior taxa ou cobrança única para atividades secundárias: usar a regra definida. **Q-01: combinação de atividades.**


<a id="mea-014"></a>
### MEA-014 — Documentos digitais no credenciamento do consultor

**TR — GESTÃO DE MEIO AMBIENTE, item 14, p. 152:**

> Permitir na hora do consultor realizar seu credenciamento incluir documentos digitais caso este seja necessário;

**Dados de outro módulo / serviço compartilhado:** DEP-01/04 — Pessoa, armazenamento/GED: identidade, tipo de arquivo, conteúdo e referência do anexo. Não manter repositório documental paralelo.

**Implementação:** Oferecer anexação dos documentos exigidos/permitidos durante o credenciamento do consultor, com tipo, arquivo e vínculo à solicitação. Usar o armazenamento/GED existente e manter o estado da anexação.

**Demonstração:** Em F-CRED, anexar DOC-ID-DEMO e DOC-HAB-DEMO ao pedido da consultora; reabrir e visualizar ambos antes de enviar.

**Aceite técnico:** Arquivos têm conteúdo recuperável e pertencem ao credenciamento correto; falha de upload não é apresentada como documento entregue.

**Atenção/limite:** Compartilhar com MEA-017 e MEA-054. Não criar uma segunda base de arquivos só para consultores.


<a id="mea-015"></a>
### MEA-015 — Solicitação de licenças, anuências e outros documentos

**TR — GESTÃO DE MEIO AMBIENTE, item 15, p. 152:**

> Permitir o credenciado realizar a solicitação de documentos necessários, como licenças, anuências, etc;

**Dados de outro módulo / serviço compartilhado:** DEP-01/03/04/08 — Interessado, processo, tipos documentais e sessão do portal existentes; manter os vínculos sem redigitação.

**Implementação:** No acesso do credenciado, permitir solicitar tipos de documentos ambientais cadastrados, incluindo licença e anuência. Reaproveitar identidade/dados do credenciamento e relacionar a solicitação ao processo digital.

**Demonstração:** PESS-EMP-A solicita Licença DEMO em PROC-LIC-A e, em pedido distinto, Anuência DEMO. Consultar a chegada à Secretaria e a situação no portal.

**Aceite técnico:** As duas solicitações são persistidas, têm tipos distintos e ficam acompanháveis sem redigitação interna.

**Atenção/limite:** Não emitir automaticamente o documento só porque foi solicitado. Campos e documentos adicionais dependem do tipo configurado. **Q-07: tipos/fluxo.**


<a id="mea-016"></a>
### MEA-016 — Visualização dos anexos pelo técnico para homologação

**TR — GESTÃO DE MEIO AMBIENTE, item 16, p. 152:**

> Permitir o técnico visualizar os anexos para poder homologar o credenciamento;

**Dados de outro módulo / serviço compartilhado:** DEP-02/03/04 — Permissão do técnico, processo e bytes dos anexos entregues. Homologação utiliza a operação existente.

**Implementação:** Na análise do credenciamento, permitir ao técnico abrir os documentos entregues com sua referência/tipo e identificar o requerente. Vincular a análise ao aceite permitido pelo fluxo, sem um visualizador separado da origem.

**Demonstração:** O técnico abre DOC-ID-DEMO e DOC-HAB-DEMO de PROC-CRED-A, verifica o conteúdo e realiza o aceite no estado permitido.

**Aceite técnico:** Os bytes acessados são os anexados pelo consultor e a homologação refere-se àquela solicitação. Usuário sem permissão não acessa os arquivos.

**Atenção/limite:** Homologar não é validar automaticamente o conteúdo profissional do documento; não criar aprovação por IA. **Q-07: fluxo de homologação.**


<a id="mea-017"></a>
### MEA-017 — Anexação durante o credenciamento

**TR — GESTÃO DE MEIO AMBIENTE, item 17, p. 152:**

> Permitir que no momento do credenciado seja possível anexar documentos digitais;

**Dados de outro módulo / serviço compartilhado:** DEP-01/04 — Identidade do credenciado e arquivos do GED vinculados à solicitação. Compartilha a mesma origem do item 14.

**Implementação:** Disponibilizar anexos no credenciamento dos tipos contemplados, usando o mesmo componente do consultor. Preservar associação ao pedido/pessoa, tipo documental e conteúdo.

**Demonstração:** No credenciamento T-EMP, anexar o documento configurado, salvar e reabrir. No consultor T-CONS, confirmar que a funcionalidade compartilhada permanece disponível.

**Aceite técnico:** Anexação funciona no contexto do credenciado, não só numa tela interna ou só para um tipo hardcoded.

**Atenção/limite:** Mantém ID separado de MEA-014, mas não requer outra implementação. Não inventar nova lista de obrigatoriedades.


<a id="mea-018"></a>
### MEA-018 — Denúncia ambiental no Chrome do celular — webapp

**TR — GESTÃO DE MEIO AMBIENTE, item 18, p. 152:**

> Permitir realizar denúncia ambiental via aplicativo mobile;

**Dados de outro módulo / serviço compartilhado:** DEP-08 e DEP-03, se o atendimento já formar processo — formulário/protocolo de denúncia e referência interna existentes. Mesmas fontes do website, sem app ou base mobile próprios.

**Implementação:** Adaptar o formulário de denúncia do próprio site para funcionar no Chrome do celular, reutilizando a rota, autenticação quando exigida e backend do website. Permitir informar os dados necessários ao registro, enviar, receber confirmação/protocolo real e tratar falha de rede. Ajustar toque, teclado virtual e disposição dos campos, sem criar aplicativo separado ou exigir instalação.

**Demonstração:** No Chrome de um celular real, abrir a URL do site e enviar DEN-MOB-DEMO. Conferir a confirmação e localizar a denúncia no ambiente interno. Recarregar a consulta; repetir tecnicamente o mesmo envio para verificar ausência de duplicação. Registrar aparelho, versão do navegador e operação executada na evidência, não apenas uma captura de tela.

**Aceite técnico:** No canal webapp definido pelo usuário, a denúncia é enviada pelo Chrome do celular e persistida na mesma base utilizada pela Secretaria. Falha de envio não aparece como sucesso. O teste não depende de app nativo, instalação ou armazenamento apenas local. Esse aceite técnico não é confirmação de aceitação formal da forma de entrega pela comissão.

**Atenção/limite:** A expressão original “aplicativo mobile” é preservada na citação. A solução deste desenvolvimento é o mesmo site responsivo no Chrome do celular, por decisão do usuário. Não criar outro app, PWA instalável obrigatória, offline, câmera ou GPS obrigatório. Ver Q-03; não reabrir a escolha de arquitetura como bloqueio de implementação.


<a id="mea-019"></a>
### MEA-019 — Espécies relacionadas às mudas

**TR — GESTÃO DE MEIO AMBIENTE, item 19, p. 152:**

> Poder relacionar as espécies com suas respectivas mudas;

**Dados de outro módulo / serviço compartilhado:** DEP-09, somente se o catálogo já for compartilhado — identificação de muda/material. Espécies e sua relação ambiental não exigem outro catálogo externo.

**Implementação:** Manter cadastro/seleção de espécies e vínculo de cada cadastro de muda à espécie correspondente. Permitir consultar a relação no contexto de viveiro sem digitar o nome da espécie a cada movimento.

**Demonstração:** Associar M-A à espécie demo de ipê e M-B à de quaresmeira, salvar e consultar as posições de F-VIVEIRO pelas espécies.

**Aceite técnico:** Cada muda recupera a espécie correta e a movimentação não perde o vínculo. Alteração descritiva não muda as quantidades.

**Atenção/limite:** Não acrescentar taxonomia científica, integração botânica ou manejo por espécie como obrigação deste item.


<a id="mea-020"></a>
### MEA-020 — Caixa de entrada da Secretaria

**TR — GESTÃO DE MEIO AMBIENTE, item 20, p. 152:**

> Possibilitar a Secretaria acompanhar os processos que estão na caixa de entrada;

**Dados de outro módulo / serviço compartilhado:** DEP-02/03 — Organograma/permissão e Processos: caixa da Secretaria, processo, interessado, situação e total autorizado.

**Implementação:** Reutilizar a caixa de processos com escopo ambiental e setor/permissão. Mostrar processos encaminhados para atuação, sua identificação, interessado, situação e ação pertinente ao fluxo.

**Demonstração:** Enviar credenciamento e solicitação ambiental pelo portal; como Secretaria, localizá-los na caixa, abrir a ficha e verificar o encaminhamento.

**Aceite técnico:** Processos efetivos chegam à caixa correta, com total/paginação reais. Um envio externo não depende de transcrição pela Secretaria.

**Atenção/limite:** Não criar dashboard ou filas paralelas por status se a caixa existente já atende. MEA-052 reaproveita essa fonte.


<a id="mea-021"></a>
### MEA-021 — E-mails dos responsáveis por acompanhar prazos

**TR — GESTÃO DE MEIO AMBIENTE, item 21, p. 152:**

> Possibilitar cadastrar e-mail do(s) responsável(s) que acompanharão os prazos dos licenciamentos;

**Dados de outro módulo / serviço compartilhado:** DEP-01/07 — Contatos e e-mail compartilhados: endereços e destinatários. A associação de responsáveis a prazos é configuração ambiental.

**Implementação:** Permitir cadastrar/associar um ou mais e-mails de responsáveis pelos prazos de licenciamentos, usando os contatos existentes quando possível. Persistir o vínculo ao escopo pertinente e validar o formato.

**Demonstração:** Associar CX-TEC e outro contato de teste autorizado a um licenciamento; reabrir e executar um lembrete que utilize os responsáveis configurados.

**Aceite técnico:** Mais de um responsável pode ser mantido e os destinatários internos são recuperados pelo serviço de notificação, sem endereço fixo no código.

**Atenção/limite:** Não substituir os destinatários externos obrigatórios de 42/43 pelos internos. Não criar campanha ou mailing de marketing. **Q-08: envio e destinatários.**


<a id="mea-022"></a>
### MEA-022 — Cadastro da matriz de enquadramento ambiental

**TR — GESTÃO DE MEIO AMBIENTE, item 22, p. 152:**

> Possibilitar cadastro da matriz de enquadramento ambiental;

**Implementação:** Permitir manter as regras que relacionam dados do licenciamento ao enquadramento ambiental, com critérios, resultado e referência da versão/configuração. Reutilizar a estrutura parametrizável existente e validar correspondências conflitantes.

**Demonstração:** Cadastrar as regras R1/R2/R3 de F-ENQ; reabrir a matriz e demonstrar que selecionar os dados de R2 no processo recupera a regra configurada.

**Aceite técnico:** Matriz é cadastro persistido e utilizado pelo motor, não imagem/PDF anexado. Alterações válidas passam a ser utilizadas no escopo/versão previstos.

**Atenção/limite:** Não presumir que a matriz de demonstração é a tabela do município; campos/limiares reais dependem da definição fornecida. **Q-01: matriz oficial.**


<a id="mea-023"></a>
### MEA-023 — Confecção de vários modelos de documentos

**TR — GESTÃO DE MEIO AMBIENTE, item 23, p. 152:**

> Possibilitar confecção de vários modelos de documentos;

**Dados de outro módulo / serviço compartilhado:** DEP-04 — Modelos/editor/relatórios: serviço de manutenção de modelo, conteúdo, variáveis disponíveis e arquivo gerado. Somente documentos ambientais neste pacote.

**Implementação:** Na área ambiental, permitir criar/editar mais de um modelo ambiental usando o serviço documental existente, com título, conteúdo e dados de preenchimento disponíveis. Persistir modelos separados pelos contratos já existentes e relacioná-los aos tipos pelo item 34. Se o serviço de modelos não existir, destacar DEP-04; não desenvolver um editor geral ou alterar o GED neste pacote.

**Demonstração:** Criar Modelo Licença DEMO A, Modelo Licença DEMO B e Modelo Anuência DEMO. Alterar um texto em B e reabrir A para comprovar independência.

**Aceite técnico:** Mais de um modelo pode ser confeccionado e reutilizado; um não sobrescreve o outro. Geração usa o modelo selecionado.

**Atenção/limite:** Não transformar em editor gráfico novo ou biblioteca de modelos oficiais inventados. O conteúdo de produção deve ser fornecido/validado. **Q-05: modelos documentais.**


<a id="mea-024"></a>
### MEA-024 — Documentos necessários conforme o tipo do credenciado

**TR — GESTÃO DE MEIO AMBIENTE, item 24, p. 152:**

> Possibilitar definir quais documentos serão necessários para realizar o credenciamento de acordo com o tipo do credenciado;

**Dados de outro módulo / serviço compartilhado:** DEP-01/04 — Tipo de pessoa quando usado e cadastro de tipos documentais. Reutiliza a configuração ambiental do item 12.

**Implementação:** Usar a relação entre tipo de credenciado e tipos de documentos exigidos, com apresentação da obrigatoriedade e validação no envio. Compartilhar a configuração de MEA-012, sem tabela paralela.

**Demonstração:** Tentar enviar T-CONS apenas com DOC-ID-DEMO; indicar DOC-HAB-DEMO faltante. Completar e enviar. Verificar que T-EMP segue a própria configuração.

**Aceite técnico:** Exigência por tipo é real no formulário e no servidor; submissão incompleta não aparece como processo documentalmente completo.

**Atenção/limite:** Documentos concretos da fixture não são lista normativa. Não ampliar as exigências além da configuração autorizada. **Q-07: obrigatoriedade documental.**


<a id="mea-025"></a>
### MEA-025 — Extrato ambiental do licenciado

**TR — GESTÃO DE MEIO AMBIENTE, item 25, p. 152:**

> Possibilitar emissão do extrato ambiental referente ao licenciado;

**Dados de outro módulo / serviço compartilhado:** DEP-01/03/04 — Licenciado, referências/situações dos processos e geração de relatório. Licenciamentos e composição do extrato são dados ambientais.

**Implementação:** Gerar extrato referente ao licenciado identificado, a partir de seus licenciamentos/processos, documentos e situações disponíveis. Identificar o escopo e os dados efetivamente incluídos; reutilizar relatórios existentes.

**Demonstração:** Gerar o extrato de PESS-EMP-A após a solicitação de licença e anuência; conferir referências e situações com as fichas. Gerar o de B para verificar segregação.

**Aceite técnico:** Extrato é emitido com registros daquele licenciado, reprodutível e sem incluir processos de outro por erro de vínculo.

**Atenção/limite:** O TR não enumera colunas/modelo do extrato; a composição proposta é mínimo demonstrativo e precisa de confirmação, sem virar certidão negativa ou dívida consolidada por suposição. **Q-05: conteúdo do extrato.**


<a id="mea-026"></a>
### MEA-026 — Escolha de datum na informação geográfica

**TR — GESTÃO DE MEIO AMBIENTE, item 26, p. 152:**

> Possibilitar escolha de datum no momento de inserir as informações geográficas;

**Dados de outro módulo / serviço compartilhado:** DEP-10, se compartilhado — catálogo de datums/referências e componente geográfico existente. Não presumir um módulo SIG pronto.

**Implementação:** Disponibilizar seleção do datum suportado no momento da entrada geográfica e persistir a referência com as coordenadas. Integrar corretamente à referência do mapa, com conversão testada quando necessária.

**Demonstração:** Em F-GEO, registrar uma geometria sob a referência A e outra fixture conferida sob a referência B. Reabrir e verificar seleção original e posicionamento esperado.

**Aceite técnico:** Datum escolhido é conservado e usado tecnicamente; mudar o rótulo não pode reposicionar incorretamente o local nem fingir uma transformação.

**Atenção/limite:** A fonte não lista os datums. Não cadastrar opções arbitrárias que o backend não suporta nem alegar precisão de levantamento. **Q-04: datums e referências.**


<a id="mea-027"></a>
### MEA-027 — Escolha de vários modelos na impressão

**TR — GESTÃO DE MEIO AMBIENTE, item 27, p. 152:**

> Possibilitar escolher vários modelos de documentos na hora da impressão;

**Dados de outro módulo / serviço compartilhado:** DEP-04 — Modelos, vínculos e geração/impressão existentes. Os dados do documento vêm do licenciamento/processo correspondente.

**Implementação:** Na emissão/impressão, oferecer os modelos relacionados ao documento e permitir selecionar mais de um, gerando saídas identificáveis. Usar o mecanismo de modelos/relatórios compartilhado.

**Demonstração:** Selecionar os dois modelos de Licença DEMO, gerar os dois documentos/saídas e conferir conteúdo distinto com os mesmos dados de origem. Testar seleção que cruza páginas de modelos.

**Aceite técnico:** É possível escolher e imprimir vários modelos sem perder seleções fora da página visível; os arquivos correspondem às escolhas.

**Atenção/limite:** Não limitar a uma única opção fixa. O TR não obriga juntar tudo em um PDF único, nem reemitir licenças com efeitos administrativos apenas por imprimir modelos.


<a id="mea-028"></a>
### MEA-028 — Marcação de licenciamento sobre imagens de área ou satélite

**TR — GESTÃO DE MEIO AMBIENTE, item 28, p. 152:**

> Possibilitar marcação do licenciamento via visualização de imagens de área ou via satélite;

**Dados de outro módulo / serviço compartilhado:** DEP-10, se compartilhado — componente e camada de imagens autorizada. A marcação e o vínculo ao licenciamento pertencem ao módulo ambiental.

**Implementação:** Disponibilizar camada de imagem de área ou satélite autorizada e ferramenta para marcar a localização do licenciamento. Salvar a geometria vinculada ao processo e reabri-la no mapa.

**Demonstração:** Em F-GEO, localizar a área na camada de imagens, marcar PROC-LIC-A e salvar. Recarregar e abrir pelo portal/tela permitida para conferir a posição.

**Aceite técnico:** Marcação é interativa e persistida sobre imagens disponíveis. Imagem decorativa com ponto fixo não comprova a função.

**Atenção/limite:** Não exigir simultaneamente as duas fontes de imagem: o texto usa “ou”. Não presumir provedor, licença de uso ou aquisição de imagens novas. **Q-04: imagem cartográfica.**


<a id="mea-029"></a>
### MEA-029 — Autocredenciamento do consultor ou interessado

**TR — GESTÃO DE MEIO AMBIENTE, item 29, p. 153:**

> Possibilitar o consultor ambiental/interessado realizar seu credenciamento mediante órgão ambiental;

**Dados de outro módulo / serviço compartilhado:** DEP-01/02/03/04/08 — Pessoa, sessão/acesso externo, protocolo/processo e documentos no portal existente. Sem segundo sistema de credenciamento geral.

**Implementação:** Permitir que o usuário externo inicie seu credenciamento perante o órgão ambiental, escolha o tipo e envie os dados/documentos configurados. Integrar à conta, ao processo e à análise interna.

**Demonstração:** Como PESS-CONS-A, realizar o fluxo de credenciamento pelo canal externo; como PESS-EMP-A, repetir com o tipo apropriado. Localizar as duas submissões na Secretaria.

**Aceite técnico:** O próprio interessado/consultor inicia e acompanha o cadastro, sem o técnico redigitar sua solicitação. Identidade externa e processo mantêm relação correta.

**Atenção/limite:** Credenciamento solicitado não significa credenciamento homologado; o aceite segue o fluxo do item 32. **Q-07: tipos e fluxo.**


<a id="mea-030"></a>
### MEA-030 — Simulação de licenciamento pelo interessado

**TR — GESTÃO DE MEIO AMBIENTE, item 30, p. 153:**

> Possibilitar o interessado realizar sua simulação de licenciamento ambiental;

**Implementação:** Oferecer simulação acessível ao interessado com os dados necessários à matriz e retorno de enquadramento/valor. Usar o mesmo motor da operação real, sem produzir efeitos de emissão ou débito.

**Demonstração:** Executar F-ENQ como interessado: R1 retorna R$ 240,00; incluir A-02 para R2, R$ 320,00; em ensaio distinto, R3 retorna R$ 480,00. Comparar R2 ao processo real.

**Aceite técnico:** Entradas diferentes alteram o resultado pela matriz e a mesma entrada mantém a mesma regra/valor. Simulação não é uma tela de resultado fixo.

**Atenção/limite:** É funcionalidade expressamente exigida aqui. Não inferir licença concedida, taxa legal correta ou cobrança a partir da simulação. **Q-01: matriz da simulação.**


<a id="mea-031"></a>
### MEA-031 — Denúncia ambiental pelo website

**TR — GESTÃO DE MEIO AMBIENTE, item 31, p. 153:**

> Possibilitar realizar denúncias ambientais pelo website;

**Dados de outro módulo / serviço compartilhado:** DEP-08 e DEP-03 quando já vinculado — mesmo formulário, registro de atendimento e protocolo utilizados em MEA-018 no Chrome do celular.

**Implementação:** Disponibilizar o registro de denúncia ambiental no website existente, com o mesmo formulário responsivo e backend utilizados no Chrome do celular em MEA-018. Registrar conteúdo, localização informada e demais dados do fluxo atual, com confirmação real e sem duplicar a implementação.

**Demonstração:** No navegador do computador, abrir o website e enviar DEN-WEB-DEMO com conteúdo diferente de DEN-MOB-DEMO. Consultar internamente os dois registros. Identificar na evidência qual envio foi feito no computador e qual no Chrome do celular, sem criar novo campo de rastreamento do dispositivo como requisito.

**Aceite técnico:** O website permite registrar e confirmar a denúncia, que chega ao atendimento ambiental sem cópia manual e sem instalação. Desktop e celular compartilham o mesmo código/serviço; cada submissão real tem seu próprio registro.

**Atenção/limite:** Política de identificação/anonimato e campos da denúncia não foram detalhados; não criar exigência de credenciamento profissional para denunciar por suposição. **Q-07: política do canal.**


<a id="mea-032"></a>
### MEA-032 — Aceite do credenciamento pelo fluxo definido

**TR — GESTÃO DE MEIO AMBIENTE, item 32, p. 153:**

> Possibilitar realizar o aceite do credenciamento de acordo com fluxo definido no processo;

**Dados de outro módulo / serviço compartilhado:** DEP-02/03 — Usuário autorizado, estado/trâmite e ato de homologação. Meio Ambiente reflete o aceite no seu credenciamento.

**Implementação:** Disponibilizar o aceite/homologação do credenciamento nas transições autorizadas do processo, reaproveitando o workflow. Verificar estado atual e permissão, registrar o resultado e refletir no cadastro.

**Demonstração:** No processo completo da consultora, executar o aceite como técnico autorizado; consultar a situação externa e a lista de consultores. Tentar aceite com usuário externo e estado indevido.

**Aceite técnico:** Aceite é persistido e respeita o fluxo/perfil; consultor aparece como aceito somente depois do ato permitido. Repetição não produz duas homologações.

**Atenção/limite:** Não inventar quantidade de aprovadores, etapas ou prazos. A configuração fictícia do ensaio não é fluxo administrativo oficial. **Q-07: fluxo de aceite.**


<a id="mea-033"></a>
### MEA-033 — Tramitação conforme o processo definido

**TR — GESTÃO DE MEIO AMBIENTE, item 33, p. 153:**

> Possibilitar realizar tramite dos processos de acordo com processo definido;

**Dados de outro módulo / serviço compartilhado:** DEP-02/03 — Setores, permissões e serviço de tramitação: processo, origem, destino, situação e histórico. Não desenvolver workflow paralelo.

**Implementação:** Usar o processo eletrônico para movimentar entre caixas/setores conforme o fluxo configurado, registrando origem, destino, responsável e situação. Controlar concorrência e transições permitidas.

**Demonstração:** Encaminhar PROC-LIC-A à análise, verificar a caixa de destino e o histórico; executar uma transição permitida e tentar uma não prevista.

**Aceite técnico:** O processo muda de posição/situação nas telas e na persistência de forma coerente. Trâmite inválido é recusado e fica sem sucesso fictício.

**Atenção/limite:** Não substituir trâmite por edição livre do campo status. Não criar um novo motor se o núcleo de Processos atende. **Q-07: fluxo institucional.**


<a id="mea-034"></a>
### MEA-034 — Modelos relacionados aos tipos de documentos

**TR — GESTÃO DE MEIO AMBIENTE, item 34, p. 153:**

> Possibilitar relacionar os modelos de documentos com os tipos de documentos cadastrados no sistema;

**Dados de outro módulo / serviço compartilhado:** DEP-04 — Tipos documentais e modelos existentes. A associação para os documentos ambientais usa os contratos já disponíveis.

**Implementação:** Cadastrar a relação entre tipo documental e modelos compatíveis, utilizada na composição/impressão. Um tipo pode disponibilizar os vários modelos necessários; conservar os vínculos existentes.

**Demonstração:** Relacionar Modelos A/B ao tipo Licença DEMO e o Modelo de Anuência a Anuência DEMO. Abrir a impressão de cada tipo e comparar as opções.

**Aceite técnico:** Tipos recuperam os modelos corretos e seleção não depende de código fixo ou lista indiscriminada de documentos sem relação.

**Atenção/limite:** Usar o mesmo cadastro de modelos de MEA-023; o vínculo não cria emissão administrativa automática.


<a id="mea-035"></a>
### MEA-035 — Visualização das licenças emitidas no município

**TR — GESTÃO DE MEIO AMBIENTE, item 35, p. 153:**

> Possibilitar visualização das licenças emitidas no município;

**Dados de outro módulo / serviço compartilhado:** DEP-01/03/04/08 — Identificação do licenciado, situação/referência do processo, documento emitido e portal. Não criar lista manual paralela.

**Implementação:** Disponibilizar consulta das licenças efetivamente emitidas, com identificação, interessado, situação e documento acessível segundo a política de divulgação. Reutilizar a base do processo e do portal.

**Demonstração:** Emitir a Licença DEMO de PROC-LIC-A, manter outro pedido não emitido e abrir a consulta. Conferir que o primeiro consta como emitido e o segundo não é rotulado indevidamente.

**Aceite técnico:** Consulta recupera licenças realmente emitidas e abre o documento correto, distinguindo pedidos/rascunhos. Paginação e filtros usam o conjunto autorizado.

**Atenção/limite:** Não interpretar consulta municipal como publicação irrestrita de documentos pessoais ou como lista limitada ao primeiro lote de registros. **Q-07: alcance da consulta.**


<a id="mea-036"></a>
### MEA-036 — Consulta de licenciamentos no Chrome do celular — webapp

**TR — GESTÃO DE MEIO AMBIENTE, item 36, p. 153:**

> Possibilitar visualização dos licenciamentos ambientais realizado pelo município via aplicativo mobile;

**Dados de outro módulo / serviço compartilhado:** DEP-03/04/08 — Situação do processo, documentos acessíveis e sessão do mesmo portal. Licenciamentos usam a base ambiental já consumida no desktop.

**Implementação:** Adaptar a consulta existente de licenciamentos ambientais para uso no próprio site/portal pelo Chrome do celular. Usar os mesmos registros, endpoints, autenticação e permissões da consulta web. Ajustar campos, filtros e paginação ao viewport móvel, sem manter uma segunda base ou construir outro cliente.

**Demonstração:** No Chrome de um celular real, acessar a URL do site, localizar PROC-LIC-A e abrir sua situação e os dados autorizados. Alterar a situação pelo fluxo interno no computador e atualizar a consulta no celular para verificar o mesmo resultado. Testar sessão, navegação entre páginas e falha de carregamento.

**Aceite técnico:** A consulta do site pelo Chrome do celular apresenta o licenciamento real e a situação atualizada da mesma base, com leitura e navegação utilizáveis. Não há lista fixa nem necessidade de instalar aplicativo. O teste comprova a solução webapp escolhida; não declara aceitação formal da tecnologia pela comissão.

**Atenção/limite:** Usar o mesmo site de MEA-018/031, sem criar app separado, wrapper ou implantação mobile independente. Preservar a expressão do TR na citação e registrar a ressalva de Q-03. Q-07 continua tratando do escopo de acesso aos dados, não da criação de outro canal.


<a id="mea-037"></a>
### MEA-037 — Cadastro de atividades licenciáveis

**TR — GESTÃO DE MEIO AMBIENTE, item 37, p. 153:**

> Possuir cadastro das atividades que serão licenciadas;

**Implementação:** Permitir manter atividades que serão licenciadas, com identificação e descrição, reutilizáveis no licenciamento, nas atividades secundárias e na matriz. Evitar campos livres sem vínculo como único mecanismo.

**Demonstração:** Cadastrar A-01 e A-02 de F-ENQ, reabrir, editar a descrição de teste e selecioná-las no processo e na matriz.

**Aceite técnico:** Atividades persistem e são reutilizadas sem cadastro paralelo; edição não rompe os vínculos ou reescreve documentos já finalizados.

**Atenção/limite:** Não impor código CNAE, catálogo setorial oficial ou lista legal de atividades não fornecida como condição adicional. **Q-01: catálogo aplicável.**


<a id="mea-038"></a>
### MEA-038 — Cadastro de canteiros

**TR — GESTÃO DE MEIO AMBIENTE, item 38, p. 153:**

> Possuir cadastro de canteiros;

**Dados de outro módulo / serviço compartilhado:** DEP-09, somente se existente — identificação de local/canteiro do controle compartilhado. Não tornar o cadastro dependente de outro módulo sem necessidade.

**Implementação:** Permitir cadastrar e consultar canteiros, com identificação e vínculo ao viveiro usado no controle. Reutilizar a entidade de local/posição existente se representar corretamente esse conceito.

**Demonstração:** Cadastrar C-A e C-B no V-DEMO; reabrir e selecionar cada canteiro nos registros pertinentes de F-VIVEIRO.

**Aceite técnico:** Canteiros distintos são persistidos e identificáveis na localização das mudas; nomes não ficam espalhados em textos sem referência.

**Atenção/limite:** Não exigir mapeamento geográfico de canteiros, sensores ou parâmetros agronômicos que o item não descreve.


<a id="mea-039"></a>
### MEA-039 — Cadastro dos tipos de credenciado

**TR — GESTÃO DE MEIO AMBIENTE, item 39, p. 153:**

> Possuir cadastro do tipo de credenciado;

**Dados de outro módulo / serviço compartilhado:** DEP-01 — Tipo de pessoa quando aplicável; confirmar o mapeamento. Tipos/categorias de credenciado continuam cadastro ambiental.

**Implementação:** Permitir manter tipos/categorias de credenciado e utilizá-los no formulário, nas exigências documentais e no credenciamento. Mapear sua relação com o tipo de pessoa do núcleo.

**Demonstração:** Criar T-CONS e T-EMP como exemplos, associar suas exigências e iniciar o cadastro de um representante de cada tipo.

**Aceite técnico:** Tipos são configuráveis e alimentam a escolha/validação real. O fluxo não depende de duas opções fixas apenas no frontend.

**Atenção/limite:** Não fundir categoria de credenciado com PF/PJ sem definição. Os nomes da fixture não são categorias oficiais. **Q-07: tipos de pessoa/credenciado.**


<a id="mea-040"></a>
### MEA-040 — Cadastro dos tipos de potencial poluidor

**TR — GESTÃO DE MEIO AMBIENTE, item 40, p. 153:**

> Possuir cadastro dos tipos de potencial poluidor;

**Implementação:** Permitir manter tipos de potencial poluidor com identificação/descrição e relacioná-los ao licenciamento e à matriz quando aplicável. Preservar referências usadas em operações existentes.

**Demonstração:** Cadastrar PB e PM de demonstração e selecioná-los em F-ENQ. Reabrir o licenciamento e conferir a referência.

**Aceite técnico:** Tipos são dados persistidos, selecionáveis e usados na relação do item 4, não somente legendas visuais.

**Atenção/limite:** Não inventar faixas, pontuações ou classificações ambientais reais. **Q-01: tipos oficiais.**


<a id="mea-041"></a>
### MEA-041 — Cadastro de mudas

**TR — GESTÃO DE MEIO AMBIENTE, item 41, p. 153:**

> Possuir cadastros de mudas;

**Dados de outro módulo / serviço compartilhado:** DEP-09, somente se compartilhado — identificador e descrição de material/muda. Não criar saldo fictício nem impor integração patrimonial.

**Implementação:** Disponibilizar cadastro de mudas com identificação/descrição e relação à espécie, separando o cadastro da movimentação e do saldo. Reaproveitar catálogo compatível sem exigir dados de patrimônio.

**Demonstração:** Cadastrar M-A e M-B; vincular as espécies e selecionar nos movimentos de F-VIVEIRO. Criar outra muda sem entrada e conferir ausência de saldo artificial.

**Aceite técnico:** Mudas podem ser cadastradas e utilizadas no controle. A quantidade provém de movimentos, não de valor fixo copiado do cadastro.

**Atenção/limite:** Não criar catálogo comercial, rastreamento por unidade ou lote botânico obrigatório não especificados.


<a id="mea-042"></a>
### MEA-042 — Vencimentos e e-mails das condicionantes

**TR — GESTÃO DE MEIO AMBIENTE, item 42, p. 153:**

> Possuir controle dos vencimentos das condicionantes, com envio de notificações via e-mail referente ao prazo das condicionantes sinalizando o credenciado/empreendedor, bem como o corpo técnico da Secretaria;

**Dados de outro módulo / serviço compartilhado:** DEP-01/07 — Contatos, e-mail e agendamento existentes: destinatários e resultados dos avisos. Condicionante, vencimento e antecedência são dados ambientais.

**Implementação:** Vincular condicionantes ao licenciamento/processo, com identificação, vencimento e responsáveis necessários ao acompanhamento. Utilizar antecedências do item 50 e enviar aviso ao credenciado/empreendedor e ao corpo técnico da Secretaria.

**Demonstração:** Executar COND-D/M/A de F-PRAZOS; verificar as três datas programadas e recebimento por destinatário externo e interno. Reexecutar a janela e testar envio falho.

**Aceite técnico:** Condicionantes têm prazos próprios e ambos os públicos recebem avisos correspondentes. Reexecução não duplica os concluídos; falha não se torna entregue.

**Atenção/limite:** Não confundir prazo da condicionante com vencimento da licença nem aprovar seu cumprimento só por enviar aviso. **Q-08: agendador/e-mail; Q-07: dados do prazo.**


<a id="mea-043"></a>
### MEA-043 — Vencimentos e e-mails das licenças e documentos similares

**TR — GESTÃO DE MEIO AMBIENTE, item 43, p. 153:**

> Possuir controle dos vencimentos das licenças ambientais, bem como qualquer outro documento de mesmo cunho que tenha algum prazo a ser acompanhado, com envio de notificações via e-mail referente ao prazo dos mesmos sinalizando o credenciado/empreendedor, bem como o corpo técnico da Secretaria;

**Dados de outro módulo / serviço compartilhado:** DEP-01/04/07 — Contatos, referência/arquivo da licença ou documento e serviço de aviso. Prazos ambientais alimentam o serviço existente.

**Implementação:** Controlar vencimentos de licenças e outros documentos ambientais com prazo, usando destinatários externos e técnicos internos e antecedências configuradas. Não limitar o mecanismo a uma única classe de documento.

**Demonstração:** Executar LIC-D/M/A de F-PRAZOS; em cenário separado, cadastrar Anuência DEMO com prazo e verificar seu lembrete para CX-EMP e CX-TEC.

**Aceite técnico:** Licenças e outro tipo de documento com prazo são acompanhados; os avisos identificam corretamente o objeto e chegam aos dois públicos.

**Atenção/limite:** Não renovar, cancelar ou invalidar automaticamente documento apenas pelo relógio sem regra administrativa configurada. **Q-08: e-mail/agendamento; Q-07: prazos.**


<a id="mea-044"></a>
### MEA-044 — Delimitação de áreas

**TR — GESTÃO DE MEIO AMBIENTE, item 44, p. 153:**

> Possuir recursos para delimitação de áreas;

**Dados de outro módulo / serviço compartilhado:** DEP-10, se compartilhado — componente cartográfico e referência geográfica. A área delimitada é gravada vinculada ao registro ambiental.

**Implementação:** Oferecer ferramenta para delimitar área geográfica vinculada ao registro ambiental, salvando geometria recuperável e sua referência. Usar desenho/edição de perímetro já suportados pelo mapa e validar a área resultante.

**Demonstração:** Em F-GEO, delimitar uma área com ao menos quatro vértices para PROC-LIC-A, salvar, reabrir e alterar um vértice em registro editável; testar geometria incompleta.

**Aceite técnico:** A área, não somente um marcador, é persistida e exibida novamente na posição esperada. Uma geometria inválida não é salva como delimitação concluída.

**Atenção/limite:** Não acrescentar CAD, importação de shapefile, precisão cadastral legal ou levantamento de campo obrigatório. **Q-04: geometria e referência.**


<a id="mea-045"></a>
### MEA-045 — Consulta e crítica de débitos ambientais

**TR — GESTÃO DE MEIO AMBIENTE, item 45, p. 153:**

> Realizar consulta e critica referente aos débitos ambientais do envolvido no licenciamento;

**Dados de outro módulo / serviço compartilhado:** DEP-01/06 — Pessoa/identificador e Tributos/Arrecadação: débitos ambientais, valor, vencimento, situação e referência da fonte. Apenas consulta/crítica ambiental; não criar cobrança.

**Implementação:** Integrar a consulta dos débitos ambientais do envolvido ao licenciamento; mostrar registros e crítica/aviso quando houver pendência. Usar a fonte real de arrecadação e distinguir inexistência de débito de consulta indisponível.

**Demonstração:** Em F-ENQ, consultar PESS-EMP-B com débito ambiental de R$ 80,00 e PESS-EMP-A sem pendência. Simular indisponibilidade da fonte e observar resposta distinta.

**Aceite técnico:** Débito de B gera crítica visível com origem verificável; A não herda dívida de B. Erro de integração não resulta em declaração de regularidade.

**Atenção/limite:** A crítica não impõe indeferimento, bloqueio automático ou soma de débitos à DUA sem regra expressamente definida. **Q-02: fonte de débitos; Q-07: efeito da crítica.**


<a id="mea-046"></a>
### MEA-046 — Enquadramento automático do licenciamento

**TR — GESTÃO DE MEIO AMBIENTE, item 46, p. 153:**

> Referente ao licenciamento ambiental, no que tange o seu enquadramento, o mesmo deve ser feito de forma automática;

**Implementação:** Aplicar a matriz aos dados estruturados do licenciamento e obter automaticamente o enquadramento correspondente, com identificação da regra usada. Reexecutar na alteração de dados de registro ainda editável.

**Demonstração:** Preencher principal A-01, secundária A-02 e PB: o sistema seleciona E-DEMO-02 sem escolha manual. Remover A-02 em ensaio não emitido e verificar E-DEMO-01.

**Aceite técnico:** Enquadramento provém da matriz e muda com dados determinantes. Seleção manual obrigatória ou valor fixo não substitui o automatismo.

**Atenção/limite:** Reaproveitar itens 3/9/22/30 sem duplicar cálculo. Não alterar silenciosamente licença/documento já finalizado ao editar parâmetros. **Q-01: regras de enquadramento.**


<a id="mea-047"></a>
### MEA-047 — Relatórios ambientais com imagens

**TR — GESTÃO DE MEIO AMBIENTE, item 47, p. 153:**

> Ser possível confeccionar relatórios ambientais possibilitando inserção de imagens;

**Dados de outro módulo / serviço compartilhado:** DEP-03/04 — Processo, conteúdo/imagens do documento e serviço de geração existente. Não construir novo editor ou GED.

**Implementação:** Permitir inserir imagens dentro da composição do relatório ambiental, com texto e posicionamento compatíveis com o editor existente. Preservar as referências/bytes para reabrir e gerar o documento.

**Demonstração:** No relatório de F-DOC, inserir duas imagens distintas, texto e legendas; salvar, gerar PDF/impressão e conferir as imagens dentro do relatório.

**Aceite técnico:** Relatório emitido contém as duas imagens e o texto, sem links quebrados, corte indevido ou conteúdo estático que ignore o editor.

**Atenção/limite:** Anexar fotos ao processo sem inseri-las no relatório não comprova este item. Não exigir editor de imagens ou captura por câmera.


<a id="mea-048"></a>
### MEA-048 — Emissão de DUA do licenciamento ambiental

**TR — GESTÃO DE MEIO AMBIENTE, item 48, p. 153:**

> Ser possível emitir a DUA referente ao valor do licenciamento ambiental;

**Dados de outro módulo / serviço compartilhado:** DEP-06 — Tributos/Arrecadação/emissor existente: DUA, identificação, situação e arquivo. Meio Ambiente fornece interessado, licenciamento e valor; não desenvolve o emissor.

**Implementação:** Destacar DEP-06: a DUA vem do emissor existente em Tributos/Arrecadação ou do serviço que o ERP já utiliza. Do lado ambiental, passar interessado, referência do licenciamento e valor calculado; receber identificação, situação e arquivo/retorno da emissão e exibi-los vinculados ao processo. Usar a proteção a repetição do serviço. Se faltar emissor, contrato ou configuração, sinalizar a dependência; não criar emissor nem modificar o módulo de origem neste pacote.

**Demonstração:** Com configuração/ambiente autorizado, emitir a DUA de PROC-LIC-A com R$ 320,00, conferir vínculo e campos definidos pelo emissor e repetir a operação conforme a regra real de reemissão.

**Aceite técnico:** Documento é produzido no padrão aplicável identificado, com valor e interessado corretos. Erro externo fica registrado e não é substituído por guia inventada.

**Atenção/limite:** Serviço interno ausente: DEPENDENCIA_OUTRO_MODULO. Impedimento externo de emissor/contrato/credencial: BLOQUEADO_EXTERNO. Destacar a origem e a falta em Q-02; não presumir que toda DUA dependa de um serviço externo se o ERP já a emitir. Guia genérica ou PDF de demonstração não comprova DUA válida, e não se deve gerar cobrança fictícia em produção.


<a id="mea-049"></a>
### MEA-049 — Responsabilidade técnica e solicitação de documentos correlatos

**TR — GESTÃO DE MEIO AMBIENTE, item 49, p. 154:**

> Ser possível incluir anotações de responsabilidade técnica referente ao licenciamento bem como solicitação de documentos do mesmo cunho;

**Dados de outro módulo / serviço compartilhado:** DEP-01/03/04 — Responsável técnico já identificado, processo, solicitação e arquivo associado. Não consultar conselho nem emitir ART por novo serviço.

**Implementação:** Permitir incluir no licenciamento anotações/documentos de responsabilidade técnica e registrar a solicitação de documentação do mesmo cunho. Reutilizar cadastro documental, identificação do responsável e anexação pertinentes.

**Demonstração:** Em PROC-LIC-A, registrar referência RT-DEMO e anexar o documento demonstrativo; solicitar complemento de responsabilidade técnica e atendê-lo pelo portal com outra peça.

**Aceite técnico:** A anotação e o documento estão ligados ao licenciamento; a solicitação pode ser identificada e respondida, sem documento perdido em observação genérica.

**Atenção/limite:** Não emitir ART oficial nem consultar conselho automaticamente por este item. Não inventar número profissional válido ou exigir formato não informado. **Q-05: documentos técnicos; Q-07: solicitação.**


<a id="mea-050"></a>
### MEA-050 — Antecedência em dias, meses ou anos para condicionantes

**TR — GESTÃO DE MEIO AMBIENTE, item 50, p. 154:**

> Ser possível incluir quantos dias, meses, ou anos, que antecederão o vencimento das condicionantes;

**Dados de outro módulo / serviço compartilhado:** DEP-07 — Agendamento compartilhado: data programada e estado da execução. Número/unidade de antecedência da condicionante são parâmetros ambientais.

**Implementação:** Permitir informar número e unidade de antecedência para vencimentos de condicionantes, armazenando-os e calculando a data de aviso pelo calendário adotado. Integrar ao agendamento do item 42.

**Demonstração:** Cadastrar COND-D, COND-M e COND-A de F-PRAZOS; verificar que as três configurações resultam em 18/09/2026 e são recuperadas como dias, mês e ano, respectivamente.

**Aceite técnico:** As três unidades são selecionáveis e realmente alteram o agendamento; o formulário não apenas muda a legenda de um número fixo de dias.

**Atenção/limite:** Testar limites de calendário conforme a regra técnica documentada. Não criar prazos legais predefinidos nem lembretes por outro canal. **Q-08: calendário/agendador.**


<a id="mea-051"></a>
### MEA-051 — Antecedência em dias, meses ou anos para licenças

**TR — GESTÃO DE MEIO AMBIENTE, item 51, p. 154:**

> Ser possível incluir quantos dias, meses, ou anos, que antecederão o vencimento das licenças;

**Dados de outro módulo / serviço compartilhado:** DEP-07 — Agendamento compartilhado: data programada e estado da execução. Configuração de prazo da licença não altera o agendador geral.

**Implementação:** Reutilizar a parametrização número/unidade para prazos de licenças, sem compartilhar indevidamente a configuração individual de uma condicionante. Integrar ao item 43.

**Demonstração:** Cadastrar LIC-D, LIC-M e LIC-A de F-PRAZOS. Conferir 18/09/2026 como data programada e a manutenção das unidades após reabrir.

**Aceite técnico:** Licenças permitem dias, meses e anos e o agendador usa a configuração correta de cada objeto. Alterar uma não muda o prazo de outra.

**Atenção/limite:** Uma única unidade “dias” com conversões manuais não atende ao conjunto descrito. Não presumir renovação automática. **Q-08: calendário/agendador.**


<a id="mea-052"></a>
### MEA-052 — Sinalização de processos pendentes de análise

**TR — GESTÃO DE MEIO AMBIENTE, item 52, p. 154:**

> Sinalização que existem processos a serem analisados pela Secretaria Ambiental.

**Dados de outro módulo / serviço compartilhado:** DEP-02/03 — Escopo da Secretaria e caixa de processos: conjunto/quantidade efetivamente pendentes. Sem contador manual independente.

**Implementação:** Usar a mesma fonte da caixa de entrada para sinalizar processos que precisam de análise ambiental, por indicador/contador contextual com acesso à lista. Atualizar o indicador conforme o trâmite real.

**Demonstração:** Criar dois processos destinados à análise; conferir o indicador e abrir os dois. Tramitar um para estado que não demande aquela análise e conferir o novo total.

**Aceite técnico:** A sinalização reflete o conjunto real pendente no escopo autorizado e leva aos processos correspondentes. Não é contador fixo.

**Atenção/limite:** Não é necessário dashboard analítico, notificação push ou nova central de alertas para esse indicador.


<a id="mea-053"></a>
### MEA-053 — Tipo de pessoa no credenciamento e e-mail de acesso

**TR — GESTÃO DE MEIO AMBIENTE, item 53, p. 154:**

> Permitir que o cadastro de tipo de pessoa para que seja possível realizar o credenciamento onde o mesmo deverá receber por e-mail as informações de acesso ao sistema.

**Dados de outro módulo / serviço compartilhado:** DEP-01/02/07 — Tipo de pessoa, conta externa, contato/link e resultado do e-mail. Os tipos ambientais não se confundem automaticamente com PF/PJ.

**Implementação:** Mapear o cadastro de tipo de pessoa ao credenciamento, mantendo os tipos/categorias do item 39 e as exigências documentais pertinentes. No evento configurado de concessão de acesso, enviar as informações pelo serviço de MEA-006.

**Demonstração:** Realizar um credenciamento com tipo definido, receber informações em CX-CONS/CX-EMP e acessar com o perfil correto. Comparar a configuração documental dos tipos.

**Aceite técnico:** Tipo é gravado e participa do cadastro; a mensagem de acesso chega e permite entrar no contexto devido, sem criar outro usuário desconectado do credenciamento.

**Atenção/limite:** Não omitir o envio de e-mail nem fundir categoria profissional com PF/PJ sem mapeamento. Uma mensagem pode evidenciar 6 e 53. **Q-07: tipos; Q-08: e-mail/acesso.**


<a id="mea-054"></a>
### MEA-054 — Documentos obrigatórios e formação de processo digital

**TR — GESTÃO DE MEIO AMBIENTE, item 54, p. 154:**

> No ato do credenciamento informar os documentos digitais obrigatórios de modo que isso vire um processo digital e o mesmo possa ser tramitado dentro do órgão/setor.

**Dados de outro módulo / serviço compartilhado:** DEP-01/03/04 — Identidade, protocolo/processo, tipos e arquivos anexados. A submissão ambiental aciona os serviços existentes uma única vez.

**Implementação:** Durante o credenciamento, mostrar os documentos digitais obrigatórios por tipo e anexá-los; ao enviar, formar processo digital efetivo, com peças e encaminhamento interno. Validar a completude e evitar protocolo duplicado.

**Demonstração:** Em F-CRED, mostrar uma exigência faltante, completar o conjunto e enviar. Abrir o processo pela Secretaria, ver os mesmos anexos e tramitar dentro do órgão/setor.

**Aceite técnico:** O envio completo cria um processo digital tramitável com seus documentos, não somente ficha cadastral. Segunda confirmação não cria outro processo idêntico.

**Atenção/limite:** Reaproveitar matriz documental e Processos; não criar rito de aprovação adicional além do fluxo configurado. **Q-07: documentos/fluxo.**


<a id="mea-055"></a>
### MEA-055 — Acompanhamento digital pelo solicitante

**TR — GESTÃO DE MEIO AMBIENTE, item 55, p. 154:**

> O Solicitante do documento ambiental, seja uma licença ou outro, poderá acompanhar a situação de forma digital através do portal do sistema.

**Dados de outro módulo / serviço compartilhado:** DEP-03/08 — Situação e histórico autorizado do processo para a sessão do solicitante no portal existente.

**Implementação:** No portal do sistema, permitir ao solicitante acompanhar a situação de seus pedidos de licença e outros documentos ambientais, ligados ao processo e ao histórico acessível.

**Demonstração:** Como PESS-EMP-A, abrir PROC-LIC-A e PROC-ANU-A; tramitar um internamente e conferir a situação atualizada no portal. Tentar consultar pedido privado de B.

**Aceite técnico:** O solicitante acompanha ambos os tipos de pedido com situação derivada do processo; não depende de telefone/e-mail ou lista estática para obter o estado.

**Atenção/limite:** A consulta deve respeitar vínculo e permissões, sem substituir os avisos por e-mail exigidos em outros itens. **Q-07: acesso externo.**


<a id="mea-056"></a>
### MEA-056 — Licença assinada disponível no portal e vinculada ao processo

**TR — GESTÃO DE MEIO AMBIENTE, item 56, p. 154:**

> Permitir que as licenças ambientais assinadas digitalmente estejam disponível de forma eletrônica e amarrada ao processo digital bem como com suas devidas assinaturas no portal do sistema.

**Dados de outro módulo / serviço compartilhado:** DEP-03/04/05/08 — Processo, versão documental, bytes/assinaturas e publicação autorizada. Não gerar novo assinador nem cópia diferente no portal.

**Implementação:** Disponibilizar eletronicamente a versão assinada da licença com suas assinaturas e referência ao processo. Usar os bytes produzidos pela assinatura, não gerar cópia visual diferente no download.

**Demonstração:** Assinar a Licença DEMO no ambiente autorizado, acessar pelo portal, abrir/baixar e conferir assinaturas e correspondência com a versão interna vinculada a PROC-LIC-A.

**Aceite técnico:** O portal entrega o documento efetivamente assinado e permite identificar a ligação ao processo. Nome digitado ou selo decorativo não substituem assinatura.

**Atenção/limite:** Preservar política de acesso. Sem credencial/serviço apto, a assinatura não pode ser considerada validada. **Q-05: assinatura/certificado; Q-07: publicação.**


<a id="mea-057"></a>
### MEA-057 — Processos digitais em mapa com situações por cores

**TR — GESTÃO DE MEIO AMBIENTE, item 57, p. 154:**

> Todos os processos digitais deverão ficar disponíveis bem como sua situação definidas em cores no portal do sistema devendo ser visualizadas em um mapa.

**Dados de outro módulo / serviço compartilhado:** DEP-02/03/08/10 — Acesso, situação persistida de cada processo, portal e mapa compartilhado quando houver. Geometrias ambientais e estados precisam conservar o vínculo real.

**Implementação:** Mostrar no portal mapa dos processos digitais abrangidos, com situação atual definida por cor e legenda textual, vinculada ao processo. Garantir alcance do conjunto completo autorizado independentemente da paginação da lista.

**Demonstração:** Executar F-GEO com 23 processos: 8/9/6 por situação; abrir mapa e lista paginada, filtrar 8 em análise e mudar um estado. Conferir 7/10/6 e mudança de cor.

**Aceite técnico:** Geometrias, estados e totais conciliam com a base. O mapa não contém só os dez primeiros processos nem cores estáticas. Todos os do conjunto demonstrado são alcançáveis.

**Atenção/limite:** Não esconder o mapa por preferência de tela compacta nem expor peças sigilosas. Processos sem posição exigem tratamento explícito, não pin fictício. **Q-04: geografia; Q-07: alcance de “todos”.**


<a id="mea-058"></a>
### MEA-058 — Trâmite, anexos, pareceres, licenças e assinatura por certificado

**TR — GESTÃO DE MEIO AMBIENTE, item 58, p. 154:**

> Ser possível fazer a tramitação de processos digitais, bem como fazer os anexos de documentos digitais, pareceres ambientais, Licenças ambientais bem como deixar assinar digitalmente os mesmos com certificado digital

**Dados de outro módulo / serviço compartilhado:** DEP-02/03/04/05 — Permissões, trâmite, peças/modelos e assinatura digital existentes. Implementar o uso ambiental; não reconstruir esses módulos.

**Implementação:** Integrar no processo digital tramitação, juntada de documentos/pareceres/licenças e assinatura digital por certificado. Reutilizar serviços existentes e versões imutáveis de arquivos finalizados.

**Demonstração:** Tramitar PROC-LIC-A; anexar documento, cadastrar parecer e gerar licença. Assinar o documento digital de teste, o parecer e a licença por certificado no ambiente autorizado e verificar as três versões no processo.

**Aceite técnico:** Todas as partes do item funcionam: trâmite, documentos, pareceres, licenças e assinatura criptográfica verificável. Provar apenas upload não fecha o item.

**Atenção/limite:** Não assinar somente um hash fora do documento e apresentar como licença assinada. Não criar credenciais fictícias apresentadas como confiáveis. **Q-05: certificado/assinatura; Q-07: fluxo.**


<a id="mea-059"></a>
### MEA-059 — Pesquisa de autenticidade de cada documento ambiental

**TR — GESTÃO DE MEIO AMBIENTE, item 59, p. 154:**

> No processo digital permitir que cada documento ambiental possa ser pesquisado a sua autenticidade.

**Dados de outro módulo / serviço compartilhado:** DEP-03/04/05 — Documento/processo, versão e resultado de autenticidade/assinatura do serviço existente. Sem criar portal de verificação adicional.

**Implementação:** Permitir consultar a autenticidade de cada documento ambiental do processo por sua identificação/chave e versão, usando o serviço de documentos existente. Relacionar o resultado à emissão e apresentar a verificação de assinatura quando pertinente.

**Demonstração:** Consultar a licença e o parecer de F-DOC separadamente; conferir suas identidades. Testar chave inexistente e uma cópia adulterada pelos mecanismos de verificação disponíveis.

**Aceite técnico:** Cada documento tem pesquisa própria e resultado correspondente; chave inexistente não retorna sucesso. Documento adulterado não é apresentado como o original válido.

**Atenção/limite:** Autenticidade de emissão não equivale automaticamente a assinatura válida. Não publicar todo processo nem criar portal de validação externo adicional se o existente atende. **Q-05: autenticidade e assinatura.**


<a id="mea-060"></a>
### MEA-060 — Integração de processos digitais com órgãos externos

**TR — GESTÃO DE MEIO AMBIENTE, item 60, p. 154:**

> Permitir integração com órgãos externos para que os processos digitais possam ajudar a deixar de ser desburocratizados.

**Dados de outro módulo / serviço compartilhado:** DEP-03/11 — Processo e integração existente: identificador de operação, dados do contrato e retorno do órgão identificado. Se a origem faltar, destacar a dependência, sem construir conector neste pacote.

**Implementação:** Destacar DEP-11: identificar o serviço de integração/Processos existente e os dados ambientais consumidos ou retornados no contrato identificado. Pelo lado de Meio Ambiente, vincular o processo, acionar o serviço disponível e apresentar o retorno real com tratamento de falhas. Não desenvolver conectores ou alterar outro módulo neste pacote. Quando não houver integração/órgão/contrato definidos, registrar precisamente a dependência e manter o item pendente.

**Demonstração:** Com órgão/ambiente autorizado definido, executar a operação de intercâmbio, conferir os dados do outro lado e o registro correlato no processo; testar retorno falho e repetição.

**Aceite técnico:** Há intercâmbio verificável no contrato identificado e sem duplicação/alteração indevida. Um endpoint sem consumidor ou mock isolado não comprova integração institucional.

**Atenção/limite:** O TR não nomeia órgãos nem APIs. Destacar o módulo/serviço previsto, a contraparte quando identificada e a informação necessária, sem inventar o conector. Falta interna fica como DEPENDENCIA_OUTRO_MODULO; contrato/órgão ainda indefinido como AGUARDA_DEFINICAO; impedimento externo como BLOQUEADO_EXTERNO. Q-06 preserva essas distinções e a necessidade de comprovação real.


<a id="mea-061"></a>
### MEA-061 — Interação externa e homologação interna com retorno

**TR — GESTÃO DE MEIO AMBIENTE, item 61, p. 154:**

> Permitir que o usuário externo possa interagir de forma direta no sistema nos processos digitais, bem como, usuário interno, possa fazer a homologação dos processos onde o usuário externo irá receber às informações através de e-mail ou acompanhar via portal do sistema.

**Dados de outro módulo / serviço compartilhado:** DEP-02/03/04/08 e DEP-07 quando usar e-mail — Identidade, processo/ato de homologação, peças, portal e retorno do aviso. Sem novo chat ou workflow.

**Implementação:** Permitir atuação externa autorizada no processo, como atendimento de solicitação/juntada, e homologação interna pelo fluxo. Refletir o resultado no portal e/ou enviar o retorno ao externo conforme a forma adotada.

**Demonstração:** O técnico solicita complemento; o interessado responde com peça pelo portal; o técnico homologa. O interessado consulta o resultado e, quando configurado, recebe o e-mail correspondente.

**Aceite técnico:** A interação chega ao mesmo processo, somente usuário interno autorizado homologa e o externo recebe/consulta a informação. Histórico conecta as ações.

**Atenção/limite:** Este item usa “e-mail ou ... portal”; não impor cumulatividade aqui, mas manter e-mails expressamente exigidos em 6/7/42/43/53. Não criar chat genérico como requisito. **Q-07: fluxo/acesso; Q-08 quando houver e-mail.**


<a id="mea-062"></a>
### MEA-062 — Inclusão de peças em processo em andamento

**TR — GESTÃO DE MEIO AMBIENTE, item 62, p. 155:**

> Ser possível anexar peças ao processo digital em andamento.

**Dados de outro módulo / serviço compartilhado:** DEP-02/03/04 — Permissão, processo em andamento, sequência de juntada e arquivo do GED. Não recriar processo ou repositório.

**Implementação:** Permitir anexar nova peça a processo já em andamento, conforme permissão, com tipo/identificação, autoria, data e sequência de juntada. Usar GED e transação de vínculo, sem criar novo processo.

**Demonstração:** Em PROC-LIC-A em análise, registrar total N de peças, anexar complemento e reabrir. Conferir N+1, a nova peça e documentos assinados anteriores intactos.

**Aceite técnico:** A peça entra no processo existente e continua recuperável; inclusão não modifica bytes de documentos assinados nem apaga o histórico.

**Atenção/limite:** Não limitar anexação ao cadastro inicial; não permitir que vínculo da peça seja adulterado para outro processo por chamada direta.


<a id="mea-063"></a>
### MEA-063 — Visualização de toda a juntada documental

**TR — GESTÃO DE MEIO AMBIENTE, item 63, p. 155:**

> Ser possível visualizar toda juntada de documentos digitais dentro do processo eletrônico.

**Dados de outro módulo / serviço compartilhado:** DEP-02/03/04 — Escopo, índice/ordem das peças e conteúdo/versão dos documentos. Paginação preserva o conjunto completo da origem.

**Implementação:** Exibir todas as peças juntadas do processo eletrônico, com ordem, tipo, identificação e acesso ao conteúdo permitido. Paginar o índice quando necessário, mantendo o conjunto completo e as versões identificáveis.

**Demonstração:** Em F-DOC, percorrer as 13 peças de PROC-LIC-A, abrir primeira/última e a peça acrescentada durante análise. Comparar a contagem com o backend e testar acesso externo permitido.

**Aceite técnico:** Nenhuma peça é perdida por paginação ou filtro implícito; conteúdos podem ser abertos e pertencem ao processo correto. Documento indisponível é erro identificado, não lista vazia falsa.

**Atenção/limite:** Não exigir gerar um PDF único de todo o processo como função nova. Visualizar toda a juntada não autoriza divulgar peças sem permissão.


---
<a id="pacotes"></a>
## 7. Pacotes de desenvolvimento e ordem de trabalho

Não estimar horas/dias antes de examinar o código. Reutilizar função comprovadamente operacional, sem reimplementá-la só para seguir a ordem desta tabela. Cada pacote entrega interface, validação, persistência, integração pertinente e testes; nenhum se encerra só com telas.

| Pacote | Entrega | IDs específicos | Dependência principal |
|---|---|---|---|
| **P0 — Diagnóstico** | Mapear código ambiental, permissões, tela-piloto e DEP-01 a DEP-11 sem editar módulos de origem. Q-03 já tem solução definida: site no Chrome do celular. Identificar as demais configurações faltantes. | Classificação inicial dos 63, não execução. | Repositório e configurações atuais. |
| **P1 — Cadastros ambientais e consumo do núcleo** | Tipos, exigências, atividades, potenciais e matriz ambiental; consumir CEP, contatos e permissões já disponíveis. | 1, 10, 12, 21, 22, 24, 37, 39, 40. | Pessoas/permissões e dados de configuração. |
| **P2 — Credenciamento** | Solicitação externa, anexos, processo, acesso por e-mail, análise/aceite e lista de consultores. | 5, 6, 7, 14, 16, 17, 29, 32, 53, 54. | P1, Processos, GED, autenticação e e-mail. |
| **P3 — Licenciamento/cálculo** | Atividades, enquadramento/valor automáticos, solicitações, simulação, crítica de débitos e responsabilidade técnica. | 3, 4, 9, 13, 15, 30, 45, 46, 49. | P1/P2, matriz e núcleo de arrecadação. |
| **P4 — Tramitação/portal** | Caixa, trâmite, consultas, sinalização, interação/homologação, peças e juntada. | 20, 33, 35, 52, 55, 61, 62, 63. | Processos e portal; desenvolver com P2/P3. |
| **P5 — Documentos** | Pareceres, modelos/tipos, extrato, impressão, imagens, assinatura e autenticidade. | 2, 23, 25, 27, 34, 47, 56, 58, 59. | Editor/relatórios/GED, processo e assinatura. |
| **P6 — Geografia** | Locais restritos, datum, imagem, marcação, delimitação e mapa por situação. | 11, 26, 28, 44, 57. | Geometria, camadas e permissões do portal. |
| **P7 — Vencimentos** | Condicionantes/licenças/outros documentos, antecedências e avisos. | 42, 43, 50, 51. | Cadastros de prazo, contatos, e-mail/agendador. |
| **P8 — Viveiros** | Espécies, mudas, canteiros e movimentação. | 8, 19, 38, 41. | Catálogos e serviço de posição/movimentos. |
| **P9 — Mesmo site no desktop e no celular** | Formulário web de denúncia e consulta de licenciamentos no Chrome do celular; adaptar páginas existentes, sem app separado. | 18, 31, 36. | Site/portal e backend já utilizados pelo ERP. |
| **P10 — Consumo da DUA existente** | Integração do lado ambiental com o emissor disponível; destacar DEP-06 quando faltar fonte/serviço. Sem desenvolver Arrecadação. | 48. | Q-02 e serviço de origem operacional. |
| **P11 — Consumo de integração existente** | Acionar integração identificada e exibir o retorno no processo ambiental; destacar DEP-11. Não criar conector ou outro módulo. | 60. | Q-06 e serviço/contrato disponível. |
| **P12 — Ensaio** | Executar cenários integrados, fechar matriz de evidências e testar UX. | Os 63, sem recontar como novas funções. | Pacotes pertinentes e pendências identificadas. |

Aplicar a seção de UX em cada pacote, inicialmente numa tela-piloto. A classificação dos IDs nos pacotes é organizacional; vários compartilham implementação. Uma dependência de outro módulo ou de serviço externo não impede avançar nos itens independentes, mas permanece pendência de conclusão do requisito. Destacá-la não autoriza desenvolver a origem nem omitir o requisito.

<a id="testes"></a>
## 8. Testes, evidências e regra de conclusão

### 8.1 Testes técnicos e operacionais

| Teste | Verificação objetiva |
|---|---|
| **Persistência** | Criar, salvar, recarregar e consultar de outra sessão autorizada; não depender de estado local. |
| **Completude do credenciamento** | Exigências por tipo, upload falho, documento faltante, envio completo e processo real; nada é resolvido só por marcar checkbox. |
| **Idempotência e concorrência** | Repetir submissão, trâmite, homologação, saída de mudas, aviso e emissão pertinente; mesmo evento não gera dois efeitos. Duas sessões não confirmam estado contraditório. |
| **Autorização** | Menu e API, documento, processo, geometria e o mesmo portal no desktop/Chrome do celular; tentar IDs de outro interessado/órgão. |
| **Fluxo** | Encaminhamento muda caixa/situação/histórico; transição não permitida é recusada. Homologação externa é recusada. |
| **Matriz/cálculo** | R1/R2/R3 produzem E-DEMO-01/02/03 e R$ 240/320/480. Simulação e processo coincidem com mesma regra; ausência/conflito não gera isenção inventada. |
| **Débitos** | A sem pendência, B com R$ 80,00, erro de consulta como erro. Não contaminar DUA de A com débito de B. |
| **DUA** | Conferir emissor/leiaute/contrato identificado, interessado, valor, vínculo e reemissão real. Fixture não comprova documento de arrecadação válido. |
| **Calendário** | Dias/meses/anos em ambos os grupos; testar fim de mês e ano bissexto segundo regra documentada, sem conversão aproximada arbitrária. |
| **E-mail** | Recebimento em caixas controladas; externos e internos nos itens 42/43; retry, falha e não duplicação. Log de aplicação não prova entrega. |
| **Assinatura** | Arquivo assinado por certificado adequado; validação aplicável, comparação da versão interna/portal e rejeição da cópia adulterada. |
| **Autenticidade** | Consulta individual da licença e parecer, chave inexistente, versão correta e escopo de divulgação. Não confundir hash com validação da assinatura. |
| **Geografia** | Datum persistido/usado, fixture de transformação quando houver, marcação sobre imagem real disponível, polígono reaberto e geometria inválida recusada. |
| **Mapa completo** | Conjunto 23 e situação 8/9/6; filtro 8; mudança 7/10/6. Não limitar aos dez registros da página. Sem posição não vira coordenada inventada. |
| **Peças** | 13 peças acessíveis, anexação em andamento N→N+1, ordem/versões e assinatura anterior intacta. |
| **Documentos** | Dois modelos de um tipo e um de outro; selecionar/imprimir vários; relatório com duas imagens inseridas e conteúdo fiel. |
| **Webapp no Chrome / website** | Usar o mesmo site: denúncia no Chrome do celular, outra no computador e consulta móvel do mesmo licenciamento. Testar em aparelho real, com toque/teclado virtual/recarga e falha de rede. Sem instalação ou app separado. |
| **Mudas** | 100+20−30=90 de M-A, 40 de M-B, total 130; cadastro/espécie/canteiro conservados, sem baixa duplicada. |
| **Integração externa** | Intercâmbio real em ambiente autorizado, autenticação, dado correlato no processo, erro e retry. Mock é somente teste de contrato. |
| **UX** | Fonte/densidade consistentes, página real, filtro global, mapa completo, exportação integral, retorno à ficha, zoom, teclado e Chrome em celular real. |
| **Dados de outros módulos** | Evidência identifica a fonte real, dado consumido e dependência. Não há cadastros gerais paralelos, alteração de módulo de origem ou falsa regularidade em caso de falha. |

Esses testes são meios técnicos de conferir as funções, não novos requisitos numerados do edital. Resultados esperados da base fictícia não devem ser hardcoded na interface ou nos relatórios.

### 8.2 Matriz a ser entregue pelo agente

Manter **uma linha para cada ID**, preenchida com informações realmente encontradas/executadas. Reutilizar o local de documentação do repositório. Um nome como `docs/poc/meio-ambiente-status.md` é sugestão, não caminho confirmado.

```markdown
| ID | Estado | Tela/rota real | Serviço e persistência | Teste executado | Evidência | Dependência/limite |
|---|---|---|---|---|---|---|
| MEA-001 | A_VERIFICAR | A mapear | A mapear | Não executado | — | Fonte de CEP |
```

Estados sugeridos: `A_VERIFICAR`, `EXISTE_NAO_TESTADO`, `PARCIAL`, `A_IMPLEMENTAR`, `VALIDADO`, `DEPENDENCIA_OUTRO_MODULO`, `BLOQUEADO_EXTERNO`, `AGUARDA_DEFINICAO`. Um item pode ter a parte ambiental concluída e ainda depender de outro módulo, configuração externa ou decisão administrativa; registrar as duas coisas, sem esconder uma no texto de sucesso. No campo Dependência/limite, informar DEP-xx, origem real, dados necessários e disponibilidade. Nos itens 18/36, registrar “canal implementado: site no Chrome do celular; aceitação formal não confirmada” sem tratar a ausência de aplicativo separado como defeito desta entrega.

Cada evidência deve indicar: ID, estado inicial, dados, papel do usuário, ação real, resultado observado, documento/arquivo quando houver e teste de persistência/integração pertinente. Para uma função compartilhada, reaproveitar evidência sem suprimir IDs. Listar arquivos alterados, migrations e comandos de teste **somente depois de verificá-los no repositório**.

### 8.3 Quando pode marcar um item como validado

Somente depois de a operação existir, ser executada, persistir, produzir o efeito/documento esperado, respeitar permissão e possuir evidência reproduzível. Itens de e-mail exigem prova de envio/recebimento adequada ao ambiente; assinatura, DUA e órgão externo não são validados por substitutos fictícios. Um item composto, como 58, permanece parcial se uma de suas partes não funcionar.

`VALIDADO` é controle técnico interno, não homologação da comissão. Não concluir “63/63 atendidos” com integração mockada, assinatura decorativa, fila de e-mails sem envio, funções que não operam no Chrome do celular, dados de origem inventados, mapa só da primeira página ou DUA ilustrativa. Também não concluir só com “63 itens documentados”.

<a id="pendencias"></a>
## 9. Definições e dependências que a fonte não resolve

A proposta é avançar no código e em cenários fictícios sem transformar lacunas da fonte em regras municipais inventadas. Registrar no diagnóstico quais informações já existem no CeleriFlow; somente a parte realmente ausente precisa ser solicitada.

### Q-01 — Matriz ambiental, atividades, potencial e valores

**Itens afetados:** principalmente 3, 4, 9, 13, 22, 30, 37, 40 e 46; repercussão no valor da DUA. O TR pede cadastro, vínculos e automatismo, mas não entrega as tabelas/réguas de enquadramento, cálculos, vigência ou tratamento de atividades secundárias.

**Obter/confirmar:** catálogo e critérios efetivos, intervalos/combinações, enquadramento resultante, valores/regras e data de aplicação. **Enquanto isso:** implementar parametrização e testar F-ENQ, sinalizando os valores como demonstração. É possível comprovar que a função é parametrizável sem afirmar correção legal dos valores da fixture. Não bloquear todo desenvolvimento aguardando a tabela, nem considerar a base fictícia configuração de produção.

### Q-02 — DUA e fonte de débitos ambientais

**Itens afetados:** 45 e 48. O texto usa “DUA”, mas não identifica órgão emissor, leiaute/contrato, campos/códigos, reemissão ou ambiente. A fonte para consulta de débitos também precisa ser localizada.

**Destacar — DEP-06:** módulo/serviço de origem, débitos retornados, emissor de DUA já disponível e dados necessários: interessado, licenciamento, valor, referência e arquivo/situação da emissão. Confirmar a configuração efetiva sem presumir órgão emissor. **Neste pacote:** preparar somente os vínculos/chamadas e a apresentação ambiental, consumindo o serviço existente. Se a origem não estiver pronta, registrar a falta, sem desenvolver Arrecadação nem um adaptador fiscal novo. A emissão permanece pendente até teste do mecanismo aplicável. Não gerar dados de pagamento falsos nem concluir regularidade por falha de comunicação.

### Q-03 — Canal definido pelo usuário: o próprio site no Chrome do celular

**Itens afetados:** MEA-018 (denúncia mobile) e MEA-036 (consulta mobile); MEA-031 usa o mesmo site para denúncia pelo website. **Decisão de desenvolvimento fechada:** site/portal responsivo já existente, acessado pela URL no Chrome do celular, com o mesmo frontend, autenticação e backend. Não criar app separado nem exigir instalação de PWA, wrapper, APK/IPA ou publicação em loja.

**Executar agora:** adaptar telas existentes para toque, teclado virtual, leitura, filtros, envio, confirmação e atualização dos dados. Demonstrar em celular real. Registrar evidência separada de cada ID, mesmo quando compartilham o formulário ou a consulta. A falta de aplicativo nativo não é pendência técnica desta adaptação, e o agente não deve iniciar outro projeto para resolvê-la.

**Ressalva documental:** o TR emprega “aplicativo mobile”. A conversa contém a decisão de implementação do usuário, não confirmação formal da comissão sobre a aceitação do acesso pelo navegador para esses itens. Portanto, conservar a citação original e distinguir “webapp testado no Chrome” de “forma de entrega aceita formalmente”. Essa ressalva não altera a instrução de implementar somente o site responsivo nem exige suspender seu desenvolvimento.

### Q-04 — Dados geográficos, datum e imagens

**Itens afetados:** 11, 26, 28, 44 e 57. Faltam conjunto de datums, referências/cartografia aplicáveis, fonte das imagens e cadastros oficiais de restrições.

**Obter/confirmar:** datums suportados/necessários, referência das geometrias, camada de imagens autorizada e regras de publicação. **Enquanto isso:** testar geometrias e camadas de demonstração identificadas, com referência consistente. Não afirmar levantamento oficial nem substituir seleção real de datum por campo textual sem efeito.

### Q-05 — Modelos, extrato, responsabilidade técnica, assinatura e autenticidade

**Itens afetados:** principalmente 2, 23, 25, 27, 34, 47, 49, 56, 58 e 59. O TR descreve capacidades, mas não fornece conteúdo oficial de todos os documentos, padrão do extrato, identificação dos signatários ou a configuração do serviço de assinatura.

**Destacar — DEP-04/05:** modelos/dados de produção, serviços de versão/assinatura/autenticidade já disponíveis e configuração de homologação. **Neste pacote:** compor os documentos ambientais com os componentes existentes e consumir seus resultados; ausência de GED, editor geral ou assinador é dependência, não desenvolvimento autorizado de outro módulo. Assinatura mecânica com certificado de teste deve ser distinguida de validação final com credencial confiável. Não afirmar que criar hash/chave satisfaz a assinatura por certificado.

### Q-06 — Órgão externo e contrato de integração

**Item afetado:** 60. Não são identificados órgão, sistema, API, formato, autenticação ou operação a integrar.

**Destacar — DEP-11:** módulo/serviço que fornece a integração, contraparte/contrato identificados, dados enviados/retornados e ambiente. **Neste pacote:** reutilizar a operação existente e ligá-la ao processo ambiental. Sem serviço/contrato, registrar a dependência e os dados necessários, sem desenvolver conectores de outro módulo nem substituir a contraparte por mock apresentado como real. O item continua pendente até comprovação; não inventar nomes de integrações oficiais.

### Q-07 — Fluxo, tipos, acesso, denúncias e composição dos dados

**Itens afetados:** credenciamento, solicitações, consulta, homologação, relatórios e mapa. A fonte não enumera todas as categorias de credenciado/documentos obrigatórios, transições, efeitos de crítica de débito, campos da denúncia, alcance público de “todos os processos” ou conteúdo do extrato.

**Obter/confirmar:** configuração administrativa existente e suas permissões. **Enquanto isso:** utilizar o fluxo mínimo de ensaio rotulado e preservar arquitetura/permissões. Não criar aprovações adicionais, emissão automática de licença ou publicação indiscriminada por suposição. Não transformar a preferência por menos cliques em dispensa de validação.

### Q-08 — Fontes/credenciais operacionais: CEP, e-mail, calendário e acesso

**Itens afetados:** 1, 6, 7, 21, 42, 43, 50, 51, 53 e avisos adotados em 61. Identificar o que já está configurado: consulta CEP, remetente autorizado, serviço de envio, execução periódica, link de acesso, fuso e política de calendário.

**Destacar — DEP-01/02/07:** fontes de CEP, identidade, contatos, e-mail, acesso e agendamento já configurados, além das caixas de teste autorizadas. **Neste pacote:** implementar os eventos/parâmetros ambientais e consumir os serviços existentes, sem reconstruir provedores ou autenticação. Testes com captura/fixtures devem ser rotulados e falta de serviço de origem deve ser registrada. O teste final de e-mail requer comprovação no ambiente real de homologação; não apresentar entrega apenas pela existência de evento pendente.

<a id="fontes"></a>
## 10. Auditoria documental e fontes

### 10.1 Cobertura do recorte

| Verificação documental | Resultado |
|---|---:|
| Itens na sequência do bloco do TR | 63 |
| IDs individuais neste documento | 63 |
| Citações integrais individuais do item | 63 |
| Itens com implementação, demonstração, aceite e limite descritos | 63 |
| IDs ausentes ou números adicionais na seção item a item | 0 |

A conferência da REV01 comparou cada citação com o PDF, normalizando espaços/quebras, e registrou a inspeção das fronteiras nas páginas 151–155. Nesta REV02, a comparação programática com a REV01 verifica que as 63 citações individuais e as respectivas referências de item/página foram preservadas sem alteração. Não foram incluídos itens de Controle Interno ou Gestão Educacional. As mudanças desta revisão são orientações de canal e de dependências, não alterações do TR.

A lista da seção 2 funciona como índice individual; a seção 6 conserva a redação original e detalha cada entrega; a seção 9 registra definições externas. Não há contagem de funcionalidades já executadas. Uma mesma tela pode atender vários itens, mas nenhum ID some por esse motivo.

### 10.2 Sobreposição de funções sem perda de requisitos

**Revisão 02:** todas as instruções de criar/adaptar aplicativo separado foram substituídas pelo uso do próprio site no Chrome do celular. O diagnóstico de outros módulos é de leitura; os dados/serviços foram destacados em DEP-01 a DEP-11 e nos itens pertinentes. A implementação ambiental não autoriza alterações nos módulos de origem. Não foram inspecionados código, chamadas, telas ou integrações em execução nesta revisão.


| Núcleo compartilhado | IDs relacionados | Cuidados |
|---|---|---|
| Tipo/credenciamento e documentação | 12, 14, 16, 17, 24, 29, 32, 39, 53, 54 | Diferenciar definir exigência, anexar, visualizar, enviar e homologar. Não basta um cadastro de pessoa. |
| Acesso e avisos | 6, 7, 21, 42, 43, 50, 51, 53, 61 | Mensagens têm gatilhos/destinatários diferentes; reaproveitar serviço, não omitir eventos. |
| Atividade/matriz/cálculo | 3, 4, 9, 13, 22, 30, 37, 40, 46 | Cadastro da matriz, enquadramento e valor automáticos, além da simulação externa, são entregas distintas. |
| Modelos e documentos | 2, 23, 25, 27, 34, 47, 49, 56, 58, 59 | Relatório com imagens, extrato, modelo, assinatura e autenticidade não são equivalentes. |
| Processos e portal | 15, 20, 33, 35, 52, 54, 55, 57, 58, 60, 61, 62, 63 | Integrar caixas, peças e situação; mapa/assinatura/órgão externo mantêm seus próprios aceites. |
| Geografia | 11, 26, 28, 44, 57 | Não substituir área por pin, datum por legenda ou mapa completo pela página atual. |
| Viveiro | 8, 19, 38, 41 | Cadastro de espécie/muda/canteiro não substitui movimentação. |
| Canais de atendimento | 18, 31, 36 | Mesmo site: denúncia no Chrome do celular, denúncia no computador e consulta no celular. Testes separados por ID, sem app ou implementação paralelos. |

Os grupos são organização deste plano, não subtítulos nem novos submódulos do TR.

### 10.3 Fontes utilizadas e prevalência

- **TR-MA:** `termo de referencia (Ratificado)(1).pdf`, 335 páginas, Processo Administrativo nº 1026/2026, seção 19, **GESTÃO DE MEIO AMBIENTE**, pp. **151–155**, itens 1–63. Fonte exclusiva das funcionalidades específicas transcritas.
- **TR-G:** mesmo arquivo, pp. 28–33 e 40–44, referências transversais selecionadas na seção 1.3. Não representa uma transcrição integral do núcleo geral.
- **DEC-USUÁRIO — revisão 02:** orientação nesta conversa para usar o próprio site via Chrome no celular, sem aplicativo separado, e apenas destacar dados provenientes de outros módulos. Fonte das decisões de canal e fronteira de desenvolvimento; não modifica o TR.
- **UX-BASE:** `CeleriFlow_POC_Almoxarifado_Patrimonio_Desenvolvimento_REV02.md`, seção 3.7. Fonte do padrão de interface já solicitado pelo usuário. Aqui foram reutilizadas suas decisões de projeto, sem nova afirmação de homologação de normas ou atualização de bibliotecas.

**Prevalência:** requisitos vêm do TR ratificado. Cenários, estados, layouts de tela, valores, dados e estruturas conceituais deste MD são meios de desenvolver/demonstrar. Nenhuma pesquisa externa de taxas, normas ambientais, DUA, APIs ou modelos oficiais foi incorporada. Lacunas permanecem identificadas, sem serem silenciosamente preenchidas por suposição.

**Entrega final esperada:** CeleriFlow adaptado, evidência real de cada MEA-001 a MEA-063, interfaces testadas e pendências discriminadas. Não entregar apenas este plano reformulado nem declarar aprovação da POC sem demonstração do software.
