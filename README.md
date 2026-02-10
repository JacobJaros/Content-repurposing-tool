# ContentForge

AI-powered SaaS platform that transforms a single piece of content (audio, video, or text) into platform-optimized outputs for multiple social media channels.

## Tech Stack

- **Framework:** Next.js 14+ with App Router (TypeScript strict mode)
- **Frontend:** React 18+, Tailwind CSS
- **Database:** PostgreSQL via Supabase (not yet configured)
- **ORM:** Prisma (not yet configured)
- **Auth:** NextAuth.js (not yet configured)
- **AI:** Anthropic Claude API, OpenAI Whisper API (not yet configured)
- **Payments:** Stripe Billing (not yet configured)
- **Storage:** Supabase Storage (not yet configured)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth pages (login, register)
│   ├── (dashboard)/        # Protected dashboard routes
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── dashboard/          # Dashboard-specific components
│   ├── editor/             # Inline content editor
│   └── landing/            # Landing page sections
├── lib/
│   ├── ai/                 # AI integrations (Claude, Whisper)
│   ├── stripe/             # Stripe billing
│   ├── db/                 # Database client
│   └── storage/            # File storage
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── middleware.ts           # Auth + rate limiting middleware
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

See `.env.example` for required environment variables.

## Status

This is a scaffolded project skeleton. The following features are not yet implemented:

- [ ] Authentication (NextAuth.js)
- [ ] Database (Prisma + Supabase)
- [ ] Stripe billing
- [ ] AI content generation
- [ ] File upload and transcription
- [ ] shadcn/ui components

See `claude.md` for full project specifications.
