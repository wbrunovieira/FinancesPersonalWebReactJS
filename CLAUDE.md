# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal finance web app (Portuguese/Brazilian) built with React + TypeScript + Vite. It connects to a REST API backend (separate repo) for managing transactions, projections, and categories.

## Commands

- `pnpm run dev` — Start dev server (Vite, port 5173, host 0.0.0.0)
- `pnpm run build` — Type-check with `tsc -b` then build with Vite
- `pnpm run lint` — ESLint
- `pnpm run preview` — Preview production build

Package manager: **pnpm**

## Architecture

- **Routing**: React Router DOM v7 with routes defined in `src/main.tsx` — `/` (Home), `/statement`, `/dashboard`
- **Styling**: Tailwind CSS + shadcn/ui (new-york style, stone base color, CSS variables). Path alias `@` → `src/`
- **UI Components**: shadcn/ui components in `src/components/ui/`, app components in `src/components/`
- **API**: REST backend at `VITE_API_BASE_URL` env var. Endpoints: `/transactions`, `/projections`, `/categories`
- **Transaction types**: `income`, `expense`, `investment` — used consistently across the app
- **Currency/locale**: All monetary values formatted as BRL (`pt-BR` locale)

## Key Patterns

- Form components (AddExpense, AddIncome, AddInvestment, AddProjection) use modal pattern with local state, POST to the API
- Dashboard fetches both transactions and projections, filters by selected month, groups by category
- Date format used in forms: `DD/MM/AAAA HH:mm` (Brazilian format), utility functions in `src/utils/dateUtils.ts`
- `user_id` is hardcoded to `1` in all API payloads

## Known Issues

- The Dashboard component file has a space in its name: `src/components/ Dashboard.tsx` — imports reference this exact path
- Dashboard hardcodes API URL (`http://192.168.0.9:8080`) instead of using `VITE_API_BASE_URL` env var like other components
