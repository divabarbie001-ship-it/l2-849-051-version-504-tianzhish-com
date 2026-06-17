(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var boxes = Array.prototype.slice.call(document.querySelectorAll(".player-box"));

    boxes.forEach(function (box) {
      var video = box.querySelector("video");
      var overlay = box.querySelector(".player-overlay");
      var loaded = false;
      var hls = null;

      if (!video || !overlay) {
        return;
      }

      function attachVideo() {
        if (loaded) {
          return Promise.resolve();
        }

        loaded = true;
        var url = video.getAttribute("data-video");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);

          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            window.setTimeout(resolve, 1800);
          });
        }

        video.src = url;
        return Promise.resolve();
      }

      function startPlayback() {
        overlay.classList.add("is-hidden");
        attachVideo().then(function () {
          var attempt = video.play();

          if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {
              overlay.classList.remove("is-hidden");
            });
          }
        });
      }

      overlay.addEventListener("click", startPlayback);

      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          startPlayback();
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
