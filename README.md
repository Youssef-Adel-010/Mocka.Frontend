# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/9aa6daa3-5bbe-410e-af11-459295033c43

# Mocka.Frontend

Frontend for the Mocka application — a Vite + React + TypeScript UI using Tailwind CSS and shadcn-ui components.

## Quick facts

- Location: `src/`
- Framework: Vite + React + TypeScript
- Styling: Tailwind CSS
- Components: `src/components/ui/` (shadcn-inspired)

## Project structure

- `src/` — application source
	- `components/` — UI components and hooks
	- `pages/` — route pages (Index, Login, Register, Upload, etc.)
- `public/` — static assets
- Config: `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`

## Prerequisites

- Node.js 18+ (or Bun if you prefer)
- A package manager: npm, pnpm, or bun

## Install

Using npm:

```powershell
npm install
```

Using pnpm:

```powershell
pnpm install
```

Using bun:

```powershell
bun install
```

## Run (development)

```powershell
npm run dev
# or
pnpm dev
# or
bun dev
```

Open the URL printed by Vite (usually http://localhost:5173).

## Build & Preview

```powershell
npm run build
npm run preview
```

## Linting & Formatting

This repo includes ESLint/TypeScript config files. Use available scripts in `package.json`, for example:

```powershell
npm run lint
npm run format
```

If those scripts are not present, run the local linters directly as configured in the project.

## Environment variables

Create a `.env` file at the project root for local settings. Vite only exposes env variables prefixed with `VITE_` to the client.

## Notes

- UI primitives live under `src/components/ui/` and pages under `src/pages/`.
- There's a `bun.lockb` file — the project may be used with Bun; verify `package.json` scripts when switching runtimes.

## Contributing

- Open issues or PRs with small, focused changes.
- Follow existing code style. Add tests for new logic where appropriate.

## License

MIT (update if your project uses a different license)

---

If you'd like, I can also add a short developer guide section (common scripts from `package.json`) or wire up a `CONTRIBUTING.md` next.
