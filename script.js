document.documentElement.classList.add('js');

const menuToggle = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-nav]');

const closeMenu = () => {
  if (!menuToggle || !navigation) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
  document.body.classList.remove('menu-open');
};

if (menuToggle && navigation) {
  menuToggle.addEventListener('click', () => {
    const nextOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(nextOpen));
    navigation.classList.toggle('is-open', nextOpen);
    document.body.classList.toggle('menu-open', nextOpen);
  });

  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuToggle.focus();
    }
  });
}

const heroVideo = document.querySelector('[data-hero-video]');
const videoControl = document.querySelector('[data-video-control]');
const videoControlLabel = document.querySelector('[data-video-control-label]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroVideo && videoControl && videoControlLabel) {
  const setVideoState = (paused) => {
    videoControl.setAttribute('aria-pressed', String(paused));
    videoControlLabel.textContent = paused ? 'Play background' : 'Pause background';
  };

  if (reduceMotion) {
    heroVideo.pause();
    setVideoState(true);
  }

  videoControl.addEventListener('click', () => {
    if (heroVideo.paused) {
      heroVideo.play().then(() => setVideoState(false)).catch(() => setVideoState(true));
    } else {
      heroVideo.pause();
      setVideoState(true);
    }
  });

  heroVideo.addEventListener('pause', () => setVideoState(true));
  heroVideo.addEventListener('play', () => setVideoState(false));
}
