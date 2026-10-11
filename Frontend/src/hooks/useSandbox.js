import { useState } from 'react'

export function useSandbox() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createSandbox = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/sandbox/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      return data // { sandboxId, previewUrl }
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createSandbox, loading, error }
}
