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

const selectedVideo = document.querySelector('[data-selected-video]');
const selectedVideoStatus = document.querySelector('[data-video-status]');
const selectedVideoControl = document.querySelector('[data-showcase-video-control]');
const selectedVideoLabel = document.querySelector('[data-showcase-video-label]');

if (selectedVideo) {
  let selectedVideoSources = [];
  try {
    selectedVideoSources = JSON.parse(selectedVideo.dataset.videoSources || '[]');
  } catch {
    selectedVideoSources = [];
  }

  let selectedVideoIndex = Math.max(
    0,
    selectedVideoSources.indexOf(selectedVideo.getAttribute('src')),
  );
  let selectedVideoRetryCount = 0;
  const maxSelectedVideoRetries = 2;

  const setSelectedVideoState = (paused) => {
    if (!selectedVideoControl || !selectedVideoLabel) return;
    selectedVideoControl.setAttribute('aria-pressed', String(paused));
    selectedVideoLabel.textContent = paused ? 'Play reel with sound' : 'Pause reel';
  };

  const showVideoError = () => {
    if (!selectedVideoStatus) return;
    selectedVideoStatus.textContent = 'This video could not load. Please refresh and try again.';
    selectedVideoStatus.hidden = false;
  };

  const playSelectedVideo = () => {
    selectedVideo.muted = false;
    selectedVideo.play().catch(() => setSelectedVideoState(true));
  };

  const hideVideoError = () => {
    if (selectedVideoStatus) selectedVideoStatus.hidden = true;
  };

  const advanceSelectedVideo = () => {
    if (!selectedVideoSources.length) {
      setSelectedVideoState(true);
      return;
    }

    selectedVideoIndex = (selectedVideoIndex + 1) % selectedVideoSources.length;
    selectedVideoRetryCount = 0;
    selectedVideo.src = selectedVideoSources[selectedVideoIndex];
    selectedVideo.load();
    if (!reduceMotion) {
      selectedVideo.addEventListener('canplay', playSelectedVideo, { once: true });
    }
  };

  if (reduceMotion) {
    selectedVideo.pause();
    setSelectedVideoState(true);
  } else {
    selectedVideo.muted = false;
    setSelectedVideoState(true);
  }

  if (selectedVideoControl) {
    selectedVideoControl.addEventListener('click', () => {
      if (selectedVideo.paused) {
        playSelectedVideo();
      } else {
        selectedVideo.pause();
      }
    });
  }

  selectedVideo.addEventListener('error', () => {
    if (selectedVideoRetryCount < maxSelectedVideoRetries) {
      selectedVideoRetryCount += 1;
      selectedVideo.src = selectedVideoSources[selectedVideoIndex];
      selectedVideo.load();
      selectedVideo.addEventListener('canplay', playSelectedVideo, { once: true });
      return;
    }

    showVideoError();
    setSelectedVideoState(true);
  });
  selectedVideo.addEventListener('canplay', hideVideoError);
  selectedVideo.addEventListener('play', () => {
    hideVideoError();
    setSelectedVideoState(false);
  });
  selectedVideo.addEventListener('pause', () => setSelectedVideoState(true));
  selectedVideo.addEventListener('ended', advanceSelectedVideo);
}
