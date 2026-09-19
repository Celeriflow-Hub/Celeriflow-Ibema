# CeleriFlow — Contabilidade Pública da Câmara
## REV01 · Escopo, reaproveitamento e definições pendentes

**Data:** 19/09/2026. **Destinatário:** Codex/Antigravity com acesso ao repositório.

**Fonte:** `termo de referencia (Ratificado)(1).pdf`, Processo Administrativo nº 1026/2026, 335 páginas. Referências: relação de migração/implantação, item 22, p. 3; manutenção/suporte, item 22, p. 7; bloco Contabilidade Pública, pp. 63–73.

**Situação:** o tema consta na contratação, mas não foi localizado um bloco técnico próprio numerado de “Contabilidade Pública – Câmara” no texto integral do TR. Não há fundamento para criar uma lista nova de requisitos ou copiar os 166 itens da Contabilidade e declarar que são 166 exigências específicas adicionais da Câmara. **Ausência de detalhamento não significa inexistência da obrigação contratada.**

Este MD trata a fronteira técnica e as decisões que precisam ser confirmadas. Os códigos `CAM-TEC` abaixo são tarefas de diagnóstico/integração e teste propostos, **não números de requisito do edital**. Eles não entram na contagem de 2.006 novas entradas dos demais módulos.

## 1. O que a fonte efetivamente registra

### 1.1 Relação de migração e implantação — item 22, p. 3

> Migração e Implantação do Sistema de Gestão de CONTABILIDADE PUBLICA - CÂMARA

O item identifica a solução destinada à Câmara, com unidade e quantidade na tabela. Não descreve, por si só, um segundo motor contábil, um banco isolado ou todas as funções a demonstrar.

### 1.2 Relação de manutenção/suporte — item 22, p. 7

> Manutenção / Suporte Mensal do Sistema de Gestão de CONTABILIDADE PUBLICA - CÂMARA

Essa referência mantém a entrega na relação contratual. Não deve ser apagada da matriz de acompanhamento por faltar um capítulo técnico próprio.

### 1.3 Contabilidade Pública — item 159, p. 73

> Permitir Consolidação da Unidade Gestora do Legislativo

Esta é uma exigência numerada dentro da **Contabilidade Pública já documentada como CTB-159**. A implementação e o teste desse item continuam necessários no MD contábil existente. Sua presença não transforma automaticamente todos os demais CTB em itens próprios da Câmara.

Também há requisitos de individualização por unidade gestora e consolidação na Contabilidade. Devem ser considerados na configuração e nas interfaces existentes, sem fazer inferência de escopo comercial ou permissões administrativas não expressas.

## 2. Decisão de arquitetura proposta, sujeita à confirmação

**Reutilizar o núcleo contábil do CeleriFlow**, com a Câmara identificada no contexto de entidade/unidade gestora, período, permissões, numeração e documentos. Não criar por padrão outro ERP, outro banco, outro conjunto de fórmulas ou cadastros desconectados só para oferecer uma entrada “Câmara”.

O ponto de acesso pode ser um contexto dentro da Contabilidade ou uma entrada própria que abra esse mesmo núcleo já filtrado, conforme organização efetivamente adotada. O TR aqui não fornece elementos para tornar um novo card, domínio, infraestrutura ou autenticação independente uma obrigação adicional.

A Câmara conserva a autoria e a identificação de seus fatos. A visão consolidada deve manter o registro original e não ser uma segunda cópia operacional dos lançamentos. **Consultar consolidado não significa autorizar editar fatos de outra unidade.**

Se a implementação atual já tiver instância independente por órgão, não migrar ou unificar dados destrutivamente; mapear a interoperabilidade e apresentar a decisão necessária ao usuário. O repositório não foi inspecionado nesta análise.

## 3. Fonte de desenvolvimento que já existe

Usar como referência técnica, sem recontar seus itens:

`CeleriFlow_POC_Contabilidade_Publica_Desenvolvimento_REV01.md`

Esse arquivo contém os CTB-001 a CTB-166 e seus testes. Depois da definição institucional, registrar **quais CTB serão demonstrados no contexto da Câmara**, quais são de consolidação e quais pertencem exclusivamente a outro contexto. Não modificar o texto original dos CTB para eliminar funções por inferência.

Uma mesma implementação pode ser testada com mais de uma unidade, mas a evidência deve declarar contexto, usuário, período, operação e documento. Não marcar todo o tema Câmara como pronto apenas porque o motor contábil está acessível a um administrador.

## 4. Diagnóstico e desenvolvimento autorizáveis

| Tarefa proposta | Implementação/diagnóstico | Demonstração | Condição de conclusão |
|---|---|---|---|
| **CAM-TEC01 — Mapeamento do contexto** | Localizar entidade, unidade gestora, exercício, dados cadastrais e serviços atuais. Registrar as referências da Câmara fornecidas pela contratante. | Abrir o contexto de teste e mostrar a identificação correta, sem usar dados reais inventados. | O contexto é distinto e a origem de seus dados está identificada. |
| **CAM-TEC02 — Acesso e isolamento** | Aplicar permissões do núcleo a consultas, gravações, documentos e exportações por unidade. Não presumir que usuário do Executivo pode alterar dados legislativos. | Conta restrita à Câmara consulta seu registro e tenta acessar outro contexto; testar também pela API. | Acesso indevido é recusado; perfil de consolidação mantém o alcance aprovado, sem privilégio excessivo. |
| **CAM-TEC03 — Reaproveitamento contábil** | Usar as operações CTB cuja aplicação for confirmada, sem nova lógica de contabilização em tela paralela. | Executar um evento aprovado no contexto da Câmara e verificar registro, saldo e documento do núcleo. | O evento existe uma vez e respeita as regras do CTB correspondente. |
| **CAM-TEC04 — Consolidação legislativa** | Implementar/testar CTB-159 com identificação dos registros de origem e exclusão de duplicações de intercâmbio. | Executar o cenário C-CAM abaixo e detalhar os fatos originais. | O consolidado mantém rastreabilidade, sem regravar os mesmos fatos como novos. |
| **CAM-TEC05 — Documentos e numeração** | Identificar cabeçalhos, assinaturas de apresentação, unidade, exercício e sequências configuradas nas funções aplicáveis. | Emitir dois documentos de teste com os contextos corretos. | Documento não apresenta brasão, responsável, número ou fonte pagadora de outro órgão indevidamente. |
| **CAM-TEC06 — Migração e suporte** | Mapear dados legados, período, leiaute, responsabilidades e método de validação conforme a implantação contratada. | Importar lote técnico autorizado, confrontar quantidades/saldos e repetir sem duplicação. | Plano e resultado de migração são rastreáveis; lote DEMO não é declarado migração oficial concluída. |

**Limites:** não calcular duodécimo, limite constitucional do Legislativo, folha de vereadores, encargos ou remessas específicas sem fundamento na configuração/requisito aplicável. Uma demanda posterior confirmada deve ser vinculada à fonte, não acrescentada silenciosamente por costume de mercado.

## 5. Cenário C-CAM — teste técnico, não regra contábil oficial

Preparar duas unidades fictícias: UG-EXEC-DEMO e UG-CAM-DEMO. Usar fatos já registrados e válidos no núcleo de Contabilidade, com a mesma competência e medida, evitando somar empenhado, liquidado e pago como se fossem uma medida única.

| Recorte de despesa empenhada DEMO | Valor |
|---|---:|
| UG-EXEC-DEMO | R$ 8.000,00 |
| UG-CAM-DEMO | R$ 2.000,00 |
| Total consolidado da mesma medida | **R$ 10.000,00** |

Conferir três consultas: Executivo 8.000; Câmara 2.000; consolidado 10.000. Importar novamente a mesma referência legislativa **não** muda o total. Detalhar o total deve revelar os dois fatos originais e seus documentos, não dois lançamentos adicionais criados para consolidação.

A conta restrita à Câmara não pode consultar os detalhes do Executivo. A conta consolidante acessa apenas o que sua competência permitir e não recebe, por isso, permissão de alterar os fatos de origem. Nenhum teste executa pagamento ou transmite prestação de contas em produção.

O cenário precisa dos serviços contábeis reais do ambiente de homologação. Se estiverem indisponíveis, um adaptador de laboratório testa somente a integração consumidora e deve permanecer identificado como simulado.

## 6. Interface e dados de outros módulos

Manter a tipografia e os componentes do CeleriFlow: texto operacional de referência 14 px/20 px, títulos de 20 px/26 px, tabelas paginadas e ações acessíveis. O contexto **Câmara / unidade gestora / exercício** fica visível sem ocupar a tela com indicadores decorativos. Priorizar listagens sem rolagem global; preservar leitura integral dos documentos e acessibilidade com zoom.

No celular, usar o mesmo site no Chrome. Não criar outro aplicativo. Mostrar somente os módulos e funções permitidos à conta.

| Fonte prevista | Dados/serviço | Limite |
|---|---|---|
| Administração/Organograma | Entidade, UG, responsáveis e cadastro institucional | Reutilizar, sem inventar cadastro real da Câmara. |
| Identidade/Permissões | Sessão, perfil e escopos | Não criar banco de senhas independente. |
| Contabilidade/Tesouraria | Eventos, planos, exercícios, saldos, consolidação e documentos | Este núcleo é a fonte operacional, não um resumo copiado em tabela auxiliar. |
| Compras/RH/Patrimônio e outros | Fatos de origem quando vinculados a funções aplicáveis | Consumir dados existentes; não reconstruir seus módulos. |
| Relatórios/Arquivos | Modelos, versões e emissão | Documento deve representar o fato e a unidade corretos. |
| Legado/Tribunal | Arquivos e destinatários, se forem confirmados | Não presumir um leiaute próprio legislativo não fornecido. |

## 7. Perguntas que precisam de definição documentada

**CAM-Q01 — Escopo da Câmara:** quais funções de Contabilidade Pública serão utilizadas/demonstradas no contexto legislativo? Existe roteiro complementar, anexo, resposta oficial ou configuração institucional que delimite esse escopo?

**CAM-Q02 — Instância e responsabilidade:** a Câmara opera o mesmo núcleo com unidade própria ou uma origem independente a consolidar? Quem registra os fatos e quem apenas consulta/consolida?

**CAM-Q03 — Cadastros e modelos:** quais identificadores, saldos, exercícios, assinaturas, documentos e numerações serão usados? Receber dados pela contratante; não preenchê-los com suposições.

**CAM-Q04 — Migração:** qual origem, período e conjunto de dados serão entregues para migração? Quais totais e documentos serão usados para a validação?

**CAM-Q05 — Comprovação:** como a Administração pretende avaliar esse tema, já que não foi localizado bloco técnico próprio? Não transformar a ausência em dispensa nem em uma lista inventada de funções.

## 8. Matriz de acompanhamento

| Referência | Natureza | Situação inicial | Evidência |
|---|---|---|---|
| Item 22 da relação, p. 3 | Migração/implantação contratada | AGUARDA_DEFINICAO_ESCOPO | Não executado |
| Item 22 da relação, p. 7 | Manutenção/suporte contratado | AGUARDA_DEFINICAO_OPERACIONAL | Não executado |
| CTB-159, p. 73 | Requisito técnico já existente de consolidação legislativa | A_VERIFICAR_NO_MD_CONTABIL | Não executado |
| CAM-TEC01 a CAM-TEC06 | Tarefas técnicas propostas, não novos itens do TR | A_MAPEAR | Não executado |

**Não existe autorização documental neste MD para declarar “166 requisitos da Câmara atendidos”.** Entregar o mapeamento, a decisão de escopo, as configurações/testes aplicáveis e as pendências. O tema fica contemplado na carteira de desenvolvimento, mas sua especificação técnica própria continua dependente de definição.

## 9. Conferência documental

A relação inicial e as referências de manutenção foram verificadas no TR; a busca por Câmara no texto integral não revelou um bloco técnico próprio como os demais módulos. O item contábil de consolidação do Legislativo foi mantido como referência existente. As três transcrições acima normalizam somente espaços/quebras.

Este arquivo não contém nem contabiliza novas exigências funcionais. As tarefas e o cenário são propostas de desenvolvimento subordinadas à definição de escopo e não comprovam software já implementado, migração concluída ou aprovação na POC.
