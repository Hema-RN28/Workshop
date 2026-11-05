# EventPulse frontend

React + Vite frontend for the EventPulse Flask API.

## Run locally

1. Start the Flask API from `backend` (its default address is `http://127.0.0.1:5000`).
2. From this folder, run `npm install` and `npm run dev`.
3. Open the local URL printed by Vite.

The Vite development server proxies `/api` requests to the Flask API. For a deployed frontend, set `VITE_API_URL` to the Flask API origin before building (see `.env.example`).

The organizer and attendee-only endpoints require a Supabase access token. Use the lock icon in the header to add or remove a token; it is stored in this browser's local storage.
