(() => {
  'use strict';
  const video = document.querySelector('#teaser-video');
  const chapters = [...document.querySelectorAll('[data-video-time]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let resumeWhenVisible = !reducedMotion.matches, inView = false, hasPlayed = false;
  video.autoplay = false;
  if (reducedMotion.matches) video.pause();
  const playIfVisible = () => {
    if (inView && resumeWhenVisible && !document.hidden) video.play().catch(() => {});
  };
  video.addEventListener('play', () => { hasPlayed = true; });
  video.addEventListener('loadeddata', playIfVisible);
  chapters.forEach(button => button.addEventListener('click', () => {
    video.currentTime = Number(button.dataset.videoTime) + .4;
    video.play().catch(() => {});
  }));
  video.addEventListener('timeupdate', () => {
    const index = Math.min(2, Math.floor(video.currentTime / 14));
    chapters.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  });
  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    if (inView) {
      playIfVisible();
    } else {
      resumeWhenVisible = !video.paused || (!hasPlayed && !reducedMotion.matches);
      video.pause();
    }
  }, {threshold: .15}).observe(video);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resumeWhenVisible = !video.paused || (!hasPlayed && !reducedMotion.matches);
      video.pause();
    } else playIfVisible();
  });

  const panel = document.querySelector('.reasoning-panel');
  const replay = document.querySelector('#replay-response');
  let timer, running = false, startedRotation = false;
  const stop = () => {
    clearTimeout(timer);
    running = false;
    panel.classList.remove('is-replaying', 'answer-revealed');
    panel.querySelectorAll('.revealed').forEach(line => line.classList.remove('revealed'));
    replay.textContent = '↻ Replay';
    replay.setAttribute('aria-label', 'Replay the recorded model response');
    if (startedRotation) {
      const rotate = document.querySelector('#rotate-button');
      if (rotate.getAttribute('aria-pressed') === 'true') rotate.click();
      startedRotation = false;
    }
  };
  replay.addEventListener('click', () => {
    if (running) { stop(); return; }
    stop();
    if (reducedMotion.matches) return;
    running = true;
    panel.classList.add('is-replaying');
    replay.textContent = 'Show full answer';
    replay.setAttribute('aria-label', 'Show the full recorded model response');
    const rotate = document.querySelector('#rotate-button');
    if (!rotate.disabled && rotate.getAttribute('aria-pressed') !== 'true') {
      rotate.click(); startedRotation = true;
    }
    const lines = [...panel.querySelectorAll('#reasoning-steps li')];
    const revealStart = 800, revealEnd = 7600;
    const lineInterval = (revealEnd - revealStart) / Math.max(1, lines.length - 1);
    let index = 0;
    const reveal = () => {
      if (index < lines.length) {
        lines[index++].classList.add('revealed');
        timer = setTimeout(reveal, index < lines.length ? lineInterval : 400);
      } else {
        panel.classList.add('answer-revealed');
        timer = setTimeout(stop, 1800);
      }
    };
    timer = setTimeout(reveal, revealStart);
  });
  const updateScene = () => {
    stop();
    const active = document.querySelector('[data-scene][aria-selected=true]');
    document.querySelector('.response-heading').hidden = !['classroom', 'bathroom', 'chairs'].includes(active?.dataset.scene);
  };
  document.addEventListener('scenechange', updateScene);
  updateScene();
})();
