import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'
import { agentUrl } from '../lib/config.js'

export function useTerminalSocket(sandboxId, containerRef) {
  const termRef = useRef(null)
  const fitAddonRef = useRef(null)
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !sandboxId) return

    // ── Init xterm ─────────────────────────────────────────────
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", monospace',
      theme: {
        background:  '#0d1117',
        foreground:  '#e6edf3',
        cursor:      '#2f81f7',
        cursorAccent:'#0d1117',
        black:       '#484f58',
        red:         '#f85149',
        green:       '#3fb950',
        yellow:      '#d29922',
        blue:        '#2f81f7',
        magenta:     '#a371f7',
        cyan:        '#39d353',
        white:       '#b1bac4',
        brightBlack: '#6e7681',
        brightWhite: '#f0f6fc',
      },
      allowTransparency: true,
      scrollback: 5000,
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)
    containerRef.current.innerHTML = ''
    term.open(containerRef.current)
    fitAddon.fit()

    termRef.current = term
    fitAddonRef.current = fitAddon

    // ── Socket.io connection to agent pod ──────────────────────
    // Agent pod is routed via ingress: {sandboxId}.agent.localhost
    const socket = io(agentUrl(sandboxId), {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity, // keep retrying while the pod boots
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000, // exponential backoff 1s → 8s
    })
    socketRef.current = socket

    let warned = false

    socket.on('connect', () => {
      warned = false
      setConnected(true)
      term.writeln('\x1b[32m[connected] sandbox terminal session active\x1b[0m')
      term.writeln('')
    })

    socket.on('disconnect', () => {
      setConnected(false)
      term.writeln('\x1b[31m[disconnected] sandbox terminal session closed\x1b[0m')
    })

    socket.on('connect_error', () => {
      setConnected(false)
      if (!warned) {
        warned = true
        term.writeln('\x1b[33m[connecting] waiting for sandbox terminal...\x1b[0m')
      }
    })

    // Agent → Terminal output
    socket.on('terminal-output', (data) => {
      term.write(data)
    })

    // Terminal input → Agent
    term.onData((data) => {
      socket.emit('terminal-input', data)
    })

    // ── Resize observer ────────────────────────────────────────
    const observer = new ResizeObserver(() => {
      try { fitAddon.fit() } catch (_) {}
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      if (socket.connected) {
        socket.disconnect()
      } else {
        const cleanupTimer = setTimeout(() => {
          socket.disconnect()
        }, 500)
        socket.once('connect', () => {
          clearTimeout(cleanupTimer)
          socket.disconnect()
        })
      }
      term.dispose()
      termRef.current = null
      fitAddonRef.current = null
      socketRef.current = null
    }
  }, [sandboxId, containerRef])

  const fit = () => {
    try { fitAddonRef.current?.fit() } catch (_) {}
  }

  return { connected, fit }
}
