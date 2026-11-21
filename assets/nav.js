/* E8 Impact navigation: nav theme over dark/light sections, and the mobile menu overlay. */
(function () {
  var nav = document.getElementById('nav');
  if (!nav) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Theme: whichever section sits under the pill sets it to dark (frosted) or light (solid). */
  var sections = Array.prototype.slice.call(document.querySelectorAll('section, footer'));
  function themeOf(el) {
    var v = el.getAttribute('data-nav-bg');
    if (v === 'light' || v === 'dark') return v;
    return el.matches('.hero, .band--deep, .band--navy, .footer') ? 'dark' : 'light';
  }
  var observer = null, raf = 0;
  function build() {
    if (!('IntersectionObserver' in window)) return;
    if (observer) observer.disconnect();
    var r = nav.getBoundingClientRect();
    var line = Math.round(r.top + r.height / 2), vh = window.innerHeight;
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) nav.setAttribute('data-theme', themeOf(e.target)); });
    }, { rootMargin: '-' + line + 'px 0px -' + Math.max(0, vh - line - 1) + 'px 0px', threshold: 0 });
    sections.forEach(function (s) { observer.observe(s); });
  }
  build();

  /* Mobile menu */
  var btn = document.getElementById('menu-btn');
  var menu = document.getElementById('mobile-menu');
  var closeBtn = document.getElementById('menu-close');
  var lastFocus = null, hideTimer = 0;

  function isOpen() { return menu && menu.classList.contains('is-visible'); }
  function focusables() { return menu.querySelectorAll('a[href], button:not([disabled])'); }
  function openMenu() {
    clearTimeout(hideTimer);
    lastFocus = document.activeElement;
    menu.hidden = false; menu.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    btn.setAttribute('aria-expanded', 'true');
    void menu.offsetWidth;
    menu.classList.add('is-visible');
    setTimeout(function () { var f = focusables()[0]; if (f) f.focus(); }, 0);
  }
  function closeMenu(restore) {
    menu.classList.remove('is-visible');
    document.body.style.overflow = '';
    btn.setAttribute('aria-expanded', 'false');
    hideTimer = setTimeout(function () { menu.hidden = true; menu.classList.remove('is-open'); }, reduce.matches ? 0 : 300);
    if (restore !== false && lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (btn && menu) {
    btn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', function () { closeMenu(); });
    Array.prototype.forEach.call(menu.querySelectorAll('a[href]'), function (a) {
      a.addEventListener('click', function () { closeMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
      if (e.key !== 'Tab') return;
      var f = focusables(); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  window.addEventListener('resize', function () {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      build();
      if (menu && isOpen() && window.innerWidth > 860) closeMenu(false);
    });
  });
})();
