import express from 'express';
import cors from 'cors';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const app = express();
app.use(cors());

const PORT = 3001;

const command = process.argv[2];
const args = process.argv.slice(3);

if (!command) {
    console.error("Usage: node bridge.js <command> [args...]");
    process.exit(1);
}

const sessions = new Map();

app.get('/sse', async (req, res) => {
    try {
        console.log("New SSE connection established");
        
        const sseTransport = new SSEServerTransport("/message", res);
        await sseTransport.start();

        const sessionId = sseTransport.sessionId;
        
        // Spawn a new child process for this session
        const stdioTransport = new StdioClientTransport({
            command,
            args,
            env: process.env // pass through environment variables if any
        });
        await stdioTransport.start();

        // Forward messages
        sseTransport.onmessage = async (message) => {
            try {
                await stdioTransport.send(message);
            } catch (err) {
                console.error("Error sending to stdio:", err);
            }
        };

        stdioTransport.onmessage = async (message) => {
            try {
                await sseTransport.send(message);
            } catch (err) {
                console.error("Error sending to SSE:", err);
            }
        };

        sseTransport.onclose = () => {
            console.log(`SSE connection closed for session ${sessionId}`);
            stdioTransport.close();
            sessions.delete(sessionId);
        };

        sseTransport.onerror = (err) => {
            console.error(`SSE error for session ${sessionId}:`, err);
            stdioTransport.close();
            sessions.delete(sessionId);
        };
        
        stdioTransport.onerror = (err) => {
             console.error(`Stdio error for session ${sessionId}:`, err);
        };

        stdioTransport.onclose = () => {
            console.log(`Stdio transport closed for session ${sessionId}`);
            sseTransport.close();
            sessions.delete(sessionId);
        };

        sessions.set(sessionId, { sseTransport, stdioTransport });
        console.log(`Session ${sessionId} initialized`);
    } catch (err) {
        console.error("Failed to establish SSE connection:", err);
        if (!res.headersSent) {
            res.status(500).send(err.message);
        }
    }
});

app.post('/message', async (req, res) => {
    const sessionId = req.query.sessionId;
    const session = sessions.get(sessionId);
    if (!session) {
        res.status(404).send("Session not found");
        return;
    }

    try {
        await session.sseTransport.handlePostMessage(req, res);
    } catch (err) {
        console.error("Error handling POST message:", err);
        if (!res.headersSent) {
            res.status(500).send(err.message);
        }
    }
});

app.listen(PORT, () => {
    console.log(`MCP Bridge running on http://localhost:${PORT}`);
    console.log(`Bridging to: ${command} ${args.join(' ')}`);
});
