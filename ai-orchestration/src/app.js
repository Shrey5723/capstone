import express from 'express'
import morgan from 'morgan'
import agentRouter from './routes/agent.routes.js'

const app = express()

app.use(express.json())
app.use(morgan('dev'))

app.get("/api/status/healthz", (req, res) => {
    res.status(200).json({
        status: "ok"
    });
});

app.get("/api/status/readyz", (req, res) => {
    res.status(201).json({
        status: "readyyy"
    });
});

app.use('/api/ai/', agentRouter)


export default app