# ProjectCC_PPKD2026
Project Content Creater PPKD Web Programming B4-2026

# Creator Content & Pipeline Tracker

A web app that helps content creators (or their production teams) manage ideas, the production workflow (script, recording, editing, approval), publishing, and performance metrics across platforms such as YouTube, TikTok, Instagram, and LinkedIn.

The app follows **Option 3** of the technical specification: a decoupled REST API plus a single-page app.

## Features

- **Authentication:** register and log in with JWT sessions and bcrypt-hashed passwords.
- **Channels:** register the social accounts you manage (YouTube, TikTok, Instagram, LinkedIn).
- **Pipeline board:** six stages (Idea backlog, Scripting, Recording, Editing & review, Ready, Published) with filters for status, channel, platform, format, and title search.
- **Content management:** create, edit, move between stages, and delete content with title, concept, script draft, format, priority, and scheduled date.
- **Production checklist:** add, tick, and delete checklist items per content, with progress shown on the board card.
- **Publishing rule:** a content item can only become `published` with a valid post URL that matches its channel's platform.
- **Performance metrics:** log views, likes, comments, and shares over time for published content.
- **Link previews:** embedded YouTube, TikTok, and Instagram players in the detail panel, plus thumbnails on board cards (see [Link previews](#link-previews)).
- **Dark mode:** follows the system setting and can be toggled manually.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js 20.19+, Express 4, **Prisma ORM 7** with `@prisma/adapter-mariadb`, MySQL 8, zod, JWT, bcryptjs, tsx |
| Frontend | React 18, Vite 5, Bootstrap 5 (layout), shadcn/ui + Tailwind CSS 3 (components), lucide-react (icons), Sonner (toasts) |

## Prerequisites

- Node.js **20.19 or newer** (required by Prisma 7)
- MySQL **8.0.16 or newer** (CHECK constraints are used)
- npm

## Getting started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then fill in DATABASE_URL and JWT_SECRET
npm run migrate           # creates the database, tables, CHECK constraints, then generates Prisma Client
npm run seed              # demo account, 2 channels, 3 sample contents
npm run dev               # http://localhost:4000
```

Check that it runs: `curl http://localhost:4000/api/health` should return `{"status":"ok"}`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

Demo login: `demo@kreator.id` / `demo1234`

### Environment variables

**`backend/.env`**

| Variable | Description |
|---|---|
| `PORT` | API port (default `4000`) |
| `CORS_ORIGIN` | Allowed browser origins, comma separated, no trailing slash. Example: `http://localhost:5173,https://my-app-5173.app.github.dev` |
| `DATABASE_URL` | `mysql://USER:PASSWORD@HOST:PORT/DATABASE`. URL-encode special characters in the password (`@` becomes `%40`) |
| `JWT_SECRET` | Long random string used to sign tokens. **Required**; the server refuses to start without it |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |

**`frontend/.env`** (optional)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Leave **empty** in development so requests go through the Vite proxy (`/api` is forwarded to `http://localhost:4000`). Only set it if the API lives on another domain, and then make sure `CORS_ORIGIN` on the backend allows your frontend origin |

Never commit `.env` files. They are listed in `.gitignore`.

## Scripts

**Backend (`backend/`)**

| Command | What it does |
|---|---|
| `npm run dev` | Start the API with auto-restart (`tsx watch`) |
| `npm start` | Start the API once |
| `npm run migrate` | `prisma migrate dev` + generate Prisma Client (local development) |
| `npm run migrate:deploy` | `prisma migrate deploy` + generate (production) |
| `npm run migrate:fresh` | Drop everything and re-apply all migrations (run `npm run seed` afterwards) |
| `npm run seed` | Load demo data (safe to run again, it replaces the demo user) |
| `npm run generate` | Regenerate Prisma Client |
| `npm run studio` | Open Prisma Studio to browse the database |

**Frontend (`frontend/`)**

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |

### Prisma 7 notes

- The generated client lives in `backend/generated/prisma` and is **not committed**. Run `npm run generate` after cloning, after `npm install` on a new machine, and after editing `schema.prisma`. Prisma 7 no longer generates or seeds automatically.
- The database URL and seed command are configured in `prisma.config.ts`, not in `schema.prisma`. `.env` is not loaded automatically, so `dotenv` is imported explicitly.
- MySQL requires a driver adapter (`@prisma/adapter-mariadb`, see `src/prisma.js`).
- The generated client is TypeScript, so the server runs through `tsx`. Application code stays plain JavaScript.
- CHECK constraints cannot be expressed in `schema.prisma`, so they live in their own migration (`prisma/migrations/*_add_check_constraints`).

## Project structure

```
backend/
  prisma/
    schema.prisma                 models, relations, cascades, indexes
    migrations/                   tables + CHECK constraints
    seed.js                       demo data
  prisma.config.ts                Prisma 7 config (datasource, seed command)
  src/
    server.js, app.js             startup, CORS, JSON serialization, central error handler
    prisma.js                     Prisma Client with MySQL adapter
    schemas.js                    validation rules (zod)
    urls.js                       post URL validation per platform
    middleware/auth.js            JWT verification
    routes/                       auth, channels, contents (+ checklists, metrics), previews

frontend/
  src/
    pages/                        AuthPage, PipelinePage, ChannelsPage
    components/                   ContentDrawer, NewContentModal, LinkPreview, VideoThumb,
                                  Field, Toast, ThemeToggle
    components/ui/                shadcn/ui components (button, input, select, sheet, dialog, ...)
    lib/                          utils.js, media.js (URL parsing), previews.js (preview hook)
    api.js, constants.js, index.css
```

## Data model

| Table | Purpose | Relations |
|---|---|---|
| `users` | Accounts (role: creator, editor, admin) | has many channels and contents |
| `channels` | A social account (platform + handle) | belongs to user; has many contents |
| `contents` | A content item and its pipeline status | belongs to user and channel; has many checklists and metrics |
| `content_checklists` | Production sub-tasks | belongs to content (`ON DELETE CASCADE`) |
| `content_metrics` | Performance snapshots over time | belongs to content (`ON DELETE CASCADE`) |

Table names are plural snake_case, foreign keys follow `<singular_table>_id`, and field names stay snake_case so the JSON API matches the specification without conversion.

## API

All endpoints except `/auth/*` require `Authorization: Bearer <token>`. Records that belong to another user are returned as `404`.

| Method | Endpoint | Description | Status |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user | 201 |
| POST | `/api/v1/auth/login` | Log in and receive a token | 200 |
| GET / POST | `/api/v1/channels` | List or add channels | 200 / 201 |
| GET | `/api/v1/contents?status=&channel_id=&format_type=&platform=&q=` | List contents with filters | 200 |
| POST | `/api/v1/contents` | Create an idea | 201 |
| GET | `/api/v1/contents/:id` | Detail with checklists and metrics | 200 |
| PUT / PATCH | `/api/v1/contents/:id` | Update data or change status | 200 |
| DELETE | `/api/v1/contents/:id` | Delete content and its children | 204 |
| POST | `/api/v1/contents/:id/checklists` | Add a checklist item | 201 |
| PATCH | `/api/v1/checklists/:id/toggle` | Toggle `is_completed` | 200 |
| DELETE | `/api/v1/checklists/:id` | Delete a checklist item | 204 |
| POST | `/api/v1/contents/:id/metrics` | Log a metrics snapshot (`409` if not published) | 201 |
| GET | `/api/v1/previews?url=` | Preview data for a TikTok or Instagram link | 200 |

Validation errors return `422` with `{ "message": "...", "errors": { "field": "..." } }`.

## Business rules

All rules are enforced on the server (and the key ones again by database constraints).

- A content item starts as `idea` and moves through `idea, scripting, recording, editing, ready, published`. Moving backwards is allowed.
- `published` requires a valid `published_url`. `published_date` is filled in automatically.
- The post URL must match the channel's platform:
  - **YouTube:** a video link (`youtube.com/watch?v=ID`, `youtu.be/ID`, `/shorts/ID`, `/embed/ID`, `/live/ID`) with an 11-character ID
  - **Instagram:** a post or reel (`instagram.com/p/CODE/`, `/reel/CODE/`, `/tv/CODE/`)
  - **TikTok:** a `tiktok.com` link
  - **LinkedIn:** a `linkedin.com` link
- Metrics can only be logged for `published` content.
- Deleting a content item removes its checklist items and metrics through `ON DELETE CASCADE`.
- Passwords are stored as bcrypt hashes. Emails are unique (`Email already taken`).

## Link previews

| Platform | Detail panel | Board card thumbnail |
|---|---|---|
| YouTube | Embedded player | Video thumbnail (reliable) |
| TikTok | Official embed player (`tiktok.com/player/v1/<id>`) | Best effort |
| Instagram | Official embed (`/embed`) | Best effort |
| LinkedIn | "Open link" button | None |

TikTok and Instagram no longer return thumbnails, titles, or author names through their oEmbed endpoints. For card thumbnails the backend therefore tries to read the `og:image` tag from the post page. This can fail because the platform may refuse server requests, in which case the card simply shows no image while the embedded player in the detail panel still works. Results are cached in memory for 30 minutes.

## Remote development (GitHub Codespaces)

Use the Vite proxy instead of calling the backend port directly:

1. Leave `VITE_API_URL` empty in `frontend/.env`.
2. Make sure `vite.config.js` has `server.proxy = { '/api': 'http://localhost:4000' }`.
3. Restart `npm run dev` in the frontend after changing `.env` files.

The browser then talks only to the frontend port, so CORS and port visibility do not matter. If you do call port 4000 directly, set that port to **Public**, and put the frontend's exact origin in `CORS_ORIGIN`.

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| "Tidak bisa terhubung ke server" on login | Backend is not running, or the proxy points to a different port than the one printed by the backend. Check `curl http://localhost:4000/api/health` |
| CORS error with a `...-4000.app.github.dev` URL | `VITE_API_URL` is set. Clear it and use the proxy (see above) |
| `Cannot find module '../generated/prisma/client'` | Prisma Client not generated. Run `npm run generate` |
| `Environment variable not found: DATABASE_URL` | `backend/.env` is missing or is not in the folder where you run the command |
| `migrate` asks for a migration name or reports drift | A hand-written migration differs slightly from what Prisma expects. Run `npx prisma migrate dev --create-only` and review the diff |
| Login fails with "Email atau kata sandi salah." | The database is not seeded. Run `npm run seed` |
| No thumbnail on a TikTok or Instagram card | Expected in many cases, see [Link previews](#link-previews). Open the card to use the embedded player |

## Manual QA test cases

Replace `$TOKEN` with the token returned by login.

```bash
# TC-01 duplicate email -> 422 "Email already taken"
curl -s -X POST localhost:4000/api/v1/auth/register -H 'Content-Type: application/json' \
  -d '{"name":"X","email":"demo@kreator.id","password":"password123"}'

# TC-02 content without title -> 422
curl -s -X POST localhost:4000/api/v1/contents -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"channel_id":1,"format_type":"short_video"}'

# TC-03 publish without URL -> 422
curl -s -X PATCH localhost:4000/api/v1/contents/2 -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"status":"published"}'

# TC-04 delete a content that has checklist items and metrics -> 204, children are gone
curl -s -X DELETE localhost:4000/api/v1/contents/3 -H "Authorization: Bearer $TOKEN" -i
mysql -e "SELECT COUNT(*) FROM creator_pipeline.content_metrics WHERE content_id=3"   # 0
```

## Git workflow

- `main`: stable branch, merge only validated features.
- Feature branches: `feature/CCP-0X-feature-name` (for example `feature/CCP-02-auth-channel`).
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `db:`, `docs:`.

## Known limitations

- Pages switch through React state, not URLs, so refreshing always returns to the Pipeline view and pages cannot be bookmarked.
- The preview cache is in memory and resets when the backend restarts.
- Preview thumbnails for TikTok and Instagram depend on what those platforms allow and may be unavailable.
- Authentication stores the token in `localStorage`. For a production deployment consider httpOnly cookies.

