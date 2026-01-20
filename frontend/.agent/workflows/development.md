---
description: Frontend development workflow
---

# Frontend Development Workflow

## Initial Setup

1. **Clone and Install**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env` (if exists)
   - Update environment variables with your credentials

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   - Frontend runs on `http://localhost:3000`
   - Ensure backend is running on `http://localhost:4000`

## Development Process

### Adding New Features

1. **Create Component**
   - Place in `app/_components/` for shared components
   - Place in specific route folder for route-specific components

2. **Use UI Components**
   - Import from `@/components/ui/`
   - shadcn/ui components are pre-configured

3. **API Integration**
   ```typescript
   import { useAuth } from '@clerk/nextjs';
   import axios from 'axios';

   const { getToken } = useAuth();
   const token = await getToken();
   
   const response = await axios.get(
     `${process.env.NEXT_PUBLIC_API_URL}/api/endpoint`,
     { headers: { Authorization: `Bearer ${token}` } }
   );
   ```

### Testing

1. **Run Linter**
   ```bash
   npm run lint
   ```

2. **Build Check**
   ```bash
   npm run build
   ```

## Common Tasks

### Adding a New Page

1. Create file in `app/` directory
2. Export default component
3. Add to navigation if needed

### Adding UI Component

```bash
# Use shadcn/ui CLI (if available)
npx shadcn-ui@latest add [component-name]
```

### Updating Dependencies

```bash
npm update
npm audit fix
```

## Troubleshooting

- **Build Errors**: Check TypeScript errors with `npm run build`
- **API Errors**: Verify `NEXT_PUBLIC_API_URL` points to running backend
- **Auth Issues**: Check Clerk configuration in `.env`
