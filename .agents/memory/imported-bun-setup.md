---
name: Imported Bun setup
description: Rehydrating dependencies and restarting workflows in imported Bun projects.
---

When an imported Bun project has dependencies declared but no `node_modules`, installing an already-declared package through Replit's package installer can restore the full dependency tree without changing the manifest. Do not assume the failed app workflow will restart automatically after the install; check its state and restart it once installation is complete.

**Why:** The app initially failed because its declared `tsx` executable was not installed. Replit's package installer restored dependencies, but the failed workflow still needed an explicit restart.

**How to apply:** Confirm the package is already declared, restore dependencies through the Replit package installer, then inspect the workflow logs and restart it once if it remains failed.
