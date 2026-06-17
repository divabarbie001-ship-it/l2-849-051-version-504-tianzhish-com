function initMoviePlayer(url) {
    const video = document.getElementById("movie-player");
    const overlay = document.getElementById("player-overlay");
    let ready = false;
    let hls = null;

    if (!video || !url) {
        return;
    }

    function attach() {
        if (ready) {
            return;
        }

        ready = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            return;
        }

        video.src = url;
    }

    function play() {
        attach();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    video.addEventListener("emptied", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
        ready = false;
    });
}
