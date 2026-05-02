import { SendHorizontal } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import EmptyState from "./shared/EmptyState"

const QUICK_ASKS = [
  "Who will win?",
  "Best batting strategy?",
  "Next bowler?",
  "Fantasy captain?",
  "Pitch report?",
  "Key matchup?"
]

export default function AskAI({ messages, onSend, loading, matchLoaded }) {
  const [input, setInput] = useState("")
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  if (!matchLoaded) {
    return <EmptyState icon="🤖" title="Load a match first" subtitle="The chat uses match context after the dashboard is live." />
  }

  function submit(text) {
    const question = String(text || input).trim()
    if (!question || loading) return
    setInput("")
    onSend(question)
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") submit()
  }

  return (
    <section className="rounded-lg border border-border bg-bg-2 p-4">
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {QUICK_ASKS.map((ask) => (
          <button
            key={ask}
            type="button"
            onClick={() => submit(ask)}
            disabled={loading}
            className="h-9 shrink-0 rounded-full border border-border bg-bg px-3 text-xs font-bold text-slate-300 transition hover:border-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {ask}
          </button>
        ))}
      </div>

      <div className="max-h-[430px] min-h-[280px] overflow-y-auto rounded-lg border border-border bg-bg p-3">
        {messages.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-center text-sm text-slate-500">
            Ask Gemini about tactics, momentum, fantasy choices, or matchups.
          </div>
        ) : null}

        <div className="space-y-3">
          {messages.map((message, index) => {
            const isUser = message.role === "user"
            const text = message.parts?.[0]?.text || ""
            return (
              <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-6 ${
                  isUser ? "bg-accent text-white" : "border border-border bg-bg-3 text-slate-100"
                }`}>
                  {!isUser ? <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-blue-300">Gemini AI</div> : null}
                  {text}
                </div>
              </div>
            )
          })}

          {loading ? (
            <div className="flex justify-start">
              <div className="chat-dots flex items-center gap-1 rounded-lg border border-border bg-bg-3 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-blue-300" />
                <span className="h-2 w-2 rounded-full bg-blue-300" />
                <span className="h-2 w-2 rounded-full bg-blue-300" />
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Ask a match question"
          className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-accent disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => submit()}
          disabled={loading || !input.trim()}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-bold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          <SendHorizontal className="h-4 w-4" aria-hidden="true" />
          Ask
        </button>
      </div>
    </section>
  )
}
