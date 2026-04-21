document.querySelectorAll('a[href*="wa.me"]').forEach((a)=>a.classList.add('btn-whatsapp','whatsapp-link'));
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
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
