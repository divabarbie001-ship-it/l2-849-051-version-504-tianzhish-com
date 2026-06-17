(function () {
  var menuButton = document.querySelector('[data-mobile-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeHeroIndex = 0;

  function showHeroSlide(index) {
    if (!heroSlides.length) {
      return;
    }

    activeHeroIndex = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeHeroIndex);
    });

    heroDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeHeroIndex);
    });
  }

  heroDots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showHeroSlide(dotIndex);
    });
  });

  if (heroSlides.length > 1) {
    showHeroSlide(0);
    window.setInterval(function () {
      showHeroSlide(activeHeroIndex + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function includesText(haystack, needle) {
    return normalize(haystack).indexOf(normalize(needle)) !== -1;
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  filterForms.forEach(function (panel) {
    var scopeSelector = panel.getAttribute('data-filter-target') || '[data-card-grid]';
    var scope = document.querySelector(scopeSelector);
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]')) : [];
    var keywordInput = panel.querySelector('[data-filter-keyword]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var counter = document.querySelector(panel.getAttribute('data-filter-counter') || '');
    var noResults = document.querySelector(panel.getAttribute('data-filter-empty') || '');

    function filterCards() {
      var keyword = keywordInput ? normalize(keywordInput.value) : '';
      var type = typeSelect ? normalize(typeSelect.value) : '';
      var region = regionSelect ? normalize(regionSelect.value) : '';
      var year = yearSelect ? normalize(yearSelect.value) : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var searchable = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ');

        var matchesKeyword = !keyword || includesText(searchable, keyword);
        var matchesType = !type || includesText(card.getAttribute('data-type'), type);
        var matchesRegion = !region || includesText(card.getAttribute('data-region'), region);
        var matchesYear = !year || includesText(card.getAttribute('data-year'), year);
        var visible = matchesKeyword && matchesType && matchesRegion && matchesYear;

        card.style.display = visible ? '' : 'none';

        if (visible) {
          visibleCount += 1;
        }
      });

      if (counter) {
        counter.textContent = visibleCount;
      }

      if (noResults) {
        noResults.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    [keywordInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (keywordInput && initialQuery) {
      keywordInput.value = initialQuery;
    }

    filterCards();
  });

  var backToTop = document.querySelector('[data-back-to-top]');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('is-visible', window.scrollY > 500);
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
