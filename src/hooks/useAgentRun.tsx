import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { createAgentEmitter } from '../lib/emitter'
import { createStateMachine, baseReducer } from '../lib/stateMachine'
import type { AgentEvent, AgentRunState, AgentEventEmitter, AgentStateMachine } from '../types/agent'

export function useAgentRun(initialState: AgentRunState) {
  const emitterRef = useRef<AgentEventEmitter | null>(null)
  const machineRef = useRef<AgentStateMachine | null>(null)
  const [, force] = useState(0)

  if (!emitterRef.current) emitterRef.current = createAgentEmitter()
  if (!machineRef.current) machineRef.current = createStateMachine(initialState, baseReducer)

  const emitter = emitterRef.current
  const machine = machineRef.current

  useEffect(() => {
    const unsub = emitter.subscribe((e) => machine.dispatch(e))
    return unsub
  }, [emitter, machine])

  useEffect(() => {
    const unsub = machine.subscribe(() => force((c) => c + 1))
    return unsub
  }, [machine])

  const api = useMemo(() => ({
    emitter,
    machine,
    dispatchEvent(event: AgentEvent) {
      emitter.emit(event)
    },
    startReplay(events: AgentEvent[], opts?: any) {
      return emitter.startReplay?.(events, opts)
    },
    stopReplay() {
      return emitter.stopReplay?.()
    }
  }), [emitter, machine])

  return { state: machine.getState(), ...api }
}
