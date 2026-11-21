/* DARK MOOD HD 背景：户外、码头、船屋、小屋、海蚀洞、地图
 * ------------------------------------------------------------------
 * 设计坐标 1920x1080（locations.js 锚点 x4）。全部为程序化矢量 + 低分辨率「场」绘制：
 *   - 天空、海面、地图地形等柔和的大面积色调用 field()：在小画布上逐像素算出颜色再平滑放大；
 *   - 物件、轮廓、浪花、高光等用矢量路径绘制，任何分辨率下都清晰；
 *   - 材质用 kit 的程序化纹理（K.matFill / texFill），q.tex=0 时回退为纯色渐变。
 * 光线：台风外围的阴天，云隙在画面左上方（主光从左上来）。夜晚/雨/雾由引擎叠加。
 * 兼容：ES5 + Canvas 2D 基础 API；确定性随机（K.rng 固定种子）。
 */
(function (root) {
  'use strict';
  var DM = root.DM = root.DM || {};
  var K = DM.HK;
  if (!K || !DM.HDBG) return;

  var W = 1920, H = 1080, PI = Math.PI, TAU = PI * 2;

  /* ======================= 数学 / 噪声 ======================= */
  function sat(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function sstep(a, b, v) { var t = sat((v - a) / (b - a)); return t * t * (3 - 2 * t); }

  // 快速值噪声（本文件私有；比通用版本少一次表查找，场绘制要算几十万次）
  var NP = new Uint8Array(512), NV = new Float32Array(256);
  (function () {
    var r = K.rng(77031), i;
    for (i = 0; i < 256; i++) { NP[i] = i; NV[i] = r(); }
    for (i = 255; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = NP[i]; NP[i] = NP[j]; NP[j] = t; }
    for (i = 0; i < 256; i++) NP[i + 256] = NP[i];
  })();
  function vn(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    xi &= 255; yi &= 255;
    var x1 = (xi + 1) & 255, y1 = (yi + 1) & 255;
    var a = NV[NP[NP[xi] + yi]], b = NV[NP[NP[x1] + yi]], c = NV[NP[NP[xi] + y1]], d = NV[NP[NP[x1] + y1]];
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, oct, seed) {
    var s = 0, amp = 0.5, n = 0, ox = (seed || 0) * 31.7, oy = (seed || 0) * 17.3, nx;
    for (var i = 0; i < oct; i++) {
      s += amp * vn(x + ox, y + oy); n += amp;
      nx = x * 1.6 - y * 1.2; y = x * 1.2 + y * 1.6; x = nx;   // 旋转 + 倍频，减少网格感
      amp *= 0.5; ox += 5.3; oy += 9.1;
    }
    return s / n;
  }

  /* ======================= 颜色 ======================= */
  function C(c) { return K.rgb(c); }
  function mixc(a, b, t) { return K.mix(a, b, t); }
  // 确定性随机数（K.rng + 近似高斯）
  function RNG(seed) { var r = K.rng(seed); r.gauss = function () { return (r() + r() + r() - 1.5) * 1.15; }; return r; }

  /* ======================= 场绘制 ======================= */
  // 在 rw x rh 的小画布上逐像素调用 fn(u,v,out)（out=[r,g,b,a]），再平滑放大到设计矩形
  function field(g, x, y, w, h, rw, rh, fn) {
    rw = Math.max(2, Math.round(rw)); rh = Math.max(2, Math.round(rh));
    var c = K.canvas(rw, rh), cx = c.getContext('2d'), im = cx.createImageData(rw, rh), d = im.data, o = [0, 0, 0, 255], k = 0;
    for (var j = 0; j < rh; j++) {
      var v = (j + 0.5) / rh;
      for (var i = 0; i < rw; i++) {
        o[3] = 255; fn((i + 0.5) / rw, v, o);
        d[k] = o[0]; d[k + 1] = o[1]; d[k + 2] = o[2]; d[k + 3] = o[3]; k += 4;
      }
    }
    cx.putImageData(im, 0, 0);
    g.save();
    g.imageSmoothingEnabled = true;
    g.drawImage(c, x, y, w, h);
    g.restore();
  }
  // 场分辨率（每个设计单位多少像素）：随输出倍率与建模精度变化，上限避免 4K 下过慢
  function fres(q, base) { return Math.min(q.s, 1.1) * base * (q.model <= 0 ? 0.55 : q.model === 1 ? 0.78 : 1); }

  // 纹理填充（可独立缩放 x/y、旋转；同一张平铺图可复用于不同比例，避免重复生成）
  function texFill(g, q, kind, opts, units, ox, oy, alpha, sx, sy, rot, mode) {
    var size = K.tileSize(q, units), tile = K.tex(kind, opts, size), pat = g.createPattern(tile, 'repeat');
    g.save();
    if (alpha !== undefined && alpha !== null) g.globalAlpha *= alpha;
    if (mode) g.globalCompositeOperation = mode;
    g.translate(ox || 0, oy || 0);
    if (rot) g.rotate(rot);
    var m = units / tile.width; g.scale(m * (sx || 1), m * (sy || 1));
    g.fillStyle = pat; g.fill();
    g.restore();
  }
  // 材质：q.tex=0 时用回退色
  function mat(g, q, fb, kind, opts, units, ox, oy, alpha, sx, sy, rot) {
    if (q.tex <= 0) { g.save(); if (alpha !== undefined && alpha !== null) g.globalAlpha *= alpha; g.fillStyle = fb; g.fill(); g.restore(); return; }
    texFill(g, q, kind, opts, units, ox, oy, alpha, sx, sy, rot);
  }
  // 在当前路径上叠加一层线性渐变
  function shadeLin(g, x0, y0, x1, y1, stops, mode) {
    g.save(); if (mode) g.globalCompositeOperation = mode;
    g.fillStyle = K.lin(g, x0, y0, x1, y1, stops); g.fill(); g.restore();
  }
  function fillP(g, style, a) { g.save(); if (a !== undefined) g.globalAlpha *= a; g.fillStyle = style; g.fill(); g.restore(); }
  function strokeP(g, style, w, a) { g.save(); if (a !== undefined) g.globalAlpha *= a; g.strokeStyle = style; g.lineWidth = w; g.stroke(); g.restore(); }
  function rectP(g, x, y, w, h) { g.beginPath(); g.rect(x, y, w, h); }
  // 竖直方向的雾/空气透视
  function haze(g, x, y, w, h, color, a0, a1) {
    g.fillStyle = K.lin(g, 0, y, 0, y + h, [[0, K.rgba(color, a0)], [1, K.rgba(color, a1)]]);
    g.fillRect(x, y, w, h);
  }
  // 由点列构造平滑闭合（或开放）曲线（中点二次贝塞尔）
  function smoothPath(g, pts, closed, noBegin) {
    var n = pts.length / 2;
    if (!noBegin) g.beginPath();
    if (n < 3) { g.moveTo(pts[0], pts[1]); for (var k = 1; k < n; k++) g.lineTo(pts[k * 2], pts[k * 2 + 1]); if (closed) g.closePath(); return; }
    if (closed) {
      g.moveTo((pts[0] + pts[2]) / 2, (pts[1] + pts[3]) / 2);
      for (var i = 1; i <= n; i++) {
        var a = i % n, b = (i + 1) % n;
        g.quadraticCurveTo(pts[a * 2], pts[a * 2 + 1], (pts[a * 2] + pts[b * 2]) / 2, (pts[a * 2 + 1] + pts[b * 2 + 1]) / 2);
      }
      g.closePath();
    } else {
      g.moveTo(pts[0], pts[1]);
      for (var j = 1; j < n - 1; j++) g.quadraticCurveTo(pts[j * 2], pts[j * 2 + 1], (pts[j * 2] + pts[j * 2 + 2]) / 2, (pts[j * 2 + 1] + pts[j * 2 + 3]) / 2);
      g.lineTo(pts[(n - 1) * 2], pts[(n - 1) * 2 + 1]);
    }
  }
  // 起伏的山脊线点列：从 x0 到 x1，高度函数 hf(t) 返回 y；加噪声起伏
  function ridge(x0, x1, step, hf, amp, seed, freq) {
    var pts = [];
    for (var x = x0; x <= x1 + 0.1; x += step) {
      var t = (x - x0) / (x1 - x0);
      pts.push(x, hf(t) - (fbm(x * (freq || 0.01), 3.7, 3, seed) - 0.5) * amp * 2);
    }
    return pts;
  }

  /* ======================= 天空 ======================= */
  var SKY = { top: '#2e2c3f', hor: '#8f8fa3', dark: '#29283a', mid: '#57566c', lit: '#c4bfcb', glow: '#f2eadb' };
  // o: { x,y,w,h, seed, gx,gy 云隙中心(区域内 0..1), gw 云隙大小, dens 云量偏移, 以及颜色覆盖 }
  // 三层：高空薄云纱（受光、条纹状）、主云层（有体积：受光的上缘 + 暗的云底）、低空碎积云（暗、破碎）
  function sky(g, q, o) {
    var X = o.x || 0, Y = o.y || 0, Wd = o.w || W, Hd = o.h || 700, seed = o.seed || 1;
    var top = C(o.top || SKY.top), hor = C(o.hor || SKY.hor), dk = C(o.dark || SKY.dark), md = C(o.mid || SKY.mid), lt = C(o.lit || SKY.lit), gl = C(o.glow || SKY.glow);
    var gx = o.gx === undefined ? 0.3 : o.gx, gy = o.gy === undefined ? 0.35 : o.gy, gw = o.gw || 0.16, dens0 = o.dens || 0;
    var oct = K.byModel(q, 3, 4, 5), warp = q.model > 0, lit = q.light > 0, scud = q.model > 0, asp = Wd / Hd;
    var r = fres(q, q.model >= 2 ? 0.3 : 0.24);
    field(g, X, Y, Wd, Hd, Wd * r, Hd * r, function (u, v, out) {
      var t = Math.pow(v, 0.9);
      var R = top[0] + (hor[0] - top[0]) * t, G = top[1] + (hor[1] - top[1]) * t, B = top[2] + (hor[2] - top[2]) * t;
      var gn = warp ? fbm(u * asp * 2.2 + 3.1, v * 4.4, 2, seed + 7) - 0.5 : 0;
      var dx = (u - gx) * asp + gn * 0.22, dy = (v - gy) + gn * 0.12, d2 = dx * dx * 0.45 + dy * dy * 3;
      var gd = Math.exp(-d2 / (gw * gw)), gb = Math.exp(-d2 / (gw * gw * 8));
      // 云隙后面更亮的天空
      R += (gl[0] - R) * gd * 0.5; G += (gl[1] - G) * gd * 0.5; B += (gl[2] - B) * gd * 0.5;
      // 高空云纱
      var hv = fbm(u * asp * 0.9 + 11, v * 7, 3, seed + 21);
      var hvd = sstep(0.45, 0.75, hv) * (0.25 + 0.6 * gb);
      R += (lt[0] - R) * hvd * 0.45; G += (lt[1] - G) * hvd * 0.45; B += (lt[2] - B) * hvd * 0.45;
      // 主云层
      var px = u * asp * 1.35, py = v * 3.3;
      if (warp) { var w1 = fbm(px * 0.55, py * 0.75, 2, seed + 3) - 0.5; px += w1 * 1.7; py += w1 * 0.6; }
      var n = fbm(px, py, oct, seed);
      var th = 0.47 - 0.12 * (1 - v) + gd * 0.2 + gb * 0.06 - dens0;
      var dens = sstep(th - 0.07, th + 0.05, n);
      if (dens > 0.001) {
        var l = 0;
        if (lit) {
          var lx = gx - u, ly = gy - v - 0.25, ll = Math.sqrt(lx * lx * asp * asp + ly * ly) + 1e-3;
          var n2 = fbm(px + lx * asp / ll * 0.1, py + ly / ll * 0.22, oct, seed);
          l = (n - n2) * 6;
        }
        var thick = sat((n - th) * 3);
        var cr = md[0] + (dk[0] - md[0]) * thick, cg = md[1] + (dk[1] - md[1]) * thick, cb = md[2] + (dk[2] - md[2]) * thick;
        if (l > 0) { var le = sat(l) * (0.35 + 0.65 * gb); cr += (lt[0] - cr) * le; cg += (lt[1] - cg) * le; cb += (lt[2] - cb) * le; }
        else { var sh = sat(-l) * 0.35; cr *= 1 - sh; cg *= 1 - sh; cb *= 1 - sh * 0.8; }
        var hz = v * v * v * 0.75;
        cr += (hor[0] - cr) * hz; cg += (hor[1] - cg) * hz; cb += (hor[2] - cb) * hz;
        R += (cr - R) * dens; G += (cg - G) * dens; B += (cb - B) * dens;
      }
      // 低空碎云（台风外围快速移动的暗云）
      if (scud) {
        var n3 = fbm(u * asp * 2.6 + 7, v * 9, 3, seed + 11), sd = sstep(0.56, 0.7, n3) * sstep(0.35, 0.9, v) * 0.5;
        if (sd > 0.001) {
          var n4 = fbm(u * asp * 2.6 + 7, v * 9 - 0.35, 3, seed + 11), sl = sat((n3 - n4) * 5) * (0.4 + 0.6 * gb);
          var sr = dk[0] * 1.15 + (lt[0] - dk[0] * 1.15) * sl * 0.5, sg = dk[1] * 1.15 + (lt[1] - dk[1] * 1.15) * sl * 0.5, sb = dk[2] * 1.18 + (lt[2] - dk[2] * 1.18) * sl * 0.5;
          R += (sr - R) * sd; G += (sg - G) * sd; B += (sb - B) * sd;
        }
      }
      out[0] = R; out[1] = G; out[2] = B;
    });
  }
  // 云隙光柱：从云隙下缘的若干点发出、彼此分离的细光束
  function godRays(g, q, x, y, yEnd, n, seed, a, spread, x0w) {
    if (q.light < 2) return;
    var r = RNG(seed);
    g.save(); g.globalCompositeOperation = 'lighter';
    for (var i = 0; i < n; i++) {
      var sx = x + r.range(-1, 1) * (x0w || 90), ang = (sx - x) / (x0w || 90) * (spread || 0.5) * 0.5 + r.range(-0.08, 0.08);
      var w0 = r.range(6, 16), w1 = r.range(40, 120), ex = sx + Math.tan(ang) * (yEnd - y), al = (a || 0.05) * r.range(0.4, 1) / 3;
      var grd = K.lin(g, sx, y, ex, yEnd, [[0, 'rgba(240,232,214,0)'], [0.15, K.rgba('#efe6d4', al)], [0.6, K.rgba('#efe6d4', al * 0.45)], [1, 'rgba(240,232,214,0)']]);
      for (var k = 1; k <= 3; k++) {
        var f = k / 3;
        K.poly(g, [sx - w0 * f, y, sx + w0 * f, y, ex + w1 * f, yEnd, ex - w1 * f, yEnd]);
        g.fillStyle = grd; g.fill();
      }
    }
    g.restore();
  }
  // 飞翔的乌鸦（剪影）
  function crowFly(g, x, y, s, color, ph) {
    g.save(); g.translate(x, y); g.scale(s, s);
    var up = ph ? -1 : 1;
    g.beginPath();
    g.moveTo(-14, -4 * up); g.quadraticCurveTo(-7, -7 * up, -2, 0); g.lineTo(0, 1.5); g.lineTo(2, 0);
    g.quadraticCurveTo(7, -7 * up, 14, -4 * up); g.quadraticCurveTo(7, -2 * up, 2, 2.5); g.lineTo(0, 4); g.lineTo(-2, 2.5);
    g.quadraticCurveTo(-7, -2 * up, -14, -4 * up); g.closePath();
    g.fillStyle = color || '#141320'; g.fill();
    g.restore();
  }
  function crows(g, q, seed, n, x, y, w, h, s0, color) {
    var r = RNG(seed), m = K.byModel(q, Math.ceil(n / 2), n, n);
    for (var i = 0; i < m; i++) crowFly(g, x + r() * w, y + r() * h, s0 * r.range(0.55, 1.1), color, r() < 0.5);
  }

  /* ======================= 海 ======================= */
  var SEA = { far: '#7d8294', mid: '#3e4858', near: '#1a222e', sheen: '#cfcbd2', crest: '#a3a9b8', trough: '#0e131b', foam: '#e4e6ea' };
  // 海面底色：o = { x, w, yh 地平线, yb 底, seed, gx 云隙反光的屏幕 x, sw 反光半宽, choppy }
  function seaField(g, q, o) {
    var X = o.x || 0, Wd = o.w || W, yh = o.yh, yb = o.yb, Hd = yb - yh, seed = o.seed || 3;
    var far = C(o.far || SEA.far), mid = C(o.mid || SEA.mid), near = C(o.near || SEA.near), sh = C(o.sheen || SEA.sheen);
    var gx = o.gx === undefined ? 600 : o.gx, sw = o.sw || 260, oct = K.byModel(q, 2, 3, 4), cx = o.cx === undefined ? 960 : o.cx;
    var F = o.F || 120, ch = o.choppy === undefined ? 1 : o.choppy;
    var r = fres(q, 0.22);
    field(g, X, yh, Wd, Hd, Wd * r, Math.max(8, Hd * r * 1.5), function (u, v, out) {
      var y = v * Hd + 2, d = y / Hd, Z = F / y, xs = X + u * Wd, Xw = (xs - cx) / 300 * Z;
      var n = fbm(Xw * 1.4, Z * 5.5, oct, seed), n2 = fbm(Xw * 4, Z * 16, 2, seed + 4);
      var amp = sat(d * 5) * 0.9 * ch;
      var fr = Math.pow(1 - d, 3.2);
      var t1 = sat(d * 1.6);
      var R = mid[0] + (near[0] - mid[0]) * t1, G = mid[1] + (near[1] - mid[1]) * t1, B = mid[2] + (near[2] - mid[2]) * t1;
      R += (far[0] - R) * fr; G += (far[1] - G) * fr; B += (far[2] - B) * fr;
      var m = 1 + ((n - 0.5) * 0.9 + (n2 - 0.5) * 0.45) * amp;
      R *= m; G *= m; B *= m;
      var sx = (xs - gx) / (sw * (0.35 + d * 1.6)), shn = Math.exp(-sx * sx) * Math.pow(1 - d, 1.2) * sat(0.25 + (n - 0.35) * 1.8);
      R += (sh[0] - R) * shn * 0.6; G += (sh[1] - G) * shn * 0.6; B += (sh[2] - B) * shn * 0.6;
      out[0] = R; out[1] = G; out[2] = B;
    });
  }
  // 浪：按透视分行画浪峰（亮）、浪谷（暗）、白浪与浪沫
  // o = { x0, x1, yh, yb, seed, rows, choppy(白浪概率倍数), gx, sw, crest, trough, foam, clipTop }
  function waves(g, q, o) {
    var r = RNG(o.seed || 9), yh = o.yh, yb = o.yb, x0 = o.x0 || 0, x1 = o.x1 === undefined ? W : o.x1;
    var rows = o.rows || K.byModel(q, 26, 46, 78), ch = o.choppy === undefined ? 1 : o.choppy;
    var crest = o.crest || SEA.crest, trough = o.trough || SEA.trough, foam = o.foam || SEA.foam;
    var gx = o.gx === undefined ? 600 : o.gx, sw = o.sw || 260;
    for (var i = 0; i < rows; i++) {
      var t = (i + r.range(0.2, 0.8)) / rows, y0 = yh + (yb - yh) * Math.pow(t, 1.65), sc = (y0 - yh) / (yb - yh);
      if (sc < 0.006) continue;
      var Lb = 10 + 330 * sc, th = 0.5 + 9 * sc, x = x0 - r() * Lb;
      var dark = [], lite = [], caps = [];
      while (x < x1) {
        var L = Lb * r.range(0.45, 1.4), y = y0 + r.range(-0.5, 0.5) * th * 2.5, xm = x + L * r.range(0.35, 0.65);
        dark.push(x, y, xm, L, th);
        if (r() < 0.8) lite.push(x + L * 0.08, y, xm, L * 0.84, th);
        if (r() < (0.05 + 0.3 * sc) * ch) caps.push(xm, y - th * 0.4, L * r.range(0.25, 0.6), th);
        x += L * r.range(0.9, 1.6);
      }
      var k;
      // 浪谷（暗面，在浪峰下方）
      g.beginPath();
      for (k = 0; k < dark.length; k += 5) {
        var dx = dark[k], dy = dark[k + 1], dm = dark[k + 2], dl = dark[k + 3], dt = dark[k + 4];
        g.moveTo(dx, dy); g.quadraticCurveTo(dm, dy + dt * 2.2, dx + dl, dy); g.quadraticCurveTo(dm, dy + dt * 0.7, dx, dy);
      }
      g.fillStyle = K.rgba(trough, 0.18 + 0.32 * sc); g.fill();
      // 浪峰（受天光的亮面）
      g.beginPath();
      for (k = 0; k < lite.length; k += 5) {
        var lx = lite[k], ly = lite[k + 1], lm = lite[k + 2], ll = lite[k + 3], lt = lite[k + 4];
        g.moveTo(lx, ly); g.quadraticCurveTo(lm, ly - lt * 1.5, lx + ll, ly); g.quadraticCurveTo(lm, ly - lt * 0.35, lx, ly);
      }
      g.fillStyle = K.rgba(crest, 0.14 + 0.3 * sc); g.fill();
      // 白浪
      if (caps.length) {
        g.beginPath();
        for (k = 0; k < caps.length; k += 4) {
          var cxp = caps[k], cyp = caps[k + 1], cl = caps[k + 2], ct = caps[k + 3];
          g.moveTo(cxp - cl / 2, cyp + ct * 0.3);
          g.quadraticCurveTo(cxp - cl * 0.2, cyp - ct * 1.4, cxp + cl * 0.1, cyp - ct * 0.6);
          g.quadraticCurveTo(cxp + cl * 0.3, cyp - ct * 1.1, cxp + cl / 2, cyp + ct * 0.2);
          g.quadraticCurveTo(cxp, cyp + ct * 0.9, cxp - cl / 2, cyp + ct * 0.3);
        }
        g.fillStyle = K.rgba(foam, 0.35 + 0.45 * sc); g.fill();
        if (q.model >= 1 && sc > 0.15) {
          // 浪沫拖尾
          g.beginPath();
          for (k = 0; k < caps.length; k += 4) {
            var fx = caps[k], fy = caps[k + 1], fl = caps[k + 2], ft = caps[k + 3];
            for (var m2 = 0; m2 < 3; m2++) {
              var ox = r.range(-fl, fl) * 0.9, oy = ft * r.range(0.8, 3);
              g.moveTo(fx + ox - fl * 0.3, fy + oy); g.lineTo(fx + ox + fl * 0.3, fy + oy + r.range(-1, 1));
            }
          }
          g.strokeStyle = K.rgba(foam, 0.18 + 0.2 * sc); g.lineWidth = Math.max(0.6, th * 0.35); g.stroke();
        }
      }
      // 云隙反光的闪烁
      if (q.light >= 2) {
        g.save(); g.globalCompositeOperation = 'lighter';
        g.beginPath();
        var spread = sw * (0.35 + sc * 1.6), cnt = Math.round(6 + 10 * (1 - sc));
        for (var gI = 0; gI < cnt; gI++) {
          var gxp = gx + r.gauss() * spread, gl = (3 + 26 * sc) * r.range(0.4, 1.2), gy = y0 + r.range(-1, 1) * th * 2;
          g.moveTo(gxp - gl / 2, gy); g.lineTo(gxp + gl / 2, gy);
        }
        g.strokeStyle = K.rgba('#f4eee2', 0.16 + 0.22 * (1 - sc)); g.lineWidth = 0.7 + 1.6 * sc; g.stroke();
        g.restore();
      }
    }
  }

  /* ======================= 植被 / 岩石 ======================= */
  // 远景林带：一层锯齿状的针叶林剪影。o = { x0, x1, base(y 或函数), h, color, seed, step, top(可选：顶部高光色) }
  function forestBand(g, q, o) {
    var r = RNG(o.seed || 5), x = o.x0 - 10, step = o.step || 14, pts = [];
    var bf = typeof o.base === 'function' ? o.base : function () { return o.base; };
    g.beginPath(); g.moveTo(o.x0 - 10, bf(0) + 400);
    while (x <= o.x1 + 10) {
      var t = (x - o.x0) / (o.x1 - o.x0), b = bf(t), hh = o.h * (0.55 + 0.45 * fbm(x * 0.012, 1.3, 2, o.seed || 5)) * r.range(0.8, 1.15);
      var w = step * r.range(0.7, 1.3);
      g.lineTo(x, b - hh * 0.3); g.lineTo(x + w * 0.5, b - hh); g.lineTo(x + w, b - hh * 0.3);
      pts.push(x + w * 0.5, b - hh);
      x += w * r.range(0.55, 0.9);
    }
    g.lineTo(o.x1 + 10, bf(1) + 400); g.closePath();
    g.fillStyle = o.color; g.fill();
    return pts;
  }
  // 单棵杉树（神社林），带分层枝叶
  function cedar(g, q, x, y, h, col, lit, r) {
    var w = h * 0.26, layers = K.byModel(q, 4, 6, 9);
    g.fillStyle = K.shade(col, -0.3); g.fillRect(x - h * 0.012, y - h * 0.25, h * 0.024, h * 0.25);
    for (var i = 0; i < layers; i++) {
      var t = i / layers, ly = y - h * 0.12 - (h * 0.88) * t, lw = w * (1 - t * 0.85) * r.range(0.85, 1.15), lh = h * 0.2;
      g.beginPath(); g.moveTo(x - lw, ly); g.quadraticCurveTo(x - lw * 0.3, ly - lh * 0.4, x + r.range(-3, 3), ly - lh); g.quadraticCurveTo(x + lw * 0.3, ly - lh * 0.4, x + lw, ly);
      g.quadraticCurveTo(x, ly - lh * 0.15, x - lw, ly); g.closePath();
      g.fillStyle = col; g.fill();
      if (lit && q.light >= 1) { g.beginPath(); g.moveTo(x - lw, ly); g.quadraticCurveTo(x - lw * 0.35, ly - lh * 0.45, x, ly - lh); g.lineTo(x - lw * 0.15, ly - lh * 0.3); g.closePath(); g.fillStyle = lit; g.fill(); }
    }
  }
  // 圆润的树冠团（阔叶/松树），用若干叶团叠成
  function canopy(g, q, x, y, rx, ry, col, litCol, r, n) {
    n = n || K.byModel(q, 5, 9, 14);
    for (var i = 0; i < n; i++) {
      var a = r() * TAU, d = Math.sqrt(r()), px = x + Math.cos(a) * rx * d * 0.8, py = y + Math.sin(a) * ry * d * 0.8, rr = (rx + ry) * 0.5 * r.range(0.25, 0.45);
      K.ellipse(g, px, py, rr, rr * 0.8); g.fillStyle = col; g.fill();
      if (litCol && py < y + ry * 0.2) { K.ellipse(g, px - rr * 0.25, py - rr * 0.3, rr * 0.6, rr * 0.45); g.fillStyle = litCol; g.fill(); }
    }
  }
  // 草丛 / 杂草
  function grassTufts(g, q, r, n, x, y, w, h, col, len) {
    g.beginPath();
    for (var i = 0; i < n; i++) {
      var px = x + r() * w, py = y + r() * h, L = (len || 18) * r.range(0.5, 1.2), m = 3 + (r() * 3 | 0);
      for (var k = 0; k < m; k++) { var a = -PI / 2 + r.range(-0.7, 0.7); g.moveTo(px + k * 1.5, py); g.quadraticCurveTo(px + Math.cos(a) * L * 0.4, py + Math.sin(a) * L * 0.5, px + Math.cos(a) * L, py + Math.sin(a) * L); }
    }
    g.strokeStyle = col; g.lineWidth = 1.6; g.stroke();
  }
  // 岩块（单个）：o = { lit, dark, wet, moss, seed, light(0..1 方向) }
  function boulder(g, q, x, y, w, h, o) {
    o = o || {};
    var r = RNG(o.seed || 1), n = 9, pts = [];
    for (var i = 0; i < n; i++) {
      var a = PI + i / (n - 1) * PI, rr = r.range(0.82, 1.05);
      pts.push(x + Math.cos(a) * w / 2 * rr, y + Math.sin(a) * h * rr * (a > PI * 1.15 && a < PI * 1.85 ? 1 : 0.7));
    }
    pts.push(x + w / 2 * 0.98, y + h * 0.06, x - w / 2 * 0.98, y + h * 0.06);
    var base = o.color || '#3a3a46';
    if (q.light >= 1) K.contact(g, x + w * 0.06, y + h * 0.04, w * 0.62, h * 0.16, 0.6);
    smoothPath(g, pts, true);
    mat(g, q, base, 'rock', ROCK, 200, x, y);
    smoothPath(g, pts, true);
    shadeLin(g, x - w * 0.4, y - h, x + w * 0.3, y, [[0, K.rgba(o.lit || '#b6b4c6', 0.32)], [0.45, 'rgba(0,0,0,0)'], [1, 'rgba(6,6,12,0.55)']]);
    if (q.tex <= 0) { smoothPath(g, pts, true); shadeLin(g, 0, y - h, 0, y, [[0, K.rgba(base, 0)], [1, 'rgba(0,0,0,0.25)']]); }
    if (o.moss && q.model >= 1) {
      g.save(); smoothPath(g, pts, true); g.clip();
      for (var m = 0; m < 5; m++) K.blob(g, x + r.range(-0.4, 0.2) * w, y - h * r.range(0.65, 1), w * r.range(0.12, 0.22), o.moss, 0.55);
      g.restore();
    }
    if (o.wet !== false) {
      // 湿润的下半部
      smoothPath(g, pts, true);
      shadeLin(g, 0, y - h * 0.5, 0, y, [[0, 'rgba(10,12,20,0)'], [1, 'rgba(10,12,20,0.45)']]);
      if (q.light >= 2) {
        g.save(); g.globalCompositeOperation = 'lighter';
        g.strokeStyle = 'rgba(230,232,245,0.45)'; g.lineWidth = 1.6;
        g.beginPath();
        for (var s = 0; s < 4; s++) { var sx = x + r.range(-0.4, 0.1) * w, sy = y - h * r.range(0.4, 0.9); g.moveTo(sx, sy); g.lineTo(sx + r.range(5, 16), sy - r.range(1, 4)); }
        g.stroke(); g.restore();
      }
    }
    // 上缘高光
    if (q.light >= 1) {
      g.beginPath(); var k0 = 1;
      g.moveTo(pts[k0 * 2], pts[k0 * 2 + 1]);
      for (var k = k0 + 1; k < 6; k++) g.lineTo(pts[k * 2], pts[k * 2 + 1]);
      strokeP(g, K.rgba(o.lit || '#c8c6d8', 0.35), 2);
    }
  }
  var ROCK = { c1: '#1f1e26', c2: '#5d5a68', seed: 37 };
  var ROCK_WET = { c1: '#15161d', c2: '#4b4c5a', seed: 38 };

  /* ======================= 建筑（远景剪影） ======================= */
  // 月蚀馆（哥特式宅邸）远景剪影。x 中心, y 地面, s 缩放
  function mansionSil(g, q, x, y, s, col, win, litWins) {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = col;
    // 主楼与两翼
    g.fillRect(-120, -46, 240, 46);
    g.fillRect(-190, -34, 74, 34); g.fillRect(116, -34, 74, 34);
    K.poly(g, [-128, -46, -96, -86, 96, -86, 128, -46]); g.fill();         // 主屋顶
    K.poly(g, [-196, -34, -176, -62, -130, -62, -110, -34]); g.fill();
    K.poly(g, [110, -34, 130, -62, 176, -62, 196, -34]); g.fill();
    K.poly(g, [-24, -86, 0, -122, 24, -86]); g.fill();                      // 中央尖顶
    K.poly(g, [-80, -86, -66, -104, -52, -86]); g.fill(); K.poly(g, [52, -86, 66, -104, 80, -86]); g.fill();
    g.fillRect(-60, -100, 7, 16); g.fillRect(44, -100, 7, 16);             // 烟囱
    // 窗
    if (win) {
      g.fillStyle = win;
      for (var i = -5; i <= 5; i++) { if (i === 0) continue; g.fillRect(i * 20 - 3, -36, 6, 12); }
      g.fillRect(-170, -24, 5, 10); g.fillRect(-150, -24, 5, 10); g.fillRect(146, -24, 5, 10); g.fillRect(166, -24, 5, 10);
    }
    if (litWins) {
      for (var j = 0; j < litWins.length; j++) {
        var lx = litWins[j] * 20 - 3;
        g.fillStyle = '#ffc77a'; g.fillRect(lx, -36, 6, 12);
        if (q.light >= 1) K.glow(g, lx + 3, -30, 26, '#ffb860', 0.35);
      }
    }
    g.restore();
  }
  // 鸦之塔远景剪影：cx 中心、base 底部 y、h 高度
  function towerSil(g, q, cx, base, h, w, col, clock) {
    g.fillStyle = col;
    g.fillRect(cx - w / 2, base - h * 0.82, w, h * 0.82);
    g.fillRect(cx - w * 0.62, base - h * 0.84, w * 1.24, h * 0.04);      // 瞭望台
    K.poly(g, [cx - w * 0.56, base - h * 0.84, cx, base - h, cx + w * 0.56, base - h * 0.84]); g.fill();
    g.fillRect(cx - 0.8, base - h * 1.06, 1.6, h * 0.07);
    if (clock) { K.ellipse(g, cx, base - h * 0.7, w * 0.3, w * 0.3); g.fillStyle = clock; g.fill(); }
  }

  /* ======================= 浮雕场（岩壁 / 洞壁） ======================= */
  // 用噪声高度场 + 有限差分法线做方向光照，得到有体积感的岩面（低分辨率，之后用纹理叠加细节）
  // o = { seed, fx, fy 噪声频率(每设计单位), oct, L:[lx,ly,lz] 平行光方向 或 P:[px,py,pz] 点光源(设计坐标),
  //       dark, mid, lite 三色, amb 环境光, wet(u,v)->0..1 湿润度, ridge 是否使用岭状噪声, alpha(u,v) 可选, spec }
  function bumpField(g, q, x, y, w, h, o) {
    var dk = C(o.dark), md = C(o.mid), lt = C(o.lite), seed = o.seed || 1, oct = o.oct || K.byModel(q, 3, 4, 5);
    var fx = o.fx, fy = o.fy, amb = o.amb === undefined ? 0.25 : o.amb, k = o.k || 2.2, spec = q.light >= 2 && o.spec !== false;
    var L = o.L, P = o.P, ridge = o.ridge, wetf = o.wet, af = o.alpha, att = o.att || 900;
    var lx = 0, ly = 0, lz = 1;
    if (L) { var ll = Math.sqrt(L[0] * L[0] + L[1] * L[1] + L[2] * L[2]); lx = L[0] / ll; ly = L[1] / ll; lz = L[2] / ll; }
    var r = fres(q, o.res || 0.22), e = 0.6 / Math.max(fx, fy) * 0.15;
    function Hf(px, py) { var n = fbm(px * fx, py * fy, oct, seed); return ridge ? 1 - Math.abs(n - 0.5) * 2 : n; }
    field(g, x, y, w, h, w * r, h * r, function (u, v, out) {
      var px = x + u * w, py = y + v * h;
      var h0 = Hf(px, py), hx = Hf(px + e / fx, py), hy = Hf(px, py + e / fy);
      var nx = -(hx - h0) / e * k * 0.15, ny = -(hy - h0) / e * k * 0.15, nz = 1, nl = Math.sqrt(nx * nx + ny * ny + 1);
      nx /= nl; ny /= nl; nz /= nl;
      var a = 1;
      if (P) {
        var dx = P[0] - px, dy = P[1] - py, dz = P[2], dl = Math.sqrt(dx * dx + dy * dy + dz * dz);
        lx = dx / dl; ly = dy / dl; lz = dz / dl; a = 1 / (1 + (dl / att) * (dl / att));
      }
      var dif = nx * lx + ny * ly + nz * lz; dif = dif < 0 ? 0 : dif;
      var lum = amb + (1 - amb) * dif * a;
      lum = lum * (0.75 + h0 * 0.5);
      var R, G, B;
      if (lum < 0.5) { var t = lum * 2; R = dk[0] + (md[0] - dk[0]) * t; G = dk[1] + (md[1] - dk[1]) * t; B = dk[2] + (md[2] - dk[2]) * t; }
      else { var t2 = sat((lum - 0.5) * 2); R = md[0] + (lt[0] - md[0]) * t2; G = md[1] + (lt[1] - md[1]) * t2; B = md[2] + (lt[2] - md[2]) * t2; }
      if (wetf) {
        var wv = wetf(u, v);
        if (wv > 0) {
          R *= 1 - wv * 0.45; G *= 1 - wv * 0.42; B *= 1 - wv * 0.36;
          if (spec) { var sp = nz * 0.3 + ny * -0.7 + nx * (lx * 0.3); sp = sp > 0.6 ? Math.pow((sp - 0.6) / 0.4, 3) * wv * a * 160 : 0; R += sp; G += sp; B += sp * 1.05; }
        }
      }
      out[0] = R; out[1] = G; out[2] = B;
      if (af) out[3] = af(u, v) * 255;
    });
  }
  // 晶格（Voronoi）岩面：每个岩块是一个朝向随机的平面 → 明暗分明的块面；块与块之间是裂缝（带 AO）
  // o = { seed, cw, ch 大岩块尺寸, sw, sh 小岩块尺寸, L:[lx,ly,lz] 或 P:[x,y,z] 点光源, att, dark, mid, lite, amb,
  //       crack 裂缝宽度(0..1), wet(u,v), moss(u,v)->0..1, mossCol, tilt 法线朝上偏置, alpha(u,v), res }
  function cellHash(ix, iy, s) { return NV[NP[(NP[(ix + s * 7) & 255] + (iy & 255)) & 511]]; }
  function cellHash2(ix, iy, s) { return NV[NP[(NP[(iy * 3 + s * 13) & 255] + (ix & 255)) & 511]]; }
  function voro(px, py, s, out) {
    var ix = Math.floor(px), iy = Math.floor(py), f1 = 9, f2 = 9, id1x = 0, id1y = 0;
    for (var j = -1; j <= 1; j++) for (var i = -1; i <= 1; i++) {
      var cx = ix + i, cy = iy + j, fx = cx + 0.15 + cellHash(cx, cy, s) * 0.7, fy = cy + 0.15 + cellHash2(cx, cy, s) * 0.7;
      var dx = px - fx, dy = py - fy, d = dx * dx + dy * dy;
      if (d < f1) { f2 = f1; f1 = d; id1x = cx; id1y = cy; } else if (d < f2) f2 = d;
    }
    out[0] = Math.sqrt(f2) - Math.sqrt(f1); out[1] = id1x; out[2] = id1y;
  }
  function rockCells(g, q, x, y, w, h, o) {
    var dk = C(o.dark || '#141419'), md = C(o.mid || '#3c3a46'), lt = C(o.lite || '#9a97a6'), mc = C(o.mossCol || '#3e4a30');
    var seed = o.seed || 1, cw = o.cw || 90, ch = o.ch || 120, sw = o.sw || cw * 0.35, sh = o.sh || ch * 0.35;
    var amb = o.amb === undefined ? 0.28 : o.amb, crack = o.crack === undefined ? 0.08 : o.crack, tilt = o.tilt === undefined ? 0.2 : o.tilt;
    var L = o.L || [-0.6, -0.6, 0.55], P = o.P, att = o.att || 900, wetf = o.wet, mossf = o.moss, af = o.alpha, spec = q.light >= 2;
    var small = q.model >= 1, detail = q.model >= 2;
    var ll = Math.sqrt(L[0] * L[0] + L[1] * L[1] + L[2] * L[2]), lx = L[0] / ll, ly = L[1] / ll, lz = L[2] / ll;
    var V1 = [0, 0, 0], V2 = [0, 0, 0];
    var r = fres(q, o.res || 0.42);
    field(g, x, y, w, h, w * r, h * r, function (u, v, out) {
      var px = x + u * w, py = y + v * h;
      var wn = detail ? (fbm(px * 0.01, py * 0.01, 2, seed + 5) - 0.5) : 0;
      voro(px / cw + wn * 0.5, py / ch + wn * 0.3, seed, V1);
      var h1 = cellHash(V1[1], V1[2], seed + 3), h2 = cellHash2(V1[1], V1[2], seed + 9);
      var eb = sstep(0, crack * 2.5, V1[0]);
      var nx = (h1 - 0.5) * 1.15 * eb, ny = ((h2 - 0.5) * 0.9 - tilt) * eb - tilt * (1 - eb), nz = 1;
      var cr = sstep(0, crack, V1[0]);
      if (small) {
        voro(px / sw, py / sh, seed + 17, V2);
        var eb2 = sstep(0, crack * 2, V2[0]);
        nx += (cellHash(V2[1], V2[2], seed + 21) - 0.5) * 0.55 * eb2; ny += (cellHash2(V2[1], V2[2], seed + 23) - 0.5) * 0.45 * eb2;
        cr *= 0.55 + 0.45 * sstep(0, crack * 0.8, V2[0]);
      }
      var n = detail ? fbm(px * 0.03, py * 0.03, 3, seed + 31) : 0.5;
      nx += (n - 0.5) * 0.5;
      var nl = Math.sqrt(nx * nx + ny * ny + 1); nx /= nl; ny /= nl; nz = 1 / nl;
      var a = 1;
      if (P) { var dx = P[0] - px, dy = P[1] - py, dz = P[2], dl = Math.sqrt(dx * dx + dy * dy + dz * dz); lx = dx / dl; ly = dy / dl; lz = dz / dl; a = 1 / (1 + (dl / att) * (dl / att)); }
      var dif = nx * lx + ny * ly + nz * lz; dif = dif < 0 ? 0 : dif;
      var lum = (amb + (1 - amb) * dif * a) * (0.82 + n * 0.36) * (0.25 + 0.75 * cr);
      var R, G, B;
      if (lum < 0.5) { var t = lum * 2; R = dk[0] + (md[0] - dk[0]) * t; G = dk[1] + (md[1] - dk[1]) * t; B = dk[2] + (md[2] - dk[2]) * t; }
      else { var t2 = sat((lum - 0.5) * 2); R = md[0] + (lt[0] - md[0]) * t2; G = md[1] + (lt[1] - md[1]) * t2; B = md[2] + (lt[2] - md[2]) * t2; }
      if (mossf) { var mv = mossf(u, v) * sstep(0.45, 0.7, n + (ny < 0 ? -ny * 0.5 : 0)); if (mv > 0) { R += (mc[0] * (0.6 + dif * 0.8) - R) * mv; G += (mc[1] * (0.6 + dif * 0.8) - G) * mv; B += (mc[2] * (0.6 + dif * 0.8) - B) * mv; } }
      if (wetf) {
        var wv = wetf(u, v);
        if (wv > 0) {
          R *= 1 - wv * 0.4; G *= 1 - wv * 0.38; B *= 1 - wv * 0.32;
          if (spec) { var hz = nx * lx * 0.5 + ny * (ly * 0.5 - 0.5) + nz * (lz * 0.5 + 0.5); if (hz > 0.94) { var sp = Math.pow((hz - 0.94) / 0.06, 2) * wv * a * cr * sstep(0.55, 0.75, n) * 90; R += sp; G += sp; B += sp * 1.06; } }
        }
      }
      out[0] = R; out[1] = G; out[2] = B;
      if (af) out[3] = af(u, v) * 255;
    });
  }
  // 岩缝：从起点向下分叉的细裂缝
  function cracks(g, r, n, x, y, w, h, len, col, lw, litCol) {
    g.beginPath();
    var lit = [];
    for (var i = 0; i < n; i++) {
      var px = x + r() * w, py = y + r() * h, L = len * r.range(0.4, 1.2), ang = PI / 2 + r.range(-0.35, 0.35);
      g.moveTo(px, py);
      var segs = 3 + (r() * 4 | 0);
      for (var s2 = 0; s2 < segs; s2++) {
        px += Math.cos(ang) * L / segs; py += Math.sin(ang) * L / segs; ang += r.range(-0.5, 0.5);
        g.lineTo(px, py); lit.push(px + 1.5, py);
      }
    }
    g.strokeStyle = col; g.lineWidth = lw || 2; g.stroke();
    if (litCol) {
      g.beginPath();
      for (var k = 0; k + 3 < lit.length; k += 2) { g.moveTo(lit[k], lit[k + 1]); g.lineTo(lit[k + 2], lit[k + 3]); }
      g.strokeStyle = litCol; g.lineWidth = 1; g.stroke();
    }
  }
  // 悬崖上的小松树（被风吹斜）
  function cliffPine(g, q, x, y, s, col, lit, r) {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.strokeStyle = '#2a2420'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-6, -24, 10, -46); g.quadraticCurveTo(22, -60, 30, -64); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(4, -30); g.lineTo(-18, -40); g.moveTo(12, -48); g.lineTo(36, -50); g.stroke();
    var pads = [[-20, -44, 20, 8], [10, -60, 22, 9], [34, -54, 18, 7], [28, -70, 16, 7], [-4, -56, 14, 6]];
    for (var i = 0; i < pads.length; i++) {
      var p = pads[i];
      K.ellipse(g, p[0], p[1], p[2], p[3]); g.fillStyle = col; g.fill();
      if (lit && q.light >= 1) { K.ellipse(g, p[0] - 3, p[1] - 3, p[2] * 0.7, p[3] * 0.5); g.fillStyle = lit; g.fill(); }
    }
    g.restore();
    void r;
  }

  /* ======================= 哥特式建筑部件 ======================= */
  var STONE_WALL = { c1: '#2b2a33', c2: '#57535f', mortar: '#18171d', rows: 6, cols: 3, seed: 5, irregular: 1 };
  // 尖拱窗路径
  function archPath(g, x, y, w, h) {
    var sp = y + w * 0.55;
    g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, sp);
    g.bezierCurveTo(x, y + w * 0.2, x + w * 0.3, y + w * 0.04, x + w / 2, y);
    g.bezierCurveTo(x + w * 0.7, y + w * 0.04, x + w, y + w * 0.2, x + w, sp);
    g.lineTo(x + w, y + h); g.closePath();
  }
  // 哥特尖拱窗：o = { lit:暖光, sky:反射天色, frame:石框色, tracery, curtain }
  function gothicWin(g, q, x, y, w, h, o) {
    o = o || {};
    var fw = Math.max(3, w * 0.12);
    archPath(g, x - fw, y - fw, w + fw * 2, h + fw * 1.4);
    g.fillStyle = o.frame || '#6a6672'; g.fill();
    if (q.light >= 1) { archPath(g, x - fw, y - fw, w + fw * 2, h + fw * 1.4); shadeLin(g, x - fw, 0, x + w + fw, 0, [[0, 'rgba(255,250,240,0.18)'], [1, 'rgba(0,0,0,0.3)']]); }
    archPath(g, x, y, w, h);
    if (o.lit) {
      g.fillStyle = K.lin(g, 0, y, 0, y + h, [K.shade(o.lit, 0.25), o.lit, K.shade(o.lit, -0.3)]); g.fill();
    } else {
      g.fillStyle = K.lin(g, x, y, x + w * 0.5, y + h, [o.sky || '#7d7d92', '#30323f', '#1a1b24']); g.fill();
      if (q.light >= 2) { g.save(); archPath(g, x, y, w, h); g.clip(); g.beginPath(); g.moveTo(x + w * 0.15, y + h); g.lineTo(x + w * 0.45, y); g.lineTo(x + w * 0.7, y); g.lineTo(x + w * 0.4, y + h); g.closePath(); fillP(g, 'rgba(255,255,255,0.08)'); g.restore(); }
    }
    // 窗棂
    var mw = Math.max(1.5, w * 0.06), mc = o.mullion || '#24222a';
    g.fillStyle = mc;
    g.fillRect(x + w / 2 - mw / 2, y + w * 0.12, mw, h - w * 0.12);
    if (h > w * 1.6) g.fillRect(x, y + h * 0.55, w, mw);
    if (o.tracery !== false && w > 22 && q.model >= 1) {
      g.strokeStyle = mc; g.lineWidth = mw * 0.8;
      K.ellipse(g, x + w / 2, y + w * 0.38, w * 0.16, w * 0.16); g.stroke();
    }
    if (o.lit && q.light >= 1) K.glow(g, x + w / 2, y + h * 0.5, Math.max(w, h) * 0.9, o.lit, 0.18);
    // 窗台
    g.fillStyle = o.frame || '#6a6672'; g.fillRect(x - fw * 1.4, y + h + fw * 0.2, w + fw * 2.8, fw * 0.9);
    if (q.light >= 1) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x - fw * 1.2, y + h + fw * 1.1, w + fw * 2.4, fw * 0.8); }
  }
  // 石板瓦屋顶（多边形路径已建立后调用）：横向瓦行 + 错缝
  function slateRoof(g, q, pts, x0, y0, x1, y1, col, seed) {
    K.poly(g, pts);
    g.fillStyle = K.lin(g, 0, y0, 0, y1, [K.shade(col, 0.08), col, K.shade(col, -0.25)]); g.fill();
    if (q.tex > 0) { K.poly(g, pts); texFill(g, q, 'noise', { c1: '#000000', c2: '#ffffff', scale: 10, oct: 3, seed: seed || 2 }, 128, 0, 0, 0.08, null, null, null, 'overlay'); }
    if (q.model >= 1) {
      g.save(); K.poly(g, pts); g.clip();
      var rows = Math.max(4, Math.round((y1 - y0) / K.byModel(q, 18, 14, 11))), r = RNG(seed || 3);
      g.strokeStyle = 'rgba(10,10,16,0.45)'; g.lineWidth = 1.2; g.beginPath();
      for (var i = 1; i < rows; i++) { var yy = y0 + (y1 - y0) * i / rows; g.moveTo(x0, yy); g.lineTo(x1, yy); }
      g.stroke();
      if (q.model >= 2) {
        g.beginPath();
        for (i = 0; i < rows; i++) {
          var ya = y0 + (y1 - y0) * i / rows, yb2 = y0 + (y1 - y0) * (i + 1) / rows, step = 16 + (y1 - y0) / rows;
          for (var xx = x0 + (i % 2) * step / 2; xx < x1; xx += step) { g.moveTo(xx, ya); g.lineTo(xx, yb2); }
        }
        g.strokeStyle = 'rgba(10,10,16,0.25)'; g.stroke();
        // 个别瓦片色差
        for (var t = 0; t < 40; t++) { var tx = r.range(x0, x1), ty = y0 + (y1 - y0) * ((r() * rows) | 0) / rows; g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.12)'; g.fillRect(tx, ty, 14, (y1 - y0) / rows); }
      }
      if (q.light >= 2) { g.fillStyle = K.lin(g, 0, y0, 0, y1, ['rgba(200,200,220,0.16)', 'rgba(200,200,220,0)']); g.fillRect(x0, y0, x1 - x0, (y1 - y0) * 0.5); }
      g.restore();
    }
  }

  /* ======================= 石阶 ======================= */
  // 通用台阶：steps 为 [x0,x1,yTread,yRiserBottom] 数组（从远到近），颜色与材质
  function drawSteps(g, q, steps, o) {
    for (var i = 0; i < steps.length; i++) {
      var s = steps[i], x0 = s[0], x1 = s[1], yt = s[2], yb = s[3], tread = s[4] || 0;
      // 踏面
      if (tread > 0) {
        K.poly(g, [x0 + (s[5] || 0), yt - tread, x1 + (s[6] || 0), yt - tread, x1, yt, x0, yt]);
        mat(g, q, o.top, 'stone', o.tex, 256, 0, yt);
        K.poly(g, [x0 + (s[5] || 0), yt - tread, x1 + (s[6] || 0), yt - tread, x1, yt, x0, yt]);
        fillP(g, K.lin(g, 0, yt - tread, 0, yt, ['rgba(220,220,235,0.04)', 'rgba(220,220,235,0.1)']));
        if (o.wet && q.light >= 2) fillP(g, K.lin(g, x0, 0, x1, 0, ['rgba(200,205,225,0.05)', 'rgba(200,205,225,0.18)', 'rgba(200,205,225,0.03)']));
      }
      // 立面
      rectP(g, x0, yt, x1 - x0, yb - yt);
      mat(g, q, o.front, 'stone', o.tex, 256, 0, yt);
      rectP(g, x0, yt, x1 - x0, yb - yt);
      fillP(g, K.lin(g, 0, yt, 0, yb, ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.45)']));
      if (q.light >= 1) { g.fillStyle = K.rgba(o.edge || '#c8c6d4', 0.3); g.fillRect(x0, yt, x1 - x0, 1.6); }
      if (o.moss && q.model >= 1) {
        var r = RNG(i * 7 + 3);
        for (var m = 0; m < 3; m++) { var mx = r.range(x0, x1); K.ellipse(g, mx, yt + 1, r.range(8, 26), r.range(2, 5)); g.fillStyle = K.rgba(o.moss, 0.6); g.fill(); }
      }
    }
  }

  /* =================================================================
   * 渡船甲板 ferry
   * ================================================================= */
  var FERRY_GAP = [620, 205];
  function drawFerry(g, q) {
    var yh = 560, r = RNG(101);
    sky(g, q, { y: 0, h: yh + 6, seed: 11, gx: FERRY_GAP[0] / W, gy: FERRY_GAP[1] / (yh + 6), gw: 0.13 });
    godRays(g, q, FERRY_GAP[0], FERRY_GAP[1] + 40, yh, 9, 17, 0.04, 0.6, 160);
    crows(g, q, 31, 5, 900, 120, 380, 150, 1.1, '#24222f');

    // 远处的小岛（左）
    smoothPath(g, [40, yh + 2, 120, yh - 10, 210, yh - 22, 300, yh - 16, 380, yh - 6, 460, yh + 2], false);
    g.lineTo(460, yh + 4); g.lineTo(40, yh + 4); g.closePath();
    fillP(g, mixc('#666a7e', SKY.hor, 0.45));

    // 宵鸦岛（左缓坡 → 中央山丘与宅邸 → 右侧北崖与塔）
    var isl = ridge(990, 1910, 10, function (t) {
      var h = t < 0.5 ? Math.pow(Math.sin(t / 0.5 * PI * 0.5), 1.3) * 170 : 170 - (t - 0.5) * 60;
      if (t > 0.86) h *= 1 - Math.pow((t - 0.86) / 0.14, 2.2);
      return yh - 6 - h;
    }, 7, 21, 0.04);
    function islPath() {
      g.beginPath(); g.moveTo(990, yh + 4);
      for (var i = 0; i < isl.length; i += 2) g.lineTo(isl[i], isl[i + 1]);
      g.lineTo(1910, yh + 4); g.closePath();
    }
    var islCol = '#4b4e63';
    islPath();
    g.fillStyle = K.lin(g, 0, 380, 0, yh, [mixc(islCol, '#2e3046', 0.35), islCol, mixc(islCol, SKY.hor, 0.4)]); g.fill();
    g.save(); islPath(); g.clip();
    // 林冠的明暗起伏（左上受光）
    if (q.model >= 1) {
      var tr = RNG(23);
      for (var t2 = 0; t2 < K.byModel(q, 0, 90, 200); t2++) {
        var tx = 990 + tr() * 900, ty = 380 + tr() * 170;
        K.ellipse(g, tx, ty, tr.range(5, 13), tr.range(3, 7)); g.fillStyle = K.rgba(tr() < 0.45 ? '#62667c' : '#363850', 0.45); g.fill();
      }
    }
    // 右侧北崖岩壁（竖向岩纹）
    g.beginPath(); g.moveTo(1760, 440); g.lineTo(1880, 470); g.lineTo(1915, yh + 4); g.lineTo(1740, yh + 4); g.closePath();
    g.fillStyle = 'rgba(38,38,56,0.55)'; g.fill();
    if (q.model >= 1) { g.strokeStyle = 'rgba(90,92,112,0.35)'; g.lineWidth = 1.5; g.beginPath(); for (var cl = 0; cl < 9; cl++) { var cxl = 1760 + cl * 17; g.moveTo(cxl, 450 + cl * 3); g.lineTo(cxl - 6 + cl, yh); } g.stroke(); }
    // 山脊左侧受光
    g.fillStyle = K.lin(g, 1000, 0, 1500, 0, ['rgba(160,160,185,0.18)', 'rgba(160,160,185,0)']); g.fillRect(990, 360, 520, 210);
    g.restore();
    // 宅邸与塔
    mansionSil(g, q, 1420, 398, 0.66, '#35374f', '#2b2d43', q.light >= 1 ? [-2, 3] : null);
    towerSil(g, q, 1790, 446, 142, 24, '#32344b', '#6d7082');
    if (q.light >= 1) K.glow(g, 1790, 345, 12, '#ffd090', 0.25);
    // 岛下缘的海雾 + 空气透视
    g.save(); islPath(); g.clip();
    haze(g, 980, 290, 940, yh - 286, SKY.hor, 0.18, 0.62);
    g.restore();

    // 海
    seaField(g, q, { yh: yh, yb: 905, seed: 7, gx: FERRY_GAP[0], sw: 230, F: 90 });
    waves(g, q, { yh: yh, yb: 905, seed: 19, gx: FERRY_GAP[0], sw: 230, choppy: 1.15 });
    // 海平线的亮线
    g.fillStyle = K.lin(g, 0, yh - 3, 0, yh + 5, ['rgba(220,220,230,0)', 'rgba(200,202,215,0.35)', 'rgba(200,202,215,0)']); g.fillRect(0, yh - 3, W, 8);

    // 桅杆与索具（左）
    var mx = 214;
    g.strokeStyle = 'rgba(30,28,30,0.85)'; g.lineWidth = 2.2;
    K.line(g, mx, 70, 20, 905, 2.4, 'rgba(36,32,32,0.9)');
    K.line(g, mx, 72, 470, 905, 2.4, 'rgba(36,32,32,0.9)');
    K.line(g, mx, 150, 1560, 390, 1.6, 'rgba(40,36,38,0.7)');
    // 小旗
    g.beginPath(); g.moveTo(mx + 3, 64); g.bezierCurveTo(mx + 40, 54, mx + 70, 76, mx + 104, 64); g.lineTo(mx + 98, 92); g.bezierCurveTo(mx + 66, 102, mx + 38, 84, mx + 3, 96); g.closePath();
    g.fillStyle = K.lin(g, mx, 60, mx + 104, 92, ['#c9c6c0', '#e9e6de', '#a9a6a2']); g.fill();
    K.ellipse(g, mx + 46, 80, 10, 10); g.fillStyle = '#a3263a'; g.fill();
    rectP(g, mx - 7, 56, 14, 850);
    mat(g, q, '#7a6a5e', 'metal', { c1: '#4a3c34', c2: '#8a7a6c', dir: 'v', seed: 3 }, 128, mx - 7, 0);
    rectP(g, mx - 7, 56, 14, 850);
    shadeLin(g, mx - 7, 0, mx + 7, 0, [[0, 'rgba(255,240,225,0.28)'], [0.4, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,0.55)']]);
    g.fillStyle = '#2a2424'; g.fillRect(mx - 30, 146, 60, 6); g.fillRect(mx - 9, 50, 18, 8);

    drawFerryCabin(g, q);
    drawFerryRail(g, q, r);
    drawFerryDeck(g, q, r);
    K.vignette(g, W, H, q.light >= 1 ? 0.5 : 0.35, 0.45);
  }
  function drawFerryCabin(g, q) {
    var x0 = 1494, x1 = 1762, top = 452, bot = 846;
    // 前端面（向消失点退去）
    K.poly(g, [x0, top, x0 - 46, top + 16, x0 - 46, bot, x0, bot]);
    fillP(g, '#8d8c88');
    K.poly(g, [x0, top, x0 - 46, top + 16, x0 - 46, bot, x0, bot]);
    shadeLin(g, x0 - 46, 0, x0, 0, [[0, 'rgba(0,0,0,0.35)'], [1, 'rgba(0,0,0,0.1)']]);
    // 正面
    rectP(g, x0, top, x1 - x0, bot - top);
    mat(g, q, '#b9b8b1', 'metal', { c1: '#9c9a92', c2: '#cfcdc4', dir: 'v', seed: 9 }, 256, x0, top);
    rectP(g, x0, top, x1 - x0, bot - top);
    shadeLin(g, 0, top, 0, bot, [[0, 'rgba(255,250,240,0.12)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(10,12,20,0.4)']]);
    // 锈迹流痕
    var r = RNG(55);
    if (q.model >= 1) {
      for (var i = 0; i < K.byModel(q, 0, 8, 16); i++) {
        var sx = x0 + 10 + r() * (x1 - x0 - 20), sy = top + 8 + r() * 120, sl = r.range(40, 200);
        g.fillStyle = K.lin(g, 0, sy, 0, sy + sl, [[0, 'rgba(120,64,34,0.5)'], [1, 'rgba(120,64,34,0)']]);
        g.fillRect(sx, sy, r.range(2, 6), sl);
      }
    }
    // 铆接板缝
    g.strokeStyle = 'rgba(60,60,64,0.45)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(x0, top + 140); g.lineTo(x1, top + 140); g.moveTo(x0, top + 300); g.lineTo(x1, top + 300); g.moveTo(x0 + 250, top); g.lineTo(x0 + 250, bot); g.stroke();
    // 门（船夫所在处）：深色的驾驶室内部
    var dx = 1548, dy = 504, dw = 132, dh = 342;
    rectP(g, dx, dy, dw, dh);
    g.fillStyle = K.lin(g, 0, dy, 0, dy + dh, ['#1b1d26', '#12131a', '#0c0c12']); g.fill();
    // 室内仪表的微光与舵轮
    if (q.light >= 1) K.glow(g, dx + dw * 0.7, dy + 150, 70, '#7fa0a0', 0.18);
    g.save(); rectP(g, dx, dy, dw, dh); g.clip();
    g.strokeStyle = '#3a3026'; g.lineWidth = 6; K.ellipse(g, dx + dw * 0.72, dy + 170, 34, 34); g.stroke();
    g.lineWidth = 3; for (var sp = 0; sp < 4; sp++) { var a = sp * PI / 4; K.line(g, dx + dw * 0.72 - Math.cos(a) * 42, dy + 170 - Math.sin(a) * 42, dx + dw * 0.72 + Math.cos(a) * 42, dy + 170 + Math.sin(a) * 42, 3, '#3a3026'); }
    // 船夫的身影（半隐在暗处）
    var fx = dx + 54, fy = dy + 60;
    g.fillStyle = '#20232c';
    g.beginPath(); g.moveTo(fx - 40, dh + dy); g.lineTo(fx - 36, fy + 90); g.quadraticCurveTo(fx - 30, fy + 58, fx, fy + 54); g.quadraticCurveTo(fx + 32, fy + 58, fx + 40, fy + 92); g.lineTo(fx + 44, dh + dy); g.closePath(); g.fill();
    g.fillStyle = '#2b2a2e'; K.ellipse(g, fx, fy + 30, 17, 21); g.fill();                  // 头
    g.fillStyle = 'rgba(168,140,118,0.55)'; K.ellipse(g, fx - 5, fy + 34, 10, 14); g.fill();   // 脸（暗处的微光）
    g.fillStyle = '#25262e'; g.beginPath(); g.moveTo(fx - 22, fy + 18); g.quadraticCurveTo(fx, fy - 4, fx + 20, fy + 14); g.lineTo(fx + 30, fy + 20); g.lineTo(fx - 24, fy + 22); g.closePath(); g.fill();   // 帽子
    if (q.light >= 2) { g.beginPath(); g.moveTo(fx - 36, fy + 92); g.quadraticCurveTo(fx - 30, fy + 60, fx - 2, fy + 56); strokeP(g, 'rgba(150,160,180,0.35)', 2); }
    g.restore();
    // 门框
    g.strokeStyle = '#6f6e6a'; g.lineWidth = 8; g.strokeRect(dx - 4, dy - 4, dw + 8, dh + 4);
    if (q.light >= 1) K.ao(g, dx, dy, dw, dh, 26, 0.5, 'tl');
    // 舷窗（反射天空）
    for (var pw = 0; pw < 2; pw++) {
      var pcx = 1718, pcy = 560 + pw * 120;
      K.ellipse(g, pcx, pcy, 22, 22); g.fillStyle = '#5c5b58'; g.fill();
      K.ellipse(g, pcx, pcy, 16, 16); g.fillStyle = K.lin(g, pcx - 16, pcy - 16, pcx + 16, pcy + 16, ['#9a9aac', '#4b4e60', '#22242f']); g.fill();
      if (q.light >= 2) { K.ellipse(g, pcx - 5, pcy - 6, 5, 3, -0.6); fillP(g, 'rgba(255,255,255,0.5)'); }
    }
    // 屋顶与檐
    rectP(g, x0 - 60, top - 22, x1 - x0 + 80, 26);
    g.fillStyle = K.lin(g, 0, top - 22, 0, top + 4, ['#d2d0c8', '#8c8a84']); g.fill();
    K.poly(g, [x0 - 60, top - 22, x0 - 100, top - 8, x0 - 100, top + 6, x0 - 60, top + 4]); fillP(g, '#77766f');
    if (q.light >= 1) { g.fillStyle = K.lin(g, 0, top + 4, 0, top + 40, ['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']); g.fillRect(x0 - 46, top + 4, x1 - x0 + 46, 36); }
    // 雷达桅与汽笛
    g.fillStyle = '#4a4846'; g.fillRect(1700, top - 130, 7, 110); g.fillRect(1664, top - 128, 80, 6);
    g.fillStyle = '#3c3a38'; g.fillRect(1560, top - 50, 6, 30); K.rr(g, 1548, top - 62, 30, 14, 5); g.fill();
    // 舷灯（暖色）
    g.fillStyle = '#2a2a2c'; g.fillRect(1592, top - 2, 28, 10);
    K.rr(g, 1594, top + 8, 24, 30, 6); g.fillStyle = '#ffd690'; g.fill();
    if (q.light >= 1) { K.glow(g, 1606, top + 24, 110, '#ffb35c', 0.35); K.pool(g, 1606, top + 60, 140, 50, '#ffb35c', 0.08); }
    // 救生圈挂在驾驶室侧面
    lifeRing(g, q, x0 - 24, 650, 34);
  }
  function lifeRing(g, q, x, y, R) {
    if (q.light >= 1) K.contact(g, x + 6, y + 8, R * 1.1, R * 1.1, 0.35);
    g.save();
    K.ellipse(g, x, y, R, R); g.arc(x, y, R * 0.56, 0, TAU, true);
    g.fillStyle = '#e6e1d6'; g.fill('evenodd');
    // 红色分段
    for (var i = 0; i < 4; i++) {
      var a0 = i * PI / 2 + PI / 8, a1 = a0 + PI / 4;
      g.beginPath(); g.arc(x, y, R, a0, a1); g.arc(x, y, R * 0.56, a1, a0, true); g.closePath(); g.fillStyle = '#c0442c'; g.fill();
    }
    K.ellipse(g, x, y, R, R); g.arc(x, y, R * 0.56, 0, TAU, true);
    g.fillStyle = K.rad(g, x - R * 0.3, y - R * 0.3, R * 0.2, R * 1.2, [[0, 'rgba(255,255,255,0.25)'], [0.6, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.45)']]); g.fill('evenodd');
    g.strokeStyle = '#4a4440'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, R * 0.78, 0, TAU); g.setLineDash ? g.setLineDash([10, 14]) : 0; g.stroke(); if (g.setLineDash) g.setLineDash([]);
    g.restore();
  }
  function drawFerryRail(g, q, r) {
    var top = 790, mid = 820, bwTop = 842, bot = 906;
    // 舷墙（钢板）
    rectP(g, 0, bwTop, W, bot - bwTop);
    mat(g, q, '#bdbab2', 'metal', { c1: '#a6a39b', c2: '#d4d1c8', dir: 'h', seed: 21 }, 256, 0, bwTop);
    rectP(g, 0, bwTop, W, bot - bwTop);
    shadeLin(g, 0, bwTop, 0, bot, [[0, 'rgba(255,255,250,0.2)'], [0.15, 'rgba(0,0,0,0)'], [1, 'rgba(20,22,30,0.45)']]);
    // 锈迹
    var rs = RNG(77);
    for (var i = 0; i < K.byModel(q, 6, 14, 26); i++) {
      var sx = rs() * W, sl = rs.range(14, 60);
      g.fillStyle = K.lin(g, 0, bwTop, 0, bwTop + sl, [[0, 'rgba(126,66,32,0.55)'], [1, 'rgba(126,66,32,0)']]);
      g.fillRect(sx, bwTop + 2, rs.range(2, 5), sl);
    }
    // 舷墙上缘的压条
    g.fillStyle = K.lin(g, 0, bwTop - 6, 0, bwTop + 6, ['#e2dfd6', '#8f8c86']); g.fillRect(0, bwTop - 6, W, 12);
    // 立柱
    var posts = [];
    for (var x = 70; x < W; x += 236) posts.push(x);
    for (i = 0; i < posts.length; i++) {
      var px = posts[i];
      rectP(g, px - 8, top - 6, 16, bwTop - top + 8);
      g.fillStyle = K.lin(g, px - 8, 0, px + 8, 0, ['#f0ede4', '#c9c6be', '#7d7a74']); g.fill();
    }
    // 扶手管（圆管：上亮下暗）
    function tube(y, r0) {
      rectP(g, 0, y - r0, W, r0 * 2);
      g.fillStyle = K.lin(g, 0, y - r0, 0, y + r0, ['#f6f3ea', '#d8d5cc', '#9a978f', '#6a6862']); g.fill();
      if (q.light >= 2) { g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(0, y - r0 * 0.6, W, 1.6); }
    }
    tube(top, 9); tube(mid, 5);
    // 救生圈
    lifeRing(g, q, 560, 846, 46);
    // 湿润：扶手上的水珠高光
    if (q.light >= 2) {
      g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,255,255,0.5)';
      for (i = 0; i < 60; i++) { K.ellipse(g, rs() * W, top + rs.range(4, 8), 1.6, 1.2); g.fill(); }
      g.restore();
    }
    void r;
  }
  function drawFerryDeck(g, q, r) {
    var y0 = 906, yh = 560;
    rectP(g, 0, y0, W, H - y0);
    g.fillStyle = '#4a4440'; g.fill();
    // 甲板木条：沿船身方向（横向），间距按透视增大
    var ys = [];
    for (var k = 0; k <= 9; k++) { var z = 1 - k * 0.046; ys.push(yh + 346 / z); }
    for (k = 0; k < ys.length - 1; k++) {
      var ya = ys[k], yb = Math.min(H + 2, ys[k + 1]);
      if (ya > H) break;
      rectP(g, 0, ya, W, yb - ya);
      mat(g, q, k % 2 ? '#5a5048' : '#544a43', 'wood', DECK_WOOD, 256, (k * 377) % 256, ya, null, 1, (yb - ya) / 64);
      rectP(g, 0, ya, W, yb - ya);
      shadeLin(g, 0, ya, 0, yb, [[0, 'rgba(255,240,225,0.06)'], [1, 'rgba(0,0,0,0.25)']]);
      g.fillStyle = 'rgba(16,12,10,0.85)'; g.fillRect(0, ya, W, 2.4);
    }
    // 舷墙投下的阴影
    if (q.light >= 1) { g.fillStyle = K.lin(g, 0, y0, 0, y0 + 60, ['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)']); g.fillRect(0, y0, W, 60); }
    // 湿甲板：天空反光 + 立柱倒影 + 舷灯倒影
    g.save(); g.globalCompositeOperation = 'screen';
    g.fillStyle = K.lin(g, 0, y0, 0, H, ['rgba(140,140,160,0.18)', 'rgba(140,140,160,0.04)']); g.fillRect(0, y0, W, H - y0);
    g.restore();
    if (q.light >= 1) {
      for (var x = 70; x < W; x += 236) { g.fillStyle = K.lin(g, 0, y0, 0, y0 + 110, ['rgba(230,228,220,0.12)', 'rgba(230,228,220,0)']); g.fillRect(x - 7, y0, 14, 110); }
    }
    if (q.light >= 2) {
      g.save(); g.globalCompositeOperation = 'lighter';
      g.fillStyle = K.lin(g, 0, y0, 0, H, ['rgba(255,180,100,0.0)', 'rgba(255,180,100,0.10)', 'rgba(255,180,100,0)']);
      g.beginPath(); g.moveTo(1560, y0); g.lineTo(1650, y0); g.lineTo(1700, H); g.lineTo(1520, H); g.closePath(); g.fill();
      // 积水的亮斑
      var rr = RNG(91);
      for (var p = 0; p < 9; p++) { var px = rr() * W, py = y0 + 30 + rr() * 140, pw = rr.range(60, 220); K.ellipse(g, px, py, pw, pw * 0.06); g.fillStyle = 'rgba(170,170,190,0.10)'; g.fill(); }
      g.restore();
    }
    // 盘起的缆绳
    ropeCoil(g, q, 1180, 1004, 120, 34);
    void r;
  }
  var DECK_WOOD = { c1: '#3e3530', c2: '#6c6058', gap: '#2a2420', planks: 1, dir: 'h', ring: 1.6, seed: 12 };
  // 盘起的缆绳（椭圆圈叠放）
  function ropeCoil(g, q, x, y, rx, ry) {
    if (q.light >= 1) K.contact(g, x + 8, y + ry * 0.5, rx * 1.15, ry * 0.8, 0.6);
    var n = K.byModel(q, 4, 6, 8);
    for (var i = n - 1; i >= 0; i--) {
      var k = 1 - i * 0.08, yy = y - i * ry * 0.18;
      K.ellipse(g, x, yy, rx * k, ry * k); g.strokeStyle = '#4a3c2a'; g.lineWidth = ry * 0.32; g.stroke();
      K.ellipse(g, x, yy - 1.5, rx * k, ry * k); g.strokeStyle = '#a08a62'; g.lineWidth = ry * 0.2; g.stroke();
      if (q.tex >= 1 && q.model >= 1) {
        g.save(); g.setLineDash && g.setLineDash([3, 5]);
        K.ellipse(g, x, yy - 1.5, rx * k, ry * k); g.strokeStyle = 'rgba(60,46,30,0.55)'; g.lineWidth = ry * 0.18; g.stroke();
        g.restore();
      }
    }
    K.ellipse(g, x, y - n * ry * 0.18, rx * 0.4, ry * 0.4); g.fillStyle = '#2a241c'; g.fill();
  }

  DM.HDBG.def('ferry', {
    outdoor: true,
    draw: function (g, q) { drawFerry(g, q); },
    lights: [{ x: 1606, y: 476, r: 120, color: '#ffbe70', i: 0.55, flicker: 0.04, kind: 'lamp' }],
    key: { x: -0.45, color: '#d8d8e4', amb: '#3a3c54', rim: 0.35 }
  });

  /* =================================================================
   * 码头 dock
   * ================================================================= */
  var DOCK_GAP = [500, 125];
  var QUAY_STONE = { c1: '#3a3944', c2: '#6c6a76', mortar: '#1d1c22', rows: 3, cols: 2, seed: 41, irregular: 1, mortarW: 0.03 };
  var STEP_STONE = { c1: '#4a4854', c2: '#7c7a86', mortar: '#26252c', rows: 2, cols: 2, seed: 43, mortarW: 0.025 };
  var BOARD_WOOD = { c1: '#2c2520', c2: '#5e5146', gap: '#16110e', planks: 5, dir: 'v', ring: 2, seed: 61 };
  var PIER_WOOD = { c1: '#3a3129', c2: '#6b5d50', gap: '#1a1410', planks: 1, dir: 'h', ring: 1.4, seed: 63 };
  function drawDock(g, q) {
    var yh = 560, r = RNG(201);
    sky(g, q, { y: 0, h: 600, seed: 23, gx: DOCK_GAP[0] / W, gy: DOCK_GAP[1] / 600, gw: 0.14 });
    // 左侧远海（港口外）
    seaField(g, q, { x: 0, w: 440, yh: 560, yb: 790, seed: 25, gx: 420, sw: 200, F: 70 });
    waves(g, q, { x0: 0, x1: 440, yh: 560, yb: 790, seed: 26, rows: K.byModel(q, 10, 16, 26), choppy: 1, gx: 420, sw: 200 });
    g.fillStyle = K.lin(g, 0, 556, 0, 566, ['rgba(200,200,215,0)', 'rgba(190,192,205,0.35)', 'rgba(200,200,215,0)']); g.fillRect(0, 556, 440, 10);
    godRays(g, q, DOCK_GAP[0], DOCK_GAP[1] + 50, 640, 7, 29, 0.035, 0.5, 140);
    crows(g, q, 47, 6, 1100, 60, 420, 140, 1.0, '#25232f');

    // 远山与宅邸、塔
    var hill = ridge(280, 1760, 12, function (t) { return 520 - Math.pow(Math.sin(t * PI), 0.8) * 200 + (t > 0.6 ? (t - 0.6) * 40 : 0); }, 10, 41, 0.025);
    g.beginPath(); g.moveTo(280, 620); for (var i = 0; i < hill.length; i += 2) g.lineTo(hill[i], hill[i + 1]); g.lineTo(1760, 620); g.closePath();
    g.fillStyle = K.lin(g, 0, 300, 0, 600, ['#4a4c61', '#5b5d72']); g.fill();
    forestBand(g, q, { x0: 300, x1: 1740, base: function (t) { return 540 - Math.pow(Math.sin(t * PI), 0.8) * 180; }, h: 30, color: '#43455a', seed: 7, step: 12 });
    mansionSil(g, q, 960, 340, 0.95, '#3b3d53', '#33354a', q.light >= 1 ? [-3, 2, 4] : null);
    towerSil(g, q, 1330, 360, 260, 34, '#393b51', '#6e7184');
    haze(g, 280, 220, 1480, 400, SKY.hor, 0.12, 0.55);

    drawDockStairs(g, q);
    drawDockWall(g, q);
    drawDockGate(g, q);
    drawDockQuay(g, q);
    drawDockWater(g, q);
    drawDockPier(g, q);
    drawBoathouseExt(g, q);
    drawBollard(g, q, 1408, 884);
    K.vignette(g, W, H, q.light >= 1 ? 0.5 : 0.35, 0.45);
    void yh; void r;
  }
  function drawDockWall(g, q) {
    var y0 = 470, y1 = 728, xa = 420, xb = 1500;
    rectP(g, xa, y0, xb - xa, y1 - y0);
    mat(g, q, '#4b4955', 'stone', QUAY_STONE, 192, 0, y0);
    rectP(g, xa, y0, xb - xa, y1 - y0);
    shadeLin(g, 0, y0, 0, y1, [[0, 'rgba(255,255,255,0.03)'], [1, 'rgba(8,8,14,0.45)']]);
    // 水渍流痕与青苔
    var r = RNG(303);
    for (var i = 0; i < K.byModel(q, 6, 14, 24); i++) {
      var sx = xa + r() * (xb - xa), sl = r.range(40, 180);
      g.fillStyle = K.lin(g, 0, y0, 0, y0 + sl, [[0, 'rgba(14,14,20,0.4)'], [1, 'rgba(14,14,20,0)']]); g.fillRect(sx, y0 + 10, r.range(8, 26), sl);
    }
    if (q.model >= 1) {
      g.save(); rectP(g, xa, y0, xb - xa, y1 - y0); g.clip();
      for (i = 0; i < K.byModel(q, 0, 16, 30); i++) K.blob(g, xa + r() * (xb - xa), y0 + r.range(0, 60), r.range(14, 40), '#4a5a3a', 0.35);
      for (i = 0; i < K.byModel(q, 0, 10, 18); i++) K.blob(g, xa + r() * (xb - xa), y1 - r.range(0, 30), r.range(16, 40), '#3a4630', 0.3);
      g.restore();
    }
    // 压顶石
    rectP(g, xa - 6, y0 - 14, xb - xa + 12, 18);
    mat(g, q, '#6a6874', 'stone', STEP_STONE, 256, 0, y0 - 14);
    rectP(g, xa - 6, y0 - 14, xb - xa + 12, 18); shadeLin(g, 0, y0 - 14, 0, y0 + 4, [[0, 'rgba(230,230,245,0.3)'], [1, 'rgba(0,0,0,0.35)']]);
    if (q.light >= 1) { g.fillStyle = K.lin(g, 0, y0 + 4, 0, y0 + 24, ['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']); g.fillRect(xa, y0 + 4, xb - xa, 20); }
    // 墙头杂草
    grassTufts(g, q, RNG(311), K.byModel(q, 10, 24, 40), xa, y0 - 16, xb - xa, 4, 'rgba(70,84,58,0.85)', 16);
  }
  function drawDockGate(g, q) {
    var gx0 = 844, gx1 = 1076, top = 392, bot = 726, cx = 960;
    // 门洞后的坡道与树林（雾中）
    g.save(); rectP(g, gx0, top - 60, gx1 - gx0, bot - top + 60); g.clip();
    g.fillStyle = K.lin(g, 0, top - 60, 0, bot, ['#6d6f84', '#5e6074', '#4a4b5c']); g.fillRect(gx0, top - 60, gx1 - gx0, bot - top + 60);
    var r = RNG(331);
    for (var i = 0; i < 9; i++) canopy(g, q, gx0 + r() * 60, top + 40 + r() * 160, 40, 50, '#3f4254', null, r, 5);
    for (i = 0; i < 9; i++) canopy(g, q, gx1 - r() * 60, top + 40 + r() * 160, 40, 50, '#3f4254', null, r, 5);
    K.poly(g, [cx - 14, 560, cx + 14, 560, cx + 120, bot, cx - 120, bot]); g.fillStyle = K.lin(g, 0, 560, 0, bot, ['#7a7b8c', '#5e5f6e']); g.fill();
    for (i = 0; i < 6; i++) { var t = i / 6, yy = 560 + (bot - 560) * t * t; g.fillStyle = 'rgba(40,40,52,0.35)'; g.fillRect(cx - 14 - 106 * t * t, yy, 28 + 212 * t * t, 1.5 + t * 2); }
    haze(g, gx0, top - 60, gx1 - gx0, bot - top + 60, '#8a8b9c', 0.35, 0.1);
    g.restore();
    // 门柱
    function pillar(x) {
      var w = 60;
      if (q.light >= 1) K.contact(g, x + w / 2 + 10, bot, w, 10, 0.6);
      rectP(g, x, 380, w, bot - 380);
      mat(g, q, '#5a5864', 'stone', STEP_STONE, 256, 0, 380);
      rectP(g, x, 380, w, bot - 380);
      shadeLin(g, x, 0, x + w, 0, [[0, 'rgba(235,235,250,0.18)'], [0.35, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.45)']]);
      // 柱头
      rectP(g, x - 8, 366, w + 16, 18); fillP(g, K.lin(g, 0, 366, 0, 384, ['#86848f', '#4a4854']));
      K.poly(g, [x - 4, 366, x + w / 2, 342, x + w + 4, 366]); fillP(g, K.lin(g, x, 0, x + w, 0, ['#7c7a86', '#3e3c48']));
      K.ellipse(g, x + w / 2, 332, 12, 12); fillP(g, K.rad(g, x + w / 2 - 4, 328, 1, 14, ['#9a98a4', '#3c3a44']));
      // 锈水痕
      g.fillStyle = K.lin(g, 0, 470, 0, 640, ['rgba(110,58,30,0.45)', 'rgba(110,58,30,0)']);
      g.fillRect(x === 784 ? x + w - 10 : x + 4, 470, 6, 170);
    }
    pillar(784); pillar(1076);
    // 铁门：上横梁为拱形
    var iron = '#211f25', hi = 'rgba(170,170,190,0.45)';
    function archY(x) { var t = (x - gx0) / (gx1 - gx0); return 470 - Math.sin(t * PI) * 48; }
    // 竖栅
    var bars = [], bx;
    for (bx = gx0 + 10; bx < gx1 - 4; bx += 17) bars.push(bx);
    g.lineCap = 'butt';
    for (i = 0; i < bars.length; i++) {
      bx = bars[i];
      var ty = archY(bx) - 20;
      K.line(g, bx, ty, bx, bot - 6, 5, iron);
      if (q.light >= 1) K.line(g, bx - 1.4, ty + 6, bx - 1.4, bot - 8, 1.2, hi);
      // 矛尖
      K.poly(g, [bx - 5, ty + 2, bx, ty - 14, bx + 5, ty + 2]); g.fillStyle = iron; g.fill();
    }
    g.lineCap = 'round';
    // 横梁
    g.beginPath(); for (bx = gx0; bx <= gx1; bx += 8) { if (bx === gx0) g.moveTo(bx, archY(bx)); else g.lineTo(bx, archY(bx)); }
    g.strokeStyle = iron; g.lineWidth = 9; g.stroke();
    g.beginPath(); for (bx = gx0; bx <= gx1; bx += 8) { if (bx === gx0) g.moveTo(bx, archY(bx) + 18); else g.lineTo(bx, archY(bx) + 18); }
    g.lineWidth = 5; g.stroke();
    K.line(g, gx0, 600, gx1, 600, 7, iron); K.line(g, gx0, bot - 12, gx1, bot - 12, 9, iron);
    K.line(g, cx, archY(cx) - 8, cx, bot - 8, 8, iron);       // 两扇门的中缝
    // 卷草装饰与乌鸦纹章
    if (q.model >= 1) {
      g.strokeStyle = iron; g.lineWidth = 3.5;
      for (var sd = -1; sd <= 1; sd += 2) {
        for (var k2 = 0; k2 < 3; k2++) {
          var sx0 = cx + sd * (30 + k2 * 34), sy0 = archY(sx0) + 30;
          g.beginPath(); g.arc(sx0, sy0 + 10, 10, 0, TAU); g.stroke();
          g.beginPath(); g.moveTo(sx0 + sd * 10, sy0 + 10); g.quadraticCurveTo(sx0 + sd * 22, sy0 + 40, sx0, sy0 + 60); g.stroke();
        }
      }
    }
    K.ellipse(g, cx, 520, 34, 34); g.fillStyle = iron; g.fill();
    K.ellipse(g, cx, 520, 27, 27); g.fillStyle = '#4a4a56'; g.fill();
    crowFly(g, cx, 522, 1.4, iron, false);
    if (q.light >= 1) { g.beginPath(); g.arc(cx, 520, 33, PI * 1.05, PI * 1.6); strokeP(g, hi, 1.6); }
    // 铁链与挂锁
    g.strokeStyle = '#2c2a2e'; g.lineWidth = 4;
    for (i = 0; i < 6; i++) { K.ellipse(g, cx - 30 + i * 12, 604 + Math.sin(i * 0.9) * 6, 7, 4, i % 2 ? 0.3 : -0.3); g.stroke(); }
    K.rr(g, cx + 30, 606, 22, 26, 4); g.fillStyle = '#5a4630'; g.fill();
    g.beginPath(); g.arc(cx + 41, 606, 8, PI, 0); g.strokeStyle = '#6a6a72'; g.lineWidth = 3; g.stroke();
    // 铁锈
    if (q.tex >= 1) {
      g.save(); g.globalCompositeOperation = 'source-atop';
      g.restore();
      var rr = RNG(345);
      for (i = 0; i < K.byModel(q, 6, 14, 24); i++) { var rx = gx0 + rr() * (gx1 - gx0), ry = 440 + rr() * 280; g.fillStyle = K.rgba('#7a4024', rr.range(0.3, 0.6)); g.fillRect(rx - 2.5, ry, 5, rr.range(6, 24)); }
    }
  }
  function drawDockStairs(g, q) {
    // 右侧岩坡
    var poly = [1440, 790, 1452, 560, 1470, 380, 1500, 300, 1560, 240, 1700, 205, 1830, 190, 1930, 196, 1930, 800];
    g.save(); K.poly(g, poly); g.clip();
    bumpField(g, q, 1430, 180, 500, 630, { seed: 51, fx: 0.012, fy: 0.006, dark: '#17161d', mid: '#3e3c48', lite: '#8a8796', L: [-0.6, -0.7, 0.55], amb: 0.3, k: 3, wet: function (u, v) { return sat((v - 0.6) * 2); } });
    if (q.tex > 0) { K.poly(g, poly); texFill(g, q, 'rock', ROCK, 256, 0, 0, 0.45, null, null, null, 'overlay'); }
    cracks(g, RNG(52), K.byModel(q, 8, 16, 26), 1440, 220, 480, 560, 120, 'rgba(10,10,16,0.6)', 2, q.light >= 1 ? 'rgba(170,170,190,0.18)' : null);
    // 坡顶植被
    var r = RNG(53);
    for (var i = 0; i < K.byModel(q, 6, 12, 18); i++) canopy(g, q, 1500 + r() * 440, 200 + r() * 40, r.range(30, 60), r.range(18, 30), '#2c3528', '#46523e', r, 6);
    g.restore();
    cliffPine(g, q, 1560, 246, 1.5, '#27302a', '#3e4a3c', r);
    // 台阶（自上而下绘制，近处覆盖远处）
    var N = K.byModel(q, 11, 13, 15), steps = [];
    for (i = N - 1; i >= 0; i--) {
      var t = i / (N - 1), xl = lerp(1508, 1640, t), xr = lerp(1782, 1856, t), yt = lerp(748, 318, t), rise = lerp(28, 15, t), tread = lerp(15, 8, t);
      steps.push([xl, xr, yt, yt + rise, tread, 9 * (1 - t) + 4, 3]);
    }
    // 台阶左侧的侧墙
    K.poly(g, [1492, 790, 1504, 776, 1636, 332, 1642, 318, 1660, 330, 1530, 790]);
    mat(g, q, '#3c3a45', 'stone', QUAY_STONE, 192, 0, 0);
    K.poly(g, [1492, 790, 1504, 776, 1636, 332, 1642, 318, 1660, 330, 1530, 790]); fillP(g, 'rgba(0,0,0,0.35)');
    drawSteps(g, q, steps, { top: '#5f5d68', front: '#45434e', tex: STEP_STONE, moss: '#4d5a3c', wet: true });
    if (q.light >= 1) K.ao(g, 1500, 300, 380, 500, 30, 0.3, 'r');
    // 铁扶手
    var post = [];
    for (i = 0; i < 5; i++) { var tt = i / 4; post.push(lerp(1520, 1648, tt), lerp(748, 318, tt)); }
    g.strokeStyle = '#2a2224'; g.lineWidth = 4;
    g.beginPath(); for (i = 0; i < post.length; i += 2) { g.moveTo(post[i], post[i + 1]); g.lineTo(post[i], post[i + 1] - 70); } g.stroke();
    g.beginPath(); g.moveTo(post[0], post[1] - 70); g.lineTo(post[8], post[9] - 70); g.lineWidth = 5; g.stroke();
    if (q.light >= 1) { g.beginPath(); g.moveTo(post[0] - 1, post[1] - 72); g.lineTo(post[8] - 1, post[9] - 72); strokeP(g, 'rgba(160,120,100,0.4)', 1.4); }
  }
  function drawDockQuay(g, q) {
    // 石砌码头地面（透视铺石）
    var y0 = 726, yh = 560;
    K.poly(g, [0, y0, W, y0, W, H, 0, H]);
    mat(g, q, '#4a4954', 'stone', QUAY_STONE, 256, 0, y0, null, 1, 0.5);
    K.poly(g, [0, y0, W, y0, W, H, 0, H]);
    shadeLin(g, 0, y0, 0, H, [[0, 'rgba(10,10,18,0.5)'], [0.4, 'rgba(10,10,18,0.15)'], [1, 'rgba(10,10,18,0.35)']]);
    // 透视接缝
    g.strokeStyle = 'rgba(16,15,20,0.7)'; g.lineWidth = 2;
    g.beginPath();
    for (var k = 1; k < 12; k++) { var z = 1 - k * 0.075, y = yh + (y0 - yh) / z; if (y > H) break; g.moveTo(0, y); g.lineTo(W, y); }
    for (var c = -12; c <= 12; c++) { var bx = 960 + c * 70; g.moveTo(960 + (bx - 960) * 1, y0); g.lineTo(960 + (bx - 960) * (H - yh) / (y0 - yh), H); }
    g.stroke();
    // 水洼（倒映天光）
    if (q.light >= 1) {
      var r = RNG(361);
      for (var i = 0; i < K.byModel(q, 2, 4, 6); i++) {
        var px = 1300 + r() * 560, py = 800 + r() * 240, pw = r.range(60, 160);
        K.ellipse(g, px, py, pw, pw * 0.14); g.fillStyle = K.lin(g, 0, py - 20, 0, py + 20, ['rgba(150,150,170,0.35)', 'rgba(90,90,110,0.25)']); g.fill();
        if (q.light >= 2) { K.ellipse(g, px - pw * 0.2, py - 2, pw * 0.4, 2); fillP(g, 'rgba(230,230,240,0.25)'); }
      }
    }
    // 码头边缘的石沿
    g.fillStyle = K.lin(g, 0, y0 - 2, 0, y0 + 8, ['#77757f', '#3c3b44']); g.fillRect(0, y0 - 2, W, 10);
  }
  function drawDockWater(g, q) {
    // 港池：左下
    var poly = [0, 772, 560, 772, 760, 760, 860, 742, 600, H, 0, H];
    g.save(); K.poly(g, poly); g.clip();
    seaField(g, q, { x: 0, w: 900, yh: 600, yb: H, seed: 71, gx: 380, sw: 160, F: 140, near: '#151c26', mid: '#2c3644', far: '#4c5466', choppy: 0.7 });
    waves(g, q, { x0: 0, x1: 900, yh: 600, yb: H, seed: 72, rows: K.byModel(q, 18, 30, 46), choppy: 0.08, gx: 380, sw: 160, crest: '#7d8294' });
    // 船屋倒影
    g.fillStyle = K.lin(g, 0, 772, 0, 980, ['rgba(8,8,12,0.65)', 'rgba(8,8,12,0)']); g.fillRect(30, 772, 460, 210);
    if (q.model >= 1) {
      var r = RNG(73);
      g.strokeStyle = 'rgba(150,150,170,0.18)'; g.lineWidth = 2; g.beginPath();
      for (var i = 0; i < 40; i++) { var wx = 30 + r() * 460, wy = 780 + r() * 200; g.moveTo(wx, wy); g.lineTo(wx + r.range(10, 40), wy); }
      g.stroke();
      // 灯的倒影
      g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,180,100,0.22)'; g.lineWidth = 3; g.beginPath();
      for (i = 0; i < 14; i++) { var ly = 790 + i * 13, lw = 6 + i * 2.5; g.moveTo(500 - lw + r.range(-4, 4), ly); g.lineTo(500 + lw + r.range(-4, 4), ly); }
      g.stroke(); g.restore();
    }
    g.restore();
    // 岸边的湿边
    g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, 768, 560, 6);
  }
  function drawDockPier(g, q) {
    var top = 742, yh = 560, xl0 = 850, xr0 = 1070, xlB = 600, xrB = 1320;
    function xl(y) { return xl0 + (xlB - xl0) * (y - top) / (H - top); }
    function xr(y) { return xr0 + (xrB - xr0) * (y - top) / (H - top); }
    // 桩（左侧，伸入水中）
    for (var k = 0; k < 6; k++) {
      var py = top + 30 + k * k * 9 + k * 30; if (py > H) break;
      var px = xl(py), pw = 8 + (py - top) * 0.06;
      rectP(g, px - pw, py, pw * 1.6, 40 + (py - top) * 0.25);
      fillP(g, K.lin(g, px - pw, 0, px + pw, 0, ['#2a2420', '#4a3e34', '#1a1512']));
      g.fillStyle = 'rgba(20,30,24,0.6)'; g.fillRect(px - pw, py + 20 + (py - top) * 0.15, pw * 1.6, 10);
    }
    // 侧梁
    K.poly(g, [xl0 - 4, top, xl0, top, xlB, H, xlB - 26, H]); fillP(g, '#251f1b');
    // 木板（横铺，透视间距）
    var ys = [], z = 1;
    for (k = 0; k < 40; k++) { var y = yh + (top - yh) / z; ys.push(y); if (y > H) break; z -= 0.032; }
    var rr = RNG(381);
    for (k = 0; k < ys.length - 1; k++) {
      var ya = ys[k], yb = Math.min(H + 1, ys[k + 1]);
      var gap = Math.max(1, (yb - ya) * 0.1);
      K.poly(g, [xl(ya), ya, xr(ya), ya, xr(yb - gap), yb - gap, xl(yb - gap), yb - gap]);
      mat(g, q, rr() < 0.5 ? '#574a3f' : '#4e4239', 'wood', PIER_WOOD, 256, rr() * 256, ya, null, 1, (yb - ya) / 48);
      K.poly(g, [xl(ya), ya, xr(ya), ya, xr(yb - gap), yb - gap, xl(yb - gap), yb - gap]);
      fillP(g, K.rgba(rr() < 0.3 ? '#000000' : '#ffffff', rr.range(0.02, 0.1)));
      if (q.model >= 1) {
        var nr = Math.max(1, (yb - ya) * 0.07);
        g.fillStyle = 'rgba(20,16,14,0.8)';
        K.ellipse(g, xl(ya) + (xr(ya) - xl(ya)) * 0.05, (ya + yb) / 2, nr, nr * 0.7); g.fill();
        K.ellipse(g, xr(ya) - (xr(ya) - xl(ya)) * 0.05, (ya + yb) / 2, nr, nr * 0.7); g.fill();
      }
    }
    // 远端变暗 + 湿木反光
    K.poly(g, [xl0, top, xr0, top, xrB, H, xlB, H]);
    fillP(g, K.lin(g, 0, top, 0, H, ['rgba(10,10,16,0.45)', 'rgba(10,10,16,0)', 'rgba(10,10,16,0.15)']));
    if (q.light >= 2) {
      K.poly(g, [xl0, top, xr0, top, xrB, H, xlB, H]);
      g.save(); g.globalCompositeOperation = 'screen';
      g.fillStyle = K.lin(g, xlB, 0, xrB, 0, ['rgba(150,150,175,0)', 'rgba(150,150,175,0.12)', 'rgba(150,150,175,0)']); g.fill();
      g.restore();
    }
    // 右缘与石码头的接缝阴影
    if (q.light >= 1) { K.poly(g, [xr0, top, xr0 + 10, top, xrB + 30, H, xrB, H]); fillP(g, 'rgba(0,0,0,0.4)'); }
  }
  function drawBoathouseExt(g, q) {
    var x0 = 40, x1 = 460, eave = 378, apex = [250, 186], base = 772;
    // 右侧墙（透视退向消失点）
    K.poly(g, [x1, eave, 548, 408, 548, 742, x1, base]);
    mat(g, q, '#3a3029', 'wood', BOARD_WOOD, 192, 0, 0);
    K.poly(g, [x1, eave, 548, 408, 548, 742, x1, base]); fillP(g, 'rgba(6,6,12,0.5)');
    // 右侧屋面（波纹铁皮，锈蚀）
    var rp = [apex[0], apex[1], x1 + 32, eave - 4, 578, 404, 330, 226];
    K.poly(g, rp); fillP(g, K.lin(g, 300, 200, 560, 400, ['#5a4236', '#3e2c24', '#2a201c']));
    if (q.model >= 1) {
      g.save(); K.poly(g, rp); g.clip();
      for (var k = 0; k <= 22; k++) {
        var t = k / 22, ax = lerp(apex[0], 330, t), ay = lerp(apex[1], 226, t), bx = lerp(x1 + 32, 578, t), by = lerp(eave - 4, 404, t);
        K.line(g, ax, ay, bx, by, 3, k % 2 ? 'rgba(255,220,200,0.08)' : 'rgba(0,0,0,0.3)');
      }
      var rr = RNG(391);
      for (k = 0; k < K.byModel(q, 0, 8, 16); k++) K.blob(g, lerp(300, 560, rr()), lerp(220, 400, rr()), rr.range(16, 40), '#8a4a26', 0.35);
      g.restore();
    }
    // 正面山墙
    var front = [x0, eave, apex[0], apex[1], x1, eave, x1, base, x0, base];
    K.poly(g, front);
    mat(g, q, '#4a3e35', 'wood', BOARD_WOOD, 192, x0, 0);
    K.poly(g, front);
    shadeLin(g, 0, apex[1], 0, base, [[0, 'rgba(0,0,0,0.35)'], [0.3, 'rgba(255,240,225,0.06)'], [1, 'rgba(0,0,0,0.4)']]);
    if (q.tex <= 0) {
      g.strokeStyle = 'rgba(20,16,12,0.6)'; g.lineWidth = 2; g.beginPath();
      for (var bx = x0 + 34; bx < x1; bx += 34) { g.moveTo(bx, eave - (bx < apex[0] ? (bx - x0) : (x1 - bx)) * 0.88); g.lineTo(bx, base); }
      g.stroke();
    }
    // 盐霜与水渍
    var r = RNG(393);
    if (q.model >= 1) {
      g.save(); K.poly(g, front); g.clip();
      for (k = 0; k < 14; k++) { var sx = x0 + r() * (x1 - x0), sl = r.range(60, 200); g.fillStyle = K.lin(g, 0, eave, 0, eave + sl, [[0, 'rgba(10,8,8,0.35)'], [1, 'rgba(10,8,8,0)']]); g.fillRect(sx, eave, r.range(6, 20), sl); }
      g.fillStyle = K.lin(g, 0, base - 90, 0, base, ['rgba(160,170,160,0)', 'rgba(160,170,160,0.12)']); g.fillRect(x0, base - 90, x1 - x0, 90);
      g.restore();
    }
    // 封檐板
    g.strokeStyle = '#2a221d'; g.lineWidth = 14; g.lineCap = 'butt';
    g.beginPath(); g.moveTo(x0 - 30, eave + 18); g.lineTo(apex[0], apex[1] - 8); g.lineTo(x1 + 32, eave + 14); g.stroke();
    g.strokeStyle = 'rgba(200,180,160,0.22)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x0 - 30, eave + 10); g.lineTo(apex[0], apex[1] - 15); g.lineTo(x1 + 32, eave + 6); g.stroke();
    g.lineCap = 'round';
    // 山墙通风百叶
    rectP(g, 220, 268, 60, 50); fillP(g, '#16120f');
    for (k = 0; k < 5; k++) { g.fillStyle = '#3e342c'; g.fillRect(220, 272 + k * 10, 60, 5); }
    // 双开门（X 形斜撑）
    var dy0 = 404, dy1 = 768;
    function leaf(lx, lw) {
      rectP(g, lx, dy0, lw, dy1 - dy0);
      mat(g, q, '#3d322a', 'wood', BOARD_WOOD, 192, lx, 0);
      rectP(g, lx, dy0, lw, dy1 - dy0); shadeLin(g, lx, 0, lx + lw, 0, [[0, 'rgba(255,240,220,0.05)'], [1, 'rgba(0,0,0,0.25)']]);
      g.strokeStyle = '#2a221c'; g.lineWidth = 16; g.lineCap = 'butt';
      g.strokeRect(lx + 8, dy0 + 8, lw - 16, dy1 - dy0 - 16);
      g.beginPath(); g.moveTo(lx + 12, dy0 + 12); g.lineTo(lx + lw - 12, dy1 - 12); g.moveTo(lx + lw - 12, dy0 + 12); g.lineTo(lx + 12, dy1 - 12); g.stroke();
      if (q.light >= 1) { g.strokeStyle = 'rgba(210,190,170,0.16)'; g.lineWidth = 2; g.beginPath(); g.moveTo(lx + 4, dy0 + 2); g.lineTo(lx + lw - 4, dy0 + 2); g.moveTo(lx + 14, dy0 + 8); g.lineTo(lx + lw - 10, dy1 - 18); g.stroke(); }
      g.lineCap = 'round';
      // 铁铰链
      g.fillStyle = '#25211f';
      g.fillRect(lx + (lx < 200 ? 0 : lw - 70), dy0 + 50, 70, 10); g.fillRect(lx + (lx < 200 ? 0 : lw - 70), dy1 - 70, 70, 10);
    }
    leaf(66, 182); leaf(252, 182);
    rectP(g, 248, dy0, 4, dy1 - dy0); fillP(g, '#0e0b09');
    // 门闩与挂锁
    g.fillStyle = '#2a2522'; g.fillRect(222, 584, 56, 12);
    K.rr(g, 240, 594, 20, 24, 3); g.fillStyle = '#5c4a32'; g.fill();
    if (q.light >= 1) { K.ao(g, 66, dy0, 368, dy1 - dy0, 24, 0.4, 't'); }
    // 门槛与地基
    rectP(g, x0 - 6, base - 6, x1 - x0 + 12, 14); fillP(g, '#2a2420');
    // 墙上挂着的救生圈
    lifeRing(g, q, 404, 300 + 40, 26);
    // 壁灯（暖色）
    g.strokeStyle = '#1f1c1c'; g.lineWidth = 4; g.beginPath(); g.moveTo(x1 - 6, 420); g.lineTo(x1 + 40, 420); g.lineTo(x1 + 40, 438); g.stroke();
    K.poly(g, [x1 + 28, 440, x1 + 52, 440, x1 + 56, 448, x1 + 24, 448]); fillP(g, '#1f1c1c');
    K.rr(g, x1 + 29, 448, 22, 30, 4); g.fillStyle = '#ffd38c'; g.fill();
    g.fillStyle = '#1f1c1c'; g.fillRect(x1 + 27, 476, 26, 5);
    if (q.light >= 1) { K.glow(g, x1 + 40, 462, 130, '#ffb35c', 0.32); K.glow(g, x1 + 40, 462, 30, '#fff0c8', 0.5); }
  }
  function drawBollard(g, q, x, y) {
    if (q.light >= 1) K.contact(g, x + 10, y, 56, 12, 0.65);
    // 缆绳：从系缆桩绕出，垂到栈桥边
    g.strokeStyle = '#4a3c2a'; g.lineWidth = 9;
    g.beginPath(); g.moveTo(x - 20, y - 48); g.bezierCurveTo(x - 90, y - 30, x - 130, y + 10, x - 190, y + 50); g.stroke();
    g.strokeStyle = '#9a8460'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(x - 20, y - 50); g.bezierCurveTo(x - 90, y - 32, x - 130, y + 8, x - 190, y + 48); g.stroke();
    // 桩身
    K.path(g, 'M-26 0 L-22 -52 Q-24 -60 -36 -64 L-36 -76 Q0 -86 36 -76 L36 -64 Q24 -60 22 -52 L26 0 Z', x, y);
    fillP(g, K.lin(g, x - 36, 0, x + 36, 0, ['#4a4448', '#2a2629', '#17151a']));
    K.ellipse(g, x, y - 77, 36, 8); fillP(g, K.lin(g, 0, y - 85, 0, y - 69, ['#6a6468', '#2e2a2e']));
    if (q.light >= 1) { K.path(g, 'M-20 -4 L-17 -52', x, y); strokeP(g, 'rgba(200,190,200,0.3)', 2); }
    // 锈
    g.fillStyle = 'rgba(120,62,30,0.55)'; g.fillRect(x - 10, y - 50, 6, 30); g.fillRect(x + 8, y - 40, 5, 34);
    // 绕桩的绳圈
    K.ellipse(g, x, y - 52, 26, 7); g.strokeStyle = '#9a8460'; g.lineWidth = 6; g.stroke();
    K.ellipse(g, x, y - 42, 25, 7); g.stroke();
  }
  DM.HDBG.def('dock', {
    outdoor: true,
    draw: function (g, q) { drawDock(g, q); },
    lights: [{ x: 500, y: 462, r: 130, color: '#ffbe70', i: 0.55, flicker: 0.05, kind: 'lamp' }],
    key: { x: -0.5, color: '#d6d6e2', amb: '#383a50', rim: 0.35 }
  });


  /* =================================================================
   * 北侧海滩 beach（+ tracks：去而不返的一行皮鞋印与手杖孔）
   * ================================================================= */
  var BEACH_GAP = [690, 150];
  var SAND_T = { c1: '#000000', c2: '#ffffff', seed: 41 };
  function drawBeach(g, q, v) {
    sky(g, q, { y: 0, h: 700, seed: 37, gx: BEACH_GAP[0] / W, gy: BEACH_GAP[1] / 700, gw: 0.13 });
    godRays(g, q, BEACH_GAP[0], BEACH_GAP[1] + 60, 690, 8, 41, 0.04, 0.6, 150);
    crows(g, q, 53, 7, 300, 70, 640, 170, 1.0, '#25232f');
    // 远处海岬（空气透视）
    var hd = ridge(260, 1200, 14, function (t) { return 392 - Math.sin(t * PI) * 60 - t * 20; }, 8, 61, 0.02);
    g.beginPath(); g.moveTo(260, 470); for (var i = 0; i < hd.length; i += 2) g.lineTo(hd[i], hd[i + 1]); g.lineTo(1200, 470); g.closePath();
    fillP(g, mixc('#565a6e', SKY.hor, 0.45));
    forestBand(g, q, { x0: 280, x1: 1190, base: function (t) { return 396 - Math.sin(t * PI) * 56 - t * 18; }, h: 16, color: mixc('#4e5266', SKY.hor, 0.4), seed: 62, step: 10 });
    drawBeachTower(g, q);
    drawBeachLowCliff(g, q);
    drawBeachCliff(g, q);
    drawBeachSand(g, q);
    if (v === 'tracks') drawFootprints(g, q);
    drawBeachRocks(g, q);
    drawBeachSea(g, q);
    K.vignette(g, W, H, q.light >= 1 ? 0.5 : 0.35, 0.45);
  }
  // 塔顶（悬崖上方露出的部分）
  function drawBeachTower(g, q) {
    var cx = 1632, w = 196, x0 = cx - w / 2, yb = 196, yBal = 58;
    // 缆索：从远方（神社）斜拉到瞭望台铁环
    K.line(g, 900, -6, 1524, yBal - 8, 2, 'rgba(18,16,22,0.85)');
    // 塔身
    rectP(g, x0, yBal, w, yb - yBal);
    mat(g, q, '#3a3844', 'stone', STONE_WALL, 128, x0, yBal);
    rectP(g, x0, yBal, w, yb - yBal);
    shadeLin(g, x0, 0, x0 + w, 0, [[0, 'rgba(225,225,240,0.22)'], [0.45, 'rgba(0,0,0,0.05)'], [1, 'rgba(0,0,0,0.5)']]);
    // 钟面（北面也有一面钟）
    K.ellipse(g, cx, 124, 46, 46); fillP(g, '#4a4436');
    K.ellipse(g, cx, 124, 38, 38); fillP(g, K.rad(g, cx - 8, 116, 2, 40, ['#d0c8b4', '#8e8672']));
    g.strokeStyle = '#2a2420'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(cx, 124); g.lineTo(cx + 2, 96); g.moveTo(cx, 124); g.lineTo(cx + 22, 132); g.stroke();
    for (var k = 0; k < 12; k++) { var a = k * PI / 6; g.fillStyle = '#3a3228'; g.fillRect(cx + Math.cos(a) * 32 - 2, 124 + Math.sin(a) * 32 - 2, 4, 4); }
    if (q.light >= 1) { K.ellipse(g, cx, 124, 38, 38); fillP(g, K.lin(g, cx - 38, 86, cx + 38, 162, ['rgba(255,255,255,0.12)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.3)'])); }
    // 瞭望台
    rectP(g, x0 - 24, yBal - 12, w + 48, 16); fillP(g, K.lin(g, 0, yBal - 12, 0, yBal + 4, ['#77747f', '#34323c']));
    if (q.light >= 1) { g.fillStyle = K.lin(g, 0, yBal + 4, 0, yBal + 30, ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)']); g.fillRect(x0, yBal + 4, w, 26); }
    g.strokeStyle = '#1e1c22'; g.lineWidth = 3; g.beginPath();
    for (var px = x0 - 20; px <= x0 + w + 20; px += 12) { g.moveTo(px, yBal - 12); g.lineTo(px, yBal - 40); }
    g.moveTo(x0 - 22, yBal - 40); g.lineTo(x0 + w + 22, yBal - 40); g.moveTo(x0 - 22, yBal - 26); g.lineTo(x0 + w + 22, yBal - 26); g.stroke();
    // 铁环
    g.strokeStyle = '#2a2628'; g.lineWidth = 4; K.ellipse(g, 1524, yBal - 6, 8, 8); g.stroke();
    // 屋顶（被画面上缘裁掉）
    K.poly(g, [x0 - 14, yBal - 40, cx, -150, x0 + w + 14, yBal - 40]);
    fillP(g, K.lin(g, x0, 0, x0 + w, 0, ['#4a4858', '#2a2934', '#1c1b24']));
    if (q.model >= 1) { g.save(); K.poly(g, [x0 - 14, yBal - 40, cx, -150, x0 + w + 14, yBal - 40]); g.clip(); g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 1.2; g.beginPath(); for (var ry = yBal - 46; ry > -10; ry -= 9) { g.moveTo(x0 - 20, ry); g.lineTo(x0 + w + 20, ry); } g.stroke(); g.restore(); }
    if (q.light >= 2) { K.poly(g, [x0 - 14, yBal - 40, cx, -150, cx - 4, yBal - 40]); fillP(g, 'rgba(200,200,225,0.08)'); }
  }
  function lowCliffTop(x) { return 404 + Math.sin(x * 0.006) * 14 + (fbm(x * 0.012, 2.2, 4, 71) - 0.5) * 60 + x * 0.012; }
  function drawBeachLowCliff(g, q) {
    var pts = [-10, 700];
    for (var x = -10; x <= 1210; x += 12) pts.push(x, lowCliffTop(x));
    pts.push(1210, 700);
    g.save(); K.poly(g, pts); g.clip();
    rockCells(g, q, -10, 360, 1220, 345, { seed: 73, cw: 120, ch: 80, dark: '#1a1920', mid: '#46444f', lite: '#9c99a8', L: [-0.6, -0.6, 0.6], amb: 0.32, crack: 0.07, tilt: 0.3,
      wet: function (u, vv) { return sat((vv - 0.72) * 2.5); }, moss: function (u, vv) { return sat(0.35 - vv) * 1.6; } });
    if (q.tex > 0) { K.poly(g, pts); texFill(g, q, 'rock', ROCK, 256, 0, 0, 0.35, null, null, null, 'overlay'); }
    haze(g, -10, 360, 1220, 345, SKY.hor, 0.16, 0.02);
    // 崖底的潮湿带与海藻线
    g.fillStyle = K.lin(g, 0, 640, 0, 700, ['rgba(10,12,16,0)', 'rgba(10,12,16,0.45)']); g.fillRect(-10, 640, 1220, 60);
    g.restore();
    // 崖顶植被
    var r = RNG(75);
    for (var i = 0; i < K.byModel(q, 14, 26, 44); i++) { var tx = r() * 1200; canopy(g, q, tx, lowCliffTop(tx) - 4, r.range(24, 50), r.range(10, 18), '#2e3530', '#47524a', r, 5); }
    grassTufts(g, q, RNG(76), K.byModel(q, 20, 50, 90), 0, 400, 1200, 18, 'rgba(66,80,60,0.9)', 18);
    // 石阶（沿崖壁斜下）
    drawBeachStairs(g, q);
  }
  function drawBeachStairs(g, q) {
    var N = K.byModel(q, 9, 11, 13), x0 = -20, y0 = 398, x1 = 236, y1 = 712, dx = (x1 - x0) / N, dy = (y1 - y0) / N, depth = 70;
    // 台阶外侧面（石砌）
    var face = [x0, y0];
    for (var i = 0; i < N; i++) { face.push(x0 + dx * (i + 1), y0 + dy * i, x0 + dx * (i + 1), y0 + dy * (i + 1)); }
    face.push(x1, y1 + 10, x0, y0 + depth + 40);
    K.poly(g, face);
    mat(g, q, '#4e4c57', 'stone', STEP_STONE, 160, 0, 0);
    K.poly(g, face); fillP(g, K.lin(g, x0, y0, x1, y1, ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.45)']));
    // 每级踏面前缘的高光与立面的阴影
    for (i = 0; i < N; i++) {
      var tx = x0 + dx * i, ty = y0 + dy * i;
      rectP(g, tx, ty, dx, 5); fillP(g, 'rgba(190,188,205,0.35)');
      rectP(g, tx + dx - 4, ty, 4, dy); fillP(g, 'rgba(0,0,0,0.35)');
      if (q.model >= 1) { K.ellipse(g, tx + dx * 0.5, ty + 2, dx * 0.3, 2); fillP(g, 'rgba(80,96,62,0.5)'); }
    }
    if (q.light >= 1) K.contact(g, x1 - 10, y1 + 12, 70, 12, 0.5);
    // 锈蚀铁扶手
    g.strokeStyle = '#2a2224'; g.lineWidth = 4; g.beginPath();
    for (i = 1; i < N; i += 3) { var px = x0 + dx * i + dx * 0.5, py = y0 + dy * i; g.moveTo(px, py); g.lineTo(px, py - 64); }
    g.stroke();
    g.beginPath(); g.moveTo(x0 + dx * 0.5, y0 - 64); g.lineTo(x0 + dx * (N - 0.5), y0 + dy * (N - 1) - 64); g.lineWidth = 4.5; g.stroke();
    if (q.light >= 1) { g.beginPath(); g.moveTo(x0 + dx * 0.5, y0 - 66); g.lineTo(x0 + dx * (N - 0.5), y0 + dy * (N - 1) - 66); strokeP(g, 'rgba(160,110,90,0.4)', 1.3); }
  }
  function beachCliffPts() {
    var pts = [1150, 704], r = RNG(85), i;
    // 左侧崖缘：自下而上（有凹凸与悬垂）
    var left = [[1150, 700], [1162, 640], [1150, 600], [1172, 560], [1168, 500], [1184, 470], [1176, 420], [1192, 380], [1182, 330], [1200, 290], [1194, 250], [1216, 214], [1240, 196]];
    for (i = 1; i < left.length; i++) pts.push(left[i][0], left[i][1]);
    // 崖顶（塔所在处稍高）
    for (var x = 1260; x <= 1930; x += 18) pts.push(x, 186 - (x - 1260) * 0.04 + (fbm(x * 0.02, 7.3, 3, 86) - 0.5) * 26 + (x > 1530 && x < 1740 ? -6 : 0));
    pts.push(1930, 704);
    void r;
    return pts;
  }
  function drawBeachCliff(g, q) {
    var pts = beachCliffPts(), i;
    g.save(); K.poly(g, pts); g.clip();
    rockCells(g, q, 1140, 140, 790, 570, { seed: 81, cw: 70, ch: 190, dark: '#111116', mid: '#383643', lite: '#a19eae', L: [-0.75, -0.45, 0.5], amb: 0.26, crack: 0.06, tilt: 0.1,
      wet: function (u, vv) { return sat((vv - 0.74) * 3.2); }, moss: function (u, vv) { return sat(0.2 - vv) * 2 + sat((vv - 0.8) * 2) * 0.4; } });
    if (q.tex > 0) { K.poly(g, pts); texFill(g, q, 'rock', ROCK, 256, 0, 0, 0.4, null, null, null, 'overlay'); }
    var r = RNG(82);
    // 雨水流痕
    for (i = 0; i < K.byModel(q, 5, 10, 16); i++) { var sx = 1200 + r() * 700, sl = r.range(120, 400); g.fillStyle = K.lin(g, 0, 190, 0, 190 + sl, [[0, 'rgba(10,10,16,0.35)'], [1, 'rgba(10,10,16,0)']]); g.fillRect(sx, 190, r.range(8, 22), sl); }
    // 岩架上的草
    if (q.model >= 1) for (i = 0; i < K.byModel(q, 0, 6, 10); i++) grassTufts(g, q, r, 5, 1220 + r() * 680, 260 + r() * 300, r.range(30, 90), 3, 'rgba(70,86,62,0.8)', 12);
    // 崖底飞沫潮湿带 + 空气透视（塔附近更远）
    g.fillStyle = K.lin(g, 0, 600, 0, 704, ['rgba(12,14,20,0)', 'rgba(12,14,20,0.5)']); g.fillRect(1140, 600, 790, 104);
    haze(g, 1140, 140, 790, 300, SKY.hor, 0.14, 0);
    g.restore();
    // 左侧受光的崖缘
    if (q.light >= 2) {
      g.beginPath(); g.moveTo(pts[0], pts[1]); for (i = 2; i < 26; i += 2) g.lineTo(pts[i], pts[i + 1]);
      strokeP(g, 'rgba(200,200,222,0.3)', 2.5);
    }
    // 崖顶草与松
    var tr = RNG(83);
    for (i = 0; i < K.byModel(q, 10, 20, 32); i++) { var tx = 1210 + tr() * 720; if (tx > 1540 && tx < 1720) continue; canopy(g, q, tx, 182 - (tx - 1200) * 0.04, tr.range(20, 46), tr.range(9, 16), '#2a312c', '#434e46', tr, 5); }
    cliffPine(g, q, 1252, 200, 1.3, '#26302a', '#3d4a3e', tr);
    cliffPine(g, q, 1860, 160, 1.1, '#26302a', '#3d4a3e', tr);
    grassTufts(g, q, RNG(84), K.byModel(q, 16, 36, 60), 1220, 164, 700, 18, 'rgba(66,80,60,0.9)', 20);
  }
  function drawBeachSand(g, q) {
    var y0 = 676, y1 = 900;
    var dry = C('#8a806c'), dry2 = C('#a29780'), wet = C('#46433f'), wet2 = C('#5a5650'), skyc = C('#8e90a2');
    var r = fres(q, 0.22);
    field(g, 0, y0, W, y1 - y0, W * r, (y1 - y0) * r * 1.4, function (u, vv, out) {
      var x = u * W, y = y0 + vv * (y1 - y0);
      var n = fbm(x * 0.01, y * 0.03, 3, 91), rip = fbm(x * 0.004, y * 0.09, 2, 92);
      var wl = 0.62 + (fbm(x * 0.003, 1.5, 2, 93) - 0.5) * 0.2;
      var w = sstep(wl - 0.25, wl + 0.08, vv + (n - 0.5) * 0.12);
      var dR = dry[0] + (dry2[0] - dry[0]) * n, dG = dry[1] + (dry2[1] - dry[1]) * n, dB = dry[2] + (dry2[2] - dry[2]) * n;
      var ripple = (rip - 0.5) * 30 * (1 - w);
      dR += ripple; dG += ripple; dB += ripple * 0.9;
      var wR = wet[0] + (wet2[0] - wet[0]) * n, wG = wet[1] + (wet2[1] - wet[1]) * n, wB = wet[2] + (wet2[2] - wet[2]) * n;
      // 湿沙倒映天空（右侧倒映悬崖，暗）
      var refl = sstep(0.3, 0.8, fbm(x * 0.002, y * 0.05, 2, 94)) * 0.55 * (x > 1160 ? 0.3 : 1);
      wR += (skyc[0] - wR) * refl; wG += (skyc[1] - wG) * refl; wB += (skyc[2] - wB) * refl;
      var R = dR + (wR - dR) * w, G = dG + (wG - dG) * w, B = dB + (wB - dB) * w;
      // 靠崖处阴影
      var sh = sstep(0.12, 0, vv) * 0.35;
      out[0] = R * (1 - sh); out[1] = G * (1 - sh); out[2] = B * (1 - sh);
    });
    if (q.tex > 0) { rectP(g, 0, y0, W, y1 - y0); texFill(g, q, 'sand', SAND_T, 128, 0, 0, 0.16, null, null, null, 'overlay'); }
    // 风纹
    var rr = RNG(95);
    if (q.model >= 1) {
      g.strokeStyle = 'rgba(60,54,44,0.25)'; g.lineWidth = 1.5; g.beginPath();
      for (var i = 0; i < K.byModel(q, 0, 40, 80); i++) {
        var x = rr() * W, y = y0 + 14 + rr() * 90, l = rr.range(40, 140);
        g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - rr.range(2, 6), x + l, y + rr.range(-2, 2));
      }
      g.stroke();
    }
    // 涨潮线上的海藻与漂流物
    g.strokeStyle = 'rgba(40,40,30,0.7)'; g.lineWidth = 2.2; g.beginPath();
    for (i = 0; i < K.byModel(q, 14, 30, 50); i++) {
      var sx = rr() * W, sy = 772 + Math.sin(sx * 0.004) * 10 + rr.range(-6, 6);
      g.moveTo(sx, sy); g.bezierCurveTo(sx + 8, sy - 4, sx + 14, sy + 4, sx + rr.range(18, 40), sy + rr.range(-3, 3));
    }
    g.stroke();
    for (i = 0; i < K.byModel(q, 20, 50, 90); i++) {
      var px = rr() * W, py = y0 + 20 + rr() * 190, pr = rr.range(1.5, 4.5) * (0.6 + (py - y0) / 300);
      K.ellipse(g, px, py, pr * 1.3, pr * 0.8); g.fillStyle = rr() < 0.6 ? '#3e3a36' : '#bdb5a2'; g.fill();
    }
    // 漂流木
    driftwood(g, q, 1460, 790, 210, 14, 0.06);
    driftwood(g, q, 520, 712, 110, 8, -0.05);
  }
  function driftwood(g, q, x, y, len, th, rot) {
    if (q.light >= 1) K.contact(g, x + 6, y + th * 0.8, len * 0.55, th * 0.7, 0.5);
    g.save(); g.translate(x, y); g.rotate(rot);
    K.path(g, 'M-1 0 C-0.9 -1 -0.5 -0.9 0 -0.95 C0.5 -1 0.9 -0.8 1 -0.2 C1.02 0.4 0.6 0.9 0 0.85 C-0.5 0.9 -0.95 0.8 -1 0 Z', 0, 0, len / 2, th);
    fillP(g, K.lin(g, 0, -th, 0, th, ['#a39a8a', '#6e665a', '#3c362f']));
    g.strokeStyle = 'rgba(50,44,38,0.5)'; g.lineWidth = 1.2; g.beginPath();
    for (var i = -2; i <= 2; i++) { g.moveTo(-len * 0.45, i * th * 0.25); g.quadraticCurveTo(0, i * th * 0.3 + 2, len * 0.45, i * th * 0.22); }
    g.stroke();
    // 断枝
    g.strokeStyle = '#6a6256'; g.lineWidth = th * 0.5; g.beginPath(); g.moveTo(len * 0.2, -th * 0.6); g.lineTo(len * 0.3, -th * 2.4); g.stroke();
    g.restore();
  }
  // 一行皮鞋印（只有去、没有回）+ 手杖孔
  function drawFootprints(g, q) {
    var P0 = [270, 724], P1 = [640, 730], P2 = [1196, 852], n = 15;
    function bz(t) { var a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t; return [a * P0[0] + b * P1[0] + c * P2[0], a * P0[1] + b * P1[1] + c * P2[1]]; }
    for (var i = 0; i < n; i++) {
      var t = (i + 0.5) / n, p = bz(t), p2 = bz(Math.min(1, t + 0.01));
      var dx = p2[0] - p[0], dy = (p2[1] - p[1]) / 0.42, dl = Math.sqrt(dx * dx + dy * dy); dx /= dl; dy /= dl;
      var sc = 1.05 + (p[1] - 700) / 160 * 0.6, side = i % 2 ? 1 : -1;
      // 地面坐标中左右脚的偏移（垂直于行进方向）
      var ox = -dy * side * 11 * sc, oy = dx * side * 11 * sc * 0.42;
      var fx = p[0] + ox, fy = p[1] + oy, wetp = p[1] > 828;
      shoePrint(g, q, fx, fy, Math.atan2(dy, dx), sc, wetp);
      // 手杖孔：右手持杖，每走两步点一次地，落在右脚前外侧
      if (side === 1) {
        var cx = fx + dx * 20 * sc - dy * 14 * sc, cy = fy + (dy * 20 * sc + dx * 14 * sc) * 0.42;
        K.ellipse(g, cx, cy, 3.6 * sc, 2.2 * sc); fillP(g, wetp ? 'rgba(30,34,44,0.75)' : 'rgba(38,32,24,0.75)');
        if (q.light >= 1) { K.ellipse(g, cx + 1, cy + 1.6 * sc, 3.4 * sc, 1.2 * sc); fillP(g, 'rgba(225,215,190,0.25)'); }
      }
    }
  }
  function shoePrint(g, q, x, y, ang, sc, wet) {
    g.save(); g.translate(x, y); g.scale(sc, sc * 0.42); g.rotate(ang);
    // 鞋底前掌 + 鞋跟（男式皮鞋：前圆后方）
    function shape() {
      g.beginPath();
      g.moveTo(-4, -6); g.bezierCurveTo(4, -9, 16, -8, 17, 0); g.bezierCurveTo(16, 8, 4, 9, -4, 6); g.closePath();
      g.moveTo(-8, -5); g.lineTo(-17, -4.6); g.quadraticCurveTo(-19, 0, -17, 4.6); g.lineTo(-8, 5); g.closePath();
    }
    // 被推开隆起的沙（受光边）
    if (q.light >= 1) { g.save(); g.translate(0.8, 2.2); shape(); g.fillStyle = 'rgba(230,220,196,0.28)'; g.fill(); g.restore(); }
    shape();
    if (wet) g.fillStyle = K.lin(g, -18, -9, 18, 9, ['rgba(120,126,146,0.85)', 'rgba(70,76,94,0.85)']);
    else g.fillStyle = 'rgba(58,48,36,0.78)';
    g.fill();
    // 坑内的阴影（左上内壁背光）
    g.save(); shape(); g.clip();
    g.translate(-1.5, -3); shape(); g.fillStyle = wet ? 'rgba(200,205,220,0.0)' : 'rgba(40,32,22,0.5)'; g.fill();
    g.restore();
    if (wet && q.light >= 2) { g.beginPath(); g.moveTo(-2, -4); g.lineTo(10, -3); strokeP(g, 'rgba(240,242,250,0.6)', 1.6); }
    if (q.model >= 2 && !wet) { g.strokeStyle = 'rgba(30,24,16,0.25)'; g.lineWidth = 0.8; g.beginPath(); for (var k = -2; k <= 12; k += 3.5) { g.moveTo(k, -5); g.lineTo(k, 5); } g.stroke(); }
    g.restore();
  }
  function drawBeachRocks(g, q) {
    boulder(g, q, 196, 872, 190, 120, { seed: 7, color: '#34343e', moss: '#4a5638' });
    boulder(g, q, 96, 884, 110, 64, { seed: 8, color: '#2e2e38' });
    boulder(g, q, 290, 886, 96, 46, { seed: 9, color: '#383842' });
    boulder(g, q, 1700, 714, 120, 50, { seed: 10, color: '#2e2e38' });
    boulder(g, q, 1780, 720, 70, 30, { seed: 11, color: '#33333d' });
    // 礁石上的海藻
    var r = RNG(97);
    g.strokeStyle = 'rgba(46,52,30,0.85)'; g.lineWidth = 3; g.beginPath();
    for (var i = 0; i < 12; i++) { var x = 110 + r() * 200, y = 860 + r() * 24; g.moveTo(x, y); g.quadraticCurveTo(x + 4, y + 10, x + r.range(-6, 6), y + r.range(14, 26)); }
    g.stroke();
  }
  function drawBeachSea(g, q) {
    var yw = 862;
    function lace(x) { return yw + Math.sin(x * 0.005 + 1) * 8 + (fbm(x * 0.012, 4.1, 3, 99) - 0.5) * 22; }
    // 冲上沙滩的薄水膜
    g.beginPath(); g.moveTo(0, lace(0));
    for (var x = 0; x <= W; x += 10) g.lineTo(x, lace(x));
    g.lineTo(W, H); g.lineTo(0, H); g.closePath();
    g.fillStyle = K.lin(g, 0, yw - 20, 0, 930, ['rgba(150,156,172,0.45)', 'rgba(92,100,116,0.55)', 'rgba(40,48,60,0.8)']); g.fill();
    // 海面
    g.save(); rectP(g, 0, 900, W, H - 900); g.clip();
    seaField(g, q, { x: 0, w: W, yh: 760, yb: H, seed: 101, gx: 700, sw: 300, F: 260, near: '#18212c', mid: '#2e3a48', far: '#4e5768' });
    waves(g, q, { yh: 760, yb: H, seed: 102, rows: K.byModel(q, 20, 34, 56), choppy: 1.3, gx: 700, sw: 300 });
    g.restore();
    // 碎浪带
    var r = RNG(103);
    g.save();
    var by = 912;
    g.fillStyle = K.lin(g, 0, by - 16, 0, by + 26, ['rgba(220,224,232,0)', 'rgba(220,224,232,0.55)', 'rgba(200,206,216,0.15)']);
    g.beginPath(); g.moveTo(0, by);
    for (x = 0; x <= W; x += 16) g.lineTo(x, by - 6 + Math.sin(x * 0.011) * 5 + r.range(-3, 3));
    g.lineTo(W, by + 26); g.lineTo(0, by + 26); g.closePath(); g.fill();
    g.beginPath();
    for (var i = 0; i < K.byModel(q, 60, 140, 260); i++) { var fx = r() * W, fy = by + r.range(-8, 22), fr = r.range(3, 12); K.ellipse(g, fx, fy, fr * 2, fr * 0.6); }
    g.fillStyle = 'rgba(230,234,240,0.35)'; g.fill();
    if (q.light >= 2) { g.globalCompositeOperation = 'lighter'; g.fillStyle = K.lin(g, 0, by - 40, 0, by + 10, ['rgba(220,225,235,0)', 'rgba(220,225,235,0.1)']); g.fillRect(0, by - 40, W, 50); }
    g.restore();
    // 蕾丝状浪沫边缘
    g.beginPath(); g.moveTo(0, lace(0));
    for (x = 0; x <= W; x += 6) g.lineTo(x, lace(x) + Math.sin(x * 0.09) * 1.5);
    g.strokeStyle = 'rgba(232,236,242,0.75)'; g.lineWidth = 3; g.stroke();
    if (q.model >= 1) {
      g.beginPath();
      for (i = 0; i < K.byModel(q, 0, 90, 180); i++) {
        var lx = r() * W, ly = lace(lx) + r.range(4, 46), lr = r.range(4, 14);
        g.moveTo(lx - lr, ly); g.quadraticCurveTo(lx, ly - lr * 0.35, lx + lr, ly); g.quadraticCurveTo(lx, ly + lr * 0.3, lx - lr, ly);
      }
      g.strokeStyle = 'rgba(226,230,238,0.35)'; g.lineWidth = 1.4; g.stroke();
    }
    // 水线处湿沙的高光
    if (q.light >= 1) { g.beginPath(); g.moveTo(0, lace(0) - 5); for (x = 0; x <= W; x += 10) g.lineTo(x, lace(x) - 5); strokeP(g, 'rgba(200,204,220,0.25)', 4); }
  }
  DM.HDBG.def('beach', {
    outdoor: true,
    draw: function (g, q, v) { drawBeach(g, q, v); },
    lights: [],
    key: { x: -0.4, color: '#d2d4e2', amb: '#363a50', rim: 0.4 }
  });

})(typeof window !== 'undefined' ? window : globalThis);
