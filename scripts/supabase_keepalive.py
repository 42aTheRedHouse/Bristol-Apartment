"""Ping the Supabase project so it never auto-pauses from inactivity.

Supabase's free tier pauses a project after 7 days with no real database
activity (dashboard visits do not count). Run by the GitHub Action in
.github/workflows/supabase-keepalive.yml a couple of times a week -
comfortably inside that 7-day window even if a run or two is missed.

A plain read against a real table is what counts as "activity" - it
does not need to find any rows, it just needs the database engine to
genuinely run the query (which happens even if Row Level Security then
filters every row out, exactly as it does here with the anon key).

Needs SUPABASE_URL and SUPABASE_ANON_KEY as environment variables.
Uses only the Python standard library.
"""

import json
import os
import sys
import urllib.request

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").strip()
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "").strip()


def main():
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("SUPABASE_URL / SUPABASE_ANON_KEY not set - nothing to ping.")
        return 0

    url = SUPABASE_URL.rstrip("/") + "/rest/v1/admins?select=email&limit=1"
    req = urllib.request.Request(
        url,
        headers={
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": "Bearer " + SUPABASE_ANON_KEY,
            "User-Agent": "RedHouse-Supabase-Keepalive/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            print(f"Keepalive ping OK - HTTP {resp.status} - {body[:200]}")
            return 0
    except urllib.error.HTTPError as e:
        # Even an error response (e.g. table missing) still reaches the
        # database and counts as activity - only a network failure is a
        # real problem.
        print(f"Keepalive ping reached Supabase but got HTTP {e.code}: {e.read().decode('utf-8', errors='replace')[:200]}")
        return 0
    except Exception as e:
        print(f"ERROR: keepalive ping failed to reach Supabase at all: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
