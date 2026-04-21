const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    if (!name || !email) return;

    const phone = String(data.get('phone') || '').trim();
    const arrival = String(data.get('arrival') || '').trim();
    const departure = String(data.get('departure') || '').trim();
    const guests = String(data.get('guests') || '').trim();
    const message = String(data.get('message') || '').trim();

    const lines = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || 'Not given'}`,
      `Arrival date: ${arrival || 'Not given'}`,
      `Departure date: ${departure || 'Not given'}`,
      `Guest count: ${guests || 'Not given'}`,
      '',
      'Message:',
      message || 'Not given'
    ];

    const subject = encodeURIComponent('Availability enquiry for The Red House');
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = `mailto:42aredhouse@gmail.com?subject=${subject}&body=${body}`;
  });
}


document.querySelectorAll('a[href^="http"]').forEach((link) => {
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer');
});

const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = '<div class="lightbox-inner"><button class="lightbox-close" type="button" aria-label="Close image">×</button><img alt=""></div>';
document.body.appendChild(lightbox);
const lightboxImg = lightbox.querySelector('img');
const closeLightbox = () => lightbox.classList.remove('is-open');
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox || event.target.classList.contains('lightbox-close')) closeLightbox();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLightbox();
});
document.querySelectorAll('.zoom-link').forEach((link) => {
  const img = link.querySelector('img');
  if (!img) return;
  link.href = img.getAttribute('src');
  link.setAttribute('aria-label', 'Open larger image');
  link.addEventListener('click', (event) => {
    event.preventDefault();
    lightboxImg.src = img.getAttribute('src');
    lightboxImg.alt = img.getAttribute('alt') || '';
    lightbox.classList.add('is-open');
  });
});


function parseIcsEvents(icsText) {
  const events = [];
  const blocks = icsText.split('BEGIN:VEVENT').slice(1);
  blocks.forEach((block) => {
    const dtstart = (block.match(/DTSTART(?:;VALUE=DATE)?:(\d{8})/) || [])[1];
    const dtend = (block.match(/DTEND(?:;VALUE=DATE)?:(\d{8})/) || [])[1];
    if (!dtstart || !dtend) return;
    const start = new Date(Date.UTC(Number(dtstart.slice(0,4)), Number(dtstart.slice(4,6)) - 1, Number(dtstart.slice(6,8))));
    const end = new Date(Date.UTC(Number(dtend.slice(0,4)), Number(dtend.slice(4,6)) - 1, Number(dtend.slice(6,8))));
    events.push({ start, end });
  });
  return events;
}

function isoDateUTC(date) {
  return date.toISOString().slice(0, 10);
}

function buildCalendar(container, bookedDates) {
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const today = new Date();
  const startBase = new Date(today.getFullYear(), today.getMonth(), 1);
  for (let offset = 0; offset < 2; offset++) {
    const monthStart = new Date(startBase.getFullYear(), startBase.getMonth() + offset, 1);
    const monthEnd = new Date(startBase.getFullYear(), startBase.getMonth() + offset + 1, 0);
    const card = document.createElement('section');
    card.className = 'calendar-month';
    const heading = document.createElement('h3');
    heading.textContent = `${monthNames[monthStart.getMonth()]} ${monthStart.getFullYear()}`;
    card.appendChild(heading);
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';
    dayNames.forEach((name) => {
      const label = document.createElement('div');
      label.className = 'calendar-dayname';
      label.textContent = name;
      grid.appendChild(label);
    });
    const weekdayOffset = (monthStart.getDay() + 6) % 7;
    for (let i = 0; i < weekdayOffset; i++) {
      const blank = document.createElement('div');
      blank.className = 'calendar-day is-blank';
      grid.appendChild(blank);
    }
    for (let day = 1; day <= monthEnd.getDate(); day++) {
      const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
      const key = isoDateUTC(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      if (bookedDates.has(key)) cell.classList.add('is-booked');
      if (date.toDateString() === today.toDateString()) cell.classList.add('is-today');
      cell.textContent = String(day);
      grid.appendChild(cell);
    }
    card.appendChild(grid);
    container.appendChild(card);
  }
}

(async function initAvailability() {
  const status = document.getElementById('availability-status');
  const wrap = document.getElementById('calendar-wrap');
  const fallback = document.getElementById('availability-fallback');
  if (!status || !wrap || !fallback) return;
  const icsUrl = 'https://www.airbnb.co.uk/calendar/ical/1425422079046870858.ics?t=6ffb9995979742ffa3e7697422e4d368';
  try {
    const response = await fetch(icsUrl, { mode: 'cors' });
    if (!response.ok) throw new Error('Calendar request failed');
    const text = await response.text();
    const events = parseIcsEvents(text);
    if (!events.length) throw new Error('No calendar events found');
    const bookedDates = new Set();
    events.forEach(({ start, end }) => {
      const cursor = new Date(start.getTime());
      while (cursor < end) {
        bookedDates.add(isoDateUTC(cursor));
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
    });
    wrap.innerHTML = '';
    buildCalendar(wrap, bookedDates);
    status.textContent = 'Booked dates shown below. For anything close-in, please still check directly.';
    wrap.hidden = false;
  } catch (error) {
    status.textContent = 'Live calendar could not be loaded.';
    fallback.hidden = false;
  }
})();
