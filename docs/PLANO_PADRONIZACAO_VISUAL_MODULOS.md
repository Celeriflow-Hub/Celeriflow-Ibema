# Plano de Padronizacao Visual dos Modulos

## Objetivo

Aplicar em todos os modulos a referencia visual validada em Administracao:

- cabecalho de pagina com uma linha e acao primaria opcional;
- conteudo alinhado ao cabecalho global, sem margens duplicadas;
- paineis, formularios e tabelas compactos, com hierarquia administrativa;
- desktop com uso eficiente da area util e sem rolagens internas desnecessarias;
- mobile responsivo, com navegacao e tabelas adaptadas ao espaco disponivel.

Nenhuma etapa altera regras de negocio, rotas publicas, contratos de Server Actions ou modelos Prisma.

## Padrao Visual

| Elemento | Padrao |
| --- | --- |
| Moldura do modulo | Preenche o recuo do shell global, rail lateral compacto e conteudo com `min-w-0`. |
| Cabecalho de pagina | Faixa unica de 36 px, titulo curto, acao primaria a direita quando aplicavel. |
| Dashboards | Metricas compactas, superficies brancas com borda sutil e atalhos em grade. |
| Listagens | Barra de busca e acoes compacta, cabecalho de tabela discreto, paginacao e estados vazios claros. |
| Formularios | Campos de 32 px, grade responsiva, secoes curtas e rodape de acoes fixo ao card. |
| Desktop | Sem `overflow-y-auto` aninhado; paginas extensas paginam registros em vez de criar listas altas. |
| Mobile | Menu em drawer ou expansivel; colunas secundarias podem ser ocultadas ou reorganizadas. |

## Plano Por Modulo

| Modulo | Onda | Ajustes principais |
| --- | --- | --- |
| Administracao | 1 | Referencia inicial pronta em Dados da Prefeitura e Secretarias; aplicar cabecalho, tabelas e formularios compactos nas demais telas. |
| Atendimento | 2 | Compactar rail, painel, fila, chamados e formularios de ouvidoria. |
| Cadastros | 2 | Compactar shell, painel de indicadores e CRUDs de pessoas, fornecedores, imoveis e documentos. |
| Camara | 3 | Unificar dashboard legado, listas legislativas e paginas de portal. |
| Compras | 2 | Manter primitives existentes e alinhar cabecalhos, filtros, tabelas e formularios de processos, licitacoes e contratos. |
| Configuracoes | 3 | Atualizar shell legado e telas de usuarios, perfis, integracoes e auditoria. |
| Controle Interno | 4 | Reorganizar a pagina isolada em secoes compactas e responsivas. |
| Cultura | 3 | Padronizar dashboard, cards operacionais e CRUDs setoriais. |
| Dashboard | 1 | Ajustar o lancador geral para a mesma densidade e hierarquia visual. |
| Documentos | 2 | Padronizar painel, GED, modelos e assinaturas. |
| Educacao | 3 | Compactar telas de escolas, merenda, matriculas, professores e transporte. |
| Financeiro | 2 | Preservar o rail escuro agrupado; alinhar paginas internas, filtros, tabelas e formularios ao novo padrao. |
| Frotas | 4 | Reestruturar a pagina isolada de controle e listagens. |
| Indicadores | 4 | Alinhar metricas executivas e estados de dados. |
| Meio Ambiente | 3 | Padronizar CRUDs locais, sheets, tabelas e dashboard. |
| Notificacoes | 4 | Aplicar cabecalho, filtros e lista compacta. |
| Obras | 3 | Atualizar dashboard e telas de projetos, ordens, medicoes e equipes. |
| Patrimonio | 2 | Alinhar primitives, tabelas, inventarios e formularios sem alterar fluxos patrimoniais. |
| Processos | 4 | Padronizar a pagina de entrada e direcionamentos existentes. |
| Protocolos | 2 | Compactar painel, busca, acompanhamento, assinaturas e fluxo de processos. |
| RH | 2 | Alinhar listagens e formularios extensos de servidores, folha e eventos. |
| Saneamento | 3 | Padronizar dashboard, faturamento, leituras, unidades e servicos. |
| Saude | 3 | Eliminar calculos locais de altura conflituosos e alinhar listas clinicas e agendas. |
| Seguranca | 2 | Unificar telas hibridas de guardas, ocorrencias, rondas e transito. |
| Social | 3 | Compactar dashboard e CRUDs de familias, beneficios e atendimentos. |
| Transparencia | 3 | Padronizar painel, listas publicaveis, banners, noticias e diario oficial. |
| Tributacao | 2 | Aplicar barra de filtros, listas e formularios consistentes em todo o ciclo tributario. |

## Ondas de Implementacao

### Onda 1: Fundacao e referencia

1. Criar componentes reutilizaveis para moldura, cabecalho e superficies de pagina.
2. Consolidar a densidade do shell global e dos layouts modulares.
3. Concluir Administracao e Dashboard como referencias de uso.

### Onda 2: Modulos de maior volume operacional

1. Atendimento, Cadastros, Compras, Documentos, Financeiro, Patrimonio, Protocolos, RH, Seguranca e Tributacao.
2. Priorizar paginas de entrada, listagens, filtros, novos cadastros e edicoes.

### Onda 3: Modulos setoriais e legados

1. Camara, Configuracoes, Cultura, Educacao, Meio Ambiente, Obras, Saneamento, Saude, Social e Transparencia.
2. Substituir espacamentos e estruturas repetidas por componentes compartilhados sem reescrever fluxos.

### Onda 4: Modulos isolados

1. Controle Interno, Frotas, Indicadores, Notificacoes e Processos.
2. Normalizar as paginas unicas, seus estados vazios e acoes principais.

## Criterios de Aceite

1. Cada modulo possui uma pagina de entrada com o mesmo padrao de cabecalho e superficie.
2. Formularios de desktop usam grade responsiva e evitam rolagem por excesso de espacamento.
3. Listagens grandes possuem paginacao; tabelas nao usam rolagem vertical interna.
4. Navegacao lateral e acoes continuam acessiveis em desktop e mobile.
5. Cada onda passa por `npm run lint` e `npm run build`.
