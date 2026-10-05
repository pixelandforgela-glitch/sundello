/**
 * Optional cutaway scroll-step helper.
 * Inactive while no [data-build-track] is in the DOM. The homepage uses
 * existing product photos; the cutaway block stays commented out.
 * Reduced motion shows the final frame only, if that block is ever revived.
 */
(function () {
  const track = document.querySelector("[data-build-track]");
  if (!track) return;

  const frames = Array.from(track.querySelectorAll("[data-frame]"));
  const steps = Array.from(track.querySelectorAll("[data-step]"));
  const progress = track.querySelector("[data-build-progress]");
  const label = track.querySelector("[data-frame-label]");
  const labels = ["01 · Foundation", "02 · Steel + MgO", "03 · Finishes", "04 · Sundial cue"];

  if (!frames.length) return;

  function showFrame(index) {
    const i = Math.max(0, Math.min(frames.length - 1, index));
    frames.forEach((el, n) => el.classList.toggle("is-visible", n === i));
    steps.forEach((el) => el.classList.toggle("is-active", Number(el.dataset.step) === i));
    if (label) label.textContent = labels[i] || "";
    if (progress) progress.style.width = ((i + 1) / frames.length) * 100 + "%";
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    showFrame(frames.length - 1);
    return;
  }

  function update() {
    const rect = track.getBoundingClientRect();
    const view = window.innerHeight || 1;
    const total = Math.max(1, track.offsetHeight - view);
    const scrolled = Math.min(total, Math.max(0, -rect.top));
    const t = scrolled / total;
    if (rect.bottom < 0 || rect.top > view) {
      showFrame(0);
      return;
    }
    const index = Math.min(frames.length - 1, Math.floor(t * frames.length));
    showFrame(index);
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      update();
      ticking = false;
    });
  }

  showFrame(0);
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
})();
