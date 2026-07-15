/* ============================================================
   Atlética MD · main.js
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Año en el footer ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: sombra al hacer scroll ---------- */
  var header = document.querySelector('.header');
  function onScroll() {
    if (window.scrollY > 10) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menú móvil ---------- */
  var hamburger = document.getElementById('hamburger');
  var menu = document.getElementById('menu');
  var backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  function toggleMenu(open) {
    var isOpen = open !== undefined ? open : !menu.classList.contains('open');
    menu.classList.toggle('open', isOpen);
    hamburger.classList.toggle('open', isOpen);
    backdrop.classList.toggle('show', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
  hamburger.addEventListener('click', function () { toggleMenu(); });
  backdrop.addEventListener('click', function () { toggleMenu(false); });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { toggleMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') toggleMenu(false);
  });

  /* ---------- Hero slider ---------- */
  var track = document.getElementById('heroTrack');
  if (track) {
    var slides = Array.prototype.slice.call(track.querySelectorAll('.slide'));
    var dotsWrap = document.getElementById('heroDots');
    var prevBtn = document.getElementById('heroPrev');
    var nextBtn = document.getElementById('heroNext');
    var index = 0, timer = null, DELAY = 6000;

    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Ir a la diapositiva ' + (i + 1));
      if (i === 0) b.className = 'active';
      b.addEventListener('click', function () { go(i, true); });
      dotsWrap.appendChild(b);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function go(n, user) {
      slides[index].classList.remove('is-active');
      dots[index].classList.remove('active');
      index = (n + slides.length) % slides.length;
      slides[index].classList.add('is-active');
      dots[index].classList.add('active');
      if (user) restart();
    }
    function next() { go(index + 1); }
    function prev() { go(index - 1); }
    function start() { timer = setInterval(next, DELAY); }
    function stop() { clearInterval(timer); }
    function restart() { stop(); start(); }

    if (nextBtn) nextBtn.addEventListener('click', function () { go(index + 1, true); });
    if (prevBtn) prevBtn.addEventListener('click', function () { go(index - 1, true); });

    var hero = document.querySelector('.hero');
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);

    /* Swipe táctil */
    var x0 = null;
    hero.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) { dx < 0 ? go(index + 1, true) : go(index - 1, true); }
      x0 = null;
    }, { passive: true });

    start();
  }

  /* ---------- Reveal al hacer scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Scrollspy (menú activo) ---------- */
  var sections = document.querySelectorAll('section[id]');
  var links = {};
  document.querySelectorAll('.menu__link').forEach(function (l) {
    var id = l.getAttribute('href').replace('#', '');
    links[id] = l;
  });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = en.target.id;
          Object.keys(links).forEach(function (k) { links[k].classList.remove('is-active'); });
          if (links[id]) links[id].classList.add('is-active');
          else if (id === 'inicio' && links['top']) links['top'].classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Video: reproduce al hacer clic (si hay data-video) ---------- */
  var videoFrame = document.getElementById('videoFrame');
  if (videoFrame) {
    function playVideo() {
      var src = videoFrame.getAttribute('data-video');
      if (!src) return; // sin video aún: queda el póster + nota
      var embed;
      if (/youtu/.test(src)) {
        var id = (src.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/) || [])[1] || '';
        embed = '<iframe src="https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      } else if (/vimeo/.test(src)) {
        var vid = (src.match(/vimeo\.com\/(\d+)/) || [])[1] || '';
        embed = '<iframe src="https://player.vimeo.com/video/' + vid + '?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>';
      } else {
        embed = '<video src="' + src + '" controls autoplay playsinline></video>';
      }
      videoFrame.innerHTML = embed;
    }
    videoFrame.addEventListener('click', playVideo);
    videoFrame.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playVideo(); }
    });
  }

  /* ---------- Formulario de contacto → WhatsApp ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name    = (form.elements['name']    ? form.elements['name'].value    : '').trim();
      var wa      = (form.elements['whatsapp']? form.elements['whatsapp'].value: '').trim();
      var email   = (form.elements['email']   ? form.elements['email'].value   : '').trim();
      var howhelp = (form.elements['howhelp'] ? form.elements['howhelp'].value : '').trim();
      if (!name || !wa) {
        document.getElementById(!name ? 'f-name' : 'f-whatsapp').focus();
        return;
      }
      var text = 'Hola, quisiera más información de sus servicios.\n' +
        'Nombre: ' + name + '\n' +
        'WhatsApp: ' + wa +
        (email   ? '\nCorreo: '  + email   : '') +
        (howhelp ? '\n' + howhelp : '');
      window.open('https://wa.me/525528505387?text=' + encodeURIComponent(text), '_blank');
    });
  }

})();
