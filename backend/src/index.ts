import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables from .env file (located in root of backend)
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Security Middleware
// app.use(helmet()); // Security headers
app.use(compression({
    filter: (req, res) => {
        if (req.headers['accept'] === 'text/event-stream') {
            return false; // Don't compress SSE
        }
        return compression.filter(req, res);
    }
})); // Compress responses

// Rate limiting
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // Limit each IP to 100 requests per windowMs
//     message: 'Too many requests from this IP, please try again later.',
//     standardHeaders: true,
//     legacyHeaders: false,
// });
// app.use('/api/', limiter);

// CORS
app.use(cors({
    origin: '*',
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' })); // Increase limit for large HTML payloads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] ${req.method} ${req.path}`);
    console.log(`Headers:`, req.headers.authorization ? 'Auth token present' : 'No auth token');
    if (Object.keys(req.body).length > 0) {
        console.log(`Body:`, JSON.stringify(req.body, null, 2));
    }
    next();
});

// Health check endpoints
app.get('/', (req, res) => {
    console.log('✓ Root endpoint hit');
    res.send('Webyrix Backend is running!');
});

app.get('/api/health', (req, res) => {
    console.log('✓ Health check endpoint hit');
    res.json({ status: 'ok', timestamp: new Date() });
});

// Import Routes
import usersRouter from './routes/users';
import projectsRouter from './routes/projects';
import framesRouter from './routes/frames';
import chatsRouter from './routes/chats';
import aiRouter from './routes/ai';

// Register Routes
console.log('\n🔧 Registering API routes...');
app.use('/api/users', usersRouter);
console.log('  ✓ /api/users registered');
app.use('/api/projects', projectsRouter);
console.log('  ✓ /api/projects registered');
app.use('/api/frames', framesRouter);
console.log('  ✓ /api/frames registered');
app.use('/api/chats', chatsRouter);
console.log('  ✓ /api/chats registered');
app.use('/api/ai-model', aiRouter);
console.log('  ✓ /api/ai-model registered');

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 Webyrix Backend Server Started');
    console.log('='.repeat(50));
    console.log(`📍 Server URL: http://localhost:${PORT}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    console.log(`🔐 Clerk: ${process.env.CLERK_SECRET_KEY ? 'Configured' : 'Not configured'}`);
    const geminiKeyCount = [1, 2, 3, 4, 5].filter(i => process.env[`GEMINI_API_KEY_${i}`]).length;
    console.log(`🤖 Gemini: ${geminiKeyCount} API key(s) configured`);
    console.log(`🛡️  Security: Helmet, Rate Limiting, Compression enabled`);
    console.log('='.repeat(50));
    console.log('✓ Ready to accept requests\n');
});

