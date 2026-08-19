# Matriz Mestre Completa do Ciclo 0 - POC e Base Reutilizável

**Data-base:** 16 de agosto de 2026  
**Fonte integral:** `docs/Divino_Sao_Lourenco_POC_Requisitos_Sistema.md`  
**Planejamento associado:** `docs/PLANEJAMENTO_EVOLUCAO_BASE_REUTILIZAVEL.md`  
**Backlog detalhado dos Ciclos 1 e 2:** `docs/MATRIZ_MESTRE_INICIAL_BASE_POC.md`

## 1. Encerramento do Ciclo 0

Esta matriz cobre integralmente os requisitos funcionais, técnicos, de implantação e de POC do TR por **grupos contíguos de requisitos**. Cada grupo contém a faixa de linhas e itens que representa; nenhum requisito deve ser desenvolvido sem ser decomposto em tarefa vinculada ao ID deste documento.

O Ciclo 0 está concluído para fins de planejamento porque agora existe:

- inventário de todo o TR, de `L13` a `L13093`;
- classificação inicial por camada reutilizável;
- situação inicial baseada no código e documentação, sem alegar homologação não comprovada;
- prioridade, evidência de POC e responsável de decisão para cada bloco;
- registro dos bloqueios externos e do corte de implementação;
- backlog pronto para iniciar os Ciclos 1 e 2.

Esta conclusão **não significa aderência de 90% ou 95%**. Esse percentual só poderá ser calculado quando cada grupo for decomposto, testado e aprovado com evidência de POC.

## 2. Legenda de rastreabilidade

| Sigla | Significado |
| --- | --- |
| `A` | Há capacidade implementada identificada; ainda requer roteiro e evidência de POC. |
| `P` | Há capacidade parcial ou sem comprovação de todos os itens do grupo. |
| `N` | Não foi identificada implementação comprovável no repositório. |
| `D` | Exige adapter, credencial, homologação ou serviço externo. |
| `Produto` | Capacidade comum, reutilizável por municípios. |
| `Configuração` | Diferença municipal, institucional ou de fluxo que não deve exigir código. |
| `Adapter` | Integração estadual, federal, bancária ou de fornecedor. |
| `POC` | Seed, usuários, roteiro, evidência, treinamento ou operação de apresentação. |
| `Infra` | Serviço operacional, provedor, backup, segurança, disponibilidade ou suporte. |

**Evidência:** `UI` = demonstração pela interface; `AUD` = auditoria; `REP` = relatório/documento; `MOCK` = simulação registrada; `SANDBOX` = integração homologada; `DOS` = dossiê externo.

## 3. POC, implantação e fundação da plataforma

| ID | Referência do TR | Capacidade agrupada | Camada | Pri. | Situação | Evidência | Decisor/responsável |
| --- | --- | --- | --- | --- | --- | --- | --- |
| POC-001 | L13-162 | POC eliminatória, piloto, integridade, diligência, prazo, 90% e relatório de julgamento. | POC | P0 | P | UI+AUD+REP | Produto/comercial/jurídico |
| IMP-001 | L172-652 | Metodologia, instalação, parametrização, migração, carga, operação paralela, homologação, licença e disponibilidade. | POC | P0 | P | REP+DOS | Produto/implantação |
| IMP-002 | L653-815 | Treinamento, suporte, manutenção, chamados, monitoramento e customizações contratuais. | POC/Infra | P1 | N/P | UI+REP+DOS | Operações/comercial |
| PLT-001 | L282-368 | Web, navegadores, responsividade, multiplataforma, APIs, relatórios, HTTPS, LGPD e integração sem duplicidade. | Produto | P0 | P | UI+REP | Arquitetura/produto |
| INF-001 | L370-431 | Datacenter, redundância, firewall, backups, capacidade, proteção física e monitoração 24x7. | Infra | P0 | N | DOS | DevOps/provedor |
| INF-002 | L433-475 | Recuperação automática, backup online testado, integridade transacional, auditoria e continuidade. | Infra | P0 | P | DOS | DevOps/provedor |
| SEC-001 | L477-537 | Transação online, dado único, RBAC por tarefa/grupo/setor e histórico de operação. | Produto | P0 | P | UI+AUD | Arquitetura/segurança |
| UX-001 | L538-570 | Ajuda contextual, interface web, relatórios, preview, impressão, armazenamento e brasão. | Produto | P1 | P | UI+REP | Produto/design |
| CFG-001 | L551-561 | Documentação, versionamento e reaproveitamento de parametrizações. | Configuração | P1 | P | UI+AUD | Produto/administração |
| SEC-002 | L817-906 | Requisitos gerais: web, multiusuário, senha, grupos, CRUD, logs, workflow, SERPRO, CEP e cadastro único. | Produto/Adapter | P0 | P/D | UI+AUD+MOCK | Arquitetura/segurança |
| UX-002 | L907-920 | Ajuda hipertexto/PDF/vídeo, extração de histórico e backup online. | Produto/Infra | P2 | N/P | UI+REP+DOS | Produto/DevOps |
| SEC-003 | L921-947 | Bloqueio de acesso, X.509, trilha completa, SSL, cloud, recuperação de senha e auditoria de acesso/perfil. | Produto/Infra | P0 | P | UI+AUD+DOS | Segurança/DevOps |

## 4. Administração operacional e cadeia de suprimentos

| ID | Referência do TR | Capacidade agrupada | Camada | Pri. | Situação | Evidência | Decisor/responsável |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ALM-001 | L949-1007 | Catálogo, fornecedores PF/PJ, lotes, validade, entrada, saldo, transferência, requisição, inventário e relatórios de almoxarifado. | Produto | P1 | P | UI+AUD+REP | Patrimônio/compras |
| PAT-001 | L1008-1078 | Tombamento, classes, avaliação, reavaliação, depreciação, inventário, baixa, transferência, QR e relatórios patrimoniais. | Produto | P1 | P | UI+AUD+REP | Patrimônio/contabilidade |
| FRO-001 | L1079-1106 | Veículos, gastos, manutenção, abastecimento, seguros, rotas, ocorrências e relatórios. | Produto | P2 | P | UI+REP | Obras/frotas |
| COM-001 | L1107-1170 | Fornecedores, certidões, pesquisa/cotação, portal do fornecedor, comparativos e bloqueio de inativos. | Produto | P1 | P | UI+AUD+REP | Compras |
| COM-002 | L1171-1233 | Processo de compra, planejamento, dotação, comissão, integração estoque/licitação/contrato e etapas de licitação. | Produto | P1 | P | UI+AUD+REP | Compras/financeiro |
| COM-003 | L1234-1248 | Pregão eletrônico, lances, sala de disputa, habilitação, arrematação e integração PNCP. | Produto/Adapter | P2 | N/D | UI+MOCK | Compras/comercial |
| COM-004 | L1250-1312 | Contratos, convênios, aditivos, medições, parcelas, AE/AF/AL, liquidação, anulações, SIAFIC e PNCP. | Produto/Adapter | P0 | P/D | UI+AUD+MOCK | Compras/financeiro |

## 5. Processos, GED, atendimento e workflow

| ID | Referência do TR | Capacidade agrupada | Camada | Pri. | Situação | Evidência | Decisor/responsável |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PROC-001 | L1313-1360 | Registro, metadados, prioridade, setor, protocolo, histórico, termo, parecer, anexo e cancelamento. | Produto | P0 | A/P | UI+AUD+REP | Processos |
| PROC-002 | L1361-1429 | Formulários dinâmicos, fluxos, obrigatoriedade, SLA, prazos, despacho e arquivamento. | Produto/Configuração | P0 | P | UI+AUD | Processos/produto |
| PROC-003 | L1430-1477 | Assinatura, QR, certificado, preview, download, portal externo, apensação e consulta. | Produto/Adapter | P0 | P | UI+AUD+REP | GED/segurança |
| PROC-004 | L1478-1517 | Caixas configuráveis, rejeição, gráficos, relatórios, biblioteca, enquetes e automação. | Produto | P1 | P | UI+REP | Processos/BI |
| PROC-005 | L1518-1565 | Mineração, drill-down, configuração por assunto, ouvidoria anônima, consulta e sigilo. | Produto | P1 | P | UI+AUD | Atendimento/ouvidoria |
| PROC-006 | L1566-1609 | Portal cidadão, participação fiscal, cronograma, usuário externo, interórgãos e autenticidade. | Produto/Configuração | P1 | P | UI+AUD | Processos/portal |
| PROC-007 | L1610-1659 | Subfluxos, dashboards, assinaturas múltiplas, PDF, e-mail e operações em lote. | Produto | P0 | P | UI+AUD+REP | Processos/GED |
| GED-001 | L1660-1707 | Captura, paginação, composição, notas, apensação, retenção, OCR, extração, pesquisa e modelos. | Produto | P1 | P | UI+REP | GED |
| GED-002 | L1708-1743 | Scanner, DPI, lote, exportação externa, autenticidade, pesquisa, impressão e arquivos CSV/TXT. | Produto/Adapter | P2 | N/P | UI+MOCK | GED/infra |
| WFL-001 | L1744-1783 | Diagramas, gargalos, padronização, documentação, treinamento e evolução de workflows. | Produto/Configuração | P1 | N/P | UI+REP | Produto/processos |

## 6. Financeiro, contabilidade, tesouraria e planejamento

| ID | Referência do TR | Capacidade agrupada | Camada | Pri. | Situação | Evidência | Decisor/responsável |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CTB-001 | L1785-1860 | Escrituração, execução, reserva, empenho, liquidação, pagamento, patrimônio, retenções, adiantamentos e regras de credor. | Produto | P0 | A/P | UI+AUD+REP | Financeiro/contabilidade |
| CTB-002 | L1861-1959 | PCASP, fatos contábeis, regras configuráveis, receita, segurança, fechamento e consistências. | Produto/Configuração | P0 | P | UI+AUD+REP | Contabilidade |
| CTB-003 | L1960-2020 | Razões, relatórios configuráveis, consolidação por UG, créditos, permissões, liquidação e dotação. | Produto | P0 | A/P | UI+AUD+REP | Contabilidade/financeiro |
| TES-001 | L2021-2109 | Banco, remessa, Pix, transferências, conciliação, extratos, caixa, aplicações, receitas e borderôs. | Produto/Adapter | P0 | P/D | UI+AUD+SANDBOX | Tesouraria/bancos |
| PLN-001 | L2110-2162 | PPA: programas, metas, indicadores, avaliação, anexos e consolidação. | Produto/Configuração | P1 | P | UI+REP | Planejamento |
| PLN-002 | L2163-2199 | LDO: metas, riscos, projeções, anexos e consolidação. | Produto/Configuração | P1 | P | UI+REP | Planejamento |
| PLN-003 | L2200-2234 | LOA: programas, receita/despesa, créditos, cotas, cronograma e bloqueios. | Produto/Configuração | P1 | P | UI+REP | Planejamento/financeiro |
| CTB-004 | L2235-2253 | RREO, RGF, TCE, SIOPE, SIOPS, SICONFI, Reinf e prestação de contas. | Adapter | P0 | P/D | MOCK+SANDBOX | Contabilidade/integrações |

## 7. RH, folha e Portal do Servidor

| ID | Referência do TR | Capacidade agrupada | Camada | Pri. | Situação | Evidência | Decisor/responsável |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RH-001 | L2254-2369 | Cadastro funcional, dependentes, regimes, vínculos, admissões, documentos, avaliação, cursos e carreira. | Produto | P1 | P | UI+AUD+REP | RH |
| RH-002 | L2370-2539 | Férias, medicina, licenças, CAT, PPRA, CIPA, cedência, atos, vale-transporte, tempo de serviço e ponto. | Produto/Configuração | P1 | P | UI+AUD+REP | RH |
| RH-003 | L2540-2691 | Folhas, rescisão, variáveis, fórmulas, INSS/RPPS, provisões, diárias, teto, fechamento e transparência. | Produto | P0 | P | UI+AUD+REP | RH/financeiro |
| RH-004 | L2692-2749 | SEFIP, DIRF, RAIS, CAGED, MANAD, banco, consignação, TCE, SIOPE e obrigações. | Adapter | P1 | D | MOCK+SANDBOX | RH/integrações |
| RH-005 | L2750-2836 | Relatórios, contracheque, ficha, informe, PPP, gráficos e gerador de relatórios. | Produto | P1 | P | UI+REP | RH |
| RH-006 | L2837-2921 | eSocial: tabelas, eventos, validação, transmissão, recibos, diagnóstico e impacto. | Adapter | P0 | D | MOCK+SANDBOX | RH/integrações |
| PSE-001 | L2922-2971 | Portal do Servidor: acesso, solicitações, documentos, QR, avisos, férias, cursos e aprovações. | Produto | P1 | P | UI+AUD+REP | RH/portal |

## 8. Tributação, fiscalização e serviços fiscais

| ID | Referência do TR | Capacidade agrupada | Camada | Pri. | Situação | Evidência | Decisor/responsável |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TRB-001 | L2972-3132 | Cadastro único tributário, PF/PJ, endereço, imobiliário, BCI, valor venal, geografia e recadastramento. | Produto/Adapter | P0 | P/D | UI+AUD+MOCK | Tributação/cadastro |
| TRB-002 | L3133-3293 | IPTU, cadastro econômico, lançamento, DAM, processos, GFIP, NFS-e e contabilidade. | Produto/Configuração | P0 | P | UI+AUD+REP | Tributação/financeiro |
| TRB-003 | L3294-3438 | Junta/REDESIM, obrigações, calendários, índices, contribuição de melhoria, licenças, DAM, Pix e baixa. | Configuração/Adapter | P0 | P/D | UI+MOCK+SANDBOX | Tributação/integrações |
| TRB-004 | L3439-3706 | Crédito, compensação, restituição, judicial, benefícios, renúncia, agente arrecadador e débito automático. | Produto/Adapter | P1 | P/D | UI+AUD+MOCK | Tributação/financeiro |
| TRB-005 | L3707-4057 | Fiscalização, malha de ISS, OS, cruzamento, auto, produtividade, cobrança e parcelamento. | Produto | P1 | P | UI+AUD+REP | Tributação/fiscalização |
| TRB-006 | L4058-4319 | Portal do contribuinte, certificados, QR, autosserviço, dívida ativa, CDA, protesto, baixa e conciliação. | Produto/Adapter | P1 | P/D | UI+AUD+MOCK | Tributação/procuradoria |
| TRB-007 | L4320-4605 | Procuradoria, cartório/TJ, MNI, cemitério, taxas, gráficos e BI tributário. | Adapter/Produto | P2 | N/D | MOCK+REP | Procuradoria/tributação |
| ITBI-001 | L4606-4672 | Declaração ITBI, cálculo, protocolo, DAM, cartório, transferência e portal. | Produto/Adapter | P1 | P/D | UI+AUD+MOCK | Tributação/cartório |
| DTEL-001 | L4673-4726 | Domicílio tributário, procuração, ciência, caixa postal, certificados, e-mail/SMS e assinatura. | Produto/Adapter | P1 | P/D | UI+AUD+MOCK | Tributação/segurança |
| NFSE-001 | L4727-5133 | NFS-e: ABRASF, emissão, XML/RPS, assinatura, perfis, cancelamento, DMS, guias, Pix e validação pública. | Produto/Adapter | P0 | P/D | UI+AUD+MOCK | Tributação/NFS-e |
| SIM-001 | L5134-5213 | Simples: PGDAS/DAF607, cruzamentos, exclusão, parcelamento, dívida e alertas. | Adapter | P1 | D | MOCK+SANDBOX | Tributação/integrações |
| ISB-001 | L5214-5379 | ISS Bancário, DES-IF, COSIF, balancete, apuração, DAM, divergência e fiscalização. | Adapter | P2 | N/D | MOCK | Tributação/integrações |

## 9. Transparência, controle interno e meio ambiente

| ID | Referência do TR | Capacidade agrupada | Camada | Pri. | Situação | Evidência | Decisor/responsável |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TRA-001 | L5379-5464 | Portal responsivo, identidade, UG, acessibilidade, FAQ, dados de receita/despesa e transferências. | Produto/Configuração | P0 | A/P | UI+REP | Transparência |
| TRA-002 | L5465-5559 | Compras, contratos, patrimônio, folha, e-SIC, programas, obras, menus, busca, download e exportação. | Produto | P1 | P | UI+REP | Transparência/módulos origem |
| CINT-001 | L5560-5619 | Controle interno: legislação, calendário, auditoria, checklists, limites, cruzamentos, relatórios e dashboards. | Produto | P1 | P/N | UI+AUD+REP | Controle interno/BI |
| MMA-001 | L5619-5750 | Licenciamento, parecer, taxas, denúncias, geodados, condicionantes, DUA, portal, assinatura e autenticidade. | Produto/Adapter | P1 | P | UI+AUD+REP | Meio ambiente |

## 10. Gestão Educacional

| ID | Referência do TR | Capacidade agrupada | Camada | Pri. | Situação | Evidência | Decisor/responsável |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EDU-001 | L5750-5888 | Plataforma, acessibilidade, auditoria, backup, cadastro único, RBAC, escolas, dados de rede e Educacenso. | Produto/Infra/Adapter | P0 | P/D | UI+AUD+DOS+MOCK | Educação/DevOps |
| EDU-002 | L5888-6102 | Escolas, gestores, dashboard, lista de espera, portais, rastreamento, avisos e bloqueios pedagógicos. | Produto/Configuração/Adapter | P0 | P/D | UI+AUD+REP | Educação |
| EDU-003 | L6103-6289 | Período, currículo, calendário, cardápio, profissionais, turnos, matrizes, turmas, vagas e documentos. | Produto/Configuração | P0 | P | UI+REP | Educação |
| EDU-004 | L6290-6485 | Matrícula, transferência, remanejamento, atestados, horários, fichas e avaliação diagnóstica. | Produto | P0 | P | UI+AUD+REP | Educação |
| EDU-005 | L6485-6665 | Diário, frequência, notas, fechamento, histórico, rematrícula, supervisão e indicadores. | Produto | P0 | P | UI+AUD+REP | Educação |
| EDU-006 | L6665-7034 | Relatórios acadêmicos, censitários, estatísticos e exportações. | Produto/Adapter | P1 | P | REP+MOCK | Educação |
| EDU-007 | L7034-7551 | Pré-matrícula, vagas, lista de espera, Portal do Responsável e Portal do Professor. | Produto/Configuração | P1 | P/N | UI+AUD+REP | Educação/portal |
| EDU-008 | L7552-7690 | Portal do Estudante e aplicativo mobile. | Produto/POC | P2 | N | UI | Educação/produto |
| EDU-009 | L7690-7835 | Biblioteca: acervo, leitores, empréstimos, reservas e relatórios. | Produto | P2 | N | UI+REP | Educação |
| EDU-010 | L7835-8207 | Alimentação: administração, tabelas TACO, cardápios, nutrição, estoque, validade e relatórios. | Produto/Configuração | P1 | P/N | UI+REP | Educação/almoxarifado |
| EDU-011 | L8207-8460 | Recursos financeiros escolares, contas, OFX, conselhos, planos, cotações e prestações. | Produto/Adapter | P2 | P | UI+REP+MOCK | Educação/financeiro |
| EDU-012 | L8460-8600 | Transporte escolar, rotas, frota, GPS e relatórios. | Produto/Adapter | P2 | P/D | UI+REP+MOCK | Educação/frotas |
| EDU-013 | L8600-8765 | Portal interativo, jogos, rankings, mensagens e relatórios. | Produto/POC | P3 | N | UI | Educação/produto |

## 11. Gestão de Saúde

| ID | Referência do TR | Capacidade agrupada | Camada | Pri. | Situação | Evidência | Decisor/responsável |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SAU-001 | L8766-8942 | Plataforma de Saúde, requisito Java, segurança, backup, integridade, sessões e escopo por unidade. | Produto/Infra | P0 | P | UI+AUD+DOS | Arquitetura/jurídico |
| SAU-002 | L8942-9046 | Cadastros territoriais, pacientes, CEP/CNS e importação SCNES, CADSUS, SIA/SUS e SIGTAP. | Produto/Adapter | P0 | P/D | UI+MOCK | Saúde/integrações |
| SAU-003 | L9046-9273 | Unidades, turnos, CNES, profissionais, CBO, equipes, usuários, procedimentos, assinatura e relatórios. | Produto/Configuração | P0 | P | UI+AUD+REP | Saúde |
| SAU-004 | L9273-9643 | Agendamento, vagas, filas, acolhimento, painéis, cancelamento, restrições, WhatsApp e relatórios. | Produto/Adapter | P0 | P/D | UI+AUD+MOCK | Saúde/agenda |
| SAU-005 | L9643-9885 | Farmácia, RENAME, Horus/SIGAF, lotes, validade, dispensação, receitas, controlados e relatórios. | Produto/Adapter | P0 | P/D | UI+AUD+MOCK | Saúde/farmácia |
| SAU-006 | L9885-10103 | Produção e faturamento: competência, SIGTAP, BPA, FPO, RAAS, AIH, tetos e relatórios. | Produto/Adapter | P0 | N/D | MOCK+REP | Saúde/faturamento |
| SAU-007 | L10103-10380 | Gestão, acolhimento, pronto atendimento, Manchester, observação, leitos, AIH e relatórios. | Produto | P0 | P/N | UI+AUD+REP | Saúde/urgência |
| SAU-008 | L10380-10607 | Laboratório, equipamentos, coleta, resultados, assinatura, terceirizados, mapas e relatórios. | Produto/Adapter | P1 | P/N | UI+REP+MOCK | Saúde/laboratório |
| SAU-009 | L10607-10685 | Portal do Paciente, autenticação, agenda, medicamentos, exames, ouvidoria e benefícios. | Produto/Adapter | P1 | N | UI+MOCK | Saúde/portal |
| SAU-010 | L10685-10958 | Prontuário, triagem, consulta, prescrição, odontologia, cirurgia, notificações e relatórios. | Produto | P0 | P | UI+AUD+REP | Saúde/clínico |
| SAU-011 | L10958-11314 | Regulação, solicitações, filas, transporte sanitário, convênios, prestadores, painéis e relatórios. | Produto/Adapter | P0 | P/N | UI+AUD+REP | Saúde/regulação |
| SAU-012 | L11314-11823 | e-SUS/SISAB, territórios, famílias, domicílios, imunobiológicos, fichas, visitas, indicadores e sincronização. | Produto/Adapter | P0 | P/D | UI+MOCK | Saúde/integrações |
| SAU-013 | L11823-11881 | Aplicativo Android offline para ACS, visitas e sincronização. | Produto/POC | P2 | N | UI | Saúde/mobile |
| SAU-014 | L11881-12051 | Centro especializado, equipe multidisciplinar, plano terapêutico, insumos e relatórios. | Produto | P2 | N | UI+REP | Saúde/especialidades |
| SAU-015 | L12051-12107 | Vigilância sanitária: estabelecimentos, inspeções, denúncias, alvarás e relatórios. | Produto | P2 | N | UI+AUD+REP | Saúde/vigilância |

## 12. Assistência Social, BI, Portal Institucional, Custos, VAF e Assistência Virtual

| ID | Referência do TR | Capacidade agrupada | Camada | Pri. | Situação | Evidência | Decisor/responsável |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SOC-001 | L12107-12257 | Unidades, triagem, famílias, benefícios, CadÚnico, PAIF/PAEFI, visitas, PIA, geografia e relatórios SUAS/RMA. | Produto/Adapter | P1 | P/D | UI+AUD+REP+MOCK | Assistência social |
| BI-001 | L12257-12276 | BI: fontes, ETL, editor SQL, métricas, drill, permissões, exportações e geografia. | Produto | P1 | N | UI+REP | BI/arquitetura |
| POR-001 | L12276-12342 | Portal institucional, acessibilidade, CMS, permissões, publicação e administração. | Produto/Infra | P1 | P | UI+AUD | Portal/design |
| POR-002 | L12342-12433 | Menus, páginas, agenda, eventos, carrossel e newsletter. | Produto/Adapter | P1 | P/N | UI+MOCK | Portal/CMS |
| POR-003 | L12433-12575 | Notícias, galerias, questionários, enquetes, assinantes e audiodescrição. | Produto/Adapter | P2 | P/N | UI+MOCK | Portal/CMS |
| POR-004 | L12575-12694 | Acessos rápidos, redes sociais, links, telefones e repositório público/privado. | Configuração/Produto | P1 | P/N | UI+AUD | Portal/CMS |
| CUS-001 | L12694-12732 | Custos: centros, objetos, coleta, integrações, rateio, acumuladores, indicadores e relatórios. | Produto | P0 | N | UI+AUD+REP | Contabilidade/custos |
| VAF-001 | L12732-12917 | VAF: portais, EFD/GIA, fórmulas, CFOP, intimações, DTE, rankings e relatórios. | Produto/Adapter | P1 | N/D | UI+MOCK | Tributação/integrações |
| AV-001 | L12917-13016 | Assistência virtual: WhatsApp, webchat, chatbot, menus, APIs, anexos, consentimento e operação 24x7. | Produto/Adapter | P1 | N/D | UI+MOCK | Atendimento/integrações |

## 13. Implantação, capacitação, suporte e customização

| ID | Referência do TR | Capacidade agrupada | Camada | Pri. | Situação | Evidência | Decisor/responsável |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ENT-001 | L13016-13036 | Instalação, configuração, migração, carga, testes e prazo de implantação. | POC/Infra | P0 | N/P | DOS+REP | Implantação/DevOps |
| ENT-002 | L13036-13051 | Treinamento prático, materiais, certificados e ambiente de capacitação. | POC | P1 | N | UI+REP | Implantação/treinamento |
| ENT-003 | L13051-13069 | Suporte, atualização, monitoramento, atendimento remoto e documentação. | Infra | P1 | N/P | DOS | Operações/suporte |
| ENT-004 | L13069-13094 | Customizações, integrações, novos relatórios, análise de impacto e aceite. | Produto/POC | P2 | N | REP | Produto/comercial |

## 14. Corte de implementação aprovado para a base

### Construir primeiro como produto comum

- RBAC por ação, setor e unidade; auditoria e configuração versionada.
- Cadastro Único, GED, assinatura/verificação, workflow, notificações e `ReportEngine`.
- Administração, Processos/GED, Atendimento, Compras, Almoxarifado, Patrimônio, Financeiro, Contabilidade, Tesouraria e Transparência.
- Regras internas de Tributário, RH, Educação, Saúde e Assistência Social que não dependam de órgão, banco ou regra exclusiva de município.
- Seed sintético, testes, roteiros e evidências de POC.

### Parametrizar por município, sem código específico

- Identidade visual, organograma, módulos contratados, perfis e usuários.
- Calendários, prazos, workflows, assinantes, modelos e textos de documentos.
- Unidades gestoras, fontes, planos, alíquotas, parâmetros tributários e cadastros de domínio.
- Escolas, UBS, serviços, equipes, catálogos e regras locais de operação.

### Deixar para a última camada, salvo exigência expressa da POC

- TCE-ES, SICONFI, SIOPE, SIOPS, PNCP, eSocial, EFD-Reinf, Educacenso, SCNES/CNES, CADSUS, SIGTAP, e-SUS/SISAB, Horus/SIGAF, SERPRO, REDESIM, NFS-e, Simples, DES-IF, cartórios, TJ/MNI, bancos/CNAB/Pix, GPS, e-mail, SMS e WhatsApp.
- Credenciais, certificados, homologações, contratos, ambientes de sandbox e produção.
- Dados institucionais e roteiros exclusivos de Divino de São Lourenço.

## 15. Decisões registradas para prosseguimento

| ID | Decisão provisória para liberar desenvolvimento | Condição para revisão |
| --- | --- | --- |
| DEC-001 | A base de código será reutilizada com uma instância e banco separados por prefeitura. Multi-tenancy compartilhado fica fora da POC. | Projeto específico de isolamento, migração e testes de segurança. |
| DEC-002 | Integrações externas terão contrato, MOCK e log desde o núcleo; produção só será iniciada por exigência confirmada e com credencial. | Item selecionado pela comissão ou requisito contratual eliminatório. |
| DEC-003 | Nenhum código deve conter nome, CNPJ, regra, layout, certificado ou credencial de Divino. | Exceção formal aprovada por produto/jurídico. |
| DEC-004 | Aderência será calculada somente com evidência de UI, permissão, persistência, auditoria e relatório/documento quando aplicável. | Não aplicável. |
| DEC-005 | Os itens de infraestrutura serão comprovados por dossiê e teste operacional, não por inferência do código. | Contrato e documentação do provedor disponíveis. |
| DEC-006 | O requisito textual de Java em Saúde permanece risco técnico-jurídico e não será declarado atendido pela stack atual. | Parecer formal da contratante ou decisão de produto. |
| DEC-007 | Dados da POC devem ser sintéticos, reexecutáveis e separados da base padrão. | Autorização formal e LGPD para qualquer dado real. |

## 16. Pendências externas que não bloqueiam o início do Ciclo 1

- Confirmação dos itens efetivamente selecionados pela comissão para a POC.
- Parecer jurídico sobre assinatura ICP/X.509, política de auditoria e requisito Java em Saúde.
- Contratação/evidência do provedor para backup, recuperação, firewall, redundância e monitoramento.
- Credenciais, certificados, layouts atualizados e sandboxes dos órgãos e fornecedores externos.
- Dados municipais, modelos de documentos, parâmetros financeiros/tributários e identidade visual de Divino.

Essas pendências permanecem rastreadas. Elas bloqueiam apenas os grupos que as referenciam, não o desenvolvimento da fundação reutilizável dos Ciclos 1 e 2.

## 17. Próximo marco

O próximo trabalho é executar o **Ciclo 1**, iniciando por `C1-001` a `C1-006` da matriz inicial: catálogo de configuração por instância, permissões por ação, auditoria consultável, contrato do `ReportEngine`, contrato de integrações e central de notificações.

## 18. Execução registrada - Ciclo 5

**Data:** 19 de agosto de 2026
**Status:** concluído como fluxo vertical demonstrável.

O ciclo integra a solicitação aprovada, processo de compra, contrato vigente, recebimento com recebedor e atestador distintos, entrada de estoque vinculada ao recebimento, solicitação de despesa de valor integral, reserva, empenho, liquidação, pagamento e projeções já existentes de contratos, despesas e licitações no Portal da Transparência.

Também foi incluído o tombamento de bem permanente a partir de item de recebimento aprovado. O vínculo é persistido entre `Asset` e `PurchaseReceiptItem`, limita o tombamento à quantidade efetivamente recebida e registra evento de auditoria.

**Evidências técnicas:** `tests/c5-procurement-policy.test.ts`, `src/lib/patrimonio/__tests__/asset-acquisition-service.test.ts`, telas de Recebimentos, Orçamento e Bens Patrimoniais, e migrações `20260817180000_add_c5_procurement_receipt_lifecycle` e `20260819090000_add_c5_asset_receipt_traceability`.

## 19. Execução registrada - Ciclo 6

**Data:** 19 de agosto de 2026
**Status:** concluído como fechamento financeiro e de transparência da cadeia comum.

Reservas originadas de recebimentos aprovados passam a indicar e preencher o contrato e fornecedor corretos ao emitir o empenho. A referência do recebimento acompanha as telas de empenhos, liquidações e pagamentos, bem como o acompanhamento financeiro do contrato.

O Portal da Transparência publica apenas o número e a data do recebimento, associados a contrato e processo. Nenhum identificador interno, documento GED, servidor responsável, lote, estoque ou dado pessoal é exposto.

**Evidências técnicas:** `tests/public-finance.test.ts` e as projeções de `src/lib/transparencia/portal-fiscal.ts`, com build de produção aprovado.
