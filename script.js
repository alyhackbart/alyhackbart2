const media = window.ALY_MEDIA || {};

document.querySelectorAll('[data-media]').forEach((element) => {
  const key = element.getAttribute('data-media');
  if (key && media[key]) element.src = media[key];
});

const embeddedReel = document.querySelector('[data-reel]');
if (embeddedReel instanceof HTMLVideoElement) {
  if (media.hero) embeddedReel.poster = media.hero;
  if (media.reel) {
    embeddedReel.src = media.reel;
    embeddedReel.load();
  }
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');

if (toggle && nav) {
  const closeMenu = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Menu';
  };

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
  });

  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

const reel = document.querySelector('[data-reel]');
const reelToggle = document.querySelector('.video-toggle');

if (reel instanceof HTMLVideoElement && reelToggle) {
  const updateToggle = () => {
    const paused = reel.paused;
    reelToggle.textContent = paused ? 'Play reel' : 'Pause reel';
    reelToggle.setAttribute('aria-pressed', String(paused));
  };

  const setPlayback = (shouldPlay) => {
    if (!shouldPlay) {
      reel.pause();
      updateToggle();
      return;
    }

    const playRequest = reel.play();
    if (playRequest instanceof Promise) {
      playRequest.catch(updateToggle);
    }
  };

  reelToggle.addEventListener('click', () => setPlayback(reel.paused));
  reel.addEventListener('play', updateToggle);
  reel.addEventListener('pause', updateToggle);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  setPlayback(!reduceMotion.matches);
  reduceMotion.addEventListener?.('change', (event) => setPlayback(!event.matches));
}

const projectType = document.getElementById('project-type');
document.querySelectorAll('[data-package]').forEach((link) => {
  link.addEventListener('click', () => {
    if (!projectType) return;
    const packageName = link.getAttribute('data-package');
    const option = Array.from(projectType.options).find((item) => item.value === packageName || item.textContent.trim() === packageName);
    if (option) projectType.value = option.value;
  });
});
const inquiryForm = document.querySelector('.inquiry-form');
if (inquiryForm) {
  inquiryForm.addEventListener('submit', () => {
    const submitButton = inquiryForm.querySelector('.submit-button');
    if (!submitButton) return;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending inquiry...';
  });
}
