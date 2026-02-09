# ContentForge — Claude Code Rules

## Project Overview

ContentForge is an AI-powered SaaS platform that transforms a single piece of content (audio, video, or text) into platform-optimized outputs for multiple social media channels. Built as a Next.js 14+ web application with Stripe billing.

## Tech Stack

- **Framework:** Next.js 14+ with App Router (TypeScript strict mode)
- **Frontend:** React 18+, Tailwind CSS, shadcn/ui components
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma (always run `npx prisma generate` after schema changes)
- **Auth:** NextAuth.js (Auth.js) with Google + email providers
- **AI — Transcription:** OpenAI Whisper API (fallback: Deepgram)
- **AI — Content Generation:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Payments:** Stripe Billing (Checkout, Customer Portal, Webhooks)
- **File Storage:** Supabase Storage (or S3-compatible)
- **Hosting:** Vercel
- **Monitoring:** PostHog (analytics), Sentry (errors)

## Project Structure

```
contentforge/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Auth pages (login, register, reset)
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   │   ├── projects/       # Project list + detail views
│   │   │   ├── settings/       # User settings, billing
│   │   │   └── layout.tsx      # Dashboard layout with sidebar
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # NextAuth endpoints
│   │   │   ├── projects/       # CRUD + processing
│   │   │   ├── generate/       # Content generation endpoints
│   │   │   ├── transcribe/     # Transcription endpoint
│   │   │   ├── stripe/         # Webhook handler
│   │   │   └── upload/         # File upload handler
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── editor/             # Inline content editor
│   │   └── landing/            # Landing page sections
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── transcribe.ts   # Whisper API integration
│   │   │   ├── analyze.ts      # Master content analysis
│   │   │   ├── generate.ts     # Output generation orchestrator
│   │   │   └── prompts/        # Platform-specific system prompts
│   │   │       ├── twitter.ts
│   │   │       ├── linkedin.ts
│   │   │       ├── instagram.ts
│   │   │       ├── blog.ts
│   │   │       ├── newsletter.ts
│   │   │       └── short-video.ts
│   │   ├── stripe/
│   │   │   ├── client.ts       # Stripe client init
│   │   │   ├── webhooks.ts     # Webhook event handlers
│   │   │   └── plans.ts        # Plan definitions + limits
│   │   ├── db/
│   │   │   └── prisma.ts       # Prisma client singleton
│   │   ├── storage/
│   │   │   └── upload.ts       # File upload to Supabase Storage
│   │   ├── auth.ts             # NextAuth config
│   │   ├── utils.ts            # Shared utilities
│   │   └── constants.ts        # App-wide constants
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   └── middleware.ts           # Auth + rate limiting middleware
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Prisma migrations
├── public/                     # Static assets
├── .env.local                  # Environment variables (NEVER commit)
├── .env.example                # Template for env vars
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Core Rules

### Code Style & Conventions

1. **TypeScript strict mode everywhere.** No `any` types unless absolutely unavoidable (and then add a `// TODO: type this properly` comment).
2. **Use `type` over `interface`** for consistency, unless extending is needed.
3. **Functional components only.** No class components.
4. **Named exports** for components and utilities. Default exports only for Next.js pages/layouts.
5. **File naming:** kebab-case for files (`content-editor.tsx`), PascalCase for components (`ContentEditor`).
6. **Imports:** Group and order — (1) React/Next, (2) external libs, (3) internal `@/lib`, (4) internal `@/components`, (5) types, (6) styles.
7. **No console.log in production code.** Use structured logging via a logger utility. `console.error` is acceptable for error boundaries.

### Next.js Specific

1. **Use Server Components by default.** Only add `"use client"` when the component needs interactivity (useState, useEffect, onClick, etc.).
2. **Server Actions** for form mutations where appropriate. API routes for complex operations.
3. **Use `loading.tsx` and `error.tsx`** in route segments for proper loading/error states.
4. **Metadata:** Every page must export `metadata` or `generateMetadata` for SEO.
5. **Environment variables:** Server-only vars use no prefix. Client-exposed vars use `NEXT_PUBLIC_` prefix. Never expose API keys to the client.

### Database & Prisma

1. **Always use the Prisma singleton** from `@/lib/db/prisma.ts` — never instantiate `new PrismaClient()` directly.
2. **Migrations:** Create migration for every schema change: `npx prisma migrate dev --name descriptive-name`.
3. **Soft delete** for user content (add `deletedAt` column) — never hard delete user data without explicit request.
4. **Index** all foreign keys and frequently queried columns.
5. **Use transactions** for operations that modify multiple tables.

### Database Schema (Core Tables)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  plan          Plan      @default(FREE)
  stripeCustomerId    String?   @unique
  stripeSubscriptionId String?  @unique
  usageCount    Int       @default(0)
  usageResetAt  DateTime?
  brandVoice    Json?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  projects      Project[]
  accounts      Account[]
  sessions      Session[]
}

model Project {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  title         String
  status        ProjectStatus @default(UPLOADING)
  inputType     InputType
  inputText     String?   @db.Text
  inputFileUrl  String?
  transcript    String?   @db.Text
  masterAnalysis Json?
  outputs       Output[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  @@index([userId])
}

model Output {
  id            String    @id @default(cuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  platform      Platform
  content       String    @db.Text
  editedContent String?   @db.Text
  metadata      Json?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([projectId])
}

enum Plan { FREE, CREATOR, PRO, TEAM }
enum ProjectStatus { UPLOADING, TRANSCRIBING, ANALYZING, GENERATING, READY, FAILED }
enum InputType { TEXT, AUDIO, VIDEO }
enum Platform { TWITTER, LINKEDIN, INSTAGRAM, BLOG, NEWSLETTER, SHORT_VIDEO, THREADS, QUOTE_CARD }
```

### AI Integration Rules

1. **System prompts live in `src/lib/ai/prompts/`.** One file per platform. Each exports a function that takes the master analysis and returns a complete system prompt.
2. **Never hardcode model names.** Use constants from `@/lib/constants.ts`: `CLAUDE_MODEL = "claude-sonnet-4-20250514"`, `WHISPER_MODEL = "whisper-1"`.
3. **Parallel generation.** Use `Promise.allSettled()` (not `Promise.all()`) for generating multiple outputs — one failure must not block others.
4. **Token budgets.** Each prompt must specify `max_tokens` appropriate for the platform (e.g., Twitter thread: 2000, blog post: 4000).
5. **Structured output.** Always request JSON output from Claude with a clear schema. Parse and validate with Zod before storing.
6. **Error handling.** Wrap all AI API calls in try/catch. On failure: log error, mark output as failed, allow individual retry.
7. **Rate limiting.** Implement per-user rate limiting on generation endpoints. Free: 3/month, Creator: 30/month, Pro: unlimited (but still rate-limited per-minute).

### Stripe Integration Rules

1. **Webhook verification is mandatory.** Always verify Stripe webhook signatures using `stripe.webhooks.constructEvent()`.
2. **Idempotent webhook handling.** Stripe may send the same event multiple times. Always check if the event has already been processed.
3. **Plan limits enforced server-side.** Never trust client-side plan checks. Always verify subscription status and usage count in API route middleware.
4. **Webhook events to handle:**
   - `checkout.session.completed` → Activate subscription, update user plan
   - `invoice.paid` → Reset usage counter, confirm active status
   - `invoice.payment_failed` → Flag account, send grace period warning
   - `customer.subscription.updated` → Sync plan changes
   - `customer.subscription.deleted` → Downgrade to Free plan
5. **Test with Stripe CLI** locally: `stripe listen --forward-to localhost:3000/api/stripe/webhooks`.

### Authentication Rules

1. **Protect all `/dashboard` routes** via middleware — redirect unauthenticated users to `/login`.
2. **API routes** must verify session via `getServerSession()` before processing.
3. **Never expose user IDs in URLs** without ownership verification in the API handler.
4. **Session strategy:** JWT for stateless auth (default NextAuth.js behavior).

### File Upload Rules

1. **Validate file type and size server-side.** Never trust client-side validation alone.
2. **Accepted types:** Audio (MP3, WAV, M4A, OGG ≤500MB), Video (MP4, MOV, WEBM ≤2GB), Text (TXT, MD, DOCX, PDF ≤10MB).
3. **Chunked upload** for files >50MB.
4. **Generate unique filenames** using `cuid()` + original extension. Never use user-provided filenames directly.
5. **Virus scan** (ClamAV or similar) before processing — implement in Phase 2.
6. **Auto-delete** uploaded files after 30 days of inactivity.

### Error Handling

1. **Custom error classes** in `src/lib/errors.ts`: `AppError`, `AuthError`, `PlanLimitError`, `AIError`, `UploadError`.
2. **API routes** must return consistent error JSON: `{ error: string, code: string, status: number }`.
3. **Never expose internal error details** to the client. Log full details server-side, return user-friendly messages.
4. **Global error boundary** in `src/app/error.tsx` for unhandled React errors.

### Testing

1. **Unit tests** for utility functions and AI prompt builders (Vitest).
2. **Integration tests** for API routes (Vitest + supertest or Next.js test utilities).
3. **E2E tests** for critical flows: signup → upload → generate → export (Playwright).
4. **Test Stripe webhooks** using Stripe CLI fixtures.
5. **Minimum coverage target:** 80% for `src/lib/`, 60% overall.

### Performance

1. **Lazy load** heavy components (editor, file uploader) with `next/dynamic`.
2. **Image optimization** via `next/image` for all images.
3. **Cache** static pages and API responses where appropriate (ISR for landing page, SWR for dashboard data).
4. **Database queries:** Always `select` only needed fields. Use pagination for list endpoints (cursor-based preferred).

### Security Checklist

- [ ] All API routes verify authentication
- [ ] All API routes verify resource ownership (user can only access own projects)
- [ ] Stripe webhooks verified with signature
- [ ] File uploads validated server-side (type, size, content)
- [ ] Rate limiting on all public endpoints
- [ ] CSRF protection via NextAuth.js
- [ ] Environment variables never exposed to client
- [ ] SQL injection prevented via Prisma parameterized queries
- [ ] XSS prevented via React's default escaping + CSP headers
- [ ] No sensitive data in logs

### Environment Variables

```bash
# .env.example
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CREATOR_PRICE_ID=
STRIPE_PRO_PRICE_ID=

# Storage
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Monitoring
NEXT_PUBLIC_POSTHOG_KEY=
SENTRY_DSN=
```

### Git Conventions

1. **Branch naming:** `feature/description`, `fix/description`, `chore/description`.
2. **Commit messages:** Conventional Commits format — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
3. **Never commit `.env.local`** or any file containing secrets.
4. **PR required** for `main` branch. Self-review is acceptable for solo development.

### Development Workflow

1. `npm run dev` — Start local development server
2. `npx prisma studio` — Visual database browser
3. `stripe listen --forward-to localhost:3000/api/stripe/webhooks` — Local Stripe webhooks
4. `npm run build` — Verify build passes before committing
5. `npm run lint` — ESLint must pass with zero warnings
6. `npm run test` — All tests must pass

### What NOT to Build (Out of Scope for MVP)

- Mobile app (web-only for now)
- Direct social media publishing (copy/paste is fine for v1)
- Video/image generation (text outputs only)
- Team collaboration features
- Custom integrations or API access
- Multi-language output (English only for v1)
- AI chatbot or conversational interface
- Content scheduling/calendar
