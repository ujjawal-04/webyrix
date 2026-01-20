import express, { Request, Response } from 'express';
import axios from 'axios';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { messages } = req.body;

        // Set up SSE headers for streaming response
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "google/gemma-3n-e2b-it:free",
                messages,
                stream: true,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000", // Should clarify if this should stay localhost
                    "X-Title": "Webyrix",
                },
                responseType: "stream",
            }
        );

        const stream = response.data;

        // Pipe the stream directly to the response
        stream.pipe(res);

        stream.on('end', () => {
            res.end();
        });

        stream.on('error', (err: any) => {
            console.error('Stream error:', err);
            res.end();
        });

    } catch (error) {
        console.error("API error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

export default router;
