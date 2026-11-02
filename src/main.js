import "./style.css";

const icons = {
  whatsapp:
    '<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.5Z"/><path d="M9 7.5c-.5-.6-1.4-.2-1.4.7 0 2.9 3.5 6.4 6.3 6.4.9 0 1.3-.9.8-1.4l-1-.9c-.4-.3-.8.5-1.3.4-.8-.3-1.9-1.4-2.2-2.2-.2-.5.7-1 .3-1.4Z"/>',
  tooth:
    '<path d="M12 4c-2.1 0-2.4-1-4.8-1C3 3 3 7 4.2 11.2c1.1 4 1.5 9.8 3.7 9.8 1.8 0 1.3-7.7 4.1-7.7s2.3 7.7 4.1 7.7c2.2 0 2.6-5.8 3.7-9.8C21 7 21 3 16.8 3 14.4 3 14.1 4 12 4Z"/><path d="M9 4c1.5 1.2 3 1.7 4.5 2"/>',
  scan: '<path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3M2 12h20"/><path d="M8 8v8m4-9v10m4-9v8"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
};
document.querySelectorAll("[data-icon]").forEach((el) => {
  el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[el.dataset.icon] || ""}</svg>`;
});

const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
if (!motionPreference.matches && "IntersectionObserver" in window) {
  const reveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          reveal.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -15px 0px" },
  );
  document.querySelectorAll(".reveal").forEach((el) => reveal.observe(el));
  document.documentElement.classList.add("js-motion");
}

const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const closeMenu = () => {
  menuButton.setAttribute("aria-expanded", "false");
  mobileNav.hidden = true;
};
menuButton.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  mobileNav.hidden = expanded;
});
mobileNav
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
matchMedia("(min-width: 851px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

const videoDialog = document.querySelector("#video-dialog");
const video = document.querySelector("#testimonial-video");
const videoTitles = {
  cida: "Cida — um novo sorriso, uma nova fase",
  pedro: "Pedro — confiança para sorrir de novo",
  barbara: "Bárbara — sua experiência com a LK",
  fabiana: "A Dra. Fabiana explica o tratamento",
};
// The clips are the existing, public clinic videos. They load only on request.
const videos = {
  cida: "depo-cida",
  pedro: "depo-pedro",
  barbara: "depo-barbara",
  fabiana: "fabi-servico",
};
document.querySelectorAll("[data-video]").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.video;
    document.querySelector("#video-title").textContent = videoTitles[key];
    video.src = `https://clinicalk.com.br/videos/${videos[key]}.mp4`;
    video.poster = `/videos/${key}.jpg`;
    videoDialog.showModal();
    document.body.classList.add("modal-open");
    video.play().catch(() => {
      /* Native controls remain available if playback is blocked. */
    });
  });
});
videoDialog.addEventListener("close", () => {
  video.pause();
  video.removeAttribute("src");
  video.load();
  document.body.classList.remove("modal-open");
});
const privacyDialog = document.querySelector("#privacy-dialog");
document.querySelector("#privacy-open").addEventListener("click", () => {
  privacyDialog.showModal();
  document.body.classList.add("modal-open");
});
privacyDialog.addEventListener("close", () =>
  document.body.classList.remove("modal-open"),
);
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog
    .querySelector(".dialog-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  });
});

// Exposes a local event for a future analytics integration; no data is transmitted.
document.querySelectorAll("[data-contact]").forEach((link) => {
  link.addEventListener("click", () => {
    document.dispatchEvent(
      new CustomEvent("lk:contact", {
        detail: { placement: link.dataset.placement },
      }),
    );
  });
});

const hero = document.querySelector(".hero");
const contact = document.querySelector("#contato");
const floating = document.querySelector(".floating-contact");
const story = document.querySelector(".story");
const steps = [...document.querySelectorAll(".story-step")];
const progress = [...document.querySelectorAll(".story-progress span")];
const label = document.querySelector("#model-label");
const labels = [
  "Cada sorriso começa com uma boa base.",
  "Precisão e personalização, em cada detalhe.",
  "Um novo sorriso. Novas possibilidades.",
];
let heroScene;
let storyScene;
async function loadScenes() {
  let createDentalScene;
  try {
    ({ createDentalScene } = await import("./dental-scene.js"));
    heroScene = createDentalScene(document.querySelector("#hero-model"), {
      dark: false,
    });
  } catch (error) {
    document.querySelector(".hero-art").classList.add("no-webgl");
    console.info(
      "Visualização 3D indisponível; ilustração alternativa ativa.",
      error.message,
    );
  }
  try {
    storyScene = createDentalScene(document.querySelector("#story-model"), {
      dark: true,
    });
    requestScrollUpdate();
  } catch {
    const fallback = document.querySelector(".model-fallback").cloneNode(true);
    document.querySelector(".story-visual-inner").append(fallback);
    document.querySelector(".story-visual-inner").classList.add("no-webgl");
  }
}

let scheduled = false;
let activeStep = -1;
const updateScroll = () => {
  scheduled = false;
  floating.classList.toggle(
    "visible",
    hero.getBoundingClientRect().bottom < 80 &&
      contact.getBoundingClientRect().top > innerHeight * 0.65,
  );
  const rect = story.getBoundingClientRect();
  if (rect.bottom > 0 && rect.top < innerHeight) {
    const mobile = innerWidth <= 600;
    const focalY = innerHeight * (mobile ? 0.72 : 0.5);
    let current = 0;
    steps.forEach((step, i) => {
      if (
        step.querySelector(".chapter-number").getBoundingClientRect().top <
        focalY
      )
        current = i;
    });
    const stepRect = steps[current].getBoundingClientRect();
    const contentTop = steps[current]
      .querySelector(".chapter-number")
      .getBoundingClientRect().top;
    const within = Math.max(
      0,
      Math.min(
        1,
        (focalY - contentTop) / Math.max(1, stepRect.bottom - contentTop),
      ),
    );
    storyScene?.setStoryProgress(current, within);
    if (activeStep !== current) {
      activeStep = current;
      progress.forEach((el, i) => el.classList.toggle("active", i === current));
      label.textContent = labels[current];
    }
  }
};
const requestScrollUpdate = () => {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(updateScroll);
  }
};
addEventListener("scroll", requestScrollUpdate, { passive: true });
addEventListener("resize", requestScrollUpdate, { passive: true });
document.fonts.ready.then(requestScrollUpdate);
updateScroll();
loadScenes();

// Keep presentation motion in sync if the visitor changes this setting mid-visit.
motionPreference.addEventListener("change", () => {
  document.documentElement.classList.toggle(
    "js-motion",
    !motionPreference.matches,
  );
  if (motionPreference.matches)
    document
      .querySelectorAll(".reveal")
      .forEach((el) => el.classList.add("in-view"));
  heroScene?.renderOnce();
  storyScene?.renderOnce();
});
document.querySelector("#year").textContent = String(new Date().getFullYear());

if (import.meta.hot)
  import.meta.hot.dispose(() => {
    heroScene?.dispose();
    storyScene?.dispose();
  });
