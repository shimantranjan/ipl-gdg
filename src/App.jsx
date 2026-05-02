import { useEffect, useState } from "react"
import AskAI from "./components/AskAI"
import CurrentOver from "./components/CurrentOver"
import FantasyPicks from "./components/FantasyPicks"
import Header from "./components/Header"
import InsightsFeed from "./components/InsightsFeed"
import LiveUpdatePanel from "./components/LiveUpdatePanel"
import LiveScoreConnector from "./components/LiveScoreConnector"
import MatchSetup from "./components/MatchSetup"
import PlayerPanel from "./components/PlayerPanel"
import Scoreboard from "./components/Scoreboard"
import TabBar from "./components/TabBar"
import ApiKeyBanner from "./components/shared/ApiKeyBanner"
import useMatchState from "./hooks/useMatchState"
import { buildMatchContext, fetchFantasyPicks, fetchInsights, sendChatMessage } from "./utils/gemini"

export default function App() {
  const [apiKey, setApiKey] = useState("")
  const {
    matchState,
    updateSetup,
    loadMatch,
    addBall,
    setActiveTab,
    setInsights,
    setFantasyPicks,
    addChatMessage,
    setChatLoading,
    setInsightsLoading,
    setFantasyLoading,
    setInsightsError,
    setFantasyError,
    clearMatch
  } = useMatchState()

  useEffect(() => {
    setApiKey(localStorage.getItem("geminiApiKey") || "")
  }, [])

  async function refreshInsights(contextState = matchState) {
    const context = buildMatchContext(contextState)
    setInsightsLoading(true)
    setInsightsError(null)
    try {
      const nextInsights = await fetchInsights(context, apiKey)
      setInsights(nextInsights)
    } catch (error) {
      setInsightsError(error.message || "Unable to fetch insights.")
    } finally {
      setInsightsLoading(false)
    }
  }

  async function refreshFantasy(contextState = matchState) {
    const context = buildMatchContext(contextState)
    setFantasyLoading(true)
    setFantasyError(null)
    try {
      const picks = await fetchFantasyPicks(context, apiKey)
      setFantasyPicks(picks)
    } catch (error) {
      setFantasyError(error.message || "Unable to fetch fantasy picks.")
    } finally {
      setFantasyLoading(false)
    }
  }

  async function handleLoadMatch() {
    loadMatch()
    refreshInsights(matchState)
    refreshFantasy(matchState)
  }

  async function handleSendChat(question) {
    const userMessage = { role: "user", parts: [{ text: question }] }
    const nextMessages = [...matchState.chatMessages, userMessage]
    addChatMessage(userMessage)
    setChatLoading(true)

    const reply = await sendChatMessage(nextMessages, buildMatchContext(matchState), apiKey)
    addChatMessage({ role: "model", parts: [{ text: reply }] })
    setChatLoading(false)
  }

  function applyLiveScore(liveData) {
    if (liveData.score) updateSetup("score", liveData.score)
    if (liveData.overs) updateSetup("overs", liveData.overs)
    if (liveData.striker?.name) updateSetup("strikerName", liveData.striker.name)
    if (Number.isFinite(liveData.striker?.runs)) updateSetup("strikerRuns", liveData.striker.runs)
    if (Number.isFinite(liveData.striker?.balls)) updateSetup("strikerBalls", liveData.striker.balls)
    if (liveData.nonStriker?.name) updateSetup("nonStrikerName", liveData.nonStriker.name)
    if (Number.isFinite(liveData.nonStriker?.runs)) updateSetup("nonStrikerRuns", liveData.nonStriker.runs)
    if (Number.isFinite(liveData.nonStriker?.balls)) updateSetup("nonStrikerBalls", liveData.nonStriker.balls)
    if (liveData.bowler?.name) updateSetup("bowlerName", liveData.bowler.name)
    if (Number.isFinite(liveData.bowler?.wickets) && Number.isFinite(liveData.bowler?.runs)) {
      updateSetup("bowlerFigures", `${liveData.bowler.wickets}/${liveData.bowler.runs}`)
    }
    if (liveData.bowler?.overs) updateSetup("bowlerOvers", liveData.bowler.overs)
    if (Array.isArray(liveData.currentOverBalls) && liveData.currentOverBalls.length) {
      updateSetup("currentOverBalls", liveData.currentOverBalls)
    }
  }

  function handleApiKeyChange(nextKey) {
    setApiKey(nextKey)
  }

  function renderActiveTab() {
    if (matchState.activeTab === "chat") {
      return (
        <AskAI
          messages={matchState.chatMessages}
          onSend={handleSendChat}
          loading={matchState.chatLoading}
          matchLoaded={matchState.matchLoaded}
          matchContext={buildMatchContext(matchState)}
        />
      )
    }

    if (matchState.activeTab === "fantasy") {
      return (
        <FantasyPicks
          picks={matchState.fantasyPicks}
          loading={matchState.fantasyLoading}
          error={matchState.fantasyError}
          matchLoaded={matchState.matchLoaded}
        />
      )
    }

    return (
      <InsightsFeed
        insights={matchState.insights}
        loading={matchState.insightsLoading}
        error={matchState.insightsError}
        onRefresh={() => refreshInsights(matchState)}
        matchLoaded={matchState.matchLoaded}
      />
    )
  }

  return (
    <div className="min-h-screen bg-bg text-slate-100">
      <Header apiKey={apiKey} onApiKeyChange={handleApiKeyChange} matchLoaded={matchState.matchLoaded} />

      {matchState.matchLoaded ? (
        <main className="mx-auto max-w-6xl space-y-4 px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{matchState.venue}</p>
              <h1 className="font-rajdhani text-3xl font-bold text-white">{matchState.battingTeam} vs {matchState.bowlingTeam}</h1>
            </div>
            <button
              type="button"
              onClick={clearMatch}
              className="h-10 rounded-lg border border-border bg-bg-2 px-4 text-sm font-bold text-slate-300 transition hover:border-accent hover:text-white"
            >
              New Match
            </button>
          </div>

          <ApiKeyBanner show={!apiKey.trim()} />
          <LiveScoreConnector onApplyScore={applyLiveScore} />
          <LiveUpdatePanel matchState={matchState} onUpdate={updateSetup} onAddBall={addBall} />
          <Scoreboard matchState={matchState} />
          <PlayerPanel matchState={matchState} />
          <CurrentOver balls={matchState.currentOverBalls} overNumber={matchState.overs} />
          <TabBar activeTab={matchState.activeTab} onTabChange={setActiveTab} />
          {renderActiveTab()}
        </main>
      ) : (
        <MatchSetup matchState={matchState} onUpdate={updateSetup} onLoad={handleLoadMatch} apiKey={apiKey} />
      )}
    </div>
  )
}
