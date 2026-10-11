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
