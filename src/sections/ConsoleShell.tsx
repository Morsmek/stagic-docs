import { useState } from 'react'
import { TOOLS, GROUPS, type Tool } from '@/tools/registry'

/** Dark terminal/IDE shell — all monospace, hairline #262626 grid, aqua accent */
export function ConsoleShell() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = TOOLS.find((t) => t.id === activeId)

  return (
    <div className="min-h-screen flex flex-col font-body2 text-[13px] leading-relaxed">
      {/* Terminal title bar */}
      <header className="rule-b flex items-center px-4 py-2.5 gap-4">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--line)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--line)' }} />
          <span className="w-2.5 h-2.5 rounded-full t-accent-bg" />
        </div>
        <button onClick={() => setActiveId(null)} className="font-bold tracking-tight hover:text-[var(--accent)] transition-colors">
          stagic@docs:~$
        </button>
        <span className="t-muted hidden sm:inline">./toolkit --local --no-upload</span>
        <span className="ml-auto t-muted tnum">v1.0 · {TOOLS.length} tools</span>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Command rail */}
        <aside className="w-52 md:w-60 shrink-0 rule-r overflow-auto">
          {GROUPS.map((g) => (
            <div key={g} className="rule-b">
              <p className="micro-label px-4 pt-4 pb-2" style={{ color: 'var(--accent)' }}>
                # {g.toLowerCase()}
              </p>
              {TOOLS.filter((t) => t.group === g).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className={`w-full text-left px-4 py-1.5 transition-colors flex items-baseline gap-2 ${
                    activeId === t.id ? 't-accent-fg' : 't-subtle-hover'
                  }`}
                  style={activeId === t.id ? { background: 'var(--accent)' } : undefined}
                >
                  <span className="t-muted">›</span>
                  {t.cmd}
                </button>
              ))}
            </div>
          ))}
          <p className="px-4 py-4 text-[11px] t-muted leading-relaxed">
            // files are processed in-browser
            <br />
            // nothing leaves this machine
          </p>
        </aside>

        {/* Output pane */}
        <main className="flex-1 min-w-0 overflow-auto">
          {active ? (
            <ToolPane tool={active} onBack={() => setActiveId(null)} />
          ) : (
            <div className="px-6 md:px-10 py-10 max-w-3xl">
              <pre className="text-[12px] leading-loose t-muted mb-8 whitespace-pre-wrap">
{`$ stagic docs --help
USAGE        drop a file, get a file back
PRIVACY      100% client-side, zero network calls
FORMATS      pdf · docx · md · txt · png · jpg · webp`}
              </pre>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-8" style={{ color: 'var(--fg)' }}>
                stagic docs<span className="t-accent">_</span>
              </h1>
              <div className="rule t-divide">
                {TOOLS.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveId(t.id)}
                    className="w-full text-left px-4 py-3 flex items-baseline gap-4 t-accent-fill transition-colors group"
                  >
                    <span className="tnum t-muted w-8 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-bold w-32 shrink-0">{t.cmd}</span>
                    <span className="t-muted group-hover:text-inherit truncate">{t.desc}</span>
                  </button>
                ))}
              </div>
              <p className="mt-6 text-[11px] t-muted">▸ stack: pdf-lib · pdf.js · mammoth · piexifjs — all open source</p>
            </div>
          )}
        </main>
      </div>

      {/* Status bar */}
      <footer className="rule-t px-4 py-1.5 flex items-center justify-between text-[11px]">
        <span style={{ color: 'var(--accent)' }}>● ready</span>
        <span className="t-muted tnum">{active ? `running: ${active.cmd}` : 'idle'} · utf-8 · local</span>
      </footer>
    </div>
  )
}

function ToolPane({ tool, onBack }: { tool: Tool; onBack: () => void }) {
  return (
    <div>
      <div className="rule-b px-6 md:px-10 py-5 flex items-baseline gap-4">
        <button onClick={onBack} className="t-accent hover:underline shrink-0">
          cd ..
        </button>
        <div>
          <h1 className="text-xl font-bold">
            {tool.name} <span className="t-muted font-normal">— {tool.desc}</span>
          </h1>
        </div>
      </div>
      <div className="px-6 md:px-10 py-8 max-w-3xl">{tool.el}</div>
    </div>
  )
}
