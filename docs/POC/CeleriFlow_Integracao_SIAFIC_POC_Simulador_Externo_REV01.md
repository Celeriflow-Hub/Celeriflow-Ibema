# CeleriFlow — Integração SIAFIC e receptor externo de demonstração

**Revisão:** 01  
**Data:** 18/09/2026  
**Destinatário:** agente de desenvolvimento / Codex  
**Empresa:** Robonuvem  
**Natureza:** especificação de implementação, integração e testes; não é declaração de homologação.  
**Prioridade:** adaptar o CeleriFlow existente e demonstrar um fluxo executável, sem construir outro ERP completo.

> **ORDEM AO AGENTE:** examine o repositório, reutilize os módulos e serviços existentes, implemente as lacunas descritas, crie o receptor externo independente e execute os testes. Não encerre com outro planejamento. Não substitua execução por telas estáticas, mensagens de sucesso programadas, arquivos previamente carregados nos dois lados ou alterações manuais de status. Registre honestamente o que foi implementado, executado, bloqueado ou não testado.

---

## 1. Contexto, premissas e decisão de arquitetura

### 1.1. Informação fornecida pelo responsável pela Robonuvem

O responsável informou que, em contato telefônico com a Administração, foi orientado a demonstrar as integrações com dados fictícios ou dados de outros contratos, pois as credenciais do ambiente municipal não seriam disponibilizadas. Não há possibilidade de novos esclarecimentos antes da demonstração.

Tratar isso como **relato de orientação operacional para preparar a POC**, não como documento formal que altera o TR ou garante a aceitação de qualquer simulação. Não criar ata, autorização, credencial ou declaração atribuída à Prefeitura. A apresentação deverá explicar o ambiente utilizado.

A Robonuvem já utiliza o conceito de Banco Virtual para demonstrar integrações bancárias. Aproveitar essa experiência e componentes de infraestrutura que efetivamente existirem no repositório, mas não confundir banco simulado com SIAFIC e não criar dependência bancária para cadastrar fornecedores e contratos.

### 1.2. Decisão para esta entrega

Implementar duas possibilidades sobre a mesma camada de integração:

1. **Integração nativa:** Compras, Licitações, Contratos e Convênios utilizam os serviços/cadastros do núcleo contábil do próprio CeleriFlow, quando existentes.
2. **Integração externa demonstrável:** o CeleriFlow transmite os mesmos tipos de informação, por HTTPS autenticado, a uma aplicação separada chamada **Receptor SIAFIC — Robonuvem DEMO**. O receptor valida, persiste em banco próprio, responde e exibe os registros recebidos.

O receptor externo é recomendado para mostrar o processo descrito pelo usuário sem depender de credenciais municipais. **Não decorre dos trechos transcritos uma obrigação de usar esta arquitetura específica.** É uma decisão de preparação da demonstração.

**O que é real:** cadastro de origem, evento, chamada de rede, autenticação, validação, gravação no destino, retorno, tratamento de falhas e consulta posterior.

**O que é simulado:** identidade municipal, dados de negócio, fornecedor/sistema de destino e protocolo de integração deste laboratório.

**O que não está sendo comprovado:** compatibilidade com a API do fornecedor atual da Prefeitura, homologação por esse fornecedor, transmissão à Prefeitura ou conformidade integral do ERP com todo o Decreto nº 10.540/2020.

### 1.3. Limite importante do receptor

Não construir um SIAFIC completo. Para os itens de exportação, o receptor precisa receber e manter fornecedores, contratos e convênios, suas alterações e os vínculos de origem. Pode exibir esses dados como cadastro de credores e controle de instrumentos, sem fingir que isso é escrituração contábil.

Não criar PCASP próprio, motor paralelo de empenho, liquidador, pagamentos, contas bancárias, portal público ou um segundo financeiro dentro do receptor desta entrega. Os testes de empenho/liquidação descritos mais adiante devem reutilizar o núcleo competente do CeleriFlow.

---

## 2. Fontes, rastreabilidade e compatibilidade com os MDs anteriores

### 2.1. Trechos fornecidos pelo usuário — fonte primária deste escopo

**REQ-GERAL — obrigação:**

> A empresa fica obrigada a atender a todas as normas do decreto federal 10.540 de 05 de novembro de 2020 referente ao SIAFIC - Sistema Único e Integrado de Execução Orçamentária e Contabilidade para os Consórcios

**CLC-008 — fornecedores:**

> Integração total com o SIAFIC, Exportando automaticamentos os fornecedores cadastrados no sistema de Compras, Licitação e Contratos.

**CLC-052 e CLC-075 — mesma redação, preservar os dois IDs:**

> Integração total com o SIAFIC, exportando automaticamente todos os contratos cadastrados no sistema de compras, licitações e contratos e convênios.

A denominação oficial do SIAFIC é Sistema Único e Integrado de Execução Orçamentária, Administração Financeira e Controle. O texto acima foi preservado como transcrição do usuário; não criar módulo de consórcio somente por essa redação. Referência normativa: [S1].

### 2.2. Documento de projeto preexistente

Foi consultado o arquivo **`CeleriFlow_POC_Compras_Licitacoes_Contratos_Desenvolvimento_REV01.md`**, especialmente CLC-008, CLC-052, CLC-057, CLC-060, CLC-075 e DEP-04.

Este novo MD é **complementar**, não substitui o documento do módulo de Compras. Preservar IDs, fluxos, identidades e fixtures que já existirem. O documento anterior vedava criar um simulador financeiro para contornar uma dependência. A instrução atual do usuário autoriza uma exceção delimitada: **um receptor externo de teste, separado e identificado como tal**, sem substituir o núcleo contábil nem declarar conformidade inexistente.

Não modificar silenciosamente os requisitos de empenho/liquidação nem marcar como concluído no MD anterior um serviço que só foi simulado. Atualizar a matriz com o tipo da evidência: `NATIVA_EXECUTADA`, `EXTERNA_DEMO_EXECUTADA`, `OFICIAL_NAO_TESTADA` ou `DEPENDENCIA_NAO_RESOLVIDA`.

A associação de CLC-052 ao bloco de Convênios não muda a literalidade, que fala em contratos. Para reduzir lacunas, demonstrar contratos por todos os pontos de entrada existentes e acrescentar um convênio como cobertura complementar. Isso não determina contabilização automática de qualquer convênio.

### 2.3. Referência de mercado e normativa — não copiar produto alheio

A documentação da Betha descreve envio automático de contratos e alterações ao Contábil e uma ação manual de recuperação quando necessário. Utilizar a ideia de evento, retorno e recuperação, não copiar telas, regras contábeis, filtros ou API daquele produto. [S2]

O Decreto nº 10.540/2020 trata da integração entre sistemas, além de requisitos contábeis, tecnológicos e de transparência. Não converter esta especificação de exportação em certificado de cumprimento integral do decreto. Manter a avaliação geral do ERP separada. [S1]

### 2.4. Matriz de cobertura desta implementação

| ID | Entrega | Evidência principal | Limite |
|---|---|---|---|
| CLC-008 | Fornecedores exportados automaticamente. | Cadastro novo em Compras, recebimento e disponibilidade no destino. | Cadastro não cria dívida ou pagamento. |
| CLC-052 | Contratos exportados, inclusive pelos contextos abrangidos pelo módulo. | Registro recebido, campos/vínculos e histórico. | Mesmo serviço de CLC-075; não duplicar eventos por menu. |
| CLC-075 | Exportação no contexto Contratos. | Contrato criado por esse caminho, confirmado no destino. | Evidência própria para o ID, implementação compartilhada. |
| COB-CONVENIO | Convênio e suas partes/alterações. | Instrumento tipado como convênio no receptor. | Cobertura complementar; não equiparar convenente a fornecedor contratado. |
| REQ-GERAL | Registro das evidências e lacunas relacionadas ao decreto. | Matriz separada de conformidade do ERP. | Não declarar atendida só pelos testes deste arquivo. |
| CLC-057 / CLC-060 | Continuidade até empenho/liquidação pelo núcleo já existente. | Operações efetivas e rastreáveis no módulo competente. | Não construir nem usar o receptor cadastral para fingir esses atos. |

---

## 3. Inspeção inicial obrigatória — antes de alterar código

A stack conhecida do projeto é TypeScript/React/Next.js, Vercel, PostgreSQL/Neon e Firebase Auth, com instâncias independentes. **Confirmar no código; isso não é uma inspeção já realizada.** Não migrar ORM, framework, autenticação, gerenciador de pacotes ou arquitetura de instâncias.

Ler instruções locais, inclusive `AGENTS.md` quando houver; manifests; lockfile; migrations; variáveis documentadas; serviços de domínio; rotas de gravação; testes e convenções de autorização.

Produzir `docs/integracoes/siafic/diagnostico.md` com os caminhos reais encontrados para:

- Cadastro único de pessoas/fornecedores, formas de inclusão/edição/importação e versão dos registros.
- Contratos, convênios, aditivos, suspensões, encerramentos e processos de origem.
- Contabilidade, credores, dotações, autorizações, empenhos e liquidações.
- Central de Integrações, adaptadores, logs, filas, processamento automático e Banco Virtual, se disponível.
- Autenticação, autorização por unidade, consultas e exportação de evidências.

No diagnóstico, distinguir `EXISTE_E_TESTADO`, `EXISTE_NAO_TESTADO`, `A_IMPLEMENTAR` e `DEPENDENCIA`. Não inferir funcionamento a partir do nome de uma tela/tabela.

**Restrições de alteração:** não refazer Compras, Pessoas, Contabilidade ou GED; não criar outro login dentro do CeleriFlow; não duplicar uma identidade como novo fornecedor para cumprir a integração; não acessar tabelas de outro domínio ignorando serviços e permissões existentes; não executar migração destrutiva; não alterar dados de produção.

---

## 4. Arquitetura a implementar

### 4.1. Fluxo externo

```text
CeleriFlow — instância DEMO
  Cadastro real de fornecedor / contrato / convênio
        |
        | mesma transação local: dado + evento persistido
        v
  Outbox + despachante + adaptador SIAFIC-DEMO
        |
        | HTTPS autenticado / contrato de teste versionado
        v
Receptor SIAFIC — Robonuvem DEMO
  Validação -> transação própria -> registro + histórico + recibo
        |
        | resposta autenticada pela conexão / IDs / hash / resultado
        v
CeleriFlow
  Confirmação -> vínculo externo -> trilha -> reconciliação
```

A outbox é a tabela persistente de eventos a transmitir. A escrita conjunta do registro local e do evento evita depender de uma segunda gravação avulsa após o cadastro; o processamento deve tolerar reenvios. Referência técnica: [S3].

### 4.2. Independência real dos dois lados

| Aspecto | CeleriFlow | Receptor DEMO |
|---|---|---|
| Aplicação | ERP existente. | Aplicação pequena, independente. |
| Implantação | Projeto/implantação do ERP de demonstração. | Outro projeto/implantação. |
| Banco | Banco da instância de demonstração. | Outro banco e credencial próprios. |
| Acesso à informação | Serviços do ERP. | Apenas sua base recebida e catálogos de teste. |
| Comunicação | Cliente HTTP no servidor. | API de recepção no servidor. |
| Interface | Central e registros de origem. | Painel de registros recebidos e protocolos DEMO. |

O servidor do CeleriFlow **não recebe a senha do banco do receptor**. O receptor **não recebe a senha do banco do CeleriFlow**. A interface do receptor não consulta diretamente as tabelas nem a API de listagem da origem para fingir que recebeu dados.

Pode compartilhar infraestrutura física, tipos de contrato e componentes autorizados; a separação lógica, os acessos e a persistência devem continuar independentes.

### 4.3. Organização do código sem aumentar desnecessariamente o ERP

Preferir um projeto/repositório pequeno para o receptor. Quando só houver acesso ao workspace do CeleriFlow, gerar uma pasta independente, por exemplo `tools/siafic-demo-receiver/`, com manifest, lockfile, build e instruções próprios.

Esse caminho é sugestão, não localização já existente. Não converter o repositório inteiro em monorepo para cumprir esta tarefa. Garantir que o receptor não entre no bundle do cliente, nas rotas do ERP nem na compilação TypeScript do aplicativo principal. Na Vercel, cada projeto deve usar sua pasta-raiz e variáveis corretas.

Reutilizar um simulador externo já existente somente se puder isolar os domínios `BANK_DEMO` e `SIAFIC_DEMO`, tokens, rotas, cenários e evidências. Não refazer a integração bancária para entregar a integração cadastral.

### 4.4. Modos e destino contábil

Separar **ambiente** (`DEMO`, `HOMOLOGACAO`, `PRODUCAO`) de **adaptador**:

- `native`: invoca os serviços reais do CeleriFlow ou utiliza o cadastro compartilhado existente.
- `robonuvem_demo`: usa exclusivamente o receptor deste documento.
- `official_unconfigured`: representa integração oficial ainda não configurada; permanece bloqueada.

`official_unconfigured` não retorna sucesso e não muda automaticamente para `robonuvem_demo`. Na interface, exibir "Integração oficial não configurada/testada".

É permitido enviar cadastros de uma instância DEMO ao receptor enquanto também estão disponíveis na contabilidade nativa. Isso é uma cópia de teste, não dois livros oficiais. **Nunca duplicar empenho, liquidação ou escrituração entre dois destinos ativos.** Preservar um único núcleo responsável pelo ato contábil.

---

## 5. Escopo funcional mínimo

### 5.1. Fornecedores / partes

Usar a identidade canônica existente. O adaptador deve tratar inclusão, atualização, ativação e inativação. Não criar um novo cadastro por tela de origem.

Transmitir, conforme a disponibilidade e necessidade do fluxo:

| Campo lógico | Regra proposta |
|---|---|
| ID de origem e versão | Obrigatórios; estáveis e sem depender do nome. |
| Tipo de pessoa | PF/PJ ou tipos já existentes com mapeamento explícito. |
| Identificação fiscal | Política de dados sintéticos da seção 12.4; produção mantém suas validações. |
| Nome/razão social | Obrigatório para cadastro utilizável. |
| Nome fantasia, enquadramento ME/EPP, CNAEs | Levar quando presentes na origem e mapeados. |
| Endereço e contato | Estruturados; enviar somente dados necessários e permitidos. |
| Situação cadastral | Ativo/inativo; não inferir regularidade fiscal. |
| Unidade/instância responsável | Resolver no servidor; não confiar na escolha arbitrária do cliente. |
| Papéis | Fornecedor, convenente e outros, sem forçar equivalência entre eles. |

O receptor apresenta "Cadastro recebido / disponível para referência". Não cria contas a pagar, dívida, saldo, empenho ou pagamento.

### 5.2. Contratos e convênios

Uma estrutura comum pode atender ambos, com `instrumentType` explícito e partes com papéis próprios.

Campos propostos: ID/versão, tipo, número/ano, unidade responsável, processo de origem, objeto, partes, datas de assinatura e vigência, situação, valor inicial e atual, itens/quantidades/unidades, parcelas quando existentes e eventos de alteração. Um convênio pode ter concedente/convenente e valores próprios de transferência/contrapartida, sem ser tratado como compra.

Referências documentais devem indicar o documento e sua versão/hash quando disponíveis. Não expor links públicos de GED nem transmitir certificados/credenciais. A transferência integral de anexos não é necessária para o mínimo desta especificação; mostrar os campos e as referências sem alegar transferência dos bytes.

Usar strings decimais no transporte e tipo decimal/numeric no banco para valores monetários. Não usar aritmética de ponto flutuante para totais. Datas de negócio: `YYYY-MM-DD`; instantes: ISO 8601 com fuso ou UTC. Exibir instantes no fuso configurado da instância, inicialmente `America/Sao_Paulo` para o ensaio.

### 5.3. Disparos automáticos — cobrir todos os caminhos

Gerar evento no servidor, ao persistir os dados, para inclusões e mudanças relevantes feitas por formulário, API, importação e pelos diferentes menus do módulo. Reutilizar o serviço de domínio que concentra essas alterações.

Não gerar outro evento de negócio quando apenas um recibo, horário de sincronização ou estado da fila for atualizado. Manter esses metadados separados ou excluídos dos gatilhos, evitando ciclos de exportação.

Não criar envio somente no `onClick` do navegador. Não depender de manter o painel aberto. Não exigir um botão "Exportar" no fluxo normal. Um botão de recuperação pode existir, identificado como excepcional.

Não excluir registros silenciosamente por estarem encerrados, inativos, em outro menu ou em outro exercício. A carga de um conjunto deve informar universo, recorte, pendências e exclusões justificadas.

**Rascunhos:** sincronizar como rascunhos, quando persistidos e representáveis, sem tratá-los como instrumento formalizado. Permitir número/datas ainda ausentes no schema de rascunho; exigir os dados pertinentes para o estado finalizado. Um registro não representável permanece em pendência explícita. O gatilho escolhido e os campos necessários de cada estado devem constar da documentação.

### 5.4. Alterações e histórico

Aditivo, apostilamento quando disponível, suspensão, rescisão e encerramento geram nova versão/evento, sem apagar o histórico. O receptor deve mostrar valor anterior/atual e o motivo da alteração, quando houver.

A atualização de contrato não altera automaticamente um empenho existente. Não transformar cancelamento cadastral em estorno contábil. Eventos contábeis continuam sujeitos ao serviço e às regras do núcleo responsável.

### 5.5. Carga inicial

Implementar uma carga inicial paginada e retomável para cadastros anteriores à ativação. Uma ação administrativa pode autorizar o início; a transmissão individual será automática.

Usar o mesmo normalizador, adaptador e validações do fluxo incremental. Guardar identificador do lote, limites/recorte, checkpoint e resultados por registro. Não marcar o lote concluído enquanto houver registros não confirmados sem explicação.

Mudanças durante a carga não podem substituir uma versão nova por antiga. Importações históricas devem ser identificadas como baseline de cadastro, sem reproduzir despesas antigas como atos novos.

---

## 6. Integração nativa e interface de adaptadores

### 6.1. Modo nativo

Se Compras e Contabilidade compartilham o cadastro de pessoas, a evidência é a disponibilização e utilização do registro pelo serviço contábil. Não criar uma cópia artificial ou registrar uma chamada HTTP inexistente para dizer que houve exportação.

O adaptador nativo deve retornar referência real do objeto/serviço, estado e tipo de evidência. Se faltar o serviço, informar a dependência; não retornar `success: true` por conveniência.

### 6.2. Contrato interno sugerido

Adaptar nomes ao repositório. Evitar `any`; validar os objetos também em tempo de execução.

```typescript
type SiaficProvider = 'native' | 'robonuvem_demo' | 'official_unconfigured';
type IntegrationEnvironment = 'DEMO' | 'HOMOLOGACAO' | 'PRODUCAO';
type ProcessingStatus = 'PROCESSED' | 'REJECTED' | 'RECEIVED_PENDING';

interface SiaficAdapter {
  readonly provider: SiaficProvider;
  capabilities(): ReadonlyArray<string>;
  healthcheck(): Promise<HealthResult>;
  send(event: ImmutableIntegrationEvent): Promise<DeliveryResult>;
  lookupReceipt(eventId: string): Promise<ReceiptLookupResult>;
  lookupEntity(reference: ScopedEntityReference): Promise<EntityLookupResult>;
}
```

Os tipos auxiliares devem ser implementados, não deixados como placeholders. `official_unconfigured` lança erro explícito `OFFICIAL_ADAPTER_NOT_CONFIGURED` antes de qualquer rede. Não implementar um "adaptador universal SIAFIC" que apenas aceite uma URL.

Reutilizar interfaces de integração já existentes quando equivalentes. Não importar código do receptor no bundle do navegador.

---

## 7. Persistência, fila e recuperação

### 7.1. Estruturas lógicas no CeleriFlow

Reutilizar tabelas existentes equivalentes. A tabela abaixo é modelo de responsabilidade, não ordem para criar tabelas redundantes.

| Estrutura | Conteúdo mínimo |
|---|---|
| Destinos/configuração | ID, adaptador, ambiente, URL permitida, referência do segredo, escopo e configuração versionada. |
| Eventos/outbox | ID, entidade, versão, tipo, instante, snapshot imutável, destino, dataset, revisão de entrega e hash. |
| Entregas | Estado, tentativas, próxima execução, lease, último erro, protocolo/ID externo, confirmação. |
| Tentativas | Início/fim, status HTTP, resultado sanitizado, duração, correlation ID e motivo. |
| Vínculos externos | ID canônico, destino/dataset, ID externo, última versão/hash confirmados. |
| Lotes/reconciliações | Recorte, checkpoint, contagens, divergências e execução. |

Vincular cada entrega à versão da configuração de destino e ao snapshot de mapeamento utilizado. Alterar a URL/configuração de um destino não pode redirecionar silenciosamente eventos já pendentes para outro receptor. Exigir ação administrativa explícita e preservar o histórico da migração de configuração. A rotação do segredo do mesmo destino não deve alterar a identidade de um evento.

Ajustar campos de unidade ao modelo existente, sem introduzir um novo sistema multi-tenant. `sourceInstanceId` identifica a implantação; não substitui a autorização por órgão/unidade.

### 7.2. Atomicidade local

Na mesma transação local, salvar o registro de negócio, sua versão e o evento de integração. Após o commit, tentar o envio por rotina de servidor com timeout limitado.

Não manter transação SQL aberta durante uma chamada HTTP. Uma falha externa não desfaz um cadastro local já confirmado; ele fica salvo, com integração pendente. Se a transação local falhar, o evento também deve ser revertido.

Para banco/driver que não suporte a transação necessária na forma utilizada, adaptar ao mecanismo transacional real da stack e testar rollback. Não chamar duas operações independentes de "transação".

### 7.3. Processamento concorrente

O despachante deve selecionar eventos vencidos, reservar trabalho com lease e impedir envio simultâneo descontrolado. Em PostgreSQL, avaliar transação curta com `FOR UPDATE SKIP LOCKED`, seguida de atualização da reserva e commit antes da rede. Esse recurso é apropriado para tabelas de trabalho concorrentes, não para relatórios de consistência geral. [S6]

Usar token de lease: uma tentativa antiga não pode sobrescrever o resultado de outra tentativa que assumiu o trabalho. Recuperar reservas vencidas após interrupção. Não depender de variável global em memória, arquivo local ou `setInterval` dentro de função serverless.

Ordenar mudanças da mesma entidade e respeitar dependências: a parte deve existir no receptor antes do contrato que a referencia. Paralelizar entidades independentes dentro de limites configurados.

### 7.4. Automatismo na infraestrutura existente

Implementar duas camadas:

**Envio imediato:** após o commit, o servidor tenta entregar o evento; a espera tem limite e o cadastro retorna com o estado correto.

**Recuperação autônoma:** um processador persistente/agendado consulta a outbox e retoma pendências mesmo sem navegador aberto.

A documentação da Vercel limita cron no Hobby a uma execução diária; Pro/Enterprise permitem intervalos menores. Não presumir qual plano o usuário possui. `waitUntil`/`after` não substituem fila persistente; o tempo de execução continua limitado. [S4] [S5]

Escolher e documentar uma opção realmente disponível:

- Aproveitar o worker/agendador existente, se confirmado e testado.
- Configurar cron autenticado compatível com o plano efetivamente disponível, com processamento em lotes limitados.
- Para POC sem agendador compatível, fornecer um **worker local persistente** em Node, executado por comando do projeto, que chama a rota autenticada de processamento periodicamente. Documentar que o processo deve permanecer em execução durante o ensaio.

O worker local não necessita da senha de nenhum banco; usa credencial de processamento restrita e URL permitida. Não adquirir serviço, mudar plano ou publicar infraestrutura sem autorização. Fornecer instruções de implantação quando o acesso não existir.

Não depender de polling da interface para executar a integração. Polling da interface serve somente para exibir o estado. Não vender o processo como autônomo se a recuperação só ocorre ao clicar em "Reprocessar".

### 7.5. Estados e reprocessamento

| Estado lógico | Significado |
|---|---|
| `PENDING` | Persistido para envio. |
| `WAITING_DEPENDENCY` | Aguardando parte/instrumento necessário. |
| `SENDING` | Tentativa com lease válido. |
| `RETRY_SCHEDULED` | Falha transitória; nova tentativa automática prevista. |
| `RECEIVED_PENDING` | Recebido, mas sem processamento final confirmado. |
| `PROCESSED` | Recibo válido e gravação/processamento do receptor confirmados. |
| `REJECTED` | Erro de negócio/dados; exige correção, não repetição infinita. |
| `AUTH_BLOCKED` | Credencial/escopo inválidos. |
| `CONFIRMATION_UNKNOWN` | Resultado incerto; consultar recibo/repetir com a mesma chave. |
| `SUPERSEDED` | Evento rejeitado substituído por correção identificada. |
| `NEEDS_REVIEW` | Limite de tentativas ou conflito que exige análise. |

Na UI, apresentar rótulos em português. `PROCESSED` cadastral significa **"Processado no receptor DEMO"**, nunca "Contabilizado".

Proposta de política de teste: timeout HTTP de 5 segundos; lease superior ao timeout; retentativas em 2, 5, 15, 60 e 300 segundos, com dispersão e teto. São parâmetros de implementação do ensaio, não prazos do edital. Respeitar `Retry-After` e limites do ambiente; nenhum laço infinito.

Antes de reprocessar resultado incerto, consultar o recibo por `eventId`. Se o receptor já confirmou, atualizar o vínculo local sem reenviar como novo registro. Se ainda não for possível confirmar, repetir a mesma mensagem com a mesma chave; a proteção de duplicidade do receptor decide.

---

## 8. Receptor externo: responsabilidades e integridade

### 8.1. O que deve existir de verdade

Implementar API, validações, banco persistente, histórico, painel autenticado e consultas. O painel deve continuar mostrando os registros após reiniciar/reimplantar a aplicação.

Estruturas mínimas sugeridas:

| Estrutura | Responsabilidade |
|---|---|
| Clientes/escopos de integração | Vincular credencial a instância, dataset e permissões. |
| Inbox/recibos | Registrar mensagem, chave, hash, resultado e protocolo de demonstração. |
| Pessoas recebidas | Estado atual, identidade de origem, papéis e ID local do receptor. |
| Instrumentos recebidos | Contratos/convênios e partes referenciadas. |
| Versões/eventos de instrumentos | Preservar modificações e seus dados originais. |
| Tentativas/auditoria | Registrar recepção e falhas sem expor segredos. |
| Cenários de teste | Configuração restrita de falhas controladas. |

Para uma mensagem válida: validar autorização e schema; iniciar transação; reservar a chave; verificar dependências/versão; gravar os dados e histórico; gravar o recibo final; commit; somente então responder sucesso.

Para uma mensagem rejeitada por regra de negócio: persistir o recibo de rejeição sem alterar a projeção de negócio. Falha técnica antes do commit não pode produzir um recibo final de sucesso.

### 8.2. Idempotência — repetir sem duplicar

Usar dois identificadores:

- `eventId`: identifica a mensagem lógica imutável.
- `Idempotency-Key`: identifica sua entrega repetível ao destino/dataset.

Gerar a chave a partir de instância, destino, dataset, tipo/ID da entidade, versão e revisão da entrega. Exemplo lógico: `SHA-256(sourceInstanceId|destinationId|datasetId|entityType|entityId|entityVersion|deliveryRevision)`. Incluir prefixo do protocolo. Não usar apenas número do contrato/ano nem gerar outra chave a cada tentativa.

No receptor, impor unicidade por cliente/dataset/chave e por cliente/dataset/evento. A consulta que antecede a inserção não basta: usar restrições e transação para controlar corrida entre requisições.

**Mesma chave + mesmo hash:** retornar o recibo original; não atualizar novamente o registro nem gerar novo protocolo de negócio.

**Mesma chave + corpo diferente:** responder `409 IDEMPOTENCY_CONFLICT`; não processar.

**Nova tentativa técnica:** conservar `eventId`, chave, snapshot, versão e corpo.

**Correção de dados rejeitados:** corrigir no domínio de origem, incrementar a versão de negócio e criar novo evento/chave com `replacesEventId`. Nunca editar o corpo da tentativa anterior.

**Correção somente de mapeamento:** incrementar `deliveryRevision`, gerar novo evento/chave e vincular o rejeitado. Não criar outra versão de negócio sem motivo. Se uma versão já tiver sido aceita com conteúdo divergente, interromper para reconciliação; não sobrescrever sob pretexto de correção.

### 8.3. Versões e vínculos

A identidade externa é a combinação do escopo autenticado, dataset, instância de origem, tipo e ID canônico. Nome, documento fiscal e número/ano do instrumento são atributos, não chaves exclusivas de integração.

Guardar `latestEntityVersion` e histórico. Um snapshot de versão inferior à já aplicada não pode reverter o estado atual: responder `409 STALE_VERSION` e indicar a versão observada. Classificar esse conflito como revisão/reconciliação, não como erro transitório para repetição infinita.

Uma carga inicial pode começar na versão atual da origem, identificada como `BASELINE`. Depois disso, enviar as mudanças ordenadas. Não apresentar baseline como histórico completo de escrituração. Não aplicar alteração de instrumento antes de existir sua parte; responder `409 DEPENDENCY_MISSING` com referência utilizável.

### 8.4. Sem atalhos na demonstração

O seed inicial do receptor conterá somente usuários de demonstração, clientes autorizados, unidades/catálogos indispensáveis e configuração. **Não pré-carregar os fornecedores/contratos que serão demonstrados como recebidos.**

Registros de comparação só entram pela API durante o ensaio ou por lote explicitamente identificado como integração. Não criar uma segunda cópia do seed de negócios diretamente na base do receptor e apresentá-la como transmissão.

---

## 9. Contrato HTTP do laboratório — API própria, não oficial

**Nome:** `ROBONUVEM-SIAFIC-DEMO`  
**Versão inicial:** `1.0`  
**Formato:** JSON UTF-8 sobre HTTPS no ambiente publicado.  
**Natureza:** contrato de demonstração criado para esta implementação. Não é leiaute do Tesouro nem da Prefeitura.

### 9.1. Rotas mínimas do receptor

| Método / rota proposta | Função | Autorização |
|---|---|---|
| `GET /api/demo/v1/health` | Saúde mínima, sem dados/segredos. | Pode ser público, resposta mínima. |
| `GET /api/demo/v1/capabilities` | Versão, receptor, ambiente e recursos disponíveis. | Credencial de integração. |
| `POST /api/demo/v1/events` | Receber e processar um evento. | Credencial de escrita do dataset. |
| `GET /api/demo/v1/receipts/by-event/{eventId}` | Consultar recibo final ou ausência. | Credencial vinculada ao mesmo escopo. |
| `GET /api/demo/v1/persons` | Consultar pessoas recebidas. | Leitura autenticada, com paginação. |
| `GET /api/demo/v1/instruments` | Consultar instrumentos recebidos. | Leitura autenticada, com paginação. |
| `GET /api/demo/v1/entities/{entityType}/{sourceEntityId}` | Consultar estado, versão e referência recebidos. | Leitura autenticada e escopada. |
| `GET /api/demo/v1/reconciliation` | Comparar IDs/versões/hashes do recorte. | Leitura autenticada e escopada. |

Os filtros de instância/dataset devem ser confrontados com a credencial e a sessão. Não permitir enumerar dados de outro escopo alterando a URL. Tratar cursor e limite, com teto de 100 registros por página e ordenação estável.

Rotas administrativas de seed, falhas e reset ficam fora desse contrato de integração, protegidas por autorização administrativa separada. Não oferecer reset via `GET`.

### 9.2. Cabeçalhos

```http
Authorization: Bearer <segredo-de-integracao-do-ambiente-demo>
Content-Type: application/json
Idempotency-Key: siafic-demo:<hash-estavel-da-chave>
X-Correlation-Id: <uuid-da-tentativa>
```

Os valores entre `<...>` são placeholders de documentação, nunca segredos ou cabeçalhos fixos de produção. `X-Correlation-Id` muda por tentativa; a chave de idempotência não muda. Não incluir segredo no corpo, query string, navegador, repositório ou evidência exportada.

### 9.3. Envelope obrigatório

| Campo | Regra |
|---|---|
| `protocol` / `protocolVersion` | Valores reconhecidos pelo receptor. |
| `environment` | `DEMO` neste adaptador; validar no servidor dos dois lados. |
| `eventId` | UUID estável da mensagem. |
| `sourceInstanceId` | Vinculado à credencial. |
| `datasetId` | Identifica este conjunto/execução; muda em novo ensaio após reset lógico. |
| `entityType` / `entityId` | `PERSON` ou `INSTRUMENT` e ID canônico. |
| `entityVersion` / `deliveryRevision` | Inteiros positivos; não usar data como única versão. |
| `eventType` | `person.snapshot` ou `instrument.snapshot`. |
| `operation` | `CREATE`, `UPDATE` ou `BASELINE`. |
| `occurredAt` | Instante de origem, não o instante do recebimento. |
| `dataClassification` | `SYNTHETIC_DEMO`. |
| `replacesEventId` | Nulo, ou referência à mensagem rejeitada corrigida. |
| `payload` | Snapshot tipado de pessoa/instrumento. |

Criar JSON Schemas ou validadores equivalentes, com união discriminada por evento e situação. Publicar `openapi.yaml` ou `openapi.json` e exemplos compatíveis. Rejeitar versão desconhecida; não remover campos necessários silenciosamente.

O hash de requisição deve ser calculado sobre o envelope serializado de forma determinística: chaves ordenadas recursivamente, ordem dos arrays preservada, UTF-8, sem espaços irrelevantes. Dinheiro permanece string. Usar a mesma função testada nas duas implementações; não incluir cabeçalhos, segredo ou correlation ID nesse hash.

### 9.4. Resposta de sucesso e validação pelo CeleriFlow

O receptor v1 processa sincronicamente: responde `201` após nova aplicação confirmada e `200` para repetição idempotente já processada. Um recibo contém:

- `receiverId`, `receiverEnvironment`, `protocol`, `protocolVersion`;
- `eventId`, `sourceInstanceId`, `datasetId`, `entityType`, `entityId`, `entityVersion`;
- `remoteEntityId`, `receiptId`, `processingStatus` e `processedAt`;
- `requestHash`, calculado sobre o envelope efetivamente recebido;
- `simulation: true` e aviso `SIMULADO — SEM VALIDADE OFICIAL`.

O CeleriFlow só confirma depois de validar status, schema, ambiente, IDs, versão, hash, receptor e `remoteEntityId`. Resposta `200` com HTML de login, corpo vazio ou `{ "success": true }` não satisfaz o contrato.

IDs e protocolos de exemplo não podem ser retornados fixamente pelo servidor. Devem corresponder ao registro e recibo realmente persistidos.

`202` não é emitido pelo receptor mínimo v1. Mesmo assim, o cliente deve tratá-lo como `RECEIVED_PENDING`, jamais como sucesso final. Testar esse comportamento com fixture de protocolo; suporte assíncrono completo do receptor só será adicionado se solicitado e implementado com processamento real.

### 9.5. Erros

| Situação | HTTP / código | Tratamento proposto |
|---|---|---|
| JSON inválido | `400 INVALID_JSON` | Corrigir implementação; não repetir indefinidamente. |
| Credencial ausente/inválida | `401 UNAUTHORIZED` | Bloquear configuração e preservar fila. |
| Escopo não autorizado | `403 FORBIDDEN_SCOPE` | Bloquear; não trocar de dataset para contornar. |
| Recibo não encontrado no escopo autorizado | `404 RECEIPT_NOT_FOUND` | Manter incerteza/repetir a mesma chave; ausência não é confirmação. |
| Mesmo identificador, corpo divergente | `409 IDEMPOTENCY_CONFLICT` | Revisão manual; nenhuma gravação de negócio. |
| Parte ainda não recebida | `409 DEPENDENCY_MISSING` | Integrar dependência e retomar o evento. |
| Versão antiga | `409 STALE_VERSION` | Reconciliar; não sobrescrever versão atual. |
| Schema/regra de negócio inválidos | `422 VALIDATION_ERROR` | Recibo de rejeição com campos; correção cria nova mensagem. |
| Limite de chamadas | `429 RATE_LIMITED` | Reagendar, respeitando `Retry-After`. |
| Indisponibilidade transitória | `503 TEMPORARILY_UNAVAILABLE` | Reagendar/consultar recibo se resultado incerto. |
| Timeout/erro de rede | Sem resposta confiável | `CONFIRMATION_UNKNOWN`; preservar a mesma chave. |
| Corpo/protocolo de retorno incorreto | `PROTOCOL_MISMATCH` local | Não confirmar; diagnosticar o destino. |

Registrar respostas sanitizadas. Falhas não podem atualizar o indicador para verde. O receptor pode informar códigos/campos úteis sem expor stack, SQL ou credenciais.


---

## 10. Exemplos de mensagens e recibo

Exemplos de dados exclusivamente sintéticos. Datas/IDs não são fatos municipais. Os IDs estáticos abaixo servem para um teste determinístico do contrato; o fluxo interativo gera seus eventos próprios e o receptor gera referências persistidas. Os testes devem reiniciar em outro dataset, não reutilizar indevidamente eventos antigos.

### 10.1. Fornecedor — CLC-008

```json
{
  "protocol": "ROBONUVEM-SIAFIC-DEMO",
  "protocolVersion": "1.0",
  "environment": "DEMO",
  "eventId": "cb412049-4cf7-5716-bd7f-8a7d2bdc4901",
  "sourceInstanceId": "CELERIFLOW-DEMO-01",
  "datasetId": "SIAFIC-POC-2026-RUN-001",
  "entityType": "PERSON",
  "entityId": "FOR-A",
  "entityVersion": 1,
  "deliveryRevision": 1,
  "eventType": "person.snapshot",
  "operation": "CREATE",
  "occurredAt": "2026-09-18T14:00:00-03:00",
  "dataClassification": "SYNTHETIC_DEMO",
  "replacesEventId": null,
  "payload": {
    "personKind": "PJ",
    "identity": {
      "type": "SYNTHETIC",
      "value": "DEMO-PJ-FOR-A"
    },
    "legalName": "Fornecedor Alfa — DEMONSTRAÇÃO",
    "roles": [
      "SUPPLIER"
    ],
    "registrationStatus": "ACTIVE",
    "sourceUnitCode": "UG-DEMO-01",
    "targetUnitCode": "UG-EXT-01",
    "email": "fornecedor-alfa@example.invalid"
  }
}
```

### 10.2. Contrato — CLC-052 e CLC-075

```json
{
  "protocol": "ROBONUVEM-SIAFIC-DEMO",
  "protocolVersion": "1.0",
  "environment": "DEMO",
  "eventId": "d6ac0de2-e6a0-5040-ac3f-55e067996aaa",
  "sourceInstanceId": "CELERIFLOW-DEMO-01",
  "datasetId": "SIAFIC-POC-2026-RUN-001",
  "entityType": "INSTRUMENT",
  "entityId": "CT-M",
  "entityVersion": 1,
  "deliveryRevision": 1,
  "eventType": "instrument.snapshot",
  "operation": "CREATE",
  "occurredAt": "2026-09-18T14:00:00-03:00",
  "dataClassification": "SYNTHETIC_DEMO",
  "replacesEventId": null,
  "payload": {
    "instrumentType": "CONTRACT",
    "number": "DEMO-001",
    "year": 2026,
    "sourceUnitCode": "UG-DEMO-01",
    "targetUnitCode": "UG-EXT-01",
    "processReference": "PROC-DEMO-001/2026",
    "object": "Aquisição fictícia de papel para ensaio de integração",
    "parties": [
      {
        "sourcePersonId": "FOR-A",
        "role": "SUPPLIER"
      }
    ],
    "signedOn": "2026-09-01",
    "validFrom": "2026-09-01",
    "validUntil": "2026-09-30",
    "status": "ACTIVE",
    "currency": "BRL",
    "initialAmount": "2260.00",
    "currentAmount": "2260.00",
    "items": [
      {
        "sourceItemId": "CT-M-L1",
        "description": "Resma de papel — DEMO",
        "unit": "RESMA",
        "quantity": "100.0000",
        "unitPrice": "22.6000",
        "totalAmount": "2260.00"
      }
    ],
    "changes": [],
    "documentReferences": []
  }
}
```

### 10.3. Convênio — cobertura complementar

```json
{
  "protocol": "ROBONUVEM-SIAFIC-DEMO",
  "protocolVersion": "1.0",
  "environment": "DEMO",
  "eventId": "cc954825-d82a-5426-a944-730d93deab03",
  "sourceInstanceId": "CELERIFLOW-DEMO-01",
  "datasetId": "SIAFIC-POC-2026-RUN-001",
  "entityType": "INSTRUMENT",
  "entityId": "CV-01",
  "entityVersion": 1,
  "deliveryRevision": 1,
  "eventType": "instrument.snapshot",
  "operation": "CREATE",
  "occurredAt": "2026-09-18T14:00:00-03:00",
  "dataClassification": "SYNTHETIC_DEMO",
  "replacesEventId": null,
  "payload": {
    "instrumentType": "AGREEMENT",
    "number": "DEMO-CV-001",
    "year": 2026,
    "sourceUnitCode": "UG-DEMO-01",
    "targetUnitCode": "UG-EXT-01",
    "processReference": "PROC-DEMO-CV-001/2026",
    "object": "Convênio fictício para atividades educacionais de demonstração",
    "parties": [
      {
        "sourcePersonId": "PAR-CV",
        "role": "AGREEMENT_COUNTERPART"
      }
    ],
    "grantorUnitCode": "UG-EXT-01",
    "signedOn": "2026-09-01",
    "validFrom": "2026-09-01",
    "validUntil": "2026-11-30",
    "status": "ACTIVE",
    "currency": "BRL",
    "initialAmount": "1000.00",
    "currentAmount": "1000.00",
    "transferAmount": "800.00",
    "counterpartAmount": "200.00",
    "items": [],
    "changes": [],
    "documentReferences": []
  }
}
```

### 10.4. Recibo de processamento do contrato do exemplo

```json
{
  "protocol": "ROBONUVEM-SIAFIC-DEMO",
  "protocolVersion": "1.0",
  "receiverId": "ROBONUVEM-SIAFIC-RECEIVER-DEMO-01",
  "receiverEnvironment": "DEMO",
  "eventId": "d6ac0de2-e6a0-5040-ac3f-55e067996aaa",
  "sourceInstanceId": "CELERIFLOW-DEMO-01",
  "datasetId": "SIAFIC-POC-2026-RUN-001",
  "entityType": "INSTRUMENT",
  "entityId": "CT-M",
  "entityVersion": 1,
  "remoteEntityId": "SIM-CT-000001",
  "receiptId": "SIM-SIAFIC-000001",
  "processingStatus": "PROCESSED",
  "processedAt": "2026-09-18T17:00:01Z",
  "requestHash": "sha256:acc87954ffc359ac4ce1031a060a87964f7406352cae5f5ef50a3fa8ee681014",
  "simulation": true,
  "notice": "SIMULADO — SEM VALIDADE OFICIAL"
}
```

Antes de transmitir o convênio, integrar a pessoa `PAR-CV` a partir do CeleriFlow. O mapeamento de unidades `UG-DEMO-01` → `UG-EXT-01` é um catálogo de teste, não código de uma prefeitura. O `requestHash` do recibo acima foi calculado sobre o envelope do contrato do exemplo com a serialização descrita; qualquer mudança no envelope exige novo cálculo.

---

## 11. Telas e experiência de demonstração

### 11.1. No CeleriFlow

Reutilizar a Central de Integrações existente. Criar uma seção **Integração Contábil / SIAFIC**, não um módulo financeiro concorrente.

**Configuração:** adaptador, ambiente, receptor, URL permitida, credencial mascarada, unidade/de-para, versão de contrato e estado do processador automático. Testar conexão deve verificar a identidade/capacidades do receptor; um `health` positivo não significa que todos os cadastros estão integrados.

**Fila:** entidade, versão, operação, origem, destino, estado, tentativas, próxima tentativa, último retorno, protocolo e links para o registro de origem/destino. Filtros por tipo, período, estado e lote; paginação. Totais calculados sobre o conjunto filtrado, não apenas sobre a página.

**Detalhe:** snapshot enviado, resposta sanitizada, hash, datas, duração, tentativas, causa de rejeição e eventos substitutos. Restringir dados conforme permissões.

**Reconciliação:** universo do recorte, confirmados, ausentes, desatualizados, rejeitados, pendentes e divergentes. Mostrar fornecedores, contratos e convênios separadamente. Não apresentar apenas um percentual global sem denominador.

**Nos cadastros de origem:** acrescentar indicador discreto e link para o estado de integração. Não duplicar formulário. Se a última versão ainda não foi confirmada, mostrar "Atualização pendente" mesmo que uma versão anterior tenha sucesso.

**Ações:** testar conexão; autorizar carga inicial; consultar recibo; reprocessar erro transitório autorizado; exportar evidências. Não oferecer "Marcar como integrado".

### 11.2. No receptor DEMO

Título permanente: **Receptor SIAFIC — Robonuvem DEMO**.

Aviso visível em cabeçalho, detalhes e exportações:

> Ambiente simulado para demonstração de interoperabilidade. Não conectado ao SIAFIC da Prefeitura. Dados fictícios. Protocolos sem validade oficial.

Áreas mínimas:

| Área | O que exibir |
|---|---|
| Visão geral | Identidade do receptor, dataset, versão, registros recebidos e última recepção. |
| Fornecedores / partes | Identificação de origem, nome, papéis, situação, ID local e histórico. |
| Contratos | Número, parte, objeto, valor, vigência, situação, versão e origem. |
| Convênios | Instrumento, partes/papéis, valores e situação, sem mistura com compras. |
| Recebimentos | Evento, protocolo DEMO, hash, processamento e tentativas. |
| Cenários de teste | Falhas controladas, apenas para administrador do laboratório. |

Os detalhes devem vir do banco do receptor. Links de origem não substituem os dados recebidos. O painel não precisa de editor manual de fornecedor/contrato: isso enfraqueceria a demonstração de origem automática. Permitir consulta e filtro é suficiente.

### 11.3. Identidade e acessibilidade

Preservar identidade visual e componentes do CeleriFlow na origem. Usar identidade Robonuvem de laboratório no receptor, sem logotipo de concorrente ou aparência de portal oficial municipal. Não inventar logos/selos de homologação.

Rótulos completos em português; estados de erro não dependem somente de cor; datas e valores legíveis; contraste e navegação por teclado. Priorizar tabelas paginadas, não dashboards cheios de cartões ilustrativos. Não adicionar animações/contadores aleatórios para simular tráfego.

---

## 12. Segurança, isolamento e dados de demonstração

### 12.1. Credenciais e permissões

Toda comunicação de integração é servidor-servidor. Não colocar token em variável `NEXT_PUBLIC_*`, código React, localStorage, query string ou print. Usar segredo criptograficamente aleatório, por ambiente/cliente, revogável; o receptor pode guardar sua representação hash.

Separar permissões: configurar integração; operar/reprocessar; visualizar evidência; administrar simulador. A credencial que transmite cadastros não pode mudar cenários, fazer seed, resetar base ou promover permissões.

No CeleriFlow, preservar autenticação/autorização existentes. No receptor, usar autenticação própria de demonstração ou mecanismo já disponível e testado, com sessão de leitura para avaliador e sessão administrativa distinta. Não criar conta genérica que se passe por usuário oficial do SIAFIC. Esses acessos demonstrativos não comprovam os requisitos de identificação de usuários do núcleo oficial.

Validar autorização no servidor para todas as rotas. Proteger operações administrativas contra CSRF quando usarem cookies. Aplicar limites de corpo, paginação, requisições e tamanho de mensagens em log.

### 12.2. URL e prevenção de acesso indevido

A URL externa deve estar em allowlist administrada no servidor. Exigir HTTPS no ambiente publicado; permitir HTTP apenas para endereço de loopback no desenvolvimento local controlado. Rejeitar credenciais embutidas, redirecionamento para outro host, endereços internos indevidos e destinos de metadados da infraestrutura. Conferir resolução do host conforme a estratégia adotada, sem confiar somente no texto informado. Referência: [S7].

Não implementar uma função de "teste de conexão" que aceite qualquer URL enviada pelo navegador. Os mesmos controles valem para consultar recibos e abrir URLs retornadas pelo receptor. Preferir construir links a partir da base configurada e do ID, não confiar em URL arbitrária da resposta.

### 12.3. Barreiras entre DEMO e produção

O adaptador `robonuvem_demo` só funciona quando o ambiente e a classificação dos dados forem de demonstração. Se `APP_ENV=PRODUCAO`, recusar seu uso no servidor, mesmo que o cliente altere o payload.

O receptor recusa mensagens sem `environment=DEMO` e sem `dataClassification=SYNTHETIC_DEMO`. Não autorizar dados reais apenas porque um usuário alterou esses campos: restringir o ambiente de origem e sua credencial, e operar em base exclusiva de ensaio.

Previews e branches não devem herdar credenciais de produção. Seeds/testes destrutivos não rodam em `build`, `postinstall`, migration automática ou inicialização da aplicação.

### 12.4. Política de dados fictícios

Preferir nomes, documentos de suporte e transações integralmente sintéticos. Não copiar contratos reais de outros clientes por padrão. Usar dados de terceiros somente em fluxo específico autorizado e anonimizado, fora do seed inicial desta entrega.

**CPF/CNPJ:** não colocar documento real da Robonuvem, de pessoa física, da Prefeitura ou de fornecedores em fixtures públicas. Nos exemplos deste arquivo, `identity.type=SYNTHETIC` e os valores `DEMO-*` são identificadores reservados do laboratório, não CPF/CNPJ válidos.

Manter as validações de produção intactas. Para o fluxo interativo DEMO, usar um perfil de fixture autorizado no servidor, restrito ao ambiente, ao dataset e a identidades reservadas previamente cadastradas. Não aceitar documento inválido arbitrário nem desabilitar globalmente a validação fiscal. Exibir "Identificação sintética de teste" em vez de chamar o identificador reservado de CNPJ.

Se o cadastro atual já tiver fixtures sintéticas compatíveis, reutilizar sua política e registrar como funcionam. Os testes específicos de formato CPF/CNPJ são separados e não devem consultar serviços externos. A demonstração com identidade sintética comprova o transporte dos campos implementados, não valida a identidade fiscal de uma empresa.

E-mails: usar domínios não roteáveis de exemplo. Desabilitar disparos de e-mail, PNCP, Receita Federal, bancos e demais destinos reais no laboratório. Não gerar nota fiscal ou documento oficial a partir dos testes.

---

## 13. Fixtures e cenários reproduzíveis

### 13.1. Conjunto principal

Namespace lógico: `SIAFIC-POC-2026`. Cada execução recebe `datasetId` novo, como `SIAFIC-POC-2026-RUN-001`.

Reutilizar os aliases de fixtures do MD de Compras quando existirem. **Aliases não obrigam a trocar o tipo de chave primária do banco.** Se o ERP usa UUID, manter UUID e registrar o mapa alias → ID real. Atualizar os exemplos enviados para usarem os IDs efetivos.

| Alias | Dado de teste | Valor / finalidade |
|---|---|---|
| UG-DEMO-01 | Unidade de demonstração da origem. | De-para para UG-EXT-01 do receptor. |
| FOR-A | Fornecedor Alfa — DEMONSTRAÇÃO. | Parte do contrato de materiais. |
| FOR-B | Fornecedor Beta — DEMONSTRAÇÃO. | Parte do contrato de serviços. |
| PAR-CV | Organização Parceira — DEMONSTRAÇÃO. | Parte do convênio, com papel próprio. |
| CT-M | Contrato de materiais. | 100 resmas × R$ 22,60 = R$ 2.260,00. |
| CT-S | Contrato de serviços. | 10 horas × R$ 110,00 = R$ 1.100,00. |
| CV-01 | Convênio demonstrativo. | R$ 1.000,00; R$ 800,00 + R$ 200,00 de composição sintética. |
| ALT-CT-M | Alteração do contrato de materiais. | +10 resmas; acréscimo R$ 226,00; total R$ 2.486,00. |

Usar um cenário/cópia independente para o aditivo se a demonstração financeira nativa precisar preservar CT-M com R$ 2.260,00. Não misturar saldos de execuções diferentes. Os valores são massas de teste; não são parâmetros de permissibilidade jurídica de aditivos.

### 13.2. Preparação dos dados

Entregar duas preparações:

**Ensaio ao vivo:** criar somente catálogos/usuários e modelos de preenchimento; os fornecedores e instrumentos serão salvos durante a demonstração. Receptor começa sem esses registros.

**Carga inicial:** em outro dataset, cadastrar na origem um conjunto prévio usando os serviços de domínio, com integração ainda não ativada; depois ativar e executar a carga inicial automática. Receptor começa vazio de negócios.

O comando de seed deve ser idempotente, condicionado ao ambiente e ao dataset, e produzir um manifesto. Não reutilizar o próprio seed para marcar recibos de integração como processados.

### 13.3. Massa de paginação

Criar um cenário com 125 fornecedores sintéticos e 125 contratos de baixo volume, vinculados corretamente. Usar páginas menores que o conjunto, por exemplo 50. Confirmar que a origem e o receptor tratam todas as páginas.

Além de contagem, comparar IDs, versões e hashes normalizados. Dois conjuntos com mesma quantidade podem estar divergentes. Não confundir quantidade de recibos com quantidade de entidades: alterações e tentativas aumentam recibos/histórico sem criar novos contratos.

### 13.4. Reset seguro

Preferir **novo dataset**, preservando o anterior para auditoria. Pausar processamento do conjunto anterior, criar o novo, configurar ambos os lados, conferir escopos e só então iniciar o novo ensaio.

Não apagar o receptor isoladamente e deixar a origem acreditando que tudo continua confirmado. Se houver reset físico para desenvolvimento local, exigir ambiente exclusivo, confirmação administrativa, escopo explícito e nova geração do dataset. Nunca oferecer exclusão massiva de dados produtivos.

### 13.5. Falhas controladas

Implementar no receptor, somente para administrador do laboratório:

| Cenário | Comportamento verificável |
|---|---|
| NORMAL | Processa e devolve recibo após commit. |
| FAIL_BEFORE_COMMIT_ONCE | Próxima mensagem selecionada retorna 503 sem alterar negócio. |
| FAIL_AFTER_COMMIT_ONCE | Grava negócio/recibo, mas responde 503 naquela tentativa; consulta posterior encontra o recibo. |
| RATE_LIMIT_ONCE | Responde 429 com `Retry-After`. |
| REJECT_FIELD_RULE | Rejeita por regra/campo configurado no cenário; recibo fica registrado. |
| TEMPORARY_UNAVAILABLE | Mantém indisponibilidade até desativação autorizada. |

Vincular a falha ao dataset e ao próximo evento/entidade escolhidos; evitar uma configuração global que afete outras demonstrações. Registrar ativação, duração, aplicação e desativação.

A rejeição de negócio não se transforma em sucesso ao reenviar a mesma mensagem. Corrigir dado/mapeamento e produzir a nova revisão descrita na seção 8. A falha depois do commit é intencionalmente um resultado incerto para testar confirmação, não uma licença para mostrar sucesso sem recibo.

Erros 401/403 devem ser testados com credencial/escopo de teste realmente incorretos. Conflito de hash e versão devem ser testados com mensagens controladas. Não adicionar um botão que altere arbitrariamente o resultado local para "aprovado".

---

## 14. Testes de aceitação do desenvolvimento

Estes são critérios técnicos propostos pela Robonuvem para esta entrega; **não são o roteiro oficial da comissão**. Registrar execução real, ambiente, commit e evidências.

Legenda: **P0** = núcleo obrigatório desta implementação; **N** = teste nativo/dependência do núcleo já existente; **C** = robustez/complemento a executar após o fluxo principal. Uma dependência não testada não pode ser contada como teste aprovado.

### 14.1. Fluxos principais

| ID | Prioridade | Execução | Resultado esperado |
|---|---|---|---|
| T01 | P0 | Salvar FOR-A pelo formulário real de Compras. | Evento persistido; chamada HTTP; pessoa disponível no receptor; recibo/vínculo na origem. |
| T02 | P0 | Alterar campo permitido do fornecedor e salvar. | Mesmo ID externo, nova versão/histórico, sem segundo fornecedor. |
| T03 | P0 | Inativar FOR-A em cenário próprio. | Situação atualizada; histórico preservado; nenhum ato financeiro criado. |
| T04 | P0 | Cadastrar CT-M pelo fluxo real. | Contrato recebido com parte, objeto, valores, itens e vigência. |
| T05 | P0 | Cadastrar CT-S pelo outro ponto de entrada de instrumentos existente. | Mesmo pipeline cobre a entrada; evidência própria para CLC-075. |
| T06 | P0 | Integrar PAR-CV e cadastrar CV-01. | Convênio recebido como AGREEMENT, com parte/papel correto. |
| T07 | P0 | Executar alteração ALT-CT-M em cenário separado. | Total R$ 2.486,00, versão anterior preservada, sem outro contrato ou alteração automática de empenho. |
| T08 | P0 | Suspender/rescindir instrumento de teste com motivo/data. | Estado/histórico correspondente no receptor, sem apagar original. |
| T09 | P0 | Criar/editar fornecedor ou contrato por API/importação autorizada. | Mesmo disparo automático; não depende do componente React. |
| T10 | P0 | Salvar e fechar todas as abas antes da retomada da fila. | Worker processa sem navegador e sem botão manual. |
| T11 | P0 | Reiniciar/reimplantar receptor e consultar. | Registros e recibos continuam presentes no banco próprio. |
| T12 | P0 | Carga inicial com cadastro ativo, inativo, encerrado e rascunho. | Todos contabilizados na cobertura; estados preservados; pendências explícitas. |
| T13 | C | Carga com 125 pessoas e 125 contratos e páginas de 50. | Nenhuma página omitida; conjunto integral comparado, sem só contar linhas. |

### 14.2. Integridade e falhas

| ID | Prioridade | Execução | Resultado esperado |
|---|---|---|---|
| T14 | P0 | Reenviar exatamente o evento de CT-M com a mesma chave. | Mesmo recibo/ID externo, nenhum contrato adicional. |
| T15 | P0 | Enviar duas requisições idênticas simultâneas. | Restrições/transação impedem duplicidade e preservam um resultado de negócio. |
| T16 | P0 | Mesma chave com valor alterado. | 409; registro anterior intacto. |
| T17 | P0 | FAIL_BEFORE_COMMIT_ONCE. | Falha fica pendente; worker retoma; um registro final. |
| T18 | P0 | FAIL_AFTER_COMMIT_ONCE. | Origem consulta recibo e confirma sem criar segundo registro. |
| T19 | P0 | Encerrar worker após reservar trabalho e antes de concluir. | Lease vence e outro processamento retoma, sem perder evento. |
| T20 | P0 | Receptor rejeita regra de mapeamento; corrigir revisão. | Rejeição preservada; novo evento/chave vinculado ao anterior; posterior confirmação verdadeira. |
| T21 | P0 | Contrato referencia parte ainda não integrada. | Aguardar/integrar dependência; não inserir contrato com vínculo quebrado. |
| T22 | P0 | Tentar aplicar versão 1 após versão 2. | Estado atual não retrocede; conflito identificado/reconciliável. |
| T23 | P0 | Simular rollback da transação local. | Nem registro local nem evento são confirmados. |
| T24 | P0 | Retorno 200 com HTML, hash errado ou `eventId` diferente. | Não marcar PROCESSED; registrar incompatibilidade. |
| T25 | P0 | Fixture de retorno HTTP 202. | RECEIVED_PENDING; não apresentar confirmação final. |
| T26 | C | 429 com Retry-After e 503 repetido. | Reagendamento limitado; sem laço agressivo; sem verde falso. |
| T27 | C | Alterar registro na origem durante carga inicial. | Última versão preservada; baseline antigo não a sobrescreve. |
| T28 | C | Remover/alterar controladamente projeção no receptor DEMO. | Reconciliação identifica ID ausente/divergente; não apenas mesma contagem. |
| T29 | C | Repetir consulta/reset em outro dataset. | Sem mistura de vínculos, recibos ou dados entre execuções. |

### 14.3. Segurança e regressão

| ID | Prioridade | Execução | Resultado esperado |
|---|---|---|---|
| T30 | P0 | Chave ausente/incorreta e usuário sem permissão. | 401/403 reais; nenhum dado transmitido/exposto. |
| T31 | P0 | Alterar sourceInstanceId/datasetId para outro escopo. | Rejeição, inclusive em consultas de recibos e entidades. |
| T32 | P0 | Usar token de integração em seed/reset/cenários. | Operação administrativa negada. |
| T33 | P0 | Procurar token em bundle, logs, URL e exportação. | Nenhum segredo exposto. |
| T34 | P0 | Ativar robonuvem_demo em APP_ENV=PRODUCAO. | Bloqueio de servidor antes da transmissão. |
| T35 | P0 | Configurar URL fora da allowlist ou redirecionamento indevido. | Bloqueio; não alcançar rede interna/metadados. |
| T36 | P0 | Cadastrar documento fiscal inválido no fluxo normal de produção em teste isolado. | Validação existente preservada; fixture DEMO não abre exceção geral. |
| T37 | P0 | Executar build com feature flag desativada. | ERP continua funcional; simulador não integra bundle/rotas principais. |
| T38 | P0 | Rodar regressão de fornecedores, contratos e permissões. | Sem cadastro duplicado ou escrita fora do domínio competente. |

### 14.4. Testes nativos e continuidade financeira

| ID | Prioridade | Execução | Resultado esperado |
|---|---|---|---|
| T39 | N | Cadastrar fornecedor em Compras e selecionar no núcleo contábil. | Mesma identidade real utilizável, sem recadastro. |
| T40 | N | Vincular CT-M/CT-S às operações do núcleo. | Referências corretas; integração nativa não fabrica chamada externa. |
| T41 | N | Empenhar AE válidas de R$ 2.260,00 e R$ 1.100,00 pelos serviços existentes. | R$ 3.360,00 de empenhos de teste no núcleo competente; retornos reais. |
| T42 | N | Liquidar R$ 1.356,00 e R$ 440,00 com ateste/documentos de teste. | R$ 1.796,00 de liquidações efetivas; diferença de R$ 1.564,00 não é saldo bancário. |
| T43 | N | Repetir solicitação de empenho/liquidação. | Não duplicar atos; preservar as regras do módulo responsável. |
| T44 | N | Indisponibilizar serviço contábil. | Pendência/erro real; receptor cadastral não substitui o ato faltante. |

Em T41/T42, reutilizar as regras e os documentos do núcleo atual. Não programar números de empenho/liquidação fixos para fazer o teste passar. Se o núcleo não suportar a operação, registrar a lacuna; não considerar o simulador cadastral suficiente para esses itens.

### 14.5. Automação dos testes

Usar o framework já adotado pelo projeto. Incluir testes unitários para serialização/hash, de-para, estados e validações; testes de integração com bancos isolados; testes de contrato HTTP; e ao menos um teste ponta a ponta entre os dois processos.

Teste ponta a ponta não pode usar um mock de `fetch` para fingir o servidor remoto. Mocks ficam identificados nos testes unitários. Usar banco efêmero/de teste e servidor HTTP real ou ambientes DEMO autorizados; nunca banco produtivo.

Gerar relatório com `PASSOU`, `FALHOU`, `BLOQUEADO` ou `NAO_EXECUTADO`, a evidência e o motivo. Não converter teste pulado em aprovado nem depender apenas de screenshot para comprovar persistência.

---

## 15. Roteiro para a apresentação à comissão

### 15.1. Preparação antes de iniciar a apresentação

Conferir os dois ambientes e suas URLs reais; autenticação do apresentador e do avaliador; dataset ativo; receptor sem os registros que serão criados; unidades/de-para; worker em execução; flags de demonstração; destinos oficiais bloqueados; logs/evidências sem segredos.

Abrir duas abas claramente identificadas: **CeleriFlow** e **Receptor SIAFIC — Robonuvem DEMO**. A aba do receptor deve usar seu endereço e sua base próprios. Testar novamente a persistência após recarregar a página.

Não desativar segurança, apagar banners ou mudar o nome do simulador para o nome do fornecedor da Prefeitura durante a avaliação.

### 15.2. Fala de abertura sugerida

> Como não foram disponibilizadas credenciais do sistema municipal, esta demonstração utiliza um receptor externo de teste da Robonuvem e dados fictícios. Vamos executar o cadastro no CeleriFlow, a transmissão automática, o recebimento, a validação, a gravação e o retorno. O ambiente não está conectado ao SIAFIC da Prefeitura e não representa homologação com o fornecedor atual.

Essa fala descreve o procedimento adotado. Não atribuir autorização formal à comissão nem apresentar o telefonema como mudança contratual.

### 15.3. Sequência principal

| Passo | Ação do apresentador | O que deve aparecer |
|---|---|---|
| 1 | Mostrar configuração e conexão do receptor. | Nome DEMO, ambiente, versão e saúde. Explicar que saúde não é prova de exportação. |
| 2 | Mostrar ausência de FOR-A no receptor; cadastrar FOR-A em Compras e salvar. | Envio automático na origem; registro novo no receptor. Sem clicar em Exportar. |
| 3 | Abrir detalhes da pessoa recebida e da integração. | Mesmo ID de origem, ID externo, campos, horário e recibo. Evidência CLC-008. |
| 4 | Cadastrar CT-M no módulo e abrir no receptor. | Objeto, fornecedor, 100 resmas, R$ 2.260,00, vigência e vínculo. Evidência CLC-052. |
| 5 | Cadastrar FOR-B e CT-S pelo caminho de Contratos. | Contrato de R$ 1.100,00 recebido pela mesma integração. Evidência CLC-075. |
| 6 | Cadastrar PAR-CV e CV-01. | Convênio de R$ 1.000,00, com partes/papéis próprios. Cobertura complementar. |
| 7 | Em cenário separado, alterar CT-M com +10 resmas. | Mesmo instrumento, versão anterior e total R$ 2.486,00; sem novo contrato. |
| 8 | Consultar/repetir controladamente o evento já confirmado. | Mesmo registro e recibo; nenhuma duplicidade. Identificar como teste de recuperação. |
| 9 | Ativar falha antes do commit para uma nova alteração de teste. | Falha explícita e retentativa automática; posterior recebimento real. |
| 10 | Exibir a reconciliação e exportar evidências. | IDs/versões concordantes, diferenças explicadas e protocolos DEMO. |

Durante o passo 9, o operador não deve usar "Reprocessar" como condição de recuperação: mostrar o worker autônomo. O botão pode ser explicado depois como ferramenta de suporte.

Para provar independência, fechar/reabrir a aba do receptor e conferir o mesmo registro; o estado deve vir da base de destino. Para provar automatismo, executar T10 previamente e manter sua evidência disponível.

### 15.4. Continuidade nativa, quando solicitada

Mostrar o fornecedor/contrato na Contabilidade do próprio CeleriFlow e, se o serviço estiver implementado, o fluxo real de autorização, empenho, ateste e liquidação do ensaio nativo.

Identificar o destino responsável por cada ato. Não chamar o cadastro no receptor de "empenho" nem apresentar o mesmo evento como dois registros contábeis oficiais. Não usar o Banco Virtual nesta sequência a menos que outro requisito bancário esteja sendo avaliado separadamente.

### 15.5. Pacote de evidências

Gerar pelo sistema um pacote acessível com:

- Relatório Markdown ou HTML de execução, indicando ambiente DEMO, dataset, build/commit, data, responsável e roteiro aplicado.
- JSON/CSV sanitizado de entidades, versões, eventos, tentativas, recibos e reconciliação.
- Capturas das telas da origem e do receptor associadas aos IDs dos testes, quando o runner permitir.
- Manifesto dos arquivos, seus hashes, resultado real dos testes e limitações.

Todas as peças devem indicar a simulação. Remover tokens, cookies, senhas, URLs assinadas e dados não necessários. Hash ajuda a comparar integridade; não chamar o pacote de prova criptográfica de origem oficial ou assinatura digital.

Marcar separadamente `EVIDENCIA_DE_TRANSPORTE`, `EVIDENCIA_DE_PERSISTENCIA_REMOTA`, `EVIDENCIA_DE_USO_NATIVO` e `EVIDENCIA_CONTABIL`, conforme o que realmente foi executado.

---

## 16. Configuração e execução

Os nomes abaixo são uma proposta. Reutilizar os nomes existentes quando adequados e entregar `.env.example` consistente com o código real. O boot não deve aceitar placeholders como segredos válidos.

### 16.1. Variáveis do CeleriFlow

```dotenv
# Exemplo do ERP de demonstração. Não contém credenciais reais.
APP_ENV=DEMO
SIAFIC_ENABLED=false
SIAFIC_PROVIDER=robonuvem_demo
SIAFIC_SOURCE_INSTANCE_ID=CELERIFLOW-DEMO-01
SIAFIC_DATASET_ID=SIAFIC-POC-2026-RUN-001
SIAFIC_RECEIVER_BASE_URL=https://receptor-siafic.example
SIAFIC_ALLOWED_HOSTS=receptor-siafic.example
SIAFIC_API_TOKEN=__CONFIGURAR_SEGREDO_DE_INTEGRACAO__
SIAFIC_PROTOCOL_VERSION=1.0
SIAFIC_HTTP_TIMEOUT_MS=5000
SIAFIC_WORKER_BATCH_SIZE=25
SIAFIC_WORKER_LEASE_SECONDS=30
SIAFIC_WORKER_TOKEN=__CONFIGURAR_SEGREDO_DIFERENTE__
SIAFIC_DEMO_FIXTURES_ENABLED=false
```

O endereço `.example` é placeholder e não deve ser usado como destino executável. `SIAFIC_ENABLED=false` é o padrão seguro; ativar somente depois de configurar e validar o ambiente. Ler booleanos estritamente, sem considerar a string `"false"` como verdadeira.

O banco do CeleriFlow e Firebase continuam configurados pelos mecanismos existentes. Não duplicar suas variáveis à toa. Não colocar o segredo do receptor em campo acessível ao navegador; a configuração pode apenas indicar sua existência e permitir rotação autorizada.

### 16.2. Variáveis do receptor

```dotenv
# Exemplo da aplicação separada de laboratório.
APP_ENV=DEMO
SIAFIC_RECEIVER_ID=ROBONUVEM-SIAFIC-RECEIVER-DEMO-01
SIAFIC_PROTOCOL_VERSION=1.0
SIAFIC_RECEIVER_DATABASE_URL=__CONFIGURAR_BANCO_EXCLUSIVO_DEMO__
SIAFIC_ALLOWED_SOURCE_INSTANCE=CELERIFLOW-DEMO-01
SIAFIC_ALLOWED_DATASET=SIAFIC-POC-2026-RUN-001
SIAFIC_CLIENT_TOKEN_HASH=__CONFIGURAR_HASH_DO_TOKEN_AUTORIZADO__
SIAFIC_FAULT_INJECTION_ENABLED=false
SIAFIC_DEMO_ADMIN_ACTIONS_ENABLED=false
SIAFIC_MAX_BODY_BYTES=262144
```

Credenciais de autenticação da interface e chaves de sessão devem seguir o mecanismo adotado. Documentar sua criação sem inserir senhas no arquivo. `SIAFIC_CLIENT_TOKEN_HASH` é configuração do receptor; o cliente transmite o token, não o hash como substituto de autenticação.

### 16.3. Rotas internas/worker do CeleriFlow

Prever uma rota restrita de processamento em lotes e comandos documentados para:

| Comando lógico a entregar | Responsabilidade |
|---|---|
| `siafic:validate-config` | Validar ambiente, variáveis, destino, schema e credenciais sem imprimir segredos. |
| `siafic:prepare-demo` | Preparar unidades, identidades de teste e manifesto em base permitida. |
| `siafic:worker` | Executar processador persistente para a POC quando não houver agendador adequado. |
| `siafic:reconcile` | Conferir o dataset no receptor por API autenticada. |
| `test:siafic` | Rodar testes unitários/contrato/integração isolados. |
| `test:siafic:e2e` | Rodar fluxo real entre origem e receptor de teste. |

Os nomes só serão considerados entregues quando existirem em scripts/configuração. Usar o gerenciador de pacotes identificado no projeto; não inventar comandos na documentação final.

O worker deve encerrar corretamente com sinal de término, registrar falhas sem segredo, usar limites de concorrência e não assumir que um processo morto finalizou o evento. O novo processo recupera leases expirados.

Se usar Vercel Cron, implementar a autenticação recomendada para sua rota e a lógica própria de reprocessamento; a documentação informa que uma execução cron com falha não é automaticamente repetida pela plataforma. [S8]

### 16.4. Implantação

Entregar instruções passo a passo para criar/selecionar o projeto independente do receptor, configurar sua pasta-raiz, instalar dependências pelo lockfile, configurar banco DEMO, aplicar migrations não destrutivas, criar acessos, definir URLs e publicar somente com autorização.

Documentar também execução local de dois processos em portas diferentes, com bancos/credenciais separados, para validar antes da publicação. Em local, permitir loopback somente pelo perfil de desenvolvimento explícito.

Não presumir que o agente tem permissão de criar repositório, projeto Vercel, banco Neon ou DNS. Na ausência de acesso, produzir o código e as instruções, registrar `IMPLANTACAO_PENDENTE` e continuar os testes locais possíveis. Não declarar aplicação publicada por existir um projeto compilável.

### 16.5. Migrações e reversão

Preferir mudanças aditivas. Criar índices para consultas de fila, escopo, vínculos e unicidade. Registrar backup/checkpoint conforme as rotinas existentes antes de qualquer alteração autorizada em ambiente com dados.

A reversão operacional consiste em desativar o adaptador/worker e preservar eventos/vínculos para análise; não excluir cadastros de negócio. Não reverter um ato contábil apagando linha. Testar o comportamento da feature flag desligada.

---

## 17. Ordem de implementação para o Codex

### Fase A — diagnóstico e contrato

Inspecionar o repositório, registrar o que pode ser reutilizado, localizar serviços de domínio e permissões. Definir os mapeamentos reais entre campos existentes e o envelope. Criar schemas/OpenAPI e fixtures de contrato. Não iniciar refatoração ampla.

**Saída verificável:** diagnóstico, mapa de arquivos/campos, contrato validável e testes de serialização/hash.

### Fase B — fluxo externo completo de uma pessoa

Criar configuração protegida, outbox, despachante, adaptador e receptor persistente. Ligar o evento ao cadastro real de fornecedor. Implementar retorno, consulta de recibo e prevenção de duplicidade. Não construir primeiro dezenas de telas sem integração funcionando.

**Saída verificável:** T01, T14, T17, T18 e T30 executados entre dois processos.

### Fase C — contratos, convênios e atualização

Reutilizar a infraestrutura para instrumentos, partes, versões e alterações. Cobrir todos os pontos de entrada e importação. Criar de-para de unidade e tratamento de dependências. Preservar rascunhos e inativos com estados explícitos.

**Saída verificável:** T04–T09 e T21–T22; rastreabilidade distinta para CLC-052/075.

### Fase D — operação automática e visibilidade

Finalizar worker/agendamento real, central de filas, painel independente, carga inicial, reconciliação e cenários controlados. Executar testes sem navegador, de interrupção, persistência, autorização e segregação.

**Saída verificável:** processamento recuperável e painéis alimentados por dados reais dos dois bancos.

### Fase E — integração nativa e ensaio

Conectar/verificar o adaptador nativo nos serviços existentes. Executar os testes nativos cabíveis, preservar as lacunas que exigem outro módulo e produzir a matriz de evidências. Ensaiar o roteiro da seção 15.

**Saída verificável:** relatório com o que foi demonstrado externamente, nativamente, contabilmente e o que permanece não testado.

### Fase F — documentação de entrega

Entregar instruções reais de execução/implantação, migrations, `.env.example`, testes, seeds seguros, roteiro e evidências. Fazer revisão final de segredos, dependências adicionadas e impacto no build.

Não declarar tarefa concluída com apenas um esqueleto. Se houver limitação de acesso/infraestrutura, entregar o código produzido e a lista exata de etapas pendentes, sem alegar homologação oficial.

---

## 18. Critério de conclusão e matriz de resultados

### 18.1. Concluído para demonstração externa

A entrega externa estará pronta quando fornecedor, contrato e convênio cadastrados pelo fluxo real do CeleriFlow chegarem automaticamente ao receptor independente, forem persistidos, retornarem confirmação verificável e permanecerem consultáveis; atualizações, falhas e reenvios não criarem duplicidades; o worker recuperar pendências sem depender de abas; segurança/isolamento e evidências estiverem testados.

Isso é **prontidão técnica do laboratório**, não aprovação contratual pela comissão.

### 18.2. Não significa conformidade integral do SIAFIC

Manter uma matriz separada para o decreto, referenciando os dispositivos e evidências do núcleo contábil. Ela deve considerar os requisitos gerais, contábeis, de transparência e tecnológicos, sem preencher automaticamente "atendido" a partir da exportação cadastral. [S1]

Não transformar o receptor de laboratório em segundo SIAFIC oficial. A avaliação da arquitetura produtiva e do núcleo permanece separada.

### 18.3. Modelo de relatório de entrega

| Requisito/teste | Implementação encontrada/criada | Evidência e ambiente | Resultado | Limitação |
|---|---|---|---|---|
| CLC-008 | Preencher com caminho/serviço real. | Evento + recibo + pessoa no destino. | A preencher após teste. | Identificar DEMO/nativo. |
| CLC-052 | Preencher. | Contrato + partes + histórico. | A preencher. | Identificar pontos de entrada. |
| CLC-075 | Preencher. | Evidência do contexto Contratos. | A preencher. | Mesmo pipeline, ID preservado. |
| COB-CONVENIO | Preencher. | Convênio e seus papéis. | A preencher. | Cobertura complementar. |
| CLC-057 / CLC-060 | Preencher serviço nativo ou dependência. | Atos efetivamente executados. | A preencher. | Sem substituição por cadastro remoto. |
| REQ-GERAL | Matriz regulatória separada. | Evidências do ERP. | Não avaliado integralmente neste MD. | Não certificar por exportação. |
| Integração oficial externa | Adaptador específico ainda não disponível. | Nenhuma transmissão oficial nesta entrega. | NÃO TESTADA. | Falta documentação/acesso do destino real. |

Não deixar os campos de implementação como "preencher" no relatório final do agente: substituir por resultados reais ou ausência explicitada. A tabela acima é modelo, não resultado de testes já executados.

### 18.4. Entregáveis esperados no repositório/workspace

| Entregável | Conteúdo |
|---|---|
| Código incremental do CeleriFlow | Integração ao domínio, configuração, adaptadores, fila, worker, UI e autorização. |
| Código do receptor independente | API, persistência própria, painel, recibos e falhas controladas. |
| Migrations | Mudanças aditivas dos respectivos bancos. |
| Contrato HTTP | OpenAPI/schemas, exemplos e versão. |
| Fixtures | Massa sintética, aliases, datasets e manifesto. |
| Testes | Unitários, contrato, integração real e roteiro ponta a ponta. |
| Operação | Comandos existentes, variáveis seguras e implantação local/publicada. |
| Evidências | Resultados reais por teste/requisito, sem segredos. |
| Limitações | Dependências, testes não executados, ausência de homologação oficial. |

### 18.5. Evolução futura para o destino municipal

Quando houver acesso e documentação, desenvolver um adaptador específico do fornecedor: mapear campos, autenticação, endpoints/leiautes, classificações, retornos, periodicidade e regras; testar em ambiente autorizado; reconciliar; e somente então habilitar produção.

Preservar infraestrutura genérica de fila, rastreabilidade e recuperação. **Trocar somente URL e token não garante compatibilidade.** O contrato `ROBONUVEM-SIAFIC-DEMO` não deve ser apresentado como API conhecida do município.

Essa etapa futura não impede a execução do laboratório atual e não deve ser usada pelo agente como motivo para interromper a implementação do receptor DEMO.

---

## 19. Referências e procedência

**Consulta das fontes públicas:** 18/09/2026. Conferir versões efetivamente utilizadas no desenvolvimento. As referências técnicas justificam padrões de implementação; não determinam o conteúdo do TR nem demonstram aderência do código atual.

**[U1]** Trechos de obrigação e itens 8, 52 e 75 transcritos pelo usuário nesta conversa; relato do telefonema e solicitação de simulação com dados fictícios.

**[D1]** Documento preexistente de projeto `CeleriFlow_POC_Compras_Licitacoes_Contratos_Desenvolvimento_REV01.md`, consultado na biblioteca: CLC-008, CLC-052, CLC-057, CLC-060, CLC-075 e DEP-04. É uma especificação de desenvolvimento, não prova de implementação. Este arquivo não realiza nova análise integral do TR.

**[S1]** Presidência da República — Decreto nº 10.540/2020, texto consolidado. Referência normativa geral; art. 2º, II, sobre integração, e demais disposições aplicáveis ao núcleo.

```text
https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/decreto/d10540.htm
```

**[S2]** Betha — Contratos / Contratando / Enviar para escrituração. Referência de fluxo de envio automático e recuperação; não adotada como leiaute ou interpretação vinculante.

```text
https://contratos.ajuda.betha.cloud/contratos/ajuda/contratando/
```

**[S3]** AWS Prescriptive Guidance — Transactional outbox pattern. Referência para atomicidade local e tratamento de entregas repetidas; a solução proposta não exige contratar AWS.

```text
https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html
```

**[S4]** Vercel — Usage & Pricing for Cron Jobs. Conferência dos limites do plano antes de escolher o agendador.

```text
https://vercel.com/docs/cron-jobs/usage-and-pricing
```

**[S5]** Vercel — @vercel/functions API Reference; ciclo de vida e limites de waitUntil/after. Usar os recursos compatíveis com a versão real do projeto.

```text
https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package
```

**[S6]** PostgreSQL — SELECT; cláusulas de bloqueio e SKIP LOCKED. Aplicar ao driver/versão efetivamente utilizados, sem atualizar o banco por causa deste documento.

```text
https://www.postgresql.org/docs/current/sql-select.html
```

**[S7]** OWASP — Server Side Request Forgery Prevention Cheat Sheet. Referência para validação/allowlist de destinos externos.

```text
https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
```

**[S8]** Vercel — Managing Cron Jobs. Autenticação das invocações e comportamento em falhas.

```text
https://vercel.com/docs/cron-jobs/manage-cron-jobs
```

---

## 20. Instrução final de execução

Implemente este MD como complemento do módulo de Compras. Comece pelos serviços e dados reais do repositório; conclua um fluxo completo de fornecedor antes de expandir para instrumentos. O receptor separado deve receber chamadas e manter registros reais em seu próprio banco. Preserve a contabilidade nativa e a identidade única dos cadastros. Não solicite credenciais municipais para executar o laboratório e não invente a API do fornecedor atual. Entregue código, comandos funcionais, testes, evidências e pendências, diferenciando demonstração externa, uso nativo e integração oficial não testada.
