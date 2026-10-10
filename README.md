# MediBot Dashboard (React + Vite + Tailwind)

The admin dashboard for the AI voice appointment bot: live stats, search,
status filters, a dark mode and a patient detail modal.

## Run it

```bash
npm install
cp .env.example .env      # optional - only needed for a non-local API
npm run dev               # http://localhost:5173
```

The backend must be running on `http://localhost:5000` (see `doctor-bot-backend`).

## Configure the API URL

`src/App.jsx` reads the API base from `VITE_API_URL` and falls back to
`http://localhost:5000`:

```
# .env
VITE_API_URL=https://your-backend.onrender.com
```

Restart `npm run dev` after changing it (Vite reads `.env` at startup).

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
