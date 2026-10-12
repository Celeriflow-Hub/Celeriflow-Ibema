# Matriz de requisitos da Saúde — páginas 222–255

Complemento obrigatório de [PLANO_GERAL_SAUDE_CHECKLIST_222-255.md](PLANO_GERAL_SAUDE_CHECKLIST_222-255.md). Data: 12/10/2026.

Fonte: `docs/Termo de Referencia/Checklist real POC MÓDULOS EXECUTIVO e CAMARA.pdf`. Cada linha corresponde a um item original, com síntese operacional; o texto integral da fonte prevalece. A coluna de fechamento inclui as condições essenciais, não apenas o título do requisito.

## Legenda

- **I:** ação/estrutura específica localizada no código; conferir o fluxo completo antes de encerrar o item.
- **P:** implementação parcial, estrutura genérica ou requisito com condições adicionais ainda não fechadas.
- **N:** capacidade específica não localizada nos caminhos analisados; implementar sobre as bases citadas, após reconferência do repositório.
- **E:** intercâmbio oficial pendente ou não comprovado; a base encontrada usa outro contrato/processamento.

I não significa conformidade integral nem operação executada no banco. Não houve comprovação operacional nesta análise. Ausência de um nome numa busca, isoladamente, não comprova ausência funcional; as classificações consideram também as telas, contratos, serviços e modelos descritos no plano.

**Bases E01–E12:** mapa de telas, serviços e tabelas na seção 2 do plano geral. Na linha N, a base indica o ponto de integração/reaproveitamento, não a existência da capacidade específica. **Fases F01–F12:** entregas da seção 7. Múltiplas fases indicam que o item só se encerra depois de todos os componentes.

## 1. Gestão da Saúde — GS — 42 itens

| ID | Página | Requisito sintetizado | Situação / base | Fase | Fechamento necessário |
|---|---:|---|---|---|---|
| GS-001 | 222 | Pessoa no padrão e-SUS | P · E01/E07 | F01 | Nome, nascimento, sexo, CNS e raça/cor no fluxo cadastral; validar campos exigidos. |
| GS-002 | 223 | Filiação obrigatória ou desconhecida | P · E01 | F01 | Mãe/pai e desconhecimento de cada filiação; regra aplicada ao cadastro completo. |
| GS-003 | 223 | Familiaridade socioafetiva | N · E01/E12 | F01 | Registrar relações socioafetivas estruturadas e consultáveis. |
| GS-004 | 223 | Endereço completo | P · E01 | F01 | CEP, município, tipo/logradouro, bairro e número pela tela de paciente. |
| GS-005 | 223 | Endereço comercial | P · E01 | F01 | Tipo comercial e vínculo ao cidadão, sem substituir endereço residencial. |
| GS-006 | 223 | Estabelecimento responsável | I · E01/E02 | F01 | Conferir vínculo à unidade de referência e sua consulta/alteração. |
| GS-007 | 223 | Telefone, celular e e-mail | P · E01 | F01 | Expor/atualizar contatos comuns e regras e-SUS pelo cadastro de Saúde. |
| GS-008 | 223 | Telefones adicionais e parentesco | N · E01 | F01 | Vários contatos com grau de parentesco, além de dois campos telefônicos. |
| GS-009 | 223 | Idade de obrigatoriedade do CPF | N · E01 | F01 | Parametrizar idade e compatibilizar CPF obrigatório no schema/actions atuais. |
| GS-010 | 223 | Foto do paciente | N · E01/E11 | F01 | Upload, vínculo e exibição no cadastro, com arquivo persistido. |
| GS-011 | 223 | Horários para contato | N · E01 | F01 | Registrar faixas e apresentar nos fluxos de contato/busca ativa. |
| GS-012 | 223 | Ocupação/local de trabalho | P · E01/E12 | F01 | Situação laboral, ocupação e local; reaproveitar dados comuns/perfil social autorizado. |
| GS-013 | 224 | Pré-cadastro e atualização obrigatória | N · E01 | F01 | Permitir campos reduzidos e exigir complementação ao vencer a política aplicável. |
| GS-014 | 224 | Atualização cadastral | P · E01 | F01 | Action atual altera perfil; completar dados da pessoa, contatos e endereços. |
| GS-015 | 224 | Validade do pré-cadastro | N · E01/E02 | F01 | Prazo configurável e data-base da validade. |
| GS-016 | 224 | Validade do cadastro | N · E01/E02 | F01 | Prazo/data de revisão com vencimento calculado. |
| GS-017 | 224 | Validade por unidade e urgência | N · E01/E04 | F01 | Política por unidade; atendimento de urgência pode admitir cadastro desatualizado. |
| GS-018 | 224 | Pesquisa cadastral avançada | P · E01 | F01 | Nome, CPF, CNS, nascimento e sexo combináveis na consulta. |
| GS-019 | 224 | Registro de contato telefônico | N · E01/E08 | F01 | Data, usuário, contato e resultado vinculados ao cidadão. |
| GS-020 | 224 | Prontuário físico digitalizado | P · E01/E11 | F01 | Anexar e consultar pelo paciente, não somente pelo atendimento aberto. |
| GS-021 | 224 | Impressão da ficha cadastral | P · E01/E11 | F01 | Modelo cadastral completo emitido pelo próprio cadastro. |
| GS-022 | 224 | CADSUS por CPF | E · E01/E10 | F12 | Consulta nacional por CPF e seleção dos dados retornados. |
| GS-023 | 224 | CADSUS por nome+nascimento | E · E01/E10 | F12 | Pesquisa avançada exige a combinação dos dois campos. |
| GS-024 | 225 | Cartão de saúde configurável | P · E11 | F01 | Cartão nacional/modelo alterável; emissão a partir do paciente. |
| GS-025 | 225 | Falecimento pelo cadastro | P · E01 | F01 | Registrar óbito pelo paciente e refletir em `Person`/situação do paciente. |
| GS-026 | 225 | Registro do óbito | N · E01 | F01 | Data de emissão e município do registro, além da data do falecimento. |
| GS-027 | 225 | Motivo/CID do óbito | N · E01/E03 | F01 | Condições/causas estruturadas e vínculo ao CID. |
| GS-028 | 225 | Histórico integral do paciente | P · E11/E03/E08 | F04/F05/F07 | Médicos, odontológicos, dispensações, receitas, urgência, exames, esperas de consultas/exames/programas e vacinas; ampliar timeline. |
| GS-029 | 225 | Unificação de duplicidades | P · E01/E11 | F01 | Transferir todas as relações de paciente, inclusive laboratório/regulação/TFD/produção e as novas tabelas. |
| GS-030 | 226 | Histórico de alterações cadastrais | P · E01/E11 | F01 | Mostrar campo, anterior/novo, data e autoria; evento genérico não substitui detalhe. |
| GS-031 | 226 | Pasta documental do paciente | P · E01/E11 | F01 | Vínculo ao paciente/pessoa e consulta central dos documentos. |
| GS-032 | 226 | SIGTAP e seus relacionamentos | E · E02 | F11 | Importar pacote oficial, incluir/atualizar procedimentos e relações por competência. |
| GS-033 | 226 | SIGTAP automático por competência | E · E02/E10 | F11 | Criação de competência aciona atualização e registra resultado/versão. |
| GS-034 | 226 | Unidades por CNES XML | E · E02 | F11 | Suportar XML de origem CNES e atualização das unidades existentes. |
| GS-035 | 226 | CNES: estabelecimento/profissional/vínculo | E · E02 | F11 | Importar as três entidades e reconciliar os relacionamentos. |
| GS-036 | 226 | Mantenedoras | N · E02 | F01 | Nome/CNPJ/endereço, banco, serviços de apoio e caracterização do estabelecimento. |
| GS-037 | 226 | Unidade responsável BNAFAR | N · E02/E10 | F01/F12 | Relacionar unidades ao responsável pelo envio e usar o vínculo na remessa. |
| GS-038 | 226 | Profissionais com contato/endereço | P · E02 | F01 | Usar cadastro comum/RH, expor contatos/endereço na Saúde e evitar duplicação. |
| GS-039 | 226–227 | Expediente por profissional/unidade | P · E02/E04 | F01 | Entrada/saída por vínculo; turno da unidade não substitui expediente individual. |
| GS-040 | 227 | Vínculos profissionais | P · E02 | F01 | Criação/alteração de unidade, especialidade e carga horária com vigência. |
| GS-041 | 227 | Gráficos de evolução anual | P · E11 | F10 | Séries anuais de dispensação, vacinas, visitas, consultas médicas e odontológicas. |
| GS-042 | 227–228 | Indicadores APS e busca ativa | P · E11/E03/E07 | F05/F10 | Gestante/puérpera, idoso, hipertenso, diabético, infantil, mulher/câncer, e-Multi e odontologia; listas com telefone/endereço. |

## 2. Gestão do Faturamento — GF — 43 itens

| ID | Página | Requisito sintetizado | Situação / base | Fase | Fechamento necessário |
|---|---:|---|---|---|---|
| GF-001 | 228 | Inclusão de convênios | P · E02/E08 | F01/F09 | Perfil assistencial e cadastro utilizável pela agenda antes de F03; completar gestão de faturamento em F09. |
| GF-002 | 228 | Procedimentos por convênio | N · E02/E08 | F01/F09 | Cobertura com vigência disponível antes da agenda; valores/tabelas complementados no faturamento. |
| GF-003 | 228 | Unidade/convênio/procedimento | N · E02/E08 | F01/F09 | Definir executáveis por unidade antes da agenda e impedir vinculação incompatível em todos os fluxos. |
| GF-004 | 228 | Grupo/subgrupo de procedimentos | P · E02 | F09 | Filtros e gerenciamento sobre o catálogo SIGTAP. |
| GF-005 | 228 | Procedimento por profissional e crítica | P · E03/E10 | F04/F09 | Gerar ato correspondente à especialidade e alertar durante o lançamento. |
| GF-006 | 228 | Farmácia e unidade enviadora BNAFAR | N · E02/E05 | F01/F12 | Configurar responsável distinto para unidade exclusiva de controle farmacêutico. |
| GF-007 | 228 | Prestadora da demanda espontânea | N · E02/E04 | F01/F09 | Configuração por unidade refletida na produção espontânea. |
| GF-008 | 228 | Tabelas auxiliares e preços | N · E02/E10 | F09 | Procedimentos e valores específicos com vigência/referência de cálculo. |
| GF-009 | 228 | APAC em SIA/SUS sem redigitação | E · E10/E03 | F09/F11 | Gestor de origem APAC e adaptador de arquivo SIA a partir dos laudos/programas. |
| GF-010 | 229 | AIH em SIH/SUS sem redigitação | E · E10/E03 | F09/F11 | Laudo/internação de origem e adaptador SIH; arquivo próprio atual não fecha o formato. |
| GF-011 | 229 | BPA-C/BPA-I magnético | E · E10 | F09/F11 | Geração separada, monitoramento e formatos exigidos derivados da produção. |
| GF-012 | 229 | BPA agrupado ou por unidade | P · E10 | F09/F11 | Escolha agrupada/individual aplicada aos dois formatos BPA e à competência. |
| GF-013 | 229 | Custo do paciente até desfecho | P · E03/E05/E10/E11 | F09 | Reconciliar procedimentos, materiais, medicamentos e exames por episódio/paciente. |
| GF-014 | 229 | Prévias por unidade/profissional/geral | P · E10/E11 | F09 | Estimativa antes da fatura, filtros e valores pelas regras vigentes. |
| GF-015 | 229 | Produção manual de implantação | I · E10 | F09 | Conferir cadastro, competência aberta, origem manual e crítica; sem duplicar captura automática. |
| GF-016 | 229 | RAAS domiciliar/psicossocial | E · E07/E10 | F02/F05/F09/F11 | Registrar dados adequados nas origens e exportar RAAS sem entrada adicional. |
| GF-017 | 229–230 | Envio e-SUS sem redigitação | E · E07/E10 | F12 | Gerar/envio a partir dos registros operacionais, além de validação interna. |
| GF-018 | 230 | API e-SUS de faturamento | E · E10 | F12 | Adaptador API, configuração, transmissão e retorno correlacionado. |
| GF-019 | 230 | RIRA: requisições/lista de espera | E · E08/E10 | F10/F12 | Contrato próprio versionado/receptor e posterior comunicação ao destino oficial. |
| GF-020 | 230 | RNDS: vacinas autorizadas | E · E06/E10 | F07/F12 | Configuração de vacinas autorizadas e envio/retorno RNDS. |
| GF-021 | 230 | Consolidação BNAFAR | E · E05/E10 | F12 | Dados farmacêuticos e transmissão conforme responsável e contrato confirmado. |
| GF-022 | 230 | BPA consolidado impresso | P · E10/E11 | F09 | Documento consolidado por competência/unidade com totais de origem. |
| GF-023 | 230 | BPA individualizado impresso | P · E10/E11 | F09 | Documento por paciente/procedimento com campos individuais exigidos. |
| GF-024 | 230 | Prévia BPA impressa | P · E10/E11 | F09 | Prévia reconciliada com produção e críticas antes de fechamento. |
| GF-025 | 230 | Órgãos emissores | N · E02/E10 | F09 | Cadastro conforme Portaria DATASUS 637/2005 e vínculo à autorização. |
| GF-026 | 230 | Faixa AIH | N · E10 | F09 | Número inicial/final, validade, saldo e consumo exclusivo. |
| GF-027 | 230 | Laudo AIH detalhado | N · E03/E10 | F09 | Paciente, diagnóstico, procedimentos e profissionais com origem clínica. |
| GF-028 | 231 | Impressão automática do laudo AIH | N · E11 | F09 | Emitir após inclusão e manter o vínculo ao laudo gravado. |
| GF-029 | 231 | AIH paga manualmente | N · E10 | F09 | Identificar pagamento manual com autoria/data, independente de autorização. |
| GF-030 | 231 | Aprovação/glosa/arquivo AIH | N · E10 | F09 | Estados, motivos e registro automático das decisões. |
| GF-031 | 231 | Autorização AIH individual | N · E10 | F09 | Próxima AIH válida pré-carregada e consumida ao autorizar. |
| GF-032 | 231 | Autorização AIH coletiva | N · E10 | F09 | Seleção de laudos, numeração sem colisão e resultado individual. |
| GF-033 | 231 | AIH em duas vias | N · E11 | F09 | Paciente, solicitação, autorização e autorizador nas duas vias. |
| GF-034 | 231 | Cancelar AIH com senha parametrizada | N · E10 | F09 | Configuração de senha, registro de ação/usuário e regra para a numeração. |
| GF-035 | 231 | Saída e óbito da internação | P · E01/E04/E10 | F09 | Registrar saída; alta por óbito atualiza cadastro, data e usuário. |
| GF-036 | 231 | Faixa APAC | N · E10 | F09 | Validade, números disponíveis e consumo exclusivo. |
| GF-037 | 231 | Laudo APAC detalhado | N · E03/E10 | F09 | Paciente, diagnóstico, exames e procedimentos com vínculos de origem. |
| GF-038 | 232 | Aprovação/glosa/arquivo APAC | N · E10 | F09 | Decisões registradas automaticamente com autoria/motivos. |
| GF-039 | 232 | Autorização APAC individual | N · E10 | F09 | Próxima APAC disponível pré-carregada e validade vinculada. |
| GF-040 | 232 | APAC em duas vias | N · E11 | F09 | Paciente, solicitação, autorização e validade. |
| GF-041 | 232 | Cancelamento APAC | N · E10 | F09 | Ação e usuário registrados automaticamente; histórico preservado. |
| GF-042 | 232 | Renovação APAC vencida | N · E10 | F09 | Novo laudo baseado no anterior após vencimento, sem substituir histórico. |
| GF-043 | 232 | Permanência APAC inicial | N · E10 | F09 | Somente inicial e não vencida, com motivo obrigatório. |

## 3. Gestão da Atenção Primária — AP — 41 itens

| ID | Página | Requisito sintetizado | Situação / base | Fase | Fechamento necessário |
|---|---:|---|---|---|---|
| AP-001 | 232 | Família com abrangência e classificação | P · E07/E12 | F02 | Responsável/endereço/unidade/equipe/classe/tipo sobre família comum. |
| AP-002 | 232 | Integrantes e parentesco | I · E07/E12 | F02 | Conferir vínculo à pessoa e sincronização dos perfis familiares. |
| AP-003 | 232 | Histórico de composição familiar | P · E07/E12 | F02 | Entrada/saída/mudança com período, usuário e consulta de movimentos. |
| AP-004 | 233 | Pasta documental familiar | N · E07/E11 | F02 | Anexos vinculados à família e acesso pelo gestor familiar. |
| AP-005 | 233 | Domicílio conforme ficha e-SUS | P · E07 | F02 | Atributos completos da ficha domiciliar/territorial, além do código e microárea. |
| AP-006 | 233 | Família/domicílio/área/microárea | I · E07 | F02 | Conferir organização territorial e consulta dos vínculos, sem duplicar família. |
| AP-007 | 233 | Transferência familiar | N · E07/E12 | F02 | Novo domicílio ou fora do município com histórico da localização anterior. |
| AP-008 | 233 | Imunobiológico e-SUS/RNDS | P · E06/E05 | F07 | Cadastro e mapeamento versionado dos códigos/regras necessários. |
| AP-009 | 233 | Incompatibilidades e intervalo | N · E06 | F07 | Relação entre vacinas e intervalo permitido aplicado na carteira. |
| AP-010 | 233 | ESAVI ligado ao imunobiológico | N · E06 | F07 | Gestor de evento e vínculo à vacina/aplicação/paciente quando aplicável. |
| AP-011 | 233 | Lesão e conduta ESAVI | N · E06/E03 | F07 | Campos estruturados e histórico da conduta. |
| AP-012 | 233 | Fabricante e código RNDS | N · E06/E05 | F07 | Cadastro de fabricantes e código de produtor documentado. |
| AP-013 | 233 | Diluentes | N · E05/E06 | F07 | Produto tipo diluente e relação ao imunobiológico. |
| AP-014 | 234 | Calendário vacinal | N · E06 | F07 | Dose, estratégia e faixa etária com versão/vigência. |
| AP-015 | 234 | Campanhas de vacinação | N · E06 | F07 | Início/fim e informações de divulgação. |
| AP-016 | 234 | Carteira e ações vacinais | P · E06/E11 | F07 | Calendário do cidadão; aplicação, indicação, resgate e aprazamento pela carteira. |
| AP-017 | 234 | Contraindicação na carteira | N · E06 | F07 | Registro individual por imunobiológico refletido nas pendências. |
| AP-018 | 234 | Aplicação completa | P · E06 | F07 | Pessoa/profissional/data selecionável/estratégia/grupo/local e persistência. |
| AP-019 | 234 | Profissional da indicação | N · E06 | F07 | Vínculo ao registro de indicação e consulta na aplicação/carteira. |
| AP-020 | 234 | Estoque vacinal e diluentes | P · E05/E06 | F06/F07 | Controlar ambos e distinguir doses/frasco/unidade de estoque. |
| AP-021 | 234 | Entrada de vacinas | P · E05/E06 | F07 | Produto/lote/validade/doses por frasco/quantidade. |
| AP-022 | 234 | Baixa de doses | I · E05/E06 | F07 | Conferir saída por aplicação/perda com unidade de dose consistente. |
| AP-023 | 235 | Bloqueio de lote vacinal | I · E05/E06 | F07 | Bloqueio impede aplicação e aparece na consulta do lote. |
| AP-024 | 235 | Requisição/transferência entre unidades | P · E05/E06 | F07 | Pedido ligado à transferência, envio e aceite até conclusão. |
| AP-025 | 235 | Inventário vacinal | P · E05/E06 | F07 | Gestor de inventário por lote/dose e ajustes; acerto isolado não fecha gestor. |
| AP-026 | 235 | Carteira impressa | P · E06/E11 | F07 | Calendário/situação/histórico, não somente lista de aplicações. |
| AP-027 | 235 | Certidão de regularidade vacinal | N · E06/E11 | F07 | Situação calculada pelas regras e documento emitido pelo cidadão. |
| AP-028 | 235 | Pendências e busca ativa vacinal | P · E06/E11 | F07 | Atual relatório vazio deve calcular pendências pelo calendário individual. |
| AP-029 | 235 | Atividade coletiva por tipo | P · E07 | F02 | Gestor operacional além da ficha genérica; autoria e participantes. |
| AP-030 | 235 | Temas/práticas por tipo | P · E07 | F02 | Listas/regras por tipo e armazenamento estruturado. |
| AP-031 | 235 | Procedimento da atividade coletiva | N · E07/E10 | F02/F09 | Vínculo ao procedimento e geração de produção sem redigitação. |
| AP-032 | 235 | Atenção domiciliar | P · E07/E03 | F02 | Solicitação, avaliação e atendimentos relacionados. |
| AP-033 | 235 | Elegibilidade e atendimento e-SUS | P · E07 | F02 | Conjunto de campos/regras exigidos e decisão de elegibilidade persistida. |
| AP-034 | 236 | Modalidade/CID/caráter domiciliar | P · E07/E03 | F02 | Campos estruturados na avaliação/atendimento domiciliar. |
| AP-035 | 236 | Solicitação antes da avaliação | N · E07 | F02 | Avaliação precede atendimento e ambos apontam ao pedido. |
| AP-036 | 236 | Marcadores de consumo alimentar | P · E07 | F02 | Completar ficha de marcadores, faixas etárias e histórico; refeição isolada é insuficiente. |
| AP-037 | 236 | Visita domiciliar | I · E07 | F02 | Conferir família/domicílio/agente/data e consulta da visita. |
| AP-038 | 236 | Integrante novo pela visita | P · E07/E12 | F02 | Inclusão contextual pela visita e atualização da composição comum. |
| AP-039 | 236 | Ausência de integrantes | P · E07 | F02 | Registrar por integrante e na visita, não apenas desfecho geral da ficha. |
| AP-040 | 236 | Recusa da visita | P · E07 | F02 | Desfecho/motivo persistidos no gestor de visita e ficha correspondente. |
| AP-041 | 236 | Antropometria/sinais vitais na visita | N · E07/E03 | F02 | Valores por pessoa, data e unidade de medida vinculados à visita. |

## 4. Assistência à Saúde — AS — 74 itens

| ID | Página | Requisito sintetizado | Situação / base | Fase | Fechamento necessário |
|---|---:|---|---|---|---|
| AS-001 | 236 | Consultas agendadas por profissional | I · E04 | F03 | Conferir gerenciador e filtros no perfil/unidade autorizados. |
| AS-002 | 236 | Escuta inicial pelo gerenciador | P · E03/E04 | F04 | Acesso contextual à escuta, sem perder paciente/agendamento. |
| AS-003 | 236 | Atendimento pelo gerenciador | I · E03/E04 | F04 | Iniciar/abrir prontuário a partir da consulta e manter a origem. |
| AS-004 | 237 | Demanda espontânea na mesma central | I · E03/E04 | F04 | Inclusão e gerenciamento contextual com o mesmo núcleo clínico. |
| AS-005 | 237 | Chamada no painel da unidade | P · E04 | F03 | Evento de chamada existe; entregar painel consumidor por unidade. |
| AS-006 | 237 | Vacinação pela central agendada | P · E04/E06 | F04/F07 | Abrir aplicação contextual e persistir no mesmo histórico vacinal. |
| AS-007 | 237 | Indicação de triagem realizada | I · E03/E04 | F04 | Estado visual coerente com a triagem registrada. |
| AS-008 | 237 | Procedimentos preenchidos pelos atos | P · E03/E10 | F04/F09 | Regras de geração por ato e origem; não exigir lançamento duplicado. |
| AS-009 | 237 | Biometria multiprofissional | N · E03/E04 | F04/F12 | Habilitação/troca de profissional e interface de leitor; conexão/captura na implantação. |
| AS-010 | 237 | Campos por especialidade | N · E03 | F04 | Configuração de campos/grupos, obrigatoriedade e consumo no atendimento. |
| AS-011 | 237 | Requisição de exame no atendimento | I · E03 | F04 | Conferir pedido persistido, ordem laboratorial e origem no prontuário. |
| AS-012 | 237 | Avaliação clínica de exames | P · E03 | F04 | Avaliar exame/resultado durante atendimento e registrar parecer. |
| AS-013 | 237 | Datas/alteração/prestador do exame | P · E03 | F04 | Realização, resultado, alteração e prestador na avaliação. |
| AS-014 | 237 | Resultado integrado no atendimento | P · E03/E10 | F04/F12 | Exibir laudo recebido do prestador, correlacionado à requisição e paciente. |
| AS-015 | 238 | Questionário obrigatório por condição | P · E03/E07 | F04 | Questionário clínico personalizável e regra por condição; ficha e-SUS/laboratorial não substitui. |
| AS-016 | 238 | Problemas/condições e evolução | P · E03 | F04 | Condição longitudinal, início e narrativa; CID do episódio é somente parte. |
| AS-017 | 238 | Prescrição completa | P · E03 | F04 | Posologia/quantidade/tipo de uso/dias estruturados e documentados. |
| AS-018 | 238 | Contrarreferência de especialista | P · E03/E08/E12 | F04 | Registro específico de retorno relacionado ao encaminhamento e atendimento. |
| AS-019 | 238 | Medicamento manipulado | P · E03/E05 | F04 | Tipo de receita, descrição e posologia; nome livre não fecha classificação. |
| AS-020 | 238 | Separação automática de receitas | N · E03 | F04 | Agrupar conforme tipo/classificação dos medicamentos prescritos. |
| AS-021 | 238 | Separação manual de receitas | N · E03 | F04 | Organizar itens e emitir receitas separadas preservando prescrição. |
| AS-022 | 238 | Receituários padrões | P · E03/E05/E11 | F04 | Modelo de receita com itens/posologias reutilizáveis; modelo por medicamento é apenas base. |
| AS-023 | 238 | Administração no atendimento | N · E03/E05 | F04/F06 | Medicamento/dose/profissional/data; estoque da unidade ou propriedade do paciente. |
| AS-024 | 239 | Materiais da administração | N · E03/E05 | F04/F06 | Materiais/quantidades e movimentos associados ao ato. |
| AS-025 | 239 | Notificação de agravo | P · E03 | F04 | Tipo e data dos primeiros sintomas vinculados ao atendimento/paciente. |
| AS-026 | 239 | Blocos por grupo de atendimento | P · E03/E07 | F04/F05 | Habilitar blocos de gestação/crônicos e outros configurados pelo grupo. |
| AS-027 | 239 | Indicativo alérgico | N · E03 | F04 | Alergia estruturada e alerta visível no atendimento. |
| AS-028 | 239 | Indicativo de uso contínuo | P · E03/E05 | F04 | Estado de medicamento em uso, início/fim e indicação no atendimento. |
| AS-029 | 239 | Histórico anterior por privilégio | P · E03/E11 | F04 | Histórico no atendimento, com escopo aplicado a cada origem consultada. |
| AS-030 | 239 | Desfecho em observação | P · E03/E04 | F04 | Criar/vincular episódio ao concluir; hoje desfecho e observação são separados. |
| AS-031 | 239 | Evolução de todo o episódio | P · E03/E04 | F04 | Consulta da observação e de suas evoluções com origem/autoria. |
| AS-032 | 239 | Família durante o atendimento | P · E01/E07/E12 | F02/F04 | Responsável, composição e domicílio comuns; informação social autorizada. |
| AS-033 | 239 | Consumo alimentar e histórico | P · E03/E07 | F02/F04 | Registrar/consultar marcadores alimentares por paciente no atendimento. |
| AS-034 | 239–240 | Voz em todos os campos textuais | N · E03 | F04 | Captação/transcrição com revisão nos campos de texto do atendimento. |
| AS-035 | 240 | Atestado/comparecimento no desfecho | P · E03/E11 | F04 | Emitir documentos pela finalização, preenchidos com atendimento/paciente. |
| AS-036 | 240 | Receita no desfecho | P · E03/E11 | F04 | Formato de receituário com itens/posologia e origem persistida. |
| AS-037 | 240 | Espelho com triagem e atendimento | P · E03/E11 | F04 | Documento integral dos dados de escuta/triagem/atendimento. |
| AS-038 | 240 | Guia de encaminhamento no desfecho | P · E03/E08/E11 | F04 | Guia derivada do encaminhamento registrado, com destino e motivo. |
| AS-039 | 240 | Assinatura digital dos documentos | P · E11 | F04 | Usar fluxo de assinatura da plataforma no desfecho e consultar versão assinada. |
| AS-040 | 240 | Modelos de documentos formatáveis | P · E11 | F04 | Criar/formatar modelos e disponibilizar na finalização. |
| AS-041 | 240 | Alteração após atendimento por horas | N · E03 | F04 | Parametrizar janela e revisão; remover conflito com bloqueio absoluto de concluído. |
| AS-042 | 240 | Chegada espontânea e urgência | I · E03/E04 | F04 | Motivo/sintomas/classificação e registro na fila. |
| AS-043 | 240–241 | Núcleo completo na demanda espontânea | P · E03/E04 | F04 | Chamada/triagem/exames/evolução/prescrição/administração/encaminhamento/desfecho. |
| AS-044 | 241 | Documentos do atendimento espontâneo | P · E03/E11 | F04/F08/F09 | Receita/atestado/comparecimento/guia/BPA-I/TFD/espelho conforme dados do episódio. |
| AS-045 | 241 | Vacinação pelo atendimento | P · E03/E06 | F04/F07 | Aplicação contextual no mesmo paciente e carteira. |
| AS-046 | 241 | Justificativa de não atendimento | P · E04 | F04 | Falta ou não atendimento com motivo persistido/consultável. |
| AS-047 | 241 | Rastreamento citopatológico | N · E03 | F05 | Elegibilidade, exame, resultado e situação para acompanhamento/busca ativa. |
| AS-048 | 241 | Acompanhamento de mamografias | N · E03 | F05 | Solicitação/realização/resultado e acompanhamento da população enquadrada. |
| AS-049 | 241 | Gestante pelo atendimento e gestor | P · E03/E07 | F05 | Cadastro de gestação aberto no atendimento e acompanhado em gestor próprio. |
| AS-050 | 241 | DPP/idade gestacional automáticas | N · E03/E07 | F05 | Cálculos com DUM/ultrassom e referência temporal preservada. |
| AS-051 | 241–242 | Dados iniciais da gestação | P · E03/E07 | F05 | DUM/ultrassom/peso/altura/tipo/gravidez anterior/último preventivo. |
| AS-052 | 242 | Blocos por trimestre | N · E03 | F05 | Dados/evoluções organizados por primeiro/segundo/terceiro trimestre. |
| AS-053 | 242 | Consulta puerperal | N · E03 | F05 | Idade gestacional, tipo/local do parto e condições clínicas. |
| AS-054 | 242 | Aborto na consulta puerperal | N · E03 | F05 | Desfecho registrado com histórico da gestação. |
| AS-055 | 242 | Desfecho administrativo gestacional | N · E03 | F05 | Motivo e justificativa sem apagar acompanhamentos prévios. |
| AS-056 | 242 | IMC gestacional por semana | N · E03/E11 | F05 | Gráfico de medidas com semanas e cálculo de origem. |
| AS-057 | 242 | Indicação de gestante no atendimento | P · E03/E07 | F05 | Derivar da gestação ativa, não somente marca de uma ficha. |
| AS-058 | 242 | Gestor de hipertensão/diabetes | P · E03 | F05 | Pressão/glicemia/fatores de risco/complicações e acompanhamento longitudinal. |
| AS-059 | 242 | Indicação hipertenso/diabético | N · E03 | F05 | Exibir a condição registrada no momento do atendimento. |
| AS-060 | 242 | Encaminhamento interno para fila | P · E03/E04/E08 | F04 | Selecionar fila de destino e mover o paciente mantendo o episódio. |
| AS-061 | 243 | Atendimento odontológico | P · E03/E07 | F05 | Agendado e espontâneo com dados e procedimentos odontológicos estruturados. |
| AS-062 | 243 | Triagem odontológica | P · E03/E04 | F05 | Disponível pelo gerenciador odontológico e vinculada ao episódio. |
| AS-063 | 243 | Odontograma visual | N · E03 | F05 | Representação interativa persistida por paciente/atendimento. |
| AS-064 | 243 | Arcadas adulta/infantil/ambas | N · E03 | F05 | Alternância das representações com estruturas dentais corretas. |
| AS-065 | 243 | Situação do dente | N · E03 | F05 | Marcação e histórico da situação por dente. |
| AS-066 | 243 | Procedimento por dente | N · E03/E10 | F05/F09 | Relacionar ato ao dente e à produção do atendimento. |
| AS-067 | 243 | Tipo de marcação odontológica | N · E03 | F05 | Dente/arcada/quadrante/boca/sextante com significado próprio. |
| AS-068 | 243 | Evolução odontológica | P · E03 | F05 | Núcleo de evolução disponível e associado às marcações/procedimentos. |
| AS-069 | 243 | Sessões fisioterapia/psicologia | P · E12/E03 | F05 | Plano/sessões e estados; contador de evoluções não substitui controle de sessões. |
| AS-070 | 243 | Informações SISPRENATAL | P · E03/E07/E10 | F05/F10/F12 | Dados gestacionais estruturados e contrato próprio; adequação ao padrão confirmado na integração. |
| AS-071 | 243 | Informações HIPERDIA | P · E03/E10 | F05/F10/F12 | Dados crônicos estruturados e contrato próprio; adequação ao padrão confirmado na integração. |
| AS-072 | 243 | Painéis por unidade | N · E04 | F03 | Cadastro/configuração e exibição de chamada pela unidade. |
| AS-073 | 244 | Mensagem da chamada | N · E04 | F03 | Mensagem configurável aplicada ao evento de chamada. |
| AS-074 | 244 | Notícias no painel | N · E04 | F03 | Conteúdo municipal configurado e exibido no painel da unidade. |

## 5. Assistência Farmacêutica — AF — 57 itens

| ID | Página | Requisito sintetizado | Situação / base | Fase | Fechamento necessário |
|---|---:|---|---|---|---|
| AF-001 | 244 | Produto/CATMAT | P · E05 | F06 | Código CATMAT no cadastro e vínculo ao material único. |
| AF-002 | 244 | Unidade de fornecimento | P · E05 | F06 | Expor unidade de fornecimento e distingui-la da unidade de estoque quando necessário. |
| AF-003 | 244 | Princípio ativo | I · E05 | F06 | Conferir cadastro/consulta e associação ao medicamento. |
| AF-004 | 244 | Apresentação | I · E05 | F06 | Conferir comprimido/pomada/tubo/frasco e uso na prescrição/dispensação. |
| AF-005 | 244 | Classificação RENAME | P · E05 | F06 | Campo de pertencimento e referência/versionamento da lista. |
| AF-006 | 244 | Classificação REMUME | N · E05 | F06 | Campo de pertencimento à relação municipal e consulta. |
| AF-007 | 244 | Lista DCB Anvisa 2007 com CAS | P · E05 | F06 | Catálogo com substância/número DCB/CAS; campo DCB isolado é insuficiente. |
| AF-008 | 244 | Recomendação no receituário | P · E05/E03 | F06 | Recomendação por produto e inclusão na impressão da receita. |
| AF-009 | 244 | Entrada no estoque | I · E05 | F06 | Conferir entrada e atualização de saldo somente após aprovação quando configurada. |
| AF-010 | 244 | Consulta das entradas | P · E05/E11 | F06 | Gerenciador com todas as entradas e detalhes/estado, além do relatório por nota. |
| AF-011 | 245 | Dados da nota fiscal | P · E05 | F06 | Nota, emissão e demais dados do recebimento expostos na entrada. |
| AF-012 | 245 | XML da nota fiscal | N · E05 | F06 | Importar XML fiscal e mapear fornecedor/itens/lotes quando disponíveis; não usar parser genérico de catálogo. |
| AF-013 | 245 | Tipo de entrada | I · E05 | F06 | Conferir fornecedor/doação/ajuste e regras por tipo. |
| AF-014 | 245 | Doação exige só nome do doador | N · E05 | F06 | Não exigir fornecedor/documentação cadastral do doador além do nome. |
| AF-015 | 245 | Itens do recebimento | I · E05 | F06 | Vários itens associados à mesma entrada com consulta. |
| AF-016 | 245 | Lote/validade/quantidade/custo obrigatórios | P · E05 | F06 | Exigir validade no contrato/tela e demais campos; hoje validade pode ficar ausente. |
| AF-017 | 245 | Fabricante na entrada | N · E05 | F06 | Identificar fabricante por item/lote recebido. |
| AF-018 | 245 | Aprovação antes do estoque | N · E05 | F06 | Configurar exigência; pendente não gera movimento; aprovação efetiva uma vez. |
| AF-019 | 245 | Baixa por vencimento/extravio | I · E05 | F06 | Motivo, produto/lote/quantidade e consulta do movimento. |
| AF-020 | 245 | Bloqueio de lotes | I · E05 | F06 | Conferir que lote bloqueado não é dispensado, inclusive por caminhos alternativos. |
| AF-021 | 245 | Transferência entre unidades | I · E05 | F06 | Saída/em trânsito/aceite/entrada com saldo e lote coerentes. |
| AF-022 | 245 | Requisitar onde há estoque | P · E05 | F06 | Mostrar disponibilidade das unidades e selecionar origem do pedido. |
| AF-023 | 246 | Processo requisição/transferência | P · E05 | F06 | Pedido vinculado a itens enviados/recebidos e saldo pendente. |
| AF-024 | 246 | Demanda reprimida de produtos | P · E05/E11 | F06 | Gerenciar falta/paciente/produto e atendimento posterior com saldo. |
| AF-025 | 246 | Inventário e ajustes | P · E05 | F06 | Gestor de inventário por depósito/lote e conclusão; reutilizar ajuste de saldo existente. |
| AF-026 | 246 | Judicialização farmacêutica | N · E05/E11 | F06 | Gestor de processos vinculados a produtos e pacientes. |
| AF-027 | 246 | Cadastro de advogados | N · E01/E05 | F06 | Reutilizar pessoa/profissional e registrar papel no processo. |
| AF-028 | 246 | Processo/paciente/data/advogado | N · E05/E11 | F06 | Campos de abertura e vínculo ao paciente solicitante. |
| AF-029 | 246 | Digitalizações e pedido de compra | N · E05/E11 | F06 | Anexos GED e referência à compra existente, sem redigitação paralela. |
| AF-030 | 246 | Fases/cancelamento/renovação judicial | N · E05/E11 | F06 | Movimentos com histórico e situação consultável. |
| AF-031 | 246 | Dispensar pelo processo aprovado | N · E05 | F06 | Disponibilizar ação contextual após aprovação e usar estoque/prescrição de origem. |
| AF-032 | 246 | Extrato do processo | N · E11 | F06 | Impressão das informações e fases farmacêuticas vinculadas. |
| AF-033 | 246 | Entregas de kits | N · E05 | F06 | Geração/entrega por paciente e itens/movimentos rastreáveis. |
| AF-034 | 246 | Cadastro de kits/produtos | N · E05 | F06 | Composição com produtos do material único. |
| AF-035 | 247 | Quantidade padrão por item do kit | N · E05 | F06 | Quantidade configurada por produto usada na geração. |
| AF-036 | 247 | Gerar kits por critérios | N · E05/E03 | F06 | Validade da receita/endereço/ação programática e seleção do paciente. |
| AF-037 | 247 | Não retirada do kit | N · E05 | F06 | Justificativa e estado de entrega no gestor. |
| AF-038 | 247 | Retorno de kits ao estoque | N · E05 | F06 | Reverter apenas a saída/reserva efetivada, sem entrada duplicada. |
| AF-039 | 247 | Código de barras do receituário | N · E03/E05/E11 | F06 | Código emitido identifica a receita e abre a dispensação de seus itens. |
| AF-040 | 247 | Receitas selecionadas pelo paciente | P · E05 | F06 | Filtro individual e organização automática dos itens/saldos para dispensar. |
| AF-041 | 247 | Dispensação manual por lote/quantidade | P · E05 | F06 | Entrada manual de produto/paciente/lote além do item de prescrição obrigatório atual. |
| AF-042 | 247 | Prescritor obrigatório em receita especial | N · E03/E05 | F06 | Tipo especial exige profissional, inclusive em receita externa/manual. |
| AF-043 | 247 | Estoque do produto em outras unidades | P · E05 | F06 | Consulta contextual de todas as unidades com saldo permitido ao perfil. |
| AF-044 | 247 | Declaração de recebimento | P · E05/E11 | F06 | Paciente/retirante/produtos/quantidades/data e origem da dispensação. |
| AF-045 | 247 | Gerenciador de dispensações | P · E05/E11 | F06 | Filtros combinados por data/unidade/paciente e abertura dos registros. |
| AF-046 | 247 | Retirada por outra pessoa | N · E01/E05 | F06 | Identificar retirante e vínculo ao paciente/entrega. |
| AF-047 | 248 | Dispensação por tipo de receita | N · E03/E05 | F06 | Regras por tipo aplicadas aos itens e profissional prescritor. |
| AF-048 | 248 | Editar/excluir dispensação | N · E05 | F06 | Corrigir/cancelar com recomposição de estoque/saldo de receita e histórico. |
| AF-049 | 248 | Integração BNAFAR | E · E05/E10 | F12 | Conector específico com transmissão e retorno, não substituído por Hórus/SIGAF. |
| AF-050 | 248 | Equivalência de unidades CATMAT | N · E05/E10 | F06/F12 | Mapear unidades oficiais/locais e aplicar conversão na exportação. |
| AF-051 | 248 | Ambiente/endereço/credenciais BNAFAR | E · E10 | F12 | Configuração por destino/ambiente e operação da conexão. |
| AF-052 | 248 | Envio automático de entradas/posição | E · E05/E10 | F12 | Agendar/acionar quando integração ativa e registrar retorno por remessa. |
| AF-053 | 248 | Componentes farmacêuticos | E · E05/E10 | F06/F12 | Básico/Especializado/Estratégico classificados e transmitidos. |
| AF-054 | 248 | Resultado detalhado BNAFAR | E · E10 | F12 | Mensagem, protocolo, inconsistências e sucessos originados no receptor. |
| AF-055 | 248 | Consulta de envios BNAFAR | E · E10 | F12 | Histórico/situação por WebService e acesso ao retorno correspondente. |
| AF-056 | 248 | Situação visual das exportações | P · E10 | F12 | Estados de geração/envio/resultado aplicados especificamente às remessas BNAFAR. |
| AF-057 | 248 | Chamada da Farmácia | N · E04/E05 | F03/F06 | Fila/chamada/painel de pacientes do setor farmacêutico. |

## 6. Central de Regulação — CR — 82 itens

| ID | Página | Requisito sintetizado | Situação / base | Fase | Fechamento necessário |
|---|---:|---|---|---|---|
| CR-001 | 249 | Agenda por unidade/procedimento | P · E04/E08 | F03 | Procedimentos agendáveis por unidade com vagas/local. |
| CR-002 | 249 | Agenda do profissional completa | P · E04/E08 | F03 | Prestadora/convênio/local/horário/dias e vínculo profissional. |
| CR-003 | 249 | Convênio compatível com especialidade | N · E02/E04/E08 | F01/F03 | Somente convênios que cobrem a especialidade podem ser vinculados; cobertura preparada em F01. |
| CR-004 | 249 | Agenda por especialidade sem profissional | I · E04 | F03 | Conferir criação/consulta/disponibilidade sem profissional vinculado. |
| CR-005 | 249 | Vigência da agenda | N · E04 | F03 | Data inicial/final aplicada à disponibilidade e agendamento. |
| CR-006 | 249 | Restrição por sexo/idade | N · E04 | F03 | Faixas/sexo configurados e verificados ao agendar. |
| CR-007 | 249 | Cadastro de feriados | P · E04 | F03 | Reaproveitar calendário e exposição no gerenciamento de Saúde. |
| CR-008 | 249 | Agenda aberta em feriado | N · E04 | F03 | Exceção configurável ao bloqueio global atual. |
| CR-009 | 249 | Local distinto da prestadora | N · E04/E02 | F03 | Dois vínculos distintos no cadastro e comprovante. |
| CR-010 | 249 | Liberar vaga por ausência | P · E04 | F03 | Vaga volta à disponibilidade quando marcada falta, conforme configuração. |
| CR-011 | 249 | Comprovante com horário marcado/fixo | P · E04/E11 | F03 | Parâmetro de agenda aplicado à emissão/reimpressão. |
| CR-012 | 250 | Confirmação de presença parametrizada | P · E04 | F03 | Exigir ou dispensar confirmação por agenda. |
| CR-013 | 250 | Agendas por vínculos do profissional | P · E02/E04 | F03 | Múltiplas agendas associadas ao vínculo correto. |
| CR-014 | 250 | Bloqueio por período | P · E04 | F03 | Intervalos bloqueados, não apenas estado de bloqueio do cronograma inteiro. |
| CR-015 | 250 | Encaminhamento automático por especialidade | P · E03/E08 | F03 | Automatismo existe para encaminhamento; parametrizar quais especialidades o utilizam. |
| CR-016 | 250 | Cotas de consultas | I · E08 | F03 | Conferir cota por consulta/especialidade, período e responsável. |
| CR-017 | 250 | Cotas de procedimentos | I · E08 | F03 | Conferir procedimento e aplicação no agendamento correspondente. |
| CR-018 | 250 | Consulta de consumo de cotas | P · E08 | F03 | Abrir solicitações/agendamentos que consumiram cada cota. |
| CR-019 | 250 | Cotas por quantidade | I · E08 | F03 | Conferir total/reservado/realizado e saldo consistente. |
| CR-020 | 250 | Total e distribuição por solicitante | P · E08 | F03 | Cota total com distribuição por unidades solicitantes. |
| CR-021 | 250 | Saldo visível e bloqueio ao esgotar | P · E08/E04 | F03 | Integrar cota ao agendamento; repetição/cancelamento não deixa saldo incorreto. |
| CR-022 | 250–251 | Consulta de agendamentos e filtros | P · E04/E08 | F03 | Data/prestadora/solicitante/profissional/paciente/convênio/especialidade combináveis. |
| CR-023 | 251 | Consulta por convênio/prestadora/especialidade | P · E04/E08 | F01/F03 | Campos ligados às coberturas estabelecidas em F01 e criação da consulta. |
| CR-024 | 251 | Profissionais disponíveis | P · E02/E04 | F03 | Filtrar vínculo/agenda/especialidade/convênio para a escolha. |
| CR-025 | 251 | Datas/horários disponíveis | P · E04 | F03 | Exibir horários válidos calculados, não somente total de vagas. |
| CR-026 | 251 | Exclusão de agendamento | P · E04 | F03 | Ação de remoção com liberação de vaga/cota e preservação do evento histórico. |
| CR-027 | 251 | Atualizar CPF/CNS/celular ao agendar | N · E01/E04 | F03 | Atualização contextual do cadastro comum com validação. |
| CR-028 | 251 | Comprovante imediato/reimpressão | P · E04/E11 | F03 | Emitir após inclusão e reabrir depois pelo agendamento. |
| CR-029 | 251 | Transferir data/horário | I · E04 | F03 | Conferir destino/agenda válida e devolução/consumo de vagas/cotas. |
| CR-030 | 251 | Procedimentos agendados e filtros | P · E04/E08 | F03 | Data/prestadora/solicitante/procedimento/paciente/convênio combináveis. |
| CR-031 | 251 | Procedimento por convênio/prestadora/local | P · E04/E08 | F01/F03 | Agendamento ligado ao pedido/cobertura/local; cobertura disponível desde F01. |
| CR-032 | 251 | Busca de procedimento | P · E02/E04 | F03 | Pesquisa do catálogo no fluxo de agendamento de procedimento. |
| CR-033 | 252 | Indicativo visual de cota disponível | P · E08/E04 | F03 | Situação/saldo no momento de selecionar e confirmar. |
| CR-034 | 252 | Agendamento pela requisição | P · E03/E08/E04 | F03 | Vincular agendamento à requisição existente, sem gerar pedido duplicado. |
| CR-035 | 252 | Profissional solicitante | P · E03/E08 | F03 | Registrar solicitante no procedimento, distinto do executor. |
| CR-036 | 252 | Comprovante de procedimento | P · E11/E04 | F03 | Documento com procedimento/prestadora/local/paciente/dados de agenda. |
| CR-037 | 252 | Exclusão de procedimento agendado | P · E04/E08 | F03 | Liberar vaga/cota e manter histórico do pedido. |
| CR-038 | 252 | Confirmar presença | I · E04 | F03 | Conferir consulta/procedimento e integração com início do atendimento. |
| CR-039 | 252 | Gerenciador de regulação de consultas | I · E08 | F03 | Conferir filtro/tipo e execução completa da análise de consultas. |
| CR-040 | 252 | Gerenciador de regulação de procedimentos | I · E08 | F03 | Conferir filtro/tipo e análise vinculada ao procedimento solicitado. |
| CR-041 | 252 | Regulação administrativa parametrizada | N · E08 | F03 | Etapa administrativa e configuração de exigência por fluxo. |
| CR-042 | 252 | Regulação técnica parametrizada | N · E08 | F03 | Etapa técnica e configuração de exigência, com profissional responsável. |
| CR-043 | 252 | Complementação da regulação | P · E08 | F03 | Solicitar/gravar complementos e histórico da informação adicionada. |
| CR-044 | 252 | Linha do tempo da regulação | P · E08/E11 | F03 | Exibir eventos/etapas/pareceres do mesmo pedido em ordem cronológica. |
| CR-045 | 252 | Prioridade/parecer/motivo | P · E08 | F03 | Dados em cada decisão, com vocabulário consistente. |
| CR-046 | 253 | Anexos na regulação | I · E08/E11 | F03 | Conferir upload/consulta GED pelo pedido e acesso de unidade. |
| CR-047 | 253 | Aprovação aloca na espera | N · E08/E04 | F03 | Criar/vincular entrada de espera automaticamente ao aprovar. |
| CR-048 | 253 | Contato telefônico do pedido | N · E08 | F03 | Histórico de ligações e resultado, não somente campo `contactPhone`. |
| CR-049 | 253 | Espera de consultas | I · E04/E08 | F03 | Conferir lista e ligação ao pedido/regulação. |
| CR-050 | 253 | Espera de procedimentos | P · E04/E08 | F03 | Tipo/procedimento/pedido e gestor com situações próprias. |
| CR-051 | 253 | Filtrar esperas liberadas | P · E04/E08 | F03 | Situação refletida na elegibilidade ao agendamento. |
| CR-052 | 253 | Agendar pela espera | I · E04 | F03 | Conferir criação de agenda e vínculo de retorno à entrada/pedido. |
| CR-053 | 253 | Regulação pela espera | P · E08/E04 | F03 | Abrir a análise original da entrada sem busca manual. |
| CR-054 | 253 | Aviso de agendamento por e-mail | N · E04/E10 | F03 | Enviar se cidadão tem e-mail; vincular resultado do envio ao agendamento. |
| CR-055 | 253 | Requisição de exame pela espera | P · E03/E08/E11 | F03 | Impressão da requisição de origem pelo registro de procedimento. |
| CR-056 | 253 | Espera de programas de saúde | N · E04/E07 | F03 | Gestor de programa/paciente/situação de vaga. |
| CR-057 | 253 | Inclusão programa/paciente/urgência | N · E04/E07 | F03 | Campos exigidos e data/autoria do ingresso na espera. |
| CR-058 | 254 | Tipo/marca/veículo | P · E09 | F08 | Reutilizar cadastro de Frotas e expor seleção na Saúde. |
| CR-059 | 254 | Rotas | P · E09 | F08 | Reutilizar estrutura de rotas existente quando adequada e vincular ao transporte. |
| CR-060 | 254 | Locais | P · E09/E04 | F08 | Locais de transporte/embarque/destino; destino clínico em texto é somente base. |
| CR-061 | 254 | Viagem completa | P · E09 | F08 | Motivo/origem/destino/veículo/motorista/auxiliar e gestão. |
| CR-062 | 254 | Adiantamento ao responsável da viagem | N · E09 | F08 | Valor e vínculo ao responsável/registro financeiro existente. |
| CR-063 | 254 | Integrantes pela viagem | I · E09 | F08 | Conferir seleção de pacientes/acompanhantes e capacidade. |
| CR-064 | 254 | Confirmação da viagem | P · E09 | F08 | Ação/estado explícito de confirmação antes da execução. |
| CR-065 | 254 | Relação de passageiros | I · E09/E11 | F08 | Conferir listagem impressa da viagem selecionada. |
| CR-066 | 254 | Ordem de tráfego | N · E09/E11 | F08 | Documento da viagem com veículo/condutor/origem/destino e dados pertinentes. |
| CR-067 | 254 | Gerenciador de transportes | P · E09 | F08 | Consultar/organizar agendamentos vinculados a rotas/viagens/pacientes. |
| CR-068 | 254 | Rotas disponíveis pelo destino | N · E09 | F08 | Filtrar rotas ao agendar transporte conforme destino. |
| CR-069 | 254 | Pacientes ocupantes | I · E09 | F08 | Conferir seleção e ocupação sem duplicidade/capacidade excedida. |
| CR-070 | 254 | Local de embarque individual | N · E09 | F08 | Local por ocupante e informação na viagem/comprovante. |
| CR-071 | 254 | Histórico de faltas em viagens | N · E09 | F08 | Registrar ausência e consultar anteriores no novo agendamento. |
| CR-072 | 255 | Acompanhantes e organização de vagas | P · E09 | F08 | Necessidade e vagas para acompanhante explicitamente contabilizadas. |
| CR-073 | 255 | Laudo TFD detalhado | P · E09/E03 | F08 | Paciente/diagnóstico/tratamento/necessidade de transporte; pedido simples não basta. |
| CR-074 | 255 | Laudo TFD automático/reimpressão | P · E09/E11 | F08 | Laudo clínico após inclusão; relatório atual de viagem não o substitui. |
| CR-075 | 255 | Complementos do laudo TFD | N · E09 | F08 | Data/hora/usuário e conteúdo adicionado após inclusão. |
| CR-076 | 255 | Situações do laudo TFD | P · E09 | F08 | Aprovação/glosa/arquivo/alteração/negação com eventos automáticos. |
| CR-077 | 255 | Autorização após aprovação | P · E09 | F08 | Separar aprovação/autorização e registrar usuário autorizador. |
| CR-078 | 255 | Pedido TFD autorizado/cancelamento | P · E09/E11 | F08 | Imprimir pedido de tratamento, permitir cancelamento e manter histórico. |
| CR-079 | 255 | Transporte após autorização | P · E09 | F08 | Liberação e direcionamento contextual ao gestor de transporte. |
| CR-080 | 255 | Trâmites TFD do paciente | N · E09/E11 | F08 | Linha do tempo do laudo/processo e consulta por paciente. |
| CR-081 | 255 | Relatórios detalhados TFD | P · E09/E11 | F08 | Unidade solicitante/destino/procedimento/profissional e dados dos laudos/processos. |
| CR-082 | 255 | Benefícios ao paciente | N · E09/E12 | F08 | Cadastro/autorização e vínculo à entrega/paciente/processo TFD. |

## Fechamento da matriz

São 42 GS + 43 GF + 41 AP + 74 AS + 57 AF + 82 CR = **339 linhas normativas**, sem numeração global artificial. O atendimento de um requisito que utiliza outra fase depende da conclusão de todas as fases indicadas.

Ao executar o plano, atualizar a situação com a evidência operacional de cada item. Manter referência às bases reaproveitadas e às tabelas novas efetivamente criadas. A mera conclusão das fases internas não encerra os itens que exigem formato, transmissão ou retorno externo.
