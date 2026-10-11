import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Monitor, Terminal } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import ChatPanel from '../components/chat/ChatPanel.jsx'
import PreviewPane from '../components/preview/PreviewPane.jsx'
import TerminalPane from '../components/terminal/TerminalPane.jsx'

const MIN_CHAT = 300
const MAX_CHAT = 720
const DEFAULT_CHAT = 380

const TABS = [
  { id: 'preview', label: 'Preview', Icon: Monitor },
  { id: 'terminal', label: 'Terminal', Icon: Terminal },
]

export default function WorkspacePage() {
  const { sandboxId } = useParams()
  const [tab, setTab] = useState('preview')
  const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT)
  const [dragging, setDragging] = useState(false)
  const [terminalConnected, setTerminalConnected] = useState(false)
  const containerRef = useRef(null)

  // ── Drag-to-resize handle ───────────────────────────────────
  const onPointerDown = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      const left = containerRef.current?.getBoundingClientRect().left ?? 0
      setChatWidth(Math.min(MAX_CHAT, Math.max(MIN_CHAT, e.clientX - left)))
    }
    const onUp = () => setDragging(false)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [dragging])

  if (!sandboxId) {
    return (
      <div className="h-full flex items-center justify-center">
        <Link to="/" style={{ color: 'var(--accent)' }}>Back home</Link>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-base)' }}>
      <TopBar sandboxId={sandboxId} terminalConnected={terminalConnected} />

      <div ref={containerRef} className="flex flex-1 min-h-0">
        {/* Left — chat */}
        <aside
          className="shrink-0 h-full border-r"
          style={{ width: chatWidth, borderColor: 'var(--border)' }}
        >
          <ChatPanel sandboxId={sandboxId} />
        </aside>

        {/* Resize handle */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize chat panel"
          onPointerDown={onPointerDown}
          className="w-1 -ml-px shrink-0 cursor-col-resize transition-colors duration-150 hover:!bg-[var(--accent)]"
          style={{ background: dragging ? 'var(--accent)' : 'transparent' }}
        />

        {/* Right — tabs */}
        <section className="flex-1 min-w-0 flex flex-col">
          <div
            role="tablist"
            className="flex items-center gap-1 px-3 h-10 shrink-0 border-b"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            {TABS.map((t) => {
              const active = tab === t.id
              const Icon = t.Icon
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className="relative flex items-center gap-2 px-3.5 h-full text-xs font-medium cursor-pointer transition-colors duration-150 hover:!text-[var(--text-primary)]"
                  style={{ color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                  <span
                    className="absolute left-2 right-2 bottom-0 h-0.5 rounded-full transition-opacity duration-200"
                    style={{ background: 'var(--accent)', opacity: active ? 1 : 0 }}
                  />
                </button>
              )
            })}
          </div>

          {/* Both panes stay mounted so the terminal session and iframe state survive tab switches */}
          <div className="relative flex-1 min-h-0">
            <div
              className={`absolute inset-0 transition-opacity duration-200 ${
                tab === 'preview' ? 'opacity-100' : 'opacity-0 pointer-events-none invisible'
              }`}
            >
              {/* iframes swallow pointer events while dragging the divider */}
              <div className={dragging ? 'pointer-events-none h-full' : 'h-full'}>
                <PreviewPane sandboxId={sandboxId} />
              </div>
            </div>
            <div
              className={`absolute inset-0 transition-opacity duration-200 ${
                tab === 'terminal' ? 'opacity-100' : 'opacity-0 pointer-events-none invisible'
              }`}
            >
              <TerminalPane sandboxId={sandboxId} onStatusChange={setTerminalConnected} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
