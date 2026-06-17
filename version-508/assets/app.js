(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(text) {
        return String(text || "").toLowerCase().trim();
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupFilters() {
        var scopes = document.querySelectorAll("[data-filter-scope]");
        scopes.forEach(function (scope) {
            var keyword = scope.querySelector("[data-filter-keyword]");
            var region = scope.querySelector("[data-filter-region]");
            var year = scope.querySelector("[data-filter-year]");
            var empty = scope.querySelector("[data-empty-state]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q") || "";
            if (scope.hasAttribute("data-search-page") && keyword && q) {
                keyword.value = q;
            }
            function apply() {
                var key = normalize(keyword ? keyword.value : "");
                var regionValue = normalize(region ? region.value : "");
                var yearValue = normalize(year ? year.value : "");
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var matchKeyword = !key || haystack.indexOf(key) !== -1;
                    var matchRegion = !regionValue || normalize(card.getAttribute("data-region")) === regionValue;
                    var matchYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                    var visible = matchKeyword && matchRegion && matchYear;
                    card.classList.toggle("is-hidden", !visible);
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", shown === 0);
                }
            }
            [keyword, region, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function setupPlayer() {
        var players = document.querySelectorAll("[data-player]");
        players.forEach(function (wrap) {
            var video = wrap.querySelector("video");
            var button = wrap.querySelector("[data-play]");
            if (!video || !button) {
                return;
            }
            var source = button.getAttribute("data-play");
            var loaded = false;
            var hls;

            function start() {
                if (!source) {
                    return;
                }
                wrap.classList.add("is-playing");
                video.controls = true;
                if (!loaded) {
                    loaded = true;
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = source;
                        video.play().catch(function () {});
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else {
                        video.src = source;
                        video.play().catch(function () {});
                    }
                } else {
                    video.play().catch(function () {});
                }
            }

            button.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (!loaded || video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupFilters();
        setupPlayer();
    });
})();
