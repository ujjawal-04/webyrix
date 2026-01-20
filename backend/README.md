# Webyrix Backend

Express.js backend API for the Webyrix platform, handling authentication, database operations, and AI integration.

## Tech Stack

- **Framework**: Express.js 4.18.2
- **Language**: TypeScript 5.3.3
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM 0.45.1
- **Authentication**: Clerk SDK
- **AI Integration**: OpenRouter API

## Prerequisites

- Node.js >= 18
- PostgreSQL database (Neon recommended)

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host/database

# Clerk Authentication (Server-side)
CLERK_SECRET_KEY=your_clerk_secret_key

# OpenRouter AI API
OPENROUTER_API_KEY=your_openrouter_api_key

# Server Configuration
PORT=4000
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The server will start on `http://localhost:4000`.

## Build & Production

```bash
npm run build
npm start
```

## Database Management

```bash
# Push schema changes to database
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## Project Structure

```
backend/
├── src/
│   ├── config/           # Database configuration
│   │   ├── db.ts        # Database connection
│   │   └── schema.ts    # Database schema
│   ├── middleware/      # Express middleware
│   │   └── auth.ts      # Clerk authentication
│   ├── routes/          # API routes
│   │   ├── users.ts     # User management
│   │   ├── projects.ts  # Project operations
│   │   ├── frames.ts    # Frame & chat operations
│   │   └── ai.ts        # AI model integration
│   └── index.ts         # Server entry point
└── drizzle.config.ts    # Drizzle ORM configuration
```

## API Endpoints

### Authentication
All endpoints (except health check) require Clerk authentication via Bearer token.

### Users
- `POST /api/users` - Create or retrieve user

### Projects
- `POST /api/projects` - Create new project
- `GET /api/projects` - Get all user projects

### Frames
- `GET /api/frames?frameId=...&projectId=...` - Get frame details
- `PUT /api/frames` - Update frame design code
- `PUT /api/frames/chats` - Update chat messages

### AI
- `POST /api/ai-model` - Generate AI responses (streaming)

### Health
- `GET /api/health` - Health check endpoint

## Database Schema

- **users**: User accounts and credits
- **projects**: User projects
- **frames**: Design frames within projects
- **chats**: Chat messages for each frame

## Security

- CORS enabled for frontend origin
- Clerk JWT verification on all protected routes
- Environment variables for sensitive data
