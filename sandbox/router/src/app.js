import express from 'express'
import morgan from 'morgan'
import { createProxyMiddleware } from 'http-proxy-middleware'

const app = express()
app.use(morgan('combined'))

app.get('/api/status/healthz', (req, res) => {
    res.status(200).json({ message: 'ok' })
})

app.get('/api/status/readyz', (req, res) => {
    res.status(200).json({ message: 'ready' })
})

export const proxy = createProxyMiddleware({
    router: (req) => {
        const host = req.headers.host || '';
        const parts = host.split('.');
        const sandboxId = parts[0];

        if (parts[1] === 'agent') {
            return `http://sandbox-service-${sandboxId}:3000`;
        } else if (parts[1] === 'preview') {
            return `http://sandbox-service-${sandboxId}:80`;
        }
    },
    changeOrigin: true,
    ws: true,
    on: {
        error: (err, req, res) => {
            console.error('[router] Proxy error:', err.message);
            if (res?.writeHead && !res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Service unreachable: ${err.message}` }));
            }
        }
    }
})

app.use(proxy)

export default app