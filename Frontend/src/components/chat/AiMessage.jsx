import { useState } from 'react'
import {
  Folder,
  FileText,
  Wrench,
  FileCode2,
  Activity,
  CheckCircle2,
  Check,
  Loader2,
  Terminal,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react'

function getLogMeta(text) {
  const lower = text.toLowerCase()
  if (lower.includes('patch')) return { Icon: Wrench, colorClass: 'text-sky-500 dark:text-sky-400' }
  if (lower.includes('writ') || lower.includes('creat')) return { Icon: FileCode2, colorClass: 'text-violet-500 dark:text-violet-400' }
  if (lower.includes('read')) return { Icon: FileText, colorClass: 'text-amber-500 dark:text-amber-400' }
  if (lower.includes('list') || lower.includes('file')) return { Icon: Folder, colorClass: 'text-blue-500 dark:text-blue-400' }
  if (lower.includes('check') || lower.includes('health')) return { Icon: Activity, colorClass: 'text-emerald-500 dark:text-emerald-400' }
  if (lower.includes('ok') || lower.includes('success')) return { Icon: CheckCircle2, colorClass: 'text-emerald-500 dark:text-emerald-400' }
  return { Icon: Terminal, colorClass: 'text-slate-500 dark:text-slate-400' }
}

function formatLogText(text) {
  // Highlights filepaths in monospace badge
  const pathRegex = /(src\/[a-zA-Z0-9_\-\.\/]+|package\.json|vite\.config\.js|index\.html)/g
  const parts = text.split(pathRegex)

  return parts.map((part, index) => {
    if (pathRegex.test(part)) {
      return (
        <code
          key={index}
          className="font-mono text-[11px] px-1 py-0.5 rounded border mx-0.5"
          style={{
            background: 'var(--bg-base)',
            borderColor: 'var(--border)',
            color: 'var(--accent)',
          }}
        >
          {part}
        </code>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export default function AiMessage({ content = '', logs = [], isStreaming, isError }) {
  const [isLogsExpanded, setIsLogsExpanded] = useState(true)

  // Fallback: if logs array is empty, check if legacy content has log lines
  const displayLogs = logs && logs.length > 0 ? logs : []
  let displayContent = content || ''

  // If logs were not separated, extract them from content
  if (displayLogs.length === 0 && displayContent) {
    const rawLines = displayContent.split('\n')
    const extractedLogs = []
    const remainingText = []

    for (const line of rawLines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      if (/^(patching|successfully patched|reading|files read|listing|files listed|writing|files written|checking|app health|app ok)/i.test(trimmed)) {
        extractedLogs.push({
          id: Math.random().toString(36).slice(2),
          text: trimmed,
          status: 'done',
        })
      } else if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
        remainingText.push(line)
      }
    }

    if (extractedLogs.length > 0) {
      displayLogs.push(...extractedLogs)
      displayContent = remainingText.join('\n').trim()
    }
  }

  const hasLogs = displayLogs.length > 0
  const hasText = Boolean(displayContent && displayContent.trim())

  return (
    <div className="flex gap-3 items-start animate-fade-in group">
      {/* Sleek Minimalist Avatar */}
      <div
        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border shadow-xs mt-0.5"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          color: 'var(--accent)',
        }}
      >
        <Sparkles className="w-3.5 h-3.5" />
      </div>

      {/* Bubble */}
      <div
        className="flex-1 rounded-2xl rounded-tl-sm px-4 py-3.5 text-sm leading-relaxed min-w-0 flex flex-col gap-3 border shadow-xs"
        style={{
          background: 'var(--bg-surface)',
          borderColor: isError ? 'var(--error)' : 'var(--border)',
          color: isError ? 'var(--error)' : 'var(--text-primary)',
          wordBreak: 'break-word',
        }}
      >
        {/* Activity / Action Logs Box */}
        {hasLogs && (
          <div
            className="rounded-xl border overflow-hidden transition-all duration-150"
            style={{
              background: 'var(--bg-overlay)',
              borderColor: 'var(--border)',
            }}
          >
            {/* Header / Summary Bar */}
            <button
              type="button"
              onClick={() => setIsLogsExpanded(!isLogsExpanded)}
              className="w-full px-3 py-2 flex items-center justify-between text-xs font-medium cursor-pointer transition-colors hover:opacity-85"
              style={{ color: 'var(--text-muted)' }}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                <span className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>
                  Activity
                </span>
                <span
                  className="px-1.5 py-0.2 rounded-full text-[10px] font-mono border"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {displayLogs.length} step{displayLogs.length !== 1 ? 's' : ''}
                </span>

                {isStreaming && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium ml-1" style={{ color: 'var(--accent)' }}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full animate-ping" style={{ background: 'var(--accent)' }} />
                    In progress
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[11px] hover:text-[var(--text-primary)]">
                <span>{isLogsExpanded ? 'Hide' : 'Show'}</span>
                {isLogsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {/* Collapsible Steps List */}
            {isLogsExpanded && (
              <div
                className="px-2.5 pb-2 pt-1 flex flex-col gap-1 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                {displayLogs.map((log, idx) => {
                  const meta = getLogMeta(log.text)
                  const Icon = meta.Icon
                  const isLatest = idx === displayLogs.length - 1
                  const isRunning = isStreaming && isLatest && log.status === 'running'

                  return (
                    <div
                      key={log.id || idx}
                      className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg border transition-colors"
                      style={{
                        background: 'var(--bg-surface)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${meta.colorClass}`} />
                        <span className="truncate text-xs" style={{ color: 'var(--text-primary)' }}>
                          {formatLogText(log.text)}
                        </span>
                      </div>

                      <div className="shrink-0 flex items-center">
                        {isRunning ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--accent)' }} />
                        ) : (
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" style={{ color: 'var(--success)' }} />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* AI Final Message Content */}
        {hasText && (
          <div className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {displayContent.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < displayContent.split('\n').length - 1 && <br />}
              </span>
            ))}
            {isStreaming && <span className="streaming-cursor ml-0.5" />}
          </div>
        )}

        {/* In-progress indicator if waiting for answer text */}
        {isStreaming && !hasText && (
          <div className="flex items-center gap-2 text-xs py-1" style={{ color: 'var(--text-muted)' }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
            <span>Formulating response…</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-2 text-xs py-1" style={{ color: 'var(--error)' }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>An error occurred during execution.</span>
          </div>
        )}
      </div>
    </div>
  )
}
