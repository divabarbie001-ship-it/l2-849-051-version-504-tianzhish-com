import { H as Hls } from './hls-dru42stk.js';

(function () {
  var player = document.querySelector('[data-hls-player]');
  var overlay = document.querySelector('[data-player-overlay]');
  var startButton = document.querySelector('[data-player-start]');
  var status = document.querySelector('[data-player-status]');

  if (!player) {
    return;
  }

  var source = player.getAttribute('data-src');
  var hlsInstance = null;
  var initialized = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function loadAndPlay() {
    if (!source) {
      setStatus('暂未配置可播放片源。');
      return;
    }

    if (initialized) {
      player.play().catch(function () {
        setStatus('浏览器阻止了自动播放，请再次点击播放器。');
      });
      return;
    }

    initialized = true;
    setStatus('正在加载高清播放源...');

    if (Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(player);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        hideOverlay();
        setStatus('播放源加载完成，可正常播放。');
        player.play().catch(function () {
          setStatus('播放源已就绪，请点击播放器开始观看。');
        });
      });

      hlsInstance.on(Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setStatus('播放源加载失败，请刷新页面后重试。');
        }
      });
    } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = source;
      player.addEventListener('loadedmetadata', function () {
        hideOverlay();
        setStatus('播放源加载完成，可正常播放。');
        player.play().catch(function () {
          setStatus('播放源已就绪，请点击播放器开始观看。');
        });
      }, { once: true });
    } else {
      setStatus('当前浏览器不支持 HLS 播放，请更换现代浏览器。');
    }
  }

  if (startButton) {
    startButton.addEventListener('click', loadAndPlay);
  }

  player.addEventListener('play', function () {
    if (!initialized) {
      loadAndPlay();
    }
  });

  player.addEventListener('playing', hideOverlay);

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
