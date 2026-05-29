# NexusOS — Multi-Tenant SaaS (React)

A fully componentized multi-tenant SaaS dashboard built with React + Vite + CSS Modules.

## Project Structure

```
src/
├── styles/
│   └── globals.css          # CSS variables, base resets, scrollbar
│
├── utils/
│   └── helpers.js           # colorFor, initials, uid, fmtDate, fmtMoney, seedTenant
│
├── hooks/
│   ├── useTenants.js        # All tenant/auth state management
│   └── useToast.js          # Toast notification hook
│
├── components/
│   ├── Sidebar.jsx / .module.css   # Left nav with tenant + user info
│   ├── Topbar.jsx / .module.css    # Page title bar
│   └── UI.jsx / .module.css        # Shared: Button, Modal, Toast, Badge, FormRow...
│
├── pages/
│   ├── LoginPage.jsx / AuthPage.module.css
│   ├── RegisterPage.jsx             # Reuses AuthPage.module.css
│   ├── DashboardPage.jsx / .module.css
│   ├── UsersPage.jsx / TablePage.module.css
│   ├── ProductsPage.jsx             # Reuses TablePage.module.css
│   └── OrdersPage.jsx               # Reuses TablePage.module.css
│
├── App.jsx / App.module.css         # Root shell, routing logic
└── main.jsx                         # ReactDOM entry point
```

## Getting Started

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Demo Credentials

| Tenant       | Email                   | Password |
|-------------|-------------------------|----------|
| Nexus Corp  | admin@nexus.com         | password |
| TechFlow Inc| admin@techflow.com      | password |

Or register a new workspace from the Register page.

## Features

- **Multi-tenancy** — each company's data is fully isolated
- **Auth** — Login + Register with plan selection
- **Dashboard** — Stats cards, bar chart, status breakdown, recent orders
- **Users** — CRUD with search, role & status management
- **Products** — CRUD with price, stock, category
- **Orders** — CRUD linking users to products, status updates
- **Toast notifications** — feedback on every action
- **CSS Modules** — scoped styles, no class conflicts
