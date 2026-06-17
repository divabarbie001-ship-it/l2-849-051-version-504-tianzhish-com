(function() {
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function applyFilter(scope) {
    var input = scope.querySelector("[data-filter-input]");
    var region = scope.querySelector("[data-filter-region]");
    var type = scope.querySelector("[data-filter-type]");
    var cards = scope.querySelectorAll(".movie-card");
    var keyword = input ? input.value.trim().toLowerCase() : "";
    var regionValue = region ? region.value : "";
    var typeValue = type ? type.value : "";

    cards.forEach(function(card) {
      var text = (card.getAttribute("data-search") || "").toLowerCase();
      var cardRegion = card.getAttribute("data-region") || "";
      var cardType = card.getAttribute("data-type") || "";
      var keywordOk = !keyword || text.indexOf(keyword) !== -1;
      var regionOk = !regionValue || cardRegion === regionValue;
      var typeOk = !typeValue || cardType === typeValue;
      card.classList.toggle("hidden-card", !(keywordOk && regionOk && typeOk));
    });
  }

  function initHero(carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function() {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        play();
      });
    }

    show(0);
    play();
  }

  onReady(function() {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var header = document.querySelector(".site-header");

    if (navToggle && header) {
      navToggle.addEventListener("click", function() {
        header.classList.toggle("mobile-open");
      });
    }

    document.querySelectorAll("[data-hero-carousel]").forEach(initHero);

    document.querySelectorAll("[data-filter-scope]").forEach(function(scope) {
      var params = new URLSearchParams(window.location.search);
      var input = scope.querySelector("[data-filter-input]");
      if (input && params.get("q")) {
        input.value = params.get("q");
      }
      scope.querySelectorAll("[data-filter-input], [data-filter-region], [data-filter-type]").forEach(function(control) {
        control.addEventListener("input", function() {
          applyFilter(scope);
        });
        control.addEventListener("change", function() {
          applyFilter(scope);
        });
      });
      applyFilter(scope);
    });
  });
})();
