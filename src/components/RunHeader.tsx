import React, { useEffect, useMemo, useState } from 'react'
import { AgentRunState } from '../types/agent'

export function RunHeader({ state }: { state: AgentRunState }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const elapsed = useMemo(() => {
    if (!state.startTime) return '00:00'
    const diff = Math.max(0, now - state.startTime)
    const s = Math.floor(diff / 1000)
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  }, [now, state.startTime])

  return (
    <header className="flex items-center justify-between p-4 glass-card rounded-lg">
      <div>
        <div className="text-xl text-zinc-100 font-semibold">Agent Run</div>
        <div className="text-sm text-zinc-400">Live • {state.id} • {state.status}</div>
      </div>
      <div className="text-right">
        <div className="text-sm text-zinc-300">Elapsed</div>
        <div className="text-2xl text-indigo-200 font-mono">{elapsed}</div>
      </div>
    </header>
  )
}
