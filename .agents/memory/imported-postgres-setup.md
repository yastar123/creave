---
name: Imported PostgreSQL setup
description: Distinguish database reachability from application schema readiness in imported projects.
---

A PostgreSQL connection can pass a basic health query while required application tables are still missing; the app may then fail before its web server starts.

**Why:** An imported CREVORA database accepted connections but lacked a CMS table required during startup.

**How to apply:** When startup reports a missing relation after the database connects, check whether the development schema bootstrap has run. Keep development schema changes separate from production, and do not treat a successful connection check as proof the app is ready.
