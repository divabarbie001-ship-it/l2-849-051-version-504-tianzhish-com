(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function setupMobileMenu() {
    const toggle = $('.mobile-toggle');
    const menu = $('.mobile-menu');
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      menu.hidden = expanded;
    });
  }

  function setupGlobalSearch() {
    $$('[data-global-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const input = $('input[name="q"], input[type="search"]', form);
        const q = input ? input.value.trim() : '';
        const searchUrl = form.getAttribute('data-search-url') || 'movies.html';
        const suffix = q ? '?q=' + encodeURIComponent(q) : '';
        window.location.href = searchUrl + suffix;
      });
    });
  }

  function setupHeroSlider() {
    const slides = $$('[data-hero-slide]');
    const dots = $$('[data-hero-dot]');
    const thumbs = $$('[data-hero-thumb]');
    if (!slides.length) {
      return;
    }

    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || '0'));
        start();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        show(Number(thumb.getAttribute('data-hero-thumb') || '0'));
        start();
      });
    });

    show(0);
    start();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupFilters() {
    const input = $('#movie-search') || $('[id^="movie-search-"]');
    const cards = $$('[data-movie-card]');
    const chips = $$('[data-filter]');
    const counter = $('[data-results-count]');
    if (!cards.length) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q') || '';
    let category = 'all';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function applyFilter() {
      const query = normalize(input ? input.value : '');
      let visible = 0;

      cards.forEach(function (card) {
        const searchText = normalize(card.getAttribute('data-search'));
        const cardCategory = card.getAttribute('data-category') || '';
        const matchesText = !query || searchText.includes(query);
        const matchesCategory = category === 'all' || cardCategory === category;
        const shouldShow = matchesText && matchesCategory;
        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        category = chip.getAttribute('data-filter') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        applyFilter();
      });
    });

    applyFilter();
  }

  function setupPlayers() {
    $$('[data-player]').forEach(function (shell) {
      const trigger = $('[data-play-trigger]', shell);
      const video = $('video', shell);
      const src = shell.getAttribute('data-src') || (video ? video.currentSrc : '');
      let hlsInstance = null;
      let initialized = false;

      function startVideo() {
        if (!video || !src) {
          return;
        }

        shell.classList.add('is-playing');

        if (!initialized) {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false,
              backBufferLength: 90
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {
                video.controls = true;
              });
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
          } else {
            video.src = src;
          }

          initialized = true;
        }

        video.play().catch(function () {
          video.controls = true;
        });
      }

      if (trigger) {
        trigger.addEventListener('click', startVideo);
      }

      shell.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          startVideo();
        }
      });

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupGlobalSearch();
    setupHeroSlider();
    setupFilters();
    setupPlayers();
  });
})();
