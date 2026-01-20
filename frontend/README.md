# Webyrix Frontend

Next.js-based frontend for the Webyrix AI-powered web design platform.

## Tech Stack

- **Framework**: Next.js 16.1.2 (App Router)
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, shadcn/ui
- **Authentication**: Clerk
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Form Handling**: React Hook Form + Zod

## Prerequisites

- Node.js >= 18
- npm or yarn

## Environment Variables

Create a `.env` file in the frontend directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# ImageKit (Image Upload Service)
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=your_imagekit_endpoint
NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── _components/       # Shared components
│   ├── playground/        # Design playground
│   └── workspace/         # User workspace
├── components/            # UI components (shadcn/ui)
├── context/              # React contexts
├── hooks/                # Custom hooks
└── lib/                  # Utility functions
```

## Key Features

- **AI-Powered Design**: Generate web designs using AI
- **Real-time Preview**: Live preview of generated designs
- **Project Management**: Create and manage multiple projects
- **Authentication**: Secure user authentication with Clerk
- **Responsive UI**: Mobile-friendly interface

## API Integration

All API calls are made to the backend server specified in `NEXT_PUBLIC_API_URL`. The frontend automatically includes Clerk authentication tokens in all requests.
