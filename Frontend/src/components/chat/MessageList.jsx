import { useEffect, useRef } from 'react'
import { Code2, Sparkles, ArrowRight } from 'lucide-react'
import UserMessage from './UserMessage.jsx'
import AiMessage from './AiMessage.jsx'

const SUGGESTIONS = [
  'Build a todo app with filters',
  'Create a modern landing page',
  'Make a Pomodoro timer',
]

export default function MessageList({ messages, onSuggestion }) {
  const bottomRef = useRef(null)

  // Auto-scroll to bottom on new messages / streamed chunks
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 min-h-0">
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm mb-1"
            style={{
              background: 'var(--bg-overlay)',
              borderColor: 'var(--border)',
            }}
          >
            <Code2 className="w-6 h-6 text-[var(--accent)]" />
          </div>

          <p className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Ask AI to build your application
          </p>
          <p className="text-xs leading-relaxed max-w-[260px]" style={{ color: 'var(--text-muted)' }}>
            Describe what you want — a dashboard, landing page, or utility — and AI will write and test the code.
          </p>

          <div className="flex flex-col gap-2 w-full mt-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestion(s)}
                className="group flex items-center justify-between text-xs px-3.5 py-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer hover:!text-[var(--text-primary)] hover:!border-[var(--accent)] hover:shadow-xs"
                style={{
                  background: 'var(--bg-overlay)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                  <span>{s}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150" style={{ color: 'var(--accent)' }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg) =>
        msg.role === 'user' ? (
          <UserMessage key={msg.id} content={msg.content} />
        ) : (
          <AiMessage
            key={msg.id}
            content={msg.content}
            logs={msg.logs}
            isStreaming={msg.isStreaming}
            isError={msg.isError}
          />
        ),
      )}
      <div ref={bottomRef} />
    </div>
  )
}
