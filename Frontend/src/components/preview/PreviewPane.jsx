import { useState } from 'react'
import { RotateCw, ExternalLink } from 'lucide-react'
import { previewUrl } from '../../lib/config.js'

export default function PreviewPane({ sandboxId }) {
  const url = previewUrl(sandboxId)
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const refresh = () => {
    setLoading(true)
    setReloadKey((k) => k + 1)
  }

  const btn =
    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-150 cursor-pointer hover:!text-[var(--text-primary)]'

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b shrink-0"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <button
          onClick={refresh}
          aria-label="Refresh preview"
          className={btn}
          style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>

        <div
          className="flex-1 min-w-0 truncate px-3 py-1.5 rounded-lg text-xs font-mono border"
          style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          title={url}
        >
          {url}
        </div>

        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className={btn}
          style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open
        </a>
      </div>

      {/* Frame + loading skeleton */}
      <div className="relative flex-1 min-h-0 bg-white">
        {loading && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4"
            style={{ background: 'var(--bg-base)' }}
          >
            <div
              className="w-64 h-3 rounded-full"
              style={{
                background: 'linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-overlay) 50%, var(--bg-surface) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s linear infinite',
              }}
            />
            <div
              className="w-48 h-3 rounded-full"
              style={{
                background: 'linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-overlay) 50%, var(--bg-surface) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s linear infinite',
              }}
            />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Waiting for the sandbox preview… hit Refresh if it takes a while
            </p>
          </div>
        )}
        <iframe
          key={reloadKey}
          src={url}
          title="Sandbox preview"
          onLoad={() => setLoading(false)}
          className="w-full h-full border-0"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  )
}
