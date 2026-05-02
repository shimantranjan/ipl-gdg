import { useMemo, useState } from "react"
import { calcCRR, calcMomentum, calcProjected, calcRRR } from "../utils/cricketCalc"

const INITIAL_STATE = {
  battingTeam: "Mumbai Indians",
  bowlingTeam: "Chennai Super Kings",
  venue: "Wankhede Stadium, Mumbai",
  matchSituation: "1st Innings — Powerplay (Ov 1–6)",
  isSecondInnings: false,
  target: "",

  score: "0/0",
  runs: 0,
  wickets: 0,
  overs: "0.0",

  striker: { name: "", runs: 0, balls: 0 },
  nonStriker: { name: "", runs: 0, balls: 0 },
  bowler: { name: "", overs: "0.0", runs: 0, wickets: 0 },

  currentOverBalls: [],

  crr: "0.00",
  rrr: "—",
  projected: 0,
  momentum: 50,

  matchLoaded: false,
  activeTab: "insights",

  insights: [],
  fantasyPicks: [],
  chatMessages: [],
  insightsLoading: false,
  fantasyLoading: false,
  chatLoading: false,
  insightsError: null,
  fantasyError: null
}

function normalizeNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, number) : 0
}

function parseScore(score) {
  const [runsRaw = "0", wicketsRaw = "0"] = String(score ?? "").split("/")
  const runs = normalizeNumber(parseInt(runsRaw, 10))
  const wickets = Math.min(10, normalizeNumber(parseInt(wicketsRaw, 10)))
  return { runs, wickets, score: `${runs}/${wickets}` }
}

function parseBowlerFigures(value, currentBowler) {
  const [wicketsRaw, runsRaw] = String(value ?? "").split("/")
  return {
    ...currentBowler,
    wickets: Math.min(10, normalizeNumber(parseInt(wicketsRaw, 10))),
    runs: normalizeNumber(parseInt(runsRaw, 10))
  }
}

function recalculate(state) {
  const target = state.isSecondInnings ? state.target : ""
  return {
    ...state,
    crr: calcCRR(state.runs, state.overs),
    rrr: state.isSecondInnings ? calcRRR(target, state.runs, state.overs) : "—",
    projected: calcProjected(state.runs, state.overs),
    momentum: calcMomentum(state.currentOverBalls)
  }
}

export default function useMatchState() {
  const [matchState, setMatchState] = useState(INITIAL_STATE)

  const actions = useMemo(() => ({
    updateSetup(field, value) {
      setMatchState((prev) => {
        let next = { ...prev, [field]: value }

        if (field === "score") {
          const parsed = parseScore(value)
          next = { ...next, ...parsed }
        }

        if (field === "runs") {
          const runs = normalizeNumber(value)
          next = { ...next, runs, score: `${runs}/${next.wickets}` }
        }

        if (field === "wickets") {
          const wickets = Math.min(10, normalizeNumber(value))
          next = { ...next, wickets, score: `${next.runs}/${wickets}` }
        }

        if (field === "overs") {
          next.overs = String(value || "0.0")
        }

        if (field === "isSecondInnings") {
          const isSecondInnings = Boolean(value)
          next = {
            ...next,
            isSecondInnings,
            target: isSecondInnings ? next.target : "",
            matchSituation: isSecondInnings && !prev.isSecondInnings
              ? "2nd Innings — Early Chase (Ov 1–10)"
              : next.matchSituation
          }
        }

        if (field === "strikerName") next.striker = { ...next.striker, name: value }
        if (field === "strikerRuns") next.striker = { ...next.striker, runs: normalizeNumber(value) }
        if (field === "strikerBalls") next.striker = { ...next.striker, balls: normalizeNumber(value) }
        if (field === "nonStrikerName") next.nonStriker = { ...next.nonStriker, name: value }
        if (field === "nonStrikerRuns") next.nonStriker = { ...next.nonStriker, runs: normalizeNumber(value) }
        if (field === "nonStrikerBalls") next.nonStriker = { ...next.nonStriker, balls: normalizeNumber(value) }
        if (field === "bowlerName") next.bowler = { ...next.bowler, name: value }
        if (field === "bowlerFigures") next.bowler = parseBowlerFigures(value, next.bowler)
        if (field === "bowlerOvers") next.bowler = { ...next.bowler, overs: String(value || "0.0") }
        if (field === "currentOverBalls") {
          next.currentOverBalls = Array.isArray(value) ? value.filter(Boolean).slice(-6) : []
        }

        return recalculate(next)
      })
    },

    loadMatch() {
      setMatchState((prev) => recalculate({
        ...prev,
        matchLoaded: true,
        insightsError: null,
        fantasyError: null
      }))
    },

    updateScore(runs, wickets, overs) {
      setMatchState((prev) => recalculate({
        ...prev,
        runs: normalizeNumber(runs),
        wickets: Math.min(10, normalizeNumber(wickets)),
        score: `${normalizeNumber(runs)}/${Math.min(10, normalizeNumber(wickets))}`,
        overs: String(overs || "0.0")
      }))
    },

    updateStriker(playerObj) {
      setMatchState((prev) => recalculate({
        ...prev,
        striker: {
          name: String(playerObj?.name || ""),
          runs: normalizeNumber(playerObj?.runs),
          balls: normalizeNumber(playerObj?.balls)
        }
      }))
    },

    updateNonStriker(playerObj) {
      setMatchState((prev) => recalculate({
        ...prev,
        nonStriker: {
          name: String(playerObj?.name || ""),
          runs: normalizeNumber(playerObj?.runs),
          balls: normalizeNumber(playerObj?.balls)
        }
      }))
    },

    updateBowler(playerObj) {
      setMatchState((prev) => recalculate({
        ...prev,
        bowler: {
          name: String(playerObj?.name || ""),
          overs: String(playerObj?.overs || "0.0"),
          runs: normalizeNumber(playerObj?.runs),
          wickets: Math.min(10, normalizeNumber(playerObj?.wickets))
        }
      }))
    },

    addBall(ballType) {
      setMatchState((prev) => {
        const nextBalls = [...prev.currentOverBalls, ballType].filter(Boolean).slice(-6)
        return recalculate({ ...prev, currentOverBalls: nextBalls })
      })
    },

    setActiveTab(tabName) {
      setMatchState((prev) => ({ ...prev, activeTab: tabName }))
    },

    setInsights(array) {
      setMatchState((prev) => ({ ...prev, insights: Array.isArray(array) ? array : [] }))
    },

    setFantasyPicks(array) {
      setMatchState((prev) => ({ ...prev, fantasyPicks: Array.isArray(array) ? array : [] }))
    },

    addChatMessage(message) {
      setMatchState((prev) => ({
        ...prev,
        chatMessages: [...prev.chatMessages, message].filter(Boolean)
      }))
    },

    setChatLoading(bool) {
      setMatchState((prev) => ({ ...prev, chatLoading: Boolean(bool) }))
    },

    setInsightsLoading(bool) {
      setMatchState((prev) => ({ ...prev, insightsLoading: Boolean(bool) }))
    },

    setFantasyLoading(bool) {
      setMatchState((prev) => ({ ...prev, fantasyLoading: Boolean(bool) }))
    },

    setInsightsError(error) {
      setMatchState((prev) => ({ ...prev, insightsError: error }))
    },

    setFantasyError(error) {
      setMatchState((prev) => ({ ...prev, fantasyError: error }))
    },

    clearMatch() {
      setMatchState(INITIAL_STATE)
    }
  }), [])

  return { matchState, ...actions }
}
