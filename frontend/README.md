# ShopSphere frontend

React 19 + Vite 8 + Tailwind CSS 4 storefront and administration UI. See the [root README](../README.md) for the full project setup, API reference, and deployment guide.

## Quick start

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` and proxies `/api` to `http://localhost:5000`. Start the backend first.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the build locally |
| `npm run lint` | Run Oxlint |

## Routes

Public: `/`, `/shop`, `/product/:id`, `/cart`, `/checkout`, `/about`, `/login`, `/register`, `/admin/login`, `/admin/register`.

Admin (requires an administrator cookie): `/admin`, `/admin/products`, `/admin/products/new`, `/admin/products/:id/edit`, `/admin/categories`.

## Configuration

API calls default to `/api`. Override with `VITE_API_URL` only when you are not using the Vite proxy or the Vercel proxy. Authentication uses an httpOnly cookie, so same-origin API routing is recommended.

`frontend/vercel.json` proxies `/api/*` to `${BACKEND_URL}/api/*`. Set `BACKEND_URL` in the Vercel project to the Render origin, for example `https://shopsphere-api.onrender.com` (no trailing slash). Do not set `VITE_API_URL` when using the proxy.

Set `VITE_ALLOW_ADMIN_REGISTRATION=false` on public deployments to hide the admin registration page and links. Create the first administrator with the backend seed script instead.

## Design system

- Zero border radius throughout
- Tokens and base styles in `src/index.css`
- Inter for UI, Manrope for display headings
- Shared primitives in `src/components/ui`
- Cart state in `src/context/CartContext.jsx`; auth state in `src/context/AuthContext.jsx`
