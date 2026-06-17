(function () {
    const navToggle = document.querySelector("[data-nav-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (navToggle && mobileNav) {
        navToggle.addEventListener("click", function () {
            const isOpen = mobileNav.classList.toggle("is-open");
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    const prev = document.querySelector("[data-hero-prev]");
    const next = document.querySelector("[data-hero-next]");
    let heroIndex = 0;
    let heroTimer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }

        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
            slide.classList.toggle("is-active", position === heroIndex);
        });
        dots.forEach(function (dot, position) {
            dot.classList.toggle("is-active", position === heroIndex);
        });
    }

    function startHero() {
        if (heroTimer) {
            clearInterval(heroTimer);
        }

        heroTimer = setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    if (slides.length) {
        showHero(0);
        startHero();
    }

    if (prev) {
        prev.addEventListener("click", function () {
            showHero(heroIndex - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showHero(heroIndex + 1);
            startHero();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showHero(Number(dot.getAttribute("data-hero-dot")) || 0);
            startHero();
        });
    });

    const searchInput = document.querySelector("[data-global-search]");
    const searchPanel = document.querySelector("[data-search-panel]");
    const movies = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function closeSearch() {
        if (searchPanel) {
            searchPanel.classList.remove("is-open");
            searchPanel.innerHTML = "";
        }
    }

    function renderSearch(query) {
        if (!searchPanel) {
            return;
        }

        const text = normalize(query);
        if (!text) {
            closeSearch();
            return;
        }

        const results = movies.filter(function (movie) {
            const haystack = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.tags,
                movie.oneLine
            ].join(" "));
            return haystack.includes(text);
        }).slice(0, 12);

        searchPanel.classList.add("is-open");
        if (!results.length) {
            searchPanel.innerHTML = '<div class="search-empty">未找到匹配内容</div>';
            return;
        }

        searchPanel.innerHTML = results.map(function (movie) {
            return [
                '<a class="search-result" href="' + movie.url + '">',
                '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
                '    <span>',
                '        <strong>' + escapeHtml(movie.title) + '</strong>',
                '        <em>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</em>',
                '        <em>' + escapeHtml(movie.oneLine) + '</em>',
                '    </span>',
                '</a>'
            ].join("");
        }).join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            renderSearch(searchInput.value);
        });

        document.addEventListener("click", function (event) {
            if (!event.target.closest(".header-search")) {
                closeSearch();
            }
        });
    }

    const filterInput = document.querySelector("[data-filter-input]");
    const regionFilter = document.querySelector("[data-region-filter]");
    const yearFilter = document.querySelector("[data-year-filter]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    const emptyState = document.querySelector("[data-empty-state]");

    function filterCards() {
        const keyword = normalize(filterInput ? filterInput.value : "");
        const region = normalize(regionFilter ? regionFilter.value : "");
        const year = normalize(yearFilter ? yearFilter.value : "");
        let visible = 0;

        cards.forEach(function (card) {
            const haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags")
            ].join(" "));
            const matchKeyword = !keyword || haystack.includes(keyword);
            const matchRegion = !region || normalize(card.getAttribute("data-region")) === region;
            const matchYear = !year || normalize(card.getAttribute("data-year")) === year;
            const match = matchKeyword && matchRegion && matchYear;
            card.style.display = match ? "" : "none";
            if (match) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-open", visible === 0);
        }
    }

    [filterInput, regionFilter, yearFilter].forEach(function (control) {
        if (control) {
            control.addEventListener("input", filterCards);
            control.addEventListener("change", filterCards);
        }
    });
})();
