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
  let mediaUrl;
  let loadPromise;

  const setSelectedVideoState = (paused) => {
    if (!selectedVideoControl || !selectedVideoLabel) return;
    selectedVideoControl.setAttribute('aria-pressed', String(paused));
    selectedVideoLabel.textContent = paused ? 'Play reel' : 'Pause reel';
  };

  const showVideoError = () => {
    if (!selectedVideoStatus) return;
    selectedVideoStatus.textContent = 'This video could not load. Please refresh and try again.';
    selectedVideoStatus.hidden = false;
  };

  const loadSelectedVideo = () => {
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      try {
        const parts = JSON.parse(selectedVideo.dataset.videoParts || '[]');
        if (!parts.length) throw new Error('No video files were configured.');

        if (selectedVideoStatus) {
          selectedVideoStatus.textContent = 'Loading reel…';
          selectedVideoStatus.hidden = false;
        }

        const responses = await Promise.all(parts.map((partUrl) => fetch(partUrl, { cache: 'force-cache' })));
        if (responses.some((response) => !response.ok)) throw new Error('A video file could not be downloaded.');

        const chunks = await Promise.all(responses.map((response) => response.arrayBuffer()));
        mediaUrl = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
        selectedVideo.src = mediaUrl;
        selectedVideo.muted = true;

        await new Promise((resolve, reject) => {
          selectedVideo.addEventListener('canplay', resolve, { once: true });
          selectedVideo.addEventListener('error', reject, { once: true });
          selectedVideo.load();
        });

        if (selectedVideoStatus) selectedVideoStatus.hidden = true;

        if (!reduceMotion) {
          selectedVideo.play().catch(() => setSelectedVideoState(true));
        } else {
          setSelectedVideoState(true);
        }
      } catch (error) {
        showVideoError();
        setSelectedVideoState(true);
        loadPromise = null;
        throw error;
      }
    })();

    return loadPromise;
  };

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      loadSelectedVideo().catch(() => {});
    }, { rootMargin: '1200px 0px' });
    videoObserver.observe(selectedVideo);
  } else {
    loadSelectedVideo().catch(() => {});
  }

  if (selectedVideoControl) {
    selectedVideoControl.addEventListener('click', async () => {
      try {
        await loadSelectedVideo();
        if (selectedVideo.paused) {
          await selectedVideo.play();
        } else {
          selectedVideo.pause();
        }
      } catch (error) {
        setSelectedVideoState(true);
      }
    });
  }

  selectedVideo.addEventListener('play', () => setSelectedVideoState(false));
  selectedVideo.addEventListener('pause', () => setSelectedVideoState(true));
  selectedVideo.addEventListener('ended', () => setSelectedVideoState(true));

  window.addEventListener('pagehide', () => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
  }, { once: true });
}
