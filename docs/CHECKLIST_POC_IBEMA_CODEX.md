# Auditoria da POC — Ibema/PR
## Pregão Eletrônico nº 36/2026 — Processo Administrativo nº 68/2026
### Checklist técnico para auditoria do CeleriFlow pelo Codex

> **Objetivo deste arquivo:** usar o repositório atual do CeleriFlow como fonte de evidência e comparar o que já existe com **cada requisito efetivamente avaliado na POC de Ibema/PR**, identificando o que está pronto, o que está parcial e o que ainda precisa ser implementado/configurado.
>
> **Fonte oficial e soberana:** Edital Retificado + Termo de Referência:
> https://lanceeletronico.blob.core.windows.net/processfiles/616747a2ba7a4a7998b95a57e779bd7a.pdf
>
> **Não inventar requisitos. Não substituir o texto do Edital/TR por boas práticas genéricas.**
> Quando houver dúvida, usar o PDF oficial como fonte de verdade.

---

# 1. Tarefa para o Codex

Faça primeiro uma **AUDITORIA**, sem alterar o código.

1. Leia a estrutura completa do repositório.
2. Identifique:
   - aplicações;
   - rotas;
   - páginas;
   - componentes;
   - APIs;
   - serviços;
   - schemas;
   - migrations;
   - tabelas;
   - autenticação;
   - armazenamento;
   - relatórios;
   - integrações;
   - jobs/filas;
   - logs/auditoria;
   - módulos funcionais existentes.
3. Para cada item da POC:
   - procure evidência real no código;
   - procure evidência no banco/schema;
   - procure evidência nas APIs;
   - procure evidência na interface;
   - identifique se existe fluxo completo ou apenas tela/mock;
   - identifique dependências externas.
4. Gere um relatório de gaps.
5. **Não considere “parcialmente implementado” como “Atende”.**
6. Não marque como implementado algo que apenas possui:
   - botão sem ação;
   - tela estática;
   - mock sem fluxo funcional;
   - função TODO;
   - endpoint não conectado;
   - tabela sem interface/uso;
   - interface sem persistência;
   - integração sem envio/retorno verificável.
7. Não fazer refatoração estética agora.
8. Priorizar o que aumenta o percentual de aprovação da POC.

---

# 2. Regras da POC que devem orientar a auditoria

## 2.1 Primeira etapa — Padrão Tecnológico e Segurança

- São **100 requisitos** no checklist do item 10.36.
- É necessário atender **no mínimo 90%**.
- Portanto:
  - mínimo para aprovação: **90/100**;
  - máximo permitido como “Não Atende”: **10/100**.

## 2.2 Segunda etapa — Requisitos funcionais

- A avaliação ocorre **individualmente por módulo**.
- Cada módulo precisa atingir **no mínimo 90% dos seus próprios requisitos**.
- Não calcular média global entre módulos.
- Se qualquer módulo ficar abaixo de 90%, há risco de desclassificação.
- Quando o cálculo de 90% resultar em número fracionário, considerar o inteiro imediatamente superior.

## 2.3 Critério binário

A Comissão utiliza:

- `ATENDE`
- `NÃO ATENDE`

O edital determina que:

> `PARCIALMENTE ATENDE` = `NÃO ATENDE`.

Por isso, na auditoria interna usar os estados abaixo, mas considerar `PARCIAL` como risco de reprovação até que fique completo.

---

# 3. Status obrigatórios na auditoria

Use exatamente uma destas classificações para cada requisito:

| Status | Significado |
|---|---|
| `ATENDE` | Fluxo completo e demonstrável |
| `PARCIAL` | Existe parte do requisito, mas não todo o comportamento exigido |
| `NÃO ATENDE` | Não existe implementação suficiente |
| `CONFIGURAÇÃO` | Existe no produto, mas precisa configurar dados/tenant/permissões |
| `INTEGRAÇÃO_REAL` | Integração externa funcional com comunicação real |
| `HOMOLOGAÇÃO` | Comunicação real com ambiente de homologação/teste |
| `SIMULADO_POC` | Ambiente externo simulado de forma transparente |
| `EVIDÊNCIA_INFRA` | Depende de documento/SLA/certificação do provedor, não de código |
| `NÃO_VERIFICADO` | Ainda não foi possível comprovar no repositório |

> Para cálculo interno conservador, só `ATENDE`, `CONFIGURAÇÃO`, `INTEGRAÇÃO_REAL`, `HOMOLOGAÇÃO` e `EVIDÊNCIA_INFRA` comprovada devem entrar como “Atende”.

---

# 4. Saída obrigatória da auditoria

Criar:

```text
docs/poc-ibema/
├── 00-resumo-executivo.md
├── 01-padrao-tecnologico-seguranca.md
├── 02-modulos-executivo.md
├── 03-modulos-legislativo.md
├── 04-integracoes-externas.md
├── 05-gaps-priorizados.md
└── 06-roteiro-demonstracao.md
```

Em cada checklist usar a tabela:

| ID | Requisito do edital | Status | Evidência no código | Tela/rota para POC | Gap encontrado | Ação necessária | Prioridade |
|---|---|---|---|---|---|---|---|

Em **Evidência no código**, informar caminhos reais, por exemplo:

```text
src/app/...
src/components/...
src/services/...
src/server/...
prisma/schema.prisma
drizzle/...
api/...
```

Não escrever apenas “implementado”. Mostrar onde está.

---

# 5. PRIMEIRA ETAPA — 100 requisitos de Padrão Tecnológico e Segurança

Referência principal: **item 10.36 do Termo de Referência**.

## Arquitetura, cadastro único, consultas e relatórios básicos

- [ ] **PT-001** — ERP acessado via WEB, banco de dados único e hospedagem em nuvem/data center.
- [ ] **PT-002** — Cadastro Único compartilhado entre os módulos, incluindo no mínimo pessoas, famílias, textos jurídicos, centros de custo/organograma, entidades, bancos, agências, tributos, moedas, cidades, bairros, logradouros, produtos, assinantes de relatórios legais e CBO.
- [ ] **PT-003** — Consistência de dados de múltiplas áreas/módulos e relatório de inconsistências com indicação de gravidade.
- [ ] **PT-004** — Filtros personalizáveis nas telas de consulta, isolados ou combinados.
- [ ] **PT-005** — Operadores de consulta: <=, >=, igual, contém, não contém, contido em, não contido em, inicia com, termina com e entre.
- [ ] **PT-006** — Operadores “Contido em” e “Não Contido em” com intervalos e valores intercalados.
- [ ] **PT-007** — Reposicionamento, dimensionamento, ocultação e exibição de colunas.
- [ ] **PT-008** — Ordenação ascendente/descendente por uma ou várias colunas.
- [ ] **PT-009** — Seleção múltipla de registros e operações em lote.
- [ ] **PT-010** — Seleção de quantidade de registros por página e paginação.
- [ ] **PT-011** — Impressão da consulta atual com título, formato, totalizadores e exportação mínima para PDF, DOC, DOCX, XLS, XLSX, HTML, XML, CSV e TXT, de todos ou somente registros selecionados.
- [ ] **PT-012** — Retorno da consulta ao estado original/default.
- [ ] **PT-013** — Salvamento de múltiplas preferências de consulta e compartilhamento com outros usuários autorizados.
- [ ] **PT-014** — Relatórios/consultas do sistema com visualização, impressão e exportação mínima em PDF, DOC, DOCX, XLS, XLSX, HTML, XML, CSV e TXT.

## Usuários, autenticação e acesso

- [ ] **PT-015** — Usuário vinculado a um ou vários centros de custo, com restrição/liberação por Centro de Custo, Órgão, Unidade ou Total.
- [ ] **PT-016** — Login único **Gov.br**.
- [ ] **PT-017** — Configuração para utilização de servidor LDAP.
- [ ] **PT-018** — Autenticação LDAP validando usuário e senha e permitindo múltiplos servidores LDAP.
- [ ] **PT-019** — E-mail automático ao cadastrar usuário, com mensagem personalizável.
- [ ] **PT-020** — Administrador pode trocar senha; senha aleatória é enviada por e-mail e não fica exposta ao administrador.
- [ ] **PT-021** — Marcar senha como expirada para troca obrigatória no próximo login.
- [ ] **PT-022** — Validar contrato ativo do usuário/funcionário durante login.
- [ ] **PT-023** — Regras configuráveis de composição e tratamento de senhas.
- [ ] **PT-024** — Intervalo configurável para expiração automática de senhas.
- [ ] **PT-025** — Delegação de concessão de privilégios por diretores aos seus subordinados conforme hierarquia de centros de custo.

## Campos adicionais configuráveis

- [ ] **PT-026** — Inclusão configurável de campos adicionais sem customização do código.
- [ ] **PT-027** — Agrupamentos de campos adicionais em áreas específicas das telas.
- [ ] **PT-028** — Ordem de exibição configurável dos campos adicionais.
- [ ] **PT-029** — Tipos mínimos: Texto, Numérico, Data, Valor, Lista, Hora, Booleano e Texto Formatado.
- [ ] **PT-030** — Listas estáticas e/ou dinâmicas, inclusive carregáveis via SQL.
- [ ] **PT-031** — Máscaras/formatação mínima para CPF, CNPJ, CEP, Telefone e E-mail.
- [ ] **PT-032** — Valor padrão e obrigatoriedade do campo.
- [ ] **PT-033** — Regras condicionais entre campos, avisos e bloqueios.
- [ ] **PT-034** — Campo adicional com anexo digital e configuração de extensões permitidas.
- [ ] **PT-035** — Campo adicional com consulta relacionada a dados de outras tabelas.
- [ ] **PT-036** — Inicialização/reinicialização em massa do valor de novo campo adicional para registros preexistentes.

## Certificados e assinaturas digitais

- [ ] **PT-037** — Repositório com certificado A1 da entidade e uso compartilhado mediante privilégio.
- [ ] **PT-038** — Certificado individual para assinatura avançada conforme Lei 14.063/2020.
- [ ] **PT-039** — Controle de vencimento e alertas dos certificados.
- [ ] **PT-040** — Log de auditoria para cada utilização de certificado.
- [ ] **PT-041** — Assinatura Qualificada para Login do Sistema, Peticionamento Eletrônico e Escrituração Fiscal.
- [ ] **PT-042** — Assinaturas Básica, Avançada e Qualificada em relatórios, pareceres e recebimento/envio de processos digitais.
- [ ] **PT-043** — Assinatura diretamente na aplicação, sem depender de outro sistema, salvo acesso ao dispositivo local do certificado.
- [ ] **PT-044** — Solicitações de assinatura com execução sequencial ou simultânea.
- [ ] **PT-045** — Possibilidade de rejeitar documento recebido para assinatura.
- [ ] **PT-046** — Notificação final ao criador e validação de conclusão de todas as assinaturas.
- [ ] **PT-047** — Assinar múltiplos registros de solicitações de assinatura em um mesmo ato.
- [ ] **PT-048** — Encaminhar solicitação de assinatura ao cidadão via portal de serviços ou aplicativo.
- [ ] **PT-049** — Configuração de carimbos/estampas de assinatura por usuário ou entidade.
- [ ] **PT-050** — Alerta quando usuário já assinou o documento.
- [ ] **PT-051** — Assinatura com certificados do repositório e/ou locais, A1 ou A3.
- [ ] **PT-052** — Listagem dos certificados disponíveis antes da assinatura.
- [ ] **PT-053** — Indicação clara de certificado vencido.
- [ ] **PT-054** — Fluxo de assinatura dentro da própria aplicação web por interface padronizada.
- [ ] **PT-055** — Visualização do documento no momento da assinatura, inclusive documentos relacionados em lote.
- [ ] **PT-056** — PDF assinado com estampa automática de autenticidade e QR Code.

## Emissão e gestão de relatórios

- [ ] **PT-057** — Emissão simultânea de vários relatórios pelo mesmo usuário.
- [ ] **PT-058** — Fila de relatórios que continua processando após usuário sair da aplicação e notifica ao concluir.
- [ ] **PT-059** — Impedir emissão duplicada simultânea do mesmo relatório com os mesmos parâmetros.
- [ ] **PT-060** — Lista de relatórios em processamento e notificações de conclusão.
- [ ] **PT-061** — Envio de relatório por e-mail para um ou vários destinatários oriundos do Cadastro Único.
- [ ] **PT-062** — Agendamento de data/hora para envio de relatório por e-mail.
- [ ] **PT-063** — Emissão e assinatura digital de qualquer relatório.
- [ ] **PT-064** — Cópia de relatório emitido armazenada por pelo menos 1 ano, com ID único, filtros, usuário, data/hora e identificação nas páginas.
- [ ] **PT-065** — Serviço no portal para consulta/verificação de autenticidade de relatório emitido.
- [ ] **PT-066** — Consulta de emissões por ID, modelo/layout, usuário, data/hora, parâmetros e opção de impressão.

## Gerador de relatórios

- [ ] **PT-067** — Cadastro reutilizável de formatos de relatórios com página, margens, cabeçalho, rodapé, brasão, paginação, filtros, entidade e marca d’água.
- [ ] **PT-068** — Editor avançado para criação/alteração de relatórios, imagens, agrupamentos, código de barras/QR Code etc.
- [ ] **PT-069** — Criação de novos layouts a partir de cópia de layouts existentes.
- [ ] **PT-070** — Fontes de dados por metadados/modelagem ou instruções SQL.
- [ ] **PT-071** — Acesso aos relatórios gerados pelos menus dos módulos e barra de acesso rápido.
- [ ] **PT-072** — Privilégios específicos para relatórios e consultas gerados.
- [ ] **PT-073** — Versionamento de relatórios e restauração de versão anterior.

## Workflow

- [ ] **PT-074** — Workflow integrado ao mesmo sistema/SGBD, sem necessidade de sistema externo.
- [ ] **PT-075** — Documentação do workflow e relacionamento com documentos digitais/textos jurídicos do Cadastro Único.
- [ ] **PT-076** — Execução automática de funções e carregamento de telas/formulários da solução.
- [ ] **PT-077** — Modelagem de processos em BPMN, incluindo raias, eventos, atividades etc.
- [ ] **PT-078** — Ativação, desativação, homologação e versionamento de processos.
- [ ] **PT-079** — Histórico de alterações do workflow com comparação e restauração.

## LGPD

- [ ] **PT-080** — Gerenciamento de Termos e Condições de Uso para usuários internos e externos, configuráveis por perfil/serviço.
- [ ] **PT-081** — Inventário dos Tratamentos de Dados Pessoais e respectivas hipóteses legais.
- [ ] **PT-082** — Cadastro de tratamentos realizados fora do sistema, digitais ou físicos.
- [ ] **PT-083** — Área do cidadão para transparência ativa dos tratamentos e solicitação de relatório dos usos.
- [ ] **PT-084** — Relatório automático dos relacionamentos/vínculos do cidadão com a entidade.
- [ ] **PT-085** — Verificação de consentimento ativo quando o tratamento exigir consentimento.
- [ ] **PT-086** — Cadastro do Controlador local e publicação dos seus dados no portal.
- [ ] **PT-087** — Cadastro do(s) Encarregado(s) de dados e publicação dos contatos no portal.
- [ ] **PT-088** — Aceite de políticas de uso/cookies no primeiro acesso e registro para auditoria.
- [ ] **PT-089** — WebService para aplicações autorizadas consultarem a existência de consentimento do titular.

## Infraestrutura e segurança do ambiente

- [ ] **PT-090** — Enlace eBGP com no mínimo duas operadoras distintas.
- [ ] **PT-091** — Análise de tráfego/proteção na camada de aplicação contra SQL Injection e Negação de Serviço.
- [ ] **PT-092** — SSL e validação periódica por empresa terceirizada especializada em segurança.
- [ ] **PT-093** — Disponibilização do SGBD e respectivas licenças quando não for software livre.
- [ ] **PT-094** — Disponibilidade mínima de 99,741% e infraestrutura compatível, no mínimo, com Rated-2 ANSI/TIA-942, por certificação ou comprovação técnica equivalente.
- [ ] **PT-095** — Links de internet redundantes.
- [ ] **PT-096** — Fontes de energia redundantes, incluindo concessionária e grupo(s) gerador(es).
- [ ] **PT-097** — Hardware redundante.
- [ ] **PT-098** — Tecnologia de virtualização.
- [ ] **PT-099** — Atualização automatizada, sem interferência do usuário, executada/controlada/auditada conforme exigência do TR, mantendo disponibilidade após atualização.
- [ ] **PT-100** — Atualizações com efeito imediato em todas as estações, ressalvado cache de front-end do navegador.

---

# 6. Checklist de integrações externas efetivamente citadas no Edital/TR

> Regra para o Codex: não criar novas integrações “por boa prática”. Auditar somente as integrações previstas no Edital/TR.

## 6.1 Integrações com comunicação real ou condicionada

- [ ] **INT-001 — Gov.br**
  - Tipo: `REAL / depende de credencial oficial`.
  - Auditar fluxo OAuth/OIDC, callback, vínculo do usuário e tratamento de erros.
  - Se não houver credencial oficial, separar claramente implementação do conector e ambiente de teste.

- [ ] **INT-002 — LDAP**
  - Tipo: `REAL`.
  - Pode ser comprovado com servidor LDAP de teste próprio.
  - Auditar múltiplos servidores, bind, login, grupos/perfis e falhas.

- [ ] **INT-003 — Diretório Nacional de Endereços (DNE/Correios)**
  - Tipo: `REAL / base externa`.
  - Validar configuração, consulta/validação de endereço e atualização da base conforme exigência do TR.

- [ ] **INT-004 — PNCP**
  - Tipo: `REAL / HÍBRIDA`.
  - Auditar publicação/lançamento, consulta e rotinas de arquivo previstas no TR.

- [ ] **INT-005 — Plataforma eletrônica de licitações utilizada pela Administração**
  - Tipo: `REAL CONDICIONAL / HÍBRIDA`.
  - Depende da plataforma e dos meios disponibilizados por ela.
  - Auditar camada de conector configurável, importação de julgamento, participantes, lances, documentos, atas, vencedores, itens/lotes/valores quando previstos.

- [ ] **INT-006 — eSocial**
  - Tipo: `REAL`.
  - Auditar geração, assinatura, envio, protocolo, consulta e processamento dos retornos.
  - Auditar separação Produção x Produção Restrita.
  - Auditar armazenamento dos XMLs de envio/retorno.

- [ ] **INT-007 — WebService bancário**
  - Tipo: `REAL CONDICIONAL`.
  - Depende do banco/convênio do Município.
  - Auditar abstração por provedor, credenciais, envio, retorno, consulta e logs.

- [ ] **INT-008 — PIX tributário**
  - Tipo: `REAL CONDICIONAL`.
  - Depende de convênio bancário.
  - Auditar geração, identificação da cobrança, QR Code, consulta e baixa/retorno quando aplicável ao requisito.

- [ ] **INT-009 — NFS-e por WebService**
  - Tipo: `REAL`.
  - Auditar padrão próprio/ABRASF conforme requisito, XML, lote, protocolo, consulta, retorno, erro e cancelamento.

- [ ] **INT-010 — CADSUS**
  - Tipo: `REAL / depende de credencial`.
  - Auditar pesquisa por CPF e pesquisa avançada conforme requisitos do módulo de Saúde.

- [ ] **INT-011 — e-SUS**
  - Tipo: `REAL`.
  - Auditar geração e envio dos dados e tratamento do retorno previsto no módulo.

- [ ] **INT-012 — RIRA**
  - Tipo: `REAL`.
  - Auditar envio de requisições/listas de espera e retorno/status conforme requisito.

- [ ] **INT-013 — RNDS**
  - Tipo: `REAL / depende de credenciamento`.
  - Auditar payload, autenticação/conector, envio, retorno, logs e rastreabilidade.

- [ ] **INT-014 — BNAFAR**
  - Tipo: `REAL / depende de acesso externo`.
  - Auditar configuração de ambiente/endpoint/credenciais, envio, protocolos, inconsistências, sucessos e consulta dos envios.

## 6.2 Integrações/intercâmbios por arquivo

Nestes casos, o foco de auditoria deve ser geração/importação/exportação do arquivo no leiaute requerido, histórico, validação e rastreabilidade.

- [ ] **INT-015 — TCE-PR / SIM-AM**
- [ ] **INT-016 — FNDE / SIOPE**
- [ ] **INT-017 — FNS / SIOPS**
- [ ] **INT-018 — STN / MSC**
- [ ] **INT-019 — Receita Federal / REINF**
- [ ] **INT-020 — DIRF**
- [ ] **INT-021 — SEFIP/GFIP**
- [ ] **INT-022 — MANAD**
- [ ] **INT-023 — arquivos de Tribunal de Contas previstos no módulo**
- [ ] **INT-024 — Simples Nacional / arquivos da Receita**
- [ ] **INT-025 — PGDAS-D**
- [ ] **INT-026 — DES-IF padrão ABRASF**
- [ ] **INT-027 — ESTBAN / Banco Central**
- [ ] **INT-028 — dados de administradoras/operadoras de cartão**
- [ ] **INT-029 — TSE**
- [ ] **INT-030 — INSS / informações de alvarás**
- [ ] **INT-031 — SIGTAP**
- [ ] **INT-032 — CNES por XML**
- [ ] **INT-033 — BPA Magnético**
- [ ] **INT-034 — APAC / SIASUS**
- [ ] **INT-035 — AIH / SIH-SUS**
- [ ] **INT-036 — RAAS**

### Regra para integração simulada na auditoria

Quando depender de credencial que somente o Município/órgão externo possa fornecer:

1. Não marcar como `INTEGRAÇÃO_REAL`.
2. Verificar se há:
   - conector desacoplado;
   - configuração de endpoint;
   - autenticação configurável;
   - geração de payload/arquivo válido;
   - envio para ambiente externo de homologação;
   - tratamento de resposta;
   - protocolo;
   - logs;
   - retry;
   - auditoria.
3. Classificar como `HOMOLOGAÇÃO` ou `SIMULADO_POC`.
4. O relatório deve explicar exatamente o que falta para produção oficial:
   - credencial;
   - certificado;
   - convênio;
   - client_id/client_secret;
   - CNES;
   - endpoint;
   - autorização do órgão;
   - cadastro institucional.

---

# 7. SEGUNDA ETAPA — Módulos do Executivo

Referência oficial: **item 10.37 do Termo de Referência**.

> **IMPORTANTE PARA O CODEX:** o checklist abaixo contém os módulos. Para cada módulo, o Codex deve extrair do PDF oficial **todos os requisitos numerados daquele módulo**, sem resumir nem omitir, e criar uma subseção no relatório com o cálculo do percentual.

- [ ] **EXE-01 — Planejamento e Orçamento**
- [ ] **EXE-02 — Gestão Contábil e Financeira**
- [ ] **EXE-03 — Gestão de Controle Interno**
- [ ] **EXE-04 — Gestão e Controle de Custos**
- [ ] **EXE-05 — Gestão de Compras e Licitações**
- [ ] **EXE-06 — Gestão de Almoxarifado**
- [ ] **EXE-07 — Gestão de Patrimônio**
- [ ] **EXE-08 — Gestão de Frota**
- [ ] **EXE-09 — Gestão de Folha de Pagamento**
- [ ] **EXE-10 — Segurança e Medicina do Trabalho**
- [ ] **EXE-11 — Gestão eSocial**
- [ ] **EXE-12 — Gestão de IPTU**
- [ ] **EXE-13 — Gestão de ISS**
- [ ] **EXE-14 — Gestão de ITBI**
- [ ] **EXE-15 — Gestão de Receitas Diversas**
- [ ] **EXE-16 — Gestão de Arrecadação**
- [ ] **EXE-17 — Gestão de Dívida Ativa**
- [ ] **EXE-18 — Gestão da Construção Civil**
- [ ] **EXE-19 — Protocolo e Processo Digital**
- [ ] **EXE-20 — Gestão de Serviços Públicos**
- [ ] **EXE-21 — Aplicativo (APP) Mobile**
- [ ] **EXE-22 — Portal de Autoatendimento**
- [ ] **EXE-23 — Portal da Transparência**
- [ ] **EXE-24 — Nota Fiscal Eletrônica**
- [ ] **EXE-25 — Gestão e Escrita Fiscal**
- [ ] **EXE-26 — Gestão e Fiscalização Fazendária**
- [ ] **EXE-27 — Gestão de Cemitérios**
- [ ] **EXE-28 — Gestão da Saúde**
- [ ] **EXE-29 — Gestão de Faturamento da Saúde**
- [ ] **EXE-30 — Gestão da Atenção Primária**
- [ ] **EXE-31 — Assistência à Saúde**
- [ ] **EXE-32 — Assistência Farmacêutica**
- [ ] **EXE-33 — Central de Regulação**
- [ ] **EXE-34 — Gestão da Assistência Social**

## 7.1 Organização funcional aprovada para a POC

> A posição no menu não altera a avaliação: cada módulo abaixo continua com checklist, evidências e percentual próprios.

| Módulo avaliado | Requisitos | Mínimo de 90% | Organização no produto |
|---|---:|---:|---|
| EXE-04 — Gestão e Controle de Custos | 31 | 28 | Área funcional própria dentro de Financeiro e Contábil, sem cartão separado no Dashboard |
| EXE-10 — Segurança e Medicina do Trabalho | 74 | 67 | Área funcional própria dentro de RH e Folha, sem cartão separado no Dashboard |
| EXE-11 — Gestão eSocial | 20 | 18 | Área funcional própria dentro de RH e Folha, sem cartão separado no Dashboard |
| EXE-18 — Gestão da Construção Civil | Auditar checklist específico | Calcular após auditoria | Área própria dentro de Obras e Serviços Públicos, integrada aos cadastros imobiliário e tributário |
| EXE-21 — Aplicativo (APP) Mobile | 73 | 66 | Aplicativo para iOS e Android consumindo os mesmos serviços do Portal de Autoatendimento |
| EXE-22 — Portal de Autoatendimento | 119 | 108 | Portal externo unificado para cidadão/contribuinte, fornecedor/credor e funcionário |
| EXE-29 — Gestão de Faturamento da Saúde | Auditar checklist específico | Calcular após auditoria | Área própria dentro de Saúde |

Decisões de navegação:

- Business Intelligence fica em Administração.
- Gestão de Custos fica em Financeiro e Contábil.
- Segurança e Medicina do Trabalho e eSocial ficam em RH e Folha, não em Saúde ou Assistência Social.
- Gestão da Construção Civil fica em Obras e Serviços Públicos, mantendo integração com Tributário.
- O Portal do Servidor é mantido como acesso do funcionário aos serviços exigidos pelo Portal de Autoatendimento.
- Gestão da Saúde, Faturamento da Saúde, Atenção Primária, Assistência à Saúde, Assistência Farmacêutica e Central de Regulação compartilham o cartão Saúde, mas serão auditados separadamente.
- IPTU, ISS, ITBI, Receitas Diversas, Arrecadação, Dívida Ativa, NFS-e, Escrita Fiscal, Fiscalização Fazendária e Cemitérios compartilham o cartão Tributário, mas serão auditados separadamente.
- Educação, Cultura e Lazer, Água e Saneamento e Segurança e Mobilidade ficam desativados e ocultos nesta instância.
- Meio Ambiente não integra o catálogo visual desta instância.

## Para cada módulo do Executivo

O Codex deverá gerar:

```md
## EXE-XX — Nome do módulo

Total de requisitos no edital: N
Mínimo necessário para 90%: ceil(N * 0.90)
Máximo de "Não Atende": N - ceil(N * 0.90)

| Item | Texto do requisito | Status | Evidência | Gap | Prioridade |
|---|---|---|---|---|---|
```

E ao final:

```text
ATENDE: X
PARCIAL: Y
NÃO ATENDE: Z
NÃO VERIFICADO: W

Percentual comprovado hoje: X / N
Percentual conservador: ...
Situação: APTO / RISCO / ABAIXO DE 90%
```

---

# 8. SEGUNDA ETAPA — Módulos do Legislativo

Referência oficial: **item 10.38 do Termo de Referência**.

- [ ] **LEG-01 — Planejamento e Orçamento**
- [ ] **LEG-02 — Gestão Contábil e Financeira**
- [ ] **LEG-03 — Gestão de eSocial**
- [ ] **LEG-04 — Portal da Transparência**
- [ ] **LEG-05 — Gestão de Compras e Licitações**
- [ ] **LEG-06 — Gestão de Controle de Protocolo**
- [ ] **LEG-07 — Gestão de Patrimônio**
- [ ] **LEG-08 — Gestão de Folha de Pagamento**
- [ ] **LEG-09 — Gestão de Legislação**
- [ ] **LEG-10 — Ouvidoria / Acesso à Informação / e-SIC**

> Aplicar exatamente o mesmo cálculo individual de 90% de cada módulo.

---

# 9. Pontos que o Codex deve procurar transversalmente em todos os módulos

Não basta encontrar uma tela com o nome do módulo. Verificar em cada requisito:

- [ ] Persistência real no banco.
- [ ] Inclusão.
- [ ] Alteração.
- [ ] Exclusão, quando cabível.
- [ ] Consulta.
- [ ] Filtros.
- [ ] Relatórios.
- [ ] Impressão/exportação quando exigidas.
- [ ] Permissões/perfis.
- [ ] Multi-entidade quando previsto.
- [ ] Histórico.
- [ ] Auditoria/log.
- [ ] Anexos/documentos.
- [ ] Assinatura digital quando prevista.
- [ ] Workflow quando previsto.
- [ ] Integração entre módulos.
- [ ] Validações legais.
- [ ] Cálculos automatizados.
- [ ] Fechamentos/competências.
- [ ] Geração/importação/exportação de arquivos.
- [ ] Integrações externas.
- [ ] Tratamento de erro.
- [ ] Mensagens de sucesso/erro.
- [ ] Navegabilidade 100% web.
- [ ] Fluxo demonstrável com dados de POC.

---

# 10. Regra de evidência para a POC

Para cada requisito classificado como `ATENDE`, o relatório deve incluir **como demonstrá-lo presencialmente**.

Exemplo:

```md
### EXE-05.XX — Publicação/integração do processo de contratação

Status: ATENDE

Evidência técnica:
- src/...
- src/services/...
- tabela ...

Roteiro POC:
1. Abrir ...
2. Cadastrar ...
3. Processar ...
4. Mostrar ...
5. Abrir histórico/log ...
6. Mostrar retorno ...

Dados de teste:
- processo ...
- fornecedor ...
- item ...

Resultado esperado:
- ...
```

---

# 11. Priorização dos gaps

Classificar cada gap:

## P0 — bloqueador

- item necessário para atingir 90%;
- módulo abaixo de 90%;
- requisito tecnológico comum a toda solução;
- falha que impede a demonstração;
- autenticação;
- segurança;
- persistência;
- cálculo principal;
- integração obrigatória;
- fluxo crítico de folha, contabilidade, tributação ou saúde.

## P1 — alta

- eleva margem acima dos 90%;
- funcionalidade demonstrável com implementação curta;
- requisito repetido em vários módulos;
- relatório/exportação;
- integração por arquivo;
- auditoria/log.

## P2 — média

- melhoria que aumenta segurança do percentual;
- configuração;
- UX necessária para demonstrar com clareza;
- dados de teste.

## P3 — pós-POC

- pode compor os até 10% de “Não Atende” sem colocar o módulo abaixo de 90%;
- desde que não seja requisito estrutural necessário para outros fluxos.

---

# 12. Ordem recomendada da auditoria

1. `PT-001` a `PT-100`.
2. Calcular percentual tecnológico atual.
3. Identificar os **10 itens tecnológicos que, se necessário, poderiam permanecer fora da POC** sem derrubar o percentual.
4. Auditar módulos com maior risco:
   - Contábil/Financeiro;
   - Folha;
   - eSocial;
   - Tributário;
   - NFS-e;
   - Saúde;
   - Compras/Licitações;
   - Transparência.
5. Auditar os demais módulos do Executivo.
6. Auditar os módulos do Legislativo.
7. Auditar integrações externas.
8. Montar plano de implementação por P0/P1/P2/P3.
9. Montar roteiro de demonstração.
10. Montar massa de dados da POC.

---

# 13. Resultado esperado do Codex ao final

Entregar um resumo com este formato:

```md
# Resultado da Auditoria POC Ibema

## Padrão Tecnológico e Segurança
- Total: 100
- Atende: __
- Parcial: __
- Não atende: __
- Percentual conservador: __%
- Situação: APTO / RISCO / REPROVA HOJE

## Módulos abaixo de 90%
1. ...
2. ...

## Módulos entre 90% e 94%
1. ...
2. ...

## Módulos >= 95%
1. ...
2. ...

## Integrações
- Reais prontas:
- Homologação prontas:
- Simuladas para POC:
- Dependentes de credencial municipal:
- Ausentes:

## Gaps P0
1. ...

## Gaps P1
1. ...

## Gaps P2
1. ...

## Sugestão de ordem de implementação
1. ...
2. ...
3. ...

## Riscos para a POC
1. ...

## Dependências que precisam ser solicitadas ao Município
1. ...
```

---

# 14. Restrições importantes

- Não excluir funcionalidades existentes para “simplificar”.
- Não alterar regras existentes sem verificar impacto em outros módulos.
- Não migrar stack/ORM/framework durante a preparação da POC.
- Não transformar integrações reais existentes em mocks.
- Não ocultar que uma integração está em homologação/simulação.
- Não inserir requisito que não esteja no Edital/TR.
- Não considerar uma funcionalidade pronta apenas por existir componente visual.
- Não estimar 90% global: o cálculo é individual por módulo.
- Não esquecer que `PARCIAL` será tratado como `NÃO ATENDE` pela Comissão.
- Não iniciar implementação antes de gerar o relatório de auditoria inicial.

---

# 15. Referências dentro do PDF oficial

Usar como fonte de verdade:

- **Item 10 — Da Prova de Conceito:** regras de realização e avaliação.
- **Item 10.36 — Requisitos de Padrão Tecnológico e Segurança:** 100 itens.
- **Item 10.37 — Requisitos Funcionais dos Módulos Executivo:** checklist funcional completo.
- **Item 10.38 — Requisitos Funcionais dos Módulos Legislativo:** checklist funcional completo.
- Demais partes do Termo de Referência apenas para interpretar o requisito quando necessário.

> Se houver divergência entre este arquivo e o PDF oficial, **prevalece sempre o PDF oficial**.
