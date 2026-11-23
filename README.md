<<<<<<< HEAD
## **Technical Software Requirements Specification (SRS)**

**Project Name:** Multipurpose Inventory & Service Management System (MP Inventory & Service)  
**Technology Stack:** MERN (MongoDB, Express.js, React, Node.js) / PERN (PostgreSQL, Express.js, React, Node.js)

### 1\. Introduction

**Purpose:**  
This SRS defines the technical requirements, system architecture, API design, and implementation guidelines for building a secure, scalable web application that provides flexible inventory management for diverse business types. The system supports unified management of products (retail), raw materials and prepared items (restaurant), and services (service-based), with CRUD operations, real-time stock updates (where applicable), waste tracking, profit calculations (including % based on inventory vs. sold), due tracking, and role-based access control (RBAC). It ensures seamless sales across all item types while adapting to business-specific needs like recipe-based costing for prepared items.

**Scope:**

- Flexible item management: Retail (products, suppliers, customers); Restaurant (suppliers, raw materials, prepared menus with recipes, prepared items, customers); Service (services with waste tracking).  
- Purchases (for products/raw materials/supplies), Sales (unified for products/prepared items/services), Inventory (products/raw materials/prepared items only).  
- User authentication & authorization.  
- Basic reporting (history, dues, profit with %).  
- Waste tracking for products, raw materials, or prepared items.

Out of scope (initial version): Payment gateways, advanced analytics, multi-warehouse, mobile app, multi-currency support.

### 2\. Overall System Architecture

The application follows a client-server architecture with separation of concerns, designed for flexibility across business types (e.g., recipe costing in restaurant mode).

- **Frontend (Client Layer):** React-based Single Page Application (SPA) for responsive UI, supporting dynamic forms for item types (e.g., recipe builders for prepared menus).  
- **Backend (Server Layer):** Node.js \+ Express.js RESTful API server, handling business logic like profit % calculation (inventory stock vs. sold items) and waste adjustments.  
- **Database Layer:** NoSQL (MongoDB) for flexible schemas (e.g., embedded recipes in prepared items) or relational (PostgreSQL) for structured data (e.g., precise raw material tracking in restaurants).  
- **Communication:** HTTP/HTTPS via REST APIs (JSON payloads). Optional future: WebSockets (Socket.IO) for real-time stock/waste alerts.

**High-Level Architecture Diagram:**  
\[User Registration Flow (1)\]  
\[Application Read/Write Data Flow Diagram (2)\]

**Key Design Principles (2025 Best Practices):**

- Modular monorepo structure (backend \+ frontend in one repo) for easier maintenance across business modes.  
- Service layer pattern in backend for business logic separation (e.g., flexible item validation based on business type).  
- Clean, scalable folder structure to support extensibility (e.g., adding restaurant-specific recipe services).  
- Error handling & logging centralized, with waste/profit calculation hooks.  
- Use environment variables (.env) for configs (e.g., business type toggles).  
- Follow RESTful API standards (resource-based routes, proper HTTP methods/status codes).

**Folder Structure:**  
**Backend (`multipurpose-inventory-backend/`):**

```text
multipurpose-inventory-backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── database/         # Database configuration
│   │   └── db.config.ts
│   ├── middleware/       # Custom middlewares
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   │   ├── api/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── utils/            # Utility classes & functions
│   │   ├── ApiError.ts
│   │   └── ApiResponse.ts
│   └── index.ts          # Entry point
├── .env.sample           # Environment variables template
├── .gitignore            # Git ignore file
├── biome.json            # Linter & Formatter config
├── package.json          # Dependencies & scripts
├── pnpm-lock.yaml        # Lock file
├── tsconfig.json         # TypeScript config
└── README.md
```

**Frontend (`multipurpose-inventory-management/`):**

```text
multipurpose-inventory-management/
├── app/                  # Next.js App Router directory
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── biome.json            # Linter & Formatter config
├── eslint.config.mjs     # ESLint configuration
├── next.config.ts        # Next.js configuration
├── package.json          # Dependencies & scripts
├── pnpm-lock.yaml        # Lock file
├── pnpm-workspace.yaml   # PNPM workspace configuration
├── postcss.config.mjs    # PostCSS configuration
├── tsconfig.json         # TypeScript config
└── README.md
```

### 3\. Tech Stack & Tools

The stack is chosen for flexibility, scalability, and ease of development:

- **MERN (MongoDB \+ Express \+ React \+ Node.js):** Preferred for NoSQL flexibility in handling varied item types (e.g., embedded recipes in prepared menus) and rapid prototyping. MongoDB excels in schema-less designs for restaurant raw material/prepared item tracking; Node.js/Express for async I/O in real-time stock updates; React for dynamic UIs (e.g., business type-specific forms).  
- **PERN (PostgreSQL \+ Express \+ React \+ Node.js):** Alternative for relational integrity in structured data (e.g., precise supplier/raw material links in restaurant mode). PostgreSQL supports complex queries for profit % (inventory vs. sold) and waste tracking; same Express/React/Node for consistency. Use PERN if business requires strict ACID compliance (e.g., financial reporting).

**Core Tools:**

- **Frontend:** React 18+/Next Js, React Router v6/App Router, Axios, TanStack Query (caching/queries for flexible item lists), Context API / Zustand (state management for business modes), Tailwind CSS, ShadCn Ui, React Hook Form \+ Zod (validation).  
- **Backend:** Node.js 20+, Express.js 4+ (routing), Mongoose (MongoDB) or Prisma (PostgreSQL), JWT (jsonwebtoken) for auth, bcryptjs (password hashing).  
- **Database:** MongoDB 7+ (Atlas for MERN) or PostgreSQL 16+ (for PERN).  
- **Authentication:** JWT (access \+ refresh tokens).  
- **Other:** dotenv (configs), cors (CORS), helmet (security headers), morgan/winston (logging), Zod/Joi (validation).  
- **Deployment:** Initial deployment on Vercel/Netlify (frontend), Render/Heroku (backend), and MongoDB Atlas or Supabase (DB).

### 4\. Basic API Design

RESTful APIs with endpoints grouped by resource. All endpoints use JWT auth (except public ones). Responses: JSON with status codes (200 OK, 400 Bad Request, 401 Unauthorized, 500 Internal Server Error).

- **Auth APIs:**  
    
  - POST /api/auth/register: Create user (body: {name, email, password, role}). Returns JWT.  
  - POST /api/auth/login: Login (body: {email, password}). Returns JWT.  
  - GET /api/auth/profile: Get user profile (protected).


- **Item APIs (Flexible for Business Types):**  
    
  - POST /api/items: Create item (body: {name, type, businessMode, unit, cost\_price, selling\_price, recipe? (for restaurant)}).  
  - GET /api/items: List items (query: ?type=product\&businessMode=restaurant).  
  - PUT /api/items/:id: Update item (e.g., add recipe for prepared menu).  
  - DELETE /api/items/:id: Delete item.


- **Purchase APIs:**  
    
  - POST /api/purchases: Create purchase (body: {supplier\_id, items\[\], total, paid}). Updates stock/raw materials.  
  - GET /api/purchases: List purchases (query: ?status=pending).


- **Sales APIs:**  
    
  - POST /api/sales: Create sale (body: {customer\_id, items\[\], discount, paid}). Deducts stock (if applicable), calculates profit %.  
  - GET /api/sales: List sales (query: ?dateRange=... ).


- **Inventory APIs:**  
    
  - GET /api/inventory: List stock (query: ?itemType=prepared). Includes waste adjustments.  
  - PUT /api/inventory/:id/adjust: Adjust stock/waste (body: {quantity, reason}).


- **Report APIs:**  
    
  - GET /api/reports/profit: Profit summary (query: ?period=monthly, businessMode=restaurant). Includes % calc.

### 5\. Security Layer & Best Practices

- **Authentication:** JWT-based (access token short-lived \~15-60 min, refresh token long-lived \~7-30 days, httpOnly cookie for refresh).  
- **Authorization (RBAC):** Middleware checks user.role or permissions array. Protect routes (e.g., admin-only for user management).  
- **Password Security:** bcrypt hashing (salt rounds 12+). Never store plain passwords.  
- **Token Security:**  
  - Sign with strong secret (min 64 chars, env variable).  
  - Use HTTPS in production.  
  - Store access token in memory (not localStorage to prevent XSS).  
  - httpOnly \+ Secure \+ SameSite=Strict cookies for refresh token.  
- **Input Validation & Sanitization:** Zod/Joi on backend, React Hook Form \+ Zod on frontend.  
- **API Protection:**  
  - Rate limiting (express-rate-limit).  
  - Helmet for security headers (XSS, clickjacking protection).  
  - CORS restricted to frontend origin.  
- **Data Protection:**  
  - No sensitive data in JWT payload (only user ID \+ role).  
  - Audit logs for critical actions (create/update/delete).  
- **Error Handling:** Global error middleware – never expose stack traces in production.  
- **Other:** Brute-force protection on login, secure secret management.

### 6\. Functional Flows (Technical)

- **Add Item (Flexible):** POST /api/items → validate businessMode/type → if restaurant, embed recipe (raw materials \+ quantities); if product, init inventory.  
- **Purchase:** POST /api/purchases → add items\[\] → update stock/raw materials; auto-calc total/cost.  
- **Prepare Item (Restaurant):** POST /api/prepared-items → deduct raw materials per recipe → create prepared item stock.  
- **Sale (Unified):** POST /api/sales → validate stock (if product/raw/prepared) → deduct quantity/waste → calc profit (selling \- cost) \* qty \+ % (vs. inventory).  
- **Waste Adjustment:** PUT /api/inventory/:id/waste → log waste for products/raw/prepared; update profit calcs.  
- **Profit Report:** GET /api/reports/profit → aggregate (SUM((selling \- cost) \* qty)) / total inventory \* 100 for %.

Figma Link- [Figma](https://www.figma.com/design/mgDAxgDg1R24NX7gl6Xcos/Multipurpose-Inventory-Management?t=uk1if0BdfAXjNxTc-1)

Diagrams\-![]

<img src="https://res.cloudinary.com/dlrycnxnh/image/upload/v1773400516/Untitled-2026-03-12-2336_l0hx71.png" alt="Alt Text" width="500">
<img src="https://res.cloudinary.com/dlrycnxnh/image/upload/v1773400517/Untitled-2026-03-12-2342_r7wfej.png" alt="Alt Text" width="500">
<img src="https://res.cloudinary.com/dlrycnxnh/image/upload/v1773400516/Untitled-2026-03-12-2341_mdi4gr.png" alt="Alt Text" width="500">
<img src="https://res.cloudinary.com/dlrycnxnh/image/upload/v1773400517/Untitled-2026-03-12-2338_lnbfo0.png" alt="Alt Text" width="500">
<img src="https://res.cloudinary.com/dlrycnxnh/image/upload/v1773400517/Untitled-2026-03-12-2340_qwlmqr.png" alt="Alt Text" width="500">
<img src="https://res.cloudinary.com/dlrycnxnh/image/upload/v1773400517/Untitled-2026-03-12-2339_ea9hwn.png" alt="Alt Text" width="500">
<img src="https://res.cloudinary.com/dlrycnxnh/image/upload/v1773400516/Untitled-2026-03-12-2337_ownosg.png" alt="Alt Text" width="500">

=======
# Multipurpose Inventory & Service Management System

A full-stack business management platform built as a monorepo for managing inventory, purchases, sales, suppliers, customers, wastage, and service operations in one place.

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

### User & access management

- User accounts and roles
- Permission-aware modules
- Staff and account-level access control foundation
- Activity tracking for business actions

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
- staff
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

## License

This project is currently configured as a private application and does not currently declare a public commercial license.

---

## Related Documentation

- [multipurpose-inventory-backend/README.md](multipurpose-inventory-backend/README.md)
- [multipurpose-inventory-management/README.md](multipurpose-inventory-management/README.md)
- [multipurpose-inventory-management/aboutThisApplication.md](multipurpose-inventory-management/aboutThisApplication.md)
>>>>>>> fff8b72 (minor)

