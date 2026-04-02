import React, { useEffect } from 'react'
import { AgentRunProvider, useAgentRunContext } from './context/AgentRunContext'
import events from './fixtures/events.json'
import initialStateFactory from './initialState'
import { RunHeader } from './components/RunHeader'
import { TaskCard } from './components/TaskCard'

function PanelInner() {
  const { state, startReplay } = useAgentRunContext()

  useEffect(() => {
    // start replay with realistic timings
    startReplay(events as any, { speed: 1, jitterMs: 120 })
  }, [startReplay])

  const grouped: Record<string, any[]> = {}
  state.taskOrder.forEach((id) => {
    const t = state.tasks[id]
    const key = t.parallelGroup || '__default'
    grouped[key] = grouped[key] || []
    grouped[key].push(t)
  })

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto grid gap-4">
        <RunHeader state={state} />

        <div className="space-y-4">
          {Object.keys(grouped).map((g) => (
            <div key={g} className={g === '__default' ? 'space-y-3' : 'grid grid-flow-col auto-cols-fr gap-3'}>
              {grouped[g].map((t: any) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          ))}
        </div>

        {state.finalOutput && (
          <div className="p-4 glass-card rounded-lg mt-4 transform transition ease-out duration-500">
            <div className="text-sm text-emerald-300">Synthesis Complete</div>
            <div className="text-zinc-100 mt-2">{state.finalOutput}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const initial = initialStateFactory()
  return (
    <AgentRunProvider initial={initial}>
      <PanelInner />
    </AgentRunProvider>
  )
}
