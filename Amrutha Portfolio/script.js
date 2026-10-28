(function () {
  var doc = document, root = doc.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || doc).querySelectorAll(s)); }
  function fmt(v, d) { return v.toFixed(d); }

  /* ---------- Ticker: duplicate the group for a seamless loop ---------- */
  var mq = $('#mq');
  if (mq) {
    var g = mq.firstElementChild.cloneNode(true);
    g.setAttribute('aria-hidden', 'true');
    mq.appendChild(g);
  }

  /* ---------- Rotating phrase ---------- */
  var list = $('#swapList');
  if (list && !reduce) {
    var first = list.firstElementChild.cloneNode(true);
    list.appendChild(first);
    var n = list.children.length - 1, idx = 0;
    setInterval(function () {
      idx++;
      list.style.transition = '';
      list.style.transform = 'translateY(' + (idx * -1.45) + 'em)';
      if (idx === n) {
        setTimeout(function () {
          list.style.transition = 'none';
          list.style.transform = 'translateY(0)';
          idx = 0;
        }, 720);
      }
    }, 2600);
  }

  /* ---------- Scroll reveal + counters ---------- */
  var vh = window.innerHeight;
  var counters = $$('[data-count]');
  function runCount(el) {
    var target = parseFloat(el.dataset.count), d = parseInt(el.dataset.dec, 10) || 0, t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / 1400);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * e, d);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target, d);
    }
    requestAnimationFrame(step);
  }
  var io = ('IntersectionObserver' in window && !reduce) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.remove('pre');
      $$('[data-count]', e.target).forEach(function (c) { if (c.dataset.pending) { c.dataset.pending = ''; runCount(c); } });
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;

  if (io) {
    $$('.rv').forEach(function (el) {
      if (el.getBoundingClientRect().top > vh * 0.95) {
        el.classList.add('pre');
        $$('[data-count]', el).forEach(function (c) { c.dataset.pending = '1'; c.textContent = fmt(0, parseInt(c.dataset.dec, 10) || 0); });
        io.observe(el);
      }
    });
    // Safety net: anything still hidden after a while is shown, so the page is always complete.
    setTimeout(function () {
      $$('.rv.pre').forEach(function (el) {
        el.classList.remove('pre');
        $$('[data-count]', el).forEach(function (c) { c.dataset.pending = ''; c.textContent = fmt(parseFloat(c.dataset.count), parseInt(c.dataset.dec, 10) || 0); });
      });
    }, 9000);
  }

  /* ---------- Pointer: spheres, glow, spotlight ---------- */
  var orbs = $$('.orb'), glow = $('#glow'), stage = $('#stage');
  var tx = 0, ty = 0, cx = 0, cy = 0, gx = 0, gy = 0, mx = 0, my = 0, active = false;
  window.addEventListener('pointermove', function (e) {
    tx = e.clientX / window.innerWidth - 0.5;
    ty = e.clientY / window.innerHeight - 0.5;
    mx = e.clientX; my = e.clientY;
    if (!active) { gx = mx; gy = my; active = true; if (fine && glow) glow.classList.add('on'); }
  }, { passive: true });
  doc.addEventListener('pointerleave', function () { if (glow) glow.classList.remove('on'); active = false; });

  $$('.spot').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--px', (e.clientX - r.left) + 'px');
      el.style.setProperty('--py', (e.clientY - r.top) + 'px');
    }, { passive: true });
  });

  function frame() {
    if (!reduce) {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      for (var i = 0; i < orbs.length; i++) {
        var d = parseFloat(orbs[i].dataset.d) || 20;
        orbs[i].style.transform = 'translate3d(' + (cx * d).toFixed(2) + 'px,' + (cy * d).toFixed(2) + 'px,0)';
      }
      if (fine && glow && active) {
        gx += (mx - gx) * 0.1; gy += (my - gy) * 0.1;
        glow.style.transform = 'translate3d(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px,0)';
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- Nav: progress + sliding indicator ---------- */
  var nav = $('#nav'), pill = $('#pill'), links = $$('#links a');
  var secs = ['about', 'skills', 'work', 'contact'].map(function (id) { return doc.getElementById(id); });
  var current = null, ticking = false;
  function setActive(id) {
    if (id === current) return;
    current = id;
    var on = null;
    links.forEach(function (a) { var m = a.dataset.s === id; a.classList.toggle('on', m); if (m) on = a; });
    if (on) {
      pill.style.left = on.offsetLeft + 'px';
      pill.style.width = on.offsetWidth + 'px';
      pill.style.opacity = 1;
    } else {
      pill.style.opacity = 0;
    }
  }
  function onScroll() {
    ticking = false;
    var y = window.scrollY, h = root.scrollHeight - window.innerHeight;
    nav.style.setProperty('--p', h > 0 ? Math.min(1, y / h) : 0);
    stage.style.setProperty('--sy', y);
    var cur = null;
    secs.forEach(function (s) { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.45) cur = s.id; });
    setActive(cur);
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', function () { var c = current; current = undefined; setActive(c || null); onScroll(); });
  onScroll();

  /* ---------- Effects ---------- */
  var fx = $('#fx');
  function burst(x, y, n, cols) {
    if (reduce || !fx || !fx.animate) return;
    for (var i = 0; i < n; i++) {
      var d = doc.createElement('i');
      var s = 6 + Math.random() * 9;
      d.className = 'dot';
      d.style.width = s + 'px';
      d.style.height = s + 'px';
      d.style.margin = (-s / 2) + 'px 0 0 ' + (-s / 2) + 'px';
      d.style.background = 'radial-gradient(circle at 35% 30%, #fff, ' + cols[i % cols.length] + ' 45%, rgba(40,16,110,0.9))';
      fx.appendChild(d);
      var a = Math.random() * Math.PI * 2, dist = 50 + Math.random() * 100;
      var dx = Math.cos(a) * dist, dy = Math.sin(a) * dist - 30;
      var an = d.animate([
        { transform: 'translate(' + x + 'px,' + y + 'px) scale(1)', opacity: 1 },
        { transform: 'translate(' + (x + dx) + 'px,' + (y + dy + 70) + 'px) scale(0.2)', opacity: 0 }
      ], { duration: 700 + Math.random() * 600, easing: 'cubic-bezier(0.15,0.7,0.3,1)' });
      an.onfinish = (function (el) { return function () { el.remove(); }; })(d);
    }
  }
  function floatText(x, y, text) {
    if (reduce || !fx || !fx.animate) return;
    var t = doc.createElement('span');
    t.className = 'xp';
    t.textContent = text;
    t.style.margin = '-10px 0 0 -26px';
    fx.appendChild(t);
    var an = t.animate([
      { transform: 'translate(' + x + 'px,' + y + 'px)', opacity: 0 },
      { transform: 'translate(' + x + 'px,' + (y - 22) + 'px)', opacity: 1, offset: 0.25 },
      { transform: 'translate(' + x + 'px,' + (y - 64) + 'px)', opacity: 0 }
    ], { duration: 1100, easing: 'ease-out' });
    an.onfinish = function () { t.remove(); };
  }

  /* ---------- Skills game ---------- */
  var ZONES = [
    { id: 'all', name: 'All zones', c: '#cfcdfa' },
    { id: 'lang', name: 'Languages', c: '#f2549a' },
    { id: 'vision', name: 'Vision', c: '#a9a5f0' },
    { id: 'ml', name: 'Machine learning', c: '#a24fd6' },
    { id: 'rag', name: 'RAG and apps', c: '#f5a3c7' },
    { id: 'edge', name: 'Edge', c: '#7f8df0' },
    { id: 'ocean', name: 'Ocean data', c: '#6ab4f5' }
  ];
  var SK = [
    ['C', 'Systems and signal-processing code', 'lang'],
    ['Python', 'ML, apps and serial tooling', 'lang'],
    ['OpenCV', 'Fatigue and gesture tracking', 'vision'],
    ['MediaPipe', 'Landmark and pose tracking', 'vision'],
    ['CLAHE', 'Adaptive contrast enhancement', 'vision'],
    ['Unsharp masking', 'Detail enhancement', 'vision'],
    ['FFT filtering', 'Butterworth low-pass restoration', 'vision'],
    ['Model training', 'Foundational training workflows', 'ml'],
    ['PyTorch', 'Training and deployment', 'ml'],
    ['DnCNN', 'Deployed denoising network', 'ml'],
    ['PINNs', 'Physics-informed learning', 'ml'],
    ['RAG pipelines', 'Retrieval over a REST API', 'rag'],
    ['Gemini embeddings', 'Text embeddings', 'rag'],
    ['ChromaDB', 'Local vector database', 'rag'],
    ['Streamlit', 'Dashboards and tools', 'rag'],
    ['ESP32', 'Microcontroller edge computing', 'edge'],
    ['PySerial', 'Board-to-host link', 'edge'],
    ['Robotic arm control', 'Real-time commands, 3-DOF arm', 'edge'],
    ['ARGO float data', 'Subsurface ocean profiles', 'ocean'],
    ['Satellite grids', 'Surface observations', 'ocean'],
    ['3D reconstruction', 'Temperature and salinity profiles', 'ocean']
  ];
  var RANKS = [[0, 'Newcomer'], [1, 'Curious'], [6, 'Explorer'], [11, 'Builder'], [21, 'Architect']];
  var XP = 10, CIRC = 226.2;
  function zoneOf(id) { for (var i = 0; i < ZONES.length; i++) if (ZONES[i].id === id) return ZONES[i]; return ZONES[0]; }

  var grid = $('#skillGrid'), zonesEl = $('#zones');
  var opened = 0, zoneDone = {}, zoneTotals = {};
  SK.forEach(function (s) { zoneTotals[s[2]] = (zoneTotals[s[2]] || 0) + 1; });
  $('#tot').textContent = '/' + SK.length;

  grid.innerHTML = SK.map(function (s, i) {
    return '<button type="button" class="sk" data-i="' + i + '" data-z="' + s[2] + '" style="--zc:' + zoneOf(s[2]).c + '" aria-pressed="false" aria-label="' + s[0] + ', locked. Activate to unlock.">' +
      '<span class="in">' +
      '<span class="face front"><span class="row"><i class="gem"></i><span class="tag">Locked</span></span><span><b>' + s[0] + '</b><em>Click to unlock</em></span></span>' +
      '<span class="face back"><span class="row"><span class="tag ok">Unlocked</span></span><span><b>' + s[0] + '</b><small>' + s[1] + '</small></span></span>' +
      '</span></button>';
  }).join('');

  zonesEl.innerHTML = '<span class="zone-pill" id="zonePill"></span>' + ZONES.map(function (z, i) {
    var n = z.id === 'all' ? SK.length : zoneTotals[z.id];
    return '<button type="button" class="zone' + (i === 0 ? ' on' : '') + '" data-z="' + z.id + '" style="--zc:' + z.c + '"><i class="zdot"></i><span>' + z.name + '</span><em class="zc">0/' + n + '</em></button>';
  }).join('');

  var tiles = $$('.sk', grid), zoneBtns = $$('.zone', zonesEl), zonePill = $('#zonePill');
  function countIn(z) {
    var n = 0;
    tiles.forEach(function (t) { if (t.classList.contains('open') && (z === 'all' || t.dataset.z === z)) n++; });
    return n;
  }
  function refresh() {
    $('#cnt').textContent = opened;
    $('#ringPg').style.strokeDashoffset = (CIRC * (1 - opened / SK.length)).toFixed(1);
    $('#xpfill').style.width = (opened / SK.length * 100) + '%';
    $('#xptxt').textContent = (opened * XP) + ' / ' + (SK.length * XP) + ' XP';
    var rank = RANKS[0][1];
    RANKS.forEach(function (r) { if (opened >= r[0]) rank = r[1]; });
    $('#rank').textContent = rank;
    zoneBtns.forEach(function (b) {
      var z = b.dataset.z, n = z === 'all' ? SK.length : zoneTotals[z], d = countIn(z);
      $('.zc', b).textContent = d + '/' + n + (d === n ? ' ✓' : '');
      b.classList.toggle('done', d === n);
    });
  }
  function unlock(el, quiet) {
    if (el.classList.contains('open')) return;
    var s = SK[+el.dataset.i], z = el.dataset.z, c = zoneOf(z).c;
    el.classList.add('open');
    el.setAttribute('aria-pressed', 'true');
    el.setAttribute('aria-label', s[0] + ': ' + s[1]);
    opened++;
    var r = el.getBoundingClientRect(), cx2 = r.left + r.width / 2, cy2 = r.top + r.height / 2;
    burst(cx2, cy2, quiet ? 7 : 16, [c, '#ffffff', 'var(--lav)']);
    floatText(cx2, r.top + 14, '+' + XP + ' XP');
    refresh();
    if (!zoneDone[z] && countIn(z) === zoneTotals[z]) {
      zoneDone[z] = 1;
      if (!quiet) say(zoneOf(z).name + ' zone cleared');
    }
    if (opened === SK.length && !quiet) say('All ' + SK.length + ' skills unlocked. Rank: Architect');
  }
  grid.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('.sk') : null;
    if (t) unlock(t, false);
  });

  function placeZonePill() {
    var on = $('.zone.on', zonesEl);
    if (!on) return;
    zonePill.style.left = on.offsetLeft + 'px';
    zonePill.style.top = on.offsetTop + 'px';
    zonePill.style.width = on.offsetWidth + 'px';
    zonePill.style.height = on.offsetHeight + 'px';
  }
  zoneBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      zoneBtns.forEach(function (o) { o.classList.toggle('on', o === b); });
      placeZonePill();
      var k = 0;
      tiles.forEach(function (t) {
        var off = b.dataset.z !== 'all' && t.dataset.z !== b.dataset.z;
        t.classList.toggle('off', off);
        t.classList.remove('pop');
        if (!off) {
          t.style.setProperty('--k', k++);
          void t.offsetWidth;
          t.classList.add('pop');
        }
      });
    });
  });
  function settleZonePill() { zonePill.style.transition = 'none'; placeZonePill(); void zonePill.offsetWidth; zonePill.style.transition = ''; }
  settleZonePill();
  window.addEventListener('resize', settleZonePill);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(settleZonePill);

  $('#unlockAll').addEventListener('click', function () {
    var k = 0;
    tiles.forEach(function (t) {
      if (t.classList.contains('open')) return;
      setTimeout(function () { unlock(t, true); }, k++ * 55);
    });
    setTimeout(function () { say('All ' + SK.length + ' skills unlocked. Rank: Architect'); }, k * 55 + 100);
  });
  $('#resetSk').addEventListener('click', function () {
    tiles.forEach(function (t) {
      t.classList.remove('open');
      t.setAttribute('aria-pressed', 'false');
      t.setAttribute('aria-label', SK[+t.dataset.i][0] + ', locked. Activate to unlock.');
    });
    opened = 0;
    zoneDone = {};
    refresh();
  });
  refresh();

  /* ---------- Projects arena ---------- */
  var LOCK = '<svg class="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="sh" d="M8 11V8a4 4 0 0 1 8 0v3"/><rect x="5" y="11" width="14" height="10" rx="2.5" fill="rgba(255,255,255,0.2)"/></svg>';
  var PROJ = [
    { short: 'AETHRA-VIZ', name: 'AETHRA-VIZ', cls: 'o2', a: 'var(--p1a)', b: 'var(--p1b)',
      stack: ['Streamlit', 'ChromaDB', 'RAG'],
      desc: 'A gamified code analysis platform built with Streamlit, custom pixel-UI styling and a local ChromaDB RAG pipeline. It turns C and Python code into interactive, Socratic debugging guides.',
      steps: ['C or Python code goes into the platform', 'A local ChromaDB RAG pipeline retrieves context', 'Output is an interactive, Socratic debugging guide', 'Streamlit with pixel-UI styling makes it a game'] },
    { short: 'Image Healer', name: 'Image Restoration Engine', cls: 'o6', a: 'var(--p2a)', b: 'var(--p2b)',
      stack: ['C', 'FFT', 'CLAHE', 'Streamlit'],
      desc: 'A C-based digital signal processing pipeline that restores corrupted BMP images using 2D FFT Butterworth low-pass filtering, median filtering and CLAHE, paired with a Streamlit diagnostic dashboard.',
      steps: ['A corrupted BMP image enters the pipeline', '2D FFT with a Butterworth low-pass filter', 'Median filtering removes impulse noise', 'CLAHE restores local contrast', 'A Streamlit dashboard shows the diagnostics'] },
    { short: 'OceanEmbed', name: 'OceanEmbed', cls: 'o5', a: 'var(--p3a)', b: 'var(--p3b)',
      stack: ['PINNs', 'ARGO', 'PyTorch'],
      desc: 'A scientific ML tool that uses Physics-Informed Neural Networks trained on ARGO float data and surface satellite grids to reconstruct 3D ocean subsurface temperature and salinity profiles.',
      steps: ['ARGO float data and surface satellite grids as input', 'Physics-Informed Neural Networks learn from both', 'The model reconstructs the ocean below the surface', 'Output is 3D temperature and salinity profiles'] },
    { short: 'HAMMER', name: 'HAMMER', cls: 'o4', a: 'var(--p4a)', b: 'var(--p4b)',
      stack: ['OpenCV', 'MediaPipe', 'ESP32'],
      desc: 'An industrial safety system using OpenCV and MediaPipe for driver and operator fatigue and gesture tracking. It sends real-time safety commands to microcontrollers that manage a 3-DOF robotic arm.',
      steps: ['Camera feed of the driver or operator', 'OpenCV and MediaPipe track fatigue and gestures', 'Real-time safety commands are generated', 'Microcontrollers move the 3-DOF robotic arm'] }
  ];
  var arena = $('#arena'), dp = $('#dp'), pips = $('#pips'), pcount = $('#pcount');
  var balls = [], W = 0, H = 0, TOP = 46, BOT = 44, SPD = 70;
  var running = false, last = 0, unlockedN = 0;

  pips.innerHTML = PROJ.map(function () { return '<i class="pip"></i>'; }).join('');
  PROJ.forEach(function (p, i) {
    var el = doc.createElement('button');
    el.type = 'button';
    el.className = 'pball';
    el.setAttribute('aria-label', p.short + ', locked project. Activate to unlock.');
    el.innerHTML = '<span class="ball ' + p.cls + '"></span><span class="pl">' + LOCK + '<span>' + p.short + '</span></span>';
    arena.appendChild(el);
    var b = { el: el, p: p, x: 0, y: 0, vx: 0, vy: 0, d: 120, f: 1, hover: false, held: false, unlocked: false, i: i };
    balls.push(b);
    el.addEventListener('pointerenter', function () { b.hover = true; });
    el.addEventListener('pointerleave', function () { b.hover = false; });
    el.addEventListener('pointerdown', function () { b.held = true; });
    ['pointerup', 'pointercancel'].forEach(function (ev) { el.addEventListener(ev, function () { setTimeout(function () { b.held = false; }, 500); }); });
    el.addEventListener('click', function () { choose(b); });
  });

  function place(b) { b.el.style.transform = 'translate3d(' + b.x.toFixed(1) + 'px,' + b.y.toFixed(1) + 'px,0)'; }
  function layout(first) {
    W = arena.clientWidth; H = arena.clientHeight;
    var D = Math.max(84, Math.min(148, W * 0.24));
    SPD = Math.max(46, Math.min(92, W * 0.085));
    var minY = TOP, maxY = H - BOT;
    balls.forEach(function (b, i) {
      b.d = D;
      b.el.style.width = D + 'px';
      b.el.style.height = D + 'px';
      b.el.style.fontSize = (D * 0.112).toFixed(1) + 'px';
      if (first) {
        var col = i % 2, row = Math.floor(i / 2), jit = reduce ? 0 : 20;
        b.x = W * (0.27 + 0.46 * col) - D / 2 + (Math.random() - 0.5) * jit;
        b.y = minY + (maxY - minY) * (0.27 + 0.46 * row) - D / 2 + (Math.random() - 0.5) * jit;
        var a = Math.random() * Math.PI * 2;
        b.vx = reduce ? 0 : Math.cos(a) * SPD;
        b.vy = reduce ? 0 : Math.sin(a) * SPD;
      }
      b.x = Math.max(0, Math.min(W - D, b.x));
      b.y = Math.max(minY, Math.min(maxY - D, b.y));
      place(b);
    });
  }
  function tick(t) {
    if (!running) return;
    var dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    var minY = TOP, maxY = H - BOT, i, j;
    for (i = 0; i < balls.length; i++) {
      var b = balls[i];
      b.f += (((b.hover || b.held) ? 0.12 : 1) - b.f) * Math.min(1, dt * 7);
      b.x += b.vx * dt * b.f;
      b.y += b.vy * dt * b.f;
      if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx); }
      else if (b.x > W - b.d) { b.x = W - b.d; b.vx = -Math.abs(b.vx); }
      if (b.y < minY) { b.y = minY; b.vy = Math.abs(b.vy); }
      else if (b.y > maxY - b.d) { b.y = maxY - b.d; b.vy = -Math.abs(b.vy); }
      var sp = Math.hypot(b.vx, b.vy) || 1, k = 1 + (SPD / sp - 1) * Math.min(1, dt * 1.5);
      b.vx *= k; b.vy *= k;
    }
    for (i = 0; i < balls.length; i++) {
      for (j = i + 1; j < balls.length; j++) {
        var a2 = balls[i], c2 = balls[j];
        var dx = (c2.x + c2.d / 2) - (a2.x + a2.d / 2), dy = (c2.y + c2.d / 2) - (a2.y + a2.d / 2);
        var dist = Math.hypot(dx, dy), min = (a2.d + c2.d) / 2;
        if (dist < min && dist > 0) {
          var nx = dx / dist, ny = dy / dist, ov = (min - dist) / 2;
          a2.x -= nx * ov; a2.y -= ny * ov; c2.x += nx * ov; c2.y += ny * ov;
          var vn = (a2.vx - c2.vx) * nx + (a2.vy - c2.vy) * ny;
          if (vn > 0) { a2.vx -= vn * nx; a2.vy -= vn * ny; c2.vx += vn * nx; c2.vy += vn * ny; }
        }
      }
    }
    for (i = 0; i < balls.length; i++) place(balls[i]);
    requestAnimationFrame(tick);
  }
  function start() { if (running || reduce) return; running = true; last = performance.now(); requestAnimationFrame(tick); }
  function stop() { running = false; }

  function renderLocked() {
    dp.innerHTML = '<div class="dp-locked">' + LOCK + '<strong>Locked</strong><p>Click a ball in the arena to unlock the project inside.</p><span class="mono">' + unlockedN + ' of ' + PROJ.length + ' unlocked</span></div>';
  }
  function renderProject(p) {
    dp.innerHTML = '<div class="dp-body">' +
      '<div class="art" style="--a:' + p.a + ';--b:' + p.b + '"><span class="mini"></span><span class="stack">' + p.stack.join(' &middot; ') + '</span></div>' +
      '<div class="dp-text"><h3>' + p.name + '</h3><p class="d">' + p.desc + '</p>' +
      '<div class="tags">' + p.stack.map(function (s) { return '<span>' + s + '</span>'; }).join('') + '</div>' +
      '<span class="mono">How it works</span>' +
      '<ul class="flow">' + p.steps.map(function (s, i) { return '<li style="--i:' + i + '">' + s + '</li>'; }).join('') + '</ul></div></div>';
  }
  function choose(b) {
    var first = !b.unlocked;
    b.unlocked = true;
    balls.forEach(function (o) { o.el.classList.toggle('sel', o === b); });
    b.el.classList.add('unlocked');
    b.el.setAttribute('aria-label', b.p.name + ', unlocked. Details are shown beside the arena.');
    b.el.classList.remove('pulse');
    void b.el.offsetWidth;
    b.el.classList.add('pulse');
    if (first) {
      unlockedN++;
      var r = b.el.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, unlockedN === PROJ.length ? 30 : 18, [b.p.a, b.p.b, '#ffffff', 'var(--lav)']);
      $$('.pip', pips).forEach(function (pp, i) { pp.classList.toggle('on', i < unlockedN); });
      pcount.textContent = unlockedN + ' / ' + PROJ.length + ' unlocked';
      $('#lockAll').disabled = false;
      say(unlockedN === PROJ.length ? 'All projects unlocked' : b.p.short + ' unlocked');
    }
    renderProject(b.p);
    if (window.innerWidth <= 900) {
      var dr = dp.getBoundingClientRect();
      if (dr.top > window.innerHeight * 0.75 || dr.bottom < 0) dp.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    }
  }

  $('#lockAll').addEventListener('click', function () {
    balls.forEach(function (b) {
      b.unlocked = false;
      b.el.classList.remove('unlocked', 'sel', 'pulse');
      b.el.setAttribute('aria-label', b.p.short + ', locked project. Activate to unlock.');
    });
    unlockedN = 0;
    $$('.pip', pips).forEach(function (pp) { pp.classList.remove('on'); });
    pcount.textContent = '0 / ' + PROJ.length + ' unlocked';
    $('#lockAll').disabled = true;
    renderLocked();
    say('Projects locked again');
  });

  renderLocked();
  layout(true);
  window.addEventListener('resize', function () { layout(false); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) start(); else stop(); }); }, { threshold: 0.05 }).observe(arena);
  } else {
    start();
  }

  /* ---------- Copy email ---------- */
  var toast = $('#toast'), tt;
  function say(msg) {
    toast.textContent = msg;
    toast.classList.add('on');
    clearTimeout(tt);
    tt = setTimeout(function () { toast.classList.remove('on'); }, 2200);
  }
  function selectMail() {
    var r = doc.createRange();
    r.selectNodeContents($('#mail'));
    var s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }
  $('#copy').addEventListener('click', function () {
    var text = $('#mail').textContent;
    var p = (navigator.clipboard && navigator.clipboard.writeText) ? navigator.clipboard.writeText(text) : Promise.reject();
    p.then(function () { say('Email copied'); }).catch(function () { selectMail(); say('Address selected, press Ctrl+C or Cmd+C'); });
  });
  /* ---------- Theme switch ---------- */
  var look = root.getAttribute('data-look') === 'ember' ? 'ember' : 'aurora';
  function applyLook(n, user) {
    look = n;
    root.setAttribute('data-look', n);
    var b = $('#theme');
    b.setAttribute('aria-label', 'Switch to the ' + (n === 'ember' ? 'Aurora' : 'Ember') + ' theme');
    if (user) {
      try { localStorage.setItem('look', n); } catch (e) {}
      b.classList.remove('spin');
      void b.offsetWidth;
      b.classList.add('spin');
      say((n === 'ember' ? 'Ember' : 'Aurora') + ' theme');
    }
    if (window.__glLook) window.__glLook(n, !!user);
  }
  $('#theme').addEventListener('click', function () { applyLook(look === 'ember' ? 'aurora' : 'ember', true); });

  /* ---------- 3D scene (Three.js) ---------- */
  (function glScene() {
    var T = window.THREE;
    if (!T) return;
    var canvas = doc.createElement('canvas'), renderer;
    try {
      renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (err) { return; }
    if (!renderer || !renderer.getContext()) return;

    var narrow = window.innerWidth < 700;
    var PAL = {
      aurora: { env: ['#ff6fb0', '#a24fd6', '#4b3bb0', '#cfcdfa', '#1d1050'], rim: '#ff6fb0', blob: '#e8559f', ring: '#cfcdfa', crystal: '#a24fd6', knot: '#f2549a', gyro: '#cfcdfa', donut: '#cfcdfa',
        sats: ['#ff8fb8', '#cfcdfa', '#a24fd6', '#6f7df5'], bub: ['#f2549a', '#cfcdfa', '#a24fd6', '#6f7df5'] },
      ember: { env: ['#ff9a5c', '#ff3d7f', '#6a2cf5', '#ffd2b8', '#12031f'], rim: '#ff8a50', blob: '#ff6a3a', ring: '#ffd2b8', crystal: '#6a2cf5', knot: '#ff7a45', gyro: '#ffc9a8', donut: '#8a3cff',
        sats: ['#ffb27a', '#ffd9c4', '#7c3cff', '#ff3d7f'], bub: ['#ff7a45', '#ffc9a8', '#8a3cff', '#ff3d7f'] }
    };
    function pc(key, idx) { var v = PAL[look][key]; return Array.isArray(v) ? v[idx % v.length] : v; }

    var running = true, W = 0, H = 0, pw = 0, ph = 0;
    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(35, 1, 0.1, 200);
    var mats = [];
    var cleanup = function () {
      running = false;
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      root.classList.remove('gl');
    };

    try {
      canvas.id = 'gl';
      canvas.setAttribute('aria-hidden', 'true');
      stage.parentNode.insertBefore(canvas, stage.nextSibling);
      root.classList.add('gl');
      renderer.setClearColor(0x000000, 0);
      renderer.outputEncoding = T.sRGBEncoding;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      var EXPO = 0.95;
      renderer.toneMappingExposure = EXPO;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 1.75));
      canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); cleanup(); });

      /* Studio-style reflection map painted from the theme colours */
      var pmrem = new T.PMREMGenerator(renderer);
      var hexRgb = function (h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
      var rgba = function (h, a) { var c = hexRgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; };
      var makeEnv = function (c) {
        var cv = doc.createElement('canvas');
        cv.width = 1024; cv.height = 512;
        var g = cv.getContext('2d');
        var gr = g.createLinearGradient(0, 0, 0, 512);
        gr.addColorStop(0, c[0]); gr.addColorStop(0.5, c[1]); gr.addColorStop(0.8, c[2]); gr.addColorStop(1, c[4]);
        g.fillStyle = gr;
        g.fillRect(0, 0, 1024, 512);
        var spot = function (x, y, r, col, a) {
          var rg = g.createRadialGradient(x, y, 0, x, y, r);
          rg.addColorStop(0, rgba(col, a));
          rg.addColorStop(1, rgba(col, 0));
          g.fillStyle = rg;
          g.fillRect(x - r, y - r, r * 2, r * 2);
        };
        spot(210, 140, 190, '#ffffff', 0.95); spot(780, 100, 150, '#ffffff', 0.85);
        spot(520, 330, 230, c[3], 0.9); spot(930, 390, 190, c[0], 0.85);
        spot(70, 390, 170, c[2], 0.85); spot(400, 60, 120, c[3], 0.7);
        var tex = new T.CanvasTexture(cv);
        tex.mapping = T.EquirectangularReflectionMapping;
        tex.encoding = T.sRGBEncoding;
        var rt = pmrem.fromEquirectangular(tex);
        tex.dispose();
        return rt.texture;
      };
      var ENV = { aurora: makeEnv(PAL.aurora.env), ember: makeEnv(PAL.ember.env) };
      scene.environment = ENV[look];

      scene.add(camera);
      var key = new T.DirectionalLight(0xffffff, 1.0);
      key.position.set(-3, 4, 6);
      camera.add(key);
      var rim = new T.PointLight(new T.Color(PAL[look].rim), 0.9);
      rim.position.set(4, -2, 4);
      camera.add(rim);

      var mk = function (geo, k, idx, o) {
        var target = new T.Color(pc(k, idx));
        var m = new T.MeshPhysicalMaterial(Object.assign({ color: target.clone(), metalness: 0.2, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.15 }, o || {}));
        mats.push({ m: m, k: k, idx: idx, t: target });
        return new T.Mesh(geo, m);
      };

      /* Hero: a morphing glossy blob with orbiting satellites and a ring */
      var HERO_ON = false;
      var hero = new T.Group();
      hero.visible = HERO_ON;
      scene.add(hero);
      var seg = narrow ? 48 : 80;
      var blobGeo = new T.SphereGeometry(1, seg, Math.round(seg * 0.7));
      var posA = blobGeo.attributes.position, norA = blobGeo.attributes.normal, N = posA.count;
      var base = new Float32Array(posA.array), t1 = new Float32Array(N * 3), t2 = new Float32Array(N * 3);
      for (var i = 0; i < N; i++) {
        var ux = base[i * 3], uy = base[i * 3 + 1], uz = base[i * 3 + 2];
        var ax = Math.abs(uy) < 0.99 ? 0 : 1, ay = Math.abs(uy) < 0.99 ? 1 : 0;
        // t1 = normalize(cross(a, u)), t2 = cross(u, t1)
        var ex = ay * uz, ey = -ax * uz, ez = ax * uy - ay * ux;
        var el = 1 / (Math.sqrt(ex * ex + ey * ey + ez * ez) || 1);
        ex *= el; ey *= el; ez *= el;
        t1[i * 3] = ex; t1[i * 3 + 1] = ey; t1[i * 3 + 2] = ez;
        t2[i * 3] = uy * ez - uz * ey; t2[i * 3 + 1] = uz * ex - ux * ez; t2[i * 3 + 2] = ux * ey - uy * ex;
      }
      var rad = function (x, y, z, t, amp) {
        var n = Math.sin(x * 1.9 + t * 0.8) * Math.cos(y * 2.1 - t * 0.6) + 0.7 * Math.sin(z * 2.3 + x * 1.2 + t * 0.5) + 0.3 * Math.sin((x + y + z) * 3.1 + t * 1.1);
        return 1 + amp * n;
      };
      var deform = function (t, amp) {
        var e = 0.02, pa = posA.array, na = norA.array;
        for (var i = 0; i < N; i++) {
          var x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2];
          var r0 = rad(x, y, z, t, amp);
          var p0x = x * r0, p0y = y * r0, p0z = z * r0;
          var qx = x + t1[i * 3] * e, qy = y + t1[i * 3 + 1] * e, qz = z + t1[i * 3 + 2] * e;
          var ql = 1 / Math.sqrt(qx * qx + qy * qy + qz * qz);
          qx *= ql; qy *= ql; qz *= ql;
          var r1 = rad(qx, qy, qz, t, amp);
          var d1x = qx * r1 - p0x, d1y = qy * r1 - p0y, d1z = qz * r1 - p0z;
          var wx = x + t2[i * 3] * e, wy = y + t2[i * 3 + 1] * e, wz = z + t2[i * 3 + 2] * e;
          var wl = 1 / Math.sqrt(wx * wx + wy * wy + wz * wz);
          wx *= wl; wy *= wl; wz *= wl;
          var r2 = rad(wx, wy, wz, t, amp);
          var d2x = wx * r2 - p0x, d2y = wy * r2 - p0y, d2z = wz * r2 - p0z;
          var nx = d1y * d2z - d1z * d2y, ny = d1z * d2x - d1x * d2z, nz = d1x * d2y - d1y * d2x;
          var nl = 1 / (Math.sqrt(nx * nx + ny * ny + nz * nz) || 1);
          pa[i * 3] = p0x; pa[i * 3 + 1] = p0y; pa[i * 3 + 2] = p0z;
          na[i * 3] = nx * nl; na[i * 3 + 1] = ny * nl; na[i * 3 + 2] = nz * nl;
        }
        posA.needsUpdate = true;
        norA.needsUpdate = true;
      };
      var blob = mk(blobGeo, 'blob', 0, { metalness: 0.25, roughness: 0.12 });
      blob.frustumCulled = false;
      hero.add(blob);

      var ring = mk(new T.TorusGeometry(1.75, 0.03, 16, 180), 'ring', 0, { metalness: 0.9, roughness: 0.18 });
      ring.rotation.x = 1.15;
      ring.rotation.y = 0.25;
      hero.add(ring);

      var sphereGeo = new T.SphereGeometry(1, 36, 28);
      var SAT = [
        { R: 1.5, s: 0.55, tilt: 0.35, z: 0, size: 0.16, ci: 0 },
        { R: 1.85, s: -0.4, tilt: -0.6, z: 0.3, size: 0.12, ci: 1 },
        { R: 1.3, s: 0.8, tilt: 1.0, z: -0.4, size: 0.1, ci: 2 },
        { R: 2.0, s: 0.3, tilt: 1.35, z: 0.6, size: 0.19, ci: 3 }
      ];
      var sats = SAT.map(function (o) {
        var orb = new T.Group(), piv = new T.Group();
        orb.rotation.x = o.tilt;
        orb.rotation.z = o.z;
        orb.add(piv);
        var m = mk(sphereGeo, 'sats', o.ci, { metalness: 0.15, roughness: 0.1 });
        m.scale.setScalar(o.size);
        m.position.x = o.R;
        piv.add(m);
        hero.add(orb);
        return { piv: piv, s: o.s };
      });

      /* Section companions that drift past as the page scrolls */
      var wrap3 = function (obj) { var g = new T.Group(); g.add(obj); scene.add(g); return g; };
      var crystal = mk(new T.OctahedronGeometry(0.8, 0), 'crystal', 0, { flatShading: true, metalness: 0.65, roughness: 0.2 });
      crystal.scale.set(1, 1.6, 1);
      var gCrystal = wrap3(crystal);
      var knot = mk(new T.TorusKnotGeometry(0.55, 0.19, 160, 24, 2, 3), 'knot', 0, {});
      var gKnot = wrap3(knot);
      var gyro = new T.Group();
      var gyroRings = [0.95, 0.72, 0.5].map(function (r) {
        var m = mk(new T.TorusGeometry(r, 0.035, 16, 120), 'gyro', 0, { metalness: 0.85, roughness: 0.2 });
        gyro.add(m);
        return m;
      });
      var core = mk(sphereGeo, 'gyro', 0, { metalness: 0.3, roughness: 0.1 });
      core.scale.setScalar(0.2);
      gyro.add(core);
      scene.add(gyro);
      var donut = mk(new T.TorusGeometry(0.9, 0.38, 48, 96), 'donut', 0, { roughness: 0.2 });
      var gDonut = wrap3(donut);

      var BUB = [[0.08, 0.12, 0.2, -1, 0], [0.93, 0.3, 0.3, 1.2, 1], [0.04, 0.42, 0.45, -2, 2], [0.9, 0.55, 0.18, 0.5, 3], [0.1, 0.7, 0.32, 1, 1], [0.95, 0.78, 0.5, -1.5, 0], [0.06, 0.9, 0.25, 0.8, 2], [0.85, 0.16, 0.14, 2.2, 3], [0.55, 0.97, 0.3, -1, 1]];
      var bubs = BUB.map(function (b) {
        var m = mk(sphereGeo, 'bub', b[4], { metalness: 0.1, roughness: 0.1 });
        m.scale.setScalar(b[2]);
        scene.add(m);
        return m;
      });

      /* Where things sit on the page */
      var P = { hx: 0, hy: 0, hr: 1, k: 1, about: { x: 0, y: 0 }, skills: { x: 0, y: 0 }, work: { x: 0, y: 0 }, contact: { x: 0, y: 0 }, bub: [] };
      var secTop = function (id) { var el = doc.getElementById(id); return el ? el.getBoundingClientRect().top + window.scrollY : 0; };
      var placeAll = function () {
        W = window.innerWidth; H = window.innerHeight;
        var pageH = Math.max(root.scrollHeight, H);
        var cl = $('.cluster');
        if (cl) {
          var r = cl.getBoundingClientRect();
          P.hx = r.left + r.width / 2;
          P.hy = r.top + window.scrollY + r.height / 2;
          P.hr = Math.max(0.6, r.width * 0.24 / 100);
        }
        var sm = W < 700, gut = Math.max(60, W * 0.07);
        P.k = sm ? 0.62 : 1;
        P.about = { x: sm ? W * 0.88 : Math.max(70, W * 0.06), y: secTop('about') + (sm ? 20 : 90) };
        P.skills = { x: W - gut, y: secTop('skills') + 70 };
        P.work = { x: W - gut, y: secTop('work') + 60 };
        P.contact = { x: W - Math.max(80, W * 0.09), y: secTop('contact') + 10 };
        P.bub = BUB.map(function (b) { return { x: b[0] * W, y: b[1] * pageH }; });
        if (W !== pw || H !== ph) {
          pw = W; ph = H;
          renderer.setSize(W, H);
          camera.aspect = W / H;
          camera.position.z = (H / 100) / (2 * Math.tan(17.5 * Math.PI / 180));
          camera.updateProjectionMatrix();
        }
      };

      var spd = 0, pulse = 0, pmx = 0, pmy = 0, lowPower = false, frames = 0, accum = 0, last = 0, expo = EXPO, dip = 0, pending = null;
      var update = function (t, dt) {
        var sy = window.scrollY, k = P.k;
        camera.position.x = W / 200 + cx * 0.7;
        camera.position.y = -(sy + H / 2) / 100 - cy * 0.5;

        hero.position.set(P.hx / 100, -P.hy / 100, 0);
        hero.scale.setScalar(P.hr);
        hero.rotation.y = cx * 1.1 + t * 0.12;
        hero.rotation.x = cy * 0.6;
        ring.rotation.z = t * 0.1;
        var amp = Math.min(0.24, 0.1 + Math.min(0.08, spd * 0.03) + pulse * 0.13);
        if (HERO_ON && (!lowPower || (frames & 1))) deform(t, amp);
        for (var i = 0; i < sats.length; i++) sats[i].piv.rotation.y += dt * sats[i].s * (1 + pulse * 3);

        gCrystal.position.set(P.about.x / 100, -P.about.y / 100 + Math.sin(t * 0.7) * 0.12, -0.5);
        gCrystal.scale.setScalar(k);
        crystal.rotation.y = t * 0.4 + sy * 0.003;
        crystal.rotation.x = 0.4 + Math.sin(t * 0.5) * 0.15;

        gKnot.position.set(P.skills.x / 100, -P.skills.y / 100 + Math.sin(t * 0.6 + 1) * 0.12, 0.2);
        gKnot.scale.setScalar(k);
        knot.rotation.x = t * 0.3 + sy * 0.002;
        knot.rotation.y = t * 0.4;

        gyro.position.set(P.work.x / 100, -P.work.y / 100 + Math.sin(t * 0.8 + 2) * 0.1, 0);
        gyro.scale.setScalar(k);
        gyroRings[0].rotation.x = t * 0.6;
        gyroRings[1].rotation.y = t * 0.8 + 1;
        gyroRings[2].rotation.x = -t * 0.9 + 0.5;
        gyroRings[2].rotation.z = t * 0.4;

        gDonut.position.set(P.contact.x / 100, -P.contact.y / 100 + Math.sin(t * 0.5 + 3) * 0.1, -0.3);
        gDonut.scale.setScalar(k);
        donut.rotation.x = 0.9 + Math.sin(t * 0.3) * 0.3;
        donut.rotation.y = t * 0.2 + sy * 0.002;

        for (var j = 0; j < bubs.length; j++) {
          var b = P.bub[j];
          if (b) bubs[j].position.set(b.x / 100, -b.y / 100 + Math.sin(t * 0.8 + j * 1.7) * 0.14, BUB[j][3]);
        }
      };
      var renderOnce = function () { placeAll(); update(0, 0.016); renderer.render(scene, camera); };

      var frame = function (ts) {
        if (!running) return;
        var t = ts / 1000, dt = Math.min(0.05, last ? t - last : 0.016);
        last = t;
        var sp = Math.hypot(mx - pmx, my - pmy) / Math.max(dt, 0.001) / 1000;
        pmx = mx; pmy = my;
        spd += (Math.min(sp, 3) - spd) * Math.min(1, dt * 6);
        pulse *= Math.exp(-dt * 2.5);
        var lerpK = Math.min(1, dt * 4);
        for (var i = 0; i < mats.length; i++) mats[i].m.color.lerp(mats[i].t, lerpK);
        if (dip === 1) {
          expo -= dt * 3.2;
          if (expo <= 0.3) { expo = 0.3; scene.environment = ENV[pending]; dip = 2; }
        } else if (dip === 2) {
          expo += dt * 2.6;
          if (expo >= EXPO) { expo = EXPO; dip = 0; }
        }
        renderer.toneMappingExposure = expo;
        frames++;
        update(t, dt);
        renderer.render(scene, camera);
        if (frames <= 90) accum += dt;
        if (frames === 90 && accum / 90 > 0.032 && !lowPower) {
          lowPower = true;
          renderer.setPixelRatio(1);
          renderer.setSize(W, H);
        }
        requestAnimationFrame(frame);
      };

      window.__glLook = function (n, user) {
        mats.forEach(function (e) { e.t.set(pc(e.k, e.idx)); });
        rim.color.set(PAL[n].rim);
        if (!user || reduce) {
          scene.environment = ENV[n];
          mats.forEach(function (e) { e.m.color.copy(e.t); });
          if (reduce) renderOnce();
          return;
        }
        pending = n;
        dip = 1;
      };

      window.addEventListener('pointerdown', function (e) {
        if (!HERO_ON) return;
        var rr = P.hr * 100 * 1.15;
        if (Math.hypot(e.clientX - P.hx, e.clientY - (P.hy - window.scrollY)) < rr) {
          pulse = 1;
          burst(e.clientX, e.clientY, 22, ['var(--acc)', 'var(--lav)', 'var(--acc2)', '#ffffff']);
        }
      });
      var rq = false;
      var relayout = function () {
        if (rq) return;
        rq = true;
        requestAnimationFrame(function () { rq = false; if (reduce) renderOnce(); else placeAll(); });
      };
      window.addEventListener('resize', relayout);
      if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(doc.body);
      if (reduce) window.addEventListener('scroll', function () { renderOnce(); }, { passive: true });

      placeAll();
      mats.forEach(function (e) { e.m.color.copy(e.t); });
      if (reduce) renderOnce();
      else requestAnimationFrame(frame);
    } catch (err) {
      cleanup();
    }
  })();
  applyLook(look, false);

})();
