export default function LoadingAppDomain() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3 p-2">
      <span className="sr-only">Carregando...</span>
      <div className="h-7 w-64 max-w-full animate-pulse rounded bg-slate-200" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded border border-slate-200 bg-white" />
    </div>
  );
}
