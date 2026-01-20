# Webyrix - Complete System Workflow

## System Architecture Overview

```mermaid
graph TB
    User[User Browser] --> Frontend[Next.js Frontend :3000]
    Frontend --> Backend[Express Backend :4000]
    Backend --> DB[(PostgreSQL Database)]
    Backend --> Clerk[Clerk Auth Service]
    Backend --> OpenRouter[OpenRouter AI API]
    Frontend --> ClerkFE[Clerk Frontend SDK]
```

## Complete User Journey Flow

### 1. User Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Clerk
    participant Backend
    participant Database

    User->>Frontend: Visit Website
    Frontend->>Clerk: Check Auth Status
    
    alt Not Authenticated
        User->>Frontend: Click Sign In/Up
        Frontend->>Clerk: Redirect to Clerk
        Clerk->>User: Show Auth Form
        User->>Clerk: Submit Credentials
        Clerk->>Frontend: Return JWT Token
    end
    
    Frontend->>Backend: POST /api/users (with JWT)
    Backend->>Clerk: Verify JWT Token
    Backend->>Database: Check if user exists
    
    alt User Doesn't Exist
        Backend->>Database: INSERT new user (2 credits)
    end
    
    Backend->>Frontend: Return user data
    Frontend->>User: Show Dashboard
```

### 2. Project Creation Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: Enter design prompt
    User->>Frontend: Click Create
    Frontend->>Frontend: Generate UUID (projectId)
    Frontend->>Frontend: Generate frameId
    Frontend->>Backend: POST /api/projects
    Note over Frontend,Backend: {projectId, frameId, messages, credits}
    
    Backend->>Database: INSERT into projects table
    Backend->>Database: INSERT into frames table
    Backend->>Database: INSERT into chats table
    Backend->>Database: UPDATE users (credits - 1)
    
    Backend->>Frontend: Return {projectId, frameId}
    Frontend->>User: Navigate to /playground/{projectId}
```

### 3. AI Design Generation Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant OpenRouter
    participant Database
    
    User->>Frontend: In Playground Page
    Frontend->>Backend: GET /api/frames?frameId=X&projectId=Y
    Backend->>Database: SELECT frame + chats
    Backend->>Frontend: Return frame data
    
    alt First Message
        Frontend->>Backend: POST /api/ai-model (streaming)
        Note over Frontend,Backend: {messages: [{role: user, content: prompt}]}
        Backend->>OpenRouter: POST /chat/completions (stream: true)
        
        loop Streaming Response
            OpenRouter-->>Backend: Stream chunk
            Backend-->>Frontend: Forward chunk
            Frontend->>Frontend: Append to generatedCode
            Frontend->>User: Update preview in real-time
        end
        
        Frontend->>Backend: PUT /api/frames
        Note over Frontend,Backend: {designCode, frameId, projectId}
        Backend->>Database: UPDATE frames SET designCode
    end
```

### 4. Chat & Iteration Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant OpenRouter
    participant Database
    
    User->>Frontend: Type message "Make it blue"
    Frontend->>Frontend: Add to messages array
    Frontend->>Backend: POST /api/ai-model (streaming)
    
    Backend->>OpenRouter: Send conversation history
    
    loop Stream AI Response
        OpenRouter-->>Backend: Stream chunk
        Backend-->>Frontend: Forward chunk
        Frontend->>User: Update preview
    end
    
    Frontend->>Backend: PUT /api/frames/chats
    Note over Frontend,Backend: {messages: [...all messages], frameId}
    Backend->>Database: UPDATE chats SET chatMessage
    
    Frontend->>Backend: PUT /api/frames
    Note over Frontend,Backend: {designCode: newCode, frameId, projectId}
    Backend->>Database: UPDATE frames SET designCode
```

### 5. Project List & Navigation Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: Visit /workspace
    Frontend->>Backend: GET /api/projects
    Backend->>Database: SELECT projects WHERE createdBy = user
    Backend->>Database: SELECT frames WHERE projectId IN (...)
    Backend->>Database: SELECT chats WHERE frameId IN (...)
    Backend->>Backend: Combine data
    Backend->>Frontend: Return [{projectId, frameId, chats}]
    Frontend->>User: Display project list
    
    User->>Frontend: Click on project
    Frontend->>User: Navigate to /playground/{projectId}?frameId={frameId}
```

## API Endpoint Workflow Details

### POST /api/users
**When**: On every app load (after Clerk auth)
**Purpose**: Create or retrieve user account
**Flow**:
1. Frontend gets JWT from Clerk
2. Backend verifies JWT with Clerk
3. Backend fetches user details from Clerk API
4. Backend checks if user exists in database
5. If not, creates user with 2 credits
6. Returns user data to frontend

### POST /api/projects
**When**: User creates new project
**Purpose**: Initialize project, frame, and chat
**Flow**:
1. Frontend generates projectId (UUID) and frameId
2. Backend creates project record
3. Backend creates frame record
4. Backend creates chat record with initial message
5. Backend deducts 1 credit from user (if not unlimited)
6. Returns confirmation

### GET /api/projects
**When**: User visits workspace/sidebar
**Purpose**: List all user's projects
**Flow**:
1. Backend queries projects by user email
2. For each project, fetch associated frames
3. For each frame, fetch associated chats
4. Combine and return nested data structure

### GET /api/frames
**When**: User opens a project in playground
**Purpose**: Load frame design and chat history
**Flow**:
1. Backend queries frame by frameId and projectId
2. Backend queries all chats for that frameId
3. Flattens chat messages into single array
4. Returns frame with chatMessages array

### PUT /api/frames
**When**: User saves design or AI generates new code
**Purpose**: Update frame's design code
**Flow**:
1. Frontend sends HTML code
2. Backend updates frame record
3. Returns success confirmation

### PUT /api/frames/chats
**When**: User sends message or AI responds
**Purpose**: Update conversation history
**Flow**:
1. Frontend sends entire messages array
2. Backend updates chat record
3. Returns success confirmation

### POST /api/ai-model
**When**: User sends message to AI
**Purpose**: Generate AI response (streaming)
**Flow**:
1. Frontend sends messages array
2. Backend forwards to OpenRouter API
3. Backend streams response chunks back
4. Frontend accumulates and displays in real-time

## Data Flow Diagram

```mermaid
graph LR
    A[User Action] --> B{Action Type?}
    
    B -->|Sign In| C[Clerk Auth]
    C --> D[POST /api/users]
    D --> E[Database: users]
    
    B -->|Create Project| F[POST /api/projects]
    F --> G[Database: projects, frames, chats]
    F --> H[Update credits]
    
    B -->|Send Message| I[POST /api/ai-model]
    I --> J[OpenRouter API]
    J --> K[Stream Response]
    K --> L[PUT /api/frames]
    K --> M[PUT /api/frames/chats]
    
    B -->|Load Projects| N[GET /api/projects]
    N --> O[Database: Query All]
    
    B -->|Open Project| P[GET /api/frames]
    P --> Q[Database: frames + chats]
```

## Component Interaction Map

### Frontend Components
- **Hero.tsx**: Project creation → POST /api/projects
- **AppSidebar.tsx**: Project list → GET /api/projects
- **Provider.tsx**: User initialization → POST /api/users
- **page.tsx (playground)**: 
  - Load frame → GET /api/frames
  - Send messages → POST /api/ai-model
  - Save chats → PUT /api/frames/chats
  - Save design → PUT /api/frames
- **WebsiteDesign.tsx**: Save design → PUT /api/frames

### Backend Routes
- **users.ts**: User management
- **projects.ts**: Project CRUD + listing
- **frames.ts**: Frame operations + chat updates
- **ai.ts**: AI streaming proxy

## Credit System Flow

```mermaid
graph TD
    A[New User] -->|Sign Up| B[Receives 2 Credits]
    B --> C{Create Project?}
    C -->|Yes| D{Has Credits?}
    D -->|Yes| E[Deduct 1 Credit]
    D -->|No| F[Show Upgrade Message]
    E --> G[Create Project]
    C -->|No| H[Browse Projects]
    
    I[Unlimited Plan User] --> J[Skip Credit Check]
    J --> G
```

## Error Handling Flow

```mermaid
graph TD
    A[API Request] --> B{Auth Valid?}
    B -->|No| C[401 Unauthorized]
    B -->|Yes| D{Request Valid?}
    D -->|No| E[400 Bad Request]
    D -->|Yes| F{Resource Exists?}
    F -->|No| G[404 Not Found]
    F -->|Yes| H{Operation Success?}
    H -->|No| I[500 Internal Error]
    H -->|Yes| J[200 Success]
```

## Complete Request/Response Cycle

**Example: Creating and Generating a Design**

1. **User Action**: Enter "Create a landing page" → Click Create
2. **Frontend**: Generate IDs, call POST /api/projects
3. **Backend**: Create records, deduct credit
4. **Frontend**: Navigate to playground
5. **Frontend**: Call GET /api/frames (load data)
6. **Frontend**: Detect first message, call POST /api/ai-model
7. **Backend**: Stream from OpenRouter
8. **Frontend**: Display streaming code in iframe
9. **Frontend**: Call PUT /api/frames (save code)
10. **Frontend**: Call PUT /api/frames/chats (save conversation)
11. **User**: Sees live preview of generated design

This workflow repeats for each user interaction!
