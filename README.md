# QuoteFlow

A mobile-first quoting application for tradespeople and contractors. Create professional quotes on the go, manage customers, and export branded PDFs — all stored offline-first in the browser.

## Features

- **Dashboard** — monthly quote volume, accepted value, conversion rate, and recent activity at a glance
- **Quotes** — create and edit quotes with line items, automatic totals and tax, status tracking (Draft / Sent / Accepted / Declined), search, and status filters
- **PDF export** — one-tap branded PDF generation for any quote (loaded on demand to keep the app fast)
- **Customers** — manage customer contact details and notes, with quick-add directly from the quote editor
- **Settings** — company profile, default tax rate, and default terms & conditions applied to new quotes
- **Backup & restore** — download all data as a JSON file and restore it on any device from Settings
- **Offline-first** — all data is persisted locally in the browser via IndexedDB (localforage); no account or network required

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- localforage (IndexedDB) for offline storage
- jsPDF + jspdf-autotable for PDF generation
- lucide-react icons

## Getting Started

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

The app runs at http://localhost:3000.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Type-check with `tsc --noEmit` |

## Project Structure

```
src/
  components/     Shared UI (Button, Card, Input, Modal, ...) and onboarding
  features/
    dashboard/    Monthly stats and recent activity
    quotes/       Quote list, editor, and PDF export
    customers/    Customer management
    settings/     Company profile and quote defaults
  hooks/          useStore — app-wide state backed by storage
  lib/            storage (localforage), pdf, utils, date helpers
  types/          Shared TypeScript types
```
