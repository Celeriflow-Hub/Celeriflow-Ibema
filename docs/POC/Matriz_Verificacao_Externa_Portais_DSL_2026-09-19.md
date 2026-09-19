# Matriz de verificação externa — Portais de Divino de São Lourenço/ES

**Data da consulta:** 19/09/2026.  
**Objeto:** comparar o portal público atual e seus destinos com as 185 entradas do MD CeleriFlow REV02.  
**Natureza:** análise documental e inspeção pública de leitura. **Não é auditoria do CMS, certificação de acessibilidade, teste do CeleriFlow nem resultado oficial de POC.**

## 1. Conclusão de uso

O site atual é referência de conteúdo, navegação e contexto municipal; não é a especificação de aceitação. Copiar páginas e manter links para o fornecedor anterior não demonstra o CMS exigido nem a integração da Transparência aos módulos de origem. O produto a preparar é um Portal Institucional administrável e um Portal da Transparência funcional, com responsabilidades distintas e componentes compartilháveis.

Não foi atribuída nota de conformidade ao sistema atual. Nenhuma linha abaixo significa que o requisito inteiro foi homologado. A ausência de acesso administrativo impede verificar muitas funções; o bloqueio de leitura automatizada da Transparência impede concluir sobre suas consultas internas.

## 2. Fontes documentais e conferência

- **MD:** `CeleriFlow_POC_Portais_Institucional_Transparencia_Desenvolvimento_REV02(1).md`, revisão de 18/09/2026, fornecido nesta conversa.
- **TR:** `termo de referencia (Ratificado)(2).pdf`, encontrado na biblioteca, Processo Administrativo nº 1026/2026, 335 páginas. Blocos POR: pp. 310–320; PTR: pp. 145–149; POC: pp. 332–335.
- **Conferência realizada nesta análise:** 134 transcrições POR e 51 PTR coincidiram com o PDF encontrado após normalização de espaços/quebras e retirada dos cabeçalhos de página. Isso valida as transcrições comparadas, não todas as decisões de implementação nem a inexistência de uma retificação posterior.
- A página 316 confirma a frase incompleta do item 75. A página 335 confirma o mínimo de 90%. Não foi obtido roteiro posterior da comissão com amostra, agrupamento e denominador de avaliação.

## 3. Regras da POC encontradas no TR

A apresentação é prática, com sistema em pleno funcionamento, após a habilitação. O TR prevê até dois dias úteis para preparar o piloto e início das demonstrações a partir do terceiro dia útil, contados segundo a convocação; até cinco dias úteis de demonstração, prorrogáveis; aprovação mínima de 90% dos requisitos do TR; e providência dos requisitos faltantes até a efetiva implantação. Durante eventual diligência não se permite alterar o produto, ressalvadas parametrizações e alterações pela interface com conhecimento da equipe.

**Não converter os 90% em uma franquia automática de falhas para cada portal.** O texto também se refere a requisitos selecionados pela Administração, e a base concreta de cálculo deve ser confirmada. A matriz de 185 entradas não representa todos os módulos do edital. A meta interna de preparar todos os itens definidos é diferente da regra formal de aprovação.

## 4. Legenda — observabilidade, não julgamento de atendimento

| Código | Significado | O que falta para fechar o requisito |
|---|---|---|
| P | Há evidência pública parcial relacionada ao assunto. | Conferir todos os campos, comportamentos, contexto do portal e operação administrativa. Não equivale a “atende”. |
| U | Operação administrativa não acessada. | Entrar com perfil autorizado, executar manutenção/configuração e conferir persistência e efeito público. |
| T | Verificação técnica ou de integração não executada. | Inspecionar arquitetura e executar teste autorizado de ponta a ponta, conforme o ID no MD. |
| N | Não foi localizada, na amostra pública examinada, demonstração equivalente à função. | Conferir o CMS e demonstrar instrumento nativo; ausência na amostra não prova inexistência na plataforma. |
| B | Consulta própria da Transparência não pôde ser validada pela ferramenta. | Repetir navegação em ambiente autorizado. Retorno HTTP 403 à ferramenta não prova indisponibilidade aos cidadãos. |
| Q | A fonte contém redação incompleta ou divergente. | Obter esclarecimento; não marcar como atendido nem inventar o complemento. |

**Leitura das evidências:** uma referência ao mapa do site prova a existência do caminho, não a execução do destino. Uma referência a uma secretaria no Institucional não prova automaticamente a informação na área própria da Transparência. A coluna “Verificação restante” indica a camada principal, não um substituto do teste detalhado do MD.

## 5. Registro das fontes públicas

| Ref. | Página / consulta | Resultado observado, limitado à leitura efetuada |
|---|---|---|
| S01 | Página inicial — `https://dslourenco.es.gov.br/` | Entradas institucionais, serviços externos, newsletter e calendário incorporado. O texto da newsletter refere-se à Câmara. O link Portal do Aluno aponta ao domínio de NFS-e; o destino não foi validado. |
| S02 | Mapa — `https://dslourenco.es.gov.br/mapa-do-site` | Caminhos de despesas, receitas, pessoal, bens, estoque e repasses para `divinodesaolourenco-es.portaltp.com.br`. Relatório Execução Orçamentária aponta para `cmpresidentekennedy-es.portaltp.com.br`, outro contexto municipal. |
| S03 | Notícias — `https://dslourenco.es.gov.br/noticias` | Conteúdo publicado, categorias e datas. Há publicações de setembro/2026. Criação/edição/revisão/envio não foram testados. |
| S04 | Dados abertos — `https://dslourenco.es.gov.br/dados-abertos`; consulta `https://dslourenco.es.gov.br/api/noticias?page=1&limit=10&format=json` | A documentação anuncia JSON/CSV/XML/TXT para conjuntos editoriais. A consulta de notícias respondeu JSON com conteúdo. Isso não demonstra os cinco formatos das consultas financeiras da Transparência. |
| S05 | Calendário incorporado, acessado pelo iframe da página inicial | O destino é Google Calendar, identificado como agenda de eventos municipal. A incorporação não demonstra manutenção no CMS nem relação agenda–categoria–ocorrência do MD. |
| S06 | Secretaria de Administração — `https://dslourenco.es.gov.br/secretarias/Secretaria%20de%20Administra%C3%A7%C3%A3o` | Descrição institucional e membros com campos funcionais. Não foi comprovada sincronização com RH nem o conjunto de remuneração exigido na Transparência. |
| S07 | Participação — `https://dslourenco.es.gov.br/opina-cidadao` | Opinião favorável/contrária a matérias. Não demonstrou questionários e enquetes gerais com os três tipos de pergunta, revisão, prazo e resultados configuráveis. |
| S08 | E-SIC — `https://dslourenco.es.gov.br/comunicacao/e-sic` | Apresenta formulários, acompanhamento, informações do SIC físico, orientação sobre recursos e estatísticas percentuais. Não foram enviados pedidos nem testados recurso/resposta/publicação. |
| S09 | Relatórios E-SIC — `https://dslourenco.es.gov.br/relatorios/e-sic` | A página retornou o cabeçalho de relatórios, sem relatórios listados na leitura. |
| S10 | API pública documentada — `https://dslourenco.es.gov.br/api/relatorios-esic?page=1&limit=10&format=json` | Retornou `data: []` e `pagination.total: 0`, sem filtro de período. É ausência de registros nesse endpoint, não prova de ausência de pedidos no E-SIC ou de relatórios em qualquer outra origem. |
| S11 | História — `https://dslourenco.es.gov.br/historia/sede` | Galeria fotográfica e referências de imagens, inclusive em armazenamento S3. Não comprova que todos os arquivos usam objetos em nuvem nem as regras de privacidade/reutilização do gerenciador. |
| S12 | Licitações — `https://dslourenco.es.gov.br/compras/licitacoes/1` | Listagem com processos, modalidades, situações e objetos, incluindo o Processo 1026/2026. Íntegras e vínculo automático com Compras não foram homologados. |
| S13 | Contratos — `https://dslourenco.es.gov.br/compras/contratos/1` | Há formulário de filtros; a consulta inicial retornou mensagem de ausência de contratos com os parâmetros informados. Não significa inexistência de contratos municipais em outras consultas. |
| S14 | Fale Conosco, pelo menu público | O link abriu o fluxo de identificação da Ouvidoria. Existe um caminho de contato; a entrega de mensagem não foi testada. |
| S15 | Transparência — `https://divinodesaolourenco-es.portaltp.com.br/`, consultas vinculadas de despesas, servidores, documentos e estoque | Houve erros de leitura e respostas HTTP 403. Não foram confirmados fichas completas, filtros, dados, formatos de arquivo nem integração com o ERP. |

## 6. Matriz individual

A coluna TR identifica a página da exigência original. Para demonstração funcional, utilizar o bloco do mesmo ID na seção 7 (POR) ou 12.6 (PTR) do MD. Os cenários, dados fictícios e testes desse documento continuam sendo orientação de engenharia, não roteiro oficial da comissão.

### Portal Institucional — 134 entradas

| ID | Exigência resumida do MD | TR, p. | Estado | Evidência | Verificação restante |
|---|---|---:|:---:|---|---|
| POR-001 | Portal web responsivo nos navegadores e dispositivos citados | 310 | P | S01 | Saída pública; operação interna pendente |
| POR-002 | Área pública anônima e gerenciador privado | 310 | P | S03 | Saída pública; operação interna pendente |
| POR-003 | Padrões W3C e usabilidade | 310 | T | MD; TR | Estrutura técnica / integração / acessibilidade |
| POR-004 | Registros em banco relacional e consulta dinâmica | 310 | T | MD; TR | Estrutura técnica / integração / acessibilidade |
| POR-005 | Arquivos em armazenamento de objetos em nuvem | 310 | P | S11 | Saída pública; operação interna pendente |
| POR-006 | Conteúdo textual em português do Brasil | 310 | P | S03 | Saída pública; operação interna pendente |
| POR-007 | Conjunto de recursos de acessibilidade | 310 | P | S01 | Saída pública; operação interna pendente |
| POR-008 | HTML lógico e semântico | 310 | T | MD; TR | Estrutura técnica / integração / acessibilidade |
| POR-009 | Texto alternativo das imagens | 310 | T | MD; TR | Estrutura técnica / integração / acessibilidade |
| POR-010 | Alternativas acessíveis para áudio e vídeo | 310 | T | MD; TR | Estrutura técnica / integração / acessibilidade |
| POR-011 | Hiperlinks com textos significativos | 310 | T | MD; TR | Estrutura técnica / integração / acessibilidade |
| POR-012 | Tags semânticas para leitores e buscadores | 310 | T | MD; TR | Estrutura técnica / integração / acessibilidade |
| POR-013 | Tabelas somente para dados | 310–311 | T | MD; TR | Estrutura técnica / integração / acessibilidade |
| POR-014 | Atalhos, fonte, contraste e páginas de acessibilidade/mapa | 311 | P | S01,S02 | Saída pública; operação interna pendente |
| POR-015 | Ordenação editorial por clicar, arrastar e soltar | 311 | U | MD; TR | CMS / operação |
| POR-016 | Parametrização e adaptação do portal | 311 | U | MD; TR | CMS / operação |
| POR-017 | Sincronização entre gerenciador, banco e portal | 311 | U | MD; TR | CMS / operação |
| POR-018 | Operações de manutenção dos registros do CMS | 311 | U | MD; TR | CMS / operação |
| POR-019 | Atualização dinâmica pelo usuário responsável | 311 | U | MD; TR | CMS / operação |
| POR-020 | Manutenção de menus e itens de menu | 311 | U | MD; TR | CMS / operação |
| POR-021 | Campos completos na criação do item de menu | 311 | U | MD; TR | CMS / operação |
| POR-022 | Edição completa do item de menu | 311–312 | U | MD; TR | CMS / operação |
| POR-023 | Árvore completa de menus com indentação | 312 | U | MD; TR | CMS / operação |
| POR-024 | Ações da listagem de menus | 312 | U | MD; TR | CMS / operação |
| POR-025 | Confirmação antes de excluir menu | 312 | U | MD; TR | CMS / operação |
| POR-026 | Ocultar exclusão de menu com dependentes | 312 | U | MD; TR | CMS / operação |
| POR-027 | Arrastar e soltar itens de menu | 312 | U | MD; TR | CMS / operação |
| POR-028 | Manutenção de páginas dinâmicas | 312 | P | S06,S11 | Saída pública; operação interna pendente |
| POR-029 | Título, situação e conteúdo da página | 312 | P | S06 | Saída pública; operação interna pendente |
| POR-030 | Editor WYSIWYG completo para páginas | 312 | U | MD; TR | CMS / operação |
| POR-031 | URL automática da página | 312 | U | MD; TR | CMS / operação |
| POR-032 | Criar menu a partir de uma página | 312–313 | U | MD; TR | CMS / operação |
| POR-033 | Pré-visualização da página pela listagem | 313 | U | MD; TR | CMS / operação |
| POR-034 | Confirmação para exclusão de página | 313 | U | MD; TR | CMS / operação |
| POR-035 | Bloqueio público de página inativa | 313 | U | MD; TR | CMS / operação |
| POR-036 | Configuração do componente de agenda | 313 | U | S05 (apenas calendário externo) | CMS / operação |
| POR-037 | Limites, visão e situação do componente de agenda | 313 | U | S05 (apenas calendário externo) | CMS / operação |
| POR-038 | Manutenção de agendas | 313 | U | S05 (apenas calendário externo) | CMS / operação |
| POR-039 | Título e uma ou mais categorias por agenda | 313 | U | S05 (apenas calendário externo) | CMS / operação |
| POR-040 | URL automática de agenda | 313 | U | S05 (apenas calendário externo) | CMS / operação |
| POR-041 | Criar menu a partir de agenda | 313 | U | S05 (apenas calendário externo) | CMS / operação |
| POR-042 | Criar ocorrência no contexto de agenda | 313 | U | S05 (apenas calendário externo) | CMS / operação |
| POR-043 | Manutenção das categorias de agenda | 313 | U | S05 (apenas calendário externo) | CMS / operação |
| POR-044 | Título da categoria de agenda | 313 | U | S05 (apenas calendário externo) | CMS / operação |
| POR-045 | Manutenção das ocorrências de agenda | 313 | U | S05 (apenas calendário externo) | CMS / operação |
| POR-046 | Campos completos da ocorrência | 313 | U | S05 (apenas calendário externo) | CMS / operação |
| POR-047 | Envio de ocorrência aos assinantes | 313 | U | S05 (apenas calendário externo) | CMS / operação |
| POR-048 | Ocorrência vinculada à categoria, não diretamente à agenda | 313 | T | MD; TR | Estrutura técnica / integração / acessibilidade |
| POR-049 | Manutenção de notícias | 314 | P | S03,S04 | Saída pública; operação interna pendente |
| POR-050 | Campos completos da notícia | 314 | P | S03,S04 | Saída pública; operação interna pendente |
| POR-051 | Editor WYSIWYG completo para notícias | 314 | U | MD; TR | CMS / operação |
| POR-052 | Envio de notícia aos assinantes | 314 | U | MD; TR | CMS / operação |
| POR-053 | Manutenção das categorias de notícia | 314 | U | MD; TR | CMS / operação |
| POR-054 | Categoria de agenda: título e situação — redação divergente | 314 | Q | MD; TR | Definição da fonte |
| POR-055 | Configuração do componente de notícias | 314 | U | MD; TR | CMS / operação |
| POR-056 | Limites de notícias, destaques e carrossel | 314 | U | MD; TR | CMS / operação |
| POR-057 | Manutenção de galerias | 314 | P | S11 | Saída pública; operação interna pendente |
| POR-058 | Título, descrição, tipo, capa e situação da galeria | 314 | P | S11 | Saída pública; operação interna pendente |
| POR-059 | Envio de galeria aos assinantes no cadastro | 314 | U | MD; TR | CMS / operação |
| POR-060 | URL automática da galeria | 315 | U | MD; TR | CMS / operação |
| POR-061 | Manutenção dos itens da galeria | 315 | P | S11 | Saída pública; operação interna pendente |
| POR-062 | Itens de galeria exclusivamente pelo repositório | 315 | T | MD; TR | Estrutura técnica / integração / acessibilidade |
| POR-063 | Nome e descrição do item de galeria | 315 | U | MD; TR | CMS / operação |
| POR-064 | Listagem completa dos itens de uma galeria | 315 | P | S11 | Saída pública; operação interna pendente |
| POR-065 | Excluir item sem excluir arquivo do repositório | 315 | U | MD; TR | CMS / operação |
| POR-066 | Manutenção de questionários | 315 | N | S07 | Instrumento público equivalente não demonstrado |
| POR-067 | Título, descrição e janela do questionário | 315 | U | MD; TR | CMS / operação |
| POR-068 | Configurações de acesso, resultados e encerramento do questionário | 315 | U | MD; TR | CMS / operação |
| POR-069 | Questões de única escolha, múltipla e discursiva | 315 | N | S07 | Instrumento público equivalente não demonstrado |
| POR-070 | Campos e alternativas de única escolha no questionário | 315 | U | MD; TR | CMS / operação |
| POR-071 | Ordenar opções de única escolha do questionário | 315 | U | MD; TR | CMS / operação |
| POR-072 | Campos e alternativas de múltipla escolha do questionário | 315 | U | MD; TR | CMS / operação |
| POR-073 | Ordenar opções de múltipla escolha do questionário | 315 | U | MD; TR | CMS / operação |
| POR-074 | Questão discursiva e obrigatoriedade no questionário | 315–316 | U | MD; TR | CMS / operação |
| POR-075 | Função para remover — objeto não especificado | 316 | Q | MD; TR | Definição da fonte |
| POR-076 | Ordenar questões do questionário | 316 | U | MD; TR | CMS / operação |
| POR-077 | Excluir questão durante cadastro do questionário | 316 | U | MD; TR | CMS / operação |
| POR-078 | Excluir alternativa durante cadastro do questionário | 316 | U | MD; TR | CMS / operação |
| POR-079 | Revisão do questionário antes de publicar | 316 | U | MD; TR | CMS / operação |
| POR-080 | Prorrogar término de questionário ainda vigente | 316 | U | MD; TR | CMS / operação |
| POR-081 | Manutenção de enquetes | 316 | N | S07 | Instrumento público equivalente não demonstrado |
| POR-082 | Título, descrição e janela da enquete | 316 | U | MD; TR | CMS / operação |
| POR-083 | Configuração de acesso, resultados e encerramento da enquete | 316 | U | MD; TR | CMS / operação |
| POR-084 | Tipos de questão da enquete | 316 | N | S07 | Instrumento público equivalente não demonstrado |
| POR-085 | Única escolha na enquete: campos e opções | 316 | U | MD; TR | CMS / operação |
| POR-086 | Ordenar opções únicas da enquete | 316 | U | MD; TR | CMS / operação |
| POR-087 | Múltipla escolha na enquete: campos e opções | 316 | U | MD; TR | CMS / operação |
| POR-088 | Ordenar opções múltiplas da enquete | 316 | U | MD; TR | CMS / operação |
| POR-089 | Questão discursiva da enquete | 316–317 | U | MD; TR | CMS / operação |
| POR-090 | Excluir alternativa durante cadastro da enquete | 317 | U | MD; TR | CMS / operação |
| POR-091 | Revisão da enquete antes da publicação | 317 | U | MD; TR | CMS / operação |
| POR-092 | Prorrogar término de enquete vigente | 317 | U | MD; TR | CMS / operação |
| POR-093 | Dashboard com quatro indicadores de newsletter | 317 | U | MD; TR | CMS / operação |
| POR-094 | Gráfico de pizza dos motivos de cancelamento | 317 | U | MD; TR | CMS / operação |
| POR-095 | Comparativo mensal de inscrições e cancelamentos | 317 | U | MD; TR | CMS / operação |
| POR-096 | Configuração do componente de newsletter | 317 | P | S01 | Saída pública; operação interna pendente |
| POR-097 | Mensagens customizadas da newsletter | 317 | U | MD; TR | CMS / operação |
| POR-098 | Listagem completa das inscrições | 317 | U | MD; TR | CMS / operação |
| POR-099 | Criar, consultar e excluir motivos de cancelamento | 317 | U | MD; TR | CMS / operação |
| POR-100 | Áudio descrição da listagem de motivos | 317 | U | MD; TR | CMS / operação |
| POR-101 | Desativar ou excluir motivo pela listagem | 317 | U | MD; TR | CMS / operação |
| POR-102 | Título e situação do motivo de cancelamento | 317 | U | MD; TR | CMS / operação |
| POR-103 | Áudio descrição do cadastro de motivo | 317 | U | MD; TR | CMS / operação |
| POR-104 | Configuração do acesso rápido | 318 | U | MD; TR | CMS / operação |
| POR-105 | Limites de 1–12 itens e 1–6 por linha | 318 | U | MD; TR | CMS / operação |
| POR-106 | Manutenção dos itens de acesso rápido | 318 | P | S01 | Saída pública; operação interna pendente |
| POR-107 | Campos na criação do acesso rápido | 318 | P | S01 | Saída pública; operação interna pendente |
| POR-108 | Edição completa do acesso rápido | 318 | U | MD; TR | CMS / operação |
| POR-109 | Ordenação por arraste do acesso rápido | 318 | U | MD; TR | CMS / operação |
| POR-110 | Manutenção de redes sociais | 318 | P | S02 | Saída pública; operação interna pendente |
| POR-111 | Áudio descrição do cadastro de rede social | 318 | U | MD; TR | CMS / operação |
| POR-112 | Campos de criação de rede social | 318 | P | S02 | Saída pública; operação interna pendente |
| POR-113 | Edição dos campos de rede social | 318 | U | MD; TR | CMS / operação |
| POR-114 | Ordenar redes sociais por arraste | 319 | U | MD; TR | CMS / operação |
| POR-115 | Manutenção de links úteis | 319 | P | S02 | Saída pública; operação interna pendente |
| POR-116 | Campos de criação de link útil | 319 | P | S02 | Saída pública; operação interna pendente |
| POR-117 | Edição de link útil | 319 | U | MD; TR | CMS / operação |
| POR-118 | Ordenação de rede social em Links Úteis — redação divergente | 319 | Q | MD; TR | Definição da fonte |
| POR-119 | Manutenção de telefones úteis | 319 | U | MD; TR | CMS / operação |
| POR-120 | Campos de criação do telefone útil | 319 | U | MD; TR | CMS / operação |
| POR-121 | Edição completa do telefone útil | 319 | U | MD; TR | CMS / operação |
| POR-122 | Desativação do telefone útil | 319 | U | MD; TR | CMS / operação |
| POR-123 | Ordenar telefones úteis por arraste | 319 | U | MD; TR | CMS / operação |
| POR-124 | Manutenção da árvore de repositórios | 319 | U | MD; TR | CMS / operação |
| POR-125 | Localização, nome, descrição, situação e privacidade do repositório | 319 | U | MD; TR | CMS / operação |
| POR-126 | Edição da privacidade e dados do repositório | 319–320 | U | MD; TR | CMS / operação |
| POR-127 | Mover repositório na árvore | 320 | U | MD; TR | CMS / operação |
| POR-128 | Desativar repositório | 320 | U | MD; TR | CMS / operação |
| POR-129 | Criar menu a partir do repositório | 320 | U | MD; TR | CMS / operação |
| POR-130 | Manutenção dos arquivos | 320 | P | S11 | Saída pública; operação interna pendente |
| POR-131 | Envio de um ou mais arquivos com prefixo no nome | 320 | U | MD; TR | CMS / operação |
| POR-132 | Renomear um ou mais arquivos logo após o envio | 320 | U | MD; TR | CMS / operação |
| POR-133 | Edição de nome, descrição e situação do arquivo | 320 | U | MD; TR | CMS / operação |
| POR-134 | Mover arquivo entre níveis do repositório | 320 | U | MD; TR | CMS / operação |

### Portal da Transparência — 51 entradas

| ID | Exigência resumida do MD | TR, p. | Estado | Evidência | Verificação restante |
|---|---|---:|:---:|---|---|
| PTR-001 | Portal da Transparência responsivo | 145 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-002 | Disponibilidade web e acessos simultâneos | 145–146 | T | MD; TR | Integração / infraestrutura / migração |
| PTR-003 | Identidade visual própria da Transparência | 146 | U | MD; TR | Administração / publicação |
| PTR-004 | Informações das unidades gestoras publicantes | 146 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-005 | Glossário da Transparência | 146 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-006 | Seção Fale Conosco | 146 | P | S14 | Evidência pública parcial / contexto a conferir |
| PTR-007 | Ferramentas de acessibilidade na Transparência | 146 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-008 | Mapa do site da Transparência | 146 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-009 | Perguntas frequentes da Transparência | 146 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-010 | Manual de navegação | 146 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-011 | Legislação de referência do portal | 146 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-012 | Estrutura organizacional pública | 146 | P | S06 | Evidência pública parcial / contexto a conferir |
| PTR-013 | Informações das unidades administrativas | 146 | P | S06 | Evidência pública parcial / contexto a conferir |
| PTR-014 | Carta de Serviços do Executivo | 146 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-015 | Planos, orçamentos e prestações de contas publicados | 146 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-016 | Execução orçamentária e financeira em tempo real | 146 | T | MD; TR | Integração / infraestrutura / migração |
| PTR-017 | Consulta por despesa empenhada, liquidada e paga | 146–147 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-018 | Ficha da despesa com todos os campos mínimos | 147 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-019 | Etapas relacionadas à mesma despesa | 147 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-020 | Dados mínimos do pagamento | 147 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-021 | Dados mínimos do empenho | 147 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-022 | Orçamento e execução da receita | 147 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-023 | Estágios da receita | 147 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-024 | Repasses e transferências financeiras | 147 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-025 | Convênios e instrumentos congêneres | 147 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-026 | Compras realizadas com itens e valores | 147 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-027 | Contratos e aditivos na íntegra | 147 | B | S13; S15 | Consulta própria da Transparência |
| PTR-028 | Licitações, dispensas e inexigibilidades | 147 | P | S12 | Evidência pública parcial / contexto a conferir |
| PTR-029 | Informações dos bens patrimoniais | 147–148 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-030 | Entradas e saídas do almoxarifado | 148 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-031 | Menu de servidores e informações funcionais | 148 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-032 | Valores bruto, líquido, descontos e vencimentos | 148 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-033 | Diárias com beneficiário, viagem e valor | 148 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-034 | Informações sobre passagens | 148 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-035 | E-SIC com recurso, estatística e publicação | 148 | P | S08,S09,S10 | Evidência pública parcial / contexto a conferir |
| PTR-036 | SIC físico do município | 148 | P | S08 | Evidência pública parcial / contexto a conferir |
| PTR-037 | Publicação do CAFIMP | 148 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-038 | Links para outros portais e sites | 148 | P | S02 | Evidência pública parcial / contexto a conferir |
| PTR-039 | Programas, projetos e ações | 148 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-040 | Obras públicas municipais | 148 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-041 | Inserção dos relatórios de planejamento e contas | 148 | U | MD; TR | Administração / publicação |
| PTR-042 | Documentos do Controle Interno | 148 | U | MD; TR | Administração / publicação |
| PTR-043 | Publicação de documentos no portal | 148 | U | MD; TR | Administração / publicação |
| PTR-044 | Seleção de entidades e menus exibidos | 148–149 | U | MD; TR | Administração / publicação |
| PTR-045 | Ativação e desativação de menus nativos | 149 | U | MD; TR | Administração / publicação |
| PTR-046 | Filtros e busca por palavra-chave | 149 | B | S15; S02 (somente navegação) | Consulta própria da Transparência |
| PTR-047 | Upload administrativo e download de documentos | 149 | U | MD; TR | Administração / publicação |
| PTR-048 | Exportação em formatos abertos e analisáveis | 149 | B | S15; S04 (API institucional não substitui PTR) | Consulta própria da Transparência |
| PTR-049 | Exportações PDF, XLS, XLSX, RTF e CSV | 149 | B | S15; S04 (API institucional não substitui PTR) | Consulta própria da Transparência |
| PTR-050 | Migração de pelo menos seis meses | 149 | T | MD; TR | Integração / infraestrutura / migração |
| PTR-051 | Integração com os seis grupos de sistemas da gestão | 149 | T | MD; TR | Integração / infraestrutura / migração |

## 7. Ajustes recomendados no MD, sem reescrever os requisitos

**Acrescentar a governança da POC.** Registrar a seção 20 do TR, os 90%, a preparação do piloto, a necessidade de sistema operacional e a restrição de alterações em diligência. Separar “teste interno”, “item selecionado pela comissão”, “resultado oficial” e “pendência de implantação”.

**Não tomar o site como teto do escopo.** Manter os requisitos de administração que não são visíveis publicamente: editor completo; árvores e arraste; repositório público/privado; agenda por categorias; três tipos de questões; revisão; newsletter com métricas; e áudios orientativos das três telas indicadas.

**Não importar automaticamente serviços extras.** NF-e, IPTU, contracheque, portal educacional e sistema de disputa pertencem às respectivas origens. O link no Institucional não exige reconstruí-los neste pacote. A Transparência, contudo, deve publicar seus próprios dados e não pode ser substituída pelo link ao sistema antigo.

**Separar escopo de migração e etapa de demonstração.** A capacidade de importar seis meses não significa que seis registros fictícios provem a migração de produção. O inventário de notícias, mídias, URLs e documentos institucionais deve ser tratado na implantação, conforme as demais cláusulas aplicáveis e os arquivos fornecidos. Não presumir que o recorte de seis meses da Transparência limita todo o histórico do site.

**Manter identidade municipal configurável.** A identidade do CeleriFlow pode organizar o gerenciador e os componentes, sem impedir brasão, logotipo, banner e cores da contratante previstos em PTR-003. Não foi localizada determinação de cópia visual pixel a pixel nos dois blocos comparados.

**Distinguir escolhas de engenharia de texto obrigatório.** Tipografia, altura de linha, número inicial de linhas por página, metas internas de desempenho, arquitetura de cache e dados demonstrativos são propostas. Os cinco formatos de PTR-049 são a cobertura conservadora adotada pelo MD para a enumeração “tais como”; não devem ser reduzidos silenciosamente nem apresentados como roteiro adicional aprovado pela comissão.

**Conservar as ressalvas.** POR-054 e POR-118 têm objeto divergente do subtítulo; POR-075 continua sem objeto. A possibilidade de esclarecer não permite apresentar atendimento fictício.

## 8. Sequência de ensaio sugerida

Apresentar primeiro a consulta pública; depois cadastrar/editar no gerenciador e comprovar reflexo em sessão anônima. Demonstrar repositório e privacidade, agenda por categorias, notícias/galerias, pesquisas e newsletter. Na Transparência, apresentar ficha e etapas de despesa, alterar fato válido na origem e conferir o reflexo, consultar folha/estoque/compras, publicar um documento, executar o fluxo de E-SIC em homologação e exportar o filtro completo. Demonstrar migração separadamente com origem e dados explicitamente identificados.

Esse encadeamento é uma recomendação para a preparação. Os dados fictícios não devem ser enviados a contatos reais nem publicados no ambiente oficial. Nenhuma dessas ações foi executada no CeleriFlow ou no CMS da Prefeitura nesta auditoria.

## 9. Limites e próximo documento necessário

O TR ratificado foi encontrado e lido; não é necessário reenviá-lo para fundamentar esta comparação. O documento ainda necessário para fechar a estratégia de sessão é eventual convocação/roteiro/esclarecimento posterior, principalmente sobre seleção dos requisitos, cálculo do percentual, demonstração de integrações e dados aceitos. Uma versão posterior pode prevalecer sobre o PDF aqui comparado.
