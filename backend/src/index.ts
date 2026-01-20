import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file (located in root of backend)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for large HTML payloads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
import usersRouter from './routes/users';
import projectsRouter from './routes/projects';
import framesRouter from './routes/frames';
import aiRouter from './routes/ai';

// Register Routes
console.log('\n🔧 Registering API routes...');
app.use('/api/users', usersRouter);
console.log('  ✓ /api/users registered');
app.use('/api/projects', projectsRouter);
console.log('  ✓ /api/projects registered');
app.use('/api/frames', framesRouter);
console.log('  ✓ /api/frames registered');
app.use('/api/ai-model', aiRouter);
console.log('  ✓ /api/ai-model registered');

// 404 handler
app.use((req, res) => {
    console.log(`❌ 404 Not Found: ${req.method} ${req.path}`);
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
