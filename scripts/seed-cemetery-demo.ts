import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

config({ path: ".env.local", quiet: true }); config({ quiet: true });
neonConfig.webSocketConstructor = ws;
const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!connectionString) throw new Error("Conexão municipal não configurada.");
const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString }), transactionOptions: { timeout: 60000 } });

async function main() {
  try {
    if (!process.argv.includes("--apply")) { console.log("Prévia: estrutura sintética de Cemitérios, duas pessoas/contribuintes demonstrativos, capela, funerária, causa, ossuário e lotes. Não cria óbitos, usuários, permissões, taxas nem guias. Execute com --apply para persistir."); return; }
    const result = await db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('CEMETERY_DEMO_SEED'))`;
      const persons = [
        { id: "cemetery-demo-owner", fullName: "DEMONSTRAÇÃO — Proprietário e declarante sintético", cpf: "00000000272" },
        { id: "cemetery-demo-person", fullName: "DEMONSTRAÇÃO — Pessoa para jornada funerária", cpf: "00000000353" },
      ];
      for (const person of persons) {
        await tx.person.upsert({ where: { id: person.id }, create: person, update: {} });
        await tx.taxpayer.upsert({ where: { id: `${person.id}-taxpayer` }, create: { id: `${person.id}-taxpayer`, taxpayerType: "PF", personId: person.id, fiscalNotes: "DEMONSTRAÇÃO — cadastro sintético sem obrigação fiscal oficial." }, update: {} });
      }
      const ownerId = "cemetery-demo-owner-taxpayer";
      for (const suffix of ["a", "b"]) {
        const cemeteryId = `cemetery-demo-${suffix}`;
        await tx.taxCemetery.upsert({ where: { id: cemeteryId }, create: { id: cemeteryId, code: `DEMO-CEM-${suffix.toUpperCase()}`, name: `DEMONSTRAÇÃO — Cemitério ${suffix.toUpperCase()}`, address: "DEMONSTRAÇÃO — Rua sintética, s/n", observations: "Estrutura sintética para homologação. Não representa instalação municipal real." }, update: {} });
        await tx.taxCemeteryEmployee.upsert({ where: { id: `${cemeteryId}-employee` }, create: { id: `${cemeteryId}-employee`, cemeteryId, name: "DEMONSTRAÇÃO — Coveiro sintético", role: "Coveiro" }, update: {} });
        await tx.taxCemeterySector.upsert({ where: { cemeteryId_code: { cemeteryId, code: "DEMO-Q1" } }, create: { id: `${cemeteryId}-sector`, cemeteryId, code: "DEMO-Q1", name: "DEMONSTRAÇÃO — Quadra 1" }, update: {} });
        await tx.cemeteryChapel.upsert({ where: { cemeteryId_name: { cemeteryId, name: "DEMONSTRAÇÃO — Capela" } }, create: { id: `${cemeteryId}-chapel`, cemeteryId, name: "DEMONSTRAÇÃO — Capela", personTaxpayerId: ownerId, responsibleTaxpayerId: ownerId, address: "DEMONSTRAÇÃO — Rua sintética, s/n" }, update: {} });
        await tx.cemeteryOssuary.upsert({ where: { cemeteryId_code: { cemeteryId, code: "DEMO-O1" } }, create: { id: `${cemeteryId}-ossuary`, cemeteryId, code: "DEMO-O1", address: "DEMONSTRAÇÃO — Rua sintética, s/n", capacity: 10 }, update: {} });
        for (const number of [1, 2]) {
          const lotId = `${cemeteryId}-lot-${number}`;
          await tx.cemeteryLot.upsert({ where: { cemeteryId_identifier: { cemeteryId, identifier: `DEMO-L${number}` } }, create: { id: lotId, cemeteryId, identifier: `DEMO-L${number}`, ownerTaxpayerId: ownerId, graveLimit: 3 }, update: {} });
          await tx.taxGrave.upsert({ where: { cemeteryId_code: { cemeteryId, code: `DEMO-S${number}` } }, create: { id: `${cemeteryId}-grave-${number}`, cemeteryId, lotId, code: `DEMO-S${number}`, graveType: number === 2 ? "GAVETA" : "COVA", capacity: 2, ownerTaxpayerId: ownerId }, update: {} });
        }
      }
      await tx.taxFuneralHome.upsert({ where: { id: "cemetery-demo-funeral" }, create: { id: "cemetery-demo-funeral", name: "DEMONSTRAÇÃO — Funerária sintética", ownershipType: "PUBLICA" }, update: {} });
      await tx.taxDeathCause.upsert({ where: { code: "DEMO-CEM-CAUSE" }, create: { id: "cemetery-demo-cause", code: "DEMO-CEM-CAUSE", description: "DEMONSTRAÇÃO — Causa sintética sem declaração médica real" }, update: {} });
      return { mode: "DEMONSTRATION", cemeteries: 2, people: 2, lots: 4, graves: 4, realPermissionsGranted: false, deathsCreated: false, feesIssued: false };
    });
    console.log(JSON.stringify(result, null, 2));
  } finally { await db.$disconnect(); }
}
main().catch(() => { console.error("Seed demonstrativo não concluído; verifique conexão e colisões dos identificadores sintéticos."); process.exitCode = 1; });
