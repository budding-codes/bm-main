# BM Promo API

Express API for the Budding Mariners site: lead capture, admin authentication, the
blog CMS and the Cloudinary-backed media library.

## Deployment shape

The frontend and the API are two separate deployments:

| | Host | Serves |
|---|---|---|
| Frontend | `www.buddingmariners.com` | The built Vite SPA |
| API | `bm-promo.vercel.app` | This Express app, as a single serverless function |

The SPA calls the API cross-origin, so every browser request is subject to CORS.
The API's origin whitelist is what makes that work, and it is driven entirely by
environment variables — see [CORS](#cors) below.

In development there is no cross-origin call at all: `VITE_API_BASE_URL` is left
empty, requests stay relative, and Vite's dev server proxies `/api` to
`http://localhost:5000` (`client/vite.config.ts`).

## Entrypoints

| File | Used by | Behaviour |
|---|---|---|
| `api/index.js` | Vercel | Exports the app. Never listens, never exits. |
| `server.js` | `npm run dev` / `npm start`, any container or VM | Listens on `PORT`, shuts down on `SIGTERM`. |

Both build the app through the same `createApp()` factory in `src/app.js`, so the
two environments cannot drift apart.

`vercel.json` pins the deployment shape in the repository rather than relying on
dashboard auto-detection: `framework: null`, one function at `api/index.js`, and a
rewrite sending every path to it.

## Middleware order

Defined in `src/app.js`. The order is deliberate:

```
request id → request logging → helmet → CORS → JSON body parser → routes → 404 → error handler
```

CORS runs **before** the body parser. If it ran after, a malformed or oversized
payload would be rejected before any CORS header was set, and the browser would
report a body-parser failure as a CORS error.

The `cors` package answers preflights itself and ends the response, so an `OPTIONS`
request never reaches a route or the authentication middleware.

## CORS

`src/config/cors.js`. An origin is allowed when it appears in `ALLOWED_ORIGINS` or
matches a wildcard in `ALLOWED_ORIGIN_PATTERNS`:

```
ALLOWED_ORIGINS=https://www.buddingmariners.com,https://buddingmariners.com,http://localhost:5173
ALLOWED_ORIGIN_PATTERNS=https://*.vercel.app
```

Comma, whitespace or newline separated; trailing slashes are ignored. Patterns are
anchored and `*` matches a single hostname label, so `https://*.vercel.app` accepts
`https://bm-promo-git-x.vercel.app` but rejects `https://evil.vercel.app.attacker.io`.

A rejected origin is answered **without** CORS headers rather than with an error.
Raising an error would hand the preflight to the error middleware, which returns a
500 with no CORS headers — the browser then reports the misleading "No
'Access-Control-Allow-Origin' header is present" and hides the real fault.

Authentication uses a bearer token in the `Authorization` header, not cookies, so
`credentials` is off and no cookie or session configuration is involved.

## The CommonJS constraint

**Serverless runtimes start Node with `--no-experimental-require-module`.** In that
mode `require()` of an ES module throws `ERR_REQUIRE_ESM` at import time. Locally
the flag is off, so an ESM-only dependency installs, passes every test, and fails
only once deployed — where it aborts module loading before any application code
runs and every request, including CORS preflights, dies with an opaque platform
error.

This took the production API down completely: `@tiptap/html` requires `happy-dom`,
and `sanitize-html@2.17.6` requires `htmlparser2@12`; both are ESM-only.

Two rules follow:

1. Server-side HTML is rendered with `@tiptap/static-renderer`, which has a
   CommonJS build and needs no DOM. Do not reintroduce `@tiptap/html`.
2. `sanitize-html` is pinned to `2.17.0`, the last release that depends on a
   CommonJS-compatible `htmlparser2`. Do not bump it without running the checks
   below.

```bash
npm run check:serverless   # loads the whole app under the deployed runtime's flags
npm run check:content      # asserts the published HTML is byte-for-byte unchanged
npm run check:all          # both
```

Run `npm run check:all` after any dependency change. It catches this class of
failure locally, in seconds, instead of in production.

## Resilience

- The database connects lazily and is cached across invocations. It is never
  connected at boot and never exits the process on failure.
- Only data-backed routes sit behind the database gate (`src/routes/index.js`).
  Admin login and session checks keep working during a database outage; data routes
  return a clean `503`.
- If the app cannot be constructed at all, `api/index.js` falls back to a
  dependency-free handler that still answers preflights correctly and returns a
  `503` JSON body, so a boot failure can never masquerade as a CORS problem again.

## Logging

One JSON object per line, ready for any log drain. Field names matching
`password`, `token`, `authorization`, `cookie`, `secret`, `apikey` or the Mongo URI
are redacted automatically (`src/utils/logger.js`).

Every response carries an `X-Request-Id` header, echoed in the matching log line,
so a report from a browser can be traced to a single request. Cross-origin log
lines include `origin` and `corsAllowed`, and a rejected origin is logged as
`cors.origin_rejected`.

```bash
vercel logs <deployment-url>
```

## Health

```bash
curl https://bm-promo.vercel.app/api/health          # liveness, no database call
curl "https://bm-promo.vercel.app/api/health?deep=1" # also verifies the database
```

Reports the environment, commit, database state, whether Cloudinary is configured,
and how many origins are allowed. `deep=1` returns `503` when the database is
unreachable.

## Environment variables

`.env.example` documents every variable. Required in production:

| Variable | Purpose |
|---|---|
| `MONGO_URI` | Connection string. Include the database name, or the driver falls back to `test`. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin credentials (`ADMIN_ID` / `ADMIN_PASS` are the legacy names). |
| `ADMIN_TOKEN_SECRET` | Signs session tokens. If unset, a random secret is generated per process and every session ends on restart. |
| `ALLOWED_ORIGINS` | Browser origins allowed to call the API. |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Media library. All three are required; uploads return `503` otherwise. |

Missing or risky configuration is logged as `config.issue` at boot instead of
throwing, so a misconfigured variable degrades one feature rather than taking down
the whole API.

On the frontend, `VITE_API_BASE_URL` is inlined at **build** time. Changing it
requires a rebuild of the SPA, not just a restart.

## Deploying

The project is connected to GitHub and builds on push to `main`. To deploy from a
workstation, run from the **repository root** (the project's root directory is
`server`):

```bash
npm run check:all --prefix server
vercel deploy --prod
```

Then verify:

```bash
curl "https://bm-promo.vercel.app/api/health?deep=1"

curl -i -X OPTIONS https://bm-promo.vercel.app/api/admin/login \
  -H "Origin: https://www.buddingmariners.com" \
  -H "Access-Control-Request-Method: POST"        # expect 204 + Access-Control-Allow-Origin

curl -i -X POST https://bm-promo.vercel.app/api/admin/login \
  -H "Origin: https://www.buddingmariners.com" \
  -H "Content-Type: application/json" \
  -d '{"email":"...","password":"..."}'           # expect 200 + a token
```

## Troubleshooting

| Symptom | Where to look |
|---|---|
| Browser reports a CORS error | Check the status code first. A 500 with no CORS headers is a server fault, not a CORS misconfiguration. Compare the page's origin against `ALLOWED_ORIGINS`. |
| `FUNCTION_INVOCATION_FAILED` on every route, no logs | The app failed to load. Run `npm run check:serverless`. |
| Data routes return 503, login works | The database is unreachable. Check `/api/health?deep=1` and the Atlas network access list. |
| Uploads return 503 | A `CLOUDINARY_*` variable is missing. `/api/health` reports `cloudinary.configured`. |
| Admin sessions drop after a deploy | `ADMIN_TOKEN_SECRET` is unset, so each process generates its own. |
