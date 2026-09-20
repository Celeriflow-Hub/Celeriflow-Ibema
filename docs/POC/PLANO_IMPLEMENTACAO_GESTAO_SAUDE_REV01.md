# Plano de implementacao da POC de Gestao de Saude

Referencia: `CeleriFlow_POC_Gestao_de_Saude_Desenvolvimento_REV01.md`, REV01 de 19/09/2026, e Termo de Referencia pp. 241-305.

## Objetivo e criterio de uso

Este plano confronta a POC com o modulo existente, organiza as 933 exigencias em entregas verificaveis e registra o que depende de decisao, outro modulo ou contraparte externa. Ele nao declara conformidade contratual, homologacao SUS ou aceite da comissao.

Os IDs da fonte permanecem imutaveis. A numeração reinicia em cada prefixo; `SAU-ADM-001` e `SAU-FAR-001` nao sao o mesmo requisito. O documento de origem contem o contrato individual, demonstracao e criterio de aceite de cada ID. Esta matriz os agrupa apenas para orientar desenvolvimento, teste e evidencia sem perder cobertura.

Regras de execucao:

- Preservar Next.js, Prisma, PostgreSQL/Neon, sessao Firebase, dados existentes e migrations historicas.
- Criar somente migrations incrementais e reversiveis por operacao; nunca resetar banco, semear producao ou fazer backfill especulativo.
- Validar e autorizar toda mutacao no servidor. Formularios chamados por `await` retornam `{ error: string }` para a UI; formularios com `action={...}` retornam `void` e lancam erros esperados.
- Manter fatos clinicos, cancelamentos e evidencias de auditoria; nao registrar conteudo clinico, CPF, receita ou evolucao no ledger de auditoria.
- Reutilizar Pessoa, RH, Estoque, Frotas, Contratos, Processos, Documentos e Relatorios como origens autorizadas. Saude nao recria seus cadastros ou escreve diretamente em tabelas de outro modulo.
- Nao apresentar mock, HTTP 200, arquivo local ou menu como prova de integracao externa ou aceite oficial.

## Diagnostico inicial do repositorio

| Area atual | Estado encontrado | Lacuna principal |
|---|---|---|
| Unidades, profissionais, equipes e pacientes | CRUD basico em `src/app/app-domain/saude/*`, com autorizacao de modulo nas Actions | Faltavam validacao de entrada, transacao composta, auditoria de mutacao e varias regras de integridade. |
| Agenda e atendimentos | Consultas somente leitura de `HealthAppointment` e `MedicalRecord` | Faltavam agendar, cancelar, transitar estados e registrar atendimento. |
| Farmacia e vacinacao | Listagens de lotes e registros existentes | Nao ha entrada, dispensacao, estoque por unidade, controle de lote ou registro operacional. |
| Relatorios e e-SUS | Telas estaticas | Nao havia guarda de modulo, emissao, exportacao, lote ou conector. |
| Privacidade e escala | Algumas consultas carregavam entidades completas para Client Components | Faltavam projecoes minimas, filtros e paginacao real no servidor. |
| Seguranca operacional | RBAC global existente em `tenant-context.ts` | Ainda nao existe escopo clinico por unidade/equipe/profissional para leituras e operacoes. |

O modelo legado ja possui `HealthUnit`, `HealthTeam`, `HealthProfessional`, `Patient`, `HealthAppointment`, `MedicalRecord`, `Medicine`, `MedicineBatch`, `MedicineDispensation`, `Vaccine`, `VaccinationRecord`, `HealthPrescription`, `HealthExamRequest` e `HealthReferral`. A existencia dos modelos nao equivale ao fluxo funcional correspondente.

## Cobertura integral por pacote

| Pacote e IDs | Funcionalidades e acoes a implementar | Teste/evidencia obrigatoria | Estado e dependencias |
|---|---|---|---|
| H01, `SAU-TEC-001..064` (64) | Arquitetura, acesso, senha/sessao, auditoria, validacao, integridade, backup/PITR, escopo de empresa/unidade, pessoas, CBO, CEP e exportacoes. | H-BASE com U-A/U-B, perfis distintos, bloqueio por tela/API/download, historico, restore isolado, todos os formatos e navegadores realmente testados. | Parcial no nucleo. Java, Java 6, Windows XP, FreeBSD, ODBC/ADO, PITR e capacidade fisica exigem verificacao de infraestrutura e H-Q01. |
| H02, `SAU-ADM-001..064` (64) | Cargas SCNES/CADSUS/SIA/SIGTAP; unidades, profissionais, equipes, especialidades, servicos, CBO, acessos, documentos, unificacao, laboratorio, feriados e relatorios. | H-ADM: duas unidades, tres profissionais, duas especialidades, reimportacao idempotente, inativacao com motivo/data e unificacao autorizada sem perder atendimentos. | Parcial em cadastros. Depende de Pessoas/RH, CNES/CADSUS/SIGTAP/SIA e assinatura ICP-Brasil. |
| H03, `SAU-AGE-001..088` (88) | Grupos, cronogramas, vagas por unidade/tipo, fila, agenda, cancelamento, remanejamento, bloqueios, WhatsApp, espera, portal, acolhimento, guias, painel e relatorios. | H-AGE: cinco vagas divididas entre U-A/U-B, devolucao unica no cancelamento, disputa pela ultima vaga e relatorio com 12 linhas reais. | Base operacional iniciada nesta revisao. Cronogramas, cotas, fila, dupla custodia, WhatsApp, guias e emissao permanecem a implementar. |
| H04, `SAU-FAR-001..073` (73) | Catalogo, estoque/lote por unidade, RENAME, Hórus/SIGAF, entradas, NF, validade, dispensacao, transferencias, perdas, pedidos, controlados, transparencia e relatorios. | H-FAR: L1=60/L2=40, dispensacao, transferencia com transito/aceite, baixa idempotente e lote bloqueado. | Apenas listagem. Depende de origem de estoque, Hórus/SIGAF, RENAME, NF-e/GMP, dispositivos e decisoes H-Q04/H-Q06/H-Q07/H-Q09. |
| H05, `SAU-PRO-001..071` (71) | Competencia, tabelas, producao assistencial, consistencias, BPA, FPO, RAAS, AIH, teto, fechamento e relatorios. | H-PRO: E1/E2 totalizam tres procedimentos e R$ 50; fato agendado fica fora; reenvio nao duplica; competencia fechada bloqueia mudanca. | A implementar. Depende de fatos de origem, CNES/SIGTAP/SIA e leiautes/validadores oficiais; H-Q03/H-Q08. |
| H06, `SAU-GER-001..021` (21) | Historico transversal, cartao, acolhimento, ouvidoria, documentos, acessos, auditoria, graficos e relatorios. | H-GER: dois agendamentos, um atendimento e uma dispensacao aparecem como quatro fatos tipificados; resposta de ouvidoria sem vazamento. | A implementar sobre fatos reais dos outros pacotes e Ouvidoria/Processos. |
| H07, `SAU-PA-001..058` (58) | Recepcao, triagem, fila, atendimento direto, observacao, leitos, transferencia, prescricao, procedimentos, laudos, Manchester e relatorios. | H-PA: tres recepcoes, uma triagem, dois atendimentos, transferencia L1 para L2 sem dupla ocupacao e calculo de espera. | A implementar. Protocolos clinicos, modelos/documentos e dispositivos requerem H-Q05/H-Q06. |
| H08, `SAU-LAB-001..071` (71) | Exames/modelos, solicitacao, coleta, amostras, resultados, revisao, liberacao, portal, terceiros, cotas, interfaces e relatorios. | H-LAB: S1/X1/X2, resultado parcial, reenvio idempotente, campo calculado e campo oculto na impressao. | A implementar. Depende de PEP, assinatura e A15/HL7/ZPL/equipamento real. |
| H09, `SAU-POR-001..022` (22) | Identidade do paciente, agenda/confirmacao/cancelamento, historicos, dados, ouvidoria e laudos liberados. | H-PAC: P1 ve somente seus fatos liberados; X2 pendente e P2 ficam restritos; cancelamento repetido nao cria vaga. | A implementar. Requer identidade separada, vinculos familiares autorizados, e-mail e servicos de origem. |
| H10, `SAU-PEP-001..060` (60) | Recepcao, triagem, fila, atendimento medico/odontologico, historico, documentos, receita, exames, encaminhamentos, odontograma, cirurgia e relatorios. | H-PEP: autoria/data, pedido unico ao laboratorio, receita sem dispensacao automatica, odontograma com historico e IMC apenas aritmetico. | Base de registro de atendimento iniciada nesta revisao. PEP longitudinal, assinatura, odontologia, integracoes e producao permanecem a implementar. |
| H11, `SAU-REG-001..104` (104) | Setores, prestadores, cotas, solicitacao, fila, protocolo, retorno, TFD, transporte, guias, portal prestador, indicadores e relatorios. | H-REG: recurso de R$ 1.000 com reserva/realizacao/cancelamento corretos, transporte com capacidade e guia exclusiva por prestador. | A implementar. Reutiliza Pessoas, Contratos e Frotas; nao cria financeiro paralelo. |
| H12, `SAU-SIS-001..143` (143) | Territorio, familias, domicilios, fichas e-SUS, visitas, atividades, procedimentos, alimentacao, vacinacao, indicadores, sincronismo e relatorios. | H-SIS: visita com duas participacoes, participantes reais versus estimados e lote de 20 doses menos aplicacoes/perdas. | A implementar. Depende de dominios SUS, vinculos vigentes e contrato e-SUS/LEDI/SISAB. |
| H13, `SAU-MOB-001..018` (18) | Aplicativo Android Java, banco local, offline, sincronismo, itinerario, conflito e troca de dispositivo. | H-MOB: desligar rede, registrar, reabrir, sincronizar duas vezes e testar conflito. | `AGUARDA_DECISAO_CANAL` para os 18 IDs. A aplicacao web nao comprova cliente Java nativo, banco local ou offline. |
| H14, `SAU-ESP-001..055` (55) | Centro especializado, equipes, catalogos, planos terapeuticos, evolucoes, ostomia, nutricao, documentos e relatorios. | H-ESP: plano com duas especialidades/tres evolucoes e cota 10, entrega 4, tentativa 7 recusada. | A implementar, reutilizando Agenda/Farmacia/PEP/Producao sem duplicar fatos. |
| H15, `SAU-VIG-001..021` (21) | Estabelecimentos, risco, denuncia, alvara, inspecao, protocolo, autoria e relatorios. | H-VIG: dois estabelecimentos/riscos, denuncia anonima, tres inspecoes, reenvio sem duplicidade e relatorio publico redigido. | A implementar. Depende de Cadastros, Tributario/Meio Ambiente quando forem origem e de H-Q10. |

A soma dos pacotes e `64 + 64 + 88 + 73 + 71 + 21 + 58 + 71 + 22 + 60 + 104 + 143 + 18 + 55 + 21 = 933`. Nao ha classificacao P0/P1 na fonte; a ordem abaixo e de engenharia e nao substitui a prioridade clinica, de regulacao ou do TR.

## Sequencia de implementacao

| Fase | Escopo e resultado verificavel | Requisitos principalmente atendidos |
|---|---|---|
| F0 - fundacao segura | Projecoes minimas, RBAC em todas as telas, validacao Zod, transacoes, auditoria sem payload, integridade cadastral, agenda e registro clinico basicos. | H01, H02, H03 e H10, de forma parcial e local. |
| F1 - administracao sanitaria | Vigencias de unidade/equipe/profissional, especialidades/CBO/servicos, cargas manuais ou importadores versionados, unificacao autorizada e relatorios administrativos. | H02. |
| F2 - agenda e acolhimento | Cronogramas, vagas atomicas por unidade, fila/espera, remanejamento, bloqueios, comprovantes e relatorios. | H03 e partes de H07/H09/H10/H11/H14. |
| F3 - prontuario e cuidado | PEP longitudinal, triagem, autoria/versionamento, prescricao, solicitacoes, encaminhamentos, odontologia e pronto atendimento. | H07, H08, H10 e H14. |
| F4 - farmacia e vacinacao | Estoque por unidade, lotes, entradas, dispensacao, transferencias, perdas, vacinas, controles e transparencia redigida. | H04, H12 e H14. |
| F5 - regulacao, producao e SISAB | Cotas, TFD/transporte, fatos de producao, competencia, arquivos SUS, territorio e fichas e-SUS. | H05, H11 e H12. |
| F6 - portais, vigilancia e gerencial | Portal de paciente/prestador, ouvidoria, BI/relatorios, vigilancia e documentos publicos redigidos. | H06, H09 e H15. |
| F7 - integracao e homologacao | Conectores reais, assinatura, dispositivos, arquivos oficiais, ambientes autorizados, ensaio em navegadores/dispositivos e evidencia por ID. | H01-H15 conforme SA-EXT01..08 e SA-DEP01..02. |

## Entrega F0 desta revisao

1. Corrigir o contrato de erro das Actions chamadas por Client Components para que autorizacao e validacao retornem erro tratavel pela UI.
2. Validar todas as entradas dos CRUDs atuais no servidor, verificar referencias ativas e manter a criacao Pessoa + Paciente em uma unica transacao.
3. Gravar evidencia append-only de cada mutacao administrativa por ator, tipo e identificador de alvo, sem dados clinicos.
4. Implantar agenda basica: criar agendamento, prevenir conflito do mesmo paciente/profissional no mesmo instante, movimentar estados permitidos e registrar cancelamento com motivo e instante.
5. Implantar atendimento basico: profissional autenticado registra sinais/evolucao informados, o registro fica vinculado uma unica vez ao agendamento e o atendimento e concluido na mesma transacao.
6. Proteger Relatorios e e-SUS pela mesma verificacao de modulo aplicada nas demais telas; os conectores e emissoes continuam pendentes.
7. Adicionar testes unitarios para politica de estados, datas e validacoes; executar testes focados e build antes da entrega.

## Contratos de teste por fase

| Categoria | Casos minimos |
|---|---|
| Autorizacao e privacidade | Perfil sem `SAUDE` nao abre tela, chama Action ou emite arquivo; perfil de consulta nao confirma mutacao; pagina nao envia campos nao usados ao Client Component. |
| Persistencia e auditoria | Cada mutacao bem-sucedida cria fato e `AuditEvent` sem payload; reabrir em outra sessao preserva fato/historico. |
| Cadastros | Pessoa duplicada, CNS repetido, unidade/equipe/profissional inativos, equipe de outra unidade e exclusao com vinculo sao recusados sem escrita parcial. |
| Agenda | Agendar paciente/profissional ativo, disputar mesmo instante, transicoes validas/invalidas, cancelamento com motivo e sem reativacao silenciosa. |
| Atendimento | Somente profissional autenticado elegivel registra; agendamento de outro profissional, cancelado, faltou ou ja atendido e recusado; um agendamento gera no maximo um prontuario. |
| Escala e UX | Busca alem da primeira pagina, filtros e paginacao no servidor, zoom de 200%, teclado e Chrome movel antes de marcar cada pacote como validado localmente. |
| Integracoes | Reenvio, rejeicao, indisponibilidade, origem/versao/competencia/UUID e retorno da contraparte. Mock interno fica `TESTADO_COM_SIMULADOR`, nunca homologado. |

## Dependencias e decisoes abertas

| Ref. | Necessidade | Decisao/evidencia necessaria |
|---|---|---|
| H-Q01 | Java, plataformas, navegadores, SGBD, backup e capacidade | Inventario de infraestrutura e ensaios reais; nao alterar stack sem decisao. |
| H-Q02 | SISAB Mobile | Autorizacao explicita para app Android Java, banco local e offline. |
| H-Q03 | CNES/CADSUS/SIGTAP/SIA, BPA/FPO/RAAS/AIH e e-SUS | Leiautes/versionamento, ambiente autorizado, credenciais e validador/retorno. |
| H-Q04 | Hórus/SIGAF no ES | Destinatario aplicavel, contrato e credenciais. |
| H-Q05 | Protocolos clinicos | Responsavel tecnico, versoes, parametros e limites de uso. |
| H-Q06 | A15/HL7/ZPL, webcams, impressoras e ICP-Brasil | Modelo, protocolo, equipamento/certificado e homologacao autorizada. |
| H-Q07/H-Q08/H-Q09 | Regras ambiguas de farmacia e producao | Interpretacao formal para transferencia, retroatividade e “lucro por paciente”. |
| H-Q10 | Sigilo, retencao, modelos e publicacao | Politica institucional de acesso clinico, documentos, dados anonimos e relatarios publicos. |

## Registro de evidencia e encerramento

Cada ID da matriz de origem deve receber: estado (`EXISTE_NAO_TESTADO`, `A_IMPLEMENTAR`, `PARCIAL`, `VALIDADO_LOCAL`, `TESTADO_COM_SIMULADOR`, `INTEGRACAO_TESTADA_HOMOLOGACAO`, `DEPENDENCIA_OUTRO_MODULO` ou `DEPENDENCIA_EXTERNA`), rota/servico real, usuario/perfil, dados DEMO, acao, resultado, persistencia, arquivo emitido e dependencia/decisao.

Nao usar percentual unico para combinar funcao local, simulador e integracao oficial. Um requisito so fica concluido quando todas as acoes da sua citacao, inclusive estados negativos e origem/destino quando aplicaveis, tiverem evidencia especifica.
