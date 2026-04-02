export type TaskID = string;
export type RunID = string;
export type Timestamp = number; // ms since epoch

export enum TaskStatus {
  Pending = 'pending',
  Waiting = 'waiting',
  Running = 'running',
  Streaming = 'streaming',
  Success = 'success',
  Failed = 'failed',
  Cancelled = 'cancelled',
  RetryBackoff = 'retry_backoff'
}

export enum RunStatus {
  Idle = 'idle',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled'
}

export interface PartialOutput {
  id: string;
  taskId: TaskID;
  content: string;
  isFinal?: boolean;
  timestamp: Timestamp;
}

export interface AgentThought {
  id: string;
  taskId?: TaskID;
  content: string;
  tone?: 'info' | 'warn' | 'debug';
  timestamp: Timestamp;
}

export interface ToolCall {
  id: string;
  taskId: TaskID;
  toolName: string;
  input: Record<string, any> | string;
  result?: string;
  timestamp: Timestamp;
}

export interface Task {
  id: TaskID;
  title: string;
  description?: string;
  status: TaskStatus;
  dependencies: TaskID[];
  parallelGroup?: string | null;
  retryCount: number;
  retryAttempts: number;
  retrySchedule?: number[];
  logs: ToolCall[];
  partialOutputs: PartialOutput[];
  thoughts: AgentThought[];
  startTime?: Timestamp | null;
  endTime?: Timestamp | null;
  metadata?: Record<string, any>;
}

export type TasksById = Record<TaskID, Task>;

export interface AgentRunState {
  id: RunID;
  status: RunStatus;
  tasks: TasksById;
  taskOrder: TaskID[];
  parallelGroups?: Record<string, TaskID[]>;
  startTime?: Timestamp | null;
  endTime?: Timestamp | null;
  finalOutput?: string | null;
  error?: string | null;
}

export type EventType =
  | 'run.started'
  | 'run.completed'
  | 'run.cancelled'
  | 'task.started'
  | 'task.partial'
  | 'task.succeeded'
  | 'task.failed'
  | 'task.cancelled'
  | 'task.retry_scheduled'
  | 'task.retry_attempt'
  | 'agent.thought'
  | 'tool.call'
  | 'dependency.resolved'
  | 'final.synthesized';

export interface AgentEvent<T = any> {
  id: string;
  type: EventType;
  timestamp: Timestamp;
  payload: T;
  meta?: Record<string, any>;
}

export interface TaskLifecyclePayload {
  runId: RunID;
  taskId: TaskID;
  reason?: string;
  attempt?: number;
  error?: string;
}

export interface TaskPartialPayload {
  runId: RunID;
  taskId: TaskID;
  chunk: PartialOutput;
}

export interface ThoughtPayload {
  runId: RunID;
  thought: AgentThought;
}

export interface ToolCallPayload {
  runId: RunID;
  toolCall: ToolCall;
}

export interface FinalSynthPayload {
  runId: RunID;
  finalOutput: string;
}

export type AgentEventSubscriber = (event: AgentEvent) => void;

export interface ReplayOptions {
  speed?: number;
  jitterMs?: number;
  seed?: number;
}

export interface AgentEventEmitter {
  subscribe(sub: AgentEventSubscriber): () => void;
  emit(event: AgentEvent): void;
  startReplay?(events: AgentEvent[], opts?: ReplayOptions): Promise<void>;
  stopReplay?(): void;
  isReplaying?: boolean;
}

export type AgentReducer = (state: AgentRunState, event: AgentEvent) => AgentRunState;

export interface AgentStateMachine {
  getState(): AgentRunState;
  dispatch(event: AgentEvent): void;
  subscribe(cb: (state: AgentRunState) => void): () => void;
  hydrate?(initialState: Partial<AgentRunState>): void;
}

export const AllowedTaskTransitions: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.Pending]: [TaskStatus.Waiting, TaskStatus.Running, TaskStatus.Cancelled],
  [TaskStatus.Waiting]: [TaskStatus.Running, TaskStatus.Cancelled],
  [TaskStatus.Running]: [TaskStatus.Streaming, TaskStatus.Success, TaskStatus.Failed, TaskStatus.RetryBackoff, TaskStatus.Cancelled],
  [TaskStatus.Streaming]: [TaskStatus.Running, TaskStatus.Success, TaskStatus.Failed, TaskStatus.RetryBackoff, TaskStatus.Cancelled],
  [TaskStatus.RetryBackoff]: [TaskStatus.Running, TaskStatus.Cancelled],
  [TaskStatus.Success]: [],
  [TaskStatus.Failed]: [TaskStatus.RetryBackoff, TaskStatus.Cancelled],
  [TaskStatus.Cancelled]: []
} as const;

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) return true;
  return AllowedTaskTransitions[from]?.includes(to) ?? false;
}
