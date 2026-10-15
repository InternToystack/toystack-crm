# ToyStack CRM

A customised [Twenty](https://github.com/twentyhq/twenty) CRM with an Atlas-inspired interface.

**[Frontend](frontend/README.md) · [Backend](backend/README.md) · [Shared packages](packages/README.md)**

## Where to start

| Folder | What you will find |
| --- | --- |
| [frontend/](frontend/) | React app, screens, styling and UI customisations |
| [backend/](backend/) | NestJS API, database access, authentication and workers |
| [packages/](packages/README.md) | Shared UI, types, SDKs and supporting upstream tools |

The frontend and backend live together because they use the same shared packages. Install dependencies from this repository's root.

## Run locally

Use Node.js from [.nvmrc](.nvmrc) and Yarn 4.

```bash
corepack enable
yarn install --immutable
bash packages/twenty-utils/setup-dev-env.sh
```

The setup script prepares local PostgreSQL/Redis, environment files and the database. See the script's header for its Docker and native-service options.

Then start each process in its own terminal, from the repository root:

```bash
yarn dev:backend    # API: http://localhost:3000
yarn dev:frontend   # App: http://localhost:3001
yarn dev:worker     # Background jobs
```

Local configuration is in `frontend/.env` and `backend/.env`. Their `.env.example` files are committed as templates; real environment files and database contents are not included.

## Find the UI changes

| Change | Source |
| --- | --- |
| Home dashboard | [HomeDashboardPage.tsx](frontend/src/pages/home/HomeDashboardPage.tsx) |
| Module layouts: People, Opportunities, Tasks and Notes | [RecordIndexCollection.tsx](frontend/src/modules/object-record/record-index/components/RecordIndexCollection.tsx) |
| Company relationships | [CompanyRelationshipExplorer.tsx](frontend/src/modules/object-record/record-index/components/CompanyRelationshipExplorer.tsx) |
| Atlas colours | [atlas-theme.css](frontend/src/atlas-theme.css) |
| Creation dialog | [RecordCreationFormModal.tsx](frontend/src/modules/object-record/record-form/components/RecordCreationFormModal.tsx) |
| Hidden workflow navigation | [useNavigationObjectMetadataItems.ts](frontend/src/modules/navigation-menu-item/common/hooks/useNavigationObjectMetadataItems.ts) and [useNavigationMenuItemsData.ts](frontend/src/modules/navigation-menu-item/display/hooks/useNavigationMenuItemsData.ts) |

Workflows remain in the source and backend; their navigation entries are hidden.

## Build and check

```bash
yarn build:frontend
yarn build:backend
yarn check:frontend
yarn check:backend
```

For a focused VS Code view, open [.vscode/twenty.code-workspace](.vscode/twenty.code-workspace). It groups the frontend, backend, shared types and UI library.

## Stack and attribution

React, TypeScript, Twenty UI, Linaria and Jotai on the frontend; NestJS, PostgreSQL, TypeORM, Redis and BullMQ on the backend. Yarn workspaces and Nx coordinate builds.

This repository preserves the Twenty source and local CRM customisations. Twenty is maintained by [twentyhq](https://github.com/twentyhq/twenty) and distributed under the [included licence](LICENSE). The original project reference is `6007ad5a7f6cb676fd8a9ff0c2a86a2e3d4c260e`.
