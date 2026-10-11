import { Router } from "express";
import agent from "../agents/code.agent.js";

const agentRouter = Router()

agentRouter.post('/invoke', async (req, res) => {
    try {
        const { message, projectId } = req.body

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        })

        const response = await agent.stream(
            {
                messages: [{
                    role: "user",
                    content: message
                }]
            },
            {
                context: {
                    projectId
                },
                recursionLimit: 50,
                streamMode: ["messages", "custom"]
            }
        )

        for await (const [mode, payload] of response) {
            if (mode === "custom") {
                const text = typeof payload === "string" ? payload.trim() : JSON.stringify(payload)
                if (text) {
                    res.write(`data: ${JSON.stringify({ type: "log", text })}\n\n`)
                }
            } else if (mode === "messages") {
                const messageChunk = Array.isArray(payload) ? payload[0] : payload
                const isToolMsg = messageChunk?.getType?.() === "tool" || 
                                  messageChunk?._getType?.() === "tool" || 
                                  messageChunk?.constructor?.name === "ToolMessage"
                
                if (isToolMsg) {
                    const contentStr = typeof messageChunk.content === "string" ? messageChunk.content : JSON.stringify(messageChunk.content)
                    res.write(`data: ${JSON.stringify({ type: "tool_done", content: contentStr })}\n\n`)
                } else if (messageChunk?.content && typeof messageChunk.content === "string") {
                    res.write(`data: ${JSON.stringify({ type: "text", text: messageChunk.content })}\n\n`)
                }
            }
        }

        res.write("data: [DONE]\n\n")
        res.end()
    } catch (err) {
        console.error("error : ", err)
        if (res.headersSent) {
            res.write(`data: ${JSON.stringify({ type: "error", error: err.message || "Failed to invoke agent" })}\n\n`)
            res.write("data: [DONE]\n\n")
            res.end()
        } else {
            res.status(500).json({ error: err.message || "Failed to invoke agent" })
        }
    }
})

export default agentRouter