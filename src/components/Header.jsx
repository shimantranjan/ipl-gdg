import { CheckCircle2, KeyRound, Save } from "lucide-react"
import { useEffect, useState } from "react"

export default function Header({ apiKey, onApiKeyChange, matchLoaded }) {
  const [draftKey, setDraftKey] = useState(apiKey || "")
  const hasKey = Boolean(apiKey && apiKey.trim())

  useEffect(() => {
    setDraftKey(apiKey || "")
  }, [apiKey])

  function handleSave() {
    const nextKey = draftKey.trim()
    localStorage.setItem("geminiApiKey", nextKey)
    onApiKeyChange(nextKey)
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <div className="font-rajdhani text-3xl font-bold tracking-normal">
            <span aria-hidden="true">🏏 </span>
            <span className="text-accent">IPL</span>
            <span className="text-white"> Companion</span>
          </div>
          {matchLoaded ? (
            <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-200">
              <span className="live-pulse h-2 w-2 rounded-full bg-red-500" />
              LIVE
            </div>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <label className="relative flex-1 lg:w-80">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              value={draftKey}
              onChange={(event) => setDraftKey(event.target.value)}
              placeholder="Gemini API key"
              className="h-11 w-full rounded-lg border border-border bg-bg-2 pl-10 pr-10 text-sm text-slate-100 outline-none transition focus:border-accent"
            />
            {hasKey ? (
              <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-400" aria-label="API key saved" />
            ) : null}
          </label>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-bold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Save
          </button>
        </div>
      </div>
    </header>
  )
}
