# HireFlow Web

React frontend for **HireFlow**, a job portal for candidates, recruiters and admins.

Backend repository: [hireflow-backend](https://github.com/ANJ-NISH/hireflow-backend.git)


## Features

**Everyone**
- Landing page with real featured jobs and a hero search that opens the listing pre-filtered
- Job listing with debounced search, filters (title, location, work mode, employment type, skill) and pagination
- Job details page, registration and login, email verification and password reset

**Candidates**
- Profile builder: skills, experience, education, certifications, projects and languages
- Resume manager with upload progress, primary resume and delete
- Apply modal with resume picker and cover letter
- Application tracker with a pipeline progress bar, withdraw option and saved jobs

**Recruiters**
- Company profile and a job form that guides you to create a company first
- Job management: publish, pause, resume, close and delete
- Applicant review: change status, private notes, interview scheduling and resume download
- Candidate search and read-only candidate profiles

**Admins**
- Dashboard, plus user, company, job and complaint management

**Notifications**
- Bell icon with an unread badge, a dropdown of recent items, and a full notifications page

## Tech stack

React, TypeScript, Vite, Tailwind CSS v4, React Router. No UI library: all components are hand-built. Data fetching uses plain `fetch` wrapped in a small API client.

## How authentication works on the client

- The access token lives **in memory only**, never in `localStorage`.
- The refresh token is an `httpOnly` cookie managed by the browser, which JavaScript can't read.
- On page load, `initAuth()` silently restores the session from the cookie.
- `apiFetch()` attaches the token. On a 401 it refreshes once and retries the request.
- Concurrent refresh calls share one in-flight request, which avoids a race condition with rotating refresh tokens. The user is logged out only on a real 401, not on rate limits or network errors.

## Other implementation notes

- **Direct uploads:** resumes go from the browser straight to storage using a presigned URL, via `XMLHttpRequest` so upload progress can be shown.
- **Notifications:** the bell polls a lightweight unread-count endpoint every 45 seconds, pausing while the tab is hidden. The bell and the notifications page stay in sync through a browser event instead of a shared store.
- **Search from the URL:** the hero search and popular tags pass filters as query parameters, so listing results are shareable and survive a refresh.
- **Design tokens:** colors and fonts are defined once in `src/index.css` using Tailwind v4's `@theme`.

## Getting started

### Prerequisites

- Node.js 20 or newer
- The [backend](https://github.com/ANJ-NISH/hireflow-backend.git) running on port 5000

### Setup

```bash
git clone https://github.com/<your-username>/hireflow-frontend.git
cd hireflow-frontend
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run dev
```

Open http://localhost:5173.

### Environment variable

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the API, for example `http://localhost:5000` |

Anything in a `VITE_` variable is bundled into the public site, so never put secrets there.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |

## Routes

| Path | Page | Who |
|---|---|---|
| `/` | Home | Everyone |
| `/jobs`, `/jobs/:id` | Job listing and details | Everyone |
| `/login`, `/register` | Authentication | Everyone |
| `/forgot-password`, `/reset-password`, `/verify-email` | Account recovery and verification | Everyone |
| `/notifications` | Notifications | Logged-in users |
| `/candidate/profile`, `/candidate/applications`, `/candidate/saved-jobs` | Candidate area | Candidate |
| `/recruiter/company`, `/recruiter/jobs`, `/recruiter/jobs/new` | Recruiter area | Recruiter |
| `/recruiter/jobs/:jobId/applicants` | Applicants for a job | Recruiter |
| `/recruiter/candidates/search`, `/recruiter/candidates/:userId` | Candidate search and profile | Recruiter |
| `/admin`, `/admin/users`, `/admin/companies`, `/admin/jobs`, `/admin/complaints` | Admin area | Admin |

## Project structure

```
src/
  components/   Reusable UI (Navbar, JobCard, ApplyModal, NotificationBell, ...)
  pages/        Route components, grouped into admin/, candidate/ and recruiter/
  lib/
    auth.ts     Token handling, silent refresh and the apiFetch wrapper
    api/        Typed API functions, one file per backend area
  routes/       Route definitions
  index.css     Tailwind setup and theme tokens
```

## Status and limitations

Pages are not yet wrapped in client-side route guards, so a logged-out visitor can open a restricted URL and see an empty page shell. Every request is still checked by the API, so no data is exposed. There are no automated tests yet, notifications refresh by polling, and candidates can't yet see their scheduled interviews inside the app (they see the time in the notification and the email).

## Author

Anurag Joshi
