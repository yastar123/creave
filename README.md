# CREVORA

CREVORA is a React website served by Express, with PostgreSQL for contact enquiries. TanStack Router handles the existing page routes, and Vite builds the frontend and server-rendered pages.

## Run on Replit

```sh
npm install
npm run dev
```

The development server runs on port 5000. It expects the Replit PostgreSQL database to be available through `DATABASE_URL`.

## Build and run for production

```sh
npm run build
npm run start
```

The contact form saves an enquiry only after the visitor agrees to the privacy notice. The database schema is documented in `server/schema.sql`.
