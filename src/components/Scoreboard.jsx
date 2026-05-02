import { Activity, Gauge, Target, TrendingUp } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { TEAMS } from "../utils/teamData"

function findTeam(name) {
  return TEAMS.find((team) => team.name === name) || TEAMS[0]
}

function runsFromBall(ball) {
  if (ball === "dot" || ball === "W") return 0
  if (ball === "Wide" || ball === "No Ball") return 1
  return Number(ball) || 0
}

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="truncate font-rajdhani text-lg font-bold text-slate-100">{value}</p>
      </div>
    </div>
  )
}

export default function Scoreboard({ matchState }) {
  const battingTeam = findTeam(matchState.battingTeam)
  const bowlingTeam = findTeam(matchState.bowlingTeam)
  const last6 = matchState.currentOverBalls?.length ? matchState.currentOverBalls.slice(-6).join(" ") : "—"
  const chaseInfo = matchState.isSecondInnings && matchState.target ? `Target ${matchState.target}` : "VS"
  const runRateData = (matchState.currentOverBalls?.length ? matchState.currentOverBalls : ["dot"]).map((ball, index, balls) => {
    const runs = balls.slice(0, index + 1).reduce((total, item) => total + runsFromBall(item), 0)
    return {
      ball: index + 1,
      rate: Number((runs / (index + 1) * 6).toFixed(2))
    }
  })

  return (
    <section className="rounded-lg border border-border bg-bg-2 p-4 shadow-2xl shadow-black/20 sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_160px_1fr] lg:items-center">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-rajdhani text-lg font-bold shadow-lg"
            style={{ backgroundColor: battingTeam.color, color: battingTeam.textColor }}
          >
            {battingTeam.short}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-slate-400">{battingTeam.name}</p>
            <div className="font-rajdhani text-4xl font-bold text-white">{matchState.score}</div>
            <p className="text-xs text-slate-500">{matchState.overs} overs</p>
          </div>
        </div>

        <div className="flex items-center justify-center rounded-lg border border-border bg-bg px-4 py-3 text-center font-rajdhani text-xl font-bold text-accent">
          {chaseInfo}
        </div>

        <div className="flex items-center gap-4 lg:justify-end">
          <div className="min-w-0 text-left lg:text-right">
            <p className="truncate text-sm text-slate-500">{bowlingTeam.name}</p>
            <div className="font-rajdhani text-2xl font-bold text-slate-300">{bowlingTeam.short}</div>
            <p className="text-xs text-slate-600">Bowling side</p>
          </div>
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-rajdhani text-lg font-bold opacity-80"
            style={{ backgroundColor: bowlingTeam.color, color: bowlingTeam.textColor }}
          >
            {bowlingTeam.short}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatPill icon={Gauge} label="CRR" value={matchState.crr} />
        <StatPill icon={Target} label="RRR" value={matchState.rrr} />
        <StatPill icon={Activity} label="Last 6" value={last6} />
        <StatPill icon={TrendingUp} label="Projected" value={matchState.projected} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_240px]">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-400">
            <span>{battingTeam.short} Momentum</span>
            <span>{bowlingTeam.short} Pressure</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-gradient-to-r from-orange-600 to-red-600">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-700 ease-out"
              style={{ width: `${matchState.momentum}%` }}
            />
          </div>
          <div className="mt-1 text-right font-rajdhani text-sm font-bold text-slate-300">{matchState.momentum}/100</div>
        </div>

        <div className="h-24 rounded-lg border border-border bg-bg px-2 py-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={runRateData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <XAxis dataKey="ball" hide />
              <YAxis hide domain={[0, "dataMax + 6"]} />
              <Tooltip
                cursor={{ stroke: "#2a3f58" }}
                contentStyle={{ background: "#111827", border: "1px solid #2a3f58", borderRadius: 8, color: "#f1f5f9" }}
                labelFormatter={(label) => `Ball ${label}`}
              />
              <Line type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={3} dot={{ r: 3, fill: "#f97316" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
