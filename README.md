<p align="center">
  <img src="app/admin/src/assets/agentica.svg" alt="Agentica logo" width="180" />
</p>

<p align="center">
  AI-native e-commerce powered by conversational shopping agents, secure backend tools, and the Model Context Protocol.
</p>

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-24.18.0-34A85B?style=for-the-badge&logo=node.js&logoColor=white" />
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-11.9.0-E8A33D?style=for-the-badge&logo=pnpm&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-241F14?style=for-the-badge" />
</p>

---

## Overview

Agentica reimagines online shopping around an AI assistant instead of endless browsing, filtering, and form-filling. Users describe what they want in natural language, while the system uses trusted backend tools to search products, compare options, manage shopping workflows, and respect application permissions.

The project is also a practical exploration of how AI agents can safely interact with real software through the **Model Context Protocol (MCP)**.

## Highlights

- **Conversational shopping**: natural language product discovery, comparison, and recommendations.
- **Admin operations**: product, category, customer, review, and catalog management.
- **Secure backend**: Express API, Prisma models, validation schemas, and role-aware operations.
- **AI integration**: LLM service experiments and MCP-facing tool architecture.
- **Modern frontend stack**: Next.js customer app and Vite-powered React admin dashboard.

## Product Areas

| Area                  | What It Covers                                                                  |
| --------------------- | ------------------------------------------------------------------------------- |
| AI Shopping Assistant | Chat-first discovery, recommendations, product comparison, contextual responses |
| Customer Storefront   | Product browsing, categories, details, cart and order flows                     |
| Admin Dashboard       | Products, categories, customers, reviews, analytics, AI and MCP management      |
| Backend API           | Users, sessions, products, categories, reviews, auth-facing data access         |
| AI Services           | LLM orchestration, agents, MCP experiments and tool routing                     |

## Tech Stack

| Layer           | Tools                                     |
| --------------- | ----------------------------------------- |
| Web app         | Next.js, React, TypeScript                |
| Admin app       | Vite, React, TypeScript, Tailwind CSS     |
| API             | Node.js, Express, Zod                     |
| Database        | PostgreSQL, Prisma ORM                    |
| AI services     | Python, uv, LLM service experiments       |
| Quality         | ESLint, Prettier, TypeScript, Ruff, Black |
| Package manager | pnpm                                      |

## Repository Map

```text
Agentica/
├── app/
│   ├── web/                # Customer-facing Next.js app
│   └── admin/              # React admin dashboard
├── backend/
│   ├── express/            # Express API, Prisma, validation, routes
│   └── ai/                 # AI service and agent experiments
├── docs/                   # Design exports, proposals, notes
├── scripts/                # Workspace helper scripts
├── README.md
└── LICENSE
```

## Prerequisites

Install these before running the workspace:

| Tool    | Version       |
| ------- | ------------- |
| Node.js | `24.18.0`     |
| pnpm    | `11.9.0`      |
| Python  | `3.11+`       |
| uv      | latest stable |
| Git     | latest stable |

Check local versions:

```bash
node -v
pnpm -v
python3 --version
git --version
uv --version
```

Install `uv` if needed:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## Getting Started

Clone and enter the repository:

```bash
git clone <repository-url>
cd Agentica
```

Install JavaScript dependencies:

```bash
pnpm --dir app/web install
pnpm --dir app/admin install
pnpm --dir backend/express install
```

Install AI service dependencies:

```bash
uv --directory backend/ai/py-version/llms-service sync
```

Run everything from the workspace root:

```bash
pnpm dev
```

Or run each surface separately:

```bash
pnpm --dir app/web dev
pnpm --dir app/admin dev
pnpm --dir backend/express dev
uv --directory backend/ai/py-version/llms-service run main.py
```

## Database

The Express backend uses Prisma with PostgreSQL. After changing the Prisma schema, regenerate the client:

```bash
pnpm --dir backend/express run db:generate
```

Apply schema changes to your local database:

```bash
pnpm --dir backend/express run db:push
```

## Quality Commands

Run from the workspace root:

```bash
pnpm lint
pnpm check-types
pnpm format:check
pnpm verify
```

Build all TypeScript app/API surfaces:

```bash
pnpm build
```

Format the workspace:

```bash
pnpm format
```

## Development Flow

1. Create a branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make the change.
3. Run checks:

   ```bash
   pnpm verify
   ```

4. Commit and push:

   ```bash
   git add .
   git commit -m "feat: describe the change"
   git push origin feature/your-feature-name
   ```

5. Open a pull request.

Avoid pushing directly to `main`.

## Current Status

- Repository and workspaces are in place.
- Customer web app and admin dashboard are actively evolving.
- Express API includes users, sessions, products, categories, reviews, and admin operations.
- Prisma schema is being expanded with e-commerce domain models.
- AI and MCP services are under active development.

## Team

- Ashim Gautam
- Madan Bhandari
- Nishan Bhandari
- Nishant Bhattarai

## License

Agentica is licensed under the [MIT License](LICENSE).
