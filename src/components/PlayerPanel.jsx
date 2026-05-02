import { Shield, Zap } from "lucide-react"
import { calcBowlerEco, calcPartnership, calcStrikeRate } from "../utils/cricketCalc"

function phaseFromSituation(situation) {
  const upper = String(situation || "").toUpperCase()
  if (upper.includes("POWERPLAY") || upper.includes("EARLY")) return "POWERPLAY"
  if (upper.includes("DEATH") || upper.includes("FINAL")) return "DEATH"
  return "MIDDLE"
}

function PlayerLine({ name, runs, balls, striker }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0">
      <div className="min-w-0">
        <p className="truncate font-rajdhani text-xl font-bold text-white">
          {name || "Unnamed Batter"}{striker ? "*" : ""}
        </p>
        <p className="text-xs text-slate-500">SR {calcStrikeRate(runs, balls)}</p>
      </div>
      <div className="shrink-0 font-rajdhani text-2xl font-bold text-accent">
        {runs}({balls})
      </div>
    </div>
  )
}

export default function PlayerPanel({ matchState }) {
  const partnership = calcPartnership(matchState.striker, matchState.nonStriker)
  const bowlerEco = calcBowlerEco(matchState.bowler.runs, matchState.bowler.overs)
  const phase = phaseFromSituation(matchState.matchSituation)

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-bg-2 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent-green" aria-hidden="true" />
          <h2 className="font-rajdhani text-2xl font-bold text-white">🏏 At Crease</h2>
        </div>
        <PlayerLine {...matchState.striker} striker />
        <PlayerLine {...matchState.nonStriker} />
        <div className="mt-3 rounded-lg bg-bg px-3 py-2 text-sm text-slate-300">
          Partnership: <span className="font-bold text-white">{partnership.runs}</span>({partnership.balls} balls)
        </div>
      </div>

      <div className="rounded-lg border border-border bg-bg-2 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" aria-hidden="true" />
            <h2 className="font-rajdhani text-2xl font-bold text-white">⚡ Bowling</h2>
          </div>
          <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-bold text-orange-200">{phase}</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-border py-4">
          <div className="min-w-0">
            <p className="truncate font-rajdhani text-xl font-bold text-white">{matchState.bowler.name || "Unnamed Bowler"}</p>
            <p className="text-xs text-slate-500">{matchState.bowler.overs} overs</p>
          </div>
          <div className="text-right">
            <p className="font-rajdhani text-2xl font-bold text-accent">{matchState.bowler.wickets}/{matchState.bowler.runs}</p>
            <p className="text-xs text-slate-500">Eco {bowlerEco}</p>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-bg px-3 py-2 text-sm text-slate-300">
          Phase indicator: <span className="font-bold text-white">{phase}</span>
        </div>
      </div>
    </section>
  )
}
