// Pagination follows the actual scroll stops: three cards per view on desktop,
// one on mobile, with every item reachable by touch, arrows and keyboard.
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
    let stops = [];
    let visibleCount = 1;
    let active = -1;
    let scheduled = false;
    let signature = '';
    const go = index => {
      // The pinned gallery can change size as its opening transition finishes.
      measure();
      const stop = stops[Math.max(0,Math.min(stops.length - 1,index))];
      if (stop) track.scrollTo({left:stop.x,behavior:motion.matches ? 'instant' : 'smooth'});
    };
    slides.forEach((slide,i) => {
      const label = slide.getAttribute('aria-label');
      slide.setAttribute('aria-label',`${label ? label + ', ' : ''}${i + 1} de ${slides.length}`);
    });
    function update() {
      scheduled = false;
      if (!stops.length) return;
      const max = Math.max(0,track.scrollWidth - track.clientWidth);
      const index = max > 3 && track.scrollLeft >= max - 3 ? stops.length - 1 : stops.reduce((best,stop,i) => Math.abs(stop.x - track.scrollLeft) < Math.abs(stops[best].x - track.scrollLeft) ? i : best,0);
      previous.disabled = track.scrollLeft < 3;
      next.disabled = track.scrollLeft >= max - 3;
      if (active === index) return;
      active = index;
      const first = stops[index].item + 1;
      const last = Math.min(slides.length,first + visibleCount - 1);
      count.textContent = `${String(first).padStart(2,'0')}${last > first ? '–' + String(last).padStart(2,'0') : ''} / ${String(slides.length).padStart(2,'0')}`;
      [...dots.children].forEach((dot,i) => i === index ? dot.setAttribute('aria-current','true') : dot.removeAttribute('aria-current'));
    }
    function measure() {
      const max = Math.max(0,track.scrollWidth - track.clientWidth);
      const style = getComputedStyle(track);
      const width = slides[0].getBoundingClientRect().width;
      const gap = parseFloat(style.columnGap) || 0;
      const usable = track.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      visibleCount = Math.max(1,Math.floor((usable + gap + 1) / (width + gap)));
      stops = [];
      slides.forEach((slide,item) => {
        const x = Math.min(max,slide.offsetLeft - slides[0].offsetLeft);
        if (!stops.length || Math.abs(stops.at(-1).x - x) > 2) stops.push({x,item});
      });
      const nextSignature = `${stops.length}/${visibleCount}`;
      if (signature !== nextSignature) {
        signature = nextSignature;
        dots.replaceChildren();
        stops.forEach((stop,i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          const first = stop.item + 1;
          const last = Math.min(slides.length,first + visibleCount - 1);
          dot.setAttribute('aria-label',last > first ? `Ver itens ${first} a ${last}` : `Ir ao item ${first}`);
          dot.setAttribute('aria-controls',track.id);
          dot.addEventListener('click',()=>go(i));
          dots.append(dot);
        });
      }
      active = -1;
      update();
    }
    const onScroll = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } };
    const onPrevious = () => go(active - 1);
    const onNext = () => go(active + 1);
    const onKey = event => {
      if (event.target !== track || !['ArrowRight','ArrowLeft'].includes(event.key)) return;
      event.preventDefault();
      go(active + (event.key === 'ArrowRight' ? 1 : -1));
    };
    track.addEventListener('scroll',onScroll,{passive:true});
    track.addEventListener('keydown',onKey);
    previous.addEventListener('click',onPrevious);
    next.addEventListener('click',onNext);
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    measure();
    cleanups.push(()=>{
      observer.disconnect();track.removeEventListener('scroll',onScroll);track.removeEventListener('keydown',onKey);
      previous.removeEventListener('click',onPrevious);next.removeEventListener('click',onNext);dots.replaceChildren();
    });
  });
  return {dispose() {cleanups.forEach(fn=>fn());}};
}
