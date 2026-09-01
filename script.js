(() => {
  'use strict';

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');

  if (menuToggle && nav) {
    const closeMenu = () => {
      nav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.textContent = 'Menu';
    };

    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.textContent = isOpen ? 'Close' : 'Menu';
    });

    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const reel = document.querySelector('[data-reel]');
  const reelToggle = document.querySelector('.video-toggle');

  if (reel instanceof HTMLVideoElement && reelToggle instanceof HTMLButtonElement) {
    let fallbackAttempted = false;
    const fallbackVideo = reel.dataset.fallbackVideo;
    const fallbackPoster = reel.dataset.fallbackPoster;

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
      if (playRequest instanceof Promise) playRequest.catch(updateToggle);
    };

    reelToggle.addEventListener('click', () => setPlayback(reel.paused));
    reel.addEventListener('play', updateToggle);
    reel.addEventListener('pause', updateToggle);
    reel.addEventListener('error', () => {
      if (!fallbackAttempted && fallbackVideo && reel.currentSrc !== new URL(fallbackVideo, document.baseURI).href) {
        fallbackAttempted = true;
        if (fallbackPoster) reel.poster = fallbackPoster;
        reel.src = fallbackVideo;
        reel.load();
        return;
      }
      reel.classList.add('is-poster-only');
      if (fallbackPoster) reel.poster = fallbackPoster;
      reelToggle.hidden = true;
    });

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPlayback(!reduceMotion.matches);
    reduceMotion.addEventListener?.('change', (event) => setPlayback(!event.matches));
  }

  document.querySelectorAll('img[data-fallback-src]').forEach((image) => {
    if (!(image instanceof HTMLImageElement)) return;
    image.addEventListener('error', () => {
      const fallbackSource = image.dataset.fallbackSrc;
      if (fallbackSource && image.currentSrc !== new URL(fallbackSource, document.baseURI).href) {
        image.src = fallbackSource;
        return;
      }
      image.closest('.media-frame')?.classList.add('is-empty');
      image.alt = '';
    });
  });

  const projectType = document.getElementById('project-type');
  document.querySelectorAll('[data-package]').forEach((link) => {
    link.addEventListener('click', () => {
      if (!(projectType instanceof HTMLSelectElement)) return;
      const packageName = link.getAttribute('data-package');
      if (!packageName) return;
      const option = Array.from(projectType.options).find((item) => item.value === packageName || item.textContent.trim() === packageName);
      if (option) projectType.value = option.value;
    });
  });

  const inquiryForm = document.querySelector('.inquiry-form');
  if (inquiryForm instanceof HTMLFormElement) {
    inquiryForm.addEventListener('submit', () => {
      if (!inquiryForm.checkValidity()) return;
      const submitButton = inquiryForm.querySelector('.submit-button');
      if (!(submitButton instanceof HTMLButtonElement)) return;
      submitButton.disabled = true;
      submitButton.textContent = 'Sending inquiry...';
    });
  }
})();
