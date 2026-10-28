# Running CREVORA on Replit

- `npm run dev` starts the Express server on port 5000 with Vite hot reload. The configured Replit workflow uses Node.js 22 and pushes the development schema before starting.
- The project requires `DATABASE_URL`. Replit provides its managed PostgreSQL URL; do not replace it with a localhost URL here.
- Set `CMS_ADMIN_EMAIL`, `CMS_ADMIN_PASSWORD`, and `SESSION_SECRET` as environment secrets for the admin login. Legacy `ADMIN_EMAIL` and `ADMIN_PASSWORD` remain supported only when their matching `CMS_ADMIN_*` value is unset.
- `npm run db:push` requires an explicit target. The Replit workflow sets `DB_PUSH_TARGET=development`. Production pushes require `NODE_ENV=production`, `DB_PUSH_TARGET=production`, and `DB_PUSH_CONFIRM_PRODUCTION=YES`.
- `npm run build` creates the production client and server bundles. `NODE_ENV=production npm run start` serves that build; run the build first.
- `/login` provides admin access. `/admin` and CMS management APIs require a valid, signed HTTP-only session cookie.
- `/api/health` checks the PostgreSQL connection. The contact form writes to `public.contact_inquiries` only after explicit privacy consent.
- The CMS manages saved page sections, custom pages, shared navigation and footer fields, and public-site content collections. Saved sections render on the matching public route.
