# CeleriFlow — Plano de desenvolvimento e demonstração da POC
## Assistência Virtual para Autoatendimento | Divino de São Lourenço/ES

**REV01 — 19/09/2026.**

**Fonte:** `termo de referencia (Ratificado)(1).pdf`, 335 páginas, Processo Administrativo nº 1026/2026, seção técnica **Assistência Virtual para Autoatendimento**, pp. **327–329**.

**Cobertura:** **43 entradas numeradas**, de **AVA-001** a **AVA-043**, preservando o número original e os subtítulos. 43 itens próprios. Reaproveita serviços de Tributário/Portais, mas acrescenta canal oficial, catálogo, sessões, automações, painel e atendimento. Não desenvolver outro emissor fiscal.

**Como usar:** fornecer este MD ao agente junto ao TR e ao repositório. A lista completa não dispensa executar os contratos operacionais e os testes por item. As partes menores no ZIP são cópias organizacionais do mesmo conteúdo, não novos requisitos.

**Navegação:** [Escopo e menu](#escopo) · [Pacotes operacionais](#pacotes) · [Fontes e integrações](#integracoes) · [Índice dos requisitos](#indice) · [Desenvolvimento item a item](#requisitos) · [Matriz de execução](#matriz) · [Pendências](#pendencias) · [Fontes e conferência](#fontes).


## Diretrizes comuns de execução

**Destinatário:** Codex/Antigravity com acesso ao repositório real. Este é um plano de desenvolvimento e teste, não uma declaração de funcionalidades prontas. Não foram inspecionados o código, os ambientes municipais, dispositivos, credenciais ou serviços externos.

Ler `AGENTS.md` quando existir, manifests, migrations, convenções de módulos e testes. Mapear o que já funciona antes de criar tabelas, rotas ou serviços. Preservar o CeleriFlow, sua identidade, sessões e dados; não mudar framework/ORM/provedor, recriar o ERP, apagar migrations ou reinicializar banco para a POC. Novas estruturas são incrementais. Não manter uma versão “POC” com dados fixos ao lado da função real.

**TR** é a transcrição da fonte. Os IDs, títulos curtos, divisão em pacotes, campos técnicos, transições, demonstrações e dados de ensaio são decisões deste plano, não roteiro oficial da comissão. Preservar todo campo, ação, formato, perfil e condição da citação; exemplos não criam documentos obrigatórios adicionais. Repetições mantêm IDs diferentes, mas compartilham a implementação. Um título numerado não vira outra tela apenas para aumentar a contagem.

**Fronteiras:** dados provenientes de outro módulo ficam destacados. Consumir a origem por serviço/visão autorizada; não escrever diretamente em suas tabelas, duplicar cadastros oficiais ou reconstruir esse módulo. Uma capacidade que é objeto do presente bloco deve ser implementada aqui ou reaproveitada de um serviço existente, e não omitida chamando-a genericamente de “dependência”. Quando faltar uma origem, implementar o lado consumidor, descrever o contrato e manter o ID dependente explicitamente pendente.

**Operação real:** validar no servidor; relacionar órgãos/unidades, perfis e objetos da sessão; preservar histórico; impedir efeito duplicado em reenvio técnico; usar transação nas operações correlatas. Mostrar êxito somente depois da confirmação. Falta de dados, dado zero, erro de integração e consulta sem resultados são estados distintos. Revalidar versões ao confirmar após edição concorrente. Um teste com mock não confirma operação na origem.

**Segurança de demonstração:** ambiente isolado, pessoas e documentos fictícios identificados como DEMO. Nunca transmitir dados reais, movimentar dinheiro, prescrever para pacientes, registrar obrigações oficiais ou enviar mensagens a contatos reais sem autorização específica. Credenciais não entram no código, no MD, na URL pública nem nos arquivos de teste. Prévia/PDF/exportação aplicam as mesmas permissões das telas.

### Interface profissional [UX — orientação do usuário]

Reaproveitar componentes e fontes do ERP. Administrar por listagens paginadas com título/contexto → filtros → tabela → paginação/ações. Referências: título **20/26 px**, seção **16/22 px**, texto operacional **14/20 px**, metadado secundário **12/16 px**; pesos regulares e 600 para títulos/cabeçalhos. São decisões de projeto, não medidas do TR. Preferir a família já usada; na ausência de padrão, fonte de sistema com Segoe UI e alternativas sans-serif. Não distribuir fontes nem trocar a biblioteca visual.

Controles/linhas com altura mínima de referência 36 px no desktop, 44 px no toque, campos de 16 px no celular; espaçamento 4/8/12/16/24 px. Números à direita, unidades identificadas. Não encolher o corpo a 10–11 px para caber. Estado precisa de rótulo, não somente cor. Teclado, foco e mensagens de erro devem funcionar; erro em outra aba aponta para ela.

**Paginação real no servidor:** partir de até 10 linhas por página, reduzindo se necessário à área útil. A busca consulta todos os registros autorizados; usar ordenação estável. Preservar filtros/página ao abrir ficha e voltar. Exportação, relatório e processamento em lote abrangem o recorte/seleção explicitados, não só as linhas visíveis. Total geral não é subtotal de página.

Priorizar listagens sem rolagem global nos viewports CSS 1366×650, 1440×800 e 1920×900. **Não usar corte/`overflow:hidden` para esconder dados.** Editor, prontuário, árvore, calendário, mapa, gráfico extenso, documento e dispositivos pequenos têm exceção controlada. Preferir uma região de leitura, não três barras aninhadas. Se a fonte pedir determinado conjunto no próprio grid, reorganizar sem retirar campos exigidos. Testar zoom/texto ampliado a 200%, teclado e área útil da apresentação.

Mobile: mesmo site no Chrome do celular, sem aplicativo nativo/híbrido ou PWA obrigatória, conforme decisão do usuário. **Onde o TR exigir expressamente tecnologia nativa/offline, a decisão de canal não resolve o requisito:** registrar a incompatibilidade, preservar o texto e não anunciar equivalência. Jogos, editores e telas de atendimento devem ser adaptados ao uso, não reduzidos a tabelas por padronização excessiva.

### Contrato de fontes e comprovação

Usar IDs de origem estáveis, versão/competência, instante e resultado do consumo. Mesma nota, movimento ou atendimento referenciado por módulos diferentes não pode ser contado novamente como outro fato. Em falha externa, conservar operação pendente e poder reprocessar sem duplicar.

Quatro níveis independentes: **VALIDADO_LOCAL**, **TESTADO_COM_SIMULADOR**, **INTEGRACAO_TESTADA_HOMOLOGACAO** e **PRODUCAO_AUTORIZADA**. O último não é necessário para todos os testes e não deve ser provocado sem autorização. Geração/validação de arquivo, aceite técnico de transporte e processamento pela contraparte são coisas diferentes. Simulador deve estar rotulado e fora do menu de negócio; a comissão não foi consultada sobre aceitá-lo na POC.

O agente deve entregar os arquivos alterados, migrations incrementais, comandos realmente executados, testes aprovados/reprovados, acesso às telas e evidências por ID. **Não encerrar por contagem de menus ou por todos os cabeçalhos existirem.**

<a id="escopo"></a>
## Escopo e organização da navegação

Reutilizar ou criar **uma entrada identificável “Assistência Virtual”** no catálogo/menu do CeleriFlow. As áreas abaixo são subáreas internas; não criar outra identidade, banco de cadastros ou aplicativo independente para cada grupo. Nomes de rotas/tabelas não foram presumidos.

| Área interna proposta | Regra |
|---|---|
| Atendimentos | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Webchat e WhatsApp | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Catálogo de serviços | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Menus e fluxos | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Mensagens, avisos e respostas rápidas | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Usuários, vínculos e termos | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Instâncias, integrações e configuração | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |

Antes de desenvolver, registrar `fonte existente`, `capacidade própria a implementar` e `dependência externa`. Não executar uma segunda vez operação que já pertence ao módulo de origem. Card/menu não significa requisito atendido.

<a id="pacotes"></a>
## Pacotes operacionais e cenários conectados

Os grupos seguintes são organização de desenvolvimento; não substituem a divisão original do TR. Usar cada contrato como fundamento dos testes individuais. Os cenários são independentes salvo vínculo expresso: não misturar cargas auxiliares de paginação com os totais financeiros principais.

<a id="pacote-a01"></a>
### A01 — Canais oficiais e serviços automatizados

**Cobertura:** AVA-001 a AVA-043 — 43 entradas.

Um número institucional e uma instância WhatsApp, mais um webchat, usam a mesma camada de serviços/catálogos/sessões. O conector WhatsApp deve consumir a plataforma oficial e registrar configuração, conta comercial, ambiente, mensagens/modelos e estados de entrega; não usar automação de WhatsApp Web ou biblioteca não oficial para simular API exigida. A contratação precisa apoiar o credenciamento da entidade, sem prometer aprovação por terceiros.

Menus e fluxos configuráveis conduzem ao serviço autorizado. Canal recebido → validação do evento → sessão/perfil → comando de serviço → resultado → resposta; persistir ID do evento e da operação para retentativa sem duplicar emissão. Enviado, entregue, lido e falhou não são o mesmo estado. Resposta ambígua exige consulta/reconciliação, não repetir infinitamente. Webchat tem autenticação e tokens próprios e não depende de o usuário instalar aplicativo do CeleriFlow.

Serviço público não exige cadastro indevido; serviço pessoal exige autenticação e vínculo verificado. Número de telefone encontrado no cadastro não prova quem está operando; confirmar o vínculo antes de liberar CPF/CNPJ/documentos. Papéis Público/Cidadão/Servidor/Empreendedor são contextualizados, sem conceder acesso de gestor por identificação como Servidor. Chat interno nunca é enviado ao cidadão. Termos e aceites têm versão, data e finalidade; o aceite solicitado pelo TR não é uma declaração geral de conformidade LGPD.

Parâmetros na URL podem ser identificadores não sensíveis; segredos/token e dados pessoais ficam no mecanismo seguro de autenticação. Rejeitar destinos arbitrários/SSRF. Expiração de sessão e mensagens de aviso utilizam relógio de servidor e ambiente de teste separado.

**Base e demonstração conectada:** A-CANAL: três atendimentos, dois no webchat e um no WhatsApp em número de teste autorizado. Testar um serviço público e um restrito em cada canal; sem vínculo validado, o restrito é negado. Repetir o mesmo evento de solicitação não duplica o documento emitido na origem. Acrescentar nota interna que não pode aparecer ao cidadão. Configurar comando de encerramento #, timeout DEMO de cinco minutos, aviso com validade e mensagem final. Após encerrar um atendimento, o painel mostra dois abertos. Avaliação fica vinculada à sessão correta.

**Origens de dados:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Limites e decisões:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

<a id="integracoes"></a>
## Fontes, contratos e integrações

A tabela distingue integração exigida, arquivo de intercâmbio, serviço compartilhado e definição externa. As origens são previstas, não endpoints cuja existência foi confirmada. **Os simuladores são ferramentas internas de teste; não substituem a contraparte nem a autorização de demonstração pela comissão.**

| Ref. | Origem/capacidade | Itens/contexto | Entrega | Teste controlado | Dependência para comprovar |
|---|---|---|---|---|---|
| AV-EXT01 | Meta / WhatsApp Business API | AVA-002–005/007/013–014/024/035 | Canal oficial, conta comercial, número, modelos e retorno. | Simulador rotulado para retentativas; número oficial de teste para intercâmbio real. | Credenciamento, contrato atual e aprovação necessários. Webchat não substitui WhatsApp. |
| AV-DEP01 | Identidade/Pessoas e serviços municipais | AVA-010–012/022/027/034/036–043 | Catálogo, contexto, token e chamadas aos emissores/origens. | Solicitação de documento DEMO, acesso negado e reenvio idempotente. | Emissão na origem e vínculo verificado. Telefone encontrado não basta. |
| AV-DEP02 | Nuvem, arquivos, e-mails e webchat | AVA-001/006/009/023–024/031 | Persistência, backups, mídias e segundo canal. | Três atendimentos, restauração, mídias e isolamento de notas internas. | Serviços reais e definição da lista de e-mails; não inventar disponibilidade. |

Registrar para cada conector: versão do contrato/leiaute, direção, operação, campos, IDs de origem, autenticação, ambiente, resultado de validação e evidência. Quando a citação permitir carga manual **ou** importação, não tornar ambas obrigatórias sem motivo. Quando exigir envio automático, um upload manual de teste não encerra essa parte.

<a id="indice"></a>
## Índice individual na ordem da fonte

| ID | Nº original | Subseção original | Página | Ação resumida |
|---|---:|---|---:|---|
| [AVA-001](#ava-001) | 1 | Assistência Virtual para Autoatendimento | 327 | O sistema deve ser totalmente web e em “nuvem” com acesso seguro HTTPS e com certificado SSL válido |
| [AVA-002](#ava-002) | 2 | Assistência Virtual para Autoatendimento | 327 | O sistema deve possuir um único número de telefone (fixo ou celular), informado pelo Contratante para centralizar os canais de… |
| [AVA-003](#ava-003) | 3 | Assistência Virtual para Autoatendimento | 327 | Ativação de uma instância para conexão com o WhatsApp Business API |
| [AVA-004](#ava-004) | 4 | Assistência Virtual para Autoatendimento | 327 | O recebimento e resposta de mensagens através da plataforma oficial de mensageira do Whatsapp dos tipos de conversas de serviço,… |
| [AVA-005](#ava-005) | 5 | Assistência Virtual para Autoatendimento | 327 | O WhatsApp Business API depende da aprovação do Meta. Caberá à CONTRATADA dar auxílio à CONTRATANTE em todas as etapas necessárias para… |
| [AVA-006](#ava-006) | 6 | Assistência Virtual para Autoatendimento | 327 | Ser totalmente on-line e multiusuário, de modo que várias pessoas possam fazer gestão da lista de e-mails remotamente de qualquer… |
| [AVA-007](#ava-007) | 7 | Assistência Virtual para Autoatendimento | 327 | O sistema deve garantir atendimento das normas brasileiras e das normas do serviço WhatsApp |
| [AVA-008](#ava-008) | 8 | Assistência Virtual para Autoatendimento | 327 | O sistema deve disponibilizar mecanismo de segurança das informações e proteger o sistema de acesso a terceiros não autorizados |
| [AVA-009](#ava-009) | 9 | Assistência Virtual para Autoatendimento | 327 | O sistema deve armazenar em nuvem os dados de atendimentos, com segurança e garantia de sigilo e integridade dos dados (Backup) |
| [AVA-010](#ava-010) | 10 | Assistência Virtual para Autoatendimento | 327 | A solução deverá permitir a integração com sistemas “legados” ou de “backend” por meio de APIs (Application Program Interface –… |
| [AVA-011](#ava-011) | 11 | Assistência Virtual para Autoatendimento | 327 | Integrações por meio de requisições HTTP ou HTTPS com passagem de parâmetros diretamente na barra de endereços do navegador web |
| [AVA-012](#ava-012) | 12 | Assistência Virtual para Autoatendimento | 327 | Toda integração entre sistema deve ser controlado por requisição de autenticação por meio de token de acesso |
| [AVA-013](#ava-013) | 13 | Assistência Virtual para Autoatendimento | 327 | O cadastramento do número de telefone de atendimento na plataforma WhatsApp deve ser uma conta comercial |
| [AVA-014](#ava-014) | 14 | Assistência Virtual para Autoatendimento | 328 | A CONTRATADA será responsável pela personalização linha de telefônica para o número (00) 0000-0000 que será o número utilizado no WhatsApp |
| [AVA-015](#ava-015) | 15 | Assistência Virtual para Autoatendimento | 328 | A criação de menus por departamentos/setores ou serviços conforme necessidade do órgão |
| [AVA-016](#ava-016) | 16 | Assistência Virtual para Autoatendimento | 328 | O envio de respostas rápidas ao contribuinte em atendimento |
| [AVA-017](#ava-017) | 17 | Assistência Virtual para Autoatendimento | 328 | Possui um Chat interno ou local para envio de mensagens e/ou informações privadas sobre os atendimentos |
| [AVA-018](#ava-018) | 18 | Assistência Virtual para Autoatendimento | 328 | Possui um painel para administração, controle e monitoramento dos atendimentos |
| [AVA-019](#ava-019) | 19 | Assistência Virtual para Autoatendimento | 328 | Ao contribuinte fazer a Avaliação de Atendimento |
| [AVA-020](#ava-020) | 20 | Assistência Virtual para Autoatendimento | 328 | Encerramento de chamado por parte do contribuinte, digitando uma tecla/símbolo a ser escolhido e parametrizado pelo administrador, com a… |
| [AVA-021](#ava-021) | 21 | Assistência Virtual para Autoatendimento | 328 | As conversas e mensagens trocadas através da plataforma são da Prefeitura, confidenciais e não serão acessadas por terceiro |
| [AVA-022](#ava-022) | 22 | Assistência Virtual para Autoatendimento | 328 | Integração via API com o sistema de gestão para emissão de Documentos via envio de mensagens |
| [AVA-023](#ava-023) | 23 | Assistência Virtual para Autoatendimento | 328 | Capacidade de gerenciar e responder automaticamente a interações em canais como site ou WhatsApp |
| [AVA-024](#ava-024) | 24 | Assistência Virtual para Autoatendimento | 328 | Incluso na solução o suporte a conexões simultâneas de envio e recebimento de mensagens de uma instância para Whatsapp e uma para webchat |
| [AVA-025](#ava-025) | 25 | Assistência Virtual para Autoatendimento | 328 | A criação de fluxos de atendimentos com menus de opções totalmente automatizados chatbots |
| [AVA-026](#ava-026) | 26 | Assistência Virtual para Autoatendimento | 328 | O chatbot deve ser capaz de iniciar serviços, guiar o usuário pelo catálogo de serviços (menu) e coletar feedback |
| [AVA-027](#ava-027) | 27 | Assistência Virtual para Autoatendimento | 328 | Os fluxos de atendimentos de serviços (menu) no chatbot devem ser integrados por meio de API para realização automática do atendimento… |
| [AVA-028](#ava-028) | 28 | Assistência Virtual para Autoatendimento | 328 | Timeout, configurar tempo de inatividade, para desconectar e retornar mensagem personalizada informando da desconexão |
| [AVA-029](#ava-029) | 29 | Assistência Virtual para Autoatendimento | 328 | As opções de serviços disponíveis nos menus de atendimento deverão ser cadastradas no sistema com possibilidade de criação de níveis de… |
| [AVA-030](#ava-030) | 30 | Assistência Virtual para Autoatendimento | 329 | Configurar sequência de chatbot para autoatendimento dos cidadãos com funcionamento ininterrupto |
| [AVA-031](#ava-031) | 31 | Assistência Virtual para Autoatendimento | 329 | Permissão para configurar os menus de opção, com inserção de anexos nos formatos de imagens, documentos, áudios, contatos ou localização |
| [AVA-032](#ava-032) | 32 | Assistência Virtual para Autoatendimento | 329 | Permissão para cadastramento de avisos de utilidade pública a serem publicados após mensagem inicial de boas-vindas, com prazo de… |
| [AVA-033](#ava-033) | 33 | Assistência Virtual para Autoatendimento | 329 | Permissão para configuração de mensagens personalizadas para envio ao final de uma sessão de atendimento |
| [AVA-034](#ava-034) | 34 | Assistência Virtual para Autoatendimento | 329 | A identificação automática do perfil de solicitante dos serviços online (Público, Cidadão, Servidor ou Empreendedor) |
| [AVA-035](#ava-035) | 35 | Assistência Virtual para Autoatendimento | 329 | O cadastro de instâncias para conectar o número ao Whatsapp |
| [AVA-036](#ava-036) | 36 | Assistência Virtual para Autoatendimento | 329 | O cadastro dos serviços que serão disponibilizados nos menus do chatbot automaticamente, formando um catalogo de serviços |
| [AVA-037](#ava-037) | 37 | Assistência Virtual para Autoatendimento | 329 | Os serviços cadastrados deve permitir consultar automaticamente a respectiva API de integração |
| [AVA-038](#ava-038) | 38 | Assistência Virtual para Autoatendimento | 329 | Controlar a exibição dos serviços conforme a visibilidade para restringir acesso a serviços restritos com necessidade de autenticação ou… |
| [AVA-039](#ava-039) | 39 | Assistência Virtual para Autoatendimento | 329 | A exibição dos serviços no menu do chatbot conforme o perfil identificado automaticamente do solicitante |
| [AVA-040](#ava-040) | 40 | Assistência Virtual para Autoatendimento | 329 | Identificar se o numero de celular do solicitante do serviço é vinculado a algum CPF ou CNPJ no cadastro de pessoas |
| [AVA-041](#ava-041) | 41 | Assistência Virtual para Autoatendimento | 329 | Um cadastro de usuários de serviços |
| [AVA-042](#ava-042) | 42 | Assistência Virtual para Autoatendimento | 329 | Validar o cadastro de usuário para vincular o CPF ao numero de celular |
| [AVA-043](#ava-043) | 43 | Assistência Virtual para Autoatendimento | 329 | Exigir aceite dos termos da LGPD sempre no 1º acesso ao serviço, validações de cadastros e mudanças nos termos |

<a id="requisitos"></a>
## Desenvolvimento item a item

Cada bloco abaixo é obrigatório na rastreabilidade. A implementação segue o contrato operacional do pacote e os testes específicos; nenhum resumo substitui os campos e condições do TR.

<a id="ava-001"></a>
### AVA-001 — O sistema deve ser totalmente web e em “nuvem” com acesso seguro HTTPS e com certificado SSL válido

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 1, p. 327:**

> O sistema deve ser totalmente web e em “nuvem” com acesso seguro HTTPS e com certificado SSL válido.

**Implementação:** Implantar o módulo na aplicação web em nuvem, usando HTTPS e certificado válido; não disponibilizar uma cópia local como ambiente final.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Abrir a URL de homologação, conferir o certificado e executar um atendimento por outra estação.

**Aceite técnico:** A aplicação funciona no ambiente indicado; a configuração de produção não depende da estação do atendente.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-002"></a>
### AVA-002 — O sistema deve possuir um único número de telefone (fixo ou celular), informado pelo Contratante para centralizar os canais de…

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 2, p. 327:**

> O sistema deve possuir um único número de telefone (fixo ou celular), informado pelo Contratante para centralizar os canais de atendimento via WhatsApp.

**Implementação:** Parametrizar o número único fornecido pela contratante e associá-lo à instância oficial de atendimento.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Conferir o número de teste e abrir dois atendimentos por esse mesmo canal.

**Aceite técnico:** O número exibido corresponde ao canal configurado. Não publicar um número fictício como oficial.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-003"></a>
### AVA-003 — Ativação de uma instância para conexão com o WhatsApp Business API

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 3, p. 327:**

> Ativação de uma instância para conexão com o WhatsApp Business API.

**Implementação:** Configurar o adaptador da API oficial WhatsApp Business com credenciais no servidor, ambiente e identificação da instância.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Receber um evento e enviar uma resposta em número de teste autorizado. Registrar também falha de credencial.

**Aceite técnico:** Conexão real é comprovada por intercâmbio com a plataforma; cadastro de instância ou simulador não bastam.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-004"></a>
### AVA-004 — O recebimento e resposta de mensagens através da plataforma oficial de mensageira do Whatsapp dos tipos de conversas de serviço,…

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 4, p. 327:**

> Permite o recebimento e resposta de mensagens através da plataforma oficial de mensageira do Whatsapp dos tipos de conversas de serviço, utilidade e autenticação. Consumo de API´s Oficiais Whatsapp.

**Implementação:** Implementar recebimento e resposta no canal oficial, com identificação do tipo de mensagem/modelo e política aplicável a serviço, utilidade e autenticação. Confirmar o contrato atual antes de codificar os parâmetros.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Exercitar os tipos citados com modelos/contatos de teste autorizados, além de rejeição e retorno repetido.

**Aceite técnico:** Guardar referências reais de envio e resultado. Não usar WhatsApp Web automatizado como substituto.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-005"></a>
### AVA-005 — O WhatsApp Business API depende da aprovação do Meta. Caberá à CONTRATADA dar auxílio à CONTRATANTE em todas as etapas necessárias para…

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 5, p. 327:**

> O WhatsApp Business API depende da aprovação do Meta. Caberá à CONTRATADA dar auxílio à CONTRATANTE em todas as etapas necessárias para criação, acompanhamento e aprovação do contato oficial (número confirmado) da CONTRATANTE na plataforma da Meta e aprovação dos modelos de mensagens.

**Implementação:** Entregar o apoio de implantação: conta, número, modelos, solicitações e acompanhamento das respostas da Meta. Registrar cada pendência e seu responsável.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Apresentar checklist do credenciamento com evidência de submissão e aprovação, quando efetivamente disponíveis.

**Aceite técnico:** Apoio prestado, solicitação enviada e aprovação obtida são situações distintas. Não prometer decisão de terceiro.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-006"></a>
### AVA-006 — Ser totalmente on-line e multiusuário, de modo que várias pessoas possam fazer gestão da lista de e-mails remotamente de qualquer…

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 6, p. 327:**

> Ser totalmente on-line e multiusuário, de modo que várias pessoas possam fazer gestão da lista de e-mails remotamente de qualquer computador;

**Implementação:** Preservar a referência literal à gestão multiusuário de lista de e-mails. Identificar a lista e o serviço compartilhado que a fornece; não substituir a frase por lista de conversas.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Duas contas autorizadas consultam e mantêm a lista de teste pela web, conforme a definição institucional.

**Aceite técnico:** A função corresponde à lista definida. Enquanto a referência permanecer indeterminada, registrar a ressalva A-Q 01.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-007"></a>
### AVA-007 — O sistema deve garantir atendimento das normas brasileiras e das normas do serviço WhatsApp

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 7, p. 327:**

> O sistema deve garantir atendimento das normas brasileiras e das normas do serviço WhatsApp.

**Implementação:** Identificar as políticas e condições vigentes do canal oficial e registrar a validação operacional da configuração antes da ativação real.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Conferir conta, número, permissões e modelos com a documentação atual do provedor.

**Aceite técnico:** Não apresentar selo de conformidade inventado nem presumir limites, preços ou aprovação normativa.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-008"></a>
### AVA-008 — O sistema deve disponibilizar mecanismo de segurança das informações e proteger o sistema de acesso a terceiros não autorizados

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 8, p. 327:**

> O sistema deve disponibilizar mecanismo de segurança das informações e proteger o sistema de acesso a terceiros não autorizados.

**Implementação:** Autorizar painel, conversas, arquivos e comandos no servidor por usuário e escopo. Verificar a origem dos eventos externos conforme o contrato do canal.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Tentar consultar conversa de outro setor e seu anexo pela URL/API direta.

**Aceite técnico:** Negar acesso indevido e registrar a tentativa sem copiar o conteúdo privado para o log geral.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-009"></a>
### AVA-009 — O sistema deve armazenar em nuvem os dados de atendimentos, com segurança e garantia de sigilo e integridade dos dados (Backup)

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 9, p. 327:**

> O sistema deve armazenar em nuvem os dados de atendimentos, com segurança e garantia de sigilo e integridade dos dados (Backup).

**Implementação:** Persistir atendimentos em nuvem com acesso restrito, backups e restauração do contexto e do histórico.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Restaurar três atendimentos DEMO em base isolada e conferir mensagens, autoria, datas e situações.

**Aceite técnico:** A restauração recupera os dados e não torna conversas ou arquivos públicos.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-010"></a>
### AVA-010 — A solução deverá permitir a integração com sistemas “legados” ou de “backend” por meio de APIs (Application Program Interface –…

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 10, p. 327:**

> A solução deverá permitir a integração com sistemas “legados” ou de “backend” por meio de APIs (Application Program Interface – Interface de Programa Aplicativo)

**Implementação:** Criar o lado consumidor das APIs de serviços legados/backend, com contrato, autenticação e origem identificados.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Solicitar um documento na origem de homologação e receber sua referência e bytes.

**Aceite técnico:** O resultado deriva da operação real no emissor. Um PDF fixo devolvido pelo chatbot não comprova integração.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-011"></a>
### AVA-011 — Integrações por meio de requisições HTTP ou HTTPS com passagem de parâmetros diretamente na barra de endereços do navegador web

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 11, p. 327:**

> Permitir integrações por meio de requisições HTTP ou HTTPS com passagem de parâmetros diretamente na barra de endereços do navegador web;

**Implementação:** Permitir chamadas HTTP/HTTPS e parâmetros de navegação ou serviço previstos no contrato. Manter segredos e dados sensíveis fora da URL; usar destinos permitidos e autenticação no servidor.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Enviar um identificador não sensível na URL autorizada e tentar um host ou parâmetro não permitido.

**Aceite técnico:** A chamada válida funciona. Destino arbitrário, credencial na URL ou acesso a rede privada indevido são recusados.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-012"></a>
### AVA-012 — Toda integração entre sistema deve ser controlado por requisição de autenticação por meio de token de acesso

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 12, p. 327:**

> Toda integração entre sistema deve ser controlado por requisição de autenticação por meio de token de acesso;

**Implementação:** Exigir token nas integrações entre sistemas, com verificação e tratamento de expiração antes de produzir efeitos.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Executar a mesma operação com token válido, ausente, inválido e expirado.

**Aceite técnico:** Somente a chamada válida produz resultado. As falhas não geram emissão, vínculo ou mensagem de sucesso.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-013"></a>
### AVA-013 — O cadastramento do número de telefone de atendimento na plataforma WhatsApp deve ser uma conta comercial

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 13, p. 327:**

> O cadastramento do número de telefone de atendimento na plataforma WhatsApp deve ser uma conta comercial.

**Implementação:** Relacionar o número à conta comercial configurada na plataforma oficial; guardar identificadores e evidências, não segredos, no cadastro administrativo.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Conferir a conta comercial que atende o número autorizado de homologação.

**Aceite técnico:** Não confundir número de conta pessoal com conta comercial habilitada.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-014"></a>
### AVA-014 — A CONTRATADA será responsável pela personalização linha de telefônica para o número (00) 0000-0000 que será o número utilizado no WhatsApp

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 14, p. 328:**

> A CONTRATADA será responsável pela personalização linha de telefônica para o número (00) 0000-0000 que será o número utilizado no WhatsApp.

**Implementação:** Tratar o número (00) 0000-0000 como marcador não preenchido do TR. Personalizar a linha/número efetivamente indicado pela contratante, depois da definição.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Parametrizar o contato de teste autorizado e conferir exibição, instância e recebimento.

**Aceite técnico:** Número não fornecido permanece pendente. Nenhum número fictício será publicado como contato oficial.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-015"></a>
### AVA-015 — A criação de menus por departamentos/setores ou serviços conforme necessidade do órgão

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 15, p. 328:**

> Permite a criação de menus por departamentos/setores ou serviços conforme necessidade do órgão

**Implementação:** Manter menus por departamento, setor ou serviço, com rótulo, ordem, destino e visibilidade vinculados ao catálogo.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Criar os grupos Informações e Tributos, com dois serviços em cada um, e navegar pelas opções.

**Aceite técnico:** Cada opção executa o destino configurado. Alterar um grupo não modifica o outro.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-016"></a>
### AVA-016 — O envio de respostas rápidas ao contribuinte em atendimento

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 16, p. 328:**

> Permite o envio de respostas rápidas ao contribuinte em atendimento;

**Implementação:** Manter respostas rápidas selecionáveis pelo atendente, vinculando o envio à conversa e ao autor da ação.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Selecionar uma resposta na conversa de teste e conferir seu recebimento.

**Aceite técnico:** O texto chega ao atendimento correto; somente preencher a caixa de digitação não comprova envio.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-017"></a>
### AVA-017 — Possui um Chat interno ou local para envio de mensagens e/ou informações privadas sobre os atendimentos

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 17, p. 328:**

> Possui um Chat interno ou local para envio de mensagens e/ou informações privadas sobre os atendimentos;

**Implementação:** Implementar chat/notas internas no contexto do atendimento, com visibilidade exclusiva dos participantes autorizados.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Registrar uma nota interna e consultar o histórico externo e seu payload.

**Aceite técnico:** A nota permanece no ambiente interno e não aparece para o cidadão.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-018"></a>
### AVA-018 — Possui um painel para administração, controle e monitoramento dos atendimentos

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 18, p. 328:**

> Possui um painel para administração, controle e monitoramento dos atendimentos.

**Implementação:** Disponibilizar painel com situação, setor, responsável e ações de tratamento dos atendimentos, atualizado a partir dos eventos.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Abrir três atendimentos e encerrar um. Recarregar a tela e consultar em outra sessão.

**Aceite técnico:** O painel apresenta dois abertos e um encerrado, sem indicadores estáticos.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-019"></a>
### AVA-019 — Ao contribuinte fazer a Avaliação de Atendimento

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 19, p. 328:**

> Permite ao contribuinte fazer a Avaliação de Atendimento;

**Implementação:** Coletar avaliação do cidadão no atendimento e manter o vínculo à sessão correta.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Responder à avaliação de uma sessão e reenviar tecnicamente a mesma resposta.

**Aceite técnico:** A avaliação permanece única para aquele evento, sem multiplicação por retentativa.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-020"></a>
### AVA-020 — Encerramento de chamado por parte do contribuinte, digitando uma tecla/símbolo a ser escolhido e parametrizado pelo administrador, com a…

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 20, p. 328:**

> Encerramento de chamado por parte do contribuinte, digitando uma tecla/símbolo a ser escolhido e parametrizado pelo administrador, com a informação disponível no "menu" do sistema.

**Implementação:** Configurar uma tecla ou símbolo de encerramento, apresentá-lo no menu e interpretar seu envio antes de executar novas ações de negócio.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Definir # como comando DEMO; o cidadão envia # e recebe a mensagem final.

**Aceite técnico:** Encerrar a sessão preservando as mensagens. Não emitir outro documento nem apagar o histórico.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-021"></a>
### AVA-021 — As conversas e mensagens trocadas através da plataforma são da Prefeitura, confidenciais e não serão acessadas por terceiro

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 21, p. 328:**

> As conversas e mensagens trocadas através da plataforma são da Prefeitura, confidenciais e não serão acessadas por terceiro.

**Implementação:** Restringir acesso às conversas e definir os papéis dos operadores e provedores. Registrar a interpretação da expressão “não serão acessadas por terceiro” frente ao processamento pelo canal oficial.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Testar acesso indevido e documentar os serviços autorizados que processam as mensagens.

**Aceite técnico:** Não afirmar inexistência absoluta de terceiros ao utilizar a Meta ou outro provedor autorizado. Manter a ressalva A-Q 03.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-022"></a>
### AVA-022 — Integração via API com o sistema de gestão para emissão de Documentos via envio de mensagens

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 22, p. 328:**

> Integração via API com o sistema de gestão para emissão de Documentos via envio de mensagens;

**Implementação:** Acionar a API do módulo emissor, vincular o documento ao solicitante autorizado e encaminhar o arquivo ou link protegido pelo canal.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Emitir um documento DEMO real e repetir o mesmo evento de entrada.

**Aceite técnico:** Manter uma emissão lógica, com versão e destinatário corretos. Não retornar documento estático.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-023"></a>
### AVA-023 — Capacidade de gerenciar e responder automaticamente a interações em canais como site ou WhatsApp

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 23, p. 328:**

> Capacidade de gerenciar e responder automaticamente a interações em canais como site ou WhatsApp;

**Implementação:** Executar os serviços automatizados no webchat e no WhatsApp, com o mesmo catálogo e políticas de acesso por canal.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Executar a mesma consulta pública nos dois canais.

**Aceite técnico:** Os dois resultados usam a mesma origem; não exigir um aplicativo separado do CeleriFlow. O efeito automático/atualização deve decorrer do evento configurado, sem redigitação manual para completar o teste.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-024"></a>
### AVA-024 — Incluso na solução o suporte a conexões simultâneas de envio e recebimento de mensagens de uma instância para Whatsapp e uma para webchat

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 24, p. 328:**

> Incluso na solução o suporte a conexões simultâneas de envio e recebimento de mensagens de uma instância para Whatsapp e uma para webchat;

**Implementação:** Suportar simultaneamente a instância WhatsApp e o webchat, isolando contexto, usuário e arquivos de cada sessão.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Enviar comandos concorrentes em três sessões, duas web e uma WhatsApp.

**Aceite técnico:** Não trocar respostas entre cidadãos nem bloquear um canal enquanto o outro trabalha.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-025"></a>
### AVA-025 — A criação de fluxos de atendimentos com menus de opções totalmente automatizados chatbots

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 25, p. 328:**

> O sistema deverá permitir a criação de fluxos de atendimentos com menus de opções totalmente automatizados chatbots.

**Implementação:** Permitir configurar estados, opções e transições do chatbot, validando referências e impedindo caminhos sem destino.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Criar um fluxo A → B → serviço; alterar uma opção pela interface e repetir a execução.

**Aceite técnico:** O fluxo opera conforme a configuração. Diagrama ou lista sem execução não atendem ao item.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-026"></a>
### AVA-026 — O chatbot deve ser capaz de iniciar serviços, guiar o usuário pelo catálogo de serviços (menu) e coletar feedback

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 26, p. 328:**

> O chatbot deve ser capaz de iniciar serviços, guiar o usuário pelo catálogo de serviços (menu) e coletar feedback.

**Implementação:** No atendimento, permitir iniciar um serviço, percorrer o catálogo e coletar feedback, preservando a identidade de cada operação.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Navegar, concluir uma consulta pública e avaliar o resultado.

**Aceite técnico:** Há registros de navegação, operação e avaliação; feedback não é confundido com serviço executado.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-027"></a>
### AVA-027 — Os fluxos de atendimentos de serviços (menu) no chatbot devem ser integrados por meio de API para realização automática do atendimento…

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 27, p. 328:**

> Os fluxos de atendimentos de serviços (menu) no chatbot devem ser integrados por meio de API para realização automática do atendimento as solicitações dos usuários;

**Implementação:** Cada opção automatizada chama a API correspondente e trata sucesso, erro ou pendência sem forjar retorno positivo.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Provocar erro de validação na origem, corrigir os dados e realizar nova tentativa autorizada.

**Aceite técnico:** A falha continua visível e a tentativa válida produz o resultado correto sem duplicação.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-028"></a>
### AVA-028 — Timeout, configurar tempo de inatividade, para desconectar e retornar mensagem personalizada informando da desconexão

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 28, p. 328:**

> Timeout, configurar tempo de inatividade, para desconectar e retornar mensagem personalizada informando da desconexão;

**Implementação:** Parametrizar inatividade no servidor, expirar a sessão e enviar mensagem de desconexão. A identidade expirada não pode executar serviço restrito.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Configurar cinco minutos DEMO, avançar o relógio do teste e interagir novamente.

**Aceite técnico:** A sessão está encerrada e o serviço restrito requer nova validação; não confiar no relógio do navegador.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-029"></a>
### AVA-029 — As opções de serviços disponíveis nos menus de atendimento deverão ser cadastradas no sistema com possibilidade de criação de níveis de…

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 29, p. 328:**

> As opções de serviços disponíveis nos menus de atendimento deverão ser cadastradas no sistema com possibilidade de criação de níveis de grupos e subgrupos;

**Implementação:** Cadastrar grupos e subgrupos em árvore, com ordem e referências persistidas. Impedir ciclos e nós sem destino válido.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Criar um pai, um filho e um serviço; tentar mover o pai para dentro do filho.

**Aceite técnico:** A navegação persiste e o ciclo é recusado sem corromper a árvore.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-030"></a>
### AVA-030 — Configurar sequência de chatbot para autoatendimento dos cidadãos com funcionamento ininterrupto

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 30, p. 329:**

> Permitir configurar sequência de chatbot para autoatendimento dos cidadãos com funcionamento ininterrupto.

**Implementação:** Executar as sequências de autoatendimento no serviço implantado, sem depender da estação do atendente; recuperar estados válidos após reinício.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Reiniciar o trabalhador em homologação durante uma conversa e retomar a sessão.

**Aceite técnico:** Preservar contexto e impedir repetição de operação confirmada. Registrar disponibilidade medida, não prometer capacidade infinita.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-031"></a>
### AVA-031 — Permissão para configurar os menus de opção, com inserção de anexos nos formatos de imagens, documentos, áudios, contatos ou localização

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 31, p. 329:**

> Permissão para configurar os menus de opção, com inserção de anexos nos formatos de imagens, documentos, áudios, contatos ou localização.

**Implementação:** Associar imagens, documentos, áudios, contatos e localização às opções, usando tipos e arquivos autorizados pelo canal.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Enviar um exemplar DEMO de cada tipo ao número/caixa de teste controlados.

**Aceite técnico:** Comprovar conteúdo e tipo recebidos. Registrar limitações reais sem converter silenciosamente tudo em texto.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-032"></a>
### AVA-032 — Permissão para cadastramento de avisos de utilidade pública a serem publicados após mensagem inicial de boas-vindas, com prazo de…

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 32, p. 329:**

> Permissão para cadastramento de avisos de utilidade pública a serem publicados após mensagem inicial de boas-vindas, com prazo de expiração da veiculação.

**Implementação:** Configurar aviso de utilidade pública com validade e exibi-lo após as boas-vindas apenas enquanto vigente.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Abrir sessão durante a validade e outra após o vencimento do aviso.

**Aceite técnico:** O aviso aparece somente no intervalo definido pelo servidor, sem alteração manual de código.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-033"></a>
### AVA-033 — Permissão para configuração de mensagens personalizadas para envio ao final de uma sessão de atendimento

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 33, p. 329:**

> Permissão para configuração de mensagens personalizadas para envio ao final de uma sessão de atendimento.

**Implementação:** Manter a mensagem de encerramento configurável e aplicá-la aos caminhos pertinentes, distinguindo encerramento voluntário e inatividade.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Encerrar uma sessão por # e outra por timeout.

**Aceite técnico:** As mensagens correspondem às configurações de cada caso e ficam registradas no histórico.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-034"></a>
### AVA-034 — A identificação automática do perfil de solicitante dos serviços online (Público, Cidadão, Servidor ou Empreendedor)

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 34, p. 329:**

> Permitir a identificação automática do perfil de solicitante dos serviços online (Público, Cidadão, Servidor ou Empreendedor).

**Implementação:** Resolver o perfil a partir da identidade e dos vínculos comprovados; tratar múltiplos papéis sem conceder acesso administrativo indevido.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Validar uma pessoa que também é servidor e acessar somente seus serviços pessoais autorizados.

**Aceite técnico:** Registrar o perfil utilizado. Autodeclaração ou telefone encontrado não conferem privilégios.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-035"></a>
### AVA-035 — O cadastro de instâncias para conectar o número ao Whatsapp

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 35, p. 329:**

> Permitir o cadastro de instâncias para conectar o número ao Whatsapp.

**Implementação:** Manter cadastro de instância, número, ambiente, conta comercial e estado da conexão pelo adaptador oficial.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Cadastrar a configuração de homologação e validar a conexão quando a credencial estiver disponível.

**Aceite técnico:** Não exibir “conectado” apenas porque os campos foram salvos.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-036"></a>
### AVA-036 — O cadastro dos serviços que serão disponibilizados nos menus do chatbot automaticamente, formando um catalogo de serviços

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 36, p. 329:**

> Permitir o cadastro dos serviços que serão disponibilizados nos menus do chatbot automaticamente, formando um catalogo de serviços.

**Implementação:** Cadastrar cada serviço uma única vez, com nome, grupo, visibilidade e adaptador, gerando sua entrada nos menus automaticamente.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Criar um serviço DEMO, conferir os menus e depois inativá-lo.

**Aceite técnico:** Os menus refletem o catálogo sem cópia manual por canal. O efeito automático/atualização deve decorrer do evento configurado, sem redigitação manual para completar o teste.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-037"></a>
### AVA-037 — Os serviços cadastrados deve permitir consultar automaticamente a respectiva API de integração

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 37, p. 329:**

> Os serviços cadastrados deve permitir consultar automaticamente a respectiva API de integração.

**Implementação:** Vincular o serviço à API autorizada e consultar a origem no momento definido para sua execução, com parâmetros e retorno rastreáveis.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Acionar uma consulta e comparar a resposta com o registro da origem.

**Aceite técnico:** A informação procede da API. Não substituir o retorno por uma amostra fixa selecionada por palavra-chave. O efeito automático/atualização deve decorrer do evento configurado, sem redigitação manual para completar o teste.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-038"></a>
### AVA-038 — Controlar a exibição dos serviços conforme a visibilidade para restringir acesso a serviços restritos com necessidade de autenticação ou…

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 38, p. 329:**

> Permitir controlar a exibição dos serviços conforme a visibilidade para restringir acesso a serviços restritos com necessidade de autenticação ou cadastro.

**Implementação:** Configurar serviço público ou restrito e validar a autorização também no comando, endpoint e entrega do arquivo.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Tentar chamar diretamente um serviço restrito oculto no menu sem autenticação.

**Aceite técnico:** Recusar a operação. Ocultar a opção não é o único controle.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-039"></a>
### AVA-039 — A exibição dos serviços no menu do chatbot conforme o perfil identificado automaticamente do solicitante

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 39, p. 329:**

> Permitir a exibição dos serviços no menu do chatbot conforme o perfil identificado automaticamente do solicitante.

**Implementação:** Renderizar as opções conforme perfil e escopo efetivamente validados.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Comparar Público, Cidadão, Servidor e Empreendedor em contas DEMO separadas.

**Aceite técnico:** Exibir apenas serviços permitidos, mantendo isolamento dos documentos pessoais e empresariais. O efeito automático/atualização deve decorrer do evento configurado, sem redigitação manual para completar o teste.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-040"></a>
### AVA-040 — Identificar se o numero de celular do solicitante do serviço é vinculado a algum CPF ou CNPJ no cadastro de pessoas

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 40, p. 329:**

> Identificar se o numero de celular do solicitante do serviço é vinculado a algum CPF ou CNPJ no cadastro de pessoas.

**Implementação:** Consultar a relação entre telefone e cadastro de pessoa/CPF/CNPJ como etapa de identificação, sem divulgar dados ou presumir posse legítima.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Testar telefone encontrado, ausente e com múltiplos vínculos na base fictícia.

**Aceite técnico:** Nenhum caso revela documentos de outro titular. Exigir a validação do vínculo antes do serviço restrito.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-041"></a>
### AVA-041 — Um cadastro de usuários de serviços

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 41, p. 329:**

> Possuir um cadastro de usuários de serviços.

**Implementação:** Reaproveitar a identidade central e manter os vínculos de usuário de serviços, canais e perfis necessários ao atendimento.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Cadastrar um usuário DEMO e reutilizá-lo em dois serviços autorizados.

**Aceite técnico:** Não criar uma pessoa ou conta distinta para cada serviço.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-042"></a>
### AVA-042 — Validar o cadastro de usuário para vincular o CPF ao numero de celular

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 42, p. 329:**

> Validar o cadastro de usuário para vincular o CPF ao numero de celular.

**Implementação:** Validar CPF e telefone pelo mecanismo autorizado, registrando resultado, data, escopo e evidência mínima da verificação.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Completar o processo no canal controlado e tentar vincular CPF de outro titular.

**Aceite técnico:** Somente o vínculo comprovado libera o serviço pessoal. Correspondência cadastral não equivale a autenticação.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="ava-043"></a>
### AVA-043 — Exigir aceite dos termos da LGPD sempre no 1º acesso ao serviço, validações de cadastros e mudanças nos termos

**TR — Assistência Virtual para Autoatendimento, Assistência Virtual para Autoatendimento; item 43, p. 329:**

> Exigir aceite dos termos da LGPD sempre no 1º acesso ao serviço, validações de cadastros e mudanças nos termos.

**Implementação:** Solicitar o aceite do termo vigente no primeiro acesso, nas validações previstas e após mudança de termos, guardando versão e data.

**Dados de outros módulos / integração:** Meta/WhatsApp Business API, webchat, Identidade/Pessoas, serviços do Tributário/Portais/Processos, arquivos, tarefas e armazenamento.

**Demonstração:** Aceitar v 1, publicar v 2 e acessar o serviço que exige o novo aceite.

**Aceite técnico:** Solicitar novo aceite; não atribuir a v 2 a data de aceitação de v 1. O registro não certifica sozinho conformidade com toda a LGPD.

**Atenção / limite:** Não reconstruir módulo emissor nem presumir API Meta/credencial pronta. Item 6 falaemlista de e-mails,14 temnúmero placeholder,21 temregra de confidencialidade ampla:manter decisões explícitas; não reinterpretar silenciosamente.

**Contrato operacional e base de teste:** [A01 — Canais oficiais e serviços automatizados](#pacote-a01).

<a id="matriz"></a>

## Execução, testes e encerramento

Executar primeiro o diagnóstico e uma tela-piloto; depois os pacotes operacionais acima, sem deixar segurança, integração e acessibilidade para o final. Cada pacote entrega tela, serviço, persistência, teste de operação positiva/negativa e emissão quando exigida. Reutilizar o que já foi comprovado; a ordem dos pacotes não obriga reimplementar funções prontas.

**Testes transversais:** gravação/reabertura em outra sessão; isolamento por perfil e unidade; validações por chamada direta; duplicidade técnica/concorrência; reversão/correção quando pedidas; perda de serviço; pesquisa além da primeira página; exportação integral; datas de fronteira; documento e histórico da mesma versão; tela de referência, zoom e Chrome no celular. Para operações clínicas, fiscais, bancárias ou de canal externo, somente ambiente/dados autorizados.

**Arquivos de teste:** preparar documentos coerentes com cada item e registrar origem, versão, campos, resultado esperado e nível de validação. O pacote contém planos/cenários, não arquivos oficiais homologados, clientes nativos, integrações executáveis ou certificados. Não fabricar protocolo externo. Quando o formato oficial faltar, registrar a lacuna, mesmo que um mock interno já permita testar o fluxo.

**Evidência por item:** estado inicial, dados usados, usuário/perfil, ação, resultado, persistência, fonte externa quando houver e arquivo emitido. Registrar rota/serviço somente depois de localizá-los no repositório. Uma captura complementa, mas não substitui, comprovar o efeito na base e no módulo de origem/destino.

Os estados iniciais da matriz abaixo não indicam software pronto. Atualizar para `EXISTE_NAO_TESTADO`, `A_IMPLEMENTAR`, `PARCIAL`, `VALIDADO_LOCAL`, `TESTADO_COM_SIMULADOR`, `INTEGRACAO_TESTADA_HOMOLOGACAO`, `DEPENDENCIA_OUTRO_MODULO`, `DEPENDENCIA_EXTERNA` ou manter a ressalva pertinente. Não agregar tudo num único percentual que misture teste local e integração oficial.

**Concluir somente com o resultado específico de cada citação comprovado.** Todas as ações expressas em uma mesma entrada precisam estar cobertas; um requisito com duas alternativas não se converte em duas exigências cumulativas. O TR permanece a referência quando este plano propõe um meio técnico. Definição pendente não é validação por presunção. Cobertura deste MD não é aprovação da comissão nem auditoria de todas as cláusulas contratuais.

### Matriz individual de execução

| ID | Estado inicial | Tela/serviço real | Teste e evidência | Dependência/decisão |
|---|---|---|---|---|
| AVA-001 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-002 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-003 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-004 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-005 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-006 | INTERPRETACAO_A_CONFIRMAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-007 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-008 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-009 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-010 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-011 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-012 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-013 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-014 | INTERPRETACAO_A_CONFIRMAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-015 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-016 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-017 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-018 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-019 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-020 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-021 | INTERPRETACAO_A_CONFIRMAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-022 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-023 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-024 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-025 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-026 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-027 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-028 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-029 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-030 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-031 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-032 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-033 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-034 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-035 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-036 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-037 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-038 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-039 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-040 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-041 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-042 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |
| AVA-043 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote A01 e ressalvas |

<a id="pendencias"></a>
## Definições e ressalvas a registrar

### A-Q01 — Lista de e-mails

O item 6 cita expressamente gestão da lista de e-mails. Confirmar qual lista/funcionalidade é pretendida. Não trocar a citação por conversas nem construir marketing não solicitado.

### A-Q02 — Número não preenchido

O item 14 contém (00) 0000-0000. Receber o número da contratante e definir responsabilidade pela linha/configuração; não inventar contato oficial.

### A-Q03 — Confidencialidade e terceiros

Conservar item 21 e identificar operadores/provedores autorizados. A utilização da plataforma oficial envolve processamento externo; confirmar alcance da redação, sem promessa de inexistência de terceiros.

### A-Q04 — Contrato Meta

Identificar versão, credenciais, modelos, categorias, limites e callbacks oficiais vigentes. O TR não fornece esses parâmetros. A aprovação depende da Meta, conforme o próprio item 5.

### A-Q05 — Vínculo de identidade

Definir mecanismo de validação CPF/telefone e representação empresarial. Telefone encontrado e perfil declarado não autorizam documentos privados; usar os serviços de identidade já existentes.

<a id="fontes"></a>
## Fontes, método e limites da conferência

**Fonte funcional exclusiva:** `termo de referencia (Ratificado)(1).pdf`, pp. 327–329. Citações transcritas com normalização de espaços/quebras, sem corrigir redação ou reiniciar numeração. Títulos curtos e agrupamentos operacionais foram criados para navegação.

O recorte foi extraído e comparado por dois métodos. As contagens coincidiram; diferenças de leitura por paginação, hifenização ou ordem de extração foram conferidas nas imagens pertinentes. O campo TR deste arquivo foi comparado programaticamente à transcrição consolidada. A relação completa de verificações está em `RELATORIO_QA.md` no pacote.

A conferência valida composição documental, numeração, referências e aritmética dos cenários. **Não foram executados testes do CeleriFlow nem verificados provedores, credenciais, dispositivos ou homologações oficiais.** Requisito textual com dependência/contradição permanece assim até solução documentada. Os critérios do TR e a avaliação da Administração prevalecem sobre uma solução proposta pelo plano.

### Referências externas pontuais — separadas do TR

Consultadas ou verificadas quanto à disponibilidade em 19/09/2026, conforme a limitação indicada em cada entrada. Servem para localizar contratos, não para substituir requisitos. Nenhuma regra clínica, fiscal ou escolar foi importada por suposição.

**Meta — WhatsApp Cloud API:** `https://developers.facebook.com/docs/whatsapp/cloud-api/overview`. Ponto oficial a verificar pelo agente. A abertura pública retornou limitação de acesso nesta consulta; não foi validado um contrato/versão completo. As obrigações de API oficial e apoio ao credenciamento vêm do TR, não de um endpoint presumido.

