import { RefreshCw, Satellite } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { fetchCricbuzzLiveScore } from "../utils/liveScore"
import Spinner from "./shared/Spinner"

export default function LiveScoreConnector({ onApplyScore }) {
  const [matchSource, setMatchSource] = useState(localStorage.getItem("cricbuzzMatchSource") || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [status, setStatus] = useState("")
  const [autoRefresh, setAutoRefresh] = useState(false)
  const intervalRef = useRef(null)

  async function refresh() {
    setLoading(true)
    setError("")
    try {
      const liveData = await fetchCricbuzzLiveScore(matchSource)
      localStorage.setItem("cricbuzzMatchSource", matchSource.trim())
      onApplyScore(liveData)
      setStatus(liveData.status || `Updated ${new Date().toLocaleTimeString()}`)
    } catch (err) {
      setError(err.message || "Unable to fetch live score.")
      setAutoRefresh(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!autoRefresh) {
      clearInterval(intervalRef.current)
      return undefined
    }

    intervalRef.current = setInterval(refresh, 30000)
    return () => clearInterval(intervalRef.current)
  }, [autoRefresh, matchSource])

  return (
    <section className="rounded-lg border border-border bg-bg-2 p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Satellite className="h-5 w-5 text-accent-blue" aria-hidden="true" />
          <h2 className="font-rajdhani text-2xl font-bold text-white">Cricbuzz Live Sync</h2>
        </div>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(event) => setAutoRefresh(event.target.checked)}
            disabled={!matchSource.trim() || loading}
            className="h-4 w-4 rounded border-border bg-bg accent-orange-500"
          />
          Auto-refresh 30s
        </label>
      </div>

      <div className="flex flex-col gap-2 md:flex-row">
        <input
          value={matchSource}
          onChange={(event) => setMatchSource(event.target.value)}
          placeholder="Cricbuzz match ID or live match URL"
          className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-accent"
        />
        <button
          type="button"
          onClick={refresh}
          disabled={loading || !matchSource.trim()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-bold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {loading ? <Spinner size="sm" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
          Sync Score
        </button>
      </div>

      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
      {status && !error ? <p className="mt-2 text-sm text-green-300">{status}</p> : null}
      <p className="mt-2 text-xs leading-5 text-slate-500">
        Uses a Cricbuzz-compatible JSON proxy. If it cannot read a match, paste the exact Cricbuzz live score URL.
      </p>
    </section>
  )
}
