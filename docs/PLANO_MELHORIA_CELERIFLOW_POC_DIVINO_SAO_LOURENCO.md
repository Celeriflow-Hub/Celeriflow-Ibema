# Plano de Melhoria do CeleriFlow para a POC de Divino de São Lourenço/ES

**Versão do plano:** 1.0  
**Data-base:** 16/08/2026  
**Base documental:** Termo de Referência ratificado do Pregão Eletrônico SRP nº 04/2026 – PMDSL e análise atual do CeleriFlow v1.235.0.

---

## 1. Objetivo

Adequar o **CeleriFlow** aos requisitos funcionais, operacionais, de usabilidade, segurança, relatórios e integrações previstos no Termo de Referência de Divino de São Lourenço, preservando a arquitetura atual do produto.

A estratégia será:

1. **Manter os módulos já existentes no CeleriFlow**, sem criar novos módulos principais no menu global.
2. Criar, adaptar ou aprofundar **telas, submenus, rotinas, cadastros, relatórios e workflows dentro dos módulos existentes**.
3. Manter o mecanismo atual de **ativação/bloqueio de módulos por cliente/prefeitura**.
4. Implementar primeiro tudo que puder ser demonstrado de forma local e controlada na POC.
5. Deixar as integrações externas produtivas para a última etapa, mas desde o início criar os **contratos, schemas, adapters, mocks, filas, webhooks e telas de configuração** necessários para que a integração real possa ser ativada depois sem refazer o módulo.
6. Trabalhar com meta interna de **95% de aderência demonstrável**, criando margem sobre o mínimo de 90% indicado no TR.

> **Regra estrutural:** nenhuma adequação prevista neste plano deve exigir a criação de um novo módulo principal se já existir um módulo funcional equivalente no CeleriFlow. Recursos complementares devem ser incorporados como abas, submenus, páginas, serviços ou configurações dentro dos módulos atuais.

---

# 2. Princípios de implementação

## 2.1 Preservar a estrutura modular atual

O CeleriFlow continuará utilizando a lógica atual de módulos habilitados por instância. Cada prefeitura poderá receber somente os módulos contratados.

Exemplo:

```text
Configurações da Instância
├── Administração ............... ATIVO
├── Processos ................... ATIVO
├── Financeiro .................. ATIVO
├── Saúde ....................... BLOQUEADO
├── Educação .................... BLOQUEADO
└── Assistência Social .......... ATIVO
```

Todas as melhorias deste plano devem respeitar esse mecanismo.

## 2.2 Não criar duplicidade funcional

Antes de desenvolver um requisito:

- verificar se já existe tela semelhante;
- verificar se pode ser ampliada;
- verificar se o mesmo cadastro pode ser reutilizado;
- verificar se o recurso pode ser parametrizado;
- evitar criar tabelas paralelas para a mesma entidade;
- priorizar cadastro único e compartilhamento de informações entre módulos.

## 2.3 Toda nova função deve nascer auditável

Toda operação relevante deve registrar, quando aplicável:

- usuário;
- data/hora;
- IP;
- ação;
- entidade afetada;
- valor anterior;
- valor posterior;
- módulo;
- rota/tela;
- resultado da operação.

## 2.4 Toda função crítica deve ser demonstrável pela interface

Não basta existir código interno. Para a POC, o avaliador deverá conseguir:

1. acessar a tela;
2. executar a operação;
3. visualizar o resultado;
4. gerar relatório/documento quando aplicável;
5. visualizar a integração entre módulos;
6. consultar auditoria quando aplicável.

---

# 3. ETAPA 0 — Matriz Mestre da POC

**Prioridade: P0**  
**Objetivo:** transformar o TR em backlog rastreável.

Criar arquivo/base interna com todos os requisitos do TR.

## Estrutura mínima

| Campo | Descrição |
|---|---|
| ID | Identificador interno do requisito |
| Módulo | Módulo atual do CeleriFlow responsável |
| Requisito literal | Texto fiel ao TR |
| Tipo | Tela / função / relatório / regra / integração / infraestrutura |
| Situação atual | Atende / parcial / não atende / não comprovado |
| Tela atual | URL ou caminho existente |
| Ajuste necessário | Trabalho objetivo |
| Prioridade | P0 / P1 / P2 / P3 |
| Status | Backlog / desenvolvimento / revisão / testado / aprovado |
| Evidência POC | Como demonstrar |
| Integração externa | Sim / não |
| Pode usar mock | Sim / não |

## Classificação técnica

- **A — Atende atualmente**
- **B — Ajuste simples**
- **C — Desenvolvimento funcional**
- **D — Integração externa**
- **E — Risco/incompatibilidade textual**

## Critério de conclusão

Nenhum requisito do TR poderá ficar sem:

- módulo responsável;
- classificação;
- status;
- forma de demonstração.

---

# 4. ETAPA 1 — Recursos transversais dentro da arquitetura existente

**Prioridade: P0**

Esta etapa deverá ser concluída antes das grandes expansões setoriais porque diversos requisitos do TR repetem as mesmas necessidades.

---

## 4.1 Relatórios — ampliar o serviço transversal existente

**Local:** infraestrutura compartilhada utilizada pelos módulos atuais.  
**Não criar módulo novo.**

Criar/padronizar uma camada única de relatórios capaz de ser chamada por qualquer módulo.

### Funções

- visualização em tela antes da impressão;
- PDF;
- XLSX;
- CSV;
- TXT;
- orientação retrato/paisagem;
- seleção de período;
- filtros específicos;
- impressão;
- cabeçalho configurável;
- brasão da Prefeitura;
- rodapé;
- paginação;
- data/hora de emissão;
- usuário emissor;
- QR Code quando exigido;
- assinatura digital quando exigida;
- armazenamento de relatório gerado quando necessário;
- histórico de emissão.

### Criar componente padrão

```text
ReportEngine
├── PdfRenderer
├── XlsxRenderer
├── CsvRenderer
├── TxtRenderer
├── PrintPreview
├── SignatureService
└── ReportAuditService
```

### Critério de aceite

Todo módulo novo ou adaptado deve utilizar o mesmo serviço de relatório, salvo justificativa técnica.

---

## 4.2 Ajuda e treinamento — dentro de Configurações/ajuda global

**Local:** Configurações / Ajuda / área global já disponível à aplicação.  
**Não criar módulo principal.**

Criar uma **Central de Ajuda e Treinamento** acessível por todos os módulos.

### Funções

- pesquisa por palavra-chave;
- FAQ;
- artigos;
- ajuda contextual por tela;
- botão `?` nas telas principais;
- manuais PDF;
- vídeos;
- tutoriais passo a passo;
- materiais por módulo;
- cursos internos;
- acompanhamento de progresso;
- registro de participação;
- versão do conteúdo por atualização do sistema.

### Estrutura sugerida

```text
Ajuda
├── Central de Conhecimento
├── Perguntas Frequentes
├── Manuais
├── Vídeos
└── Treinamentos
```

### Benefício

Uma única implementação atende requisitos transversais e pode ser reutilizada em Educação, Saúde, RH, Financeiro e demais áreas.

---

## 4.3 Notificações — ampliar o serviço atual

**Local:** serviço transversal + Configurações > Integrações/Notificações.

Criar arquitetura de notificações desacoplada do canal.

```text
NotificationService
├── InternalProvider
├── EmailProvider
├── SmsProvider
├── WhatsAppProvider
└── PushProvider
```

### Na primeira fase

Implementar de forma real:

- notificações internas;
- central de notificações;
- leitura/não leitura;
- prioridade;
- link para a entidade relacionada;
- geração automática por evento;
- geração automática por prazo.

### Deixar predisposto

- e-mail;
- SMS;
- WhatsApp;
- push.

Os providers externos poderão inicialmente operar em `MOCK`.

---

## 4.4 Cadastro Único — ampliar Cadastros Gerais

**Local:** módulo **Cadastros Gerais**.

Consolidar o cadastro único transversal.

### Pessoas

- pessoa física;
- pessoa jurídica;
- documentos;
- contatos;
- endereço;
- representante;
- procurador;
- vínculos;
- anexos;
- situação cadastral;
- histórico.

### Reutilização

O mesmo cadastro deve ser consumido por:

- fornecedor;
- contribuinte;
- servidor;
- cidadão;
- responsável;
- paciente;
- aluno;
- profissional;
- representante de empresa.

### Criar

- detecção de duplicidade;
- união de cadastros duplicados;
- validação de CPF/CNPJ;
- validação de CEP;
- log de unificação;
- arquitetura para SERPRO;
- arquitetura para serviço nacional de CEP.

---

## 4.5 Workflow — ampliar Processos/Configurações

**Local:** módulos **Processos Eletrônicos e Digitais** + **Configurações**.

Criar um motor parametrizável reutilizável pelos demais módulos.

### Recursos

- definição de etapas;
- responsáveis;
- grupos responsáveis;
- entrada e saída;
- condições;
- aprovações;
- rejeições;
- devolução;
- prazo;
- SLA;
- documentos obrigatórios;
- anexos;
- alertas;
- eventos automáticos;
- segregação de funções;
- histórico;
- visualização gráfica do fluxo.

### Exemplos de uso

- pedido de compra;
- ITBI;
- licenciamento ambiental;
- processo administrativo;
- fiscalização;
- benefício social;
- matrícula;
- solicitação de saúde.

---

## 4.6 Integrações — fortalecer Configurações > Integrações

**Local:** módulo **Configurações / Integrações**.

Toda integração futura deve utilizar o mesmo padrão.

```text
src/lib/integrations/
├── core/
├── contracts/
├── schemas/
├── providers/
├── adapters/
├── queues/
├── webhooks/
├── logs/
└── mocks/
```

### Ambientes

```text
MOCK
SANDBOX
PRODUCTION
```

### Todo conector deve possuir

- configuração;
- credenciais;
- status;
- teste de conexão;
- log de envio;
- log de retorno;
- payload enviado;
- resposta recebida;
- erro;
- retentativa;
- auditoria.

> **Importante:** as integrações reais serão desenvolvidas por último. Nesta etapa deve existir a arquitetura e a possibilidade de demonstrar fluxos simulados sem afirmar que houve comunicação produtiva com o órgão externo.

---

# 5. ETAPA 2 — Aperfeiçoar módulos hoje mais próximos da POC

**Prioridade: P0/P1**

Objetivo: levar módulos já maduros para o maior nível de aderência antes de atacar áreas muito grandes.

---

## 5.1 Administração

### Adaptar/criar dentro do módulo atual

- estrutura organizacional;
- secretarias;
- departamentos;
- unidades;
- cargos;
- servidores vinculados à estrutura;
- responsáveis;
- comissões;
- calendário;
- parâmetros institucionais;
- brasão e identidade visual;
- dados da Prefeitura;
- responsáveis por assinatura;
- organograma;
- histórico de alterações.

---

## 5.2 Almoxarifado

### Completar

- catálogo de materiais;
- unidades de medida;
- fornecedores;
- lote;
- validade;
- endereçamento físico;
- múltiplos almoxarifados;
- centros de custo;
- requisitantes;
- classificações;
- estoque mínimo;
- estoque médio;
- estoque máximo;
- ponto de ressuprimento;
- entrada por compra;
- entrada por doação;
- devolução;
- outras entradas;
- saída;
- transferência;
- requisições externas ao almoxarifado;
- inventário;
- bloqueio durante inventário;
- saldos iniciais;
- histórico;
- balancete;
- boletim de entrada;
- créditos/débitos de transferência;
- integração com Compras.

### Evidência da POC

Criar cenário completo:

```text
Compra → AF → entrada automática → estoque → requisição → saída → relatório
```

---

## 5.3 Patrimônio

### Completar

- grupos patrimoniais;
- classes patrimoniais;
- móveis;
- imóveis;
- semoventes;
- intangíveis;
- tombamento;
- duplicação de bens;
- responsável;
- setor;
- localização;
- anexos;
- transferência;
- avaliação;
- reavaliação;
- depreciação;
- impairment;
- estorno;
- baixa;
- inventário;
- comissão;
- bloqueio durante inventário;
- etiqueta com QR Code;
- termo de transferência;
- relatório de baixas;
- histórico;
- relação sintética;
- exportador TCE preparado.

### Integração interna

```text
Almoxarifado → bem permanente → Patrimônio
```

---

## 5.4 Processos Eletrônicos e Digitais

O módulo atual deve ser aprofundado sem alterar sua posição no produto.

### Adicionar

- modelos de processo;
- tipos de processo;
- assuntos;
- prioridade;
- interessados;
- palavras-chave;
- formulários parametrizáveis;
- campos customizados;
- workflow visual;
- histórico gráfico;
- SLA;
- pendências;
- despachos;
- decisões;
- anexos;
- múltiplas assinaturas;
- assinatura sequencial;
- assinatura paralela;
- QR Code de autenticidade;
- consulta pública;
- portal externo;
- classificação documental;
- temporalidade;
- arquivamento;
- dashboard;
- métricas de tempo;
- identificação de gargalos;
- mineração básica de processo;
- OCR;
- digitalização em lote;
- indexação textual;
- extração de conteúdo de documentos.

---

## 5.5 Documentos / GED

### Completar

- modelos;
- editor de documentos;
- versionamento;
- histórico;
- anexos;
- hash;
- autenticação;
- assinatura;
- múltiplos assinantes;
- QR Code;
- classificação;
- indexação;
- OCR;
- pesquisa textual;
- armazenamento privado;
- consulta de versão anterior;
- bloqueio de documento assinado;
- auditoria;
- geração de PDF.

---

## 5.6 Financeiro / Contábil

### Manter e aprofundar

- PPA;
- LDO;
- LOA;
- orçamento;
- créditos adicionais;
- reserva;
- empenho;
- liquidação;
- pagamento;
- retenções;
- receita;
- arrecadação;
- bancos;
- tesouraria;
- transferências;
- conciliação;
- aplicações;
- resgates;
- restos a pagar;
- dívida;
- encerramento mensal;
- encerramento anual;
- reabertura;
- lançamentos contábeis;
- plano de contas;
- balancetes;
- balanços;
- RREO;
- RGF;
- LRF;
- relatórios legais.

### Criar camada interna de prestação de contas

```text
PrestacaoContasService
├── TceEsExporter
├── SiconfiExporter
├── SiopeExporter
├── SiopsExporter
└── ReinfExporter
```

### Nesta etapa

- schemas internos;
- validações;
- geração de arquivos de teste;
- tela de conferência;
- histórico de lotes;
- status MOCK.

### Última etapa

- transmissão real;
- homologação.

---

## 5.7 Assistência Social

### Completar dentro do módulo atual

- unidades socioassistenciais;
- profissionais;
- famílias;
- integrantes;
- CadÚnico;
- Bolsa Família;
- BPC;
- benefícios eventuais;
- programas;
- serviços;
- turmas;
- faixas etárias;
- triagem;
- atendimento direto;
- agenda;
- retorno;
- prontuário;
- visita domiciliar;
- encaminhamentos;
- CRAS;
- CREAS;
- PAIF;
- PAEFI;
- PIA;
- lista de espera;
- carteirinha;
- georreferenciamento;
- relatórios SUAS;
- RMA;
- indicadores.

---

## 5.8 Meio Ambiente

### Completar dentro do módulo atual

- empreendimentos;
- atividades;
- potencial poluidor;
- enquadramento;
- licenças;
- tipos de licença;
- condicionantes;
- parecer técnico;
- fiscalização;
- denúncias;
- resíduos;
- áreas verdes;
- educação ambiental;
- consultores;
- credenciamento;
- portal externo;
- documentos;
- taxas;
- vencimentos;
- alertas;
- localização;
- mapas;
- delimitação de área;
- anexos geográficos;
- workflow de licenciamento.

---

# 6. ETAPA 3 — Completar módulos menores ou hoje menos profundos

**Prioridade: P1**

---

## 6.1 Frotas

**Manter o módulo Frotas existente.**

### Criar/completar

- veículos;
- máquinas;
- equipamentos;
- motoristas;
- documentos;
- seguros;
- IPVA;
- licenciamento;
- multas;
- acidentes;
- ocorrências;
- manutenção preventiva;
- manutenção corretiva;
- planos de manutenção;
- ordens de serviço;
- abastecimentos;
- combustível;
- lubrificantes;
- despesas;
- rotas;
- histórico de utilização;
- alertas de vencimento;
- relatórios.

---

## 6.2 Portal do Servidor

**Manter o módulo Portal do Servidor existente.**

### Criar/completar

- área de login;
- perfil funcional;
- dados pessoais;
- dados funcionais;
- contracheques;
- ficha financeira;
- informe de rendimentos;
- férias;
- licenças;
- benefícios;
- dependentes;
- requerimentos;
- protocolos;
- documentos;
- notificações;
- atualização cadastral;
- histórico.

---

## 6.3 Controle Interno

**Manter o módulo Controle Interno existente.**

### Criar/completar

- planejamento anual;
- auditorias;
- tipos de auditoria;
- checklists;
- pontos de controle;
- achados;
- evidências;
- recomendações;
- responsáveis;
- providências;
- prazos;
- calendário de obrigações;
- acompanhamento de limites;
- RCL;
- pessoal;
- saúde;
- educação;
- relatórios mensais;
- relatórios anuais;
- dashboards;
- cruzamento de dados dos demais módulos.

---

## 6.4 Custos

**Manter o módulo Custos existente.**

### Criar/completar

- centros de custo;
- objetos de custo;
- planos de custo;
- unidades;
- programas;
- ações;
- serviços;
- equipamentos;
- custo direto;
- custo indireto;
- rateio;
- apropriação;
- período;
- fechamento;
- integração interna com Folha;
- integração interna com Almoxarifado;
- integração interna com Patrimônio;
- integração interna com Frotas;
- integração interna com Contratos;
- integração interna com Financeiro;
- relatórios;
- dashboards.

---

## 6.5 Business Intelligence

**Manter o módulo Business Intelligence existente.**

Substituir a situação atual de tela incompleta por um módulo funcional.

### Criar

- fontes de dados;
- datasets;
- importação CSV;
- importação XLSX;
- conexão SQL;
- ETL;
- editor SQL WEB somente leitura;
- consultas salvas;
- métricas;
- variáveis calculadas;
- gráficos;
- cards;
- tabelas;
- dashboards;
- filtros;
- filtros cruzados;
- drill-down;
- drill-to-detail;
- visões geográficas;
- permissões;
- compartilhamento;
- exportação CSV;
- exportação XLSX;
- exportação PDF;
- exportação de imagem.

---

## 6.6 Portal Institucional

**Manter o módulo Portal Institucional existente.**

### Evoluir o CMS

- páginas;
- menus;
- submenus;
- banners;
- notícias;
- galerias;
- vídeos;
- secretarias;
- serviços;
- licitações;
- contratos;
- Diário Oficial;
- legislação;
- links úteis;
- telefones;
- perguntas frequentes;
- enquete;
- newsletter;
- redes sociais;
- mapa do site;
- acessibilidade;
- contraste;
- tamanho da fonte;
- atalhos de teclado;
- textos alternativos;
- conteúdo responsivo.

---

# 7. ETAPA 4 — Compras, Licitações e Contratos

**Prioridade: P1**

Tudo deve permanecer dentro do módulo existente **Compras, Licitações e Contratos**.

---

## 7.1 Fornecedores

- PF/PJ;
- ME/EPP;
- CNAE;
- documentos;
- certidões;
- vencimentos;
- situação;
- bloqueio;
- consulta;
- histórico;
- vínculos com processos.

---

## 7.2 Compras

- solicitação;
- aprovação;
- agrupamento;
- pesquisa de preços;
- cotação;
- fornecedores;
- envio de convite;
- link de resposta;
- chave de acesso;
- preenchimento online pelo fornecedor;
- prazo de resposta;
- quadro comparativo;
- menor preço destacado;
- planejamento de compras;
- PCA;
- dotação;
- reserva;
- autorização de fornecimento.

---

## 7.3 Licitações

- processo;
- modalidade;
- objeto;
- legislação;
- comissão;
- pregoeiro;
- equipe de apoio;
- publicação;
- propostas;
- participantes;
- documentos;
- habilitação;
- inabilitação;
- parecer;
- impugnação;
- recurso;
- julgamento;
- adjudicação;
- homologação;
- anulação;
- revogação;
- suspensão;
- deserta;
- fracassada.

---

## 7.4 Pregão eletrônico

Criar **dentro do módulo Compras/Licitações** um submenu específico.

```text
Compras, Licitações e Contratos
└── Pregão Eletrônico
    ├── Sessões
    ├── Lotes
    ├── Participantes
    ├── Lances
    ├── Negociação
    └── Julgamento
```

### Funções

- sala de disputa;
- lotes;
- itens;
- participantes;
- lances;
- cronômetro;
- status;
- lance pelo celular;
- negociação;
- habilitação;
- inabilitação;
- arrematação;
- histórico;
- auditoria.

---

## 7.5 Contratos e Convênios

- contratos;
- convênios;
- responsáveis;
- signatários;
- vigência;
- valores;
- quantidades;
- aditivos;
- suspensões;
- rescisões;
- medições;
- etapas;
- parcelas;
- relatórios.

---

## 7.6 Predisposição para PNCP/TCE/SIAFIC

Criar os objetos internos:

```text
PncpNoticePayload
PncpContractPayload
PncpResultPayload
TceProcurementPayload
SiaficContractPayload
```

Nesta etapa:

- montar payload;
- validar;
- visualizar;
- registrar lote;
- simular envio;
- simular retorno.

Integração real somente na etapa final.

---

# 8. ETAPA 5 — Tributário e subáreas fiscais

**Prioridade: P1/P2**

Todos os desenvolvimentos devem permanecer dentro dos módulos tributários já existentes.

---

## 8.1 Tributária

### Completar

- cadastro imobiliário;
- cadastro econômico;
- contribuinte;
- imóveis;
- empresas;
- atividades;
- tributos;
- taxas;
- lançamento;
- arrecadação;
- guias;
- parcelamento;
- dívida ativa;
- certidões;
- alvarás;
- fiscalização;
- notificações;
- autos de infração;
- correção;
- multa;
- juros;
- execução fiscal;
- protesto;
- relatórios;
- malha fiscal;
- cruzamentos.

---

## 8.2 ITBI

**Manter módulo ITBI existente.**

### Criar/completar

- solicitação web;
- imóvel;
- vendedor;
- comprador;
- transmissão;
- avaliação;
- cálculo;
- homologação;
- DAM;
- protocolo;
- acompanhamento;
- etapas configuráveis;
- transferência automática parametrizável;
- portal sem obrigatoriedade de cadastro prévio quando configurado.

---

## 8.3 Domicílio Tributário Eletrônico

**Manter módulo DTEL existente.**

### Criar/completar

- caixa postal;
- mensagens;
- avisos;
- intimações;
- documentos fiscais;
- ciência;
- leitura;
- prazo;
- leitura tácita;
- comunicação em lote;
- procuração eletrônica;
- representantes;
- autorização;
- rejeição/revogação de procuração;
- auditoria;
- alerta de nova comunicação.

### Predisposição

- autenticação com certificado digital;
- e-mail;
- SMS.

---

## 8.4 Nota Fiscal Eletrônica de Serviços

**Manter módulo NFS-e existente.**

### Completar

- prestador;
- tomador;
- serviço;
- RPS;
- NFS-e;
- emissão;
- cancelamento;
- substituição;
- retenção;
- ISS;
- livro fiscal;
- declaração;
- guia;
- consulta;
- portal;
- validações;
- relatórios.

---

## 8.5 Simples Nacional

**Manter módulo Simples Nacional existente.**

### Criar/completar

- importação PGDAS;
- DAS-D;
- informações declaradas;
- cruzamento com NFS-e;
- divergências;
- notificações;
- fiscalização;
- parcelamentos;
- exclusão;
- histórico;
- relatórios.

---

## 8.6 ISS Bancário

**Manter módulo ISS Bancário existente.**

### Criar/completar

- instituição financeira;
- dependências;
- PGCC;
- COSIF;
- balancete;
- lançamentos;
- DES-IF;
- importação;
- validação;
- apuração de ISS;
- divergências;
- fiscalização;
- assinatura;
- relatórios.

---

## 8.7 Acompanhamento do Valor Adicionado Fiscal

**Manter módulo VAF existente.**

### Criar/completar

- empresas;
- inscrições;
- documentos fiscais;
- CFOP;
- GIA;
- EFD;
- importações;
- análises;
- inconsistências;
- cálculo do VAF;
- histórico;
- acompanhamento;
- indicadores;
- relatórios.

---

# 9. ETAPA 6 — Recursos Humanos e Folha

**Prioridade: P1/P2**

Tudo permanece dentro de **Recursos Humanos e Folha de Pagamento**.

### Ampliar

- cadastro completo de servidor;
- vínculos;
- cargos;
- funções;
- lotações;
- jornadas;
- ponto;
- férias;
- benefícios;
- dependentes;
- licenças;
- afastamentos;
- atos;
- folha;
- eventos;
- proventos;
- descontos;
- encargos;
- rescisões;
- férias;
- 13º;
- ficha financeira;
- relatórios;
- arquivos bancários.

### Criar camada de obrigações

```text
FolhaIntegrations
├── ESocial
├── EfdReinf
├── Sefip
├── Dirf
├── Rais
├── Caged
└── Bancos
```

Nesta etapa:

- geração interna;
- validação;
- lotes;
- tela de acompanhamento;
- recibos simulados;
- logs;
- ambiente MOCK.

Integrações produtivas somente ao final.

---

# 10. ETAPA 7 — Educação

**Prioridade: P1/P2**  
**Maior bloco funcional do plano.**

Tudo deve ser construído dentro do módulo **Educação** já existente, utilizando submenus.

```text
Educação
├── Administração Escolar
├── Acadêmico
├── Alunos
├── Professores
├── Portal do Professor
├── Portal do Estudante
├── Biblioteca
├── Transporte Escolar
├── Alimentação Escolar
├── Relatórios
└── Integrações
```

---

## 10.1 Administração Escolar

- escolas;
- unidades;
- períodos;
- anos;
- modalidades;
- etapas;
- disciplinas;
- matriz curricular;
- calendário;
- turmas;
- horários;
- vagas;
- profissionais;
- parametrizações.

---

## 10.2 Alunos

- cadastro;
- responsáveis;
- documentos;
- endereço;
- necessidades especiais;
- matrícula;
- rematrícula;
- transferência;
- enturmação;
- desenturmação;
- movimentações;
- histórico;
- ficha individual.

---

## 10.3 Acadêmico

- diário;
- frequência;
- conteúdo;
- aulas;
- avaliações;
- notas;
- conceitos;
- média;
- recuperação por avaliação;
- recuperação por etapa;
- recuperação final;
- ficha descritiva;
- ficha de desempenho;
- observações;
- conselho;
- fechamento de turma;
- resultado final;
- histórico escolar;
- boletim;
- atas;
- certificados;
- declarações.

---

## 10.4 Portal do Professor

- turmas;
- disciplinas;
- horário;
- frequência;
- conteúdo;
- avaliações;
- notas;
- recuperação;
- atividades;
- materiais;
- observações;
- comunicação;
- avisos;
- relatórios;
- ajuda.

---

## 10.5 Portal do Estudante

- perfil;
- turma;
- calendário;
- notas;
- frequência;
- boletim;
- avaliações;
- atividades;
- material de estudo;
- documentos;
- avisos;
- mensagens.

---

## 10.6 Gestão Pedagógica

- acompanhamento de turma;
- acompanhamento de professor;
- acompanhamento de aluno;
- avaliações;
- observações;
- desempenho;
- plano de estudos;
- indicadores;
- liberação de informações para portais;
- relatórios.

---

## 10.7 Biblioteca

- acervo;
- classificação;
- autores;
- editoras;
- exemplares;
- usuários;
- empréstimos;
- devoluções;
- reservas;
- atrasos;
- relatórios.

---

## 10.8 Transporte Escolar

- veículos;
- motoristas;
- monitores;
- linhas;
- rotas;
- pontos;
- alunos;
- horários;
- quilometragem;
- relatórios.

---

## 10.9 Alimentação Escolar

- cardápios;
- nutricionistas;
- refeições;
- alimentos;
- ingredientes;
- estoque;
- consumo;
- alunos;
- restrições alimentares;
- relatórios.

---

## 10.10 Educacenso

Criar primeiro:

- importador;
- exportador;
- validação;
- inconsistências;
- matrícula inicial;
- situação final;
- histórico de arquivos;
- tela de conferência.

Integração/transmissão oficial posteriormente.

---

# 11. ETAPA 8 — Saúde

**Prioridade: P1/P2**  
**Segundo maior bloco funcional.**

Manter tudo dentro do módulo **Saúde** existente.

```text
Saúde
├── Cadastros
├── Atenção Básica
├── Agenda
├── Prontuário
├── Odontologia
├── Vacinação
├── Farmácia
├── Laboratório
├── Regulação
├── Transporte
├── Faturamento SUS
├── SISAB
├── Relatórios
└── Integrações
```

---

## 11.1 Cadastros estruturantes

- unidades;
- profissionais;
- equipes;
- especialidades;
- pacientes;
- CNS;
- famílias;
- áreas;
- microáreas;
- territórios;
- prestadores;
- serviços;
- procedimentos;
- CID;
- CBO;
- tabelas SUS.

### Preparar importadores

- CNES/SCNES;
- SIA/SUS;
- SIGTAP.

Primeiro por arquivo. Integração online depois.

---

## 11.2 Atenção Básica

- acolhimento;
- triagem;
- agenda;
- atendimento;
- prontuário;
- procedimentos;
- diagnósticos;
- prescrições;
- encaminhamentos;
- visitas domiciliares;
- atendimento domiciliar;
- atividade coletiva.

---

## 11.3 Odontologia

- atendimento;
- odontograma;
- procedimentos;
- evolução;
- agenda;
- relatórios.

---

## 11.4 Vacinação

- vacinas;
- lotes;
- doses;
- calendário;
- aplicação;
- atrasos;
- caderneta;
- cobertura;
- relatórios.

---

## 11.5 Farmácia

- medicamentos;
- estoque;
- lotes;
- validade;
- dispensação;
- paciente;
- prescrição;
- entradas;
- saídas;
- relatórios.

---

## 11.6 Laboratório

- exames;
- solicitações;
- coleta;
- amostras;
- resultados;
- validação;
- assinatura;
- laudos;
- prestadores terceirizados;
- portal do paciente;
- relatórios.

---

## 11.7 Regulação

- solicitações;
- classificação;
- fila;
- prioridade;
- agendamento;
- prestadores;
- autorizações;
- cotas;
- retorno à fila;
- relatórios.

---

## 11.8 Transporte Sanitário

- solicitações;
- pacientes;
- veículos;
- motoristas;
- viagens;
- passageiros;
- destinos;
- quilometragem;
- despesas;
- relatórios.

---

## 11.9 Faturamento SUS

- produção;
- competência;
- BPA;
- validações;
- inconsistências;
- consolidação;
- fechamento;
- arquivos;
- histórico.

---

## 11.10 SISAB / e-SUS

Criar objetos internos padronizados:

```text
CadastroIndividual
CadastroDomiciliar
AtendimentoIndividual
AtendimentoOdontologico
AtendimentoDomiciliar
AtividadeColetiva
Procedimento
VisitaDomiciliar
Vacinacao
MarcadorConsumoAlimentar
```

### Criar

- geração;
- validação;
- lote;
- visualização;
- histórico;
- status;
- retorno simulado;
- ambiente MOCK.

Integração oficial no final.

---

## 11.11 SISAB Mobile

Desenvolver como **aplicação complementar do módulo Saúde**, sem criar módulo principal adicional no CeleriFlow.

Objetivo:

- uso por ACS;
- Android;
- autenticação;
- banco local;
- modo offline;
- famílias;
- pessoas;
- visitas;
- cadastros;
- sincronização;
- fila de sincronização;
- conflitos;
- histórico.

> **Risco específico:** o TR contém exigência textual de tecnologia Java em parte da solução de Saúde. Esse ponto deverá permanecer marcado como risco técnico/jurídico e não deve provocar mudança da stack principal do CeleriFlow sem decisão específica.

---

# 12. ETAPA 9 — Assistência Virtual para Autoatendimento

**Prioridade: P2**

Manter o módulo **Assistência Virtual para Autoatendimento** existente.

### Primeiro desenvolver o motor independente do canal

- chatbot;
- árvore de atendimento;
- menus;
- FAQ;
- identificação;
- CPF/CNPJ;
- aceite LGPD;
- anexos;
- protocolo;
- abertura de solicitação;
- consulta de solicitação;
- abertura de processo;
- integração interna com módulos;
- transferência para atendente;
- histórico;
- relatórios.

### Canais

```text
ChannelProvider
├── WebChatProvider
├── WhatsAppProvider
├── SmsProvider
└── FutureProvider
```

### Na POC

O WebChat pode demonstrar o fluxo completo.

### Depois

Ativar WhatsApp Business API oficial.

---

# 13. ETAPA 10 — Testes e evidências da POC

**Prioridade: P0 contínua**

Essa etapa deve começar junto com o desenvolvimento, mas ser consolidada quando os módulos estiverem prontos.

---

## 13.1 Testes automatizados

Adicionar Playwright para fluxos de interface.

Padrão:

```text
POC-DSL-GERAL-001
POC-DSL-ALM-001
POC-DSL-PAT-024
POC-DSL-COM-040
POC-DSL-EDU-518
POC-DSL-SAU-143
```

### Testar

- login;
- autorização;
- operações CRUD críticas;
- workflows;
- integração entre módulos;
- relatórios;
- assinatura;
- auditoria;
- responsividade;
- perfis;
- exportações.

---

## 13.2 Evidência por requisito

Cada requisito importante deve possuir registro contendo:

- ID;
- módulo;
- tela;
- usuário POC;
- dados de teste;
- passos;
- resultado esperado;
- relatório/documento gerado;
- screenshot opcional;
- status.

---

## 13.3 Usuários de demonstração

Criar perfis separados:

```text
admin.poc
compras.poc
contabilidade.poc
rh.poc
tributario.poc
patrimonio.poc
almoxarifado.poc
educacao.poc
saude.poc
assistencia.poc
controle.poc
```

---

## 13.4 Massa de dados

Criar seed de Divino de São Lourenço com:

- instituição;
- secretarias;
- departamentos;
- usuários;
- fornecedores;
- cidadãos;
- servidores;
- alunos;
- pacientes;
- contratos;
- processos;
- materiais;
- bens;
- contas;
- receitas;
- despesas;
- dados tributários;
- demais entidades necessárias.

---

# 14. ETAPA 11 — Integrações externas reais

**Prioridade: P3 — última etapa funcional**

Somente iniciar homologações externas depois que o CeleriFlow já gerar internamente os dados corretos.

## Ordem sugerida

1. TCE-ES
2. SICONFI
3. SIOPE
4. SIOPS
5. PNCP
6. eSocial
7. EFD-Reinf
8. e-SUS/SISAB
9. CNES/SCNES
10. SERPRO CPF/CNPJ
11. NFS-e / padrão nacional ou adotado pelo Município
12. Simples Nacional
13. DES-IF
14. Educacenso
15. WhatsApp Business API
16. SMS
17. bancos / CNAB / Pix / APIs bancárias

---

## 14.1 Regra para integração

O módulo não deve depender diretamente da API externa.

### Correto

```text
Módulo
  ↓
Objeto interno
  ↓
Validação
  ↓
Provider
  ↓
Adapter
  ↓
Sistema externo
```

### Evitar

```text
Tela → chamada direta à API externa
```

---

## 14.2 Cada integração deve possuir

- ambiente;
- credenciais;
- health check;
- configuração;
- schemas;
- payload;
- validação;
- fila;
- retentativa;
- idempotência;
- logs;
- auditoria;
- recibo/protocolo;
- consulta de retorno;
- tratamento de erro;
- modo MOCK;
- modo SANDBOX;
- modo PRODUCTION.

---

# 15. ETAPA 12 — Infraestrutura e documentação da solução

**Prioridade: P1/P2**

Além das telas, a POC e a implantação podem exigir comprovação da infraestrutura.

## Preparar dossiê técnico

- arquitetura;
- aplicação;
- banco;
- armazenamento;
- SSL/HTTPS;
- disponibilidade;
- redundância;
- backup;
- retenção;
- recuperação;
- monitoramento;
- segurança física do provedor;
- segurança lógica;
- LGPD;
- gestão de acesso;
- logs;
- continuidade;
- política de incidentes.

## Validar especificamente

- espaço mínimo de backup exigido;
- política de backup;
- redundância;
- monitoramento 24x7;
- firewall;
- infraestrutura física;
- certificados/documentos dos provedores.

---

# 16. ETAPA 13 — Simulação completa da POC

**Prioridade: P0 antes da apresentação**

---

## Rodada 1 — Checklist técnico

Executar a matriz completa e registrar:

- atende;
- não atende;
- parcial;
- indisponível;
- necessita correção.

---

## Rodada 2 — Operação por módulo

Uma pessoa lê o requisito.

Outra pessoa, sem ajuda do desenvolvedor, deve localizar e demonstrar a funcionalidade.

---

## Rodada 3 — Comissão crítica

Simular solicitações inesperadas:

- “Cadastre agora.”
- “Altere.”
- “Exclua.”
- “Mostre quem alterou.”
- “Gere o relatório.”
- “Exporte em Excel.”
- “Abra pelo celular.”
- “Entre com outro usuário.”
- “Mostre que ele não pode excluir.”
- “Mostre o histórico.”
- “Assine o documento.”
- “Mostre o QR Code.”
- “Envie para outro setor.”
- “Faça o estorno.”
- “Mostre o reflexo no outro módulo.”

---

## Rodada 4 — POC cronometrada

Executar roteiro completo sem alterações de código durante a apresentação.

---

# 17. Ordem recomendada de execução

```text
ETAPA 0  Matriz Mestre
   ↓
ETAPA 1  Recursos transversais
   ↓
ETAPA 2  Módulos já maduros
   ↓
ETAPA 3  Módulos menores / menos profundos
   ↓
ETAPA 4  Compras / Licitações / Contratos / Pregão
   ↓
ETAPA 5  Tributário e sistemas fiscais
   ↓
ETAPA 6  RH / Folha
   ↓
ETAPA 7  Educação
   ↓
ETAPA 8  Saúde
   ↓
ETAPA 9  Assistência Virtual
   ↓
ETAPA 10 Testes / Evidências / Seed POC
   ↓
ETAPA 11 Integrações externas reais
   ↓
ETAPA 12 Dossiê de infraestrutura
   ↓
ETAPA 13 Simulação final
```

---

# 18. Prioridade de desenvolvimento

## P0 — indispensável imediatamente

- matriz de requisitos;
- relatórios transversais;
- auditoria;
- RBAC;
- workflow;
- notificações internas;
- cadastro único;
- arquitetura de integrações;
- testes POC;
- seed de demonstração.

## P1 — alta prioridade funcional

- Almoxarifado;
- Patrimônio;
- Processos/GED;
- Financeiro/Contábil;
- Compras/Licitações;
- RH/Folha;
- Assistência Social;
- Meio Ambiente;
- Controle Interno;
- Frotas;
- Portal do Servidor;
- BI.

## P2 — grandes expansões

- Tributário especializado;
- ITBI;
- DTEL;
- NFS-e;
- Simples Nacional;
- ISS Bancário;
- VAF;
- Educação;
- Saúde;
- Assistência Virtual;
- Portal Institucional;
- Custos.

## P3 — integrações externas

- TCE-ES;
- SICONFI;
- SIOPE;
- SIOPS;
- PNCP;
- eSocial;
- EFD-Reinf;
- e-SUS/SISAB;
- CNES;
- SERPRO;
- NFS-e externa;
- Simples Nacional;
- DES-IF;
- Educacenso;
- WhatsApp;
- bancos.

---

# 19. Definição de pronto para a POC

Uma função só deve ser marcada como **PRONTA PARA POC** quando:

- [ ] Existe no módulo correto.
- [ ] Pode ser acessada pela interface.
- [ ] Respeita permissões.
- [ ] Possui validação.
- [ ] Persiste os dados corretamente.
- [ ] Gera auditoria quando aplicável.
- [ ] Reflete em módulos integrados quando aplicável.
- [ ] Possui relatório/documento quando exigido.
- [ ] Possui dados de demonstração.
- [ ] Possui roteiro de apresentação.
- [ ] Possui teste automatizado ou checklist manual formal.
- [ ] Foi testada por alguém que não implementou a função.
- [ ] Funciona sem alteração de código durante a demonstração.

---

# 20. Diretriz para Codex / Antigravity

Cada tarefa enviada ao agente de desenvolvimento deverá informar:

```text
MÓDULO EXISTENTE:
REQUISITO DO TR:
SITUAÇÃO ATUAL:
OBJETIVO:
ROTAS/TELAS A REUTILIZAR:
MODELOS/TABELAS A REUTILIZAR:
NOVAS FUNÇÕES NECESSÁRIAS:
REGRAS DE NEGÓCIO:
PERMISSÕES:
AUDITORIA:
RELATÓRIOS:
INTEGRAÇÕES INTERNAS:
INTEGRAÇÕES EXTERNAS FUTURAS:
CRITÉRIOS DE ACEITE:
TESTE POC:
```

O agente deverá ser orientado explicitamente a:

1. **não criar um novo módulo principal**;
2. reutilizar o módulo já existente;
3. reutilizar componentes e modelos existentes sempre que possível;
4. preservar a estrutura de permissões por módulo;
5. preservar o mecanismo de módulo contratado/bloqueado;
6. não substituir integrações MOCK por chamadas externas sem autorização;
7. implementar primeiro a capacidade funcional interna;
8. criar a predisposição necessária para integração produtiva futura.

---

# 21. Resultado esperado

Ao final deste plano, o CeleriFlow deverá continuar sendo o mesmo ERP modular atual, porém com cada módulo aprofundado até cobrir os requisitos necessários à POC de Divino de São Lourenço.

A estrutura comercial e técnica permanecerá flexível:

```text
CeleriFlow Base
      ↓
Configuração por Prefeitura
      ↓
Módulos contratados ativados
      ↓
Demais módulos bloqueados
```

Dessa forma, as funcionalidades desenvolvidas para Divino de São Lourenço passam a integrar a **base padrão do CeleriFlow**, podendo ser habilitadas em futuras prefeituras conforme o objeto contratado, sem necessidade de criar versões paralelas do produto ou novos módulos para cada edital.

