# Running CREVORA on Replit

- `npm run dev` starts the Express server on port 5000, with Vite serving the React app and hot reload.
- `npm run build` builds the React frontend into `dist/client` and the server-rendered routes into `dist/server`.
- `npm run start` serves the production build through Express. Run the build first.
- `/sign-in` provides the CREVORA admin login. `/admin` and all CMS management APIs require a valid, signed JWT session in an HTTP-only cookie.
- Store `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `SESSION_SECRET` as Replit Secrets. Use a unique admin password and a random session secret. The legacy `CMS_ADMIN_EMAIL` and `CMS_ADMIN_PASSWORD` names remain supported, but `ADMIN_*` values take priority.
- `DATABASE_URL` is provided by the Replit PostgreSQL database. Do not replace it with a `localhost` URL in the Replit environment; localhost PostgreSQL is not running in this repl. Keep local database credentials out of source control.
- The CMS at `/admin` manages saved page sections plus shared navigation and footer fields. Changes are saved immediately. Saved CMS sections render on the matching public page.
- `GET /api/health` checks the PostgreSQL connection.
- `POST /api/contact` validates and stores contact enquiries in `public.contact_inquiries`. The form requires the visitor's explicit consent before saving.
- `server/schema.sql` is the database schema reference for contact enquiries and CMS data. Do not add startup-time schema changes; Replit applies managed database changes during Publish.
