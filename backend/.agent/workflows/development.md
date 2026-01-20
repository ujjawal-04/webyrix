---
description: Backend development workflow
---

# Backend Development Workflow

## Initial Setup

1. **Clone and Install**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   - Create `.env` file with required variables
   - Ensure DATABASE_URL points to your PostgreSQL database

3. **Database Setup**
   ```bash
   npm run db:push
   ```

4. **Start Development Server**
   // turbo
   ```bash
   npm run dev
   ```
   - Backend runs on `http://localhost:4000`

## Development Process

### Adding New API Endpoints

1. **Create Route File**
   ```typescript
   // src/routes/example.ts
   import express from 'express';
   import { requireAuth } from '../middleware/auth';
   
   const router = express.Router();
   
   router.get('/', requireAuth, async (req, res) => {
     // Your logic here
     res.json({ message: 'Success' });
   });
   
   export default router;
   ```

2. **Register Route**
   ```typescript
   // src/index.ts
   import exampleRouter from './routes/example';
   app.use('/api/example', exampleRouter);
   ```

### Database Changes

1. **Update Schema**
   - Edit `src/config/schema.ts`
   - Add/modify tables using Drizzle syntax

2. **Push to Database**
   ```bash
   npm run db:push
   ```

3. **View Database**
   ```bash
   npm run db:studio
   ```

### Testing

1. **Build Check**
   ```bash
   npm run build
   ```

2. **Test Endpoints**
   - Use Postman/Thunder Client
   - Include `Authorization: Bearer <clerk_token>` header

## Common Tasks

### Adding Database Table

```typescript
// src/config/schema.ts
export const newTable = pgTable('table_name', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  field: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().defaultNow(),
});
```

### Accessing Authenticated User

```typescript
import { clerkClient } from '@clerk/clerk-sdk-node';

router.post('/', requireAuth, async (req, res) => {
  const { userId } = req.auth;
  const user = await clerkClient.users.getUser(userId);
  // Use user data
});
```

### Updating Dependencies

```bash
npm update
npm audit fix
```

## Troubleshooting

- **Database Connection**: Verify DATABASE_URL in `.env`
- **Auth Errors**: Check CLERK_SECRET_KEY matches frontend
- **Port Conflicts**: Change PORT in `.env`
- **Build Errors**: Check TypeScript errors with `npm run build`
