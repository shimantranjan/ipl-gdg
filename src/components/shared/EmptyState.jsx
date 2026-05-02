export default function EmptyState({ icon = "○", title, subtitle }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-bg-2 px-6 py-10 text-center">
      <div className="mb-3 text-3xl" aria-hidden="true">{icon}</div>
      <h3 className="font-rajdhani text-xl font-bold text-slate-100">{title}</h3>
      {subtitle ? <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">{subtitle}</p> : null}
    </div>
  )
}
