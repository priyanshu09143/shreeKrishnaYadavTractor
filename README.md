# Shree Krishna Yadav Tractors

Sell-only lead-gen site (bilingual Hindi/English): farmers submit their
tractor via a form right on the homepage, admin reviews it internally and
calls with an offer. There is no public buying/browsing — this is not a
marketplace.

## Structure

One `package.json`, one `node_modules`, one `.env`, one Express server, one
port — but the code stays split by concern:

```
server.js            single entry point: one express() instance, Mongo
                      connect + seed, session + locals middleware, mounts
                      backend routes then frontend routes, error handlers
config/
  db.js               Mongo connection (getDb, ObjectId, serialize)
  contact.js           site-wide CONTACT constant (phone/email/maps/address)
utils/
  icons.js             inline SVG icon set used by the EJS views
  i18n.js               strings.hi / strings.en, CONDITIONS, LOCATIONS, makeT
backend/              API only — nothing here renders HTML
  routes.js            registers /api/* and /uploads/* onto the shared app
  routes/               auth.js, tractors.js, services.js, contact.js
  middleware/auth.js     JWT check (Authorization header) for admin API calls
  seed.js                seeds the admin account + 3 default services
  uploads/                tractor photo uploads land here
frontend/              pages only — nothing here touches Mongo directly
  routes.js             registers every page route onto the shared app
  api.js                 fetch() wrapper that calls this same server's /api/*
  brands.js, reviews.js   static data for the homepage
  middleware/auth.js      session-cookie check for admin pages
  views/                   EJS templates
  public/                   css/img served as static files
```

Backend code only ever talks to MongoDB; frontend code only ever talks to the
backend through `frontend/api.js` (an HTTP call to its own `/api/*`, same
process, same port) — so the two stay decoupled even though they run
together. `server.js` is the only file that knows about both.

## Running it

```
npm install
npm start        # http://localhost:3000 — serves pages AND /api/*
```

All data (tractor listings, services, contact messages, the admin account)
lives in MongoDB — connection string in `.env` as `MONGO_URL` /
`MONGO_DB_NAME`. On first boot it seeds the admin account and the 3 default
services if the collections are empty (`backend/seed.js`). Admin login
defaults to `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`
(`shreekrishnayadav@gmail.com` / `Admin@123`) — change the password before
deploying, and never commit `.env` (it has real Mongo credentials).

Contact details (phone/email/maps link/address) shown across the site live in
`config/contact.js`. The address was derived from the pinned map location via
reverse geocoding; double check it's the exact shop address and correct it if
not. Static testimonials live in `frontend/reviews.js`.

The "brands we buy" marquee on the homepage uses real logo files in
`frontend/public/img/brands/`, listed in `frontend/brands.js`
(`BRAND_LOGOS`). Sourced from freely-licensed Wikimedia Commons uploads,
except Swaraj which is pulled from swarajtractors.com's own site (their
official logo, used to identify a brand this business deals in — standard
nominative use). To swap a logo, drop a new file in that folder and update
its `file` entry in `brands.js`.

`/services` has the same layout pattern: a hero contact form at the top
(name/phone/email/message **plus a service dropdown** populated live from the
`services` collection), a finance/insurance partner-logo marquee
(`frontend/partners.js` → `PARTNER_LOGOS`, files in
`frontend/public/img/partners/`), then the services grid and a reviews
section. **The partner logos are placeholders** — commonly recognised Indian
bank/NBFC/insurer names (SBI, HDFC Bank, ICICI Bank, Bajaj Finserv, Mahindra
Finance, HDFC ERGO, Tata AIG), not confirmed tie-ups. Confirm actual partners
before launch and edit `PARTNER_LOGOS` accordingly (remove any that aren't
real partnerships — showing a company's logo implies an association with
them). Submissions from this form land in the same `contact_messages`
collection as the `/contact` page, with the selected service in the
`service` field, visible in `/admin/messages`.

Pages: `/` (hero with the sell form at the top, why-sell-to-us benefits, a
3-step process, brands-we-buy, and customer reviews), `/about`, `/services`
(dynamic, see below), `/contact` (form + info card, plus a floating WhatsApp
button on every page), `/terms`. A हिं/EN toggle in the header
(`GET /lang/:code`) switches the whole site — stored in the session cookie,
no page-specific URLs. All UI strings live in `utils/i18n.js`
(`strings.hi` / `strings.en`); add a new one by adding the key to both and
calling `<%= t('key') %>` in the view.

**Services** (Insurance, RTO Transfer, Finance, seeded by default) are stored
in the `services` collection with separate `title_hi`/`title_en`/
`description_hi`/`description_en` fields, and are fully manageable from
`/admin/services` — add, edit or delete, no code change needed.

**Contact form** submissions go straight to the `contact_messages` collection
and show up at `/admin/messages` (mark as read).

Every page is rendered to plain HTML on the server (no client-side
framework), with `<title>`/meta description/canonical/OG tags (`lang`
attribute follows the current language), plus `/sitemap.xml` and
`/robots.txt`.

## Flow

1. A farmer fills in the form at the top of the homepage — tractor details
   plus their own name/phone — no account or login needed (status: `pending`).
2. Admin logs in at `/login` (not linked from the public site — go there
   directly), which redirects to **`/admin/dashboard`**. The admin area has
   three tabs: **Tractor Listings** (`/admin/dashboard`, sets an offer price,
   approves/rejects/marks purchased — purely internal tracking, nothing
   becomes publicly visible after approval), **Services**
   (`/admin/services`), and **Messages** (`/admin/messages`). Visiting the
   bare `/admin` redirects to `/admin/dashboard`.
