/**
 * Leiautes SAGRES (TCE-PB) versionados.
 * A estrutura de campos abaixo é a versão de trabalho do CeleriFlow; ao receber os
 * leiautes oficiais do Tribunal, cadastre uma nova versão aqui sem alterar as anteriores.
 */
export type SagresFieldType = "text" | "number" | "decimal" | "date" | "cpf" | "cnpj";

export type SagresField = {
  key: string;
  label: string;
  type: SagresFieldType;
  required: boolean;
  maxLength?: number;
};

export type SagresLayout = {
  code: SagresLayoutCode;
  name: string;
  version: string;
  official: boolean;
  fileCode: string;
  fields: readonly SagresField[];
};

export const sagresLayoutCodes = ["MENSAL_FOLHA", "FROTA", "FARMACIA"] as const;
export type SagresLayoutCode = (typeof sagresLayoutCodes)[number];

export const sagresLayouts: readonly SagresLayout[] = [
  {
    code: "MENSAL_FOLHA",
    name: "SAGRES Mensal — Folha de Pagamento",
    version: "CF-2026.1",
    official: false,
    fileCode: "FOLHA",
    fields: [
      { key: "cpf", label: "CPF do servidor", type: "cpf", required: true },
      { key: "matricula", label: "Matrícula", type: "text", required: true, maxLength: 20 },
      { key: "nome", label: "Nome do servidor", type: "text", required: true, maxLength: 120 },
      { key: "cargo", label: "Cargo", type: "text", required: true, maxLength: 80 },
      { key: "lotacao", label: "Lotação (secretaria)", type: "text", required: true, maxLength: 80 },
      { key: "tipoFolha", label: "Tipo de folha", type: "text", required: true, maxLength: 20 },
      { key: "vencimentos", label: "Total de vencimentos", type: "decimal", required: true },
      { key: "descontos", label: "Total de descontos", type: "decimal", required: true },
      { key: "liquido", label: "Valor líquido", type: "decimal", required: true },
    ],
  },
  {
    code: "FROTA",
    name: "SAGRES Frota — Combustível e manutenção",
    version: "CF-2026.1",
    official: false,
    fileCode: "FROTA",
    fields: [
      { key: "codigoVeiculo", label: "Código do veículo", type: "text", required: true, maxLength: 20 },
      { key: "placa", label: "Placa", type: "text", required: false, maxLength: 8 },
      { key: "descricao", label: "Descrição do veículo", type: "text", required: true, maxLength: 80 },
      { key: "data", label: "Data", type: "date", required: true },
      { key: "tipo", label: "Tipo de despesa", type: "text", required: true, maxLength: 30 },
      { key: "material", label: "Combustível/material", type: "text", required: true, maxLength: 60 },
      { key: "quantidade", label: "Quantidade", type: "decimal", required: true },
      { key: "unidade", label: "Unidade de medida", type: "text", required: true, maxLength: 10 },
      { key: "valor", label: "Valor", type: "decimal", required: true },
      { key: "fornecedor", label: "Fornecedor", type: "text", required: false, maxLength: 120 },
      { key: "cnpjFornecedor", label: "CNPJ do fornecedor", type: "cnpj", required: false },
      { key: "secretaria", label: "Secretaria/setor", type: "text", required: false, maxLength: 120 },
      { key: "tipoMedidor", label: "Tipo de medidor (KM/HORA)", type: "text", required: false, maxLength: 4 },
      { key: "leitura", label: "Leitura do medidor", type: "decimal", required: false },
      { key: "documento", label: "Ordem/documento de origem", type: "text", required: false, maxLength: 40 },
    ],
  },
  {
    code: "FARMACIA",
    name: "SAGRES Farmácia — Dispensação de medicamentos",
    version: "CF-2026.1",
    official: false,
    fileCode: "FARMACIA",
    fields: [
      { key: "data", label: "Data da dispensação", type: "date", required: true },
      { key: "medicamento", label: "Medicamento", type: "text", required: true, maxLength: 120 },
      { key: "apresentacao", label: "Apresentação", type: "text", required: false, maxLength: 40 },
      { key: "lote", label: "Lote", type: "text", required: false, maxLength: 30 },
      { key: "quantidade", label: "Quantidade", type: "decimal", required: true },
      { key: "unidadeSaude", label: "Unidade de saúde", type: "text", required: true, maxLength: 80 },
      { key: "paciente", label: "Paciente (CNS ou CPF)", type: "text", required: true, maxLength: 20 },
      { key: "controlado", label: "Controlado (S/N)", type: "text", required: true, maxLength: 1 },
      { key: "catmat", label: "Código CATMAT", type: "text", required: false, maxLength: 12 },
      { key: "listaPortaria344", label: "Lista Portaria 344", type: "text", required: false, maxLength: 2 },
      { key: "validade", label: "Validade do lote", type: "date", required: false },
      { key: "cnes", label: "CNES da unidade", type: "text", required: false, maxLength: 7 },
      { key: "valorUnitario", label: "Valor unitário", type: "decimal", required: false },
    ],
  },
];

export function getSagresLayout(code: string) {
  return sagresLayouts.find((layout) => layout.code === code);
}

export function isSagresLayoutCode(value: string): value is SagresLayoutCode {
  return (sagresLayoutCodes as readonly string[]).includes(value);
}
