"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { messages } = req.body;
        // Set up SSE headers for streaming response
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        const response = await axios_1.default.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "google/gemma-3n-e2b-it:free",
            messages,
            stream: true,
        }, {
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000", // Should clarify if this should stay localhost
                "X-Title": "Webyrix",
            },
            responseType: "stream",
        });
        const stream = response.data;
        // Pipe the stream directly to the response
        stream.pipe(res);
        stream.on('end', () => {
            res.end();
        });
        stream.on('error', (err) => {
            console.error('Stream error:', err);
            res.end();
        });
    }
    catch (error) {
        console.error("API error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.default = router;
