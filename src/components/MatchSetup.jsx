import { AlertCircle } from "lucide-react"
import { BALL_TYPES, MATCH_SITUATIONS, TEAMS, VENUES } from "../utils/teamData"
import ApiKeyBanner from "./shared/ApiKeyBanner"

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span>
      {children}
    </label>
  )
}

function inputClass() {
  return "h-11 w-full rounded-lg border border-border bg-bg-2 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-accent"
}

export default function MatchSetup({ matchState, onUpdate, onLoad, apiKey }) {
  const sameTeams = matchState.battingTeam === matchState.bowlingTeam
  const hasApiKey = Boolean(apiKey && apiKey.trim())
  const currentBalls = matchState.currentOverBalls || []
  const bowlerFigures = `${matchState.bowler.wickets}/${matchState.bowler.runs}`

  function updateBall(index, value) {
    const nextBalls = [...currentBalls]
    nextBalls[index] = value
    onUpdate("currentOverBalls", nextBalls)
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!sameTeams) onLoad()
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <ApiKeyBanner show={!hasApiKey} />

      <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-bg-2 p-4 shadow-2xl shadow-black/20 sm:p-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-rajdhani text-3xl font-bold text-accent">⚡ Configure Match</h1>
          {sameTeams ? (
            <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-200">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              Choose two different teams
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Batting Team">
            <select value={matchState.battingTeam} onChange={(event) => onUpdate("battingTeam", event.target.value)} className={inputClass()}>
              {TEAMS.map((team) => <option key={team.name}>{team.name}</option>)}
            </select>
          </Field>

          <Field label="Bowling Team">
            <select value={matchState.bowlingTeam} onChange={(event) => onUpdate("bowlingTeam", event.target.value)} className={inputClass()}>
              {TEAMS.map((team) => <option key={team.name}>{team.name}</option>)}
            </select>
          </Field>

          <Field label="Venue">
            <select value={matchState.venue} onChange={(event) => onUpdate("venue", event.target.value)} className={inputClass()}>
              {VENUES.map((venue) => <option key={venue}>{venue}</option>)}
            </select>
          </Field>

          <Field label="Match Situation">
            <select value={matchState.matchSituation} onChange={(event) => onUpdate("matchSituation", event.target.value)} className={inputClass()}>
              {MATCH_SITUATIONS.map((situation) => <option key={situation}>{situation}</option>)}
            </select>
          </Field>

          <Field label="Score">
            <input value={matchState.score} onChange={(event) => onUpdate("score", event.target.value)} placeholder="89/2" className={inputClass()} />
          </Field>

          <Field label="Overs">
            <input value={matchState.overs} onChange={(event) => onUpdate("overs", event.target.value)} placeholder="11.3" className={inputClass()} />
          </Field>

          <label className="flex h-11 items-center gap-3 rounded-lg border border-border bg-bg-2 px-3 md:mt-6">
            <input
              type="checkbox"
              checked={matchState.isSecondInnings}
              onChange={(event) => onUpdate("isSecondInnings", event.target.checked)}
              className="h-4 w-4 rounded border-border bg-bg accent-orange-500"
            />
            <span className="text-sm font-bold text-slate-200">Is 2nd Innings?</span>
          </label>

          {matchState.isSecondInnings ? (
            <Field label="Target">
              <input
                type="text"
                inputMode="numeric"
                value={matchState.target}
                onChange={(event) => onUpdate("target", event.target.value)}
                placeholder="181"
                className={inputClass()}
              />
            </Field>
          ) : <div className="hidden md:block" />}

          <Field label="Striker Name">
            <input value={matchState.striker.name} onChange={(event) => onUpdate("strikerName", event.target.value)} placeholder="Rohit Sharma" className={inputClass()} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Striker Runs">
              <input type="number" min="0" value={matchState.striker.runs} onChange={(event) => onUpdate("strikerRuns", event.target.value)} className={inputClass()} />
            </Field>
            <Field label="Striker Balls">
              <input type="number" min="0" value={matchState.striker.balls} onChange={(event) => onUpdate("strikerBalls", event.target.value)} className={inputClass()} />
            </Field>
          </div>

          <Field label="Non-Striker Name">
            <input value={matchState.nonStriker.name} onChange={(event) => onUpdate("nonStrikerName", event.target.value)} placeholder="Suryakumar Yadav" className={inputClass()} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Non-Striker Runs">
              <input type="number" min="0" value={matchState.nonStriker.runs} onChange={(event) => onUpdate("nonStrikerRuns", event.target.value)} className={inputClass()} />
            </Field>
            <Field label="Non-Striker Balls">
              <input type="number" min="0" value={matchState.nonStriker.balls} onChange={(event) => onUpdate("nonStrikerBalls", event.target.value)} className={inputClass()} />
            </Field>
          </div>

          <Field label="Bowler Name">
            <input value={matchState.bowler.name} onChange={(event) => onUpdate("bowlerName", event.target.value)} placeholder="Ravindra Jadeja" className={inputClass()} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Bowler Figures">
              <input value={bowlerFigures} onChange={(event) => onUpdate("bowlerFigures", event.target.value)} placeholder="2/24" className={inputClass()} />
            </Field>
            <Field label="Bowler Overs">
              <input value={matchState.bowler.overs} onChange={(event) => onUpdate("bowlerOvers", event.target.value)} placeholder="3.0" className={inputClass()} />
            </Field>
          </div>
        </div>

        <div className="mt-5">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Last 6 Balls</span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <select
                key={index}
                value={currentBalls[index] || ""}
                onChange={(event) => updateBall(index, event.target.value)}
                className={inputClass()}
                aria-label={`Ball ${index + 1}`}
              >
                <option value="">Ball {index + 1}</option>
                {BALL_TYPES.map((ball) => <option key={ball} value={ball}>{ball}</option>)}
              </select>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={sameTeams}
          className="mt-6 h-12 w-full rounded-lg bg-accent font-rajdhani text-lg font-bold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          🚀 LOAD MATCH COMPANION
        </button>
      </form>
    </main>
  )
}
