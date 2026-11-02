export const STORY_END = 0.64;
export const SMILE_END = 0.95;
const clamp = n => Math.max(0, Math.min(1, n));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, n) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// The real photograph stays untouched. Its smile is aligned to the illustrative
// dentition, then a continuous camera pullback lands on the actual Cida card.
export function createSmileBridge({journey, pin, story, stories}) {
  const bridge = journey.querySelector('.smile-bridge');
  const daylight = journey.querySelector('.journey-daylight');
  const frame = bridge.querySelector('.smile-photo-frame');
  const photo = bridge.querySelector('.smile-photo');
  const model = bridge.querySelector('.smile-model');
  const dental = journey.querySelector('#story-model');
  const cards = [...stories.querySelectorAll('.patient-card')];
  const track = stories.querySelector('.gallery-track');
  const firstPhoto = cards[0].querySelector('img');
  let target = 0;
  let current = 0;
  let animation = 0;
  let disposed = false;
  let enabled = false;
  let visible = true;
  let mode;
  let lastPaint = null;
  let cachedGeometry;
  const originalInert = false;

  function geometry() {
    const viewport = pin.getBoundingClientRect();
    const box = dental.getBoundingClientRect();
    // Mirrors the SVG viewBox and the closed pose's 1.065 scale.
    const unit = Math.min(box.width / 2267, box.height / 1260);
    const originX = box.left + box.width / 2;
    const originY = box.top + box.height * .53;
    const x = box.left + (box.width - 2267 * unit) / 2 + 160 * unit;
    const y = box.top + (box.height - 1260 * unit) / 2 + 300 * unit;
    const source = {
      x: originX + (x - originX) * 1.065 - viewport.left,
      y: originY + (y - originY) * 1.065 - viewport.top,
      w: 1947 * unit * 1.065,
      h: 808 * unit * 1.065,
    };
    const card = cards[0].getBoundingClientRect();
    const destination = {x:card.left - viewport.left, y:card.top - viewport.top, w:card.width, h:card.height};
    const naturalW = photo.naturalWidth || 1200;
    const naturalH = photo.naturalHeight || 1690;
    const cover = Math.max(card.width / naturalW, card.height / naturalH);
    const position = getComputedStyle(firstPhoto).objectPosition.split(' ').map(parseFloat);
    const offsetX = Number.isFinite(position[0]) ? position[0] / 100 : .5;
    const offsetY = Number.isFinite(position[1]) ? position[1] / 100 : .34;
    const endPhoto = {
      x:destination.x + (card.width - naturalW * cover) * offsetX,
      y:destination.y + (card.height - naturalH * cover) * offsetY,
      w:naturalW * cover,
      h:naturalH * cover,
    };
    return {source, destination, endPhoto, naturalW, naturalH};
  }

  function position(element, x, y, w, h) {
    element.style.transform = `translate3d(${x.toFixed(3)}px,${y.toFixed(3)}px,0)`;
    element.style.width = `${w.toFixed(3)}px`;
    element.style.height = `${h.toFixed(3)}px`;
  }

  function paint(t) {
    const {source, destination, endPhoto, naturalW, naturalH} = cachedGeometry ||= geometry();
    const travel = smooth(0, .90, t);
    const zoom = smooth(0, .88, t);
    const cx = mix(source.x + source.w / 2, destination.x + destination.w / 2, travel);
    const cy = mix(source.y + source.h / 2, destination.y + destination.h / 2, travel);
    const fw = mix(source.w * 1.10, destination.w, travel);
    const fh = mix(source.h * .98, destination.h, travel);
    const fx = cx - fw / 2;
    const fy = cy - fh / 2;
    // The smile landmark is measured on the original 1200 × 1690 photo.
    const mouthX = .484;
    const mouthY = .671;
    const startPhotoW = source.w * (1865 / 1947) / (300 / 1200);
    const pw = Math.exp(mix(Math.log(startPhotoW), Math.log(endPhoto.w), zoom));
    const ph = pw * naturalH / naturalW;
    const mx = cx + (endPhoto.x + endPhoto.w * mouthX - (destination.x + destination.w / 2)) * travel;
    const my = cy + (endPhoto.y + endPhoto.h * mouthY - (destination.y + destination.h / 2)) * travel;
    const px = mx - pw * mouthX;
    const py = my - ph * mouthY;
    const dw = source.w * pw / startPhotoW;
    const dh = dw * 808 / 1947;
    const blend = smooth(.08, .23, t);
    const cardsReveal = smooth(.65, .96, t);
    const firstReveal = smooth(.90, .98, t);
    const storyFade = 1 - smooth(0, .23, t);
    position(frame, fx, fy, fw, fh);
    position(photo, px - fx, py - fy, pw, ph);
    const toothHeight = dh * mix(1,.72,blend);
    position(model, mx - dw / 2, my - toothHeight / 2, dw, toothHeight);
    model.style.filter = `blur(${(Math.sin(blend * Math.PI) * 3).toFixed(2)}px)`;
    const feather = mix(26,100,smooth(.20,.76,t));
    frame.style.maskImage = `radial-gradient(ellipse 75% 80% at 50% 50%, #000 ${feather.toFixed(2)}%, transparent 100%)`;
    frame.style.borderRadius = `${mix(42, 26, travel)}px`;
    frame.style.opacity = blend * (1 - smooth(.98, 1, t));
    model.style.opacity = 1 - blend;
    bridge.style.visibility = t > 0 && t < 1 ? 'visible' : 'hidden';
    daylight.style.opacity = smooth(.38, .83, t);
    story.style.opacity = storyFade;
    dental.style.opacity = t > 0 ? 0 : 1;
    stories.style.opacity = smooth(.62, .90, t);
    cards.forEach((card,i) => {
      card.style.opacity = i === 0 ? firstReveal : cardsReveal;
      card.style.transform = i === 0 ? 'none' : `translate3d(0,${(38 * (1 - cardsReveal)).toFixed(2)}px,0) scale(${mix(.96, 1, cardsReveal)})`;
    });
    const nextMode = t === 0 ? 'story' : t < .98 ? 'transition' : 'patients';
    journey.dataset.smileProgress = t.toFixed(4);
    if (mode !== nextMode) {
      mode = nextMode;
      journey.dataset.scene = mode;
    }
    story.inert = t > .23;
    story.setAttribute('aria-hidden', String(t > .23));
    stories.inert = t < .98;
    stories.setAttribute('aria-hidden', String(t < .62));
    story.style.pointerEvents = t > .23 ? 'none' : 'auto';
    stories.style.pointerEvents = t < .98 ? 'none' : 'auto';
    lastPaint = t;
  }

  function tick() {
    animation = 0;
    if (disposed || !enabled || !visible || document.hidden) return;
    if (current === target && current === lastPaint) return;
    current += (target - current) * .18;
    if (Math.abs(target - current) < .0001) current = target;
    paint(current);
    if (current !== target) animation = requestAnimationFrame(tick);
  }
  function schedule() {
    if (!animation && enabled && !disposed) animation = requestAnimationFrame(tick);
  }
  function reset() {
    bridge.style.removeProperty('visibility');
    [story,stories,dental,...cards].forEach(el => {
      ['opacity','transform','pointer-events'].forEach(property => el.style.removeProperty(property));
    });
    [story,stories].forEach(el => { el.inert = originalInert; el.removeAttribute('aria-hidden'); });
    journey.removeAttribute('data-scene');
    journey.removeAttribute('data-smile-progress');
    mode = undefined;
    lastPaint = null;
    cachedGeometry = undefined;
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && enabled) { current = target; paint(current); schedule(); }
  },{rootMargin:'100px'});
  observer.observe(journey);
  const onVisibility = () => { if (!document.hidden) schedule(); };
  document.addEventListener('visibilitychange',onVisibility);
  const invalidateGeometry = () => { cachedGeometry = undefined; lastPaint = null; schedule(); };
  track.addEventListener('scroll',invalidateGeometry,{passive:true});
  photo.addEventListener('load',invalidateGeometry);
  return {
    update(progress, nextEnabled) {
      const changed = enabled !== nextEnabled;
      if (enabled !== nextEnabled) {
        enabled = nextEnabled;
        if (!enabled) { cancelAnimationFrame(animation); animation = 0; reset(); return; }
      }
      if (!enabled) return;
      target = clamp((progress - STORY_END) / (SMILE_END - STORY_END));
      // Return to Cida while the gallery is hidden, preserving a consistent
      // landing point when a visitor plays the story again after browsing.
      if (target === 0 && track.scrollLeft > 1) track.scrollTo({left:0,behavior:'instant'});
      if (changed) { current = target; paint(current); }
      schedule();
    },
    refresh: invalidateGeometry,
    dispose() { disposed = true; cancelAnimationFrame(animation); observer.disconnect(); document.removeEventListener('visibilitychange',onVisibility); track.removeEventListener('scroll',invalidateGeometry); photo.removeEventListener('load',invalidateGeometry); reset(); },
  };
}
