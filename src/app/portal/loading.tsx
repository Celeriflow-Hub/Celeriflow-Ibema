export default function LoadingPortal() {
  return (
    <div role="status" aria-live="polite" className="mx-auto flex w-full max-w-5xl flex-col gap-3 p-4">
      <span className="sr-only">Carregando...</span>
      <div className="h-8 w-72 max-w-full animate-pulse rounded bg-slate-200" />
      <div className="h-40 animate-pulse rounded bg-slate-100" />
      <div className="h-40 animate-pulse rounded bg-slate-100" />
    </div>
  );
}
