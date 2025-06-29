# Better Analytics Email Templates

Professional email templates for Better Analytics with dark theme that matches your platform's branding.

## 📧 Available Templates

- **Magic Link Email** - For user authentication
- **Invitation Email** - For organization invitations  
- **Onboarding Email** - Welcome email for new users

## 🎨 Design Features

- **Dark theme** to match Better Analytics branding
- **Professional styling** similar to Vercel/Auth.js
- **Responsive design** with Tailwind CSS
- **High contrast** for accessibility
- **Consistent branding** across all templates

## 🚀 Development

### Preview emails locally

```bash
cd packages/email
pnpm dev
```

This will start the React Email development server at `http://localhost:3003`

### Available routes:
- `/magic-link` - Magic link authentication email
- `/invitation` - Organization invitation email  
- `/onboarding` - Welcome/onboarding email
- `/test-all` - Preview all emails in one page

### Build emails

```bash
pnpm build
```

### Export static emails

```bash
pnpm export
```

## 📝 Usage in App

The emails are automatically integrated into the Better Auth configuration. When users sign in or get invited, these professional emails will be sent.

### Email Helper Functions

```typescript
import { renderMagicLinkEmail, renderInvitationEmail, renderOnboardingEmail } from '@/modules/auth/lib/email-helpers';

// Render magic link email
const magicLinkHtml = renderMagicLinkEmail({
  magicLink: 'https://your-app.com/auth/verify?token=abc123',
  email: 'user@example.com'
});

// Render invitation email
const invitationHtml = renderInvitationEmail({
  invitationLink: 'https://your-app.com/accept-invitation/abc123',
  organizationName: 'Acme Corp',
  inviterName: 'John Doe',
  inviterEmail: 'john@acme.com',
  userEmail: 'user@example.com',
  role: 'admin'
});

// Render onboarding email
const onboardingHtml = renderOnboardingEmail({
  userName: 'John Doe',
  userEmail: 'user@example.com',
  dashboardUrl: 'https://your-app.com/dashboard',
  docsUrl: 'https://your-app.com/docs'
});
```

## 🎯 Color Scheme

- **Background**: `#0a0a0a` (very dark)
- **Container**: `#111111` (dark grey)
- **Cards**: `#1a1a1a` (slightly lighter)
- **Borders**: `#262626` / `#333333`
- **Primary text**: `#ffffff` (white)
- **Secondary text**: `#e5e5e5` (light grey)
- **Muted text**: `#a3a3a3` (medium grey)
- **Links**: `#60a5fa` (blue)
- **Buttons**: White background with black text for high contrast

## 📦 Dependencies

- `@react-email/components` - React Email components
- `@react-email/render` - Server-side rendering
- `@react-email/tailwind` - Tailwind CSS support 