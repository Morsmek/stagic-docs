import { useState } from 'react'
import { TOOLS, GROUPS, type Tool } from '@/tools/registry'

/** Editorial shell — warm gray, deep navy ink, serif display, numbered index list */
export function StudioShell() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = TOOLS.find((t) => t.id === activeId)

  return (
    <div className="min-h-screen flex flex-col font-body2">
      <header className="rule-b">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-baseline justify-between">
          <button onClick={() => setActiveId(null)} className="font-display2 text-xl font-semibold tracking-tight">
            Stagic <em className="not-italic t-accent">Docs</em>
          </button>
          <nav className="micro-label t-muted">Document toolkit — local &amp; private</nav>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 md:py-16">
        {active ? (
          <StudioToolView tool={active} onBack={() => setActiveId(null)} />
        ) : (
          <>
            <p className="micro-label t-accent mb-4">Stagic · Document Toolkit</p>
            <h1 className="font-display2 text-4xl md:text-6xl font-semibold leading-[1.02] tracking-tight mb-6">
              Twelve quiet tools for loud paperwork.
            </h1>
            <p className="max-w-lg text-[15px] leading-relaxed t-muted mb-14">
              Merge, split, compress and convert. Inspect what your files say about you — then make
              them stop saying it. Everything runs in your browser; nothing is uploaded, ever.
            </p>

            {GROUPS.map((g) => (
              <section key={g} className="mb-12">
                <h2 className="micro-label t-muted mb-0 pb-3">{g}</h2>
                <div className="rule-t">
                  {TOOLS.filter((t) => t.group === g).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveId(t.id)}
                      className="w-full text-left rule-b py-4 flex items-baseline gap-5 group transition-colors t-subtle-hover px-2 -mx-2"
                    >
                      <span className="font-body2 tnum text-xs t-muted w-7 shrink-0">
                        {String(TOOLS.indexOf(t) + 1).padStart(2, '0')}
                      </span>
                      <span className="font-display2 text-xl md:text-2xl font-semibold tracking-tight group-hover:translate-x-1 transition-transform">
                        {t.name}
                      </span>
                      <span className="ml-auto text-xs t-muted text-right hidden sm:block max-w-56">{t.desc}</span>
                      <span className="t-accent opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}

            <p className="text-xs t-muted leading-relaxed border-l-2 pl-4" style={{ borderColor: 'var(--accent)' }}>
              Powered by open-source libraries — pdf-lib, PDF.js, Mammoth, piexifjs, JSZip.
              Your files never leave this device.
            </p>
          </>
        )}
      </main>

      <footer className="rule-t">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between micro-label t-muted">
          <span>© {new Date().getFullYear()} Stagic</span>
          <span>Open tools, built on open source</span>
        </div>
      </footer>
    </div>
  )
}

function StudioToolView({ tool, onBack }: { tool: Tool; onBack: () => void }) {
  return (
    <>
      <button onClick={onBack} className="micro-label t-muted hover:text-[var(--accent)] transition-colors mb-8">
        ← Index
      </button>
      <p className="micro-label t-accent mb-2">{tool.group}</p>
      <h1 className="font-display2 text-3xl md:text-5xl font-semibold tracking-tight leading-tight">{tool.name}</h1>
      <p className="t-muted text-sm mt-2 mb-10 max-w-md">{tool.desc}</p>
      <div className="max-w-2xl">{tool.el}</div>
    </>
  )
}
