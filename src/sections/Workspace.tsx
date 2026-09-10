import { useState } from 'react'
import { THEMES, type ThemeId } from '@/tools/registry'
import { ConsoleShell } from '@/sections/ConsoleShell'
import { PressShell } from '@/sections/PressShell'
import { StudioShell } from '@/sections/StudioShell'

export default function Workspace() {
  const [theme, setTheme] = useState<ThemeId>('console')

  return (
    <div className={`theme-${theme} font-body2 min-h-screen`} style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      {theme === 'console' && <ConsoleShell />}
      {theme === 'press' && <PressShell />}
      {theme === 'studio' && <StudioShell />}

      {/* Design switcher — floats above every theme */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center rounded-full shadow-xl overflow-hidden"
        style={{ background: '#111', border: '1px solid #333' }}
      >
        <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 pl-4 pr-2">Design</span>
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`px-3.5 py-2 text-[11px] font-mono transition-colors ${
              theme === t.id ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
