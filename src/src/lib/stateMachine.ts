import { AgentEvent, AgentRunState, AgentStateMachine, AgentReducer, Task, TaskStatus, RunStatus } from '../types/agent'

export function createStateMachine(initial: AgentRunState, reducer: AgentReducer): AgentStateMachine {
  let state = initial
  const subs: Set<(s: AgentRunState) => void> = new Set()

  function getState() {
    return state
  }

  function dispatch(event: AgentEvent) {
    const next = reducer(state, event)
    state = next
    subs.forEach((s) => s(state))
  }

  function subscribe(cb: (s: AgentRunState) => void) {
    subs.add(cb)
    cb(state)
    return () => subs.delete(cb)
  }

  function hydrate(initialState: Partial<AgentRunState>) {
    state = { ...state, ...initialState }
    subs.forEach((s) => s(state))
  }

  return { getState, dispatch, subscribe, hydrate }
}

export const baseReducer: AgentReducer = (state: AgentRunState, event: AgentEvent) => {
  const s = { ...state }
  const { type, payload } = event as any

  switch (type) {
    case 'run.started':
      s.status = RunStatus.Running
      s.startTime = event.timestamp
      return s

    case 'task.started': {
      const { taskId } = payload
      const task = s.tasks[taskId]
      if (!task) return s
      task.status = TaskStatus.Running
      task.startTime = event.timestamp
      return s
    }

    case 'task.partial': {
      const { chunk } = payload
      const task = s.tasks[chunk.taskId]
      if (!task) return s
      task.partialOutputs = [...task.partialOutputs, chunk]
      task.status = TaskStatus.Streaming
      return s
    }

    case 'task.succeeded': {
      const { taskId } = payload
      const task = s.tasks[taskId]
      if (!task) return s
      task.status = TaskStatus.Success
      task.endTime = event.timestamp
      return s
    }

    case 'task.failed': {
      const { taskId, error } = payload
      const task = s.tasks[taskId]
      if (!task) return s
      task.status = TaskStatus.Failed
      task.endTime = event.timestamp
      task.metadata = { ...(task.metadata || {}), lastError: error }
      return s
    }

    case 'task.retry_scheduled': {
      const { taskId, attempt } = payload
      const task = s.tasks[taskId]
      if (!task) return s
      task.status = TaskStatus.RetryBackoff
      task.retryAttempts = attempt ?? task.retryAttempts
      return s
    }

    case 'task.retry_attempt': {
      const { taskId } = payload
      const task = s.tasks[taskId]
      if (!task) return s
      task.status = TaskStatus.Running
      return s
    }

    case 'task.cancelled': {
      const { taskId } = payload
      const task = s.tasks[taskId]
      if (!task) return s
      task.status = TaskStatus.Cancelled
      task.endTime = event.timestamp
      return s
    }

    case 'agent.thought': {
      const { thought } = payload
      if (thought.taskId) {
        const task = s.tasks[thought.taskId]
        if (task) task.thoughts = [...task.thoughts, thought]
      }
      return s
    }

    case 'tool.call': {
      const { toolCall } = payload
      const task = s.tasks[toolCall.taskId]
      if (task) task.logs = [...task.logs, toolCall]
      return s
    }

    case 'dependency.resolved': {
      const { taskId, dependencyId } = payload
      const task = s.tasks[taskId]
      if (!task) return s
      // If all dependencies are resolved, mark waiting -> pending
      const pendingDeps = task.dependencies.filter((d) => s.tasks[d]?.status !== TaskStatus.Success)
      if (pendingDeps.length === 0 && task.status === TaskStatus.Waiting) task.status = TaskStatus.Pending
      return s
    }

    case 'final.synthesized': {
      const { finalOutput } = payload
      s.finalOutput = finalOutput
      s.status = RunStatus.Completed
      s.endTime = event.timestamp
      return s
    }

    case 'run.cancelled': {
      s.status = RunStatus.Cancelled
      s.endTime = event.timestamp
      return s
    }

    default:
      return s
  }
}
