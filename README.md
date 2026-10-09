# Atlas DPP UI

A responsive Digital Product Passport command center for manufacturing and automotive supply-chain teams. The frontend is built with React 19, TypeScript, Vite, React Router, TanStack Query, Axios, Zustand, Recharts, and Lucide icons.

## Run locally

```bash
npm install
npm run dev
```

The app opens at `http://localhost:5173`. The dashboard ships with representative workspace data so the UI can be reviewed before the .NET API is connected.

## API integration

Copy `.env.example` to `.env` and set `VITE_API_URL` to the API base URL. The Axios client adds a stored `dpp_token` as a bearer token and exposes dashboard, product, and passport service methods in `src/api/client.ts`.

The dashboard currently uses explicitly marked sample workspace data; the supplied Swagger contract does not define a dashboard aggregation endpoint. Product records and product readiness are available through `/api/products` and `/api/products/{productId}/readiness`. Passport data and generation use `/api/passports/{productId}` and `/api/passports/generate`. Other route-level pages may continue to use representative local data where the API contract does not yet provide a matching read endpoint.

Tenant administration uses `/api/tenants` and tenant-scoped settings and user endpoints. Select an active tenant from the workspace selector before managing its members and roles. Economic operators are managed separately through `/api/companies`; they are not tenant records.

## Production build

```bash
npm run build
npm run preview
```

## Docker

```bash
docker compose up --build
```

The web container is served through Nginx on port `8080`, with SPA fallback routing and `/api` proxying configured in `nginx.conf`. Replace the sample API image in `docker-compose.yml` with the deployed .NET 8 API image.

## Structure

- `src/components`: navigation, cards, status badges, error boundary
- `src/pages`: dashboard, operational tables, product detail, feature workspaces
- `src/api`: Axios client and endpoint services
- `src/store`: Zustand workspace and theme state
- `src/models`: shared TypeScript models
