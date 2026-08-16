# Planejamento de Evolução da Base Reutilizável do CeleriFlow

**Data-base:** 16 de agosto de 2026  
**Aplicação inicial:** POC de Divino de São Lourenço/ES  
**Objetivo de produto:** entregar uma base municipal reutilizável, configurável por prefeitura e preparada para receber adaptadores estaduais, federais e externos sem duplicar módulos ou regras de negócio.

## 1. Decisão de produto

Sim: o CeleriFlow deve ser desenvolvido como uma **base única de produto**. As funções genéricas passam a integrar o produto padrão; cada prefeitura recebe uma instância configurada com seus módulos, dados institucionais, regras locais, usuários, identidade visual e integrações contratadas.

O plano da POC de Divino continua sendo a fonte de requisitos e evidências para a apresentação. Este documento altera a ordem de implementação para que os requisitos de Divino sejam classificados antes como capacidade reutilizável, configuração municipal ou adaptador externo. Assim, a POC financia a evolução do produto sem criar uma versão exclusiva para um município.

### Limite atual da arquitetura

O sistema já possui ativação de módulos por instância, RBAC e configurações operacionais. Entretanto, `src/lib/platform/tenant-context.ts` declara que a base municipal atual é a única base ativa. Portanto:

- A mesma **base de código** pode atender vários municípios, com implantação e banco de dados separados.
- Não se deve usar uma mesma base de dados para vários municípios até existir um projeto próprio de multi-tenancy, isolamento por `tenantId` ou esquema/banco por cliente, migração de dados e testes de segurança.
- Multi-tenancy compartilhado não é necessário para a POC e não deve atrasar a base funcional reutilizável.

## 2. Modelo de camadas

Toda nova entrega deve ser posicionada em uma das cinco camadas abaixo. A classificação ocorre antes de desenvolvimento.

| Camada | Conteúdo | Exemplos | Regra |
| --- | --- | --- | --- |
| Produto comum | Comportamento igual para municípios e independente de fornecedor externo. | RBAC, auditoria, GED, workflow, relatórios, cadastro único, estoque, patrimônio. | Implementar no núcleo e cobrir com testes reutilizáveis. |
| Pacote de domínio | Regras municipais genéricas, ativadas por módulo e parâmetros. | Processo, compras, financeiro, tributação, educação, saúde, assistência social. | Implementar no módulo existente, sem criar telas ou tabelas paralelas. |
| Configuração municipal | Dados e políticas locais, sem alterar código. | Brasão, secretarias, unidades, exercício, organograma, alíquotas, séries, modelos, prazos, perfis e módulos contratados. | Persistir e versionar por instância; nunca codificar no serviço de domínio. |
| Adaptador externo | Comunicação com órgão, padrão, banco ou fornecedor. | TCE-ES, SICONFI, PNCP, eSocial, e-SUS, SERPRO, NFS-e, Educacenso, bancos e WhatsApp. | Isolar atrás de contrato/provider/adapter; não chamar API diretamente de tela ou regra de domínio. |
| Pacote de POC | Dados, usuários, roteiros, mocks, evidências e parâmetros para demonstrar. | Seed Divino, contas de avaliador, casos de teste, cenários de compra e atendimento. | Versionar e repetir sem contaminar a regra genérica do produto. |

### Regra de precedência

```text
Regra municipal comum
    -> produto comum ou pacote de domínio parametrizável
Regra exclusiva de uma prefeitura
    -> configuração municipal
Integração ou layout de órgão/estado
    -> adaptador externo e configuração de conexão
Dado para apresentação
    -> pacote de POC
```

Não é permitido criar `if` por município, estado, tribunal, banco ou fornecedor em páginas, Server Actions ou serviços de domínio. A decisão deve ocorrer por configuração ou adapter registrado.

## 3. Classificação obrigatória dos requisitos do TR

A Matriz Mestre da POC passa a ter os campos adicionais abaixo. Isso transforma o TR de Divino em backlog do produto sem perder a rastreabilidade do edital.

| Campo | Valores e uso |
| --- | --- |
| Camada de produto | Produto comum, pacote de domínio, configuração municipal, adaptador externo ou pacote POC. |
| Reuso | Padrão, parametrizável, exclusivo de Divino ou exclusivo de estado/órgão. |
| Fonte da regra | Lei/norma nacional, regra municipal, padrão de fornecedor, requisito de edital ou decisão interna. |
| Estratégia de implementação | Núcleo, parâmetro, template, adapter, mock ou sandbox. |
| Configuração necessária | Dados, tabela de domínio, perfil, modelo de relatório, credencial ou feature flag. |
| Critério de portabilidade | Como uma segunda prefeitura usará a função sem alteração de código. |
| Exceção aprovada | Obrigatória quando houver regra não portável ou código específico. |

### Exemplos de classificação

| Necessidade | Classificação correta |
| --- | --- |
| Relatório com preview, PDF, CSV e auditoria | Produto comum. |
| Brasão, nome, assinatura e texto do rodapé | Configuração municipal/template. |
| Processo com tramitação, despacho e SLA | Pacote de domínio de Processos, com workflow parametrizável. |
| Fluxo de aprovação de uma secretaria | Configuração municipal do workflow e das permissões. |
| RREO/RGF e regras de consolidação | Pacote de domínio Financeiro/Contábil, com parâmetros legais aplicáveis. |
| Layout e transmissão para TCE-ES | Adaptador externo estadual, separado do Financeiro. |
| Consulta CPF/CNPJ por SERPRO | Adaptador externo, consumido pelo Cadastro Único por contrato interno. |
| Usuários, fornecedores, alunos e pacientes da apresentação | Pacote de POC, sem dados pessoais reais. |

## 4. Arquitetura alvo para reutilização

### Núcleo de plataforma

Priorizar os recursos que todos os módulos compartilham:

- identidade, sessão, RBAC, escopo de departamento e unidade gestora;
- ativação de módulos e recursos por instância;
- auditoria de acesso e operações;
- Cadastro Único de pessoas, contatos, endereços, documentos e vínculos;
- workflow, SLAs, aprovação, segregação e notificações internas;
- GED, anexos, versões, assinatura, hash e QR Code;
- `ReportEngine` com preview, filtros, PDF, XLSX, CSV e TXT;
- catálogo de integrações, execução MOCK/SANDBOX/PRODUÇÃO, logs, idempotência e retentativas;
- feature flags e parametrização de capacidades por módulo;
- seed, usuários demonstrativos, roteiros e evidências de POC.

### Pacotes de domínio

Os módulos devem conter apenas a regra de negócio comum e devem consumir os serviços do núcleo. A prioridade de implementação é:

1. Administração, Cadastros, Processos/GED e Atendimento.
2. Compras, Almoxarifado, Patrimônio e Financeiro/Contábil.
3. Transparência, Controle Interno, Frotas, Portal do Servidor e Indicadores.
4. Tributário, RH/Folha, Educação, Saúde, Assistência Social, Meio Ambiente, Saneamento, Obras, Cultura, Câmara e Segurança.

Cada pacote precisa expor objetos internos estáveis. Exemplos: `Processo`, `SolicitacaoCompra`, `EntradaEstoque`, `BemPatrimonial`, `Empenho`, `LancamentoReceita`, `Matricula` e `AtendimentoSaude`. Um adaptador externo pode ler ou publicar esses objetos, mas não deve definir sua regra central.

### Configuração municipal

As configurações devem ser persistidas, auditáveis, versionadas e carregadas por instância. O planejamento de produto deve prever, sem codificar valores de Divino:

- dados institucionais, brasão, logotipo, contatos e domínios públicos;
- organograma, unidades gestoras, perfis, usuários e módulos contratados;
- exercício, calendários, workflows, prazos, níveis de aprovação e modelos de documentos;
- plano de contas, classificações, fontes, regras tributárias e cadastros de domínio;
- escolas, unidades de saúde, serviços, tabelas municipais e demais parâmetros setoriais;
- modelos de relatórios, textos legais e formatos de publicação;
- conexões externas por ambiente, referência de segredo, status e estratégia de execução.

Segredos, certificados e credenciais não podem ser armazenados em JSON de configuração, seeds ou repositório. A configuração deve guardar somente referências seguras e parâmetros não sigilosos.

### Adaptadores externos

Para cada integração, o desenho obrigatório é:

```text
Módulo de domínio
    -> objeto interno validado
    -> contrato de integração
    -> provider configurado
    -> adapter específico de órgão/fornecedor
    -> MOCK, SANDBOX ou PRODUÇÃO
```

Cada adapter deve possuir health check, schema de entrada/saída, validação, fila quando aplicável, idempotência, retentativa, auditoria, recibo/protocolo, consulta de retorno e tratamento de erro. A camada de domínio continua demonstrável em `MOCK` sem afirmar que houve transmissão real.

## 5. Roadmap de desenvolvimento da base

Um ciclo equivale a duas semanas. O planejamento possui 12 ciclos e deve ser reestimado após o primeiro diagnóstico de capacidade e da Matriz Mestre.

### Ciclo 0 - Catálogo de produto e Matriz Mestre

**Resultado:** inventário completo do TR classificado em camadas, prioridade, dependência e evidência.

- Criar a Matriz Mestre com a classificação de portabilidade.
- Identificar quais capacidades já existem, quais são ajustes e quais não são comprovadas.
- Definir a lista de configurações municipais que podem substituir código específico.
- Definir a lista de adapters externos, sem iniciar credenciais ou produção.
- Criar backlog dos ciclos 1 a 4 com requisitos vinculados e critérios de aceite.

**Gate:** nenhum requisito é iniciado sem rótulo de camada e sem resposta para “como outra prefeitura utilizará isto?”.

### Ciclos 1 e 2 - Plataforma comum e parametrização

**Resultado:** recursos transversais reutilizáveis e preparados para várias instâncias implantadas separadamente.

| Frente | Entrega reutilizável |
| --- | --- |
| Controle de acesso | Revisão de RBAC por módulo, ação, setor e unidade gestora; módulo ativo/bloqueado por instância. |
| Auditoria | Eventos de acesso, consulta e alteração padronizados, com filtros e retenção. |
| Cadastro Único | Pessoas, documentos, vínculos, contatos, endereços, validação e deduplicação. |
| Workflow | Definições parametrizáveis de etapas, SLA, aprovação e segregação. |
| GED e assinatura | Arquivo privado, versão, hash, assinatura, QR Code e consulta de autenticidade. |
| Relatórios | Serviço único de geração, preview, formatos e templates institucionais. |
| Notificações | Central interna desacoplada de e-mail, SMS, WhatsApp e push. |
| Configuração | Catálogo auditável de parâmetros municipais, modelos e módulos habilitados. |

**Gate:** uma instância de demonstração deve mudar nome, identidade visual, módulos, workflow e modelo de relatório apenas por configuração, sem alteração de código.

### Ciclos 3 e 4 - Fluxos administrativos comuns

**Resultado:** módulos que servem como base para praticamente todos os municípios e setores.

- Administração: instituição, secretarias, departamentos, unidades, cargos, servidores, perfis e usuários.
- Processos/GED: abertura, numeração, tramitação, despacho, anexos, assinatura, prazo, busca, histórico e relatório.
- Atendimento/Ouvidoria: chamado, sigilo, fila, atribuição, resposta, conversão em processo e auditoria.
- Portal público: transparência, consulta, filtros, exportação e proteção de dados publicados.

**Gate:** demonstrar um processo intersetorial completo com dois perfis, documento assinado, notificação, consulta de auditoria e publicação apropriada no portal.

### Ciclos 5 e 6 - Cadeia financeira e patrimonial comum

**Resultado:** fluxo integrado reutilizável de aquisição, estoque, patrimônio e despesa pública.

```text
Solicitação -> aprovação -> compra/contrato -> entrada de estoque
    -> requisição ou tombamento -> empenho -> liquidação -> pagamento
    -> contabilidade, relatório e transparência
```

Os comportamentos comuns, como segregação, disponibilidade, retenção, baixa, depreciação, conciliação e auditoria, pertencem à base. Plano de contas, fontes, regras de aprovação e modelos de documento pertencem à configuração municipal. Layouts de órgão fiscalizador pertencem a adapters externos.

**Gate:** o fluxo completo deve operar com configuração de demonstração distinta da de Divino, comprovando que a regra não foi codificada para um único município.

### Ciclo 7 - Pacotes comuns de gestão e portais

**Resultado:** cobertura de áreas com alto reaproveitamento de plataforma e baixo acoplamento externo.

- Controle Interno, Frotas, Portal do Servidor e Indicadores.
- Assistência Social, Meio Ambiente, Saneamento, Obras, Cultura, Câmara e Segurança: consolidar cadastro, processo, documento, workflow, relatório e permissões antes de regras locais profundas.
- Transparência: padronizar projeções públicas, exportações e publicação de relatórios.

**Gate:** todos os pacotes usam Cadastro Único, RBAC, auditoria, GED e `ReportEngine`, sem serviços paralelos para a mesma finalidade.

### Ciclos 8 e 9 - Pacotes especializados parametrizáveis

**Resultado:** recortes funcionais portáveis de Tributário, RH, Educação e Saúde antes de qualquer conexão externa.

| Pacote | Capacidade comum | Deixar para configuração/adapter |
| --- | --- | --- |
| Tributário | Cadastro, lançamento, guia/DAM, dívida, parcelamento, certidão e auditoria. | Alíquotas, calendários, regras locais, NFS-e, bancos, SERPRO e tribunal. |
| RH/Folha | Servidor, evento, cálculo, demonstrativo, ato e relatórios. | Tabelas locais, consignados, eSocial e EFD-Reinf. |
| Educação | Escola, período, turma, matrícula, frequência, avaliação, boletim, histórico e portal. | Calendário local, regras pedagógicas, Educacenso e integrações de transporte. |
| Saúde | Unidade, profissional, paciente, agenda, atendimento, prescrição, exame, dispensação e produção interna. | Tabelas e cadastros federais, CNES, e-SUS/SISAB, requisitos móveis e integrações especializadas. |

**Gate:** cada pacote demonstra um fluxo completo com dados sintéticos, permissões, documento/relatório e auditoria, sem depender de órgão ou fornecedor externo.

### Ciclo 10 - Qualidade e pacotes de POC

**Resultado:** produto testável e uma POC municipal montada somente por dados, parâmetros, mocks e roteiros.

- Criar seeds independentes para base padrão e para Divino de São Lourenço.
- Criar conjunto de usuários por papel, cenários de negócio e dados sintéticos sem informações pessoais reais.
- Cobrir regras críticas, autorizações e rotas com testes automatizados; manter checklist manual ligado à Matriz Mestre.
- Criar evidências reutilizáveis por fluxo, separadas de documentos exclusivos de Divino.
- Executar regressão em ambiente de banco isolado e repetível.

**Gate:** uma nova instância de teste é montada a partir da base padrão; em seguida, a POC de Divino é aplicada como pacote de configuração, seed e roteiro, sem mudança de código.

### Ciclo 11 - Adaptação final por município, integrações e apresentação

**Resultado:** entrega da POC sem contaminar o produto comum.

| Ordem | Trabalho final |
| --- | --- |
| 1 | Aplicar dados institucionais, organograma, brasão, usuários, perfis, parâmetros, modelos, seed e módulos contratados de Divino. |
| 2 | Ativar mocks e sandboxes autorizados; registrar claramente o ambiente de cada integração. |
| 3 | Iniciar adapter produtivo somente se a Matriz Mestre ou a comissão o exigir e houver credencial/homologação. |
| 4 | Preparar dossiê de infraestrutura, segurança, backup, continuidade e LGPD. |
| 5 | Executar simulações técnica, operacional, comissão crítica e POC cronometrada. |
| 6 | Congelar código; permitir somente parametrização auditada durante a janela de apresentação. |

## 6. Regras para desenvolvimento de recursos específicos

### Regra municipal

Quando a diferença estiver em percentual, prazo, calendário, nomenclatura, fórmula aprovada, texto, layout, assinatura, unidade, fluxo ou visibilidade, a primeira opção é configuração. A história deve incluir tela administrativa, validação, auditoria, versão da configuração e comportamento padrão quando o parâmetro não for definido.

### Regra estadual ou federal

Quando a diferença estiver em layout de arquivo, protocolo, autenticação, endpoint, recibo, retorno, versão de norma ou regra de um órgão, a primeira opção é adapter. O domínio deve gerar um objeto canônico e o adapter faz a tradução.

### Exceção não portável

Código exclusivo só é permitido com aprovação explícita do produto, justificativa legal ou contratual, teste de regressão e plano de extração futura. A exceção deve permanecer pequena, isolada e identificada na Matriz Mestre.

## 7. Qualidade e critérios de reutilização

Uma entrega só pode entrar na base padrão se cumprir todos os itens:

- [ ] Não contém nome, CNPJ, dado, regra ou credencial fixa de Divino de São Lourenço.
- [ ] Reutiliza módulo, entidade e serviço existentes quando equivalentes.
- [ ] Possui configuração ou adapter quando há variação previsível.
- [ ] Não expõe fornecedor externo ao componente de interface ou regra de domínio.
- [ ] Respeita RBAC, módulos contratados, auditoria e dados privados.
- [ ] Possui teste de regra e autorização; integrações têm teste de mock/sandbox quando aplicável.
- [ ] Possui seed sintético e roteiro de demonstração reproduzível.
- [ ] Pode ser ativada para uma segunda prefeitura sem alteração de código.

## 8. Backlog específico de Divino, somente após a base

Os itens abaixo ficam na última camada do trabalho e não devem bloquear o núcleo, salvo se forem selecionados como eliminatórios na POC:

- dados institucionais, identidade visual, organograma, usuários e perfis de Divino;
- regras municipais tributárias, calendários, textos legais, modelos e relatórios locais;
- configuração de unidades, escolas, UBS, serviços, parâmetros financeiros e tabelas municipais;
- seed e roteiro de apresentação da POC;
- adaptação para TCE-ES e demais layouts estaduais;
- credenciais, certificados, sandboxes e produção de PNCP, SICONFI, eSocial, EFD-Reinf, e-SUS/SISAB, CNES, SERPRO, NFS-e, Educacenso, WhatsApp e bancos;
- dossiê do provedor e evidências de infraestrutura solicitadas no edital.

Se algum item externo for confirmado como obrigatório na avaliação, ele deixa de ser “última camada” apenas para a POC correspondente. Ainda assim, deve ser implementado como adapter e não dentro do módulo de domínio.

## 9. Próximas ações imediatas

1. Criar a Matriz Mestre com os campos de portabilidade deste documento.
2. Classificar os requisitos P0 e P1 do TR nas cinco camadas de produto.
3. Abrir o backlog dos Ciclos 1 e 2 somente para recursos de plataforma comum e parametrização.
4. Definir o formato de pacote de configuração, seed e roteiros de uma prefeitura.
5. Escolher uma segunda configuração municipal sintética para validar a reutilização antes da POC de Divino.
6. Registrar, para cada integração do edital, se será mock, sandbox ou produção e qual decisão externa falta.

## 10. Conclusão

Divino de São Lourenço deve ser o primeiro pacote de implantação e POC sobre uma base padrão, não uma ramificação do CeleriFlow. O desenvolvimento começa pelo que é comum e parametrizável; depois aplica-se a configuração municipal; por último entram adapters de estado, órgãos, bancos e fornecedores. Essa separação reduz retrabalho, evita duplicação, melhora a qualidade do produto e torna cada evolução aproveitável em novos contratos.
