(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function activateHero(hero, index) {
    var slides = hero.querySelectorAll('[data-hero-slide]');
    var backgrounds = hero.querySelectorAll('[data-hero-bg]');
    var dots = hero.querySelectorAll('[data-hero-dot]');

    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === index);
    });

    backgrounds.forEach(function (item, current) {
      item.classList.toggle('is-active', current === index);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === index);
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = hero.querySelectorAll('[data-hero-slide]');
    var dots = hero.querySelectorAll('[data-hero-dot]');
    var activeIndex = 0;

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activeIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
        activateHero(hero, activeIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activeIndex = (activeIndex + 1) % slides.length;
        activateHero(hero, activeIndex);
      }, 5200);
    }
  });

  function uniqueValues(cards, attribute) {
    var values = [];

    cards.forEach(function (card) {
      var value = card.getAttribute(attribute);
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });

    return values.sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-Hans-CN');
    });
  }

  function fillSelect(select, values) {
    if (!select || select.options.length > 1) {
      return;
    }

    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  document.querySelectorAll('[data-card-list]').forEach(function (list) {
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var search = document.querySelector('[data-card-search]');
    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));
    var regionSelect = document.querySelector('[data-card-filter="region"]');
    var yearSelect = document.querySelector('[data-card-filter="year"]');
    var typeSelect = document.querySelector('[data-card-filter="type"]');

    fillSelect(regionSelect, uniqueValues(cards, 'data-region'));
    fillSelect(yearSelect, uniqueValues(cards, 'data-year'));
    fillSelect(typeSelect, uniqueValues(cards, 'data-type'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(search ? search.value : '');
      var selected = {};

      filters.forEach(function (filter) {
        var key = filter.getAttribute('data-card-filter');
        selected[key] = normalize(filter.value);
      });

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' '));

        var visible = !keyword || text.indexOf(keyword) !== -1;

        Object.keys(selected).forEach(function (key) {
          var value = selected[key];
          if (value && normalize(card.getAttribute('data-' + key)) !== value) {
            visible = false;
          }
        });

        card.classList.toggle('is-hidden', !visible);
      });
    }

    if (search) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        search.value = q;
      }
      search.addEventListener('input', applyFilters);
    }

    filters.forEach(function (filter) {
      filter.addEventListener('change', applyFilters);
    });

    applyFilters();
  });

  function setupPlayer(shell) {
    var video = shell.querySelector('[data-video]');
    var playButton = shell.querySelector('[data-play-button]');
    var message = shell.querySelector('[data-player-message]');
    var stream = shell.getAttribute('data-stream');
    var hls = null;
    var ready = false;

    if (!video || !stream) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function hideOverlay() {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    }

    function showRetry() {
      if (playButton) {
        playButton.classList.remove('is-hidden');
        var strong = playButton.querySelector('strong');
        if (strong) {
          strong.textContent = '重新播放';
        }
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.then(function () {
          hideOverlay();
          setMessage('');
        }).catch(function () {
          showRetry();
          setMessage('点击视频控件继续播放');
        });
      } else {
        hideOverlay();
      }
    }

    function init() {
      if (ready) {
        playVideo();
        return;
      }

      ready = true;
      setMessage('正在加载');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放线路暂时拥堵，请稍后再试');
            showRetry();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
      } else {
        video.src = stream;
        video.load();
        playVideo();
      }
    }

    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.preventDefault();
        init();
      });
    }

    video.addEventListener('click', function () {
      if (!ready) {
        init();
      }
    });

    video.addEventListener('play', function () {
      hideOverlay();
      setMessage('');
    });

    video.addEventListener('error', function () {
      setMessage('播放线路暂时拥堵，请稍后再试');
      showRetry();
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(setupPlayer);
})();
