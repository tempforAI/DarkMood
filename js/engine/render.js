/* 画布渲染器（480x270 像素画布）
 * 性能策略：
 *  - 只有在 dirty 或存在动画（粒子、补间、镜头平移）时才重绘；
 *  - 背景、审判全景、暗化立绘、雾纹理都预先生成并缓存；
 *  - 粒子使用固定大小的数组（对象池），每帧不分配内存；
 *  - 只有环境动画（雨/雾/火星）时降为 30fps。
 */
(function () {
  'use strict';
  var DM = window.DM, Core = DM.Core;
  var R = DM.Render = {};
  var W = 480, H = 270;
  var cv, g;
  var dirty = true;

  var v = {
    bgId: 'black', variant: null, bg: null,
    filter: 'none', weather: 'none', flashback: false,
    trial: false, pan: 0, panFrom: 0, panTo: 0, panT: 1, speaker: null, speakerT: 1,
    stage: [],      // {id, expr, pos, x, a, t, out}
    sprites: [],    // {id, x}
    dim: 0          // 0..1 遮罩（小游戏覆盖层下面压暗）
  };
  R.view = v;

  var POS = { L: 128, C: 240, R: 352 };
  // 雨和雾只在室外背景显示（室内自动隐藏，同时省去粒子计算）
  var OUTDOOR = { ferry: 1, dock: 1, courtyard: 1, balcony: 1, shrine: 1, beach: 1, title: 1, map: 1 };
  function weatherVisible() {
    if (v.weather === 'none') return false;
    if (v.weather === 'embers') return true;
    return !v.trial && !!OUTDOOR[v.bgId];
  }
  var SEATS = ['ritsu', 'shio', 'genzou', 'kyosuke', 'hina', 'shizuka', 'fuwa', 'kiryu', 'kuga', 'shiori', 'usami', 'kurata', 'mio', 'kotone'];

  R.init = function (canvas) {
    cv = canvas;
    g = cv.getContext('2d', { alpha: false });
    g.imageSmoothingEnabled = false;
  };
  R.markDirty = function () { dirty = true; };

  // ---------- 缓存 ----------
  var dimCache = {};
  function portrait(id, expr, dim) {
    var src = Core.art.portrait(id, expr || 'normal');
    if (!dim) return src;
    var k = id + ':' + expr;
    if (dimCache[k] && dimCache[k].src === src) return dimCache[k].c;
    var c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
    var x = c.getContext('2d'); x.drawImage(src, 0, 0);
    x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(8,8,20,0.5)'; x.fillRect(0, 0, c.width, c.height);
    dimCache[k] = { src: src, c: c };
    return c;
  }

  var pano = null;
  function getPano() {
    if (pano) return pano;
    var bg = Core.art.bg('judgment');
    pano = document.createElement('canvas'); pano.width = W * 2; pano.height = H;
    var x = pano.getContext('2d'); x.imageSmoothingEnabled = false;
    x.drawImage(bg, 0, 0);
    x.save(); x.translate(W * 2, 0); x.scale(-1, 1); x.drawImage(bg, 0, 0); x.restore();
    // 证言台的暗红光
    var gr = x.createLinearGradient(0, 150, 0, H);
    gr.addColorStop(0, 'rgba(60,0,10,0)'); gr.addColorStop(1, 'rgba(60,0,10,0.55)');
    x.fillStyle = gr; x.fillRect(0, 150, W * 2, H - 150);
    return pano;
  }

  var vignette = null;
  function getVignette() {
    if (vignette) return vignette;
    vignette = document.createElement('canvas'); vignette.width = W; vignette.height = H;
    var x = vignette.getContext('2d');
    var gr = x.createRadialGradient(W / 2, H / 2, 70, W / 2, H / 2, 290);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(20,8,0,0.85)');
    x.fillStyle = gr; x.fillRect(0, 0, W, H);
    return vignette;
  }

  var judgeGlow = null;
  function getJudgeGlow() {
    if (judgeGlow) return judgeGlow;
    judgeGlow = document.createElement('canvas'); judgeGlow.width = W; judgeGlow.height = H;
    var x = judgeGlow.getContext('2d');
    var gr = x.createRadialGradient(240, 120, 10, 240, 120, 170);
    gr.addColorStop(0, 'rgba(170,0,30,0.55)'); gr.addColorStop(0.6, 'rgba(110,0,20,0.25)'); gr.addColorStop(1, 'rgba(60,0,10,0)');
    x.fillStyle = gr; x.fillRect(0, 0, W, H);
    return judgeGlow;
  }

  var fogTex = null;
  function getFog() {
    if (fogTex) return fogTex;
    fogTex = document.createElement('canvas'); fogTex.width = W; fogTex.height = H;
    var x = fogTex.getContext('2d'), rnd = Core.rng(77);
    for (var i = 0; i < 46; i++) {
      var cx = rnd() * W, cy = 60 + rnd() * 200, r = 30 + rnd() * 70;
      var gr = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      gr.addColorStop(0, 'rgba(190,195,215,0.18)'); gr.addColorStop(1, 'rgba(190,195,215,0)');
      x.fillStyle = gr; x.fillRect(cx - r, cy - r, r * 2, r * 2);
      // 横向平铺：左右两侧也画一份，便于无缝滚动
      if (cx - r < 0 || cx + r > W) {
        var off = cx - r < 0 ? W : -W;
        var gr2 = x.createRadialGradient(cx + off, cy, 0, cx + off, cy, r);
        gr2.addColorStop(0, 'rgba(190,195,215,0.18)'); gr2.addColorStop(1, 'rgba(190,195,215,0)');
        x.fillStyle = gr2; x.fillRect(cx + off - r, cy - r, r * 2, r * 2);
      }
    }
    return fogTex;
  }

  // ---------- 粒子（对象池） ----------
  var MAXP = 140;
  var px = new Float32Array(MAXP), py = new Float32Array(MAXP), pv = new Float32Array(MAXP), pl = new Float32Array(MAXP);
  var pcount = 0, fogX = 0;
  function seedParticles(kind) {
    var rnd = Core.rng(kind === 'rain' ? 11 : 23);
    pcount = kind === 'rain' ? (DM.State.settings.particles ? 120 : 50) : kind === 'embers' ? 44 : 0;
    for (var i = 0; i < pcount; i++) {
      px[i] = rnd() * W; py[i] = rnd() * H;
      pv[i] = kind === 'rain' ? 260 + rnd() * 140 : 14 + rnd() * 26;
      pl[i] = kind === 'rain' ? 5 + rnd() * 7 : 1 + (rnd() < 0.3 ? 1 : 0);
    }
  }

  // ---------- 场景控制 ----------
  R.setBg = function (id, variant) {
    v.bgId = id; v.variant = variant || null;
    v.bg = Core.art.bg(id, variant || undefined);
    dirty = true;
  };
  R.setFilter = function (f) { v.filter = f || 'none'; dirty = true; };
  R.setWeather = function (w) {
    w = w || 'none';
    if (w !== v.weather) { v.weather = w; seedParticles(w); }
    dirty = true;
  };
  R.setFlashback = function (on) { v.flashback = !!on; dirty = true; };
  R.setDim = function (d) { v.dim = d; dirty = true; };

  R.clearStage = function () { v.stage.length = 0; dirty = true; };
  function find(id) { for (var i = 0; i < v.stage.length; i++) if (v.stage[i].id === id && !v.stage[i].out) return v.stage[i]; return null; }
  R.show = function (id, expr, pos) {
    pos = pos || 'C';
    var s = find(id);
    if (s) { s.expr = expr || s.expr; if (s.pos !== pos) { s.pos = pos; s.x0 = s.x; s.t = 0; } dirty = true; return; }
    // 同位置的人退场
    for (var i = v.stage.length - 1; i >= 0; i--) if (v.stage[i].pos === pos) v.stage.splice(i, 1);
    v.stage.push({ id: id, expr: expr || 'normal', pos: pos, x: POS[pos], x0: POS[pos], a: 0, t: 0, out: false });
    dirty = true;
  };
  R.hide = function (id) {
    for (var i = 0; i < v.stage.length; i++) if (v.stage[i].id === id) { v.stage[i].out = true; v.stage[i].t = 0; }
    dirty = true;
  };
  // 对白自动立绘：返回当前场上人物（用于存档）
  R.speak = function (id, expr) {
    v.speaking = id;
    if (v.trial) { R.trialSpeaker(id, expr); return; }
    if (id === 'ritsu') { dirty = true; return; }
    var s = find(id);
    if (s) { if (expr) s.expr = expr; dirty = true; return; }
    v.stage.length = 0;
    R.show(id, expr, 'C');
  };
  R.narrate = function () { v.speaking = null; dirty = true; };
  R.stageSnapshot = function () {
    return v.stage.filter(function (s) { return !s.out; }).map(function (s) { return { id: s.id, expr: s.expr, pos: s.pos }; });
  };

  // ---------- 审判模式 ----------
  R.setTrial = function (on) {
    v.trial = !!on;
    v.speaker = null; v.stage.length = 0;
    if (on) { getPano(); v.pan = v.panTo = 0; v.panT = 1; }
    dirty = true;
  };
  function seatPan(id) {
    if (id === 'judge') return 0;
    var i = SEATS.indexOf(id);
    if (i < 0) i = (Core.hash(id) % 14);
    return Math.round((i + 0.5) / SEATS.length * W * 2) % (W * 2);
  }
  R.trialSpeaker = function (id, expr) {
    if (v.speaker && v.speaker.id === id) { if (expr) v.speaker.expr = expr; dirty = true; return; }
    v.speaker = { id: id, expr: expr || 'normal' };
    v.panFrom = v.pan; v.panTo = seatPan(id); v.panT = 0; v.speakerT = 0;
    dirty = true;
  };

  // ---------- 探索小人 ----------
  R.setSprites = function (list) { v.sprites = list || []; dirty = true; };

  // ---------- 绘制 ----------
  var last = 0, frameSkip = false;
  R.tick = function (now) {
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    var anim = false;

    // 补间
    for (var i = v.stage.length - 1; i >= 0; i--) {
      var s = v.stage[i];
      if (s.t < 1) { s.t = Math.min(1, s.t + dt / 0.2); anim = true; }
      var e = Core.easeOut(s.t);
      if (s.out) { s.a = 1 - e; if (s.t >= 1) { v.stage.splice(i, 1); } }
      else { s.a = e; s.x = s.x0 + (POS[s.pos] - s.x0) * e; }
    }
    if (v.trial && v.panT < 1) {
      v.panT = Math.min(1, v.panT + dt / 0.38);
      var d = v.panTo - v.panFrom;
      if (d > W) d -= W * 2; else if (d < -W) d += W * 2;
      v.pan = (v.panFrom + d * Core.easeOut(v.panT) + W * 2) % (W * 2);
      anim = true;
    }
    if (v.trial && v.speakerT < 1) { v.speakerT = Math.min(1, v.speakerT + dt / 0.3); anim = true; }

    var ambient = weatherVisible();
    if (!dirty && !anim) {
      if (!ambient) return;
      frameSkip = !frameSkip;           // 只有环境粒子时 30fps
      if (frameSkip) return;
      dt *= 2;
    }
    dirty = false;
    draw(dt);
  };

  function draw(dt) {
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    // 背景
    if (v.trial) {
      var p = getPano(), o = Math.round(v.pan) - 240;
      o = ((o % (W * 2)) + W * 2) % (W * 2);
      var w1 = Math.min(W, W * 2 - o);
      g.drawImage(p, o, 0, w1, H, 0, 0, w1, H);
      if (w1 < W) g.drawImage(p, 0, 0, W - w1, H, w1, 0, W - w1, H);
    } else if (v.bg) {
      g.drawImage(v.bg, 0, 0);
    } else { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); }

    // 探索小人
    for (var i = 0; i < v.sprites.length; i++) {
      var sp = v.sprites[i], img = Core.art.sprite(sp.id);
      g.drawImage(img, Math.round(sp.x - img.width), 236 - img.height * 2, img.width * 2, img.height * 2);
    }

    // 滤镜
    applyFilter(v.filter);

    // 天气（立绘之前）
    drawWeather(dt);

    // 立绘
    if (v.trial) drawTrialSpeaker();
    else {
      var multi = v.stage.length > 1;
      for (var j = 0; j < v.stage.length; j++) {
        var s = v.stage[j];
        var dim = multi && v.speaking && v.speaking !== s.id && v.speaking !== 'ritsu';
        var im = portrait(s.id, s.expr, dim);
        var pw = im.width * 2, ph = im.height * 2;
        g.globalAlpha = s.a;
        g.drawImage(im, Math.round(s.x - pw / 2), Math.round(H - ph + (1 - s.a) * 8), pw, ph);
      }
      g.globalAlpha = 1;
    }

    // 回忆
    if (v.flashback) {
      g.globalCompositeOperation = 'color'; g.fillStyle = '#9a7650'; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'multiply'; g.fillStyle = '#efdcc0'; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'source-over'; g.drawImage(getVignette(), 0, 0);
    }
    if (v.dim > 0) { g.fillStyle = 'rgba(4,4,12,' + (v.dim * 0.7) + ')'; g.fillRect(0, 0, W, H); }
  }

  function applyFilter(f) {
    if (f === 'none' || !f) return;
    g.globalCompositeOperation = 'multiply';
    if (f === 'night') { g.fillStyle = '#5a68a8'; g.fillRect(0, 0, W, H); }
    else if (f === 'dark') { g.fillStyle = '#3e3c50'; g.fillRect(0, 0, W, H); }
    else if (f === 'red') { g.fillStyle = '#d86464'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; g.fillStyle = 'rgba(140,0,10,0.12)'; g.fillRect(0, 0, W, H); }
    else if (f === 'sepia') { g.globalCompositeOperation = 'color'; g.fillStyle = '#9a7650'; g.fillRect(0, 0, W, H); }
    g.globalCompositeOperation = 'source-over';
  }

  function drawWeather(dt) {
    if (!weatherVisible()) return;
    var w = v.weather;
    if (w === 'rain') {
      g.fillStyle = 'rgba(175,195,235,0.55)';
      for (var i = 0; i < pcount; i++) {
        py[i] += pv[i] * dt; px[i] -= pv[i] * dt * 0.18;
        if (py[i] > H) { py[i] = -pl[i]; px[i] = (px[i] + 97 * i) % (W + 40); }
        if (px[i] < -4) px[i] += W + 8;
        var x = px[i] | 0, y = py[i] | 0, l = pl[i] | 0;
        g.fillRect(x, y, 1, l);
        g.fillRect(x - 1, y + l, 1, 2);
      }
    } else if (w === 'fog') {
      var f = getFog();
      fogX = (fogX + dt * 6) % W;
      var o = fogX | 0;
      g.globalAlpha = 0.9;
      g.drawImage(f, o, 0, W - o, H, 0, 0, W - o, H);
      if (o > 0) g.drawImage(f, 0, 0, o, H, W - o, 0, o, H);
      g.globalAlpha = 1;
    } else if (w === 'embers') {
      for (var k = 0; k < pcount; k++) {
        py[k] -= pv[k] * dt; px[k] += Math.sin((py[k] + k * 13) * 0.05) * 0.4;
        if (py[k] < -2) { py[k] = H + 2; px[k] = (px[k] + 131 * k) % W; }
        g.fillStyle = k % 3 ? 'rgba(255,150,60,0.85)' : 'rgba(255,220,120,0.9)';
        g.fillRect(px[k] | 0, py[k] | 0, pl[k], pl[k]);
      }
    }
  }

  function drawTrialSpeaker() {
    var sp = v.speaker;
    if (!sp) return;
    var t = Core.easeOut(v.speakerT);
    var im = portrait(sp.id, sp.expr, false);
    var pw = im.width * 2, ph = im.height * 2;
    var x = Math.round(240 - pw / 2 + (1 - t) * 24), y = H - ph + 6;
    if (sp.id === 'judge') g.drawImage(getJudgeGlow(), 0, 0);
    g.globalAlpha = t;
    g.drawImage(im, x, y, pw, ph);
    g.globalAlpha = 1;
    if (sp.id !== 'judge' && SEATS.indexOf(sp.id) >= 0) {
      // 证言台扶手
      g.fillStyle = '#1a0d0a'; g.fillRect(142, 176, 196, 16);
      g.fillStyle = '#4a2a1a'; g.fillRect(142, 176, 196, 3);
      g.fillStyle = '#8a6a3a'; g.fillRect(142, 176, 196, 1);
      g.fillStyle = '#c9a25a'; g.fillRect(226, 181, 28, 6);
    }
  }

  R.SEATS = SEATS;
})();
