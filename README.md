# EAAChecker

A free WCAG 2.1 AA / EU Accessibility Act compliance scanner for websites, with an
AI-generated plain-language report and a paid monthly subscription for the full
report, PDF export, accessibility statement drafts, and automatic re-scans.

## Architecture

```
frontend/   React 19 + Vite + Tailwind CSS v4 — the marketing site, scan form,
            report page, auth pages, dashboard, pricing, and account pages.
backend/    Node.js + Express — scan pipeline (Playwright + axe-core +
            Lighthouse), Claude (Anthropic) report generation, Postgres via
            Prisma, Stripe subscriptions, SendGrid email, node-cron rescans.
```

Flow: paste a URL → backend validates it (SSRF guard) → Playwright loads the
page → axe-core + Lighthouse scan it → results are summarized and sent to
Claude for a plain-language report → score, top-5 issues, and a fine-risk
estimate are shown for free → a Stripe subscription unlocks the full 48-criteria
report, PDF, accessibility statement draft, and monthly automatic re-scans with
email alerts on regressions.

## Local development

### 1. Postgres

If you have Docker installed:

```bash
docker compose up -d
```

If you don't have Docker or Homebrew (e.g. a fresh Mac), use the bundled
Docker-free option instead — it downloads a real Postgres binary and runs it
in the foreground, no other install required:

```bash
cd backend
npm run db:local
```

Leave that running in its own terminal tab. Either way, `DATABASE_URL` in
`backend/.env` already points at `localhost:5432` with user/password
`eaachecker`/`eaachecker`, matching both options.

### 2. Backend

```bash
cd backend
npm install
npx playwright install chromium   # one-time, downloads a headless Chrome build
cp .env.example .env
# Edit .env — at minimum set a real ANTHROPIC_API_KEY. The free-scan AI summary
# call needs it even in local dev. Stripe/SendGrid can stay as dummy values
# until you're ready to test payments/email end-to-end.
npx prisma migrate dev
npm run dev
```

Backend runs on `http://localhost:4000`. `GET /health` should return `{"ok":true}`.

To smoke-test the scan pipeline in isolation (no database, no API keys needed):

```bash
npm run test:scan -- https://example.com
```

### 3. Stripe webhooks (local testing)

To test the Stripe subscription flow end-to-end locally, forward Stripe events to
your local backend with the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe login   # one-time, opens a browser to link your Stripe account
stripe listen --forward-to localhost:4000/api/billing/webhook
```

Copy the `whsec_...` signing secret it prints into `STRIPE_WEBHOOK_SECRET` in
`backend/.env`, then restart the backend. Leave `stripe listen` running in its
own terminal tab while you test — it needs to stay up for webhook events
(subscription created/updated/canceled, payment failed) to reach your backend.
You can also fire a one-off test event without a real checkout:

```bash
stripe trigger checkout.session.completed
```

### 4. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full list.
Notable ones:

- `ANTHROPIC_API_KEY` — required even for the free scan (Claude writes the
  plain-language summary). Everything else in the pipeline (URL validation,
  Playwright, axe-core, Lighthouse, scoring) works without any API keys.
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_ID` — needed to
  test the paid subscription flow. Use Stripe test-mode keys locally.
- `SENDGRID_API_KEY` — if left as the default dummy value, emails are logged to
  the console instead of sent, so local dev works without a SendGrid account.

## Deploying to Railway

This is a 3-service setup in one Railway project:

1. **Postgres** — add Railway's managed Postgres plugin. Copy its connection
   string into the backend service's `DATABASE_URL`.
2. **Backend** — new service, root directory `/backend`, start command
   `npm start`. Set all variables from `backend/.env.example` with real values
   (`NODE_ENV=production`, real `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`,
   `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `SENDGRID_API_KEY`,
   `SENDGRID_FROM_EMAIL`, `FRONTEND_URL` set to the deployed frontend URL).
   Run `npx prisma migrate deploy` once against the production database
   (Railway's one-off command / shell, or a release command).
3. **Frontend** — new service, root directory `/frontend`, build command
   `npm run build`, serve the `dist` output as a static site. Set
   `VITE_API_URL` to the deployed backend URL and `VITE_STRIPE_PUBLISHABLE_KEY`
   to your real Stripe publishable key.
4. **Stripe webhook** — in the Stripe dashboard, add an endpoint pointing at
   `https://<backend-domain>/api/billing/webhook`, subscribed to
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`, and `invoice.payment_failed`. Copy the
   signing secret into `STRIPE_WEBHOOK_SECRET`.

Nothing here has been deployed yet — these are the steps to follow when you're
ready to go live.

## What's intentionally out of scope for this MVP

- Programmatic SEO landing pages (a growth channel from the business plan, not
  part of the core product loop).
- Multiple pricing tiers — one Stripe price for now.
- Server-side rendering of report pages for deeper SEO — the report page sets
  its title/meta tags client-side, which is good enough to start with.
