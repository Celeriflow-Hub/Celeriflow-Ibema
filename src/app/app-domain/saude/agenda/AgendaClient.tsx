"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CalendarPlus, Search, X } from "lucide-react";
import { createHealthAppointmentAction, transitionHealthAppointmentAction } from "./actions";

type Appointment = {
  id: string;
  date: string;
  specialty: string | null;
  priority: string;
  status: string;
  patient: { person: { fullName: string } };
  unit: { name: string };
  professional: { employee: { name: string } } | null;
};

type Patient = { id: string; person: { fullName: string }; cns: string | null };
type Unit = { id: string; name: string };
type Professional = { id: string; unitId: string | null; specialty: string | null; employee: { name: string } };

type AppointmentForm = {
  patientId: string;
  unitId: string;
  professionalId: string;
  date: string;
  specialty: string;
  priority: "Normal" | "Prioridade" | "Urgência";
};

function currentLocalDateTime() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function initialForm(patients: Patient[], units: Unit[]): AppointmentForm {
  return {
    patientId: patients[0]?.id || "",
    unitId: units[0]?.id || "",
    professionalId: "",
    date: currentLocalDateTime(),
    specialty: "",
    priority: "Normal",
  };
}

export default function AgendaClient({
  appointments,
  patients,
  units,
  professionals,
  canCreate,
  canUpdate,
}: {
  appointments: Appointment[];
  patients: Patient[];
  units: Unit[];
  professionals: Professional[];
  canCreate: boolean;
  canUpdate: boolean;
}) {
  const router = useRouter();
  const locked = useRef(false);
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<AppointmentForm>(() => initialForm(patients, units));

  const visibleAppointments = appointments.filter(appointment => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return !term || [appointment.patient.person.fullName, appointment.unit.name, appointment.professional?.employee.name || "", appointment.specialty || "", appointment.status]
      .some(value => value.toLocaleLowerCase("pt-BR").includes(term));
  });
  const availableProfessionals = professionals.filter(professional => !professional.unitId || professional.unitId === form.unitId);

  function closeDialog() {
    if (pending) return;
    setOpen(false);
    setError("");
  }

  function openDialog() {
    setForm(initialForm(patients, units));
    setError("");
    setOpen(true);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    setError("");
    startTransition(async () => {
      try {
        const result = await createHealthAppointmentAction({ ...form, professionalId: form.professionalId || null });
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

  function changeStatus(appointmentId: string, status: "Aguardando" | "Em Atendimento" | "Faltou" | "Cancelado") {
    if (locked.current) return;
    const cancellationReason = status === "Cancelado" ? window.prompt("Informe o motivo do cancelamento:")?.trim() || "" : null;
    if (status === "Cancelado" && !cancellationReason) return;
    locked.current = true;
    setError("");
    startTransition(async () => {
      try {
        const result = await transitionHealthAppointmentAction({ appointmentId, status, cancellationReason });
        if (result.error) {
          setError(result.error);
          return;
        }
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
        <label className="relative block max-w-md flex-1">
          <span className="sr-only">Buscar agendamentos</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar paciente, unidade ou profissional" className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15" />
        </label>
        {canCreate && <button type="button" onClick={openDialog} disabled={!patients.length || !units.length || pending} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"><CalendarPlus className="size-4" />Novo agendamento</button>}
      </div>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800" aria-label="Lista de agendamentos">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr><th className="p-3 font-semibold">Data e hora</th><th className="p-3 font-semibold">Paciente</th><th className="p-3 font-semibold">Unidade</th><th className="p-3 font-semibold">Profissional</th><th className="p-3 font-semibold">Especialidade</th><th className="p-3 font-semibold">Situacao</th>{canUpdate && <th className="p-3 text-right font-semibold">Acoes</th>}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleAppointments.length === 0 ? <tr><td colSpan={canUpdate ? 7 : 6} className="p-8 text-center text-slate-500">Nenhum agendamento encontrado.</td></tr> : visibleAppointments.map(appointment => (
                <tr key={appointment.id} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-700">{new Date(appointment.date).toLocaleString("pt-BR")}</td>
                  <td className="p-3 font-medium text-slate-900">{appointment.patient.person.fullName}</td>
                  <td className="p-3 text-slate-700">{appointment.unit.name}</td>
                  <td className="p-3 text-slate-700">{appointment.professional?.employee.name || "Nao definido"}</td>
                  <td className="p-3 text-slate-700">{appointment.specialty || "-"}</td>
                  <td className="p-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{appointment.status}</span></td>
                  {canUpdate && <td className="p-3 text-right"><div className="flex justify-end gap-1">
                    {appointment.status === "Agendado" && <><button type="button" disabled={pending} onClick={() => changeStatus(appointment.id, "Aguardando")} className="rounded border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50 disabled:opacity-50">Chegou</button><button type="button" disabled={pending} onClick={() => changeStatus(appointment.id, "Em Atendimento")} className="rounded border border-emerald-300 px-2 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-50 disabled:opacity-50">Iniciar</button></>}
                    {appointment.status === "Aguardando" && <button type="button" disabled={pending} onClick={() => changeStatus(appointment.id, "Em Atendimento")} className="rounded border border-emerald-300 px-2 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-50 disabled:opacity-50">Iniciar</button>}
                    {["Agendado", "Aguardando"].includes(appointment.status) && <button type="button" disabled={pending} onClick={() => changeStatus(appointment.id, "Faltou")} className="rounded border border-amber-300 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-50 disabled:opacity-50">Faltou</button>}
                    {["Agendado", "Aguardando"].includes(appointment.status) && <button type="button" disabled={pending} onClick={() => changeStatus(appointment.id, "Cancelado")} className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-50 disabled:opacity-50">Cancelar</button>}
                  </div></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
        <form onSubmit={submit} className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl" aria-labelledby="new-appointment-title">
          <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 id="new-appointment-title" className="text-base font-semibold text-slate-900">Novo agendamento</h2><p className="mt-1 text-sm text-slate-500">A vaga e confirmada somente depois da validacao no servidor.</p></div><button type="button" onClick={closeDialog} disabled={pending} className="rounded p-2 text-slate-500 hover:bg-slate-100" aria-label="Fechar"><X className="size-5" /></button></header>
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <label className="md:col-span-2"><span className="mb-1.5 block text-sm font-medium text-slate-700">Paciente</span><select required value={form.patientId} onChange={event => setForm(current => ({ ...current, patientId: event.target.value }))} className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"><option value="" disabled>Selecione um paciente</option>{patients.map(patient => <option key={patient.id} value={patient.id}>{patient.person.fullName}{patient.cns ? ` - CNS ${patient.cns}` : ""}</option>)}</select></label>
            <label><span className="mb-1.5 block text-sm font-medium text-slate-700">Unidade</span><select required value={form.unitId} onChange={event => setForm(current => ({ ...current, unitId: event.target.value, professionalId: "" }))} className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"><option value="" disabled>Selecione uma unidade</option>{units.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
            <label><span className="mb-1.5 block text-sm font-medium text-slate-700">Profissional</span><select value={form.professionalId} onChange={event => setForm(current => ({ ...current, professionalId: event.target.value }))} className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"><option value="">Definir posteriormente</option>{availableProfessionals.map(professional => <option key={professional.id} value={professional.id}>{professional.employee.name}{professional.specialty ? ` - ${professional.specialty}` : ""}</option>)}</select></label>
            <label><span className="mb-1.5 block text-sm font-medium text-slate-700">Data e hora</span><input required type="datetime-local" value={form.date} onChange={event => setForm(current => ({ ...current, date: event.target.value }))} className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15" /></label>
            <label><span className="mb-1.5 block text-sm font-medium text-slate-700">Prioridade administrativa</span><select value={form.priority} onChange={event => setForm(current => ({ ...current, priority: event.target.value as AppointmentForm["priority"] }))} className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"><option value="Normal">Normal</option><option value="Prioridade">Prioridade</option><option value="Urgência">Urgencia</option></select></label>
            <label className="md:col-span-2"><span className="mb-1.5 block text-sm font-medium text-slate-700">Especialidade</span><input value={form.specialty} maxLength={200} onChange={event => setForm(current => ({ ...current, specialty: event.target.value }))} className="min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15" placeholder="Opcional" /></label>
          </div>
          <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3"><button type="button" onClick={closeDialog} disabled={pending} className="min-h-11 rounded border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700">Cancelar</button><button type="submit" disabled={pending} className="min-h-11 rounded bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">{pending ? "Confirmando..." : "Confirmar agendamento"}</button></footer>
        </form>
      </div>}
    </div>
  );
}
