import EmptyState from "./shared/EmptyState"

const ROLE_STYLES = {
  BAT: "bg-blue-500/20 text-blue-200 border-blue-400/40",
  BOWL: "bg-red-500/20 text-red-200 border-red-400/40",
  AR: "bg-green-500/20 text-green-200 border-green-400/40",
  WK: "bg-yellow-500/20 text-yellow-100 border-yellow-400/40"
}

function SkeletonPick() {
  return (
    <div className="rounded-lg border border-border bg-bg p-4">
      <div className="skeleton mb-4 h-5 w-16" />
      <div className="skeleton mb-2 h-5 w-3/4" />
      <div className="skeleton mb-4 h-4 w-20" />
      <div className="skeleton h-12 w-full" />
    </div>
  )
}

export default function FantasyPicks({ picks, loading, error, matchLoaded }) {
  if (!matchLoaded) {
    return <EmptyState icon="⭐" title="Load a match to see fantasy picks" subtitle="Captain and vice-captain calls appear after setup." />
  }

  if (loading) {
    return (
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => <SkeletonPick key={index} />)}
      </section>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
        {error}
      </div>
    )
  }

  if (!picks?.length) {
    return <EmptyState icon="⭐" title="No fantasy picks yet" subtitle="Save an API key and refresh insights to populate picks." />
  }

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {picks.map((pick, index) => (
        <article key={`${pick.name}-${index}`} className="relative rounded-lg border border-border bg-bg-2 p-4">
          {pick.badge ? (
            <span className={`absolute right-3 top-3 rounded-full px-2 py-1 text-[10px] font-bold text-white ${pick.badge === "C" ? "bg-accent" : "bg-blue-500"}`}>
              {pick.badge}
            </span>
          ) : null}
          <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold ${ROLE_STYLES[pick.role] || ROLE_STYLES.BAT}`}>
            {pick.role}
          </span>
          <h3 className="mt-3 pr-10 font-rajdhani text-xl font-bold text-white">{pick.name}</h3>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{pick.team || "IPL"}</p>
          <div className="mt-4 font-rajdhani text-4xl font-bold text-green-400">{pick.points}</div>
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Fantasy points</p>
          <p className="mt-3 text-[11px] italic leading-5 text-slate-400">{pick.reason}</p>
        </article>
      ))}
    </section>
  )
}
