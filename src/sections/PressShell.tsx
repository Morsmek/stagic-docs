import { useState } from 'react'
import { TOOLS, type Tool } from '@/tools/registry'

/** Bold product shell — saturated yellow, flat black/white blocks, huge grotesk type */
export function PressShell() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = TOOLS.find((t) => t.id === activeId)

  return (
    <div className="min-h-screen flex flex-col font-body2">
      {/* Floating pill nav */}
      <div className="sticky top-4 z-10 px-4">
        <header className="max-w-5xl mx-auto flex items-center gap-1 rounded-full px-2 py-2" style={{ background: 'var(--fg)', color: 'var(--bg)' }}>
          <button
            onClick={() => setActiveId(null)}
            className="rounded-full px-4 py-1.5 font-black tracking-tight text-sm hover:opacity-80 transition-opacity"
            style={{ background: 'var(--bg)', color: 'var(--fg)' }}
          >
            STAGIC◆DOCS
          </button>
          <span className="hidden md:inline text-xs px-3 opacity-70">12 free document tools</span>
          <span className="ml-auto text-[10px] uppercase tracking-[0.2em] px-3 opacity-70">No uploads. Ever.</span>
        </header>
      </div>

      {active ? (
        <PressToolView tool={active} onBack={() => setActiveId(null)} />
      ) : (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-14 pb-16">
          <h1 className="font-black uppercase leading-[0.85] tracking-tighter" style={{ fontSize: 'clamp(3rem, 9vw, 7.5rem)' }}>
            Document
            <br />
            chores.
            <br />
            <span className="text-[var(--panel)]" style={{ WebkitTextStroke: '2.5px var(--fg)' }}>
              Done.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-sm font-medium leading-relaxed">
            Merge it. Split it. Shrink it. Scrub its secrets. Stagic Docs does the boring document
            work instantly, right in your browser — free, private, and a little bit loud.
          </p>

          {/* Tool blocks: alternating black / white / yellow */}
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOLS.map((t, i) => {
              const variant = i % 3
              const style =
                variant === 0
                  ? { background: 'var(--fg)', color: 'var(--bg)' }
                  : variant === 1
                    ? { background: 'var(--panel)', color: 'var(--fg)', border: '2px solid var(--fg)' }
                    : { background: 'transparent', color: 'var(--fg)', border: '2px solid var(--fg)' }
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className="text-left p-5 rounded-2xl transition-transform duration-200 hover:-translate-y-1.5 active:translate-y-0 group"
                  style={style}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black tnum" style={{ color: variant === 0 ? 'var(--bg)' : 'inherit', opacity: variant === 2 ? 0.35 : 0.25 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">{t.group}</span>
                  </div>
                  <p className="mt-8 text-lg font-black uppercase tracking-tight leading-none">{t.name}</p>
                  <p className="mt-2 text-xs leading-relaxed opacity-70">{t.desc}</p>
                  <p className="mt-4 text-xs font-black group-hover:translate-x-1 transition-transform">Open →</p>
                </button>
              )
            })}
          </div>

          <div className="mt-14 rounded-2xl p-6" style={{ background: 'var(--fg)', color: 'var(--bg)' }}>
            <p className="text-xs uppercase tracking-[0.25em] opacity-70 mb-2">Built on open source</p>
            <p className="font-bold text-sm">pdf-lib · PDF.js · Mammoth · piexifjs · JSZip</p>
          </div>
        </main>
      )}

      <footer className="px-4 pb-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-bold opacity-70">
          <span>© {new Date().getFullYear()} Stagic</span>
          <span>Free forever</span>
        </div>
      </footer>
    </div>
  )
}

function PressToolView({ tool, onBack }: { tool: Tool; onBack: () => void }) {
  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-10 pb-16">
      <button onClick={onBack} className="text-xs font-black uppercase tracking-[0.2em] hover:opacity-60 transition-opacity">
        ← All tools
      </button>
      <div className="mt-6 rounded-2xl p-6 md:p-8" style={{ background: 'var(--fg)', color: 'var(--bg)' }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-60">{tool.group}</p>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mt-1">{tool.name}</h1>
        <p className="mt-2 text-sm opacity-70">{tool.desc}</p>
      </div>
      <div className="mt-4 rounded-2xl p-6 md:p-8 t-panel" style={{ border: '2px solid var(--fg)', color: 'var(--fg)' }}>
        {tool.el}
      </div>
    </main>
  )
}
