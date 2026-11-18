/* ============================================================
   Norair Harutyunyan — Game Art Portfolio

   Progressive enhancement only. With JavaScript disabled the
   page is fully readable: every section visible, every poster
   frame shown, every title a plain link, no overlay anywhere.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover:hover) and (pointer:fine)');

  function all(sel, scope) { return [].slice.call((scope || document).querySelectorAll(sel)); }

  /* ---------- motion state, shared by everything below ---------- */
  var stored = null;
  try { stored = localStorage.getItem('nh-motion'); } catch (e) { /* private mode */ }
  var motionOn = stored === null ? !reduced.matches : stored === 'on';
  var motionSubs = [];                       /* called whenever the switch changes */
  function lively() { return motionOn && !reduced.matches; }

  /* ============================================================
     1. BOOT SCREEN
     Held until the fonts have resolved and the first paintable
     assets are in, so nobody watches the type re-flow. Removing
     .is-booting is also what starts the hero: the title lines
     rise and the reels spin in.
     ============================================================ */
  (function boot() {
    var el = document.getElementById('boot');
    var fill = document.getElementById('boot-fill');
    if (!el) { root.classList.remove('is-booting'); return; }

    var steps = 0;
    var TOTAL = 3;
    var finished = false;

    function step() {
      steps++;
      if (fill) fill.style.transform = 'scaleX(' + Math.min(1, 0.06 + steps / TOTAL).toFixed(3) + ')';
      if (steps >= TOTAL) done();
    }

    function done() {
      if (finished) return;
      finished = true;
      if (fill) fill.style.transform = 'scaleX(1)';
      root.classList.remove('is-booting');
      requestAnimationFrame(function () {
        el.classList.add('is-done');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 700);
      });
    }

    /* the three things worth waiting for */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(step).catch(step);
    else step();

    /* DOMContentLoaded, not load: waiting for every subresource on a slow
       connection turns the boot screen into the thing being waited for. */
    if (document.readyState !== 'loading') step();
    else document.addEventListener('DOMContentLoaded', step, { once: true });

    /* the hero poster of the first clip, so the fold is not empty */
    var firstPoster = document.querySelector('.stage__poster');
    if (firstPoster && firstPoster.complete) step();
    else if (firstPoster) {
      firstPoster.addEventListener('load', step, { once: true });
      firstPoster.addEventListener('error', step, { once: true });
    } else step();

    /* never hold the page hostage to a slow asset */
    setTimeout(done, 1500);
  })();

  /* ---------- 2. scroll progress ---------- */
  var bar = document.querySelector('.progress');
  if (bar) {
    var barTick = false;
    var draw = function () {
      var max = root.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)).toFixed(4) + ')';
      barTick = false;
    };
    addEventListener('scroll', function () {
      if (!barTick) { barTick = true; requestAnimationFrame(draw); }
    }, { passive: true });
    addEventListener('resize', draw, { passive: true });
    draw();
  }

  /* ---------- 3. mobile navigation ---------- */
  var burger = document.querySelector('.nav-burger');
  var nav = document.querySelector('#primary-nav');
  if (burger && nav) {
    var setNav = function (open) {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    };
    burger.addEventListener('click', function () {
      setNav(burger.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        burger.focus();
      }
    });
  }

  /* ---------- 4. header inverts over the light profile band ---------- */
  var head = document.querySelector('.site-head');
  var lightBand = document.querySelector('.profile');
  if (head && lightBand) {
    var headTick = false;
    var syncHeader = function () {
      var r = lightBand.getBoundingClientRect();
      var probe = head.offsetHeight * 0.6;
      head.classList.toggle('is-light', r.top <= probe && r.bottom >= probe);
      headTick = false;
    };
    addEventListener('scroll', function () {
      if (!headTick) { headTick = true; requestAnimationFrame(syncHeader); }
    }, { passive: true });
    addEventListener('resize', syncHeader, { passive: true });
    syncHeader();
  }

  /* ---------- 5. scroll spy ---------- */
  var spyLinks = all('#primary-nav a[href^="#"]');
  var spyTargets = spyLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);
  if (spyTargets.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        spyLinks.forEach(function (a) {
          a.setAttribute('aria-current', a.getAttribute('href') === '#' + en.target.id ? 'true' : 'false');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    spyTargets.forEach(function (t) { spy.observe(t); });
  }

  /* ---------- 6. reveal on scroll, staggered per row ---------- */
  var reveals = all('.reveal');
  function settle(el) {
    /* once a tile has arrived its stagger delay must not slow the tilt */
    if (el.classList.contains('tile')) setTimeout(function () { el.classList.add('is-settled'); }, 900);
  }
  if (reveals.length && 'IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.filter(function (en) { return en.isIntersecting; })
        .forEach(function (en, i) {
          en.target.style.setProperty('--stagger', Math.min(i, 5) * 40 + 'ms');
          en.target.classList.add('is-in');
          settle(en.target);
          ro.unobserve(en.target);
        });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    reveals.forEach(function (el) { ro.observe(el); });
    setTimeout(function () {
      reveals.forEach(function (el) { el.classList.add('is-in'); settle(el); });
    }, 4000);
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); settle(el); });
  }

  /* ============================================================
     7. GALLERY
     The square is reserved in CSS, a shimmer holds the slot, and
     the art is only faded in once it has actually decoded. No
     half-painted thumbnails, no shift.
     ============================================================ */
  all('.tile__art').forEach(function (slot) {
    var img = slot.querySelector('img');
    if (!img) return;
    var settleArt = function () { slot.classList.add('is-loaded'); };
    if (img.complete && img.naturalWidth > 0) {
      settleArt();
    } else {
      img.addEventListener('load', function () {
        if (img.decode) img.decode().then(settleArt).catch(settleArt);
        else settleArt();
      }, { once: true });
      /* a missing file must not leave a shimmer running forever */
      img.addEventListener('error', settleArt, { once: true });
    }
  });

  /* ============================================================
     8. VIDEO
     Sources attach well before the clip is on screen, so playback
     starts full. Each stage arrives soft and pulls into focus,
     which also covers the hand-off from poster to first frame.
     ============================================================ */
  var stages = all('.stage[data-video]');

  var toggle = document.querySelector('.motion-toggle');
  var toggleLabel = toggle && toggle.querySelector('[data-label]');

  function attach(video) {
    if (video.dataset.ready === '1') return;
    video.dataset.ready = '1';
    var mobile = video.dataset.srcMobile;
    if (mobile) {
      var s1 = document.createElement('source');
      s1.src = mobile;
      s1.type = 'video/mp4';
      s1.media = '(max-width: 768px)';
      video.appendChild(s1);
    }
    var s2 = document.createElement('source');
    s2.src = video.dataset.src;
    s2.type = 'video/mp4';
    video.appendChild(s2);
    video.preload = 'auto';
    video.load();
  }

  function mark(stage, playing) {
    stage.classList.toggle('is-playing', playing);
    var btn = stage.querySelector('.stage__ctl button');
    if (btn) btn.setAttribute('aria-label', playing ? 'Pause this clip' : 'Play this clip');
  }

  function play(stage, video) {
    attach(video);
    var p = video.play();
    if (p && typeof p.then === 'function') {
      p.then(function () { mark(stage, true); })
       .catch(function () { mark(stage, false); }); /* low-power mode, data saver */
    } else {
      mark(stage, true);
    }
  }

  function pause(stage, video) {
    video.pause();
    mark(stage, false);
  }

  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0;
  }

  stages.forEach(function (stage) {
    var video = stage.querySelector('video');
    if (!video) return;

    /* the clip only becomes visible once it can genuinely paint */
    var reveal = function () { stage.classList.add('is-ready'); };
    video.addEventListener('loadeddata', reveal);
    video.addEventListener('playing', reveal);
    /* if the file is unreachable the poster simply stays */
    video.addEventListener('error', function () { mark(stage, false); }, true);

    var btn = stage.querySelector('.stage__ctl button');
    if (btn) {
      btn.addEventListener('click', function () {
        if (video.paused) play(stage, video); else pause(stage, video);
      });
    }
    mark(stage, false);
  });

  if ('IntersectionObserver' in window && stages.length) {
    /* buffer early: one full viewport ahead of the clip */
    var preloader = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var v = en.target.querySelector('video');
        if (v) attach(v);
        preloader.unobserve(en.target);
      });
    }, { rootMargin: '100% 0px' });
    stages.forEach(function (s) { preloader.observe(s); });

    /* Focus pull. A ratio of thresholds is enough to drive this: the
       callback only runs when a clip crosses one, so there is no scroll
       handler and no per-frame work. --soft is 0 while the clip is being
       watched and rises as it leaves the viewport in either direction. */
    var STEPS = [0, .05, .12, .2, .28, .36, .44, .52, .6, .68, .76, .84, .9, .96, 1];
    var softener = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var stage = en.target;
        /* a stage taller than the window can never reach ratio 1, so measure
           against the most of it that could possibly be on screen */
        var reachable = Math.min(en.boundingClientRect.height, innerHeight) || 1;
        var cover = Math.min(1, en.intersectionRect.height / reachable);
        var soft = cover >= 0.9 ? 0 : Math.min(1, (0.9 - cover) / 0.62);
        stage.style.setProperty('--soft', soft.toFixed(3));
        stage.classList.toggle('is-sharp', soft === 0);
      });
    }, { threshold: STEPS });
    stages.forEach(function (s) { softener.observe(s); });

    /* playback */
    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var stage = en.target;
        var video = stage.querySelector('video');
        if (!video) return;
        if (en.isIntersecting) {
          if (motionOn) play(stage, video);
        } else if (!video.paused) {
          pause(stage, video);
        }
      });
    }, { threshold: 0.2 });
    stages.forEach(function (s) { vo.observe(s); });
  } else {
    stages.forEach(function (s) { s.classList.add('is-sharp'); });
  }

  /* ---------- 9. motion toggle ---------- */
  function applyMotion() {
    body.classList.toggle('motion-off', !motionOn);
    if (toggle) {
      var label = motionOn ? 'Motion on' : 'Motion off';
      toggle.setAttribute('aria-pressed', motionOn ? 'true' : 'false');
      /* the visible text is hidden on small screens, so name the control too */
      toggle.setAttribute('aria-label', label);
      if (toggleLabel) toggleLabel.textContent = label;
    }
    stages.forEach(function (stage) {
      var video = stage.querySelector('video');
      if (!video) return;
      if (!motionOn) pause(stage, video);
      else if (inView(stage)) play(stage, video);
    });
    if (hero) hero.setEnabled(motionOn);
    motionSubs.forEach(function (fn) { fn(); });
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      motionOn = !motionOn;
      stored = motionOn ? 'on' : 'off';
      try { localStorage.setItem('nh-motion', stored); } catch (e) { /* ignore */ }
      applyMotion();
    });
  }

  var onPrefChange = function () {
    if (stored !== null) return;       /* an explicit choice wins over the OS */
    motionOn = !reduced.matches;
    applyMotion();
  };
  if (reduced.addEventListener) reduced.addEventListener('change', onPrefChange);
  else if (reduced.addListener) reduced.addListener(onPrefChange);

  /* ---------- 10. stop everything when the tab is hidden ---------- */
  document.addEventListener('visibilitychange', function () {
    stages.forEach(function (stage) {
      var v = stage.querySelector('video');
      if (!v) return;
      if (document.hidden) { if (!v.paused) pause(stage, v); }
      else if (motionOn && inView(stage)) play(stage, v);
    });
    if (hero) hero.setVisible(!document.hidden);
  });

  /* ---------- 11. year stamp ---------- */
  var years = all('[data-year]');
  if (years.length) {
    var y = String(new Date().getFullYear());
    years.forEach(function (el) { el.textContent = y; });
  }

  /* ============================================================
     12. HERO HAZE (WebGL)
     A slow ruby drift behind the title. Purely atmospheric: if
     the context is refused, or the machine is struggling, it is
     dropped and the CSS glow underneath carries the hero.
     ============================================================ */
  function buildHero() {
    var canvas = document.getElementById('hero-gl');
    if (!canvas || reduced.matches) return null;

    var gl = canvas.getContext('webgl', {
      alpha: true, antialias: false, depth: false, stencil: false,
      premultipliedAlpha: false, powerPreference: 'low-power'
    }) || canvas.getContext('experimental-webgl');
    if (!gl) return null;

    /* No GPU, no haze. Software rasterisers turn every frame into main-thread
       work, which is exactly what a first paint cannot afford. */
    var forceGL = location.search.indexOf('gl=force') > -1;   /* review hatch */
    try {
      var dbg = gl.getExtension('WEBGL_debug_renderer_info');
      var who = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
      if (!forceGL && /swiftshader|llvmpipe|software|basic render/i.test(who)) return null;
    } catch (e) { /* extension blocked, carry on */ }
    if (!forceGL && (navigator.hardwareConcurrency || 8) <= 2) return null;

    var VERT = [
      'attribute vec2 a;',
      'void main(){ gl_Position = vec4(a, 0.0, 1.0); }'
    ].join('\n');

    var FRAG = [
      '#ifdef GL_FRAGMENT_PRECISION_HIGH',
      'precision highp float;',
      '#else',
      'precision mediump float;',
      '#endif',
      'uniform vec2 u_res;',
      'uniform float u_time;',
      'uniform vec2 u_ptr;',

      /* precision-safe hash: the classic sin() one degenerates to 1.0 on mediump */
      'float hash(vec2 p){',
      '  vec3 q = fract(vec3(p.xyx) * 0.1031);',
      '  q += dot(q, q.yzx + 33.33);',
      '  return fract((q.x + q.y) * q.z);',
      '}',

      'float noise(vec2 p){',
      '  vec2 i = floor(p), f = fract(p);',
      '  vec2 u = f * f * (3.0 - 2.0 * f);',
      '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),',
      '             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);',
      '}',

      'float fbm(vec2 p){',
      '  float v = 0.0, a = 0.5;',
      '  for (int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; }',
      '  return v;',
      '}',

      'void main(){',
      '  vec2 uv = gl_FragCoord.xy / u_res;',
      '  float ar = u_res.x / u_res.y;',
      '  vec2 p = vec2(uv.x * ar, uv.y);',
      '  float t = u_time * 0.028;',

      /* two rounds of domain warping: drifting ink, not a gradient */
      '  vec2 q = vec2(fbm(p * 1.5 + vec2(0.0, t)), fbm(p * 1.5 + vec2(5.2, -t)));',
      '  vec2 r = vec2(fbm(p * 1.5 + 2.6 * q + vec2(1.7, 9.2) + t * 0.7),',
      '                fbm(p * 1.5 + 2.6 * q + vec2(8.3, 2.8) - t * 0.5));',
      '  float f = fbm(p * 1.5 + 2.2 * r);',

      /* the light sits where the reference build puts it: upper right */
      '  vec2 c = vec2(0.80 + u_ptr.x * 0.04, 0.84 + u_ptr.y * 0.04);',
      '  float d = distance(p, vec2(c.x * ar, c.y));',
      '  float halo = 1.0 - smoothstep(0.0, 1.15, d);',

      '  vec3 crimson = vec3(0.553, 0.063, 0.176);',
      '  vec3 ruby    = vec3(1.000, 0.208, 0.373);',
      '  vec3 col = mix(crimson, ruby, smoothstep(0.34, 0.86, f));',
      '  col *= pow(halo, 2.6) * (0.22 + 0.70 * f) * 0.42;',

      /* grain kills the banding a smooth gradient would show */
      '  col += (hash(gl_FragCoord.xy + fract(u_time) * 57.0) - 0.5) * 0.018;',
      '  col *= 1.0 - smoothstep(0.20, 1.30, length(uv - 0.5));',

      '  col = max(col, 0.0);',
      '  float a = clamp(max(max(col.r, col.g), col.b) * 1.4, 0.0, 0.9);',
      '  gl_FragColor = vec4(col, a);',
      '}'
    ].join('\n');

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
      return s;
    }

    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, 'u_res');
    var uTime = gl.getUniformLocation(prog, 'u_time');
    var uPtr = gl.getUniformLocation(prog, 'u_ptr');

    var scale = Math.min(devicePixelRatio || 1, 0.75);
    var ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    var running = false, enabled = motionOn, visible = true, onScreen = true, raf = 0;
    var t0 = 0, frames = 0, slow = 0, degraded = false;

    function size() {
      var w = Math.max(1, Math.round(canvas.clientWidth * scale));
      var h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }

    var FRAME_MS = 1000 / 30;   /* a slow drift gains nothing from 60fps */

    function frame(now) {
      if (!running) return;
      if (!t0) t0 = now;

      if (now - (frame.painted || 0) < FRAME_MS) { raf = requestAnimationFrame(frame); return; }
      frame.painted = now;

      /* watch the cost: two strikes and the effect steps aside */
      var dt = now - (frame.last || now);
      frame.last = now;
      if (frames++ > 40) {
        if (dt > 34) slow++; else slow = Math.max(0, slow - 1);
        if (slow > 45) {
          if (!degraded) { degraded = true; slow = 0; scale = 0.7; size(); }
          else { stop(); canvas.classList.remove('is-live'); return; }
        }
      }

      ptr.x += (ptr.tx - ptr.x) * 0.05;
      ptr.y += (ptr.ty - ptr.y) * 0.05;
      gl.uniform2f(uPtr, ptr.x, ptr.y);
      gl.uniform1f(uTime, (now - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || !enabled || !visible || !onScreen) return;
      running = true;
      size();
      raf = requestAnimationFrame(frame);
      canvas.classList.add('is-live');
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    addEventListener('resize', function () { if (running) size(); }, { passive: true });

    if (finePointer.matches) {
      addEventListener('pointermove', function (e) {
        ptr.tx = (e.clientX / innerWidth) * 2 - 1;
        ptr.ty = 1 - (e.clientY / innerHeight) * 2;
      }, { passive: true });
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        onScreen = en[0].isIntersecting;
        if (onScreen) start(); else stop();
      }, { threshold: 0 }).observe(canvas);
    }

    start();

    return {
      setEnabled: function (v) { enabled = v; if (v) start(); else { stop(); canvas.classList.remove('is-live'); } },
      setVisible: function (v) { visible = v; if (v) start(); else stop(); }
    };
  }

  /* Built once the page has settled, never in front of the first paint.
     requestIdleCallback is throttled in a background tab and can simply never
     run there, so a timer guarantees the effect still arrives. */
  var hero = null, heroTried = false;
  function heroLater() {
    if (heroTried) return;
    heroTried = true;
    hero = buildHero();
    if (hero) hero.setEnabled(motionOn);
  }
  function scheduleHero() {
    if ('requestIdleCallback' in window) requestIdleCallback(heroLater, { timeout: 1200 });
    else setTimeout(heroLater, 400);
  }
  if (document.readyState === 'complete') setTimeout(scheduleHero, 250);
  else addEventListener('load', function () { setTimeout(scheduleHero, 250); }, { once: true });
  setTimeout(heroLater, 2200);

  /* ============================================================
     13. HERO REELS
     The strips drift in CSS. Script adds two things: the plane
     leans a few degrees toward the pointer, and the drift stops
     while the hero is off screen.
     ============================================================ */
  (function reels() {
    var heroEl = document.querySelector('.hero');
    var plane = document.querySelector('.hero__plane');
    if (!heroEl || !plane) return;

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        heroEl.classList.toggle('is-away', !en[0].isIntersecting);
      }, { threshold: 0 }).observe(heroEl);
    }

    if (!finePointer.matches) return;
    var tick = false, px = 0, py = 0;
    heroEl.addEventListener('pointermove', function (e) {
      if (!lively()) return;
      var r = heroEl.getBoundingClientRect();
      px = ((e.clientY - r.top) / r.height - 0.5) * -6;     /* rotateX, degrees */
      py = ((e.clientX - r.left) / r.width - 0.5) * 9;      /* rotateY, degrees */
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () {
        plane.style.setProperty('--px', px.toFixed(2) + 'deg');
        plane.style.setProperty('--py', py.toFixed(2) + 'deg');
        tick = false;
      });
    }, { passive: true });
    heroEl.addEventListener('pointerleave', function () {
      plane.style.removeProperty('--px');
      plane.style.removeProperty('--py');
    });
  })();

  /* ============================================================
     14. ROLLING NUMBERS
     Each digit sits on its own strip and rolls to its value the
     first time it is seen. The plain number stays in the DOM for
     screen readers; the strips are decoration.
     ============================================================ */
  (function rolls() {
    var els = all('[data-roll]');
    if (!els.length) return;

    els.forEach(function (el) {
      var txt = el.getAttribute('data-roll');
      var sr = document.createElement('span');
      sr.className = 'sr';
      sr.textContent = txt;
      var roll = document.createElement('span');
      roll.className = 'roll';
      roll.setAttribute('aria-hidden', 'true');

      var digitIndex = 0;
      txt.split('').forEach(function (ch) {
        if (!/\d/.test(ch)) {
          var plain = document.createElement('span');
          plain.textContent = ch;
          roll.appendChild(plain);
          return;
        }
        var cell = document.createElement('span');
        cell.className = 'roll__d';
        var strip = document.createElement('span');
        strip.className = 'roll__s';
        /* two full turns of the wheel, so every digit travels before it lands */
        for (var i = 0; i < 20; i++) {
          var d = document.createElement('span');
          d.textContent = String(i % 10);
          strip.appendChild(d);
        }
        strip.style.setProperty('--to', String(10 + Number(ch)));
        strip.style.setProperty('--d', String(digitIndex++));
        cell.appendChild(strip);
        roll.appendChild(cell);
      });

      el.textContent = '';
      el.appendChild(sr);
      el.appendChild(roll);
    });

    var land = function (el) { el.classList.add('is-rolled'); };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          /* let the boot screen clear before the first numbers move */
          setTimeout(function () { land(en.target); }, root.classList.contains('is-booting') ? 900 : 120);
          io.unobserve(en.target);
        });
      }, { threshold: 0.6 });
      els.forEach(function (el) { io.observe(el); });
      setTimeout(function () { els.forEach(land); }, 6000);
    } else {
      els.forEach(land);
    }
  })();

  /* ============================================================
     15. WORK GRID: tilt, "new" marks, filters
     ============================================================ */
  var grid = document.getElementById('grid');
  var tiles = all('.tile', grid || document);

  /* a title released in the last three months is marked as new;
     the mark retires itself, nobody has to remember to remove it */
  (function marks() {
    var now = new Date();
    var nowMonths = now.getFullYear() * 12 + now.getMonth();
    tiles.forEach(function (tile) {
      var m = /^(\d{4})-(\d{2})$/.exec(tile.getAttribute('data-date') || '');
      if (!m) return;
      var age = nowMonths - (Number(m[1]) * 12 + Number(m[2]) - 1);
      if (age < 0 || age > 3) return;
      var art = tile.querySelector('.tile__art');
      if (!art) return;
      var tag = document.createElement('span');
      tag.className = 'tile__new';
      tag.textContent = 'New';
      art.appendChild(tag);
    });
  })();

  /* the tile leans toward the pointer and a highlight follows it */
  if (finePointer.matches) {
    tiles.forEach(function (tile) {
      var tick = false, ev = null;
      tile.addEventListener('pointermove', function (e) {
        if (!lively()) return;
        ev = e;
        if (tick) return;
        tick = true;
        requestAnimationFrame(function () {
          tick = false;
          var r = tile.getBoundingClientRect();
          var x = (ev.clientX - r.left) / r.width;
          var y = (ev.clientY - r.top) / r.height;
          tile.classList.add('is-tilting');
          tile.style.setProperty('--ry', ((x - 0.5) * 9).toFixed(2) + 'deg');
          tile.style.setProperty('--rx', ((0.5 - y) * 9).toFixed(2) + 'deg');
          tile.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
          tile.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
        });
      }, { passive: true });
      tile.addEventListener('pointerleave', function () {
        tile.classList.remove('is-tilting');
        tile.style.removeProperty('--rx');
        tile.style.removeProperty('--ry');
      });
    });
  }

  /* filters */
  var filterBar = document.querySelector('.filters');
  var chips = all('.chip');
  var countEl = document.querySelector('[data-count]');
  var activeFilter = 'all';

  function visibleTiles() {
    return tiles.filter(function (t) { return !t.hidden; });
  }

  function setFilter(cat) {
    activeFilter = cat;
    var shown = 0;
    tiles.forEach(function (tile) {
      var on = cat === 'all' || tile.getAttribute('data-cat') === cat;
      tile.hidden = !on;
      if (on) {
        shown++;
        /* a tile that was never scrolled to must not stay invisible */
        tile.classList.add('is-in', 'is-settled');
      }
    });
    chips.forEach(function (c) {
      c.setAttribute('aria-pressed', c.getAttribute('data-filter') === cat ? 'true' : 'false');
    });
    if (countEl) countEl.textContent = String(shown);
  }

  if (filterBar && chips.length && tiles.length) {
    filterBar.hidden = false;
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var cat = chip.getAttribute('data-filter');
        if (cat === activeFilter) return;
        /* Where the browser supports it, each tile is named for the length of
           one transition so it glides to its new slot instead of jumping. */
        if (document.startViewTransition && lively()) {
          tiles.forEach(function (t, i) { t.style.viewTransitionName = 'tile-' + i; });
          var vt = document.startViewTransition(function () { setFilter(cat); });
          var clear = function () { tiles.forEach(function (t) { t.style.viewTransitionName = ''; }); };
          vt.finished.then(clear, clear);
        } else {
          setFilter(cat);
        }
      });
    });
  }

  /* ============================================================
     16. QUICK VIEW
     A tile is a plain link to its game. With script, a click opens
     the details instead: the art at full size, the specifications,
     both links, and next/previous through whatever is filtered.
     Modified clicks (new tab, new window) still follow the link.
     ============================================================ */
  var qv = document.getElementById('qv');
  var openQuickView = null;

  if (qv && typeof qv.showModal === 'function' && tiles.length) {
    var q = function (name) { return qv.querySelector('[data-qv="' + name + '"]'); };
    var qvImg = qv.querySelector('.qv__img');
    var qvGlow = qv.querySelector('.qv__glow');
    var qvList = [], qvIndex = 0, qvOpener = null, qvBusy = false;

    var fill = function (tile) {
      var d = tile.dataset;
      var name = tile.querySelector('h3').textContent;
      var img = tile.querySelector('img');
      var source = tile.querySelector('source');

      q('no').textContent = tile.querySelector('.tile__no').textContent;
      q('meta').textContent = d.type + ' · ' + d.released;
      q('name').textContent = name;
      q('desc').textContent = d.desc || '';

      var specs = q('specs');
      specs.textContent = '';
      [['Layout', d.layout], ['Volatility', d.vol], ['Max win', d.max], ['Released', d.released]]
        .forEach(function (row) {
          if (!row[1]) return;
          var wrap = document.createElement('div');
          var dt = document.createElement('dt');
          var dd = document.createElement('dd');
          dt.textContent = row[0];
          dd.textContent = row[1];
          wrap.appendChild(dt);
          wrap.appendChild(dd);
          specs.appendChild(wrap);
        });

      var demo = q('demo'), page = q('page');
      demo.hidden = !d.demo;
      if (d.demo) demo.href = d.demo; else demo.removeAttribute('href');
      page.href = d.page;
      page.classList.toggle('btn--primary', !d.demo);

      qvImg.sizes = '(min-width:760px) 31rem, 92vw';
      qvImg.srcset = source ? source.srcset : '';
      qvImg.src = img.getAttribute('src');
      qvImg.alt = img.alt;
      qvGlow.src = img.currentSrc || img.getAttribute('src');

      q('count').textContent = (qvIndex + 1) + ' of ' + qvList.length;
    };

    var go = function (step) {
      if (qvBusy || qvList.length < 2) return;
      qvIndex = (qvIndex + step + qvList.length) % qvList.length;
      if (!lively()) { fill(qvList[qvIndex]); return; }
      qvBusy = true;
      qv.style.setProperty('--dir', String(-step));
      qv.classList.add('is-swapping');
      setTimeout(function () {
        fill(qvList[qvIndex]);
        qv.style.setProperty('--dir', String(step));
        /* two frames so the incoming copy starts from the far side */
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            qv.classList.remove('is-swapping');
            qvBusy = false;
          });
        });
      }, 200);
    };

    var shut = function () {
      if (!qv.open || qv.classList.contains('is-closing')) return;
      var finish = function () {
        qv.classList.remove('is-closing');
        qv.close();
      };
      if (!lively()) { finish(); return; }
      qv.classList.add('is-closing');
      setTimeout(finish, 200);
    };

    openQuickView = function (tile, opener) {
      qvList = visibleTiles();
      if (qvList.indexOf(tile) === -1) qvList = tiles.slice();
      qvIndex = qvList.indexOf(tile);
      qvOpener = opener || tile;
      fill(tile);
      root.classList.add('is-modal');
      qv.showModal();
    };

    qv.addEventListener('close', function () {
      root.classList.remove('is-modal');
      if (qvOpener && qvOpener.focus) qvOpener.focus({ preventScroll: true });
    });
    /* Escape: let the dialog close through the same exit as the button */
    qv.addEventListener('cancel', function (e) { e.preventDefault(); shut(); });
    /* a click on the backdrop lands on the dialog element itself */
    qv.addEventListener('click', function (e) {
      if (e.target === qv || e.target.closest('[data-qv-close]')) { shut(); return; }
      var stepBtn = e.target.closest('[data-qv-go]');
      if (stepBtn) go(Number(stepBtn.getAttribute('data-qv-go')));
    });
    qv.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });

    var plainClick = function (e) {
      return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
    };
    /* the pill stops promising a new tab once it opens the details instead */
    var relabel = function (el) {
      el.setAttribute('aria-haspopup', 'dialog');
      var label = el.querySelector('[data-go]');
      if (!label) return;
      label.textContent = 'Details';
      var use = label.parentNode.querySelector('use');
      if (use) use.setAttribute('href', '#i-plus');
    };
    openQuickView.relabel = relabel;

    tiles.forEach(function (tile) {
      relabel(tile);
      tile.addEventListener('click', function (e) {
        if (!plainClick(e)) return;
        e.preventDefault();
        openQuickView(tile, tile);
      });
    });
  }

  /* ============================================================
     17. LATEST RELEASES RAIL
     ============================================================ */
  (function rail() {
    var el = document.getElementById('rail');
    if (!el) return;
    var cards = all('.rcard', el);
    var ctl = document.querySelector('.rail-ctl');
    var fillBar = document.querySelector('.rail-bar span');
    var prev = ctl && ctl.querySelector('[data-rail="prev"]');
    var next = ctl && ctl.querySelector('[data-rail="next"]');

    var sync = function () {
      var max = el.scrollWidth - el.clientWidth;
      var seen = el.scrollWidth > 0 ? (el.scrollLeft + el.clientWidth) / el.scrollWidth : 1;
      if (fillBar) fillBar.style.setProperty('--p', Math.min(1, seen).toFixed(4));
      if (prev) prev.disabled = el.scrollLeft <= 2;
      if (next) next.disabled = el.scrollLeft >= max - 2;
      if (ctl) ctl.hidden = max <= 2;
    };

    var step = function (dir) {
      var card = cards[0];
      var gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      var by = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.8;
      el.scrollBy({ left: dir * by, behavior: lively() ? 'smooth' : 'auto' });
    };
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });

    var tick = false;
    el.addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () { tick = false; sync(); });
    }, { passive: true });
    addEventListener('resize', sync, { passive: true });
    sync();

    /* drag to scroll with a mouse; touch already scrolls natively */
    var down = false, moved = false, startX = 0, startLeft = 0;
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false;
      startX = e.clientX; startLeft = el.scrollLeft;
    });
    addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; el.classList.add('is-dragging'); }
      if (moved) el.scrollLeft = startLeft - dx;
    }, { passive: true });
    var release = function () {
      if (!down) return;
      down = false;
      if (moved) {
        el.classList.remove('is-dragging');
        /* swallow the click that ends a drag, so a card does not open */
        setTimeout(function () { moved = false; }, 0);
      }
    };
    addEventListener('pointerup', release);
    addEventListener('pointercancel', release);
    /* an image inside a link would otherwise start a native drag */
    el.addEventListener('dragstart', function (e) { e.preventDefault(); });

    cards.forEach(function (card) {
      var tile = grid && grid.querySelector('.tile[data-game="' + card.getAttribute('data-ref') + '"]');
      if (tile && openQuickView) openQuickView.relabel(card);
      card.addEventListener('click', function (e) {
        if (moved) { e.preventDefault(); return; }
        if (!tile || !openQuickView) return;
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        openQuickView(tile, card);
      });
    });
  })();

  /* ============================================================
     18. PIPELINE
     The ticker moves at a walking pace and picks up speed with the
     scroll. The stages are tabs; while nobody has touched them they
     advance on their own, and the first click hands control over.
     ============================================================ */
  (function ticker() {
    var row = document.querySelector('.ticker__row');
    if (!row || !('IntersectionObserver' in window)) return;
    var x = 0, raf = 0, onScreen = false, lastY = window.scrollY, speed = 0, dir = 1, last = 0;

    var frame = function (now) {
      raf = 0;
      if (!onScreen || !lively() || document.hidden) return;
      var dt = Math.min(64, now - (last || now));
      last = now;
      var sy = window.scrollY;
      var delta = sy - lastY;
      lastY = sy;
      if (delta) dir = delta > 0 ? 1 : -1;
      /* scroll adds to the pace, then it eases back to a stroll */
      speed += (Math.min(Math.abs(delta), 60) * 0.045 - speed) * 0.12;
      var half = row.scrollWidth / 2;
      x -= dir * (0.035 + speed * 0.05) * dt;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      row.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
      raf = requestAnimationFrame(frame);
    };
    var kick = function () { if (!raf) { last = 0; lastY = window.scrollY; raf = requestAnimationFrame(frame); } };

    new IntersectionObserver(function (en) {
      onScreen = en[0].isIntersecting;
      if (onScreen) kick();
    }, { threshold: 0 }).observe(row.parentNode);
    motionSubs.push(kick);
    document.addEventListener('visibilitychange', kick);
  })();

  (function pipeline() {
    var pipe = document.querySelector('[data-pipe]');
    if (!pipe) return;
    var tabs = all('.pipe__tab', pipe);
    var panels = all('.pipe__panel', pipe);
    var tabList = pipe.querySelector('.pipe__tabs');
    var railFill = pipe.querySelector('.pipe__rail span');
    if (!tabs.length || tabs.length !== panels.length) return;

    var current = -1, manual = false, onScreen = false;

    var select = function (i, focus) {
      if (i === current) return;
      current = i;
      tabs.forEach(function (tab, n) {
        var on = n === i;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
        tab.classList.toggle('is-done', n < i);
        panels[n].classList.toggle('is-active', on);
      });
      if (railFill) railFill.style.setProperty('--p', (i / (tabs.length - 1)).toFixed(3));
      /* keep the selected pill in view on a phone, without moving the page */
      if (tabList && tabList.scrollWidth > tabList.clientWidth) {
        tabList.scrollTo({ left: tabs[i].offsetLeft - 24, behavior: lively() ? 'smooth' : 'auto' });
      }
      if (focus) tabs[i].focus({ preventScroll: true });
    };

    var syncAuto = function () {
      pipe.classList.toggle('is-auto', !manual && onScreen && lively());
    };
    var takeOver = function () { manual = true; syncAuto(); };

    pipe.classList.add('is-tabs');
    select(0);

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { takeOver(); select(i); });
      /* the selected tab's clock has run out */
      tab.addEventListener('animationend', function (e) {
        if (e.animationName !== 'pipeClock' || manual || !lively()) return;
        select((current + 1) % tabs.length);
      });
    });

    if (tabList) {
      tabList.addEventListener('keydown', function (e) {
        var to = -1;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') to = (current + 1) % tabs.length;
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') to = (current - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = tabs.length - 1;
        if (to < 0) return;
        e.preventDefault();
        takeOver();
        select(to, true);
      });
    }

    /* reading or tabbing through a stage holds the clock */
    var hold = function (v) { return function () { pipe.classList.toggle('is-held', v); }; };
    pipe.addEventListener('pointerenter', hold(true));
    pipe.addEventListener('pointerleave', hold(false));
    pipe.addEventListener('focusin', hold(true));
    pipe.addEventListener('focusout', hold(false));

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        onScreen = en[0].isIntersecting;
        syncAuto();
      }, { threshold: 0.35 }).observe(pipe);
    }
    motionSubs.push(syncAuto);
  })();

  /* ============================================================
     19. SMALL TOUCHES
     ============================================================ */

  /* primary buttons lean a few pixels toward the pointer */
  if (finePointer.matches) {
    all('[data-magnet]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        if (!lively()) return;
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px');
        el.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px');
      }, { passive: true });
      el.addEventListener('pointerleave', function () {
        el.style.removeProperty('--mx');
        el.style.removeProperty('--my');
      });
    });
  }

  /* copy the address without opening a mail client */
  all('[data-copy]').forEach(function (btn) {
    if (!navigator.clipboard || !navigator.clipboard.writeText) return;
    var label = btn.querySelector('[data-copy-label]');
    var idle = label ? label.textContent : '';
    var timer = 0;
    btn.hidden = false;
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(function () {
        btn.classList.add('is-done');
        if (label) label.textContent = 'Copied';
        clearTimeout(timer);
        timer = setTimeout(function () {
          btn.classList.remove('is-done');
          if (label) label.textContent = idle;
        }, 1800);
      }).catch(function () { /* permission denied: the mail link is right there */ });
    });
  });

  applyMotion();
})();
