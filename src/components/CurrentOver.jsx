const BALL_STYLES = {
  dot: "bg-[#1e2a3a] text-slate-300 border-slate-600",
  "1": "bg-green-500 text-white border-green-300",
  "2": "bg-green-600 text-white border-green-300",
  "3": "bg-green-700 text-white border-green-300",
  "4": "bg-blue-500 text-white border-blue-300",
  "6": "bg-orange-500 text-white border-orange-300",
  W: "bg-red-600 text-white border-red-300",
  Wide: "bg-yellow-400 text-slate-950 border-yellow-200",
  "No Ball": "bg-yellow-500 text-slate-950 border-yellow-200"
}

function ballRuns(ball) {
  if (ball === "Wide" || ball === "No Ball") return 1
  if (ball === "dot" || ball === "W") return 0
  return Number(ball) || 0
}

export default function CurrentOver({ balls = [], overNumber = "0.0" }) {
  const overRuns = balls.reduce((sum, ball) => sum + ballRuns(ball), 0)
  const visibleBalls = balls.slice(-6)
  const remaining = Math.max(0, 6 - visibleBalls.length)

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-bg-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-rajdhani text-2xl font-bold text-white">Over {overNumber}</h2>
        <p className="text-xs text-slate-500">Current over sequence</p>
      </div>

      <div className="flex flex-1 items-center gap-2 overflow-x-auto sm:justify-center">
        {visibleBalls.map((ball, index) => (
          <span
            key={`${ball}-${index}`}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${BALL_STYLES[ball] || BALL_STYLES.dot}`}
            title={ball}
          >
            {ball === "dot" ? "•" : ball === "Wide" ? "Wd" : ball === "No Ball" ? "Nb" : ball}
          </span>
        ))}
        {Array.from({ length: remaining }).map((_, index) => (
          <span key={`empty-${index}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-border bg-bg text-slate-700" />
        ))}
      </div>

      <div className="rounded-lg border border-border bg-bg px-4 py-2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Over Runs</p>
        <p className="font-rajdhani text-2xl font-bold text-accent">{overRuns}</p>
      </div>
    </section>
  )
}
