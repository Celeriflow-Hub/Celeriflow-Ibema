# CeleriFlow — Desenvolvimento e demonstração da POC
## Frotas | Um único módulo para a demanda de Divino de São Lourenço/ES

**Revisão 01 — 18/09/2026.**  
**Destinatário:** Codex/Antigravity com acesso ao repositório real.  
**Fonte funcional:** `termo de referencia (Ratificado)(1).pdf`, Processo Administrativo nº 1026/2026, seção 19, bloco **FROTAS**. O título começa na página **47**; os **14 requisitos estão integralmente na página 48**, antes de “COMPRAS, LICITAÇÕES E CONTRATOS”.  
**Rastreabilidade:** `FRO-001` a `FRO-014`, correspondentes aos itens 1 a 14, sem nova exigência numerada.  
**Objetivo:** criar **um único módulo Frotas dentro do CeleriFlow**, implementando as capacidades deste recorte com persistência, interface profissional e demonstrações reproduzíveis.

> **Ordem ao agente:** implementar o módulo, não somente reformular este plano. Examinar o código, reutilizar o núcleo do ERP, criar apenas as estruturas de Frotas necessárias, executar os testes e entregar evidência por requisito. Não produzir outro sistema, outro login ou uma coleção de telas com dados estáticos.

**Decisões do usuário incorporadas:** uma entrada de menu “Frotas”, com áreas/abas internas; preferência por listagens paginadas sem rolagem global no desktop; mesma identidade, fonte e densidade do CeleriFlow; eventual acesso pelo celular no **Chrome, no mesmo site**, sem aplicativo separado. Dados provenientes de outros módulos devem ter sua origem **destacada**; não desenvolver esses módulos para completar este pacote.

**Limite desta entrega:** o repositório e o software não foram inspecionados. Este documento define o desenvolvimento e os testes; não declara que funcionalidades, integrações ou telas já existem. A cobertura documental de 14 itens não é uma homologação do sistema ou da POC.

**Como interpretar:** os campos **TR** reproduzem literalmente os requisitos, com apenas espaços/quebras de linha normalizados. Todo o restante — organização de telas, campos auxiliares, estados, cálculos de conferência e dados fictícios — é proposta de implementação ou orientação do usuário. Não atribuir ao TR esses detalhes de projeto. Não importar o bloco retirado de **RASTREAMENTO VEICULAR** nem funcionalidades de Meio Ambiente/Patrimônio só porque constam em outros planos.

**Navegação:** [Escopo e fronteiras](#escopo) · [14 itens](#lista) · [Dados de outros módulos](#dependencias) · [Regras de operação](#operacao) · [Telas profissionais](#ux) · [Base fictícia](#base) · [Item a item](#itens) · [Pacotes](#pacotes) · [Testes e aceite](#testes) · [Definições pendentes](#definicoes) · [Auditoria e fontes](#auditoria)

---
<a id="escopo"></a>
## 1. Escopo: um módulo, sem reconstruir o ERP

### 1.1 Diagnóstico e criação

Ler `AGENTS.md`, manifests, lockfile, migrations, convenções de domínio e testes existentes. Localizar o menu, tabelas/formulários compartilhados, autenticação, permissões, órgão/setor, relatórios e os serviços de origem indicados na seção 3. Confirmar no repositório a stack efetiva; não trocar ORM, framework, banco ou hospedagem por causa da POC.

Se já existir um cadastro ou parte de Frotas, reaproveitá-lo dentro da única área final. **Não manter “Frotas antigo”, “Frotas POC” e “Rastreamento” como produtos paralelos para esta entrega.** Não apagar rotinas existentes nem migrar dados destrutivamente: registrar conflito de responsabilidade antes de alterar. Criar migrations incrementais limitadas aos dados que pertencem ao módulo.

O módulo terá dados próprios de cadastro operacional, rotas, utilização, planos/ordens, consumos, gastos, seguros, obrigações e ocorrências. Eles podem estar distribuídos em tabelas/serviços internos, mas continuam um único módulo de negócio. Um núcleo de relatório compartilhado não transforma cada relatório em outro módulo.

### 1.2 Classificação das orientações

| Classe | Origem | O que autoriza |
|---|---|---|
| **TR-E** | Requisito específico FROTAS, p. 48. | Desenvolver o resultado exigido, preservando todos os objetos e ações da frase. |
| **TR-G** | Requisitos gerais do TR citados abaixo. | Reutilizar capacidades do núcleo e sinalizar lacunas gerais; não fingir atendimento. |
| **TEC** | Meio de implementação e verificação. | Transações, validação, integridade, identificação de origem, testes e segurança; não novos processos de negócio. |
| **UX/CANAL** | Solicitação do usuário. | Tela estruturada, paginação, tipografia e mesmo site no Chrome do celular. |
| **DEP-MOD** | Dados/capacidades de outro módulo, quando existentes. | Destacar a origem, consumir o serviço disponível e registrar pendência; não reconstruir a origem. |
| **EXTRA** | Função sem relação com este recorte ou orientação expressa. | Não desenvolver neste pacote. |

### 1.3 O que fica fora

Não criar rastreamento GPS, telemetria, cercas eletrônicas, acompanhamento em tempo real, central 24 horas, bloqueio remoto, hardware, chips, ANATEL, mapas de veículos, aplicativo de diário de bordo ou portal público de rastreamento. **Cadastro de rotas não é rastreamento nem otimização automática de trajetos.**

Também não acrescentar aplicativo nativo/híbrido, empacotamento, loja, PWA obrigatória, offline, leitura de sensores, importação XLSX/CSV como produto, consultas DETRAN/RENAVAM/seguradoras, pagamento de tributos/multas, boletos/PIX, emissão oficial de multas, processo de sinistro, gestão de pneus por posição, checklist de viagem, reserva/despacho de veículos, CNH/escala de motoristas, IA preditiva, consumo ideal/km por litro, novo painel de BI, novo módulo contábil ou nova oficina com gestão própria de estoque.

Não criar notificação por e-mail, WhatsApp, SMS ou push apenas para o agendamento do item 6: o bloco FROTAS não especifica esse canal. Requisitos gerais de alertas, quando aplicáveis, continuam sob a análise do núcleo; não importar automaticamente os avisos específicos de Meio Ambiente.

**Não retirar:** máquinas, equipamentos e agregados nos itens que os mencionam; emissão do próprio plano e das ordens de serviço; revisão periódica e manutenção preventiva; datas/valores das ocorrências; combustíveis **e** lubrificantes, próprios **e** de terceiros; os três relatórios expressos nos itens 12–14.

### 1.4 Dependências gerais do TR preservadas

| Capacidade geral | Referência no TR ratificado | Aplicação neste módulo |
|---|---|---|
| Web, responsividade e integração | Ambiente Tecnológico, itens 1, 4, 7 e 16, pp. 28–29. | Mesmo ERP, acesso conforme permissões, dados reaproveitados quando houver origem. |
| Transações, integridade e atualização online | Recuperação de Falhas, itens 5–8, p. 31; Caracterização Operacional, itens 1–2, p. 32; Requisitos Gerais 18–19, 24–25 e 30–31, pp. 41–42. | Gravação real, proteção à repetição e histórico conciliável. |
| Perfis, restrição por setor e auditoria | Caracterização Operacional, itens 3–7, pp. 32–33; Requisitos Gerais 9–13 e 27, pp. 41–42. | Autorização também no servidor; registrar ações, não apenas ocultar botões. |
| Visualização, impressão e formatos | Ambiente Tecnológico, itens 8–9, p. 28; Relatórios, itens 1–3, p. 33; Requisitos Gerais 14–16, p. 41. | Gerar documentos reais pelo núcleo, com PDF, XLSX, TXT e CSV conforme a capacidade geral aplicável. Importação é outra função e não está sendo pedida. |
| Ajuda e PDF assinado | Requisitos Gerais 17 e 21, p. 41. | Reutilizar ajuda/assinatura do núcleo quando aplicável e registrar falta; não desenvolver outro assinador. |

Esta seleção não é auditoria de todos os requisitos gerais. Não afirmar aprovação integral do edital apenas porque os 14 específicos funcionam.

<a id="lista"></a>
## 2. Lista dos 14 itens, na ordem do TR

Títulos abaixo são resumos; a citação integral de cada item está na seção 7. Todos os itens têm página de referência **48**.

| ID / item | Funcionalidade | Atenção principal |
|---|---|---|
| [FRO-001 / 1](#fro-001) | Gerenciamento de veículos, máquinas e equipamentos | Não limitar a automóveis; incluir máquinas e equipamentos. |
| [FRO-002 / 2](#fro-002) | Controle dos gastos da frota | Controlar gasto real e origem; não duplicar orçamento, consumo e pagamento. |
| [FRO-003 / 3](#fro-003) | Planos de revisão e manutenção preventiva com ordens de serviço | Programar + emitir plano + gerar OS vinculada + acompanhar execução; quatro tipos de objeto. |
| [FRO-004 / 4](#fro-004) | Histórico de utilização dos veículos | Histórico persistido de utilização; sem GPS ou aplicativo próprio. |
| [FRO-005 / 5](#fro-005) | Registro e controle de seguros | Seguro vinculado e controlável; sem criar processo de sinistro. |
| [FRO-006 / 6](#fro-006) | Agendamento e controle de obrigações: IPVA e licenciamento | Agenda de obrigações e situação; não calcular incidência, nem pagar IPVA. |
| [FRO-007 / 7](#fro-007) | Ocorrências com datas e valores | Multas, acidentes e outros, com datas e valores; não só descrição. |
| [FRO-008 / 8](#fro-008) | Histórico de gastos com manutenções efetuadas | Manutenção efetuada, distinta da planejada. |
| [FRO-009 / 9](#fro-009) | Histórico de combustíveis e lubrificantes próprios ou de terceiros | Quatro combinações de tipo e origem devem ser demonstráveis. |
| [FRO-010 / 10](#fro-010) | Cadastro de rotas | Cadastro textual estruturado; não requer mapa ou roteirização. |
| [FRO-011 / 11](#fro-011) | Cadastro de veículos | Ficha operacional no mesmo cadastro da frota. |
| [FRO-012 / 12](#fro-012) | Emissão da listagem geral da frota | Documento emitido, não apenas grid. |
| [FRO-013 / 13](#fro-013) | Relação de vencimentos de documentos por período | Filtrar pela data de vencimento, incluindo diferentes documentos. |
| [FRO-014 / 14](#fro-014) | Relatório de abastecimentos por período e veículo | Filtrar pela data do abastecimento e pelo veículo, no conjunto completo. |

<a id="dependencias"></a>
## 3. Dados de outros módulos — destacar, não desenvolver a origem

**Origem prevista, a confirmar no repositório.** Os nomes representam responsabilidades de dados, não APIs ou tabelas cuja existência foi verificada. Aplicar este destaque em cada requisito, mesmo quando a função seja nativa de Frotas.

| Referência | Origem prevista | Informação usada por Frotas | Limite |
|---|---|---|---|
| **DEP-01** | Administração / Autenticação / Organograma | Usuário, órgão, setor, permissões e auditoria. | Reutilizar o núcleo; cadastrar apenas a entrada/permissões de Frotas pela convenção existente. Não criar outro login ou organograma. |
| **DEP-02** | Pessoas / Servidores / Fornecedores | Identidade/nome do condutor ou responsável e de prestadores/fornecedores/seguradoras, se essas entidades já forem usadas. | Selecionar registros; não criar gestão de motoristas, RH ou cadastro geral paralelo. |
| **DEP-03** | Patrimônio, **quando houver vínculo** | ID/tombamento, descrição ou identificação do bem já patrimonializado. | Referenciar o bem e manter aqui somente dados operacionais de frota. Não gerar tombamento, depreciação, baixa ou duplicar valor patrimonial. |
| **DEP-04** | Almoxarifado / Materiais / Estoque, **quando houver origem própria registrada ali** | Material/unidade, movimento de saída confirmado, quantidade e valor de apropriação disponíveis. | Consumir os dados existentes do movimento, destacando o vínculo. Não criar depósito, estoque de combustível, requisição ou baixa automática de Almoxarifado neste pacote. |
| **DEP-05** | Compras / Contratos / Financeiro, **quando já forem origem da operação** | Referência do serviço/fornecimento, documento, valor e identificação da transação econômica. | Referenciar e consultar; não criar AF, contrato, pagamento ou novo contas a pagar. A mesma despesa não entra duas vezes em Frotas. |
| **DEP-06** | GED / Relatórios / Assinatura / Ajuda | Arquivo, identificador documental, geração, impressão, exportação, recursos gerais já existentes. | Reutilizar; não construir outro GED/editor/assinador. Não exigir anexar apólice ou NF a toda operação só porque existe GED. |

**Regra prática:** no lado de Frotas, criar telas, validações, referências e chamadas necessárias para consumir o que estiver disponível. No módulo de origem, limitar o trabalho a leitura/diagnóstico: não alterar suas regras, tabelas, migrations, telas ou processos. Documentar nome real do serviço, dados esperados, origem e falta encontrada. Quando uma integração adotada não estiver disponível, registrar `DEPENDENCIA_OUTRO_MODULO`; continuar as funções independentes, sem simular sucesso.

**Não transformar vínculos opcionais em impeditivos artificiais.** O bloco de 14 itens não exige nominalmente que o cadastro de veículo seja importado do Patrimônio, que toda OS passe por Compras ou que todo consumo próprio faça baixa no Almoxarifado. Se não houver essa origem definida, os registros operacionais pertencentes a Frotas podem ser cadastrados no próprio módulo, com origem informada e sem alegar integração inexistente. Cadastro local de utilização/gasto não autoriza criar um cadastro geral de pessoas ou uma contabilidade paralela.

Para materiais próprios sem estoque integrado disponível, registrar **o consumo e seu custo informado**, não um saldo fictício de depósito. Se houver um movimento real em Almoxarifado, referenciá-lo em vez de lançar novamente o mesmo consumo. O usuário fornecerá/populará os dados de origem pelos módulos existentes. Não criar importador nem escrever diretamente nas tabelas de outro módulo para preparar a demonstração.

<a id="operacao"></a>
## 4. Regras operacionais para as funções funcionarem de verdade

### 4.1 Dados internos mínimos e responsabilidade

Os conceitos abaixo são uma proposta a mapear à arquitetura existente, não nomes obrigatórios de tabelas. Dados auxiliares servem às funções exigidas; não são uma lista adicional de documentos obrigatórios do edital.

| Conceito em Frotas | Informação necessária à implementação | Vínculo/precaução |
|---|---|---|
| Unidade da frota | ID, código interno, descrição, categoria e situação operacional identificada. | Categorias contemplam veículo, máquina, equipamento e agregado nos contextos dos itens. Placa e identificação veicular somente quando aplicáveis; uma máquina não precisa receber placa fictícia. |
| Agregado | Identificação própria e vínculo à unidade principal quando fizer sentido no cadastro adotado. | Não impor o significado de “agregado” nem criar controle de peças/pneus. Q-F01 registra o mapeamento. |
| Rota | Código/nome, origem, destino e descrição de trajeto suficiente ao cadastro. | Dados textuais; sem coordenadas, mapa, estimativa automática ou integração geográfica obrigatórios. |
| Utilização | Veículo, data/período, finalidade, referência de rota e condutor/responsável quando utilizados. | Leituras manuais de hodômetro podem apoiar o histórico; não são telemetria nem cadastro de jornada. |
| Plano | Objeto, tipo revisão periódica/manutenção preventiva, serviços descritos, programação e referência da periodicidade. | O plano é emitível e origina OS; não é uma OS digitada sem vínculo. |
| OS e execução | ID, plano/ocorrência, objeto, data prevista, serviços, situação e realização/data efetiva. | Modelo simples proposto: emitida → em execução → concluída. Não criar novos aprovadores. |
| Gasto | Evento de origem, objeto, natureza, data do fato, valor realizado e referência quando houver. | Controle gerencial, não pagamento/contabilização. Valor planejado fica separado. |
| Consumo | Combustível/lubrificante, objeto, origem próprio/terceiro, data, quantidade, unidade e custo. | Os quatro cruzamentos de tipo/origem são suportados. Um consumo próprio pode ter custo sem compra de terceiro naquele momento. |
| Seguro | Referência da apólice/registro, objeto(s), vigência e informações de controle disponíveis. | Não criar gestão de sinistro, renovação automática ou obrigação de rateio. |
| Obrigação/documento | Tipo, objeto, referência/exercício quando pertinente, agendamento, vencimento, situação e realização quando houver. | Uma obrigação de licenciamento pode alimentar a relação de documentos sem redigitação. |
| Ocorrência | Objeto, tipo, data, descrição e valor envolvido. | Valor informado de acidente/multa não é automaticamente gasto realizado. |

### 4.2 Valores: um fato, um gasto

Guardar dinheiro em representação decimal adequada, sem somar valores financeiros por ponto flutuante com arredondamentos sucessivos. Mostrar reais com duas casas e quantidades com sua unidade. Não somar litros com unidades, horas com quilômetros nem quantidade de veículos com agregados sem identificar as categorias.

Separar explicitamente:

- **Previsto:** valor estimado no plano/OS ou em outra programação. Não compõe “manutenções efetuadas”.
- **Realizado:** gasto operacional registrado/confirmado no fato pertinente, com data e origem. Não significa “pago”.
- **Valor envolvido em ocorrência:** informação própria do registro. Só passa a gasto se houver o fato econômico correspondente, com vínculo para evitar duplicação.

Manutenção lançada em uma OS concluída deve alimentar o histórico e o controle de gastos **uma única vez**. Não exigir redigitação em “Gastos” nem somar novamente a mesma NF/lançamento financeiro. Combustível/lubrificante já registrado como consumo não entra novamente no total por aparecer na OS ou no documento de compra. Por exemplo: se a manutenção informa serviço de R$ 300 e óleo de R$ 100 já apropriado no consumo, o total desses fatos é R$ 400, não R$ 500. Definir a composição na gravação, não deduplicar só por igualdade de valor/data.

Uma chave de origem deve identificar o fato e, quando preciso, a linha do documento. Uma única nota pode conter fatos distintos; não suprimir todos só porque compartilham o mesmo número. Impedir reenvio da mesma operação, mas permitir outra despesa legítima com o mesmo valor.

Para material próprio, valor zero não deve ser o padrão para representar custo desconhecido. **“Não informado” é diferente de R$ 0,00.** O total com valores faltantes deve exibir essa ressalva, sem se apresentar como gasto completo. Não implementar valorização de estoque ou rateio contábil; usar o custo de origem já definido ou informado para o consumo operacional.

### 4.3 Planos, periodicidade e OS

O item 3 contém entregas diferentes: **programar o plano; emitir o plano; acompanhar sua execução; gerar a OS a partir dele; registrar a execução dessa OS.** Todas precisam estar demonstráveis para veículos, máquinas, equipamentos e agregados, sem criar quatro sistemas.

A forma mínima proposta usa programação por data e intervalo de calendário configurável, suficiente para demonstrar recorrência; quilômetros/horas podem ser preservados se já existirem, mas não são cumulativamente exigidos pela frase do TR. Não acrescentar sensores, cron obrigatório, compra automática ou planejamento preditivo.

Cada ocorrência programada do plano tem identidade própria. “Gerar OS” reaproveita objeto, serviços e data; nova tentativa para a mesma ocorrência recupera/identifica a OS existente, sem duplicá-la. Outra ocorrência do mesmo plano pode gerar nova OS legítima. O operador consegue emitir o plano e a OS em documento pelo núcleo de relatórios.

Concluir registra o que foi executado, quando, resultado e gasto quando existente. A OS seguinte pode estar programada, mas não aparece como manutenção efetuada nem como gasto realizado. Alterações do modelo do plano não reescrevem os serviços/valores das ordens já concluídas. Um cancelamento, se suportado no fluxo atual, conserva histórico e não se transforma em execução.

**Escolha de ensaio:** a próxima data é calculada a partir da data programada da ocorrência, não da data de conclusão atrasada. Isso é política demonstrativa; a regra real deve ser identificada em Q-F02. Não transformar o exemplo em recomendação mecânica de periodicidade.

### 4.4 Histórico de utilização e registros vinculados

Registrar utilização por operação/formulário normal com veículo, período e finalidade. Selecionar rota e pessoa já cadastradas quando disponíveis. Não registrar uma trilha GPS nem gerar um aplicativo de motorista.

Se o formulário usa leituras de hodômetro, mostrar unidade e não aceitar leitura final inferior à inicial dentro do mesmo registro sem o tratamento já previsto pelo ERP. Não construir um módulo de substituição de medidores para o ensaio. Os testes usam leituras coerentes; distância calculada entre elas é conferência, não relatório de eficiência novo.

O histórico persiste após recarga e pode ser aberto a partir da ficha sem perder filtro/página. Cada tipo de evento conserva sua origem. Não apresentar abastecimento como utilização de veículo por falta de registro específico.

### 4.5 Seguros, obrigações e documentos

Distinguir a **data agendada**, a **data de vencimento** e a **data de realização/cumprimento**. Não sobrepor esses conceitos em um campo genérico de data. A relação do item 13 filtra **vencimento**, não criação do cadastro, pagamento ou agendamento.

O mesmo seguro/obrigação deve alimentar a consulta de documentos pelo seu vínculo. Evitar digitar outra vez a apólice no relatório ou duplicar o vencimento ao editar o cadastro. Diferentes referências/exercícios devem poder coexistir sem apagar os registros anteriores. Permitir filtrar situações, deixando o filtro explícito; “vencimentos no período” não deve virar silenciosamente “somente vencidos hoje”.

IPVA e licenciamento são tipos de obrigação citados no TR. O módulo registra a obrigação/configuração que for fornecida; **não presume incidência de tributo sobre a frota municipal, calendário oficial, isenção ou dívida**, nem calcula ou paga tributos. Valores e datas fictícios não são instrução fiscal.

O valor envolvido numa ocorrência pode ser informado posteriormente quando ainda não foi apurado. Para a POC, demonstrar registros com data e valor numérico efetivamente preenchidos: não substituir o requisito por um campo de observação. Informação não apurada deve ser identificada, nunca convertida automaticamente em zero.

### 4.6 Integridade, autorização e auditoria

Usar autorização e escopo do núcleo em todas as consultas e gravações, inclusive chamada direta a API e download de relatório. Validar no servidor os vínculos entre objeto, registro, plano, OS, consumo e custo. Falhas devem interromper a transação pertinente sem deixar OS concluída sem sua execução ou gasto duplicado.

Aplicar identificação idempotente às confirmações e origem única ao que for derivado. Duplo clique, recarga, reenvio e duas sessões concorrentes não podem duplicar OS da mesma ocorrência ou gasto. Não é necessário desenvolver uma tela de administração de idempotência; é controle técnico interno.

Registros confirmados preservam histórico. Usar a política de correção/auditoria já existente; não apagar eventos para “zerar a demonstração”. Não criar rotinas amplas de estorno financeiro só por precisar corrigir um dado operacional. Nenhum arquivo deve conter senhas, chaves ou dados reais desnecessários.

### 4.7 Relatórios e impressão

Os dados da tela e do documento usam a mesma fonte, critérios e datas. Cabeçalho identifica relatório, órgão/contexto, período quando pertinente, filtros, emissão e usuário conforme o padrão do ERP. A listagem geral de frota não deve omitir máquinas/equipamentos por usar a tela de veículos como única fonte.

Os relatórios expressamente exigidos são **Frota geral**, **Vencimentos de documentos por período** e **Abastecimentos por período e veículo**. Os históricos de gastos também precisam ser consultáveis e usar o mecanismo geral de emissão aplicável; não criar um construtor de relatórios novo. Emitir os planos e as OS é parte do item 3.

Paginação é da visualização. A exportação cobre o **recorte inteiro** e os totais gerais correspondem a esse recorte; subtotal de página recebe outro rótulo. Definir períodos inclusivos na interface e implementá-los de modo consistente com data/fuso e limites do banco. Testar registros exatamente no início, no fim e fora da seleção.

<a id="ux"></a>
## 5. Um módulo com telas profissionais e eficientes [UX/CANAL]

### 5.1 Estrutura do módulo

**Uma entrada “Frotas” no menu do CeleriFlow**, abrindo a listagem da frota. As áreas abaixo são organização interna; não representam aplicativos, backends ou cadastros gerais independentes. Reaproveitar rotas/componentes existentes quando corresponderem; nomes são conceituais, não caminhos confirmados.

| Área interna | Lista/conteúdo principal | Ações e detalhe | IDs |
|---|---|---|---|
| **Frota** | Código/identificação, descrição, categoria e situação; vínculo ao bem quando existente. | Cadastrar/editar e abrir ficha. Ficha reúne dados, histórico e vínculos sem redigitação. | 1, 2, 11, 12. |
| **Utilização e rotas** | Utilizações por veículo/período; aba de cadastro de rotas. | Registrar utilização, consultar histórico, manter rotas. | 4, 10. |
| **Manutenção** | Abas de planos, ordens e histórico de execução/gastos. | Programar, emitir plano, gerar/emitir OS, registrar execução, consultar gasto. | 3, 8. |
| **Abastecimentos e lubrificantes** | Data, objeto, tipo de material, origem, quantidade/unidade e valor. | Registrar consumo, abrir origem e consultar histórico; abastecimentos com filtro por veículo. | 2, 9, 14. |
| **Documentos e ocorrências** | Abas para seguros, obrigações/documentos e ocorrências. | Registrar vigências/agendamentos; controlar situação; manter ocorrências com datas/valores. | 5, 6, 7, 13. |
| **Relatórios** | Seletor do relatório e filtros específicos, com prévia paginada. | Visualizar, imprimir/exportar e consultar totais. Usar as mesmas fontes das áreas acima. | 2, 8, 9, 12, 13, 14; emissão de plano/OS acessível em Manutenção. |

Uma ficha pode ter abas **Dados**, **Utilização**, **Manutenção**, **Consumos e gastos**, **Documentos** e **Ocorrências**. São consultas filtradas das mesmas bases, não novas implementações de cada função. Em viewport pequeno, organizar navegação sem dezenas de abas espremidas; não empilhar todas as listas na mesma página.

### 5.2 Composição e dimensões

A listagem deve ter **título/contexto + busca/filtros + tabela + paginação e ações** visíveis no desktop de referência, sem rolagem global. Não usar banners, saudações, gráficos decorativos, cards por registro ou indicadores gigantes ocupando a área de trabalho.

Preservar a família tipográfica do CeleriFlow quando consistente; caso não exista padrão, usar fonte de sistema com preferência por Segoe UI e alternativas sans-serif. Não baixar/distribuir fontes, não instalar outro framework de interface e não fazer reset visual global do ERP.

| Elemento | Tamanho / entrelinha de referência | Peso |
|---|---|---|
| Título da página | 20 / 26 px | 600 |
| Título de seção | 16 / 22 px | 600 |
| Tabela, campo, filtro, botão, mensagem de erro | 14 / 20 px | 400; cabeçalhos e ênfase 600 |
| Metadado secundário | 12 / 16 px | 400 |

Essas dimensões são **decisões de projeto herdadas dos planos anteriores**, não números do TR nem afirmação de padrão universal de ERP. Usar tokens equivalentes em `rem`, sem diminuir a raiz para aparentar compactação. Linhas/controles com altura mínima de referência 36 px no desktop, 44 px no toque; campos de referência 16 px no celular. Espaçamentos 4/8/12/16/24 px, margens internas próximas a 16 px. Alturas mínimas, não rígidas que cortem conteúdo ampliado.

Texto alinhado à esquerda; valores/quantidades à direita com unidade/moeda e algarismos tabulares quando disponíveis. Estados com texto além de cor; contraste legível, foco visível e rótulos acessíveis. Preservar cores/identidade do CeleriFlow. Não usar emojis, ícones sem rótulo em ação essencial ou fonte de 10–11 px para fazer dados caberem.

### 5.3 Paginação e consulta completas

Começar com até **10 registros por página** no menor viewport de teste; ajustar para menos quando a área real não comportar dez linhas. Novos registros criam páginas, não aumentam indefinidamente a tela. Usar consulta/total/ordenação no servidor; desempate por chave estável. Buscar um veículo que estaria na terceira página deve encontrá-lo sem o usuário navegar antes até lá.

Ao mudar filtros, voltar à primeira página. Ao abrir ficha e retornar, preservar filtro, ordenação e página. Exibir total/intervalo reais e distinguir carregamento, sem registros e falha de consulta. Não preencher linhas fictícias para ocupar a tabela.

“Emitir listagem”, “Emitir vencimentos” e “Emitir abastecimentos” usam todos os registros do filtro, não só dez. A emissão de um plano/OS com mais de uma página inclui todos os serviços. Confirmar execução valida o documento inteiro; não concluir somente as linhas visíveis. Seleção de registros tem alcance explícito.

### 5.4 Formulários e eficiência

Abrir criação/edição em ficha ou painel coerente com o ERP, evitando modais aninhados. Campo inaplicável pode ser ocultado sem apagar dados já válidos. Salvar/cancelar permanecem acessíveis; erro em outra aba é indicado com acesso direto. Abas organizam conteúdo, não criam novas etapas de aprovação.

Ao partir da ficha de um veículo, preencher sua identificação automaticamente no formulário de utilização, seguro, obrigação, ocorrência ou consumo. Ao gerar OS, herdar plano/objeto/serviços/programação. Ao concluir manutenção, atualizar o histórico e gasto sem segunda digitação. Ao emitir relatório, reaproveitar o filtro atual quando compatível. Identificação/usuário/data de registro são automáticos sempre que possível.

Priorizar a ação principal. Exemplos: **Novo veículo**, **Registrar utilização**, **Gerar OS**, **Concluir execução**, **Registrar abastecimento**, **Emitir relatório**. Usar rótulos específicos, não “Salvar” para uma ação que conclui serviço ou confirma gasto sem avisar seu efeito.

Não gerar sucesso antes da confirmação do servidor. Na conclusão, mostrar o objeto, plano/OS, data e valor pertinentes para o operador confirmar. A eficiência vem de menos redigitação, não da retirada de validação.

### 5.5 Exceções à ausência de rolagem e canal mobile

**Não usar `overflow: hidden` para esconder informação.** Reduzir linhas por página, reorganizar colunas e usar detalhe para texto extenso. Relatórios/documentos longos, zoom e telas pequenas podem usar rolagem vertical controlada, sem barras aninhadas desnecessárias. Não reduzir fonte ou cortar o final do histórico para dizer que a página “não rola”.

Testar viewport CSS **1366×650**, **1440×800** e **1920×900** a zoom normal, além da área útil real da apresentação. Testar texto/zoom a 200%, largura reduzida e Chrome em celular real. Nesses últimos casos, acessibilidade ao conteúdo prevalece sobre zero rolagem.

Celular usa **a mesma URL, páginas, autenticação, serviços e banco**. Não criar aplicativo nativo, wrapper, backend separado ou instalação obrigatória. O bloco de 14 itens não contém um requisito específico de aplicativo mobile; esta é a orientação geral de canal do usuário, não um 15º requisito.

### 5.6 Desempenho a medir

Paginar no banco, restringir por permissão antes de enviar dados e evitar uma consulta por célula. Reutilizar componentes e consultas agregadas adequadas; não criar infraestrutura analítica nova. Carregar documentos extensos sob demanda.

Metas iniciais de ensaio herdadas do padrão anterior: feedback visual de processamento em até 200 ms e resposta de consulta paginada em até 1,5 s no percentil 95, com ambiente, volume, rede e amostra informados. São alvos de projeto, **não exigências do TR nem desempenho já medido**. Separar abertura fria de consultas subsequentes e registrar gargalos em vez de esconder operações ainda pendentes.

<a id="base"></a>
## 6. Base fictícia e resultados para conferir a demonstração

Todos os nomes, valores, datas, frequências e documentos abaixo são **dados de ensaio**, não cadastro real da prefeitura, tabela oficial de IPVA, periodicidade mecânica recomendada ou documento válido perante terceiros. O usuário populará a base pelas telas. Fixtures automatizadas de teste, se úteis, ficam isoladas de produção e não justificam criar importador.

### 6.1 F-CAD — frota e referências

| Código fictício | Descrição | Categoria | Uso no ensaio |
|---|---|---|---|
| **V-DEMO-01** | Veículo administrativo DEMO | Veículo | Utilização, manutenção, seguros, documentos e consumos. |
| **V-DEMO-02** | Veículo de apoio DEMO | Veículo | Segundo veículo para filtros/relatórios e consumos. |
| **M-DEMO-01** | Máquina operacional DEMO | Máquina | Plano preventivo, combustível e gasto próprios. |
| **E-DEMO-01** | Equipamento de apoio DEMO | Equipamento | Plano preventivo, lubrificante e ocorrência. |
| **A-DEMO-01** | Agregado auxiliar DEMO | Agregado | Plano próprio e ocorrência; vínculo demonstrativo a M-DEMO-01. |

Esses códigos não são placas, RENAVAM ou tombamentos oficiais. Utilizar identificações sintéticas apropriadas aos validadores existentes, sem desativar validação de produção. A listagem desse conjunto mostra **2 veículos, 1 máquina, 1 equipamento e 1 agregado relacionado**, distinguindo categorias. Não apresentar “5 veículos”.

Se Pessoas/Patrimônio forem fontes, indicar ao usuário os registros fictícios que precisam existir. Prestadores e pessoas sugeridos: “Condutor A — DEMO”, “Oficina Horizonte — DEMO”, “Fornecedor de insumos — DEMO”, “Seguradora — DEMO”. Não são endereços, contratos ou cadastros confirmados.

### 6.2 F-ROT/USO — rotas e utilização

Rotas cadastrais: **R-DEMO-01**, “Centro administrativo DEMO → Escola DEMO”; **R-DEMO-02**, “Garagem DEMO → Unidade de apoio DEMO”. Registrar nome, origem/destino e descrição de percurso, sem mapa ou posições GPS.

| Registro | Veículo | Data e horário demonstrativos | Rota | Leitura inicial/final, se usada | Conferência |
|---|---|---|---|---|---:|
| U-01 | V-DEMO-01 | 03/09/2026, 08h–10h | R-DEMO-01 | 10.000 → 10.060 km | 60 km |
| U-02 | V-DEMO-01 | 05/09/2026, 13h–15h | R-DEMO-02 | 10.060 → 10.100 km | 40 km |
| U-03 | V-DEMO-02 | 06/09/2026, 09h–12h | R-DEMO-02 | 5.000 → 5.120 km | 120 km |

V-DEMO-01 tem **dois registros de utilização**; V-DEMO-02 tem um. Leituras são manuais, não rastreamento. Os 100 e 120 km servem à conferência se esses campos forem usados, sem exigir indicador de consumo/quilômetro.

### 6.3 F-MAN — plano, emissão, OS e manutenção executada

| Plano / OS | Objeto | Tipo demonstrativo | Data programada/realizada do ensaio | Gasto realizado |
|---|---|---|---|---:|
| PL-01 / OS-01 | V-DEMO-01 | Revisão periódica | 10/09/2026 | R$ 350,00 |
| PL-02 / OS-02 | V-DEMO-02 | Manutenção preventiva | 11/09/2026 | R$ 600,00 |
| PL-03 / OS-03 | M-DEMO-01 | Manutenção preventiva | 12/09/2026 | R$ 450,00 |
| PL-04 / OS-04 | E-DEMO-01 | Revisão periódica | 13/09/2026 | R$ 180,00 |
| PL-05 / OS-05 | A-DEMO-01 | Manutenção preventiva | 14/09/2026 | R$ 120,00 |

Criar os planos com serviços descritivos de demonstração e emitir cada OS **a partir do plano**, não por digitação desvinculada. Usar serviços que não repitam os consumos de combustíveis/lubrificantes da tabela seguinte. Total de manutenções efetuadas: **R$ 1.700,00**.

Em PL-01, definir periodicidade demonstrativa de **30 dias** e primeira ocorrência de 10/09/2026. Emitir o plano, gerar OS-01, iniciar/concluir, registrar R$ 350,00 e conferir a próxima ocorrência em **10/10/2026**. Repetir geração para 10/09 não cria outra OS. A ocorrência de 10/10 pode gerar outra OS legítima, mas, enquanto não executada, não aumenta os R$ 1.700,00. Este cálculo segue a decisão de ensaio da seção 4.3.

Cenário separado **F-MAN-LONGO**: plano com 12 descrições de serviço fictícias, para conferir emissão e execução completas em mais de uma página. Não altera o total financeiro do cenário principal.

### 6.4 F-CONS — combustíveis e lubrificantes

Período de conferência: **01/09/2026 a 30/09/2026**. Quantidades em litros apenas nestes exemplos; o cadastro deve guardar a unidade utilizada, sem presumir que todo lubrificante tenha a mesma apresentação.

| Registro | Data | Objeto | Tipo | Origem | Quantidade | Valor unitário de teste | Total |
|---|---|---|---|---|---:|---:|---:|
| C-01 | 02/09/2026 | V-DEMO-01 | Combustível | Terceiro | 40 L | R$ 6,00 | R$ 240,00 |
| C-02 | 04/09/2026 | V-DEMO-01 | Combustível | Próprio | 30 L | R$ 5,80 | R$ 174,00 |
| C-03 | 06/09/2026 | V-DEMO-02 | Combustível | Terceiro | 60 L | R$ 6,00 | R$ 360,00 |
| C-04 | 08/09/2026 | M-DEMO-01 | Combustível | Próprio | 20 L | R$ 5,80 | R$ 116,00 |
| L-01 | 10/09/2026 | V-DEMO-01 | Lubrificante | Próprio | 4 L | R$ 25,00 | R$ 100,00 |
| L-02 | 11/09/2026 | V-DEMO-02 | Lubrificante | Terceiro | 2 L | R$ 30,00 | R$ 60,00 |
| L-03 | 12/09/2026 | M-DEMO-01 | Lubrificante | Terceiro | 2 L | R$ 30,00 | R$ 60,00 |
| L-04 | 13/09/2026 | E-DEMO-01 | Lubrificante | Próprio | 1 L | R$ 25,00 | R$ 25,00 |
| L-05 | 14/09/2026 | A-DEMO-01 | Lubrificante | Terceiro | 1 L | R$ 30,00 | R$ 30,00 |

**Resultados:** combustíveis: 150 L e **R$ 890,00**; lubrificantes: 10 L e **R$ 275,00**; gasto combinado dos dois grupos: **R$ 1.165,00**. Não totalizar os 150 L de combustível e os 10 L de lubrificante como “160 L de abastecimento de combustível”.

O relatório de abastecimentos **dos dois veículos** inclui C-01/C-02/C-03: **130 L e R$ 774,00**. Para V-DEMO-01: **70 L/R$ 414,00**; para V-DEMO-02: **60 L/R$ 360,00**. O abastecimento de M-DEMO-01 permanece consultável na frota, mas não entra quando o filtro seleciona somente os dois veículos. Lubrificantes continuam no histórico do item 9, com sua identificação própria.

### 6.5 F-GASTOS — conciliação do controle geral

Acrescentar um gasto operacional **G-01 de R$ 90,00 em V-DEMO-01**, data 15/09/2026, natureza “Outro gasto operacional — DEMO”. Esse registro é próprio do controle do item 2; não gera conta a pagar.

| Objeto | Manutenção efetuada | Combustível | Lubrificante | Outro gasto | Total realizado |
|---|---:|---:|---:|---:|---:|
| V-DEMO-01 | R$ 350,00 | R$ 414,00 | R$ 100,00 | R$ 90,00 | **R$ 954,00** |
| V-DEMO-02 | R$ 600,00 | R$ 360,00 | R$ 60,00 | R$ 0,00 | **R$ 1.020,00** |
| M-DEMO-01 | R$ 450,00 | R$ 116,00 | R$ 60,00 | R$ 0,00 | **R$ 626,00** |
| E-DEMO-01 | R$ 180,00 | R$ 0,00 | R$ 25,00 | R$ 0,00 | **R$ 205,00** |
| A-DEMO-01 | R$ 120,00 | R$ 0,00 | R$ 30,00 | R$ 0,00 | **R$ 150,00** |
| **Total** | **R$ 1.700,00** | **R$ 890,00** | **R$ 275,00** | **R$ 90,00** | **R$ 2.955,00** |

Os zeros indicam ausência de outros fatos nesse conjunto controlado, não valores desconhecidos. O gasto do agregado aparece em sua própria linha; não somá-lo outra vez ao total geral por estar vinculado à máquina. Uma visão agrupada máquina+agregado, se já existente, deve identificar subtotal, nunca contá-lo novamente.

Seguros/obrigações/ocorrências da seção seguinte **não criam gastos automaticamente**. No cenário principal são registros de controle sem novo fato reconhecido em F-GASTOS. Em produção, um gasto efetivo de seguro/obrigação/ocorrência pode ser registrado ou referenciado uma única vez, pela fonte competente. Não excluir uma natureza de gasto real do módulo; apenas não confundir informação de ocorrência com despesa efetivada.

### 6.6 F-DOC — seguros, obrigações e vencimentos

| Registro de teste | Objeto | Tipo | Agendamento, se pertinente | Vencimento | Controle demonstrativo |
|---|---|---|---|---|---|
| S-01 | V-DEMO-01 | Seguro / APOLICE-DEMO-01 | — | 20/09/2026 | Vigência desde 21/09/2025; consultar sem renovar automaticamente. |
| O-01 | V-DEMO-01 | Licenciamento — DEMO | 18/09/2026 | 25/09/2026 | Previsto; registrar cumprimento em teste separado e manter referência. |
| D-01 | V-DEMO-02 | Documento operacional — DEMO | — | 30/09/2026 | Outro tipo documental para provar diversidade. |
| S-02 | V-DEMO-02 | Seguro / APOLICE-DEMO-02 | — | 01/10/2026 | Vigência desde 02/10/2025; fora do filtro de setembro. |
| O-02 | V-DEMO-02 | Licenciamento anterior — DEMO | 25/08/2026 | 31/08/2026 | Cumprido no ensaio; preservar o histórico. |
| O-03 | V-DEMO-02 | IPVA — DEMO, não obrigação real | 10/11/2026 | 15/11/2026 | Tipo cadastrado para ensaio, sem cálculo ou cobrança fiscal. |

Filtrar vencimentos de **01/09 a 30/09/2026** retorna **três registros: S-01, O-01 e D-01**. O-01 aparece uma vez, apesar de ser acessível na agenda de obrigações e na consulta documental. Filtrar outubro retorna S-02. Um cumprimento muda a situação, mas não altera silenciosamente o vencimento original nem elimina a linha quando o filtro não exclui cumpridos.

Preparar seguro adicional para M-DEMO-01/E-DEMO-01 em cenário isolado para verificar seleção de objetos da frota, sem alterar a expectativa de três linhas de F-DOC. Não usar datas de cadastro no lugar das de vencimento.

### 6.7 F-OCOR — ocorrências com datas e valores

Registrar exemplos independentes: multa DEMO de **R$ 160,00**, data 12/09/2026, em V-DEMO-01; acidente DEMO com valor envolvido de **R$ 4.500,00**, em V-DEMO-02, data 13/09/2026; ocorrência DEMO de **R$ 300,00** em E-DEMO-01, data 14/09/2026; ocorrência DEMO de **R$ 120,00** em A-DEMO-01, data 15/09/2026. Reabrir e conferir objeto, tipo, data e valor.

Os valores são informativos nesse cenário e **não aumentam automaticamente os R$ 2.955,00**. Se um deles virar gasto realizado em outro ensaio, registrar o fato/vínculo e recalcular a expectativa explicitamente; não reutilizar a expectativa antiga.

### 6.8 F-PAG — base separada para paginação e limites

Em cenário isolado, cadastrar **27 unidades principais**: 20 veículos, 4 máquinas e 3 equipamentos, sem agregados nesse conjunto. Com capacidade de dez linhas: páginas **10/10/7** e listagem emitida com os **27**. Pesquisar registro que estaria na terceira página. Não somar este conjunto aos cinco objetos dos cenários financeiros.

Separadamente, preparar relatório de 12 abastecimentos ou 12 documentos para testar segunda página/exportação; não alterar F-CONS/F-DOC. Criar registros exatamente em 01/09 e 30/09 e outros em 31/08 e 01/10 para verificar os limites inclusivos de data. Registrar cada estado inicial antes de ensaios destrutivos ou alterações de situação.

---
<a id="itens"></a>
## 7. Desenvolvimento item a item

Para cada requisito, manter **TR, implementação, demonstração, aceite, limite e dependências**. Os nomes de telas e campos são a proposta mínima para produzir o resultado; não substituem a redação do TR nem tornam informações auxiliares novos documentos obrigatórios.

<a id="fro-001"></a>
### FRO-001 — Gerenciamento de veículos, máquinas e equipamentos

**TR — FROTAS, item 1, p. 48:**

> Permitir realizar o gerenciamento e controle da frota municipal de veículos, máquinas e equipamentos

**Implementação:** Criar a área única **Frotas**, com cadastro operacional de veículos, máquinas e equipamentos e uma ficha para cada unidade. Usar identificação interna, descrição, categoria e situação; apresentar de forma contextual utilização, manutenção, consumos/gastos, documentos e ocorrências da mesma unidade. As categorias compartilham serviços e componentes, sem obrigar placa em máquina/equipamento nem fingir que tudo é automóvel.

A identificação do item 11 pertence a este mesmo cadastro. A escolha de um objeto numa operação deve recuperar sua descrição/identificação sem redigitação. Agregados citados nos itens 3/7 recebem identificação no mesmo domínio, conforme Q-F01. Desativação cadastral, se utilizada, não é baixa patrimonial e não apaga histórico.

**Dados de outro módulo / serviço compartilhado:** **DEP-01:** órgão, setor e permissões. **DEP-03, se existente:** referência ao bem patrimonial. **DEP-02, quando usado:** responsável. Confirmar as origens; o cadastro operacional de Frotas continua no escopo mesmo sem importação de Patrimônio.

**Demonstração:**

1. Cadastrar V-DEMO-01, V-DEMO-02, M-DEMO-01 e E-DEMO-01; incluir A-DEMO-01 para os itens que o mencionam.
2. Reabrir as fichas, selecionar uma máquina num plano e um equipamento numa ocorrência.
3. Abrir a ficha do veículo após os cenários e consultar seus registros vinculados; recarregar e repetir com outra sessão autorizada.

**Aceite técnico:** Veículos, máquinas e equipamentos podem ser gerenciados pelo módulo, com registros persistidos e identificações próprias. Não há somente uma lista de veículos com nomes de máquinas inseridos como observação. A ficha recupera os eventos corretos, sem misturar unidades ou órgãos.

**Atenção / limite de escopo:** Não implementar rastreamento, despacho/reserva, controle patrimonial ou disponibilidade obtida por sensor. “Gerenciamento” é demonstrado pelas funções específicas do bloco; não é autorização para acrescentar outro ERP de transportes.

<a id="fro-002"></a>
### FRO-002 — Controle dos gastos da frota

**TR — FROTAS, item 2, p. 48:**

> Permitir realizar o controle de gastos pertencentes à frota municipal de veículos, máquinas e equipamentos.

**Implementação:** Disponibilizar **Gastos** como consulta consolidada no contexto de Frotas/ficha, com objeto, natureza, data do fato, valor realizado e origem. Reaproveitar registros de manutenção executada e de consumo; permitir registro de outro gasto operacional quando necessário, sem nova obrigação financeira. Mostrar previstos separadamente dos realizados.

Aplicar uma única apropriação por fato/linha. O custo de uma manutenção ou consumo não pode ser digitado novamente só para aparecer na consulta. Uma referência financeira, quando disponível, complementa o vínculo, não soma um segundo gasto. Preservar valores desconhecidos como pendência e não como zero.

**Dados de outro módulo / serviço compartilhado:** **DEP-05, se fonte adotada:** documento e fato de serviço/fornecimento/financeiro. **DEP-04, se houver material próprio originado no estoque:** quantidade e custo da saída já confirmada. Dados locais de gastos/OS/consumos são de Frotas; não desenvolver Financeiro ou Estoque.

**Demonstração:**

1. Executar F-MAN, F-CONS e o gasto G-01, sem lançar de novo os fatos derivados.
2. Consultar por objeto e por natureza os valores de F-GASTOS: total **R$ 2.955,00**.
3. Reenviar conclusão de OS e consumo; o total permanece igual. Abrir uma origem e conferir o mesmo fato.
4. Em teste isolado, apresentar valor estimado e gasto sem valor informado; nenhum é somado silenciosamente como realizado completo.

**Aceite técnico:** Totais por unidade e natureza conciliam com os registros: V-DEMO-01 R$ 954,00; V-DEMO-02 R$ 1.020,00; máquina R$ 626,00; equipamento R$ 205,00; agregado R$ 150,00. O consolidado não duplica a relação máquina/agregado nem os documentos de origem. Previsto, realizado e desconhecido são distinguíveis.

**Atenção / limite de escopo:** Não executar pagamento, empenho, liquidação, depreciação, rateio universal ou análise de custo/km. A palavra gasto não será apresentada como confirmação de pagamento sem retorno real da fonte competente.

<a id="fro-003"></a>
### FRO-003 — Planos de revisão e manutenção preventiva com ordens de serviço

**TR — FROTAS, item 3, p. 48:**

> Permitir programar, emitir e controlar a execução de planos de revisão periódicos e de manutenção preventiva a serem efetuados nos veículos, máquinas, equipamentos e agregados possibilitando gerar as suas devidas ordens de serviço a partir desses planos.

**Implementação:** Na área **Manutenção**, disponibilizar cadastro do plano para revisão periódica ou manutenção preventiva, selecionando **veículo, máquina, equipamento ou agregado**, serviços e programação. Manter periodicidade utilizável para nova ocorrência; a implementação-base é por calendário conforme seção 4.3.

Oferecer **Emitir plano** com seus serviços/programação e **Gerar OS** para a ocorrência escolhida, herdando dados. A OS tem documento emitível e vínculo ao plano. Controlar execução com estado, datas, serviços realizados e resultado. Conclusão alimenta o histórico; gasto efetivo, quando registrado, alimenta o item 8 e o item 2 uma vez.

Impedir OS duplicada da mesma ocorrência; permitir OS de outra ocorrência do mesmo plano. A emissão é uma saída documental real, não apenas uma linha no grid. Não confundir geração de OS com execução concluída.

**Dados de outro módulo / serviço compartilhado:** **DEP-02, se utilizado:** responsável/prestador. **DEP-03, quando houver:** identificação do bem. **DEP-06:** emissão de plano/OS pelo núcleo. **DEP-05, somente se origem já existente:** referência do serviço/valor. Plano e execução são dados nativos de Frotas; não criar Compras ou oficina independente.

**Demonstração:**

1. Criar PL-01 como revisão periódica de V-DEMO-01, em 10/09/2026, recorrência demonstrativa de 30 dias. Emitir o plano e abrir o documento.
2. Gerar e emitir OS-01 a partir dele; verificar herança dos serviços e data, sem redigitação.
3. Iniciar/concluir a execução e registrar gasto de R$ 350,00. Mostrar data efetiva, resultado e histórico.
4. Conferir 10/10/2026 como próxima ocorrência; reenvio da primeira não duplica OS e a segunda pode ter OS própria ainda não executada.
5. Repetir geração/execução nos planos de máquina, equipamento e agregado de F-MAN, incluindo manutenção preventiva. Emitir plano/OS com 12 serviços em cenário isolado.

**Aceite técnico:** As cinco partes do requisito estão comprovadas: programação periódica, emissão do plano, geração da OS vinculada, emissão da OS e controle de execução. As duas naturezas — revisão periódica e preventiva — e os quatro tipos de objeto funcionam. Documento com várias páginas não omite serviços; OS futura não aumenta manutenção efetuada.

**Atenção / limite de escopo:** Não implementar manutenção preditiva, telemetria, agenda gráfica obrigatória, gestão de oficina/peças ou aprovadores adicionais. Q-F01 define o uso de agregados e Q-F02 a periodicidade real; os exemplos não são instruções de manutenção para equipamentos reais.

<a id="fro-004"></a>
### FRO-004 — Histórico de utilização dos veículos

**TR — FROTAS, item 4, p. 48:**

> Permitir o registro do histórico de utilização dos veículos

**Implementação:** Disponibilizar **Registrar utilização** a partir do veículo e na área Utilização, guardando veículo, data/período, finalidade e referências pertinentes à rota/condutor. Campos auxiliares são proposta operacional; aproveitar o padrão existente sem exigir novo cadastro de CNH ou jornada.

Consultar histórico cronológico paginado e permitir abrir cada registro. Leituras manuais de hodômetro podem ser usadas quando disponíveis, com unidade clara e consistência do par inicial/final. O histórico deve sobreviver a alteração descritiva da rota e não depender apenas do status atual do veículo.

**Dados de outro módulo / serviço compartilhado:** **DEP-02, quando utilizado:** identidade do condutor/responsável, sem criar gestão de pessoal. Rota e veículo são internos de Frotas; não há dependência de GPS, RH completo ou aplicativo.

**Demonstração:**

1. Cadastrar U-01 e U-02 em V-DEMO-01 e U-03 em V-DEMO-02, conforme F-ROT/USO.
2. Abrir o histórico de V-DEMO-01: dois registros, com períodos/finalidades identificados; reabrir um deles.
3. Recarregar, filtrar outra data/veículo e conferir separação. Quando usar as leituras, verificar 60 km e 40 km nos dois registros do primeiro veículo.

**Aceite técnico:** Utilizações são eventos efetivamente registrados, com veículo e período recuperáveis. O primeiro veículo tem duas utilizações e o segundo uma, sem confusão com abastecimentos, seguros ou trajetos de GPS. Edição autorizada deixa o registro de auditoria correspondente.

**Atenção / limite de escopo:** Não criar controle de ponto, diária, despacho, autorização de viagem, reserva, rastreamento ou aplicativo de diário de bordo. Esses recursos não estão descritos no item 4.

<a id="fro-005"></a>
### FRO-005 — Registro e controle de seguros

**TR — FROTAS, item 5, p. 48:**

> Possibilitar que seja realizado o registro e controle de seguros da frota.

**Implementação:** Na área Documentos e na ficha da unidade, registrar seguro com referência, unidade(s) coberta(s), vigência e informações pertinentes ao controle. A apólice pode referenciar seguradora existente; não impor integração externa. Mostrar cobertura/vigência segundo datas cadastradas e permitir consultar registros anteriores sem sobrescrevê-los.

O vencimento alimenta a relação documental do item 13 a partir do mesmo registro. Não criar automaticamente gasto realizado ou pagamento só por cadastrar valor de apólice. Se um seguro já cobre vários objetos no núcleo, preservar a relação sem multiplicar seu custo.

**Dados de outro módulo / serviço compartilhado:** **DEP-02, se usada:** seguradora como pessoa/fornecedor já cadastrado. **DEP-06, se há arquivo existente:** referência documental. Não implementar cadastro geral de seguradoras, cotação ou conector de seguro.

**Demonstração:**

1. Registrar S-01 e S-02 de F-DOC, com suas referências e vigências; reabrir a partir de cada veículo.
2. Consultar em 18/09/2026 como data de referência de teste e distinguir vigência de vencimento.
3. Emitir a relação de setembro e conferir que S-01 aparece e S-02, que vence em outubro, não.
4. Em cenário isolado, selecionar máquina/equipamento como objeto de seguro; preservar o histórico ao cadastrar outra vigência.

**Aceite técnico:** Seguro permanece vinculado ao objeto correto, com referência e datas consultáveis. O controle e o relatório usam os mesmos dados. Registro antigo continua recuperável e a edição não duplica documentos/vencimentos.

**Atenção / limite de escopo:** Não criar abertura/liquidação de sinistro, renovação automática, cálculo atuarial, e-mail ou pagamento. Anexar PDF da apólice pode ser preservado se já houver, mas não é uma nova obrigação deste item.

<a id="fro-006"></a>
### FRO-006 — Agendamento e controle de obrigações: IPVA e licenciamento

**TR — FROTAS, item 6, p. 48:**

> Possibilitar o cadastro de agendamento e controle das obrigações dos veículos como IPVA e licenciamento.

**Implementação:** Criar registro de obrigação do veículo com tipo, referência/exercício pertinente, agendamento, vencimento e situação; contemplar explicitamente **IPVA e licenciamento**, sem limitar o cadastro a apenas um deles. Identificar data agendada para providência e data limite separadamente. Permitir registrar o cumprimento administrativo com a referência disponível, sem afirmar pagamento bancário.

A listagem funciona como agenda tabular por data e situação; o mesmo registro aparece na relação de vencimentos quando pertinente. Não exigir um calendário gráfico. Não determinar valores/calendários oficiais no código e não presumir que todo veículo municipal tenha obrigação tributária de IPVA.

**Dados de outro módulo / serviço compartilhado:** **DEP-06, se existente:** referência de documento. **DEP-05, apenas quando informação de cumprimento/valor já vier de lá:** consumir e identificar a fonte. Não construir integração com órgãos de trânsito, arrecadação ou Financeiro.

**Demonstração:**

1. Cadastrar O-01: licenciamento DEMO de V-DEMO-01, agendado em 18/09 e vencendo em 25/09/2026.
2. Cadastrar O-03: tipo IPVA — DEMO em V-DEMO-02, com as datas fictícias de F-DOC, sem gerar cobrança.
3. Consultar a agenda e, em teste controlado, registrar cumprimento de O-01. Conferir que o vencimento original continua disponível e que não surgiu documento duplicado.

**Aceite técnico:** É possível cadastrar, agendar e controlar ambos os tipos, com situação persistida. Data agendada não substitui vencimento; cumprir a obrigação não apaga o histórico nem significa integração financeira não executada.

**Atenção / limite de escopo:** Datas e valores são informados/parametrizados pela entidade. O item não pede cálculo de imposto, consulta oficial, declaração de isenção, baixa bancária, emissão de guia ou aviso por e-mail.

<a id="fro-007"></a>
### FRO-007 — Ocorrências com datas e valores

**TR — FROTAS, item 7, p. 48:**

> O software deverá permitir o registro das ocorrências envolvendo os veículos, equipamentos e agregados como: multas, acidentes etc., registrando datas e valores envolvidos.

**Implementação:** Disponibilizar ocorrência vinculada a veículo, equipamento ou agregado, com tipo — incluindo multa, acidente e outros —, **data e valor envolvido em campos próprios**, além de descrição suficiente. Não esconder o valor em texto livre. O cadastro comum pode permitir máquina quando cabível, mas não pode omitir agregados explicitamente citados.

Preservar situação de valor não apurado quando existir, sem convertê-lo em zero. Os exemplos de aceite utilizam valores conhecidos. Uma ocorrência informativa não altera automaticamente o total realizado; eventual gasto decorrente deve ter vínculo ao mesmo fato conforme seção 4.2.

**Dados de outro módulo / serviço compartilhado:** **DEP-02, se necessário:** responsável/interessado já cadastrado. **DEP-06, se já houver:** documento de referência. **DEP-05, somente para gasto real originado lá:** vínculo de despesa, sem executar pagamento. Ocorrência operacional é de Frotas.

**Demonstração:**

1. Registrar a multa DEMO de V-DEMO-01 por R$ 160,00 e o acidente DEMO de V-DEMO-02 por R$ 4.500,00 com suas datas.
2. Registrar as ocorrências de E-DEMO-01 e A-DEMO-01, valores R$ 300,00 e R$ 120,00.
3. Reabrir os quatro registros, filtrar por objeto/data/tipo e conferir os valores. Verificar que os registros informativos não alteraram F-GASTOS sem reconhecimento de despesa.

**Aceite técnico:** Tipos, datas e valores persistem com o objeto correto. Veículo, equipamento e agregado podem ter ocorrência. A lista não se resume a anotações sem data/valor e não trata estimativa de dano como pagamento confirmado.

**Atenção / limite de escopo:** Registrar uma multa não significa emitir autuação oficial, recorrer, aplicar pontos à CNH ou consultar DETRAN. Acidente não obriga módulo de sinistros, acionamento de seguradora ou perícia.

<a id="fro-008"></a>
### FRO-008 — Histórico de gastos com manutenções efetuadas

**TR — FROTAS, item 8, p. 48:**

> Permitir histórico de gastos com manutenções efetuadas.

**Implementação:** Apresentar histórico dos gastos de **manutenções efetuadas**, identificado por objeto, data efetiva, serviço, OS/plano quando houver e valor realizado. A conclusão da OS deve disponibilizar o evento automaticamente no histórico. Se já houver manutenção efetuada registrada sem plano na origem, incluí-la com sua referência, sem inventar plano retroativo; isso não substitui o teste do item 3 nem exige criar outro fluxo de manutenção avulsa.

Separar estimativa/programação de execução. Usar a mesma origem do controle geral de gastos, com consulta/geração pelo núcleo, sem fazer outro lançamento financeiro.

**Dados de outro módulo / serviço compartilhado:** **DEP-05, se origem existente:** serviço, documento e valor realizado. **DEP-06:** consulta/relatório compartilhado. OS e execução internas de Frotas são fonte quando não há documento de outro módulo. Sinalizar dados ausentes sem declarar integração pronta.

**Demonstração:**

1. Concluir as cinco ordens de F-MAN e abrir o histórico: total R$ 1.700,00.
2. Filtrar V-DEMO-01 e conferir OS-01, execução de 10/09/2026 e R$ 350,00.
3. Manter a OS de outubro ainda não executada: ela não aparece como manutenção efetuada de setembro.
4. Repetir a confirmação e abrir o gasto de origem; o histórico não duplica e concilia com F-GASTOS.

**Aceite técnico:** O histórico mostra eventos realizados e seus valores, não o total orçado dos planos. Serviço, data e origem são recuperáveis. Reenvio não cria outro gasto e a mesma manutenção não soma novamente na consulta geral.

**Atenção / limite de escopo:** Não desenvolver oficina, pedido de compra ou nova etapa de pagamento. Não exigir que toda manutenção histórica tenha sido gerada por plano futuro; manter distinta a capacidade de gerar OS dos planos.

<a id="fro-009"></a>
### FRO-009 — Histórico de combustíveis e lubrificantes próprios ou de terceiros

**TR — FROTAS, item 9, p. 48:**

> Permitir histórico de gastos com combustíveis e lubrificantes (materiais próprios ou de terceiros).

**Implementação:** Implementar registro e histórico de consumo/gasto com dois eixos separados: **tipo de material (combustível ou lubrificante)** e **origem (próprio ou terceiro)**. Vincular objeto, data, material/descrição, quantidade, unidade, valor e referência de origem disponível. Uma lista apenas de combustíveis de posto externo não atende ao conjunto. “Próprio ou terceiro” identifica a origem do material/fornecimento, não a propriedade do veículo.

Para próprio, referenciar saída/custo real do estoque quando disponível; sem essa integração definida, permitir registro nativo de consumo com custo informado, sem criar estoque paralelo ou alegar baixa externa. Para terceiro, usar dados do fornecimento existente ou registrar consumo operacional com sua referência. A mesma operação alimenta o histórico e o controle de gastos uma vez.

**Dados de outro módulo / serviço compartilhado:** **DEP-04, para materiais próprios já controlados em estoque:** material, unidade, saída e custo confirmados. **DEP-02/DEP-05, quando usados:** fornecedor/fornecimento/documento de terceiros. Destacar as fontes; não criar baixa de Almoxarifado, compra, nota fiscal ou pagamento.

**Demonstração:**

1. Registrar as nove linhas de F-CONS, cobrindo combustível próprio/terceiro e lubrificante próprio/terceiro.
2. Consultar o histórico por tipo e origem: combustível R$ 890,00; lubrificante R$ 275,00; total R$ 1.165,00.
3. Verificar L-01 próprio com custo R$ 100,00 e L-02 de terceiro com R$ 60,00; o próprio não pode virar zero por padrão.
4. Repetir uma gravação e conferir os mesmos totais, com documento/movimento de origem consultável quando realmente disponível.

**Aceite técnico:** As quatro combinações de tipo/origem funcionam e persistem. Quantidades têm unidade, os custos conciliam e não se somam materiais diferentes sob rótulo enganoso. Falta de valor é indicada, não falsamente preenchida como zero. O histórico do item 9 e o relatório do item 14 usam os registros corretos de cada recorte.

**Atenção / limite de escopo:** Não impor cartão combustível, bomba/tanque, importação, integração com postos, controle de lubrificação por sensores, cálculo km/L ou regras de valorização de estoque. Consumo próprio é apropriação operacional, não compra obrigatória.

<a id="fro-010"></a>
### FRO-010 — Cadastro de rotas

**TR — FROTAS, item 10, p. 48:**

> Permitir o cadastro de rotas.

**Implementação:** Na área Utilização e rotas, criar/manter rota com identificação, nome, origem, destino e descrição do percurso. Esses campos são a proposta cadastral mínima; o texto do TR não define mapa, paradas obrigatórias ou precisão geográfica. Permitir selecionar a rota existente na utilização para reaproveitar a informação, sem impor seu preenchimento a toda operação quando inaplicável.

Persistir o cadastro e reutilizar o identificador. Alterar descrição não muda silenciosamente o histórico já registrado; usar a política de auditoria/referência histórica do ERP.

**Dados de outro módulo / serviço compartilhado:** Sem dado obrigatório de outro módulo para este cadastro. **DEP-01** aplica escopo/permissões. Endereços/localizações institucionais podem ser reaproveitados se já existirem; não implementar CEP, geocodificação ou outro cadastro de locais para concluir o item.

**Demonstração:**

1. Cadastrar R-DEMO-01 e R-DEMO-02 com suas descrições e destinos fictícios.
2. Reabrir e editar a descrição de uma rota em teste; consultar as duas separadamente.
3. Selecionar R-DEMO-01 em U-01 e abrir sua referência no histórico, sem digitar novamente o trajeto.

**Aceite técnico:** Rotas são cadastros recuperáveis e selecionáveis, não apenas texto ocasional no registro de utilização. O vínculo persiste e não exige mapa ou GPS para funcionar.

**Atenção / limite de escopo:** Não criar roteirizador, otimização de percurso, mapa, quilometragem automática, acompanhamento em tempo real ou aplicativo de motorista.

<a id="fro-011"></a>
### FRO-011 — Cadastro de veículos

**TR — FROTAS, item 11, p. 48:**

> Permitir o cadastro de Veiculos.

**Implementação:** Usar o cadastro do item 1 para criar e manter veículos: identificação interna, descrição e categoria; campos veiculares pertinentes, como placa, marca/modelo ou ano, são informações operacionais a mapear conforme o padrão existente, não documentos compulsórios adicionais definidos pelo item. Não tornar RENAVAM/chassi/anexo obrigatório sem base na configuração existente.

A ficha criada deve estar imediatamente disponível para utilização, manutenção, consumo, seguro, obrigação e ocorrência. Cadastro novo não recebe gastos, sinistros ou saldo fictícios. Validar unicidade do identificador no escopo correto.

**Dados de outro módulo / serviço compartilhado:** **DEP-03, se já houver:** vínculo com bem/tombamento. **DEP-01/DEP-02:** órgão/setor/responsável existentes quando utilizados. Não depender de criar Patrimônio nem de consultar base externa para permitir um cadastro operacional válido.

**Demonstração:**

1. Criar V-DEMO-01 e V-DEMO-02 pelo formulário normal, com dados sintéticos adequados à validação.
2. Salvar, sair e reabrir; editar informação descritiva permitida.
3. Selecionar os dois em operações e emitir a listagem geral. Tentar repetir o identificador interno no mesmo órgão e verificar a validação.

**Aceite técnico:** Veículos são registrados e mantidos no mesmo cadastro operacional usado pelas demais ações. Não há base paralela que exija cadastrar o mesmo veículo novamente em cada aba. Duplicidade de código é tratada sem apagar registros anteriores.

**Atenção / limite de escopo:** Não acrescentar regularização documental, transferência de propriedade, compra/venda, depreciação, placa oficial gerada pelo sistema ou consulta DETRAN.

<a id="fro-012"></a>
### FRO-012 — Emissão da listagem geral da frota

**TR — FROTAS, item 12, p. 48:**

> Possibilitar emitir a listagem da frota geral.

**Implementação:** Na área Relatórios e no contexto de Frota, oferecer **Emitir listagem da frota geral**, consultando o conjunto completo autorizado. Incluir identificação/código, descrição, categoria e situação; demais dados do padrão existente podem constar sem tornar novas colunas exigência do TR.

Abranger veículos, máquinas e equipamentos do recorte. Agregados cadastrados podem aparecer em agrupamento identificado com seu vínculo, sem rotulá-los como veículos ou duplicar unidades principais. Filtros, totais por categoria e momento da emissão devem ficar claros. Gerar documento imprimível/exportável, não apenas screenshot do grid.

**Dados de outro módulo / serviço compartilhado:** **DEP-06:** emissão/formatos pelo núcleo de relatórios. **DEP-03**, apenas se houver referência patrimonial exibida: consumir identificação real. Fonte principal é o cadastro operacional de Frotas; não usar inventário patrimonial inteiro como lista de veículos.

**Demonstração:**

1. Emitir F-CAD: dois veículos, uma máquina, um equipamento e o agregado devidamente identificado.
2. Em F-PAG isolado, emitir os 27 registros a partir de uma tela que mostra apenas dez por página.
3. Conferir primeiro/último registro, contagens por categoria e que a exportação não trouxe apenas a página visível. Testar um filtro sem resultado.

**Aceite técnico:** A listagem é gerada com todos os registros do filtro e inclui máquinas/equipamentos. O conjunto F-PAG possui 27 linhas de unidades principais, com 20/4/3 por categoria. Não há perda pela paginação ou contagem duplicada por relacionamentos.

**Atenção / limite de escopo:** Não criar dashboard, BI ou relatório regulatório com leiaute inventado. “Emitir” requer saída gerada e acessível, não botão decorativo.

<a id="fro-013"></a>
### FRO-013 — Relação de vencimentos de documentos por período

**TR — FROTAS, item 13, p. 48:**

> Possibilitar emitir a relação dos vencimentos de documentos diversos por período.

**Implementação:** Oferecer **Vencimentos de documentos** com data inicial/final filtrando a data de vencimento, tipo de documento e objeto quando pertinente. Unificar a consulta de seguros, obrigações e outros documentos registrados sem copiar a mesma obrigação para outra tabela apenas para emitir o relatório. Para documento diverso sem outra fonte disponível, usar o mesmo formulário documental de Frotas para registrar tipo, referência, objeto e vencimento; não criar outro GED ou exigir um arquivo anexado por suposição.

Mostrar documento/referência, tipo, unidade da frota, vencimento e situação. O período deve incluir documentos diversos, não só IPVA ou só seguros. Não ocultar cumpridos/vigentes/futuros sem declarar o filtro aplicado. Datas e status têm o mesmo significado na ficha e no documento.

**Dados de outro módulo / serviço compartilhado:** **DEP-06:** identificadores documentais/relatório quando existentes. **DEP-05**, somente quando alguma informação efetivamente vier da origem financeira: referência e situação explicitamente mapeada. Documentos/seguros/obrigações de Frotas são a fonte desta consulta.

**Demonstração:**

1. Registrar F-DOC e filtrar 01/09 a 30/09/2026: retornar S-01, O-01 e D-01.
2. Conferir que seguro de outubro, licenciamento de agosto e IPVA DEMO de novembro ficaram fora pelo vencimento, não pela data de cadastro.
3. Registrar cumprimento de O-01 em teste separado e emitir sem filtro de situação: ainda aparece uma vez, agora com a situação correta.
4. Em cenário de várias páginas, exportar o recorte inteiro; testar datas de borda e período sem registros.

**Aceite técnico:** Relação emitida possui três registros no cenário-base de setembro, de tipos distintos, com O-01 apenas uma vez. Filtros usam vencimento e nenhum registro é eliminado por estar em outra página. Cumprimento não altera a data original silenciosamente.

**Atenção / limite de escopo:** Não limitar a vencidos na data atual, não criar envio automático de avisos, consulta oficial ou novo motor de cobrança. Relação de vencimentos não é certidão de regularidade.

<a id="fro-014"></a>
### FRO-014 — Relatório de abastecimentos por período e veículo

**TR — FROTAS, item 14, p. 48:**

> Possibilitar emitir os abastecimentos ocorridos no período por veículos.

**Implementação:** Oferecer **Abastecimentos por período e veículo** com data inicial/final referida ao abastecimento, seleção de um ou mais veículos e resultado agrupado/identificado por veículo. Usar os registros reais de combustível de Frotas, mostrando data, veículo, combustível/descrição, origem próprio/terceiro, quantidade/unidade e valor.

A emissão deve cobrir todo o recorte e apresentar subtotais/total claros. Consumos de lubrificantes continuam no histórico próprio do item 9; não apresentá-los indevidamente como combustível abastecido. Máquina/equipamento podem ser consultados em seus contextos, sem contaminar uma seleção específica dos veículos.

**Dados de outro módulo / serviço compartilhado:** **DEP-04, se houver consumo próprio originado no Almoxarifado:** referência/quantidade/custo. **DEP-05, se fornecedor externo já for fonte:** documento do fornecimento. **DEP-06:** relatório. Não criar importação de postos ou integração de bomba para emitir o recorte.

**Demonstração:**

1. Executar F-CONS e emitir setembro para V-DEMO-01: C-01/C-02, 70 L e R$ 414,00.
2. Emitir para V-DEMO-02: C-03, 60 L e R$ 360,00; selecionar ambos: 130 L e R$ 774,00.
3. Verificar que C-04 da máquina e os cinco consumos de lubrificantes não foram indevidamente incluídos nesse recorte.
4. Em cenário separado de 12 abastecimentos, visualizar duas páginas e emitir todos os 12; testar intervalo vazio e limites de data.

**Aceite técnico:** Relatório de abastecimentos é realmente emitido, usa a data do fato e identifica cada veículo. Próprio e terceiro aparecem, valores/quantidades conciliam e a exportação não se limita à primeira página. Não incluir lubrificante em total identificado como combustível.

**Atenção / limite de escopo:** Não acrescentar meta de consumo, curva de eficiência, média km/L, detecção de fraude, telemetria ou coleta automática. O requisito é a emissão do histórico de abastecimentos no período por veículo.

---
<a id="pacotes"></a>
## 8. Pacotes de implementação — entregar funcionamento, não só telas

| Pacote | Entrega do módulo único | IDs principais | Saída que deve ser demonstrada |
|---|---|---|---|
| **P0 — Diagnóstico** | Confirmar arquitetura, componentes, fronteiras e dados de origem; definir tela-piloto. | Todos, somente mapeamento inicial. | Matriz dos 14 com lacunas e dependências reais. |
| **P1 — Base operacional** | Entrada única Frotas, permissões, cadastro comum, categorias, vínculo de agregados e rotas. | 1, 10, 11. | Cadastro/reabertura das categorias e seleção de rotas. |
| **P2 — Uso e documentos** | Utilização, seguros, obrigações/agendamento e ocorrências com datas/valores. | 4, 5, 6, 7. | F-ROT/USO, F-DOC e F-OCOR com persistência. |
| **P3 — Planos e execução** | Programação, recorrência demonstrável, emissão de plano, geração/emissão de OS e conclusão. | 3, 8. | Plano → OS → execução → histórico, sem duplicação. |
| **P4 — Consumos e gastos** | Combustíveis/lubrificantes, próprios/terceiros, gastos reais e conciliação por origem. | 2, 9; integração com 8. | Quatro combinações, custos por objeto e R$ 2.955,00 do cenário. |
| **P5 — Emissões** | Listagem geral, vencimentos por período, abastecimentos por veículo e históricos emitíveis pelo núcleo. | 12, 13, 14; apoio a 2/8/9. | Documentos completos além da página visível. |
| **P6 — Ensaio** | Testar as 14 linhas, regressões, fontes existentes e interface. | Todos os 14, sem novas funções. | Evidências, pendências, arquivos alterados e comandos executados. |

Aplicar o padrão de UX em cada pacote, não apenas no final. Não estimar horas/dias sem inspecionar o código. Uma função existente e comprovada pode ser reaproveitada. Não interromper todo o módulo por uma integração opcional não definida; registrar limites conforme seção 3. Não criar ou reconstruir módulos de origem para completar o pacote.

<a id="testes"></a>
## 9. Testes, evidências e condição para concluir

### 9.1 Testes mínimos do projeto

São verificações técnicas para as funções pedidas, não uma segunda lista de exigências do TR.

| Teste | Resultado verificável |
|---|---|
| **Persistência** | Gravar/recarregar/reabrir em outra sessão mantém cadastro, utilização, documento, plano, OS, gasto e consumo. |
| **Categorias** | Máquina/equipamento não dependem de placa fictícia; plano funciona também para agregado. Ocorrências incluem os objetos citados. |
| **Plano e OS** | Plano imprimível; OS gerada dele e imprimível; vínculo e programação preservados; execução modifica histórico. |
| **Recorrência** | Mesma ocorrência não gera OS duplicada; ocorrência seguinte gera OS própria sem gasto realizado prematuro. |
| **Concorrência** | Duas sessões geram/concluem a mesma ocorrência: só um efeito real, resposta coerente para a repetição. |
| **Atomicidade** | Falha no meio da confirmação não deixa manutenção efetuada com outro gasto duplicado/parcialmente confirmado. |
| **Previsto versus realizado** | OS futura/estimativa não entra nos R$ 1.700,00 de manutenções efetuadas. Valor não informado não é zero. |
| **Quatro combinações de consumo** | Combustível próprio e terceiro; lubrificante próprio e terceiro, com custos e origens. |
| **Custo sem duplicação** | OS, documento financeiro e consumo referenciados não representam gastos adicionais do mesmo fato. Caso serviço 300 + óleo 100 resulta em 400. |
| **Conciliação** | Manutenção 1.700 + combustível 890 + lubrificante 275 + outros 90 = **R$ 2.955,00**. |
| **Vencimentos** | Setembro em F-DOC: exatamente S-01/O-01/D-01; agendamento/cadastro não substituem vencimento; cumprimento não duplica a linha. |
| **Ocorrências** | Tipo, data e valor em campos persistidos; casos de multa/acidente/equipamento/agregado; sem despesa automática só por informar valor. |
| **Abastecimentos por veículo** | V-01: 70 L/414; V-02: 60 L/360; ambos: 130 L/774. Máquina e lubrificante não entram por engano. |
| **Histórico de utilização** | Dois registros de V-01, um de V-02, com dados próprios e sem telemetria simulada. |
| **Frota geral** | F-PAG com 27 unidades principais: 20 veículos, 4 máquinas e 3 equipamentos; exportação completa. |
| **Limites de data** | Início/fim inclusos; anterior/posterior fora; intervalo vazio não retorna resultados fixos. |
| **Permissões** | Usuário de consulta não grava; acesso direto a API não contorna perfil/órgão; documento não vaza dados de outro escopo. |
| **Dados de origem** | Cada DEP-MOD localizada ou registrada como falta; sem fonte fictícia apresentada como integração. |
| **Interface desktop** | Título, filtros, tabela, paginação e ação principal visíveis no viewport de referência, sem cortar conteúdo. |
| **Paginação e exportação** | Registro da terceira página é pesquisável globalmente; emissão inclui todas as páginas, plano/OS inclui todos os serviços. |
| **Formulário e contexto** | Filtros/página preservados ao voltar; abas não perdem valores; erro identifica campo; ação não exige redigitação desnecessária. |
| **Legibilidade/celular** | Fonte e controles consistentes, teclado/foco, zoom e Chrome real; rolagem acessível quando necessária, sem aplicativo separado. |

### 9.2 Matriz de execução a entregar ao usuário

Manter **uma linha para cada FRO-001 a FRO-014**, sem marcar a linha automaticamente por encontrar a palavra no menu. Os caminhos/rotas/serviços devem ser preenchidos depois de encontrados no código.

| ID | Estado inicial | Tela/rota real | Serviço e persistência | Dados de outro módulo | Teste executado / evidência | Pendência |
|---|---|---|---|---|---|---|
| FRO-001 | A_VERIFICAR | A mapear | A mapear | A confirmar conforme seção 3 | Não executado | Diagnóstico |
| FRO-002 | A_VERIFICAR | A mapear | A mapear | A confirmar conforme seção 3 | Não executado | Diagnóstico |
| FRO-003 | A_VERIFICAR | A mapear | A mapear | A confirmar conforme seção 3 | Não executado | Diagnóstico |
| FRO-004 | A_VERIFICAR | A mapear | A mapear | A confirmar conforme seção 3 | Não executado | Diagnóstico |
| FRO-005 | A_VERIFICAR | A mapear | A mapear | A confirmar conforme seção 3 | Não executado | Diagnóstico |
| FRO-006 | A_VERIFICAR | A mapear | A mapear | A confirmar conforme seção 3 | Não executado | Diagnóstico |
| FRO-007 | A_VERIFICAR | A mapear | A mapear | A confirmar conforme seção 3 | Não executado | Diagnóstico |
| FRO-008 | A_VERIFICAR | A mapear | A mapear | A confirmar conforme seção 3 | Não executado | Diagnóstico |
| FRO-009 | A_VERIFICAR | A mapear | A mapear | A confirmar conforme seção 3 | Não executado | Diagnóstico |
| FRO-010 | A_VERIFICAR | A mapear | A mapear | A confirmar conforme seção 3 | Não executado | Diagnóstico |
| FRO-011 | A_VERIFICAR | A mapear | A mapear | A confirmar conforme seção 3 | Não executado | Diagnóstico |
| FRO-012 | A_VERIFICAR | A mapear | A mapear | A confirmar conforme seção 3 | Não executado | Diagnóstico |
| FRO-013 | A_VERIFICAR | A mapear | A mapear | A confirmar conforme seção 3 | Não executado | Diagnóstico |
| FRO-014 | A_VERIFICAR | A mapear | A mapear | A confirmar conforme seção 3 | Não executado | Diagnóstico |

Estados de acompanhamento: `A_VERIFICAR`, `EXISTE_NAO_TESTADO`, `A_IMPLEMENTAR`, `PARCIAL`, `VALIDADO_TECNICAMENTE`, `DEPENDENCIA_OUTRO_MODULO` e `AGUARDA_DEFINICAO`. Uma dependência só bloqueia o resultado que realmente precisa dela; não concluir integração sem teste nem transformar integração opcional em condição nova.

Evidência por item: estado inicial, dados usados, usuário/perfil, ação executada, resultado observado, persistência conferida e documento gerado quando pertinente. Guardar captura real da tela e o arquivo emitido quando útil; screenshot não substitui verificar efeito no banco e nos históricos. Informar testes não executados, erros e pendências sem “todos passaram” presumido.

A entrega do Codex deve incluir arquivos efetivamente alterados, migrations novas, comandos de instalação/testes **realmente verificados** e forma de acesso às telas. Um caminho como `docs/poc/frotas-status.md` é sugestão organizacional, não arquivo que foi confirmado no projeto.

### 9.3 Regra de encerramento

Marcar o requisito como validado tecnicamente somente depois de sua operação funcionar, persistir, respeitar permissão e produzir o efeito/documento correspondente. Para FRO-003, uma OS manual sem plano não atende; para FRO-009, combustível externo sozinho não atende; para FRO-012/013/014, uma tabela sem emissão real não encerra o item.

Não concluir “14/14 atendidos” com valores fixos, relatório pré-pronto, OS duplicada, campo de data/valor ignorado, página única incompleta, lubrificantes ausentes ou gastos contando o mesmo evento várias vezes. O resultado esperado é **um módulo único, operacional, legível e auditável**, não um painel decorativo. Validação técnica interna não é homologação da comissão nem auditoria de toda a licitação.

<a id="definicoes"></a>
## 10. Definições a registrar sem ampliar o escopo

### Q-F01 — Significado e vínculo dos agregados

Os itens 3 e 7 mencionam “agregados”, sem definir seu cadastro ou relação. Manter a identificação e permitir vínculo à unidade principal quando fizer sentido na estrutura existente; demonstrar com A-DEMO-01. Confirmar o significado administrativo antes de impor que todo agregado seja motor, pneu, implemento ou veículo de terceiro. A falta de definição não justifica omitir o objeto do formulário/plano/ocorrência.

### Q-F02 — Periodicidade dos planos e estado de execução

O item 3 não lista gatilhos, intervalos, serviços mecânicos, tolerâncias ou nomenclatura de estados. A proposta por calendário cobre o ensaio com parametrização; registrar o que for adotado e qual data serve de base à recorrência. Não inventar manutenção obrigatória por quilometragem/horímetro nem intervalos legais. Configuração real da entidade é separada da prova de que programação, emissão e execução funcionam.

### Q-F03 — Origem e momento de apropriação dos gastos

O TR pede controle/histórico, mas não especifica regime financeiro, método de estoque ou esquema de rateio. O plano propõe gasto operacional realizado na data do fato registrado, separado de previsto e pago. Identificar de onde vem o custo de material próprio e como a OS/consumo se relaciona ao financeiro existente. Sem valor confiável, mostrar pendência; sem integração definida, o cadastro operacional local não deve alegar baixa externa.

### Q-F04 — Documentos, obrigações e identificação veicular

Obter a configuração real quando necessária: tipos documentais, datas, vigências, dados de identificação e uso de IPVA/licenciamento. Não inventar incidência tributária, vencimentos oficiais ou documentos exigidos. O ensaio usa dados fictícios para comprovar cadastro e controle. Nenhum item deste bloco especifica um arquivo de remessa a Tribunal ou uma API externa obrigatória; não criar essa dependência por analogia com Patrimônio ou Meio Ambiente.

### Q-F05 — Fontes compartilhadas e alcance do módulo

Confirmar no repositório as fontes DEP-01 a DEP-06 e o ponto de extensão do ERP para a entrada única de Frotas. Se uma capacidade geral estiver ausente, sinalizar sem reconstruir outro módulo. Preservar o desenvolvimento das funções próprias e a rastreabilidade do que depende da origem. Não solicitar toda uma nova análise antes de iniciar: diagnosticar, implementar o que é determinado e registrar a decisão que faltar.

<a id="auditoria"></a>
## 11. Auditoria documental individual e fontes

### 11.1 Cobertura e conferência de ações

| ID | Núcleo da frase do TR | Onde a orientação cobre o resultado | O que não pode faltar |
|---|---|---|---|
| FRO-001 | Gerenciamento da frota | Cadastro comum, ficha e eventos. | Veículos, máquinas e equipamentos distintos. |
| FRO-002 | Controle de gastos | Consulta e apropriação com origem única. | Gastos por objeto e realizado separado de previsto. |
| FRO-003 | Planos e OS | Programação, emissão de plano, geração/emissão de OS e execução. | Revisão periódica, preventiva e quatro objetos incluindo agregados. |
| FRO-004 | Histórico de utilização | Registro e consulta cronológica por veículo. | Utilização persistida, não rastreamento presumido. |
| FRO-005 | Seguros | Cadastro vinculado, vigência e consulta. | Controle e histórico do seguro, não só nome da seguradora. |
| FRO-006 | Obrigações | Tipo, agendamento, vencimento e situação. | IPVA e licenciamento como tipos, sem presumir cálculo/pagamento. |
| FRO-007 | Ocorrências | Tipo, objeto, data e valor. | Multas, acidentes, equipamentos e agregados. |
| FRO-008 | Manutenções efetuadas | Execução alimenta histórico real de gastos. | Não apresentar estimativas de OS futura como gasto efetuado. |
| FRO-009 | Combustíveis e lubrificantes | Registro/histórico por tipo e origem. | Próprio/terceiro para ambos os tipos de material. |
| FRO-010 | Rotas | Cadastro reutilizável na operação. | Rota persistida; mapa não é requisito acrescentado. |
| FRO-011 | Veículos | Ficha única do cadastro da frota. | Cadastro efetivo usado nas outras operações. |
| FRO-012 | Listagem geral | Emissão pelo núcleo de relatórios. | Conjunto completo, incluindo máquinas/equipamentos. |
| FRO-013 | Vencimentos por período | Relatório com vários tipos documentais. | Filtrar data de vencimento e não duplicar registro. |
| FRO-014 | Abastecimentos por veículo/período | Emissão do recorte real de consumos de combustível. | Veículo, data do abastecimento, todos os registros do filtro. |

**Conferência da composição deste arquivo:** 14 IDs, 14 citações integrais, 14 blocos de implementação, demonstração, aceite técnico, dependências e limite de escopo. As citações foram comparadas programaticamente ao texto da página 48, normalizando apenas espaços/quebras; nenhuma citação faltante ou alterada. A página da fonte foi inspecionada visualmente para delimitar FROTAS sem incluir os itens seguintes de Compras.

Isso é auditoria **documental**: não conta funções já implementadas, testes do ERP executados ou aprovação formal. As tabelas de dados fictícios foram calculadas para conferir os resultados previstos; o software deve reproduzi-los por operações reais, nunca por valores fixos na tela.

### 11.2 Fontes e prevalência

- **TR-FROTAS:** `termo de referencia (Ratificado)(1).pdf`, 335 páginas; seção 19; título FROTAS ao fim da p. 47 e itens 1–14 na p. 48. Fonte exclusiva das transcrições funcionais específicas.
- **TR-GERAL:** mesmo documento, pp. 28–33 e 40–44, pontos transversais identificados na seção 1.4. Não representa auditoria integral desses blocos.
- **UX-BASE:** `CeleriFlow_POC_Almoxarifado_Patrimonio_Desenvolvimento_REV02.md`, seção 3.7. Referência do padrão de interface já escolhido; suas dimensões são decisões de projeto, sem nova pesquisa normativa neste arquivo.
- **CANAL/DEPENDÊNCIAS:** instruções do usuário nesta conversa, consolidadas também em `CeleriFlow_POC_Meio_Ambiente_Desenvolvimento_REV02.md`, cabeçalho e seção 1.4: mesmo site no Chrome do celular e dados de outros módulos destacados sem reconstruir a origem.

**Prevalência:** o TR ratificado é a fonte dos requisitos. As orientações deste plano detalham meios para desenvolvê-los e demonstrá-los. Não houve pesquisa externa de regras fiscais, seguro, manutenção, DETRAN, fornecedores ou bibliotecas para preencher lacunas. Nenhuma referência de fixture representa obrigação legal, fluxo administrativo oficial ou cadastro real da prefeitura.

**Entrega final esperada do agente:** um módulo Frotas no CeleriFlow, com os 14 requisitos executáveis, dados persistidos, relatórios gerados das operações, interface testada, dependências identificadas e evidências por item. Não entregar apenas um novo Markdown ou declarar o trabalho concluído pela quantidade de telas criadas.
