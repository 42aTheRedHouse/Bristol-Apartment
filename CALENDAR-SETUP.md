# Availability calendar — how to switch it on

The site has an Availability page (`availability.html`) that shows a live
calendar of booked/free dates. The data comes from Airbnb's free "calendar
export" link, fetched automatically every hour by a GitHub Action. No third
party service, no fees, nothing to install.

Until it is connected, the page shows a friendly "calendar being connected"
notice instead of dates, so it is safe to publish as-is.

## One-time setup (about 5 minutes)

### Step 1 — Get the calendar export link from Airbnb

1. Log in to Airbnb as the host and open **Calendar** for the listing.
2. Open **Availability** settings (on the website: Calendar → Availability →
   scroll to **Connect calendars**).
3. Choose **Export calendar**. Airbnb shows a link ending in `.ics` —
   copy it. (Treat it like a password: anyone with the link can see
   booked dates.)

### Step 2 — Give the link to GitHub

1. Go to the repo on GitHub → **Settings** → **Secrets and variables** →
   **Actions** → **New repository secret**.
2. Name: `AIRBNB_ICAL_URL`
3. Value: paste the `.ics` link. Save.

### Step 2b — Also add the booking.com calendar (important)

Airbnb's export deliberately leaves out dates it imported from other
platforms (to avoid sync loops), so booking.com reservations will NOT
appear via the Airbnb link alone. Add booking.com's own export link too:

1. Find the booking.com calendar link. Easiest place: in Airbnb's
   **Connect calendars** screen, open the active booking.com entry →
   **Edit** — the link it imports is shown there. (Or get it from the
   booking.com extranet: Rates & Availability → Calendar → Sync
   calendars → Export.)
2. Add it as a second GitHub secret named `EXTRA_ICAL_URLS`.
   If there is ever a Vrbo or other feed as well, put them in the same
   secret separated by spaces.

### Step 3 — Run it once

1. Go to the repo's **Actions** tab → **Sync Airbnb calendar** →
   **Run workflow**.
2. After ~30 seconds it commits an updated `availability.json` and the
   Availability page goes live. From then on it refreshes itself hourly.

## How direct bookings work alongside it

1. Guest checks the Availability page, then calls/WhatsApps their dates.
2. You confirm the dates are free and agree the price.
3. Send a Stripe Payment Link (create once per price at stripe.com —
   no monthly fee, ~1.5% + 20p per UK card payment). Or take a bank
   transfer against an invoice for business bookings.
4. **Immediately block those dates in the Airbnb calendar** (open the
   Airbnb app → Calendar → select the dates → Block). This is the manual
   step that prevents double bookings — do it before anything else.
5. Within the hour, the website calendar updates itself to show the
   dates as taken (blocked dates appear in the export feed too).

## When the site moves to Hostinger

The sync script (`scripts/fetch_airbnb_calendar.py`) is plain Python with no
dependencies. Two options:

- Easiest: keep the GitHub Action running and have it push the file to
  Hostinger, or
- Run the same script on Hostinger with a scheduled task (cron) writing
  `availability.json` into the site folder.

Ask Claude to set either up when the time comes.
