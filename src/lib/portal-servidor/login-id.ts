import { municipality } from "@/lib/platform/municipality";

/** E-mail técnico usado como credencial quando o servidor entra com o CPF (seguro para o navegador). */
export function employeeLoginEmail(cpf: string, systemDomain = municipality.systemDomain) {
  return `${cpf.replace(/\D/g, "")}@servidor.${systemDomain}`;
}

/** Converte o identificador digitado no login: CPF vira o e-mail técnico; e-mail segue igual. */
export function resolveLoginIdentifier(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  const looksLikeCpf = !trimmed.includes("@") && digits.length === 11;
  return { email: looksLikeCpf ? employeeLoginEmail(digits) : trimmed, isCpf: looksLikeCpf };
}
