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

- **Routing**: React Router DOM v7 with routes defined in `src/main.tsx` — `/` (Home/App.tsx), `/statement` (Statement.tsx), `/dashboard` (Dashboard.tsx)
- **Styling**: Tailwind CSS + shadcn/ui (new-york style, stone base color, CSS variables). Path alias `@` → `src/`
- **UI Components**: shadcn/ui components in `src/components/ui/`, app components in `src/components/`
- **API**: REST backend at `VITE_API_BASE_URL` env var. Endpoints: `/transactions`, `/projections`, `/categories`
- **Transaction types**: `income`, `expense`, `investment` — used consistently across the app
- **Currency/locale**: All monetary values formatted as BRL (`pt-BR` locale)

## Key Patterns

### Forms / Modals
- AddExpense uses a simple fixed overlay modal with local state
- AddIncome and AddInvestment use the Framer Motion `animated-modal` system (`src/components/ui/animated-modal.tsx`) — exports `Modal`, `ModalProvider`, `ModalTrigger`, `ModalBody`, `ModalContent`, `ModalFooter`
- AddProjection supports recurring projections with an `is_recurring` flag and `end_month` selector
- AddExpense, AddIncome, AddInvestment fetch categories on mount via `GET /categories?category_type=expense|income|investment`
- AddProjection is different: it fetches `GET /categories` (all categories, no filter), then filters client-side by `category.type === type` once the user selects a transaction type
- All API payloads hardcode `user_id: 1`

### Date handling
- Input format: `DD/MM/AAAA HH:mm` (Brazilian format)
- Utilities: `formatDateTime(value)` and `isValidDateTime(value)` in `src/utils/dateUtils.ts`
- API receives ISO date strings; Dashboard filters by `date.getFullYear()` + `date.getMonth()`

### Dashboard
- Fetches both `/transactions` and `/projections`, filters by selected month (month nav controls)
- Groups projections by category, shows daily transaction movements with running balance
- Running balance sign convention: `income` adds, `expense` and `investment` both subtract
- Month navigation increments/decrements a `Date` state object
- Date display uses `dateKey + 'T12:00:00'` when constructing `new Date()` to avoid UTC offset shifting the day

### Utility
- `cn(...inputs)` in `src/lib/utils.ts` — clsx + tailwind-merge for className composition

## Data Shapes

```typescript
// Transaction (from /transactions)
{ id, user_id, amount, description, category_id, category, type, date, created_at, updated_at }

// Projection (from /projections)
{ id, amount, category, description, type, date, is_recurring, end_month? }

// Category (from /categories)
{ id, name, category_type }
```

## Known Issues

- The Dashboard component file has a leading space in its name: `src/components/ Dashboard.tsx` — imports reference this exact path with the space
