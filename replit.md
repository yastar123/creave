# Running CREVORA on Replit

- `npm run dev` starts the Express server on port 5000, with Vite serving the React app and hot reload. The Replit workflow uses Node.js 22 and sets `NODE_ENV=development`. `dotenv` loads the project-root `.env` file for local development.
- `npm run build` builds the React frontend into `dist/client` and the server-rendered routes into `dist/server`.
- `npm run start` serves the production build through Express. Run the build first.
- `/login` provides the CREVORA admin login. `/admin` and all CMS management APIs require a valid, signed JWT session in an HTTP-only cookie.
- For development, `CMS_ADMIN_EMAIL` and `CMS_ADMIN_PASSWORD` can be set in `.env`. `ADMIN_EMAIL` and `ADMIN_PASSWORD` take priority if supplied by the Replit environment; keep `SESSION_SECRET` in Replit Secrets.
- `DATABASE_URL` is provided by the Replit PostgreSQL database. Do not replace it with a `localhost` URL in the Replit environment; localhost PostgreSQL is not running in this repl. Keep local database credentials out of source control.
- The CMS at `/admin` manages saved page sections plus shared navigation and footer fields. Changes are saved immediately. Saved CMS sections render on the matching public page.
- `GET /api/health` checks the PostgreSQL connection.
- `POST /api/contact` validates and stores contact enquiries in `public.contact_inquiries`. The form requires the visitor's explicit consent before saving.
- `server/schema.sql` is the database schema reference for contact enquiries and CMS data. For a fresh development database, run `npm run db:push` with `DB_PUSH_TARGET=development`; the script refuses production. Replit's workflow initializes the development schema before starting the server. Replit applies managed database changes to production during Publish. Do not add startup-time schema changes.
