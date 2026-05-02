export const DEFAULT_CRICBUZZ_PROXY = "/cricbuzz-proxy"
export const CRICBUZZ_SITE_PROXY = "/cricbuzz-site"

function cleanText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim()
}

function resolveLocalUrl(path) {
  if (!path.startsWith("/")) return path
  const origin = globalThis.location?.origin || ""
  return `${origin}${path}`
}

function toNumber(value) {
  const match = cleanText(value).match(/\d+(?:\.\d+)?/)
  return match ? Number(match[0]) : 0
}

function parseScoreLine(value) {
  const text = cleanText(value)
  const match = text.match(/(.+?)\s+(\d+)\s*[-/]\s*(\d+)\s*\((\d+\.\d+)\)/)
  if (!match) return null

  return {
    battingTeamShort: cleanText(match[1]).toUpperCase(),
    runs: Number(match[2]),
    wickets: Number(match[3]),
    overs: match[4],
    score: `${Number(match[2])}/${Number(match[3])}`
  }
}

function parseFigures(wickets, runs, fallback) {
  const fallbackMatch = cleanText(fallback).match(/(\d+)\s*[-/]\s*(\d+)/)
  return {
    wickets: Number.isFinite(Number(wickets)) ? Number(wickets) : Number(fallbackMatch?.[1] || 0),
    runs: Number.isFinite(Number(runs)) ? Number(runs) : Number(fallbackMatch?.[2] || 0)
  }
}

function findFirstString(source, keys) {
  for (const key of keys) {
    const value = source?.[key]
    if (typeof value === "string" || typeof value === "number") {
      const text = cleanText(value)
      if (text) return text
    }
  }
  return ""
}

function findNestedObject(source, keys) {
  for (const key of keys) {
    if (source?.[key] && typeof source[key] === "object") return source[key]
  }
  return {}
}

function htmlToLines(html) {
  const withoutNoise = String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, "\"")

  return withoutNoise
    .split(/\n+/)
    .map(cleanText)
    .filter(Boolean)
}

function lineNumber(lines, index) {
  return toNumber(lines[index])
}

function isNumericText(value) {
  return /^\d+(?:\.\d+)?$/.test(cleanText(value))
}

function normalizeRecentBall(ball) {
  const value = cleanText(ball)
  if (value === "0") return "dot"
  if (value === "Wd" || value === "WD") return "Wide"
  if (value === "Nb" || value === "NB") return "No Ball"
  if (/^L\d+$/.test(value) || /^B\d+$/.test(value)) return value.replace(/^[LB]/, "") || "1"
  return value
}

function parseSplitScore(lines) {
  for (let index = 0; index < lines.length - 7; index += 1) {
    const team = cleanText(lines[index])
    const runs = cleanText(lines[index + 1])
    const separator = cleanText(lines[index + 2])
    const wickets = cleanText(lines[index + 3])
    const openParen = cleanText(lines[index + 4])
    const overs = cleanText(lines[index + 5])
    const closeParen = cleanText(lines[index + 6])

    if (
      /^[A-Z]{2,5}$/.test(team) &&
      isNumericText(runs) &&
      (separator === "-" || separator === "/") &&
      isNumericText(wickets) &&
      openParen === "(" &&
      isNumericText(overs) &&
      closeParen === ")"
    ) {
      return {
        battingTeamShort: team,
        runs: Number(runs),
        wickets: Number(wickets),
        overs,
        score: `${Number(runs)}/${Number(wickets)}`
      }
    }
  }

  return null
}

function parseMetaScore(html) {
  const metaMatch = String(html || "").match(/\b([A-Z]{2,5})\s+(\d+)\s*[-/]\s*(\d+)\s*\((\d+(?:\.\d+)?)\)/)
  if (!metaMatch) return null

  return {
    battingTeamShort: metaMatch[1],
    runs: Number(metaMatch[2]),
    wickets: Number(metaMatch[3]),
    overs: metaMatch[4],
    score: `${Number(metaMatch[2])}/${Number(metaMatch[3])}`
  }
}

function readScorecardRow(lines, startIndex, valueCount) {
  let index = startIndex
  const nameParts = []

  while (index < lines.length && !isNumericText(lines[index]) && cleanText(lines[index]) !== "*") {
    nameParts.push(lines[index])
    index += 1
  }

  if (cleanText(lines[index]) === "*") index += 1

  const values = lines.slice(index, index + valueCount).map(cleanText)
  return {
    name: cleanText(nameParts.join(" ")).replace(/\s+\*$/, ""),
    values,
    nextIndex: index + valueCount
  }
}

function parseCricbuzzPageHtml(html) {
  const lines = htmlToLines(html)
  const joined = lines.join(" ")
  const joinedScoreMatch = joined.match(/\b([A-Z]{2,5})\s+(\d+)\s*[-/]\s*(\d+)\s*\((\d+(?:\.\d+)?)\)\s+CRR[:\s]*([\d.]+)/)
  const score = joinedScoreMatch
    ? {
      battingTeamShort: joinedScoreMatch[1],
      runs: Number(joinedScoreMatch[2]),
      wickets: Number(joinedScoreMatch[3]),
      overs: joinedScoreMatch[4],
      score: `${Number(joinedScoreMatch[2])}/${Number(joinedScoreMatch[3])}`,
      crr: joinedScoreMatch[5]
    }
    : parseSplitScore(lines) || parseMetaScore(html)

  if (!score) {
    throw new Error("Cricbuzz page loaded, but score was not visible yet.")
  }

  const batterIndex = lines.findIndex((line, index) => {
    return line === "Batter" && lines[index + 1] === "R" && lines[index + 2] === "B"
  })
  const bowlerIndex = lines.findIndex((line, index) => {
    return line === "Bowler" && lines[index + 1] === "O" && lines[index + 2] === "M"
  })
  const recentIndex = lines.findIndex((line) => line.toLowerCase().startsWith("recent"))
  const statusIndex = lines.findIndex((line) => line.includes("opt to") || line.includes("need") || line.includes("won by"))

  const firstBatterRow = batterIndex >= 0 ? readScorecardRow(lines, batterIndex + 6, 5) : null
  const secondBatterRow = firstBatterRow ? readScorecardRow(lines, firstBatterRow.nextIndex, 5) : null
  const firstBowlerRow = bowlerIndex >= 0 ? readScorecardRow(lines, bowlerIndex + 6, 5) : null

  const striker = firstBatterRow
    ? { name: firstBatterRow.name, runs: Number(firstBatterRow.values[0]) || 0, balls: Number(firstBatterRow.values[1]) || 0 }
    : { name: "", runs: 0, balls: 0 }

  const nonStriker = secondBatterRow
    ? { name: secondBatterRow.name, runs: Number(secondBatterRow.values[0]) || 0, balls: Number(secondBatterRow.values[1]) || 0 }
    : { name: "", runs: 0, balls: 0 }

  const bowler = firstBowlerRow
    ? {
      name: firstBowlerRow.name,
      overs: cleanText(firstBowlerRow.values[0]),
      runs: Number(firstBowlerRow.values[2]) || 0,
      wickets: Number(firstBowlerRow.values[3]) || 0
    }
    : { name: "", overs: "", runs: 0, wickets: 0 }

  const recent = recentIndex >= 0 ? cleanText(lines[recentIndex + 1]) : ""

  return {
    score: score.score,
    runs: score.runs,
    wickets: score.wickets,
    overs: score.overs,
    battingTeamShort: score.battingTeamShort,
    crr: score.crr || "",
    status: statusIndex >= 0 ? lines[statusIndex] : "",
    striker,
    nonStriker,
    bowler,
    currentOverBalls: recent
      .split(/\s+/)
      .map(normalizeRecentBall)
      .filter((ball) => ["dot", "1", "2", "3", "4", "6", "W", "Wide", "No Ball"].includes(ball))
      .slice(-6)
  }
}

async function fetchCricbuzzPageScore(matchSource) {
  const source = cleanText(matchSource)
  let path = ""

  if (/^https?:\/\//i.test(source)) {
    const url = new URL(source)
    path = `${url.pathname}${url.search}`
  } else {
    path = `/live-cricket-scores/${encodeURIComponent(source)}`
  }

  const res = await fetch(resolveLocalUrl(`${CRICBUZZ_SITE_PROXY}${path}`))
  if (!res.ok) throw new Error(`Cricbuzz page fetch failed with ${res.status}.`)

  return parseCricbuzzPageHtml(await res.text())
}

function flattenObject(value, output = {}) {
  if (!value || typeof value !== "object") return output

  Object.entries(value).forEach(([key, entry]) => {
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      flattenObject(entry, output)
    } else if (!(key in output)) {
      output[key] = entry
    }
  })

  return output
}

export function normalizeCricbuzzPayload(payload) {
  const root = payload?.livescore || payload?.livedata || payload?.data || payload?.score || payload?.match || payload
  const flat = flattenObject(root)

  const currentScore = findFirstString(flat, [
    "current",
    "score",
    "scoreline",
    "scoreLine",
    "battingScore",
    "inningsScore"
  ])
  const parsedScore = parseScoreLine(currentScore)

  const batsman = findNestedObject(root, ["batsman", "striker", "currentBatsman"])
  const nonStriker = findNestedObject(root, ["batsmantwo", "nonStriker", "non_striker"])
  const bowler = findNestedObject(root, ["bowler", "currentBowler"])
  const bowlerFigures = parseFigures(
    bowler.wickets ?? flat.bowlerwicket ?? flat.bowlerWickets,
    bowler.runs ?? flat.bowlerrun ?? flat.bowlerRuns,
    findFirstString(flat, ["bowlerfigures", "bowlerFigures", "figures"])
  )

  const strikerName = cleanText(
    batsman.name || flat.batsman || flat.striker || flat.currentBatsman || ""
  ).replace(/\*$/, "")
  const nonStrikerName = cleanText(
    nonStriker.name || flat.batsmantwo || flat.nonStriker || flat.non_striker || ""
  ).replace(/\*$/, "")
  const bowlerName = cleanText(bowler.name || flat.bowler || flat.currentBowler || "")

  return {
    score: parsedScore?.score || "",
    runs: parsedScore?.runs,
    wickets: parsedScore?.wickets,
    overs: parsedScore?.overs || findFirstString(flat, ["overs", "over"]),
    battingTeamShort: parsedScore?.battingTeamShort || "",
    status: findFirstString(flat, ["status", "matchStatus", "update"]),
    striker: {
      name: strikerName,
      runs: toNumber(batsman.runs ?? flat.batsmanrun ?? flat.strikerRuns),
      balls: toNumber(batsman.balls ?? flat.ballsfaced ?? flat.strikerBalls)
    },
    nonStriker: {
      name: nonStrikerName,
      runs: toNumber(nonStriker.runs ?? flat.batsmantworun ?? flat.nonStrikerRuns),
      balls: toNumber(nonStriker.balls ?? flat.batsmantwoballsfaced ?? flat.nonStrikerBalls)
    },
    bowler: {
      name: bowlerName,
      overs: cleanText(bowler.overs ?? flat.bowlerover ?? flat.bowlerOvers),
      runs: bowlerFigures.runs,
      wickets: bowlerFigures.wickets
    }
  }
}

export async function fetchCricbuzzLiveScore(matchSource, baseUrl = DEFAULT_CRICBUZZ_PROXY) {
  const source = cleanText(matchSource)
  if (!source) throw new Error("Enter a Cricbuzz match ID or match URL.")

  const safeBase = cleanText(baseUrl).replace(/\/+$/, "") || DEFAULT_CRICBUZZ_PROXY
  const queryKey = /^https?:\/\//i.test(source) ? "url" : "id"
  const endpoint = `${safeBase}/s?${queryKey}=${encodeURIComponent(source)}`

  try {
    const res = await fetch(endpoint)
    if (!res.ok) throw new Error(`Live score API failed with ${res.status}.`)

    const text = await res.text()
    let payload
    try {
      payload = JSON.parse(text)
    } catch {
      throw new Error("Live score API returned non-JSON data.")
    }

    if (payload?.success === false || payload?.success === "false") {
      throw new Error("No live score found in the JSON proxy.")
    }

    const normalized = normalizeCricbuzzPayload(payload)
    if (normalized.score || normalized.status || normalized.striker.name || normalized.bowler.name) {
      return normalized.score ? normalized : await fetchCricbuzzPageScore(source)
    }
  } catch {
    // The unofficial JSON proxy is flaky; the Cricbuzz page parser below is the primary fallback.
  }

  const fallback = await fetchCricbuzzPageScore(source)
  if (!fallback.score && !fallback.status && !fallback.striker.name && !fallback.bowler.name) {
    throw new Error("Cricbuzz page loaded, but no usable match data was found.")
  }

  return fallback
}
