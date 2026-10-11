import { useEffect, useRef } from 'react'
import { useTerminalSocket } from '../../hooks/useTerminalSocket.js'

export default function TerminalPane({ sandboxId, onStatusChange }) {
  const containerRef = useRef(null)
  const { connected } = useTerminalSocket(sandboxId, containerRef)

  useEffect(() => {
    onStatusChange?.(connected)
  }, [connected, onStatusChange])

  return (
    <div className="flex flex-col h-full">
      {/* Terminal top bar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b shrink-0"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        {/* Fake macOS dots */}
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#f85149' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#d29922' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#3fb950' }} />
        </div>

        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          bash — sandbox
        </span>

        {/* Connection status */}
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: connected ? 'var(--success)' : 'var(--error)',
              boxShadow: connected ? '0 0 5px var(--success)' : '0 0 5px var(--error)',
            }}
          />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {connected ? 'connected' : 'connecting…'}
          </span>
        </div>
      </div>

      {/* xterm.js mount point */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
        style={{ background: '#0d1117', padding: '4px 0' }}
      />
    </div>
  )
}
