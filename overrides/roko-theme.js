/* ROKO theme toggle — dark-first (brand), light mode opt-in, persisted. */
const KEY = 'roko-theme';
const root = document.documentElement;

function apply(mode) {
  const light = mode === 'light';
  root.classList.toggle('light', light);
  root.classList.toggle('dark', !light);
  try { localStorage.setItem(KEY, mode); } catch (_) {}
  const icon = document.querySelector('.roko-theme-toggle .ghost-icon');
  if (icon) icon.textContent = light ? '☾' : '☀';
}

let saved = null;
try { saved = localStorage.getItem(KEY); } catch (_) {}
apply(saved === 'light' ? 'light' : 'dark');

function mount() {
  const ta = document.querySelector('.top-actions');
  if (!ta || document.querySelector('.roko-theme-toggle')) return;
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'ghost-button roko-theme-toggle';
  b.setAttribute('aria-label', 'Toggle light/dark theme');
  b.innerHTML = '<span class="ghost-icon">☀</span><span class="ghost-label">Theme</span>';
  b.addEventListener('click', () => apply(root.classList.contains('light') ? 'dark' : 'light'));
  ta.insertBefore(b, ta.firstChild);
  apply(root.classList.contains('light') ? 'light' : 'dark');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
else mount();
