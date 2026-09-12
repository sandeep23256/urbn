# URBN Lab

A small-batch sneaker store. Products are shown in an interactive 3D viewer
before checkout, and the homepage opens with a rotating 3D sole-stack instead
of a static hero image.

Stack: **Next.js (App Router) + Tailwind CSS + React Three Fiber** on the
frontend, **Express + MongoDB (Mongoose)** on the backend, **Stripe** for
payments.

```
urbn/
├── client/     Next.js app (deploy to Vercel)
└── server/     Express API (deploy to Render)
```

## Features

- Product catalog with search, sort, and category filters
- 3D product viewer (drag to rotate, scroll to zoom) — supports a real `.glb`
  model per product, or falls back to a placeholder shape if none is set
- 3D animated hero on the homepage
- Auth (JWT), cart (persisted client-side with Zustand), wishlist
- Checkout via Stripe Checkout Sessions, with a webhook that marks orders
  paid and decrements stock
- Reviews with a 1-per-user-per-product rating average
- Admin dashboard: revenue/order/product stats, product CRUD, order status
  updates

## Running it locally

### 1. Backend

```bash
cd server
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, STRIPE keys
npm install
npm run dev                # http://localhost:5000
node src/seed.js           # optional: adds 3 demo sneakers
```

`MONGO_URI` — easiest is a free [MongoDB Atlas](https://www.mongodb.com/atlas)
cluster; local `mongodb://` also works if you have Mongo running.

### 2. Frontend

```bash
cd client
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev                        # http://localhost:3000
```

### 3. Make yourself an admin

Register a normal account through the UI, then in MongoDB (Atlas UI or
`mongosh`) flip that user's role:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

### 4. Google Sign-In (optional)

Without any setup, the "Continue with Google" button on `/login` and
`/register` runs in **demo mode** — it logs into one fixed placeholder
account (`demo.google@urbnlab.dev`) via `POST /api/auth/demo-google`, so the
feature is visible and clickable without needing real Google credentials.
This is fine for local development or a portfolio demo, but **replace it
before showing this to anyone as a real product** — see the trade-offs
section at the bottom.

To enable real Google Sign-In:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   → Create Credentials → OAuth Client ID → Web application. This step is
   free and doesn't need a billing account — if a "start free trial" /
   billing prompt appears, skip it; it's unrelated to creating credentials.
2. Under **Authorized JavaScript origins**, add `http://localhost:3000` (and
   your Vercel URL once deployed).
3. Copy the generated Client ID.
4. Add it to **both**:
   - `server/.env` → `GOOGLE_CLIENT_ID=...`
   - `client/.env.local` → `NEXT_PUBLIC_GOOGLE_CLIENT_ID=...` (same value)
5. Restart both dev servers. The button automatically switches from demo
   mode to Google's real Sign-In button once the client ID is set.

## Deploying

### Backend → Render

1. Push this repo to GitHub.
2. On Render: **New → Web Service**, connect the repo, set root directory to
   `server`.
3. Build command: `npm install` · Start command: `npm start`.
4. Add environment variables from `server/.env.example` (real values —
   Atlas URI, JWT secret, Stripe keys, and `CLIENT_URL` set to your Vercel URL
   once you have it).
5. Deploy. Note the Render URL, e.g. `https://urbn-api.onrender.com`.

### Frontend → Vercel

1. On Vercel: **New Project**, import the repo, set root directory to
   `client`.
2. **Important — Framework Preset must be "Next.js"**, not "Other". If Vercel
   auto-detects wrong, set it manually under Project Settings → General.
3. Add environment variable `NEXT_PUBLIC_API_URL` = `https://urbn-api.onrender.com/api`
   (your Render URL from above).
4. Deploy. Then go back to Render and update `CLIENT_URL` to your final
   Vercel URL, so CORS allows it.

### Stripe webhook

Stripe needs to reach your **deployed** backend to confirm payment — it
can't call `localhost`.

1. In the Stripe Dashboard → Developers → Webhooks → Add endpoint:
   `https://urbn-api.onrender.com/api/orders/webhook`
2. Select event: `checkout.session.completed`.
3. Copy the signing secret into Render's `STRIPE_WEBHOOK_SECRET` env var.
4. For local testing instead, use the Stripe CLI:
   `stripe listen --forward-to localhost:5000/api/orders/webhook`

## Notes on the 3D viewer

`Product.model3d` is a plain URL to a `.glb` file. If you have real 3D scans
of the sneakers, upload the `.glb` to Cloudinary (raw upload) or any static
host and paste the URL into the admin product form. Until then, the viewer
shows a stylised placeholder shoe shape so the page never looks broken.

## Known trade-offs (worth knowing before an interview walkthrough)

- If Stripe checkout fails (e.g. keys not configured yet), the checkout page
  offers a **Demo Payment** button that completes the order immediately
  without any real payment — same stock checks and re-pricing as the real
  flow, just no money moves. Fine for showing the app end-to-end during
  development; swap in working Stripe keys before treating this as a real
  store (see Stripe setup above).
- Google Sign-In runs in demo mode by default (see setup section above) — it
  logs into one shared placeholder account rather than verifying a real
  Google identity. Fine for a demo, but swap in a real Client ID before
  treating this as production auth.
- Cart lives in browser storage (Zustand + localStorage), not the database —
  fine for a single-session shopper, but it won't sync across devices.
- Prices are always re-read from MongoDB at checkout time, never trusted from
  the client — this is the one place a shortcut here would be a real security
  bug.
- No image upload UI in the admin panel yet; product images are pasted as
  URLs. Adding Cloudinary's upload widget would be the natural next step.
