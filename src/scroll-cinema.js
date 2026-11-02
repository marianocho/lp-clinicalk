const clamp = (n, low = 0, high = 1) => Math.max(low, Math.min(high, n));
const smooth = (start, end, value) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

// The document supplies the timeline. No wheel/touch interception or scroll lock.
// A sticky viewport holds the composition while its scroll distance plays it.
export function createScrollCinema({ getHeroScene, getStoryScene }) {
  const root = document.documentElement;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const header = document.querySelector(".header-inner");
  const hero = document.querySelector(".hero");
  const story = document.querySelector(".story");
  const heroPin = document.querySelector(".hero-pin");
  const storyPin = document.querySelector(".story-pin");
  const heroPanels = [
    document.querySelector(".hero-copy"),
    ...document.querySelectorAll(".hero-film-panel"),
  ];
  const storyPanels = [...document.querySelectorAll(".story-step")];
  const heroButtons = [...document.querySelectorAll("[data-hero-seek]")];
  const storyButtons = [...document.querySelectorAll("[data-story-seek]")];
  const modelLabel = document.querySelector("#model-label");
  const floating = document.querySelector(".floating-contact");
  const contact = document.querySelector("#contato");
  const labels = [
    "Cada sorriso começa com uma boa base.",
    "Precisão e personalização, em cada detalhe.",
    "Um novo sorriso. Novas possibilidades.",
  ];
  let enabled = false;
  let headerHeight = 84;
  let scheduled = false;
  let disposed = false;
  let activeHero = -1;
  let activeStory = -1;

  heroPanels.forEach((el, i) => {
    el.id = `hero-scene-${i}`;
    heroButtons[i].setAttribute("aria-controls", el.id);
  });
  storyPanels.forEach((el, i) => {
    el.id = `story-scene-${i}`;
    storyButtons[i].setAttribute("aria-controls", el.id);
  });

  function progressFor(section, pin) {
    const rect = section.getBoundingClientRect();
    return clamp(
      (headerHeight - rect.top) / Math.max(1, rect.height - pin.offsetHeight),
    );
  }

  function paintPanels(panels, buttons, progress, isHero) {
    const enterMiddle = smooth(0.29, 0.36, progress);
    const leaveMiddle = smooth(0.63, 0.7, progress);
    const alphas = [
      1 - smooth(0.22, 0.29, progress),
      enterMiddle * (1 - leaveMiddle),
      smooth(0.7, 0.77, progress),
    ];
    const shifts = [
      -60 * smooth(0.22, 0.29, progress),
      60 * (1 - enterMiddle) - 60 * leaveMiddle,
      60 * (1 - smooth(0.7, 0.77, progress)),
    ];
    const current = progress < 0.29 ? 0 : progress < 0.7 ? 1 : 2;
    panels.forEach((panel, i) => {
      panel.style.opacity = alphas[i].toFixed(4);
      panel.style.transform = `translate3d(0,${shifts[i].toFixed(2)}px,0) scale(${(0.985 + alphas[i] * 0.015).toFixed(4)})`;
    });
    buttons.forEach((button, i) =>
      button.style.setProperty(
        "--chapter-fill",
        clamp(progress * 3 - i).toFixed(4),
      ),
    );
    if ((isHero ? activeHero : activeStory) !== current) {
      panels.forEach((panel, i) => {
        panel.inert = i !== current;
        panel.setAttribute("aria-hidden", String(i !== current));
        panel.style.pointerEvents = i === current ? "auto" : "none";
        if (i === current) buttons[i].setAttribute("aria-current", "step");
        else buttons[i].removeAttribute("aria-current");
      });
      if (isHero) activeHero = current;
      else {
        activeStory = current;
        modelLabel.textContent = labels[current];
      }
    }
    return current;
  }

  function update() {
    scheduled = false;
    if (disposed) return;
    const heroRect = hero.getBoundingClientRect();
    const storyRect = story.getBoundingClientRect();
    const insideStory =
      enabled &&
      storyRect.top < innerHeight * 0.5 &&
      storyRect.bottom > innerHeight * 0.5;
    floating.classList.toggle(
      "visible",
      heroRect.bottom < headerHeight &&
        !insideStory &&
        contact.getBoundingClientRect().top > innerHeight * 0.65,
    );
    if (enabled) {
      const heroProgress = progressFor(hero, heroPin);
      const storyProgress = progressFor(story, storyPin);
      hero.style.setProperty("--hero-progress", heroProgress.toFixed(4));
      story.style.setProperty("--story-progress", storyProgress.toFixed(4));
      paintPanels(heroPanels, heroButtons, heroProgress, true);
      paintPanels(storyPanels, storyButtons, storyProgress, false);
      getHeroScene()?.setIntroProgress(heroProgress);
      getStoryScene()?.setTimelineProgress(storyProgress);
    } else {
      // The complete original reading flow remains available without pinned scenes.
      let current = 0;
      storyPanels.forEach((panel, i) => {
        if (panel.getBoundingClientRect().top < innerHeight * 0.55) current = i;
      });
      const rect = storyPanels[current].getBoundingClientRect();
      getStoryScene()?.setStoryProgress(
        current,
        clamp((innerHeight * 0.55 - rect.top) / rect.height),
      );
      modelLabel.textContent = labels[current];
    }
  }

  function requestUpdate() {
    if (!scheduled && !disposed) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }

  function refresh() {
    if (disposed) return;
    headerHeight = header.getBoundingClientRect().height;
    root.style.setProperty("--header-height", `${headerHeight}px`);
    const nextEnabled =
      !motion.matches &&
      innerHeight >= 600 &&
      CSS.supports("position", "sticky");
    if (enabled !== nextEnabled) {
      enabled = nextEnabled;
      root.classList.toggle("cinematic", enabled);
      activeHero = -1;
      activeStory = -1;
      if (!enabled) {
        [...heroPanels, ...storyPanels].forEach((panel) => {
          panel.style.removeProperty("opacity");
          panel.style.removeProperty("transform");
          panel.style.removeProperty("pointer-events");
          panel.removeAttribute("aria-hidden");
          panel.inert = false;
        });
        heroPanels.slice(1).forEach((panel) => {
          panel.setAttribute("aria-hidden", "true");
          panel.inert = true;
        });
        getHeroScene()?.resetTimeline();
        getStoryScene()?.resetTimeline();
      }
    }
    requestUpdate();
  }

  function seek(section, pin, index) {
    const points = [0.04, 0.48, 0.88];
    const top = scrollY + section.getBoundingClientRect().top - headerHeight;
    const distance = Math.max(0, section.offsetHeight - pin.offsetHeight);
    window.scrollTo({
      top: top + points[index] * distance,
      behavior: motion.matches ? "instant" : "smooth",
    });
  }
  const buttonListeners = [];
  [
    [heroButtons, hero, heroPin],
    [storyButtons, story, storyPin],
  ].forEach(([buttons, section, pin]) => {
    buttons.forEach((button, i) => {
      const handler = () => seek(section, pin, i);
      button.addEventListener("click", handler);
      buttonListeners.push([button, handler]);
    });
  });
  addEventListener("scroll", requestUpdate, { passive: true });
  addEventListener("resize", refresh, { passive: true });
  motion.addEventListener("change", refresh);
  document.fonts.ready.then(refresh);
  refresh();

  return {
    refresh,
    dispose() {
      disposed = true;
      removeEventListener("scroll", requestUpdate);
      removeEventListener("resize", refresh);
      motion.removeEventListener("change", refresh);
      buttonListeners.forEach(([button, handler]) =>
        button.removeEventListener("click", handler),
      );
    },
  };
}
