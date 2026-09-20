"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ClipboardPlus, X } from "lucide-react";
import { completeHealthAppointmentAction } from "./actions";

type MedicalRecord = {
  id: string;
  date: string;
  type: string;
  chiefComplaint: string | null;
  patient: { person: { fullName: string } };
  professional: { employee: { name: string } };
  unit: { name: string };
};

type Appointment = {
  id: string;
  date: string;
  specialty: string | null;
  status: string;
  patient: { person: { fullName: string } };
  unit: { name: string };
  professionalId: string | null;
};

type CurrentProfessional = { id: string; name: string } | null;

type RecordForm = {
  appointmentId: string;
  type: "Consulta" | "Triagem" | "Procedimento";
  bloodPressure: string;
  temperature: string;
  weight: string;
  height: string;
  heartRate: string;
  chiefComplaint: string;
  evolution: string;
  conduct: string;
};

function initialForm(appointments: Appointment[]): RecordForm {
  return {
    appointmentId: appointments[0]?.id || "",
    type: "Consulta",
    bloodPressure: "",
    temperature: "",
    weight: "",
    height: "",
    heartRate: "",
    chiefComplaint: "",
    evolution: "",
    conduct: "",
  };
}

export default function AtendimentosClient({
  records,
  appointments,
  currentProfessional,
  canRegister,
}: {
  records: MedicalRecord[];
  appointments: Appointment[];
  currentProfessional: CurrentProfessional;
  canRegister: boolean;
}) {
  const router = useRouter();
  const locked = useRef(false);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<RecordForm>(() => initialForm(appointments));

  function openDialog() {
    setForm(initialForm(appointments));
    setError("");
    setOpen(true);
  }

  function closeDialog() {
    if (pending) return;
    setOpen(false);
    setError("");
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    setError("");
    startTransition(async () => {
      try {
        const result = await completeHealthAppointmentAction(form);
        if (result.error) {
          setError(result.error);
          return;
        }
        setOpen(false);
        router.refresh();
      } catch {
        setError("Nao foi possivel consultar a confirmacao. Tente novamente.");
      } finally {
        locked.current = false;
      }
    });
  }

  return (
    <div className="space-y-3">
      {error && <div role="alert" className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle className="size-4 shrink-0" />{error}</div>}
      <div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800">
        <div><h2 className="text-sm font-semibold text-slate-900">Atendimentos e prontuarios</h2><p className="mt-1 text-sm text-slate-500">O registro preserva a autoria do profissional autenticado e conclui o agendamento uma unica vez.</p></div>
        {canRegister && currentProfessional && <button type="button" onClick={openDialog} disabled={!appointments.length || pending} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"><ClipboardPlus className="size-4" />Registrar atendimento</button>}
      </div>
      {canRegister && !currentProfessional && <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">O registro clinico exige que o usuario autenticado esteja vinculado a um profissional de saude ativo.</p>}
      {canRegister && currentProfessional && !appointments.length && <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">Nao ha agendamentos elegiveis para o profissional autenticado.</p>}

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800" aria-label="Lista de atendimentos">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b bg-slate-50 text-slate-600"><tr><th className="p-3 font-semibold">Data</th><th className="p-3 font-semibold">Tipo</th><th className="p-3 font-semibold">Paciente</th><th className="p-3 font-semibold">Unidade</th><th className="p-3 font-semibold">Profissional</th><th className="p-3 font-semibold">Queixa principal</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-slate-500">Nenhum atendimento registrado.</td></tr> : records.map(record => <tr key={record.id} className="hover:bg-slate-50"><td className="p-3 text-slate-700">{new Date(record.date).toLocaleString("pt-BR")}</td><td className="p-3 text-slate-700">{record.type}</td><td className="p-3 font-medium text-slate-900">{record.patient.person.fullName}</td><td className="p-3 text-slate-700">{record.unit.name}</td><td className="p-3 text-slate-700">{record.professional.employee.name}</td><td className="max-w-72 truncate p-3 text-slate-700" title={record.chiefComplaint || undefined}>{record.chiefComplaint || "-"}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
        <form onSubmit={submit} className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl" aria-labelledby="record-appointment-title">
          <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 id="record-appointment-title" className="text-base font-semibold text-slate-900">Registrar atendimento</h2><p className="mt-1 text-sm text-slate-500">Profissional responsavel: {currentProfessional?.name}</p></div><button type="button" onClick={closeDialog} disabled={pending} className="rounded p-2 text-slate-500 hover:bg-slate-100" aria-label="Fechar"><X className="size-5" /></button></header>
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <label className="md:col-span-2"><span className="mb-1.5 block text-sm font-medium text-slate-700">Agendamento</span><select required value={form.appointmentId} onChange={event => setForm(current => ({ ...current, appointmentId: event.target.value }))} className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"><option value="" disabled>Selecione um agendamento</option>{appointments.map(appointment => <option key={appointment.id} value={appointment.id}>{new Date(appointment.date).toLocaleString("pt-BR")} - {appointment.patient.person.fullName} - {appointment.unit.name}{appointment.specialty ? ` (${appointment.specialty})` : ""}</option>)}</select></label>
            <label><span className="mb-1.5 block text-sm font-medium text-slate-700">Tipo de registro</span><select value={form.type} onChange={event => setForm(current => ({ ...current, type: event.target.value as RecordForm["type"] }))} className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"><option value="Consulta">Consulta</option><option value="Triagem">Triagem</option><option value="Procedimento">Procedimento</option></select></label>
            <label><span className="mb-1.5 block text-sm font-medium text-slate-700">Pressao arterial</span><input value={form.bloodPressure} maxLength={30} onChange={event => setForm(current => ({ ...current, bloodPressure: event.target.value }))} className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15" placeholder="Ex.: 120/80" /></label>
            <label><span className="mb-1.5 block text-sm font-medium text-slate-700">Temperatura (C)</span><input inputMode="decimal" value={form.temperature} onChange={event => setForm(current => ({ ...current, temperature: event.target.value }))} className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15" /></label>
            <label><span className="mb-1.5 block text-sm font-medium text-slate-700">Peso (kg)</span><input inputMode="decimal" value={form.weight} onChange={event => setForm(current => ({ ...current, weight: event.target.value }))} className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15" /></label>
            <label><span className="mb-1.5 block text-sm font-medium text-slate-700">Altura (m)</span><input inputMode="decimal" value={form.height} onChange={event => setForm(current => ({ ...current, height: event.target.value }))} className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15" /></label>
            <label><span className="mb-1.5 block text-sm font-medium text-slate-700">Frequencia cardiaca</span><input inputMode="numeric" value={form.heartRate} onChange={event => setForm(current => ({ ...current, heartRate: event.target.value }))} className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15" /></label>
            <label className="md:col-span-2"><span className="mb-1.5 block text-sm font-medium text-slate-700">Queixa principal</span><textarea value={form.chiefComplaint} maxLength={2000} onChange={event => setForm(current => ({ ...current, chiefComplaint: event.target.value }))} rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15" /></label>
            <label className="md:col-span-2"><span className="mb-1.5 block text-sm font-medium text-slate-700">Evolucao registrada</span><textarea value={form.evolution} maxLength={10000} onChange={event => setForm(current => ({ ...current, evolution: event.target.value }))} rows={5} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15" /></label>
            <label className="md:col-span-2"><span className="mb-1.5 block text-sm font-medium text-slate-700">Conduta registrada</span><textarea value={form.conduct} maxLength={10000} onChange={event => setForm(current => ({ ...current, conduct: event.target.value }))} rows={5} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15" /></label>
          </div>
          <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3"><button type="button" onClick={closeDialog} disabled={pending} className="min-h-11 rounded border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700">Cancelar</button><button type="submit" disabled={pending} className="min-h-11 rounded bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">{pending ? "Registrando..." : "Concluir atendimento"}</button></footer>
        </form>
      </div>}
    </div>
  );
}
