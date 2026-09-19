# CeleriFlow — Plano de desenvolvimento e demonstração da POC
## Controle Interno | Divino de São Lourenço/ES

**REV01 — 19/09/2026.**

**Fonte:** `termo de referencia (Ratificado)(1).pdf`, 335 páginas, Processo Administrativo nº 1026/2026, seção técnica **Controle Interno**, pp. **149–151**.

**Cobertura:** **32 entradas numeradas**, de **CIN-001** a **CIN-032**, preservando o número original e os subtítulos. 32 itens próprios. Auditorias, obrigações, achados, indicadores e relatórios; não se confunde com publicar documentos do Controle Interno na Transparência.

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

Reutilizar ou criar **uma entrada identificável “Controle Interno”** no catálogo/menu do CeleriFlow. As áreas abaixo são subáreas internas; não criar outra identidade, banco de cadastros ou aplicativo independente para cada grupo. Nomes de rotas/tabelas não foram presumidos.

| Área interna proposta | Regra |
|---|---|
| Legislações e obrigações | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Plano e cronograma de auditorias | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Execução, checklists e evidências | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Achados, notificações e recomendações | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Indicadores fiscais | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Documentos e relatórios | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |
| Configurações e fontes | Reaproveitar serviços e exibir somente funções autorizadas; o detalhamento vinculante é o dos itens deste MD. |

Antes de desenvolver, registrar `fonte existente`, `capacidade própria a implementar` e `dependência externa`. Não executar uma segunda vez operação que já pertence ao módulo de origem. Card/menu não significa requisito atendido.

<a id="pacotes"></a>
## Pacotes operacionais e cenários conectados

Os grupos seguintes são organização de desenvolvimento; não substituem a divisão original do TR. Usar cada contrato como fundamento dos testes individuais. Os cenários são independentes salvo vínculo expresso: não misturar cargas auxiliares de paginação com os totais financeiros principais.

<a id="pacote-c01"></a>
### C01 — Auditorias, prazos e controles fiscais

**Cobertura:** CIN-001 a CIN-032 — 32 entradas.

Uma auditoria possui escopo, período, responsáveis, cronograma, checklists, evidências, achados, recomendações e acompanhamento. Planejar não equivale a executar; executar não significa todos os pontos conformes. A mesma tarefa pode ser vista por duas pessoas, mas gravações concorrentes usam versão/conflito para não apagar evidência. Checklist preenchido é distinto de modelo; relatório mensal/anual deriva de auditorias do período, mantendo as referências.

Cruzamentos usam dados das fontes por IDs e competência. Uma divergência é um indício a analisar, não conclusão automática de ilegalidade. O auditor valida o achado e emite a comunicação interna prevista. Indicadores de RCL, pessoal, educação/saúde e resultado primário/nominal usam bases e regras versionadas, identificadas pelo responsável contábil; não inventar percentuais legais nem somar valores de estágios diferentes. Dados insuficientes deixam o indicador indisponível, não zero.

Compartilhar relatório salvo mantém sua definição e limita cada execução às permissões do destinatário. Painel não expõe mais dados que a consulta. “Ponto de controle” do item 32 precisa de definição de saída; propor extração rastreável com período, regra, base e evidências sem afirmar que um layout oficial foi especificado.

**Base e demonstração conectada:** C-AUD: auditoria com três pontos, dois conformes e um pendente. Contrato DEMO de R$ 10.000,00 e pagamento vinculado de R$ 11.000,00 produzem diferença de R$ 1.000,00, a investigar, não uma infração automaticamente concluída. Indicador de ensaio: numerador R$ 24.000,00 / base R$ 100.000,00 = 24%; limiar DEMO de 30%, sem pretensão de limite legal. Série aritmética de RCL: 12 × (R$ 120.000,00 − R$ 20.000,00) = R$ 1.200.000,00; a classificação real deve ser validada pelo responsável. Receita primária DEMO de R$ 1.000.000,00 menos despesa primária DEMO de R$ 900.000,00 = R$ 100.000,00. Resultado nominal deve ter definição/memória própria, não ser copiado dessa diferença.

**Origens de dados:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Limites e decisões:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

<a id="integracoes"></a>
## Fontes, contratos e integrações

A tabela distingue integração exigida, arquivo de intercâmbio, serviço compartilhado e definição externa. As origens são previstas, não endpoints cuja existência foi confirmada. **Os simuladores são ferramentas internas de teste; não substituem a contraparte nem a autorização de demonstração pela comissão.**

| Ref. | Origem/capacidade | Itens/contexto | Entrega | Teste controlado | Dependência para comprovar |
|---|---|---|---|---|---|
| CI-DEP01 | Todos os módulos citados no item 27 | CIN-016,019–021,027–028,031–032 | Visões/serviços de leitura com competência, origem e permissões; geração dos achados no Controle Interno. | Diferença contratual DEMO e indicadores com memória conferível. | Verificar cada fonte real; dado não disponível não é valor zero. |
| CI-DEP02 | Documentos/Processos/BI | CIN-013–014,017–018,023–026,029–031 | Emissão, armazenamento e acompanhamento; reutilizar infraestrutura. | Checklist preenchido, recomendação e relatório emitidos na aplicação. | Um PDF preparado não substitui resultado da auditoria. |

Registrar para cada conector: versão do contrato/leiaute, direção, operação, campos, IDs de origem, autenticação, ambiente, resultado de validação e evidência. Quando a citação permitir carga manual **ou** importação, não tornar ambas obrigatórias sem motivo. Quando exigir envio automático, um upload manual de teste não encerra essa parte.

<a id="indice"></a>
## Índice individual na ordem da fonte

| ID | Nº original | Subseção original | Página | Ação resumida |
|---|---:|---|---:|---|
| [CIN-001](#cin-001) | 1 | Módulo De Controle Interno | 149 | Ser executado em sistema multiusuário |
| [CIN-002](#cin-002) | 2 | Módulo De Controle Interno | 150 | O acesso deverá ser por meio de login e senha |
| [CIN-003](#cin-003) | 3 | Módulo De Controle Interno | 150 | O sistema deve operar exclusivamente na plataforma web |
| [CIN-004](#cin-004) | 4 | Módulo De Controle Interno | 150 | O sistema web deverá ser acessado por navegadores (Browsers) de mercado, entre eles, no mínimo: Internet explorer (versão 11 ou… |
| [CIN-005](#cin-005) | 5 | Módulo De Controle Interno | 150 | O sistema não poderá apresentar limitação quanto ao número de usuários simultâneos |
| [CIN-006](#cin-006) | 6 | Módulo De Controle Interno | 150 | Ser multiusuário permitindo o trabalho simultâneo em uma mesma tarefa, com total integridade dos dados |
| [CIN-007](#cin-007) | 7 | Módulo De Controle Interno | 150 | Número ilimitado de usuários |
| [CIN-008](#cin-008) | 8 | Módulo De Controle Interno | 150 | O cadastro de Legislações específicas |
| [CIN-009](#cin-009) | 9 | Módulo De Controle Interno | 150 | Calendário de Obrigações Legais |
| [CIN-010](#cin-010) | 10 | Módulo De Controle Interno | 150 | Planejamento de Auditorias |
| [CIN-011](#cin-011) | 11 | Módulo De Controle Interno | 150 | Execução de Auditorias |
| [CIN-012](#cin-012) | 12 | Módulo De Controle Interno | 150 | Lançamento de Checklist |
| [CIN-013](#cin-013) | 13 | Módulo De Controle Interno | 150 | Impressão de Checklist |
| [CIN-014](#cin-014) | 14 | Módulo De Controle Interno | 150 | Emissão de notificações e recomendações dentro do sistema |
| [CIN-015](#cin-015) | 15 | Módulo De Controle Interno | 150 | Estabelecer nível de acesso por grupo ou usuários |
| [CIN-016](#cin-016) | 16 | Módulo De Controle Interno | 150 | Acompanhamento de resultado primário nominal |
| [CIN-017](#cin-017) | 17 | Módulo De Controle Interno | 150 | Gerador de ofícios, pareceres e documentos com possibilidade de arquivamento dentro do sistema |
| [CIN-018](#cin-018) | 18 | Módulo De Controle Interno | 150 | Gerência das ações efetuadas no sistema |
| [CIN-019](#cin-019) | 19 | Módulo De Controle Interno | 150 | Apuração e acompanhamento dos limites constitucionais, de educação e saúde |
| [CIN-020](#cin-020) | 20 | Módulo De Controle Interno | 150 | Apuração da receita corrente líquida |
| [CIN-021](#cin-021) | 21 | Módulo De Controle Interno | 150 | Apuração e acompanhamento do limite de gastos com pessoal conforme exigência da Lei 101/2000 (LRF) |
| [CIN-022](#cin-022) | 22 | Módulo De Controle Interno | 150 | Usuários devem ter acesso on-line às informações do Bano de Dados somente a partir do sistema |
| [CIN-023](#cin-023) | 23 | Módulo De Controle Interno | 150 | Emissão de relatórios de auditoria |
| [CIN-024](#cin-024) | 24 | Módulo De Controle Interno | 150 | Emissão de relatório mensal de Controle Interno |
| [CIN-025](#cin-025) | 25 | Módulo De Controle Interno | 150 | Emissão de relatório anual de Controle Interno |
| [CIN-026](#cin-026) | 26 | Módulo De Controle Interno | 150 | Elaboração de cronograma de auditoria |
| [CIN-027](#cin-027) | 27 | Módulo De Controle Interno | 151 | Integração com todos os outros módulos do sistema (Contabilidade, Folha, Compras, Licitações, Frota, Almoxarifado, Tributos, Orçamento,… |
| [CIN-028](#cin-028) | 28 | Módulo De Controle Interno | 151 | Cruzamento de dados com informações de outros módulos para criar achados de auditoria |
| [CIN-029](#cin-029) | 29 | Módulo De Controle Interno | 151 | A emissão de relatórios salvos por usuários que os modificaram, possam ser compartilhados com outros usuários |
| [CIN-030](#cin-030) | 30 | Módulo De Controle Interno | 151 | S emissão de relatórios com a possibilidade de personalização de layout e impressão de brasões, definidos pelo usuário |
| [CIN-031](#cin-031) | 31 | Módulo De Controle Interno | 151 | Demonstrar análises através de dashboard (Painel eletrônico) de valores e percentuais, conforme o caso – na forma definida pelo art. 2°,… |
| [CIN-032](#cin-032) | 32 | Módulo De Controle Interno | 151 | A extração em forma de ponto de controle quando todas as informações estiverem disponíveis e acessíveis de forma estruturada |

<a id="requisitos"></a>
## Desenvolvimento item a item

Cada bloco abaixo é obrigatório na rastreabilidade. A implementação segue o contrato operacional do pacote e os testes específicos; nenhum resumo substitui os campos e condições do TR.

<a id="cin-001"></a>
### CIN-001 — Ser executado em sistema multiusuário

**TR — Controle Interno, Módulo De Controle Interno; item 1, p. 149:**

> O sistema deverá ser executado em sistema multiusuário;

**Implementação:** Usar sessão por usuário e permitir operação concorrente das telas de auditoria sem sobrescrever mudanças de outra sessão.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Abrir auditoria A em duas contas, incluir evidências diferentes e reabrir.

**Aceite técnico:** As duas autorias e os dois registros persistem; conflito de edição do mesmo campo é identificado.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-002"></a>
### CIN-002 — O acesso deverá ser por meio de login e senha

**TR — Controle Interno, Módulo De Controle Interno; item 2, p. 150:**

> O acesso deverá ser por meio de login e senha;

**Implementação:** Vincular a entrada Controle Interno à autenticação existente, exigindo login/senha para iniciar sessão não autenticada.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Abrir rota sem sessão, autenticar e tentar acessar após logout.

**Aceite técnico:** Sessão inválida não lê auditorias; usuário autorizado acessa sem outra base de credenciais.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-003"></a>
### CIN-003 — O sistema deve operar exclusivamente na plataforma web

**TR — Controle Interno, Módulo De Controle Interno; item 3, p. 150:**

> O sistema deve operar exclusivamente na plataforma web;

**Implementação:** Expor as funções por interface web e serviços do CeleriFlow; não exigir cliente desktop para o auditor.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Registrar checklist e emitir documento no navegador, em estação sem cliente específico.

**Aceite técnico:** A operação completa é acessível pela web, preservando dados e permissões.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-004"></a>
### CIN-004 — O sistema web deverá ser acessado por navegadores (Browsers) de mercado, entre eles, no mínimo: Internet explorer (versão 11 ou…

**TR — Controle Interno, Módulo De Controle Interno; item 4, p. 150:**

> O sistema web deverá ser acessado por navegadores (Browsers) de mercado, entre eles, no mínimo: Internet explorer (versão 11 ou superior), - Mozila-Firefox; - Google Chrome; - Edge; - Safari, Opera;

**Implementação:** Montar matriz de navegadores explicitamente citados, incluindo a referência a IE 11; registrar o que foi testado e as incompatibilidades.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Executar cadastro, filtro, checklist e impressão em cada navegador disponível; documentar ausência dos legados.

**Aceite técnico:** Não marcar navegador não testado como compatível nem confundir Edge com IE 11.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-005"></a>
### CIN-005 — O sistema não poderá apresentar limitação quanto ao número de usuários simultâneos

**TR — Controle Interno, Módulo De Controle Interno; item 5, p. 150:**

> O sistema não poderá apresentar limitação quanto ao número de usuários simultâneos;

**Implementação:** Não introduzir teto comercial de sessões simultâneas no módulo; dimensionar capacidade e documentar limites físicos medidos.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Usar carga concorrente controlada, com usuários distintos e operações válidas.

**Aceite técnico:** Não há bloqueio artificial por número de sessões; medições e falhas reais são registradas.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-006"></a>
### CIN-006 — Ser multiusuário permitindo o trabalho simultâneo em uma mesma tarefa, com total integridade dos dados

**TR — Controle Interno, Módulo De Controle Interno; item 6, p. 150:**

> O sistema deverá ser multiusuário permitindo o trabalho simultâneo em uma mesma tarefa, com total integridade dos dados;

**Implementação:** Proteger edição simultânea de tarefa/checklist por versão de registro e confirmação transacional.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Duas sessões editam a mesma versão do ponto de auditoria; salvar A e depois B.

**Aceite técnico:** B recebe conflito ou mesclagem controlada; a evidência de A não é perdida.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-007"></a>
### CIN-007 — Número ilimitado de usuários

**TR — Controle Interno, Módulo De Controle Interno; item 7, p. 150:**

> O sistema deverá permitir número ilimitado de usuários

**Implementação:** Reutilizar cadastro de usuários sem número máximo arbitrário no código/licenciamento do módulo.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Criar lote técnico de contas de teste acima de um limite usual de demonstração e consultar por páginas.

**Aceite técnico:** Cadastros válidos não são recusados por teto artificial; não prometer capacidade infinita.

**Atenção / limite:** Ausência de limite funcional/comercial não equivale a recurso físico infinito; documentar capacidade e não esconder restrições artificiais.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-008"></a>
### CIN-008 — O cadastro de Legislações específicas

**TR — Controle Interno, Módulo De Controle Interno; item 8, p. 150:**

> O sistema deverá permitir o cadastro de Legislações específicas

**Implementação:** Criar catálogo de legislação com identificador, título, referência, vigência e arquivo/link, permitindo vincular a auditoria.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Cadastrar norma DEMO e relacioná-la ao checklist A; reabrir a referência.

**Aceite técnico:** Norma e associação permanecem consultáveis; não é criada regra legal a partir de título livre.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-009"></a>
### CIN-009 — Calendário de Obrigações Legais

**TR — Controle Interno, Módulo De Controle Interno; item 9, p. 150:**

> Calendário de Obrigações Legais;

**Implementação:** Manter obrigação, responsável, período/data limite, situação e referência legal no calendário, com filtros.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Criar duas obrigações, concluir uma e filtrar a outra pendente por período.

**Aceite técnico:** Calendário exibe prazo e responsável corretos, sem transformar prazo DEMO em vencimento oficial.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-010"></a>
### CIN-010 — Planejamento de Auditorias

**TR — Controle Interno, Módulo De Controle Interno; item 10, p. 150:**

> Planejamento de Auditorias;

**Implementação:** Cadastrar plano de auditoria com escopo, objeto, período, equipe e atividades previstas, ligado ao cronograma.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Criar auditoria A com três pontos e duas atividades futuras.

**Aceite técnico:** Plano pode ser consultado sem aparecer como auditoria executada.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-011"></a>
### CIN-011 — Execução de Auditorias

**TR — Controle Interno, Módulo De Controle Interno; item 11, p. 150:**

> Execução de Auditorias;

**Implementação:** Registrar execução por atividade, data, responsável, evidência, resultado e achados vinculados ao planejamento.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Executar dois dos três pontos de A e deixar um pendente.

**Aceite técnico:** Execução parcial aparece como parcial, preservando as evidências e o ponto pendente.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-012"></a>
### CIN-012 — Lançamento de Checklist

**TR — Controle Interno, Módulo De Controle Interno; item 12, p. 150:**

> Lançamento de Checklist;

**Implementação:** Criar modelo e lançamento de checklist com questões, critérios, resposta, observação e vínculo à auditoria.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Preencher dois pontos conformes e um não concluído no checklist de A.

**Aceite técnico:** Respostas persistidas são do checklist aplicado; editar modelo não reescreve aplicação histórica.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-013"></a>
### CIN-013 — Impressão de Checklist

**TR — Controle Interno, Módulo De Controle Interno; item 13, p. 150:**

> Impressão de Checklist;

**Implementação:** Emitir checklist preenchido e identificado pelo gerador de relatórios, incluindo todos os pontos selecionados.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Criar checklist com 12 questões, visualizar 10 por página e imprimir as 12.

**Aceite técnico:** Documento inclui as 12 questões, respostas e identificação, não uma captura da primeira página.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-014"></a>
### CIN-014 — Emissão de notificações e recomendações dentro do sistema

**TR — Controle Interno, Módulo De Controle Interno; item 14, p. 150:**

> Emissão de notificações e recomendações dentro do sistema;

**Implementação:** Gerar notificações e recomendações internas ligadas ao achado, com destinatário, texto, prazo quando configurado e acompanhamento.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Registrar uma recomendação para a diferença 1000 e abri-la com o destinatário autorizado.

**Aceite técnico:** Comunicação existe no sistema e referencia o achado; não é apenas um status no cadastro.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-015"></a>
### CIN-015 — Estabelecer nível de acesso por grupo ou usuários

**TR — Controle Interno, Módulo De Controle Interno; item 15, p. 150:**

> O sistema devera estabelecer nível de acesso por grupo ou usuários;

**Implementação:** Configurar capacidades de leitura, execução, emissão e administração por grupo/usuário no núcleo.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Dar leitura a U 1, execução a U 2 e tentar gravação direta com U 1.

**Aceite técnico:** As permissões são aplicadas no servidor e na interface.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-016"></a>
### CIN-016 — Acompanhamento de resultado primário nominal

**TR — Controle Interno, Módulo De Controle Interno; item 16, p. 150:**

> Acompanhamento de resultado primário nominal;

**Implementação:** Consultar/apurar os resultados primário e nominal a partir de bases contábeis identificadas, fórmula e período; mostrar memória.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Usar cenário contábil DEMO com receita primária 1000000 e despesa primária 900000; conferir 100000 e resultado nominal conforme fórmula separada cadastrada.

**Aceite técnico:** Cada indicador mostra sua composição e convenção; não confundir variação de caixa com resultado nominal.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-017"></a>
### CIN-017 — Gerador de ofícios, pareceres e documentos com possibilidade de arquivamento dentro do sistema

**TR — Controle Interno, Módulo De Controle Interno; item 17, p. 150:**

> Gerador de ofícios, pareceres e documentos com possibilidade de arquivamento dentro do sistema;

**Implementação:** Configurar modelos de ofício/parecer/documento com campos de mesclagem e arquivar a versão emitida no contexto de auditoria.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Gerar ofício de A, alterar modelo e emitir nova versão sem apagar o arquivo anterior.

**Aceite técnico:** Documento preenchido, autoria e versão são recuperáveis.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-018"></a>
### CIN-018 — Gerência das ações efetuadas no sistema

**TR — Controle Interno, Módulo De Controle Interno; item 18, p. 150:**

> Gerência das ações efetuadas no sistema;

**Implementação:** Disponibilizar acompanhamento das ações com auditoria, responsável, estado, datas e vínculo ao registro de origem.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Abrir plano, recomendação e providência pelo quadro de ações.

**Aceite técnico:** Cada ação é rastreável; histórico não depende apenas da situação atual.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-019"></a>
### CIN-019 — Apuração e acompanhamento dos limites constitucionais, de educação e saúde

**TR — Controle Interno, Módulo De Controle Interno; item 19, p. 150:**

> Apuração e acompanhamento dos limites constitucionais, de educação e saúde;

**Implementação:** Mapear bases, deduções, numeradores e percentuais dos indicadores de educação e saúde, usando regra e competência validadas.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** No ensaio, calcular 24000/100000=24% e comparar ao limiar DEMO 30%; trocar o recorte e verificar a mudança.

**Aceite técnico:** Há memória, fonte e rótulo de teste; ausência de base não é interpretada como cumprimento.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-020"></a>
### CIN-020 — Apuração da receita corrente líquida

**TR — Controle Interno, Módulo De Controle Interno; item 20, p. 150:**

> Apuração da receita corrente líquida;

**Implementação:** Apurar RCL pela composição mensal configurada e consultar os componentes, sem inserir o resultado manualmente no painel.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Doze meses com receita 120000 e deduções 20000 cada resultam em 1200000 no cenário.

**Aceite técnico:** Total reconcilia com os 12 meses; rubricas e exclusões oficiais dependem da configuração validada.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-021"></a>
### CIN-021 — Apuração e acompanhamento do limite de gastos com pessoal conforme exigência da Lei 101/2000 (LRF)

**TR — Controle Interno, Módulo De Controle Interno; item 21, p. 150:**

> Apuração e acompanhamento do limite de gastos com pessoal conforme exigência da Lei 101/2000 (LRF);

**Implementação:** Calcular proporção de despesa de pessoal usando RCL e composição aplicáveis por ente/período, com limite versionado.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Base DEMO 1200000 e pessoal 600000 resultam 50%; comparar a um limite de teste identificado.

**Aceite técnico:** Não somar duas folhas ou competências duplicadas; mostrar numerador, denominador e origem.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-022"></a>
### CIN-022 — Usuários devem ter acesso on-line às informações do Bano de Dados somente a partir do sistema

**TR — Controle Interno, Módulo De Controle Interno; item 22, p. 150:**

> Usuários devem ter acesso on-line às informações do Bano de Dados somente a partir do sistema;

**Implementação:** Fornecer consultas somente pela aplicação, sem entregar credenciais de banco aos usuários do módulo.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Tentar abrir endpoint/arquivo de outra auditoria e executar consulta não autorizada.

**Aceite técnico:** Escopo e identidade são obrigatórios; nenhum acesso direto irrestrito ao banco é fornecido.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-023"></a>
### CIN-023 — Emissão de relatórios de auditoria

**TR — Controle Interno, Módulo De Controle Interno; item 23, p. 150:**

> Emissão de relatórios de auditoria;

**Implementação:** Emitir relatório de auditoria com escopo, execução, pontos, evidências, achados e conclusões registradas pelo auditor.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Emitir A e conferir três pontos e os estados reais.

**Aceite técnico:** Relatório não conclui como conforme um ponto ainda sem avaliação.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-024"></a>
### CIN-024 — Emissão de relatório mensal de Controle Interno

**TR — Controle Interno, Módulo De Controle Interno; item 24, p. 150:**

> Emissão de relatório mensal de Controle Interno;

**Implementação:** Consolidar ações e auditorias do mês por período de referência explícito, mantendo links aos relatórios individuais.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Criar duas auditorias em setembro e uma em outubro; emitir setembro.

**Aceite técnico:** Duas auditorias no recorte; a de outubro não entra e pendências continuam identificadas.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-025"></a>
### CIN-025 — Emissão de relatório anual de Controle Interno

**TR — Controle Interno, Módulo De Controle Interno; item 25, p. 150:**

> Emissão de relatório anual de Controle Interno;

**Implementação:** Emitir relatório anual com os meses e indicadores/fatos de origem, sem somar relatórios mensais duplicados como novos fatos.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Consolidar um ano com dados de dois meses e comparar às execuções individuais.

**Aceite técnico:** Total e enumeração do ano reconciliam com a base; meses sem dados são identificados.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-026"></a>
### CIN-026 — Elaboração de cronograma de auditoria

**TR — Controle Interno, Módulo De Controle Interno; item 26, p. 150:**

> Elaboração de cronograma de auditoria;

**Implementação:** Manter etapas do cronograma com ordem, início/fim previstos, responsável e execução vinculada à auditoria.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Agendar duas etapas e concluir somente a primeira.

**Aceite técnico:** Previsto e executado permanecem separados, sem antecipar encerramento.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-027"></a>
### CIN-027 — Integração com todos os outros módulos do sistema (Contabilidade, Folha, Compras, Licitações, Frota, Almoxarifado, Tributos, Orçamento,…

**TR — Controle Interno, Módulo De Controle Interno; item 27, p. 151:**

> Integração com todos os outros módulos do sistema (Contabilidade, Folha, Compras, Licitações, Frota, Almoxarifado, Tributos, Orçamento, Obras, Convênios, etc...), com possibilidade de acesso a todas as informações;

**Implementação:** Mapear os serviços de todos os domínios citados e consumir dados do lado Controle Interno com origem e competência.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Alterar fato de teste no módulo de origem e conferir sua consulta no Controle Interno; repetir para cada domínio da frase.

**Aceite técnico:** Uma integração comprovada não cobre automaticamente as demais; faltantes são registradas por origem.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-028"></a>
### CIN-028 — Cruzamento de dados com informações de outros módulos para criar achados de auditoria

**TR — Controle Interno, Módulo De Controle Interno; item 28, p. 151:**

> Cruzamento de dados com informações de outros módulos para criar achados de auditoria;

**Implementação:** Configurar cruzamentos de fatos por chaves e critérios explícitos, gerando achado candidato com registros que explicam a diferença.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Cruzar contrato 10000 e pagamento 11000 do mesmo caso e outro contrato sem diferença.

**Aceite técnico:** Somente o caso divergente produz indício 1000; auditor decide sua conclusão.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-029"></a>
### CIN-029 — A emissão de relatórios salvos por usuários que os modificaram, possam ser compartilhados com outros usuários

**TR — Controle Interno, Módulo De Controle Interno; item 29, p. 151:**

> O sistema deverá permitir a emissão de relatórios salvos por usuários que os modificaram, possam ser compartilhados com outros usuários;

**Implementação:** Salvar definição e configuração de relatório modificado e permitir compartilhamento autorizado com outra conta.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** U 1 salva agrupamento;U 2 abre e executa respeitando seu próprio escopo.

**Aceite técnico:** Compartilhar não duplica dados nem transfere privilégios de U 1.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-030"></a>
### CIN-030 — S emissão de relatórios com a possibilidade de personalização de layout e impressão de brasões, definidos pelo usuário

**TR — Controle Interno, Módulo De Controle Interno; item 30, p. 151:**

> O sistema deverá permitir s emissão de relatórios com a possibilidade de personalização de layout e impressão de brasões, definidos pelo usuário;

**Implementação:** Reaproveitar identidade visual e permitir configuração do brasão/layout sem alterar o código a cada entidade.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Trocar brasão de teste e gerar tela/relatório no contexto correto.

**Aceite técnico:** Mudança persiste e não contamina outra entidade.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-031"></a>
### CIN-031 — Demonstrar análises através de dashboard (Painel eletrônico) de valores e percentuais, conforme o caso – na forma definida pelo art. 2°,…

**TR — Controle Interno, Módulo De Controle Interno; item 31, p. 151:**

> Demonstrar análises através de dashboard (Painel eletrônico) de valores e percentuais, conforme o caso – na forma definida pelo art. 2°, do Decreto Federal 7185, de 27/05/2010, que regulamentou o artigo. 48, parágrafo único da LC 101/2000, com as alterações introduzidas pela LC 131/2009 – dos limites voltados para a responsabilidade na gestão das finanças públicas;

**Implementação:** Disponibilizar dashboard com valores e percentuais provenientes das consultas e períodos identificados.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Mudar filtro e conferir valor/percentual contra relatório de origem.

**Aceite técnico:** Não há números fixos; a referência normativa literal não vira declaração automática de conformidade.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

<a id="cin-032"></a>
### CIN-032 — A extração em forma de ponto de controle quando todas as informações estiverem disponíveis e acessíveis de forma estruturada

**TR — Controle Interno, Módulo De Controle Interno; item 32, p. 151:**

> Permitir a extração em forma de ponto de controle quando todas as informações estiverem disponíveis e acessíveis de forma estruturada.

**Implementação:** Implementar extração de dados por ponto de controle como proposta rastreável: identificação do ponto, recorte, regra, registros e arquivo de saída.

**Dados de outros módulos / integração:** Contabilidade/RH/Compras/Licitações/Frotas/Almoxarifado/Tributos/Orçamento/Obras/Convênios e demais fontes; Processos/GED; Administração/Identidade e BI se disponível.

**Demonstração:** Gerar extração do ponto sobre contrato/pagamento e conferir os dois fatos e a diferença.

**Aceite técnico:** Conteúdo pode ser auditado; o formato final permanece AGUARDA_DEFINICAO se não houver modelo da Administração.

**Atenção / limite:** Não reconstruir contabilidade ou aplicar sanções por detectar diferença. IE 11 e Decreto 7185 citado precisam de compatibilidade/esclarecimento, sem substituição silenciosa.

**Contrato operacional e base de teste:** [C01 — Auditorias, prazos e controles fiscais](#pacote-c01).

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
| CIN-001 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-002 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-003 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-004 | INTERPRETACAO_A_CONFIRMAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-005 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-006 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-007 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-008 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-009 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-010 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-011 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-012 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-013 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-014 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-015 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-016 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-017 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-018 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-019 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-020 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-021 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-022 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-023 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-024 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-025 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-026 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-027 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-028 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-029 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-030 | A_VERIFICAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-031 | INTERPRETACAO_A_CONFIRMAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |
| CIN-032 | INTERPRETACAO_A_CONFIRMAR | A localizar no repositório | Não executado | Conferir pacote C01 e ressalvas |

<a id="pendencias"></a>
## Definições e ressalvas a registrar

### C-Q01 — Navegadores e plataformas

O item 4 inclui Internet Explorer 11. Não declarar esse navegador testado por ter executado em Edge/Chrome. Registrar requisito, ambiente seguro de teste e decisão de compatibilidade; não implantar plataforma sem suporte por conta própria.

### C-Q02 — Bases fiscais e referências legais

Itens 16, 19–21 e 31 exigem apuração e análise com regras legais. A citação ao Decreto 7.185/2010 permanece literal; identificar regras e versões aplicáveis, bases contábeis e validação pelo responsável. Fórmulas DEMO não são regras de implantação.

### C-Q03 — Ponto de controle

O item 32 não define formato, campos ou destinatário da extração. Proposta: posição rastreável do recorte, regra, versão e evidências; registrar como interpretação até confirmação.

### C-Q04 — Acesso a todas as informações

O item 27 exige abrangência de fontes, não dispensa permissões e sigilo. Mapear uma a uma as fontes existentes e as faltantes; auditor autorizado deve ter alcance compatível com sua atribuição, sem exposição pública.

<a id="fontes"></a>
## Fontes, método e limites da conferência

**Fonte funcional exclusiva:** `termo de referencia (Ratificado)(1).pdf`, pp. 149–151. Citações transcritas com normalização de espaços/quebras, sem corrigir redação ou reiniciar numeração. Títulos curtos e agrupamentos operacionais foram criados para navegação.

O recorte foi extraído e comparado por dois métodos. As contagens coincidiram; diferenças de leitura por paginação, hifenização ou ordem de extração foram conferidas nas imagens pertinentes. O campo TR deste arquivo foi comparado programaticamente à transcrição consolidada. A relação completa de verificações está em `RELATORIO_QA.md` no pacote.

A conferência valida composição documental, numeração, referências e aritmética dos cenários. **Não foram executados testes do CeleriFlow nem verificados provedores, credenciais, dispositivos ou homologações oficiais.** Requisito textual com dependência/contradição permanece assim até solução documentada. Os critérios do TR e a avaliação da Administração prevalecem sobre uma solução proposta pelo plano.

Nenhuma taxa, limite legal, regra contábil, especificação de fornecedor ou versão de biblioteca não fornecida foi tratada como obrigatória a partir de conhecimento geral. Referências normativas presentes na citação exigem confirmação de aplicabilidade para implantação.

