(() => {
  'use strict';

  const content = window.SITE_CONTENT;
  const fallbackMedia = window.ALY_MEDIA || {};

  if (!content) {
    console.error('SITE_CONTENT is missing. Check content/site-content.js.');
    return;
  }

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const getPath = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);

  document.querySelectorAll('[data-bind]').forEach((element) => {
    const value = getPath(content, element.dataset.bind);
    if (value !== undefined && value !== null) element.textContent = value;
  });

  document.querySelectorAll('[data-business-name]').forEach((element) => {
    element.textContent = content.business.name;
  });

  document.querySelectorAll('[data-business-location]').forEach((element) => {
    element.textContent = `${content.business.location} · ${content.business.serviceArea}`;
  });

  document.querySelectorAll('[data-contact-email]').forEach((element) => {
    element.textContent = content.business.email;
    element.href = `mailto:${content.business.email}`;
  });

  const heroProof = document.getElementById('hero-proof');
  if (heroProof) {
    heroProof.innerHTML = content.hero.proof.map((item) => `
      <div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)}</span></div>
    `).join('');
  }

  const reel = document.querySelector('[data-reel]');
  const reelToggle = document.querySelector('.video-toggle');
  if (reel instanceof HTMLVideoElement) {
    const preferredPoster = content.hero.poster?.trim();
    const posterFallback = fallbackMedia[content.hero.fallbackPoster];
    const preferredVideo = content.hero.video?.trim();
    const videoFallback = fallbackMedia[content.hero.fallbackVideo];
    let usingVideoFallback = false;

    if (posterFallback) reel.poster = posterFallback;
    if (preferredPoster) {
      const posterProbe = new Image();
      posterProbe.addEventListener('load', () => { reel.poster = preferredPoster; }, { once: true });
      posterProbe.src = preferredPoster;
    }

    const updateToggle = () => {
      if (!reelToggle) return;
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

    const useFallbackVideo = () => {
      if (videoFallback && !usingVideoFallback) {
        usingVideoFallback = true;
        reel.src = videoFallback;
        reel.load();
        return;
      }
      reel.removeAttribute('src');
      reel.classList.add('is-poster-only');
      if (reelToggle) reelToggle.hidden = true;
    };

    reel.addEventListener('error', useFallbackVideo);
    reel.addEventListener('play', updateToggle);
    reel.addEventListener('pause', updateToggle);
    reel.addEventListener('loadeddata', () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPlayback(!reduceMotion.matches);
    });

    if (preferredVideo) {
      reel.src = preferredVideo;
      reel.load();
    } else {
      useFallbackVideo();
    }

    reelToggle?.addEventListener('click', () => setPlayback(reel.paused));

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceMotion.addEventListener?.('change', (event) => setPlayback(!event.matches));
  }

  const projectGrid = document.getElementById('project-grid');
  if (projectGrid) {
    projectGrid.innerHTML = content.work.projects.map((project, index) => {
      const layout = ['wide', 'portrait', 'landscape'].includes(project.layout) ? project.layout : 'landscape';
      const featured = layout === 'wide' ? ' project-featured' : '';
      const badge = project.sample ? '<span class="media-badge">Concept sample</span>' : '';
      return `
        <article class="project${featured}">
          <div class="media-frame media-${layout}">
            <img data-project-image="${index}" alt="${escapeHtml(project.alt)}" loading="lazy">
            ${badge}
          </div>
          <div class="project-meta">
            <div><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.description)}</p></div>
            <p>${escapeHtml(project.services)}</p>
          </div>
        </article>
      `;
    }).join('');

    content.work.projects.forEach((project, index) => {
      const image = projectGrid.querySelector(`[data-project-image="${index}"]`);
      if (!(image instanceof HTMLImageElement)) return;

      const preferredSource = project.image?.trim();
      const fallbackSource = fallbackMedia[project.fallback];

      if (preferredSource) {
        if (fallbackSource) {
          image.addEventListener('error', () => {
            image.src = fallbackSource;
          }, { once: true });
        }
        image.src = preferredSource;
      } else if (fallbackSource) {
        image.src = fallbackSource;
      } else {
        image.alt = '';
        image.closest('.media-frame')?.classList.add('is-empty');
      }
    });
  }

  const serviceList = document.getElementById('service-list');
  if (serviceList) {
    serviceList.innerHTML = content.services.items.map((service) => `
      <article><div><h3>${escapeHtml(service.title)}</h3><p>${escapeHtml(service.description)}</p></div><strong>${escapeHtml(service.price)}</strong></article>
    `).join('');
  }

  const packageGrid = document.getElementById('package-grid');
  if (packageGrid) {
    packageGrid.innerHTML = content.packages.items.map((item) => `
      <article class="package-card${item.featured ? ' featured-package' : ''}">
        <div class="package-top"><p class="package-name">${escapeHtml(item.name)}</p><p class="package-price">From <strong>${escapeHtml(item.price)}</strong></p></div>
        <p>${escapeHtml(item.description)}</p>
        <ul>${item.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}</ul>
        <a href="#contact" data-package="${escapeHtml(item.formValue)}">Ask about ${escapeHtml(item.name)}</a>
      </article>
    `).join('');
  }

  const processList = document.getElementById('process-list');
  if (processList) {
    processList.innerHTML = content.process.steps.map((step) => `
      <article><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.description)}</p></article>
    `).join('');
  }

  const aboutMedia = document.getElementById('about-media');
  if (aboutMedia && content.about.portrait) {
    aboutMedia.classList.add('has-portrait');
    aboutMedia.innerHTML = `<img src="${escapeHtml(content.about.portrait)}" alt="${escapeHtml(content.about.portraitAlt)}">`;
  }

  const form = document.querySelector('.inquiry-form');
  if (form instanceof HTMLFormElement) {
    form.action = content.contact.formEndpoint;
    form.querySelector('[data-form-subject]').value = content.contact.formSubject;
    form.querySelector('[data-form-next]').value = content.contact.thankYouUrl;
    form.querySelector('[data-form-source]').value = content.contact.formSourceUrl;
    form.querySelector('[data-form-autoresponse]').value = content.contact.autoresponse;
  }

  const projectType = document.getElementById('project-type');
  if (projectType instanceof HTMLSelectElement) {
    content.contact.projectTypes.forEach((label) => projectType.add(new Option(label, label)));
  }

  const budgetRange = document.getElementById('budget-range');
  if (budgetRange instanceof HTMLSelectElement) {
    content.contact.budgets.forEach((label) => budgetRange.add(new Option(label, label)));
  }

  document.querySelectorAll('[data-package]').forEach((link) => {
    link.addEventListener('click', () => {
      if (!(projectType instanceof HTMLSelectElement)) return;
      const packageName = link.dataset.package;
      if (packageName && Array.from(projectType.options).some((option) => option.value === packageName)) {
        projectType.value = packageName;
      }
    });
  });

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

  form?.addEventListener('submit', () => {
    const submitButton = form.querySelector('.submit-button');
    if (!submitButton) return;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending inquiry...';
  });
})();
