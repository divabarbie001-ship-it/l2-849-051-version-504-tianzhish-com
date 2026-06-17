(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var previous = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      if (slides.length < 2) {
        return;
      }

      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        showSlide(index);
        startTimer();
      });
    });

    startTimer();

    var query = new URLSearchParams(window.location.search).get("q") || "";
    var filterScopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

    filterScopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var region = scope.querySelector("[data-filter-region]");
      var year = scope.querySelector("[data-filter-year]");
      var type = scope.querySelector("[data-filter-type]");
      var count = scope.querySelector("[data-filter-count]");
      var resultContainer = document.querySelector("[data-filter-results]");
      var emptyMessage = document.querySelector("[data-empty-message]");

      if (input && query) {
        input.value = query;
      }

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function update() {
        if (!resultContainer) {
          return;
        }

        var keyword = normalize(input && input.value);
        var regionValue = normalize(region && region.value);
        var yearValue = normalize(year && year.value);
        var typeValue = normalize(type && type.value);
        var cards = Array.prototype.slice.call(resultContainer.querySelectorAll(".js-filter-card"));
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-category")
          ].map(normalize).join(" ");

          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedRegion = !regionValue || normalize(card.getAttribute("data-region")) === regionValue;
          var matchedYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
          var matchedType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
          var matched = matchedKeyword && matchedRegion && matchedYear && matchedType;

          card.style.display = matched ? "" : "none";

          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = "显示 " + visible + " 部";
        }

        if (emptyMessage) {
          emptyMessage.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, region, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", update);
          control.addEventListener("change", update);
        }
      });

      update();
    });
  });
})();
