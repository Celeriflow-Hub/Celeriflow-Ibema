# CeleriFlow — Desenvolvimento e demonstração da POC
## Recursos Humanos e Folha de Pagamento | Divino de São Lourenço/ES

**Revisão 01 — 19/09/2026.**  
**Destinatário:** Codex/Antigravity com acesso ao repositório real do CeleriFlow.  
**Fonte funcional:** `termo de referencia (Ratificado)(1).pdf`, Processo Administrativo nº 1026/2026, bloco **RECURSOS HUMANOS E FOLHA DE PAGAMENTO**, páginas **73–89**, itens **1–201**. O recorte começa após Contabilidade Pública e termina antes de **GESTÃO DO PORTAL DO SERVIDOR**.  
**Rastreabilidade:** **RHF-001 a RHF-201**; os prefixos são de trabalho e preservam os números do TR. O item **49 é um título numerado**, conservado como tal. Há 201 entradas documentais, não 201 telas ou 201 funções independentes.  
**Objetivo:** adaptar/desenvolver o núcleo de RH e Folha no CeleriFlow, com cadastros, cálculos, controles, documentos, integrações e testes reproduzíveis, sem reconstruir os módulos de origem externos a esse domínio.

> **Ordem ao agente:** examinar o código, localizar o que já funciona, implementar as lacunas, executar os testes pela interface e pelos serviços e entregar evidência por ID. Não entregar somente outro Markdown, um conjunto de menus ou uma folha com valores pré-gravados. Cada resultado deve ter origem, regra, versão, persistência e efeito verificáveis.

**Decisões do usuário mantidas:** um módulo integrado **RH e Folha de Pagamento**, com áreas internas bem identificadas; o **Portal do Servidor permanece no seu card individual**, conforme o MD próprio. Preservar identidade e componentes do CeleriFlow. Priorizar listagens de desktop paginadas, sem rolagem global, fonte legível e operações sem redigitação. No celular, usar o mesmo site responsivo no Chrome, sem aplicativo independente. Destacar dados de outros módulos e não implementar silenciosamente outro domínio para fechar uma pendência.

**Fronteira essencial:** no plano do Portal do Servidor, RH/Folha era fonte. **Agora esta fonte é o objeto do desenvolvimento.** Cadastro funcional, períodos e saldos de férias, afastamentos, bases, cálculo de folha, rubricas, provisões, fichas, informes e geração eSocial descritos neste bloco não podem ser deixados pendentes sob o rótulo genérico “depende do RH”. Conectar os serviços produzidos aqui ao Portal, sem duplicar pedidos ou documentos.

**Limites desta análise:** foram analisados os requisitos do TR e o contrato documental com o Portal do Servidor. O repositório, a folha existente, o estatuto municipal, as tabelas legais do órgão, os relógios, os certificados, os bancos, os leiautes do Tribunal e as transmissões não foram inspecionados/executados. A seção 10 distingue lacunas da fonte e incompatibilidades de referências antigas; a seção 11 contém pesquisa externa pontual, separada da redação do edital.

**Como ler:** somente o campo **TR** transcreve a exigência original, inclusive redação imperfeita e referências legadas, normalizando espaçamento de extração/quebras de linha. Títulos resumidos, telas, campos auxiliares, estados, fórmulas e dados de demonstração são propostas técnicas deste plano, não roteiro oficial da comissão. Nenhuma taxa, regra médica, forma de aposentadoria, margem consignável ou direito funcional do exemplo é considerada legislação municipal. Valores de teste não substituem validação normativa.

**Navegação:** [Escopo](#escopo) · [201 itens](#lista) · [Dados e integrações](#dependencias) · [Operações](#operacao) · [Interface ERP](#ux) · [Base fictícia e checklists](#base) · [Item a item](#itens) · [Pacotes](#pacotes) · [Testes e evidências](#testes) · [Definições](#pendencias) · [Fontes e conferência](#fontes)

---
<a id="escopo"></a>
## 1. Escopo, arquitetura e execução

### 1.1 Um núcleo de RH, um Portal pessoal separado

Ler `AGENTS.md`, quando houver, manifests, lockfile, migrations, convenções de domínio, componentes e testes. Confirmar a stack efetiva e o ponto de extensão de módulos; não impor ORM, provedor, banco ou caminhos não verificados. Não atualizar framework ou alterar infraestrutura apenas para esta POC. Preservar trabalho existente e usar migrations incrementais, sem reset da base ou remoção destrutiva de vínculos/históricos.

Manter a entrada/card **“RH e Folha de Pagamento”** já utilizada, criando-a apenas se não existir. Suas áreas internas reúnem as capacidades do bloco. O card **“Portal do Servidor”** continua abrindo o autoatendimento pessoal; uma pessoa não recebe acesso administrativo ao RH só por ter esse card. Contabilidade, Processos, Transparência e os demais módulos mantêm suas responsabilidades.

Não criar “RH antigo”, “RH POC”, folha local e folha do Portal como quatro bases concorrentes. As fichas que aparecem em vários contextos são consultas aos mesmos registros autorizados. A identidade pessoal pode ser comum; os vínculos, competências, finalidades e permissões devem continuar distinguíveis.

### 1.2 Organização original e cobertura

| Bloco preservado da fonte | Itens | Entradas |
|---|---:|---:|
| Cadastro | 1–41 | 41 |
| Férias | 42–48 | 7 |
| Medicina do Trabalho e Licenças e Afastamentos — introduzido pelo item 49 | 49–68 | 20 |
| Atos Administrativos | 69–78 | 10 |
| Vale Transporte | 79–86 | 8 |
| Contagem de Tempo de Serviço | 87–90 | 4 |
| Ponto Eletrônico | 91–97 | 7 |
| Concurso Público | 98–106 | 9 |
| Folha de Pagamento | 107–138 | 32 |
| Geração de Arquivos | 139–153 | 15 |
| Relatórios | 154–180 | 27 |
| E-social | 181–201 | 21 |
| **Total** | **1–201** | **201** |

Os 20 requisitos PSV não são incorporados à contagem. Os testes de integração com o Portal são necessários para verificar a fonte e a continuidade operacional, não 20 novas linhas atribuídas ao RH.

### 1.3 Classificação das instruções

| Classe | Significado | Regra |
|---|---|---|
| **TR-E** | Requisito numerado 1–201. | Implementar todos os objetos, campos e ações expressos. |
| **TEC** | Meio técnico de funcionamento. | Persistência, integridade, rastreabilidade, validação, segurança e teste; não novos ritos administrativos. |
| **UX/CANAL** | Diretriz de apresentação do usuário. | ERP estruturado, paginação, mesma aplicação no celular e Portal em card próprio. |
| **DEP-MOD** | Dado/serviço de outro domínio. | Confirmar fonte, consumir serviço existente e registrar falta. Não reconstruir o módulo de origem. |
| **DEP-EXT** | Serviço, arquivo, dispositivo ou credencial de contraparte. | Identificar contrato/versão e testar a integração no nível correto. |
| **REGRA/LEIAUTE** | Conteúdo legal, funcional ou técnico não fornecido integralmente pelo TR. | Carregar a versão aplicável com fonte, vigência e validação; exemplos não a substituem. |
| **INTERPRETAÇÃO/LEGADO** | Redação ampla ou referência incompatível com a operação atual. | Preservar a exigência e registrar o ajuste a confirmar; não apagá-la ou corrigi-la silenciosamente. |
| **EXTRA** | Funcionalidade sem relação com o bloco ou pedido expresso. | Não desenvolver neste pacote. |

### 1.4 Limites para não aumentar nem reduzir o escopo

**Não acrescentar por suposição:** aplicativo nativo/híbrido, ponto por GPS/facial, fabricação de relógio/REP, compra de hardware, sistema de clínica, diagnóstico ou perícia por IA, concessão/cálculo de aposentadoria, ERP de previdência especializado, folha tributária paralela, plataforma de empréstimos, pagamento bancário iniciado sem autorização, serviço de viagens, provas de concurso online, LMS, editor universal de ERP, WhatsApp/SMS/push ou nova contabilidade.

**Não retirar como extras aqui:** ponto e banco de horas; concurso/processo seletivo; médicos/CID/CAT/PPRA/EPI/CIPA/PPP nos limites escritos; licença-prêmio; vale-transporte; contagem por finalidade; pensão judicial; folha de oito tipos; fórmulas em português; importação de planilhas com mapeamento; geradores de TXT, relatórios e gráficos; eSocial; arquivos oficiais/legados; contribuições RGPS/RPPS e integração contábil. Esses resultados estão expressos neste bloco, mesmo que fossem externos ou excluídos em outros MDs.

Emitir certidão de tempo não equivale a conceder aposentadoria. Cadastrar EPI não comprova entrega ou eficácia. Criar arquivo bancário não confirma pagamento. Gerar XML ou protocolo interno não comprova aceite eSocial. O agente deve usar nomes de estados verdadeiros, sem “pago”, “homologado” ou “enviado ao governo” antes da confirmação pertinente.

<a id="lista"></a>
## 2. Lista dos itens na ordem do TR

Títulos são resumos de navegação; o texto integral permanece em cada entrada da seção 7. Páginas correspondem ao PDF ratificado de 335 páginas, não ao número de uma imagem isolada. O item 49 mantém natureza de título. Repetições compartilham código e testes relacionados, sem perder seu próprio ID.

### Cadastro

| ID / item do TR | Ação resumida | Página do PDF |
|---|---|---:|
| [RHF-001 / 1](#rhf-001) | Cadastro pessoal completo do servidor | 73–74 |
| [RHF-002 / 2](#rhf-002) | Vínculo funcional com todos os dados mínimos | 74 |
| [RHF-003 / 3](#rhf-003) | Qualificação profissional | 74 |
| [RHF-004 / 4](#rhf-004) | Dependentes, elegibilidade e baixa automática por finalidade | 74 |
| [RHF-005 / 5](#rhf-005) | Servidores em diferentes regimes jurídicos | 74 |
| [RHF-006 / 6](#rhf-006) | Pensões judiciais e beneficiários | 74 |
| [RHF-007 / 7](#rhf-007) | Organograma por exercício, lotação e custeio | 74 |
| [RHF-008 / 8](#rhf-008) | Histórico de cargo, salário, vínculo e dados bancários | 74 |
| [RHF-009 / 9](#rhf-009) | Referências salariais com histórico de valores | 74 |
| [RHF-010 / 10](#rhf-010) | Cargos efetivos, comissionados e temporários | 74–75 |
| [RHF-011 / 11](#rhf-011) | Ficha única com atalhos contextuais | 75 |
| [RHF-012 / 12](#rhf-012) | Código único e múltiplos vínculos históricos | 75 |
| [RHF-013 / 13](#rhf-013) | Validação do dígito do CPF | 75 |
| [RHF-014 / 14](#rhf-014) | Validação do dígito do PIS | 75 |
| [RHF-015 / 15](#rhf-015) | Reajuste de referências parcial ou global | 75 |
| [RHF-016 / 16](#rhf-016) | Efetivo nomeado em comissão | 75 |
| [RHF-017 / 17](#rhf-017) | Busca por nome ou parte do nome | 75 |
| [RHF-018 / 18](#rhf-018) | Busca por CPF | 75 |
| [RHF-019 / 19](#rhf-019) | Busca por RG | 75 |
| [RHF-020 / 20](#rhf-020) | Recontratação a partir de contrato existente | 75 |
| [RHF-021 / 21](#rhf-021) | Desligamento individual e coletivo | 75 |
| [RHF-022 / 22](#rhf-022) | Motivos de desligamento por regime | 75 |
| [RHF-023 / 23](#rhf-023) | Combinações válidas de admissão | 75–76 |
| [RHF-024 / 24](#rhf-024) | Lançamentos fixos com validação da verba | 76 |
| [RHF-025 / 25](#rhf-025) | Transferência coletiva de dados funcionais | 76 |
| [RHF-026 / 26](#rhf-026) | Lançamentos coletivos fixos e variáveis | 76 |
| [RHF-027 / 27](#rhf-027) | Dedução de INSS recolhido em outra empresa | 76 |
| [RHF-028 / 28](#rhf-028) | Substituição de cargos em férias ou licenças | 76 |
| [RHF-029 / 29](#rhf-029) | Ocorrências profissionais | 76 |
| [RHF-030 / 30](#rhf-030) | Tempo anterior averbado | 76 |
| [RHF-031 / 31](#rhf-031) | Digitalização e documentos do servidor | 76 |
| [RHF-032 / 32](#rhf-032) | Fotografia na ficha | 76 |
| [RHF-033 / 33](#rhf-033) | Fichas de avaliação de servidores | 76 |
| [RHF-034 / 34](#rhf-034) | Auditoria de inclusão, alteração e exclusão | 76 |
| [RHF-035 / 35](#rhf-035) | Perfis de inclusão, alteração e visualização | 76 |
| [RHF-036 / 36](#rhf-036) | Planejamento e execução de aperfeiçoamento | 76 |
| [RHF-037 / 37](#rhf-037) | Bolsistas e estagiários | 76 |
| [RHF-038 / 38](#rhf-038) | Atividades dos estagiários | 76 |
| [RHF-039 / 39](#rhf-039) | Instituições de ensino conveniadas | 76 |
| [RHF-040 / 40](#rhf-040) | Carreiras | 77 |
| [RHF-041 / 41](#rhf-041) | Autônomos na mesma base, separados dos servidores | 77 |

### Férias

| ID / item do TR | Ação resumida | Página do PDF |
|---|---|---:|
| [RHF-042 / 42](#rhf-042) | Períodos aquisitivos de férias em todo o vínculo | 77 |
| [RHF-043 / 43](#rhf-043) | Férias fracionadas com saldo de dias | 77 |
| [RHF-044 / 44](#rhf-044) | Terço de férias integral ou proporcional | 77 |
| [RHF-045 / 45](#rhf-045) | Gozo de férias coletivo | 77 |
| [RHF-046 / 46](#rhf-046) | Adiantamento de 13º nas férias | 77 |
| [RHF-047 / 47](#rhf-047) | Planilha anual de férias | 77 |
| [RHF-048 / 48](#rhf-048) | Pagamento de férias de 20 dias para cargos específicos | 77 |

### Medicina do Trabalho e Licenças e Afastamentos

| ID / item do TR | Ação resumida | Página do PDF |
|---|---|---:|
| [RHF-049 / 49](#rhf-049) | Medicina do Trabalho, licenças e afastamentos — título numerado | 77 |
| [RHF-050 / 50](#rhf-050) | CID e descrição | 77 |
| [RHF-051 / 51](#rhf-051) | Médicos e CRM | 77 |
| [RHF-052 / 52](#rhf-052) | Licenças médicas com atendimento e perícia distintos | 77 |
| [RHF-053 / 53](#rhf-053) | CAT e formulário padronizado | 77 |
| [RHF-054 / 54](#rhf-054) | Aproveitamento automático da CAT no atestado | 77–78 |
| [RHF-055 / 55](#rhf-055) | Alta médica | 78 |
| [RHF-056 / 56](#rhf-056) | Afastamentos curtos intercalados pela mesma causa | 78 |
| [RHF-057 / 57](#rhf-057) | Prorrogações de licença e limite de dias | 78 |
| [RHF-058 / 58](#rhf-058) | Maternidade de 180 dias com parcelas de 120 e 60 | 78 |
| [RHF-059 / 59](#rhf-059) | Períodos aquisitivos de licença-prêmio | 78 |
| [RHF-060 / 60](#rhf-060) | Gozo fracionado de licença-prêmio | 78 |
| [RHF-061 / 61](#rhf-061) | Licenças gala, nojo e sem vencimento | 78 |
| [RHF-062 / 62](#rhf-062) | Tipos de afastamento e suspensão das contagens | 78 |
| [RHF-063 / 63](#rhf-063) | Cadastro de PPRA | 78 |
| [RHF-064 / 64](#rhf-064) | EPI por cargo | 78 |
| [RHF-065 / 65](#rhf-065) | EPI por funcionário | 78 |
| [RHF-066 / 66](#rhf-066) | Editais e eleições da CIPA | 78 |
| [RHF-067 / 67](#rhf-067) | Membros da CIPA | 78 |
| [RHF-068 / 68](#rhf-068) | Cedidos e recebidos em cedência | 78 |

### Atos Administrativos

| ID / item do TR | Ação resumida | Página do PDF |
|---|---|---:|
| [RHF-069 / 69](#rhf-069) | Modelos de atos administrativos | 78 |
| [RHF-070 / 70](#rhf-070) | Ato automático — Licenças e afastamentos | 79 |
| [RHF-071 / 71](#rhf-071) | Ato automático — Férias em gozo | 79 |
| [RHF-072 / 72](#rhf-072) | Ato automático — Licença-prêmio em gozo | 79 |
| [RHF-073 / 73](#rhf-073) | Ato automático — Licença sem vencimento | 79 |
| [RHF-074 / 74](#rhf-074) | Ato automático — Licença gala | 79 |
| [RHF-075 / 75](#rhf-075) | Ato automático — Licença nojo | 79 |
| [RHF-076 / 76](#rhf-076) | Ato automático — Suspensão ou advertência | 79 |
| [RHF-077 / 77](#rhf-077) | Atos de insalubridade, periculosidade e gratificação | 79 |
| [RHF-078 / 78](#rhf-078) | Atos individuais e coletivos | 79 |

### Vale Transporte

| ID / item do TR | Ação resumida | Página do PDF |
|---|---|---:|
| [RHF-079 / 79](#rhf-079) | Empresas fornecedoras de vale-transporte | 79 |
| [RHF-080 / 80](#rhf-080) | Roteiros de utilização dos passes | 79 |
| [RHF-081 / 81](#rhf-081) | Quantidade diária e percursos adicionais de VT | 79–80 |
| [RHF-082 / 82](#rhf-082) | Mapa de compra de vales-transporte | 80 |
| [RHF-083 / 83](#rhf-083) | Rubricas de desconto e restituição de VT | 80 |
| [RHF-084 / 84](#rhf-084) | Mapa de entrega por servidor | 80 |
| [RHF-085 / 85](#rhf-085) | Redução de VT por faltas, férias e licenças | 80 |
| [RHF-086 / 86](#rhf-086) | Desconto de VT gerado pela entrega | 80 |

### Contagem de Tempo de Serviço

| ID / item do TR | Ação resumida | Página do PDF |
|---|---|---:|
| [RHF-087 / 87](#rhf-087) | Contagem para adicional por tempo de serviço | 80 |
| [RHF-088 / 88](#rhf-088) | Contagem para aquisição de férias | 80 |
| [RHF-089 / 89](#rhf-089) | Contagem para progressão salarial | 80 |
| [RHF-090 / 90](#rhf-090) | Certidão de tempo para aposentadoria | 80–81 |

### Ponto Eletrônico

| ID / item do TR | Ação resumida | Página do PDF |
|---|---|---:|
| [RHF-091 / 91](#rhf-091) | Leitura de registros de relógios de ponto | 81 |
| [RHF-092 / 92](#rhf-092) | Extrato de ponto individual e coletivo | 81 |
| [RHF-093 / 93](#rhf-093) | Montagem de escalas | 81 |
| [RHF-094 / 94](#rhf-094) | Regras de apuração das horas | 81 |
| [RHF-095 / 95](#rhf-095) | Tolerância no ponto | 81 |
| [RHF-096 / 96](#rhf-096) | Apuração para banco de horas ou lançamentos | 81 |
| [RHF-097 / 97](#rhf-097) | Faltas, atrasos, inconsistências e saldos | 81 |

### Concurso Público

| ID / item do TR | Ação resumida | Página do PDF |
|---|---|---:|
| [RHF-098 / 98](#rhf-098) | Acompanhamento de concursos e processos seletivos | 81 |
| [RHF-099 / 99](#rhf-099) | Vagas abertas no concurso | 81 |
| [RHF-100 / 100](#rhf-100) | Concurso para setor específico | 81 |
| [RHF-101 / 101](#rhf-101) | Equipe fiscal ou comissão do concurso | 81 |
| [RHF-102 / 102](#rhf-102) | Candidatos inscritos | 81 |
| [RHF-103 / 103](#rhf-103) | Aprovação automática pela nota | 81 |
| [RHF-104 / 104](#rhf-104) | Identificação de vaga especial | 81 |
| [RHF-105 / 105](#rhf-105) | Assunção ou desistência da vaga | 81 |
| [RHF-106 / 106](#rhf-106) | Títulos dos candidatos | 81 |

### Folha de Pagamento

| ID / item do TR | Ação resumida | Página do PDF |
|---|---|---:|
| [RHF-107 / 107](#rhf-107) | Oito tipos de folha de pagamento | 81 |
| [RHF-108 / 108](#rhf-108) | Várias folhas na mesma referência | 81–82 |
| [RHF-109 / 109](#rhf-109) | Rescisão calculada individual e coletivamente | 82 |
| [RHF-110 / 110](#rhf-110) | Variáveis individuais ou por grupo | 82 |
| [RHF-111 / 111](#rhf-111) | Inclusão rápida da mesma verba para vários funcionários | 82 |
| [RHF-112 / 112](#rhf-112) | Lançamentos descentralizados por secretaria | 82 |
| [RHF-113 / 113](#rhf-113) | Verbas autorizadas por regime | 82 |
| [RHF-114 / 114](#rhf-114) | Férias derivadas de gozo/pecúnia sem dupla variável | 82 |
| [RHF-115 / 115](#rhf-115) | Salário-família automático por dependente | 82 |
| [RHF-116 / 116](#rhf-116) | Fórmulas em português e criação de verbas com regras protegidas | 82 |
| [RHF-117 / 117](#rhf-117) | Cálculo seletivo e contribuições RGPS/RPPS | 82 |
| [RHF-118 / 118](#rhf-118) | Importação de consignações em texto com rejeições | 83 |
| [RHF-119 / 119](#rhf-119) | Parcelamentos de créditos/descontos e saldo no fechamento | 83 |
| [RHF-120 / 120](#rhf-120) | Importação textual de configurações contábeis | 83 |
| [RHF-121 / 121](#rhf-121) | INSS com emprego fora do órgão | 83 |
| [RHF-122 / 122](#rhf-122) | Cálculo e destinação de pensão judicial em conta | 83 |
| [RHF-123 / 123](#rhf-123) | Insuficiência de saldo, prioridade e consignado não descontado | 83 |
| [RHF-124 / 124](#rhf-124) | Fichas financeiras históricas em papel | 83 |
| [RHF-125 / 125](#rhf-125) | Lançamentos pendentes durante afastamento | 83 |
| [RHF-126 / 126](#rhf-126) | Reajuste salarial global ou parcial | 83–84 |
| [RHF-127 / 127](#rhf-127) | Comparativo entre duas competências | 84 |
| [RHF-128 / 128](#rhf-128) | Tolerância e agrupamentos do comparativo | 84 |
| [RHF-129 / 129](#rhf-129) | Provisões, baixas e estornos de férias e 13º com encargos | 84 |
| [RHF-130 / 130](#rhf-130) | Diárias na folha | 84 |
| [RHF-131 / 131](#rhf-131) | Limite remuneratório parametrizado | 84 |
| [RHF-132 / 132](#rhf-132) | Importação de planilhas com mapeamento de colunas | 84 |
| [RHF-133 / 133](#rhf-133) | Lançamento específico para vários servidores | 84 |
| [RHF-134 / 134](#rhf-134) | Licenças encerrando e verificação de retorno | 84 |
| [RHF-135 / 135](#rhf-135) | Publicação integrada da execução orçamentária e financeira | 84 |
| [RHF-136 / 136](#rhf-136) | Transferência de saldo contábil — definição necessária | 84 |
| [RHF-137 / 137](#rhf-137) | Fechamento da folha e imutabilidade | 84 |
| [RHF-138 / 138](#rhf-138) | Bloqueio cadastral durante o fechamento | 84 |

### Geração de Arquivos

| ID / item do TR | Ação resumida | Página do PDF |
|---|---|---:|
| [RHF-139 / 139](#rhf-139) | SEFIP em TXT e validação de inconsistências | 84 |
| [RHF-140 / 140](#rhf-140) | Comparação automática SEFIP/GFIP versus folha | 84 |
| [RHF-141 / 141](#rhf-141) | DIRF em texto com validação e vigência | 85 |
| [RHF-142 / 142](#rhf-142) | RAIS em texto com validação | 85 |
| [RHF-143 / 143](#rhf-143) | Dados de admissão e rescisão para CAGED | 85 |
| [RHF-144 / 144](#rhf-144) | Arquivo bancário de crédito e relação nominal | 85 |
| [RHF-145 / 145](#rhf-145) | Integração das despesas de pessoal com orçamento e financeiro | 85 |
| [RHF-146 / 146](#rhf-146) | MANAD em arquivo texto | 85 |
| [RHF-147 / 147](#rhf-147) | Arquivo para cálculo atuarial | 85 |
| [RHF-148 / 148](#rhf-148) | Gerador de arquivos TXT configurável | 85 |
| [RHF-149 / 149](#rhf-149) | Seleções salvas para arquivos | 85 |
| [RHF-150 / 150](#rhf-150) | Retorno e margem consignável para consignatárias | 85 |
| [RHF-151 / 151](#rhf-151) | Arquivos para crédito de alimentação/refeição | 85 |
| [RHF-152 / 152](#rhf-152) | Arquivos de pessoal para Tribunais de Contas | 85 |
| [RHF-153 / 153](#rhf-153) | Relatórios específicos para SIOPE | 85 |

### Relatórios

| ID / item do TR | Ação resumida | Página do PDF |
|---|---|---:|
| [RHF-154 / 154](#rhf-154) | Avisos de férias | 86 |
| [RHF-155 / 155](#rhf-155) | Requerimento de benefício por incapacidade | 86 |
| [RHF-156 / 156](#rhf-156) | Consulta de afastamentos por tipo, doença e período | 86 |
| [RHF-157 / 157](#rhf-157) | Termo de rescisão | 86 |
| [RHF-158 / 158](#rhf-158) | Textos pré-definidos editáveis em relatórios | 86 |
| [RHF-159 / 159](#rhf-159) | Ficha funcional emitível | 86 |
| [RHF-160 / 160](#rhf-160) | Servidores admitidos no mês | 86 |
| [RHF-161 / 161](#rhf-161) | Servidores demitidos no mês | 86 |
| [RHF-162 / 162](#rhf-162) | Formulários rescisórios padronizados e atualizados | 86 |
| [RHF-163 / 163](#rhf-163) | Relatórios de observações dos servidores | 86 |
| [RHF-164 / 164](#rhf-164) | Certidão de tempo de serviço | 86 |
| [RHF-165 / 165](#rhf-165) | Folha analítica individual por processamento ou consolidada | 86 |
| [RHF-166 / 166](#rhf-166) | Mapa financeiro de vencimentos e descontos | 86 |
| [RHF-167 / 167](#rhf-167) | Resumo líquido por banco | 86 |
| [RHF-168 / 168](#rhf-168) | Informe de rendimentos com e sem IRRF | 86 |
| [RHF-169 / 169](#rhf-169) | Histórico completo de pagamentos e descontos | 86 |
| [RHF-170 / 170](#rhf-170) | Contracheques com mensagens por destinatário | 86 |
| [RHF-171 / 171](#rhf-171) | Guia de INSS por recorte e competência 13 | 86–87 |
| [RHF-172 / 172](#rhf-172) | Recibos de pensão judicial | 87 |
| [RHF-173 / 173](#rhf-173) | Guia da Previdência Municipal | 87 |
| [RHF-174 / 174](#rhf-174) | Relação dos salários de contribuição padrão INSS | 87 |
| [RHF-175 / 175](#rhf-175) | Folha completa com quatro quebras mínimas | 87 |
| [RHF-176 / 176](#rhf-176) | Relatório com bases, demissões e patronal | 87 |
| [RHF-177 / 177](#rhf-177) | Gerador de relatórios pelo usuário | 87 |
| [RHF-178 / 178](#rhf-178) | Gráficos configuráveis para administração | 87 |
| [RHF-179 / 179](#rhf-179) | PPP baseado no histórico | 87 |
| [RHF-180 / 180](#rhf-180) | Seleções salvas para relatórios | 87 |

### E-social

| ID / item do TR | Ação resumida | Página do PDF |
|---|---|---:|
| [RHF-181 / 181](#rhf-181) | Arquivo de qualificação cadastral por recortes | 87 |
| [RHF-182 / 182](#rhf-182) | Retorno da qualificação, divergências e orientação | 87–88 |
| [RHF-183 / 183](#rhf-183) | Empregador e estabelecimentos — S-1000/S-1005 | 88 |
| [RHF-184 / 184](#rhf-184) | Rubricas e incidências — S-1010 | 88 |
| [RHF-185 / 185](#rhf-185) | Cargos e funções — referências S-1030/S-1040 do TR | 88 |
| [RHF-186 / 186](#rhf-186) | Horários — referência S-1050 do TR | 88 |
| [RHF-187 / 187](#rhf-187) | Ambientes e riscos — referência S-1060 do TR | 88 |
| [RHF-188 / 188](#rhf-188) | Processos judiciais — S-1070 | 88 |
| [RHF-189 / 189](#rhf-189) | Validação local de eventos iniciais e tabelas | 88 |
| [RHF-190 / 190](#rhf-190) | Navegação direta do erro à ficha e campo | 88 |
| [RHF-191 / 191](#rhf-191) | Identificação de inclusão ou alteração a enviar | 88 |
| [RHF-192 / 192](#rhf-192) | Validação de eventos não periódicos | 88 |
| [RHF-193 / 193](#rhf-193) | Eventos periódicos, remuneração, reabertura e fechamento | 88 |
| [RHF-194 / 194](#rhf-194) | Transmissão de lote, protocolo e recibos consultáveis | 88–89 |
| [RHF-195 / 195](#rhf-195) | Recibos persistidos dos lotes/eventos | 89 |
| [RHF-196 / 196](#rhf-196) | Atualização de versão do eSocial | 89 |
| [RHF-197 / 197](#rhf-197) | Captação de dados da Folha para eSocial | 89 |
| [RHF-198 / 198](#rhf-198) | Integração constante e informativos de prazos | 89 |
| [RHF-199 / 199](#rhf-199) | Análise de impacto e saneamento cadastral para eSocial | 89 |
| [RHF-200 / 200](#rhf-200) | Busca de inconsistências e novas parametrizações | 89 |
| [RHF-201 / 201](#rhf-201) | Lista acionável de correções pelo usuário | 89 |


<a id="dependencias"></a>
## 3. Dados de outros módulos, serviços e integrações

### 3.1 Responsabilidades e fontes previstas

Os nomes abaixo indicam responsabilidade conceitual, não inventário já confirmado do código. O diagnóstico deverá registrar fonte real, chaves, serviço, contrato e disponibilidade. “Mesmo banco” não autoriza o frontend a consultar livremente todas as tabelas.

| Referência | Origem/destino previsto | Informação ou operação | Limite do desenvolvimento |
|---|---|---|---|
| **DEP-01** | Administração / Identidade / Permissões / Auditoria | Usuário, órgão, escopo por secretaria, poderes de cálculo/fechamento, trilha. | Reutilizar e configurar permissões de RH; não criar outro login ou acesso clínico indiscriminado. |
| **DEP-02** | Cadastro Único de Pessoas | Pessoa, CPF, documentos, contatos, dependentes, beneficiário, médico, fornecedor/instituição quando comuns. | Reutilizar pessoa. O código funcional e os vínculos pertencem ao RH; não duplicar a pessoa por contrato. |
| **DEP-03** | Administração / Organograma / Planejamento / Contabilidade | Órgãos, unidades, setores, custeio, fontes, calendários comuns. | Consumir referências válidas e manter histórico de uso no RH; não reconstruir organograma ou orçamento. |
| **DEP-04** | GED / Documentos / Relatórios / Captura | Arquivos privados, modelos, emissão, digitalização disponível, relatórios. | Desenvolver conteúdo e vínculos de RH; reaproveitar infraestrutura. Não tornar atestados públicos. |
| **DEP-05** | Portal do Servidor | Solicitações/decisões e consumo de fichas, períodos, documentos e dados atualizados. | Portal continua no card próprio. RH fornece a fonte oficial e aplica fatos autorizados, sem novo pedido/folha paralelos. |
| **DEP-06** | Contabilidade / Gestão Orçamentária / Financeiro / Tesouraria | Mapeamentos, reserva, empenho, liquidação, pagamento, consignações, pensão, provisões e retorno. | RH calcula e fornece fatos. O domínio contábil escritura e controla os estágios financeiros; não escrever diretamente nas suas tabelas. |
| **DEP-07** | Compras / Contratos / Convênios / Diárias | Convênio educacional, curso, diária ou fornecedor, apenas quando já forem origem. | Consumir referências existentes. Planejar curso não gera compra; registrar diária na folha não cria viagem. |
| **DEP-08** | Processos Eletrônicos / Tramitação | Atos, andamento, decisão e retorno de documento ao currículo funcional. | Acionar processo existente quando pertinente e manter referência, sem recriar workflow geral. |
| **DEP-09** | Catálogo/Almoxarifado, somente se usado | Identificação de EPI/material ou benefício de origem já existente. | Não impor integração de estoque onde o TR só pede cadastro nem efetuar baixa física sem serviço/escopo. |
| **DEP-10** | Portal da Transparência | Recorte público e atualização da execução de pessoal em conjunto com Contabilidade. | Publicação autorizada, não divulgação de ficha médica, bancária ou de dependentes. |

**Regra de execução:** implementar no RH o produtor/consumidor e a operação que pertencem a este bloco; no outro domínio, consumir a interface existente. Se faltar contrato/capacidade externa ao RH, registrar `DEPENDENCIA_OUTRO_MODULO` com ID, dado, efeito faltante e responsável. Continuar o que independe disso. Não inventar retorno, escrever por fora do serviço ou declarar o requisito dispensado.

### 3.2 Contrato mínimo com o Portal do Servidor já planejado

| Serviço conceitual produzido pelo RH | O Portal utiliza para | Resultado de integração a testar |
|---|---|---|
| Pessoa/vínculos autorizados, dados atuais e versão | PSV-001/009/011/020 | O mesmo CPF encontra apenas seus vínculos; solicitação guarda os valores atuais e propostos. |
| Aplicar alteração autorizada | PSV-005/016 | Validar permissão e versão, alterar a origem uma vez e devolver referência; rejeição não altera a ficha. |
| Períodos aquisitivos, saldo e regras de férias | PSV-014/018 | Pedido/autorização usam saldo real; confirmação cria o mesmo gozo/reserva no RH, sem débito duplo. |
| Registrar licença/atestado/perícia homologados | PSV-012/017 | Documento/decisão já conferidos produzem registro funcional; retorno/alta/prorrogação são tratados pela fonte. |
| Curso solicitado e aprovado → planejamento/execução | PSV-015/019; RHF-036 | Reaproveitar nome, data, carga horária, justificativa, valores e flyer; autorização não é curso concluído. |
| Contracheque, ficha anual, informe e versões | PSV-003/004/010 | Documentos e totais são idênticos à origem liberada; validação referencia a mesma emissão. |
| Fonte funcional/organograma/contatos | PSV-006/008/009 | Listagens e ficha refletem o cadastro oficial e as permissões definidas. |

A configuração do que o servidor pode atualizar continua no Portal/RH competente conforme PSV-020. Ela não dá ao usuário permissão para alterar salário, regime ou conta de acesso por uma requisição arbitrária. Se o dado mudou desde o pedido, exigir nova conferência autorizada; não sobrescrever silenciosamente o valor mais novo.

### 3.3 Integrações externas e formatos a identificar

| Ref. de capacidade | Itens especialmente afetados | O que é necessário | O que a simulação NÃO prova |
|---|---|---|---|
| **EXT-PONTO** | 91–97 | Leiaute/protocolo do relógio, marcas brutas, chaves de pessoa/dispositivo, tratamento de rejeição/repetição. | Parser de arquivo genérico não prova leitura do modelo de relógio usado. |
| **EXT-CONS** | 118/119/123/150 | Contratos de entrada, retorno e margem por consignatária; identificação de parcelas/competências. | Inserção manual de desconto não demonstra importador ou arquivo aceito pela empresa. |
| **EXT-BANCO** | 122/144/167/172 | Banco/convênio, formato de conta corrente/poupança, remessa e mecanismo de confirmação quando aplicável. | Relação de créditos não é depósito; simulador não comprova pagamento real. |
| **EXT-BENEF** | 151 | Leiaute do prestador de alimentação/refeição e dados de beneficiário. | TXT genérico não comprova crédito no cartão/fornecedor. |
| **EXT-INT-TXT** | 120 | Arquivo de configurações contábeis produzido pela origem; versão/campos/vigência. | API interna sem o arquivo descrito não é automaticamente equivalente ao requisito literal. |
| **EXT-LEGADO** | 139–143/146 | SEFIP/GFIP, DIRF, RAIS, CAGED e MANAD por ano/regime/uso; schemas/manuais/validadores existentes. | Extensão TXT não prova leiaute; formato legado não deve ser enviado como obrigação corrente sem aplicabilidade. |
| **EXT-ATUARIA** | 147 | Dicionário/arquivo solicitado pelo atuário ou instituição, com dados autorizados. | Exportar dados não equivale a produzir avaliação atuarial. |
| **EXT-TCE / EXT-SIOPE** | 152/153 | Tribunal/exercício e relatórios específicos, modelos e validação do destinatário. | Modelo local não é remessa oficial universal nem transmissão SIOPE concluída. |
| **EXT-CQC** | 181/182 | Geração/retorno da qualificação no formato identificado e definição de teste diante da situação do serviço. | Uma fixture não é nova consulta oficial respondida. |
| **EXT-ESOC / EXT-ESOC-LEG** | 183–201 | XSD, regras, tabelas, versão, cronograma, WebServices, certificado/procuração e ambientes autorizados. Legado em trilha separada. | XML gerado/validado localmente não é evento aceito; protocolo de lote não é recibo de todos os eventos. |
| **EXT-DOC / EXT-GUIAS / EXT-SST** | 53/63/155/157/162/168/171/173/174/179 | Modelos e conteúdo técnico aplicáveis a CAT, PPRA/compatibilização, rescisão, informe, guias e PPP. | Emitir PDF com título oficial não comprova conformidade do modelo ou veracidade clínica. |
| **EXT-CLASS / EXT-REGRA** | 4/10/50/94/107–117/121/131 e correlatos | Catálogos, tabelas de incidência, bases, limites, calendário e legislação funcional aplicáveis, com vigência. | Fórmula fictícia correta não demonstra cálculo legal correto. |
| **EXT-DIG** | 31 | Meio existente de captura/digitalização, integrável à ficha, quando necessário ao teste. | Enviar arquivo pronto não comprova operação de captura que não foi executada. |

**Não se exige criar simuladores de todos esses serviços como produtos.** Preferir fixtures de arquivos/validadores e o ambiente oficial de homologação quando disponível. Um simulador isolado de eSocial é útil para estados de rede; um cliente de teste e arquivos compatíveis bastam para diversas outras integrações. Nada disso amplia os processos de negócio do RH.

Para cada contrato, registrar: fonte/documento, edição, exercício/competência, ambientes e URLs autorizadas, identificadores, codificação, separador/posições ou XSD, chaves de correlação, assinaturas, validação, exemplos válidos/inválidos, política de repetição, retorno esperado e responsável pela homologação. Segredos ficam na configuração segura do ambiente, nunca no MD, fixture, repositório ou log.

<a id="operacao"></a>
## 4. Contratos operacionais para um RH/ERP real

### 4.1 Pessoa, código único, vínculo, competência e histórico

Uma pessoa pode possuir vários vínculos simultâneos ou sucessivos. O código permanente do servidor não substitui a matrícula/ID de cada vínculo. Regime jurídico, categoria funcional, regime previdenciário, cargo, padrão e lotação são dimensões separadas. Não somar salários ou contribuições de vínculos por simples igualdade de CPF sem aplicar a regra de agregação pertinente.

Guardar vigência do fato e instante da gravação. Usar os dados válidos na competência/finalidade do cálculo. Uma alteração futura de salário, banco ou custeio não reescreve contracheques, remessas ou atos anteriores. Recontratação cria contrato novo com referência à origem; não apaga exoneração, pagamentos ou períodos antigos. Quando uma pessoa deixa o órgão, o histórico continua consultável com autorização.

Datas civis (admissão, início/fim de licença, aquisição) não devem mudar de dia por conversão indevida de fuso. Instantes de auditoria/processamento têm fuso/normalização documentados. Cálculos de dias usam convenção explícita e testes de primeiro/último dia, mês curto, ano bissexto e sobreposições.

### 4.2 Motor de rubricas, incidências e regras legais

Cada rubrica deve ter identificação, natureza (provento, desconto ou informação/encargo quando pertinente), elegibilidade por regime, parâmetros e incidências específicas, fórmula ou regra protegida, dependências e vigência. Não inferir incidência pela palavra no nome. Separar base previdenciária, IR, pensão, margem consignável, férias, 13º e encargos: nem todo provento integra todas as bases.

O editor em português deve trabalhar com uma linguagem controlada, por exemplo conceitos como `SE`, `MINIMO`, `BASE_SALARIAL` e `DIAS`, mapeados à implementação real. Não há obrigação de usar esses nomes literais. Analisar sintaxe, tipos e dependências antes de executar; bloquear ciclos, referências não permitidas, divisão por zero e resultados inválidos. Permitir simular e mostrar memória antes de ativar uma regra autorizada.

**Pacotes legais:** implementar e carregar as regras aplicáveis com fonte, vigência, regime e testes de referência; não entregar um motor vazio alegando que o usuário poderá cadastrar toda legislação sozinho. Regras federais/estaduais protegidas não são editáveis por usuário comum, conforme RHF-116. Mudanças legais devem passar por versionamento e regressão; regras locais autorizadas têm trilha de mudança.

**Conjunto de testes normativos:** para cada regime/tipo de folha aplicável, obter bases e resultados esperados conferidos pelo responsável de folha/contabilidade, incluindo limites, múltiplos vínculos, adiantamentos, incidências e desligamentos. Manter essas expectativas independentes do código do próprio motor. A planilha/fixture normativa precisa indicar fonte, data, versão e responsável; os exemplos DEMO da seção 6 não a substituem.

Dinheiro usa representação decimal e arredondamento explicitamente definido por regra/documento. Horas podem ser mantidas em minutos para evitar converter 7h40 em 7,40 horas decimais. Não arredondar repetidamente resultados intermediários de modo a criar diferenças não explicadas; conservar precisão e memória conforme a regra. O usuário não deve digitar o total final para forçar uma soma.

### 4.3 Folhas, fechamento, adiantamentos e acumuladores

Identificar a instância da folha por órgão, competência, tipo e sequência/grupo necessários à arquitetura. Não impor uma única folha por mês. A mesma pessoa pode estar em seleção parcial, mas o mesmo fato/rubrica derivado de uma mesma origem não pode ser apropriado duas vezes pelo recálculo ou por lote repetido.

Separar **calculada**, **encerrada**, **documento disponibilizado**, **remessa gerada**, **pagamento confirmado** e **evento eSocial aceito**. Os nomes reais podem variar; os significados não podem ser fundidos. Um fechamento interno não gera automaticamente comprovante de quitação bancária nem recibo eSocial.

A folha encerrada preserva snapshot de entradas, regras, rubricas, bases, documentos e totais. Registrar quem fechou e as validações. Bloquear alterações incompatíveis no cadastro durante o fechamento ou usar controle de versão que produza o mesmo efeito. Em falha, não deixar parte dos servidores fechada e parte dos saldos amortizada sem identificação. O processo de lote deve ter política de atomicidade por unidade e estado global verdadeiro.

Simulação/recálculo não amortiza dívida consignada. A apropriação definitiva ocorre no momento previsto em RHF-119, uma vez por fechamento válido. Se o fluxo institucional permitir desfazer uma folha, tratar reversão dos efeitos e documentos/destinos, não simples troca de status. Não criar reabertura irrestrita para contornar RHF-137.

Adiantamento salarial, férias e 13º têm origem e abatimento posterior correspondentes. Consolidado mensal não é soma cega de bruto de adiantamento + bruto integral final. Usar eventos efetivos e compensações, distinguindo visão de movimentos da visão de direitos. Complementar registra a diferença pertinente e sua base, sem reaplicar tudo que já foi calculado/pago.

### 4.4 Contribuições, pensão, margem e insuficiência

Contribuição do servidor é desconto; patronal é encargo da entidade. Relacioná-las às bases e ao regime, sem descontar patronal do líquido. Dados de emprego externo precisam de pessoa/competência, origem e tratamento de múltiplos vínculos válido; não reutilizar o mesmo comprovante como duas deduções independentes.

Pensão judicial possui beneficiário e conta próprios. Dedução de R$ 200 de um servidor deve corresponder à destinação de R$ 200, não a um segundo desconto para gerar o arquivo bancário. A obrigação e o pagamento são rastreáveis e respeitam o documento/configuração que define base, prioridade e incidência.

Aplicar limites de consignação/insuficiência apenas às classes autorizadas pela regra. Não reduzir contribuição obrigatória, retenção ou pensão arbitrariamente para evitar líquido negativo. Se houver conflito não resolvível pela regra, bloquear a conclusão e apresentar a pendência. Valores não descontados permanecem identificados por origem/estabelecimento e alimentam o retorno; não são perdoados ao fechar a folha.

O limite ligado ao Prefeito/Presidente precisa de base e enquadramento definidos. Não usar um teto global retirado de outro município, nem cortar todos os pagamentos ou o valor líquido indiscriminadamente. Manter registro do excedente/ajuste sem alterar o salário contratual como forma de aplicar o limite.

### 4.5 Férias, afastamentos e tempo por finalidade

Período aquisitivo, direito, pedido, reserva autorizada, gozo, pecúnia e pagamento são fatos relacionados, não sinônimos. Contabilizar dias de acordo com a operação configurada; a solicitação ainda não analisada não vira férias gozadas. Prevenir consumo concorrente do mesmo saldo entre Portal e RH. O período de 20 dias e a licença-prêmio precisam de regras próprias, não renomear férias comuns.

Manter acumuladores independentes para ATS, férias, progressão, 13º e aposentadoria. A mesma ausência pode afetar uns e não outros. Para contar tempo, primeiro tratar a união dos intervalos/exclusões pertinentes e depois aplicar a regra, evitando subtrair dois dias quando duas ocorrências cobrem a mesma data. Tempos anteriores só entram nas finalidades autorizadas e não devem duplicar intervalos sobrepostos.

Licença prevista, homologada, prorrogada, alta e retorno confirmado têm registros próprios. Uma data prevista de retorno vencida pode produzir uma pendência de conferência; não autoriza automaticamente pagar quem teve prorrogação. Lançamentos pendentes de RHF-125 entram na primeira folha elegível após retorno conforme o fluxo definido.

Para episódios curtos da mesma causa, a associação precisa de informação/avaliação autorizada, não de inferência clínica por IA ou coincidência livre de um código. Testar a janela e os dias conforme regime. Maternidade de 180 dias mantém 120 + 60 em rubricas/segmentos diferentes, com abatimento somente na extensão legalmente definida.

### 4.6 Ponto e vale-transporte

Marcações originais são imutáveis como evidência; tratamento de tolerância/escala é derivado e versionado. Preservar arquivo/dispositivo e chave de registro. Pareamento incompleto é inconsistência, não autorização para inventar saída. Considerar turnos cruzando dias e calendário da escala, sem fixar expediente único para toda a Prefeitura.

Horas apuradas vão ao banco **ou** aos lançamentos conforme a regra. Se houver desdobramento autorizado, registrar cada parcela e impedir duplicação do mesmo minuto/valor. O saldo deve indicar unidade e período; exibir tanto saldo positivo quanto negativo sem ocultar falta.

VT usa requisições de passes e dias elegíveis, distinguindo tarifa/tipo/percurso. Rota de VT não é trajeto de veículo de Frotas. Mapa de compra, mapa de entrega, entrega efetiva e desconto são estados/fatos diferentes. Entrega confirmada alimenta desconto uma vez; ajuste posterior conserva origem e eventual restituição, sem apagar a primeira entrega.

### 4.7 Atos, cursos, avaliações, concurso e saúde ocupacional

Modelos de atos são editáveis pelo usuário autorizado e os dados são mesclados da origem. Nos itens 70–76, o currículo recebe o registro na condição **após a tramitação**, não antes de qualquer análise. Se Processos estiver indisponível, conservar estado de pendência e não mostrar portaria concluída. Emissão coletiva vincula o mesmo documento aos envolvidos corretos.

Curso autorizado no Portal entra como origem do planejamento. Planejar não é executar; executar permite registrar treinamento realizado. Data de emissão do certificado é campo expresso, mas não autoriza por si um LMS ou contratação/pagamento automático do curso. Avaliação funcional também é registro, não concessão automática de progressão sem regra.

Em concursos, separar nota, aprovação, classificação quando houver, vaga especial e assumir/desistir. A fonte permite acompanhamento do certame; não exige criar serviço de banca, prova online ou inscrição paga. Gerar automaticamente aprovado pela nota não cria matrícula de servidor nem ocupa uma vaga antes do ato correspondente.

Registros SST são administrativos/técnicos: CID, médico, CAT, PPRA, EPI, CIPA e PPP precisam das informações legítimas da origem. Não fabricar laudos, CRM, assinatura médica, diagnóstico ou eficácia de EPI. Arquivos médicos permanecem privados, fora de logs gerais, relatórios públicos e repositórios do Portal Institucional. Restringir também exportações e geradores configuráveis.

### 4.8 Integração contábil, relatórios e arquivos

RHF-120 importa **configurações contábeis em texto**; RHF-145 disponibiliza **fatos de pessoal para os estágios da despesa**. São direções e provas diferentes. Usar chaves de origem compostas por fato e versão/linha quando pertinente; uma folha ou remessa pode representar diversos fatos, e um número de documento igual não justifica suprimir todos como duplicados.

Não confundir orçamento/reserva, empenho, liquidação, pagamento e provisão. RH deve entregar a composição dos fatos necessária ao destino, incluindo segregação de proventos, descontos a repassar, líquido e patronal. Contabilidade faz a escrituração com seus roteiros reais e devolve referência/erro. Transferência de saldo contábil de RHF-136 depende da definição registrada em Q-R05.

Relatórios compartilham a fonte do cálculo/ficha. A seleção é aplicada no servidor, com versão, órgão, competência, tipo de folha e datas explícitos. **Paginação limita a visualização, não a exportação.** Folha analítica, mapa, bancos, informe e ficha anual são produtos diferentes; não substituir todos por um único PDF genérico.

Importação de planilhas deve permitir mapear colunas na interface, pré-visualizar e apontar erros por linha; fixos e mensais têm destinos distintos. Arquivos oficiais usam validadores específicos. TXT, CSV, planilha ou XML genérico não comprovam um leiaute só por extensão/nome. O gerador livre de TXT do item 148 também não substitui os exportadores oficiais.

### 4.9 eSocial: versão, dependências, envio e diagnóstico

Manter versão de pacote, schemas, tabelas e regras vinculada a cada lote/evento. Determinar ambiente e aplicabilidade pela competência/data de implantação, não pelo maior número de arquivo no site. Não enviar dados fictícios à produção, misturar recibos de homologação com produção ou ativar um schema anunciado para data futura antes de sua vigência.

Fluxo técnico proposto: **dados da origem → geração → validação local → assinatura/preparação conforme contrato → transmissão → protocolo de lote → consulta de processamento → aceites/rejeições/recibos por evento → persistência**. Permitir recuperação de respostas ambíguas antes de reenviar. Um timeout pode ocorrer após recepção; reiniciar tudo sem correlação pode duplicar submissões.

Diagnóstico deve apontar cadastro/regra, campo, causa e correção. O clique abre a tela e o campo correto respeitando permissões. Corrigir de fato e revalidar; ocultar mensagem não resolve a causa. Os itens 199–201 podem compartilhar esse núcleo, mas cada um precisa de evidência: análise do impacto, detecção de parâmetros ausentes e lista acionável de saneamento.

O TR mistura última versão (196), eventos antigos (185–187) e qualificação em lote (181/182). A seção 11 documenta o que a pesquisa oficial encontrou. Preservar **trilha atual** e **trilha histórica/contratual**, sem marcar uma como equivalente automaticamente à outra. Um simulador pode exercitar parsing e estados, mas não resolver formalmente uma incompatibilidade do edital.

<a id="ux"></a>
## 5. Interface profissional e eficiência operacional

### 5.1 Mapa das áreas internas

| Área | Conteúdo principal | IDs de referência |
|---|---|---|
| **Servidores e vínculos** | Lista paginada; ficha com dados, vínculos, histórico, dependentes, pensões e documentos. | 1–41 |
| **Férias e licenças** | Períodos, gozos/saldos, homologações, prorrogações e retornos. | 42–62/68/125/134 |
| **Saúde ocupacional** | CID, médicos, CAT, PPRA/documentos, EPIs, CIPA e dados para PPP. | 49–67/179 |
| **Atos e desenvolvimento** | Modelos/atos, currículo, avaliações e planejamento/execução de cursos. | 3/29/33/36/69–78 |
| **Benefícios e consignações** | VT, pensões, parcelados, importações e retornos. | 6/79–86/118/119/122/123/150/151 |
| **Tempo de serviço** | Averbações, acumuladores por finalidade e certidões. | 30/87–90/164 |
| **Ponto** | Leituras, escalas, regras, apuração, banco e relatórios. | 91–97 |
| **Concursos e seletivos** | Vagas, equipe, candidatos, notas, títulos e situação da vaga. | 98–106 |
| **Folha de pagamento** | Competência/tipo/grupo, lançamentos, cálculo, comparação, provisões e fechamento. | 107–138 |
| **Arquivos e integrações** | Leiautes/versionamentos, importação/exportação, validação e origem/destino. | 120/132/139–153 |
| **Relatórios** | Prévia paginada, emissão, seleção salva e geradores autorizados. | 154–180 |
| **eSocial** | Configurações, diagnóstico, eventos, lotes, protocolo e recibos. | 181–201 |

Nomes são organização conceitual a adequar ao menu existente, não rotas confirmadas. Um mesmo serviço pode aparecer na ficha do servidor e na área geral, sem duplicação de lógica. O usuário deve saber em qual órgão, competência, vínculo e tipo de folha está operando.

### 5.2 Uma área de trabalho, sem fonte diminuta

Listagens de desktop: **título/contexto + ações + busca/filtros + tabela + paginação** na área útil, sem empilhar banners, gráficos e formulários. Começar com até dez linhas no menor viewport de referência e reduzir se não couberem. Novos registros criam páginas; não aumentam indefinidamente a altura.

| Elemento | Tamanho / entrelinha de referência | Peso |
|---|---|---|
| Título da página | 20 / 26 px | 600 |
| Seção/agrupamento | 16 / 22 px | 600 |
| Tabela, campos, botões, filtros e erros | 14 / 20 px | 400; cabeçalhos 600 |
| Metadados secundários | 12 / 16 px | 400 |

Preservar a fonte do CeleriFlow se consistente; na ausência de padrão, usar a família de sistema com preferência por Segoe UI/sans-serif. Os números são decisões de projeto herdadas, não medidas exigidas no TR nem afirmação de que todos os ERPs usam a mesma fonte. Aplicar tokens em `rem`, sem diminuir a raiz global. Linhas/controles com altura mínima de referência 36 px no desktop e 44 px no toque; campos no celular com referência de 16 px. Margens próximas a 16 px e espaçamentos coerentes de 4/8/12/16/24 px.

Valores à direita, moeda/unidade identificadas e algarismos tabulares quando disponíveis. CPF/PIS/matrícula são identificadores textuais e preservam zeros. Status não depende apenas de cor; dar rótulo e ação pertinente. Contraste/foco/teclado devem ser testados sem declarar certificação por copiar tokens.

### 5.3 Tabelas, formulários e ações em lote

Filtros e totais são do conjunto autorizado no servidor; busca encontra um registro que estava na terceira página. Ordenação tem desempate estável. Abrir ficha e voltar preserva filtros/página; trocar competência não deixa totais da anterior na tela. Estado vazio, falha de integração e valor zero são diferentes.

Na ficha, usar grupos/abas de dados, vínculo, histórico, documentos, financeiro e permissões pertinentes. Não criar 30 campos espremidos numa linha. Erro em outra aba deve indicar a aba/campo e permitir acesso direto. Salvar/cancelar ficam acessíveis; mudar aba não perde valores.

Seleção coletiva precisa indicar alcance: selecionados da página ou conjunto selecionado explicitamente. Nunca lançar em todos silenciosamente. Antes de cálculo/fechamento/transferência coletiva, apresentar quantidade e consequência. Todos os registros da seleção são validados, não apenas os visíveis. Falhas devem ser identificadas por linha/vínculo e não cobertas por uma mensagem global de sucesso.

### 5.4 Exceções de rolagem e eficiência

**Não usar `overflow: hidden` para esconder informação.** Memória de cálculo, formulas extensas, documento, prontuário administrativo autorizado, árvore organizacional, relatório analítico largo, zoom e celular precisam continuar legíveis. Permitir leitura vertical no contexto próprio, evitando múltiplas barras aninhadas. Não esconder campos expressos no TR para manter “uma tela”.

Testar viewport CSS **1366 × 650, 1440 × 800 e 1920 × 900**, além do equipamento de POC; testar zoom/texto a 200%, teclado e Chrome de celular real. Ausência de rolagem é prioridade das listagens normais de desktop, não proibição absoluta de leitura longa.

Eficiência deve vir de herança de dados e continuidade: pessoa existente → novo vínculo; período de férias → rubricas automáticas; entrega VT → desconto; folha fechada → remessa/relatórios/Portal; erro eSocial → campo certo. Não pedir digitação repetida ou gerar “autorizado” sem persistência para reduzir cliques.

Como metas de ensaio, medir feedback de processamento em até 200 ms e consulta paginada em até 1,5 s no percentil 95, registrando ambiente, volume, rede e amostra. **São objetivos de projeto, não garantia medida ou requisito do TR.** Cálculos/lotes demorados mostram progresso/resultado real; não usar timeout de tela para anunciar conclusão. Usar tarefas duráveis compatíveis com a infraestrutura existente, sem introduzir uma nova plataforma apenas por conveniência do agente.

<a id="base"></a>
## 6. Checklists e base fictícia para demonstrar as operações

### 6.1 Regras dos dados de ensaio

Todos os nomes, documentos, salários, percentuais, datas, margens, calendários e classificações deste capítulo são **fictícios**. Usar ambiente separado com identificação **“POC — RH/Folha — dados fictícios”**. O usuário poderá popular pelas telas; o agente pode criar fixtures/seed idempotentes apenas para teste isolado, sem transformar isso em importador extra.

As funções de importação dos itens 118/132 continuam obrigatórias e são testadas pelos próprios arquivos. CPF/PIS sintéticos devem atender aos validadores ou às massas autorizadas do ambiente oficial; não desativar validação de produção nem inventar identidade de pessoa real. Documentos médicos têm aviso de demonstração, sem CRM/assinatura apresentados como autênticos. Para eSocial, usar somente dados e credenciais permitidos na homologação.

**Separar dois níveis:** (a) testes aritméticos e operacionais DEMO; (b) casos normativos conferidos com tabelas/legislação da entidade. Uma folha sintética correta não valida alíquota legal. Os registros dos cenários isolados não devem entrar no total do cenário-base por acidente.

### 6.2 Checklists dos itens compostos

**C-01 — RHF-001, ficha pessoal:** matrícula; nome; filiação; nascimento; sexo; grau de instrução; estado civil; fotografia; endereço; CPF; PIS; RG **número, órgão expedidor, data**; CTPS **número e série**; CNH; naturalidade; nacionalidade; tipo sanguíneo; indicação de deficiência física conforme a redação da fonte. Não transformar RG/CTPS em um único campo observação.

**C-02 — RHF-002, vínculo:** regime jurídico; vínculo; cargo; salário; carga horária semanal; data de nomeação; data de posse; data de admissão; término do temporário; lotação; unidade orçamentária; horário de trabalho; local de trabalho. Guardar os 13 grupos, com vigência e identificação do vínculo.

**C-03 — RHF-008, histórico:** cargo; salário; unidade gestora; lotação; custeio; vínculo; regime jurídico; local de trabalho; banco/agência/conta. Para cada mudança, conservar antes/depois, data/hora e usuário, além da vigência técnica necessária.

**C-04 — RHF-010, cargos:** natureza efetivo/comissionado/temporário; nomenclatura; instrução; CBO; referência salarial inicial; quantidade criada; atribuições. **C-05 — RHF-025:** transferências coletivas de local de trabalho, lotação, custeio, cargo e padrão salarial.

**C-06 — RHF-052, saúde/afastamento:** servidor; tipo; documento; médico do atendimento; CID do atendimento; médico da perícia; CID da perícia; período homologado. Testar maternidade, acidente de trabalho, acompanhamento familiar, prorrogação de doença e prorrogação de acidente conforme os tipos configurados a partir da fonte. Campos pertinentes não se fundem em texto livre.

**C-07 — RHF-107, oito folhas:** mensal; rescisão; adiantamento de férias; licença-prêmio; adiantamento salarial; adiantamento de 13º; 13º; complementar. RHF-117 acrescenta três formas de seleção e contribuição individual/patronal em RGPS/RPPS; RHF-175 acrescenta quatro quebras de relatório (banco/cargo/regime/lotações).

**C-08 — RHF-006/122, pensão judicial:** nome da pessoa beneficiária; CPF; data de inclusão; banco e conta de pagamento; modalidade de cálculo percentual, valor fixo ou salário mínimo. Na operação, testar desconto, destinação e depósito/retorno cabível; não criar três beneficiários somente para testar as três modalidades.

**C-09 — RHF-036, curso:** cronograma; ministrante; carga horária; data de emissão de certificado; iniciativa do órgão ou solicitação do servidor; execução e relatório do planejamento. A ficha solicitada pelo Portal pode conter valores/flyer próprios, mas esses dados não substituem os campos de planejamento do RH.

**C-10 — RHF-175/176, relatório de folha:** testar as quatro quebras **banco, cargo, regime e lotações**. Conferir também as três informações **base de valores, datas de demissão e valores patronais de previdência**. Uma quebra apenas por setor não substitui as outras; um total de descontos do servidor não substitui encargo patronal.

### 6.3 F-CAD / F-REF / F-PAG — pessoas, vínculos e seleções

| Código de ensaio | Registro | Uso |
|---|---|---|
| P-A / V-A1 | Ana — DEMO; vínculo efetivo, matrícula 1001, configuração RPPS de teste | Folha-base, férias, dependentes, Portal e histórico. |
| P-A / V-A2 | Mesma pessoa; vínculo comissionado, matrícula 1101 | Múltiplos vínculos; **fora do total da folha-base**. |
| P-B / V-B | Bruno — DEMO; vínculo celetista, matrícula 1002, configuração RGPS de teste | Ponto, horas extras, contribuições, folha. |
| P-C / V-C | Clara — DEMO; vínculo temporário, matrícula 1003 | Recontratação/rescisão e folha-base em cenários isolados. |
| V-RJU | Outro vínculo DEMO sob nomenclatura RJU | Provar cadastro do quarto regime, sem alterar total-base. |
| EST-DEMO / BOL-DEMO | Estagiário e bolsista | Categorias e atividades, fora do cenário de servidores efetivos. |
| AUT-DEMO | Prestador autônomo com código próprio | Contexto distinto na mesma base, sem cargo funcional inventado. |
| RH-A / OP-A / CONSULTA / FECHADOR | Perfis de teste | Inclusão/alteração/consulta, escopo setorial e fechamento. |
| PENS-01 | Beneficiário de pensão DEMO | Desconto/destinação de R$ 200 no cenário-base. |

Pessoas adicionais de teste serão criadas para operações coletivas sem reutilizar um mesmo CPF como pessoas diferentes. Os nomes de regimes indicam cenários de configuração, não atestam que a Prefeitura possua esses regimes ou esses servidores.

**F-REF:** R1 = R$ 3.000 vigente em setembro de 2026, nova versão de outubro a R$ 3.300; R2 = R$ 4.000. Reajuste DEMO de 10% parcial atinge só R1; global em cenário separado resulta também R2 = R$ 4.400. Alteração futura não muda a folha de setembro.

**F-PAG:** criar 27 vínculos de teste isolados; páginas de capacidade dez ficam 10/10/7. Busca pelo registro da terceira página deve encontrá-lo diretamente. Gerar relatório dos 27 e ação coletiva explicitamente selecionada sobre 12. Não misturar esses vínculos no total financeiro de F-FOL.

### 6.4 F-FOL — folha-base e complementar com totais conferíveis

**Pacote de regras `DEMO_ARITMETICO`, proibido em produção.** Usar rubricas identificadas como demonstração. Contribuição do servidor DEMO = 10% da base definida; encargo patronal DEMO = 20%. Retenção DEMO é valor fixo de teste, **não tabela real de IRRF**. As incidências abaixo existem apenas para conferir cálculo, integração e relatórios.

| Vínculo | Proventos do cenário | Base previdenciária DEMO | Proventos | Descontos DEMO | Total descontos | Líquido | Patronal DEMO |
|---|---|---:|---:|---|---:|---:|---:|
| V-A1 | Base 3.000 + adicional 300 | 3.300,00 | 3.300,00 | Previdência 330 + pensão 200 + consignado 150 + VT 80 | 760,00 | 2.540,00 | 660,00 |
| V-B | Base 4.000 + extra 150 + diária 100 | 4.150,00 | 4.250,00 | Previdência 415 + retenção DEMO 100 + consignado 200 + VT 120 | 835,00 | 3.415,00 | 830,00 |
| V-C | Base 2.000 + benefício DEMO 100 | 2.000,00 | 2.100,00 | Previdência 200 + retenção DEMO 50 + VT 60 | 310,00 | 1.790,00 | 400,00 |
| **Total** | | **9.450,00** | **9.650,00** | | **1.905,00** | **7.745,00** | **1.890,00** |

Na fixture, diária de V-B e benefício de V-C não entram na base previdenciária. Essa configuração é deliberadamente demonstrativa, não conclusão sobre incidências legais desses pagamentos. O correto para produção deverá ser verificado pela rubrica e pelo regime.

**Complementar isolada na mesma competência:** V-B recebe diferença de R$ 50; contribuição DEMO R$ 5; líquido R$ 45; patronal R$ 10. Consolidado mensal + complementar: **bruto R$ 9.700; descontos R$ 1.910; líquido R$ 7.790; patronal R$ 1.900**. Cálculo repetido não transforma a diferença em R$ 100.

**F-BANCO:** banco A recebe V-A1 + V-C = **R$ 4.330**; banco B recebe V-B = **R$ 3.415**; total de servidores **R$ 7.745**. Se o lote autorizado também incluir PENS-01 no banco A, identificar mais **R$ 200 ao beneficiário**, total ampliado **R$ 7.945**, dos quais **R$ 4.530** no banco A. Não somar R$ 200 à remuneração bruta: já integra os descontos destinados a terceiros.

### 6.5 F-PREV / F-DEP / F-PARC / F-INSUF / F-TETO

**F-PREV, apenas teste do motor progressivo:** tabela DEMO com 5% até R$ 1.000, 10% sobre a parcela de R$ 1.000 a R$ 3.000 e 15% sobre a parcela de R$ 3.000 a R$ 4.000, teto de base DEMO R$ 4.000. Para base R$ 4.000: 50 + 200 + 150 = **R$ 400**. Para base R$ 2.000: 50 + 100 = **R$ 150**. Na política sintética de complemento pela diferença, base externa de 2.000 já recolheu 150 e base municipal de 4.000 leva a base combinada limitada a 4.000: parcela municipal DEMO = 400 − 150 = **250**. Essa fórmula não é prescrição de rateio INSS; validar a regra legal independente para produção e a configuração de múltiplos vínculos.

**F-DEP:** dois dependentes elegíveis de salário-família DEMO, quota R$ 50, geram **R$ 100**; um perde elegibilidade dessa finalidade em 01/10 por condição fictícia configurada, restando **R$ 50**. Outro cenário tem exceção e finalidade de IR distinta, para provar que uma baixa não elimina o dependente ou todas as elegibilidades.

**F-PARC:** dívida R$ 1.200; parcela prevista R$ 300; base DEMO R$ 2.000 e limite 10% = R$ 200. Calcular/recalcular mantém saldo 1.200; fechar apropria 200 e deixa **1.000**. Próxima folha, base 1.000/limite 100, deixa **900**. Crédito em cenário separado: saldo 600 e pagamento 150 deixam **450**. Abrir/fechar a mesma instância novamente sem ato de reversão não amortiza duas vezes.

**F-INSUF:** bruto 1.000; descontos prioritários já definidos 300; teto total DEMO 800; consignado A = 500, B = 400. Prioridade A: descontar A = 500 / B = 0, total 800, líquido **200**, pendência B **400**. Prioridade invertida em cópia: B = 400 / A = 100, pendência A 400; mesmo líquido 200. Se uma dedução protegida não puder ser ajustada, exigir tratamento e não usar essa fixture para reduzir qualquer obrigação legal.

**F-TETO:** base elegível 6.300, teto DEMO 6.000 → excedente/ajuste **300**. Parcela excluída entra em cenário separado e deve preservar o critério; o limite não é aplicado ao líquido de forma arbitrária.

### 6.6 F-FER / F-13 / F-RES / F-TIPOS / F-PREMIO

**F-FER:** direito DEMO de 30 dias, base 3.000. Gozo 15 e 10 deixa **5**; mais 6 é inválido pelo saldo; completar 5 deixa 0. Terço total **1.000**: no modo integral pagar uma vez; proporcional 15/10/5: **500/333,33/166,67**, fechando 1.000. Não antecipar o terço integral de novo no segundo gozo.

**F-FER-MISTO:** cenário separado, direito 30 com gozo 20 e pecúnia 10. Base diária DEMO 100: base de gozo **2.000**, base de pecúnia **1.000**. Terço/incidências seguem configuração do cenário e, em produção, regra legal. RHF-114 deve impedir a variável duplicada desses valores. **F-FER-20:** cargo específico habilitado, vinte dias e base diária 100 → parcela-base **2.000**; não equivale a direito geral de trinta dias reduzido por conveniência.

**F-13:** direito DEMO 3.600 com doze avos; adiantamento 1.800 deixa **1.800** antes das incidências finais. Segundo ensaio: base 3.000, oito avos → **2.000**; antecipado 600 → diferença **1.400**. Não misturar os dois exemplos.

**F-PREMIO:** direito DEMO 90 dias; gozos 30 + 20 → saldo **40**. Para testar folha de licença-prêmio de RHF-107, configurar no ensaio uma parcela paga de dez dias com base diária 100 → **1.000** antes de incidências. A natureza/modalidade de pagamento real deve ser validada por regime; o exemplo não cria pecúnia universal.

**F-RES**, independente da folha-base e sem outras incidências na fixture:

| Componente | Cálculo DEMO | Valor |
|---|---|---:|
| Saldo remuneratório | 10 dias × 100 | 1.000,00 |
| Férias indenizadas integrais | 30 × 100 | 3.000,00 |
| Terço desse período | 3.000/3 | 1.000,00 |
| Férias proporcionais | 3.000 × 6/12 | 1.500,00 |
| Terço proporcional | 1.500/3 | 500,00 |
| 13º proporcional | 3.000 × 8/12 | 2.000,00 |
| **Total de componentes brutos** | | **9.000,00** |
| Antecipação de 13º já paga | Compensar uma vez | **−600,00** |
| **Resultado antes de outros descontos aplicáveis** | | **8.400,00** |

Os períodos devem ser materializados na fixture de modo coerente com o direito e o regime demonstrativo, sem sobrepor aquisições. Dois vínculos idênticos nesse cenário isolado: bruto 18.000, antecipações 1.200, resultado **16.800**. Não incluir aviso, multa, FGTS ou outras parcelas sem a regra de teste/produção pertinente.

**F-TIPOS, matriz mínima de execução:** mensal = F-FOL; rescisão = F-RES; adiantamento de férias = F-FER; licença-prêmio = F-PREMIO; adiantamento salarial = R$ 600 que deverá ser compensado uma vez na folha final do cenário; adiantamento de 13º = F-13; 13º = apuração final F-13; complementar = F-FOL-COMP (a complementar descrita em F-FOL). Cada tipo terá cálculo, memória, documento e testes de incidência/compensação próprios. Não usar o mesmo resultado mensal para todos.

### 6.7 F-AFAST / F-RET / F-MAT / F-TEMPO / F-ATOS / F-SST

**F-AFAST:** criar licença com documento de atendimento e perícia separados; casos de maternidade, acidente, acompanhamento familiar, prorrogação de doença, prorrogação de acidente, gala, nojo e sem vencimento em registros independentes. Criar CAT-DEMO e atestado vinculado para recuperar médico/doença automaticamente. Definir prorrogação de 20 + 10 dias com limite DEMO 30, criticando o 31º.

**F-AFAST-CURTO:** episódios de 7 e 8 dias da mesma causa, intercalados, com janela de agrupamento DEMO identificada → **15**; mais 2 → **17**. Outro episódio de causa distinta fica fora. Dias coincidentes não são contados duas vezes. Encaminhamento ao INSS depende do tratamento real aplicável, não é concessão automática de benefício.

**F-RET:** afastamento até 14/09/2026; alta e retorno confirmado em 15/09; verba pendente 75 não entra antes do retorno e entra uma vez na primeira folha elegível. Outro caso é prorrogado e continua pendente. A lista mensal de retornos distingue os dois.

**F-MAT:** intervalo de 01/01/2026 a 29/06/2026, inclusive = **180 dias**. Segmento 01/01–30/04 = **120**; 01/05–29/06 = **60**. Verbas e possibilidade de abatimento ficam separadas; o sistema não deve deduzir os 180 indiscriminadamente na guia.

**F-TEMPO:** 01/01 a 30/09/2026, inclusive = **273 dias**; dez dias não contáveis, sem sobreposição, deixam **263**. Tempo anterior autorizado, não coincidente, 365 dias → **628** para a finalidade que o admitir. Para ATS, usar requisito DEMO 260 e percentual DEMO explicitamente configurado; testar em cópias prorrogação e cancelamento por excesso de ausências. Para férias/progressão, usar regras próprias F-TEMPO-FER e F-TEMPO-PROG e comparar com o mesmo histórico. Não reutilizar automaticamente o acumulador de aposentadoria para outros direitos.

**F-ATOS:** modelos de portaria, decreto, contrato e termo de posse. Gatilhos AFAST-01, FER-01, LPR-01, LSV-01, GAL-01, NOJ-01, DISC-01 suspensão e DISC-02 advertência; além de insalubridade, periculosidade e gratificação em ensaios separados. Para 70–76, depois do trâmite existe um documento referenciado no currículo; repetir o evento não duplica. Emitir ato coletivo para três pessoas.

**F-SST:** PPRA-DEMO rotulado como cadastro da exigência do TR; documento técnico e vigência; dois ambientes/períodos, EPI por cargo e por pessoa, edital/eleição e três membros CIPA. Gerar PPP somente com fatos técnicos de teste explicitamente documentados, sem completar eficácia/risco por inferência. Manter a compatibilização normativa registrada em Q-R08.

### 6.8 F-PONTO / F-VT / F-CONC / F-CURSO

**F-PONTO:** escala de 08h–12h e 13h–17h, 480 minutos previstos. Tolerância DEMO 5 minutos na entrada, sem reescrever o original. Dia com entrada 08:03 e demais marcas normais tem 477 minutos brutos e 480 tratados na fixture. Outro dia com saída 17:30 gera **+30**; entrada 08:10 gera **−10** pela política DEMO integral quando excede tolerância. Um dia de falta gera **−480**. Saldo desses três efeitos = **−460 minutos = −7 h 40 min**. Marcação incompleta é ensaio separado e permanece inconsistente, não entra no saldo como hora inventada. Reimportação do arquivo mantém a quantidade de marcas.

**F-VT:**22 dias úteis configurados,2 passes principais por dia aR$5. Desconsiderar 2 faltas + 3 férias + 2 licença em dias distintos:15 dias → 30 passes/R$150. Percurso adicional em 5 dias,2 passes aR$4 → 10passes/R$40. Total **40 passes/R$190**. Na regra de desconto DEMO de 5% da base 3.000 limitado ao custo, entrega confirmada gera**R$150** de desconto. Dois passes principais devolvidos em cenário isolado podem originar restituição autorizada de**R$10**, pela regra configurada; não descontar/comprar novamente ao emitir o mapa.

**F-CONC:** procedimento para setorA, duas vagas ofertadas; equipe fiscal/comissão; notas 82,69,70 e mínimo DEMO 70 → aprovado/não aprovado/aprovado. Indicar vaga especial configurada numa inscrição; candidatoA assume e candidatoC desiste. Cadastrar títulos sem lhes atribuir pontuação automática por suposição. Criar também um processo seletivo para provar o segundo tipo de procedimento.

**F-CURSO:** iniciativa interna e pedido vindo do Portal. Pedido DEMO: inscrição 1.200 + hospedagem 300 + diárias 180 + outras 90 = **1.770**, conforme o plano do Portal. Planejamento contém cronograma, ministrante, carga horária e data de emissão de certificado; execução concluída alimenta a qualificação. Somar custos para autorizar não cria compra ou pagamento.

### 6.9 F-IMP / F-CONT / F-PROV / F-HIST / F-REL

**F-IMP:** planilha com cinco linhas: V-A1 variável 50 válido; V-B fixo 30 válido; matrícula 9999 inexistente; verba incompatível com o regime; valor inválido. Esperado: **2 válidos/3 rejeitados**, com razões distintas. Trocar a ordem das colunas e remapear deve gerar o mesmo resultado. Reenvio da mesma operação gera **zero lançamentos novos**. F-IMP-TXT usa contrato de consignações identificado, com a mesma separação de aceites/rejeições, não um formato inventado.

**F-CONT:** arquivo de configurações com três verbas válidas e uma conta inválida. Depois da correção autorizada, enviar fatos de folha com bruto 9.650, descontos 1.905, líquido 7.745 e patronal 1.890, segregados segundo roteiro real; não somar as quatro medidas como uma despesa total. Gerar as referências de reserva/empenho/liquidação/pagamento no destino competente. Repetir o evento não duplica. Datas distintas de dois convênios são ensaios de agendamento do fluxo definido, não dois pagamentos do mesmo crédito.

**F-PROV, regra aritmética demonstrativa:** base 3.600; provisão mensal de férias 300 + terço 100 = 400, patronal DEMO20% = 80; 13º mensal 300 e patronal 60; total **840**. Seis competências → **5.040**; baixa 2.000 → **3.040**; estorno da baixa → **5.040**; estorno separado de uma provisão 840 → **4.200**. Registros/eventos identificam competência, natureza e encargo. Não instalar essa fórmula como regra NBCASP sem validação.

**F-HIST:** duas competências de P-A iguais ao cenário-base dão bruto **6.600**, descontos **1.520** e líquido **5.080**. A ficha anual precisa mostrar ambos os meses. **F-INFORME** usa classificação fiscal fornecida e modelo RFB apropriado; não reproduz simplesmente esses totais em todos os campos do informe. Preparar um caso com IRRF e outro sem, com expectativas conferidas separadamente.

**F-COMP:** três diferenças absolutas 9,10,11 e tolerância DEMO inclusiva até 10; somente 11 é sinalizada. Rodar por verba/bruto/líquido e por cargo, secretaria, regime e banco. **F-MOV:** datas de admissão/desligamento em 31/08,01/09,30/09,01/10; setembro contém apenas as duas internas. **F-REL:** gerador com campos matrícula,nome,cargo,bruto, ordem alterada, filtro e seleção salva; gráficos refletem o mesmo recorte. **F-BEN:** créditos de 300 e 250 totalizam **550**, sem entrar no lote salarial por engano.

### 6.10 F-ARQ / F-GUIAS / F-ESOC — documentos e integrações

Preparar fixtures **válidas e inválidas** para cada contrato de arquivo efetivamente escolhido, com manifesto de origem, versão, competência, quantidade, totais e hashes. Extensões/schemas só serão atribuídos após validação. Este MD não acompanha arquivos fiscais prontos nem contém layouts oficiais reproduzidos integralmente.

| Cenário | Teste |
|---|---|
| **F-ARQ-LEG** | Gerar/validar SEFIP, DIRF, RAIS, CAGED e MANAD em exercícios/usos identificados; isolar legado do fluxo corrente. |
| **F-ARQ-COMP** | Comparar folha e SEFIP/GFIP com dois coincidentes, diferença 20 e um ausente; apontar a causa por pessoa/campo. |
| **F-ARQ-CONFIG** | Usuário monta dois layouts TXT e salva seleção; valida autorização e ordenação. |
| **F-ARQ-ATU / F-TCE / F-SIOPE** | Obter leiaute/modelo da contraparte, gerar saída e conferir validação/totais. Nenhum arquivo genérico é marcado como homologado. |
| **F-GUIAS** | Separar mensal/competência 13, RGPS/RPPS, centro de custo/secretaria e modelo aplicável; distinguir demonstração de guia pagável. |
| **F-CQC** | Gerar amostra e importar retorno no formato identificado; registrar que retorno histórico/fixture não comprova serviço oficial ativo. |
| **F-ESOC** | Configurações S-1000/S-1005, S-1010 e S-1070, mais eventos aplicáveis de operação. Validação local antes de qualquer transmissão. |
| **F-ESOC-LEG** | Preservar as referências antigas 185–187; testar apenas no contrato histórico definido, registrando decisão de compatibilização. |
| **F-ESOC-VER** | Exibir versão/fonte/hash/vigência, aplicar atualização em teste e revalidar sem alterar XML/recibos antigos. |
| **F-ESOC-NET** | Simulador isolado para sucesso/rejeição/lentidão/duplicação e ambiente oficial autorizado para protocolo/recibo real. |
| **F-ESOC-DIAG** | Cinco problemas introduzidos; corrigir dois → três pendentes. Cada erro leva à ficha/campo e a revalidação confirma a correção. |
| **F-ESOC-PRAZO** | Uma obrigação próxima, uma vencida, uma cumprida com prazos DEMO configurados; a lista muda com a origem, não por alteração de contador manual. |
| **F-FECH / F-PUB** | Concorrência de fechamento e mudança cadastral; publicação real no Portal/Transparência após fato autorizado e sem vazamento. |

O simulador eSocial deve receber as requisições pela fronteira real do adaptador, validar o contrato de teste e produzir estados correlacionados. Não acessar diretamente tabelas do CeleriFlow para inserir “recibo oficial”. Manter o nome **SIMULADOR / SEM VALIDADE OFICIAL** em interface, logs e evidências; IDs fictícios não se misturam aos de produção. Não é necessário criar uma interface que imite visualmente o governo.

Para documento de arrecadação/guia de teste, não publicar chave bancária real pagável sem autorização. Para XML assinado, distinguir certificado de teste de cadeia/credencial efetivamente aceita. Dados de identidade e comprovantes médicos sintéticos nunca são enviados ao ambiente produtivo da Prefeitura ou de órgão externo.

---
<a id="itens"></a>
## 7. Desenvolvimento item a item

Cada entrada conserva a citação da fonte. Implementação/demonstração/aceite não são roteiro oficial. Os campos “Dados de outro módulo” identificam responsabilidade e dependência, não dispensam o resultado. Quando houver definição pendente, informar o que está implementável e o que ainda não pode receber aceite definitivo.

### Cadastro


<a id="rhf-001"></a>
#### RHF-001 — Cadastro pessoal completo do servidor

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 1, pp. 73–74:**

> Permitir a captação e manutenção de informações pessoais de todos os servidores com no mínimo os seguintes dados: Matrícula, Nome, Filiação, Data de Nascimento, Sexo, Grau de Instrução, Estado Civil, Fotografia, Endereço, CPF, PIS, RG (Número, Órgão Expedidor e Data Expedição), Carteira de Trabalho (Número e Série), Carteira de Habilitação, Naturalidade, Nacionalidade, Tipo de Sangue, identificar se é Deficiente Físico;

**Implementação:** Criar/manter a ficha pessoal com todos os campos da lista C-01, preservando os subcampos de RG e CTPS. Separar pessoa, código único do servidor e matrícula do vínculo. Foto é arquivo privado. Dados pessoais reaproveitados do cadastro único não serão redigitados ou duplicados em outro domínio; informações funcionais próprias ficam no RH.

**Dados de outro módulo / integração:** DEP-02: pessoa/CPF/endereço comuns; DEP-04: arquivo da fotografia. Identidade funcional e vínculos são desenvolvidos aqui.

**Demonstração:** Em F-CAD, incluir e reabrir P-A com todos os grupos C-01; editar endereço e anexar a foto. Acessar pelo vínculo efetivo e pelo comissionado: ambos apontam à mesma pessoa. Verificar acesso indevido com usuário de outro escopo.

**Aceite técnico:** Cada campo expresso é persistível e recuperável; RG contém número, expedidor e data, CTPS número e série. Ter somente nome, CPF e cargo não encerra o item.

**Atenção / limite:** Campos previstos não são automaticamente todos obrigatórios para qualquer pessoa/regime. Definir obrigatoriedade e dados inexistentes sem inventar documento; não aplicar a preferência cadastral por CPF para suprimir o RG explicitamente pedido.


<a id="rhf-002"></a>
#### RHF-002 — Vínculo funcional com todos os dados mínimos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 2, p. 74:**

> Permitir a captação e manutenção de informações do vínculo que o servidor teve e/ou tem com o Órgão, com no mínimo os seguintes dados: Regime Jurídico, Vínculo, Cargo, Salário, Carga Horária Semanal, Data de Nomeação, Data de Posse, Data de Admissão, Data de Término de Contrato Temporário, Lotação, Unidade Orçamentária, Horário de Trabalho, Local de Trabalho;

**Implementação:** Manter um registro por vínculo e vigência, com os 13 grupos de campos de C-02. Distinguir regime jurídico de regime previdenciário, nomeação de posse/admissão e lotação de local de trabalho. A remuneração referencia salário/padrão válido na data, não um valor único que sobrescreva o passado.

**Dados de outro módulo / integração:** DEP-02: pessoa; DEP-03: estrutura/unidade orçamentária; dados do vínculo são nativos de RH.

**Demonstração:** Criar V-A1 efetivo e V-A2 comissionado de P-A, além de V-C temporário com término. Reabrir datas, carga horária semanal, unidade orçamentária e horário. Consultar uma data anterior à alteração de lotação.

**Aceite técnico:** Os vínculos coexistem, conservam seus períodos e recuperam o conjunto completo de dados na competência correta.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-003"></a>
#### RHF-003 — Qualificação profissional

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 3, p. 74:**

> Permitir captação e manutenção de informações da Qualificação profissional incluindo a escolaridade, formação, treinamentos realizados e experiências anterior;

**Implementação:** Adicionar à ficha conjuntos de escolaridade, formação, treinamentos realizados e experiências anteriores, com registros distintos e datas quando pertinentes. Reaproveitar curso efetivamente concluído no item 36 sem confundir solicitação com treinamento realizado.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Cadastrar duas formações, um treinamento concluído e duas experiências em P-A; reabrir e consultar a ficha. Pedido de curso ainda não executado não aparece como qualificação concluída.

**Aceite técnico:** Os quatro grupos podem ser mantidos, com múltiplos registros e vínculo ao servidor correto.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-004"></a>
#### RHF-004 — Dependentes, elegibilidade e baixa automática por finalidade

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 4, p. 74:**

> Controlar os dependentes de servidores para fins de salário família e imposto de renda realizando a sua baixa automática na época devida conforme limite e condições previstas para cada dependente;

**Implementação:** Manter dependentes com regras de elegibilidade e vigência separadas para salário-família e IR. Executar avaliação automática por data/condição configurada, conservando histórico da baixa em cada finalidade; não apagar a pessoa dependente. Exceções previstas na configuração precisam ser consideradas antes da baixa.

**Dados de outro módulo / integração:** DEP-02: pessoas/dependentes comuns, se existentes; o motor de elegibilidade é deste RH.

**Demonstração:** Em F-DEP, um dependente atinge o limite demonstrativo em 01/10; outro tem exceção documentada e um terceiro só atende a uma finalidade. Calcular setembro/outubro e conferir mudanças de elegibilidade e de salário-família.

**Aceite técnico:** A baixa é automática na finalidade e data corretas; não elimina a elegibilidade ainda válida para o outro tributo/benefício. Histórico e cálculo concordam.

**Atenção / limite:** Q-R01: limites e condições legais dependem de regime/competência. Não codificar uma idade universal nem inferir dependência tributária apenas pelo parentesco.


<a id="rhf-005"></a>
#### RHF-005 — Servidores em diferentes regimes jurídicos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 5, p. 74:**

> Permitir o cadastramento de servidores em diversos regimes jurídicos como: Celetistas, Estatutários, RJU e Contratos Temporários;

**Implementação:** Configurar e utilizar os regimes citados: Celetista, Estatutário, RJU e Contrato Temporário. Cada vínculo seleciona sua categoria, admissões, desligamentos e verbas permitidas. Não usar uma etiqueta decorativa enquanto todos os cálculos seguem a mesma regra.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Cadastrar um vínculo de cada regime de F-CAD e testar uma verba exclusiva de um deles em outro. Mostrar o regime e suas configurações na ficha.

**Aceite técnico:** Os quatro regimes são representáveis e produzem validações coerentes; não são convertidos automaticamente em CLT.

**Atenção / limite:** Q-R01: a nomenclatura Estatutário/RJU pode ter sobreposição administrativa. Preservar a possibilidade de cadastro e documentar o mapeamento sem deduplicar silenciosamente o requisito.


<a id="rhf-006"></a>
#### RHF-006 — Pensões judiciais e beneficiários

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 6, p. 74:**

> Permitir o cadastramento de Pensões Judiciais com o Nome da Pensionista, CPF, Data de Inclusão, Banco e Conta para Pagamento, Dados para Cálculo (Percentual, Valor Fixo, Salário Mínimo);

**Implementação:** Manter pensão vinculada ao servidor/vínculo e beneficiária(o), com nome, CPF, inclusão, banco/conta e modalidade de cálculo percentual, fixa ou referenciada ao salário mínimo. Guardar base/condições e referência da decisão quando disponível; compartilhar dados com cálculo e pagamento do item 122.

**Dados de outro módulo / integração:** DEP-02: beneficiário e cadastro bancário existente; DEP-06: financeiro para destinação do pagamento.

**Demonstração:** Criar três pensões em cenários isolados, uma por modalidade. No cenário principal usar PENS-01 fixa de R$ 200,00; conferir beneficiário e conta na saída de pagamento.

**Aceite técnico:** Os três modos são configuráveis, com dados bancários e pessoa corretos. O desconto e o crédito ao beneficiário remetem ao mesmo registro.

**Atenção / limite:** Q-R01/R04: base, prioridade, incidências e salário mínimo vêm da determinação/configuração aplicável. Não inventar percentual judicial nem tratar a pensão como empréstimo.


<a id="rhf-007"></a>
#### RHF-007 — Organograma por exercício, lotação e custeio

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 7, p. 74:**

> Permitir o cadastramento do organograma da estrutura administrativa, por exercício, para manter o histórico da lotação e custeio, com informação da fonte de recurso que será utilizada para captação do recurso a ser utilizado para pagamento dos servidores informados no custeio;

**Implementação:** Manter versões anuais da estrutura usada pelo RH, relacionando lotação, custeio e fonte de recurso para pagamento. Consumir a estrutura administrativa comum e guardar as referências históricas, sem construir outro organograma independente. Validar existência e vigência da unidade/fonte.

**Dados de outro módulo / integração:** DEP-03: organograma, unidades e fontes da Administração/Contabilidade. O histórico funcional de uso e vínculos pertence ao RH.

**Demonstração:** Em F-CAD, manter setor em 2025 e nova estrutura em 2026; vincular V-A1 ao custeio/fonte de 2026 e consultar a lotação de 2025.

**Aceite técnico:** A consulta por exercício recupera a estrutura correta e a informação de fonte acompanha o custeio exportado.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-008"></a>
#### RHF-008 — Histórico de cargo, salário, vínculo e dados bancários

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 8, p. 74:**

> Registrar e manter o histórico das alterações de cargo, salário, Unidade Gestora, lotação, custeio, vínculo, regime jurídico, local de trabalho e Banco/Agência/Conta Bancária dos servidores, , data e hora da operação e usuário que efetuou a alteração;

**Implementação:** Registrar histórico com antes/depois, vigência e usuário/data/hora para todos os nove grupos C-03. Versionar alterações, preservando vínculos e documentos já fechados. Dados bancários antigos permanecem na evidência da remessa emitida, sem alterar arquivo anterior.

**Dados de outro módulo / integração:** DEP-02/03 para identificadores compartilhados; DEP-01 para auditoria. Proteger dados bancários no log operacional.

**Demonstração:** Em F-CAD, alterar cargo, salário, UG, lotação, custeio, vínculo, regime, local e banco/agência/conta em operações controladas; consultar antes/depois e reabrir a competência anterior.

**Aceite técnico:** Todos os grupos da fonte têm trilha identificável; alterações atuais não reescrevem pagamentos ou folhas fechadas.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-009"></a>
#### RHF-009 — Referências salariais com histórico de valores

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 9, p. 74:**

> Permitir o cadastramento de todas as referências salariais contendo no mínimo o símbolo da referência e o histórico dos valores salariais para cada referência;

**Implementação:** Manter símbolo da referência, valores e vigências. Vínculo/cargo aponta à referência pertinente; não substituir todas as competências por seu último valor. Controlar intervalos sobrepostos e guardar a versão utilizada pelo cálculo.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Criar R1=R$ 3.000,00 até setembro e R$ 3.300,00 a partir de outubro, mantendo R2=R$ 4.000,00. Consultar ambos os períodos e o histórico.

**Aceite técnico:** O símbolo identifica a referência, e cada competência recupera o valor vigente sem perda do anterior.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-010"></a>
#### RHF-010 — Cargos efetivos, comissionados e temporários

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 10, pp. 74–75:**

> Permitir o cadastramento de todos os cargos do quadro de pessoal de natureza efetivo, comissionado e temporário com no mínimo a Nomenclatura, Natureza, Grau de Instrução, CBO, Referência Salarial Inicial, Quantidade Criada, registrar as atribuições necessárias em cada cargo;

**Implementação:** Manter cargos das três naturezas e os campos C-04: nomenclatura, natureza, instrução, CBO, referência inicial, quantidade criada e atribuições. Referenciar tabelas oficiais fornecidas para códigos, sem inventar enquadramento pelo nome.

**Dados de outro módulo / integração:** DEP-03 para estrutura, se usada; EXT-CLASS para catálogo CBO aplicável. Cadastro de cargos pertence ao RH.

**Demonstração:** Cadastrar um cargo por natureza, definir quantidade criada e atribuições; vincular a servidores/uma vaga de concurso e conferir a descrição recuperada.

**Aceite técnico:** Todos os campos estão separados e utilizáveis. O número de vagas criadas não é confundido com número de servidores cadastrados.

**Atenção / limite:** Não criar autorização legislativa ou controle de concurso novo por este item; regras de provimento seguem a configuração da entidade.


<a id="rhf-011"></a>
#### RHF-011 — Ficha única com atalhos contextuais

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 11, p. 75:**

> Possuir “atalhos” para consulta de dados dos servidores permitindo, que de um mesmo local possa ser consultado diversas informações, como: dados financeiros, dependentes, licenças e afastamentos, férias e licença prêmio;

**Implementação:** Na ficha do servidor, oferecer acesso aos dados financeiros, dependentes, licenças/afastamentos, férias e licença-prêmio do vínculo selecionado. Usar consultas dos próprios domínios, preservando contexto e permissões; não duplicar o cadastro de cada aba.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Abrir P-A, alternar os cinco grupos e voltar ao resultado de busca com a mesma página. Trocar V-A1 por V-A2 e conferir que o contexto acompanha o vínculo.

**Aceite técnico:** Os cinco acessos partem do mesmo local e exibem dados reais da pessoa/vínculo correto; informação médica não vaza a quem só consulta finanças.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-012"></a>
#### RHF-012 — Código único e múltiplos vínculos históricos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 12, p. 75:**

> Estabelecer um único código de registro para o servidor, para que através deste possam ser aproveitados os dados cadastrais de servidor que já trabalhou no Órgão Público e permitir controlar todos os vínculos empregatícios que o servidor tenha ou venha a ter com este, possibilitando a consulta de dados históricos, independente do período trabalhado;

**Implementação:** Separar código permanente do servidor de IDs dos contratos/matrículas. Nova admissão reutiliza dados pessoais e cria vínculo novo, sem reativar ou sobrescrever contrato encerrado. Consultas históricas devem atravessar períodos sem mesclar remunerações.

**Dados de outro módulo / integração:** DEP-02: identidade da pessoa. O agregador e os vínculos são nativos de RH; Portal do Servidor consome esses IDs (DEP-05).

**Demonstração:** Recontratar P-C com contrato antigo encerrado e criar V-A2 para P-A. Conferir um cadastro pessoal, dois vínculos e acesso às fichas de cada período.

**Aceite técnico:** O servidor mantém o código único e todos os vínculos; histórico anterior continua acessível independentemente do último contrato.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-013"></a>
#### RHF-013 — Validação do dígito do CPF

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 13, p. 75:**

> Validar dígito verificador do número do CPF;

**Implementação:** Normalizar apresentação, preservar zeros à esquerda e validar tamanho e dígitos verificadores no servidor e na interface. Rejeitar entradas obviamente inválidas conforme validador adotado; armazenar como identificador, não número aritmético.

**Dados de outro módulo / integração:** DEP-02: validador/cadastro único existente.

**Demonstração:** Usar CPF sintético permitido na homologação com DV correto, depois alterar um dígito. Testar envio direto ao serviço e valor com zeros iniciais.

**Aceite técnico:** O válido é aceito e o DV incorreto é rejeitado sem gravação; formatar pontos/traço não muda a identidade.

**Atenção / limite:** Validação matemática não consulta Receita nem comprova identidade ou situação cadastral. Não acrescentar API SERPRO ao escopo deste item.


<a id="rhf-014"></a>
#### RHF-014 — Validação do dígito do PIS

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 14, p. 75:**

> Validar dígito verificador do número do PIS;

**Implementação:** Aplicar validação matemática do PIS/NIS no servidor, mantendo o identificador como texto. Distinguir valor ausente de número com dígito inválido e não inventar PIS para completar uma ficha.

**Dados de outro módulo / integração:** DEP-02/validador comum, quando existente.

**Demonstração:** Usar fixture de PIS conferida e uma cópia com DV alterado; testar formulário e requisição direta.

**Aceite técnico:** O DV inválido é recusado; a mesma verificação protege importações que alterem o campo.

**Atenção / limite:** A obrigação de validar o PIS no cadastro do TR não significa que o eSocial atual exija esse identificador em todos os eventos. Ver EXT-CQC e Q-R07.


<a id="rhf-015"></a>
#### RHF-015 — Reajuste de referências parcial ou global

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 15, p. 75:**

> Permitir o reajuste parcial ou global das referências salariais;

**Implementação:** Disponibilizar reajuste sobre todas ou apenas referências selecionadas, com data de vigência e prévia dos valores. Gerar novas versões; não alterar folhas fechadas. Compartilhar o mecanismo de reajuste com RHF-126, distinguindo referência de salário individual.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Reajustar R1 em 10% na data de outubro: R$ 3.000→3.300; R2 fica R$ 4.000 no ensaio parcial. Em cópia isolada, aplicar a seleção global e conferir R2=R$ 4.400.

**Aceite técnico:** A seleção e vigência são respeitadas; reexecutar a mesma confirmação não aplica 10% novamente.

**Atenção / limite:** Percentual de ensaio não é reajuste autorizado para a Prefeitura. A mudança deve registrar o parâmetro/ato pertinente na implantação.


<a id="rhf-016"></a>
#### RHF-016 — Efetivo nomeado em comissão

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 16, p. 75:**

> Permitir o cadastramento e controle dos vínculos dos servidores efetivos, que estão nomeados em cargo de comissão possibilitando a consulta das informações cadastrais de ambos os vínculos;

**Implementação:** Relacionar o vínculo efetivo e o vínculo de comissão ao mesmo servidor, com datas e consulta de ambos. Guardar a forma remuneratória definida, sem presumir pagamento cumulativo ou migração previdenciária.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Em P-A, abrir V-A1 e V-A2; consultar cargo, regime, início e histórico de cada um. Alterar um registro descritivo do vínculo comissionado e conferir o efetivo intacto.

**Aceite técnico:** Os dois vínculos e suas relações ficam acessíveis; a nomeação não elimina o vínculo de origem.

**Atenção / limite:** Q-R01: acumulação, opção remuneratória e previdência devem ser parametrizadas/validadas, não inferidas da coexistência cadastral.


<a id="rhf-017"></a>
#### RHF-017 — Busca por nome ou parte do nome

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 17, p. 75:**

> Localizar servidores por Nome ou parte dele;

**Implementação:** Consultar servidores pelo nome inteiro ou trecho, aplicando escopo e paginação no servidor. Usar identificação de vínculo para distinguir homônimos, sem exigir conhecer a matrícula.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Em F-PAG, buscar um trecho do nome de servidor que estaria na terceira página; abrir sua ficha e voltar.

**Aceite técnico:** A busca alcança o conjunto autorizado completo e conserva contexto, sem filtragem só das linhas carregadas.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-018"></a>
#### RHF-018 — Busca por CPF

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 18, p. 75:**

> Localizar servidores pelo CPF;

**Implementação:** Oferecer filtro por CPF normalizado, resolvendo pessoa e vínculos autorizados, sem remover zeros iniciais ou pesquisar por valores financeiros.

**Dados de outro módulo / integração:** DEP-02: CPF no cadastro único; índices e consulta do RH.

**Demonstração:** Pesquisar CPF de P-A com e sem máscara; conferir a mesma pessoa e seus dois vínculos. Usar CPF de outro escopo com conta restrita.

**Aceite técnico:** A identificação não depende da máscara e não expõe registro fora da autorização.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-019"></a>
#### RHF-019 — Busca por RG

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 19, p. 75:**

> Localizar servidores pelo RG;

**Implementação:** Permitir localizar o servidor pelo número de RG; mostrar expedidor e pessoa para desambiguar resultados. Não supor unicidade nacional do número isolado, nem tratar RG como substituto do código interno.

**Dados de outro módulo / integração:** DEP-02: documentos pessoais.

**Demonstração:** Pesquisar o RG cadastrado de P-A e dois registros de teste com número igual e expedidores distintos. Abrir a ficha certa.

**Aceite técnico:** A busca encontra os registros correspondentes e a identificação complementar evita fundi-los.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-020"></a>
#### RHF-020 — Recontratação a partir de contrato existente

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 20, p. 75:**

> Permitir a inclusão de um novo contrato a partir de informações de um contrato já existente, selecionando um ou vários servidores. Isto é muito utilizado na recontratação de servidores temporários;

**Implementação:** Permitir selecionar um ou vários servidores e criar novos contratos a partir de campos reaproveitáveis do anterior. Mostrar dados herdados e novas datas antes de confirmar. Não copiar automaticamente desligamento, recibos, competências pagas ou saldo de férias anterior como saldo novo.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Recontratar P-C individualmente e um grupo de dois temporários em cenário separado. Conferir novos IDs/datas, origem e contratos antigos intactos.

**Aceite técnico:** Novos vínculos são criados sem redigitação pessoal, sem duplicação por retentativa e com validação individual de regime/admissão.

**Atenção / limite:** Quais direitos/acumuladores migram depende da regra funcional; não transportar saldos financeiros por simples cópia de contrato.


<a id="rhf-021"></a>
#### RHF-021 — Desligamento individual e coletivo

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 21, p. 75:**

> Permitir a informação do desligamento a um servidor para pagamento individual da rescisão, bem como a informação de um único desligamento a um grupo de servidores para pagamento coletivo. Isto é muito utilizado na rescisão de servidores temporários cujos contratos vencem no mesmo dia;

**Implementação:** Informar desligamento de um vínculo ou de grupo com data/motivo comuns e revisão das exceções. Criar eventos individuais rastreáveis que alimentam a folha de rescisão, sem afetar outro vínculo ativo da mesma pessoa.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Em F-RES, desligar um temporário e depois um grupo que termina na mesma data. Processar as rescisões e comparar os resultados individuais.

**Aceite técnico:** O grupo gera um desligamento por vínculo selecionado; repetição não duplica rescisão e a pessoa com outro vínculo permanece vinculada a ele.

**Atenção / limite:** Registrar desligamento não confirma pagamento bancário. Validar motivo por regime antes de registrar.


<a id="rhf-022"></a>
#### RHF-022 — Motivos de desligamento por regime

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 22, p. 75:**

> Possibilitar a configuração das formas de desligamento por regime de trabalho e motivo de rescisão, para garantir que não seja informado um desligamento inadequado para o servidor, por exemplo: término de contrato para um servidor efetivo;

**Implementação:** Configurar as combinações válidas de regime, forma de desligamento e motivo de rescisão. Aplicar a mesma matriz na operação individual, coletiva e importada; indicar o motivo da incompatibilidade.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Tentar término de contrato em efetivo e em temporário na matriz F-CAD. A primeira combinação é recusada na fixture; a segunda permite prosseguir.

**Aceite técnico:** O sistema impede a combinação proibida sem alterar o vínculo e aceita a configurada, inclusive por chamada direta.

**Atenção / limite:** Usar catálogo de motivos autorizado para produção; o exemplo de bloqueio é o próprio caso ilustrado no TR.


<a id="rhf-023"></a>
#### RHF-023 — Combinações válidas de admissão

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 23, pp. 75–76:**

> Possibilitar a configuração das formas de admissão por regime de trabalho, categoria funcional, regime previdenciário e tipo de admissão, para garantir que não seja admitido um servidor com informações fora dos padrões permitidos;

**Implementação:** Manter matriz de admissão por regime de trabalho, categoria funcional, regime previdenciário e tipo de admissão. Usá-la na ficha e na recontratação; validar conjunto, não apenas cada campo isolado.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Configurar duas combinações válidas e uma inválida em F-CAD; tentar salvar a inválida e depois corrigir somente o campo incompatível.

**Aceite técnico:** A gravação só ocorre com combinação permitida, com indicação objetiva dos campos conflitantes.

**Atenção / limite:** Não definir automaticamente RGPS/RPPS por cargo ou nome da pessoa; o enquadramento depende da informação institucional.


<a id="rhf-024"></a>
#### RHF-024 — Lançamentos fixos com validação da verba

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 24, p. 76:**

> Permitir o cadastramento de todos os lançamentos fixos dos servidores (adicionais, gratificações, consignações, etc...), para efeito de pagamento ou desconto em folha, com no mínimo, o código da verba (verificando se a verba está prevista para o regime de trabalho do servidor);

**Implementação:** Manter adicionais, gratificações e consignações recorrentes por vínculo, verba, referência/valor, vigência e parâmetros pertinentes. Validar se a verba pertence ao regime antes de salvar e antes de calcular; impedir lançamento concorrente duplicado da mesma origem.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Criar adicional fixo de R$ 300 para V-A1 e consignação no cenário F-FOL; tentar uma verba proibida para o regime e consultar o histórico.

**Aceite técnico:** Os fixos alimentam as folhas corretas durante a vigência, e a verba incompatível não chega ao cálculo.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-025"></a>
#### RHF-025 — Transferência coletiva de dados funcionais

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 25, p. 76:**

> Permitir transferência coletiva nos itens: Local de Trabalho, Lotação, Custeio, Cargo, Padrão de Salário;

**Implementação:** Permitir selecionar vínculos e transferir local de trabalho, lotação, custeio, cargo e padrão de salário, com vigência, prévia e resultado por vínculo. Não mover pessoas de outro escopo ou alterar versões usadas por folhas fechadas.

**Dados de outro módulo / integração:** DEP-03: destinos existentes de estrutura/custeio; os registros de transferência pertencem ao RH.

**Demonstração:** Em cenário isolado, transferir três servidores nos cinco grupos C-05; manter um quarto fora da seleção e conferir antes/depois por usuário/data.

**Aceite técnico:** A alteração coletiva respeita seleção, data e regras de compatibilidade; o excluído não muda e cada vínculo mantém histórico.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-026"></a>
#### RHF-026 — Lançamentos coletivos fixos e variáveis

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 26, p. 76:**

> Permitir lançamentos coletivos nos itens (Lançamentos Fixos, Lançamentos Variáveis)

**Implementação:** Aplicar verba/parametrização a uma seleção de vínculos, distinguindo fixo com vigência de variável da competência. Validar regime, período, folha aberta e duplicidade de origem para cada linha, com prévia do conjunto.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Lançar gratificação fixa em dois vínculos e um variável de R$ 50 em outros três, isoladamente. Conferir competência, vigência e retentativa do lote.

**Aceite técnico:** As duas modalidades funcionam e o lote gera resultados rastreáveis sem afetar a seleção externa nem repetir verbas.

**Atenção / limite:** Uma falha por servidor deve ter tratamento explícito; não mostrar sucesso integral se houver itens recusados.


<a id="rhf-027"></a>
#### RHF-027 — Dedução de INSS recolhido em outra empresa

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 27, p. 76:**

> Permitir o registro de Dedução de INSS em outra empresa para realizar o abatimento correto.

**Implementação:** Registrar por pessoa/competência o vínculo externo, remuneração/contribuição informada e documento de referência quando fornecido. Disponibilizar esses dados ao cálculo de múltiplos vínculos da regra vigente, preservando origem e evitando abatimento duplo.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Executar F-PREV com contribuição externa demonstrativa, calcular o vínculo municipal e conferir a memória antes/depois. Recalcular com o mesmo comprovante não deduz de novo.

**Aceite técnico:** O cálculo usa a informação externa na competência correta e apresenta o abatimento aplicado, distinguindo informação declarada de consulta oficial.

**Atenção / limite:** RHF-121 compartilha a implementação. Critério de proporcionalização, limites e rateio precisam da regra oficial; F-PREV não valida o INSS de produção.


<a id="rhf-028"></a>
#### RHF-028 — Substituição de cargos em férias ou licenças

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 28, p. 76:**

> Permitir realizar o cadastro de substituição de cargos, em ocasião de férias ou licenças;

**Implementação:** Registrar substituído, substituto, cargo, motivo e período, vinculando férias/licença que originou a substituição quando disponível. Mostrar os registros na ficha; eventual efeito remuneratório usa regra explícita, nunca pagamento automático presumido.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Criar substituição durante férias de V-A1; em outro caso, por licença. Consultar início/fim e verificar que não sobrescreve o cargo permanente do substituto.

**Aceite técnico:** Os dois motivos são registráveis com período e pessoas distintas, mantendo histórico.

**Atenção / limite:** Não criar escala operacional, contratação de substituto ou direito pecuniário não definido.


<a id="rhf-029"></a>
#### RHF-029 — Ocorrências profissionais

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 29, p. 76:**

> Viabilizar o registro de ocorrências profissionais dos servidores, previstas na legislação municipal, possibilitando consulta de tais registros a partir do cadastro do servidor;

**Implementação:** Manter tipos e registros de ocorrências profissionais previstos/configurados pela entidade, com servidor, data, descrição e referência pertinente. Exibir na ficha sem confundir ocorrência com ato já tramitado ou penalidade aplicada automaticamente.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Registrar duas ocorrências de tipos diferentes em P-A; consultar na ficha e emitir o histórico pertinente.

**Aceite técnico:** O registro é recuperável por tipo/período e não altera remuneração por simples existência de uma anotação.

**Atenção / limite:** Tipos e efeitos vêm da legislação/configuração municipal; não inventar sanções disciplinares.


<a id="rhf-030"></a>
#### RHF-030 — Tempo anterior averbado

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 30, p. 76:**

> Permitir o registro de tempo averbado anterior;

**Implementação:** Registrar períodos anteriores, órgão de origem, datas, documento e finalidade de aproveitamento. Manter vínculo à averbação e detectar sobreposições para não contar os mesmos dias duas vezes na finalidade que não permitir.

**Dados de outro módulo / integração:** DEP-04: documento privado; cálculo e histórico da averbação são do RH.

**Demonstração:** Inserir 365 dias anteriores não sobrepostos em F-TEMPO e consultar a composição. Acrescentar intervalo coincidente em cópia e conferir a crítica.

**Aceite técnico:** O período pode ser consultado e usado nas contagens autorizadas; a averbação não vira automaticamente tempo válido para todos os benefícios.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-031"></a>
#### RHF-031 — Digitalização e documentos do servidor

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 31, p. 76:**

> Realizar a digitalização de qualquer tipo de documento dos servidores, seja Certidões, RG, Atestados, Certificados, etc.;

**Implementação:** Integrar a captura/digitalização disponível e vincular documentos reais à ficha, classificando certidão, RG, atestado, certificado e outros tipos suportados. Guardar bytes, tipo, autor e vínculo; compartilhar o serviço de digitalização de Processos quando existente.

**Dados de outro módulo / integração:** DEP-04: GED/armazenamento/digitalização; EXT-DIG quando houver dispositivo ou serviço de captura.

**Demonstração:** Digitalizar um documento DEMO pela solução de captura disponível, anexá-lo à ficha e abrir após recarga. Testar também documentos de tipos diferentes e falha de envio.

**Aceite técnico:** O documento digitalizado é legível, persistido e ligado ao servidor; teste apenas com nome de arquivo ou PDF fixo não comprova a operação de digitalização.

**Atenção / limite:** Não impor driver/DPI, OCR ou compra de scanner que não constam deste item. Se só houver upload de arquivo pronto, registrar exatamente esse alcance e a pendência de captura, sem declará-la demonstrada.


<a id="rhf-032"></a>
#### RHF-032 — Fotografia na ficha

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 32, p. 76:**

> Permitir que seja adicionado ao cadastro de cada funcionário a foto;

**Implementação:** Reutilizar o campo de foto do item 1, permitindo incluir/atualizar a fotografia e exibi-la na ficha com armazenamento privado. Substituição de foto não muda identidade nem outras informações funcionais.

**Dados de outro módulo / integração:** DEP-04: mídia privada; DEP-02 quando a foto já pertence à pessoa.

**Demonstração:** Adicionar fotografia DEMO e substituir em P-A; recarregar e conferir que P-B continua com sua própria imagem.

**Aceite técnico:** A foto escolhida é recuperada pela ficha correta e não existe uma cópia independente por aba.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-033"></a>
#### RHF-033 — Fichas de avaliação de servidores

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 33, p. 76:**

> Permitir o cadastro de fichas de avaliação para os servidores;

**Implementação:** Manter ficha/modelo de avaliação com identificação, critérios/campos e registros vinculados ao servidor. Persistir os resultados informados e permitir reabertura; critérios e escalas usados são configuração, não avaliação automática.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Cadastrar uma ficha DEMO com dois critérios, preencher para P-A e P-B e reabrir os resultados independentes.

**Aceite técnico:** Existem ficha cadastrável e avaliações recuperáveis por servidor; não é um PDF de exemplo sem dados.

**Atenção / limite:** O item não exige avaliação 360°, IA, progressão automática pela nota ou novo construtor universal de formulários.


<a id="rhf-034"></a>
#### RHF-034 — Auditoria de inclusão, alteração e exclusão

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 34, p. 76:**

> Criação de log (exclusão, inclusão, alteração) que o usuário tenha feito no sistema;

**Implementação:** Registrar ator, instante, ação, objeto e mudança relevante para inclusão/alteração/exclusão, usando auditoria central e referências. Proteger trilha contra edição pelo operador; para dados clínicos registrar acesso/referência sem reproduzir diagnóstico em log genérico.

**Dados de outro módulo / integração:** DEP-01: núcleo de auditoria; fatos e referências são gerados pelo RH.

**Demonstração:** Criar, editar e excluir logicamente um registro de teste elegível; consultar os três eventos e identificar autor, data e objeto.

**Aceite técnico:** Três ações são auditáveis mesmo após exclusão lógica; acesso indevido ao log é recusado.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-035"></a>
#### RHF-035 — Perfis de inclusão, alteração e visualização

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 35, p. 76:**

> Cadastro de Perfis de usuário com permissões de: Inclusão, alteração, visualização;

**Implementação:** Mapear permissões distintas de incluir, alterar e visualizar por recurso, órgão/setor e finalidade. Aplicar no servidor inclusive importação, lote, relatórios e arquivos; não conceder dados médicos só porque alguém pode ver remuneração.

**Dados de outro módulo / integração:** DEP-01: autenticação/perfis do CeleriFlow.

**Demonstração:** Entrar como consulta, operador e RH autorizado. Tentar alteração via URL/API na conta de consulta e conferir a negativa.

**Aceite técnico:** As três capacidades são independentes e efetivas, sem uso de senha compartilhada.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-036"></a>
#### RHF-036 — Planejamento e execução de aperfeiçoamento

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 36, p. 76:**

> Permitir planejamento (definindo cronograma, ministrante, carga horária e data da emissão de certificado) e execução de cursos de aperfeiçoamento, por iniciativa do órgão e por solicitação dos próprios servidores, com emissão de relatório desse planejamento.

**Implementação:** Manter curso/planejamento com cronograma, ministrante, carga horária e data de emissão do certificado; registrar execução e participantes. Permitir origem iniciativa do órgão ou solicitação do servidor. Emitir relatório do planejamento e refletir treinamento realizado na qualificação quando concluído.

**Dados de outro módulo / integração:** DEP-05: pedido/decisão do Portal; DEP-04: relatórios/documentação; dados de curso/execução são de RH.

**Demonstração:** Em F-CURSO, registrar uma iniciativa interna e consumir o pedido autorizado PSV de R$ 1.770,00. Planejar cronograma, executar e emitir relatório; somente o concluído alimenta o histórico de treinamentos.

**Aceite técnico:** As duas origens, planejamento, execução e relatório são demonstráveis sem redigitação do pedido.

**Atenção / limite:** Data de emissão do certificado não exige, sozinha, criar emissor de certificados, LMS ou compra/pagamento do curso. Não confundir execução com mera autorização.


<a id="rhf-037"></a>
#### RHF-037 — Bolsistas e estagiários

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 37, p. 76:**

> Permitir o cadastro de bolsistas/estagiários

**Implementação:** Manter bolsistas e estagiários como categorias identificadas na base de pessoas/vínculos, com dados e períodos necessários ao cadastro. Evitar classificá-los automaticamente como servidores efetivos ou aplicar verbas de outro regime.

**Dados de outro módulo / integração:** DEP-02: pessoas comuns; regime/categoria são nativos de RH.

**Demonstração:** Cadastrar um bolsista e um estagiário em F-CAD e consultar separadamente dos efetivos.

**Aceite técnico:** As duas categorias persistem com identidade própria e não recebem folha ou direitos fictícios por cadastro.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-038"></a>
#### RHF-038 — Atividades dos estagiários

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 38, p. 76:**

> Permitir o cadastro de atividades a serem desenvolvidas pelos estagiarios

**Implementação:** Manter atividades planejadas e vínculo ao estágio, com descrição e período quando pertinente. Reutilizar a ficha do estagiário e permitir consultar/atualizar as atividades sem alterar seu contrato.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Associar duas atividades a EST-DEMO, reabrir e encerrar uma no ensaio; conferir a outra mantida.

**Aceite técnico:** As atividades pertencem ao estágio correto e são consultáveis, não observação sem vínculo.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-039"></a>
#### RHF-039 — Instituições de ensino conveniadas

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 39, p. 76:**

> Permitir cadastro das instituições de ensino conveniadas com o órgão;

**Implementação:** Referenciar a pessoa jurídica da instituição e cadastrar sua identificação como conveniada para estágios, incluindo referência do convênio existente quando disponível. Evitar segundo cadastro fiscal da mesma pessoa.

**Dados de outro módulo / integração:** DEP-02: instituição; DEP-07: convênio de Compras/Contratos se já cadastrado.

**Demonstração:** Cadastrar duas instituições e vincular uma ao estagiário; abrir a referência de convênio quando existir.

**Aceite técnico:** Instituições conveniadas são selecionáveis e relacionadas aos registros de estágio sem duplicação geral.

**Atenção / limite:** Não criar novo gestor de convênios nem exigir integração nominal que este item não descreve.


<a id="rhf-040"></a>
#### RHF-040 — Carreiras

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 40, p. 77:**

> Permitir o cadastro de carreiras

**Implementação:** Manter carreiras identificadas e seus vínculos aos cargos/referências existentes. A consulta deve distinguir carreira de cargo e de regime jurídico, preservando históricos pertinentes.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Cadastrar duas carreiras DEMO e associar cargos distintos; consultar a organização pela ficha do cargo.

**Aceite técnico:** Carreiras são registros reutilizáveis, não nomes duplicados em cada servidor.

**Atenção / limite:** Não presumir plano de progressão, interstícios ou reajustes por simples cadastro de carreira.


<a id="rhf-041"></a>
#### RHF-041 — Autônomos na mesma base, separados dos servidores

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 41, p. 77:**

> Permitir o registro de autônomos no sistema de folha de pagamento com seus respectivos códigos de identificação de prestador de serviços, separado dos servidores, porém acessando o mesmo banco de dados;

**Implementação:** Registrar prestadores autônomos com seu código de identificação e contexto próprio de folha, usando a mesma base de dados. Reutilizar pessoa e separar o vínculo de prestador das matrículas funcionais; permitir seleção correta nas operações aplicáveis.

**Dados de outro módulo / integração:** DEP-02: pessoa/prestador; DEP-06 quando houver vínculo financeiro existente.

**Demonstração:** Cadastrar AUT-DEMO com código de prestador e a mesma pessoa em outro contexto somente quando legítimo. Consultar as listas de autônomos e servidores sem mistura.

**Aceite técnico:** Autônomos têm identificação e tratamento próprios no mesmo sistema, sem criar uma folha paralela ou transformar prestação em cargo público.

**Atenção / limite:** Regras tributárias/previdenciárias do autônomo precisam de configuração aplicável. Não aplicar verbas de servidor por analogia.


### Férias


<a id="rhf-042"></a>
#### RHF-042 — Períodos aquisitivos de férias em todo o vínculo

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 42, p. 77:**

> Manter o cadastro de todos os períodos aquisitivos de férias dos servidores desde a admissão até a exoneração;

**Implementação:** Manter todos os períodos aquisitivos entre admissão e exoneração, com datas, dias de direito, consumos/reservas pertinentes e histórico. Contagem usa regras por regime e interrupções; períodos anteriores não são apagados ao gerar o próximo.

**Dados de outro módulo / integração:** DEP-05: Portal consome períodos e saldo; a fonte oficial de férias é este RH.

**Demonstração:** Em F-FER, abrir dois períodos antigos, um atual e o último de vínculo encerrado. Conferir datas e saldo de cada um, inclusive pelo serviço entregue ao Portal.

**Aceite técnico:** Períodos continuam consultáveis ao longo de toda a vida do vínculo, sem limitar ao ano corrente.

**Atenção / limite:** Não presumir 30 dias para todos os cargos/regimes. F-FER usa direito de 30 dias somente como configuração demonstrativa.


<a id="rhf-043"></a>
#### RHF-043 — Férias fracionadas com saldo de dias

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 43, p. 77:**

> Permitir o lançamento de mais que um período de gozo para o mesmo período aquisitivo de férias controlando o saldo restante dos dias de férias;

**Implementação:** Vincular vários períodos de gozo a um período aquisitivo, contabilizando dias e disponibilidade de forma transacional. Revalidar sobreposição, saldo e reservas na confirmação, inclusive quando a origem for pedido aprovado no Portal.

**Dados de outro módulo / integração:** DEP-05: solicitação e autorização PSV; saldos/calendário são nativos de RH.

**Demonstração:** Em F-FER, lançar 15 dias e depois 10: saldo 5 de 30. Tentar 6 dias adicionais, depois completar 5. Duas sessões não podem consumir os mesmos cinco dias.

**Aceite técnico:** Vários gozos são preservados e o saldo final é correto; não há dupla dedução por reenvio do pedido.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-044"></a>
#### RHF-044 — Terço de férias integral ou proporcional

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 44, p. 77:**

> Permitir o pagamento de 1/3 de férias integral ou proporcional a cada período de gozo lançado;

**Implementação:** Configurar a forma de pagamento do terço por período aquisitivo/gozo: integral ou proporcional a cada parcela. Separar direito, valor já pago e valor ainda devido, usando a mesma origem na folha de férias; não pagar novamente por recalcular.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Com base DEMO de R$ 3.000 e direito de 30 dias: integral R$ 1.000 uma vez; em cenário proporcional de 15/10/5 dias, conferir R$ 500,00/R$ 333,33/R$ 166,67, total R$ 1.000.

**Aceite técnico:** Os dois modos funcionam e reconciliam o total do período, inclusive ajuste de arredondamento da última parcela.

**Atenção / limite:** Q-R01/R02: base e política reais são configuradas por regime; o exemplo aritmético não define regra remuneratória da entidade.


<a id="rhf-045"></a>
#### RHF-045 — Gozo de férias coletivo

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 45, p. 77:**

> Permitir o lançamento de um mesmo período de gozo para um grupo de servidores, facilitando este lançamento quando vários servidores vão sair de férias no mesmo período;

**Implementação:** Permitir selecionar vínculos e lançar o mesmo intervalo de gozo, vinculando cada um ao seu período aquisitivo e validando sua disponibilidade. Exibir prévia e resultado por servidor; não aplicar saldo médio do grupo.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Selecionar três servidores, sendo um sem saldo suficiente; conferir a crítica individual, corrigir a seleção e confirmar os elegíveis. Reenviar a operação.

**Aceite técnico:** Cada servidor recebe o gozo válido uma vez, com seu próprio período/saldo; falha de um não aparece como sucesso integral.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-046"></a>
#### RHF-046 — Adiantamento de 13º nas férias

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 46, p. 77:**

> Permitir o lançamento e pagamento do adiantamento de 13º salário por ocasião das férias.

**Implementação:** Associar opção e cálculo do adiantamento de 13º ao evento de férias, gerando a rubrica/folha correspondente. Guardar a antecipação paga para compensação na apuração final do mesmo exercício/vínculo.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Em F-13 isolado, antecipar R$ 1.800 de direito demonstrativo de R$ 3.600 por ocasião das férias. Na apuração final, conferir R$ 1.800 restantes antes dos descontos próprios.

**Aceite técnico:** Adiantamento decorre das férias e não é pago duas vezes na folha de dezembro ou ao reprocessar o evento.

**Atenção / limite:** Percentual e elegibilidade da antecipação devem vir da configuração; 50% é apenas parâmetro do ensaio.


<a id="rhf-047"></a>
#### RHF-047 — Planilha anual de férias

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 47, p. 77:**

> Permitir a geração da planilha de férias anual

**Implementação:** Gerar visão anual por servidor, período aquisitivo e gozos programados/realizados, com saldo pertinente. Permitir emissão da planilha pelo núcleo de relatórios, abrangendo todos os registros do recorte.

**Dados de outro módulo / integração:** DEP-04: emissão/planilha. Dados oficiais são do RH.

**Demonstração:** Emitir o ano de F-FER com gozos fracionados e servidores em meses distintos; comparar com as fichas e testar mais de uma página.

**Aceite técnico:** Planilha anual concilia dias e intervalos com as fichas, sem omitir períodos por paginação.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-048"></a>
#### RHF-048 — Pagamento de férias de 20 dias para cargos específicos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 48, p. 77:**

> Permitir o pagamento de 20 dias de férias para cargos como Raio X

**Implementação:** Permitir configurar cargo/regra que utilize 20 dias de férias e processar o pagamento com a base pertinente. Não converter todos os vínculos em 20 dias nem limitar o controle geral a 30.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Em F-FER-20, selecionar cargo DEMO elegível com 20 dias e base diária demonstrativa de R$ 100: parcela-base R$ 2.000. Comparar com vínculo não elegível e consultar o evento gerado.

**Aceite técnico:** O regime especial de 20 dias é representável e calculável, com memória e vínculo ao cargo/regras usados.

**Atenção / limite:** Q-R01/R02: o texto exemplifica Raio X, mas não informa periodicidade semestral, base ou demais condições. Não presumir essas regras nem transformar o exemplo em orientação médica.


### Medicina do Trabalho e Licenças e Afastamentos


<a id="rhf-049"></a>
#### RHF-049 — Medicina do Trabalho, licenças e afastamentos — título numerado

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 49, p. 77:**

> Medicina do Trabalho e Licenças e Afastamentos

**Implementação:** Organizar a área interna que reúne os itens 50–68. Este número é título na fonte, não uma ação adicional: manter o ID para rastreabilidade e ligar a evidência aos controles efetivamente descritos nos itens seguintes.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Abrir a área de Medicina do Trabalho/Licenças e demonstrar seus cadastros e operações pelos respectivos IDs.

**Aceite técnico:** Evidência agregada identifica a área e os requisitos subordinados, sem criar um 202º recurso ou contar título como função autônoma.

**Atenção / limite:** A ausência de verbo funcional não é corrigida inventando prontuário, clínica, laudo ou consulta médica.


<a id="rhf-050"></a>
#### RHF-050 — CID e descrição

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 50, p. 77:**

> Manter o cadastro do CID e a descrição da doença;

**Implementação:** Manter cadastro/consulta do CID com código, descrição e referência de versão aplicável. Utilizar seleção nos registros clínicos autorizados, sem inferir diagnóstico a partir de texto livre ou substituir código por nome genérico.

**Dados de outro módulo / integração:** EXT-CLASS: classificação CID validada; DEP-01 para sigilo.

**Demonstração:** Cadastrar/importar o catálogo autorizado e selecionar dois códigos na homologação; reabrir licença e conferir a descrição correta.

**Aceite técnico:** Código/descrição persistem e são reutilizados, com acesso restrito ao contexto de saúde ocupacional.

**Atenção / limite:** Cadastro de CID não autoriza criar diagnósticos, emitir laudos ou impor consentimentos/regras médicas não definidos. Fixtures clínicas são fictícias.


<a id="rhf-051"></a>
#### RHF-051 — Médicos e CRM

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 51, p. 77:**

> Manter o cadastro de todos os médicos que atendem os servidores públicos municipais com o Nome e CRM;

**Implementação:** Manter médicos com nome e CRM, distinguindo emissor de atestado e perito nos registros que usam ambos. Usar complemento de identificação/UF quando o cadastro existente exigir desambiguação, sem criar consulta externa obrigatória.

**Dados de outro módulo / integração:** DEP-02: pessoas/profissionais comuns quando existentes.

**Demonstração:** Cadastrar médico emissor DEMO e perito DEMO; selecioná-los em campos distintos de F-AFAST e reabrir o registro.

**Aceite técnico:** Nome e CRM são recuperáveis e o médico da perícia não sobrescreve o do atendimento.

**Atenção / limite:** Não inventar CRM real nem simular validação em conselho. Usar dados de teste identificados; consulta automática de CRM não é exigida.


<a id="rhf-052"></a>
#### RHF-052 — Licenças médicas com atendimento e perícia distintos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 52, p. 77:**

> Efetuar o lançamento de todos os tipos de licenças a seguir: Licenças Maternidade, Acidente do Trabalho, Acompanhamento de Pessoa da Família, Prorrogação de Doença e Acidente de Trabalho, informando no mínimo a Identificação do servidor, tipo de licença ou afastamento, documento apresentado, médico que atendeu, CID informado no atendimento, médico que fez a perícia, CID informado na perícia e período homologado da licença ou afastamento;

**Implementação:** Manter os tipos citados e os campos C-06: servidor, licença/afastamento, documento, médico e CID do atendimento, médico e CID da perícia e período homologado. Registrar solicitação e homologação como informações distintas e respeitar acesso clínico restrito.

**Dados de outro módulo / integração:** DEP-05: pedido/autorização do Portal; DEP-04: comprovantes privados. Licença homologada pertence ao RH.

**Demonstração:** Em F-AFAST, cadastrar casos de maternidade, acidente, acompanhamento familiar, prorrogação de doença e prorrogação de acidente; usar médicos/CIDs diferentes para atendimento e perícia em um deles. Reabrir cada campo e o período homologado.

**Aceite técnico:** Os tipos e todos os campos expressos são preservados; anexos são acessíveis apenas no escopo autorizado.

**Atenção / limite:** Decisão administrativa não constitui diagnóstico automático. Q-R03 define obrigatoriedade/visibilidade dos dados clínicos e o regime aplicável.


<a id="rhf-053"></a>
#### RHF-053 — CAT e formulário padronizado

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 53, p. 77:**

> Efetuar o controle dos Acidentes de Trabalho através do cadastramento da CAT e a emissão do formulário padronizado;

**Implementação:** Registrar a CAT vinculada ao servidor/acidente com os dados do modelo aplicável e emitir formulário a partir da base. Manter identificação da versão do modelo e referência ao acidente, sem preencher dados clínicos inexistentes.

**Dados de outro módulo / integração:** DEP-04: geração documental; EXT-DOC: modelo CAT vigente/competência.

**Demonstração:** Criar CAT-DEMO em F-AFAST, emitir formulário e conferir servidor, ocorrência e campos de origem. Reemitir sem duplicar o registro.

**Aceite técnico:** CAT é um registro real e o formulário é derivado dele no padrão identificado, não PDF estático.

**Atenção / limite:** Emissão de formulário não prova transmissão a INSS/eSocial. Se a transmissão pertinente for testada, identificá-la no escopo eSocial, sem afirmar recibo inexistente.


<a id="rhf-054"></a>
#### RHF-054 — Aproveitamento automático da CAT no atestado

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 54, pp. 77–78:**

> Captar automaticamente os dados da CAT como: doença informada no atendimento e médico que atendeu no lançamento de atestado referente a acidente do trabalho;

**Implementação:** Ao lançar atestado de acidente de trabalho, selecionar a CAT pertinente e recuperar automaticamente doença/CID e médico do atendimento. Preservar a referência à CAT e permitir diferenciar dados posteriores autorizados sem alterar silenciosamente a CAT original.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Usar CAT-DEMO no novo atestado; conferir campos preenchidos sem redigitação e vínculo após recarga.

**Aceite técnico:** As informações solicitadas são captadas da CAT correta, não constantes fixas no formulário.

**Atenção / limite:** Se a CAT não estiver identificada ou tiver múltiplos registros, exigir seleção adequada; não escolher a primeira por CPF indiscriminadamente.


<a id="rhf-055"></a>
#### RHF-055 — Alta médica

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 55, p. 78:**

> Permitir lançar a data da alta médica para as licenças e afastamentos;

**Implementação:** Registrar data da alta médica e documento/referência quando disponível, vinculada à licença/afastamento. Distinguir alta, término previsto e retorno efetivamente confirmado ao trabalho.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Em F-RET, registrar alta e depois confirmar retorno na operação apropriada. Reabrir as duas datas e conferir o efeito nos lançamentos pendentes.

**Aceite técnico:** A alta persiste no afastamento correto sem apagar prorrogações/histórico ou produzir automaticamente pagamento indevido.

**Atenção / limite:** Não gerar alta por calendário ou IA; informação deve provir do documento/ato competente.


<a id="rhf-056"></a>
#### RHF-056 — Afastamentos curtos intercalados pela mesma causa

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 56, p. 78:**

> Controlar afastamentos de menos de 15 dias, mesmo que apresentados em períodos interruptos, quando caracterizar que são da mesma causa, evitando pagamento indevido por parte do Órgão e possibilitando o encaminhamento ao INSS;

**Implementação:** Controlar agrupamentos de afastamentos por causa reconhecida pelo responsável autorizado, com janela e regras de contagem parametrizadas. Somar dias válidos sem sobrepor datas e sinalizar necessidade de encaminhamento/efeito de folha quando o limite aplicável for atingido.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Em F-AFAST-CURTO, registrar 7 e 8 dias intercalados da mesma causa: 15 no agrupamento; adicionar 2 e conferir 17. Um afastamento de causa diferente não entra nessa soma.

**Aceite técnico:** A soma reúne episódios pertinentes e provoca a crítica/encaminhamento configurado, sem somar duas vezes dias sobrepostos.

**Atenção / limite:** O TR cita menos de 15 dias; janela, responsabilidade remuneratória e encaminhamento dependem da regra. Não determinar causalidade clínica automaticamente nem enviar benefício ao INSS sem serviço definido.


<a id="rhf-057"></a>
#### RHF-057 — Prorrogações de licença e limite de dias

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 57, p. 78:**

> Controlar prorrogações de licenças para evitar que ultrapasse o limite de dias permitido para a mesma;

**Implementação:** Registrar prorrogações vinculadas à licença original, calculando o período total e controlando o limite configurado para o tipo/regime. Preservar versões homologadas; não sobrescrever apenas a data de fim.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Na fixture com limite de 30 dias, licença de 20 aceita prorrogação de 10 e critica mais 1. Consultar as parcelas e o total.

**Aceite técnico:** O total e as críticas respeitam a regra configurada e a prorrogação não cria licença independente para contornar o limite.

**Atenção / limite:** 30 dias é parâmetro demonstrativo, não limite legal genérico. Decisões excepcionais devem ter fundamento/configuração específica.


<a id="rhf-058"></a>
#### RHF-058 — Maternidade de 180 dias com parcelas de 120 e 60

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 58, p. 78:**

> Possuir rotina para lançamento de Licença Gestante (Maternidade) de 180 dias, com geração em verbas separadas dos 120 dias e 60 dias, prevendo abatimento na Guia de Previdência somente do previsto em lei;

**Implementação:** Permitir licença de 180 dias e decompor o efeito remuneratório em verbas distintas de 120 e 60 dias. Distribuir pelas competências reais e marcar separadamente a elegibilidade de abatimento na guia; não deduzir toda a licença por padrão.

**Dados de outro módulo / integração:** DEP-06: consolidação financeira/guia quando competente; dados/rubricas são do RH.

**Demonstração:** Em F-MAT, iniciar em 01/01/2026: 120 dias até 30/04 e 60 de 01/05 a 29/06, inclusive. Conferir rubricas e base separadas; testar configuração de abatimento autorizada e outra parcela não abatível.

**Aceite técnico:** Os 180 dias são preservados e conciliados como 120+60. A guia considera apenas o abatimento efetivamente permitido no conjunto de regras, não ambos indistintamente.

**Atenção / limite:** Q-R01/R03: regime, elegibilidade e compensação reais exigem validação. A referência de 180 dias do TR não autoriza aplicação universal a todo vínculo.


<a id="rhf-059"></a>
#### RHF-059 — Períodos aquisitivos de licença-prêmio

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 59, p. 78:**

> Manter o cadastro de todos os períodos aquisitivos de licença prêmio dos servidores desde a admissão até a exoneração;

**Implementação:** Manter histórico completo dos períodos aquisitivos de licença-prêmio da admissão à exoneração, com direito, gozos e saldo conforme a configuração do regime. Separar do controle de férias.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Cadastrar períodos antigo e atual em F-PREMIO; consultar um vínculo encerrado e outro ativo.

**Aceite técnico:** Todos os períodos permanecem recuperáveis e não reutilizam saldo de férias.

**Atenção / limite:** Não presumir concessão de licença-prêmio a regimes que não a prevejam; o sistema deve suportar as regras fornecidas.


<a id="rhf-060"></a>
#### RHF-060 — Gozo fracionado de licença-prêmio

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 60, p. 78:**

> Permitir o lançamento de mais que um período de gozo para o mesmo período aquisitivo de licença prêmio controlando o saldo restante dos dias;

**Implementação:** Permitir vários gozos por período aquisitivo e controlar saldo com validação transacional. Reutilizar componentes de períodos sem fundir as contas de dias de férias e licença-prêmio.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Em F-PREMIO, direito DEMO de 90 dias, consumir 30 e 20; conferir saldo 40, rejeitar 41 adicionais e testar repetição do mesmo evento.

**Aceite técnico:** Dias de cada gozo e saldo são consistentes e vinculados ao período correto.

**Atenção / limite:** Direito de 90 dias é só dado do ensaio; não configura automaticamente um direito legal.


<a id="rhf-061"></a>
#### RHF-061 — Licenças gala, nojo e sem vencimento

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 61, p. 78:**

> Efetuar o lançamento de todos os tipos de licenças, a seguir: Licença Gala, Licença Nojo e Licença sem Vencimento, informando no mínimo a Identificação do servidor, tipo de licença, documento apresentado, data de início e término da licença;

**Implementação:** Oferecer os três tipos e registrar servidor, documento, início/fim e regras pertinentes. Aplicar os efeitos configurados de contagem/remuneração e compartilhar dados com atos administrativos específicos.

**Dados de outro módulo / integração:** DEP-04: documento; DEP-08: trâmite do ato quando utilizado.

**Demonstração:** Cadastrar um caso de cada tipo com documento DEMO; consultar períodos e gerar os atos dos itens 73–75 após o trâmite configurado.

**Aceite técnico:** Os três tipos são registráveis e seus períodos não se confundem com licença médica; histórico e atos apontam à origem correta.

**Atenção / limite:** Não fixar dias legais ou desconto salarial igual para todos os regimes. Usar a regra identificada da instituição.


<a id="rhf-062"></a>
#### RHF-062 — Tipos de afastamento e suspensão das contagens

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 62, p. 78:**

> Possibilitar a criação de tipos de afastamento permitindo ao usuário configurar e definir suspensões de contagem de tempo de serviço, contagem de tempo de férias e contagem de tempo para 13ºsalário.

**Implementação:** Parametrizar por tipo/regime se a ausência suspende tempo de serviço, aquisição de férias e contagem do 13º. Tratar os três efeitos independentemente e aplicar por vigência nas rotinas de cálculo, sem apagar os dias registrados.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Criar tipo X que suspende só férias e tipo Y que suspende serviço/13º na fixture. Recalcular F-TEMPO e conferir cada acumulador.

**Aceite técnico:** As opções mudam os cálculos pertinentes e não alteram contagens que permaneceram habilitadas.

**Atenção / limite:** A parametrização não autoriza o usuário comum a contrariar regras legais protegidas. Exceções devem ser versionadas e autorizadas.


<a id="rhf-063"></a>
#### RHF-063 — Cadastro de PPRA

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 63, p. 78:**

> Permitir realizar o cadastro do PPRA.

**Implementação:** Manter o registro denominado PPRA na fonte, com identificação, vigência, documentos e relações a ambientes/cargos pertinentes. Preservar versões históricas e a informação fornecida pelo responsável técnico; reutilizar componente SST quando existir.

**Dados de outro módulo / integração:** DEP-04: documento privado/técnico; EXT-SST para compatibilização normativa.

**Demonstração:** Cadastrar PPRA-DEMO e consultar sua vigência/arquivo, distinguindo documento histórico de configuração atual. Verificar vínculos de ambiente sem inventar riscos.

**Aceite técnico:** O cadastro e os documentos são recuperáveis, com origem e período identificados; não é apenas um menu vazio.

**Atenção / limite:** O termo PPRA foi preservado. A pesquisa externa aponta transição para PGR; Q-R08 registra a compatibilização. Não apagar o requisito nem desenvolver um PGR completo por suposição.


<a id="rhf-064"></a>
#### RHF-064 — EPI por cargo

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 64, p. 78:**

> Permitir cadastrar o EPI por Cargo.

**Implementação:** Manter itens de EPI e associações por cargo, com referência/descritivo disponível e vigência quando pertinente. Permitir consultar quais EPIs estão associados a um cargo sem criar estoque/compra de segurança.

**Dados de outro módulo / integração:** DEP-02/09: catálogo de materiais existente, apenas se adotado; EPI por cargo é dado do RH.

**Demonstração:** Associar dois EPIs DEMO ao cargo C-A e um a C-B; consultar ambas as listas e usar o vínculo no contexto de SST.

**Aceite técnico:** As associações por cargo persistem e não são confundidas com entrega individual.

**Atenção / limite:** Não exigir integração com Almoxarifado nem gerar compra/baixa física automaticamente.


<a id="rhf-065"></a>
#### RHF-065 — EPI por funcionário

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 65, p. 78:**

> Permitir Cadastrar o EPI por Funcionário.

**Implementação:** Permitir associar EPI ao funcionário/vínculo individual, reaproveitando os itens do cadastro e distinguindo recomendação por cargo de registro individual. Guardar referência histórica quando usada em PPP.

**Dados de outro módulo / integração:** Cadastro de EPI compartilhado com RHF-064; DEP-04 para documento já existente.

**Demonstração:** Associar um EPI a P-A e consultar o cargo e a ficha individual. Alterar o cargo em cenário isolado e verificar que o registro histórico individual não some.

**Aceite técnico:** EPI individual é identificável e consultável sem duplicar o cadastro do material.

**Atenção / limite:** Cadastro individual não comprova entrega física, eficácia ou uso do EPI por si só; não inferir essas condições para o PPP.


<a id="rhf-066"></a>
#### RHF-066 — Editais e eleições da CIPA

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 66, p. 78:**

> Permitir cadastrar Edital e Eleições da CIPA

**Implementação:** Registrar editais e eleições da CIPA com identificação, datas e documentos pertinentes, vinculando eleição ao edital. Preservar consulta e histórico sem criar plataforma de votação eletrônica.

**Dados de outro módulo / integração:** DEP-04: documentos/modelos.

**Demonstração:** Cadastrar edital CIPA-DEMO e eleição associada; anexar documento de resultado e consultar o vínculo.

**Aceite técnico:** Edital e eleição são registros distintos e correlatos, com documentos recuperáveis.

**Atenção / limite:** O requisito é cadastro, não apuração de votos, urna eletrônica ou condução eleitoral automática.


<a id="rhf-067"></a>
#### RHF-067 — Membros da CIPA

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 67, p. 78:**

> Permitir cadastrar Membros da CIPA

**Implementação:** Vincular membros à composição/mandato da CIPA, identificando pessoas e funções informadas. Reutilizar eleição/mandato existente e preservar membros históricos.

**Dados de outro módulo / integração:** DEP-02: pessoas; dados da comissão CIPA são do RH.

**Demonstração:** Cadastrar três membros DEMO associados à eleição e consultar a composição em datas distintas.

**Aceite técnico:** Composição e pessoas são recuperáveis sem duplicar os servidores.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-068"></a>
#### RHF-068 — Cedidos e recebidos em cedência

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 68, p. 78:**

> Deverá possuir registro e controle dos cedidos e recebidos em cedência

**Implementação:** Registrar direção da cessão, servidor, órgãos de origem/destino e período, com condições de responsabilidade informadas. Manter controle histórico e distinguir recebido de cedido sem assumir ônus de folha.

**Dados de outro módulo / integração:** DEP-03: órgãos/estrutura; DEP-02: pessoa.

**Demonstração:** Criar uma cessão de saída e uma de entrada, consultar vigência e localizar na ficha de cada pessoa.

**Aceite técnico:** Os dois sentidos são representáveis e não eliminam o vínculo de origem nem geram remuneração duplicada.

**Atenção / limite:** Quem suporta remuneração, recolhimentos e contagem precisa da regra/ato de cessão; não inferir pelo sentido do movimento.


### Atos Administrativos


<a id="rhf-069"></a>
#### RHF-069 — Modelos de atos administrativos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 69, p. 78:**

> Manter o cadastro de todos os textos que darão origem a atos administrativos como Portaria, Decretos, Contratos e Termos de Posse;

**Implementação:** Manter textos/modelos editáveis para portaria, decreto, contrato e termo de posse, com campos de preenchimento vinculados à fonte. Guardar versão do modelo usada na emissão, sem substituir o conteúdo administrativo por IA.

**Dados de outro módulo / integração:** DEP-04: editor/modelos/documentos; cadastro e ligação aos fatos são de RH.

**Demonstração:** Criar os quatro modelos DEMO de F-ATOS, editar um texto e gerar prévia preenchida a partir de dados reais de homologação.

**Aceite técnico:** Os quatro tipos podem ser mantidos e reutilizados; alteração do modelo não modifica documento já emitido.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-070"></a>
#### RHF-070 — Ato automático — Licenças e afastamentos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 70, p. 79:**

> Gerar automaticamente o ato administrativo a partir de um lançamento de licenças e afastamentos, com o registro no currículo funcional do servidor, após a tramitação;

**Implementação:** Vincular o modelo ao lançamento de licença/afastamento. O fato deve gerar o ato automaticamente e, após a tramitação configurada, registrar sua referência no currículo funcional. Compartilhar o motor documental, preservando evento de origem, versão e situação; não marcar o ato como concluído antes do trâmite.

**Dados de outro módulo / integração:** DEP-04: modelo/arquivo; DEP-08: Processos/Tramitação. Fato funcional e currículo são deste RH.

**Demonstração:** Em F-ATOS, lançar AFAST-01, conferir os dados herdados no documento, percorrer o trâmite autorizado e abrir o registro no currículo. Repetir a confirmação: permanece um ato por fato. 

**Aceite técnico:** O gatilho produz documento real e o currículo é atualizado na etapa correta, sem redigitação ou duplicação. Falha no trâmite não aparece como ato concluído.

**Atenção / limite:** Tramitação segue a configuração existente/autorizada, sem aprovadores extras. Não incluir publicação automática em Diário Oficial ou envio ao eSocial somente por gerar o ato.


<a id="rhf-071"></a>
#### RHF-071 — Ato automático — Férias em gozo

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 71, p. 79:**

> Gerar automaticamente o ato administrativo a partir de um lançamento de férias em gozo de férias, com o registro no currículo funcional do servidor, após a tramitação;

**Implementação:** Vincular o modelo ao lançamento de férias em gozo. O fato deve gerar o ato automaticamente e, após a tramitação configurada, registrar sua referência no currículo funcional. Compartilhar o motor documental, preservando evento de origem, versão e situação; não marcar o ato como concluído antes do trâmite.

**Dados de outro módulo / integração:** DEP-04: modelo/arquivo; DEP-08: Processos/Tramitação. Fato funcional e currículo são deste RH.

**Demonstração:** Em F-ATOS, lançar FER-01, conferir os dados herdados no documento, percorrer o trâmite autorizado e abrir o registro no currículo. Repetir a confirmação: permanece um ato por fato. 

**Aceite técnico:** O gatilho produz documento real e o currículo é atualizado na etapa correta, sem redigitação ou duplicação. Falha no trâmite não aparece como ato concluído.

**Atenção / limite:** Tramitação segue a configuração existente/autorizada, sem aprovadores extras. Não incluir publicação automática em Diário Oficial ou envio ao eSocial somente por gerar o ato.


<a id="rhf-072"></a>
#### RHF-072 — Ato automático — Licença-prêmio em gozo

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 72, p. 79:**

> Gerar automaticamente o ato administrativo a partir de um lançamento de licença prêmio em gozo com o registro no currículo funcional do servidor, após a tramitação;

**Implementação:** Vincular o modelo ao lançamento de licença-prêmio em gozo. O fato deve gerar o ato automaticamente e, após a tramitação configurada, registrar sua referência no currículo funcional. Compartilhar o motor documental, preservando evento de origem, versão e situação; não marcar o ato como concluído antes do trâmite.

**Dados de outro módulo / integração:** DEP-04: modelo/arquivo; DEP-08: Processos/Tramitação. Fato funcional e currículo são deste RH.

**Demonstração:** Em F-ATOS, lançar LPR-01, conferir os dados herdados no documento, percorrer o trâmite autorizado e abrir o registro no currículo. Repetir a confirmação: permanece um ato por fato. 

**Aceite técnico:** O gatilho produz documento real e o currículo é atualizado na etapa correta, sem redigitação ou duplicação. Falha no trâmite não aparece como ato concluído.

**Atenção / limite:** Tramitação segue a configuração existente/autorizada, sem aprovadores extras. Não incluir publicação automática em Diário Oficial ou envio ao eSocial somente por gerar o ato.


<a id="rhf-073"></a>
#### RHF-073 — Ato automático — Licença sem vencimento

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 73, p. 79:**

> Gerar automaticamente o ato administrativo a partir de um lançamento de licença sem vencimento, com o registro no currículo funcional do servidor, após a tramitação;

**Implementação:** Vincular o modelo ao lançamento de licença sem vencimento. O fato deve gerar o ato automaticamente e, após a tramitação configurada, registrar sua referência no currículo funcional. Compartilhar o motor documental, preservando evento de origem, versão e situação; não marcar o ato como concluído antes do trâmite.

**Dados de outro módulo / integração:** DEP-04: modelo/arquivo; DEP-08: Processos/Tramitação. Fato funcional e currículo são deste RH.

**Demonstração:** Em F-ATOS, lançar LSV-01, conferir os dados herdados no documento, percorrer o trâmite autorizado e abrir o registro no currículo. Repetir a confirmação: permanece um ato por fato. 

**Aceite técnico:** O gatilho produz documento real e o currículo é atualizado na etapa correta, sem redigitação ou duplicação. Falha no trâmite não aparece como ato concluído.

**Atenção / limite:** Tramitação segue a configuração existente/autorizada, sem aprovadores extras. Não incluir publicação automática em Diário Oficial ou envio ao eSocial somente por gerar o ato.


<a id="rhf-074"></a>
#### RHF-074 — Ato automático — Licença gala

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 74, p. 79:**

> Gerar automaticamente o ato administrativo a partir de um lançamento de licença gala, com o registro no currículo funcional do servidor, após a tramitação;

**Implementação:** Vincular o modelo ao lançamento de licença gala. O fato deve gerar o ato automaticamente e, após a tramitação configurada, registrar sua referência no currículo funcional. Compartilhar o motor documental, preservando evento de origem, versão e situação; não marcar o ato como concluído antes do trâmite.

**Dados de outro módulo / integração:** DEP-04: modelo/arquivo; DEP-08: Processos/Tramitação. Fato funcional e currículo são deste RH.

**Demonstração:** Em F-ATOS, lançar GAL-01, conferir os dados herdados no documento, percorrer o trâmite autorizado e abrir o registro no currículo. Repetir a confirmação: permanece um ato por fato. 

**Aceite técnico:** O gatilho produz documento real e o currículo é atualizado na etapa correta, sem redigitação ou duplicação. Falha no trâmite não aparece como ato concluído.

**Atenção / limite:** Tramitação segue a configuração existente/autorizada, sem aprovadores extras. Não incluir publicação automática em Diário Oficial ou envio ao eSocial somente por gerar o ato.


<a id="rhf-075"></a>
#### RHF-075 — Ato automático — Licença nojo

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 75, p. 79:**

> Gerar automaticamente o ato administrativo a partir de um lançamento de licença nojo, com o registro no currículo funcional do servidor, após a tramitação;

**Implementação:** Vincular o modelo ao lançamento de licença nojo. O fato deve gerar o ato automaticamente e, após a tramitação configurada, registrar sua referência no currículo funcional. Compartilhar o motor documental, preservando evento de origem, versão e situação; não marcar o ato como concluído antes do trâmite.

**Dados de outro módulo / integração:** DEP-04: modelo/arquivo; DEP-08: Processos/Tramitação. Fato funcional e currículo são deste RH.

**Demonstração:** Em F-ATOS, lançar NOJ-01, conferir os dados herdados no documento, percorrer o trâmite autorizado e abrir o registro no currículo. Repetir a confirmação: permanece um ato por fato. 

**Aceite técnico:** O gatilho produz documento real e o currículo é atualizado na etapa correta, sem redigitação ou duplicação. Falha no trâmite não aparece como ato concluído.

**Atenção / limite:** Tramitação segue a configuração existente/autorizada, sem aprovadores extras. Não incluir publicação automática em Diário Oficial ou envio ao eSocial somente por gerar o ato.


<a id="rhf-076"></a>
#### RHF-076 — Ato automático — Suspensão ou advertência

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 76, p. 79:**

> Gerar automaticamente o ato administrativo a partir de um lançamento de suspensão ou advertência, com o registro no currículo funcional do servidor, após a tramitação;

**Implementação:** Vincular o modelo ao lançamento de suspensão e, separadamente, advertência. O fato deve gerar o ato automaticamente e, após a tramitação configurada, registrar sua referência no currículo funcional. Compartilhar o motor documental, preservando evento de origem, versão e situação; não marcar o ato como concluído antes do trâmite.

**Dados de outro módulo / integração:** DEP-04: modelo/arquivo; DEP-08: Processos/Tramitação. Fato funcional e currículo são deste RH.

**Demonstração:** Em F-ATOS, lançar DISC-01/02, conferir os dados herdados no documento, percorrer o trâmite autorizado e abrir o registro no currículo. Repetir a confirmação: permanece um ato por fato. Executar o ensaio para suspensão e para advertência; não basta um tipo.

**Aceite técnico:** O gatilho produz documento real e o currículo é atualizado na etapa correta, sem redigitação ou duplicação. Falha no trâmite não aparece como ato concluído.

**Atenção / limite:** Tramitação segue a configuração existente/autorizada, sem aprovadores extras. Não incluir publicação automática em Diário Oficial ou envio ao eSocial somente por gerar o ato.


<a id="rhf-077"></a>
#### RHF-077 — Atos de insalubridade, periculosidade e gratificação

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 77, p. 79:**

> Gerar automaticamente o ato administrativo a partir de um lançamento de Insalubridade, Periculosidade e Gratificação, com registro no currículo funcional do servidor;

**Implementação:** Gerar ato e referência no currículo a partir dos lançamentos de insalubridade, periculosidade e gratificação, reaproveitando dados/modelo. Manter eventos e bases próprias; não decidir elegibilidade clínica ou acumulação de adicionais pelo nome.

**Dados de outro módulo / integração:** DEP-04: modelos/documentos; os adicionais e currículo são nativos de RH.

**Demonstração:** Em três cenários F-ATOS separados, lançar cada adicional e conferir o documento e a referência funcional. Repetir um lançamento técnico sem duplicar ato.

**Aceite técnico:** Os três gatilhos funcionam; o documento usa os valores e a vigência da origem, sem conceder verba a outro vínculo.

**Atenção / limite:** O item 77 não repete a condição “após a tramitação” dos anteriores. Preservar o fluxo existente sem inventar etapa obrigatória; percentuais/compatibilidades exigem regra autorizada.


<a id="rhf-078"></a>
#### RHF-078 — Atos individuais e coletivos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 78, p. 79:**

> Permitir a emissão de atos administrativos individuais ou coletivos conforme textos configurados pelo próprio usuário;

**Implementação:** Emitir atos para um servidor ou uma seleção de servidores usando os textos configurados pelo usuário. Documento coletivo deve identificar todos os abrangidos e vincular sua mesma emissão a cada ficha, sem gerar atos divergentes.

**Dados de outro módulo / integração:** DEP-04: emissão; DEP-08 somente quando houver trâmite configurado.

**Demonstração:** Emitir portaria individual e coletiva para três pessoas em F-ATOS; testar documento com seleção em mais de uma página e conferir as referências.

**Aceite técnico:** As duas modalidades são emitidas com dados completos da seleção e modelo correto.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


### Vale Transporte


<a id="rhf-079"></a>
#### RHF-079 — Empresas fornecedoras de vale-transporte

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 79, p. 79:**

> Permitir o cadastramento das empresas que fornecem o vale transporte;

**Implementação:** Identificar as empresas fornecedoras do benefício no cadastro compartilhado, com dados necessários à seleção dos passes/roteiros. Não criar fornecedor fiscal concorrente ao de Compras.

**Dados de outro módulo / integração:** DEP-02: pessoa/fornecedor; parâmetros do benefício são deste RH.

**Demonstração:** Cadastrar/selecionar duas empresas DEMO e relacioná-las a tipos de passes em F-VT.

**Aceite técnico:** Fornecedores são recuperáveis no controle de VT e não se confundem com bancos pagadores.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-080"></a>
#### RHF-080 — Roteiros de utilização dos passes

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 80, p. 79:**

> Permitir a controle dos roteiros para os quais serão utilizados os passes;

**Implementação:** Manter roteiros do vale-transporte, relacionando percurso, tipos de passe e fornecedor. Tratar como deslocamento do servidor ao trabalho, independente das rotas de veículos de Frotas.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Criar roteiro principal e percurso adicional de F-VT, associando passes distintos e consultando a utilização por servidor.

**Aceite técnico:** O controle identifica onde os passes são utilizados e alimenta a requisição, sem necessidade de GPS.

**Atenção / limite:** Não reutilizar o cadastro de Frotas como obrigação nem criar roteirização/mapa.


<a id="rhf-081"></a>
#### RHF-081 — Quantidade diária e percursos adicionais de VT

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 81, pp. 79–80:**

> Permitir o registro da quantidade de passes diários utilizados pelo servidor no percurso de ida e volta ao trabalho com possibilidade de adição de passes para outros percursos, no caso de servidores que se deslocam para mais que um local de trabalho;

**Implementação:** Registrar passes diários de ida e volta por roteiro e servidor, permitindo adicionar outros percursos para múltiplos locais de trabalho. Guardar quantidades por tipo sem fundir tarifas diferentes.

**Dados de outro módulo / integração:** DEP-03: local de trabalho quando já disponível; roteiros/quantidades são do RH.

**Demonstração:** F-VT: dois passes diários no principal e dois adicionais em cinco dias definidos. Conferir a composição antes da apuração dos dias úteis.

**Aceite técnico:** A requisição suporta mais de um local/percurso e conserva a quantidade de cada passe.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-082"></a>
#### RHF-082 — Mapa de compra de vales-transporte

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 82, p. 80:**

> Gerar mapa de compra de vales-transporte com a quantidade e o valor, discriminados por tipo de passe, baseado na informação dos passes requisitados por cada servidor e os dias úteis do período a ser utilizado;

**Implementação:** Calcular quantidade e valor por tipo de passe a partir das requisições, dias úteis e calendário aplicável, considerando ocorrências que afetem a necessidade. Emitir o mapa com a composição, sem gerar ordem de compra automaticamente.

**Dados de outro módulo / integração:** DEP-04: relatório; DEP-03: calendário/local quando compartilhados.

**Demonstração:** Em F-VT, após sete dias não elegíveis de 22, emitir 30 passes principais a R$ 5 e dez adicionais a R$ 4: total 40 passes/R$ 190.

**Aceite técnico:** Quantidades e valores por tipo conciliam com requisições/calendário; o mapa não soma apenas o que está visível na tabela.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-083"></a>
#### RHF-083 — Rubricas de desconto e restituição de VT

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 83, p. 80:**

> Permitir a configuração dos códigos para desconto e restituição de vale transporte em folha de pagamento;

**Implementação:** Parametrizar os códigos de rubrica para desconto e restituição, vinculados ao regime/incidências corretos. Validar códigos existentes e distinguir crédito de desconto; não permitir duas rubricas ativas para apropriar duas vezes o mesmo fato.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Configurar VT-D e VT-R de F-VT, gerar desconto após entrega e restituição autorizada de R$ 10 em ensaio isolado.

**Aceite técnico:** A natureza e o código de cada lançamento estão corretos, com memória da configuração usada.

**Atenção / limite:** Percentuais e condições de desconto/restituição são configuração legal; não fixar taxa universal por este item.


<a id="rhf-084"></a>
#### RHF-084 — Mapa de entrega por servidor

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 84, p. 80:**

> Gerar mapa de entrega de passes para cada servidor baseado na informação dos passes requisitados e os dias úteis do período a ser utilizado;

**Implementação:** Gerar mapa de entrega individualizado por servidor, tipo de passe, quantidade e período a partir da mesma apuração de requisições/dias úteis. Diferenciar compra planejada de entrega registrada.

**Dados de outro módulo / integração:** DEP-04: emissão; controle do benefício é do RH.

**Demonstração:** Emitir F-VT para o titular e grupo; comparar cada linha com a quantidade calculada e registrar a entrega pertinente.

**Aceite técnico:** O documento permite conferir o que será/foi entregue por servidor, sem tratar mapa emitido como entrega concluída.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-085"></a>
#### RHF-085 — Redução de VT por faltas, férias e licenças

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 85, p. 80:**

> Controlar a entrega de passes reduzindo a quantidade/créditos em casos de faltas, férias, licenças e afastamentos;

**Implementação:** Integrar o controle de entrega ao calendário e às ocorrências funcionais para reduzir dias/quantidades elegíveis. Não subtrair duas vezes o mesmo dia quando ocorrências se sobrepõem. Caso a entrega já esteja concluída, usar ajuste rastreável, não apagar o movimento anterior.

**Dados de outro módulo / integração:** Dados de Ponto, Férias e Afastamentos do próprio módulo; DEP-05 para fatos originados em pedidos do Portal.

**Demonstração:** F-VT: 22 dias previstos menos 2 faltas, 3 férias e 2 de licença distintos =15. Testar sobreposição de dois motivos no mesmo dia: uma só redução.

**Aceite técnico:** A entrega reflete as ausências reais e o histórico preserva eventual correção.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-086"></a>
#### RHF-086 — Desconto de VT gerado pela entrega

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 86, p. 80:**

> Gerar automaticamente informação para desconto do vale transporte em folha de pagamento após lançamento da entrega dos passes;

**Implementação:** A entrega confirmada dos passes produz informação de desconto na folha, usando códigos/regra vigentes e vínculo ao movimento. Guardar base, quantidade e valor; retentativa não cria outra verba. Mapa de compra sozinho não dispara desconto.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Em F-VT, confirmar R$ 190 de passes; na regra DEMO de 5% sobre R$ 3.000 limitada ao custo, obter R$ 150 de desconto. Repetir confirmação e verificar uma só origem.

**Aceite técnico:** A folha recebe a verba após a entrega e concilia com sua origem; não depende de digitação manual de outra rubrica.

**Atenção / limite:** 5% é apenas regra fictícia para testar o encadeamento, não percentual legal. Parametrizar a regra validada para produção.


### Contagem de Tempo de Serviço


<a id="rhf-087"></a>
#### RHF-087 — Contagem para adicional por tempo de serviço

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 87, p. 80:**

> Calcular o tempo de efetivo exercício para fins de Adicional por Tempo de Serviço, abatendo as faltas injustificadas e as licenças não contadas como efetivo exercício, emitindo certidão para concessão e atualização do percentual concedido para pagamento em folha, controlando os períodos aquisitivos, prorrogando ou cancelando os mesmos, por motivo de excesso de ausências em relação ao limite estabelecido;

**Implementação:** Calcular efetivo exercício para ATS com faltas/afastamentos que não contem nessa finalidade, controlando períodos aquisitivos, prorrogação ou cancelamento conforme limites. Emitir certidão e atualizar o percentual concedido para folha através de evento versionado, não editar folha passada.

**Dados de outro módulo / integração:** DEP-04: certidão; contagem/afastamentos/verbas são do RH.

**Demonstração:** F-TEMPO: 273 dias civis menos dez não contáveis =263; na regra DEMO de requisito 260, gerar concessão/certidão. Testar em cópias as regras de prorrogação e cancelamento por excesso.

**Aceite técnico:** Memória mostra dias contados/excluídos, período e decisão; percentual concedido chega à folha uma vez, na vigência correta.

**Atenção / limite:** Regra DEMO não representa anuênio/quinquênio municipal. Limites, percentuais e atos dependem do estatuto fornecido.


<a id="rhf-088"></a>
#### RHF-088 — Contagem para aquisição de férias

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 88, p. 80:**

> Calcular o tempo de efetivo exercício para fins de Férias, abatendo as faltas injustificadas e as licenças não contadas como efetivo exercício, concedendo os dias de direito de gozo de férias, controlando os períodos aquisitivos, prorrogando ou cancelando os mesmos, por motivo de excesso de ausências em relação ao limite estabelecido;

**Implementação:** Usar a contagem específica de férias, excluindo faltas/licenças configuradas para essa finalidade e atribuindo dias de direito. Permitir efeito de prorrogar ou cancelar períodos por excesso de ausências, com memória e preservação do histórico.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Executar F-TEMPO-FER com interrupção que só afeta férias; conferir data/condição aquisitiva, dias concedidos e cenários de prorrogação/cancelamento.

**Aceite técnico:** O saldo de férias deriva da regra de contagem pertinente, sem copiar automaticamente o acumulador de ATS.

**Atenção / limite:** Não aplicar universalmente regras da CLT aos regimes estatutários. Relacionar cada regra à vigência/regime.


<a id="rhf-089"></a>
#### RHF-089 — Contagem para progressão salarial

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 89, p. 80:**

> Calcular o tempo de efetivo exercício para fins de Progressão Salarial, abatendo as faltas injustificadas e as licenças não contadas como efetivo exercício, emitindo certidão para concessão e atualização do salário para pagamento em folha, controlando os períodos aquisitivos, prorrogando ou cancelando os mesmos, por motivo de excesso de ausências em relação ao limite estabelecido;

**Implementação:** Apurar efetivo exercício para progressão com exclusões específicas, períodos aquisitivos e limites que permitam prorrogar/cancelar. Emitir certidão e registrar mudança salarial concedida, com nova vigência e referência à progressão.

**Dados de outro módulo / integração:** DEP-04: certidão; referências/carreiras são dados de RH.

**Demonstração:** Em F-TEMPO-PROG, atingir o requisito configurado, emitir certidão e atualizar referência; repetir o cálculo sem conceder outra progressão. Testar ausência impeditiva em cenário isolado.

**Aceite técnico:** Contagem, certidão e atualização salarial são vinculadas e auditáveis; recalcular não aplica aumentos sucessivos indevidos.

**Atenção / limite:** A regra de progressão não será inventada pelo agente; não basta a nota de avaliação ou nome do cargo.


<a id="rhf-090"></a>
#### RHF-090 — Certidão de tempo para aposentadoria

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 90, pp. 80–81:**

> Calcular o tempo de efetivo exercício para fins de Aposentadoria, abatendo as faltas injustificadas e as licenças não contadas como efetivo exercício, emitindo certidão demonstrando o tempo de efetivo exercício até a data atual. Permitir a informação de tempos anteriores oriundos de outros órgãos, consolidando todo o tempo na certidão para fins de aposentadoria.

**Implementação:** Apurar tempo até a data de referência, abatendo ocorrências não contáveis e consolidando períodos anteriores aceitos para a finalidade. Mostrar composição por origem, intervalos e exclusões, detectando sobreposições; emitir certidão de tempo.

**Dados de outro módulo / integração:** DEP-04: documentos de averbação e certidão.

**Demonstração:** F-TEMPO: 263 dias efetivos no intervalo atual mais 365 anteriores não sobrepostos =628. Emitir certidão e conferir fontes, datas e total; testar intervalo duplicado.

**Aceite técnico:** A certidão mostra tempo atual e anterior conciliáveis, sem somar períodos coincidentes indevidamente.

**Atenção / limite:** Contagem/certidão não concede aposentadoria, não calcula benefício e não recria o módulo de Previdência retirado do TR. Regras de aproveitamento precisam de validação administrativa.


### Ponto Eletrônico


<a id="rhf-091"></a>
#### RHF-091 — Leitura de registros de relógios de ponto

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 91, p. 81:**

> Leitura de registro de relógios;

**Implementação:** Implementar adaptador para os arquivos/protocolo do relógio efetivamente identificado. Importar marcações brutas com dispositivo, identificador, data/hora e correspondência ao vínculo, preservando o original e relatório de rejeições. Reimportação reconhece o mesmo registro sem duplicar.

**Dados de outro módulo / integração:** EXT-PONTO: modelo/leiaute/acesso do relógio existente; DEP-02: correspondência da pessoa.

**Demonstração:** Em F-PONTO, importar arquivo de marcações no leiaute real identificado; conferir registros de entrada/saída, pessoa sem correspondência e reimportação. Arquivo sintético deve usar o mesmo parser, nunca inserção direta de horas prontas.

**Aceite técnico:** As marcações do relógio viram registros rastreáveis e alimentam apuração. Formato desconhecido é rejeitado explicitamente.

**Atenção / limite:** Não fabricar um REP, adquirir relógio, implantar biometria/geolocalização ou criar app de marcação. Fixture genérica só prova parser genérico; integração real requer formato/equipamento identificado.


<a id="rhf-092"></a>
#### RHF-092 — Extrato de ponto individual e coletivo

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 92, p. 81:**

> Extrato Individual ou Coletivo de Registro de Ponto;

**Implementação:** Consultar e emitir extrato por pessoa ou grupo, com marcações, datas e resultados de apuração quando disponíveis, usando os mesmos registros da leitura. Distinguir marcação original de tratamento autorizado.

**Dados de outro módulo / integração:** DEP-04: emissão; dados de Ponto são do RH, originados em EXT-PONTO.

**Demonstração:** Emitir F-PONTO para P-A e depois para o grupo; conferir a primeira/última marcação e resultados iguais aos da tela.

**Aceite técnico:** Extratos individuais e coletivos têm o recorte completo e não substituem marcações por horas digitadas sem origem.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-093"></a>
#### RHF-093 — Montagem de escalas

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 93, p. 81:**

> Montagem de Escalas;

**Implementação:** Manter escalas com dias, jornadas, intervalos e vigência, associadas aos vínculos. Suportar a escala fornecida e jornadas que atravessam meia-noite com datas explícitas; não interpretar saída do dia seguinte como batida anterior.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Criar escala diurna de F-PONTO e uma jornada noturna isolada; associar aos servidores e conferir o período esperado por data.

**Aceite técnico:** Escalas persistem e são usadas na apuração, sem alterar retroativamente uma apuração já fechada sem controle.

**Atenção / limite:** Não inventar escala legal padrão nem um otimizador automático de turnos; frequência/intervalos são dados da entidade.


<a id="rhf-094"></a>
#### RHF-094 — Regras de apuração das horas

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 94, p. 81:**

> Cadastro de regras para apuração de horas;

**Implementação:** Configurar regras por escala/regime/vigência para horas previstas, trabalhadas, intervalos, extras e ausências. Preservar marcações e memória de tratamento, validando pares incompletos e condições que exigem análise.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-PONTO: jornada prevista de 480 minutos; apurar dias normais, atraso, extra e marcação faltante, observando regras diferentes em outra escala.

**Aceite técnico:** As regras determinam resultados reprodutíveis e a marcação incompleta não gera hora fictícia para fechar o dia.

**Atenção / limite:** Não criar automaticamente adicional noturno, banco ou verba legal sem parametrização aplicável; demonstrar apenas as regras identificadas.


<a id="rhf-095"></a>
#### RHF-095 — Tolerância no ponto

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 95, p. 81:**

> Aplicação de tolerância na leitura de registro;

**Implementação:** Permitir parametrizar tolerância e modo de aplicação na leitura/apuração, preservando a hora bruta. Registrar minutos tolerados versus considerados, sem alterar fisicamente o arquivo original.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Na fixture com tolerância de cinco minutos, entrada às 08:03 trata três minutos; entrada às 08:10 gera dez de atraso segundo a regra DEMO. Alterar tolerância em versão de teste e comparar.

**Aceite técnico:** A tolerância afeta a apuração, não a evidência original. O usuário consegue identificar por que houve ou não atraso.

**Atenção / limite:** Cinco minutos e o tratamento integral do atraso maior são políticas do ensaio, não regra universal do órgão.


<a id="rhf-096"></a>
#### RHF-096 — Apuração para banco de horas ou lançamentos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 96, p. 81:**

> Apuração de horas para Banco de Horas ou Lançamentos;

**Implementação:** Encaminhar resultados de ponto ao banco de horas ou aos lançamentos de folha segundo parametrização. Manter destino e chave de origem para impedir que o mesmo extra vire simultaneamente crédito no banco e verba sem regra que permita o desdobramento.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-PONTO: +30 minutos, −10 e −480 resultam em −460 minutos no cenário de banco. Em cópia com destino folha, gerar as verbas configuradas e provar que o banco não recebeu novamente os mesmos fatos.

**Aceite técnico:** Banco e folha usam os resultados reais com destino explícito; repetição não duplica saldo/verba.

**Atenção / limite:** O texto usa “ou”. Não exigir ambos para toda ocorrência nem inventar política de compensação/expiração de horas.


<a id="rhf-097"></a>
#### RHF-097 — Faltas, atrasos, inconsistências e saldos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 97, p. 81:**

> Relatório de faltas, atrasos, registros inconsistentes e saldos.

**Implementação:** Emitir relatório com os quatro grupos, identificando servidor, período, marcação/ocorrência e resultado. Saldos devem trazer unidade e memória; inconsistência pendente não vira falta definitiva sem o tratamento previsto.

**Dados de outro módulo / integração:** DEP-04: relatórios; dados são do RH/Ponto.

**Demonstração:** F-PONTO: mostrar atraso de dez minutos, um dia de falta, um registro incompleto separado e saldo de −460 minutos dos fatos apurados. Filtrar grupo/competência e emitir.

**Aceite técnico:** Todos os grupos são consultáveis/emitíveis com correspondência à origem e sem misturar minutos com horas decimais.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


### Concurso Público


<a id="rhf-098"></a>
#### RHF-098 — Acompanhamento de concursos e processos seletivos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 98, p. 81:**

> Permitir realização e/ou o acompanhamento de concursos públicos e processos seletivos para provimento de vagas.

**Implementação:** Manter procedimento de concurso ou processo seletivo com identificação, vagas, equipe, candidatos e resultados. Adotar a capacidade de acompanhamento permitida pelo “e/ou” da fonte, sem construir plataforma de prova online para cumprir este item.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-CONC: cadastrar um concurso e um processo seletivo, abrir fases/registros disponíveis e acompanhar candidatos até a situação da vaga.

**Aceite técnico:** Os dois tipos de procedimento são acompanháveis e relacionam as informações dos itens 99–106.

**Atenção / limite:** Não incluir venda de inscrição, correção de redação por IA, fiscalização remota de prova ou banca examinadora como serviço novo.


<a id="rhf-099"></a>
#### RHF-099 — Vagas abertas no concurso

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 99, p. 81:**

> Permitir o acompanhamento de quais vagas foram abertas no concurso.

**Implementação:** Registrar vagas por concurso/cargo, quantidade e recorte pertinente, mantendo disponibilidade e resultado de provimento quando informado. Não confundir vagas criadas do quadro com todas as ofertadas nesse certame.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-CONC: ofertar duas vagas de cargo cujo quadro tem cinco; acompanhar assumida e desistida sem mudar as cinco vagas criadas no cadastro do cargo.

**Aceite técnico:** Vagas do certame e do quadro são distinguidas; o acompanhamento não depende de contar candidatos aprovados como automaticamente empossados.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-100"></a>
#### RHF-100 — Concurso para setor específico

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 100, p. 81:**

> Permitir realizar o concurso para um Setor em específico.

**Implementação:** Permitir associar concurso/processo seletivo ao setor de destino e às vagas daquele recorte, reutilizando a estrutura vigente.

**Dados de outro módulo / integração:** DEP-03: setor/estrutura do órgão.

**Demonstração:** Criar concurso para setor A e outro para B; filtrar e conferir vagas/candidatos de cada um.

**Aceite técnico:** O setor integra o cadastro e a consulta, sem ser só texto em observação.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-101"></a>
#### RHF-101 — Equipe fiscal ou comissão do concurso

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 101, p. 81:**

> Realizar o cadastro da equipe que está acompanhando o concurso, informando de qual equipe pertence, fiscal ou comissão.

**Implementação:** Manter equipe vinculada ao procedimento, identificando membros e qualificação fiscal/comissão. Reutilizar pessoas e permitir consultar a composição do procedimento.

**Dados de outro módulo / integração:** DEP-02: pessoas; DEP-01 para permissões explícitas.

**Demonstração:** F-CONC: associar dois fiscais e uma comissão, abrir os grupos e alterar um membro em cenário controlado.

**Aceite técnico:** Pessoas, equipe e função estão identificadas, sem atribuir permissões administrativas apenas pelo nome do grupo.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-102"></a>
#### RHF-102 — Candidatos inscritos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 102, p. 81:**

> Permitir informar e acompanhar os candidatos inscritos no concurso.

**Implementação:** Registrar candidatos e inscrições por procedimento/vaga, com identificação e situação de acompanhamento. Evitar duplicar a pessoa e não transformar automaticamente inscrição em vínculo de servidor.

**Dados de outro módulo / integração:** DEP-02: pessoa/candidato, quando compartilhado.

**Demonstração:** F-CONC: cadastrar candidatos A/B/C, consultar inscrições e localizar pelo nome. Conferir que o RH ainda não criou matrícula funcional só pela inscrição.

**Aceite técnico:** Inscritos são acompanháveis individualmente no certame correto.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-103"></a>
#### RHF-103 — Aprovação automática pela nota

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 103, p. 81:**

> Preencher automaticamente se o candidato foi aprovado ou não no concurso mediante a nota da prova.

**Implementação:** Configurar regra de aprovação por nota da prova do certame e determinar aprovado/não aprovado automaticamente. Guardar nota, regra e versão do resultado; aprovação não equivale a classificação final, convocação ou posse.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-CONC com mínimo DEMO 70: notas 82,69,70 retornam aprovado,não aprovado,aprovado. Alterar a nota de 69 para 71 em teste autorizado e conferir a mudança auditada.

**Aceite técnico:** O estado deriva da nota/regra configurada, não de seleção manual isolada. Limite exato de 70 é tratado corretamente.

**Atenção / limite:** Empates, pesos, títulos, reservas e classificação só seguem regras fornecidas. Não inventar critério jurídico de provimento.


<a id="rhf-104"></a>
#### RHF-104 — Identificação de vaga especial

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 104, p. 81:**

> Permitir informar se a vaga do candidato é especial.

**Implementação:** Registrar a indicação/tipo de vaga especial do candidato conforme a categoria adotada no concurso. Proteger dados pessoais sensíveis e manter a referência à regra do procedimento.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-CONC: marcar uma inscrição na vaga especial configurada e outra na ampla seleção; consultar a identificação.

**Aceite técnico:** A condição é persistida e vinculada à inscrição/vaga correta, sem inferência pela fotografia ou condição de saúde.

**Atenção / limite:** “Especial” não especifica modalidade/cota. Q-R09 deve registrar a definição; não criar regras de reserva de vagas por suposição.


<a id="rhf-105"></a>
#### RHF-105 — Assunção ou desistência da vaga

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 105, p. 81:**

> Permitir informar se o candidato assume ou desistiu da sua vaga.

**Implementação:** Registrar decisão/situação do candidato de assumir ou desistir, com data e referência quando existente. Preservar a aprovação anterior e não apagar a inscrição quando houver desistência.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-CONC: candidato A assume e C desiste. Consultar as duas situações e o histórico das vagas.

**Aceite técnico:** As duas opções são distinguíveis de aprovado/não aprovado e não geram admissão automática sem ato correspondente.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-106"></a>
#### RHF-106 — Títulos dos candidatos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 106, p. 81:**

> Permitir cadastrar os títulos informados pelos candidatos.

**Implementação:** Manter títulos declarados por candidato/inscrição, com identificação, dados e documento quando disponível. Não converter título em pontuação se o edital/regra cadastrada não a definir.

**Dados de outro módulo / integração:** DEP-04: documento do título, se apresentado.

**Demonstração:** Adicionar dois títulos ao candidato A e um ao C, reabrir e consultar a relação.

**Aceite técnico:** Os títulos ficam associados à inscrição correta e não são confundidos com qualificação de servidor já admitido.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


### Folha de Pagamento


<a id="rhf-107"></a>
#### RHF-107 — Oito tipos de folha de pagamento

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 107, p. 81:**

> Permitir o processamento das folhas de: Pagamento Mensal, Rescisão, Adiantamento de Férias, Licença Prêmio, Adiantamento Salarial, Adiantamento de Décimo Terceiro Salário, Décimo Terceiro Salário e Complementar;

**Implementação:** Implementar os oito tipos expressos em C-07 sobre o mesmo motor: mensal, rescisão, adiantamento de férias, licença-prêmio, adiantamento salarial, adiantamento de 13º, 13º e complementar. Cada tipo preserva fontes, incidências, competência, data de pagamento e compensações apropriadas. Não basta selecionar rótulos que calculam sempre a mensal.

**Dados de outro módulo / integração:** DEP-06: destinação contábil/financeira; DEP-05: publicação no Portal. O cálculo é nativo de RH/Folha.

**Demonstração:** Executar F-TIPOS, um cenário isolado para cada tipo, conferir rubricas/valores e documento gerado. Nos adiantamentos, demonstrar o abatimento posterior; na complementar, somente a diferença do fato pertinente.

**Aceite técnico:** Os oito tipos produzem folhas identificáveis e resultados próprios, com memória reprodutível e sem duplicação na consolidação.

**Atenção / limite:** Q-R01/R04: regras reais de cada regime e tributos devem ser fornecidas/validadas. Exemplos aritméticos não bastam para atestar conformidade legal da folha.


<a id="rhf-108"></a>
#### RHF-108 — Várias folhas na mesma referência

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 108, pp. 81–82:**

> Permitir o processamento de várias folhas de pagamento para a mesma referência, separando por grupo de servidores de mesmo vínculo ou mesmo regime ou mesma data de pagamento;

**Implementação:** Identificar instâncias por órgão, competência, tipo, grupo/seleção, data de pagamento e sequência conforme arquitetura. Permitir grupos por vínculo, regime ou pagamento, conservando o que cada instância apropriou. Evitar repetir base ou antecipação ao consolidar várias folhas.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Processar mensal e complementar na mesma competência de F-FOL, além de grupos por regime/data. Conferir documentos separados e consolidado de R$ 9.700 bruto/R$ 7.790 líquido no cenário mensal+complementar.

**Aceite técnico:** Instâncias coexistem e o consolidado considera fatos efetivos uma única vez, sem sobrescrever a primeira folha.

**Atenção / limite:** Agrupar não muda a pessoa ou cria benefício em dobro. Competência e data de pagamento são conceitos distintos.


<a id="rhf-109"></a>
#### RHF-109 — Rescisão calculada individual e coletivamente

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 109, p. 82:**

> Permitir o processamento de folha de rescisão individual ou coletiva com cálculos de férias indenizadas, proporcionais e 13º salário automaticamente, sem a necessidade de lançamento avulso na folha;

**Implementação:** Derivar férias indenizadas, proporcionais e 13º dos direitos/datas/eventos do vínculo e motivo de desligamento. Aplicar fórmulas por regime automaticamente, sem obrigar lançamento avulso desses componentes; descontar adiantamentos já apropriados.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Em F-RES, calcular o cenário-base com R$ 9.000 em parcelas brutas e R$ 600 de antecipação: R$ 8.400 antes de outros descontos. Repetir para dois vínculos em lote: R$ 16.800 no cenário simétrico.

**Aceite técnico:** Componentes exigidos surgem do cálculo automático e podem ser rastreados às bases/períodos. Lote equivale à soma dos cálculos individuais válidos.

**Atenção / limite:** Não aplicar verbas rescisórias da CLT a estatutário por padrão nem inventar aviso/multa. Os números DEMO não constituem rescisão legal homologada.


<a id="rhf-110"></a>
#### RHF-110 — Variáveis individuais ou por grupo

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 110, p. 82:**

> Permitir a inclusão de valores variáveis na folha como os provenientes de horas extras, empréstimos, descontos diversos e ações judiciais, para um servidor ou um grupo de servidores no caso de lançamento comum a todos;

**Implementação:** Manter lançamentos da competência para horas extras, empréstimos, descontos diversos e ações judiciais, com origem e base/rubrica pertinente. Permitir uma pessoa ou seleção de vínculos e controlar permissões, vigência e folha aberta.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Lançar hora extra no F-FOL e outros três tipos em cenários isolados, individualmente e para grupo. Recalcular e conferir memória por verba.

**Aceite técnico:** Tipos citados são representáveis e geram efeito correto no vínculo/competência; nenhuma variável fica apenas em observação.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-111"></a>
#### RHF-111 — Inclusão rápida da mesma verba para vários funcionários

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 111, p. 82:**

> Permitir a inclusão de verbas de forma rapida, incluindo a mesma verba para vários funcionarios, facilitando a inserção dos dados

**Implementação:** Oferecer grade/ação coletiva com verba comum e lista de destinatários, exibindo valor/referência por linha antes de confirmar. Reutilizar o serviço do item 110/133, com validação por servidor.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Selecionar 12 vínculos em duas páginas, aplicar verba DEMO e conferir os 12 resultados, inclusive o último. Reenvio do mesmo lote não duplica.

**Aceite técnico:** A inclusão é coletiva e abrange a seleção explícita completa sem doze formulários independentes.

**Atenção / limite:** Rapidez não elimina validação por regime ou bloqueio de folha encerrada.


<a id="rhf-112"></a>
#### RHF-112 — Lançamentos descentralizados por secretaria

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 112, p. 82:**

> Permitir o lançamento de informações para a folha de forma descentralizada, onde cada secretaria possa realizar os lançamentos apenas aos servidores nela lotados.

**Implementação:** Derivar escopo de lotação do usuário e limitar lançamentos aos servidores da secretaria autorizada na vigência pertinente. Aplicar filtro na leitura e validação na gravação, incluindo importações e lotes.

**Dados de outro módulo / integração:** DEP-01/03: usuário, secretaria e lotação histórica.

**Demonstração:** Operador do setor A lança em P-A autorizado e tenta P-B lotado em B pela API e pela seleção em lote; a segunda ação é recusada.

**Aceite técnico:** Nenhuma rota/importador contorna o escopo. A folha central continua podendo consolidar apenas com permissão adequada.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-113"></a>
#### RHF-113 — Verbas autorizadas por regime

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 113, p. 82:**

> Controlar os vencimentos e descontos permitidos em cada regime de trabalho, impossibilitando que seja efetuado o lançamento de um vencimento ou desconto exclusivo de um regime em um outro;

**Implementação:** Configurar matriz verba×regime com validade e impedir vencimento/desconto exclusivo em vínculo de outro regime. Revalidar na inclusão, importação, transferência de regime e cálculo, sem apagar lançamentos históricos válidos.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Tentar verba RP-DEMO exclusiva do regime A no vínculo B pelo formulário, lote e importador; corrigir o regime/seleção pertinente e recalcular.

**Aceite técnico:** O lançamento incompatível é bloqueado em todas as entradas; histórico anterior válido permanece consultável.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-114"></a>
#### RHF-114 — Férias derivadas de gozo/pecúnia sem dupla variável

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 114, p. 82:**

> A folha de Adiantamento de Férias deverá ser processada com as informações dos dias de pecúnia e/ou gozo lançadas nas férias, não permitindo duplicidade de lançamento em variável na folha de pagamento;

**Implementação:** Calcular a folha de adiantamento de férias a partir dos dias de gozo e/ou pecúnia registrados no módulo de férias. Vincular os eventos, terço e antecipações à mesma origem e impedir lançar novamente como variável o valor já derivado.

**Dados de outro módulo / integração:** DEP-05: solicitações aprovadas são origem remota possível; registro oficial e cálculo são do RH.

**Demonstração:** Executar F-FER-MISTO com 20 dias de gozo e dez de pecúnia na configuração DEMO. Conferir ambas as bases e tentar duplicar a rubrica de férias como variável.

**Aceite técnico:** A folha lê os dias oficiais e impede dupla apropriação, sem presumir que o simples pedido do Portal seja gozo efetivo.

**Atenção / limite:** Pecúnia, limites e direitos devem ser parametrizados por regime; o item não autoriza venda de férias universal.


<a id="rhf-115"></a>
#### RHF-115 — Salário-família automático por dependente

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 115, p. 82:**

> Gerar automaticamente os valores relativos ao salário família dos dependentes;

**Implementação:** Usar dependentes elegíveis, remuneração e tabela de benefício válida na competência para gerar automaticamente salário-família. Guardar quais dependentes/cotas compõem a verba; revalidar baixa automática e exceções do item 4.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-DEP: quota DEMO R$ 50 por dependente elegível, dois em setembro geram R$ 100; após uma baixa específica, outubro gera R$ 50. Recalcular não cria outra verba.

**Aceite técnico:** O benefício decorre da elegibilidade/tabela, não valor manual fixo em todos os vínculos.

**Atenção / limite:** Quota de R$ 50 é fictícia. Valores, limites e compensação de produção precisam das tabelas oficiais aplicáveis.


<a id="rhf-116"></a>
#### RHF-116 — Fórmulas em português e criação de verbas com regras protegidas

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 116, p. 82:**

> Possuir rotinas de cálculos através de fórmulas e expressões em português, para qualquer vencimento e desconto, tornando o cálculo da folha totalmente configurado e administrado pelo próprio usuário. Possibilitar que o próprio usuário crie novas verbas de vencimentos ou descontos, reutilizando uma já existente, configurando as incidências e a regra de cálculo. As regras de cálculo previstas em legislação federal ou estadual deverão estar no sistema e não deverão ser alteradas por usuário comum;

**Implementação:** Implementar editor parametrizável com expressões e funções legíveis em português, dicionário controlado de variáveis, incidências e dependências. Permitir criar verba a partir de outra. Usar parser seguro/AST tipada, validação de ciclos, divisão por zero e acesso a dados; nunca eval ou SQL arbitrário. Separar pacotes legais protegidos de fórmulas locais editáveis por perfil.

**Dados de outro módulo / integração:** DEP-01: permissões; EXT-REGRA: pacotes normativos versionados. O motor é objeto deste desenvolvimento.

**Demonstração:** Criar ADIC-DEMO a partir de outra verba com BASE_SALARIAL × 0,10 e obter R$ 300 sobre R$ 3.000. Alterar regra local autorizada; tentar editar regra legal como usuário comum e criar ciclo/divisão por zero.

**Aceite técnico:** O usuário autorizado administra fórmulas/novas verbas sem código, e o comum não altera regras legais. Memória informa fórmula, entradas, versão e resultado.

**Atenção / limite:** “Configurável” não significa executar código irrestrito. As regras federais/estaduais previstas devem ser carregadas com fonte e vigência; nenhuma fórmula DEMO é instalada como regra legal.


<a id="rhf-117"></a>
#### RHF-117 — Cálculo seletivo e contribuições RGPS/RPPS

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 117, p. 82:**

> Possibilitar a execução do cálculo ou recálculo de diversas formas como: Individual, por faixa de matrícula e seleção aleatória. Calcular e processar os valores relativos à contribuição individual e patronal para o RGPS (INSS) e RPPS (Previdência Municipal), de acordo com o regime previdenciário do servidor.

**Implementação:** Calcular/recalcular individualmente, por faixa de matrícula e seleção arbitrária, com a mesma consistência transacional. Calcular contribuições individual e patronal para RGPS e RPPS conforme regime/tabelas de cada vínculo e agregação por pessoa quando exigida. Encargo patronal não reduz líquido do servidor.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-FOL/F-PREV: executar as três seleções, verificar RGPS e RPPS em casos isolados e comparar cálculo individual com lote. Conferir patronal separado de desconto e dados externos do item 121.

**Aceite técnico:** Os três alcances funcionam, as duas previdências têm contribuição do servidor e patronal e os totais conciliam sem contribuição duplicada na mesma origem.

**Atenção / limite:** Q-R01/R04 exige conjunto de cálculos legais de referência. F-PREV só prova mecanismo aritmético, não alíquota real de INSS/RPPS.


<a id="rhf-118"></a>
#### RHF-118 — Importação de consignações em texto com rejeições

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 118, p. 83:**

> Permitir a importação de dados, via arquivo texto, de valores a serem consignados em folha controlando os registros válidos e rejeitados pelo processamento

**Implementação:** Importar arquivo texto no contrato identificado da consignatária, validando matrícula/vínculo, rubrica, competência, valor e estrutura. Apresentar válidos/rejeitados com linha e motivo antes da efetivação. Guardar lote, hash/origem e resultados para evitar duplicação.

**Dados de outro módulo / integração:** EXT-CONS: leiaute da consignatária; cadastros/verbas são RH.

**Demonstração:** F-IMP-TXT: arquivo com dois válidos e três erros distintos; efetivar os válidos conforme política explícita, emitir rejeições e reenviar o arquivo.

**Aceite técnico:** Dois lançamentos válidos são recuperáveis e as três rejeições têm motivos; a reimportação não gera novos descontos.

**Atenção / limite:** Não renomear CSV genérico como arquivo oficial nem alegar convênio integrado sem testar o contrato identificado.


<a id="rhf-119"></a>
#### RHF-119 — Parcelamentos de créditos/descontos e saldo no fechamento

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 119, p. 83:**

> Permitir o cadastramento de lançamentos parcelados, a crédito ou a débito, para os servidores, de forma a controlar as parcelas lançadas em folha e o saldo atual remanescente. O lançamento das parcelas em folha deve ser de forma automática, podendo ser pago ou descontado o total ou parte do valor baseado em uma fórmula de cálculo que calcule um percentual sobre a remuneração, permitindo o lançamento até o limite deste percentual, atualizando o saldo remanescente automaticamente após o encerramento da folha.

**Implementação:** Registrar lançamentos parcelados a crédito ou débito com valor, plano, saldo e fórmula de limite percentual sobre remuneração. Calcular parcela integral/parcial e saldo projetado, mas apropriar definitivamente a amortização somente no encerramento válido da folha. Controlar concorrência e reabertura autorizada sem duplo consumo.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-PARC: saldo R$ 1.200, parcela R$ 300 e limite DEMO R$ 200; cálculo não muda saldo, fechamento baixa a R$ 1.000. Próximo desconto de R$ 100 deixa R$ 900. Testar crédito de R$ 600 com pagamento de R$ 150: saldo R$ 450.

**Aceite técnico:** Crédito e débito, limite parcial, parcelas e saldo são corretos; recálculo/reenvio não amortizam novamente.

**Atenção / limite:** Fórmula/limite dependem da regra autorizada. Não criar sistema de concessão bancária de empréstimos.


<a id="rhf-120"></a>
#### RHF-120 — Importação textual de configurações contábeis

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 120, p. 83:**

> Possuir integração com o Módulo de Administração Orçamentária e Financeira, através de arquivo texto, importando as configurações contábeis das verbas de vencimento e Desconto

**Implementação:** Implementar recepção de arquivo texto do módulo orçamentário/financeiro com o mapeamento contábil das verbas de vencimento e desconto. Validar versão, código, vigência e referências, apresentando erros antes de aplicar. Não substituir silenciosamente o arquivo exigido por um campo manual.

**Dados de outro módulo / integração:** DEP-06: Contabilidade fornece contas/configurações; EXT-INT-TXT: contrato de intercâmbio interno, mesmo que no mesmo ERP.

**Demonstração:** F-CONT: importar mapeamento de três verbas e uma linha com conta inválida; conferir aceitas/rejeitada, corrigir na origem e reprocessar sem duplicar.

**Aceite técnico:** O mapeamento consumido é verificável no RH e conserva identificação de origem/versão; arquivo inválido não altera configuração ativa.

**Atenção / limite:** A direção é importar configurações para RH. RHF-145 envia fatos para a Contabilidade e é outro teste; não fundir ambos em uma única exportação.


<a id="rhf-121"></a>
#### RHF-121 — INSS com emprego fora do órgão

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 121, p. 83:**

> Possuir cálculo de INSS proporcional na folha de pagamento para servidores com emprego fora do Órgão;

**Implementação:** Consumir o registro externo do item 27 e calcular contribuição do vínculo municipal conforme a regra aplicável a múltiplos empregos, incluindo limites/base e memória. Separar pessoa/competência da matrícula para não usar o mesmo comprovante duas vezes.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Em F-PREV, usar o caso aritmético de base combinada e contribuição externa, depois um caso oficial validado. Comparar com cenário sem emprego externo e recalcular.

**Aceite técnico:** A dedução/proporção é explicável e aplicada na competência correta, sem ultrapassar limite ou zerar contribuição indevidamente.

**Atenção / limite:** Não usar fórmula genérica “descontar tudo que veio de fora” sem a regra oficial. Sem caso legal validado, registrar validação aritmética separada da normativa.


<a id="rhf-122"></a>
#### RHF-122 — Cálculo e destinação de pensão judicial em conta

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 122, p. 83:**

> Possuir rotinas de controle e cálculo para pagamento das pensões judiciais, a partir do desconto efetuado para o servidor, incluindo depósito em conta;

**Implementação:** Calcular a pensão segundo seu cadastro e gerar crédito nominal ao beneficiário a partir do desconto real do servidor. Integrar a destinação bancária/financeira disponível, preservando origem, valores e estado de pagamento. O beneficiário não é outro salário líquido do servidor.

**Dados de outro módulo / integração:** DEP-06: financeiro/tesouraria; EXT-BANCO: formato/canal de pagamento identificado.

**Demonstração:** F-FOL/F-BANCO: desconto de R$ 200 em V-A1 produz crédito de R$ 200 à pensionista na conta cadastrada. Conferir arquivo/relação e confirmação autorizada quando disponível; reenvio não duplica.

**Aceite técnico:** Desconto e destinação conciliam e o depósito não é dado por efetivado pela simples geração do arquivo.

**Atenção / limite:** A execução do depósito depende do mecanismo bancário autorizado. Simulador testa integração, mas não prova pagamento real; não movimentar dinheiro nesta preparação.


<a id="rhf-123"></a>
#### RHF-123 — Insuficiência de saldo, prioridade e consignado não descontado

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 123, p. 83:**

> Possuir rotinas de cálculo de insuficiência de saldo para servidores com estorno na folha, efetuando ajuste automático dos descontos limitados até um teto configurado pelo usuário. A prioridade dos descontos deve ser configurada pelo usuário e os valores consignados que não foram descontados deverão ser registrados possibilitando a emissão de relatórios destes valores para envio aos estabelecimentos conveniados;

**Implementação:** Aplicar limite e prioridade parametrizados aos descontos elegíveis para ajuste quando houver insuficiência, inclusive após estorno que reduza a disponibilidade. Preservar descontos obrigatórios conforme regra e registrar valores não descontados por estabelecimento/convênio, com relatório. Não truncar líquido negativo sem memória.

**Dados de outro módulo / integração:** EXT-CONS para destinatário/leiaute do relatório quando pactuado; controle do saldo é de RH.

**Demonstração:** F-INSUF: bruto R$ 1.000, descontos prioritários R$ 300, teto total DEMO R$ 800, consignados A=500/B=400; obter A=500/B=0, líquido R$ 200 e pendência B=400. Inverter prioridade em cópia: B=400/A=100, pendência A=400.

**Aceite técnico:** O ajuste é automático e explica prioridade, teto e resíduo por credor, sem apagar a dívida nem reduzir judicial/previdenciário fora da regra.

**Atenção / limite:** Limites e classes ajustáveis exigem Q-R04. Se obrigatório não couber legalmente, apresentar pendência para tratamento, não inventar compensação.


<a id="rhf-124"></a>
#### RHF-124 — Fichas financeiras históricas em papel

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 124, p. 83:**

> Possuir rotina para o cadastramento das fichas financeiras que não estão em meio magnético, ou seja, fichas financeiras que estão em papel;

**Implementação:** Disponibilizar cadastro assistido dos dados de fichas históricas em papel, por pessoa/vínculo, exercício/competência e rubrica/valor, com origem manual histórica e anexo quando disponível. Não gerar remessa bancária ou transmissão fiscal automática por digitar histórico.

**Dados de outro módulo / integração:** DEP-04: documento histórico; DEP-02: pessoa/vínculo.

**Demonstração:** F-HIST: transcrever duas competências DEMO, conferir bruto/descontos/líquido com o documento e emitir a ficha anual correspondente.

**Aceite técnico:** Dados históricos são consultáveis nos relatórios com proveniência identificada e não se tornam folha corrente a pagar.

**Atenção / limite:** O item não exige OCR. Transcrição validada é distinta de inserir valores fictícios como dados oficiais migrados.


<a id="rhf-125"></a>
#### RHF-125 — Lançamentos pendentes durante afastamento

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 125, p. 83:**

> Permitir a inclusão de lançamentos para servidores afastados sendo que estes lançamentos somente poderão ser processados na primeira folha em que o servidor retornar do afastamento. Os lançamentos ficam pendentes durante todo o período do afastamento sendo incluído automaticamente na folha somente no término do afastamento e retorno do servidor ao trabalho;

**Implementação:** Registrar variável/fato destinado a servidor afastado como pendente e liberá-lo apenas na primeira folha elegível após o fim do afastamento e retorno confirmado conforme a regra adotada. Relacionar lançamento liberado à origem e conservar a pendência em caso de prorrogação.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-RET: valor R$ 75 cadastrado durante afastamento até 14/09 fica pendente; após retorno confirmado em 15/09, entra uma única vez na primeira folha apropriada. Recalcular não libera outra vez.

**Aceite técnico:** Afastamento mantém a pendência e o retorno efetivo direciona a primeira apropriação. Data prevista sozinha não confirma retorno quando o fluxo exige conferência.

**Atenção / limite:** Não suspender automaticamente todos os vencimentos de todo afastado; a regra refere-se aos lançamentos pendentes previstos no item.


<a id="rhf-126"></a>
#### RHF-126 — Reajuste salarial global ou parcial

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 126, pp. 83–84:**

> Possuir rotina de reajuste salarial, possibilitando reajustes globais e parciais;

**Implementação:** Aplicar reajuste aos salários/referências pertinentes com seleção global ou parcial, vigência e prévia, preservando histórico e folhas fechadas. Compartilhar núcleo com RHF-015, identificando se o alvo é referência ou salário individual não tabelado.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Usar F-REF em grupos selecionados e no conjunto global; conferir valores futuros e o histórico de setembro intacto.

**Aceite técnico:** Os dois alcances funcionam sem reajuste duplo da mesma origem nem alteração retroativa silenciosa.

**Atenção / limite:** Ato, critérios e eventual efeito retroativo precisam ser definidos; não pagar diferença automaticamente sem rubrica e folha pertinente.


<a id="rhf-127"></a>
#### RHF-127 — Comparativo entre duas competências

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 127, p. 84:**

> Existir funcionalidade de comparativo de servidores entre duas competências, podendo comparar apenas um Lançamento específico, comparar o valor líquido, comparar o valor bruto de cada servidor;

**Implementação:** Comparar servidores/vínculos entre competências, com escolhas de verba específica, bruto e líquido. Usar folhas/versões selecionadas e identificar quem existe só em um lado; não comparar a primeira folha de cada mês sem explicitar o recorte.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-COMP: comparar bruto/líquido de P-A entre dois meses e a verba ADIC-DEMO; incluir um admitido e um desligado para verificar registros sem par.

**Aceite técnico:** As três medidas têm valores de origem e diferença conferíveis, sem somar folhas duplicadas nem transformar ausência em zero silencioso.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-128"></a>
#### RHF-128 — Tolerância e agrupamentos do comparativo

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 128, p. 84:**

> Permitir estipular valor para tolerância para a comparação, além de realizar a comparação por cargo, secretaria, regime, banco

**Implementação:** Adicionar valor de tolerância e filtros/agrupamentos por cargo, secretaria, regime e banco ao comparativo. Definir claramente se a inclusão de diferença usa maior que ou maior/igual; conservar valores originais no detalhe.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-COMP: diferenças absolutas de R$ 9, R$ 10 e R$ 11 com tolerância DEMO inclusiva até R$ 10; só R$ 11 fica sinalizado. Repetir os quatro recortes.

**Aceite técnico:** A tolerância e todos os recortes funcionam sobre o conjunto completo, com política de borda explícita.

**Atenção / limite:** Tolerância é de análise, não permissão para alterar ou ignorar salário divergente na folha.


<a id="rhf-129"></a>
#### RHF-129 — Provisões, baixas e estornos de férias e 13º com encargos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 129, p. 84:**

> Gerar as informações referentes aos provisionamentos, baixas e estornos de férias, 13º salário e seus respectivos encargos patronais, conforme as Normas Brasileiras de Contabilidade Aplicadas ao Setor Público.

**Implementação:** Calcular/gerar informações separadas de provisão, baixa e estorno de férias, 13º e encargos patronais a partir das bases/versionamentos de RH. Enviar eventos contábeis reconciliáveis com origem única; não contabilizar duas vezes a provisão por recalcular.

**Dados de outro módulo / integração:** DEP-06: roteiros/contas e escrituração; RH fornece base, cálculo e fatos.

**Demonstração:** F-PROV: provisão mensal DEMO de R$ 840; seis meses R$ 5.040. Baixa de R$ 2.000 deixa R$ 3.040; estornar a baixa volta a R$ 5.040. Conferir componentes e retorno contábil.

**Aceite técnico:** Os três tipos de movimento e os encargos são rastreáveis e conciliam no RH e destino contábil, sem confundir provisão com pagamento.

**Atenção / limite:** Q-R04/R05: critérios normativos e momento dos eventos precisam de validação contábil. Fórmula de teste não é política oficial de provisionamento.


<a id="rhf-130"></a>
#### RHF-130 — Diárias na folha

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 130, p. 84:**

> Permitir cadastrar as diárias do servidores, e realizando o cálculo da folha conforme o valor lançado.

**Implementação:** Registrar diárias do servidor com valor e referência/período pertinente e gerar rubrica conforme a parametrização. Reutilizar diária já registrada na origem quando houver, impedindo novo pagamento do mesmo fato.

**Dados de outro módulo / integração:** DEP-07: diária/viagem existente, somente se for origem; DEP-06 para fato financeiro.

**Demonstração:** F-FOL: diária DEMO de R$ 100 em V-B entra na folha com incidências demonstrativas configuradas; abrir a origem e repetir o processamento.

**Aceite técnico:** O valor lançado repercute uma vez no cálculo, com incidência/registro identificados.

**Atenção / limite:** Não criar agência de viagens, reserva de passagem ou tabela legal de diárias. Incidência fiscal não é presumida por usar o rótulo diária.


<a id="rhf-131"></a>
#### RHF-131 — Limite remuneratório parametrizado

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 131, p. 84:**

> Permitir o controle de limite de pagamento, não ultrapassando o padrão salarial do Prefeito/Presidente

**Implementação:** Aplicar controle do limite relacionado ao padrão do Prefeito/Presidente conforme regra e enquadramento fornecidos, com vigência, base, parcelas incluídas/excluídas e memória do ajuste. Não cortar arbitrariamente o líquido para caber no teto.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-TETO: base elegível DEMO R$ 6.300 e teto R$ 6.000 geram ajuste de R$ 300; testar parcela excluída configurada e alteração de vigência.

**Aceite técnico:** O limite atua sobre a base definida e apresenta a redução/critério, preservando os valores originais e o histórico.

**Atenção / limite:** Q-R01/R04: o TR não define hipóteses constitucionais, acumulações, parcelas ou diferença Prefeito/Presidente. Exigir definição institucional antes de validar legalmente; não universalizar o exemplo.


<a id="rhf-132"></a>
#### RHF-132 — Importação de planilhas com mapeamento de colunas

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 132, p. 84:**

> Permitir a importação de planilhas, inserido os dados diretamente no Lançamento Fixo ou Mensal, permitindo que as colunas sejam identificadas com os campos de leitura no momento da importação, sem layout prévio.

**Implementação:** Implementar upload, prévia e associação de colunas a matrícula/vínculo, verba, valor/referência, competência/vigência e destino fixo ou mensal, sem exigir ordem prévia única. Validar tipos, regime e bloqueios; evitar fórmulas executáveis da planilha. Guardar mapeamento/lote e resultado por linha.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-IMP: importar duas planilhas de teste com colunas em ordens diferentes, mapear e obter dois válidos/três rejeitados. Destinar um fixo e um mensal; reimportar sem duplicar.

**Aceite técnico:** O mapeamento é feito na interface e aplicado, com rejeições rastreáveis; não é um importador que só aceita um template imutável.

**Atenção / limite:** O requisito de importação é expresso aqui. Não reutilizar exclusões dos MDs anteriores para eliminá-lo. Formatos suportados devem ser declarados e testados, sem inventar suporte a extensão não implementada.


<a id="rhf-133"></a>
#### RHF-133 — Lançamento específico para vários servidores

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 133, p. 84:**

> Permitir a geração de lançamento específico para vários servidores.

**Implementação:** Reutilizar a ação coletiva de RHF-111/110 para gerar um lançamento específico a uma seleção de vínculos, respeitando escopo, rubrica, valor/referência e competência. Manter evidência própria deste número.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Selecionar três vínculos, gerar verba de R$ 50 e conferir total R$ 150; deixar um quarto fora e testar repetição.

**Aceite técnico:** Os três lançamentos correspondem à seleção e somam R$ 150 uma única vez, sem exigir cadastro manual por pessoa.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-134"></a>
#### RHF-134 — Licenças encerrando e verificação de retorno

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 134, p. 84:**

> Permitir que seja visualizado mensalmente, todos os servidores que estão terminando licenças, que deverão retornar ao trabalho para que se possa ser verificado o seu retorno e efetuar o pagamento.

**Implementação:** Consultar mensalmente servidores cujas licenças terminam, com término previsto, prorrogações e confirmação de retorno. Direcionar à conferência pertinente e à liberação de valores pendentes, sem assumir retorno só pela data planejada.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-RET: listar um retorno confirmado e outro prorrogado no mês; conferir que apenas o elegível libera a pendência do item 125.

**Aceite técnico:** Lista é completa no mês e permite verificar a situação real antes do pagamento, sem liberar lançamento de quem continua afastado.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-135"></a>
#### RHF-135 — Publicação integrada da execução orçamentária e financeira

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 135, p. 84:**

> Disponibilizar na internet, em tempo real, informações pormenorizadas sobre a execução orçamentária e financeira, atendendo a LAI.

**Implementação:** Fornecer os dados de folha que alimentam a execução contábil e seu recorte público, integrando aos módulos responsáveis. Demonstrar a cadeia RH→Contabilidade/Tesouraria→Transparência e atualização após fato confirmado. Não publicar anexos pessoais ou chamar total bruto de folha de despesa paga.

**Dados de outro módulo / integração:** DEP-06: execução contábil/financeira; DEP-10: Portal da Transparência; depende das fontes reais.

**Demonstração:** F-PUB: alterar/processar um fato DEMO e acompanhar sua escrituração e publicação autorizada, sem redigitar no portal. Conferir datas/valores e ausência de CID/conta bancária no público.

**Aceite técnico:** A publicação demonstra o dado real de execução e sua atualização; folha calculada não é anunciada como pagamento executado.

**Atenção / limite:** O item é amplo e remete à LAI. Q-R05/R10 define os dados e o fluxo aplicável; não criar outro Portal nem expor toda a ficha funcional para aparentar transparência.


<a id="rhf-136"></a>
#### RHF-136 — Transferência de saldo contábil — definição necessária

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 136, p. 84:**

> Permitir realizar a transferência de saldo contábil

**Implementação:** Identificar com a Contabilidade o saldo, origem, destino, exercício/competência, gatilho e efeito pretendidos. Mapear serviço e registros de contrapartida/retorno, sem implementar transferência financeira ou virada de exercício por adivinhação. Preservar o requisito e preparar a interface de integração compatível após a definição.

**Dados de outro módulo / integração:** DEP-06: Contabilidade é fonte/destino do saldo. RH implementa apenas sua participação no fluxo definido.

**Demonstração:** Após Q-R05, criar caso com saldo inicial conhecido, executar a transferência autorizada e conferir origem/destino, conservação do valor e trilha. Antes disso, registrar teste como não executável no significado definitivo.

**Aceite técnico:** Somente validar quando o objeto da transferência estiver definido e seu efeito confirmado no núcleo competente. Menu ou arquivo genérico não encerra o item.

**Atenção / limite:** Fonte extremamente resumida: não define tipo de saldo nem origem/destino. Manter AGUARDA_DEFINICAO_TR, sem preencher a lacuna silenciosamente.


<a id="rhf-137"></a>
#### RHF-137 — Fechamento da folha e imutabilidade

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 137, p. 84:**

> Permitir realizar o fechamento da folha de pagamento, evitando alterações após o encerramento da mesma.

**Implementação:** Encerrar uma instância/versionamento após validações e confirmação autorizada, congelando rubricas, bases, parâmetros e seleções. Apropriar saldos parcelados apenas uma vez nesse ato e bloquear alterações posteriores da folha. Correção posterior exige procedimento rastreável já definido, não edição direta.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-FECH: calcular, revisar e fechar; tentar alterar valor/importar variável/recalcular pela interface e API. Conferir que F-PARC foi amortizado uma vez e que uma complementar legítima continua independente.

**Aceite técnico:** Fechamento é persistido e impede alterações, com snapshot reproduzível e sem efeitos repetidos.

**Atenção / limite:** Fechamento interno não equivale ao S-1299 aceito. Não criar reabertura irrestrita como atalho; respeitar governança/configuração da entidade.


<a id="rhf-138"></a>
#### RHF-138 — Bloqueio cadastral durante o fechamento

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 138, p. 84:**

> Permitir o bloqueio no cadastro de funcionários, para evitar alterações que interfiram no momento do fechamento da folha.

**Implementação:** Aplicar bloqueio transacional ou versionamento equivalente dos dados cadastrais que interferem no fechamento, com escopo dos vínculos/processamento. Revalidar alterações concorrentes e liberar a operação de forma segura em falha; não deixar bloqueio permanente.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Duas sessões em F-FECH: uma fecha, outra altera salário/lotação relevante. A alteração é recusada ou o conflito impede fechar com base desatualizada. Após falha controlada, conferir recuperação do estado.

**Aceite técnico:** O fechamento usa um conjunto consistente de dados e não aceita corrida que altere a base no meio do cálculo.

**Atenção / limite:** Bloqueio deve proteger os dados pertinentes, não paralisar todo o ERP ou impedir indefinidamente cadastros sem relação com a folha.


### Geração de Arquivos


<a id="rhf-139"></a>
#### RHF-139 — SEFIP em TXT e validação de inconsistências

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 139, p. 84:**

> Gera arquivo SEFIP e validar as inconsistências no formato TXT para importação em software da Caixa Econômica federal;

**Implementação:** Gerar arquivo SEFIP a partir dos dados da competência aplicável, usando leiaute identificado e validações de cadastro/base/valores. Exibir inconsistências por servidor e campo; bloquear geração considerada válida quando faltar dado obrigatório.

**Dados de outro módulo / integração:** EXT-LEGADO: SEFIP/CAIXA e sua versão; dados fonte são RH/Folha.

**Demonstração:** F-ARQ-LEG: gerar arquivo de competência/uso legado definido, validar estrutura e importar no validador oficial disponível. Incluir uma linha inválida e conferir o erro antes da exportação.

**Aceite técnico:** Arquivo TXT atende ao contrato identificado e concilia com a folha de origem; mudar extensão não comprova formato.

**Atenção / limite:** Q-R06: preservar o pedido do TR sem usar SEFIP como substituto indiscriminado do fluxo atual. EXT-FGTS registra mudança oficial para órgãos públicos; confirmar competência e finalidade da demonstração.


<a id="rhf-140"></a>
#### RHF-140 — Comparação automática SEFIP/GFIP versus folha

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 140, p. 84:**

> Permitir rotina de comparação da base de dados da SEFIP/GFIP coma folha de pagamento automaticamente através do software;

**Implementação:** Comparar dados da base/arquivo SEFIP-GFIP com folha por empregador, competência, pessoa/vínculo e componentes mapeados. Mostrar ausentes, extras e diferenças de base/valor; não comparar apenas os totais gerais.

**Dados de outro módulo / integração:** EXT-LEGADO: parser do formato aplicável.

**Demonstração:** F-ARQ-COMP: duas pessoas coincidentes, uma diferença de R$ 20 e um registro ausente; executar comparação automática e abrir os detalhes.

**Aceite técnico:** O relatório aponta a pessoa/campo e os valores de ambos os lados, sem normalizar diferenças para aparentar igualdade.

**Atenção / limite:** Não equiparar por suposição todos os campos GFIP às rubricas da folha. Registrar mapeamento e período de comparação.


<a id="rhf-141"></a>
#### RHF-141 — DIRF em texto com validação e vigência

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 141, p. 85:**

> Gerar e validar as inconsistências para a DIRF, nos padrões da legislação vigente, via arquivo texto para importação no software da Receita Federal

**Implementação:** Manter geração/validação do arquivo DIRF no leiaute do ano-calendário em que for aplicável, incluindo dados de origem e críticas. Preservar rastreabilidade do requisito e registrar a compatibilização com os meios oficiais atuais, sem transmitir arquivo de período incorreto.

**Dados de outro módulo / integração:** EXT-LEGADO/EXT-DIRF: fonte RFB; DEP-06 quando houver dados tributários da origem competente.

**Demonstração:** F-ARQ-LEG: gerar uma amostra de período legado identificado, validar e reconciliar rendimentos/retenções; provocar dado inválido e conferir rejeição.

**Aceite técnico:** O gerador entrega arquivo válido para a versão/ano selecionados, ou registra dependência explícita se faltarem leiaute/validador. Não apresenta DIRF 2026 fictícia como declaração aceita.

**Atenção / limite:** A RFB informa substituição da DIRF desde o ano-calendário 2025. Q-R06 mantém a exigência contratual e a compatibilização separadas, sem apagar o item ou criar outro módulo REINF neste pacote.


<a id="rhf-142"></a>
#### RHF-142 — RAIS em texto com validação

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 142, p. 85:**

> Gerar e validar as inconsistências para a RAIS, nos padrões da legislação vigente, via arquivo texto para importação no software do SERPRO;

**Implementação:** Gerar dados/arquivo no padrão aplicável ao exercício e público definidos para a demonstração, com validação cadastral e de movimentação. Manter o registro da obrigação e suas versões históricas; não presumir que o sistema legado receba qualquer ano.

**Dados de outro módulo / integração:** EXT-LEGADO e EXT-RAIS: documentação/validador do ano aplicável.

**Demonstração:** F-ARQ-LEG: gerar a RAIS de exercício/uso compatível identificado, conferir críticos e validá-la no meio oficial disponível. Comparar vínculos/datas com RH.

**Aceite técnico:** Arquivo e críticas correspondem ao exercício definido e conservam os vínculos, não apenas lista de nomes em TXT.

**Atenção / limite:** O portal oficial informa mudança da fonte de declaração para o eSocial por grupos/anos. Definir o cenário de aceite em Q-R06; não excluir automaticamente o gerador legado descrito.


<a id="rhf-143"></a>
#### RHF-143 — Dados de admissão e rescisão para CAGED

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 143, p. 85:**

> Gerar as informações de admissão e rescisão necessárias ao CAGED, via arquivo texto, para importação no software do Ministério do Trabalho;

**Implementação:** Gerar o arquivo de admissões e desligamentos do recorte no leiaute legado aplicável, a partir dos fatos reais e suas datas. Validar códigos/campos e impedir mistura com pessoas sem movimento no período.

**Dados de outro módulo / integração:** EXT-LEGADO: documentação CAGED e aplicabilidade ao grupo/exercício.

**Demonstração:** F-ARQ-LEG: um admitido e dois desligados no mês; gerar e verificar os três movimentos no leiaute identificado, excluindo fato fora do período.

**Aceite técnico:** Arquivo preserva tipo/data do movimento e validação; não é exportação geral de servidores.

**Atenção / limite:** Q-R06: compatibilizar com obrigações substituídas pelo eSocial sem presumir que todo uso atual/retroativo do legado foi extinto. Não enviar a produção só para testar.


<a id="rhf-144"></a>
#### RHF-144 — Arquivo bancário de crédito e relação nominal

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 144, p. 85:**

> Permitir a geração de arquivos para crédito em conta, corrente ou poupança, da rede bancária, emitindo relação dos créditos contendo matrícula, nome, número da conta e valor a ser creditado;

**Implementação:** Gerar remessa para crédito em conta corrente ou poupança conforme leiaute do banco/convênio, validando titular, conta, tipo e valor. Emitir a relação contendo matrícula, nome, conta e crédito, com conciliação ao líquido devido e proteção de dados.

**Dados de outro módulo / integração:** EXT-BANCO: bancos/convênios/leiautes identificados; DEP-06 quando Tesouraria realiza o pagamento.

**Demonstração:** F-BANCO: gerar créditos dos três servidores, R$ 7.745,00, distribuídos nos bancos DEMO; testar conta corrente e poupança e um dado bancário inválido. Pensão é identificada separadamente quando incluída.

**Aceite técnico:** Remessa e relação conciliam por destinatário/banco e não incluem salário bruto como líquido. Regeneração não dispara um segundo pagamento.

**Atenção / limite:** Arquivo gerado não significa crédito efetivado. A fonte pede geração; não acrescentar API bancária universal, Pix ou iniciação de pagamento não descritos.


<a id="rhf-145"></a>
#### RHF-145 — Integração das despesas de pessoal com orçamento e financeiro

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 145, p. 85:**

> Possuir integração com o Módulo de Administração Orçamentária e Financeira,disponibilizando os dados necessários para reserva, empenho, liquidação e pagamento das despesas com pessoal, possibilitando informar datas diferentes para pagamento de convênios;

**Implementação:** Disponibilizar dados da folha para reserva, empenho, liquidação e pagamento, com órgão, custeio/fonte, natureza, beneficiários, bases e versões necessárias ao mapeamento. Permitir datas diferentes para pagamentos de convênios/consignações conforme significado definido. Registrar ida/retorno e chave do fato, sem duplicar obrigações.

**Dados de outro módulo / integração:** DEP-06: Administração Orçamentária e Financeira/Contabilidade/Tesouraria; RH é produtor dos fatos.

**Demonstração:** F-CONT: folha fechada gera dados para os quatro estágios na Contabilidade; conferir bruto, descontos, líquido e patronal sem dupla contagem. Separar datas de dois convênios e repetir o envio.

**Aceite técnico:** Os quatro estágios recebem dados pertinentes e seu resultado real fica identificável. Um status local não substitui a operação na Contabilidade.

**Atenção / limite:** Q-R05: definir contrato de integração e significado de convênios. Não recriar o livro contábil em RH; falha no destino permanece pendência.


<a id="rhf-146"></a>
#### RHF-146 — MANAD em arquivo texto

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 146, p. 85:**

> Possuir rotina de Geração de Arquivos Digitais do INSS – MANAD, possibilitando a prestação de informações via arquivo texto, conforme Instrução Normativa MPS/SRP nº 12, de 20/06/2006 – DOU de 04/07/2006;

**Implementação:** Gerar o arquivo MANAD no leiaute identificado, relacionando dados de folha e dados contábeis necessários com campos/versões da competência. Validar integridade, identificadores e totais antes de emitir.

**Dados de outro módulo / integração:** EXT-LEGADO: MANAD; DEP-06: dados contábeis requeridos.

**Demonstração:** F-ARQ-LEG: produzir arquivo de teste no esquema aplicável, validar registros e reconciliar com folha e mapeamento contábil. Rejeitar uma referência ausente.

**Aceite técnico:** Arquivo atende ao contrato MANAD explicitado e seus dados têm origem rastreável; texto genérico não encerra o item.

**Atenção / limite:** A citação normativa do TR é preservada. Confirmar versão e finalidade vigente/retroativa em Q-R06, sem inventar campos ou aprovação federal.


<a id="rhf-147"></a>
#### RHF-147 — Arquivo para cálculo atuarial

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 147, p. 85:**

> Gerar arquivo texto para utilização em cálculo atuarial;

**Implementação:** Exportar os dados necessários ao cálculo atuarial pelo leiaute acordado com o destinatário, preservando pessoas, vínculos, regimes e períodos. Minimizar informações ao contrato autorizado e registrar lote/versão.

**Dados de outro módulo / integração:** EXT-ATUARIA: leiaute/destinatário; RH fornece os dados existentes.

**Demonstração:** F-ARQ-ATU: gerar arquivo de teste segundo o dicionário fornecido e validar com a contraparte ou validador; conferir contagem de vínculos e datas.

**Aceite técnico:** Arquivo é legível pelo contrato identificado e não confunde autônomos/servidores ou vínculos simultâneos.

**Atenção / limite:** O item exige fornecer dados, não desenvolver cálculo/projeção atuarial ou sistema de benefícios do RPPS. Sem leiaute, manter dependência explícita.


<a id="rhf-148"></a>
#### RHF-148 — Gerador de arquivos TXT configurável

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 148, p. 85:**

> Permitir a geração de arquivos pré-definidos e conter os recursos de "gerador de arquivos txt", para que o próprio usuário possa montar e gerar o arquivo desejado a partir de informações administrativas no setor, em "layout" e ordem selecionada.

**Implementação:** Oferecer layouts pré-definidos e editor de composição TXT por seleção de campos permitidos, ordem, formato, separador/posições conforme o tipo configurado. Validar mapeamentos e guardar versão; não dar SQL arbitrário sobre toda a base.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-ARQ-CONFIG: usuário monta layout matrícula,nome,valor e outro com ordem diferente, gera ambos e confere colunas/posições; teste campo sem permissão.

**Aceite técnico:** O usuário cria e emite o TXT sem alteração de código, com estrutura persistida e autorização aplicada.

**Atenção / limite:** Gerador genérico não comprova cada leiaute oficial dos itens 139–147/150–152. Manter validadores específicos e dados clínicos fora do catálogo geral.


<a id="rhf-149"></a>
#### RHF-149 — Seleções salvas para arquivos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 149, p. 85:**

> Deve permitir que possam ser gravados diferentes tipos de seleção para facilitar a emissão de arquivos rotineiros.

**Implementação:** Permitir salvar filtros/seleções reutilizáveis de geração de arquivos com nome, escopo e parâmetros, reavaliando permissões e dados atuais a cada execução. Não salvar segredos ou uma cópia congelada de pessoas como se fosse filtro dinâmico.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Salvar seleção do setor A e outra de regime B; reabrir após nova sessão, gerar arquivo e conferir o conjunto. Alterar permissão do usuário e testar novamente.

**Aceite técnico:** Seleções são persistidas e aplicadas ao contexto autorizado, sem perder filtros ou vazar registros.

**Atenção / limite:** Distinguir salvar seleção de congelar lista de destinatários de uma remessa já emitida; o histórico do lote permanece imutável.


<a id="rhf-150"></a>
#### RHF-150 — Retorno e margem consignável para consignatárias

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 150, p. 85:**

> Permitir a geração de arquivo de Retorno e Margem Consignável para as empresas responsáveis pelo controle das Consignações dos servidores.

**Implementação:** Gerar arquivo de retorno dos descontos efetivos/não efetuados e informação da margem conforme leiaute e regras definidos. Usar valores após fechamento, demonstrando competência, contrato/parcela e saldo; não recalcular margem independentemente do motor da folha.

**Dados de outro módulo / integração:** EXT-CONS: leiaute de retorno/margem da empresa; dados são RH/Folha.

**Demonstração:** F-INSUF/F-PARC: emitir retorno com desconto A=500/B=0 e resíduo B=400 no cenário correspondente; validar campos e margem na regra DEMO/real identificada.

**Aceite técnico:** Retorno concilia com os descontos da folha e aponta o que não foi descontado, sem declarar liquidação do contrato.

**Atenção / limite:** Percentuais de margem e prioridades não serão inventados nem usados para conceder crédito; é informação ao sistema competente.


<a id="rhf-151"></a>
#### RHF-151 — Arquivos para crédito de alimentação/refeição

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 151, p. 85:**

> Permitir a geração de arquivos para crédito de benefícios, como Vale Alimentação e/ou Refeição

**Implementação:** Gerar arquivo para os benefícios de vale-alimentação e/ou refeição conforme fornecedor/leiaute configurado, com beneficiário, período e valor devido. Manter vínculo ao cálculo/cadastro que originou o benefício e separar isso de salário líquido bancário.

**Dados de outro módulo / integração:** EXT-BENEF: fornecedor de benefícios e leiaute; RH fornece direitos/valores configurados.

**Demonstração:** F-BEN: gerar lote de R$ 300 e R$ 250, total R$ 550, para benefícios configurados e validar no leiaute. Repetir a geração sem efetivar crédito adicional.

**Aceite técnico:** O arquivo e sua relação conciliam com beneficiários/valores da origem; pagamento/crédito externo só é confirmado com evidência pertinente.

**Atenção / limite:** O texto usa “e/ou”; suportar os tipos configurados sem exigir contratação de dois fornecedores. Não criar emissor de cartão.


<a id="rhf-152"></a>
#### RHF-152 — Arquivos de pessoal para Tribunais de Contas

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 152, p. 85:**

> Permitir a geração de arquivos para Tribunal de Contas dos estados brasileiros;

**Implementação:** Manter adaptadores por Tribunal/exercício/tipo de remessa necessários ao contrato, usando os leiautes oficiais identificados. Para este projeto, localizar primeiro a especificação aplicável ao Espírito Santo e registrar o alcance da expressão plural da fonte. Validar campos, vínculos e totais com o validador competente.

**Dados de outro módulo / integração:** EXT-TCE: leiautes/validador e autorização aplicáveis; DEP-06 se a remessa consolida dados contábeis.

**Demonstração:** F-TCE: gerar remessa DEMO do exercício definido, validar e reconciliar pessoas/folha. Alterar campo obrigatório para conferir crítica. Outros Tribunais só entram como adaptadores identificados, nunca como formato genérico supostamente universal.

**Aceite técnico:** Arquivo passa na validação do Tribunal/leiaute declarado e possui rastreabilidade; ausência da especificação mantém o item pendente.

**Atenção / limite:** Q-R06: não prometer compatibilidade com todos os estados sem implementá-la nem estreitar silenciosamente o plural. Confirmar alcance formal da POC.


<a id="rhf-153"></a>
#### RHF-153 — Relatórios específicos para SIOPE

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 153, p. 85:**

> Possibilitar a criação de relatórios específicos para o SIOPE (Sistema de Informações sobre Orçamentos Públicos em Educação).

**Implementação:** Gerar os relatórios de pessoal destinados ao SIOPE com classificação e recorte fornecidos, usando lotação/custeio/fonte e folha. Reconciliar com a Contabilidade quando envolver execução, sem considerar todo servidor da Educação como mesma categoria contábil.

**Dados de outro módulo / integração:** EXT-SIOPE: modelo/dicionário aplicável; DEP-06: classificação e execução contábil quando necessária.

**Demonstração:** F-SIOPE: selecionar grupo classificado e conferir relatório detalhado/total com os fatos de origem e layout/modelo identificado.

**Aceite técnico:** Relatório contém as informações requeridas no modelo acordado e os totais são explicáveis; não basta uma lista por secretaria.

**Atenção / limite:** Este item pede relatório específico; a geração/transmissão completa do SIOPE do módulo Contabilidade é outro escopo. Não marcá-la atendida por este relatório.


### Relatórios


<a id="rhf-154"></a>
#### RHF-154 — Avisos de férias

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 154, p. 86:**

> Permitir a emissão dos Avisos de Férias;

**Implementação:** Emitir aviso a partir de férias registradas, com servidor, período aquisitivo/gozo e dados do modelo adotado. Conservar a referência ao registro que originou o documento.

**Dados de outro módulo / integração:** DEP-04: emissão; dados de Férias são do RH.

**Demonstração:** Gerar aviso de FER-01 e de período fracionado; conferir datas/saldo de referência e abrir o PDF após recarga.

**Aceite técnico:** O aviso corresponde às férias corretas e não é uma portaria genérica sem intervalo.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-155"></a>
#### RHF-155 — Requerimento de benefício por incapacidade

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 155, p. 86:**

> Permitir a emissão do Requerimento de Benefício por Incapacidade solicitado pelo INSS;

**Implementação:** Gerar requerimento com dados funcionais e de afastamento disponíveis, no modelo aplicável solicitado pelo INSS. Distinguir dados administrativos de informação clínica que depende de profissional autorizado.

**Dados de outro módulo / integração:** EXT-DOC: formulário aplicável; DEP-04: emissão; dados de RH/SST.

**Demonstração:** Em F-AFAST, emitir requerimento DEMO e comparar campos com ficha/afastamento e modelo identificado.

**Aceite técnico:** O documento é gerado com dados reais de homologação e versão do modelo, sem informação médica inventada.

**Atenção / limite:** Não solicitar ou conceder benefício no INSS automaticamente por este item. Sem modelo definido, registrar pendência documental.


<a id="rhf-156"></a>
#### RHF-156 — Consulta de afastamentos por tipo, doença e período

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 156, p. 86:**

> Possuir consulta de afastamentos em tela ou relatório por tipo de afastamento, por doença e por período;

**Implementação:** Oferecer filtros por tipo, doença/CID e período na consulta e emissão. Aplicar autorização específica aos dados clínicos e mostrar períodos homologados/identificadores suficientes ao acompanhamento.

**Dados de outro módulo / integração:** DEP-04: relatório; origem é RH/SST.

**Demonstração:** Filtrar F-AFAST por cada critério e por combinação; conferir caso que cruza a fronteira do período segundo a regra de interseção explicitada.

**Aceite técnico:** Todos os filtros funcionam no conjunto autorizado; relatório não revela dados de saúde a perfil sem autorização.

**Atenção / limite:** Definir claramente se o período seleciona início, fim ou interseção da licença. Não usar uma condição oculta.


<a id="rhf-157"></a>
#### RHF-157 — Termo de rescisão

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 157, p. 86:**

> Permitir a emissão do Termo de Rescisão;

**Implementação:** Emitir termo vinculado ao desligamento e cálculo rescisório confirmado, com parcelas, descontos e identificações conforme modelo aplicável. Não recalcular valores no template nem fabricar comprovação de pagamento.

**Dados de outro módulo / integração:** DEP-04: modelo/geração; EXT-DOC para formulário aplicável.

**Demonstração:** F-RES: emitir termo com bruto R$ 9.000 e desconto DEMO R$ 600, comparando o líquido de R$ 8.400 antes de outras incidências do cenário.

**Aceite técnico:** Documento e cálculo coincidem, com tipo/versão de folha e pessoa corretos.

**Atenção / limite:** RHF-162 exige também atualização/padronização do formulário; compartilhar emissão mantendo os dois testes.


<a id="rhf-158"></a>
#### RHF-158 — Textos pré-definidos editáveis em relatórios

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 158, p. 86:**

> Permitir a emissão de relatórios com textos pré-definidos, para que o próprio usuário possa editar e imprimir para quem desejado.

**Implementação:** Manter modelos/textos padronizados com campos de mesclagem, permitir edição autorizada e emissão para destinatário ou seleção de pessoas. Preservar versão da emissão sem modificar todos os documentos anteriores.

**Dados de outro módulo / integração:** DEP-04: editor/modelos/relatórios.

**Demonstração:** Criar comunicado DEMO, editar trecho e emitir para P-A e grupo, conferindo dados distintos nas cópias.

**Aceite técnico:** O próprio usuário autorizado edita o texto e gera documento correto sem desenvolver novo relatório em código.

**Atenção / limite:** Não conceder execução de HTML/JavaScript/SQL irrestrito nem permitir edição arbitrária de valores calculados para aparentar outro resultado.


<a id="rhf-159"></a>
#### RHF-159 — Ficha funcional emitível

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 159, p. 86:**

> Permitir a emissão da Ficha Funcional dos servidores.

**Implementação:** Consolidar dados funcionais, vínculos e ocorrências/atos conforme o modelo usado, emitindo a ficha a partir das fontes do RH. Distinguir dados de cada vínculo e restringir anexos clínicos não pertinentes.

**Dados de outro módulo / integração:** DEP-04: documento; DEP-05 consome a consulta no Portal.

**Demonstração:** F-CAD/F-ATOS: emitir ficha de P-A e conferir vínculo antigo/atual, mudanças e atos concluídos; consultar o mesmo conteúdo no Portal permitido.

**Aceite técnico:** A ficha emitida reflete os registros reais e não perde históricos ao selecionar o último contrato.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-160"></a>
#### RHF-160 — Servidores admitidos no mês

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 160, p. 86:**

> Permitir a emissão dos servidores admitidos no mês;

**Implementação:** Gerar relação por mês da data de admissão do vínculo, com pessoa/matrícula e demais dados pertinentes ao modelo. Não filtrar pela data de digitação da ficha.

**Dados de outro módulo / integração:** DEP-04: emissão; cadastro do vínculo é fonte.

**Demonstração:** F-MOV: admissões em 31/08,01/09,30/09 e 01/10; setembro contém somente as duas datas internas, mesmo com cadastro digitado depois.

**Aceite técnico:** O recorte usa admissão e conserva inclusividade de bordas, sem omissão por paginação.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-161"></a>
#### RHF-161 — Servidores demitidos no mês

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 161, p. 86:**

> Permitir a emissão de servidores demitidos no mês;

**Implementação:** Emitir relação pela data do desligamento, identificando vínculo, motivo e pessoa conforme modelo. Vínculo encerrado continua na base e não some por filtro padrão de ativos.

**Dados de outro módulo / integração:** DEP-04: emissão.

**Demonstração:** F-MOV: desligamentos dentro/fora de setembro; emitir mês e conferir os registros, incluindo pessoa com outro vínculo ativo.

**Aceite técnico:** O recorte de desligados é correto e não depende do estado atual da pessoa como um todo.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-162"></a>
#### RHF-162 — Formulários rescisórios padronizados e atualizados

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 162, p. 86:**

> Permitir a emissão de formulários padronizados e atualizados da rescisão de contrato conforme as portarias do Governo Federal.

**Implementação:** Manter formulário e versão aplicáveis ao regime/competência conforme fontes oficiais identificadas, gerando a rescisão sem reformatar manualmente os valores. Distinguir modelo legado de modelo vigente e indicar a seleção.

**Dados de outro módulo / integração:** EXT-DOC: formulário/portaria pertinente; DEP-04: emissão.

**Demonstração:** Gerar F-RES no formulário aplicável e conferir os campos exigidos do modelo; abrir versão anterior em cenário histórico sem sobrescrever a atual.

**Aceite técnico:** Formulário emitido corresponde à especificação declarada e ao cálculo, com versão rastreável.

**Atenção / limite:** Não afirmar atualização normativa apenas por colocar a data de hoje no cabeçalho; Q-R06 exige registrar fonte/versão/aplicabilidade.


<a id="rhf-163"></a>
#### RHF-163 — Relatórios de observações dos servidores

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 163, p. 86:**

> Permitir a emissão dos relatórios de observações dos servidores

**Implementação:** Emitir observações funcionais no escopo autorizado, com servidor, data e referência pertinente, preservando filtros e autoria. Não incluir conteúdo médico sigiloso de outra coleção automaticamente.

**Dados de outro módulo / integração:** DEP-04: relatórios.

**Demonstração:** Registrar três observações DEMO em dois servidores e emitir por pessoa/período; conferir o conjunto e autor.

**Aceite técnico:** Relatório usa as observações persistidas e respeita a seleção/permissões.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-164"></a>
#### RHF-164 — Certidão de tempo de serviço

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 164, p. 86:**

> Permitir a emissão da certidão de tempo de serviço

**Implementação:** Emitir certidão usando a contagem e finalidade selecionadas nos itens 87–90, mostrando períodos, origens e exclusões. Não recomputar um total genérico diferente dentro do relatório.

**Dados de outro módulo / integração:** DEP-04: emissão; contagem é RH.

**Demonstração:** F-TEMPO: emitir certidão de efetivo exercício e a que inclui averbação para finalidade autorizada; comparar 263 e 628 dias nos respectivos cenários.

**Aceite técnico:** O documento identifica finalidade/data e concilia com a memória de contagem, sem contar o mesmo intervalo duas vezes.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-165"></a>
#### RHF-165 — Folha analítica individual por processamento ou consolidada

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 165, p. 86:**

> Permitir a emissão da Folha Analítica por folha processada ou Consolidada, todas as folhas processadas no mês;

**Implementação:** Emitir a folha analítica de uma instância ou de todas as instâncias selecionadas do mês, com rubricas por vínculo e totais. Usar versões efetivas e distinguir canceladas/substituídas para não duplicar valores.

**Dados de outro módulo / integração:** DEP-04: relatórios.

**Demonstração:** F-FOL: emitir mensal; depois mensal+complementar. Conferir bruto R$ 9.650→9.700 e líquido R$ 7.745→7.790.

**Aceite técnico:** Analítica separada e consolidada conciliam por pessoa/verba e não somam novamente adiantamentos já compensados.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-166"></a>
#### RHF-166 — Mapa financeiro de vencimentos e descontos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 166, p. 86:**

> Permitir a emissão do Mapa Financeiro com o resumo dos vencimentos e descontos de todas as folhas com possibilidade de, dentro do mês, emitir das folhas separadamente ou consolidando os valores em um único resumo;

**Implementação:** Gerar resumo por rubrica de proventos e descontos de cada folha ou conjunto de folhas no mês, conservando totais de bruto/desconto/líquido. Encargo patronal deve aparecer separado, não como desconto do servidor.

**Dados de outro módulo / integração:** DEP-04: relatórios.

**Demonstração:** F-FOL consolidado: bruto R$ 9.700, descontos R$ 1.910, líquido R$ 7.790 e patronal R$ 1.900 em bloco distinto; comparar ao analítico.

**Aceite técnico:** Mapa e analítica têm os mesmos totais para o mesmo recorte, sem tratar patronal como desconto.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-167"></a>
#### RHF-167 — Resumo líquido por banco

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 167, p. 86:**

> Permitir a emissão do resumo dos valores líquidos da folha por banco ;

**Implementação:** Agrupar os créditos líquidos da folha por banco/conta selecionados, distinguindo servidores de beneficiários de pensão e demais destinatários quando apresentados. Conciliar com o arquivo bancário de mesma versão.

**Dados de outro módulo / integração:** EXT-BANCO para leiaute da remessa correlata; DEP-04: relatório.

**Demonstração:** F-BANCO: banco A tem R$ 4.330 de servidores e banco B R$ 3.415; total R$ 7.745. Pensão de R$ 200 aparece separada se incluída no lote ampliado.

**Aceite técnico:** Resumo bancário e remessa conciliam e não incluem proventos brutos nem descontos de terceiros como salário.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-168"></a>
#### RHF-168 — Informe de rendimentos com e sem IRRF

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 168, p. 86:**

> Permitir a emissão do Informe de Rendimentos para servidores com retenção de Imposto de Renda na Fonte e para aqueles que não tiveram retenção;

**Implementação:** Gerar informe para quem teve e quem não teve retenção, usando fonte pagadora, ano-calendário e classificação fiscal correta dos rendimentos/descontos. Agregar vínculos conforme leiaute/regra aplicável, sem confundir ficha financeira anual ou soma do líquido com informe fiscal.

**Dados de outro módulo / integração:** EXT-DOC: leiaute RFB aplicável; DEP-05: Portal consome; classificação e bases são deste RH.

**Demonstração:** F-INFORME: emitir para um servidor com retenção e outro sem; conferir campos e categorias no modelo RFB aplicável e a mesma versão disponibilizada ao Portal.

**Aceite técnico:** Os dois casos produzem documento correto para o ano/fonte e valores reconciliáveis às classificações de origem.

**Atenção / limite:** Informe é documento, não transmissão DIRF. EXT-DIRF registra substituição da obrigação de declaração sem dispensar a emissão do informe; Q-R06 define modelo/ano.


<a id="rhf-169"></a>
#### RHF-169 — Histórico completo de pagamentos e descontos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 169, p. 86:**

> Manter histórico para cada servidor com detalhamento de todos os pagamentos e descontos, permitindo consulta ou emissão de relatórios;

**Implementação:** Consultar e emitir o histórico financeiro por servidor/vínculo/competência/tipo de folha, mostrando parcelas, descontos e referências de pagamento disponíveis. Preservar anos e folhas anteriores sem limitar ao saldo atual.

**Dados de outro módulo / integração:** DEP-06: retorno de pagamento quando exigido na consulta; DEP-05: ficha anual do Portal.

**Demonstração:** F-HIST: duas competências de P-A totalizam bruto R$ 6.600, descontos R$ 1.520 e líquido R$ 5.080; conferir meses e incluir vínculo anterior em consulta separada.

**Aceite técnico:** Cada parcela pode ser rastreada ao fato e versão; folha calculada e pagamento confirmado permanecem distinguíveis.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-170"></a>
#### RHF-170 — Contracheques com mensagens por destinatário

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 170, p. 86:**

> Permitir a emissão dos contracheques, permitindo a inclusão de textos e mensagens em todos os contracheques, para determinados servidores ou para um grupo de servidores selecionados;

**Implementação:** Gerar contracheque por competência/tipo/vínculo, incluindo texto para todos, alguns ou grupo selecionado. Aplicar escopo das mensagens sem alterar cálculo e disponibilizar a versão apropriada ao Portal com referência de autenticidade já existente.

**Dados de outro módulo / integração:** DEP-04: gerador/documento; DEP-05: PSV-003/004 consomem emissão/verificação.

**Demonstração:** F-FOL: emitir contracheques dos três servidores; mensagem global aparece em todos, individual só em P-A e de grupo só na seleção. Conferir proventos/descontos/líquido.

**Aceite técnico:** Valores coincidem com a folha e mensagens respeitam destinatário; não há documento fixo para qualquer matrícula.

**Atenção / limite:** Não recriar Portal nem permitir que mensagem livre altere total ou assinatura. Nenhum dado médico será incluído em mensagem coletiva.


<a id="rhf-171"></a>
#### RHF-171 — Guia de INSS por recorte e competência 13

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 171, pp. 86–87:**

> Permitir a emissão Guia de Recolhimento de INSS com opções de quebra por centro de custo, secretarias, permitindo imprimir somente a Guia de INSS de valores do mês, bem como a Guia de INSS com valores da competência 13.

**Implementação:** Consolidar contribuições aplicáveis à guia e permitir recorte por centro de custo/secretaria, mês ou competência 13, conforme o formato e fluxo oficial identificado. Separar relatório demonstrativo de documento de recolhimento válido.

**Dados de outro módulo / integração:** EXT-GUIAS/EXT-DOC: especificação do recolhimento aplicável; DEP-06: integração de obrigação financeira.

**Demonstração:** F-GUIAS: gerar demonstrativo mensal e de competência 13 com quebras; conferir bases, contribuição individual/patronal e arquivo/documento aplicável, sem misturá-los.

**Aceite técnico:** Os recortes e a competência 13 estão disponíveis e conciliam. Documento só é chamado guia válida se atender ao padrão de recolhimento identificado.

**Atenção / limite:** Q-R06: não emitir GPS genérica para toda competência/regime sem verificar o meio atual. DCTFWeb/serviço competente, quando aplicável, é uma compatibilização a identificar, não um módulo completo inventado aqui.


<a id="rhf-172"></a>
#### RHF-172 — Recibos de pensão judicial

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 172, p. 87:**

> Permitir a emissão de recibos para pagamento de pensão judicial;

**Implementação:** Emitir recibo vinculando servidor de origem, beneficiário, valor e pagamento/competência, com estado claramente identificado. Não certificar recebimento/depósito apenas porque a folha descontou a pensão.

**Dados de outro módulo / integração:** DEP-06/EXT-BANCO: confirmação do pagamento; DEP-04: emissão.

**Demonstração:** F-BANCO: após o estado de pagamento autorizado, emitir recibo de R$ 200 ao beneficiário correto; antes disso, documento de previsão não poderá afirmar quitação.

**Aceite técnico:** Recibo corresponde ao fato e beneficiário e concilia ao desconto/destinação, com status verdadeiro.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-173"></a>
#### RHF-173 — Guia da Previdência Municipal

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 173, p. 87:**

> Permitir a emissão de Guia de Recolhimento de Previdência Municipal;

**Implementação:** Gerar a guia/demonstrativo no modelo do RPPS aplicável, separando base, contribuição individual, patronal e competência. Não reutilizar indiscriminadamente o leiaute do RGPS.

**Dados de outro módulo / integração:** EXT-GUIAS: RPPS/modelo local; DEP-06 quando o pagamento é realizado na Tesouraria.

**Demonstração:** F-GUIAS: emitir cenário RPPS e comparar rubricas/bases da folha; verificar que o servidor RGPS não compõe a guia municipal.

**Aceite técnico:** Regime e valores da guia conciliam ao conjunto de vínculos correto, no modelo identificado.

**Atenção / limite:** Não criar concessão de aposentadoria nem considerar modelo livre homologado pelo RPPS sem validação.


<a id="rhf-174"></a>
#### RHF-174 — Relação dos salários de contribuição padrão INSS

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 174, p. 87:**

> Permitir a emissão da relação do Salários de Contribuição padrão INSS;

**Implementação:** Emitir relação de salários de contribuição por servidor/período no padrão identificado, separando base contributiva de proventos totais e líquido. Guardar critério de competência/ano e fonte dos valores.

**Dados de outro módulo / integração:** EXT-DOC: padrão INSS aplicável; DEP-04: relatório.

**Demonstração:** F-PREV/F-GUIAS: comparar a base de V-B, que exclui diária na fixture, com seu bruto; emitir relação e conferir o modelo.

**Aceite técnico:** A relação usa bases efetivas e padrão declarado, sem copiar salário contratual para todos os meses.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-175"></a>
#### RHF-175 — Folha completa com quatro quebras mínimas

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 175, p. 87:**

> Emitir relatório de folha de pagamento completas com as opções de quebra por no mínimo:
> a) Banco
> b) Cargo
> c) Regime
> d) Lotações

**Implementação:** Emitir folha completa agrupada por banco, cargo, regime e lotações, independentemente ou nas combinações suportadas. Totais gerais devem permanecer iguais para a mesma seleção; não duplicar pessoa por joins de históricos.

**Dados de outro módulo / integração:** DEP-04: emissão; dados histórico-funcionais da competência no RH.

**Demonstração:** Emitir F-FOL quatro vezes, uma por cada quebra. Conferir total bruto R$ 9.650, desconto R$ 1.905 e líquido R$ 7.745 em todas.

**Aceite técnico:** As quatro opções expressas existem e produzem agrupamentos corretos com totais conciliados.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-176"></a>
#### RHF-176 — Relatório com bases, demissões e patronal

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 176, p. 87:**

> Emitir relatório de folha de pagamento com no mínimo as seguintes informações:
> a) Base de valores;
> b) Datas de Demissão;
> c) Valores Patronais de Previdência.

**Implementação:** Incluir bases de valores, datas de demissão e valores patronais de previdência em relatório de folha, com identificação do servidor/vínculo e recorte. Não omitir demitidos por filtro de ativos nem misturar encargo patronal no líquido.

**Dados de outro módulo / integração:** DEP-04: relatório.

**Demonstração:** Emitir F-FOL e um cenário com desligado; conferir base contributiva, data de desligamento e patronal individual/total de R$ 1.890 no cenário-base.

**Aceite técnico:** Os três grupos de informação estão presentes com origem correta, não apenas em título de coluna vazia.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-177"></a>
#### RHF-177 — Gerador de relatórios pelo usuário

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 177, p. 87:**

> Permitir com que o usuário monte seu próprio relatório, a partir de informações administrativas no setor, em "layout" e ordem selecionada, contendo recursos de "gerador de relatório".

**Implementação:** Permitir montar relatório por campos autorizados, layout/ordem, filtros e agrupamentos disponíveis no domínio RH. Persistir a configuração e gerar a consulta/saída real, evitando SQL livre e acesso a dados clínicos por um catálogo genérico.

**Dados de outro módulo / integração:** DEP-04: mecanismo de relatórios existente; as fontes/campos de RH são deste pacote.

**Demonstração:** F-REL: selecionar matrícula,nome,cargo,bruto; mudar ordem, filtrar secretaria e emitir. Trocar para grupo de consulta sem permissão de valores e conferir o bloqueio.

**Aceite técnico:** O usuário autorizado cria relatórios sem desenvolvimento adicional, com filtros executados no servidor e exportação do recorte completo.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-178"></a>
#### RHF-178 — Gráficos configuráveis para administração

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 178, p. 87:**

> Permitir que o próprio usuário monte gráficos para a administração

**Implementação:** Oferecer seleção de dimensão e medida do domínio autorizado para montar gráficos a partir de consultas reais. Identificar unidade, período e filtros, com possibilidade de detalhar a origem pelo relatório existente.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-REL: criar gráfico de quantidade por regime e outro de proventos por secretaria, mudar filtros e conferir totais com o relatório.

**Aceite técnico:** O usuário monta e recupera configurações; valores mudam com a base, não são gráfico fixo de demonstração.

**Atenção / limite:** Não criar um BI universal ou modelo preditivo. O gerador atende às informações administrativas do RH descritas.


<a id="rhf-179"></a>
#### RHF-179 — PPP baseado no histórico

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 179, p. 87:**

> Deve emitir o Perfil Profissiográfico Previdenciário – PPP, baseado no histórico do servidor;

**Implementação:** Gerar PPP a partir do histórico funcional/ocupacional documentado, incluindo períodos e informações do modelo aplicável. Usar dados efetivamente fornecidos por responsável competente; uma associação de EPI não permite inferir eficácia nem neutralização de risco.

**Dados de outro módulo / integração:** EXT-DOC/EXT-SST: modelo PPP e dados técnicos autorizados; DEP-04: emissão.

**Demonstração:** F-SST: duas lotações/períodos e informações técnicas DEMO documentadas; emitir PPP e conferir a cronologia e lacunas indicadas.

**Aceite técnico:** Documento reflete o histórico e o modelo identificado, sem completar exposição, laudo ou responsável por suposição.

**Atenção / limite:** Emissão local não equivale a envio/validação de PPP eletrônico no sistema oficial. Q-R08 define a aplicação atual e as integrações necessárias.


<a id="rhf-180"></a>
#### RHF-180 — Seleções salvas para relatórios

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 180, p. 87:**

> Deve permitir que possam ser gravados diferentes tipos de seleção para facilitar a emissão de relatórios rotineiros.

**Implementação:** Permitir salvar e recuperar filtros/seleções de relatórios, com nome e escopo do usuário. Reavaliar permissões ao executar e distinguir competência fixa de relativa quando houver essa opção no padrão existente.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Salvar seleção de folha do setor A e outra de afastamentos autorizados; reabrir em nova sessão e emitir, depois retirar permissão para comprovar bloqueio.

**Aceite técnico:** Filtros são reutilizáveis sem conceder acesso além do perfil, com contexto preservado.

**Atenção / limite:** Não duplicar o gerador de seleções do item 149; compartilhar mecanismo, mantendo resultados de arquivo e relatório distintos.


### E-social


<a id="rhf-181"></a>
#### RHF-181 — Arquivo de qualificação cadastral por recortes

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 181, p. 87:**

> Permitir a geração do arquivo de qualificação cadastral dos servidores, podendo essa geração ser com quebras de secretarias, situações de servidores, para envio ao e-Social.

**Implementação:** Gerar arquivo de qualificação cadastral segundo o leiaute/uso identificado, permitindo quebras por secretaria e situação do servidor. Registrar versão, dados de origem e contagem; não supor que o serviço oficial recebe novos lotes hoje.

**Dados de outro módulo / integração:** EXT-CQC: contrato de arquivo e disponibilidade do serviço de qualificação.

**Demonstração:** F-CQC: selecionar secretaria/situação, gerar arquivo de teste válido no leiaute legado identificado e conferir exclusões. Teste de envio só ocorre se houver serviço oficial apto/autorizado.

**Aceite técnico:** Gerador e recortes são demonstráveis; aceitação/transmissão oficial deve ser registrada separadamente.

**Atenção / limite:** A página oficial consultada informa suspensão para novas consultas em lote. Manter o requisito e solicitar definição de aceite em Q-R07; não chamar simulador de Dataprev/eSocial oficial.


<a id="rhf-182"></a>
#### RHF-182 — Retorno da qualificação, divergências e orientação

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 182, pp. 87–88:**

> Permitir importar o arquivo de qualificação cadastral (retorno do e- Social) ao sistema, mostrando as divergências encontradas nos dados dos servidores, e ainda orientação de como deverá ser solucionado essas divergências.

**Implementação:** Importar arquivo de retorno correlato ao lote de qualificação, identificar pessoa/campo divergente e fornecer orientação administrativa correspondente ao código de erro. Preservar original, linha e referência do lote; não corrigir identidade automaticamente por texto do erro.

**Dados de outro módulo / integração:** EXT-CQC: retorno no leiaute identificado, real histórico ou fixture explicitamente sintética.

**Demonstração:** F-CQC: retorno de teste com pessoa consistente e outra com divergência; abrir orientação, corrigir pela ficha autorizada e importar novamente sem duplicar ocorrências.

**Aceite técnico:** Retorno é interpretado por pessoa e traz orientação vinculada ao problema, não apenas “arquivo processado”.

**Atenção / limite:** O importador pode ser testado com retorno histórico/fixture, mas isso não prova serviço oficial disponível. Q-R07 permanece explícita.


<a id="rhf-183"></a>
#### RHF-183 — Empregador e estabelecimentos — S-1000/S-1005

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 183, p. 88:**

> Permitir realizar a configuração dos dados da empresa, conforme cada forma de trabalho da entidade, para geração dos eventos S-1000 e S-1005.

**Implementação:** Configurar dados de empregador/órgão público e estabelecimentos/unidades conforme leiaute aplicável, gerar os eventos citados com validade e IDs próprios. Relacionar a configuração ao órgão real e ao ambiente, sem dados fixos globais.

**Dados de outro módulo / integração:** DEP-03: identificação institucional; EXT-ESOC: esquemas/tabelas/ambiente e credenciais autorizadas.

**Demonstração:** F-ESOC: configurar empregador DEMO autorizado em homologação, gerar S-1000 e S-1005, validar estrutura/regras e conferir versões de dados.

**Aceite técnico:** Os dois eventos são produzidos a partir das configurações e passam no validador do pacote identificado; envio/recibo é outra etapa.

**Atenção / limite:** Não confundir estabelecimento e lotação nem criar certificados em nome da Prefeitura. Registrar pacote/ambiente/competência usados.


<a id="rhf-184"></a>
#### RHF-184 — Rubricas e incidências — S-1010

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 184, p. 88:**

> Permitir a configuração das rubricas utilizadas pela folha de pagamento, conforme as tabelas do eSocial, indicando as suas incidências, para a geração dos eventos S-1010.

**Implementação:** Mapear as rubricas de folha às tabelas e incidências do leiaute eSocial válido, com vigência e histórico. Gerar S-1010 e relacioná-lo às mesmas rubricas usadas no cálculo; mudança de incidência não reescreve competências fechadas.

**Dados de outro módulo / integração:** EXT-ESOC: tabela/versão oficial; rubricas e incidências são deste RH.

**Demonstração:** F-ESOC: configurar três rubricas, gerar eventos e provocar incidência incompatível para conferir crítica. Corrigir e regenerar a versão apropriada.

**Aceite técnico:** Eventos e incidências correspondem às rubricas da folha, com validação e evolução identificadas.

**Atenção / limite:** Não usar código eSocial inventado só porque a rubrica se chama PREV-DEMO. Modelos de ensaio e rubricas oficiais são conjuntos distintos.


<a id="rhf-185"></a>
#### RHF-185 — Cargos e funções — referências S-1030/S-1040 do TR

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 185, p. 88:**

> Permitir configuração de cargos e funções gratificadas conforme as tabelas disponibilizadas pelo comitê do e-Social, para a geração dos eventos S-1030 e S-1040.

**Implementação:** Manter dados configuráveis de cargos/funções e o mapeamento para o pacote oficial aplicável. Preservar na documentação a exigência literal S-1030/S-1040 e sua incompatibilidade com o leiaute simplificado consultado. Geração histórica desses eventos depende de esquema legado identificado; fluxo atual usa o mapeamento vigente aprovado, sem fingir envio dos eventos antigos.

**Dados de outro módulo / integração:** EXT-ESOC/EXT-ESOC-LEG: leiautes atuais e legado; cargos/funções são RH.

**Demonstração:** F-ESOC-LEG: demonstrar os cadastros e campos correspondentes; quando o cenário legado for aceito e houver schema, gerar/validar a amostra histórica. No atual, conferir os dados na estrutura correta e registrar a decisão formal de compatibilização.

**Aceite técnico:** Configuração e preservação de dados podem ser comprovadas; atendimento literal do envio/geração antiga não é encerrado apenas por mapear dados a outro evento.

**Atenção / limite:** Q-R07: fonte antiga versus requisito de última versão (196). Não excluir o item, não transmitir evento inexistente ao ambiente atual e não declarar equivalência aprovada sem base.


<a id="rhf-186"></a>
#### RHF-186 — Horários — referência S-1050 do TR

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 186, p. 88:**

> Permitir a configuração dos horários existentes no órgão, conforme os campos exigidos pelo e-Social, para a geração do evento S-1050.

**Implementação:** Configurar os horários do órgão com dados necessários à exportação eSocial, mantendo a correspondência da tabela citada com o leiaute aplicável. Preservar o requisito S-1050 como referência legada e o cadastro operacional atual, sem gerar evento inválido para produção.

**Dados de outro módulo / integração:** EXT-ESOC e EXT-ESOC-LEG; horários/escala são RH.

**Demonstração:** Demonstrar jornada diurna/noturna configuradas e validar a sua representação no pacote escolhido. Se houver ensaio legado formalmente definido, gerar o S-1050 somente nesse contrato/ambiente de teste.

**Aceite técnico:** Horário é dado real do RH e sua exportação é verificável no formato identificado; a lacuna contratual não é ocultada.

**Atenção / limite:** Q-R07: o leiaute atual consultado não contém S-1050. Não marcar o número como atendido só por exibir uma tabela “S-1050” sem arquivo válido.


<a id="rhf-187"></a>
#### RHF-187 — Ambientes e riscos — referência S-1060 do TR

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 187, p. 88:**

> Permitir a configuração dos ambientes de trabalho, com seus fatores de risco para a geração do evento S-1060.

**Implementação:** Manter ambientes de trabalho, riscos e vigências com origem técnica, relacionando servidores e dados ocupacionais. Registrar o mapeamento para o pacote eSocial aplicável, preservando a referência S-1060 da fonte e sem deduzir riscos automaticamente do cargo.

**Dados de outro módulo / integração:** EXT-ESOC/EXT-SST; DEP-04 para documentos técnicos.

**Demonstração:** F-SST/F-ESOC: cadastrar dois ambientes e seus períodos/riscos documentados; conferir a representação no pacote atual. Amostra S-1060 histórica só com esquema/aceite legado identificado.

**Aceite técnico:** Informação de ambiente/risco é persistida e exportável no contrato definido; não há assinatura ou envio fictício de evento antigo.

**Atenção / limite:** Q-R07/R08: compatibilizar a referência antiga com o leiaute atual sem afirmar que gerar outro evento satisfaz formalmente a mesma linha do TR.


<a id="rhf-188"></a>
#### RHF-188 — Processos judiciais — S-1070

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 188, p. 88:**

> Permitir cadastrar os processos judiciais, conforme os campos exigidos pelo e- Social, além de realizar sua vinculação as rubricas ou configurações do empregador, para realizar a geração do evento S-1070.

**Implementação:** Registrar dados do processo exigidos pelo leiaute e vinculá-los a rubricas e/ou configurações do empregador. Gerar S-1070 com validade, identificadores e conteúdo correspondente, preservando referências ao processo original.

**Dados de outro módulo / integração:** DEP-08: processo/documentos, se existentes; EXT-ESOC: campos e schema aplicáveis.

**Demonstração:** F-ESOC: vincular processo DEMO a uma rubrica e outro à configuração institucional, gerar/validar e conferir a ligação.

**Aceite técnico:** Os dois contextos de vínculo funcionam e o evento se origina do cadastro correto, sem apenas anexar PDF sem dados estruturados.

**Atenção / limite:** Não criar decisão judicial, benefício tributário ou processo trabalhista completo por este item. Usar os dados autorizados do processo.


<a id="rhf-189"></a>
#### RHF-189 — Validação local de eventos iniciais e tabelas

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 189, p. 88:**

> Permitir a validação dos eventos iniciais e de tabelas, antes mesmo de enviá-los ao ambiente do e-Social, fazendo com que assim possam ser eliminados os erros e divergências existentes.

**Implementação:** Validar dados, regras e estrutura XML dos eventos iniciais/tabelas antes da transmissão, com catálogo versionado de erros e referências à origem. Distinguir validação local de aceite oficial; campos de vigência e dependências precisam ser verificados.

**Dados de outro módulo / integração:** EXT-ESOC: schemas/regras oficiais; validador e fontes são deste RH.

**Demonstração:** F-ESOC: introduzir cinco falhas de teste em empregador/rubrica/código/vigência/campo obrigatório, executar validação e corrigir as causas.

**Aceite técnico:** Erros são detectados antes do envio e vinculados ao evento/campo; nenhum evento inválido é anunciado como aceito pelo governo.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-190"></a>
#### RHF-190 — Navegação direta do erro à ficha e campo

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 190, p. 88:**

> Permitir ainda, que na tela de validação dos eventos, ao clicar no erro, o sistema abrir diretamente na tela e no campo do sistema de Recursos Humanos e Folha de Pagamento, onde está divergente conforme o layout, para que o usuário possa realizar a correção.

**Implementação:** Associar cada erro tratável a rota/entidade/campo do RH com contexto de pessoa/vínculo/competência. Ao clicar, abrir a ficha autorizada e focar o campo; após correção, retornar à validação sem perder o lote.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Em F-ESOC, clicar no erro de rubrica/incidência e no de cadastro pessoal, corrigir cada um e revalidar. Usuário sem edição vê orientação sem burlar permissão.

**Aceite técnico:** O clique leva ao registro e campo realmente divergentes, e a correção reduz o conjunto de erros na revalidação.

**Atenção / limite:** Não usar link genérico para a tela inicial nem alterar dados automaticamente para “limpar” o painel.


<a id="rhf-191"></a>
#### RHF-191 — Identificação de inclusão ou alteração a enviar

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 191, p. 88:**

> Permitir que no ambiente de produção dos eventos iniciais e de tabelas, ao realizar a validação o sistema aponte automaticamente para o usuário, qual evento é necessário enviar uma alteração e/ou inclusão.

**Implementação:** Comparar versões da configuração atual com as já transmitidas/aceitas no ambiente correto, sugerindo inclusão ou alteração segundo a regra do evento. Guardar referência da comparação e vigência; não tratar todo recálculo como nova inclusão.

**Dados de outro módulo / integração:** EXT-ESOC: regras do evento e recibos armazenados.

**Demonstração:** F-ESOC: um cadastro nunca enviado gera inclusão; mudança válida de um já aceito gera alteração; item inalterado não gera tarefa duplicada.

**Aceite técnico:** Classificação é automática, ligada ao histórico real do evento e ao ambiente, sem misturar recibos de homologação com produção.

**Atenção / limite:** A expressão “ambiente de produção” do TR não autoriza transmitir dados fictícios à produção. Ensaiar com configuração equivalente em ambiente seguro.


<a id="rhf-192"></a>
#### RHF-192 — Validação de eventos não periódicos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 192, p. 88:**

> Permitir realizar a validação dos eventos não periódicos, antes mesmo de enviá- los ao ambiente do eSocial, fazendo com que assim possam ser eliminados os erros e divergências existentes.

**Implementação:** Construir validação local dos eventos não periódicos aplicáveis à entidade, com dados cadastrais/funcionais, ordem de dependências, vigência e schema. Registrar quais famílias foram efetivamente implementadas para o escopo, sem chamar apenas tabelas de não periódicos.

**Dados de outro módulo / integração:** EXT-ESOC: famílias/regras aplicáveis; dados RH e SST.

**Demonstração:** F-ESOC: casos de admissão, alteração/afastamento e desligamento conforme o pacote aplicável; provocar erro de data/campo e demonstrar correção antes do envio.

**Aceite técnico:** Validação cobre fatos não periódicos utilizados pela entidade e apresenta divergências explicáveis; não depende de rejeição oficial para identificar erro local.

**Atenção / limite:** O TR não lista todos os códigos não periódicos. Inventariar o conjunto necessário à operação real e não declarar cobertura universal sem testes.


<a id="rhf-193"></a>
#### RHF-193 — Eventos periódicos, remuneração, reabertura e fechamento

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 193, p. 88:**

> Permitir captar as informações do sistema de Folha de Pagamento, para realizar a geração dos eventos periódicos, tanto de remunerações como de reabertura e fechamento de eventos.

**Implementação:** Gerar os eventos periódicos a partir de folhas/versões e pagamentos pertinentes, contemplando remunerações, reabertura e fechamento aplicáveis. Identificar CPF/vínculo, regime, período e referências sem consolidar indevidamente múltiplos vínculos. Não confundir reabertura eSocial com liberação de edição da folha interna.

**Dados de outro módulo / integração:** EXT-ESOC; DEP-06 para datas/valores de pagamento quando o evento exigir.

**Demonstração:** F-ESOC: gerar remuneração RGPS/RPPS quando aplicável, validar totais com folha; ensaiar fechamento, retorno, reabertura autorizada e nova versão. Conferir referências e não duplicação.

**Aceite técnico:** Geração utiliza dados reais do RH e contempla remuneração e os dois atos de ciclo. Status de fechamento depende do retorno apropriado.

**Atenção / limite:** Códigos e eventos efetivos são escolhidos pelo leiaute vigente/escopo. Não produzir um único XML genérico e chamá-lo de todos os eventos.


<a id="rhf-194"></a>
#### RHF-194 — Transmissão de lote, protocolo e recibos consultáveis

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 194, pp. 88–89:**

> Permitir na transmissão de cada lote ao portal do eSocial, a consulta via sistema, do protocolo e os recibos existentes, mostrando assim os eventos enviados e sua situação mediante o recebimento do eSocial.

**Implementação:** Implementar transmissão autenticada no ambiente autorizado e consulta do resultado, preservando XML enviado, identificador do lote e estados por evento. Diferenciar protocolo de recepção do lote de recibo de processamento do evento; reconsultar resposta ambígua antes de reenviar.

**Dados de outro módulo / integração:** EXT-ESOC: WebService, certificado/procuração e ambiente oficial de teste; adaptador do CeleriFlow.

**Demonstração:** F-ESOC-NET: transmitir lote de homologação; obter protocolo e consultar processamento com um evento aceito e outro rejeitado, usando cenários permitidos. Testar timeout após recepção e recuperação do mesmo protocolo.

**Aceite técnico:** O sistema mostra eventos, situação e comprovantes reais da contraparte, sem duplicação por retentativa ou sucesso falso.

**Atenção / limite:** Simulador serve para testar comportamento da rede/fila, mas não substitui esta evidência de integração oficial. Nunca enviar trabalhadores fictícios à produção.


<a id="rhf-195"></a>
#### RHF-195 — Recibos persistidos dos lotes/eventos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 195, p. 89:**

> O sistema deverá gravar os recibos de cada loto enviado, em sua base de dados, para consultas futuras.

**Implementação:** Armazenar recibos retornados e sua ligação ao lote, evento, pessoa/configuração, ambiente e versão. Guardar resultado bruto verificável e metadados, sem depender de memória da sessão ou link temporário do provedor.

**Dados de outro módulo / integração:** EXT-ESOC: retorno real; DEP-04 quando usado para guardar documentos do retorno.

**Demonstração:** Após F-ESOC-NET, encerrar sessão e reabrir lote/recibo. Reconsultar o mesmo resultado e conferir que há uma referência válida, não cópias sem controle.

**Aceite técnico:** Os recibos permanecem consultáveis e são inequivocamente do ambiente/evento correto.

**Atenção / limite:** O texto usa “loto”; preservar na transcrição. Não inventar número de recibo nem converter ID interno em recibo oficial.


<a id="rhf-196"></a>
#### RHF-196 — Atualização de versão do eSocial

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 196, p. 89:**

> O sistema deverá estar atualizado com a última versão do eSocial.

**Implementação:** Manter registro de versão, schemas, tabelas, notas, data de entrada em produção/homologação e hash dos pacotes. Carregar a versão aplicável ao ambiente e competência, com migração controlada e testes de regressão antes de ativar. “Última versão” não significa adotar antecipadamente schema ainda não vigente.

**Dados de outro módulo / integração:** EXT-ESOC: documentação técnica oficial consultada novamente na implantação.

**Demonstração:** F-ESOC-VER: mostrar o pacote efetivo, fonte e calendário; aplicar em teste uma atualização identificada e revalidar casos de referência, preservando os XML/recibos antigos.

**Aceite técnico:** Versão utilizada é verificável e produz eventos válidos no ambiente alvo, sem sobrescrever evidências históricas.

**Atenção / limite:** A verificação externa desta análise encontrou a família S-1.3 e pacotes com datas distintas. Não congelar este MD como catálogo perpétuo; Q-R07 trata os eventos legados da própria fonte.


<a id="rhf-197"></a>
#### RHF-197 — Captação de dados da Folha para eSocial

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 197, p. 89:**

> Deve capturar informações necessárias do Bando de Dados da Folha de pagamento para geração das informações.

**Implementação:** Implementar contratos internos que leem a versão correta da Folha e seus dados funcionais/rubricas para montagem de eventos. Evitar digitação paralela e preservar vínculo à origem para diagnosticar divergências.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** Alterar dado permitido em folha/configuração de teste, regenerar evento e conferir a mudança. Folha fechada anterior continua produzindo sua representação versionada.

**Aceite técnico:** Eventos são produzidos da base operacional, sem segunda base manual do eSocial ou valores fixos.

**Atenção / limite:** Captação interna não comprova transmissão. Privacidade e versão da origem devem ser preservadas.


<a id="rhf-198"></a>
#### RHF-198 — Integração constante e informativos de prazos

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 198, p. 89:**

> Permitir integração constante com Banco de Dados da Folha de pagamento para informativos de prazos de entrega dos arquivos.

**Implementação:** Consultar continuamente os fatos/pendências relevantes da Folha por mecanismo compatível com a arquitetura e gerar informativos de prazos de entrega parametrizados. Manter data de referência e regra do prazo; alteração de regra deve ser versionada.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-ESOC-PRAZO: criar três obrigações de teste, uma próxima, uma vencida e uma cumprida; alterar um dado da folha e conferir atualização das pendências sem reimportação manual.

**Aceite técnico:** Informativos usam dados e prazos configurados, distinguindo cumprido/pendente e origem da regra.

**Atenção / limite:** Não inventar datas legais, SMS ou notificações externas obrigatórias; o item pede informativos e integração com a base da Folha.


<a id="rhf-199"></a>
#### RHF-199 — Análise de impacto e saneamento cadastral para eSocial

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 199, p. 89:**

> O sistema/módulo deverá, como função principal, uma análise de impacto do e- Social, verificando a base de dados, identificando as correções necessárias para atender o envio correto das informações, possibilitando a correção das inconsistências encontradas nos cadastros da Folha de Pagamento;

**Implementação:** Executar diagnóstico de compatibilidade entre base RH/Folha e pacote eSocial, agrupando divergências, impacto, entidade afetada e caminho de correção. Reutilizar validadores específicos e produzir uma lista explicável, não pontuação de IA sem causa.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-ESOC-DIAG: inserir cinco problemas de cadastro/parâmetro, executar a análise, corrigir dois pela interface e verificar redução para três.

**Aceite técnico:** Diagnóstico encontra falhas reais e permite saneamento na origem, preservando trilha e sem alterar automaticamente dados pessoais.

**Atenção / limite:** Não criar consultoria automática ou afirmar conformidade total apenas porque o painel não detectou erros locais; o aceite oficial é outra verificação.


<a id="rhf-200"></a>
#### RHF-200 — Busca de inconsistências e novas parametrizações

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 200, p. 89:**

> Realizar uma busca na base de dados, diagnosticando as inconsistências em relação aos leiautes do e-Social e novas parametrizações necessárias;

**Implementação:** Comparar a base ao conjunto de regras/leiaute e à configuração necessária, incluindo dados faltantes e parâmetros novos de uma versão. Distinguir erro de cadastro de falta de mapeamento/versão, com item de ação específico.

**Dados de outro módulo / integração:** EXT-ESOC: versão/regras; dados e parâmetros são deste RH.

**Demonstração:** F-ESOC-DIAG: usar parâmetro ausente, vigência conflitante e campo cadastral inválido; executar busca e conferir três causas diferentes.

**Aceite técnico:** O resultado explica qual cadastro ou parâmetro deve mudar e por quê, sem diagnosticar tudo como erro genérico de arquivo.

**Atenção / limite:** Aplicar as regras e vigências efetivamente configuradas. Os dados de ensaio não são parâmetros oficiais nem autorizam ampliar o escopo.


<a id="rhf-201"></a>
#### RHF-201 — Lista acionável de correções pelo usuário

**TR — RECURSOS HUMANOS E FOLHA DE PAGAMENTO, item 201, p. 89:**

> Apresentar uma lista de ações a serem tomadas, que podem ser corrigidas pelo próprio usuário, reduzindo os riscos de erros nos envios de informações ao e- Social.

**Implementação:** Apresentar ações de saneamento com pessoa/configuração, problema, instrução, campo de origem, responsável/permissão e estado. Permitir ao usuário corrigir o que estiver no seu escopo e revalidar, usando a navegação do item 190.

**Dados de outro módulo / integração:** Dados nativos de RH/Folha; DEP-01 para identidade, permissões e auditoria. Não há nova integração externa específica neste item.

**Demonstração:** F-ESOC-DIAG: usuário corrige um problema cadastral, outro exige perfil de configuração e terceiro depende de fonte; revalidar e conferir estados, sem dar todos como resolvidos.

**Aceite técnico:** A lista resulta dos diagnósticos e cada ação conduz a correção ou dependência real; quantidade de pendências diminui somente após teste válido.

**Atenção / limite:** Não marcar “resolvido” por esconder a linha ou trocar status manualmente sem revalidar a causa.

---
<a id="pacotes"></a>
## 8. Pacotes de implementação e sequência de trabalho

A organização abaixo distribui os **201 IDs**, sem reduzir as partes de um requisito composto. A numeração de pacotes é técnica: não obriga terminar toda a interface antes de integrar nem permite adiar regras legais até a entrega. Cada pacote entrega dados, operação, persistência, autorização, interface e testes. Não estimar prazo de execução antes de conhecer o código.

| Pacote | Escopo principal | IDs do TR | Evidência de saída |
|---|---|---|---|
| **P0 — Diagnóstico e contratos** | Mapear código, dados atuais, regime, fontes legais, schemas, Portal, Contabilidade, bancos e relógios. Definir tela-piloto e resolver responsáveis por Q-R01–Q-R10. | Mapeamento de todos; não conta como implementação. | Inventário com existente, parcial, ausente, fonte externa e decisão pendente. |
| **P1 — Cadastro e vínculos** | Ficha completa, código único, contratos, dependentes, cargos, referências, lançamentos, transferências, cursos e demais cadastros. | 1–41 | F-CAD, C-01/C-02 e operações coletivas com histórico e escopo. |
| **P2 — Férias** | Aquisição, gozos, saldos, terço, adiantamento do 13º, planilha e tratamento configurado dos 20 dias. | 42–48 | F-FER, F-FER-MISTO, F-FER-20 e integração com pedido do Portal. |
| **P3 — Licenças e saúde ocupacional** | Atendimento/perícia, CAT, retornos, prorrogações, maternidade, prêmio, afastamentos, PPRA, EPI, CIPA e cessões. | 49–68 | F-AFAST, F-MAT, F-PREMIO e F-SST; dados privados e efeitos por finalidade. O item 49 é o título do conjunto. |
| **P4 — Atos** | Modelos, geração pelos fatos, tramitação e currículo individual/coletivo. | 69–78 | F-ATOS: cada gatilho expresso e seu documento, sem antecipar conclusão da tramitação. |
| **P5 — Vale-transporte** | Fornecedores/roteiros, requisições, mapas, entrega e descontos/restituições. | 79–86 | F-VT: quantidades por tipo, entrega e lançamento derivado sem duplicação. |
| **P6 — Tempo por finalidade** | ATS, férias, progressão e certidão para aposentadoria, com ausências e averbações. | 87–90 | F-TEMPO: memórias separadas, intervalos tratados e documentos correspondentes. |
| **P7 — Ponto** | Leitura de relógio, escalas, regras, tolerância, apuração e destino das horas. | 91–97 | F-PONTO: arquivo compatível, inconsistências, minutos e saldo conferidos. |
| **P8 — Concursos e seletivos** | Certame, vagas, setor, equipe, inscrições, notas, vaga especial, assumir/desistir e títulos. | 98–106 | F-CONC: aprovação derivada da nota conforme a regra cadastrada, sem admissão automática. |
| **P9 — Motor e operação da folha** | Oito tipos, grupos, fórmulas e incidências, previdência, pensões, consignações, provisões, importações, comparativos e fechamento. | 107–138 | F-TIPOS, F-FOL, F-PREV, F-INSUF, F-PARC, F-PROV, F-IMP e F-FECH. RHF-136 depende de definição do objeto contábil. |
| **P10 — Arquivos e integrações** | Geradores oficiais/legados, bancos, configuração contábil, atuária, consignações, benefícios, Tribunal e SIOPE. | 139–153 | Manifestos de arquivo, validação por contrato e resultado do destino quando exigido. |
| **P11 — Documentos e relatórios** | Documentos funcionais, folha analítica, mapa, guias, informes, contracheques, PPP, geradores e seleções. | 154–180 | Arquivos reais de todo o recorte, totais conciliados e versões publicáveis ao Portal. |
| **P12 — eSocial** | Configuração, geração, validação, diagnóstico acionável, transmissão, protocolo e recibos; compatibilização do legado. | 181–201 | F-ESOC e variantes; separar comprovação local, simulada e oficial, com pendências 181/182/185–187 discriminadas. |
| **P13 — Integração e ensaio final** | Regressão, dados reais dos módulos em homologação, Portal do Servidor, Contabilidade e publicação autorizada. | Todos os 201, sem novos requisitos. | Matriz individual, artefatos gerados, medições de UI, relatórios de falhas e pendências. |

**Trabalho em paralelo:** em P0, identificar os layouts e regras de P10/P12 e testar conectividade de homologação quando autorizada. Configurações de rubricas/eSocial acompanham P1/P9; não deixar para descobrir seus campos depois de criar a folha. Emissão e privacidade são aplicadas desde a primeira ficha. Férias/licenças/ponto/VT precisam alimentar o cálculo, não apenas existir em menus separados.

**Caminho de comprovação:** cadastro e vínculo válidos → fato funcional → cálculo com regra identificada → conferência → fechamento e proteção da origem → relatórios/arquivos → retorno do destino quando cabível → consulta no Portal. Uma integração externa pendente não impede testar o restante, mas permanece explicitamente pendente na linha afetada.

<a id="testes"></a>
## 9. Testes, evidências e encerramento do trabalho

### 9.1 Matriz transversal de testes

As verificações abaixo são meios de comprovar as funções previstas; não formam uma lista nova de obrigações de negócio. Os testes concretos devem usar o framework e os serviços já adotados no repositório.

| Teste | Verificação exigida para concluir tecnicamente |
|---|---|
| **Campos compostos** | Conferir todos os campos e subcampos dos checklists C-01 a C-10. Não encerrar uma linha só porque o formulário possui o mesmo título. |
| **Pessoa e vínculos** | Código pessoal único, dois vínculos simultâneos, recontratação e consulta de contrato encerrado. Mudança num vínculo não altera outro indevidamente. |
| **Vigência** | Salário, cargo, banco, estrutura e parâmetros em datas passadas/atuais/futuras; folhas fechadas permanecem reproduzíveis. |
| **Documentos e validação** | CPF/PIS válidos e inválidos, RG/CTPS com subcampos, zeros iniciais, arquivos privados e autorização também nas importações. |
| **Admissão/desligamento** | Matriz de combinações, individual/coletivo, rejeição por vínculo e preservação de outro vínculo ativo. |
| **Dependentes** | Elegibilidade e baixa automática distintas para salário-família e IR; exceção documentada; duas competências e ausência de apagamento histórico. |
| **Férias e prêmio** | Dois gozos no mesmo período, saldo, tentativa de exceder saldo, terço integral/proporcional, peculiaridade dos 20 dias e licença-prêmio separada. |
| **Contagem** | Ausências sobrepostas não são subtraídas em dobro; cada finalidade aplica suas próprias regras; tempo averbado tem origem. |
| **Maternidade e afastamentos** | 120+60 separados; prorrogação de doença e de acidente; mesma causa em períodos descontínuos; alta e retorno. Nenhuma data prevista fictícia habilita pagamento indevido. |
| **Atos** | Todos os gatilhos de 70–77, modelos, individual/coletivo e inserção no currículo na condição correta de tramitação. |
| **Ponto** | Marcação bruta preservada, relógio/arquivo identificado, tolerância, turno cruzando dia, inconsistência e escolha de destino banco/lançamento sem dupla apropriação. |
| **VT** | Quantidade por tipo/percurso, dias elegíveis, compra/entrega distintas, redução por ausência e desconto/restituição rastreáveis. |
| **Concursos** | Vagas e setor, equipe, candidato, nota, aprovado/não aprovado, vaga especial, assumir/desistir e títulos sem efeitos funcionais não autorizados. |
| **Oito folhas** | Mensal, rescisão, adiantamento de férias, licença-prêmio, adiantamento salarial, adiantamento de 13º, 13º e complementar: resultados e incidências próprios. |
| **Motor de fórmulas** | Expressões em português, dependências, erro de ciclo/divisão, regime, vigência, incidências e bloqueio de regra legal para usuário comum. Sem executar código arbitrário. |
| **Previdência** | RGPS e RPPS, individual/patronal, múltiplos vínculos e remuneração fora do órgão; pacote legal distinto da tabela DEMO. |
| **Parcelas e descontos** | Recalcular não amortiza; fechar amortiza uma vez. Parcela parcial, crédito/débito, limite, prioridade e valor não descontado preservados. |
| **Pensão judicial** | Modalidades percentual/fixo/salário mínimo; desconto e beneficiário relacionados; arquivo/retorno de depósito no nível exigido. Não somar pensão novamente ao bruto. |
| **Lançamento no afastamento** | Verba pendente não entra durante afastamento e entra uma única vez na primeira folha elegível após retorno confirmado. |
| **Provisões** | Geração, baixa e estorno por competência e natureza; encargos separados; reconciliação com o destino contábil. |
| **Comparativos** | Duas competências, verba/bruto/líquido, filtros cargo/secretaria/regime/banco e limite de tolerância com caso na borda. |
| **Importação sem layout prévio** | Mapear nomes/ordem arbitrários das colunas para campos reconhecidos; prévia, correção, válidos/rejeitados e fixo/mensal distintos. |
| **Fechamento** | Operações concorrentes de cálculo/edição/fechamento não produzem versão híbrida; folha encerrada e dados relevantes protegidos. |
| **Contabilidade** | Arquivo de configuração importado em 120; fatos de pessoal transmitidos em 145; estágios e datas de convênios distintos; retorno de sucesso/erro identificado. |
| **Bancos e arquivos** | Matrícula/nome/conta/valor, corrente/poupança, totais por banco, múltiplos favorecidos e erro de conta; remessa não equivale a depósito. |
| **Leiautes oficiais e legados** | Arquivo passa no schema/validador da versão aplicável. Extensão ou cabeçalho com sigla não provam atendimento. Registrar a competência de uso do legado. |
| **Relatórios** | Analítico por folha e consolidado, mapa, bancos, fichas, informe, mensagens, guias, pensão, PPP e quatro quebras de 175; três informações de 176. |
| **Geradores e permissões** | Usuário monta TXT/relatório/gráfico/seleção sem código e sem consultar dados fora de seu escopo. Modelos oficiais não são substituídos por esse gerador livre. |
| **eSocial** | Validação local antes do envio, erro com link ao campo, recibo por evento, protocolo de lote, replay e consulta depois de timeout. Fechamento/reabertura governamental não é o status local da folha. |
| **Atualização eSocial** | Pacote com fonte/hash/ambiente/data; regras futuras não entram antecipadamente e recibos históricos não são reescritos. |
| **Portal do Servidor** | Mesmo documento e vínculo; pedido autorizado produz o fato na fonte uma vez; fonte ausente não gera status “efetivado”. Card pessoal permanece separado. |
| **Transparência** | Dados autorizados chegam ao portal público a partir da fonte, sem CID, conta bancária ou dependentes e sem copiar dados para notícia. |
| **Paginação** | 27 registros em 10/10/7, busca global e retorno à ficha; lotes de 12 e exportações abrangem todas as páginas. |
| **UI e acessibilidade** | Viewports de referência, zoom, teclado, legibilidade, estados vazio/erro/sucesso e Chrome móvel real. Não cortar documentos ou usar fonte diminuta para evitar rolagem. |

**Níveis de teste:** testes unitários de fórmulas/intervalos; testes de contrato de parsers e integrações; testes de persistência e concorrência; testes de interface e fluxo completo. Medir desempenho com volume e ambiente declarados. Um teste visual não substitui uma conciliação financeira; um cálculo unitário não comprova os campos exigidos na tela.

### 9.2 Matriz individual a preencher pelo Codex

A matriz começa sem implementação comprovada. **Não preencher `VALIDADO_LOCAL` apenas pela existência de uma classe, tela ou teste mockado.** Separar estado do código, teste executado e nível de integração. Itens com referências legadas mantêm sua observação mesmo quando o cadastro local está funcionando.

| ID | Estado inicial | Tela / serviço real | Regra ou fonte | Teste executado / evidência | Pendência inicial |
|---|---|---|---|---|---|
| RHF-001 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-002 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-003 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-004 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-005 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-006 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-007 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-008 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-009 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-010 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-011 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-012 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-013 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-014 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-015 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-016 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-017 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-018 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-019 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-020 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-021 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-022 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-023 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-024 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-025 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-026 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-027 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-028 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-029 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-030 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-031 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-032 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-033 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-034 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-035 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-036 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-037 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-038 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-039 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-040 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-041 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-042 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-043 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-044 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-045 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-046 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-047 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-048 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-049 | TITULO_AGREGADOR | A mapear | A identificar | Não executado | Evidência do conjunto 50–68; não criar ação extra. |
| RHF-050 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-051 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-052 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-053 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-054 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-055 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-056 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-057 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-058 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-059 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-060 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-061 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-062 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-063 | A_VERIFICAR | A mapear | A identificar | Não executado | Aplicabilidade de formato/documento e competência; Q-R06/R08. |
| RHF-064 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-065 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-066 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-067 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-068 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-069 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-070 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-071 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-072 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-073 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-074 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-075 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-076 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-077 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-078 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-079 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-080 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-081 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-082 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-083 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-084 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-085 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-086 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-087 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-088 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-089 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-090 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-091 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-092 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-093 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-094 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-095 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-096 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-097 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-098 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-099 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-100 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-101 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-102 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-103 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-104 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-105 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-106 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-107 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-108 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-109 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-110 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-111 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-112 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-113 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-114 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-115 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-116 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-117 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-118 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-119 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-120 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-121 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-122 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-123 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-124 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-125 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-126 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-127 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-128 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-129 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-130 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-131 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-132 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-133 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-134 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-135 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-136 | AGUARDA_DEFINICAO_TR | A mapear | A identificar | Não executado | Q-R05 — saldo, origem/destino e efeito não definidos. |
| RHF-137 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-138 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-139 | A_VERIFICAR | A mapear | A identificar | Não executado | Aplicabilidade de formato/documento e competência; Q-R06/R08. |
| RHF-140 | A_VERIFICAR | A mapear | A identificar | Não executado | Aplicabilidade de formato/documento e competência; Q-R06/R08. |
| RHF-141 | A_VERIFICAR | A mapear | A identificar | Não executado | Aplicabilidade de formato/documento e competência; Q-R06/R08. |
| RHF-142 | A_VERIFICAR | A mapear | A identificar | Não executado | Aplicabilidade de formato/documento e competência; Q-R06/R08. |
| RHF-143 | A_VERIFICAR | A mapear | A identificar | Não executado | Aplicabilidade de formato/documento e competência; Q-R06/R08. |
| RHF-144 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-145 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-146 | A_VERIFICAR | A mapear | A identificar | Não executado | Aplicabilidade de formato/documento e competência; Q-R06/R08. |
| RHF-147 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-148 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-149 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-150 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-151 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-152 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-153 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-154 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-155 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-156 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-157 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-158 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-159 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-160 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-161 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-162 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-163 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-164 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-165 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-166 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-167 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-168 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-169 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-170 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-171 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-172 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-173 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-174 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-175 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-176 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-177 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-178 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-179 | A_VERIFICAR | A mapear | A identificar | Não executado | Aplicabilidade de formato/documento e competência; Q-R06/R08. |
| RHF-180 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-181 | COMPATIBILIZACAO_TR_EXTERNA | A mapear | A identificar | Não executado | Q-R07 — formato/serviço legado e demonstração a confirmar. |
| RHF-182 | COMPATIBILIZACAO_TR_EXTERNA | A mapear | A identificar | Não executado | Q-R07 — formato/serviço legado e demonstração a confirmar. |
| RHF-183 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-184 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-185 | COMPATIBILIZACAO_TR_EXTERNA | A mapear | A identificar | Não executado | Q-R07 — formato/serviço legado e demonstração a confirmar. |
| RHF-186 | COMPATIBILIZACAO_TR_EXTERNA | A mapear | A identificar | Não executado | Q-R07 — formato/serviço legado e demonstração a confirmar. |
| RHF-187 | COMPATIBILIZACAO_TR_EXTERNA | A mapear | A identificar | Não executado | Q-R07 — formato/serviço legado e demonstração a confirmar. |
| RHF-188 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-189 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-190 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-191 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-192 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-193 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-194 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-195 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-196 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-197 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-198 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-199 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-200 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |
| RHF-201 | A_VERIFICAR | A mapear | A identificar | Não executado | Diagnosticar código, dados e regras aplicáveis. |

**Estados de execução:** `A_VERIFICAR`, `EXISTE_NAO_TESTADO`, `A_IMPLEMENTAR`, `PARCIAL`, `VALIDADO_LOCAL`, `TESTADO_COM_SIMULADOR`, `INTEGRACAO_TESTADA_HOMOLOGACAO`, `DEPENDENCIA_OUTRO_MODULO`, `DEPENDENCIA_EXTERNA`, `AGUARDA_DEFINICAO_TR` e `COMPATIBILIZACAO_TR_EXTERNA`. O estado `TITULO_AGREGADOR` do item 49 indica a natureza da fonte; sua evidência é a cobertura do grupo, não uma tela inventada.

**Registro mínimo de cada evidência:** ID; versão do código/regra; órgão/competência/vínculo; dados de entrada; perfil; ação executada; resultado esperado e observado; verificação após recarga/outra sessão; documento ou arquivo gerado, quando houver; integração e ambiente; pendência. Usar capturas reais sem dados pessoais de produção. Listar arquivos/migrations alterados e comandos de teste efetivamente executados, não comandos que o agente presume existir.

Em função compartilhada, referenciar a mesma implementação, mas testar as condições de cada ID. Por exemplo, o motor de fórmulas atende 116/117/121, mas fórmula em português não prova abatimento previdenciário de emprego externo; o mesmo gerador emite contracheque e informe, mas o conteúdo fiscal é diferente.

### 9.3 Condição de conclusão

Só concluir um requisito após **operação real, dados persistidos, regras identificadas, autorização e resultado reproduzível**, incluindo cada parte de sua redação. Para integrações, indicar se houve arquivo validado, teste com simulador ou resposta oficial. Arquivo de teste validado localmente não vira remessa recebida. Contracheque emitido não é prova de pagamento bancário.

A validação financeira de produção exige valores esperados conferidos pelo responsável técnico competente, com tabelas e vigências aplicáveis. Os números DEMO deste plano comprovam comportamento e conciliação do motor, não exatidão legal de todos os regimes e competências. Entregar somente fórmulas vazias ou um campo para digitar qualquer resultado também não atende à exigência de regras legais disponíveis e protegidas de RHF-116.

**Não declarar “201/201 atendidos” enquanto RHF-136 estiver sem definição, a compatibilidade das referências legadas não tiver encaminhamento ou qualquer integração obrigatória não tiver a evidência pertinente.** Documentação dos 201 itens é cobertura do plano. Aceite técnico interno não é homologação da comissão, validação fiscal/médica ou prova dos demais módulos da licitação.

<a id="pendencias"></a>
## 10. Definições, lacunas e ressalvas a fechar

### Q-R01 — Regimes, legislação, tabelas e vigências

**Escopo:** cadastro/admissão, dependentes, salário, benefícios, ausências, fórmulas, previdência, rescisão, teto e obrigações. O TR descreve capacidades, mas não fornece o estatuto do órgão, carreira completa, matrizes de incidência, tabelas oficiais de cada competência ou todas as hipóteses de cálculo.

**Providência:** identificar os regimes efetivamente utilizados e obter atos/tabelas, fonte, vigência, responsável pela validação e exemplos de cálculo homologados. Entregar pacotes de regras aplicáveis, separados das parametrizações locais e das fixtures. Não transformar uma regra CLT, previdenciária ou de outro município em regra universal. Reutilizar o cadastro legal existente quando correto; documentar lacuna concreta em vez de solicitar genericamente “toda a legislação” e parar o trabalho.

### Q-R02 — Períodos, gozos e efeitos por finalidade

**Escopo:** 42–48, 59–62, 87–90, 109/114 e Portal. Definir aquisição, prorrogação/cancelamento, fracionamento permitido, pecúnia, pagamento do terço, adiantamento do 13º, licença-prêmio e condição dos 20 dias do item 48. O texto não define, nesse item, periodicidade semestral ou regime completo de cargos de radiologia.

**Providência:** documentar um quadro de finalidade/regime/ausência/efeito/data e o critério dos limites. A parametrização real será a mesma consumida pelo Portal. O período fictício prova o funcionamento; não concede um direito nem comprova sua duração legal.

### Q-R03 — Licenças, documentação e acesso clínico

**Escopo:** 49–62/134/155/156. Preservar médico e CID do atendimento e da perícia separadamente; confirmar obrigação de preenchimento e público autorizado. Definir como os responsáveis caracterizam episódios da mesma causa, homologam prorrogação e confirmam o retorno. Não concluir identidade clínica somente por igualdade textual do CID.

**Providência:** utilizar documentos reais de homologação autorizados ou exemplos expressamente fictícios, com as restrições de acesso definidas. Critério de abatimento da maternidade 120+60 e processamento previdenciário depende de regra aplicável; não assumir abatimento dos 180 dias nem prescrever decisão médica.

### Q-R04 — Valores, margem, prioridades e fechamento

**Escopo:** 107–138, previdência, pensões, consignações e provisões. Definir arredondamento, ordem de cálculo, agregação por pessoa/vínculo, tratamento de remuneração externa, bases de cada desconto, piso/limite configurado, prioridade e saldo não descontado. Identificar a regra de compensação entre folhas da mesma competência.

**Providência:** fechar cenários positivos e de borda com o responsável da folha. Escolher e documentar o momento de amortização conforme o item 119, as consequências de qualquer reabertura autorizada já existente e como desfazer derivações sem duplicar. O percentual do exemplo não é margem legal. O teto de prefeito/presidente do item 131 precisa de parâmetros e vigências, não de um valor fixo escrito no código.

### Q-R05 — Fronteira contábil e RHF-136

**RHF-136 transcreve apenas “Permitir realizar a transferência de saldo contábil”.** Não informa conta/objeto, origem/destino, momento, efeitos ou se a ação ocorre em fechamento, reclassificação ou migração. Não é possível definir um aceite funcional inequívoco sem essas informações.

**Providência:** solicitar o objeto e o efeito esperado; localizar eventual rotina existente e demonstrá-la somente se a correspondência estiver confirmada. Não chamar mera exportação de folha de “transferência de saldo”. Manter `AGUARDA_DEFINICAO_TR` no item. Em paralelo, implementar os fluxos explicitados de 120/129/145: configurações contábeis, provisões e dados para reserva/empenho/liquidação/pagamento. Datas diferentes para convênios continuam preservadas.

### Q-R06 — Arquivos, guias, documentos e destinatários

**Escopo:** 139–153, 155/157/162/168/171–174/179. Obter formato e edição pertinentes à competência, banco/convênio, consignatária, benefício, Tribunal, atuário e órgão destinatário. A fonte usa expressão ampla “Tribunal de Contas dos estados brasileiros”; priorizar o destinatário aplicável à contratação e registrar qualquer abrangência adicional a confirmar, sem afirmar cobertura nacional por implementar um único arquivo.

**Providência:** manter registro por interface: exigência do TR, origem, esquema/layout, finalidade, período, validação, transmissão pedida ou apenas geração, resultado de homologação e pendências. SIOPE aqui pede relatórios específicos; não atribuir automaticamente ao RH toda a transmissão geral já tratada em Contabilidade. Informe RFB e ficha anual são documentos diferentes. Não usar um PDF de teste como guia bancária válida.

### Q-R07 — eSocial atual, eventos antigos e qualificação cadastral

**Escopo:** 181–201 e regras/arquivos relacionados. O TR pede a última versão no item 196 e simultaneamente cita S-1030/S-1040/S-1050/S-1060 nos itens 185–187. A pesquisa oficial da seção 11 identificou essas referências como ausentes do conjunto S-1.3 consultado. A consulta de qualificação em lote dos itens 181/182 também possui restrição externa atual identificada.

**Providência:** produzir uma matriz **item literal → dados/capacidade → contrato histórico → representação vigente → demonstração proposta → confirmação administrativa necessária**. Preservar campos e funções locais, testar arquivo legado somente com formato identificado e implementar a operação corrente aplicável. Nenhuma “renomeação de botão” ou equivalência presumida encerra o item. Confirmar acesso ao ambiente de testes, certificado e autorização antes de enviar. Fixar o pacote por data/ambiente e atualizar antes da implantação; notas com vigência futura não são automaticamente a versão de produção do dia.

### Q-R08 — PPRA, demais dados SST e PPP

**Escopo:** 63–67/179/187. Cadastrar o PPRA explicitamente citado e preservar a informação histórica; verificar com os responsáveis a documentação ocupacional aplicável hoje, sem substituir o requisito silenciosamente por outro nome. O papel do software é registrar, integrar e emitir a informação técnica fornecida, não elaborar avaliação de risco médica/ambiental por suposição.

**Providência:** identificar responsáveis, modelos, versões e histórico de ambientes, exposição, EPI e funções usado no PPP. A compatibilização PPRA/PGR e a forma atual/histórica de emissão do PPP ficam registradas. Não criar um produto genérico de medicina ocupacional nem declarar exposição eliminada só por haver EPI cadastrado.

### Q-R09 — Concurso, cursos e atos institucionais

**Escopo:** 33/36/69–78/98–106. Obter critérios de notas, denominação de vaga especial, vínculo com cargos/vagas, papel da equipe e textos/rotina de tramitação dos atos. A aprovação automática solicitada em 103 é pela nota segundo regra cadastrada; não importa algoritmo de cota, desempate, classificação por títulos ou nomeação que o texto não detalha.

**Providência:** modelar o mínimo necessário ao concurso/curso/ato real, com dados fictícios nos ensaios. Cursos pedidos no Portal só integram qualificação realizada após a execução pertinente. Não incluir compra de curso, aplicação de prova, nomeação automática ou um novo rito disciplinar.

### Q-R10 — Fontes compartilhadas, operação e divulgação

**Escopo:** DEP-01 a DEP-10, equipamentos e infraestrutura. Confirmar serviços de identidade/pessoas/estrutura, o ponto de extensão do RH, contratos de privacidade e recortes de Portal/Transparência. Nos itens 7 e demais cadastros intrínsecos, a integração com uma estrutura comum não dispensa permitir as operações de cadastro e histórico expressamente exigidas; reaproveitar a tela/serviço competente ou registrar precisamente a falta, sem criar duas estruturas oficiais.

**Providência:** informar origem e o lado produtor/consumidor, incluindo autorização e retorno. Registrar o modelo de relógio e a forma de captura/digitalização usada, credenciais e validação de arquivos sem publicar segredos. Ausência de fonte é erro/pendência, não valor zero, documento vazio ou estado “atualizado”. A integração com o card do Portal do Servidor precisa manter identidade, vínculo e documento corretos, preservando sua separação visual e de permissões.

<a id="fontes"></a>
## 11. Conferência, fontes e compatibilidade externa

### 11.1 Auditoria documental desta revisão

| Verificação | Resultado da composição |
|---|---:|
| Entradas sequenciais do TR | 201 |
| IDs individuais RHF no detalhamento | 201 |
| Citações integrais com página inicial/final | 201 |
| Conjuntos de implementação, dependência, demonstração, aceite e limite | 201 |
| Itens omitidos ou números adicionais no detalhamento | 0 |
| Blocos de origem organizados no plano | 12 |
| Número introdutório identificado como título | 49 |
| Item de efeito contábil sem especificação suficiente | 136 |

O texto das páginas 73–89 foi extraído por dois mecanismos independentes. Foram encontradas **oito variações de espaçamento junto a hífens**; a conferência sem espaços confirmou a mesma sequência de caracteres em todos os 201 itens. As citações usam a extração-base, sem corrigir ortografia, nomenclatura ou referência histórica do TR. A fronteira do módulo e os trechos sensíveis foram também conferidos em imagens das páginas. Os checklists, vínculos do índice, abrangência dos pacotes e resultados aritméticos foram verificados na composição.

**O que não foi auditado:** código, funcionamento do ERP, cálculos normativos reais, configurações de produção, equipamento, transmissão bancária ou governamental. A matriz continua sem testes do software executados. A fonte é um TR, não uma especificação completa de toda a legislação trabalhista, previdenciária e estatutária.

### 11.2 Fontes funcionais e de projeto

- **TR-RHF:** `termo de referencia (Ratificado)(1).pdf`, 335 páginas, Processo Administrativo nº 1026/2026; bloco **RECURSOS HUMANOS E FOLHA DE PAGAMENTO**, pp. **73–89**, itens 1–201. Fonte exclusiva das citações individuais e da cobertura específica.
- **PSV-BASE:** `CeleriFlow_POC_Portal_do_Servidor_Desenvolvimento_REV01.md`. Referência do card individual, limites produtor/consumidor e solicitações já planejadas; não aumenta os 201 itens.
- **CTB-BASE:** plano de Contabilidade Pública já produzido nesta conversa. Identifica a responsabilidade do núcleo contábil; nomes reais de interfaces e leiautes precisam ser confirmados no repositório.
- **UX-BASE:** padrão de interface definido pelo usuário e repetido nos MDs anteriores. Dimensões, quantidade inicial de linhas e metas de desempenho são escolhas de projeto, não obrigações textuais do TR.

### 11.3 Pesquisa externa pontual — consultada em 19/09/2026

As notas a seguir foram incluídas para evitar instruções tecnicamente incompatíveis com os destinatários atuais. **Não substituem, corrigem ou eliminam requisitos do TR.** As decisões de aceite precisam ser registradas com a Administração. Não foi feita pesquisa completa de estatuto local, alíquotas, margem, regras clínicas, cálculo de todos os regimes ou todas as versões de arquivos.

| Referência | O que a fonte oficial consultada informa | Efeito no desenvolvimento |
|---|---|---|
| **WEB-ESOC / EXT-ESOC** | A página técnica disponibiliza S-1.3 com NT 06/2026 e pacotes com datas de produção, além de NT 07/2026 com implantações futuras a partir de outubro/2026. | Selecionar schema/tabelas pela data e ambiente, preservar versão/hash e revalidar antes da implantação. Não escolher automaticamente a maior NT publicada. |
| **WEB-ESOC-LAYOUT / EXT-ESOC-LEG** | O sumário do S-1.3/NT 06/2026 consultado lista os eventos atuais e não contém S-1030, S-1040, S-1050 ou S-1060. | Manter a incompatibilidade de 185–187 explícita, com trilha histórica e mapeamento atual documentados. Outro evento não é equivalência contratual automática. |
| **WEB-CQC / EXT-CQC** | A página da qualificação cadastral informa suspensão de novas consultas em lote, mantendo downloads para arquivos enviados até 15/08/2025. | Geração/importação de arquivo pode ser ensaiada, mas não prometer retorno novo oficial; confirmar como serão demonstrados 181/182. |
| **WEB-DIRF / EXT-LEGADO** | A Receita informa substituição da DIRF, a partir do ano-calendário de 2025, por informações de eSocial e EFD-Reinf; o programa legado permanece relacionado a períodos anteriores. | Preservar RHF-141 e seu arquivo por período/uso. Não enviar uma DIRF de demonstração como obrigação corrente nem reconstruir toda a EFD-Reinf neste módulo. |
| **WEB-FGTS / EXT-LEGADO** | O comunicado do MTE orienta órgãos públicos a utilizar FGTS Digital para o recolhimento da competência janeiro/2025. | SEFIP/GFIP do TR precisa de aplicabilidade histórica/operacional identificada. Não assumir recolhimento por SEFIP em todas as competências ou incidência de FGTS em todo regime. |
| **WEB-RAIS / EXT-LEGADO** | O portal oficial informa RAIS via extração do eSocial desde o ano-base 2023 para os quatro grupos e registra o encerramento, em 14/08/2026, do prazo pelo PGD Genérico para anos-base 1976–2022. | Confirmar o exercício/grupo do ensaio e o gerador aplicável; não tratar RHF-142 como prova de obrigação legada universal. |
| **WEB-SST / EXT-SST** | Material institucional da Fundacentro descreve a substituição do PPRA pelo PGR no contexto de gerenciamento de riscos. | Preservar o cadastro PPRA de RHF-063 e registrar compatibilização documental por período/regime; não remover o requisito nem presumir conteúdo técnico. |

**Localizadores das fontes oficiais:**

- **WEB-ESOC — eSocial, Documentação Técnica:** `https://www.gov.br/esocial/pt-br/documentacao-tecnica`
- **WEB-ESOC-LAYOUT — eSocial, Leiautes S-1.3, NT 06/2026, revisão 09/04/2026:** `https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026-rev-09-04-2026/index.html`
- **WEB-CQC — eSocial, Qualificação Cadastral:** `https://www.gov.br/esocial/pt-br/empresas/consulta-qualificacao-cadastral`
- **WEB-DIRF — Receita Federal, Suporte à Dirf:** `https://www.gov.br/receitafederal/pt-br/canais_atendimento/fale-conosco/suporte-a-dirf`
- **WEB-FGTS — Ministério do Trabalho e Emprego, comunicado de 02/01/2025:** `https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/comunicados/orgaos-publicos-devem-utilizar-o-fgts-digital-para-recolher-o-fgts-da-competencia-janeiro-2025`
- **WEB-RAIS — Portal oficial RAIS:** `https://www.rais.gov.br/`
- **WEB-SST — Fundacentro, Programa de Gerenciamento de Riscos substitui PPRA:** `https://www.gov.br/fundacentro/pt-br/comunicacao/noticias/noticias/2020/6/programa-de-gerenciamento-de-riscos-substitui-ppra`

As demais referências `EXT-*` da seção 3 representam contratos/capacidades **a identificar**, não documentação já obtida ou integração já testada. Elas não devem ser interpretadas como links de APIs existentes. Manter a confirmação das tabelas legais e dos leiautes no relatório de execução.

### 11.4 Entrega esperada

Um **RH e Folha de Pagamento integrado ao CeleriFlow**, com campos e operações do TR, cálculos reproduzíveis, períodos e saldos consistentes, documentos emitidos a partir dos fatos, arquivos verificáveis, integração com o card do Portal do Servidor e evidência por requisito. Preservar a distinção entre código concluído, regra validada, arquivo gerado, retorno externo obtido e pendência contratual. Não encerrar o trabalho somente entregando este plano reformulado ou exibindo a quantidade de telas.
