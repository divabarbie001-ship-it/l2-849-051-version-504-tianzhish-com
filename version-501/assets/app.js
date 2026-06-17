(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".main-nav");
        var search = document.querySelector(".nav-search");
        if (!toggle || !nav || !search) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            search.classList.toggle("is-open", open);
            toggle.setAttribute("aria-expanded", String(open));
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function textOf(card) {
        return [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
        ].join(" ").toLowerCase();
    }

    function setupCards() {
        var grid = document.querySelector("[data-card-grid]");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
        var input = document.querySelector("[data-filter-input]");
        var count = document.querySelector("[data-result-count]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input && query) {
            input.value = query;
        }
        var mainSearch = document.querySelector("[data-main-search]");
        if (mainSearch && query) {
            mainSearch.value = query;
        }
        function applyFilter() {
            var value = input ? input.value.trim().toLowerCase() : "";
            var visible = 0;
            cards.forEach(function (card) {
                var matched = !value || textOf(card).indexOf(value) !== -1;
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible ? "已筛选出 " + visible + " 部相关影片" : "没有找到相关影片";
            }
        }
        function sortCards(type) {
            var sorted = cards.slice().sort(function (a, b) {
                if (type === "views") {
                    return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
                }
                if (type === "rating") {
                    return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
                }
                return String(b.getAttribute("data-date")).localeCompare(String(a.getAttribute("data-date")));
            });
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }
        if (input) {
            input.addEventListener("input", applyFilter);
        }
        document.querySelectorAll("[data-sort]").forEach(function (button) {
            button.addEventListener("click", function () {
                document.querySelectorAll("[data-sort]").forEach(function (item) {
                    item.classList.remove("is-active");
                });
                button.classList.add("is-active");
                sortCards(button.getAttribute("data-sort"));
                applyFilter();
            });
        });
        sortCards("date");
        applyFilter();
    }

    window.initMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.playButtonId);
        var overlay = document.getElementById(options.overlayId);
        var attached = false;
        var player = null;
        if (!video || !options.source) {
            return;
        }
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = options.source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                player = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                player.loadSource(options.source);
                player.attachMedia(video);
                return;
            }
            video.src = options.source;
        }
        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }
        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                play();
            });
        }
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (player && typeof player.destroy === "function") {
                player.destroy();
            }
        });
        attach();
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupCards();
    });
}());
