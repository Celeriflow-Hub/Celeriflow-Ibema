# CeleriFlow — Plano de desenvolvimento e demonstração da POC
## Almoxarifado e Patrimônio | Divino de São Lourenço/ES

**Documento de trabalho para Codex/Antigravity — 18/09/2026**  
**Fonte:** `termo de referencia (Ratificado)(1).pdf`, Processo Administrativo nº 1026/2026, seção 19.  
**Cobertura específica:** 27 itens de Almoxarifado, páginas 44–45; 32 itens de Patrimônio, páginas 45–47.  
**Objetivo:** adaptar o CeleriFlow existente e comprovar cada função por operações reais do sistema, utilizando dados fictícios coerentes.

> **Instrução principal ao agente:** inspecione o repositório, reaproveite o que existe, implemente as lacunas com persistência e integrações reais, execute os testes e registre as evidências por ID. Não entregue apenas telas demonstrativas, botões sem efeito, mocks ou um novo planejamento. Não declare atendimento só porque encontrou uma tabela, uma página ou dados de exemplo.

### Como ler este documento

O campo **TR** de cada item reproduz o requisito da fonte, preservando sua redação, inclusive repetições e pequenas imperfeições; apenas espaços e quebras de linha foram normalizados. **Implementação**, **Demonstração** e **Aceite** são propostas de desenvolvimento e verificação elaboradas para esta adaptação. Não são um roteiro oficial da comissão nem novas exigências atribuídas ao TR.

Os dados, nomes, números de documentos, valores, métodos de cálculo exemplificados, campos auxiliares e estados operacionais sugeridos são **de demonstração/projeto**, salvo quando expressamente presentes na citação do TR. A população da base será realizada pelo usuário; o agente deve fornecer as telas e, se útil, uma carga de teste segura e repetível.

**Limite da análise:** o código atual do CeleriFlow não foi inspecionado para produzir este MD. Não há afirmação de que uma função esteja pronta ou ausente. Nomes de entidades, ações e caminhos sugeridos abaixo são conceituais; o agente deve mapeá-los à estrutura real antes de editar.

**Navegação:** [Execução](#execucao) · [Contratos técnicos](#contratos) · [Base fictícia](#base) · [27 itens de Almoxarifado](#almoxarifado) · [32 itens de Patrimônio](#patrimonio) · [Ordem de desenvolvimento](#entregas) · [Pendências e aceite final](#pendencias)

---

<a id="execucao"></a>
## 1. Escopo e forma de execução

### 1.1 Primeiro passo: diagnóstico curto no repositório

Ler as instruções locais do projeto, como `AGENTS.md` quando existente, os manifests, o lockfile, o schema/migrations e os testes. Localizar os módulos de Almoxarifado/Estoque, Patrimônio, Compras/AF, Financeiro/Contabilidade, Pessoas, organograma, autenticação/permissões, auditoria, GED e relatórios.

O contexto técnico conhecido é de uma aplicação web CeleriFlow em TypeScript/React/Next.js, com PostgreSQL e autenticação existente. **Confirmar versões, ORM, serviços, rotas e organização efetiva no repositório; não atualizar stack ou migrar infraestrutura para fazer a POC.** Preservar o isolamento por ambiente/órgão já adotado, sem impor uma arquitetura multi-tenant nova.

Para cada ID, registrar um dos estados: `A_VERIFICAR`, `EXISTE_NAO_TESTADO`, `PARCIAL`, `A_IMPLEMENTAR`, `VALIDADO` ou `BLOQUEADO_EXTERNO`. O diagnóstico deve identificar a tela, o serviço de gravação, a persistência e o teste correspondentes; uma busca pelo nome de uma entidade não é diagnóstico suficiente.

### 1.2 Regras de alteração

Preservar a navegação, o padrão visual, as entidades e as permissões do CeleriFlow. Criar campos/tabelas apenas quando a estrutura atual não suportar a necessidade. Usar migrations incrementais e manter os dados existentes; não apagar tabelas, não executar reset do banco nem sobrescrever trabalho de terceiros.

Toda ação demonstrada deve percorrer a interface normal, a validação do servidor e o banco. Não usar estado apenas em memória/localStorage para fingir saldo, tombamento, baixa ou integração. Os relatórios devem ser gerados a partir das operações registradas, não de arquivos prontos com números esperados.

Trabalhar em ambiente de desenvolvimento/homologação com dados fictícios. Não publicar em produção, enviar mensagens, consultar pessoas reais, transmitir documentos ao Tribunal ou rodar cargas destrutivas sem autorização. Não expor credenciais em código, evidências ou arquivos.

### 1.3 O que não acrescentar como requisito destes módulos

Não recolocar Rastreamento Veicular nem Gestão de Previdência neste plano. Não tornar importação XLSX/CSV de materiais uma condição de atendimento de Almoxarifado: **ALM-027 pede implantação de saldos iniciais, não um formato de importação**. A importação pode existir como ferramenta auxiliar, mas não deve atrasar as funções exigidas.

Não confundir duplicação de material/modelo com duplicação de bem tombado. Não duplicar a implementação só porque o TR repete ALM-005/018, PAT-005/025 ou PAT-020/031. **Manter, entretanto, os 59 IDs separados nas evidências.**

## 2. Dependências gerais do TR que atravessam estes módulos

Estes 59 itens são um recorte técnico; não substituem todos os requisitos gerais ou a POC dos outros módulos. Ao adaptar, preservar/verificar os seguintes pontos expressos na fonte:

| Dependência da fonte | Aplicação neste desenvolvimento | Referência no TR ratificado |
|---|---|---|
| Ambiente web, responsividade e integração | Operações pelas telas reais do CeleriFlow; cadastros e documentos compartilhados; conferir o funcionamento em navegador e a navegação existente. | Seção 19, Ambiente Tecnológico, itens 1, 4, 7 e 16, pp. 28–29. |
| Transações, integridade e atualização online | Movimento, saldo e vínculo patrimonial não podem ficar inconsistentes após erro, repetição ou concorrência. | Recuperação de Falhas, itens 5–8, p. 31; Caracterização Operacional, itens 1–2, p. 32; Requisitos Gerais, itens 18–19, 24–25, 30–31, pp. 41–42. |
| Perfis, restrição por setor e auditoria | Validar permissões no servidor; registrar inclusão, alteração, exclusão lógica quando usada, emissão de relatório e operações relevantes. | Caracterização Operacional, itens 3–7, pp. 32–33; Requisitos Gerais, itens 9–13, 27 e 29, pp. 41–42. |
| Relatórios e impressão | Usar o mecanismo compartilhado de visualização, emissão e exportação; contemplar PDF, XLSX, TXT e CSV na camada comum aplicável. | Ambiente Tecnológico, itens 8–9, p. 28; Relatórios, itens 1–3, p. 33; Requisitos Gerais, itens 14–16, p. 41. |
| PDF assinado digitalmente e ajuda | Reaproveitar assinatura digital e ajuda existentes; indicar lacuna de integração se não estiverem operacionais. Um nome digitado no PDF não é uma assinatura digital. | Requisitos Gerais, itens 17 e 21, p. 41; Documentação On-line, p. 33. |
| Cadastro único e consultas externas | PF/PJ deve usar o cadastro compartilhado. As consultas SERPRO mencionadas no bloco geral são dependência separada: cadastrar pessoa fictícia não comprova consulta oficial. | Requisitos Gerais, itens 33–38, p. 42. |

Os itens gerais acima não foram transcritos integralmente nem constituem uma matriz completa do núcleo do sistema. Registrar pendências gerais em separado, sem inserir funcionalidades imaginadas nos 59 itens específicos.

<a id="contratos"></a>
## 3. Contratos técnicos para evitar soluções apenas aparentes

Todos os contratos desta seção são **decisões de implementação propostas**, apoiadas nas funções descritas no TR. Reaproveitar uma solução equivalente existente quando ela passe nos testes.

### 3.1 Cadastros e relações mínimas

| Conceito | Dados/relacionamentos que precisam existir | Observação de adaptação |
|---|---|---|
| Pessoa/fornecedor | Tipo PF/PJ, identificação e documento compatível. | Um mesmo ID em Compras, Almoxarifado e Patrimônio. |
| Material | Identificador, nome, unidade, descrições sucinta/detalhada, classificação de estoque e classe correspondente. | Duplicação cria novo cadastro, nunca novo saldo. |
| Organograma | Secretaria, setor, local e seus vínculos; centro de custo/consumo distinto quando necessário. | Reutilizar Cadastros/Administração. |
| Almoxarifado/endereço | Identificação, vínculo organizacional e posições de armazenamento. | Não confundir depósito com setor ou prateleira. |
| Lote | Material, identificação de lote, validade e origem pertinente. | Saldo pode estar em vários endereços sem perder identidade do lote. |
| Saldo e movimento | Material + almoxarifado + endereço + lote quando aplicável; quantidade/valor; evento de origem. | Chaves e transações impedem saldo duplicado. |
| AF, entrada e documento fiscal | Referência da AF e de suas linhas; fornecedor, quantidades, valores e nota associada. | AF não é nota fiscal: não copiar o número de uma como se fosse o da outra. |
| Requisição/entrega | Setor, requisitante, centro de consumo, linhas solicitadas e linhas entregues. | Entrega gera saídas vinculadas sem repetir digitação. |
| Inventário | Escopo, abertura, encerramento, responsáveis e conferências. | Bloqueio verificado por todos os serviços que mudam a posição. |
| Bem patrimonial | Tombamento único, material/origem, grupo, classe, datas, valores, local e responsável. | Campos próprios de imóvel quando aplicáveis. |
| Evento patrimonial | Tipo, data efetiva, valor anterior, variação, valor posterior, parâmetros, versão e documento. | Avaliação, reavaliação, depreciação, estorno, transferência e baixa distintos. |
| Comissão e anexos | Finalidade, vigência, nomeação, membros; arquivos protegidos e vinculados. | Reutilizar Pessoas e GED. |
| Contabilização/exportação | Origem patrimonial, referência financeira e versão do leiaute quando aplicável. | Financeiro continua sendo a autoridade contábil; exportação oficial depende de especificação. |

Não tratar “material de consumo/permanente”, “grupo de bens”, “classe patrimonial” e “tipo de aquisição” como um único campo. Eles têm funções distintas no TR e nas demonstrações.

### 3.2 Contrato M — movimentações de estoque

Uma operação deve validar autorização, escopo, disponibilidade e inventário; obter proteção contra concorrência; registrar o evento; atualizar a posição; e confirmar tudo junto. Uma estratégia aceitável é bloqueio de registros/escopos e restrições de unicidade no PostgreSQL, conforme a arquitetura existente. **Não basta consultar saldo, depois fazer um update sem proteção.**

A transferência verifica origem e destino na mesma transação e trava os recursos em ordem estável. A abertura do inventário precisa participar do mesmo mecanismo de exclusão mútua, evitando uma movimentação aprovada entre a leitura do estado e a gravação.

Usar decimais para quantidades e valores, respeitando a precisão existente; não calcular dinheiro com arredondamentos sucessivos de ponto flutuante. Demonstrar valores em reais com duas casas, mantendo precisão interna suficiente. Conservar o método de valoração já parametrizado; o TR deste recorte não determina custo médio, PEPS ou outra política. Os exemplos usam custo unitário constante para não presumir uma política contábil.

Cada confirmação possui chave idempotente e vínculo de origem, protegidos no servidor/banco. Duplo clique, retry e duas abas não podem criar duas entradas, duas entregas ou duas incorporações. Movimentos confirmados não são alterados para reescrever o passado; correções usam o mecanismo auditável existente, com efeito conciliável nos relatórios.

Saldo por recorte = abertura + entradas externas + créditos de transferência − saídas − débitos de transferência, considerando ajustes/estornos de acordo com a apresentação adotada. Incorporação que consome material disponível precisa ter natureza/vínculo próprios, sem ser somada duas vezes como saída.

### 3.3 Contrato I — AF → entrada → incorporação patrimonial

**ALM-009:** a emissão da AF deve causar criação automática de entrada vinculada e suas linhas. Uma lista de AF sem geração de registro não é integração de entrada. A proposta é manter a disponibilidade física pendente até o recebimento, conforme Q-01; quando a nota chegar, associá-la ao registro já gerado.

**PAT-006/022:** disponibilizar para tombamento a quantidade efetivamente elegível da origem. Fórmula conceitual: quantidade recebida elegível − quantidade já incorporada − quantidade destinada/devolvida de outra forma − reservas concorrentes válidas. O cálculo deve respeitar os eventos reais existentes, não subtrair duas vezes uma mesma destinação.

Para F-INTEGRACAO, a decisão proposta é: incorporar duas unidades também retira essas duas unidades do estoque de materiais livres e passa seu controle ao acervo patrimonial, com vínculo recíproco. Se o CeleriFlow já usa “tombar antes de destinar”, manter esse modelo somente garantindo que o bem tombado não volte a ficar elegível e que a entrega posterior não crie uma segunda incorporação ou uma segunda baixa de estoque.

A integração não gera nova despesa de aquisição só porque o mesmo recebimento apareceu em Patrimônio. Reutilizar a origem financeira; eventual transferência de classificação/controle deve seguir a parametrização do Financeiro. Em banco único, preferir transação coordenada; em serviços separados, usar entrega idempotente e estado de processamento visível, sem sucesso fictício na tela.

### 3.4 Contrato C — avaliações, depreciação, contabilização e estornos

Cadastrar fórmulas como expressões restritas ou modelos parametrizados, com uma lista fechada de variáveis e operadores. Bloquear acesso a rede, arquivos, código arbitrário e variáveis desconhecidas. Rejeitar divisão por zero, vida útil inválida e valor residual incompatível. Guardar a versão da fórmula e os parâmetros efetivamente utilizados em cada lançamento.

**Exemplos exclusivamente demonstrativos:**

```text
Diferença da avaliação   = valor_proposto - valor_liquido_anterior
Diferença da reavaliação = valor_proposto - valor_liquido_anterior
Parcela mensal linear   = (base_depreciavel - valor_residual) / vida_util_meses
Parcela aplicável       = min(parcela_mensal, max(0, valor_liquido_anterior - valor_residual))
```

O exemplo linear considera mês completo e base inicial sem eventos anteriores; pró-rata, novas bases após reavaliação, vigências, métodos e políticas reais precisam ser parametrizados conforme a entidade. **Não aplicar retrospectivamente uma fórmula nova sobre períodos fechados nem apresentar os valores exemplificados como taxas legais.**

Preservar valor de aquisição, parâmetros de base, depreciação acumulada e valor líquido; não sobrescrever o custo original para representar reavaliação. Para conciliação, o valor líquido deve refletir a abertura mais as variações efetivadas e os efeitos inversos de estornos. Cada execução deve guardar valores antes/depois, competência e origem.

A parametrização dos lançamentos contábeis referencia as contas/eventos do módulo Financeiro. Para teste isolado, podem ser usadas contas de demonstração claramente rotuladas, sem inventar códigos oficiais. Validar equilíbrio e ausência de duplicidade dos lançamentos apresentados. Se a integração estiver pendente, deixar a pendência explícita e implementar a integração necessária; não produzir um “lançamento contábil efetuado” sem registro real.

O estorno é um novo evento, vinculado ao original, que reverte seus efeitos e parâmetros afetados. Não apagar original, não estornar duas vezes e não recalcular silenciosamente a cadeia posterior. Quando existirem eventos dependentes posteriores, usar a política de fechamento/reprocessamento existente ou recusar indicando a sequência que precisa ser revertida. Os cenários F-VALORES usam bens diferentes para testar cada tipo sem dependências artificiais.

### 3.5 Contrato R — relatórios, etiquetas e arquivos

Todos os relatórios devem consultar o mesmo banco e o mesmo recorte da tela. Informar título, órgão/unidade, filtros, período, momento de emissão e usuário conforme padrão existente. Datas inicial/final precisam de semântica explícita: cadastro, aquisição, movimento ou baixa. Usar tratamento consistente de fuso/data efetiva, inclusive limites de início e fim do período.

Conferir visualização, impressão e exportação na camada comum: PDF, XLSX, TXT e CSV, conforme as referências gerais da seção 2. Etiquetas conservam layout de impressão adequado. Gerador genérico já existente deve permitir configuração pertinente de filtros/colunas, sem perder os campos obrigatórios de cada relatório. Manter suporte ao brasão configurado e aos recursos gerais de assinatura digital/ajuda sem fingir implementações.

Comparar totais da tela com os arquivos exportados. Não somar quantidades de unidades incompatíveis; valores podem ser totalizados por classe com critério claro. Conservar snapshots/referências históricas suficientes para uma edição de nome, classe ou responsável não apagar o contexto da operação anterior.

**Arquivos do Tribunal não são exportações genéricas.** PAT-027 exige especificação própria e não fica resolvido porque o sistema exporta CSV/XLSX.

### 3.6 Permissões e evidências

Mapear aos perfis existentes: operador de Almoxarifado, requisitante de setor, operador de Patrimônio, gestor autorizado a parametrizar/confirmar, Financeiro e auditor de consulta. São papéis de teste, não nomes obrigatórios de novos perfis. Verificar escopo organizacional no servidor, acesso aos anexos e à consulta do QR Code.

Cada evidência deve conter ID do requisito, estado inicial, dados utilizados, ação realizada, resultado observado, arquivo/documento quando houver, e referência do teste. Uma captura pode apoiar vários IDs repetidos, mas os IDs continuam distintos. Evidência de interface não dispensa conferir persistência e efeitos da operação.

<a id="base"></a>
## 4. Base fictícia coerente para executar os testes

### 4.1 Cadastros sugeridos

Usar uma unidade/ambiente marcado **“POC — dados fictícios”**. Os nomes abaixo não representam a estrutura real de Divino de São Lourenço. A data `D0` dos lotes deve ser a data-base controlada do ensaio; recalculá-la ao repetir o teste para não tornar um lote inesperadamente vencido.

| Código de teste | Cadastro fictício | Dados para a demonstração |
|---|---|---|
| CENTRAL | Almoxarifado Central | Endereços A-01 e A-02; vinculado à Administração. |
| EDUC | Almoxarifado da Educação | Endereço E-01; vinculado à Educação. |
| SAUDE | Almoxarifado da Saúde | Endereço S-01; usado nos cenários de lotes. |
| F-PJ-01 | Distribuidora Horizonte — DEMO | Pessoa jurídica; documento de teste adequado ao validador. |
| F-PF-01 | Paulo Mendes — DEMO | Pessoa física; documento de teste adequado ao validador. |
| REQ-P01 | Marina Costa — DEMO | Requisitante da Escola Municipal Horizonte. |
| RESP-P01 | Rafael Lima — DEMO | Responsável de teste pela Sala de TI. |
| CC-ESCOLA-DEMO | Consumo da escola | Centro de custo/consumo, distinto do almoxarifado. |
| MAT-PAPEL | Papel A4 | Resma; consumo; classe Material de expediente; R$ 25,00 por resma. |
| MAT-CANETA | Caneta azul | Unidade; consumo; mesma classe; R$ 2,00 por unidade. |
| MAT-INSUMO | Insumo de saúde demonstrativo | Unidade; controle por lote e validade; sem envolver dados de pacientes. |
| MAT-NOTE | Notebook administrativo | Unidade; permanente; grupo Móveis; classe Equipamentos de TI; R$ 4.800,00. |
| MAT-CADEIRA | Cadeira administrativa | Unidade; permanente; grupo Móveis; classe Mobiliário; R$ 1.000,00 no cenário de duplicação. |

Não colocar CPF/CNPJ de pessoa real sem necessidade. Os códigos acima não são números fiscais. Usar fixtures sintéticas controladas para testes de formato e validação, sem contornar validadores de produção e sem consultar serviços externos com dados fictícios. Os anexos devem trazer marcação de demonstração; não gerar chaves ou protocolos apresentados como autorização fiscal verdadeira.

### 4.2 F-ALM — movimentação, requisição e relatórios

**Recorte principal:** MAT-PAPEL, de 01/09/2026 a 30/09/2026, custo constante de R$ 25,00. O estoque de Educação começa zerado.

Para que a devolução tenha uma origem realmente registrada, a base pode ser preparada com abertura de **105 resmas em 20/08/2026**, seguida de saída de **5 em 25/08/2026**, entregues ao setor demonstrativo. Assim, o saldo anterior a setembro é **100**. **Não lançar outra abertura de 100 em setembro sobre esses movimentos: isso duplicaria o saldo.** A devolução de setembro referencia a saída de agosto.

| Sequência no período | Operação registrada | Entrada Central | Saída Central | Saldo Central | Saldo Educação |
|---|---|---:|---:|---:|---:|
| Abertura calculada | Posição imediatamente anterior ao período | — | — | 100 | 0 |
| 1 | AF-DEMO-0051 → entrada/NF-DEMO-0051 → recebimento | 60 | — | 160 | 0 |
| 2 | Doação DOA-DEMO-001 | 10 | — | 170 | 0 |
| 3 | Devolução DEV-DEMO-001 da saída de agosto | 5 | — | 175 | 0 |
| 4 | Outros OUT-DEMO-001, motivo explícito | 3 | — | 178 | 0 |
| 5 | Transferência TRF-DEMO-001 para Educação | — | 20 | 158 | 20 |
| 6 | Entrega integral de REQ-DEMO-0030 | — | 30 | 128 | 20 |

A mesma requisição contém **5 canetas**; preparar antes 20 canetas no Central, ficando 15 após a entrega. O balancete da classe Material de expediente deve discriminar unidades; as quantidades de resmas e canetas não são uma grandeza única.

**Resultados esperados, calculados para os dados acima:**

| Recorte | Quantidade final | Valor final |
|---|---:|---:|
| Papel — Central | 128 resmas | R$ 3.200,00 |
| Papel — Educação | 20 resmas | R$ 500,00 |
| Papel — consolidado | 148 resmas | R$ 3.700,00 |
| Canetas — Central | 15 unidades | R$ 30,00 |
| Classe Material de expediente — Central | Quantidades separadas por unidade | R$ 3.230,00 |
| Classe Material de expediente — consolidado | Quantidades separadas por unidade | R$ 3.730,00 |

O boletim de entradas externas do papel no período soma **78 resmas/R$ 1.950,00**. A transferência é **20 resmas/R$ 500,00** em cada ponta. A saída da entrega contém **30 resmas/R$ 750,00** e **5 canetas/R$ 10,00**. Esses números são resultados de teste, não valores do edital.

### 4.3 Cenários independentes de Almoxarifado

| Cenário | Estado inicial | Operação e resultado esperado |
|---|---|---|
| F-LOTES | LOTE-A: 40 unidades, D0+30 dias; LOTE-B: 60, D0+180 dias. | Saída de 10 do LOTE-A → 30 e 60. Um lote adicional vencido pode testar apenas sua identificação visual. |
| F-ENDERECOS | Central/A-01: 60 resmas; Central/A-02: 40. | Transferir 10 entre posições → 50 e 50; total 100. |
| F-INVENTARIO | Estoque preparado em ambiente isolado e inventário ainda fechado. | Abrir, recusar movimentos, fechar e aceitar operação válida. Não contaminar os totais de F-ALM. |
| F-ABERTURA | Base vazia para o recorte escolhido. | Lançar abertura de 100 resmas a R$ 25,00 → R$ 2.500,00; retry não duplica. |

### 4.4 F-INTEGRACAO — do recebimento aos bens

Emitir AF-DEMO-0052 com cinco notebooks de MAT-NOTE a R$ 4.800,00: total R$ 24.000,00. A entrada derivada deve ter fornecedor F-PJ-01, documento fiscal demonstrativo e número NF-DEMO-0052. Confirmar o recebimento, oferecer cinco unidades no grid patrimonial e incorporar duas.

Esperado: **dois bens distintos, R$ 9.600,00 de origem**, e **três unidades ainda elegíveis, R$ 14.400,00**, sem dupla contagem das duas unidades incorporadas como estoque livre. Os tombamentos reais são gerados pelo sistema; os identificadores dos cenários são apenas apelidos de teste. Não reutilizar esta origem de cinco unidades para gerar outras três cópias de uma cadeira.

### 4.5 F-VALORES — um bem independente para cada tipo de evento

| Bem fictício | Estado inicial | Movimento | Após movimento | Após estorno |
|---|---:|---|---:|---:|
| BEN-A001 — Mesa, teste de avaliação | R$ 800,00 | Avaliação para R$ 900,00; diferença +R$ 100,00. | R$ 900,00 | R$ 800,00 |
| BEN-R001 — Armário, teste de reavaliação | R$ 1.000,00 | Reavaliação para R$ 1.200,00; diferença +R$ 200,00. | R$ 1.200,00 | R$ 1.000,00 |
| BEN-D001 — Notebook, teste de depreciação | R$ 4.800,00 | Residual R$ 480,00; 60 meses; uma competência de mês completo: R$ 72,00. | R$ 4.728,00 | R$ 4.800,00 |

Esses três bens pertencem ao acervo fictício próprio deste cenário, com origem documentada de demonstração. BEN-D001 não é automaticamente um dos notebooks de F-INTEGRACAO: evitar compartilhar o mesmo registro entre cenários que se pretendem independentes.

### 4.6 Outros cenários de Patrimônio

**F-BAIXAS:** usar BEN-B001, impressora com valor de aquisição de R$ 1.200,00 e valor líquido atual de R$ 300,00, cuja composição histórica deve estar documentada. Usar bens independentes para testes de outros motivos; não baixar repetidamente a mesma impressora para simular sete casos.

**F-IMOVEL:** BEN-I001, prédio demonstrativo, área 200 m², valor R$ 400.000,00, setor e responsável, endereço e demais campos de PAT-023. A simples presença do imóvel não autoriza aplicar a ele as taxas de depreciação do notebook.

**F-DUPLICACAO:** uma cadeira modelo já cadastrada e uma origem independente de recebimento de três novas cadeiras. Duplicar o modelo em três fichas com tombamentos novos, sem copiar sua origem já consumida.

**F-PERIODO:** manter BEN-H001 cadastrado em julho e novos bens cadastrados em setembro. A relação sintética por cadastro deve distingui-los mesmo que uma data de aquisição seja diferente.

**F-COMISSAO:** COM-DEMO-2026, finalidade e vigência já indicadas, documento de nomeação fictício abrível e três pessoas de teste; vincular ao inventário quando o fluxo existente usar comissão.

### 4.7 Preparação e repetição

A população pode ser feita pela interface. Se o agente fornecer seed/fixtures, usar os serviços de domínio e identificadores de teste estáveis; não inserir saldos e históricos incompatíveis diretamente em tabelas para “bater” com a demonstração. Proteger o comando contra execução em produção e impedir repetição cumulativa.

Antes de cada cenário, registrar a posição inicial. Para repetir cenários destrutivos como baixa/estorno/inventário, usar base isolada restaurável ou novo conjunto fictício; não apagar o histórico de operações confirmadas na aplicação para voltar ao estado inicial. Não depender da ordem em que a comissão eventualmente pedir os itens.

---
<a id="almoxarifado"></a>
## 5. Almoxarifado — 27 requisitos

### ALM-001 — Movimentações, validade e atualização do saldo

**TR — ALMOXARIFADO, item 1, p. 44:**

> Controle de toda a movimentação de entradas, saídas, transferências e prazos de validade de materiais no estoque, devendo realizar a atualização do saldo estoque de acordo com cada movimentação realizada;

**Implementação:** Reutilizar o serviço de movimentações e o saldo existentes. Cada entrada, saída e transferência deve gravar natureza, material, quantidade, unidade, almoxarifado, endereço, lote quando aplicável, data efetiva, documento de origem e usuário. Atualizar movimento e saldo na mesma transação. Consultas de disponibilidade devem derivar da mesma fonte usada nos relatórios. Manter a validade ligada ao lote, sem substituir a data de todos os lotes ao editar um deles.

**Demonstração:** Executar a sequência F-ALM da seção 4: partir do saldo inicial do período de 100 resmas, receber 60 pela AF, entrar 10 por doação, 5 por devolução e 3 por outro motivo; transferir 20 para Educação e entregar 30. Abrir também um insumo com dois lotes e validades distintas. Recarregar a página e consultar o histórico.

**Aceite:** Central termina com 128 resmas; Educação, com 20; consolidado, com 148. Saldos persistem após recarga e são iguais aos relatórios. As validades dos dois lotes permanecem individualizadas. Falha no processamento não deixa movimento sem saldo, nem saldo sem movimento.

### ALM-002 — Manutenção do catálogo de materiais

**TR — ALMOXARIFADO, item 2, p. 44:**

> Permitir a manutenção do catálogo de materiais quanto às informações de: nome, especificação e unidade de medida;

**Implementação:** Disponibilizar cadastro, consulta e edição de nome, especificação e unidade de medida no catálogo compartilhado. Usar identificador estável; não criar outro material ao editar sua descrição. Se já houver movimentação, preservar a unidade e a descrição históricas; não converter quantidades antigas silenciosamente ao alterar o cadastro.

**Demonstração:** Criar um material de teste ainda sem movimentos, alterar o nome, complementar a especificação e trocar a unidade de medida. Salvar, sair da tela e reabrir. Em material com histórico, alterar a descrição e conferir que o documento antigo continua rastreável.

**Aceite:** Os três campos são editáveis, persistidos e reutilizados em novos lançamentos. Alterações não apagam o histórico nem modificam quantidades já movimentadas. Caso o sistema bloqueie mudança de unidade com histórico, explicar o motivo e manter a edição possível em cadastro sem movimento.

### ALM-003 — Fornecedores pessoa física e pessoa jurídica

**TR — ALMOXARIFADO, item 3, p. 44:**

> O sistema deverá conter cadastro de fornecedores de pessoas físicas e jurídicas,

**Implementação:** Reaproveitar Pessoas/Fornecedores do CeleriFlow, com tipo PF/PJ e documento correspondente, sem cadastros independentes em Compras, Almoxarifado e Patrimônio. Manter identificação suficiente para selecionar o fornecedor nas entradas e nos documentos.

**Demonstração:** Cadastrar os fornecedores fictícios F-PJ-01 e F-PF-01. Reabrir cada ficha e selecionar o PJ em uma entrada por compra e o PF em outra operação compatível. Consultar o mesmo fornecedor a partir de Compras.

**Aceite:** PF e PJ podem ser cadastrados e associados a operações. Um mesmo fornecedor conserva seu identificador entre módulos; não há registros duplicados criados pela integração.

### ALM-004 — Campos condicionais de CPF e CNPJ

**TR — ALMOXARIFADO, item 4, p. 44:**

> Os campos de cadastramento de dados do fornecedor devem ser habilitados de acordo com o tipo de pessoa (física ou jurídica) a ser cadastrada. Exemplo: O sistema não poderá permitir a digitação do campo CNPJ para pessoa física e vice-versa;

**Implementação:** Na escolha de PF, habilitar CPF e não permitir CNPJ; em PJ, habilitar CNPJ e não permitir CPF. Ao trocar o tipo em um formulário novo, limpar o documento incompatível. Repetir essa regra na validação do servidor, não apenas na interface. Preservar as validações de documento já existentes.

**Demonstração:** Alternar PF e PJ em uma nova ficha e observar os campos. Tentar enviar uma requisição de gravação PF com CNPJ, e outra PJ com CPF, no teste automatizado. Depois salvar corretamente as duas fichas.

**Aceite:** A interface impede a digitação incompatível e o servidor recusa o payload incompatível. Gravações válidas continuam funcionando. Não desabilitar a validação de produção para facilitar o uso de dados fictícios.

### ALM-005 — Lotes e prazos de validade

**TR — ALMOXARIFADO, item 5, p. 44:**

> Deverá possibilitar o cadastro de lotes de mercadorias, para controle da validade de itens perecíveis, medicamentos, entre outros;

**Implementação:** Permitir cadastrar lote, material e validade e associá-los à entrada e ao saldo por local. Nas saídas e transferências, informar ou selecionar o lote efetivamente movimentado. Exibir saldo e situação de validade por lote. Alertas visuais são uma escolha de implementação; o TR não fixa política de descarte, bloqueio de vencidos ou método obrigatório de consumo dos lotes.

**Demonstração:** Em F-LOTES, registrar o mesmo insumo em LOTE-A com 40 unidades e validade D0+30 dias, e LOTE-B com 60 unidades e validade D0+180 dias. Movimentar 10 unidades de LOTE-A. Consultar separadamente os dois lotes.

**Aceite:** Restam 30 no LOTE-A e 60 no LOTE-B. A operação não mistura validades. A consulta mostra código do lote, validade e saldo correspondente.

### ALM-006 — Endereços físicos de estocagem

**TR — ALMOXARIFADO, item 6, p. 44:**

> Deverá possibilitar o cadastro de endereços físicos de estocagem, para controle do saldo de itens em endereços distintos, conforme definido pelo gestor;

**Implementação:** Cadastrar endereços vinculados ao almoxarifado, usando campos já existentes ou uma identificação composta de corredor, estante e posição. O saldo deve distinguir o mesmo material em endereços diferentes. Não confundir endereço de estocagem com endereço postal do órgão.

**Demonstração:** Em F-ENDERECOS, distribuir 100 resmas entre CENTRAL/A-01, com 60, e CENTRAL/A-02, com 40. Consultar cada posição e o total do Central. Movimentar 10 resmas de A-01 para A-02.

**Aceite:** As posições passam a 50 e 50; o total do almoxarifado permanece 100. É possível localizar o material pela posição e identificar a origem e o destino da movimentação.

### ALM-007 — Descrições sucinta e detalhada sem truncamento

**TR — ALMOXARIFADO, item 7, p. 44:**

> Possuir no cadastro de materiais campos para descrições sucintas e detalhadas sem limitação de caracteres, através de especificação integral;

**Implementação:** Manter campos de texto para descrição sucinta e detalhada/especificação integral. Remover limites funcionais arbitrários de caracteres nesses campos, inclusive no formulário, validação, API e persistência. Pode haver expansão visual do texto, mas não perda do conteúdo. Usar armazenamento adequado a texto longo; não prometer capacidade física infinita.

**Demonstração:** Salvar um material de teste com descrição sucinta superior a 255 caracteres e detalhada com cerca de 20 mil caracteres, contendo uma frase de conferência no final. Reabrir o cadastro e consultar a especificação integral.

**Aceite:** O conteúdo completo, inclusive a frase final, é recuperado sem corte. Os tamanhos utilizados são testes propostos, não limites ou quantitativos definidos pelo TR.

### ALM-008 — Busca por palavras inteiras e fragmentos

**TR — ALMOXARIFADO, item 8, p. 44:**

> O software deverá proporcionar mecanismos de busca de materiais, através do fornecimento de palavras inteiras ou parte de palavras contidas no nome ou na descrição dos produtos;

**Implementação:** Pesquisar no nome e na descrição/especificação, por palavra inteira ou fragmento interno, com consulta parametrizada no servidor. Reaproveitar a busca existente e deixar claro quais campos são abrangidos. Filtros adicionais não substituem essa busca textual.

**Demonstração:** No material Papel A4, cujo detalhamento contém “papel sulfite, gramatura 75 g/m²”, buscar “Papel”, depois “sulf” e depois “gramat”. Repetir a busca após recarregar o catálogo.

**Aceite:** O material é encontrado nos três casos, inclusive quando o termo só existe na descrição e quando é apenas parte da palavra. Uma busca sem correspondência retorna lista vazia, não resultados fixos.

### ALM-009 — Entrada automática vinculada à autorização de fornecimento

**TR — ALMOXARIFADO, item 9, p. 44:**

> Possibilitar o lançamento de entradas automáticas da nota fiscal a partir da emissão de autorizações de fornecimento (AF), de forma integrada com o software de gestão de Compras, Licitações e Contratos;

**Implementação:** Integrar o evento de emissão da AF de Compras ao Almoxarifado: criar automaticamente a entrada vinculada e suas linhas, herdando fornecedor, materiais, quantidades e valores. Associar o documento fiscal a esse mesmo registro, sem redigitar as linhas e sem criar uma segunda entrada. Implementar idempotência por documento/linha/evento. O momento em que o saldo passa a disponível deve seguir a decisão Q-01: a proposta deste plano mantém a entrada gerada pela AF pendente de recebimento físico até sua confirmação; essa separação não é uma redação adicional do TR.

**Demonstração:** Emitir AF-DEMO-0051 com 60 resmas em Compras. Mostrar imediatamente a entrada criada no Almoxarifado e a origem AF. Vincular NF-DEMO-0051 e confirmar o recebimento. O saldo de 100 passa a 160. Reprocessar o mesmo evento ou tentar confirmar novamente.

**Aceite:** Há criação automática e ligação navegável Compras → AF → entrada → documento fiscal. Não há digitação manual repetida dos itens nem dupla entrada. Documentar Q-01 na evidência: não afirmar que apenas uma pré-entrada satisfaz uma eventual cobrança de atualização imediata do saldo na emissão da AF.

### ALM-010 — Naturezas de entrada: compra, doação, devolução e outros

**TR — ALMOXARIFADO, item 10, p. 44:**

> Permitir realizar as Entrada de material por (compra, doação, devolução de saída ou por outros motivos);

**Implementação:** Oferecer as quatro possibilidades explicitamente, com motivo/descrição para “outros”. A devolução deve referenciar a saída correspondente quando disponível e recuperar material, unidade e lote; impedir devolver mais que o entregue. Documentos e campos auxiliares devem respeitar a natureza, sem obrigar número de compra em uma doação.

**Demonstração:** Em F-ALM, receber 60 resmas por compra/AF; registrar doação de 10; devolução de 5 vinculada ao histórico anterior descrito na base; e entrada de 3 por “outros — incorporação de material localizado, demonstração”. Consultar o boletim por natureza.

**Aceite:** As quatro naturezas são gravadas e distinguíveis. As entradas do período somam 78 resmas. A devolução não é contabilizada duas vezes nem usa saída inexistente disfarçada de operação real.

### ALM-011 — Controle de múltiplos almoxarifados

**TR — ALMOXARIFADO, item 11, p. 45:**

> Permitir o controle de vários Almoxarifados;

**Implementação:** Manter cadastro de almoxarifados com identificação e vínculo organizacional. Todas as operações e consultas precisam de escopo explícito; o saldo do Central não pode ser usado inadvertidamente para atender solicitação em outro depósito. Disponibilizar consulta individual e consolidada.

**Demonstração:** Cadastrar ou reutilizar Central, Educação e Saúde. Selecionar cada um e consultar materiais e saldos. Comparar o Central com Educação ao final de F-ALM.

**Aceite:** O mesmo material tem saldos independentes por almoxarifado: 128 no Central e 20 na Educação, no recorte de F-ALM. A visão consolidada soma sem duplicar transferências.

### ALM-012 — Transferência entre almoxarifados

**TR — ALMOXARIFADO, item 12, p. 45:**

> Permitir realizar transferências entre almoxarifados.

**Implementação:** Criar uma operação de transferência com origem, destino, material, lote/endereço quando aplicável, quantidade, data e referência. Gerar débito na origem e crédito no destino como partes da mesma operação atômica. Preservar a quantidade e o valor transferido; verificar saldo e bloqueio de inventário nas duas pontas.

**Demonstração:** Em F-ALM, quando o Central estiver com 178 resmas, transferir 20 para Educação. Mostrar Central com 158 e Educação com 20. Tentar transferir quantidade superior ao saldo e simular uma falha antes da conclusão.

**Aceite:** Uma transferência gera um par de movimentos vinculados e não altera o total consolidado de 178 naquele momento. Falha ou saldo insuficiente não produz apenas um dos lados.

### ALM-013 — Centros de custo ou consumo

**TR — ALMOXARIFADO, item 13, p. 45:**

> Permitir cadastro de centros de custo (de consumo);

**Implementação:** Disponibilizar cadastro de centros de custo/consumo com código, descrição e vínculo à estrutura já adotada. Permitir associar o centro à requisição e à entrega, reutilizando o cadastro institucional. Não presumir que centro de custo e secretaria sejam a mesma entidade.

**Demonstração:** Cadastrar “CC-ESCOLA-DEMO — Escola Municipal Horizonte” e associá-lo à requisição das 30 resmas. Reabrir a entrega e conferir a identificação do centro de consumo.

**Aceite:** O cadastro persiste e é selecionável nas operações pertinentes, sem duplicar centro já existente. A origem do consumo pode ser recuperada pelo documento e pelo histórico.

### ALM-014 — Cadastro de requisitantes

**TR — ALMOXARIFADO, item 14, p. 45:**

> Permitir cadastros de requisitantes de materiais.

**Implementação:** Manter pessoa requisitante, vínculo ao setor e, quando houver acesso ao sistema, vínculo ao usuário existente. Separar o cadastro da pessoa de suas permissões. Reutilizar os registros de Pessoas/Servidores em vez de criar uma identidade paralela.

**Demonstração:** Cadastrar a requisitante fictícia Marina Costa, vinculá-la à escola demonstrativa e selecioná-la em uma requisição. Entrar com o usuário correspondente para consultar a solicitação.

**Aceite:** A requisição identifica pessoa e setor corretos. O requisitante não ganha permissão de movimentar ou ajustar estoque apenas por ter sido cadastrado.

### ALM-015 — Classificações do estoque

**TR — ALMOXARIFADO, item 15, p. 45:**

> Possibilitar o cadastro de classificações do estoque, podendo ser subdividido em materiais de consumo, materiais permanentes, dentre outros que forem necessários;

**Implementação:** Oferecer cadastro parametrizável com materiais de consumo, materiais permanentes e outras classificações. Manter também a associação necessária à classe patrimonial/contábil usada no balancete, sem tratar esses conceitos como sinônimos. O indicador de material permanente deve permitir localizar itens elegíveis à integração patrimonial.

**Demonstração:** Classificar Papel A4 como consumo e Notebook como permanente; criar uma terceira classificação de teste. Associar as classes “Material de expediente” e “Equipamentos de TI”, sem inventar códigos oficiais de contas.

**Aceite:** As três classificações são gravadas e consultáveis. Notebook pode ser selecionado no processo patrimonial; papel não é incorporado automaticamente como bem permanente.

### ALM-016 — Relatório de crédito de transferências

**TR — ALMOXARIFADO, item 16, p. 45:**

> Emitir relatório de Crédito de Transferências de Estoque;

**Implementação:** Criar/reutilizar relatório filtrável por período e almoxarifado de destino. Mostrar operação, data, origem, destino, material, quantidade e valor transferido, quando valorado. Reutilizar o contrato de relatórios R da seção 3.

**Demonstração:** Após a transferência de F-ALM, filtrar Educação e o período da demonstração. Abrir o relatório de Crédito de Transferências de Estoque e gerar a impressão/PDF.

**Aceite:** O relatório apresenta crédito de 20 resmas, R$ 500,00, oriundo do Central, com a referência da mesma transferência. Não inclui compras, doações ou saldo de abertura como créditos de transferência.

### ALM-017 — Relatório de débito de transferências

**TR — ALMOXARIFADO, item 17, p. 45:**

> Emitir relatório de Débito de Transferências de Estoque;

**Implementação:** Reutilizar a mesma fonte do relatório de créditos, filtrando o lado de saída da transferência. Manter o nome “Débito de Transferências de Estoque” visível, ainda que a implementação interna seja compartilhada.

**Demonstração:** Filtrar o Central e emitir o relatório de Débito de Transferências de Estoque para a transferência de F-ALM. Abrir, em seguida, o relatório de crédito da Educação.

**Aceite:** O débito é de 20 resmas e R$ 500,00 e corresponde integralmente ao crédito. Origem, destino, data e identificador conciliam entre os dois relatórios.

### ALM-018 — Cadastro de lotes: requisito repetido no TR

**TR — ALMOXARIFADO, item 18, p. 45:**

> Deverá possibilitar o cadastro de lotes de mercadorias, para controle da validade de itens perecíveis, medicamentos, entre outros;

**Implementação:** Usar a implementação de ALM-005, mantendo este número separado na rastreabilidade. Não criar outra tabela, tela ou saldo apenas porque o TR repete a funcionalidade.

**Demonstração:** Reabrir LOTE-B de F-LOTES e conferir as 60 unidades e a validade D0+180 dias. Mostrar que a saída efetuada em LOTE-A não alterou LOTE-B.

**Aceite:** O cadastro de lotes continua disponível com validade e saldo individual. Registrar evidência também em ALM-018, mesmo que seja a mesma funcionalidade de ALM-005.

### ALM-019 — Mínimo, médio, máximo e ponto de ressuprimento

**TR — ALMOXARIFADO, item 19, p. 45:**

> Possuir configuração de quantitativo e/ou valor, mínimo, médio e máximo de itens, para controle do ponto de ressuprimento de saldo físico no estoque;

**Implementação:** Permitir parâmetros de quantidade e/ou valor por material e almoxarifado: mínimo, médio e máximo. Explicitar a unidade e o critério utilizado. Como regra operacional proposta, destacar necessidade de ressuprimento quando o saldo estiver no mínimo ou abaixo dele; não criar compra ou requisição automaticamente, pois isso não consta deste item.

**Demonstração:** No recorte de papel do Central, configurar quantidades 150/200/300 e valores R$ 3.750,00/R$ 5.000,00/R$ 7.500,00. Comparar a posição de 178 resmas com a posição final de 128.

**Aceite:** Parâmetros são persistidos e editáveis. O estado final de 128 resmas/R$ 3.200,00 é identificado abaixo do mínimo. Quantidade média cadastrada não é confundida com custo médio contábil nem com média calculada de consumo.

### ALM-020 — Requisições por setores fora do órgão

**TR — ALMOXARIFADO, item 20, p. 45:**

> O software deverá possibilitar que sejam realizadas requisições de materiais, possibilitando que os setores fora do órgão possam realizar suas solicitações diretamente pelo sistema

**Implementação:** Disponibilizar requisição pelo acesso web já existente, com setor, requisitante, centro de consumo, almoxarifado e linhas de materiais/quantidades. Reaproveitar o fluxo de aprovação do CeleriFlow, preservando segregação de funções. Um setor fisicamente externo deve usar autenticação e permissões próprias; este item não pede um portal anônimo.

**Demonstração:** Com o usuário da Escola Municipal Horizonte, enviar REQ-DEMO-0030 solicitando 30 resmas e 5 canetas ao Central. Em outra sessão autorizada, localizar a requisição e atendê-la. Voltar ao usuário solicitante e consultar o resultado.

**Aceite:** O pedido feito pelo setor externo chega ao almoxarifado sem transcrição manual. A entrega fica vinculada ao pedido. O requisitante não altera diretamente saldo nem aprova sua própria solicitação, quando houver aprovação no fluxo adotado.

### ALM-021 — Balancete do estoque por classe patrimonial

**TR — ALMOXARIFADO, item 21, p. 45:**

> Possibilitar emissão de relatório de balancete do estoque por classe patrimonial, demonstrando os movimentos de saldo inicial, entradas, créditos de transferência, saídas, débitos de transferência e saldo atual;

**Implementação:** Gerar agrupamento por classe patrimonial com as colunas expressas no TR: saldo inicial, entradas, créditos de transferência, saídas, débitos de transferência e saldo atual. Calcular a abertura pela posição imediatamente anterior ao período, não pelo saldo atual. Discriminar quantidade por material/unidade e valores por classe; não somar resmas e canetas como uma única quantidade.

**Demonstração:** Executar F-ALM e filtrar MAT-PAPEL no período. No Central, conferir 100 + 78 + 0 − 30 − 20 = 128; na Educação, 0 + 0 + 20 − 0 − 0 = 20. Emitir também o agrupamento por classe.

**Aceite:** Tela e arquivos conciliam com o histórico. No consolidado, os créditos e débitos internos se anulam: 148 resmas/R$ 3.700,00. A abertura não é contada novamente entre as entradas do período. Estornos não geram duplicação de valores.

### ALM-022 — Bloqueio das movimentações durante inventário

**TR — ALMOXARIFADO, item 22, p. 45:**

> Possibilitar o bloqueio de movimentações no almoxarifado durante o período de inventário;

**Implementação:** Usar inventário com abertura, escopo e encerramento. Enquanto aberto, bloquear no servidor todas as ações que alteram saldo no almoxarifado abrangido, inclusive recebimento por AF, entrega, transferência, abertura de saldo e incorporação patrimonial. A contagem física e observações continuam possíveis. O bloqueio precisa ser verificado dentro da transação.

**Demonstração:** Em F-INVENTARIO, abrir inventário no Central. Tentar uma entrada, uma saída e uma transferência pela tela e pela API. Fechar o inventário e repetir uma operação válida. Fazer teste concorrente de abertura versus movimentação.

**Aceite:** Nenhuma movimentação é efetivada no escopo bloqueado. O erro informa o inventário responsável. Encerramento libera as operações, sem que uma chamada direta à API contorne o bloqueio.

### ALM-023 — Boletim de entrada

**TR — ALMOXARIFADO, item 23, p. 45:**

> Emitir relatório de boletim de entrada;

**Implementação:** Gerar relatório de entradas com período, almoxarifado, natureza, material, quantidade, valor, fornecedor quando aplicável e documento de origem. Deixar explícito quando abertura e transferências estão incluídas ou excluídas; não misturar naturezas silenciosamente.

**Demonstração:** Em F-ALM, filtrar Central e entradas externas do período: compra de 60, doação de 10, devolução de 5 e outros de 3. Visualizar e imprimir o boletim.

**Aceite:** O recorte apresenta 78 resmas/R$ 1.950,00 e os quatro documentos/naturezas. Não inclui as 100 resmas de abertura como nova entrada e não contém linhas estáticas desvinculadas dos lançamentos.

### ALM-024 — Histórico detalhado de materiais

**TR — ALMOXARIFADO, item 24, p. 45:**

> Emitir relatório de histórico de materiais, contendo as informações detalhadas das movimentações de cada item.

**Implementação:** Exibir sequência cronológica com data efetiva e de registro, natureza, referência, usuário, local, lote quando aplicável, quantidades, valores e saldo após cada evento. Oferecer visualização e relatório. Preservar eventos originais e seus estornos em vez de apagar histórico.

**Demonstração:** Filtrar o histórico de MAT-PAPEL no Central pelo período de setembro e conferir a sequência de F-ALM, começando pelo saldo inicial calculado: 100, 160, 170, 175, 178, 158 e 128. Abrir uma referência de AF e a referência da transferência a partir do histórico.

**Aceite:** Cada mudança de saldo tem origem identificável; a última posição é 128 e concilia com o estoque. Recarga e exportação mantêm a sequência, os documentos e os valores.

### ALM-025 — Saída automática na entrega integral

**TR — ALMOXARIFADO, item 25, p. 45:**

> Possibilitar efetuar a saída automática de todos os itens do estoque pela entrega do material de forma integral;

**Implementação:** Implementar a ação “Entregar integralmente” no documento de entrega/requisição, baixando de uma vez todas as suas linhas efetivamente entregues. Conferir saldo, lote e bloqueios antes de confirmar o conjunto, com idempotência. Q-02 registra que o TR usa a expressão “todos os itens do estoque”: o plano adota o conjunto abrangido pela entrega, sem esvaziar automaticamente materiais não relacionados.

**Demonstração:** Atender integralmente REQ-DEMO-0030, com 30 resmas e 5 canetas. Confirmar uma vez e verificar as duas saídas. Repetir a confirmação. Em cenário isolado, entregar toda a disponibilidade de dois materiais selecionados e verificar que apenas esses saldos chegam a zero.

**Aceite:** A confirmação produz as saídas de todas as linhas da entrega sem lançar item por item. Repetição não baixa novamente; insuficiência em uma linha impede uma “entrega integral” parcial silenciosa. Itens não incluídos permanecem intactos. A interpretação Q-02 fica documentada.

### ALM-026 — Duplicação de itens do catálogo

**TR — ALMOXARIFADO, item 26, p. 45:**

> Permitir duplicar itens do catálogo de materiais, agilizando novos cadastros;

**Implementação:** Adicionar duplicação a partir do material existente. Copiar atributos descritivos e classificações, gerar identificação nova e permitir editar antes de salvar. Não copiar saldo, lote, movimentos, documentos fiscais ou histórico operacional.

**Demonstração:** Duplicar MAT-PAPEL para criar “Papel A4 colorido — demonstração”. Ajustar o nome e a especificação. Consultar os dois cadastros e seus saldos.

**Aceite:** O novo item tem identificador próprio e cadastro preenchido; o original fica inalterado. O duplicado inicia sem estoque e sem histórico, até receber lançamentos próprios.

### ALM-027 — Implantação de saldos iniciais

**TR — ALMOXARIFADO, item 27, p. 45:**

> Deverá possibilitar a implantação de saldos iniciais de itens no estoque;

**Implementação:** Disponibilizar lançamento de abertura por material, almoxarifado, endereço, lote quando necessário, quantidade, valor e data de corte. Gerar evento identificado como abertura/implantação e trilha de auditoria. Repetição da mesma carga não deve duplicar saldo. Importação XLSX/CSV não é condição deste requisito; a entrada pela tela é suficiente para este plano.

**Demonstração:** Em base isolada, informar 100 resmas a R$ 25,00 no Central na abertura do período. Confirmar e emitir posição inicial. Reenviar a mesma operação de abertura.

**Aceite:** A posição inicial é de 100 resmas/R$ 2.500,00, conciliada com a abertura do balancete. O reenvio não duplica o saldo e não há edição direta de saldo sem documento/evento correspondente.

<a id="patrimonio"></a>
## 6. Patrimônio — 32 requisitos

### PAT-001 — Estrutura organizacional

**TR — PATRIMÔNIO, item 1, p. 45:**

> Permitir cadastrar a estrutura organizacional (locais, setores, secretarias) que compõe o órgão, conforme organograma definido pela entidade;

**Implementação:** Reutilizar o organograma institucional para secretarias, setores e locais. Permitir cadastrar a hierarquia necessária, com identificadores estáveis, evitando ciclos e duplicação de estruturas já usadas no Almoxarifado. O vínculo organizacional de um bem deve apontar para esses registros.

**Demonstração:** Cadastrar a estrutura demonstrativa Secretaria de Administração → Setor de Patrimônio → Sala de TI, e Secretaria de Educação → Escola Municipal Horizonte. Selecioná-las no cadastro e na transferência de um bem.

**Aceite:** Secretarias, setores e locais são mantidos e selecionáveis. Uma transferência recupera a origem e o destino corretos; alteração cadastral não apaga a localização histórica.

### PAT-002 — Fórmulas de cálculo de lançamentos contábeis

**TR — PATRIMÔNIO, item 2, p. 46:**

> Possibilitar o cadastro de fórmulas de cálculo de lançamentos contábeis para cada tipo de movimentação (avaliação, reavaliação e depreciação);

**Implementação:** Cadastrar fórmulas separadas para avaliação, reavaliação e depreciação, com variáveis permitidas, parâmetros e versão. Integrar ao mecanismo financeiro/contábil existente para parametrização das contas e dos lançamentos relacionados, sem criar outra contabilidade. Não usar eval ou execução arbitrária de código. Aplicar as regras C da seção 3 para cálculo, precisão, contabilização e estorno.

**Demonstração:** Cadastrar as três fórmulas demonstrativas de F-VALORES. A avaliação de R$ 800,00 para R$ 900,00 gera diferença de R$ 100,00; a reavaliação de R$ 1.000,00 para R$ 1.200,00 gera R$ 200,00; a depreciação gera R$ 72,00 no primeiro mês. Mostrar parâmetros, versão, cálculo e registros vinculados.

**Aceite:** São fórmulas cadastradas e utilizadas, não apenas textos em tela. Mudança de parâmetro muda o cálculo da prévia. Lançamentos financeiros, quando apresentados, vêm do módulo real e possuem origem rastreável; ausência de integração não pode ser encoberta por uma confirmação fictícia.

### PAT-003 — Consulta de bens por todos os critérios do TR

**TR — PATRIMÔNIO, item 3, p. 46:**

> Permitir consultar os bens por número de tombamento, nome, data, valor e tipo de aquisição (grupo de bens);

**Implementação:** Permitir consulta por número de tombamento, nome, data, valor e tipo de aquisição/grupo de bens. Como o TR escreve “tipo de aquisição (grupo de bens)”, conservar filtros distintos para tipo de aquisição e grupo, sem substituir um pelo outro. Identificar claramente se a data é de aquisição ou cadastro e se o valor é de aquisição ou atual.

**Demonstração:** Localizar o notebook pelo tombamento, depois por fragmento do nome, data de aquisição, faixa de valor de aquisição contendo R$ 4.800,00, tipo “compra” e grupo “móveis”. Repetir uma busca sem resultado e uma combinação de filtros.

**Aceite:** Cada critério funciona isoladamente e em combinação. A tabela informa o significado de data e valor; grupo de bens não fica limitado a tipo de aquisição nem vice-versa.

### PAT-004 — Duplicação de bens semelhantes

**TR — PATRIMÔNIO, item 4, p. 46:**

> Possuir rotina de duplicação de bens, a ser utilizado nos casos em que são tombados vários bens de mesma característica, agilizando o cadastramento dos bens;

**Implementação:** Criar ação de usar um bem como modelo e cadastrar uma ou várias novas unidades. Copiar somente atributos comuns; gerar tombamento único por unidade e solicitar série, responsável e origem quando pertinentes. Não copiar histórico, baixas ou lançamentos de avaliação/depreciação. Se houver origem de recebimento, limitar o lote à quantidade ainda disponível.

**Demonstração:** Selecionar uma cadeira modelo do acervo e gerar três novas cadeiras, vinculadas a um recebimento demonstrativo independente de três unidades. Confirmar os três cadastros e abrir suas fichas.

**Aceite:** Três bens distintos são criados com tombamentos diferentes e atributos comuns reaproveitados. A origem comporta as três unidades; não se multiplica artificialmente a quantidade de uma nota já integralmente incorporada.

### PAT-005 — Registro de baixas por motivos diversos

**TR — PATRIMÔNIO, item 5, p. 46:**

> Permitir o registro da baixa dos bens por venda, doação, obsolescência ou sucateamento, inutilização, inexistência física, sinistro, etc.;

**Implementação:** Oferecer venda, doação, obsolescência/sucateamento, inutilização, inexistência física, sinistro e outros motivos. Registrar bem, data, motivo, justificativa, responsável e documento quando pertinente. Usar o mesmo serviço de execução de PAT-030, sem criar uma tela de “registro” que não produza a baixa.

**Demonstração:** Em F-BAIXAS, selecionar a impressora BEN-B001, com valor atual de R$ 300,00, registrar inutilização e efetivar a baixa com o usuário autorizado. Nos testes parametrizados, validar a gravação de cada motivo em bens independentes.

**Aceite:** Todos os motivos estão disponíveis e são persistidos. A baixa aparece no histórico e no relatório de baixas e retira o bem da posição ativa, sem excluí-lo da base.

### PAT-006 — Incorporação pela integração com o Almoxarifado

**TR — PATRIMÔNIO, item 6, p. 46:**

> Possibilitar a inclusão (entrada) de um bem permanente no sistema de patrimônio através da integração com o sistema de almoxarifado.

**Implementação:** Consumir a entrada real de material permanente do Almoxarifado. Selecionar quantidade disponível e gerar um bem por unidade individualizável, vinculando material, recebimento, fornecedor, documento fiscal e valor. Reservar/consumir a elegibilidade na mesma transação da incorporação. Aplicar o contrato I da seção 3 para evitar duplicação física e patrimonial.

**Demonstração:** Receber cinco notebooks por AF-DEMO-0052/NF-DEMO-0052 no Almoxarifado. No Patrimônio, selecionar duas unidades e incorporar. Abrir as duas fichas e voltar ao grid da origem.

**Aceite:** As duas fichas herdam a origem sem redigitação. A elegibilidade cai de cinco para três. O mesmo recebimento não gera novamente os dois bens, e as unidades incorporadas não continuam disponíveis como materiais livres.

### PAT-007 — Catálogo de materiais no Patrimônio

**TR — PATRIMÔNIO, item 7, p. 46:**

> Permitir a manutenção do catálogo de materiais quanto às informações de: nome, especificação e unidade de medida;

**Implementação:** Reutilizar o catálogo de ALM-002, com manutenção de nome, especificação e unidade de medida acessível a partir do Patrimônio, segundo as permissões. Usar o mesmo material em estoque, recebimento e ativo; manter o histórico documental independente das edições posteriores de cadastro.

**Demonstração:** Abrir o catálogo pelo Patrimônio, atualizar a especificação de um modelo ainda sem operação e consultar esse material pelo Almoxarifado. Criar um bem usando o modelo.

**Aceite:** Os três campos podem ser mantidos e as alterações estão disponíveis entre módulos. Não há cadastro patrimonial de material paralelo que precise ser atualizado manualmente.

### PAT-008 — Fornecedores PF/PJ no Patrimônio

**TR — PATRIMÔNIO, item 8, p. 46:**

> O sistema deverá conter cadastro de fornecedores de pessoas físicas e jurídicas,

**Implementação:** Reutilizar os fornecedores de ALM-003/Compras. O cadastro patrimonial deve aceitar fornecedor PF e PJ nas origens pertinentes, sem exigir um CNPJ para qualquer pessoa nem transformar PF em PJ.

**Demonstração:** Consultar F-PJ-01 a partir de um notebook incorporado e cadastrar um bem de origem demonstrativa fornecido por F-PF-01. Reabrir as fichas dos fornecedores.

**Aceite:** Ambos os tipos são aceitos e persistidos. A ligação ao fornecedor é a mesma dos demais módulos, e não texto livre duplicado sem referência.

### PAT-009 — Validação condicional de CPF/CNPJ no Patrimônio

**TR — PATRIMÔNIO, item 9, p. 46:**

> Os campos de cadastramento de dados do fornecedor devem ser habilitados de acordo com o tipo de pessoa (física ou jurídica) a ser cadastrada. Exemplo: O sistema não poderá permitir a digitação do campo CNPJ para pessoa física e vice-versa;

**Implementação:** Reaproveitar formulário e validação de ALM-004. Qualquer atalho de cadastro de fornecedor aberto pelo Patrimônio precisa respeitar a mesma regra no servidor.

**Demonstração:** No atalho de novo fornecedor do Patrimônio, escolher PF e tentar informar CNPJ; repetir para PJ/CPF. Enviar payload incompatível em teste de API e, depois, salvar um cadastro válido.

**Aceite:** Não existe caminho alternativo pelo Patrimônio que aceite a combinação proibida. O mesmo comportamento é observado no cadastro compartilhado.

### PAT-010 — Grupos de bens

**TR — PATRIMÔNIO, item 10, p. 46:**

> Permitir o cadastro de grupos de bens patrimoniais tais como móveis, imóveis, semoventes e intangíveis;

**Implementação:** Disponibilizar cadastro de grupos patrimoniais, incluindo móveis, imóveis, semoventes e intangíveis. Associar o grupo aos bens e consultas. Não inventar rotinas completas de manejo de semoventes ou de amortização somente porque esses grupos são citados neste item.

**Demonstração:** Cadastrar os quatro grupos; associar o notebook a móveis e o prédio demonstrativo a imóveis. Criar registros apenas cadastrais de teste para verificar a seleção de semoventes e intangíveis.

**Aceite:** Os quatro grupos existem como dados persistidos e são selecionáveis. Grupo não se confunde com classe contábil nem com forma de aquisição.

### PAT-011 — Classes patrimoniais e classificação contábil

**TR — PATRIMÔNIO, item 11, p. 46:**

> Possuir cadastro de classes patrimoniais para agrupamento de bens de acordo com a sua classificação contábil;

**Implementação:** Manter classes vinculadas ao agrupamento contábil usado pela entidade. Reutilizar o plano de contas existente e suas referências; não inventar códigos oficiais. A classe deve ser selecionável no bem e recuperável em consultas e relatórios. Separar classe de grupo de bens.

**Demonstração:** Cadastrar classes demonstrativas “Equipamentos de TI”, “Mobiliário” e “Bens imóveis”, com vínculos contábeis de teste claramente identificados ou contas reais já configuradas no ambiente. Classificar notebook, mesa e prédio.

**Aceite:** Os bens podem ser agrupados por sua classe e a referência contábil é rastreável. Nenhum código ilustrativo é apresentado como código homologado da prefeitura ou do Tribunal.

### PAT-012 — Estorno de avaliação

**TR — PATRIMÔNIO, item 12, p. 46:**

> Possuir rotina para estorno de avaliação de bens patrimoniais;

**Implementação:** Selecionar a avaliação original e gerar evento inverso vinculado, com justificativa e usuário. Recuperar a composição de valores anterior e tratar o reflexo contábil pelo mesmo mecanismo de origem. Impedir estorno repetido ou alteração silenciosa de eventos posteriores dependentes.

**Demonstração:** Em F-VALORES, avaliar BEN-A001 de R$ 800,00 para R$ 900,00. Estornar exatamente essa avaliação. Abrir ficha, histórico e relatório de estornos.

**Aceite:** O bem volta a R$ 800,00; avaliação de +R$ 100,00 e estorno de −R$ 100,00 permanecem visíveis e ligados. Um segundo estorno da mesma avaliação é recusado.

### PAT-013 — Relatório imprimível de estorno de movimentações

**TR — PATRIMÔNIO, item 13, p. 46:**

> Posibilitar a impressão do relatório de estorno de movimentações;

**Implementação:** Gerar relatório de estornos com bem/tombamento, tipo de movimento original, datas, valores, referência original, motivo e usuário. Abranger avaliação, reavaliação e depreciação, e outros tipos que o sistema efetivamente suporte. Incluir visualização e impressão, não apenas uma lista na tela.

**Demonstração:** Após os três estornos de F-VALORES, filtrar o período e imprimir o relatório. Abrir uma linha e conferir o vínculo ao evento original.

**Aceite:** O documento registra as três operações e seus efeitos: −R$ 100,00 em avaliação, −R$ 200,00 em reavaliação e +R$ 72,00 em reversão da depreciação, conforme a convenção de efeito no valor líquido. Não confundir valor nominal da depreciação com sinal do seu estorno.

### PAT-014 — Estorno de depreciação

**TR — PATRIMÔNIO, item 14, p. 46:**

> Possuir rotina para estorno de depreciação de bens patrimoniais;

**Implementação:** Gerar estorno ligado à depreciação selecionada, recompondo o valor líquido e a depreciação acumulada. Conservar competência e fórmula originais. Uma competência estornada pode ser recalculada de modo controlado, mas não pode ter duas depreciações ativas indevidas.

**Demonstração:** Em BEN-D001, aplicar depreciação de R$ 72,00, reduzindo o valor de R$ 4.800,00 para R$ 4.728,00. Estornar e consultar novamente os valores.

**Aceite:** O valor volta a R$ 4.800,00 e a parcela de depreciação acumulada é revertida. A operação original não é apagada; repetição do estorno não altera novamente o valor.

### PAT-015 — Estorno de reavaliação

**TR — PATRIMÔNIO, item 15, p. 46:**

> Possuir rotina para estorno de reavaliação de bens patrimoniais;

**Implementação:** Reutilizar o motor de estornos, distinguindo a reavaliação da avaliação e da depreciação. Restaurar os valores e parâmetros afetados, preservando versões e origem; aplicar a política de dependências cronológicas descrita na seção 3.

**Demonstração:** Reavaliar BEN-R001 de R$ 1.000,00 para R$ 1.200,00. Estornar o evento e abrir ficha, histórico e relatório.

**Aceite:** O valor retorna a R$ 1.000,00; os dois eventos continuam consultáveis. O estorno não reverte outro tipo de lançamento por engano.

### PAT-016 — Histórico de bens patrimoniais

**TR — PATRIMÔNIO, item 16, p. 46:**

> Emitir relatório de histórico de bens patrimoniais;

**Implementação:** Consolidar cadastro, incorporação/origem, localização/responsável, avaliações, reavaliações, depreciações, estornos e baixa. Exibir cronologia, usuário, documento e efeito da operação. Gerar relatório a partir da mesma fonte da ficha, sem reconstituir o passado apenas com o valor atual.

**Demonstração:** Consultar BEN-A001 depois de avaliação e estorno, e um notebook depois de sua incorporação e transferência. Abrir os documentos vinculados e emitir os históricos.

**Aceite:** Os relatórios mostram o que mudou, quando, por quem e a partir de qual documento. Transferência não apaga a origem; estorno não remove o evento original.

### PAT-017 — Cadastro de avaliações para atualização de valores

**TR — PATRIMÔNIO, item 17, p. 46:**

> Possuir cadastro de avaliações para correção/atualização de valores dos bens da entidade;

**Implementação:** Disponibilizar avaliação com bem, data, valor anterior, valor proposto, diferença e fundamento/documento quando utilizado. Usar estados de preparação e efetivação já existentes, para que salvar um rascunho não altere o valor oficial. Confirmar a avaliação pelo serviço de cálculo/lançamentos de PAT-002.

**Demonstração:** Cadastrar avaliação de BEN-A001, hoje R$ 800,00, para R$ 900,00. Mostrar o valor antes da confirmação, confirmar e reabrir a ficha e o histórico.

**Aceite:** O cadastro conserva valores anterior e novo. Apenas a efetivação gera a mudança de +R$ 100,00. É possível selecionar esse evento na rotina de estorno.

### PAT-018 — Reavaliação e depreciação parametrizadas

**TR — PATRIMÔNIO, item 18, p. 46:**

> Possuir rotina de reavaliação e depreciação de acordo com os parâmetros definidos pela entidade

**Implementação:** Permitir informar os parâmetros da entidade e executar reavaliação/depreciação com prévia, confirmação e registros rastreáveis. Para a demonstração, adotar depreciação linear mensal parametrizável e reavaliação por valor informado, como escolhas de exemplo, não como métodos obrigatórios do TR. Não depreciar automaticamente todos os grupos de bens nem presumir regras para imóveis.

**Demonstração:** Pré-calcular BEN-D001 com custo R$ 4.800,00, residual R$ 480,00 e vida útil de 60 meses: R$ 72,00/mês. Na prévia ainda não efetivada, mudar para 120 meses e conferir R$ 36,00; voltar a 60 e confirmar uma competência. Em BEN-R001, efetivar a reavaliação para R$ 1.200,00.

**Aceite:** Parâmetros alteram o resultado real da prévia; a confirmação não deprecia duas vezes a mesma competência. O residual é respeitado. Reavaliação e depreciação produzem registros distintos e podem ser estornadas pelas rotinas próprias.

### PAT-019 — Abertura, fechamento e bloqueio do inventário patrimonial

**TR — PATRIMÔNIO, item 19, pp. 46–47:**

> Permitir o registro da abertura e do fechamento do inventário, bloqueando a movimentação ou destinação de bens durante a sua realização;

**Implementação:** Registrar inventário com período, escopo de bens/local e responsáveis. Enquanto aberto, bloquear movimentação e destinação dos bens abrangidos no servidor, incluindo transferência, baixa e outras operações que alterem a posição inventariada. Manter contagem e observações permitidas. Aplicar o mesmo controle transacional de concorrência do Almoxarifado.

**Demonstração:** Abrir inventário da Sala de TI, tentar transferir e baixar um notebook abrangido e chamar a operação pela API. Registrar a conferência, fechar o inventário e realizar uma transferência válida.

**Aceite:** Abertura e fechamento ficam registrados. Operações no escopo bloqueado são recusadas, inclusive via API. Após fechar, a transferência funciona e deixa histórico e termo.

### PAT-020 — Comissões de patrimônio

**TR — PATRIMÔNIO, item 20, p. 47:**

> Possuir cadastro de comissões de patrimônio, contendo a finalidade, vigência, Documento de Nomeação e composição dos membros responsáveis;

**Implementação:** Manter finalidade, início e fim da vigência, documento de nomeação e composição dos membros responsáveis. Permitir localizar a comissão em inventários e procedimentos pertinentes sem impor um rito de aprovação não descrito no TR. Reutilizar Pessoas/Servidores e GED.

**Demonstração:** Cadastrar COM-DEMO-2026, finalidade “Inventário anual demonstrativo”, vigência de 01/09/2026 a 31/12/2026, documento PORTARIA-DEMO-001 e três membros fictícios. Salvar e reabrir.

**Aceite:** Os quatro componentes expressos no TR permanecem acessíveis: finalidade, vigência, documento e membros. O documento é abrível e não apenas um nome de arquivo sem conteúdo.

### PAT-021 — Duplicação de itens do catálogo de materiais

**TR — PATRIMÔNIO, item 21, p. 47:**

> Permitir duplicar itens do catálogo de materiais, agilizando novos cadastros;

**Implementação:** Usar o mesmo serviço de ALM-026 e disponibilizá-lo no contexto do Patrimônio. Distinguir “duplicar material/modelo” de “duplicar bem tombado” de PAT-004: a primeira ação não gera um ativo patrimonial.

**Demonstração:** Duplicar o material “Notebook administrativo” para criar “Notebook administrativo — modelo B”, alterar a especificação e consultar o catálogo. Conferir a lista de bens antes e depois.

**Aceite:** Há um novo item de catálogo, sem novo tombamento, saldo ou histórico patrimonial. O original permanece igual.

### PAT-022 — Grid de tombamento automático

**TR — PATRIMÔNIO, item 22, p. 47:**

> Demonstrar no grid de tombamento automático de bens móveis o nome do fornecedor, documento fiscal, número do documento fiscal, nome do item e a quantidade disponível para lançamento;

**Implementação:** Listar recebimentos elegíveis com as cinco informações exigidas: nome do fornecedor, documento fiscal, número do documento fiscal, nome do item e quantidade disponível para lançamento. Mostrar tipo/identificação do documento fiscal separadamente de seu número, evitando omissão. A quantidade deve ser calculada considerando vínculos e consumos já efetivados, não copiada da quantidade original da nota.

**Demonstração:** Abrir o recebimento de cinco notebooks de NF-DEMO-0052. Mostrar fornecedor, tipo “Nota fiscal demonstrativa”, número NF-DEMO-0052, item e disponibilidade 5. Tombar duas unidades e atualizar a consulta: disponibilidade 3.

**Aceite:** Todos os campos estão visíveis no grid e provêm dos registros de origem. Duas sessões não conseguem incorporar mais de cinco unidades somadas. Quantidade já incorporada deixa de ser oferecida para novo lançamento.

### PAT-023 — Cadastro completo de bens móveis e imóveis

**TR — PATRIMÔNIO, item 23, p. 47:**

> Possibilitar o cadastro dos bens móveis e imóveis, contendo todos os dados necessários para o patrimonial, inclusive identificação do setor e pessoa responsável. No caso de bens imóveis, permitir ainda o lançamento dos seguintes dados adicionais como: endereço, área, valor, tipo, natureza e utilização;

**Implementação:** Manter identificação/tombamento, descrição/material, grupo, classe, datas, valores, setor e pessoa responsável. Para imóveis, expor também endereço, área, valor, tipo, natureza e utilização, com campos próprios. Não reduzir os três últimos campos a uma única observação nem exigir uma estrutura de geoprocessamento não prevista neste item.

**Demonstração:** Cadastrar um notebook móvel e o prédio BEN-I001. No prédio, preencher Rua de Demonstração, 10, área de 200 m², valor de R$ 400.000,00, tipo “Edificação”, natureza “Próprio — demonstrativo” e utilização “Apoio administrativo”, além de setor e responsável.

**Aceite:** Os dois cadastros persistem. Todos os campos específicos do imóvel são recuperados separadamente. Setor e pessoa responsável constam em ambos os tipos de bem.

### PAT-024 — Etiquetas com tombamento, nome e QR Code

**TR — PATRIMÔNIO, item 24, p. 47:**

> Emitir relatório de etiquetas patrimoniais contendo no mínimo o número no tombamento, nome do item e QRCode;

**Implementação:** Gerar relatório imprimível de etiquetas com número de tombamento, nome do item e QR Code efetivamente codificado. Usar identificação/URL estável do bem; manter autenticação quando a consulta revelar dados protegidos. Não usar uma imagem decorativa de QR Code repetida em todas as etiquetas.

**Demonstração:** Selecionar dois notebooks, gerar o relatório de etiquetas, visualizar e imprimir em PDF. Ler os dois códigos com celular ou leitor e verificar os destinos.

**Aceite:** Cada etiqueta contém os três elementos exigidos e o código leva ao bem correto. Os dois bens têm identificações distintas; o arquivo não corta tombamentos, nomes nem o QR Code.

### PAT-025 — Baixas por motivos: requisito repetido

**TR — PATRIMÔNIO, item 25, p. 47:**

> Permitir o registro da baixa dos bens por venda, doação, obsolescência ou sucateamento, inutilização, inexistência física, sinistro, etc.

**Implementação:** Reutilizar PAT-005/PAT-030 e manter a identificação PAT-025 no controle. Não desenvolver outra rotina de baixa ou duplicar o lançamento para atender à repetição do TR.

**Demonstração:** Em um bem independente de F-BAIXAS, registrar doação e efetivar. Mostrar também na seleção os motivos venda, obsolescência/sucateamento, inutilização, inexistência física e sinistro.

**Aceite:** O evento de doação usa a mesma trilha auditável e aparece no relatório de baixas. Uma única baixa corresponde a uma única retirada da posição ativa.

### PAT-026 — Anexos vinculados ao bem

**TR — PATRIMÔNIO, item 26, p. 47:**

> Possibilitar a inserção de anexos ao bem, podendo ser nota fiscal, foto, etc.;

**Implementação:** Reutilizar o GED/armazenamento existente para upload, associação, listagem e abertura de documentos e fotos. Gravar vínculo ao bem, metadados e permissões; validar tipo/tamanho conforme a política técnica vigente. Não tornar públicos os arquivos apenas para facilitar a POC.

**Demonstração:** Anexar uma nota fiscal demonstrativa em PDF e uma fotografia de equipamento a um notebook. Sair da tela, reabrir o bem e visualizar/baixar os dois arquivos com usuário autorizado; testar acesso sem permissão.

**Aceite:** Os dois arquivos permanecem associados e têm conteúdo recuperável. Outro bem não recebe os anexos por engano e acesso não autorizado é recusado.

### PAT-027 — Arquivos de prestação de contas do Tribunal

**TR — PATRIMÔNIO, item 27, p. 47:**

> Geração dos arquivos de prestação de contas do Tribunal de contas do estado.

**Implementação:** Tratar como dependência externa prioritária. O item exige os arquivos, mas não define leiaute, formato, versão, esquema, conjunto de remessas ou validador. Localizar eventual exportador existente e sua documentação; obter a especificação oficial aplicável ao estado/competência e só então mapear campos, códigos e validações. Criar geração auditada, pré-validação, erros acionáveis e registro da versão. Não substituir por um CSV genérico nem inventar XML ou protocolo de aceite.

**Demonstração:** Depois de obter o leiaute: gerar a remessa a partir dos bens e movimentos fictícios persistidos, abrir o arquivo e validar com os esquemas/regras oficiais disponíveis. Introduzir um campo obrigatório ausente e comprovar que a geração aponta o erro. Não transmitir dados fictícios a ambiente oficial de produção.

**Aceite:** Arquivo consistente com a especificação oficial identificada e validações aplicáveis executadas, com evidência de versão/competência. Sem essa fonte, registrar “BLOQUEADO_EXTERNO — leiaute pendente”; a existência de botão ou arquivo ilustrativo não permite marcar o item como validado. O TR deste item não exige, por si, transmissão automática ao Tribunal.

### PAT-028 — Termo de transferência patrimonial

**TR — PATRIMÔNIO, item 28, p. 47:**

> Emitir relatório de termo de transferência patrimonial;

**Implementação:** Disponibilizar transferência real de bem entre setores/locais/responsáveis, com atualização da posição e histórico. Gerar termo com identificação da operação, bens, tombamentos, origem, destino, responsáveis e data. Campos de assinatura e demais detalhes de apresentação seguem o padrão documental já adotado.

**Demonstração:** Transferir um notebook da Sala de TI para a Escola Municipal Horizonte, trocando o responsável. Emitir o termo e abrir a ficha do bem. Depois tentar transferi-lo enquanto houver inventário bloqueando seu escopo.

**Aceite:** Termo, ficha e histórico mostram a mesma origem/destino e os mesmos bens. A transferência é efetiva, não apenas um PDF. Operação bloqueada não gera termo de transferência concluída.

### PAT-029 — Relatório de baixas patrimoniais

**TR — PATRIMÔNIO, item 29, p. 47:**

> Emitir relatório de baixas patrimoniais;

**Implementação:** Gerar relatório por período da baixa, motivo, grupo/classe e localização, usando baixas efetivadas. Exibir tombamento, nome, data, motivo, referência, valor na baixa e totais com significado explícito. Não usar o valor atual zerado do bem para perder o valor histórico que saiu da posição ativa.

**Demonstração:** Emitir o relatório após a baixa de BEN-B001 e conferir a inutilização e seu valor líquido de R$ 300,00 imediatamente antes da baixa. Abrir a referência e comparar com o histórico.

**Aceite:** O relatório apresenta o bem, o motivo e a data corretos; o valor de R$ 300,00 é preservado como valor na baixa. Bens apenas preparados para baixa não aparecem como baixados.

### PAT-030 — Efetivação da baixa patrimonial

**TR — PATRIMÔNIO, item 30, p. 47:**

> Permitir realizar a baixa patrimonial.

**Implementação:** Implementar a confirmação autorizada da baixa: validar situação ativa, bloqueio de inventário e versão; gerar evento auditável e reflexo contábil aplicável; retirar o bem da posição ativa sem apagar a ficha. Operação deve ser atômica e idempotente. A ação de excluir um cadastro não é substituta para a baixa.

**Demonstração:** Efetivar a baixa preparada em PAT-005. Recarregar a lista de ativos, consultar a lista de baixados e abrir o histórico. Tentar executar a mesma baixa novamente e tentar transferir o bem baixado.

**Aceite:** O bem sai da posição ativa exatamente uma vez e continua consultável como baixado. Nova baixa ou transferência operacional indevida é recusada. Não há exclusão de histórico ou de documentos.

### PAT-031 — Comissões de patrimônio: requisito repetido

**TR — PATRIMÔNIO, item 31, p. 47:**

> Possuir cadastro de comissões de patrimônio, contendo a finalidade, vigência, Documento de Nomeação e composição dos membros responsáveis;

**Implementação:** Usar o cadastro de PAT-020 e manter este item na rastreabilidade. Alterações de finalidade, vigência, documento e composição precisam ser auditáveis; não criar uma segunda base de comissões.

**Demonstração:** Reabrir COM-DEMO-2026, consultar o documento de nomeação e os três membros, alterar a composição em um cenário de teste e consultar novamente.

**Aceite:** Todos os campos do item estão disponíveis. O histórico registra a alteração de composição e os procedimentos anteriores não perdem a referência da comissão.

### PAT-032 — Relação sintética de bens cadastrados por período

**TR — PATRIMÔNIO, item 32, p. 47:**

> Emitir relatório da relação sintética dos bens patrimoniais cadastrados por período.

**Implementação:** Emitir relação sintética filtrada pela data de cadastro, distinguindo-a da data de aquisição. Usar identificação/tombamento, nome, grupo/classe, situação e valores identificados; oferecer totalização coerente. O padrão deve contemplar bens cadastrados no período, inclusive baixados, ou deixar explícito o filtro de situação aplicado; não transformar o relatório silenciosamente em lista apenas de ativos.

**Demonstração:** Filtrar cadastros de 01/09/2026 a 30/09/2026. Conferir os bens criados no mês e a exclusão de BEN-H001, cadastrado em julho. Abrir o conjunto correspondente de fichas e comparar a quantidade. Testar um período sem cadastros.

**Aceite:** A seleção usa a data de cadastro correta; quantidade e valores conciliam com as fichas do mesmo recorte. O relatório identifica a situação considerada e a referência temporal dos valores. Período vazio não apresenta bens de outro mês.


---

<a id="entregas"></a>
## 7. Ordem de desenvolvimento e entregas ao usuário

### 7.1 Pacotes de implementação

Cada pacote deve entregar interface, operação de servidor, persistência, permissões, efeitos integrados e testes pertinentes. Não fechar um pacote apenas com componentes visuais.

| Pacote | Entrega prática | IDs específicos cobertos | Dependência |
|---|---|---|---|
| P0 — Diagnóstico | Mapa do código existente, lacunas por ID e estratégia de migrations. Iniciar obtenção do leiaute do Tribunal imediatamente. | Todos os IDs, apenas para classificação inicial. | Acesso ao repositório. |
| P1 — Cadastros compartilhados | Catálogo, PF/PJ, organograma, locais, centros de consumo, requisitantes, classificações, grupos/classes e duplicação de material. | ALM-002, 003, 004, 006, 007, 008, 013, 014, 015, 026; PAT-001, 007, 008, 009, 010, 011, 021. | P0. |
| P2 — Estoque e AF | Saldos, movimentos, lotes, múltiplos almoxarifados, transferência atômica, abertura e entrada derivada de AF. | ALM-001, 005, 009, 010, 011, 012, 018, 027. | P1 e Compras/AF existente. |
| P3 — Uso operacional e relatórios de estoque | Requisição externa, entrega integral, bloqueio de inventário, ressuprimento, relatórios de crédito/débito, balancete, boletim e histórico. | ALM-016, 017, 019, 020, 021, 022, 023, 024, 025. | P2 e núcleo de relatórios. |
| P4 — Cadastro e incorporação de bens | Consulta, duplicação de bens, integração com estoque, grid, móvel/imóvel, etiquetas e anexos. | PAT-003, 004, 006, 022, 023, 024, 026. | P1/P2 e GED. |
| P5 — Eventos de valor | Fórmulas, avaliações, reavaliação, depreciação e os três tipos de estorno. | PAT-002, 012, 014, 015, 017, 018. | P4 e Financeiro/Contabilidade. |
| P6 — Inventário, destinação e relatórios patrimoniais | Comissões, inventário bloqueante, transferências, baixas efetivas, históricos, estornos imprimíveis e relações sintéticas. | PAT-005, 013, 016, 019, 020, 025, 028, 029, 030, 031, 032. | P4/P5; relatórios compartilhados. |
| P7 — Prestação de contas | Exportador e validação do leiaute oficial identificado; não um arquivo ilustrativo. | PAT-027. | Fonte oficial/versão/competência; iniciar a dependência em P0 e desenvolver em paralelo assim que resolvida. |
| P8 — Ensaio completo | Executar F-ALM, F-INTEGRACAO e os cenários independentes; fechar evidências e regressões. | Todos os 59 IDs, inclusive repetidos. | Pacotes pertinentes e pendências explícitas. |

Não estimar dias ou horas sem diagnóstico do código. Uma funcionalidade encontrada e comprovadamente operacional pode ser reaproveitada e testada, sem reimplementação desnecessária. Pendência de leiaute em PAT-027 não impede avançar nos outros 58 IDs.

### 7.2 Testes técnicos obrigatórios do projeto

Os testes abaixo são critérios de qualidade propostos para demonstrar as funções com segurança; não são uma lista de novos requisitos numerados do TR.

| Teste | Verificação concreta |
|---|---|
| Persistência | Criar/editar/movimentar, recarregar e abrir em outra sessão autorizada; a posição deve continuar igual. |
| Idempotência de origem | Repetir AF, recebimento, entrega, incorporação, depreciação e baixa; não criar segundo efeito para a mesma operação. |
| Concorrência de saldo | Duas sessões tentam consumir juntas mais que o saldo disponível; no máximo a quantidade existente é efetivada. |
| Concorrência patrimonial | Duas sessões tentam tombar acima da elegibilidade da mesma origem; a soma de incorporações não ultrapassa o recebido elegível. |
| Atomicidade | Forçar falha no meio de transferência/incorporação; nenhum lado parcial fica confirmado. |
| Inventário | Testar tela e API, incluindo AF e integração patrimonial; inventário bloqueia qualquer caminho que altere seu escopo. |
| Requisição externa | Um usuário de setor externo cria o pedido; outro autorizado atende; o solicitante acompanha sem permissão de ajuste de saldo. |
| PF/PJ | Validar combinações corretas e rejeitar CPF/CNPJ incompatível tanto no cadastro compartilhado quanto no atalho patrimonial. |
| Texto e busca | Descrição longa não é truncada; busca encontra palavra inteira e parte da descrição. |
| Relatórios | Conferir números da seção 4 na tela, impressão e exportações aplicáveis; testar também período vazio e início/fim de período. |
| Estornos | Restaurar valores e parâmetros sem apagar histórico; bloquear segundo estorno e tratar dependências posteriores. |
| Arquivos/anexos/QR | Abrir documentos após nova sessão; bloquear acesso não autorizado; ler códigos e conferir o bem correspondente. |
| Baixa | Retirar da posição ativa uma única vez, preservar ficha/valor histórico e impedir destinação operacional indevida. |
| Escopo | Não acessar registros de outro órgão/ambiente ou setor sem permissão, inclusive por ID direto na API. |
| Tribunal | Validar somente com especificação identificada; dado obrigatório ausente gera erro, não campo inventado ou preenchimento silencioso. |

### 7.3 Registro que o agente deve manter

Criar ou atualizar um arquivo de acompanhamento no local de documentação já usado pelo repositório. Um caminho como `docs/poc/almoxarifado-patrimonio-status.md` é apenas sugestão, não um arquivo cuja existência foi confirmada.

Usar a estrutura abaixo, com **uma linha para cada ALM-001 a ALM-027 e PAT-001 a PAT-032**:

```markdown
| ID | Estado | Tela/rota real | Serviço/persistência | Teste executado | Evidência | Pendência |
|---|---|---|---|---|---|---|
| ALM-001 | A_VERIFICAR | A mapear | A mapear | Não executado | — | Diagnóstico |
```

A lista de arquivos alterados, migrations, instruções de preparação da base e comandos de teste deve citar **somente caminhos e comandos realmente verificados no repositório**. Registrar falhas e testes não executados; não escrever “todos passaram” sem execução.

### 7.4 Evidência final por item

Um ID recebe `VALIDADO` neste acompanhamento de desenvolvimento quando a função é executável, persiste, produz o efeito esperado, gera o documento quando exigido, respeita permissões e tem evidência reproduzível. Essa classificação interna **não é declaração de aprovação da comissão**.

Para repetidos, associar a mesma implementação e os testes pertinentes, mantendo cada ID. Para dependências externas, registrar fonte necessária e o motivo do bloqueio. Entregar ao usuário o acesso às telas, os documentos gerados na base de teste e um roteiro breve de repetição — não apenas screenshots.

<a id="pendencias"></a>
## 8. Decisões explicitadas e dependências não resolvidas pela fonte

### Q-01 — Quando a entrada derivada de AF libera saldo? [ALM-009]

**O TR diz:** entrada automática da nota fiscal a partir da emissão de AF. **Não detalha:** o ciclo entre emissão, recebimento físico e disponibilidade de estoque.

**Proposta operacional deste MD:** emitir AF cria automaticamente a entrada vinculada; associar nota e confirmar recebimento libera o saldo. O usuário não digita as linhas novamente. A emissão não deve se limitar a criar um link sem entrada.

**A confirmar para a apresentação oficial:** se a comissão espera saldo disponível imediatamente na emissão da AF ou aceita o ciclo explícito de recebimento. Documentar a escolha; não transformar a pré-entrada proposta em interpretação oficial. A pergunta não impede desenvolver a integração e sua confirmação real.

### Q-02 — Qual é o conjunto de “todos os itens do estoque”? [ALM-025]

**O TR diz:** saída automática de todos os itens do estoque pela entrega do material de forma integral. **Não detalha:** a abrangência exata do conjunto.

**Proposta deste MD:** entregar todas as linhas do documento/seleção de entrega, em uma confirmação, com a alternativa de selecionar toda a disponibilidade de materiais específicos. Não esvaziar o almoxarifado inteiro ao entregar uma requisição. Deixar esse comportamento claro ao demonstrar e obter confirmação caso a comissão adote outra abrangência.

### Q-03 — Tipo de aquisição e grupo de bens [PAT-003]

A redação usa “tipo de aquisição (grupo de bens)”. O plano preserva ambos como critérios consultáveis e não corrige o TR silenciosamente. Datas e valores também ficam identificados por seu significado na interface, evitando um único filtro ambíguo.

### Q-04 — Especificação dos arquivos do Tribunal [PAT-027]

**Dependência material:** obter leiaute/formato, versão, competência aplicável, regras de mapeamento e meios de validação disponíveis. O TR identifica o estado como Espírito Santo, mas o item não fornece o nome do sistema de remessa nem seus esquemas técnicos. Este documento **não inventa esses detalhes e não contém pesquisa externa de leiautes**.

Antes de finalizar o exportador, registrar a referência oficial ou documentação oficial fornecida, os arquivos/esquemas usados e sua versão. Um exemplo próprio pode servir a testes internos identificados como tais, nunca a alegação de conformidade. Sem a especificação, manter PAT-027 bloqueado e informar a pendência ao usuário.

### Q-05 — Parâmetros contábeis reais

O TR menciona parametrização pela entidade, mas não fornece neste recorte taxas, vida útil, residual, regras de vigência ou contas. Usar os valores demonstrativos apenas na base fictícia e configurar o que já estiver estabelecido no CeleriFlow. A validação dos parâmetros reais da prefeitura é uma atividade distinta da comprovação de que o sistema permite cadastrá-los e executá-los.

## 9. Critério de conclusão desta adaptação

A entrega deve permitir ao usuário percorrer **cada um dos 59 IDs** pelo sistema, demonstrar seus efeitos com os dados propostos ou equivalentes, consultar históricos e emitir os relatórios correspondentes. O acompanhamento deve separar claramente o que foi implementado/testado do que depende de fonte externa ou de decisão de interpretação.

Não concluir “POC pronta” enquanto houver entrada manual fingindo integração, valores fixos fingindo cálculo, arquivo estático fingindo relatório, QR Code decorativo, baixa que apenas exclui o cadastro ou exportação genérica apresentada como remessa oficial.

## 10. Rastreabilidade da fonte

| Bloco utilizado | Localização no PDF ratificado | Uso neste MD |
|---|---|---|
| Almoxarifado | Páginas 44–45, itens 1–27. | Transcrição individual e plano ALM-001 a ALM-027. |
| Patrimônio | Páginas 45–47, itens 1–32. | Transcrição individual e plano PAT-001 a PAT-032; item 19 cruza pp. 46–47. |
| Ambiente tecnológico, integridade, operação e relatórios | Páginas 28–33. | Referências transversais selecionadas, não uma reprodução integral. |
| Requisitos gerais | Páginas 40–44. | Referências transversais selecionadas, não uma reprodução integral. |

**Prevalência:** a redação do TR ratificado é a fonte dos requisitos. Os cenários e as decisões propostas neste MD são meios de implementação e ensaio; divergências de interpretação devem ser documentadas, não ocultadas por ajustes na citação do requisito.
