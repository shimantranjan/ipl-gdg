import { calcBowlerEco, calcCRR, calcProjected, calcRRR, calcStrikeRate } from "./cricketCalc"

export const GEMINI_MODEL = "gemini-2.5-flash"
export const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

async function parseGeminiError(res) {
  try {
    const data = await res.json()
    return data?.error?.message || res.statusText || "Unknown Gemini API error"
  } catch {
    return res.statusText || "Unknown Gemini API error"
  }
}

async function callGemini(prompt, apiKey) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error("Gemini API key is required")
  }

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey.trim()
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        responseMimeType: "application/json"
      }
    })
  })
  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await parseGeminiError(res)}`)
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error("Gemini returned an empty response")
  return text
}

function safeParseJSON(text) {
  const cleaned = String(text ?? "")
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim()

  const candidates = [cleaned]
  const arrayStart = cleaned.indexOf("[")
  const arrayEnd = cleaned.lastIndexOf("]")
  const objectStart = cleaned.indexOf("{")
  const objectEnd = cleaned.lastIndexOf("}")

  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    candidates.push(cleaned.slice(arrayStart, arrayEnd + 1))
  }

  if (objectStart !== -1 && objectEnd > objectStart) {
    candidates.push(cleaned.slice(objectStart, objectEnd + 1))
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate)
    } catch {
      // Try the next likely JSON fragment.
    }
  }

  return null
}

function toArrayPayload(parsed, keys = []) {
  if (Array.isArray(parsed)) return parsed
  if (!parsed || typeof parsed !== "object") return []

  if ("tag" in parsed && "text" in parsed) return [parsed]

  for (const key of keys) {
    if (Array.isArray(parsed[key])) return parsed[key]
    if (parsed[key] && typeof parsed[key] === "object") {
      return toArrayPayload(parsed[key], keys)
    }
  }

  const firstArray = Object.values(parsed).find((value) => Array.isArray(value))
  if (firstArray) return firstArray

  return Object.entries(parsed)
    .map(([key, value]) => {
      if (typeof value === "string") {
        return { tag: key, text: value }
      }
      if (value && typeof value === "object") {
        return {
          tag: value.tag || key,
          text: value.text || value.insight || value.reason || value.summary || ""
        }
      }
      return null
    })
    .filter(Boolean)
}

function fallbackInsights(matchContext, reason) {
  const score = matchContext.match(/Score:\s*([^\n]+)/i)?.[1] || "the current score"
  const crr = matchContext.match(/CRR:\s*([^|]+)/i)?.[1]?.trim() || "current"
  const last6 = matchContext.match(/Last 6 balls:\s*([^\n]+)/i)?.[1] || "recent balls"

  return [
    {
      tag: "TACTICAL",
      text: `AI response format was unusual, so here is a local read: at ${score}, the batting side should use the next over to protect wickets while keeping boundary options open.`
    },
    {
      tag: "PREDICTION",
      text: `With a current run rate around ${crr}, projected scoring depends heavily on whether the next six balls include a boundary or wicket.`
    },
    {
      tag: "MOMENTUM",
      text: `Recent sequence: ${last6}. Boundary-heavy overs lift batting momentum; dots and wickets shift pressure back to the fielding side.`
    },
    {
      tag: "FANTASY",
      text: "Prioritize the active batter if set, otherwise back the current bowler when wickets or dot-ball pressure are building."
    },
    {
      tag: "MILESTONE",
      text: `Gemini format note: ${reason || "response could not be normalized into insight cards"}. Refresh can still pull a cleaner AI response.`
    }
  ]
}

export function buildMatchContext(matchState) {
  const strikerSR = calcStrikeRate(matchState.striker?.runs, matchState.striker?.balls)
  const nonStrikerSR = calcStrikeRate(matchState.nonStriker?.runs, matchState.nonStriker?.balls)
  const bowlerEco = calcBowlerEco(matchState.bowler?.runs, matchState.bowler?.overs)
  const crr = matchState.crr || calcCRR(matchState.runs, matchState.overs)
  const rrr = matchState.rrr || calcRRR(matchState.target, matchState.runs, matchState.overs)
  const projected = matchState.projected || calcProjected(matchState.runs, matchState.overs)
  const last6Balls = Array.isArray(matchState.currentOverBalls) && matchState.currentOverBalls.length
    ? matchState.currentOverBalls.slice(-6).join(", ")
    : "None"
  const target = matchState.isSecondInnings && matchState.target ? matchState.target : "Not applicable"
  const bowlerFigures = `${matchState.bowler?.wickets || 0}/${matchState.bowler?.runs || 0}`

  return `Match: ${matchState.battingTeam} vs ${matchState.bowlingTeam}
Venue: ${matchState.venue}
Situation: ${matchState.matchSituation}
Score: ${matchState.score} in ${matchState.overs} overs
CRR: ${crr} | RRR: ${rrr} | Projected: ${projected}
Striker: ${matchState.striker?.name || "Unknown"} - ${matchState.striker?.runs || 0}(${matchState.striker?.balls || 0}) SR:${strikerSR}
Non-striker: ${matchState.nonStriker?.name || "Unknown"} - ${matchState.nonStriker?.runs || 0}(${matchState.nonStriker?.balls || 0}) SR:${nonStrikerSR}
Bowler: ${matchState.bowler?.name || "Unknown"} - ${bowlerFigures} Eco:${bowlerEco}
Last 6 balls: ${last6Balls}
Target: ${target}`
}

export async function fetchInsights(matchContext, apiKey) {
  try {
    const prompt = `You are an elite IPL analyst. Based on this match:\n${matchContext}\n
Generate exactly 5 insights as a JSON array only (no markdown, no extra text):
[
  {"tag": "TACTICAL", "text": "insight about current battle"},
  {"tag": "PREDICTION", "text": "win probability with %"},
  {"tag": "MOMENTUM", "text": "which team has upper hand"},
  {"tag": "FANTASY", "text": "best captain/VC pick with reason"},
  {"tag": "MILESTONE", "text": "upcoming player milestone or head-to-head fact"}
]`
    const text = await callGemini(prompt, apiKey)
    const parsed = safeParseJSON(text)
    const parsedInsights = toArrayPayload(parsed, ["insights", "data", "items"])
    if (!parsedInsights.length) return fallbackInsights(matchContext, "Gemini did not return insight cards in JSON format.")

    const insights = parsedInsights
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        tag: String(item.tag || "TACTICAL").toUpperCase(),
        text: String(item.text || "").trim()
      }))
      .filter((item) => item.text)

    if (!insights.length) return fallbackInsights(matchContext, "Gemini returned JSON without usable text fields.")
    return insights.slice(0, 5)
  } catch (error) {
    if (error.message === "Gemini API key is required") {
      return [{
        tag: "ERROR",
        text: "Add your Gemini API key to generate live AI insights."
      }]
    }

    return fallbackInsights(matchContext, error.message)
  }
}

export async function fetchFantasyPicks(matchContext, apiKey) {
  try {
    const prompt = `You are an IPL fantasy expert. Based on this match:\n${matchContext}\n
Return top 6 fantasy picks as JSON array only (no markdown, no extra text):
[{
  "name": "Player Name",
  "team": "Team Short",
  "role": "BAT|BOWL|AR|WK",
  "points": 52,
  "badge": "C",
  "reason": "One sentence reason"
}]
badge must be: 'C' for captain, 'VC' for vice-captain, or null for others.
Exactly one 'C' and one 'VC' in the array.`
    const text = await callGemini(prompt, apiKey)
    const parsed = safeParseJSON(text)
    const parsedPicks = toArrayPayload(parsed, ["picks", "fantasyPicks", "players", "data", "items"])
    if (!parsedPicks.length) return []

    const picks = parsedPicks
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        name: String(item.name || "Unknown Player").trim(),
        team: String(item.team || "").trim().toUpperCase(),
        role: ["BAT", "BOWL", "AR", "WK"].includes(String(item.role || "").toUpperCase())
          ? String(item.role).toUpperCase()
          : "BAT",
        points: Number.isFinite(Number(item.points)) ? Number(item.points) : 0,
        badge: item.badge === "C" || item.badge === "VC" ? item.badge : null,
        reason: String(item.reason || "Strong current-match involvement.").trim()
      }))
      .slice(0, 6)

    const normalized = picks.map((pick) => ({ ...pick, badge: pick.badge === "C" || pick.badge === "VC" ? pick.badge : null }))
    let captainSet = false
    let viceCaptainSet = false

    normalized.forEach((pick) => {
      if (pick.badge === "C") {
        if (captainSet) pick.badge = null
        captainSet = true
      }
      if (pick.badge === "VC") {
        if (viceCaptainSet) pick.badge = null
        viceCaptainSet = true
      }
    })

    if (normalized.length && !captainSet) normalized[0].badge = "C"
    if (normalized.length > 1 && !viceCaptainSet) normalized[1].badge = "VC"

    return normalized
  } catch {
    return []
  }
}

export async function sendChatMessage(messages, matchContext, apiKey) {
  try {
    if (!apiKey || !apiKey.trim()) {
      throw new Error("Gemini API key is required")
    }

    const contextText = `You are Gemini AI inside IPL Smart Match Companion. Use this live match context for every answer:\n${matchContext}`
    const hasContext = messages.some((message) => {
      return message?.role === "user" && message?.parts?.some((part) => String(part.text || "").includes("IPL Smart Match Companion"))
    })
    const contents = hasContext
      ? messages
      : [{ role: "user", parts: [{ text: contextText }] }, ...messages]

    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey.trim()
      },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.65, maxOutputTokens: 768 }
      })
    })

    if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await parseGeminiError(res)}`)
    const data = await res.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "I could not find enough context to answer that."
  } catch {
    return "Sorry, I couldn't connect to Gemini. Check your API key."
  }
}
