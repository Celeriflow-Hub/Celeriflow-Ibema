# Planejamento de Desenvolvimento da Base para POC - Divino de São Lourenço/ES

**Data-base:** 16 de agosto de 2026  
**Documento de origem:** `docs/PLANO_MELHORIA_CELERIFLOW_POC_DIVINO_SAO_LOURENCO.md`  
**Complementos consultados:** `docs/Divino_Sao_Lourenco_POC_Requisitos_Sistema.md` e `docs/ANALISE_SISTEMA_ATUAL.md`

## 1. Objetivo e resultado esperado

Preparar uma **base demonstrável, estável e auditável do CeleriFlow** para a POC de Divino de São Lourenço/ES. O resultado não é uma versão paralela do produto: as melhorias entram nos módulos existentes, preservam a ativação por instância e poderão ser habilitadas para outros municípios.

O planejamento busca atingir a meta interna do plano de melhoria: **95% de aderência demonstrável**, acima do mínimo de 90% previsto no Termo de Referência (TR). Essa meta só poderá ser confirmada após a Matriz Mestre classificar cada requisito com evidência objetiva; não deve ser declarada com base apenas na existência de telas ou modelos de banco.

Para uma função ser considerada demonstrável na POC, ela precisa:

- estar acessível na interface do módulo correto;
- respeitar permissão, escopo setorial e módulo contratado/bloqueado;
- validar e persistir dados;
- registrar auditoria quando aplicável;
- refletir os módulos internos envolvidos;
- gerar documento ou relatório quando exigido;
- ter massa de demonstração, roteiro e teste/checklist;
- ser operada por alguém que não a implementou;
- funcionar sem alteração de código durante a apresentação.

## 2. Premissas de execução

| Premissa | Decisão de planejamento |
| --- | --- |
| Arquitetura do produto | Manter Next.js, Prisma, Neon, Firebase, Vercel Blob, RBAC e os módulos atuais. Não criar módulo principal novo para requisitos que caibam em módulo existente. |
| Estratégia de POC | Priorizar fluxos completos e evidenciáveis pela interface, não coleções de telas isoladas. |
| Integrações externas | Construir contratos, validação de payload, mocks, logs e telas de configuração desde o início. Conector produtivo só entra após decisão de obrigatoriedade, credencial e homologação. |
| Dados de demonstração | Seed específico de Divino de São Lourenço, repetível e isolado do ambiente de produção. |
| Qualidade | Cada entrega possui teste automatizado quando viável e checklist manual de POC obrigatório. |
| Infraestrutura | O ambiente, HTTPS, backup, monitoramento, evidências de segurança e plano de contingência devem estar prontos antes da convocação. |
| Planejamento temporal | Um ciclo equivale a duas semanas. O roteiro é organizado em 12 ciclos, sujeito à reestimativa após a Matriz Mestre e à capacidade real da equipe. |

### Capacidade mínima considerada

O cronograma pressupõe uma equipe com desenvolvimento front-end, desenvolvimento back-end, QA e apoio parcial de DevOps/infraestrutura e especialistas de negócio. Se essas funções forem atendidas pela mesma pessoa, os ciclos devem ser reestimados pela velocidade observada após os dois primeiros ciclos; não se deve reduzir validação, seed ou simulações para compensar capacidade.

## 3. Governança do programa

### Papéis necessários

| Papel | Responsabilidade principal |
| --- | --- |
| Patrocinador/Produto | Decide escopo, aceita riscos, prioriza requisitos e aprova a prontidão da POC. |
| Líder técnico | Mantém arquitetura, dependências, padrões de integração, segurança e revisão técnica. |
| Responsável funcional | Interpreta o TR, valida fluxo municipal e aprova roteiro de demonstração. |
| Desenvolvimento | Implementa tarefas verticais no módulo existente, com regras, auditoria e testes. |
| QA/POC | Mantém matriz, checklist, evidências, regressão e simulações por requisito. |
| DevOps/Infraestrutura | Prepara ambiente, segurança, backup, monitoramento, acesso e dossiê técnico. |
| Especialista de domínio | Valida Financeiro, Compras, Tributário, Educação, Saúde ou outra área antes do aceite. |

### Ritos mínimos

- Refinamento semanal do backlog a partir da Matriz Mestre.
- Revisão técnica e funcional ao final de cada ciclo.
- Atualização semanal dos indicadores de aderência, bloqueios e evidências.
- Demonstração interna quinzenal com roteiros de POC, não somente demonstração de desenvolvimento.
- Comitê de decisão para qualquer requisito com interpretação ambígua, integração externa ou risco jurídico/técnico.

## 4. Indicadores de controle

| Indicador | Fórmula/uso | Meta para liberação da POC |
| --- | --- | --- |
| Cobertura do TR | Requisitos classificados com módulo, status, responsável e evidência / total de requisitos | 100% classificados. |
| Aderência demonstrável | Requisitos com evidência válida e aceite interno / total de requisitos | Meta interna de 95%; nunca abaixo de 90%. |
| Aderência dos itens selecionados | Itens selecionados demonstráveis / itens selecionados | 100%. |
| Prontidão de fluxo | Fluxos críticos aprovados no checklist / fluxos críticos planejados | 100%. |
| Evidência de POC | Requisitos com roteiro, massa e prova registrada / requisitos demonstráveis | 100%. |
| Falhas críticas abertas | Defeitos que impedem login, dados, autorização, relatório, auditoria ou fluxo de demonstração | 0 antes do congelamento. |
| Regressão | Casos automatizados e checklists manuais aprovados / planejados | 100% dos casos críticos. |
| Infraestrutura | Itens do dossiê comprovados / itens exigidos | 100% dos itens aplicáveis. |

## 5. Estrutura do backlog

Cada item de desenvolvimento deve estar vinculado a um requisito literal do TR. A Matriz Mestre será a fonte única de verdade e terá, no mínimo:

| Campo | Conteúdo obrigatório |
| --- | --- |
| ID | Identificador estável do requisito. |
| Requisito literal | Texto ou referência inequívoca ao TR. |
| Módulo existente | Área responsável, sem criar duplicidade funcional. |
| Situação atual | Atende, parcial, não atende ou não comprovado. |
| Classificação | A: atende; B: ajuste simples; C: desenvolvimento; D: integração externa; E: risco/incompatibilidade. |
| Ajuste e dependências | Trabalho objetivo, dados, módulo interno, infraestrutura e integração necessária. |
| Prioridade | P0, P1, P2 ou P3, revisável pela criticidade de seleção na POC. |
| Evidência | Passos de interface, usuário, massa, relatório/documento e registro de auditoria. |
| Critério de aceite | Resultado verificável para aprovar a função. |
| Teste | Caso automatizado e/ou checklist manual relacionado. |
| Risco de demonstração | Baixo, médio, alto ou bloqueado, com responsável e data de decisão. |

### Definition of Ready

Uma história só entra no ciclo quando possuir requisito vinculado, módulo de destino, regra de negócio, permissão, impacto de auditoria, dependências, dados de seed e critério de aceite.

### Definition of Done

Uma história só é concluída quando a interface, ação/rota, persistência, validação, auditoria, integrações internas, relatório/documento e teste/checklist estiverem aprovados. Uma tela estática, um modelo Prisma sem fluxo ou um mock sem registro de execução não encerram uma história de POC.

## 6. Roadmap por ciclos

### Ciclo 0 - Diagnóstico, matriz e decisões de escopo

**Objetivo:** transformar o TR em um backlog controlável e impedir que desenvolvimento avance sem evidência ou critério de aceite.

| Entregável | Critério de aceite |
| --- | --- |
| Matriz Mestre inicial | 100% dos requisitos do TR possuem ID, módulo, classificação, situação, responsável, prioridade e forma de demonstração. |
| Mapa de aderência | Indicadores separados para universo completo do TR e requisitos selecionáveis/mais prováveis. |
| Mapa de risco | Cada item D ou E possui decisão necessária, responsável, prazo e alternativa de demonstração. |
| Corte de POC | Lista dos fluxos obrigatórios, recortes de Educação/Saúde/Tributário e itens cuja demonstração depende de sandbox ou produção. |
| Backlog de 90 dias | Itens P0/P1 ordenados por dependência e valor de demonstração. |

**Gate 0:** nenhuma expansão setorial inicia sem requisito rastreado e sem forma de provar o comportamento pela interface.

### Ciclos 1 e 2 - Fundação transversal P0

**Objetivo:** consolidar recursos reutilizáveis que sustentam os demais módulos e vários requisitos gerais do TR.

| Frente | Entregas do ciclo | Evidência de POC |
| --- | --- | --- |
| RBAC e auditoria | Revisar permissões por módulo/ação/setor, bloqueio por instância, auditoria de acesso e alteração, segregação de funções. | Dois usuários com papéis distintos: um executa e outro é bloqueado; histórico é consultado. |
| Relatórios | `ReportEngine` padronizado com preview, PDF, XLSX, CSV, TXT, filtros, cabeçalho/brasão, emissão e auditoria. | Um mesmo relatório emitido em tela, PDF e XLSX, com emissor/data/hora registrados. |
| Documentos | Modelo, versão, assinatura quando aplicável, QR Code/verificação, armazenamento e histórico. | Documento assinado, bloqueado contra edição, baixado por usuário autorizado e verificado pelo código. |
| Cadastro único | PF/PJ, documentos, contatos, vínculos, anexos, duplicidade, unificação e validação. | A mesma pessoa é usada como cidadão, fornecedor e responsável sem cadastro paralelo. |
| Workflow | Etapas parametrizáveis, SLA, aprovação, anexos, histórico e alertas internos. | Solicitação criada, encaminhada, aprovada por outro usuário e auditada. |
| Notificações | Central interna, leitura, prioridade, vínculo com entidade e geração por evento/prazo. | Evento de processo gera notificação navegável para o usuário responsável. |
| Integrações | Contrato comum, ambiente MOCK/SANDBOX/PRODUÇÃO, log, retentativa e retorno simulado. | Execução MOCK validada, auditada e consultável sem chamada externa. |

**Gate 1:** login, permissão negativa, auditoria, relatório, documento/QR Code, cadastro único, workflow e notificação devem operar com o seed de POC antes de expandir os domínios.

### Ciclos 3 e 4 - Administração, Processos e GED

**Objetivo:** estabelecer a estrutura organizacional e o fluxo documental reutilizado pelos demais serviços municipais.

| Fluxo vertical | Escopo demonstrável | Dependências |
| --- | --- | --- |
| Administração | Instituição, secretarias, departamentos, unidades, cargos, servidores, usuários e perfis. | RBAC, cadastro único e seed. |
| Processo eletrônico | Abertura, numeração, setor inicial, tramitação, despacho, prazo, anexos, busca, arquivamento e histórico. | Workflow, notificações, documentos e auditoria. |
| Assinatura e autenticidade | Assinatura interna/reautenticação, hash, QR Code e consulta/autenticidade quando aplicável. | GED, Blob e serviço de assinatura. |
| Atendimento/Ouvidoria | Chamado ou manifestação encaminhado e convertido em processo, com tratamento de sigilo. | Cadastro, processos, escopo por departamento. |

**Gate 2:** demonstrar abertura de processo por usuário operacional, tramitação por dois setores, despacho assinado, aviso de prazo, relatório e consulta de histórico.

### Ciclos 5 e 6 - Cadeia administrativa, compras, estoque, patrimônio e financeiro

**Objetivo:** entregar o principal fluxo integrado de alto valor para a POC, com efeito entre módulos e controles de integridade.

| Fluxo vertical | Resultado esperado |
| --- | --- |
| Solicitação de compra | Solicitação com prioridade, aprovador distinto, itens, centro de custo e histórico. |
| Compras e contrato | Cotação/julgamento, processo, contrato, autorização/ordem de fornecimento e fornecedor. |
| Almoxarifado | Entrada associada à aquisição, saldo, lote quando aplicável, requisição, saída e balancete. |
| Patrimônio | Bem permanente originado da entrada, tombamento, etiqueta/QR Code, responsável, transferência, depreciação e baixa. |
| Financeiro/contábil | Reserva, empenho, liquidação vinculada a documento, pagamento, retenções, conciliação/tesouraria e relatório. |
| Transparência | Projeção pública do que é publicável, sem dados pessoais ou identificadores internos. |

**Gate 3:** executar do início ao fim a sequência `solicitação -> compra/contrato -> entrada -> estoque ou tombamento -> empenho -> liquidação -> pagamento -> relatório/transparência`, incluindo um usuário bloqueado em etapa segregada.

### Ciclo 7 - Controles, portais e módulos P1 de reaproveitamento

**Objetivo:** ampliar cobertura com áreas que reutilizam a fundação construída e são rápidas de demonstrar.

| Frente | Escopo mínimo de POC |
| --- | --- |
| Controle Interno | Plano, apontamento, pendência, responsável, evidência e relatório. |
| Frotas | Veículo, manutenção/abastecimento, ordem de serviço, custo e relatório. |
| Portal do Servidor | Consulta autenticada a informações disponibilizadas, permissões e documentos. |
| BI/Indicadores | Painel executivo com indicadores extraídos dos dados de seed e filtros por período/unidade. |
| Portal da Transparência | Validar explicitamente receitas, despesas, licitações, contratos, relatórios e exportação como frente própria da matriz. |
| Assistência Social e Meio Ambiente | Validar os fluxos já existentes com cadastro, processo, documentos, benefício/licença e relatórios. |

**Gate 4:** cada frente possui ao menos um roteiro de demonstração completo, relatório/exportação e evidência de permissão/auditoria.

### Ciclos 8 e 9 - Recortes setoriais de alto risco

**Objetivo:** não tentar implementar módulos inteiros; criar fatias completas que cubram os requisitos selecionados e mais prováveis.

| Área | Fatia demonstrável | Bloqueios a decidir no Ciclo 0 |
| --- | --- | --- |
| Tributário | Pessoa/imóvel/empresa -> lançamento -> DAM -> pagamento simulado -> certidão/QR Code -> dívida ou parcelamento -> auditoria. | Regras municipais, integração bancária, NFS-e e SERPRO. |
| RH/Folha | Servidor -> evento -> cálculo/folha -> demonstrativo -> ato/documento -> relatório. | eSocial, EFD-Reinf e regras legais específicas. |
| Educação | Escola -> período/turma -> aluno -> matrícula -> frequência/notas -> boletim/histórico -> portal. | Educacenso, dados escolares e requisitos de recursos financeiros/transporte. |
| Saúde | Unidade/profissional -> paciente -> agenda -> atendimento -> prescrição/exame -> dispensação -> produção/SISAB MOCK. | Decisão sobre requisito Java, tabelas SUS, CNES/SCNES, SISAB/e-SUS e funcionalidades móveis. |
| Assistência Virtual | WebChat -> aceite LGPD -> identificação -> abertura/consulta de solicitação -> protocolo. | WhatsApp depende de aprovação Meta; WebChat não pode ser anunciado como substituto automático. |

**Gate 5:** o corte setorial só avança se houver massa realista, especialista funcional, relatório/documento e simulação de integração em ambiente permitido. Requisito sem decisão externa não pode ser contabilizado como atendido.

### Ciclo 10 - Qualidade, seed e evidências

**Objetivo:** transformar funções desenvolvidas em itens comprováveis da POC.

| Entregável | Critério de aceite |
| --- | --- |
| Seed de Divino de São Lourenço | Reexecutável, documentado e com pessoas, estrutura, usuários, fornecedores, itens, bens, processos, contas, alunos, pacientes e dados tributários coerentes. |
| Usuários de POC | Perfis de administrador, gestor, operador, somente leitura, cidadão e avaliador, com senhas/acessos controlados. |
| Casos de teste | Casos críticos automatizados; checklist manual formal para todas as funções demonstradas. |
| Evidências | Capturas, relatórios, arquivos, hashes, logs e passos de demonstração ligados ao ID da Matriz Mestre. |
| Regressão | Suíte atual executada em ambiente isolado e novos testes de regras/rotas críticas adicionados. |

**Gate 6:** todos os fluxos selecionados funcionam a partir de seed limpo, sem intervenção manual de banco e sem dependência de conta pessoal do desenvolvedor.

### Ciclo 11 - Infraestrutura, simulações e congelamento

**Objetivo:** validar o ambiente que será demonstrado e eliminar riscos de operação durante a banca.

| Frente | Entrega |
| --- | --- |
| Dossiê de infraestrutura | HTTPS, provedores, redundância, backup, monitoramento, firewall, continuidade, LGPD, gestão de acesso e evidências/documentos aplicáveis. |
| Rodada técnica | Checklist completo da matriz: atende, parcial, não atende, indisponível ou necessita correção. |
| Rodada operacional | Pessoa não autora executa todos os roteiros sem ajuda do desenvolvedor. |
| Comissão crítica | Simulação de pedidos de cadastro, alteração, exclusão, auditoria, relatório, exportação, mobile, troca de usuário, assinatura, QR Code, estorno e reflexo entre módulos. |
| POC cronometrada | Roteiro integral em ordem de apresentação, com tempo, contingência e evidências disponíveis. |
| Congelamento | Correção apenas de defeitos críticos; nenhuma funcionalidade nova ou alteração de arquitetura durante a janela de demonstração. |

**Gate 7:** zero falhas críticas abertas; indicadores de aderência atingidos; ambiente e dossiê aprovados; roteiros executados sem mudança de código.

## 7. Ordem de dependência obrigatória

```text
Matriz Mestre e decisões de risco
    -> RBAC, auditoria, dados de seed e ambiente
    -> relatórios, documentos, cadastro único, workflow e notificações
    -> Administração e Processos/GED
    -> Compras -> Almoxarifado -> Patrimônio -> Financeiro/Contábil
    -> Transparência, Controle Interno, Frotas, portais e módulos setoriais
    -> Recortes de Tributário, RH, Educação, Saúde e Assistência Virtual
    -> testes, evidências, simulações e congelamento
    -> conectores produtivos somente quando obrigatórios e homologados
```

Essa ordem deve ser respeitada. Por exemplo, não se inicia pagamento sem liquidação/documento, não se inicia tombamento sem origem de estoque/aquisição, e não se afirma integração externa antes de o objeto interno, payload, validação, log e resposta simulada estarem prontos.

## 8. Estratégia de integrações

### Base comum obrigatória desde o início

Todos os adaptadores devem ter contrato tipado, validação de payload, configuração por ambiente, logs, status, reprocessamento controlado, auditoria e retorno padronizado. O módulo deve continuar operando internamente quando o provedor externo estiver indisponível, salvo regra de negócio que exija bloqueio.

### Classificação antes de desenvolvimento produtivo

| Situação | Tratamento na POC |
| --- | --- |
| Requisito interno | Implementação completa e demonstração pela interface. |
| Integração com mock aceita | Payload validado, execução MOCK, retorno simulado, log e roteiro que declare explicitamente a simulação. |
| Integração com sandbox exigida | Credencial, ambiente homologado, teste ponta a ponta, evidência e contingência. |
| Integração produtiva indispensável | Iniciar antecipadamente com fornecedor/órgão, contrato de API, credencial, homologação e monitoramento. Não deixar para o final. |
| Dependência externa indisponível | Registrar como bloqueio na matriz e não contabilizar como atendida sem parecer formal de aceitação. |

TCE-ES, SICONFI, PNCP, eSocial, EFD-Reinf, e-SUS/SISAB, CNES, SERPRO, NFS-e, Simples Nacional, Educacenso, WhatsApp e bancos devem receber essa classificação individual logo no Ciclo 0. O plano original os posiciona em P3, mas um requisito selecionado pela comissão pode exigir antecipação.

## 9. Gestão de riscos

| Risco | Impacto | Mitigação e decisão |
| --- | --- | --- |
| Matriz incompleta | Não permite comprovar 90% ou 95% de aderência. | Prioridade absoluta no Ciclo 0; não aceitar percentual sem evidência. |
| Escopo muito amplo de Educação e Saúde | Pode consumir a maior parte do esforço e ainda deixar itens críticos sem cobertura. | Trabalhar por fatias demonstráveis e definir seleção de requisitos com especialista. |
| Integração real selecionada | Mock pode ser rejeitado pela comissão. | Classificar no Ciclo 0; iniciar sandbox/produção imediatamente quando indispensável. |
| Infraestrutura não comprovada | Possível reprovação antes da demonstração. | Dossiê e evidências técnicas preparados antes do Ciclo 11, com revisão antecipada. |
| Mudança de código durante a POC | O TR restringe alterações durante diligência. | Congelamento, ambiente de contingência, seed repetível e simulação cronometrada. |
| Massa de dados incoerente | Quebra fluxos integrados e reduz credibilidade da demonstração. | Seed versionado, reexecutável e validado por QA/funcional. |
| Permissões inconsistentes | Exposição de dados ou falha em demonstração de segregação. | Casos de autorização positivos e negativos em todos os fluxos críticos. |
| Saúde com exigência tecnológica específica | Risco de interpretação jurídica sobre Java. | Parecer/decisão formal antes de prometer aderência; não reescrever a stack sem decisão. |
| WhatsApp indisponível | Dependência de Meta, número e templates. | Tratar como bloqueio externo; demonstrar WebChat apenas quando o requisito permitir. |

## 10. Critérios para entrada na apresentação

Antes da convocação ou da apresentação, o comitê interno deverá verificar:

- [ ] Matriz Mestre 100% preenchida e com percentual de aderência calculado.
- [ ] Todos os itens selecionados marcados como demonstráveis e com evidência.
- [ ] Ambiente POC configurado, com domínio, HTTPS, usuários e seed validado.
- [ ] Backup e restauração testados; plano de contingência documentado.
- [ ] Todos os fluxos críticos executados com dados limpos e dois ou mais perfis de usuário.
- [ ] Relatórios e documentos exigidos disponíveis em seus formatos aplicáveis.
- [ ] Auditoria, permissões negativas, histórico e segregação de funções demonstrados.
- [ ] Integrações declaradas como MOCK/SANDBOX/PRODUÇÃO de forma verdadeira e comprovável.
- [ ] Dossiê de infraestrutura e segurança revisado.
- [ ] Simulação cronometrada aprovada, sem correção de código durante a rodada.
- [ ] Especialistas de cada domínio escalados e treinados para o roteiro.

## 11. Modelo obrigatório de tarefa de desenvolvimento

```text
MÓDULO EXISTENTE:
REQUISITO DO TR / ID DA MATRIZ:
SITUAÇÃO ATUAL COM EVIDÊNCIA:
OBJETIVO DEMONSTRÁVEL:
ROTAS E TELAS A REUTILIZAR:
MODELOS E SERVIÇOS A REUTILIZAR:
NOVAS REGRAS DE NEGÓCIO:
PERMISSÕES E ESCOPO:
AUDITORIA:
RELATÓRIOS/DOCUMENTOS:
INTEGRAÇÕES INTERNAS:
INTEGRAÇÕES EXTERNAS E AMBIENTE:
SEED NECESSÁRIO:
CRITÉRIOS DE ACEITE:
TESTE AUTOMATIZADO:
CHECKLIST/ROTEIRO POC:
RISCOS E DEPENDÊNCIAS:
```

## 12. Próxima ação

Iniciar imediatamente o **Ciclo 0** com uma oficina de decomposição do TR e criação da Matriz Mestre. O primeiro marco de desenvolvimento não é uma nova tela: é uma lista confiável de requisitos, evidências, riscos e decisões que permita ordenar o trabalho sem comprometer a meta de aderência da POC.
