# Execução da sequência final — 13/10/2026

## Estado verificável

Plano registrado em `docs/PLANO_FINAL_IMPLANTACAO_MODULOS_INTEGRADOS.md`, vinculado ao plano consolidado original. Criada fila separada `CONTROLE_IMPLANTACAO_FINAL.json`, com 1.052 IDs distintos nos 15 checklists. A matriz histórica de requisitos permaneceu intacta. A fila não é evidência de atendimento e suas fases iniciais vieram do diagnóstico histórico.

Comando executado: `node scripts/prepare-final-implementation-plan.mjs --write`. Apenas leu a baseline e criou a nova fila; não acessa banco nem verifica código de domínio. Resultado: 1.052 requisitos, distribuídos em EXE-01/LEG-01 (99 cada), EXE-02/LEG-02 (189 cada), EXE-03 (36), EXE-04 (31), EXE-12 (30), EXE-13 (41), EXE-14 (26), EXE-15 (9), EXE-16 (56), EXE-17 (28), EXE-24 (59), EXE-25 (65), EXE-26 (95).

## Implementação local em revisão

### Frente 02 — dimensões e adoção

- Redistribuições agora resolvem a fonte por linha a partir de decisão versionada `redistributionDebitSource` na adoção da conta. Não escolhem fonte pelo prefixo da conta. Exigem as duas fontes distintas e validam o ente/UG da receita; decisão ausente recusa a partida municipal.
- Snapshot captura as naturezas de despesa/receita aplicáveis, programa, ação e função/subfunção quando vinculados explicitamente à linha de Planejamento. Ausência não é preenchida com códigos presumidos; layout MSC continua pendente.
- Consumo patrimonial e retenção consultam a fonte documentada da liquidação/pagamento. Cadeia de devolução/estorno de material é percorrida com recusa de ciclo e validação de ente/UG.
- Arrecadação consulta primeiro `Revenue.id`, que é a origem das partidas financeiras; não confunde esse identificador com o `sourceId` setorial da receita. Escopo informado é reconferido com a UG canônica, inclusive na arrecadação tributária.
- Estornos com `reversalOfId` seguem a fonte congelada da contraparte original de cada conta, preservando também suas memórias anteriores. Fontes distintas na mesma conta sem identificação de linha são recusadas.
- Tela de adoção troca a digitação de JSON por destinos canônicos pesquisáveis e paginados, edição predecessora e fonte do débito nas redistribuições. Grava as entradas selecionadas da página em edição preservada. Consulta de predecessoras limita ente/UG às permissões; servidor reconfere vigência e conflitos.
- UG vazia no formulário de adoção representa edição do ente, como previsto pelo serviço.
- Regression preparada em `tests/municipal-catalog-adoption-postgres.test.ts`: de-para pesquisável, predecessor, snapshot por fonte/linha, recusa de configuração ausente e rollback.

### Frentes 05/07 — consumo e devolução entre exercícios

- Consumo reconhece custo no exercício da data do movimento do mesmo ente; preserva o exercício da aquisição na memória documental.
- Redução e correção identificam exercícios de origem/reconhecimento, exigem exercício e competência correntes abertos e mantêm fonte/valor histórico. Replay conferido não reinsere fato mesmo após encerramento; novo fato exige período aberto.
- Redução serializa a origem e repete a verificação de replay após lock; teto líquido e apropriações continuam impedindo devolução excedente.
- Consulta, página e PDF/CSV mostram correções de origens anteriores no período corrente, mantendo sua identificação. Essas linhas não são somadas aos totais das origens adquiridas no exercício.
- Regression preparada em `tests/material-consumption-costs.test.ts`: origem encerrada, destino temporal ausente, competência fechada, identificação corrente, preservação Decimal e replay após encerramento.
- Incorporação local da correção de tipagem do normalizador de JSON apontada pelo commit remoto `e513831`. Isto não representa merge do commit.

### Frente 03 — redistribuição financeira

- Replay consulta autorização da receita antes de retornar, após serializar a origem. Recusa conteúdo divergente na mesma chave.
- Redistribuição não antecede arrecadação; exercício/escopo usam UG canônica da receita, com conferência da UG bancária quando presente.

## Pendências da retomada

Continuam abertas a revisão individual integral, integração dos demais produtores/leitores, composição MSC completa e as frentes 03–10 do plano. As regressões acima estão preparadas, ainda não executadas. Nenhum Prisma, migration, lint, suíte ou build foi executado nesta retomada, conforme a sequência de verificações agrupadas solicitada. Banco municipal não foi modificado por estes trabalhos.

Integração remota, deploy e commit final continuam pendentes. Nenhum requisito foi promovido a atendimento nem qualquer fase declarada concluída.

### Inspeção adicional de identidades

- A verificação da página de Qualidade passou a examinar PF/PJ, papéis contribuinte/fornecedor/credor, documento normalizado repetido, tipo divergente, documento do credor e identidade do fornecedor vinculado. Achados são individuais, sem documento pessoal no texto e sem alteração dos cadastros.
- Executado `npx tsx scripts/inspect-canonical-identities.ts` em 13/10/2026 às 19:22:11 UTC. A transação usou `SET TRANSACTION READ ONLY` e isolamento `RepeatableRead`; resultado: nenhum achado nessas cadeias presentes. Esta leitura não comprova regressões do comando de reconciliação nem aceite por ente.
- Preparada `tests/identity-integrity-postgres.test.ts` com conflitos concretos, preservação dos registros e ausência de documentos pessoais na saída. Ainda não executada.

## Retomada após solicitação de concluir desenvolvimento

- Introduzido vínculo explícito `AccountingLine.originalEntryId` para estornos em contas com múltiplas fontes. Referência conferida contra transação, conta e natureza oposta; replay compara a referência preservada. Memória sem catálogo conciliado conserva o vínculo sem certificar classificação.
- Integrados individualmente os produtores de estorno: restituição/compensação/excedente tributário, valorização patrimonial, provisões de RH, prestação/concessão/reabertura de adiantamento, restituição de despesa de diária/adiantamento e anulação integral de empenho. Contratos de retorno e erro das funções foram preservados.
- Diagnóstico de fornecedores recusa identidade ausente/dupla e contribuinte duplicado ou incompatível, em vez de escolher o primeiro cadastro encontrado.
- Regressão de de-para ampliada para vínculo explícito, replay e recusa de referência de linha trocada. Ainda não executada.
- Responsável definiu **Emissor Público Nacional** para NFS-e e autorizou perfis bancários exemplificativos enquanto bancos definitivos não forem escolhidos. Fontes oficiais, ambientes e dependências estão em `DECISOES_NFSE_NACIONAL_E_BANCOS.md`.
- Migrations, lint, regressões, build, integração remota e commit final permanecem pendentes; esta retomada não encerra desenvolvimento nem requisitos.
