"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file (located in root of backend)
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Webyrix Backend is running!');
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
// Import Routes
const users_1 = __importDefault(require("./routes/users"));
const projects_1 = __importDefault(require("./routes/projects"));
const frames_1 = __importDefault(require("./routes/frames"));
const ai_1 = __importDefault(require("./routes/ai"));
// Register Routes
app.use('/api/users', users_1.default);
app.use('/api/projects', projects_1.default); // Handle projects and get-all-projects
app.use('/api/frames', frames_1.default); // Handle frames and chats updates
app.use('/api/ai-model', ai_1.default); // Handle AI requests
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
