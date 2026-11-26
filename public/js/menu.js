const btn = document.getElementById('menuBtn'), drawer = document.getElementById('drawer')
    , closeBtn = document.getElementById('closeBtn'), scrim = document.getElementById('scrim');
function toggle(open) {
    drawer.classList.toggle('open', open);
    scrim.classList.toggle('visible', open); btn.setAttribute('aria-expanded', String(open))
} btn?.addEventListener('click', () => toggle(!drawer.classList.contains('open'))); closeBtn?.addEventListener('click', () => toggle(false));
 scrim?.addEventListener('click', () => toggle(false)); document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false) });
