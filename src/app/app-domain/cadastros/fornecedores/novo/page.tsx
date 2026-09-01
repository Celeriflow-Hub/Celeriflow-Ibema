import { Truck, Save, ArrowLeft, User, List } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTenantContextForModule, getTenantContextForModuleOperation } from "@/lib/platform/tenant-context";
import type { Prisma } from "@prisma/client";
import { PageFrame } from "@/components/app-ui/PageFrame";
import { PageHeader } from "@/components/app-ui/PageHeader";

export default async function NovoFornecedorPage() {
  const { prisma } = await getTenantContextForModule("CADASTROS");
  const persons = await prisma.person.findMany({
    select: { id: true, fullName: true, cpf: true }
  });
  
  const companies = await prisma.company.findMany({
    select: { id: true, corporateName: true, cnpj: true }
  });

  async function createSupplier(formData: FormData) {
    "use server";
    const { prisma } = await getTenantContextForModuleOperation("CADASTROS", "create");
    
    const supplierType = formData.get("supplierType") as string;
    const personId = formData.get("personId") as string;
    const companyId = formData.get("companyId") as string;
    const category = formData.get("category") as string;
    const businessBranch = formData.get("businessBranch") as string;
    const certificationsValidUntil = formData.get("certificationsValidUntil") as string;
    const bankData = formData.get("bankData") as string;
    const notes = formData.get("notes") as string;

    const data: Prisma.SupplierUncheckedCreateInput = {
      category: category || null,
      businessBranch: businessBranch || null,
      certificationsValidUntil: certificationsValidUntil ? new Date(certificationsValidUntil) : null,
      bankData: bankData || null,
      notes: notes || null,
      status: "Ativo"
    };

    if (supplierType === "PF" && personId) {
      data.personId = personId;
    } else if (supplierType === "PJ" && companyId) {
      data.companyId = companyId;
    }

    await prisma.supplier.create({
      data
    });

    redirect("/cadastros/fornecedores");
  }

  return (
    <PageFrame className="max-w-4xl space-y-2">
      <PageHeader title="Novo Fornecedor" icon={<Truck className="size-4 shrink-0 text-fuchsia-600" />} action={<Link href="/cadastros/fornecedores" className="inline-flex h-7 items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><ArrowLeft className="size-3.5" />Voltar</Link>} />

      <form action={createSupplier} className="space-y-2">
        <div className="rounded border border-slate-300 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2 border-b border-slate-200 pb-1.5 text-xs font-bold uppercase tracking-[0.08em] text-fuchsia-700">
            <User className="size-4" />
            Vínculo do Fornecedor
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="supplierType" className="block text-sm font-medium text-slate-700 mb-1">Tipo de Fornecedor *</label>
              <select id="supplierType" name="supplierType" required className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-600/20 focus:border-fuchsia-600">
                <option value="PJ">Pessoa Jurídica (PJ)</option>
                <option value="PF">Pessoa Física (PF) - Autônomo</option>
              </select>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="companyId" className="block text-sm font-medium text-slate-700 mb-1">Pessoa Jurídica (Selecione se for PJ)</label>
              <select id="companyId" name="companyId" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-600/20 focus:border-fuchsia-600">
                <option value="">Selecione a Empresa...</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.corporateName} - CNPJ: {c.cnpj}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label htmlFor="personId" className="block text-sm font-medium text-slate-700 mb-1">Pessoa Física (Selecione se for PF)</label>
              <select id="personId" name="personId" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-600/20 focus:border-fuchsia-600">
                <option value="">Selecione a Pessoa Física...</option>
                {persons.map(p => (
                  <option key={p.id} value={p.id}>{p.fullName} - CPF: {p.cpf}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded border border-slate-300 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2 border-b border-slate-200 pb-1.5 text-xs font-bold uppercase tracking-[0.08em] text-fuchsia-700">
            <List className="size-4" />
            Dados do Fornecedor
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Categoria de Fornecimento</label>
              <select id="category" name="category" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-600/20 focus:border-fuchsia-600">
                <option value="">Selecione...</option>
                <option value="Materiais">Materiais Diversos</option>
                <option value="Serviços">Prestação de Serviços</option>
                <option value="Obras">Obras e Engenharia</option>
                <option value="Equipamentos">Equipamentos</option>
                <option value="Tecnologia">Tecnologia da Informação</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="businessBranch" className="block text-sm font-medium text-slate-700 mb-1">Ramo de Atividade</label>
              <input type="text" id="businessBranch" name="businessBranch" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-600/20 focus:border-fuchsia-600" />
            </div>

            <div>
              <label htmlFor="certificationsValidUntil" className="block text-sm font-medium text-slate-700 mb-1">Validade das Certidões (Habilitação)</label>
              <input type="date" id="certificationsValidUntil" name="certificationsValidUntil" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-600/20 focus:border-fuchsia-600" />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label htmlFor="bankData" className="block text-sm font-medium text-slate-700 mb-1">Dados Bancários</label>
              <input type="text" id="bankData" name="bankData" placeholder="Banco, Agência, Conta..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-600/20 focus:border-fuchsia-600" />
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
              <textarea id="notes" name="notes" rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-600/20 focus:border-fuchsia-600"></textarea>
            </div>
          </div>
        </div>

        <div className="flex h-10 justify-end gap-2 rounded border border-slate-200 bg-slate-50 px-3">
          <Link href="/cadastros/fornecedores" className="inline-flex h-7 items-center self-center rounded border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            Cancelar
          </Link>
          <button type="submit" className="inline-flex h-7 items-center gap-1.5 self-center rounded bg-fuchsia-700 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-fuchsia-800">
            <Save className="size-3.5" />
            Salvar Fornecedor
          </button>
        </div>
      </form>
    </PageFrame>
  );
}
