// Mobile nav overlay
const menuBtn = document.querySelector('.nav-menu-btn');
const mobileNav = document.getElementById('mobileNav');
if (menuBtn && mobileNav) {
  menuBtn.addEventListener('click', () => {
    mobileNav.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
  });
  mobileNav.addEventListener('click', (event) => {
    if (event.target.closest('.mobile-nav-close') || event.target.closest('a')) {
      mobileNav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// Open external links in a new tab
document.querySelectorAll('a[href^="http"]').forEach((link) => {
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer');
});

// Lightbox for gallery images
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

// Reveal-on-scroll animation
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
