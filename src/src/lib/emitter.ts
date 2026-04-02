import { AgentEvent, AgentEventEmitter, AgentEventSubscriber, ReplayOptions } from '../types/agent'

export function createAgentEmitter(): AgentEventEmitter {
  const subs = new Set<AgentEventSubscriber>()
  let replayTimerIds: number[] = []
  let isReplaying = false

  function subscribe(sub: AgentEventSubscriber) {
    subs.add(sub)
    return () => subs.delete(sub)
  }

  function emit(event: AgentEvent) {
    subs.forEach((s) => s(event))
  }

  function stopReplay() {
    isReplaying = false
    replayTimerIds.forEach((id) => clearTimeout(id))
    replayTimerIds = []
  }

  async function startReplay(events: AgentEvent[], opts?: ReplayOptions) {
    stopReplay()
    isReplaying = true
    const speed = opts?.speed ?? 1
    const jitter = opts?.jitterMs ?? 100

    if (events.length === 0) return

    // Use relative timings between events
    for (let i = 0; i < events.length && isReplaying; i++) {
      const current = events[i]
      const prev = events[i - 1]
      const baseDelay = i === 0 ? 0 : Math.max(10, current.timestamp - (prev?.timestamp ?? current.timestamp))
      const jitterMs = Math.floor((Math.random() - 0.5) * 2 * jitter)
      const delay = Math.max(0, Math.floor(baseDelay / speed) + jitterMs)

      await new Promise<void>((res) => {
        const id = setTimeout(() => {
          if (!isReplaying) return res()
          emit(current)
          res()
        }, delay)
        replayTimerIds.push(id as unknown as number)
      })
    }

    isReplaying = false
  }

  return {
    subscribe,
    emit,
    startReplay: startReplay as any,
    stopReplay,
    get isReplaying() {
      return isReplaying
    }
  }
}
