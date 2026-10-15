# Backend

The CRM API and workers: NestJS, TypeScript, PostgreSQL, TypeORM, Redis and BullMQ.

**[Project overview](../README.md) · [Frontend](../frontend/README.md) · [Shared packages](../packages/README.md)**

| Location | Purpose |
| --- | --- |
| [src/main.ts](src/main.ts) | API entry point |
| [src/app.module.ts](src/app.module.ts) | Main application module |
| [src/engine/](src/engine/) | Authentication, metadata, permissions and infrastructure |
| [src/modules/](src/modules/) | Business modules, including workflows |
| [src/database/](src/database/) | Database configuration, migrations and setup |
| [src/queue-worker/](src/queue-worker/) | Background worker |
| [test/](test/) | Integration tests and fixtures |

Follow the [root setup instructions](../README.md#run-locally), then run `yarn dev:backend` and `yarn dev:worker` in separate terminals from the repository root.

Local settings belong in `.env`; use `.env.example` as the template. Database/Redis connections, server URL and application secrets are configured there. Real credentials and database records are not part of the repository.

Imports starting with `src/` resolve to this folder's source. Shared contracts and utilities are in [twenty-shared](../packages/twenty-shared/).
