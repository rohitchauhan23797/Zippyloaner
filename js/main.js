/* =============================================================
   ZIPPY LOANER — interactions
   No dependencies, no build step.

   The lead form is the ZeroParallel embed in the hero; it renders and
   validates itself, so there is no form logic here. The previous in-house
   4-step form and its controller are preserved in backup/main.customform.js.
   ============================================================= */

/* Opt in to the scroll-reveal styles. Until this line runs, .reveal elements
   render normally — a broken script can never leave the page blank. */
document.documentElement.classList.add('js');

(function () {
  'use strict';

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------
     Mobile nav
     --------------------------------------------------------- */
  (function nav() {
    var toggle = $('#navToggle');
    var menu   = $('#navMobile');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.hidden = open;
    });

    $$('a', menu).forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
      });
    });
  })();

  /* ---------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------- */
  (function reveal() {
    var items = $$('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
      io.observe(el);
    });

    /* Safety net: if the observer never reports (background tab, non-compositing
       embed, odd webview), reveal everything rather than leave copy invisible. */
    window.setTimeout(function () {
      items.forEach(function (el) {
        if (!el.classList.contains('is-in')) {
          el.style.transitionDelay = '0ms';
          el.classList.add('is-in');
        }
      });
    }, 2500);
  })();

  /* ---------------------------------------------------------
     Reading progress (legal pages only — no-op elsewhere)
     --------------------------------------------------------- */
  (function readbar() {
    var bar = $('#readbar span');
    if (!bar) return;

    var ticking = false;
    function paint() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
      ticking = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(paint);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    paint();
  })();

  /* ---------------------------------------------------------
     "Get started" / "Start my request" jump to the hero form
     --------------------------------------------------------- */
  (function focusForm() {
    var links = $$('[data-focus-form]');
    if (!links.length) return;

    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        var target = $('#request');
        if (!target) return;                 // let the href fall through
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });

        /* Focus the first real field the vendor rendered. Wrapped because a
           cross-origin widget may replace its own DOM at any point. */
        window.setTimeout(function () {
          try {
            var field = target.querySelector(
              'input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]), select, textarea'
            );
            if (field && typeof field.focus === 'function') {
              field.focus({ preventScroll: true });
            }
          } catch (err) { /* widget not ready — scrolling alone is enough */ }
        }, 550);
      });
    });
  })();
})();
