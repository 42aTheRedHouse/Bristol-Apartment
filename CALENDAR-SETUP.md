# Availability calendar — how to switch it on

The site has an Availability page (`availability.html`) that shows a live
calendar of booked/free dates, merged from Airbnb, booking.com, and Vrbo.
Fetched automatically every hour by a GitHub Action. No third party
service, no fees, nothing to install.

Until at least one link is connected, the page shows a friendly "calendar
being connected" notice instead of dates, so it is safe to publish as-is.

## One-time setup (about 10 minutes)

Each platform gets its own named secret, so any one of them can be
replaced later without touching the others — worth knowing because these
export tokens have a habit of quietly expiring after a while.

### Airbnb

1. Log in to Airbnb as the host and open **Calendar** for the listing.
2. **Availability** → **Connect calendars** → **Export calendar**.
   Airbnb shows a link ending in `.ics` — copy it. (Treat it like a
   password: anyone with the link can see booked dates.)
3. GitHub repo → **Settings** → **Secrets and variables** → **Actions** →
   **New repository secret** → name `AIRBNB_ICAL_URL`, paste the link, Save.

### booking.com (important — Airbnb's export omits these dates)

Airbnb deliberately leaves out dates it imported from other platforms (to
avoid sync loops), so booking.com reservations will NOT appear via the
Airbnb link alone.

1. booking.com Extranet → **Rates & Availability** → **Sync calendars**.
2. Click **Add calendar connection** → **Skip to export** (this is
   different from the main import flow — you want *your own* calendar
   link out, not to paste someone else's in).
3. Give it a clear name (e.g. "Website") and confirm — this generates a
   link ending in `.ics` or containing `ical`.
4. Add it as a GitHub secret named `BOOKING_ICAL_URL`.

### Vrbo

1. Vrbo Owner Dashboard → **Calendar** → **Settings** → **Availability**
   tab → **Connect calendars** → **Export calendar** → **Copy URL**.
   Double-check the link contains "icalendar" — Vrbo warns not to
   accidentally copy a different page URL instead.
2. Add it as a GitHub secret named `VRBO_ICAL_URL`.

### Run it once

1. Repo's **Actions** tab → **Sync Airbnb calendar** → **Run workflow**.
2. After ~30 seconds it commits an updated `availability.json` and the
   Availability page goes live. From then on it refreshes itself hourly.

## How direct bookings work alongside it

1. Guest checks the Availability page, then calls/WhatsApps their dates.
2. You confirm the dates are free and agree the price.
3. Send a Stripe Payment Link, or take a bank transfer against an
   invoice for business bookings.
4. **Immediately block those dates by hand on Airbnb, booking.com, AND
   Vrbo.** This is still a manual step for now — the website doesn't yet
   publish its own calendar for those platforms to import automatically
   (see the "reverse sync" note below). Do this before anything else.
5. Within the hour, the website calendar also updates itself to reflect
   whatever's now blocked across all three platforms.

## Reverse sync (website bookings → other platforms) — deliberately manual for now

There's currently no automatic path for a direct website booking to block
dates on Airbnb/booking.com/Vrbo — only the other direction (their
bookings → the website) is automated. Doing this properly would need the
site to publish its own outgoing calendar AND something to trigger
regenerating it the moment a Stripe payment clears (a webhook + small
backend) — deliberately not built yet, since website-direct booking
volume is expected to start low enough that manual blocking (step 4
above) isn't a real burden. Worth revisiting once volume grows, or
if the parked Supabase guest-portal backend (see
GUEST-PORTAL-SUPABASE-SETUP.md) ever gets finished — it could handle
the Stripe webhook and regenerate an outgoing feed from the same
database, solving both needs at once.

## Known gotcha: expiring export tokens

Each platform's own export link (especially booking.com's) seems to
occasionally go stale/invalid after a while, even though the connections
that *use* those links elsewhere (e.g. Vrbo importing booking.com) can
keep showing a healthy "OK" status regardless. If the Availability page
ever looks wrong or stops updating:

1. Check whether the relevant export link still returns real calendar
   data (paste it in a browser — it should download or show a `.ics`
   file, not an error).
2. If dead, regenerate a fresh one from the platform in question and
   update just that one GitHub secret — no code changes needed.

## When the site moves to Hostinger

The sync script (`scripts/fetch_airbnb_calendar.py`) is plain Python with no
dependencies. Two options:

- Easiest: keep the GitHub Action running and have it push the file to
  Hostinger, or
- Run the same script on Hostinger with a scheduled task (cron) writing
  `availability.json` into the site folder.

Ask Claude to set either up when the time comes.
