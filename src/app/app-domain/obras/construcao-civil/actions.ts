"use server";

import { Prisma } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getTenantContextForModuleOperation, getTenantContextForSystemAdministration } from "@/lib/platform/tenant-context";
import { writeAuditEvent, auditEventTypes } from "@/lib/platform/audit-evidence";
import { constructionCatalogSchema, constructionConfigSchema, constructionStaffSchema, constructionCaseSchema, calculateConstructionArea } from "@/lib/obras/construction-policy";
import { resolveConstructionAccess } from "@/lib/obras/construction-access";
import { createValidatedProcess } from "@/lib/protocols/service";
import { definitionSchema, validateConstructionFields } from "@/lib/obras/construction-rules";
import { assignConstructionCase } from "@/lib/obras/construction-distribution";

function errorMessage(error: unknown) {
  if (error instanceof z.ZodError) return error.issues[0].message;
  if (error instanceof Prisma.PrismaClientKnownRequestError) return error.code === "P2002" ? "Já existe um cadastro com esses dados. Atualize a página." : "Não foi possível salvar. Confira as referências do cadastro.";
  if (error instanceof Error && !error.name.startsWith("Prisma")) return error.message;
  return "Não foi possível concluir a operação.";
}
function refresh() { revalidatePath("/obras/construcao-civil"); revalidatePath("/obras/construcao-civil/configuracoes"); revalidatePath("/obras/construcao-civil/equipe"); }

export async function saveConstructionCatalog(input: unknown) {
  try {
    const data = constructionCatalogSchema.parse(input);
    const context = await getTenantContextForModuleOperation("OBRAS", data.id ? "update" : "create");
    const access = await resolveConstructionAccess(context);
    if (!access.administrator && !access.roles.includes("MANAGER")) return { error: "Somente gestor urbanístico pode configurar catálogos." };
    await context.prisma.$transaction(async (tx) => {
      if (data.id) {
        const current = await tx.constructionCatalogEntry.findUnique({ where: { id: data.id } });
        if (!current || current.kind !== data.kind) throw new Error("Um cadastro existente não pode mudar de catálogo.");
      }
      const values = { kind: data.kind, name: data.name, description: data.description || null, isActive: data.isActive };
      const entry = data.id ? await tx.constructionCatalogEntry.update({ where: { id: data.id }, data: values }) : await tx.constructionCatalogEntry.create({ data: values });
      await writeAuditEvent(tx, { actorUsuarioId: context.user.id, eventType: auditEventTypes.administrativeMutation, targetType: "ConstructionCatalogEntry", targetId: entry.id });
    });
    refresh(); return { success: true };
  } catch (error) { return { error: errorMessage(error) }; }
}

export async function publishConstructionConfiguration(input: unknown) {
  try {
    const data = constructionConfigSchema.parse(input);
    const context = await getTenantContextForModuleOperation("OBRAS", "update");
    const access = await resolveConstructionAccess(context);
    if (!access.administrator && !access.roles.includes("MANAGER")) return { error: "Somente gestor urbanístico pode publicar configurações." };
    await context.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('CONSTRUCTION_CONFIGURATION'))`;
      const subjects = await tx.subject.count({ where: { id: { in: data.subjectIds }, isActive: true, allowsInternalOpening: true, processType: { isActive: true, allowsInternalOpening: true } } });
      if (subjects !== data.subjectIds.length) throw new Error("Selecione assuntos ativos que permitam abertura interna.");
      const previous = await tx.constructionConfigVersion.findFirst({ orderBy: { version: "desc" }, select: { version: true } });
      const config = await tx.constructionConfigVersion.create({ data: { ...data, version: (previous?.version || 0) + 1, publishedBy: context.user.id } });
      await writeAuditEvent(tx, { actorUsuarioId: context.user.id, eventType: auditEventTypes.instanceConfigurationChanged, targetType: "ConstructionConfigVersion", targetId: config.id });
    });
    refresh(); return { success: true };
  } catch (error) { return { error: errorMessage(error) }; }
}

export async function saveConstructionStaff(input: unknown) {
  try {
    const data = constructionStaffSchema.parse(input);
    const context = await getTenantContextForSystemAdministration();
    await context.prisma.$transaction(async (tx) => {
      const employee = await tx.employee.findFirst({ where: { id: data.employeeId, isActive: true, departmentId: data.departmentId, department: { isActive: true } }, select: { id: true } });
      if (data.isActive && !employee) throw new Error("O servidor precisa estar ativo e lotado no setor selecionado.");
      if (data.id) {
        const current = await tx.constructionStaffRole.findUnique({ where: { id: data.id } });
        if (!current || current.employeeId !== data.employeeId || current.departmentId !== data.departmentId || current.role !== data.role || current.startsAt.toISOString().slice(0, 10) !== data.startsAt) throw new Error("Servidor, setor, papel e início são imutáveis. Encerre o vínculo e crie outro.");
      }
      const values = { employeeId: data.employeeId, departmentId: data.departmentId, role: data.role, startsAt: new Date(`${data.startsAt}T00:00:00Z`), endsAt: data.endsAt ? new Date(`${data.endsAt}T00:00:00Z`) : null, isActive: data.isActive };
      const role = data.id ? await tx.constructionStaffRole.update({ where: { id: data.id }, data: values }) : await tx.constructionStaffRole.create({ data: values });
      await writeAuditEvent(tx, { actorUsuarioId: context.user.id, eventType: auditEventTypes.administrativeMutation, targetType: "ConstructionStaffRole", targetId: role.id });
    });
    refresh(); return { success: true };
  } catch (error) { return { error: errorMessage(error) }; }
}

export async function openConstructionCase(input: unknown) {
  try {
    const data = constructionCaseSchema.parse(input);
    const context = await getTenantContextForModuleOperation("OBRAS", "create");
    await getTenantContextForModuleOperation("PROCESSOS", "create");
    const access = await resolveConstructionAccess(context);
    if (!access.administrator && !access.roles.some((role) => ["MANAGER", "ANALYST"].includes(role))) return { error: "Abertura interna exige papel de analista ou gestor urbanístico vigente." };
    if (!context.user.employeeId) return { error: "Vincule seu usuário a um servidor para abrir o processo interno." };
    const employeeId = context.user.employeeId;
    const result = await context.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`CONSTRUCTION_OPEN:${data.requestKey}`}))`;
      const existing = await tx.constructionCase.findUnique({ where: { requestKey: data.requestKey }, select: { id: true, createdBy: true } });
      if (existing) {
        if (existing.createdBy !== context.user.id) throw new Error("Referência de abertura indisponível.");
        return existing.id;
      }
      const employee = await tx.employee.findFirst({ where: { id: employeeId, isActive: true, department: { isActive: true } }, select: { id: true, departmentId: true } });
      if (!employee?.departmentId) throw new Error("Seu vínculo operacional não está ativo ou não possui setor.");
      const config = await tx.constructionConfigVersion.findFirst({ orderBy: { version: "desc" } });
      if (!config) throw new Error("Publique a configuração urbanística antes de abrir solicitações.");
      if (config.version !== data.configurationVersion) throw new Error("A configuração mudou. Atualize a página e confira a nova regra antes de protocolar.");
      if (!config.subjectIds.includes(data.subjectId)) throw new Error("O assunto não está habilitado para Construção Civil.");
      const form = await tx.constructionDefinitionVersion.findFirst({ where: { kind: "FORM" }, orderBy: { version: "desc" } });
      if ((form?.version || 0) !== data.formVersion) throw new Error("O formulário mudou. Atualize a página antes de protocolar.");
      const definition = definitionSchema.parse(form?.definition || { fields: [], checks: [], documents: [] });
      const additionalValues = validateConstructionFields(definition, data.additionalValues);
      const properties = await tx.realEstate.findMany({ where: { id: { in: data.propertyIds } }, select: { id: true, municipalInsc: true, registration: true, streetName: true, number: true, lot: true, block: true, landArea: true, builtArea: true, propertyUse: true, fiscalZone: true, taxpayerId: true } });
      if (properties.length !== data.propertyIds.length) throw new Error("Um ou mais imóveis não estão disponíveis.");
      if (data.personId && !await tx.person.findFirst({ where: { id: data.personId, status: "Ativo" }, select: { id: true } })) throw new Error("Pessoa requerente inativa/inexistente.");
      if (data.companyId && !await tx.company.findFirst({ where: { id: data.companyId, status: "Ativo" }, select: { id: true } })) throw new Error("Empresa requerente inativa/inexistente.");
      const catalogs = await tx.constructionCatalogEntry.findMany({ where: { isActive: true, id: { in: [data.modalityId, data.purposeId, ...(data.constructionTypeId ? [data.constructionTypeId] : [])] } } });
      const modality = catalogs.find((entry) => entry.id === data.modalityId && entry.kind === (data.category === "BUILDING" ? "PERMIT_TYPE" : "SUBDIVISION_TYPE"));
      const purpose = catalogs.find((entry) => entry.id === data.purposeId && entry.kind === "PURPOSE");
      const constructionType = catalogs.find((entry) => entry.id === data.constructionTypeId && entry.kind === "CONSTRUCTION_TYPE");
      if (!modality || !purpose || (data.constructionTypeId && !constructionType)) throw new Error("Modalidade, finalidade ou tipo construtivo inválido/inativo.");
      const calculation = calculateConstructionArea(data, config.areaWeights);
      const process = await createValidatedProcess(tx, employee, context.user.id, { processTypeId: data.processTypeId, subjectId: data.subjectId, personId: data.personId || null, companyId: data.companyId || null, description: data.description });
      const scope = await tx.process.findUniqueOrThrow({ where: { id: process.id }, select: { currentDepartmentId: true } });
      if (!access.administrator && scope.currentDepartmentId !== employee.departmentId) throw new Error("O assunto encaminha para outro setor. Utilize um assunto urbanístico do seu setor.");
      const caseRecord = await tx.constructionCase.create({ data: {
        requestKey: data.requestKey, processId: process.id, configurationId: config.id, category: data.category, locationType: data.locationType, regularization: data.regularization,
        catalogSnapshot: { modality: { id: modality.id, name: modality.name }, purpose: { id: purpose.id, name: purpose.name }, constructionType: constructionType ? { id: constructionType.id, name: constructionType.name } : null },
        existingArea: data.existingArea, expandedArea: data.expandedArea, irregularArea: data.irregularArea, renovationArea: data.renovationArea, demolitionArea: data.demolitionArea, totalArea: calculation.total, calculationSnapshot: calculation.memory,
        createdBy: context.user.id, properties: { create: properties.map((property) => ({ realEstateId: property.id, cadastralSnapshot: property })) },
        additionalValues, formSnapshot: { version: form?.version || 0, definition },
      } });
      if (scope.currentDepartmentId) await assignConstructionCase(tx, { caseId: caseRecord.id, processId: process.id, departmentId: scope.currentDepartmentId, today: new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z") });
      await writeAuditEvent(tx, { actorUsuarioId: context.user.id, eventType: auditEventTypes.administrativeMutation, targetType: "ConstructionCase", targetId: caseRecord.id });
      return caseRecord.id;
    });
    refresh(); revalidatePath("/protocolos/processos");
    return { success: true, id: result };
  } catch (error) { return { error: errorMessage(error) }; }
}
