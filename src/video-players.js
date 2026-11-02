// Hero playback follows the visible scene. Audio is enabled only by a click.
export function createVideoPlayers() {
  const hero = document.querySelector('#hero-experience');
  const sound = document.querySelector('#hero-video-sound');
  const pause = document.querySelector('#hero-video-pause');
  const inline = [...document.querySelectorAll('[data-inline-player]')];
  const cleanups = [];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = null;
  let userPaused = reducedMotion.matches;
  let suspended = false;
  let playPending = false;
  let disposed = false;
  hero.muted = true;
  hero.controls = false;

  function syncControls() {
    sound.textContent = hero.muted ? 'Ativar som' : 'Silenciar';
    sound.setAttribute('aria-label', hero.muted ? 'Ativar som do depoimento' : 'Silenciar depoimento');
    sound.setAttribute('aria-pressed', String(!hero.muted));
    pause.textContent = hero.paused ? 'Reproduzir' : 'Pausar';
    pause.setAttribute('aria-label', hero.paused ? 'Reproduzir depoimento' : 'Pausar depoimento');
    pause.setAttribute('aria-pressed',String(hero.paused));
  }
  function updateHero() {
    if (!active || userPaused || suspended || document.hidden) {
      hero.pause();
      syncControls();
      return;
    }
    if (!hero.paused || playPending) return;
    playPending = true;
    hero.play().catch(() => {}).finally(() => {
      playPending = false;
      if (!active || suspended || userPaused || document.hidden) hero.pause();
      if (!disposed) syncControls();
    });
  }
  const onSound = () => { hero.muted = !hero.muted; userPaused = false; updateHero(); syncControls(); };
  const onPause = () => { userPaused = !hero.paused; updateHero(); };
  sound.addEventListener('click',onSound);
  pause.addEventListener('click',onPause);
  hero.addEventListener('play',syncControls);
  hero.addEventListener('pause',syncControls);
  const onVisibility = () => {
    if (document.hidden) inline.forEach(player => player.querySelector('video').pause());
    updateHero();
  };
  document.addEventListener('visibilitychange',onVisibility);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) entry.target.querySelector('video').pause();
    });
  },{threshold:.1});
  inline.forEach(player => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-inline-play]');
    const load = () => { if (!video.getAttribute('src')) video.src = video.dataset.src; };
    const onPlay = () => { load(); video.play().catch(() => {}); };
    const onStarted = () => { player.classList.add('has-started'); hero.pause(); inline.forEach(other => { if (other !== player) other.querySelector('video').pause(); }); };
    button.addEventListener('click',onPlay);
    video.addEventListener('play',onStarted);
    observer.observe(player);
    cleanups.push(() => { button.removeEventListener('click',onPlay); video.removeEventListener('play',onStarted); video.pause(); });
  });
  const onMotion = () => { if (reducedMotion.matches) userPaused = true; updateHero(); };
  reducedMotion.addEventListener('change',onMotion);
  syncControls();
  return {
    setHeroActive(value) { if (active !== value) { active = value; updateHero(); } },
    pauseBackground() { suspended = true; hero.pause(); inline.forEach(player=>player.querySelector('video').pause()); },
    resumeHero() { suspended = false; updateHero(); },
    dispose() {
      disposed = true; hero.pause(); observer.disconnect(); cleanups.forEach(fn=>fn());
      sound.removeEventListener('click',onSound); pause.removeEventListener('click',onPause);
      hero.removeEventListener('play',syncControls); hero.removeEventListener('pause',syncControls);
      document.removeEventListener('visibilitychange',onVisibility); reducedMotion.removeEventListener('change',onMotion);
    },
  };
}
