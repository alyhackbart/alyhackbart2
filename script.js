document.documentElement.classList.add('js');

document.querySelectorAll('[data-form-started-at]').forEach((field) => {
  field.value = String(Date.now() / 1000);
});

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

const selectedVideo = document.querySelector('[data-segmented-video]');

if (selectedVideo) {
  let mediaUrl;

  const loadSelectedVideo = async () => {
    try {
      const segments = JSON.parse(selectedVideo.dataset.segments || '[]');
      if (!segments.length) return;

      const segmentResponses = await Promise.all(segments.map(async (segmentUrl) => {
        const response = await fetch(segmentUrl);
        if (!response.ok) throw new Error('A video segment could not be downloaded.');
        return response.arrayBuffer();
      }));

      mediaUrl = URL.createObjectURL(new Blob(segmentResponses, { type: 'video/mp4' }));
      selectedVideo.src = mediaUrl;
      selectedVideo.muted = true;
      await selectedVideo.play().catch(() => {});
    } catch (error) {
      selectedVideo.controls = true;
    }
  };

  loadSelectedVideo();
  window.addEventListener('pagehide', () => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
  }, { once: true });
}
