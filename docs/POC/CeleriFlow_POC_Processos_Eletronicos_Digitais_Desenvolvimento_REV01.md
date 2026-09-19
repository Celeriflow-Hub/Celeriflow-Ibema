# CeleriFlow — Desenvolvimento e demonstração da POC
## Gestão de Processos Eletrônicos e Digitais | Divino de São Lourenço/ES

**Revisão 01 — 18/09/2026.**  
**Destinatário:** Codex/Antigravity com acesso ao repositório real.  
**Fonte funcional:** `termo de referencia (Ratificado)(1).pdf`, Processo Administrativo nº 1026/2026, seção 19, bloco **GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS**, páginas **54–63**.  
**Cobertura:** itens **1–134**, identificados neste plano como **PED-001 a PED-134**. O subtítulo **Modelagem de Fluxos**, anterior ao item 128, foi preservado. Os prefixos PED são identificadores de trabalho, não números novos do edital.  
**Objetivo:** desenvolver/adaptar o módulo no CeleriFlow e preparar demonstrações reproduzíveis com dados fictícios, usando operações reais do sistema.

> **Ordem ao agente:** diagnosticar o código, reaproveitar o que funciona, implementar os resultados exigidos, testar e apresentar evidências por item. Não entregar somente outro planejamento, menus, protótipos, dados fixos ou botões sem efeito. Não marcar integração, assinatura, digitalização, OCR ou mineração como atendidos por mera presença de uma tela.

**Decisões do usuário:** mesmo padrão dos MDs anteriores: telas profissionais, paginação real, prioridade para listagens de desktop sem rolagem global, tipografia consistente e operações sem redigitação. No celular, usar **o mesmo site responsivo no Chrome**, sem aplicativo separado. **Destacar dados/serviços de outros módulos; consumir o que já estiver disponível, sem reconstruir o módulo de origem.**

**Limite da análise:** este documento foi elaborado a partir do TR e dos padrões de desenvolvimento já definidos. O repositório, o serviço de assinatura, a URA, o scanner, os motores de OCR e as bases externas não foram inspecionados nem testados. Há cobertura documental dos 134 itens, não declaração de implementação ou aprovação na POC.

**Leitura correta:** apenas o campo **TR** reproduz a fonte, inclusive suas repetições e imperfeições, normalizando espaços/quebras de linha. Títulos de navegação, campos técnicos, soluções, cenários, tempos e aceites são **propostas de implementação/ensaio**, não um roteiro oficial ou requisitos adicionais atribuídos ao edital. Nos itens 128–134 há também orientação de serviço/modelagem; não transformar cada frase explicativa em uma nova funcionalidade de software.

**Navegação:** [Escopo](#escopo) · [Lista dos 134 itens](#lista) · [Outros módulos](#dependencias) · [Contratos operacionais](#operacao) · [Interface ERP](#ux) · [Base fictícia](#base) · [Item a item](#itens) · [Pacotes](#pacotes) · [Testes e evidências](#testes) · [Definições pendentes](#definicoes) · [Conferência e fontes](#fontes)

---
<a id="escopo"></a>
## 1. Escopo e forma de execução

### 1.1 Um módulo integrado, não vários sistemas novos

Ler instruções locais (`AGENTS.md`, se houver), manifests, lockfile, migrations, convenções de acesso e testes. Confirmar stack, serviços, tabelas e rotas antes de editar. Preservar identidade, autenticação, isolamento organizacional e estrutura de implantação do CeleriFlow. Não atualizar framework/ORM, mudar infraestrutura nem reiniciar o banco para esta POC.

Uma entrada de menu **Processos Eletrônicos e Digitais**, ou a equivalente existente, deve reunir cadastro/protocolo, caixas/tramitação, documentos/assinaturas, fluxos/formulários, cronograma, pesquisas/indicadores, arquivo e digitalização/extração. O acesso externo utiliza o portal/site existente. Ouvidoria deve ser integrada quando já existir; não manter cadastros paralelos de manifestações nem duas numerações desconectadas do mesmo processo.

**Fronteira importante:** nos MDs anteriores, Processos era origem de dados. Neste trabalho, **cadastro do processo, tramitação, configuração de fluxo, formulários, cronograma, juntada, controles documentais e relatórios do bloco são o objeto do desenvolvimento**. Não classificá-los como dependência de outro módulo para deixar de implementá-los. Preservar os serviços já consumidos por Compras, Meio Ambiente, Almoxarifado e outros clientes: alterações devem ser compatíveis e testadas, não substituições destrutivas.

Se GED, Ouvidoria, assinatura ou digitalização estiverem em componentes compartilhados, reutilizar seus serviços e desenvolver as funções do lado de Processos. Quando faltar uma capacidade que pertença realmente a outro módulo, registrar a dependência e o ID impactado. Se não houver componente separado e a função pertencer a este bloco, implementar o mínimo necessário **no domínio deste módulo**, sem criar outro produto genérico. Dependência registrada não dispensa o requisito.

### 1.2 Classificação das instruções

| Classe | Significado | Limite |
|---|---|---|
| **TR-E** | Item específico 1–134, com texto e página. | Preservar objetos, campos e ações do requisito. |
| **TR-G** | Exigência geral citada na seção 1.4. | Reaproveitar o núcleo e identificar lacuna separadamente. |
| **TEC** | Meio técnico: persistência, validação, controle concorrente, integridade e teste. | Não autoriza processo de negócio novo. |
| **UX/CANAL** | Diretriz do usuário. | Paginação, legibilidade, mesma interface web no celular. |
| **DEP-MOD / DEP-EXT** | Fonte compartilhada, equipamento, credencial ou contrato externo. | Identificar, consumir e comprovar. Não inventar disponibilidade. |
| **MODELAGEM** | Serviço e documentação previstos no subtítulo Modelagem de Fluxos. | Entregar procedimento modelado e evidência, não só criar uma tela. |
| **EXTRA** | Função sem relação com fonte ou orientação do usuário. | Não desenvolver neste pacote. |

Uma função pode atender vários IDs. Manter cada número na matriz, mas não duplicar implementação. Separar espécie do processo, assunto, espécie documental, composição do documento, prioridade, situação e sigilo: não são sinônimos.

### 1.3 Exclusões e cuidados para não cortar exigências

Não acrescentar aplicativo nativo/híbrido, wrapper, loja, instalação obrigatória de PWA, offline, WhatsApp/SMS/push, chatbot, parecer jurídico por IA, decisão administrativa por IA, treinamento de modelo neural próprio, blockchain, cartório digital, novo sistema tributário, pagamento/arrecadação, central telefônica completa, compra de scanner, CAD ou editor de ERP genérico.

**Não retirar como extras neste módulo:** formulários dinâmicos e consultas de outras tabelas; motor/configuração de fluxo; enquetes e pesquisas externas; cronograma; tramitação e recebimento em lote; **Ouvidoria com manifestação anônima**; consulta pública e sigilo; conexão com URA; assinaturas digitais/eletrônicas e múltiplos signatários; numeração de folhas; extração por OCR/tecnologia neural; driver/DPI, posição e digitalização em lote; exportação direta a outra base; dashboards, drill-down, mineração de processos e serviço de modelagem. Aqui esses resultados estão expressos no TR, ainda que não estivessem em Frotas.

O uso do Chrome no celular não elimina funções de digitalização do ambiente de trabalho. Identificar o scanner/serviço e o meio de integração disponíveis para os itens 117/121; **um upload de arquivo pronto não demonstra seleção real de driver ou DPI**. Não criar app mobile para tentar resolver essa dependência.

### 1.4 Referências gerais selecionadas

| Capacidade | Referência no PDF ratificado | Aplicação |
|---|---|---|
| Web, responsividade, integração e várias telas | Ambiente Tecnológico, pp. 28–29. | Mesma aplicação/dados, formulários e consultas acessíveis; preservar navegação existente. |
| Transações e integridade | Recuperação de Falhas, p. 31; Caracterização Operacional, p. 32; Gerais 18–19, 24–25 e 30–31, pp. 41–42. | Protocolo, peça, trâmite e atividade com resultado consistente. |
| Perfis, setor e auditoria | Caracterização Operacional, pp. 32–33; Gerais 9–13, 27 e 29, pp. 41–42. | Restringir também API, anexos, exportação, indicadores e acessos externos. |
| Relatórios e impressão | Ambiente Tecnológico 8–9, p. 28; Relatórios, p. 33; Gerais 14–16, p. 41. | Prévia, impressão e formatos gerais aplicáveis; CSV/TXT são ainda expressos em PED-127. |
| Cadastro único, ajuda e PDF assinado | Gerais 17, 21 e 33–38, pp. 41–42. | Usar serviços comuns sem alegar consulta externa ou assinatura não executada. |

É um recorte de referências, não auditoria integral dos requisitos gerais.

<a id="lista"></a>
## 2. Lista dos itens na ordem da fonte

A tabela é índice de navegação. O campo **TR** da seção 7 contém a redação integral. Os agrupamentos de telas/pacotes deste plano não substituem a organização original. Somente **Modelagem de Fluxos** é subtítulo da fonte dentro deste bloco.

### Itens 1–127 — sequência do bloco

| ID / item do TR | Ação resumida | Página do PDF |
|---|---|---:|
| [PED-001 / 1](#ped-001) | Registro e ciclo completo de processo/documento | 54 |
| [PED-002 / 2](#ped-002) | Campos mínimos do cadastro de processos | 54 |
| [PED-003 / 3](#ped-003) | Palavras-chave pesquisáveis | 54 |
| [PED-004 / 4](#ped-004) | Prioridade Baixa, Normal e Alta | 54 |
| [PED-005 / 5](#ped-005) | Registro e consulta por departamento responsável | 54 |
| [PED-006 / 6](#ped-006) | Informações essenciais e validação | 54 |
| [PED-007 / 7](#ped-007) | Comprovante de protocolização na inclusão | 54 |
| [PED-008 / 8](#ped-008) | E-mail de abertura com comprovante e andamento | 54–55 |
| [PED-009 / 9](#ped-009) | E-mail automático em qualquer fase | 55 |
| [PED-010 / 10](#ped-010) | Ator e data/hora do envio e recebimento | 55 |
| [PED-011 / 11](#ped-011) | Termo de autuação automático | 55 |
| [PED-012 / 12](#ped-012) | Parecer e histórico de trâmite sem limite funcional de caracteres | 55 |
| [PED-013 / 13](#ped-013) | Anexação ou digitalização de documentos/imagens | 55 |
| [PED-014 / 14](#ped-014) | Cancelamento de envio ainda não recebido | 55 |
| [PED-015 / 15](#ped-015) | Formulários dinâmicos com sete tipos de resposta | 55 |
| [PED-016 / 16](#ped-016) | Respostas de formulário direcionam atividades | 55 |
| [PED-017 / 17](#ped-017) | Atividade associada à tela de trabalho | 55 |
| [PED-018 / 18](#ped-018) | Crítica de providências obrigatórias pendentes | 55 |
| [PED-019 / 19](#ped-019) | Conclusão, termo e arquivamento temporário | 55 |
| [PED-020 / 20](#ped-020) | Locais de arquivamento | 55 |
| [PED-021 / 21](#ped-021) | Arquivamento no próprio setor | 55 |
| [PED-022 / 22](#ped-022) | Desarquivamento e reativação autorizados | 55–56 |
| [PED-023 / 23](#ped-023) | Encerramento permitido por atividade/fase | 56 |
| [PED-024 / 24](#ped-024) | Histórico de andamento com anexos | 56 |
| [PED-025 / 25](#ped-025) | Sequência de numeração por ano, tipo e espécie | 56 |
| [PED-026 / 26](#ped-026) | Gestão do andamento e relatórios até o arquivamento | 56 |
| [PED-027 / 27](#ped-027) | Documentos com campos de mesclagem | 56 |
| [PED-028 / 28](#ped-028) | Tempo de execução das atividades | 56 |
| [PED-029 / 29](#ped-029) | Justificativa obrigatória do atraso e novo prazo | 56 |
| [PED-030 / 30](#ped-030) | Prazos definidos no fluxo | 56 |
| [PED-031 / 31](#ped-031) | Texto padronizável de encaminhamento | 56 |
| [PED-032 / 32](#ped-032) | Textos de encaminhamento públicos e privados | 56 |
| [PED-033 / 33](#ped-033) | Criação automática de processo por conexão com URA | 56 |
| [PED-034 / 34](#ped-034) | Visualização das assinaturas em cada acesso | 56 |
| [PED-035 / 35](#ped-035) | Validação e autenticação pelo sítio da contratante com QR Code | 56 |
| [PED-036 / 36](#ped-036) | Assinatura digital de anexo por certificado | 56 |
| [PED-037 / 37](#ped-037) | Visualização dentro do sistema sem download manual | 57 |
| [PED-038 / 38](#ped-038) | Download do processo completo ou de peças individuais | 57 |
| [PED-039 / 39](#ped-039) | Envio de link por e-mail para auditoria externa | 57 |
| [PED-040 / 40](#ped-040) | Gestão de informações encaminhadas a órgãos externos | 57 |
| [PED-041 / 41](#ped-041) | Ambiente exclusivo de externos com permissões parametrizáveis | 57 |
| [PED-042 / 42](#ped-042) | Assinaturas digitais e eletrônicas em trâmites e anexos | 57 |
| [PED-043 / 43](#ped-043) | Documentos exigidos por assunto | 57 |
| [PED-044 / 44](#ped-044) | Anexos em diversos formatos | 57 |
| [PED-045 / 45](#ped-045) | Juntada de processos por apensação ou anexação | 57 |
| [PED-046 / 46](#ped-046) | Consulta por número, requerente, assunto, abertura e chave | 57 |
| [PED-047 / 47](#ped-047) | Modelos de termos de apensação, anexação e volumes | 57 |
| [PED-048 / 48](#ped-048) | Comprovante de cada encaminhamento | 57 |
| [PED-049 / 49](#ped-049) | Histórico simples ou detalhado emitível | 57 |
| [PED-050 / 50](#ped-050) | Tramitação autorizada somente em setores específicos | 57 |
| [PED-051 / 51](#ped-051) | Caixas e participantes por setor, função, usuário e papel | 57 |
| [PED-052 / 52](#ped-052) | Rejeição justificada de processo no estado Enviado | 57 |
| [PED-053 / 53](#ped-053) | Auditoria por usuário e data no processo | 57–58 |
| [PED-054 / 54](#ped-054) | Representação gráfica de processos por assunto | 58 |
| [PED-055 / 55](#ped-055) | Relatório de processos abertos por período | 58 |
| [PED-056 / 56](#ped-056) | Biblioteca de documentos parametrizáveis no fluxo | 58 |
| [PED-057 / 57](#ped-057) | Enquetes e pesquisas como base de decisões do fluxo | 58 |
| [PED-058 / 58](#ped-058) | Formulários para pesquisas externas | 58 |
| [PED-059 / 59](#ped-059) | Automação de decisões e aprovações de documentos | 58 |
| [PED-060 / 60](#ped-060) | Exibição de fluxo em gráfico ou relatório | 58 |
| [PED-061 / 61](#ped-061) | Mineração de processos por fluxo de trabalho | 58 |
| [PED-062 / 62](#ped-062) | Relatórios com drill-down | 58 |
| [PED-063 / 63](#ped-063) | Cadastro de fluxo por assunto | 58 |
| [PED-064 / 64](#ped-064) | Setores do percurso e tempo previsto em cada setor | 58 |
| [PED-065 / 65](#ped-065) | Assuntos permitidos a usuários ou agrupamentos | 58 |
| [PED-066 / 66](#ped-066) | Consulta cidadã dos requisitos de protocolização | 58 |
| [PED-067 / 67](#ped-067) | Ouvidoria com ciclo completo de manifestações | 58 |
| [PED-068 / 68](#ped-068) | Manifestação anônima sem dados pessoais obrigatórios | 58 |
| [PED-069 / 69](#ped-069) | Consulta pública de protocolos sem senha | 58 |
| [PED-070 / 70](#ped-070) | Sigilo parametrizável e consulta pelo próprio requerente | 59 |
| [PED-071 / 71](#ped-071) | Definição manual de sigilo em qualquer fase | 59 |
| [PED-072 / 72](#ped-072) | Sigilo por configuração de assunto | 59 |
| [PED-073 / 73](#ped-073) | Participação eletrônica do cidadão em processos fiscais | 59 |
| [PED-074 / 74](#ped-074) | Recebimento e contestação pelo contribuinte | 59 |
| [PED-075 / 75](#ped-075) | Cronograma integrado à tramitação | 59 |
| [PED-076 / 76](#ped-076) | Criação de processo a partir do cronograma | 59 |
| [PED-077 / 77](#ped-077) | Andamento e providências acessíveis pelo cronograma | 59 |
| [PED-078 / 78](#ped-078) | Observações em cada fase | 59 |
| [PED-079 / 79](#ped-079) | Planejamento das atividades e ações do processo | 59 |
| [PED-080 / 80](#ped-080) | Autocadastro de cidadão, servidor e pessoa jurídica | 59 |
| [PED-081 / 81](#ped-081) | Tramitação entre órgãos da municipalidade | 59 |
| [PED-082 / 82](#ped-082) | Autenticação de documento por chave | 59 |
| [PED-083 / 83](#ped-083) | QR Code para consulta de documento emitido | 59 |
| [PED-084 / 84](#ped-084) | Modelos de documentos reutilizáveis no procedimento | 59–60 |
| [PED-085 / 85](#ped-085) | Espécie documental com extensões e tamanhos | 60 |
| [PED-086 / 86](#ped-086) | E-mail com protocolo e histórico — função compartilhada | 60 |
| [PED-087 / 87](#ped-087) | Aplicação automática de alteração do fluxo aos processos ativos | 60 |
| [PED-088 / 88](#ped-088) | Atividade, responsável e situação atualizados em tempo real | 60 |
| [PED-089 / 89](#ped-089) | Fluxo auxiliar reutilizado em vários procedimentos | 60 |
| [PED-090 / 90](#ped-090) | Pesquisa de processos e documentos com critérios combináveis | 60 |
| [PED-091 / 91](#ped-091) | Dashboards gerenciais de protocolização | 60 |
| [PED-092 / 92](#ped-092) | Múltiplas assinaturas no mesmo documento | 60 |
| [PED-093 / 93](#ped-093) | Gestão de assinaturas de registros | 60 |
| [PED-094 / 94](#ped-094) | Identificação de documentos pendentes de assinatura | 60 |
| [PED-095 / 95](#ped-095) | Identificação dos documentos assinados | 60 |
| [PED-096 / 96](#ped-096) | Solicitação de assinatura de terceiros por e-mail | 60 |
| [PED-097 / 97](#ped-097) | Conversão de documento editável para PDF | 60 |
| [PED-098 / 98](#ped-098) | Envio e tramitação de processos em lote | 60 |
| [PED-099 / 99](#ped-099) | Recebimento de processos em lote | 60 |
| [PED-100 / 100](#ped-100) | Próxima fase determinada pelo fluxo | 60 |
| [PED-101 / 101](#ped-101) | Setores e previsão de permanência — função compartilhada | 61 |
| [PED-102 / 102](#ped-102) | Arquivos existentes no computador tornam-se peças | 61 |
| [PED-103 / 103](#ped-103) | Número do processo, foliação sequencial e ordem cronológica | 61 |
| [PED-104 / 104](#ped-104) | Composição digital, digitalizada, física, mista ou não classificada | 61 |
| [PED-105 / 105](#ped-105) | Notas e comentários em documentos e processos | 61 |
| [PED-106 / 106](#ped-106) | Apensação temporária de documentos | 61 |
| [PED-107 / 107](#ped-107) | Informação de tempo de guarda e descarte no encerramento | 61 |
| [PED-108 / 108](#ped-108) | Configuração da linguagem/idioma do OCR | 61 |
| [PED-109 / 109](#ped-109) | Extração de dados com rastreabilidade de autenticidade | 61 |
| [PED-110 / 110](#ped-110) | Modelos de campos extraídos associados à base pesquisável | 61 |
| [PED-111 / 111](#ped-111) | Revisão editável dos dados com documento ao lado | 61 |
| [PED-112 / 112](#ped-112) | Pesquisa por tabela/modelo com impressão | 61 |
| [PED-113 / 113](#ped-113) | Consulta da estrutura das tabelas geradas | 61 |
| [PED-114 / 114](#ped-114) | Exportação de dados extraídos para arquivos | 61 |
| [PED-115 / 115](#ped-115) | Exportação direta para base externa pré-configurada | 61–62 |
| [PED-116 / 116](#ped-116) | Solicitação web de documentação à instituição | 62 |
| [PED-117 / 117](#ped-117) | Configuração real do driver de digitalização e DPI | 62 |
| [PED-118 / 118](#ped-118) | Definição da posição do documento na captura | 62 |
| [PED-119 / 119](#ped-119) | Assinatura digital de documentos digitalizados | 62 |
| [PED-120 / 120](#ped-120) | Impressão do documento digital | 62 |
| [PED-121 / 121](#ped-121) | Digitalização em lote e classificação | 62 |
| [PED-122 / 122](#ped-122) | Dados extraídos separados por modelo | 62 |
| [PED-123 / 123](#ped-123) | Autenticidade dos documentos extraídos | 62 |
| [PED-124 / 124](#ped-124) | Extração com OCR e tecnologia de redes neurais | 62 |
| [PED-125 / 125](#ped-125) | Pesquisa de dados funcionando em navegador | 62 |
| [PED-126 / 126](#ped-126) | Impressão de toda pesquisa do sistema no escopo | 62 |
| [PED-127 / 127](#ped-127) | Exportação em CSV e TXT | 62 |

### Modelagem de Fluxos

| ID / item do TR | Ação resumida | Página do PDF |
|---|---|---:|
| [PED-128 / 128](#ped-128) | Modelagem documentada das atividades, responsáveis e informações | 62 |
| [PED-129 / 129](#ped-129) | Diagramas ou mapas visuais dos procedimentos | 62 |
| [PED-130 / 130](#ped-130) | Identificação de gargalos e oportunidades de melhoria | 62 |
| [PED-131 / 131](#ped-131) | Padrões e diretrizes para execução consistente | 62–63 |
| [PED-132 / 132](#ped-132) | Documentação detalhada como referência de treinamento e auditoria | 63 |
| [PED-133 / 133](#ped-133) | Personalização do fluxo às necessidades da organização | 63 |
| [PED-134 / 134](#ped-134) | Entrega do serviço de modelagem e transição operacional | 63 |

<a id="dependencias"></a>
## 3. Dados de outros módulos e dependências técnicas

**Origens previstas a confirmar no repositório**, sem inventar APIs, credenciais, tabelas ou dados existentes.

| Código | Origem/destino previsto | Informação ou serviço | Fronteira do trabalho |
|---|---|---|---|
| **DEP-01** | Administração / Autenticação / Organograma | Órgão, setor, usuário, função/papel, grupos e permissões. | Reutilizar identidade/estrutura. Criar configurações específicas de Processos, não outro login/organograma. |
| **DEP-02** | Pessoas / Cadastro único / Portal | Requerente PF/PJ, servidor, contatos e vínculo da representação. | Consumir cadastros e fluxo de conta existentes; manifestação anônima não exige criar pessoa fictícia. |
| **DEP-03** | GED / Armazenamento / Modelos / Conversão / Relatórios, se compartilhados | Bytes, metadados, prévias, PDF, impressão e documentos emitidos. | Processos mantém peças, ordem, termos e modelos de seu escopo. Não reconstruir GED/editor global; ausência compartilhada deve ser explicitada. |
| **DEP-04** | Assinatura / Verificação de certificados | Arquivo assinado, signatários, versão e resultado de verificação. | Chamar o serviço adequado, preservar evidência e sigilo. Não criar autoridade certificadora ou simular certificado válido. |
| **DEP-05** | E-mail / Convites / Execução de tarefas do núcleo | Envio, destinatários, link e situação do provedor. | Gerar eventos e modelos de mensagem do módulo, sem outro provedor geral. |
| **DEP-06** | Ouvidoria, quando já separada | Manifestação, tipo, protocolo, encaminhamento e resposta. | Integrar PED-067/068 ao serviço existente. Se não houver módulo separado, a função mínima permanece no escopo deste bloco; não a excluir. |
| **DEP-07** | Tributos / Fazenda / Obras e demais emissores | Termos fiscais, autos, notificações, alvarás e seus vínculos de origem. | Permitir participação, entrega e contestação pelo processo. Não calcular tributo, lavrar auto fiscal ou emitir alvará técnico fora da origem competente. |
| **DEP-08** | URA / Telefonia autorizada | Evento de atendimento e dados necessários à abertura de processo. | Implementar/usar o receptor de Processos conforme contrato identificado; não construir telefonia ou inventar evento como chamada real. |
| **DEP-09** | Scanner / Serviço de captura / Driver | Dispositivo, driver, DPI, orientação, páginas capturadas. | Usar integração efetiva de captura. Não adquirir hardware nem criar aplicativo mobile; configuração sem efeito é pendência. |
| **DEP-10** | OCR / Extração documental | Idioma, motor/modelo, saída extraída e proveniência. | Implementar modelos/mapeamento/revisão no escopo; reaproveitar motor disponível. Identificar componente neural real, sem treinar rede nova por suposição. |
| **DEP-11** | Base de dados externa pré-configurada | Destino e contrato de campos para dados extraídos. | Implementar exportação do lado de Processos/Extração. Escrever apenas nos destinos/campos autorizados; não desenvolver o sistema de destino. |
| **DEP-12** | Arquivo / Classificação e temporalidade aprovadas | Classificação aplicável, regras de guarda e destino. | Configurar referência e controle do processo; não inventar tabela CONARQ, prazos legais ou destruição automática. |
| **DEP-13** | Compras / Meio Ambiente / outros módulos clientes | ID de origem, pessoa, assunto, solicitação e documentos já produzidos. | Expor/reutilizar serviços de Processos com vínculos de origem; não reescrever telas ou regras dos clientes. |

**Regras:** o diagnóstico das origens é de leitura; mudanças de outros módulos ficam registradas como pendência. No alvo, implementar relações, validações e chamadas que lhe competem. Fonte indisponível produz erro/pendência, não dados inventados. Para DEP-11, a escrita autorizada no destino é parte expressa do item 115; essa exceção não autoriza acesso irrestrito nem alteração de schema de outro sistema.

A origem do dado deve aparecer na especificação/evidência e nos contextos em que ajude o operador. Não encher todas as tabelas de colunas técnicas nem exigir redigitação de nomes/documentos já selecionados. O usuário populará as fontes reais de homologação; fixture de unidade não comprova integração externa.

<a id="operacao"></a>
## 4. Contratos operacionais — referência comum aos 134 itens

### 4.1 Cadastro, numeração, processo e documento

Usar identificadores estáveis e número legível conforme sequência configurada por **ano, tipo e espécie**. Gerar número e protocolo em transação com unicidade no escopo. Duas submissões do mesmo evento não criam dois processos; duas solicitações diferentes não recebem o mesmo número. Não atribuir número por `contagem + 1` sem proteção concorrente. Não reutilizar silenciosamente números cancelados.

O registro contém os campos de PED-002 e as exigências do assunto. “Qualquer tipo” é viabilizado por tipos/espécies/assuntos configuráveis, não por supor um único fluxo universal. Guardar documentos avulsos e processos conforme a arquitetura, com controle de envio/recebimento próprio ou vínculo rastreável. Processo e peça não são a mesma entidade.

**Exceção expressa de anonimato:** a manifestação de PED-068 não pode depender de CPF, nome, e-mail ou login. Usar a situação de identificação anônima, sem inventar pessoa ou contornar todos os validadores do cadastro comum. A ausência de interessado identificado nesse canal deve ser tratada explicitamente, preservando a exigência cadastral dos outros processos. Ver Q-01.

### 4.2 Enviar, receber, cancelar, rejeitar e tramitar em lote

Separar **situação administrativa do processo**, **estado do envio** e **atividade do fluxo**. O envio registra remetente, destinatário/caixa, data e ator; o recebimento registra seu próprio ator/data. Antes do recebimento, o remetente autorizado pode cancelar o envio (14) e o destinatário autorizado pode rejeitá-lo com justificativa (52). Após receber, essas mesmas ações não apagam o recebimento: usar trâmite subsequente permitido. Não apagar o histórico nem renomear um recebimento para “cancelado”.

Implementação proposta: uma transferência de posse tem uma origem, destino e versão; receber/cancelar/rejeitar competem pela mesma versão e somente um efeito se confirma. A consulta posterior deve explicar o resultado. O destino só ganha as competências configuradas; um usuário não recebe privilégios gerais por ter um processo na caixa.

O lote dos itens 98/99 conserva resultado por processo, seleção e destino explícitos. Para o ensaio, pré-validar o conjunto; não efetivar lote com membro inválido sem avisar. Caso o ERP já suporte sucesso parcial, informar claramente quais tiveram efeito e quais falharam, permitindo repetir só pendentes sem duplicação. Assinatura/recibo continua por trâmite, não apenas um status de lote. Histórico, caixa e fluxo refletem os mesmos eventos.

### 4.3 Fluxo por assunto, formulários, prazos e subfluxos

O modelo guarda atividades, responsáveis/caixas, condições, telas/formulários, documentos/providências e destinos. A instância guarda suas respostas, atividades e histórico. O formulário deve suportar **discursiva, objetiva única, objetiva múltipla, data, hora, numérica e dropdown com consulta de outras tabelas**. O dropdown usa fonte/campos permitidos e escopo do usuário; não é campo de SQL livre.

Condições usam operadores/tipos controlados; não executar código arbitrário do usuário. Direcionar com base nas respostas e enquetes conforme regra configurada. Um destino automático deve ser resultado do fluxo, não escolha repetida do operador. A atividade mostra na sua tela os dados e ações pertinentes, sem construir um gerador universal de telas.

Providências obrigatórias não concluídas devem gerar crítica identificável e impedir avanço quando a regra configurada assim definir; os testes usam um bloqueio explícito, sem interpretar todo aviso como indeferimento. Registrar prazos, começo, término, tempo decorrido e prazo anterior/novo. Em atraso, a configuração pode exigir justificativa e nova data. Não apagar o atraso original para aparentar cumprimento. Horas/dias úteis, feriados e base do prazo dependem da regra administrativa; cenários usam horas corridas de teste, não prazos legais.

Subfluxo auxiliar pode ser chamado por vários procedimentos, com **instância própria por chamada**, entradas/retorno e correlação ao processo pai. Reutilizar o modelo não mistura respostas de dois requerentes. Tratar ciclos explicitamente: não permitir recursão infinita nem proibir todo retorno de fluxo que o procedimento legitimamente modele.

### 4.4 Alteração de fluxo em processos em andamento e atualização em tempo real

**PED-087 não fica atendido apenas criando uma nova versão para processos futuros.** Oferecer alteração do modelo e aplicação identificada aos processos abrangidos. Guardar a versão anterior e mapear atividades antigas/novas; atualizar automaticamente as atividades abertas/futuras compatíveis quando a alteração for aplicada, sem recriar manualmente tarefa por tarefa.

Pré-validar incompatibilidades: atividade removida em execução, documento já assinado ou transição concorrente não podem resultar em migração silenciosa. Exigir o mapeamento/decisão necessária antes de aplicar; registrar o que foi atualizado e o que não foi. Histórico concluído e documentos assinados permanecem íntegros. A evidência deve mostrar processo que **já estava em andamento**, não somente um novo.

PED-088 exige exibição atualizada de atividade, responsável e situação. Utilizar o mecanismo existente de atualização automática (evento, assinatura de atualização ou consulta periódica compatível), com estados de conexão/atualização visíveis. Duas sessões devem refletir a mudança sem depender de F5. Não inventar SLA instantâneo universal; medir latência e registrar ambiente. Se a conexão cair, indicar informação possivelmente desatualizada.

### 4.5 Sigilo, consulta pública e compartilhamento externo

Tratar separadamente: **consulta pública sem senha (69); dados reservados ao requerente (70); sigilo manual por processo (71); padrão de sigilo por assunto (72); textos públicos/privados (32); ambiente externo parametrizado (41)**. Nenhum teste de acesso público autoriza divulgação integral de anexos ou pareceres privados.

Proposta de implementação: consulta sem login por referência do protocolo, exibindo somente o conjunto de informações autorizado; acesso a conteúdo sigiloso mediante identificação/permissão apropriada. A chave de consulta não deve automaticamente permitir baixar todo processo reservado. Ao ativar sigilo, revalidar links, prévias, exportações, pesquisa e caches; o texto “privado” não pode estar oculto somente no CSS.

**Q-01 registra a tensão entre “todos os protocolos, sem senha” e “somente o próprio requerente”.** Não declarar que a política proposta resolve oficialmente essa redação. Preparar demonstrações de ambos os comportamentos e obter a política de publicação. Não tornar toda consulta dependente de senha, nem tornar todo conteúdo público para satisfazer um único item.

Compartilhar processo com auditor externo gera acesso limitado ao objeto/peças autorizados, com link funcional e e-mail para caixa de teste. Revalidar permissão ao abrir cada arquivo, não só ao carregar o portal. Revogação/expiração podem usar o mecanismo existente de compartilhamento; não criar um novo sistema de gestão de identidades. Não transmitir material real a órgão externo para ensaio.

### 4.6 Modelos, juntada, volumes, foliação e preservação dos documentos

Modelos de documentos e termos possuem versão, campos de mesclagem e relação ao fluxo. O documento emitido registra os valores efetivamente usados. “Sem limite de caracteres” significa não impor corte funcional arbitrário nos campos de parecer/histórico; testar conteúdo extenso e permitir leitura integral, sem prometer capacidade física infinita.

Juntada associa o **arquivo efetivo** ao processo, com autoria, data, espécie, composição, ordem e páginas. Espécie documental parametriza formatos/tamanhos admitidos; validar também o conteúdo/tipo do arquivo no servidor. Não executar scripts de documentos nem renderizar conteúdo ativo sem isolamento. Formatos reais suportados devem ser enumerados no diagnóstico, sem fingir visualização de arquivo incompatível.

Para PED-103, a representação processual dos documentos contém número do processo e foliação sequencial, com peças na ordem de inserção. Reservar intervalos de folhas de forma concorrente segura. Numeração não segue ordem alfabética do nome do arquivo nem reinicia em cada página da tabela. No teste, usar PDFs/imagens pagináveis; formato não paginável precisa de política documentada de representação, não número fictício.

**Documento já assinado exige tratamento específico:** preservar o original e sua assinatura; não regravar seus bytes para colocar carimbo. Usar original imutável e representação processual numerada vinculada, claramente identificada como derivada, sem afirmar que a assinatura original valida a cópia modificada. Para documento produzido no sistema, colocar os elementos de processo/foliação antes da assinatura final. A aceitação dessa representação para originais externos assinados precisa ser confirmada em Q-03. Não declarar PED-103 resolvido mostrando somente um número no grid.

Download integral pode usar o mecanismo existente de dossiê/pacote com índice, peças originais e representações quando pertinentes. Não impor juntar tudo em um único PDF se outro formato preserva corretamente o processo e seus originais. O plano demonstrará processo completo e peça individual; a fonte usa “ou” no item 38, não exige os dois formatos de exportação como obrigações cumulativas. Prévia interna não exige que o usuário salve/abra o arquivo fora do sistema.

Apensação de processos (45) e de documentos (106) mantém vínculos temporários e identidade dos componentes. Anexação é operação distinta, com termos e efeitos definidos no procedimento. Não implementar tudo como upload de arquivo, nem duplicar fisicamente todos os documentos para formar vínculos. Identificar efeitos de desfazimento e restrições em Q-07; não apagar o histórico da relação.

### 4.7 Assinaturas, múltiplos signatários e autenticidade

Distinguir assinatura eletrônica identificada pelo mecanismo adotado e assinatura digital por certificado. Os itens 36/119 exigem certificação digital, 42 contempla trâmites e documentos, 92 exige múltiplas assinaturas. Um clique, nome digitado, imagem de assinatura ou hash isolado não será apresentado como certificado.

Cada solicitação vincula signatário, registro/trâmite, documento e versão. Estados de “assinado” e “pendente” derivam do retorno verificável. Duas assinaturas devem constar **no mesmo documento final** quando esse for o objeto, preservando a validade das anteriores; dois PDFs diferentes assinados individualmente não comprovam PED-092. Não substituir o arquivo após a primeira assinatura. Alteração de conteúdo gera nova versão e novas solicitações pertinentes, sem copiar status antigo.

Documento ou imagem anexada/digitalizada deve ter caminho real de assinatura. Se o serviço exigir representação em PDF para imagem, conservar origem, relacionar a conversão e mostrar qual versão foi assinada; não alterar somente a extensão do arquivo. Modalidade/formato suportados e credenciais são DEP-04/Q-04.

Exibir assinaturas em cada acesso, com signatários, versão e resultado verificável; aparência visual não substitui validação. Chave de autenticidade e QR Code apontam ao documento correto no sítio/portal da contratante, conforme acesso configurado. Não mostrar “assinatura válida” apenas porque a chave existe. Preparar textos, QR e marcações necessárias **antes** de assinar os bytes finais. Metadados/validação posterior ficam fora do arquivo imutável.

### 4.8 Captura, OCR, modelos de extração e autenticidade

São resultados distintos: selecionar driver/DPI (117), definir posição (118), digitalizar lote/classificar (121), extrair por OCR/tecnologia neural (124), escolher idioma (108), mapear campos (110), revisar ao lado da imagem (111), pesquisar estrutura/dados por modelo (112/113/122), imprimir e exportar (114–127).

A captura usa driver/dispositivo/serviço reais; persistir parâmetros e comprovar efeito na aquisição. Upload de PDF pronto pode atender à juntada, mas não comprova configuração de captura ou digitalização em lote. O usuário mantém o acesso web; qualquer componente de ligação ao scanner precisa ser identificado, autorizado e compatível com o ambiente, não criado como app mobile nem escondido como dependência inexistente.

O modelo de extração identifica campos, tipos e associação à estrutura de dados pesquisável. Preferir a solução de modelos/tabelas lógicas suportada pelo ERP; consulta da estrutura deve mostrar campos/tipos e destino lógico efetivo. Não expor SQL de administração, executar DDL livre ou presumir tabela física por modelo se a arquitetura usa estrutura equivalente; Q-05 registra o mapeamento exigido.

Cada valor conserva arquivo/página/região quando disponível, motor/modelo/idioma, valor bruto e valor confirmado. Revisão humana não apaga a saída bruta. OCR deve processar imagens reais de teste sem camada textual; copiar conteúdo já embutido de PDF ou preencher campos manualmente não prova reconhecimento. Evidenciar componente neural efetivamente utilizado pelo motor escolhido, sem obrigar treinamento próprio. Não inventar precisão de 100%; falha/baixa confiança exige revisão, nunca valor fabricado.

**Autenticidade não é sinônimo de acerto do OCR.** Preservar origem imutável, cadeia de operações, versões e validações disponíveis; dado corrigido é derivado e identificado. Hash ajuda a conferir integridade, mas isoladamente não prova quem produziu o documento físico. Q-06 identifica a garantia necessária dos itens 109/123; não prometer autenticidade jurídica do original só porque houve extração.

Exportação direta a outra base usa destino configurado no servidor, credencial protegida, campos/tabelas permitidos, pré-validação e idempotência por origem/modelo/versão. Falha mantém pendência; confirmar após retorno real. CSV/TXT devem preservar acentos, delimitadores, quebras/aspas e valores conforme contrato de arquivo, sem truncar ao total da página visível. Proteger a exportação CSV contra interpretação de conteúdo não confiável como fórmula, sem alterar silenciosamente a fonte confirmada.

### 4.9 Cronograma, relatórios, gráficos e mineração

Cronograma planeja atividades, identifica responsáveis, datas previstas/reais e vínculo ao processo. Criar processo a partir da atividade do cronograma é operação única e rastreável; não criar segundo cadastro de tarefas desconectado da tramitação. Concluir atividade reflete resultado real, não apenas cor na agenda.

Mineração (61) trabalha sobre **eventos executados**, não somente sobre o desenho previsto: reconstituir sequências por processo, descobrir variantes observadas, contar percursos e retornos, calcular tempos/esperas segundo critérios explicitados e apontar atividades que concentram demora. É uma implementação proposta do requisito aberto, a validar em Q-08; não substituí-la por chatbot ou por gráfico fixo. Guardar a amostra/filtros e permitir drill-down aos casos que sustentam cada resultado. Comparar fluxos/versões distintos sem misturar sequências incompatíveis.

Dashboards de protocolização e gráficos por assunto são expressos (54/91); posicioná-los em área própria, sem ocupar toda tela operacional. Totais derivam do conjunto autorizado, não apenas da página carregada. Relatórios imprimíveis de consulta (126), histórico simples/detalhado, processos abertos por período e pesquisas por modelo conservam os mesmos filtros. Documentação de modelagem dos itens 128–134 deve corresponder ao fluxo efetivamente configurado e testado.

### 4.10 Registro seguro de efeitos e evidências

Número/protocolo, juntada/foliação, envio/recebimento, criação por cronograma/URA, geração documental e aplicação de fluxo devem ter proteção contra repetição/concorrência. Validar autorização e consistência no servidor, com confirmação transacional quando os efeitos compartilham banco. Eventos externos assíncronos registram pendente/falhou/concluído; não fingir transação atômica entre sistemas independentes.

E-mail nasce de evento confirmado; reenvio técnico não duplica a mesma mensagem/destinatário. Falha de envio não apaga o processo nem aparece como mensagem recebida. Testes usam caixas controladas/autorizadas; comprovar recebimento e abertura dos links. Logs, consultas, dashboards, exports e relatórios não expõem conteúdo sigiloso. Não publicar em produção, disparar comunicação a cidadão real, adquirir serviço ou compartilhar documentos sem autorização.

<a id="ux"></a>
## 5. Interface profissional e eficiente [UX/CANAL]

### 5.1 Organização das telas

| Área interna | Conteúdo / ação principal | IDs de referência |
|---|---|---|
| Protocolo e processos | Cadastro, busca, requisitos por assunto, prioridades, comprovantes e ficha. | 1–7, 25, 43, 46, 65–66, 80, 90. |
| Caixas e tramitação | Receber/enviar, pendências, cancelar/rejeitar, prazos e lotes. | 10, 14, 18, 28–32, 48–53, 81, 88, 98–101. |
| Documentos e assinaturas | Peças, prévia, termos, volumes, modelos, comentários, assinaturas e autenticidade. | 11–13, 24, 27, 34–49, 56, 82–85, 92–97, 102–106, 119–120. |
| Fluxos e formulários | Modelos por assunto, regras, telas de atividades, enquetes, subfluxos e versões. | 15–17, 23, 57–65, 87, 89, 100–101, 128–134. |
| Cronograma | Previsto/executado, atividades, criação e abertura dos processos relacionados. | 75–79. |
| Arquivo | Local, conclusão, termo, guarda temporária, prazo e desarquivamento. | 19–23, 107. |
| Digitalização e extração | Captura, driver/DPI, lote, idioma/modelo, revisão lado a lado, pesquisa, estrutura e exportação. | 108–127. |
| Consultas e gestão | Relatórios, gráfico por assunto, dashboards, mineração, drill-down e documentação dos fluxos. | 24, 26, 49, 54–55, 60–62, 91, 112, 125–132. |
| Portal externo / Ouvidoria | Requisitos, autocadastro, protocolização, acompanhamento público/privado, manifestação anônima, contestação e pedido documental. | 39–41, 58, 66–74, 80, 96, 116. |

São áreas de trabalho, não novos produtos independentes. Expor atalhos à mesma operação nas fichas; não duplicar peças, formulários ou controle de assinatura em cada área.

### 5.2 Tipografia, dimensões e paginação

Preservar fonte/componentes do CeleriFlow quando consistentes. Na ausência de padrão, usar família de sistema com preferência por Segoe UI e alternativas sans-serif. **Parâmetros herdados dos MDs anteriores, não dimensões do TR:** título 20/26 px, seção 16/22 px, texto operacional 14/20 px, metadados secundários 12/16 px; peso 400 para corpo e 600 para títulos/cabeçalhos. Tokens em `rem`, sem reduzir tamanho raiz do ERP. No celular, campos com referência 16 px e controles confortáveis. Não baixar/distribuir fontes ou trocar framework visual.

Linhas/controles com altura mínima de referência 36 px no desktop e 44 px no toque; espaços de 4/8/12/16/24 px. Usar mínimos flexíveis, não alturas que cortem texto. Texto à esquerda; números à direita; estados com rótulo e cor, foco visível, erros persistentes/acionáveis e contraste legível. Não usar emojis ou ícones sem rótulo como ação essencial.

Listagens: **título/contexto + busca/filtros + tabela + paginação/ações**. Começar com até 10 registros, reduzindo conforme área disponível. Paginação/total/ordenação no servidor e busca sobre todo conjunto autorizado. Desempate estável; mudança de filtro volta à primeira página; abrir ficha/retornar preserva contexto. Nenhum “1–10 de 23” pode ser contador fictício.

Lotes indicam quais processos foram selecionados, inclusive entre páginas. Impressão e exportação abrangem todo o recorte, não somente a primeira página. Registros de outras páginas continuam sujeitos à validação e às permissões. Relatório distingue total do recorte e subtotal da página.

### 5.3 Exceções necessárias à tela sem rolagem

Priorizar ausência de rolagem global nas listagens de desktop; não ocultar campos, ações ou documentos por CSS para aparentar que tudo cabe. Reduzir linhas e reorganizar colunas antes de reduzir legibilidade. Texto longo, leitura de PDF, formulários extensos, diagrama e zoom têm regiões de leitura/navegação acessíveis. Evitar múltiplas barras aninhadas.

**PED-111 pede o documento ao lado dos campos extraídos:** reservar tela de revisão com imagem à esquerda, campos/revisão à direita, cabeçalho e confirmação acessíveis. Permitir zoom/pan e leitura interna do documento sem truncar campos. No desktop de referência, comprovar disposição lado a lado; no celular pode haver alternância/empilhamento responsivo, sem usar a versão estreita como única evidência do item.

Em formulário com abas, salvar valida todas as seções; erro aponta a aba/campo. Troca de aba não perde dados. Em fluxo, ação principal mostra destino calculado e efeito; não exigir seleção manual do próximo setor para um caminho já definido. Digitar parecer, assinar, tramitar, concluir e arquivar são ações diferentes, com rótulos claros.

### 5.4 Ensaios de interface e desempenho

Testar viewport CSS **1366×650, 1440×800 e 1920×900**, além do equipamento real da apresentação; testar zoom/texto a 200%, largura de referência 320 CSS px e Chrome em celular real. Conteúdo continua acessível com rolagem quando necessário, sem outro app. Foco/teclado deve alcançar filtros, paginação, peças, confirmações e erros; não depender só de hover.

Metas iniciais de projeto herdadas: retorno visual de processamento em até 200 ms e consulta paginada em até 1,5 s no percentil 95, registrando amostra, rede, volume e ambiente. **Não são exigências do TR nem desempenho medido.** Digitalização, OCR, assinatura e exportações extensas mostram progresso/estado real; não declarar sucesso antes de concluir para aparentar rapidez. Não criar infraestrutura adicional por suposição; medir gargalos e otimizar consultas/renderização pertinentes.

<a id="base"></a>
## 6. Base fictícia de testes — cenários independentes e resultados conferíveis

### 6.1 Identidades, assuntos e documentos

Ambiente marcado **POC — dados fictícios**; nomes, datas, fluxos e classificações a seguir não representam atos reais da Prefeitura. População pelas telas ou fixtures isoladas/seguras de teste, sem importador novo nem desativação de validadores de produção. Usuário preparará os dados de origem de outros módulos. Documentos e imagens de teste identificados como demonstração antes de eventual assinatura.

| Referência | Registro de teste | Uso |
|---|---|---|
| ORG-A / ORG-B | Dois órgãos demonstrativos da mesma municipalidade | Tramitação interórgãos sem vazar para outro município. |
| S-PROT / S-TEC / S-DEC / S-ARQ | Protocolo, Análise, Decisão e Arquivo DEMO | Caixas, responsabilidades, prazos e arquivo. |
| U-PROT / U-TEC / U-DEC | Usuários internos DEMO | Abertura, recebimento/análise e decisão autorizada. |
| EXT-A / EXT-B / EXT-PJ | Dois cidadãos e pessoa jurídica DEMO | Autocadastro, isolamento de requerente e envio externo. |
| AUD-A / SIG-A / SIG-B | Auditor e dois signatários de teste | Compartilhamento e assinaturas; sem acesso geral implícito. |
| ASS-A / ASS-B / ASS-C | Solicitação administrativa, Pedido documental e Manifestação DEMO | Assuntos, campos/documentos, relatórios e fluxo. |
| ESP-REQ / ESP-OF | Requerimento e Ofício DEMO | Espécies de processo e sequências. |
| DOC-REQ / DOC-PAR / DOC-COMP | Documento inicial, parecer e complemento DEMO | Espécies documentais, tamanho/formato e modelos. |
| CX-EXT / CX-AUD / CX-SIG | Caixas reais controladas para ensaio | Substituir por endereços autorizados; não são endereços fornecidos aqui. |

### 6.2 F-PROT — cadastro, comprovantes, envio e recebimento

Configurar sequência de teste de 2026 / externo / ESP-REQ a partir de 1001. Criar P-A com assunto ASS-A, EXT-A, descrição e prioridade Normal; número de teste esperado **1001/2026** conforme máscara configurada. Segunda solicitação distinta recebe 1002; repetição técnica da primeira não gera 1003. Outra espécie/ano tem sequência própria conforme parametrização, sem alterar números anteriores.

P-A: inclusão → comprovante e termo de autuação → envio de S-PROT a S-TEC → recebimento por U-TEC → parecer/providências → encaminhamento previsto → conclusão autorizada → arquivamento com termo/local/data-limite. Usar horários controlados nos testes; confirmar as duas identidades e timestamps do envio/recebimento. E-mails conduzem ao comprovante e ao histórico correto.

Cenários independentes **P-CANCEL** e **P-REJ**: um envio cancelado pelo remetente antes do recebimento; outro rejeitado no estado Enviado pelo destinatário, com justificativa. Testar corrida entre receber e cancelar/rejeitar. Não continuar F-PROT depois de cancelar seu único envio sem registrar nova operação.

### 6.3 F-FORM/FLUXO — tipos de campo, roteamento, atraso e versão

Criar formulário com sete tipos: descrição discursiva; objetiva única “Precisa análise técnica? Sim/Não”; objetiva múltipla de documentos; data; hora; quantidade numérica; dropdown de setores permitidos da tabela compartilhada. Não substituir dropdown por lista fixa de texto. ASS-A usa fluxo **Triagem → Análise → Decisão**, com ramificação “Não” que vai da Triagem à Decisão; enquete de teste também pode alimentar condição configurada.

Ensaio de tempo: atividade começa em **18/09/2026 às 09h**, prazo de **2 horas corridas de teste**, vencendo às 11h. Às 12h está 1h atrasada. Com exigência ativada, tentar avançar sem justificar; registrar justificativa e novo prazo às 15h. Concluir às 14h: duração total 5h, prazo original preservado e motivo consultável. Não apresentar o novo prazo como se nunca tivesse havido atraso.

**F-VERSAO:** dois processos em andamento no fluxo v1. Alterar prazo futuro de Decisão de 2h para 3h e aplicar v2 aos processos compatíveis. Verificar atualização automática das atividades pendentes; histórico concluído continua v1. Em terceiro processo, testar remoção de atividade atual sem mapeamento: aplicação deve apontar incompatibilidade, não criar avanço silencioso. Duas sessões acompanham responsável/atividade/situação sem F5.

**F-SUBFLUXO:** dois procedimentos chamam o mesmo modelo auxiliar “Conferência documental DEMO”. São duas instâncias independentes. Responder/concluir uma não conclui a outra; retorno segue o processo pai correto.

### 6.4 F-DOC — peças, folhas, assinaturas e integridade

Usar processo isolado para foliação. Montar três peças: documento produzido de **2 páginas**, digitalização de **3 páginas**, documento externo de **1 página**. A peça de teste inclui o número do processo na representação apropriada. Juntar nessa ordem: folhas **1–2, 3–5 e 6**. Acrescentar peça de **2 páginas** durante andamento: folhas **7–8**. Os documentos automáticos eventualmente existentes nesse processo também contam; preparar o cenário explicitamente sem outras peças ou registrar o deslocamento inicial H e conferir H+1 a H+8. Não ocultar termo de autuação para fazer a conta fechar.

Outro cenário com **13 peças** testa paginação e download integral. Comparar índice, primeira/última peça e arquivo efetivo. Testar nome fora de ordem alfabética e duas juntadas concorrentes; ordem é de inserção confirmada. Modelos de termo de autuação, encaminhamento, encerramento, apensação, anexação e abertura/encerramento de volume são documentos distintos.

Assinar documento de teste de duas páginas com SIG-A, depois SIG-B, usando credenciais/ambiente adequados. Conferir os dois no mesmo documento final e a preservação da primeira assinatura. Solicitar a segunda por e-mail e verificar estados pendente/parcial/assinado conforme conjunto requerido. Assinar também um registro de tramitação, anexo e documento digitalizado. Não regravar os bytes já assinados para incluir foliação; executar o caso Q-03 de representação derivada separadamente.

### 6.5 F-ACESSO/OUV/FISCAL — públicos e conteúdos separados

Criar **P-PUB** com dados expressamente liberados para consulta sem login; **P-SIG-A** com sigilo e EXT-A; **P-SIG-B** com EXT-B. Consultar P-PUB sem senha; EXT-B não lê peças privadas de A por URL, chave, busca, exportação ou link antigo. Alterar sigilo em fase inicial e durante andamento usando usuário permitido; testar texto público e privado no mesmo histórico conforme regra de visibilidade.

Registrar **OUV-ANON** sem nome, CPF, e-mail ou login e obter protocolo. Tramitar e encerrar pelo atendimento autorizado. Registrar outra manifestação identificada por canal normal. Não capturar dados pessoais obrigatórios em etapa posterior para viabilizar o anonimato; metadados técnicos de segurança devem seguir política do núcleo e não ser apresentados como identidade civil do manifestante.

**F-FISCAL:** preparar, na origem competente ou como documentos de demonstração claramente identificados, seis tipos citados: termo de início de ação fiscal; auto de infração; notificação de lançamento de impostos/taxas; notificação; alvará de funcionamento; alvará de construção. Encaminhar eletronicamente ao contribuinte de teste. Receber e apresentar contestação com peça ligada ao processo. O teste comprova participação/recebimento/contestação, não lançamento tributário ou emissão técnica dos atos pelo módulo de Processos.

### 6.6 F-LOTES/CRONO/ARQ — conjuntos e ações

Lote de **12 processos**, com paginação de até 10: selecionar e enviar os 12; receber os 12 e verificar 12 resultados, não somente dez. Caso negativo: 11 válidos e 1 já recebido/sem permissão. Conforme política adotada, impedir o lote e explicar a falha, ou retornar resultados individuais de sucesso/falha; nunca declarar 12 recebidos quando apenas 11 tiveram efeito.

Cronograma com **3 atividades**; gerar processo a partir da segunda: há exatamente 1 processo relacionado a ela. Repetir comando não cria outro; concluir providência pelo processo e conferir a mesma informação no cronograma. A primeira e a terceira permanecem sem processo até ação própria.

Arquivo: local **Sala Arquivo DEMO / Estante A / Caixa 01**, classificação **CLASS-DEMO, sem valor normativo**, guarda temporária demonstrativa e data-limite escolhida. Encerrar informando data/local/situação e gerar termo; arquivar no setor autorizado; desarquivar com permissão e reativar. Nenhum vencimento provoca eliminação automática. Confirmar classificação/tabela reais em Q-02.

### 6.7 F-GESTAO/MIN — totais e mineração observada

**Relatórios/paginação:** base isolada de **23 processos abertos em setembro de 2026**: ASS-A 10, ASS-B 8, ASS-C 5. Acrescentar 1 registro de agosto e 1 de outubro fora desse recorte. Consulta de setembro gera 23; páginas 10/10/3; gráfico e exportação mostram 10/8/5. Drill-down em ASS-B retorna exatamente 8, e cada linha abre o processo correto. Testar limites 01/09 e 30/09.

**Mineração:** outra base, com 6 casos concluídos e eventos cronológicos sem intervalos de espera adicionais para a conta abaixo. Os valores são durações de atividades em horas, não percentuais legais ou metas da prefeitura.

| Caso | Sequência observada | Horas em Análise | Duração total |
|---|---|---:|---:|
| MIN-1 | Triagem 1 → Análise 4 → Decisão 1 | 4 | 6 h |
| MIN-2 | Triagem 1 → Análise 6 → Decisão 1 | 6 | 8 h |
| MIN-3 | Triagem 1 → Análise 8 → Decisão 1 | 8 | 10 h |
| MIN-4 | Triagem 1 → Análise 10 → Decisão 1 | 10 | 12 h |
| MIN-5 | Triagem 1 → Análise 12 → Decisão 1 | 12 | 14 h |
| MIN-6 | Triagem 1 → Análise 3 → Complemento 2 → Análise 5 → Decisão 1 | 8 | 12 h |

Resultados de conferência: **2 variantes**, sendo a primeira com **5 casos** e a segunda com **1**; **7 ocorrências de Análise**, somando **48 h**; Triagem **6 h**, Decisão **6 h**, Complemento **2 h**; total de duração dos casos **62 h**, média **10 h e 20 min**. A média de Análise por ocorrência é 48/7 h; não confundir com 48/6 h por caso. Apontar Análise como maior concentração de tempo **nesta amostra**, com drill-down aos eventos. Não gerar esses valores fixos no relatório. Em teste separado com intervalos, distinguir duração de execução e espera.

### 6.8 F-CAPTURA/OCR/DEST — extração real e proveniência

Preparar dois modelos de teste: **MOD-REQ** (referência, interessado de demonstração, data e quantidade) e **MOD-OF** (referência do ofício, setor e data). Imagens/páginas com valores legíveis conhecidos: REQ-DEMO-01, quantidade 12; REQ-DEMO-02, quantidade 8; OF-DEMO-01, setor S-TEC. As duas quantidades de requerimento somam **20** após revisão; o ofício não é incluído como requerimento.

Digitalizar lote de 3 documentos pelo dispositivo/serviço efetivo; selecionar driver, testar duas resoluções suportadas e posição/orientação disponível. Valores como 200/300 DPI são exemplos de ensaio **somente se o dispositivo suportar**, não obrigação normativa. Registrar páginas, parâmetros e resultados reais da captura. Upload dos arquivos resultantes é apoio, não substituto da prova do driver.

Executar extração nas imagens sem camada textual usando motor configurado e idioma suportado; identificar componente neural. Mapear campos aos modelos, revisar lado a lado e confirmar. Usar uma imagem propositalmente degradada para registrar correção humana quando necessária; erro humano/extração bruto ficam preservados. Não forçar artificialmente que o OCR erre nem alegar taxa fixa de acerto.

Pesquisar MOD-REQ: 2 registros e quantidade 20; MOD-OF: 1 registro. Mostrar estrutura/campos e imprimir. Exportar CSV e TXT, ler os arquivos, conferir acentos, aspas e contagem. Em base externa de homologação pré-configurada/autorizada, exportar as 3 origens e reexecutar sem duplicação: permanecem 3 registros válidos conforme contrato; falta de credencial não deve gerar “exportado”. Não gravar em base de produção.

### 6.9 F-URA e documentação de modelagem

Com URA/contrato identificados, realizar atendimento de teste que produza evento de abertura de processo. Verificar 1 evento legítimo → 1 processo e vínculo ao atendimento; replay do evento não duplica. Envio manual de JSON pode testar o receptor, mas é **teste de contrato**, não evidência de chamada telefônica ou conexão com URA. Sem serviço, manter PED-033 pendente.

Para Modelagem de Fluxos, produzir com os fluxos configurados um pacote de referência: propósito/escopo; diagrama; atividades/responsáveis; entrada/saída/documentos; regras de decisão; prazos; formulários; versões/alterações; como executar e demonstrar; pontos de melhoria com evidência. Esse pacote deve refletir o ambiente ensaiado, não ser um PDF genérico ou mera cópia deste MD. Quantidade oficial de procedimentos e parâmetros reais são Q-10.

Antes de repetir cenários que alteram situação, usar base isolada restaurável ou novos registros com referência própria. Não apagar histórico de produção nem misturar F-GESTAO/MIN/LOTES aos totais do cenário principal.

<a id="itens"></a>
## 7. Desenvolvimento item a item

**TR** é fonte literal; **Implementação**, **Demonstração**, **Aceite técnico**, **Dados de outro módulo / serviço compartilhado** e **Atenção / limite** são instruções de desenvolvimento/ensaio. Cada item possui orientação própria; referências a contratos/cenários evitam duplicar código, não dispensam o teste de suas partes.

<a id="ped-001"></a>
### PED-001 — Registro e ciclo completo de processo/documento

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 1, p. 54:**

> Possibilitar o registro de qualquer tipo de processo/documento, com controle do seu recebimento, envio e tramitação, até seu encerramento, fornecendo informações rápidas e confiáveis;

**Implementação:** Implementar cadastro configurável de processos e documentos, com identificação, tipo/espécie, assunto, interessado e percurso de recebimento, envio, tramitação e encerramento. Usar a mesma ficha e trilha de eventos; tipos distintos não podem depender de novas telas codificadas para cada assunto. Distinguir processo de documento avulso/peça conforme o modelo atual.

**Dados de outro módulo / serviço compartilhado:** DEP-01/02: órgão, setores e pessoas. DEP-03: arquivo/documento quando compartilhado. Cadastro, ciclo e vínculos processuais são deste módulo, não dependência a excluir.

**Demonstração:** Em F-PROT, registrar um requerimento externo e um documento/ofício interno, encaminhar, receber e encerrar pelo fluxo autorizado. Reabrir suas fichas e percorrer os eventos.

**Aceite técnico:** Os dois objetos têm registros persistidos e histórico do início ao encerramento, com situação atual coerente e sem usar edição livre de status como substituto das operações.

**Atenção / limite:** Não interpretar “qualquer tipo” como obrigação de criar regras fiscais, jurídicas ou de todos os módulos setoriais. A parametrização viabiliza os tipos fornecidos.

<a id="ped-002"></a>
### PED-002 — Campos mínimos do cadastro de processos

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 2, p. 54:**

> Permitir que o usuário cadastre os diversos processos, contendo no mínimo: número, ano, data de abertura, tipo (interno ou externo), espécie de processo, assunto, interessado e descrição;

**Implementação:** Disponibilizar número, ano, data de abertura, tipo interno/externo, espécie, assunto, interessado e descrição em campos próprios. Gerar número/ano e data pelo procedimento configurado quando adequado; permitir seleção dos cadastros já existentes. Validação no servidor deve identificar campo faltante, não preencher informação fictícia.

**Dados de outro módulo / serviço compartilhado:** DEP-02: interessado e contatos; DEP-01: usuário e órgão. Tipos/espécies/assuntos são parâmetros próprios do processo.

**Demonstração:** Criar P-A, conferir os oito componentes, salvar e reabrir. Criar um processo interno e comparar o tipo. Testar omissão de assunto e espécie. Manifestação anônima usa exclusivamente a exceção de PED-068.

**Aceite técnico:** Todos os componentes da frase estão disponíveis e persistidos; número não colide sob concorrência e o formulário não aceita registro incompleto como protocolado.

**Atenção / limite:** Não fundir espécie e assunto. A compatibilização do interessado obrigatório com anonimato está em Q-01; não desabilitar validação para todos os processos.

<a id="ped-003"></a>
### PED-003 — Palavras-chave pesquisáveis

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 3, p. 54:**

> Permitir o registro de palavra-chave para facilitar a pesquisa dos processos;

**Implementação:** Permitir registrar uma ou mais palavras-chave relacionadas ao processo, editar conforme permissão e pesquisar por elas no conjunto autorizado. Armazenar a relação ou campo estruturado conforme a arquitetura, sem duplicar o cadastro de assunto.

**Dados de outro módulo / serviço compartilhado:** Sem dado setorial externo obrigatório. DEP-01 aplica escopo/usuário; a pesquisa usa os próprios processos.

**Demonstração:** Vincular “acessibilidade” e “rampa” a P-A; buscar cada termo a partir da lista, inclusive quando o processo estaria em outra página. Editar uma palavra e reconsultar.

**Aceite técnico:** As palavras persistem e permitem recuperar o processo correto; não são apenas etiquetas visuais sem participação na pesquisa.

**Atenção / limite:** Não acrescentar busca semântica por IA, taxonomia oficial ou indexador paralelo por este item.

<a id="ped-004"></a>
### PED-004 — Prioridade Baixa, Normal e Alta

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 4, p. 54:**

> Possibilitar informar a prioridade do processo: Baixa; Normal; Alta.;

**Implementação:** Oferecer as três prioridades da fonte em campo estruturado, com rótulo legível nas fichas/listas pertinentes. Alteração autorizada registra ator/data; não confundir prioridade com prazo, situação ou permissão de conclusão.

**Dados de outro módulo / serviço compartilhado:** DEP-01: permissão e autoria. Valor pertence ao processo.

**Demonstração:** Criar três processos, um em cada prioridade; reabrir, alterar Normal para Alta e verificar a atualização na consulta e na auditoria.

**Aceite técnico:** Baixa, Normal e Alta são selecionáveis e persistidas. A prioridade não é somente cor nem muda automaticamente uma decisão administrativa.

**Atenção / limite:** Não criar classificação automática de urgência, SLA legal ou novas prioridades obrigatórias não descritas.

<a id="ped-005"></a>
### PED-005 — Registro e consulta por departamento responsável

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 5, p. 54:**

> Possibilitar que cada departamento registre ou consulte os processos sob sua responsabilidade;

**Implementação:** Aplicar vínculo do processo com departamento/caixa responsável e permissões de registro/consulta. Utilizar a origem/destino do trâmite para atualizar a responsabilidade pertinente, preservando acesso histórico apenas se autorizado. Filtrar no servidor, também em relatórios e buscas.

**Dados de outro módulo / serviço compartilhado:** DEP-01: departamentos, setores e permissões. Responsabilidade da instância e caixas são deste módulo.

**Demonstração:** U-PROT registra P-A e o encaminha a S-TEC; U-TEC consulta o recebido. Um usuário de setor não autorizado tenta abrir diretamente a ficha e o relatório.

**Aceite técnico:** Cada departamento acessa os processos sob sua responsabilidade conforme autorização; URL direta não contorna o escopo e a tramitação não gera uma cópia independente.

**Atenção / limite:** “Sob responsabilidade” deve ser mapeado à regra administrativa em Q-10; não liberar todos os processos a qualquer servidor.

<a id="ped-006"></a>
### PED-006 — Informações essenciais e validação

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 6, p. 54:**

> Garantir a obrigatoriedade de informações essenciais, facilitando a identificação e classificação do processo;

**Implementação:** Configurar/verificar campos essenciais do cadastro e exigências por assunto, com validação de tipo e obrigatoriedade no formulário e no servidor. Distinguir salvar rascunho de protocolar; um rascunho incompleto não recebe evidência de protocolo concluído.

**Dados de outro módulo / serviço compartilhado:** DEP-01/02 para identificações existentes; matriz de exigências do assunto e validações pertencem a Processos.

**Demonstração:** Tentar protocolar sem espécie, assunto ou descrição exigida; mostrar os erros. Completar e protocolar. Repetir a tentativa inválida pela API e testar o canal anônimo sem exigir dados pessoais.

**Aceite técnico:** O registro completo é identificável/classificável e os erros apontam campos faltantes. Não há preenchimento silencioso com dados inventados.

**Atenção / limite:** Os campos da fixture não viram exigências administrativas novas. A exceção de anonimato deve respeitar Q-01 e PED-068.

<a id="ped-007"></a>
### PED-007 — Comprovante de protocolização na inclusão

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 7, p. 54:**

> Fornecer comprovante de protocolização para o interessado no momento da inclusão do processo;

**Implementação:** Gerar comprovante ligado ao processo no ato da inclusão confirmada, usando número, data, interessado/situação de anonimato e dados pertinentes. Disponibilizar imediatamente para visualização/emissão; reenvio da criação recupera o mesmo protocolo, não nova numeração.

**Dados de outro módulo / serviço compartilhado:** DEP-03: geração/visualização; DEP-02: dados do interessado. A criação automática e vínculo são deste módulo.

**Demonstração:** Concluir P-A e abrir seu comprovante sem outra solicitação manual. Conferir número, data e assunto; repetir a requisição técnica e verificar o mesmo processo/comprovante.

**Aceite técnico:** O interessado consegue obter comprovante do registro efetivo. Falha na criação não produz comprovante de processo inexistente.

**Atenção / limite:** Não usar PDF previamente preenchido ou emissão avulsa desconectada da inclusão. Não confundir comprovante com termo de autuação.

<a id="ped-008"></a>
### PED-008 — E-mail de abertura com comprovante e andamento

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 8, pp. 54–55:**

> No ato da abertura, deve possibilitar o envio de dados do processo por e-mail, incluindo um link para acesso ao Comprovante de Protocolização e ao Histórico de Andamento;

**Implementação:** Após confirmar abertura, disparar e-mail ao interessado com dados do processo e acesso funcional ao comprovante e ao histórico de andamento. Um endereço de entrada pode oferecer ambos, desde que sejam encontráveis. Aplicar permissões no destino e idempotência por evento/destinatário.

**Dados de outro módulo / serviço compartilhado:** DEP-05: envio de e-mail; DEP-02: endereço; DEP-03: comprovante. Dados e histórico são do processo.

**Demonstração:** Protocolar P-A com caixa controlada CX-EXT; receber a mensagem e abrir comprovante e histórico. Fazer novo trâmite e consultar o histórico pelo mesmo acesso. Reenviar o evento técnico.

**Aceite técnico:** Mensagem é recebida, contém identificação correta e permite acessar os dois conteúdos autorizados. Repetição não gera novo processo ou mensagens indevidamente duplicadas.

**Atenção / limite:** Compartilha implementação com PED-086. Sem serviço/caixa de teste, registrar pendência de envio; não exigir e-mail para manifestação anônima.

<a id="ped-009"></a>
### PED-009 — E-mail automático em qualquer fase

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 9, p. 55:**

> Possibilitar o envio automático de e-mail para o interessado, em qualquer fase do processo;

**Implementação:** Permitir associar envio automático aos eventos/fases configurados, sem limitar ao início ou fim. Resolver destinatário, mensagem e links com a situação persistida; usar o serviço comum de e-mail e registrar resultado/falha. A configuração não cria novas fases obrigatórias.

**Dados de outro módulo / serviço compartilhado:** DEP-05: e-mail/tarefa; DEP-02: contatos. Eventos e configuração por fase são de Processos.

**Demonstração:** Configurar avisos em Triagem, Análise e Decisão de teste; provocar cada transição e verificar recebimento correspondente. Simular falha de envio sem desfazer o processo.

**Aceite técnico:** O automatismo pode ser usado em qualquer fase configurada e mensagens refletem eventos reais. Falha fica identificada; log local não é prova de entrega externa.

**Atenção / limite:** “Qualquer fase” é capacidade configurável, não envio compulsório de todo comentário a todos. Política de destinatários/ambiente em Q-13.

<a id="ped-010"></a>
### PED-010 — Ator e data/hora do envio e recebimento

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 10, p. 55:**

> Registrar a data/hora e nome do usuário que promoveu o envio e recebimento do processo durante as tramitações;

**Implementação:** Persistir separadamente data/hora e identidade do usuário de envio e de recebimento, com referência ao mesmo trâmite. Usar relógio/controlador do servidor e preservar o nome/identidade histórica pertinente. Um recebimento não pode sobrescrever o ator do envio.

**Dados de outro módulo / serviço compartilhado:** DEP-01: identidade do usuário. Eventos de envio/recebimento são internos ao módulo.

**Demonstração:** U-PROT envia às 09h e U-TEC recebe às 10h no ensaio controlado. Reabrir histórico e comprovante; repetir recebimento e verificar ausência de evento duplicado.

**Aceite técnico:** Os dois momentos e dois usuários são recuperáveis e correspondem ao trâmite. Nenhum campo de recebimento é preenchido antes de receber.

**Atenção / limite:** Horários exemplificativos são fixtures; não permitir ao usuário comum reescrever timestamp técnico para parecer pontual.

<a id="ped-011"></a>
### PED-011 — Termo de autuação automático

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 11, p. 55:**

> Emitir o termo de autuação de forma automatizada após o registro de cada processo eletrônico;

**Implementação:** Gerar o termo de autuação de cada processo eletrônico registrado a partir de modelo e dados reais. Associá-lo ao processo/peças conforme procedimento, com referência de geração única. Se geração for assíncrona, manter pendência visível até o documento existir.

**Dados de outro módulo / serviço compartilhado:** DEP-03: modelo, geração e arquivo. Regra e vínculo automático pertencem a Processos.

**Demonstração:** Criar dois processos eletrônicos e abrir o termo de cada um, com números distintos. Reexecutar o evento de geração e conferir que o primeiro não recebe termo duplicado.

**Aceite técnico:** Cada processo tem termo efetivamente emitido após seu registro; é abrível e identificado, não somente campo “autuado”.

**Atenção / limite:** Conteúdo do termo depende do modelo fornecido; não inventar assinatura automática de autoridade nem confundir com comprovante de protocolo.

<a id="ped-012"></a>
### PED-012 — Parecer e histórico de trâmite sem limite funcional de caracteres

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 12, p. 55:**

> Permitir registrar os pareceres sobre o processo e histórico de cada trâmite sem limite de caracteres;

**Implementação:** Usar campos próprios de texto longo para parecer e registro textual do trâmite, sem limites arbitrários em UI, API ou persistência. Permitir consulta/edição autorizada com histórico e leitura integral. Preservar o texto original de eventos finalizados por política de versão, não truncá-lo em relatórios.

**Dados de outro módulo / serviço compartilhado:** DEP-03: editor/geração quando compartilhados. Conteúdo e vínculo processual são deste módulo.

**Demonstração:** Salvar parecer e texto de um trâmite com aproximadamente 20 mil caracteres e frases distintas no final. Reabrir os dois e emitir o histórico detalhado, conferindo as frases.

**Aceite técnico:** Ambos os conteúdos são recuperados integralmente. A tabela pode abreviar visualmente com acesso ao detalhe, mas o valor persistido/documento não é cortado.

**Atenção / limite:** O tamanho de teste não é limite do TR. Não prometer armazenamento infinito nem remover segurança de entrada para aceitar texto longo.

<a id="ped-013"></a>
### PED-013 — Anexação ou digitalização de documentos/imagens

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 13, p. 55:**

> Permitir a anexação ou digitalização de documentos ou imagens ao protocolo;

**Implementação:** Permitir anexar documentos/imagens ao protocolo e utilizar a captura disponível quando esse for o caminho adotado. Criar peça vinculada com arquivo real e metadados; falha de upload/captura não aparece como anexo entregue. Compartilhar a mesma juntada dos itens 44/102.

**Dados de outro módulo / serviço compartilhado:** DEP-03: armazenamento/visualizador; DEP-09 para captura física, quando usada.

**Demonstração:** Anexar PDF e imagem a P-A, sair e reabrir os conteúdos. Pelo conector de captura, quando configurado, juntar uma página digitalizada ao mesmo protocolo.

**Aceite técnico:** Arquivos pertencem ao processo correto e têm conteúdo recuperável. A ação atende ao caminho efetivamente demonstrado, sem trocar upload por digitalização inexistente.

**Atenção / limite:** O item usa “ou”; sua evidência não dispensa driver/DPI e digitalização em lote exigidos separadamente em 117/121.

<a id="ped-014"></a>
### PED-014 — Cancelamento de envio ainda não recebido

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 14, p. 55:**

> Possibilitar o cancelamento de trâmites de processos que foram remetidos, porém ainda não foi confirmado o recebimento;

**Implementação:** Disponibilizar cancelamento ao remetente autorizado apenas enquanto o trâmite estiver enviado e sem recebimento confirmado. Registrar justificativa técnica/administrativa conforme padrão, ator e momento, mantendo evento original. Restaurar a posição de trabalho coerente e emitir novo envio somente por operação própria.

**Dados de outro módulo / serviço compartilhado:** DEP-01: usuário/caixa. Estado e operação são próprios de Processos.

**Demonstração:** Em P-CANCEL, enviar e cancelar antes do recebimento; mostrar saída da pendência do destinatário. Em outro envio já recebido, tentar a mesma ação. Testar corrida com recebimento.

**Aceite técnico:** Cancelamento válido tem efeito e histórico; envio recebido não é apagado/cancelado por esse caminho. Na concorrência, apenas uma transição vence.

**Atenção / limite:** Não confundir com rejeição do destinatário (52) nem cancelamento integral do processo. Mapeamento de posse em Q-10.

<a id="ped-015"></a>
### PED-015 — Formulários dinâmicos com sete tipos de resposta

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 15, p. 55:**

> Possibilitar a criação de formulários dinâmicos, onde o próprio usuário poderá criar suas perguntas e respostas, sendo as mesmas do tipo: discursiva, objetiva única, objetiva múltipla, data, hora, numérica, dropdow (consulta de outras tabelas);

**Implementação:** Permitir ao usuário autorizado montar perguntas e configurar respostas discursiva, objetiva única, objetiva múltipla, data, hora, numérica e dropdown por consulta de outra tabela. Salvar definição/versão, validar tipos/obrigatoriedade e guardar respostas ligadas ao processo. As fontes do dropdown são cadastradas/permitidas, sem SQL livre.

**Dados de outro módulo / serviço compartilhado:** DEP-01 e fontes específicas do dropdown; indicar módulo/tabela lógica/campos utilizados. Modelagem e respostas são de Processos.

**Demonstração:** Criar F-FORM com os sete tipos, preencher pelo operador, salvar e reabrir. Alterar opções do modelo para novo ensaio sem reescrever resposta anterior; testar valor numérico inválido e dropdown de setor não autorizado.

**Aceite técnico:** Todos os sete tipos funcionam e o dropdown consulta dados reais permitidos, não lista decorativa. O próprio usuário monta o formulário sem alterar código para cada pergunta.

**Atenção / limite:** Não transformar em gerador universal de aplicações. Nenhum tipo listado pode ser omitido por já existir formulário simples.

<a id="ped-016"></a>
### PED-016 — Respostas de formulário direcionam atividades

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 16, p. 55:**

> Possibilitar a utilização de formulários dinâmicos para direcionamento de atividades de fluxo;

**Implementação:** Associar respostas tipadas às condições de saída do fluxo, com destinos definidos e regras avaliadas no servidor. Conservar resposta/versão que fundamentou a decisão. Usar o formulário de PED-015 e o motor de fluxo, sem duplicar perguntas em código.

**Dados de outro módulo / serviço compartilhado:** Dados do formulário/fluxo são próprios; DEP-01 fornece os responsáveis/setores permitidos.

**Demonstração:** No F-FORM, resposta Sim conduz à Análise; Não conduz à Decisão. Criar duas instâncias e verificar atividades e caixas diferentes, sem o operador escolher manualmente o destino.

**Aceite técnico:** O valor respondido determina a atividade correta segundo a regra configurada e o histórico explica a decisão. Resposta ausente obrigatória não assume destino aleatório.

**Atenção / limite:** Automatizar encaminhamento não autoriza deferimento jurídico por IA. Regras oficiais ainda precisam de configuração administrativa.

<a id="ped-017"></a>
### PED-017 — Atividade associada à tela de trabalho

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 17, p. 55:**

> Possibilitar na definição de atividades mediante fluxo de trabalho a definição e atividade por tela de trabalho otimizando as ações;

**Implementação:** Na definição de atividade, vincular a tela/formulário e as ações pertinentes usando componentes existentes. Ao abrir a tarefa, carregar processo, campos, documentos e comandos dessa atividade sem repetir busca ou dados. Registrar a correspondência atividade–tela, respeitando acesso.

**Dados de outro módulo / serviço compartilhado:** DEP-03: componentes documentais se usados; DEP-01: permissões. Associação atividade/tela pertence ao módulo.

**Demonstração:** Configurar Triagem com F-FORM e Análise com parecer/providências. Abrir as duas tarefas e mostrar que cada uma apresenta a área adequada, com o mesmo processo preenchido.

**Aceite técnico:** A configuração resulta em tela operacional contextual e ações executáveis; não é somente um nome de menu gravado na atividade.

**Atenção / limite:** A redação do item é preservada; esta é a solução proposta, a confirmar em Q-10. Não criar um construtor visual de páginas arbitrárias.

<a id="ped-018"></a>
### PED-018 — Crítica de providências obrigatórias pendentes

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 18, p. 55:**

> Criticar sobre providências não concluídas e obrigatórias na tramitação do processo;

**Implementação:** Relacionar providências obrigatórias à atividade/transição e verificar sua conclusão no servidor antes do avanço. Mostrar pendência específica e local para resolvê-la. A regra de bloquear ou advertir é explícita; o ensaio usa bloqueio para uma providência obrigatória.

**Dados de outro módulo / serviço compartilhado:** DEP-03 quando a providência exige documento; dados de atividade e verificação são próprios.

**Demonstração:** Configurar “Parecer anexado” como providência obrigatória na Análise. Tentar tramitar sem cumprir; concluir a providência e repetir. Tentar contornar pela API.

**Aceite técnico:** Pendência é identificada e o avanço só ocorre segundo a regra configurada; marcar checkbox sem a evidência exigida não satisfaz a providência.

**Atenção / limite:** Não inferir indeferimento do processo nem adicionar uma lista normativa de providências não fornecida. Critérios administrativos em Q-10.

<a id="ped-019"></a>
### PED-019 — Conclusão, termo e arquivamento temporário

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 19, p. 55:**

> Possuir rotina de conclusão de processos com identificação da data, localização, situação final, termo de encerramento, permitir definir arquivamento temporário com controle de data limite conforme classificação CONARQ;

**Implementação:** Permitir concluir com data, localização, situação final e termo de encerramento. Parametrizar arquivamento temporário, classificação aplicável e data-limite, preservando vínculo à referência de temporalidade. Diferenciar encerrar da movimentação física/lógica de arquivar; usar o fluxo autorizado.

**Dados de outro módulo / serviço compartilhado:** DEP-12: classificação/temporalidade aprovada; DEP-03: termo. Rotina de conclusão/controle é deste módulo.

**Demonstração:** Em F-ARQ, concluir P-A, emitir o termo e registrar local/classificação de teste e data-limite. Consultar os campos e o vencimento de guarda; tentar encerrar em fase sem autorização.

**Aceite técnico:** Todas as partes do item são visíveis e persistidas; termo existe e o arquivo temporário tem data controlada. Nada é eliminado automaticamente ao vencer.

**Atenção / limite:** CLASS-DEMO não prova conformidade CONARQ. Obter tabela/regra aplicável em Q-02; não inventar código ou prazo legal.

<a id="ped-020"></a>
### PED-020 — Locais de arquivamento

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 20, p. 55:**

> Possibilitar o cadastramento de locais de arquivamento com informações que facilite a localização dos processos;

**Implementação:** Manter locais de arquivo com identificação e informação de localização suficiente, como sala/estante/caixa ou referência digital conforme padrão existente. Associar o local ao arquivamento e permitir pesquisa/reabertura; não usar apenas texto livre sem vínculo recuperável.

**Dados de outro módulo / serviço compartilhado:** DEP-01: estrutura organizacional quando usada; DEP-12 se o cadastro de locais já vier do Arquivo.

**Demonstração:** Cadastrar Sala Arquivo DEMO / Estante A / Caixa 01 e outro local. Arquivar processo no primeiro, consultar pela referência e distinguir do segundo.

**Aceite técnico:** Locais podem ser cadastrados, selecionados e recuperados; o processo arquivado conserva identificação de onde se encontra.

**Atenção / limite:** Não exigir RFID, planta predial, geolocalização ou gestão física de caixas além do cadastro pertinente.

<a id="ped-021"></a>
### PED-021 — Arquivamento no próprio setor

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 21, p. 55:**

> Possuir recurso para arquivar o processo no próprio setor, conforme definido no fluxo de trabalho;

**Implementação:** Configurar no fluxo a possibilidade de arquivar no setor atual e executar o arquivamento preservando localização, setor, ato e data. Não obrigar remessa a um arquivo central quando o procedimento permite guardar no setor.

**Dados de outro módulo / serviço compartilhado:** DEP-01: setor; DEP-12: regra/local quando compartilhados. Ato e vínculo ao fluxo são próprios.

**Demonstração:** Configurar o encerramento de ASS-B com arquivo no S-TEC. Concluir e arquivar ali; abrir histórico e localização sem criar envio fictício ao S-ARQ.

**Aceite técnico:** O processo é arquivado no próprio setor permitido e continua encontrável com sua localização. A opção respeita a definição do fluxo.

**Atenção / limite:** Não criar rito adicional de aprovação de arquivo. Regra de temporalidade segue Q-02, não é presumida pelo local.

<a id="ped-022"></a>
### PED-022 — Desarquivamento e reativação autorizados

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 22, pp. 55–56:**

> Permitir o desarquivamento para reativação do processo de acordo com permissões;

**Implementação:** Oferecer ação autorizada para desarquivar e reativar, registrando o evento e preservando encerramento/arquivamento anteriores. Definir a atividade/caixa de retorno pelo fluxo/procedimento; não apagar datas antigas nem criar novo número por padrão.

**Dados de outro módulo / serviço compartilhado:** DEP-01: permissões; DEP-12 quando o arquivo fornece estado/local. Retorno de fluxo é de Processos.

**Demonstração:** Desarquivar um processo de F-ARQ com usuário autorizado; abrir a atividade reativada. Tentar a mesma ação com conta de consulta e reabrir o histórico completo.

**Aceite técnico:** O processo volta a operação no mesmo identificador, com trilha de reativação. Usuário sem permissão não consegue executar por tela ou API.

**Atenção / limite:** Desarquivar não equivale a excluir termo anterior, remover peças ou alterar assinaturas. Atividade de retorno em Q-10.

<a id="ped-023"></a>
### PED-023 — Encerramento permitido por atividade/fase

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 23, p. 56:**

> Dispor de configuração para autorização do encerramento de processo poratividade e/ou fase de fluxo;

**Implementação:** Parametrizar quais atividades e/ou fases permitem encerramento, juntamente com a autorização de usuário. Checar ambas as condições no servidor. Não permitir que um botão de conclusão ignore providências obrigatórias ou fase atual.

**Dados de outro módulo / serviço compartilhado:** DEP-01 para perfil; atividades/fases/configuração são próprias do motor de Processos.

**Demonstração:** Permitir encerramento somente em Decisão para ASS-A; tentar em Triagem e por API. Avançar com requisitos cumpridos à fase autorizada e concluir.

**Aceite técnico:** A configuração tem efeito real: a fase inadequada recusa encerramento e a fase permitida o executa conforme perfil. Alteração de regra deixa histórico.

**Atenção / limite:** Não impor que todo assunto encerre na mesma fase. O “e/ou” não exige criar hierarquias novas se a arquitetura já atende.

<a id="ped-024"></a>
### PED-024 — Histórico de andamento com anexos

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 24, p. 56:**

> Possuir relatório de histórico de andamento dos documentos e processos relacionando anexos existentes;

**Implementação:** Gerar relatório de histórico de documentos/processos com eventos, datas, responsáveis e relação dos anexos existentes, respeitando escopo. Usar a mesma fonte da ficha e permitir abrir/identificar cada peça autorizada. Não listar arquivo pendente como já juntado.

**Dados de outro módulo / serviço compartilhado:** DEP-03: arquivos e geração; DEP-01: escopo. Eventos/associações são deste módulo.

**Demonstração:** Após F-PROT/F-DOC, emitir histórico do processo e de um documento acompanhado; conferir trâmites e todas as peças, inclusive a última de outra página.

**Aceite técnico:** O relatório concilia eventos e anexos com os registros reais, inclui o conjunto inteiro do filtro e é imprimível/gerado pelo núcleo.

**Atenção / limite:** Não substituir o relatório por screenshot da página atual nem divulgar textos/peças privados a quem só possui acesso público.

<a id="ped-025"></a>
### PED-025 — Sequência de numeração por ano, tipo e espécie

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 25, p. 56:**

> Possibilitar parametrização da sequência da numeração dos processos por ano, tipo e espécie;

**Implementação:** Parametrizar série/máscara e próximo número no recorte ano–tipo–espécie adotado, com controle de unicidade e concorrência. Alteração da série não renumera processos existentes. Numerar no evento de protocolo, sem depender de quantidade de linhas no frontend.

**Dados de outro módulo / serviço compartilhado:** DEP-01: órgão/escopo. Sequências e cadastro de espécies/tipos pertencem a Processos.

**Demonstração:** Em F-PROT, gerar 1001 e 1002 para a série configurada; repetir evento sem novo número. Gerar processos de outro ano/tipo/espécie e testar duas criações simultâneas distintas.

**Aceite técnico:** Os três critérios participam da parametrização, as sequências são coerentes e não há colisão/reutilização silenciosa de número.

**Atenção / limite:** Máscara e início do exemplo não são oficiais; obter configuração em Q-10. Não confundir número de processo com chave secreta de acesso.

<a id="ped-026"></a>
### PED-026 — Gestão do andamento e relatórios até o arquivamento

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 26, p. 56:**

> Permitir a gestão dos processos em andamento, disponibilizando informações da tramitação da documentação desde o seu início até o arquivamento por meio de relatórios;

**Implementação:** Disponibilizar consultas de processos em andamento com situação, atividade/caixa responsável e acesso aos relatórios da tramitação desde início até arquivo. Preservar processos encerrados/arquivados no histórico quando o filtro pedir, sem misturar “em andamento” com excluídos.

**Dados de outro módulo / serviço compartilhado:** DEP-03 para relatório e DEP-01 para escopo; dados de gestão são próprios.

**Demonstração:** Consultar P-A em análise, abrir seu relatório, concluir/arquivar e emitir novamente o percurso completo; usar outro processo em andamento para comparar a lista operacional.

**Aceite técnico:** Lista e relatório refletem a mesma posição; é possível recuperar todo o ciclo do processo sem redigitar datas ou perder a parte anterior ao arquivo.

**Atenção / limite:** Não criar painel de BI paralelo. Indicadores e mineração específicos serão demonstrados nos IDs 54/61/62/91.

<a id="ped-027"></a>
### PED-027 — Documentos com campos de mesclagem

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 27, p. 56:**

> Permitir a criação de documentos utilizando campos de mesclagem;

**Implementação:** Disponibilizar modelos com campos de mesclagem provenientes do processo e fontes permitidas, como número, assunto, interessado e datas. Gerar documento com os valores da instância e conservar versão do modelo/dados utilizados. Campo ausente deve ser indicado, não substituído por dado de exemplo.

**Dados de outro módulo / serviço compartilhado:** DEP-03: editor/geração; DEP-02 e fontes permitidas para mesclagem. Mapeamento documental do procedimento pertence ao módulo.

**Demonstração:** Criar um modelo de termo com número/assunto/interessado; emitir para dois processos e conferir valores diferentes. Editar o modelo para nova emissão sem alterar documento já finalizado.

**Aceite técnico:** Documento é composto a partir dos dados reais e do modelo selecionado; não contém marcadores não resolvidos ou dados de outro requerente.

**Atenção / limite:** Não permitir execução de código/consulta arbitrária em marcador nem criar novo editor geral se o existente suporta mesclagem.

<a id="ped-028"></a>
### PED-028 — Tempo de execução das atividades

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 28, p. 56:**

> Permitir controlar atividades por tempo de execução através de fluxo de trabalho;

**Implementação:** Registrar início, término e duração de cada atividade, incluindo distinção de espera/execução quando a informação existir. Mostrar prazo e tempo decorrido conforme regra explícita; não calcular duração apenas pela data atual de um processo encerrado.

**Dados de outro módulo / serviço compartilhado:** DEP-01 para ator; controle temporal e eventos são próprios de Processos.

**Demonstração:** No F-FORM, iniciar às 09h e concluir às 14h no relógio de teste; conferir duração de 5h e os eventos que a sustentam. Abrir atividade ainda em andamento e identificar o tempo parcial.

**Aceite técnico:** O tempo decorre de timestamps persistidos e é consultável por atividade/fluxo, com unidade e estado claramente indicados.

**Atenção / limite:** Horas corridas são convenção de ensaio, não jornada nem prazo legal. Calendário e suspensão de contagem devem ser definidos em Q-10.

<a id="ped-029"></a>
### PED-029 — Justificativa obrigatória do atraso e novo prazo

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 29, p. 56:**

> Permitir que o usuário de forma parametrizável seja forçado a justificar uma atividade que estiver em atraso, definindo novo prazo para resolução;

**Implementação:** Parametrizar exigência de justificativa e nova data em atividade atrasada. Validar no servidor ao tentar a ação correspondente; preservar prazo original, atraso observado, justificativa, responsável e novo prazo. Não limpar a evidência do atraso ao reagendar.

**Dados de outro módulo / serviço compartilhado:** DEP-01: identidade/permissão. Dados da atividade e regra são próprios.

**Demonstração:** F-FORM: prazo 11h, tentativa às 12h. Sem justificativa/nova data, recusar; informar motivo e 15h, salvar e concluir às 14h. Testar configuração desativada em outro assunto.

**Aceite técnico:** A exigência é parametrizável e, quando ativa, efetiva; prazo anterior e novo ficam consultáveis com o motivo da alteração.

**Atenção / limite:** Não criar punição, cobrança ou aprovação hierárquica não definida. O teste de configuração desativada não dispensa mostrar a regra ativa.

<a id="ped-030"></a>
### PED-030 — Prazos definidos no fluxo

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 30, p. 56:**

> Permitir o controle de atividades de processo por prazos definidos em fluxo de trabalho;

**Implementação:** Configurar prazo previsto por atividade/fase/etapa pertinente e calcular o vencimento ao ativar a atividade segundo a base configurada. Mostrar a situação temporal e controlar o andamento usando esses parâmetros, compartilhando os serviços de PED-028/029.

**Dados de outro módulo / serviço compartilhado:** DEP-01 para participantes; calendário compartilhado se houver. Prazo/atividade são próprios do módulo.

**Demonstração:** Definir Triagem 1h, Análise 2h e Decisão 2h no fluxo de teste; criar processo e verificar prazos de cada atividade ao entrar nela. Alterar o parâmetro em versão controlada e testar sua aplicação.

**Aceite técnico:** Os prazos vêm do fluxo e são usados pela instância; não são apenas texto no diagrama nem datas digitadas novamente em cada processo.

**Atenção / limite:** Não prescrever dias úteis, feriados ou data-base legal ausentes. Aplicação em instâncias ativas deve respeitar PED-087/Q-10.

<a id="ped-031"></a>
### PED-031 — Texto padronizável de encaminhamento

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 31, p. 56:**

> Disponibilizar texto padronizável para o encaminhamento dos processos;

**Implementação:** Permitir configurar textos de encaminhamento reutilizáveis e selecioná-los no envio, com edição autorizada quando cabível. Preencher os dados disponíveis do processo sem redigitação e guardar o texto efetivamente enviado, não apenas referência a um modelo mutável.

**Dados de outro módulo / serviço compartilhado:** DEP-03 se biblioteca de textos/modelos for compartilhada. Encaminhamento é deste módulo.

**Demonstração:** Cadastrar dois textos DEMO, selecionar um ao encaminhar P-A, completar informação pertinente e enviar. Alterar o padrão depois e consultar o envio anterior.

**Aceite técnico:** O operador reutiliza o texto e o histórico mantém a versão encaminhada, sem alteração retroativa pelo novo padrão.

**Atenção / limite:** Não gerar pareceres jurídicos por IA nem impor texto oficial ainda não fornecido.

<a id="ped-032"></a>
### PED-032 — Textos de encaminhamento públicos e privados

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 32, p. 56:**

> Dispor de funcionalidade onde seja possível definir a visualização dos textos de encaminhamento de forma pública e privada, permitindo a diferenciação entres os tipos;

**Implementação:** Definir visibilidade do texto de cada encaminhamento, conservando indicação de público/privado e aplicando acesso no servidor, relatórios e e-mails. Separar visibilidade do texto de permissões do processo e da peça; prevalecer a restrição aplicável ao conteúdo.

**Dados de outro módulo / serviço compartilhado:** DEP-01: permissões; DEP-05 se texto for comunicado. Atributo e regra contextual são de Processos.

**Demonstração:** Registrar um encaminhamento público e outro privado em P-PUB. Consultar como interno autorizado, externo e visitante sem login; conferir também o relatório e o link da mensagem.

**Aceite técnico:** Os públicos autorizados podem ser lidos e o privado não vaza no HTML, API, documento ou notificação ao público inadequado.

**Atenção / limite:** “Público” não deve superar sigilo do processo por si só. Política conjunta de PED-069/070 está em Q-01.

<a id="ped-033"></a>
### PED-033 — Criação automática de processo por conexão com URA

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 33, p. 56:**

> Dispor de conexão com a URA (Unidade de Resposta Audível) para criação automática de processos;

**Implementação:** Identificar o contrato de evento da URA e implementar/reutilizar receptor autenticado do lado de Processos, mapeando atendimento, assunto, interessado quando fornecido e dados do protocolo. Correlacionar o identificador externo e proteger reenvios; guardar erro de dados incompletos sem fabricar conteúdo.

**Dados de outro módulo / serviço compartilhado:** DEP-08: URA/evento/contrato; DEP-01/02: identidade e contexto. Receptor e criação pertencem a este módulo.

**Demonstração:** Executar F-URA com atendimento real de homologação autorizado e localizar o processo criado automaticamente. Repetir a entrega do mesmo evento e testar evento sem autenticação.

**Aceite técnico:** O evento da URA produz um processo rastreável uma única vez. Mensagem inválida não cria processo nem tem sucesso fictício.

**Atenção / limite:** Q-11: URA não identificada no TR. JSON manual é teste do receptor, não conexão comprovada; não desenvolver telefonia/chatbot nem tratar como facultativo.

<a id="ped-034"></a>
### PED-034 — Visualização das assinaturas em cada acesso

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 34, p. 56:**

> Ao assinar o documento, disponibilizar a visualização da assinatura todas as vezes que o usuário acessar o arquivo;

**Implementação:** No visualizador e na ficha do documento assinado, exibir assinaturas ligadas à versão atual, com signatário e informação verificável disponível. Manter a versão assinada recuperável a cada acesso, inclusive após nova sessão. Não preencher selo “assinado” antes da conclusão real.

**Dados de outro módulo / serviço compartilhado:** DEP-04: assinatura/verificação; DEP-03: arquivo/visualizador. Gestão de versão/vínculo é deste módulo.

**Demonstração:** Assinar documento de F-DOC, abrir, sair e acessar novamente pelo portal autorizado. Conferir o mesmo signatário/versão; abrir outra versão ainda sem assinatura.

**Aceite técnico:** Assinaturas correspondem ao arquivo acessado e são visualizáveis repetidamente; versão não assinada não herda estado de outra.

**Atenção / limite:** Imagem de rubrica não prova assinatura digital. Formatos e apresentação suportados precisam de validação em Q-04.

<a id="ped-035"></a>
### PED-035 — Validação e autenticação pelo sítio da contratante com QR Code

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 35, p. 56:**

> Ao assinar o documento, deverá permitir a validação e autenticação do documento produzido utilizando a rede mundial de computadores por meio do sítio eletrônico da contratante, inclusive QRCode;

**Implementação:** Disponibilizar consulta de autenticidade/validação do documento no sítio/portal da contratante, com identificador estável e QR Code resolvendo a consulta correta. Preparar marcações antes da assinatura; distinguir autenticidade de emissão e verificação criptográfica. Respeitar o sigilo dos dados exibidos.

**Dados de outro módulo / serviço compartilhado:** DEP-04: verificações; DEP-03: documento; portal/dominio configurado da contratante. Não criar outro portal se o existente atender.

**Demonstração:** Emitir e assinar um documento DEMO, ler QR pelo celular e consultar no portal. Conferir versão, signatários e resultado; testar identificador inexistente e cópia alterada pelos meios suportados.

**Aceite técnico:** A consulta é funcional via internet no canal configurado e corresponde ao documento/versão; inexistência ou falha não são declaradas válidas.

**Atenção / limite:** Q-04/Q-01: endereço e alcance da validação precisam ser configurados. Hash/chave existentes não substituem verificação da assinatura.

<a id="ped-036"></a>
### PED-036 — Assinatura digital de anexo por certificado

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 36, p. 56:**

> Possibilitar que o arquivo (documento/imagem) anexado ao processo possa ser assinado digitalmente utilizando a certificação digital;

**Implementação:** Permitir selecionar documento/imagem anexado e acionar assinatura por certificado, com vínculo à versão assinada. Para formato que necessite representação, conservar original, conversão e relação explícita; o produto assinado deve ser identificado e verificável, não uma troca de extensão.

**Dados de outro módulo / serviço compartilhado:** DEP-04: serviço/certificado; DEP-03: bytes/conversão quando necessária.

**Demonstração:** Anexar PDF e uma imagem de teste; percorrer a assinatura suportada de ambos, abrir os produtos e verificar o certificado/versão. Testar falha do serviço sem estado falso de assinatura.

**Aceite técnico:** O anexo possui produto efetivamente assinado por certificado, com origem rastreável e conteúdo recuperável. Assinatura não se resume a confirmar checkbox.

**Atenção / limite:** Q-04: formato/credencial aptos são dependência. Não recolher senhas/chaves privadas em logs ou fixtures.

<a id="ped-037"></a>
### PED-037 — Visualização dentro do sistema sem download manual

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 37, p. 57:**

> Ser capaz de visualizar os documentos diretamente no sistema, sem a necessidade de download, agilizando o acesso às informações;

**Implementação:** Oferecer prévia interna dos formatos suportados, com navegação/zoom pertinentes e autorização no carregamento. O usuário não deve precisar salvar o arquivo e abrir outro aplicativo para a consulta normal. Formato não renderizável exige aviso e tratamento explícito, não tela vazia.

**Dados de outro módulo / serviço compartilhado:** DEP-03: visualizador e representações; arquivo/peça do processo.

**Demonstração:** Abrir PDF multipágina e imagem de F-DOC diretamente na ficha, percorrer páginas e fechar; conferir que não houve necessidade de salvar arquivo externo. Testar arquivo indisponível.

**Aceite técnico:** O conteúdo é visto no próprio sistema e corresponde à peça selecionada; falha/ausência é identificada e permissões são respeitadas.

**Atenção / limite:** “Sem download” é não exigir download manual para leitura, não alegar ausência de transferência de dados ao navegador. Formatos efetivos em Q-03.

<a id="ped-038"></a>
### PED-038 — Download do processo completo ou de peças individuais

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 38, p. 57:**

> Disponibilizar o processo na íntegra ou peças individuas para download;

**Implementação:** Disponibilizar obtenção do processo íntegro e/ou de peças individuais pelo mecanismo documental adotado. Para o ensaio, oferecer pacote integral indexado e arquivo individual quando disponíveis, preservando originais e versões. Escopo e formato devem ficar claros; não impor fusão destrutiva de assinaturas.

**Dados de outro módulo / serviço compartilhado:** DEP-03: geração/armazenamento/pacote. Seleção e autorização processuais são deste módulo.

**Demonstração:** Em F-DOC com 13 peças, baixar uma peça e o pacote integral de teste; comparar índice, contagem, primeira/última peça e bytes originais autorizados.

**Aceite técnico:** A forma demonstrada entrega o conteúdo correspondente, sem limitar à página visível ou omitir peças silenciosamente. Arquivos assinados originais permanecem íntegros.

**Atenção / limite:** O TR usa “ou”; o plano não obriga formatos cumulativos nem PDF único. Sigilo e representação de originais estão em Q-01/Q-03.

<a id="ped-039"></a>
### PED-039 — Envio de link por e-mail para auditoria externa

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 39, p. 57:**

> Permitir o envio de link por e-mail do processo para possíveis auditorias externas (TCE e outras entidades);

**Implementação:** Permitir compartilhar acesso limitado ao processo com auditor externo e enviar o link pelo serviço de e-mail. Relacionar destinatário, processo, permissões e data do compartilhamento; revalidar acesso em consultas/downloads, sem tornar toda a base pública.

**Dados de outro módulo / serviço compartilhado:** DEP-05: e-mail; DEP-01/02: identidade/acesso externo; DEP-03: peças. Reutilizar compartilhamento existente.

**Demonstração:** Enviar link de P-A a CX-AUD, receber e abrir com o acesso definido. Tentar abrir outro processo e peça fora da permissão; testar expiração/revogação se o mecanismo existente oferecer.

**Aceite técnico:** O auditor acessa o processo correto com as permissões concedidas; envio e abertura são comprovados e outros registros não ficam expostos.

**Atenção / limite:** Não pressupor integração com API do TCE nem enviar dado real de cidadão. O destinatário de ensaio é conta controlada, não órgão oficial.

<a id="ped-040"></a>
### PED-040 — Gestão de informações encaminhadas a órgãos externos

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 40, p. 57:**

> Permitir gerir informações encaminhadas a órgão externos;

**Implementação:** Registrar órgão/destinatário, processo, informações/peças encaminhadas, data, responsável e referência do envio pelo canal adotado. Permitir acompanhar o registro e acessar exatamente o conjunto encaminhado, preservando sua versão e situação de envio conhecida.

**Dados de outro módulo / serviço compartilhado:** DEP-02/01: destinatário/órgão quando cadastrados; DEP-03/05 ou conector existente para documentos/envio.

**Demonstração:** Encaminhar conjunto autorizado de P-A a órgão externo DEMO, consultar o registro, abrir peças e comparar com o recebimento controlado. Testar falha do canal sem confirmação fictícia.

**Aceite técnico:** É possível identificar o que foi encaminhado, quando, por quem e para qual destinatário, sem confundir preparação e envio efetivo.

**Atenção / limite:** O item não nomeia API obrigatória nem órgão específico. Não desenvolver integração institucional não definida; registrar limites em Q-10/Q-13.

<a id="ped-041"></a>
### PED-041 — Ambiente exclusivo de externos com permissões parametrizáveis

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 41, p. 57:**

> Dispor de ambiente exclusivo para acesso a externos com respectivas permissões parametrizáveis;

**Implementação:** Organizar área externa do mesmo site com contexto e permissões próprios, separada das funções administrativas. Permitir configurar escopo de processo, ação e peça por usuário/grupo autorizado; aplicar controles também em API e arquivo. Reutilizar autenticação existente.

**Dados de outro módulo / serviço compartilhado:** DEP-01/02: contas e vínculos; portal existente. Configuração de acesso processual pertence ao módulo.

**Demonstração:** Acessar como EXT-A e AUD-A; cada um vê as funções/dados autorizados. Tentar homologar, parametrizar fluxo ou consultar dados de EXT-B e verificar recusa.

**Aceite técnico:** O ambiente externo é utilizável e tem permissões parametrizáveis reais, sem depender de esconder menu interno ou cadastrar base paralela de processos.

**Atenção / limite:** “Exclusivo” não exige outro domínio, aplicativo ou banco. Manter consulta pública de PED-069 separada da área autenticada conforme Q-01.

<a id="ped-042"></a>
### PED-042 — Assinaturas digitais e eletrônicas em trâmites e anexos

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 42, p. 57:**

> Toda tramitação, bem como os documentos anexados, poderão ser assinados digitalmente e eletronicamente;

**Implementação:** Disponibilizar mecanismos de assinatura eletrônica e digital no registro do trâmite e nos documentos anexados, conforme modalidades suportadas. Vincular identidade, ato, conteúdo/versão e evidência. Se o trâmite for representado por termo assinado, mantê-lo ligado ao evento real e imutável.

**Dados de outro módulo / serviço compartilhado:** DEP-04: mecanismos e verificação; DEP-03: arquivos/termos; DEP-01: identidade.

**Demonstração:** Assinar eletronicamente um encaminhamento e digitalmente por certificado outro registro/termo; repetir nos anexos pertinentes. Verificar autoria, versão e evidências, não só o rótulo do estado.

**Aceite técnico:** Tramitação e anexo têm meios demonstráveis de assinatura eletrônica/digital, diferenciados corretamente; um clique simples não é apresentado como certificado.

**Atenção / limite:** Não impor que todo ato seja obrigatoriamente assinado se o fluxo não determinar, mas manter a capacidade. Modalidades/formatos em Q-04.

<a id="ped-043"></a>
### PED-043 — Documentos exigidos por assunto

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 43, p. 57:**

> Permitir o controle dos documentos exigidos por assunto em seu cadastro;

**Implementação:** No assunto, manter relação de espécies/documentos necessários, com obrigatoriedade e momento de conferência segundo a configuração. Apresentar exigências no cadastro/portal e validar na ação pertinente; conservar referência da configuração aplicada ao pedido.

**Dados de outro módulo / serviço compartilhado:** DEP-03: espécies/arquivos quando compartilhados. Relação assunto–exigência pertence ao módulo.

**Demonstração:** ASS-A exige DOC-REQ e ASS-B exige DOC-COMP na fixture. Iniciar ambos, conferir listas distintas e tentar protocolar sem documento requerido; completar e prosseguir.

**Aceite técnico:** As exigências variam com o assunto e têm controle efetivo, não apenas texto estático. Alterar a configuração não reescreve retroativamente a submissão anterior.

**Atenção / limite:** Não inventar documentos oficiais obrigatórios. Anonimato não pode ser inviabilizado por exigência pessoal artificial; política em Q-01/Q-10.

<a id="ped-044"></a>
### PED-044 — Anexos em diversos formatos

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 44, p. 57:**

> Possibilitar anexar arquivos digitais e eletrônicos em diversos formatos ao processo;

**Implementação:** Aceitar diversos formatos configurados por espécie documental, com validação de conteúdo, extensão e tamanho no servidor. Guardar original, metadados e vínculo ao processo; preparar representação de leitura quando suportada, sem renomear arquivo para fingir conversão.

**Dados de outro módulo / serviço compartilhado:** DEP-03: arquivos/conversão; peças e política de espécie no contexto de Processos.

**Demonstração:** Anexar PDF, imagem e documento editável dentre os formatos efetivamente suportados; reabrir e conferir cada original/representação. Testar extensão incompatível, excesso de tamanho e falha de armazenamento.

**Aceite técnico:** Mais de um formato é anexável e recuperável; validações são coerentes com PED-085 e arquivo inválido não é contabilizado como peça concluída.

**Atenção / limite:** O TR não enumera todos os formatos do mundo. Enumerar suporte real em Q-03; não executar conteúdo ativo não confiável.

<a id="ped-045"></a>
### PED-045 — Juntada de processos por apensação ou anexação

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 45, p. 57:**

> Possibilitar controlar a juntada de processos por apensação ou anexação;

**Implementação:** Oferecer operações identificadas de apensação e anexação entre processos, com principal/relacionado, motivo, data, responsável e termo pertinente. Preservar números, documentos e histórico; impedir ciclo/vínculo duplicado inválido e não reduzir a operação a upload de PDF.

**Dados de outro módulo / serviço compartilhado:** DEP-03: termos/peças. Relações entre processos são próprias; não depender de outro cadastro setorial.

**Demonstração:** Relacionar P-A a P-B por apensação e dois processos independentes por anexação; consultar os termos e navegar aos componentes. Testar tentativa de vínculo circular e desfazimento permitido da relação temporária.

**Aceite técnico:** As relações e seus efeitos seguem o procedimento configurado e podem ser consultados; apensação temporária não destrói identidade nem documentos.

**Atenção / limite:** Q-07: diferenciar efeitos administrativos da apensação/anexação sem inventar rito. As opções compartilham infraestrutura, mas não são etiquetas de uma cópia de arquivo.

<a id="ped-046"></a>
### PED-046 — Consulta por número, requerente, assunto, abertura e chave

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 46, p. 57:**

> Possibilitar consultas diversas por número de processo, por requerente, assunto, data de abertura ou ainda chave de acesso;

**Implementação:** Implementar filtros por todos os critérios literais, isolados ou combinados, no conjunto autorizado do servidor. Identificar data de abertura, normalizar consulta de número/documento conforme padrão e tratar chave sem a converter em permissão irrestrita de sigilo.

**Dados de outro módulo / serviço compartilhado:** DEP-02: requerente; DEP-01: escopo. Índices e registros são de Processos.

**Demonstração:** Localizar P-A por número, requerente, assunto, data de abertura e chave; combinar filtros e testar conjunto vazio. Localizar registro que estaria em outra página.

**Aceite técnico:** Todos os critérios recuperam dados corretos e permitem combinação sem pesquisa apenas local. Chave inexistente não abre processo aleatório.

**Atenção / limite:** Não adicionar pesquisa semântica ou vazamento de chaves em logs/URLs públicas de listagem. Visibilidade segue Q-01.

<a id="ped-047"></a>
### PED-047 — Modelos de termos de apensação, anexação e volumes

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 47, p. 57:**

> Permitir a formatação de diversos termos, como: Termo de apensação, de anexação, de abertura e encerramento de volume, dentre outros;

**Implementação:** Permitir formatar modelos distintos dos termos citados, com campos de mesclagem e relação às operações: apensação, anexação, abertura e encerramento de volume. Gerar documentos identificados a partir dos atos reais e guardar versão utilizada.

**Dados de outro módulo / serviço compartilhado:** DEP-03: editor/modelos/geração. Eventos de juntada/volume são do módulo.

**Demonstração:** Configurar os quatro modelos DEMO, realizar operações pertinentes em cenários isolados, emitir termos e conferir números/processos/volume. Editar modelo e verificar que termo anterior não muda.

**Aceite técnico:** Cada tipo pode ser formatado e usado na operação correspondente; não há um único PDF fixo com título trocado e dados incoerentes.

**Atenção / limite:** Não inventar limite de folhas por volume nem protocolo arquivístico oficial. Volumes/representações seguem Q-03/Q-07.

<a id="ped-048"></a>
### PED-048 — Comprovante de cada encaminhamento

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 48, p. 57:**

> Emitir a cada envio de processo/documento o comprovante do encaminhamento realizado;

**Implementação:** Gerar comprovante para cada envio confirmado de processo/documento, com identificação, origem/destino, ator, data e referência do trâmite. Repetir geração deve recuperar o documento do evento, não produzir outro envio. Relacionar eventual cancelamento/rejeição posterior sem reescrever o ato original.

**Dados de outro módulo / serviço compartilhado:** DEP-03: emissão; DEP-01: ator/setores. Evento e vínculo do comprovante são próprios.

**Demonstração:** Enviar P-A e depois um documento acompanhado; abrir os respectivos comprovantes. Cancelar um envio de teste e consultar o comprovante e o evento de cancelamento ligados.

**Aceite técnico:** Todo envio demonstrado tem comprovante correspondente à operação real. Um lote conserva comprovante/rastreabilidade por envio, não só mensagem genérica de sucesso.

**Atenção / limite:** Não confundir comprovante de encaminhamento com comprovante inicial de protocolo ou termo de autuação.

<a id="ped-049"></a>
### PED-049 — Histórico simples ou detalhado emitível

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 49, p. 57:**

> Possibilitar a emissão de comprovante simples ou detalhado do histórico de andamento do processo;

**Implementação:** Oferecer emissão do histórico em apresentação simples e detalhada pelo mesmo conjunto de eventos; na simples, resumir referências/situações; na detalhada, incluir dados pertinentes e textos autorizados. Identificar qual formato foi escolhido e preservar o período/filtros.

**Dados de outro módulo / serviço compartilhado:** DEP-03: relatórios; dados do processo/trâmite próprios, com DEP-01 para escopo.

**Demonstração:** Emitir as duas apresentações de P-A, comparar contagem/ordem de trâmites e conferir que a detalhada contém as informações adicionais previstas no modelo.

**Aceite técnico:** Os formatos apresentam o mesmo histórico de origem sem divergência; simplificação visual não altera eventos nem omite acesso permitido ao detalhe.

**Atenção / limite:** O “ou” da fonte não obriga duas bases de dados ou dois relatórios independentes. Usar variantes de apresentação do mesmo serviço.

<a id="ped-050"></a>
### PED-050 — Tramitação autorizada somente em setores específicos

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 50, p. 57:**

> Possuir configuração para que os usuários possam ser autorizados a fazer as tramitações somente em setores específicos;

**Implementação:** Permitir configurar setores de atuação/destino autorizados ao usuário ou agrupamento e aplicar essa restrição ao envio/recebimento. Filtrar seletores de setor e validar IDs no servidor; não ampliar permissão por conhecer a URL do processo.

**Dados de outro módulo / serviço compartilhado:** DEP-01: setores/grupos/usuários. Matriz de permissão específica da tramitação é do módulo.

**Demonstração:** Autorizar U-TEC apenas no S-TEC e no encaminhamento previsto a S-DEC. Tentar atuar em S-ARQ e por API com destino não permitido; repetir com usuário autorizado.

**Aceite técnico:** Configuração tem efeito na interface e no servidor. O usuário autorizado continua executando seu trabalho e o não autorizado recebe erro sem evento parcial.

**Atenção / limite:** Não criar outro organograma ou exigir que todos os usuários sejam administradores para poder demonstrar os fluxos.

<a id="ped-051"></a>
### PED-051 — Caixas e participantes por setor, função, usuário e papel

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 51, p. 57:**

> Permitir que as caixas/participantes de tramitação possam ser configuráveis por setor, função, usuário, papel;

**Implementação:** Configurar caixas/participantes que resolvam destinatários pelos quatro critérios: setor, função, usuário e papel. Usar identidades existentes e guardar a regra e o responsável efetivo da instância, sem confundir papel funcional com pessoa fixa.

**Dados de outro módulo / serviço compartilhado:** DEP-01: função, papel, grupos, usuários e setores. Configuração/resolução da caixa processual pertence ao módulo.

**Demonstração:** Criar configurações de teste para cada critério; encaminhar processos independentes e verificar as caixas/usuários elegíveis. Alterar membro de papel para novas atividades sem modificar o histórico encerrado.

**Aceite técnico:** Os quatro modos são selecionáveis e produzem participantes efetivos; não se limitam a nomes em dropdown sem resolução de acesso.

**Atenção / limite:** Não presumir que função e papel sejam o mesmo campo no ERP; mapear explicitamente em Q-10, sem duplicar cadastro geral.

<a id="ped-052"></a>
### PED-052 — Rejeição justificada de processo no estado Enviado

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 52, p. 57:**

> Possibilitar a rejeição de processos após a tramitação, desde que estejam no status "Enviado" e seja devidamente justificado;

**Implementação:** Permitir ao destinatário autorizado rejeitar um envio enquanto estiver Enviado, exigindo justificativa. Registrar ator/data, comunicar o resultado no histórico/caixas e aplicar retorno configurado. A validação do estado e da versão ocorre junto à gravação.

**Dados de outro módulo / serviço compartilhado:** DEP-01: destinatário/permissões. Controle de transporte/posse é nativo de Processos.

**Demonstração:** Em P-REJ, tentar rejeitar sem motivo; informar justificativa e rejeitar. Tentar rejeitar envio já recebido e testar concorrência com recebimento.

**Aceite técnico:** Somente o estado permitido aceita rejeição, sempre justificada; não há exclusão de envio nem dupla transição em corrida.

**Atenção / limite:** Não confundir com cancelamento do remetente (14), indeferimento de mérito ou anulação de processo inteiro.

<a id="ped-053"></a>
### PED-053 — Auditoria por usuário e data no processo

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 53, pp. 57–58:**

> Permitir auditoria facilitada quanto a identificação do usuário, com respectiva data que promoveu qualquer ação (cadastramento ou alteração) relacionada a um determinado processo;

**Implementação:** Registrar e disponibilizar consulta de autoria/data das ações de cadastramento e alteração relacionadas ao processo, incluindo os atos relevantes das funções implementadas. Preservar referência ao objeto/versão e permitir localizar a ação a partir da ficha, sem mostrar segredos/conteúdo privado a qualquer perfil.

**Dados de outro módulo / serviço compartilhado:** DEP-01: identidade e auditoria comum, se houver; módulo fornece eventos e relações.

**Demonstração:** Criar processo, editar descrição, anexar peça e tramitar com dois usuários; consultar a auditoria por processo e identificar quem/quando realizou cada ação.

**Aceite técnico:** As ações têm identidade e data recuperáveis, com trilha coerente e protegida. Log vazio ou usuário fixo “sistema” sem origem humana não substitui autoria conhecida.

**Atenção / limite:** Não criar um produto de observabilidade/monitoramento separado. Quando houver ação automática, identificar evento e origem real, sem inventar operador.

<a id="ped-054"></a>
### PED-054 — Representação gráfica de processos por assunto

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 54, p. 58:**

> Possibilitar a representação em modo gráfico dos processos por assunto para gerenciamento;

**Implementação:** Gerar gráfico de processos agrupados por assunto a partir do recorte autorizado, com contagem, legenda e acesso à consulta que fundamenta o dado. Usar a área gerencial do módulo, não toda a tela operacional de protocolo.

**Dados de outro módulo / serviço compartilhado:** Dados do cadastro de processos/assuntos; DEP-03 para apresentação/relatório quando compartilhados.

**Demonstração:** F-GESTAO: selecionar setembro e conferir ASS-A 10, ASS-B 8, ASS-C 5, total 23. Filtrar um assunto e comparar o gráfico com a lista completa.

**Aceite técnico:** Representação é recalculada com os registros e filtros reais; não usa dados fixos ou apenas dez itens da primeira página.

**Atenção / limite:** Gráfico é expressamente exigido aqui; não o excluir como extra. Tipo de gráfico é decisão de UX, não obrigação de mapa geográfico.

<a id="ped-055"></a>
### PED-055 — Relatório de processos abertos por período

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 55, p. 58:**

> Emitir relatório de processos abertos por período;

**Implementação:** Emitir relatório filtrando pela data de abertura, com identificação do processo, assunto e dados pertinentes do modelo. Usar intervalo claro e inclusivo na interface, total do recorte e escopo de acesso; não filtrar pela data do último trâmite.

**Dados de outro módulo / serviço compartilhado:** DEP-03: geração/formatos. Fonte principal é data de abertura de Processos.

**Demonstração:** F-GESTAO: emitir 01/09–30/09/2026 e conferir 23 registros; excluir os casos de agosto/outubro. Testar datas de borda, período vazio e exportação além da página atual.

**Aceite técnico:** Relatório é gerado do conjunto correto e seus totais coincidem com a consulta/gráfico do mesmo filtro.

**Atenção / limite:** Não transformar em relatório de andamento mensal com outra data sem identificar a diferença.

<a id="ped-056"></a>
### PED-056 — Biblioteca de documentos parametrizáveis no fluxo

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 56, p. 58:**

> Possuir biblioteca de documentos parametrizáveis para utilização em fluxo;

**Implementação:** Manter biblioteca reutilizável de modelos/documentos parametrizáveis e associá-los às atividades de fluxo. Ao executar, preencher os dados da instância e gerar a versão correspondente, sem copiar arquivo estático como se fosse documento parametrizado.

**Dados de outro módulo / serviço compartilhado:** DEP-03: biblioteca/editor/geração; configuração de uso no procedimento é de Processos.

**Demonstração:** Associar modelo de parecer à Análise e termo à Decisão; executar em dois processos e conferir parâmetros e documentos distintos com a mesma definição base.

**Aceite técnico:** Modelos são selecionáveis no fluxo e realmente usados, com origem/versão identificadas e valores próprios de cada instância.

**Atenção / limite:** Compartilha PED-027/084; não criar bibliotecas incompatíveis por área nem inventar conteúdo jurídico oficial.

<a id="ped-057"></a>
### PED-057 — Enquetes e pesquisas como base de decisões do fluxo

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 57, p. 58:**

> Possui formulário para enquetes/pesquisas a serem utilizadas como base para decisões de fluxo;

**Implementação:** Permitir configurar formulário de enquete/pesquisa, guardar respostas e disponibilizar o resultado como condição ou insumo da decisão do fluxo. Definir regra de consolidação quando houver múltiplas respostas, sem pressupor quórum ou fórmula legal.

**Dados de outro módulo / serviço compartilhado:** Formulários/respostas são do módulo; DEP-01/02 para participantes quando identificados.

**Demonstração:** Criar enquete DEMO com resposta Sim/Não; registrar respostas controladas e configurar a condição que segue à Análise ou Decisão. Conferir resultado usado e histórico da decisão.

**Aceite técnico:** Respostas alimentam a decisão configurada e ficam rastreáveis; a enquete não é apenas formulário sem vínculo ao fluxo.

**Atenção / limite:** Não criar votação oficial, eleição, pesquisa estatística ampla ou regra de maioria presumida. Critério de ensaio explicitado em Q-10.

<a id="ped-058"></a>
### PED-058 — Formulários para pesquisas externas

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 58, p. 58:**

> Permitir a disponibilização de formulários para pesquisas externas;

**Implementação:** Disponibilizar formulário de pesquisa no canal externo com acesso configurado, campos da definição e persistência de respostas. Usar validação, proteção a reenvios indevidos e identificação do contexto; não exigir perfil interno para responder.

**Dados de outro módulo / serviço compartilhado:** DEP-01/02: identidade externa quando a política exigir; portal existente. Formulário/respostas são de Processos.

**Demonstração:** Abrir pesquisa DEMO no Chrome como participante externo, responder e localizar a resposta na análise interna. Testar submissão inválida e acesso de outro usuário quando a pesquisa for restrita.

**Aceite técnico:** O público externo consegue usar o formulário e a resposta chega à mesma base, com escopo e estado reais.

**Atenção / limite:** O item não impõe anonimato a toda pesquisa nem login a toda pesquisa. Política de publicação em Q-01/Q-10.

<a id="ped-059"></a>
### PED-059 — Automação de decisões e aprovações de documentos

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 59, p. 58:**

> Possuir ferramentas de fluxo, de forma a permitir automatizar processos que envolvam tomadas de decisão ou aprovação de documentos;

**Implementação:** Disponibilizar configuração de fluxo com atividades de decisão/aprovação, condições e documentos/providências vinculados. Encaminhar automaticamente conforme regra, reservando atos humanos às competências configuradas. Guardar decisão, ator/evento e documento/versão considerados.

**Dados de outro módulo / serviço compartilhado:** DEP-01 para responsáveis; DEP-03/04 quando documento/assinatura exigidos. Motor de fluxo é deste módulo.

**Demonstração:** Em F-FORM, executar ramificações e uma aprovação documental por U-DEC; tentar aprovar como externo. Conferir tarefa seguinte e histórico, sem escolha manual de destino predefinido.

**Aceite técnico:** O fluxo automatiza os encaminhamentos/condições configurados e registra aprovação real por autoridade autorizada; não é um editor de setas sem execução.

**Atenção / limite:** Não criar aprovação autônoma por IA ou eliminar assinaturas exigidas para reduzir cliques. Procedimento administrativo real em Q-10.

<a id="ped-060"></a>
### PED-060 — Exibição de fluxo em gráfico ou relatório

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 60, p. 58:**

> Os fluxos dentro do sistema poderão ser exibidos através de visualização gráfica ou relatório;

**Implementação:** Gerar visualização gráfica e/ou relatório do fluxo configurado, com atividades, ligações, responsáveis e condições pertinentes. Usar a mesma definição do motor para evitar divergência entre documentação e execução.

**Dados de outro módulo / serviço compartilhado:** DEP-03 se houver renderização/relatório comum; definição do fluxo é própria.

**Demonstração:** Abrir o fluxo ASS-A e conferir a ramificação de F-FORM na representação escolhida. Emitir relatório/visualização disponível e comparar a versão com o procedimento executado.

**Aceite técnico:** A representação corresponde ao fluxo real e permite entendê-lo; não é imagem desenhada manualmente sem relação com a configuração.

**Atenção / limite:** O item usa “ou”, mas diagramas são expressos novamente em PED-129. Reutilizar a solução gráfica pertinente sem duplicação.

<a id="ped-061"></a>
### PED-061 — Mineração de processos por fluxo de trabalho

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 61, p. 58:**

> Dispor de funcionalidades inteligentes que permita a mineração de processos por fluxo de trabalho;

**Implementação:** Implementar análise dos eventos executados: reconstruir trajetórias por processo, agrupar variantes, contar frequências/retornos e calcular tempos definidos. Mostrar o fluxo observado e possíveis concentrações de demora, com acesso aos casos de origem. Não confundir com o desenho do fluxo previsto.

**Dados de outro módulo / serviço compartilhado:** Eventos/versões de Processos; DEP-03 para visualização/relatórios. Não exige importar dados de BI externo.

**Demonstração:** Executar F-MIN: descobrir 2 variantes com 5 e 1 casos; 7 ocorrências de Análise, 48h; duração total 62h e média 10h20. Abrir MIN-6 e localizar o retorno via Complemento.

**Aceite técnico:** Resultados são calculados dos eventos e mudam com a amostra/filtros; um caso permite auditar o percurso. Duração e espera não são misturadas sem critério.

**Atenção / limite:** Q-08: requisito amplo, sem algoritmo fixado. A solução proposta não equivale a aceitação formal de qualquer painel nem exige treinar IA.

<a id="ped-062"></a>
### PED-062 — Relatórios com drill-down

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 62, p. 58:**

> Possuir relatórios do tipo drill-down, permitindo sair de um nível mais alto e acessar informações mais detalhadas, ou níveis menores;

**Implementação:** Permitir navegar de resumo/agrupamento a níveis detalhados, preservando filtro e escopo: assunto/fluxo → processos → eventos/documentos autorizados. Cada total deve ser reconciliável com o conjunto de linhas exibido no próximo nível.

**Dados de outro módulo / serviço compartilhado:** Dados de Processos; componentes de DEP-03 quando compartilhados.

**Demonstração:** No F-GESTAO, clicar ASS-B com 8 processos, ver os 8 e abrir um histórico. No F-MIN, abrir variante de 1 caso e chegar aos eventos de MIN-6; voltar preservando filtro.

**Aceite técnico:** A navegação entrega detalhamento real correspondente ao total selecionado, sem alterar silenciosamente período ou exibir outro assunto.

**Atenção / limite:** Drill-down não é somente hyperlink para a tela inicial sem filtro. Não criar outro produto de BI.

<a id="ped-063"></a>
### PED-063 — Cadastro de fluxo por assunto

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 63, p. 58:**

> Permitir o cadastramento do fluxo por assunto;

**Implementação:** Permitir cadastrar/relacionar fluxo ao assunto, com versão aplicada e regras de início. Ao registrar processo com esse assunto, instanciar o fluxo pertinente e suas atividades iniciais, sem escolher manualmente todas as etapas.

**Dados de outro módulo / serviço compartilhado:** Assunto, modelo e instância pertencem ao módulo; DEP-01 fornece responsáveis/caixas.

**Demonstração:** Relacionar ASS-A ao fluxo com Análise e ASS-B a fluxo simples; criar um processo de cada e comparar as atividades geradas. Reabrir configuração e instâncias.

**Aceite técnico:** O assunto determina o modelo correto, persistido e utilizado; o sistema não usa sempre o mesmo fluxo hardcoded.

**Atenção / limite:** Alterar vínculo para novos processos não comprova atualização de processos ativos; essa função é PED-087.

<a id="ped-064"></a>
### PED-064 — Setores do percurso e tempo previsto em cada setor

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 64, p. 58:**

> Permitir que sejam definidos os setores onde os processos passarão e a previsão de permanência em cada setor;

**Implementação:** No fluxo, configurar os setores/caixas do percurso e a previsão de permanência correspondente, com unidade/base temporal. Aplicar as definições à instância e mostrar o próximo setor e prazo conforme a atividade.

**Dados de outro módulo / serviço compartilhado:** DEP-01: setores. Percurso e tempos de referência são de Processos.

**Demonstração:** Configurar S-PROT, S-TEC e S-DEC com 1h, 2h e 2h na fixture; tramitar e conferir destinos e previsões. Reabrir o modelo para verificar parâmetros persistidos.

**Aceite técnico:** Todos os setores previstos são definidos e seus tempos usados na instância; não são apenas descrições no diagrama.

**Atenção / limite:** Compartilha PED-101. Não presumir calendário legal ou acrescentar setores de aprovação que não foram definidos.

<a id="ped-065"></a>
### PED-065 — Assuntos permitidos a usuários ou agrupamentos

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 65, p. 58:**

> Permitir que determinados assuntos possam ser registrados por usuários específicos ou agrupamentos;

**Implementação:** Configurar quem pode registrar processos de determinado assunto por usuário/grupo, validando na interface e no servidor. Distinguir permissão de criar pelo assunto da permissão posterior de consultar/tramitar um processo recebido.

**Dados de outro módulo / serviço compartilhado:** DEP-01: usuários/grupos; relação assunto–permissão é do módulo.

**Demonstração:** Restringir ASS-A ao grupo G-PROT DEMO; tentar registrar como usuário de outro grupo por tela/API. Criar com autorizado e conferir que assunto continua acessível em consulta apenas conforme a regra pertinente.

**Aceite técnico:** Assunto restrito não pode originar processo por usuário não autorizado e a configuração pode ser alterada conforme competência, sem mudar registros anteriores.

**Atenção / limite:** Não usar restrição de assunto para exigir conta identificada na manifestação anônima de PED-068 ou eliminar o canal cidadão.

<a id="ped-066"></a>
### PED-066 — Consulta cidadã dos requisitos de protocolização

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 66, p. 58:**

> Possibilitar ao cidadão a consulta de requisitos de protocolização;

**Implementação:** Disponibilizar no portal os requisitos para protocolar por assunto/tipo: informações e documentos efetivamente configurados, forma de envio e orientação pertinente. Usar a mesma configuração validada na submissão, sem duplicar uma página estática divergente.

**Dados de outro módulo / serviço compartilhado:** Portal e DEP-03 para tipos documentais existentes; configuração por assunto é de Processos.

**Demonstração:** Como cidadão, consultar ASS-A e ASS-B antes de iniciar; comparar exigências com os respectivos formulários. Alterar uma configuração de teste e verificar a atualização da orientação.

**Aceite técnico:** O cidadão consegue saber o que será exigido e os requisitos correspondem ao formulário e à validação do servidor.

**Atenção / limite:** Não inventar requisitos legais, prazos ou documentos pessoais. A consulta de orientação não deve exigir perfil de servidor.

<a id="ped-067"></a>
### PED-067 — Ouvidoria com ciclo completo de manifestações

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 67, p. 58:**

> Dispor de um módulo de ouvidoria que deve possibilitar o registro de qualquer tipo de manifestações, com controle do seu recebimento, envio e tramitação, até seu encerramento, fornecendo informações rápidas e confiáveis;

**Implementação:** Integrar a Ouvidoria existente ao cadastro, recebimento, envio, tramitação e encerramento de manifestações com tipos configuráveis. Se não houver componente separado, implementar a função mínima no domínio deste bloco. Usar protocolo e histórico reais; não cadastrar apenas texto sem acompanhamento.

**Dados de outro módulo / serviço compartilhado:** DEP-06 se Ouvidoria já existir; DEP-01/02 para competências/identidade. Integração processual e atendimento do item permanecem no escopo.

**Demonstração:** Registrar manifestação identificada de tipo DEMO, encaminhar à unidade, receber, responder e encerrar. Consultar o percurso e o protocolo como interessado autorizado.

**Aceite técnico:** A manifestação percorre o ciclo completo, com informação persistida e resposta ligada ao mesmo registro; não há transcrição manual para outro protocolo independente.

**Atenção / limite:** Não excluir Ouvidoria como extra. Não criar gestão de campanhas, pesquisa de satisfação ou central multicanal não pedida.

<a id="ped-068"></a>
### PED-068 — Manifestação anônima sem dados pessoais obrigatórios

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 68, p. 58:**

> Dispor de funcionalidade que permita ao cidadão registrar uma ouvidoria sem a obrigatoriedade de preenchimento de dados pessoais, podendo esta manifestação ser anônima;

**Implementação:** Permitir registrar ouvidoria anônima sem nome, CPF, e-mail ou login obrigatórios. Usar indicador de anonimato, campos de conteúdo pertinentes e protocolo/chave de acompanhamento se disponível, sem pessoa fictícia. Respeitar a política do núcleo para dados técnicos de segurança.

**Dados de outro módulo / serviço compartilhado:** DEP-06 para canal de Ouvidoria quando existente; DEP-01 apenas para atendimento interno. Não exigir DEP-02 como pessoa civil do manifestante.

**Demonstração:** Em sessão sem login, enviar OUV-ANON sem dados pessoais, obter protocolo e localizar a manifestação internamente. Tramitar/encerrar sem forçar identificação posteriormente. Comparar com manifestação identificada.

**Aceite técnico:** O envio anônimo é realmente possível e persistido. Dados pessoais não são requisito oculto em outra etapa nem preenchidos artificialmente pelo servidor.

**Atenção / limite:** Q-01: compatibilizar anonimato e campo interessado do processo. Não prometer impossibilidade de identificação técnica se o serviço registra metadados de segurança.

<a id="ped-069"></a>
### PED-069 — Consulta pública de protocolos sem senha

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 69, p. 58:**

> Permitir a consulta pública (sem senha para acesso) a todos os protocolos gerados para o cidadão;

**Implementação:** Disponibilizar consulta de protocolos gerados para o cidadão sem exigir autenticação de conta, usando referência de busca e exibindo o conjunto de dados cuja publicação estiver configurada. Não restringir silenciosamente a um assunto ou à primeira página. Aplicar proteção de conteúdo sigiloso no servidor.

**Dados de outro módulo / serviço compartilhado:** Portal existente; dados de Processos e DEP-01 para política de publicação, não para login compulsório nessa consulta.

**Demonstração:** Consultar P-PUB em navegador sem login e localizar um protocolo de outra página. Tentar acesso às peças privadas de P-SIG-A pela mesma rota; conferir comportamento de proteção documentado.

**Aceite técnico:** A consulta pública funciona sem senha e alcança os protocolos do recorte autorizado; não se transforma em exigência de login para todos. Conteúdo reservado não é exposto para cumprir o teste.

**Atenção / limite:** Q-01: o alcance de “todos” junto aos itens de sigilo exige definição administrativa. Não declarar a proposta de visibilidade como interpretação oficial resolvida.

<a id="ped-070"></a>
### PED-070 — Sigilo parametrizável e consulta pelo próprio requerente

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 70, p. 59:**

> Prover sigilo das informações permitindo que somente o próprio requerente possa consultar dados relativos aos seus processos (parametrizável);

**Implementação:** Permitir parametrizar acesso externo ao conteúdo reservado para o próprio requerente/representação autorizada, mantendo competências internas necessárias. Validar vínculo no servidor em ficha, API, anexo, impressão e download; não usar apenas filtros de interface.

**Dados de outro módulo / serviço compartilhado:** DEP-01/02: identidade/vínculo; DEP-03 para arquivos protegidos. Regras de sigilo processual são do módulo.

**Demonstração:** EXT-A abre P-SIG-A; EXT-B tenta ficha, peça, exportação e chave direta do mesmo processo e é recusado. A consulta pública mostra somente o que a política permitir, sem documentos reservados.

**Aceite técnico:** O requerente autorizado consegue consultar seus dados e outro externo não consegue. Permissão interna não vira acesso público indiscriminado.

**Atenção / limite:** Q-01: não apagar a funcionalidade pública de PED-069 nem supor que saber número/chave prova identidade civil do requerente.

<a id="ped-071"></a>
### PED-071 — Definição manual de sigilo em qualquer fase

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 71, p. 59:**

> Oferecer a opção de definição manual de sigilo para cada processo registrado, podendo esta opção ser alterada em qualquer fase do processo pelo usuário protocolador ou usuário que estiver de posse do processo;

**Implementação:** Permitir ao usuário protocolador ou ao usuário com posse/competência atual do processo alterar manualmente o sigilo em qualquer fase, sob a política de autorização definida. Registrar valor anterior/novo, ator/data e revalidar acessos e caches relevantes.

**Dados de outro módulo / serviço compartilhado:** DEP-01: autoria/posse/permissões; dados de sigilo e histórico são próprios.

**Demonstração:** Definir sigilo na abertura e modificá-lo durante Análise com o usuário de posse. Testar tentativa por usuário alheio; conferir acesso de EXT-B antes/depois e relatório do evento.

**Aceite técnico:** A opção existe nas fases cabíveis e produz mudança real de acesso; não se limita a flag visual ou a configuração inicial sem atualização.

**Atenção / limite:** Q-01: efeitos de redução de sigilo exigem política configurada. Não divulgar automaticamente documentos classificados de forma mais restrita.

<a id="ped-072"></a>
### PED-072 — Sigilo por configuração de assunto

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 72, p. 59:**

> Oferecer a opção de definição de sigilo do registro mediante configuração do assunto;

**Implementação:** No assunto, definir padrão/regra de sigilo a aplicar aos novos registros e sua relação com alterações manuais. Guardar a referência aplicada ao processo, sem sobrescrever todos os históricos ao editar o padrão do assunto.

**Dados de outro módulo / serviço compartilhado:** DEP-01 para autorização de parametrização; assunto e regra são do módulo.

**Demonstração:** Configurar ASS-B reservado; criar novo processo e verificar proteção sem seleção manual. Criar ASS-A público no conjunto permitido e comparar. Alterar o padrão para novos registros em teste isolado.

**Aceite técnico:** O processo recebe o sigilo do assunto e o acesso segue a configuração efetiva; não depende exclusivamente de ação manual do operador.

**Atenção / limite:** Política de precedência entre padrão e exceção manual em Q-01. Não interpretar alteração de assunto como publicação retroativa automática.

<a id="ped-073"></a>
### PED-073 — Participação eletrônica do cidadão em processos fiscais

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 73, p. 59:**

> Dar condições ao cidadão para participar de forma eletrônica dos processos, transformando assim toda a movimentação fiscal do setor de fazenda com o contribuinte de forma eletrônica, tais como termo de Início de ação fiscal, auto de infração; notificação de lançamento de impostos e taxas; notificação; alvará de funcionamento, alvará de construção;

**Implementação:** Permitir encaminhar e disponibilizar ao contribuinte, no processo eletrônico, os tipos fiscais citados, com recebimento/interação e vínculo à origem. Preservar documentos, versão e autoria do emissor competente. Processos não deve calcular impostos nem emitir atos técnicos fora de sua responsabilidade.

**Dados de outro módulo / serviço compartilhado:** DEP-07: documentos/atos e dados de Fazenda/Obras; DEP-02: contribuinte; DEP-03/04 quando houver documento assinado.

**Demonstração:** Em F-FISCAL, testar os seis tipos: termo de início, auto de infração, notificação de lançamento de impostos/taxas, notificação, alvará de funcionamento e alvará de construção. O contribuinte acessa cada documento no respectivo processo e apresenta participação autorizada.

**Aceite técnico:** Todos os exemplos da frase podem integrar a comunicação processual digital e o acesso do contribuinte, sem papel ou transcrição interna obrigatórios.

**Atenção / limite:** Documentos fictícios comprovam o transporte/participação, não emissão fiscal oficial. Fonte ausente fica destacada; não reconstruir Tributário/Obras.

<a id="ped-074"></a>
### PED-074 — Recebimento e contestação pelo contribuinte

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 74, p. 59:**

> O sistema deverá permitir ainda que o Contribuinte receba / conteste os processos recebidos;

**Implementação:** Disponibilizar ações externas de receber/cientificar conforme o mecanismo adotado e apresentar contestação ao processo/documento recebido, com conteúdo/peças, autoria, data e referência. A contestação deve chegar à caixa/atividade interna correspondente sem abrir processo desconectado por erro.

**Dados de outro módulo / serviço compartilhado:** DEP-07: processo/documento de origem; DEP-01/02: identidade; DEP-03: peça. Interação e trâmite são deste módulo.

**Demonstração:** EXT-A recebe uma notificação de F-FISCAL e protocola contestação com documento; U-TEC visualiza e recebe na mesma cadeia. Testar contribuinte de outro processo e reenvio da mesma contestação.

**Aceite técnico:** Recebimento e contestação ficam registrados, com conteúdo recuperável e origem correta; usuário alheio não contesta processo privado e reenvio não duplica o ato.

**Atenção / limite:** Não inventar prazo de defesa, efeito suspensivo ou decisão automática. O teste não substitui regra jurídica de ciência, a definir em Q-10.

<a id="ped-075"></a>
### PED-075 — Cronograma integrado à tramitação

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 75, p. 59:**

> Disponibilizar a funcionalidade de cronograma permitindo planejar atividade para execução e gerenciar as atividades já executadas, integrada com a tramitação de processos;

**Implementação:** Disponibilizar cronograma de atividades previstas e executadas, com responsável, datas e vínculo ao processo/atividade do fluxo. Mostrar estado real e permitir navegar à operação pertinente; alterações efetuadas no processo devem refletir no cronograma.

**Dados de outro módulo / serviço compartilhado:** DEP-01 para responsáveis; componente de cronograma existente se compartilhado. Vínculos/atividades são de Processos.

**Demonstração:** Em F-CRONO, planejar três atividades, executar uma vinculada ao processo e verificar previsto/realizado. Abrir o andamento pelo cronograma e comparar situação e responsável.

**Aceite técnico:** Planejamento e execução são gerenciados com a mesma fonte processual, sem agenda decorativa ou tabela de tarefas independente e divergente.

**Atenção / limite:** Não criar gestão ampla de projetos, caminho crítico, orçamento de obra ou agenda de pessoal por este item.

<a id="ped-076"></a>
### PED-076 — Criação de processo a partir do cronograma

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 76, p. 59:**

> Permitir a criação de processos originados pelo cronograma;

**Implementação:** Oferecer ação de criar processo a partir de atividade planejada, herdando os dados disponíveis e solicitando apenas os obrigatórios faltantes. Guardar relação cronograma–atividade–processo e garantir que repetir a mesma confirmação não duplique a abertura.

**Dados de outro módulo / serviço compartilhado:** DEP-01/02: responsáveis/interessado quando herdados; cronograma e protocolo são deste módulo.

**Demonstração:** Gerar processo pela segunda atividade de F-CRONO; conferir número, assunto e origem. Reenviar o comando e verificar que permanece um processo vinculado, enquanto as outras atividades não geraram processos.

**Aceite técnico:** A criação decorre do cronograma e pode ser rastreada em ambos os sentidos, com validação e numeração reais.

**Atenção / limite:** Não criar processos automaticamente para todas as atividades sem ato/configuração prevista nem preencher interessado fictício.

<a id="ped-077"></a>
### PED-077 — Andamento e providências acessíveis pelo cronograma

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 77, p. 59:**

> Permitir que o andamento e providências de processos possam ser acessadas pelo cronograma;

**Implementação:** Na atividade do cronograma, permitir abrir andamento e providências do processo relacionado e acessar a ação autorizada. Atualizar os indicadores a partir das mesmas atividades/eventos; não copiar texto de status sem sincronização.

**Dados de outro módulo / serviço compartilhado:** Dados do cronograma/Processos; DEP-01 para acesso. Dependências setoriais permanecem na origem do processo.

**Demonstração:** Abrir pelo cronograma o processo da segunda atividade, concluir uma providência na ficha e voltar. Conferir o mesmo resultado e navegar novamente ao histórico.

**Aceite técnico:** O cronograma oferece acesso funcional ao andamento/providências e não diverge da ficha do processo após atualização.

**Atenção / limite:** Não inventar tarefas adicionais nem esconder providências de outra página para manter a tela curta.

<a id="ped-078"></a>
### PED-078 — Observações em cada fase

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 78, p. 59:**

> Permitir inserir observação em cada fase dos processos;

**Implementação:** Permitir registrar observação ligada à fase/atividade correspondente, com autoria/data e política de visibilidade. Preservar a fase em que foi escrita mesmo após o avanço e permitir consulta no histórico, sem misturar observação com parecer formal ou decisão.

**Dados de outro módulo / serviço compartilhado:** DEP-01: ator/permissão; textos/fases são próprios do módulo.

**Demonstração:** Registrar observações diferentes em Triagem, Análise e Decisão; avançar e reabrir o histórico de cada fase. Verificar visibilidade privada/pública conforme configuração.

**Aceite técnico:** As observações persistem com sua fase e não são substituídas por um único campo geral que mostra apenas o último texto.

**Atenção / limite:** Não tornar observação compulsória em todas as fases sem regra definida nem usar seu texto como substituto de assinatura.

<a id="ped-079"></a>
### PED-079 — Planejamento das atividades e ações do processo

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 79, p. 59:**

> Poder planejar as atividades/ações do processo a serem executadas;

**Implementação:** Permitir planejar atividades/ações a executar no processo, definindo responsável, prazo previsto e relação com fluxo/cronograma quando pertinente. Reutilizar a estrutura de tarefas, distinguindo planejamento da comprovação de execução.

**Dados de outro módulo / serviço compartilhado:** DEP-01: responsáveis; atividade/fluxo/cronograma são do módulo.

**Demonstração:** Planejar duas ações para P-A, concluir uma e deixar outra prevista. Consultar a ficha e o cronograma e conferir os estados separados.

**Aceite técnico:** As ações planejadas são recuperáveis e gerenciáveis, com ligação ao processo e transição para realizado apenas após operação efetiva.

**Atenção / limite:** Não acrescentar metodologia de projetos, aprovação extra ou cálculo de custos que o item não descreve.

<a id="ped-080"></a>
### PED-080 — Autocadastro de cidadão, servidor e pessoa jurídica

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 80, p. 59:**

> Possuir funcionalidade para que uma pessoa física (cidadão ou servidor ou uma pessoa jurídica) possam se cadastrar como usuários do sistema, para posterior protocolização de processos digitais;

**Implementação:** Reutilizar conta/cadastro de pessoas para permitir ao cidadão PF, ao servidor conforme vínculo e à PJ por representante se cadastrarem para protocolar. Mapear tipos e representação, sem conceder privilégios internos a quem se declara servidor ou empresa. Validar dados e consentimentos do fluxo existente.

**Dados de outro módulo / serviço compartilhado:** DEP-01/02: autenticação, Pessoas e representação. Processos utiliza a conta para protocolização.

**Demonstração:** Cadastrar EXT-A, um perfil de servidor de teste e EXT-PJ com representação apropriada; entrar e iniciar protocolo com cada identidade. Tentar ampliar privilégios alterando tipo na requisição.

**Aceite técnico:** Os três contextos são viáveis e se vinculam aos processos corretos; cadastro externo não cria administrador nem outra base de identidades.

**Atenção / limite:** Não exigir certificado ou validação externa nova sem regra existente. Autocadastro não deve impedir a manifestação anônima de PED-068.

<a id="ped-081"></a>
### PED-081 — Tramitação entre órgãos da municipalidade

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 81, p. 59:**

> Permitir a tramitação de processos entre órgãos da municipalidade;

**Implementação:** Permitir encaminhar e receber entre órgãos pertencentes à municipalidade, usando caixas e permissões identificadas e preservando número/histórico. Não confundir esse trânsito autorizado com acesso entre municípios/ambientes isolados.

**Dados de outro módulo / serviço compartilhado:** DEP-01: órgãos/escopos e usuários. Encaminhamento e recebimento são deste módulo.

**Demonstração:** Encaminhar processo de ORG-A a ORG-B no ensaio, receber com usuário autorizado de B e consultar origem/destino. Tentar envio a órgão de ambiente não permitido.

**Aceite técnico:** Trâmite interórgãos funciona na mesma cadeia processual; acesso indevido entre ambientes não é aberto como atalho de integração.

**Atenção / limite:** Não criar integração federal/estadual ou replicação de bases por este item; destinatários e competências reais em Q-10.

<a id="ped-082"></a>
### PED-082 — Autenticação de documento por chave

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 82, p. 59:**

> Disponibilizar a autenticação do documento emitido via chave de acesso;

**Implementação:** Gerar/vincular identificação ou chave de autenticação ao documento emitido e oferecer consulta correspondente à versão. Tratar chave inexistente/revogada/versão divergente com resposta clara e não confundir autenticação documental com login do usuário.

**Dados de outro módulo / serviço compartilhado:** DEP-03/04: emissão e validação quando aplicável; portal de consulta existente.

**Demonstração:** Emitir dois documentos de F-DOC; consultar cada chave e conferir referência/versão distintas. Testar chave inválida e acesso ao conteúdo reservado conforme política.

**Aceite técnico:** A chave recupera o documento correto e seu estado de autenticidade disponível; não há resposta genérica “válido” para qualquer entrada.

**Atenção / limite:** Compartilha PED-035/083. Chave pública não libera peças sigilosas nem certifica conteúdo físico por si só; Q-01/Q-04.

<a id="ped-083"></a>
### PED-083 — QR Code para consulta de documento emitido

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 83, p. 59:**

> Disponibilizar QR Code para a consulta de documentos emitidos pelo sistema;

**Implementação:** Incluir QR Code real ligado à consulta do documento/versão emitidos. Utilizar endereço estável do portal da contratante e preservar conteúdo do código entre visualização/impressão. Preparar o código antes da assinatura quando fizer parte do arquivo.

**Dados de outro módulo / serviço compartilhado:** DEP-03: geração/arquivo; portal/serviço de autenticidade; DEP-04 quando assinado.

**Demonstração:** Ler os códigos de dois documentos distintos com o celular e conferir que abrem as consultas certas. Imprimir e testar a legibilidade sem cortar o código.

**Aceite técnico:** QR Code não é imagem repetida/decorativa; cada leitura identifica a emissão correta e respeita o escopo de divulgação.

**Atenção / limite:** Não desenvolver aplicativo leitor próprio; usar leitura disponível no aparelho. Endereço e política em Q-01/Q-04.

<a id="ped-084"></a>
### PED-084 — Modelos de documentos reutilizáveis no procedimento

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 84, pp. 59–60:**

> Deve permitir o cadastro de inúmeros modelos de documentos utilizados pela municipalidade, podendo ser utilizado no procedimento mapeado;

**Implementação:** Permitir manter múltiplos modelos de documentos sem limite funcional arbitrário pequeno, com tipos, versões, campos e associação ao procedimento. Reutilizar a biblioteca de PED-027/056 e oferecer busca/paginação conforme crescer.

**Dados de outro módulo / serviço compartilhado:** DEP-03: editor/biblioteca se compartilhados; associação aos fluxos é de Processos.

**Demonstração:** Criar pelo menos três modelos de teste, usar dois em procedimentos diferentes e editar um para nova versão. Conferir que os demais e documentos já emitidos permanecem independentes.

**Aceite técnico:** Os modelos são persistidos, selecionáveis e usados no procedimento mapeado; não existe somente um texto fixo por tela.

**Atenção / limite:** “Inúmeros” não é promessa de capacidade física infinita. Não inventar modelos oficiais nem criar catálogo de templates de outro produto.

<a id="ped-085"></a>
### PED-085 — Espécie documental com extensões e tamanhos

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 85, p. 60:**

> Possuir o atributo de espécie documental, permitindo a definição da extensão dos arquivos e respectivos tamanhos, quando anexados a processo;

**Implementação:** Configurar por espécie documental as extensões e tamanhos permitidos para anexação, com unidade clara. Aplicar na seleção e na validação do servidor, verificando tipo real do conteúdo quando possível. Preservar política vigente de anexos já aceitos.

**Dados de outro módulo / serviço compartilhado:** DEP-03: tipos/armazenamento/validação; Processos associa a espécie à peça.

**Demonstração:** DOC-REQ permite PDF e DOC-COMP permite imagem na fixture, com limites de teste explícitos; anexar válidos e rejeitar tamanho/formatos incompatíveis. Repetir tentativa pela API.

**Aceite técnico:** Espécie é atributo real e sua configuração altera o comportamento de anexação; não é lista meramente informativa sem validação.

**Atenção / limite:** Valores concretos de limite são configuração de teste, não do TR. Não exigir novos documentos pelo simples fato de definir formatos.

<a id="ped-086"></a>
### PED-086 — E-mail com protocolo e histórico — função compartilhada

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 86, p. 60:**

> Deve permitir o envio de dados do processo registrado através de e-mail contendo link para acesso ao Comprovante de Protocolização e ainda ao Histórico de Andamento;

**Implementação:** Reutilizar o evento e serviço de PED-008 para enviar dados do processo registrado com acesso ao comprovante e histórico. Manter identificação deste requisito no acompanhamento sem disparar e-mail duplicado apenas por haver dois itens semelhantes.

**Dados de outro módulo / serviço compartilhado:** DEP-05: e-mail; DEP-02: contato; DEP-03: comprovante. Dados são do processo.

**Demonstração:** Usar a mensagem de P-A, abrir novamente os dois conteúdos após novo trâmite e conferir histórico atualizado e comprovante original. Testar permissão no mesmo link.

**Aceite técnico:** Os dois acessos continuam funcionais e ligados ao processo; uma mesma implementação/evidência pode atender 8 e 86, sem omitir este ID.

**Atenção / limite:** Não criar outra rotina de notificação ou considerar log como recebimento comprovado. Configuração operacional em Q-13.

<a id="ped-087"></a>
### PED-087 — Aplicação automática de alteração do fluxo aos processos ativos

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 87, p. 60:**

> Realizar a atualização automática das atividades dos processos em sua tramitação, quando for aplicada a alteração em um fluxo;

**Implementação:** Versionar o fluxo e permitir aplicar alteração aos processos abrangidos, mapeando atividades/condições e atualizando automaticamente as pendentes/em andamento compatíveis. Pré-validar conflitos, registrar resultado por instância e preservar eventos concluídos/assinaturas. Não atender apenas processos novos.

**Dados de outro módulo / serviço compartilhado:** Motor/instâncias são próprios. DEP-01: autor da alteração; DEP-03/04 para preservar peças assinadas relacionadas.

**Demonstração:** F-VERSAO: dois processos já ativos recebem alteração do prazo futuro de 2h para 3h quando v2 é aplicada. Conferir as atividades sem recadastro. Terceiro caso com remoção da etapa atual sem mapeamento deve apontar conflito antes de aplicar.

**Aceite técnico:** Há atualização real e rastreável de instâncias já em tramitação, sem perder atividades, repetir documentos ou fingir migração dos casos conflitantes.

**Atenção / limite:** Q-10: alcance e política de migração devem ser definidos. Preservar histórico não justifica deixar todos os ativos na versão antiga sem atualizar.

<a id="ped-088"></a>
### PED-088 — Atividade, responsável e situação atualizados em tempo real

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 88, p. 60:**

> Permitir visualizar em tempo real a atividade atual, o responsável e a situação de qualquer fluxo;

**Implementação:** Exibir atividade atual, responsável e situação de cada instância consultada com atualização automática compatível com a arquitetura. Informar estado de conexão/última atualização quando houver perda de comunicação e revalidar permissões; não usar valores fixos ou depender exclusivamente de F5.

**Dados de outro módulo / serviço compartilhado:** DEP-01: usuário/responsável; canal de atualização compartilhado se existente. Fonte é a instância do fluxo.

**Demonstração:** Abrir duas sessões; tramitar e mudar responsável na primeira e observar a segunda atualizando os três campos automaticamente. Medir latência, desconectar/reconectar e conferir recuperação.

**Aceite técnico:** Os três dados refletem o estado persistido e mudam sem recarga manual exigida. Sessão desconectada não apresenta dado antigo como atualização garantida.

**Atenção / limite:** O TR não define latência máxima. Registrar método/medição em Q-10, sem impor nova infraestrutura por suposição ou chamar simples recarga de “tempo real”.

<a id="ped-089"></a>
### PED-089 — Fluxo auxiliar reutilizado em vários procedimentos

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 89, p. 60:**

> Permitir a quebra de fluxos, sendo possível a utilização de um fluxo auxiliar em N procedimentos;

**Implementação:** Permitir quebrar a execução em fluxo principal/auxiliar, cadastrando chamada, entradas, retorno e referência de versão. Reutilizar o modelo auxiliar em N procedimentos com instâncias isoladas. Validar ciclos/limites e não compartilhar estado de execução entre requerentes.

**Dados de outro módulo / serviço compartilhado:** Fluxos/instâncias/formulários pertencem a Processos; DEP-01 fornece participantes.

**Demonstração:** F-SUBFLUXO: dois procedimentos chamam Conferência documental DEMO; concluir a primeira instância e verificar retorno ao pai correspondente, enquanto a segunda continua pendente.

**Aceite técnico:** O mesmo modelo é reutilizável sem cópia manual e cada chamada conserva seus dados/resultado. O retorno não pula fase de outro processo.

**Atenção / limite:** Não converter em biblioteca de scripts arbitrários ou proibir todos os retornos válidos do fluxo; controlar recursão sem retirar a função.

<a id="ped-090"></a>
### PED-090 — Pesquisa de processos e documentos com critérios combináveis

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 90, p. 60:**

> Possuir a facilidade de pesquisa de processos/documentos, oferecendo diversas formas de pesquisa, incluindo a pesquisa por identificador do processo e outros parâmetros que possam ser agrupados;

**Implementação:** Permitir pesquisar processos/documentos por identificador e demais parâmetros configurados/expressos, combinando-os e respeitando permissões. Distinguir busca no cadastro do processo e nas peças; usar índices/consulta existentes sem varrer apenas a página atual.

**Dados de outro módulo / serviço compartilhado:** DEP-03 quando índice/documento vier do GED; metadados processuais próprios; DEP-02 para requerente.

**Demonstração:** Pesquisar P-A por identificador mais assunto/data; localizar documento por sua identificação combinada ao processo. Testar resultados em páginas posteriores, sem correspondência e conteúdo privado de outro requerente.

**Aceite técnico:** Combinações retornam conjuntos corretos e documentos pertencem ao processo apresentado, sem vazamento de conteúdo fora do escopo.

**Atenção / limite:** Não exigir busca semântica, reconhecimento facial ou indexação irrestrita de arquivos sigilosos. Reutiliza critérios de PED-046.

<a id="ped-091"></a>
### PED-091 — Dashboards gerenciais de protocolização

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 91, p. 60:**

> Possibilitar a emissão de Informações Gerenciais de Protocolização em dashboards gerenciais inteligentes oferecendo uma visão visual e intuitiva dos registros;

**Implementação:** Disponibilizar área gerencial com indicadores e visualizações de protocolização derivados dos registros: totais por assunto/situação/período e acesso aos detalhes pertinentes. A composição é decisão de projeto; os dados e filtros devem ter significado explícito e cobrir o conjunto autorizado completo.

**Dados de outro módulo / serviço compartilhado:** Dados de Processos; DEP-03 para componentes gráficos/relatório quando compartilhados.

**Demonstração:** F-GESTAO: conferir 23 registros e divisão 10/8/5; abrir o detalhe de ASS-B. Alterar um processo no cenário e verificar atualização do resumo correspondente, sem dados estáticos.

**Aceite técnico:** Dashboard é visual/intuitivo e baseado nas operações reais, com totais conciliáveis e sem limitar-se à página da tabela.

**Atenção / limite:** Dashboard é exigido aqui, não extra. Não acrescentar IA preditiva, ranking de servidores ou painel financeiro sem fonte.

<a id="ped-092"></a>
### PED-092 — Múltiplas assinaturas no mesmo documento

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 92, p. 60:**

> Permitir múltiplas assinaturas no mesmo documento;

**Implementação:** Permitir mais de um signatário na mesma versão/conteúdo documental, produzindo documento final com as assinaturas e preservando a validade das anteriores no formato suportado. Controlar concorrência/versionamento para não sobrescrever a primeira assinatura com a segunda.

**Dados de outro módulo / serviço compartilhado:** DEP-04: assinador/verificador aptos a múltiplas assinaturas; DEP-03: versões e bytes.

**Demonstração:** SIG-A assina documento de F-DOC; SIG-B assina em seguida. Abrir/baixar o resultado único e verificar as duas assinaturas. Testar tentativa de assinar versão de conteúdo alterado.

**Aceite técnico:** O mesmo documento final contém ambas as assinaturas verificáveis; dois arquivos separados com uma assinatura cada não atendem à demonstração.

**Atenção / limite:** Q-04: não presumir que qualquer biblioteca/provedor preserve coassinatura. Confirmar formato e testar; nunca recompor PDF apagando assinatura anterior.

<a id="ped-093"></a>
### PED-093 — Gestão de assinaturas de registros

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 93, p. 60:**

> Dispor de funcionalidade que gerencie as assinaturas de registros;

**Implementação:** Gerenciar solicitações, signatários, registro/versão alvo e estados de assinatura pelo mecanismo existente, abrangendo documentos e atos pertinentes. Exibir pendências e resultados reais, com data e identidade; comandos de reenvio/alteração usam política de versão, não marcação manual de “assinado”.

**Dados de outro módulo / serviço compartilhado:** DEP-04: resultado de assinatura; DEP-05 para convites; DEP-03 para documento. Orquestração e vínculo ao registro são do módulo.

**Demonstração:** Solicitar duas assinaturas em F-DOC, concluir uma e consultar a gestão; concluir a segunda e conferir estado final. Testar retorno falho e assinatura associada a versão diferente.

**Aceite técnico:** O controle distingue solicitado, parcial/pendente e concluído conforme o conjunto requerido, com origem verificável de cada assinatura.

**Atenção / limite:** Não criar autoridade certificadora nem sistema genérico de contratos eletrônicos separado. Cancelamento/expiração seguem mecanismo já adotado.

<a id="ped-094"></a>
### PED-094 — Identificação de documentos pendentes de assinatura

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 94, p. 60:**

> Possibilitar identificar documentos pendentes de assinatura;

**Implementação:** Disponibilizar consulta/filtro ou indicação contextual de documentos com assinatura requerida ainda pendente. Calcular a partir das solicitações e signatários da versão atual; não considerar assinado um documento que recebeu apenas uma de duas assinaturas exigidas.

**Dados de outro módulo / serviço compartilhado:** DEP-04: solicitações/resultados; DEP-03: documento e versão; dados da gestão do módulo.

**Demonstração:** Solicitar SIG-A/SIG-B para um documento; depois da primeira, conferir a pendência da segunda; concluir e verificar sua saída da lista de pendentes correspondente.

**Aceite técnico:** A pendência é identificável e leva ao documento/ação correta, sem depender de planilha manual ou flag fixa.

**Atenção / limite:** Não transformar todo documento sem solicitação em pendente obrigatório. Lista deve indicar o critério aplicado.

<a id="ped-095"></a>
### PED-095 — Identificação dos documentos assinados

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 95, p. 60:**

> Possibilitar fácil identificação de documentos que foram assinados;

**Implementação:** Apresentar indicador/filtro de documentos assinados com versão, signatários e acesso à informação de verificação. Distinguir assinatura parcial do conjunto requerido, documento sem assinatura e versão antiga assinada quando houver nova versão pendente.

**Dados de outro módulo / serviço compartilhado:** DEP-04: assinatura/verificação; DEP-03: versão documental.

**Demonstração:** Consultar documento com duas assinaturas concluídas e outro ainda pendente; abrir o indicador e conferir os signatários/versão. Criar nova versão editável em teste e observar a distinção.

**Aceite técnico:** Documentos assinados são facilmente reconhecidos sem confundir versões ou estado parcial; o indicador corresponde ao resultado real.

**Atenção / limite:** Não usar cor isolada, imagem decorativa ou edição manual de status como comprovação da assinatura.

<a id="ped-096"></a>
### PED-096 — Solicitação de assinatura de terceiros por e-mail

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 96, p. 60:**

> Oferecer a funcionalidade de solicitar assinaturas de terceiros, proporcionando a conveniência de realizar o envio por e-mail aos signatários;

**Implementação:** Permitir selecionar terceiro/signatário autorizado e enviar solicitação por e-mail com link para o documento/versão, instruções e escopo limitado. Associar o retorno à solicitação correta; aplicar o mecanismo existente de autenticação/assinatura e não transmitir senha permanente.

**Dados de outro módulo / serviço compartilhado:** DEP-05: envio; DEP-04: assinatura; DEP-02: contato/signatário; DEP-03: arquivo.

**Demonstração:** Enviar a CX-SIG convite para SIG-B assinar F-DOC; receber, abrir, conferir conteúdo e concluir a assinatura pelo serviço apto. Tentar usar o link para outro documento/versão.

**Aceite técnico:** O terceiro recebe a solicitação e pode assinar o alvo correto; o resultado aparece na gestão sem vínculo indevido ou falso sucesso.

**Atenção / limite:** Q-04/Q-13: depende de serviço e caixa reais autorizados. Não exigir criação de usuário administrador ao terceiro nem apresentar envio em log como entrega.

<a id="ped-097"></a>
### PED-097 — Conversão de documento editável para PDF

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 97, p. 60:**

> Possibilitar a conversão de documentos editáveis para o formato PDF;

**Implementação:** Integrar a conversão do conteúdo/modelo editável e formatos efetivamente suportados para PDF, mantendo versão de origem, conteúdo e imagens. Registrar falhas de conversão e validar o arquivo gerado, sem apenas renomear extensão.

**Dados de outro módulo / serviço compartilhado:** DEP-03: editor/conversor/arquivo. Relação origem–PDF e uso processual são do módulo.

**Demonstração:** Criar um documento com texto, tabela e imagem no editor e converter a PDF; abrir todas as páginas e comparar. Converter um editável externo suportado em cenário complementar e testar erro de formato.

**Aceite técnico:** PDF gerado corresponde ao conteúdo fonte e é visualizável/imprimível; não perde trechos ou imagens silenciosamente.

**Atenção / limite:** Lista de formatos suportados em Q-03. Não prometer conversão fiel de todo formato proprietário nem alterar PDF assinado para reconverter.

<a id="ped-098"></a>
### PED-098 — Envio e tramitação de processos em lote

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 98, p. 60:**

> Possuir função para efetuar a tramitação/envio de processos em lote;

**Implementação:** Permitir selecionar múltiplos processos e enviar/tramitar em uma ação, com alcance/destino explícitos e validação de cada processo/versão/permissão. Gerar eventos e comprovantes correspondentes, protegendo reenvio. Retornar resultado identificável por registro, conforme contrato operacional.

**Dados de outro módulo / serviço compartilhado:** DEP-01: permissão/setores; DEP-03: comprovantes. Operações de transporte são próprias.

**Demonstração:** F-LOTES: selecionar 12 processos entre duas páginas e enviar; conferir os 12 no destino e seus históricos. Testar conjunto com 1 inválido e repetir apenas os pendentes conforme a política adotada.

**Aceite técnico:** Todos os selecionados válidos recebem o efeito correto, sem limitar à página visível nem declarar sucesso total quando houve falha.

**Atenção / limite:** Lote não autoriza mudar destino de processos incompatíveis com seus fluxos. Atomicidade/resultado parcial devem ser explícitos em Q-10.

<a id="ped-099"></a>
### PED-099 — Recebimento de processos em lote

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 99, p. 60:**

> Possuir recurso para receber os processos em lote;

**Implementação:** Permitir receber múltiplos envios pendentes, validando destinatário, estado Enviado e versão de cada um. Registrar ator/data por recebimento, atualizar caixas/atividades e impedir recebimento duplicado ou de envio cancelado.

**Dados de outro módulo / serviço compartilhado:** DEP-01: destinatário/perfil; caixa/trâmite/atividade são dados nativos.

**Demonstração:** Receber os 12 envios válidos de F-LOTES; conferir eventos individuais e fila atualizada. Testar lote com um já recebido/cancelado e concorrência com cancelamento pelo remetente.

**Aceite técnico:** Recebimento em lote funciona para o conjunto selecionado com resultado real por processo; uma nova tentativa não recebe novamente os mesmos envios.

**Atenção / limite:** Compartilhar infraestrutura com envio em lote, mas não confundir os dois atos nem preencher data de recebimento no envio.

<a id="ped-100"></a>
### PED-100 — Próxima fase determinada pelo fluxo

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 100, p. 60:**

> Deve permitir que nos processos que possuem fluxo, o “caminho” a ser percorrido esteja definido, ou seja, o usuário não precisa informar qual a próxima fase que receberá o processo;

**Implementação:** Para processos com fluxo, resolver o próximo destino a partir da atividade/condições configuradas e mostrar a ação pertinente ao operador, sem exigir que ele escolha novamente a próxima fase. Validar pré-condições e exibir destino calculado antes da confirmação quando necessário.

**Dados de outro módulo / serviço compartilhado:** DEP-01: resolução de participantes; condições/formulários/fluxo são próprios do módulo.

**Demonstração:** Executar as duas ramificações de F-FORM; concluir Triagem e verificar que Análise ou Decisão é definida automaticamente pela resposta, sem campo obrigatório de seleção manual do caminho.

**Aceite técnico:** O percurso predefinido é efetivamente executado e a atividade seguinte é criada/encaminhada para o participante correto; não há destino hardcoded igual em todos os assuntos.

**Atenção / limite:** Não escolher caminho aleatório em configuração incompleta. Exibir pendência de modelagem em vez de pedir ao usuário comum que improvise a regra.

<a id="ped-101"></a>
### PED-101 — Setores e previsão de permanência — função compartilhada

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 101, p. 61:**

> Oferecer a possibilidade de definir os setores por onde os processos irão transitar, incluindo a previsão de tempo de permanência em cada setor;

**Implementação:** Reutilizar a definição de setores e tempos de PED-064, conservando este ID na rastreabilidade. A sequência e as previsões devem participar da execução, das consultas e da documentação do fluxo, não apenas da representação visual.

**Dados de outro módulo / serviço compartilhado:** DEP-01: setores/participantes; configurações e eventos são do módulo.

**Demonstração:** Reabrir o fluxo de F-FORM e conferir S-PROT/S-TEC/S-DEC com os tempos configurados. Percorrer uma instância e comparar previsão/tempo observado por setor.

**Aceite técnico:** O percurso e seus tempos são configuráveis, persistidos e aplicados. Compartilhar implementação não elimina a evidência deste requisito.

**Atenção / limite:** Não criar outro cadastro de setores nem fixar tempos legais. Compartilha Q-10 com PED-064.

<a id="ped-102"></a>
### PED-102 — Arquivos existentes no computador tornam-se peças

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 102, p. 61:**

> Deve permitir a captura de arquivos digitais já existentes na máquina do usuário, ou seja, produzidos fora do aplicativo. Tais arquivos, quando juntados, devem se tornar peças do processo administrativo selecionado;

**Implementação:** Permitir selecionar arquivo digital já existente na máquina do usuário e juntá-lo ao processo escolhido, criando peça com conteúdo, espécie, autoria, data e ordem. Validar upload e associação antes de apresentar sucesso; preservar original e formatos suportados.

**Dados de outro módulo / serviço compartilhado:** DEP-03: armazenamento/visualizador; índice e vínculo processual são próprios.

**Demonstração:** Escolher PDF e imagem produzidos fora do CeleriFlow, anexar a P-A e verificar sua presença no índice e visualizador. Conferir que não entraram em outro processo aberto em outra aba.

**Aceite técnico:** Os arquivos passam a integrar o processo correto como peças recuperáveis; não ficam apenas em pasta temporária ou lista de anexos locais.

**Atenção / limite:** Capturar arquivo existente não comprova digitalização física dos itens 117/121; não confundir upload com acesso ao scanner.

<a id="ped-103"></a>
### PED-103 — Número do processo, foliação sequencial e ordem cronológica

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 103, p. 61:**

> Todos os documentos produzidos e juntados deverão conter o número do processo administrativo, bem como ter suas folhas numeradas sequencialmente; As peças processuais devem ser apresentadas em ordem cronológica de inserção;

**Implementação:** Aplicar número do processo e folhas sequenciais aos documentos produzidos/juntados na representação processual, reservando intervalos de modo concorrente seguro e guardando ordem de inserção. Preservar originais; documentos externos assinados seguem tratamento de cópia vinculada, sem adulterar sua assinatura.

**Dados de outro módulo / serviço compartilhado:** DEP-03: paginação/renderização/arquivo; DEP-04 para preservar assinaturas. Controle de peças/folhas é do módulo.

**Demonstração:** F-DOC: peças de 2, 3 e 1 páginas recebem intervalos 1–2, 3–5 e 6; nova peça de 2 páginas recebe 7–8, considerando deslocamento H de peças automáticas existentes. Abrir documentos, conferir ordem e executar duas juntadas concorrentes.

**Aceite técnico:** Número e foliação são visíveis na representação documental, intervalos não colidem e ordem é de inserção. Não basta numerar linhas no grid nem modificar original assinado sem aviso.

**Atenção / limite:** Q-03: validar tratamento de originais assinados, arquivos não pagináveis e volumes. Não declarar atendimento integral desse caso especial sem representação acordada.

<a id="ped-104"></a>
### PED-104 — Composição digital, digitalizada, física, mista ou não classificada

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 104, p. 61:**

> Os usuários poderão indicar a composição do documento, podendo ser digital, digitalizado, físico, misto ou não classificado;

**Implementação:** Disponibilizar atributo de composição com todas as cinco opções da fonte, associado ao documento e recuperável na ficha. Não inferir automaticamente que todo registro sem upload seja físico, nem confundir composição com extensão/espécie.

**Dados de outro módulo / serviço compartilhado:** DEP-03 quando metadados documentais forem compartilhados; dados do registro processual.

**Demonstração:** Criar cinco documentos de teste, um por opção, preencher identificação pertinente e reabrir. Alterar composição em registro editável e consultar o histórico da mudança.

**Aceite técnico:** As cinco categorias são selecionáveis e persistidas; o sistema distingue composição, formato e espécie documental.

**Atenção / limite:** Registro de documento físico não substitui digitalização/assinatura de documento digitalizado exigidas em outros itens. Não inventar arquivo digital de um papel não capturado.

<a id="ped-105"></a>
### PED-105 — Notas e comentários em documentos e processos

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 105, p. 61:**

> Integrar uma funcionalidade de notas e comentários nos documentos e processos, facilitando a comunicação entre os usuários;

**Implementação:** Permitir notas/comentários vinculados ao processo ou documento específico, com autoria, data e visibilidade pertinentes. Diferenciar comentários de pareceres e atos de decisão; aplicar acesso em consultas e relatórios, preservando o contexto da peça.

**Dados de outro módulo / serviço compartilhado:** DEP-01: usuário/permissão; DEP-03 para referência à peça quando compartilhada. Função contextual é deste módulo.

**Demonstração:** Registrar comentário em P-A e outro somente em uma peça; reabrir ambos e conferir o contexto. Consultar como externo sem acesso ao comentário privado e tentar acesso direto.

**Aceite técnico:** Notas/comentários são recuperáveis no objeto correto, com autoria e sem vazamento. Não aparecem indiscriminadamente em todas as peças.

**Atenção / limite:** Não criar chat geral, rede social ou notificação em canal não pedido. Comentário não altera bytes de documento assinado.

<a id="ped-106"></a>
### PED-106 — Apensação temporária de documentos

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 106, p. 61:**

> O sistema deverá dispor de apensação, que permita realizar a união/junção de documentos, em caráter temporário;

**Implementação:** Permitir união/junção temporária entre documentos, com identificação dos componentes, relação principal/associado, vigência/ato quando pertinente e histórico. Reutilizar infraestrutura de vínculos, mas distinguir documentos de processos de PED-045. Desfazer relação permitida preserva originais e eventos.

**Dados de outro módulo / serviço compartilhado:** DEP-03: documentos/termos; relações e atos no processo são deste módulo.

**Demonstração:** Apensar dois documentos DEMO, consultar sua união e acessar ambos; desfazer o vínculo temporário conforme a regra e verificar que os documentos continuam disponíveis e o histórico registra a operação.

**Aceite técnico:** A junção é temporária e controlada, não mera fusão destrutiva de PDFs ou cópia sem identidade. Os componentes permanecem rastreáveis.

**Atenção / limite:** Q-07: esclarecer relação documental e rito de desfazimento. Não usar apensação de processos como única evidência deste item que menciona documentos.

<a id="ped-107"></a>
### PED-107 — Informação de tempo de guarda e descarte no encerramento

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 107, p. 61:**

> No encerramento do processo poderá ser informado qual o tempo de guarda e descarte;

**Implementação:** Na conclusão, permitir informar/referenciar tempo de guarda e descarte segundo a classificação aplicável, conservando unidade, data-base e resultado de prazo quando calculado. Mostrar a informação na ficha/termo de encerramento conforme modelo e manter trilha de alterações autorizadas.

**Dados de outro módulo / serviço compartilhado:** DEP-12: referência arquivística; DEP-03: termo. Controle e dados do encerramento pertencem a Processos.

**Demonstração:** F-ARQ: encerrar com prazo de guarda de teste e informação de destinação, reabrir e conferir. Alterar uma configuração em outro cenário sem reescrever o encerramento anterior.

**Aceite técnico:** O encerramento registra os dados de guarda/descarte e permite consulta posterior; não há eliminação automática de documentos por simples data vencida.

**Atenção / limite:** Q-02: valores fictícios não comprovam tabela oficial. Informar prazo não autoriza destruir arquivo, apagar assinatura ou inventar política legal.

<a id="ped-108"></a>
### PED-108 — Configuração da linguagem/idioma do OCR

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 108, p. 61:**

> Permitir definir tipo de linguagem do OCR;

**Implementação:** Disponibilizar configuração de linguagem/idioma de reconhecimento suportado pelo motor e aplicá-la à tarefa de extração. Guardar idioma utilizado com a execução e oferecer somente opções efetivamente disponíveis; não confundir idioma da interface com do reconhecimento.

**Dados de outro módulo / serviço compartilhado:** DEP-10: motor/pacotes de idioma; configuração/tarefa no módulo de Processos/Extração.

**Demonstração:** F-OCR: executar amostras nos idiomas suportados escolhidos, confirmar a configuração enviada ao motor e a saída. Reabrir a tarefa e conferir o idioma original; testar opção não suportada.

**Aceite técnico:** A escolha é persistida e usada pelo reconhecimento, sem simples mudança de legenda. O resultado é associado à execução correta.

**Atenção / limite:** Q-05: a expressão “tipo de linguagem” é preservada, com interpretação proposta de idioma. Confirmar conjunto necessário; não prometer idiomas inexistentes.

<a id="ped-109"></a>
### PED-109 — Extração de dados com rastreabilidade de autenticidade

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 109, p. 61:**

> Extrair dados de documentos digitalizados para posterior uso com garantia de autenticidade;

**Implementação:** Extrair dados de páginas digitalizadas com vínculo ao original imutável, execução, modelo e revisão. Guardar resultado bruto, confirmado e proveniência; expor as verificações de integridade/autenticidade realmente disponíveis sem tratar texto reconhecido como original assinado.

**Dados de outro módulo / serviço compartilhado:** DEP-10: OCR; DEP-03: original/versão; DEP-04 quando houver assinatura/verificação aplicável.

**Demonstração:** Extrair os campos de F-OCR, abrir a página de origem e conferir o vínculo. Corrigir um valor em revisão e verificar preservação do bruto; testar cópia alterada e resultado de conferência correspondente.

**Aceite técnico:** Os dados podem ser usados posteriormente sem perder origem/versão e alterações são rastreáveis. A aplicação não declara autêntico qualquer conteúdo só por ter sido reconhecido.

**Atenção / limite:** Q-06: garantia de autenticidade precisa de mecanismo/alcance definido. Hash sozinho não atesta autoria de papel; não marcar garantia concluída por mera extração.

<a id="ped-110"></a>
### PED-110 — Modelos de campos extraídos associados à base pesquisável

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 110, p. 61:**

> Definir quais informações do arquivo físico serão extraídas e associadas aos campos do banco de dados para pesquisa (modelos);

**Implementação:** Permitir definir modelo de extração com informações/campos, tipos e associação à estrutura de dados usada na pesquisa. Vincular os campos à origem/região ou regra suportada pelo motor; persistir versão. Reutilizar arquitetura de modelos sem permitir SQL/DDL livre ao operador.

**Dados de outro módulo / serviço compartilhado:** DEP-10: mecanismo de extração; DEP-03: páginas; estrutura/modelos de pesquisa pertencem ao escopo.

**Demonstração:** Criar MOD-REQ com referência, interessado, data e quantidade; MOD-OF com referência, setor e data. Extrair F-OCR e conferir que cada campo confirmado aparece no destino lógico configurado.

**Aceite técnico:** O modelo é configurável e utilizado para extrair/persistir campos pesquisáveis, não apenas nome de arquivo ou formulário manual sem ligação ao OCR.

**Atenção / limite:** Q-05: identificar se tabelas são físicas/lógicas e o mapeamento requerido. Não criar campos arbitrários na base de outro módulo.

<a id="ped-111"></a>
### PED-111 — Revisão editável dos dados com documento ao lado

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 111, p. 61:**

> Confirmar dados extraídos em tela de pré-visualização com possibilidade de edição (visualizar documento digitalizado ao lado);

**Implementação:** Disponibilizar tela de revisão com documento digitalizado e campos extraídos lado a lado no desktop, permitindo corrigir/confirmar antes do uso definitivo. Guardar original, extração bruta, correção, revisor/data e valores confirmados; oferecer navegação à página pertinente.

**Dados de outro módulo / serviço compartilhado:** DEP-03: visualizador; DEP-10: extração. Interface/revisão e auditoria de campos são deste módulo.

**Demonstração:** F-OCR: abrir MOD-REQ, comparar referência/quantidade com a imagem, corrigir valor quando necessário e confirmar. Reabrir a execução e inspecionar diferença e autoria da revisão.

**Aceite técnico:** O usuário vê o documento ao lado e pode editar/confirmar de verdade; dados confirmados persistem sem apagar o original nem a saída bruta.

**Atenção / limite:** Não substituir por duas telas que exigem decorar o conteúdo ou por uma imagem estática de formulário. Adaptação mobile não dispensa prova lado a lado no desktop.

<a id="ped-112"></a>
### PED-112 — Pesquisa por tabela/modelo com impressão

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 112, p. 61:**

> O sistema deve possibilitar pesquisa para cada tabela (ou modelo) criada com possibilidade de impressão;

**Implementação:** Permitir selecionar cada tabela/modelo de extração e pesquisar seus campos tipados, com paginação e impressão do recorte completo. Respeitar a autorização do documento de origem; não expor dados extraídos de arquivo privado por consulta pública de modelo.

**Dados de outro módulo / serviço compartilhado:** Dados confirmados do módulo; DEP-03 para impressão; DEP-01 para escopo.

**Demonstração:** F-OCR: pesquisar MOD-REQ e obter 2 registros/quantidade 20; pesquisar MOD-OF e obter 1. Filtrar um campo, imprimir e comparar conteúdo/contagens com os registros confirmados.

**Aceite técnico:** Cada modelo tem consulta e impressão funcionais, com dados separados e totais corretos; não há uma lista única sem distinção de estruturas.

**Atenção / limite:** Não considerar formulários sem dados extraídos como comprovação. Sem fonte/documento autorizado, a linha não pode vazar via relatório.

<a id="ped-113"></a>
### PED-113 — Consulta da estrutura das tabelas geradas

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 113, p. 61:**

> O sistema deve possibilitar consulta da estrutura de tabelas geradas;

**Implementação:** Exibir ao usuário autorizado a estrutura efetiva da tabela/modelo gerado: campos, tipos, identificação e mapeamento ao armazenamento lógico utilizado. Manter a informação sincronizada com a versão real, sem expor credenciais ou console irrestrito de administração.

**Dados de outro módulo / serviço compartilhado:** Metadados/modelos do módulo; DEP-03 se houver visualizador de schema compartilhado.

**Demonstração:** Abrir a estrutura de MOD-REQ e MOD-OF, conferir campos/tipos definidos em PED-110 e comparar ao dado confirmado. Alterar versão em cenário isolado e verificar a nova estrutura.

**Aceite técnico:** A estrutura consultada corresponde ao modelo efetivamente persistido/pesquisável, não a imagem ou descrição estática sem relação com a base.

**Atenção / limite:** Q-05: registrar representação lógica/física adotada. Não reduzir “estrutura” a apenas título do modelo, nem criar gerenciador SQL/DDL genérico.

<a id="ped-114"></a>
### PED-114 — Exportação de dados extraídos para arquivos

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 114, p. 61:**

> Permitir a exportação de dados extraídos de documentos para arquivos;

**Implementação:** Gerar arquivos dos dados extraídos/confirmados conforme o recorte selecionado, com identificação de modelo, campos e origem pertinente. Usar os formatos do item 127 como saídas mínimas deste plano; preservar acentos e valores, não exportar somente as dez linhas visíveis.

**Dados de outro módulo / serviço compartilhado:** Dados extraídos do módulo; DEP-03 para exportação quando compartilhada.

**Demonstração:** Exportar MOD-REQ de F-OCR, abrir o arquivo e conferir 2 registros e quantidade 20. Repetir com filtro e conjunto de várias páginas; confrontar com impressão/pesquisa.

**Aceite técnico:** Arquivo é produzido dos dados reais e corresponde ao filtro, com campos completos e estrutura definida. Falha de geração não retorna arquivo vazio como sucesso.

**Atenção / limite:** Arquivo exportado não equivale à gravação direta em base externa (115). Não exportar documentos/colunas privados sem autorização.

<a id="ped-115"></a>
### PED-115 — Exportação direta para base externa pré-configurada

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 115, pp. 61–62:**

> Permitir a configuração de fonte de dados externa para exportação dos dados extraídos de documentos, diretamente para outra base de dados pré-configurada;

**Implementação:** Permitir configurar conexão/destino permitido, mapeamento de campos e exportar dados extraídos diretamente para a base identificada. Credenciais ficam no servidor, com acesso mínimo e validação prévia; registrar resultado por lote/origem e proteger reenvio contra duplicação. Não criar schema de destino por suposição.

**Dados de outro módulo / serviço compartilhado:** DEP-11: base/contrato/credencial de destino; DEP-10: dados extraídos. Adaptador de saída pertence ao módulo; sistema de destino não será reconstruído.

**Demonstração:** F-DEST: enviar 3 registros confirmados à base de homologação autorizada, conferir no destino e repetir sem duplicar. Testar falta de permissão/coluna obrigatória e verificar erro/pendência sem falso sucesso.

**Aceite técnico:** A outra base recebe os dados corretos pelo contrato configurado e a origem fica rastreável. Download CSV seguido de importação manual não comprova a exportação direta.

**Atenção / limite:** Q-12: destino não especificado pelo TR. Não permitir URL/banco arbitrário pelo cliente, vazamento de segredo ou escrita em produção para teste.

<a id="ped-116"></a>
### PED-116 — Solicitação web de documentação à instituição

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 116, p. 62:**

> Fornecer interface web para que se possa solicitar a documentação à instituição;

**Implementação:** Oferecer no portal interface para solicitar documentação à instituição, com descrição/tipo e campos essenciais configurados, gerando registro/processo rastreável e retorno ao solicitante conforme o fluxo existente. Não confundir com mero download de arquivo já público.

**Dados de outro módulo / serviço compartilhado:** DEP-01/02: identidade quando exigida; portal existente; DEP-03 para documentação relacionada.

**Demonstração:** EXT-A solicita cópia/documentação DEMO pelo Chrome; localizar o pedido na caixa interna e acompanhar o resultado autorizado. Testar submissão incompleta e reenvio.

**Aceite técnico:** A solicitação chega à instituição e pode ser tratada no processo correto; não depende de copiar e-mail manualmente nem cria registros duplicados por reenvio.

**Atenção / limite:** Não inventar prazos de atendimento, taxas ou rito normativo. Política de identificação/publicação em Q-01/Q-10.

<a id="ped-117"></a>
### PED-117 — Configuração real do driver de digitalização e DPI

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 117, p. 62:**

> Permitir configurar o driver de digitalização e DPI;

**Implementação:** Integrar a configuração do driver/dispositivo e da resolução DPI à aquisição efetiva de páginas. Oferecer somente opções suportadas e guardar parâmetros utilizados com o resultado. Utilizar serviço/conector existente ou adaptador deste escopo, sem aplicativo mobile novo.

**Dados de outro módulo / serviço compartilhado:** DEP-09: dispositivo, driver, serviço/ligação de captura e permissões do ambiente.

**Demonstração:** F-CAPTURA: selecionar driver real e duas resoluções suportadas, digitalizar página de teste em cada e conferir parâmetros/resultado da aquisição. Indisponibilidade do equipamento deve ser apresentada como falha/dependência.

**Aceite técnico:** As opções escolhidas têm efeito comprovado na captura, não são apenas campos salvos enquanto o usuário envia PDF já pronto.

**Atenção / limite:** Q-09: equipamento/contrato não fornecidos. Upload não atende esta configuração; não afirmar operação de scanner só com backend/screenshot ou adquirir hardware sem autorização.

<a id="ped-118"></a>
### PED-118 — Definição da posição do documento na captura

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 118, p. 62:**

> Permitir definir posição do documento;

**Implementação:** No contexto da digitalização, permitir definir posição/orientação do documento conforme as opções efetivamente suportadas pelo conector e conservar a escolha com a captura. Demonstrar o efeito visual/operacional, sem confundir esse campo com ordem da peça no processo.

**Dados de outro módulo / serviço compartilhado:** DEP-09: capacidade do equipamento/conector; DEP-03 para prévia/arquivo.

**Demonstração:** Capturar página DEMO usando posição/orientação disponível, como vertical e horizontal quando suportadas; observar prévia e resultado. Reabrir a configuração da tarefa e conferir a escolha.

**Aceite técnico:** A definição altera ou orienta a captura de modo observável e rastreável; não é simples metadado sem efeito ou rotação automática não demonstrada.

**Atenção / limite:** Q-09: “posição” não é detalhada no TR. A interpretação proposta deve ser confirmada, sem substituir silenciosamente por ordenação cronológica de peças.

<a id="ped-119"></a>
### PED-119 — Assinatura digital de documentos digitalizados

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 119, p. 62:**

> Permitir assinar digitalmente documentos digitalizados;

**Implementação:** Aplicar assinatura digital ao documento produzido pela captura, conservando fonte, representação, versão e certificado utilizado. Reutilizar o assinador do módulo; a revisão OCR não é assinatura nem autoriza mudar depois os bytes assinados.

**Dados de outro módulo / serviço compartilhado:** DEP-09: origem capturada; DEP-03: arquivo; DEP-04: assinatura/certificado/verificação.

**Demonstração:** Digitalizar documento de F-CAPTURA, confirmar a peça e assinar por certificado no ambiente adequado. Reabrir arquivo assinado e verificar conteúdo/identidade/validade disponível.

**Aceite técnico:** O produto digitalizado tem assinatura verificável na versão correta; um carimbo visual ou status de revisão não o substitui.

**Atenção / limite:** Q-04/Q-06: assinatura da cópia digitalizada não prova sozinha autenticidade material do papel. Não prometer mais que o mecanismo evidenciado.

<a id="ped-120"></a>
### PED-120 — Impressão do documento digital

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 120, p. 62:**

> Permitir a impressão de documento digital;

**Implementação:** Disponibilizar ação de imprimir documento digital/representação autorizada pelo visualizador ou geração comum, preservando páginas, identificação e conteúdo. Diferenciar impressão da versão de apresentação do download do original assinado quando houver derivação.

**Dados de outro módulo / serviço compartilhado:** DEP-03: visualizador/impressão; DEP-04 para manter identificação da versão assinada.

**Demonstração:** Abrir documento multipágina de F-DOC e imprimir para ambiente de teste; conferir primeira/última página, número do processo e leitura das informações, sem corte de texto.

**Aceite técnico:** A impressão é acionável e contém o documento correspondente, não apenas a área visível da tela ou um arquivo vazio.

**Atenção / limite:** Não exigir impressora física específica ou driver novo para comprovar a saída imprimível. Q-03 define representações especiais.

<a id="ped-121"></a>
### PED-121 — Digitalização em lote e classificação

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 121, p. 62:**

> Permite a digitalização em lote e classificação;

**Implementação:** Permitir aquisição de múltiplos documentos/páginas por lote, distinguir documentos e classificá-los segundo a estrutura/modelos configurados. Guardar resultado individual, páginas e classificação; falha em parte do lote não deve produzir todos como capturados. Classificação pode ser assistida pelo usuário se esse for o mecanismo definido.

**Dados de outro módulo / serviço compartilhado:** DEP-09: captura/driver; DEP-03: arquivos; DEP-10 quando o reconhecimento ajudar na classificação.

**Demonstração:** F-CAPTURA: digitalizar 3 documentos, separar as páginas e classificar 2 como MOD-REQ e 1 como MOD-OF. Conferir contagens e conteúdo de cada um; repetir com página falha e observar tratamento.

**Aceite técnico:** Há digitalização real de lote e classificação recuperável, com resultados por documento; três uploads de arquivos pré-prontos não comprovam a aquisição em lote.

**Atenção / limite:** Q-09/Q-05: não impor classificação automática por IA, volume de scanner ou separadores físicos que não foram especificados. Não omitir classificação.

<a id="ped-122"></a>
### PED-122 — Dados extraídos separados por modelo

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 122, p. 62:**

> O sistema deve distinguir os dados extraídos de documentos por tipo de modelo;

**Implementação:** Relacionar cada conjunto de valores extraídos ao tipo/versão de modelo e oferecer consultas/saídas que mantenham essa distinção. Campos de nome igual em modelos diferentes não devem misturar dados ou filtros sem mapeamento explícito.

**Dados de outro módulo / serviço compartilhado:** DEP-10: extração/modelos quando compartilhados; dados/consulta no escopo de Processos.

**Demonstração:** F-OCR: consultar 2 requerimentos e 1 ofício; conferir estruturas distintas e soma de quantidade 20 apenas em MOD-REQ. Reabrir as origens e verificar classificação.

**Aceite técnico:** Cada registro tem modelo identificado e os resultados não se misturam indevidamente; o modelo participa de pesquisa, impressão e exportação.

**Atenção / limite:** Não duplicar fisicamente o mesmo documento só para segregá-lo por tela nem inventar uma tabela de quantidade para o ofício sem esse campo.

<a id="ped-123"></a>
### PED-123 — Autenticidade dos documentos extraídos

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 123, p. 62:**

> Garantia de autenticidade dos documentos extraídos;

**Implementação:** Preservar o documento extraído/derivado, sua fonte digitalizada, identificação, versões e trilha de operações, apresentando as verificações efetivamente disponíveis. Diferenciar original, derivado, texto OCR e documento assinado; alterações produzem versão identificada, não substituição silenciosa.

**Dados de outro módulo / serviço compartilhado:** DEP-03: arquivo/versões; DEP-10: extração; DEP-04 quando assinatura/verificação fizer parte da solução.

**Demonstração:** Selecionar documento extraído de F-OCR, abrir a origem e conferir relação/versão. Comparar uma cópia alterada ao mecanismo de verificação e confirmar que não recebe a mesma declaração de original válido.

**Aceite técnico:** A cadeia documental pode ser auditada e os estados de integridade/autenticidade têm suporte real, não rótulo genérico. Garantias não disponíveis permanecem pendentes.

**Atenção / limite:** Q-06: fonte não define o nível de garantia. Não afirmar autenticidade de papel por hash ou acurácia do OCR; este item não é apenas validação de campo extraído.

<a id="ped-124"></a>
### PED-124 — Extração com OCR e tecnologia de redes neurais

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 124, p. 62:**

> O sistema deve utilizar tecnologias tais como OCR e Redes Neurais Artificiais para promover a extração dos dados dos arquivos digitalizados;

**Implementação:** Utilizar motor que efetivamente faça reconhecimento/extração de imagens e identificar o componente/modelo neural empregado na solução adotada. Integrar idioma, modelo de campos, revisão e persistência, sem treinar rede própria por suposição. Registrar motor/modelo/configuração na evidência e não apenas no nome do botão.

**Dados de outro módulo / serviço compartilhado:** DEP-10: motor/modelo/recursos/credenciais; DEP-03: imagens. Orquestração e modelos/revisão estão no escopo.

**Demonstração:** Executar F-OCR sobre páginas rasterizadas sem camada textual; alterar conteúdo de nova amostra e verificar saída compatível com a imagem. Mostrar configuração/documentação do motor neural usado e resultado bruto antes da revisão.

**Aceite técnico:** Há extração real e tecnologia identificável, sem dados hardcoded, copiar texto embutido ou digitação manual disfarçada. Incerteza/erro são tratados pela revisão, não preenchimento inventado.

**Atenção / limite:** Q-05: “tais como” não fornece marca/algoritmo. Não declarar tecnologia neural sem evidência nem prometer 100% de precisão ou enviar documentos privados a serviço não autorizado.

<a id="ped-125"></a>
### PED-125 — Pesquisa de dados funcionando em navegador

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 125, p. 62:**

> O módulo de pesquisa deverá funcionar em navegador;

**Implementação:** Disponibilizar a pesquisa do módulo no próprio navegador web, inclusive consultas dos modelos de extração, com filtros, paginação, acesso ao documento permitido e impressão/exportação pertinentes. Usar as mesmas fontes e autorização do restante do ERP.

**Dados de outro módulo / serviço compartilhado:** DEP-01: acesso; DEP-03: documento/relatório quando necessário; dados confirmados do módulo.

**Demonstração:** Acessar pelo navegador em sessão autorizada, pesquisar MOD-REQ por referência/quantidade e abrir origem; repetir no Chrome do celular com layout responsivo e sem cliente instalado.

**Aceite técnico:** A consulta funciona no site com dados reais e não exige ferramenta desktop de pesquisa ou acesso direto ao banco para o operador.

**Atenção / limite:** Pesquisa web não dispensa integração de scanner na captura. Não criar app nativo ou serviço de busca paralelo apenas para este item.

<a id="ped-126"></a>
### PED-126 — Impressão de toda pesquisa do sistema no escopo

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 126, p. 62:**

> O sistema deve possuir suporte à impressão para toda e qualquer pesquisa do sistema;

**Implementação:** Oferecer saída imprimível para as consultas do módulo, incluindo processos/documentos e pesquisas de modelos extraídos, preservando filtros e conjunto autorizado. Mapear todas as telas de pesquisa entregues e usar serviço comum; impressão não se limita às linhas renderizadas.

**Dados de outro módulo / serviço compartilhado:** DEP-03: impressão/geração; dados das consultas do módulo e DEP-01 para autorização.

**Demonstração:** Imprimir busca de processos, consulta de documentos e busca de MOD-REQ com filtros; em conjunto de várias páginas, conferir primeiro/último registro e total. Testar resultado vazio com mensagem adequada.

**Aceite técnico:** Cada pesquisa entregue tem impressão correspondente ao recorte, sem ocultar linhas de outra página ou perder o critério selecionado.

**Atenção / limite:** O texto usa “toda e qualquer pesquisa”; não reduzir a função apenas ao OCR silenciosamente. Alcance além deste módulo deve ser registrado como dependência geral, sem reconstruir outras áreas.

<a id="ped-127"></a>
### PED-127 — Exportação em CSV e TXT

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 127, p. 62:**

> O sistema deve permitir a exportação de dados para arquivo nos formatos csv e txt;

**Implementação:** Implementar exportação dos dados pesquisados/extraídos em ambos os formatos CSV e TXT, com especificação de campos, codificação e delimitadores. Preservar acentos/aspas/quebras e recorte completo, tratando conteúdo não confiável na abertura por planilhas sem alterar a fonte silenciosamente.

**Dados de outro módulo / serviço compartilhado:** Dados do módulo; DEP-03 para exportador compartilhado. Não exige ferramenta de planilha para criar a rotina.

**Demonstração:** F-OCR: gerar os dois arquivos de MOD-REQ, conferir 2 registros e quantidade 20; testar campo com acento/aspas e conjunto multipágina. Abrir os arquivos e comparar aos dados confirmados.

**Aceite técnico:** CSV e TXT são arquivos efetivamente gerados e legíveis conforme contrato de saída, não extensões diferentes para conteúdo inadequado ou exportação só da primeira página.

**Atenção / limite:** Ambos os formatos são expressos, não escolher somente um. Exportar arquivo não comprova gravação direta em base externa de PED-115.


## Modelagem de Fluxos — subtítulo da fonte

Os itens a seguir abrangem serviço, configuração e documentação. A formulação explicativa foi mantida; os aceites abaixo são a proposta de evidência, não novos botões obrigatórios.

<a id="ped-128"></a>
### PED-128 — Modelagem documentada das atividades, responsáveis e informações

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 128, p. 62:**

> A modelagem de fluxos é fundamental para garantir uma implementação eficaz do processo eletrônico, pois permite uma compreensão clara e detalhada de como as atividades serão executadas, quem são os responsáveis por cada etapa e como as informações fluem dentro do sistema.

**Implementação:** Executar a modelagem dos procedimentos abrangidos, registrando atividades, responsáveis, entradas, saídas e circulação da informação, e configurar isso no motor real. Manter referência da versão e distinguir levantamento administrativo de exemplos de ensaio.

**Dados de outro módulo / serviço compartilhado:** DEP-01: estrutura/responsáveis; áreas demandantes fornecem regras. O serviço/modelagem do processo está no escopo.

**Demonstração:** Apresentar ficha de modelagem de ASS-A, diagrama e configuração; executar F-FORM e apontar em cada atividade quem atua e quais dados/documentos recebe/produz.

**Aceite técnico:** A documentação e a execução correspondem ao mesmo procedimento, permitindo compreender atividades e responsabilidades; não basta criar menu “Modelagem”.

**Atenção / limite:** Trecho orientador da fonte, não nova função isolada. Q-10 define quais procedimentos reais serão modelados; não inventar fluxo oficial.

<a id="ped-129"></a>
### PED-129 — Diagramas ou mapas visuais dos procedimentos

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 129, p. 62:**

> Visualização dos Processos: Criar diagramas ou mapas que representem visualmente os processos e procedimentos a serem seguidos no sistema, facilitando a compreensão e a comunicação entre os usuários.

**Implementação:** Gerar/editar a representação visual do processo modelado a partir da mesma definição usada no motor, com atividades, conexões, ramificações e responsáveis pertinentes. Permitir leitura e documento de referência, reaproveitando PED-060.

**Dados de outro módulo / serviço compartilhado:** Definição de fluxo do módulo; DEP-03 para renderização/relatório quando compartilhados.

**Demonstração:** Mostrar o diagrama de ASS-A com caminho Sim/Não e subfluxo, selecionar uma atividade e conferir a configuração real. Comparar versão impressa/documentada ao fluxo executado.

**Aceite técnico:** O diagrama representa o procedimento efetivo e comunica seus caminhos, sem imagem genérica ou desenho divergente da execução.

**Atenção / limite:** Não impor notação, suíte BPMN ou ferramenta comercial que o TR não nomeia. O desenho é de processo, não mapa geográfico.

<a id="ped-130"></a>
### PED-130 — Identificação de gargalos e oportunidades de melhoria

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 130, p. 62:**

> Identificação de Gargalos e Oportunidades de Melhoria: Identificar possíveis gargalos ou pontos de melhoria nos processos existentes, permitindo a otimização e a eficiência operacional.

**Implementação:** Analisar o procedimento e os dados de execução disponíveis para identificar concentrações de espera/tempo, retornos ou passos redundantes, registrando evidência e proposta de melhoria. Reutilizar a mineração e os relatórios; não alterar automaticamente regra administrativa por sugestão.

**Dados de outro módulo / serviço compartilhado:** Eventos/fluxo do módulo; áreas responsáveis validam melhoria, DEP-01 identifica responsáveis quando necessário.

**Demonstração:** F-MIN: demonstrar 48h concentradas em Análise e retorno de MIN-6 via Complemento; abrir os casos e registrar observação de revisão desse trecho do fluxo, distinguindo dado e hipótese de causa.

**Aceite técnico:** O gargalo/oportunidade tem suporte em eventos ou levantamento documentado e a proposta é rastreável. O sistema não afirma causa automática sem evidência.

**Atenção / limite:** Q-08/Q-10: amostra de teste não comprova gargalo real da prefeitura. Não criar ranking punitivo ou decisão por IA.

<a id="ped-131"></a>
### PED-131 — Padrões e diretrizes para execução consistente

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 131, pp. 62–63:**

> Padronização e Consistência: Estabelecer padrões e diretrizes para a execução dos processos, garantindo consistência e qualidade nas atividades realizadas.

**Implementação:** Documentar e aplicar padrões dos procedimentos modelados: nomes/identificações, papéis, entrada/saída documental, regras de decisão e tratamento de exceções definido. Usar modelos e validações reutilizáveis para evitar versões contraditórias do mesmo procedimento.

**Dados de outro módulo / serviço compartilhado:** DEP-01/03 para papéis e modelos comuns; padronização de procedimento é entrega de modelagem.

**Demonstração:** Executar duas instâncias de ASS-A com os mesmos dados de decisão e conferir passos/termos equivalentes; usar dado distinto para verificar ramificação prevista, não comportamento aleatório.

**Aceite técnico:** As instâncias seguem a definição versionada e as diretrizes estão registradas no material de referência, com exceções explícitas.

**Atenção / limite:** Não prescrever manual administrativo completo do município, certificação ou padrão legal não fornecido. Procedimentos reais em Q-10.

<a id="ped-132"></a>
### PED-132 — Documentação detalhada como referência de treinamento e auditoria

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 132, p. 63:**

> Documentação e Treinamento: Gerar documentação detalhada dos processos modelados, que servirá como referência para treinamento de usuários e para futuras auditorias e análises.

**Implementação:** Gerar documentação de cada procedimento modelado contendo versão, diagrama, atividades, responsáveis, campos/formulários, documentos, regras, prazos, exceções e instruções de execução. Usar configuração real e evidências das telas, não simplesmente devolver este plano de desenvolvimento.

**Dados de outro módulo / serviço compartilhado:** Dados do modelo/instâncias; DEP-03 para geração documental e ajuda, se compartilhados.

**Demonstração:** Gerar guia do ASS-A, percorrer suas instruções com usuário de teste e executar a instância correspondente. Conferir que a versão, telas e documentos apresentados existem no ambiente.

**Aceite técnico:** O material permite orientar usuário e auditar a configuração, sem rotas inventadas ou instruções incompatíveis com a versão entregue.

**Atenção / limite:** O item trata documentação para treinamento; não inventar carga horária, curso ou plataforma EAD adicional. Conteúdo institucional real depende de Q-10.

<a id="ped-133"></a>
### PED-133 — Personalização do fluxo às necessidades da organização

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 133, p. 63:**

> Adaptação às Necessidades Específicas: Personalizar os fluxos de trabalho de acordo com as necessidades específicas da organização, levando em consideração suas políticas, regulamentos e requisitos operacionais.

**Implementação:** Permitir ajustar atividades, responsáveis, formulários, condições e parâmetros do procedimento às definições fornecidas, com versionamento e teste. Aplicar alterações às instâncias ativas conforme PED-087 quando esse for o alcance autorizado, preservando histórico.

**Dados de outro módulo / serviço compartilhado:** DEP-01: órgãos/usuários; áreas demandantes fornecem políticas/requisitos. Configuração pertence a Processos.

**Demonstração:** Criar ASS-B com percurso diferente de ASS-A sem mudar o código de negócio; ajustar prazo/responsável de uma versão e executar o cenário de migração compatível de F-VERSAO.

**Aceite técnico:** O fluxo é personalizável e a execução muda conforme a configuração, sem dependência de caminhos hardcoded ou alteração destrutiva do histórico.

**Atenção / limite:** Não inventar políticas, regulamentos ou dispensas de etapa; personalização deve ser aprovada/identificada, não presumida pelo agente.

<a id="ped-134"></a>
### PED-134 — Entrega do serviço de modelagem e transição operacional

**TR — GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS, item 134, p. 63:**

> O serviço de modelagem de fluxos desempenha um papel crucial no sucesso da implementação de um processo eletrônico, garantindo uma transição suave e eficiente para um ambiente digitalizado e automatizado.

**Implementação:** Consolidar o serviço de modelagem em entrega verificável: procedimentos configurados, documentação, cenários executados e pendências/versões identificadas. Demonstrar a transição ao processo digital com tarefas, documentos e responsáveis funcionando, sem considerar o texto explicativo como exigência de outro módulo.

**Dados de outro módulo / serviço compartilhado:** Dependências das funções utilizadas e definições da área demandante; não reconstruir módulos de origem para aparentar conclusão.

**Demonstração:** Executar uma instância completa de procedimento modelado, da protocolização ao arquivo, com documentos, decisão, histórico e material de orientação. Comparar a execução ao modelo e registrar resultados/limitações.

**Aceite técnico:** A entrega reúne configuração, operação e documentação coerentes, com evidências do procedimento efetivo; a mera contagem de telas ou repetição deste MD não encerra o serviço.

**Atenção / limite:** Texto de enquadramento do serviço, preservado como item separado. Q-10 define alcance real; não prometer transição institucional inteira sem os procedimentos/configurações necessários.



---
<a id="pacotes"></a>
## 8. Pacotes de implementação e dependências

**P0 — Diagnóstico:** mapear os 134 IDs, o ponto de entrada do módulo, as fronteiras com clientes atuais e os componentes compartilhados. Verificar desde o início **URA, driver/scanner, OCR/tecnologia neural, assinatura e base externa**, pois ausência de credencial/contrato/equipamento não será corrigida por criar uma tela. Começar com uma tela-piloto para o padrão UX. Não estimar prazos de desenvolvimento sem conhecer o código.

Cada pacote abaixo entrega interface, validação, persistência, efeitos/documentos pertinentes, testes e registro de dependências. Os IDs têm uma alocação principal para organizar trabalho, mas os pacotes compartilham serviços. Não reimplementar o núcleo a cada etapa.

| Pacote | Entrega principal | IDs |
|---|---|---|
| **P1 — Cadastro e protocolo** | Cadastros, requisitos, numeração, comprovantes, pesquisa e identidade; interfaces com fontes existentes. | 001, 002, 003, 004, 005, 006, 007, 011, 025, 043, 046, 053, 055, 065, 066, 080, 090 |
| **P2 — Caixas e tramitação** | Envio/recebimento, cancelamento/rejeição, permissões de caixa e lotes; atualização da posição. | 010, 014, 018, 031, 048, 050, 051, 052, 081, 088, 098, 099 |
| **P3 — Fluxos e formulários** | Formulários dinâmicos, regras, prazos, subfluxos e aplicação de alterações a instâncias ativas. | 015, 016, 017, 023, 028, 029, 030, 057, 058, 059, 060, 063, 064, 087, 089, 100, 101 |
| **P4 — Documentos e peças** | Pareceres, modelos, prévia, termos, anexação, foliação, volumes, composição e comentários. | 012, 013, 024, 026, 027, 037, 038, 044, 045, 047, 049, 056, 078, 084, 085, 097, 102, 103, 104, 105, 106, 120 |
| **P5 — Público, sigilo e Ouvidoria** | Canal externo, anonimato, sigilo, comunicação institucional/fiscal e pedidos documentais. | 032, 040, 041, 067, 068, 069, 070, 071, 072, 073, 074, 116 |
| **P6 — E-mail e assinaturas** | Mensagens, compartilhamentos, certificação, coassinatura e verificação documental. | 008, 009, 034, 035, 036, 039, 042, 082, 083, 086, 092, 093, 094, 095, 096, 119 |
| **P7 — Arquivo e cronograma** | Conclusão, arquivo/guarda, desarquivamento, planejamento e processo originado do cronograma. | 019, 020, 021, 022, 075, 076, 077, 079, 107 |
| **P8 — Digitalização e extração** | Captura real, OCR/neural, modelos, revisão, pesquisa/estrutura, arquivos e base externa. | 108, 109, 110, 111, 112, 113, 114, 115, 117, 118, 121, 122, 123, 124, 125, 126, 127 |
| **P9 — Conexão URA** | Receptor, mapeamento, criação automática e teste autorizado com a origem externa. | 033 |
| **P10 — Gestão e modelagem** | Gráficos, dashboards, mineração, drill-down, procedimento modelado e documentação de orientação. | 054, 061, 062, 091, 128, 129, 130, 131, 132, 133, 134 |

**Encadeamento sugerido:** P0 → cadastro/protocolo → caixas e documentos básicos → fluxos e acesso → assinaturas/arquivo/cronograma → funções de digitalização/extração e análises, com investigação de integrações externas desde P0. Não esperar terminar todas as telas para descobrir que não há scanner/assinador/URA configurados. Relatórios e testes acompanham cada pacote, não apenas o final.

**PF — Ensaio integrado:** executar os cenários da seção 6 e a matriz de 134 linhas; revisar permissões, compartilhamentos, foliação, assinatura, processos ativos após mudança de fluxo, envio/recebimento em lote e impressão/exportação multipágina. O pacote de Modelagem inclui documentação de procedimentos reais configurados, não apenas desenvolvimento de componentes.

Não interromper todos os itens independentes por uma fonte indisponível. Também não declarar o módulo completo mantendo pendências silenciosas. Onde houver dependência de outro módulo, entregar a interface/contrato de consumo identificados e registrar o resultado ainda não demonstrado.

<a id="testes"></a>
## 9. Testes de qualidade e evidências

### 9.1 Verificações transversais

Os testes são meios de demonstrar os requisitos do TR e as diretrizes do usuário; não uma segunda lista de funcionalidades de negócio.

| Teste | Resultado esperado e ponto de atenção |
|---|---|
| Numeração/identidade | Sequência por ano/tipo/espécie; concorrência não duplica números; reenvio do mesmo protocolo não cria outro. |
| Cadastro/anonimato | Campos essenciais validados no canal comum; manifestação anônima aceita sem dados pessoais/login; nenhuma pessoa fictícia criada para encobrir incompatibilidade. |
| Persistência | Abrir em nova sessão recupera cadastro, resposta, trâmite, peça, prazo, assinatura e vínculo com a mesma origem. |
| Envio/recebimento | Atos e timestamps distintos, ator correto em cada lado; não receber automaticamente antes da ação configurada. |
| Cancelar/rejeitar | Cancelamento antes do recebimento; rejeição em Enviado com justificativa; evento anterior preservado. |
| Concorrência | Receber/cancelar/rejeitar a mesma versão resulta em somente uma transição válida. |
| Setor/função/usuário/papel | Quatro modos de caixas/participantes testados com identidade efetiva e escopo. |
| Formulários | Os sete tipos, inclusive dropdown de outra tabela permitida, validam e persistem; alterações não reescrevem respostas históricas. |
| Roteamento | Resposta/enquete muda caminho automaticamente; próxima fase não precisa ser redigitada; providência obrigatória produz crítica real. |
| Prazo/atraso | Caso 09h→11h, atraso às 12h, novo prazo 15h e conclusão 14h conserva tempo de 5h e justificativa; não apaga o prazo anterior. |
| Atualização de fluxo ativo | Dois processos em curso recebem a alteração compatível; versão/histórico preservados; incompatibilidade não recebe sucesso fictício. |
| Tempo real | Segunda sessão acompanha atividade/responsável/situação sem F5; desconexão sinalizada, latência medida. |
| Subfluxo | Dois pais usam o mesmo modelo auxiliar com execuções isoladas e retorno correto. |
| Lotes | 12 processos enviados/recebidos, mesmo com 10 linhas por página; falha individual tratada conforme política declarada. |
| Sigilo/público | Consulta sem senha funciona; requerente não acessa processo privado de outro; textos privados não vazam em API/e-mail/impressão/exportação. |
| Alteração de sigilo | Mudança manual e por assunto têm efeito na instância correspondente; links/previsões/caches não mantêm acesso indevido. |
| Documento e peça | Upload/captura resulta em arquivo real no processo certo; múltiplos formatos e composição são distintos. |
| Foliação | Três peças de 2/3/1 páginas mais outra de 2 resultam em 8 folhas, considerando deslocamento H; ordem de inserção e concorrência preservadas. |
| Original assinado | Original externo não é modificado para receber carimbo; derivado numerado claramente identificado; caso Q-03 documentado. |
| Múltiplas assinaturas | Mesmo documento final com SIG-A/SIG-B, ambas verificáveis; conteúdo alterado não herda assinatura anterior. |
| Pendentes/assinados | Segunda assinatura requerida mantém pendência; versão antiga assinada não oculta nova versão pendente. |
| Autenticidade/chave/QR | Identifica documento/versão correta; inexistente/alterado não é declarado válido; autenticação de emissão distinta de certificação. |
| E-mail | Recebimento em caixa controlada, links de protocolo/histórico/auditoria/assinatura funcionais; retry sem duplicação indevida. |
| Apensação/anexação | Processos e documentos são testados separadamente; relações temporárias preservam identidades e histórico. |
| Arquivo | Conclusão com termo/data/local/situação; guarda temporária/data-limite; arquivar no setor e desarquivar autorizadamente; sem eliminação automática. |
| Fiscal/cidadão | Seis tipos exemplificados encaminháveis, recebimento e contestação vinculados; não fingir emissão do módulo tributário. |
| Cronograma | Criar 1 processo pela atividade 2 de 3, repetir sem duplicar; atualização de providência aparece na origem. |
| Relatórios/gestão | Setembro 23 registros, assuntos 10/8/5; drill-down 8; agosto/outubro fora; impressão/exportação cobre todas as páginas. |
| Mineração | Duas variantes 5/1; Análise 7 ocorrências/48h; total 62h; média 10h20; casos de origem acessíveis. |
| Driver/DPI/posição | Opções suportadas aplicadas a captura real; upload de arquivo pronto não substitui. |
| Lote digitalizado | Três documentos capturados/classificados com páginas e resultado individual; falha não marca tudo como concluído. |
| OCR/modelo neural | Imagens sem camada textual processadas, idioma aplicado e motor neural identificado; revisão corrige sem apagar bruto. |
| Modelos/estrutura | MOD-REQ com 2 registros e soma 20; MOD-OF com 1; campos/tipos consultáveis e dados não misturados. |
| Revisão lado a lado | Imagem e campos visíveis juntos no desktop, correção/autor/valor bruto e confirmado persistidos. |
| CSV/TXT | Ambos gerados; acentos, aspas, filtros e total corretos; proteção para conteúdo não confiável documentada. |
| Base externa | Três registros efetivos no destino autorizado e retry sem duplicação; indisponibilidade permanece erro/pendência. |
| URA | Atendimento/evento legítimo gera 1 processo e replay não gera 2; chamada manual do receptor identificada apenas como teste de contrato. |
| Modelagem/documentação | Procedimento, diagrama, padrões, melhorias e guia correspondem à versão executada; não só ao texto deste MD. |
| UX/eficiência | Fonte/densidade consistentes, paginação real, dados/ações legíveis, retorno à ficha, sem redigitação da próxima fase; exceções de rolagem acessíveis. |

### 9.2 Matriz que o agente deve preencher

**Nenhum item foi testado no CeleriFlow durante a elaboração deste arquivo.** O estado inicial da matriz é `A_VERIFICAR`. Os campos são preenchidos somente com rotas, serviços e testes encontrados/executados no repositório. Uma linha documental não vira validação automaticamente.

| ID | Pacote principal | Estado inicial | Tela/serviço reais | Teste e evidência | Dependência/ressalva |
|---|---|---|---|---|---|
| PED-001 | P1 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-002 | P1 | A_VERIFICAR | A mapear | Não executado | Q-01 |
| PED-003 | P1 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-004 | P1 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-005 | P1 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-006 | P1 | A_VERIFICAR | A mapear | Não executado | Q-01 |
| PED-007 | P1 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-008 | P6 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-009 | P6 | A_VERIFICAR | A mapear | Não executado | Q-13 |
| PED-010 | P2 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-011 | P1 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-012 | P4 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-013 | P4 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-014 | P2 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-015 | P3 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-016 | P3 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-017 | P3 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-018 | P2 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-019 | P7 | A_VERIFICAR | A mapear | Não executado | Q-02 |
| PED-020 | P7 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-021 | P7 | A_VERIFICAR | A mapear | Não executado | Q-02 |
| PED-022 | P7 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-023 | P3 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-024 | P4 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-025 | P1 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-026 | P4 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-027 | P4 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-028 | P3 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-029 | P3 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-030 | P3 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-031 | P2 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-032 | P5 | A_VERIFICAR | A mapear | Não executado | Q-01 |
| PED-033 | P9 | A_VERIFICAR | A mapear | Não executado | Q-11 |
| PED-034 | P6 | A_VERIFICAR | A mapear | Não executado | Q-04 |
| PED-035 | P6 | A_VERIFICAR | A mapear | Não executado | Q-01, Q-04 |
| PED-036 | P6 | A_VERIFICAR | A mapear | Não executado | Q-04 |
| PED-037 | P4 | A_VERIFICAR | A mapear | Não executado | Q-03 |
| PED-038 | P4 | A_VERIFICAR | A mapear | Não executado | Q-01, Q-03 |
| PED-039 | P6 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-040 | P5 | A_VERIFICAR | A mapear | Não executado | Q-10, Q-13 |
| PED-041 | P5 | A_VERIFICAR | A mapear | Não executado | Q-01 |
| PED-042 | P6 | A_VERIFICAR | A mapear | Não executado | Q-04 |
| PED-043 | P1 | A_VERIFICAR | A mapear | Não executado | Q-01, Q-10 |
| PED-044 | P4 | A_VERIFICAR | A mapear | Não executado | Q-03 |
| PED-045 | P4 | A_VERIFICAR | A mapear | Não executado | Q-07 |
| PED-046 | P1 | A_VERIFICAR | A mapear | Não executado | Q-01 |
| PED-047 | P4 | A_VERIFICAR | A mapear | Não executado | Q-03, Q-07 |
| PED-048 | P2 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-049 | P4 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-050 | P2 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-051 | P2 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-052 | P2 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-053 | P1 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-054 | P10 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-055 | P1 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-056 | P4 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-057 | P3 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-058 | P3 | A_VERIFICAR | A mapear | Não executado | Q-01, Q-10 |
| PED-059 | P3 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-060 | P3 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-061 | P10 | A_VERIFICAR | A mapear | Não executado | Q-08 |
| PED-062 | P10 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-063 | P3 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-064 | P3 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-065 | P1 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-066 | P1 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-067 | P5 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-068 | P5 | A_VERIFICAR | A mapear | Não executado | Q-01 |
| PED-069 | P5 | A_VERIFICAR | A mapear | Não executado | Q-01 |
| PED-070 | P5 | A_VERIFICAR | A mapear | Não executado | Q-01 |
| PED-071 | P5 | A_VERIFICAR | A mapear | Não executado | Q-01 |
| PED-072 | P5 | A_VERIFICAR | A mapear | Não executado | Q-01 |
| PED-073 | P5 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-074 | P5 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-075 | P7 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-076 | P7 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-077 | P7 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-078 | P4 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-079 | P7 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-080 | P1 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-081 | P2 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-082 | P6 | A_VERIFICAR | A mapear | Não executado | Q-01, Q-04 |
| PED-083 | P6 | A_VERIFICAR | A mapear | Não executado | Q-01, Q-04 |
| PED-084 | P4 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-085 | P4 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-086 | P6 | A_VERIFICAR | A mapear | Não executado | Q-13 |
| PED-087 | P3 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-088 | P2 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-089 | P3 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-090 | P1 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-091 | P10 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-092 | P6 | A_VERIFICAR | A mapear | Não executado | Q-04 |
| PED-093 | P6 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-094 | P6 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-095 | P6 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-096 | P6 | A_VERIFICAR | A mapear | Não executado | Q-04, Q-13 |
| PED-097 | P4 | A_VERIFICAR | A mapear | Não executado | Q-03 |
| PED-098 | P2 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-099 | P2 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-100 | P3 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-101 | P3 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-102 | P4 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-103 | P4 | A_VERIFICAR | A mapear | Não executado | Q-03 |
| PED-104 | P4 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-105 | P4 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-106 | P4 | A_VERIFICAR | A mapear | Não executado | Q-07 |
| PED-107 | P7 | A_VERIFICAR | A mapear | Não executado | Q-02 |
| PED-108 | P8 | A_VERIFICAR | A mapear | Não executado | Q-05 |
| PED-109 | P8 | A_VERIFICAR | A mapear | Não executado | Q-06 |
| PED-110 | P8 | A_VERIFICAR | A mapear | Não executado | Q-05 |
| PED-111 | P8 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-112 | P8 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-113 | P8 | A_VERIFICAR | A mapear | Não executado | Q-05 |
| PED-114 | P8 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-115 | P8 | A_VERIFICAR | A mapear | Não executado | Q-12 |
| PED-116 | P5 | A_VERIFICAR | A mapear | Não executado | Q-01, Q-10 |
| PED-117 | P8 | A_VERIFICAR | A mapear | Não executado | Q-09 |
| PED-118 | P8 | A_VERIFICAR | A mapear | Não executado | Q-09 |
| PED-119 | P6 | A_VERIFICAR | A mapear | Não executado | Q-04, Q-06 |
| PED-120 | P4 | A_VERIFICAR | A mapear | Não executado | Q-03 |
| PED-121 | P8 | A_VERIFICAR | A mapear | Não executado | Q-05, Q-09 |
| PED-122 | P8 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-123 | P8 | A_VERIFICAR | A mapear | Não executado | Q-06 |
| PED-124 | P8 | A_VERIFICAR | A mapear | Não executado | Q-05 |
| PED-125 | P8 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-126 | P8 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-127 | P8 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-128 | P10 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-129 | P10 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-130 | P10 | A_VERIFICAR | A mapear | Não executado | Q-08, Q-10 |
| PED-131 | P10 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-132 | P10 | A_VERIFICAR | A mapear | Não executado | Q-10 |
| PED-133 | P10 | A_VERIFICAR | A mapear | Não executado | Conferir fonte/serviço do item |
| PED-134 | P10 | A_VERIFICAR | A mapear | Não executado | Q-10 |

Estados sugeridos: `A_VERIFICAR`, `EXISTE_NAO_TESTADO`, `A_IMPLEMENTAR`, `PARCIAL`, `DEPENDENCIA_OUTRO_MODULO`, `BLOQUEADO_EXTERNO`, `AGUARDA_DEFINICAO`, `VALIDADO_TECNICAMENTE`. Um item pode ter a parte local pronta e integração pendente; registrar ambas, sem esconder dependência na coluna de evidência.

Evidência mínima por ID: estado inicial, papel do usuário, dados utilizados, ação executada, resultado observado, persistência, arquivo/relatório quando pertinente, referência do teste e limitação. Repetidos podem compartilhar a execução, mas mantêm seus IDs. Testes de unidade com fixtures não comprovam envio externo, chamada URA, scanner, assinatura confiável ou gravação na base externa.

Informar arquivos realmente alterados, migrations, testes/comandos executados e acesso às telas. Um caminho como `docs/poc/processos-status.md` é sugestão, não caminho cuja existência foi confirmada. Não informar sucesso de teste que não foi executado.

### 9.3 Condição de encerramento

Um requisito só fica validado tecnicamente quando todas as suas partes exigidas funcionam, persistem, respeitam acesso e têm evidência reproduzível. Requisitos compostos, como 19, 42, 103 e 121, não se encerram mostrando apenas uma de suas ações.

**Não declarar “134/134 atendidos” com:** formulários estáticos; envio que não registra recebimento; fluxo apenas desenhado; atualização de versão apenas para novos processos; mineração que só exibe o modelo previsto; assinatura decorativa; QR sem consulta; processos sigilosos acessíveis por link irrestrito; upload chamado de digitalização; configuração de DPI sem efeito; OCR preenchido manualmente; base externa simulada; URA não conectada; documentos numerados apenas na tabela; ou serviço de modelagem sem entrega documental.

Validação técnica interna não é aprovação automática da comissão nem auditoria de toda a licitação. A existência de configuração administrativa/externa pendente precisa constar no resultado final.

<a id="definicoes"></a>
## 10. Definições a resolver sem inventar exigências

### Q-01 — Consulta pública, sigilo, anonimato e interessado

**Itens principais:** 2/6, 32, 41, 58, 66–72, 80. A fonte exige consulta sem senha a todos os protocolos e, em outros itens, proteção para que apenas o requerente consulte seus dados; também permite manifestação anônima. Ela não detalha a política de visibilidade, identificação ou como representa o interessado anônimo.

**Decisão proposta para desenvolver:** consulta pública de informações autorizadas, conteúdo reservado com controle de acesso, manifestação sem dados pessoais obrigatórios e indicador de anonimato. **Confirmar** escopo público, necessidade/uso de chave de acompanhamento, exceção de campo interessado e competências de redução do sigilo. Não chamar a solução proposta de interpretação oficial, nem vazar conteúdo para eliminar a dúvida.

### Q-02 — Classificação CONARQ, temporalidade e guarda/descarte

**Itens:** 19–23/107. A fonte cita classificação CONARQ e tempo de guarda/descarte, sem fornecer tabela, códigos, regras de contagem ou procedimento de eliminação. Obter a referência administrativa efetivamente aplicável e os parâmetros de produção.

Enquanto isso, implementar campos/relações e controle com classificação DEMO identificada, sem inventar regra normativa. Prazo de guarda registrado não autoriza eliminação automática de arquivo. Prova de parametrização não equivale a validação da tabela real.

### Q-03 — Foliação, originais assinados, formatos e volumes

**Itens:** 13, 37–38, 44–47, 85, 97, 102–106/120. Confirmar formatos/renderizações, numeração de folhas, tratamento dos volumes e representação processual de documentos externos previamente assinados ou não pagináveis.

A proposta preserva original imutável e produz representação numerada vinculada quando necessária. A assinatura original não será declarada válida sobre bytes de cópia modificada. Validar a aceitação dessa forma de apresentação para PED-103 antes de considerar seu caso especial concluído. Não limitar a solução a um número no grid nem forçar carimbo em original assinado.

### Q-04 — Assinaturas, formatos, múltiplos signatários e verificação

**Itens:** 34–36, 42, 82–83, 92–96/119, com reflexos na foliação. Identificar os serviços existentes, modalidades eletrônica/digital, certificados, formatos de imagem/documento, coassinatura e verificação no portal. Credencial de teste e credencial válida para a demonstração final precisam ser distinguidas.

Não substituir certificado por hash/rubrica. Uma biblioteca disponível no repositório não é prova de que múltiplas assinaturas preservam as anteriores; testar no arquivo final. Configurar o endereço de validação da contratante sem expor segredos.

### Q-05 — Idiomas, modelos de extração, estruturas e componente neural

**Itens:** 108–114, 122/124–127. A fonte não define motor, idioma obrigatório, modelo neural, estrutura física/lógica de tabelas ou precisão aceitável. Identificar tecnologia real, opções suportadas, formatos e esquema de mapeamento.

Construir a configuração/modelos/pesquisa/revisão com saídas verdadeiras do motor. Registrar a interpretação de “linguagem” como idioma quando adotada e a representação de “tabelas geradas”. Não alegar uma tabela física se o sistema só usa modelo lógico sem explicação, nem suporte a neural/idioma não instalado. Não treinar novo modelo por suposição.

### Q-06 — Garantia de autenticidade da extração

**Itens:** 109/123 e contexto de assinatura/digitalização. Definir qual garantia precisa ser demonstrada: integridade da cópia e cadeia de operações, associação ao emissor, certificação ou outra política institucional. A fonte exige garantia, mas não detalha seu mecanismo.

O plano prevê preservação da origem, versões, auditoria, revisão e verificações disponíveis. Esses controles não permitem declarar juridicamente autêntico qualquer papel capturado, nem garantem acerto do OCR. Manter esse limite visível até definição/validação do mecanismo adotado.

### Q-07 — Apensação, anexação e desfazimento

**Itens:** 45/47/106. Confirmar efeitos de cada operação, relação de principal/associado, termo, posse/tramitação e forma permitida de desfazer apensação. Documentos e processos aparecem em itens diferentes; mostrar ambos.

Reutilizar vínculos temporários/estruturais sem apagar identidades e sem confundir anexação de processo com upload de peça. Não inventar limite de volume ou rito normativo. Configuração de teste deve ficar identificada como proposta.

### Q-08 — Mineração e critérios de melhoria

**Itens:** 61–62/91/130. A fonte não fixa algoritmo ou indicadores mínimos da mineração. A solução proposta reconstrói variantes reais e calcula frequências/tempos/retornos com drill-down, evidenciados por F-MIN.

Confirmar expectativa de avaliação, campos do log, definição de execução/espera e tratamento de versões. Não substituir mineração por desenho estático ou chatbot, nem transformar correlação de demora em diagnóstico causal automático. Resultado de amostra fictícia não caracteriza desempenho real da Prefeitura.

### Q-09 — Scanner, driver, DPI, posição e lote

**Itens:** 13/117–121. Obter dispositivo/conector, opções de driver, resoluções, modo de captura e significado esperado de “posição do documento”. O texto não informa hardware, sistema operacional da estação, quantidade de páginas ou protocolo.

Desenvolver/usar a integração do lado do módulo, sem comprar equipamento ou criar app mobile. “Chrome no celular” é o canal de acesso definido pelo usuário, não a confirmação de que haverá scanner controlado por esse aparelho. Sem aquisição real configurada, não marcar driver/DPI/lote validados apenas com upload.

### Q-10 — Procedimentos, responsáveis, calendário e aplicação de versões

**Itens:** fluxo/formulário/trâmite/cronograma e 128–134. Obter assuntos, atividades, responsáveis, documentos, condições, prazos/calendário, atos de encerramento/retorno, aplicação de alterações aos processos ativos e o conjunto de procedimentos a modelar/documentar.

Os ensaios usam configurações fictícias explícitas e não devem aguardar toda parametrização de produção para desenvolver o motor. Entretanto, a implantação real requer esses dados; não apresentar o fluxo mínimo de teste como fluxo oficial. A aplicação de versão precisa ter alcance/conflitos visíveis, sem sacrificar PED-087 ou histórico.

### Q-11 — URA e criação automática

**Item:** 33. Identificar URA, evento, autenticação, dados fornecidos, confirmação e ambiente autorizado. Implementar receptor idempotente e teste real com atendimento/evento legítimo; sem isso, demonstrar apenas teste de contrato rotulado.

O texto não define contratação de telefonia, número telefônico, atendimento humano ou chatbot. Não criar esses serviços por suposição. A ausência de especificação não remove a exigência de conexão; continua pendência no ID.

### Q-12 — Destino da exportação direta de dados

**Item:** 115. Obter base de homologação, tabelas/campos de destino, credenciais, permissões e regra de atualização/duplicidade. A escrita é autorizada somente nesse escopo.

Sem destino identificado, preparar mapeamento/adaptador e testes locais rotulados, mas não marcar transferência direta como atendida. Não criar banco de outro sistema nem inserir em produção para comprovar o item. Exportação CSV/TXT dos itens 114/127 não dispensa a função direta.

### Q-13 — E-mail, portal, fontes setoriais e ensaio externo

**Itens:** 8–9/39/86/96, além de contas/canais externos e documentos fiscais. Confirmar remetente, caixas de teste, links/base de URL, execução de tarefas, fontes documentais e permissões de terceiros.

Operações processuais locais podem ser testadas antes das credenciais, com pendências identificadas. Recebimento de e-mail precisa ser comprovado em ambiente autorizado; captura/log local é teste técnico. Compartilhamento de auditoria e participação fiscal não exigem inventar API de TCE ou refazer o módulo Tributário.

<a id="fontes"></a>
## 11. Auditoria documental, cobertura e fontes

### 11.1 O que foi conferido na composição deste MD

| Verificação | Resultado |
|---|---:|
| Itens extraídos do bloco da fonte | 134 |
| IDs únicos, em sequência PED-001 a PED-134 | 134 |
| Transcrições individuais do TR | 134 |
| Blocos com implementação, demonstração, aceite, origem de dados e limite | 134 |
| IDs sem orientação individual | 0 |
| IDs numerados adicionados como se fossem do TR | 0 |

As citações foram comparadas programaticamente ao texto das páginas 54–63, normalizando apenas espaços/quebras de linha. A sequência e as fronteiras foram conferidas nas imagens dessas páginas: excluídos o final de Compras anterior ao título e o início de Contabilidade posterior ao item 134. Os cálculos e contagens dos cenários são resultados esperados de ensaio; não foram executados no CeleriFlow.

**Não confundir transcrição completa com conformidade já comprovada.** Todos os itens têm plano, inclusive os com dependência externa ou interpretação explícita. Os itens de modelagem explicativa permanecem separados na rastreabilidade, com evidência de serviço/configuração/documentação, e não com telas artificiais criadas para completar a contagem.

### 11.2 Sobreposições que podem compartilhar código

| Núcleo | Exemplos de IDs | Cuidado |
|---|---|---|
| E-mail de protocolização | 8/86 | Uma mensagem pode evidenciar ambos, mas os dois links/conteúdos precisam funcionar. |
| Setores e permanência | 64/101, relacionados a 28–30 | Mesma configuração aplicada à instância; não apenas repetição textual. |
| Modelos e biblioteca | 27/47/56/84 | Termos distintos, parâmetros e uso no fluxo continuam necessários. |
| Juntada e leitura | 13/37/38/44/102–106 | Upload, peça, foliação, composição e apensação são capacidades diferentes. |
| Autenticidade e QR | 35/82/83 | Consulta e QR não substituem assinatura por certificado. |
| Assinaturas | 34/36/42/92–96/119 | Trâmites, anexos, documentos digitalizados e múltiplos signatários precisam de testes próprios. |
| Consulta e impressão | 24/26/46/49/55/90/112/125–127 | Metadados processuais e dados extraídos não são o mesmo conjunto; impressão cobre o filtro. |
| Fluxos e modelagem | 15–18/59–65/87–89/100–101/128–134 | Modelar, executar, migrar ativos, descobrir percurso real e documentar são entregas diferentes. |
| Público/sigilo/ouvidoria | 32/41/66–72/80 | Não fundir público com livre acesso integral nem remover anonimato. |
| Extração/proveniência | 108–115/122–124 | Reconhecimento, revisão, garantia documental, pesquisa e envio ao destino não são equivalentes. |

### 11.3 Fontes e precedência

- **TR-PED:** `termo de referencia (Ratificado)(1).pdf`, Processo Administrativo nº 1026/2026, 335 páginas, seção 19, **GESTÃO DE PROCESSOS ELETRÔNICOS E DIGITAIS**, pp. 54–63, itens 1–134; **Modelagem de Fluxos**, itens 128–134. Fonte exclusiva das transcrições funcionais específicas.
- **TR-GERAL:** mesmo PDF, pp. 28–33 e 40–44; referências selecionadas na seção 1.4. Não é auditoria integral do núcleo geral.
- **UX-BASE:** `CeleriFlow_POC_Almoxarifado_Patrimonio_Desenvolvimento_REV02.md`, padrão de interface já definido pelo usuário e reproduzido nos MDs de Meio Ambiente/Frotas/Compras. As dimensões deste arquivo são decisões de projeto, não normas novas atribuídas ao edital.
- **CANAL E FRONTEIRAS:** instruções do usuário nesta conversa e padrão consolidado no MD de Meio Ambiente REV02: mesmo site no Chrome do celular e dados de outros módulos destacados sem reconstruir a origem.

Não foi incorporada pesquisa externa de legislação arquivística, assinatura, telefonia, hardware, motores OCR ou contratos de bases externas para preencher lacunas. O agente deve localizar as especificações reais antes de concluir os itens dependentes; os exemplos não são homologação de tecnologia ou procedimento oficial.

**Entrega final esperada:** módulo integrado ao CeleriFlow, 134 resultados individualmente testáveis conforme as definições aplicáveis, serviços externos comprovados onde exigidos, fontes de dados identificadas, documentação dos procedimentos e evidência real por ID. Pendências devem ser declaradas; não devolver apenas um novo plano ou afirmar aprovação da POC pela contagem de requisitos descritos.
