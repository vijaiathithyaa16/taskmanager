# Task Bud — Task Management App

A full-stack task management web app with user authentication, built to
practice real API integration and dynamic data handling — not just a
localStorage demo, but a real backend with its own database.

**Live site:** [frontendtm-five.vercel.app](https://frontendtm-five.vercel.app)
<!-- TODO: confirm this is your final Vercel URL -->

---

## About

Task Bud lets you sign up, log in, and manage your own private task list —
add tasks with a priority and category, mark them complete, track your
progress with a live completion bar, and clear everything when you're done.
Every task is scoped to your account; no one else can see or touch it.

## Features

- **Authentication** — sign up / log in with a hashed password (bcrypt) and JWT-based sessions
- **Full task CRUD** — create, complete/undo, and delete tasks
- **Priority & category tagging** — High/Medium/Low priority, General/Work/Personal category
- **Live progress tracking** — completion count and a visual progress bar update instantly
- **Per-user data isolation** — every task is tied to the logged-in user's account
- **Responsive design** — works on desktop and mobile screen sizes

## Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | HTML, CSS, JavaScript (no framework) |
| Backend    | Node.js, Express, JWT auth           |
| Database   | PostgreSQL (Neon)                    |
| Hosting    | Vercel (frontend), Render (backend)  |

## How It Works

1. Register or log in — the backend hashes your password and returns a signed JWT
2. The frontend stores the JWT and sends it as a Bearer token on every request
3. The backend verifies the token and scopes every task query to your `user_id`
4. Tasks are stored in PostgreSQL, not the browser — they persist across devices and sessions

## Running Locally

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm run migrate
npm run dev

# Frontend (separate terminal)
cd frontend
npx serve .
```

Full setup and deployment notes are in [`SETUP.md`](./SETUP.md).
<!-- TODO: rename your current dev-setup README.md to SETUP.md so this one takes its place -->

## API Overview

| Method | Route              | Auth required |
|--------|--------------------|----------------|
| POST   | `/api/auth/register` | No            |
| POST   | `/api/auth/login`     | No            |
| GET    | `/api/tasks`             | Yes            |
| POST   | `/api/tasks`              | Yes            |
| PUT    | `/api/tasks/:id`            | Yes            |
| DELETE | `/api/tasks/:id`              | Yes            |

## Contact

<!-- TODO: add your real links -->
- GitHub: [vijaiathithyaa16](https://github.com/vijaiathithyaa16)
- LinkedIn: [Vijai Athithyaa S](https://www.linkedin.com/in/vijai-athithyaa-s-004482381/)
- Email: vijaiathithyaa1612@gmail.com
