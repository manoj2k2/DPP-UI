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

The current screen data is intentionally local and mockable. Replace the data source in the route-level pages with TanStack Query calls as API endpoints become available. The expected endpoints include `/api/products`, `/api/passports/generate`, and `/api/dashboard`.

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
