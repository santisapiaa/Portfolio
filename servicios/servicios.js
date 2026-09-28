// Vercel Analytics custom events (window.va is queued in the page head until the script loads)
function track(name, data) {
  window.va?.('event', { name, data });
}

// WhatsApp and case-study clicks, tagged with where on the page they happened
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a) return;
  if (a.dataset.wa) {
    track('WhatsApp Click', { location: a.dataset.wa });
    return;
  }
  const card = a.closest('.case-card');
  if (card) track('Case Click', { project: card.querySelector('h3').textContent.trim() });
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Scroll-reveal
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.add('reveal-init');
    observer.observe(el);
  });
}
