# Supporting packages

Start with **[frontend](../frontend/README.md)** or **[backend](../backend/README.md)** for application work. This folder retains the shared libraries and upstream tools they use.

## Used by the CRM

| Package | Role |
| --- | --- |
| [twenty-ui](twenty-ui/) | Buttons, forms, icons and theme tokens |
| [twenty-shared](twenty-shared/) | Shared types, contracts and utilities |
| [twenty-client-sdk](twenty-client-sdk/) | Generated API client |
| [twenty-sdk](twenty-sdk/) | Application extension SDK |
| [twenty-front-component-renderer](twenty-front-component-renderer/) | Embedded application components |
| [twenty-emails](twenty-emails/) | Email templates |
| [twenty-docker](twenty-docker/) | Docker and deployment definitions |
| [twenty-utils](twenty-utils/) | Development setup and utility scripts |
| [twenty-oxlint-rules](twenty-oxlint-rules/) | Shared lint rules |

## Other upstream tools

- Extensions: [twenty-apps](twenty-apps/), [create-twenty-app](create-twenty-app/), [twenty-cli](twenty-cli/) and [twenty-zapier](twenty-zapier/).
- Desktop: [twenty-companion](twenty-companion/).
- Documentation and site: [twenty-docs](twenty-docs/) and [twenty-website](twenty-website/).
- Testing: [twenty-e2e-testing](twenty-e2e-testing/).
- Agent instructions: [twenty-agent-skills](twenty-agent-skills/) and [twenty-claude-skills](twenty-claude-skills/).

Install from the repository root so Yarn can link these packages to both applications. Package names and Nx project names remain unchanged for compatibility.
