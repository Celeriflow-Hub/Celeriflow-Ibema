/**
 * Seed: Instância Cacimba de Dentro/PB (Sprint 1)
 * Configura instituição, instância e perfis de acesso por módulo do Lote Único.
 * Seguro para re-executar. Uso: npx tsx prisma/seed-instancia-cacimba.ts
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { municipality } from "../src/lib/platform/municipality";

const moduleProfiles = [
  { codigo: "TRIBUTACAO_OPERADOR", nome: "Tributação — Operador", modulo: "TRIBUTACAO", descricao: "Gestão Tributária: cadastros, lançamentos, guias e dívida ativa." },
  { codigo: "RH_OPERADOR", nome: "Folha de Pagamento — Operador", modulo: "RH", descricao: "Folha de Pagamento: servidores, eventos, cálculo e fechamento." },
  { codigo: "FROTAS_OPERADOR", nome: "Frota — Operador", modulo: "FROTAS", descricao: "Gestão de Frota: veículos, abastecimentos, manutenções e motoristas." },
  { codigo: "FARMACIA_OPERADOR", nome: "Farmácia — Operador", modulo: "SAUDE", descricao: "Farmácia Pública: estoque, lotes, dispensação e controlados." },
  { codigo: "CONTROLE_TCE", nome: "Prestação de Contas TCE-PB", modulo: "TRANSPARENCIA", descricao: "Geração e envio das remessas SAGRES (Folha, Frota e Farmácia)." },
];

async function main() {
  const existingInstitution = await prisma.institution.findFirst();
  const institutionData = {
    name: municipality.prefectureName,
    legalName: municipality.legalName,
    cnpj: municipality.cnpj,
    address: municipality.address,
    city: municipality.name,
    state: municipality.state,
    zipCode: municipality.zipCode,
    email: municipality.email,
    website: municipality.website,
    logoUrl: municipality.coatOfArms,
  };
  if (existingInstitution) await prisma.institution.update({ where: { id: existingInstitution.id }, data: institutionData });
  else await prisma.institution.create({ data: institutionData });
  console.log("✅ Instituição configurada.");

  const existingInstance = await prisma.configuracaoInstancia.findFirst();
  const instanceData = {
    nomePrefeitura: municipality.prefectureName,
    cnpj: municipality.cnpj,
    municipio: municipality.name,
    uf: municipality.state,
    dominio: municipality.systemDomain,
  };
  if (existingInstance) await prisma.configuracaoInstancia.update({ where: { id: existingInstance.id }, data: instanceData });
  else await prisma.configuracaoInstancia.create({ data: instanceData });
  console.log("✅ Instância configurada.");

  for (const profile of moduleProfiles) {
    const permissoes = JSON.stringify({
      acesso: "operacional",
      modules: { [profile.modulo]: { showDashboardCard: true, blocked: false, create: true, update: true, delete: false, issueReports: true } },
    });
    await prisma.configuracaoPerfil.upsert({
      where: { codigo: profile.codigo },
      create: { codigo: profile.codigo, nome: profile.nome, descricao: profile.descricao, permissoes, ativo: true },
      update: { nome: profile.nome, descricao: profile.descricao, permissoes, ativo: true },
    });
    console.log(`✅ Perfil "${profile.nome}" criado/atualizado.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
