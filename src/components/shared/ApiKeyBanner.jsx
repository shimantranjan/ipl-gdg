import { AlertTriangle } from "lucide-react"

export default function ApiKeyBanner({ show }) {
  if (!show) return null

  return (
    <div className="mb-5 flex items-center gap-3 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
      <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-400" aria-hidden="true" />
      <span>⚠️ Add your Gemini API key in the header to enable AI features</span>
    </div>
  )
}
