const TABS = [
  { key: "insights", label: "🔍 Insights" },
  { key: "chat", label: "🤖 Ask AI" },
  { key: "fantasy", label: "⭐ Fantasy" }
]

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-bg-2 p-2">
      {TABS.map((tab) => {
        const active = activeTab === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`h-11 rounded-lg font-rajdhani text-sm font-bold transition sm:text-lg ${
              active ? "bg-accent text-white shadow-lg shadow-orange-950/30" : "bg-transparent text-slate-400 hover:bg-bg-3 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
