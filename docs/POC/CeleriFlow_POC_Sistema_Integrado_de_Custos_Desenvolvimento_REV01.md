# CeleriFlow — Plano de desenvolvimento e demonstração da POC
## Sistema Integrado de Custos | Divino de São Lourenço/ES

**REV01 — 19/09/2026.**

**Fonte:** `termo de referencia (Ratificado)(1).pdf`, 335 páginas, Processo Administrativo nº 1026/2026, seção técnica **Sistema Integrado de Custos**, pp. **320–321**.

**Cobertura:** **20 entradas numeradas**, de **CUS-001** a **CUS-020**, preservando o número original e os subtítulos. 20 entradas; a de número 13 introduz o conjunto de coleta e integração. Apropriação contábil existente é uma fonte; o sistema integrado de custos ainda precisa configurar objetos, planos, distribuição, períodos e demonstrativos.

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

Reutilizar ou criar **uma entrada identificável “Custos”** no catálogo/menu do CeleriFlow. As áreas abaixo são subáreas internas; não criar outra identidade, banco de cadastros ou aplicativo independente para cada grupo. Nomes de rotas/tabelas não foram presumidos.

| Área interna proposta | Regra |
|---|---|
| Estruturas e equipamentos públicos | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Centros/objetos/planos acumuladores | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Fontes e coleta | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Critérios de apropriação | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Apurações por período | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Demonstrativos e painéis | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Rastreabilidade e configurações | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |

Antes de desenvolver, registrar `fonte existente`, `capacidade própria a implementar` e `dependência externa`. Não executar uma segunda vez operação que já pertence ao módulo de origem. Card/menu não significa requisito atendido.

<a id="pacotes"></a>
## Pacotes operacionais e cenários conectados

Os grupos seguintes são organização de desenvolvimento; não substituem a divisão original do TR. Usar cada contrato como fundamento dos testes individuais. Os cenários são independentes salvo vínculo expresso: não misturar cargas auxiliares de paginação com os totais financeiros principais.

<a id="pacote-k01"></a>
### K01 — Apuração de custos e rastreabilidade

**Cobertura:** CUS-001 a CUS-020 — 20 entradas.

Separar fato de gestão, valor de custo apropriável, critério de distribuição, plano acumulador, objeto/equipamento público, centro de custo, função e competência. Folha, consumo, depreciação, frota e contrato podem referenciar o mesmo fato contábil: preservar origem econômica para não contar duas vezes. Valores pagos não são automaticamente custo do mesmo mês; regra contábil e regime vêm da configuração validada.

Custos diretos vão ao objeto correspondente; indiretos seguem direcionador e pesos identificados. Distribuir mantém soma original, incluindo tratamento determinístico dos centavos; divisor zero produz pendência, não divisão por zero ou perda de valor. Alterar regra não reescreve apuração histórica publicada sem nova versão/reprocessamento autorizado.

Planos acumuladores agregam elementos/objetos conforme configuração. Apurar mensal/trimestral/anual sem somar o consolidado com seus componentes. Relatórios analíticos permitem voltar ao fato e à fórmula, sintéticos mostram os totais no mesmo recorte. Indicador físico usa variável/unidade, não mistura alunos, atendimentos e metros quadrados. Georreferenciar equipamento público não significa implantar outro SIG.

**Base e demonstração conectada:** K-CUSTOS: escola com custos diretos de folha R$ 12.000,00 + estoque R$ 2.000,00 + patrimônio R$ 500,00 = R$ 14.500,00. Saúde com R$ 18.000,00 + R$ 4.000,00 + R$ 500,00 = R$ 22.500,00. Indiretos: frota R$ 1.000,00 + contrato R$ 1.500,00 = R$ 2.500,00; pesos DEMO 60%/40% resultam em R$ 1.500,00 / R$ 1.000,00. Totais: escola R$ 16.000,00; Saúde R$ 23.500,00; conjunto R$ 39.500,00. Divisores físicos: 400 alunos e 500 atendimentos, produzindo R$ 40,00/aluno e R$ 47,00/atendimento. Três competências iguais e independentes somam R$ 118.500,00. Não somar alunos a atendimentos.

**Origens de dados:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Limites e decisões:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

<a id="integracoes"></a>
## Fontes, contratos e integrações

A tabela distingue integração exigida, arquivo de intercâmbio, serviço compartilhado e definição externa. As origens são previstas, não endpoints cuja existência foi confirmada. **Os simuladores são ferramentas internas de teste; não substituem a contraparte nem a autorização de demonstração pela comissão.**

| Ref. | Origem/capacidade | Itens/contexto | Entrega | Teste controlado | Dependência para comprovar |
|---|---|---|---|---|---|
| CU-DEP01 | Folha, Contabilidade, Estoque, Patrimônio, Frotas e Contratos | CUS-001/002/014–016 | Coleta por API, arquivos ou conexão segura, manual/automática conforme a função. | K-CUSTOS com fontes identificadas, duplicata e dado faltante. | Validar conexão real e rastreabilidade por fato econômico. |
| CU-DEP02 | Identidade, geografia, relatórios e backup | CUS-003/004/006/012/020 | Permissão, equipamentos georreferenciados, emissão e recuperação. | Emitir apuração por dimensão e restaurar em ambiente isolado. | Configuração/arquivo não comprovam backup até restaurar. |

Registrar para cada conector: versão do contrato/leiaute, direção, operação, campos, IDs de origem, autenticação, ambiente, resultado de validação e evidência. Quando a citação permitir carga manual **ou** importação, não tornar ambas obrigatórias sem motivo. Quando exigir envio automático, um upload manual de teste não encerra essa parte.

<a id="indice"></a>
## Índice individual na ordem da fonte

| ID | Nº original | Subseção original | Página | Ação resumida |
|---|---:|---|---:|---|
| [CUS-001](#cus-001) | 1 | Sistema Integrado de Custos | 320 | Compatibilidade com os sistemas de gestão utilizados atualmente pelo órgão |
| [CUS-002](#cus-002) | 2 | Sistema Integrado de Custos | 320 | Capacidade de integração via web services, APIs ou conexões seguras |
| [CUS-003](#cus-003) | 3 | Sistema Integrado de Custos | 320 | Acesso remoto via navegador web, com autenticação segura |
| [CUS-004](#cus-004) | 4 | Sistema Integrado de Custos | 320 | Geração de relatórios gerenciais e demonstrativos de custos por Equipamento Público, Centro de Custo, Objeto de Custo, Funções de… |
| [CUS-005](#cus-005) | 5 | Sistema Integrado de Custos | 320 | Atendimento à legislação vigente sobre contabilidade pública, custos governamentais e transparência |
| [CUS-006](#cus-006) | 6 | Sistema Integrado de Custos | 320 | Armazenamento seguro de dados, com backup e recuperação |
| [CUS-007](#cus-007) | 7 | Sistema Integrado de Custos | 320 | Parametrização e Configuração permitindo definir as estruturas básicas do sistema e adaptá-lo à realidade do órgão público |
| [CUS-008](#cus-008) | 8 | Sistema Integrado de Custos | 321 | Cadastro de centros de custo e unidades gestoras, objetos de custo e funções de governo |
| [CUS-009](#cus-009) | 9 | Sistema Integrado de Custos | 321 | Definição de planos acumuladores |
| [CUS-010](#cus-010) | 10 | Sistema Integrado de Custos | 321 | Parâmetros de alocação de custos diretos e indiretos |
| [CUS-011](#cus-011) | 11 | Sistema Integrado de Custos | 321 | Configuração de períodos de apuração |
| [CUS-012](#cus-012) | 12 | Sistema Integrado de Custos | 321 | Cadastro do equipamento público, com georeferenciamento e variáveis físicas personalizadas |
| [CUS-013](#cus-013) | 13 | Sistema Integrado de Custos | 321 | Coleta e Integração de Dados |
| [CUS-014](#cus-014) | 14 | Sistema Integrado de Custos | 321 | Deve permitir a coleta automatizada ou manual de dados de diferentes sistemas |
| [CUS-015](#cus-015) | 15 | Sistema Integrado de Custos | 321 | Integração com sistemas de folha de pagamento, contabilidade, almoxarifado, patrimônio, frotas, contratos e outros |
| [CUS-016](#cus-016) | 16 | Sistema Integrado de Custos | 321 | A importação e exportação de dados por meio de APIs ou arquivos estruturados (XLSX, XML, CSV) |
| [CUS-017](#cus-017) | 17 | Sistema Integrado de Custos | 321 | Apurar os custos diretos e indiretos e realizar a distribuição conforme definido no método de apropriação do elemento |
| [CUS-018](#cus-018) | 18 | Sistema Integrado de Custos | 321 | Executar os cálculos de custos por plano acumulador e equipamento público gerando os demonstrativos analíticos e sintéticos |
| [CUS-019](#cus-019) | 19 | Sistema Integrado de Custos | 321 | Apuração por período (mensal, trimestral, anual etc.) |
| [CUS-020](#cus-020) | 20 | Sistema Integrado de Custos | 321 | Gera relatórios, indicadores e dashboards para subsidiar a gestão e o controle institucional, dispondo de relatórios analíticos e… |

<a id="requisitos"></a>
## Desenvolvimento item a item

Cada bloco abaixo é obrigatório na rastreabilidade. A implementação segue o contrato operacional do pacote e os testes específicos; nenhum resumo substitui os campos e condições do TR.

<a id="cus-001"></a>
### CUS-001 — Compatibilidade com os sistemas de gestão utilizados atualmente pelo órgão

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 1, p. 320:**

> Compatibilidade com os sistemas de gestão utilizados atualmente pelo órgão;

**Implementação:** Inventariar os sistemas existentes, contratos e formatos utilizados pelas fontes antes de implementar conectores.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Produzir matriz fonte→dado→adaptador→teste e executar um consumo real por fonte disponível.

**Aceite técnico:** Compatibilidade é demonstrada por consumo correto, não pela afirmação “mesmo banco”.

**Atenção / limite:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-002"></a>
### CUS-002 — Capacidade de integração via web services, APIs ou conexões seguras

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 2, p. 320:**

> Capacidade de integração via web services, APIs ou conexões seguras;

**Implementação:** Criar/adaptar interfaces de coleta via API, webservice ou conexão segura conforme a origem real, com autenticação e chave de origem.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Receber lote DEMO de custo por conexão configurada; testar rejeição e reenvio.

**Aceite técnico:** Dados válidos entram uma vez e rejeições não aparecem como coleta concluída.

**Atenção / limite:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-003"></a>
### CUS-003 — Acesso remoto via navegador web, com autenticação segura

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 3, p. 320:**

> Acesso remoto via navegador web, com autenticação segura;

**Implementação:** Integrar card/menu Custos ao login e permissões existentes, com acesso remoto pelo navegador.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Abrir sem sessão e depois com conta autorizada; testar acesso a outro centro de custo.

**Aceite técnico:** Somente recortes autorizados são consultados e nenhuma senha paralela é criada.

**Atenção / limite:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-004"></a>
### CUS-004 — Geração de relatórios gerenciais e demonstrativos de custos por Equipamento Público, Centro de Custo, Objeto de Custo, Funções de…

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 4, p. 320:**

> Geração de relatórios gerenciais e demonstrativos de custos por Equipamento Público, Centro de Custo, Objeto de Custo, Funções de Governo e Elemento de Custo;

**Implementação:** Criar relatórios por equipamento público, centro, objeto, função e elemento de custo, preservando todas as dimensões citadas.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Emitir K-CUSTOS por cada dimensão e detalhar escola 16000/saúde 23500.

**Aceite técnico:** Total 39500 reconcilia em todas as visões sem somar subtotais como novos custos.

**Atenção / limite:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-005"></a>
### CUS-005 — Atendimento à legislação vigente sobre contabilidade pública, custos governamentais e transparência

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 5, p. 320:**

> Atendimento à legislação vigente sobre contabilidade pública, custos governamentais e transparência;

**Implementação:** Versionar regras e mapeamentos aplicáveis ao regime de custos e registrar validação do responsável contábil.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Associar uma regra DEMO e outra versão posterior a apurações separadas.

**Aceite técnico:** O modelo de teste não é tratado como legislação; validação normativa real é uma dependência explícita.

**Atenção / limite:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-006"></a>
### CUS-006 — Armazenamento seguro de dados, com backup e recuperação

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 6, p. 320:**

> Armazenamento seguro de dados, com backup e recuperação;

**Implementação:** Usar backup/recuperação e proteção de acesso do núcleo, incluindo dados de apuração e configurações.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Restaurar apuração DEMO em base isolada e comparar origem, regra e resultados.

**Aceite técnico:** Restauração conserva 39500 e rastreabilidade; possuir botão Backup não basta.

**Atenção / limite:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-007"></a>
### CUS-007 — Parametrização e Configuração permitindo definir as estruturas básicas do sistema e adaptá-lo à realidade do órgão público

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 7, p. 320:**

> Parametrização e Configuração permitindo definir as estruturas básicas do sistema e adaptá-lo à realidade do órgão público;

**Implementação:** Disponibilizar configuração das estruturas e regras sem editar código para cada período/unidade.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Criar centros e regras do cenário na interface e executar apuração.

**Aceite técnico:** Parâmetros persistem e são os realmente utilizados no cálculo.

**Atenção / limite:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-008"></a>
### CUS-008 — Cadastro de centros de custo e unidades gestoras, objetos de custo e funções de governo

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 8, p. 321:**

> Cadastro de centros de custo e unidades gestoras, objetos de custo e funções de governo;

**Implementação:** Cadastrar ou vincular centros, unidades gestoras, objetos de custo e funções, preservando responsabilidades do Organograma.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Vincular escola e saúde a centros/UGs e filtrar.

**Aceite técnico:** Todas as quatro estruturas são identificáveis e relacionadas, sem duplicar UG oficial.

**Atenção / limite:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-009"></a>
### CUS-009 — Definição de planos acumuladores

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 9, p. 321:**

> Definição de planos acumuladores;

**Implementação:** Cadastrar plano acumulador que agrupe elementos/objetos por critério explícito e vigência.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Plano D agrega diretos;Plano T agrega diretos+indiretos e permite retorno aos componentes.

**Aceite técnico:** Plano T 39500 sem somar novamente o total do Plano D.

**Atenção / limite:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-010"></a>
### CUS-010 — Parâmetros de alocação de custos diretos e indiretos

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 10, p. 321:**

> Parâmetros de alocação de custos diretos e indiretos;

**Implementação:** Definir custo direto/indireto, direcionador, pesos e tratamento de arredondamento.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Distribuir 2500 a 60%/40%=1500/1000; testar peso total zero.

**Aceite técnico:** Soma distribuída conserva 2500; divisor zero produz pendência.

**Atenção / limite:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-011"></a>
### CUS-011 — Configuração de períodos de apuração

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 11, p. 321:**

> Configuração de períodos de apuração;

**Implementação:** Configurar períodos, datas e situação de apuração; preservar versões dos resultados.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Apurar setembro e outra competência, fechar uma e testar reprocessamento autorizado.

**Aceite técnico:** Cada execução tem versão e intervalo; não sobrescrever histórico silenciosamente.

**Atenção / limite:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-012"></a>
### CUS-012 — Cadastro do equipamento público, com georeferenciamento e variáveis físicas personalizadas

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 12, p. 321:**

> Cadastro do equipamento público, com georeferenciamento e variáveis físicas personalizadas;

**Implementação:** Cadastrar equipamento público com georreferência e variáveis físicas personalizáveis, distinguindo edifício/serviço de máquina patrimonial.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Registrar escola com 400 alunos e unidade Saúde com 500 atendimentos, coordenadas DEMO.

**Aceite técnico:** Variável tem unidade; custo por aluno 40 e por atendimento 47 não são somados.

**Atenção / limite:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-013"></a>
### CUS-013 — Coleta e Integração de Dados

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 13, p. 321:**

> Coleta e Integração de Dados;

**Implementação:** Tratar “Coleta e Integração de Dados” como entrada introdutória, vinculada às capacidades 14–16, sem nova tela artificial.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Apresentar o resultado dos três itens seguintes.

**Aceite técnico:** Evidência agregada preserva o item sem duplicar requisito de integração.

**Atenção / limite:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-014"></a>
### CUS-014 — Deve permitir a coleta automatizada ou manual de dados de diferentes sistemas

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 14, p. 321:**

> Deve permitir a coleta automatizada ou manual de dados de diferentes sistemas;

**Implementação:** Disponibilizar coleta automatizada ou manual de dados de diferentes fontes, conforme a alternativa utilizada pela implantação. Guardar origem, competência, validação e responsabilidade. Não exigir os dois meios cumulativamente apenas por este item.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Executar a forma de coleta escolhida para duas fontes do cenário K-CUSTOS; repetir o mesmo lote. Se o meio automático também for implementado, testá-lo separadamente.

**Aceite técnico:** Os dados coletados persistem com sua origem e sem duplicação. Demonstrar manualmente não comprova integração automática exigida por outro item.

**Atenção / limite:** O item 14 utiliza “automatizada ou manual”. Manter separada a comprovação de integrações dos itens 2 e 15.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-015"></a>
### CUS-015 — Integração com sistemas de folha de pagamento, contabilidade, almoxarifado, patrimônio, frotas, contratos e outros

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 15, p. 321:**

> Integração com sistemas de folha de pagamento, contabilidade, almoxarifado, patrimônio, frotas, contratos e outros;

**Implementação:** Mapear e consumir Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas e Contratos; registrar indisponibilidade por fonte.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Executar K-CUSTOS com cada origem e conferir que lançamento contábil da mesma despesa não a soma novamente.

**Aceite técnico:** Cobertura por fonte e reconciliação 39500; uma integração não comprova todas.

**Atenção / limite:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-016"></a>
### CUS-016 — A importação e exportação de dados por meio de APIs ou arquivos estruturados (XLSX, XML, CSV)

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 16, p. 321:**

> Permitir a importação e exportação de dados por meio de APIs ou arquivos estruturados (XLSX, XML, CSV);

**Implementação:** Permitir importar e exportar dados pelo contrato de API ou pelos arquivos estruturados aplicáveis (XLSX, XML, CSV), mantendo o sentido de alternativa da fonte. Validar esquema, chaves, tipos e erros antes de confirmar o lote.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Gerar e receber um conjunto de custos pela interface escolhida. Para arquivos, abrir e validar cada formato disponibilizado; para API, registrar chamadas e respostas reais.

**Aceite técnico:** Entrada e saída usam dados corretos e a mesma origem; extensão renomeada não equivale ao formato e arquivo manual não comprova API.

**Atenção / limite:** Não transformar “APIs ou arquivos” em obrigação cumulativa de todos os transportes; identificar a cobertura efetivamente entregue e validar os formatos previstos.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-017"></a>
### CUS-017 — Apurar os custos diretos e indiretos e realizar a distribuição conforme definido no método de apropriação do elemento

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 17, p. 321:**

> Apurar os custos diretos e indiretos e realizar a distribuição conforme definido no método de apropriação do elemento;

**Implementação:** Executar apuração e distribuição de diretos/indiretos conforme método do elemento e período.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Calcular 14500+1500 e 22500+1000.

**Aceite técnico:** Resultados 16000/23500 e memória de cálculo por elemento.

**Atenção / limite:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-018"></a>
### CUS-018 — Executar os cálculos de custos por plano acumulador e equipamento público gerando os demonstrativos analíticos e sintéticos

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 18, p. 321:**

> Executar os cálculos de custos por plano acumulador e equipamento público gerando os demonstrativos analíticos e sintéticos;

**Implementação:** Calcular por plano acumulador e equipamento, emitindo analítico e sintético derivados do mesmo resultado.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Emitir os dois demonstrativos e abrir a parcela indireta da escola.

**Aceite técnico:** 1500 indiretos é rastreável ao conjunto 2500 e regra 60%, sem valor digitado no relatório.

**Atenção / limite:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-019"></a>
### CUS-019 — Apuração por período (mensal, trimestral, anual etc.)

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 19, p. 321:**

> Apuração por período (mensal, trimestral, anual etc.);

**Implementação:** Agregar mensal, trimestral e anual conforme datas/competências, sem contar revisões antigas duas vezes.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Três meses de 39500 cada →118500 no trimestre.

**Aceite técnico:** Agregação só considera a versão válida de cada período.

**Atenção / limite:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

<a id="cus-020"></a>
### CUS-020 — Gera relatórios, indicadores e dashboards para subsidiar a gestão e o controle institucional, dispondo de relatórios analíticos e…

**TR — Sistema Integrado de Custos, Sistema Integrado de Custos; item 20, p. 321:**

> Gera relatórios, indicadores e dashboards para subsidiar a gestão e o controle institucional, dispondo de relatórios analíticos e sintéticos, indicadores de desempenho de custo por área/setor, painéis interativos com gráficos dinâmicos e filtros.

**Implementação:** Disponibilizar indicadores, painéis com filtros e relatórios analíticos/sintéticos por área/setor, reutilizando BI se existente.

**Dados de outros módulos / integração:** Folha, Contabilidade, Almoxarifado, Patrimônio, Frotas, Contratos e demais fontes de custo; Administração/Organograma; mapas, backup e arquivos/APIs.

**Demonstração:** Filtrar escola e período; gráfico e relatório retornam 16000.

**Aceite técnico:** Cada indicador mostra unidade/fórmula e mantém o recorte, não um painel estático.

**Atenção / limite:** Não elaborar outra folha, contabilidade ou compra; não fingir coleta automática com valores digitados em gráfico. Os pesos 60/40 e valores são teste, não método oficial.

**Contrato operacional e base de teste:** [K01 — Apuração de custos e rastreabilidade](#pacote-k01).

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
| CUS-001 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-002 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-003 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-004 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-005 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-006 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-007 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-008 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-009 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-010 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-011 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-012 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-013 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-014 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-015 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-016 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-017 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-018 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-019 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |
| CUS-020 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote K01 e ressalvas |

<a id="pendencias"></a>
## Definições e ressalvas a registrar

### K-Q01 — Método de apropriação

Obter a política contábil da entidade, direcionadores, bases, critérios de reconhecimento e versão. Pagamento não é automaticamente custo da competência. Não ativar percentuais DEMO como método oficial.

### K-Q02 — Identidade dos fatos

Mapear o mesmo fato econômico que apareça na Folha, Contabilidade, Contrato ou Estoque. Não deduplicar apenas por valor/data, nem excluir fatos diferentes da mesma nota.

### K-Q03 — Equipamento público

Definir a estrutura institucional e as variáveis físicas. Equipamento público não é necessariamente um bem móvel patrimonial. Não usar aluno e atendimento como uma mesma unidade.

### K-Q04 — Fontes ausentes

Cada integração prevista no item 15 deve ser identificada e testada. Coleta manual permitida não prova coleta automática; a ausência de origem permanece registrada.

<a id="fontes"></a>
## Fontes, método e limites da conferência

**Fonte funcional exclusiva:** `termo de referencia (Ratificado)(1).pdf`, pp. 320–321. Citações transcritas com normalização de espaços/quebras, sem corrigir redação ou reiniciar numeração. Títulos curtos e agrupamentos operacionais foram criados para navegação.

O recorte foi extraído e comparado por dois métodos. As contagens coincidiram; diferenças de leitura por paginação, hifenização ou ordem de extração foram conferidas nas imagens pertinentes. O campo TR deste arquivo foi comparado programaticamente à transcrição consolidada. A relação completa de verificações está em `RELATORIO_QA.md` no pacote.

A conferência valida composição documental, numeração, referências e aritmética dos cenários. **Não foram executados testes do CeleriFlow nem verificados provedores, credenciais, dispositivos ou homologações oficiais.** Requisito textual com dependência/contradição permanece assim até solução documentada. Os critérios do TR e a avaliação da Administração prevalecem sobre uma solução proposta pelo plano.

Nenhuma taxa, limite legal, regra contábil, especificação de fornecedor ou versão de biblioteca não fornecida foi tratada como obrigatória a partir de conhecimento geral. Referências normativas presentes na citação exigem confirmação de aplicabilidade para implantação.

