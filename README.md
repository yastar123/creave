# CREVORA

CREVORA is a React website served by Express, with PostgreSQL for contact enquiries. TanStack Router handles the existing page routes, and Vite builds the frontend and server-rendered pages.

## Run on Replit

For a fresh development database, set `DATABASE_URL`, `DB_PUSH_TARGET=development`, and the admin login settings (`CMS_ADMIN_EMAIL`, `CMS_ADMIN_PASSWORD`, and `SESSION_SECRET`) in the environment. Then initialize the schema once:

```sh
npm install
npm run db:push
npm run dev
```

The development server runs on port 5000. It expects PostgreSQL to be available through `DATABASE_URL`. The schema push is development-only and creates missing tables and columns.

## Build and run for production

```sh
npm run build
npm run start
```

Production admin login also requires `CMS_ADMIN_EMAIL`, `CMS_ADMIN_PASSWORD`, and `SESSION_SECRET`. Serve the app over HTTPS; production session cookies are marked secure. The `db:push` command is disabled in production, so prepare the production database schema through your approved migration process before starting the app.

The contact form saves an enquiry only after the visitor agrees to the privacy notice. The database schema is documented in `server/schema.sql`.
