# Supplied backend provenance

- Repository: https://github.com/SWDevPrac2-69-1/PJ03-WorkshopRegist
- Pinned commit: `f894da48745a89ab1d2db0861b0a337f5d02bf64`
- Retrieved: 20 October 2026
- Course assignment: Project 3, Workshop Registration System

The controllers, models, routes, authentication middleware, mutation serializer, and database connection helper were copied from this revision without behavior changes. The original repository README is retained as `UPSTREAM-README.md`; its `2026-PJ03.md` API reference is also included.

Local setup adaptations:

1. Split `server.js` into importable `app.js` and an explicit `startServer()` lifecycle. Startup requires database and JWT configuration, awaits MongoDB and indexes, and exposes loopback by default. CLI startup supports `HOST` and graceful SIGINT/SIGTERM shutdown.
2. Resolve `config/config.env` relative to this package, allow `API_ENV_FILE`, and retain shell/CI variable precedence. The upstream environment file and its values were excluded; `config/config.env.example` contains local defaults and a JWT placeholder.
3. Resolve Swagger source paths relative to the package so documentation works when started from the monorepo root.
4. Allow an explicit development/test `RATE_LIMIT_MAX` override while retaining the original production limit.
5. Add isolated MongoDB HTTP integration tests and a non-destructive development seed. Declare their tools as development dependencies.
6. Use the workspace package name `@workshop/api`, keep the root workspace lockfile authoritative, and ignore local API configuration.

The upstream single-process mutation-serialization limitation, UTC date semantics, member/admin API contracts, role-selectable signup, and JWT logout behavior remain unchanged. These are documented explicitly for frontend implementation and deployment decisions.
