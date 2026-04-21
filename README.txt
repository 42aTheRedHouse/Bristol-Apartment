# The Red House website

Static website package for GitHub Pages.

## What is included
- index.html
- stay.html
- location.html
- contact.html
- assets/css/styles.css
- assets/js/site.js
- robots.txt
- sitemap.xml

## Image handling
This site expects the JPG/JPEG files to sit in the **repo root** alongside the HTML files.
The image filenames are referenced exactly as supplied, including spaces.

## Before publishing
1. Upload the site files to the repository root.
2. Keep the image files in the root as they are now.
3. Replace the placeholder GitHub Pages URL in:
   - every HTML file (`42atheredhouse.github.io/Bristol-Apartment`)
   - sitemap.xml
   - robots.txt
4. Enable GitHub Pages for the repo.

## Contact details already wired in
- Email: 42aredhouse@gmail.com
- Phone / WhatsApp: 07495 944426
- Airbnb listing link: https://www.airbnb.co.uk/rooms/1425422079046870858
- Airbnb iCal feed: https://www.airbnb.co.uk/calendar/ical/1425422079046870858.ics?t=6ffb9995979742ffa3e7697422e4d368

## Notes
- The contact form is static. It opens the visitor's email app with a prepared message.
- Name and email are required. Phone is optional.
- The site is mobile-first and scales up cleanly for tablets, desktops, and large screens.


Version 3 adds:
- availability.html with a best-effort live Airbnb iCal calendar and fallback state
- simplified location page using theredhouselocation.jpg
