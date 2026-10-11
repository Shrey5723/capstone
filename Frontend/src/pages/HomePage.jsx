import { useNavigate } from 'react-router-dom'
import { TerminalSquare, Sparkles, Terminal, Monitor, Plus, Loader2, AlertCircle } from 'lucide-react'
import { useSandbox } from '../hooks/useSandbox.js'
import ThemeToggle from '../components/common/ThemeToggle.jsx'

export default function HomePage() {
  const navigate = useNavigate()
  const { createSandbox, loading, error } = useSandbox()

  const handleCreate = async () => {
    const data = await createSandbox()
    if (data?.sandboxId) {
      navigate(`/sandbox/${data.sandboxId}`)
    }
  }

  const features = [
    { icon: Sparkles, label: 'AI Code Gen', desc: 'Natural language to code' },
    { icon: Terminal, label: 'Live Terminal', desc: 'Real bash environment' },
    { icon: Monitor, label: 'Live Preview', desc: 'Instant hot reloading' },
  ]

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Ambient background glows */}
      <div
        className="absolute top-[-240px] left-[-200px] w-[580px] h-[580px] rounded-full opacity-15 blur-[120px] pointer-events-none"
        style={{ background: 'var(--accent)' }}
      />
      <div
        className="absolute bottom-[-240px] right-[-200px] w-[500px] h-[500px] rounded-full opacity-10 blur-[130px] pointer-events-none"
        style={{ background: 'var(--accent)' }}
      />

      {/* Main Container Card */}
      <div
        className="relative z-10 flex flex-col items-center gap-7 px-8 py-12 rounded-3xl border max-w-xl w-full shadow-lg animate-fade-in"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          boxShadow: '0 20px 40px -15px var(--card-shadow)',
        }}
      >
        {/* Brand Icon */}
        <div
          className="flex items-center justify-center w-16 h-16 rounded-2xl border shadow-sm"
          style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border)' }}
        >
          <TerminalSquare className="w-8 h-8 text-[var(--accent)]" />
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium border mb-1"
            style={{
              background: 'var(--bg-overlay)',
              borderColor: 'var(--border)',
              color: 'var(--accent)',
            }}
          >
            <span>Kubernetes Micro-Sandboxes</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            AI Cloud Sandbox
          </h1>
          <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Spin up an isolated cloud environment in seconds. Chat with AI to build React apps, execute shell commands, and preview changes in real time.
          </p>
        </div>

        {/* Features row */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.label}
                className="flex flex-col items-center gap-2 p-3.5 rounded-2xl border text-center transition-colors duration-150"
                style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center border"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <Icon className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div>
                  <span className="block text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {f.label}
                  </span>
                  <span className="block text-[11px] leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {f.desc}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA button */}
        <button
          id="create-sandbox-btn"
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-medium text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          style={{
            background: 'var(--accent)',
            color: '#ffffff',
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'var(--accent)')}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating sandbox…</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create New Sandbox</span>
            </>
          )}
        </button>

        {/* Error notification */}
        {error && (
          <div
            className="w-full px-4 py-3 rounded-xl text-xs border flex items-center gap-2 animate-fade-in"
            style={{
              background: 'var(--bg-overlay)',
              borderColor: 'var(--error)',
              color: 'var(--error)',
            }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          Isolated container · ephemeral storage · zero configuration
        </p>
      </div>
    </div>
  )
}
