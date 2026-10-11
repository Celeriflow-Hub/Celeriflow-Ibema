import { redirect } from "next/navigation";

export const metadata = { title: "Validar certidão — Portal do Contribuinte" };

async function go(f: FormData) {
  "use server";
  const code = String(f.get("code") ?? "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 40);
  redirect(code ? `/portal/contribuinte/certidao/${code}` : "/portal/contribuinte/validar");
}

export default function ValidarCertidaoPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold">Validar certidão</h1>
      <form action={go} className="mt-4 space-y-3 rounded-xl border bg-white p-5 shadow-sm">
        <label className="block text-sm font-medium">Código de autenticidade<input name="code" required placeholder="CND-..." className="mt-1 w-full rounded-md border px-3 py-2 font-mono" /></label>
        <button className="w-full rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white">Validar</button>
      </form>
    </main>
  );
}
