import { useRef, useState } from 'react'
import { Bot, Loader2, ArrowUp, Trash2 } from 'lucide-react'
import { useAiChat } from '../../hooks/useAiChat.js'
import MessageList from './MessageList.jsx'

export default function ChatPanel({ sandboxId }) {
  const { messages, streaming, sendMessage, clearMessages } = useAiChat(sandboxId)
  const [input, setInput] = useState('')
  const textareaRef = useRef(null)

  const handleSend = () => {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    sendMessage(text)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e) => {
    setInput(e.target.value)
    // auto-grow textarea up to max height
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  return (
    <div
      className="flex flex-col h-full min-w-0"
      style={{ background: 'var(--bg-surface)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b shrink-0 flex items-center justify-between"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            AI Assistant
          </span>
        </div>

        {streaming ? (
          <div
            className="flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border"
            style={{
              background: 'var(--bg-overlay)',
              borderColor: 'var(--border)',
              color: 'var(--accent)',
            }}
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="font-medium">Generating…</span>
          </div>
        ) : (
          messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="flex items-center gap-1 text-xs py-1 px-2 rounded-md transition-colors duration-150 cursor-pointer hover:!text-[var(--text-primary)]"
              style={{ color: 'var(--text-muted)' }}
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )
        )}
      </div>

      <MessageList messages={messages} onSuggestion={sendMessage} />

      {/* Input */}
      <div className="px-4 py-3 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div
          className="flex gap-2 rounded-xl border p-1 focus-within:!border-[var(--accent)] transition-colors duration-150"
          style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border)' }}
        >
          <textarea
            ref={textareaRef}
            id="chat-input"
            rows={1}
            placeholder="Describe what you want to build…"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={streaming}
            className="flex-1 resize-none bg-transparent text-sm px-3 py-2.5 outline-none min-h-[40px] max-h-[120px] leading-relaxed disabled:opacity-50"
            style={{ color: 'var(--text-primary)' }}
          />
          <button
            id="send-message-btn"
            onClick={handleSend}
            disabled={streaming || !input.trim()}
            aria-label="Send message"
            className="self-end mb-1 mr-1 p-2 rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:!bg-[var(--accent-hover)]"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
        <p className="text-xs mt-1.5 px-1" style={{ color: 'var(--text-muted)' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
