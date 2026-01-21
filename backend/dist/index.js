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
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' })); // Increase limit for large HTML payloads
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n[$timestamp] ${req.method} ${req.path}`);
    console.log(`Headers:`, req.headers.authorization ? 'Auth token present' : 'No auth token');
    if (Object.keys(req.body).length > 0) {
        console.log(`Body:`, JSON.stringify(req.body, null, 2));
    }
    next();
});
app.get('/', (req, res) => {
    console.log('✓ Root endpoint hit');
    res.send('Webyrix Backend is running!');
});
app.get('/api/health', (req, res) => {
    console.log('✓ Health check endpoint hit');
    res.json({ status: 'ok', timestamp: new Date() });
});
// Import Routes
const users_1 = __importDefault(require("./routes/users"));
const projects_1 = __importDefault(require("./routes/projects"));
const frames_1 = __importDefault(require("./routes/frames"));
const ai_1 = __importDefault(require("./routes/ai"));
// Register Routes
console.log('\n🔧 Registering API routes...');
app.use('/api/users', users_1.default);
console.log('  ✓ /api/users registered');
app.use('/api/projects', projects_1.default);
console.log('  ✓ /api/projects registered');
app.use('/api/frames', frames_1.default);
console.log('  ✓ /api/frames registered');
app.use('/api/ai-model', ai_1.default);
console.log('  ✓ /api/ai-model registered');
// 404 handler
app.use((req, res) => {
    console.log(`❌ 404 Not Found: ${req.method} ${req.path}`);
    res.status(404).json({ error: 'Endpoint not found' });
});
// Error handler
app.use((err, req, res, next) => {
    console.error(`❌ Error:`, err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 Webyrix Backend Server Started');
    console.log('='.repeat(50));
    console.log(`📍 Server URL: http://localhost:${PORT}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    console.log(`🔐 Clerk: ${process.env.CLERK_SECRET_KEY ? 'Configured' : 'Not configured'}`);
    console.log(`🤖 OpenRouter: ${process.env.OPENROUTER_API_KEY ? 'Configured' : 'Not configured'}`);
    console.log('='.repeat(50));
    console.log('✓ Ready to accept requests\n');
});
