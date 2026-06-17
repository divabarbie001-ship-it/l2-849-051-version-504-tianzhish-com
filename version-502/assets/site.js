function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function setupMobileMenu() {
  const button = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (!button || !menu) {
    return;
  }
  button.addEventListener("click", function () {
    menu.classList.toggle("is-open");
  });
}

function setupHero() {
  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  const prev = document.querySelector("[data-hero-prev]");
  const next = document.querySelector("[data-hero-next]");
  if (!slides.length) {
    return;
  }
  let index = 0;
  let timer = null;
  function show(target) {
    index = (target + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }
  function start() {
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }
  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    start();
  }
  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.getAttribute("data-hero-dot")) || 0);
      restart();
    });
  });
  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
      restart();
    });
  }
  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
      restart();
    });
  }
  start();
}

function filterCards(root) {
  const input = root.querySelector("[data-search-input], [data-local-filter-input]");
  const category = root.querySelector("[data-category-filter]");
  const region = root.querySelector("[data-region-filter]");
  const year = root.querySelector("[data-year-filter]");
  const cards = Array.from(root.querySelectorAll("[data-search-card]"));
  const empty = document.querySelector("[data-empty-message]");
  function apply() {
    const query = input ? input.value.trim().toLowerCase() : "";
    const categoryValue = category ? category.value : "";
    const regionValue = region ? region.value : "";
    const yearValue = year ? year.value : "";
    let visible = 0;
    cards.forEach(function (card) {
      const text = card.getAttribute("data-filter-text") || "";
      const matchesQuery = !query || text.includes(query);
      const matchesCategory = !categoryValue || card.getAttribute("data-category") === categoryValue;
      const matchesRegion = !regionValue || card.getAttribute("data-region") === regionValue;
      const matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
      const show = matchesQuery && matchesCategory && matchesRegion && matchesYear;
      card.classList.toggle("is-hidden", !show);
      if (show) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }
  [input, category, region, year].forEach(function (element) {
    if (element) {
      element.addEventListener("input", apply);
      element.addEventListener("change", apply);
    }
  });
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");
  if (query && input) {
    input.value = query;
  }
  apply();
}

function setupFilters() {
  const searchPage = document.querySelector("[data-search-page]");
  const localFilter = document.querySelector("[data-local-filter]");
  if (searchPage) {
    filterCards(searchPage);
  } else if (localFilter) {
    filterCards(document);
  }
}

function initMoviePlayer(source) {
  const player = document.querySelector("[data-player]");
  const video = document.querySelector("[data-player-video]");
  const button = document.querySelector("[data-player-button]");
  if (!player || !video || !button || !source) {
    return;
  }
  let attached = false;
  let hls = null;
  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          button.querySelector("span").textContent = "重试";
          button.classList.remove("is-hidden");
        }
      });
    } else {
      video.src = source;
    }
  }
  function play() {
    attach();
    button.classList.add("is-hidden");
    video.setAttribute("controls", "controls");
    const attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }
  button.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });
  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });
  video.addEventListener("pause", function () {
    if (!video.ended) {
      button.classList.remove("is-hidden");
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}

ready(function () {
  setupMobileMenu();
  setupHero();
  setupFilters();
});
