# Frontend

The CRM interface: React, TypeScript, Twenty UI, Linaria and Jotai.

**[Project overview](../README.md) · [Backend](../backend/README.md) · [Shared packages](../packages/README.md)**

| Location | Purpose |
| --- | --- |
| [src/pages/](src/pages/) | Full screens, including the home dashboard |
| [src/modules/object-record/record-index/components/](src/modules/object-record/record-index/components/) | Module layouts and company relationships |
| [src/modules/object-record/record-form/](src/modules/object-record/record-form/) | Record creation forms |
| [src/modules/navigation/](src/modules/navigation/) | App navigation |
| [src/atlas-theme.css](src/atlas-theme.css) | Atlas palette |
| [src/index.tsx](src/index.tsx) | App entry point |
| [public/](public/) | Static assets |

Run `yarn dev:frontend` from the repository root after following the [setup instructions](../README.md#run-locally). The app opens on port 3001 and connects to the API on port 3000 by default.

Copy `.env.example` to `.env` if the setup script has not created it. `REACT_APP_SERVER_BASE_URL` controls the API URL. Keep local environment values out of Git.

Imports starting with `@/` resolve to `src/modules/`; `~/` resolves to `src/`. Feature tests live alongside the code in `__tests__/` folders. Shared controls are in [twenty-ui](../packages/twenty-ui/).
