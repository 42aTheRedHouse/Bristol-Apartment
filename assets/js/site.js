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
