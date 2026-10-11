# RH — políticas operacionais preparadas

Configure regras JSON em **RH > Parametrizações**, dentro do conjunto do regime. Os exemplos são formatos; substitua IDs, fundamentos e valores por dados reais. Conjunto ativo e vigência não substituem homologação oficial.

## Horas extras reconhecidas (categoria CALCULO)

```json
{
  "origin": "HORAS_EXTRAS_PONTO",
  "rubricCode": "HORAS_EXTRAS",
  "additionalRate": "50",
  "legalReference": "Identificação da norma/ato aprovado"
}
```

A rubrica precisa ser PROVENTO/MANUAL. A operação em `/rh/operacoes`, aba movimentos, usa as horas extras explicitamente reconhecidas em `/rh/ponto`, não a diferença dos horários. Por dia: salário temporal ÷ jornada mensal × horas reconhecidas × (1 + adicional/100), arredondado HALF_UP em centavos. A configuração precisa cobrir a competência inteira. A origem de cada registro é única entre vínculos; correções posteriores exigem movimentos compensatórios.

## Médias de remuneração (categoria CALCULO)

```json
{
  "origin": "MEDIA_REMUNERACOES",
  "rubricCodes": ["SALARIO", "HORAS_EXTRAS"],
  "highestPercent": "80",
  "selectionRounding": "CEIL",
  "missingMonths": "BLOQUEAR",
  "method": "NOMINAL",
  "legalReference": "Identificação da norma aplicável"
}
```

Consulta: `/rh/operacoes/medias`. Seleciona folhas mensais oficiais fechadas no escopo da regra e na UG acessível ao operador. A política escolhe as rubricas de provento e como tratar meses sem histórico (`ZERO` ou `BLOQUEAR`). `FLOOR`/`CEIL` determinam o arredondamento da quantidade selecionada. Método `ATUALIZADA` exige `indexationFactors` com fator positivo para **cada** competência, por exemplo `{"10/2026":"1.005"}`. Exibe memória e versões de origem; não concede benefício ou aposentadoria.

## Recadastramento (categoria PORTAL)

```json
{
  "origin": "CAMPANHA_RECADASTRAMENTO",
  "startsAt": "2026-11-01T00:00:00.000Z",
  "endsAt": "2026-11-30T23:59:59.000Z",
  "employeeIds": ["ID_EMPLOYEE"],
  "fields": ["email", "phonePrimary", "whatsapp"],
  "instructions": "Confira e proponha a atualização dos contatos."
}
```

Campos permitidos: email, phonePrimary, phoneSecondary, whatsapp, maritalStatus, profession, educationLevel. O Portal identifica o titular pela sessão, aceita apenas os campos habilitados e registra uma proposta por campanha/titular. RH acompanha convocados/respostas em `/rh/recadastramento` e confere o diff em `/rh/solicitacoes`. Deferimento atualiza `Person`, projeção de contato em `Employee`, decisão e auditoria na mesma transação. Dados centrais alterados depois da proposta bloqueiam o deferimento para revisão do conflito. Alterar uma campanha não apaga as respostas nem a política preservada em cada proposta.

## Solicitações de despesa no Financeiro (categoria CALCULO)

```json
{
  "origin": "FOLHA_SOLICITACOES_DESPESA",
  "legalReference": "Ato de classificação da folha",
  "mappings": [{
    "costCenterId": null,
    "gross": {
      "appropriationId": "ID_DOTACAO",
      "supplierId": "ID_CREDOR_REMUNERACAO",
      "secretariatId": "ID_SECRETARIA"
    },
    "employer": {
      "appropriationId": "ID_DOTACAO_ENCARGOS",
      "supplierId": "ID_CREDOR_ENCARGOS",
      "secretariatId": "ID_SECRETARIA"
    }
  }]
}
```

Configure um mapeamento para cada centro presente no snapshot; `null` significa ausência de centro, não curinga. O credor reutiliza `Supplier` do Financeiro. Encargos não nulos exigem classificação própria. A conferência do cálculo fechado oferece prévia e aplicação; aplicação exige produção com parâmetros oficiais aprovados, permissão RH/update e Financeiro/create e acesso à UG de cada dotação. A criação usa `createExpenseRequest`, inclusive seus controles de exercício e origem.

O plano fica preservado antes dos lançamentos. Falha parcial deixa `AGUARDANDO_RETRY`; repetir a mesma operação completa os passos faltantes sem duplicação. Mudar data/regra de um plano preparado é rejeitado. As solicitações geradas seguem os fluxos nativos de aprovação/reserva/empenho/liquidação/pagamento. Retenções, repasses, classificação por fonte/natureza além do agrupamento disponível e compensações de folha continuam requerendo desenvolvimento próprio.

## Cenários de folhas especiais (categoria CALCULO)

```json
{
  "origin": "SIMULACAO_FOLHA_ESPECIAL",
  "payrollType": "13º",
  "rubricCodes": ["DECIMO_CENARIO"],
  "inputNames": ["AVOS"],
  "legalReference": "Política sintética para conferência",
  "premises": "Avos informados e conferidos; sem tributação automática."
}
```

Uma rubrica FORMULA_CONTROLADA pode usar `SALARIO_BASE * AVOS / 12`. Parâmetros no formulário:

```json
{"AVOS":{"value":"6","sourceReference":"Documento/memória da apuração"}}
```

Em `/rh/operacoes`, aba cálculos, selecione uma folha de tipo especial, contratos, regra, dias explícitos e escopo. O conjunto e a política precisam corresponder à competência/tipo. A simulação persiste totais, rubricas, fontes e premissas; permite memória/PDF e replay. Ela **não está apta ao fechamento oficial**: não apura automaticamente IRRF/previdência por bases especiais, avos, RRA, rescisão, desligamento ou baixa de direitos. Esses fluxos continuam no plano de desenvolvimento.

## Temporalidade e reajuste coletivo

Cadastro inicial preserva admissão; alterações exigem data de vigência e versão esperada. Revisões futuras não reescrevem demonstrativos anteriores. Mudança no meio da competência é bloqueada no cálculo mensal até o rateio temporal estar implementado. Transições de regime em aquisitivos exigem política própria; programação de férias verifica vínculo e vigência da política durante a reserva.

Reajuste coletivo: informe chave estável, IDs dos contratos, vigência, percentual assinado e fundamento. Faça PREVIA, confira valores e copie o hash para APLICAR mantendo os mesmos parâmetros. Alteração concorrente invalida a prévia. Falha em qualquer contrato reverte o lote inteiro; repetir um lote aplicado preserva as revisões existentes.

## Margem consignável (categoria CONSIGNACAO)

Crie uma regra ativa com código **MARGEM_CONSIGNAVEL** no conjunto do regime:

```json
{
  "origin": "MARGEM_CONSIGNAVEL",
  "remunerationRubricCodes": ["SALARIO"],
  "compulsoryDeductionRubricCodes": ["PREVIDENCIA_RGPS", "IRRF"],
  "consignmentRubricCodes": ["CONSIGNADO"],
  "legalReference": "Norma municipal/convênio que define a base e o limite"
}
```

Informe também `maxConsignmentMarginRate` na **política de cálculo** do mesmo conjunto. Nenhum percentual, base ou código é escolhido pelo nome da verba. Os códigos do exemplo precisam ser substituídos pelos efetivamente calculados no conjunto: cada código deve existir nos itens de todos os vínculos apurados, ter tipo compatível e pertencer a apenas uma finalidade. Os descontos consignados podem ser lançados como movimentos nas rubricas de desconto autorizadas; o controle examina também verbas calculadas por fórmula.

Apuração por pessoa física, dentro da execução mensal:

1. Somar as rubricas de remuneração dos vínculos selecionados.
2. Subtrair os descontos obrigatórios configurados, limitando a base mínima a zero.
3. Aplicar o percentual máximo sobre a base agregada, arredondando HALF_UP para centavos uma única vez.
4. Subtrair os descontos consignados apurados. Excesso bloqueia tanto simulação quanto cálculo oficial antes de persistir a execução.

O motor exige a seleção de todos os vínculos da PF. Todos os demonstrativos dessa PF preservam a mesma memória agregada: o limite **não se multiplica pelo número de contratos**. Conferência disponível em `/rh/operacoes/demonstrativos/[id]`, no PDF e em `/portal-servidor/margem`. O Portal respeita titularidade, liberação, revogação e fechamento; a lista mostra um registro por execução, com filtro e páginas de 20.

A consulta é histórica, calculada na versão da folha. Alterar a política posteriormente não modifica a memória anterior. Versões antigas sem memória não recebem valores retroativamente. O cronograma interno de reservas e parcelas está disponível conforme abaixo; submargens por produto e integração com consignatárias continuam pendentes. A consulta não autoriza crédito.

## Contratos e cronogramas consignados

Regra ativa JSON na categoria CONSIGNACAO, no mesmo conjunto da referência mensal:

```json
{
  "origin": "CONSIGNACAO_CONTRATOS",
  "maxInstallments": 60,
  "referenceValidityMonths": 3,
  "supplierIds": ["ID_FORNECEDOR_CREDOR_CONSIGNATARIA"],
  "legalReference": "Convênio e autorização aplicáveis"
}
```

Operação: `/rh/consignacoes`. Informe chave estável, vínculo de alocação, consignatária central, número do contrato, regra, cálculo oficial fechado mais recente do titular, rubrica, primeira competência, quantidade/valor de parcelas iguais e fundamento. A primeira competência deve ser posterior à referência e respeitar o prazo da política. O conjunto deve cobrir todo o cronograma e corresponder ao vínculo e ao escopo. Produção exige conjunto oficial aprovado.

O serviço reserva cada competência na mesma transação do contrato/cronograma. As reservas de todos os vínculos do titular compartilham o limite. A ocupação é o total reservado na competência mais o consignado não gerenciado da referência. Parcelas gerenciadas identificadas pelos movimentos da referência não são deduzidas novamente. A referência é uma base conservadora; o cálculo mensal real continua conferindo a margem com a remuneração efetivamente apurada e pode bloquear descontos diante de redução salarial.

Antes de calcular a competência, gere os movimentos das parcelas reservadas, selecionando a folha mensal correspondente. Cada parcela tem uma origem única. Reservas pendentes bloqueiam cálculo/fechamento. Parcelas não lançadas podem ser canceladas com motivo, liberando a reserva por entrada compensatória; reserva e autorização anteriores permanecem imutáveis. Parcelas lançadas/competências fechadas exigem conciliação própria.

O número do contrato é único por credor/vínculo/escopo, mesmo se outra chave de origem for informada. Repetir a chave com os mesmos dados retorna o cronograma existente; modificar os dados é rejeitado. Mudanças/renegociações não reescrevem o contrato e requerem fluxo próprio, ainda pendente.

O titular consulta `/portal-servidor/consignacoes` após liberação da folha de referência. Consulta mostra reservas, parcelas lançadas e canceladas. O lançamento na folha não comprova repasse ao credor. Submargens por produto, parcelas variáveis, portabilidade, quitação financeira e transmissão a consignatárias continuam pendentes.

Implantação dirigida:

```powershell
npx tsx scripts/deploy-hr-migrations.ts --consignments
npx tsx scripts/deploy-hr-migrations.ts --consignments --apply
```

Esse comando aplica apenas a migration de consignações; requer a foundation e a migration temporal previamente implantadas.

## Dependentes, elegibilidade e salário-família

Em `/rh/dependentes`, selecione a pessoa física central. CPF/nascimento/nome não são escritos como fonte independente no RH. As flags indicam candidatura, não direito confirmado. Documentos pertencem à pessoa central; o GED/cadastro existente mantém tipo, status e validade.

Regra `DEPENDENTES_IRRF` (categoria CALCULO), JSON:

```json
{
  "relationships": [{"relationship":"Filho(a)","maxAgeYears":21}],
  "requiredDocumentTypes": ["COMPROVANTE_DEPENDENCIA"],
  "acceptedDocumentStatuses": ["Válido"],
  "allowDocumentsWithoutExpiry": false,
  "legalReference": "Norma aplicável ao público e à competência"
}
```

Parentesco/tipo/status são códigos exatos, não inferidos do nome. `maxAgeYears:null` remove o limite etário apenas para o parentesco explicitamente configurado. A idade é apurada no fim da competência; documentos precisam continuar válidos até esse instante. Quaisquer dispensas documentais devem ser explícitas na política. Exceções por deficiência/estudo/situações judiciais que exijam outros critérios ainda requerem políticas próprias.

Regra `SALARIO_FAMILIA` (categoria CALCULO), JSON:

```json
{
  "origin": "SALARIO_FAMILIA",
  "rubricCode": "SAL_FAMILIA",
  "incomeLimit": "VALOR_DECIMAL_OFICIAL",
  "quota": "VALOR_DECIMAL_OFICIAL",
  "proration": "POR_DIAS",
  "allocationBasis": "DIAS",
  "eligibility": {
    "relationships": [{"relationship":"Filho(a)","maxAgeYears":14}],
    "requiredDocumentTypes": ["COMPROVANTE_ESCOLAR"],
    "acceptedDocumentStatuses": ["Válido"],
    "allowDocumentsWithoutExpiry": false,
    "legalReference": "Norma aplicável"
  }
}
```

Substitua os placeholders por números decimais com ponto. Rubrica MANUAL/PROVENTO, sem incidências. Renda bruta e dependentes são agregados entre todos os contratos da PF. A quota total não se multiplica pelo número de vínculos. `INTEGRAL` ou `POR_DIAS` define proporcionalidade (mesmos dias de referência do motor mensal); `DIAS` ou `REMUNERACAO` define pesos do rateio entre contratos. Origem manual concorrente é bloqueada, não somada novamente.

Memória: renda/limite, candidaturas, idades, documentos, motivos de inelegibilidade, quota/fator e rateio em cada demonstrativo. Fechamento reavalia a elegibilidade preservada e exige novo cálculo se documentos/candidaturas mudaram. Conjuntos legados sem `DEPENDENTES_IRRF` continuam usando as flags anteriores; essa ausência não equivale à homologação das deduções.

## Alteração coletiva de contratos

Em `/rh/operacoes`, aba contratos, informe lote, seleção, vigência, fundamento e os campos a alterar. Exemplo:

```json
{"workLocation":"Unidade de destino","costCenterId":"ID_CENTRO","salaryLevel":"NIVEL-A","monthlyHours":180}
```

Campos aceitos: `regimeId`, `roleId`, `departmentId`, `costCenterId`, `workLocation`, `salaryLevel`, `salary` (string decimal), `monthlyHours` (inteiro), `endsAt` (AAAA-MM-DD; string vazia para remoção). `departmentId`, `costCenterId` e `salaryLevel` podem receber `null` para limpeza. Campo omitido é preservado. Identidade, matrícula e admissão não fazem parte deste lote.

PREVIA mostra antes/depois sem gravação; APLICAR exige o hash correspondente. Usa a mesma validação temporal/referencial de alteração individual. Falha em um vínculo reverte todos. `CONTRATO_LIMITE_DIAS_<codigoDoRegime>` aceita inteiro positivo e bloqueia duração acima do limite, inclusive em alteração coletiva.

## Banco de horas reconhecido no ponto

Regra JSON (categoria CALCULO):

```json
{
  "origin":"BANCO_HORAS_PONTO",
  "maxBalanceHours":"40",
  "maxCreditPerDayHours":"4",
  "maxDebitPerDayHours":"8",
  "allowedStatuses":["Presente"],
  "forbidPaidOvertimeForCredit":true,
  "legalReference":"Acordo/política aprovada"
}
```

No ponto, informe banco reconhecido positivo (crédito) ou negativo (compensação), com até quatro casas. O serviço não infere reconhecimento dos horários. Em Operações > Direitos, escolha contrato de alocação, regra e competência para gerar o ledger. Limites diários consideram todas as origens do dia, não apenas cada linha. Saldo é validado cronologicamente, incluindo efeitos em débitos já registrados: crédito futuro não cobre déficit anterior.

Origem única do ponto impede duplicação/alocação em outro vínculo. Replay preserva a entrada; falha reverte lote e auditoria. Ponto integrado não aceita edição/exclusão pelas actions RH. Produção exige conjunto oficial aprovado. Saldo e extrato são separados por escopo; entradas legadas sem escopo precisam de saneamento explícito. O titular consulta `/portal-servidor/banco-horas`.

Em Operações > Direitos, o estorno recebe ID da entrada original e fundamento. Gera quantidade oposta na mesma data civil e preserva ponto/entrada/auditoria. A retirada de crédito é bloqueada se algum débito posterior ficar sem cobertura; primeiro concilie os débitos. Repetição com mesmo fundamento retorna o estorno existente; fundamento diferente e estorno de estorno são rejeitados. Estorno não libera a origem do ponto para novo lançamento.

Expiração, transferência entre vínculos e conversão em pagamento continuam pendentes. Não usar o extrato como prova de pagamento.
