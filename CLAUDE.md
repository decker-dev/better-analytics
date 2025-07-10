# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Better Analytics is a monorepo containing a micro-analytics JavaScript SDK and supporting applications:
- **Core SDK** (`packages/better-analytics`): Framework-agnostic analytics library with Next.js, Expo, and server adapters
- **Web App** (`apps/app`): Next.js dashboard for managing analytics sites and viewing data  
- **Documentation** (`apps/docs`): Next.js documentation site
- **UI Package** (`packages/ui`): Shared React components with shadcn/ui
- **Email Package** (`packages/email`): React Email templates

## Development Commands

### Core Commands
```bash
# Install dependencies (uses pnpm workspaces)
pnpm install

# Build all packages and apps
pnpm build

# Start development servers for all apps
pnpm dev

# Run tests across all packages
pnpm test

# Type checking across all packages
pnpm check-types

# Lint all packages (uses Biome)
pnpm lint

# Format code with Prettier
pnpm format
```

### App-Specific Commands
```bash
# Run main app only (port 3010)
cd apps/app && pnpm dev

# Run docs site only  
cd apps/docs && pnpm dev

# Database operations (main app)
cd apps/app && pnpm db:generate   # Generate migrations
cd apps/app && pnpm db:migrate    # Run migrations  
cd apps/app && pnpm db:push      # Push schema changes
cd apps/app && pnpm db:studio    # Open Drizzle Studio

# SDK development
cd packages/better-analytics && pnpm dev    # Watch mode
cd packages/better-analytics && pnpm test   # Run tests
```

## Architecture

### Monorepo Structure
- Uses **Turbo** for build orchestration and caching
- **pnpm workspaces** for dependency management
- **Biome** for linting and formatting (configured in `biome.json`)

### Tech Stack
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Better Auth for authentication
- **Database**: PostgreSQL with Drizzle ORM, hosted on Neon
- **Analytics SDK**: Vanilla TypeScript with framework adapters
- **UI Components**: shadcn/ui with Radix primitives
- **Email**: React Email with Resend

### Main App (`apps/app`)
- **Authentication**: Better Auth with GitHub/Google OAuth
- **Database**: Drizzle ORM with PostgreSQL schema in `src/lib/db/schema.ts`
- **Organization System**: Multi-tenant with organization-based routing (`/[orgSlug]/`)
- **Site Management**: Each organization can create multiple analytics sites
- **Module Structure**: Feature-based modules in `src/modules/` (auth, organization, sites, onboarding)

### SDK Package (`packages/better-analytics`)
- **Core**: `src/index.ts` - Main analytics functions (init, track, trackPageview, identify)
- **Next.js Adapter**: `src/next/` - React components and server utilities
- **Expo Adapter**: `src/expo.ts` - React Native integration
- **Server**: `src/server.ts` - Server-side tracking utilities
- **Queue System**: `src/queue.ts` - Offline event handling and retry logic

### Key Files
- **Database Schema**: `apps/app/src/lib/db/schema.ts` - All database tables and types
- **Auth Configuration**: `apps/app/src/modules/auth/lib/auth.ts` - Better Auth setup
- **Analytics Logic**: `apps/app/src/modules/sites/lib/analytics.ts` - Data aggregation
- **SDK Entry Point**: `packages/better-analytics/src/index.ts` - Main SDK exports

## Environment Setup

The main app requires these environment variables:
- `DATABASE_URL` - PostgreSQL connection string  
- `BETTER_AUTH_SECRET` - Authentication secret
- `BETTER_AUTH_URL` - Base URL for auth callbacks
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - GitHub OAuth
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth  
- `RESEND_API_KEY` - Email sending

## Testing

### SDK Tests
- Located in `packages/better-analytics/src/__tests__/`
- Uses Vitest with jsdom for browser environment simulation
- Run with `cd packages/better-analytics && pnpm test`

### Test Categories
- **Core functionality**: Basic SDK operations
- **Framework integrations**: Next.js, Expo adapters
- **Queue system**: Offline event handling
- **Performance**: Bundle size and load time tests
- **Accessibility**: WCAG compliance tests

## Deployment Notes

- **Build process**: Uses Turbo to build dependencies in correct order
- **Main app**: Runs database migrations before build (`pnpm db:migrate && next build`)
- **SDK**: Built with tsup for multiple output formats (ESM, CJS, with TypeScript declarations)
- **Docker**: `docker-compose.yml` available for local PostgreSQL setup

## Import Patterns

### SDK Usage
```typescript
// Core functions
import { init, track, trackPageview, identify } from 'better-analytics';

// Next.js component
import { Analytics } from 'better-analytics/next';

// Server-side tracking  
import { trackEvent } from 'better-analytics/server';

// Expo integration
import { init, track } from 'better-analytics/expo';
```

### Internal App Imports
```typescript
// Database
import { db } from '@/lib/db';
import type { Site, Event } from '@/lib/db/schema';

// UI components
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';

// Module imports
import { auth } from '@/modules/auth/lib/auth';
import { getSiteAnalytics } from '@/modules/sites/lib/analytics';
```