
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.acc-btn').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.target, panel = document.getElementById(id);
    if (!panel) return;
    const open = getComputedStyle(panel).display !== 'block';
    document.querySelectorAll('.acc-panel').forEach(p => p.style.display = 'none');
    panel.style.display = open ? 'block' : 'none';
    if (window.innerWidth < 900 && open) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
});
