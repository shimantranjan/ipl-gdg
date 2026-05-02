import { PlusCircle, Save } from "lucide-react"
import { BALL_TYPES } from "../utils/teamData"

function inputClass() {
  return "h-10 w-full rounded-lg border border-border bg-bg px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-accent"
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  )
}

export default function LiveUpdatePanel({ matchState, onUpdate, onAddBall }) {
  const bowlerFigures = `${matchState.bowler.wickets}/${matchState.bowler.runs}`

  return (
    <section className="rounded-lg border border-border bg-bg-2 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-rajdhani text-2xl font-bold text-white">Live Match Data</h2>
        <div className="flex items-center gap-2 text-xs font-bold text-green-300">
          <Save className="h-4 w-4" aria-hidden="true" />
          Auto-saves to dashboard
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Field label="Score">
          <input value={matchState.score} onChange={(event) => onUpdate("score", event.target.value)} placeholder="89/2" className={inputClass()} />
        </Field>
        <Field label="Overs">
          <input value={matchState.overs} onChange={(event) => onUpdate("overs", event.target.value)} placeholder="11.3" className={inputClass()} />
        </Field>
        <Field label="Striker">
          <input value={matchState.striker.name} onChange={(event) => onUpdate("strikerName", event.target.value)} placeholder="Striker name" className={inputClass()} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Runs">
            <input type="number" min="0" value={matchState.striker.runs} onChange={(event) => onUpdate("strikerRuns", event.target.value)} className={inputClass()} />
          </Field>
          <Field label="Balls">
            <input type="number" min="0" value={matchState.striker.balls} onChange={(event) => onUpdate("strikerBalls", event.target.value)} className={inputClass()} />
          </Field>
        </div>
        <Field label="Non-striker">
          <input value={matchState.nonStriker.name} onChange={(event) => onUpdate("nonStrikerName", event.target.value)} placeholder="Non-striker name" className={inputClass()} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Runs">
            <input type="number" min="0" value={matchState.nonStriker.runs} onChange={(event) => onUpdate("nonStrikerRuns", event.target.value)} className={inputClass()} />
          </Field>
          <Field label="Balls">
            <input type="number" min="0" value={matchState.nonStriker.balls} onChange={(event) => onUpdate("nonStrikerBalls", event.target.value)} className={inputClass()} />
          </Field>
        </div>
        <Field label="Bowler">
          <input value={matchState.bowler.name} onChange={(event) => onUpdate("bowlerName", event.target.value)} placeholder="Bowler name" className={inputClass()} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Figures">
            <input value={bowlerFigures} onChange={(event) => onUpdate("bowlerFigures", event.target.value)} placeholder="2/24" className={inputClass()} />
          </Field>
          <Field label="Overs">
            <input value={matchState.bowler.overs} onChange={(event) => onUpdate("bowlerOvers", event.target.value)} placeholder="3.0" className={inputClass()} />
          </Field>
        </div>
      </div>

      <div className="mt-4">
        <span className="mb-2 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Add latest ball</span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {BALL_TYPES.map((ball) => (
            <button
              key={ball}
              type="button"
              onClick={() => onAddBall(ball)}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-border bg-bg px-3 text-xs font-bold text-slate-300 transition hover:border-accent hover:text-white"
            >
              <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {ball}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
