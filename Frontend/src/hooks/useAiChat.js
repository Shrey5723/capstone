import { useState, useCallback } from 'react'

let nextId = 1
const newId = () => nextId++

export function useAiChat(sandboxId) {
  const [messages, setMessages] = useState([])
  const [streaming, setStreaming] = useState(false)

  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim() || streaming) return

    // Add user message
    const userMsg = { id: newId(), role: 'user', content: userText }
    setMessages(prev => [...prev, userMsg])

    // Add empty AI message placeholder with logs array
    const aiMsgId = newId()
    setMessages(prev => [
      ...prev,
      { id: aiMsgId, role: 'assistant', content: '', logs: [], isStreaming: true }
    ])
    setStreaming(true)

    try {
      const res = await fetch('/api/ai/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, projectId: sandboxId }),
      })

      if (!res.ok) throw new Error(`AI error: ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Parse SSE: split on double newlines
        const parts = buffer.split('\n\n')
        buffer = parts.pop() // keep incomplete chunk

        for (const part of parts) {
          const lines = part
            .split('\n')
            .filter((l) => l.startsWith('data:'))
            .map((l) => l.slice(5).replace(/^ /, ''))

          for (const raw of lines) {
            if (!raw || raw === '[DONE]') continue

            let item = null
            try {
              if (raw.startsWith('{') && raw.endsWith('}')) {
                item = JSON.parse(raw)
              }
            } catch (_) {}

            if (item?.type === 'log') {
              const text = item.text.trim()
              if (!text) continue
              setMessages(prev => prev.map(m => {
                if (m.id !== aiMsgId) return m
                const logs = [...(m.logs || [])]
                const isCompletion = /success|done|listed|healthy|app ok/i.test(text)

                // If it updates the last running log
                if (isCompletion && logs.length > 0 && logs[logs.length - 1].status === 'running') {
                  logs[logs.length - 1] = { ...logs[logs.length - 1], text, status: 'done' }
                } else if (!logs.some(l => l.text === text)) {
                  logs.push({
                    id: Math.random().toString(36).slice(2),
                    text,
                    status: isCompletion ? 'done' : 'running',
                  })
                }
                return { ...m, logs }
              }))
            } else if (item?.type === 'tool_done') {
              setMessages(prev => prev.map(m => {
                if (m.id !== aiMsgId) return m
                const logs = (m.logs || []).map(l => ({ ...l, status: 'done' }))
                return { ...m, logs }
              }))
            } else if (item?.type === 'text') {
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId
                  ? { ...m, content: (m.content || '') + item.text }
                  : m
              ))
            } else if (item?.type === 'error') {
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId
                  ? { ...m, content: `Error: ${item.error}`, isError: true }
                  : m
              ))
            } else {
              // Backward compatibility for plain string streams
              const text = raw.trim()
              if (/^(patching|listing|reading|writing|checking|app ok|successfully|files)/i.test(text)) {
                setMessages(prev => prev.map(m => {
                  if (m.id !== aiMsgId) return m
                  const logs = [...(m.logs || [])]
                  if (!logs.some(l => l.text === text)) {
                    logs.push({ id: Math.random().toString(36).slice(2), text, status: 'done' })
                  }
                  return { ...m, logs }
                }))
              } else if (!raw.startsWith('{') && !raw.startsWith('[')) {
                setMessages(prev => prev.map(m =>
                  m.id === aiMsgId
                    ? { ...m, content: (m.content || '') + raw }
                    : m
                ))
              }
            }
          }
        }
      }

      // Mark streaming done and all logs completed
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId
          ? {
              ...m,
              isStreaming: false,
              logs: (m.logs || []).map(l => ({ ...l, status: 'done' }))
            }
          : m
      ))
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId
          ? { ...m, content: `Error: ${err.message}`, isStreaming: false, isError: true }
          : m
      ))
    } finally {
      setStreaming(false)
    }
  }, [sandboxId, streaming])

  const clearMessages = useCallback(() => setMessages([]), [])

  return { messages, streaming, sendMessage, clearMessages }
}
