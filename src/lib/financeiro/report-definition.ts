import type { ReportDefinition } from "@/lib/reports/report-engine";
import {
  generateInternalReportDataset,
  type InternalReportDataset,
  type InternalReportType,
} from "./report-delivery";

export const financeInternalReportKey = "finance.internal";

export type FinanceReportInput = {
  financialYearId: string;
  reportType: InternalReportType;
  month?: number;
};

export type FinanceReportDataset = {
  financialYearId: string;
  reportType: InternalReportType;
  report: InternalReportDataset;
};

export function createFinanceReportDataset(
  financialYear: { id: string; year: number },
  reportType: InternalReportType,
  report: InternalReportDataset,
): FinanceReportDataset {
  return { financialYearId: financialYear.id, reportType, report };
}

export const financeInternalReportDefinition: ReportDefinition<FinanceReportInput, FinanceReportDataset> = {
  key: financeInternalReportKey,
  moduleCode: "FINANCEIRO",
  async createDataset(context, input) {
    const financialYear = await context.prisma.financialYear.findUnique({
      where: { id: input.financialYearId },
      select: { id: true, year: true },
    });
    if (!financialYear) {
      const { AccessError } = await import("@/lib/platform/tenant-context");
      throw new AccessError("Exercício financeiro não encontrado.", 404);
    }

    const report = await generateInternalReportDataset(
      context.prisma,
      input.reportType,
      financialYear.id,
      financialYear.year,
      { month: input.month },
    );
    return createFinanceReportDataset(financialYear, input.reportType, report);
  },
  auditTarget() {
    return {
      targetType: "REPORT_DEFINITION",
      targetId: financeInternalReportKey,
    };
  },
};
