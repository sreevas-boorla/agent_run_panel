import { AgentRunState, Task, TaskStatus, RunStatus } from './types/agent'

export default function initialStateFactory(): AgentRunState {
  const tasks: Record<string, Task> = {
    'task-1': {
      id: 'task-1',
      title: 'Fetch Market Data',
      description: 'Query time-series and snapshots',
      status: TaskStatus.Pending,
      dependencies: [],
      parallelGroup: null,
      retryCount: 2,
      retryAttempts: 0,
      retrySchedule: [1000, 3000],
      logs: [],
      partialOutputs: [],
      thoughts: []
    },
    'task-2': {
      id: 'task-2',
      title: 'Run Risk Model',
      description: 'Monte Carlo stress tests',
      status: TaskStatus.Pending,
      dependencies: ['task-1'],
      parallelGroup: null,
      retryCount: 3,
      retryAttempts: 0,
      retrySchedule: [2000, 4000, 8000],
      logs: [],
      partialOutputs: [],
      thoughts: []
    }
  }

  return {
    id: 'run-1',
    status: RunStatus.Idle,
    tasks,
    taskOrder: ['task-1', 'task-2'],
    startTime: null,
    endTime: null,
    finalOutput: null
  }
}
