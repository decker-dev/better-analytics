# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Better Analytics is a micro-analytics JavaScript SDK and dashboard application built as a Turborepo monorepo. It provides developers with < 2KB gzip analytics tracking capabilities and a comprehensive dashboard for managing sites and viewing analytics data.

## Development Commands

### Core Commands
- `pnpm dev` - Start development servers for all workspaces
- `pnpm build` - Build all packages and applications
- `pnpm lint` - Run linting across all workspaces
- `pnpm test` - Run tests across all workspaces
- `pnpm format` - Format code using Prettier
- `pnpm check-types` - Type check all workspaces

### Main App Commands (apps/app)
- `pnpm dev` - Start development server on port 3011 with Turbopack
- `pnpm db:generate` - Generate Drizzle schema
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio for database management

### Package Manager
- Uses `pnpm` with workspaces
- Node.js >= 18 required

## Architecture

### Monorepo Structure
```
apps/
  app/           # Main Next.js dashboard application
  web/           # Demo Next.js app
packages/
  better-analytics/  # Core SDK with subpath exports
  email/            # Email templates using React Email
  typescript-config/ # Shared TypeScript configurations
  ui/               # Shared UI components (shadcn/ui based)
```

### Module-First Architecture (Screaming Architecture)
The main app follows a module-first pattern where business domains are organized as independent modules:

```
src/modules/
  auth/          # Authentication with Better Auth
  organization/  # Multi-tenant organization management
  sites/         # Site/project management
  onboarding/    # User onboarding flows
```

**Key principles:**
- Modules are independent with their own components, lib, actions, hooks, and types
- Limited cross-module imports - only from core/ shared code
- High cohesion within modules
- Each module can own its database schema

### Technology Stack

**Frontend:**
- Next.js 15 with App Router and Turbopack
- React 19
- TypeScript
- Tailwind CSS + shadcn/ui components
- SWR for client-side data fetching
- Motion for animations

**Backend:**
- Next.js API routes and Server Actions
- Better Auth for authentication (magic link + OAuth)
- Drizzle ORM with PostgreSQL
- Resend for email delivery

**Database Schema:**
- Events table for analytics data with comprehensive tracking fields
- Multi-tenant organization structure with members and invitations
- Sites table for project management
- Better Auth tables for users, sessions, accounts

**Development Tools:**
- Biome for linting (configured in biome.json)
- Prettier for formatting
- Vitest for testing
- Drizzle Kit for database operations

### Authentication
Uses Better Auth with:
- Magic link authentication (primary)
- GitHub and Google OAuth
- Organization plugin for multi-tenancy
- Email integration via Resend

### Database
- PostgreSQL with Drizzle ORM
- Comprehensive events tracking with user agent parsing, geographic data, UTM parameters
- Multi-tenant organization structure
- Database migrations in apps/app/drizzle/

### Code Style Guidelines
- Use tabs for general formatting, spaces for JavaScript (per biome.json)
- Early returns preferred for readability
- Descriptive variable and function names
- Handle-prefixed event functions (handleClick, handleKeyDown)
- Use const over functions where possible
- Implement accessibility features on interactive elements

## Better Analytics SDK (Core Package)

The `better-analytics` SDK (`packages/better-analytics/`) is the core package that provides micro-analytics capabilities. It's framework-agnostic, < 3KB gzipped, and tree-shakable.

### Package Structure
```
packages/better-analytics/src/
  index.ts      # Core SDK with init(), track(), trackPageview(), identify()
  types.ts      # TypeScript definitions for all platforms
  next.ts       # Next.js React component with auto-tracking
  server.ts     # Server-side tracking for Node.js/Edge functions
  expo.ts       # React Native/Expo adapter
  queue.ts      # Event queuing system for offline/pre-init scenarios
```

### SDK Exports (Subpath Exports)
- `better-analytics` - Core client-side functionality
- `better-analytics/next` - Next.js React component
- `better-analytics/server` - Server-side tracking
- `better-analytics/expo` - React Native/Expo support

### Key Features
**Core SDK (index.ts):**
- Environment detection (development/production modes)
- Session tracking with localStorage (30min timeout)
- Device fingerprinting with fallbacks
- UTM parameter extraction
- Browser/device info collection (screen, viewport, language, timezone, connection)
- Offline queue system with localStorage persistence
- BeforeSend middleware support for event transformation
- Route pattern computation for SPAs

**Queue System (queue.ts):**
- Pre-initialization event queuing
- Offline event persistence (max 100 events)
- Retry mechanism with exponential backoff
- Global `window.ba()` stub function

**Server Tracking (server.ts):**
- Zero-dependency server-side tracking
- Runtime detection (Node.js, Edge, Cloudflare, Deno)
- Framework detection (Vercel, Next.js, Nuxt, Gatsby, Netlify)
- Header parsing for IP, country, region, city
- Event batching system for performance
- Session stitching between client/server
- Express.js middleware included

**Next.js Integration (next.ts):**
- Auto-tracking React component with Suspense
- Route pattern computation using Next.js hooks
- Environment variable support (NEXT_PUBLIC_BA_SITE, NEXT_PUBLIC_BA_URL)
- Development/production mode detection
- Custom BeforeSend middleware support

### Core Functions
```typescript
// Initialize SDK
init({ site: 'my-site', endpoint: '/api/collect' })

// Track events
track('button_click', { button: 'signup' })
trackPageview()
identify('user-123', { email: 'user@example.com' })

// Next.js component
<Analytics site="my-site" api="/api/collect" />

// Server-side
initServer({ site: 'my-site' })
await trackServer('conversion', { value: 100 })
```

### Testing
Comprehensive test suite in `__tests__/` covering:
- Core functionality, browser compatibility
- Next.js component behavior
- Queue system and offline scenarios
- Server-side tracking
- Performance benchmarks
- Accessibility features
- User journey flows

### Environment Setup
The main app requires various environment variables for:
- Database connection (PostgreSQL)
- Authentication providers (GitHub, Google)
- Email service (Resend)
- Better Auth configuration

Check apps/app/src/env.ts for the complete environment schema.

### SDK Environment Variables
For the SDK itself:
- `NEXT_PUBLIC_BA_SITE` - Site identifier for tracking
- `NEXT_PUBLIC_BA_URL` - Custom analytics endpoint (optional)

## Main Dashboard Application (apps/app)

The main application is a comprehensive analytics dashboard built with the module-first architecture pattern. It provides a complete SaaS platform for managing analytics.

### Application Structure

**Route Architecture:**
```
src/app/
  layout.tsx           # Root layout with Analytics component
  page.tsx            # Landing page with features and code examples
  (auth)/             # Authentication route group
    sign-in/          # Magic link + OAuth login
    verify-email/     # Email verification
    accept-invitation/[id]/ # Organization invitations
  (core)/[orgSlug]/   # Organization-scoped route group
    layout.tsx        # Organization layout with header/navigation
    page.tsx          # Redirects to sites
    sites/            # Site management
      page.tsx        # Sites list dashboard
      new/page.tsx    # Create new site
      [siteKey]/      # Individual site routes
        onboarding/   # Site setup flow
        settings/     # Site configuration
        stats/        # Analytics dashboard
    settings/         # Organization settings
  onboarding/         # Initial organization setup
  api/                # API routes
    collect/          # Analytics data collection endpoint
    auth/[...all]/    # Better Auth handler
    sites/            # Site management API
    onboarding/       # Organization creation
```

### Key Features

**Landing Page (/):**
- Product showcase with feature cards
- Interactive code examples using CodeTabs component
- Installation instructions and getting started guide
- Automatic redirect to dashboard for authenticated users

**Authentication System:**
- Magic link authentication (primary method)
- GitHub and Google OAuth integration
- Multi-tenant organization support
- Email verification and invitation flows
- Session management with Better Auth

**Analytics Collection (/api/collect):**
- Zod schema validation for incoming events
- User agent parsing with my-ua-parser
- Comprehensive event storage with 30+ fields
- Support for UTM parameters, device info, performance metrics
- Real-time data ingestion from SDK

**Organization Management:**
- Multi-tenant architecture with organization slugs
- Role-based access (owner, admin, member)
- Invitation system with email notifications
- Organization settings with slug management
- Dynamic routing based on organization context

**Site Management:**
- Site creation with unique site keys
- Domain and description configuration
- Site ownership verification
- Bulk operations and filtering

**Analytics Dashboard:**
- Comprehensive statistics with 15+ metrics
- Real-time analytics with automatic updates
- Device, browser, OS, and geographic insights
- Top pages, referrers, and UTM campaign tracking
- Performance metrics (load times, bounce rates)
- Recent activity feed with time-ago formatting

**Onboarding Flow:**
- Step-by-step site setup wizard
- Interactive code examples with syntax highlighting
- Site key management with copy-to-clipboard
- Framework-specific installation guides

### Module Implementations

**Auth Module (src/modules/auth/):**
- Better Auth integration with caching
- Session management and organization switching
- Auth components (login forms, org switcher, sign-out)
- Cached session and organization data for performance

**Organization Module (src/modules/organization/):**
- Server actions for organization updates
- Form components for settings and member management
- Invitation system with email templates
- Slug validation and availability checking

**Sites Module (src/modules/sites/):**
- Site CRUD operations with database layer
- Analytics computation and statistics
- Component library for dashboards and metrics
- Site key generation and validation

**Onboarding Module (src/modules/onboarding/):**
- Multi-step onboarding flow
- Code example generation for different frameworks
- Secret input components with visibility toggle
- Integration instructions and setup guides

### Middleware and Security

**Authentication Middleware:**
- Route protection based on authentication status
- Organization access verification
- Automatic redirects for unauthorized access
- Special handling for invitation and verification routes
- Cached session data for performance

**API Security:**
- Session validation on all protected endpoints
- Organization ownership verification
- Input validation with Zod schemas
- Error handling with structured responses

### Database Operations

**Analytics Queries:**
- Complex aggregations for comprehensive statistics
- Time-based filtering (daily, weekly, total)
- Unique visitor tracking by session ID
- Top pages, referrers, browsers, OS analysis
- Device vendor and resolution statistics
- Performance metrics and load time analysis

**Site Management:**
- Site creation with unique key generation
- Organization-scoped queries
- Ownership verification and access control
- Update operations with validation

### Performance Features

**Caching Strategy:**
- Session and organization data caching
- Tag-based cache invalidation
- Unstable cache for frequently accessed data
- Revalidation on data updates

**Optimizations:**
- Server actions for form submissions
- Parallel data fetching where possible
- Efficient database queries with Drizzle ORM
- Turbopack for development builds