/* ENTRO · концепт главной — взаимодействия */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var params = new URLSearchParams(window.location.search);

  /* ─────────── ЗАСТАВКА ─────────── */
  var splash = document.getElementById('splash');
  var splashTimer = null;

  function hideSplash() {
    if (!splash || splash.classList.contains('is-gone')) return;
    if (splashTimer) { clearTimeout(splashTimer); splashTimer = null; }
    splash.classList.add('is-gone');
    document.body.style.overflow = '';
    setTimeout(function () { splash.setAttribute('aria-hidden', 'true'); }, 1100);
  }

  function showSplash() {
    if (!splash) return;
    splash.classList.remove('is-gone');
    splash.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    /* перезапуск анимаций внутренних элементов */
    var inner = splash.querySelectorAll('.splash__inner, .splash__rule, .splash__tag, .splash__bar i, .splash__glow');
    inner.forEach(function (el) {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    });
    splashTimer = setTimeout(hideSplash, 2600);
  }

  if (splash) {
    showSplash();
    splash.addEventListener('click', hideSplash);
    document.getElementById('splashSkip').addEventListener('click', function (e) { e.stopPropagation(); hideSplash(); });
    ['wheel', 'touchstart', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, hideSplash, { once: true, passive: true });
    });
    /* ?skip=1 — открыть сразу сайт (для скриншотов и показа), ?skip=0 — только заставка */
    if (params.get('skip') === '1') {
      splash.classList.add('is-gone');
      splash.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (splashTimer) { clearTimeout(splashTimer); splashTimer = null; }
    }
    if (params.get('skip') === '0') {
      if (splashTimer) { clearTimeout(splashTimer); splashTimer = null; }
    }
  }

  /* ─────────── ХЕДЕР ─────────── */
  var head = document.getElementById('head');
  var onScroll = function () {
    head.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─────────── МОБИЛЬНОЕ МЕНЮ ─────────── */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  burger.addEventListener('click', function () {
    var open = drawer.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      drawer.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });

  /* ─────────── ПОИСК ─────────── */
  var searchbar = document.getElementById('searchbar');
  var searchInput = searchbar.querySelector('input');
  document.querySelector('[data-open-search]').addEventListener('click', function () {
    searchbar.classList.add('is-open');
    searchbar.setAttribute('aria-hidden', 'false');
    setTimeout(function () { searchInput.focus(); }, 260);
  });
  searchbar.querySelector('[data-close-search]').addEventListener('click', function () {
    searchbar.classList.remove('is-open');
    searchbar.setAttribute('aria-hidden', 'true');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && searchbar.classList.contains('is-open')) {
      searchbar.classList.remove('is-open');
      searchbar.setAttribute('aria-hidden', 'true');
    }
  });

  /* ─────────── REVEAL ─────────── */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        revealIO.unobserve(en.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { revealIO.observe(el); });

  /* ─────────── МИССИЯ: появление по словам ─────────── */
  var missionText = document.querySelector('.js-words');
  if (missionText && !reduce) {
    var words = missionText.textContent.trim().split(/\s+/);
    missionText.textContent = '';
    words.forEach(function (word, i) {
      var span = document.createElement('span');
      span.className = 'w';
      span.textContent = word;
      span.style.transitionDelay = Math.min(i * 26, 900) + 'ms';
      missionText.appendChild(span);
      missionText.appendChild(document.createTextNode(' '));
    });
    var wordIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        missionText.querySelectorAll('.w').forEach(function (w) { w.classList.add('is-in'); });
        wordIO.disconnect();
      });
    }, { threshold: 0.25 });
    wordIO.observe(missionText);
  }

  /* ─────────── АКТИВНЫЙ ПУНКТ МЕНЮ ─────────── */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.head__nav a'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var navIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var idx = sections.indexOf(en.target);
      navLinks.forEach(function (a, i) { a.classList.toggle('is-active', i === idx); });
    });
  }, { threshold: 0.35, rootMargin: '-30% 0px -40% 0px' });
  sections.forEach(function (s) { if (s) navIO.observe(s); });

  /* ─────────── БАРАБАН-ВИТРИНА ─────────── */
  var stage = document.getElementById('drumStage');
  var drum = document.getElementById('drum');
  var items = Array.prototype.slice.call(drum.querySelectorAll('.drum__item'));
  var dotsBox = document.getElementById('drumDots');
  var nameEl = document.getElementById('drumName');
  var metaEl = document.getElementById('drumMeta');
  var step = 360 / items.length;
  var current = 0;
  var angle = 0;
  var autoTimer = null;

  function layout() {
    drum.style.setProperty('--step', step + 'deg');
    items.forEach(function (it, i) {
      it.style.setProperty('--i', i);
      it.dataset.index = i;
    });
  }

  function paint(silent) {
    drum.style.setProperty('--angle', (-current * step) + 'deg');
    items.forEach(function (it, i) {
      var diff = ((i - current) % items.length + items.length) % items.length;
      it.classList.toggle('is-front', diff === 0);
    });
    var active = items[((current % items.length) + items.length) % items.length];
    if (!silent && active) {
      nameEl.style.opacity = '0';
      metaEl.style.opacity = '0';
      setTimeout(function () {
        nameEl.textContent = active.dataset.name;
        metaEl.textContent = active.dataset.meta + ' · коллекция ' + active.dataset.col;
        nameEl.style.opacity = '1';
        metaEl.style.opacity = '1';
      }, 160);
    }
    Array.prototype.forEach.call(dotsBox.children, function (b, i) {
      b.classList.toggle('is-active', i === (((current % items.length) + items.length) % items.length));
      b.setAttribute('aria-current', i === (((current % items.length) + items.length) % items.length) ? 'true' : 'false');
    });
  }

  function go(stepDelta) {
    current += stepDelta;
    paint();
  }

  function startAuto() {
    stopAuto();
    if (reduce || document.hidden) return;
    autoTimer = setInterval(function () { go(1); }, 5200);
  }
  function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

  if (stage) {
    layout();
    items.forEach(function (it) { it.style.setProperty('--i', it.dataset.index); });
    drum.style.setProperty('--i', 0);
    items.forEach(function (it, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Показать ' + it.dataset.name);
      dot.addEventListener('click', function () {
        current = i; paint(); startAuto();
      });
      dotsBox.appendChild(dot);
    });
    paint(true);
    startAuto();

    stage.addEventListener('mouseenter', stopAuto);
    stage.addEventListener('mouseleave', startAuto);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAuto(); else startAuto();
    });

    document.getElementById('drumPrev').addEventListener('click', function () { go(-1); startAuto(); });
    document.getElementById('drumNext').addEventListener('click', function () { go(1); startAuto(); });

    /* перетаскивание */
    var dragging = false;
    var startX = 0;
    var startCurrent = 0;
    var moved = 0;

    stage.addEventListener('pointerdown', function (e) {
      dragging = true;
      moved = 0;
      startX = e.clientX;
      startCurrent = current;
      stage.classList.add('is-dragging');
      stopAuto();
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      moved += Math.abs(dx);
      var shift = dx / (stage.clientWidth * 0.14);
      current = startCurrent - shift;
      drum.style.setProperty('--angle', (-current * step) + 'deg');
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('is-dragging');
      current = Math.round(current);
      paint();
      startAuto();
    }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('pointerleave', function (e) { if (dragging) endDrag(e); });

    /* клавиатура */
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(-1); startAuto(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { go(1); startAuto(); e.preventDefault(); }
    });

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { layout(); paint(true); }, 160);
    });
  }

  /* ─────────── ПАЛИТРЫ ─────────── */
  var stylebar = document.getElementById('stylebar');
  var styleToggle = document.getElementById('styleToggle');
  var swatches = Array.prototype.slice.call(document.querySelectorAll('.swatch'));

  function setTheme(name) {
    doc.setAttribute('data-theme', name);
    swatches.forEach(function (s) {
      var on = s.dataset.setTheme === name;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-pressed', String(on));
    });
    try { localStorage.setItem('entro-theme', name); } catch (err) {}
  }

  swatches.forEach(function (s) {
    s.addEventListener('click', function () { setTheme(s.dataset.setTheme); });
  });

  styleToggle.addEventListener('click', function () {
    var open = stylebar.classList.toggle('is-open');
    styleToggle.setAttribute('aria-expanded', String(open));
  });

  document.getElementById('replaySplash').addEventListener('click', function () {
    stylebar.classList.remove('is-open');
    styleToggle.setAttribute('aria-expanded', 'false');
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    setTimeout(showSplash, reduce ? 0 : 420);
  });

  try {
    var saved = localStorage.getItem('entro-theme');
    if (params.get('theme')) setTheme(params.get('theme'));
    else if (saved) setTheme(saved);
  } catch (err) {}

  /* ─────────── ФИЛЬМ НА ПЕРВОМ ЭКРАНЕ ─────────── */
  var film = document.getElementById('heroFilm');
  if (film) {
    film.addEventListener('canplay', function () { film.classList.add('is-live'); });
    film.addEventListener('error', function () { film.classList.remove('is-live'); });
  }

  /* ?all=1 — показать все блоки сразу (статичный вид для скриншотов и презентации) */
  if (params.get('all') === '1') {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
    document.querySelectorAll('.js-words .w').forEach(function (w) { w.classList.add('is-in'); });
  }
  /* ?hover=1 — раскрыть 3/4-рендер на первой карточке (для приёмки без мыши) */
  if (params.get('hover') === '1') {
    var firstCard = document.querySelector('.card');
    if (firstCard) firstCard.classList.add('is-hover');
  }

  /* ─────────── ФОРМА ─────────── */
  var form = document.getElementById('dealerForm');
  var note = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      if (name.length < 2 || phone.length < 6) {
        note.classList.remove('is-ok');
        note.textContent = 'Заполните имя и телефон — в концепте показан только сценарий отправки.';
        return;
      }
      note.classList.add('is-ok');
      note.textContent = 'Спасибо, ' + name + '! В рабочей версии заявка уходит менеджеру, здесь — демонстрация сценария.';
      form.reset();
    });
  }
})();
