import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// Gemini API Keys with their assigned models
// Using the most powerful and newest models available
const GEMINI_KEYS = [
    { key: process.env.GEMINI_API_KEY_1, model: 'gemini-2.5-flash' },
    { key: process.env.GEMINI_API_KEY_2, model: 'gemini-2.5-flash-lite' },
    { key: process.env.GEMINI_API_KEY_3, model: 'gemini-2.5-flash' },
    { key: process.env.GEMINI_API_KEY_4, model: 'gemini-2.5-flash-lite' },
    { key: process.env.GEMINI_API_KEY_5, model: 'gemini-2.5-flash' },
].filter(item => item.key) as { key: string; model: string }[];

// Tracking for key rotation
let currentKeyIndex = 0;
let requestsOnCurrentKey = 0;
const REQUESTS_PER_KEY = 2; // Number of requests before rotating to next key

// Get current API key and model (rotates after every 2 requests)
function getCurrentKeyAndModel(): { key: string; model: string; keyNumber: number } {
    if (GEMINI_KEYS.length === 0) {
        throw new Error('No Gemini API keys configured');
    }

    const current = GEMINI_KEYS[currentKeyIndex];
    const keyNumber = currentKeyIndex + 1;

    // Increment request count
    requestsOnCurrentKey++;

    // Rotate to next key after REQUESTS_PER_KEY requests
    if (requestsOnCurrentKey >= REQUESTS_PER_KEY) {
        requestsOnCurrentKey = 0;
        currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length;
    }

    console.log(`🔑 Using Key #${keyNumber} | Model: ${current.model} | Request ${requestsOnCurrentKey}/${REQUESTS_PER_KEY}`);
    return { key: current.key, model: current.model, keyNumber };
}

// Force switch to next key (called on rate limit)
function switchToNextKey(): void {
    requestsOnCurrentKey = 0;
    currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length;
    console.log(`⚠️ Rate limited! Switching to Key #${currentKeyIndex + 1}`);
}

// Convert OpenAI-style messages to Gemini format
function convertToGeminiFormat(messages: { role: string; content: string }[]) {
    return messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));
}

router.post('/', requireAuth, async (req: Request, res: Response) => {
    const timestamp = new Date().toISOString();
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📨 AI REQUEST RECEIVED - ${timestamp}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Messages count: ${req.body.messages?.length || 0}`);

    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            console.log('❌ Bad request: Messages array missing or invalid');
            return res.status(400).json({ error: 'Messages array is required' });
        }

        console.log(`✓ Request validated, starting AI generation...`);

        // Set up SSE headers for streaming response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Try current key, retry with next key only on rate limit
        const maxRetries = GEMINI_KEYS.length;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const { key, model, keyNumber } = getCurrentKeyAndModel();
                const genAI = new GoogleGenerativeAI(key);

                const geminiModel = genAI.getGenerativeModel({
                    model: model,
                    generationConfig: {
                        temperature: 0.7,
                        topP: 0.95,
                        topK: 40,
                        maxOutputTokens: 8192,
                    }
                });

                // Convert messages to Gemini format
                const geminiMessages = convertToGeminiFormat(messages);

                // Extract the last user message for the prompt
                const lastMessage = geminiMessages[geminiMessages.length - 1];
                const history = geminiMessages.slice(0, -1);

                // Start chat with history
                const chat = geminiModel.startChat({
                    history: history.length > 0 ? history : undefined,
                });

                // Stream the response
                const result = await chat.sendMessageStream(lastMessage.parts);

                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    if (text) {
                        // Send in SSE format compatible with frontend
                        const data = JSON.stringify({
                            choices: [{
                                delta: { content: text }
                            }]
                        });
                        res.write(`data: ${data}\n\n`);
                    }
                }

                // Send completion signal
                res.write('data: [DONE]\n\n');
                res.end();
                console.log(`✅ Response completed using Key #${keyNumber} (${model})`);
                return;

            } catch (error: any) {
                console.error(`❌ Gemini API error:`, error.message);

                // Only retry on rate limit (429)
                if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
                    switchToNextKey();
                    continue; // Try next key
                }

                // For other errors, don't retry
                throw error;
            }
        }

        // All keys rate limited
        res.status(429).json({
            error: 'All API keys are currently rate limited. Please try again later.'
        });

    } catch (error: any) {
        console.error('❌ AI route error:', error);
        res.status(500).json({ error: 'Something went wrong', message: error.message });
    }
});

export default router;
