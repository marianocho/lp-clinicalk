const clamp = (n) => Math.max(0, Math.min(1, n));
const smooth = (a, b, n) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// Matching contours cut both the slots and moving teeth for an exact fit.
const teeth = [
  { path: "M526 178Q553 124 607 132Q662 139 687 205L699 274Q681 344 683 404Q679 427 643 426L566 419Q524 414 518 382Q501 274 526 178Z", x: -145, y: -125, angle: -11 },
  { path: "M704 218Q739 110 839 110Q913 109 945 183Q970 284 967 419Q966 445 931 448L745 438Q686 432 683 408Q674 329 704 218Z", x: -60, y: -215, angle: -5 },
  { path: "M987 184Q1022 110 1122 110Q1201 110 1227 195Q1260 301 1247 418Q1244 446 1207 448L1013 449Q974 448 975 415Q973 273 987 184Z", x: 65, y: -210, angle: 5 },
  { path: "M1255 200Q1281 137 1353 132Q1406 132 1429 183Q1452 273 1432 387Q1426 418 1392 422L1280 429Q1248 431 1248 408Q1255 305 1231 253Z", x: 150, y: -125, angle: 11 },
];

export function createDentalArchScene(container) {
  const asset = "/images/dentition-closed-v1.png";
  const uid = `dentition-${Math.random().toString(36).slice(2, 8)}`;
  const image = (extra = "") => `<image href="${asset}" width="1947" height="808" ${extra}/>`;
  container.innerHTML = `<div class="dentition-composition" aria-hidden="true">
    <svg class="dentition-render" viewBox="-160 -300 2267 1260" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="${uid}-holo" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".10 .10 .10 0 .10 .24 .24 .24 0 .18 .30 .30 .30 0 .22 0 0 0 1 0"/></filter>
        <mask id="${uid}-alpha" mask-type="alpha">${image()}</mask>
        <mask id="${uid}-slots" mask-type="luminance"><rect width="1947" height="808" fill="white"/>${teeth.map(t => `<path d="${t.path}" fill="black"/>`).join("")}</mask>
        ${teeth.map((t, i) => `<clipPath id="${uid}-tooth-${i}"><path d="${t.path}"/></clipPath>`).join("")}
        <pattern id="${uid}-lines" width="8" height="14" patternUnits="userSpaceOnUse"><path d="M0 1H8" stroke="#7cdbf2" stroke-width="1" opacity=".4"/></pattern>
        <linearGradient id="${uid}-ray"><stop stop-color="#7bd8f5" stop-opacity="0"/><stop offset=".48" stop-color="#7bd8f5" stop-opacity=".2"/><stop offset=".5" stop-color="#d1f7ff"/><stop offset=".52" stop-color="#7bd8f5" stop-opacity=".2"/><stop offset="1" stop-color="#7bd8f5" stop-opacity="0"/></linearGradient>
      </defs>
      <g class="dentition-solid" mask="url(#${uid}-slots)">${image()}</g>
      <g class="dentition-hologram" filter="url(#${uid}-holo)">${image()}</g>
      <g class="dentition-scan-lines" mask="url(#${uid}-alpha)"><rect width="1947" height="808" fill="url(#${uid}-lines)"/></g>
      <g class="dentition-rays" mask="url(#${uid}-alpha)">
        <rect class="scan-ray" x="-130" width="260" height="808" fill="url(#${uid}-ray)"/>
        <rect class="scan-ray" x="-70" width="140" height="808" fill="url(#${uid}-ray)"/>
        <rect class="scan-ray" x="-30" width="60" height="808" fill="url(#${uid}-ray)"/>
      </g>
      ${teeth.map((t,i) => `<g class="dentition-piece" style="transform-origin:${[610,835,1115,1340][i]}px 280px">
        <g clip-path="url(#${uid}-tooth-${i})">
          <g class="piece-solid">${image()}</g><g class="piece-holo" filter="url(#${uid}-holo)">${image()}<rect width="1947" height="808" fill="url(#${uid}-lines)"/></g>
        </g>
      </g>`).join("")}
    </svg>
  </div>`;
  const solid = container.querySelector(".dentition-solid");
  const hologram = container.querySelector(".dentition-hologram");
  const lines = container.querySelector(".dentition-scan-lines");
  const rays = container.querySelector(".dentition-rays");
  const rayElements = [...container.querySelectorAll(".scan-ray")];
  const pieces = [...container.querySelectorAll(".dentition-piece")];
  const composition = container.querySelector(".dentition-composition");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let target = 0;
  let current = 0;
  let frame = 0;
  let visible = true;
  let disposed = false;

  function paint(p) {
    const materialize = smooth(.27, .40, p);
    const extract = smooth(.24, .38, p);
    solid.style.opacity = materialize;
    hologram.style.opacity = .66 * (1 - smooth(.25, .37, p));
    lines.style.opacity = .65 * (1 - smooth(.27, .39, p));
    rays.style.opacity = 1 - smooth(.29, .40, p);
    rayElements.forEach((ray, i) => ray.setAttribute("transform", `translate(${(-120 + p * 8400 - i * 155).toFixed(2)} 0)`));
    pieces.forEach((piece, i) => {
      const seat = smooth(.40 + i * .027, .59 + i * .027, p);
      const offset = extract * (1 - seat);
      const t = teeth[i];
      piece.style.opacity = smooth(.23, .29, p);
      piece.style.transform = `translate(${(t.x * offset).toFixed(2)}px,${(t.y * offset).toFixed(2)}px) rotate(${(t.angle * offset).toFixed(2)}deg)`;
      const finish = smooth(.77, 1, seat);
      piece.querySelector(".piece-solid").style.opacity = finish;
      piece.querySelector(".piece-holo").style.opacity = .9 * (1 - finish);
    });
    composition.style.transform = `scale(${(1 + smooth(.70, .90, p) * .065).toFixed(4)})`;
    container.dataset.phase = p < .29 ? "scan" : p < .70 ? "fit" : "complete";
  }
  function tick() {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    current += (target - current) * .16;
    if (Math.abs(target - current) < .00015) current = target;
    paint(current);
    if (current !== target) frame = requestAnimationFrame(tick);
  }
  function schedule() {
    if (!frame && !disposed) frame = requestAnimationFrame(tick);
  }
  function setTimelineProgress(p) {
    target = motion.matches ? 1 : clamp(p);
    schedule();
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) { current = target; paint(current); schedule(); }
  }, {rootMargin:"150px"});
  observer.observe(container);
  const onVisibility = () => { if (!document.hidden) schedule(); };
  document.addEventListener("visibilitychange", onVisibility);
  paint(motion.matches ? 1 : 0);
  return {
    setTimelineProgress,
    setStoryProgress(step, within) { setTimelineProgress((step + within) / 3); },
    resetTimeline() { target = current = motion.matches ? 1 : 0; paint(current); },
    renderOnce() { current = motion.matches ? 1 : target; paint(current); },
    dispose() { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); container.replaceChildren(); },
  };
}
