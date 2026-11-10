# ShopSphere

A full-stack MERN e-commerce application for a small, design-led store. ShopSphere pairs a minimalist editorial storefront with a working administration area for products, categories, stock, and Cloudinary image uploads.

The interface is intentionally square-cornered, typography-led, and restrained: white and warm-grey surfaces, thin borders, no gradients or decorative shadows.

> **Demo checkout:** checkout is a client-side demonstration. It collects shipping details, validates the form, generates a local order number, clears the cart, and shows a confirmation. No payment is processed, no email is sent, and no order is stored in a database. See [Checkout behaviour](#checkout-behaviour).

## Features

### Storefront

- Home page with hero, category navigation, featured products, best sellers, and new arrivals
- Shop page with URL-synced search, category, price, sort, and pagination filters
- Product detail pages with sale pricing, stock status, quantity selection, and related products
- Persistent cart with stock-aware quantity limits, free-shipping progress, and local storage sync
- Demo checkout with validated shipping form and order confirmation
- Customer registration and login with httpOnly cookie sessions
- About page, responsive navigation, keyboard-accessible menus, empty/error/loading states
- Responsive layouts with no horizontal overflow down to 390px

### Administration

- Protected admin routes with server-side role checks
- Self-service admin registration in development; disabled by default in production
- Dashboard with catalogue and inventory health statistics
- Product table with search, sort, pagination, and delete confirmation
- Create/edit product form with validation, live storefront preview, and image URL or file upload
- Category overview derived from product data with stock breakdowns
- Cloudinary upload endpoint with local Multer buffering and optional configuration

### Platform

- JWT authentication stored in an httpOnly, SameSite=Lax cookie
- Helmet, CORS allow-list, request size limits, API and auth rate limiting
- Centralized validation and error responses
- MongoDB indexes for product search, filtering, sorting, and category aggregation
- 27 integration tests using Node's test runner, Supertest, and MongoDB Memory Server
- Vite proxy in development; same-origin `/api` proxy through Vercel in production

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 8, React Router 7, Tailwind CSS 4, Axios, Lucide, react-hot-toast |
| Backend | Node.js 20.19+, Express 5, Mongoose 9, JWT, bcryptjs |
| Database | MongoDB Atlas or local MongoDB |
| Images | Cloudinary (optional), remote URLs, local SVG placeholder |
| Testing | `node:test`, Supertest, mongodb-memory-server |
| Tooling | Oxlint, nodemon |

## Project structure

```text
E-commerce/
|-- backend/
|   |-- config/          # Environment validation and database connection
|   |-- controllers/     # Auth, public product, and admin handlers
|   |-- middleware/      # Auth, admin guard, validation, errors, upload, rate limits
|   |-- models/          # User and Product schemas
|   |-- routes/          # /api/auth, /api/products, /api/admin
|   |-- scripts/         # Admin and product seed scripts
|   |-- tests/           # API integration tests
|   |-- utils/           # Tokens, cookies, query building, API errors
|   |-- app.js           # Express app
|   `-- server.js        # Database connection, HTTP server, graceful shutdown
|-- frontend/
|   |-- public/          # Favicon and placeholder image
|   `-- src/
|       |-- components/  # UI primitives, layout, product, cart, filters
|       |-- context/     # Auth and cart state
|       |-- hooks/       # Debounce, document title, click outside
|       |-- pages/       # Storefront and admin pages
|       |-- services/    # Axios API modules
|       `-- utils/       # Formatting, constants, payload helpers
|-- render.yaml          # Render backend blueprint
`-- frontend/vercel.json # Vercel SPA and API rewrite config
```

## Getting started

### Prerequisites

- Node.js **20.19+** and npm
- A MongoDB Atlas account or a local MongoDB instance
- Optional: a Cloudinary account for product image uploads
- Optional: Google Chrome/Edge if you want to use the visual test harness

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure the backend

Copy the example environment file and fill in the values:

```bash
cd backend
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Required values:

```dotenv
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/shopsphere?retryWrites=true&w=majority
JWT_SECRET=<at-least-32-random-characters>
```

Generate a suitable secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**MongoDB Atlas network access:** add your current public IP under **Network Access**. Until the IP is allowed, the server cannot seed or connect. For a Render deployment, add the Render egress address if you have a static one; otherwise use `0.0.0.0/0` and rely on a strong database password. Never commit `.env`.

The database layer retries an Atlas SRV lookup with public DNS (`8.8.8.8`, `1.1.1.1`) if the system resolver fails.

### 3. Seed sample products

```bash
cd backend
npm run seed:products
```

The product seed is idempotent by product name and loads 16 sample products.

### 4. Run the app

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to `http://localhost:5000`. Development also accepts `http://127.0.0.1:5173` and Vite preview ports for CORS.

### 5. Create an administrator

**Self-service (development only):** open `http://localhost:5173/admin/register`, enter a name, email, and password. The account is created with the `admin` role and signed in immediately. This page is hidden when `VITE_ALLOW_ADMIN_REGISTRATION=false`, and the API rejects the request when `ALLOW_ADMIN_REGISTRATION=false`. Production defaults to disabled.

**CLI seed (recommended for production):** set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `.env`, then run:

```bash
cd backend
npm run seed:admin
```

Sign in at `http://localhost:5173/admin/login` with the account you created. Customer accounts cannot access the admin area.

## Environment variables

Backend:

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `MONGO_URI` | Yes | - | MongoDB connection string |
| `JWT_SECRET` | Yes | - | JWT signing secret; use 32+ random characters |
| `PORT` | No | `5000` | HTTP port |
| `NODE_ENV` | No | `development` | Enables secure cookies in production |
| `CLIENT_URL` | No | `http://localhost:5173` | Comma-separated allowed browser origins |
| `JWT_EXPIRES_IN` | No | `7d` | Token and cookie lifetime |
| `JWT_COOKIE_NAME` | No | `shopsphere_token` | Auth cookie name |
| `COOKIE_SAME_SITE` | No | `lax` | `lax`, `strict`, or `none`; keep `lax` for the Vercel same-origin proxy |
| `ALLOW_ADMIN_REGISTRATION` | No | `true` outside production | Allow public `POST /api/auth/admin/register`; disabled by default in production |
| `ADMIN_NAME` | Seed only | `ShopSphere Admin` | Administrator display name for the seed script |
| `ADMIN_EMAIL` | Seed only | - | Administrator email for the seed script |
| `ADMIN_PASSWORD` | Seed only | - | Administrator password for the seed script (8+ characters) |
| `LOW_STOCK_THRESHOLD` | No | `5` | Units at or below this value are low stock |
| `CLOUDINARY_CLOUD_NAME` | No | - | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | - | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | - | Cloudinary API secret |
| `CLOUDINARY_FOLDER` | No | `shopsphere/products` | Upload folder |

If Cloudinary is not configured, the upload endpoint returns `503` and the admin form still accepts an external image URL.

Frontend:

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `VITE_API_URL` | No | `/api` | API base URL. Leave unset when using the Vite proxy or Vercel proxy. |
| `VITE_ALLOW_ADMIN_REGISTRATION` | No | `true` | Show the self-service admin registration page and links; set `false` in production |

Vercel project variable used by `frontend/vercel.json`:

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `BACKEND_URL` | Yes | - | Render origin, for example `https://shopsphere-api.onrender.com` (no trailing slash) |

## Scripts

Backend (`backend/`):

| Command | Description |
| --- | --- |
| `npm run dev` | Start with nodemon |
| `npm start` | Start the production server |
| `npm test` | Run the API integration suite |
| `npm run seed:admin` | Create or update an administrator from the env values |
| `npm run seed:products` | Create or update sample products |

Frontend (`frontend/`):

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |

## API overview

All responses use a `{ success, message?, data?, meta? }` shape. Authentication uses the `shopsphere_token` httpOnly cookie.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Health check |
| `POST` | `/api/auth/register` | Public | Create a customer account |
| `POST` | `/api/auth/admin/register` | Public when enabled | Create an administrator; disabled when `ALLOW_ADMIN_REGISTRATION=false` |
| `POST` | `/api/auth/login` | Public | Sign in |
| `POST` | `/api/auth/logout` | Public | Clear the session cookie |
| `GET` | `/api/auth/me` | Customer | Current user |
| `GET` | `/api/products` | Public | Paginated product list |
| `GET` | `/api/products/categories` | Public | Categories with counts and stock bands |
| `GET` | `/api/products/:id` | Public | Single product |
| `GET` | `/api/admin/dashboard` | Admin | Catalogue and inventory statistics |
| `GET` | `/api/admin/products` | Admin | Admin product list |
| `POST` | `/api/admin/products` | Admin | Create a product |
| `PUT` | `/api/admin/products/:id` | Admin | Update a product |
| `DELETE` | `/api/admin/products/:id` | Admin | Delete a product |
| `POST` | `/api/admin/upload` | Admin | Upload an image (`multipart/form-data`, field `image`) |

Admin registration accepts `name`, `email`, and `password`, creates an `admin` user, and signs them in.

`GET /api/products` accepts:

- `search` - case-insensitive name/description search
- `category`
- `minPrice`, `maxPrice`
- `featured=true|false`
- `bestSeller=true|false`
- `sort` - `newest`, `price_asc`, `price_desc`, `name_asc`
- `page` (default `1`) and `limit` (default `12`, maximum `60`)

Registration always creates a `customer`. Administrators are created through `/admin/register` or through the seed script.

## Checkout behaviour

Checkout is intentionally a front-end demonstration:

1. The form validates name, email, street address, city, postal code, and country.
2. A local order number such as `SS-12345678` is generated.
3. The cart is cleared and a confirmation screen is shown.
4. The confirmation states that no payment, email, or dispatch occurs.

There are no orders, payments, inventory deductions, or webhooks on the backend. This is documented in the UI so the project is not mistaken for a production commerce system.

## Deployment

The deployment is environment-driven: commit the repository, create the Render backend first, then the Vercel frontend. No placeholder URL needs editing.

### 1. Database

1. Create a MongoDB Atlas cluster and database user.
2. Add network access. Render uses dynamic egress addresses, so use `0.0.0.0/0` unless you have a static outbound IP. Rely on a strong database password and keep the connection string private.
3. Copy the SRV connection string for `MONGO_URI`.

### 2. Backend on Render

The repository includes `render.yaml` with the correct root directory, build, start, health check, and environment defaults.

1. In Render, create a **Blueprint** from the repository (or a Web Service with root directory `backend`).
2. Confirm: build `npm ci --omit=dev`, start `npm start`, health check `/api/health`, Node 22.
3. Set the secret environment values:

```text
MONGO_URI=mongodb+srv://...
CLIENT_URL=https://<your-vercel-production-domain>
```

`JWT_SECRET` is generated automatically. `COOKIE_SAME_SITE=lax` and `ALLOW_ADMIN_REGISTRATION=false` are set by the blueprint. Optionally add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` for uploads.

4. Deploy and note the service origin, for example `https://shopsphere-api.onrender.com`.
5. Seed products from the Render shell:

```bash
npm run seed:products
```

6. Create the first administrator from the Render shell. Public admin registration is disabled in production:

```bash
ADMIN_NAME="ShopSphere Admin" ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="a-strong-password" npm run seed:admin
```

Alternatively, temporarily set `ALLOW_ADMIN_REGISTRATION=true`, create the account at `/admin/register`, then set it back to `false` and redeploy.

### 3. Frontend on Vercel

1. Import the repository and set **Root Directory** to `frontend`.
2. Framework preset: Vite. The committed `frontend/vercel.json` supplies the build command, output directory, `/api` proxy, and SPA fallback.
3. Add these Vercel environment variables for Production (and Preview if needed):

```text
BACKEND_URL=https://<your-render-service>.onrender.com
VITE_ALLOW_ADMIN_REGISTRATION=false
```

`BACKEND_URL` must be the bare Render origin with no trailing slash and no `/api` suffix. Do **not** set `VITE_API_URL`.

4. Deploy. Vercel proxies `/api/*` to `${BACKEND_URL}/api/*` at request time, so the browser stays on the Vercel origin and the httpOnly `SameSite=Lax` cookie works.
5. Return to Render and set `CLIENT_URL` to the final Vercel production origin. For authenticated previews, use a comma-separated list of the exact origins, then redeploy the backend.

### 4. Verify the deployment

1. Open `https://<your-vercel-domain>/api/health`; it should return `200` with `database: "connected"`.
2. Load the storefront and check products and categories.
3. Sign in as the seeded administrator at `/admin/login`.
4. Confirm `/admin/register` redirects to the login page when registration is disabled.
5. Upload or paste a product image if Cloudinary is configured.

Using the Vercel proxy keeps API requests same-origin in the browser. Pointing the frontend directly at Render with `VITE_API_URL` requires `COOKIE_SAME_SITE=none` plus HTTPS, and third-party cookie blocking can still break authentication in Safari. Preview deployments have unique origins, so add each one to `CLIENT_URL` when you need auth there.

## Testing

```bash
cd backend
npm test
```

The suite covers authentication, admin registration, production registration gating, CORS, health checks, role protection, product validation, search/filter/sort/pagination, category aggregation, dashboard statistics, CRUD, and upload validation (27 tests). The first run may download the MongoDB Memory Server binary.

```bash
cd frontend
npm run lint
npm run build
```

## Design notes

- Strict zero border radius via Tailwind theme token resets and base styles
- Palette: paper `#FFFFFF`, surface `#F5F5F3`, ink `#171717`, muted `#737373`, line `#E5E5E5`, accent `#1F3A32`, success `#287A50`, danger `#D14343`
- Inter for UI text, Manrope for display headings, self-hosted through Fontsource
- Skip link, visible focus rings, labelled controls, keyboard-closable dialogs and menus, reduced-motion support
- Client-side filtering state is mirrored in the URL so shop links are shareable
- Cart persists under `shopsphere_cart_v1` and re-syncs stock when product data changes

## Known limitations

- Checkout is a demo; there is no order, payment, or email backend
- No customer account dashboard, wishlist, reviews, or discount codes
- No automated frontend unit/e2e test suite is committed; visual checks were performed with Puppeteer during development
- Product seed images use Unsplash URLs and need network access
- Cloudinary uploads require valid credentials; otherwise use an image URL
- The free Render plan may spin down after inactivity, making the first API request slow

## License

MIT
