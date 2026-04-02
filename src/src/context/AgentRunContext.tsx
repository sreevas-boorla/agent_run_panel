import React, { createContext, ReactNode, useContext } from 'react'
import { useAgentRun } from '../hooks/useAgentRun'
import type { AgentRunState } from '../types/agent'

const AgentRunContext = createContext<any>(null)

export function AgentRunProvider({ initial, children }: { initial: AgentRunState; children: ReactNode }) {
  const run = useAgentRun(initial)
  return <AgentRunContext.Provider value={run}>{children}</AgentRunContext.Provider>
}

export function useAgentRunContext() {
  const ctx = useContext(AgentRunContext)
  if (!ctx) throw new Error('useAgentRunContext must be used inside provider')
  return ctx
}
