# Multipurpose Inventory & Service Management System

A full-stack business management platform built as a monorepo for managing inventory, purchases, sales, suppliers, customers, wastage, and service operations in one place.

Live Link- https://sell-tech-suite.vercel.app

This project combines:

- a Next.js frontend for dashboards and business workflows
- an Express + Prisma backend for APIs and business logic
- a PostgreSQL database for structured records and reporting
- modular features for retail, restaurant-style raw/prepared inventory, and service-based operations

---

## Overview

This application is designed for small and medium businesses that want a single place to track:

- products and stock levels
- purchases from suppliers
- sales and customer dues
- raw products and prepared products
- wastage and loss
- suppliers and customers
- service offerings and billing
- overall business performance via dashboard analytics

The product is built to support multiple business models in one system, including:

- retail product inventory
- restaurant/raw material workflows
- prepared item production
- service-based business operations

---

## Project Structure

```text
inventory/
├── README.md
├── multipurpose-inventory-backend/
│   ├── prisma/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── Dockerfile
│   ├── docker-compose.yaml
│   └── README.md
├── multipurpose-inventory-management/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── providers/
│   ├── validation/
│   ├── public/
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── README.md
└── package-level docs and workspace config
```

---

## Main Features

### Business management

- Inventory tracking for products, raw materials, and prepared products
- Purchase management with supplier records
- Sales processing with customer and due tracking
- Invoice generation and payment monitoring
- Return and refund handling
- Wastage reporting and stock adjustments

### Dashboard & reporting

- Business overview dashboards
- KPI and summary cards
- Activity log tracking
- Sales/purchase insights
- Waste and stock monitoring

### Multi-business support

- Retail product workflows
- Restaurant/raw ingredient workflows
- Prepared item production and recipe-style tracking
- Service-oriented business modules

---

## Tech Stack

### Frontend

- Next.js
- React
- Tailwind CSS
- TanStack Query
- React Hook Form + Zod
- Shadcn UI pattern components
- Recharts for charts and reporting

### Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT-based auth patterns
- Zod validation
- Structured modular services

### Tooling

- TypeScript
- pnpm workspaces
- Biome for lint/formatting
- Docker / Docker Compose for local setup
- Vitest for tests

---

## Architecture

The project follows a modular monorepo pattern:

- Frontend handles UI, dashboards, forms, and user interactions.
- Backend exposes REST APIs and domain logic for inventory, sales, stock, and accounts.
- Prisma models the database schema with strong typing and relational consistency.
- PostgreSQL stores the actual business data for transactions, inventory, and logs.

This allows the business logic to stay organized while giving the project room to grow into more complex inventory and service workflows.

---

## Core Modules

The current application structure includes modules for:

- account
- activity log
- auth
- category
- customer
- dashboard
- invoice
- prepared product
- product
- purchase
- raw product
- return
- sale
- service
- supplier
- trash
- unit
- wastage

These modules are the backbone of the platform and reflect the operational areas of the business.

---

## Current Status

This project is actively evolving as a practical business application. The main workflow areas are largely in place, including:

- dashboard overview
- product management
- purchase tracking
- sales operations
- supplier/customer management
- inventory and wastage handling
- account and other system modules

The staff permission/role system is still being refined, and some access-control pieces are partially prepared but not fully completed.

---

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js 20+
- pnpm
- PostgreSQL
- Docker (optional, for local containerized setup)

### 1. Clone the repository

```bash
git clone <repo-url>
cd inventory
```

### 2. Install dependencies

```bash
cd multipurpose-inventory-backend
pnpm install

cd ../multipurpose-inventory-management
pnpm install
```

### 3. Configure environment variables

Create environment files from the sample configs in each app, then update values for your local database, auth secrets, and app settings.

Backend example:

```bash
cd multipurpose-inventory-backend
cp .env.sample .env
```

Frontend example:

```bash
cd multipurpose-inventory-management
cp .sample.env .env
```

### 4. Start the backend

```bash
cd multipurpose-inventory-backend
pnpm dev
```

### 5. Start the frontend

```bash
cd multipurpose-inventory-management
pnpm dev
```

### 6. Optional database setup

```bash
cd multipurpose-inventory-backend
pnpm db:generate
pnpm db:push
```

If using Prisma migrations:

```bash
pnpm db:migrate
```

---

## Useful Scripts

### Backend

```bash
pnpm dev
pnpm build
pnpm test
pnpm lint
pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:studio
```

### Frontend

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm format
```

---

## Notes on the Product Vision

The goal of this application is not just code architecture, but practical business operations. It is built to help business owners and managers keep:

- stock under control
- sales and purchases in one place
- wastage visible
- supplier and customer history organized
- daily business decisions supported by a clear dashboard

In short, this project aims to be a useful operational tool for real-world business management, not only a technical demo.

---

## Related Documentation

- [multipurpose-inventory-backend/README.md](multipurpose-inventory-backend/README.md)
- [multipurpose-inventory-management/README.md](multipurpose-inventory-management/README.md)
- [multipurpose-inventory-management/aboutThisApplication.md](multipurpose-inventory-management/aboutThisApplication.md)

