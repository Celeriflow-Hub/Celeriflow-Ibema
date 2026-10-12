# Fontes oficiais de classificação preservadas

Consulta/download realizados em 12/10/2026. Os arquivos foram obtidos dos sites oficiais e preservados sem alteração. **As três fontes municipais foram importadas no registro versionado do banco como DRAFT, com de-para pendente; não foram homologadas como matriz local.** A referência estadual SEI-CED permanece apenas como arquivo preservado. Evidências da aplicação/reaplicação: `../CATALOGOS_OFICIAIS_P1.json` e `../EXECUCAO_P1_P4_BLOCO_INTEGRADO.md`.

## Classificações municipais — SIM-AM/TCE-PR

Página de origem: https://www.tce.pr.gov.br/para-o-fiscalizado/sistemas/sim-sistema-de-informacoes-municipais/plano-de-contas.htm

| Arquivo local | Versão publicada na página | SHA-256 |
|---|---|---|
| `PCASPM_PR_2026_v1.0d.xlsx` | PCASPM-PR 2026 Estendido, 1.0d, 24/03/2026 | `824d3dc03ad3f2d40abdbb10b2e2c5a30b590854af974be0a403fb12349d851a` |
| `PC_RECEITA_PR_2026_v1.0e.xlsx` | Receita PR 2026, 1.0e, 09/10/2026 | `2ee071dfb6ecf33462ff4ea047445dd1122786c735bb46ac0b8008952b501e97` |
| `PC_DESPESA_PR_2026_v1.0h.xlsx` | Despesa PR 2026, 1.0h, 05/08/2026 | `e98bff8e02c48e92c762ab425d64d219849754e4dab34f4be491dfa7f3ef4ecb` |

URLs dos bytes originais:

- PCASPM: https://www.tce.pr.gov.br/data/files/CE/34/27/C1/9622D91078C712D9026B6394/PCASPM-PR_2026%20-%20Estendido%20-%20Versao%201.0d%20-%20Publicada%20em%2024-03-2026.xlsx
- Receita: https://www.tce.pr.gov.br/data/files/01/92/CF/84/AB121A1070DFB01A026B6394/PC%20-%20RECEITA%20-%20PR%20-%202026%20-%20Versao%201.0e%20-%20publicada_em_09_10_2026.xlsx
- Despesa: https://www.tce.pr.gov.br/data/files/FB/51/77/E4/6C3DF910CC75DCF9026B6394/PC%20-%20DESPESA%20-%20PR%20-%202026%20-%20Versao%201.0h%20-%20publicada_em_05_08_2026.xlsx

### Inspeção inicial e cuidados de importação

- O PCASPM contém abas históricas e de trabalho, além da `PCASP-TCE-PR-2026`. A primeira aba é `PC 2025-8698`; **não importar a primeira aba por posição**. A aba corrente apresenta dimensões do código, ano, natureza do saldo, escrituração e natureza da informação. Confirmar a versão aplicável por linha.
- Receita também contém abas históricas. A candidata corrente é `Plano Receita 2026`, não a primeira aba de portarias.
- Despesa contém `PC Desp-2026` e abas de MSC de 2025 e 2026. O cabeçalho corrente está na linha 7 e distingue `Nível (S/A)`; a planilha inclui notas e linhas vazias, portanto contagem física não equivale à quantidade de contas.
- A página/URL da despesa indica publicação em **05/08/2026**; o texto interno da aba corrente indica **06/08/2026**. Preservar a divergência e conferir a vigência, sem escolher uma data silenciosamente.
- As notas da aba `MSC-2026` explicitam que o rol não constitui ementário da despesa e que classificações genéricas não devem ser utilizadas na execução. Preservar os conceitos ao elaborar o de-para.
- A leitura completa em memória das três planilhas ultrapassou o heap padrão de 2 GB do Node. A leitura da despesa por streaming, ignorando estilos, concluiu corretamente. O importador deverá usar streaming e seleção explícita das abas.

## Referência estadual distinta — SEI-CED

`PCASP_PR_2026_v1.0a.xlsx`, SHA-256 `9a1281f36eee34895210468b36ec0311a6b5d1e42759ca1908c9c9fd2138feee`.

- Página: https://www.tce.pr.gov.br/fiscalizado/detalhes-documentos/pcasp-padrao-pr-2026-versao1-0a-publicado-em-14-01-2026-xlsx.htm
- Bytes: https://www.tce.pr.gov.br/lumis/portal/file/fileDownload.jsp?fileId=4936B6209B7EF841019BCBEEE56748D1&inline=1
- O cabeçalho informa **PCASP Padrão-PR 2026 — SEI-CED**. Foi a primeira referência localizada; deve permanecer separada do PCASPM municipal e não substituir automaticamente a classificação de Prefeitura/Câmara.

## Referência federal — STN

Página conferida: https://www.gov.br/tesouronacional/pt-br/contabilidade-e-custos/federacao/plano-de-contas-aplicado-ao-setor-publico-pcasp-1

Ela apresenta PCASP Federação/Estendido 2026 e 2027, com acesso ao SIGECONF e portarias específicas. Desde 2025, Federação/Estendido compartilham um arquivo Excel e a página orienta separação pela coluna L. A página inclui um link malformado para a Portaria 3.133/2025: localizar a publicação normativa original antes de usar esse link como evidência.

## Próximo bloco P1 de classificações

Selecionar as abas/linhas vigentes, preservar códigos textuais e origem por linha, criar versões e de-para aos IDs canônicos, validar analítico/sintético e D/C pelos atributos explícitos, definir dimensões de fonte/MSC e matriz de eventos local. Agrupar a mudança de schema necessária e validar o bloco somente depois de completá-lo. A posse de um catálogo oficial não comprova sua adoção local nem os saldos da entidade.
