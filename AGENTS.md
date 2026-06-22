# MatchPulse AI Agent Instructions

## Project Overview
MatchPulse is a mobile-first, live football (soccer) match tracker built for the "H0: Hack the Zero Stack" hackathon. 
Target audience: Football fans in emerging markets / World Cup viewers.

## Tech Stack (Strict Constraints)
- **Framework:** Next.js 14+ (App Router ONLY. Do not use the old Pages router).
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui + lucide-react (for icons).
- **Database:** Amazon Aurora PostgreSQL. We use the raw `pg` npm package via `src/lib/db.ts`.
- **Hosting:** Vercel (Serverless API routes, Vercel Cron jobs).
- **FORBIDDEN:** Do NOT suggest or use Prisma, Drizzle, Supabase, Firebase, or MongoDB. We must use raw SQL to interact directly with Aurora PostgreSQL to satisfy hackathon judging criteria.

## Coding Rules & Conventions
1. **React/Next.js Architecture:** 
   - Use React Server Components by default. Only add `'use client'` at the very top of a file if it requires browser interactivity (onClick, useState, useEffect).
   - Use the `app/` directory for routing.
   - API routes must be placed in `app/api/[route]/route.ts` and export async functions named `GET`, `POST`, etc.
2. **Database Interactions:**
   - ALWAYS import and use `getDbClient()` from `@/lib/db` to get the database connection.
   - Write standard SQL queries. 
   - When syncing data from the external sports API, always use UPSERT logic: `INSERT INTO ... ON CONFLICT (external_api_id) DO UPDATE SET ...` to prevent duplicate rows.
3. **UI/UX Design System:**
   - Mobile-first design. Wrap main content in a max-width container (e.g., `max-w-md mx-auto`) so it looks like a native app on desktop.
   - Dark mode default (zinc-950 background).
   - Primary accent color: Neon Green (`#00FF66` or `green-400`) for live indicators, active states, and primary buttons.
   - Use skeleton loaders for loading states.
4. **Context for the User:**
   - The user is an expert Flutter/Dart developer but a beginner in Next.js/React. 
   - When explaining concepts, use Flutter analogies (e.g., "Widgets" = "Components", "Screens" = "Pages/Routes", "StatefulWidget" = "'use client' component", "pubspec.yaml" = "package.json").
   - Keep code clean, heavily commented, and avoid overly complex React patterns.

## Hackathon Priorities
- Focus on high-impact features: Live scores, match event timelines, and the freemium UI (blurring premium stats for free users).
- Ensure the architecture clearly demonstrates the Vercel -> Next.js API -> Aurora PostgreSQL flow.
