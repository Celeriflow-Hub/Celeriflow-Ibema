# CeleriFlow — Plano de desenvolvimento e demonstração da POC
## Gestão de Business Intelligence | Divino de São Lourenço/ES

**REV01 — 19/09/2026.**

**Fonte:** `termo de referencia (Ratificado)(1).pdf`, 335 páginas, Processo Administrativo nº 1026/2026, seção técnica **Gestão de Business Intelligence**, pp. **309**.

**Cobertura:** **13 entradas numeradas**, de **BII-001** a **BII-013**, preservando o número original e os subtítulos. 13 itens próprios de autoria analítica. Os painéis fiscais já descritos em Tributário não substituem editor SQL, ETL, métricas, visões e filtros configuráveis.

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

Reutilizar ou criar **uma entrada identificável “Business Intelligence”** no catálogo/menu do CeleriFlow. As áreas abaixo são subáreas internas; não criar outra identidade, banco de cadastros ou aplicativo independente para cada grupo. Nomes de rotas/tabelas não foram presumidos.

| Área interna proposta | Regra |
|---|---|
| Fontes e conexões | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| ETL e arquivos | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Editor SQL | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Métricas e variáveis | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Visões e filtros | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Painéis e permissões | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Exportações | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |

Antes de desenvolver, registrar `fonte existente`, `capacidade própria a implementar` e `dependência externa`. Não executar uma segunda vez operação que já pertence ao módulo de origem. Card/menu não significa requisito atendido.

<a id="pacotes"></a>
## Pacotes operacionais e cenários conectados

Os grupos seguintes são organização de desenvolvimento; não substituem a divisão original do TR. Usar cada contrato como fundamento dos testes individuais. Os cenários são independentes salvo vínculo expresso: não misturar cargas auxiliares de paginação com os totais financeiros principais.

<a id="pacote-b01"></a>
### B01 — Autoria de análises, SQL e segurança

**Cobertura:** BII-001 a BII-013 — 13 entradas.

Este módulo não é apenas exibir os dashboards prontos de Tributário: fornecer ao usuário autorizado editor SQL web, conexões, ETL de Text/CSV/Excel, métricas/variáveis calculadas, criação de visões/filtros/painéis e níveis de exibição. Compartilhar infraestrutura com painéis existentes, mas testar as ferramentas de criação expressas.

Conexões usam credenciais restritas, preferencialmente somente leitura, escopo explícito, limite de tempo/linhas e parâmetros seguros. Não permitir ao navegador informar host/credencial arbitrários nem executar DDL/DML/SQL administrativo. Regras de isolamento não podem depender de o autor lembrar de acrescentar WHERE; aplicar nas views/fontes e na execução. Erro SQL não divulga segredo. Consultas salvas armazenam definição/versionamento, não tabela operacional paralela.

ETL tem origem, esquema, tipo, lote, erros e chave de reprocessamento; importação repetida não duplica fatos. CSS customiza aparência em escopo controlado, sem scripts ou acesso a dados. Filtros cruzados, drill-to-detail e drill-by têm comportamentos distintos e preservam o contexto/permissão. Excel/CSV exportam dados do recorte completo; imagem/PDF representam o painel realmente consultado. Visão geográfica usa coordenadas disponíveis, sem adicionar rastreamento ou compra obrigatória de mapas.

**Base e demonstração conectada:** B-DADOS: seis fatos nas competências agosto/setembro/outubro: Educação R$ 100,00 / 150,00 / 50,00 e Saúde R$ 200,00 / 250,00 / 250,00. Total R$ 1.000,00; Educação R$ 300,00; Saúde R$ 700,00; setembro R$ 400,00; Educação em setembro R$ 150,00. Dividir o conjunto em três fontes de dois registros para ETL. Uma conta restrita à Educação não obtém a Saúde por SQL, detalhe ou exportação. As duas unidades geográficas aparecem uma vez no mapa.

**Origens de dados:** Conexão SQL real/visões autorizadas do ERP, arquivos Text/CSV/Excel, identidade/permissões, gerador de imagem/PDF e componente geográfico existente.

**Limites e decisões:** Não criar banco OLAP obrigatório, IA ou editor SQL com superusuário. Filtro de segurança não é CSS nem parâmetro livre do navegador.

<a id="integracoes"></a>
## Fontes, contratos e integrações

A tabela distingue integração exigida, arquivo de intercâmbio, serviço compartilhado e definição externa. As origens são previstas, não endpoints cuja existência foi confirmada. **Os simuladores são ferramentas internas de teste; não substituem a contraparte nem a autorização de demonstração pela comissão.**

| Ref. | Origem/capacidade | Itens/contexto | Entrega | Teste controlado | Dependência para comprovar |
|---|---|---|---|---|---|
| BI-DEP01 | Bancos SQL e arquivos Text/CSV/Excel | BII-001/002/005/006 | Conexões/ETL com escopo e tipos; permissões de consulta. | Base com seis fatos e tentativas de escrita/leitura indevida. | Conta SQL restrita real e arquivos corretamente parseados. |
| BI-DEP02 | Dados geográficos e exportadores | BII-009–011 | Coordenadas de origem e saída em dados/imagem/PDF. | Visões filtradas e exportação completa. | Não gerar posição inventada nem arquivo apenas renomeado. |

Registrar para cada conector: versão do contrato/leiaute, direção, operação, campos, IDs de origem, autenticação, ambiente, resultado de validação e evidência. Quando a citação permitir carga manual **ou** importação, não tornar ambas obrigatórias sem motivo. Quando exigir envio automático, um upload manual de teste não encerra essa parte.

<a id="indice"></a>
## Índice individual na ordem da fonte

| ID | Nº original | Subseção original | Página | Ação resumida |
|---|---:|---|---:|---|
| [BII-001](#bii-001) | 1 | Gestão de Business Intelligence | 309 | Integração com Bancos de Dados contendo linguagem SQL |
| [BII-002](#bii-002) | 2 | Gestão de Business Intelligence | 309 | ETL com dados externos (Text, CSV, Excel) |
| [BII-003](#bii-003) | 3 | Gestão de Business Intelligence | 309 | Uso de CSS, facilitando personalização da aparência com a marca do município |
| [BII-004](#bii-004) | 4 | Gestão de Business Intelligence | 309 | Filtros cruzados , Drill-to-detail e drill-by |
| [BII-005](#bii-005) | 5 | Gestão de Business Intelligence | 309 | Conter Editor SQL WEB para Consultas de dados |
| [BII-006](#bii-006) | 6 | Gestão de Business Intelligence | 309 | Criar Métricas e Variáveis calculadas em SQL |
| [BII-007](#bii-007) | 7 | Gestão de Business Intelligence | 309 | Criação de Usuário com níveis de exibição para Painéis e Gráficos |
| [BII-008](#bii-008) | 8 | Gestão de Business Intelligence | 309 | Funcionamento em Browser |
| [BII-009](#bii-009) | 9 | Gestão de Business Intelligence | 309 | Extração de Painéis e Gráficos em formato (Excel, csv) |
| [BII-010](#bii-010) | 10 | Gestão de Business Intelligence | 309 | Extração de Painéis e Gráficos em Imagens e PDF |
| [BII-011](#bii-011) | 11 | Gestão de Business Intelligence | 309 | Criação de Visões de dados simples como números únicos a dados geoespaciais |
| [BII-012](#bii-012) | 12 | Gestão de Business Intelligence | 309 | Criação de filtros |
| [BII-013](#bii-013) | 13 | Gestão de Business Intelligence | 309 | Determinar filtros por Painéis e Visões |

<a id="requisitos"></a>
## Desenvolvimento item a item

Cada bloco abaixo é obrigatório na rastreabilidade. A implementação segue o contrato operacional do pacote e os testes específicos; nenhum resumo substitui os campos e condições do TR.

<a id="bii-001"></a>
### BII-001 — Integração com Bancos de Dados contendo linguagem SQL

**TR — Gestão de Business Intelligence, Gestão de Business Intelligence; item 1, p. 309:**

> Permitir Integração com Bancos de Dados contendo linguagem SQL

**Implementação:** Cadastrar conexão a banco SQL com segredo no servidor e selecionar fonte/visões autorizadas. Executar consulta real, com timeout e escopo.

**Dados de outros módulos / integração:** Conexão SQL real/visões autorizadas do ERP, arquivos Text/CSV/Excel, identidade/permissões, gerador de imagem/PDF e componente geográfico existente.

**Demonstração:** Consultar os seis fatos de B-DADOS numa base SQL de teste e impedir alteração de dados pela conta de leitura.

**Aceite técnico:** Os 1000 da base aparecem; falha de conexão não retorna uma amostra fixa.

**Atenção / limite:** Não criar banco OLAP obrigatório, IA ou editor SQL com superusuário. Filtro de segurança não é CSS nem parâmetro livre do navegador.

**Contrato operacional e base de teste:** [B01 — Autoria de análises, SQL e segurança](#pacote-b01).

<a id="bii-002"></a>
### BII-002 — ETL com dados externos (Text, CSV, Excel)

**TR — Gestão de Business Intelligence, Gestão de Business Intelligence; item 2, p. 309:**

> Permitir ETL com dados externos (Text, CSV, Excel)

**Implementação:** Implementar importador ETL para Text, CSV e Excel: leitura, mapeamento/tipos, prévia, validação, rejeições e confirmação de lote.

**Dados de outros módulos / integração:** Conexão SQL real/visões autorizadas do ERP, arquivos Text/CSV/Excel, identidade/permissões, gerador de imagem/PDF e componente geográfico existente.

**Demonstração:** Importar três fontes de dois fatos cada, incluindo repetição e linha inválida em cenário separado.

**Aceite técnico:** Seis fatos total 1000; reimportação não duplica; erro aponta campo/linha.

**Atenção / limite:** Não criar banco OLAP obrigatório, IA ou editor SQL com superusuário. Filtro de segurança não é CSS nem parâmetro livre do navegador.

**Contrato operacional e base de teste:** [B01 — Autoria de análises, SQL e segurança](#pacote-b01).

<a id="bii-003"></a>
### BII-003 — Uso de CSS, facilitando personalização da aparência com a marca do município

**TR — Gestão de Business Intelligence, Gestão de Business Intelligence; item 3, p. 309:**

> Permitir uso de CSS, facilitando personalização da aparência com a marca do município

**Implementação:** Permitir CSS de apresentação do painel em escopo isolado, validado, sem executar scripts nem alterar o ERP global.

**Dados de outros módulos / integração:** Conexão SQL real/visões autorizadas do ERP, arquivos Text/CSV/Excel, identidade/permissões, gerador de imagem/PDF e componente geográfico existente.

**Demonstração:** Alterar cor/espaçamento de um painel e reabrir outro.

**Aceite técnico:** Configuração persiste apenas no painel/contexto; tentativa de conteúdo ativo é recusada.

**Atenção / limite:** Não criar banco OLAP obrigatório, IA ou editor SQL com superusuário. Filtro de segurança não é CSS nem parâmetro livre do navegador.

**Contrato operacional e base de teste:** [B01 — Autoria de análises, SQL e segurança](#pacote-b01).

<a id="bii-004"></a>
### BII-004 — Filtros cruzados , Drill-to-detail e drill-by

**TR — Gestão de Business Intelligence, Gestão de Business Intelligence; item 4, p. 309:**

> Permitir filtros cruzados , Drill-to-detail e drill-by

**Implementação:** Implementar seleção cruzada que atualize outras visões, drill-to-detail para linhas e drill-by para mudar dimensão, mantendo o recorte.

**Dados de outros módulos / integração:** Conexão SQL real/visões autorizadas do ERP, arquivos Text/CSV/Excel, identidade/permissões, gerador de imagem/PDF e componente geográfico existente.

**Demonstração:** Selecionar setembro 400, filtrar Educação 150 e detalhar seu fato; mudar dimensão para mês.

**Aceite técnico:** Totais/detalhe conciliam e permissões permanecem aplicadas.

**Atenção / limite:** Não criar banco OLAP obrigatório, IA ou editor SQL com superusuário. Filtro de segurança não é CSS nem parâmetro livre do navegador.

**Contrato operacional e base de teste:** [B01 — Autoria de análises, SQL e segurança](#pacote-b01).

<a id="bii-005"></a>
### BII-005 — Conter Editor SQL WEB para Consultas de dados

**TR — Gestão de Business Intelligence, Gestão de Business Intelligence; item 5, p. 309:**

> Conter Editor SQL WEB para Consultas de dados

**Implementação:** Fornecer editor SQL no navegador com execução restrita, parâmetros e tratamento de erros, sem credencial de administrador.

**Dados de outros módulos / integração:** Conexão SQL real/visões autorizadas do ERP, arquivos Text/CSV/Excel, identidade/permissões, gerador de imagem/PDF e componente geográfico existente.

**Demonstração:** Executar SELECT autorizado; tentar UPDATE, múltiplas instruções e leitura de esquema privado.

**Aceite técnico:** Consulta válida funciona; operações proibidas são recusadas no servidor.

**Atenção / limite:** Não criar banco OLAP obrigatório, IA ou editor SQL com superusuário. Filtro de segurança não é CSS nem parâmetro livre do navegador.

**Contrato operacional e base de teste:** [B01 — Autoria de análises, SQL e segurança](#pacote-b01).

<a id="bii-006"></a>
### BII-006 — Criar Métricas e Variáveis calculadas em SQL

**TR — Gestão de Business Intelligence, Gestão de Business Intelligence; item 6, p. 309:**

> Permitir criar Métricas e Variáveis calculadas em SQL

**Implementação:** Criar métricas e variáveis a partir de expressões SQL permitidas, com tipo, dependências e regra de agregação.

**Dados de outros módulos / integração:** Conexão SQL real/visões autorizadas do ERP, arquivos Text/CSV/Excel, identidade/permissões, gerador de imagem/PDF e componente geográfico existente.

**Demonstração:** Métrica soma retorna 1000; proporção Educação=30%; filtro setembro retorna 400.

**Aceite técnico:** Divisor zero é tratado e soma de percentuais não substitui recomputar a proporção.

**Atenção / limite:** Não criar banco OLAP obrigatório, IA ou editor SQL com superusuário. Filtro de segurança não é CSS nem parâmetro livre do navegador.

**Contrato operacional e base de teste:** [B01 — Autoria de análises, SQL e segurança](#pacote-b01).

<a id="bii-007"></a>
### BII-007 — Criação de Usuário com níveis de exibição para Painéis e Gráficos

**TR — Gestão de Business Intelligence, Gestão de Business Intelligence; item 7, p. 309:**

> Permitir Criação de Usuário com níveis de exibição para Painéis e Gráficos

**Implementação:** Configurar por usuário/papel quais painéis e gráficos são visíveis, incluindo acesso direto e exportações.

**Dados de outros módulos / integração:** Conexão SQL real/visões autorizadas do ERP, arquivos Text/CSV/Excel, identidade/permissões, gerador de imagem/PDF e componente geográfico existente.

**Demonstração:** U-Educação tenta abrir gráfico da Saúde por URL ou ID.

**Aceite técnico:** Consulta é negada; ausência no menu não é o único bloqueio.

**Atenção / limite:** Não criar banco OLAP obrigatório, IA ou editor SQL com superusuário. Filtro de segurança não é CSS nem parâmetro livre do navegador.

**Contrato operacional e base de teste:** [B01 — Autoria de análises, SQL e segurança](#pacote-b01).

<a id="bii-008"></a>
### BII-008 — Funcionamento em Browser

**TR — Gestão de Business Intelligence, Gestão de Business Intelligence; item 8, p. 309:**

> Funcionamento em Browser

**Implementação:** Executar editor, filtro, painel, consulta e exportação no navegador, usando o mesmo login autorizado.

**Dados de outros módulos / integração:** Conexão SQL real/visões autorizadas do ERP, arquivos Text/CSV/Excel, identidade/permissões, gerador de imagem/PDF e componente geográfico existente.

**Demonstração:** Abrir em outra estação sem cliente BI instalado.

**Aceite técnico:** Operação completa pela web, sem arquivo desktop como única entrega.

**Atenção / limite:** Não criar banco OLAP obrigatório, IA ou editor SQL com superusuário. Filtro de segurança não é CSS nem parâmetro livre do navegador.

**Contrato operacional e base de teste:** [B01 — Autoria de análises, SQL e segurança](#pacote-b01).

<a id="bii-009"></a>
### BII-009 — Extração de Painéis e Gráficos em formato (Excel, csv)

**TR — Gestão de Business Intelligence, Gestão de Business Intelligence; item 9, p. 309:**

> Extração de Painéis e Gráficos em formato (Excel, csv)

**Implementação:** Exportar dados para Excel e CSV com cabeçalho, filtros e recorte completo, preservando tipos e prevenindo fórmula injetada.

**Dados de outros módulos / integração:** Conexão SQL real/visões autorizadas do ERP, arquivos Text/CSV/Excel, identidade/permissões, gerador de imagem/PDF e componente geográfico existente.

**Demonstração:** Exportar seis fatos de uma lista de duas linhas por página; conferir 1000.

**Aceite técnico:** Arquivos válidos incluem as seis linhas, não somente a página atual.

**Atenção / limite:** Não criar banco OLAP obrigatório, IA ou editor SQL com superusuário. Filtro de segurança não é CSS nem parâmetro livre do navegador.

**Contrato operacional e base de teste:** [B01 — Autoria de análises, SQL e segurança](#pacote-b01).

<a id="bii-010"></a>
### BII-010 — Extração de Painéis e Gráficos em Imagens e PDF

**TR — Gestão de Business Intelligence, Gestão de Business Intelligence; item 10, p. 309:**

> Extração de Painéis e Gráficos em Imagens e PDF

**Implementação:** Gerar imagem e PDF da visão/painel efetivamente renderizado com seus filtros e legendas.

**Dados de outros módulos / integração:** Conexão SQL real/visões autorizadas do ERP, arquivos Text/CSV/Excel, identidade/permissões, gerador de imagem/PDF e componente geográfico existente.

**Demonstração:** Aplicar filtro setembro e exportar imagem e PDF.

**Aceite técnico:** Ambos apresentam 400 e identificação do recorte, sem dados ocultos de outra unidade.

**Atenção / limite:** Não criar banco OLAP obrigatório, IA ou editor SQL com superusuário. Filtro de segurança não é CSS nem parâmetro livre do navegador.

**Contrato operacional e base de teste:** [B01 — Autoria de análises, SQL e segurança](#pacote-b01).

<a id="bii-011"></a>
### BII-011 — Criação de Visões de dados simples como números únicos a dados geoespaciais

**TR — Gestão de Business Intelligence, Gestão de Business Intelligence; item 11, p. 309:**

> Permitir Criação de Visões de dados simples como números únicos a dados geoespaciais

**Implementação:** Permitir criar pelo menos visão de valor único e visão geoespacial, além das visualizações configuradas a partir de dados reais.

**Dados de outros módulos / integração:** Conexão SQL real/visões autorizadas do ERP, arquivos Text/CSV/Excel, identidade/permissões, gerador de imagem/PDF e componente geográfico existente.

**Demonstração:** Mostrar total 1000 e mapa com duas unidades/coordenadas DEMO; filtrar Educação.

**Aceite técnico:** A medida e o mapa respondem ao mesmo recorte; sem posições inventadas em produção.

**Atenção / limite:** Não criar banco OLAP obrigatório, IA ou editor SQL com superusuário. Filtro de segurança não é CSS nem parâmetro livre do navegador.

**Contrato operacional e base de teste:** [B01 — Autoria de análises, SQL e segurança](#pacote-b01).

<a id="bii-012"></a>
### BII-012 — Criação de filtros

**TR — Gestão de Business Intelligence, Gestão de Business Intelligence; item 12, p. 309:**

> Permitir Criação de filtros

**Implementação:** Oferecer criação de filtros com campo, tipo e domínio de valores da fonte, sem depender de edição de código.

**Dados de outros módulos / integração:** Conexão SQL real/visões autorizadas do ERP, arquivos Text/CSV/Excel, identidade/permissões, gerador de imagem/PDF e componente geográfico existente.

**Demonstração:** Criar filtro por competência e por área, aplicar e remover.

**Aceite técnico:** Filtros consultam a base completa e não apenas dados já carregados.

**Atenção / limite:** Não criar banco OLAP obrigatório, IA ou editor SQL com superusuário. Filtro de segurança não é CSS nem parâmetro livre do navegador.

**Contrato operacional e base de teste:** [B01 — Autoria de análises, SQL e segurança](#pacote-b01).

<a id="bii-013"></a>
### BII-013 — Determinar filtros por Painéis e Visões

**TR — Gestão de Business Intelligence, Gestão de Business Intelligence; item 13, p. 309:**

> Permitir Determinar filtros por Painéis e Visões

**Implementação:** Configurar o alcance de cada filtro: painel inteiro ou visões selecionadas.

**Dados de outros módulos / integração:** Conexão SQL real/visões autorizadas do ERP, arquivos Text/CSV/Excel, identidade/permissões, gerador de imagem/PDF e componente geográfico existente.

**Demonstração:** Filtro global de setembro mantém 400; filtro Educação limitado à visão 1 mantém visão 2 no recorte definido.

**Aceite técnico:** Alcance fica explícito e persistido; não alterar silenciosamente todos os gráficos.

**Atenção / limite:** Não criar banco OLAP obrigatório, IA ou editor SQL com superusuário. Filtro de segurança não é CSS nem parâmetro livre do navegador.

**Contrato operacional e base de teste:** [B01 — Autoria de análises, SQL e segurança](#pacote-b01).

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
| BII-001 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote B01 e ressalvas |
| BII-002 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote B01 e ressalvas |
| BII-003 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote B01 e ressalvas |
| BII-004 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote B01 e ressalvas |
| BII-005 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote B01 e ressalvas |
| BII-006 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote B01 e ressalvas |
| BII-007 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote B01 e ressalvas |
| BII-008 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote B01 e ressalvas |
| BII-009 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote B01 e ressalvas |
| BII-010 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote B01 e ressalvas |
| BII-011 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote B01 e ressalvas |
| BII-012 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote B01 e ressalvas |
| BII-013 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote B01 e ressalvas |

<a id="pendencias"></a>
## Definições e ressalvas a registrar

### B-Q01 — Dialeto e conexão SQL

Confirmar SGBDs e dialetos disponíveis. A fonte não obriga compatibilidade com qualquer banco existente no mercado; identificar os suportados e provar a conexão real.

### B-Q02 — Permissão da consulta e do resultado

Autor de SQL não recebe privilégio de administrador de banco. Fontes autorizadas precisam aplicar isolamento também a consultas, exportações e drill-down. Limites de execução são controles técnicos, não teto comercial de usuários.

### B-Q03 — Exportações e visão geográfica

Excel/CSV são arquivos de dados; imagem/PDF representam a visualização. Geoespacial requer coordenadas válidas e camada/provedor identificado, sem criar rastreamento por analogia.

<a id="fontes"></a>
## Fontes, método e limites da conferência

**Fonte funcional exclusiva:** `termo de referencia (Ratificado)(1).pdf`, pp. 309. Citações transcritas com normalização de espaços/quebras, sem corrigir redação ou reiniciar numeração. Títulos curtos e agrupamentos operacionais foram criados para navegação.

O recorte foi extraído e comparado por dois métodos. As contagens coincidiram; diferenças de leitura por paginação, hifenização ou ordem de extração foram conferidas nas imagens pertinentes. O campo TR deste arquivo foi comparado programaticamente à transcrição consolidada. A relação completa de verificações está em `RELATORIO_QA.md` no pacote.

A conferência valida composição documental, numeração, referências e aritmética dos cenários. **Não foram executados testes do CeleriFlow nem verificados provedores, credenciais, dispositivos ou homologações oficiais.** Requisito textual com dependência/contradição permanece assim até solução documentada. Os critérios do TR e a avaliação da Administração prevalecem sobre uma solução proposta pelo plano.

Nenhuma taxa, limite legal, regra contábil, especificação de fornecedor ou versão de biblioteca não fornecida foi tratada como obrigatória a partir de conhecimento geral. Referências normativas presentes na citação exigem confirmação de aplicabilidade para implantação.

