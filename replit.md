# Running CREVORA on Replit

- `bun run dev` starts the Express server on port 5000, with Vite serving the React app and hot reload.
- `bun run build` builds the React frontend into `dist/client` and the server-rendered routes into `dist/server`.
- `bun run start` serves the production build through Express. Run the build first.
- `GET /api/health` checks the PostgreSQL connection.
- `POST /api/contact` validates and stores contact enquiries in `public.contact_inquiries`. The form requires the visitor's explicit consent before saving.
- `server/schema.sql` is the database schema reference. The development database has this table already. Do not add startup-time schema changes; Replit applies managed database changes during Publish.
