(() => {
  const controls = document.querySelector('.ava-view-controls');
  const image = document.querySelector('#ava-view-image');
  const caption = document.querySelector('#ava-view-caption');
  if (!controls || !image || !caption) return;
  const views = {
    exterior: ['/assets/origin/florida-keys-flat.webp', 'Florida Keys flat-roof exterior concept', 'Florida Keys · Flat roof · Exterior concept'],
    interior: ['/assets/florida-keys-signature-interior.webp', 'Florida Keys interior concept', 'Florida Keys · Interior concept']
  };
  controls.hidden = false;
  controls.addEventListener('click', event => {
    const button = event.target.closest('button[data-view]');
    if (!button || !views[button.dataset.view]) return;
    const [src, alt, label] = views[button.dataset.view];
    image.src = src;
    image.alt = alt;
    caption.textContent = label;
    controls.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  });
})();
