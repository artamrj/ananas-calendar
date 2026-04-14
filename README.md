# 🍍 Ananas Calendar

Turn messy text into clean calendar events in seconds.

**Ananas Calendar** is an AI-powered web app that reads plain-language event text, extracts the important details, and exports them as ready-to-import `.ics` calendar files.

Paste in a message, class note, meeting info, event announcement, or random block of schedule text. Ananas does the peeling for you. 🍍

> This whole project was created by **vibecoding**, and it is **free to use**.

## ✨ What It Does

Ananas takes unstructured text like:

- WhatsApp or Telegram messages
- copied email announcements
- meeting notes
- class schedules
- webinar pages
- recurring reminders

...and turns them into structured calendar data like:

- title
- description
- location
- link
- start date
- end date
- start time
- end time
- recurrence rule

Then it lets you export everything as an `.ics` file for Apple Calendar, Google Calendar, Outlook, and other calendar apps.

## 🌟 Features

- 🤖 AI-powered event extraction from free-form text
- ✅ JSON validation with `zod` before event data is accepted
- 🧠 automatic summarization for long descriptions
- 📅 clean event preview with date, time, location, link, and recurrence
- 📥 one-click `.ics` export
- 🗂️ local archive of previously processed events
- 📊 export tracking for saved records
- ⚙️ switch between supported Mistral-family AI models
- 🔐 server-side API proxy so your AI key stays out of the client bundle
- 💾 browser-based storage with no required database

## 🍍 Why Ananas?

Because calendars should not require detective work.

Most event info arrives in a messy human format:

- “Let’s meet next Thursday around 6”
- “Lecture starts 09:30, room B12, every Monday until July”
- “Zoom link below, please join 10 minutes early”
- “Dinner on Friday, maybe 8ish”

Humans can read that. Computers usually complain.

Ananas sits in the middle and says: "I got this."

## 🧭 How It Works

1. You paste event text into the app.
2. Ananas sends a structured extraction prompt to the local `/api/mistral` proxy.
3. The proxy forwards the request to the Mistral API using the server-side `MISTRAL_API_KEY`.
4. The AI returns structured JSON.
5. The app validates the response using the schema in [src/types/event.ts](/Users/arta/dyad-apps/ananas-calendar/src/types/event.ts).
6. If the description is too long, Ananas summarizes it automatically.
7. The event is displayed in a clean UI and stored in the local browser archive.
8. You export it as an `.ics` file and drop it into your calendar.

Simple in the UI. Nicely strict under the hood.

## 🧱 Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Radix UI
- Framer Motion
- Zod
- Sonner
- Mistral API
- Vercel serverless function support
- Cloudflare deployment support

## 📁 Project Structure

```text
.
├── api/                    # Server-side proxy for Mistral
├── public/                 # Static assets
├── src/
│   ├── ai-prompts/         # AI prompt templates
│   ├── components/         # UI and feature components
│   ├── hooks/              # Local state and browser persistence
│   ├── lib/                # Formatters, environment helpers, ICS generator
│   ├── pages/              # App pages
│   ├── services/           # AI and calendar services
│   ├── types/              # Shared types and validation schema
│   └── utils/              # Utility helpers
├── README.md
├── vite.config.ts
├── vercel.json
└── wrangler.jsonc
```

## 🏗️ Architecture Overview

### Frontend

The main application lives in [src/pages/Index.tsx](/Users/arta/dyad-apps/ananas-calendar/src/pages/Index.tsx). It handles:

- text input
- loading and error states
- event preview rendering
- archive browsing
- model switching
- `.ics` export actions

### AI Flow

The AI processing pipeline is split across a few focused files:

- [src/services/aiService.ts](/Users/arta/dyad-apps/ananas-calendar/src/services/aiService.ts) handles extraction and summarization
- [src/services/aiClient.ts](/Users/arta/dyad-apps/ananas-calendar/src/services/aiClient.ts) calls the local proxy endpoint
- [src/ai-prompts/eventExtractionPrompt.ts](/Users/arta/dyad-apps/ananas-calendar/src/ai-prompts/eventExtractionPrompt.ts) builds the extraction prompt
- [src/ai-prompts/summarizationPrompt.ts](/Users/arta/dyad-apps/ananas-calendar/src/ai-prompts/summarizationPrompt.ts) builds the summarization prompt

### Validation

The schema in [src/types/event.ts](/Users/arta/dyad-apps/ananas-calendar/src/types/event.ts) is an important guardrail.

LLMs are helpful, but they are not a type system. Ananas validates the returned JSON before it trusts it.

### Local Archive

The archive is managed in [src/hooks/useLocalCalendarHistory.ts](/Users/arta/dyad-apps/ananas-calendar/src/hooks/useLocalCalendarHistory.ts).

Each saved record can include:

- source text
- extracted JSON
- event details
- created and updated timestamps
- last export time
- export count

Everything is stored in browser `localStorage`, so no database is required for the current version.

### Calendar Export

The export flow uses:

- [src/services/calendarService.ts](/Users/arta/dyad-apps/ananas-calendar/src/services/calendarService.ts)
- [src/lib/ics-generator.ts](/Users/arta/dyad-apps/ananas-calendar/src/lib/ics-generator.ts)

It supports:

- timed events
- all-day events
- default one-hour end times for timed events when `time_end` is missing
- all-day next-day end generation when needed
- recurrence rule export
- safe filename sanitization

## 🚀 Getting Started

### Prerequisites

Before running the project, make sure you have:

- Node.js 18+ recommended
- `pnpm`
- a valid Mistral API key

### Install

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```bash
MISTRAL_API_KEY=your_mistral_api_key
VITE_DEFAULT_AI_MODULE=mistral-small-2409
```

Notes:

- `MISTRAL_API_KEY` is used by the local dev proxy and deployment proxy
- `VITE_DEFAULT_AI_MODULE` sets the default selected AI model in the UI
- if no valid model is supplied, the app falls back to `mistral-small-2409`
- never place secret API keys in `VITE_`-prefixed variables, because those are intended for client-side exposure

### Run Locally

```bash
pnpm dev
```

The Vite dev server runs on:

```text
http://localhost:8080
```

### Build For Production

```bash
pnpm build
```

### Preview The Production Build

```bash
pnpm preview
```

## ☁️ Deployment

This project is already structured to support multiple deployment approaches.

### Vercel

The file [api/mistral.ts](/Users/arta/dyad-apps/ananas-calendar/api/mistral.ts) can run as a serverless proxy function.

Required environment variable:

```bash
MISTRAL_API_KEY=your_mistral_api_key
```

### Cloudflare

The repository also includes `wrangler.jsonc` for Cloudflare-style deployment.

Basic flow:

```bash
pnpm build
npx wrangler deploy
```

Adjust the worker name, compatibility date, and asset configuration in `wrangler.jsonc` if your deployment setup differs.

## 🧪 Available Scripts

- `pnpm dev` starts the Vite development server
- `pnpm build` creates a production build
- `pnpm build:dev` creates a development-mode build
- `pnpm preview` previews the production build locally
- `pnpm lint` runs ESLint

## 🤖 Supported AI Models

The app currently accepts Mistral-family model names using prefixes such as:

- `mistral-`
- `open-mistral-`
- `pixtral-`

The UI currently exposes alternatives including:

- `mistral-small-2409`
- `mistral-large-latest`
- `mistral-medium-latest`
- `open-mistral-7b`
- `pixtral-12b-latest`

## 🔒 Privacy

Ananas is browser-first, but not offline-only.

- processed event history is stored locally in your browser using `localStorage`
- pasted event text is sent to the configured AI backend through `/api/mistral`
- the Mistral API key is intended to stay server-side and out of the browser bundle

If you paste sensitive information into the app, assume that content is being sent to your configured AI provider.

## ⚠️ Limitations

- AI extraction quality still depends on the clarity of the original text
- ambiguous dates and missing times may require manual review
- recurrence formatting in the UI is useful, but still basic
- archive data is local to the browser and device
- there is currently no authentication or cloud sync
- there is currently no automated test suite in the repository

## 💡 Good Use Cases

Ananas is especially useful for:

- turning copied text into calendar-ready events
- saving webinar, workshop, or meetup announcements
- converting class schedules into imports
- turning recurring reminders into usable event records
- quickly creating `.ics` files without manually filling calendar forms

## 🎨 Design Direction

Ananas is intentionally practical, but not boring.

The app uses a warm, playful visual identity with motion, rounded cards, and pineapple branding to make a utility workflow feel more alive. It is meant to feel light, fast, and friendly without losing structure.

Serious function. Tropical attitude. 🍍

## 🫶 Open Source And Usage

This project is **free to use**.

You can use it for:

- personal projects
- experiments
- learning
- internal tools
- customization
- building on top of it

If you want clearer legal reuse terms for public redistribution, add a formal `LICENSE` file to the repository.

## 🤝 Contributing

Contributions, forks, improvements, and experiments are welcome.

Interesting areas for future work:

- better recurrence parsing
- stronger timezone-aware extraction
- broader AI provider support
- test coverage for ICS generation
- richer archive filtering and search
- more advanced import/export workflows

## 🙌 Credits

- Created by **vibecoding**
- Built with React, TypeScript, Vite, Tailwind CSS, and Mistral

## 📌 Status

Ananas Calendar is already a usable lightweight AI utility for turning text into calendar events.

It is also a strong starting point for a bigger scheduling assistant, event parser, or productivity product if you want to grow it further.

If your event text is chaos, Ananas prefers to call it “raw material.” 😌
