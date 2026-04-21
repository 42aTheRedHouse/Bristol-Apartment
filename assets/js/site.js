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
