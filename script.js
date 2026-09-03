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

const selectedVideo = document.querySelector('[data-segmented-video]');
const selectedVideoStatus = document.querySelector('[data-video-status]');

if (selectedVideo) {
  const mediaType = 'video/mp4; codecs="avc1.64001f, mp4a.40.2"';
  let mediaUrl;
  let started = false;

  const showVideoError = () => {
    if (!selectedVideoStatus) return;
    selectedVideoStatus.textContent = 'This video could not load. Please refresh and try again.';
    selectedVideoStatus.hidden = false;
  };

  const appendSegment = (sourceBuffer, segment) => new Promise((resolve, reject) => {
    const onUpdateEnd = () => {
      sourceBuffer.removeEventListener('error', onError);
      resolve();
    };
    const onError = () => {
      sourceBuffer.removeEventListener('updateend', onUpdateEnd);
      reject(new Error('The video segment could not be decoded.'));
    };

    sourceBuffer.addEventListener('updateend', onUpdateEnd, { once: true });
    sourceBuffer.addEventListener('error', onError, { once: true });

    try {
      sourceBuffer.appendBuffer(segment);
    } catch (error) {
      sourceBuffer.removeEventListener('updateend', onUpdateEnd);
      sourceBuffer.removeEventListener('error', onError);
      reject(error);
    }
  });

  const startSelectedVideo = async () => {
    if (started) return;
    started = true;

    try {
      if (!window.MediaSource || !MediaSource.isTypeSupported(mediaType)) {
        throw new Error('Media Source Extensions are unavailable.');
      }

      const segments = JSON.parse(selectedVideo.dataset.segments || '[]');
      if (!segments.length) throw new Error('No video segments were configured.');

      const mediaSource = new MediaSource();
      mediaUrl = URL.createObjectURL(mediaSource);
      selectedVideo.src = mediaUrl;

      await new Promise((resolve, reject) => {
        mediaSource.addEventListener('sourceopen', resolve, { once: true });
        mediaSource.addEventListener('sourceclose', () => reject(new Error('The video source closed.')), { once: true });
      });

      const sourceBuffer = mediaSource.addSourceBuffer(mediaType);

      for (const segmentUrl of segments) {
        const response = await fetch(segmentUrl);
        if (!response.ok) throw new Error('A video segment could not be downloaded.');
        await appendSegment(sourceBuffer, await response.arrayBuffer());
      }

      if (mediaSource.readyState === 'open') mediaSource.endOfStream();
    } catch (error) {
      showVideoError();
    }
  };

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      startSelectedVideo();
    }, { rootMargin: '400px 0px' });
    videoObserver.observe(selectedVideo);
  } else {
    startSelectedVideo();
  }

  selectedVideo.addEventListener('pointerdown', startSelectedVideo, { once: true });
  selectedVideo.addEventListener('focus', startSelectedVideo, { once: true });
  window.addEventListener('pagehide', () => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
  }, { once: true });
}
