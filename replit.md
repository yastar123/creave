# Running CREVORA on Replit

- `bun run dev` starts the Express server on port 5000, with Vite serving the React app and hot reload.
- `bun run build` builds the React frontend into `dist/client` and the server-rendered routes into `dist/server`.
- `bun run start` serves the production build through Express. Run the build first.
- `/sign-in` and `/sign-up` provide the CREVORA-branded Clerk login screens. `/admin` requires a signed-in account whose verified email is authorized for the CMS.
- Set `CMS_ADMIN_EMAIL` in the shared Replit environment to the authorized admin email. CMS API authorization is checked on the server.
- The CMS at `/admin` manages saved page sections plus shared navigation and footer fields. Changes are saved immediately. Saved CMS sections render on the matching public page.
- `GET /api/health` checks the PostgreSQL connection.
- `POST /api/contact` validates and stores contact enquiries in `public.contact_inquiries`. The form requires the visitor's explicit consent before saving.
- `server/schema.sql` is the database schema reference for contact enquiries and CMS data. Do not add startup-time schema changes; Replit applies managed database changes during Publish.
