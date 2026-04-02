import React, { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Task, TaskStatus } from '../types/agent'
import { formatDistanceToNowStrict } from 'date-fns'

function statusColor(status: TaskStatus) {
  switch (status) {
    case TaskStatus.Running:
    case TaskStatus.Streaming:
      return 'ring-2 ring-indigo-600/30'
    case TaskStatus.Success:
      return 'border-emerald-500'
    case TaskStatus.Failed:
      return 'border-rose-500'
    case TaskStatus.Cancelled:
      return 'border-amber-400'
    case TaskStatus.RetryBackoff:
      return 'border-indigo-400'
    default:
      return 'border-zinc-800'
  }
}

export function TaskCard({ task }: { task: Task }) {
  const [openLogs, setOpenLogs] = useState(false)
  const [showThoughts, setShowThoughts] = useState(false)

  const timeAgo = useMemo(() => {
    if (!task.startTime) return ''
    return formatDistanceToNowStrict(new Date(task.startTime), { addSuffix: true })
  }, [task.startTime])

  return (
    <div className={clsx('glass-card p-4 rounded-lg border', statusColor(task.status))}>
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-zinc-300 font-semibold">{task.title}</div>
          <div className="text-xs text-zinc-400 mt-1">{task.description}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-400">{task.status}</div>
          <div className="text-xs text-zinc-500">{timeAgo}</div>
        </div>
      </div>

      <div className="mt-3">
        {task.partialOutputs.map((p) => (
          <div key={p.id} className="text-sm text-zinc-100 typing">{p.content}</div>
        ))}
      </div>

      <div className="mt-3 flex gap-2 items-center">
        <div className="text-xs text-zinc-400">Retries: {task.retryAttempts}/{task.retryCount}</div>
        <button onClick={() => setOpenLogs((s) => !s)} className="text-xs text-indigo-300 hover:underline">
          {openLogs ? 'Hide' : 'Tool Log'}
        </button>
        <button onClick={() => setShowThoughts((s) => !s)} className="text-xs text-violet-300 hover:underline">
          {showThoughts ? 'Hide Thoughts' : 'Show Thoughts'}
        </button>
      </div>

      {openLogs && (
        <div className="mt-2 p-2 bg-zinc-900/40 rounded">
          {task.logs.length === 0 ? (
            <div className="text-xs text-zinc-400">No tool calls</div>
          ) : (
            task.logs.map((l) => (
              <div key={l.id} className="text-xs font-mono text-zinc-200 my-1">
                <div className="text-zinc-400">{l.toolName}</div>
                <div>{typeof l.input === 'string' ? l.input : JSON.stringify(l.input)}</div>
                <div className="text-zinc-500">{l.result}</div>
              </div>
            ))
          )}
        </div>
      )}

      {showThoughts && (
        <div className="mt-2 p-2 bg-zinc-900/30 rounded">
          {task.thoughts.length === 0 ? (
            <div className="text-xs text-zinc-400">No thoughts</div>
          ) : (
            task.thoughts.map((t) => (
              <div key={t.id} className="text-xs text-violet-200 my-1">
                {t.content}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
