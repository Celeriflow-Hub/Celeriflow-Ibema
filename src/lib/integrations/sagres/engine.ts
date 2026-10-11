import crypto from "crypto";
import type { SagresField, SagresLayout } from "./layouts";

export type SagresRecord = Record<string, string | number | Date | null | undefined>;

export type SagresIssue = {
  line: number;
  field: string;
  label: string;
  message: string;
};

export type SagresHeader = {
  ibgeCode: string;
  unitCode: string;
  cnpj: string;
  competence: string; // AAAA-MM
  managementUnit: string;
};

export function parseCompetence(value: string) {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  return {
    year,
    month,
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
    payrollLabel: `${match[2]}/${match[1]}`,
  };
}

const digits = (value: string) => value.replace(/\D/g, "");

export function isValidCpf(value: string) {
  const cpf = digits(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  for (const size of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < size; i++) sum += Number(cpf[i]) * (size + 1 - i);
    const check = ((sum * 10) % 11) % 10;
    if (check !== Number(cpf[size])) return false;
  }
  return true;
}

function isEmpty(value: SagresRecord[string]) {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

function fieldIssue(field: SagresField, value: SagresRecord[string]): string | null {
  if (isEmpty(value)) return field.required ? "Campo obrigatório não preenchido." : null;
  const text = value instanceof Date ? value.toISOString() : String(value);
  if (field.type === "cpf" && !isValidCpf(text)) return "CPF inválido.";
  if ((field.type === "decimal" || field.type === "number") && !Number.isFinite(Number(value))) return "Valor numérico inválido.";
  if (field.type === "date" && !(value instanceof Date) && Number.isNaN(Date.parse(text))) return "Data inválida.";
  if (field.maxLength && field.type === "text" && text.length > field.maxLength) return `Excede ${field.maxLength} caracteres.`;
  return null;
}

export function validateSagresHeader(header: SagresHeader): SagresIssue[] {
  const issues: SagresIssue[] = [];
  const push = (field: string, label: string, message: string) => issues.push({ line: 0, field, label, message });
  if (!/^\d{7}$/.test(header.ibgeCode)) push("ibgeCode", "Código IBGE", "Informe o código IBGE com 7 dígitos.");
  if (!header.unitCode.trim()) push("unitCode", "Código SAGRES do município", "Informe o código do município no TCE-PB.");
  if (digits(header.cnpj).length !== 14) push("cnpj", "CNPJ", "CNPJ da entidade inválido.");
  if (!parseCompetence(header.competence)) push("competence", "Competência", "Use o formato AAAA-MM.");
  if (!header.managementUnit.trim()) push("managementUnit", "Unidade gestora", "Informe a unidade gestora.");
  return issues;
}

export function validateSagresRecords(layout: SagresLayout, records: SagresRecord[]): SagresIssue[] {
  const issues: SagresIssue[] = [];
  records.forEach((record, index) => {
    for (const field of layout.fields) {
      const message = fieldIssue(field, record[field.key]);
      if (message) issues.push({ line: index + 1, field: field.key, label: field.label, message });
    }
  });
  return issues;
}

function formatValue(field: SagresField, value: SagresRecord[string]) {
  if (isEmpty(value)) return "";
  if (field.type === "decimal") return Number(value).toFixed(2);
  if (field.type === "date") {
    const date = value instanceof Date ? value : new Date(String(value));
    return date.toISOString().slice(0, 10).split("-").reverse().join("");
  }
  if (field.type === "cpf" || field.type === "cnpj") return digits(String(value));
  return String(value).replace(/[|\r\n]+/g, " ").trim().slice(0, field.maxLength ?? 500);
}

/** Arquivo texto delimitado por "|": linha H (cabeçalho), linhas D (detalhe) e T (trailer com totais e hash). */
export function renderSagresFile(layout: SagresLayout, header: SagresHeader, records: SagresRecord[]) {
  const [year, month] = header.competence.split("-");
  const lines = [
    ["H", layout.fileCode, layout.version, header.ibgeCode, header.unitCode, digits(header.cnpj), header.managementUnit, `${month}${year}`].join("|"),
    ...records.map((record) => ["D", ...layout.fields.map((field) => formatValue(field, record[field.key]))].join("|")),
  ];
  const body = lines.join("\r\n");
  const hash = crypto.createHash("sha256").update(body).digest("hex");
  const content = `${body}\r\n${["T", records.length, hash].join("|")}\r\n`;
  const fileName = `SAGRES_${layout.fileCode}_${header.unitCode}_${year}${month}.txt`;
  return { content, fileName, hash, recordCount: records.length };
}
