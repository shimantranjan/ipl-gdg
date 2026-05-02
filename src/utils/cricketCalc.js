export function oversToBalls(oversString) {
  const raw = String(oversString ?? "").trim()
  if (!raw) return 0

  const [overPart = "0", ballPart = "0"] = raw.split(".")
  const overs = Math.max(0, parseInt(overPart, 10) || 0)
  const balls = Math.max(0, parseInt(ballPart, 10) || 0)
  return overs * 6 + Math.min(balls, 5)
}

export function ballsToOvers(balls) {
  const safeBalls = Math.max(0, Number(balls) || 0)
  return `${Math.floor(safeBalls / 6)}.${safeBalls % 6}`
}

export function calcCRR(runs, oversString) {
  const totalBalls = oversToBalls(oversString)
  if (!totalBalls) return "0.00"
  return ((Number(runs) || 0) / totalBalls * 6).toFixed(2)
}

export function calcRRR(target, runs, oversString) {
  const numericTarget = Number(target)
  if (!numericTarget || numericTarget <= 0) return "—"

  const remaining = numericTarget - (Number(runs) || 0)
  if (remaining <= 0) return "—"

  const ballsLeft = 120 - oversToBalls(oversString)
  if (ballsLeft <= 0) return "—"

  return (remaining / ballsLeft * 6).toFixed(2)
}

export function calcProjected(runs, oversString) {
  const crr = Number(calcCRR(runs, oversString))
  if (!Number.isFinite(crr)) return 0
  return Math.max(0, Math.round(crr * 20))
}

export function calcMomentum(ballsArray) {
  const impact = {
    W: -20,
    dot: -5,
    "1": 2,
    "2": 4,
    "3": 6,
    "4": 10,
    "6": 15,
    Wide: -2,
    "No Ball": -2
  }

  const score = (Array.isArray(ballsArray) ? ballsArray : []).reduce((total, ball) => {
    return total + (impact[ball] ?? 0)
  }, 50)

  return Math.max(0, Math.min(100, score))
}

export function calcPartnership(striker, nonStriker) {
  const runs = (Number(striker?.runs) || 0) + (Number(nonStriker?.runs) || 0)
  const balls = (Number(striker?.balls) || 0) + (Number(nonStriker?.balls) || 0)
  const sr = balls ? (runs / balls * 100).toFixed(2) : "0.00"
  return { runs, balls, sr }
}

export function calcBowlerEco(runs, oversString) {
  const totalBalls = oversToBalls(oversString)
  if (!totalBalls) return "0.00"
  return ((Number(runs) || 0) / totalBalls * 6).toFixed(2)
}

export function calcStrikeRate(runs, balls) {
  const safeBalls = Number(balls) || 0
  if (!safeBalls) return "0.00"
  return ((Number(runs) || 0) / safeBalls * 100).toFixed(2)
}
