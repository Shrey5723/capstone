import { User } from 'lucide-react'

export default function UserMessage({ content }) {
  return (
    <div className="flex gap-2.5 items-start animate-fade-in justify-end">
      <div
        className="rounded-2xl rounded-tr-xs px-4 py-2.5 text-sm max-w-[85%] leading-relaxed whitespace-pre-wrap shadow-xs"
        style={{
          background: 'var(--accent)',
          color: '#ffffff',
          wordBreak: 'break-word',
        }}
      >
        {content}
      </div>
      <div
        className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-xs border shadow-xs mt-0.5"
        style={{
          background: 'var(--bg-overlay)',
          color: 'var(--text-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        <User className="w-3.5 h-3.5" />
      </div>
    </div>
  )
}
