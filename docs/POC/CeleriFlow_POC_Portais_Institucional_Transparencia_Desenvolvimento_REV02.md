# CeleriFlow — Desenvolvimento e demonstração da POC
## Portal Institucional e Portal da Transparência | Divino de São Lourenço/ES

**Revisão 02 — 18/09/2026 — dois módulos separados, desenvolvimento conjunto.**  
**Destinatário:** Codex/Antigravity com acesso ao repositório real.  
**Fonte funcional:** `termo de referencia (Ratificado)(1).pdf`, Processo Administrativo nº 1026/2026, seção 19: **PORTAL INSTITUCIONAL**, pp. **310–320**, itens **1–134**; e **PORTAL DA TRANSPARÊNCIA**, pp. **145–149**, itens **1–51**. Os limites dos dois blocos foram preservados.  
**Identificadores:** **POR-001 a POR-134** e **PTR-001 a PTR-051**, mantendo a numeração de cada bloco. **Total: 185 entradas do TR**, sem transformar títulos introdutórios ou repetições em funcionalidades novas.  
**Objetivo:** desenvolver os portais Institucional e da Transparência no mesmo CeleriFlow, com componentes/infraestrutura compartilhados, funções e menus próprios, fontes reais identificadas e demonstrações reproduzíveis com dados fictícios. **Substitui a REV01 isolada do Portal Institucional como instrução de trabalho.**

> **Ordem ao agente:** examinar o repositório, reaproveitar os componentes e serviços existentes, implementar as lacunas dos dois blocos e executar os testes por ID. Compartilhar componentes não autoriza eliminar funções próprias da Transparência nem alterar os módulos de origem sem indicação. Não entregar somente outro planejamento, páginas estáticas, capturas, dados fixos, botão sem efeito ou telas que dependam de edição de código para atualizar conteúdo.

**Decisões do usuário:** conservar a identidade do CeleriFlow; gerenciador profissional com tabelas paginadas, ações acessíveis e prioridade para ausência de rolagem global no desktop. No celular, usar **o mesmo site no Chrome**, sem aplicativo separado. **Destacar dados/serviços de outros módulos e consumir o que existir, sem reconstruir a origem.** O Portal público mantém navegação editorial responsiva: não será transformado em uma tela administrativa de ERP para artificialmente eliminar rolagem.

**Situação da análise:** plano elaborado a partir do TR. Repositório, aplicação publicada, serviço de armazenamento, e-mail, dispositivos e navegadores não foram inspecionados/testados. Há **185 entradas documentadas**, não 185 funcionalidades declaradas prontas. No Portal Institucional, **POR-075 está incompleto na fonte** e **POR-054/POR-118 têm referências que divergem dos subtítulos**. Mantêm-se as ressalvas da seção 10; as definições específicas da Transparência estão na seção 12.8.

**Como interpretar:** apenas o campo **TR** transcreve a exigência, inclusive repetições e imperfeições, normalizando somente espaços/quebras de linha. Títulos de navegação, exemplos, decisões de implementação, estados, critérios de teste, tamanhos e dados deste MD são orientações de projeto, não roteiro oficial da comissão. O item POR-007 introduz o conjunto de acessibilidade Institucional; manter sua evidência agregada sem inventar outra função.

**Navegação:** [Desenvolvimento conjunto](#desenvolvimento-conjunto) · [Institucional: escopo](#escopo) · [134 itens Institucionais](#lista) · [Fontes do Institucional](#dependencias) · [Operação](#operacao) · [Interface](#ux) · [Base POR](#base) · [Detalhamento POR](#itens) · [Testes POR](#testes) · [Ressalvas POR](#pendencias) · [Portal da Transparência](#transparencia) · [51 itens PTR](#ptr-lista) · [Fontes PTR](#ptr-origens) · [Detalhamento PTR](#ptr-itens) · [Plano e fechamento conjunto](#plano-conjunto)

---
<a id="desenvolvimento-conjunto"></a>
## 0. Desenvolvimento conjunto — dois módulos, uma base de componentes

### 0.1 Resultado da análise de aderência

**Aderência técnica suficiente para desenvolver os dois portais no mesmo trabalho; escopos funcionais distintos.** Portal Institucional é o CMS editorial e suas páginas públicas. Portal da Transparência é a publicação estruturada dos dados da gestão, com consultas, documentos, exportações e E-SIC. Uma página dinâmica contendo um link ou um PDF financeiro não substitui o segundo módulo.

| Componente | Reutilização proposta | O que continua separado |
|---|---|---|
| Identidade visual, cabeçalho, rodapé, responsividade e acessibilidade | Componentes e tokens comuns; aproveitar atalhos, contraste e alternativas de mídia. | Títulos, menus e configurações de cada portal; testar cada área e não herdar uma suposta aprovação. |
| Administração, sessão e permissões | Mesmo acesso administrativo do CeleriFlow. | Permissão de editar notícia não concede permissão de publicar folha, configurar entidades ou analisar recurso do E-SIC. |
| CMS, editor, páginas e informações institucionais | Mesmo editor e modelo de conteúdo; reutilizar páginas por vínculo quando o conteúdo for efetivamente o mesmo. | Glossário, FAQ, manual e Carta de Serviços ficam identificáveis na Transparência. Não duplicar toda a estrutura editorial nela. |
| Repositório, objetos em nuvem e downloads | Um serviço de mídia/documentos e arquivos referenciados por ID. | Publicação, classificação e exposição em cada portal; um vínculo público não torna o GED inteiro público. |
| Menus, acessos e links | Reutilizar cadastro e renderização com contexto do portal. | Árvore Institucional e árvore Transparência distintas. Alterar uma não reordena ou desativa a outra. |
| Tabelas, filtros e exportadores | Componentes comuns com consultas específicas. | Dados contábeis não são notícias; totais e estágios não são calculados a partir de texto do CMS. |
| E-SIC | Reutilizar Processos/Ouvidoria/E-SIC existentes se cobrirem a operação. | Pedido, recurso, resposta, publicação e estatística próprios; enquete, Fale Conosco e newsletter não substituem E-SIC. |
| Fontes de gestão | Consumir os dados reais dos módulos indicados na seção 12.3. | Não recriar Contabilidade, Tributos, RH, Compras, Patrimônio ou Almoxarifado dentro dos portais. |

A correspondência acima é uma **decisão de arquitetura deste plano**, baseada nos dois blocos do TR; o documento não determina que os nomes de classes, tabelas ou rotas já existam no repositório.

### 0.2 Organização dos acessos

No menu administrativo, manter **Portal Institucional** e **Portal da Transparência** claramente destacados. Eles podem aparecer sob o agrupamento existente “Portais” ou no nível equivalente do menu do CeleriFlow, sem criar um terceiro sistema. O usuário deve identificar em qual módulo trabalha pelo título, contexto e caminho de navegação.

No público, oferecer entradas identificáveis para **Portal Institucional** e **Portal da Transparência**, com navegação de ida e volta. Rotas como `/institucional` e `/transparencia` são exemplos conceituais, a mapear ao domínio e à estrutura reais. Não exigir novo domínio, outro deploy ou outra conta de autenticação só para separar os módulos. Se os sites já forem implantados separadamente, preservar essa infraestrutura e compartilhar os serviços/componentes compatíveis, sem migração obrigatória de arquitetura.

O público consulta conteúdo publicado sem login administrativo. O tratamento de identificação e acompanhamento de pedidos E-SIC segue a capacidade existente e a política definida, sem expor a identidade privada do solicitante. No celular, usar **o mesmo site responsivo no Chrome**, sem aplicativo nativo, wrapper ou instalação obrigatória.

### 0.3 Responsabilidade pelos dados

**Dados editoriais e de publicação:** pertencem ao gerenciador dos portais. Incluem conteúdo de página, referências de arquivo, ordem dos menus, visibilidade, glossário, manual, organização das publicações e configurações de apresentação.

**Fatos de gestão:** pertencem ao módulo de origem. Empenho, liquidação, pagamento, arrecadação, salário, contrato, aditivo, movimento de estoque e bem patrimonial não serão criados ou alterados em uma tela editorial para simular integração. A Transparência consulta a origem por serviços/visões de leitura permitidas pela arquitetura real; uma projeção de publicação, quando necessária, é derivada e rastreável, não outro livro contábil.

O agente deve separar no diagnóstico: **fonte disponível e testada**, **fonte identificada ainda não integrada** e **fonte não fornecida**. Uma ausência não vira valor zero, lista vazia ou selo “atualizado”. Implementar o lado consumidor e informar os IDs afetados quando a origem estiver ausente. Não modificar o módulo de origem silenciosamente.

**Não usar a regra anterior “Institucional só aponta para Transparência” para excluir este novo desenvolvimento.** Ela passa a significar: páginas do Institucional não reimplementam consultas da Transparência; apontam para as consultas do segundo módulo, que agora fazem parte deste mesmo pacote.

### 0.4 Escopo adicional autorizado nesta revisão

Entram no desenvolvimento os **51 itens PTR-001 a PTR-051**. Isso inclui publicação financeira integrada, E-SIC com recurso e estatísticas, upload administrativo dos documentos, exportações **PDF/XLS/XLSX/RTF/CSV** e migração de pelo menos seis meses. Não tratá-los como extras só porque não pertenciam ao Institucional.

Continuam fora: nova contabilidade, nova folha, motor de arrecadação, execução de compras, publicação automática em redes sociais, portal de pagamentos, APIs fiscais ou bancárias não pedidas neste bloco, certificação inventada, portal PNCP próprio e laboratório que se apresente como fonte oficial. A consulta/exportação de dados públicos não autoriza executar operações administrativas na origem.

### 0.5 Como trabalhar com este documento

As seções **1–11 preservam o detalhamento do Portal Institucional**, com IDs **POR** e ressalvas próprias. A seção **12 contém a análise, os 51 itens e os testes da Transparência**, com IDs **PTR**. A seção **13 coordena os dois módulos em um único desenvolvimento e encerra a entrega conjunta**. As referências internas anteriores de POR foram mantidas para não quebrar o acompanhamento já iniciado.

Uma função compartilhada pode atender vários IDs, mas cada linha conserva seu teste. Por exemplo: o mesmo repositório atende POR-124 e os documentos PTR-047, enquanto a comprovação de upload público e a de árvore/privacidade têm verificações diferentes. **185 entradas do TR não significam 185 telas ou 185 funções independentes.**

---
<a id="escopo"></a>
## 1. Portal Institucional — escopo e execução

### 1.1 Área Institucional: CMS privado e site público

Ler `AGENTS.md`, manifests, lockfile, migrations e testes, quando presentes. Localizar autenticação, permissões, banco relacional, armazenamento de objetos, editor visual, gerenciador, repositório, envio de e-mail, relatórios e publicação/cache. Confirmar stack, rotas e nomes de serviços; nomes conceituais deste MD não são caminhos cuja existência foi verificada.

Manter **uma entrada administrativa “Portal Institucional”** no CeleriFlow e a área pública correspondente no domínio/rota configurados, ao lado da entrada própria **Portal da Transparência** definida na seção 0. Os grupos de conteúdo são áreas internas do mesmo gerenciador: Menus, Páginas Dinâmicas, Agendas, Notícias, Galerias, Questionários, Enquetes, Newsletter, Acesso Rápido, Redes Sociais, Links Úteis, Telefones Úteis e Repositório. Configurações e acessibilidade podem compartilhar componentes sem se tornarem novos sistemas.

Área pública é anônima para conteúdo público; gestão exige cadastro e autorização. Não adicionar login à leitura de notícias. “Área privada” não significa publicar uma segunda cópia independente do site ou duplicar o banco.

### 1.2 Fronteiras de desenvolvimento

**Os módulos permanecem distintos:** o Institucional organiza conteúdo editorial; a Transparência, agora incluída neste mesmo desenvolvimento, publica dados estruturados, documentos e E-SIC conforme a seção 12. Menus e páginas do Institucional podem apontar para essas consultas sem duplicá-las. Portal Tributário, Ouvidoria geral e o motor de Processos não serão reconstruídos; seus dados/serviços necessários ficam destacados. Não copiar débitos privados, certidões ou relatórios para texto do CMS e apresentar isso como integração.

Por outro lado, **CMS, páginas, agenda, ocorrências, notícias, galerias, pesquisas, newsletter e administração do repositório descritos neste bloco são o objeto do trabalho**. Não deixá-los sem implementação sob a justificativa genérica de “dependência de outro módulo”. Quando já houver serviço compartilhado, consumi-lo. Quando a função pertencer ao Portal e não houver núcleo separado, implementar o mínimo necessário dentro deste domínio, sem criar outro produto genérico.

| Classe | Significado | Regra |
|---|---|---|
| **TR-E** | Item numerado do bloco correspondente: POR ou PTR. | Entregar as ações/campos expressos, mantendo todos os IDs e a separação de módulos. |
| **TEC** | Persistência, validação, transação, proteção de acesso, cache e teste. | Meio para a função operar; não novo processo de negócio. |
| **UX/CANAL** | Orientações do usuário sobre interface e navegador. | Aplicar ao gerenciador e adaptar o site público ao seu uso editorial. |
| **DEP-MOD / DEP-SERV** | Dados/serviço de outra origem. | Identificar, consumir e testar; falta real fica registrada, sem inventar integração. |
| **FONTE_INCOMPLETA / INTERPRETAÇÃO** | Redação que não define resultado suficiente ou conflita com o contexto. | Preservar a citação e a pendência, sem contá-la como homologação. |
| **EXTRA** | Função sem vínculo à fonte ou à orientação do usuário. | Não desenvolver neste pacote. |

Reutilizar código e dados existentes sem mudança desnecessária de framework, ORM, banco, provedor ou infraestrutura. Migrations devem ser incrementais, compatíveis com os consumidores e limitadas ao domínio pertinente. Não excluir trabalho de terceiros nem manter “Portal antigo” e “Portal POC” como bases paralelas de conteúdo.

### 1.3 Não acrescentar — e não retirar o que está expresso

**Não acrescentar:** aplicativo nativo/híbrido, wrapper, instalação de PWA, push, offline, chatbot, WhatsApp/SMS por analogia com Tributário, comentário/reação em notícia, loja, ingressos, reserva de eventos, inscrição comercial em curso, análise de sentimento, transcrição por IA, publicação automática em redes sociais, coleta de conteúdo de terceiros, SEO como campanha, ranking de popularidade, editor genérico de ERP ou novo portal de serviços fiscais.

**Não retirar como extras do Institucional:** arrastar e soltar, todos os controles do WYSIWYG, visualização do código-fonte do conteúdo, calendário/carrossel de agenda, categoria como vínculo do evento, questionários **e** enquetes com revisão, três tipos de questões, gráficos de resultados, dashboard/gráficos de newsletter, mensagens customizadas, **áudio descrição nas três telas citadas**, todos os limites de Acesso Rápido, banco relacional, arquivos em objetos na nuvem e privacidade do repositório.

Um botão de configurar, salvar, publicar, enviar ou excluir precisa executar a ação pertinente e indicar falha real. Não tornar “ativo” sinônimo de “publicado e revisado” nas pesquisas. Não transformar um link para outro módulo em comprovação de que a função do destino foi desenvolvida neste trabalho.

<a id="lista"></a>
## 2. Portal Institucional — lista dos 134 itens na organização da fonte

A tabela de cada grupo é um índice de navegação. A redação integral e o plano de cada entrada estão na seção 7. **“Requisitos do Portal Institucional” e “Módulo Gerenciador de Conteúdo”** são títulos de organização antes de Menus. Os demais grupos abaixo preservam os subtítulos do TR.

### Requisitos Gerais

| ID / item do TR | Conteúdo resumido | Página do PDF |
|---|---|---:|
| [POR-001 / 1](#por-001) | Portal web responsivo nos navegadores e dispositivos citados | 310 |
| [POR-002 / 2](#por-002) | Área pública anônima e gerenciador privado | 310 |
| [POR-003 / 3](#por-003) | Padrões W3C e usabilidade | 310 |
| [POR-004 / 4](#por-004) | Registros em banco relacional e consulta dinâmica | 310 |
| [POR-005 / 5](#por-005) | Arquivos em armazenamento de objetos em nuvem | 310 |
| [POR-006 / 6](#por-006) | Conteúdo textual em português do Brasil | 310 |
| [POR-007 / 7](#por-007) | Conjunto de recursos de acessibilidade | 310 |
| [POR-008 / 8](#por-008) | HTML lógico e semântico | 310 |
| [POR-009 / 9](#por-009) | Texto alternativo das imagens | 310 |
| [POR-010 / 10](#por-010) | Alternativas acessíveis para áudio e vídeo | 310 |
| [POR-011 / 11](#por-011) | Hiperlinks com textos significativos | 310 |
| [POR-012 / 12](#por-012) | Tags semânticas para leitores e buscadores | 310 |
| [POR-013 / 13](#por-013) | Tabelas somente para dados | 310–311 |
| [POR-014 / 14](#por-014) | Atalhos, fonte, contraste e páginas de acessibilidade/mapa | 311 |
| [POR-015 / 15](#por-015) | Ordenação editorial por clicar, arrastar e soltar | 311 |
| [POR-016 / 16](#por-016) | Parametrização e adaptação do portal | 311 |
| [POR-017 / 17](#por-017) | Sincronização entre gerenciador, banco e portal | 311 |
| [POR-018 / 18](#por-018) | Operações de manutenção dos registros do CMS | 311 |
| [POR-019 / 19](#por-019) | Atualização dinâmica pelo usuário responsável | 311 |

### Menus

| ID / item do TR | Conteúdo resumido | Página do PDF |
|---|---|---:|
| [POR-020 / 20](#por-020) | Manutenção de menus e itens de menu | 311 |
| [POR-021 / 21](#por-021) | Campos completos na criação do item de menu | 311 |
| [POR-022 / 22](#por-022) | Edição completa do item de menu | 311–312 |
| [POR-023 / 23](#por-023) | Árvore completa de menus com indentação | 312 |
| [POR-024 / 24](#por-024) | Ações da listagem de menus | 312 |
| [POR-025 / 25](#por-025) | Confirmação antes de excluir menu | 312 |
| [POR-026 / 26](#por-026) | Ocultar exclusão de menu com dependentes | 312 |
| [POR-027 / 27](#por-027) | Arrastar e soltar itens de menu | 312 |

### Páginas Dinâmicas

| ID / item do TR | Conteúdo resumido | Página do PDF |
|---|---|---:|
| [POR-028 / 28](#por-028) | Manutenção de páginas dinâmicas | 312 |
| [POR-029 / 29](#por-029) | Título, situação e conteúdo da página | 312 |
| [POR-030 / 30](#por-030) | Editor WYSIWYG completo para páginas | 312 |
| [POR-031 / 31](#por-031) | URL automática da página | 312 |
| [POR-032 / 32](#por-032) | Criar menu a partir de uma página | 312–313 |
| [POR-033 / 33](#por-033) | Pré-visualização da página pela listagem | 313 |
| [POR-034 / 34](#por-034) | Confirmação para exclusão de página | 313 |
| [POR-035 / 35](#por-035) | Bloqueio público de página inativa | 313 |

### Agendas

| ID / item do TR | Conteúdo resumido | Página do PDF |
|---|---|---:|
| [POR-036 / 36](#por-036) | Configuração do componente de agenda | 313 |
| [POR-037 / 37](#por-037) | Limites, visão e situação do componente de agenda | 313 |
| [POR-038 / 38](#por-038) | Manutenção de agendas | 313 |
| [POR-039 / 39](#por-039) | Título e uma ou mais categorias por agenda | 313 |
| [POR-040 / 40](#por-040) | URL automática de agenda | 313 |
| [POR-041 / 41](#por-041) | Criar menu a partir de agenda | 313 |
| [POR-042 / 42](#por-042) | Criar ocorrência no contexto de agenda | 313 |
| [POR-043 / 43](#por-043) | Manutenção das categorias de agenda | 313 |
| [POR-044 / 44](#por-044) | Título da categoria de agenda | 313 |
| [POR-045 / 45](#por-045) | Manutenção das ocorrências de agenda | 313 |
| [POR-046 / 46](#por-046) | Campos completos da ocorrência | 313 |
| [POR-047 / 47](#por-047) | Envio de ocorrência aos assinantes | 313 |
| [POR-048 / 48](#por-048) | Ocorrência vinculada à categoria, não diretamente à agenda | 313 |

### Notícias

| ID / item do TR | Conteúdo resumido | Página do PDF |
|---|---|---:|
| [POR-049 / 49](#por-049) | Manutenção de notícias | 314 |
| [POR-050 / 50](#por-050) | Campos completos da notícia | 314 |
| [POR-051 / 51](#por-051) | Editor WYSIWYG completo para notícias | 314 |
| [POR-052 / 52](#por-052) | Envio de notícia aos assinantes | 314 |
| [POR-053 / 53](#por-053) | Manutenção das categorias de notícia | 314 |
| [POR-054 / 54](#por-054) | Categoria de agenda: título e situação — redação divergente | 314 |
| [POR-055 / 55](#por-055) | Configuração do componente de notícias | 314 |
| [POR-056 / 56](#por-056) | Limites de notícias, destaques e carrossel | 314 |

### Galerias

| ID / item do TR | Conteúdo resumido | Página do PDF |
|---|---|---:|
| [POR-057 / 57](#por-057) | Manutenção de galerias | 314 |
| [POR-058 / 58](#por-058) | Título, descrição, tipo, capa e situação da galeria | 314 |
| [POR-059 / 59](#por-059) | Envio de galeria aos assinantes no cadastro | 314 |
| [POR-060 / 60](#por-060) | URL automática da galeria | 315 |
| [POR-061 / 61](#por-061) | Manutenção dos itens da galeria | 315 |
| [POR-062 / 62](#por-062) | Itens de galeria exclusivamente pelo repositório | 315 |
| [POR-063 / 63](#por-063) | Nome e descrição do item de galeria | 315 |
| [POR-064 / 64](#por-064) | Listagem completa dos itens de uma galeria | 315 |
| [POR-065 / 65](#por-065) | Excluir item sem excluir arquivo do repositório | 315 |

### Questionário

| ID / item do TR | Conteúdo resumido | Página do PDF |
|---|---|---:|
| [POR-066 / 66](#por-066) | Manutenção de questionários | 315 |
| [POR-067 / 67](#por-067) | Título, descrição e janela do questionário | 315 |
| [POR-068 / 68](#por-068) | Configurações de acesso, resultados e encerramento do questionário | 315 |
| [POR-069 / 69](#por-069) | Questões de única escolha, múltipla e discursiva | 315 |
| [POR-070 / 70](#por-070) | Campos e alternativas de única escolha no questionário | 315 |
| [POR-071 / 71](#por-071) | Ordenar opções de única escolha do questionário | 315 |
| [POR-072 / 72](#por-072) | Campos e alternativas de múltipla escolha do questionário | 315 |
| [POR-073 / 73](#por-073) | Ordenar opções de múltipla escolha do questionário | 315 |
| [POR-074 / 74](#por-074) | Questão discursiva e obrigatoriedade no questionário | 315–316 |
| [POR-075 / 75](#por-075) | Função para remover — objeto não especificado | 316 |
| [POR-076 / 76](#por-076) | Ordenar questões do questionário | 316 |
| [POR-077 / 77](#por-077) | Excluir questão durante cadastro do questionário | 316 |
| [POR-078 / 78](#por-078) | Excluir alternativa durante cadastro do questionário | 316 |
| [POR-079 / 79](#por-079) | Revisão do questionário antes de publicar | 316 |
| [POR-080 / 80](#por-080) | Prorrogar término de questionário ainda vigente | 316 |

### Enquetes

| ID / item do TR | Conteúdo resumido | Página do PDF |
|---|---|---:|
| [POR-081 / 81](#por-081) | Manutenção de enquetes | 316 |
| [POR-082 / 82](#por-082) | Título, descrição e janela da enquete | 316 |
| [POR-083 / 83](#por-083) | Configuração de acesso, resultados e encerramento da enquete | 316 |
| [POR-084 / 84](#por-084) | Tipos de questão da enquete | 316 |
| [POR-085 / 85](#por-085) | Única escolha na enquete: campos e opções | 316 |
| [POR-086 / 86](#por-086) | Ordenar opções únicas da enquete | 316 |
| [POR-087 / 87](#por-087) | Múltipla escolha na enquete: campos e opções | 316 |
| [POR-088 / 88](#por-088) | Ordenar opções múltiplas da enquete | 316 |
| [POR-089 / 89](#por-089) | Questão discursiva da enquete | 316–317 |
| [POR-090 / 90](#por-090) | Excluir alternativa durante cadastro da enquete | 317 |
| [POR-091 / 91](#por-091) | Revisão da enquete antes da publicação | 317 |
| [POR-092 / 92](#por-092) | Prorrogar término de enquete vigente | 317 |

### Newsletter

| ID / item do TR | Conteúdo resumido | Página do PDF |
|---|---|---:|
| [POR-093 / 93](#por-093) | Dashboard com quatro indicadores de newsletter | 317 |
| [POR-094 / 94](#por-094) | Gráfico de pizza dos motivos de cancelamento | 317 |
| [POR-095 / 95](#por-095) | Comparativo mensal de inscrições e cancelamentos | 317 |
| [POR-096 / 96](#por-096) | Configuração do componente de newsletter | 317 |
| [POR-097 / 97](#por-097) | Mensagens customizadas da newsletter | 317 |
| [POR-098 / 98](#por-098) | Listagem completa das inscrições | 317 |
| [POR-099 / 99](#por-099) | Criar, consultar e excluir motivos de cancelamento | 317 |
| [POR-100 / 100](#por-100) | Áudio descrição da listagem de motivos | 317 |
| [POR-101 / 101](#por-101) | Desativar ou excluir motivo pela listagem | 317 |
| [POR-102 / 102](#por-102) | Título e situação do motivo de cancelamento | 317 |
| [POR-103 / 103](#por-103) | Áudio descrição do cadastro de motivo | 317 |

### Acesso Rápido

| ID / item do TR | Conteúdo resumido | Página do PDF |
|---|---|---:|
| [POR-104 / 104](#por-104) | Configuração do acesso rápido | 318 |
| [POR-105 / 105](#por-105) | Limites de 1–12 itens e 1–6 por linha | 318 |
| [POR-106 / 106](#por-106) | Manutenção dos itens de acesso rápido | 318 |
| [POR-107 / 107](#por-107) | Campos na criação do acesso rápido | 318 |
| [POR-108 / 108](#por-108) | Edição completa do acesso rápido | 318 |
| [POR-109 / 109](#por-109) | Ordenação por arraste do acesso rápido | 318 |

### Redes Sociais

| ID / item do TR | Conteúdo resumido | Página do PDF |
|---|---|---:|
| [POR-110 / 110](#por-110) | Manutenção de redes sociais | 318 |
| [POR-111 / 111](#por-111) | Áudio descrição do cadastro de rede social | 318 |
| [POR-112 / 112](#por-112) | Campos de criação de rede social | 318 |
| [POR-113 / 113](#por-113) | Edição dos campos de rede social | 318 |
| [POR-114 / 114](#por-114) | Ordenar redes sociais por arraste | 319 |

### Links Úteis

| ID / item do TR | Conteúdo resumido | Página do PDF |
|---|---|---:|
| [POR-115 / 115](#por-115) | Manutenção de links úteis | 319 |
| [POR-116 / 116](#por-116) | Campos de criação de link útil | 319 |
| [POR-117 / 117](#por-117) | Edição de link útil | 319 |
| [POR-118 / 118](#por-118) | Ordenação de rede social em Links Úteis — redação divergente | 319 |

### Telefones Úteis

| ID / item do TR | Conteúdo resumido | Página do PDF |
|---|---|---:|
| [POR-119 / 119](#por-119) | Manutenção de telefones úteis | 319 |
| [POR-120 / 120](#por-120) | Campos de criação do telefone útil | 319 |
| [POR-121 / 121](#por-121) | Edição completa do telefone útil | 319 |
| [POR-122 / 122](#por-122) | Desativação do telefone útil | 319 |
| [POR-123 / 123](#por-123) | Ordenar telefones úteis por arraste | 319 |

### Repositório de Arquivos

| ID / item do TR | Conteúdo resumido | Página do PDF |
|---|---|---:|
| [POR-124 / 124](#por-124) | Manutenção da árvore de repositórios | 319 |
| [POR-125 / 125](#por-125) | Localização, nome, descrição, situação e privacidade do repositório | 319 |
| [POR-126 / 126](#por-126) | Edição da privacidade e dados do repositório | 319–320 |
| [POR-127 / 127](#por-127) | Mover repositório na árvore | 320 |
| [POR-128 / 128](#por-128) | Desativar repositório | 320 |
| [POR-129 / 129](#por-129) | Criar menu a partir do repositório | 320 |
| [POR-130 / 130](#por-130) | Manutenção dos arquivos | 320 |
| [POR-131 / 131](#por-131) | Envio de um ou mais arquivos com prefixo no nome | 320 |
| [POR-132 / 132](#por-132) | Renomear um ou mais arquivos logo após o envio | 320 |
| [POR-133 / 133](#por-133) | Edição de nome, descrição e situação do arquivo | 320 |
| [POR-134 / 134](#por-134) | Mover arquivo entre níveis do repositório | 320 |

<a id="dependencias"></a>
## 3. Portal Institucional — dados de outros módulos e serviços

**Origens previstas, a confirmar no repositório.** Não afirmar existência de tabela, endpoint, provedor ou integração sem localizá-los. A identificação aparece novamente em cada item pertinente.

| Referência | Origem prevista | Informação/capacidade utilizada | Limite |
|---|---|---|---|
| **DEP-01** | Administração / Autenticação / Perfis / Auditoria | Órgão, usuário, perfil, sessão privada e rastreabilidade. | Usar o núcleo, registrar permissões específicas pela convenção existente. Não criar outro login ou importar cidadãos para o painel. |
| **DEP-02** | Persistência relacional do CeleriFlow | Registros, relações, situações, configurações, respostas e eventos de newsletter. | Criar/adaptar somente estruturas do Portal. Banco relacional é exigência direta do item 4. |
| **DEP-03** | Armazenamento de objetos em nuvem | Bytes de imagem, documento, áudio, vídeo e alternativas de acessibilidade. | Adaptador existente, chave estável, metadados e leitura protegida. Não substituir por disco temporário ou URL inventada. |
| **DEP-04** | Repositório/GED/Mídias, quando já compartilhado | ID, nome, descrição, tipo, situação, privacidade e referências de uso dos arquivos. | Reutilizar sem duplicar bytes. Metadados e regras de exposição do Portal não tornam todo o GED público. |
| **DEP-05** | Editor visual / Modelos / Renderização de conteúdo | Formatação visual, HTML permitido e geração/visualização. | Configurar os recursos exigidos em 30/51. Não criar editor universal nem converter notícia em documento estático. |
| **DEP-06** | Serviço de e-mail e execução de tarefas | Despacho, destinatário, referência de provedor e estado do envio. | Cadastro/configuração/indicadores de newsletter pertencem ao Portal; não reconstruir o provedor ou agendador geral. |
| **DEP-07** | Outros módulos, cadastros institucionais e destinos externos | URL autorizada da Transparência desenvolvida neste pacote, Tributário, Processos etc.; autor/contato da fonte comum. | O Institucional vincula sem duplicar consultas. A Transparência é implementada na seção 12; funções de outros destinos permanecem sob sua responsabilidade. |

O lado do Portal deve implementar os vínculos, telas, validações e chamadas necessárias. Se uma capacidade compartilhada realmente faltar, registrar `DEPENDENCIA_SERVICO` ou `DEPENDENCIA_OUTRO_MODULO`, com ID afetado e dado/resultado faltante. Continuar os itens independentes. Não gravar diretamente em tabelas de outro domínio para contornar o serviço nem usar mock como retorno real.

### 3.1 Integrações externas efetivamente envolvidas no bloco Institucional

O requisito de **objetos em nuvem** precisa de um serviço configurado. Os envios da **newsletter** precisam de mecanismo que entregue e-mail. Endereços de **redes sociais e links úteis** são destinos de navegação; o texto não exige APIs de postagem, feeds ou autenticação nessas plataformas.

| Capacidade | Teste local ou simulador | Evidência necessária além da simulação |
|---|---|---|
| Objetos em nuvem — POR-005 e repositório | Emulador de objeto pode testar upload, chave, erro e privacidade da aplicação. | Enviar/abrir objetos no serviço de nuvem configurado e verificar acesso/permissões. Emulador local não prova armazenamento em nuvem. |
| E-mail — POR-047/052/059/097 | Caixa de captura local prova composição, seleção de destinatários e despacho da aplicação. | Enviar a caixas controladas/autorizadas no ambiente de homologação e conferir recebimento, sem confundir aceite do provedor com entrega ao destinatário. |
| Links para outro módulo | Destino de teste identificado pode conferir navegação e parâmetro correto. | Abrir a rota real disponível; falha do destino deve ser registrada. Link não prova as funcionalidades internas desse módulo. |
| Áudio e vídeo | Arquivos demonstrativos e player real bastam para testar reprodução e alternativas. | Bytes reais, som inteligível e conteúdo descritivo/transcrito correspondente; não é necessário contratar serviço de voz/IA. |

**Não é necessário criar um laboratório externo complexo só para o Institucional.** A integração de fontes da Transparência é tratada separadamente nas seções 12.3/12.9. Usar testes de contrato dos adaptadores e recursos existentes. Nunca enviar newsletter fictícia a cidadãos reais, publicar arquivo privado de outro módulo ou registrar como entregue o que foi apenas capturado localmente.

<a id="operacao"></a>
## 4. Portal Institucional — contratos de operação e integridade

As decisões abaixo são meios técnicos propostos. Solução equivalente existente é aceita quando produz os resultados e passa nos testes.

### 4.1 Dados, publicação, URLs e prévia

Banco é a fonte dos registros e relações; objetos em nuvem são a fonte dos bytes. Conteúdo digitado em WYSIWYG deve continuar editável, não virar apenas uma captura/PDF. O gerenciador grava, e o site público lê a versão efetiva autorizada. Definir invalidação de cache/publicação após a operação confirmada; não usar deploy manual para cada alteração editorial.

Identificador interno não deve ser o título nem a posição. Gerar automaticamente URL de páginas, agendas e galerias. Usar resolução de colisões de títulos e preservar referências ao renomear. Menus criados a partir de um objeto guardam o vínculo correspondente, não uma URL malformada montada pelo operador.

Página inativa não pode ser recuperada pelo público por URL, API, prévia indevida ou cache da aplicação. A prévia administrativa usa autorização própria e não tem armazenamento compartilhado com a consulta anônima. Remover menu não equivale a bloquear a página; manter distinção entre visibilidade de navegação e permissão do recurso de destino.

Salvar deve validar no servidor. Aviso de sucesso somente após confirmação; retentativa de um mesmo comando não deve gerar duas páginas, vínculos, respostas ou envios lógicos. Uma operação independente válida continua permitida mesmo que tenha o mesmo título/valor textual.

### 4.2 Exclusão, inativação, referências e recursos reutilizados

Criar/visualizar/configurar quando aplicável/editar/excluir são capacidades transversais do item 18. Não entregar apenas inativação quando o item pede excluir. Uma exclusão lógica pode retirar o registro das listas normais e do público enquanto conserva referências técnicas necessárias; o efeito e a política devem ser documentados. Não inventar prazo legal de retenção.

**Menu com dependentes:** a ação Excluir fica **oculta** na interface e também é recusada no servidor. Contar dependentes inativos. A criação concorrente de filho deve ser considerada na confirmação da exclusão.

**Arquivo em uso:** mostrar dependências, permitir desfazer/reassociar vínculos pelas ações já previstas e depois excluir o recurso elegível. Não implementar cascade silencioso. Remover um item de galeria é operação diferente: apaga apenas a associação e **não apaga o arquivo do repositório**, inclusive quando esse for seu último uso na galeria.

**Categoria em uso:** preservar vínculo válido de notícias/ocorrências. Se necessário, solicitar reassociação antes da exclusão. **Motivo de cancelamento usado:** preservar o significado do evento histórico para que os gráficos não mudem após inativar/excluir o cadastro; a forma de conservar o histórico deve seguir a política já adotada, sem expor dados pessoais desnecessários.

### 4.3 Hierarquias e ordenação persistida

Menu e repositórios são árvores sem ciclos. Cada nó possui identidade, pai e posição. Alterar nome não altera o pai. Mover um nó não duplica a subárvore e não pode colocá-lo em si mesmo ou num descendente.

Ordenar por **clicar, arrastar e soltar** é requisito expresso. Aplicar às coleções ordenáveis do Portal, incluindo as alternativas de pesquisas. Oferecer alternativa por teclado como complemento, nunca como substituta do arraste.

Em listas grandes, disponibilizar modo de ordenação que alcance o conjunto completo por navegação própria, posicionamento entre páginas ou visão dedicada acessível. Não reenviar apenas as posições de dez linhas e sobrescrever a ordem das demais. Validar a versão da lista em conflito concorrente. A consulta pode ser paginada; a operação de ordenação precisa ter seu alcance identificado.

Árvore completa não pode ser fragmentada em páginas independentes que ocultem o pai e o nível do item. Expandir/recolher e uma região própria de navegação são preferíveis a esconder parte da estrutura. A exceção de rolagem da árvore é delimitada, não autorização para toda tela ser interminável.

### 4.4 Agenda → categorias → ocorrências

- Agenda possui título e relação com **uma ou mais categorias**.
- Ocorrência possui **uma categoria**, não uma agenda exclusiva.
- Abrir criação a partir da agenda limita as categorias disponíveis às dela.
- O evento aparece em todas as agendas que compartilham sua categoria, uma única vez em cada resultado.

Listagem paginada, calendário e carrossel usam essa mesma relação. Data/hora inicial e término opcional são tratados de forma consistente no fuso configurado; o término não pode anteceder o início. Configurar/inativar o componente não deve apagar agendas/eventos. Não criar agendamento de sala, inscrição em evento ou cobrança.

### 4.5 WYSIWYG: formatação completa e segura

Compartilhar o editor entre páginas e notícias, verificando que ambos expõem **todos os 23 recursos da seção 6.2**. Visualizar código-fonte significa ver o conteúdo gerado, não conceder execução de scripts ou alteração do código do aplicativo. A visualização pode ser somente leitura; edição de HTML não é exigência adicional deste item.

Sanitizar conteúdo ativo e URLs perigosas também no servidor, preservando a formatação legítima pedida. Uma solução que remove todas as cores, famílias de fonte, tabelas ou imagens para simplificar segurança não atende ao escopo do editor. Usar lista de estilos/elementos permitidos e validação compatíveis com a implementação existente.

Capas e imagens embutidas referenciam o repositório; alt, transcrição e descrição precisam continuar ligados ao uso correto. O selecionador do repositório deve filtrar recursos compatíveis/permitidos sem revelar anexos privados de outros módulos. Mudar a legenda de um item da galeria não deve renomear todos os usos globais da mídia.

### 4.6 Privacidade e movimentação do repositório

Privacidade deve existir na consulta/entrega do arquivo, não apenas numa etiqueta da pasta. Uma estratégia proposta é manter os objetos sem acesso público irrestrito e servir recursos por endpoint que valida situação, privacidade e vínculo. A implementação pode ser equivalente, desde que não deixe rota bruta capaz de contornar o controle.

**Política técnica proposta:** a exposição pública de recurso exige arquivo ativo e caminho de repositórios ativo/público; ancestral privado ou inativo restringe o acesso. Um movimento não pode aumentar a publicidade sem autorização e confirmação. Registrar essa escolha em Q-P08 porque o TR não detalha a herança.

Mover e renomear preservam IDs/chaves estáveis. Se a chave do objeto precisar mudar na solução existente, manter o mapeamento atômico, atualizar referências e tratar falha, sem duplicação pública. É proibido usar nome/prefixo enviado como caminho livre no sistema de arquivos.

Ao tornar pasta/recurso privado, invalidar caches e verificar links antigos da aplicação, capas, galerias e menus. **URL assinada temporária que já foi emitida não deve ser confundida com autorização consultada a cada acesso.** Documentar a validade/estratégia e usar entrega controlada quando necessário para a revogação exigida pelo comportamento da aplicação. Não prometer remover arquivos que o visitante já baixou legalmente antes da alteração.

Uploads de vários arquivos têm resultado por arquivo. Uma falha não deve exibir tudo como concluído. Não sobrescrever arquivo existente só porque outro tem o mesmo nome; tratar colisão com identidade estável. Validar formatos e tamanhos definidos para a implantação, sem inventar limites do TR.

### 4.7 Questionários e enquetes: revisão, janela e respostas

Usar motor compartilhado, com identidades e tipos de instrumento distintos. Cadastro de perguntas, alternativas e respostas deve manter referência por ID/versão, nunca somente por posição.

**Fluxo proposto para os itens 79/91:** cadastro → revisão pelo usuário → versão validada/publicável. Não exigir usuário diferente ou nova comissão. O acesso efetivo também depende de ativo/inativo e da janela de data/hora. Mudança estrutural não pode retroativamente reinterpretar respostas recebidas; preservar versão/identidades e submeter a alteração à revisão antes de disponibilizá-la. Não construir um produto genérico de versionamento como nova função administrativa.

O servidor recebe respostas reais. Questão de única escolha aceita um ID válido; múltipla aceita um conjunto sem repetição; discursiva recebe texto seguro. Obrigatoriedade é validada no servidor. Única/múltipla têm pelo menos duas opções antes da publicação. Uma pesquisa não aceita alternativa de outra.

Reenvio técnico da mesma resposta não gera outro voto. **A fonte não define unicidade por pessoa, autenticação dos participantes ou política antifraude eleitoral.** Não obrigar CPF/login, usar IP como prova de identidade ou declarar “um voto por pessoa garantido” sem definição. Distinguir quatro submissões legítimas de uma submissão reenviada quatro vezes. Q-P05 registra a política a confirmar.

Prorrogação só acontece durante a duração vigente e aumenta o término. Relógio de teste pertence ao ambiente de homologação, não ao navegador do participante nem à data global de produção. Exclusões descritas como “durante o cadastro” não autorizam apagar seletivamente respostas já publicadas.

### 4.8 Resultados: opções independentes e denominadores explícitos

Tratar separadamente ativo/inativo, consulta pública, resultado parcial, contagem de votos, pizza/barra e mensagem final. A interpretação operacional abaixo é **proposta**, a confirmar em Q-P05:

| Situação/configuração | Comportamento de ensaio proposto |
|---|---|
| Inativo ou ainda não revisado | Sem exposição/resposta pública; prévia privada autorizada continua possível. |
| Antes da publicação | Não receber respostas; não simular início apenas por estar ativo. |
| Dentro da duração e consulta pública permitida | Disponibilizar o instrumento na área pública conforme suas regras. |
| Consulta pública não permitida | Não expor instrumento/resultados pela rota anônima; consulta privada só por permissão existente. |
| Resultado parcial desabilitado | Não expor distribuição parcial das opções; uma contagem global só pode aparecer quando a sua configuração expressamente permitir. |
| Contagem pública desabilitada | Não expor números absolutos pela interface nem pelo payload público. Se resultados percentuais forem permitidos, a apresentação não deve revelar o total absoluto. |
| Término atingido | Recusar novas respostas e apresentar mensagem final; resultado final obedece à publicidade/contagem configuradas e à decisão registrada em Q-P05. |

Resposta discursiva não gera pizza artificial. Exibir seu conteúdo somente na consulta autorizada prevista; a opção de resultado público não autoriza publicar automaticamente dados identificáveis escritos por participantes.

Para múltipla escolha, participantes e marcações são medidas diferentes. Em F-PESQ há quatro respondentes e cinco marcações. No gráfico de barra por respondente, X=50% e Y=75%; os percentuais podem somar mais de 100%. Para pizza, usar distribuição das marcações, X=40% e Y=60%, **com esse denominador identificado**, sem apresentar como participação exclusiva. Esta é decisão de apresentação/teste, não fórmula estatística imposta pelo TR.

### 4.9 Newsletter: base, mensagens, métricas e envios

O componente público precisa permitir a inscrição/cancelamento necessários à lista de assinantes, aos modelos de mensagens e aos indicadores. Não criar inscrições automaticamente a partir de todo cadastro de pessoas do ERP. Telefone é campo da listagem, não obrigação de preenchimento nem canal de envio nesta fonte.

Inscrição ativa/inativa é distinta de conta de acesso ao CMS. A política de reinscrição, confirmação e tratamento de duplicidades deve ser registrada; preservar a existente quando coerente. O item de “mensagem de confirmação” não especifica confirmação obrigatória por link. Não impor double opt-in como novo requisito do edital.

Dados suficientes ao histórico: inscrição, data/hora, estado, data de cancelamento/inativação e motivo quando houver. Manter eventos ou representação equivalente para calcular os períodos sem reescrever o passado ao editar um cadastro. Não inferir “nova inscrição” somente a partir do estado ativo atual.

**Política do ensaio:** janela móvel de sete/trinta dias baseada na referência T; intervalo `[T − duração, T]`, sem eventos futuros, com fuso explícito. Cada entrada da fixture tem uma inscrição e, quando cancelada, um cancelamento. Reinscrição fica em teste separado para não alterar os resultados-base. O recorte mensal usa as datas reais dos eventos no calendário configurado.

Notícia, ocorrência e galeria geram envio quando o editor selecionar a opção pertinente. O evento fica vinculado à publicação salva; não disparar antes da gravação ou para conteúdo que o destinatário não possa consultar. Reutilizar modelos de novo conteúdo, mantendo identificação da origem. Desmarcar envio não impede salvar conteúdo.

Validar assinante ativo novamente na hora do despacho; um cancelamento posterior à preparação da fila deve impedir novo envio ainda não despachado. Proteger o enfileiramento por chave de operação/conteúdo/destinatário. Tratar resposta ambígua do provedor com o mecanismo de consulta/idempotência disponível, sem promessa irreal de “entrega exatamente uma vez” se o provedor não permitir comprová-la. Não repetir indiscriminadamente uma mensagem após timeout.

Registrar estados distintos: preparado, enviado/aceito pelo provedor, falhou e confirmação de entrega quando disponível. Para ensaio final, conferir recebimento em caixas autorizadas; logs ou captura local não provam entrega externa. Nenhum teste deve enviar a contatos reais sem autorização.

### 4.10 Áudio descrição e alternativas de mídia

Os itens 100, 103 e 111 exigem **explicação sonora específica da tela**. Disponibilizar áudio inteligível, acionável e pausável, com texto equivalente e rótulo acessível. Reutilizar o armazenamento/player; não criar serviço novo de síntese de voz.

Os roteiros de F-AUDIO devem ser gravados ou associados ao recurso existente e atualizados para refletir os controles realmente implementados. Não aceitar apenas ícone de alto-falante, tooltip, alt, botão sem arquivo ou texto genérico que não explique a tela. Leitor de tela é ferramenta complementar, não substituto automático dessa descrição orientativa.

<a id="ux"></a>
## 5. Interface profissional — padrão comum e aplicação ao Institucional

### 5.1 Gerenciador e site público têm usos diferentes

| Área | Composição | Observação |
|---|---|---|
| **Gerenciador** | Título/contexto, ações, busca/filtros, listagem paginada e rodapé de paginação. | Padrão ERP; evitar banners, cards por registro e páginas intermináveis. |
| **Ficha/editor** | Dados essenciais, conteúdo/itens em seções, configuração e salvar/cancelar. | Abas organizam a tela, não criam fases de aprovação além das pesquisas. |
| **Árvore/ordenação** | Hierarquia ou lista de ordenação com contexto e destino claros. | Deve alcançar todo o conjunto; rolagem/região própria permitida quando necessária. |
| **Página pública** | Identidade institucional, menu, conteúdo editorial, componentes e rodapé legível. | Rolagem vertical é natural; não forçar notícia extensa numa grade administrativa. |
| **Pesquisas públicas** | Perguntas legíveis, opções, obrigatoriedade, enviar e retorno. | Layout responsivo e erro localizado; não cortar questões para caber numa tela. |
| **Dashboard newsletter** | Quatro indicadores e dois gráficos exigidos, com dados e períodos claros. | Não remover gráficos para compactar, nem acrescentar painel comercial. |

Manter menu administrativo **Portal Institucional**, com os grupos nomeados na fonte em posição clara. Compartilhar telas/serviços onde fizer sentido, sem renomear tudo como “Conteúdos” e esconder a existência de Agendas, Questionários ou Newsletter durante a POC.

### 5.2 Tipografia e dimensões de referência

São escolhas de projeto herdadas dos MDs anteriores, **não números do TR nem alegação de padrão universal ou certificação**.

| Elemento | Tamanho / entrelinha de referência | Peso |
|---|---|---|
| Título de tela administrativa | 20 / 26 px | 600 |
| Título de seção/aba | 16 / 22 px | 600 |
| Tabela, campos, filtros, botões e erros do CMS | 14 / 20 px | 400; cabeçalhos/ênfase 600 |
| Metadados secundários | 12 / 16 px | 400 |
| Texto longo de leitura pública | 16 / 24 px como ponto de partida | 400 |
| Campos em dispositivo de toque | 16 px de referência | Conforme componente |

Manter a fonte atual quando consistente; na ausência de padrão, família de sistema com preferência por Segoe UI e alternativas sans-serif. Usar tokens equivalentes em `rem`, sem diminuir a fonte raiz para artificialmente caber conteúdo. Não baixar ou distribuir arquivos de fontes.

Campos/linhas do CMS: altura mínima de referência 36 px no desktop e 44 px no toque. Espaçamentos de 4/8/12/16/24 px. Não usar altura rígida que corte texto ampliado. Contraste e foco devem ser testados; 4,5:1 para texto comum é meta de UX adotada no projeto, não declaração de conformidade integral W3C.

A tipografia padrão não pode suprimir o seletor de família/tamanho/cor do WYSIWYG requerido. A edição do conteúdo segue opções permitidas, enquanto os controles do aplicativo mantêm consistência visual.

### 5.3 Paginação real e conservação do contexto

Começar com até dez registros por página no menor viewport; reduzir quando não couberem legivelmente. Consultar filtro/ordem/página/total no servidor. Ao mudar filtros, voltar à primeira página; ao voltar da ficha, preservar filtro, ordenação e página. Erro de carregamento não pode aparecer como “nenhum registro”.

Crescimento da base cria páginas, não aumenta indefinidamente a altura da listagem. Um item da terceira página deve ser encontrado pela busca sem que o usuário a tenha carregado antes. Não carregar o conjunto inteiro apenas para esconder linhas e chamar isso de paginação de servidor.

Operação em lote tem seleção/alcance explícitos. Exportações ou consultas completas abrangem o recorte integral. Não perder itens da galeria, assinantes, alternativas ou referências por estarem em outras páginas. A revisão da pesquisa percorre todo o instrumento, não só a primeira página de questões.

### 5.4 Formulários, atalhos e operações eficientes

Selecionar mídia já cadastrada; gerar URLs; criar item de menu a partir da página/agenda/repositório; selecionar categorias; reaproveitar o editor e os modelos de newsletter. A eficiência vem de não redigitar dados e de refletir uma alteração em todos os usos pertinentes.

Campos obrigatórios devem ser os expressos ou os indispensáveis tecnicamente ao registro, com essa distinção clara. Imagem/capa/ícone condicionais não podem virar documentos obrigatórios indiscriminados. Não usar assistente de oito etapas para cadastrar um telefone útil.

Erros apontam campo/problema e permanecem disponíveis, inclusive quando o campo está em outra aba. Trocar de aba não perde dados. Ação principal deve estar identificada: Salvar página, Revisar questionário, Publicar após revisão, Enviar conteúdo aos assinantes, Mover arquivo. Não exibir sucesso antes da gravação/efeito real.

Atalhos do item 14 precisam de documentação na própria página de acessibilidade e teste por navegador. Não capturar teclas enquanto o usuário escreve no editor. Arraste deve ter alternativa acessível por teclado; não substituir o gesto pedido apenas por essa alternativa.

### 5.5 Área pública, mídias e exceções à rolagem

Permitir leitura integral de página/notícia, reprodução de mídia, perguntas, árvores extensas, gráficos e documentos sem cortar conteúdo. Não usar `overflow: hidden` para mascarar estouro da tela. Preferir uma região principal de rolagem quando necessária, sem várias barras verticais aninhadas.

Carrossel tem navegação e estado compreensíveis; não requer autoplay para cumprir o TR. Calendário tem legenda textual e eventos alcançáveis, não apenas cor. Galerias devem oferecer conteúdo real, não miniaturas decorativas sem acesso ao recurso. No celular, testar menu, formulário, editor quando acessível ao operador, toque, teclado virtual, arquivo e mídia na mesma URL.

### 5.6 Testes visuais e desempenho

Viewports CSS de referência do CMS: **1366×650, 1440×800 e 1920×900**. Conferir a área útil do equipamento da POC, não apenas a resolução física do monitor. Testar zoom/texto a 200%, largura reduzida, computador e celular reais. O item 1 exige também Firefox, Opera, Edge e Safari; registrar versões e cobertura efetiva.

Nas listagens de referência, título, controles, dados e paginação devem estar acessíveis sem rolagem global, salvo exceções documentadas. No público/editor extenso, legibilidade e acesso têm prioridade. Testar foco, rótulos, alternativas de imagens/mídias, atalhos, contraste e três áudios orientativos.

Metas internas herdadas para ensaio: feedback de processamento em até 200 ms e consulta paginada em até 1,5 s no percentil 95, com rede, volume, amostra e ambiente registrados. **Não são desempenho medido nem exigência numérica do TR.** Não simular sucesso de e-mail/upload para aparentar velocidade. Mídias carregam sob demanda de forma que não prejudiquem a função e a acessibilidade.

<a id="base"></a>
## 6. Portal Institucional — base fictícia e roteiros de demonstração

Todos os nomes, conteúdos, pessoas e datas abaixo são **dados de ensaio**, não registros oficiais da Prefeitura. O usuário populará a base; o agente entrega telas funcionais e pode preparar uma carga técnica isolada. Não criar importador editorial como produto adicional neste bloco. **Essa limitação não se aplica à migração expressamente exigida em PTR-050**, que é desenvolvida na seção 12. Segredos e dados pessoais reais não entram em fixtures, logs ou documentação.

### 6.1 F-REP / F-CMS — mídias, páginas e menus

Criar repositórios RP-PUBLICO e RP-PRIVADO e filhos RP-FOTOS, RP-AUDIOS e RP-DOCUMENTOS, com situação e privacidade documentadas. Recursos: IMG-COMUM e duas fotos adicionais, um PDF demonstrativo, um áudio com transcrição e um vídeo com descrição. Os recursos devem existir no armazenamento, não em URLs fictícias; registrar a origem de cada arquivo de teste.

Criar P-01 ativa, P-02 inativa e P-EDITOR. Gerar URLs automaticamente. Menu M-INST com dois níveis adicionais e folhas para P-01, A-INSTITUCIONAL e RP-PUBLICO. Conferir criar menu pela origem, mesma/nova aba, capa/ícone onde o leiaute os utilizar, ativo/inativo e arraste. Usar registros descartáveis para exclusões sem alterar os demais ensaios.

Utilizar a mesma IMG-COMUM numa página e duas galerias; remover de uma galeria não altera a página ou a outra galeria. Mover entre pastas públicas preserva os vínculos. Testar publicização/restrição em cenário separado; não fazer a demonstração principal depender de arquivo privado.

### 6.2 F-EDITOR — checklist completo de 23 recursos

Executar o mesmo checklist em **P-EDITOR** e **N-EDITOR**. Cada recurso deve ter ação no editor, persistência e comparação visual/semântica na publicação.

| Nº de teste | Recurso da fonte | Conferência |
|---|---|---|
| 1 | Negrito | Aplicar num trecho, salvar/reabrir. |
| 2 | Itálico | Aplicar em outro trecho. |
| 3 | Sublinhado | Preservar sem virar link automaticamente. |
| 4 | Riscado | Trecho marcado continua identificado. |
| 5 | Família de fontes | Seleção efetiva entre opções suportadas. |
| 6 | Tamanho da fonte | Alterar trecho sem mudar todo o shell. |
| 7 | Cor de fundo da fonte | Cor aplicada ao texto selecionado. |
| 8 | Cor da fonte | Cor de texto independente da anterior. |
| 9 | Marcar texto | Recurso disponível e resultado persistido. |
| 10 | Remover formatação | Trecho volta ao estilo esperado sem apagar texto. |
| 11 | Aumentar indentação | Alteração visual/estrutural preservada. |
| 12 | Diminuir indentação | Reversão coerente. |
| 13 | Alinhamento à esquerda | Parágrafo correspondente. |
| 14 | Alinhamento à direita | Parágrafo correspondente. |
| 15 | Centralizado | Parágrafo correspondente. |
| 16 | Justificado | Parágrafo correspondente. |
| 17 | Lista ordenada | Numeração e estrutura de lista. |
| 18 | Lista não ordenada | Marcadores e estrutura de lista. |
| 19 | Criar link | Texto significativo e destino correto. |
| 20 | Bloco de citação | Bloco semanticamente identificável. |
| 21 | Tabela | Dados tabulares, não layout da página. |
| 22 | Inserir imagem do repositório | Mesmo ID de recurso, com alternativa pertinente. |
| 23 | Visualizar código-fonte do conteúdo | Código do conteúdo exibido sem execução arbitrária. |

Em testes negativos isolados, colar conteúdo executável ou URL proibida e conferir que não é executado. Verificar que a limpeza não remove as formatações legítimas acima. Não salvar conteúdo malicioso em ambiente de produção para demonstrar o teste.

### 6.3 F-AGENDA — relação indireta por categoria

Categorias: **Cultura, Esporte e Administração — DEMO**. Agendas: **A-PRINCIPAL = Cultura + Esporte**; **A-INSTITUCIONAL = Administração + Cultura**.

| Evento | Categoria | Início de teste | Término | Local |
|---|---|---|---|---|
| E-01 — Mostra cultural DEMO | Cultura | 20/09/2026 09h | 20/09/2026 10h | Espaço DEMO A |
| E-02 — Atividade esportiva DEMO | Esporte | 22/09/2026 14h | Não informado | Espaço DEMO B |
| E-03 — Reunião institucional DEMO | Administração | 23/09/2026 10h | 23/09/2026 11h | Espaço DEMO C |

Cada evento recebe descrição, capa e cor. Resultado inicial: **dois eventos em cada agenda e três eventos distintos no cadastro**. E-01 aparece em ambas, sem duplicação de registro. Se E-01 mudar para Esporte em cenário separado: A-PRINCIPAL continua com dois; A-INSTITUCIONAL fica com um.

Configuração do componente: limite de carrossel 2, um item visível, uma ocorrência por página, agenda escolhida e alternância entre visão paginada/calendário. Criar um novo evento a partir de A-PRINCIPAL deve oferecer somente Cultura/Esporte e salvá-lo pela categoria.

### 6.4 F-NOT / F-GAL — notícias e galerias

Criar **sete notícias**, com **três marcadas como destaque**, cada uma com título, subtítulo, fonte, corpo, capa, categoria(s) e autor DEMO. Configurar componente com limite de cinco notícias, dois destaques e três no carrossel; desligar o carrossel sem apagar notícias. Identificar a ordem utilizada, sem criar métrica de popularidade.

Galerias: G-FOTO, G-AUDIO e G-VIDEO, com suas capas, descrições, situação e URLs automáticas. Adicionar arquivos somente pelo repositório. Áudio tem transcrição e vídeo tem descrição. Usar IMG-COMUM em duas galerias; alterar nome/descrição de um item sem reescrever o outro.

### 6.5 F-PESQ — quatro respostas em questionário e enquete

Criar **Q-DEMO** e **E-PESQ** como instrumentos independentes, com título/descrição e janela de **18/09/2026 09h a 20/09/2026 18h**. Usar referência de ensaio **18/09/2026 12h**, no fuso configurado. Cadastros devem passar pela revisão expressa antes de serem publicados.

Em cada instrumento, preparar questão única Q1 (A/B/C), múltipla Q2 (X/Y) e discursiva Q3, com exemplos de obrigatório/opcional e imagens opcionais. Não são perguntas oficiais nem consulta vinculante.

| Resposta legítima | Q1 — única | Q2 — múltipla | Q3 — texto |
|---|---|---|---|
| R1 | A | X | Comentário DEMO 1 |
| R2 | A | X e Y | Comentário DEMO 2 |
| R3 | B | Y | Comentário DEMO 3 |
| R4 | C | Y | Comentário DEMO 4 |

Resultado **em cada instrumento**, sem somá-los: quatro respostas; Q1 A=2/B=1/C=1, **50%/25%/25%**. Q2 X=2/Y=3, **cinco marcações**. Percentual por respondentes é **50%/75%**; pizza por marcações é **40%/60%**, com denominação explícita. Q3 contém quatro textos autorizados para consulta interna, sem publicar dados pessoais por suposição.

Testar revisão, ativo/inativo, consulta pública, resultado parcial, contagem de votos, pizza/barra e mensagem final separadamente. Reenviar tecnicamente R1 não deve produzir quinta resposta. Não apresentar esse teste como garantia de uma participação por pessoa anônima.

Prorrogar para **22/09/2026 18h** enquanto ainda vigente. Depois do término, tentar a mesma função e recusar. Excluir perguntas/alternativas temporárias durante o cadastro e revalidar mínimo de duas opções. Não usar o texto incompleto do item 75 para inventar exclusão de respostas.

### 6.6 F-NEWS — indicadores, gráficos e destinatários

Referência **T = 18/09/2026 12h**, fuso da aplicação. Datas sem hora explícita abaixo usam 12h; S12 usa 10h. Nomes/e-mails/telefones serão preenchidos com contatos fictícios para telas e **caixas controladas/autorizadas** para envio real. Identificadores S01–S12 não são endereços de e-mail.

| Inscrição | Data de inscrição | Situação em T | Cancelamento | Motivo |
|---|---|---|---|---|
| S01 | 02/06/2026 | Ativa | — | — |
| S02 | 05/07/2026 | Ativa | — | — |
| S03 | 01/08/2026 | Ativa | — | — |
| S04 | 10/08/2026 | Inativa | 01/09/2026 | Excesso de mensagens |
| S05 | 20/08/2026 | Ativa | — | — |
| S06 | 25/08/2026 | Inativa | 05/09/2026 | Não desejo receber |
| S07 | 02/09/2026 | Ativa | — | — |
| S08 | 08/09/2026 | Inativa | 15/09/2026 | Excesso de mensagens |
| S09 | 12/09/2026 | Ativa | — | — |
| S10 | 14/09/2026 | Ativa | — | — |
| S11 | 16/09/2026 | Ativa | — | — |
| S12 | 18/09/2026 10h | Ativa | — | — |

**Esperado:** 12 inscrições no histórico; **9 ativas**, **4 novas nos últimos 7 dias**, **8 novas nos últimos 30 dias**, **3 canceladas nos últimos 30 dias**. Novas inscrições contam também as que foram canceladas dentro da janela; estado atual e ocorrência de inscrição são medidas distintas.

Histórico mensal **novas/canceladas**: junho **1/0**, julho **1/0**, agosto **4/0**, setembro **6/3**. Pizza de motivos: **2 por Excesso de mensagens** e **1 por Não desejo receber**, equivalentes a **66,67% e 33,33%** do conjunto.

Criar E-NEWS, N-NEWS e G-NEWS com envio selecionado: **três origens × nove assinantes ativos = 27 pares conteúdo/destinatário previstos**, antes de outros testes alterarem a base. São pares lógicos, não promessa de 27 chamadas de API ou número de mensagens agrupadas do provedor. Os três cancelados não recebem esses novos conteúdos.

Testar confirmação de inscrição e cancelamento em base separada ou recalcular expressamente a expectativa. Não misturar avisos de confirmação com as 27 entregas de conteúdo. Se um assinante cancelar antes do despacho, verificar supressão e atualizar a expectativa da fila; não manter o número 27 por conveniência do teste.

### 6.7 F-LINKS / F-ORD / F-PAG — limites, ordem e conjuntos completos

Criar **12 acessos rápidos ativos** identificados AQ-01 a AQ-12. Testar 6 itens/3 por linha = duas linhas de referência no desktop; 12/6 = duas linhas; 1/1 = uma linha. Configurações 0 ou 13 para total e 0 ou 7 para itens por linha devem ser recusadas. Em celular, reorganizar a grade sem perda de itens ou fonte minúscula.

Redes sociais RS-01/RS-02, links úteis LU-01/LU-02 e telefones TEL-01/TEL-02 usam destinos de teste identificados. Para navegação sem serviço real disponível, usar páginas locais de homologação; não afirmar integração com outra instituição por causa desse destino. Não realizar ligações a números reais.

Ordenar AQ-12 para a primeira posição e conferir o recorte público de seis itens. Testar arraste de irmãos na árvore e recusa de ciclo. Em base isolada, preparar **23 páginas e 23 itens de uma galeria**: páginas de 10/10/3. A busca deve encontrar um registro da terceira página; total e navegação não podem ter duplicações.

### 6.8 F-AUDIO / F-ACE — orientação sonora e recursos de acesso

Textos abaixo são **roteiros de gravação de teste**. Adaptar os nomes às telas reais, sem gerar outro produto de treinamento:

| Arquivo lógico | Tela / item | Roteiro orientativo |
|---|---|---|
| F-AUDIO-01 | Listagem de motivos — 100 | “Nesta tela você consulta os motivos de cancelamento da newsletter e a situação de cada um. Use Novo motivo para cadastrar. As ações da linha permitem desativar ou excluir, conforme os vínculos existentes. Um motivo inativo deixa de ser oferecido para novos cancelamentos, mantendo o histórico já registrado.” |
| F-AUDIO-02 | Cadastro de motivo — 103 | “Informe o título do motivo de cancelamento e selecione a situação ativa ou inativa. Revise os dados e use Salvar para gravar. Cancelar retorna sem confirmar este novo cadastro. A situação controla a oferta do motivo nos próximos cancelamentos.” |
| F-AUDIO-03 | Cadastro de rede social — 111 | “Informe nome, endereço de destino, ícone e descrição. Escolha se o link abrirá na mesma aba ou em nova aba e indique a situação ativa ou inativa. Revise o destino antes de salvar. O cadastro controla um link no portal e não publica conteúdo na rede social.” |

Reproduzir, pausar e consultar transcrição em cada tela; registrar arquivo efetivo e evidência de áudio inteligível. Não usar arquivo silencioso ou texto sem reprodução.

Executar ainda os **oito destinos/ações** do item 14: menu; conteúdo; rodapé; aumentar fonte; diminuir fonte; alternar contraste; página de acessibilidade; mapa do site. Testar descrições alt, áudio/transcrição e vídeo/descrição, hiperlinks significativos, semântica e tabelas de dados. Documentar a combinação de teclas realmente implementada e testada em cada navegador.

---
<a id="itens"></a>
## 7. Portal Institucional — desenvolvimento item a item

Cada entrada conserva a citação literal do TR. **Implementação, demonstração, aceite e limites são propostas deste plano**, não roteiro oficial. Repetições compartilham implementação, mantendo evidência por ID. Nas entradas com fonte incompleta ou divergente, a pendência não será convertida em suposto atendimento.

### Requisitos Gerais

<a id="por-001"></a>
#### POR-001 — Portal web responsivo nos navegadores e dispositivos citados

**TR — PORTAL INSTITUCIONAL, item 1, p. 310:**

> O portal institucional deverá ser integralmente desenvolvido para a web e possuir área pública responsiva aos principais navegadores, tais como Chrome, Firefox, Opera, Edge e Safari em diversas plataformas, tais como computadores desktop, notebooks, tablets e smartphones;

**Implementação:** Implementar a área pública do Portal com páginas web reais e componentes responsivos. Reutilizar a infraestrutura web do CeleriFlow sem exigir login para conteúdo público. Conferir Chrome, Firefox, Opera, Edge e Safari, incluindo computador, notebook, tablet e smartphone; registrar versões e dispositivos efetivamente testados.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Abrir a mesma página P-01, uma agenda, notícia e galeria em sessões anônimas nos navegadores citados. Em tablet/celular, testar menu, leitura, mídia e questionário; capturar viewport e resultado real.

**Aceite técnico:** As rotas exibem os mesmos dados publicados, com navegação e ações utilizáveis nas combinações testadas. Relatar qualquer navegador/dispositivo não testado; emulação de largura não é evidência de todos os navegadores.

**Atenção / limite:** Mesmo site no Chrome do celular, conforme decisão do usuário; não criar aplicativo. Isso não elimina os demais navegadores expressamente citados. Não inventar obrigação de suportar versões antigas não indicadas.

<a id="por-002"></a>
#### POR-002 — Área pública anônima e gerenciador privado

**TR — PORTAL INSTITUCIONAL, item 2, p. 310:**

> O portal institucional deverá contar com áreas operacionais distintas, sendo a primeira, a área pública, destinada ao acesso anônimo para consulta das informações públicas disponibilizadas pelo órgão, enquanto a segunda, a área privada, deverá ser utilizada exclusivamente por usuários cadastrados na plataforma para o gerenciamento do conteúdo;

**Implementação:** Manter duas áreas operacionais distintas: consulta pública e administração autenticada. Proteger criação, alteração, exclusão, prévia privada e configurações no servidor. Usuário cadastrado deve ter a permissão pertinente; publicar não torna privada a consulta pública.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Abrir P-01 sem sessão. Tentar a rota administrativa e a API de alteração anonimamente: recusar. Entrar com editor autorizado, salvar alteração e voltar à aba anônima para conferir a publicação.

**Aceite técnico:** O público consulta sem login; somente usuários cadastrados e autorizados gerenciam. URLs diretas e chamadas de API não contornam a separação.

**Atenção / limite:** Não criar cadastro obrigatório para ler notícias nem outro sistema de autenticação. Assinantes de newsletter não recebem perfil administrativo.

<a id="por-003"></a>
#### POR-003 — Padrões W3C e usabilidade

**TR — PORTAL INSTITUCIONAL, item 3, p. 310:**

> Deverá obedecer aos padrões do W3C (World Wide Web Consortium) e garantir padrões de usabilidade através de interface amigável e intuitiva;

**Implementação:** Aplicar HTML estruturado, navegação compreensível, formulários com rótulos, foco visível e os controles de acessibilidade dos itens 7–14. Usar verificações de marcação e testes manuais de teclado/leitura; registrar o conjunto de padrões e versões adotado, sem declarar certificação genérica.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Percorrer página pública e formulário do gerenciador por teclado, localizar conteúdo/menu/rodapé e corrigir um erro de formulário. Inspecionar a estrutura e registrar a ferramenta/critério efetivamente usados.

**Aceite técnico:** Problemas detectados possuem evidência e correção ou pendência. Interface funciona além da aparência; nenhum selo fictício substitui os testes.

**Atenção / limite:** Q-P04: o TR cita W3C sem versão ou nível de conformidade. Os parâmetros de UX deste MD não equivalem a certificação integral nem completam essa definição silenciosamente.

<a id="por-004"></a>
#### POR-004 — Registros em banco relacional e consulta dinâmica

**TR — PORTAL INSTITUCIONAL, item 4, p. 310:**

> Todas os registros devem ser armazenados em banco de dados relacional, possibilitando o amplo acesso de qualquer informação pública de forma dinâmica;

**Implementação:** Persistir conteúdos, menus, relações de categorias, pesquisas, configurações e metadados em banco relacional. Usar chaves e vínculos consistentes; manter bytes dos arquivos no armazenamento de objetos do item 5, não confundir metadados com arquivo.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — banco relacional e convenções de persistência já usados no CeleriFlow.

**Demonstração:** Criar uma página e um vínculo de menu, encerrar a sessão e consultar por outra sessão. Confirmar o registro persistido pelo serviço real e recuperar a informação na área pública.

**Aceite técnico:** Dados não dependem de arrays fixos, memória do navegador ou arquivos JSON servidos como única base. Conteúdo público recupera a versão persistida autorizada.

**Atenção / limite:** Não criar outro banco/ERP sem necessidade nem considerar armazenamento relacional de URL prova de que os bytes estão em nuvem.

<a id="por-005"></a>
#### POR-005 — Arquivos em armazenamento de objetos em nuvem

**TR — PORTAL INSTITUCIONAL, item 5, p. 310:**

> Todos os arquivos devem ser guardados utilizando serviço de armazenamento de objetos em nuvem garantindo escalabilidade, disponibilidade de dados, segurança e performance;

**Implementação:** Armazenar arquivos enviados ao repositório e mídias produzidas pelo Portal no serviço de objetos em nuvem identificado. Gravar chave estável, metadados e vínculo no banco; validar envio antes de concluir. Aplicar privacidade nas leituras e gerir falhas sem registrar upload inexistente.

**Dados de outro módulo / serviço compartilhado:** DEP-03 — armazenamento de objetos em nuvem; DEP-04 quando GED/repositório já compartilhar metadados.

**Demonstração:** Enviar imagem, áudio e documento de F-REP. Abrir em nova sessão e confirmar os objetos no serviço configurado. Tentar acessar o arquivo privado anonimamente e provocar uma falha de envio em homologação.

**Aceite técnico:** Bytes existem no armazenamento de objetos e continuam recuperáveis; falha aparece como falha e arquivo privado não é exposto. Registrar provedor/ambiente e evidência sem segredos.

**Atenção / limite:** Um emulador local exercita o adaptador, mas não comprova este requisito de nuvem. Não contratar provedor, inventar SLA ou prometer escalabilidade/performance sem ambiente e medição.

<a id="por-006"></a>
#### POR-006 — Conteúdo textual em português do Brasil

**TR — PORTAL INSTITUCIONAL, item 6, p. 310:**

> Deverá possuir conteúdo textual integralmente no idioma português do Brasil;

**Implementação:** Manter textos da interface pública e privada, botões, estados, validações, ajuda e modelos iniciais em português do Brasil. Marcar o idioma do documento web; configurar os componentes para não exibir mensagens-padrão em outro idioma.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Abrir menus, editor, calendário, questionário, confirmação de inscrição e erros de upload/salvamento. Conferir datas, mensagens e textos de exemplo em português.

**Aceite técnico:** Os textos entregues pela solução estão em português do Brasil, inclusive estados vazios/erro. Conteúdo editorial de teste segue o mesmo idioma.

**Atenção / limite:** Não criar tradutor automático ou portal multilíngue. Conteúdo real é fornecido/revisado pela equipe editorial; nomes próprios e siglas permanecem identificados.

<a id="por-007"></a>
#### POR-007 — Conjunto de recursos de acessibilidade

**TR — PORTAL INSTITUCIONAL, item 7, p. 310:**

> Dispor de recursos específicos para assegurar a acessibilidade de pessoas com deficiência, tais como:

**Implementação:** Tratar este número como introdução do conjunto detalhado nos itens 8–14, mantendo o ID e uma verificação agregada. Reutilizar os mesmos recursos de semântica, alternativas de mídia, links significativos e atalhos.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Executar F-ACE e os aceites POR-008 a POR-014 na mesma página pública; abrir também uma tela privada para verificar os componentes comuns.

**Aceite técnico:** Existe evidência do conjunto de recursos, sem um botão genérico de acessibilidade sendo usado como substituto das funcionalidades.

**Atenção / limite:** É entrada numerada introdutória do TR, não motivo para criar um widget ou módulo de acessibilidade separado.

<a id="por-008"></a>
#### POR-008 — HTML lógico e semântico

**TR — PORTAL INSTITUCIONAL, item 8, p. 310:**

> Organizar o código HTML de forma lógica e semântica;

**Implementação:** Estruturar cabeçalho, navegação, conteúdo principal e rodapé com elementos semanticamente adequados. Organizar títulos e ordem de leitura de acordo com o conteúdo; usar controle de ação para ação e link para navegação.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Inspecionar a página P-01 e a notícia N-01; percorrer a ordem de foco e a estrutura de títulos/regiões com a ferramenta assistiva de teste.

**Aceite técnico:** A ordem de leitura é coerente e os marcos do menu/conteúdo/rodapé são identificáveis; o DOM não é apenas uma composição de elementos sem significado.

**Atenção / limite:** Reutiliza POR-012; não é necessário criar duas soluções semânticas nem um produto de busca/SEO.

<a id="por-009"></a>
#### POR-009 — Texto alternativo das imagens

**TR — PORTAL INSTITUCIONAL, item 9, p. 310:**

> Imagens devem utilizar o atributo “alt” para descrever o significado do elemento visual;

**Implementação:** Permitir registrar e renderizar descrição alternativa das imagens informativas do conteúdo, capas e opções com imagem. Mapear nome/descrição ao texto alternativo apenas quando descrever o significado; o editor deve poder fornecer o texto apropriado. Elementos puramente decorativos não devem repetir ruído na leitura.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — mídia/repositório compartilhado quando existente; informação alternativa no contexto de uso.

**Demonstração:** Usar a mesma imagem no repositório e numa página, notícia e alternativa de questionário. Conferir o atributo alt e a leitura sem visualizar a imagem; corrigir uma descrição e reabrir.

**Aceite técnico:** Imagens com informação têm alternativa significativa persistida e entregue no HTML. Nome de arquivo aleatório ou atributo ausente não é aceito como descrição.

**Atenção / limite:** Não exigir geração de descrição por IA. Este campo é meio de cumprir o texto do item, não outro cadastro obrigatório de documentos.

<a id="por-010"></a>
#### POR-010 — Alternativas acessíveis para áudio e vídeo

**TR — PORTAL INSTITUCIONAL, item 10, p. 310:**

> Qualquer conteúdo multimídia nativo da solução deverá conter legendas ou transcrições para os áudios e descrições para os vídeos;

**Implementação:** Associar legenda ou transcrição ao áudio nativo e descrição ao vídeo nativo, mantendo essas alternativas junto ao recurso/publicação. Preparar os controles de reprodução e leitura sem depender somente do som ou da imagem. Permitir anexar/editar as alternativas no contexto de mídia.

**Dados de outro módulo / serviço compartilhado:** DEP-03/04 — armazenamento e repositório para mídia e alternativas.

**Demonstração:** Publicar um áudio com transcrição e um vídeo com descrição em F-GAL. Reproduzir/pausar e consultar as alternativas na página pública e após recarga.

**Aceite técnico:** Mídias de teste possuem alternativa correspondente e acessível. Texto não relacionado, link vazio ou nome do arquivo não satisfazem a descrição/transcrição.

**Atenção / limite:** Preservar a redação peculiar do TR: legendas ou transcrições para áudios e descrições para vídeos. Não impor transcrição automática, serviço de IA ou gerador de legendas como novo produto.

<a id="por-011"></a>
#### POR-011 — Hiperlinks com textos significativos

**TR — PORTAL INSTITUCIONAL, item 11, p. 310:**

> Hiperlinks devem utilizar textos significativos e evitar aplicações genéricas;

**Implementação:** Usar rótulos que identifiquem o destino em menus, acessos rápidos, documentos e conteúdo. Apresentar o título do recurso em vez de repetir “clique aqui”. Campos de link devem permitir texto descritivo e comportamento previsto no seu cadastro.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Publicar links “Agenda cultural DEMO” e “Documento institucional DEMO” e percorrê-los isoladamente por teclado/leitura assistiva.

**Aceite técnico:** O usuário identifica o destino pelo texto; o comportamento mesma aba/nova aba segue o cadastro aplicável e não exige adivinhação por ícone.

**Atenção / limite:** Validar esquemas de URL sem adicionar rastreamento comercial, encurtador ou coleta automática de sites.

<a id="por-012"></a>
#### POR-012 — Tags semânticas para leitores e buscadores

**TR — PORTAL INSTITUCIONAL, item 12, p. 310:**

> Empregar semanticamente as tags HTML, proporcionando melhor capacidade de leitura do código das páginas web por leitores de tela e/ou buscadores;

**Implementação:** Reutilizar a estrutura semântica do item 8 em todas as famílias de páginas. Nas saídas do editor, preservar parágrafos, listas, citações, títulos e tabelas de dados com marcação adequada, sem converter tudo em imagem.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Gerar P-EDITOR e N-EDITOR com listas, citação e tabela; inspecionar o HTML e navegar pelos elementos sem mouse.

**Aceite técnico:** O conteúdo efetivo permanece textual/semântico e legível pelas ferramentas testadas. A prévia e a publicação não têm estruturas divergentes que apaguem esses elementos.

**Atenção / limite:** Não acrescentar campanha de SEO, ranking ou serviço de indexação externa. Compartilhar evidência com POR-008 sem eliminar este ID.

<a id="por-013"></a>
#### POR-013 — Tabelas somente para dados

**TR — PORTAL INSTITUCIONAL, item 13, pp. 310–311:**

> Tabelas devem ser utilizadas apenas para tabulação de dados. Em hipótese alguma deverá ser empregada como alternativa para estruturação de páginas web;

**Implementação:** Construir o layout por componentes de página, não por tabelas de posicionamento. Reservar tabelas a dados tabulares do painel e do conteúdo; inserir cabeçalhos e identificação quando necessários para interpretar os dados.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Inspecionar o layout da home e a tabela de horários de P-EDITOR. Conferir que a tabela contém os dados, não a estrutura de cabeçalho/menu/rodapé.

**Aceite técnico:** Nenhuma tabela de layout sustenta as páginas; tabelas de dados continuam disponíveis, inclusive no editor exigido em 30/51.

**Atenção / limite:** Não remover o recurso de tabela do WYSIWYG sob justificativa de acessibilidade.

<a id="por-014"></a>
#### POR-014 — Atalhos, fonte, contraste e páginas de acessibilidade/mapa

**TR — PORTAL INSTITUCIONAL, item 14, p. 311:**

> Teclas de atalho para o menu, conteúdo, rodapé, aumentar e diminuir tamanho da fonte, ativar ou desativar contraste, página de acessibilidade e página de mapa do site;

**Implementação:** Disponibilizar atalhos documentados para menu, conteúdo, rodapé, aumentar/diminuir fonte, ativar/desativar contraste, página de acessibilidade e mapa do site. Mapear combinações testáveis sem disparar quando o usuário digita no editor/formulário. O mapa reflete as rotas públicas autorizadas e a página de acessibilidade explica os comandos.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Executar os oito destinos/ações de F-ACE, conferir foco ou navegação, aumentar e diminuir texto e ligar/desligar contraste. Repetir nos navegadores de teste e verificar que conteúdo privado não aparece no mapa.

**Aceite técnico:** Todos os comandos existem, são documentados e produzem efeito. Os dois ajustes de fonte e o contraste são reversíveis; atalhos não impedem preencher campos.

**Atenção / limite:** Q-P04: o TR não fornece as combinações de teclas. Implementá-las e documentar limitações reais por navegador, sem afirmar que um único conjunto funciona universalmente.

<a id="por-015"></a>
#### POR-015 — Ordenação editorial por clicar, arrastar e soltar

**TR — PORTAL INSTITUCIONAL, item 15, p. 311:**

> Todas as ordenações devem ser realizadas com as ações de clicar, arrastar e soltar;

**Implementação:** Usar mecanismo compartilhado de reordenação persistida nas coleções ordenáveis do Portal: menu, alternativas/questões, acessos, redes, links, telefones e hierarquias pertinentes. Confirmar a posição no servidor e recuperar a ordem na leitura pública quando aplicável. Manter alternativa acessível por teclado como complemento.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Executar F-ORD em uma lista plana e numa árvore. Arrastar A/C/B para A/B/C, salvar, recarregar e conferir em outra sessão; testar uma atualização concorrente.

**Aceite técnico:** Arrastar e soltar realmente altera a ordem persistida; não é só animação local ou ordenação parcial de dez linhas. A alternativa de teclado não substitui o recurso expressamente pedido.

**Atenção / limite:** Distinguir reordenação editorial de filtro/ordenação de consulta. Registrar Q-P09 quanto ao alcance de “todas as ordenações”, sem estreitar silenciosamente o requisito.

<a id="por-016"></a>
#### POR-016 — Parametrização e adaptação do portal

**TR — PORTAL INSTITUCIONAL, item 16, p. 311:**

> Os módulos do portal institucional devem permitir a sua adaptação de acordo com as necessidades da contratante, através de parametrizações e customizações, desde que não comprometa a integridade do sistema;

**Implementação:** Expor as configurações de componentes e cadastros previstas nos itens posteriores. Reutilizar tokens de identidade/leiaute disponíveis e aplicar alterações válidas sem corromper vínculos. Customizações de código indispensáveis ficam limitadas ao Portal e documentadas.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Mudar quantidade do acesso rápido, modo de agenda e limites de notícias pelas telas; reabrir configurações e verificar os efeitos públicos.

**Aceite técnico:** Configurações persistem e alteram os componentes corretos sem intervenção no banco. Valor inválido é recusado em vez de quebrar a página.

**Atenção / limite:** Não transformar “parametrizações e customizações” em construtor genérico de sites/ERP. Quantidades e opções vêm dos itens específicos.

<a id="por-017"></a>
#### POR-017 — Sincronização entre gerenciador, banco e portal

**TR — PORTAL INSTITUCIONAL, item 17, p. 311:**

> Todas as informações cadastradas através do módulo gerenciador de conteúdo devem estar coerentes e sincronizadas com a base de dados;

**Implementação:** Usar uma fonte persistida para consulta, edição e publicação. Invalidar/atualizar as camadas de cache pertinentes após salvar, desativar, excluir ou mover; não manter conteúdo hardcoded divergente da base.

**Dados de outro módulo / serviço compartilhado:** DEP-02/03 e camada de publicação/cache existente.

**Demonstração:** Editar P-01 e N-01, desativar P-02 e renomear um arquivo. Em janela anônima, atualizar as URLs e conferir os mesmos dados/situações; simular falha na gravação.

**Aceite técnico:** Operação concluída é refletida conforme o mecanismo documentado; falha não gera mensagem de sucesso ou publicação fictícia. Conteúdo inativo não permanece acessível por cache da aplicação.

**Atenção / limite:** Não prometer apagar cópias já baixadas pelo visitante. Para links privados/revogação de acesso, seguir a proteção da seção 4 e não depender de URL pública permanente.

<a id="por-018"></a>
#### POR-018 — Operações de manutenção dos registros do CMS

**TR — PORTAL INSTITUCIONAL, item 18, p. 311:**

> Todos os registros cadastrados pelo módulo gerenciador de conteúdo devem permitir, além da sua inserção, a visualização, configuração (quando houver), alteração e exclusão;

**Implementação:** Em cada família do gerenciador, implementar inclusão, visualização, configuração quando aplicável, alteração e exclusão pelos serviços reais. Respeitar as regras específicas de dependentes, confirmação e repositório; tratar exclusão lógica quando necessária para referências sem deixar o registro ativo/publicado.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Executar criar→consultar→alterar→excluir em registros descartáveis de cada família da matriz de telas. Testar menu com filhos e arquivo reutilizado antes de excluir.

**Aceite técnico:** As ações previstas não são botões sem efeito e não faltam por a tela ser apenas de listagem. Exclusão remove o registro do uso ativo e público conforme sua natureza, preservando integridade e o tratamento específico da fonte.

**Atenção / limite:** Não substituir todas as exclusões por “inativar”. Referências podem exigir desvinculação/reassociação antes da exclusão; não criar cascade destrutivo ou aprovação extra por suposição.

<a id="por-019"></a>
#### POR-019 — Atualização dinâmica pelo usuário responsável

**TR — PORTAL INSTITUCIONAL, item 19, p. 311:**

> O portal institucional deverá dinâmico e todas as informações poderão ser atualizadas a qualquer momento pelo usuário responsável através do módulo gerenciador de conteúdo;

**Implementação:** Permitir ao editor autorizado atualizar conteúdo e configurações pelo gerenciador sem editar código ou fazer nova implantação do site. Reutilizar o fluxo público/privado e aplicar os efeitos no conteúdo em uso.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** O usuário altera título, texto e imagem de uma página e cria uma notícia; consultar anonimamente após salvar sem executar build/deploy manual.

**Aceite técnico:** A atualização editorial é operacional e dinâmica; não exige solicitar ao desenvolvedor alteração em arquivo estático. Os estados restritos continuam protegidos.

**Atenção / limite:** Revisão antes da publicação é expressa para questionários/enquetes; não impor uma comissão editorial para todo conteúdo.

### Menus

<a id="por-020"></a>
#### POR-020 — Manutenção de menus e itens de menu

**TR — PORTAL INSTITUCIONAL, item 20, p. 311:**

> Possuir função para criar, alterar, consultar e excluir menus e itens de menu;

**Implementação:** Gerenciar menus/itens no CMS, com relações pai-filho e ações criar, consultar, editar e excluir. Reutilizar o mesmo cadastro nas criações originadas de páginas, agendas e repositórios.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar M-INST com filhos M-PAG e M-AGENDA; consultar a árvore, editar o rótulo e excluir um item folha descartável com confirmação.

**Aceite técnico:** A estrutura persiste e controla a navegação pública, sem cadastro paralelo de menus para cada origem.

**Atenção / limite:** Menu do site é diferente do menu principal do ERP. Não reestruturar os módulos administrativos por este item.

<a id="por-021"></a>
#### POR-021 — Campos completos na criação do item de menu

**TR — PORTAL INSTITUCIONAL, item 21, p. 311:**

> O cadastro de um item de menu deve permitir informar: nome, link (url) o qual o será direcionado ao clicar, capa (se necessário, de acordo com o leiaute), ícone (se necessário, de acordo com o leiaute), descrição, comportamento ao ser clicado (abrir na mesma página ou em nova aba), situação ativo ou inativo (exibindo ou não no menu conforme a situação) e posicionamento na árvore de menu;

**Implementação:** Oferecer nome, URL de destino, capa e ícone quando o leiaute usar, descrição, abertura na mesma página ou nova aba, situação ativo/inativo e posição na árvore. Selecionar a mídia pelo repositório quando pertinente.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — recurso de imagem/ícone compartilhado; destino pode ser DEP-07, sem implementar o serviço vinculado.

**Demonstração:** Criar dois itens com comportamentos distintos; um recebe capa/ícone no leiaute que os utiliza. Abrir no público, inativar um e conferir a ausência.

**Aceite técnico:** Todos os dados descritos são informáveis e seus efeitos observáveis; posição é vínculo hierárquico, não apenas número visual.

**Atenção / limite:** Capa/ícone são condicionais à fonte. Não impor upload obrigatório quando o leiaute não utiliza esses recursos.

<a id="por-022"></a>
#### POR-022 — Edição completa do item de menu

**TR — PORTAL INSTITUCIONAL, item 22, pp. 311–312:**

> A edição de um item de menu deve permitir editar: nome, link (url) o qual o usuário será direcionado ao clicar, capa (se necessário, de acordo com o leiaute), ícone (se necessário, de acordo com o leiaute), descrição, comportamento ao ser clicado (abrir na mesma página ou em nova aba), situação ativo ou inativo (exibindo ou não no menu conforme a situação) e posicionamento na árvore de menu;

**Implementação:** Permitir alterar os mesmos atributos de 21, inclusive destino, comportamento, situação e posição. Validar ciclos antes de trocar o pai; atualizar a navegação pública e a referência ao destino conforme o tipo de vínculo.

**Dados de outro módulo / serviço compartilhado:** DEP-04 para mídia; DEP-07 quando linkar outro módulo.

**Demonstração:** Editar M-PAG: alterar nome, descrição, link, capa/ícone aplicáveis, comportamento e pai. Reabrir e executar o link público. Repetir com ativo/inativo.

**Aceite técnico:** As mudanças persistem em todos os atributos e não ficam limitadas ao nome. Uma posição inválida não é salva.

**Atenção / limite:** Não permitir que mover um item para seu próprio descendente crie ciclo. Não mudar o documento de destino ao editar só o menu.

<a id="por-023"></a>
#### POR-023 — Árvore completa de menus com indentação

**TR — PORTAL INSTITUCIONAL, item 23, p. 312:**

> A listagem de menu deve mostrar toda a estrutura de menu de forma hierárquica, ou seja, com a indentação da estrutura de menu;

**Implementação:** Apresentar toda a estrutura com indentação e indicadores de expansão. Usar árvore hierárquica com acesso a todos os nós, em vez de tabela plana que perde o pai na paginação. Recolher ramos e oferecer região de navegação própria quando necessário.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar três níveis com ramos irmãos, abrir/recolher cada ramo e localizar um filho profundo. Recarregar e comparar pai e nível registrados.

**Aceite técnico:** Todos os itens são alcançáveis, com hierarquia visível; a preferência por tela compacta não omite níveis ou pais.

**Atenção / limite:** Árvore extensa é exceção controlada à regra de listagem sem rolagem; não quebrá-la em páginas de linhas sem contexto.

<a id="por-024"></a>
#### POR-024 — Ações da listagem de menus

**TR — PORTAL INSTITUCIONAL, item 24, p. 312:**

> A partir da listagem de menu deverá ser possível as seguintes ações: editar, ordenar, ativar ou desativar menu e excluir.

**Implementação:** Na própria lista/árvore, disponibilizar editar, ordenar, ativar/desativar e excluir quando permitido. Ações usam os serviços do cadastro, com retorno contextual e atualização do ramo afetado.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Executar cada ação em um item folha a partir da listagem, sem abrir uma ferramenta independente. Testar a ausência de exclusão em pai com filhos.

**Aceite técnico:** As cinco ações previstas são encontráveis e produzem os efeitos corretos; o estado do item concorda com a área pública.

**Atenção / limite:** Reutilizar funções dos itens 20–27; não criar endpoints com regras diferentes só para o atalho da listagem.

<a id="por-025"></a>
#### POR-025 — Confirmação antes de excluir menu

**TR — PORTAL INSTITUCIONAL, item 25, p. 312:**

> A exclusão de um item de menu deverá ser realizada com a confirmação do usuário;

**Implementação:** Solicitar confirmação explícita identificando o item de menu. Cancelar não altera banco ou publicação; confirmar chama a exclusão autorizada depois de revalidar dependências.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Pedir exclusão de M-FOLHA, cancelar e verificar sua presença. Repetir confirmando; verificar ausência após recarga e na navegação pública.

**Aceite técnico:** Não há exclusão antes da confirmação. Retentativa não apaga outro item nem gera sucesso se a operação foi recusada.

**Atenção / limite:** Uma confirmação clara basta; não criar cadeia de aprovações.

<a id="por-026"></a>
#### POR-026 — Ocultar exclusão de menu com dependentes

**TR — PORTAL INSTITUCIONAL, item 26, p. 312:**

> A opção de excluir um item de menu não deve ser exibida na hipótese de o menu ter outros menus associados como dependentes;

**Implementação:** Não exibir a opção de exclusão para item que tenha menus dependentes. No servidor, recusar igualmente uma chamada direta de exclusão enquanto existirem filhos, inclusive os inativos.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Em M-INST com dois filhos, conferir que Excluir não aparece; tentar API diretamente. Mover/excluir os filhos em teste e conferir a disponibilidade da ação para a folha.

**Aceite técnico:** A opção fica oculta, não apenas desabilitada. A restrição não pode ser contornada pela API ou por filho criado simultaneamente.

**Atenção / limite:** Regra explícita para menus; não excluir automaticamente a subárvore.

<a id="por-027"></a>
#### POR-027 — Arrastar e soltar itens de menu

**TR — PORTAL INSTITUCIONAL, item 27, p. 312:**

> Possuir função para ordenar itens de menu com as ações de clicar, arrastar e soltar;

**Implementação:** Permitir reordenação por arraste dos itens respeitando a hierarquia e o contexto de pai. Persistir a ordem estável; se houver troca de nível, validar o destino e manter os filhos vinculados.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Arrastar dois irmãos de M-INST, salvar e reabrir o site. Fazer um teste permitido de mudança de pai e um proibido para descendente.

**Aceite técnico:** Árvore do CMS e menu público mostram a ordem salva. Movimento inválido mantém a estrutura anterior sem corromper nós.

**Atenção / limite:** Setas de subir/descer servem como acessibilidade, não como única implementação do arraste.

### Páginas Dinâmicas

<a id="por-028"></a>
#### POR-028 — Manutenção de páginas dinâmicas

**TR — PORTAL INSTITUCIONAL, item 28, p. 312:**

> Possuir função para criar, alterar, consultar e excluir páginas dinâmicas;

**Implementação:** Criar, consultar, editar e excluir páginas no gerenciador usando o conteúdo persistido e o editor compartilhado. Disponibilizar a rota pública apenas quando a página estiver ativa.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar P-01 com texto de demonstração, publicar ativa, editar conteúdo e excluir P-DESCARTAVEL com confirmação; consultar as URLs correspondentes.

**Aceite técnico:** Página é gerenciada sem código e a operação afeta a área pública, não apenas o formulário interno.

**Atenção / limite:** Esta página editorial não reimplementa consultas da Transparência ou serviços tributários. Criar links para seus pontos de entrada; as funções próprias da Transparência são desenvolvidas neste mesmo pacote, na seção 12.

<a id="por-029"></a>
#### POR-029 — Título, situação e conteúdo da página

**TR — PORTAL INSTITUCIONAL, item 29, p. 312:**

> O cadastro de uma página dinâmica deve permitir informar: título da página, situação ativo ou inativo (exibindo ou não a página conforme a situação) e conteúdo.

**Implementação:** Informar título, ativo/inativo e conteúdo. Persistir os três atributos e aplicar a situação à consulta pública; usar a URL automática do item 31.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar P-01 ativa e P-02 inativa com conteúdos distintos. Consultar no CMS e abrir seus endereços sem sessão.

**Aceite técnico:** P-01 é pública; P-02 não entrega o conteúdo no acesso anônimo. Os campos continuam disponíveis para edição autorizada.

**Atenção / limite:** Não exigir campos de SEO, data agendada, tags ou aprovações não citados para permitir salvar a página.

<a id="por-030"></a>
#### POR-030 — Editor WYSIWYG completo para páginas

**TR — PORTAL INSTITUCIONAL, item 30, p. 312:**

> O campo de conteúdo deve ser do tipo editor de texto WYSIWYG (What You See Is What You Get) e permitir criar conteúdo sem o conhecimento prévio de HTML e CSS (HyperText Markup Language e Cascade Style Sheet). Deverá disponibilizar, minimamente, os seguintes recursos: negrito, itálico, sublinhado, riscado, família de fontes, tamanho da fonte, cor de fundo da fonte, cor da fonte, marcar texto, remover formatação do texto, aumentar e diminuir indentação, alinhamento à esquerda, direita, centralizado e justificado, lista ordenada e não ordenada, criação de link, bloco de citação, tabela, inserir imagem do repositório de arquivos e visualização do código fonte do conteúdo;

**Implementação:** Reutilizar/configurar o editor visual com todos os recursos enumerados no checklist F-EDITOR. Oferecer visualização do código-fonte do conteúdo e seletor de imagem do repositório. Persistir formatação autorizada e limpar conteúdo executável sem destruir os recursos legítimos.

**Dados de outro módulo / serviço compartilhado:** DEP-05 — editor/núcleo documental se existente; DEP-04 para inserção de mídia.

**Demonstração:** Em P-EDITOR, executar individualmente os 23 recursos de F-EDITOR, salvar, reabrir e comparar editor, prévia e página pública. Testar colagem de código ativo em ambiente isolado: não executar.

**Aceite técnico:** Todos os controles listados na fonte funcionam, inclusive famílias/tamanhos, cores, limpar formatação, quatro alinhamentos, tabela, imagem do repositório e código-fonte. Texto simples ou Markdown isolado não substitui o WYSIWYG.

**Atenção / limite:** Visualização do código-fonte não obriga permitir edição arbitrária de scripts. A fonte padrão do ERP não autoriza retirar os seletores de fonte/cor expressamente pedidos.

<a id="por-031"></a>
#### POR-031 — URL automática da página

**TR — PORTAL INSTITUCIONAL, item 31, p. 312:**

> Ao criar a página dinâmica, deverá ser criado um link (url) de forma automática para o acesso à página dinâmica;

**Implementação:** Gerar URL estável e única dentro do portal ao cadastrar a página, sem pedir digitação do endereço. Manter identificador estável; colisões de títulos recebem resolução determinística. Renomear o título não deve quebrar referências já emitidas.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar duas páginas de teste com o mesmo título; conferir URLs distintas. Editar o título de uma e abrir o link previamente copiado.

**Aceite técnico:** Cada página tem acesso gerado automaticamente; o link resolve para o registro correto e respeita ativo/inativo.

**Atenção / limite:** Rota e domínio reais serão mapeados no repositório. Não inventar domínio de produção ou serviço de encurtamento.

<a id="por-032"></a>
#### POR-032 — Criar menu a partir de uma página

**TR — PORTAL INSTITUCIONAL, item 32, pp. 312–313:**

> A listagem de páginas dinâmicas deverá permitir criar um item de menu a partir de uma página específica, desde que selecionada a sua posição na árvore de menu;

**Implementação:** Na listagem de páginas, oferecer Criar item de menu usando a página selecionada. Solicitar posição na árvore e herdar URL/referência, evitando redigitação e criação do destino errado.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Selecionar P-01, escolher M-INST como posição e confirmar. Abrir a árvore e o site; clicar no novo item e conferir P-01.

**Aceite técnico:** Item de menu persiste no local escolhido e aponta para a página selecionada; uma repetição técnica não cria cópias acidentais.

**Atenção / limite:** Não obrigar criar menu para toda página. URL automática e publicação existem independentemente do vínculo de menu.

<a id="por-033"></a>
#### POR-033 — Pré-visualização da página pela listagem

**TR — PORTAL INSTITUCIONAL, item 33, p. 313:**

> A listagem de páginas dinâmicas deverá permitir a pré-visualização do conteúdo de uma página específica;

**Implementação:** Expor Pré-visualizar na listagem, usando o mesmo renderer da publicação com o conteúdo salvo. A prévia de página inativa é privada e não deve gerar URL pública que contorne a situação.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Pré-visualizar P-01 e P-02 no CMS; verificar imagens e formatação. Abrir o link de prévia de P-02 sem sessão e recusar acesso.

**Aceite técnico:** Editor vê o conteúdo correto antes de expor ao público; a prévia não publica o registro nem vaza página inativa.

**Atenção / limite:** Não transformar prévia em um segundo site ou exigir implantação manual.

<a id="por-034"></a>
#### POR-034 — Confirmação para exclusão de página

**TR — PORTAL INSTITUCIONAL, item 34, p. 313:**

> A exclusão de uma página dinâmica deverá ser realizada a partir da confirmação do usuário;

**Implementação:** Solicitar confirmação identificando a página e tratar referências de menu existentes de forma consistente. Após excluir, retirar da consulta ativa e impedir acesso público; não apagar a mídia compartilhada da página.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Cancelar exclusão de P-DESCARTAVEL e confirmar que permanece. Confirmar depois e abrir a URL antiga; verificar que o recurso de imagem continua no repositório.

**Aceite técnico:** Confirmação é necessária e a página deixa de ser pública. Vínculos não apontam para conteúdo eliminado como se estivesse ativo.

**Atenção / limite:** Tratamento de referências é integridade técnica; não dispensar a função de exclusão nem apagar imagens reutilizadas.

<a id="por-035"></a>
#### POR-035 — Bloqueio público de página inativa

**TR — PORTAL INSTITUCIONAL, item 35, p. 313:**

> Uma página dinâmica inativa não deve ser acessada na área pública;

**Implementação:** Aplicar a condição ativa na rota e em qualquer endpoint/renderer público. Invalidar o conteúdo público em cache quando houver inativação; manter acesso administrativo de edição/prévia separado.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Acessar P-01 anonimamente, inativar e tentar novamente por URL direta, menu, prévia indevida e API pública.

**Aceite técnico:** Nenhum desses caminhos entrega o corpo da página inativa sem autorização. Ocultar somente o link do menu não atende.

**Atenção / limite:** Registrar a política de cache e testar a revogação efetiva; não afirmar retirada de cópias previamente baixadas por terceiros.

### Agendas

<a id="por-036"></a>
#### POR-036 — Configuração do componente de agenda

**TR — PORTAL INSTITUCIONAL, item 36, p. 313:**

> Possuir função para configurar o componente de agenda;

**Implementação:** Criar configuração persistida do componente público de agenda, reaproveitando o layout existente e os campos do item 37. Separar componente visual de cadastro da agenda e de seus eventos.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Abrir a configuração, selecionar A-PRINCIPAL e salvar; consultar o componente na página pública e reabrir o formulário.

**Aceite técnico:** O componente utiliza a agenda/configuração salva. Editar sua apresentação não cria outra agenda ou duplica eventos.

**Atenção / limite:** Não confundir agenda de eventos do portal com cronograma de processos ou agenda de usuários do ERP.

<a id="por-037"></a>
#### POR-037 — Limites, visão e situação do componente de agenda

**TR — PORTAL INSTITUCIONAL, item 37, p. 313:**

> Permitir configurar o limite de itens do carrossel, a quantidade de itens visíveis no carrossel, o número de ocorrências por página, selecionar a agenda que o componente deverá exibir, o tipo de visão (paginada ou calendário) e situação (ativo ou inativo);

**Implementação:** Expor separadamente limite total do carrossel, quantidade visível, ocorrências por página, agenda escolhida, visão paginada/calendário e ativo/inativo. Validar números e ajustar o layout ao viewport preservando a configuração e a acessibilidade.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Em F-AGENDA, usar limite 2, visíveis 1 e uma ocorrência por página. Alternar visão paginada/calendário, trocar A-PRINCIPAL por A-INSTITUCIONAL e desativar o componente.

**Aceite técnico:** Cada campo altera o efeito correspondente; calendário e lista usam o mesmo conjunto da agenda. Inativação esconde o componente sem apagar os eventos.

**Atenção / limite:** Não reduzir a escolha a uma lista estática. A situação do componente não deve ser confundida com exclusão da agenda ou evento.

<a id="por-038"></a>
#### POR-038 — Manutenção de agendas

**TR — PORTAL INSTITUCIONAL, item 38, p. 313:**

> Possuir função para criar, alterar, consultar e excluir agendas;

**Implementação:** Permitir criar, editar, consultar e excluir agendas com suas relações de categorias. A exclusão da agenda remove seus vínculos, não os eventos que ainda pertencem a categorias utilizadas em outra agenda.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar A-PRINCIPAL e A-INSTITUCIONAL, alterar categorias, reabrir e excluir uma agenda descartável. Conferir os eventos da outra.

**Aceite técnico:** Agendas são registros independentes; operações não duplicam nem apagam ocorrências compartilhadas indevidamente.

**Atenção / limite:** Não implementar convite de calendário externo, reserva de sala ou integração pessoal não solicitados.

<a id="por-039"></a>
#### POR-039 — Título e uma ou mais categorias por agenda

**TR — PORTAL INSTITUCIONAL, item 39, p. 313:**

> O cadastro de uma agenda deverá conter o título da agenda e a seleção de uma ou mais categorias;

**Implementação:** Manter título e seleção múltipla de categorias. Persistir a relação agenda↔categoria e recuperar o conjunto de eventos por essa associação, com deduplicação por ocorrência.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Vincular A-PRINCIPAL a Cultura/Esporte e A-INSTITUCIONAL a Administração/Cultura. Conferir E-01 Cultura nas duas agendas, mas uma única vez em cada.

**Aceite técnico:** Uma categoria pode servir às agendas apropriadas e cada agenda admite mais de uma categoria. O evento não precisa ser cadastrado novamente.

**Atenção / limite:** Não criar um campo agenda obrigatório diretamente na ocorrência para contornar a relação exigida em 48.

<a id="por-040"></a>
#### POR-040 — URL automática de agenda

**TR — PORTAL INSTITUCIONAL, item 40, p. 313:**

> Gerar link (url) de acesso à agenda no momento do cadastro, de forma automática e sem a intervenção do usuário, para o acesso público;

**Implementação:** Gerar link único e estável no cadastro da agenda e disponibilizá-lo para consulta pública de seus eventos. Usar a resolução de URLs do Portal.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar A-PRINCIPAL sem fornecer URL, abrir o link gerado anonimamente e alterar o título sem perder a referência.

**Aceite técnico:** O endereço existe automaticamente e consulta a agenda certa, sem exigir criação prévia de menu.

**Atenção / limite:** Não confundir URL pública com exposição da área de edição.

<a id="por-041"></a>
#### POR-041 — Criar menu a partir de agenda

**TR — PORTAL INSTITUCIONAL, item 41, p. 313:**

> A listagem de agendas deverá permitir criar um item de menu a partir de uma agenda específica, selecionando a sua posição na árvore de menu;

**Implementação:** Na listagem de agendas, oferecer criação de item de menu referenciando a agenda escolhida e a posição selecionada na árvore. Reutilizar o serviço de menus.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Selecionar A-INSTITUCIONAL, criar item dentro de M-AGENDA e clicar no menu público.

**Aceite técnico:** O destino é a agenda escolhida e a localização hierárquica persiste. Não há digitação repetida de URL.

**Atenção / limite:** Não criar mecanismo de menus exclusivo para agendas.

<a id="por-042"></a>
#### POR-042 — Criar ocorrência no contexto de agenda

**TR — PORTAL INSTITUCIONAL, item 42, p. 313:**

> A listagem de agendas deverá permitir criar uma ocorrência a partir de uma agenda específica, filtrando pelas categorias da agenda;

**Implementação:** Disponibilizar Nova ocorrência na listagem de agendas com seletor limitado às categorias da agenda de origem. Persistir a categoria escolhida, não uma atribuição direta à agenda.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Abrir a ação a partir de A-PRINCIPAL: permitir Cultura/Esporte e não Administração. Criar E-04 em Cultura e consultar também A-INSTITUCIONAL.

**Aceite técnico:** O filtro de categorias corresponde à agenda e o evento criado é recuperado por todas as relações válidas, sem duplicação.

**Atenção / limite:** Validar a categoria no servidor; trocar o ID manualmente não deve contornar o contexto do formulário.

<a id="por-043"></a>
#### POR-043 — Manutenção das categorias de agenda

**TR — PORTAL INSTITUCIONAL, item 43, p. 313:**

> Possuir função para criar, alterar, consultar e excluir categorias de agenda;

**Implementação:** Criar, consultar, editar e excluir categorias de agenda. Antes de excluir categoria em uso, mostrar dependências e permitir reassociação pelo fluxo existente; categoria sem vínculos pode ser excluída.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar Cultura, Esporte e Administração; editar um título; excluir categoria descartável e testar a referência em uso em cenário separado.

**Aceite técnico:** Títulos e relações persistem. Exclusão não deixa ocorrências sem categoria nem remove a mesma categoria de outra família por engano.

**Atenção / limite:** POR-054 menciona categoria de agenda dentro de Notícias; manter a ressalva Q-P01. Não fundir categorias de notícia e agenda automaticamente.

<a id="por-044"></a>
#### POR-044 — Título da categoria de agenda

**TR — PORTAL INSTITUCIONAL, item 44, p. 313:**

> O cadastro de uma categoria de agenda deverá conter o título da categoria;

**Implementação:** Permitir informar e alterar o título no cadastro de categoria de agenda. Exibir o título na seleção da agenda e da ocorrência a partir da mesma identidade.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar “Cultura DEMO”, selecionar em A-PRINCIPAL e E-01 e depois alterar o título descritivo; reabrir as seleções.

**Aceite técnico:** Título é persistido e selecionável; a alteração não rompe a relação existente.

**Atenção / limite:** Estado ativo/inativo aparece literalmente em POR-054 para categoria de agenda e é tratado ali, sem reescrever este item.

<a id="por-045"></a>
#### POR-045 — Manutenção das ocorrências de agenda

**TR — PORTAL INSTITUCIONAL, item 45, p. 313:**

> Possuir função para criar, alterar, consultar e excluir ocorrências;

**Implementação:** Criar, editar, consultar e excluir eventos mantendo categoria, período, local e mídia. Atualizar as agendas derivadas após a operação, usando a mesma ocorrência.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Cadastrar E-01, E-02 e E-03 de F-AGENDA; alterar local de E-01 e consultar as duas agendas. Excluir evento descartável e confirmar a saída das visões.

**Aceite técnico:** Operações refletem em lista, calendário e carrossel pertinentes, sem versões inconsistentes do mesmo evento.

**Atenção / limite:** Não criar inscrição em evento, venda de ingressos, presença ou reserva como condições deste requisito.

<a id="por-046"></a>
#### POR-046 — Campos completos da ocorrência

**TR — PORTAL INSTITUCIONAL, item 46, p. 313:**

> O cadastro de uma ocorrência (evento) deverá conter o título da ocorrência, a data e hora de início e de término, se houver, a descrição da ocorrência, o local, a capa (imagem) disponível no repositório de arquivos, cor e uma categoria;

**Implementação:** Guardar título, data/hora de início, data/hora de término quando houver, descrição, local, capa do repositório, cor e uma categoria. Validar término não anterior ao início quando preenchido; não exigir término em toda ocorrência.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — capa de imagem reutilizada do repositório; demais dados são do Portal.

**Demonstração:** Criar E-01 com término e E-02 sem término. Editar cor/capa/local e reabrir; conferir a apresentação pública e a categoria.

**Aceite técnico:** Todos os campos são utilizáveis. Evento sem término é aceito; valores de data/hora têm interpretação consistente no calendário e formulário.

**Atenção / limite:** Cor não é o único meio de identificar categoria/evento. Não impor geolocalização ou endereço normalizado de outro módulo.

<a id="por-047"></a>
#### POR-047 — Envio de ocorrência aos assinantes

**TR — PORTAL INSTITUCIONAL, item 47, p. 313:**

> O cadastro de uma ocorrência deverá permitir enviar para os assinantes do portal institucional (newsletter) informações mínimas sobre a ocorrência;

**Implementação:** Na criação da ocorrência, oferecer opção de enviar informações mínimas aos assinantes ativos, usando a configuração de novo conteúdo da newsletter e uma referência pública válida. Criar o evento de envio após a persistência.

**Dados de outro módulo / serviço compartilhado:** DEP-06 — serviço de envio/execução; base de assinantes é do Portal.

**Demonstração:** Criar E-NEWS com envio selecionado e conferir os nove destinatários ativos de F-NEWS, sua mensagem e acesso. Repetir o mesmo comando de gravação e conferir que não cria outro disparo lógico.

**Aceite técnico:** Conteúdo recebido identifica a ocorrência real e os inativos ficam fora. Falha de envio é visível e não é apresentada como recebimento confirmado.

**Atenção / limite:** Não é disparo obrigatório para todo evento: o TR pede permitir enviar. Não enviar a dados reais sem autorização nem converter cadastro geral de pessoas em lista de assinantes.

<a id="por-048"></a>
#### POR-048 — Ocorrência vinculada à categoria, não diretamente à agenda

**TR — PORTAL INSTITUCIONAL, item 48, p. 313:**

> A ocorrência não deve ser atribuída diretamente numa agenda, mas vinculada a uma categoria que esteja associada à agenda;

**Implementação:** Modelar ocorrência→categoria e agenda↔categorias como fonte da consulta. Não usar uma coluna de agenda no evento como relação exclusiva que impeça o compartilhamento previsto.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Conferir E-01 Cultura nas duas agendas. Mudar sua categoria para Esporte em teste: mantém presença em A-PRINCIPAL e sai de A-INSTITUCIONAL.

**Aceite técnico:** As agendas mudam automaticamente pela associação de categoria e não exigem editar/copiar o evento em cada uma.

**Atenção / limite:** O campo de contexto usado para abrir o formulário não pode substituir o vínculo real de categoria.

### Notícias

<a id="por-049"></a>
#### POR-049 — Manutenção de notícias

**TR — PORTAL INSTITUCIONAL, item 49, p. 314:**

> Possuir função para criar, alterar, consultar e excluir notícias;

**Implementação:** Implementar criação, consulta, alteração e exclusão de notícias com conteúdo real do editor, categorias e autoria. Atualizar os componentes públicos e relações sem apagar os arquivos reutilizados.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar N-01, consultar o texto público, editar título/corpo e excluir N-DESCARTAVEL; verificar capas ainda disponíveis no repositório.

**Aceite técnico:** Notícias são gerenciadas no CMS e as saídas refletem o registro salvo, não conteúdo fixo em código.

**Atenção / limite:** Não criar comentários, reações, analytics de leitura ou publicação em rede social como função extra.

<a id="por-050"></a>
#### POR-050 — Campos completos da notícia

**TR — PORTAL INSTITUCIONAL, item 50, p. 314:**

> O cadastro de uma notícia deverá conter o título e subtítulo da notícia, corpo da notícia, indicação se a notícia é um destaque, fonte, capa (imagem) disponível no repositório de arquivos, uma ou mais categorias e autor;

**Implementação:** Informar título, subtítulo, corpo, indicador de destaque, fonte, capa do repositório, uma ou mais categorias e autor. Reutilizar pessoa/usuário para autoria quando essa for a origem já adotada, sem exigir que todo autor seja operador do sistema.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — capa; DEP-01/07 somente se autoria vier de cadastro existente.

**Demonstração:** Cadastrar N-01 com duas categorias e indicação de destaque, fonte e autor DEMO. Reabrir e verificar as informações no componente/ficha pública pertinente.

**Aceite técnico:** Todos os campos existem e o vínculo de categorias é múltiplo. Destaque alimenta a regra do componente e não vira apenas texto no cadastro.

**Atenção / limite:** Não impor revisão ou agendamento obrigatório de notícia por analogia com questionários. Fonte editorial não é download automático de outro site.

<a id="por-051"></a>
#### POR-051 — Editor WYSIWYG completo para notícias

**TR — PORTAL INSTITUCIONAL, item 51, p. 314:**

> O campo de corpo da notícia deve ser do tipo editor de texto WYSIWYG (What You See Is What You Get) e permitir criar conteúdo sem o conhecimento prévio de HTML e CSS (HyperText Markup Language e Cascade Style Sheet). Deverá disponibilizar, minimamente, os seguintes recursos: negrito, itálico, sublinhado, riscado, família de fontes, tamanho da fonte, cor de fundo da fonte, cor da fonte, marcar texto, remover formatação do texto, aumentar e diminuir indentação, alinhamento à esquerda, direita, centralizado e justificado, lista ordenada e não ordenada, criação de link, bloco de citação, tabela, inserir imagem do repositório de arquivos e visualização do código fonte do conteúdo;

**Implementação:** Usar o mesmo editor validado em POR-030 com todos os 23 recursos do F-EDITOR, inclusive código-fonte e inserção de imagem do repositório. Conferir a configuração no campo corpo da notícia, não só a existência da biblioteca instalada.

**Dados de outro módulo / serviço compartilhado:** DEP-05 — editor; DEP-04 — mídia.

**Demonstração:** Executar o checklist completo em N-EDITOR e comparar com P-EDITOR. Salvar, reabrir e consultar publicamente a notícia, incluindo tabela, links e imagens.

**Aceite técnico:** Os recursos funcionam também em notícias; configuração reduzida do componente não omite controles pedidos. Saída segura conserva a formatação permitida.

**Atenção / limite:** Não aceitar só uma demonstração em páginas como prova se o editor de notícias tiver opções diferentes. Não desenvolver editor paralelo.

<a id="por-052"></a>
#### POR-052 — Envio de notícia aos assinantes

**TR — PORTAL INSTITUCIONAL, item 52, p. 314:**

> O cadastro de uma notícia deverá permitir enviar para os assinantes do portal institucional (newsletter) informações mínimas sobre a notícia;

**Implementação:** Oferecer no cadastro da notícia envio aos assinantes ativos com título/resumo/link do conteúdo e mensagem customizável. Utilizar o mesmo despachante de 47/59, mantendo a origem da notícia.

**Dados de outro módulo / serviço compartilhado:** DEP-06 — e-mail e processamento; newsletter nativa do Portal.

**Demonstração:** Criar N-NEWS com envio selecionado; conferir conteúdo recebido nas caixas autorizadas e exclusão dos três assinantes cancelados do cenário.

**Aceite técnico:** Mensagem deriva da notícia salva; edição sem novo comando de envio não dispara repetição indevida. O vínculo permite abrir a notícia correta.

**Atenção / limite:** Não exigir integração com rede social para enviar a newsletter. Captura local de e-mail é teste técnico rotulado, não entrega externa.

<a id="por-053"></a>
#### POR-053 — Manutenção das categorias de notícia

**TR — PORTAL INSTITUCIONAL, item 53, p. 314:**

> Possuir função para criar, alterar, consultar e excluir categorias de notícia;

**Implementação:** Manter categorias de notícia próprias, relacionadas de forma múltipla às notícias. Permitir criar, consultar, editar e excluir, tratando referências existentes antes de remover.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar categorias Institucional DEMO e Serviços DEMO, relacioná-las a N-01 e excluir categoria vazia de teste. Editar título sem perder as notícias.

**Aceite técnico:** O cadastro tem operações reais e as relações ficam consistentes; categoria de agenda não é reutilizada como notícia sem modelagem explícita.

**Atenção / limite:** Q-P01: a redação do item 54 diverge do subtítulo. Implementar 53 como notícia e preservar a exigência literal de agenda em 54.

<a id="por-054"></a>
#### POR-054 — Categoria de agenda: título e situação — redação divergente

**TR — PORTAL INSTITUCIONAL, item 54, p. 314:**

> O cadastro de uma categoria de agenda deverá conter o título da categoria e situação (ativo ou inativo);

**Implementação:** Preservar o texto literal: o item menciona categoria de agenda embora esteja em Notícias. Garantir título e ativo/inativo na categoria de agenda existente. No cadastro de notícia, usar o suporte comum de situação quando aplicável aos itens 18/53, sem fingir que o TR escreveu outra coisa.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Na categoria de agenda, cadastrar título e situação, reabrir e alterar ativo/inativo. Registrar também como a categoria de notícia é mantida e qual interpretação foi adotada para o contexto.

**Aceite técnico:** Campos literais de agenda são demonstráveis. A correspondência esperada sob Notícias continua identificada como pendência de esclarecimento; não substituir o requisito sem registro.

**Atenção / limite:** Q-P01. Não fundir famílias de categorias ou criar cadastro adicional apenas por causa da inconsistência textual.

<a id="por-055"></a>
#### POR-055 — Configuração do componente de notícias

**TR — PORTAL INSTITUCIONAL, item 55, p. 314:**

> Possuir função para configurar o componente de notícia;

**Implementação:** Expor a configuração do componente público de notícias usando os campos do item 56. Distinguir alteração de apresentação de edição das notícias e categorias.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Alterar a configuração pública sobre as sete notícias de F-NOT, salvar e conferir o componente e a reabertura do formulário.

**Aceite técnico:** A configuração afeta o componente real e não exige mudança de código nem criação de novas notícias.

**Atenção / limite:** Não construir dashboard de jornalismo, SEO ou calendário editorial por este item.

<a id="por-056"></a>
#### POR-056 — Limites de notícias, destaques e carrossel

**TR — PORTAL INSTITUCIONAL, item 56, p. 314:**

> Permitir configurar o limite de itens de notícias, o limite de destaques, o limite de notícias no quadro rotativo (carrossel) e a exibição ou não do quadro rotativo;

**Implementação:** Manter limite de notícias, limite de destaques, limite de notícias no carrossel e indicador de exibição do carrossel. Usar uma ordem estável identificada e não eliminar do cadastro os conteúdos além do limite.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Em F-NOT com sete notícias e três destaques, definir limite 5, destaques 2, carrossel 3; conferir cada componente. Desligar carrossel e verificar que as notícias permanecem disponíveis.

**Aceite técnico:** Os três limites e a chave de exibição funcionam independentemente. A mesma notícia não se duplica dentro de um componente por ter duas categorias.

**Atenção / limite:** A fonte não fixa critério de recência, autoplay ou intervalos de rotação. Documentar a ordem adotada e manter navegação acessível, sem acrescentar ranking de popularidade.

### Galerias

<a id="por-057"></a>
#### POR-057 — Manutenção de galerias

**TR — PORTAL INSTITUCIONAL, item 57, p. 314:**

> Possuir função para criar, alterar, consultar e excluir galerias;

**Implementação:** Criar, consultar, editar e excluir galerias com os tipos foto, vídeo e áudio. Galeria e item são vínculos de apresentação; os bytes permanecem no repositório comum.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar G-FOTO, G-VIDEO e G-AUDIO, editar suas descrições e excluir galeria descartável; conferir que os arquivos continuam no repositório.

**Aceite técnico:** Os três tipos são administráveis e recuperáveis; exclusão da galeria não elimina o recurso reutilizado.

**Atenção / limite:** Não criar outro armazenamento exclusivo para galerias.

<a id="por-058"></a>
#### POR-058 — Título, descrição, tipo, capa e situação da galeria

**TR — PORTAL INSTITUCIONAL, item 58, p. 314:**

> O cadastro de uma galeria deverá conter o título da galeria, descrição, indicação do tipo da galeria (foto, vídeo ou áudio), a capa (imagem) do repositório e a situação (ativa ou inativa);

**Implementação:** Informar título, descrição, tipo foto/vídeo/áudio, capa selecionada no repositório e situação ativa/inativa. Na edição, validar compatibilidade de itens existentes com mudança de tipo, sem conversão fictícia de arquivo.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — capa e mídias; DEP-03 — bytes em nuvem.

**Demonstração:** Preencher os campos nas três galerias de F-GAL, abrir cada uma e inativar G-FOTO em cenário separado.

**Aceite técnico:** Galerias exibem tipo e dados salvos; inativa não é apresentada publicamente como ativa. A capa é um recurso referenciado, não upload duplicado.

**Atenção / limite:** O item usa “capa ... do repositório”; preservar esse vínculo. Não confundir descrição da galeria com alternativa acessível de cada vídeo/áudio.

<a id="por-059"></a>
#### POR-059 — Envio de galeria aos assinantes no cadastro

**TR — PORTAL INSTITUCIONAL, item 59, p. 314:**

> Permitir enviar para os assinantes do portal institucional (newsletter) informações mínimas sobre a galeria no momento do cadastro;

**Implementação:** Permitir selecionar envio no cadastro da galeria, usando newsletter, dados mínimos da galeria e link automático. Só disparar após salvar e verificar que o conteúdo referenciado pode ser acessado pelo público destinatário.

**Dados de outro módulo / serviço compartilhado:** DEP-06 — envio; dados da newsletter e galeria são deste módulo.

**Demonstração:** Criar G-NEWS ativa com envio selecionado e conferir mensagem nas caixas controladas; tentar enviar galeria inativa e obter orientação sem disparo indevido.

**Aceite técnico:** Mensagem identifica a galeria recém-cadastrada e usa seu link válido. Público inativo da newsletter fica fora.

**Atenção / limite:** Não publicar automaticamente uma galeria privada/inativa só para enviar a mensagem.

<a id="por-060"></a>
#### POR-060 — URL automática da galeria

**TR — PORTAL INSTITUCIONAL, item 60, p. 315:**

> Gerar link de acesso da galeria no momento do cadastro, de forma automática e sem a intervenção do usuário, para o acesso público;

**Implementação:** Gerar URL de acesso público no cadastro, usando identidade estável e resolução de colisões. Aplicar situação e permissões das mídias na leitura.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar G-FOTO sem URL manual, abrir em aba anônima e renomear o título. Conferir que o link anterior continua ligado à mesma galeria.

**Aceite técnico:** A URL é automática e correta, sem dispensar controle ativo/inativo ou proteção dos recursos.

**Atenção / limite:** Uma URL de objeto isolado não substitui a página de galeria.

<a id="por-061"></a>
#### POR-061 — Manutenção dos itens da galeria

**TR — PORTAL INSTITUCIONAL, item 61, p. 315:**

> Possuir função para criar, alterar, consultar e excluir itens de galeria;

**Implementação:** Adicionar itens pela seleção do repositório e permitir consulta, alteração dos dados de apresentação e exclusão do vínculo. Validar tipo de mídia e autorização para uso público.

**Dados de outro módulo / serviço compartilhado:** DEP-04/03 — recursos/bytes compartilhados.

**Demonstração:** Adicionar três imagens a G-FOTO, um áudio e um vídeo às galerias respectivas. Editar um item e remover um vínculo; reabrir a galeria.

**Aceite técnico:** Itens têm operações completas e apontam para os arquivos corretos. Não se aceita vídeo fictício representado por imagem fixa.

**Atenção / limite:** Não permitir caminho alternativo de upload direto sem entrada no repositório; seguir 62.

<a id="por-062"></a>
#### POR-062 — Itens de galeria exclusivamente pelo repositório

**TR — PORTAL INSTITUCIONAL, item 62, p. 315:**

> Permitir cadastrar os itens de galeria apenas pelo repositório de arquivos, garantindo a reutilização do recurso (imagem, áudio ou vídeo) por outros módulos do sistema;

**Implementação:** O seletor de itens deve escolher recursos já registrados no repositório. Quando houver atalho de envio, ele primeiro executa o cadastro no repositório e depois referencia seu ID. Não aceitar URL arbitrária externa como substituto do arquivo cadastrado.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — repositório/arquivos e referências cruzadas.

**Demonstração:** Usar IMG-COMUM numa página e G-FOTO, confirmar o mesmo ID de recurso. Selecionar áudio/vídeo já cadastrados e verificar que não foram duplicados.

**Aceite técnico:** Reutilização ocorre por vínculo e todos os itens têm origem no repositório. O conteúdo não é copiado a uma base paralela de galerias.

**Atenção / limite:** Não impor integração com plataforma de vídeos ou rede social; isso não substitui o repositório exigido.

<a id="por-063"></a>
#### POR-063 — Nome e descrição do item de galeria

**TR — PORTAL INSTITUCIONAL, item 63, p. 315:**

> Permitir alterar o nome e descrição de um item de galeria;

**Implementação:** Editar nome e descrição da apresentação do item da galeria. Manter separação entre rótulo contextual e nome global do arquivo quando ele for reutilizado em outros conteúdos.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Alterar a descrição de IMG-COMUM em G-FOTO e reabrir. Conferir que a referência da página continua correta e que o arquivo não foi substituído.

**Aceite técnico:** Nome e descrição do item persistem e são recuperados na galeria, sem perda de identidade da mídia.

**Atenção / limite:** Não transformar edição de legenda em alteração destrutiva do arquivo ou das demais galerias.

<a id="por-064"></a>
#### POR-064 — Listagem completa dos itens de uma galeria

**TR — PORTAL INSTITUCIONAL, item 64, p. 315:**

> Permitir consultar a listagem de todos os itens de uma galeria específica;

**Implementação:** Listar todos os itens da galeria selecionada, com paginação real e identificação suficiente para abrir/editar cada um. O total não pode incluir itens de outra galeria.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Na base F-PAG, abrir galeria com 23 itens e percorrer páginas 10/10/3. Conferir primeiro, último e total; selecionar outra galeria.

**Aceite técnico:** Nenhum item é perdido pela paginação e a consulta permanece no escopo correto; acesso individual funciona.

**Atenção / limite:** Paginação não significa carregar somente as dez primeiras mídias e omitir o resto no público.

<a id="por-065"></a>
#### POR-065 — Excluir item sem excluir arquivo do repositório

**TR — PORTAL INSTITUCIONAL, item 65, p. 315:**

> Permitir excluir um item de galeria sem excluir o recurso (imagem, áudio ou vídeo) do repositório de arquivos;

**Implementação:** Remover apenas a associação do item à galeria. Preservar o registro e bytes do arquivo e todos os demais vínculos; a exclusão efetiva do arquivo só ocorre pela rotina própria.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — catálogo de arquivos e seus vínculos.

**Demonstração:** Remover IMG-COMUM de G-FOTO e conferir que P-01 e outra galeria continuam acessando o recurso e que ele aparece no repositório.

**Aceite técnico:** Só o vínculo escolhido desaparece. Não há exclusão em cascata do arquivo nem imagem quebrada nos outros usos.

**Atenção / limite:** Esse comportamento é expresso no TR; não usar a mesma função de exclusão física do item 130.

### Questionário

<a id="por-066"></a>
#### POR-066 — Manutenção de questionários

**TR — PORTAL INSTITUCIONAL, item 66, p. 315:**

> Possuir função para criar, alterar, consultar e excluir questionários;

**Implementação:** Criar, consultar, editar e excluir questionários no CMS, com identidade própria, perguntas e configuração. Usar o motor comum de pesquisas, preservando o tipo Questionário e a revisão anterior à publicação.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar Q-DEMO, salvar e consultar suas três questões; editar a descrição e excluir Q-DESCARTAVEL. Tentar publicar sem a revisão do item 79.

**Aceite técnico:** Questionário e questões persistem; exclusão e publicação respeitam o contexto. Não é uma imagem ou formulário estático não administrável.

**Atenção / limite:** Não acrescentar avaliação escolar, nota, certificação ou regras de amostragem. Política de respostas repetidas não é especificada; registrar Q-P05.

<a id="por-067"></a>
#### POR-067 — Título, descrição e janela do questionário

**TR — PORTAL INSTITUCIONAL, item 67, p. 315:**

> O cadastro de um questionário deverá conter o título do questionário, a descrição, a data e hora de publicação e de término;

**Implementação:** Informar título, descrição, data/hora de publicação e término. Interpretar a janela no servidor e validar término posterior ao início. Separar situação ativo/inativo da janela temporal e da revisão.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Configurar Q-DEMO de 18/09/2026 09h até 20/09/2026 18h. Testar antes, dentro e depois com relógio controlado de homologação.

**Aceite técnico:** Datas e horas persistem e a disponibilidade considera a janela real, não apenas o relógio do navegador. Não aceitar período invertido.

**Atenção / limite:** Não ativar automaticamente conteúdo ainda não revisado só porque chegou a data de publicação.

<a id="por-068"></a>
#### POR-068 — Configurações de acesso, resultados e encerramento do questionário

**TR — PORTAL INSTITUCIONAL, item 68, p. 315:**

> O cadastro de um questionário deverá ser configurável e conter a situação do questionário (ativo ou inativo), permitir ou não consulta ao resultado parcial, permitir ou não a consulta pública, permitir ou não a contagem de votos na área pública, indicação do tipo de gráfico (pizza ou barra) e mensagem customizada de encerramento;

**Implementação:** Manter controles independentes de situação, resultado parcial, consulta pública, contagem de votos pública, gráfico pizza/barra e mensagem de encerramento. Aplicar restrições também nas respostas públicas da API; não enviar ao cliente os números ocultos.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Em Q-DEMO com quatro respostas, alternar os seis controles, conferir resultado parcial durante a vigência e contagem separada. Após o término, exibir a mensagem configurada. Testar acesso anônimo e autorizado.

**Aceite técnico:** Cada opção afeta seu resultado e não apenas um rótulo. Gráfico é derivado das respostas; desabilitar contagem não deixa totais escondidos no payload público.

**Atenção / limite:** Q-P05: definir significado de consulta pública e o resultado final permitido. Este MD propõe aplicação conservadora sem divulgar respostas discursivas individuais por padrão; não declarar a ambiguidade formalmente resolvida.

<a id="por-069"></a>
#### POR-069 — Questões de única escolha, múltipla e discursiva

**TR — PORTAL INSTITUCIONAL, item 69, p. 315:**

> O cadastro de um questionário deverá permitir o cadastro de questões do tipo única escolha, múltipla escolha e discursiva;

**Implementação:** Permitir cadastrar os três tipos de questão num questionário, com controles de resposta compatíveis. Guardar tipo e IDs estáveis das questões/opções; validar resposta no servidor.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar Q1 única escolha, Q2 múltipla e Q3 discursiva em Q-DEMO. Responder os três e consultar o resultado por questão.

**Aceite técnico:** Os três tipos funcionam e são distintos: única aceita uma opção, múltipla aceita um conjunto e discursiva guarda texto. A edição de ordem não troca as respostas de opção.

**Atenção / limite:** Não implementar só uma votação de escolha única. Não criar tipos extras como upload, geolocalização ou pagamento sem fonte.

<a id="por-070"></a>
#### POR-070 — Campos e alternativas de única escolha no questionário

**TR — PORTAL INSTITUCIONAL, item 70, p. 315:**

> O cadastro de uma questão do tipo única escolha deve conter o enunciado da questão, a indicação se responder a questão é obrigatório e, ao menos, duas opções, com a possibilidade de adicionar novas, que devem conter a descrição da opção e uma imagem, se necessário, do repositório de arquivos;

**Implementação:** Guardar enunciado, indicador de resposta obrigatória e ao menos duas opções, cada uma com descrição e imagem opcional do repositório. Permitir adicionar opções e impedir publicação com menos que o mínimo.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — imagens das opções; restante é do Portal.

**Demonstração:** Em Q1, cadastrar A/B/C, inserir imagem numa opção e marcar obrigatório. Tentar envio sem resposta e com duas opções por API; depois enviar uma opção válida.

**Aceite técnico:** Mínimo de duas alternativas, imagem opcional e obrigatoriedade funcionam. Única escolha não aceita conjunto com mais de um ID.

**Atenção / limite:** Não tornar imagem obrigatória. Remoção durante cadastro deve preservar o mínimo exigido antes da publicação.

<a id="por-071"></a>
#### POR-071 — Ordenar opções de única escolha do questionário

**TR — PORTAL INSTITUCIONAL, item 71, p. 315:**

> Possuir função para ordenar as opções de única escolha;

**Implementação:** Permitir arrastar/soltar opções de Q1 e gravar sua posição mantendo o ID de cada alternativa. Reutilizar o controle de 15 e alternativa por teclado.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Trocar ordem A/B/C para C/A/B, salvar, reabrir e conferir os rótulos e IDs. Depois responder uma opção e verificar a correspondência.

**Aceite técnico:** Ordem visual e persistida coincidem; resultados não são associados ao índice da posição e não mudam de alternativa ao ordenar.

**Atenção / limite:** Não recriar opções com novos IDs só para mudar sua posição.

<a id="por-072"></a>
#### POR-072 — Campos e alternativas de múltipla escolha do questionário

**TR — PORTAL INSTITUCIONAL, item 72, p. 315:**

> O cadastro de uma questão do tipo múltipla escolha deve conter o enunciado da questão, a indicação se responder a questão é obrigatório e, ao menos, duas opções, com a possibilidade de adicionar novas, que devem conter a descrição da opção e uma imagem, se necessário, do repositório de arquivos;

**Implementação:** Guardar enunciado, obrigatório e no mínimo duas opções, com descrição e imagem opcional. A resposta aceita várias opções da mesma questão sem repetições e rejeita IDs de outra pesquisa.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — imagem das alternativas.

**Demonstração:** Configurar Q2 com X/Y e imagem opcional; enviar as respostas de F-PESQ, incluindo X+Y e uma tentativa com opção de outro questionário.

**Aceite técnico:** Múltipla seleção persiste como conjunto válido; mínimo e obrigatoriedade são aplicados. O total de marcações não é confundido com total de participantes.

**Atenção / limite:** Não criar limite arbitrário de uma alternativa, pois isso removeria o tipo múltiplo.

<a id="por-073"></a>
#### POR-073 — Ordenar opções de múltipla escolha do questionário

**TR — PORTAL INSTITUCIONAL, item 73, p. 315:**

> Possuir função para ordenar as opções de múltipla escolha;

**Implementação:** Reordenar alternativas de Q2 por clicar, arrastar e soltar, usando posição persistida e identidade estável. A ordem não deve alterar as seleções já vinculadas.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Arrastar Y antes de X, salvar e reabrir; conferir contagens de X=2/Y=3 no cenário com respostas preservadas, conforme a política de edição da versão.

**Aceite técnico:** A ordem muda e os valores não são transferidos para outra opção. Alteração permitida não apaga respostas.

**Atenção / limite:** Usar mesma implementação de 71, sem reduzir o teste de múltipla a uma opção.

<a id="por-074"></a>
#### POR-074 — Questão discursiva e obrigatoriedade no questionário

**TR — PORTAL INSTITUCIONAL, item 74, pp. 315–316:**

> O cadastro de uma questão do tipo discursiva deve conter o enunciado da questão e a indicação se responder a questão é obrigatório;

**Implementação:** Cadastrar enunciado e indicação de resposta obrigatória; disponibilizar área de texto e persistir a resposta relacionada à questão/versão. Renderizar texto como conteúdo não executável.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Configurar Q3, enviar texto de teste e reabrir; alternar obrigatório em pesquisa ainda editável e tentar resposta vazia. Testar texto com caracteres especiais.

**Aceite técnico:** Enunciado e regra persistem, resposta textual não é truncada silenciosamente nem executada como código. Vazio é aceito apenas quando permitido.

**Atenção / limite:** Não exigir análise de sentimento ou classificação por IA. Conteúdo discursivo não deve virar gráfico de pizza artificial.

<a id="por-075"></a>
#### POR-075 — Função para remover — objeto não especificado

**TR — PORTAL INSTITUCIONAL, item 75, p. 316:**

> Possuir função para remover

**Implementação:** Manter o requisito na matriz como AGUARDA_DEFINICAO: o texto termina em “remover”. Não criar ação genérica destrutiva nem assumir que se refere a pergunta, alternativa, resposta ou questionário. Os itens 77/78 possuem exclusões explícitas e devem ser implementados independentemente.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Apresentar na matriz a citação e a pergunta objetiva sobre qual objeto/condição deve ser removido. Demonstrar 77/78 como itens próprios, sem usá-los automaticamente para validar este número.

**Aceite técnico:** Existe rastreabilidade e pendência explícita. Só definir e executar aceite funcional de 75 após identificar o complemento ou obter esclarecimento; nenhum resultado é presumido.

**Atenção / limite:** Q-P02 — item efetivamente incompleto na página 316. Não declarar 134/134 funcionalidades testáveis sem resolver essa lacuna.

<a id="por-076"></a>
#### POR-076 — Ordenar questões do questionário

**TR — PORTAL INSTITUCIONAL, item 76, p. 316:**

> Possuir função para ordenar as questões do questionário;

**Implementação:** Reordenar as questões de Q-DEMO por arraste, preservando IDs, tipos, opções e respostas. Exibir a ordem ao participante conforme a versão publicada/permitida.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Mudar Q1/Q2/Q3 para Q3/Q1/Q2 ainda em cadastro, revisar e publicar. Conferir a ordem na área pública e as respostas na questão correta.

**Aceite técnico:** Todas as questões ficam ordenáveis e a mudança não funde tipos nem perde opções. A posição persiste após recarga.

**Atenção / limite:** Ordenação não deve contornar a revisão obrigatória de uma configuração ainda não validada.

<a id="por-077"></a>
#### POR-077 — Excluir questão durante cadastro do questionário

**TR — PORTAL INSTITUCIONAL, item 77, p. 316:**

> Possuir função para excluir a questão durante o cadastro do questionário;

**Implementação:** Permitir remover questão da composição durante o cadastro, com seus vínculos daquele rascunho. Não remover outras questões ou usar a ação para apagar respostas históricas sem política explícita.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Adicionar Q-TEMP ao cadastro de Q-DEMO, remover antes de revisar e conferir que Q1/Q2/Q3 permanecem. Cancelar a edição em teste separado.

**Aceite técnico:** A questão selecionada sai da composição e a publicação não a inclui; as demais ficam intactas.

**Atenção / limite:** A fonte delimita durante cadastro. Não ampliar a ação para exclusão irrestrita de respostas de pesquisa já encerrada.

<a id="por-078"></a>
#### POR-078 — Excluir alternativa durante cadastro do questionário

**TR — PORTAL INSTITUCIONAL, item 78, p. 316:**

> Possuir função para excluir a alternativa, nos casos de questões de única ou múltipla escolha, durante o cadastro do questionário;

**Implementação:** Permitir excluir alternativa de questão única/múltipla durante cadastro. Revalidar o mínimo de duas opções exigido nos itens 70/72 antes da publicação.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Adicionar D a Q1 e Z a Q2; remover ambas. Tentar reduzir uma questão a uma única opção e verificar a crítica antes de publicar.

**Aceite técnico:** Só a alternativa selecionada é removida e uma questão incompleta não é publicada como válida.

**Atenção / limite:** Não transformar a exclusão de alternativa em troca de identidade de todas as opções restantes.

<a id="por-079"></a>
#### POR-079 — Revisão do questionário antes de publicar

**TR — PORTAL INSTITUCIONAL, item 79, p. 316:**

> Encaminhar o questionário para revisão após o cadastro, garantindo que o usuário valide todas as informações antes de publicar o questionário;

**Implementação:** Após cadastro, encaminhar o questionário à etapa/tela de revisão com todas as perguntas, alternativas, datas e configurações. Registrar a confirmação do usuário e só permitir publicação da versão validada. Não exigir outro aprovador se a configuração não o determina.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Salvar Q-DEMO e tentar acesso público antes da revisão. Revisar os dados completos, confirmar e publicar dentro da janela; alterar estrutura não publicada e testar que precisa ser validada.

**Aceite técnico:** Revisão precede a publicação e pode identificar/retornar correções. Uma marca “ativo” isolada não contorna a revisão.

**Atenção / limite:** É etapa expressa do TR, não extra. Não impor workflow de comissão, assinatura ou parecer jurídico.

<a id="por-080"></a>
#### POR-080 — Prorrogar término de questionário ainda vigente

**TR — PORTAL INSTITUCIONAL, item 80, p. 316:**

> Permitir adiar o término do questionário quando o mesmo ainda estiver dentro do prazo de duração;

**Implementação:** Permitir adiar término quando a pesquisa estiver dentro da duração. Validar no servidor que o horário atual é anterior ao término vigente e que o novo término é posterior ao anterior; preservar respostas e registro da mudança.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Em 18/09/2026 12h, prorrogar Q-DEMO de 20/09 18h para 22/09 18h. Depois do término, tentar usar a mesma ação e recusar.

**Aceite técnico:** A extensão vale sem perder respostas e não permite reabrir pesquisa expirada por esse atalho. Não confiar só em botão oculto.

**Atenção / limite:** Não criar rotina adicional de reabertura automática de pesquisas vencidas.

### Enquetes

<a id="por-081"></a>
#### POR-081 — Manutenção de enquetes

**TR — PORTAL INSTITUCIONAL, item 81, p. 316:**

> Possuir função para criar, alterar, consultar e excluir enquetes;

**Implementação:** Oferecer criação, consulta, edição e exclusão de enquetes no próprio contexto, reutilizando o motor de Questionários sem fundir os cadastros. Preservar revisão e configurações próprias.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar E-PESQ, consultar, editar e excluir E-DESCARTAVEL; confirmar que Q-DEMO continua inalterado.

**Aceite técnico:** Enquete é administrável e diferenciada do questionário, com os mesmos controles técnicos pertinentes e resultado próprio.

**Atenção / limite:** Não reduzir enquete obrigatoriamente a uma única pergunta ou a escolha única: os itens seguintes admitem outros tipos.

<a id="por-082"></a>
#### POR-082 — Título, descrição e janela da enquete

**TR — PORTAL INSTITUCIONAL, item 82, p. 316:**

> O cadastro de uma enquete deverá conter o título da enquete, a descrição, a data e hora de publicação e de término;

**Implementação:** Cadastrar título, descrição, data/hora de publicação e término, com janela validada no servidor e revisão independente da ativação.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Configurar E-PESQ com a janela de F-PESQ e testar acesso antes, durante e depois, em cenário independente do questionário.

**Aceite técnico:** Datas/horas controlam a disponibilidade real; um relógio de navegador alterado não permite responder fora da janela.

**Atenção / limite:** Não exigir calendário externo ou agenda de eventos para registrar essas datas.

<a id="por-083"></a>
#### POR-083 — Configuração de acesso, resultados e encerramento da enquete

**TR — PORTAL INSTITUCIONAL, item 83, p. 316:**

> O cadastro de uma enquete deverá ser configurável e conter a situação da enquete (ativo ou inativo), permitir ou não consulta ao resultado parcial, permitir ou não a consulta pública, permitir ou não a contagem de votos na área pública, indicação do tipo de gráfico (pizza ou barra) e mensagem customizada de encerramento;

**Implementação:** Aplicar os seis controles próprios da enquete: ativo/inativo, resultado parcial, consulta pública, contagem de votos, tipo pizza/barra e mensagem final. Compartilhar a lógica de 68 sem compartilhar inadvertidamente os valores da configuração.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Alternar cada opção em E-PESQ e conferir área pública/privada, gráfico e mensagem; verificar que Q-DEMO mantém suas escolhas.

**Aceite técnico:** Resultados e disponibilidade respeitam as configurações da enquete e a API não entrega números proibidos ao público.

**Atenção / limite:** Q-P05: significado exato de consulta pública e políticas de participação/resultado precisa ser registrado. Não somar respostas de enquete e questionário.

<a id="por-084"></a>
#### POR-084 — Tipos de questão da enquete

**TR — PORTAL INSTITUCIONAL, item 84, p. 316:**

> O cadastro de uma enquete deverá permitir o cadastro de questões do tipo única escolha, múltipla escolha ou discursiva;

**Implementação:** Permitir configurar questões de única escolha, múltipla escolha ou discursiva no contexto de enquete, com validação do tipo e das respostas. Reutilizar os componentes existentes.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar exemplos dos três tipos em E-PESQ ou enquetes de teste equivalentes; responder cada um e consultar o conteúdo salvo.

**Aceite técnico:** As três modalidades podem ser utilizadas no contexto de enquete; não há seleção apenas visual com a mesma entrada de texto para todos.

**Atenção / limite:** O texto usa “ou”; a implementação compartilhada pode suportar os tipos sem exigir uma enquete com todos eles para uso real.

<a id="por-085"></a>
#### POR-085 — Única escolha na enquete: campos e opções

**TR — PORTAL INSTITUCIONAL, item 85, p. 316:**

> O cadastro de uma questão do tipo única escolha deve conter o enunciado da questão, a indicação se responder a questão é obrigatório e, ao menos, duas opções, com a possibilidade de adicionar novas, que devem conter a descrição da opção e uma imagem, se necessário, do repositório de arquivos;

**Implementação:** Permitir enunciado, obrigatório e pelo menos duas opções, ampliáveis, com descrição e imagem opcional do repositório. Aplicar validação tanto no formulário quanto no recebimento da resposta.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — imagem da alternativa.

**Demonstração:** Criar E-Q1 com A/B/C, imagem em A e resposta obrigatória; testar vazio, escolha múltipla indevida e resposta válida.

**Aceite técnico:** Alternativas, obrigatoriedade e seleção única funcionam na enquete; IDs pertencem à questão correta.

**Atenção / limite:** Mesmo componente de 70, porém evidência deve mostrar o contexto Enquetes.

<a id="por-086"></a>
#### POR-086 — Ordenar opções únicas da enquete

**TR — PORTAL INSTITUCIONAL, item 86, p. 316:**

> Possuir função para ordenar as opções de única escolha;

**Implementação:** Reordenar opções de E-Q1 por arraste e salvar posição com identidade estável. Reaproveitar o comportamento acessível e persistente.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Arrastar C antes de A/B, reabrir E-PESQ e conferir que a seleção continua vinculada à alternativa correta.

**Aceite técnico:** Ordem aparece corretamente na enquete publicada/configurada, sem perda ou reatribuição de respostas.

**Atenção / limite:** Não marcar atendido apenas porque o arraste funciona em Questionário.

<a id="por-087"></a>
#### POR-087 — Múltipla escolha na enquete: campos e opções

**TR — PORTAL INSTITUCIONAL, item 87, p. 316:**

> O cadastro de uma questão do tipo múltipla escolha deve conter o enunciado da questão, a indicação se responder a questão é obrigatório e, ao menos, duas opções, com a possibilidade de adicionar novas, que devem conter a descrição da opção e uma imagem, se necessário, do repositório de arquivos;

**Implementação:** Permitir enunciado, obrigatório e duas ou mais opções com descrição/imagem opcional. Guardar conjunto de alternativas válidas por resposta e conferir duplicatas ou IDs de outra questão.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — imagens do repositório.

**Demonstração:** Criar E-Q2 com X/Y, permitir marcar ambas e testar publicação com uma só alternativa. Executar a série de quatro respostas de F-PESQ.

**Aceite técnico:** Múltipla seleção funciona e produz X=2/Y=3 no cenário separado. Não equiparar cinco marcações a cinco participantes.

**Atenção / limite:** Não implementar várias perguntas de sim/não como substituto obrigatório de uma questão de múltipla escolha.

<a id="por-088"></a>
#### POR-088 — Ordenar opções múltiplas da enquete

**TR — PORTAL INSTITUCIONAL, item 88, p. 316:**

> Possuir função para ordenar as opções de múltipla escolha;

**Implementação:** Permitir clicar, arrastar e soltar alternativas múltiplas no cadastro, conservando IDs e estrutura. Persistir a ordem da enquete correta.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Colocar Y antes de X, salvar, recarregar e comparar rótulos, IDs e resultados da enquete.

**Aceite técnico:** Mudança de posição não altera a contagem de respostas nem modifica Q-DEMO.

**Atenção / limite:** Compartilhar serviço com 73, mas não chavear ordenação apenas pela posição global.

<a id="por-089"></a>
#### POR-089 — Questão discursiva da enquete

**TR — PORTAL INSTITUCIONAL, item 89, pp. 316–317:**

> O cadastro de uma questão do tipo discursiva deve conter o enunciado da questão e a indicação se responder a questão é obrigatório;

**Implementação:** Guardar enunciado e obrigatório e fornecer campo de resposta textual seguro, ligado à enquete. Preservar texto completo conforme capacidade da base e informar qualquer limite técnico real.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar E-Q3 obrigatória, tentar vazio e enviar comentário DEMO. Reabrir a resposta na área autorizada.

**Aceite técnico:** Texto e regra persistem, sem converter a resposta em alternativa numérica ou expô-la indevidamente.

**Atenção / limite:** Não adicionar moderação por IA, classificação de sentimento ou publicidade automática de comentários individuais.

<a id="por-090"></a>
#### POR-090 — Excluir alternativa durante cadastro da enquete

**TR — PORTAL INSTITUCIONAL, item 90, p. 317:**

> Possuir função para excluir a alternativa, nos casos de questões de única ou múltipla escolha, durante o cadastro da enquete;

**Implementação:** Permitir remover opção de questão única/múltipla durante cadastro, preservando as demais e a validação do mínimo exigido.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Adicionar/remover opções temporárias em E-Q1/E-Q2 e tentar publicar com menos de duas alternativas.

**Aceite técnico:** Remoção é efetiva no cadastro e a configuração incompleta não é publicada. O outro tipo de pesquisa não é alterado.

**Atenção / limite:** Não usar esta rotina para apagar seletivamente votos de pesquisa vigente ou encerrada.

<a id="por-091"></a>
#### POR-091 — Revisão da enquete antes da publicação

**TR — PORTAL INSTITUCIONAL, item 91, p. 317:**

> Encaminhar a enquete para revisão após o cadastro, garantindo que o usuário valide todas as informações antes de publicar a enquete;

**Implementação:** Encaminhar a enquete cadastrada para revisão, apresentar perguntas/configurações/datas e registrar a validação antes de publicar. Reutilizar o fluxo simples do item 79.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Salvar E-PESQ, revisar e corrigir uma informação, confirmar revisão e publicar. Tentar acesso público antes da conclusão.

**Aceite técnico:** A revisão é real e precede publicação; a enquete pode ser corrigida sem outra rodada de cadastro.

**Atenção / limite:** Não exigir aprovador diferente do autor por suposição. Não omitir a revisão por estar reutilizando Questionários.

<a id="por-092"></a>
#### POR-092 — Prorrogar término de enquete vigente

**TR — PORTAL INSTITUCIONAL, item 92, p. 317:**

> Permitir adiar o término da enquete quando a mesma ainda estiver dentro do prazo de duração;

**Implementação:** Aplicar a prorrogação de término somente dentro da duração corrente, com data futura em relação ao término anterior e validação no servidor.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Prorrogar E-PESQ ainda vigente e verificar a nova data. Avançar relógio de teste além do término e tentar prorrogar novamente.

**Aceite técnico:** A nova data persiste e preserva as respostas; tentativa depois de encerrada é recusada por essa função.

**Atenção / limite:** Não transformar “adiar o término” em reativação automática ilimitada.

### Newsletter

<a id="por-093"></a>
#### POR-093 — Dashboard com quatro indicadores de newsletter

**TR — PORTAL INSTITUCIONAL, item 93, p. 317:**

> Possuir dashboard de informações sobre newsletter contendo a quantidade total de inscrições ativas, a quantidade total de novas inscrições nos últimos sete dias, a quantidade total de novas inscrições nos últimos trinta dias e a quantidade total de inscrições canceladas nos últimos trinta dias;

**Implementação:** Calcular total de inscrições ativas, novas inscrições dos últimos sete dias, novas dos últimos trinta dias e cancelamentos dos últimos trinta dias a partir dos registros/eventos. Identificar referência temporal e janelas. Total ativo não é o mesmo que total histórico.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — persistência; datas e eventos de inscrição pertencem ao Portal.

**Demonstração:** Carregar F-NEWS com 12 inscrições e referência de 18/09/2026 12h. Conferir ativos=9, novas em 7 dias=4, novas em 30 dias=8 e canceladas em 30 dias=3. Testar registro exatamente na borda em cenário separado.

**Aceite técnico:** Os quatro indicadores conciliam com as linhas-fonte e mudam com eventos reais. Não usar números fixos ou filtrar novas inscrições somente pelas atualmente ativas.

**Atenção / limite:** Q-P06 documenta janelas, fuso e política de reinscrição. Não adicionar métrica de abertura/clique, pontuação de lead ou marketing não exigido.

<a id="por-094"></a>
#### POR-094 — Gráfico de pizza dos motivos de cancelamento

**TR — PORTAL INSTITUCIONAL, item 94, p. 317:**

> O dashboard de newsletter deverá conter gráfico de pizza com os motivos dos cancelamentos de inscrições;

**Implementação:** Agrupar cancelamentos por motivo e renderizar gráfico de pizza com rótulos/legenda e alternativa textual. Usar o mesmo período explicitado no painel e manter o significado do motivo mesmo quando ele for inativado.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Em F-NEWS, conferir dois cancelamentos por Excesso de mensagens e um por Não desejo receber: 2/3 e 1/3, 66,67% e 33,33%. Desativar um motivo em cenário separado sem alterar o passado.

**Aceite técnico:** Gráfico e tabela somam três eventos e mantêm a associação histórica. Sem cancelamentos, exibir estado vazio, não percentuais inventados.

**Atenção / limite:** O gráfico de pizza é explicitamente exigido; não substituí-lo só por barras ou cards. Não presumir que remover motivo apaga cancelamentos.

<a id="por-095"></a>
#### POR-095 — Comparativo mensal de inscrições e cancelamentos

**TR — PORTAL INSTITUCIONAL, item 95, p. 317:**

> O dashboard de newsletter deverá conter gráfico de comparação do histórico de inscrições (novas inscrições e cancelamentos) dos últimos meses;

**Implementação:** Exibir histórico por mês com duas séries distintas, novas inscrições e cancelamentos, a partir das datas dos eventos. Indicar meses do recorte e não reconstruir a série usando apenas o estado atual.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Conferir F-NEWS: junho 1/0, julho 1/0, agosto 4/0 e setembro 6/3 (novas/canceladas). Abrir listagem para comparar registros.

**Aceite técnico:** As séries mantêm os eventos nos meses corretos e somam 12 inscrições e três cancelamentos no conjunto. Mudança posterior de situação não reescreve o mês da inscrição.

**Atenção / limite:** O TR não define quantos meses. Usar parâmetro/recorte identificado; não acrescentar previsão comercial de crescimento.

<a id="por-096"></a>
#### POR-096 — Configuração do componente de newsletter

**TR — PORTAL INSTITUCIONAL, item 96, p. 317:**

> Possuir função para configurar o componente de newsletter;

**Implementação:** Permitir configurar o componente de inscrição pública da newsletter e suas mensagens, reaproveitando o envio existente. Oferecer registro de inscrição e cancelamento de forma suficiente para alimentar as situações e indicadores exigidos, sem importar cidadãos automaticamente.

**Dados de outro módulo / serviço compartilhado:** DEP-06 — serviço de e-mail; componente e base de newsletter nativos do Portal.

**Demonstração:** Configurar os textos, realizar uma inscrição com e-mail controlado pelo componente público, conferir sua listagem e cancelar com motivo selecionável; verificar o resultado.

**Aceite técnico:** O componente opera sobre inscrições reais e a configuração persiste. Cancelado deixa de receber novos conteúdos. Os recursos de acesso ao cadastro não concedem privilégios administrativos.

**Atenção / limite:** A fonte não enumera todos os campos de configuração. Não impor double opt-in ou conta do ERP como nova exigência; preservar mecanismo já adotado e registrar Q-P06. Mensagem de confirmação não é prova de que foi exigida confirmação por link.

<a id="por-097"></a>
#### POR-097 — Mensagens customizadas da newsletter

**TR — PORTAL INSTITUCIONAL, item 97, p. 317:**

> Permitir customizar a mensagem de confirmação de inscrição na newsletter, a mensagem de novo conteúdo e a mensagem de cancelamento da newsletter;

**Implementação:** Permitir editar separadamente os modelos de confirmação de inscrição, novo conteúdo e cancelamento. Usar campos de mesclagem seguros para nome, conteúdo e links pertinentes, sem permitir execução de scripts.

**Dados de outro módulo / serviço compartilhado:** DEP-06 — e-mail e modelo compartilhado quando existente; DEP-05 se houver renderer de documentos/mensagens.

**Demonstração:** Personalizar os três textos DEMO e disparar inscrição, novo conteúdo e cancelamento em caixas controladas. Conferir o modelo correto e suas informações dinâmicas.

**Aceite técnico:** Cada evento usa sua própria mensagem customizada e os valores vêm da operação real. Não enviar texto antigo por manter modelo fixo no serviço.

**Atenção / limite:** Não criar editor de campanhas avançadas, segmentação comercial ou biblioteca de automações além dos eventos previstos.

<a id="por-098"></a>
#### POR-098 — Listagem completa das inscrições

**TR — PORTAL INSTITUCIONAL, item 98, p. 317:**

> Permitir listar todas as inscrições contendo o nome, email, telefone, data da inscrição, situação (ativo ou inativo) e data da inativação, se houver;

**Implementação:** Listar todas as inscrições com nome, e-mail, telefone, data da inscrição, situação ativo/inativo e data da inativação quando existir. Paginar e filtrar sem excluir inativos implicitamente; edição/exclusão do gerenciador deve respeitar 18 e a coerência dos indicadores.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Consultar as 12 inscrições de F-NEWS em duas páginas 10/2; conferir os três inativos com suas datas. Filtrar ativos e comparar nove registros.

**Aceite técnico:** Os seis dados são consultáveis e o total corresponde à seleção. Inativos não somem da consulta geral e informação não preenchida não é inventada.

**Atenção / limite:** Existência de campo telefone não torna seu preenchimento ou CPF obrigatório para assinatura sem regra fornecida. Não publicar a lista de assinantes na área anônima.

<a id="por-099"></a>
#### POR-099 — Criar, consultar e excluir motivos de cancelamento

**TR — PORTAL INSTITUCIONAL, item 99, p. 317:**

> Possuir função para criar, consultar e excluir motivos de cancelamento de newsletter;

**Implementação:** Manter motivos de cancelamento com identidade e situação, usados no cancelamento. Permitir criar, consultar e excluir motivo sem vínculos; para utilizado, conservar referência histórica ao tratar exclusão lógica ou orientar inativação.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar os dois motivos de F-NEWS e um motivo descartável; listar e excluir o descartável. Consultar cancelamentos associados aos demais.

**Aceite técnico:** Motivos são dados reais selecionáveis e podem ser excluídos quando permitido; os gráficos não perdem seu histórico por remoção de cadastro.

**Atenção / limite:** Não substituir toda exclusão por inativação. Quando houver histórico, documentar o tratamento técnico e manter o resultado consistente.

<a id="por-100"></a>
#### POR-100 — Áudio descrição da listagem de motivos

**TR — PORTAL INSTITUCIONAL, item 100, p. 317:**

> A tela de listagem de motivos de cancelamento deverá ter áudio descrição que explique o funcionamento da tela;

**Implementação:** Incluir controle audível em português do Brasil explicando como usar a listagem de motivos: consulta, situação, criação, desativação e exclusão. Disponibilizar reprodução/pausa, rótulo acessível e transcrição equivalente; reutilizar o player da solução.

**Dados de outro módulo / serviço compartilhado:** DEP-03/04 — arquivo de áudio no armazenamento/repositório; player compartilhado.

**Demonstração:** Na listagem real, acionar “Ouvir orientação desta tela”, ouvir o arquivo de F-AUDIO-01 e comparar com os controles existentes. Pausar e usar por teclado.

**Aceite técnico:** A explicação é sonora, inteligível e específica dessa tela. Tooltip, texto alternativo ou leitor de tela sem conteúdo orientativo não substituem a áudio descrição.

**Atenção / limite:** Não exigir serviço de IA/voz ou geração automática. Gravação orientativa fornecida pela equipe basta tecnicamente, desde que fiel à tela.

<a id="por-101"></a>
#### POR-101 — Desativar ou excluir motivo pela listagem

**TR — PORTAL INSTITUCIONAL, item 101, p. 317:**

> A tela de listagem de motivos de cancelamento deverá permitir desativar ou excluir um motivo de cancelamento;

**Implementação:** Oferecer na listagem ações diferentes de Desativar e Excluir. Inativo deixa de ser oferecido para novos cancelamentos e permanece identificável no histórico; exclusão segue a integridade das referências.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Desativar motivo usado e conferir que não aparece na nova escolha, mas permanece no gráfico histórico. Excluir motivo descartável sem uso pela própria lista.

**Aceite técnico:** As duas ações existem e produzem efeitos diferentes, com persistência. Alterar o motivo não apaga a inscrição cancelada.

**Atenção / limite:** Não usar “Excluir” para apenas mudar o rótulo ativo sem explicar a operação.

<a id="por-102"></a>
#### POR-102 — Título e situação do motivo de cancelamento

**TR — PORTAL INSTITUCIONAL, item 102, p. 317:**

> O cadastro de um novo motivo de cancelamento de newsletter deverá conter o título do motivo de cancelamento e a situação (ativo ou inativo);

**Implementação:** No formulário de novo motivo, oferecer título e ativo/inativo. Validar título informado e refletir a situação nas opções de cancelamento.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Cadastrar M-ATIVO e M-INATIVO, reabrir e conferir as duas situações; testar a escolha no cancelamento.

**Aceite técnico:** Título e situação persistem e a disponibilidade acompanha a configuração.

**Atenção / limite:** Não inventar classificação de motivo por IA ou campo obrigatório adicional de justificativa.

<a id="por-103"></a>
#### POR-103 — Áudio descrição do cadastro de motivo

**TR — PORTAL INSTITUCIONAL, item 103, p. 317:**

> A tela de cadastro de um novo motivo de cancelamento deverá ter áudio descrição que explique o funcionamento da tela;

**Implementação:** Adicionar orientação sonora própria para o formulário de cadastro de motivo, explicando título, situação e salvar/cancelar, com transcrição e controles de reprodução.

**Dados de outro módulo / serviço compartilhado:** DEP-03/04 — armazenamento de áudio; player comum.

**Demonstração:** Ouvir F-AUDIO-02 no cadastro, pausar, navegar por teclado e realizar as ações descritas.

**Aceite técnico:** O áudio corresponde ao formulário, é acessível e não é apenas a gravação genérica da listagem sem instruções pertinentes.

**Atenção / limite:** Não disparar reprodução automática intrusiva. O requisito é a disponibilidade da descrição sonora, não um novo módulo de treinamento.

### Acesso Rápido

<a id="por-104"></a>
#### POR-104 — Configuração do acesso rápido

**TR — PORTAL INSTITUCIONAL, item 104, p. 318:**

> Possuir função para configurar o acesso rápido;

**Implementação:** Permitir configurar o componente público de Acesso Rápido com as quantidades do item 105. Usar a lista de itens ativos ordenada, sem duplicar o catálogo para cada página.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Abrir a configuração, salvar seis itens com três por linha e consultar a home.

**Aceite técnico:** Configuração persiste e controla o componente real. Alterar layout não altera o destino ou identidade dos atalhos.

**Atenção / limite:** Os cards de acesso rápido são exigidos na área pública; não usar a preferência por tabelas do gerenciador para removê-los.

<a id="por-105"></a>
#### POR-105 — Limites de 1–12 itens e 1–6 por linha

**TR — PORTAL INSTITUCIONAL, item 105, p. 318:**

> Permitir configurar a quantidade de itens de acesso rápido que devem ser exibidas, no intervalo de um e doze itens, e a quantidade de itens por linha, no intervalo de um e seis itens;

**Implementação:** Validar quantidade a exibir entre 1 e 12 e itens por linha entre 1 e 6, em campos separados. Aplicar os valores ao leiaute desktop com adaptação responsiva que preserve legibilidade, sem mostrar itens fictícios para completar a grade.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Em F-LINKS com 12 itens ativos, testar 6 itens/3 por linha, depois 12/6 e 1/1. Tentar 0/13 no total e 0/7 por linha; rejeitar. Repetir em largura de celular.

**Aceite técnico:** Faixas inclusivas são respeitadas e o número de itens exibido corresponde ao máximo configurado e aos registros disponíveis. Celular reorganiza sem cortar acesso.

**Atenção / limite:** Não trocar as faixas por limites arbitrários. Menos registros ativos que o limite significa exibir os existentes, não duplicar itens.

<a id="por-106"></a>
#### POR-106 — Manutenção dos itens de acesso rápido

**TR — PORTAL INSTITUCIONAL, item 106, p. 318:**

> Possuir função para criar, alterar, consultar e excluir itens de acesso rápido;

**Implementação:** Criar, consultar, editar e excluir atalhos no componente do Portal. Reutilizar validação de URL, controle de estado e ordem sem misturar esses registros com menus ou redes sociais.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — destinos de outros módulos somente quando escolhidos; sem recriar suas funções.

**Demonstração:** Criar AQ-01/AQ-02, abrir os destinos no site, editar e excluir um atalho descartável.

**Aceite técnico:** Operações funcionam e o público reflete a lista vigente, sem necessidade de editar código.

**Atenção / limite:** Atalho não comprova funcionamento do serviço externo de destino; registrar uma dependência ausente em vez de criar tela falsa.

<a id="por-107"></a>
#### POR-107 — Campos na criação do acesso rápido

**TR — PORTAL INSTITUCIONAL, item 107, p. 318:**

> O cadastro de um item de acesso rápido deverá conter o nome do item, o link de destino, o ícone (se necessário, conforme o leiaute), o comportamento (abrir na mesma aba ou em nova aba), a descrição, a capa (imagem) do repositório (se necessário, conforme o leiaute) e a situação (ativo ou inativo);

**Implementação:** Informar nome, link, ícone condicional ao leiaute, comportamento mesma aba/nova aba, descrição, capa condicional do repositório e ativo/inativo. Aplicar os efeitos no componente.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — capa; DEP-07 — URL de serviço, se houver.

**Demonstração:** Criar AQ-01 com capa/ícone no leiaute que os utiliza, abrir na mesma aba; AQ-02 em nova aba. Inativar um e conferir a lista.

**Aceite técnico:** Todos os campos aparecem quando pertinentes e são persistidos; destino/comportamento respeitam a escolha.

**Atenção / limite:** Capa e ícone condicionais não devem impedir cadastro num leiaute que não os use.

<a id="por-108"></a>
#### POR-108 — Edição completa do acesso rápido

**TR — PORTAL INSTITUCIONAL, item 108, p. 318:**

> A alteração de um item de acesso rápido deverá permitir a edição do nome do item, do link de destino, do ícone (se necessário, conforme o leiaute), do comportamento (abrir na mesma aba ou em nova aba), da descrição, da capa (imagem) do repositório (se necessário, conforme o leiaute) e da situação (ativo ou inativo);

**Implementação:** Permitir editar nome, destino, ícone, comportamento, descrição, capa e situação, preservando ID e posição. Invalidar a exibição pública pertinente após salvar.

**Dados de outro módulo / serviço compartilhado:** DEP-04/07 quando houver mídia/destino compartilhados.

**Demonstração:** Alterar cada atributo de AQ-01, recarregar gerenciador e site e testar o novo destino e a nova situação.

**Aceite técnico:** Nenhum campo citado é somente leitura na edição sem motivo técnico. A alteração não cria outro atalho acidentalmente.

**Atenção / limite:** Não alterar os dados do serviço vinculado ao editar seu atalho.

<a id="por-109"></a>
#### POR-109 — Ordenação por arraste do acesso rápido

**TR — PORTAL INSTITUCIONAL, item 109, p. 318:**

> Possuir função para ordenar os itens de acesso rápido com ação de clicar, arrastar e soltar;

**Implementação:** Ordenar atalhos por clicar, arrastar e soltar, persistindo a ordem de toda a coleção. Usar uma visão de ordenação com acesso aos itens fora da página corrente.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Em F-LINKS, mover AQ-12 para a primeira posição e conferir os seis itens exibidos na home sob limite 6.

**Aceite técnico:** AQ-12 passa a aparecer na posição correta e os outros itens preservam sua identidade. Não se reordena só uma página isolada.

**Atenção / limite:** Não exigir digitação manual de índices como única forma de ordenar.

### Redes Sociais

<a id="por-110"></a>
#### POR-110 — Manutenção de redes sociais

**TR — PORTAL INSTITUCIONAL, item 110, p. 318:**

> Possuir função para criar, alterar, consultar e excluir itens de redes sociais;

**Implementação:** Criar, consultar, editar e excluir itens de redes sociais que são links do Portal. Usar os dados específicos de 112/113 e a ordem de 114.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — links externos configurados; não há API social exigida por este cadastro.

**Demonstração:** Cadastrar RS-01 e RS-02 com destinos de teste, abrir seus links e excluir RS-DESCARTAVEL.

**Aceite técnico:** Lista do site deriva dos itens cadastrados e suas situações, sem conteúdo estático.

**Atenção / limite:** Não criar publicação automática, feed de rede social, OAuth ou monitoramento de seguidores como requisito.

<a id="por-111"></a>
#### POR-111 — Áudio descrição do cadastro de rede social

**TR — PORTAL INSTITUCIONAL, item 111, p. 318:**

> A tela cadastro item de rede social deverá ter áudio descrição que explique o funcionamento da tela;

**Implementação:** Incluir orientação audível em português do Brasil no formulário de item de rede social, descrevendo nome, destino, ícone, comportamento, descrição e situação, com transcrição e reprodução controlada.

**Dados de outro módulo / serviço compartilhado:** DEP-03/04 — arquivo de áudio; player compartilhado.

**Demonstração:** Ouvir F-AUDIO-03 no formulário, comparar as instruções com os campos e preencher um item utilizando apenas teclado.

**Aceite técnico:** Áudio descreve a tela real e pode ser reproduzido/pausado. Texto de ajuda isolado não substitui o conteúdo sonoro.

**Atenção / limite:** Não criar integração com rede social para obter esse áudio; usar gravação própria de teste.

<a id="por-112"></a>
#### POR-112 — Campos de criação de rede social

**TR — PORTAL INSTITUCIONAL, item 112, p. 318:**

> O cadastro de um item de rede social deverá conter o nome do item, o link de destino, o ícone, o comportamento (abrir na mesma aba ou em nova aba), a descrição e a situação (ativo ou inativo);

**Implementação:** Informar nome, link de destino, ícone, mesma aba/nova aba, descrição e ativo/inativo, validando URLs seguras. Apresentar nome significativo além do ícone para acesso assistivo.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — destino externo configurado; recursos de ícones do núcleo.

**Demonstração:** Cadastrar RS-01 com todos os campos e nova aba; conferir reabertura, ícone, descrição e abertura do destino.

**Aceite técnico:** Os seis dados são persistidos e seu comportamento é aplicado no site.

**Atenção / limite:** O TR exige link; não exige token de API, conta comercial ou integração de postagem.

<a id="por-113"></a>
#### POR-113 — Edição dos campos de rede social

**TR — PORTAL INSTITUCIONAL, item 113, p. 318:**

> A alteração de um item de rede social deverá permitir a edição do nome do item, do link de destino, do ícone, do comportamento (abrir na mesma aba ou em nova aba), da descrição e da situação (ativo ou inativo);

**Implementação:** Permitir editar todos os dados de 112 no mesmo cadastro. Refletir nova URL e situação no componente sem recriar o item.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — URL de destino configurada.

**Demonstração:** Editar RS-01 para outro destino controlado e mesma aba, trocar nome/ícone/descrição e inativar; conferir o público.

**Aceite técnico:** Alterações persistem e a rede inativa deixa de ser exibida. A edição não interfere em Links Úteis.

**Atenção / limite:** Não realizar acesso autenticado à plataforma externa só para validar a edição do link.

<a id="por-114"></a>
#### POR-114 — Ordenar redes sociais por arraste

**TR — PORTAL INSTITUCIONAL, item 114, p. 319:**

> Possuir função para ordenar os itens de rede social com ação de clicar, arrastar e soltar;

**Implementação:** Oferecer clicar, arrastar e soltar na lista de redes sociais, com ordem persistida e representação equivalente no site.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Inverter RS-01/RS-02, salvar e abrir o componente público em outra sessão.

**Aceite técnico:** A ordem é a mesma após recarga e na publicação, sem duplicar registros.

**Atenção / limite:** POR-118 repete literalmente redes sociais em outro subtítulo; manter evidência deste comportamento também referenciável ali.

### Links Úteis

<a id="por-115"></a>
#### POR-115 — Manutenção de links úteis

**TR — PORTAL INSTITUCIONAL, item 115, p. 319:**

> Possuir função para criar, alterar, consultar e excluir links úteis;

**Implementação:** Criar, consultar, editar e excluir links úteis como catálogo próprio, usando os campos de 116/117 e o controle comum de ordenação de 15.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — destinos externos/internos quando selecionados.

**Demonstração:** Cadastrar LU-01/LU-02 para destinos controlados, consultar, editar e excluir LU-DESCARTAVEL.

**Aceite técnico:** Links úteis são administráveis e aparecem com a situação correta no site, sem serem apenas uma lista fixa.

**Atenção / limite:** Não importar conteúdo de sites terceiros nem criar APIs onde o TR pede links.

<a id="por-116"></a>
#### POR-116 — Campos de criação de link útil

**TR — PORTAL INSTITUCIONAL, item 116, p. 319:**

> O cadastro de um item de link útil deverá conter o nome do item, o link de destino, o ícone, o comportamento (abrir na mesma aba ou em nova aba), a descrição e a situação (ativo ou inativo);

**Implementação:** Informar nome, URL, ícone, abertura na mesma aba/nova aba, descrição e ativo/inativo. Usar rótulo significativo e os ícones já disponíveis.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — destino, se vinculado a serviço de outro módulo.

**Demonstração:** Criar LU-01 com todos os campos e verificar a mesma/nova aba segundo a escolha; criar outro inativo.

**Aceite técnico:** Campos persistem e o item inativo não aparece como link público ativo.

**Atenção / limite:** Não impor capa de imagem neste cadastro: ela não está na lista deste item.

<a id="por-117"></a>
#### POR-117 — Edição de link útil

**TR — PORTAL INSTITUCIONAL, item 117, p. 319:**

> A alteração de um item de link útil deverá permitir a edição do nome do item, do link de destino, do ícone, do comportamento (abrir na mesma aba ou em nova aba), da descrição e da situação (ativo ou inativo);

**Implementação:** Editar nome, destino, ícone, comportamento, descrição e situação do link útil preservando ID. Reutilizar a mesma validação da criação.

**Dados de outro módulo / serviço compartilhado:** DEP-07 — referência/destino configurado.

**Demonstração:** Alterar LU-01 por completo, reabrir, conferir o site e testar inativação/reativação.

**Aceite técnico:** Todos os atributos podem ser atualizados e os efeitos são consistentes entre CMS e público.

**Atenção / limite:** Não abrir permissão para modificar dados do destino do link.

<a id="por-118"></a>
#### POR-118 — Ordenação de rede social em Links Úteis — redação divergente

**TR — PORTAL INSTITUCIONAL, item 118, p. 319:**

> Possuir função para ordenar os itens de rede social com ação de clicar, arrastar e soltar;

**Implementação:** Preservar a frase que menciona rede social e reutilizar a ordenação real de POR-114. Para Links Úteis, manter ordenação pelo mecanismo geral do item 15, sem afirmar que a frase foi corrigida pelo documento.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Demonstrar arraste das redes sociais conforme a redação literal; demonstrar separadamente a ordenação de Links Úteis derivada do requisito geral e registrar a correspondência a confirmar.

**Aceite técnico:** A função literal e a organização contextual estão disponíveis, mas a interpretação formal do item sob Links Úteis continua sinalizada.

**Atenção / limite:** Q-P03 — não reescrever “rede social” como “link útil” na citação nem criar uma terceira coleção para atender a duplicidade.

### Telefones Úteis

<a id="por-119"></a>
#### POR-119 — Manutenção de telefones úteis

**TR — PORTAL INSTITUCIONAL, item 119, p. 319:**

> Possuir função para criar, alterar, consultar e excluir telefones úteis;

**Implementação:** Criar, consultar, editar e excluir telefones úteis no CMS com seus dados e situação. Publicar somente o catálogo permitido pelo órgão.

**Dados de outro módulo / serviço compartilhado:** DEP-07 apenas quando contatos institucionais já forem fornecidos pelo cadastro comum.

**Demonstração:** Cadastrar TEL-01/TEL-02 com números de demonstração não discáveis, editar e excluir item descartável.

**Aceite técnico:** Os telefones são dados persistidos e consultáveis, não texto estático no rodapé.

**Atenção / limite:** Não ligar para números reais durante teste nem criar central telefônica/URA.

<a id="por-120"></a>
#### POR-120 — Campos de criação do telefone útil

**TR — PORTAL INSTITUCIONAL, item 120, p. 319:**

> O cadastro de um telefone útil deverá conter o nome, o número, o ícone, a descrição e a situação (ativo ou inativo);

**Implementação:** Informar nome, número, ícone, descrição e ativo/inativo. Guardar o número como identificador textual adequado à apresentação, sem perda de zeros/ramais pela conversão para inteiro.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Criar TEL-01 com os cinco campos, salvar e conferir visualização pública e edição.

**Aceite técnico:** Dados preservam a forma informada e o estado controla a exibição.

**Atenção / limite:** O item não obriga chamada telefônica, consulta de operadora ou validação externa do número.

<a id="por-121"></a>
#### POR-121 — Edição completa do telefone útil

**TR — PORTAL INSTITUCIONAL, item 121, p. 319:**

> A alteração de um telefone útil deverá permitir a edição do nome, do número, do ícone, da descrição e da situação (ativo ou inativo);

**Implementação:** Permitir editar nome, número, ícone, descrição e situação no mesmo registro. Atualizar os componentes públicos afetados.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Alterar todos os campos de TEL-01 e conferir por nova sessão; manter TEL-02 inalterado.

**Aceite técnico:** A edição preserva a identidade e os dados aparecem corretamente após recarga.

**Atenção / limite:** Não substituir manutenção do cadastro por edição de um único bloco de texto HTML.

<a id="por-122"></a>
#### POR-122 — Desativação do telefone útil

**TR — PORTAL INSTITUCIONAL, item 122, p. 319:**

> Possuir função para desativar um telefone útil;

**Implementação:** Oferecer ação de desativar que preserve o cadastro para gestão, retirando sua apresentação pública. Aplicar o filtro também ao endpoint do catálogo público.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Desativar TEL-01 pela lista, consultar anonimamente e reabrir o cadastro interno.

**Aceite técnico:** Telefone permanece administrável mas não é listado como ativo publicamente; outros registros não são afetados.

**Atenção / limite:** Desativar é diferente de excluir e ambas as capacidades requeridas devem permanecer.

<a id="por-123"></a>
#### POR-123 — Ordenar telefones úteis por arraste

**TR — PORTAL INSTITUCIONAL, item 123, p. 319:**

> Possuir função para ordenar os telefones úteis com ação de clicar, arrastar e soltar;

**Implementação:** Reordenar telefones por clicar, arrastar e soltar, persistindo a posição e refletindo no catálogo público.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — autenticação, órgão, permissões e auditoria do núcleo; dados funcionais pertencem ao Portal.

**Demonstração:** Inverter TEL-01/TEL-02 na base ativa de teste, salvar e consultar em outro navegador.

**Aceite técnico:** A ordem real coincide com a configuração e não depende do estado local da sessão.

**Atenção / limite:** Reutilizar o mecanismo de ordenação comum, mantendo uma lista própria de telefones.

### Repositório de Arquivos

<a id="por-124"></a>
#### POR-124 — Manutenção da árvore de repositórios

**TR — PORTAL INSTITUCIONAL, item 124, p. 319:**

> Possuir função para criar, alterar, consultar e excluir repositório de arquivos;

**Implementação:** Criar, consultar, editar e excluir repositórios/pastas lógicas com relação hierárquica. Reutilizar o repositório compartilhado se existir; desenvolver as operações do Portal sem duplicar os bytes. Para exclusão, tratar subpastas/arquivos e referências de forma explícita, sem cascade destrutivo.

**Dados de outro módulo / serviço compartilhado:** DEP-03 — armazenamento; DEP-04 — catálogo de arquivos/GED existente.

**Demonstração:** Criar a árvore F-REP, editar uma pasta, excluir uma pasta vazia e testar a exclusão de pasta em uso após apresentar suas dependências.

**Aceite técnico:** Repositórios são registros reais e a árvore permanece íntegra. Exclusão possível em cadastro elegível não remove silenciosamente imagens de páginas/galerias.

**Atenção / limite:** Não confundir pasta lógica com pasta local no servidor. Repositório é parte do escopo, não dependência genérica que permita omiti-lo.

<a id="por-125"></a>
#### POR-125 — Localização, nome, descrição, situação e privacidade do repositório

**TR — PORTAL INSTITUCIONAL, item 125, p. 319:**

> O cadastro de um novo repositório de arquivos deverá conter sua localização dentro da árvore de repositórios, o nome do repositório, a sua descrição, a situação (ativo ou inativo) e a indicação de privacidade (privado ou público);

**Implementação:** Na criação, informar pai/localização na árvore, nome, descrição, ativo/inativo e público/privado. Validar autorização do destino e calcular exposição efetiva respeitando os ancestrais, conforme política documentada.

**Dados de outro módulo / serviço compartilhado:** DEP-03/04 — chaves/metadados de objetos; DEP-01 — permissões.

**Demonstração:** Criar RP-PUBLICO e RP-PRIVADO com filhos em F-REP. Como visitante, tentar listar ambas e abrir seus arquivos; como editor autorizado, consultar as duas.

**Aceite técnico:** Os cinco atributos persistem. Pasta privada não se torna pública por conhecer URL/ID ou por um filho marcado público sem autorização efetiva.

**Atenção / limite:** Herança de privacidade é decisão técnica de proteção explicitada em Q-P08; não afirmar que esse detalhe de modelo está escrito no TR.

<a id="por-126"></a>
#### POR-126 — Edição da privacidade e dados do repositório

**TR — PORTAL INSTITUCIONAL, item 126, pp. 319–320:**

> A alteração de um repositório de arquivos deverá permitir a alteração do nome do repositório, a sua descrição, a situação (ativo ou inativo) e a indicação de privacidade (privado ou público);

**Implementação:** Editar nome, descrição, ativo/inativo e público/privado. Ao reduzir visibilidade, proteger imediatamente os caminhos servidos pela aplicação e invalidar referências/cache pertinentes. Não alterar o nome lógico do arquivo físico como única proteção.

**Dados de outro módulo / serviço compartilhado:** DEP-03/04 — acesso ao objeto; camada de publicação/cache.

**Demonstração:** Trocar pasta pública para privada em cenário isolado e testar rota pública, menu e mídia já referenciada. Reabrir como usuário autorizado e conferir dados preservados.

**Aceite técnico:** Novas requisições pela aplicação respeitam a privacidade vigente; não há atalho público permanente que burle a mudança. Nome/descrição e situação persistem.

**Atenção / limite:** URLs assinadas já emitidas têm política de validade a tratar; para requisito de revogação nas rotas, usar entrega controlada. Não prometer apagar cópias já baixadas.

<a id="por-127"></a>
#### POR-127 — Mover repositório na árvore

**TR — PORTAL INSTITUCIONAL, item 127, p. 320:**

> Possuir função para mover um repositório para outro nível dentro da árvore de repositórios;

**Implementação:** Mover um repositório para outro nível/pai mantendo seu ID e os vínculos dos arquivos. Validar ciclos, destino e permissões; recalcular o acesso efetivo da subárvore sem duplicar registros.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — hierarquia compartilhada; DEP-03 — objetos não devem ser duplicados por simples reorganização lógica.

**Demonstração:** Mover RP-FOTOS de RP-PUBLICO para outro nível público e reabrir. Em teste separado, mover para pai privado e conferir proteção. Tentar mover pai para dentro do próprio filho.

**Aceite técnico:** A árvore e a leitura de acesso refletem a mudança; ciclo é recusado e conteúdos permanecem vinculados aos mesmos arquivos.

**Atenção / limite:** Não conceder maior publicidade por movimento sem confirmação/autorização. A hierarquia extensa admite navegação própria.

<a id="por-128"></a>
#### POR-128 — Desativar repositório

**TR — PORTAL INSTITUCIONAL, item 128, p. 320:**

> Possuir função para desativar um repositório de arquivos;

**Implementação:** Disponibilizar inativação do repositório sem excluir seus arquivos, interrompendo a exposição pública prevista e novos usos como recurso ativo. Manter a consulta administrativa conforme permissão.

**Dados de outro módulo / serviço compartilhado:** DEP-03/04 — acesso aos arquivos e metadados.

**Demonstração:** Desativar RP-FOTOS e tentar acessar seus recursos pelo portal e menu; reabrir como editor e confirmar que os arquivos não foram apagados.

**Aceite técnico:** A situação é persistida, afeta os acessos da aplicação e preserva os dados. Não basta mudar a cor de uma linha no CMS.

**Atenção / limite:** Comportamento de filhos/referências deve seguir a política documentada e os testes; não deixar mídia privada/inativa exposta por uma URL sem controle.

<a id="por-129"></a>
#### POR-129 — Criar menu a partir do repositório

**TR — PORTAL INSTITUCIONAL, item 129, p. 320:**

> Possuir função para criar um item de menu a partir de um repositório através da seleção da localização dentro da árvore de menu;

**Implementação:** Oferecer criação de item de menu a partir de repositório, solicitando a posição na árvore de menu e herdando sua referência de consulta. Para uso público, conferir que o repositório tem acesso efetivo público e está ativo.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — repositório; serviço de menu do Portal.

**Demonstração:** Criar item de menu para RP-PUBLICO no ramo M-DOCUMENTOS e abrir como visitante. Tentar vincular RP-PRIVADO como exposição pública e recusar/orientar sem mudar privacidade automaticamente.

**Aceite técnico:** Menu aponta para o repositório correto, na posição escolhida. Vínculo de menu não contorna privacidade ou inativação.

**Atenção / limite:** Não criar outro repositório só para cada item de menu. Não publicar todos os arquivos do GED ao criar um atalho.

<a id="por-130"></a>
#### POR-130 — Manutenção dos arquivos

**TR — PORTAL INSTITUCIONAL, item 130, p. 320:**

> Possuir função para criar, alterar, consultar e excluir arquivos;

**Implementação:** Permitir criar/envio, consultar/abrir, editar metadados e excluir arquivos no repositório. Usar identidade estável separada do nome; verificar vínculos de uso antes de excluir o recurso, orientando desvinculação/reassociação quando necessário.

**Dados de outro módulo / serviço compartilhado:** DEP-03 — objetos em nuvem; DEP-04 — metadados/vínculos.

**Demonstração:** Enviar ARQ-DESCARTAVEL, abrir, renomear e excluir após remover seus vínculos. Tentar excluir IMG-COMUM ainda usada em página/galeria e conferir tratamento explícito.

**Aceite técnico:** Operações afetam registro e acesso aos bytes corretamente. Exclusão elegível não é só botão e a integridade de recursos reutilizados é preservada.

**Atenção / limite:** Não confundir exclusão de arquivo com exclusão de item de galeria: POR-065 deve manter o arquivo intacto.

<a id="por-131"></a>
#### POR-131 — Envio de um ou mais arquivos com prefixo no nome

**TR — PORTAL INSTITUCIONAL, item 131, p. 320:**

> O cadastro de arquivo deverá conter a seleção de um ou mais arquivos e um campo de prefixo ao nome do arquivo, que fará a concatenação do prefixo e o nome do arquivo;

**Implementação:** Permitir seleção múltipla e prefixo textual concatenado ao nome de cada arquivo. Preservar extensão e chave estável, validar tipo/tamanho conforme configuração e informar sucesso/falha por item. O prefixo não deve ser interpretado como caminho arbitrário.

**Dados de outro módulo / serviço compartilhado:** DEP-03/04 — upload/objetos e catálogo de arquivos.

**Demonstração:** Enviar a.png, b.pdf e c.mp3 com prefixo “DEMO_”; conferir DEMO_a.png, DEMO_b.pdf e DEMO_c.mp3. Repetir sem prefixo e simular uma falha no lote.

**Aceite técnico:** Um ou vários arquivos são enviados e seus nomes resultam da concatenação correta. Falha individual não é mostrada como envio concluído de todo o conjunto.

**Atenção / limite:** Não exigir importador de planilha ou compactação ZIP. Identidade e prevenção de envio repetido não podem depender só do nome final.

<a id="por-132"></a>
#### POR-132 — Renomear um ou mais arquivos logo após o envio

**TR — PORTAL INSTITUCIONAL, item 132, p. 320:**

> O cadastro de arquivo dentro do módulo de repositório de arquivos permitirá a alteração de um ou mais nome de arquivos imediatamente após seu envio;

**Implementação:** Após upload, apresentar a relação dos arquivos com edição imediata de um ou vários nomes antes de sair da tela. Persistir as alterações de metadados nos IDs corretos e manter os bytes recuperáveis.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — metadados de arquivos; DEP-03 — bytes existentes.

**Demonstração:** No lote de 131, renomear os arquivos a e c, deixando b inalterado; salvar e abrir todos em nova sessão.

**Aceite técnico:** Os novos nomes persistem imediatamente após o envio, sem ter que reenviar os arquivos ou procurar cada um numa tela desconectada.

**Atenção / limite:** Não alterar extensão de modo que um arquivo de áudio passe a ser apresentado falsamente como PDF. Tratamento de extensão deve ser explícito.

<a id="por-133"></a>
#### POR-133 — Edição de nome, descrição e situação do arquivo

**TR — PORTAL INSTITUCIONAL, item 133, p. 320:**

> A alteração de um arquivo dentro do módulo de repositório de arquivos permitirá a alteração do nome do arquivo, da sua descrição e da situação (ativo ou inativo);

**Implementação:** Oferecer edição de nome, descrição e ativo/inativo no repositório, preservando o ID e atualizando a exposição. Não modificar bytes para simplesmente renomear o registro.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — catálogo; DEP-03 — entrega controlada do objeto.

**Demonstração:** Editar ARQ-01 com novo nome/descrição, inativar e reabrir administrativamente; testar acesso público e retomada após reativação autorizada.

**Aceite técnico:** Os três atributos persistem e a situação afeta o uso público real. Nome diferente não quebra referências por ID.

**Atenção / limite:** Não tornar a inativação uma exclusão física. Referências existentes devem tratar a indisponibilidade de forma identificada.

<a id="por-134"></a>
#### POR-134 — Mover arquivo entre níveis do repositório

**TR — PORTAL INSTITUCIONAL, item 134, p. 320:**

> Possuir função para mover um arquivo para outro nível dentro da árvore de repositórios;

**Implementação:** Permitir escolher outra pasta/nível para o arquivo, mantendo sua identidade e referências. Validar destino, disponibilidade e acesso efetivo; a mudança é transacional com atualização dos metadados.

**Dados de outro módulo / serviço compartilhado:** DEP-03/04 — armazenamento e árvore de repositórios.

**Demonstração:** Mover IMG-COMUM entre duas pastas públicas e conferir página/galeria intactas. Em cenário separado, mover para privado e testar que visitantes não obtêm o recurso por links antigos da aplicação.

**Aceite técnico:** Arquivo muda de localização lógica sem duplicação e permanece recuperável aos autorizados. Referências e privacidade acompanham o destino.

**Atenção / limite:** Não gravar em diretório arbitrário a partir de caminho fornecido pelo usuário. Preservar a regra de recurso compartilhado e não apresentar cópia como simples movimento.

---
<a id="pacotes"></a>
## 8. Portal Institucional — pacotes detalhados, coordenados pela seção 13

Não estimar dias/horas antes do diagnóstico do código. Cada pacote entrega operação, persistência, tela, controle de acesso e teste; não se encerra só com componentes visuais. Reaproveitar funções comprovadas, sem reimplementá-las apenas para seguir a ordem da tabela.

| Pacote | Entrega | IDs principais | Evidência de saída |
|---|---|---|---|
| **P0 — Diagnóstico e decisões** | Arquitetura, fontes compartilhadas, roteamento público/privado e registro das dúvidas 54/75/118. | Todos, para classificação inicial. | Mapa real de código, dependências e plano de alterações incrementais. |
| **P1 — Base pública/privada e dados** | Permissões, persistência, publicação dinâmica, idioma e coerência CMS/site. | 1–6, 16–19. | Conteúdo editável persistido; público anônimo e administração protegida. |
| **P2 — Repositório e objetos** | Árvore, privacidade, upload, prefixo, renomear, mover e excluir recursos. | 124–134; integração com 5. | F-REP completo com bytes em nuvem e acesso protegido. |
| **P3 — Menus, páginas e editor** | Árvore de menus, campos/ações, URL automática, editor completo e bloqueio público de inativo. | 20–35; uso de 15. | F-CMS e F-EDITOR nas páginas, inclusive prévia privada. |
| **P4 — Agendas** | Categorias, agenda, ocorrência, relação indireta e configuração dos componentes. | 36–48. | F-AGENDA e envio de ocorrência preparado pelo mecanismo da newsletter. |
| **P5 — Notícias e galerias** | Cadastros, editor nas notícias, limites, mídias e vínculos reutilizados. | 49–65. | F-NOT/F-GAL; arquivo preservado após remover item da galeria. |
| **P6 — Questionários e enquetes** | Tipos de pergunta, opções/ordem, revisão, janela, prorrogação e resultados. | 66–92. | F-PESQ com respostas persistidas e configurações independentes; 75 continua pendente até definição. |
| **P7 — Newsletter** | Componente público, inscrições, mensagens, motivos, indicadores e gráficos. | 93–103; envios 47/52/59. | F-NEWS com 9/4/8/3 e recebimento em caixas autorizadas. |
| **P8 — Links e telefones** | Acessos rápidos, redes sociais, links úteis, telefones e seus controles. | 104–123. | F-LINKS/F-ORD e limites 1–12/1–6. |
| **P9 — Acessibilidade e ordem transversal** | Semântica, alternativas, atalhos, áudio descrição e arraste acessível. | 7–15; 100/103/111 nos contextos específicos. | F-ACE/F-AUDIO e testes nos navegadores citados. |
| **P10 — Ensaio e regressão** | Verificação individual, múltiplas sessões, dispositivos, dependências e revisão das pendências. | Todos os 134. | Matriz real, arquivos alterados e evidências reproduzíveis. |

A ordem é técnica, não autorização para adiar acessibilidade e integridade até o final. Construir uma tela-piloto do CMS e uma página pública antes de replicar o padrão. Implementar a interface de envio da newsletter cedo para que 47/52/59 não fiquem botões sem efeito; concluir a prova de entrega após configurar o serviço real.

<a id="testes"></a>
## 9. Portal Institucional — testes e evidências

### 9.1 Verificações transversais

| Teste | Resultado esperado |
|---|---|
| Persistência e publicação | Salvar, fechar sessão e consultar noutra sessão recupera o mesmo registro; atualização editorial não exige deploy. |
| Público/privado | Leitura pública não exige conta; administração/API/preview privado recusam visitante. |
| Página inativa | URL direta, menu, API e cache da aplicação não entregam o conteúdo inativo ao visitante. |
| Objetos em nuvem | Arquivos reais enviados e abertos no serviço configurado; emulador identificado separadamente. |
| Repositório e privacidade | Alterar/mover/inativar conserva dados e aplica permissão efetiva, inclusive a referências públicas e rotas antigas. |
| Arquivo compartilhado | Remover item de galeria mantém arquivo e demais usos; excluir arquivo exige tratamento dos vínculos. |
| Menu com dependentes | Ação Excluir oculta; chamada direta recusada; filhos inativos e concorrência considerados. |
| Hierarquia | Pai/filho e indentação corretos; movimento para descendente recusado; todos os nós alcançáveis. |
| Ordenação | Arraste persistido e refletido na publicação; conjunto maior que a página não perde ordem; alternativa por teclado disponível. |
| Editor | 23 recursos testados em página e notícia, com persistência e saída correspondente. |
| Segurança do conteúdo | URLs/código ativo indevidos não executam; formatação legítima requerida é preservada. |
| Agendas | Relação por categoria: duas agendas com dois eventos cada e três eventos distintos; mudança de categoria produz 2/1 no cenário. |
| Configuração de agenda | Carrossel, visíveis, por página, agenda, modo e situação têm efeitos distintos. |
| Notícias | Sete cadastradas, três destaques; componentes respeitam limites 5/2/3 sem apagar registros. |
| Galerias | Foto, áudio e vídeo reais; capa/tipo/situação; imagem do repositório; alternativas acessíveis. |
| Pesquisas | Três tipos, obrigatório/opcional, mínimo de duas opções, revisão, janela e extensão no prazo. |
| Respostas e estatística | Quatro respostas por instrumento; Q1=2/1/1; Q2=2/3; participantes diferentes de marcações; reenvio técnico não duplica. |
| Publicidade de resultados | Controles não são apenas visuais; payload público não expõe dados absolutos/privados cuja visualização foi desabilitada. |
| Newsletter — indicadores | F-NEWS gera ativos 9, novas em 7 dias 4, novas em 30 dias 8, canceladas em 30 dias 3. |
| Newsletter — gráficos | Motivos 2/1; meses 1/0, 1/0, 4/0, 6/3; alterações posteriores não mudam eventos passados. |
| Newsletter — envio | Ocorrência/notícia/galeria utilizam modelo e destinatários corretos; inativos suprimidos; recepção conferida em caixas autorizadas. |
| E-mail com falha | Operação de conteúdo permanece salva; envio falho/ambíguo é registrado e tratado sem falso recebimento. |
| Áudio descrição | Três telas citadas têm orientação sonora específica, reprodução/pausa e texto equivalente. |
| Acesso rápido | 1–12 total e 1–6 por linha, inclusive bordas; inválidos recusados; celular conserva os acessos. |
| Links e telefones | Cadastro/edição/ordem/situação funcionam; URL abre no comportamento escolhido; sem APIs externas inventadas. |
| Upload múltiplo | Prefixo concatenado, renomeação imediata de vários arquivos e resultado por item; nome não permite gravar caminho arbitrário. |
| Paginação | F-PAG 23 registros em 10/10/3; busca global; filtros preservados; lista completa não para na primeira página. |
| Acessibilidade | Semântica, alt, áudio/transcrição, vídeo/descrição, atalhos, contraste e fonte executados, não somente declarados. |
| Navegadores/dispositivos | Cobertura real registrada para Chrome, Firefox, Opera, Edge e Safari e classes de dispositivo citadas. |
| UX | CMS compacto e legível; público editorial acessível; exceções de rolagem delimitadas; sem conteúdo cortado. |

Testes negativos devem ser isolados e não utilizar dados reais ou produção sem autorização. Registrar resultados observados, não copiar os números esperados para a evidência sem executar o software.

### 9.2 Matriz individual a ser preenchida pelo agente

Uma linha por **POR-001 a POR-134**. Estado inicial não significa implementação pronta. As duas referências divergentes e a fonte incompleta recebem marcação explícita; o restante começa sem teste executado.

| ID | Estado inicial | Tela / rota real | Serviço / persistência | Teste executado e evidência | Dependência / ressalva |
|---|---|---|---|---|---|
| POR-001 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-002 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-003 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-004 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-005 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-006 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-007 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-008 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-009 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-010 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-011 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-012 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-013 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-014 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-015 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-016 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-017 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-018 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-019 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-020 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-021 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-022 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-023 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-024 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-025 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-026 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-027 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-028 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-029 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-030 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-031 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-032 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-033 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-034 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-035 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-036 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-037 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-038 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-039 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-040 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-041 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-042 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-043 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-044 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-045 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-046 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-047 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-048 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-049 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-050 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-051 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-052 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-053 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-054 | INTERPRETACAO_A_CONFIRMAR | A mapear | A mapear | Não executado | Q-P01 — agenda dentro de Notícias |
| POR-055 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-056 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-057 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-058 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-059 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-060 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-061 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-062 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-063 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-064 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-065 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-066 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-067 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-068 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-069 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-070 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-071 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-072 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-073 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-074 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-075 | AGUARDA_DEFINICAO | A mapear | A mapear | Não executado | Q-P02 — objeto de remoção não informado |
| POR-076 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-077 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-078 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-079 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-080 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-081 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-082 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-083 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-084 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-085 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-086 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-087 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-088 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-089 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-090 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-091 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-092 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-093 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-094 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-095 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-096 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-097 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-098 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-099 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-100 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-101 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-102 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-103 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-104 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-105 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-106 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-107 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-108 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-109 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-110 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-111 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-112 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-113 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-114 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-115 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-116 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-117 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-118 | INTERPRETACAO_A_CONFIRMAR | A mapear | A mapear | Não executado | Q-P03 — rede social dentro de Links Úteis |
| POR-119 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-120 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-121 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-122 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-123 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-124 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-125 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-126 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-127 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-128 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-129 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-130 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-131 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-132 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-133 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |
| POR-134 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnosticar fontes e implementação |

**Estados de execução sugeridos:** `A_VERIFICAR`, `EXISTE_NAO_TESTADO`, `A_IMPLEMENTAR`, `PARCIAL`, `VALIDADO_LOCAL`, `TESTADO_COM_SIMULADOR`, `INTEGRACAO_TESTADA_HOMOLOGACAO`, `DEPENDENCIA_SERVICO`, `DEPENDENCIA_OUTRO_MODULO`, `AGUARDA_DEFINICAO`, `INTERPRETACAO_A_CONFIRMAR`.

Usar duas colunas/observações quando necessário para distinguir **código implementado** de **integração testada**. Não transformar `TESTADO_COM_SIMULADOR` em aprovação da contraparte nem contar item sem definição como validado.

Cada evidência deve conter ID, papel do usuário, estado inicial, dados de ensaio, ação, resultado observado, persistência, rota/tela real, serviços usados e arquivo/mensagem gerados quando pertinente. Captura de tela complementa, mas não prova sozinha, gravação, privacidade ou envio. Registrar viewport e navegador nos testes de interface.

Entregar ao usuário os arquivos efetivamente alterados, migrations, comandos de instalação/teste realmente verificados no repositório, modo de acesso e pendências. Um caminho como `docs/poc/portal-institucional-status.md` é sugestão de organização, não arquivo cuja existência foi confirmada.

### 9.3 Condição para encerrar

Encerrar um item quando as ações previstas puderem ser executadas e seus efeitos comprovados. No conjunto 30/51, não aceitar editor incompleto; em 35, esconder só menu não basta; em 48, vínculo direto evento→agenda não substitui categoria; em 65, excluir mídia junto com o item é falha; em 100/103/111, texto sem áudio não fecha o requisito.

O número 75 permanece dependente de complemento da fonte. Para 54/118, mostrar o que foi efetivamente implementado, conservar a frase e registrar a interpretação. **Não concluir “134/134 atendidos” apenas por possuir 134 cabeçalhos ou marcar todas as linhas no código.** Validação técnica interna não é homologação da comissão nem auditoria dos outros módulos do edital.

<a id="pendencias"></a>
## 10. Portal Institucional — definições e ressalvas da fonte

### Q-P01 — POR-054: “categoria de agenda” no bloco de Notícias

A frase literal pede título e situação de categoria de **agenda**, embora esteja em Notícias. Implementar os campos no cadastro de agenda para preservar o texto e manter categorias de notícia próprias conforme 53. Confirmar o objeto que será avaliado no contexto de Notícias. Não fundir as categorias nem reescrever a citação silenciosamente.

### Q-P02 — POR-075: frase incompleta

Texto integral: **“Possuir função para remover”**. A página 316 não informa objeto, condição ou consequência. Pedir esclarecimento do complemento. Os itens 77/78 já descrevem exclusão de questão/alternativa; podem compartilhar infraestrutura futura, mas não permitem afirmar o significado de 75. Manter `AGUARDA_DEFINICAO` até existir base suficiente.

### Q-P03 — POR-118: “rede social” no bloco de Links Úteis

A frase repete a ordenação de **rede social** sob Links Úteis. Preservar a ordenação de redes do item 114 e a ordem de links pelo mecanismo geral de 15; documentar as duas demonstrações. Confirmar a correspondência esperada na avaliação, sem alterar a frase ou criar uma terceira coleção.

### Q-P04 — W3C, acessibilidade e teclas

O TR cita padrões W3C sem identificar especificação, versão, nível, ferramenta de validação ou combinações de atalhos. Implementar e demonstrar os recursos expressos dos itens 7–14 e registrar a matriz de testes. Eventual exigência específica deve ser confirmada, sem transformar a fonte em uma lista nova de certificações. Os valores visuais deste MD são diretrizes do usuário/projeto.

### Q-P05 — Publicidade das pesquisas e política de respostas

O texto diferencia consulta pública, resultado parcial e contagem de votos, mas não define todos os cruzamentos, autenticação de participantes, unicidade por pessoa ou exposição de textos. A seção 4.8 apresenta interpretação operacional de teste, não confirmação formal. Definir a política com a Administração, preservando os controles independentes. Não liberar dados restritos só porque “o questionário é público”.

### Q-P06 — Métricas, inscrição e cancelamento de newsletter

Identificar o fuso, definição de janela e tratamento de reinscrição/confirmação já adotados. O ensaio usa eventos e intervalos móveis explicitados para produzir resultados verificáveis. Novas inscrições/cancelamentos não se inferem apenas do estado atual. A mensagem de confirmação pode informar a inscrição realizada; não há determinação expressa de double opt-in neste bloco.

### Q-P07 — Infraestrutura de nuvem e e-mail

Localizar provedor, credenciais, remetente autorizado, domínio/rota pública, execução de envios e caixas de teste. Não gravar segredos no Markdown/código nem contatar pessoas reais. Simuladores podem testar o contrato, mas a evidência de nuvem e recebimento depende do serviço real em ambiente autorizado. Não recriar provedor de e-mail ou comprar serviços sem necessidade/decisão do usuário.

### Q-P08 — Tipos de arquivo, tamanho, hierarquia e privacidade

A fonte não fornece todos os formatos permitidos, tamanhos máximos, política de exclusão/retenção, herança de privacidade ou intervalo de cache. Adotar configuração existente ou decisão técnica documentada, respeitando os tipos de mídia exigidos e a privacidade. A solução não pode alegar revogação instantânea se deixa URL bruta pública ou um link temporário ainda válido sem controle pertinente.

### Q-P09 — Alcance de “todas as ordenações”

POR-015 usa expressão ampla. Este plano distingue reordenação editorial persistida de ordenação temporária de consulta e exige arraste nas coleções ordenáveis. Registrar a distinção e confirmar alcance adicional se necessário; não omitir arraste em menus/opções/acessos/redes/telefones explicitamente descritos. Alternativa por teclado é complemento de acessibilidade, não dispensa do gesto.

<a id="fontes"></a>
## 11. Portal Institucional — conferência documental e fontes

### 11.1 Resultado da composição

| Verificação | Resultado |
|---|---:|
| Entradas numeradas preservadas | 134 |
| Citações individuais do TR | 134 |
| Implementação, demonstração, aceite, dependências e limites | 134 conjuntos |
| IDs ausentes ou adicionados ao bloco | 0 |
| Divergências entre duas extrações textuais do recorte após normalização de espaços/quebras | 0 |
| Recursos do checklist WYSIWYG | 23, repetidos nos dois contextos exigidos |
| Entrada cuja frase não informa objeto da ação | 75 |
| Entradas com referência divergente do subtítulo | 54 e 118 |

As citações foram extraídas e comparadas com dois mecanismos de leitura do PDF. As páginas **310, 314, 316, 319 e 320** foram renderizadas; as cinco imagens foram inspecionadas para conferir estrutura, início, término e as redações problemáticas. A delimitação final do bloco foi também conferida no texto da página 320, antes de Sistema Integrado de Custos. Os links de navegação e a presença dos seis campos de cada item foram verificados programaticamente. Os cálculos das fixtures e a cobertura de todos os IDs pelos pacotes foram conferidos separadamente.

A conferência de transcrições não prova implementação ou aprovação formal. O relatório de execução começa vazio quanto ao funcionamento real. A entrada 7 é introdutória; a 75 é incompleta; as 54/118 mantêm ressalvas textuais. Não converter essas naturezas distintas em promessa de 134 funções independentes já demonstráveis.

### 11.2 Fontes e prevalência

- **TR-PORTAL:** `termo de referencia (Ratificado)(1).pdf`, 335 páginas, Processo Administrativo nº 1026/2026, seção 19, Portal Institucional, **pp. 310–320**, itens 1–134. Fonte exclusiva das transcrições e do escopo funcional específico.
- **UX-BASE:** padrão já definido nesta conversa e no `CeleriFlow_POC_Almoxarifado_Patrimonio_Desenvolvimento_REV02.md`: gerenciador estruturado, paginação real, fonte legível, preservação do contexto e teste de execução. Aqui o site público foi distinguido do CMS para preservar seu uso editorial.
- **CANAL E DEPENDÊNCIAS:** orientações do usuário desta conversa: mesmo site no Chrome do celular e dados/serviços de outros módulos destacados, sem reconstruir a origem.

Não foram incorporados conteúdos de outros portais como requisitos, nem pesquisa externa para completar frases ou substituir a redação do TR. Eventuais nomes de entidades, telas, estados, fórmulas estatísticas e roteiros de áudio são propostas de implementação/ensaio expressamente identificadas. Não houve inspeção do repositório ou medição do software nesta elaboração.

**Prevalência:** o TR ratificado é a fonte dos requisitos. A implementação deve produzir seus resultados, preservar os itens e registrar divergências. As demonstrações propostas não são roteiro oficial da comissão.

**Entrega do bloco POR:** Portal Institucional dinâmico integrado ao CeleriFlow, CMS privado e site público utilizáveis, dados persistidos, mídias reais, newsletter comprovada e evidências por ID, com pendências da fonte/serviços separadas. **A entrega conjunta inclui também o bloco PTR abaixo e só encerra conforme a seção 13.** Não entregar somente uma nova versão deste planejamento.

---
<a id="transparencia"></a>
## 12. Portal da Transparência — módulo próprio no desenvolvimento conjunto

**Fonte:** TR ratificado, páginas 145–149, itens 1–51. O bloco inicia depois de ISS Bancário e termina antes de Controle Interno. Somente os campos **TR** dos itens abaixo são transcrições; títulos, contratos, cenários e campos auxiliares são orientações técnicas de desenvolvimento.

**Navegação desta seção:** [Lista dos 51 itens](#ptr-lista) · [Origens dos dados](#ptr-origens) · [Contratos operacionais](#ptr-contratos) · [Dados de teste](#ptr-base) · [Item a item](#ptr-itens) · [Matriz de execução](#ptr-matriz) · [Pendências](#ptr-pendencias) · [Plano conjunto](#plano-conjunto).

### 12.1 Limites e estrutura de telas

O acesso administrativo da Transparência deve organizar **Identidade e menus**, **Informações institucionais**, **Dados da gestão**, **Documentos e publicações**, **E-SIC** e **Migração/integrações**. São áreas do módulo, não produtos independentes. Diagnóstico de integração pode permanecer na área técnica existente; não precisa virar uma nova central de monitoramento comercial.

A área pública terá menus claros para **Despesas**, **Receitas**, **Repasses e convênios**, **Compras, licitações e contratos**, **Patrimônio e almoxarifado**, **Servidores e remuneração**, **Diárias e passagens**, **Programas e obras**, **Planejamento e prestação de contas**, **E-SIC/SIC físico** e **Informações e ajuda**. A disposição é proposta; preservar a estrutura equivalente existente sem esconder assuntos expressamente requeridos.

**Telas tabulares:** filtros compactos, tabela paginada, totais do recorte com unidade e etapa claramente identificadas, botão de ficha e exportação. **Fichas:** grupos de dados ou abas sem perder os campos mínimos. **Páginas e documentos:** leitura integral com rolagem natural quando necessária. O usuário pediu eficiência e legibilidade, não ocultação de informação para caber na tela.

Aplicar a fonte e os tokens da seção 5. No gerenciador e nas tabelas públicas, usar corpo de referência 14/20 px; páginas explicativas podem usar 16/24 px. Testar 1366×650, 1440×800 e 1920×900 CSS px, celular real, zoom e teclado. Não duplicar o framework visual nem criar uma terceira família tipográfica.

<a id="ptr-lista"></a>
### 12.2 Lista completa dos 51 itens — ordem original

| ID / item do TR | Ação resumida | Página do PDF |
|---|---|---:|
| [PTR-001 / 1](#ptr-001) | Portal da Transparência responsivo | 145 |
| [PTR-002 / 2](#ptr-002) | Disponibilidade web e acessos simultâneos | 145–146 |
| [PTR-003 / 3](#ptr-003) | Identidade visual própria da Transparência | 146 |
| [PTR-004 / 4](#ptr-004) | Informações das unidades gestoras publicantes | 146 |
| [PTR-005 / 5](#ptr-005) | Glossário da Transparência | 146 |
| [PTR-006 / 6](#ptr-006) | Seção Fale Conosco | 146 |
| [PTR-007 / 7](#ptr-007) | Ferramentas de acessibilidade na Transparência | 146 |
| [PTR-008 / 8](#ptr-008) | Mapa do site da Transparência | 146 |
| [PTR-009 / 9](#ptr-009) | Perguntas frequentes da Transparência | 146 |
| [PTR-010 / 10](#ptr-010) | Manual de navegação | 146 |
| [PTR-011 / 11](#ptr-011) | Legislação de referência do portal | 146 |
| [PTR-012 / 12](#ptr-012) | Estrutura organizacional pública | 146 |
| [PTR-013 / 13](#ptr-013) | Informações das unidades administrativas | 146 |
| [PTR-014 / 14](#ptr-014) | Carta de Serviços do Executivo | 146 |
| [PTR-015 / 15](#ptr-015) | Planos, orçamentos e prestações de contas publicados | 146 |
| [PTR-016 / 16](#ptr-016) | Execução orçamentária e financeira em tempo real | 146 |
| [PTR-017 / 17](#ptr-017) | Consulta por despesa empenhada, liquidada e paga | 146–147 |
| [PTR-018 / 18](#ptr-018) | Ficha da despesa com todos os campos mínimos | 147 |
| [PTR-019 / 19](#ptr-019) | Etapas relacionadas à mesma despesa | 147 |
| [PTR-020 / 20](#ptr-020) | Dados mínimos do pagamento | 147 |
| [PTR-021 / 21](#ptr-021) | Dados mínimos do empenho | 147 |
| [PTR-022 / 22](#ptr-022) | Orçamento e execução da receita | 147 |
| [PTR-023 / 23](#ptr-023) | Estágios da receita | 147 |
| [PTR-024 / 24](#ptr-024) | Repasses e transferências financeiras | 147 |
| [PTR-025 / 25](#ptr-025) | Convênios e instrumentos congêneres | 147 |
| [PTR-026 / 26](#ptr-026) | Compras realizadas com itens e valores | 147 |
| [PTR-027 / 27](#ptr-027) | Contratos e aditivos na íntegra | 147 |
| [PTR-028 / 28](#ptr-028) | Licitações, dispensas e inexigibilidades | 147 |
| [PTR-029 / 29](#ptr-029) | Informações dos bens patrimoniais | 147–148 |
| [PTR-030 / 30](#ptr-030) | Entradas e saídas do almoxarifado | 148 |
| [PTR-031 / 31](#ptr-031) | Menu de servidores e informações funcionais | 148 |
| [PTR-032 / 32](#ptr-032) | Valores bruto, líquido, descontos e vencimentos | 148 |
| [PTR-033 / 33](#ptr-033) | Diárias com beneficiário, viagem e valor | 148 |
| [PTR-034 / 34](#ptr-034) | Informações sobre passagens | 148 |
| [PTR-035 / 35](#ptr-035) | E-SIC com recurso, estatística e publicação | 148 |
| [PTR-036 / 36](#ptr-036) | SIC físico do município | 148 |
| [PTR-037 / 37](#ptr-037) | Publicação do CAFIMP | 148 |
| [PTR-038 / 38](#ptr-038) | Links para outros portais e sites | 148 |
| [PTR-039 / 39](#ptr-039) | Programas, projetos e ações | 148 |
| [PTR-040 / 40](#ptr-040) | Obras públicas municipais | 148 |
| [PTR-041 / 41](#ptr-041) | Inserção dos relatórios de planejamento e contas | 148 |
| [PTR-042 / 42](#ptr-042) | Documentos do Controle Interno | 148 |
| [PTR-043 / 43](#ptr-043) | Publicação de documentos no portal | 148 |
| [PTR-044 / 44](#ptr-044) | Seleção de entidades e menus exibidos | 148–149 |
| [PTR-045 / 45](#ptr-045) | Ativação e desativação de menus nativos | 149 |
| [PTR-046 / 46](#ptr-046) | Filtros e busca por palavra-chave | 149 |
| [PTR-047 / 47](#ptr-047) | Upload administrativo e download de documentos | 149 |
| [PTR-048 / 48](#ptr-048) | Exportação em formatos abertos e analisáveis | 149 |
| [PTR-049 / 49](#ptr-049) | Exportações PDF, XLS, XLSX, RTF e CSV | 149 |
| [PTR-050 / 50](#ptr-050) | Migração de pelo menos seis meses | 149 |
| [PTR-051 / 51](#ptr-051) | Integração com os seis grupos de sistemas da gestão | 149 |

<a id="ptr-origens"></a>
### 12.3 Dados de outros módulos e serviços compartilhados

As origens são **responsabilidades previstas**, a confirmar no código. O quadro não afirma que as integrações já estejam prontas. Os códigos **TDEP** são próprios desta seção, sem conflitar com os **DEP** do Institucional.

| Código | Origem prevista | Informação consumida | Limite desta entrega |
|---|---|---|---|
| **TDEP-01** | Administração, Cadastro Geral e Organograma | Entidades, unidades gestoras, estrutura, responsável, endereço, telefone, horários, usuários e permissões. | Ler os cadastros existentes e manter metadados de publicação; não criar outro organograma operacional. |
| **TDEP-02** | Contabilidade Pública | Empenhos, liquidações, classificações, fontes, histórico, orçamento e estágios de receita. | Projetar dados autorizados; nunca efetuar lançamento/ajuste contábil no portal. |
| **TDEP-03** | Gestão Financeira e Tesouraria | Pagamentos, recebimentos, repasses, transferências e suas referências aos atos de origem. | Não iniciar pagamentos, emitir remessa bancária ou publicar dados bancários privados por analogia. |
| **TDEP-04** | Planejamento Municipal / Contabilidade | PPA, LDO, LOA, programas, projetos, ações, RGF, RREO, prestações de contas e versões aprovadas. | Publicar documentos/dados; não recalcular ou elaborar esses instrumentos neste pacote. |
| **TDEP-05** | RH e Folha de Pagamento | Identificação funcional, matrícula, cargo, admissão, carga horária, lotação, vencimentos, bruto, descontos e líquido por competência. | Consumir a folha efetiva; não criar novo processamento de folha ou holerite público integral. |
| **TDEP-06** | Gestão de Tributos | Dados de arrecadação e classificação fiscal autorizados, com referência de origem e conciliação com a Contabilidade. | Não expor extrato fiscal privado nem contar a mesma arrecadação duas vezes por vir de duas fontes. |
| **TDEP-07** | Compras, Licitações, Contratos e Convênios / Gestão Administrativa | Aquisições e itens, processos, dispensas, inexigibilidades, contratos, aditivos, convênios, editais, atas e impedimentos registrados. | Ler e publicar; não julgar certame, criar sanção ou substituir um cadastro por presunção. |
| **TDEP-08** | Patrimônio | Identificação e informações publicáveis dos bens municipais. | Não tombar, baixar ou depreciar bens pelo portal. |
| **TDEP-09** | Almoxarifado | Entradas, saídas, datas, materiais, quantidades/unidades e órgão de origem. | Não gerar movimentos de estoque nem alterar saldos nesta entrega. |
| **TDEP-10** | Diárias/Viagens, RH, Financeiro ou Gestão Administrativa, conforme existente | Beneficiário, cargo, valores, período, destino, motivo e passagens. | Identificar a fonte real; não impor um módulo de viagens novo. |
| **TDEP-11** | Obras/Infraestrutura e Contratos, conforme existente | Informações publicáveis das obras e referências de projeto/contrato. | Não executar medição, fiscalização ou engenharia no portal. |
| **TDEP-12** | Controle Interno | Instruções, auditorias, recomendações e pareceres destinados à publicação. | Não publicar automaticamente anexos restritos nem gerar auditoria neste pacote. |
| **TDEP-13** | E-SIC/Processos/Ouvidoria, se existir | Pedido de informação, recurso, resposta, situação, protocolo e histórico. | Adaptar o acesso e a publicação do E-SIC; não confundir com enquete ou criar Ouvidoria geral paralela. |
| **TDEP-14** | CMS, Repositório/GED e objetos em nuvem compartilhados | Conteúdo, arquivos, modelos de páginas, versão, privacidade e bytes para download. | Mesma infraestrutura de POR; referências e autorizações por publicação/portal. |
| **TDEP-15** | Relatórios/Exportação, Autenticação, Auditoria e serviços web do núcleo | Sessão administrativa, permissões, filtros, geração de arquivos e rastreabilidade. | Reutilizar os componentes; a exportação é dos dados públicos, não acesso ao banco por consulta livre. |
| **TDEP-16** | Sistema legado e arquivos de migração fornecidos | Histórico mínimo de seis meses, chaves de origem, documentos e dados de referência. | Construir importação mapeada de migração; não prometer integração com fornecedor não identificado. |

**Consulta integrada não é acesso direto do navegador ao banco.** Reutilizar serviços ou visões de leitura aprovados na arquitetura real, com validação no servidor e seleção explícita de campos públicos. Um banco comum não dispensa mapeamento de responsabilidade, etapa, entidade, exercício e competência.

Se a origem estiver ausente, registrar `DEPENDENCIA_OUTRO_MODULO`, o ID afetado e o contrato/dado faltante; desenvolver o consumidor e continuar os itens independentes. Arquivos de demonstração podem testar mapeamento, mas não autorizam marcar PTR-051 integrado. Campos editoriais e o upload manual exigido em PTR-047 continuam implementáveis sem reconstruir a origem.

**Fronteira do E-SIC:** se houver serviço existente, acionar suas operações reais e registrar lacunas. Se não houver núcleo separado, implementar no domínio de atendimento da Transparência o mínimo do PTR-035 — pedido, recurso, resposta, estatística e publicação — sem criar outro produto de Ouvidoria. A falta de serviço compartilhado não torna essa função opcional.

<a id="ptr-contratos"></a>
### 12.4 Contratos operacionais do módulo

#### A. Publicação editorial versus publicação estruturada

As informações descritivas, legislação, manual, SIC físico e Carta de Serviços podem utilizar o CMS. Documentos podem ser publicados por upload administrativo, com tipo, entidade, exercício/competência quando pertinentes e versão. **Isso não substitui consultas estruturadas nem integração em tempo real da execução.**

Uma ficha de despesa deve partir do ato contábil correspondente, não de um texto digitado no editor. A edição de uma notícia pode mudar o texto da notícia; a edição da apresentação da Transparência não pode mudar o valor de um empenho. As operações de origem continuam no módulo competente.

#### B. Identidade dos fatos e consistência dos totais

Mapear a chave efetiva da origem, incluindo sistema, unidade gestora, exercício, espécie e ID quando necessários. Número 001/2026 pode existir em duas unidades: não fundir os registros. Identificadores e relações são persistidos; nome do favorecido ou igualdade de valor/data não identificam sozinhos um evento.

Empenhado, liquidado e pago são medidas distintas. **Não somar 18.000 empenhados + 9.000 liquidados + 6.300 pagos e chamar 33.300 de despesa total.** Exibir medidas identificadas e o período/critério usados. Repetição de eventos ou uma relação com vários itens/documentos não multiplica o valor do empenho.

Uma despesa pode possuir várias liquidações e pagamentos parciais. Ficha e etapas relacionadas precisam recuperar todos, inclusive além da primeira página. Os valores do ato, do período e acumulados devem ser rotulados de forma diferente. Correções e anulações publicáveis já registradas na origem são refletidas sem apagar o vínculo histórico ou recalcular regras contábeis no portal.

Receita prevista, arrecadada, transferida e qualquer outro estágio exposto pela origem permanecem distinguíveis. Contabilidade e Tributos podem referenciar a mesma arrecadação: selecionar uma fonte de totalização e preservar a conciliação, sem união aditiva de registros duplicados. Valor contratado não se soma ao valor de pagamento para representar gasto adicional.

#### C. Atualização e prova de integração em tempo real

Priorizar leitura atual da fonte autorizada ou publicação acionada após a confirmação do evento, conforme a arquitetura existente. Invalidar caches relacionados. Rotina exclusivamente manual ou atualização apenas por um arquivo preparado para a POC não demonstra PTR-016.

Registrar o momento da atualização na origem e da disponibilidade pública e medir a latência em teste. **O TR não fixa, nesse item, uma quantidade de segundos; este MD não inventa um prazo legal.** Confirmar o critério aplicável com a Administração, sem usar a ausência de número para aceitar publicação indefinidamente desatualizada.

Fonte indisponível deve produzir estado de falha/indisponibilidade ou última posição conhecida claramente datada, conforme o mecanismo adotado; não mostrar “zero” ou “sem registros” como se a consulta atual tivesse sido bem-sucedida. Simulador demonstra o consumidor, não integração real. O teste final altera um fato no módulo de origem e verifica sua chegada ao portal sem redigitação nem deploy.

#### D. Campos mínimos da ficha de despesa — checklist de PTR-018

Todos os componentes abaixo precisam estar acessíveis na **ficha individual**, mesmo que não caibam como colunas da listagem. São 19 verificações derivadas da frase do TR:

| Nº | Informação | Conferência |
|---|---|---|
| 1 | Entidade | Mesma unidade publicante da origem. |
| 2 | Número da despesa | Identidade correta, sem confundir com pagamento ou contrato. |
| 3 | Tipo da despesa | Significado visível e coerente com o ato. |
| 4 | Ano da despesa | Não substituído pelo ano atual da interface. |
| 5 | Data da despesa | Data do fato correspondente. |
| 6 | Número do processo | Referência de processo pertinente. |
| 7 | Valor da despesa | Valor do ato, não soma indevida das etapas. |
| 8 | Nome do favorecido | Registro publicável da origem. |
| 9 | CPF ou CNPJ com possibilidade de máscara | Máscara aplicada antes da resposta pública, inclusive exportação. |
| 10 | Órgão | Não confundir com unidade orçamentária. |
| 11 | Unidade orçamentária | Código/descrição conforme cadastro real. |
| 12 | Função | Recuperada da classificação. |
| 13 | Subfunção | Recuperada da classificação. |
| 14 | Programa | Referência existente. |
| 15 | Projeto ou atividade | Campo correspondente ao ato. |
| 16 | Elemento da despesa | Referência existente. |
| 17 | Subelemento | Exposto quando registrado; ausência não recebe código inventado. |
| 18 | Fonte de recurso | Mesma informação da origem. |
| 19 | Histórico da despesa | Conteúdo publicável integralmente recuperável. |

Mapear campos faltantes e responsabilidade por preenchimento. Um traço indicando falta de dado não comprova que a informação mínima foi fornecida; a base de teste deve preencher o conjunto completo. Este checklist não autoriza inventar classificações oficiais para dados reais.

#### E. Publicidade, máscara e anexos

Aplicar uma projeção pública explícita: somente campos e documentos destinados à publicação. Configurar a máscara de CPF/CNPJ e validar o mesmo comportamento na tela, no JSON, na pesquisa e nos arquivos. Não mascarar só o componente visual deixando o valor integral na resposta.

O acesso à folha é **consulta de remuneração**, não acesso ao Portal do Servidor, às credenciais, a dependentes, dados de saúde, conta bancária ou anexos individuais. Preservar os valores bruto, líquido, descontos e vencimentos exigidos, sem divulgar automaticamente motivos sensíveis de desconto. Confirmar a forma de apresentação da composição e o padrão de máscara em Q-T02.

Publicação de manifestação E-SIC exige seleção de conteúdo publicável e tratamento dos campos privados. PDF ou outro anexo também pode conter dados restritos: disponibilizar a versão de publicação autorizada e indicar sua relação com o original, sem prometer que um PDF alterado conserva a assinatura criptográfica do arquivo anterior.

As regras POR de privacidade do repositório continuam válidas. Publicar um documento na Transparência não libera sua pasta inteira. Desativar uma publicação não apaga o arquivo compartilhado em outro contexto autorizado; tornar o recurso globalmente privado deve restringir seus usos públicos conforme a política documentada.

#### F. E-SIC com fluxo demonstrável

Disponibilizar acesso fácil ao pedido de informação, acompanhamento do resultado, possibilidade de recurso, análise/resposta interna e estatística por período. Preservar identificação do pedido no recurso e sua trilha; recurso não vira um novo pedido para inflar o total recebido.

A nomenclatura mínima de ensaio usa **recebido/em atendimento, atendido e indeferido**, com recurso vinculado. Esses estados são dados de teste, não uma definição de prazo ou rito jurídico. Reutilizar os estados e prazos oficiais já configurados quando disponíveis. Identificar as equivalências da estatística sem converter “em recurso” silenciosamente em “atendido”.

Fale Conosco, formulário de newsletter e Ouvidoria genérica não comprovam o conjunto. Um link ao E-SIC existente pode ser ponto de entrada, mas o pedido, o recurso, a estatística e a publicação precisam funcionar no destino integrado e ser demonstrados. Não exigir API Fala.BR ou cadastro anônimo por suposição: o item não identifica plataforma nem regime de identificação.

#### G. Publicação documental, configuração e navegação

Reutilizar repositório e publicações com tipo/contexto, entidade, exercício/período quando pertinente, título e arquivo/versionamento. Campos são proposta de organização. O upload manual do PTR-047 deve existir mesmo quando houver integração para obter outros documentos. Prévia privada e arquivo público não podem compartilhar autorização por engano.

Configuração de entidades e menus aplica-se à **Transparência**, não à outra árvore. A exibição deve respeitar o filtro de entidades também nos dados e downloads, não somente no cabeçalho. Ocultar um menu não apaga dados da gestão; a política de acesso direto da consulta deve ser explicitada. Para a entrega proposta, uma consulta nativa desativada fica indisponível pela rota pública da Transparência, sem interferir no serviço interno da origem.

Registrar a decisão de habilitação/desabilitação e os itens afetados. Essa capacidade técnica não equivale a dispensa das publicações previstas no TR. Não usar menus desligados para declarar um módulo incompleto como concluído.

#### H. Exportações reais e migração

PTR-049 será demonstrado com **PDF, XLS, XLSX, RTF e CSV**, preservando os nomes da fonte. XLS é arquivo real desse formato, não CSV/HTML com extensão alterada; RTF é documento RTF válido. A decisão de demonstrar os cinco formatos evita que o plano reduza a lista citada a apenas PDF e Excel moderno.

O arquivo exportado inclui todo o recorte publicado, com colunas, unidades, período e totalização consistentes; não somente a página visível. Tratar texto e valores de forma segura, inclusive conteúdo que pudesse ser executado como fórmula em planilha. A máscara e a seleção de campos públicos precisam estar aplicadas também nessa etapa.

A migração importa dados do sistema de origem para a representação histórica compatível com a arquitetura definida. Preservar chaves, entidade, exercício/competência, datas, valores, categorias, documentos e referência de origem. Mapear formatos efetivamente fornecidos; não pressupor modelo de banco legado.

Usar preparação/validação antes de publicar: erros de referência, datas inválidas e duplicidade ficam em relatório. Reexecução do mesmo lote não duplica o histórico. Se houver atualização de dado migrado, sua política deve ser registrada. Não recontabilizar os seis meses nem lançar novamente fatos reais nos módulos operacionais. Um conjunto fictício de legado prova o importador; a migração real depende dos arquivos autorizados da origem.

<a id="ptr-base"></a>
### 12.5 Base fictícia e resultados de conferência

**Ambiente isolado “POC — dados fictícios”.** O usuário prepara os registros pelas telas ou rotinas de teste existentes dos módulos de origem. Não alimentar o portal com totais fixos para fingir a integração. Os valores abaixo são contas de ensaio, sem representar execução municipal real, classificação oficial ou obrigação legal.

#### F-T-ENT — entidades, navegação e informações

Criar duas entidades de ensaio, **UG-A — Prefeitura DEMO** e **UG-B — Fundo DEMO**, com responsável, endereço, telefone de teste e horário informados. Preparar estrutura organizacional com dois níveis, informações de unidades administrativas, Carta de Serviços demonstrativa, glossário, FAQ e manual coerente com as telas finais. Usar conteúdo institucional autorizado em produção, nunca os contatos fictícios da POC.

Manter árvores de menu independentes. Em teste, desativar somente a consulta de passagens da Transparência, conferir a rota pública conforme a política e reativar. Alterar cor/banner da Transparência e verificar que não se modificaram a notícia, a agenda e a ordem editorial do Institucional.

#### F-T-DESP — estágios, ficha e atualização

| Origem de ensaio | Unidade / empenho | Empenhado | Liquidado | Pago |
|---|---|---:|---:|---:|
| E-A1 | UG-A / 001-2026 | R$ 10.000,00 | R$ 6.000,00 | R$ 4.000,00 |
| E-A2 | UG-A / 002-2026 | R$ 5.000,00 | R$ 2.000,00 | R$ 1.500,00 |
| E-B1 | UG-B / 001-2026 | R$ 3.000,00 | R$ 1.000,00 | R$ 800,00 |
| **Total do conjunto** | **3 empenhos distintos** | **R$ 18.000,00** | **R$ 9.000,00** | **R$ 6.300,00** |

Período principal: **01/09/2026 a 30/09/2026**. Datas de ensaio: E-A1 em 01/09, E-A2 em 02/09 e E-B1 em 03/09; liquidações de E-A1 em 05/09 e 09/09, pagamentos em 10/09 e 12/09; liquidação de E-A2 em 08/09 e pagamento em 15/09; liquidação de E-B1 em 09/09 e pagamento em 17/09. O pagamento adicional do teste ocorre em 18/09. São datas de fixture, não datas oficiais.

Preencher os 19 dados da ficha de E-A1 com referências sintéticas apropriadas aos validadores e aos cadastros reais do ambiente de homologação. Cadastrar sua liquidação em **duas etapas de R$ 3.500,00 e R$ 2.500,00** e pagamentos de **R$ 2.000,00 + R$ 2.000,00**, vinculados às etapas correspondentes. Não atribuir o pagamento a outra unidade só porque ela repete o número 001-2026.

Conferência de UG-A: empenhado **R$ 15.000,00**, liquidado **R$ 8.000,00**, pago **R$ 5.500,00**. Em teste posterior, confirmar na Tesouraria mais **R$ 500,00** de pagamento válido de E-A1: seu pago passa a **R$ 4.500,00**; o total de UG-A passa a **R$ 6.000,00** e o consolidado a **R$ 6.800,00**. Empenhado e liquidado não mudam por causa desse pagamento. Repetir o evento técnico não soma outros R$ 500,00.

Executar consultas por data do estágio, deixando explícito o período. Esse teste mede propagação origem→portal; não simula pagamento bancário novo a partir da Transparência.

#### F-T-REC — receita e origem tributária

| Unidade | Receita prevista no recorte | Receita arrecadada no recorte |
|---|---:|---:|
| UG-A | R$ 12.000,00 | R$ 8.000,00 |
| UG-B | R$ 3.000,00 | R$ 2.000,00 |
| **Total** | **R$ 15.000,00** | **R$ 10.000,00** |

Dos R$ 8.000,00 de UG-A, preparar R$ 6.000,00 classificados como receita tributária demonstrativa e R$ 2.000,00 de outra natureza demonstrativa. O valor tributário pode ser referenciado por Tributos e Contabilidade, mas entra uma vez no total. Em ensaio separado, confirmar arrecadação de R$ 200,00 na cadeia existente: UG-A arrecadado **R$ 8.200,00**; total **R$ 10.200,00**; previsão permanece **R$ 15.000,00**. Explicitar estágios e referências; não expor débitos privados para demonstrar PTR-051.

#### F-T-ADM — publicações de gestão

Criar contrato CTR-DEMO-01 de **R$ 10.000,00** e aditivo demonstrativo de **R$ 1.000,00**, mantendo o valor original, o evento e o valor atualizado de **R$ 11.000,00** identificados conforme a origem. Esse cenário é independente de F-T-DESP: não soma R$ 11.000,00 aos pagamentos.

Criar convênio recebido de **R$ 20.000,00** e concedido de **R$ 5.000,00**, com beneficiário, objeto, vigências e valor. Na Tesouraria, repasse recebido de **R$ 4.000,00** e transferência concedida de **R$ 1.000,00**; divulgar o movimento financeiro, sem assumir que os valores totais dos instrumentos já foram repassados.

Preparar uma aquisição de **10 unidades × R$ 25,00 = R$ 250,00** e serviço de **4 horas × R$ 100,00 = R$ 400,00**, total **R$ 650,00**, sem confundir essas quantidades com saldos patrimoniais. Preparar processo licitatório, dispensa e inexigibilidade identificados, editais/atas quando existentes e documentos de resultado; não inventar documento administrativo como exigência de modalidade que não o utilize.

Usar dois bens municipais publicáveis, uma entrada e uma saída de almoxarifado, um programa com projeto/ação e uma obra de teste. Criar informação de impedimento de fornecedor na fonte autorizada, distinguindo-a de mero cadastro inativo. Esses dados devem ser consultáveis nas áreas correspondentes, sem funções de manutenção operacional no portal.

#### F-T-RH — remuneração, diárias e passagens

| Servidor de ensaio / competência 09-2026 | Unidade / matrícula | Vencimentos de teste | Bruto | Descontos | Líquido |
|---|---|---|---:|---:|---:|
| Servidor A — DEMO | UG-A / 001 | Base 4.500 + parcela demonstrativa 500 | R$ 5.000,00 | R$ 800,00 | R$ 4.200,00 |
| Servidor B — DEMO | UG-B / 001 | Base 3.800 + parcela demonstrativa 200 | R$ 4.000,00 | R$ 600,00 | R$ 3.400,00 |
| **Conferência** | **2 vínculos distintos** | — | **R$ 9.000,00** | **R$ 1.400,00** | **R$ 7.600,00** |

Preencher cargo, data de admissão, carga horária e secretaria de lotação. O valor de salário deve ter rótulo coerente com a fonte e não ser confundido com líquido. Informações de teste não definem rubricas nem regras reais de remuneração. Testar igual matrícula em duas unidades sem fusão de pessoas/vínculos e sem somar a folha de outro mês.

Registrar duas diárias efetivamente recebidas de **R$ 300,00** e **R$ 450,00**, total **R$ 750,00**, com beneficiário, cargo, período, destino e motivo. Uma passagem separada de **R$ 280,00** fica no menu de passagens; não deve virar terceira diária. Não expor conta bancária ou dados individuais privados apenas por existir viagem pública.

#### F-T-DOC — documentos manuais e reutilizados

Preparar documentos demonstrativos de PPA, LDO, LOA, RGF, RREO, prestação de contas, parecer prévio, versões simplificadas pertinentes, balancete mensal, contrato, aditivo, edital, ata e resultado. Preparar ainda instrução normativa, relatório de auditoria, recomendação e parecer de Controle Interno. Cada um possui tipo e contexto próprios; não apresentar o mesmo PDF vazio com 18 títulos diferentes.

Realizar upload por usuário autorizado **na administração da Transparência**, publicar, abrir em sessão anônima e baixar. Conferir primeiro e último trecho e integridade do arquivo. Quando um mesmo recurso também estiver publicado no Institucional, armazenar uma referência compartilhada; remover o vínculo de um portal não exclui o outro. Preparar separadamente um arquivo privado e comprovar bloqueio público direto.

#### F-T-SIC — pedido, recurso e estatística

Preparar quatro pedidos reais do ambiente de teste: **SIC-01 e SIC-02 atendidos; SIC-03 indeferido; SIC-04 em atendimento**. No primeiro corte: **4 recebidos, 2 atendidos, 1 indeferido e 1 ainda aberto**. Período e critério da contagem devem estar visíveis.

Apresentar recurso em SIC-03, ligado ao pedido original; recebidos continua **4**, não 5. Enquanto o recurso não for decidido, preservar e identificar a decisão existente e o recurso pendente, sem chamá-lo de atendimento concluído. Em ensaio posterior, decidir o recurso favoravelmente e responder: **4 recebidos, 3 atendidos, 0 indeferidos no estado final e 1 aberto**. Histórico conserva o indeferimento anterior.

Publicar somente a manifestação/versão selecionada e revisada, com tratamento de dados privados. O relato privado de SIC-04 e os contatos do requerente não aparecem na consulta pública nem na exportação estatística. Esse ensaio não impõe prazo ou rito jurídico não informado.

#### F-T-MIG — migração de seis meses

Lote legado fictício separado dos cenários anteriores, com chaves de origem e seis competências:

| Competência | Quantidade de registros de teste | Valor de referência |
|---|---:|---:|
| 04-2026 | 1 | R$ 100,00 |
| 05-2026 | 1 | R$ 200,00 |
| 06-2026 | 1 | R$ 300,00 |
| 07-2026 | 1 | R$ 400,00 |
| 08-2026 | 1 | R$ 500,00 |
| 09-2026 | 1 | R$ 600,00 |
| **Total** | **6 registros / 6 competências** | **R$ 2.100,00** |

Usar tipo de registro e campos compatíveis com o mapeamento de migração adotado, sem misturar empenho com pagamento no mesmo total. Importar, conferir competências, quantidades, valores e chaves, publicar e pesquisar cada mês. Reimportar: **6 registros e R$ 2.100,00**, não 12 e R$ 4.200,00. Lote separado com data inválida ou referência desconhecida deve apontar erros antes da publicação.

Se o legado tiver meses sem movimento, importar a cobertura e distinguir mês sem fatos de mês não fornecido. Os seis registros mínimos são fixture técnica, não prova de migração completa do legado real. A migração final exige todos os dados e documentos do escopo acordado, por no mínimo seis meses.

#### F-T-PAG / F-T-EXP — paginação e formatos

Em base isolada, preparar **27 aquisições publicadas**, cada uma com valor de **R$ 10,00**, total **R$ 270,00**. Página de dez: **10/10/7**, sempre com total geral 27/R$ 270,00. Buscar registro da terceira página sem tê-la aberto. Exportar todo o filtro nos cinco formatos do PTR-049 e conferir 27 registros, caracteres acentuados, identificadores textuais preservados e R$ 270,00.

Usar um favorecido de teste com máscara ativa: resposta pública e exportações não contêm o identificador integral. Testar também resultado vazio real e erro da origem: são estados diferentes. Nenhum teste de exportação deve liberar documentos privados nem fórmulas inseridas em descrições.

<a id="ptr-itens"></a>
### 12.6 Desenvolvimento item a item — Portal da Transparência

A numeração abaixo é a do TR, com prefixo **PTR**. A citação preserva inclusive a escrita “E- SIC” produzida pela quebra de linha do PDF no item 35, normalizando somente espaços. Os títulos resumidos não corrigem ou substituem a fonte.

<a id="ptr-001"></a>
#### PTR-001 — Portal da Transparência responsivo

**TR — PORTAL DA TRANSPARÊNCIA, item 1, p. 145:**

> Deverá ser um sistema totalmente responsivo, podendo ser acessado de qualquer dispositivo móvel, devendo para tanto responder ao tamanho da tela para se adequar da melhor forma a celulares, tablets e qualquer navegador;

**Implementação:** Reutilizar o layout público e os componentes responsivos do Institucional, mas apresentar o título, menus e consultas da Transparência. Tabelas adaptam colunas essenciais à listagem e oferecem ficha integral; filtros, exportação e E-SIC continuam operáveis em telas pequenas. Não esconder campos mínimos para reduzir largura.

**Dados de outro módulo / serviço compartilhado:** TDEP-14/15 — componentes e recursos compartilhados. As consultas mantêm suas fontes específicas e não se tornam páginas estáticas do CMS.

**Demonstração:** Abrir despesas, ficha, servidores, documento e E-SIC no desktop e no Chrome de um celular real. Aplicar filtro, trocar página, abrir detalhe e baixar um documento; repetir com zoom e teclado.

**Aceite técnico:** As operações completam e os dados permanecem acessíveis. Nenhuma ficha se reduz a uma imagem, e não existe botão essencial fora do alcance por corte de conteúdo.

**Atenção / limite:** Não criar aplicativo separado nem alegar teste em todo navegador existente. Registrar versões efetivamente testadas; acessibilidade e legibilidade prevalecem sobre proibir qualquer rolagem.

<a id="ptr-002"></a>
#### PTR-002 — Disponibilidade web e acessos simultâneos

**TR — PORTAL DA TRANSPARÊNCIA, item 2, pp. 145–146:**

> O Portal da Transparência deverá estar disponível na web, sem limitações de acessos simultâneos;

**Implementação:** Publicar as consultas na web sem teto artificial de usuários simultâneos ou licença por visitante. Separar capacidade de infraestrutura de bloqueios contratuais de acesso, usar consultas paginadas e reaproveitar cache seguro. As regras de proteção a abuso não devem impedir a consulta legítima por simples contagem de cidadãos.

**Dados de outro módulo / serviço compartilhado:** TDEP-15 e infraestrutura existente de publicação. Não comprar ou substituir hospedagem sem diagnóstico e autorização.

**Demonstração:** Em homologação autorizada, executar carga concorrente controlada, registrar número de sessões, volume, duração, latência e erros; confirmar que uma nova sessão legítima ainda pode consultar. Não submeter o site de produção a teste de carga não autorizado.

**Aceite técnico:** Não há trava funcional por número de visitantes simultâneos; a amostra executada possui resultados documentados. O dimensionamento e os gargalos encontrados ficam explícitos.

**Atenção / limite:** A frase não permite prometer capacidade física infinita. A quantidade de sessões do teste é amostra de engenharia, não limite novo do TR nem comprovação de acesso irrestrito sob qualquer carga.

<a id="ptr-003"></a>
#### PTR-003 — Identidade visual própria da Transparência

**TR — PORTAL DA TRANSPARÊNCIA, item 3, p. 146:**

> Possibilitar a Entidade personalizar o Portal da Transparência, inserindo o brasão, banner e o logotipo do Município, assim como alterar as cores do plano de fundo, exibir o brasão do Município no Portal da Transparência, permitindo melhor caracterização e identificação do sistema pelo usuário;

**Implementação:** Oferecer configuração do brasão, banner, logotipo e cores de fundo, com prévia e aplicação no Portal da Transparência. Reutilizar o repositório para mídia e os tokens de tema, mantendo o contexto de portal e entidade; exibir o brasão na área pública.

**Dados de outro módulo / serviço compartilhado:** TDEP-01 — entidade; TDEP-14 — mídias e tema compartilhados. A configuração visual pode ser específica de cada portal.

**Demonstração:** Em F-T-ENT, escolher três mídias demonstrativas apropriadas, alterar fundo, salvar e consultar anonimamente. Conferir que a notícia, a agenda e o tema não compartilhado do Institucional não foram modificados.

**Aceite técnico:** Elementos escolhidos e cores aparecem no portal correto após salvar, sem novo deploy e sem alteração indevida da identidade de outro contexto.

**Atenção / limite:** Não transformar personalização em editor livre de código ou impor redesenho completo. Preservar contraste e alternativas textuais ao permitir a escolha de cores e imagens.

<a id="ptr-004"></a>
#### PTR-004 — Informações das unidades gestoras publicantes

**TR — PORTAL DA TRANSPARÊNCIA, item 4, p. 146:**

> Exibir informações mínimas das unidades gestoras publicantes do Portal da Transparência, tais como: responsável, endereço, telefone e horário de funcionamento;

**Implementação:** Exibir ficha ou seção de cada unidade gestora publicante com responsável, endereço, telefone e horário de funcionamento. Diferenciar unidade gestora, entidade e unidade administrativa quando a origem os distinguir. Permitir complementar somente dados editoriais de publicação que não existam na origem.

**Dados de outro módulo / serviço compartilhado:** TDEP-01 — cadastro institucional e dados publicáveis; TDEP-14 — apresentação. Não criar órgão duplicado por título digitado no CMS.

**Demonstração:** Em F-T-ENT, consultar UG-A e UG-B separadamente e confirmar os quatro grupos de informação. Alterar um horário pela fonte/gestão editorial permitida e conferir o contexto atualizado.

**Aceite técnico:** Cada entidade mostra seus próprios contatos e responsável; não existe uma ficha genérica aplicada indistintamente a todas as publicantes.

**Atenção / limite:** O padrão de contato de produção deve ser fornecido. Não publicar dados privados do responsável nem inventar endereço/telefone real para completar o campo.

<a id="ptr-005"></a>
#### PTR-005 — Glossário da Transparência

**TR — PORTAL DA TRANSPARÊNCIA, item 5, p. 146:**

> Dispor de um glossário dos termos utilizados no Portal da Transparência, proporcionando ao usuário do sistema entender termos mais complexos da administração pública;

**Implementação:** Disponibilizar glossário editável de termos usados nas consultas, com termo e explicação clara, usando CMS e pesquisa/paginação quando necessário. O acesso deve estar identificável em Informações e ajuda, sem exigir login público.

**Dados de outro módulo / serviço compartilhado:** TDEP-14 — conteúdo do CMS. Explicações devem ser cadastradas/validadas pelo responsável, não geradas automaticamente como definições oficiais.

**Demonstração:** Cadastrar termos demonstrativos referentes às medidas expostas, abrir a lista pública, localizar um termo, editar sua explicação no gerenciador e conferir a atualização.

**Aceite técnico:** O cidadão encontra a explicação mantida no CMS; a atualização persiste e não exige alterar código.

**Atenção / limite:** Não criar chatbot, taxonomia jurídica ou busca semântica como entrega adicional. Os textos de demonstração não substituem revisão do conteúdo oficial.

<a id="ptr-006"></a>
#### PTR-006 — Seção Fale Conosco

**TR — PORTAL DA TRANSPARÊNCIA, item 6, p. 146:**

> Dispor de uma seção Fale Conosco

**Implementação:** Criar seção pública claramente acessível com os canais de contato definidos pelo Município. Reutilizar página/componente de contato; se houver formulário adotado, encaminhar ao destino real e apresentar confirmação somente após o registro/envio efetivo. O canal não deve substituir o E-SIC.

**Dados de outro módulo / serviço compartilhado:** TDEP-01/14 — contatos e conteúdo; serviço de atendimento/e-mail existente somente se essa forma de contato for adotada.

**Demonstração:** Acessar Fale Conosco pela navegação pública, conferir os canais cadastrados e acionar o link correspondente. Se for formulário, enviar mensagem de teste autorizada e conferir a chegada ao destino.

**Aceite técnico:** A seção existe e oferece meio de contato funcional, não texto genérico sem destinatário ou botão sem efeito.

**Atenção / limite:** O item não define formulário, chat, telefone ou sistema de chamados obrigatório. Utilizar a solução já disponível sem construir nova central de atendimento.

<a id="ptr-007"></a>
#### PTR-007 — Ferramentas de acessibilidade na Transparência

**TR — PORTAL DA TRANSPARÊNCIA, item 7, p. 146:**

> Dispor de ferramentas de acessibilidade WEB para pessoas com deficiência aprovado pelas Normas Brasileiras de Acessibilidade;

**Implementação:** Reutilizar recursos de acessibilidade do Institucional e aplicá-los às tabelas, filtros, fichas, exportações e E-SIC da Transparência. Preservar semântica, rótulos, foco visível, atalhos documentados, contraste, zoom e alternativas de imagens; validar os controles reais, não apenas a presença de um ícone de acessibilidade.

**Dados de outro módulo / serviço compartilhado:** TDEP-14/15 — layout, biblioteca de componentes e controles comuns. Testes POR ajudam, mas não dispensam testar PTR.

**Demonstração:** Executar a navegação sem mouse entre filtro, tabela, ficha e download; ampliar texto; testar contraste e rótulos; preencher o pedido de informação e corrigir um erro indicado.

**Aceite técnico:** Funções podem ser realizadas de forma acessível nos testes executados. Erros, estágio e seleção não dependem somente de cor ou de hover.

**Atenção / limite:** Q-T01: o texto não identifica norma, versão, nível nem mecanismo de aprovação. Registrar o referencial a validar com a Administração; não inventar certificado de acessibilidade.

<a id="ptr-008"></a>
#### PTR-008 — Mapa do site da Transparência

**TR — PORTAL DA TRANSPARÊNCIA, item 8, p. 146:**

> Dispor mapa do site;

**Implementação:** Exibir mapa navegável das seções públicas da Transparência usando a estrutura de menus/rotas publicadas. Respeitar entidades e consultas habilitadas e manter a hierarquia compreensível. Reutilizar o componente de mapa do site do Institucional com contexto separado.

**Dados de outro módulo / serviço compartilhado:** TDEP-14/15 — menus e publicação. A árvore institucional não pode ser mostrada no lugar da árvore da Transparência.

**Demonstração:** Abrir o mapa do site, acessar Despesas e E-SIC por ele; desativar uma consulta em teste e conferir a mudança no mapa sem remover a seção de outro portal.

**Aceite técnico:** O mapa corresponde às seções acessíveis do portal correto e permite navegar, sem referências a páginas privadas ou links quebrados introduzidos pela configuração.

**Atenção / limite:** Não impor mapa geográfico nem sitemap de SEO como nova obrigação. O requisito é mapa de navegação do site.

<a id="ptr-009"></a>
#### PTR-009 — Perguntas frequentes da Transparência

**TR — PORTAL DA TRANSPARÊNCIA, item 9, p. 146:**

> Dispor de seção “Perguntas Frequentes”;

**Implementação:** Disponibilizar seção pública de perguntas e respostas sobre o uso da Transparência, editável pelo CMS. Permitir organizar e localizar conteúdo com os componentes existentes, sem herdar perguntas de outro serviço que não correspondam ao portal.

**Dados de outro módulo / serviço compartilhado:** TDEP-14 — conteúdo compartilhado por vínculo quando realmente comum, com contexto Transparência.

**Demonstração:** Cadastrar perguntas de teste sobre localizar empenho e exportar dados, abrir a FAQ, editar uma resposta e conferir que ela passa a orientar a tela efetivamente implementada.

**Aceite técnico:** Perguntas e respostas são acessíveis, persistidas e atualizáveis por usuário autorizado.

**Atenção / limite:** Não acrescentar chatbot ou aprovação editorial em vários níveis. A atualização da FAQ não configura legalmente a publicação financeira.

<a id="ptr-010"></a>
#### PTR-010 — Manual de navegação

**TR — PORTAL DA TRANSPARÊNCIA, item 10, p. 146:**

> Dispor de Manual de Navegação;

**Implementação:** Disponibilizar manual consultável na área pública com instruções das telas reais: seleção de entidade/período, pesquisa, ficha de despesa, estágios, documentos, exportação e acesso ao E-SIC. Usar página ou documento do repositório, mantendo versão identificada quando atualizada.

**Dados de outro módulo / serviço compartilhado:** TDEP-14 — CMS e arquivo. O conteúdo final depende das rotas e controles realmente entregues pelo agente.

**Demonstração:** Após implementar as telas, publicar o manual e executar uma consulta seguindo suas instruções. Conferir leitura no celular e download quando a opção existir.

**Aceite técnico:** O manual está acessível e corresponde ao produto final, não a rascunho de telas ainda inexistentes.

**Atenção / limite:** Não confundir manual de navegação com novo módulo de treinamento. Não registrar instrução de clique para controle não implementado.

<a id="ptr-011"></a>
#### PTR-011 — Legislação de referência do portal

**TR — PORTAL DA TRANSPARÊNCIA, item 11, p. 146:**

> Possibilitar a disponibilização das principais leis que regulam o Portal da Transparência;

**Implementação:** Publicar relação de leis e atos fornecidos/validados para o portal, com identificação e acesso ao documento ou endereço autorizado. Usar o repositório e os links comuns, mantendo o conteúdo de referência atualizável no gerenciador.

**Dados de outro módulo / serviço compartilhado:** TDEP-14 e responsável administrativo pelo conteúdo. A identificação de leis citadas no TR não dispensa conferir os documentos de produção.

**Demonstração:** Publicar referência demonstrativa identificada ou cópia oficial autorizada, abrir por navegação pública e conferir título e destino. Corrigir um link na administração sem novo deploy.

**Aceite técnico:** Referências podem ser disponibilizadas e consultadas com documentos/destinos correspondentes.

**Atenção / limite:** Q-T01: não inventar vigência, versão consolidada ou interpretação normativa. Esta revisão não realiza pesquisa jurídica externa para formar a lista oficial.

<a id="ptr-012"></a>
#### PTR-012 — Estrutura organizacional pública

**TR — PORTAL DA TRANSPARÊNCIA, item 12, p. 146:**

> Possibilitar disponibilizar informação sobre a estrutura organizacional;

**Implementação:** Disponibilizar estrutura organizacional a partir do organograma/cadastro existente, com hierarquia legível e identificação de órgãos e unidades. A projeção pública deve preservar relações e mostrar apenas atributos destinados à publicação.

**Dados de outro módulo / serviço compartilhado:** TDEP-01 — organograma. O CMS pode apresentar o conteúdo, mas não manter uma hierarquia operacional divergente.

**Demonstração:** Consultar os dois níveis de F-T-ENT e abrir a unidade correspondente. Quando a fonte for integrada, mudar uma descrição autorizada na origem e conferir o reflexo.

**Aceite técnico:** A estrutura publicada corresponde à fonte ou à versão institucional identificada; não revela usuários/permissões internos.

**Atenção / limite:** O TR não obriga um novo editor gráfico de organogramas. Uma árvore/lista hierárquica acessível pode usar os componentes existentes.

<a id="ptr-013"></a>
#### PTR-013 — Informações das unidades administrativas

**TR — PORTAL DA TRANSPARÊNCIA, item 13, p. 146:**

> Possibilitar inserir informações sobre as unidades administrativas;

**Implementação:** Permitir disponibilizar informações de unidades administrativas vinculadas à estrutura, usando dados do cadastro e complementos editoriais autorizados. Manter identificação, relação organizacional e conteúdo descritivo pertinentes, sem confundir unidade administrativa com unidade gestora de PTR-004.

**Dados de outro módulo / serviço compartilhado:** TDEP-01 — cadastro das unidades; TDEP-14 — complementos de apresentação. Não modificar regras administrativas da origem.

**Demonstração:** Selecionar duas unidades de F-T-ENT, inserir/atualizar descrição pública e consultar suas páginas. Conferir que o complemento não criou outro órgão no ERP.

**Aceite técnico:** Informações podem ser inseridas/publicadas e cada unidade continua vinculada corretamente.

**Atenção / limite:** O item não lista campos mínimos próprios. Contatos, descrição e competências são propostas quando disponíveis, não novas exigências documentais obrigatórias.

<a id="ptr-014"></a>
#### PTR-014 — Carta de Serviços do Executivo

**TR — PORTAL DA TRANSPARÊNCIA, item 14, p. 146:**

> Possibilitar a disponibilização da Carta de Serviços do Poder executivo Municipal;

**Implementação:** Disponibilizar a Carta de Serviços do Poder Executivo Municipal em seção identificada, como conteúdo estruturado já existente ou documento integral publicado. Reutilizar o catálogo/documento disponível sem desenvolver a execução de cada serviço descrito.

**Dados de outro módulo / serviço compartilhado:** TDEP-01/14 — responsável e documento/catalogação oficial da Carta; eventual Portal de Serviços é origem quando existente.

**Demonstração:** Publicar Carta DEMO, abrir seu conteúdo integral e localizar um serviço de exemplo. Substituir a versão pela administração e conferir o documento divulgado.

**Aceite técnico:** A Carta está identificável e acessível, não somente mencionada em texto sem acesso ao conteúdo.

**Atenção / limite:** Não criar novos serviços de emissão tributária ou protocolo para atender a esta publicação. O conteúdo de produção é fornecido/validado pela Administração.

<a id="ptr-015"></a>
#### PTR-015 — Planos, orçamentos e prestações de contas publicados

**TR — PORTAL DA TRANSPARÊNCIA, item 15, p. 146:**

> Atender a Lei Complementar nº 131/2009, onde se instituiu a obrigatoriedade quanto à divulgação através de meios eletrônicos e de acesso ao público, dos planos, orçamentos e leis de diretrizes orçamentárias; das prestações de contas e o respectivo parecer prévio; do Relatório Resumido da Execução Orçamentária, do Relatório de Gestão Fiscal e das versões simplificadas desses documentos;

**Implementação:** Organizar a publicação dos planos, orçamentos, diretrizes, prestações de contas e parecer prévio, RREO, RGF e versões simplificadas pertinentes. Relacionar tipo, entidade e exercício/período, permitindo consulta aos documentos integrais. Compartilhar a biblioteca com PTR-041/043/047 sem reduzir o conjunto ao PDF da LOA.

**Dados de outro módulo / serviço compartilhado:** TDEP-04 — instrumentos/demonstrativos; TDEP-12 quando origem de parecer; TDEP-14 — documentos e publicação.

**Demonstração:** Executar F-T-DOC e percorrer os grupos citados, abrindo o parecer prévio e as versões simplificadas disponíveis. Conferir entidade, período e arquivo correto.

**Aceite técnico:** Todos os grupos descritos na fonte têm meios de publicação e documentos de teste identificáveis. Um grupo vazio por falta de arquivo deve ser apontado, não declarado completo.

**Atenção / limite:** A capacidade de publicar não comprova, sozinha, o atendimento jurídico integral à lei mencionada. Não elaborar demonstrativo contábil fictício apresentado como oficial.

<a id="ptr-016"></a>
#### PTR-016 — Execução orçamentária e financeira em tempo real

**TR — PORTAL DA TRANSPARÊNCIA, item 16, p. 146:**

> Disponibilização, em tempo real, dos dados da execução orçamentária e financeira, no Portal da Transparência, conforme determinação da Lei Complementar 131/2009;

**Implementação:** Conectar a consulta pública da execução à fonte efetiva e refletir os eventos confirmados por leitura atual ou atualização acionada pelo evento. Aplicar o contrato C: cache invalidado, datas de atualização identificadas e falha distinta de vazio. O operador da Transparência não deve copiar manualmente cada lançamento.

**Dados de outro módulo / serviço compartilhado:** TDEP-02/03 e, para arrecadação de origem fiscal, TDEP-06. Fonte disponível precisa ser consumida; não somente citada no desenho.

**Demonstração:** Com F-T-DESP aberto no portal, confirmar na Tesouraria mais R$ 500,00 para E-A1 e consultar de outra sessão pública: pago consolidado passa de R$ 6.300,00 para R$ 6.800,00. Medir propagação e repetir o evento técnico sem duplicação.

**Aceite técnico:** O novo fato chega à consulta sem redigitação ou deploy. Os outros estágios não mudam indevidamente. Evidência registra origem, evento, atualização e latência observada.

**Atenção / limite:** Q-T03: definir critério operacional aplicável à expressão tempo real. Não substituir a exigência por atualização somente manual/noturna nem inventar prazo legal em segundos.

<a id="ptr-017"></a>
#### PTR-017 — Consulta por despesa empenhada, liquidada e paga

**TR — PORTAL DA TRANSPARÊNCIA, item 17, pp. 146–147:**

> Nas informações da despesa, deve-se permitir selecionar a despesa empenhada, liquidada e paga, bem como exibir a ficha da despesa de forma individual;

**Implementação:** Oferecer seleção das medidas/etapas empenhada, liquidada e paga, com listagem e acesso à ficha individual. O filtro consulta o estágio na origem e não um único campo status que elimine os valores das etapas anteriores. Mostrar período e data de referência de cada recorte.

**Dados de outro módulo / serviço compartilhado:** TDEP-02/03 — estágios e vínculos. Reutilizar a base de PTR-016/018/019.

**Demonstração:** Executar F-T-DESP antes do pagamento adicional: conferir R$ 18.000,00 empenhados, R$ 9.000,00 liquidados e R$ 6.300,00 pagos. Abrir ficha a partir de cada consulta e filtrar UG-A.

**Aceite técnico:** Cada seleção apresenta os atos e valores corretos e alcança a ficha vinculada. Mesmo número de empenho em outra UG não mistura resultados.

**Atenção / limite:** Não somar etapas como despesas independentes. Uma linha resumida com etiqueta PAGO não substitui as três consultas solicitadas.

<a id="ptr-018"></a>
#### PTR-018 — Ficha da despesa com todos os campos mínimos

**TR — PORTAL DA TRANSPARÊNCIA, item 18, p. 147:**

> A ficha da despesa deve fornecer as seguintes informações: entidade, número da despesa, tipo da despesa, ano da despesa, data da despesa, número do processo, valor da despesa, nome do favorecido, CPF ou CNPJ (permitindo aplicar máscara) do favorecido e todo o detalhamento da despesa, que compreende o órgão, unidade orçamentária, função, subfunção, programa, projeto ou atividade, elemento da despesa, subelemento, fonte de recurso e histórico da despesa;

**Implementação:** Implementar a ficha com os 19 componentes do checklist da seção 12.4.D, agrupados em identificação, favorecido, classificação e histórico. Consumir referências reais e manter data/tipo/valor coerentes com o ato consultado. Configurar aplicação de máscara no documento do favorecido na projeção pública.

**Dados de outro módulo / serviço compartilhado:** TDEP-02 — ato/classificação; TDEP-01 — entidade; TDEP-03 quando ficha originada em pagamento. Documento pessoal só na forma publicável autorizada.

**Demonstração:** Abrir E-A1 e conferir os 19 dados um a um contra a fonte. Ativar máscara e inspecionar tela, resposta pública, busca e exportação. Comparar E-B1 com mesmo número em outra unidade.

**Aceite técnico:** Nenhum componente mínimo é substituído por texto genérico. Informação extensa permanece disponível na ficha, sem corte; máscara não é apenas visual.

**Atenção / limite:** Q-T02: registrar regra de divulgação/mascaramento e campo indisponível na origem. Não preencher código ou CPF real inventado para completar a ficha.

<a id="ptr-019"></a>
#### PTR-019 — Etapas relacionadas à mesma despesa

**TR — PORTAL DA TRANSPARÊNCIA, item 19, p. 147:**

> A ficha da despesa também deve apresentar todas as demais etapas vinculadas àquela despesa;

**Implementação:** Mostrar na ficha todas as etapas vinculadas ao fato, com referências navegáveis, datas, valores e estado da origem. A relação suporta múltiplas liquidações e pagamentos parciais; usar chaves estáveis por entidade/exercício e não somente número textual.

**Dados de outro módulo / serviço compartilhado:** TDEP-02/03 — relações e movimentos. Não gerar evento contábil para construir o histórico.

**Demonstração:** Em E-A1, abrir liquidações de R$ 3.500,00 e R$ 2.500,00 e pagamentos de R$ 2.000,00 cada, verificando seus vínculos. Após o teste de atualização, localizar também o pagamento adicional sem perder os anteriores.

**Aceite técnico:** As etapas mostradas são as da despesa consultada e os totais conciliam; nenhuma etapa some por paginação.

**Atenção / limite:** Não apresentar etapas de outra UG nem duplicar um pagamento a cada linha de item ou documento anexado.

<a id="ptr-020"></a>
#### PTR-020 — Dados mínimos do pagamento

**TR — PORTAL DA TRANSPARÊNCIA, item 20, p. 147:**

> A informação sobre pagamento deve conter, minimamente: valor do pagamento, empenho, data, favorecido e descrição do objeto;

**Implementação:** Na consulta/ficha de pagamento, exibir valor, empenho correspondente, data, favorecido e descrição do objeto, a partir do pagamento registrado. Manter ligação à despesa e a distinção entre valor desta parcela paga e total empenhado.

**Dados de outro módulo / serviço compartilhado:** TDEP-03 — pagamento; TDEP-02 — empenho e objeto; cadastro compartilhado para favorecido quando pertinente.

**Demonstração:** Abrir o primeiro pagamento de R$ 2.000,00 de E-A1 e conferir os cinco dados. Abrir o de R$ 800,00 de E-B1 para testar vínculo e unidade diferentes.

**Aceite técnico:** Pagamento mostra sua data e seu valor reais, sem copiar R$ 10.000,00 do empenho para o campo pago.

**Atenção / limite:** Não publicar conta bancária/chave Pix ou iniciar pagamento pelo portal. O item trata de divulgação, não execução financeira.

<a id="ptr-021"></a>
#### PTR-021 — Dados mínimos do empenho

**TR — PORTAL DA TRANSPARÊNCIA, item 21, p. 147:**

> No empenho, as informações mínimas: número do empenho, valor, data, favorecido e descrição do objeto;

**Implementação:** Na consulta/ficha de empenho, mostrar número, valor, data, favorecido e descrição do objeto. Associar entidade/exercício para navegação correta e reaproveitar a ficha detalhada quando adequada.

**Dados de outro módulo / serviço compartilhado:** TDEP-02 — empenho, objeto e favorecido; TDEP-01 — unidade publicante.

**Demonstração:** Consultar E-A1 de R$ 10.000,00 e E-B1 de R$ 3.000,00, ambos com número 001-2026 no cenário, conferindo os cinco dados e a unidade.

**Aceite técnico:** Empenhos permanecem distintos e correspondem aos atos de origem, sem valores ou favorecidos trocados.

**Atenção / limite:** Não gerar empenho fictício na Transparência nem reduzir esse detalhe ao valor líquido de pagamento.

<a id="ptr-022"></a>
#### PTR-022 — Orçamento e execução da receita

**TR — PORTAL DA TRANSPARÊNCIA, item 22, p. 147:**

> Divulgar informações mínimas para o acompanhamento do orçamento da receita e execução da receita;

**Implementação:** Disponibilizar consulta comparativa da previsão/orçamento e execução da receita, por unidade, período e classificações existentes. Identificar a medida e permitir alcançar os detalhes disponíveis sem somar previsão à arrecadação.

**Dados de outro módulo / serviço compartilhado:** TDEP-02/04 — previsão; TDEP-03/06 — realização, com fonte de totalização e conciliação definidas.

**Demonstração:** Executar F-T-REC: previsto consolidado R$ 15.000,00 e arrecadado R$ 10.000,00. Selecionar UG-A: R$ 12.000,00 e R$ 8.000,00. Conferir mesmas bases de período.

**Aceite técnico:** Orçamento e execução são distinguíveis e conciliam com a origem. Dados fiscais e contábeis correlatos não são somados duas vezes.

**Atenção / limite:** O item não define fórmulas de projeção adicionais. Não criar planejamento/lançamento de receita neste módulo.

<a id="ptr-023"></a>
#### PTR-023 — Estágios da receita

**TR — PORTAL DA TRANSPARÊNCIA, item 23, p. 147:**

> Divulgar as informações do estágio da receita;

**Implementação:** Expor os estágios efetivamente fornecidos pelo modelo de receita da origem, com rótulo, período/data e valor correspondentes. Mapear o significado de cada campo com o núcleo contábil; a lista de estágios não deve ser inventada pelo editor de conteúdo.

**Dados de outro módulo / serviço compartilhado:** TDEP-02/03/06 — estágios e origem da receita. Documentar equivalência dos nomes usados nas telas.

**Demonstração:** Na base F-T-REC, consultar os registros em seus estágios disponíveis e conferir os valores com o módulo fonte; atualizar um estágio de teste pela origem e verificar o reflexo.

**Aceite técnico:** A consulta identifica o estágio e não apresenta um único valor sob vários rótulos. Ausência de uma fonte/estágio necessário fica registrada.

**Atenção / limite:** Q-T03/T05: a fonte não enumera neste item os estágios. Não transformar previsão, lançamento ou arrecadação em sinônimos nem presumir regra contábil sem mapeamento.

<a id="ptr-024"></a>
#### PTR-024 — Repasses e transferências financeiras

**TR — PORTAL DA TRANSPARÊNCIA, item 24, p. 147:**

> Divulgar informações mínimas sobre quaisquer repasses ou transferências de recursos financeiros;

**Implementação:** Divulgar repasses/transferências com origem, destino, data, valor, sentido recebido/concedido e referência de objeto quando disponíveis. Usar o movimento financeiro real; mostrar vínculo com instrumento sem tratá-lo como pagamento integral do convênio.

**Dados de outro módulo / serviço compartilhado:** TDEP-03 — movimentos; TDEP-07 — instrumento correlato, se houver. Os campos propostos organizam a informação não enumerada pelo item.

**Demonstração:** Em F-T-ADM, localizar repasse recebido de R$ 4.000,00 e concedido de R$ 1.000,00. Abrir os vínculos e distinguir dos valores de R$ 20.000,00 e R$ 5.000,00 dos instrumentos.

**Aceite técnico:** Movimentos de entrada e saída são identificados e correspondem aos repasses reais. Listagem não confunde valor total conveniado com repasse efetivado.

**Atenção / limite:** Não criar uma transferência bancária nem limitar a consulta a uma só modalidade se a fonte fornecer outras do escopo.

<a id="ptr-025"></a>
#### PTR-025 — Convênios e instrumentos congêneres

**TR — PORTAL DA TRANSPARÊNCIA, item 25, p. 147:**

> Disponibilizar informações sobre convênios, contratos de repasse, termos de gestão e instrumentos congêneres, contendo minimamente: convênio recebido ou concedido; beneficiário; objeto; vigência inicial e final; valor;

**Implementação:** Publicar convênios, contratos de repasse, termos de gestão e instrumentos congêneres disponíveis, com identificação de recebido/concedido, beneficiário, objeto, vigência inicial/final e valor. Reutilizar cadastro de instrumentos e documentos sem fundir tipos administrativos distintos.

**Dados de outro módulo / serviço compartilhado:** TDEP-07 — contratos/convênios; TDEP-03 — repasses relacionados; TDEP-14 — arquivos.

**Demonstração:** Consultar os dois instrumentos F-T-ADM, conferir todos os campos mínimos e seu sentido. Incluir exemplos identificados dos demais tipos disponíveis para verificar que a tela não se limita a contrato comercial.

**Aceite técnico:** Tipos e campos descritos são publicáveis e recuperáveis na ficha. Vínculo a repasses não duplica o valor do instrumento.

**Atenção / limite:** Não redigir ou assinar novo convênio pelo portal. Fonte sem instrumento de determinado tipo é falta de dado a registrar, não prova de inexistência de obrigação de publicação.

<a id="ptr-026"></a>
#### PTR-026 — Compras realizadas com itens e valores

**TR — PORTAL DA TRANSPARÊNCIA, item 26, p. 147:**

> Permite publicar informações referentes a compras realizadas, com a exibição de uma lista detalhada de aquisições de materiais e serviços realizadas, incluindo descritivos, quantitativos e valores de itens;

**Implementação:** Disponibilizar listagem de aquisições de materiais e serviços com detalhamento de itens, descrição, quantitativos, unidade e valores da origem. Distinguir pedido ainda não realizado de aquisição conforme o marco adotado na origem, registrando esse significado.

**Dados de outro módulo / serviço compartilhado:** TDEP-07 — compras/itens; TDEP-15 — consulta/exportação. A fonte da quantidade adquirida não é saldo atual do estoque.

**Demonstração:** Consultar material de 10 unidades a R$ 25,00 e serviço de 4 horas a R$ 100,00: R$ 250,00 e R$ 400,00, total R$ 650,00. Filtrar tipo e abrir os itens; executar F-T-PAG isoladamente para paginação.

**Aceite técnico:** Descrições, quantidades e valores são acessíveis e conciliam com aquisições de origem, sem repetição por relacionamento com anexos.

**Atenção / limite:** Não criar fluxo de compras, fornecedor paralelo ou quantidade fictícia para servir à listagem. Q-T05 registra o marco de compra realizada quando não for explícito na origem.

<a id="ptr-027"></a>
#### PTR-027 — Contratos e aditivos na íntegra

**TR — PORTAL DA TRANSPARÊNCIA, item 27, p. 147:**

> Divulgar informações sobre contratos e aditivos firmados pelo órgão publicante, permitindo também a publicação na íntegra dos contratos e aditivos;

**Implementação:** Divulgar cadastro do contrato, aditivos relacionados e seus arquivos integrais destinados à publicação. Preservar número/ano, entidade, objeto, partes e eventos disponíveis; mostrar valor original, aditivo e atualizado com rótulos próprios quando a fonte fornecer esses valores.

**Dados de outro módulo / serviço compartilhado:** TDEP-07 — contrato/aditivos; TDEP-14 — arquivos públicos e versões autorizadas.

**Demonstração:** Em CTR-DEMO-01, abrir contrato de R$ 10.000,00 e aditivo de R$ 1.000,00; conferir relação e valor atualizado R$ 11.000,00. Abrir/baixar os dois arquivos completos.

**Aceite técnico:** Contrato e aditivos são identificados, relacionados e publicáveis integralmente. Cadastro resumido sem acesso à íntegra não fecha o teste.

**Atenção / limite:** Não alterar documento assinado para publicá-lo sem identificar a nova versão. Não divulgar automaticamente anexos privados que não compõem a publicação autorizada.

<a id="ptr-028"></a>
#### PTR-028 — Licitações, dispensas e inexigibilidades

**TR — PORTAL DA TRANSPARÊNCIA, item 28, p. 147:**

> Exibir a listagem de processos licitatórios, dispensas e inexigibilidades, permitindo a publicação na íntegra dos editais e das atas de licitação;

**Implementação:** Exibir processos licitatórios, dispensas e inexigibilidades, distinguindo a categoria/modalidade conforme a fonte. Permitir publicação integral dos editais e atas vinculados ao processo; organizar resultados/documentos pertinentes pelos recursos compartilhados.

**Dados de outro módulo / serviço compartilhado:** TDEP-07 — processos e documentos; TDEP-14 — publicação de arquivos. Não replicar motor de disputa ou cadastro de resultados independentes.

**Demonstração:** Consultar um processo de cada grupo F-T-ADM; no processo licitatório, abrir edital e ata completos. Confirmar que documentos pertencem ao processo correto e que o filtro não exclui dispensas/inexigibilidades.

**Aceite técnico:** Três grupos têm consulta acessível e a publicação integral de editais/atas funciona onde os documentos existem.

**Atenção / limite:** Não obrigar documento administrativo inexistente para uma modalidade só para preencher a tela. Também não usar um link genérico para a plataforma de lances como substituto de toda a publicação.

<a id="ptr-029"></a>
#### PTR-029 — Informações dos bens patrimoniais

**TR — PORTAL DA TRANSPARÊNCIA, item 29, pp. 147–148:**

> Divulgar informações mínimas sobre os bens patrimoniais pertencentes ao Município;

**Implementação:** Divulgar relação e ficha pública dos bens municipais com identificador, descrição, categoria e informações de situação/localização autorizadas da origem. Os campos não enumerados no item são proposta mínima a confirmar com o responsável pela publicação.

**Dados de outro módulo / serviço compartilhado:** TDEP-08 — Patrimônio; TDEP-01 — entidade; TDEP-14 se houver documento público pertinente.

**Demonstração:** Consultar os dois bens de F-T-ADM e verificar sua correspondência com Patrimônio. Alterar uma descrição permitida na origem e conferir o reflexo no portal.

**Aceite técnico:** Bens publicados vêm do cadastro identificado e não de uma lista editorial sem vínculo; não incluem bens de outro escopo por erro de filtro.

**Atenção / limite:** Não tombar, depreciar, baixar ou expor localizações sensíveis indiscriminadamente. Q-T05/T02 define o conjunto publicável de informações mínimas não enumeradas.

<a id="ptr-030"></a>
#### PTR-030 — Entradas e saídas do almoxarifado

**TR — PORTAL DA TRANSPARÊNCIA, item 30, p. 148:**

> Divulgar informações mínimas sobre as entradas e saídas do almoxarifado do órgão publicante;

**Implementação:** Publicar movimentos de entrada e saída por órgão, com tipo, data, material/descrição, quantidade/unidade e referências publicáveis existentes. Manter distinção entre movimento e saldo; não divulgar um saldo atual como se fosse a relação de entradas/saídas.

**Dados de outro módulo / serviço compartilhado:** TDEP-09 — movimentos reais do Almoxarifado. TDEP-01 identifica o órgão publicante.

**Demonstração:** Abrir uma entrada e uma saída de F-T-ADM, comparar data, material e quantidade na origem, filtrar período e conferir que ambas as naturezas aparecem.

**Aceite técnico:** O cidadão consulta fatos de entrada e saída com suas origens e unidades; não há operação de movimentação disponível publicamente.

**Atenção / limite:** Não gerar baixa de estoque para produzir o relatório nem somar unidades heterogêneas. Campos de publicação não enumerados devem ser mapeados sem ampliar o cadastro operacional.

<a id="ptr-031"></a>
#### PTR-031 — Menu de servidores e informações funcionais

**TR — PORTAL DA TRANSPARÊNCIA, item 31, p. 148:**

> Disponibilizar Menu de consulta dos servidores públicos, permitindo a divulgação de informações mínimas sobre a folha de pagamento dos servidores, tais como matrícula, salário, cargo, data de admissão, carga horária, e secretaria de lotação;

**Implementação:** Criar menu público de Servidores, com consulta por competência/unidade e ficha que mostre matrícula, salário identificado, cargo, admissão, carga horária e secretaria de lotação. Recuperar pessoa/vínculo funcional pela chave adequada; a ficha pode compartilhar a composição remuneratória de PTR-032.

**Dados de outro módulo / serviço compartilhado:** TDEP-05 — RH/Folha; TDEP-01 — lotação/unidade. Não consultar a sessão privada do Portal do Servidor para publicar holerites.

**Demonstração:** Executar F-T-RH; localizar os dois vínculos com matrícula 001 em unidades diferentes, conferindo todos os dados e competência. Verificar o menu no acesso anônimo.

**Aceite técnico:** Campos expressos estão acessíveis e salários correspondem ao período e vínculo selecionados. Igual matrícula não mistura funcionários/unidades.

**Atenção / limite:** Q-T02: publicar somente os dados autorizados. Não omitir salário por receio genérico de privacidade, nem divulgar CPF integral, dependentes, saúde ou conta bancária não pedidos.

<a id="ptr-032"></a>
#### PTR-032 — Valores bruto, líquido, descontos e vencimentos

**TR — PORTAL DA TRANSPARÊNCIA, item 32, p. 148:**

> Possibilita a divulgação dos valores bruto e líquido do salário dos servidores, bem como seus descontos e vencimentos;

**Implementação:** Na consulta remuneratória, divulgar valores bruto e líquido e composição de vencimentos/descontos na forma pública definida. Usar os valores fechados/aplicáveis da competência, sem recalcular folha no portal. Distinguir rubricas publicáveis de informações privadas do cadastro funcional.

**Dados de outro módulo / serviço compartilhado:** TDEP-05 — folha e composição; TDEP-15 — projeção pública e exportações.

**Demonstração:** Conferir servidor A: 5.000 − 800 = 4.200; B: 4.000 − 600 = 3.400. No conjunto: bruto R$ 9.000,00, descontos R$ 1.400,00, líquido R$ 7.600,00. Abrir vencimentos e verificar as parcelas demonstrativas.

**Aceite técnico:** Bruto, líquido, descontos e vencimentos correspondem à origem; competência e unidade ficam claras e os totais não duplicam vínculos.

**Atenção / limite:** Abrir composição não autoriza publicar motivos sensíveis de desconto. Q-T02 deve definir como divulgar os componentes mantendo os valores exigidos.

<a id="ptr-033"></a>
#### PTR-033 — Diárias com beneficiário, viagem e valor

**TR — PORTAL DA TRANSPARÊNCIA, item 33, p. 148:**

> Disponibilizar informações sobre diárias, indicando no mínimo o nome do beneficiário, função/cargo, valor recebido, período da viagem, destino e motivo;

**Implementação:** Divulgar diárias com nome do beneficiário, função/cargo, valor recebido, período da viagem, destino e motivo. Usar o valor efetivamente registrado como recebido/pago na origem adotada, sem rotular valor somente solicitado como recebido.

**Dados de outro módulo / serviço compartilhado:** TDEP-10 — diárias/viagens; TDEP-03/05 quando completarem pagamento e cargo. Identificar a origem real de cada campo.

**Demonstração:** Consultar as duas diárias de R$ 300,00 e R$ 450,00 de F-T-RH, conferir os seis grupos de informação e total R$ 750,00. Filtrar beneficiário/período.

**Aceite técnico:** Dados da viagem e valor recebido conciliam com os registros de origem e permanecem acessíveis na ficha pública.

**Atenção / limite:** Não criar autorização de viagem ou cálculo de diária. A passagem de R$ 280,00 não entra nesse total por simples vínculo ao mesmo beneficiário.

<a id="ptr-034"></a>
#### PTR-034 — Informações sobre passagens

**TR — PORTAL DA TRANSPARÊNCIA, item 34, p. 148:**

> Disponibilizar informações sobre passagens;

**Implementação:** Disponibilizar seção de passagens com dados publicáveis do registro pertinente; propor identificação do beneficiário/contexto, trecho/destino, data/período e valor quando existirem. Manter a natureza distinta de diária.

**Dados de outro módulo / serviço compartilhado:** TDEP-10 e fonte administrativa/financeira efetivamente disponível; TDEP-14 para documento público se adotado.

**Demonstração:** Consultar a passagem demonstrativa de R$ 280,00 de F-T-RH, confrontar com a origem e testar filtro/abertura da ficha. Verificar que não foi replicada como diária.

**Aceite técnico:** Informações de passagem estão acessíveis e relacionadas ao fato correto, não apenas a um título de menu vazio.

**Atenção / limite:** O TR não enumera seus campos neste item. Confirmar dados mínimos em Q-T05; não criar compra de bilhetes, integração com companhia aérea ou publicar localizador privado de reserva por suposição.

<a id="ptr-035"></a>
#### PTR-035 — E-SIC com recurso, estatística e publicação

**TR — PORTAL DA TRANSPARÊNCIA, item 35, p. 148:**

> Disponibilizar de ferramenta para pedidos de acesso à informação (E- SIC), com as seguintes características: fácil acesso, possibilidade de recurso, apresentação de relatório estatístico (quantidade de pedidos recebidos, atendidos, indeferidos), possibilidade de publicação das manifestações apresentadas ao município;

**Implementação:** Implementar ou integrar ferramenta de pedidos de acesso à informação com entrada fácil, registro efetivo, acompanhamento/resposta, possibilidade de recurso vinculado, relatório estatístico de recebidos/atendidos/indeferidos e publicação controlada das manifestações. Usar o contrato F da seção 12.4. Cada parte precisa ser demonstrada; um formulário de contato isolado não basta.

**Dados de outro módulo / serviço compartilhado:** TDEP-13 — E-SIC/Processos/Ouvidoria existente quando aplicável; TDEP-14/15 — arquivos, interface e controle de acesso. Sem núcleo separado, implementar o mínimo de E-SIC neste domínio, sem duplicar Ouvidoria geral.

**Demonstração:** Executar F-T-SIC: registrar quatro pedidos, atender dois, indeferir um e manter um em atendimento. Emitir estatística 4/2/1; interpor recurso no indeferido, decidir em teste posterior e conferir 4/3/0, com um ainda aberto. Publicar uma versão autorizada e conferir ausência de dados privados.

**Aceite técnico:** Pedido, recurso, resposta, estatística e publicação funcionam no mesmo histórico. Recurso não infla o total recebido; decisões anteriores permanecem recuperáveis.

**Atenção / limite:** Q-T04: definir identificação, prazos e rito aplicáveis. Não presumir anonimato obrigatório, prazo fixo ou integração Fala.BR. Simples link é entrada, não comprovação das funções no destino.

<a id="ptr-036"></a>
#### PTR-036 — SIC físico do município

**TR — PORTAL DA TRANSPARÊNCIA, item 36, p. 148:**

> Disponibilizar informações sobre o SIC Físico do município;

**Implementação:** Disponibilizar informações do ponto físico de atendimento ao cidadão, reutilizando CMS e cadastro institucional. Endereço/local, horário e canal de orientação são proposta de conteúdo quando fornecidos, com identificação inequívoca de que se trata de atendimento presencial.

**Dados de outro módulo / serviço compartilhado:** TDEP-01/14 — local de atendimento e conteúdo aprovado.

**Demonstração:** Publicar informações de SIC físico de teste, abrir a seção na Transparência e conferir atualização do horário sem alterar o fluxo de E-SIC.

**Aceite técnico:** Informação de atendimento físico é encontrável e diferente do formulário eletrônico.

**Atenção / limite:** O item não enumera todos os campos. Não inventar endereço/horário oficial nem criar agendamento presencial obrigatório.

<a id="ptr-037"></a>
#### PTR-037 — Publicação do CAFIMP

**TR — PORTAL DA TRANSPARÊNCIA, item 37, p. 148:**

> Permitir a publicação da informação sobre o cadastro de Fornecedores Impedidos de licitar – CAFIMP;

**Implementação:** Permitir divulgar informações do cadastro de Fornecedores Impedidos de licitar — CAFIMP, mantendo referência da fonte, fornecedor, identificação publicável, situação e ato/período disponíveis. Reutilizar cadastro ou documento de impedimentos autorizado; não inferir impedimento a partir de fornecedor inativo.

**Dados de outro módulo / serviço compartilhado:** TDEP-07 — impedimentos; TDEP-14 se a publicação ocorrer por documento. A origem administrativa deve ser identificada.

**Demonstração:** Publicar registro demonstrativo de impedimento com referência de ato e distinguir de fornecedor apenas inativo. Abrir a informação e documento público pertinente, quando houver.

**Aceite técnico:** Publicação apresenta o impedimento registrado na fonte, com contexto verificável; não converte situação cadastral comum em sanção.

**Atenção / limite:** Não impor API externa de sanções nem trocar CAFIMP por outro cadastro sem indicação. Não julgar ou aplicar penalidade no portal; Q-T05 confirma conteúdo e origem.

<a id="ptr-038"></a>
#### PTR-038 — Links para outros portais e sites

**TR — PORTAL DA TRANSPARÊNCIA, item 38, p. 148:**

> Permitir links com outros portais/site, a exemplos do portal do Governo Federal e Diário Oficial;

**Implementação:** Disponibilizar links úteis da Transparência, incluindo destinos fornecidos como Governo Federal e Diário Oficial. Reutilizar o componente de links com rótulo significativo, URL validada e comportamento de abertura, separado da árvore do Institucional.

**Dados de outro módulo / serviço compartilhado:** TDEP-14/15 — componentes; URLs autorizadas pela Administração. Não há conector de dados exigido por este item.

**Demonstração:** Cadastrar destinos de teste/autorizados, abrir pela área pública e conferir endereço e comportamento. Alterar um destino no gerenciador e validar sem deploy.

**Aceite técnico:** Links são funcionais e atualizáveis e não redirecionam para outro destino por erro de contexto.

**Atenção / limite:** Um link não comprova integração PNCP, publicação no Diário Oficial ou acesso federado. Não contratar serviço de publicação por causa desta navegação.

<a id="ptr-039"></a>
#### PTR-039 — Programas, projetos e ações

**TR — PORTAL DA TRANSPARÊNCIA, item 39, p. 148:**

> Disponibilizar informações sobre programas, projetos e ações;

**Implementação:** Publicar informações dos programas, projetos e ações, mantendo relações, unidade e período da fonte quando disponíveis. Usar consulta estruturada ou fichas de publicação que referenciem os registros existentes, sem criar novo planejamento municipal.

**Dados de outro módulo / serviço compartilhado:** TDEP-04 — Planejamento; TDEP-01 — contexto institucional; TDEP-14 — apresentação e documentos.

**Demonstração:** Abrir programa, projeto e ação de F-T-ADM, navegar entre os vínculos e conferir as informações com Planejamento. Atualizar descrição autorizada na origem e verificar publicação.

**Aceite técnico:** Os três tipos de informação ficam identificáveis e relacionados; não são apenas termos num texto sem registros correspondentes.

**Atenção / limite:** Não exigir novos indicadores, metas ou fórmulas não enumerados no item. Registrar em Q-T05 o conjunto de dados público disponível.

<a id="ptr-040"></a>
#### PTR-040 — Obras públicas municipais

**TR — PORTAL DA TRANSPARÊNCIA, item 40, p. 148:**

> Disponibilizar informações sobre as obras públicas municipais;

**Implementação:** Disponibilizar informações das obras municipais a partir da fonte identificada, com descrição, localização publicável, situação e referências de projeto/contrato quando existentes. Documentos complementares podem usar o repositório, sem criar acompanhamento de engenharia dentro do portal.

**Dados de outro módulo / serviço compartilhado:** TDEP-11 — Obras/Infraestrutura; TDEP-07/04 para contratos e projetos; TDEP-14 — arquivos autorizados.

**Demonstração:** Abrir obra demonstrativa de F-T-ADM e conferir situação e vínculo com seu contrato. Atualizar na origem um dado publicável e observar a correspondência.

**Aceite técnico:** A seção apresenta obras e informações reais da fonte escolhida, com acesso à ficha e aos documentos publicados.

**Atenção / limite:** O item não exige mapa, imagens aéreas, sensores ou medição física pelo portal. Fonte ausente fica identificada como dependência, não como obra concluída ficticiamente.

<a id="ptr-041"></a>
#### PTR-041 — Inserção dos relatórios de planejamento e contas

**TR — PORTAL DA TRANSPARÊNCIA, item 41, p. 148:**

> Disponibilizar campo para inserção dos relatórios instrumentos de planejamento: PPA, LDO, LOA, RGF, RREO e Prestação de contas;

**Implementação:** Na administração da Transparência, oferecer cadastro/upload/associação dos relatórios de PPA, LDO, LOA, RGF, RREO e Prestação de contas, com tipo e contexto de publicação. Usar o mesmo recurso documental de PTR-015/047, mantendo cada categoria selecionável.

**Dados de outro módulo / serviço compartilhado:** TDEP-04 — documentos quando fornecidos pela origem; TDEP-14 — upload, armazenamento e publicação. Não elaborar os relatórios contábeis aqui.

**Demonstração:** Em F-T-DOC, inserir um arquivo válido de teste de cada um dos seis grupos, publicar e abrir anonimamente; filtrar por tipo e exercício.

**Aceite técnico:** A função de inserção existe para todos os grupos e o arquivo correto pode ser consultado. Integração automática não elimina o cadastro/upload expressamente previsto.

**Atenção / limite:** Não substituir arquivos por links vazios ou screenshots da tela de orçamento. Conteúdo oficial e modelos devem ser fornecidos pelo módulo/órgão responsável.

<a id="ptr-042"></a>
#### PTR-042 — Documentos do Controle Interno

**TR — PORTAL DA TRANSPARÊNCIA, item 42, p. 148:**

> Permitir publicação de documentos do Controle Interno, a exemplo: Instruções Normativas, relatórios de Auditoria, Recomendações e pareceres;

**Implementação:** Permitir publicar instruções normativas, relatórios de auditoria, recomendações e pareceres do Controle Interno, com tipo, contexto e arquivo integral da versão autorizada. Reaproveitar a biblioteca de publicações.

**Dados de outro módulo / serviço compartilhado:** TDEP-12 — documentos; TDEP-14 — arquivos e publicação. Seleção do que é público é identificada e não depende de abrir toda a pasta do Controle Interno.

**Demonstração:** Inserir/publicar os quatro tipos demonstrativos de F-T-DOC; abrir cada arquivo na área pública e confirmar que um anexo restrito separado continua indisponível.

**Aceite técnico:** Documentos aparecem nas categorias corretas e podem ser lidos/baixados sem revelar material restrito relacionado.

**Atenção / limite:** Não desenvolver auditoria, recomendação ou parecer de mérito dentro da Transparência. Não declarar que o upload genérico decide a classificação jurídica do documento.

<a id="ptr-043"></a>
#### PTR-043 — Publicação de documentos no portal

**TR — PORTAL DA TRANSPARÊNCIA, item 43, p. 148:**

> Possibilitar a publicação de documentos no Portal da Transparência, conforme determina a Lei Nº 12.527/11;

**Implementação:** Disponibilizar a publicação documental contextualizada na Transparência, com identificação, arquivo, visibilidade e consulta pública da versão autorizada. Aplicar privacidade, classificação e integridade do repositório; a função complementa os conjuntos de documentos dos demais itens.

**Dados de outro módulo / serviço compartilhado:** TDEP-14 — repositório/publicações; TDEP-04/07/12 conforme origem do documento. A própria tela de publicar pertence ao escopo do portal.

**Demonstração:** Publicar um documento público de F-T-DOC, manter outro privado e testar URLs diretas, listagem, busca e download anônimos. Conferir que a prévia privada não ficou acessível pelo cache.

**Aceite técnico:** A publicação opera de ponta a ponta e respeita a versão/visibilidade configuradas.

**Atenção / limite:** Q-T01/T02: o enunciado menciona lei, mas não enumera todos os seus deveres. Publicar arquivos não permite afirmar conformidade jurídica integral sem análise específica.

<a id="ptr-044"></a>
#### PTR-044 — Seleção de entidades e menus exibidos

**TR — PORTAL DA TRANSPARÊNCIA, item 44, pp. 148–149:**

> Permitir, através de configuração, que o portal possa ser configurado de forma a apresentar somente as entidades e menus que o município desejar demonstrar;

**Implementação:** Criar configuração por portal para escolher entidades publicantes e menus exibidos. Usar a lista real de entidades, aplicando o escopo nas consultas, fichas, exportações e documentos. Configuração da Transparência não altera automaticamente a Institucional.

**Dados de outro módulo / serviço compartilhado:** TDEP-01 — entidades e permissões; TDEP-14/15 — menus/configuração e projeção pública.

**Demonstração:** Em F-T-ENT/F-T-DESP, selecionar somente UG-A e conferir totais 15.000/8.000/5.500 no corte inicial. Tentar acessar E-B1 diretamente; reabilitar UG-B e conferir 18.000/9.000/6.300. Alterar um menu sem afetar o outro portal.

**Aceite técnico:** Entidades/menus configurados determinam a apresentação e o escopo público de dados, sem apagar registros da origem.

**Atenção / limite:** Q-T06: manter trilha e definir acesso direto. Desabilitar entidade/menu não equivale a dispensa das publicações exigidas e não pode encobrir integração incompleta.

<a id="ptr-045"></a>
#### PTR-045 — Ativação e desativação de menus nativos

**TR — PORTAL DA TRANSPARÊNCIA, item 45, p. 149:**

> Possibilidade de ativar ou desativar menus nativos do sistema, permitindo que o município configure qual consulta deseja exibir;

**Implementação:** Oferecer ativar/desativar consultas nativas da Transparência pela administração, mantendo sua configuração e referência. Reutilizar motor de menus, mas separar disponibilidade da consulta e situação do dado de origem; seguir a política de rota pública da seção 12.4.G.

**Dados de outro módulo / serviço compartilhado:** TDEP-14/15 — menus nativos e permissões. Não alterar situação do contrato, servidor ou lançamento ao desligar a consulta pública.

**Demonstração:** Desativar Passagens em F-T-ENT, conferir ausência no menu e comportamento da rota direta; reativar e recuperar a mesma consulta/dados. Confirmar que menus do Institucional permaneceram iguais.

**Aceite técnico:** Menu nativo pode ser habilitado/desabilitado sem exclusão do dado nem intervenção no código.

**Atenção / limite:** Não confundir opção visual com autorização para remover conteúdo legalmente devido. Q-T06 registra responsabilidade e política de exposição.

<a id="ptr-046"></a>
#### PTR-046 — Filtros e busca por palavra-chave

**TR — PORTAL DA TRANSPARÊNCIA, item 46, p. 149:**

> O sistema deverá permitir ao cidadão pesquisar as informações por meio de filtros, de forma simples e de fácil operação e, quando não for possível utilizar este recurso, proporcionar a busca através de um campo de busca por palavra-chave;

**Implementação:** Implementar filtros simples adequados a cada conjunto — entidade, exercício/período, etapa, tipo ou identificação disponível — e busca por palavra-chave quando o filtro estruturado não for adequado. Aplicar consulta ao conjunto público completo no servidor, com ordenação estável e total do recorte.

**Dados de outro módulo / serviço compartilhado:** TDEP-15 e as fontes de cada consulta; o serviço não expõe busca livre de SQL nem registros privados.

**Demonstração:** Em F-T-PAG, buscar uma aquisição que estaria na terceira página; filtrar tipo/período e abrir/voltar da ficha sem perder contexto. Na biblioteca textual, usar palavra-chave, testar resultado vazio e falha de origem.

**Aceite técnico:** Filtros/busca retornam o conjunto correto, não somente as linhas carregadas. O cidadão distingue vazio de indisponibilidade e consegue corrigir os critérios.

**Atenção / limite:** Não exigir busca semântica/IA ou filtro universal por todo campo do ERP. Todos os parâmetros devem respeitar a projeção pública e a máscara configurada.

<a id="ptr-047"></a>
#### PTR-047 — Upload administrativo e download de documentos

**TR — PORTAL DA TRANSPARÊNCIA, item 47, p. 149:**

> Permitir o download de documentos, tais como: Plano Plurianual, Lei de Diretrizes Orçamentárias, Lei Orçamentária Anual, Relatórios de Gestão Fiscal, Relatórios Resumidos da Execução Orçamentária, Balancetes mensais, Íntegra dos contratos, editais e resultados dos editais, bem como qualquer outro documento exigido pelos órgãos supervisores do Portal da Transparência, através de publicação manual (upload) de cada documento, por uma área administrativa do Portal da Transparência;

**Implementação:** Implementar na administração da Transparência a publicação manual de cada documento, via upload ao repositório compartilhado, com categoria e contexto. Contemplar PPA, LDO, LOA, RGF, RREO, balancetes mensais, íntegra de contratos, editais, resultados e outros documentos autorizados. O público abre/baixa o arquivo correspondente.

**Dados de outro módulo / serviço compartilhado:** TDEP-14 — upload, objetos e versões; TDEP-04/07/12 para documentos de origem. Recurso compartilhado com POR não elimina o ponto de operação da Transparência.

**Demonstração:** Executar F-T-DOC pelos controles da Transparência, não apenas pela tela geral do Institucional. Abrir e baixar os grupos citados, conferir conteúdo integral e testar documento privado em separado.

**Aceite técnico:** Usuário autorizado publica manualmente e o cidadão baixa os arquivos certos. A existência de dados integrados não substitui esse fluxo manual expressamente descrito.

**Atenção / limite:** Não criar PDF vazio só para cada categoria nem permitir publicar arquivo privado por URL bruta. Documentos assinados devem conservar a versão apropriada ou identificar claramente a versão de publicação.

<a id="ptr-048"></a>
#### PTR-048 — Exportação em formatos abertos e analisáveis

**TR — PORTAL DA TRANSPARÊNCIA, item 48, p. 149:**

> Possibilitar exportar as informações do Portal da Transparência em diversos formatos eletrônicos, inclusive abertos e não proprietários, tais como planilhas e texto, de modo a facilitar a análise das informações;

**Implementação:** Permitir exportar o conjunto de informações públicas selecionadas em formatos estruturados e documentos pelo núcleo, incluindo planilhas/texto utilizáveis. Preservar campos, tipos, unidades, máscara e total do filtro; imagem da tabela não é dado analisável.

**Dados de outro módulo / serviço compartilhado:** TDEP-15 — exportadores; fontes de dados pertinentes. Mesma consulta pública, sem acesso irrestrito ao cadastro interno.

**Demonstração:** Em F-T-EXP, exportar os 27 registros e conferir que um arquivo de texto/CSV contém todos, com cabeçalho e R$ 270,00 no conjunto, mesmo com dez linhas na tela.

**Aceite técnico:** Dados são extraíveis e conferíveis além da página visível, sem perder acentos, identificadores ou valores por conversão.

**Atenção / limite:** O requisito não autoriza abrir API pública irrestrita ou disponibilizar cópia integral do banco. Não tratar PDF escaneado como substituto de formatos abertos estruturados.

<a id="ptr-049"></a>
#### PTR-049 — Exportações PDF, XLS, XLSX, RTF e CSV

**TR — PORTAL DA TRANSPARÊNCIA, item 49, p. 149:**

> Permitir exportar os dados publicados para arquivos em diversos formatos, tais como PDF, XLS, XLSX, RTF e CSV;

**Implementação:** Implementar/adaptar os cinco formatos citados, compartilhando a projeção de dados e os filtros: PDF, XLS, XLSX, RTF e CSV. Testar o formato real, não somente extensão/MIME. Tratar identificadores como texto quando apropriado, valores como números e conteúdo não confiável sem execução de fórmula.

**Dados de outro módulo / serviço compartilhado:** TDEP-15 — geração de arquivos. Uma capacidade faltante no exportador é parte a completar/registrar para este item, não motivo para trocar silenciosamente XLS por XLSX.

**Demonstração:** Exportar F-T-EXP nos cinco formatos; abrir com leitor compatível e conferir 27 registros, total R$ 270,00, acentos, máscara e primeiro/último registro. Verificar estrutura real de XLS e RTF.

**Aceite técnico:** Os cinco arquivos são gerados e lidos corretamente, com mesmo recorte. Não existe CSV renomeado para .xls ou HTML apresentado como RTF.

**Atenção / limite:** Não instalar pacote ou versão sem examinar o projeto. O usuário não pediu nova ferramenta de relatórios genérica; adaptar o serviço comum apenas no necessário.

<a id="ptr-050"></a>
#### PTR-050 — Migração de pelo menos seis meses

**TR — PORTAL DA TRANSPARÊNCIA, item 50, p. 149:**

> Permitir a migração de dados de outro(s) sistema, trazendo informação de no mínimo em 06 (seis) meses;

**Implementação:** Criar mapeamento e rotina de importação histórica da origem identificada, com validação, chaves, datas, unidade/exercício, valores e documentos do escopo acordado. Abranger no mínimo seis meses e permitir conferência antes de publicar. Usar staging ou mecanismo equivalente compatível com o projeto e proteção contra reimportação duplicada.

**Dados de outro módulo / serviço compartilhado:** TDEP-16 — arquivos/legado e documentação; TDEP-14/15 — persistência de publicação e relatórios de conferência. Não recontabilizar fatos migrados nos módulos operacionais.

**Demonstração:** Importar F-T-MIG de abril a setembro/2026: seis registros/seis competências, R$ 2.100,00. Consultar cada mês, reimportar e confirmar mesmos totais. Em lote separado, apontar data inválida e referência não mapeada antes de publicação.

**Aceite técnico:** O importador conserva os seis meses, os vínculos e os totais, com relatório de rejeições e sem duplicação. A migração real exige validar o lote autorizado do sistema de origem.

**Atenção / limite:** Q-T07: formato/volume/abrangência do legado não foram fornecidos. A fixture prova mecanismo, não migração de produção. Não retirar essa capacidade sob a antiga exclusão de importador do Institucional.

<a id="ptr-051"></a>
#### PTR-051 — Integração com os seis grupos de sistemas da gestão

**TR — PORTAL DA TRANSPARÊNCIA, item 51, p. 149:**

> O Portal deve ser integrado com os Sistemas de Contabilidade Pública, Gestão Administrativa, Gestão Financeira e Tesouraria, Planejamento Municipal, Recursos Humanos e Folha de Pagamento e Gestão de Tributos;

**Implementação:** Implementar o lado consumidor e o mapeamento de publicação para cada grupo nomeado: Contabilidade Pública, Gestão Administrativa, Gestão Financeira e Tesouraria, Planejamento Municipal, RH e Folha de Pagamento e Gestão de Tributos. Podem ser áreas do mesmo CeleriFlow: integração não exige fornecedor externo, mas precisa consumir fatos reais, respeitar origem e propagar mudanças.

**Dados de outro módulo / serviço compartilhado:** TDEP-02, TDEP-01/07/08/09 conforme Gestão Administrativa, TDEP-03, TDEP-04, TDEP-05 e TDEP-06. Confirmar serviços e escopos reais; demais vínculos mantêm os itens específicos.

**Demonstração:** Executar quadro de integração com uma prova por grupo: empenho E-A1; aquisição administrativa; pagamento adicional; programa/documento do Planejamento; competência de F-T-RH; arrecadação tributária identificada. Alterar dado pertinente na origem de cada grupo, conferir chegada e ausência de duplicação. Registrar evento, fonte, consulta e resultado.

**Aceite técnico:** Cada um dos seis grupos tem fonte real localizada, fluxo consumidor implementado e evidência de ida do dado à publicação. Compartilhar banco, mostrar um link ou testar somente Contabilidade não fecha o item.

**Atenção / limite:** Q-T08: contratos de dados não foram inspecionados. Origem ausente fica como dependência com ID e campo faltante. Não desenvolver outro ERP nem publicar extratos fiscais privados para alegar integração de Tributos.


<a id="ptr-matriz"></a>
### 12.7 Testes transversais e matriz de execução da Transparência

| Teste | Evidência objetiva |
|---|---|
| Separação dos dois módulos | Menu/contexto próprios; alterar notícia não altera despesa e alterar tema da Transparência não altera publicação Institucional não compartilhada. |
| Repositório comum | Um recurso autorizado pode ter duas referências; remover só uma publicação não exclui o arquivo da outra. Privacidade global continua respeitada. |
| Estágios financeiros | R$ 18.000 empenhados, R$ 9.000 liquidados, R$ 6.300 pagos, sem soma indevida de etapas e sem multiplicação por anexos/itens. |
| Identidade por unidade/exercício | Número 001-2026 de UG-A é distinto do 001-2026 de UG-B; mesmo princípio para matrícula e documento legado. |
| Campos mínimos | Checklist de 19 componentes de PTR-018, cinco do pagamento, cinco do empenho, seis grupos funcionais em PTR-031, componentes de remuneração e dados de diária. |
| Atualização de origem | Pagamento adicional de R$ 500 passa o total a R$ 6.800 sem deploy/redigitação; repetição técnica não aumenta de novo. |
| Receita integrada | Previsto 15.000 e arrecadado 10.000; registro tributário referenciado na Contabilidade é contado uma vez; arrecadação adicional de 200 leva a 10.200. |
| Remuneração | Bruto 9.000, descontos 1.400, líquido 7.600, por competência e vínculo; sem conta bancária ou dados privados de saúde/dependentes. |
| Upload e documentos | Publicar manualmente os grupos exigidos na administração da Transparência, baixar íntegra e conferir versão, entidade e período. |
| E-SIC | Quatro pedidos, recurso vinculado, resposta, estatística e publicação controlada; recurso não é quinto pedido. |
| Filtro e exportação | Base isolada com 27 itens/270; páginas 10/10/7; exportação completa e máscara coerente nos cinco formatos. |
| Migração | Seis competências/2.100, reexecução sem duplicação, rejeição de lote inválido e indicação do que depende do legado real. |
| Entidade/menu | Exposição configurada aplica-se aos dados e à navegação sem alterar a origem ou esconder pendência de implementação. |
| Falhas | Erro de origem/arquivo não vira zero, vazio ou sucesso; última posição conhecida é datada quando apresentada. |
| Acessibilidade e dispositivos | Teclado, rótulos, foco, zoom, contraste, desktop e Chrome real; integralidade preservada em fichas/documentos. |
| Integração completa | Uma prova real por cada um dos seis grupos de PTR-051, com identificação da origem; mocks registrados separadamente. |

A matriz abaixo começa sem validação de software. Para cada ID, preencher **tela/rota real, fonte, estado da implementação, teste, evidência e pendência**. Os códigos de TDEP descrevem responsabilidade; substituir por referências concretas apenas depois de inspecionar o repositório.

| ID | Estado inicial | Tela/rota real | Fonte/serviço real | Teste/evidência | Pendência |
|---|---|---|---|---|---|
| PTR-001 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-002 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-003 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-004 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-005 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-006 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-007 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-008 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-009 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-010 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-011 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-012 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-013 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-014 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-015 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-016 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-017 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-018 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-019 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-020 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-021 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-022 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-023 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-024 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-025 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-026 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-027 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-028 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-029 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-030 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-031 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-032 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-033 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-034 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-035 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-036 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-037 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-038 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-039 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-040 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-041 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-042 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-043 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-044 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-045 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-046 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-047 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-048 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-049 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-050 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |
| PTR-051 | A_VERIFICAR | A mapear | A confirmar conforme TDEP | Não executado | Registrar origem/definição, se ausente |

Usar os estados da seção 9.2 e distinguir `VALIDADO_LOCAL`, `TESTADO_COM_SIMULADOR` e `INTEGRACAO_TESTADA_HOMOLOGACAO`. Uma coluna de código pronto não substitui a de integração comprovada. Migrar fixture não é migrar dados reais; publicar um PDF não equivale a disponibilizar execução em tempo real. Nenhum teste deste documento foi executado no CeleriFlow nesta elaboração.

<a id="ptr-pendencias"></a>
### 12.8 Definições e pendências da Transparência

#### Q-T01 — Conteúdo normativo e acessibilidade

PTR-007 menciona Normas Brasileiras de Acessibilidade sem especificação/nível/mecanismo de aprovação; PTR-011/015/043 citam divulgação e leis, mas não fornecem todos os parâmetros operacionais. Preservar o texto e demonstrar as capacidades. Identificar com a Administração os documentos, referências e critérios aplicáveis; não preencher lacunas com norma escolhida por suposição nem declarar conformidade integral apenas com testes de interface. A revisão usa o TR como base e não incorpora pesquisa jurídica externa.

#### Q-T02 — Política de publicação, máscara e dados pessoais

Definir a máscara de CPF/CNPJ prevista em PTR-018, composição publicável de remuneração e procedimento de publicação de manifestações/documentos. O controle deve ser uniforme nas APIs públicas, buscas, arquivos, cache e telas. Não publicar dados privados por padrão nem retirar valores/campos expressos do TR sem registrar a incompatibilidade e a solução autorizada.

#### Q-T03 — Temporalidade e significados financeiros

Definir latência/critério de disponibilidade de PTR-016, fuso e corte dos períodos, datas usadas em cada etapa, tratamento de ajustes e significado dos estágios de receita. Este plano propõe consumo atual/acionado por evento e medição; não inventa prazo legal. Estágios distintos e fatos correlatos não são somados como se fossem categorias de despesa independentes.

#### Q-T04 — E-SIC

Identificar o serviço existente, forma de identificação/acompanhamento, prazos, regra de recurso, responsáveis, equivalência de situações e quais versões podem ser publicadas. Implementar capacidades e testes sem estabelecer rito jurídico não fornecido. A estatística deve informar se usa estado final no corte ou eventos históricos; o cenário F-T-SIC explicita ambos sem misturá-los.

#### Q-T05 — “Informações mínimas” sem enumeração

PTR-023/024/029/030/034/036/037/039/040 contêm trechos amplos ou não enumeram todos os campos. O plano indica dados práticos para demonstrar a função, não lista adicional do TR. Confirmar fonte e conjunto esperado, inclusive CAFIMP, passagens, obras e significado de compra realizada. Não declarar um cadastro inativo como impedimento de licitar, nem publicar todas as colunas da origem por falta de regra.

#### Q-T06 — Entidades, menus e acessos diretos

Definir entidades publicantes, menus iniciais e comportamento de consultas nativas desativadas. O plano propõe restringir a rota pública da consulta desativada, mantendo intactos os dados e a operação interna. Registrar impacto e autorização; esse recurso de configuração não é dispensa de informação devida nem ferramenta para ocultar um requisito não implementado.

#### Q-T07 — Migração

Obter sistema de origem, formatos, arquivos, período mínimo, volume, entidades, documentos e mapeamento autorizado. Demonstrar primeiro com legado fictício explicitamente rotulado; concluir migração com conferência dos dados realmente fornecidos. Não pressupor apenas PDF mensal quando houver dados estruturados no escopo da origem. Não executar importação na base de produção sem procedimento e autorização.

#### Q-T08 — Contratos de dados e serviços

Confirmar os seis grupos de PTR-051 e os demais serviços das consultas. Quando o ERP usar um só banco, definir leitura autorizada e identidade dos fatos; quando houver integrações remotas, localizar contrato, credencial e ambiente. Faltas devem citar o campo/serviço e os IDs afetados. Não criar simulador de banco, PNCP, Tribunal ou provedor fiscal para um item que só exige publicação de dados já produzidos.

### 12.9 Testes locais, integrações reais e limites de simulação

| Componente | O que pode ser testado localmente | O que exige comprovação adicional |
|---|---|---|
| CMS, menus, consultas, filtros e E-SIC nativo | Operações reais da aplicação sobre banco de teste e dados fictícios. | Execução real das telas, permissões e persistência; não basta arquivo HTML estático. |
| Fontes de outros módulos | Fixtures/testes de contrato verificam o consumidor, formatos e falhas. | Alterar o dado no módulo de origem e verificar publicação; não chamar fixture de integração concluída. |
| Migração | Lote legado fictício e mapeamento declarado, com erros e reexecução. | Arquivos autorizados e conferência final da origem real para declarar migração concluída. |
| Objetos em nuvem | Emulador exercita contrato e falha de upload. | Recurso gravado/lido no serviço de nuvem disponível, com privacidade comprovada. |
| E-mail do Institucional e contatos/E-SIC quando adotados | Captura local confere mensagem. | Recebimento em caixa controlada; teste não envia dados de ensaio a cidadãos reais. |
| Download e exportação | Arquivos reais gerados da base de teste, abertos e comparados. | Não dependem de órgão homologador por este item; ainda exigem formatos válidos e conteúdo coerente. |

**Não há, no bloco Transparência, exigência de API PNCP, consulta bancária, transmissão ao Tribunal ou pagamento.** Essas podem ser responsabilidades dos sistemas de origem. O PTR-038 é navegação por links, o PTR-051 é integração com os grupos de gestão e o PTR-050 é migração; não fundir essas três entregas.

---
<a id="plano-conjunto"></a>
## 13. Plano conjunto, conferência e conclusão

### 13.1 Uma sequência de desenvolvimento, duas trilhas funcionais

Os pacotes Institucionais da seção 8 continuam como detalhamento de POR, mas agora são executados sob a coordenação abaixo. **Não desenvolver uma segunda infraestrutura de publicação para PTR** nem aguardar terminar todas as notícias/enquetes antes de inspecionar as fontes financeiras.

| Pacote conjunto | Desenvolvimento | Rastreabilidade |
|---|---|---|
| **J0 — Diagnóstico e fontes** | Confirmar código, dois acessos, permissões, banco, objetos, editor, e-mail, exportadores, fontes de gestão e legado. Abrir Q-P/Q-T realmente pendentes. | Todos os 185, ainda sem validação de execução. |
| **J1 — Base comum e separação** | Componentes visuais, contextos de portal, administração, público, menus, acessibilidade, arquivos e privacidade. | POR-001 a POR-019; POR-124 a POR-134; PTR-001 a PTR-004, PTR-007/008/044/045. |
| **J2 — CMS Institucional e informação pública** | Menus/páginas, editor e conteúdo; glossário, FAQ, manual, organização, Carta de Serviços, SIC físico e links da Transparência. | POR-020 a POR-035, POR-104 a POR-123; PTR-005/006/009 a PTR-014/036/038. |
| **J3 — Editorial Institucional** | Agendas, notícias, galerias, questionários, enquetes e newsletter usando a base comum. | POR-036 a POR-103, com ressalvas de fonte preservadas. |
| **J4 — Documentos da Transparência** | Biblioteca de publicações por contexto/tipo/período, upload manual, download integral e vínculos públicos seguros. | PTR-015/027/028/041/042/043/047; infraestrutura de POR já compartilhada. |
| **J5 — Execução e integrações** | Despesas/etapas, receitas/estágios, repasses, identidade por UG/exercício, atualização real e seis grupos integrados. | PTR-016 a PTR-025 e PTR-051, com os demais consumidores relacionados. |
| **J6 — Gestão administrativa e pessoal** | Compras, bens, estoque, folha, diárias, passagens, impedimentos, programas e obras. | PTR-026 a PTR-034, PTR-037/039/040. |
| **J7 — E-SIC** | Entrada, acompanhamento, recurso, resposta, estatística e publicação controlada; integração ao serviço existente quando aplicável. | PTR-035; informações do SIC físico em PTR-036. |
| **J8 — Busca, formatos e legado** | Filtros globais, exportações reais e migração validada de seis meses ou mais. | PTR-046/048/049/050; uso transversal nos demais PTR. |
| **J9 — Ensaio conjunto** | Rodar cenários POR e PTR, comprovar isolamento entre portais, dados compartilhados, integrações e regressões. | Matrizes POR-001 a POR-134 e PTR-001 a PTR-051. |

J5, J6 e J8 devem identificar suas fontes já em J0. Não estimar tempo/custo sem diagnóstico. Reutilizar função comprovadamente operacional, sem reescrevê-la só para seguir a numeração dos pacotes. Pendente em um serviço de origem não impede avançar no CMS ou no importador, mas impede declarar o resultado integrado como concluído.

### 13.2 Entrega exigida do agente

Entregar os dois módulos em funcionamento no CeleriFlow, com rotas reais identificadas, listas paginadas, fichas completas, publicações, arquivos, testes e matrizes preenchidas. Registrar somente arquivos e comandos efetivamente utilizados. Uma sugestão de organização é um documento de acompanhamento dos portais com as duas matrizes; o caminho deve ser confirmado no repositório.

A evidência contém: ID, contexto/entidade, fonte, usuário/perfil, dado inicial, ação, resultado observado, data/latência quando pertinente, arquivo emitido e pendência. Os screenshots são complementares: não provam sozinhos que houve pagamento de origem, integração, gravação em nuvem ou proteção do payload.

Não encerrar com as seguintes situações:

- Transparência representada apenas por link ou páginas de texto, sem consultas e integrações.
- Uma tabela financeira alimentada manualmente no CMS e apresentada como publicação em tempo real.
- Folha que expõe dados privados fora do conjunto publicável, ou máscara aplicada só na tela.
- E-SIC sem recurso, estatística ou publicação controlada.
- Exportação de apenas uma página, XLS/RTF falsificados por extensão ou migração sem seis meses conferíveis.
- Alteração em uma configuração de portal que modifica indevidamente o outro.
- POR-075 declarado atendido sem complemento da fonte; POR-054/118 corrigidos silenciosamente.

### 13.3 Auditoria documental da REV02

| Verificação | Portal Institucional | Portal da Transparência | Conjunto |
|---|---:|---:|---:|
| Entradas do TR preservadas | 134 | 51 | **185** |
| Citações individuais com texto e página | 134 | 51 | **185** |
| Blocos de orientação individual | 134 | 51 | **185** |
| Numeração própria mantida | POR-001–134 | PTR-001–051 | Sem renumerar um bloco dentro do outro |
| Implementações do ERP executadas nesta revisão documental | 0 | 0 | **0** |

A conferência programática compara as 134 citações Institucionais com a REV01 e com o PDF e as 51 citações novas com duas extrações do PDF, normalizando somente espaços/quebras. Verificam-se IDs, links internos, presença dos campos de orientação, matriz, cobertura dos pacotes e contas das fixtures. Essa verificação documental não substitui execução do CeleriFlow nem constitui aprovação da POC.

A aderência foi verificada pela relação entre **componentes reutilizáveis** e **dados/ações próprios**, e não pelo número de palavras iguais nos dois blocos. Conclusão: é apropriado compartilhar o desenvolvimento e a base visual/documental, mas **não é correto fundir Transparência em uma página editorial nem somar funções comuns para declarar requisitos adicionais inexistentes**.

### 13.4 Fontes e prevalência desta revisão

- **TR-INSTITUCIONAL:** `termo de referencia (Ratificado)(1).pdf`, seção 19, Portal Institucional, pp. 310–320, itens 1–134.
- **TR-TRANSPARÊNCIA:** mesmo PDF, Portal da Transparência, pp. 145–149, itens 1–51.
- **BASE REV01:** `CeleriFlow_POC_Portal_Institucional_Desenvolvimento_REV01.md`, última versão disponibilizada nesta conversa, com prefixo POR. Preservada a rastreabilidade anterior; corrigidos somente os limites que precisavam acolher o segundo módulo no mesmo desenvolvimento.
- **DIRETRIZES DO USUÁRIO:** separar os dois módulos, desenvolver em conjunto, preservar qualidade/eficiência do ERP, usar o mesmo site no Chrome do celular e destacar dados provenientes de outros módulos.

Não foram utilizados exemplos de outro portal para inventar requisitos. Regras de apresentação, valores de ensaio, campos propostos onde o TR é amplo, modos de teste e contratos internos são decisões de desenvolvimento identificadas, não texto normativo. O TR e os esclarecimentos oficiais aplicáveis prevalecem sobre hipóteses deste plano.

**Este arquivo substitui a REV01 isolada como instrução de desenvolvimento dos portais.** Manter a antiga somente como histórico. Resultado esperado: **Portal Institucional e Portal da Transparência distintos, integrados ao mesmo CeleriFlow, com infraestrutura compartilhada e comprovação individual dos 185 IDs, sem disfarçar dependências ou a redação incompleta do Institucional.**
