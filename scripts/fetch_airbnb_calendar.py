"""Fetch booking calendar feeds (iCal) and write availability.json.

Run by the GitHub Action in .github/workflows/sync-calendar.yml every hour.

Environment variables:
  AIRBNB_ICAL_URL   the host's calendar export link from Airbnb
                    (Calendar -> Availability -> Connect calendars -> Export)
  EXTRA_ICAL_URLS   optional: more feeds to merge in, separated by spaces
                    or newlines (e.g. the booking.com export link). Needed
                    because Airbnb does NOT re-export dates it imported from
                    other platforms, so those must be read at the source.

Uses only the Python standard library so it runs anywhere without installs.
"""

import json
import os
import sys
import urllib.request
from datetime import datetime, timezone

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "..", "availability.json")


def unfold(lines):
    """Join iCal continuation lines (lines starting with a space/tab)."""
    out = []
    for line in lines:
        if line[:1] in (" ", "\t") and out:
            out[-1] += line[1:]
        else:
            out.append(line)
    return out


def parse_ical_date(value):
    """Turn an iCal date like 20260706 (or 20260706T140000Z) into 2026-07-06."""
    digits = value.strip()[:8]
    return f"{digits[0:4]}-{digits[4:6]}-{digits[6:8]}"


def parse_events(text):
    """Return a list of {start, end} date ranges from VEVENT blocks.

    In Airbnb's export, DTSTART is the first booked night and DTEND is the
    checkout day (exclusive), which is exactly what the website widget expects.
    """
    ranges = []
    in_event = False
    start = end = None
    for line in unfold(text.splitlines()):
        line = line.strip()
        if line == "BEGIN:VEVENT":
            in_event, start, end = True, None, None
        elif line == "END:VEVENT":
            if in_event and start and end and end > start:
                ranges.append({"start": start, "end": end})
            in_event = False
        elif in_event and line.startswith("DTSTART"):
            start = parse_ical_date(line.split(":", 1)[1])
        elif in_event and line.startswith("DTEND"):
            end = parse_ical_date(line.split(":", 1)[1])
    return merge_ranges(ranges)


def merge_ranges(ranges):
    """Merge overlapping or touching date ranges into a minimal sorted list."""
    merged = []
    for r in sorted(ranges, key=lambda r: r["start"]):
        if merged and r["start"] <= merged[-1]["end"]:
            merged[-1]["end"] = max(merged[-1]["end"], r["end"])
        else:
            merged.append(dict(r))
    return merged


def fetch_feed(url):
    req = urllib.request.Request(url, headers={"User-Agent": "RedHouse-Calendar-Sync/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def main():
    urls = []
    airbnb_url = os.environ.get("AIRBNB_ICAL_URL", "").strip()
    if airbnb_url:
        urls.append(airbnb_url)
    for extra in os.environ.get("EXTRA_ICAL_URLS", "").split():
        if extra.strip():
            urls.append(extra.strip())

    if not urls:
        print("AIRBNB_ICAL_URL is not set - nothing to do (calendar not connected yet).")
        return 0

    all_ranges = []
    for url in urls:
        text = fetch_feed(url)
        if "BEGIN:VCALENDAR" not in text:
            print(f"ERROR: feed does not look like an iCal calendar - check the URL ending ...{url[-25:]}")
            return 1
        ranges = parse_events(text)
        print(f"Feed ...{url[-25:]}: {len(ranges)} booked range(s)")
        all_ranges.extend(ranges)

    booked = merge_ranges(all_ranges)
    data = {
        "connected": True,
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "ical" if len(urls) > 1 else "airbnb-ical",
        "feeds": len(urls),
        "booked": booked,
    }
    with open(os.path.abspath(OUTPUT_FILE), "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        f.write("\n")
    print(f"Wrote {len(booked)} booked range(s) to availability.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
