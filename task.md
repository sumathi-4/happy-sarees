# Tasks - Modular Multi-App Reorganisation

- [x] Create Independent React Apps:
  - [x] Moved customer storefront codebase into `user/` subdirectory with its own `package.json`, `vite.config.js`, and build directories
  - [x] Audit `master_types` table columns in database
- [/] Remove `/api/admin/master` duplicate route mapping from backend `server.js`
- [x] Configure Routing:
  - [x] Restored `user/src/routes/AppRoutes.jsx` to its clean, customer-only routing configuration
  - [x] Setup `admin/src/App.jsx` with isolated root-level admin routing rules
- [x] Root Orchestration:
  - [x] Created root-level `package.json` with dev/build workspace scripts for `user/`, `admin/`, and `server/`
- [x] Verification:
  - [x] Storefront builds successfully in 1.05s with 0 errors
  - [x] Admin builds successfully in 465ms on port 5175 with 0 errors
