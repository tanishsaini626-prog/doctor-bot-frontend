# MediBot Dashboard (React + Vite + Tailwind)

The clinic dashboard for the AI voice appointment bot.

## Pages

| Route | Access | What it shows |
|---|---|---|
| `/login` | public | email + password sign-in |
| `/` | 🔒 login required | stats cards, search, status filters, appointments table, patient modal with Done/Cancel |
| `/calls` | 🔒 login required | call log: every phone call with its transcript and what the bot did |

Everything except `/login` is wrapped in `RequireAuth`, so visiting a protected
URL while logged out bounces you to the login page (and back after signing in).
An expired or invalid token triggers the same redirect automatically (axios 401
interceptor in `src/api.js`).

## Run it

```bash
npm install
cp .env.example .env      # optional - only needed for a non-local API
npm run dev               # http://localhost:5173
```

The backend must be running on `http://localhost:5000` (see `doctor-bot-backend`).

**First login:** the backend creates an admin account on its first boot —
`admin@medibot.local` / `medibot-admin` (change it with `ADMIN_EMAIL` /
`ADMIN_PASSWORD` in the backend `.env`).

## Configure the API URL

`src/api.js` reads the API base from `VITE_API_URL` and falls back to
`http://localhost:5000`:

```
# .env
VITE_API_URL=https://your-backend.onrender.com
```

Restart `npm run dev` after changing it (Vite reads `.env` at startup).

## File map

```
src/
├── api.js              axios instance: base URL, Bearer token, 401 -> /login
├── AuthContext.jsx     token + user state, login(), logout(), /api/me check
├── App.jsx             router: /login, / (Dashboard), /calls (CallLog)
└── pages/
    ├── Login.jsx       sign-in form
    ├── Dashboard.jsx   stats, filters, table, patient modal
    └── CallLog.jsx     call transcripts + bot actions
```

## The Tailwind bug that was here (fixed)

`tailwind.config.js` had `content: []`. An empty `content` array makes Tailwind
scan **no files**, so it generated **zero** utility classes and the page rendered
as plain unstyled HTML. It now points at the real files:

```js
content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
darkMode: 'class',
```

Two notes for later:

- Dark mode uses the `class` strategy, so `src/App.jsx` adds/removes the `dark`
  class on `<html>` (not on a random `<div>`). Without that class the `dark:`
  styles never activate.
- After editing `tailwind.config.js`, restart the dev server and hard-refresh
  the browser.

## Verify the styles are really being generated

```bash
npm run build
npm run verify:css
```

`verify:css` inspects the built CSS bundle and prints how many `dark:`, `hover:`
and responsive (`md:`, `xl:`) rules it contains. If those numbers are 0, Tailwind
is not scanning your files.

## API endpoints used

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/appointments` | table + cards (`?status=&q=&date=&limit=`) |
| PATCH | `/api/appointments/:id` | mark an appointment `Completed` / `Cancelled` |

The page still works with the older backend that returns only
`{ name, date, reason, time_slot }` - status is then derived from the date.
