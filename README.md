# A Space Story

A cinematic, web-based educational platform that teaches people how to code through the lens of real historical space events. This is not a traditional coding course — it is an experience. Users do not sit through lectures or read documentation; they live through stories.

## What is it?

Each lesson is a story. A real space event — a mission, a discovery, a moment in history — is told chapter by chapter in a cinematic, narrative-driven way. Think of it like reading a thrilling novel, except at key moments in the story, the user must write code to unlock what happens next. The code they write is directly tied to the story — it is not busywork, it is meaningful. If they do not solve it, the story does not continue.

## Who is it for?

Complete beginners. People who have never written a single line of code but are curious about space, technology, and the universe. The platform holds their hand from the very first moment — even the onboarding experience is a gentle, beginner-friendly coding challenge wrapped inside a cinematic sequence.

## What makes it different?

Most coding platforms are dry, abstract, and intimidating. **A Space Story** makes coding feel essential and emotional. You are not learning to code in the abstract — you are helping Laika reach orbit, calculating Apollo 11’s trajectory, decoding signals from Voyager. The code has stakes. The story depends on it.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite |
| Backend | ASP.NET Core Web API (C#) |
| Database | PostgreSQL |
| Authentication | JWT (login & register) |
| Star field & warp | Three.js |
| Code editor | Monaco Editor (embedded in the browser) |
| Code execution *(planned)* | Judge0 API for running and validating user-submitted code |

## What’s built so far

### Authentication & onboarding

- Space-themed **login and register** page with an animated Three.js star field, sparkling stars, and a smooth 3D flip transition between forms
- Full **JWT authentication** backed by PostgreSQL for secure user storage
- **Cinematic first-time intro** for new users:
  - Pure black screen with a slow typewriter greeting
  - Traveling star field that fades in after the hello sequence
  - Narrative lines leading to a Carl Sagan quote with a blank to complete
  - A pulsing, clickable blank (no underscore characters — a clean line in the quote)
  - **Monaco Editor** with simple, beginner-friendly instructions
  - **Hyperspace warp** on the same star field when the correct answer is submitted
  - Redirect to the personal dashboard after the experience completes (shown once per user via `hasSeenIntro` in local storage)

### Dashboard

- Placeholder **home** route for authenticated users (mission control / progress UI coming next)

## What’s coming next

- **Personal dashboard** — progress overview and story selection
- **First full story: Laika** — the Soviet dog who became the first living creature in space
- Chapter-by-chapter narrative with **coding checkpoints** that gate story progression
- **Code execution and validation** (Judge0) to check user answers in lessons
- **Progress tracking** so the journey is saved and resumable
- More stories covering iconic moments in space history

## Project structure

```
a-space-story/
├── src/                 # React frontend (pages, components, styles)
├── Story.API/           # ASP.NET Core Web API
└── package.json         # Frontend dependencies & scripts
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [.NET SDK](https://dotnet.microsoft.com/download) (for Story.API)
- [PostgreSQL](https://www.postgresql.org/) running locally

### Database

Create a database (default name in config: `aspacestory`) and update the connection string in `Story.API/appsettings.json` if needed.

Apply migrations from the `Story.API` folder:

```bash
dotnet ef database update --project Story.API/Story.API.csproj
```

### Backend API

```bash
cd Story.API
dotnet run
```

The API listens on **http://localhost:5240** by default.

### Frontend

```bash
npm install
npm run dev
```

The app runs at **http://localhost:5173**. Vite proxies `/api` requests to the API in development.

### Build for production

```bash
npm run build
dotnet publish Story.API/Story.API.csproj -c Release
```

## Environment

Optional frontend env file (see `.env.example`):

```bash
cp .env.example .env
```

Secrets and local overrides should stay out of git — see `.gitignore` for ignored patterns (`appsettings.*.local.json`, `.env`, etc.).

## License

Private project — all rights reserved unless otherwise specified.
