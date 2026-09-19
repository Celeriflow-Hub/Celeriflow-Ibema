# CeleriFlow — Desenvolvimento e demonstração da POC
## Gestão do Portal do Servidor | Card individual no CeleriFlow

**Revisão 01 — 18/09/2026.**  
**Destinatário:** Codex/Antigravity com acesso ao repositório real.  
**Fonte funcional:** `termo de referencia (Ratificado)(1).pdf`, Processo Administrativo nº 1026/2026, seção 19, bloco **GESTÃO DO PORTAL DO SERVIDOR**, páginas **89–91**, itens **1–20**. O bloco começa depois do item 201 de RH/eSocial e termina antes de **GESTÃO TRIBUTÁRIA**.  
**Identificadores:** **PSV-001 a PSV-020**, mantendo a numeração original do TR.  
**Entrega:** desenvolver/adaptar **Portal do Servidor como um card individual na seleção de módulos do CeleriFlow**, com área de autoatendimento e funções de RH/gestor no mesmo módulo, limitadas pelas permissões.

> **Ordem ao agente:** localizar o que já funciona, implementar as lacunas, conectar os dados de origem e executar os testes por requisito. Não entregar somente outro planejamento, um card sem conteúdo, telas com dados fixos, documentos de exemplo apresentados como emissão real ou solicitações sem tratamento pelo RH/gestor.

**Decisões do usuário:** card próprio, separado de RH/Folha, Portal Institucional e Portal da Transparência; mesma aplicação e identidade do CeleriFlow; telas profissionais, tabelas paginadas e prioridade para ausência de rolagem global nas listagens de desktop; acesso pelo mesmo site no Chrome do celular, sem aplicativo separado. **Destacar os dados e serviços de outros módulos e consumir o que já existir, sem reconstruir a origem.**

**Limite desta análise:** o repositório, a folha, a autenticação, os serviços de e-mail, os modelos de documentos e as regras de férias da entidade não foram inspecionados nem executados. Este arquivo cobre planejamento e demonstração dos 20 itens; não declara software implementado ou POC aprovada. Referências externas pontuais de segurança e do informe estão identificadas na seção 11 e não alteram a transcrição do TR.

**Leitura correta:** somente o campo **TR** reproduz a exigência original, inclusive imperfeições, normalizando apenas espaços e quebras de linha. Campos auxiliares, organização de telas, estados, critérios de teste, dados e valores são **propostas de implementação/ensaio**, não roteiro oficial da comissão. Não presumir estatuto funcional, regras médicas, alíquotas, prazo de férias ou competência de autorização que a fonte não forneceu.

**Este MD é independente:** não substitui o plano conjunto dos portais Institucional/Transparência nem incorpora seus itens. Portal do Servidor é o terceiro contexto, pessoal e autenticado, e deverá ter identidade própria de acesso dentro do CeleriFlow.

**Navegação:** [Escopo e card](#escopo) · [20 requisitos](#lista) · [Outros módulos](#dependencias) · [Operações e segurança](#operacao) · [Interface profissional](#ux) · [Base fictícia](#base) · [Item a item](#itens) · [Pacotes](#pacotes) · [Testes e evidências](#testes) · [Definições pendentes](#pendencias) · [Conferência e fontes](#fontes)

---
<a id="escopo"></a>
## 1. Escopo e organização do acesso

### 1.1 Um card individual, não um novo sistema

Ler as instruções locais (`AGENTS.md`, quando houver), manifests, lockfile, migrations, componentes, autenticação e testes. Confirmar as convenções de módulos e o cadastro de vínculos funcionais. Não presumir nomes de tabelas, rotas, ORM, provedor de identidade ou versão de biblioteca.

Registrar um único card **“Portal do Servidor”** no catálogo/tela de módulos, no mesmo nível visual dos demais cards do CeleriFlow. Usar título legível, ícone da biblioteca existente, descrição curta e destino real. Descrição sugerida: **“Contracheques, dados funcionais e solicitações.”** Não inserir salário, diagnóstico ou documento pessoal na face do card. Não criar um card de aplicação independente para cada solicitação.

O card deve abrir o módulo próprio, não a listagem geral de funcionários do RH. A navegação interna distingue **Meu Portal**, **Análise e Autorizações** e **Configurações**, somente para os usuários com as capacidades correspondentes. Não manter versões paralelas “Servidor antigo” e “Servidor POC”. Se já houver portal separado, preservar seus dados e serviços, oferecendo o card como entrada integrada; não impor migração de infraestrutura só por mudar a navegação.

Quem já está autenticado e vinculado corretamente deve entrar pelo card sem outra senha desnecessária. Quem abre o endereço do módulo sem sessão encontra o acesso **CPF e senha** do item 1, integrado ao mecanismo de identidade existente. O login comum do ERP não dispensa demonstrar o CPF como identificador padrão do Portal. Não criar um banco de senhas exclusivo nem obrigar um servidor a ser administrador do ERP para ter acesso pessoal.

Se o servidor não utiliza outros módulos administrativos, a mesma aplicação pode mostrar somente o card e as funções que lhe são autorizadas. Acesso direto pela URL aplica as mesmas permissões; ocultar o card não constitui controle de autorização. Caminho como `/portal-servidor` é apenas exemplo conceitual a mapear ao repositório, não rota confirmada.

### 1.2 Fronteiras com RH e com os outros portais

**Pertence a este desenvolvimento:** card, acesso pessoal, consultas e emissão dos documentos previstos, validação do contracheque, criação e acompanhamento das solicitações, conferência pelo RH, autorizações do gestor, anexos vinculados, avisos, acesso às orientações, listagens e configuração dos campos que o servidor pode conferir/atualizar.

**Continua na origem:** cálculo da folha, eventos e bases remuneratórias, classificação fiscal do informe, cadastro funcional oficial, saldo/período aquisitivo de férias, regras de afastamento, organograma e registros institucionais. O Portal consome e, quando houver operação aprovada, aciona o serviço autorizado do domínio responsável. Não criar uma segunda folha ou sobrescrever cadastros centrais por SQL para contornar validações.

A tela de análise de pedidos **faz parte deste pacote**, mesmo que o operador seja do RH. “O RH decide” não é motivo para entregar somente a solicitação do servidor. Da mesma forma, a existência de um cadastro de férias no RH não substitui o pedido pelo servidor e a autorização pelo gestor exigidos aqui.

O Portal da Transparência publica o recorte público autorizado. O Portal do Servidor apresenta documentos e informações pessoais ao titular e às pessoas autorizadas. Não compartilhar payloads, cache, links públicos de arquivos ou permissões por mera semelhança dos nomes “servidores” e “folha”. Não levar comprovantes médicos para o repositório público do Institucional.

### 1.3 Classificação das orientações

| Classe | Origem | Limite de execução |
|---|---|---|
| **TR-E** | Item específico 1–20. | Entregar todos os objetos, campos e ações da redação. |
| **UX/CARD/CANAL** | Decisão do usuário. | Card individual, interface profissional e mesma aplicação no celular. |
| **TEC** | Meio de funcionamento. | Segurança, validação, consistência, confirmação, controle concorrente e testes; sem novos ritos administrativos. |
| **DEP-MOD / DEP-SERV** | Dados ou capacidade compartilhada. | Localizar a fonte, consumir seu serviço e registrar falta; não reconstruir outro módulo. |
| **DEF** | Informação não especificada ou interpretação necessária. | Registrar a decisão e o impacto, sem atribuí-la ao TR. |
| **EXTRA** | Funcionalidade sem relação com este recorte. | Não incluir neste pacote. |

### 1.4 Não acrescentar — e não retirar

**Fora deste pacote:** cálculo de folha/IR/INSS, admissão ou desligamento, concessão de benefícios previdenciários, eSocial/REINF/DIRF, transmissão à Receita, pagamento bancário/Pix, adiantamentos, compra de cursos, execução de diárias, controle de ponto, banco de horas, consignados, empréstimos, emissão de laudo/atestado médico, perícia automática, agenda de clínica, validação em conselho médico, LMS/aulas/certificados de curso, rede social interna, ponto por geolocalização, aplicativo nativo/híbrido, instalação de PWA, WhatsApp/SMS/push, assinatura ICP-Brasil obrigatória por analogia com outros módulos ou novo motor genérico de processos.

Não impor reconhecimento facial, MFA novo, senha específica para cada aba, comprovante em todo campo, aprovação em múltiplos níveis, duas pessoas distintas para qualquer decisão ou prazo fixo de férias sem definição. Preservar controles existentes compatíveis, mas não os promover a novos requisitos específicos do TR.

**Não retirar:** acesso por CPF/senha; recuperação por e-mail; **consulta e emissão de contracheque e informe RFB**; autenticação do contracheque impresso; conferência e validação/rejeição pelo RH; listagem de aniversariantes; avisos individuais/coletivos; emissão do organograma; fichas funcional/financeira anual; as quatro famílias de solicitação e suas autorizações; CID, médico, período e comprovante no formulário pertinente; gastos adicionais e flyer opcional no pedido de curso; configuração de conferência, atualização e comprovação por campo.

<a id="lista"></a>
## 2. Lista dos 20 itens na ordem da fonte

Os títulos a seguir são resumos de navegação; o texto integral está na seção 7. O TR não apresenta subtítulos internos neste bloco. As áreas de tela deste MD são organização de desenvolvimento.

| ID / item | Ação resumida | Página do PDF |
|---|---|---:|
| [PSV-001 / 1](#psv-001) | Acesso por CPF e senha no card Portal do Servidor | 89 |
| [PSV-002 / 2](#psv-002) | Recuperação de acesso pelo e-mail previamente cadastrado | 89 |
| [PSV-003 / 3](#psv-003) | Consulta e emissão de contracheque e informe de rendimentos RFB | 89 |
| [PSV-004 / 4](#psv-004) | Validação web do contracheque impresso | 89–90 |
| [PSV-005 / 5](#psv-005) | Conferência, validação ou rejeição pelo RH | 90 |
| [PSV-006 / 6](#psv-006) | Emissão da listagem de aniversariantes | 90 |
| [PSV-007 / 7](#psv-007) | Avisos individuais e coletivos aos funcionários | 90 |
| [PSV-008 / 8](#psv-008) | Emissão do organograma com divisões e responsáveis | 90 |
| [PSV-009 / 9](#psv-009) | Consulta da ficha funcional | 90 |
| [PSV-010 / 10](#psv-010) | Consulta da ficha financeira anual | 90 |
| [PSV-011 / 11](#psv-011) | Solicitação de alteração cadastral com comprovante | 90 |
| [PSV-012 / 12](#psv-012) | Solicitação de atestado ou perícia médica com dados e anexo | 90 |
| [PSV-013 / 13](#psv-013) | Link da documentação necessária às requisições | 90 |
| [PSV-014 / 14](#psv-014) | Solicitação de férias por período aquisitivo e limites de saída | 90 |
| [PSV-015 / 15](#psv-015) | Solicitação de cursos e despesas adicionais | 90 |
| [PSV-016 / 16](#psv-016) | Autorização de alterações cadastrais pelo gestor | 90 |
| [PSV-017 / 17](#psv-017) | Autorização de atestados e perícias pelo gestor | 90 |
| [PSV-018 / 18](#psv-018) | Autorização dos pedidos de férias pelo gestor | 90 |
| [PSV-019 / 19](#psv-019) | Autorização dos cursos pelo gestor | 90 |
| [PSV-020 / 20](#psv-020) | Parametrização de conferência, atualização e comprovantes por campo | 90–91 |

<a id="dependencias"></a>
## 3. Dados de outros módulos e serviços

**Origens previstas, não inventário confirmado do repositório.** O agente deverá localizar o provedor real e registrar o dado consumido, a chave de relacionamento, a permissão e o resultado esperado. Mesmo banco não significa acesso irrestrito às tabelas.

| Ref. | Origem prevista | Informação/capacidade utilizada | Limite do pacote |
|---|---|---|---|
| **DEP-01** | Administração / Identidade / Autenticação | Conta, CPF de acesso, sessão, órgão, perfil, escopo e associação à pessoa. | Reutilizar identidade e incluir o card/permissões pelas convenções existentes. Não criar autenticação paralela. |
| **DEP-02** | RH / Pessoas / Cadastro Funcional | ID da pessoa e vínculo/matrícula, dados oficiais, aniversário, lotação, cargo, ficha funcional, e-mail previamente cadastrado e versão cadastral. | Consultar e encaminhar alteração autorizada pelo serviço existente. Não manter ficha oficial concorrente no Portal. |
| **DEP-03** | RH / Folha / Informes | Contracheques por competência/tipo, rubricas, proventos/descontos, ficha financeira anual, informe de rendimentos e versão do documento. | Publicar/consultar dados e emitir documentos a partir da origem. Não recalcular folha nem presumir classificação fiscal. |
| **DEP-04** | RH / Férias e Afastamentos | Período aquisitivo, disponibilidade, períodos/pedidos já registrados, regras e resultado de registro autorizado. | Consultar elegibilidade e enviar o pedido/decisão quando houver serviço. Não criar segundo saldo de férias ou motor médico/previdenciário. |
| **DEP-05** | Administração / Organograma | Órgão, divisões, hierarquia e responsáveis identificados. | Emitir a estrutura de origem. Não transformar Portal em editor geral do organograma. |
| **DEP-06** | GED / Arquivos privados / Documentos e relatórios | Arquivos de comprovação, flyer, orientações, visualização, impressão, emissão e verificação documental. | Criar os vínculos/contextos do Portal e reutilizar infraestrutura. Não expor anexo privado por URL pública. |
| **DEP-07** | E-mail / Recuperação de acesso | Remetente, link de recuperação, destinatário cadastrado e resultado do envio. | Enviar pelo mecanismo existente, testar em caixas controladas e distinguir captura de entrega real. |
| **DEP-08** | Processos / Requisições, **se já usado pelo RH** | ID/protocolo, tramitação, análise e histórico de decisão. | Reutilizar sem criar dois pedidos para o mesmo evento. Não exigir um processo administrativo geral quando o fluxo existente de solicitação já atende. |

**Direção dos dados:** Folha → Portal para consultas; Servidor → solicitação do Portal → RH/gestor para análise; decisão autorizada → serviço de origem quando necessário. A resposta e a referência da efetivação voltam ao mesmo pedido. Solicitação de curso não cria despesa financeira. Aprovação administrativa de atestado/perícia não cria diagnóstico médico.

Quando faltar um serviço de origem, implementar a parte própria do Portal, documentar o contrato necessário e registrar `DEPENDENCIA_OUTRO_MODULO`. Um substituto local de testes pode exercitar o consumidor, mas não é integração comprovada. Não marcar alteração como aplicada no cadastro oficial nem férias como registradas no RH sem retorno efetivo.

### 3.1 O que precisa ser testado externamente

| Capacidade | Meio de ensaio | Comprovação além da simulação |
|---|---|---|
| Recuperação de acesso por e-mail — PSV-002 | Captura de e-mail para conteúdo/link; depois caixa controlada real. | Mensagem recebida, link funcional, nova senha utilizável e link reutilizado recusado. Não registrar senha nos logs. |
| Informe RFB — parte de PSV-003 | Dados fictícios classificados na origem e emissão pelo modelo identificado. | Conferência do documento com o leiaute aplicável ao ano-calendário. **Modelo de documento não é integração/transmissão à RFB.** |
| Dados e autorizações RH/Folha | Base de homologação do próprio CeleriFlow, preferencialmente; contrato simulado apenas para testes isolados. | Consultar o registro real e, em alteração aprovada, confirmar o efeito na origem, sem redigitação. |
| Arquivos privados/relatórios | Armazenamento e gerador existentes com bytes de teste. | Abrir o arquivo pela sessão autorizada; falha de armazenamento não aparece como upload concluído. |
| Validação de contracheque — PSV-004 | Código ou QR do documento realmente emitido. | Consulta à versão registrada, tratamento de código inexistente e acesso protegido à conferência. Não exige cartório, banco ou certificado digital por este item. |

**Não criar um laboratório complexo nem simuladores da Receita, eSocial ou clínica médica.** Eles não são exigidos neste bloco. Se necessário para desenvolver o consumidor antes do RH, usar um adaptador de teste isolado e explícito, substituído pela fonte de homologação para os testes integrados.

<a id="operacao"></a>
## 4. Contratos operacionais, integridade e privacidade

### 4.1 Identidade e vínculo funcional

Mapear a identidade autenticada à pessoa e aos vínculos autorizados. CPF é identificador de logon, não prova de autorização por si só. O servidor não escolhe o CPF de outro usuário para consultar contracheque. Toda requisição do servidor aplica o escopo derivado da sessão; parâmetros de matrícula, documento, pedido e ano são revalidados no servidor.

Se houver mais de um vínculo real para a mesma pessoa, apresentar seletor somente dos vínculos dela, com matrícula/órgão identificados. Não criar suporte fictício a novos regimes funcionais: tratar os vínculos que já existem na fonte. Não consolidar dois vínculos apenas porque compartilham CPF se o documento da Folha for por vínculo; para o informe, seguir o agrupamento por fonte pagadora adotado no documento de origem.

Perfil de gestor, servidor e RH é capacidade operacional, não cargo presumido pelo nome. Um servidor que também possui função de gestor não recebe automaticamente acesso irrestrito a contracheques ou documentos médicos. Configurar escopo do gestor conforme a definição fornecida. Registrar Q-S03 antes de impor proibição ou autorização genérica de autoaprovação.

### 4.2 Recuperação da senha e interpretação da redação

O item 2 usa **“enviando link com nova senha”**. Manter a frase no requisito; a solução de segurança proposta é enviar um **link de recuperação**, de uso único e validade limitada, para o e-mail já cadastrado, permitindo definir a nova senha no ambiente autorizado. **Não incluir senha em texto claro no e-mail, na URL ou no banco do Portal.** A correspondência operacional dessa expressão deve ficar registrada em Q-S01, sem afirmar que houve esclarecimento formal.

Usar o mecanismo existente e a mesma política de senha do CeleriFlow. Não alterar a conta até que a recuperação seja comprovada; solicitar a recuperação não deve derrubar a conta da vítima. Na requisição inicial, adotar resposta externa neutra para CPF existente/inexistente, limitação de abuso e URL de retorno controlada. Caso não haja e-mail cadastrado, encaminhar ao procedimento de suporte já existente sem permitir informar livremente outro destinatário. A referência técnica externa é **EXT-SEC**; as decisões de interface são deste plano.

Uma alteração de e-mail ainda em análise não muda o destinatário da recuperação. A identidade e o contato de acesso somente serão atualizados pelo serviço competente após o tratamento autorizado. Não presumir login por e-mail porque o provedor atual utiliza e-mail internamente: a interface exigida continua CPF/senha, com resolução segura no servidor.

### 4.3 Consultas e documentos: fonte única

Contracheque é o demonstrativo da competência/tipo/vínculo liberado na Folha. Ficha financeira anual é consulta consolidada dos movimentos do ano; não é uma imagem do contracheque do último mês. Informe de rendimentos é outro documento, com classificação e agrupamento fiscal próprios. **Somar o líquido dos contracheques não gera um informe RFB.** O Portal deve receber documento pronto ou os dados e o modelo adequados da origem; não inventar a distribuição entre campos.

Para o contracheque, escolher ano, competência e tipo de folha quando esses discriminadores existirem. Emitir o resultado por serviço real, não PDF preparado e vinculado a qualquer pessoa. Para a ficha anual, navegar por competências/rubricas e conservar totais do ano inteiro. Para o informe, escolher ano-calendário/fonte pertinente e emitir o documento identificado. Ausência de competência/documento deve ser mostrada como ausência, e falha da fonte como erro, não valor zero.

Preservar versão, vínculo e identificação do documento emitido. Não permitir que uma alteração posterior no nome/endereço reescreva documentos históricos sem controle da origem. Não cachear a resposta pessoal para outros usuários; limpar estado de consulta ao sair/trocar vínculo. Nunca usar o cache público da Transparência para esses dados.

### 4.4 Validação do contracheque impresso

O item 4 usa **QR code ou código de validação**. Reutilizar o mecanismo existente; uma das alternativas bem implementada atende à forma indicada, sem impor as duas cumulativamente. O código identifica a emissão/versão e não deve ser um número sequencial adivinhável. O QR, quando escolhido, conduz à rota real de verificação.

A consulta deve permitir conferir a correspondência com o documento emitido. Definir quais dados serão expostos e se a conferência completa exige autenticação. Não disponibilizar salário completo mediante pesquisa pública por CPF. Para o teste, o titular autenticado pode comparar todos os dados com a versão original; eventual consulta externa pelo código revela apenas o recorte autorizado definido em Q-S04.

**Não retornar simplesmente “válido” para qualquer código existente e afirmar que isso autentica qualquer folha de papel que o contenha.** Um código legítimo copiado para um documento com valor alterado continua sendo o código do original. A conferência deve mostrar a identidade/versão e permitir comparação dos dados pertinentes no contexto autorizado. Consulta de emissão não equivale a assinatura criptográfica, nem a validação por banco ou Receita. Não exigir novo assinador ICP-Brasil para este resultado.

### 4.5 Uma solicitação, análise e decisão identificáveis

Manter ID único, tipo, autor/pessoa/vínculo, data, conteúdo enviado, anexos, situação, análise/decisão e referência da origem. Guardar os valores apresentados ao RH e a versão dos dados de origem relevante à análise. A solicitação não modifica imediatamente o cadastro oficial.

| Ação | Responsável previsto pelo TR | Efeito a demonstrar |
|---|---|---|
| Solicitar alteração, atestado/perícia, férias ou curso | Funcionário; agente político nos contextos explicitados/permitidos. | Pedido persistido e visível ao próprio solicitante e ao escopo autorizado de análise. |
| Conferir, validar ou rejeitar informações enviadas | Usuário do RH — item 5. | Registrar resultado, comprovantes conferidos e documento de análise anexado quando necessário; rejeição não altera a origem. |
| Autorizar alteração, atestado/perícia, férias ou curso | Gestor — itens 16–19. | Decisão efetiva sobre o pedido correto, com autor e data; não mera edição visual de status. |
| Efetivar alteração/registro na origem, quando necessário | Serviço do RH ou domínio competente, acionado conforme fluxo adotado. | Retorno e vínculo ao fato real; falha continua pendente e não se anuncia como aplicada. |

**Não impor duas aprovações sucessivas a todos os pedidos.** O TR descreve RH e gestor, mas não define ordem universal, número de aprovadores ou se serão pessoas distintas. Reutilizar o fluxo existente; um operador com ambas as competências pode registrar a conferência e a autorização em uma ação coerente, se a configuração institucional permitir. O item 5 continua precisando de teste de validação **e rejeição**, e os itens 16–19 de autorização nas quatro famílias.

Estados como `SOLICITADA`, `EM_ANALISE`, `REJEITADA`, `AUTORIZADA` e `AGUARDANDO_EFETIVACAO` são exemplos técnicos, não fases obrigatórias do edital. Separar a decisão administrativa do resultado de integração. `EFETIVADA_NA_ORIGEM` só é exibido quando houver confirmação. Não inventar recurso, recurso hierárquico, parecer jurídico ou protocolo numerado especial para concluir estes itens.

### 4.6 Alterações cadastrais e parametrização por campo

A configuração do RH deve distinguir **visível para conferência**, **permitido solicitar atualização** e **comprovante necessário para atualizar**. Uma combinação inválida, como atualizar um campo não permitido, deve ser recusada também no servidor. Os parâmetros referem-se aos campos reconhecidos no cadastro existente; não desenvolver um editor de esquema ou permitir indicar nome livre de tabela/coluna.

Ao solicitar, mostrar valor atual e proposto, exigindo comprovante somente para os campos configurados. O pedido conserva o conjunto de parâmetros usado e os valores comparados; o gestor deve saber exatamente o que está autorizando. Revalidar permissões e consistência na decisão. Se a fonte tiver mudado entre pedido e aprovação, sinalizar conflito e exigir nova conferência, sem sobrescrever o dado novo silenciosamente.

Alterar um campo do pedido não concede permissão para alterar salário, perfil de acesso, CPF-identidade ou outros campos técnicos. Não confiar no conjunto enviado pelo navegador: aceitar somente as chaves permitidas. Documentar o que acontece com pedidos pendentes quando o RH modifica parâmetros; nunca usar a regra antiga para burlar uma restrição de segurança atual.

### 4.7 Atestado/perícia e anexos privados

O formulário deverá distinguir **Atestado** de **Perícia Médica** e conter período, CID, médico responsável e comprovante digitalizado. Não reduzir o pedido a texto livre “licença médica” nem deixar a perícia sem opção específica.

Armazenar o comprovante como arquivo privado, com vínculo ao pedido e acesso validado. Não incluir CID, conteúdo clínico, nome do arquivo médico ou URL de download em avisos coletivos, listagens de aniversariantes, logs gerais ou consultas públicas. Limitar a visualização ao titular e às capacidades de análise autorizadas. Registrar acesso sem replicar o conteúdo clínico no log.

A decisão do gestor neste Portal é **administrativa sobre a solicitação**, não confirmação clínica automática. Não fazer diagnóstico, criar CID, produzir laudo, validar CRM externamente ou agendar atendimento médico como parte deste item. Preservar o campo CID exigido e confirmar a política institucional de preenchimento/visibilidade em Q-S06; não definir essa política médica por suposição. Os documentos de ensaio devem estar rotulados como demonstração e não ter valor médico.

Uploads precisam armazenar bytes e metadados de verdade. Validar tipo/tamanho conforme configuração existente; não usar nome de arquivo como caminho livre. Erro parcial deve ser mostrado como erro, não comprovante anexado. Abrir, recarregar e acessar novamente com a conta autorizada comprova persistência. Link de outro pedido não pode contornar o escopo.

### 4.8 Férias: pedido, elegibilidade e autorização são diferentes

Usar o **período aquisitivo** e a situação real fornecida pelo RH. Mostrar ao funcionário a referência do período e os limites aplicáveis ao início das férias. A fonte não define se os “prazos mínimo e máximo” representam antecedência, janela de início, duração ou regra específica do regime. Q-S05 deve registrar a interpretação usada; não codificar regras da CLT para todos os servidores.

O exemplo de demonstração utiliza uma janela de antecedência parametrizada e explicitamente fictícia. O sistema deverá validar a configuração efetiva ao solicitar **e novamente ao autorizar**, porque a disponibilidade pode mudar. Quando o RH mantiver saldo/reservas, consultar a fonte e impedir que dois pedidos consumam a mesma disponibilidade mediante decisões concorrentes; não manter uma conta de férias independente do RH.

Solicitação não é férias gozadas nem pagamento. Autorização precisa estar registrada e refletida no pedido; eventual agenda/reserva/registro formal do RH usa o serviço correspondente. Não converter autorização em evento de folha, férias pagas ou baixa definitiva de dias sem a operação real da origem. Não acrescentar venda de férias, fracionamento obrigatório, abono ou calendário visual de equipe como novos requisitos.

### 4.9 Cursos: solicitação com composição de gastos, sem compra automática

Conter nome, área ou classificação de curso quando útil ao requisito, local, data, carga horária, justificativa, valor do curso e gastos adicionais discriminados. A lista de adicionais deve aceitar hospedagem, diárias e outras despesas; não restringir “quaisquer despesas” a duas opções fixas. O flyer é **permitido, não universalmente obrigatório**.

Somar valores para orientar a autorização, conservando a origem de cada parcela: valor do curso + adicionais. Dados do solicitante são herdados do vínculo, sem redigitação. Autorizar conserva a composição e a versão analisadas; o servidor não altera o valor autorizado sem novo tratamento do pedido. Não criar LMS, inscrição no fornecedor, pagamento, AE/AF, viagem ou lançamento de diária por causa desse cálculo.

### 4.10 Avisos, aniversariantes, orientações e organograma

Aviso individual utiliza destinatário explícito; coletivo utiliza conjunto/recorte identificado. A entrega é a disponibilização no Portal ao público autorizado; o item 7 não pede e-mail ou confirmação de leitura. Não criar disparo em massa, SMS, WhatsApp, ranking de leitura ou termos de ciência obrigatórios.

A listagem de aniversariantes deve ser emitível, com filtro de mês/período como proposta de uso. Não divulgar data completa de nascimento/idade/CPF na lista por padrão. Definir seu público em Q-S07: não inferir que qualquer servidor ou visitante anônimo pode consultar toda a lista. Funcionários distintos com mesmo aniversário não se fundem.

O organograma emitido deverá conservar as divisões, relações e responsáveis. Árvore hierárquica em documento é solução suficiente de apresentação; não acrescentar editor gráfico de organograma. As orientações documentais ficam acessíveis por link nas solicitações e/ou na área de documentos, com textos reais de instrução fornecidos pela entidade; não criar exigências documentais com base em exemplos de teste.

<a id="ux"></a>
## 5. Interface ERP profissional e eficiência

### 5.1 Áreas internas do card

| Área interna | Conteúdo e ações principais | IDs |
|---|---|---|
| **Meu Portal / Avisos** | Contexto do vínculo e avisos do destinatário, sem gráficos decorativos. | 1, 7. |
| **Contracheques e Rendimentos** | Competência/tipo/ano; consultar e emitir contracheque e informe; acesso à conferência do documento. | 3, 4. |
| **Minhas Fichas** | Ficha Funcional e Ficha Financeira Anual em abas distintas. | 9, 10. |
| **Minhas Solicitações** | Listagem de pedidos; quatro opções explícitas: Dados cadastrais, Atestado/Perícia, Férias, Cursos. | 11–15. |
| **Análise e Autorizações** | Fila autorizada, comparativo dos dados, anexos, validar/rejeitar e autorizar conforme capacidade. | 5, 16–19. |
| **Informações do Órgão** | Emissão do organograma, acesso à documentação; aniversariantes para o público autorizado. | 6, 8, 13. |
| **Configurações** | Campos visíveis/atualizáveis/comprovantes e administração de avisos, no escopo do RH/gestor autorizado. | 7, 20. |

São áreas do mesmo módulo, não novos cards no seletor principal. Usar abas ou navegação lateral contextual compatível com o CeleriFlow, sem apresentar todos os formulários empilhados. A área pessoal não mostra fila geral de funcionários; a área do gestor não abre automaticamente informação médica ou financeira sem permissão própria.

### 5.2 Fonte, densidade e composição

Preservar a família tipográfica existente quando consistente. Na ausência de padrão, adotar fonte de sistema com preferência por Segoe UI e alternativas sans-serif, sem baixar/distribuir fontes nem instalar outro framework visual. Estes valores são **decisões de projeto herdadas dos MDs anteriores**, não dimensões exigidas pelo TR.

| Elemento | Tamanho / entrelinha de referência | Peso |
|---|---|---|
| Título de página | 20 / 26 px | 600 |
| Título de seção | 16 / 22 px | 600 |
| Texto de tabela, campo, filtro, botão e erro | 14 / 20 px | 400; cabeçalho/ênfase 600 |
| Metadado secundário | 12 / 16 px | 400 |

Usar tokens equivalentes em `rem`, sem reduzir a fonte raiz global. Linhas/controles com altura mínima de referência 36 px no desktop e 44 px no toque. No celular, campos com fonte de referência de 16 px. Espaçamentos 4/8/12/16/24 px; números monetários alinhados à direita, moeda e unidade identificadas. Manter estados também por texto, foco visível, rótulos e mensagens junto ao campo.

**Listagem de referência:** título/contexto → ação principal e busca/filtros → tabela → paginação. Iniciar com até 10 registros por página e ajustar à área disponível. Crescimento da base cria páginas, não uma rolagem interminável. Não usar banners de boas-vindas gigantes, foto do servidor ocupando a tela, dezenas de indicadores ou cards por pedido tabular.

### 5.3 Paginação real e preservação de contexto

Paginar, filtrar e ordenar no servidor, incluindo autorização e total do recorte. Usar desempate estável; mudar filtro volta à primeira página. Abrir pedido/documento e voltar deve preservar filtro/página e foco. Um pedido da terceira página precisa ser encontrável pela pesquisa sem carregamento prévio daquela página.

O relatório de aniversariantes e o organograma devem emitir o conjunto inteiro permitido, não apenas o que está visível. A ficha anual conserva todos os meses e as rubricas pertinentes, independentemente das páginas. Mostrar total anual separado de subtotal da página. Não exigir exportação inédita da ficha funcional só porque existe um exportador; a ação específica pedida para essa ficha é consulta.

Ao iniciar um pedido a partir do vínculo, herdar a identidade e os dados disponíveis. Não pedir ao servidor CPF/nome/matrícula outra vez em cada formulário. Na análise, abrir a mesma solicitação e seus anexos; não exigir que o RH crie outro cadastro de pedido. Identificar campo/aba com erro sem apagar os outros valores.

### 5.4 Exceções de leitura e mobile

Priorizar listagens sem rolagem global nos viewports CSS **1366×650, 1440×800 e 1920×900**, com zoom normal, e no equipamento efetivo da POC. Não confundir resolução do monitor com área útil do navegador. Formulários podem usar seções/abas; salvar, cancelar e enviar permanecem acessíveis.

Contracheque, informe, anexo, ficha anual extensa, organograma e zoom podem exigir uma área de leitura com rolagem vertical. Permitir essa exceção; não cortar documento, esconder linhas ou usar `overflow: hidden` para aparentar conformidade visual. Não diminuir a fonte operacional para 10–11 px. No celular, reorganizar em uma coluna ou detalhe por linha, mantendo acesso a todos os dados permitidos.

Testar Chrome em celular real, texto/zoom ampliado e navegação por teclado. **Mesmo site, sessão e serviços**: não criar APK, IPA, wrapper ou instalação obrigatória de PWA. A captura de comprovante pode usar o seletor de arquivos disponível; não é necessário implementar scanner/OCR ou aplicativo de câmera.

### 5.5 Desempenho e resultado da operação

Não buscar todos os servidores/contracheques para filtrar no navegador. Evitar uma chamada por rubrica; buscar a ficha na granularidade adequada e anexos sob demanda. Mostrar carregamento, vazio, erro e sucesso de forma diferente. Sem fonte, não exibir contracheque zerado.

Como metas técnicas iniciais herdadas do padrão anterior: resposta visual de processamento em até 200 ms e consulta paginada em até 1,5 s no percentil 95, em ambiente, amostra, rede e volume registrados. Não são requisitos do TR nem medições já realizadas. Documento demorado mantém indicação de geração; não baixar um PDF fixo apenas para aparentar rapidez.

<a id="base"></a>
## 6. Base fictícia e resultados de demonstração

**Dados de ensaio, sem validade administrativa, médica ou fiscal.** O usuário populará a base; o agente deve permitir uso das telas e pode fornecer fixtures técnicas isoladas, sem criar importador como produto. Não inserir senhas ou tokens no Markdown, nem usar contatos de terceiros. Preparar registros de RH/Folha na origem disponível; mocks de unidade ficam claramente separados.

### 6.1 F-ACESSO — pessoas, vínculos e capacidades

| Referência de teste | Registro fictício | Uso |
|---|---|---|
| **SERV-A / MAT-1001** | Ana Ribeiro — DEMO; lotação Administrativa. | Titular dos cenários principais, aniversário 18/09. |
| **SERV-B / MAT-1002** | Bruno Lima — DEMO; lotação Educação. | Isolamento de dados, aniversário 25/09. |
| **AGP-C / MAT-1003** | Clara Souza — Agente político DEMO. | Conferência cadastral e autenticação do contracheque nos contextos do TR, aniversário 25/09. |
| **SERV-D / MAT-1004** | Davi Rocha — DEMO. | Aniversário 02/10, fora do recorte de setembro. |
| **RH-ANALISE** | Usuário de RH — DEMO. | Conferir, validar/rejeitar e configurar campos, conforme permissões de ensaio. |
| **GESTOR-A** | Gestor autorizado — DEMO. | Autorizar as quatro famílias no escopo atribuído. |
| **USR-SEM-PORTAL** | Conta sem capacidade do Portal. | Teste de card oculto e rota/API recusadas. |
| **CX-A / CX-B** | Caixas de e-mail controladas pelo responsável da POC. | Recebimento e recuperação; substituir por endereços reais de teste autorizados. |

As referências acima não são CPFs válidos nem endereços de e-mail. Criar identidades sintéticas pelo mecanismo de homologação e validadores existentes, sem desabilitar a segurança de produção. Para testar mais de um vínculo do mesmo CPF, usar conjunto separado e não alterar os totais abaixo. Não atribuir a RH/gestor todas as permissões administrativas para facilitar a apresentação.

### 6.2 F-DOC — contracheques e ficha financeira anual

**Fonte dos valores:** registros preparados em RH/Folha, não tabela hardcoded no Portal. Ano de demonstração financeira: **2025**, integralmente histórico em relação à data de ensaio. Rubricas e descontos são fictícios; não representam cálculo legal.

| Folha de SERV-A / MAT-1001 | Proventos | Descontos | Líquido |
|---|---:|---:|---:|
| Cada uma das 11 competências de janeiro a novembro/2025 | R$ 3.500,00 | R$ 600,00 | R$ 2.900,00 |
| Dezembro/2025 | R$ 3.700,00 | R$ 620,00 | R$ 3.080,00 |
| **Total das 12 competências regulares** | **R$ 42.200,00** | **R$ 7.220,00** | **R$ 34.980,00** |
| 13º/2025, registro separado de teste | R$ 3.000,00 | R$ 450,00 | R$ 2.550,00 |
| **Total financeiro incluindo o 13º separado** | **R$ 45.200,00** | **R$ 7.670,00** | **R$ 37.530,00** |

Detalhe de janeiro/2025: vencimento DEMO R$ 3.000 + gratificação DEMO R$ 500; descontos demonstrativos de R$ 300 + R$ 200 + R$ 100 = R$ 600. Dezembro tem gratificação R$ 700 e descontos R$ 300 + R$ 220 + R$ 100 = R$ 620. O 13º separado tem descontos R$ 300 + R$ 150 = R$ 450. As rubricas apenas permitem conferir a composição; não são tabelas de contribuição ou IR.

Preparar o contracheque de SERV-B em janeiro/2025 com bruto R$ 2.600, descontos R$ 400 e líquido R$ 2.200, em cenário próprio. SERV-A não consegue consultá-lo por alteração de ID. Preparar um contracheque de AGP-C em conjunto separado para o item 4, sem somá-lo à ficha de SERV-A.

**Ficha anual:** verificar as 12 competências e o tipo 13º separado. Caso a origem represente folha complementar/13º em seções próprias, preservar a representação e o resultado consolidado, sem duplicar ou perder a competência de dezembro. Meses sem movimento em outro ano exibem ausência coerente, não cópia do ano anterior.

**Informe RFB:** preparar na origem um informe demonstrativo para o ano-calendário 2025, com os grupos fiscais devidamente classificados e o modelo aplicável identificado. Comparar cada campo da emissão do Portal com a origem; **não adotar R$ 45.200 ou R$ 37.530 como um único campo tributável automaticamente**. No relatório de teste registrar modelo, versão, campos conferidos e divergências. A fixture financeira não substitui a validação do informe exigido.

### 6.3 F-VALIDACAO — contracheque autêntico e cópia alterada

Emitir o contracheque de janeiro/2025 de SERV-A pela aplicação e obter do documento o código/QR de validação. Abrir o endereço de conferência e comparar competência, titular no recorte permitido, versão e dados do documento original. Testar código inexistente, acesso de outro titular e link após encerrar a sessão, conforme política definida.

Em uma cópia local destinada ao ensaio, alterar visualmente um valor, preservando o código do original. A consulta continua identificando o original de R$ 2.900 líquidos no contexto de conferência completa autorizada; não deve validar o valor adulterado. Não alterar os bytes registrados na aplicação para criar esse teste. Não alegar detecção criptográfica do papel pelo simples QR.

### 6.4 F-CADASTRO — configuração, solicitação, análise e efetivação

| Campo de ensaio | Conferir | Solicitar atualização | Comprovante ao atualizar |
|---|---|---|---|
| Endereço residencial | Sim | Sim | Sim |
| Telefone | Sim | Sim | Não |
| Cargo | Sim | Não | Não aplicável |
| Campo cadastral restrito de teste | Não | Não | Não aplicável |

Esses parâmetros são demonstração, não política da entidade. O identificador técnico/CPF do login não integra a lista livre de campos editáveis deste ensaio.

Pedido **CAD-01**: SERV-A solicita troca do endereço de “Rua Alfa — DEMO, 10” para “Rua Beta — DEMO, 20”, com comprovante DEMO. Antes do envio completo, testar ausência de comprovante: a exigência deve aparecer. Antes da decisão, a ficha oficial conserva Rua Alfa. RH confere valor atual/proposto e documento; gestor autoriza conforme configuração; depois de confirmado o serviço de origem, ficha oficial e Portal mostram Rua Beta. Repetir a autorização não aplica duas alterações.

Pedido **CAD-02**, cenário isolado: alteração de telefone sem comprovante deve poder ser enviada, pois não o exige. Rejeitá-la no RH e manter o telefone original. A tentativa de enviar `cargo`, `permissao` ou outro campo não autorizado por chamada direta deve ser recusada, sem efeito parcial.

Pedido **CAD-03**, isolado: após enviar a proposta, alterar o campo na origem por rotina autorizada do RH. A aprovação com versão antiga deve sinalizar conflito e não substituir silenciosamente o novo valor. Se a atualização da origem falhar, a decisão fica identificada e a efetivação permanece pendente.

### 6.5 F-MED — atestado e perícia

| Solicitação | Tipo | Período demonstrativo | Comprovação |
|---|---|---|---|
| **MED-01** | Atestado | 21/09/2026 a 23/09/2026 | Documento DEMO digitalizado, campo CID e médico responsável preenchidos para o ensaio. |
| **MED-02** | Perícia Médica | 25/09/2026 a 25/09/2026 | Outro documento DEMO, com seus próprios dados e médico responsável. |

A diferença inclusiva de datas é 3 dias para MED-01 e 1 dia para MED-02; é conferência de calendário da fixture, não regra de licença ou pagamento. Usar “Médico DEMO” identificado como fictício, sem inventar registro profissional válido. Se houver tabela/validador de CID, usar um código disponibilizado para teste pela entidade; `CID-DEMO` é somente rótulo técnico de fixture, não código clínico de produção.

Enviar cada solicitação, abrir comprovante na análise autorizada e autorizar pelo gestor competente. Testar também pedido separado rejeitado, início posterior ao fim, anexo ausente/falho e acesso indevido pelo outro servidor/gestor fora do escopo. Não gerar evento eSocial, laudo, pagamento ou afastamento efetivado apenas por mudar a situação no Portal.

### 6.6 F-FERIAS — prazos e período aquisitivo

**Configuração exclusivamente demonstrativa:** data de solicitação **18/09/2026**; janela mínima de **10 dias** e máxima de **60 dias** para o início, usando dias corridos. Essa é uma interpretação de ensaio a registrar em Q-S05, não prazo legal. Período aquisitivo fornecido pelo RH para o cenário: **01/09/2025 a 31/08/2026**; disponibilidade fictícia **30 dias**, sem outros pedidos ativos.

| Cenário independente | Data/período pretendido | Resultado na regra demonstrativa |
|---|---|---|
| **FER-01** | 05/10/2026 a 19/10/2026 | Início em 17 dias; duração inclusiva de 15 dias. Pedido elegível pela fixture, sujeito à autorização. |
| F-ANTES | Início 27/09/2026 | Antecedência de 9 dias: fora do mínimo. |
| F-MIN | Início 28/09/2026 | Limite de 10 dias: permitido se os demais dados forem válidos. |
| F-MAX | Início 17/11/2026 | Limite de 60 dias: permitido se os demais dados forem válidos. |
| F-DEPOIS | Início 18/11/2026 | Antecedência de 61 dias: fora do máximo. |

Os testes de borda são isolados e não geram cinco reservas no mesmo período. Em FER-01, confirmar que o pedido pendente não significa férias gozadas. Autorizar e, quando o serviço de RH usar reserva, conferir **15 dias comprometidos e 15 ainda disponíveis**, sem lançar pagamento. Tentar outra autorização que exceda a disponibilidade real após essa operação deve ser recusada/reanalisada pela regra da origem. Reenvio da mesma decisão não reserva mais 15 dias.

Teste adicional: RH modifica a situação do período entre envio e decisão; o gestor recebe a informação atual antes de autorizar. Não aprovar usando um saldo copiado há horas no navegador. Se a origem trabalhar com outra regra, substituir a fixture documentadamente, sem presumir que as datas acima são institucionais.

### 6.7 F-CURSOS — valor completo e flyer opcional

**CUR-01:** “Capacitação em gestão de compras — DEMO”, área Administração, local “Centro de Formação — DEMO”, data 05/11/2026, carga horária 8 horas, justificativa demonstrativa. Valor do curso **R$ 1.200**; hospedagem **R$ 300**; diárias **R$ 150**; transporte, como outra despesa, **R$ 120**. **Total solicitado: R$ 1.770.** Anexar flyer DEMO, enviar, conferir como gestor e autorizar exatamente essa composição.

**CUR-02**, independente: “Planilhas administrativas — DEMO”, área Tecnologia, local online, data 03/12/2026, 4 horas, justificativa, curso gratuito com valor zero explicitamente informado, sem adicionais e sem flyer. Deve ser possível solicitar sem o anexo opcional; valor não informado não deve ser confundido silenciosamente com gratuito.

Em CUR-01, tentar alterar o valor após autorização sem novo tratamento deve ser impedido ou submetido à rotina já existente de revisão do pedido; não alterar o valor previamente autorizado. A aprovação não cria conta a pagar, diária, contrato de fornecedor nem matrícula em plataforma de cursos.

### 6.8 F-COMUNICACAO — avisos, aniversariantes, organograma e orientações

Avisos: **AV-01** individual para SERV-A; **AV-02** coletivo para SERV-A/SERV-B/AGP-C; **AV-03** coletivo somente para SERV-B/SERV-D. Esperado no conjunto: SERV-A vê 2; SERV-B vê 2; AGP-C vê 1; SERV-D vê 1. Abrir AV-01 diretamente como SERV-B deve ser recusado. O cadastro de aviso não dispara e-mail por suposição.

Aniversariantes de setembro: **SERV-A, SERV-B e AGP-C — 3 pessoas**, preservando os dois aniversários de 25/09. Outubro: apenas SERV-D nesse conjunto. Mostrar dia/mês e identificação funcional suficiente; o perfil autorizado emite a listagem sem incluir CPF, diagnóstico ou ano de nascimento desnecessários.

Organograma de ensaio na origem: **Órgão DEMO**, com divisões Administração e Educação; Administração contém RH, Educação contém Unidade de Ensino DEMO. **Cinco nós no total**, cada um com responsável DEMO associado. Emitir todos os níveis, sem achatar a estrutura. A lista/árvore do Portal deve refletir alteração de responsável feita na origem, sem outro cadastro manual.

Documentação: links de orientação para alteração cadastral, atestado/perícia, férias e cursos, fornecidos para o ensaio. Os links abrem conteúdo real e correto, sem “em breve”, sem apontar para comprovante de outro funcionário e sem forçar download público de arquivo privado.

### 6.9 F-PAG — crescimento e cenários de falha

Preparar conjunto isolado de **27 solicitações** no escopo do gestor: páginas de referência **10/10/7**. Buscar a última pelo identificador/texto permitido; abrir e voltar preservando a página. Preparar 27 aniversariantes num mês separado/conjunto isolado e verificar emissão com 27, não dez. Não misturar esses dados com as contagens de F-COMUNICACAO.

Simular fonte de RH indisponível, upload falho, resposta ambígua de autorização, documento ausente, sessão expirada e dois gestores decidindo o mesmo pedido. Conferir estados reais e uma só efetivação. O navegador não recebe sucesso antecipado nem consulta privada de sessão anterior.

---
<a id="itens"></a>
## 7. Desenvolvimento item a item

Os textos **TR** a seguir são integrais. Implementação, demonstração, aceite e limites são instruções para construir e testar, não afirmações de homologação. Cada ID deve ter evidência própria, mesmo quando compartilhar serviço com outro.


<a id="psv-001"></a>
### PSV-001 — Acesso por CPF e senha no card Portal do Servidor

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 1, p. 89:**

> Permitir o acesso ao Portal do Servidor Público com logon/senha, utilizando como padrão de logon CPF.

**Implementação:** Criar o card próprio e a entrada do Portal conforme seção 1.1. A tela de acesso utiliza CPF como logon padrão, normalizando sua apresentação e resolvendo a identidade pelo serviço atual. Uma sessão já válida pode ser reaproveitada; isso não elimina o teste de entrada por CPF/senha em sessão encerrada.

Associar a conta à pessoa/vínculo autorizado. Ao abrir o card como funcionário, apresentar apenas as funções pessoais e institucionais permitidas; como RH/gestor, disponibilizar suas funções administrativas específicas. Não dar acesso global ao RH pelo simples fato de o usuário ser servidor. Aplicar autorização no backend, não somente no menu.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — identidade, sessão, órgão e permissões; DEP-02 — CPF/pessoa e vínculo funcional. Não criar conta ou vínculo presumido com base somente no CPF digitado.

**Demonstração:**

1. Entrar com CPF/senha de SERV-A, abrir o card e conferir o vínculo MAT-1001 e suas consultas.
2. Sair e entrar como SERV-B: dados, avisos e pedidos do primeiro não permanecem no estado da tela.
3. Acessar o card numa sessão válida sem solicitar segunda senha desnecessária; em sessão expirada, autenticar novamente.
4. Como USR-SEM-PORTAL, tentar a rota e a API diretamente: acesso recusado; a ausência do card não é a única proteção.

**Aceite técnico:** Card e módulo existem, CPF/senha funcionam e as permissões restringem os dados efetivos. Um usuário pessoal consegue utilizar o Portal sem se tornar administrador. Usuários distintos não compartilham documentos por cache ou por alteração de parâmetros.

**Atenção / limite de escopo:** Não exigir certificado digital, biometria, novo domínio, app ou novo provedor de identidade. Q-S03 define vínculo, público autorizado e escopo de gestor/RH. CPF é logon, não autorização para consultar qualquer CPF.


<a id="psv-002"></a>
### PSV-002 — Recuperação de acesso pelo e-mail previamente cadastrado

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 2, p. 89:**

> O portal do Servidor Público deverá permitir a solicitação de nova senha em caso de esquecimento, enviando link com nova senha para o e-mail previamente cadastrado.

**Implementação:** Disponibilizar “Esqueci minha senha” usando o mecanismo de recuperação existente e o e-mail já vinculado à pessoa/conta. Adotar o link de recuperação descrito na seção 4.2: definição de nova senha em ambiente protegido, sem enviar a própria senha por mensagem ou parâmetro de URL.

Exibir resposta neutra na solicitação inicial; o resultado interno do envio pode ser verificado pela equipe autorizada. Proteger contra reenvio abusivo e tokens reutilizados/expirados. Não permitir que o solicitante substitua livremente o e-mail destinatário na tela de recuperação.

**Dados de outro módulo / serviço compartilhado:** DEP-01 — recuperação no provedor de identidade; DEP-02 — contato de acesso previamente cadastrado; DEP-07 — envio de e-mail real.

**Demonstração:**

1. Solicitar recuperação de SERV-A e verificar recebimento em CX-A, sem envio a um endereço informado na hora.
2. Abrir o link, definir nova senha e realizar nova entrada com CPF/senha. A senha anterior deixa de permitir nova autenticação conforme o mecanismo do provedor.
3. Tentar reutilizar o mesmo link e usar um expirado: recusar sem modificar a conta.
4. Testar CPF inexistente, ausência de e-mail e falha de envio em conjunto controlado; não apresentar envio confirmado ficticiamente nem revelar cadastro ao público.

**Aceite técnico:** A mensagem chega à caixa autorizada e permite recuperar o acesso da conta correta. O token não é senha permanente, não consta nos logs e não pode ser reutilizado. A recuperação não altera dados de outra conta.

**Atenção / limite de escopo:** Q-S01 registra a expressão “link com nova senha” do TR e a solução segura proposta, sem corrigir a citação. EXT-SEC é referência técnica complementar. Uma captura local de e-mail não comprova recebimento externo; não criar cadastro público ou fluxo novo de troca de e-mail.


<a id="psv-003"></a>
### PSV-003 — Consulta e emissão de contracheque e informe de rendimentos RFB

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 3, p. 89:**

> O portal do Servidor Público deverá permitir consulta e emissão do Contracheque, Consulta e emissão do Informe de Rendimentos no layout da Receita Federal do Brasil RFB, mediante identificação do logon e senha, por servidor.

**Implementação:** Implementar as quatro ações: consultar contracheque; emitir contracheque; consultar informe; emitir informe. Usar pessoa/vínculo, competência/tipo de folha e ano-calendário/fonte pagadora conforme a origem. O usuário autenticado não seleciona outro funcionário fora de seu escopo.

Reutilizar documento pronto da Folha ou o gerador com os dados oficiais daquele documento. Para o informe, identificar modelo/versão aplicáveis e mapear todos os campos necessários; se faltarem dados classificados ou modelo, manter essa parte pendente sem gerar um PDF genérico rotulado “RFB”. Mostrar competência não disponível e falha de fonte de maneiras distintas. Consulta da ficha anual não substitui o informe.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — vínculo/identificação; DEP-03 — folhas, rubricas, dados classificados e informe; DEP-06 — emissão e arquivo. EXT-RFB é referência de modelo, não API a integrar.

**Demonstração:**

1. Consultar janeiro e dezembro/2025 de SERV-A em F-DOC; conferir líquidos de R$ 2.900 e R$ 3.080, com rubricas corretas.
2. Emitir os dois contracheques e reabrir os arquivos gerados; conferir os valores e a competência, não apenas o nome do arquivo.
3. Consultar e emitir o informe de 2025 a partir da origem; registrar modelo utilizado e comparação campo a campo.
4. Testar outro ano sem informe, fonte indisponível, outro tipo de folha e documento de SERV-B por chamada direta.

**Aceite técnico:** As quatro ações funcionam e os arquivos correspondem ao titular/período/tipo. O informe possui os dados e o leiaute identificados como aplicáveis, com evidência específica; demonstrar somente contracheque não encerra PSV-003. Falta de dados não é preenchida com zeros inventados.

**Atenção / limite de escopo:** Q-S02 trata modelo e classificação do informe. O item não pede transmissão de DIRF, eSocial, REINF ou consulta individual à RFB. Não calcular impostos dentro do Portal; os totais financeiros de F-DOC são conferência, não substituto da classificação fiscal.


<a id="psv-004"></a>
### PSV-004 — Validação web do contracheque impresso

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 4, p. 89–90:**

> O portal do Servidor Público deverá permitir a validação do contracheque impresso via web pelo servidor/agente político, utilizando a forma de autenticação QR code ou código de validação, para comprovação de autenticidade.

**Implementação:** Vincular a emissão do contracheque a um código/QR que resolva sua versão verdadeira no serviço de validação. Aproveitar o serviço atual e a alternativa de identificação que ele já suporte, respeitando o “ou” da fonte. Associar a consulta à competência, emissão e titular no recorte permitido.

A página de verificação deve diferenciar documento encontrado, código inválido e versão substituída/indisponível quando a origem distinguir essas situações. Disponibilizar comparação com os dados originais no contexto autorizado, sem expor o histórico salarial por pesquisa aberta. Aplicar a mesma função a servidor e agente político abrangidos pelo cadastro.

**Dados de outro módulo / serviço compartilhado:** DEP-03 — emissão/versão original do contracheque; DEP-06 — validação e acesso documental; DEP-01 — autorização da consulta completa.

**Demonstração:**

1. Emitir o contracheque de SERV-A e, a partir da cópia impressa ou PDF emitido, usar o código/QR em F-VALIDACAO.
2. Conferir o documento correspondente; repetir com contracheque de AGP-C.
3. Testar código inexistente e tentativa de enumerar os documentos de outro titular.
4. Comparar a cópia adulterada de ensaio à versão original, sem apresentar o valor alterado como autenticado apenas por conter QR legítimo.

**Aceite técnico:** O identificador do contracheque emitido conduz à sua verificação real, não à página inicial ou a um retorno fixo. O mecanismo permite comprovar a emissão e conferir a correspondência dos dados autorizados. Código inválido não é aceito.

**Atenção / limite de escopo:** Não exigir QR e código simultaneamente, nem assinatura ICP-Brasil. Q-S04 define o público e os dados da conferência. Uma consulta de código não deve ser anunciada como validação criptográfica de qualquer cópia alterada.


<a id="psv-005"></a>
### PSV-005 — Conferência, validação ou rejeição pelo RH

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 5, p. 90:**

> O portal do Servidor Público deverá permitir ao usuário do RH conferir as informações enviadas através do Portal do Servidor, e validar ou rejeitar as mesmas com documentos anexados quando necessário.

**Implementação:** Disponibilizar no mesmo card a fila de informações/pedidos enviados pelo Portal, filtrada pelo escopo do usuário do RH. Abrir o conteúdo enviado, valores atuais/propostos quando pertinentes e comprovantes. Permitir registrar validação ou rejeição, conservando solicitante, análise, documentos e decisão. Quando necessário, permitir ao RH anexar documento à própria conferência, distinguindo-o do comprovante enviado pelo servidor e sem sobrescrever os arquivos originais.

Rejeição deve informar ao solicitante a situação e o motivo de tratamento como registro operacional, sem apagar o pedido nem modificar o cadastro oficial. Não confundir validação documental com todas as autorizações dos itens 16–19. Quando um ato único pelo usuário autorizado cobrir as duas capacidades, registrar o significado desse ato conforme o fluxo definido, sem duplicar pedidos.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — informações oficiais para comparação; DEP-06 — comprovantes privados; DEP-08, se adotado — fila/histórico de requisições; DEP-01 — capacidade de análise.

**Demonstração:**

1. SERV-A envia CAD-01 com comprovante. RH-ANALISE encontra o pedido na fila e abre os dados e o arquivo real.
2. Anexar um documento DEMO de conferência quando necessário, validar a informação e conferir o estado resultante no pedido do servidor. O comprovante original continua disponível e distinto do anexo de análise.
3. Em CAD-02, rejeitar uma informação e verificar que o valor oficial permanece inalterado e o motivo está disponível ao solicitante.
4. Testar analista sem escopo, arquivo indisponível e decisão concorrente; não aplicar duas decisões contraditórias.

**Aceite técnico:** O RH consegue conferir documentos e registrar ambos os resultados, com persistência e retorno ao pedido original. O Portal não fica restrito a uma caixa de coleta sem tratamento. Usuário de consulta não executa validação/rejeição por chamada direta.

**Atenção / limite de escopo:** Q-S03 define competências e encadeamento. Não acrescentar aprovadores, recurso administrativo ou novo BPM obrigatório. Documentos médicos ficam sujeitos à autorização específica; permissão genérica de analisar curso não dá acesso ao conteúdo clínico.


<a id="psv-006"></a>
### PSV-006 — Emissão da listagem de aniversariantes

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 6, p. 90:**

> Permitir emissão de listagem dos aniversariantes

**Implementação:** Criar consulta emitível de aniversariantes a partir do cadastro funcional, com filtro de mês/período e escopo como decisões de apresentação. Listar identidade funcional suficiente e dia/mês do aniversário. O resultado deve usar dados de origem, não uma agenda preenchida manualmente no Portal.

Emitir documento da listagem pelo gerador existente com todos os registros do filtro. Definir quem pode consultar/emitir pela política institucional, sem transformar uma listagem interna em divulgação pública de dados pessoais.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — data de nascimento e identificação funcional; DEP-01 — escopo; DEP-06 — emissão da listagem.

**Demonstração:**

1. Como perfil autorizado, filtrar setembro em F-COMUNICACAO: SERV-A, SERV-B e AGP-C, total 3.
2. Emitir e conferir que os dois registros de 25/09 aparecem separadamente.
3. Filtrar outubro: SERV-D nesse conjunto; testar mês sem aniversariantes.
4. No conjunto isolado de 27 aniversariantes, emitir todos, mesmo com dez linhas na tela.

**Aceite técnico:** Consulta e emissão conciliam com o cadastro e respeitam o filtro. Não há omissão de registros por paginação ou união indevida de homônimos/aniversários iguais. O documento não é um screenshot da primeira página.

**Atenção / limite de escopo:** O TR não define público, colunas ou alerta. Q-S07 confirma divulgação. Não criar felicitação automática, envio de e-mail, cálculo obrigatório de idade ou publicação na Transparência.


<a id="psv-007"></a>
### PSV-007 — Avisos individuais e coletivos aos funcionários

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 7, p. 90:**

> Permitir o cadastro de avisos individuais ou coletivos para os funcionários

**Implementação:** Disponibilizar cadastro de aviso com conteúdo, identificação e destinatário individual ou coletivo. Usar o recorte/grupo já existente ou seleção explícita de destinatários para o coletivo, mostrando seu alcance antes de salvar. Os mesmos registros alimentam a área pessoal “Avisos”.

Validar destinatários e permissões no servidor. Aviso individual não deve ser retornado na consulta coletiva nem acessado por outro funcionário pelo ID. A interpretação do público coletivo e de novas lotações deve ser explícita: registrar a regra de destinatários utilizada, sem alterar silenciosamente o alcance após uma mudança de setor.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — destinatários/vínculos/setores; DEP-01 — administração e acesso; dados do aviso pertencem ao Portal.

**Demonstração:**

1. Cadastrar AV-01 individual, AV-02 e AV-03 coletivos de F-COMUNICACAO.
2. Entrar como cada titular: contagens esperadas 2/2/1/1 para A/B/C/D, conferindo os textos corretos.
3. Tentar abrir AV-01 diretamente como SERV-B: recusar.
4. Recarregar as sessões e conferir que o aviso foi realmente salvo; testar falha na gravação.

**Aceite técnico:** Avisos individuais e coletivos são cadastrados e disponibilizados aos destinatários corretos. Não são mensagens fixas no frontend e não exigem redigitação por funcionário.

**Atenção / limite de escopo:** Não acrescentar newsletter, push, SMS, WhatsApp, confirmação obrigatória de leitura ou envio automático de e-mail. Q-S07 trata os destinatários coletivos; cadastro de aviso não é um sistema de comunicação externa.


<a id="psv-008"></a>
### PSV-008 — Emissão do organograma com divisões e responsáveis

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 8, p. 90:**

> Permitir a emissão do Organograma do Órgão com suas divisões e responsáveis

**Implementação:** Consultar o organograma do órgão e disponibilizar emissão com suas divisões, hierarquia e responsáveis. Usar documento hierárquico legível ou representação equivalente do gerador existente, sem limitar a uma lista de nomes de secretarias. Identificar o órgão e a posição/versão consultada quando disponível.

Responsável não informado na origem deve aparecer como não informado, não ser preenchido pelo usuário autenticado por padrão. Reutilizar a referência do cadastro, sem criar outro organograma no Portal.

**Dados de outro módulo / serviço compartilhado:** DEP-05 — órgãos, divisões, relações e responsáveis; DEP-02 quando necessário — identificação do responsável; DEP-06 — emissão.

**Demonstração:**

1. Preparar os cinco nós de F-COMUNICACAO na origem; abrir e emitir pelo Portal.
2. Conferir Órgão DEMO, Administração, Educação, RH e Unidade de Ensino DEMO com níveis e responsáveis.
3. Alterar um responsável no serviço de origem e emitir novamente: refletir a mudança sem editar cópia no Portal.
4. Testar origem indisponível, divisão sem responsável e acesso sem permissão.

**Aceite técnico:** O organograma é emitido com divisões e responsáveis reais do cadastro de teste. Hierarquia e total não se perdem pela visualização/paginação. Não há documento pré-pronto independente da origem.

**Atenção / limite de escopo:** Não criar editor gráfico, novo cadastro geral de órgão ou obrigação de mapa em tempo real. A emissão hierárquica atende à proposta de apresentação; confirmar conteúdo/formato institucional em Q-S07.


<a id="psv-009"></a>
### PSV-009 — Consulta da ficha funcional

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 9, p. 90:**

> Permitir a consulta da Ficha Funcional

**Implementação:** Disponibilizar a Ficha Funcional do titular, usando os dados e históricos funcionais que a fonte efetivamente possuir e autorizar. Organizar identificação/vínculo, cargo/lotação e registros funcionais em seções legíveis, sem inventar campos que o TR não detalha.

A ficha é consulta, não uma tela de edição direta da ficha oficial. Quando houver ação de atualização permitida, encaminhar à Solicitação de Alteração com as regras de PSV-011/020. Mostrar a origem e não esconder falhas como se fossem cadastro vazio.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — ficha funcional e vínculos; DEP-01 — titularidade e permissões. Não copiar o prontuário funcional para um cadastro livre do Portal.

**Demonstração:**

1. Entrar como SERV-A e consultar sua ficha, comparando matrícula e informações com RH.
2. Entrar como SERV-B e conferir que a ficha é outra; tentar acessar MAT-1001 diretamente.
3. Quando existir outro vínculo do mesmo titular, testá-lo em conjunto separado, sem misturar vínculos de pessoas distintas.
4. Simular indisponibilidade da fonte e testar a navegação de volta sem perder o contexto.

**Aceite técnico:** A ficha é consultável, corresponde ao vínculo selecionado autorizado e preserva a diferenciação entre consulta e solicitação de alteração. Não exibe dados de outro titular por parâmetro de URL.

**Atenção / limite de escopo:** O item não fornece lista fechada de campos nem exige emissão específica da ficha. Preservar impressão existente, sem criar relatórios novos por suposição. Q-S02 trata estrutura da fonte e Q-S03 o alcance de acesso.


<a id="psv-010"></a>
### PSV-010 — Consulta da ficha financeira anual

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 10, p. 90:**

> Permitir a consulta da Ficha Financeira Anual

**Implementação:** Disponibilizar seleção de ano e vínculo/fonte pertinente, apresentando a Ficha Financeira Anual a partir dos movimentos da Folha. Identificar competências, rubricas, proventos/descontos e totais conforme a representação da origem, com acesso completo ao ano mesmo quando paginado.

Separar tipos de folha complementares e 13º quando a origem assim os classificar. Não multiplicar o último contracheque por doze nem confundir ficha anual com Informe de Rendimentos. Valores devem ser recebidos/agregados de dados da origem, sem recalcular remuneração no Portal.

**Dados de outro módulo / serviço compartilhado:** DEP-03 — movimentos financeiros anuais e tipos de folha; DEP-02 — identificação do vínculo; DEP-01 — autorização.

**Demonstração:**

1. Consultar 2025 de SERV-A em F-DOC, verificando as 12 competências regulares e o 13º separado.
2. Conferir total regular: R$ 42.200 proventos, R$ 7.220 descontos e R$ 34.980 líquido; com 13º: R$ 45.200, R$ 7.670 e R$ 37.530.
3. Percorrer páginas/seções e conferir que o total anual não muda para subtotal da página.
4. Trocar ano/vínculo e tentar acesso de SERV-B; testar ano sem movimento e erro da fonte.

**Aceite técnico:** A consulta cobre o ano inteiro da origem e todos os seus tipos pertinentes, sem duplicar dezembro/13º. A soma apresentada é reproduzível nos registros e não muda conforme o número de linhas visíveis.

**Atenção / limite de escopo:** O TR pede consulta. Exportação adicional pode ser reaproveitada se já existir, mas não é uma nova exigência específica. Os totais da fixture não definem campos fiscais do informe RFB.


<a id="psv-011"></a>
### PSV-011 — Solicitação de alteração cadastral com comprovante

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 11, p. 90:**

> Permitir a Solicitação de Alteração em Dados Cadastrais permitindo anexar o documento de comprovação

**Implementação:** Implementar formulário de solicitação alimentado pelos dados atuais e pela configuração de campos de PSV-020. Permitir informar somente mudanças permitidas e anexar comprovantes, identificando valor atual/proposto e o campo/conjunto comprovado. Enviar para tratamento em PSV-005/016.

Guardar a proposta sem editar imediatamente o cadastro oficial. Validar os campos e a comprovação no servidor. O pedido deve aparecer em “Minhas Solicitações” e na fila autorizada do RH/gestor com o mesmo conteúdo e arquivos.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — valores oficiais/versão e serviço de atualização futura; DEP-06 — comprovantes; DEP-08 se usado — requisição/histórico.

**Demonstração:**

1. Executar CAD-01: tentar endereço sem documento e obter a exigência; anexar o comprovante e enviar.
2. Conferir que a ficha oficial ainda possui Rua Alfa antes do tratamento e o pedido contém a proposta Rua Beta.
3. Executar CAD-02 de telefone sem anexo obrigatório e conferir que a configuração diferente foi respeitada.
4. Tentar enviar campo de cargo ou permissão por API e realizar upload falho: recusar sem sucesso parcial.

**Aceite técnico:** Pedido, anexos e valores são persistidos; nenhuma atualização oficial ocorre somente por enviar. O servidor pode acompanhar a situação e o RH recebe exatamente o conteúdo encaminhado. Campos vedados não são gravados.

**Atenção / limite de escopo:** Não exigir comprovante em todos os campos, não atualizar a origem antes da autorização pertinente e não gerar outro cadastro de pessoas. Q-S03 define decisão e Q-S08 define campos permitidos/efeito da parametrização.


<a id="psv-012"></a>
### PSV-012 — Solicitação de atestado ou perícia médica com dados e anexo

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 12, p. 90:**

> Permitir a Solicitação de Atestado ou Perícia Médica Informando o período, CID, Médico Responsável e anexando o Comprovante do Atestado ou da Perícia digitalizado a solicitação

**Implementação:** Disponibilizar os dois tipos de solicitação em formulário com período inicial/final, CID, médico responsável e comprovante digitalizado. Esses dados ficam estruturados e vinculados ao pedido, não apenas numa observação ou no nome de um arquivo. Permitir ao titular conferir antes do envio.

Validar coerência de período e integridade do anexo; aplicar a política institucional aos dados clínicos sem remover campos exigidos. A fila de RH/gestor deve permitir análise autorizada e tratamento em PSV-017. Não publicar conteúdo do pedido nem disponibilizar documentos de um funcionário aos outros.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — titular/vínculo; DEP-06 — arquivo privado; DEP-04 se houver resultado registrado no RH — tipo/referência do ato; DEP-08 se adotado — fluxo.

**Demonstração:**

1. Enviar MED-01 como Atestado e MED-02 como Perícia, com os cinco componentes: tipo, período, CID, médico e comprovante.
2. Reabrir cada pedido e o documento anexado, conferindo 21–23/09 e 25/09, respectivamente.
3. Testar datas invertidas, ausência/falha do anexo e tentativa de consultar o comprovante de SERV-A como SERV-B.
4. Prosseguir ao tratamento do gestor na mesma solicitação, sem criar registro de atendimento médico.

**Aceite técnico:** Os dois tipos funcionam com os dados e bytes correspondentes recuperáveis. As informações não se perdem entre envio, análise e autorização e não são expostas em consultas indevidas.

**Atenção / limite de escopo:** Q-S06 — política de CID e competências de análise. Comprovante DEMO não tem valor clínico; não emitir atestado/laudo, agendar perícia, diagnosticar ou validar conselho profissional como função nova. Upload de digitalizado não exige scanner ou OCR no Portal.


<a id="psv-013"></a>
### PSV-013 — Link da documentação necessária às requisições

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 13, p. 90:**

> Conter link com a documentação necessária para requisições em geral

**Implementação:** Disponibilizar um acesso claro à documentação necessária para requisições em geral. Reutilizar página/arquivo de orientação já existente ou conteúdo de orientação mantido no contexto do Portal; vincular os tipos de solicitação a instruções pertinentes quando disponíveis.

O link deve abrir o conteúdo correto, com identificação da orientação e documentos necessários definidos pela entidade. Não encaminhar ao diretório privado dos comprovantes pessoais nem exigir acesso administrativo ao CMS para ler a orientação destinada ao servidor.

**Dados de outro módulo / serviço compartilhado:** DEP-06 — documento/página de orientação; outro portal/CMS apenas como origem quando já houver o conteúdo. Não reimplementar Portal Institucional.

**Demonstração:**

1. Abrir as orientações a partir da área de solicitações como SERV-A.
2. Verificar os documentos e instruções reais de alteração cadastral, atestado/perícia, férias e curso preparados para o ensaio.
3. Atualizar o documento na origem e conferir o destino correto, conforme estratégia de publicação existente.
4. Testar URL inexistente e arquivo sem permissão: informar falha, não abrir comprovante privado por engano.

**Aceite técnico:** O servidor encontra e abre documentação útil às requisições por link funcional. Não há destino “em breve”, link quebrado ou conteúdo de outro pedido no lugar da orientação.

**Atenção / limite de escopo:** A fonte não enumera a documentação nem exige um editor novo. Não inventar certidões/autorizações obrigatórias ou burocracia adicional. Q-S07 registra a lista e a fonte de orientações aprovadas.


<a id="psv-014"></a>
### PSV-014 — Solicitação de férias por período aquisitivo e limites de saída

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 14, p. 90:**

> Permitir ao funcionário que o mesmo possa solicitar o período de férias de acordo com o período aquisitivo e dentro do prazo mínimo e máximo para saída das férias

**Implementação:** Implementar formulário de férias com vínculo, período aquisitivo disponível na origem e período pretendido. Apresentar os limites de início aplicáveis e validar a regra configurada, mantendo referência à sua versão. Encaminhar o pedido para autorização em PSV-018, sem classificá-lo como gozado ou pago.

Os limites devem ser parametrizáveis/reutilizados do RH; não fixar os exemplos do MD em código. Se a origem mantiver reservas/pedidos concorrentes, considerar a disponibilidade real para evitar pedidos incompatíveis autorizados. Falta de período aquisitivo/regra deve ser tratada como pendência, não autorização automática.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — período aquisitivo, disponibilidade e limites; DEP-02 — vínculo; DEP-08 se existente — pedido e decisão. Não criar segundo banco de férias.

**Demonstração:**

1. Executar FER-01 para o período aquisitivo da fixture: 05/10 a 19/10/2026, 15 dias na contagem de teste.
2. Testar inícios com 9, 10, 60 e 61 dias de antecedência em cenários isolados; respeitar os limites parametrizados.
3. Selecionar um período aquisitivo não elegível ou ausente e conferir tratamento da origem.
4. Enviar e consultar o pedido pendente; verificar que enviar não gera pagamento nem gozo confirmado.

**Aceite técnico:** O pedido está ligado ao período aquisitivo e aplica os limites mínimo/máximo efetivamente configurados. As verificações não existem somente no navegador. Gestor recebe o mesmo período que o servidor solicitou.

**Atenção / limite de escopo:** Q-S05: “prazo mínimo e máximo para saída” não foi numericamente definido no TR. A janela de antecedência usada na fixture é proposta de demonstração. Não afirmar que 10/60 dias ou 30 dias de disponibilidade são regras da prefeitura.


<a id="psv-015"></a>
### PSV-015 — Solicitação de cursos e despesas adicionais

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 15, p. 90:**

> Permitir ao funcionário que o mesmo possa solicitar cursos em diversas áreas contento nome do curso, local, data, carga horária, justificativa, valor, os gastos adicionais com hospedagem, diárias ou quaisquer despesas podendo anexar também o documento (flyer) digitalizado relacionado ao curso

**Implementação:** Disponibilizar pedido de curso com **nome, local, data, carga horária, justificativa, valor e gastos adicionais de hospedagem, diárias ou outras despesas**, permitindo anexar flyer digitalizado. Distinguir valor do curso de cada adicional, mostrar total e aceitar outras naturezas sem código novo.

Usar identificação do funcionário herdada da sessão/vínculo. O cadastro deve comportar cursos de áreas diferentes, sem virar catálogo obrigatório de cursos. Armazenar o conteúdo enviado e sua composição para a decisão de PSV-019. Não tornar o flyer obrigatório por padrão; o texto diz “podendo anexar”.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — funcionário/vínculo; DEP-06 — flyer; DEP-08 se usado — solicitação. Não depende de contratar fornecedor, empenhar ou matricular em LMS.

**Demonstração:**

1. Registrar CUR-01 com R$ 1.200 + R$ 300 + R$ 150 + R$ 120 = R$ 1.770, nome/local/data/8 horas/justificativa e flyer.
2. Salvar, reabrir e conferir cada parcela e o arquivo no pedido recebido pelo gestor.
3. Registrar CUR-02 de outra área com valor zero informado, sem adicional e sem flyer.
4. Testar valor inválido, falha de anexo opcional e reenvio da submissão: não criar pedido duplicado nem perder a composição.

**Aceite técnico:** Todos os campos citados podem ser preenchidos e recuperados; adicionais não se limitam a hospedagem/diária e o total concilia. O pedido pode ser tratado pelo gestor e um flyer não é exigido indevidamente em todo curso.

**Atenção / limite de escopo:** Não criar pagamento de despesas, compra de curso, controle de frequência, emissão de certificado ou biblioteca de conteúdo. Carga horária e valores são informados, não calculados por critérios legais presumidos.


<a id="psv-016"></a>
### PSV-016 — Autorização de alterações cadastrais pelo gestor

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 16, p. 90:**

> Permitir ao Gestor autorizar as alterações cadastrais solicitadas pelos funcionários

**Implementação:** Na área de autorizações, abrir a solicitação de alteração com valores atuais/propostos e comprovantes pertinentes. Autorizar a versão efetivamente analisada, com competência de gestor e escopo verificados. Não reduzir autorização a um check visual que qualquer servidor possa enviar.

Após a decisão no fluxo adotado, acionar o serviço autorizado de atualização de dados na origem. Registrar resposta e comparação antes/depois; se a fonte mudou ou falhar, indicar conflito/efetivação pendente, sem sobrescrever dados novos ou exibir aplicação concluída. Reenvio não aplica novamente a mesma alteração.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — versão e atualização do cadastro oficial; DEP-01 — competência do gestor; DEP-06 — comprovantes; DEP-08 quando adotado — decisão.

**Demonstração:**

1. Tratar CAD-01: conferir Rua Alfa → Rua Beta e seu anexo, autorizar com GESTOR-A.
2. Verificar na fonte e na ficha do servidor a mudança confirmada, com referência do pedido.
3. Repetir a confirmação e conferir um só efeito; como servidor sem capacidade, tentar autorizar por API.
4. Executar CAD-03 e falha da fonte separadamente: conflito ou pendência permanece visível, sem falso sucesso.

**Aceite técnico:** Gestor autoriza de fato a proposta correta e o servidor observa a decisão. Quando a rotina aciona atualização do cadastro, o resultado é confirmado na origem, com proteção à repetição/conflito. Rejeição anterior não efetiva a proposta.

**Atenção / limite de escopo:** Q-S03 define a relação entre conferência RH e autorização; não impor dois aprovadores diferentes. Falta de serviço de atualização é dependência real, não autorização para editar diretamente a base do RH.


<a id="psv-017"></a>
### PSV-017 — Autorização de atestados e perícias pelo gestor

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 17, p. 90:**

> Permitir ao Gestor autorizar os atestados ou perícias médicas solicitadas pelos funcionários

**Implementação:** Disponibilizar autorização para ambos os tipos de pedido médico, apresentando período e os dados/documentos que o papel tem permissão de conferir. Registrar decisão, responsável, momento e vínculo à solicitação. Respeitar a regra de RH/gestor definida, sem acesso clínico amplo por padrão.

Refletir a decisão no Portal do titular. Se houver integração para registro funcional/afastamento, usar o serviço do RH e seu resultado; não marcar o ato como efetivado na origem por mera gravação da decisão local.

**Dados de outro módulo / serviço compartilhado:** DEP-02/DEP-04 — vínculo e eventual registro no RH; DEP-06 — comprovante privado; DEP-01 — escopo de autorização clínica/administrativa; DEP-08 se utilizado.

**Demonstração:**

1. Abrir e autorizar MED-01, depois MED-02, com usuário competente no cenário configurado.
2. Como titular, consultar o resultado e os mesmos dados de período; como outro servidor, tentar abrir o pedido/anexo e autorizar.
3. Repetir a decisão e testar estado já rejeitado/alterado por outro analista sem transição permitida.
4. Quando houver efetivação no RH, conferir referência real; se falhar, distinguir autorização de registro funcional pendente.

**Aceite técnico:** Atestado e perícia podem receber autorização persistida do gestor, mantendo a confidencialidade e o vínculo ao titular. Uma decisão concorrente não gera dois registros funcionais ou apaga a análise anterior.

**Atenção / limite de escopo:** Autorização administrativa não é validação médica automática, laudo ou diagnóstico. Q-S06 define os dados acessíveis e a competência institucional; não incluir junta médica ou agendamento de atendimento sem fonte.


<a id="psv-018"></a>
### PSV-018 — Autorização dos pedidos de férias pelo gestor

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 18, p. 90:**

> Permitir ao Gestor autorizar os pedidos de férias solicitadas pelos funcionários

**Implementação:** Na fila, mostrar funcionário, período aquisitivo e período solicitado, com retorno atualizado do RH sobre elegibilidade/limites. Autorizar conforme o papel e o fluxo adotado, revalidando no servidor antes da confirmação.

Se a origem usa reserva/programação, registrá-la através do serviço compatível e conservar sua referência. A mesma autorização reenviada não pode consumir disponibilidade duas vezes. Mostrar ao servidor a decisão e separar eventual efetivação na origem de pagamento/gozo, que pertencem a outras rotinas.

**Dados de outro módulo / serviço compartilhado:** DEP-04 — elegibilidade e registro/reserva de férias; DEP-02 — vínculo; DEP-01 — gestor autorizado; DEP-08 se já adotado.

**Demonstração:**

1. Autorizar FER-01 após consultar os dados atuais da origem.
2. Na fixture que usa reservas, conferir 15 dias comprometidos e 15 disponíveis, sem lançamento financeiro.
3. Repetir a autorização: não registrar mais 15 dias. Testar outra decisão simultânea e disponibilidade alterada pelo RH.
4. Verificar o resultado no Portal do servidor e tentar autorizar com perfil sem capacidade.

**Aceite técnico:** Pedido recebe decisão real e coerente com o período aquisitivo e os limites vigentes; o tratamento na origem, quando usado, é rastreável e não duplicado. O Portal não anuncia férias pagas/gozadas por causa da autorização.

**Atenção / limite de escopo:** Não impor calendário de equipe, substituto obrigatório, abono ou vários níveis hierárquicos. Q-S05 precisa identificar os limites reais; a reserva de 15 dias é condição da fixture, não uma regra universal imposta ao RH.


<a id="psv-019"></a>
### PSV-019 — Autorização dos cursos pelo gestor

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 19, p. 90:**

> Permitir ao Gestor autorizar os Cursos solicitadas pelos funcionários

**Implementação:** Permitir ao gestor autorizado abrir e autorizar o pedido de curso, com todos os campos, valor do curso, adicionais discriminados, total e flyer quando enviado. A decisão refere-se à versão e à composição analisadas; não deve permanecer válida silenciosamente se o funcionário alterar valor/data depois.

Registrar autor/data/resultado e devolver a situação ao próprio solicitante. Reutilizar a mesma estrutura de pedidos e decisões, sem criar um processo de compra ou pagamento.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — solicitante/vínculo; DEP-01 — competência e escopo do gestor; DEP-06 — flyer; DEP-08 se adotado — registro do ato.

**Demonstração:**

1. Abrir CUR-01 pelo gestor, conferir 8 horas, local/data/justificativa, adicionais e R$ 1.770; abrir o flyer e autorizar.
2. Como servidor, consultar a decisão e tentar alterar o valor autorizado sem revisão: impedir ou exigir o tratamento previsto no fluxo existente.
3. Autorizar CUR-02 de outra área, gratuito e sem flyer, quando compatível com a configuração.
4. Repetir a confirmação e testar outro gestor fora do escopo; não duplicar decisão/solicitação.

**Aceite técnico:** As autorizações dos dois pedidos persistem e correspondem às informações apresentadas. Nenhuma despesa é paga ou criada em Compras/Contabilidade sem rotina própria real. Flyer opcional não impede indevidamente a decisão.

**Atenção / limite de escopo:** A fonte pede autorização, não matrícula, avaliação pedagógica, pagamento, certificação ou confirmação do fornecedor. Não adicionar esses fluxos como critério para encerrar PSV-019.


<a id="psv-020"></a>
### PSV-020 — Parametrização de conferência, atualização e comprovantes por campo

**TR — GESTÃO DO PORTAL DO SERVIDOR, item 20, p. 90–91:**

> O portal do Servidor Público deverá permitir parametrizar quais os dados cadastrais o servidor/agente político terá acesso para conferência e atualização, permitindo ainda que o RH defina quais “campos” deverá enviar comprovante para validar as atualizações.

**Implementação:** Na configuração do RH, listar os campos cadastrais suportados e permitir definir acesso para conferência, possibilidade de atualização e necessidade de comprovante para a mudança. Usar os conceitos separados da seção 4.6; mostrar como a regra afetará o formulário do servidor/agente político no escopo autorizado.

Persistir a configuração e aplicar tanto na leitura quanto no envio/decisão no servidor. Campo oculto não pode ser enviado no payload pessoal. Campo somente para conferência não pode ser atualizado por chamada direta. Preservar a regra do pedido e revalidar restrições atuais antes da efetivação, explicitando a política para pedidos em andamento.

**Dados de outro módulo / serviço compartilhado:** DEP-02 — dicionário/serviço de campos cadastrais; DEP-01 — acesso do RH e titular; DEP-06 — comprovação por campo. A configuração de apresentação/solicitação pertence ao Portal, sem alterar livremente o esquema do RH.

**Demonstração:**

1. Configurar a matriz de F-CADASTRO: endereço editável com comprovante; telefone editável sem comprovante; cargo apenas conferível; campo restrito oculto.
2. Como SERV-A, conferir o formulário e testar cada comportamento; repetir no contexto cadastral permitido de AGP-C.
3. Tentar alterar campo oculto/read-only por API e enviar endereço sem comprovação; recusar.
4. Alterar a configuração no RH, reabrir a tela e testar pedido pendente conforme a política documentada, sem apagar histórico nem burlar a nova restrição.

**Aceite técnico:** RH parametriza os três aspectos de forma funcional e a aplicação os respeita de ponta a ponta. Não é somente esconder inputs; dados restritos não são retornados indevidamente e a comprovação é vinculada aos campos pertinentes. Regras diferentes não exigem alteração de código.

**Atenção / limite de escopo:** Q-S08 — conjunto permitido, matriz e efeitos sobre pedidos abertos. Não criar construtor de tabelas, campo livre de SQL ou permissão de editar CPF/perfil/salário por escolher uma opção genérica. Não ampliar a atualização a qualquer atributo do ERP.


---
<a id="pacotes"></a>
## 8. Pacotes de implementação e ordem de trabalho

Não estimar horas/dias sem examinar o código. Uma função existente e comprovada pode ser reaproveitada; não reimplementá-la apenas para seguir a ordem da tabela. Cada pacote entrega interface, persistência, validação, chamada à origem pertinente e teste, não somente telas.

| Pacote | Entrega | IDs principais | Critério de saída |
|---|---|---|---|
| **P0 — Diagnóstico e fronteiras** | Mapear identidade/CPF, vínculos, Folha, ficha funcional, férias, documentos, e-mail e card. Identificar modelo de informe e decisões de RH/gestor. | Todos, como diagnóstico. | Matriz inicial com fontes reais e lacunas, sem “integrado” presumido. |
| **P1 — Card, acesso e proteção** | Card individual, navegação por capacidade, sessão CPF/senha, recuperação por e-mail, escopo por titular/vínculo. | 1, 2; proteção transversal. | F-ACESSO, entrada pessoal e tentativas indevidas testadas. |
| **P2 — Documentos e consultas** | Contracheque/informe, ficha funcional, ficha financeira anual, verificação do impresso. | 3, 4, 9, 10. | F-DOC/F-VALIDACAO com dados da origem e arquivos reais; parte RFB conferida. |
| **P3 — Solicitação cadastral e configuração** | Campos conferíveis/editáveis/comprovantes, submissão, fila RH, validar/rejeitar e autorização de alteração. | 5, 11, 16, 20. | F-CADASTRO, conflito de versão e retorno da origem testados. |
| **P4 — Pedidos médicos** | Tipos Atestado/Perícia, campos/anexos privados, análise e autorização competente. | 12, 17; reutilização de 5. | F-MED nos dois tipos, incluindo teste de sigilo. |
| **P5 — Férias** | Pedido por período aquisitivo, regras parametrizadas de saída, autorização e resultado de origem quando aplicável. | 14, 18. | F-FERIAS com limites e revalidação; sem reserva duplicada. |
| **P6 — Cursos** | Pedido completo, adicionais, flyer opcional e autorização da versão analisada. | 15, 19. | F-CURSOS: R$ 1.770 no cenário principal e curso gratuito sem flyer. |
| **P7 — Comunicação e informações** | Avisos individuais/coletivos, aniversariantes, organograma e links de documentação. | 6, 7, 8, 13. | F-COMUNICACAO com destinatários, contagens e emissões corretas. |
| **P8 — Ensaio integrado e UX** | Execução dos 20 IDs, falhas, concorrência, permissões, paginação, emissão e celular. | Todos os 20. | Matriz de execução preenchida, artefatos reais e pendências discriminadas. |

Começar com uma listagem e um formulário pilotos no padrão visual antes de replicar. Desenvolver o consumidor de Folha cedo: um portal com pedidos mas sem contracheque/informe não cobre o item 3. Não deixar testes de acesso a dados médicos e financeiros somente para o final.

O tratamento dos dados da origem fica restrito aos serviços permitidos. Se uma mudança no RH for indispensável e não estiver disponível, registrar a necessidade e o ID impactado; não modificar silenciosamente a Folha, o Organograma ou o banco geral de Pessoas.

<a id="testes"></a>
## 9. Testes, evidências e condição de conclusão

### 9.1 Verificações transversais

| Teste | Verificação concreta |
|---|---|
| **Card e entrada** | Card “Portal do Servidor” individual; destino funcional; separado do RH e dos portais públicos; sem outro sistema/login redundante. |
| **Logon** | Entrada com CPF/senha; sessão reutilizada quando válida; perfil pessoal sem poderes administrativos. |
| **Identidade e isolamento** | SERV-A não recebe dados de SERV-B por URL/API, cache, download, troca de sessão ou vínculo. |
| **Recuperação** | E-mail previamente cadastrado; recebimento real; link válido define nova senha; reutilização/expiração recusadas; sem senha em texto claro. |
| **Contracheque** | Consulta e emissão por titular/competência/tipo; janeiro R$ 2.900 líquidos e dezembro R$ 3.080 no conjunto de SERV-A. |
| **Informe de rendimentos** | Consulta e emissão distintas; modelo aplicável identificado e campos comparados à origem. Um relatório de líquido anual não substitui o informe. |
| **Autenticidade do impresso** | Código/QR extraído do documento emitido; recuperação da versão correta, código inexistente e comparação de cópia alterada. |
| **Ficha funcional** | Informações correspondem à origem e ao vínculo; consulta não edita diretamente a ficha oficial. |
| **Ficha anual** | 12 competências regulares e 13º separado; totais R$ 45.200 / R$ 7.670 / R$ 37.530, sem limitar à página visível. |
| **Matriz de campos** | Endereço com comprovante; telefone sem; cargo só consulta; campo restrito oculto também no payload; API não contorna a configuração. |
| **Pedido cadastral** | Valor oficial permanece antigo até tratamento; após efetivação confirmada, muda uma vez. Rejeição e falha preservam dados oficiais. |
| **Análise RH** | Validar e rejeitar informações; abrir anexo correto; registrar análise sem criar pedido paralelo. |
| **Autorização do gestor** | Executar as quatro famílias — cadastro, atestado/perícia, férias e cursos — sem conceder essa capacidade ao solicitante comum. |
| **Concorrência** | Duas decisões simultâneas sobre a mesma versão não aplicam efeitos duplicados ou contraditórios. Fonte alterada exige nova conferência. |
| **Atestado/perícia** | Ambos os tipos, período/CID/médico/comprovante; nenhum CID/anexo médico vaza para avisos, outros servidores ou portal público. |
| **Férias** | Período aquisitivo e limites reais/fixture; 9/10/60/61 dias de antecedência distinguíveis; nova consulta à origem antes da autorização. |
| **Cursos** | Nome, local, data, carga, justificativa, valor e adicionais; total R$ 1.770; outra área/curso gratuito sem flyer aceitos conforme dados. |
| **Avisos** | AV-01/02/03 resultam em 2/2/1/1 avisos nos quatro destinatários; link direto de aviso alheio recusado. |
| **Aniversariantes** | Setembro com 3 pessoas, outubro com 1, no cenário-base; relatório contém registros de todas as páginas. |
| **Organograma** | Cinco nós, hierarquia e responsáveis; mudança na origem refletida na emissão; sem lista fixa. |
| **Orientações** | Link abre documento correto e autorizado; instrução não é comprovante pessoal; link inexistente não é aceito como funcional. |
| **Arquivos** | Upload recuperável; falha identificada; vínculo ao pedido correto; rota bruta de arquivo não contorna autorização. |
| **Paginação** | 27 solicitações: 10/10/7 no cenário de capacidade dez; busca encontra a terceira página; voltar preserva filtros e foco. |
| **Emissões** | Documentos/relatórios emitidos usam o recorte inteiro e os dados reais, com ausência/erro identificados. |
| **Fonte indisponível** | Mostrar falha ou estado pendente; não exibir folha zerada, período elegível inventado ou alteração aplicada sem retorno. |
| **Desktop e celular** | Tipografia, campos e ações legíveis, ausência de rolagem global priorizada nas listas; documentos/zoom com leitura integral; mesmo site no Chrome. |

Esses testes são meios para demonstrar as funções, não uma nova numeração de requisitos do edital. Os valores esperados nunca devem aparecer como constantes de produção.

### 9.2 Matriz que o agente deve entregar

Manter **uma linha para cada PSV-001 a PSV-020**. Preencher somente depois de localizar ou executar. Uma sugestão de local é `docs/poc/portal-servidor-status.md`, a adaptar às convenções do repositório; não é um caminho confirmado. O card é verificado no item 1 e na UX, sem criar um “item 21” do TR.

| ID | Estado inicial | Tela / rota real | Fonte e serviço | Teste / evidência | Pendência / limite |
|---|---|---|---|---|---|
| PSV-001 | A_VERIFICAR | A mapear | A confirmar | Não executado | Diagnosticar fonte, permissão e implementação |
| PSV-002 | A_VERIFICAR | A mapear | A confirmar | Não executado | Q-S01 — interpretação do link de recuperação |
| PSV-003 | A_VERIFICAR | A mapear | A confirmar | Não executado | Q-S02 — modelo do informe e fonte da Folha |
| PSV-004 | A_VERIFICAR | A mapear | A confirmar | Não executado | Q-S04 — dados/público da validação |
| PSV-005 | A_VERIFICAR | A mapear | A confirmar | Não executado | Diagnosticar fonte, permissão e implementação |
| PSV-006 | A_VERIFICAR | A mapear | A confirmar | Não executado | Diagnosticar fonte, permissão e implementação |
| PSV-007 | A_VERIFICAR | A mapear | A confirmar | Não executado | Diagnosticar fonte, permissão e implementação |
| PSV-008 | A_VERIFICAR | A mapear | A confirmar | Não executado | Diagnosticar fonte, permissão e implementação |
| PSV-009 | A_VERIFICAR | A mapear | A confirmar | Não executado | Diagnosticar fonte, permissão e implementação |
| PSV-010 | A_VERIFICAR | A mapear | A confirmar | Não executado | Diagnosticar fonte, permissão e implementação |
| PSV-011 | A_VERIFICAR | A mapear | A confirmar | Não executado | Diagnosticar fonte, permissão e implementação |
| PSV-012 | A_VERIFICAR | A mapear | A confirmar | Não executado | Diagnosticar fonte, permissão e implementação |
| PSV-013 | A_VERIFICAR | A mapear | A confirmar | Não executado | Diagnosticar fonte, permissão e implementação |
| PSV-014 | A_VERIFICAR | A mapear | A confirmar | Não executado | Q-S05 — regra de saída/período aquisitivo |
| PSV-015 | A_VERIFICAR | A mapear | A confirmar | Não executado | Diagnosticar fonte, permissão e implementação |
| PSV-016 | A_VERIFICAR | A mapear | A confirmar | Não executado | Diagnosticar fonte, permissão e implementação |
| PSV-017 | A_VERIFICAR | A mapear | A confirmar | Não executado | Diagnosticar fonte, permissão e implementação |
| PSV-018 | A_VERIFICAR | A mapear | A confirmar | Não executado | Q-S05 — elegibilidade e efeito no RH |
| PSV-019 | A_VERIFICAR | A mapear | A confirmar | Não executado | Diagnosticar fonte, permissão e implementação |
| PSV-020 | A_VERIFICAR | A mapear | A confirmar | Não executado | Diagnosticar fonte, permissão e implementação |

**Estados de acompanhamento:** `A_VERIFICAR`, `EXISTE_NAO_TESTADO`, `A_IMPLEMENTAR`, `PARCIAL`, `VALIDADO_LOCAL`, `TESTADO_COM_SIMULADOR`, `INTEGRACAO_TESTADA_HOMOLOGACAO`, `DEPENDENCIA_OUTRO_MODULO`, `DEPENDENCIA_SERVICO`, `AGUARDA_DEFINICAO`. Separar estado da funcionalidade de estado da integração. Uma simulação funcional pode estar concluída enquanto sua conexão com RH ainda está pendente.

Para cada evidência registrar: ID, dados e estado inicial, perfil utilizado, ação executada, resultado observado, persistência conferida, arquivo emitido quando aplicável e origem/versão dos dados. Screenshots de tela devem ser do sistema real, acompanhados das verificações de efeito; não bastam para provar gravação ou integração.

### 9.3 Critérios de fechamento

O requisito só fica validado tecnicamente quando suas partes funcionarem, forem testadas, mantiverem dados/permissões corretos e tiverem evidência reproduzível. Em especial:

- **PSV-003:** quatro ações e modelo RFB, não só consulta do contracheque.
- **PSV-005 e PSV-016–019:** tratamento e autorizações reais, não botões que apenas mudam cores.
- **PSV-012/017:** atestado e perícia, todos os componentes e acesso protegido.
- **PSV-014/018:** período aquisitivo, limites configurados e autorização, sem supor datas legais.
- **PSV-020:** efeito nos campos, no envio e na autorização, não apenas cadastro de permissões sem aplicação.

Entregar relação dos arquivos alterados, migrations incrementais, comandos de teste realmente executados, rotas reais, perfis utilizados, evidências e pendências. Não declarar “20/20 atendidos” por contar títulos, usar documentos estáticos, esconder falha de e-mail ou simular o RH sem informar. Validação técnica interna não é homologação da comissão nem auditoria integral dos requisitos gerais da licitação.

### 9.4 Auditoria documental de cobertura

| ID | Resultado que deve ser comprovado | Cenário / seção |
|---|---|---|
| [PSV-001](#psv-001) | Card individual, CPF/senha e sessão com vínculo autorizado. | F-ACESSO |
| [PSV-002](#psv-002) | Recuperação por e-mail cadastrado e nova senha funcional; Q-S01 explícita. | F-ACESSO / seção 4.2 |
| [PSV-003](#psv-003) | Consultar/emitir contracheque e consultar/emitir informe RFB, separadamente. | F-DOC |
| [PSV-004](#psv-004) | Identificador do impresso resolve a emissão/versão e permite conferência. | F-VALIDACAO |
| [PSV-005](#psv-005) | RH abre o pedido/anexos, valida e rejeita, com resultados persistidos. | F-CADASTRO |
| [PSV-006](#psv-006) | Aniversariantes da origem, listagem emitida e filtro completo. | F-COMUNICACAO |
| [PSV-007](#psv-007) | Avisos individuais e coletivos disponibilizados só aos destinatários. | F-COMUNICACAO |
| [PSV-008](#psv-008) | Organograma emitido com divisões, hierarquia e responsáveis. | F-COMUNICACAO |
| [PSV-009](#psv-009) | Ficha funcional consultável do vínculo autorizado. | F-ACESSO / ficha de origem |
| [PSV-010](#psv-010) | Ficha financeira anual completa, sem confundir com informe. | F-DOC |
| [PSV-011](#psv-011) | Proposta cadastral e comprovante, sem atualização direta antes do tratamento. | F-CADASTRO |
| [PSV-012](#psv-012) | Atestado e perícia: tipo, período, CID, médico e arquivo digitalizado. | F-MED |
| [PSV-013](#psv-013) | Link funcional à documentação necessária às requisições. | F-COMUNICACAO |
| [PSV-014](#psv-014) | Férias vinculadas a período aquisitivo e limites configurados de saída. | F-FERIAS |
| [PSV-015](#psv-015) | Curso, dados completos, adicionais e flyer permitido. | F-CURSOS |
| [PSV-016](#psv-016) | Gestor autoriza alteração e resultado na origem é distinguível. | F-CADASTRO |
| [PSV-017](#psv-017) | Gestor autoriza atestado e perícia, com acesso privado e decisão identificada. | F-MED |
| [PSV-018](#psv-018) | Gestor autoriza férias com revalidação e sem efeito duplicado. | F-FERIAS |
| [PSV-019](#psv-019) | Gestor autoriza o curso/composição realmente analisados. | F-CURSOS |
| [PSV-020](#psv-020) | Conferência, atualização e comprovante por campo efetivos na UI/API. | F-CADASTRO |

O quadro identifica a correspondência entre a redação e o desenvolvimento. Todas as propostas adicionais de segurança, interface e integridade permanecem classificadas como TEC/UX; não são atribuídas à redação do TR.

<a id="pendencias"></a>
## 10. Definições a registrar, sem paralisar o que já está determinado

### Q-S01 — “Link com nova senha”

**Item 2.** A fonte não detalha o mecanismo de recuperação. Este MD propõe link seguro para definir nova senha, em vez de transmitir a senha. Registrar essa correspondência e confirmar a interpretação quando necessário à POC. Implementar o mecanismo seguro; a frase não deve ser usada como justificativa para enviar senha permanente em texto claro.

### Q-S02 — Dados da Folha, modelos e publicação dos documentos

**Itens 3, 9 e 10.** Identificar os serviços de ficha/folha, competências disponíveis, tipos de folha, versões e política de liberação ao titular. Localizar modelo de contracheque e o informe RFB aplicável ao ano-calendário. Este MD não define rubricas fiscais nem entrega um formulário RFB homologado. Modelo ausente ou dados sem classificação são pendências reais para concluir a parte correspondente do item 3; não bloqueiam o desenvolvimento das outras telas.

A consulta externa EXT-RFB identificou a referência normativa nº 2.060/2021 no sistema oficial de normas, mas o texto consolidado e seus anexos não foram integralmente recuperados nesta análise. Confirmar a referência e eventuais alterações aplicáveis ao ano antes de fechar o modelo. Não declarar revisão fiscal integral do informe com base apenas neste plano.

### Q-S03 — Papéis, escopo e sequência de análise/autorização

**Itens 1, 5 e 16–19; acesso transversal.** Identificar a relação entre usuário, pessoa, vínculo, órgão, RH e gestor. O TR não define se as funções serão exercidas por duas pessoas nem a ordem de todos os atos. Usar configuração existente ou decisão institucional registrada, permitindo demonstrar conferência/validação/rejeição pelo RH e autorização pelo gestor sem criar burocracia adicional. Acesso pessoal de agente político deve contemplar os itens que o mencionam, sem presumir que todas as regras de férias e vínculos se aplicam a todo agente.

### Q-S04 — Forma e público da validação de contracheque

**Item 4.** Escolher a alternativa compatível com o serviço existente — QR ou código. Definir dados de conferência, acesso externo quando pertinente, proteção e política de versões. Não confundir identidade da emissão com validação criptográfica de uma cópia modificada. Um serviço público que revela folha inteira só pelo CPF não é a solução prevista neste MD.

### Q-S05 — Período aquisitivo e prazos de férias

**Itens 14 e 18.** Obter regra institucional/regime aplicável e o significado dos limites mínimo/máximo para saída. O ensaio de 10/60 dias de antecedência apenas comprova parametrização; não resolve por si eventual interpretação sobre janela ou duração. Identificar onde o RH mantém disponibilidade, pedidos/reservas e o efeito da autorização. Não aplicar automaticamente números da CLT, férias coletivas ou abono.

### Q-S06 — Solicitações médicas e política de dados

**Itens 12 e 17.** Confirmar o tratamento administrativo de atestado/perícia, as competências e o preenchimento/visibilidade do CID e comprovante conforme a política autorizada. O software deve manter os campos exigidos e restringir acesso; não criar diagnóstico nem decidir obrigação clínica por conta própria. Usar dados de ensaio identificados e nunca comprovantes reais sem autorização.

### Q-S07 — Avisos, aniversariantes, organograma e documentação

**Itens 6, 7, 8 e 13.** Definir público das listagens, destinatários coletivos, estrutura oficial e conteúdo das orientações. O TR não estabelece que aniversariantes sejam públicos nem que aviso exija leitura confirmada. Não usar esta ausência de detalhamento para deixar de emitir a listagem, entregar os avisos ou disponibilizar os links.

### Q-S08 — Campos parametrizáveis e pedidos em andamento

**Itens 11, 16 e 20.** Levantar campos da origem permitidos para conferência/atualização, regras de comprovação e comportamento de pedidos anteriores à alteração dos parâmetros. Preservar versão para análise e revalidar restrições no momento de efetivar. A configuração não pode permitir alteração de privilégios ou controles de identidade sob o nome de “dado cadastral”.

### Q-S09 — Disponibilidade técnica de origem e e-mail

**Vários itens.** Identificar serviços DEP-01 a DEP-08 realmente usados, credenciais de homologação, remetente e caixas autorizadas. Não expor segredos no código/MD/logs. Avançar nos itens independentes enquanto uma fonte não estiver disponível; a conexão específica continua marcada como pendência, não como dispensada.

<a id="fontes"></a>
## 11. Conferência documental, referências e prevalência

### 11.1 Resultado da composição

| Verificação | Resultado |
|---|---:|
| Entradas numeradas no bloco do TR | 20 |
| IDs individuais no MD | 20 |
| Citações integrais dos requisitos | 20 |
| Blocos com implementação, demonstração, aceite, dependências e limites | 20 |
| Itens omitidos ou adicionados à numeração do TR | 0 |
| Divergências entre extrações PyMuPDF e Poppler, após normalizar somente espaços/quebras | 0 |

Os requisitos foram comparados às páginas 89–91; as imagens das páginas foram consultadas para confirmar fronteiras e continuação. **PSV-004 atravessa as páginas 89–90 e PSV-020 as páginas 90–91.** Não foram incorporados os itens finais de RH/eSocial nem o início da Gestão Tributária.

O texto do item 15 conserva “contento” e o item 20 mantém a referência a “campos” que exigem comprovante. Essas formas não foram corrigidas na citação. O Portal possui 20 itens documentados, não 20 funções independentes ou já homologadas. A versão do arquivo final foi verificada quanto a sequência, links internos e cálculos dos cenários.

### 11.2 Fontes utilizadas

**TR-PSV — fonte funcional exclusiva.** `termo de referencia (Ratificado)(1).pdf`, 335 páginas, Processo Administrativo nº 1026/2026, seção 19, **GESTÃO DO PORTAL DO SERVIDOR**, pp. **89–91**, itens **1–20**. A página referida é a posição no PDF ratificado, não a paginação do documento anterior.

**UX-BASE / CARD / CANAL.** Diretrizes do usuário nesta conversa: padrão dos MDs anteriores; Portal do Servidor como card individual dentro do CeleriFlow; tabelas paginadas, legibilidade e eficiência; mesmo site no Chrome do celular; fontes de outros módulos destacadas. O plano conjunto dos portais Institucional/Transparência é referência de método e de separação de contextos, não fonte de requisitos novos do Portal do Servidor.

**EXT-RFB — referência externa pontual, consultada em 18/09/2026.** Sistema oficial de normas da Receita Federal: consulta sobre o Comprovante de Rendimentos, com referência à Instrução Normativa RFB nº 2.060/2021. URL de consulta: `https://normas.receita.fazenda.gov.br/sijut2consulta/consulta.action?termoBusca=comprovante+de+rendimentos`. A identificação bibliográfica não substitui obter o texto/anexos aplicáveis e conferir o documento de PSV-003. Não se acrescentou API ou transmissão fiscal ao escopo.

**EXT-SEC — referência externa técnica, consultada em 18/09/2026.** OWASP, *Forgot Password Cheat Sheet*: `https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html`. Usada para a proposta de recuperação por link, sem senha em mensagem, com token protegido de uso único, expiração e resposta inicial que não revele existência da conta. É referência de implementação segura, não texto do TR nem exigência adicional de certificação.

**Prevalência:** requisitos e seus termos vêm do TR; card/canal e padrão visual vêm do usuário; arquitetura, cenários e testes são propostas identificadas deste MD. Regras institucionais, clínicas, fiscais e de férias não fornecidas continuam pendentes de configuração/validação. Não houve preenchimento de tabelas tributárias, criação de requisitos de RH ou promessa de integração externa não testada.

**Entrega final esperada:** um **card Portal do Servidor** funcional no CeleriFlow; autoatendimento e tratamento RH/gestor integrados às fontes disponíveis; documentos emitidos a partir de dados reais de homologação; os **20 itens testados individualmente**, com evidências e pendências identificadas. Não entregar somente um card, um novo Markdown ou vinte botões sem efeito.
