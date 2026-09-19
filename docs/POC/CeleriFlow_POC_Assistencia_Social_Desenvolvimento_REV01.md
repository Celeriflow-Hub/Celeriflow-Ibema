# CeleriFlow — Desenvolvimento e demonstração da POC
## Gestão de Assistência Social | Divino de São Lourenço/ES

**Revisão 01 — 19/09/2026.**  
**Destinatário:** Codex/Antigravity com acesso ao repositório real do CeleriFlow.  
**Fonte funcional:** `termo de referencia (Ratificado)(1).pdf`, Processo Administrativo nº 1026/2026, bloco **GESTÃO DE ASSISTÊNCIA SOCIAL**, páginas **305–309**.  
**Rastreabilidade:** **ASO-002 a ASO-058**, correspondentes aos números **2 a 58** que efetivamente aparecem na fonte. São **57 entradas**: 45 antes do subtítulo **Relatórios:** e 12 nesse subtítulo. **Não foi encontrado item 1 entre o título e o item 2. Não criar ASO-001, não deslocar a numeração e não anunciar “58 requisitos conferidos”.**  
**Objetivo:** desenvolver/adaptar um módulo de Assistência Social integrado ao CeleriFlow, com operações reais, dados persistidos, atendimento com ou sem triagem, prontuário familiar protegido, benefícios, acompanhamento e relatórios demonstráveis.

> **Ordem ao agente:** examinar o código, reutilizar o que funciona, implementar as lacunas dos 57 itens, testar pela interface e pelos serviços e entregar evidência por ID. Não devolver apenas outro planejamento, menus, cards, telas estáticas, totais fixos ou PDFs prontos desvinculados dos registros. Cadastro não é concessão de benefício; triagem não é atendimento; encaminhamento não é atendimento no destino; relatório local não é prestação de contas homologada.

**Diretrizes do usuário mantidas:** módulo identificado como **Assistência Social** na navegação do CeleriFlow, sem criar sistemas independentes para CRAS, CREAS ou cada tipo de acompanhamento. Preservar identidade visual; listagens paginadas; prioridade para ausência de rolagem global no desktop; fonte operacional de referência **14 px/20 px**. No celular, utilizar o **mesmo site no Chrome**, sem aplicativo separado. **Destacar dados de outros módulos, consumir os serviços existentes e registrar a dependência real sem reconstruir o módulo de origem.**

**Limite desta análise:** foi lido o bloco do TR e o padrão dos MDs anteriores. O repositório, as unidades reais, a base CADÚNICO, os cadastros municipais, as configurações de sigilo e os modelos adotados para SUAS/IASES não foram inspecionados/testados. A pesquisa externa pontual da seção 11 serve para orientar a identificação das fontes; não substitui a redação do edital nem define o modelo faltante.

**Como interpretar:** somente o campo **TR** de cada item é transcrição da exigência, preservando inclusive imperfeições e normalizando espaços/quebras de linha. Campos auxiliares, estados, organização de telas, números, critérios e cenários são **propostas de implementação/ensaio**, não roteiro oficial da comissão ou regras de concessão de benefícios. Não presumir faixas legais de renda, idade, prioridade, elegibilidade, prazos ou modelos de documentos não fornecidos.

**Este MD é independente:** não incorpora os requisitos completos de Saúde, RH, Portal do Servidor, Processos, Almoxarifado ou BI. As capacidades próprias de Assistência Social não podem ser omitidas sob o rótulo “depende de outro módulo”.

**Navegação:** [Escopo](#escopo) · [57 itens](#lista) · [Dados e integrações](#dependencias) · [Regras operacionais](#operacao) · [Interface ERP](#ux) · [Base fictícia e checklists](#base) · [Item a item](#itens) · [Pacotes](#pacotes) · [Testes e evidências](#testes) · [Definições pendentes](#pendencias) · [Fontes e conferência](#fontes)

---
<a id="escopo"></a>
## 1. Escopo, diagnóstico e limites

### 1.1 Uma área de Assistência Social, integrada ao ERP

Ler `AGENTS.md`, quando existir, manifests, lockfile, migrations, convenções de módulos, permissões e testes. Confirmar a stack efetiva; não impor ORM, biblioteca, versão, provedor, rotas ou nomes de tabelas não localizados. Usar migrations incrementais, sem apagar dados, reiniciar o banco ou substituir destrutivamente serviços consumidos por outros módulos.

Reutilizar a entrada/card **Assistência Social** existente, criando-a somente se necessário. Organizar áreas internas para **Unidades e profissionais; Pessoas e famílias; Recepção e atendimentos; Agenda e visitas; Acompanhamentos e PIA; Turmas e atividades; Benefícios; Mapa; Relatórios e configurações**. As fichas acessadas por diferentes atalhos devem recuperar os mesmos registros, não cópias por unidade.

**Prontuário da família não é uma página pública.** CRAS/CREAS e unidades parceiras são contextos de trabalho; estar cadastrado em uma unidade ou ter cargo hierárquico superior não concede automaticamente acesso a todos os pareceres, situações de violência e medidas socioeducativas.

### 1.2 Responsabilidade do desenvolvimento

Pertencem a este pacote: cadastros socioassistenciais e seus vínculos; composição familiar e domicílio; recepção/triagem; atendimento direto; agenda/retorno/visitas; pareceres; PAIF/PAEFI; acompanhamento socioeducativo e PIA; turmas/frequência/atividades; registro de BPC e benefícios eventuais; pedidos em espera, aprovação/liberação e entradas; mapa protegido; importação CADÚNICO; emissões e relatórios do bloco.

Se Pessoas, Estoque, Processos, documentos ou mapas já possuírem serviços centrais, consumi-los sem duplicar fonte oficial. Quando a função for própria de Assistência Social e ainda não existir, implementá-la neste domínio. Não deixar família, PIA ou controle local de benefícios sem operação só porque não existe módulo externo pronto.

| Classe | Significado | Limite |
|---|---|---|
| **TR-E** | Um dos itens 2–58 da fonte. | Implementar todas as ações e informações expressas. |
| **TEC** | Persistência, transação, integridade, autorização e teste. | Meios de funcionamento; não novos serviços sociais. |
| **UX/CANAL** | Diretriz de apresentação do usuário. | ERP estruturado, paginação real, mesma aplicação no celular. |
| **DEP-MOD** | Fonte/capacidade de outro domínio. | Identificar e usar o serviço; falta não equivale a integração concluída. |
| **ARQUIVO/MODELO** | Formato ou formulário externo. | Obter versão/amostra válida e mapear campos; não inventar padrão oficial. |
| **DEF** | Regra/expressão não completamente especificada. | Registrar a decisão e a dúvida sem reescrever o TR. |
| **EXTRA** | Função sem vínculo à fonte ou pedido. | Não desenvolver neste pacote. |

### 1.3 Não acrescentar — e não retirar

**Não acrescentar por suposição:** concessão federal automática de BPC/Bolsa Família, pagamento bancário/Pix, consulta ou escrita no INSS, API nacional do CADÚNICO, transmissão automática ao SUAS/IASES, gestão judicial de medidas, decisão social por IA, pontuação preditiva de vulnerabilidade, portal público de famílias/violência, biometria, reconhecimento facial, aplicativo nativo/híbrido, offline, rastreamento de visitas, roteirização, WhatsApp/SMS/push, clínica/perícia, compras/contabilidade paralelas, controle completo de almoxarifado, prescrições, fotos obrigatórias, assinatura ICP-Brasil ou QR obrigatório em todos os documentos.

**Não retirar como extras:** atendimento sem triagem; número de inscrição profissional; família e seus integrantes; unificação de pessoa física; importação CADÚNICO; PIA com medidas; PAIF e PAEFI distintos; registro de violência e averiguação; quadro de atendimentos abertos; visitas domiciliares e a entidades; faixa etária de turma; frequência emitível; entrada de benefício com dados fiscais; fila por prioridade; desligamento de vínculo a programa; **mapa de famílias**; carteirinha; declaração após atendimento; formulários **CRAS, CREAS e IASES**.

Os itens não exigem criar aplicativo; a emissão e uso no Chrome do celular são orientação de canal. A preferência por tabelas não elimina o mapa exigido. A fonte pede **importar arquivo** CADÚNICO e **emitir formulários** SUAS/IASES; não converter esses verbos em obrigação de uma API de transmissão, nem apresentar um mero link como execução.

<a id="lista"></a>
## 2. Lista dos requisitos na ordem original

Os títulos são resumos de navegação; as citações integrais estão na seção 7. Apenas **Relatórios:** é subtítulo do bloco. A ausência de item 1 está registrada como Q-AS01, fora da contagem de requisitos existentes.

### Itens 2–46 — sequência inicial do bloco

| ID / item do TR | Ação resumida | Página do PDF |
|---|---|---:|
| [ASO-002 / 2](#aso-002) | Unidades da rede socioassistencial com código e endereço | 305 |
| [ASO-003 / 3](#aso-003) | Profissionais com número de inscrição | 305 |
| [ASO-004 / 4](#aso-004) | Triagem orientada pelo serviço informado na recepção | 305 |
| [ASO-005 / 5](#aso-005) | Atendimento direto sem triagem prévia | 305 |
| [ASO-006 / 6](#aso-006) | Cadastro de turmas | 305 |
| [ASO-007 / 7](#aso-007) | Classificação de turmas por faixa etária | 306 |
| [ASO-008 / 8](#aso-008) | Cadastro local de BPC | 306 |
| [ASO-009 / 9](#aso-009) | Cadastro de benefícios eventuais | 306 |
| [ASO-010 / 10](#aso-010) | Controle mensal de benefícios liberados por unidade, cidadão ou família | 306 |
| [ASO-011 / 11](#aso-011) | Programas sociais e vínculo de cidadãos | 306 |
| [ASO-012 / 12](#aso-012) | Atendimento com agendamento de retorno | 306 |
| [ASO-013 / 13](#aso-013) | Agenda a partir dos horários do profissional por unidade | 306 |
| [ASO-014 / 14](#aso-014) | Cadastro familiar e participação dos integrantes nas ações | 306 |
| [ASO-015 / 15](#aso-015) | Bloqueios por nível de acesso e hierarquia | 306 |
| [ASO-016 / 16](#aso-016) | Serviços disponibilizados por unidade | 306 |
| [ASO-017 / 17](#aso-017) | Importação de arquivo CADÚNICO | 306 |
| [ASO-018 / 18](#aso-018) | Vinculação dos demais integrantes à família | 306 |
| [ASO-019 / 19](#aso-019) | Inclusão em acompanhamento socioeducativo a partir do atendimento | 306 |
| [ASO-020 / 20](#aso-020) | Parecer técnico por integrante ou responsável familiar | 306 |
| [ASO-021 / 21](#aso-021) | Quadro de atendimentos abertos enviados aos profissionais | 306 |
| [ASO-022 / 22](#aso-022) | Agendamento e registro de visitas domiciliares e a entidades | 306 |
| [ASO-023 / 23](#aso-023) | Ficha Plano Individual de Atendimento — PIA | 306 |
| [ASO-024 / 24](#aso-024) | Cadastro e consulta de acompanhamento PAEFI | 307 |
| [ASO-025 / 25](#aso-025) | Cadastro e consulta de acompanhamento PAIF | 307 |
| [ASO-026 / 26](#aso-026) | Situação de violência com encaminhamento ou acompanhamento PAEFI | 307 |
| [ASO-027 / 27](#aso-027) | Registro da averiguação de denúncia de violência | 307 |
| [ASO-028 / 28](#aso-028) | Participantes em turmas vinculadas aos serviços das unidades | 307 |
| [ASO-029 / 29](#aso-029) | Inclusão e consulta de família ou integrante nos serviços | 307 |
| [ASO-030 / 30](#aso-030) | Unificação de cadastro de pessoa física | 307 |
| [ASO-031 / 31](#aso-031) | Listagem e detalhe de atendimentos respeitando sigilo | 307 |
| [ASO-032 / 32](#aso-032) | Emissão do registro de frequência dos participantes | 307 |
| [ASO-033 / 33](#aso-033) | Atividades coletivas com integrantes e ações | 307 |
| [ASO-034 / 34](#aso-034) | Demanda encaminhada ao estabelecimento e atendimento a partir da origem | 307 |
| [ASO-035 / 35](#aso-035) | Condições do domicílio no cadastro familiar | 307 |
| [ASO-036 / 36](#aso-036) | Histórico social completo no prontuário da família | 307 |
| [ASO-037 / 37](#aso-037) | PIA com todas as medidas socioeducativas do assistido | 307–308 |
| [ASO-038 / 38](#aso-038) | Perfis por função nos estabelecimentos | 308 |
| [ASO-039 / 39](#aso-039) | Entradas de benefícios nas unidades com dados fiscais | 308 |
| [ASO-040 / 40](#aso-040) | Mapa georreferenciado de famílias por acompanhamento, programa e violência | 308 |
| [ASO-041 / 41](#aso-041) | Declaração de comparecimento após finalizar o atendimento | 308 |
| [ASO-042 / 42](#aso-042) | Reuniões e palestras realizadas em outras unidades | 308 |
| [ASO-043 / 43](#aso-043) | Emissão da carteirinha de benefício do cidadão | 308 |
| [ASO-044 / 44](#aso-044) | Lista de espera de benefícios por prioridade e decisão do setor | 308 |
| [ASO-045 / 45](#aso-045) | Desligamento de família ou indivíduo do programa social | 308 |
| [ASO-046 / 46](#aso-046) | Continuidade de acompanhamento entre unidades no próprio sistema | 308 |

### Relatórios: — itens 47–58

| ID / item do TR | Ação resumida | Página do PDF |
|---|---|---:|
| [ASO-047 / 47](#aso-047) | Relatório de benefícios liberados com seis campos mínimos | 308 |
| [ASO-048 / 48](#aso-048) | Relatório de famílias por situação | 308 |
| [ASO-049 / 49](#aso-049) | Relatório de extrema pobreza com classificação rastreável | 308 |
| [ASO-050 / 50](#aso-050) | Relatório de famílias com recebimento de Bolsa Família | 308 |
| [ASO-051 / 51](#aso-051) | Relatório de integrantes em acompanhamento | 309 |
| [ASO-052 / 52](#aso-052) | Relatório do Plano Individual de Atendimento — PIA | 309 |
| [ASO-053 / 53](#aso-053) | Formulário de atendimento e histórico de atendimento emitíveis | 309 |
| [ASO-054 / 54](#aso-054) | Formulários CRAS e CREAS no padrão SUAS | 309 |
| [ASO-055 / 55](#aso-055) | Formulário mensal para o IASES | 309 |
| [ASO-056 / 56](#aso-056) | Relatórios dos agendamentos por unidade | 309 |
| [ASO-057 / 57](#aso-057) | Quantitativos de triagem e atendimento por período, profissional e unidade | 309 |
| [ASO-058 / 58](#aso-058) | Relatório geral de atendimentos da unidade | 309 |


<a id="dependencias"></a>
## 3. Dados de outros módulos e formatos externos

### 3.1 Origens previstas — confirmar no repositório

| Ref. | Origem prevista | Dados/capacidade usados por Assistência Social | Limite do trabalho |
|---|---|---|---|
| **DEP-01** | Administração / Identidade / Perfis / Auditoria | Sessão, órgão, usuários, permissões, escopo e registro de ações. | Reutilizar autenticação e a convenção de módulos. Não criar outro login nem uma hierarquia de acesso ilimitado. |
| **DEP-02** | Pessoas / Cadastro Único municipal | ID da pessoa, identificação e contatos existentes; candidatos à unificação. | Uma pessoa canônica compartilhada. Família, vínculos, situação social e prontuário pertencem à Assistência. Não confundir cadastro municipal único com CADÚNICO nacional. |
| **DEP-03** | RH / Cadastro de profissionais, se houver | Pessoa do trabalhador, função e vínculo institucional; inscrição quando disponível. | Lotação socioassistencial, serviços, horários e permissões do profissional são configurados aqui. Não desenvolver folha nem consulta a conselho profissional. |
| **DEP-04** | Administração / Organograma / Endereços | Unidade institucional, responsável e endereço, quando já registrados. | Complementar código e configuração socioassistencial; não duplicar o órgão. Não presumir que código local seja CadSUAS. |
| **DEP-05** | Almoxarifado / Materiais / Compras, **se usados como origem dos benefícios materiais** | Benefício/material, fornecedor, nota, entrada, quantidade e valor disponíveis. | Usar o movimento real e a operação autorizada da origem quando adotados; não lançar duas entradas/saídas. Sem essa origem, desenvolver controle local mínimo de entradas/liberações exigido em 10/39/44/47, sem reconstruir Estoque/Compras. |
| **DEP-06** | GED / Arquivos privados / Relatórios | Armazenamento, anexos, emissão, impressão e versões documentais. | Fichas e modelos sociais pertencem ao pacote. Não expor prontuários em repositório público nem exigir outro assinador. |
| **DEP-07** | Processos / Requisições / Encaminhamentos, **se utilizados** | Referência do pedido, destino, responsável, histórico e decisão. | Reutilizar quando compatível. Encaminhamento entre unidades precisa funcionar aqui mesmo sem um processo administrativo geral; não criar protocolo jurídico obrigatório. |
| **DEP-08** | Componente cartográfico compartilhado, **se houver** | Base de mapa, projeção e componente de exibição. | Geometria familiar e filtros são dados sociais. Não criar SIG completo ou expor informações de famílias ao provedor de mapas. |

**Regra por item:** informar `Dados de outros módulos: DEP-xx — informação utilizada, serviço real localizado e falta existente`. Uma chamada que foi simulada não é integração real. Não escrever diretamente em tabelas de outro domínio para contornar seus controles.

Quando o serviço central necessário estiver ausente, registrar `DEPENDENCIA_OUTRO_MODULO` no resultado afetado e continuar as funções independentes. Alterações na origem ficam fora deste pacote, a menos que o usuário amplie expressamente o escopo. Não tornar uma integração opcional — como busca de fornecedor em Compras — impedimento artificial para o cadastro social exigido.

### 3.2 Dependências específicas da fonte e como testar

| Ref. | Requisitos | O que implementar | Ensaio e limite da comprovação |
|---|---|---|---|
| **EXT-CAD** | ASO-017, com reflexo em pessoas/famílias | Importador do arquivo CADÚNICO efetivamente disponibilizado à entidade, com contrato/versão identificados, validação e vínculo familiar. | Arquivo sintético conforme leiaute conhecido exercita o importador. Um CSV interno inventado testa apenas a carga canônica; não comprova compatibilidade CADÚNICO. Base real só por acesso autorizado e protegida. |
| **MOD-SUAS** | ASO-054 | Emissão dos formulários aplicáveis ao CRAS **e** CREAS, com campos e contagens mapeados aos registros. | Exemplar oficial/municipal identificado, versão/período e conferência de cada campo. RMA é referência a investigar, não equivalência automática de toda “prestação de contas no padrão SUAS”. |
| **MOD-IASES** | ASO-055 | Emissão mensal conforme formulário requerido, com unidade, competência e dados rastreáveis. | Modelo identificado e preenchimento com dados fictícios. Não foi identificado na pesquisa um exemplar inequivocamente correspondente ao item. Relatório inventado ou formulário de outro serviço não fecha o requisito. |
| **MAPA** | ASO-040 | Mapa real protegido, com coordenadas e filtros do conjunto completo autorizado. | Geometrias fictícias claramente identificadas e camada licenciada/autorizada. Registrar a fonte existente; não exigir novo provedor pago por suposição. |
| **DOCUMENTOS** | ASO-032/041/043/047–058 | Emissão real de frequência, declaração, carteirinha e relatórios. | Documentos gerados das operações, não pré-prontos. Modelos próprios de demonstração são permitidos onde o TR não prescreve padrão; SUAS/IASES continuam exigindo confirmação do modelo. |

**Não é necessário construir simuladores externos complexos.** Priorizar uma base de homologação no próprio CeleriFlow, amostras de arquivo, testes de contrato das fontes compartilhadas e modelos documentais. Não criar simulador de concessão BPC, gateway INSS ou transmissão SUAS apenas para animar a apresentação.

### 3.3 Manifesto do material de ensaio

O agente pode criar fixtures isoladas e testes automatizados, sem importar dados pessoais reais para o repositório. O usuário poderá popular pela interface. Entregar cada amostra com finalidade, formato, versão, campos, resultado esperado e nível de validade.

| Artefato de teste | Conteúdo necessário | Identificação obrigatória |
|---|---|---|
| Amostra CADÚNICO válida | Famílias/pessoas com relacionamento completo no leiaute confirmado. | Origem/versionamento do leiaute; **DADOS FICTÍCIOS**. |
| Amostra CADÚNICO com erros | Relação familiar inválida, campo inválido e tentativa de duplicação técnica. | Erros esperados por registro; sem rebaixar validadores de produção. |
| Amostra interna enquanto falta leiaute | Estruturas conceituais de F-IMPORT. | **FORMATO INTERNO DE TESTE — NÃO É ARQUIVO OFICIAL CADÚNICO**. |
| Formulários CRAS/CREAS | Exemplares identificados e matriz campo → fonte → regra → resultado. | Modelo, versão, competência e revisão técnica. |
| Formulário IASES | Exemplar fornecido/confirmado pela entidade responsável. | Não substituir por outro formulário do IASES sem correspondência. |
| Documentos comuns | PIA, frequência, comparecimento, carteirinha e relatórios emitidos. | Referência real aos registros DEMO, sem assinatura profissional ou benefício oficial fictícios apresentados como válidos. |

<a id="operacao"></a>
## 4. Regras operacionais e critérios transversais

### 4.1 Pessoa, família, integrante e domicílio não são a mesma entidade

Manter uma identidade municipal de pessoa, vínculos temporais à família, responsável familiar e condições do domicílio. Código familiar externo, ID familiar interno e documento da pessoa são chaves distintas. Não identificar família somente por endereço nem exigir CPF como condição universal de atendimento quando isso não estiver definido na fonte/configuração aplicável.

Os campos mínimos de uma ficha familiar são uma proposta de operação: identificação interna, responsável, integrantes com vínculos, endereço, unidade de referência, situação e dados sociais relevantes. Cada integrante aponta para uma pessoa; inclusão em programa/serviço/atividade usa esse vínculo, sem recriar a pessoa. Dados de renda ou Bolsa Família precisam de fonte e data; ausência de informação não é renda zero nem ausência de benefício.

**Unificação — ASO-030:** localizar possíveis duplicidades por identificadores confiáveis; mostrar comparação e referências afetadas; confirmação por usuário autorizado; conservar IDs externos, histórico e rastreabilidade. Mesmo nome ou endereço não autoriza fusão automática. Reassociar atendimentos, vínculos e benefícios sem repetir pagamentos/liberações ou somar rendas duplicadas. Não apagar a autoria de pareceres nem resolver silenciosamente conflito de família. Implementar um procedimento transacional ou reconciliado conforme a arquitetura real, não só “ocultar duplicados” na busca.

### 4.2 Importação CADÚNICO sem alterar o governo ou destruir o prontuário

Pipeline mínimo: **arquivo recebido → validação de formato/versão → leitura em área temporária → conferência de identidades/vínculos → resultado de importação → efetivação autorizada → resumo de importados/atualizados/rejeitados/conflitos**. Os registros rejeitados não produzem família parcial silenciosamente. Escolher unidade consistente de confirmação, por exemplo família e integrantes, e documentá-la.

Identificar lote/hash, origem, data de referência, código familiar e chave de cada pessoa. Reimportar o mesmo lote não duplica. Outra remessa do mesmo período pode conter correção: comparar versão/conteúdo em vez de descartar tudo pela competência. Divergências entre fonte externa e alteração local precisam de política explícita; não sobrescrever pareceres, PIA, benefícios, sigilo ou encaminhamentos com a importação cadastral.

Arquivo parcial não autoriza desligar famílias que não vieram nele. Importar uma base não significa atualizar o sistema nacional nem confirmar concessão de BPC/Bolsa Família. Confirmação de envio, autenticação governamental ou consulta online não são requeridas pelo verbo do item 17.

### 4.3 Recepção, triagem, atendimento direto e retorno

A recepção identifica pessoa/família, unidade e **serviço procurado**. A triagem usa essa escolha para encaminhar ao técnico habilitado da unidade; persistir o serviço, origem e destino. Não exigir coleta extensa de dados sensíveis na recepção só para mostrar um formulário grande.

**Atendimento direto é caminho completo:** selecionar pessoa, serviço, profissional e unidade autorizados; registrar o atendimento com vínculo de triagem ausente e verdadeiro. Não criar uma triagem oculta para todos, pois isso distorce ASO-005 e os quantitativos de ASO-057.

O atendimento registra data, profissional, serviço, pessoa/família, evolução pertinente, sigilo e situação. Pode gerar retorno, encaminhamento ou inclusão em acompanhamento pelo serviço real. Esses vínculos não criam automaticamente outro atendimento realizado. Concluir é operação identificada; a declaração de comparecimento só pode ser emitida após essa conclusão. Uma segunda impressão não registra novo comparecimento.

No quadro de abertos, mostrar tarefas realmente encaminhadas ao profissional. Agendamento futuro, visita e acompanhamento ativo não viram “atendimento em aberto” sem registro próprio. Atualizar a lista após conclusão e aplicar autorização antes de contagem ou entrega do payload.

### 4.4 Agenda e visitas

Configurar horários do profissional **por unidade**, validar o serviço e gerar a agenda desses horários. Não usar agenda livre desvinculada das disponibilidades. O retorno guarda o vínculo ao atendimento originário; confirmar a mesma solicitação duas vezes não cria dois agendamentos. Horário pode ser capacidade individual ou outra regra existente; a fixture usa capacidade 1 por profissional/horário. Não impor agenda grupal, recorrência complexa ou novo serviço de notificações.

Visita domiciliar tem família/endereço de referência; visita a entidade tem instituição/local. Ambas têm equipe, data agendada, situação e registro do que foi realizado. Agendada, realizada, cancelada ou não realizada são estados técnicos de exemplo, não nova tipificação legal. Não tratar agendamento como visita efetuada nem exigir foto, geolocalização do profissional ou rota otimizada.

### 4.5 Acompanhamentos, PIA e circulação entre unidades

Separar cadastro em programa, vinculação a serviço, atendimento pontual e acompanhamento continuado. **PAIF e PAEFI** têm tipos próprios, histórico e consultas identificáveis, preservando o foco de família e/ou indivíduo expresso na fonte. Uma tag no cadastro não substitui registros de acompanhamento recuperáveis.

O **PIA** de ASO-023/037 usa a mesma ficha e deve permitir múltiplas medidas socioeducativas vinculadas ao assistido. Campos propostos, a confirmar no modelo utilizado: identificação do assistido/unidade/profissional, referência, medidas, datas, ações/objetivos, responsáveis, acompanhamento e situação. Esses campos organizam o registro; não autorizam o sistema a decidir ou aplicar medida judicial. Emitir o PIA com todas as medidas e evoluções pertinentes, sem perder uma segunda medida por haver só um campo textual.

Encaminhamento entre unidades mantém ID, pessoa/família, motivo/serviço, origem, destino, profissional/equipe quando definidos e informações autorizadas. A unidade de destino visualiza sua demanda e abre o atendimento a partir da referência original. Não copiar toda a família nem conceder acesso automático a todas as peças sigilosas. A fonte não exige mensagem eletrônica externa ou integração judicial para esse intercâmbio interno.

Desligar de programa encerra **aquele vínculo**, conservando passado e outros vínculos. Não excluir a família, cancelar benefício federal ou encerrar automaticamente PAIF, PAEFI e PIA em conjunto.

### 4.6 Violência, pareceres e sigilo

Registrar o vitimado conforme ASO-026, situação, autoria e data, com opção de encaminhar ou iniciar acompanhamento PAEFI. Averiguação de denúncia é registro distinto e vinculado, não diagnóstico automático de que a denúncia foi confirmada. Não exigir detalhes gráficos ou informações alheias à finalidade; os cenários usam descrições mínimas e sintéticas.

Parecer tem técnico, data, sujeito — integrante ou responsável — e conteúdo recuperável. Preservar autoria e correções conforme a política existente. Classificar como sigiloso deve efetivamente restringir interface, API, pesquisa, arquivo, impressão, contagem e mapa. Mascarar só a tela enquanto o payload traz o texto completo não atende.

**Perfis e hierarquia:** ASO-015 tem redação pouco precisa; a proposta é aplicar permissão por função e estabelecimento, complementada por restrição de sigilo. Não presumir que chefe, gestor de benefícios ou administrador técnico de infraestrutura possa ler qualquer parecer. Registrar Q-AS03 antes de definir uma hierarquia que altere o sigilo profissional.

Usar pessoas fictícias, sem copiar prontuários reais. Não incluir nomes, renda, vitimização ou medidas nos logs de erro e telemetria de terceiros. A auditoria registra ação, ator, ID e momento; o conteúdo sensível fica no armazenamento autorizado.

### 4.7 Benefícios: cadastro, pedido, aprovação, liberação e entrada

**BPC** é cadastro/registro local conforme ASO-008. Identificar pessoa, referência/situação, data e fonte quando disponíveis. Não chamar registro local de concessão ou pagamento federal confirmado. Benefício eventual tem tipo e parâmetros de controle compatíveis com a política fornecida; não inventar critérios de elegibilidade ou valores oficiais.

A fila de espera guarda pedido, unidade, cidadão/família, benefício, quantidade ou valor quando pertinente, prioridade e decisão do setor competente. **Pendente não é liberado.** Para a demonstração, prioridades são cadastradas e a ordenação usa prioridade decrescente e data de solicitação como desempate técnico; registrar a regra adotada. Aprovação/liberação pode ocorrer numa mesma ação autorizada se o fluxo existente permitir; não impor duas comissões/duas pessoas.

Nos benefícios **materiais**, a entrada contém os cinco dados expressos de ASO-039: **número de NF, quantidade, nome do fornecedor, valor unitário e data**; além da unidade e do benefício aos quais pertence. Liberação referencia a entrada/linha para permitir a NF no relatório de ASO-047. Se uma liberação usar duas entradas, conservar alocações e somar sua quantidade uma única vez; valores iguais não identificam o mesmo fato.

**Decisão técnica da fixture:** a liberação confirmada de material consome a disponibilidade da entrada. Não exige uma etapa nova de “entrega” para concluir a POC. Se houver fluxo de entrega já existente, explicitar qual evento consome e qual evento compõe “liberado”; nunca consumir duas vezes. `saldo = entradas confirmadas − liberações com consumo confirmado`, ajustado por correções válidas conforme o mecanismo existente. Não adicionar requisição, licitação, transferência de depósito, inventário ou contabilidade como novas funções sociais.

O relatório mensal pode ser consultado por unidade, cidadão **ou** família. Uma liberação para um integrante ligado à família continua **um único fato**, não duas liberações por ter duas chaves de consulta. Distinguir quantidade por tipo/unidade de medida e valor monetário; não somar cesta, passagem e auxílio em reais num “total de unidades” sem significado.

BPC e benefícios monetários não recebem NF fictícia de entrada nem saldo físico. Q-AS07 registra o tratamento dos dados fiscais inaplicáveis; o requisito expresso de NF não será simplesmente eliminado do relatório material. Corrigir ou cancelar evento deve preservar a trilha e reconciliar os efeitos; não acrescentar rotinas financeiras de estorno além do mecanismo já usado.

### 4.8 Turmas, participantes, frequência e atividades coletivas

Turma tem identificação, unidade, serviço e classificação etária. Faixas são parâmetros de organização; a fonte não define idades, lotação máxima, matrícula escolar ou bloqueio automático por idade. No ensaio, testar a classificação e a identificação da pessoa fora da faixa; eventual recusa de inclusão exige regra administrativa fornecida.

Participação tem vínculo à pessoa e turma; atividade coletiva tem data, ação/ações, profissionais/unidade e integrantes. Um participante em duas ações do mesmo encontro não equivale a duas pessoas distintas atendidas. Reunião/palestra em outra unidade guarda **unidade registradora e local/unidade de realização**, sem duplicar o evento nas duas bases.

Emitir registro de frequência a partir da lista real de participantes e encontros. Se o sistema guarda marcações, distinguir presente, ausente e não registrado; “não marcado” não pode virar falta automática. Uma lista para coleta manual pode ser emitida quando assim usada, identificando o que ainda não foi registrado. Não incluir biometria, notas, aprovação escolar ou certificados de curso.

### 4.9 Mapa protegido e completo

ASO-040 exige georreferenciamento/mapa de famílias em acompanhamento, programa ou situação de violência. Usar **união de famílias** que atendem aos filtros; uma família que satisfaz mais de um critério não vira dois domicílios. Guardar a origem e referência da coordenada. Ausência de posição deve aparecer como “sem localização”, nunca como pin no centro do município ou coordenada zero.

O mapa consulta **todo o conjunto autorizado**, não apenas as dez famílias da página da tabela. Pode usar agrupamento espacial ou consulta por área para desempenho, desde que o conjunto completo seja alcançável e as contagens tenham escopo explícito. Legenda e filtro precisam indicar a situação correta sem inventar gráfico adicional obrigatório.

Não publicar o mapa no Portal Institucional/Transparência. Nem enviar ao provedor cartográfico nome, CPF, renda, informações de violência ou PIA como parâmetros. Dados sociais são sobreposição controlada pela aplicação. Uma família com posição conhecida pode não ser visível para certo perfil; contadores e payloads devem respeitar a mesma restrição.

### 4.10 Relatórios, extrema pobreza e formulários oficiais

Distinguir **eventos** e **pessoas/famílias únicas**: atendimento, triagem, agendamento, visita, participação e acompanhamento são medidas diferentes. O item 57 exige quantitativos separados de triagem e atendimento por período/profissional/unidade. Atendimento direto soma atendimento e zero triagem. Abrir um prontuário não gera atendimento.

Definir data usada em cada relatório: liberação em ASO-010/047; situação de referência em 48–51; início/ocorrência do atendimento em 53/57/58 conforme política registrada; horário agendado em 56. Estado concluído não deve ser inferido apenas por uma data. Não usar automaticamente a data de criação da linha como data do fato.

Para **Extrema Pobreza**, usar classificação com fonte/referência ou cálculo conforme regra configurada e validada pela entidade. Não fixar um valor legal por memória. Dados de renda incompletos devem permanecer “não avaliados/informação insuficiente”. Receber Bolsa Família, estar no CADÚNICO e ser classificado em extrema pobreza são situações distintas. Para o relatório Bolsa Família, usar vínculo/situação/fonte da referência escolhida, sem inferir recebimento pela mera importação cadastral.

Formulários **SUAS/IASES**: identificar exemplar/versão, unidade, competência, campos, fonte de cada dado e regra de agregação. Emitir a partir dos registros correspondentes; campos não fornecidos não viram zero nem textos fixos. A minuta interna pode testar o gerador, mas só marcar padrão compatível após conferir o modelo exigido. **Não implementar transmissão governamental quando o requisito é emissão.**

Todos os relatórios usam o recorte completo autorizado e são efetivamente imprimíveis/emitíveis pelo núcleo existente. Para estes itens, o TR não enumera formatos de exportação adicionais por relatório; preservar os formatos gerais aplicáveis sem impor XLSX/CSV como novas funções específicas. O PIA, formulário de atendimento e histórico não podem ser substituídos por listagens só com número/nome.

### 4.11 Concorrência, falhas e efeitos entre módulos

Confirmação de importação, atendimento, agendamento, unificação, liberação e encaminhamento deve ser validada no servidor. Idempotência é por operação/evento, não por igualdade de nome/data/valor. Repetir uma requisição não gera nova liberação; duas solicitações legítimas iguais continuam distintas quando registradas como eventos diferentes.

A operação que altera mais de um registro não pode ficar parcialmente confirmada sem estado de erro recuperável. Uma aprovação que dependa de estoque externo só informa efeito na origem depois de retorno efetivo. Falha de leitura da fonte não vira saldo zero, negativa de benefício ou lista vazia. Não usar reset do banco como solução de “limpar os testes”.

<a id="ux"></a>
## 5. Interface ERP profissional e eficiente

### 5.1 Organização das telas

| Área interna | Conteúdo/ações | Rastreabilidade principal |
|---|---|---|
| Unidades, profissionais e serviços | Código/endereço; inscrição profissional; vínculo/horários; serviços por unidade. | 2, 3, 13, 16, 38. |
| Pessoas e famílias | Busca única; composição familiar; domicílio; programas/serviços; prontuário e histórico. | 14, 18, 29, 30, 35, 36, 45. |
| Recepção e atendimentos | Serviço procurado; triagem; atendimento direto; quadro de abertos; retorno; declaração. | 4, 5, 12, 20, 21, 31, 41. |
| Agenda e visitas | Disponibilidade por profissional/unidade; retornos; domicílios e entidades; registros de realização. | 12, 13, 22, 56. |
| Acompanhamentos e PIA | PAIF, PAEFI, socioeducativo, medidas, situação de violência e averiguação; encaminhamentos entre unidades. | 19, 23–27, 34, 37, 46, 51–55. |
| Turmas e atividades | Faixa etária, serviços, participantes, frequência; atividades coletivas e reuniões/palestras externas. | 6, 7, 28, 32, 33, 42. |
| Benefícios | BPC; tipos eventuais; entradas; fila/decisão/liberação; controle mensal; carteirinha. | 8–11, 39, 43, 44, 47. |
| Mapa | Famílias dos critérios exigidos, filtros protegidos e tratamento de posição ausente. | 40. |
| Relatórios | Seleção do documento, filtros, prévia paginada e emissão integral. | 32, 41, 43, 47–58. |
| Configuração/importação | Permissões, arquivo CADÚNICO, parâmetros mínimos e modelos identificados. | 15, 17, 38, 54, 55. |

As áreas compartilham fichas e serviços. Abrir novo atendimento pela família preenche o contexto; encaminhar para PAEFI abre o registro vinculado; emitir relatório reaproveita filtros compatíveis. Não criar 57 telas independentes nem exigir redigitação do cidadão em cada ação.

### 5.2 Composição, fontes e densidade

Listagem desktop: **título/contexto + ação principal + filtros + tabela + paginação** dentro da área de trabalho. Evitar indicadores enormes, banners e prontuário completo empilhado acima da tabela. Fichas usam seções/abas, sem modais aninhados e sem criar fases administrativas artificiais.

| Elemento | Tamanho / entrelinha de referência | Peso |
|---|---|---|
| Título de página | 20 / 26 px | 600 |
| Seção/aba | 16 / 22 px | 600 |
| Campo, tabela, filtro, botão e erro | 14 / 20 px | 400; cabeçalhos 600 |
| Metadado secundário | 12 / 16 px | 400 |

São decisões do projeto herdadas dos MDs anteriores, não números do TR ou alegação de padrão universal. Preservar fonte do CeleriFlow; se não houver, usar fonte de sistema com preferência por Segoe UI/sans-serif. Mapear a tokens em `rem`; não baixar ou distribuir fontes, instalar outra biblioteca visual ou reduzir a raiz para compactar artificialmente.

Referências de tamanho mínimo: linha/controle próximos de 36 px no desktop; 44 px para toque e campo próximo de 16 px no celular; espaçamentos 4/8/12/16/24 px. Textos à esquerda, quantidades/valores à direita com unidade. Rótulo acompanha cor/ícone; foco e erro devem continuar visíveis.

### 5.3 Paginação e acesso integral

Começar com até 10 linhas por página no menor viewport de teste, ajustando à altura real. Busca, filtro, escopo e total no servidor; ordenação estável com desempate por ID. Não carregar a base completa e esconder linhas para simular paginação. Um registro da terceira página deve ser encontrado pela busca global.

Voltar à primeira página ao mudar o filtro; preservar filtro/ordem/página ao abrir e voltar da ficha. Mostrar total e intervalo corretos, carregando, vazio e erro distintos. Emissão usa o recorte inteiro; subtotal da página não recebe o nome “total geral”. Seleção para ação em lote tem alcance explícito.

**Exceções à ausência de rolagem:** prontuário extenso, conteúdo integral do parecer/PIA, documento emitido, mapa, agenda visual se já adotada, dispositivos pequenos e zoom. Permitir uma região de leitura coerente, com ações acessíveis. Não usar `overflow: hidden` para esconder campos, reduzir texto principal a 10 px ou cortar o histórico. Mapa e relatórios não podem ser removidos para fazer a tela caber.

### 5.4 Contexto, privacidade e desempenho de trabalho

A pessoa/família, unidade e serviço ficam visíveis durante o atendimento, com resumo mínimo. A faixa etária e os vínculos pertinentes ficam disponíveis no contexto, sem abrir várias janelas. Ação **Atender sem triagem** não pode obrigar a voltar à recepção para inventar um trâmite. Ação **Liberar benefício** informa pedido, quantidade, unidade, origem e efeito antes de confirmar.

Avisos pessoais mostram pendências, não conteúdo sensível em telas coletivas. Não expor detalhes de violência no cartão inicial. Teclado deve alcançar busca, seleção, abas, salvar, finalizar e imprimir, com preservação de foco. Não impor atalhos não existentes como requisito novo.

Testar viewport CSS **1366×650, 1440×800 e 1920×900**, área efetiva da apresentação, zoom de 200% e Chrome em celular real. Como metas de ensaio, não garantias: feedback perceptível de processamento em até 200 ms e busca paginada em até 1,5 s no percentil 95, com volume/rede/amostra informados. Priorizar correção e confidencialidade antes de otimizações; medir consultas e evitar requisição por célula.


<a id="base"></a>
## 6. Base fictícia, cenários integrados e checklists

**Regra para todo ensaio:** pessoas, unidades, famílias, documentos, rendas, prioridades, programas e medidas abaixo são sintéticos. Período-base: **01/09/2026 a 30/09/2026**; referência de idade/classificação: **19/09/2026**. Não são cadastros reais da Prefeitura, regras legais, concessões federais ou medidas judiciais. Identificadores DEMO não são números oficiais de CPF, NIS, CadSUAS ou inscrição profissional.

Os exemplos serão cadastrados pelas rotinas do sistema ou carregados por fixture isolada de homologação. Não desativar validação de produção para acomodar uma fixture. Quando o leiaute oficial exigir identificador formal, utilizar dados sintéticos admitidos pelo ambiente/contrato de teste, sem consultar uma pessoa real aleatória. Não inserir documentos de violência reais ou conteúdo gráfico nos testes.

### 6.1 F-REDE — unidades, profissionais e serviços

| ID DEMO | Cadastro | Conteúdo de teste |
|---|---|---|
| **U1** | CRAS Horizonte — DEMO | Código local U-DEMO-01; endereço completo fictício; serviço S1 — Atendimento familiar. |
| **U2** | CREAS Caminhos — DEMO | Código local U-DEMO-02; endereço completo fictício; serviço S2 — Atendimento especializado. |
| **U3** | Centro de Convivência — DEMO | Código local U-DEMO-03; endereço completo fictício; serviço S3 — Atividade coletiva. |
| **TEC-A** | Profissional A — DEMO | Número de inscrição de teste identificado; U1/S1; horários de 08h, 09h e 10h, duração de 30 minutos na agenda de ensaio. |
| **TEC-B** | Profissional B — DEMO | Número de inscrição de teste identificado; U2/S2; horários de 09h, 10h e 11h, duração de 30 minutos. |
| **TEC-C** | Profissional C — DEMO | U3/S3 e configuração própria de horários. |
| **REC-A** | Recepção — DEMO | U1, identificação/recepção/triagem conforme permissão; sem acesso ao conteúdo de parecer sigiloso. |
| **GES-B** | Gestor de benefícios — DEMO | Decide pedidos no escopo configurado; não ganha acesso automático a registros de violência. |
| **PAR-1** | Entidade parceira — DEMO | Nome, localização e contato de demonstração para visita e encaminhamento, se habilitada no fluxo. |

Para o ensaio de agenda, habilitar explicitamente as datas utilizadas em F-AGENDA; o exemplo não afirma que qualquer fim de semana ou dia esteja aberto no calendário real. Uma pessoa-profissional pode operar mais de uma unidade se a configuração permitir; horários e acesso continuam vinculados ao contexto.

### 6.2 F-FAMILIA — sete pessoas em três famílias

| Família | Integrantes de teste | Situação de referência | Programa/condição informada |
|---|---|---|---|
| **F1 — Família Horizonte DEMO** | P101, responsável; P102; P103 | Ativa; bairro Jardim DEMO | PAIF ativo; vínculo Bolsa Família informado para a referência. P103 tem acompanhamento socioeducativo. |
| **F2 — Família Caminhos DEMO** | P201, responsável; P202 | Ativa; bairro Centro DEMO | PAEFI de P202; registro local de BPC de P201; não recebe Bolsa Família segundo a informação da fixture. |
| **F3 — Família Nova DEMO** | P301, responsável; P302 | Em análise; bairro Norte DEMO | Informação de renda e de Bolsa Família ausente; sem inferência automática. |

Campos de identificação são inseridos no cadastro único de Pessoas quando essa for a fonte disponível. Datas para testes de faixa etária: P101 **22/02/1992**, P103 **05/05/2011**, P201 **10/01/1964**, P202 **07/07/2006** e P302 **12/12/2016**. Em 19/09/2026, P103 tem **15 anos**, P202 **20 anos**, P302 **9 anos**. Estes dados não definem idades mínimas legais de programas.

Condições do domicílio: registrar dados demonstrativos de material/tipo de moradia, água, esgoto, energia, ocupação e observações conforme os campos fornecidos ou modelo já existente. Essa lista é proposta de ensaio, não reprodução de um formulário completo do CADÚNICO. P102 será vinculado depois da criação inicial de F1 para demonstrar ASO-018; o estado final tem **3 + 2 + 2 = 7 pessoas**.

**F-UNIFICACAO — isolado:** criar P101-DUP representando a mesma pessoa de P101 com identificador externo conhecido de teste, mas contatos divergentes. O candidato tem uma referência de atendimento e a pessoa canônica tem um benefício. Comparar, escolher valores e unificar: uma pessoa canônica, as duas referências preservadas, nenhum benefício extra. Criar outro registro com mesmo nome e identificador distinto: não unificar automaticamente. Esta fixture não altera os sete registros do cenário-base.

### 6.3 F-ATEND — triagem, atendimento direto e relatórios

| ID | Data do fato | Unidade/profissional | Pessoa / família | Triagem | Situação |
|---|---|---|---|---|---|
| AT1 | 03/09/2026 | U1 / TEC-A | P101 / F1 | T1, realizada por TEC-A em U1 | Concluído |
| AT2 | 04/09/2026 | U1 / TEC-A | P201 / F2 | **Sem triagem** | Concluído |
| AT3 | 05/09/2026 | U2 / TEC-B | P202 / F2 | **Sem triagem**, origem de encaminhamento identificada | Concluído e sigiloso |
| AT4 | 06/09/2026 | U1 / TEC-A | P101 / F1 | T2, realizada por TEC-A em U1 | Concluído |
| AT5 | 07/09/2026 | U2 / TEC-B | P103 / F1 | T3, realizada por TEC-B em U2 | Concluído |
| AT6 | 08/09/2026 | U1 / TEC-A | P301 / F3 | T4, realizada por TEC-A em U1 | Aberto e encaminhado ao TEC-A |

O papel profissional acumulando a triagem nesta fixture é configuração de teste; na operação real, quem realizou triagem e quem atendeu podem ser pessoas distintas e devem ser identificados separadamente.

**Conferência de setembro no cenário-base:** **4 triagens**, **5 atendimentos concluídos**, **2 atendimentos diretos concluídos** e **1 atendimento aberto**. U1 tem 3 triagens e 3 atendimentos concluídos; U2 tem 1 triagem e 2 atendimentos concluídos. Entre os concluídos são **4 pessoas distintas**, **2 famílias distintas** e 5 eventos de atendimento. Não apresentar a soma 4 + 5 como nove atendimentos.

O quadro de abertos do TEC-A mostra **AT6**. Finalizar AT6 num teste separado faz o quadro ficar vazio e eleva concluídos para **6**, sem criar T5. Emitir declaração de AT1 após conclusão; tentar emitir de AT6 no estado inicial deve ser recusado. Uma impressão repetida não aumenta qualquer contador.

**Teste de sigilo:** REC-A não consegue abrir o conteúdo de AT3 por tela, URL, API, relatório ou arquivo. TEC-B tem permissão de leitura no contexto de U2. Usuário externo ao órgão não recebe sequer o conjunto protegido. Um gestor pode ter acesso a estatísticas agregadas se configurado, mas isso não autoriza o texto do parecer.

### 6.4 F-AGENDA/VISITA — eventos planejados e realizados

AG1: retorno de AT1, **22/09/2026 às 09h**, U1/TEC-A. AG2: consulta de P201, **23/09/2026 às 10h**, U1/TEC-A. AG3: consulta de P301, **24/09/2026 às 08h**, U1/TEC-A, depois cancelada com registro. O relatório com todas as situações mostra **3 agendamentos**; somente ativos, **2**. Estes agendamentos não aumentam os cinco atendimentos realizados de F-ATEND.

Tentar AG1 novamente com a mesma operação retorna o mesmo registro. Outra pessoa tentando o mesmo horário individual gera conflito, não nova vaga. Tentar horário fora da disponibilidade deve informar indisponibilidade; não criar agenda extra automaticamente.

VD1: visita domiciliar à F1 em **25/09/2026**, equipe TEC-A e apoio autorizado, endereço da família. VP1: visita à PAR-1 em **26/09/2026**, equipe TEC-B, endereço da entidade. Registrar planejamento e depois realização de VD1, mantendo VP1 planejada. Resultado: **2 visitas agendadas**, **1 realizada**, **1 ainda planejada**. A visita não entra como consulta individual em ASO-057 por mera existência; o mapeamento oficial dos relatórios é separado.

### 6.5 F-ACOMP/PIA — continuidade e encaminhamento

**PAIF-F1:** acompanhamento familiar da F1 em U1; identificação, técnico, início, registros de acompanhamento e situação. **PAEFI-P202:** acompanhamento individual de P202/F2 em U2, relacionado ao caso VIO-1. **SOC-P103:** acompanhamento socioeducativo de P103/F1 em U2, iniciado pela opção no atendimento AT5.

PIA-P103 contém **duas medidas fictícias**, MED-A e MED-B, cada uma com referência, período, profissional, ação prevista e evolução. MED-A recebe dois registros de evolução; MED-B, um. O relatório deve mostrar **2 medidas e 3 evoluções** vinculadas, não a última medida sobrescrevendo a anterior. Não considerar esses códigos decisões judiciais reais.

VIO-1: situação de violência com P202 como vitimado, descrição mínima de teste e sigilo. AVE-1: averiguação vinculada à denúncia, com registro do profissional e situação “em averiguação”. Não afirmar culpa, resultado pericial ou confirmação automática de violência. Testar a opção de encaminhar e a opção de acompanhamento no PAEFI em cenários separados.

ENC-1: encaminhamento de F2/P202 de U1 para U2, originado do contexto familiar do atendimento AT2. A unidade destino vê sua demanda com informações autorizadas e inicia AT3 **sem duplicar P202, F2 ou ENC-1**. ENC-2: continuidade de P103 entre unidades, com destino e registro de recebimento/atendimento compatíveis com a operação adotada. Não liberar outros prontuários sigilosos da família no destino.

No estado-base, os integrantes em acompanhamentos individualizados são **P103 e P202**. F1 também possui acompanhamento familiar PAIF; não marcar seus três integrantes como três acompanhamentos individuais sem uma regra documentada. Relatório de família e relatório de integrante mantêm essa distinção. No recorte ampliado que inclui membros do PAIF-F1: P101/P102/P103 têm vínculo familiar, P103 tem também vínculo socioeducativo e P202 tem PAEFI; são **5 relações e 4 pessoas únicas**. Em teste separado, desligar um vínculo de programa de F1 e verificar que PAIF, PIA e atendimentos continuam conservados.

### 6.6 F-TURMA — classificação, frequência e atividade coletiva

TJ: turma Jovens DEMO, U3/S3, faixa demonstrativa **12–17 anos**, com P103. TA: turma Adultos DEMO, U3/S3, faixa **18 anos ou mais**, com P101, P201 e P202. Mostrar a faixa e a idade na referência; P202 não pertence à faixa de TJ. Não criar regra automática de exclusão sem política definida.

Para TA, encontro EN1 em **09/09/2026** com os três presentes; EN2 em **16/09/2026** com P101 e P202 presentes, P201 ausente. Emissão consolidada: **6 oportunidades de presença**, **5 presenças**, **1 ausência**, **3 participantes distintos**. Não são seis pessoas. Em teste separado, deixar uma marcação não registrada: ela deve ser distinguível de ausência.

AC1: atividade coletiva com os três integrantes de TA e **duas ações** no mesmo encontro. Manter 3 participantes e 2 ações; não multiplicar para seis participantes. RP1: reunião/palestra registrada por U1, realizada na U3 em **17/09/2026**; gravar unidade realizadora/local, data e identificação do evento, sem replicar o cadastro em cada unidade.

### 6.7 F-BEN — entradas, liberação, fila e relatórios

Benefício material **CESTA-DEMO**, unidade de medida “unidade”. Fornecedores e notas são fictícios; não são NF-e emitidas oficialmente.

| Entrada | Unidade | NF / fornecedor de teste | Data | Quantidade | Valor unitário | Total calculado |
|---|---|---|---|---:|---:|---:|
| E1 | U1 | NF-DEMO-001 / Fornecedor A DEMO | 01/09/2026 | 40 | R$ 100,00 | R$ 4.000,00 |
| E2 | U1 | NF-DEMO-002 / Fornecedor B DEMO | 02/09/2026 | 10 | R$ 120,00 | R$ 1.200,00 |
| E3 | U2 | NF-DEMO-003 / Fornecedor A DEMO | 02/09/2026 | 20 | R$ 110,00 | R$ 2.200,00 |
| **Total** | | | | **70** | | **R$ 7.400,00** |

| Liberação | Unidade | Família / cidadão | Entrada | Data da liberação | Quantidade | Valor de conferência |
|---|---|---|---|---|---:|---:|
| L1 | U1 | F1 / P101 | E1 | 05/09/2026 | 2 | R$ 200,00 |
| L2 | U1 | F2 / P201 | E2 | 06/09/2026 | 1 | R$ 120,00 |
| L3 | U2 | F1 / P103 | E3 | 08/09/2026 | 3 | R$ 330,00 |
| **Total** | | | | | **6** | **R$ 650,00** |

Saldo após liberações: **64 unidades / R$ 6.750,00**. U1: **47 unidades / R$ 4.880,00**; U2: **17 unidades / R$ 1.870,00**. Por família, F1 recebeu **5 unidades / R$ 530,00**, e F2 **1 unidade / R$ 120,00**. Por cidadão, P101 recebeu 2, P201 recebeu 1 e P103 recebeu 3. Consultar por família e cidadão não soma uma liberação duas vezes.

Fila de espera separada: Q1/F3, prioridade Alta, solicitação **10/09**, 1 unidade; Q2/F2, Normal, **09/09**, 1 unidade; Q3/F1, Alta, **11/09**, 2 unidades. Pela ordenação proposta, **Q1 → Q3 → Q2**. Enquanto pendentes, as três não alteram as seis unidades liberadas. Em ensaio separado, aprovar/liberar Q1 em U1 usando E1: total liberado passa a **7**, saldo total a **63**, valor liberado a **R$ 750,00** e saldo a **R$ 6.650,00**. Reenviar a mesma decisão não duplica a liberação.

BPC-P201: cadastro local de BPC com referência e situação informada; não integra as entradas E1–E3 nem produz pagamento federal. Benefício eventual monetário, se configurado, usa quantidade/valor e aplicabilidade fiscal próprios em cenário separado; não inventar NF para ele. Carteirinha de P101 referencia o benefício/contexto real cadastrado, sem dados de violência ou PIA. Layout demonstrativo não precisa de foto, QR ou assinatura não previstos.

**NF múltipla — teste separado:** uma liberação de 3 unidades usa 2 de E1 e 1 de E2, total R$ 320,00. O relatório identifica as duas origens, mas o total permanece 3 unidades, não 6. O detalhe de NF nunca deve ser obtido por “última entrada do benefício” sem vínculo real.

### 6.8 F-RENDA/REL — situação, extrema pobreza e Bolsa Família

| Família | Renda mensal DEMO | Integrantes na referência | Per capita DEMO | Classificação pelo parâmetro de ensaio |
|---|---:|---:|---:|---|
| F1 | R$ 600,00 | 3 | R$ 200,00 | Incluída |
| F2 | R$ 600,00 | 2 | R$ 300,00 | Não incluída |
| F3 | Não informada | 2 | Não calculado | Informação insuficiente |

**Limiar puramente demonstrativo: renda per capita menor ou igual a R$ 250,00. NÃO é limite legal afirmado.** O sistema registra que a regra é DEMO e exige substituição/validação antes de uso oficial. A emissão de extrema pobreza retorna F1 e informa F3 como não avaliável no quadro de qualidade, sem incluí-la silenciosamente como renda zero. Se a regra real usar classificação importada em vez de cálculo, aplicar esse modelo com sua fonte/referência.

Situação cadastral: **2 ativas e 1 em análise**. Bolsa Família: **1 com recebimento informado na referência (F1), 1 sem recebimento informado (F2) e 1 situação desconhecida (F3)**. O relatório de beneficiárias traz somente F1, com fonte/data; cadastro local de BPC de P201 não a converte em família de Bolsa Família.

### 6.9 F-MAPA/PAG — conjuntos completos sem divulgar dados

**F-MAPA é independente das três famílias financeiras.** Preparar famílias M01–M23 com posições fictícias e verificadas para o ensaio: acompanhamento em M01–M11 (**11**); programa em M08–M19 (**12**); situação de violência em M18–M23 (**6**). São **23 famílias geolocalizadas na união**, não 29. Há 4 famílias na interseção acompanhamento/programa e 2 na interseção programa/violência; nenhuma interseção tripla.

Adicionar M24–M25 em programa **sem coordenadas**. Resultado completo: **25 famílias elegíveis, 23 localizadas e 2 sem localização**. O filtro programa corresponde a 14 famílias, das quais 12 localizadas. Uma tabela de dez linhas não limita o mapa a dez pinos. Esses totais se referem ao perfil autorizado para o conjunto completo; um perfil sem acesso a violência não pode descobrir a classificação pelo payload, legenda ou contador restrito.

**F-PAG isolado:** 27 cadastros ou atendimentos em base própria para testar páginas **10/10/7**, busca do registro da terceira página e emissão com os 27 registros. Não somar essa fixture às estatísticas de F-ATEND. Testar limites inclusivos de 01/09 e 30/09, exclusão de 31/08 e 01/10 e período vazio.

### 6.10 F-IMPORT — carga, repetição e conflito

Enquanto não houver leiaute confirmado, esta é uma estrutura conceitual de teste, **não formato oficial CADÚNICO**. Após obter o leiaute, codificar as amostras pelo adaptador verdadeiro.

Lote A: **2 famílias e 5 integrantes** em estado inicial vazio. Resultado: 2 famílias e 5 pessoas/vínculos, sem prontuário técnico inventado. Reimportação idêntica: continua 2/5, sem nova concessão. Lote B atualizado: adiciona **1 família e 2 integrantes**, e altera o endereço de uma das famílias; resultado após política de conferência: **3 famílias e 7 integrantes**, com histórico do endereço.

Lote C inclui pessoa apontando para família inexistente e identificador conflitante: apresentar rejeições/conflitos com motivo, sem abandonar chaves ou unir pessoas por nome. Nenhum arquivo pode sobrescrever o parecer sigiloso de teste já cadastrado. Executar os lotes em cenário isolado para não misturar famílias nacionais sintéticas com F-FAMILIA.

### 6.11 F-FORM — formulário oficial e prova de emissão

Preparar três matrizes: **CRAS**, **CREAS** e **IASES mensal**. Para cada campo do modelo identificado: nome/código oficial, definição, unidade de contagem, período, origem, filtro de situação, regra de deduplicação e resultado da fixture. Famílias acompanhadas, novas famílias, pessoas, triagens, atendimentos, grupos, participações e medidas não são substitutos uns dos outros.

Emitir cada exemplar com os dados do cenário correspondente, verificando formato, cabeçalhos, competência, campos obrigatórios e totais. Campos ausentes ficam pendentes; não inferir situação clínica, faixa de renda, medida ou resposta técnica. A folha de teste pode ser marcada **DEMONSTRAÇÃO**, sem simular protocolo de entrega do governo. Um relatório local pronto com cabeçalho “SUAS” ou “IASES” não comprova padrão.

### 6.12 Checklists de requisitos compostos

**CK-ENTRADA — ASO-039:** cinco campos expressos: número da nota fiscal; quantidade; nome do fornecedor; valor unitário; data de entrada. Contextos necessários: unidade e benefício. Testar reabertura e coerência com a liberação.

**CK-BEN-REL — ASO-047:** seis campos expressos: nota fiscal; bairro; tipo do benefício; nome do beneficiário; data de liberação; quantidade. Verificar vínculo do bairro/beneficiário na referência registrada, sem trocar a NF pela do último fornecedor.

**CK-PIA — ASO-023/037/052:** ficha persistida; assistido/unidade/profissional identificados; múltiplas medidas e evoluções; relatório correspondente; acesso restrito. O conteúdo detalhado do modelo precisa ser confirmado; estes são controles de implementação, não lista de campos oficiais atribuída ao TR.

**CK-ENC — ASO-034/046:** origem e destino; assistido canônico; referência/motivo/serviço; informações de origem autorizadas; demanda visível no destino; atendimento derivado; histórico preservado. Encaminhar não multiplica pessoa/família nem conclui atendimento de destino.

**CK-QUANT — ASO-057:** contagem de triagens; contagem de atendimentos realizados; filtro por período; por profissional; por unidade; diretos sem triagem; abertos fora do total de concluídos; mesmas regras no documento e na tela.

**CK-SIGILO — ASO-015/031/038/040:** permissão no servidor; perfil/unidade/função; relato sigiloso; anexos; relatórios; mapa/pinos; contadores; busca; URLs diretas; ausência de dados sensíveis no payload de usuário não autorizado.


<a id="itens"></a>
## 7. Desenvolvimento item a item

Cada citação conserva a numeração do TR. Implementação, dependências, demonstração, aceite e limites são instruções deste plano. As ressalvas não dispensam o requisito e não são apresentadas como decisões oficiais.

<a id="aso-002"></a>
#### ASO-002 — Unidades da rede socioassistencial com código e endereço

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 2, p. 305:**

> Permitir o cadastramento das Unidades da rede Socioassistencial, possibilitando inserir codigo de Unidade e endereço completo;

**Implementação:** Cadastrar e manter as unidades da rede com identificação, código e endereço completo. Reutilizar unidade institucional existente quando for a mesma entidade, complementando a configuração socioassistencial. Unidade deve ser selecionável nos profissionais, serviços, atendimentos, entradas de benefícios, encaminhamentos e relatórios. Guardar referência estável; renomear não muda a autoria histórica dos atendimentos.

**Dados de outros módulos / formatos:** DEP-01 e DEP-04: órgão, unidade/endereço e autorização. O cadastro da rede é entrega deste módulo, não depende de uma API CadSUAS.

**Demonstração:**

1. Criar U1, U2 e U3 de F-REDE, com códigos e endereços fictícios completos; salvar e reabrir.
2. Selecionar U2 no atendimento e no recebimento de benefício; conferir que suas informações são as cadastradas.
3. Em outra sessão autorizada, pesquisar as três unidades e emitir consulta filtrada por U1.

**Aceite técnico:** As três unidades persistem e são reutilizadas pelas operações. Código e endereço não ficam somente no título de um card; o filtro de unidade não mistura eventos de unidades diferentes.

**Atenção / limite:** Código local não é código governamental validado. Não exigir geolocalização da unidade, integração CadSUAS ou hierarquia adicional para esse item. Q-AS02: identificação das unidades e catálogos.

<a id="aso-003"></a>
#### ASO-003 — Profissionais com número de inscrição

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 3, p. 305:**

> O software deverá permitir o cadastro de todos os profissionais, juntamento com o número de inscrição;

**Implementação:** Criar/manter cadastro de profissionais, com pessoa, nome e número de inscrição, identificando o tipo da inscrição quando informado. Vincular unidades, funções/serviços e horários necessários à agenda e ao encaminhamento. Inscrição, ID do profissional e usuário de login são dados distintos; não usar CPF como substituto silencioso do número de inscrição.

**Dados de outros módulos / formatos:** DEP-02/DEP-03: identidade e dados profissionais existentes; DEP-01: conta/permissões. Configuração de atendimento é própria de Assistência Social.

**Demonstração:**

1. Cadastrar TEC-A/TEC-B/TEC-C e suas inscrições sintéticas conforme F-REDE.
2. Selecionar TEC-A na triagem e na agenda da U1; reabrir o cadastro e conferir a inscrição.
3. Trocar a unidade de contexto e verificar os profissionais nela habilitados.

**Aceite técnico:** O número de inscrição é armazenado e recuperado junto do profissional correto; o mesmo profissional pode ser referenciado nos atendimentos sem redigitação ou novo cadastro de pessoa.

**Atenção / limite:** Q-AS02: o TR não define o órgão emissor da inscrição nem um formato único para todas as profissões. Não impor CRESS/CRP/CRM a todos nem validar registro externo por suposição.

<a id="aso-004"></a>
#### ASO-004 — Triagem orientada pelo serviço informado na recepção

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 4, p. 305:**

> Realização da triagem para envio ao técnico da unidade, de acordo com o serviço marcado no ato da recepção;

**Implementação:** Na recepção, registrar o serviço procurado e a unidade. Disponibilizar triagem vinculada à pessoa/família e à recepção, permitindo enviar ao técnico da unidade apto ao serviço selecionado. Preservar serviço original, responsável/data da triagem e técnico/destino. O envio deve aparecer na caixa/quadro do destinatário; não basta alterar um campo na origem.

**Dados de outros módulos / formatos:** DEP-01/DEP-02 para identidade, permissão e pessoa. Serviço/profissional/unidade vêm dos cadastros sociais; DEP-07 somente se a tramitação já usar o núcleo.

**Demonstração:**

1. Na U1, recepcionar P101 pelo serviço S1; realizar T1 e enviar ao TEC-A.
2. Entrar como TEC-A e abrir a demanda recebida com o mesmo serviço e pessoa.
3. Conferir F-ATEND: T1/T2/T4 na U1 e T3 na U2, sem criar triagem para AT2/AT3.

**Aceite técnico:** O serviço informado na recepção efetivamente orienta o técnico e chega ao destinatário. As quatro triagens da fixture são registros próprios e não se confundem com os cinco atendimentos concluídos.

**Atenção / limite:** Não tornar triagem obrigatória para qualquer atendimento: ASO-005 exige caminho independente. Q-AS04: sequência e atribuição de serviço/técnico.

<a id="aso-005"></a>
#### ASO-005 — Atendimento direto sem triagem prévia

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 5, p. 305:**

> Permitir realizar um atendimento sem a necessidade do uma triagem previa;

**Implementação:** Oferecer a ação explícita de atendimento direto para pessoa, unidade, serviço e profissional autorizados. Reutilizar o mesmo formulário, prontuário, conclusão e emissão do atendimento comum, mas com origem direta e sem registro de triagem fictício. Na persistência, tratar a ausência de triagem como válida; não preencher uma chave falsa.

**Dados de outros módulos / formatos:** DEP-01/DEP-02; os demais dados são nativos do módulo. Não depende de Protocolo, agenda prévia ou triagem.

**Demonstração:**

1. Abrir AT2 de P201 diretamente na U1/TEC-A e concluir.
2. Abrir AT3 na U2 a partir da demanda de encaminhamento, ainda sem triagem, e concluir conforme a permissão.
3. Emitir a consulta de quantitativos: ambos aumentam atendimentos em 2 e triagens em 0.

**Aceite técnico:** Criar, salvar, concluir, consultar e emitir documento funcionam sem passagem obrigatória pela recepção/triagem. O histórico identifica o caminho direto e os totais não inventam triagens.

**Atenção / limite:** Permissão e informações mínimas continuam válidas; “sem triagem” não significa permitir qualquer usuário atender fora de seu escopo.

<a id="aso-006"></a>
#### ASO-006 — Cadastro de turmas

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 6, p. 305:**

> Permitir cadastro de Turmas;

**Implementação:** Manter turma com identificação/nome, unidade e contexto de serviço a que pertence, reutilizando o cadastro para participantes, classificação e frequência. O vínculo de serviço deve permitir demonstrar ASO-028, sem criar tabela diferente para cada unidade. Usar situação/período quando necessários à operação existente, sem assumir calendário escolar.

**Dados de outros módulos / formatos:** Unidades/serviços do próprio módulo; DEP-01 para escopo e DEP-06 para emissão relacionada. Não depende do módulo de Educação.

**Demonstração:**

1. Cadastrar TJ e TA em U3/S3.
2. Reabrir a ficha, consultar os vínculos e usar a mesma turma ao adicionar participantes e emitir frequência.
3. Pesquisar uma turma em outra página de uma listagem ampliada.

**Aceite técnico:** Turmas são cadastros persistidos e referenciáveis, não rótulos livres repetidos em cada participação. Alteração de nome preserva ID e frequência existente.

**Atenção / limite:** Não criar escola, matrícula acadêmica, boletim, certificado, mensalidade ou limite de vagas não fornecido pelo TR.

<a id="aso-007"></a>
#### ASO-007 — Classificação de turmas por faixa etária

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 7, p. 306:**

> permitir classificação de Turmas por faixa etária;

**Implementação:** Permitir definir/aplicar faixa etária à turma e consultar a classificação. Armazenar limites e referência adotada quando calculada a idade; tratar faixa aberta. Ao selecionar participantes, apresentar classificação e compatibilidade segundo os parâmetros da entidade, sem impor exclusão automática apenas a partir deste item.

**Dados de outros módulos / formatos:** DEP-02: data de nascimento quando disponível; cadastro de turma social é a fonte local.

**Demonstração:**

1. Classificar TJ em 12–17 e TA em 18 ou mais, parâmetros DEMO.
2. Conferir na referência 19/09/2026 que P103 tem 15 anos e P202 tem 20.
3. Consultar turmas por faixa e identificar que P202 não está na faixa de TJ; confirmar política sem alterar a pessoa.

**Aceite técnico:** A faixa é persistida e usada na consulta/apresentação; não é apenas parte do nome. Idade ausente não é zero e referência de idade fica identificada.

**Atenção / limite:** Q-AS05: idades, referência e eventual bloqueio de inclusão dependem da configuração fornecida. Não codificar faixa oficial de um serviço por memória.

<a id="aso-008"></a>
#### ASO-008 — Cadastro local de BPC

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 8, p. 306:**

> Permitir o cadastro de BPC;

**Implementação:** Disponibilizar cadastro identificado como BPC, associado ao cidadão, com referência, situação e data/fonte da informação quando existentes. Recuperar esse registro na ficha pessoal/familiar. Distinguir o tipo BPC de benefícios eventuais distribuídos por unidade, sem tratar todos como estoque material.

**Dados de outros módulos / formatos:** DEP-02: cidadão; registro específico é social. Fonte de situação pode ser informação fornecida/arquivo autorizado, a identificar; não presumir serviço INSS.

**Demonstração:**

1. Cadastrar BPC-P201 com situação e referência de demonstração.
2. Abrir P201 e F2 e localizar o mesmo registro.
3. Conferir que E1–E3 e as seis unidades liberadas permanecem inalterados.

**Aceite técnico:** O BPC é cadastrado e consultável por cidadão, sem gerar uma liberação material ou pagamento federal. Situação informada e procedência ficam identificadas.

**Atenção / limite:** Q-AS06: alcance de “cadastro de BPC”. Não desenvolver análise automática de direito, concessão/pagamento federal, perícia ou conector INSS sem nova definição.

<a id="aso-009"></a>
#### ASO-009 — Cadastro de benefícios eventuais

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 9, p. 306:**

> Permitir o cadastro de Benefícios Eventuais;

**Implementação:** Criar/manter os tipos de benefícios eventuais necessários à operação, com identificação, descrição, natureza material/monetária quando adotada, unidade de medida e parâmetros fornecidos. Disponibilizar o tipo nos pedidos, entradas materiais, liberações e relatórios. Um tipo não é uma concessão a um cidadão.

**Dados de outros módulos / formatos:** DEP-05 quando já houver catálogo material central; manter referência única. Regras/tipos sociais pertencem a Assistência Social.

**Demonstração:**

1. Cadastrar CESTA-DEMO como benefício material em unidades.
2. Selecioná-lo numa entrada, num pedido de espera e numa liberação.
3. Em cenário separado, cadastrar tipo monetário DEMO e verificar tratamento sem NF/saldo físico falsos.

**Aceite técnico:** Tipo é reutilizado de forma coerente; cadastro não aumenta automaticamente quantidade liberada. Quantidades/unidades e valores são distinguíveis.

**Atenção / limite:** Q-AS06/07: critérios e tratamento de benefícios não materiais. Não inventar valor mínimo, periodicidade, renda elegível ou regra universal de aprovação.

<a id="aso-010"></a>
#### ASO-010 — Controle mensal de benefícios liberados por unidade, cidadão ou família

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 10, p. 306:**

> Controlar mensalmente os benefícios liberados por unidade, cidadão ou família;

**Implementação:** Disponibilizar consulta mensal das liberações efetivadas, com filtros independentes por unidade, cidadão e família e detalhamento por benefício. O registro deve ter identidade única e data de liberação; pedidos pendentes e simples entradas não compõem o total. Agregar quantidades compatíveis e valores sem duplicar o evento pelos vínculos familiar/pessoal.

**Dados de outros módulos / formatos:** DEP-02 para pessoa; DEP-05 se origem material integrada. Pedidos/liberações, unidade e família são fontes sociais; DEP-06 para consulta/relatório.

**Demonstração:**

1. Efetivar L1/L2/L3 de F-BEN e consultar setembro: 6 unidades liberadas, R$ 650,00 de conferência.
2. Filtrar U1: 3 unidades; U2: 3. F1: 5; F2: 1; P101: 2; P201: 1; P103: 3.
3. Deixar Q1/Q2/Q3 pendentes e repetir tecnicamente L1: os totais não mudam.

**Aceite técnico:** Os diferentes filtros chegam às mesmas três liberações de origem. Quantidade e valor não aumentam por reenvio, nem pela consulta por família e cidadão ao mesmo tempo.

**Atenção / limite:** Não chamar pedido aprovado ou benefício cadastrado de pagamento efetivado. Q-AS07 define o evento operacional de “liberado” e a eventual integração de disponibilidade.

<a id="aso-011"></a>
#### ASO-011 — Programas sociais e vínculo de cidadãos

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 11, p. 306:**

> Permitir o cadastro de programas sociais, e assim vincular os cidadãos nos programas desejados;

**Implementação:** Manter cadastro de programas e vincular cidadãos pelo identificador canônico, registrando início/situação e demais dados existentes necessários ao acompanhamento. Permitir consultar os participantes e recuperar programas no contexto da pessoa/família. O mesmo núcleo de vínculo deve suportar o desligamento do item 45.

**Dados de outros módulos / formatos:** DEP-02 para pessoas; família e programas são sociais. Dados oficiais de recebimento, quando usados, têm fonte/competência identificadas.

**Demonstração:**

1. Cadastrar programa DEMO e vincular P101 e P202.
2. Abrir as pessoas e conferir os programas correspondentes; recarregar.
3. Em teste separado, desligar o vínculo de P101 e verificar histórico e permanência do vínculo de P202.

**Aceite técnico:** Programa e associação são persistidos e consultáveis individualmente. Adesão local não se apresenta como aprovação federal e desligamento não apaga a pessoa.

**Atenção / limite:** Não presumir que toda pessoa de uma família participa de todos os programas de um integrante. Bolsa Família e BPC mantêm identificação própria quando registrados.

<a id="aso-012"></a>
#### ASO-012 — Atendimento com agendamento de retorno

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 12, p. 306:**

> Permitir o registro do atendimento, com possibilidades de agendar um retorno, para facilidade do técnico que esteja atendendo;

**Implementação:** Registrar o atendimento com sua identificação, data, técnico, pessoa/família e serviço e disponibilizar agendamento de retorno no próprio contexto. O retorno usa disponibilidade da agenda, herda o assistido e conserva o vínculo ao atendimento original. Registrar o atendimento sem exigir retorno quando não necessário.

**Dados de outros módulos / formatos:** DEP-02; atendimentos/agenda são nativos. DEP-07 somente se o fluxo existente utilizar encaminhamento central.

**Demonstração:**

1. Concluir AT1 e agendar AG1 para 22/09 às 09h, U1/TEC-A.
2. Abrir a agenda e retornar ao atendimento de origem pelo vínculo.
3. Salvar AT2 sem retorno; repetir AG1 tecnicamente e conferir apenas um agendamento.

**Aceite técnico:** Atendimento e retorno ficam ligados e recuperáveis; agendamento não cria um segundo atendimento concluído nem depende de redigitar a família.

**Atenção / limite:** Não adicionar lembretes por e-mail/SMS, confirmação por WhatsApp ou retornos obrigatórios. Disponibilidade real é validada conforme ASO-013.

<a id="aso-013"></a>
#### ASO-013 — Agenda a partir dos horários do profissional por unidade

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 13, p. 306:**

> Permitir gerar agenda de atendimento para os horários cadastrados de cada profissional da unidade;

**Implementação:** Cadastrar/configurar horários de trabalho/atendimento do profissional em cada unidade e gerar a agenda correspondente. Validar profissional, serviço e capacidade do horário no servidor; reservas, retornos e consultas usam a mesma fonte. Agenda tabular paginada é suficiente se demonstrar horários/ocupação sem perder o contexto.

**Dados de outros módulos / formatos:** DEP-03 se há horário profissional de origem a consumir; configuração da oferta socioassistencial pertence ao módulo. Não exige Google Calendar ou conector de agenda externo.

**Demonstração:**

1. Configurar horários de TEC-A na U1 para as datas de F-AGENDA.
2. Registrar AG1 e AG2 nos horários oferecidos.
3. Tentar 07h fora da oferta e outra pessoa às 09h de AG1 com capacidade 1; conferir recusa e ausência de duplicação.

**Aceite técnico:** A agenda deriva dos horários cadastrados, não de slots fixos no código. O retorno ocupa o horário correto; duas requisições concorrentes não consomem a mesma capacidade.

**Atenção / limite:** Q-AS04: duração, capacidade, calendário e política de encaixe. Não impor nova agenda gráfica, recorrência ou bloqueios sem relação com a disponibilidade configurada.

<a id="aso-014"></a>
#### ASO-014 — Cadastro familiar e participação dos integrantes nas ações

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 14, p. 306:**

> Permitir o cadastro da família, possibilitando a inclusão dos membros de uma família em programas, serviços, atividades, entre outras ações realizadas pelo município;

**Implementação:** Criar/manter família, responsável e integrantes vinculados às pessoas. Permitir incluir membros em programas, serviços e atividades do município a partir da ficha familiar, usando os respectivos registros de destino. Conservar a família como agrupamento próprio, separado da pessoa responsável; endereço e situação pertencem à referência da família.

**Dados de outros módulos / formatos:** DEP-02 para pessoas; famílias/vínculos são deste módulo. DEP-04 para endereço/unidade se fonte compartilhada; sem API externa obrigatória.

**Demonstração:**

1. Criar F1/F2/F3 e seus integrantes conforme F-FAMILIA.
2. Na ficha de F1, incluir P103 na turma/atividade e P101 no serviço/programa de teste.
3. Abrir os destinos e conferir os mesmos IDs de pessoa/família e o histórico de vínculo.

**Aceite técnico:** As três famílias e sete pessoas permanecem relacionadas sem cópias; a inclusão em ações gera vínculos reais no respectivo contexto, não apenas observação textual na família.

**Atenção / limite:** Não propagar automaticamente um programa do responsável para todos os integrantes. Campos não fornecidos pelo TR são decisões de configuração, não obrigatoriedades novas.

<a id="aso-015"></a>
#### ASO-015 — Bloqueios por nível de acesso e hierarquia

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 15, p. 306:**

> Permitir o bloqueio de nível de acesso apenas para os usuários de diferentes níveis hierárquicos;

**Implementação:** Aplicar configurações de nível/função e escopo de unidade em todas as ações sociais, articuladas com os perfis do item 38 e o sigilo do item 31. Diferenciar consultar, registrar, decidir benefício e ler conteúdo sigiloso; negar chamadas diretas não autorizadas, não apenas ocultar botão.

**Dados de outros módulos / formatos:** DEP-01: mecanismo existente de autorização; perfis sociais, vínculos e regras de sigilo são configurados neste trabalho.

**Demonstração:**

1. Configurar REC-A, TEC-B e GES-B com as capacidades distintas da base.
2. Como recepção ou gestor de benefícios, tentar abrir AT3 sigiloso pela tela e pela URL/API.
3. Como TEC-B autorizado, abrir o registro e conferir que os controles não impedem o atendimento legítimo.

**Aceite técnico:** Bloqueios são efetivos e coerentes em listas, detalhes, documentos, contadores e mapa. Um nível superior genérico não concede acesso ilimitado ao prontuário.

**Atenção / limite:** Q-AS03: a frase “bloqueio ... apenas ... diferentes níveis hierárquicos” exige confirmar a matriz de competência. A interpretação proposta não é esclarecimento formal da comissão.

<a id="aso-016"></a>
#### ASO-016 — Serviços disponibilizados por unidade

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 16, p. 306:**

> Permitir o cadastro do serviço para a unidade de atendimento;

**Implementação:** Manter o catálogo de serviços e sua associação às unidades de atendimento, permitindo selecionar o serviço na recepção, triagem, agenda, atendimento, turma e vinculação familiar pertinente. Serviço pode existir em mais de uma unidade sem duplicar indevidamente o catálogo; a oferta local e os profissionais aptos são relações próprias.

**Dados de outros módulos / formatos:** DEP-04 se o catálogo institucional já existe. Fonte operacional de oferta é Assistência Social; DEP-01 limita escopo.

**Demonstração:**

1. Cadastrar S1/U1, S2/U2 e S3/U3.
2. Selecionar S1 na recepção e verificar destino TEC-A.
3. Abrir turma TA e confirmar que está no serviço S3 ofertado pela U3, sem escolha incoerente de unidade.

**Aceite técnico:** A escolha de serviço usa cadastro persistido e determina oferta/vínculos reais, não texto livre repetido. Atualização cadastral não reescreve históricos antigos sem rastreabilidade.

**Atenção / limite:** Não importar uma lista legal completa de serviços por memória nem tratar programa, benefício e serviço como um único tipo indiferenciado.

<a id="aso-017"></a>
#### ASO-017 — Importação de arquivo CADÚNICO

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 17, p. 306:**

> O software deverá permitir a importação do arquivo do CADÚNICO;

**Implementação:** Implementar EXT-CAD conforme a seção 4.2: perfil de leiaute identificado, upload/leitura real, validação, correspondência de pessoas/famílias, conferência das alterações e resultado por registros/lote. Persistir os vínculos e a origem. Exibir incompatibilidade de formato em vez de tentar importar qualquer CSV como se fosse a base governamental.

**Dados de outros módulos / formatos:** EXT-CAD: arquivo e dicionário efetivamente disponibilizados à entidade. DEP-02 para identidade canônica e DEP-06 para armazenamento restrito do lote. Não pressupõe integração online nacional.

**Demonstração:**

1. Executar F-IMPORT no perfil verdadeiro quando disponível: lote A resulta em 2 famílias e 5 integrantes.
2. Reenviar o mesmo lote: manter 2/5. Importar lote B: 3/7 com histórico da alteração.
3. Processar lote com família inexistente ou identidade conflitante e verificar rejeição/motivo sem perda de pareceres locais.

**Aceite técnico:** Arquivo é processado de verdade; famílias, pessoas e vínculos correspondem à fonte; reimportação não duplica e erros são rastreáveis. Compatibilidade só é validada contra leiaute/amostra identificados.

**Atenção / limite:** Q-AS08: o TR não entrega formato, versão ou dicionário. Fixture interna só comprova o pipeline interno e permanece TESTADO_COM_FIXTURE_INTERNA, não COMPATIVEL_CADUNICO. Não criar API nacional, atualizar governo ou fabricar confirmação oficial.

<a id="aso-018"></a>
#### ASO-018 — Vinculação dos demais integrantes à família

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 18, p. 306:**

> O software deverá permitir a vinculação dos demais integrantes a família;

**Implementação:** Permitir localizar pessoa existente e vinculá-la à família com relação e período pertinentes, sem recriar a pessoa ou substituir o responsável inadvertidamente. Permitir recuperar todos os integrantes; controlar conflitos de identidade/vínculo conforme política adotada, preservando histórico.

**Dados de outros módulos / formatos:** DEP-02: pessoa existente. Família e relação são registros locais da Assistência; resultado da importação EXT-CAD pode alimentar os mesmos vínculos.

**Demonstração:**

1. Criar F1 inicialmente com P101/P103 e depois selecionar P102 já cadastrado.
2. Adicionar P102 e conferir F1 com três integrantes; o total de pessoas canônicas não aumenta pela associação.
3. Reenviar a vinculação e verificar que P102 não aparece duas vezes.

**Aceite técnico:** O integrante entra na família correta e pode ser selecionado nas ações; uma mesma operação não cria vínculo duplicado. A pessoa não é identificada apenas pelo nome.

**Atenção / limite:** Não fixar regra universal de composição familiar por parentesco/endereço; Q-AS02 registra tratamento de vigência e conflitos fornecido pela entidade.

<a id="aso-019"></a>
#### ASO-019 — Inclusão em acompanhamento socioeducativo a partir do atendimento

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 19, p. 306:**

> O software no ato do atendimento deverá disponibilizar as opções para integrar o cidadão no Acompanhamento Socioeducativo, para assim passar a ser assistido pela unidade responsável;

**Implementação:** No atendimento, oferecer ação de inclusão do cidadão no acompanhamento socioeducativo, selecionando unidade/equipe responsável e guardando a referência ao atendimento. Criar vínculo real recuperável na área de acompanhamento, com situação e registros próprios, conectado ao PIA quando pertinente.

**Dados de outros módulos / formatos:** DEP-02 para assistido; atendimento, acompanhamento e PIA são do módulo. DEP-07 somente se o encaminhamento já utilizar o núcleo de Processos.

**Demonstração:**

1. A partir de AT5 de P103, registrar SOC-P103 com U2/TEC-B.
2. Abrir a lista de acompanhamentos da unidade e iniciar PIA-P103 pelo vínculo.
3. Repetir a operação técnica e conferir apenas um acompanhamento criado pelo mesmo comando.

**Aceite técnico:** O assistido passa a constar na demanda/consulta da unidade responsável e mantém vínculo ao atendimento que originou a inclusão. Não é só uma caixa marcada sem registro acessível.

**Atenção / limite:** Não aplicar medida socioeducativa automaticamente nem exigir integração judicial. Q-AS09: tipo de acompanhamento, conteúdo do PIA e competência da equipe.

<a id="aso-020"></a>
#### ASO-020 — Parecer técnico por integrante ou responsável familiar

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 20, p. 306:**

> O sistema deverá ter a possibilidade de registrar pareceres de um integrante ou responsável familiar, constando o parecer do técnico;

**Implementação:** Permitir registrar parecer com autor/técnico, data, conteúdo, família e sujeito específico — integrante ou responsável familiar. Apresentar no atendimento/prontuário autorizado, preservando referência e política de correção/histórico. A troca do responsável familiar não muda retroativamente o sujeito do parecer.

**Dados de outros módulos / formatos:** DEP-02 para sujeito e DEP-03 para técnico quando fontes existentes; DEP-06 para persistência/documento. Conteúdo social não será armazenado em observação pública da pessoa.

**Demonstração:**

1. Registrar um parecer de P103 integrante e outro de P101 responsável, vinculados à F1.
2. Reabrir os dois, conferindo autor, data, sujeito e conteúdo.
3. Marcar um parecer como sigiloso conforme política e repetir a consulta com perfil sem acesso.

**Aceite técnico:** Pareceres são distintos e atribuídos ao sujeito/técnico corretos, recuperáveis no prontuário autorizado. Atualização da pessoa não apaga o parecer nem amplia sua publicidade.

**Atenção / limite:** Não gerar parecer por IA, assinatura digital obrigatória ou formulário clínico. Q-AS03/09: visibilidade e campos do modelo profissional.

<a id="aso-021"></a>
#### ASO-021 — Quadro de atendimentos abertos enviados aos profissionais

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 21, p. 306:**

> O software deverá conter um quadro de avisos referente a atendimentos em abertos enviados para os profissionais;

**Implementação:** Apresentar quadro/lista contextual de atendimentos abertos efetivamente encaminhados ao profissional, com identificação mínima do assistido, unidade, serviço, origem/data e ação de abrir o registro autorizado. Obter pendências da mesma fonte dos atendimentos; não manter contador manual ou duplicar tarefas.

**Dados de outros módulos / formatos:** DEP-01: profissional autenticado e permissões; filas/atendimentos sociais são a fonte. DEP-07 se já compartilhar tramitação.

**Demonstração:**

1. No estado inicial de F-ATEND, entrar como TEC-A e conferir AT6 como única pendência.
2. Abrir AT6 pela lista e, em teste separado, concluir; voltar ao quadro e conferir zero pendências.
3. Consultar com outro profissional e verificar que não recebe atendimento fora de sua atribuição.

**Aceite técnico:** Contagem e lista correspondem ao estado real dos atendimentos enviados. Encerramento atualiza o quadro e não elimina o histórico; agendamento futuro não vira atendimento aberto.

**Atenção / limite:** Quadro de avisos é uma função interna. Não acrescentar push, e-mail, WhatsApp ou expor parecer sigiloso na lista.

<a id="aso-022"></a>
#### ASO-022 — Agendamento e registro de visitas domiciliares e a entidades

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 22, p. 306:**

> Permitir o agendamento de visitas domiciliares e a entidades parceiras, que será realizado pela equipe responsável, e logo ter o controle de registro das visitas;

**Implementação:** Manter visita com tipo de destino, família/domicílio ou entidade parceira, equipe responsável, agenda, situação e registro posterior de realização. Reutilizar identidade/endereço quando existentes. Conservar o que foi planejado e o resultado registrado sem transformar toda visita em uma consulta concluída.

**Dados de outros módulos / formatos:** DEP-02/DEP-04 para contatos/endereço; agenda/equipe sociais; DEP-06 para registro associado se já houver documento. Não depende de Frotas, geolocalização do profissional ou Saúde.

**Demonstração:**

1. Agendar VD1 para F1 e VP1 para PAR-1 com equipes e datas de F-AGENDA/VISITA.
2. Registrar realização apenas de VD1, incluindo informação mínima de resultado.
3. Consultar as duas: 2 planejamentos, 1 realizada e 1 ainda planejada, com destinos corretos.

**Aceite técnico:** Ambas as modalidades de visita existem e ficam vinculadas ao destinatário/equipe. Agendar não marca como realizado; dados da visita são recuperáveis após recarga.

**Atenção / limite:** Não exigir fotografia, assinatura do visitado, rastreamento ou roteirização. Q-AS04: agenda da equipe e formas de conclusão adotadas.

<a id="aso-023"></a>
#### ASO-023 — Ficha Plano Individual de Atendimento — PIA

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 23, p. 306:**

> O sistema deverá conter a ficha Plano Individual de Atendimento – PIA;

**Implementação:** Disponibilizar ficha PIA individual vinculada ao assistido e ao acompanhamento socioeducativo quando pertinente. Usar identificação, responsáveis e estrutura de medidas/ações/evoluções necessária a ASO-037; manter conteúdo editável conforme permissão e versão histórica. A emissão do item 52 deve consultar a mesma ficha.

**Dados de outros módulos / formatos:** DEP-02 para pessoa e DEP-06 para documentos; acompanhamento e medidas são dados sociais. Não exigir outro sistema de Justiça ou diagnóstico de Saúde.

**Demonstração:**

1. Abrir SOC-P103 e criar PIA-P103 com as duas medidas de F-ACOMP/PIA.
2. Salvar, sair e reabrir a ficha; navegar entre medidas e evoluções.
3. Emitir prévia pelo mesmo registro e conferir o assistido, sem usar um PDF genérico vazio.

**Aceite técnico:** Existe ficha estruturada e persistida do PIA, não apenas nome de menu ou upload de formulário. Os dados dão suporte ao registro de medidas e ao relatório correspondente.

**Atenção / limite:** Q-AS09: o TR não fornece campos integrais do PIA. O modelo proposto deve ser confirmado; não inventar obrigatoriedade de assinatura, ordem judicial ou prazo de revisão.

<a id="aso-024"></a>
#### ASO-024 — Cadastro e consulta de acompanhamento PAEFI

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 24, p. 307:**

> Cadastramento e consulta do acompanhamento do PAEFI – Serviço de Proteção e Atendimento Especializado a Famílias e Indivíduos;

**Implementação:** Disponibilizar tipo PAEFI identificável, com família e/ou indivíduo conforme o caso, unidade/equipe, início, situação e registros de acompanhamento. Permitir cadastro e consulta histórica, com acesso protegido. Vincular origem de atendimento/encaminhamento/situação de violência quando houver, sem exigir todas essas origens em qualquer cadastro.

**Dados de outros módulos / formatos:** DEP-02, DEP-01 e DEP-06 conforme identidade/acesso/documento. O núcleo de acompanhamento pertence à Assistência Social.

**Demonstração:**

1. Cadastrar PAEFI-P202 na U2 com referência à F2 e ao caso VIO-1.
2. Registrar acompanhamento e consultar o histórico pelo assistido e pela família.
3. Abrir a consulta PAIF e verificar que o registro não aparece rotulado indevidamente como PAIF.

**Aceite técnico:** PAEFI é consultável com trajetória própria e identificação do sujeito, unidade e profissional. Um cadastro familiar com tag PAEFI sem registros de acompanhamento não encerra o item.

**Atenção / limite:** Não converter toda ocorrência de violência em inclusão automática sem ação definida. Preservar a distinção entre acompanhamento familiar/individual; Q-AS09.

<a id="aso-025"></a>
#### ASO-025 — Cadastro e consulta de acompanhamento PAIF

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 25, p. 307:**

> Cadastramento e consulta do Acompanhamento do PAIF – Proteção e Atendimento Integral à Família;

**Implementação:** Disponibilizar tipo PAIF com identificação familiar, unidade/equipe, início, situação e registros de acompanhamento. Apresentar integrantes relacionados sem multiplicar um acompanhamento familiar em vários acompanhamentos individuais. Reutilizar o mesmo núcleo técnico do PAEFI, mantendo tipos e consultas separados.

**Dados de outros módulos / formatos:** Família/pessoas sociais com DEP-02; DEP-01/DEP-06 para autorização e documento. Não é cadastro novo no módulo de Saúde.

**Demonstração:**

1. Cadastrar PAIF-F1 em U1 e registrar duas evoluções de demonstração.
2. Consultar pela família e unidade; reabrir os dois registros.
3. Conferir que a família tem um acompanhamento PAIF, apesar de três integrantes.

**Aceite técnico:** O cadastro e histórico de PAIF são recuperáveis e separados do PAEFI. Quantitativo de família não vira soma de pessoas por causa da relação entre tabelas.

**Atenção / limite:** Não impor automaticamente visita, benefício ou medida socioeducativa a todo PAIF. Conteúdo do modelo e critérios de encerramento precisam de configuração identificada.

<a id="aso-026"></a>
#### ASO-026 — Situação de violência com encaminhamento ou acompanhamento PAEFI

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 26, p. 307:**

> Registro de situação de violência, informando o nome do vitimado, com a opção de realizar um encaminhamento ou acompanhamento no PAEFI;

**Implementação:** Registrar situação de violência com nome/referência do vitimado, contexto mínimo, autor/data e proteção de acesso. Oferecer as alternativas de encaminhar à unidade competente ou vincular/iniciar acompanhamento PAEFI, preservando uma relação rastreável. O usuário autorizado escolhe a ação pertinente; não transformar denúncia em conclusão automática.

**Dados de outros módulos / formatos:** DEP-02 para vitimado, DEP-01 para sigilo; encaminhamentos/PAEFI sociais. DEP-07 somente se já existir rota de tramitação compartilhada.

**Demonstração:**

1. Registrar VIO-1 com P202 identificado e dados mínimos fictícios.
2. Em um ensaio, encaminhar a U2; em outro, cadastrar acompanhamento PAEFI relacionado.
3. Verificar a demanda no destino e tentar abrir o caso pelo perfil REC-A, que deve ser impedido.

**Aceite técnico:** Vitimado é identificável ao profissional autorizado e as duas opções têm efeitos reais. O caso não aparece em listagens/mapas não autorizados, nem inclui automaticamente todos os familiares como vítimas.

**Atenção / limite:** Não criar investigação policial, autuação, julgamento de veracidade ou envio a órgão externo. Q-AS03/09: dados, sigilo e competência para atendimento.

<a id="aso-027"></a>
#### ASO-027 — Registro da averiguação de denúncia de violência

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 27, p. 307:**

> Realização do cadastro da averiguação da denúncia de violência, para controle;

**Implementação:** Cadastrar averiguação como registro próprio relacionado à denúncia/situação pertinente, com responsável, data, situação e informação de acompanhamento/resultado registrada pelo profissional. Consultar e manter a evolução sem substituir a denúncia original ou confundir encaminhamento com confirmação do fato.

**Dados de outros módulos / formatos:** Caso social e identidade DEP-02; DEP-01 restringe acesso. DEP-06 para documento/anexo quando usado; não pressupõe Ouvidoria ou polícia integradas.

**Demonstração:**

1. Criar AVE-1 ligada a VIO-1, em averiguação.
2. Adicionar evolução pelo técnico e reabrir o vínculo à situação original.
3. Verificar que não surgiu automaticamente auto de infração, medida judicial ou conclusão positiva.

**Aceite técnico:** Averiguação é recuperável, atribuída ao profissional e relacionada ao caso correto. O registro original continua disponível e protegido.

**Atenção / limite:** A fonte pede cadastro para controle, não confirmação automatizada ou integração policial. Não adicionar campos clínicos/forenses por suposição.

<a id="aso-028"></a>
#### ASO-028 — Participantes em turmas vinculadas aos serviços das unidades

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 28, p. 307:**

> Deverá permitir incluir participantes nas turmas por serviços disponibilizadas nas unidades de atendimento;

**Implementação:** Na turma, incluir participantes pelo cadastro de pessoa/integrante, preservando a ligação turma → serviço → unidade. Permitir consultar participantes e selecionar a turma no contexto do serviço. Evitar participação duplicada da mesma pessoa no mesmo vínculo vigente por reenvio técnico; relações em turmas diferentes são independentes.

**Dados de outros módulos / formatos:** DEP-02: pessoa; turma/serviço/unidade são fontes sociais. Não criar matrícula escolar nem novo cadastro de crianças.

**Demonstração:**

1. Adicionar P103 a TJ e P101/P201/P202 a TA, ambas U3/S3.
2. Abrir a turma pela unidade/serviço e conferir os participantes.
3. Reenviar a inclusão de P101 em TA e verificar que a lista permanece com três pessoas.

**Aceite técnico:** Participantes são vinculados às turmas do serviço/unidade corretos. O vínculo alimenta frequência e atividades sem redigitação, mantendo a pessoa canônica.

**Atenção / limite:** Faixa etária é classificada conforme ASO-007; bloqueio por idade ou vaga só com regra fornecida. Não criar certificação ou cobrança de participação.

<a id="aso-029"></a>
#### ASO-029 — Inclusão e consulta de família ou integrante nos serviços

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 29, p. 307:**

> Deverá incluir/consultar uma família ou integrante nos serviços oferecidos pela Secretaria de Assistência Social;

**Implementação:** Permitir vincular um serviço à família como sujeito coletivo ou a um integrante específico, com identificação clara do tipo de vínculo, unidade, período/situação quando adotados. Consultar a partir da ficha familiar, da pessoa e do serviço, evitando confundir vínculo familiar com inclusão de todos os integrantes.

**Dados de outros módulos / formatos:** DEP-02 para identidade; famílias/serviços sociais. DEP-01 aplica escopo.

**Demonstração:**

1. Vincular F1 ao serviço familiar S1 e P103 ao serviço específico de acompanhamento.
2. Consultar pela família e pelo integrante, exibindo o sujeito de cada relação.
3. Encerrar um vínculo em teste separado sem alterar o outro.

**Aceite técnico:** Família e integrante podem ser vinculados e consultados separadamente. Os relacionamentos não se perdem ao trocar de tela e não criam pessoas duplicadas.

**Atenção / limite:** Não transformar serviço, programa e benefício em sinônimos. A associação não comprova realização de atendimento ou liberação de benefício.

<a id="aso-030"></a>
#### ASO-030 — Unificação de cadastro de pessoa física

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 30, p. 307:**

> O software deverá realizar a unificação de cadastro de pessoa física, para facilidade de identificação no momento da recepção ou atendimento ao mesmo;

**Implementação:** Implementar ou reutilizar mecanismo de unificação de duplicidades de pessoa física, com comparação antes de confirmar, identidade canônica e tratamento dos vínculos sociais. Preservar referências legadas, autoria e histórico de origem. Conflitos de identificadores/família exigem decisão explícita. Operação deve reassociar de forma consistente e não gerar nova pessoa em cada unidade.

**Dados de outros módulos / formatos:** DEP-02: cadastro único e serviço de unificação se existente. As relações sociais são atualizadas pelo lado deste módulo; se a fusão central estiver ausente, registrar a dependência concreta em vez de marcar sucesso local falso.

**Demonstração:**

1. Executar F-UNIFICACAO: comparar P101 e P101-DUP com valores divergentes.
2. Confirmar a operação autorizada, preservando atendimento e benefício vinculados.
3. Buscar na recepção: retornar a identidade canônica. Conferir que homônimo com documento distinto não foi fundido.

**Aceite técnico:** Unificação produz uma pessoa de referência e preserva eventos sem duplicar liberação, renda ou contagem. Identificadores antigos continuam rastreáveis; a busca deixa de exigir escolher duplicatas.

**Atenção / limite:** Não fazer fusão cega por nome/endereço nem apagar prontuários. Q-AS02 define autoridade, campos preferidos e reconciliação de conflitos. Não reconstruir Pessoas fora deste pacote.

<a id="aso-031"></a>
#### ASO-031 — Listagem e detalhe de atendimentos respeitando sigilo

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 31, p. 307:**

> Listar os atendimentos realizados dando a possibilidade de visualização das informações do atendimento, respeitando o nível de acesso quando estiver marcado como sigiloso;

**Implementação:** Listar atendimentos realizados com filtros e detalhamento, aplicando o nível de acesso ao registro e às informações sigilosas antes da resposta do servidor. Abrir a ficha correspondente e permitir emissão apenas no mesmo escopo. Não enviar conteúdo privado ao cliente e depois ocultá-lo visualmente.

**Dados de outros módulos / formatos:** DEP-01: autorização; atendimentos e sigilo são fontes sociais; DEP-06 protege arquivos e relatórios.

**Demonstração:**

1. Consultar F-ATEND como profissional autorizado e abrir as informações dos atendimentos concluídos.
2. Como REC-A, tentar AT3 por lista, URL, API e arquivo: impedir conteúdo protegido.
3. Emitir relatório do mesmo recorte e verificar coerência da visibilidade.

**Aceite técnico:** Listagem e detalhamento funcionam sem vazamento de texto/arquivo sigiloso. O profissional autorizado continua acessando o que lhe compete, sem o sistema bloquear todo o histórico por simplificação.

**Atenção / limite:** Q-AS03: definir o que pode ser mostrado como metadado de existência e quais perfis acessam conteúdo. Não assumir que um relatório geral dispensa sigilo.

<a id="aso-032"></a>
#### ASO-032 — Emissão do registro de frequência dos participantes

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 32, p. 307:**

> Emissão do Registro de Frequência dos participantes das turmas cadastradas, para controle dos profissionais;

**Implementação:** Gerar documento de frequência a partir da turma, participantes e encontros/período escolhidos. Reutilizar marcações existentes ou registro mínimo de presença quando adotado no controle. Identificar ausência e não registro separadamente; impressão de lista para coleta manual deve se apresentar como tal, não como presença já confirmada.

**Dados de outros módulos / formatos:** Turmas/participantes sociais; DEP-02 para identificação; DEP-06 para emissão. Não depende de ponto eletrônico, biometria ou Educação.

**Demonstração:**

1. Registrar encontros EN1 e EN2 da TA conforme F-TURMA.
2. Emitir o registro com os três participantes e as seis posições de frequência.
3. Conferir cinco presenças e uma ausência; em outro ensaio, manter uma posição não registrada e identificar a diferença.

**Aceite técnico:** O documento é gerado da turma correta, mostra todos os participantes selecionados e o período; não se limita às linhas da página. O total de presenças não é apresentado como número de pessoas únicas.

**Atenção / limite:** Não criar controle biométrico, nota, avaliação, frequência escolar oficial ou cálculo automático de direito ao benefício. Q-AS05: forma de marcação adotada.

<a id="aso-033"></a>
#### ASO-033 — Atividades coletivas com integrantes e ações

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 33, p. 307:**

> Registrar atividades coletivas, e assim permitir vincular os integrantes e as ações realizadas;

**Implementação:** Registrar atividade coletiva identificada por data/unidade/profissionais e vincular integrantes e ações realizadas. Permitir recuperar cada associação e consultar pelo evento/família pertinente. Evitar modelar uma atividade com dois vínculos de ação como dois eventos físicos idênticos.

**Dados de outros módulos / formatos:** DEP-02 para participantes; serviços/turmas sociais quando aplicáveis. DEP-03 se profissionais vierem do RH.

**Demonstração:**

1. Criar AC1 com P101/P201/P202 e duas ações realizadas.
2. Consultar a atividade e a participação de cada pessoa pelo prontuário permitido.
3. Conferir três participantes, duas ações e um evento, sem multiplicação para seis pessoas.

**Aceite técnico:** O registro demonstra as ações e os participantes reais com seus vínculos. Reenvio técnico não duplica o evento nem presenças.

**Atenção / limite:** Não criar LMS, inscrição paga, certificados ou avaliação pedagógica. Evento coletivo e atendimento individual só se relacionam quando houver fatos distintos identificados.

<a id="aso-034"></a>
#### ASO-034 — Demanda encaminhada ao estabelecimento e atendimento a partir da origem

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 34, p. 307:**

> Permitir aos profissionais consultar a lista dos assistidos encaminhados ao seu estabelecimento e, a partir das informações registradas no estabelecimento de origem, possam atender a esta demanda de acordo com as necessidades de cada indivíduo;

**Implementação:** Disponibilizar ao profissional do destino a lista de assistidos encaminhados ao seu estabelecimento. Mostrar informações registradas na origem autorizadas para a finalidade e oferecer iniciar/continuar atendimento com o mesmo cidadão/família/encaminhamento. Estado do destino e referência de retorno devem compor a continuidade do caso.

**Dados de outros módulos / formatos:** DEP-02 e DEP-01; encaminhamento social; DEP-07 se houver motor central. Não exigir outro cadastro de cidadão no destino.

**Demonstração:**

1. Criar ENC-1 de U1 para U2 no contexto de F2/P202.
2. Como TEC-B, abrir a lista da U2, conferir dados permitidos e iniciar AT3 pela referência.
3. Reabrir na origem e confirmar o vínculo ao atendimento do destino, sem duplicação de pessoa/família.

**Aceite técnico:** O encaminhamento chega ao estabelecimento correto e as informações úteis de origem são recuperáveis conforme permissão. O profissional consegue atender a demanda, não apenas marcar como lida.

**Atenção / limite:** Informação de origem não equivale à liberação integral do prontuário sigiloso. Não inventar contrarreferência obrigatória com documento novo, nem integração externa não pedida.

<a id="aso-035"></a>
#### ASO-035 — Condições do domicílio no cadastro familiar

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 35, p. 307:**

> Possibilitar informar as condições do domicílio da família no seu cadastro familiar;

**Implementação:** Adicionar à ficha familiar campos de condições do domicílio conforme a configuração/modelo adotado, mantendo data e origem da informação. Reutilizar endereço e condições importadas quando disponíveis, sem equiparar residência, imóvel tributário e família. Permitir consultar valores atuais e a referência dos registros usados no acompanhamento.

**Dados de outros módulos / formatos:** DEP-04 se endereço central; EXT-CAD quando forneça campos compatíveis. Condições sociais da família são deste domínio, não exigem cadastro tributário completo.

**Demonstração:**

1. Registrar condições demonstrativas na F1 e dados diferentes na F2.
2. Salvar, reabrir e consultar pelo prontuário familiar.
3. Importar/editar em cenário isolado e verificar que a política de conferência preserva o dado local divergente até decisão.

**Aceite técnico:** Condições do domicílio ficam associadas à família e consultáveis, não apenas numa observação genérica da pessoa. Dados ausentes permanecem identificados.

**Atenção / limite:** Q-AS02: formulário/campos de referência não foram fornecidos integralmente. Não inventar pontuação habitacional, vistoria de engenharia ou atualização do cadastro de IPTU.

<a id="aso-036"></a>
#### ASO-036 — Histórico social completo no prontuário da família

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 36, p. 307:**

> Permitir a visualização de todo o histórico-social da família no seu prontuário da família;

**Implementação:** Consolidar no prontuário a sequência de registros sociais da família e integrantes: atendimentos, pareceres permitidos, acompanhamentos, vínculos, benefícios, visitas, atividades e encaminhamentos pertinentes. Usar referências às fontes, autor/data/tipo e acesso ao detalhe, sem copiar registros para outra base. “Todo” significa o conjunto existente permitido, não apenas a página mais recente.

**Dados de outros módulos / formatos:** DEP-02 para identidade; eventos dos domínios sociais; DEP-06/DEP-07 quando documentais ou processuais. Restrições DEP-01 acompanham cada evento.

**Demonstração:**

1. Abrir F1 depois dos cenários e localizar AT1/AT4, PAIF, PIA de P103, L1/L3 e vínculos de atividade.
2. Navegar por todas as páginas e abrir eventos antigos/novos.
3. Comparar com perfil restrito: manter proteção dos registros sigilosos sem inventar ausência de atendimento.

**Aceite técnico:** O prontuário permite chegar a todos os fatos autorizados da família, com origem e ordem coerentes. Uma liberação não aparece duas vezes por ter família e cidadão relacionados.

**Atenção / limite:** Não expor todos os casos dos integrantes a qualquer membro da família ou operador. Dados de outros módulos só entram por vínculo e finalidade, não por consulta irrestrita à base inteira.

<a id="aso-037"></a>
#### ASO-037 — PIA com todas as medidas socioeducativas do assistido

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 37, pp. 307–308:**

> Permitir o registro do Plano Individual de Atendimento (PIA), possibilitando o registro de todas as medidas socioeducativas voltadas para o assistido;

**Implementação:** Completar a ficha de ASO-023 com coleção de medidas/ações e acompanhamento por assistido, permitindo coexistência e histórico das medidas registradas. Não usar um único campo que sobrescreva a medida anterior. Guardar referência, período, técnico e evolução conforme o modelo adotado; emitir pelo mesmo conjunto em ASO-052.

**Dados de outros módulos / formatos:** Assistido DEP-02; acompanhamento/PIA sociais; DEP-06 para relatório. Não exige emissão ou consulta de decisão judicial.

**Demonstração:**

1. Adicionar MED-A e MED-B ao PIA-P103, com duas evoluções na primeira e uma na segunda.
2. Salvar, fechar e reabrir; mudar a situação de uma medida em teste mantendo o histórico.
3. Emitir PIA e conferir duas medidas e três evoluções, com acesso protegido.

**Aceite técnico:** Todas as medidas registradas permanecem no plano e no relatório; nenhuma é perdida por edição, filtro implícito ou paginação.

**Atenção / limite:** Q-AS09: campos, catálogos de medida e modelo precisam de confirmação. Não transformar o software em decisor judicial nem exigir medidas específicas não citadas no TR.

<a id="aso-038"></a>
#### ASO-038 — Perfis por função nos estabelecimentos

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 38, p. 308:**

> Permitir definir perfis de acesso para serem atribuídos aos usuários do sistema conforme suas funções nos estabelecimentos;

**Implementação:** Configurar e atribuir perfis de acesso de acordo com as funções do usuário nos estabelecimentos, reutilizando o mecanismo central. Separar vínculo profissional, unidade e capacidades de consulta/registro/decisão/sigilo. A mesma pessoa pode ter funções distintas por unidade, sem ganhar permissões globais por união indevida de perfis.

**Dados de outros módulos / formatos:** DEP-01 para perfis/sessão e DEP-03 para vínculo quando existente. A matriz de capacidades sociais deve ser configurada e testada aqui.

**Demonstração:**

1. Atribuir REC-A à U1, TEC-B à U2 e GES-B ao setor de benefícios no escopo de teste.
2. Tentar registrar na unidade não autorizada, analisar fila sem permissão e abrir parecer sigiloso.
3. Conferir funcionamento das ações permitidas e revogação efetiva de uma capacidade em nova requisição.

**Aceite técnico:** Os perfis controlam as ações nas unidades corretas também por API/arquivo. Permissão em U1 não vaza automaticamente para U2.

**Atenção / limite:** Q-AS03: matriz institucional não especificada no bloco. Usar menor acesso necessário sem transformar uma regra proposta em proibição legal universal.

<a id="aso-039"></a>
#### ASO-039 — Entradas de benefícios nas unidades com dados fiscais

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 39, p. 308:**

> Cadastramento de entrada dos benefícios nas unidades, informando assim o número da nota fiscal, quantidade, nome do fornecedor, valor unitário, e a data de entrada do benefício;

**Implementação:** Registrar a entrada material por unidade/benefício, expondo e persistindo os cinco campos de CK-ENTRADA: NF, quantidade, fornecedor, valor unitário e data. Usar representação decimal e unidade identificada. Disponibilizar a origem para alocação nas liberações e relatório; reutilizar entrada já existente no Almoxarifado quando for a fonte oficial da operação.

**Dados de outros módulos / formatos:** DEP-05 se houver entrada/material/fornecedor integrados; DEP-02 para fornecedor se cadastro comum. Sem essa origem, o registro mínimo social fica no escopo; não criar Compras ou nova NF-e.

**Demonstração:**

1. Cadastrar E1/E2/E3 em F-BEN, pelos serviços válidos da fonte adotada.
2. Reabrir as entradas e conferir 70 unidades, R$ 7.400,00 e os cinco campos.
3. Efetivar L1/L2/L3 referenciando as entradas e verificar saldo de 64 unidades sem registrar outra saída paralela.

**Aceite técnico:** Entrada e origem fiscal permanecem consultáveis e vinculadas aos benefícios da unidade correta. Reenvio não duplica recebimento; liberação não pode usar silenciosamente quantidade indisponível.

**Atenção / limite:** Q-AS07: este controle não é novo almoxarifado completo. BPC/auxílio financeiro não recebe NF fictícia. O valor unitário deve pertencer à entrada efetivamente utilizada.

<a id="aso-040"></a>
#### ASO-040 — Mapa georreferenciado de famílias por acompanhamento, programa e violência

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 40, p. 308:**

> Controlar georreferenciamento do Mapa das famílias cadastradas no sistema, que estão em acompanhamentos, ou em Programas Sociais, ou Situação de Violência;

**Implementação:** Exibir mapa real das famílias com localização registrada, filtrando acompanhamento, programa e situação de violência conforme escopo autorizado. Construir união por ID familiar, sem duplicar família com mais de um critério; carregar o conjunto completo independentemente da paginação da lista. Indicar famílias sem coordenadas e a origem das posições.

**Dados de outros módulos / formatos:** DEP-08: componente/camada se compartilhados; posições e condições vêm do cadastro social. DEP-01 limita dados, contagens e anexos. Não expor o mapa como conteúdo do Portal Institucional.

**Demonstração:**

1. Executar F-MAPA: 25 famílias elegíveis, 23 localizadas e 2 sem localização.
2. Filtrar acompanhamento: 11; programa: 14, sendo 12 localizadas; violência: 6 no perfil autorizado.
3. Combinar critérios, conferir 23 pinos/identidades geolocalizadas sem duplicação e testar perfil que não pode acessar violência.

**Aceite técnico:** Mapa renderiza posições e alcança famílias de todas as páginas. A união não resulta em 29 domicílios; coordenada ausente não vira pin falso. Conteúdo/contagem restritos não aparecem no payload indevido.

**Atenção / limite:** Q-AS10: camada, precisão e divulgação precisam ser definidos. Não adicionar geocodificação automática, rotas de visitas, rastreamento, mapa público ou pontuação de risco.

<a id="aso-041"></a>
#### ASO-041 — Declaração de comparecimento após finalizar o atendimento

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 41, p. 308:**

> Emissão de Declaração de Comparecimento após finalização do Atendimento;

**Implementação:** Oferecer emissão da declaração somente para atendimento finalizado, com identificação do cidadão, unidade, profissional/data e informações do modelo adotado. Usar dados do próprio atendimento, sem exigir redigitação. Gerar documento real pelo núcleo; reimpressão não altera situação nem registra novo atendimento.

**Dados de outros módulos / formatos:** DEP-02/DEP-03 para nomes quando fonte; DEP-06 para emissão. Atendimento e seu estado são nativos do módulo.

**Demonstração:**

1. Emitir a declaração de AT1 concluído e conferir cidadão, unidade e data.
2. Tentar emitir a declaração de AT6 ainda aberto: recusar a emissão como comparecimento finalizado.
3. Reimprimir AT1 e conferir manutenção dos cinco atendimentos concluídos.

**Aceite técnico:** O documento corresponde ao atendimento e só é disponibilizado após conclusão. O sistema não emite uma declaração genérica de presença para qualquer pessoa selecionada.

**Atenção / limite:** Não exigir QR, assinatura digital, pagamento ou ciência do cidadão por este item. Q-AS11: modelo e conteúdo mínimos aprovados para a entidade.

<a id="aso-042"></a>
#### ASO-042 — Reuniões e palestras realizadas em outras unidades

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 42, p. 308:**

> Cadastramento de reuniões/palestras realizadas em outras unidades do Município;

**Implementação:** Registrar reunião/palestra com identificação, data, local/unidade de realização e responsável/unidade de registro, permitindo que a atividade aconteça em outra unidade municipal. Relacionar equipe/participantes somente conforme a operação já adotada; não confundir unidade autora com local do evento.

**Dados de outros módulos / formatos:** DEP-04 para unidades e DEP-03 para profissional quando existentes. Registro de evento é social; não depende da agenda do Portal Institucional.

**Demonstração:**

1. Cadastrar RP1 pela U1 com realização na U3 em 17/09/2026.
2. Reabrir e consultar pela unidade de realização e pelo responsável.
3. Verificar que o registro não foi copiado como dois eventos nas duas unidades.

**Aceite técnico:** É possível cadastrar e recuperar reunião/palestra em unidade diferente da que a registrou, com local/data claros. Mudança do filtro não muda a autoria nem duplica a ocorrência.

**Atenção / limite:** Não publicar palestra automaticamente no portal, exigir inscrição online, controle de ingressos ou certificado. Campos não expressos são organização de ensaio.

<a id="aso-043"></a>
#### ASO-043 — Emissão da carteirinha de benefício do cidadão

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 43, p. 308:**

> Permitir a emissão da Carteirinha de Benefício para o cidadão;

**Implementação:** Gerar carteirinha a partir do cidadão e do vínculo/contexto de benefício registrado, utilizando modelo identificável da entidade. Identificar pessoa e benefício/referência suficiente para o controle, com impressão e reemissão. Restringir a informação ao necessário; a carteirinha não expõe parecer, situação de violência ou PIA.

**Dados de outros módulos / formatos:** DEP-02: identidade; vínculo de benefício social; DEP-06: modelo/emissão. Não depende de impressão em hardware específico, QR ou consulta federal.

**Demonstração:**

1. Selecionar P101 no benefício de teste e emitir a carteirinha.
2. Abrir o arquivo e conferir pessoa/benefício; reemitir a mesma referência.
3. Verificar que a emissão não gera nova concessão e não inclui informações sigilosas do prontuário.

**Aceite técnico:** Carteirinha é emitida com os dados corretos e vinculada ao registro real, não arquivo estático com nome substituído. O sistema não transforma impressão em liberação ou pagamento.

**Atenção / limite:** Q-AS11: modelo, validade, foto e abrangência dependem de definição. Não impor foto, código público, assinatura ou dados biométricos que o TR não pede.

<a id="aso-044"></a>
#### ASO-044 — Lista de espera de benefícios por prioridade e decisão do setor

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 44, p. 308:**

> O software deverá conter uma lista de espera para concessão de benefícios, onde ficará os pedidos de benefícios esperando aprovação do setor responsável, de acordo com a prioridade de cada solicitação;

**Implementação:** Manter pedidos de benefício pendentes de aprovação, com cidadão/família, unidade, tipo, prioridade, data e setor responsável. Exibir fila ordenada pela prioridade e critério de desempate documentado; permitir decisão pelo perfil competente e vínculo à liberação quando efetivada. Pedido não aprovado permanece fora do total de liberados.

**Dados de outros módulos / formatos:** DEP-01 para competência; pessoas DEP-02; benefícios/pedidos/liberações sociais; DEP-05 apenas quando depender da disponibilidade material de origem.

**Demonstração:**

1. Cadastrar Q1/Q2/Q3 de F-BEN e conferir Q1 → Q3 → Q2.
2. Entrar como usuário sem competência e tentar aprovar; depois decidir Q1 com GES-B autorizado.
3. No cenário isolado, liberar Q1 uma vez: total 7 unidades, saldo 63; reenvio mantém os valores.

**Aceite técnico:** Fila, prioridades, responsável pela decisão e transição do pedido são reais. A ordenação não é somente por chegada e a decisão indevida é recusada também no servidor.

**Atenção / limite:** Q-AS06/07: critérios e evento de liberação são configuráveis conforme definição fornecida. Não automatizar concessão por pontuação ou impor novas instâncias de aprovação.

<a id="aso-045"></a>
#### ASO-045 — Desligamento de família ou indivíduo do programa social

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 45, p. 308:**

> Permitir que o vínculo estabelecido entre famílias/indivíduos e os respectivos programas sociais possam ser desligados, caso a assistência não seja mais necessária;

**Implementação:** Disponibilizar desligamento do vínculo específico família/indivíduo → programa, com data, autoria e informação de motivo quando a operação adotada requerer. Conservar o registro histórico e permitir consultar ativos/desligados; não apagar pessoa, família, prontuário ou outros programas.

**Dados de outros módulos / formatos:** DEP-02 para pessoa; vínculo e histórico são do módulo. Não aciona cancelamento federal de benefício nem escrita no CADÚNICO.

**Demonstração:**

1. Em cenário separado, desligar o vínculo de programa de F1 ou P101 conforme o tipo cadastrado.
2. Consultar vínculos ativos e depois o histórico desligado.
3. Reabrir PAIF, PIA-P103 e liberações L1/L3: todos permanecem com os registros anteriores.

**Aceite técnico:** O vínculo deixa de aparecer como ativo na referência correta, mas seu passado permanece rastreável. Outros participantes/vínculos não são desligados em cascata.

**Atenção / limite:** Não concluir que cadastro local desligado significa Bolsa Família/BPC cancelado. A avaliação da necessidade de assistência é decisão profissional, não algoritmo criado neste MD.

<a id="aso-046"></a>
#### ASO-046 — Continuidade de acompanhamento entre unidades no próprio sistema

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 46, p. 308:**

> Realização de acompanhamentos de cidadãos entre unidades através do próprio sistema, para facilitar os trâmites referente ao envio para as unidades responsável pelos atendimentos;

**Implementação:** Registrar circulação/encaminhamento de cidadão para atendimento em outra unidade com referência de origem, destino e acompanhamento. A unidade destinatária deve recuperar a demanda e registrar sua atuação sem repetir pessoa/família. A unidade remetente acompanha o estado permitido, com histórico dos fatos de cada estabelecimento.

**Dados de outros módulos / formatos:** DEP-01/DEP-02; acompanhamento e unidades sociais; DEP-07 quando usado. Operação é interna e não pressupõe e-mail, Justiça ou API governamental.

**Demonstração:**

1. Executar ENC-1/ENC-2 entre U1 e U2.
2. No destino, abrir a demanda, registrar a atuação e consultar o acompanhamento.
3. Na origem, conferir a referência do destino e repetir tecnicamente o envio sem produzir outro caso.

**Aceite técnico:** O fluxo de informações entre unidades funciona na aplicação e mantém a identidade do assistido. O destino não precisa recadastrar a família e o envio não se passa por atendimento realizado.

**Atenção / limite:** Q-AS04/09: estados, acesso de origem/destino e responsabilidades. Não adicionar um novo módulo jurídico ou divulgar todo o prontuário por causa do encaminhamento.

### Relatórios:

<a id="aso-047"></a>
#### ASO-047 — Relatório de benefícios liberados com seis campos mínimos

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 47, p. 308:**

> Deverá emitir relatório com listagem de benefícios liberados, que contenha no mínimo: Nota Fiscal, bairro, tipo do benefício, nome do beneficiário, data de liberação e quantidade;

**Implementação:** Emitir listagem de liberações com todos os seis campos de CK-BEN-REL: nota fiscal, bairro, tipo de benefício, beneficiário, data de liberação e quantidade. Consultar a alocação real da entrada e o contexto do beneficiário; não obter NF por suposição. Agregar sem multiplicar a liberação quando houver várias origens fiscais; detalhe por origem deve preservar o total.

**Dados de outros módulos / formatos:** DEP-05 para NF/entrada se integração adotada; DEP-02 para pessoa; liberações/família/bairro sociais; DEP-06 para emissão.

**Demonstração:**

1. Emitir L1/L2/L3 no período de setembro e conferir três liberações, seis unidades e suas notas E1/E2/E3.
2. Conferir todos os campos mínimos na saída gerada, além de pesquisar por unidade/cidadão/família.
3. No teste de NF múltipla, conferir duas origens, 3 unidades e R$ 320,00 sem duplicação; emitir além da página visível.

**Aceite técnico:** O relatório é efetivamente gerado e seus campos mínimos ficam visíveis no documento. Nota, beneficiário e quantidade correspondem às operações e não ao último cadastro encontrado.

**Atenção / limite:** Q-AS07: definir NF inaplicável nos benefícios não materiais; não omitir a NF dos materiais nem fabricar documento fiscal. Relatório de entradas não substitui relatório de liberados.

<a id="aso-048"></a>
#### ASO-048 — Relatório de famílias por situação

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 48, p. 308:**

> Emitir relatórios com listagem de famílias cadastras por Situação;

**Implementação:** Emitir relação de famílias cadastradas com filtro/identificação de situação e referência temporal da consulta. Usar a situação familiar registrada, não a situação de um atendimento ou de um benefício. Manter identificação/responsável/unidade conforme o modelo autorizado e contagens distintas por família.

**Dados de outros módulos / formatos:** Famílias sociais e DEP-02 para identificação; DEP-06 para emissão; DEP-01 limita o recorte.

**Demonstração:**

1. Consultar F-FAMILIA no estado-base: duas ativas e uma em análise.
2. Emitir o filtro Ativa com F1/F2; depois Em análise com F3.
3. Verificar que três integrantes de F1 não geram três linhas de família no total.

**Aceite técnico:** A relação e os totais conciliam com as três famílias e suas situações, com filtros explícitos. Arquivo emitido abrange o conjunto completo autorizado.

**Atenção / limite:** Q-AS02/12: catálogo de situações e data de referência. Não classificar uma família como inativa só porque não tem atendimento no mês.

<a id="aso-049"></a>
#### ASO-049 — Relatório de extrema pobreza com classificação rastreável

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 49, p. 308:**

> Emitir relatórios que informam a Extrema Pobreza das famílias cadastradas;

**Implementação:** Emitir relatório das famílias classificadas em extrema pobreza pela fonte/regra válida indicada pela entidade, identificando referência e critério utilizado. Se calculado, guardar renda/denominador e vigência da regra; se importado, a fonte da classificação. Não excluir do controle de qualidade os casos não avaliáveis nem tratá-los como renda zero.

**Dados de outros módulos / formatos:** Famílias/renda sociais; EXT-CAD quando a classificação vier de arquivo identificado; DEP-06/DEP-01 para emissão protegida. Não depende de algoritmo preditivo.

**Demonstração:**

1. Aplicar apenas em homologação F-RENDA/REL com limiar DEMO de R$ 250,00.
2. Conferir F1: 600/3 = 200, incluída; F2: 600/2 = 300, não incluída; F3: informação insuficiente.
3. Emitir com fonte/regra e referência, sem apresentar o limiar fictício como lei municipal.

**Aceite técnico:** O relatório deriva dos dados e critérios indicados; famílias com renda desconhecida não são automaticamente classificadas. Resultado pode ser explicado e reproduzido.

**Atenção / limite:** Q-AS06: regra e fonte de extrema pobreza não foram fornecidas. A capacidade de parametrizar/testar não comprova configuração oficial. Não inventar um valor legal nem confundir Bolsa Família com classificação de renda.

<a id="aso-050"></a>
#### ASO-050 — Relatório de famílias com recebimento de Bolsa Família

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 50, p. 308:**

> Emitir relatórios das famílias que recebem Bolsa Família;

**Implementação:** Emitir relação de famílias com vínculo/situação de recebimento Bolsa Família no período/referência escolhidos, mantendo fonte e data da informação. Usar cadastro/arquivo efetivamente disponível, separando vínculo informado, situação desconhecida e benefício não recebido. Cadastro no CADÚNICO não é prova suficiente de recebimento.

**Dados de outros módulos / formatos:** Fonte social de programa e eventual EXT-CAD somente se contiver a informação pertinente; DEP-02/DEP-06 para nomes/emissão. Não presumir consulta ao sistema federal de pagamentos.

**Demonstração:**

1. Na base F-RENDA/REL, emitir beneficiárias da referência: somente F1.
2. Conferir F2 sem recebimento informado e F3 com situação desconhecida, sem incluí-las indevidamente.
3. Verificar que BPC-P201 não faz F2 aparecer como beneficiária de Bolsa Família.

**Aceite técnico:** A relação corresponde ao programa e à referência real dos dados disponíveis; situação desconhecida não vira negativa falsa. A emissão não alega conferência federal que não ocorreu.

**Atenção / limite:** Q-AS06: identificar fonte e atualização da informação. Não criar concessão automática, consulta bancária ou importador de folha federal além do que foi fornecido.

<a id="aso-051"></a>
#### ASO-051 — Relatório de integrantes em acompanhamento

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 51, p. 309:**

> Emitir relatórios que informam os integrantes em acompanhamentos;

**Implementação:** Emitir integrantes com vínculos de acompanhamento identificados, tipo, unidade/profissional e situação pertinentes. Distinguir acompanhamento individual do vínculo decorrente de acompanhamento familiar. Oferecer recorte que deixe explícito quais relações estão incluídas, sem multiplicar pessoas no total por várias relações.

**Dados de outros módulos / formatos:** Pessoas/famílias/acompanhamentos sociais; DEP-02 e DEP-06 quando fontes compartilhadas. Não deduzir acompanhamento por presença numa turma.

**Demonstração:**

1. No recorte individualizado de F-ACOMP/PIA, listar P103 e P202: duas pessoas.
2. No recorte que inclui membros do PAIF-F1, mostrar P101/P102/P103 pelo vínculo familiar, mais P103 socioeducativo e P202 PAEFI: cinco relações, quatro pessoas únicas.
3. Filtrar unidade/tipo e conferir detalhe de cada vínculo sem expor conteúdo sigiloso indevido.

**Aceite técnico:** O relatório informa quem está acompanhado e em qual contexto; pessoas únicas e vínculos são métricas distintas. Não inventa acompanhamento individual para todo membro de família.

**Atenção / limite:** Q-AS12: definir a referência de situação e a abrangência familiar/individual usada no formulário oficial. Listar nomes sem origem do vínculo não fecha a rastreabilidade.

<a id="aso-052"></a>
#### ASO-052 — Relatório do Plano Individual de Atendimento — PIA

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 52, p. 309:**

> Emitir relatório do Plano Individual de Atendimento – PIA;

**Implementação:** Gerar relatório do PIA a partir da ficha/medidas/evoluções registradas nos itens 23/37. Utilizar o modelo identificado, preservar ordem e identificação dos registros, assistido e responsáveis, com controle de acesso. A saída precisa mostrar o plano, não só uma relação de pessoas com PIA.

**Dados de outros módulos / formatos:** PIA e acompanhamento sociais; DEP-02/DEP-03 para identificação; DEP-06 para documento protegido.

**Demonstração:**

1. Emitir PIA-P103 a partir da ficha preenchida.
2. Conferir as duas medidas e três evoluções, além das informações do assistido/unidade.
3. Reemitir após alteração autorizada em cenário separado e verificar referência/versão sem apagar emissão anterior quando preservada pelo núcleo.

**Aceite técnico:** O documento corresponde ao plano consultado, inclui todas as partes registradas e respeita sigilo. PDF modelo vazio ou texto estático não atende.

**Atenção / limite:** Q-AS09/11: conteúdo integral do modelo deve ser confirmado. Não exigir assinatura ou envio automático ao Judiciário/IASES apenas pela emissão deste relatório.

<a id="aso-053"></a>
#### ASO-053 — Formulário de atendimento e histórico de atendimento emitíveis

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 53, p. 309:**

> Emitir relatório do Formulário de Atendimento – Histórico de Atendimento;

**Implementação:** Emitir o formulário de um atendimento com suas informações e o histórico correspondente aos filtros escolhidos, conforme modelo da entidade. Reutilizar autor/data/serviço/pessoa, evolução e vínculos autorizados; distinguir situação aberta/concluída. O documento deve conter a informação de atendimento, não somente uma grade de nomes e datas.

**Dados de outros módulos / formatos:** Atendimentos e prontuário sociais; DEP-02/DEP-03 e DEP-06 para identificação/emissão. Sigilo DEP-01 vale para conteúdo e anexos.

**Demonstração:**

1. Emitir formulário de AT1 e histórico de P101 no período: AT1 e AT4.
2. Conferir datas, profissionais, serviço e conteúdo do atendimento registrado.
3. Tentar incluir AT3 sigiloso sem permissão e verificar proteção na emissão como na tela.

**Aceite técnico:** Formulário/histórico são gerados dos fatos reais e a ordenação corresponde ao período. Há acesso ao conteúdo permitido sem perder registros pela paginação.

**Atenção / limite:** Não substituir a narrativa técnica por relatório agregado. Q-AS11/12: modelo, estados e referência de data precisam estar identificados.

<a id="aso-054"></a>
#### ASO-054 — Formulários CRAS e CREAS no padrão SUAS

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 54, p. 309:**

> Emissão dos Formulários de prestação de contas do CRAS e do CREAS no padrão SUAS.

**Implementação:** Identificar com a entidade o conjunto e as versões dos formulários requeridos. Construir mapeamento campo a campo para cada modelo CRAS e CREAS, com origem, filtro, competência e unidade de contagem; gerar as saídas reais a partir dos registros. Usar F-FORM para conferir famílias, pessoas, acompanhamentos e atendimentos sem misturá-los. A referência RMA externa é candidata a verificar, não substituição presumida da expressão “prestação de contas”.

**Dados de outros módulos / formatos:** MOD-SUAS: exemplares e instruções confirmados; fontes sociais para as contagens. DEP-06 para emissão. Se modelo demandar dado de outro módulo, destacar a origem e a falta; não inventar zero.

**Demonstração:**

1. Receber/identificar exemplar CRAS e exemplar CREAS aplicáveis, com versão e competência.
2. Preencher as matrizes F-FORM e emitir ambos a partir de cenários sociais rastreáveis.
3. Conferir todos os campos obrigatórios e as contagens; registrar campos não suportados ou informação de origem faltante.

**Aceite técnico:** Os dois formulários correspondem aos exemplares identificados e seus dados podem ser rastreados aos registros. Relatório genérico com logotipo SUAS não comprova padrão. A capacidade fica parcial enquanto o modelo não for confirmado.

**Atenção / limite:** Q-AS13: definição do conjunto, leiaute e regras. Não criar API de transmissão, login governamental ou protocolo oficial; o TR exige emissão. Não considerar formulário de uma unidade suficiente para as duas.

<a id="aso-055"></a>
#### ASO-055 — Formulário mensal para o IASES

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 55, p. 309:**

> Emissão do Formulário mensal par ao IASES;

**Implementação:** Implementar emissão mensal a partir do modelo especificamente confirmado para IASES, identificando município/unidade, competência e dados exigidos. Mapear fontes de acompanhamento/PIA e demais registros somente quando o exemplar assim pedir; manter regra de cada campo documentada. Não inventar que o formulário contém apenas número de adolescentes ou adotar qualquer arquivo da instituição.

**Dados de outros módulos / formatos:** MOD-IASES: exemplar, versão e instruções; dados sociais/PIA disponíveis; DEP-06 para emissão. Nenhum endpoint de IASES foi especificado pelo TR.

**Demonstração:**

1. Obter o modelo correspondente ao item e registrar a versão em F-FORM.
2. Emitir uma competência com dados fictícios coerentes e confrontar campo a campo com a fonte.
3. Reemitir a mesma competência sem duplicar acompanhamento; testar competência vazia distinguindo zero real de informação não disponível.

**Aceite técnico:** Formulário mensal é gerado no modelo identificado, com todos os campos e dados rastreáveis. Sem exemplar confirmado, a geração interna pode ser testada mas a aderência IASES permanece pendente.

**Atenção / limite:** Q-AS14: a busca pública não confirmou um modelo inequívoco para este item. Não usar formulário de círculos/restauração, RMA ou outro serviço como equivalente sem validação. Emissão não é transmissão ou aceite pelo IASES.

<a id="aso-056"></a>
#### ASO-056 — Relatórios dos agendamentos por unidade

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 56, p. 309:**

> Emissão de relatórios contendo informações sobre os Agendamentos Realizados pelas Unidades;

**Implementação:** Emitir agendamentos com unidade, profissional, assistido/contexto, data/horário agendados, situação e referência a retorno quando houver. Preservar cancelamentos/histórico e explicitar o filtro de situação. A expressão “agendamentos realizados” será demonstrada com reservas efetivamente registradas, distinguindo-as dos atendimentos que chegaram a ocorrer.

**Dados de outros módulos / formatos:** Agenda social, DEP-02/DEP-03 para identificação e DEP-06 para emissão. Não depende de agenda externa.

**Demonstração:**

1. Emitir F-AGENDA em setembro com todas as situações: AG1/AG2/AG3, três registros.
2. Filtrar ativos: dois; conferir que AG3 cancelado continua no histórico.
3. Verificar o vínculo de AG1 a AT1 e que os agendamentos não aumentaram os cinco atendimentos concluídos.

**Aceite técnico:** O documento reflete a agenda da unidade e o filtro, com cancelamento e retorno identificáveis. Data de cadastro da reserva não é confundida com horário agendado.

**Atenção / limite:** Q-AS04/12: confirmar se a avaliação espera reservas cadastradas ou comparecimentos; manter ambas as informações distintas sem limitar silenciosamente a consulta.

<a id="aso-057"></a>
#### ASO-057 — Quantitativos de triagem e atendimento por período, profissional e unidade

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 57, p. 309:**

> Emissão dos quantitativos de Triagem e Atendimento realizado, por período, por profissional, por unidade;

**Implementação:** Emitir contagens separadas de triagens efetivamente realizadas e atendimentos realizados conforme a regra de situação/data adotada. Filtros de período, profissional e unidade devem atuar na fonte correta. Quem fez a triagem e quem atendeu podem ser diferentes; o cabeçalho deve esclarecer o papel do profissional na medida.

**Dados de outros módulos / formatos:** Registros sociais de recepção/triagem/atendimento; DEP-03 se profissionais centrais; DEP-06 para emissão. Não deduzir contagem por abertura de tela.

**Demonstração:**

1. Emitir F-ATEND em setembro: quatro triagens e cinco atendimentos concluídos.
2. Conferir U1/TEC-A com 3/3 e U2/TEC-B com 1/2; dois atendimentos diretos somam zero triagem.
3. Em teste separado, finalizar AT6: seis concluídos e quatro triagens; impressão repetida mantém os totais.

**Aceite técnico:** Cada métrica concilia com seus eventos de origem, respeita filtros e não soma triagem + atendimento como o mesmo tipo de serviço. Evento aberto não é considerado concluído.

**Atenção / limite:** Q-AS12: regras de contagem e papel profissional devem ser registrados. Esses critérios de ensaio não substituem as definições do formulário SUAS.

<a id="aso-058"></a>
#### ASO-058 — Relatório geral de atendimentos da unidade

**TR — GESTÃO DE ASSISTÊNCIA SOCIAL, item 58, p. 309:**

> Emissão de relatório geral dos atendimentos de uma unidade;

**Implementação:** Emitir relatório geral por unidade e período, com relação dos atendimentos, identificação do profissional/serviço, data, situação e detalhamento permitido pelo perfil. Oferecer filtro de situação explícito e total do recorte completo, preservando o vínculo ao formulário/histórico. Não limitar à lista pessoal de um profissional quando o usuário possui o escopo geral da unidade.

**Dados de outros módulos / formatos:** Atendimentos sociais e DEP-01 para unidade/sigilo; DEP-02/DEP-03/DEP-06 para identificação e emissão.

**Demonstração:**

1. Na U1, emitir todos os registros de F-ATEND: AT1/AT2/AT4/AT6, quatro registros, três concluídos e um aberto.
2. Filtrar concluídos e emitir três; na U2, emitir AT3/AT5 conforme permissão, total dois.
3. Executar F-PAG isolado para conferir as 27 linhas do filtro no arquivo, não apenas as dez visíveis.

**Aceite técnico:** O relatório geral é emitido com o conjunto completo da unidade e seus estados, sem ocultar abertos sob um total ambíguo. Narrativas sigilosas continuam protegidas.

**Atenção / limite:** Não usar BI ou gráfico decorativo como substituto da emissão. Q-AS12: modelo e campos adicionais do relatório ficam sujeitos à configuração, preservando os fatos mínimos identificáveis.

<a id="pacotes"></a>
## 8. Pacotes de implementação e ordem de execução

Não estimar horas/dias sem examinar o repositório. Cada pacote entrega dados, serviço, interface, validação, emissão pertinente e teste. Compartilhar recursos e reutilizar funcionamento comprovado; a ordem abaixo não obriga reimplementar o que já estiver pronto.

| Pacote | Itens ASO | Entrega | Evidência principal |
|---|---|---|---|
| **P1 — Rede e acesso** | 2, 3, 15, 16, 38 | Unidades, profissionais/inscrições, serviços e perfis por estabelecimento. | F-REDE e testes de sigilo; disponibilizar agenda para P5. |
| **P2 — Pessoas, famílias e importação** | 14, 17, 18, 29, 30, 35, 36 | Identidade única, composição familiar, condições do domicílio, vínculos e prontuário; importador CADÚNICO. | F-FAMILIA/F-UNIFICACAO/F-IMPORT; EXT-CAD identificado para a compatibilidade final. |
| **P3 — Recepção e atendimentos** | 4, 5, 12, 20, 21, 31, 41 | Triagem orientada por serviço, atendimento direto, pareceres, quadro, retorno e declaração. | F-ATEND; retorno integrado a P5; reimpressão sem evento extra. |
| **P4 — Acompanhamentos e PIA** | 19, 23, 24, 25, 26, 27, 34, 37, 46 | PAIF/PAEFI, socioeducativo, medidas, violência/averiguação e circulação entre unidades. | F-ACOMP/PIA e CK-ENC, com sigilo e identidade preservados. |
| **P5 — Agenda e visitas** | 13, 22 | Horários do profissional por unidade e visitas domiciliares/a entidades. | F-AGENDA/VISITA; conflito e realização distintos. |
| **P6 — Turmas e atividades** | 6, 7, 28, 32, 33, 42 | Faixas etárias, participantes, frequência, ações coletivas e reuniões externas. | F-TURMA com emissão real e contagens sem duplicação. |
| **P7 — Benefícios e programas** | 8, 9, 10, 11, 39, 43, 44, 45 | BPC local, benefícios eventuais, entradas, fila, liberações, carteirinha, vínculo/desligamento. | F-BEN e CK-BEN-REL; fonte de estoque identificada quando houver. |
| **P8 — Mapa** | 40 | Georreferenciamento e filtros do conjunto autorizado completo. | F-MAPA sem posições inventadas e sem vazamento. |
| **P9 — Relatórios e modelos** | 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58 | Doze emissões específicas e fontes/modelos identificados para SUAS/IASES. | F-REL/F-FORM/F-PAG; padrões externos continuam pendentes sem exemplar confirmado. |

**P0 — diagnóstico:** localizar fontes reais, classificar os 57 itens, registrar a ausência de item 1 e abrir cedo os pedidos de leiaute CADÚNICO e modelos SUAS/IASES. Criar tela-piloto de atendimento/família antes de replicar layout. **P10 — ensaio final:** executar a matriz completa, regressões entre os pacotes e testes de sigilo, impressão, fonte e dispositivo. Esses dois pacotes não adicionam requisitos ao TR.

Acessibilidade, privacidade, dados e relatórios devem ser testados durante o desenvolvimento, não só ao final. Funções independentes podem avançar enquanto falta exemplar oficial; a falta do exemplar impede marcar o respectivo padrão como compatível, não autoriza excluir o item.

<a id="testes"></a>
## 9. Testes, evidências e regra de conclusão

### 9.1 Testes transversais obrigatórios neste plano

| Teste de implementação | Resultado observável |
|---|---|
| Persistência | Cadastro/evento reaparece após recarga e em outra sessão autorizada; não está só no estado do navegador. |
| Pessoa única | Unificação mantém referências e não funde homônimo; inclusão familiar não cria pessoa nova. |
| Cadastro e vínculo familiar | Sete pessoas em três famílias da fixture; responsável, domicílio, programa e serviço distintos. |
| Triagem versus atendimento direto | Quatro triagens e cinco concluídos na base; dois diretos sem triagem oculta. |
| Atendimentos abertos | AT6 aparece para TEC-A; concluir altera a lista, não apaga o histórico. |
| Agenda | Horários vêm da unidade/profissional; conflito/capacidade e reenvio tratados no servidor. |
| Visitas | Domicílio e parceiro funcionam; duas planejadas não são duas realizadas. |
| PAIF/PAEFI/PIA | Tipos, sujeitos e trajetórias distintos; PIA mantém duas medidas e três evoluções. |
| Encaminhamento entre unidades | Destino recebe demanda e consegue atender pela origem; pessoa/família não se duplicam. |
| Sigilo | API, arquivo, relatório, pesquisa, contagem e mapa não revelam conteúdo protegido. |
| Permissões | Unidade/função/perfil testados por acesso direto; papel hierárquico não vira acesso universal. |
| BPC/Bolsa Família | Cadastro local não é aprovação federal; desconhecido não vira não beneficiário ou renda zero. |
| Benefício material | Entradas 70; liberações 6; saldo 64; notas e valores de origem corretos. |
| Fila de benefícios | Ordem Q1/Q3/Q2; pendentes não somam liberados; decisão sem permissão é recusada. |
| Falha/concorrência de liberação | Duas confirmações da mesma operação geram um efeito; saldo insuficiente não é contornado por duas sessões. |
| NF múltipla | Três unidades de duas entradas continuam três, com as duas referências fiscais. |
| Turma/frequência | Seis posições de frequência: cinco presenças e uma ausência; não registrado é diferente de ausente. |
| Atividade coletiva | Três integrantes em duas ações continuam três pessoas no evento. |
| Desligamento | Encerra só o vínculo selecionado; preserva família, benefícios passados e outros acompanhamentos. |
| Mapa | 25 elegíveis, 23 localizadas, 2 sem posição; filtros e união corretos, sem limitação à página atual. |
| CADÚNICO | Amostra no leiaute identificado, erros por registro, reimportação sem duplicação, conflito sem sobrescrever parecer. |
| Documentos comuns | Comparecimento só após conclusão; carteirinha, frequência e PIA gerados dos registros, não arquivos fixos. |
| SUAS/IASES | Conferência de modelo e campo a campo, com competência; nenhum campo desconhecido vira zero. |
| Extrema pobreza | Critério com fonte/vigência; fixture DEMO não é alíquota/faixa legal. |
| Relatórios de unidade | Estados, autor, período e unidade explícitos; quadro geral distingue quatro registros U1 de três concluídos. |
| Contagens | Eventos, pessoas únicas, famílias únicas e participações têm rótulos e regras separados. |
| Paginação | 27 registros em 10/10/7; busca global e emissão integral, sem esconder registros de páginas posteriores. |
| Datas e vazios | Primeiro/último dia incluídos conforme a interface; período fora/sem dados funciona; erro de fonte não é “sem registros”. |
| UX | Título, filtros, tabela, ação e paginação legíveis; formulários preservam contexto; mapa/prontuário não são cortados. |
| Regressão | Consumidores de Pessoas, Estoque e Processos não quebram; nenhum teste publica dados sociais nos portais públicos. |

Esses são meios de provar as capacidades da fonte, não uma nova lista numerada de serviços exigidos pelo edital. Testes de desempenho e segurança complementam a demonstração funcional; capturas não comprovam transação nem compatibilidade de leiaute sozinhas.

### 9.2 Matriz que o agente deve entregar preenchida

Uma linha por **ASO-002 a ASO-058**. Ausência de ASO-001 é registro de lacuna documental, não funcionalidade presumida. O agente preenche os nomes reais após localizar/executar no repositório.

| ID | Estado inicial | Tela / rota real | Fonte e persistência | Teste / evidência | Dependência / ressalva |
|---|---|---|---|---|---|
| ASO-002 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-003 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-004 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-005 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-006 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-007 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-008 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-009 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-010 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-011 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-012 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-013 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-014 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-015 | A_VERIFICAR | A mapear | A mapear | Não executado | Q-AS03 — matriz hierárquica/função/sigilo a confirmar |
| ASO-016 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-017 | AGUARDA_LEIAUTE | A mapear | A mapear | Não executado | EXT-CAD / Q-AS08; capacidade local também a implementar/testar |
| ASO-018 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-019 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-020 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-021 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-022 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-023 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-024 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-025 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-026 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-027 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-028 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-029 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-030 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-031 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-032 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-033 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-034 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-035 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-036 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-037 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-038 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-039 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-040 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-041 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-042 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-043 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-044 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-045 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-046 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-047 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-048 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-049 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-050 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-051 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-052 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-053 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-054 | AGUARDA_MODELO | A mapear | A mapear | Não executado | MOD-SUAS / Q-AS13; CRAS e CREAS |
| ASO-055 | AGUARDA_MODELO | A mapear | A mapear | Não executado | MOD-IASES / Q-AS14; exemplar mensal não confirmado |
| ASO-056 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-057 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |
| ASO-058 | A_VERIFICAR | A mapear | A mapear | Não executado | Diagnóstico e testes do código |

Estados sugeridos: `A_VERIFICAR`, `EXISTE_NAO_TESTADO`, `A_IMPLEMENTAR`, `PARCIAL`, `VALIDADO_LOCAL`, `TESTADO_COM_FIXTURE_INTERNA`, `COMPATIVEL_LEIAUTE_IDENTIFICADO`, `INTEGRACAO_TESTADA`, `DEPENDENCIA_OUTRO_MODULO`, `AGUARDA_MODELO`, `AGUARDA_LEIAUTE` e `AGUARDA_DEFINICAO`.

Registrar separadamente **implementação da capacidade** e **validação do formato/padrão/integração**. Uma função pode ter teste local concluído e modelo oficial pendente. Evidência contém estado inicial, dados, perfil, ação executada, resultado observado, persistência, arquivo gerado quando pertinente e fonte consultada. Informar os testes que não foram executados; não marcar aprovação automaticamente pelo número de componentes criados.

### 9.3 Condições para encerrar o desenvolvimento

O resultado precisa funcionar de ponta a ponta no escopo do item: atendimento direto sem triagem; fila com decisão; programa com desligamento; encaminhamento atendível no destino; mapa real; importador real e relatórios emitidos dos registros. **ASO-017, ASO-054 e ASO-055 não ficam concluídos quanto ao padrão externo sem leiaute/exemplares identificados e conferidos.**

Os itens **23 e 37** compartilham a ficha PIA, mas o segundo exige medidas e ambos permanecem na rastreabilidade; o relatório é o item **52**. Unificação é **30**, não apenas cadastro familiar **14/18**. Triagem **4**, atendimento direto **5** e quantitativos **57** têm provas distintas.

Entregar arquivos realmente alterados, migrations incrementais, comandos de teste que foram executados, forma real de acesso ao módulo, contratos/dados externos usados e pendências com impacto. Caminho de documentação sugerido, a adaptar: `docs/poc/assistencia-social-status.md`; não é arquivo cuja existência foi verificada.

**Não afirmar “58/58 atendidos”.** A fonte contém 57 entradas, começando no 2. Também não afirmar “57/57 aprovados” com arquivo interno rotulado como CADÚNICO, formulários genéricos, mapas estáticos, benefícios liberados só no frontend ou prontuários acessíveis a todos. Validação técnica interna não é homologação da comissão nem prova de todos os requisitos gerais do edital.

<a id="pendencias"></a>
## 10. Definições pendentes e limites da fonte

### Q-AS01 — Item 1 ausente

O título da página 305 é seguido diretamente por **2**. A parte anterior pertence à inspeção sanitária; não importar um item dela para completar a numeração. A sequência segue até **58**, antes de BI na página 309. Registrar a lacuna e solicitar o complemento quando houver oportunidade; o plano mantém apenas os 57 textos existentes. Nenhuma capacidade adicional foi inferida como item 1.

### Q-AS02 — Cadastros, inscrições e composição familiar

Confirmar códigos de unidade, tipo de inscrição de cada profissional, identificação canônica, campos locais de família/domicílio e política de histórico/unificação. O TR não entrega um dicionário completo, nem estabelece que todos os profissionais têm a mesma inscrição. Não impor documento adicional como barreira universal ao atendimento.

### Q-AS03 — Hierarquia, unidade, sigilo e compartilhamento

ASO-015 tem redação ampla. Definir capacidades por função/unidade e a informação compartilhável na recepção, no destino do encaminhamento, no relatório e no mapa. A proposta deste MD é preservar acesso por finalidade e sigilo, sem supor que a hierarquia administrativa elimina restrições. Registrar o que foi decidido pela entidade; não divulgar dados restritos enquanto a decisão estiver ausente.

### Q-AS04 — Agenda, retorno, visita e estados de atendimento

Confirmar duração/capacidade, dias ofertados, profissional responsável por triagem e por atendimento, agenda da equipe, forma de concluir e nomenclatura dos estados. Para ASO-056, distinguir agendamento registrado de atendimento realizado. As datas e a capacidade 1 da fixture são escolhas de teste, não obrigação de funcionamento do serviço real.

### Q-AS05 — Turmas, idade e frequência

A fonte não fornece faixas etárias, corte de idade, limites de vagas ou condição para presença. Configurar o necessário e demonstrar classificação/registro/relatório. Não transformar uma pessoa fora da faixa em indeferimento automático de benefício. Ausente, presente e não registrado precisam de tratamento consistente.

### Q-AS06 — BPC, Bolsa Família, benefícios e extrema pobreza

Identificar o que representa o registro local do benefício, fonte da situação de recebimento, competência/referência e critérios válidos de classificação/prioridade. Não usar a inscrição no CADÚNICO como prova de concessão; não codificar limiar monetário por memória. Critério DEMO só testa cálculo e filtro. Os dados oficiais e a validação profissional são complementares ao teste do mecanismo.

### Q-AS07 — Entrada, liberação, quantidade, NF e origem no estoque

Definir quando uma concessão material afeta disponibilidade e se o Almoxarifado já é a fonte, evitando duplicação. Confirmar tratamento de benefícios monetários e ausência legítima de NF: o item 47 pede NF, mas não detalha todos os tipos. A demonstração de materiais deve conservar as seis colunas; inaplicabilidade a outro tipo precisa ficar explícita, não preenchida com documento fictício. A fonte também não prescreve método de valorização contábil: os valores da fixture seguem a entrada alocada como conferência operacional.

### Q-AS08 — Leiaute e arquivo CADÚNICO

Obter **arquivo de exemplo autorizado, versão, codificação, estrutura, chaves e dicionário** do fornecimento efetivamente usado pela entidade. A confirmação pública de que dados identificados existem não fornece o formato do arquivo desta contratação. Implementar o pipeline/canonicalização enquanto aguarda, mas não anunciar compatibilidade por conseguir ler qualquer planilha. O importador não substitui o sistema nacional nem atualiza o governo.

### Q-AS09 — Conteúdo de PAIF, PAEFI, socioeducativo e PIA

Confirmar ficha/modelo utilizado, catálogos, fontes de medida, responsáveis e compartilhamento. Os campos propostos dão estrutura operacional, sem criar um padrão legal novo. Cadastro de PIA deve comportar todas as medidas registradas, e a emissão deve usar o mesmo conteúdo. Não criar decisão ou cálculo judicial automático.

### Q-AS10 — Camada cartográfica e georreferenciamento

Localizar provedor/camada licenciada, formato/referência das coordenadas, precisão e estratégia de acesso. Não registrar família sem posição numa coordenada fictícia. O mapa de violência é de uso restrito: não liberar publicamente ou transmitir atributos de situação social ao provedor externo para gerar pinos.

### Q-AS11 — Modelos dos documentos comuns

Confirmar cabeçalho/campos de declaração de comparecimento, carteirinha, frequência, PIA e formulários de atendimento. Estes itens permitem modelos de demonstração coerentes onde não há leiaute prescrito; a emissão precisa derivar de registros reais do ensaio. Não inventar assinaturas, selos, QR, validade ou prova de concessão não pedida.

### Q-AS12 — Datas, situações e unidades de contagem

Documentar período, data do fato, situação considerada, unidade responsável, papel do profissional e distinção de eventos/pessoas/famílias. A relação de acompanhamento pode mostrar vínculos familiares/individuais, mas os totais precisam ter significado. Para dados oficiais, aplicar a regra do exemplar identificado em vez de assumir que o número de linhas de atendimento corresponde a todos os campos.

### Q-AS13 — Modelos SUAS para CRAS e CREAS

O requisito **54** pede formulários de prestação de contas no padrão SUAS, sem identificar código, versão ou anexá-los no bloco. Confirmar com a entidade quais exemplares são exigidos. RMA é referência oficial encontrada para registro de atendimento, mas **não foi estabelecido que cobre sozinho tudo que a comissão chamará de prestação de contas**. Se campos dependerem de informação financeira de outro módulo, destacar a fonte; não inventar dados nem desenvolver contabilidade social paralela. A tarefa é emissão, não transmissão presumida.

### Q-AS14 — Formulário mensal IASES

O requisito **55** não fornece modelo, versão ou campos. Na busca pública foram encontrados materiais do IASES, incluindo formulários de outras atividades, mas nenhum foi confirmado como o formulário deste item. Solicitar exemplar e instruções de competência/mapeamento. Preparar o gerador e as fontes de dados, sem declarar um relatório genérico como padrão IASES nem fabricar recibo de entrega.

<a id="fontes"></a>
## 11. Fontes e conferência documental

### 11.1 Fonte contratual e distinção de escopos

**TR-AS:** `termo de referencia (Ratificado)(1).pdf`, 335 páginas, Processo Administrativo nº 1026/2026, **Gestão de Assistência Social, pp. 305–309**, sequência **2–58**. Fonte exclusiva das funcionalidades específicas transcritas. O bloco começa após Inspeção Sanitária e termina antes de Gestão de Business Intelligence.

**UX-BASE:** padrão desta conversa, consolidado nos MDs de Almoxarifado/Patrimônio, Portais, Portal do Servidor e RH/Folha: interface estruturada, paginação real, fonte operacional legível, controle de acesso, uso do mesmo site no Chrome e dados de outros módulos destacados. Essas decisões não são novos números do edital.

Nenhum percentual de aprovação da POC é presumido neste documento. Os requisitos gerais do edital continuam pertinentes, mas esta é a análise do bloco de Assistência Social e de suas dependências, não auditoria integral da licitação.

### 11.2 Pesquisa externa pontual — não substitui o TR

Consulta em **19/09/2026**. Foram utilizadas apenas fontes institucionais para orientar a identificação de bases/modelos. As observações abaixo não acrescentam serviços obrigatórios nem tornam acessos disponíveis ao CeleriFlow.

**EXT-REF-01 — MDS, serviço “Solicitar a base de dados do Cadastro Único”.** A página descreve acesso autorizado a dados identificados e orienta procurar o gestor da esfera correspondente quando o pedido é de dados de estado/município específico. Isso fundamenta solicitar a amostra/base autorizada à entidade, não criar uma API nacional presumida. Não foi obtido o arquivo ou dicionário do município. Fonte: `https://www.gov.br/pt-br/servicos/solicitar-cessao-de-dados-identificados-do-cadastro-unico`.

**EXT-REF-02 — MDS/Rede SUAS, “Registro Mensal de Atendimentos”.** O conteúdo oficial indexado descreve registro mensal de quantidades nos CRAS/CREAS e registro individualizado de famílias. É referência para investigar os modelos de ASO-054, não prova de que RMA e “prestação de contas” são equivalentes no edital. Exemplares/campos oficiais não foram adotados automaticamente; a abertura de algumas páginas retornou autenticação/erro. Fontes: `https://blog.mds.gov.br/redesuas/registro-mensal-de-atendimentos/` e `https://www.gov.br/mds/pt-br/acoes-e-programas/suas/gestao-do-suas/vigilancia-socioassistencial-1/registro-mensal-de-atendimentos-2013-rma`.

**EXT-REF-03 — IASES, formulários de práticas restaurativas.** A página encontrada reúne instrumentos para círculos/práticas restaurativas, incluindo controle mensal. Seu título/contexto não confirma correspondência com o formulário mensal requerido em ASO-055. Foi usada somente para registrar a limitação da busca, **não como modelo substituto**. Fonte consultada: `https://iases.es.gov.br/formulario-de-solicitacao-de-circulos-de-construcao-de-paz`.

**Resultado da pesquisa:** há referência para acesso autorizado à base e documentação de RMA, mas não foi identificado o leiaute do arquivo municipal CADÚNICO, o conjunto de formulários SUAS desta avaliação nem o exemplar IASES correspondente. Essas três definições permanecem necessárias. Não foram pesquisadas/aplicadas tabelas de renda, valores de benefícios ou regras de medidas socioeducativas para preencher lacunas por suposição.

### 11.3 Conferências executadas na composição deste arquivo

| Verificação executada na composição | Resultado |
|---|---:|
| Entradas da fonte identificadas neste bloco | 57 |
| Faixa numérica original preservada | 2–58 |
| Entradas antes de Relatórios | 45 |
| Entradas em Relatórios | 12 |
| Citações individuais coincidentes em duas extrações textuais | 57 |
| Blocos de implementação, dependências, demonstração, aceite e limite | 57 conjuntos |
| IDs ausentes da sequência 2–58 no plano | 0 |
| Item 1 inventado ou renumeração aplicada | 0 |
| Divergências entre extrações após normalizar espaços/quebras | 0 |
| Verificações aritméticas/de conjuntos das fixtures executadas | 70 |
| Links internos sem destino na verificação programática | 0 |
| Requisitos sem pacote de implementação | 0 |
| Testes do CeleriFlow executados nesta elaboração documental | 0 |

As imagens das páginas **305, 308 e 309** foram inspecionadas para conferir início no item 2, requisitos de benefícios/mapa, subtítulo Relatórios e encerramento no item 58. As extrações textuais de todas as páginas 305–309 foram comparadas para as transcrições. Isso é conferência documental, não execução de casos no CeleriFlow.

Os cálculos e conjuntos da seção 6 foram verificados programaticamente para apoiar o ensaio. Eles precisam ser reproduzidos por operações do software, nunca fixados na interface. A matriz começa sem testes de implementação realizados.

**Entrega final esperada:** módulo de Assistência Social operacional e integrado ao CeleriFlow, com as 57 entradas documentadas executáveis no alcance definido, prontuários protegidos, documentos emitidos das fontes reais de homologação, teste por ID e pendências de leiaute/modelo/definição claramente registradas. Não encerrar com apenas outro Markdown nem anunciar aprovação formal da comissão.
