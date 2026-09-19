# CeleriFlow — Desenvolvimento e demonstração da POC
## Compras, Licitações e Contratos | Divino de São Lourenço/ES

**Revisão 01 — 18/09/2026.**  
**Destinatário:** Codex/Antigravity com acesso ao repositório real.  
**Fonte funcional:** `termo de referencia (Ratificado)(1).pdf`, Processo Administrativo nº 1026/2026, seção 19, bloco **COMPRAS, LICITAÇÕES E CONTRATOS**, páginas **48–54**, itens **1–79**.  
**IDs de rastreabilidade:** `CLC-001` a `CLC-079`, sem alterar os números do TR.  
**Objetivo:** desenvolver/adaptar **um único módulo no CeleriFlow**, incluindo os convênios expressamente presentes no bloco, com operações reais, integrações identificadas e testes reproduzíveis.

> **Ordem ao agente:** examinar o código, localizar o que já funciona, implementar as lacunas deste módulo, executar os testes e entregar evidências por ID. Não entregar apenas outro planejamento, telas estáticas, PDFs preparados ou botões sem efeito. Não declarar integração concluída por existir uma coluna chamada “SIAFIC” ou um botão “PNCP”.

**Decisões do usuário:** preservar a identidade do CeleriFlow; trabalhar com telas estruturadas, tabelas paginadas e sem rolagem global nas listagens de desktop de referência; usar o **mesmo site no Chrome do celular**, sem aplicativo separado. **Dados de outros módulos devem ter a origem destacada.** Este pacote não autoriza reconstruir Contabilidade, Almoxarifado, Pessoas, Protocolo ou outros módulos.

**Limite desta entrega:** este é um plano documental. O repositório, as telas, os serviços, os acessos ao PNCP e os leiautes do Tribunal não foram inspecionados/testados. Os 79 itens têm orientação individual, mas não estão declarados implementados, homologados ou aprovados na POC.

**Leitura da fonte:** somente o campo **TR** reproduz a exigência original. Redação, repetições, siglas, subtítulos e denominações da fonte foram preservados; normalizaram-se apenas espaços/quebras de linha. **Implementação, demonstração, valores, telas, campos auxiliares, estados e aceites são decisões de projeto/ensaio**, não um roteiro oficial da comissão nem novas obrigações atribuídas ao edital. Não aplicar regras jurídicas ou operacionais presumidas para preencher lacunas.

**Navegação:** [Escopo](#escopo) · [79 itens](#lista) · [Outros módulos](#dependencias) · [Contratos de operação](#operacao) · [Interface ERP](#ux) · [Base fictícia](#base) · [Item a item](#itens) · [Pacotes](#pacotes) · [Testes e auditoria](#testes) · [Definições pendentes](#definicoes) · [Fontes](#fontes)

---
<a id="escopo"></a>
## 1. Escopo controlado

### 1.1 Um módulo; não 79 telas nem outro ERP

Ler as instruções locais (`AGENTS.md` se existir), manifests, lockfile, migrations, convenções de autenticação/permissões e testes. Confirmar a stack, os serviços, as entidades e as rotas no repositório. Não impor ORM, versão de biblioteca, infraestrutura ou caminhos inventados.

Localizar o cadastro único de pessoas/fornecedores, catálogo de materiais e serviços, dotações, SIAFIC/Contabilidade, Estoque, Processos/GED, portal de fornecedores, e-mail, relatórios e adaptadores existentes. Nos módulos de origem, fazer diagnóstico de leitura; usar os serviços disponíveis. Alterações de fronteira indispensáveis, mas indisponíveis, ficam registradas como dependência, não são implementadas silenciosamente neste pacote.

Uma entrada de menu **Compras, Licitações e Contratos**, com áreas internas, deverá reunir fornecedores, demandas/planejamento, pesquisas, processos/disputa, contratos/convênios, fornecimento e relatórios. Preservar o ponto de entrada equivalente já existente quando adequado. Não manter versões “antiga” e “POC” independentes, outro login ou cadastros paralelos. Não apagar rotinas/dados existentes; usar alterações incrementais e escopo de órgão/unidade já adotado.

| Natureza | Significado | Regra de execução |
|---|---|---|
| **TR-E** | Item 1–79 do bloco específico. | Implementar todas as ações e campos expressos, inclusive itens repetidos na rastreabilidade. |
| **TR-G** | Requisito geral citado na seção 1.3. | Reutilizar o núcleo; registrar lacunas gerais separadamente. |
| **TEC** | Persistência, segurança, transação, validação e teste. | Meios internos para a função operar corretamente; não novos processos de negócio. |
| **UX/CANAL** | Orientação do usuário. | Interface profissional e mesmo site no Chrome do celular. |
| **DEP-MOD / DEP-EXT** | Informação/serviço de outra origem ou definição externa. | Identificar, consumir o existente e comprovar; ausência não equivale a atendimento. |
| **EXTRA** | Função sem vínculo à fonte ou orientação do usuário. | Não desenvolver neste pacote. |

Antes de criar ação de negócio, campo obrigatório ou etapa, registrar o ID que a justifica. Campos técnicos, usuário e datas de registro devem ser obtidos automaticamente sempre que possível. Não transformar todo dado sugerido de ensaio em documento obrigatório.

### 1.2 O que não acrescentar — e o que não pode ser removido

Não acrescentar: IA para julgar licitação, coleta automática de preços em lojas, assinatura de banco comercial de preços, criação de minutas/pareceres jurídicos por IA, publicação paga em jornal/DOU, atendimento jurídico, pagamento bancário, emissão de notas fiscais, contas a pagar paralelo, estoque próprio de Compras, cadastro independente de fornecedores, aplicativo nativo/híbrido/PWA obrigatório, WhatsApp/SMS/push, chat genérico, avaliação comercial de fornecedor, análise preditiva ou um construtor de ERP.

Os itens 1/20 pedem **identificação ME/EPP**; não importar percentuais de desempate, preferências, exclusividade ou fórmulas legais de outros editais como requisitos adicionais. O item 22 pede armazenar os tipos citados; não pressupõe, sozinho, construir todos os motores de julgamento possíveis. Preservar regras válidas já configuradas e identificar o que for necessário à sessão efetivamente adotada em Q-04.

**Não remover como “extra”:** pesquisa de preços com portal e e-mails; certidões e links de regularidade; CNAE; agrupamento de solicitações; caminho digital de dispensa e licitação; registros de recursos/impugnação/pareceres/atas; reordenação de fases; **disputa e lances do pregão pelo fornecedor no celular**; contratos **e convênios**; medições/parcelas; integrações SIAFIC/Contabilidade e Estoque; AE/AF/AL, anulações e complemento; arquivos do Tribunal; integração PNCP.

**Este bloco não é apenas cadastro administrativo de editais.** Um registro manual de resultado não substitui a disputa de CLC-039/041/043/046, e um relatório financeiro local não substitui empenho/liquidação efetivos de CLC-057/060.

### 1.3 Requisitos gerais preservados, sem recontá-los como itens novos

| Capacidade | Fonte no TR ratificado | Aplicação |
|---|---|---|
| Web, responsividade e integração | Ambiente Tecnológico, itens 1, 4, 7 e 16, pp. 28–29. | Mesmas identidades/dados entre interno, portal e celular. |
| Transações e integridade | Recuperação de Falhas, itens 5–8, p. 31; Caracterização Operacional, itens 1–2, p. 32; Gerais 18–19, 24–25 e 30–31, pp. 41–42. | Não confirmar parcialmente lance, autorização ou integração; não perder vínculos. |
| Perfis, setores, histórico e segregação | Caracterização Operacional, itens 3–7, pp. 32–33; Gerais 9–13, 27 e 29, pp. 41–42. | Servidor valida permissões; solicitante, fornecedor, pregoeiro e atestador têm competências distintas. |
| Relatórios e impressão | Ambiente Tecnológico 8–9, p. 28; Relatórios 1–3, p. 33; Gerais 14–16, p. 41. | Prévia e emissão pelo núcleo; formatos gerais PDF, XLSX, TXT e CSV conforme aplicáveis. |
| Cadastro único, ajuda e PDF assinado | Gerais 17, 21 e 33–38, pp. 41–42. | Reutilizar os serviços, sem outro cadastro/assinador. Consultas gerais não são comprovadas por dados fictícios locais. |

Este recorte não substitui a auditoria completa de todos os requisitos gerais. Os relatórios específicos não viram remessas oficiais só porque são exportados em XML/CSV/PDF.

<a id="lista"></a>
## 2. Lista dos 79 itens na organização da fonte

Títulos resumidos abaixo são de navegação. A seção 7 traz **a transcrição integral** e a orientação de cada número. Mantêm-se os cinco subtítulos originais, inclusive “Convênios;” e “Contratos:”.

### Cadastro de Fornecedores:

| ID / item | Ação resumida | Página do PDF |
|---|---|---:|
| [CLC-001 / 1](#clc-001) | Identificação das empresas como ME e EPP | 48 |
| [CLC-002 / 2](#clc-002) | Pesquisa de fornecedores por nome, documento, enquadramento e situação | 48 |
| [CLC-003 / 3](#clc-003) | Validades de certidões/documentos e relatórios | 48–49 |
| [CLC-004 / 4](#clc-004) | Cadastro CNAE vinculado ao fornecedor | 49 |
| [CLC-005 / 5](#clc-005) | Fornecedores pessoas físicas e jurídicas | 49 |
| [CLC-006 / 6](#clc-006) | Campos condicionais de CPF e CNPJ | 49 |
| [CLC-007 / 7](#clc-007) | Links de consulta de regularidade | 49 |
| [CLC-008 / 8](#clc-008) | Exportação automática de fornecedores ao SIAFIC | 49 |
| [CLC-009 / 9](#clc-009) | Pesquisa de fornecedores — repetição do item 2 | 49 |

### COMPRAS E LICITAÇÕES:

| ID / item | Ação resumida | Página do PDF |
|---|---|---:|
| [CLC-010 / 10](#clc-010) | Pesquisa de preços e referência da contratação | 49 |
| [CLC-011 / 11](#clc-011) | Agrupamento de solicitações para pesquisa de preços | 49 |
| [CLC-012 / 12](#clc-012) | Quadro comparativo com menores preços destacados | 49 |
| [CLC-013 / 13](#clc-013) | Convite por e-mail com identificação, link e chave | 49 |
| [CLC-014 / 14](#clc-014) | Grade do portal com compra, fornecedor e itens | 49 |
| [CLC-015 / 15](#clc-015) | E-mail ao solicitante após resposta do fornecedor | 50 |
| [CLC-016 / 16](#clc-016) | Relatório dos preços ofertados pelo fornecedor | 50 |
| [CLC-017 / 17](#clc-017) | Janela configurável e indisponibilidade após encerramento | 50 |
| [CLC-018 / 18](#clc-018) | Data de apresentação da proposta | 50 |
| [CLC-019 / 19](#clc-019) | Bloqueio de respostas de fornecedores inativos ou bloqueados | 50 |
| [CLC-020 / 20](#clc-020) | Identificação ME/EPP no processo — repetição do item 1 | 50 |
| [CLC-021 / 21](#clc-021) | Ciclo digital completo de materiais e serviços | 50 |
| [CLC-022 / 22](#clc-022) | Cadastro completo das informações do processo | 50 |
| [CLC-023 / 23](#clc-023) | Solicitações de compras e serviços por unidades autorizadas | 50 |
| [CLC-024 / 24](#clc-024) | Planejamento de compras futuras | 50 |
| [CLC-025 / 25](#clc-025) | Dotação contábil vinculada a cada item da solicitação | 50–51 |
| [CLC-026 / 26](#clc-026) | Comissões, pregoeiros e leiloeiros | 51 |
| [CLC-027 / 27](#clc-027) | Integração Estoque, Compras, Licitações e Contratos sem redundância | 51 |
| [CLC-028 / 28](#clc-028) | Registro do processo licitatório e requisições de origem | 51 |
| [CLC-029 / 29](#clc-029) | Cadastro de pessoas no contexto de compras | 51 |
| [CLC-030 / 30](#clc-030) | Agrupamento de solicitações para formalizar a licitação | 51 |
| [CLC-031 / 31](#clc-031) | Vínculo contábil por item — repetição do item 25 | 51 |
| [CLC-032 / 32](#clc-032) | Acompanhamento das etapas e emissão dos documentos do processo | 51 |
| [CLC-033 / 33](#clc-033) | Reordenação das fases do processo | 51 |
| [CLC-034 / 34](#clc-034) | Numeração por modalidade | 51 |
| [CLC-035 / 35](#clc-035) | Relatório de vencedores de preços | 51 |
| [CLC-036 / 36](#clc-036) | Menores preços no comparativo — repetição do item 12 | 51 |
| [CLC-037 / 37](#clc-037) | Situações do processo licitatório | 51–52 |
| [CLC-038 / 38](#clc-038) | Arquivos de prestação de contas de licitações e contratos ao Tribunal | 52 |
| [CLC-039 / 39](#clc-039) | Registro de lances pelo fornecedor no celular | 52 |
| [CLC-040 / 40](#clc-040) | Integração PNCP no contexto de compras/licitações | 52 |
| [CLC-041 / 41](#clc-041) | Gerenciamento e acompanhamento da disputa e lances | 52 |
| [CLC-042 / 42](#clc-042) | Registro sintético dos participantes do pregão | 52 |
| [CLC-043 / 43](#clc-043) | Tela dos licitantes com lote, status, participantes e valor | 52 |
| [CLC-044 / 44](#clc-044) | Alteração do status de item/lote pelo pregoeiro | 52 |
| [CLC-045 / 45](#clc-045) | Habilitação e inabilitação pelo pregoeiro/equipe de apoio | 52 |
| [CLC-046 / 46](#clc-046) | Lances pelo celular — repetição do item 39 | 52 |
| [CLC-047 / 47](#clc-047) | Atualização para arrematado ao encerrar a negociação | 52 |
| [CLC-048 / 48](#clc-048) | Integração PNCP no contexto do procedimento e resultado | 52 |

### Convênios;

| ID / item | Ação resumida | Página do PDF |
|---|---|---:|
| [CLC-049 / 49](#clc-049) | Registro de contratos e convênios com vigência calculada | 52 |
| [CLC-050 / 50](#clc-050) | Aditivos, suspensões e rescisões com motivo e data | 52 |
| [CLC-051 / 51](#clc-051) | Responsáveis, representantes, signatários e grupos do convênio | 52 |
| [CLC-052 / 52](#clc-052) | Exportação automática dos contratos ao SIAFIC | 52 |
| [CLC-053 / 53](#clc-053) | Relatório de razão de contratos e convênios | 52 |
| [CLC-054 / 54](#clc-054) | Medições e etapas de execução de contratos e convênios | 52 |
| [CLC-055 / 55](#clc-055) | Parcelas de contratos e convênios | 53 |

### Fornecimento

| ID / item | Ação resumida | Página do PDF |
|---|---|---:|
| [CLC-056 / 56](#clc-056) | Geração automática da solicitação/autorização de empenho — AE | 53 |
| [CLC-057 / 57](#clc-057) | Empenho da despesa por integração contábil | 53 |
| [CLC-058 / 58](#clc-058) | Geração e autorização automática do fornecimento — AF | 53 |
| [CLC-059 / 59](#clc-059) | Registro automático do ateste e autorização de liquidação — AL | 53 |
| [CLC-060 / 60](#clc-060) | Liquidação da despesa por integração contábil | 53 |
| [CLC-061 / 61](#clc-061) | Anulação de AE já reconhecida como despesa | 53 |
| [CLC-062 / 62](#clc-062) | Anulação do fornecimento autorizado — AF | 53 |
| [CLC-063 / 63](#clc-063) | Anulação do ateste/autorização de liquidação — AL | 53 |
| [CLC-064 / 64](#clc-064) | Complementação de AE já reconhecida como despesa | 53 |
| [CLC-065 / 65](#clc-065) | Relatório de autorização de empenho — AE | 53 |
| [CLC-066 / 66](#clc-066) | Relatório de autorização de fornecimento — AF | 53 |
| [CLC-067 / 67](#clc-067) | Relatório de anulação de AE | 53 |
| [CLC-068 / 68](#clc-068) | Relatório de anulação de AF | 53 |
| [CLC-069 / 69](#clc-069) | Relatório de anulação de AL | 53 |
| [CLC-070 / 70](#clc-070) | Relatório de razão de AF | 53 |
| [CLC-071 / 71](#clc-071) | Relatório de razão de AL | 53 |

### Contratos:

| ID / item | Ação resumida | Página do PDF |
|---|---|---:|
| [CLC-072 / 72](#clc-072) | Contratos e convênios com campos completos — repetição do item 49 | 53–54 |
| [CLC-073 / 73](#clc-073) | Aditivos, suspensões e rescisões — repetição do item 50 | 54 |
| [CLC-074 / 74](#clc-074) | Responsáveis, representantes, signatários e grupos do contrato | 54 |
| [CLC-075 / 75](#clc-075) | Exportação de contratos ao SIAFIC — repetição do item 52 | 54 |
| [CLC-076 / 76](#clc-076) | Relatório de razão de contratos | 54 |
| [CLC-077 / 77](#clc-077) | Medições e etapas dos contratos | 54 |
| [CLC-078 / 78](#clc-078) | Parcelas de contratos e convênios — repetição do item 55 | 54 |
| [CLC-079 / 79](#clc-079) | Integração PNCP no contexto contratual | 54 |


<a id="dependencias"></a>
## 3. Dados de outros módulos e integrações

**Origens previstas, não confirmadas no repositório.** Se o SIAFIC for o próprio núcleo contábil do CeleriFlow, usar esse núcleo real; não presumir fornecedor externo nem criar outro sistema. Integração pode usar a arquitetura existente, mas sempre precisa produzir o resultado na origem/destino competente.

| Referência | Origem/destino previsto | Dados/ações utilizados por Compras | Limite de trabalho |
|---|---|---|---|
| **DEP-01** | Pessoas / Fornecedores / Cadastros | Identificador, PF/PJ, documento, nome, contatos, ME/EPP, situação, CNAE e pessoas responsáveis. | Usar cadastro único e seu formulário/serviço existente. Metadados específicos de compras podem ser extensões vinculadas, não outra identidade. |
| **DEP-02** | Administração / Autenticação / Organograma | Usuários, unidade gestora, órgão/setor, perfis e competências. | Configurar a entrada e permissões pela convenção atual; não implementar RH, outro login ou organograma. |
| **DEP-03** | Materiais / Serviços / Almoxarifado | Catálogo, unidade, classificação, AF/entrada, recebimento e posição quando pertinente. | Compartilhar IDs e consumir/acionar serviços existentes. Não recriar estoque nem atualizar saldo por escrita direta em tabelas alheias. |
| **DEP-04** | Contabilidade / SIAFIC | Fornecedor/credor, contratos, dotações por item, empenho, liquidação, anulações/complementos e retornos. | Implementar vínculos/chamadas do lado de Compras; não criar plano de contas, razão contábil, liquidador ou simulador financeiro para alegar integração. |
| **DEP-05** | Processos / Protocolo / GED | ID do processo, peças, versões, pareceres, atas, anexos e tramitação quando compartilhada. | Conectar o processo de compras ao registro real; não reconstruir Protocolo ou GED. Reordenação específica de fases permanece no escopo de CLC-033. |
| **DEP-06** | Portal / E-mail / Convites | Sessão externa, convite com chave, destinatários, envio e retorno. | Mesmas páginas/serviços no desktop e Chrome do celular. Fornecer eventos de cotação; não criar provedor de e-mail ou aplicativo independente. |
| **DEP-07** | Relatórios / Modelos / Ajuda / Assinatura | Prévia, documentos, impressão/exportação e recursos gerais. | Criar os modelos/consultas específicos; reutilizar o motor geral. |
| **DEP-08** | Integrações PNCP | Contrato técnico vigente/aplicável, credenciais, operação, payload, identificador e retorno. | Usar o adaptador existente ou implementar sua parte no escopo deste módulo após definição. Não inventar API nem afirmar envio só com um botão. |
| **DEP-09** | Exportador do Tribunal de Contas | Leiaute, versão/competência, campos, códigos e validações de licitações/contratos. | Gerar o artefato exigido com fonte identificada; não inventar XML ou protocolo, nem reconstruir outras remessas do ERP. |
| **DEP-10** | Referências configuradas | Tabela CNAE e destinos de consulta INSS/FGTS/Fazendas; regras do processo e modalidade. | Confirmar fontes e mapeamentos. Links são navegação, não certidões obtidas automaticamente. |

**Regra operacional:** diagnosticar por leitura a origem, registrar os dados necessários e usar a operação disponível. Não desenvolver o módulo de origem, alterar suas migrations/regras ou copiar bases para contornar a ausência do serviço. Registrar `DEPENDENCIA_OUTRO_MODULO` com ID afetado, dado/operação faltante e caminho real encontrado. Continuar os requisitos independentes.

**Aqui há integrações obrigatórias no texto**, diferentemente de vínculos opcionais de Frotas: CLC-008, 025, 027, 031, 052, 057, 060 e 075 não ficam concluídos somente com telas locais. As anulações e o complemento também precisam respeitar efeitos já registrados em Contabilidade/Estoque. Não retirar a integração por chamá-la de dependência.

Compartilhar a entidade canônica no mesmo banco não é criar redundância. Uma projeção técnica/evento auditável pode ser necessária, mas não deve criar dois cadastros independentes com manutenção manual. Referências históricas de preço/nome/versão documental não substituem nem duplicam o cadastro mestre.

**Destaque em cada item:** “Dados de outro módulo / serviço compartilhado”, com DEP correspondente e informação consumida. Rotas e nomes de serviços serão preenchidos pelo agente após inspeção. Dados fictícios nos módulos de origem serão cadastrados pelo usuário ou pelas rotinas de teste já existentes; mocks só comprovam teste isolado, nunca integração realizada.

<a id="operacao"></a>
## 4. Contratos de operação para desenvolvimento

### 4.1 Pessoas, documentos e situação do fornecedor

Separar tipo de pessoa PF/PJ, enquadramento ME/EPP/outro, atividade CNAE, situação cadastral e situação documental. Um fornecedor com certidão vencida não deve ser automaticamente marcado inativo/bloqueado sem regra configurada. CLC-019 exige bloquear respostas de **inativos e bloqueados**; não inventa uma política de inativação por certidão.

CNAE exige código/descrição de referência identificada. Não gerar códigos fictícios como se fossem oficiais; usar códigos reais já disponíveis no cadastro de referência para os fornecedores fictícios. Validação PF/PJ opera também no servidor. Alternar tipo no formulário não deixa um documento incompatível gravado. Não desativar os validadores de produção para facilitar a POC.

Certidões/documentos têm tipo, fornecedor, identificação pertinente, data de validade e situação derivada; relatórios usam essas datas. Os cinco grupos de links de regularidade devem existir com URLs configuradas/verificadas. Não presumir que “abrir link” realiza consulta ou emite certidão. Correspondência de nomenclaturas/destinos fica em Q-06.

### 4.2 Solicitações, agrupamento e planejamento

Uma solicitação conserva órgão/unidade, solicitante autorizado, material/serviço, unidade, quantidade e referências de dotação por linha quando aplicáveis. Os identificadores canônicos são os mesmos nos módulos relacionados. Planejamento registra necessidade futura e estimativa, sem abrir automaticamente uma contratação nem reservar saldo por suposição.

Agrupar para **pesquisa de preços** (11) e agrupar para **procedimento licitatório** (30) são usos diferentes da mesma capacidade. Preservar as linhas/origens e seus quantitativos. Somar somente itens equivalentes: mesmo identificador, especificação/unidade e características que determinam equivalência; não somar resma com caixa nem material com serviço. Um agrupamento não apaga a autoria ou a dotação de cada demanda e não pode reutilizar quantidade já consumida como se fosse nova.

A pesquisa pode estimar a despesa e permitir confrontá-la com a informação orçamentária real. Sem retorno contábil, mostrar disponibilidade não verificada, nunca “recursos suficientes”. Planejar ou cotar não é empenhar.

### 4.3 Pesquisa de preços, portal e e-mails

Manter ciclo separado de **cotação de referência**, **proposta de licitação** e **lance/negociação**. Podem compartilhar componentes, mas uma cotação de fornecedor não vira vencedora de contratação automaticamente.

Ao convidar, enviar identificação do processo/pesquisa, link e chave com escopo do fornecedor, pelo serviço já usado. A frase do item 13 é preservada; o plano a usa como envio **ao e-mail do fornecedor**, conforme contexto do portal e confirmação a validar em Q-06. Não enviar senha permanente. Não expor token completo em log, relatório ou tela de outro fornecedor.

A grade externa mostra os dados da compra, o próprio fornecedor e todos os itens solicitados. Salvar rascunho não é apresentar proposta. Ao enviar resposta final, registrar data/hora pelo servidor, persistir preços e disparar o e-mail ao solicitante **após** a confirmação. Fornecedor pode emitir relatório dos próprios preços. Sem autorização, não deve acessar respostas de outro fornecedor.

Janela temporal configurável, validada no servidor ao abrir a resposta e ao confirmar. Para teste, usar início incluso e fim exclusivo, documentando essa decisão. Depois do encerramento, o link da pesquisa mostra indisponibilidade/encerramento e não permite reabrir a pesquisa ou gravar resposta; o histórico interno permanece preservado. Não apagar processos/documentos para cumprir CLC-017. A política de consulta posterior do próprio comprovante fica separada da disponibilidade da pesquisa e registrada em Q-06.

E-mails precisam de envio/recebimento demonstrável em caixas autorizadas. Fila, log ou template não provam entrega. Falha de envio deixa pendência, não desfaz uma resposta já salva nem produz novo envio duplicado para o mesmo evento. Captura local/fixture é teste identificado como tal.

Quadro comparativo conserva preço unitário, quantidade/unidade e total por item/fornecedor. Destacar **todos** os menores preços empatados; falta de resposta é ausência, não preço zero. Metodologia do preço de referência deve estar identificada; a média aritmética da base de teste é escolha demonstrativa, não método imposto pelo TR ou validado juridicamente. Não retirar valores discrepantes por regra inventada.

### 4.4 Processos, fases e disputa do pregão

Manter informações completas de CLC-022; não omitir “entrega de envelopes”, base legal ou tipos de julgamento porque a aplicação é web. Esses campos podem ser condicionais à modalidade, mas permanecem disponíveis quando pertinentes. Modalidades/tipos são dados configurados; uma opção cadastral não comprova motor de julgamento automático.

CLC-032 tem **nove alíneas textuais**, com ações compostas em algumas delas. Registrar publicação; emitir quadro e atas de documentação/julgamento; registrar recurso, anulação, revogação, impugnação, parecer da comissão, parecer jurídico, homologação e adjudicação. Usar processos/cópias de teste independentes para situações incompatíveis. Não exigir que um mesmo processo seja homologado, anulado e revogado numa sequência fictícia impossível.

Reordenar fases significa alterar a sequência configurável do processo, não reescrever eventos já praticados ou liberar qualquer ação a qualquer usuário. Reaproveitar o fluxo e preservar versões/histórico. Numeração usa contador por modalidade no escopo de órgão/exercício adotado, com unicidade/concorrência; não mudar números antigos ao editar a modalidade.

**Disputa é funcionalidade própria exigida:** sessões de fornecedor e pregoeiro distintas; registro efetivo de lances pelo fornecedor; aceitação pelo servidor conforme estado/regra; grade de acompanhamento atualizada; alteração de estado pelo pregoeiro; habilitação/inabilitação com escopo definido; encerramento da negociação atualiza o item/lote para arrematado quando houver resultado válido.

O mesmo site no Chrome do celular registra o lance; não basta que um operador interno digite por conta do fornecedor. Usar autenticação/permissões do portal. Valores em decimal; ordem/data de recepção autoritativas do servidor; repetição do mesmo envio não cria outro lance. Dois envios concorrentes são avaliados na ordem efetivamente aceita e segundo a regra configurada, nunca segundo relógio local do navegador. Timeout incerto deve permitir recuperar a confirmação pelo identificador, não incentivar duplicação.

A tela dos licitantes mostra **status, número do lote, licitantes e valor**, inclusive no celular. Identificadores de participantes e a possibilidade de divulgar nomes por fase precisam seguir a configuração aplicável, sem exposição indevida por suposição; não esconder a coluna “licitantes” como solução. Usar identificação de participante/alias quando essa for a política validada. Q-04 registra o ponto. Atualizar por recurso existente de consulta/notificação; não impor WebSocket ou outra infraestrutura apenas para satisfazer o layout.

Não fixar duração de sessão, modo aberto/fechado, diferença mínima, desempate, preferência ME/EPP, tratamento de empate ou critérios de desclassificação com base em outro edital. O ensaio abaixo define apenas uma sessão simples de menor preço; configuração operacional real depende de Q-04. **Arrematado, habilitado, adjudicado, homologado e contratado são estados distintos.** Não executar os demais automaticamente por fechar a negociação.

### 4.5 Contratos e convênios, execução e vigência

Uma estrutura de instrumentos com tipos distintos pode suportar contratos e convênios. Preservar número/ano, fornecedor/contraparte conforme o instrumento e a redação do requisito, objeto, datas inicial/final, prazos, valores e quantidades contratadas. Responsáveis, representantes, signatários e agrupamentos são relações com pessoas, não uma lista de nomes solta.

Vigência usa datas de calendário, sem confundir duração com prazo de entrega. Para os ensaios, a contagem exibida é inclusiva: `dias = (data_final - data_inicial) + 1`; identificar a convenção na tela. Regras reais e suspensão/retomada de prazos dependem da configuração administrativa. Não prorrogar automaticamente porque houve suspensão.

Aditivo, suspensão e rescisão são eventos com motivo/data, versão do instrumento e efeitos definidos. Não sobrescrever o valor original ou apagar documentos anteriores. O plano não fixa limites legais de aditivo nem transforma um percentual fictício em autorização normativa.

Medição/etapa descreve execução efetiva, com período, quantidade/unidade, valor e referência do instrumento. Parcela descreve programação/obrigação contratual; **medição, parcela, autorização, empenho e liquidação não são cinco gastos somáveis**. O relatório razão apresenta seus efeitos em colunas/categorias próprias, com totais de significado claro. Convenções de saldo/razão ficam em Q-05.

Não declarar parcela paga sem retorno de origem financeira. Uma medição de serviço não aumenta estoque. Execução física, fornecimento autorizado, ateste e valor liquidado permanecem distinguíveis.

### 4.6 AE, AF, AL e integração contábil — sem duplicar o fato

Preservar as siglas usadas no TR e esclarecer sua função na interface: **AE — solicitação/autorização de empenho; AF — autorização de fornecimento; AL — autorização de liquidação/ateste**. Não substituir AE por empenho efetivo nem AL por liquidação efetiva. A redação de CLC-021 contém “autorização de fornecimento/liquidação”; ela permanece na citação e não apaga a distinção dos itens 56–60.

Caminho proposto de ensaio, não rito jurídico novo:

```text
solicitação → pesquisa/processo aplicável → resultado/contrato
→ AE derivada dos dados autorizados → empenho confirmado pela Contabilidade
→ AF derivada do fornecimento → recebimento material / execução do serviço
→ ateste identificado + AL derivada → liquidação confirmada pela Contabilidade
```

“Automático” significa gerar os registros, linhas e vínculos a partir do evento válido, sem redigitação. A competência de autorizar ou atestar permanece com usuário habilitado no fluxo existente; não comprovar entrega física apenas porque o relógio avançou ou a AF foi emitida. Uma única ação autorizada pode confirmar o ato e gerar a documentação derivada. Não acrescentar níveis de aprovação só para seguir o desenho.

O lançamento contábil pertence à Contabilidade. A chamada deve devolver referência/estado real; se houver falha ou processamento pendente, mostrar isso. Evitar “empenhado” ou “liquidado” em coluna local sem comprovação do lançamento correspondente. Se base única, usar serviço/transação do domínio competente; se integração assíncrona, correlacionar pedido/retorno e recuperar falhas, sem sucesso fictício.

**Materiais e serviços devem ser testados separadamente.** AF de material integra a origem/entrada no Almoxarifado pelo serviço existente (compatibilizar com ALM-009). AF de serviço acompanha execução/medição sem criar estoque. Não exigir a mesma natureza de recebimento para ambos. Quando a integração usa pré-entrada, demonstrar também a entrada efetiva; registrar em Q-01 o gatilho aplicado.

Para cada linha do contrato/solicitação e documento derivado, conservar quantidade/unidade, preço/valor, origem e seus limites. Não comprometer/autorizar/atestar/liquidar mais que os saldos válidos do fluxo. Quantidade não pode ser apropriada duas vezes por estar em duas AF ou em duas páginas do mesmo documento. Valor financeiro usa decimal e precisão consistente. Contexto real de datas, retenções ou regras adicionais vem do núcleo; não calcular tributos de compra por suposição.

### 4.7 Anular e complementar com histórico e efeitos coerentes

Anulação é novo evento vinculado, com data/motivo/usuário e efeito rastreável; não excluir AE, AF ou AL nem alterar apenas sua cor. Testar anulações dos três tipos. Complemento de AE altera o saldo autorizado do documento pelo valor/quantidade justificável e pelo serviço financeiro pertinente, conservando o original e sua história.

Se o documento já produziu efeito contábil ou físico, a anulação/complementação precisa tratar o efeito no domínio competente. **Anular AL não desfaz automaticamente entrada física. Anular AF não apaga um recebimento já ocorrido.** Validar dependências posteriores e usar a reversão existente na ordem coerente; não zerar lançamentos de outro módulo por escrita direta. Uma confirmação local sem desfazer o efeito necessário não fica concluída.

Os cenários de anulação abaixo são independentes do caminho principal. Repetir a mesma anulação não gera estorno duplo. Bloquear nova tentativa indevida preservando mensagem explicativa; a operação original segue imprimível e consultável. A política de anulação parcial/total e eventos dependentes deve ser mapeada em Q-01, sem inventar permissões.

### 4.8 Integrações institucionais e relatórios

**CLC-008, 052 e 075:** exportação automática de fornecedores/contratos ao SIAFIC; guardar origem, referência de destino e confirmação. Testar cadastro de contrato em cada contexto relevante e evitar envio duplicado pela repetição do requisito.

**CLC-038:** artefatos de prestação de contas de licitações e contratos precisam do leiaute/competência/versão oficial identificado. CSV genérico ou XML com campos escolhidos pelo agente não comprova a remessa. A referência do estado vem do TR; o MD não adivinha sistema, esquema ou validador.

**CLC-040, 048 e 079:** uma capacidade PNCP reaproveitada nos contextos aplicáveis; não três conectores ou três publicações do mesmo registro. O TR não detalha operações, endpoints ou credenciais. Definir escopo e contrato técnico em Q-03. Não usar link para o site como substituto de integração, não confundir tela de disputa com conector PNCP, não transmitir testes em produção. Distinguir preparado, enviado, rejeitado e confirmado conforme o retorno verdadeiro.

Relatórios: prévia e documento devem consultar o mesmo recorte e a mesma fonte. Incluir cabeçalho, filtros/período pertinentes, unidade/órgão, data de emissão e identificação do documento conforme o padrão atual. Exportar o recorte completo, não só a página atual. Item 32 exige atas/quadro emitidos; itens 65–71 exigem nomes/tipos de relatório próprios ainda que usem um motor único. Não adicionar assinatura fictícia a um documento para aparentar aprovação.

<a id="ux"></a>
## 5. Interface ERP — profissional, compacta e eficiente

### 5.1 Organização interna

| Área do módulo único | Conteúdo / ações | IDs principais |
|---|---|---|
| Fornecedores | PF/PJ, ME/EPP, situação, CNAE, certidões e links; atalhos de cadastro único. | 1–9, 20, 29. |
| Demandas e planejamento | Solicitações, linhas, unidade/dotação, planejamento e agrupamento. | 11, 23–25, 30–31. |
| Pesquisa de preços | Convites, janela, respostas, quadro comparativo e referência. | 10–19, 36. |
| Processos e disputa | Cadastro/fases/atos, participantes, pregão, lances, negociação e resultado. | 21–22, 26, 28, 32–35, 37, 39, 41–47. |
| Contratos e convênios | Instrumentos, responsáveis, aditivos/suspensões/rescisões, medições e parcelas. | 49–55, 72–78. |
| Fornecimento | AE/AF/AL, retornos, entrega/execução, anulações e complemento. | 56–71, 27. |
| Relatórios e integrações | Emissões específicas, remessa Tribunal, retornos SIAFIC/PNCP. | 3, 12, 16, 35, 38, 40, 48, 52–53, 65–71, 75–76, 79. |
| Portal do fornecedor — contexto externo do mesmo site | Convite, grade/resposta, relatório próprio e participação em disputa. | 13–19, 39, 42–43, 46. |

As áreas podem ser abas/rotas existentes; não criar um sistema ou banco por linha da tabela. Fornecedores não acessam as funções internas pelo simples fato de receber convite. A ficha de processo reúne contexto e vínculos sem repetir a implementação de cada área.

### 5.2 Composição, fonte e densidade

Listagens: **título/contexto + busca/filtros + tabela + paginação/ações**, visíveis no desktop de referência, sem rolagem global. Não empilhar banners, saudações, gráficos decorativos e várias grades numa única página. Abrir conteúdo extenso em ficha/aba, sem modais aninhados.

Preservar fonte/identidade/componentes do CeleriFlow. Sem fonte consistente, usar família de sistema com preferência por Segoe UI e alternativas sans-serif. Não baixar/distribuir fontes nem introduzir outra biblioteca visual apenas por referência estética.

| Uso | Tamanho / entrelinha de referência | Peso |
|---|---|---|
| Título da página | 20 / 26 px | 600 |
| Título de seção | 16 / 22 px | 600 |
| Tabela, campo, filtro, botão e erro | 14 / 20 px | 400; cabeçalhos/ênfase 600 |
| Metadado secundário | 12 / 16 px | 400 |

Parâmetros herdados dos planos anteriores por orientação do usuário, **não dimensões do TR**. Usar tokens em `rem`, sem diminuir a raiz global. Controles/linhas com mínimo de referência 36 px no desktop e 44 px no toque; campos móveis com fonte de referência 16 px. Espaços 4/8/12/16/24 px. Altura mínima, não fixa que corte texto ampliado. Valores alinhados à direita, moeda/unidade/critério visíveis; texto à esquerda; algarismos tabulares quando disponíveis.

Estado com texto além de cor; rótulos acessíveis, foco visível, erros legíveis e contraste conforme padrão já adotado. Não usar emoji como ícone operacional nem fonte de 10–11 px para forçar encaixe.

### 5.3 Paginação, formulários e grade da disputa

Até **10 linhas por página** no menor viewport de ensaio, ajustando a quantidade ao espaço real. Busca/filtro/ordenação e total no servidor, escopo autorizado e desempate por chave estável. Mudança de filtro volta à primeira página; abrir ficha e voltar preserva contexto. Exibir intervalo verdadeiro, sem linhas falsas.

**Paginação não altera o conjunto do negócio.** Cotação com 12 itens deve salvar/validar os 12; agrupamento deve incluir todas as linhas selecionadas; AF/AL e relatórios abrangem todas as páginas. Seleção e total por página têm rótulos diferentes de seleção total e valor geral. Não repetir lote ou perder lance por ordenação visual.

Grades essenciais:
- Portal de cotação: dados da compra, fornecedor, itens, unidade, quantidade e preços; todo o conteúdo de CLC-014 acessível.
- Comparativo: item/unidade, quantidades, fornecedores, preços e destaque do menor; tabela ampla pode usar detalhe por item ou região de rolagem horizontal delimitada sem omitir propostas.
- Acompanhamento do pregão: **status, número do lote, licitantes e valor** visíveis no desktop e organizados no celular; não esconder um dos quatro para evitar rolagem.
- Fornecimento: tipo/número, origem, fornecedor, objeto, valor/saldo identificado e estado real; distinguir AE/empenho, AF/recebimento e AL/liquidação.

Formulários em seções/abas preservam dados ao navegar. Erro em outra aba aponta campo/aba. Ações de gerar, enviar, atestar, anular e complementar têm nomes e consequências explícitos, sem usar “Salvar” para todos os efeitos. Dados herdados não devem ser redigitados para gerar AE/AF/AL, contrato ou relatório. Confirmação não pode se limitar à página visível.

### 5.4 Mesmo site no Chrome do celular e exceções

Registrar lances com o **próprio usuário fornecedor no Chrome de um celular real**, usando mesma URL/serviços/base. Não criar APK, IPA, wrapper, instalação de PWA, backend exclusivo ou publicação em loja. Tela estreita em screenshot não substitui o teste de envio e retorno real.

Lance pendente não aparece como aceito antes da confirmação; no erro, conservar contexto e indicar ação segura. Atualização da grade não rouba foco do campo nem muda silenciosamente o lote selecionado. Apresentar valor unitário/total e objeto corretos antes de enviar, conforme a regra da sessão.

Sem `overflow: hidden` para esconder conteúdo. Mapear colunas, reduzir linhas e usar detalhe; documentos longos, tabelas comparativas largas, zoom e celular podem rolar de maneira controlada. Acesso aos dados prevalece sobre “zero rolagem” absoluto.

Testar viewport CSS **1366×650, 1440×800 e 1920×900**, equipamento real da POC, zoom/texto a 200% e Chrome no celular. Teclado deve acessar filtros, paginação e ações; mudar abas não perde dados. Metas de desempenho herdadas do padrão: feedback visual até 200 ms e consulta paginada até 1,5 s no percentil 95, com amostra/volume/rede/ambiente informados. São **metas de projeto**, não resultados medidos nem SLA do TR; não antecipar sucesso de integração para aparentar velocidade.

<a id="base"></a>
## 6. Base fictícia de homologação e resultados de conferência

Nomes, códigos, preços, documentos, prazos e fluxos a seguir são **DEMO**. Não representam contratos, tributação ou atos oficiais do município. Usar ambiente isolado; não enviar mensagens a fornecedores reais ou publicar dados fictícios em produção PNCP/Tribunal. O usuário populará os registros pelas telas existentes. Seeds de teste não justificam novo importador.

Cenários que alteram valor/estado final são separados. Não reaproveitar um processo anulado como processo contratado, nem misturar uma cotação de referência com o resultado de licitação. Os IDs são apelidos de teste, não números definitivos produzidos pelo sistema.

### 6.1 F-PESS — fornecedores, certidões e vínculos

Fornecedores fictícios: **FOR-A** (“Horizonte — DEMO”, PJ/ME/ativo), **FOR-B** (“Planalto — DEMO”, PJ/EPP/ativo), **FOR-C** (“Vale — DEMO”, PJ/outro/ativo), **FOR-PF** (“Prestador individual — DEMO”, PF). Preparar FOR-I inativo e FOR-X bloqueado como registros independentes. CPF/CNPJ de teste apropriados ao validador, sem alegar cadastro fiscal real nem consultar terceiros com documentos sintéticos.

Usar dois códigos CNAE reais já existentes na tabela de referência do ambiente, registrando sua fonte; nomes dos fornecedores continuam fictícios. Criar documentos de validade 20/09/2026, 30/09/2026, 01/10/2026 e um vencido em 31/08/2026, distribuídos entre fornecedores. A relação de setembro inclui os dois vencimentos de setembro; a situação cadastral não muda automaticamente por esses documentos.

Usuários demonstrativos: solicitante da unidade A, solicitante da unidade B, comprador/pregoeiro autorizado, apoio/atestador autorizado e contas de fornecedores distintas. E-mails `CAIXA_A`, `CAIXA_B`, `CAIXA_SOLICITANTE` são marcadores para caixas efetivas autorizadas; não endereços fornecidos pelo MD.

### 6.2 F-SOL / F-COT — solicitações, agrupamento e pesquisa

Catálogo compartilhado: **MAT-PAPEL** (resma de papel de demonstração) e **SERV-HORA** (hora de serviço de demonstração). Não impor os mesmos saldos/valores usados no MD de Almoxarifado; este conjunto é independente.

| Solicitação | Unidade | Papel | Serviço |
|---|---|---:|---:|
| SOL-A | Unidade A — DEMO | 60 resmas | 5 horas |
| SOL-B | Unidade B — DEMO | 40 resmas | 5 horas |
| **Pesquisa agrupada COT-01** | Mantém as duas origens | **100 resmas** | **10 horas** |

| Fornecedor | Preço da resma | Total 100 resmas | Preço da hora | Total 10 horas | Total cotado |
|---|---:|---:|---:|---:|---:|
| FOR-A | R$ 25,00 | R$ 2.500,00 | R$ 120,00 | R$ 1.200,00 | R$ 3.700,00 |
| FOR-B | R$ 24,00 | R$ 2.400,00 | R$ 130,00 | R$ 1.300,00 | R$ 3.700,00 |
| FOR-C | R$ 26,00 | R$ 2.600,00 | R$ 110,00 | R$ 1.100,00 | R$ 3.700,00 |

Menor por item: **FOR-B para papel; FOR-C para serviço**. Todos têm total R$ 3.700,00; isso é intencional para testar que o destaque por item não se confunde com o menor total da proposta. A estimativa demonstrativa por média aritmética é **R$ 25,00/resma e R$ 120,00/hora, total R$ 3.700,00**. Outra metodologia existente pode ser usada se documentada com expectativas recalculadas; não afirmar que a média é determinação legal.

Testar empate em uma cópia de COT-01; manter todos os menores destacados. Resposta não enviada fica ausente, não zero. Convidar via e-mail e responder nas contas externas; comprovar confirmação ao solicitante e emissão de relatório próprio.

Janela de ensaio: 18/08/2026 09h–18h, fuso identificado no ambiente. Usar relógio controlado somente em testes: dentro da janela, responder; no encerramento, link indisponível e tentativa por API recusada. FOR-I e FOR-X não respondem mesmo dentro da janela. Troca de fornecedor ativo para bloqueado entre abertura e envio deve impedir a gravação.

Dotações **DOT-M / DOT-S** são apelidos de registros de demonstração **criados no núcleo contábil**, com disponibilidade de teste R$ 3.000,00 e R$ 1.500,00. Vincular DOT-M às linhas de material e DOT-S às de serviço; a pesquisa estimada usa R$ 2.500,00 e R$ 1.200,00. Conferir dados no núcleo, sem digitar uma string na tela de Compras como falsa integração. Testar disponibilidade insuficiente em cenário separado; cotação não empenha automaticamente.

### 6.3 F-PREG — disputa e lances reais pelo fornecedor

Criar **PROC-M**, modalidade pregão na configuração de ensaio, lote 1 de 100 resmas, julgamento de menor preço total do lote. Usar sessão de demonstração em **19/08/2026**, depois da pesquisa, e registrar os atos de resultado em **20/08/2026**; contratos começam em setembro. Essas datas mantêm a cronologia do ensaio e não prescrevem prazos legais. Os códigos de participante devem seguir a política de identificação configurada; FOR-A/FOR-B são os registros de origem do teste.

| Ordem de recepção de ensaio | Fornecedor | Lance total | Efeito esperado |
|---|---|---:|---|
| 1 | FOR-A | R$ 2.500,00 | Aceito na sessão aberta. |
| 2 | FOR-B, Chrome do celular | R$ 2.400,00 | Aceito e visível ao pregoeiro/participantes. |
| 3 | FOR-A | R$ 2.350,00 | Novo lance válido pela regra demonstrativa. |
| 4 | FOR-B, Chrome do celular | R$ 2.300,00 | Novo menor valor na sessão. |
| Negociação registrada | FOR-B | R$ 2.260,00 | Registrar resultado da negociação; ao encerrá-la, lote arrematado por FOR-B. |

Configurar explicitamente a regra simples de ensaio; não derivar daqui um modo de disputa oficial, intervalo obrigatório ou desempate legal. Não é necessário novo chat: utilizar o registro/ação de negociação já existente, preservando parte, valor e ato confirmado. O valor final equivale a **R$ 22,60 por resma**. O contrato somente deriva do resultado no momento autorizado pelo fluxo, não do menor preço da pesquisa.

Testar em sessões distintas: estado/número do lote, licitantes e valores; lote fechado recusa novo lance; repetição do envio não duplica; habilitação/inabilitação por pregoeiro/apoio com histórico; registro de participante não equivale à habilitação. Habilitar FOR-B no cenário principal. Usar processo independente para inabilitar um fornecedor sem contaminar o contrato do cenário.

### 6.4 F-FLUXO — licitação de material e dispensa de serviço

Caminho principal de material: SOL-A/SOL-B → pesquisa → PROC-M → resultado → homologação/adjudicação conforme fluxo escolhido → **CT-M**, 100 resmas × R$ 22,60 = **R$ 2.260,00**.

Caminho independente de serviço: linhas de serviço da demanda → **PROC-S**, dispensa de demonstração → decisão/atos exigidos pela configuração → **CT-S**, 10 horas × R$ 110,00 = **R$ 1.100,00**, fornecedor FOR-C. Não usar a pesquisa como adjudicação automática, nem simular sessão de lances obrigatória para a dispensa.

Conservar quantidade consumida das solicitações: 100 resmas destinadas ao procedimento de material e 10 horas ao de serviço, sem agrupá-las novamente em outro certame como novas necessidades. Cadastrar as informações de processo de CLC-022, inclusive tipos/base legal/configuração e campos condicionais pertinentes; placeholders do ensaio não são fundamentação jurídica válida de contratação real.

**F-ATOS**, em cópias independentes: comprovar os nove tópicos de CLC-032, com emissão real das atas de documentação e julgamento, quadro comparativo, registro de publicação, recurso, impugnação, parecer da comissão, parecer jurídico, homologação/adjudicação e eventos de anulação/revogação. Testar separadamente cada situação de CLC-037. Reordenar fases futuras de cópia ainda em preparação; eventos históricos de outra versão ficam preservados.

### 6.5 F-INSTR — contratos, convênio, pessoas, medições e parcelas

| Instrumento | Conteúdo demonstrativo | Período de vigência | Duração inclusiva de ensaio |
|---|---|---|---:|
| CT-M | 100 resmas × R$ 22,60 = R$ 2.260,00 | 01/09–30/09/2026 | 30 dias |
| CT-S | 10 horas × R$ 110,00 = R$ 1.100,00 | 01/09–31/10/2026 | 61 dias |
| CV-01 | Convênio DEMO, 10 unidades de execução × R$ 100,00 = R$ 1.000,00 | 01/09–30/11/2026 | 91 dias |

O exemplo de convênio é exclusivamente cadastral/operacional; não define enquadramento jurídico, repasse ou rito oficial. Manter seus campos e tipo separados do contrato; fornecedor/contraparte conforme a aplicação identificada na fonte e Q-05.

Cadastrar responsáveis, representantes e signatários em CT-M e CV-01, com agrupamentos, usando pessoas já disponíveis. Uma pessoa pode ter relação em mais de um instrumento sem criar outra identidade. Comissões e pregoeiros/leiloeiros possuem documento de nomeação, membros e funções próprios de CLC-026, sem serem confundidos com grupos de responsáveis contratuais.

CT-M: primeira entrega/etapa de 60 resmas, **R$ 1.356,00**, e programação de duas parcelas de **R$ 1.356,00 e R$ 904,00**. CT-S: medição realizada de 4 horas, **R$ 440,00**, saldo físico ainda não executado de 6 horas/**R$ 660,00**; parcelas programadas 440/660. CV-01: etapa executada de 4 unidades/**R$ 400,00** e parcelas 400/600. Medições e parcelas não geram gasto duplicado; parcela programada não é pagamento realizado.

**F-ADITIVO**, cópia independente do contrato material: original 100 resmas/R$ 2.260,00, acrescentar 10 resmas/R$ 226,00 e prorrogar data final a 31/10/2026, com evento/motivo/data. Resultado **110 resmas/R$ 2.486,00**, duração inclusiva 61 dias. Não aplicar limites legais por conta própria; a cópia é teste da capacidade de registrar o ato. Testar suspensão e rescisão em outras cópias, conservando estados coerentes.

### 6.6 F-AUT — AE, AF, recebimento/execução, AL e Contabilidade

| Cadeia | Materiais / CT-M | Serviços / CT-S |
|---|---|---|
| AE gerada dos dados autorizados | 100 resmas / R$ 2.260,00 | 10 horas / R$ 1.100,00 |
| Empenho por integração | Retorno real de R$ 2.260,00 | Retorno real de R$ 1.100,00 |
| AF gerada e autorizada | 60 resmas / R$ 1.356,00 | 10 horas / R$ 1.100,00 |
| Recebimento / execução | 60 resmas recebidas pelo serviço de Estoque | 4 horas executadas / R$ 440,00, sem entrada de estoque |
| Ateste e AL gerada | 60 resmas / R$ 1.356,00 | 4 horas / R$ 440,00 |
| Liquidação por integração | Retorno real de R$ 1.356,00 | Retorno real de R$ 440,00 |
| Saldos de conferência | Contrato ainda não executado: 40 resmas/R$ 904,00 | Ainda não executado: 6 horas/R$ 660,00 |

Usar datas de operação entre **01/09 e 08/09/2026**, em ordem coerente: contratação/AE/empenho antes de AF; recebimento/execução antes de ateste/AL; liquidação depois do ateste, conforme a configuração do núcleo. Cada documento vem da origem com dados herdados. O atestador confirma o ato pertinente; o sistema gera seus registros derivados, sem inventar entrega automática. Material recebido nesse cenário eleva a posição de teste do Almoxarifado de **0 para 60 resmas**, não 120 por duplicar AF e confirmação de recebimento. Não misturar com os saldos do MD anterior.

Empenhado total dos dois instrumentos: **R$ 3.360,00**. Liquidado demonstrativo: **R$ 1.796,00**. Diferença desses dois totais: **R$ 1.564,00**, sem chamar de “saldo bancário” ou “pagamento pendente” por suposição. A disponibilidade de dotação e os lançamentos devem ser conferidos no núcleo contábil.

### 6.7 F-ANU / F-COMP — cenários independentes

- **AE anulação:** outra AE de R$ 2.260,00 com empenho efetivo, ainda sem AF/AL dependentes. Anular pelo fluxo integrado; registrar evento e retorno contábil; efeito líquido daquela cadeia passa a zero sem excluir a origem.
- **AF anulação:** outra AF de 60 resmas/R$ 1.356,00 já autorizada, ainda sem entrega efetiva. Anular; não deve restar autorização ativa nem duplicar disponibilidade. Se a AF gerou pré-entrada no Estoque, a origem deve refletir a anulação pelo serviço existente. Testar AF já recebida como caso dependente: não apagar recebimento; explicar e tratar a reversão necessária no domínio competente.
- **AL anulação:** outra AL de R$ 440,00 com ateste e liquidação confirmada. Anular usando o fluxo/retorno contábil adequado; referência do evento permanece, efeito liquidado dessa cadeia é revertido. A execução física original não desaparece por anular a liquidação. Se o serviço de reversão não existir, registrar dependência; não considerar concluída a anulação após editar um status local.
- **AE complemento:** contrato de teste com teto R$ 2.260,00; AE inicial de **R$ 1.808,00 (80 resmas)**, empenhada. Complementar **R$ 452,00 (20 resmas)** pelo fluxo pertinente: AE/efeito contábil coerentes com **R$ 2.260,00 (100 resmas)**. Não precisa alterar o teto contratual desse exemplo. Complementar não cria outro empenho integral de R$ 2.260,00 sobre o anterior.

Reexecutar os mesmos eventos não repete seus efeitos. Relatórios de anulação AE, AF e AL exibem a referência original, motivo/data e valor anulado próprios. Razão AF e AL identifica emissão, eventos, anulações e situação líquida sem misturar autorizado, executado e liquidado numa única soma.

### 6.8 F-EXT / F-PAG — integrações e volume

**SIAFIC:** salvar fornecedor no cadastro e conferir exportação automática no destino; cadastrar contratos nos contextos relevantes e conferir os vínculos. Testar repetição e indisponibilidade. Empenho/liquidação somente com referência verdadeira do módulo competente. Conferência pode ser em outra tela autorizada do mesmo CeleriFlow, se esse for o núcleo real.

**Tribunal/PNCP:** depois de definidos leiaute/contrato e ambiente, gerar remessa ou executar a operação admitida com dados de teste autorizados; conferir retorno e validações. Sem fonte/acesso, o agente entrega pendência objetiva, não arquivo inventado nem envio fictício. Não publicar em produção durante a POC.

**Paginação:** base isolada com 27 fornecedores/processos (10/10/7 se couberem dez linhas), cotação de 12 itens, 12 parcelas ou eventos em razão. Buscar um registro da terceira página; salvar cotação completa; imprimir todos os registros do filtro e todas as linhas de AE/AF/AL. Não somar esse cenário aos totais financeiros principais.

---
<a id="itens"></a>
## 7. Desenvolvimento item a item — 79 requisitos

Cada número mantém sua própria evidência, mesmo quando usa a mesma implementação de outro. **O texto TR é a fonte; os demais campos são o plano de implementação e teste.** Dependências destacadas não dispensam funções expressamente integradas.

### Subdivisão original: Cadastro de Fornecedores:

<a id="clc-001"></a>
#### CLC-001 — Identificação das empresas como ME e EPP

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 1, p. 48:**

> O sistema deverá identificar as empresas como ME e EPP para cumprimento à lei 123/2006 e 147/2014.

**Implementação:** Exibir e manter o enquadramento empresarial no cadastro único, distinguindo ME, EPP e demais situações configuradas. Reutilizar essa informação na pesquisa, no participante e nos documentos pertinentes. PF/PJ e ME/EPP são classificações diferentes; a seleção não deve mudar a identidade da pessoa.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — enquadramento da pessoa/fornecedor; DEP-02 — permissão de manutenção. Consumir a origem e usar seu ponto de edição real.

**Demonstração:** Cadastrar FOR-A como ME, FOR-B como EPP e FOR-C com outro enquadramento; reabrir fichas e selecioná-los na pesquisa e no pregão. Conferir que FOR-PF não recebe enquadramento empresarial por conversão automática.

**Aceite técnico:** ME e EPP são dados persistidos, consultáveis e coerentes entre cadastro e processo. Uma edição não cria outro fornecedor nem apaga o enquadramento usado num documento histórico.

**Atenção / limite de escopo:** O item cita as leis, mas não detalha algoritmos de benefícios. Não implementar percentuais, desempate ou exclusividade por suposição. Compartilha CLC-020.

<a id="clc-002"></a>
#### CLC-002 — Pesquisa de fornecedores por nome, documento, enquadramento e situação

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 2, p. 48:**

> O sistema deverá permitir pesquisar fornecedores a partir de palavras contidas no seu nome, CPF/CNPJ, enquadramento e situação (ativo/vigente);

**Implementação:** Implementar a consulta do cadastro completo autorizado por palavras do nome, CPF/CNPJ, enquadramento e situação ativo/vigente. Permitir combinar critérios sem limitar a busca às linhas carregadas; identificar o significado da situação e não confundi-la com validade de certidão.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — nome, documento, enquadramento e situação cadastral; DEP-02 — escopo.

**Demonstração:** Localizar FOR-A por parte do nome, pelo documento e por ME/ativo. Repetir para EPP; usar F-PAG para buscar fornecedor que estaria na terceira página e testar ausência de resultado.

**Aceite técnico:** Cada critério e sua combinação recuperam os fornecedores correspondentes; total e paginação refletem o filtro. CPF/CNPJ com formatação aceita na interface deve localizar o mesmo registro canônico.

**Atenção / limite de escopo:** Não adicionar score, consulta fiscal automática ou motor de busca externo. Compartilha CLC-009, mantendo ambos os testes/IDs.

<a id="clc-003"></a>
#### CLC-003 — Validades de certidões/documentos e relatórios

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 3, pp. 48–49:**

> Controlar os prazos de vencimento das certidões e demais documentos exigidos aos fornecedores, permitindo a emissão de relatórios;

**Implementação:** Manter documentos do fornecedor com tipo, referência e validade; disponibilizar consulta e emissão de relatório por fornecedor, período de vencimento e situação pertinente. Derivar datas do mesmo registro, distinguindo vigente, vencido e validade não informada, sem presumir regularidade.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — fornecedor; DEP-05/07 — referência de arquivo e emissão, se compartilhadas. Cadastro de validade específico permanece no escopo de Compras.

**Demonstração:** Registrar o conjunto F-PESS. Emitir setembro: conferir os documentos que vencem em 20/09 e 30/09; outubro e agosto ficam fora desse recorte. Consultar também o documento vencido e reabrir a origem.

**Aceite técnico:** Validades persistem, a situação é coerente com a data de referência e o relatório é realmente gerado com o conjunto do filtro. Ausência de informação não vira “regular”.

**Atenção / limite de escopo:** Não exigir obtenção automática de certidão, envio de e-mail de validade ou bloquear o fornecedor por vencimento sem regra. O item atravessa pp. 48–49.

<a id="clc-004"></a>
#### CLC-004 — Cadastro CNAE vinculado ao fornecedor

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 4, p. 49:**

> Disponibilizar cadastro de atividades econômicas, codificada de acordo com a Classificação Nacional de Atividades Econômicas (CNAE), possibilitando o vinculo ao cadastro do fornecedor;

**Implementação:** Disponibilizar manutenção/seleção de atividades econômicas com código e descrição de referência CNAE, ligadas ao fornecedor por identificador. Reutilizar a tabela existente; permitir consultar e manter o vínculo no contexto de Compras sem duplicar catálogo geral.

**Dados de outro módulo / serviço compartilhado:** DEP-01/10 — cadastro de atividade econômica e referência CNAE. Se faltar a tabela ou seu serviço, destacar a fonte necessária sem inventar códigos oficiais.

**Demonstração:** Usar dois códigos reais da referência disponível no ambiente, anotar quais foram usados, cadastrá-los/vinculá-los a fornecedores fictícios e reabrir a ficha. Consultar código e descrição, não somente texto livre.

**Aceite técnico:** Código/descrição e vínculo ao fornecedor são persistidos e recuperáveis. O cadastro segue a codificação identificada; uma escolha apenas visual não satisfaz o item.

**Atenção / limite de escopo:** Não criar consulta comercial, validação tributária ou atualização automática de catálogo como função adicional. Fonte/configuração em Q-06.

<a id="clc-005"></a>
#### CLC-005 — Fornecedores pessoas físicas e jurídicas

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 5, p. 49:**

> O sistema deverá conter cadastro de fornecedores de pessoas físicas e jurídicas, para participação em compras e licitações;

**Implementação:** Disponibilizar cadastro/edição de fornecedor PF e PJ pelo formulário compartilhado, acessível a partir de Compras, mantendo identidade e vínculos de participação. Não usar apenas campo de nome no processo como substituto do cadastro.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — serviço/formulário de Pessoas/Fornecedores; DEP-02 — acesso. Se o formulário compartilhado estiver ausente, registrar lacuna; não entregar só seletor e chamar de cadastro completo.

**Demonstração:** Cadastrar FOR-PF e FOR-A, salvar, reabrir e selecionar cada um em uma pesquisa ou participação de teste adequada. Confirmar os mesmos IDs no cadastro central.

**Aceite técnico:** Os dois tipos podem ser mantidos e reutilizados em compras/licitações. Não é necessário cadastrar novamente a pessoa para outro processo.

**Atenção / limite de escopo:** Não transformar PF em PJ nem exigir CNPJ indiscriminadamente. A validação condicional é CLC-006.

<a id="clc-006"></a>
#### CLC-006 — Campos condicionais de CPF e CNPJ

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 6, p. 49:**

> Os campos de cadastramento de dados do fornecedor devem ser habilitados de acordo com o tipo de pessoa (física ou jurídica) a ser cadastrada. Exemplo: O sistema não poderá permitir a digitação do campo CNPJ para pessoa física e vice-versa;

**Implementação:** Selecionar PF/PJ antes de documento; PF permite CPF e impede CNPJ, PJ permite CNPJ e impede CPF. Limpar dado incompatível ao alternar uma nova ficha e repetir a validação no servidor, inclusive em atalhos de fornecedor.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — formulário/validação compartilhados; DEP-02 — autorização.

**Demonstração:** Alternar o tipo no cadastro novo, salvar dois exemplos válidos e enviar payloads PF+CNPJ e PJ+CPF nos testes de API. Reabrir pelo contexto de Compras.

**Aceite técnico:** Interface e servidor recusam combinações incompatíveis sem perder documentos válidos de outros registros. Caminhos alternativos respeitam a mesma regra.

**Atenção / limite de escopo:** Não desabilitar validação de produção para usar documentos fictícios. Evitar duplicar a implementação já usada por Almoxarifado e Patrimônio.

<a id="clc-007"></a>
#### CLC-007 — Links de consulta de regularidade

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 7, p. 49:**

> O sistema deverá disponibilizar recurso para permitir a consulta de regularidade dos fornecedores, através de link direcionando para os seguintes sites: INSS, FGTS, Fazenda Municipal, Estadual e Federal;

**Implementação:** Oferecer links identificados para INSS, FGTS e Fazendas Municipal, Estadual e Federal, usando destinos configurados e confirmados. Municipal/Estadual devem corresponder à jurisdição definida, sem escolher a prefeitura do certame para todos os fornecedores por suposição.

**Dados de outro módulo / serviço compartilhado:** DEP-10 — URLs/jurisdição de referência; DEP-01 — dados de identificação quando pertinentes ao link.

**Demonstração:** Com fornecedor de teste, abrir cada um dos cinco grupos de consulta e conferir o destino. Não executar consulta usando documento de pessoa real; testar navegação e identificação do serviço. Registrar correspondências de nomenclatura quando necessárias.

**Aceite técnico:** Os cinco acessos existem e direcionam aos destinos corretos da configuração; link quebrado ou placeholder não é validado. A interface não informa certidão emitida ou regularidade consultada automaticamente.

**Atenção / limite de escopo:** O requisito é link direcionador. Não criar robô de consulta, obter certidões automaticamente ou fundir os cinco grupos silenciosamente. Q-06.

<a id="clc-008"></a>
#### CLC-008 — Exportação automática de fornecedores ao SIAFIC

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 8, p. 49:**

> Integração total com o SIAFIC, Exportando automaticamentos os fornecedores cadastrados no sistema de Compras, Licitação e Contratos

**Implementação:** Acoplar o cadastro de fornecedor em Compras ao serviço/evento existente do SIAFIC: enviar dados canônicos automaticamente, guardar vínculo/retorno e evitar cadastro duplicado por reprocessamento. A identidade tem origem única; não exportar apenas texto de nome nem exigir recadastro manual no financeiro.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — dados mestres; DEP-04 — recepção/cadastro do fornecedor no SIAFIC. Integração obrigatória do item, não opcional.

**Demonstração:** Criar FOR-A em F-PESS pelo fluxo real; abrir o contexto do SIAFIC e conferir o fornecedor/credor correspondente. Repetir o evento e testar falha; mostrar retorno verdadeiro em vez de indicador local.

**Aceite técnico:** Fornecedor fica disponível no SIAFIC a partir do cadastro de Compras sem redigitação, com correspondência verificável. Falha fica pendente e repetição não duplica o destino.

**Atenção / limite de escopo:** Sem serviço de destino, manter DEPENDENCIA_OUTRO_MODULO; não construir outro SIAFIC nem apresentar arquivo exportado manualmente como automatismo concluído. Q-01.

<a id="clc-009"></a>
#### CLC-009 — Pesquisa de fornecedores — repetição do item 2

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 9, p. 49:**

> O sistema deverá permitir pesquisar fornecedores a partir de palavras contidas no seu nome, CPF/CNPJ, enquadramento e situação (ativo/vigente);

**Implementação:** Usar a consulta de CLC-002, mantendo todos os critérios do texto. Não criar outro índice/cadastro de fornecedor para este número.

**Dados de outro módulo / serviço compartilhado:** DEP-01/02 — mesma origem e escopo da consulta principal.

**Demonstração:** Em nova consulta, localizar FOR-B por EPP e situação; repetir por nome e CPF/CNPJ, incluindo registro de outra página e combinação sem resultado.

**Aceite técnico:** Os quatro critérios continuam funcionais e o total corresponde ao conjunto real. Registrar evidência CLC-009 mesmo quando compartilhar a tela de CLC-002.

**Atenção / limite de escopo:** Repetição de requisito não autoriza duas bases com situações divergentes.

### Subdivisão original: COMPRAS E LICITAÇÕES:

<a id="clc-010"></a>
#### CLC-010 — Pesquisa de preços e referência da contratação

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 10, p. 49:**

> Conter módulo de pesquisa de preços, indispensável para a verificação de existência de recursos suficientes para cobrir despesas decorrentes de contratação pública, confronto e exame de propostas em licitação, estabelecendo o preço aproximado de referência que a administração estará disposta a contratar;

**Implementação:** Criar pesquisa com itens/quantidades e propostas de preço, comparar respostas e calcular preço aproximado de referência pela metodologia configurada/identificada. Apresentar valor estimado e confronto com a informação orçamentária disponível, sem declarar reserva ou empenho decorrente da pesquisa.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — fornecedores; DEP-03 — catálogo; DEP-04 — informação de dotação/disponibilidade quando consultada; DEP-07 — quadro/relatório.

**Demonstração:** Executar F-COT com três fornecedores e dois itens. Pela média de ensaio, obter R$ 25/resma, R$ 120/hora e R$ 3.700 totais. Conferir DOT-M/DOT-S no núcleo quando disponível; testar ausência de preço ou de informação orçamentária.

**Aceite técnico:** Pesquisa guarda preços e origens; referência calculada coincide com a metodologia indicada e se atualiza com dados válidos. Recursos não verificados não aparecem como suficientes.

**Atenção / limite de escopo:** Não impor média como método legal nem incluir scraping, banco comercial, adjudicação automática ou novo motor de orçamento. Q-05/Q-01.

<a id="clc-011"></a>
#### CLC-011 — Agrupamento de solicitações para pesquisa de preços

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 11, p. 49:**

> Possibilitar que a pesquisa de preços seja realizada utilizando o método de agrupamento de solicitações de compras/serviços;

**Implementação:** Permitir selecionar solicitações de compras/serviços e criar a pesquisa agrupada, conservando vínculos e quantidades por origem. Consolidar somente itens equivalentes e rastrear parcelas de demanda já usadas.

**Dados de outro módulo / serviço compartilhado:** DEP-03 — material/serviço e unidade; DEP-02 — unidade e usuário. Solicitações e agrupamento são dados próprios do módulo.

**Demonstração:** Selecionar SOL-A e SOL-B de F-SOL; gerar COT-01 com 100 resmas e 10 horas. Abrir a origem de cada total e conferir 60/40 e 5/5; repetir operação e testar itens com unidade diferente.

**Aceite técnico:** Pesquisa contém todas as linhas pertinentes sem duplicar demanda nem somar itens incompatíveis. Origens e unidades continuam identificadas.

**Atenção / limite de escopo:** Não confundir este destino “pesquisa” com o procedimento licitatório de CLC-030. A mesma estrutura pode atender ambos, mantendo destinos e saldos corretos.

<a id="clc-012"></a>
#### CLC-012 — Quadro comparativo com menores preços destacados

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 12, p. 49:**

> O sistema deverá destacar no relatório de quadro comparativo de preços, as propostas que contém o menor preço;

**Implementação:** Gerar quadro comparativo a partir das propostas efetivas, com critérios unitário/total claros e destaque textual/visual dos menores por item ou agrupamento efetivamente comparável. Emitir o documento mantendo o destaque; não escolher vencedor administrativo apenas pelo destaque.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — emissão do quadro; respostas/preços são do próprio módulo.

**Demonstração:** Emitir F-COT: papel destaca FOR-B e serviço FOR-C; os três totais são R$ 3.700. Em cópia de teste com empate, destacar todos os menores. Conferir a mesma informação no documento.

**Aceite técnico:** Menores são calculados dos dados e não fixados por posição; empate é mostrado, ausência de preço não vira zero e emissão conserva o recorte completo.

**Atenção / limite de escopo:** Compartilha CLC-036. Método de referência e julgamento não são o mesmo conceito. Q-05.

<a id="clc-013"></a>
#### CLC-013 — Convite por e-mail com identificação, link e chave

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 13, p. 49:**

> Possibilitar o envio de email do fornecedor contendo as informações de identificação do processo, além de link e chave de acesso às informações;

**Implementação:** Enviar ao e-mail do fornecedor convidado identificação da pesquisa/processo, link e chave de acesso com escopo apropriado. Vincular o convite à pessoa e ao processo e usar o serviço de acesso/e-mail existente, com registro do resultado de envio.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — contato; DEP-06 — e-mail, token/link e sessão externa. Não presumir remetente configurado.

**Demonstração:** Convidar FOR-A para COT-01; receber a mensagem em caixa controlada, conferir identificação/link/chave e acessar o conjunto correto. Tentar usar a mesma chave para outro fornecedor/processo em teste negativo.

**Aceite técnico:** Mensagem efetivamente recebida contém os três elementos; acesso aponta ao processo e fornecedor corretos. Falha de envio ou chave inválida não gera acesso indevido.

**Atenção / limite de escopo:** A frase “envio de email do fornecedor” é mantida no TR; direção ao fornecedor é interpretação contextual adotada e registrada em Q-06. Não enviar senha permanente nem chave em logs públicos.

<a id="clc-014"></a>
#### CLC-014 — Grade do portal com compra, fornecedor e itens

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 14, p. 49:**

> Quando o fornecedor acessar o processo de compra correspondente, através do portal de serviços, exibir grid contendo os dados da compra, fornecedor e itens a serem respondidos;

**Implementação:** Ao acessar pelo convite/sessão, exibir identificação da compra, fornecedor vinculado e grade de todos os itens a responder com unidade/quantidade e campos de preço. Usar dados herdados, validar o conjunto completo e respeitar escopo/prazo.

**Dados de outro módulo / serviço compartilhado:** DEP-06 — portal/autenticação; DEP-01 — fornecedor; DEP-03 — catálogo e unidade. Dados da pesquisa são do módulo.

**Demonstração:** FOR-A abre COT-01 e vê a compra, seu nome e os dois itens. Preenche preços; em F-PAG responde cotação de 12 linhas distribuídas em páginas. Tentar acessar a resposta privada de FOR-B.

**Aceite técnico:** As três partes expressas estão acessíveis e os itens pertencem à compra. Paginação não descarta respostas; fornecedor não altera o objeto/quantidade nem dados de outro participante.

**Atenção / limite de escopo:** Não entregar apenas um formulário genérico sem identificação de compra/fornecedor; não criar portal ou login independentes.

<a id="clc-015"></a>
#### CLC-015 — E-mail ao solicitante após resposta do fornecedor

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 15, p. 50:**

> Após responder a cotação de preços, o sistema deverá enviar um e-mail para o solicitante, informando que o preenchimento de preços foi realizado com sucesso pelo fornecedor;

**Implementação:** Disparar e-mail ao solicitante somente depois da apresentação da cotação persistida, identificando pesquisa e fornecedor que respondeu. Usar destinatário do cadastro/contexto e evento de envio idempotente.

**Dados de outro módulo / serviço compartilhado:** DEP-02/01 — solicitante/contato; DEP-06 — envio. E-mail é parte obrigatória do item.

**Demonstração:** Enviar a resposta de FOR-A em COT-01, receber aviso em CAIXA_SOLICITANTE e conferir proposta/data no sistema. Salvar rascunho e simular falha de gravação em testes separados: não enviar confirmação de apresentação.

**Aceite técnico:** Aviso corresponde a resposta concluída e chega à caixa autorizada. Retry não duplica a notificação do mesmo evento; erro de envio fica recuperável e não altera preços.

**Atenção / limite de escopo:** Log, template ou evento pendente não comprovam entrega. Não criar mailing ou mensagens a terceiros reais.

<a id="clc-016"></a>
#### CLC-016 — Relatório dos preços ofertados pelo fornecedor

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 16, p. 50:**

> Possibilitar que o fornecedor realize a emissão de relatório contendo os preços ofertados;

**Implementação:** Disponibilizar ao fornecedor emissão do relatório da própria proposta apresentada, contendo pesquisa, identificação e itens/preços/quantidades/totais aplicáveis. Usar a versão correta e não dados de outro fornecedor.

**Dados de outro módulo / serviço compartilhado:** DEP-06 — sessão do fornecedor; DEP-07 — relatório. Proposta é fonte do módulo.

**Demonstração:** FOR-A emite sua resposta F-COT: papel R$ 2.500, serviço R$ 1.200, total R$ 3.700. Emitir em F-PAG com mais de dez itens; verificar a última linha e o total.

**Aceite técnico:** Documento é emitido no acesso do fornecedor e corresponde integralmente aos preços apresentados, com identificação de versão/data pertinente.

**Atenção / limite de escopo:** Não substituir por screenshot, quadro comparativo com concorrentes ou documento de outra versão. Acesso após prazo segue política identificada em Q-06, preservando a indisponibilidade da pesquisa.

<a id="clc-017"></a>
#### CLC-017 — Janela configurável e indisponibilidade após encerramento

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 17, p. 50:**

> A pesquisa de preços deverá ficar disponível por um período de tempo determinado, de forma configurável. Após esse período, o processo não estará mais disponível;

**Implementação:** Configurar início/fim da pesquisa e fazer o servidor validar a disponibilidade de acesso/resposta. Encerrada a janela, o link do processo de pesquisa fica indisponível para a participação, com mensagem explícita; histórico interno e respostas apresentadas não são apagados.

**Dados de outro módulo / serviço compartilhado:** DEP-06 — portal; relógio/serviço de validação da aplicação. Período é dado da pesquisa.

**Demonstração:** Usar relógio de teste: acessar/responder dentro da janela de COT-01; no término configurado, tentar abrir a pesquisa e enviar pela API. Conferir que o comprador ainda consulta o histórico.

**Aceite técnico:** Janela altera o comportamento real; resposta fora do período é recusada pelo servidor, inclusive com formulário já aberto. Não depende apenas de botão desabilitado pelo relógio local.

**Atenção / limite de escopo:** “Processo não estará mais disponível” não significa exclusão da auditoria. Limite temporal e eventual acesso a comprovante já emitido ficam explícitos em Q-06.

<a id="clc-018"></a>
#### CLC-018 — Data de apresentação da proposta

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 18, p. 50:**

> Registrar no sistema a data de apresentação da proposta pelo fornecedor;

**Implementação:** Registrar a data/hora de apresentação quando o fornecedor confirma o envio, distinguindo rascunho e data de criação. Usar referência temporal do servidor, com fuso claro; preservar histórico de versões se já existente.

**Dados de outro módulo / serviço compartilhado:** DEP-06 — identificação da sessão; dados e timestamp pertencem à operação de cotação.

**Demonstração:** Salvar um rascunho e apresentá-lo depois; conferir a data de apresentação na ficha/relatório. Reenviar o mesmo pedido idempotente e verificar a preservação da primeira confirmação.

**Aceite técnico:** A proposta apresentada tem data confiável persistida, não alterada silenciosamente por recarga ou reenvio. Rascunho não aparece como proposta já apresentada.

**Atenção / limite de escopo:** Não usar data de convite ou horário informado pelo fornecedor como única data de apresentação.

<a id="clc-019"></a>
#### CLC-019 — Bloqueio de respostas de fornecedores inativos ou bloqueados

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 19, p. 50:**

> Não permitir que fornecedores inativos e bloqueados respondam pesquisas de preços pelo portal de serviços online.

**Implementação:** Verificar situação do fornecedor ao disponibilizar e confirmar resposta. Impedir inativos e bloqueados na interface e no servidor; uma sessão/convite anterior não dispensa nova verificação.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — situação canônica; DEP-06 — identidade do fornecedor no portal.

**Demonstração:** FOR-I e FOR-X tentam responder dentro da janela: recusar. FOR-A abre a grade ativo e é bloqueado antes de enviar em teste isolado: recusar também. Ativo autorizado permanece apto.

**Aceite técnico:** Os dois estados citados impedem resposta efetiva; chamada direta e link antigo não contornam o controle. As respostas passadas não são apagadas pelo bloqueio posterior.

**Atenção / limite de escopo:** Não criar inativação automática por certidão, classificação ME/EPP ou falta de resposta anterior sem regra expressa.

<a id="clc-020"></a>
#### CLC-020 — Identificação ME/EPP no processo — repetição do item 1

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 20, p. 50:**

> O sistema deverá identificar as empresas como ME e EPP para cumprimento à lei 123/2006 e 147/2014.

**Implementação:** Reaproveitar o enquadramento de CLC-001 na compra/licitação, mantendo coerência entre fornecedor, participante e documentos aplicáveis. Não registrar outra classificação independente na tela da sessão.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — enquadramento empresarial; processo/participação são do módulo.

**Demonstração:** Selecionar FOR-A e FOR-B como participantes; conferir ME e EPP e consultar as fichas de origem. Testar filtro e persistência em novo processo.

**Aceite técnico:** Os enquadramentos permanecem identificáveis no contexto de participação e correspondem à origem. Evidência separada de CLC-020, sem duplicar cadastro.

**Atenção / limite de escopo:** Não transformar a identificação em comprovação automática de todos os benefícios legais. Compartilha implementação com item 1.

<a id="clc-021"></a>
#### CLC-021 — Ciclo digital completo de materiais e serviços

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 21, p. 50:**

> O sistema deverá controlar as aquisições de materiais e contratação de serviços, de forma 100% digital, desde o pedido de compras até a contratação, realizada através das modalidades de dispensa ou licitação, seguindo todas as etapas do processo até a homologação, contrato, autorização de empenho/empenho, autorização de fornecimento/liquidação, entrega ou prestação dos serviços e liquidação de despesa;

**Implementação:** Vincular pedido, pesquisa/procedimento, resultado/atos, contrato, AE/empenho, AF, recebimento ou prestação, ateste/AL e liquidação. Disponibilizar navegação e rastreabilidade entre cada registro. Atender os caminhos de dispensa e licitação com materiais e serviços, reutilizando fases aplicáveis em vez de impor pregão a toda compra.

**Dados de outro módulo / serviço compartilhado:** DEP-01/02/03/04/05/06/07 — pessoas, escopo, catálogo/estoque, Contabilidade, peças, portal e emissão. Ausência de uma parte necessária deixa CLC-021 parcial.

**Demonstração:** Percorrer F-FLUXO/F-AUT: material via PROC-M e CT-M; serviço via PROC-S e CT-S. Abrir cada documento e retorno contábil; verificar material recebido em Estoque e serviço medido sem gerar estoque. As linhas são herdadas entre etapas.

**Aceite técnico:** Os dois percursos são executáveis integralmente de forma digital, com origem/destino e documentos reais. Campo de status preenchido manualmente, PDF estático ou empenho/liquidação fictícios não encerram o item.

**Atenção / limite de escopo:** As siglas/ordem da frase original permanecem transcritas; o contrato de operação 4.6 distingue autorização de ato contábil. Não criar pagamento bancário nem rito jurídico novo. Q-01/Q-04.

<a id="clc-022"></a>
#### CLC-022 — Cadastro completo das informações do processo

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 22, p. 50:**

> O sistema deverá armazenar informações relativas aos processos de aquisições e serviços, tais como: órgão, modalidade, número/ano, processo administrativo, tipo de licitação (menor preço, melhor técnica, técnica e preço, maior lance ou oferta, etc.), base legal, classificação, objeto, comissão de licitação, datas/hora de abertura, entrega de envelopes, responsáveis, participantes, habilitações, inabilitações, pareceres e demais dados referentes ao andamento do processo;

**Implementação:** Manter campos/relações para órgão, modalidade, número/ano, processo administrativo, tipo de licitação, base legal, classificação, objeto, comissão, abertura com data/hora, entrega de envelopes quando pertinente, responsáveis, participantes, habilitações/inabilitações, pareceres e histórico. Tipos citados devem ser armazenáveis com identidade clara, sem um único campo de observação substituindo tudo.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — órgão/usuários; DEP-01 — pessoas; DEP-05 — processo/peças, se compartilhado. Modalidade, tipo e configuração do procedimento são do módulo/parametrização existente.

**Demonstração:** Criar PROC-M e PROC-S com seus dados; preencher exemplo de cada campo aplicável e reabrir. Em cenário cadastral, verificar as opções menor preço, melhor técnica, técnica e preço e maior lance/oferta, sem simular julgamento que não foi implementado.

**Aceite técnico:** Cada informação literal tem armazenamento e forma de consulta; campos condicionais não foram simplesmente eliminados. Pareceres/participantes/decisões se ligam ao processo correto.

**Atenção / limite de escopo:** Não corrigir termos da fonte silenciosamente nem alegar motor de todos os tipos por ter uma lista de opções. Base legal e fluxo reais exigem configuração identificada. Q-04.

<a id="clc-023"></a>
#### CLC-023 — Solicitações de compras e serviços por unidades autorizadas

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 23, p. 50:**

> O sistema deverá permitir o cadastro de solicitação de compras contendo os materiais e/ou serviços para dar inicio ao processo de aquisição pelas diversas unidades gestoras e administrativas que compõem a administração, através de usuários devidamente habilitados;

**Implementação:** Disponibilizar solicitação com unidade gestora/administrativa, usuário e linhas de materiais e/ou serviços do catálogo. Permitir criar, editar no estado devido e encaminhar pelo fluxo existente; origem continua rastreável nos agrupamentos posteriores.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — unidades/usuários/permissões; DEP-03 — material/serviço/unidade; DEP-04 — dotações no ponto de vínculo de CLC-025/031.

**Demonstração:** Solicitantes de unidades distintas criam SOL-A e SOL-B. Conferir materiais e serviços em ambas; usuário sem competência tenta gravar por tela/API. Agrupar e voltar às origens.

**Aceite técnico:** Diferentes unidades podem originar a aquisição com linhas persistidas, sem transcrição pelo comprador. Usuário sem autorização não cria solicitação fora de seu escopo.

**Atenção / limite de escopo:** Não implementar cadeia nova de aprovações nem compras automáticas por estoque mínimo. O fluxo existente deve preservar a ação do solicitante.

<a id="clc-024"></a>
#### CLC-024 — Planejamento de compras futuras

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 24, p. 50:**

> Possibilitar o registro de planejamentos de compras, possibilitando estimar compras futuras de maneira mais assertiva;

**Implementação:** Registrar planejamento com necessidade futura, item/serviço, quantidade, período esperado e estimativa pertinente; permitir consultar/atualizar sem criar compra, reserva ou empenho automaticamente. Reaproveitar catálogo/demandas quando usados.

**Dados de outro módulo / serviço compartilhado:** DEP-03 — catálogo; DEP-02 — unidade. Dados de planejamento pertencem a Compras.

**Demonstração:** Planejar para período futuro 120 resmas e 8 horas com estimativas demonstrativas; salvar, reabrir e alterar a quantidade em um registro ainda editável. Conferir que não surgiu contratação ou despesa só por planejar.

**Aceite técnico:** Planejamento é persistido, distingue período/quantidade/estimativa e pode apoiar a preparação da compra. Não é somente campo “observação” sem registro recuperável.

**Atenção / limite de escopo:** Não acrescentar IA preditiva, publicação de plano oficial, integração nominal ou metodologia de previsão não indicada pelo item.

<a id="clc-025"></a>
#### CLC-025 — Dotação contábil vinculada a cada item da solicitação

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 25, pp. 50–51:**

> Dispor de integração com o sistema contábil para efeito de vinculação das dotações orçamentárias contábeis nos itens constantes solicitação de compras ou serviços.

**Implementação:** Consultar as dotações pelo núcleo contábil e vincular sua referência às linhas da solicitação, preservando unidade/exercício/escopo pertinentes. Não tratar texto digitado com formato de dotação como integração.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — catálogo/disponibilidade de dotações; DEP-02 — unidade/exercício. Integração expressa, compartilhada com CLC-031.

**Demonstração:** Em SOL-A/SOL-B, selecionar DOT-M para material e DOT-S para serviço, abrir as origens contábeis e reabrir as linhas. Agrupar e verificar que as duas referências e alocações de origem continuam recuperáveis.

**Aceite técnico:** A linha mantém vínculo a dotação real disponível no núcleo, com identidade e atributos corretos. Falha de consulta não preenche dotação ou disponibilidade fictícia.

**Atenção / limite de escopo:** Vincular dotação não comprova empenho nem obriga criar reserva adicional por suposição. Fonte e regras de alocação em Q-01.

<a id="clc-026"></a>
#### CLC-026 — Comissões, pregoeiros e leiloeiros

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 26, p. 51:**

> Permitir o cadastramento de comissões permanentes e especiais, pregoeiros e leiloeiros, informando o documento de nomeação, membros e funções designadas;

**Implementação:** Manter comissões permanentes e especiais, pregoeiros e leiloeiros, com documento de nomeação, membros e funções designadas. Reutilizar pessoas e arquivos; selecionar a composição no processo sem duplicar identidades.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — membros; DEP-02 — usuários/permissões; DEP-05 — documento/peça. Cadastros específicos de comissão/função são do contexto de Compras.

**Demonstração:** Cadastrar uma comissão permanente e uma especial de teste, com membros/funções e documentos DEMO; registrar pregoeiro e leiloeiro. Selecionar a comissão/pregoeiro em PROC-M e abrir a nomeação.

**Aceite técnico:** Todas as categorias citadas podem ser registradas e relacionadas ao processo. Nomeação, composição e funções persistem e são recuperáveis.

**Atenção / limite de escopo:** Não inferir poderes de acesso só por incluir pessoa no texto de nomeação; permissões continuam no núcleo. Não confundir esta comissão com grupo de responsáveis de contrato.

<a id="clc-027"></a>
#### CLC-027 — Integração Estoque, Compras, Licitações e Contratos sem redundância

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 27, p. 51:**

> Possuir os módulos de Controle de Estoque, Compras, Licitações e Contratos totalmente integrados entre si, sem redundância de base de dados;

**Implementação:** Usar pessoas, materiais, solicitações, resultado, contrato e AF com referências comuns e serviços integrados. Material autorizado/recebido deve percorrer a origem de Compras ao Estoque sem recadastro; o histórico permite voltar ao contrato/processo. Não criar um saldo de estoque de Compras desconectado do Almoxarifado.

**Dados de outro módulo / serviço compartilhado:** DEP-03 — estoque/material/recebimento; DEP-01 — fornecedor; DEP-04 quando houver efeito contábil; DEP-05 — referências de processo. Integração é obrigatória, não simples leitura decorativa.

**Demonstração:** Em F-AUT, usar o mesmo MAT-PAPEL da solicitação à AF e ao recebimento de 60 resmas. Conferir Estoque 0→60, não 120; abrir vínculo contrato/resultado/solicitação. Em CT-S, medir serviço sem criar entrada física.

**Aceite técnico:** A cadeia usa dados canônicos e efeitos reais nos módulos competentes; não exige redigitar material, fornecedor ou quantitativo de origem. Reenvio não cria segunda entrada e serviço não é tratado como material.

**Atenção / limite de escopo:** Snapshots históricos/eventos técnicos não são licença para bases paralelas. Compatibilizar gatilho AF/recebimento existente, sem reconstruir Almoxarifado. Q-01.

<a id="clc-028"></a>
#### CLC-028 — Registro do processo licitatório e requisições de origem

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 28, p. 51:**

> Registrar os processos licitatórios, identificando número do processo, objeto, requisições de compra,modalidade de licitação e datas do processo;

**Implementação:** Manter número do processo, objeto, requisições de compra, modalidade e datas. Reutilizar CLC-022/030/034; uma requisição agrupada conserva relação de origem e quantitativos utilizados.

**Dados de outro módulo / serviço compartilhado:** DEP-05 — registro administrativo/peças, se compartilhados; DEP-02 — escopo. Processo licitatório e seus vínculos são dados do módulo.

**Demonstração:** Criar PROC-M a partir das linhas de material agrupadas de SOL-A/SOL-B. Abrir o processo, as duas requisições e suas datas/modalidade; reabrir após salvar.

**Aceite técnico:** Os cinco componentes citados são consultáveis, com origem estruturada. Número de processo não é somente um nome de arquivo e as requisições não somem após o agrupamento.

**Atenção / limite de escopo:** Não criar um segundo Protocolo; processo administrativo e número do certame podem ser diferentes e precisam ser identificados.

<a id="clc-029"></a>
#### CLC-029 — Cadastro de pessoas no contexto de compras

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 29, p. 51:**

> Permitir realizar Cadastro de Pessoas (Usuários, Fornecedores e outros);

**Implementação:** Disponibilizar criação/manutenção pelo cadastro único de pessoas, acessível a partir de Compras, contemplando usuários, fornecedores e outros participantes pertinentes. Separar pessoa, papel no processo e credencial de acesso; cadastrar pessoa não lhe concede automaticamente poderes internos.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — serviço/formulário de Pessoas; DEP-02 — usuários/credenciais. Não reconstruir esses módulos; falta da capacidade fica destacada.

**Demonstração:** Cadastrar pessoa de teste por atalho de Compras, selecioná-la como fornecedor/responsável conforme seu papel e localizá-la no cadastro central. Relacionar usuário existente sem criar credencial paralela.

**Aceite técnico:** Cadastro é executável e reutilizável; papéis usam a mesma identidade e permissões corretas. Um seletor sem possibilidade de cadastro acessível não comprova sozinho “realizar Cadastro”.

**Atenção / limite de escopo:** Não exigir que todo fornecedor seja servidor, funcionário ou usuário administrativo. Não criar RH ou login próprio.

<a id="clc-030"></a>
#### CLC-030 — Agrupamento de solicitações para formalizar a licitação

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 30, p. 51:**

> O sistema deverá permitir, quando necessário, o agrupamento de várias solicitações de compras ou serviços para fins de formalização do procedimento licitatório;

**Implementação:** Selecionar várias solicitações/linhas e formalizar o procedimento licitatório, mantendo origens, quantidades e unidades gestoras. Reutilizar o mecanismo de agrupamento de CLC-011, mas conservar finalidade/destino próprios para evitar consumir a mesma demanda duas vezes.

**Dados de outro módulo / serviço compartilhado:** DEP-03 — itens; DEP-02 — unidades; DEP-04 — vínculos de dotação preservados. Solicitações/procedimentos são do módulo.

**Demonstração:** Usar 60+40 resmas de SOL-A/SOL-B para PROC-M. Abrir ambas as origens; destinar as 5+5 horas ao caminho PROC-S. Tentar reutilizar novamente 100 resmas já integralmente destinadas como demanda livre.

**Aceite técnico:** Procedimento agrupa corretamente o conjunto escolhido, preserva rastreabilidade e não duplica necessidade. Quantidades de unidades/especificações incompatíveis não são fundidas.

**Atenção / limite de escopo:** Não confundir pesquisa agrupada com licitação já formalizada. Agrupar não é adjudicar nem exigir um único lote por todas as solicitações.

<a id="clc-031"></a>
#### CLC-031 — Vínculo contábil por item — repetição do item 25

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 31, p. 51:**

> Dispor de integração com o sistema contábil para efeito de vinculação das dotações orçamentárias contábeis nos itens constantes solicitação de compras ou serviços.

**Implementação:** Usar a integração de CLC-025 e conservar a dotação contábil dos itens de material/serviço, inclusive depois de agrupar ou abrir o procedimento. Não criar outra tabela de dotações em Compras.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — dotações e retorno contábil; DEP-02 — unidade/exercício.

**Demonstração:** Reabrir as linhas de SOL-B e conferir DOT-M/DOT-S; navegar da origem contábil ao agrupamento e consultar a mesma referência em novo acesso.

**Aceite técnico:** Vínculos contábeis por item permanecem reais e recuperáveis. Registrar evidência deste ID, ainda que a rotina seja compartilhada.

**Atenção / limite de escopo:** Ausência da fonte mantém pendência integrada; não aceitar texto local como substituto. Q-01.

<a id="clc-032"></a>
#### CLC-032 — Acompanhamento das etapas e emissão dos documentos do processo

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 32, p. 51:**

> Possibilitar o acompanhamento dos processos licitatórios desde a preparação até seu julgamento, registrando as etapas de:
> • Publicação do processo;
> • Emissão do relatório de quadro comparativo de preços;
> • Emissão das atas referente a documentação e julgamento das propostas;
> • Interposição de recurso;
> • Anulação e revogação;
> • Impugnação;
> • Parecer da comissão julgadora;
> • Parecer jurídico;
> • Homologação e adjudicação

**Implementação:** Disponibilizar registros de todos os nove tópicos da lista original: publicação; quadro comparativo emitido; atas de documentação e julgamento emitidas; recurso; anulação/revogação; impugnação; parecer da comissão; parecer jurídico; homologação/adjudicação. Cada ato tem processo, responsável, data e peça/resultado pertinente. Usar fases/peças existentes; atos compostos devem ter suas partes demonstráveis.

**Dados de outro módulo / serviço compartilhado:** DEP-05 — processo/peças/pareceres; DEP-07 — quadro/atas; DEP-02/01 — responsáveis; DEP-08 somente quando a publicação efetivamente usar esse conector.

**Demonstração:** Executar F-ATOS: no processo principal emitir quadro e atas, registrar publicação, pareceres e resultado; em cópias independentes registrar recurso, impugnação, anulação e revogação. Conferir separadamente homologação e adjudicação, sem forçar todos os estados no mesmo processo.

**Aceite técnico:** Nenhum tópico da lista fica sem registro/demonstração. Os documentos que o TR manda emitir são gerados do conteúdo real; os demais atos têm vínculo e histórico, não checkboxes sem conteúdo. Publicação registrada não é alegada como envio ao PNCP sem teste próprio.

**Atenção / limite de escopo:** Não acrescentar publicação paga, redação jurídica por IA ou sequência normativa inventada. Os nove tópicos não se tornam nove novos números do TR. Regras do rito em Q-04.

<a id="clc-033"></a>
#### CLC-033 — Reordenação das fases do processo

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 33, p. 51:**

> Possibilitar reordenar as fases do processo de acordo com a necessidade;

**Implementação:** Permitir alterar a sequência das fases pela configuração/ação autorizada, respeitando o estado e os atos já registrados. Mostrar a sequência efetiva; versionar ou conservar o histórico para não trocar retrospectivamente a ordem dos eventos.

**Dados de outro módulo / serviço compartilhado:** DEP-05 — mecanismo de processo/fases se compartilhado; DEP-02 — competência para configurar. A função de reordenar é exigida neste módulo.

**Demonstração:** Em cópia do processo ainda em preparação, mudar a ordem de duas fases previstas na configuração de ensaio e reabrir. Executar o próximo passo e conferir a ordem usada. Verificar que outro processo já em curso preserva seu histórico.

**Aceite técnico:** A ordem configurada muda de verdade o acompanhamento do processo e persiste. Não é apenas ordenação visual de uma lista de eventos nem edição retroativa do que ocorreu.

**Atenção / limite de escopo:** Não liberar transições incoerentes, reescrever atos passados ou criar novo motor geral de workflow. Q-04.

<a id="clc-034"></a>
#### CLC-034 — Numeração por modalidade

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 34, p. 51:**

> Numerar compras e licitações por modalidade;

**Implementação:** Numerar compras e licitações usando sequência no escopo de modalidade e do órgão/exercício adotado. Garantir unicidade sob concorrência e distinguir número do procedimento do número administrativo quando forem campos diferentes.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — órgão/exercício; DEP-05 — número administrativo, se existente. Sequência da modalidade pertence ao módulo/serviço já utilizado.

**Demonstração:** Criar dois processos de uma modalidade e dois de outra na base de teste; conferir as sequências independentes conforme a parametrização. Enviar duas criações concorrentes e verificar ausência de número duplicado.

**Aceite técnico:** Cada procedimento recebe número persistido e coerente com sua modalidade. Recarregar ou repetir a mesma confirmação não cria outro número/documento para o mesmo pedido.

**Atenção / limite de escopo:** Não impor formato de máscara não previsto nem renumerar histórico ao mudar modalidade sem tratamento explícito. Q-04.

<a id="clc-035"></a>
#### CLC-035 — Relatório de vencedores de preços

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 35, p. 51:**

> Emitir relatório de vencedores de preços;

**Implementação:** Emitir relatório dos vencedores a partir do resultado efetivamente registrado no procedimento, com fornecedor, item/lote, quantidade/unidade, preço e total pertinentes. Distinguir menor cotação de referência, arrematação e resultado final adotado.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — emissão; resultados e participantes são do módulo; DEP-01 — identificação do vencedor.

**Demonstração:** Depois do resultado autorizado de PROC-M, emitir FOR-B, 100 resmas, R$ 22,60 unitários/R$ 2.260 totais. Conferir que FOR-B a R$ 24,00 da pesquisa não foi copiado como preço final. Emitir o resultado do caminho de serviço quando registrado.

**Aceite técnico:** O relatório corresponde ao resultado e fase indicados, com valores derivados dos registros. Não escolhe novo vencedor durante a impressão nem apresenta uma pesquisa como contratação concluída.

**Atenção / limite de escopo:** Critérios efetivos de classificação/julgamento são os configurados, não algoritmo legal presumido. Q-04.

<a id="clc-036"></a>
#### CLC-036 — Menores preços no comparativo — repetição do item 12

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 36, p. 51:**

> O sistema deverá destacar no relatório de quadro comparativo de preços, as propostas que contém o menor preço;

**Implementação:** Reutilizar o quadro comparativo de CLC-012, preservando destaque dos menores e a identificação do contexto: pesquisa/propostas do processo. Não criar regra de menor preço diferente entre telas e emissão.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — relatório; respostas/preços do módulo.

**Demonstração:** Emitir novamente o quadro de F-COT e verificar FOR-B/papel e FOR-C/serviço, incluindo empate em cenário separado. Comparar o resultado com a visualização.

**Aceite técnico:** Destaque é calculado e permanece na emissão completa; totais e critérios coincidem. Evidência CLC-036 associada à implementação comum.

**Atenção / limite de escopo:** Não confundir indicação do menor preço com adjudicação automática.

<a id="clc-037"></a>
#### CLC-037 — Situações do processo licitatório

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 37, pp. 51–52:**

> Permitir informar a situação dos processos de licitação: concluída, anulada, cancelada, suspensa, deserta, fracassada ou revogada;

**Implementação:** Permitir registrar as sete situações literais: concluída, anulada, cancelada, suspensa, deserta, fracassada e revogada, com transição autorizada e histórico. Separar situação do processo de estado do lote, habilitação e execução contratual.

**Dados de outro módulo / serviço compartilhado:** DEP-05 — ato/peça/histórico quando compartilhados; DEP-02 — autorização.

**Demonstração:** Em sete cópias/ensaios independentes apropriados, registrar cada situação e reabrir a ficha/listagem. Consultar motivo/ato quando o fluxo exigir; verificar que não altera situação de outro processo ou contrato.

**Aceite técnico:** Todas as opções previstas são suportadas e persistidas. Estado muda pelo ato correto do usuário autorizado, não por edição irrestrita de uma string nem por cor estática.

**Atenção / limite de escopo:** Não impor novas causas legais ou tratar as sete situações como etapas obrigatórias de uma mesma contratação. Q-04.

<a id="clc-038"></a>
#### CLC-038 — Arquivos de prestação de contas de licitações e contratos ao Tribunal

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 38, p. 52:**

> O Módulo de Compras, Licitações e Contratos deverá permitir gerar arquivos para atender exigências do Tribunal de Contas relativos à prestação de contas dos atos administrativos de licitações e contratos,

**Implementação:** Localizar exportador, leiaute/versão/competência e regras oficiais aplicáveis aos atos de licitações e contratos; mapear dados do módulo, gerar arquivo e validar campos/códigos. Reutilizar adaptador/núcleo quando existir, registrando origem e resultado. Não preencher campos oficiais desconhecidos com valores arbitrários.

**Dados de outro módulo / serviço compartilhado:** DEP-09 — especificação/exportador; DEP-05 — atos; DEP-04/01 conforme campos do leiaute; dados de licitação/contrato são do módulo.

**Demonstração:** Com fonte e ambiente definidos em F-EXT, gerar a remessa a partir de processo e contrato de teste autorizados; conferir conteúdos pelos esquemas/regras aplicáveis. Remover um campo obrigatório em cenário negativo e mostrar erro acionável.

**Aceite técnico:** Arquivo é compatível com a especificação identificada e com os dados reais do ensaio. Há evidência da versão/competência e validação executada. Sem leiaute ou serviço, manter pendência — não marcar validado com CSV genérico.

**Atenção / limite de escopo:** O texto exige gerar arquivos, não transmissão automática nova. Não inventar XML, sistema de remessa, protocolo ou homologação. Q-02.

<a id="clc-039"></a>
#### CLC-039 — Registro de lances pelo fornecedor no celular

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 39, p. 52:**

> Possibilitar ao fornecedor o registro de lances através do celular;

**Implementação:** Disponibilizar envio de lance na área de disputa do mesmo site, usável no Chrome do celular com sessão do fornecedor. Validar participante, lote/estado, valor, regra e idempotência no servidor. A resposta identifica o lance aceito ou o erro real.

**Dados de outro módulo / serviço compartilhado:** DEP-06/02 — portal, identidade e permissão; serviço de disputa é parte própria de Compras.

**Demonstração:** FOR-B, em celular real, envia R$ 2.400 e depois R$ 2.300 no ensaio F-PREG. O pregoeiro e outra sessão veem os registros. Repetir o mesmo envio técnico e tentar lançar com lote encerrado.

**Aceite técnico:** O próprio fornecedor registra lance persistido e visível no pregão. Envio inválido não aparece como aceito; repetição não cria outro lance. Usar exclusivamente desktop estreitado não conclui o teste móvel.

**Atenção / limite de escopo:** Mesmo site, sem aplicativo separado, lojas ou PWA obrigatória. Não substituir por lance digitado pelo operador em nome do fornecedor. Regras de sessão em Q-04; compartilha CLC-046.

<a id="clc-040"></a>
#### CLC-040 — Integração PNCP no contexto de compras/licitações

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 40, p. 52:**

> Permite integração com o Portal Nacional de Compras Públicas – PNCP

**Implementação:** Localizar o adaptador e identificar a operação aplicável ao processo de compra/licitação, com contrato técnico, campos, permissões e ambiente. Acionar a integração pelo fluxo válido, conservando correlação e retorno. A denominação do PNCP na citação é preservada como consta no TR.

**Dados de outro módulo / serviço compartilhado:** DEP-08 — conector/contrato/acesso PNCP; DEP-01/05 e dados do processo conforme o mapeamento efetivo.

**Demonstração:** Em F-EXT, executar a operação definida para PROC-M no ambiente autorizado, verificar dados e referência retornada; testar rejeição e repetição sem duplicação. Mostrar a fonte de configuração usada.

**Aceite técnico:** Há integração funcional no escopo identificado; preparado/enviado/rejeitado/confirmado são distinguíveis. Link para o portal, payload montado ou mock isolado não comprovam execução integrada.

**Atenção / limite de escopo:** Não inventar endpoint, tipo de transmissão ou publicar DEMO em produção. Escopo/versão/ambiente em Q-03; compartilhar implementação com CLC-048/079 sem reduzir os contextos necessários.

<a id="clc-041"></a>
#### CLC-041 — Gerenciamento e acompanhamento da disputa e lances

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 41, p. 52:**

> Disponibilizar módulo de gerenciamento e acompanhamento da disputa e lances do pregão;

**Implementação:** Implementar área da sessão para gerir itens/lotes, participantes, estados e lances recebidos, usando a regra configurada. Pregoeiro acompanha sequência/valores e atua nos estados permitidos; fornecedores acompanham a visão autorizada. Conservar histórico e ordem real de aceitação.

**Dados de outro módulo / serviço compartilhado:** DEP-06/02 — sessão/acesso; domínio de pregão, lotes e lances é deste módulo.

**Demonstração:** Executar F-PREG com dois fornecedores em sessões distintas e pregoeiro. Conferir sequência 2.500→2.400→2.350→2.300, atualização das visões e passagem à negociação; testar concorrência e falha de retorno.

**Aceite técnico:** Disputa usa lances reais e estados consistentes, sem planilha estática nem digitação retrospectiva pelo pregoeiro. Valor, ordem e participante são recuperáveis, e bloqueios de estado são respeitados.

**Atenção / limite de escopo:** Não impor modo/tempo/desempate de outro edital; configurar o rito de ensaio e registrar limites. PNCP não é evidenciado por esta tela de disputa. Q-04.

<a id="clc-042"></a>
#### CLC-042 — Registro sintético dos participantes do pregão

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 42, p. 52:**

> Registrar de forma sintética os fornecedores participantes do pregão;

**Implementação:** Relacionar os fornecedores participantes à sessão por identificação canônica e identificação de participante usada na apresentação. Exibir resumo recuperável, evitando cadastrar novamente nomes/documentos; vínculo de participação é distinto da habilitação.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — fornecedor; DEP-06/02 — identidade/competência; vínculo de participação pertence ao pregão.

**Demonstração:** Incluir FOR-A e FOR-B em PROC-M; abrir resumo dos participantes e o fornecedor de origem. Tentar inscrição duplicada na mesma sessão e conferir que fornecedor ausente não consegue lançar.

**Aceite técnico:** Participantes são registros reais únicos no contexto, com vínculos e visualização sintética. Incluir participante não o habilita automaticamente nem lhe dá acesso interno.

**Atenção / limite de escopo:** Política de identificação pública na disputa em Q-04; não divulgar campos pessoais além do escopo configurado.

<a id="clc-043"></a>
#### CLC-043 — Tela dos licitantes com lote, status, participantes e valor

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 43, p. 52:**

> O sistema deverá disponibilizar uma tela para acompanhamento de lances para os licitantes, com a visualização do status e número do lote, licitantes e valor;

**Implementação:** Oferecer aos licitantes a grade de acompanhamento contendo explicitamente status e número do lote, licitantes e valor. Obter estados/valores do servidor e atualizar a visão sem depender de edição manual. Identificação de licitante conforme política de fase validada; não omitir o dado nem publicar nome indevidamente por suposição.

**Dados de outro módulo / serviço compartilhado:** DEP-06/02 — acesso externo; participantes/lotes/lances vêm do módulo, DEP-01 apenas para identidade autorizada.

**Demonstração:** Abrir como FOR-A no desktop e FOR-B no celular durante F-PREG; conferir os quatro elementos e a mudança após novo lance. Atualizar a página e verificar o mesmo resultado. Testar múltiplos lotes em base separada.

**Aceite técnico:** As quatro informações estão acessíveis, corretas e atuais na tela dos participantes. Valor indica seu critério e lote; atualização não muda o objeto focado nem expõe dados de outra sessão.

**Atenção / limite de escopo:** Não trocar os quatro dados por cards incompletos para caber no celular. Alias/nome por fase e regra de divulgação em Q-04.

<a id="clc-044"></a>
#### CLC-044 — Alteração do status de item/lote pelo pregoeiro

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 44, p. 52:**

> Possibilitar que o pregoeiro possa modificar o status do item/lote;

**Implementação:** Disponibilizar ações de mudança de estado do item/lote ao pregoeiro autorizado, conforme transições configuradas, com referência ao ato e registro de usuário/data. O novo estado deve afetar a aceitação de lances, não só sua aparência.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — pregoeiro/permissões; dados de sessão são do módulo.

**Demonstração:** Em F-PREG, pregoeiro muda lote de aberto para negociação/estado definido; conferir as telas e a regra de aceitação de novos lances. Fornecedor tenta a mesma ação por API: recusar.

**Aceite técnico:** Estado persiste e coordena a sessão; somente papel autorizado atua. Lote fechado não aceita lance por chamada direta. Alteração do lote não conclui todo o processo indevidamente.

**Atenção / limite de escopo:** Não habilitar edição livre de qualquer status sem histórico ou usar um número de estado inventado como regra do edital. Q-04.

<a id="clc-045"></a>
#### CLC-045 — Habilitação e inabilitação pelo pregoeiro/equipe de apoio

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 45, p. 52:**

> Possibilitar que o pregoeiro/equipe de apoio proceda com a habilitação ou inabilitação do fornecedor;

**Implementação:** Permitir registrar decisão de habilitação ou inabilitação do fornecedor no escopo do processo/item/lote adotado, com autoria, data e fundamento/peça pertinente. Respeitar as competências configuradas e preservar histórico de decisões sem alterar automaticamente a situação global do fornecedor.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — pregoeiro/apoio; DEP-05 — peças/fundamento; DEP-01 — fornecedor.

**Demonstração:** Habilitar FOR-B no processo principal. Em processo independente, pregoeiro e papel de apoio autorizado executam decisões de teste, inclusive inabilitação. O fornecedor externo tenta homologar/habilitar a si próprio: recusar.

**Aceite técnico:** As duas decisões são registradas e repercutem no resultado pertinente; os papéis citados podem atuar conforme permissão. Inabilitação local não desativa o fornecedor em todos os cadastros por efeito colateral.

**Atenção / limite de escopo:** Não criar julgamento jurídico automático, lista de documentos não fornecida ou confundir habilitação com cadastro ativo. Escopo e rito em Q-04.

<a id="clc-046"></a>
#### CLC-046 — Lances pelo celular — repetição do item 39

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 46, p. 52:**

> Possibilitar ao fornecedor o registro de lances através do celular;

**Implementação:** Usar a mesma operação de CLC-039, preservando envio pelo fornecedor no Chrome do celular e retorno real. Não criar cliente mobile separado nem endpoint com validação diferente.

**Dados de outro módulo / serviço compartilhado:** DEP-06/02 — portal/sessão; disputa do módulo.

**Demonstração:** No segundo lance de FOR-B em F-PREG, enviar R$ 2.300 do celular, conferir no pregoeiro, recarregar e tentar repetir o mesmo identificador de envio.

**Aceite técnico:** Lance aceito é persistido uma única vez e visível nas sessões; erro fica explícito. Evidência própria CLC-046 pode compartilhar o mesmo ensaio.

**Atenção / limite de escopo:** Não omitir o ID pela repetição nem exigir aplicativo por analogia com outro bloco. Q-04.

<a id="clc-047"></a>
#### CLC-047 — Atualização para arrematado ao encerrar a negociação

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 47, p. 52:**

> Encerrada a fase de negociação, o sistema deverá atualizar o status do item/lote indicando que o mesmo foi arrematado.

**Implementação:** Encerrar negociação por ação autorizada, registrar fornecedor/valor final do resultado válido e atualizar automaticamente o status do item/lote para arrematado. Executar os efeitos de forma coerente/idempotente; não exigir editar o status outra vez manualmente.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — competência; dados de negociação, lote e resultado do módulo.

**Demonstração:** Registrar negociação final com FOR-B por R$ 2.260 em F-PREG. Encerrar e conferir imediatamente lote arrematado, vencedor/valor e histórico. Repetir a confirmação; testar cenário sem resultado válido separadamente.

**Aceite técnico:** Um encerramento válido produz estado arrematado e os dados finais corretos uma vez. Sem resultado não se inventa arrematação; negociação encerrada não homologa/adjudica/contrata automaticamente.

**Atenção / limite de escopo:** Não construir chat novo por suposição nem confundir valor final com o menor da cotação de referência. Q-04.

<a id="clc-048"></a>
#### CLC-048 — Integração PNCP no contexto do procedimento e resultado

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 48, p. 52:**

> Permite integração com o Portal Nacional de Compras Públicas – PNCP

**Implementação:** Reutilizar CLC-040, identificando a operação e os dados pertinentes ao contexto de procedimento/resultado definido no contrato técnico. Manter rastreabilidade deste ID sem repetir uma publicação já confirmada ou inventar nova remessa apenas por haver outro número no TR.

**Dados de outro módulo / serviço compartilhado:** DEP-08 — adaptador/retorno; dados de processo/resultado do módulo.

**Demonstração:** Depois de registrar resultado no ensaio, conferir a operação PNCP aplicável ou a cobertura documentada da mesma integração; executar e verificar retorno em ambiente autorizado quando houver nova operação necessária. Reprocessar sem duplicação.

**Aceite técnico:** A capacidade PNCP está disponível e comprovada para o escopo acordado dos dados do procedimento; reutilização é demonstrada, não apenas declarada. Falta de credenciais/definição mantém pendência.

**Atenção / limite de escopo:** Não impor três envios iguais nos itens 40/48/79 nem considerar acesso ao site evidência de integração. Q-03.

### Subdivisão original: Convênios;

<a id="clc-049"></a>
#### CLC-049 — Registro de contratos e convênios com vigência calculada

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 49, p. 52:**

> Permitir o registro dos contratos e convênios informando número e ano do contrato, fornecedor contratado, datas de início e término, objeto, prazos, valores e quantidades contratadas, calculando a vigência contratual;

**Implementação:** Manter instrumentos dos tipos contrato e convênio, com número/ano, fornecedor contratado/contraparte mapeada, início/término, objeto, prazos, valores e quantidades. Calcular a vigência pelas datas e convenção explícita. Compartilhar estrutura com CLC-072, sem omitir convênio por estar numa aba de contratos.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — fornecedor/contraparte; DEP-05 — processo/documentos; DEP-04 — exportação prevista em CLC-052/075, quando o evento for aplicável.

**Demonstração:** Criar CT-M, CT-S e CV-01 de F-INSTR. Preencher os campos da fonte, reabrir e conferir valores/quantidades e 30/61/91 dias de vigência inclusiva. Alterar uma data em cópia editável para demonstrar recálculo.

**Aceite técnico:** Os dois tipos são mantidos com todos os dados exigidos; vigência é calculada, não digitada como texto solto. Alteração preserva versões/histórico conforme o ato aplicado.

**Atenção / limite de escopo:** A fonte usa dados de contrato também em convênios; preservar o campo e registrar o mapeamento em Q-05, sem inventar enquadramento jurídico. Não exigir PDF anexado como substituto dos campos estruturados.

<a id="clc-050"></a>
#### CLC-050 — Aditivos, suspensões e rescisões com motivo e data

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 50, p. 52:**

> Registrar os aditivos, suspensões e rescisões contratuais, indicando motivo e data;

**Implementação:** Registrar os três tipos de eventos contratuais com motivo, data e vínculo ao instrumento, guardando versão anterior e efeitos pertinentes em prazo/quantidade/valor ou situação. Usar a mesma capacidade nos instrumentos compatíveis, sem reescrever o original.

**Dados de outro módulo / serviço compartilhado:** DEP-05 — ato/peça, DEP-01/02 — responsáveis; DEP-04/08 se os efeitos exigirem atualização já definida no destino.

**Demonstração:** Executar F-ADITIVO em cópia: 100→110 resmas, R$ 2.260→R$ 2.486, término 30/09→31/10. Em outras cópias, registrar suspensão e rescisão; reabrir evento, motivo/data e situação.

**Aceite técnico:** Cada tipo de evento persiste com seus campos, e a ficha/razão mostra original e efeito correto. Suspensão/rescisão não apaga o instrumento nem simula pagamento.

**Atenção / limite de escopo:** Não aplicar limites legais, reajustes, recomposição ou prorrogação automática não fornecidos. Compartilha CLC-073; regras reais em Q-05.

<a id="clc-051"></a>
#### CLC-051 — Responsáveis, representantes, signatários e grupos do convênio

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 51, p. 52:**

> Permite o cadastro de responsáveis pelo Convenio, representantes, signatários e o agrupamento dos responsáveis;

**Implementação:** Permitir associar ao convênio pessoas nos papéis de responsável, representante e signatário, com agrupamentos identificáveis dos responsáveis. Selecionar do cadastro único; mesma pessoa pode ter vínculos diferentes sem duplicação.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — pessoas; DEP-02 — competência; relações/grupos do convênio pertencem ao módulo.

**Demonstração:** Em CV-01, associar responsáveis a dois grupos demonstrativos, um representante e um signatário. Reabrir e consultar a composição de cada grupo e seus papéis; editar vínculo em cópia sem afetar CT-M.

**Aceite técnico:** Os papéis e o agrupamento existem como relações recuperáveis do convênio, não nomes numa observação genérica. Alterar um instrumento não modifica o outro.

**Atenção / limite de escopo:** Não confundir cadastro de signatário com assinatura digital realizada nem criar outro organograma. Complementar a evidência de CLC-074 no contrato.

<a id="clc-052"></a>
#### CLC-052 — Exportação automática dos contratos ao SIAFIC

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 52, p. 52:**

> Integração total com o SIAFIC, exportando automaticamente todos os contratos cadastrados no sistema de compras, licitações e contratos e convênios.

**Implementação:** Ao cadastrar/confirmar contrato no fluxo definido, exportar automaticamente os dados pelo serviço SIAFIC, independentemente do ponto de entrada do cadastro. Conservar IDs, versão e resultado, sem duplicar contrato no destino por reprocessamento. Mapear o tratamento de convênio no contrato técnico sem inferir nova espécie de lançamento.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — recepção SIAFIC; DEP-01 — identificação da contraparte; documentos/instrumentos são do módulo.

**Demonstração:** Cadastrar CT-M e CT-S a partir dos contextos de contratos/convênios disponíveis, conferir registros no SIAFIC e dados de fornecedor, valor e prazo. Repetir evento e simular falha; verificar a cobertura do cadastro de CV-01 conforme escopo mapeado.

**Aceite técnico:** Todos os contratos do recorte gerado pelo módulo ficam disponíveis no destino automaticamente, com origem/retorno verificáveis. Não apenas os cadastrados por uma única tela. Tratamento dos instrumentos é documentado.

**Atenção / limite de escopo:** A redação fala em contratos cadastrados no sistema de compras, licitações e contratos e convênios. Não impor contabilização automática de todo convênio por interpretação. Compartilha CLC-075; Q-01/Q-05.

<a id="clc-053"></a>
#### CLC-053 — Relatório de razão de contratos e convênios

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 53, p. 52:**

> Emitir relatório de razão de contratos e convênios;

**Implementação:** Emitir razão dos instrumentos com identificação, valores/quantidades originais, eventos e posição correspondente. Distinguir aditivos, execução medida, parcelas programadas e atos de fornecimento/contabilidade quando exibidos; não somá-los como despesas independentes. Tipos contrato e convênio são filtráveis.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — emissão; DEP-04 apenas para valores/estados contábeis reais exibidos. Base principal são instrumentos/eventos do módulo.

**Demonstração:** Emitir F-INSTR: CT-M total 2.260/etapa 1.356, CT-S total 1.100/medição 440 e CV-01 total 1.000/etapa 400; parcelas ficam separadas. Emitir também a cópia de aditivo, mostrando original 2.260, acréscimo 226 e vigente 2.486.

**Aceite técnico:** O documento representa o histórico/posição dos dois tipos e concilia com seus eventos. Totais explicitam se são contratado, autorizado, executado, parcelado ou liquidado; não há soma dupla.

**Atenção / limite de escopo:** O TR não fornece leiaute de razão. A estrutura proposta é de demonstração e deve ser confrontada com o padrão existente; não substitui um razão contábil nem cria pagamentos. Q-05.

<a id="clc-054"></a>
#### CLC-054 — Medições e etapas de execução de contratos e convênios

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 54, p. 52:**

> Registrar as medições/etapas de execução dos contratos e convênios;

**Implementação:** Registrar medição/etapa vinculada ao instrumento, com identificação, período/data, itens ou entregas executadas, quantidade/unidade, valor e situação pertinente. Reutilizar o registro físico de origem quando já existente; não duplicar medição ao gerar ateste/AL.

**Dados de outro módulo / serviço compartilhado:** DEP-03 — recebimento material se origem; DEP-05 — peça técnica se usada; medição/etapa e vínculo ao instrumento pertencem ao módulo.

**Demonstração:** Em CT-S, medir 4 horas/R$ 440; em CV-01, registrar etapa de 4 unidades/R$ 400; em CT-M, recuperar a etapa de 60 resmas/R$ 1.356. Reabrir, somar executado e conferir saldos sem gerar estoque para serviço/convênio.

**Aceite técnico:** Contratos e convênios suportam execução registrada, recuperável e limitada ao que foi efetivamente executado no escopo. Parcela programada não é confundida com medição nem criada como outro gasto.

**Atenção / limite de escopo:** Não criar sistema de engenharia, medição de obra com fórmulas não pedidas ou pagamento automático. Compartilha a parte contratual de CLC-077.

<a id="clc-055"></a>
#### CLC-055 — Parcelas de contratos e convênios

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 55, p. 53:**

> Registrar as parcelas de contratos e convênios;

**Implementação:** Manter parcelas por instrumento, identificadas por número, vencimento/período e valor/quantidade pertinentes ao parcelamento escolhido. Recalcular totais e conferir o limite do instrumento sem multiplicar valores de medições. Situação de pagamento somente com fonte real.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — retorno financeiro só quando usado; DEP-07 — apresentação/relatório. Parcelas são dados do instrumento no módulo.

**Demonstração:** Registrar CT-M: R$ 1.356/R$ 904, CT-S: R$ 440/R$ 660 e CV-01: R$ 400/R$ 600. Reabrir, somar parcelas de cada instrumento e comparar com os valores vigentes. Em base isolada, paginar 12 parcelas.

**Aceite técnico:** Parcelas dos dois tipos persistem e totalizam 2.260,1.100 e 1.000 respectivamente; não desaparecem fora da primeira página. Programação não vira pagamento confirmado.

**Atenção / limite de escopo:** Não criar contas a pagar ou cobrança bancária. Compartilha CLC-078, com evidência separada.

### Subdivisão original: Fornecimento

<a id="clc-056"></a>
#### CLC-056 — Geração automática da solicitação/autorização de empenho — AE

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 56, p. 53:**

> Registrar, de forma automática, as solicitações de empenho para o reconhecimento inicial da despesa (AE);

**Implementação:** A partir da contratação/solicitação autorizada no fluxo, gerar a AE com fornecedor, objeto, linhas, quantidades/valores, dotações e vínculos herdados. Disparar pela ação/evento autorizado, sem redigitar itens nem confundir o documento AE com o empenho que será realizado pelo núcleo contábil.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — dotações/dados contábeis; DEP-01 — fornecedor; registros de contrato/solicitação são do módulo. Resultado de empenho pertence a CLC-057.

**Demonstração:** Em F-AUT, gerar AE de CT-M por R$ 2.260 e de CT-S por R$ 1.100. Abrir as origens e conferir linhas/dotações. Repetir o evento e verificar que não foi criada outra solicitação igual.

**Aceite técnico:** A AE é registro real derivado automaticamente da origem, com dados completos, identificação e estado corretos. Não é PDF avulso, cadastro digitado do zero ou declaração de empenho já efetivado.

**Atenção / limite de escopo:** “Reconhecimento inicial” e AE seguem o mapeamento do TR/núcleo; não inventar lançamento contábil fora dele. Evento gerador em Q-01.

<a id="clc-057"></a>
#### CLC-057 — Empenho da despesa por integração contábil

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 57, p. 53:**

> O sistema deverá realizar via integração com sistema contábil, o empenho da despesa

**Implementação:** Acionar a operação real da Contabilidade a partir da AE válida, com campos e referências exigidos pelo contrato interno/externo existente. Registrar retorno, número/ID e valor efetivamente empenhado; falha/pendência não pode produzir sucesso local fictício.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — serviço de empenho, validações e retorno real; integração obrigatória. Informar a operação faltante se o núcleo não a fornecer.

**Demonstração:** Empenhar as duas AE de F-AUT: R$ 2.260 e R$ 1.100. Abrir os lançamentos na Contabilidade, conferir dotações/credor e referências recíprocas. Repetir solicitação e simular indisponibilidade.

**Aceite técnico:** Empenhos existem no domínio contábil e correspondem às AE, total R$ 3.360 nesse conjunto. Repetição não cria segundo empenho; erro permanece identificado. Campo local com número inventado não satisfaz o item.

**Atenção / limite de escopo:** Não implementar empenhador paralelo, pagamento ou liquidação antecipada. As regras contábeis/financeiras vêm da origem configurada, não das fixtures. Q-01.

<a id="clc-058"></a>
#### CLC-058 — Geração e autorização automática do fornecimento — AF

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 58, p. 53:**

> Registrar e autorizar, de forma automática, que a entrega de materiais ou a execução de serviços, possam ser realizados pelo fornecedor/credor (AF);

**Implementação:** Gerar e autorizar AF a partir dos dados de fornecimento/contrato habilitados pelo fluxo, herdando fornecedor, itens, quantidades/valores e origem. A ação autorizada do usuário gera os registros automaticamente; separar autorização de entrega/execução efetiva. Atender material e serviço.

**Dados de outro módulo / serviço compartilhado:** DEP-03 — recebimento/estoque para material; DEP-04 — condições/retornos pertinentes; DEP-01 — fornecedor; AF pertence ao módulo.

**Demonstração:** Em F-AUT, gerar AF de 60 resmas/R$ 1.356 em CT-M e AF de 10 horas/R$ 1.100 em CT-S. Abrir os documentos sem redigitação; no material conferir a referência de entrada/recebimento conforme o serviço existente; no serviço verificar ausência de estoque.

**Aceite técnico:** As duas AF são efetivas, derivadas e vinculadas. A autorização não duplica saldo de contrato nem declara material entregue/serviço prestado antes de registro real. O fornecedor/credor correto fica identificado.

**Atenção / limite de escopo:** Compatibilizar ALM-009 e o gatilho existente de AF/entrada, sem impor nova aprovação ou nota fiscal inventada. Serviço não passa por saldo de estoque. Q-01.

<a id="clc-059"></a>
#### CLC-059 — Registro automático do ateste e autorização de liquidação — AL

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 59, p. 53:**

> Registrar o ateste da entrega de materiais ou execução de serviços, de forma automática, mediante autorização para que a devida despesa seja liquidada (AL);

**Implementação:** Na confirmação do ateste pelo responsável autorizado, gerar automaticamente o registro e a AL a partir da entrega material ou medição de serviço, recuperando linhas/valores e vínculos da AF. Impedir ateste superior à execução confirmada e duplicação da mesma parcela física.

**Dados de outro módulo / serviço compartilhado:** DEP-03 — recebimento de materiais; medição de serviço do módulo; DEP-02 — atestador; DEP-04 — operação subsequente de liquidação.

**Demonstração:** Atestar os 60 materiais recebidos/R$ 1.356 de CT-M e as 4 horas executadas/R$ 440 de CT-S; conferir AL e origem. Tentar atestar 10 horas quando só 4 estão registradas no recorte e repetir a confirmação válida.

**Aceite técnico:** Ateste e AL são derivados dos fatos executados, com responsável e valores corretos. Não há nova digitação integral, segunda apropriação ou liquidação contábil alegada apenas por gerar AL.

**Atenção / limite de escopo:** Não certificar entrega automaticamente só por emitir AF. Automatismo é documental/transacional a partir do ato e da evidência válidos. Q-01.

<a id="clc-060"></a>
#### CLC-060 — Liquidação da despesa por integração contábil

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 60, p. 53:**

> O sistema deverá realizar via integração com sistema contábil, a liquidação da despesa;

**Implementação:** Acionar o serviço real de liquidação do núcleo contábil com AL/ateste, empenho e origem corretos. Registrar referência/estado confirmado e conferir limites já liquidados. Processamento pendente ou erro não vira liquidação local simulada.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — liquidação/retornos; integração obrigatória. A função não se encerra sem disponibilidade da operação contábil.

**Demonstração:** Liquidar as AL de F-AUT por R$ 1.356 e R$ 440. Consultar Contabilidade e o mesmo documento em Compras; repetir envio e testar retorno falho. Conferir o total R$ 1.796 e referências dos empenhos.

**Aceite técnico:** Liquidações são lançamentos reais do domínio contábil, ligados a seus empenhos/AL e sem duplicação. A diferença R$ 1.564 para os empenhos desse ensaio não é apresentada como saldo bancário ou pagamento.

**Atenção / limite de escopo:** Não desenvolver liquidador paralelo, pagamento ou rotina bancária para contornar a dependência. Q-01.

<a id="clc-061"></a>
#### CLC-061 — Anulação de AE já reconhecida como despesa

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 61, p. 53:**

> Possibilitar anular as solicitações de empenho já reconhecidas como despesa (AE);

**Implementação:** Permitir anular a AE reconhecida no fluxo, gerando evento vinculado com motivo/data, valor/quantidade e estado final. Verificar atos dependentes e tratar o reflexo contábil pelo serviço competente, preservando original e retorno.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — anulação/reversão do empenho quando já produzido; DEP-05/07 — ato/documento/relatório. AE e evento são do módulo.

**Demonstração:** Usar F-ANU/AE, outra AE de R$ 2.260 com empenho real e sem AF/AL posteriores; anular e conferir evento/retorno contábil e efeito líquido zero. Repetir tentativa e abrir o relatório de anulação.

**Aceite técnico:** AE e despesa/efeito contábil pertinente ficam coerentes após anulação, sem exclusão nem dupla reversão. Mudar um status local mantendo o efeito necessário no destino não conclui o item.

**Atenção / limite de escopo:** Q-01 define efeito, parcialidade e ordem de dependências. Não escrever diretamente em tabelas contábeis nem afirmar reversão sem confirmação.

<a id="clc-062"></a>
#### CLC-062 — Anulação do fornecimento autorizado — AF

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 62, p. 53:**

> Possibilitar anular a entrega de materiais ou execução de serviços, já autorizados (AF);

**Implementação:** Registrar anulação vinculada à AF, com motivo/data e efeito em seu saldo/estado. Conferir se já houve entrada, execução ou AL posterior; usar os serviços adequados para tratar o que for dependente. Ato confirmado não é removido fisicamente.

**Dados de outro módulo / serviço compartilhado:** DEP-03 — entrada/recebimento se houver reflexo; DEP-04 se aplicável; DEP-07 — emissão. Não reconstruir os serviços de origem.

**Demonstração:** Em F-ANU/AF, anular autorização de 60 resmas/R$ 1.356 ainda sem entrega. Conferir AF inativa e origem/preenchimento pendente do Estoque quando existente. Em caso já recebido, impedir anulação incoerente e apresentar a reversão necessária.

**Aceite técnico:** Anulação tem efeito real na autorização e nas referências que dependem dela. Material já recebido não desaparece indevidamente; repetição não libera saldo duas vezes. Relatório reproduz o evento.

**Atenção / limite de escopo:** Não apagar recebimento físico ou AL posterior para “fazer fechar” a anulação. Pendência de serviço de reversão é registrada, não ocultada. Q-01.

<a id="clc-063"></a>
#### CLC-063 — Anulação do ateste/autorização de liquidação — AL

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 63, p. 53:**

> Possibilitar anular a entrega de materiais ou execução de serviços, já atestados (AL);

**Implementação:** Registrar evento de anulação da AL/ateste com referência, motivo/data e valor/quantidade; verificar liquidação ou outros atos dependentes. Quando já liquidado, acionar o tratamento contábil previsto e aguardar confirmação coerente, sem alterar a execução física por suposição.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — reversão da liquidação quando já produzida; DEP-03 apenas se houver reflexo físico real definido; DEP-07 — relatório.

**Demonstração:** Em F-ANU/AL, usar outra AL de R$ 440 com ateste e liquidação confirmada, anular e conferir reversão pertinente na Contabilidade. A execução de serviço original segue documentada; repetir anulação e emitir o relatório.

**Aceite técnico:** O ateste/AL e seu reflexo financeiro pertinente ficam coerentes, com valor revertido uma vez e origem preservada. O histórico distingue execução, ateste anulado e liquidação revertida.

**Atenção / limite de escopo:** Não remover serviço executado/material recebido automaticamente ao anular AL. Se faltar reversão no núcleo, a funcionalidade integrada permanece parcial. Q-01.

<a id="clc-064"></a>
#### CLC-064 — Complementação de AE já reconhecida como despesa

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 64, p. 53:**

> Possibilitar complementar as solicitações de empenhos já reconhecidas como despesa (AE);

**Implementação:** Complementar a solicitação/AE por evento vinculado ao original, respeitando os limites da contratação/dotação e os atos contábeis já praticados. Herdar dados, registrar motivo/data e diferença; usar a operação de complemento da origem pertinente, sem repetir o valor total como nova despesa.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — saldo/validação e complementação contábil; dados do contrato e AE no módulo.

**Demonstração:** Executar F-COMP: AE/empenho R$ 1.808 de 80 resmas, complemento R$ 452 de 20; conferir total R$ 2.260/100 no documento e efeito contábil. Repetir o envio e tentar exceder o limite em teste separado.

**Aceite técnico:** Original, complemento e total são distinguíveis, persistidos e conciliados com o núcleo. Não são criados R$ 2.260 adicionais sobre os R$ 1.808; reenvio não complementa duas vezes.

**Atenção / limite de escopo:** Não aumentar automaticamente contrato/dotação nem inventar aditivo para justificar excesso. Este cenário usa margem já prevista no contrato. Q-01.

<a id="clc-065"></a>
#### CLC-065 — Relatório de autorização de empenho — AE

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 65, p. 53:**

> Emitir relatório de autorização de empenho (AE);

**Implementação:** Emitir AE a partir de seu registro real, com número/tipo, origem, fornecedor, linhas, dotação e valores pertinentes, identificando estado e eventual referência contábil. Reutilizar o motor documental sem recadastro.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — relatório; DEP-04 — referência contábil real quando apresentada; AE do módulo.

**Demonstração:** Emitir as AE de CT-M/CT-S: R$ 2.260 e R$ 1.100. Conferir linhas e vínculos; no cenário de complemento, mostrar original/diferença/total corretamente. Testar documento de mais de uma página.

**Aceite técnico:** Documento corresponde à AE selecionada e inclui todo o conteúdo aplicável, não só itens visíveis. Emissão não cria novo empenho nem altera o valor.

**Atenção / limite de escopo:** Manter nome AE e não chamar o PDF de nota de empenho efetivada sem comprovação. Modelo exato da entidade em Q-05.

<a id="clc-066"></a>
#### CLC-066 — Relatório de autorização de fornecimento — AF

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 66, p. 53:**

> Emitir relatório de autorização de fornecimento (AF);

**Implementação:** Emitir AF selecionada, com fornecedor/credor, origem, objeto/itens, quantidades/valores, tipo de material/serviço e situação, usando os dados registrados. Documento não declara recebimento ainda não ocorrido.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — emissão; DEP-01 — fornecedor; DEP-03 apenas para referências de material/recebimento, sem recalcular o ato durante impressão.

**Demonstração:** Emitir AF material 60 resmas/R$ 1.356 e AF serviço 10 horas/R$ 1.100 de F-AUT. Comparar com contrato/origem e verificar todas as linhas da emissão.

**Aceite técnico:** Relatório reproduz cada AF e seu contexto correto, com totais conciliados. Emissão não duplica autorização nem cria saldo físico/execução.

**Atenção / limite de escopo:** Não substituir por NF nem por relatório de recebimento. Não criar nova autorização ao reimprimir.

<a id="clc-067"></a>
#### CLC-067 — Relatório de anulação de AE

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 67, p. 53:**

> Emitir relatório de anulação de autorização de empenho (AE);

**Implementação:** Emitir documento específico a partir do evento de anulação da AE, identificando AE original, data, motivo, responsável e valores/quantidades anulados, com referências de retorno contábil quando existentes.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — emissão; DEP-04 — referência de anulação contábil confirmada; evento do módulo.

**Demonstração:** Após F-ANU/AE, emitir a anulação de R$ 2.260 e abrir a AE original. Conferir evento único, retorno e situação; reimprimir sem produzir novo efeito.

**Aceite técnico:** O documento vem de anulação realmente registrada, preserva a origem e tem valor correto. Não é a AE original renomeada nem relatório vazio que diz “anulado”.

**Atenção / limite de escopo:** Não confundir anulação de AE com anulação de AF ou AL. Não emitir comprovante de reversão ainda pendente como concluído.

<a id="clc-068"></a>
#### CLC-068 — Relatório de anulação de AF

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 68, p. 53:**

> Emitir relatório de anulação de autorização de fornecimento (AF);

**Implementação:** Emitir documento da anulação de AF, com referência original, fornecedor, itens/valores pertinentes, data/motivo e estado. Derivar do mesmo evento que alterou a autorização, não de entrada manual para impressão.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — relatório; DEP-03 — referência física somente quando aplicável; evento de AF do módulo.

**Demonstração:** Emitir F-ANU/AF de 60 resmas/R$ 1.356, conferir origem e anulação. Consultar o reflexo pertinente no Estoque se houver; reimprimir e confirmar ausência de novo evento.

**Aceite técnico:** Documento e ficha/razão da AF conciliam com a anulação efetiva. Não descreve recebimento revertido se essa operação não ocorreu.

**Atenção / limite de escopo:** Não reaproveitar texto/valor de anulação de AE sem distinguir o documento.

<a id="clc-069"></a>
#### CLC-069 — Relatório de anulação de AL

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 69, p. 53:**

> Emitir relatório de anulação de autorização de liquidação (AL);

**Implementação:** Emitir documento específico da anulação de AL/ateste, mostrando AL original, origem física/serviço, data/motivo, responsável e valor anulado, com referência do tratamento contábil real quando aplicável.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — emissão; DEP-04 — reversão confirmada quando houver; AL/evento do módulo.

**Demonstração:** Emitir a anulação de R$ 440 de F-ANU/AL; conferir AL original e retorno da Contabilidade. Comparar com razão AL e o registro de execução que permaneceu existente.

**Aceite técnico:** Relatório descreve a anulação correta sem apagar ou falsamente reverter a execução física. Documento, evento e efeito contábil pertinente são conciliáveis.

**Atenção / limite de escopo:** Não tratar um PDF de anulação como execução do estorno financeiro. Resultado pendente deve ser indicado.

<a id="clc-070"></a>
#### CLC-070 — Relatório de razão de AF

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 70, p. 53:**

> Emitir relatório de razão de autorização de fornecimento (AF);

**Implementação:** Emitir razão das autorizações de fornecimento, com identificação, origens, eventos e posição por documento/recorte. Mostrar emitido, anulado, vigente e executado quando houver, em medidas distintas; conservar unidades/quantidades e valores coerentes.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — relatório; DEP-03 — execução material quando exibida; AF e eventos do módulo.

**Demonstração:** No conjunto principal, consultar AF material 60/R$ 1.356 e serviço 10h/R$ 1.100. Em cenário independente de anulação, mostrar autorização original, anulação e valor vigente zero. Paginar eventos e exportar todo o recorte.

**Aceite técnico:** Razão permite conciliar a história de cada AF, sem somar como gasto novo a emissão, a entrega e o ateste. Filtros/totais abrangem todas as páginas.

**Atenção / limite de escopo:** O leiaute de razão não é dado pelo TR. Identificar medidas e convenções; não criar um razão contábil paralelo. Q-05.

<a id="clc-071"></a>
#### CLC-071 — Relatório de razão de AL

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 71, p. 53:**

> Emitir relatório de razão de autorização de liquidação (AL)

**Implementação:** Emitir razão de AL com atestes/autorização, anulações e posição, separando valor atestado/autorizado do liquidado retornado pela Contabilidade. Incluir origem e data de cada efeito, com referências corretas.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — emissão; DEP-04 — liquidação/reversão confirmadas; registros AL do módulo.

**Demonstração:** No conjunto F-AUT, conferir AL material R$ 1.356 e serviço R$ 440, total R$ 1.796; em conjunto de anulação separado, mostrar AL original e reversão pertinente. Conferir a fonte contábil e exportação integral.

**Aceite técnico:** Razão AL concilia com atestes/eventos e liquidações reais quando apresentados, sem dupla soma. AL pendente não aparece liquidada por falta de retorno.

**Atenção / limite de escopo:** Não fundir o razão AF com o AL sem distinção de medidas e tipo documental. Q-01/Q-05.

### Subdivisão original: Contratos:

<a id="clc-072"></a>
#### CLC-072 — Contratos e convênios com campos completos — repetição do item 49

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 72, pp. 53–54:**

> Permitir o registro dos contratos e convênios informando número e ano do contrato, fornecedor contratado, datas de início e término, objeto, prazos, valores e quantidades contratadas, calculando a vigência contratual;

**Implementação:** Disponibilizar na área Contratos a mesma manutenção de instrumentos de CLC-049, preservando todos os campos e cálculo de vigência. O caminho desta área não pode perder convênios, quantidades ou fornecedor/contraparte por usar um formulário simplificado.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — fornecedor/contraparte; DEP-05 — processo; DEP-04 — exportação do evento pertinente. Mesma estrutura de CLC-049.

**Demonstração:** Criar ou reabrir CT-S e CV-01 pelo contexto Contratos, verificar dados e cálculo de 61/91 dias conforme F-INSTR. Conferir que se trata dos mesmos IDs vistos na área de instrumentos/convênios.

**Aceite técnico:** Todos os dados literais são mantidos no mesmo domínio, sem recadastro paralelo. Vigência e totais conciliam com o item 49 e não dependem do menu usado.

**Atenção / limite de escopo:** Repetição preserva evidência separada, não cria outro cadastro. Este item cruza pp.53–54; mapeamento de convênio e vigência em Q-05.

<a id="clc-073"></a>
#### CLC-073 — Aditivos, suspensões e rescisões — repetição do item 50

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 73, p. 54:**

> Registrar os aditivos, suspensões e rescisões contratuais, indicando motivo e data;

**Implementação:** Reutilizar o registro de eventos contratuais com motivo/data, versionamento e efeitos pertinentes. Expor os mesmos eventos pelo contexto Contratos, sem alterá-los ou recalculá-los de maneira diferente da ficha principal.

**Dados de outro módulo / serviço compartilhado:** DEP-05 — peça/ato; DEP-04/08 quando atualização no destino for parte do mapeamento; evento do módulo.

**Demonstração:** Abrir a cópia de F-ADITIVO pela área Contratos e conferir acréscimo R$ 226/10 resmas e nova data; nas cópias de suspensão/rescisão, conferir os respectivos motivos e datas.

**Aceite técnico:** Os três eventos estão disponíveis e persistidos com origem e efeitos idênticos aos da implementação compartilhada. Nenhum é substituído por simples anotação sem vínculo.

**Atenção / limite de escopo:** Não gerar o mesmo aditivo duas vezes para provar os itens 50 e 73. Limites e efeitos reais vêm da configuração identificada, não dos números da fixture. Q-05.

<a id="clc-074"></a>
#### CLC-074 — Responsáveis, representantes, signatários e grupos do contrato

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 74, p. 54:**

> Permite o cadastro de responsáveis pelo Contrato, representantes, signatários e o agrupamento dos responsáveis;

**Implementação:** Manter no contrato as relações de responsáveis, representantes, signatários e agrupamentos, usando a mesma capacidade de CLC-051 com escopo contratual. Identificar o papel e grupo de cada vínculo sem duplicar pessoas.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — pessoas; DEP-02 — autorização; papéis/grupos vinculados ao instrumento no módulo.

**Demonstração:** Em CT-M, cadastrar dois agrupamentos de responsáveis, representante e signatário; reabrir e comparar com CV-01. Editar vínculo no contrato e confirmar que o convênio não foi alterado.

**Aceite técnico:** Todas as relações exigidas funcionam no contrato, independentemente da cobertura anterior do convênio. Uma lista de nomes sem papéis/grupos não é suficiente.

**Atenção / limite de escopo:** Não substituir por comissão de licitação e não alegar assinatura realizada por cadastrar signatário.

<a id="clc-075"></a>
#### CLC-075 — Exportação de contratos ao SIAFIC — repetição do item 52

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 75, p. 54:**

> Integração total com o SIAFIC, exportando automaticamente todos os contratos cadastrados no sistema de compras, licitações e contratos e convênios.

**Implementação:** Reutilizar a exportação automática de CLC-052, incluindo contratos criados/confirmados no contexto Contratos. A origem canônica e o evento idempotente devem impedir segunda exportação como novo instrumento só por acessar outro menu.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — recepção/retorno SIAFIC; dados do contrato/fornecedor conforme CLC-052.

**Demonstração:** Cadastrar contrato de teste pelo caminho de CLC-072, verificar recepção no SIAFIC e retorno. Reprocessar e consultar o mesmo identificador no destino; testar erro de recepção.

**Aceite técnico:** Contrato chega automaticamente e uma única vez ao destino correto, sem depender de recadastro nem do ponto de entrada. Falha não é ignorada e evidência cobre CLC-075.

**Atenção / limite de escopo:** Não substituir pela geração manual de arquivo nem esconder fonte indisponível. Q-01.

<a id="clc-076"></a>
#### CLC-076 — Relatório de razão de contratos

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 76, p. 54:**

> Emitir relatório de razão de contratos;

**Implementação:** Usar o motor de razão de CLC-053 com recorte de contratos, preservando eventos e medidas distintas. O filtro de tipo deve excluir convênios quando a emissão é explicitamente contratual.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — relatório; DEP-04 para efeitos contábeis realmente exibidos; instrumentos/eventos do módulo.

**Demonstração:** Emitir CT-M/CT-S com seus valores e etapas, sem CV-01. Conferir a cópia com aditivo em recorte separado e as relações de execução/parcelas em colunas próprias.

**Aceite técnico:** Documento é emitido para os contratos do filtro e concilia com as fichas. Não soma medição e parcela como duas despesas nem inclui convênio por falha de tipo.

**Atenção / limite de escopo:** O item 53 exige razão também de convênios; esta emissão contratual não substitui a prova dos dois tipos. Q-05.

<a id="clc-077"></a>
#### CLC-077 — Medições e etapas dos contratos

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 77, p. 54:**

> Registrar as medições/etapas de execução dos contratos;

**Implementação:** Reutilizar CLC-054 no contexto de contratos, vinculando execução às linhas/etapas e preservando quantidade/unidade, período e valor reais. Reaproveitar a origem de recebimento/serviço para não gerar execução duplicada ao abrir por outro caminho.

**Dados de outro módulo / serviço compartilhado:** DEP-03 — recebimento material quando origem; medição de serviço/instrumento do módulo; DEP-05 para peça utilizada.

**Demonstração:** Abrir a medição CT-S de 4 horas/R$ 440 e a entrega CT-M de 60 resmas/R$ 1.356 pelo contrato; conferir o restante 6h/R$ 660 e 40 resmas/R$ 904. Tentar registrar de novo a mesma origem como nova medição.

**Aceite técnico:** Contrato tem histórico de execução real e limites coerentes, distinto da programação de parcelas. Reenvio ou outro menu não duplica o fato físico.

**Atenção / limite de escopo:** Não criar medição de obra especializada ou recalcular custos de outros módulos. A demonstração também deve existir para convênio em CLC-054.

<a id="clc-078"></a>
#### CLC-078 — Parcelas de contratos e convênios — repetição do item 55

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 78, p. 54:**

> Registrar as parcelas de contratos e convênios;

**Implementação:** Disponibilizar as parcelas de CLC-055 no contexto Contratos, preservando os dois tipos de instrumento, seus totais e datas. Não criar uma lista de parcelas paralela às já cadastradas.

**Dados de outro módulo / serviço compartilhado:** DEP-04 somente para retornos financeiros utilizados; DEP-07 para emissão pertinente; parcelas do módulo.

**Demonstração:** Reabrir CT-M: R$ 1.356/R$ 904, CT-S: R$ 440/R$ 660 e CV-01: R$ 400/R$ 600; conferir somatórios e últimas páginas no ensaio extenso. Alterar parcela em cópia de teste e confirmar atualização apenas daquele instrumento.

**Aceite técnico:** Parcelamento é persistido e reutilizado em ambos os contextos, sem soma/duplicação adicional nem perda de linhas. Pagamento só aparece confirmado quando houver origem financeira real.

**Atenção / limite de escopo:** Não desenvolver outro contas a pagar nem marcar parcelas pagas para aparentar integração. Compartilha CLC-055.

<a id="clc-079"></a>
#### CLC-079 — Integração PNCP no contexto contratual

**TR — COMPRAS, LICITAÇÕES E CONTRATOS, item 79, p. 54:**

> Permite integração com o Portal Nacional de Compras Públicas – PNCP

**Implementação:** Reutilizar o conector PNCP para as operações contratuais aplicáveis e identificadas, com vínculo ao contrato, versão/documentos necessários e retorno real. A integração genérica de compras não comprova automaticamente a cobertura de contrato; mapear o contexto sem inventar endpoints.

**Dados de outro módulo / serviço compartilhado:** DEP-08 — PNCP e mapeamento contratual; DEP-05/07 — documento/versão; dados do instrumento no módulo.

**Demonstração:** Em F-EXT, executar a operação admitida para CT-M no ambiente autorizado, conferir identificação/valor/arquivo e referência retornada. Repetir evento e testar rejeição; preservar histórico de tentativas e resultado confirmado.

**Aceite técnico:** Operação contratual efetivamente funciona conforme contrato técnico identificado, sem duplicação nem confirmação fictícia. Documento transmitido é a versão correta; falta de acesso/definição mantém pendência.

**Atenção / limite de escopo:** Não tratar os itens 40/48/79 como três publicações do mesmo fato, nem considerar o acesso ao site suficiente. Não enviar DEMO a produção. Q-03.


---
<a id="pacotes"></a>
## 8. Pacotes de implementação

Cada pacote entrega interface, validação, persistência, documentos/integrações pertinentes e testes, sem encerrar só com componentes visuais. Iniciar a definição das dependências em P0; não aguardar o fim do módulo para descobrir que faltam empenho, liquidação ou acesso PNCP.

| Pacote | Entrega | IDs principais |
|---|---|---|
| **P0 — Diagnóstico e fronteiras** | Mapa do código, tela-piloto, fontes DEP-01 a DEP-10 e abertura das Q-01 a Q-06. Identificar serviços contábeis e especificações externas antes dos adaptadores. | Classificação inicial de todos os 79, sem marcar como implementados. |
| **P1 — Cadastro e participantes institucionais** | Pessoas/fornecedores, CPF/CNPJ, ME/EPP, CNAE, certidões, links, exportação de fornecedor e comissões/papéis. | 1–9, 20, 26, 29. |
| **P2 — Demanda, pesquisa e portal** | Planejamento/solicitação, agrupamento, dotações, cotação/convites, prazo, respostas, e-mails e comparativo. | 10–19, 23–25, 30–31, 36. |
| **P3 — Processo e atos** | Cadastro completo, vínculos, fases/numeração, atos e atas, situações e relatório de vencedores. CLC-021 só se conclui após a cadeia posterior estar comprovada. | 21–22, 28, 32–35, 37. |
| **P4 — Disputa** | Participantes, lances no Chrome do celular, grade, estado de lote, habilitação, negociação e arrematação. | 39, 41–47. |
| **P5 — Instrumentos** | Contratos/convênios, vigência, responsáveis/grupos, eventos, medições/parcelas, razão e exportação ao SIAFIC. | 49–55, 72–78. |
| **P6 — Fornecimento e contabilidade** | AE/AF/AL derivados, empenho/liquidação reais, integração Estoque, anulações e complemento. | 27, 56–64. |
| **P7 — Relatórios de fornecimento** | AE/AF, anulações dos três tipos e razões AF/AL, com dados dos atos efetivos. | 65–71. |
| **P8 — Tribunal e PNCP** | Exportador de atos licitatórios/contratos e operações PNCP nos contextos definidos. Começar o trabalho assim que houver especificação, em paralelo aos demais. | 38, 40, 48, 79. |
| **P9 — Ensaio e fechamento** | Executar os cenários completos, matriz de 79 linhas, regressões e inspeção de UX. Documentar pendências por item. | Todos, sem recontar funcionalidades. |

Não estimar horas/dias sem diagnóstico. Reaproveitar o que já for funcional, evitando nova versão de uma rotina existente. **Não reconstruir os módulos de origem**; implementar as chamadas/vínculos de Compras e registrar as faltas. Um conector indisponível não impede cadastrar demandas, mas impede afirmar concluído o resultado integrado correspondente.

<a id="testes"></a>
## 9. Testes e evidências

### 9.1 Testes mínimos da adaptação

| Teste | Resultado verificável |
|---|---|
| Cadastro único e PF/PJ | Cadastro efetivo de PF/PJ, documento condicional em tela/API, identificação reutilizada, ME/EPP não confundido com tipo de pessoa. |
| Busca completa | Nome, CPF/CNPJ, enquadramento e situação sobre todos os registros; fornecedor da terceira página é localizado. |
| Documentos e links | Relatório usa validade, cinco grupos de links funcionam, CNAE com código/fonte identificada; links não alegam certidão obtida. |
| Situação e janela | Inativo/bloqueado não responde; mudança de situação entre abrir/enviar é respeitada; encerramento validado no servidor. |
| Portal e mensagens | Compra, fornecedor e itens na grade; convite com link/chave; resposta salva gera aviso ao solicitante; relatório próprio emitível. |
| Cotação e comparativo | 100 resmas/10 horas; menores por item FOR-B/FOR-C; três totais iguais a R$ 3.700; empate e ausência de resposta corretamente tratados. |
| Orçamento | Dotações realmente vindas da Contabilidade, por linha, preservadas no agrupamento; não inventar suficiência quando não consultada. |
| Agrupamento | 60+40 resmas e 5+5 horas com duas origens; pesquisa e formalização licitatória distintas; sem consumir demanda duas vezes. |
| Atos de processo | Nove tópicos de CLC-032, com emissão de atas/quadro e registros das demais ações; estados incompatíveis em cenários separados. |
| Fases/numeração | Reordenação efetiva sem reescrever passado; numeração única por modalidade/escopo, inclusive concorrente. |
| Disputa no celular | Fornecedor envia lance no Chrome real; pregoeiro/participantes recebem atualização; quatro dados de CLC-043 visíveis. |
| Estado e identidade do lance | Participação e permissão validadas; lote correto; ordem autoritativa do servidor; repetição/timeout/concorrência tratados sem duplicação. |
| Negociação e habilitação | Decisões por papel autorizado, estado final arrematado após negociação válida, sem adjudicação/homologação/contrato automáticos indevidos. |
| Instrumentos | Contrato e convênio, campos completos, vigência calculada, papéis e grupos; assinatura não é presumida por ter signatário cadastrado. |
| Aditivos e atos | F-ADITIVO: R$ 2.260+226=2.486, 100+10=110; eventos com motivo/data e original preservado; suspensão/rescisão em cópias próprias. |
| Execução/parcelas | Medições CT-S 4 h/R$ 440, CV-01 4 un/R$ 400; parcelas separadas, sem duplicar gastos nem declarar pagamento sem retorno. |
| Ciclo de material | AE R$ 2.260 → empenho real → AF 60/R$ 1.356 → Estoque 0→60 → ateste/AL R$ 1.356 → liquidação real. |
| Ciclo de serviço | AE R$ 1.100 → empenho → AF 10 h/R$ 1.100 → execução 4h/440 → AL R$ 440 → liquidação; sem entrada de estoque. |
| Conciliação financeira | Empenhado R$ 3.360; liquidado R$ 1.796; diferença R$ 1.564 com rótulo correto. AE, AF, AL e parcelas não são novas despesas somáveis. |
| Anulações | AE reconhecida, AF autorizada e AL atestada, com efeitos reais/reflexos pertinentes; repetição não estorna duas vezes; originais preservados. |
| Complemento | AE R$ 1.808 + R$ 452 = R$ 2.260 e vínculo contábil coerente, dentro do contrato de teste; não criar mais 2.260 como nova despesa. |
| Exportação SIAFIC | Fornecedor e contratos chegam ao destino automaticamente, com retorno real; mesma origem não cria duplicatas. |
| Tribunal | Arquivo conforme leiaute/competência identificados; campos/regras validados; erro não é preenchido por valor fictício. |
| PNCP | Operações de processo/resultado/contrato conforme mapeamento; confirmar retorno e rejeição; mock/link não comprova integração. |
| Relatórios | Todos os nomes/tipos exigidos emitidos; AE/AF e anulações/razões usam atos reais; inteiro do filtro, não só a página atual. |
| Persistência/segurança | Reabrir em outra sessão mantém registros; API/anexos/relatórios não contornam usuário, órgão, fornecedor e setor. |
| Interface | Fonte/densidade e paginação do padrão; sem corte de dados; foco/teclado/erros; contexto preservado; Chrome real e zoom acessíveis. |

Esses testes são meios de comprovar os requisitos, não outra lista numerada de exigências do edital. O agente pode decompor tecnicamente os testes, mas deve conservar o vínculo aos 79 IDs.

### 9.2 Detalhe obrigatório do teste de CLC-032

| Parte textual da fonte | Evidência necessária |
|---|---|
| Publicação do processo | Ato/referência de publicação associado ao processo; envio a canal externo somente se realmente executado. |
| Emissão do quadro comparativo | Documento gerado e consistente com propostas/preços. |
| Emissão das atas de documentação e julgamento | Conteúdo/atas emitidos para as duas matérias, usando o formato aplicável; não só upload de arquivo pré-pronto. |
| Interposição de recurso | Registro de recurso com processo, autoria/data e conteúdo/peça. |
| Anulação e revogação | Registros distintos, em cenários apropriados; não apenas uma opção genérica “cancelar”. |
| Impugnação | Registro próprio vinculado ao processo, sem confundir com recurso. |
| Parecer da comissão julgadora | Peça/registro identificável no contexto correto. |
| Parecer jurídico | Peça/registro próprio, não substituído pelo parecer da comissão. |
| Homologação e adjudicação | Os dois atos são registráveis/consultáveis conforme fluxo; arrematação não os substitui. |

### 9.3 Matriz real de execução

O agente deverá preencher a tabela abaixo com rotas, serviços e testes **realmente encontrados/executados**. “Orientação presente” não significa código pronto. Repetidos podem compartilhar evidência, mas cada ID permanece. Estados: `A_VERIFICAR`, `EXISTE_NAO_TESTADO`, `A_IMPLEMENTAR`, `PARCIAL`, `DEPENDENCIA_OUTRO_MODULO`, `BLOQUEADO_EXTERNO`, `AGUARDA_DEFINICAO`, `VALIDADO_TECNICAMENTE`.

| ID | Ação do TR / cobertura documental | Estado de execução | Tela/serviço real | Teste / evidência | Dependência / decisão |
|---|---|---|---|---|---|
| CLC-001 | Identificação das empresas como ME e EPP — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-002 | Pesquisa de fornecedores por nome, documento, enquadramento e situação — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-003 | Validades de certidões/documentos e relatórios — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-004 | Cadastro CNAE vinculado ao fornecedor — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-005 | Fornecedores pessoas físicas e jurídicas — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-006 | Campos condicionais de CPF e CNPJ — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-007 | Links de consulta de regularidade — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-008 | Exportação automática de fornecedores ao SIAFIC — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-009 | Pesquisa de fornecedores — repetição do item 2 — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-010 | Pesquisa de preços e referência da contratação — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-011 | Agrupamento de solicitações para pesquisa de preços — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-012 | Quadro comparativo com menores preços destacados — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-013 | Convite por e-mail com identificação, link e chave — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-014 | Grade do portal com compra, fornecedor e itens — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-015 | E-mail ao solicitante após resposta do fornecedor — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-016 | Relatório dos preços ofertados pelo fornecedor — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-017 | Janela configurável e indisponibilidade após encerramento — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-018 | Data de apresentação da proposta — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-019 | Bloqueio de respostas de fornecedores inativos ou bloqueados — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-020 | Identificação ME/EPP no processo — repetição do item 1 — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-021 | Ciclo digital completo de materiais e serviços — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-022 | Cadastro completo das informações do processo — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-023 | Solicitações de compras e serviços por unidades autorizadas — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-024 | Planejamento de compras futuras — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-025 | Dotação contábil vinculada a cada item da solicitação — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-026 | Comissões, pregoeiros e leiloeiros — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-027 | Integração Estoque, Compras, Licitações e Contratos sem redundância — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-028 | Registro do processo licitatório e requisições de origem — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-029 | Cadastro de pessoas no contexto de compras — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-030 | Agrupamento de solicitações para formalizar a licitação — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-031 | Vínculo contábil por item — repetição do item 25 — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-032 | Acompanhamento das etapas e emissão dos documentos do processo — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-033 | Reordenação das fases do processo — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-034 | Numeração por modalidade — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-035 | Relatório de vencedores de preços — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-036 | Menores preços no comparativo — repetição do item 12 — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-037 | Situações do processo licitatório — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-038 | Arquivos de prestação de contas de licitações e contratos ao Tribunal — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-039 | Registro de lances pelo fornecedor no celular — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-040 | Integração PNCP no contexto de compras/licitações — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-041 | Gerenciamento e acompanhamento da disputa e lances — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-042 | Registro sintético dos participantes do pregão — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-043 | Tela dos licitantes com lote, status, participantes e valor — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-044 | Alteração do status de item/lote pelo pregoeiro — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-045 | Habilitação e inabilitação pelo pregoeiro/equipe de apoio — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-046 | Lances pelo celular — repetição do item 39 — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-047 | Atualização para arrematado ao encerrar a negociação — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-048 | Integração PNCP no contexto do procedimento e resultado — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-049 | Registro de contratos e convênios com vigência calculada — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-050 | Aditivos, suspensões e rescisões com motivo e data — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-051 | Responsáveis, representantes, signatários e grupos do convênio — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-052 | Exportação automática dos contratos ao SIAFIC — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-053 | Relatório de razão de contratos e convênios — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-054 | Medições e etapas de execução de contratos e convênios — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-055 | Parcelas de contratos e convênios — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-056 | Geração automática da solicitação/autorização de empenho — AE — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-057 | Empenho da despesa por integração contábil — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-058 | Geração e autorização automática do fornecimento — AF — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-059 | Registro automático do ateste e autorização de liquidação — AL — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-060 | Liquidação da despesa por integração contábil — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-061 | Anulação de AE já reconhecida como despesa — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-062 | Anulação do fornecimento autorizado — AF — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-063 | Anulação do ateste/autorização de liquidação — AL — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-064 | Complementação de AE já reconhecida como despesa — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-065 | Relatório de autorização de empenho — AE — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-066 | Relatório de autorização de fornecimento — AF — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-067 | Relatório de anulação de AE — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-068 | Relatório de anulação de AF — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-069 | Relatório de anulação de AL — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-070 | Relatório de razão de AF — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-071 | Relatório de razão de AL — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-072 | Contratos e convênios com campos completos — repetição do item 49 — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-073 | Aditivos, suspensões e rescisões — repetição do item 50 — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-074 | Responsáveis, representantes, signatários e grupos do contrato — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-075 | Exportação de contratos ao SIAFIC — repetição do item 52 — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-076 | Relatório de razão de contratos — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-077 | Medições e etapas dos contratos — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-078 | Parcelas de contratos e convênios — repetição do item 55 — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |
| CLC-079 | Integração PNCP no contexto contratual — orientação individual presente. | A_VERIFICAR | A mapear | Não executado | A confirmar conforme o item. |

### 9.4 Condição para encerrar

Marcar um item como validado apenas depois de sua operação existir, persistir, respeitar autorização, gerar o resultado/documento exigido e possuir evidência reproduzível. Uma parte ausente deixa um item composto parcial. E-mails, lances, empenho, liquidação, remessas e integrações devem ser distinguidos de templates, dados preparados, testes unitários com mock e filas ainda pendentes.

Não encerrar com “79 títulos no menu”, “79 citações no MD” ou “todas as telas prontas”. CLC-021 depende da cadeia completa; CLC-032 de todos os tópicos; CLC-038 de arquivo compatível; CLC-039/046 de envio real pelo fornecedor; CLC-057/060 de atos contábeis reais; CLC-040/048/079 de capacidade integrada comprovada no escopo definido. Regras de interpretação/configuração devem ser registradas, nunca transformadas em aprovação presumida.

Entregar: caminhos efetivamente alterados, migrations próprias, comandos de execução/teste verificados, acesso às telas, matriz por ID, capturas reais com viewport/zoom, documentos gerados e dependências abertas. Não expor segredos/credenciais. Não escrever que uma suíte passou sem executá-la. Teste de interface complementa, mas não substitui, a conferência de persistência/integração.

<a id="definicoes"></a>
## 10. Definições pendentes — registrar e avançar sem inventar regras

### Q-01 — SIAFIC/Contabilidade, Estoque e ciclo AE/AF/AL

**Afeta:** 8, 21, 25, 27, 31, 52, 56–64, 75 e referências contábeis dos relatórios.

Identificar origem/destino real, dados mínimos, dotações, gatilhos autorizados, retorno de empenho/liquidação, cancelamentos, complemento e tratamento de eventos posteriores. Distinguir data/estado de autorização, recebimento, ateste e lançamento. A integração de AF/entrada deve ser compatível com a implementação efetiva de Almoxarifado, sem editar o módulo de origem neste pacote.

Especificar a semântica de “reconhecidas como despesa” na AE e os efeitos de anulação/complemento no núcleo existente; o plano não impõe contabilidade nova. Sem serviço necessário, desenvolver a parte própria e registrar dependência exata. Retorno mockado ou número de empenho digitado não é atendimento integrado.

### Q-02 — Leiaute do Tribunal de Contas

**Afeta:** 38. Obter especificação oficial aplicável, versão/competência, quais arquivos/atos de licitações e contratos são exigidos, campos/códigos, esquemas e validações. O PDF deste recorte não os fornece. O estado identificado no documento é Espírito Santo; o plano não adivinha o sistema de remessa nem seu formato.

Usar exportador existente se aplicável; não criar documento fictício rotulado como oficial. O item pede geração, não novo serviço automático de transmissão. Desenvolver mapeamento somente após identificar a especificação e registrar testes/limitações.

### Q-03 — Integração PNCP

**Afeta:** 40, 48 e 79. Identificar contrato técnico, versão aplicável, operações por contexto, credenciais, autorização, ambiente de homologação e significado dos retornos. Não houve pesquisa externa de API/versionamento neste MD. A denominação escrita no requisito foi preservada; sigla/nome não constituem especificação técnica.

Evitar inventar três integrações independentes ou publicar três vezes o mesmo ato. Demonstrar a cobertura de compras/licitações e contratos conforme a definição, com correlação e retornos verdadeiros. Não confundir com plataforma de lances nem com link de consulta. Sem acesso/definição, registrar `BLOQUEADO_EXTERNO` ou `AGUARDA_DEFINICAO` no ID afetado.

### Q-04 — Modalidades, fases, julgamento, sigilo e negociação

**Afeta:** 1/20 quando refletirem benefícios além da identificação; 21–22, 26, 28, 32–35, 37, 39, 41–47.

O recorte não fornece os modos de disputa, regras de lance, tempos, intervalos, desempate, percentuais de benefícios, critérios de julgamento completos ou política de identificação dos licitantes por fase. Não importar regras do certame que a Robonuvem disputa para o software que a prefeitura vai usar. Não deduzir poderes de usuário pela simples existência de seu nome numa comissão.

Usar configuração efetivamente existente/fornecida, validar o rito de operação aplicável antes do uso real e conservar seus critérios na evidência. O ensaio simples de menor preço não prova automaticamente todos os regimes possíveis. A tela deve continuar exibindo número/status do lote, licitantes e valor, com identificação permitida pela política adotada. Registrar se nomes ou códigos são apresentados e em qual fase, sem resolver a questão por exposição indevida.

### Q-05 — Instrumentos, razão, vigência e critérios de preço

**Afeta:** 10–12, 35–36, 49–55, 65–78.

Confirmar metodologia da referência de preços, nível do menor preço/vencedor, estrutura dos instrumentos/contrapartes em convênios, prazo versus vigência, convenção de contagem, efeitos dos eventos, composição de medição/parcela e colunas dos relatórios razão. Não inventar limites legais de aditivo, indexador de reajuste, pagamento ou apropriação contábil.

As fixtures demonstram parametrização e coerência numérica, não validade jurídica de preços/prazos/atos. Campo de fornecedor do requisito não é silenciosamente descartado em convênio; registrar a correspondência aceita para o tipo de instrumento.

### Q-06 — Fontes cadastrais, links, convite e prazo do portal

**Afeta:** 2–7, 9, 13–19 e 29.

Confirmar códigos/descrições CNAE usados, URLs corretas das cinco consultas, jurisdição, mapeamento de ativo/vigente/bloqueado, contato do solicitante e fornecedor, remetente e serviço de e-mail. O item 13 foi interpretado como envio ao fornecedor por contexto; registrar essa leitura, preservando a citação.

Configurar janela/fuso e seu limite de encerramento; definir acesso posterior a comprovante sem reabrir a pesquisa. Definir quando a resposta é apresentada e como versões permitidas são preservadas. Não inventar gratuidade/regularidade nem confundir um link aberto com consulta fiscal realizada. Não criar campanha de mensagens, credenciais paralelas ou certificado profissional não solicitado.

<a id="fontes"></a>
## 11. Auditoria documental e fontes

### 11.1 Cobertura do plano

| Bloco original | Itens | Quantidade |
|---|---|---:|
| Cadastro de Fornecedores: | 1–9 | 9 |
| COMPRAS E LICITAÇÕES: | 10–48 | 39 |
| Convênios; | 49–55 | 7 |
| Fornecimento | 56–71 | 16 |
| Contratos: | 72–79 | 8 |
| **Total** | **1–79** | **79** |

A conferência de composição verifica 79 IDs em sequência, 79 citações comparadas com o PDF, e 79 blocos de implementação, demonstração, aceite, dependências e limites. A comparação textual normaliza somente espaços/quebras. As páginas foram inspecionadas para separar o fim de Frotas e o início de Processos Eletrônicos, e para manter as alíneas de CLC-032 no mesmo requisito.

**Auditoria documental, não do software.** Nenhuma linha da matriz foi marcada implementada/testada por esta produção. Os cenários numéricos são referências de ensaio verificadas em cálculo, não valores a fixar na interface. Os testes do módulo devem reproduzi-los pelas operações.

### 11.2 Reuso sem perda de requisitos

| Relação | Como compartilhar sem omitir |
|---|---|
| 1/20, 2/9, 12/36, 25/31, 39/46 | Mesma capacidade com evidência por ID; não outro cadastro, relatório ou cliente mobile. |
| 40/48/79 | Um conector PNCP com contextos aplicáveis; não três publicações idênticas nem presunção de cobertura contratual por mostrar apenas a compra. |
| 49/72, 50/73, 52/75, 55/78 | Instrumentos, eventos, SIAFIC e parcelas canônicos nos diferentes contextos. |
| 51/74 | Mesma estrutura de pessoas/papéis/grupos, mas comprovar convênio e contrato. |
| 53/76 e 54/77 | Razão/execução compartilhados; o escopo que inclui convênios não pode desaparecer. |
| 11/30 | Agrupamento compartilhado, com finalidade de pesquisa versus procedimento e saldos/origens preservados. |
| 56/57, 59/60 | Capacidades relacionadas, **não equivalentes**: autorização/ateste não substituem empenho/liquidação efetivos. |
| 61–63 / 67–69 | Anular é operação; emitir relatório da anulação é documento da operação real. Nenhuma parte substitui a outra. |

### 11.3 Fontes e prevalência

- **TR-CLC:** `termo de referencia (Ratificado)(1).pdf`, 335 páginas, Processo Administrativo nº 1026/2026, seção 19, **COMPRAS, LICITAÇÕES E CONTRATOS**, pp. 48–54, itens 1–79. Fonte exclusiva das transcrições específicas, inclusive as denominações e siglas da redação original.
- **TR-G:** mesmo arquivo, pp. 28–33 e 40–44, referências selecionadas na seção 1.3. Não é transcrição/auditoria completa dos requisitos gerais.
- **UX-BASE:** `CeleriFlow_POC_Almoxarifado_Patrimonio_Desenvolvimento_REV02.md`, padrão de interface já escolhido pelo usuário. As dimensões aqui são decisões de projeto, não nova pesquisa de normas ou bibliotecas.
- **CANAL/DEPENDÊNCIAS:** orientações do usuário nesta conversa, consolidadas nos planos REV02 de Meio Ambiente e REV01 de Frotas: mesmo site no Chrome do celular, fonte de dados de outros módulos destacada e sem reconstrução dessas origens.

**Prevalência:** requisitos vêm do TR ratificado; exemplos/decisões deste MD são meios de implementá-los e testá-los. Não foi incorporada pesquisa externa de legislação, APIs, links, CNAE, leiautes ou regras de julgamento para preencher lacunas. Usar definições oficiais/operacionais identificadas antes de configurar produção, sem alegar que a fixture tem essa validade.

**Entrega final esperada:** um módulo de Compras, Licitações e Contratos integrado ao CeleriFlow, incluindo convênios e os 79 requisitos executáveis, com evidências reais, tela profissional, documentos derivados dos registros e pendências discriminadas. Não declarar aprovação da POC pela contagem de telas ou pelo cumprimento apenas das partes locais do plano.
