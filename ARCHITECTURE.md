# Webyrix - System Architecture & Flow

## Quick Reference: When Each API is Called

| API Endpoint | When Called | Triggered By | Purpose |
|--------------|-------------|--------------|---------|
| `POST /api/users` | Every app load | `Provider.tsx` | Create/fetch user account |
| `POST /api/projects` | Create new project | `Hero.tsx` | Initialize project + frame + chat |
| `GET /api/projects` | Load workspace/sidebar | `AppSidebar.tsx` | List all user projects |
| `GET /api/frames` | Open project | `playground/[projectId]/page.tsx` | Load frame + chat history |
| `PUT /api/frames` | Save design | `WebsiteDesign.tsx`, `page.tsx` | Update design code |
| `PUT /api/frames/chats` | Send/receive message | `page.tsx` | Update conversation |
| `POST /api/ai-model` | User sends message | `page.tsx` | Generate AI response (streaming) |

## User Journey: Step-by-Step

### Journey 1: New User Creates First Project

**Step 1: User Visits Website**
- URL: `http://localhost:3000`
- Component: `app/page.tsx` → `Hero.tsx`
- API: None yet

**Step 2: User Signs In**
- Component: Clerk modal
- API: Clerk handles authentication
- Result: JWT token stored in browser

**Step 3: App Initializes User**
- Component: `Provider.tsx` (runs on every page)
- API: `POST /api/users` (with JWT token)
- Backend: 
  - Verifies token with Clerk
  - Checks database for user
  - Creates user if new (2 credits)
- Result: User data stored in React Context

**Step 4: User Enters Design Prompt**
- Component: `Hero.tsx`
- User types: "Create a modern landing page"
- No API call yet

**Step 5: User Clicks Create**
- Component: `Hero.tsx`
- Frontend generates:
  - `projectId`: UUID (e.g., "abc-123-def")
  - `frameId`: Random number (e.g., "4567")
- API: `POST /api/projects`
  ```json
  {
    "projectId": "abc-123-def",
    "frameId": "4567",
    "messages": [{"role": "user", "content": "Create a modern landing page"}],
    "credits": 2
  }
  ```
- Backend:
  1. INSERT into `projects` table
  2. INSERT into `frames` table
  3. INSERT into `chats` table
  4. UPDATE `users` SET credits = 1
- Result: Project created, user has 1 credit left

**Step 6: Navigate to Playground**
- URL: `/playground/abc-123-def?frameId=4567`
- Component: `playground/[projectId]/page.tsx`

**Step 7: Load Frame Data**
- API: `GET /api/frames?frameId=4567&projectId=abc-123-def`
- Backend:
  - SELECT from `frames` WHERE frameId = 4567
  - SELECT from `chats` WHERE frameId = 4567
  - Combine and return
- Result: Frame data + chat messages loaded

**Step 8: Auto-Send First Message to AI**
- Component: `page.tsx` detects first message
- API: `POST /api/ai-model` (streaming)
  ```json
  {
    "messages": [{
      "role": "user",
      "content": "Create a modern landing page with Tailwind CSS..."
    }]
  }
  ```
- Backend:
  - Forwards to OpenRouter API
  - Streams response back chunk by chunk
- Frontend:
  - Receives chunks in real-time
  - Appends to `generatedCode` state
  - Updates iframe preview live

**Step 9: Save Generated Code**
- API: `PUT /api/frames`
  ```json
  {
    "designCode": "<html>...</html>",
    "frameId": "4567",
    "projectId": "abc-123-def"
  }
  ```
- Backend: UPDATE `frames` SET designCode = ...
- Result: Design saved to database

**Step 10: Save Conversation**
- API: `PUT /api/frames/chats`
  ```json
  {
    "messages": [
      {"role": "user", "content": "Create..."},
      {"role": "assistant", "content": "Your code is ready!"}
    ],
    "frameId": "4567"
  }
  ```
- Backend: UPDATE `chats` SET chatMessage = ...
- Result: Conversation saved

### Journey 2: User Iterates on Design

**Step 1: User Types New Message**
- User types: "Make the background blue"
- Component: `ChatSection.tsx`

**Step 2: Send to AI**
- API: `POST /api/ai-model` (streaming)
  ```json
  {
    "messages": [
      {"role": "user", "content": "Create..."},
      {"role": "assistant", "content": "Your code is ready!"},
      {"role": "user", "content": "Make the background blue"}
    ]
  }
  ```
- Backend: Streams AI response
- Frontend: Updates preview in real-time

**Step 3: Auto-Save**
- API: `PUT /api/frames` (save new code)
- API: `PUT /api/frames/chats` (save conversation)

### Journey 3: User Returns Later

**Step 1: User Visits Workspace**
- URL: `/workspace`
- Component: `AppSidebar.tsx`
- API: `GET /api/projects`
- Backend:
  - SELECT all projects for user
  - SELECT all frames for those projects
  - SELECT all chats for those frames
- Result: List of all projects with preview data

**Step 2: User Clicks Project**
- Navigate to: `/playground/abc-123-def?frameId=4567`
- API: `GET /api/frames?frameId=4567&projectId=abc-123-def`
- Result: Loads saved design and conversation

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js Frontend (:3000)                  │ │
│  │                                                        │ │
│  │  Components:                                           │ │
│  │  • Provider.tsx ────────────► POST /api/users         │ │
│  │  • Hero.tsx ────────────────► POST /api/projects      │ │
│  │  • AppSidebar.tsx ──────────► GET /api/projects       │ │
│  │  • page.tsx (playground) ───► GET /api/frames         │ │
│  │                          ───► POST /api/ai-model       │ │
│  │                          ───► PUT /api/frames          │ │
│  │                          ───► PUT /api/frames/chats    │ │
│  │  • WebsiteDesign.tsx ───────► PUT /api/frames         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP + JWT Token
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express Backend (:4000)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Middleware: requireAuth (Clerk JWT verification)      │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Routes:                                               │ │
│  │  • /api/users ──────────────► users.ts                │ │
│  │  • /api/projects ───────────► projects.ts             │ │
│  │  • /api/frames ─────────────► frames.ts               │ │
│  │  • /api/ai-model ───────────► ai.ts                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Clerk API  │    │  PostgreSQL  │    │  OpenRouter  │
│   (Auth)     │    │  (Database)  │    │  (AI API)    │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Database Schema & Relationships

```
users
├── id (PK)
├── name
├── email (unique)
└── credits
     │
     │ (one-to-many)
     ▼
projects
├── id (PK)
├── projectId
├── createdBy (FK → users.email)
└── createdOn
     │
     │ (one-to-many)
     ▼
frames
├── id (PK)
├── frameId
├── designCode
├── projectId (FK → projects.projectId)
└── createdOn
     │
     │ (one-to-many)
     ▼
chats
├── id (PK)
├── chatMessage (JSON array)
├── frameId (FK → frames.frameId)
├── createdBy (FK → users.email)
└── createdOn
```

## Authentication Flow Detail

```
1. User clicks "Sign In"
   ↓
2. Clerk modal opens
   ↓
3. User enters credentials
   ↓
4. Clerk validates & returns JWT
   ↓
5. Frontend stores JWT in memory
   ↓
6. Every API call includes: Authorization: Bearer <JWT>
   ↓
7. Backend middleware (requireAuth) verifies JWT
   ↓
8. Backend extracts userId from verified token
   ↓
9. Backend proceeds with request
```

## Streaming AI Response Flow

```
Frontend                Backend                 OpenRouter
   │                       │                        │
   │──POST /api/ai-model──→│                        │
   │                       │──POST /chat/completions→│
   │                       │   (stream: true)       │
   │                       │                        │
   │                       │←────chunk 1────────────│
   │←────chunk 1───────────│                        │
   │ (append to UI)        │                        │
   │                       │←────chunk 2────────────│
   │←────chunk 2───────────│                        │
   │ (append to UI)        │                        │
   │                       │←────chunk 3────────────│
   │←────chunk 3───────────│                        │
   │ (append to UI)        │                        │
   │                       │←────[DONE]─────────────│
   │                       │                        │
   │──PUT /api/frames──────→│                        │
   │ (save final code)     │                        │
```

## Error Handling Chain

```
Frontend Error → Display toast notification (sonner)
                 ↓
Backend Error → Return JSON error response
                 ↓
Database Error → Caught by try/catch, logged, return 500
                 ↓
Auth Error → Return 401 Unauthorized
                 ↓
Validation Error → Return 400 Bad Request
```

This document provides a complete map of how every part of the system works together!
