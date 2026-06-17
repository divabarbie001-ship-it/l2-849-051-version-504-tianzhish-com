(function() {
  window.initMoviePlayer = function(id, url) {
    var shell = document.getElementById(id);
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var button = shell.querySelector("[data-play]");
    var started = false;
    var hlsInstance = null;

    function start() {
      if (!video) {
        return;
      }
      shell.classList.add("is-playing");
      if (started) {
        video.play().catch(function() {});
        return;
      }
      started = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
          video.play().catch(function() {});
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadedmetadata", function() {
          video.play().catch(function() {});
        }, { once: true });
        video.load();
      } else {
        video.src = url;
        video.play().catch(function() {});
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function() {
        if (!started) {
          start();
        }
      });
    }
    window.addEventListener("pagehide", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
