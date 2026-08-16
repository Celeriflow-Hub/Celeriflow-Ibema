import { z } from "zod";

export const instanceConfigurationCatalog = {
  WORKFLOW_DEFAULT_SLA_DAYS: {
    label: "SLA padrão de novos fluxos",
    description: "Prazo padrão, em dias, sugerido ao criar um fluxo configurável.",
    defaultValue: 5,
  },
  DOCUMENT_DEFAULT_RETENTION_MONTHS: {
    label: "Retenção padrão de documentos",
    description: "Prazo padrão, em meses, sugerido para novos tipos documentais.",
    defaultValue: 60,
  },
  NOTIFICATION_DEFAULT_PRIORITY: {
    label: "Prioridade padrão de notificações",
    description: "Prioridade sugerida quando o evento não informar uma prioridade própria.",
    defaultValue: "NORMAL",
  },
  REPORT_INCLUDE_EMISSION_METADATA: {
    label: "Identificar emissão em relatórios",
    description: "Inclui data, hora e usuário emissor nos novos relatórios compatíveis.",
    defaultValue: true,
  },
} as const;

export type InstanceConfigurationKey = keyof typeof instanceConfigurationCatalog;

const instanceConfigurationValuesSchema = z.object({
  WORKFLOW_DEFAULT_SLA_DAYS: z.coerce.number().int().min(1).max(365),
  DOCUMENT_DEFAULT_RETENTION_MONTHS: z.coerce.number().int().min(1).max(1_200),
  NOTIFICATION_DEFAULT_PRIORITY: z.enum(["BAIXA", "NORMAL", "ALTA"]),
  REPORT_INCLUDE_EMISSION_METADATA: z.boolean(),
}).strict();

export type InstanceConfigurationValues = z.infer<typeof instanceConfigurationValuesSchema>;

export function parseInstanceConfigurationValues(value: unknown): InstanceConfigurationValues {
  return instanceConfigurationValuesSchema.parse(value);
}

export function getInstanceConfigurationDefaults(): InstanceConfigurationValues {
  return Object.fromEntries(
    Object.entries(instanceConfigurationCatalog).map(([key, definition]) => [key, definition.defaultValue]),
  ) as InstanceConfigurationValues;
}
