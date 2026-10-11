import { Link } from 'react-router-dom'
import { TerminalSquare, ExternalLink } from 'lucide-react'
import { previewUrl } from '../lib/config.js'
import ThemeToggle from './common/ThemeToggle.jsx'

export default function TopBar({ sandboxId, terminalConnected }) {
  return (
    <header
      className="flex items-center justify-between px-5 h-12 shrink-0 border-b transition-colors duration-150"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      {/* Left — Logo */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight transition-opacity hover:opacity-85"
          style={{ color: 'var(--text-primary)' }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center border shadow-xs"
            style={{
              background: 'var(--bg-overlay)',
              borderColor: 'var(--border)',
              color: 'var(--accent)',
            }}
          >
            <TerminalSquare className="w-4 h-4" />
          </div>
          <span>AI Sandbox</span>
        </Link>

        {sandboxId && (
          <span
            className="px-2 py-0.5 rounded-md text-xs font-mono select-all border"
            style={{
              background: 'var(--bg-overlay)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            {sandboxId.slice(0, 8)}…
          </span>
        )}
      </div>

      {/* Right — Status indicators & Theme Switch */}
      <div className="flex items-center gap-3">
        {/* Terminal connection status */}
        <div
          className="flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium"
          style={{
            background: 'var(--bg-overlay)',
            borderColor: 'var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: terminalConnected ? 'var(--success)' : 'var(--error)',
              boxShadow: terminalConnected ? '0 0 6px var(--success)' : '0 0 6px var(--error)',
            }}
          />
          <span>{terminalConnected ? 'Terminal Connected' : 'Terminal Disconnected'}</span>
        </div>

        {/* Sandbox URL badge */}
        {sandboxId && (
          <a
            href={previewUrl(sandboxId)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer"
            style={{
              background: 'var(--bg-overlay)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)'
              e.currentTarget.style.borderColor = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Preview</span>
          </a>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  )
}
