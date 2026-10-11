/**
 * Sprint 2 (pós-merge) — Base demonstrativa da POC.
 * Cria servidores, motoristas, veículos, postos, medicamentos/lotes,
 * contribuintes e débitos. Idempotente (upsert por chaves únicas).
 * Uso: npx tsx prisma/seed-demo-cacimba.ts --apply
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { municipality } from "../src/lib/platform/municipality";

function cpf(seed: number) {
  const base = String(100000000 + seed * 7919).slice(0, 9).split("").map(Number);
  const dv = (digits: number[]) => {
    const sum = digits.reduce((acc, d, i) => acc + d * (digits.length + 1 - i), 0);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  const d1 = dv(base);
  const d2 = dv([...base, d1]);
  return [...base, d1, d2].join("");
}

const servidores = [
  { name: "Maria José da Silva", salary: 1518, nature: "ESTATUTARIO", regime: "RPPS" },
  { name: "José Carlos Pereira", salary: 2450, nature: "ESTATUTARIO", regime: "RPPS" },
  { name: "Ana Paula Souza", salary: 3200, nature: "COMISSIONADO", regime: "RGPS" },
  { name: "Francisco de Assis Lima", salary: 1518, nature: "CLT", regime: "RGPS" },
  { name: "Antônia Ferreira Santos", salary: 4100, nature: "ESTATUTARIO", regime: "RPPS" },
  { name: "Severino Alves Costa", salary: 1800, nature: "TEMPORARIO", regime: "RGPS" },
];

async function main() {
  if (!process.argv.includes("--apply")) throw new Error("Confirme com --apply.");
  const admin = await prisma.usuario.findFirst({ select: { id: true } });
  if (!admin) throw new Error("Crie ao menos um usuário antes do seed (bootstrap-admin).");

  for (const [i, s] of servidores.entries()) {
    const doc = cpf(i + 1);
    await prisma.employee.upsert({
      where: { cpf: doc },
      update: {},
      create: {
        name: s.name, cpf: doc, registration: `2026${String(i + 1).padStart(4, "0")}`,
        salaryBase: s.salary, employmentNature: s.nature, socialSecurityRegime: s.regime,
        admissionDate: new Date(2015 + i, 1, 1), pisPasep: `1${doc.slice(0, 10)}`,
        bankCode: "001", bankAgency: "1234", bankAccount: `${10000 + i}-${i}`,
      },
    });
  }
  console.log(`✅ ${servidores.length} servidores`);

  const veiculos = [
    { code: "VEI-001", name: "Ambulância Saúde", plate: "QFA1A01", category: "AMBULANCIA", fuel: "DIESEL" },
    { code: "VEI-002", name: "Ônibus Escolar", plate: "QFA1A02", category: "ONIBUS", fuel: "DIESEL" },
    { code: "VEI-003", name: "Caminhonete Obras", plate: "QFA1A03", category: "CAMINHONETE", fuel: "DIESEL" },
    { code: "VEI-004", name: "Carro Administração", plate: "QFA1A04", category: "AUTOMOVEL", fuel: "GASOLINA" },
  ];
  for (const v of veiculos) {
    await prisma.fleetUnit.upsert({
      where: { code: v.code }, update: {},
      create: { code: v.code, name: v.name, plate: v.plate, category: v.category, fuelType: v.fuel, currentReading: 10000, expectedConsumption: 8, createdById: admin.id },
    });
  }
  console.log(`✅ ${veiculos.length} veículos`);

  for (const [i, name] of ["João Batista Motorista", "Pedro Henrique Oliveira"].entries()) {
    const doc = cpf(50 + i);
    await prisma.fleetDriver.upsert({
      where: { cpf: doc }, update: {},
      create: { name, cpf: doc, cnhNumber: `0${doc}`, cnhCategory: "D", cnhExpiresAt: new Date(2028, 5, 30), createdById: admin.id },
    });
  }
  await prisma.fleetFuelStation.upsert({
    where: { cnpj: "11222333000181" }, update: {},
    create: { name: `Posto Central de ${municipality.name}`, cnpj: "11222333000181", contractRef: "CT 001/2026", pricePerLiter: 6.19 },
  });
  console.log("✅ 2 motoristas e 1 posto");

  const medicamentos = [
    { name: "Dipirona 500mg", principle: "Dipirona sódica", controlled: false, stock: 800, min: 200 },
    { name: "Amoxicilina 500mg", principle: "Amoxicilina", controlled: false, stock: 300, min: 100 },
    { name: "Losartana 50mg", principle: "Losartana potássica", controlled: false, stock: 50, min: 150 },
    { name: "Clonazepam 2mg", principle: "Clonazepam", controlled: true, stock: 120, min: 40 },
  ];
  for (const [i, m] of medicamentos.entries()) {
    const existing = await prisma.medicine.findFirst({ where: { name: m.name } });
    const med = existing ?? await prisma.medicine.create({
      data: { name: m.name, activePrinciple: m.principle, isControlled: m.controlled, currentStock: m.stock, minStock: m.min, presentation: "Comprimido" },
    });
    if (!existing) {
      await prisma.medicineBatch.create({ data: { medicineId: med.id, batchNumber: `L2026-${i + 1}`, quantity: m.stock, expirationDate: new Date(2026, 10 + i, 28) } });
    }
  }
  console.log(`✅ ${medicamentos.length} medicamentos com lote`);

  for (let i = 0; i < 3; i++) {
    const doc = cpf(80 + i);
    const person = await prisma.person.upsert({
      where: { cpf: doc }, update: {},
      create: { fullName: ["Luiz Gonzaga Filho", "Rita de Cássia Melo", "Raimundo Nonato Dias"][i], cpf: doc },
    });
    const taxpayer = await prisma.taxpayer.upsert({
      where: { personId: person.id }, update: {},
      create: { taxpayerType: "PF", personId: person.id, municipalInsc: `CT-${String(i + 1).padStart(5, "0")}` },
    });
    await prisma.activeDebt.upsert({
      where: { sourceKey: `demo-cacimba-iptu-${i}` }, update: {},
      create: { taxpayerId: taxpayer.id, originDebtType: "IPTU", year: 2025, originalValue: 180 + i * 40, updatedValue: 198 + i * 44, sourceKey: `demo-cacimba-iptu-${i}` },
    });
  }
  console.log("✅ 3 contribuintes com débito de IPTU");
}

main()
  .catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
