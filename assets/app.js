/* Egri csillagok — interactions
   1) starfield canvas in hero (subtle drifting sparks)
   2) reveal-on-scroll
   3) mobile nav
   4) nav background on scroll
*/
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. starfield ---------- */
  var canvas = document.getElementById('stars');
  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d');
    var stars = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;

    function resize() {
      var r = canvas.parentElement.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      stars = [];
      var n = Math.round(W * H / 12000);
      n = Math.max(40, Math.min(n, 200));
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H * 0.85,
          r: Math.random() * 1.5 + 0.3,
          a: Math.random() * 0.6 + 0.15,
          tw: Math.random() * 0.02 + 0.004,
          ph: Math.random() * Math.PI * 2,
          vy: Math.random() * 0.08 + 0.015
        });
      }
    }

    var t = 0;
    function draw() {
      t += 1;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.ph += s.tw;
        s.y += s.vy;
        if (s.y > H * 0.9) s.y = -4;
        var alpha = s.a * (0.6 + 0.4 * Math.sin(s.ph));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(227,199,102,' + alpha.toFixed(3) + ')';
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    var raf = null;
    var started = false;
    function start() { if (!started) { started = true; draw(); } }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; started = false; } }

    resize();
    window.addEventListener('resize', resize);

    // only animate while hero is on screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: 0 }).observe(canvas.parentElement);
    } else {
      start();
    }
  }

  /* ---------- 2. reveal on scroll ----------
     Progressive enhancement: content is only hidden once JS has
     confirmed it can reveal it again (.js on <html>). So no-JS or
     failed-observer environments always show the full content. */
  var root = document.documentElement;
  var reveals = document.querySelectorAll('.reveal');
  var showAll = function () {
    reveals.forEach(function (el) { el.classList.add('in'); });
  };
  root.classList.add('js');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = ((i % 4) * 70) + 'ms';
      io.observe(el);
    });
    // safety net: if nothing has revealed within 3s, show everything
    setTimeout(function () {
      if (!document.querySelector('.reveal.in')) showAll();
    }, 3000);
  } else {
    showAll();
  }

  /* ---------- 3. mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 4. nav scroll state ---------- */
  var nav = document.querySelector('.nav');
  var onScroll = function () {
    if (!nav) return;
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
