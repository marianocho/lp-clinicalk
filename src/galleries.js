// Native horizontal scrolling supports touch, trackpads, arrows and keyboard.
// Galleries never auto-play; the visitor controls how long each story stays.
export function createGalleries() {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const cleanups = [];
  document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const track = gallery.querySelector('.gallery-track');
    const slides = [...track.children];
    const previous = gallery.querySelector('[data-gallery-prev]');
    const next = gallery.querySelector('[data-gallery-next]');
    const count = gallery.querySelector('.gallery-count');
    const dots = gallery.querySelector('.gallery-dots');
    let active = -1;
    let scheduled = false;
    const positions = () => slides.map(slide => slide.offsetLeft - slides[0].offsetLeft);
    const go = index => track.scrollTo({left: positions()[index], behavior:motion.matches ? 'instant' : 'smooth'});
    slides.forEach((slide, i) => {
      const label = slide.getAttribute('aria-label');
      slide.setAttribute('aria-label', `${label ? label + ', ' : ''}${i + 1} de ${slides.length}`);
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Ir ao item ${i + 1}`);
      dot.setAttribute('aria-controls', track.id);
      dot.addEventListener('click', () => go(i));
      dots.append(dot);
    });
    const update = () => {
      scheduled = false;
      const points = positions();
      const max = track.scrollWidth - track.clientWidth;
      const index = points.reduce((best, x, i) => Math.abs(Math.min(max, x) - track.scrollLeft) < Math.abs(Math.min(max, points[best]) - track.scrollLeft) ? i : best, 0);
      previous.disabled = track.scrollLeft < 3;
      next.disabled = track.scrollLeft >= max - 3;
      if (active !== index) {
        active = index;
        count.textContent = `${String(index + 1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
        [...dots.children].forEach((dot,i) => i === active ? dot.setAttribute('aria-current','true') : dot.removeAttribute('aria-current'));
      }
    };
    const onScroll = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } };
    const onPrevious = () => go(Math.max(0, active - 1));
    const onNext = () => go(Math.min(slides.length - 1, active + 1));
    const onKey = event => {
      if (event.target !== track) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        go(Math.max(0, Math.min(slides.length - 1, active + (event.key === 'ArrowRight' ? 1 : -1))));
      }
    };
    track.addEventListener('scroll',onScroll,{passive:true});
    track.addEventListener('keydown',onKey);
    previous.addEventListener('click',onPrevious);
    next.addEventListener('click',onNext);
    const observer = new ResizeObserver(update);
    observer.observe(track);
    update();
    cleanups.push(() => { observer.disconnect(); track.removeEventListener('scroll',onScroll); track.removeEventListener('keydown',onKey); previous.removeEventListener('click',onPrevious); next.removeEventListener('click',onNext); dots.replaceChildren(); });
  });
  return {dispose() {cleanups.forEach(fn=>fn());}};
}
