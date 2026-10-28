# CREVORA

CREVORA is a React website served by Express. PostgreSQL stores contact enquiries and CMS content. TanStack Router handles page routes, and Vite builds the client and server-rendered pages.

## Requirements

- Node.js 22.12 or newer
- PostgreSQL with a database and user that can create tables and indexes

## Run on a VPS

1. Copy `.env.example` to `.env` or set the same variables in your process manager. Configure `DATABASE_URL`, `CMS_ADMIN_EMAIL`, `CMS_ADMIN_PASSWORD`, and a long random `SESSION_SECRET`. Keep these values private.
2. Install dependencies and build the production app:

   ```sh
   npm ci
   npm run build
   ```

3. Apply the schema to the production database explicitly:

   ```sh
   NODE_ENV=production DB_PUSH_TARGET=production DB_PUSH_CONFIRM_PRODUCTION=YES npm run db:push
   ```

   This schema push creates missing CMS tables and adds missing columns. It does not drop tables or content. Back up the database before applying schema changes.

4. Start the app with the same environment and database:

   ```sh
   NODE_ENV=production PORT=5000 npm run start
   ```

   Put the app behind your HTTPS reverse proxy. The admin session cookie is secure in production and requires HTTPS in the browser. `/api/health` checks database connectivity.

`npm ci` uses the checked-in `package-lock.json`; do not delete `package.json` because it defines the app's dependencies and run scripts. The package is named `crevora`. Use Node.js 22.12 or newer on the VPS to match the app's toolchain and dependency requirements.

## Admin login

Use the email and password in `CMS_ADMIN_EMAIL` and `CMS_ADMIN_PASSWORD`. Older deployments may still use `ADMIN_EMAIL` and `ADMIN_PASSWORD`; the `CMS_ADMIN_*` settings take priority if both sets are present. Restart the app service after changing its environment.

- A “not configured” response means one or more admin settings or `SESSION_SECRET` are missing from the running service.
- An “incorrect” response means the submitted credentials do not match the effective settings. Check whether old `ADMIN_*` values are still set only if `CMS_ADMIN_*` is absent; verify the process manager's environment, not just the shell's `.env`.
- If the `SESSION_SECRET` changes, sign in again so the browser receives a new session.

## Development on Replit or locally

Install dependencies with `npm ci`, provide `DATABASE_URL`, `CMS_ADMIN_EMAIL`, `CMS_ADMIN_PASSWORD`, and `SESSION_SECRET`, then initialize a development database and start the app:

```sh
DB_PUSH_TARGET=development npm run db:push
npm run dev
```

The development server listens on port 5000. The Replit workflow uses its managed development database and applies only the development schema.

## Build and validation

```sh
npm run build
npm test
npm run lint
```

The CMS at `/admin` manages page sections, custom pages, shared navigation and footer content, and public-site collections. Contact enquiries submitted through the website appear in the admin inbox. The contact form saves an enquiry only after the visitor agrees to the privacy notice. The database schema is documented in `server/schema.sql`.
