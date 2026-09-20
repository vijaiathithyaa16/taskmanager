# Task Bud — Task Management App

Full-stack task manager with user authentication.

- **Frontend:** plain HTML / CSS / JavaScript (`/frontend`)
- **Backend:** Node.js + Express + JWT auth (`/backend`)
- **Database:** PostgreSQL (users, tasks)
- **Deploy:** frontend → Vercel, backend + DB → Railway

## Project structure

```
taskmanager/
  frontend/
    index.html
    css/style.css
    js/config.js      <- API_BASE_URL lives here
    js/auth.js         <- login/register/session handling
    js/main.js          <- task CRUD + progress tracker
    vercel.json
  backend/
    server.js
    db.js
    schema.sql
    migrate.js
    middleware/auth.js  <- JWT verification
    routes/
      auth.js            <- register / login / me
      tasks.js            <- CRUD, scoped to the logged-in user
    .env.example
```

## 1. Run locally

### Database
Create a PostgreSQL database (locally, or use a Railway instance for local dev too).

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL` → your connection string
- `JWT_SECRET` → a long random string (generate one: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)

### Backend

```bash
cd backend
npm install
npm run migrate   # creates the users and tasks tables
npm run dev        # starts the API on http://localhost:5000
```

Check it's alive: `http://localhost:5000/api/health`.

### Frontend

`frontend/js/config.js` points at `http://localhost:5000/api` by default. Serve it locally:

```bash
cd frontend
npx serve .
```

Open the URL it gives you, sign up for an account, and start adding tasks.

## 2. Deploy the database + backend on Railway

1. New Project → **Provision PostgreSQL**.
2. Copy the Postgres service's connection string (Connect tab) — use the **public** one only for local `.env`; the backend service itself should reference the private URL.
3. New service → deploy from this repo, with **Root Directory** set to `backend`.
4. Set environment variables on the backend service:
   - `DATABASE_URL` → reference the Postgres service's private URL
   - `JWT_SECRET` → a long random string (different from any example)
   - `CORS_ORIGIN` → your Vercel frontend URL (no trailing slash)
5. Once deployed, go to Settings → Networking → **Generate Domain** to get a public URL.
6. Run the migration once against production:
   ```bash
   cd backend
   # .env pointed at the public DATABASE_URL for this one-off run
   npm run migrate
   ```

## 3. Deploy the frontend on Vercel

1. Set `API_BASE_URL` in `frontend/js/config.js` to your Railway backend URL + `/api`.
2. Push to GitHub, import the repo in Vercel with **Root Directory** set to `frontend`.
3. Deploy, then go back to Railway and set `CORS_ORIGIN` to the resulting Vercel URL (exact match, no trailing slash), and redeploy the backend.

## API reference

| Method | Route              | Auth required | Description                          |
|--------|--------------------|----------------|----------------------------------------|
| GET    | `/api/health`        | No             | Health check                          |
| POST   | `/api/auth/register`  | No             | Create an account, returns a JWT       |
| POST   | `/api/auth/login`     | No             | Log in, returns a JWT                  |
| GET    | `/api/auth/me`         | Yes            | Get the current user                   |
| GET    | `/api/tasks`            | Yes            | List the current user's tasks          |
| POST   | `/api/tasks`             | Yes            | Create a task                          |
| PUT    | `/api/tasks/:id`          | Yes            | Update a task (text/priority/category/completed) |
| DELETE | `/api/tasks/:id`           | Yes            | Delete a task                          |
| DELETE | `/api/tasks`                 | Yes            | Delete all of the current user's tasks |

Authenticated requests need `Authorization: Bearer <token>`.

## Notes

- Tasks are scoped per user — every task query filters by `user_id`, so users only ever see their own tasks.
- Passwords are hashed with bcrypt before storage; never stored in plain text.
- Real-time updates (WebSockets) were intentionally left out of this version to keep scope simple — can be added later with `ws` or Socket.IO if needed.
