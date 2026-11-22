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
  // 椭圆弧（老浏览器没有 ctx.ellipse 时用缩放的 arc 代替）
  function ellArc(g, cx, cy, rx, ry, rot, a0, a1, ccw) {
    if (g.ellipse) { g.ellipse(cx, cy, rx, ry, rot, a0, a1, ccw); return; }
    g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(1, ry / rx); g.arc(0, 0, rx, a0, a1, ccw); g.restore();
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
      // 白浪：由若干不规则泡沫团组成（不是整块白色）
      if (caps.length) {
        g.beginPath();
        for (k = 0; k < caps.length; k += 4) {
          var cxp = caps[k], cyp = caps[k + 1], cl = caps[k + 2], ct = caps[k + 3];
          var nb = 3 + ((cxp * 7.3) % 4 | 0);
          for (var b2 = 0; b2 < nb; b2++) {
            var bx = cxp + (r() - 0.5) * cl, by = cyp + (r() - 0.6) * ct * 1.2, bw = cl * r.range(0.08, 0.22), bh = Math.max(0.5, ct * r.range(0.25, 0.6));
            g.moveTo(bx + bw, by); g.ellipse ? g.ellipse(bx, by, bw, bh, 0, 0, TAU) : g.arc(bx, by, bw, 0, TAU);
          }
        }
        g.fillStyle = K.rgba(foam, 0.16 + 0.26 * sc); g.fill();
        // 浪峰最亮的一道细线
        g.beginPath();
        for (k = 0; k < caps.length; k += 4) {
          var ex = caps[k], ey = caps[k + 1], el = caps[k + 2] * 0.45, et = caps[k + 3];
          g.moveTo(ex - el, ey + et * 0.2); g.quadraticCurveTo(ex, ey - et * 0.9, ex + el, ey + et * 0.1);
        }
        g.strokeStyle = K.rgba(foam, 0.3 + 0.4 * sc); g.lineWidth = Math.max(0.6, th * 0.45); g.stroke();
        if (q.model >= 1 && sc > 0.15) {
          // 浪沫拖尾（断续的细纹）
          g.beginPath();
          for (k = 0; k < caps.length; k += 4) {
            var fx = caps[k], fy = caps[k + 1], fl = caps[k + 2], ft = caps[k + 3];
            for (var m2 = 0; m2 < 3; m2++) {
              var ox = r.range(-fl, fl) * 0.9, oy = ft * r.range(0.8, 3);
              g.moveTo(fx + ox - fl * 0.3, fy + oy); g.lineTo(fx + ox + fl * 0.3, fy + oy + r.range(-1, 1));
            }
          }
          g.strokeStyle = K.rgba(foam, 0.12 + 0.16 * sc); g.lineWidth = Math.max(0.6, th * 0.3); g.stroke();
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
  // 单棵杉树（神社林）：裸露的直干 + 由许多下垂枝叶团（底缘带针叶流苏）层层叠成的圆锥形树冠
  function sprayPath(g, cx, cy, cw, ch, teeth, droop, r) {
    g.moveTo(cx - cw, cy);
    g.quadraticCurveTo(cx - cw * 0.55, cy - ch * 1.1, cx + cw * 0.1, cy - ch);
    g.quadraticCurveTo(cx + cw * 0.7, cy - ch * 0.8, cx + cw, cy);
    var st = cw * 2 / teeth;
    for (var k = 0; k < teeth; k++) {
      var tx = cx + cw - (k + 0.5) * st, d = droop * (0.6 + 0.4 * Math.sin((k + 0.5) / teeth * PI));
      g.lineTo(tx, cy + d * r.range(0.7, 1.2)); g.lineTo(tx - st * 0.5, cy + d * 0.25);
    }
    g.closePath();
  }
  function cedar(g, q, x, y, h, col, lit, r, shade) {
    var w = h * 0.2, tiers = K.byModel(q, 5, 9, 13), teeth = K.byModel(q, 4, 6, 9);
    var base = y - h * 0.32, top = y - h;
    // 树干（下部无枝）
    K.poly(g, [x - h * 0.016, y, x + h * 0.016, y, x + h * 0.006, top + h * 0.1, x - h * 0.006, top + h * 0.1]);
    fillP(g, K.shade(col, -0.25));
    if (lit && q.light >= 1) { K.poly(g, [x - h * 0.016, y, x - h * 0.006, y, x - h * 0.002, base - h * 0.1, x - h * 0.008, base - h * 0.1]); fillP(g, K.rgba(lit, 0.6)); }
    var sh = [], li = [], i, k;
    g.beginPath();
    for (i = 0; i < tiers; i++) {
      var t = i / (tiers - 1), ty = base - (base - top) * Math.pow(t, 0.95), hw = w * Math.pow(1 - t * 0.92, 0.85) * r.range(0.8, 1.2);
      var nc = t > 0.8 ? 1 : 2 + (r() < 0.5 ? 1 : 0);
      for (k = 0; k < nc; k++) {
        var side = nc === 1 ? 0 : (k / (nc - 1) - 0.5) * 2;
        var cw = hw * (nc === 1 ? 0.9 : 0.62) * r.range(0.8, 1.1), cx = x + side * hw * 0.55 + r.range(-4, 4), cy = ty + Math.abs(side) * hw * 0.18;
        var ch = (base - top) / tiers * r.range(1.1, 1.6);
        sprayPath(g, cx, cy, cw, ch, teeth, ch * 0.45, r);
        sh.push(cx, cy, cw, ch); if (side <= 0.2) li.push(cx, cy, cw, ch);
      }
    }
    // 树梢
    g.moveTo(x - w * 0.12, top + h * 0.06); g.lineTo(x + r.range(-2, 2), top - h * 0.02); g.lineTo(x + w * 0.12, top + h * 0.06); g.closePath();
    g.fillStyle = col; g.fill();
    // 每团枝叶下缘的暗部（层次）
    if (shade && q.model >= 1) {
      g.beginPath();
      for (i = 0; i < sh.length; i += 4) { g.moveTo(sh[i] - sh[i + 2] * 0.9, sh[i + 1] - sh[i + 3] * 0.1); g.quadraticCurveTo(sh[i], sh[i + 1] - sh[i + 3] * 0.35, sh[i] + sh[i + 2] * 0.9, sh[i + 1] - sh[i + 3] * 0.1); g.lineTo(sh[i] + sh[i + 2] * 0.8, sh[i + 1] + sh[i + 3] * 0.2); g.lineTo(sh[i] - sh[i + 2] * 0.8, sh[i + 1] + sh[i + 3] * 0.2); g.closePath(); }
      g.fillStyle = shade; g.fill();
    }
    // 左上受光的叶团上缘
    if (lit && q.light >= 1) {
      g.beginPath();
      for (i = 0; i < li.length; i += 4) {
        var lx = li[i], ly = li[i + 1], lw = li[i + 2], lh = li[i + 3];
        g.moveTo(lx - lw, ly); g.quadraticCurveTo(lx - lw * 0.55, ly - lh * 1.1, lx + lw * 0.1, ly - lh);
        g.quadraticCurveTo(lx - lw * 0.3, ly - lh * 0.65, lx - lw * 0.7, ly - lh * 0.05); g.closePath();
      }
      g.fillStyle = lit; g.fill();
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
    g.beginPath(); len = (len || 18) * 1.3;
    for (var i = 0; i < n; i++) {
      var px = x + r() * w, py = y + r() * h, L = (len || 18) * r.range(0.5, 1.2), m = 3 + (r() * 3 | 0);
      for (var k = 0; k < m; k++) { var a = -PI / 2 + r.range(-0.7, 0.7); g.moveTo(px + k * 1.5, py); g.quadraticCurveTo(px + Math.cos(a) * L * 0.4, py + Math.sin(a) * L * 0.5, px + Math.cos(a) * L, py + Math.sin(a) * L); }
    }
    g.strokeStyle = col; g.lineWidth = 1.2; g.stroke();
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

  /* ======================= 岩面 ======================= */
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
      if (d < f1) { f2 = f1; f1 = d; id1x = cx; id1y = cy; out[3] = dx; out[4] = dy; } else if (d < f2) f2 = d;
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
    var V1 = [0, 0, 0, 0, 0], V2 = [0, 0, 0, 0, 0];
    var r = fres(q, o.res || 0.42);
    field(g, x, y, w, h, w * r, h * r, function (u, v, out) {
      var px = x + u * w, py = y + v * h;
      var wn = detail ? (fbm(px * 0.01, py * 0.01, 2, seed + 5) - 0.5) : 0;
      voro(px / cw + wn * 0.5, py / ch + wn * 0.3, seed, V1);
      var h1 = cellHash(V1[1], V1[2], seed + 3), h2 = cellHash2(V1[1], V1[2], seed + 9);
      var nx = (h1 - 0.5) * 1.3, ny = (h2 - 0.5) * 1.0 - tilt, nz = 1;
      // 只有一部分岩块边界是真正的裂缝（按噪声遮罩），其余只表现为块面转折
      var cm = sstep(0.42, 0.62, fbm(px * 0.004 + 3, py * 0.004, 2, seed + 41));
      var cr = 1 - (1 - sstep(0, crack, V1[0])) * (0.25 + 0.75 * cm);
      if (small) {
        voro(px / sw, py / sh, seed + 17, V2);
        nx += (cellHash(V2[1], V2[2], seed + 21) - 0.5) * 0.5; ny += (cellHash2(V2[1], V2[2], seed + 23) - 0.5) * 0.4;
      }
      var n = detail ? fbm(px * 0.03, py * 0.03, 3, seed + 31) : 0.5;
      nx += (n - 0.5) * 0.5;
      var nl = Math.sqrt(nx * nx + ny * ny + 1); nx /= nl; ny /= nl; nz = 1 / nl;
      var a = 1;
      if (P) { var dx = P[0] - px, dy = P[1] - py, dz = P[2], dl = Math.sqrt(dx * dx + dy * dy + dz * dz); lx = dx / dl; ly = dy / dl; lz = dz / dl; a = 1 / (1 + (dl / att) * (dl / att)); }
      var dif = nx * lx + ny * ly + nz * lz; dif = dif < 0 ? 0 : dif;
      // 岩块内部：上部受光、下部（悬垂处）偏暗，增加块体感
      var blk = 1 + sat(-V1[4] * 1.4) * 0.12 - sat(V1[4] * 1.6 + 0.1) * 0.32;
      var lum = (amb + (1 - amb) * dif * a) * (0.82 + n * 0.36) * (0.25 + 0.75 * cr) * blk;
      var R, G, B;
      if (lum < 0.5) { var t = lum * 2; R = dk[0] + (md[0] - dk[0]) * t; G = dk[1] + (md[1] - dk[1]) * t; B = dk[2] + (md[2] - dk[2]) * t; }
      else { var t2 = sat((lum - 0.5) * 2); R = md[0] + (lt[0] - md[0]) * t2; G = md[1] + (lt[1] - md[1]) * t2; B = md[2] + (lt[2] - md[2]) * t2; }
      if (mossf) { var mv = mossf(u, v) * sstep(0.45, 0.7, n + (ny < 0 ? -ny * 0.5 : 0)); if (mv > 0) { R += (mc[0] * (0.6 + dif * 0.8) - R) * mv; G += (mc[1] * (0.6 + dif * 0.8) - G) * mv; B += (mc[2] * (0.6 + dif * 0.8) - B) * mv; } }
      if (wetf) {
        var wv = wetf(u, v);
        if (wv > 0) {
          R *= 1 - wv * 0.4; G *= 1 - wv * 0.38; B *= 1 - wv * 0.32;
          if (spec) { var hz = nx * lx * 0.5 + ny * (ly * 0.5 - 0.5) + nz * (lz * 0.5 + 0.5); if (hz > 0.9) { var gm = vn(px * 0.045, py * 0.045); if (gm > 0.74) { var sp = (hz - 0.9) * 10 * (gm - 0.74) * 3.8 * wv * a * cr * 70; R += sp; G += sp; B += sp * 1.06; } } }
        }
      }
      out[0] = R; out[1] = G; out[2] = B;
      if (af) out[3] = af(u, v) * 255;
    });
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
  // 有进深的哥特窗：石框 → 窗洞内侧的暗面（左、上背光）→ 玻璃（反射/灯光）→ 窗帘 → 窗棂 → 出挑的窗台与其投影、污渍
  function deepWin(g, q, wn, past) {
    var x = wn.x, y = wn.y, w = wn.w, h = wn.h, fw = Math.max(4, w * 0.13), lit = wn.lit ? (past ? '#ffd28a' : '#ffbe6a') : null;
    // 石框（带一点受光渐变）
    archPath(g, x - fw, y - fw, w + fw * 2, h + fw * 1.2);
    fillP(g, K.lin(g, x - fw, y - fw, x + w + fw, y + h, ['#77737f', '#5e5a66', '#45424d']));
    if (wn.bay && q.model >= 1) { archPath(g, x - fw * 1.8, y - fw * 1.8, w + fw * 3.6, h + fw * 2); strokeP(g, 'rgba(20,19,24,0.5)', 2); }
    // 窗洞（深）
    archPath(g, x, y, w, h); fillP(g, '#141318');
    var d = Math.max(3, w * 0.12);
    // 玻璃
    archPath(g, x + d * 0.9, y + d * 0.8, w - d * 1.2, h - d * 0.8);
    if (lit) fillP(g, K.lin(g, 0, y, 0, y + h, [K.shade(lit, 0.25), lit, K.shade(lit, -0.35)]));
    else {
      var sk = mixc('#8a8aa0', '#5a5a70', wn.tint);
      fillP(g, K.lin(g, x, y, x + w * 0.6, y + h, [sk, '#2c2e3a', '#17181f']));
    }
    g.save(); archPath(g, x + d * 0.9, y + d * 0.8, w - d * 1.2, h - d * 0.8); g.clip();
    // 窗帘
    if (wn.curtain && q.model >= 1) {
      var cc = lit ? '#5a1e1e' : (wn.tint < 0.5 ? '#c8c0b0' : '#8a7a6a'), ca = lit ? 0.85 : 0.35;
      g.save(); g.globalAlpha = ca; g.fillStyle = cc;
      var cw = w * 0.42;
      if (wn.curtain === 1 || wn.curtain === 3) { K.path(g, 'M0 0 L1 0 Q0.7 0.55 0.85 1 L0 1 Z', x, y, cw, h); g.fill(); }
      if (wn.curtain === 2 || wn.curtain === 3) { K.path(g, 'M0 0 L-1 0 Q-0.7 0.55 -0.85 1 L0 1 Z', x + w, y, cw, h); g.fill(); }
      if (wn.curtain === 4) { g.fillRect(x, y, w, h); if (lit) { g.globalAlpha = 0.6; g.fillStyle = K.shade(lit, 0.2); g.fillRect(x + w / 2 - 2, y, 4, h); } }
      // 褶皱
      if (q.model >= 2) { g.globalAlpha = ca * 0.6; g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 1.2; g.beginPath(); for (var fk = 1; fk < 4; fk++) { g.moveTo(x + fk * cw / 4, y); g.lineTo(x + fk * cw / 4 + 2, y + h); g.moveTo(x + w - fk * cw / 4, y); g.lineTo(x + w - fk * cw / 4 - 2, y + h); } g.stroke(); }
      g.restore();
    }
    // 窗洞内侧的阴影（光从左上来：左侧与拱顶内面背光）
    if (q.light >= 1) {
      g.fillStyle = K.lin(g, x, 0, x + d * 2.4, 0, ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0)']); g.fillRect(x, y, d * 2.4, h);
      g.fillStyle = K.lin(g, 0, y, 0, y + w * 0.6, ['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)']); g.fillRect(x, y, w, w * 0.6);
    }
    if (!lit && q.light >= 2) { g.beginPath(); g.moveTo(x + w * 0.2, y + h); g.lineTo(x + w * 0.5, y); g.lineTo(x + w * 0.72, y); g.lineTo(x + w * 0.42, y + h); g.closePath(); fillP(g, 'rgba(255,255,255,' + (0.04 + wn.tint * 0.06).toFixed(3) + ')'); }
    g.restore();
    // 窗棂与花窗格
    var mw = Math.max(2, w * 0.06), mc = '#1e1c22';
    g.fillStyle = mc;
    g.fillRect(x + w / 2 - mw / 2, y + w * 0.14, mw, h - w * 0.14);
    g.fillRect(x + d * 0.6, y + h * 0.56, w - d * 1.2, mw);
    if (wn.bay) { g.fillRect(x + w * 0.25 - mw / 2, y + w * 0.3, mw * 0.8, h - w * 0.3); g.fillRect(x + w * 0.75 - mw / 2, y + w * 0.3, mw * 0.8, h - w * 0.3); }
    if (q.model >= 1) { g.strokeStyle = mc; g.lineWidth = mw * 0.8; K.ellipse(g, x + w / 2, y + w * 0.38, w * 0.15, w * 0.15); g.stroke(); }
    if (lit && q.light >= 1) K.glow(g, x + w / 2, y + h * 0.5, Math.max(w, h) * 0.95, lit, 0.2);
    // 窗台：出挑的石板（顶面受光）+ 投影 + 向下的雨水污渍
    var sy = y + h + fw * 0.15, sw = w + fw * 3;
    g.fillStyle = '#7a7682'; g.fillRect(x - fw * 1.5, sy, sw, 4);
    g.fillStyle = '#55525e'; g.fillRect(x - fw * 1.5, sy + 4, sw, fw * 0.8);
    if (q.light >= 1) { g.fillStyle = K.lin(g, 0, sy + 4 + fw * 0.8, 0, sy + 20 + fw, ['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)']); g.fillRect(x - fw * 1.2, sy + 4 + fw * 0.8, sw - fw * 0.6, 16); }
    if (q.model >= 1) {
      var sl = 50 + wn.tint * 80;
      g.fillStyle = K.lin(g, 0, sy + 10, 0, sy + 10 + sl, ['rgba(10,10,14,0.32)', 'rgba(10,10,14,0)']);
      g.fillRect(x - fw * 1.2, sy + 10, 8, sl); g.fillRect(x + w + fw * 0.6, sy + 10, 8, sl * 0.8);
      g.fillRect(x + w / 2 - 6, sy + 10, 12, sl * 0.6);
    }
  }
  // 墙面风化：低分辨率场（竖向雨痕、墙脚潮湿与藻绿、明暗斑驳），带 alpha 叠加，不重复
  function weatherField(g, q, x, y, w, h, seed, ground, strength) {
    var k = strength || 1, r = fres(q, 0.1);
    field(g, x, y, w, h, w * r, h * r, function (u, v, out) {
      var px = x + u * w, py = y + v * h;
      var streak = fbm(px * 0.03, py * 0.0025, 3, seed), patch = fbm(px * 0.004, py * 0.006, 3, seed + 5);
      var damp = sstep(ground - 160, ground, py);
      var dark = sat((streak - 0.5) * 2.2) * 0.45 + damp * 0.35 + sat(0.45 - patch) * 0.4;
      var light = sat(patch - 0.62) * 0.9;
      if (light > dark) { out[0] = 190; out[1] = 188; out[2] = 200; out[3] = light * 60 * k; }
      else { var gr = damp * 0.6; out[0] = 12 + gr * 20; out[1] = 12 + gr * 30; out[2] = 16; out[3] = Math.min(255, Math.min(1, dark) * 150 * k); }
    });
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

  /* ======================= 透视铺石地面 ======================= */
  // o = { y0 远端 y, y1 近端 y, yh 地平线, vx 消失点 x, cw 远端石板宽, dz 每行深度步长, x0,x1 远端左右范围, base, seed, moss, wet, joint }
  var GRAIN = { c1: '#000000', c2: '#ffffff', scale: 32, oct: 3, seed: 77, contrast: 1.2 };
  function pavePersp(g, q, o) {
    var r = RNG(o.seed || 1), yh = o.yh, y0 = o.y0, y1 = o.y1 || H, vx = o.vx, cw = o.cw, dz = o.dz || 0.07;
    var base = o.base || '#4a4954', x0 = o.x0 === undefined ? -2000 : o.x0, x1 = o.x1 === undefined ? 4000 : o.x1;
    var ys = [], z = 1;
    while (true) { var y = yh + (y0 - yh) / z; ys.push(y); if (y > y1 + 2 || z <= dz) break; z -= dz * (q.model >= 1 ? 1 : 1.4); }
    function X(xf, y) { return vx + (xf - vx) * (y - yh) / (y0 - yh); }
    var cLo = Math.floor((x0 - vx) / cw) - 1, cHi = Math.ceil((x1 - vx) / cw) + 1;
    for (var k = 0; k < ys.length - 1; k++) {
      var ya = ys[k], yb = Math.min(ys[k + 1], y1 + 2), off = (k % 2) * 0.5 + r.range(-0.15, 0.15);
      for (var c = cLo; c <= cHi; c++) {
        var fa = vx + (c + off) * cw, fb = vx + (c + 1 + off) * cw;
        var t = r();
        K.poly(g, [X(fa, ya), ya, X(fb, ya), ya, X(fb, yb), yb, X(fa, yb), yb]);
        g.fillStyle = t < 0.5 ? K.rgba('#000000', 0.04 + t * 0.2) : K.rgba('#d8d8e8', (t - 0.5) * 0.12);
        g.fill();
      }
    }
    // 接缝
    g.beginPath();
    for (k = 0; k < ys.length; k++) { g.moveTo(-10, ys[k]); g.lineTo(W + 10, ys[k]); }
    for (k = 0; k < ys.length - 1; k++) {
      var ya2 = ys[k], yb2 = Math.min(ys[k + 1], y1 + 2), off2 = (k % 2) * 0.5;
      for (c = cLo; c <= cHi; c++) { var f = vx + (c + off2) * cw; g.moveTo(X(f, ya2), ya2); g.lineTo(X(f, yb2), yb2); }
    }
    g.strokeStyle = o.joint || 'rgba(14,13,18,0.75)'; g.lineWidth = 2.2; g.stroke();
    // 石板远边的受光细线
    if (q.light >= 1) {
      g.beginPath(); for (k = 1; k < ys.length; k++) { g.moveTo(-10, ys[k] + 1.6); g.lineTo(W + 10, ys[k] + 1.6); }
      g.strokeStyle = 'rgba(200,200,220,0.07)'; g.lineWidth = 1.2; g.stroke();
    }
    // 缝里的青苔
    if (o.moss && q.model >= 1) {
      g.beginPath();
      for (var m = 0; m < K.byModel(q, 0, 50, 110); m++) {
        var kk = 1 + (r() * (ys.length - 2) | 0), yy = ys[kk], mw = (6 + (yy - y0) * 0.1) * r.range(0.6, 1.8), mx = r.range(0, W);
        g.moveTo(mx + mw, yy); g.ellipse ? g.ellipse(mx, yy, mw, mw * 0.16, 0, 0, TAU) : g.arc(mx, yy, mw, 0, TAU);
      }
      g.fillStyle = o.moss; g.fill();
    }
    void base;
  }
  /* ======================= 石阶 ======================= */
  // 通用台阶：steps 为 [x0,x1,yTread,yRiserBottom] 数组（从远到近），颜色与材质
  // 透视石阶：steps 由远到近，每级 { xl, xr 前缘左右 x, y 前缘(踏面外沿) y, td 踏面可见深度, bl, br 踏面后缘左右 x, rh 立面高 }
  // 踏面受光（中间被踩得更亮更光滑、前缘有缺口），立面背光（上方有前缘投影、下方有 AO），两端与接缝长青苔
  function stairFlight(g, q, steps, o) {
    var r = RNG(o.seed || 7), moss = o.moss || 'rgba(70,90,52,0.6)';
    for (var i = 0; i < steps.length; i++) {
      var s = steps[i], xl = s.xl, xr = s.xr, y = s.y, td = s.td, bl = s.bl, br = s.br, rh = s.rh, wv = xr - xl;
      // 踏面
      if (td > 0.5) {
        K.poly(g, [bl, y - td, br, y - td, xr, y, xl, y]); fillP(g, o.top);
        if (q.tex > 0) { K.poly(g, [bl, y - td, br, y - td, xr, y, xl, y]); texFill(g, q, 'noise', STEP_GRAIN, 128, xl, y, 0.35, 1, 1, null, 'overlay'); }
        K.poly(g, [bl, y - td, br, y - td, xr, y, xl, y]);
        fillP(g, K.lin(g, 0, y - td, 0, y, ['rgba(0,0,0,0.3)', 'rgba(220,220,236,0.06)', 'rgba(230,230,245,0.14)']));
        // 磨损：中间被踩得发亮
        if (q.model >= 1) {
          g.save(); K.poly(g, [bl, y - td, br, y - td, xr, y, xl, y]); g.clip();
          var cxm = (xl + xr) / 2 + (o.wearShift || 0);
          g.translate(cxm, y - td * 0.45); g.scale(1, Math.max(0.05, td / wv) * 1.2);
          g.fillStyle = K.rad(g, 0, 0, 0, wv * 0.32, [[0, 'rgba(225,225,240,0.16)'], [1, 'rgba(225,225,240,0)']]); g.fillRect(-wv * 0.4, -wv * 0.4, wv * 0.8, wv * 0.8);
          g.restore();
          // 石板接缝
          var nj = Math.max(1, Math.round(wv / 150));
          g.beginPath();
          for (var j = 1; j <= nj; j++) { var f = j / (nj + 1) + r.range(-0.06, 0.06); g.moveTo(lerp(bl, br, f), y - td); g.lineTo(lerp(xl, xr, f), y); }
          g.strokeStyle = 'rgba(16,15,20,0.6)'; g.lineWidth = 1.6; g.stroke();
        }
        if (o.wet && q.light >= 2) { K.poly(g, [bl, y - td, br, y - td, xr, y, xl, y]); fillP(g, K.lin(g, xl, 0, xr, 0, ['rgba(200,205,225,0)', 'rgba(200,205,225,0.12)', 'rgba(200,205,225,0)'])); }
      }
      // 立面
      rectP(g, xl, y, wv, rh); fillP(g, o.front);
      if (q.tex > 0) { rectP(g, xl, y, wv, rh); texFill(g, q, 'noise', STEP_GRAIN, 128, xl + 37, y, 0.4, 1, 1, null, 'overlay'); }
      rectP(g, xl, y, wv, rh);
      fillP(g, K.lin(g, 0, y, 0, y + rh, ['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.45)']));
      // 前缘：受光的圆角 + 缺口
      g.fillStyle = K.rgba(o.edge || '#c4c2d0', q.light >= 1 ? 0.42 : 0.25); g.fillRect(xl, y - 1, wv, Math.max(1.5, rh * 0.08));
      if (q.model >= 1) {
        g.fillStyle = 'rgba(24,23,30,0.45)';
        for (var c = 0; c < 1 + (wv / 200 | 0); c++) { var cx = r.range(xl + 6, xr - 6), cw = r.range(4, 10); K.poly(g, [cx, y - 1, cx + cw, y - 1, cx + cw * 0.5, y + rh * 0.15]); g.fill(); }
      }
      // 青苔：两端与踏面后缘
      if (q.model >= 1) {
        g.beginPath();
        for (var m = 0; m < K.byModel(q, 0, 5, 9); m++) {
          // 青苔团：靠两端（墙脚）与踏面后缘（立面根部）的一簇小点
          var endSide = r() < 0.65, mx = endSide ? (r() < 0.5 ? xl + r.range(0, wv * 0.08) : xr - r.range(0, wv * 0.08)) : r.range(xl, xr);
          var my = y - td + r.range(0, Math.max(1, td * 0.35)), sc = 0.5 + rh / 50;
          for (var d2 = 0; d2 < 4; d2++) { var dx2 = mx + r.range(-10, 10) * sc, dy2 = my + r.range(-1, 2) * sc, dr = r.range(2, 5) * sc; g.moveTo(dx2 + dr, dy2); g.arc(dx2, dy2, dr, 0, TAU); }
        }
        g.fillStyle = moss; g.fill();
        if (q.model >= 2 && o.grass) grassTufts(g, q, r, 2, xl - 4, y - 2, 10, 2, o.grass, 10);
        if (q.model >= 2 && o.grass) grassTufts(g, q, r, 2, xr - 6, y - 2, 10, 2, o.grass, 10);
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
    K.ellipse(g, x, y, R, R); g.moveTo(x + R * 0.56, y); g.arc(x, y, R * 0.56, 0, TAU, true);
    g.fillStyle = '#e6e1d6'; g.fill();
    // 红色分段
    for (var i = 0; i < 4; i++) {
      var a0 = i * PI / 2 + PI / 8, a1 = a0 + PI / 4;
      g.beginPath(); g.arc(x, y, R, a0, a1); g.arc(x, y, R * 0.56, a1, a0, true); g.closePath(); g.fillStyle = '#c0442c'; g.fill();
    }
    K.ellipse(g, x, y, R, R); g.moveTo(x + R * 0.56, y); g.arc(x, y, R * 0.56, 0, TAU, true);
    g.fillStyle = K.rad(g, x - R * 0.3, y - R * 0.3, R * 0.2, R * 1.2, [[0, 'rgba(255,255,255,0.25)'], [0.6, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.45)']]); g.fill();
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
  var STEP_ROCK = { c1: '#3e3c46', c2: '#76747e', seed: 44 };
  var STEP_GRAIN = { c1: '#000000', c2: '#ffffff', scale: 24, oct: 4, seed: 45, contrast: 1.3 };
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
    mat(g, q, '#4b4955', 'stone', WALL_STONE, 160, 0, y0);
    rectP(g, xa, y0, xb - xa, y1 - y0);
    shadeLin(g, 0, y0, 0, y1, [[0, 'rgba(8,8,14,0.25)'], [1, 'rgba(8,8,14,0.55)']]);
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
    rockCells(g, q, 1430, 180, 500, 630, { seed: 51, cw: 150, ch: 120, dark: '#16151c', mid: '#3e3c48', lite: '#9592a2', L: [-0.6, -0.6, 0.55], amb: 0.3, crack: 0.03, tilt: 0.2,
      wet: function (u, v) { return sat((v - 0.6) * 2); }, moss: function (u, v) { return sat(0.3 - v) * 2; } });
    if (q.tex > 0) { K.poly(g, poly); texFill(g, q, 'rock', ROCK, 256, 0, 0, 0.4, null, null, null, 'overlay'); }
    // 坡顶植被
    var r = RNG(53);
    for (var i = 0; i < K.byModel(q, 6, 12, 18); i++) canopy(g, q, 1500 + r() * 440, 200 + r() * 40, r.range(30, 60), r.range(18, 30), '#2c3528', '#46523e', r, 6);
    g.restore();
    cliffPine(g, q, 1560, 246, 1.5, '#27302a', '#3e4a3c', r);
    // 台阶：由远（上）到近（下）。越远越矮越窄；高于视平线的踏面只露出受光的前缘
    var N = K.byModel(q, 11, 13, 15), steps = [], tot = 0, k2;
    for (k2 = 0; k2 < N; k2++) tot += lerp(1, 0.55, k2 / (N - 1));
    var yy = 748, ys = [];
    for (k2 = 0; k2 < N; k2++) { ys.push(yy); yy -= 430 * lerp(1, 0.55, k2 / (N - 1)) / tot; }
    function SXL(y) { return lerp(1508, 1640, (748 - y) / 430); }
    function SXR(y) { return lerp(1782, 1856, (748 - y) / 430); }
    for (i = N - 1; i >= 0; i--) {
      var yf = ys[i], next = i < N - 1 ? ys[i + 1] : yf - 16, sp = yf - next, td = Math.max(1.5, Math.min(sp * 0.45, (yf - 560) * 0.07)), rh = (i === 0 ? 32 : ys[i - 1] - yf) - (i === 0 ? 0 : 0);
      rh = i === 0 ? 30 : (ys[i - 1] - yf) - Math.max(1.5, Math.min((ys[i - 1] - (yf)) * 0.45, (ys[i - 1] - 560) * 0.07));
      steps.push({ xl: SXL(yf), xr: SXR(yf), y: yf, td: td, bl: SXL(yf - td) + 6, br: SXR(yf - td) + 2, rh: rh });
    }
    // 台阶左侧的侧面（锯齿轮廓的石砌侧墙）
    var side = [1490, 792];
    for (i = steps.length - 1; i >= 0; i--) { var st = steps[i]; side.push(st.xl, st.y + st.rh, st.xl, st.y, st.bl, st.y - st.td); }
    side.push(steps[0].bl + 14, steps[0].y + 40, 1530, 792);
    K.poly(g, side); mat(g, q, '#3c3a45', 'stone', QUAY_STONE, 192, 0, 0);
    K.poly(g, side); fillP(g, K.lin(g, 1490, 0, 1660, 0, ['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.5)']));
    stairFlight(g, q, steps, { top: '#66646e', front: '#42404b', tex: STEP_ROCK, moss: 'rgba(70,92,52,0.62)', grass: 'rgba(80,96,60,0.85)', wet: true, seed: 1209, wearShift: -10 });
    // 各级左端受光的棱
    if (q.light >= 1) { g.beginPath(); for (i = 0; i < steps.length; i++) { g.moveTo(steps[i].xl, steps[i].y); g.lineTo(steps[i].xl, steps[i].y + steps[i].rh); } strokeP(g, 'rgba(200,200,218,0.25)', 1.5); }
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
    K.poly(g, [0, y0, W, y0, W, H, 0, H]); fillP(g, '#4a4954');
    if (q.tex > 0) { K.poly(g, [0, y0, W, y0, W, H, 0, H]); texFill(g, q, 'noise', GRAIN, 128, 0, y0, 0.22, 1, 1, null, 'overlay'); }
    g.save(); K.poly(g, [0, y0, W, y0, W, H, 0, H]); g.clip();
    pavePersp(g, q, { y0: y0, yh: yh, vx: 960, cw: 74, dz: 0.075, seed: 371, moss: 'rgba(60,74,46,0.45)' });
    g.restore();
    K.poly(g, [0, y0, W, y0, W, H, 0, H]);
    shadeLin(g, 0, y0, 0, H, [[0, 'rgba(10,10,18,0.5)'], [0.4, 'rgba(10,10,18,0.12)'], [1, 'rgba(10,10,18,0.3)']]);
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
  var SAND_T = { c1: '#000000', c2: '#ffffff', scale: 56, oct: 2, seed: 41, contrast: 1.5 };
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
    // 自然的岩坡：倾斜的沉积岩层（层顶受光、层底投影）+ 被草与灌丛覆盖的缓坡 + 冲沟；远处空气透视
    var rk0 = C('#282731'), rk1 = C('#7e7b88'), veg0 = C('#1c2620'), veg1 = C('#46543e'), hz = C(SKY.hor), rr0 = fres(q, 0.3);
    field(g, -10, 360, 1220, 345, 1220 * rr0, 345 * rr0, function (u, v, out) {
      var x = -10 + u * 1220, y = 360 + v * 345, top = lowCliffTop(x), dv = sat((y - top) / (700 - top));
      var warp = fbm(x * 0.0035, y * 0.005, 3, 701);
      var sc = y * 0.019 - x * 0.0028 + warp * 1.6, li2 = Math.floor(sc), band = sc - li2;
      var layerTone = cellHash(li2, 3, 7);
      // 岩层：顶面（band 小）受光，底部（band 大）有悬垂投影
      var lum = 0.42 + layerTone * 0.22 + (band < 0.14 ? (0.14 - band) * 3.4 : 0) - (band > 0.8 ? (band - 0.8) * 3.2 : 0);
      var vfr = fbm(x * 0.012, y * 0.006, 2, 703);
      lum += (vfr - 0.5) * 0.22 - band * 0.12;
      var gully = sat((fbm(x * 0.014, y * 0.0022, 3, 705) - 0.6) * 4);
      lum -= gully * 0.22;
      lum = sat(lum);
      var R = rk0[0] + (rk1[0] - rk0[0]) * lum, G = rk0[1] + (rk1[1] - rk0[1]) * lum, B = rk0[2] + (rk1[2] - rk0[2]) * lum;
      // 植被：坡顶连片，向下只在岩层顶面（平台）上成片
      var vn2 = fbm(x * 0.006, y * 0.01, 3, 707);
      var veg = sstep(0.4, 0.5, vn2 + (1 - dv) * 0.6 - 0.27 + (band < 0.22 ? 0.2 * (1 - dv * 0.5) : -0.12)) * (1 - gully);
      if (veg > 0) {
        var vt = fbm(x * 0.02, y * 0.03, 2, 709), vl = sat(0.3 + vt * 0.5 + (band < 0.3 ? 0.2 : 0) - dv * 0.2);
        var vr = veg0[0] + (veg1[0] - veg0[0]) * vl, vg = veg0[1] + (veg1[1] - veg0[1]) * vl, vb = veg0[2] + (veg1[2] - veg0[2]) * vl;
        R += (vr - R) * veg; G += (vg - G) * veg; B += (vb - B) * veg;
      }
      // 坡脚潮湿变暗
      var wet = sstep(0.75, 1, dv) * 0.4; R *= 1 - wet; G *= 1 - wet; B *= 1 - wet * 0.8;
      // 空气透视：整体偏蓝偏亮，坡顶更远更淡
      var hzk = 0.32 + (1 - dv) * 0.12;
      out[0] = R + (hz[0] - R) * hzk; out[1] = G + (hz[1] - G) * hzk; out[2] = B + (hz[2] - B) * hzk;
    });
    if (q.tex > 0) { K.poly(g, pts); texFill(g, q, 'noise', SAND_T, 128, 0, 0, 0.12, null, null, null, 'overlay'); }
    // 岩层边缘的细线与草丛（矢量，近处清晰）
    if (q.model >= 1) {
      var lr = RNG(711);
      // 沿岩层走向描出层顶的受光细线（断断续续）与其下的暗线
      var hiL = [], loL = [], li;
      for (var n2 = Math.floor(400 * 0.019); n2 < 700 * 0.019 + 2; n2++) {
        var on = false;
        for (var lx = -10; lx <= 1150; lx += 14) {
          var ly = (n2 + lx * 0.0028) / 0.019;
          ly = (n2 + lx * 0.0028 - fbm(lx * 0.0035, ly * 0.005, 3, 701) * 1.6) / 0.019;
          ly = (n2 + lx * 0.0028 - fbm(lx * 0.0035, ly * 0.005, 3, 701) * 1.6) / 0.019;
          var ok = ly > lowCliffTop(lx) + 60 && ly < 690 && vn(lx * 0.02, n2 * 3.1) > 0.42;
          if (ok) { if (!on) { hiL.push('M'); loL.push('M'); } hiL.push(lx, ly + 1); loL.push(lx, ly - 2); }
          on = ok;
        }
      }
      function strokeList(Lst, col, wd) { g.beginPath(); var mv = false; for (var z = 0; z < Lst.length; z++) { if (Lst[z] === 'M') { mv = true; continue; } if (mv) { g.moveTo(Lst[z], Lst[z + 1]); mv = false; } else g.lineTo(Lst[z], Lst[z + 1]); z++; } strokeP(g, col, wd); }
      strokeList(loL, 'rgba(14,14,20,0.22)', 2);
      strokeList(hiL, 'rgba(210,208,222,0.22)', 1.4);
      var lr = RNG(711);
      for (li = 0; li < K.byModel(q, 0, 16, 30); li++) { var gx = lr.range(0, 1180), gy = lr.range(lowCliffTop(gx) + 20, 660); grassTufts(g, q, lr, 4, gx, gy, 40, 6, K.rgba('#5a6a50', 0.65), 12); }
      // 坡脚的碎石
      for (li = 0; li < K.byModel(q, 0, 10, 18); li++) { var sx = lr.range(240, 1150), sw = lr.range(10, 30); K.ellipse(g, sx, 696 - lr.range(0, 10), sw, sw * 0.45); fillP(g, lr() < 0.5 ? '#3a3a44' : '#55545f'); }
    }
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
    if (q.tex > 0) { rectP(g, 0, y0, W, y1 - y0); texFill(g, q, 'noise', SAND_T, 128, 0, 0, 0.2, null, null, null, 'overlay'); }
    // 风纹
    var rr = RNG(95);
    if (q.model >= 1) {
      g.strokeStyle = 'rgba(60,54,44,0.14)'; g.lineWidth = 2; g.beginPath();
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
    // 碎浪带：卷起的浪面（暗青）+ 浪头白沫 + 向前铺开的泡沫
    var r = RNG(103), by = 918;
    function crest(x) { return by + Math.sin(x * 0.0065 + 0.7) * 7 + (fbm(x * 0.01, 9.1, 3, 104) - 0.5) * 16; }
    g.beginPath(); g.moveTo(0, crest(0));
    for (var x2 = 0; x2 <= W; x2 += 12) g.lineTo(x2, crest(x2));
    for (x2 = W; x2 >= 0; x2 -= 12) g.lineTo(x2, crest(x2) + 34 + Math.sin(x2 * 0.013) * 6);
    g.closePath();
    g.fillStyle = K.lin(g, 0, by - 10, 0, by + 40, ['rgba(70,96,104,0.85)', 'rgba(30,44,52,0.9)']); g.fill();
    // 浪头白沫（不规则团块）
    g.beginPath();
    for (var i = 0; i < K.byModel(q, 70, 160, 300); i++) {
      var fx = r() * W, fy = crest(fx) + r.range(-6, 6), fr = r.range(4, 14);
      g.moveTo(fx + fr * 1.8, fy); g.ellipse ? g.ellipse(fx, fy, fr * 1.8, fr * 0.55, 0, 0, TAU) : g.arc(fx, fy, fr, 0, TAU);
    }
    g.fillStyle = 'rgba(228,232,238,0.42)'; g.fill();
    g.beginPath(); g.moveTo(0, crest(0) - 2); for (x2 = 0; x2 <= W; x2 += 8) g.lineTo(x2, crest(x2) - 2 + r.range(-1.5, 1.5));
    g.strokeStyle = 'rgba(236,240,245,0.7)'; g.lineWidth = 3; g.stroke();
    // 浪面上被拉长的泡沫条纹
    if (q.model >= 1) {
      g.beginPath();
      for (i = 0; i < K.byModel(q, 0, 50, 90); i++) { var sx = r() * W, sy = crest(sx) + r.range(8, 30), sl = r.range(20, 80); g.moveTo(sx, sy); g.quadraticCurveTo(sx + sl / 2, sy + r.range(-3, 3), sx + sl, sy + r.range(-2, 2)); }
      g.strokeStyle = 'rgba(210,220,228,0.25)'; g.lineWidth = 1.5; g.stroke();
    }
    if (q.light >= 2) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = K.lin(g, 0, by - 36, 0, by + 4, ['rgba(220,225,235,0)', 'rgba(220,225,235,0.09)']); g.fillRect(0, by - 36, W, 40); g.restore(); }
    // 蕾丝状浪沫边缘
    g.beginPath(); g.moveTo(0, lace(0));
    for (x = 0; x <= W; x += 6) g.lineTo(x, lace(x) + Math.sin(x * 0.09) * 1.5);
    g.strokeStyle = 'rgba(232,236,242,0.75)'; g.lineWidth = 3; g.stroke();
    if (q.model >= 1) {
      g.beginPath();
      for (i = 0; i < K.byModel(q, 0, 40, 70); i++) {
        var lx = r() * W, ly = lace(lx) + r.range(4, 40), lr = r.range(6, 22);
        g.moveTo(lx - lr, ly); g.quadraticCurveTo(lx, ly - lr * 0.35, lx + lr, ly); g.quadraticCurveTo(lx, ly + lr * 0.3, lx - lr, ly);
      }
      g.strokeStyle = 'rgba(226,230,238,0.22)'; g.lineWidth = 1.2; g.stroke();
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


  /* =================================================================
   * 中庭 courtyard（+ past：九年前，温室完好、喷泉有水）
   * ================================================================= */
  var CY_GAP = [430, 150];
  // 宅邸两翼的窗位（绘制与光源共用）：成对排列 + 中央凸出的山墙开间（bay），打破严格的重复
  var WING_FLOORS = [292, 432, 572], WING_WH = [84, 92, 100];
  var WING_COLS = { L: [52, 160, 300, 440, 548, 680], R: [1210, 1318, 1458, 1598, 1706, 1846] }, WING_BAY = { L: 2, R: 2 };
  function wingWindows(x0, x1, side) {
    var out = [], cols = WING_COLS[side], r = RNG(side === 'L' ? 571 : 573);
    var litSet = side === 'L' ? { '0-1': 1, '1-3': 1, '2-0': 1 } : { '0-2': 1, '1-0': 1, '0-5': 1 };
    for (var f = 0; f < 3; f++) for (var k = 0; k < cols.length; k++) {
      var bay = k === WING_BAY[side], ww = bay ? 62 : 44;
      // 窗帘状态：0 无、1 左半拉、2 右半拉、3 两侧束起、4 全拉上
      out.push({ x: cols[k] - ww / 2, y: WING_FLOORS[f] - (bay ? 10 : 0), w: ww, h: WING_WH[f] + (bay ? 10 : 0), lit: !!litSet[f + '-' + k], bay: bay,
        curtain: r() < 0.55 ? (1 + (r() * 4 | 0)) : 0, tint: r() });
    }
    return out;
  }
  var CY_LIT = (function () {
    var a = wingWindows(-30, 770, 'L').concat(wingWindows(1118, 1950, 'R')), o = [];
    for (var i = 0; i < a.length; i++) if (a[i].lit) o.push([a[i].x + a[i].w / 2, a[i].y + a[i].h * 0.55]);
    return o;
  })();
  var FLAG = { c1: '#34333c', c2: '#5e5c68', mortar: '#1c1b21', rows: 4, cols: 3, seed: 91, irregular: 1, mortarW: 0.02 };
  var WALL_STONE = { c1: '#2a2932', c2: '#4e4b58', mortar: '#18171d', rows: 8, cols: 4, seed: 93, irregular: 1, mortarW: 0.03 };
  // 大块琢石（宅邸与塔）：块大、灰缝细、色差柔和
  var ASHLAR = { c1: '#2e2d36', c2: '#4c4a56', mortar: '#1e1d24', rows: 4, cols: 2, seed: 95, irregular: 1, mortarW: 0.011 };
  function drawCourtyard(g, q, v) {
    var past = v === 'past';
    sky(g, q, { y: 0, h: 720, seed: past ? 19 : 47, gx: CY_GAP[0] / W, gy: CY_GAP[1] / 720, gw: past ? 0.2 : 0.14, dens: past ? -0.06 : 0 });
    godRays(g, q, CY_GAP[0], CY_GAP[1] + 50, 700, 8, 59, 0.035, 0.6, 140);
    crows(g, q, 61, 6, 1250, 40, 500, 150, 1.0, '#25232f');
    // 缆索（神社 → 塔顶铁环）
    if (!past || true) {
      g.beginPath(); g.moveTo(-10, 24); g.quadraticCurveTo(400, 84, 742, 58);
      strokeP(g, 'rgba(14,12,18,0.92)', 2.6);
      if (q.light >= 2) { g.beginPath(); g.moveTo(-10, 23); g.quadraticCurveTo(400, 83, 742, 57); strokeP(g, 'rgba(200,200,220,0.18)', 0.8); }
    }
    drawWing(g, q, -30, 770, 252, 692, 101, past, 'L');
    drawWing(g, q, 1118, 1950, 252, 692, 103, past, 'R');
    drawCyTower(g, q, past);
    drawCyGround(g, q, past);
    drawGreenhouse(g, q, past);
    drawFountain(g, q, past);
    if (past) drawWheelbarrow(g, q, 664, 912); else drawEasel(g, q, 664, 918);
    drawBench(g, q, 1352, 912, past);
    // 前景两侧的灌木（框住画面）
    var r = RNG(past ? 111 : 113);
    for (var i = 0; i < K.byModel(q, 3, 5, 7); i++) canopy(g, q, r.range(-40, 120), r.range(980, 1100), r.range(60, 110), r.range(40, 70), '#1e2620', '#334036', r, K.byModel(q, 6, 10, 16));
    for (i = 0; i < K.byModel(q, 3, 5, 7); i++) canopy(g, q, r.range(1820, 1980), r.range(990, 1110), r.range(60, 110), r.range(40, 70), '#1e2620', '#334036', r, K.byModel(q, 6, 10, 16));
    if (past) for (i = 0; i < 26; i++) { K.ellipse(g, r.range(0, 140), r.range(960, 1060), 7, 6); fillP(g, r() < 0.5 ? '#7a86c8' : '#a07ac0', 0.8); }
    K.vignette(g, W, H, q.light >= 1 ? 0.5 : 0.35, 0.45);
  }
  // 宅邸侧翼立面（三层，哥特尖拱窗，陡峭石板瓦屋顶，老虎窗与烟囱）
  function drawWing(g, q, x0, x1, eave, ground, seed, past, side) {
    var r = RNG(seed), w = x1 - x0;
    // 屋顶
    var ridgeY = eave - 128;
    slateRoof(g, q, [x0, eave + 6, x0 + 30, ridgeY, x1 - 30, ridgeY, x1, eave + 6], x0, ridgeY, x1, eave + 6, '#2b2a36', seed);
    // 烟囱
    for (var c = 0; c < 2; c++) {
      var cx = x0 + w * (c ? 0.72 : 0.22) + r.range(-30, 30);
      rectP(g, cx, ridgeY - 70, 36, 90); mat(g, q, '#3a3842', 'stone', WALL_STONE, 96, cx, 0);
      rectP(g, cx, ridgeY - 70, 36, 90); shadeLin(g, cx, 0, cx + 36, 0, [[0, 'rgba(255,255,255,0.12)'], [1, 'rgba(0,0,0,0.4)']]);
      g.fillStyle = '#26252c'; g.fillRect(cx - 5, ridgeY - 78, 46, 10);
      g.fillStyle = '#1e1d22'; g.fillRect(cx + 6, ridgeY - 92, 8, 14); g.fillRect(cx + 22, ridgeY - 90, 8, 12);
    }
    // 老虎窗
    var nd = side === 'L' ? 4 : 4;
    for (var d = 0; d < nd; d++) {
      var dx = x0 + 90 + d * (w - 180) / (nd - 1) - 28;
      if (side === 'L' && dx > x1 - 120) continue;
      K.poly(g, [dx - 6, eave - 40, dx + 28, eave - 104, dx + 62, eave - 40]); fillP(g, '#2e2d38');
      rectP(g, dx, eave - 46, 56, 52); fillP(g, '#3c3a46');
      gothicWin(g, q, dx + 14, eave - 66, 28, 56, { frame: '#5e5a66' });
    }
    // 墙面：大块琢石
    rectP(g, x0, eave, w, ground - eave);
    mat(g, q, '#3a3843', 'stone', ASHLAR, 256, x0 + (side === 'L' ? 0 : 97), eave);
    rectP(g, x0, eave, w, ground - eave);
    shadeLin(g, 0, eave, 0, ground, [[0, 'rgba(0,0,0,0.42)'], [0.15, 'rgba(0,0,0,0.14)'], [1, 'rgba(0,0,0,0.38)']]);
    if (q.model >= 1) weatherField(g, q, x0, eave, w, ground - eave, seed + 7, ground, 1.5);
    // 中央凸出的山墙开间（bay）：略亮的墙面 + 右侧投影 + 自己的尖顶山墙
    var bcx = WING_COLS[side][WING_BAY[side]], bw = 132, bx0 = bcx - bw / 2;
    K.poly(g, [bx0 - 6, eave + 2, bcx, eave - 120, bx0 + bw + 6, eave + 2]);
    mat(g, q, '#3e3c47', 'stone', ASHLAR, 256, bx0, eave);
    K.poly(g, [bx0 - 6, eave + 2, bcx, eave - 120, bx0 + bw + 6, eave + 2]); fillP(g, K.lin(g, bx0, 0, bx0 + bw, 0, ['rgba(230,230,245,0.1)', 'rgba(0,0,0,0.3)']));
    g.strokeStyle = '#2a2932'; g.lineWidth = 10; g.lineCap = 'butt'; g.beginPath(); g.moveTo(bx0 - 14, eave + 8); g.lineTo(bcx, eave - 128); g.lineTo(bx0 + bw + 14, eave + 8); g.stroke(); g.lineCap = 'round';
    K.poly(g, [bcx - 4, eave - 126, bcx, eave - 150, bcx + 4, eave - 126]); fillP(g, '#2a2932');
    K.ellipse(g, bcx, eave - 52, 16, 16); fillP(g, '#1a1920'); K.ellipse(g, bcx, eave - 52, 11, 11); fillP(g, '#3a3a48');
    rectP(g, bx0, eave, bw, ground - eave);
    mat(g, q, '#3e3c47', 'stone', ASHLAR, 256, bx0 + 40, eave);
    rectP(g, bx0, eave, bw, ground - eave); fillP(g, K.lin(g, bx0, 0, bx0 + bw, 0, ['rgba(230,230,245,0.12)', 'rgba(230,230,245,0.03)', 'rgba(0,0,0,0.25)']));
    if (q.light >= 1) { g.fillStyle = K.lin(g, bx0 + bw, 0, bx0 + bw + 26, 0, ['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']); g.fillRect(bx0 + bw, eave, 26, ground - eave); }
    // 檐口与层间腰线（带受光上缘与下方投影）
    g.fillStyle = '#56535f'; g.fillRect(x0, eave - 4, w, 14);
    g.fillStyle = 'rgba(220,220,235,0.16)'; g.fillRect(x0, eave - 4, w, 2);
    if (q.light >= 1) { g.fillStyle = K.lin(g, 0, eave + 10, 0, eave + 26, ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)']); g.fillRect(x0, eave + 10, w, 16); }
    for (var f = 1; f < 3; f++) {
      var by = WING_FLOORS[f] - 26;
      g.fillStyle = '#504d59'; g.fillRect(x0, by, w, 9); g.fillStyle = 'rgba(220,220,235,0.12)'; g.fillRect(x0, by, w, 1.5);
      if (q.light >= 1) { g.fillStyle = K.lin(g, 0, by + 9, 0, by + 20, ['rgba(0,0,0,0.4)', 'rgba(0,0,0,0)']); g.fillRect(x0, by + 9, w, 11); }
    }
    // 勒脚（较深的基座石）
    rectP(g, x0, ground - 46, w, 46); fillP(g, 'rgba(10,10,14,0.35)'); g.fillStyle = '#4a4752'; g.fillRect(x0, ground - 48, w, 4);
    // 窗
    var wins = wingWindows(x0, x1, side);
    for (var k = 0; k < wins.length; k++) deepWin(g, q, wins[k], past);
    // 雨水管（带铁卡箍与锈痕）
    var pipes = side === 'L' ? [x0 + 238, x0 + 622] : [x1 - 586, x1 - 186];
    for (var pI = 0; pI < pipes.length; pI++) {
      var ppx = pipes[pI];
      rectP(g, ppx - 5, eave + 8, 10, ground - eave - 8); fillP(g, K.lin(g, ppx - 5, 0, ppx + 5, 0, ['#4a4850', '#26252a', '#121116']));
      g.fillStyle = '#18171c'; g.fillRect(ppx - 12, eave + 2, 24, 10); K.poly(g, [ppx - 5, ground - 4, ppx + 5, ground - 4, ppx + 14, ground, ppx - 2, ground]); g.fill();
      for (var cI = eave + 60; cI < ground - 20; cI += 120) g.fillRect(ppx - 7, cI, 14, 4);
      if (q.model >= 1) { g.fillStyle = K.lin(g, 0, eave + 20, 0, ground, ['rgba(90,50,28,0.35)', 'rgba(90,50,28,0)']); g.fillRect(ppx + 5, eave + 20, 10, ground - eave - 20); }
    }
    // 常春藤
    var i;
    if (q.model >= 1) {
      var ivx = side === 'L' ? x0 + 40 : x1 - 260, ivw = 220;
      for (i = 0; i < K.byModel(q, 0, 40, 90); i++) {
        var iy = ground - Math.pow(r(), 0.7) * (past ? 260 : 380), ix = ivx + r() * ivw * (1 - (ground - iy) / 500);
        K.ellipse(g, ix, iy, r.range(8, 20), r.range(6, 14)); g.fillStyle = r() < 0.6 ? '#1f2a22' : '#2f3e32'; g.fill();
      }
    }
    // 墙脚灌木
    for (i = 0; i < K.byModel(q, 6, 10, 16); i++) canopy(g, q, x0 + r() * w, ground - r.range(0, 12), r.range(30, 60), r.range(18, 30), past ? '#243026' : '#202820', past ? '#3e5040' : '#36443a', r, 6);
    // 空气透视
    rectP(g, x0, ridgeY - 100, w, ground - ridgeY + 100); fillP(g, K.lin(g, 0, ridgeY, 0, ground, [K.rgba(SKY.hor, 0.12), K.rgba(SKY.hor, 0.04)]));
    if (q.light >= 1) K.ao(g, x0, ground - 60, w, 60, 50, 0.35, 'b');
  }
  function drawCyTower(g, q, past) {
    var cx = 944, x0 = 772, x1 = 1116, w = x1 - x0, ground = 692, balY = 70;
    // 屋顶（被画面上缘裁掉）
    var rp = [x0 - 8, balY - 34, cx, -260, x1 + 8, balY - 34];
    slateRoof(g, q, rp, x0 - 8, -40, x1 + 8, balY - 34, '#2a2934', 121);
    K.poly(g, rp); shadeLin(g, x0, 0, x1, 0, [[0, 'rgba(210,210,230,0.12)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.4)']]);
    // 塔身
    rectP(g, x0, balY, w, ground - balY);
    mat(g, q, '#383641', 'stone', ASHLAR, 256, x0 + 30, balY);
    if (q.model >= 1) { rectP(g, x0, balY, w, ground - balY); g.save(); g.clip(); weatherField(g, q, x0, balY, w, ground - balY, 129, ground, 0.9); g.restore(); }
    rectP(g, x0, balY, w, ground - balY);
    shadeLin(g, x0, 0, x1, 0, [[0, 'rgba(225,225,245,0.16)'], [0.4, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.45)']]);
    // 转角隅石
    for (var y = balY + 20; y < ground; y += 44) {
      var qw = (y / 44 | 0) % 2 ? 34 : 22;
      rectP(g, x0, y, qw, 40); fillP(g, '#56535f'); rectP(g, x1 - qw, y, qw, 40); fillP(g, '#44414d');
    }
    // 瞭望台与栏杆
    rectP(g, x0 - 40, balY - 4, w + 80, 22); fillP(g, K.lin(g, 0, balY - 4, 0, balY + 18, ['#7c7986', '#3a3842']));
    // 托架
    for (var cb = x0 - 30; cb < x1 + 30; cb += 30) { K.poly(g, [cb, balY + 18, cb + 18, balY + 18, cb + 12, balY + 36, cb + 6, balY + 36]); fillP(g, '#3e3c46'); }
    if (q.light >= 1) { g.fillStyle = K.lin(g, 0, balY + 18, 0, balY + 60, ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)']); g.fillRect(x0, balY + 18, w, 42); }
    g.strokeStyle = past ? '#4a3a2a' : '#1c1a20'; g.lineWidth = past ? 5 : 3.5; g.beginPath();
    for (var px = x0 - 36; px <= x1 + 36; px += past ? 22 : 16) { g.moveTo(px, balY - 4); g.lineTo(px, balY - 38); }
    g.moveTo(x0 - 40, balY - 38); g.lineTo(x1 + 40, balY - 38); g.moveTo(x0 - 40, balY - 22); g.lineTo(x1 + 40, balY - 22); g.stroke();
    // 铁环（缆索终点）
    g.strokeStyle = '#2a2628'; g.lineWidth = 5; K.ellipse(g, 746, 62, 10, 10); g.stroke();
    if (q.light >= 2) { g.beginPath(); g.arc(746, 62, 10, PI * 1.1, PI * 1.7); strokeP(g, 'rgba(210,210,230,0.5)', 1.5); }
    // 钟面
    var ccy = 200, R = 86;
    K.ellipse(g, cx, ccy, R + 18, R + 18); fillP(g, K.lin(g, cx - R, ccy - R, cx + R, ccy + R, ['#6a6672', '#3a3842']));
    K.ellipse(g, cx, ccy, R + 6, R + 6); fillP(g, K.lin(g, cx - R, ccy - R, cx + R, ccy + R, ['#b08a4a', '#6a4c24']));
    K.ellipse(g, cx, ccy, R, R); fillP(g, K.rad(g, cx - 20, ccy - 24, 4, R * 1.1, ['#e4dcc6', '#cbc1a8', '#9c927a']));
    if (q.tex > 0) { K.ellipse(g, cx, ccy, R, R); texFill(g, q, 'paper', { c1: '#000000', c2: '#ffffff', seed: 19 }, 128, 0, 0, 0.1, null, null, null, 'overlay'); }
    g.strokeStyle = '#2a2420'; g.lineWidth = 2; K.ellipse(g, cx, ccy, R - 14, R - 14); g.stroke();
    for (var k = 0; k < 60; k++) {
      var a = k * PI / 30, big = k % 5 === 0, r0 = big ? R - 26 : R - 18;
      K.line(g, cx + Math.cos(a) * r0, ccy + Math.sin(a) * r0, cx + Math.cos(a) * (R - 8), ccy + Math.sin(a) * (R - 8), big ? 4 : 1.2, '#2a2420');
    }
    // 指针（9:12 左右）
    function hand(ang, len, wd) {
      g.save(); g.translate(cx, ccy); g.rotate(ang);
      g.beginPath(); g.moveTo(-wd, 10); g.lineTo(-wd * 0.6, -len * 0.7); g.lineTo(0, -len); g.lineTo(wd * 0.6, -len * 0.7); g.lineTo(wd, 10); g.closePath();
      g.fillStyle = '#1c1714'; g.fill();
      K.ellipse(g, 0, -len * 0.62, wd * 1.4, wd * 2.2); g.fill();
      g.restore();
    }
    hand(-PI / 2 + 0.25 * 0.0 + (9.2 / 12) * TAU, 50, 5);
    hand((12 / 60) * TAU, 72, 3.5);
    K.ellipse(g, cx, ccy, 6, 6); fillP(g, '#8a6a3a');
    if (q.light >= 1) { K.ellipse(g, cx, ccy, R, R); fillP(g, K.lin(g, cx - R, ccy - R, cx + R * 0.4, ccy + R, ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.25)'])); }
    if (q.light >= 2) { g.beginPath(); g.arc(cx, ccy, R + 5, PI * 1.05, PI * 1.55); strokeP(g, 'rgba(255,230,180,0.5)', 2); }
    // 腰线
    function band(y) { g.fillStyle = '#5a5763'; g.fillRect(x0 - 10, y, w + 20, 14); if (q.light >= 1) { g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(x0, y + 14, w, 9); g.fillStyle = 'rgba(230,230,245,0.18)'; g.fillRect(x0 - 10, y, w + 20, 2); } }
    band(318); band(526);
    // 三楼书斋窗
    gothicWin(g, q, 888, 386, 112, 118, { frame: '#6c6874', sky: '#9696aa', mullion: '#1e1c22' });
    // 二楼固定窗（细长）
    gothicWin(g, q, 930, 548, 28, 40, { frame: '#5e5a66', tracery: false });
    // 一楼入口（尖拱木门）
    archPath(g, 896, 600, 96, 92); fillP(g, '#55525e');
    archPath(g, 906, 612, 76, 80); mat(g, q, '#3a2a20', 'wood', { c1: '#24180f', c2: '#4a3220', gap: '#140c08', planks: 4, dir: 'v', seed: 15 }, 96, 906, 600);
    if (q.model >= 1) { g.fillStyle = '#1a1614'; for (var st = 0; st < 3; st++) for (var sx = 0; sx < 4; sx++) { K.ellipse(g, 916 + sx * 19, 640 + st * 18, 2.2, 2.2); g.fill(); } }
    // 门边的壁灯
    g.fillStyle = '#1e1c20'; g.fillRect(1002, 612, 16, 6); K.rr(g, 1008, 618, 14, 22, 3); g.fillStyle = '#ffd08a'; g.fill();
    if (q.light >= 1) K.glow(g, 1015, 630, 60, '#ffb35c', 0.35);
    // 窗台下的雨水污渍（柔和）
    if (q.model >= 1) { g.fillStyle = K.lin(g, 0, 512, 0, 600, ['rgba(8,8,12,0.3)', 'rgba(8,8,12,0)']); g.fillRect(884, 512, 120, 88); }
    if (q.light >= 1) K.ao(g, x0, ground - 50, w, 50, 40, 0.4, 'b');
  }
  function drawCyGround(g, q, past) {
    var y0 = 692, yh = 560, vx = 944;
    K.poly(g, [0, y0, W, y0, W, H, 0, H]); fillP(g, '#45444e');
    if (q.tex > 0) { K.poly(g, [0, y0, W, y0, W, H, 0, H]); texFill(g, q, 'noise', GRAIN, 128, 0, y0, 0.25, 1, 1, null, 'overlay'); }
    g.save(); K.poly(g, [0, y0, W, y0, W, H, 0, H]); g.clip();
    pavePersp(g, q, { y0: y0, yh: yh, vx: vx, cw: 64, dz: 0.068, seed: past ? 131 : 133, moss: past ? 'rgba(60,76,48,0.35)' : 'rgba(62,78,46,0.6)' });
    g.restore();
    K.poly(g, [0, y0, W, y0, W, H, 0, H]);
    shadeLin(g, 0, y0, 0, H, [[0, 'rgba(14,14,22,0.45)'], [0.35, 'rgba(14,14,22,0.12)'], [1, 'rgba(14,14,22,0.35)']]);
    var r = RNG(past ? 131 : 133);
    if (q.model >= 1 && !past) grassTufts(g, q, r, K.byModel(q, 0, 30, 60), 0, y0 + 20, W, H - y0 - 20, 'rgba(70,86,56,0.8)', 16);
    // 水洼：倒映暗色的楼墙、亮窗与塔
    var pud = [[980, 770, 150], [560, 968, 200], [1240, 1012, 170], [170, 900, 110]];
    for (var i = 0; i < pud.length; i++) {
      var px = pud[i][0], py = pud[i][1], pw = pud[i][2], ph = pw * (0.07 + (py - y0) * 0.0004);
      K.ellipse(g, px, py, pw * 1.06, ph * 1.3); fillP(g, 'rgba(20,20,28,0.25)');
      g.save(); K.ellipse(g, px, py, pw, ph); g.clip();
      g.fillStyle = K.lin(g, 0, py - ph, 0, py + ph, ['#2c2c38', '#3e3e4e', '#5c5c70']); g.fillRect(px - pw, py - ph, pw * 2, ph * 2);
      if (q.light >= 1) {
        for (var li = 0; li < CY_LIT.length; li++) {
          var lx = CY_LIT[li][0];
          if (Math.abs(lx - px) < pw) { g.fillStyle = K.lin(g, 0, py - ph, 0, py + ph, ['rgba(255,190,110,0.5)', 'rgba(255,190,110,0)']); g.fillRect(lx - 10, py - ph, 20, ph * 2); }
        }
        if (Math.abs(px - 944) < pw + 172) { g.fillStyle = 'rgba(14,14,20,0.45)'; g.fillRect(Math.max(px - pw, 772), py - ph, Math.min(px + pw, 1116) - Math.max(px - pw, 772), ph * 2); }
      }
      if (q.light >= 2) { g.fillStyle = 'rgba(220,222,240,0.3)'; g.fillRect(px - pw * 0.7, py + ph * 0.45, pw * 1.1, 1.5); g.fillRect(px - pw * 0.3, py - ph * 0.2, pw * 0.5, 1); }
      g.restore();
    }
    // 远处与墙脚的 AO
    if (q.light >= 1) { g.fillStyle = K.lin(g, 0, y0, 0, y0 + 40, ['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']); g.fillRect(0, y0, W, 40); }
  }
  // 温室（废墟 / 完好）
  function drawGreenhouse(g, q, past) {
    var x0 = 1360, x1 = 1872, eave = 566, apexY = 474, base = 744, bot = 800, cx = (x0 + x1) / 2, r = RNG(past ? 141 : 143);
    if (q.light >= 1) K.contact(g, cx + 20, bot, (x1 - x0) * 0.6, 22, 0.5);
    var frame = past ? '#d8d6cc' : '#3a3530', frameHi = past ? '#ffffff' : '#6a5a4a';
    var body = [x0, eave, cx, apexY, x1, eave, x1, base, x0, base];
    // 内部（植物）
    K.poly(g, body); fillP(g, K.lin(g, 0, apexY, 0, base, past ? ['#3a4a3c', '#2a3a2e', '#1e2a22'] : ['#24262a', '#1c1d20', '#141516']));
    g.save(); K.poly(g, body); g.clip();
    for (var i = 0; i < K.byModel(q, 8, 16, 26); i++) {
      var px = x0 + r() * (x1 - x0), py = base - r.range(10, 120);
      if (past) canopy(g, q, px, py, r.range(26, 50), r.range(20, 40), '#2e4a30', '#4e7048', r, 6);
      else { g.strokeStyle = r() < 0.5 ? 'rgba(90,80,56,0.8)' : 'rgba(60,70,50,0.8)'; g.lineWidth = 1.5; g.beginPath(); for (var st = 0; st < 6; st++) { var sx = px + r.range(-20, 20); g.moveTo(sx, base); g.quadraticCurveTo(sx + r.range(-10, 10), base - 60, sx + r.range(-30, 30), base - r.range(60, 170)); } g.stroke(); }
    }
    if (past) for (i = 0; i < 30; i++) { K.ellipse(g, x0 + r() * (x1 - x0), base - r.range(20, 110), 5, 4); fillP(g, r() < 0.5 ? '#d86a7a' : '#e8d070', 0.85); }
    // 台架与花盆
    g.fillStyle = past ? '#4a3a2a' : '#2a2420'; g.fillRect(x0 + 10, base - 40, x1 - x0 - 20, 8);
    for (i = 0; i < 9; i++) { var fx = x0 + 30 + i * 56; K.poly(g, [fx, base - 56, fx + 24, base - 56, fx + 20, base - 40, fx + 4, base - 40]); fillP(g, past ? '#a0583a' : '#5a3a2a'); }
    g.restore();
    // 玻璃格
    var cols = 12, gw = (x1 - x0) / cols, rows = [eave, eave + 90, base];
    for (var cI = 0; cI < cols; cI++) {
      for (var rI = 0; rI < 2; rI++) {
        var gx = x0 + cI * gw, gy = rows[rI], gh = rows[rI + 1] - rows[rI];
        paneGlass(g, q, gx + 2, gy + 2, gw - 4, gh - 4, past, r, cI + rI * 13);
      }
    }
    // 山墙三角形的玻璃
    var gcols = 8;
    for (i = 0; i < gcols; i++) {
      var ax = x0 + (x1 - x0) * i / gcols, bx2 = x0 + (x1 - x0) * (i + 1) / gcols;
      var ay = eave - (eave - apexY) * (1 - Math.abs(ax - cx) / (cx - x0)), by = eave - (eave - apexY) * (1 - Math.abs(bx2 - cx) / (cx - x0));
      g.save(); K.poly(g, [ax + 2, ay + 3, bx2 - 2, by + 3, bx2 - 2, eave - 2, ax + 2, eave - 2]); g.clip();
      paneGlass(g, q, ax, Math.min(ay, by), bx2 - ax, eave - Math.min(ay, by), past, r, 40 + i);
      g.restore();
    }
    // 铁/木框
    g.strokeStyle = frame; g.lineWidth = 5; g.lineCap = 'butt';
    g.beginPath();
    for (cI = 0; cI <= cols; cI++) { var lx = x0 + cI * gw; g.moveTo(lx, base); g.lineTo(lx, eave - (eave - apexY) * Math.max(0, 1 - Math.abs(lx - cx) / (cx - x0))); }
    g.moveTo(x0, eave + 90); g.lineTo(x1, eave + 90); g.moveTo(x0, eave); g.lineTo(x1, eave);
    g.moveTo(x0 - 8, eave + 4); g.lineTo(cx, apexY - 4); g.lineTo(x1 + 8, eave + 4);
    g.stroke();
    if (q.light >= 1) { g.strokeStyle = K.rgba(frameHi, 0.35); g.lineWidth = 1.5; g.beginPath(); for (cI = 0; cI <= cols; cI++) { var hx = x0 + cI * gw - 1.5; g.moveTo(hx, base); g.lineTo(hx, eave + 2); } g.stroke(); }
    g.lineCap = 'round';
    // 顶上的装饰脊饰
    K.poly(g, [cx - 6, apexY - 2, cx, apexY - 30, cx + 6, apexY - 2]); fillP(g, frame);
    // 中央门
    rectP(g, cx - 38, eave + 60, 76, base - eave - 60); g.strokeStyle = frame; g.lineWidth = 6; g.stroke();
    // 砖砌基座
    rectP(g, x0 - 6, base, x1 - x0 + 12, bot - base);
    mat(g, q, '#5a3a30', 'brick', { c1: '#3e2622', c2: '#6a4236', mortar: '#2a2220', seed: 7 }, 128, x0, base);
    rectP(g, x0 - 6, base, x1 - x0 + 12, bot - base); shadeLin(g, 0, base, 0, bot, [[0, 'rgba(0,0,0,0.1)'], [1, 'rgba(0,0,0,0.45)']]);
    g.fillStyle = past ? '#8a8690' : '#5a5862'; g.fillRect(x0 - 10, base - 4, x1 - x0 + 20, 8);
    if (!past) {
      // 爬藤与从破窗伸出的杂草，锈迹
      for (i = 0; i < K.byModel(q, 4, 10, 18); i++) { var vx = x0 + r() * (x1 - x0); canopy(g, q, vx, base - r.range(0, 40), r.range(14, 30), r.range(10, 20), '#26302a', '#3a4a3e', r, 4); }
      g.strokeStyle = 'rgba(48,60,44,0.85)'; g.lineWidth = 2; g.beginPath();
      for (i = 0; i < K.byModel(q, 3, 6, 10); i++) { var tx = x0 + r() * (x1 - x0), ty = base; g.moveTo(tx, ty); for (var s2 = 0; s2 < 6; s2++) { tx += r.range(-14, 14); ty -= r.range(14, 30); g.lineTo(tx, ty); } }
      g.stroke();
      for (i = 0; i < K.byModel(q, 6, 12, 20); i++) { g.fillStyle = K.rgba('#7a4024', r.range(0.3, 0.6)); g.fillRect(x0 + r() * (x1 - x0), eave + r() * 160, 4, r.range(8, 30)); }
    } else if (q.light >= 2) {
      // 玻璃的整体反光
      g.save(); g.globalCompositeOperation = 'lighter';
      K.poly(g, body); g.clip();
      for (i = 0; i < 4; i++) { var sx0 = x0 + 60 + i * 130; K.poly(g, [sx0, base, sx0 + 40, base, sx0 + 140, eave - 60, sx0 + 100, eave - 60]); g.fillStyle = 'rgba(255,255,255,0.07)'; g.fill(); }
      g.restore();
      K.glow(g, x0 + 120, eave + 30, 90, '#fff4dc', 0.25);
    }
  }
  function paneGlass(g, q, x, y, w, h, past, r, idx) {
    var broken = !past && ((idx * 37 + 11) % 5 < 2 || (idx * 13) % 7 === 3);
    if (broken) {
      // 残留的碎玻璃尖角
      if (q.model >= 1) {
        var n = 1 + (idx % 3);
        for (var k = 0; k < n; k++) {
          var ex = k % 2 ? x + w : x, ey = y + r.range(0, h * 0.7);
          K.poly(g, [ex, ey, ex, ey + r.range(20, 50), ex + (k % 2 ? -1 : 1) * r.range(8, w * 0.7), ey + r.range(5, 30)]);
          fillP(g, 'rgba(160,165,185,0.35)');
          strokeP(g, 'rgba(230,230,245,0.4)', 1);
        }
      }
      return;
    }
    rectP(g, x, y, w, h);
    g.fillStyle = K.lin(g, x, y, x + w * 0.3, y + h, past ? ['rgba(200,205,225,0.55)', 'rgba(150,160,180,0.3)', 'rgba(120,130,150,0.22)'] : ['rgba(150,150,165,0.45)', 'rgba(90,90,105,0.35)', 'rgba(60,60,70,0.3)']);
    g.fill();
    if (!past) {
      // 污垢与裂纹
      rectP(g, x, y, w, h); fillP(g, K.lin(g, 0, y, 0, y + h, ['rgba(60,56,44,0)', 'rgba(60,56,44,0.3)']));
      if ((idx * 7) % 4 === 1) {
        var cxp = x + w * r.range(0.3, 0.7), cyp = y + h * r.range(0.3, 0.7);
        g.beginPath(); for (var c2 = 0; c2 < 5; c2++) { var a = r() * TAU; g.moveTo(cxp, cyp); g.lineTo(cxp + Math.cos(a) * w, cyp + Math.sin(a) * h * 0.6); }
        strokeP(g, 'rgba(220,220,235,0.45)', 1);
      }
    } else if (q.light >= 1) {
      g.beginPath(); g.moveTo(x + w * 0.2, y + h); g.lineTo(x + w * 0.55, y); g.lineTo(x + w * 0.75, y); g.lineTo(x + w * 0.4, y + h); g.closePath(); fillP(g, 'rgba(255,255,255,0.16)');
    }
  }
  function drawFountain(g, q, past) {
    var cx = 384, by = 846, rx = 168, ry = 40, wallH = 40;
    if (q.light >= 1) K.contact(g, cx + 14, by + wallH + 4, rx * 1.15, ry * 0.8, 0.6);
    // 外池壁
    g.beginPath(); ellArc(g, cx, by, rx, ry, 0, 0, PI); g.lineTo(cx - rx, by - 0); g.closePath();
    g.beginPath(); g.moveTo(cx - rx, by); ellArc(g, cx, by, rx, ry, 0, PI, 0, true); g.lineTo(cx + rx, by + wallH); ellArc(g, cx, by + wallH, rx, ry, 0, 0, PI); g.closePath();
    mat(g, q, '#5c5a64', 'stone', STEP_STONE, 128, 0, by);
    g.beginPath(); g.moveTo(cx - rx, by); ellArc(g, cx, by, rx, ry, 0, PI, 0, true); g.lineTo(cx + rx, by + wallH); ellArc(g, cx, by + wallH, rx, ry, 0, 0, PI); g.closePath();
    shadeLin(g, cx - rx, 0, cx + rx, 0, [[0, 'rgba(230,230,245,0.12)'], [0.5, 'rgba(0,0,0,0.1)'], [1, 'rgba(0,0,0,0.5)']]);
    // 池沿与水面
    K.ellipse(g, cx, by, rx, ry); fillP(g, '#77747f');
    K.ellipse(g, cx, by + 2, rx - 14, ry - 8);
    fillP(g, K.lin(g, 0, by - ry, 0, by + ry, past ? ['#8a8ca0', '#4a5060'] : ['#4a4e52', '#26302a']));
    if (!past && q.model >= 1) { var r = RNG(151); for (var i = 0; i < 12; i++) { K.ellipse(g, cx + r.range(-130, 130), by + r.range(-20, 24), r.range(4, 12), r.range(2, 4)); fillP(g, r() < 0.5 ? 'rgba(80,90,50,0.7)' : 'rgba(110,80,40,0.7)'); } }
    if (q.light >= 2) { K.ellipse(g, cx - 40, by - 8, 70, 5); fillP(g, 'rgba(220,220,235,0.2)'); }
    // 中心柱与上层水盘
    rectP(g, cx - 16, by - 92, 32, 92); fillP(g, K.lin(g, cx - 16, 0, cx + 16, 0, ['#8a8792', '#5a5862', '#34323a']));
    g.beginPath(); ellArc(g, cx, by - 92, 74, 16, 0, 0, PI); g.lineTo(cx - 60, by - 112); g.lineTo(cx + 60, by - 112); g.closePath();
    g.beginPath(); g.moveTo(cx - 74, by - 96); g.quadraticCurveTo(cx, by - 50, cx + 74, by - 96); g.closePath(); fillP(g, K.lin(g, cx - 74, 0, cx + 74, 0, ['#8a8792', '#55525d', '#33313a']));
    K.ellipse(g, cx, by - 96, 74, 15); fillP(g, '#7a7782');
    K.ellipse(g, cx, by - 95, 64, 11); fillP(g, past ? '#7a8094' : '#3c4440');
    // 顶上的乌鸦石像
    var sx = cx, sy = by - 104;
    rectP(g, sx - 10, sy - 26, 20, 26); fillP(g, '#5a5862');
    g.save(); g.translate(sx, sy - 26);
    K.path(g, 'M-26 0 C-24 -14 -14 -28 2 -32 C8 -40 18 -42 24 -38 L34 -36 L24 -32 C26 -24 22 -14 14 -8 L18 0 Z');
    fillP(g, K.lin(g, -26, -40, 26, 0, ['#5e5c66', '#2e2c34']));
    if (q.light >= 1) { K.path(g, 'M-26 0 C-24 -14 -14 -28 2 -32 C8 -40 18 -42 24 -38'); strokeP(g, 'rgba(210,210,230,0.35)', 2); }
    g.restore();
    // 青苔与水渍
    if (!past && q.model >= 1) { g.save(); g.beginPath(); g.moveTo(cx - rx, by); ellArc(g, cx, by, rx, ry, 0, PI, 0, true); g.lineTo(cx + rx, by + wallH); ellArc(g, cx, by + wallH, rx, ry, 0, 0, PI); g.closePath(); g.clip(); for (var m = 0; m < 10; m++) K.blob(g, cx + (m - 5) * 34, by + wallH, 26, '#3a4a30', 0.5); g.restore(); }
    // 往日：流水
    if (past) {
      g.strokeStyle = 'rgba(210,220,235,0.6)'; g.lineWidth = 2;
      g.beginPath();
      for (var f = 0; f < 9; f++) { var fx = cx - 60 + f * 15; g.moveTo(fx, by - 92); g.quadraticCurveTo(fx + (fx - cx) * 0.2, by - 60, fx + (fx - cx) * 0.35, by - 4); }
      g.stroke();
      g.strokeStyle = 'rgba(220,228,240,0.45)'; g.lineWidth = 1.5;
      for (var rI = 1; rI < 4; rI++) { K.ellipse(g, cx, by + 2, 70 + rI * 24, 10 + rI * 6); g.stroke(); }
      if (q.light >= 2) K.glow(g, cx, by - 40, 80, '#dfe8f0', 0.15);
    }
  }
  function drawEasel(g, q, x, y) {
    if (q.light >= 1) K.contact(g, x + 8, y, 74, 14, 0.6);
    var wood = '#6a4a2e', dark = '#3a2618';
    g.lineCap = 'butt';
    K.line(g, x + 4, y - 200, x + 18, y + 4, 7, dark);              // 后腿
    K.line(g, x - 6, y - 210, x - 52, y, 8, wood); K.line(g, x + 6, y - 210, x + 52, y, 8, wood);
    K.line(g, x - 7, y - 211, x - 53, y - 1, 2, 'rgba(255,220,180,0.25)');
    K.line(g, x - 40, y - 96, x + 40, y - 96, 8, wood);               // 托架
    // 画布：画中是夜色里的塔与月
    var cx0 = x - 56, cy0 = y - 196, cw = 112, chh = 96;
    rectP(g, cx0 - 4, cy0 - 4, cw + 8, chh + 8); fillP(g, '#d8d0bc');
    rectP(g, cx0, cy0, cw, chh); fillP(g, K.lin(g, 0, cy0, 0, cy0 + chh, ['#2a3050', '#4a4a6a', '#2a2a3a']));
    K.ellipse(g, cx0 + 82, cy0 + 24, 12, 12); fillP(g, '#e8e0c0');
    g.fillStyle = '#14141e'; g.fillRect(cx0 + 36, cy0 + 30, 16, 66); K.poly(g, [cx0 + 32, cy0 + 30, cx0 + 44, cy0 + 10, cx0 + 56, cy0 + 30]); g.fill();
    g.fillRect(cx0, cy0 + 78, cw, 18);
    if (q.model >= 1) { g.strokeStyle = 'rgba(200,180,140,0.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx0 + 10, cy0 + 70); g.quadraticCurveTo(cx0 + 50, cy0 + 60, cx0 + 100, cy0 + 72); g.stroke(); }
    K.line(g, x - 2, y - 214, x - 2, cy0 - 4, 6, wood);
    rectP(g, cx0 - 6, cy0 + chh + 4, cw + 12, 6); fillP(g, dark);
    // 颜料箱
    K.rr(g, x + 26, y - 18, 46, 18, 2); fillP(g, '#5a3a22');
    g.fillStyle = '#c8b070'; g.fillRect(x + 30, y - 22, 6, 4); g.fillStyle = '#a03a3a'; g.fillRect(x + 40, y - 22, 6, 4); g.fillStyle = '#3a5aa0'; g.fillRect(x + 50, y - 22, 6, 4);
    g.lineCap = 'round';
  }
  function drawWheelbarrow(g, q, x, y) {
    if (q.light >= 1) K.contact(g, x, y, 70, 12, 0.55);
    K.line(g, x - 50, y - 50, x - 70, y - 20, 5, '#3a2a1a'); K.line(g, x + 20, y - 40, x + 30, y, 5, '#3a2a1a');
    K.poly(g, [x - 56, y - 86, x + 52, y - 86, x + 40, y - 40, x - 46, y - 40]); fillP(g, K.lin(g, 0, y - 86, 0, y - 40, ['#7a6a5a', '#4a3e34']));
    K.ellipse(g, x - 60, y - 22, 22, 22); g.strokeStyle = '#2a2018'; g.lineWidth = 6; g.stroke();
    K.line(g, x + 40, y - 80, x + 90, y - 110, 6, '#5a4028');
    for (var i = 0; i < 4; i++) { var fx = x - 40 + i * 24; K.poly(g, [fx, y - 110, fx + 20, y - 110, fx + 16, y - 88, fx + 4, y - 88]); fillP(g, '#a0583a'); canopy(g, q, fx + 10, y - 116, 14, 10, '#3a5a34', '#5a8048', RNG(i + 3), 4); K.ellipse(g, fx + 10, y - 122, 4, 4); fillP(g, i % 2 ? '#e07080' : '#f0d070'); }
  }
  function drawBench(g, q, x, y, past) {
    if (q.light >= 1) K.contact(g, x + 10, y + 2, 170, 16, 0.6);
    var iron = '#1e1c22', wood = past ? '#7a5a3a' : '#4e3e30';
    // 腿与扶手（铸铁卷花）
    g.strokeStyle = iron; g.lineWidth = 7;
    g.beginPath(); g.moveTo(x - 130, y); g.quadraticCurveTo(x - 140, y - 30, x - 128, y - 50); g.moveTo(x + 130, y); g.quadraticCurveTo(x + 140, y - 30, x + 128, y - 50); g.stroke();
    g.beginPath(); g.moveTo(x - 140, y - 56); g.quadraticCurveTo(x - 154, y - 80, x - 136, y - 92); g.moveTo(x + 140, y - 56); g.quadraticCurveTo(x + 154, y - 80, x + 136, y - 92); g.stroke();
    g.lineWidth = 4; g.beginPath(); g.arc(x - 146, y - 80, 8, 0, TAU); g.moveTo(x + 154, y - 80); g.arc(x + 146, y - 80, 8, 0, TAU); g.stroke();
    // 靠背板条
    for (var i = 0; i < 3; i++) { rectP(g, x - 132, y - 100 + i * 14, 264, 10); fillP(g, K.lin(g, 0, y - 100 + i * 14, 0, y - 90 + i * 14, [K.shade(wood, 0.1), K.shade(wood, -0.3)])); }
    // 座面板条
    for (i = 0; i < 2; i++) { rectP(g, x - 140, y - 56 + i * 9, 280, 8); fillP(g, K.lin(g, 0, y - 56 + i * 9, 0, y - 48 + i * 9, [K.shade(wood, 0.15), K.shade(wood, -0.3)])); }
    if (q.light >= 2 && !past) { g.fillStyle = 'rgba(210,210,230,0.25)'; g.fillRect(x - 120, y - 56, 200, 1.5); }
    if (!past && q.model >= 1) { K.blob(g, x - 100, y - 54, 16, '#3a4a30', 0.4); }
  }
  DM.HDBG.def('courtyard', {
    outdoor: true,
    draw: function (g, q, v) { drawCourtyard(g, q, v); },
    lights: function (v) {
      var L = [];
      for (var i = 0; i < CY_LIT.length; i++) L.push({ x: CY_LIT[i][0], y: CY_LIT[i][1] + 10, r: 80, color: v === 'past' ? '#ffd28a' : '#ffbe6a', i: 0.45, flicker: 0.03, kind: 'window' });
      L.push({ x: 1015, y: 630, r: 70, color: '#ffb35c', i: 0.5, flicker: 0.05, kind: 'lamp' });
      return L;
    },
    key: function (v) { return { x: -0.45, color: v === 'past' ? '#e4dccc' : '#d2d4e2', amb: '#383a50', rim: 0.35 }; }
  });


  /* =================================================================
   * 鸦天狗神社 shrine
   * ================================================================= */
  var SH_GAP = [350, 120];
  var HALL_WOOD = { c1: '#2a1c16', c2: '#4e3628', gap: '#170e0a', planks: 3, dir: 'v', ring: 2, seed: 71 };
  var GRAVEL = { c1: '#3a3940', c2: '#6c6a72', scale: 48, oct: 2, seed: 75, contrast: 1.6 };
  function drawShrine(g, q) {
    sky(g, q, { y: 0, h: 600, seed: 53, gx: SH_GAP[0] / W, gy: SH_GAP[1] / 600, gw: 0.13 });
    godRays(g, q, SH_GAP[0], SH_GAP[1] + 50, 600, 7, 67, 0.035, 0.5, 120);
    crows(g, q, 71, 8, 1100, 30, 600, 140, 1.0, '#25232f');
    // 杉林（三层，远处偏蓝偏亮）
    var r = RNG(301);
    var layers = [['#4a4f5e', 0.55, 220, 300, null, null], ['#323842', 0.8, 160, 380, '#3c4450', 'rgba(20,24,30,0.35)'], ['#1f2428', 1, 110, 460, '#323c40', 'rgba(8,10,12,0.45)']];
    for (var L = 0; L < 3; L++) {
      var col = layers[L][0], sc = layers[L][1], n = K.byModel(q, 14, 22, 34) - L * 4;
      for (var i = 0; i < n; i++) {
        var tx = (i + r.range(-0.4, 0.4)) / n * 2000 - 40, th = layers[L][3] + r.range(-40, 80);
        if (L === 2 && tx > 760 && tx < 1600) continue;
        cedar(g, q, tx, 660 - L * 10 + r.range(0, 20), th * sc + 120, col, layers[L][4], r, layers[L][5]);
      }
      g.fillStyle = col; g.fillRect(0, 600 - L * 20, W, 80);
      if (L < 2) haze(g, 0, 100, W, 560, SKY.hor, 0.16 - L * 0.06, 0.05);
    }
    // 地面（砂砾）
    rectP(g, 0, 640, W, H - 640);
    mat(g, q, '#545258', 'noise', GRAVEL, 128, 0, 640, null, 1, 0.6);
    rectP(g, 0, 640, W, H - 640); shadeLin(g, 0, 640, 0, H, [[0, 'rgba(10,12,16,0.5)'], [0.3, 'rgba(10,12,16,0.15)'], [1, 'rgba(10,12,16,0.3)']]);
    // 参道石板
    var yh = 520;
    K.poly(g, [1130, 672, 1238, 672, 1500, H, 760, H]); fillP(g, '#64626c');
    if (q.tex > 0) { K.poly(g, [1130, 672, 1238, 672, 1500, H, 760, H]); texFill(g, q, 'noise', GRAIN, 128, 0, 0, 0.25, 1, 1, null, 'overlay'); }
    g.save(); K.poly(g, [1130, 672, 1238, 672, 1500, H, 760, H]); g.clip();
    pavePersp(g, q, { y0: 672, yh: 600, vx: 1184, cw: 54, dz: 0.11, seed: 391, moss: 'rgba(60,76,46,0.5)' });
    g.restore();
    K.poly(g, [1130, 672, 1238, 672, 1500, H, 760, H]); fillP(g, K.lin(g, 0, 672, 0, H, ['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.05)']));
    drawCableAnchor(g, q);
    drawHall(g, q);
    drawKura(g, q);
    drawTorii(g, q);
    drawToro(g, q, 590, 742, 1);
    drawToro(g, q, 1660, 860, 1.15);
    drawPond(g, q);
    drawShrineSteps(g, q);
    // 前景两侧杉树干
    for (i = 1; i < 2; i++) {
      var fx = i ? 1890 : -10, fw = 70;
      rectP(g, fx - fw / 2, 0, fw, H); mat(g, q, '#2a2018', 'bark', { c1: '#16100c', c2: '#4a3a2c', seed: 47 }, 128, fx, 0);
      rectP(g, fx - fw / 2, 0, fw, H); shadeLin(g, fx - fw / 2, 0, fx + fw / 2, 0, [[0, 'rgba(200,200,220,0.12)'], [0.5, 'rgba(0,0,0,0.1)'], [1, 'rgba(0,0,0,0.6)']]);
    }
    K.vignette(g, W, H, q.light >= 1 ? 0.5 : 0.35, 0.45);
  }
  function drawCableAnchor(g, q) {
    var px = 712, top = 92, ground = 668;
    if (q.light >= 1) K.contact(g, px + 10, ground, 80, 12, 0.55);
    // 缆索：从滑轮伸向画面右上方（远方的塔）
    g.beginPath(); g.moveTo(px + 6, top + 4); g.quadraticCurveTo(1300, 40, 1930, 8); strokeP(g, 'rgba(14,12,18,0.92)', 2.6);
    // 斜撑
    g.lineCap = 'butt';
    K.line(g, px - 70, ground, px - 6, 300, 12, '#3a2a1e'); K.line(g, px + 70, ground, px + 6, 300, 12, '#2a1e16');
    K.line(g, px - 50, 520, px + 50, 520, 9, '#33251a');
    // 主柱
    rectP(g, px - 14, top, 28, ground - top);
    mat(g, q, '#4a3626', 'wood', { c1: '#2a1c12', c2: '#5a4230', gap: '#1a100a', planks: 1, dir: 'v', ring: 3, seed: 81 }, 96, px - 14, 0);
    rectP(g, px - 14, top, 28, ground - top); shadeLin(g, px - 14, 0, px + 14, 0, [[0, 'rgba(255,230,210,0.18)'], [0.4, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.55)']]);
    // 平台与栏杆
    rectP(g, 638, 204, 150, 14); fillP(g, K.lin(g, 0, 204, 0, 218, ['#6a5240', '#2e2016']));
    K.line(g, 646, 218, px - 10, 260, 7, '#33251a'); K.line(g, 780, 218, px + 10, 260, 7, '#33251a');
    g.strokeStyle = '#3a2a1e'; g.lineWidth = 4; g.beginPath();
    for (var x = 642; x <= 786; x += 24) { g.moveTo(x, 204); g.lineTo(x, 172); }
    g.moveTo(640, 172); g.lineTo(788, 172); g.stroke();
    // 铁箍与滑轮
    g.fillStyle = '#2a2628'; g.fillRect(px - 16, 140, 32, 7); g.fillRect(px - 16, 240, 32, 7);
    K.ellipse(g, px, top + 4, 26, 26); fillP(g, '#2a2628');
    K.ellipse(g, px, top + 4, 19, 19); fillP(g, K.rad(g, px - 6, top - 2, 2, 22, ['#6a6670', '#2a2830']));
    g.strokeStyle = '#1a181c'; g.lineWidth = 3; g.beginPath();
    for (var k = 0; k < 6; k++) { var a = k * PI / 3; g.moveTo(px, top + 4); g.lineTo(px + Math.cos(a) * 17, top + 4 + Math.sin(a) * 17); }
    g.stroke();
    K.ellipse(g, px, top + 4, 5, 5); fillP(g, '#8a7a5a');
    if (q.light >= 2) { g.beginPath(); g.arc(px, top + 4, 25, PI * 1.05, PI * 1.6); strokeP(g, 'rgba(220,220,240,0.45)', 1.6); }
    // 锈水痕
    g.fillStyle = K.lin(g, 0, 147, 0, 230, ['rgba(110,58,30,0.5)', 'rgba(110,58,30,0)']); g.fillRect(px - 6, 147, 5, 83);
    // 白纸垂（祭礼用）
    g.lineCap = 'round';
    shide(g, px + 18, 210, 0.8);
  }
  function shide(g, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s);
    K.poly(g, [0, 0, 10, 0, 10, 12, 4, 12, 4, 26, 12, 26, 12, 40, 6, 40, 6, 52, 0, 52, 0, 40, -2, 40]); fillP(g, '#e8e4da');
    g.restore();
  }
  function drawHall(g, q) {
    var x0 = 820, x1 = 1548, cx = (x0 + x1) / 2, eave = 404, floor = 606, base = 668;
    if (q.light >= 1) K.contact(g, cx, base + 4, 420, 20, 0.55);
    // 石基
    rectP(g, x0 - 20, floor + 20, x1 - x0 + 40, base - floor - 20);
    mat(g, q, '#5a5862', 'stone', QUAY_STONE, 128, 0, floor);
    rectP(g, x0 - 20, floor + 20, x1 - x0 + 40, base - floor - 20); fillP(g, K.lin(g, 0, floor + 20, 0, base, ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.5)']));
    // 墙体与格子门
    rectP(g, x0, eave, x1 - x0, floor - eave + 20);
    mat(g, q, '#3a281e', 'wood', HALL_WOOD, 128, x0, 0);
    rectP(g, x0, eave, x1 - x0, floor - eave + 20); fillP(g, 'rgba(0,0,0,0.25)');
    // 上部白壁（长押之上）
    rectP(g, x0, eave + 10, x1 - x0, 46); fillP(g, '#c8c2b4');
    if (q.tex > 0) { rectP(g, x0, eave + 10, x1 - x0, 46); texFill(g, q, 'plaster', { c1: '#000000', c2: '#ffffff', seed: 11, stain: 0.6 }, 128, 0, 0, 0.18, null, null, null, 'overlay'); }
    rectP(g, x0, eave + 10, x1 - x0, 46); fillP(g, K.lin(g, 0, eave + 10, 0, eave + 56, ['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.25)']));
    g.fillStyle = '#2a1c14'; g.fillRect(x0, eave + 54, x1 - x0, 12);
    // 柱子
    var cols = 7, cw = (x1 - x0) / (cols - 1);
    for (var i = 0; i < cols; i++) {
      var px = x0 + i * cw;
      // 格子门（柱间）
      if (i < cols - 1) {
        var lx = px + 14, lw = cw - 28, ly = eave + 70, lh = floor - eave - 74;
        rectP(g, lx, ly, lw, lh); fillP(g, '#120c0a');
        if (i === 2 || i === 3) { g.fillStyle = 'rgba(60,40,24,0.6)'; g.fillRect(lx, ly, lw, lh); }
        g.strokeStyle = '#4a3424'; g.lineWidth = 3; g.beginPath();
        var gs = K.byModel(q, 22, 16, 12);
        for (var gx = lx; gx <= lx + lw; gx += gs) { g.moveTo(gx, ly); g.lineTo(gx, ly + lh); }
        for (var gy = ly; gy <= ly + lh; gy += gs) { g.moveTo(lx, gy); g.lineTo(lx + lw, gy); }
        g.stroke();
        if (q.light >= 1) K.ao(g, lx, ly, lw, lh, 20, 0.5, 't');
      }
      rectP(g, px - 12, eave, 24, floor - eave + 20);
      fillP(g, K.lin(g, px - 12, 0, px + 12, 0, ['#6a3426', '#4a2218', '#24100a']));
    }
    // 回廊与栏杆
    rectP(g, x0 - 30, floor, x1 - x0 + 60, 20); fillP(g, K.lin(g, 0, floor, 0, floor + 20, ['#5a4232', '#2a1c14']));
    g.strokeStyle = '#3a2418'; g.lineWidth = 5; g.beginPath(); g.moveTo(x0 - 30, floor - 30); g.lineTo(cx - 90, floor - 30); g.moveTo(cx + 90, floor - 30); g.lineTo(x1 + 30, floor - 30);
    for (var bx = x0 - 30; bx <= x1 + 30; bx += 40) { if (Math.abs(bx - cx) < 90) continue; g.moveTo(bx, floor); g.lineTo(bx, floor - 30); }
    g.stroke();
    // 木阶
    for (var st = 0; st < 4; st++) { rectP(g, cx - 80 - st * 6, floor + st * 16, 160 + st * 12, 16); fillP(g, st % 2 ? '#4a3426' : '#5a4030'); g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(cx - 80 - st * 6, floor + st * 16 + 12, 160 + st * 12, 4); }
    // 赛钱箱
    rectP(g, cx - 54, floor - 50, 108, 50); mat(g, q, '#4a3020', 'wood', { c1: '#2a1a10', c2: '#5a3a24', gap: '#140c06', planks: 3, dir: 'h', seed: 83 }, 64, cx, floor);
    g.fillStyle = '#1a100a'; for (var sl = 0; sl < 6; sl++) g.fillRect(cx - 48 + sl * 17, floor - 50, 8, 10);
    // 屋顶（入母屋造）——主屋面
    var ex0 = 760, ex1 = 1608;
    var roof = 'M' + ex0 + ' ' + (eave + 6) + ' Q' + (ex0 + 40) + ' ' + (eave - 6) + ' ' + (ex0 + 110) + ' ' + (eave - 30) + ' L' + 960 + ' 300 L' + 1408 + ' 300 L' + (ex1 - 110) + ' ' + (eave - 30) + ' Q' + (ex1 - 40) + ' ' + (eave - 6) + ' ' + ex1 + ' ' + (eave + 6) + ' Z';
    K.path(g, roof);
    fillP(g, K.lin(g, 0, 300, 0, eave, ['#2e2e38', '#24242c', '#18181e']));
    // 瓦垄
    if (q.model >= 1) {
      g.save(); K.path(g, roof); g.clip();
      g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 2.5; g.beginPath();
      for (var ry = 0; ry <= 40; ry++) { var tt = ry / 40, ax = lerp(960, ex0 + 80, 0) + (1408 - 960) * tt, axb = lerp(ex0 + 30, ex1 - 30, tt); g.moveTo(ax, 300); g.lineTo(axb, eave); }
      g.stroke();
      g.strokeStyle = 'rgba(200,200,220,0.08)'; g.lineWidth = 1.5; g.beginPath();
      for (ry = 0; ry <= 40; ry++) { var t2 = (ry + 0.5) / 40; g.moveTo(960 + 448 * t2, 300); g.lineTo(lerp(ex0 + 30, ex1 - 30, t2), eave); }
      g.stroke();
      if (q.light >= 2) { g.fillStyle = K.lin(g, 0, 300, 0, eave, ['rgba(200,200,225,0.14)', 'rgba(200,200,225,0)']); g.fillRect(ex0, 300, ex1 - ex0, 60); }
      g.restore();
    }
    // 屋檐厚度（暗）与檐下阴影
    g.beginPath(); g.moveTo(ex0, eave + 6); g.quadraticCurveTo(ex0 + 40, eave - 6, ex0 + 110, eave - 30); g.lineTo(ex1 - 110, eave - 30); g.quadraticCurveTo(ex1 - 40, eave - 6, ex1, eave + 6);
    g.lineTo(ex1, eave + 16); g.quadraticCurveTo(ex1 - 40, eave + 6, ex1 - 110, eave - 14); g.lineTo(ex0 + 110, eave - 14); g.quadraticCurveTo(ex0 + 40, eave + 6, ex0, eave + 16); g.closePath();
    fillP(g, '#3a2a20');
    if (q.light >= 1) { g.fillStyle = K.lin(g, 0, eave, 0, eave + 70, ['rgba(0,0,0,0.65)', 'rgba(0,0,0,0)']); g.fillRect(x0, eave, x1 - x0, 70); }
    // 上层：山墙（妻）与千木
    var gx0 = 1060, gx1 = 1308, gtop = 210, gbot = 300;
    K.poly(g, [gx0, gbot, cx, gtop, gx1, gbot]); mat(g, q, '#3a281e', 'wood', HALL_WOOD, 96, gx0, 0);
    K.poly(g, [gx0, gbot, cx, gtop, gx1, gbot]); fillP(g, 'rgba(0,0,0,0.2)');
    g.strokeStyle = '#1e1e26'; g.lineWidth = 14; g.lineCap = 'butt'; g.beginPath(); g.moveTo(gx0 - 60, gbot + 14); g.lineTo(cx, gtop - 14); g.lineTo(gx1 + 60, gbot + 14); g.stroke();
    g.lineWidth = 9; g.beginPath(); g.moveTo(cx - 34, gtop - 40); g.lineTo(cx + 10, gtop + 6); g.moveTo(cx + 34, gtop - 40); g.lineTo(cx - 10, gtop + 6); g.stroke();   // 千木
    g.lineCap = 'round';
    // 鸦天狗纹章
    K.ellipse(g, cx, gtop + 50, 26, 26); fillP(g, '#b8963e');
    K.ellipse(g, cx, gtop + 50, 21, 21); fillP(g, '#1e1a16');
    crowFly(g, cx, gtop + 52, 1.2, '#c8a64a', false);
    // 唐破风（向拜）
    var pr = 'M1060 466 Q1120 436 1184 404 Q1248 436 1308 466 L1300 474 Q1246 448 1184 418 Q1122 448 1068 474 Z';
    K.path(g, pr); fillP(g, '#2a2a32');
    // 注连绳与纸垂、铃
    g.beginPath(); g.moveTo(1080, 482); g.quadraticCurveTo(cx, 520, 1288, 482);
    g.strokeStyle = '#8a7a4a'; g.lineWidth = 14; g.stroke(); g.strokeStyle = '#b8a670'; g.lineWidth = 7; g.stroke();
    if (q.model >= 1) { g.strokeStyle = 'rgba(80,66,36,0.7)'; g.lineWidth = 1.5; g.beginPath(); for (var tw = 0; tw < 30; tw++) { var tt2 = tw / 30, xx = lerp(1080, 1288, tt2), yy = 482 + Math.sin(tt2 * PI) * 19; g.moveTo(xx - 4, yy - 6); g.lineTo(xx + 4, yy + 6); } g.stroke(); }
    for (i = 0; i < 4; i++) shide(g, 1110 + i * 50, 490 + Math.sin((i + 0.5) / 4 * PI) * 16, 0.7);
    K.ellipse(g, cx, 520, 16, 16); fillP(g, K.rad(g, cx - 5, 514, 2, 18, ['#f0d890', '#a07a2a', '#5a4214']));
    g.strokeStyle = '#c8303a'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx, 536); g.lineTo(cx, floor - 54); g.stroke();
    g.strokeStyle = '#eee8dc'; g.lineWidth = 3; g.setLineDash && g.setLineDash([8, 8]); g.beginPath(); g.moveTo(cx, 536); g.lineTo(cx, floor - 54); g.stroke(); g.setLineDash && g.setLineDash([]);
    // 提灯
    lantern(g, q, 1000, 470); lantern(g, q, 1368, 470);
  }
  function lantern(g, q, x, y) {
    g.strokeStyle = '#1a1414'; g.lineWidth = 2; K.line(g, x, y - 30, x, y - 4, 2, '#1a1414');
    g.fillStyle = '#1e1816'; g.fillRect(x - 16, y - 6, 32, 7); g.fillRect(x - 16, y + 50, 32, 7);
    K.ellipse(g, x, y + 25, 22, 28); fillP(g, K.rad(g, x - 6, y + 18, 3, 30, ['#ffe6b0', '#f0a050', '#b04a2a']));
    if (q.model >= 1) { g.strokeStyle = 'rgba(120,40,20,0.4)'; g.lineWidth = 1.2; for (var k = 0; k < 5; k++) { K.ellipse(g, x, y + 25, 22, 28 - k * 0); g.beginPath(); g.moveTo(x - 21, y + 8 + k * 8); g.quadraticCurveTo(x, y + 10 + k * 8, x + 21, y + 8 + k * 8); g.stroke(); } }
    if (q.light >= 1) K.glow(g, x, y + 25, 90, '#ffa850', 0.35);
  }
  function drawKura(g, q) {
    var x0 = 1612, x1 = 1876, top = 430, low = 640, base = 760, cx = (x0 + x1) / 2;
    if (q.light >= 1) K.contact(g, cx, base, 170, 14, 0.55);
    // 屋顶（切妻，正面看山墙）
    K.poly(g, [x0 - 30, top + 6, cx, 372, x1 + 30, top + 6, x1 + 30, top + 18, cx, 386, x0 - 30, top + 18]); fillP(g, '#26262e');
    // 白壁山墙与墙身
    var wall = [x0, top + 14, cx, 390, x1, top + 14, x1, low, x0, low];
    K.poly(g, wall); fillP(g, '#bdb6a6');
    if (q.tex > 0) { K.poly(g, wall); texFill(g, q, 'plaster', { c1: '#000000', c2: '#ffffff', seed: 12, stain: 0.8 }, 192, 0, 0, 0.3, null, null, null, 'overlay'); }
    K.poly(g, wall); fillP(g, K.lin(g, x0, 0, x1, 0, ['rgba(255,250,240,0.05)', 'rgba(0,0,0,0.25)']));
    // 霉斑与雨痕
    var r = RNG(311);
    for (var i = 0; i < K.byModel(q, 3, 6, 9); i++) { var sx = x0 + r() * (x1 - x0), sl = r.range(40, 160); g.fillStyle = K.lin(g, 0, top + 20, 0, top + 20 + sl, [[0, 'rgba(50,50,46,0.22)'], [1, 'rgba(50,50,46,0)']]); g.fillRect(sx, top + 20, r.range(10, 30), sl); }
    // 海鼠壁（下部黑白格）
    rectP(g, x0, low, x1 - x0, base - low - 20); fillP(g, '#2a2a30');
    if (q.model >= 1) {
      g.strokeStyle = 'rgba(210,206,196,0.75)'; g.lineWidth = 4; g.beginPath();
      for (var d = -10; d < 14; d++) { var dx = x0 + d * 26; g.moveTo(dx, low); g.lineTo(dx + 100, base - 20); g.moveTo(dx + 100, low); g.lineTo(dx, base - 20); }
      g.save(); rectP(g, x0, low, x1 - x0, base - low - 20); g.clip(); g.stroke(); g.restore();
    }
    rectP(g, x0 - 8, base - 22, x1 - x0 + 16, 22); fillP(g, '#5a5862');
    // 高窗（铁格）
    rectP(g, cx - 22, 444, 44, 34); fillP(g, '#141214');
    g.strokeStyle = '#3a3638'; g.lineWidth = 3; g.beginPath(); for (var b = 0; b < 4; b++) { g.moveTo(cx - 16 + b * 11, 444); g.lineTo(cx - 16 + b * 11, 478); } g.stroke();
    // 厚重的土藏门
    rectP(g, cx - 54, 520, 108, base - 22 - 520); fillP(g, '#a8a090');
    rectP(g, cx - 46, 528, 92, base - 30 - 528); fillP(g, K.lin(g, cx - 46, 0, cx + 46, 0, ['#4a3a2c', '#3a2c20']));
    g.fillStyle = '#16120e'; g.fillRect(cx - 1.5, 528, 3, base - 30 - 528);
    g.fillStyle = '#2a2420'; g.fillRect(cx - 40, 600, 80, 10);
    K.rr(g, cx - 10, 606, 20, 24, 3); g.fillStyle = '#6a5636'; g.fill();
    if (q.light >= 1) K.ao(g, cx - 46, 528, 92, base - 58, 18, 0.45, 'tl');
  }
  function drawTorii(g, q) {
    var red = '#b4442c', redD = '#6a2216', blk = '#1a1616', p1 = 188, p2 = 436, bot = 762;
    if (q.light >= 1) { K.contact(g, p1 + 6, bot, 46, 10, 0.6); K.contact(g, p2 + 6, bot, 46, 10, 0.6); }
    function pillar(x) {
      K.poly(g, [x - 20, 270, x + 20, 270, x + 24, bot - 50, x - 24, bot - 50]);
      fillP(g, K.lin(g, x - 24, 0, x + 24, 0, [K.shade(red, 0.12), red, redD]));
      if (q.tex > 0) { K.poly(g, [x - 20, 270, x + 20, 270, x + 24, bot - 50, x - 24, bot - 50]); texFill(g, q, 'plaster', { c1: '#000000', c2: '#ffffff', seed: 13, stain: 1 }, 96, 0, 0, 0.25, null, null, null, 'overlay'); }
      // 剥落的漆
      var r = RNG(x);
      for (var i = 0; i < K.byModel(q, 1, 3, 5); i++) { K.ellipse(g, x + r.range(-14, 14), r.range(320, 680), r.range(2, 5), r.range(5, 12)); fillP(g, 'rgba(70,40,30,0.35)'); }
      // 黑色根卷
      rectP(g, x - 27, bot - 54, 54, 54); fillP(g, K.lin(g, x - 27, 0, x + 27, 0, ['#3a3434', blk, '#0a0808']));
      g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x - 27, bot - 54, 54, 3);
    }
    pillar(p1); pillar(p2);
    // 贯
    rectP(g, 136, 262, 352, 24); fillP(g, K.lin(g, 0, 262, 0, 286, [K.shade(red, 0.1), redD]));
    // 额束与神额
    rectP(g, 302, 196, 20, 70); fillP(g, red);
    rectP(g, 284, 200, 56, 62); fillP(g, '#1e1a18');
    rectP(g, 290, 206, 44, 50); fillP(g, '#2e2824');
    if (q.model >= 1) { g.strokeStyle = 'rgba(200,170,90,0.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(312, 214); g.lineTo(312, 248); g.moveTo(302, 222); g.lineTo(322, 222); g.moveTo(304, 236); g.lineTo(320, 242); g.stroke(); }
    // 岛木与笠木（两端上翘）
    K.path(g, 'M118 196 L506 196 L500 214 L124 214 Z'); fillP(g, K.lin(g, 0, 196, 0, 214, [red, redD]));
    K.path(g, 'M96 150 Q110 168 150 170 L474 170 Q514 168 528 150 L522 176 Q500 194 470 194 L154 194 Q124 194 102 176 Z');
    fillP(g, K.lin(g, 0, 150, 0, 194, ['#3a3434', blk, '#050404']));
    if (q.light >= 1) { K.path(g, 'M96 150 Q110 168 150 170 L474 170 Q514 168 528 150'); strokeP(g, 'rgba(220,220,240,0.3)', 2); }
    // 乌鸦停在笠木上
    perchedCrow(g, 200, 168, 1.1, false); perchedCrow(g, 452, 168, 1, true);
  }
  function perchedCrow(g, x, y, s, flip) {
    g.save(); g.translate(x, y); g.scale(flip ? -s : s, s);
    K.path(g, 'M-14 0 C-16 -10 -12 -20 -2 -24 C2 -32 10 -34 14 -30 L22 -28 L14 -25 C16 -18 12 -8 6 -4 L-6 -2 L-20 4 Z');
    fillP(g, '#141218');
    g.fillStyle = '#141218'; g.fillRect(-2, -2, 2, 4); g.fillRect(3, -3, 2, 5);
    g.restore();
  }
  function drawToro(g, q, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s);
    if (q.light >= 1) K.contact(g, 6, 0, 46, 9, 0.55);
    var st = '#6a6872', sd = '#3a3842';
    rectP(g, -30, -16, 60, 16); fillP(g, K.lin(g, -30, 0, 30, 0, [st, sd]));
    rectP(g, -10, -96, 20, 82); fillP(g, K.lin(g, -10, 0, 10, 0, [st, sd]));
    rectP(g, -28, -112, 56, 16); fillP(g, K.lin(g, -28, 0, 28, 0, [st, sd]));
    rectP(g, -22, -156, 44, 44); fillP(g, K.lin(g, -22, 0, 22, 0, [st, sd]));
    rectP(g, -11, -146, 22, 22); fillP(g, '#1a1816');
    K.path(g, 'M-44 -156 Q-20 -164 0 -184 Q20 -164 44 -156 L38 -150 L-38 -150 Z'); fillP(g, K.lin(g, -44, 0, 44, 0, ['#7a7882', '#34323c']));
    K.ellipse(g, 0, -188, 7, 7); fillP(g, st);
    if (q.model >= 1) { K.blob(g, -14, -110, 18, '#3e4a30', 0.5); K.blob(g, 12, -150, 14, '#3e4a30', 0.4); }
    g.restore();
  }
  function drawPond(g, q) {
    var pts = [], cx = 1400, cy = 840, r = RNG(321);
    for (var i = 0; i < 16; i++) { var a = i / 16 * TAU, rr = r.range(0.85, 1.1); pts.push(cx + Math.cos(a) * 205 * rr, cy + Math.sin(a) * 58 * rr); }
    smoothPath(g, pts, true); fillP(g, '#26242a');
    g.save(); smoothPath(g, pts, true); g.clip();
    g.fillStyle = K.lin(g, 0, cy - 60, 0, cy + 60, ['#2e3440', '#5a6070', '#7a7e90']); g.fillRect(cx - 220, cy - 70, 440, 140);
    // 倒影：杉树暗影
    g.fillStyle = 'rgba(16,20,22,0.55)'; g.fillRect(cx - 220, cy - 70, 440, 40);
    if (q.model >= 1) { for (i = 0; i < 9; i++) { K.ellipse(g, cx + r.range(-160, 160), cy + r.range(-30, 40), r.range(10, 18), r.range(4, 6)); fillP(g, r() < 0.5 ? '#2e4430' : '#3a5434'); } }
    if (q.light >= 2) { g.fillStyle = 'rgba(230,230,245,0.25)'; g.fillRect(cx - 120, cy + 20, 160, 1.5); g.fillRect(cx - 60, cy + 34, 90, 1.2); }
    g.restore();
    smoothPath(g, pts, true); strokeP(g, 'rgba(10,10,14,0.6)', 4);
    // 池边石
    for (i = 0; i < 16; i += 1) {
      if (i > 3 && i < 13 && i % 2) continue;
      var a2 = i / 16 * TAU, bx = cx + Math.cos(a2) * 212, by = cy + Math.sin(a2) * 60;
      boulder(g, q, bx, by + 10, r.range(40, 70), r.range(22, 34), { seed: 330 + i, color: '#4a4852', wet: true, moss: '#3e4c32' });
    }
  }
  function drawShrineSteps(g, q) {
    var N = K.byModel(q, 6, 7, 8), steps = [], y = 762, i;
    function XL(yy) { return lerp(292, 196, (yy - 762) / 330); }
    function XR(yy) { return lerp(652, 748, (yy - 762) / 330); }
    var tot = 0; for (i = 0; i < N; i++) tot += lerp(0.55, 1.25, i / (N - 1));
    var unit = 346 / tot;
    for (i = 0; i < N; i++) {
      var p = lerp(0.55, 1.25, i / (N - 1)), td = unit * p * 0.55, rh = unit * p * 0.45, yf = y + td;
      steps.push({ xl: XL(yf), xr: XR(yf), y: yf, td: td, bl: XL(y), br: XR(y), rh: rh });
      y = yf + rh;
    }
    // 两侧的石砌袖墙（顶面受光，侧面有接缝）
    K.poly(g, [262, 752, 296, 752, 196, H, 140, H]); mat(g, q, '#4a4852', 'stone', QUAY_STONE, 128, 0, 0);
    K.poly(g, [262, 752, 296, 752, 196, H, 140, H]); fillP(g, K.lin(g, 140, 0, 296, 0, ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.4)']));
    K.poly(g, [648, 752, 682, 752, 812, H, 748, H]); mat(g, q, '#4a4852', 'stone', QUAY_STONE, 128, 0, 0);
    K.poly(g, [648, 752, 682, 752, 812, H, 748, H]); fillP(g, 'rgba(0,0,0,0.5)');
    g.fillStyle = 'rgba(210,210,225,0.25)'; K.poly(g, [262, 752, 296, 752, 292, 760, 258, 760]); g.fill(); K.poly(g, [648, 752, 682, 752, 686, 760, 652, 760]); g.fill();
    stairFlight(g, q, steps, { top: '#5c5a64', front: '#3c3a44', tex: STEP_ROCK, moss: 'rgba(66,88,50,0.6)', grass: 'rgba(80,96,60,0.85)', wet: true, edge: '#b8b6c4', seed: 2461 });
    if (q.light >= 1) { K.ao(g, 196, 762, 70, 330, 46, 0.4, 'l'); K.ao(g, 680, 762, 70, 330, 46, 0.35, 'r'); }
  }
  DM.HDBG.def('shrine', {
    outdoor: true,
    draw: function (g, q) { drawShrine(g, q); },
    lights: [
      { x: 1000, y: 495, r: 110, color: '#ffa850', i: 0.55, flicker: 0.12, kind: 'lamp' },
      { x: 1368, y: 495, r: 110, color: '#ffa850', i: 0.55, flicker: 0.12, kind: 'lamp' }
    ],
    key: { x: -0.5, color: '#d4d4e0', amb: '#343846', rim: 0.35 }
  });


  /* =================================================================
   * 船屋 boathouse（室内）
   * ================================================================= */
  var BH_WALL = { c1: '#241c17', c2: '#4a3c31', gap: '#0e0a08', planks: 6, dir: 'v', ring: 2.2, seed: 91 };
  var BH_FLOOR = { c1: '#2c241e', c2: '#54473b', gap: '#120d0a', planks: 1, dir: 'h', ring: 1.5, seed: 93 };
  function drawBoathouse(g, q) {
    var back = [520, 170, 880, 500], bx = 520, by = 170, bx1 = 1400, by1 = 670, vx = 960, vy = 420;
    var R = K.room(g, q, {
      back: back,
      wall: { fill: '#3a2f27', tex: ['wood', BH_WALL, 192] },
      side: { fill: '#30271f', tex: ['wood', BH_WALL, 192] },
      ceil: { fill: '#1a1512', tex: ['wood', { c1: '#16110e', c2: '#2e241c', gap: '#0a0706', planks: 4, dir: 'h', seed: 95 }, 192] }
    });
    // 天花椽条（朝消失点汇聚）
    g.strokeStyle = '#120e0b'; g.lineWidth = 16; g.lineCap = 'butt'; g.beginPath();
    for (var k = 0; k <= 8; k++) { var tx = bx + (bx1 - bx) * k / 8; g.moveTo(tx, by); g.lineTo(vx + (tx - vx) * 3.4, -40); }
    g.stroke();
    for (k = 1; k <= 3; k++) { var t = k / 4, yy = by * (1 - t); g.fillStyle = '#100c0a'; g.fillRect(bx * (1 - t) - 10, yy - 8, (bx1 + (W - bx1) * t) - bx * (1 - t) + 20, 18); }
    g.lineCap = 'round';
    // 后墙小窗（灰色天光）
    var wx = 900, wy = 226, ww = 120, wh = 96;
    rectP(g, wx, wy, ww, wh); fillP(g, K.lin(g, 0, wy, 0, wy + wh, ['#9a9aac', '#6c6e80']));
    g.strokeStyle = '#1e1813'; g.lineWidth = 8; g.strokeRect(wx, wy, ww, wh); K.line(g, wx + ww / 2, wy, wx + ww / 2, wy + wh, 6, '#1e1813'); K.line(g, wx, wy + wh / 2, wx + ww, wy + wh / 2, 6, '#1e1813');
    if (q.light >= 1) K.glow(g, wx + ww / 2, wy + wh / 2, 200, '#9aa4c0', 0.18);
    if (q.light >= 2) K.shaft(g, [wx, wy + 10, wx + ww, wy + 10, wx + ww + 120, 620, wx - 40, 620], '#b8c0d8', 0.07, wx + ww / 2, wy, wx + ww / 2, 620);
    // 后方平台（工作台所在）
    K.poly(g, [bx, by1, bx1, by1, bx1 + 40, 700, bx - 40, 700]); mat(g, q, '#3e332a', 'wood', BH_FLOOR, 128, 0, 0, null, 1, 0.4);
    K.poly(g, [bx, by1, bx1, by1, bx1 + 40, 700, bx - 40, 700]); fillP(g, 'rgba(0,0,0,0.35)');
    g.fillStyle = '#16110d'; g.fillRect(bx - 40, 700, bx1 - bx + 80, 12);
    // 挂钉板与工具
    drawPegTools(g, q, 760, 360, 400, 80);
    drawWorkbench(g, q, 720, 440, 480, 160);
    // 吊灯
    K.line(g, vx, by - 10, vx, 372, 2, '#1a1410');
    K.poly(g, [vx - 26, 386, vx + 26, 386, vx + 12, 370, vx - 12, 370]); fillP(g, '#2a2a2a');
    K.ellipse(g, vx, 392, 9, 9); fillP(g, '#fff0c8');
    if (q.light >= 1) { K.glow(g, vx, 392, 260, '#ffb860', 0.3); K.pool(g, vx, 470, 300, 60, '#ffb860', 0.16); K.glow(g, vx, 392, 40, '#fff4d8', 0.6); }
    // 地面：两侧走道 + 中间船坞水面
    drawBoathouseFloor(g, q, R);
    drawRowboat(g, q);
    drawRopesWall(g, q);
    drawTideTable(g, q);
    drawOars(g, q);
    drawKerosene(g, q, 96, 936);
    // 墙板缝透进来的光
    if (q.light >= 1) {
      g.save(); g.globalCompositeOperation = 'lighter';
      var r = RNG(941);
      for (k = 0; k < K.byModel(q, 4, 8, 12); k++) { var sx = r() < 0.5 ? r.range(30, 480) : r.range(1440, 1890), sy = r.range(80, 500); g.fillStyle = 'rgba(170,180,210,0.12)'; g.fillRect(sx, sy, 2, r.range(60, 200)); }
      g.restore();
    }
    // 水面反光在墙上的波纹
    if (q.light >= 2) {
      g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(170,190,220,0.07)'; g.lineWidth = 3;
      var rr = RNG(943);
      for (k = 0; k < 40; k++) { var cx = rr.range(560, 1360), cy = rr.range(470, 660), l = rr.range(20, 60); g.beginPath(); g.moveTo(cx - l, cy); g.quadraticCurveTo(cx, cy - 6, cx + l, cy + rr.range(-3, 3)); g.stroke(); }
      g.restore();
    }
    K.vignette(g, W, H, q.light >= 1 ? 0.6 : 0.45, 0.4);
  }
  function drawPegTools(g, q, x, y, w, h) {
    rectP(g, x, y, w, h); fillP(g, '#3a3026');
    if (q.model >= 1) { g.fillStyle = 'rgba(0,0,0,0.5)'; for (var i = 0; i < w; i += 20) for (var j = 8; j < h; j += 20) g.fillRect(x + i + 8, y + j, 3, 3); }
    // 锯、锤、扳手、钳子
    K.poly(g, [x + 30, y + 14, x + 130, y + 20, x + 130, y + 40, x + 30, y + 30]); fillP(g, K.lin(g, 0, y + 14, 0, y + 40, ['#a8a8b0', '#5a5a62']));
    rectP(g, x + 10, y + 12, 24, 22); fillP(g, '#6a4a2a');
    K.line(g, x + 170, y + 10, x + 170, y + 66, 6, '#6a4a2a'); rectP(g, x + 156, y + 8, 28, 12); fillP(g, '#3a3a40');
    K.line(g, x + 220, y + 12, x + 228, y + 68, 7, '#5a5a62');
    K.line(g, x + 270, y + 14, x + 262, y + 64, 5, '#4a4a52'); K.line(g, x + 280, y + 14, x + 290, y + 64, 5, '#4a4a52');
    K.ellipse(g, x + 340, y + 38, 22, 22); g.strokeStyle = '#8a7a5a'; g.lineWidth = 6; g.stroke();
    if (q.light >= 1) K.ao(g, x, y, w, h, 14, 0.4);
  }
  function drawWorkbench(g, q, x, y, w, h) {
    var top = y + 34;
    if (q.light >= 1) K.contact(g, x + w / 2, y + h - 2, w * 0.55, 14, 0.6);
    // 腿与下层横档
    g.fillStyle = '#2a2018'; g.fillRect(x + 16, top + 14, 18, h - 48); g.fillRect(x + w - 34, top + 14, 18, h - 48);
    g.fillRect(x + 16, y + h - 44, w - 32, 10);
    // 下层堆放的木箱
    rectP(g, x + 60, y + h - 90, 100, 46); fillP(g, '#4a3a2a'); rectP(g, x + 300, y + h - 80, 70, 36); fillP(g, '#3e3226');
    // 台面（看得到一点顶面）
    K.poly(g, [x - 6, top, x + w + 6, top, x + w + 14, top + 16, x - 14, top + 16]);
    mat(g, q, '#5a4836', 'wood', { c1: '#3a2a1c', c2: '#6e5640', gap: '#1e140c', planks: 3, dir: 'h', seed: 97 }, 128, x, top);
    rectP(g, x - 14, top + 16, w + 28, 14); fillP(g, K.lin(g, 0, top + 16, 0, top + 30, ['#4a3a2a', '#221810']));
    // 台上的物件：虎钳、油灯、罐子、渔网浮子
    rectP(g, x + 20, top - 28, 40, 28); fillP(g, '#3a3a44'); rectP(g, x + 14, top - 34, 52, 8); fillP(g, '#55555f');
    K.rr(g, x + 120, top - 40, 26, 40, 4); fillP(g, K.lin(g, x + 120, 0, x + 146, 0, ['#6a7a5a', '#3a4a30']));
    K.rr(g, x + 152, top - 30, 22, 30, 3); fillP(g, K.lin(g, x + 152, 0, x + 174, 0, ['#9a8a6a', '#5a4a30']));
    for (var i = 0; i < 4; i++) { K.ellipse(g, x + 230 + i * 26, top - 10, 11, 10); fillP(g, i % 2 ? '#c05a30' : '#d8c8a0'); }
    rectP(g, x + 360, top - 8, 90, 8); fillP(g, '#8a6a4a');
    if (q.light >= 1) { K.pool(g, x + w / 2, top + 4, w * 0.45, 18, '#ffb860', 0.16); }
  }
  function drawBoathouseFloor(g, q, R) {
    void R;
    var yb = 712, vx = 960, vy = 420;
    function at(x, y) { return vx + (x - vx) * (y - vy) / (yb - vy); }
    var wl0 = 600, wr0 = 1320;   // 水面在后缘的左右 x
    // 走道（左、右）
    var left = [-10, H, at(wl0, H), H, wl0, yb, 480, yb, 480, 700, -10, 700];
    var right = [at(wr0, H), H, W + 10, H, W + 10, 700, 1440, 700, 1440, yb, wr0, yb];
    var sides = [left, right];
    for (var s2 = 0; s2 < 2; s2++) {
      K.poly(g, sides[s2]); mat(g, q, '#3a3028', 'wood', BH_FLOOR, 160, 0, 0, null, 1, 0.5);
      K.poly(g, sides[s2]); fillP(g, K.lin(g, 0, 700, 0, H, ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.1)']));
    }
    // 走道木板缝（透视）
    g.strokeStyle = 'rgba(12,8,6,0.8)'; g.lineWidth = 2; g.beginPath();
    for (var k = 1; k < 12; k++) { var z = 1 - k * 0.07, y = vy + (yb - vy) / z; if (y > H) break; g.moveTo(-10, y); g.lineTo(at(wl0, y), y); g.moveTo(at(wr0, y), y); g.lineTo(W + 10, y); }
    g.stroke();
    // 水面
    var water = [wl0, yb, wr0, yb, at(wr0, H), H, at(wl0, H), H];
    K.poly(g, water); fillP(g, K.lin(g, 0, yb, 0, H, ['#121a20', '#1a2630', '#0e141a']));
    g.save(); K.poly(g, water); g.clip();
    // 灯与窗的倒影
    g.save(); g.globalCompositeOperation = 'lighter';
    g.fillStyle = K.lin(g, 0, yb, 0, H, ['rgba(255,180,100,0.25)', 'rgba(255,180,100,0)']); g.fillRect(vx - 30, yb, 60, H - yb);
    g.fillStyle = K.lin(g, 0, yb, 0, H, ['rgba(150,160,190,0.18)', 'rgba(150,160,190,0)']); g.fillRect(900, yb, 120, 300);
    g.restore();
    var r = RNG(951);
    g.strokeStyle = 'rgba(150,165,190,0.22)'; g.lineWidth = 2; g.beginPath();
    for (k = 0; k < K.byModel(q, 30, 60, 110); k++) { var rx = r.range(400, 1560), ry = yb + Math.pow(r(), 1.4) * (H - yb), rl = 10 + (ry - yb) * 0.15; g.moveTo(rx - rl, ry); g.quadraticCurveTo(rx, ry - 2, rx + rl, ry); }
    g.stroke();
    g.restore();
    // 走道边缘的木梁（受光边）
    K.line(g, wl0, yb, at(wl0, H), H, 10, '#1e1712'); K.line(g, wr0, yb, at(wr0, H), H, 10, '#1e1712');
    if (q.light >= 1) { K.line(g, wl0 - 4, yb, at(wl0 - 4, H), H, 2, 'rgba(255,200,150,0.18)'); K.line(g, wr0 + 4, yb, at(wr0 + 4, H), H, 2, 'rgba(255,200,150,0.12)'); }
    // 桩
    var piles = [[wl0, yb], [at(wl0, 860), 860], [wr0, yb], [at(wr0, 860), 860]];
    for (k = 0; k < piles.length; k++) { var pw = 10 + (piles[k][1] - yb) * 0.06; rectP(g, piles[k][0] - pw, piles[k][1] - 60 - pw * 2, pw * 2, 60 + pw * 2); fillP(g, K.lin(g, piles[k][0] - pw, 0, piles[k][0] + pw, 0, ['#4a3a2c', '#1e1610'])); }
  }
  function drawRowboat(g, q) {
    var x0 = 584, x1 = 1336, gun = 736, keel = 900, cx = (x0 + x1) / 2;
    // 倒影
    g.save(); g.globalAlpha = 0.35; K.path(g, 'M584 868 Q960 1010 1336 868 Z'); fillP(g, '#05070a'); g.restore();
    // 船内（从上方看到的内侧）
    K.path(g, 'M584 736 Q600 700 700 692 L1220 692 Q1320 700 1336 736 Q960 770 584 736 Z');
    fillP(g, K.lin(g, 0, 692, 0, 760, ['#4a3a2a', '#2a2018']));
    // 坐板
    for (var i = 0; i < 3; i++) { var sx = 760 + i * 200; rectP(g, sx, 700, 40, 46); fillP(g, K.lin(g, sx, 0, sx + 40, 0, ['#7a6248', '#4a3a28'])); }
    // 船舷外板（搭接式）
    var hull = 'M584 736 Q960 772 1336 736 Q1326 820 1250 870 Q960 920 670 870 Q594 820 584 736 Z';
    K.path(g, hull);
    mat(g, q, '#4a6a6a', 'wood', { c1: '#2a3a3c', c2: '#5a7474', gap: '#14201f', planks: 4, dir: 'h', ring: 1, seed: 99 }, 96, x0, gun);
    K.path(g, hull); fillP(g, K.lin(g, 0, gun, 0, keel, ['rgba(255,240,220,0.1)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.55)']));
    g.save(); K.path(g, hull); g.clip();
    g.strokeStyle = 'rgba(10,14,14,0.55)'; g.lineWidth = 2.5;
    for (i = 1; i < 5; i++) { g.beginPath(); g.moveTo(584, 736 + i * 22); g.quadraticCurveTo(960, 772 + i * 30, 1336, 736 + i * 22); g.stroke(); }
    // 剥落的油漆
    var r = RNG(961);
    for (i = 0; i < K.byModel(q, 4, 10, 18); i++) { K.ellipse(g, r.range(620, 1300), r.range(750, 880), r.range(6, 22), r.range(3, 8)); fillP(g, 'rgba(70,52,36,0.6)'); }
    // 吃水线青苔
    g.fillStyle = 'rgba(40,56,36,0.55)'; g.fillRect(560, 856, 800, 40);
    g.restore();
    // 船缘
    g.beginPath(); g.moveTo(584, 736); g.quadraticCurveTo(960, 772, 1336, 736); g.strokeStyle = '#2a2018'; g.lineWidth = 9; g.stroke();
    if (q.light >= 1) { g.beginPath(); g.moveTo(590, 732); g.quadraticCurveTo(960, 767, 1330, 732); strokeP(g, 'rgba(255,210,160,0.35)', 2); }
    // 系船绳
    g.beginPath(); g.moveTo(600, 738); g.quadraticCurveTo(560, 760, 520, 690); strokeP(g, '#8a7454', 4);
    // 水线的波纹
    g.beginPath(); g.moveTo(600, 872); g.quadraticCurveTo(960, 926, 1320, 872); strokeP(g, 'rgba(160,175,200,0.3)', 2);
  }
  // 左墙挂的绳索（在左侧墙面上，透视略压缩）
  function drawRopesWall(g, q) {
    var coils = [[170, 470, 70, 120], [300, 500, 54, 96]];
    for (var i = 0; i < coils.length; i++) {
      var c = coils[i];
      K.line(g, c[0], c[1] - c[3] * 0.62, c[0] + 4, c[1] - c[3] * 0.75, 6, '#1a1410');
      for (var k = 0; k < K.byModel(q, 4, 6, 9); k++) {
        K.ellipse(g, c[0] + k * 1.5, c[1] + k * 2, c[2] - k * 2, c[3] * 0.5 - k * 2);
        g.strokeStyle = '#5a4a32'; g.lineWidth = 8; g.stroke();
        g.strokeStyle = '#a89068'; g.lineWidth = 4; g.stroke();
      }
      // 垂下的绳头
      g.beginPath(); g.moveTo(c[0] - 10, c[1] + c[3] * 0.48); g.quadraticCurveTo(c[0] - 20, c[1] + c[3] * 0.9, c[0] - 4, c[1] + c[3] * 1.2); strokeP(g, '#a89068', 5);
    }
    // 渔网
    g.strokeStyle = 'rgba(120,110,90,0.55)'; g.lineWidth = 1.5; g.beginPath();
    for (var x = 110; x < 380; x += 16) { g.moveTo(x, 360); g.quadraticCurveTo(x + 10, 420, x + 4, 470); }
    for (var y = 370; y < 470; y += 16) { g.moveTo(110, y); g.lineTo(376, y + 10); }
    g.stroke();
    if (q.light >= 1) K.ao(g, 0, 0, 520, H, 120, 0.3, 'l');
  }
  function drawTideTable(g, q) {
    // 右墙上的潮汐表（仿射近似透视）
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0); g.restore();
    g.save(); g.translate(1520, 270); g.transform(1, -0.12, 0, 1, 0, 0);
    if (q.light >= 1) { g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(10, 12, 250, 236); }
    rectP(g, 0, 0, 250, 236); fillP(g, '#3a2c20');
    rectP(g, 12, 12, 226, 212); fillP(g, '#d6ccb2');
    if (q.tex > 0) { rectP(g, 12, 12, 226, 212); texFill(g, q, 'paper', { c1: '#000000', c2: '#ffffff', seed: 21 }, 128, 0, 0, 0.18, null, null, null, 'overlay'); }
    rectP(g, 22, 22, 206, 22); fillP(g, '#2a3a5a');
    g.strokeStyle = 'rgba(40,40,50,0.6)'; g.lineWidth = 1.5; g.beginPath();
    for (var i = 0; i < 9; i++) { g.moveTo(24, 58 + i * 18); g.lineTo(226, 58 + i * 18); }
    for (i = 0; i < 6; i++) { g.moveTo(24 + i * 40, 50); g.lineTo(24 + i * 40, 214); }
    g.stroke();
    g.beginPath(); for (var x = 0; x <= 200; x += 4) { var yy = 140 + Math.sin(x / 200 * TAU * 2 + 0.6) * 44; if (x === 0) g.moveTo(26 + x, yy); else g.lineTo(26 + x, yy); }
    strokeP(g, '#3a5a9a', 3);
    // 红圈标注
    K.ellipse(g, 120, 100, 14, 10); strokeP(g, '#b03030', 2.5);
    // 钉子与水渍
    g.fillStyle = '#2a2a2a'; K.ellipse(g, 125, 6, 4, 4); g.fill();
    rectP(g, 12, 170, 226, 54); fillP(g, 'rgba(120,100,60,0.18)');
    g.restore();
    if (q.light >= 1) K.pool(g, 1640, 380, 200, 160, '#ffb860', 0.05);
  }
  function drawOars(g, q) {
    // 两支桨搁在右墙的托架上，指向消失点
    var o = [[1800, 676, 1372, 600], [1790, 650, 1380, 586]];
    for (var i = 0; i < 2; i++) {
      var a = o[i], dx = a[2] - a[0], dy = a[3] - a[1], ln = Math.sqrt(dx * dx + dy * dy), ang = Math.atan2(dy, dx);
      g.save(); g.translate(a[0], a[1]); g.rotate(ang);
      if (q.light >= 1) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 8, ln, 6); }
      rectP(g, 0, -5, ln * 0.72, 10); fillP(g, K.lin(g, 0, -5, 0, 5, ['#b09070', '#6a5034']));
      K.path(g, 'M0 -5 L36 -18 L120 -16 L132 0 L120 16 L36 18 L0 5 Z', ln * 0.7, 0, 1, 1); fillP(g, K.lin(g, 0, -18, 0, 18, ['#c0a07a', '#7a5a3a', '#4a3420']));
      rectP(g, -16, -6, 30, 12); fillP(g, '#5a4028');
      g.restore();
    }
    g.fillStyle = '#1e1610'; g.fillRect(1500, 600, 12, 40); g.fillRect(1700, 620, 14, 46);
  }
  function drawKerosene(g, q, x, y) {
    var cans = [[x + 4, y - 4, 78, 118, '#8a2a20'], [x + 88, y + 2, 72, 104, '#7a3022'], [x + 40, y - 120, 66, 92, '#6a2a22']];
    for (var i = cans.length - 1; i >= 0; i--) {
      var c = cans[i], cx = c[0], cy = c[1], w = c[2], h = c[3];
      if (q.light >= 1 && i < 2) K.contact(g, cx + w / 2 + 6, cy, w * 0.7, 10, 0.6);
      K.rr(g, cx, cy - h, w, h, 6); fillP(g, K.lin(g, cx, 0, cx + w, 0, [K.shade(c[4], 0.25), c[4], K.shade(c[4], -0.5)]));
      // 压纹 X
      g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + 8, cy - h + 22); g.lineTo(cx + w - 8, cy - 10); g.moveTo(cx + w - 8, cy - h + 22); g.lineTo(cx + 8, cy - 10); g.stroke();
      // 提手与注口
      g.strokeStyle = '#2a2020'; g.lineWidth = 5; g.beginPath(); g.moveTo(cx + 10, cy - h); g.lineTo(cx + 14, cy - h - 12); g.lineTo(cx + w * 0.55, cy - h - 12); g.lineTo(cx + w * 0.6, cy - h); g.stroke();
      rectP(g, cx + w - 18, cy - h - 14, 10, 14); fillP(g, '#3a3030');
      // 锈与磨损
      var r = RNG(970 + i);
      for (var k = 0; k < K.byModel(q, 2, 5, 9); k++) { K.ellipse(g, cx + r.range(6, w - 6), cy - r.range(6, h - 6), r.range(2, 8), r.range(2, 6)); fillP(g, 'rgba(90,50,30,0.6)'); }
      if (q.light >= 2) { rectP(g, cx + 6, cy - h + 6, 3, h - 16); fillP(g, 'rgba(255,220,200,0.35)'); }
    }
  }
  DM.HDBG.def('boathouse', {
    outdoor: false,
    draw: function (g, q) { drawBoathouse(g, q); },
    lights: [
      { x: 960, y: 392, r: 220, color: '#ffb860', i: 0.6, flicker: 0.06, kind: 'lamp' },
      { x: 960, y: 274, r: 120, color: '#a8b4d0', i: 0.35, flicker: 0, kind: 'window' }
    ],
    key: { x: 0, color: '#ffcf96', amb: '#2a2830', rim: 0.4 }
  });


  /* =================================================================
   * 旧园丁小屋 hut（室内；+ past：九年前整洁、有人居住）
   * ================================================================= */
  var HUT_WALL = { c1: '#2a221c', c2: '#54463a', gap: '#0e0a08', planks: 5, dir: 'v', ring: 2.4, seed: 111 };
  var HUT_WALL_P = { c1: '#3e3024', c2: '#6e5a46', gap: '#1a120c', planks: 5, dir: 'v', ring: 2.4, seed: 111 };
  var HUT_FLOOR = { c1: '#2a221c', c2: '#5a4a3c', gap: '#100c09', planks: 1, dir: 'h', ring: 1.4, seed: 113 };
  function drawHut(g, q, v) {
    var past = v === 'past', bx = 90, by = 64, bx1 = 1830, by1 = 836, vx = 960, vy = 450;
    K.room(g, q, {
      back: [bx, by, bx1 - bx, by1 - by],
      wall: { fill: past ? '#4a3c30' : '#3a3029', tex: ['wood', past ? HUT_WALL_P : HUT_WALL, 256] },
      side: { fill: '#2a221c', tex: ['wood', past ? HUT_WALL_P : HUT_WALL, 192] },
      ceil: { fill: '#16110e' }
    });
    // 墙面的光照：窗户一侧更亮
    rectP(g, bx, by, bx1 - bx, by1 - by);
    fillP(g, K.rad(g, 1050, 260, 60, 1000, past ? ['rgba(255,220,170,0.1)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.35)'] : ['rgba(170,180,210,0.08)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.45)']));
    // 打破纹理重复：大块的明暗斑驳
    if (q.model >= 1) {
      var rv = RNG(past ? 1107 : 1109);
      g.save(); rectP(g, bx, by, bx1 - bx, by1 - by); g.clip();
      for (var b2 = 0; b2 < K.byModel(q, 0, 10, 18); b2++) K.blob(g, rv.range(bx, bx1), rv.range(by, by1), rv.range(120, 300), rv() < 0.6 ? '#000000' : (past ? '#8a6a48' : '#5a5048'), rv.range(0.1, 0.22));
      g.restore();
    }
    // 椽
    g.fillStyle = '#100c0a';
    for (var k = 0; k < 6; k++) { var rx = bx + (bx1 - bx) * (k + 0.5) / 6; K.poly(g, [rx - 14, by, rx + 14, by, vx + (rx + 14 - vx) * 1.4, 0, vx + (rx - 14 - vx) * 1.4, 0]); g.fill(); }
    g.fillRect(bx - 20, by - 10, bx1 - bx + 40, 22);
    var r = RNG(past ? 1101 : 1103);
    // 墙板缝漏光（现在）/ 墙上的日历与挂饰（过去）
    if (!past && q.light >= 1) {
      g.save(); g.globalCompositeOperation = 'lighter';
      for (k = 0; k < K.byModel(q, 4, 8, 14); k++) { g.fillStyle = 'rgba(160,170,200,0.12)'; g.fillRect(r.range(bx, bx1), r.range(by, 600), 2, r.range(40, 160)); }
      g.restore();
    }
    // 水渍、霉斑
    if (!past) {
      for (k = 0; k < K.byModel(q, 5, 10, 18); k++) { var sx = r.range(bx, bx1), sl = r.range(80, 400); g.fillStyle = K.lin(g, 0, by, 0, by + sl, [[0, 'rgba(8,6,4,0.4)'], [1, 'rgba(8,6,4,0)']]); g.fillRect(sx, by, r.range(14, 50), sl); }
    }
    drawHutFloor(g, q, past, by1);
    drawHutWindow(g, q, past);
    drawHutPhoto(g, q, past);
    drawHutTools(g, q, past);
    drawHutStove(g, q, past);
    drawHutTable(g, q, past);
    drawHutBed(g, q, past);
    drawHutBox(g, q, past);
    // 光：窗户照进来的光柱 + 浮尘
    if (q.light >= 2) {
      K.shaft(g, [930, 160, 1166, 160, 1340, 1000, 1000, 1000], past ? '#ffe8c0' : '#b8c4e0', past ? 0.08 : 0.1, 1048, 160, 1170, 1000);
      K.motes(g, RNG(1105), past ? 30 : 70, 960, 300, 360, 600, past ? '#ffe8c8' : '#d0d8f0', 0.35);
    }
    if (q.light >= 1) K.pool(g, 1170, 960, 260, 60, past ? '#ffe0b0' : '#a8b8d8', 0.1);
    if (past) {
      // 油灯与炉火的暖光
      if (q.light >= 1) { K.glow(g, 1030, 590, 260, '#ffb050', 0.3); K.glow(g, 528, 700, 200, '#ff8a3a', 0.25); }
    }
    // 蛛网（现在）
    if (!past && q.model >= 1) { cobweb(g, bx + 4, by + 16, 150, 1); cobweb(g, bx1 - 4, by + 16, 130, -1); }
    K.vignette(g, W, H, q.light >= 1 ? 0.62 : 0.45, 0.4);
  }
  function cobweb(g, x, y, R, dir) {
    g.save(); g.strokeStyle = 'rgba(200,200,210,0.22)'; g.lineWidth = 1;
    g.beginPath();
    for (var i = 0; i <= 5; i++) { var a = i / 5 * PI / 2; g.moveTo(x, y); g.lineTo(x + dir * Math.cos(a) * R, y + Math.sin(a) * R); }
    for (var k = 1; k <= 5; k++) { var rr = R * k / 5.5; g.moveTo(x + dir * rr, y); for (i = 1; i <= 5; i++) { var a2 = i / 5 * PI / 2, m = (i - 0.5) / 5 * PI / 2; g.quadraticCurveTo(x + dir * Math.cos(m) * rr * 0.8, y + Math.sin(m) * rr * 0.8, x + dir * Math.cos(a2) * rr, y + Math.sin(a2) * rr); } }
    g.stroke(); g.restore();
  }
  function drawHutFloor(g, q, past, by1) {
    var vx = 960, vy = 450;
    K.poly(g, [0, by1, W, by1, W, H, 0, H]);
    mat(g, q, '#3a3029', 'wood', HUT_FLOOR, 192, 0, by1, null, 1, 0.5);
    K.poly(g, [0, by1, W, by1, W, H, 0, H]); fillP(g, K.lin(g, 0, by1, 0, H, ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.3)']));
    g.strokeStyle = 'rgba(10,7,5,0.8)'; g.lineWidth = 2.2; g.beginPath();
    for (var c = -14; c <= 14; c++) { var bx = vx + c * 74; g.moveTo(bx, by1); g.lineTo(vx + (bx - vx) * (H - vy) / (by1 - vy), H); }
    g.stroke();
    var r = RNG(past ? 1111 : 1113);
    if (past) {
      // 编织地毯
      K.poly(g, [700, 900, 1220, 900, 1300, 1040, 620, 1040]); fillP(g, '#6a4a3a');
      K.poly(g, [716, 908, 1204, 908, 1280, 1032, 640, 1032]); fillP(g, '#8a6448');
      if (q.model >= 1) { g.strokeStyle = 'rgba(60,40,30,0.5)'; g.lineWidth = 3; g.beginPath(); for (var k = 0; k < 6; k++) { var yy = 916 + k * 20; g.moveTo(720 - k * 13, yy); g.lineTo(1200 + k * 13, yy); } g.stroke(); }
    } else {
      // 灰尘、落叶、断板
      for (var i = 0; i < K.byModel(q, 10, 24, 44); i++) { K.ellipse(g, r.range(0, W), r.range(by1 + 20, H), r.range(4, 12), r.range(2, 5), r.range(0, PI)); fillP(g, r() < 0.5 ? 'rgba(90,70,40,0.7)' : 'rgba(60,50,36,0.7)'); }
      K.poly(g, [860, 1000, 990, 1000, 1004, 1030, 846, 1030]); fillP(g, '#0e0a08');
      K.poly(g, [990, 996, 1080, 980, 1086, 992, 1000, 1010]); fillP(g, '#4a3a2c');
      g.fillStyle = K.lin(g, 0, by1, 0, H, ['rgba(120,110,100,0.06)', 'rgba(120,110,100,0.12)']); g.fillRect(0, by1, W, H - by1);
    }
    if (q.light >= 1) { g.fillStyle = K.lin(g, 0, by1, 0, by1 + 50, ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)']); g.fillRect(0, by1, W, 50); }
  }
  function drawHutWindow(g, q, past) {
    var x = 924, y = 148, w = 248, h = 200;
    if (q.light >= 1) { g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(x - 14, y - 14, w + 28, h + 34); }
    rectP(g, x - 14, y - 14, w + 28, h + 28); fillP(g, past ? '#5a4634' : '#3a2e24');
    // 窗外：阴天与远处的树
    rectP(g, x, y, w, h); fillP(g, K.lin(g, 0, y, 0, y + h, ['#a8a8b8', '#8a8c9e', '#5a6064']));
    g.save(); rectP(g, x, y, w, h); g.clip();
    var rr = RNG(1121);
    for (var i = 0; i < 8; i++) canopy(g, q, x + rr() * w, y + h - rr.range(10, 60), rr.range(30, 60), rr.range(30, 50), '#4a5250', null, rr, 5);
    if (!past) { rectP(g, x, y, w, h); fillP(g, 'rgba(80,76,60,0.35)'); }
    g.restore();
    if (q.light >= 1) K.glow(g, x + w / 2, y + h / 2, 260, past ? '#fff0d0' : '#b0bcd8', 0.2);
    // 窗棂
    g.fillStyle = past ? '#6a523c' : '#2e241c';
    g.fillRect(x + w / 2 - 5, y, 10, h); g.fillRect(x, y + h / 2 - 5, w, 10);
    if (!past) {
      // 破玻璃：一格缺失、一格裂纹
      g.save(); rectP(g, x + w / 2 + 5, y, w / 2 - 5, h / 2 - 5); g.clip();
      g.beginPath(); g.moveTo(x + w * 0.75, y + h * 0.22); for (var c = 0; c < 7; c++) { var a = c / 7 * TAU; g.moveTo(x + w * 0.75, y + h * 0.22); g.lineTo(x + w * 0.75 + Math.cos(a) * 140, y + h * 0.22 + Math.sin(a) * 100); }
      strokeP(g, 'rgba(230,230,240,0.6)', 1.4);
      g.restore();
      K.poly(g, [x + 5, y + h / 2 + 5, x + 60, y + h / 2 + 5, x + 30, y + h - 30, x + 5, y + h - 10]); fillP(g, 'rgba(30,30,36,0.8)');
      cobweb(g, x + w, y, 70, -1);
    } else {
      // 窗帘与窗台上的花盆
      K.path(g, 'M0 0 L60 0 Q50 80 70 200 L30 200 Q10 120 0 0 Z', x - 10, y - 6); fillP(g, '#e8e0d0', 0.92);
      K.path(g, 'M0 0 L-60 0 Q-50 80 -70 200 L-30 200 Q-10 120 0 0 Z', x + w + 10, y - 6); fillP(g, '#e8e0d0', 0.92);
      K.poly(g, [x + 100, y + h + 18, x + 148, y + h + 18, x + 142, y + h - 14, x + 106, y + h - 14]); fillP(g, '#a0583a');
      canopy(g, q, x + 124, y + h - 26, 26, 18, '#3a6a34', '#5a8a48', RNG(1123), 6);
      for (i = 0; i < 5; i++) { K.ellipse(g, x + 110 + i * 7, y + h - 34 - (i % 2) * 8, 5, 5); fillP(g, '#e8d070'); }
    }
    // 窗台
    rectP(g, x - 24, y + h + 14, w + 48, 16); fillP(g, K.lin(g, 0, y + h + 14, 0, y + h + 30, [past ? '#7a6048' : '#4a3a2c', '#1e1610']));
  }
  function drawHutPhoto(g, q, past) {
    g.save(); g.translate(808, 300); if (!past) g.rotate(0.07);
    if (q.light >= 1) { g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(-80, -56, 172, 128); }
    rectP(g, -86, -64, 172, 128); fillP(g, K.lin(g, -86, -64, 86, 64, ['#a08048', '#5a4020']));
    rectP(g, -72, -50, 144, 100); fillP(g, past ? '#d8cfb8' : '#a89e88');
    // 照片内容：高大的园丁与小女孩（褪色的黑白照）
    rectP(g, -66, -44, 132, 88); fillP(g, K.lin(g, 0, -44, 0, 44, past ? ['#b8b0a0', '#8a8272'] : ['#9a9284', '#7a7264']));
    g.fillStyle = past ? '#3a342c' : '#5a544a';
    K.ellipse(g, -16, -18, 10, 12); g.fill(); K.path(g, 'M-38 44 L-34 4 Q-16 -6 2 4 L6 44 Z'); g.fill();
    K.ellipse(g, 24, 2, 7, 8); g.fill(); K.path(g, 'M12 44 L14 14 Q24 8 34 14 L36 44 Z'); g.fill();
    g.fillStyle = past ? '#2a2620' : '#4a463e'; K.path(g, 'M-28 -28 Q-16 -40 -4 -28 Z'); g.fill();
    if (!past) {
      rectP(g, -66, -44, 132, 88); fillP(g, 'rgba(160,140,100,0.25)');
      g.beginPath(); g.moveTo(-66, -30); g.lineTo(10, 10); g.lineTo(66, 0); g.moveTo(10, 10); g.lineTo(-20, 44); strokeP(g, 'rgba(240,240,245,0.55)', 1.2);
    } else if (q.light >= 2) { K.poly(g, [-60, 44, -30, -44, -10, -44, -40, 44]); fillP(g, 'rgba(255,255,255,0.12)'); }
    g.restore();
    K.line(g, 808, 236, 808, 224, 2, '#1a1410'); g.fillStyle = '#2a2a2a'; K.ellipse(g, 808, 222, 3, 3); g.fill();
  }
  function drawHutTools(g, q, past) {
    // 挂架
    rectP(g, 70, 372, 296, 16); fillP(g, K.lin(g, 0, 372, 0, 388, ['#5a4636', '#2a2018']));
    var rust = past ? 0 : 1, metal = past ? '#8a8a92' : '#5a4a40';
    // 耙
    K.line(g, 104, 380, 110, 720, 7, '#6a5038');
    rectP(g, 80, 700, 60, 8); fillP(g, metal); g.strokeStyle = metal; g.lineWidth = 3; g.beginPath(); for (var t = 0; t < 7; t++) { g.moveTo(84 + t * 9, 708); g.lineTo(84 + t * 9, 728); } g.stroke();
    // 铁锹
    K.line(g, 170, 380, 172, 620, 8, '#6a5038'); K.path(g, 'M150 620 L194 620 L190 690 Q172 712 154 690 Z'); fillP(g, K.lin(g, 150, 0, 194, 0, [K.shade(metal, 0.25), metal, K.shade(metal, -0.4)]));
    // 锄
    K.line(g, 230, 380, 236, 640, 7, '#6a5038'); K.poly(g, [214, 640, 262, 636, 262, 660, 220, 668]); fillP(g, metal);
    // 镰刀与剪刀（挂钉上）
    g.beginPath(); g.moveTo(290, 392); g.lineTo(292, 470); strokeP(g, '#5a4030', 6);
    g.beginPath(); g.arc(310, 470, 22, PI * 0.9, PI * 1.9, false); strokeP(g, metal, 5);
    K.line(g, 334, 392, 322, 520, 4, metal); K.line(g, 344, 392, 356, 520, 4, metal); K.ellipse(g, 339, 400, 8, 8); strokeP(g, '#3a2a22', 3);
    // 喷壶（地上）
    K.path(g, 'M250 728 L330 728 L324 676 L256 676 Z'); fillP(g, K.lin(g, 250, 0, 330, 0, past ? ['#8aa0a0', '#4a6060'] : ['#6a6a5a', '#3a3a30']));
    K.line(g, 322, 690, 362, 664, 6, past ? '#5a7070' : '#4a4a3a');
    if (q.light >= 1) K.contact(g, 292, 728, 50, 8, 0.6);
    if (rust && q.model >= 1) { var r = RNG(1131); for (var i = 0; i < 10; i++) { K.ellipse(g, r.range(150, 340), r.range(620, 720), r.range(3, 7), r.range(2, 5)); fillP(g, 'rgba(110,60,30,0.6)'); } cobweb(g, 70, 388, 80, 1); }
    if (q.light >= 1) K.ao(g, 64, 344, 304, 400, 30, 0.3, 'l');
  }
  function drawHutStove(g, q, past) {
    var x = 420, y = 610, w = 216, h = 150;
    if (q.light >= 1) K.contact(g, x + w / 2, 800, 140, 14, 0.65);
    // 烟囱管
    rectP(g, 512, 60, 32, y - 60); fillP(g, K.lin(g, 512, 0, 544, 0, ['#4a4a50', '#2a2a2e', '#141416']));
    for (var k = 0; k < 4; k++) { g.fillStyle = '#1a1a1e'; g.fillRect(508, 150 + k * 110, 40, 6); }
    // 炉体
    K.rr(g, x, y, w, h, 10); fillP(g, K.lin(g, x, 0, x + w, 0, ['#4a4646', '#2a2828', '#141212']));
    if (q.tex > 0) { K.rr(g, x, y, w, h, 10); texFill(g, q, 'metal', { c1: '#000000', c2: '#ffffff', seed: 31 }, 96, 0, 0, 0.12, null, null, null, 'overlay'); }
    rectP(g, x - 10, y - 14, w + 20, 16); fillP(g, '#3a3636');
    // 炉门
    K.rr(g, x + 40, y + 30, 136, 90, 6); fillP(g, '#1e1c1c');
    if (past) {
      K.rr(g, x + 52, y + 42, 112, 66, 4); fillP(g, K.rad(g, x + 108, y + 90, 4, 70, ['#fff0a0', '#ff9a30', '#a02a10']));
      if (q.light >= 1) K.glow(g, x + 108, y + 80, 160, '#ff8a30', 0.4);
    } else {
      K.rr(g, x + 52, y + 42, 112, 66, 4); fillP(g, '#0a0909');
    }
    g.strokeStyle = '#3a3636'; g.lineWidth = 4; g.beginPath(); for (var b = 0; b < 6; b++) { g.moveTo(x + 56 + b * 20, y + 42); g.lineTo(x + 56 + b * 20, y + 108); } g.stroke();
    // 腿
    g.fillStyle = '#1a1818'; g.fillRect(x + 12, y + h, 16, 40); g.fillRect(x + w - 28, y + h, 16, 40);
    // 炉上的水壶（过去）/ 锈迹（现在）
    if (past) { K.path(g, 'M470 596 Q470 560 520 556 Q570 560 570 596 Z'); fillP(g, K.lin(g, 470, 0, 570, 0, ['#9a9aa0', '#4a4a50'])); K.line(g, 566, 580, 596, 566, 6, '#5a5a60'); }
    else { var r = RNG(1141); for (k = 0; k < K.byModel(q, 4, 10, 16); k++) { K.ellipse(g, r.range(x, x + w), r.range(y, y + h), r.range(3, 10), r.range(2, 6)); fillP(g, 'rgba(110,56,26,0.55)'); } }
    if (q.light >= 2) { g.fillStyle = 'rgba(255,240,230,0.18)'; g.fillRect(x + 6, y + 6, 4, h - 20); }
  }
  function drawHutTable(g, q, past) {
    var x = 930, y = 650, w = 210;
    if (q.light >= 1) K.contact(g, x + w / 2, 832, 120, 12, 0.55);
    if (!past) {
      // 倒塌的桌子：一条腿断了，桌面倾斜
      g.save(); g.translate(x + w / 2, 760); g.rotate(-0.16);
      rectP(g, -w / 2, -12, w, 18); fillP(g, K.lin(g, 0, -12, 0, 6, ['#5a4636', '#2a1e16']));
      g.restore();
      g.fillStyle = '#2a1e16'; g.fillRect(x + w - 30, 760, 14, 72); g.fillRect(x + 30, 790, 14, 42);
      K.ellipse(g, x + 40, 826, 26, 7); fillP(g, 'rgba(70,90,70,0.6)');   // 倒下的空瓶
      K.rr(g, x + 20, 806, 50, 18, 8); fillP(g, 'rgba(70,96,80,0.7)');
      return;
    }
    rectP(g, x, y, w, 16); fillP(g, K.lin(g, 0, y, 0, y + 16, ['#7a5e44', '#3a2a1c']));
    g.fillStyle = '#3a2a1c'; g.fillRect(x + 12, y + 16, 14, 830 - y - 16); g.fillRect(x + w - 26, y + 16, 14, 830 - y - 16);
    // 桌布、油灯、花瓶
    K.poly(g, [x - 6, y - 2, x + w + 6, y - 2, x + w + 2, y + 40, x - 2, y + 40]); fillP(g, '#d8d0c0', 0.9);
    K.ellipse(g, 1030, y - 6, 20, 6); fillP(g, '#8a6a3a'); K.path(g, 'M1018 644 Q1030 600 1042 644 Z'); fillP(g, 'rgba(255,240,200,0.6)');
    K.flame(g, q, 1030, 628, 18, { color: '#ffb050', glow: 5 });
    K.rr(g, 970, y - 40, 22, 40, 6); fillP(g, '#5a7aa0');
    for (var i = 0; i < 4; i++) { K.ellipse(g, 974 + i * 6, y - 48 - (i % 2) * 6, 6, 6); fillP(g, i % 2 ? '#e8a0b0' : '#f0e0a0'); }
  }
  function drawHutBed(g, q, past) {
    var x0 = 1196, x1 = 1796, top = 700, bot = 846;
    if (q.light >= 1) K.contact(g, (x0 + x1) / 2, bot, 330, 18, 0.6);
    // 床头板（右）
    rectP(g, x1 - 40, 600, 44, bot - 600); fillP(g, K.lin(g, x1 - 40, 0, x1 + 4, 0, ['#6a5240', '#3a2a1e']));
    K.rr(g, x1 - 48, 592, 60, 16, 4); fillP(g, '#4a3a2a');
    // 床架侧板与腿
    rectP(g, x0, top + 40, x1 - x0 - 40, 50); mat(g, q, '#4a3a2c', 'wood', { c1: '#2a1e14', c2: '#5a4434', gap: '#140c08', planks: 1, dir: 'h', seed: 115 }, 96, x0, top);
    rectP(g, x0, top + 40, x1 - x0 - 40, 50); fillP(g, 'rgba(0,0,0,0.3)');
    g.fillStyle = '#2a1e16'; g.fillRect(x0, top + 40, 22, bot - top - 40); g.fillRect(x1 - 62, top + 40, 22, bot - top - 40);
    if (past) {
      // 整齐的被褥与拼布被
      K.path(g, 'M1196 742 Q1196 700 1240 696 L1740 696 Q1760 700 1760 742 Z'); fillP(g, '#e0d8c8');
      K.path(g, 'M1196 744 Q1200 708 1260 704 L1600 704 Q1620 720 1610 760 L1196 760 Z'); fillP(g, '#8a4a4a');
      if (q.model >= 1) {
        var cols = ['#a05a50', '#5a7a8a', '#c8a060', '#7a5a7a'], idx = 0;
        for (var px = 1210; px < 1600; px += 40) for (var py = 708; py < 756; py += 24) { rectP(g, px, py, 38, 22); fillP(g, cols[(idx++) % 4], 0.85); }
      }
      K.rr(g, 1640, 676, 110, 40, 14); fillP(g, K.lin(g, 0, 676, 0, 716, ['#f0eadc', '#c8c0b0']));
    } else {
      // 发黄的旧床垫与皱巴巴的毯子
      K.path(g, 'M1196 744 Q1194 702 1236 700 L1742 698 Q1760 704 1756 744 Z'); fillP(g, '#8a8270');
      if (q.tex > 0) { K.path(g, 'M1196 744 Q1194 702 1236 700 L1742 698 Q1760 704 1756 744 Z'); texFill(g, q, 'fabric', { c1: '#000000', c2: '#ffffff', seed: 17 }, 64, 0, 0, 0.15, null, null, null, 'overlay'); }
      K.ellipse(g, 1480, 724, 90, 14); fillP(g, 'rgba(90,70,40,0.45)');
      K.path(g, 'M1240 700 Q1300 672 1360 700 Q1420 664 1460 704 Q1500 740 1420 752 Q1330 760 1260 746 Q1220 730 1240 700 Z'); fillP(g, K.lin(g, 0, 670, 0, 760, ['#5a5a66', '#34343e']));
      g.strokeStyle = 'rgba(20,20,26,0.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(1280, 706); g.quadraticCurveTo(1320, 720, 1300, 744); g.moveTo(1380, 700); g.quadraticCurveTo(1400, 724, 1440, 730); g.stroke();
    }
    if (q.light >= 1) K.ao(g, x0, top + 90, x1 - x0, bot - top - 90, 30, 0.4, 'b');
  }
  function drawHutBox(g, q, past) {
    // 墙上的搁板与木箱
    rectP(g, 1500, 552, 300, 16); fillP(g, K.lin(g, 0, 552, 0, 568, ['#6a523e', '#2a1e14']));
    K.poly(g, [1520, 568, 1534, 568, 1534, 600, 1520, 586]); fillP(g, '#2a1e14'); K.poly(g, [1766, 568, 1780, 568, 1780, 586, 1766, 600]); fillP(g, '#2a1e14');
    var x = 1538, y = 392, w = 220, h = 160;
    if (q.light >= 1) { g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(x + 12, y + 10, w, h - 6); }
    rectP(g, x, y, w, h); mat(g, q, '#5a4432', 'wood', { c1: '#3a2a1c', c2: '#6e5440', gap: '#1e140c', planks: 3, dir: 'h', seed: 117 }, 96, x, y);
    rectP(g, x, y, w, h); fillP(g, K.lin(g, 0, y, 0, y + h, ['rgba(255,230,200,0.08)', 'rgba(0,0,0,0.3)']));
    // 盖子分界与金属包角
    g.fillStyle = '#2a1e14'; g.fillRect(x, y + 44, w, 6);
    g.fillStyle = past ? '#a08a5a' : '#5a5040';
    g.fillRect(x, y, 22, 22); g.fillRect(x + w - 22, y, 22, 22); g.fillRect(x, y + h - 22, 22, 22); g.fillRect(x + w - 22, y + h - 22, 22, 22);
    K.rr(g, x + w / 2 - 14, y + 40, 28, 30, 3); fillP(g, past ? '#b89a5a' : '#6a5a3a');
    if (!past) { rectP(g, x, y, w, 10); fillP(g, 'rgba(150,140,120,0.3)'); }
  }
  DM.HDBG.def('hut', {
    outdoor: false,
    draw: function (g, q, v) { drawHut(g, q, v); },
    lights: function (v) {
      var L = [{ x: 1048, y: 248, r: 200, color: v === 'past' ? '#fff0d0' : '#b0bcd8', i: 0.4, flicker: 0, kind: 'window' }];
      if (v === 'past') { L.push({ x: 1030, y: 620, r: 160, color: '#ffb050', i: 0.6, flicker: 0.3, kind: 'candle' }); L.push({ x: 528, y: 690, r: 150, color: '#ff8a30', i: 0.55, flicker: 0.4, kind: 'fire' }); }
      return L;
    },
    key: function (v) { return v === 'past' ? { x: 0.1, color: '#ffd8a8', amb: '#3a2c26', rim: 0.45 } : { x: 0.15, color: '#b8c4dc', amb: '#26242a', rim: 0.35 }; }
  });

  /* =================================================================
   * 海蚀洞 seacave（室内）
   * ================================================================= */
  // 洞口轮廓：粗糙不规则（带噪声的拱形）
  var CAVE_OP = (function () {
    var pts = [], n = 40, i;
    for (i = 0; i <= n; i++) {
      var t = i / n, a = PI + t * PI, rx = 226, ry = 300;
      var j = (fbm(t * 9, 3.3, 3, 141) - 0.5) * 70 + (fbm(t * 31, 1.1, 2, 142) - 0.5) * 22;
      var x = 960 + Math.cos(a) * (rx + j * 0.8), y = 410 + Math.sin(a) * (ry + j) * (0.9 + 0.1 * Math.sin(t * PI));
      pts.push(x, Math.min(410, y));
    }
    return pts;
  })();
  function caveOpening() { return CAVE_OP; }
  function drawSeacave(g, q) {
    var E = [960, 250];
    // 洞壁（点光源：洞口）
    rockCells(g, q, 0, 0, W, H, { seed: 131, cw: 150, ch: 110, P: [E[0], E[1] + 40, 220], att: 980, dark: '#09090c', mid: '#2c2c36', lite: '#9a9eb0', amb: 0.16, crack: 0.05, tilt: -0.05, res: 0.3,
      wet: function (u, v) { return 0.35 + sat((v - 0.55) * 2) * 0.6; }, moss: function (u, v) { return sat((v - 0.62) * 3) * 0.7; }, mossCol: '#2a3424' });
    if (q.tex > 0) { rectP(g, 0, 0, W, H); texFill(g, q, 'rock', ROCK_WET, 256, 0, 0, 0.35, null, null, null, 'overlay'); }
    // 洞口：天空与海
    var op = caveOpening();
    g.save(); K.poly(g, op); g.clip();
    g.fillStyle = K.lin(g, 0, 80, 0, 290, ['#8a8a9e', '#b4b4c4', '#c8c8d4']); g.fillRect(700, 60, 520, 240);
    var r = RNG(1301);
    for (var i = 0; i < 8; i++) K.blob(g, r.range(740, 1180), r.range(90, 230), r.range(40, 90), '#6a6a80', 0.35);
    seaField(g, q, { x: 700, w: 520, yh: 290, yb: 420, seed: 133, gx: 960, sw: 120, F: 40 });
    waves(g, q, { x0: 700, x1: 1220, yh: 290, yb: 420, seed: 134, rows: K.byModel(q, 10, 16, 24), choppy: 1.4, gx: 960, sw: 120 });
    g.fillStyle = 'rgba(220,222,232,0.5)'; g.fillRect(700, 288, 520, 3);
    g.restore();
    // 洞口边缘的轮廓光
    if (q.light >= 1) { K.poly(g, op); strokeP(g, 'rgba(190,195,215,0.4)', q.light >= 2 ? 7 : 3); K.poly(g, op); strokeP(g, 'rgba(10,10,14,0.6)', 2); }
    // 洞口上方垂下的岩齿（剪影，前景）
    var tr = RNG(1307);
    for (var tI = 0; tI < K.byModel(q, 2, 3, 4); tI++) {
      var tx = [830, 1050, 930, 1120][tI] + tr.range(-15, 15), ty = 64 + Math.abs(tx - 960) * 0.62, tl = tr.range(24, 60), tw = tr.range(16, 34);
      K.poly(g, [tx - tw, ty - 30, tx + tw, ty - 30, tx + tw * 0.3, ty + tl, tx - tw * 0.2, ty + tl * 0.8]); fillP(g, '#0c0c10');
      if (q.light >= 2) { g.beginPath(); g.moveTo(tx - tw, ty - 10); g.lineTo(tx - tw * 0.2, ty + tl * 0.8); strokeP(g, 'rgba(170,176,200,0.35)', 1.5); }
    }
    if (q.light >= 1) { K.glow(g, E[0], E[1], 520, '#a8b0c8', 0.22); }
    // 洞内地面：从洞口延伸进来的水道与湿岩
    K.path(g, 'M740 404 Q700 470 600 520 Q420 580 300 600 L0 640 L0 1080 L1920 1080 L1920 620 Q1500 560 1300 500 Q1200 470 1184 404 Z');
    fillP(g, K.lin(g, 0, 400, 0, H, ['rgba(30,32,40,0.55)', 'rgba(8,8,12,0.7)', 'rgba(4,4,6,0.85)']));
    // 水道（与外海相连，边缘不规则）
    var ch = [], cn = 22, ci;
    for (ci = 0; ci <= cn; ci++) { var ct = ci / cn, cy2 = 400 + ct * 364, hw = 214 - Math.sin(ct * PI) * 90 + ct * 90; ch.push(960 - hw + (fbm(ct * 6, 1.7, 3, 151) - 0.5) * 90 * Math.min(1, ct * 4), cy2); }
    for (ci = cn; ci >= 0; ci--) { var ct2 = ci / cn, cy3 = 400 + ct2 * 364, hw2 = 214 - Math.sin(ct2 * PI) * 90 + ct2 * 90; ch.push(960 + hw2 + (fbm(ct2 * 6, 5.9, 3, 152) - 0.5) * 90 * Math.min(1, ct2 * 4), cy3); }
    smoothPath(g, ch, true); fillP(g, K.lin(g, 0, 404, 0, 770, ['#4a5262', '#222a36', '#10141a']));
    g.save(); smoothPath(g, ch, true); g.clip();
    g.save(); g.translate(960, 400); g.scale(1, 2.2); g.fillStyle = K.rad(g, 0, 0, 0, 150, [[0, 'rgba(200,205,225,0.4)'], [1, 'rgba(200,205,225,0)']]); g.fillRect(-150, 0, 300, 150); g.restore();
    var wr = RNG(1309); g.strokeStyle = 'rgba(180,190,210,0.2)'; g.lineWidth = 1.5; g.beginPath();
    for (ci = 0; ci < K.byModel(q, 10, 24, 40); ci++) { var wx = wr.range(740, 1180), wy = wr.range(420, 760), wl = 8 + (wy - 404) * 0.08; g.moveTo(wx - wl, wy); g.lineTo(wx + wl, wy); }
    g.stroke(); g.restore();
    // 洞口光照到的湿岩地面（近处的岩块轮廓）
    var fr = RNG(1313);
    for (i = 0; i < K.byModel(q, 4, 8, 12); i++) { var fx = fr() < 0.5 ? fr.range(300, 640) : fr.range(1280, 1600), fy = fr.range(760, 1000); boulder(g, q, fx, fy, fr.range(80, 180), fr.range(30, 60), { seed: 1340 + i, color: '#1a1a20', lit: '#6a6e80' }); }
    drawTidePool(g, q);
    drawLedge(g, q);
    drawPassage(g, q);
    // 洞口照进来的光柱
    if (q.light >= 2) {
      K.shaft(g, [770, 300, 1160, 300, 1500, 1000, 500, 1000], '#b8c0d8', 0.07, 960, 300, 960, 1000);
      K.motes(g, RNG(1303), 40, 760, 380, 420, 400, '#c8d0e8', 0.25);
    }
    // 水滴与湿润的高光
    if (q.light >= 2) {
      g.save(); g.globalCompositeOperation = 'lighter';
      var rr = RNG(1305);
      for (i = 0; i < 60; i++) { var dx = rr.range(200, 1700), dy = rr.range(20, 600); if (dx > 700 && dx < 1220 && dy < 430) continue; var dd = Math.sqrt((dx - E[0]) * (dx - E[0]) + (dy - E[1]) * (dy - E[1])); var a = 0.5 * Math.max(0, 1 - dd / 900); if (a < 0.05) continue; K.ellipse(g, dx, dy, 2, 3); g.fillStyle = 'rgba(220,226,240,' + a.toFixed(2) + ')'; g.fill(); }
      g.strokeStyle = 'rgba(200,210,230,0.18)'; g.lineWidth = 1.2; g.beginPath();
      for (i = 0; i < 8; i++) { var sx = rr() < 0.5 ? rr.range(420, 700) : rr.range(1230, 1500), sy = rr.range(40, 300); g.moveTo(sx, sy); g.lineTo(sx, sy + rr.range(10, 28)); }
      g.stroke();
      g.restore();
    }
    // 钟乳状的顶部与暗角
    g.fillStyle = K.lin(g, 0, 0, 0, 120, ['rgba(0,0,0,0.75)', 'rgba(0,0,0,0)']); g.fillRect(0, 0, W, 120);
    K.vignette(g, W, H, q.light >= 1 ? 0.75 : 0.55, 0.3);
  }
  function drawTidePool(g, q) {
    var pts = [], cx = 960, cy = 822, r = RNG(1311);
    for (var i = 0; i < 18; i++) { var a = i / 18 * TAU, rr = r.range(0.86, 1.08); pts.push(cx + Math.cos(a) * 350 * rr, cy + Math.sin(a) * 92 * rr); }
    smoothPath(g, pts, true); fillP(g, '#0a0c10');
    g.save(); smoothPath(g, pts, true); g.clip();
    g.fillStyle = K.lin(g, 0, cy - 100, 0, cy + 100, ['#1a2230', '#2a3444', '#141a24']); g.fillRect(cx - 380, cy - 110, 760, 220);
    // 洞口的倒影（亮）
    g.save(); g.translate(cx, cy - 40); g.scale(1, 0.4);
    g.fillStyle = K.rad(g, 0, 0, 0, 230, [[0, 'rgba(176,182,204,0.6)'], [0.5, 'rgba(140,148,170,0.25)'], [1, 'rgba(120,128,150,0)']]); g.fillRect(-230, -230, 460, 460);
    g.restore();
    // 池底的石头与海藻
    for (i = 0; i < K.byModel(q, 5, 10, 16); i++) { K.ellipse(g, cx + r.range(-300, 300), cy + r.range(-40, 70), r.range(14, 40), r.range(6, 14)); fillP(g, r() < 0.5 ? 'rgba(40,50,40,0.6)' : 'rgba(60,56,50,0.5)'); }
    if (q.light >= 2) { g.strokeStyle = 'rgba(220,226,240,0.25)'; g.lineWidth = 1.5; for (i = 0; i < 3; i++) { K.ellipse(g, cx + 60, cy + 10, 30 + i * 26, 8 + i * 7); g.stroke(); } }
    g.restore();
    smoothPath(g, pts, true); strokeP(g, 'rgba(120,130,150,0.25)', 3);
    // 池边岩石
    for (i = 0; i < 18; i += 2) { var a2 = i / 18 * TAU; if (Math.sin(a2) < -0.3) continue; boulder(g, q, cx + Math.cos(a2) * 360, cy + Math.sin(a2) * 96 + 14, r.range(60, 110), r.range(26, 44), { seed: 1320 + i, color: '#22222a', lit: '#7a7e90' }); }
  }
  function drawLedge(g, q) {
    // 左侧岩架（平顶 + 前立面）
    var top = 'M40 612 Q120 590 300 588 Q480 586 590 600 L600 622 Q460 636 300 640 Q140 642 52 634 Z';
    var face = 'M52 634 Q140 642 300 640 Q460 636 600 622 L586 700 Q560 742 480 748 L100 750 Q50 740 44 700 Z';
    K.path(g, face); fillP(g, K.lin(g, 0, 630, 0, 750, ['#2a2a34', '#121218']));
    if (q.tex > 0) { K.path(g, face); texFill(g, q, 'rock', ROCK_WET, 192, 0, 0, 0.6, null, null, null, 'overlay'); }
    K.path(g, top); fillP(g, K.lin(g, 40, 0, 600, 0, ['#3a3a46', '#5a5c6a']));
    if (q.tex > 0) { K.path(g, top); texFill(g, q, 'rock', ROCK, 160, 0, 0, 0.4, null, null, null, 'overlay'); }
    if (q.light >= 1) { K.path(g, 'M52 634 Q140 642 300 640 Q460 636 600 622'); strokeP(g, 'rgba(170,176,196,0.3)', 2.5); }
    if (q.light >= 1) K.contact(g, 300, 752, 300, 16, 0.6);
    // 毯子（皱褶的灰褐色毛毯，带条纹）
    var bl = 'M150 604 Q170 560 220 556 Q280 548 330 560 Q392 556 404 584 Q412 612 392 618 Q300 630 196 624 Q150 622 150 604 Z';
    if (q.light >= 1) K.contact(g, 280, 622, 140, 12, 0.6);
    K.path(g, bl); fillP(g, K.lin(g, 0, 550, 0, 626, ['#6a6670', '#4a4650', '#2a2830']));
    if (q.tex > 0) { K.path(g, bl); texFill(g, q, 'fabric', { c1: '#000000', c2: '#ffffff', threads: 48, seed: 23 }, 64, 0, 0, 0.18, null, null, null, 'overlay'); }
    g.save(); K.path(g, bl); g.clip();
    g.strokeStyle = 'rgba(120,40,36,0.55)'; g.lineWidth = 6; g.beginPath(); g.moveTo(150, 586); g.quadraticCurveTo(280, 570, 410, 596); g.moveTo(150, 600); g.quadraticCurveTo(280, 586, 410, 610); g.stroke();
    g.strokeStyle = 'rgba(20,16,12,0.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(230, 560); g.quadraticCurveTo(250, 590, 236, 622); g.moveTo(320, 560); g.quadraticCurveTo(300, 594, 330, 624); g.stroke();
    g.restore();
    // 旁边的物品：罐头、蜡烛头、水壶
    K.rr(g, 438, 572, 26, 30, 3); fillP(g, K.lin(g, 438, 0, 464, 0, ['#9a9aa2', '#4a4a52']));
    K.rr(g, 470, 580, 24, 22, 3); fillP(g, K.lin(g, 470, 0, 494, 0, ['#a07a3a', '#5a4020']));
    rectP(g, 510, 586, 14, 18); fillP(g, '#d8d0b8'); K.ellipse(g, 517, 610, 14, 4); fillP(g, '#5a5a62');
    K.rr(g, 92, 560, 34, 54, 8); fillP(g, K.lin(g, 92, 0, 126, 0, ['#5a7a6a', '#2a3a32']));
    if (q.light >= 2) { rectP(g, 444, 576, 3, 22); fillP(g, 'rgba(255,255,255,0.5)'); }
  }
  function drawPassage(g, q) {
    // 右侧狭窄的岩缝（通往小屋背后）
    var p = 'M1660 230 Q1690 240 1720 236 Q1760 300 1790 420 Q1820 560 1840 700 Q1850 760 1830 800 L1640 800 Q1620 700 1650 560 Q1670 420 1650 300 Z';
    K.path(g, p); fillP(g, '#040406');
    g.save(); K.path(g, p); g.clip();
    // 深处的微弱天光
    K.glow(g, 1730, 300, 160, '#7a88a8', 0.35, 'source-over');
    g.fillStyle = K.lin(g, 1640, 0, 1840, 0, ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']); g.fillRect(1600, 220, 260, 600);
    g.restore();
    if (q.light >= 1) { K.path(g, 'M1660 230 Q1670 420 1650 560 Q1620 700 1640 800'); strokeP(g, 'rgba(150,160,185,0.3)', 3); }
    // 地面上的湿脚印状水痕（通向岩缝）
    if (q.model >= 1) { var r = RNG(1331); for (var i = 0; i < 6; i++) { K.ellipse(g, 1560 + i * 20, 900 - i * 22, 16, 5); fillP(g, 'rgba(120,130,150,' + (0.18 - i * 0.02).toFixed(2) + ')'); } void r; }
  }
  DM.HDBG.def('seacave', {
    outdoor: false,
    draw: function (g, q) { drawSeacave(g, q); },
    lights: [{ x: 960, y: 250, r: 300, color: '#b0b8d0', i: 0.45, flicker: 0, kind: 'window' }],
    key: { x: 0, color: '#b8c0d8', amb: '#1c1e26', rim: 0.6 }
  });


  /* =================================================================
   * 地图 map：俯瞰的写意航拍画（无文字；引擎在 DM.AREAS 节点上叠加标签）
   * ================================================================= */
  var MAPC = [960, 520];
  // 海岸线控制点（设计坐标），转换为极坐标 r(θ) 便于逐像素判断陆地与离岸距离
  var MAP_CTRL = [150, 520, 130, 380, 170, 250, 262, 142, 380, 78, 520, 56, 700, 66, 880, 104, 1040, 150, 1180, 186, 1320, 160, 1440, 104, 1550, 88, 1665, 102,
    1765, 160, 1824, 262, 1806, 362, 1768, 448, 1790, 560, 1758, 680, 1660, 800, 1500, 872, 1300, 902, 1100, 930, 900, 942, 700, 934, 520, 906, 420, 878, 352, 836, 270, 786, 190, 690];
  var MAP_R = (function () {
    var pts = [], i, n = MAP_CTRL.length / 2;
    for (i = 0; i < n; i++) { var dx = MAP_CTRL[i * 2] - MAPC[0], dy = MAP_CTRL[i * 2 + 1] - MAPC[1]; pts.push([Math.atan2(dy, dx), Math.sqrt(dx * dx + dy * dy)]); }
    pts.sort(function (a, b) { return a[0] - b[0]; });
    var N = 720, out = new Float32Array(N + 1);
    for (var k = 0; k <= N; k++) {
      var th = -PI + k / N * TAU, j = 0;
      while (j < pts.length && pts[j][0] <= th) j++;
      var i1 = (j - 1 + pts.length) % pts.length, i2 = j % pts.length, i0 = (i1 - 1 + pts.length) % pts.length, i3 = (i2 + 1) % pts.length;
      var a1 = pts[i1][0], a2 = pts[i2][0]; if (a2 <= a1) a2 += TAU; var tt = th; if (tt < a1) tt += TAU;
      var t = (tt - a1) / (a2 - a1);
      var p0 = pts[i0][1], p1 = pts[i1][1], p2 = pts[i2][1], p3 = pts[i3][1];
      var t2 = t * t, t3 = t2 * t;
      var rr = 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
      // 分形岸线细节
      rr *= 1 + (fbm(k / N * 40, 0.5, 4, 161) - 0.5) * 0.07 + (fbm(k / N * 160, 2.5, 2, 162) - 0.5) * 0.02;
      out[k] = rr;
    }
    return out;
  })();
  function mapR(th) { var f = (th + PI) / TAU * 720, i = Math.floor(f), t = f - i; i = ((i % 720) + 720) % 720; return MAP_R[i] + (MAP_R[i + 1] - MAP_R[i]) * t; }
  function coastPath(g, k, step) {
    g.beginPath();
    for (var i = 0; i <= 720; i += step || 2) { var th = -PI + i / 720 * TAU, r = MAP_R[i % 720] * k; var x = MAPC[0] + Math.cos(th) * r, y = MAPC[1] + Math.sin(th) * r; if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); }
    g.closePath();
  }
  function node(id) { var a = DM.AREAS && DM.AREAS[id]; return a ? [a.map[0] * 4, a.map[1] * 4] : [960, 540]; }
  // 地形高度（0 = 海岸）
  var HILLS = [[464, 190, 170, 0.55], [700, 330, 220, 0.25], [1250, 560, 260, 0.18], [1180, 250, 140, 0.25], [1620, 300, 180, 0.22]];
  var CLEAR = [[912, 600, 150], [1048, 432, 90], [1224, 280, 60], [672, 384, 70], [464, 160, 70], [1344, 744, 60]];
  function mapInfo(x, y, out) {
    var dx = x - MAPC[0], dy = y - MAPC[1], rho = Math.sqrt(dx * dx + dy * dy), R = mapR(Math.atan2(dy, dx));
    var e = 1 - rho / R;
    out[0] = e;
    if (e < 0) { out[1] = 0; out[2] = 0; return; }
    var h = sstep(0, 0.3, e) * 0.3;
    for (var i = 0; i < HILLS.length; i++) { var hx = x - HILLS[i][0], hy = y - HILLS[i][1], d2 = (hx * hx + hy * hy) / (HILLS[i][2] * HILLS[i][2]); if (d2 < 4) h += HILLS[i][3] * Math.exp(-d2 * 1.5); }
    h += (fbm(x * 0.006, y * 0.006, 4, 171) - 0.5) * 0.18;
    // 北岸与东岸是悬崖：近岸处高度陡升
    var bnx = x - 1536, bny = y - 120, isB = Math.exp(-(bnx * bnx / 40000 + bny * bny / 9000));
    var cl = (sstep(-0.2, 0.4, -dy / (rho + 1)) + sstep(0.5, 0.9, dx / (rho + 1)) * 0.7) * (1 - isB);
    h += sstep(0, 0.03, e) * (1 - sstep(0.06, 0.2, e)) * cl * 0.18;
    out[3] = isB;
    out[1] = h;
    var c = 0;
    for (i = 0; i < CLEAR.length; i++) { var cx = x - CLEAR[i][0], cy = y - CLEAR[i][1], cd = Math.sqrt(cx * cx + cy * cy) / CLEAR[i][2]; if (cd < 1.4) c = Math.max(c, 1 - sstep(0.6, 1.4, cd)); }
    out[2] = c;  // 林间空地程度
  }
  function drawMap(g, q) {
    var I = [0, 0, 0, 0], I2 = [0, 0, 0, 0], I3 = [0, 0, 0, 0];
    var deep = C('#121c28'), shal = C('#3c5a62'), sand = C('#b0a482'), rock = C('#4a4a50'), grass = C('#56664a'), forest = C('#24342a'), forest2 = C('#33473a');
    var bn = node('beach'), lx = -0.6, ly = -0.75, lz = 0.55, rough = q.model >= 1;
    var r = fres(q, 0.26);
    field(g, 0, 0, W, H, W * r, H * r, function (u, v, out) {
      var x = u * W, y = v * H;
      mapInfo(x, y, I);
      var e = I[0], R, G, B;
      if (e < 0) {
        var d = -e, t = sat(d / 0.12);
        R = shal[0] + (deep[0] - shal[0]) * t; G = shal[1] + (deep[1] - shal[1]) * t; B = shal[2] + (deep[2] - shal[2]) * t;
        var wn = fbm(x * 0.02, y * 0.05, rough ? 3 : 2, 181);
        var m = 1 + (wn - 0.5) * 0.35; R *= m; G *= m; B *= m;
        var sh = Math.exp(-d * 60) * 0.35; R += (200 - R) * sh; G += (210 - G) * sh; B += (214 - B) * sh;
      } else {
        var h = I[1], dd = 4;
        mapInfo(x + dd, y, I2); mapInfo(x, y + dd, I3);
        var nx = -(I2[1] - h) * 75, ny = -(I3[1] - h) * 75, nl = Math.sqrt(nx * nx + ny * ny + 1);
        var shd = sat((nx * lx + ny * ly + lz) / nl * 1.15);
        var fn = fbm(x * 0.03, y * 0.03, rough ? 3 : 2, 183);
        // 森林 → 林间空地（草地）
        var fr = forest[0] + (forest2[0] - forest[0]) * fn, fg = forest[1] + (forest2[1] - forest[1]) * fn, fb = forest[2] + (forest2[2] - forest[2]) * fn;
        var c = I[2] * sstep(0.3, 0.6, fbm(x * 0.02, y * 0.02, 2, 185) + I[2] * 0.4);
        var mead = sstep(0.62, 0.72, fbm(x * 0.004, y * 0.004, 3, 189)) * 0.6;
        c = Math.max(c, mead * sat(e * 6));
        R = fr + (grass[0] - fr) * c; G = fg + (grass[1] - fg) * c; B = fb + (grass[2] - fb) * c;
        // 海岸：岩石或沙滩
        var isB = I[3];
        var coast = 1 - sstep(0.0, 0.03 + isB * 0.05, e);
        var cr = rock[0] + (sand[0] - rock[0]) * isB, cg = rock[1] + (sand[1] - rock[1]) * isB, cb = rock[2] + (sand[2] - rock[2]) * isB;
        R += (cr - R) * coast; G += (cg - G) * coast; B += (cb - B) * coast;
        var lit = 0.55 + shd * 0.75;
        R *= lit; G *= lit; B *= lit;
      }
      // 云影
      var cs = sstep(0.5, 0.75, fbm(x * 0.0016 + 3, y * 0.0024, 3, 187)) * 0.3;
      R *= 1 - cs; G *= 1 - cs; B *= 1 - cs * 0.85;
      out[0] = R; out[1] = G; out[2] = B;
    });
    // 浪花与岸边白线（矢量，任何分辨率都清晰）
    coastPath(g, 1.0, q.model >= 1 ? 1 : 3); strokeP(g, 'rgba(225,230,235,0.55)', 3);
    coastPath(g, 1.012, 3); strokeP(g, 'rgba(200,210,220,0.22)', 2);
    if (q.model >= 1) { coastPath(g, 1.03, 4); strokeP(g, 'rgba(190,200,215,0.12)', 2); }
    // 悬崖的阴影线（北、东岸）
    if (q.model >= 1) {
      g.strokeStyle = 'rgba(14,16,20,0.45)'; g.lineWidth = 2; g.beginPath();
      for (var i = 0; i < 720; i += 3) {
        var th = -PI + i / 720 * TAU, cdir = Math.sin(th) < -0.25 || Math.cos(th) > 0.8; if (!cdir) continue;
        var rr = MAP_R[i]; var x0 = MAPC[0] + Math.cos(th) * rr, y0 = MAPC[1] + Math.sin(th) * rr;
        g.moveTo(x0, y0); g.lineTo(x0 - Math.cos(th) * 10, y0 - Math.sin(th) * 10 + 4);
      }
      g.stroke();
    }
    // 树冠（点画）
    var rt = RNG(1901), nT = K.byModel(q, 500, 1300, 2600);
    g.save();
    var dark = [], lite = [];
    for (i = 0; i < nT; i++) {
      var tx = rt.range(80, 1840), ty = rt.range(40, 960);
      mapInfo(tx, ty, I);
      if (I[0] < 0.03 || I[2] > 0.55 || rt() < I[2] * 1.5) continue;
      var tr = rt.range(5, 11) * (1 - I[2]);
      dark.push(tx + 2.5, ty + 3, tr); lite.push(tx - 1, ty - 1.5, tr * 0.65);
    }
    g.beginPath(); for (i = 0; i < dark.length; i += 3) { g.moveTo(dark[i] + dark[i + 2], dark[i + 1]); g.arc(dark[i], dark[i + 1], dark[i + 2], 0, TAU); } g.fillStyle = 'rgba(12,20,16,0.55)'; g.fill();
    g.beginPath(); for (i = 0; i < lite.length; i += 3) { g.moveTo(lite[i] + lite[i + 2], lite[i + 1]); g.arc(lite[i], lite[i + 1], lite[i + 2], 0, TAU); } g.fillStyle = 'rgba(70,92,72,0.55)'; g.fill();
    g.restore();
    // 小路
    var paths = [['pier', 'mansion', 60], ['mansion', 'courtyard', 0], ['courtyard', 'tower', 20], ['mansion', 'judgment', -40], ['judgment', 'shrine', 30], ['tower', 'beach', -30], ['mansion', 'hut', -50], ['hut', 'seacave', 40]];
    g.save(); g.setLineDash && g.setLineDash([10, 9]);
    for (i = 0; i < paths.length; i++) {
      var a = node(paths[i][0]), b = node(paths[i][1]), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ddx = b[0] - a[0], ddy = b[1] - a[1], dl = Math.sqrt(ddx * ddx + ddy * ddy) || 1, off = paths[i][2];
      g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(mx - ddy / dl * off, my + ddx / dl * off, b[0], b[1]);
      g.strokeStyle = 'rgba(20,18,16,0.45)'; g.lineWidth = 6; g.stroke();
      g.strokeStyle = 'rgba(200,186,150,0.6)'; g.lineWidth = 3; g.stroke();
    }
    g.restore();
    // 飞鸦祭缆索：神社 → 塔顶
    var sN = node('shrine'), tN = node('tower');
    g.beginPath(); g.moveTo(sN[0] + 16, sN[1] - 10); g.quadraticCurveTo((sN[0] + tN[0]) / 2, (sN[1] + tN[1]) / 2 + 30, tN[0], tN[1] - 8);
    strokeP(g, 'rgba(10,8,12,0.75)', 2);
    // 地标
    mapPier(g, q, node('pier'));
    mapMansion(g, q, node('mansion'), node('courtyard'));
    mapTower(g, q, tN);
    mapJudgment(g, q, node('judgment'));
    mapShrine(g, q, sN);
    mapBeach(g, q, node('beach'));
    mapCave(g, q, node('seacave'));
    mapHut(g, q, node('hut'));
    // 雾带与云
    if (q.light >= 1) {
      var rm = RNG(1911);
      for (i = 0; i < K.byModel(q, 4, 8, 12); i++) { var fx = rm.range(0, W), fy = rm.range(0, H); g.save(); g.translate(fx, fy); g.scale(1, 0.35); K.blob(g, 0, 0, rm.range(140, 320), '#c8ccd8', rm.range(0.08, 0.16)); g.restore(); }
    }
    mapCompass(g, q, 1790, 960);
    K.vignette(g, W, H, 0.55, 0.4);
  }
  function mapShadow(g, q, fn, dx, dy) { if (q.light < 1) return; g.save(); g.translate(dx, dy); fn(true); g.restore(); }
  function mapPier(g, q, p) {
    var x = p[0], y = p[1];
    // 栈桥伸向西南的海面
    g.save(); g.translate(x, y); g.rotate(0.9);
    if (q.light >= 1) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(-6, 4, 16, 96); }
    rectP(g, -8, 0, 16, 92); fillP(g, '#8a7254');
    g.strokeStyle = 'rgba(40,30,20,0.6)'; g.lineWidth = 1; g.beginPath(); for (var k = 6; k < 92; k += 6) { g.moveTo(-8, k); g.lineTo(8, k); } g.stroke();
    rectP(g, -20, 84, 40, 10); fillP(g, '#7a6248');
    // 小船
    K.ellipse(g, 26, 60, 7, 18); fillP(g, '#6a8080');
    g.restore();
    // 船屋
    rectP(g, x - 44, y - 30, 34, 26); if (q.light >= 1) { g.save(); g.translate(5, 5); rectP(g, x - 44, y - 30, 34, 26); fillP(g, 'rgba(0,0,0,0.4)'); g.restore(); rectP(g, x - 44, y - 30, 34, 26); }
    fillP(g, '#5a3e2e'); K.poly(g, [x - 44, y - 30, x - 10, y - 30, x - 10, y - 17, x - 44, y - 17]); fillP(g, '#7a5a42');
    // 码头石岸
    rectP(g, x - 8, y - 18, 40, 16); fillP(g, '#6a6872');
  }
  function mapRoofBlock(g, q, x, y, w, h, rot, col) {
    if (h > w) { var tmp = w; w = h; h = tmp; rot += PI / 2; }
    g.save(); g.translate(x, y); g.rotate(rot);
    if (q.light >= 1) { g.save(); g.rotate(-rot); g.translate(6, 7); g.rotate(rot); g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(-w / 2, -h / 2, w, h); g.restore(); }
    rectP(g, -w / 2, -h / 2, w, h); fillP(g, col);
    K.poly(g, [-w / 2, -h / 2, w / 2, -h / 2, w / 2 - h / 2, 0, -w / 2 + h / 2, 0]); fillP(g, K.shade(col, 0.18));   // 迎光的屋面
    K.poly(g, [-w / 2, h / 2, w / 2, h / 2, w / 2 - h / 2, 0, -w / 2 + h / 2, 0]); fillP(g, K.shade(col, -0.3));
    g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-w / 2 + h / 2, 0); g.lineTo(w / 2 - h / 2, 0); g.stroke();
    g.restore();
  }
  function mapMansion(g, q, p, cy) {
    var rot = -0.62, col = '#3a3a48';
    // 中庭（铺石广场、喷泉、温室）
    g.save(); g.translate(cy[0], cy[1]); g.rotate(rot);
    rectP(g, -62, -52, 124, 104); fillP(g, '#77757e');
    if (q.model >= 1) { g.strokeStyle = 'rgba(40,40,46,0.35)'; g.lineWidth = 1; g.beginPath(); for (var k = -52; k <= 52; k += 10) { g.moveTo(-62, k); g.lineTo(62, k); } g.stroke(); }
    K.ellipse(g, -26, 10, 12, 12); fillP(g, '#9a9aa4'); K.ellipse(g, -26, 10, 7, 7); fillP(g, '#5a6a7a');
    rectP(g, 14, -40, 40, 26); fillP(g, 'rgba(170,190,200,0.55)'); g.strokeStyle = '#3a3530'; g.lineWidth = 1.5; g.strokeRect(14, -40, 40, 26);
    g.restore();
    // 本馆（凹字形）+ 两翼抱住中庭
    function L(lx, ly) { return [p[0] + lx * Math.cos(rot) - ly * Math.sin(rot), p[1] + lx * Math.sin(rot) + ly * Math.cos(rot)]; }
    var a = L(208, -128), b = L(208, 12), c = L(122, -58);
    mapRoofBlock(g, q, a[0], a[1], 150, 40, rot, col);       // 北翼
    mapRoofBlock(g, q, b[0], b[1], 150, 40, rot, col);       // 南翼
    mapRoofBlock(g, q, p[0], p[1], 250, 60, rot, col);       // 本馆
    mapRoofBlock(g, q, c[0], c[1], 44, 180, rot, '#34343f'); // 连接中庭的西翼
    // 亮着的窗（暖点）
    if (q.light >= 1) { K.glow(g, p[0] - 20, p[1] + 10, 22, '#ffb860', 0.5); K.glow(g, p[0] + 60, p[1] - 30, 18, '#ffb860', 0.45); }
  }
  function mapTower(g, q, p) {
    var x = p[0], y = p[1];
    if (q.light >= 1) { g.save(); g.translate(x, y); g.rotate(0.75); g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(0, -14, 70, 28); g.restore(); }
    rectP(g, x - 20, y - 20, 40, 40); fillP(g, '#3a3844');
    K.poly(g, [x - 20, y - 20, x + 20, y - 20, x, y]); fillP(g, '#5a5866');
    K.poly(g, [x - 20, y - 20, x - 20, y + 20, x, y]); fillP(g, '#4a4856');
    K.poly(g, [x + 20, y - 20, x + 20, y + 20, x, y]); fillP(g, '#2a2832');
    K.poly(g, [x - 20, y + 20, x + 20, y + 20, x, y]); fillP(g, '#22202a');
  }
  function mapJudgment(g, q, p) {
    var x = p[0], y = p[1];
    if (q.light >= 1) { K.ellipse(g, x + 7, y + 8, 46, 46); fillP(g, 'rgba(0,0,0,0.45)'); }
    K.ellipse(g, x, y, 46, 46); fillP(g, '#5e5c66');
    K.ellipse(g, x, y, 38, 38); fillP(g, '#3a3842');
    for (var s2 = 0; s2 < 12; s2++) { var a0 = s2 / 12 * TAU, a1 = a0 + TAU / 12; g.beginPath(); g.moveTo(x, y); g.arc(x, y, 38, a0, a1); g.closePath(); var lt = 0.5 + 0.5 * Math.cos(a0 + PI / 12 + 2.3); fillP(g, K.mix('#2a2832', '#7a7884', lt)); }
    K.ellipse(g, x, y, 6, 6); fillP(g, '#8a8894');
    g.fillStyle = '#4a4852';
    for (var k = 0; k < 14; k++) { var a = k / 14 * TAU; K.ellipse(g, x + Math.cos(a) * 41, y + Math.sin(a) * 41, 2.6, 2.6); g.fill(); }
  }
  function mapShrine(g, q, p) {
    var x = p[0], y = p[1];
    // 拜殿
    mapRoofBlock(g, q, x + 10, y - 10, 54, 30, 0.1, '#2e2e36');
    // 仓库
    mapRoofBlock(g, q, x + 52, y + 6, 22, 18, 0.1, '#3a3a40');
    // 鸟居（朱红）与参道
    g.strokeStyle = 'rgba(200,190,170,0.6)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x + 6, y + 8); g.lineTo(x - 16, y + 46); g.stroke();
    g.save(); g.translate(x - 14, y + 40); g.rotate(-0.5);
    if (q.light >= 1) { g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(-12, 3, 26, 5); }
    g.fillStyle = '#c04a30'; g.fillRect(-14, -2, 28, 5); g.fillRect(-10, -5, 4, 10); g.fillRect(6, -5, 4, 10);
    g.restore();
    // 缆索起点的高台
    K.ellipse(g, x + 18, y - 12, 4, 4); fillP(g, '#2a2420');
  }
  function mapBeach(g, q, p) {
    var x = p[0], y = p[1];
    // 从崖上下到沙滩的石阶
    g.strokeStyle = 'rgba(200,196,186,0.7)'; g.lineWidth = 2; g.beginPath();
    for (var k = 0; k < 6; k++) { g.moveTo(x - 50 + k * 5, y + 26 - k * 4); g.lineTo(x - 42 + k * 5, y + 26 - k * 4); }
    g.stroke();
    if (q.light >= 1) { g.strokeStyle = 'rgba(240,240,245,0.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 60, y - 34); g.quadraticCurveTo(x, y - 46, x + 70, y - 36); g.stroke(); }
  }
  function mapCave(g, q, p) {
    var x = p[0] + 40, y = p[1];
    K.ellipse(g, x, y, 20, 13, 0.3); fillP(g, '#06060a');
    if (q.light >= 1) { K.ellipse(g, x - 4, y - 4, 20, 13, 0.3); strokeP(g, 'rgba(200,205,220,0.35)', 2); }
    g.strokeStyle = 'rgba(230,232,240,0.5)'; g.lineWidth = 2; g.beginPath(); g.arc(x + 8, y, 26, -0.9, 0.9); g.stroke();
    // 通往小屋背后的岩缝
    g.save(); g.setLineDash && g.setLineDash([4, 6]); g.beginPath(); g.moveTo(x - 18, y + 6); g.quadraticCurveTo(x - 120, y + 120, p[0] - 330, p[1] + 280); strokeP(g, 'rgba(10,10,14,0.5)', 2); g.restore();
  }
  function mapHut(g, q, p) {
    var x = p[0], y = p[1];
    rectP(g, x - 34, y + 8, 30, 20); fillP(g, 'rgba(110,100,60,0.6)');   // 菜园
    if (q.model >= 1) { g.strokeStyle = 'rgba(60,50,30,0.5)'; g.lineWidth = 1; g.beginPath(); for (var k = 0; k < 5; k++) { g.moveTo(x - 34, y + 10 + k * 4); g.lineTo(x - 4, y + 10 + k * 4); } g.stroke(); }
    mapRoofBlock(g, q, x + 8, y, 30, 22, 0.25, '#5a4030');
  }
  function mapCompass(g, q, x, y) {
    g.save(); g.translate(x, y); g.globalAlpha = 0.55;
    K.ellipse(g, 0, 0, 44, 44); strokeP(g, 'rgba(210,200,170,0.6)', 2);
    K.ellipse(g, 0, 0, 36, 36); strokeP(g, 'rgba(210,200,170,0.3)', 1);
    for (var k = 0; k < 4; k++) {
      g.save(); g.rotate(k * PI / 2);
      K.poly(g, [0, -50, 7, -7, 0, 0]); fillP(g, k === 0 ? '#d8c8a0' : '#a89878');
      K.poly(g, [0, -50, -7, -7, 0, 0]); fillP(g, k === 0 ? '#9a8a64' : '#6a5e48');
      g.restore();
    }
    g.restore();
  }
  DM.HDBG.def('map', {
    outdoor: false,
    draw: function (g, q) { drawMap(g, q); },
    lights: [],
    key: { x: -0.4, color: '#d0d4e0', amb: '#303848', rim: 0.2 }
  });

})(typeof window !== 'undefined' ? window : globalThis);
