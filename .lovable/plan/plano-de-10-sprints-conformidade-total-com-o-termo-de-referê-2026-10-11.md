# Plano de 10 sprints — conformidade total com o Termo de Referência (PE 36/2026 – Ibema/PR)

## Base usada
- Termo de Referência: Quadro de Módulos (35 módulos da Prefeitura + 10 da Câmara), Especificações Funcionais do Executivo (itens 1.1 a 1.7xx), Descritivo da Câmara, Funcionalidades Gerais, Requisitos de Padrão Tecnológico e Segurança (100 itens), Data Center e Checklist real da POC.
- Diagnósticos existentes em `docs/` (Frotas 1–50, Folha/eSocial, SST, Construção Civil, Cemitérios, Assistência Social, Almoxarifado/Patrimônio, Planejamento).
- Regra de aprovação: **mínimo de 90% por módulo** (sem média entre módulos), 90% na etapa de segurança, "parcial" conta como "não atende", demonstração presencial em um dia por módulo, e **100% em até 90 dias** após o Plano de Implantação.

## Correção de rumo obrigatória
O sistema herdou a prestação de contas SAGRES (TCE-PB, Cacimba de Dentro). Ibema/PR presta contas ao **TCE-PR (SIM-AM / SIM-AP)**. O SAGRES é mantido apenas como adaptador inativo; a Sprint 2 cria o adaptador TCE-PR.

## Formato de execução
Cada sprint é dividida em **frentes paralelas independentes** (uma por agente), com arquivos próprios, para não haver conflito. Toda frente entrega: tabelas e migração, regras no servidor com permissão por setor, telas, relatórios (PDF/XLSX/CSV), testes do fluxo e uma linha "ATENDE" comprovada na matriz de conformidade. Uma sprint só fecha com o build aprovado e a matriz atualizada.

---

## Sprint 1 — Matriz de conformidade e fundação transversal
- **Frente A – Matriz:** extrair todos os itens numerados dos PDFs para `MATRIZ_CONFORMIDADE_IBEMA.md` (módulo, item, texto, estado C/P/N, evidência: tela, regra, teste). Substitui a matriz da POC de Cacimba.
- **Frente B – Segurança (100 itens):** confrontar os requisitos tecnológicos: senha forte e expiração, bloqueio por tentativas, 2º fator, sessão com expiração, log de acesso e de alteração (antes/depois) em todas as tabelas, perfil por módulo/rotina/operação, restrição por setor, LGPD (consentimento, anonimização, exportação de dados do titular), HTTPS, backup/restauração documentados.
- **Frente C – Funcionalidades Gerais:** gerador de relatórios com brasão de Ibema, exportação em PDF/XLSX/CSV/TXT/HTML, assinatura eletrônica, anexos em 14 formatos (png, bmp, jpg, gif, doc, docx, ppt, pptx, xls, xlsx, pdf, odt, ods, dwg), busca global, ajuda contextual, notificações internas.
- **Frente D – Cadastro único:** pessoas, empresas, endereços (logradouros/bairros de Ibema), setores e centros de custo compartilhados por todos os módulos, sem duplicação.

## Sprint 2 — Frota parte 1: cadastro, patrimônio, condutores e agenda (itens 1.568–1.578, 1.585, 1.597–1.602, 1.605, 1.608)
- **A – Cadastro do veículo:** espécie, cor, combustível, capacidade do tanque, tipo de marcador (hodômetro, horímetro, sem marcador), centro de custo, dados de seguro, aquisição; campos configuráveis e obrigatórios por tipo de máquina.
- **B – Catálogo FIPE:** tabela de marcas/modelos versionada, com carga e consulta de modelos; vínculo no cadastro do veículo.
- **C – Bateria e anexos:** identificação/marca da bateria e histórico de trocas com custo; anexos por veículo, multa, pagamento e sinistro nos 14 formatos.
- **D – Condutores:** cadastro ligado ao RH ou terceirizado; CNH (número, categoria, validade); bloqueio no servidor de condutor sem CNH, com CNH vencida ou com 20 pontos ou mais.
- **E – Agenda e guarita:** agenda por veículo, setor e condutor (viagem, serviço, conserto, períodos de obrigação) com bloqueio de conflitos; guarita com saída e entrada em tempo real, horários, leitura e condutor em posse; destinos e rotas fixas.
- **F – Adaptador TCE-PR:** estrutura do SIM-AM/SIM-AP (leiautes versionados, validação, geração, protocolo), começando pelo módulo de frota.

## Sprint 3 — Frota parte 2: autorizações, combustível, oficina, multas e sinistros (itens 1.579–1.584, 1.586–1.596, 1.603–1.617)
- **A – Autorizações:** abastecimento e serviço numerados (emitida, usada, cancelada), impressão em branco e preenchida, limites e validade; despesa gerada a partir da autorização.
- **B – Combustível:** ligação com licitação/contrato e consulta de saldo licitado; estoque próprio do combustível (origem própria ou de terceiros); frentista do posto lança o abastecimento com acesso restrito à sua autorização; média por veículo com classificação alto/normal/baixo.
- **C – Manutenção:** OS avulsa e planejada, revisões, lubrificação, troca de óleo, oficina própria ou de terceiros; despesas ligadas a ordem de compra, dispensa ou licitação; troca de pneus com despesa automática única.
- **D – Obrigações e multas:** seguro obrigatório e facultativo, licenciamento, débitos consolidados; tabela de infrações do CTB; multas com cidade, infração, condutor, vencimento, pontos, pagamento e comprovante; consulta dedicada.
- **E – Ocorrências e sinistros:** coordenada geográfica (mapa), sinistro gerado a partir da ocorrência, responsabilidade (própria, terceiros, outros), seguradora com apólice preenchida automaticamente, oficina de encaminhamento, partes envolvidas (veículo, proprietário, condutor).
- **F – Relatórios:** despesas por setor, período, veículo e fornecedor; dossiê de 1 ou vários veículos; planilha de deslocamento para preenchimento; consultas de manutenções e taxas previstas e realizadas. Meta: **50/50 ATENDE** no checklist de Frota.

## Sprint 4 — Planejamento, Contabilidade, Controle Interno e Custos
- **A – Planejamento e Orçamento:** PPA, LDO, LOA, audiências, alterações orçamentárias, decretos, cronograma de desembolso, metas fiscais (Prefeitura e Câmara).
- **B – Contábil e Financeiro:** PCASP, MCASP, empenho/liquidação/pagamento, restos a pagar, conciliação, tesouraria, RREO/RGF, SICONFI (MSC, DCA), Anexos da Lei 4.320, fechamento mensal, integração automática com Folha, Compras, Patrimônio, Almoxarifado, Frota e Tributos.
- **C – Controle Interno:** checklists, auditorias, achados, planos de ação, alertas de limites constitucionais (saúde, educação, pessoal).
- **D – Gestão e Controle de Custos (módulo novo):** custos por centro de custo, programa e serviço público, apropriação de folha, frota, almoxarifado e depreciação, painéis comparativos.
- **E – TCE-PR:** leiautes SIM-AM de contabilidade e orçamento.

## Sprint 5 — Compras, Licitações, Almoxarifado e Patrimônio
- **A – Compras e Licitações:** Lei 14.133 completa (DFD, ETP, TR, pesquisa de preços, modalidades, atas de registro de preço, contratos, aditivos, fiscalização), PNCP, portal do fornecedor.
- **B – Almoxarifado:** requisições, inventário, ponto de reposição, validade, lotes, custo médio, integração com contabilidade.
- **C – Patrimônio:** tombamento, transferência, depreciação/reavaliação, inventário com leitor, baixa, seguros, integração imediata com Frota.
- **D – Câmara:** Compras e Patrimônio da Câmara com base separada.

## Sprint 6 — Folha, eSocial e Segurança e Medicina do Trabalho
- **A – Folha:** cálculos e tipos de folha, RPPS/INSS e IRRF do ano, consignados, férias, 13º, rescisão, cálculo retroativo, simulações, CNAB, contracheque online; Câmara com folha própria.
- **B – eSocial e EFD-Reinf:** todos os eventos (S-1000 a S-3000, SST S-2210/2220/2240), transmissão, retorno, painel de pendências; DCTFWeb, DIRF/informe.
- **C – SST:** PGR, PCMSO, ASO, CAT, LTCAT, EPI com ficha de entrega, afastamentos integrados à folha.
- **D – TCE-PR:** leiaute SIM-AP (pessoal).

## Sprint 7 — Tributação completa
- **A – IPTU:** cadastro imobiliário, cálculo com planta genérica, revisões, isenções, emissão de carnês.
- **B – ISS e Nota Fiscal Eletrônica:** ISS fixo, estimado e homologado; NFS-e nacional (padrão ABRASF/Nacional), RPS, cancelamento e substituição, DES-IF para bancos.
- **C – ITBI:** pedido online, avaliação, guia, integração com cartório.
- **D – Receitas Diversas, Arrecadação e Dívida Ativa:** taxas, baixa bancária (CNAB/Pix), conciliação, inscrição, CDA, protesto, execução fiscal, parcelamento (REFIS).
- **E – Escrita Fiscal e Fiscalização Fazendária:** declaração do prestador/tomador, malha fiscal, ações fiscais, autos de infração, termos, cruzamento com Simples Nacional.

## Sprint 8 — Saúde, Faturamento, Atenção Primária, Farmácia e Regulação
- **A – Gestão da Saúde e Assistência:** prontuário, agenda, pronto atendimento, TFD com frota.
- **B – Faturamento (módulo novo):** BPA, APAC, AIH, SIA/SIH, críticas e exportação.
- **C – Atenção Primária:** e-SUS/SISAB, visitas, cadastro domiciliar, indicadores do Previne.
- **D – Farmácia:** dispensação, controlados, BNAFAR, estoque por unidade.
- **E – Central de Regulação:** filas, cotas, autorizações, prioridades e transparência da fila.

## Sprint 9 — Atendimento ao cidadão e demais módulos
- **A – Assistência Social:** CadÚnico, PAIF/PAEFI, benefícios eventuais, RMA, prontuário SUAS.
- **B – Construção Civil, Cemitérios e Serviços Públicos:** alvarás, habite-se, sepultamentos, ordens de serviço públicas com geolocalização.
- **C – Protocolo e Processo Digital:** tramitação, assinatura, prazos, protocolo da Câmara.
- **D – Portais:** Autoatendimento, Contribuinte (com parcelamento online), Transparência (Lei 131 e LAI, Prefeitura e Câmara), Ouvidoria/e-SIC.
- **E – Câmara:** Gestão de Legislação (proposições, sessões, votações, normas consolidadas).
- **F – Aplicativo Mobile:** app instalável com serviços do cidadão, servidor e motorista, uso offline e notificações.

## Sprint 10 — Homologação, migração de dados e ensaio da POC
- **A – Migração:** importadores dos sistemas atuais (servidores, contribuintes, imóveis, dívida, patrimônio, frota) com relatório de inconsistências.
- **B – Dados de demonstração de Ibema:** carga fictícia coerente em todos os módulos.
- **C – Testes:** fluxos completos por módulo, concorrência, permissões e restrição por setor.
- **D – Desempenho, acessibilidade e data center:** tempos de resposta, contraste, teclado, leitor de tela, backup e restauração testados.
- **E – Roteiro da POC:** roteiro item a item por módulo, cabendo em um dia, com evidências e ata; meta de 100% por módulo.

---

## Detalhes técnicos
- Uma pasta de domínio por frente (`src/lib/<modulo>`, `src/app/app-domain/<modulo>`), migrações em `prisma/migrations-ibema` com nome por frente para evitar colisão; arquivos compartilhados (`schema.prisma`, menus) editados só pelo agente integrador ao final de cada sprint.
- Regras de `AGENTS.md`: nada de substituição em massa, conferir quem usa uma função antes de mudar a assinatura, manter o padrão de retorno de erro das ações, rodar o build antes de fechar.
- Escopo por setor e permissão por operação verificados no servidor em toda leitura, alteração, relatório e download; idempotência por `requestId`; valores com `Decimal`; datas civis com fuso definido.
- Dependências externas (tratadas com pendência explícita, sem simular integração): leiautes oficiais do TCE-PR, tabela FIPE, tabela do CTB, certificado A1, credenciais da NFS-e Nacional e do eSocial, convênios bancários e chave Pix, lista de feriados de Ibema.

## Primeira execução (sprint única com agentes em paralelo)
Por sua escolha, a primeira rodada executa **Sprints 2 e 3 (Frota completa)** com 6 agentes em paralelo (Frentes A–F de cada sprint agrupadas por arquivos), mais 1 agente produzindo a matriz da Sprint 1. As demais sprints seguem na mesma mecânica após a sua aprovação.
