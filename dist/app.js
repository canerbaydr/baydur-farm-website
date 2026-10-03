const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#navigation');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Menüyü aç');
  navigation.classList.remove('is-open');
}));
const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
  lightboxImage.src = button.dataset.photo;
  lightboxImage.alt = button.querySelector('img').alt;
  document.querySelector('#lightbox-caption').textContent = button.dataset.caption;
  lightbox.showModal();
}));
document.querySelector('#close-lightbox').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => {
  if (event.target !== lightbox) return;
  const rect = lightbox.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) lightbox.close();
});
document.querySelector('#year').textContent = new Date().getFullYear();

const carousel = document.querySelector('.hero-carousel');
if (carousel) {
  const slides = [...carousel.querySelectorAll('.hero-slide')];
  const dots = [...carousel.querySelectorAll('[data-slide]')];
  const playback = carousel.querySelector('.hero-playback');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let paused = reducedMotion.matches;
  let hovering = false;
  let focused = false;
  let timer;
  const show = index => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
    });
    dots.forEach((dot, i) => {
      if (i === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    carousel.querySelector('#hero-slide-caption').textContent = slides[current].dataset.label;
    carousel.querySelector('#hero-slide-number').textContent = `${String(current + 1).padStart(2, '0')} / 04`;
  };
  const schedule = () => {
    clearInterval(timer);
    playback.textContent = paused ? '▶' : 'Ⅱ';
    playback.setAttribute('aria-label', paused ? 'Fotoğraf geçişini başlat' : 'Fotoğraf geçişini duraklat');
    if (!paused && !hovering && !focused && !document.hidden) timer = setInterval(() => show(current + 1), 3500);
  };
  carousel.querySelector('.hero-prev').addEventListener('click', () => { show(current - 1); schedule(); });
  carousel.querySelector('.hero-next').addEventListener('click', () => { show(current + 1); schedule(); });
  dots.forEach(dot => dot.addEventListener('click', () => { show(Number(dot.dataset.slide)); schedule(); }));
  playback.addEventListener('click', () => { paused = !paused; schedule(); });
  carousel.addEventListener('mouseenter', () => { hovering = true; schedule(); });
  carousel.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  carousel.addEventListener('focusin', () => { focused = true; schedule(); });
  carousel.addEventListener('focusout', event => { focused = carousel.contains(event.relatedTarget); schedule(); });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', event => { paused = event.matches; schedule(); });
  schedule();
}
