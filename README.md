# PharmaQuest

A pharmacy exam prep quiz app for UK pre-registration pharmacists. Covers BNF chapters, Top 100 drugs, high-risk medications, OTC products, MEP guidelines, calculations, and compounding — with spaced-repetition (SRS) to surface questions at the right time.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Auth | Supabase Auth (email/password) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| SRS algorithm | SM-2 (spaced repetition) |
| Payments | Stripe Payment Links (hosted checkout) |

## Local Setup

### Prerequisites

- Node.js 18+
- A Supabase project (free tier is fine)

### 1. Clone and install

```bash
git clone <repo-url>
cd pharmaquest
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase credentials (see [Environment Variables](#environment-variables) below).

### 3. Apply database migrations

```bash
npx supabase db push
```

Or apply the files in `supabase/migrations/` manually via the Supabase SQL editor in the order they are numbered.

### 4. Import topic and question data

Import the topic hierarchy (runs locally, writes to `src/data/sections.ts`):
```bash
npm run import-topics
```

Import questions into the Supabase database (requires service role key — see `.env.example`):
```bash
npm run import-questions-to-supabase
```

> **Note:** The import scripts use the service role key and must be run from your local machine only. Never expose the service role key in the browser.

### 5. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL (`https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key — safe to expose in the browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Scripts only | Service role key — **never expose in browser or commit to git** |

Find `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your Supabase dashboard under **Project Settings → API**.

## Project Structure

```
src/
├── components/     — React UI components
├── context/        — Auth, Quiz, and Search React contexts
├── data/           — Static generated data (question bank, topic hierarchy)
├── hooks/          — useProgress (Supabase), useSRS (Supabase)
├── lib/            — Supabase client initialisation
├── services/       — Data access layer (topics, questions, progress, SRS)
├── types/          — TypeScript interfaces
└── utils/          — SRS calculator, retry logic, Stripe verification

supabase/
└── migrations/     — PostgreSQL migrations (apply in numeric order)

scripts/
├── importTopics.js              — CSV → src/data/sections.ts (static)
├── importTopicsToSupabase.js    — CSV → Supabase topics table
├── importQuizQuestions.js       — CSV → src/data/questionBank.ts (static)
└── importQuestionsToSupabase.js — CSV → Supabase question_table

data/
├── topics.csv            — Topic hierarchy source (503 rows)
└── quiz_questions_1.csv  — Question source (chunk 1, 2,435 rows)
```

## Database Schema

Five tables managed via Supabase with Row Level Security:

- **`topics`** — Section/topic/subtopic hierarchy (public read)
- **`question_table`** — Quiz questions with options, answers, explanations (public read)
- **`user_progress`** — Per-question completion and correctness (owner-only)
- **`srs_data`** — Spaced repetition state per question (owner-only)
- **`user_progress_summary`** — Section-level progress percentage (owner-only)

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run import-topics` | Regenerate `src/data/sections.ts` from `data/topics.csv` |
| `npm run import-questions` | Regenerate `src/data/questionBank.ts` from question CSVs |
| `npm run import-topics-to-supabase` | Load topics CSV into Supabase DB |
| `npm run import-questions-to-supabase` | Load question CSVs into Supabase DB |
| `npm run create-test-user` | Create a test account via Supabase Auth |

## Known Limitations

- Payment verification is client-side only (Stripe referrer check). A Supabase Edge Function webhook handler is needed for production-grade payment enforcement.
- Question count denominators in progress bars are derived from the bundled `src/data/questionBank.ts` static file rather than the live database. These will diverge if the database is updated without regenerating the static file.
- The `questionBank.ts` bundle (~130k lines) will significantly increase the initial JS payload. Consider lazy-loading or removing it in favour of always fetching from the database.
