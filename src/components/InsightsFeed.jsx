import { RefreshCw } from "lucide-react"
import { TAG_COLORS } from "../utils/teamData"
import EmptyState from "./shared/EmptyState"
import Spinner from "./shared/Spinner"

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-bg-2 p-4">
      <div className="skeleton mb-4 h-5 w-24" />
      <div className="skeleton mb-2 h-4 w-full" />
      <div className="skeleton h-4 w-5/6" />
    </div>
  )
}

export default function InsightsFeed({ insights, loading, error, onRefresh, matchLoaded }) {
  if (!matchLoaded) {
    return <EmptyState icon="🔍" title="Load a match to see insights" subtitle="Gemini analysis appears here once the companion is live." />
  }

  return (
    <section className="rounded-lg border border-border bg-bg-2 p-4">
      {loading ? (
        <div className="grid gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-100">
          <p className="font-rajdhani text-xl font-bold">Insight refresh failed</p>
          <p className="mt-1 text-sm text-red-200">{error}</p>
          <button
            type="button"
            onClick={onRefresh}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-400"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : insights?.length ? (
        <div className="grid gap-3">
          {insights.map((insight, index) => {
            const color = TAG_COLORS[insight.tag] || TAG_COLORS.TACTICAL
            return (
              <article
                key={`${insight.tag}-${index}`}
                className="rounded-lg border border-border bg-bg p-4"
                style={{ borderLeft: `4px solid ${color}` }}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {insight.tag}
                  </span>
                  <span className="text-xs text-slate-500">Just now</span>
                </div>
                <p className="text-sm leading-6 text-slate-200">{insight.text}</p>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyState icon="⚡" title="No insights yet" subtitle="Refresh once your API key is saved." />
      )}

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border-2 bg-bg px-4 py-3 text-sm font-bold text-slate-100 transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Spinner size="sm" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
        🔄 Refresh Insights
      </button>
    </section>
  )
}
