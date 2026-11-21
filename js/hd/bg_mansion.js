/* 月蚀馆室内 HD 背景（DM.HDBG）
 * ------------------------------------------------------------------
 * hall dining lounge kitchen music cellar(+swapped) east_corridor west_corridor
 * east_room(+burnt) west_room infirmary service_nook
 * 设计坐标 1920x1080；锚点 = locations.js × 4。
 * 光照流程：先画「反照率」（物体本色），再画 AO/接触阴影/投影，
 * 然后用低分辨率光照贴图做 multiply（环境光 + 灯/窗光池），最后叠加自发光（烛火、灯泡、高光、光柱、浮尘）。
 * 规则：ES5；不用 ctx.filter / Path2D / roundRect；shadowBlur 只经 K.shadow；确定性随机（K.rng）。
 */
(function (root) {
  'use strict';
  var DM = root.DM = root.DM || {};
  var K = DM.HK;
  if (!K || !DM.HDBG) return;
  var W = K.DW, H = K.DH, PI = Math.PI, TAU = PI * 2;

  /* ================================================================
   * 0. 小工具
   * ================================================================ */
  var KX = -0.3;                       // 当前房间主光的水平方向（-1 左 … 1 右），用于倒角/高光
  function setKey(kx) { KX = kx; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function fillP(g, pts, st) { K.poly(g, pts); g.fillStyle = st; g.fill(); }
  function rect(g, x, y, w, h, st) { g.fillStyle = st; g.fillRect(x, y, w, h); }
  function hi(a) { return 'rgba(255,238,214,' + a + ')'; }
  function lo(a) { return 'rgba(0,0,0,' + a + ')'; }
  function circle(g, x, y, r, st) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = st; g.fill(); }
  function ell(g, x, y, rx, ry, st) { K.ellipse(g, x, y, rx, ry); g.fillStyle = st; g.fill(); }
  function stroke(g, w, st) { g.lineWidth = w; g.strokeStyle = st; g.stroke(); }
  function seg(g, x0, y0, x1, y1, w, st) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); stroke(g, w, st); }
  function M(q, a, b, c) { return K.byModel(q, a, b, c); }
  // 水平方向的圆柱明暗（腿、柱、管子、瓶子）
  function cylGrad(g, x, w, col, o) {
    o = o || {};
    var hl = KX <= 0 ? 0.3 : 0.7;
    return K.lin(g, x, 0, x + w, 0, [
      [0, K.shade(col, -0.55)], [Math.max(0.05, hl - 0.22), K.shade(col, -0.05)],
      [hl, K.shade(col, o.spec || 0.28)], [Math.min(0.95, hl + 0.2), col], [1, K.shade(col, -0.6)]]);
  }
  function cyl(g, x, y, w, h, col, o) { g.fillStyle = cylGrad(g, x, w, col, o); g.fillRect(x, y, w, h); }
  // 金属（黄铜/青铜/铁）渐变
  function metalGrad(g, x0, y0, x1, y1, base) {
    return K.lin(g, x0, y0, x1, y1, [[0, K.shade(base, -0.6)], [0.3, K.shade(base, -0.1)], [0.45, K.shade(base, 0.45)],
      [0.55, K.shade(base, 0.1)], [0.8, K.shade(base, -0.35)], [1, K.shade(base, -0.65)]]);
  }
  // 纹理填充（非等比缩放、可选旋转）；tex=0 时回退纯色
  function texFill(g, q, fallback, t, ox, oy, sx, sy, alpha) {
    if (!t || q.tex <= 0) { if (alpha !== undefined) { g.save(); g.globalAlpha *= alpha; } g.fillStyle = fallback; g.fill(); if (alpha !== undefined) g.restore(); return; }
    var size = K.tileSize(q, t[2]), tile = K.tex(t[0], t[1], size);
    var pat = g.createPattern(tile, 'repeat');
    g.save(); if (alpha !== undefined) g.globalAlpha *= alpha;
    g.translate(ox || 0, oy || 0); var m = t[2] / tile.width; g.scale(m * (sx || 1), m * (sy || 1));
    g.fillStyle = pat; g.fill(); g.restore();
  }
  // 倒角叠加（凸起面板）：上/左（受光侧）亮，下/右暗
  function bevel(g, x, y, w, h, b, ha, la) {
    ha = ha === undefined ? 0.16 : ha; la = la === undefined ? 0.38 : la;
    fillP(g, [x, y, x + w, y, x + w - b, y + b, x + b, y + b], hi(ha));
    fillP(g, [x, y + h, x + b, y + h - b, x + w - b, y + h - b, x + w, y + h], lo(la));
    var L = KX <= 0, l1 = L ? hi(ha * 0.7) : lo(la * 0.6), r1 = L ? lo(la * 0.7) : hi(ha * 0.6);
    fillP(g, [x, y, x + b, y + b, x + b, y + h - b, x, y + h], l1);
    fillP(g, [x + w, y, x + w, y + h, x + w - b, y + h - b, x + w - b, y + b], r1);
  }
  // 凹槽（凹面板，明暗与倒角相反）
  function groove(g, x, y, w, h, b, a) {
    a = a === undefined ? 0.4 : a;
    fillP(g, [x, y, x + w, y, x + w - b, y + b, x + b, y + b], lo(a));
    fillP(g, [x, y + h, x + b, y + h - b, x + w - b, y + h - b, x + w, y + h], hi(a * 0.35));
    fillP(g, [x, y, x + b, y + b, x + b, y + h - b, x, y + h], KX <= 0 ? lo(a * 0.8) : hi(a * 0.3));
    fillP(g, [x + w, y, x + w, y + h, x + w - b, y + h - b, x + w - b, y + b], KX <= 0 ? hi(a * 0.3) : lo(a * 0.8));
  }
  // 柔和矩形阴影（多层叠加近似模糊，不用 shadowBlur）
  function softRect(g, x, y, w, h, r, a, col) {
    col = col || '#000';
    var n = 4;
    for (var i = 0; i < n; i++) {
      var e = r * (1 - i / n);
      K.rr(g, x - e, y - e, w + e * 2, h + e * 2, e + 2);
      g.fillStyle = K.rgba(col, a / n); g.fill();
    }
  }
  function softPoly(g, pts, a, n, grow, cx, cy) {
    n = n || 3;
    for (var i = 0; i < n; i++) {
      var k = 1 + grow * (1 - i / n), arr = [];
      for (var j = 0; j < pts.length; j += 2) arr.push(cx + (pts[j] - cx) * k, cy + (pts[j + 1] - cy) * k);
      fillP(g, arr, lo(a / n));
    }
  }
  // 线脚：从上往下的一组色带 [[高度, 颜色], ...]
  function bands(g, x, y, w, list) {
    var yy = y;
    for (var i = 0; i < list.length; i++) { g.fillStyle = list[i][1]; g.fillRect(x, yy, w, list[i][0]); yy += list[i][0]; }
    return yy;
  }

  /* ================================================================
   * 1. 透视房间
   * ================================================================ */
  // 后墙铺满画面；vx,vy 消失点；base 后墙墙脚 y；top 后墙顶 y；f 相机到后墙的距离（设计像素）
  function Room(vx, vy, base, top, f) {
    var R = { vx: vx, vy: vy, base: base, top: top, f: f || 1500 };
    R.dB = (H - vy) / (base - vy);
    R.p = function (x, y, k) { return [vx + (x - vx) * k, vy + (y - vy) * k]; };
    R.px = function (x, k) { return vx + (x - vx) * k; };
    R.py = function (y, k) { return vy + (y - vy) * k; };
    R.dAt = function (y) { return (y - vy) / (base - vy); };       // 地面 y → 深度缩放（后墙=1）
    R.yAt = function (d) { return vy + (base - vy) * d; };
    R.kWall = function (yf) { return (base - vy) / (yf - vy); };    // 前缘落地在 yf、背面贴后墙时的 k
    // 地面坐标（X 为后墙上的 x，d 为深度缩放）→ 屏幕
    R.fp = function (X, d) { return [vx + (X - vx) * d, vy + (base - vy) * d]; };
    return R;
  }
  // 透视长方体的各个可见面：front 正面 (x,y,w,h)，k 背面缩放（<1）
  function boxGeo(R, x, y, w, h, k) {
    var p = R.p, tl = p(x, y, k), tr = p(x + w, y, k), bl = p(x, y + h, k), br = p(x + w, y + h, k);
    return {
      x: x, y: y, w: w, h: h, k: k, tl: tl, tr: tr, bl: bl, br: br,
      front: [x, y, x + w, y, x + w, y + h, x, y + h],
      top: y > R.vy ? [x, y, x + w, y, tr[0], tr[1], tl[0], tl[1]] : null,
      bottom: y + h < R.vy ? [x, y + h, x + w, y + h, br[0], br[1], bl[0], bl[1]] : null,
      left: x > R.vx ? [x, y, tl[0], tl[1], bl[0], bl[1], x, y + h] : null,
      right: x + w < R.vx ? [x + w, y, x + w, y + h, br[0], br[1], tr[0], tr[1]] : null
    };
  }
  // 画一个带材质的盒子。o: { col, t:纹理, top, side, front:false, edge:高光 }
  function box(g, q, R, x, y, w, h, k, o) {
    o = o || {};
    var b = boxGeo(R, x, y, w, h, k), col = o.col || '#4a2c1a';
    var sideL = KX < 0 ? 0.06 : -0.3, sideR = KX < 0 ? -0.32 : 0.04;
    if (b.left && o.sides !== false) { K.poly(g, b.left); texFill(g, q, o.sideCol || col, o.t); fillP(g, b.left, sideL >= 0 ? hi(sideL) : lo(-sideL)); }
    if (b.right && o.sides !== false) { K.poly(g, b.right); texFill(g, q, o.sideCol || col, o.t); fillP(g, b.right, sideR >= 0 ? hi(sideR) : lo(-sideR)); }
    if (b.bottom && o.bottomFace !== false) fillP(g, b.bottom, K.shade(col, -0.6));
    if (b.top && o.topFace !== false) {
      K.poly(g, b.top); texFill(g, q, o.topCol || K.shade(col, 0.1), o.tt || o.t);
      K.poly(g, b.top); g.fillStyle = K.lin(g, 0, b.tl[1], 0, y, [hi(0.02), hi(o.topHi === undefined ? 0.14 : o.topHi)]); g.fill();
    }
    if (o.front !== false) {
      K.rr(g, x, y, w, h, 0); texFill(g, q, col, o.t);
      g.fillStyle = K.lin(g, 0, y, 0, y + h, [hi(0.05), lo(o.frontLo === undefined ? 0.22 : o.frontLo)]); g.fillRect(x, y, w, h);
    }
    if (o.edge !== false && q.light >= 1 && b.top) { g.fillStyle = hi(0.22); g.fillRect(x, y, w, Math.max(1.2, h * 0.01)); }
    return b;
  }

  /* ================================================================
   * 2. 材质预设（纹理参数固定，以便各背景共享缓存）
   * ================================================================ */
  var TX = {
    walnut:  ['wood', { c1: '#2c180c', c2: '#5e3a20', gap: '#2c180c', planks: 1, dir: 'v', seed: 3, ring: 3 }, 200],
    walnutH: ['wood', { c1: '#2c180c', c2: '#5e3a20', gap: '#2c180c', planks: 1, dir: 'h', seed: 4, ring: 3 }, 200],
    oak:     ['wood', { c1: '#4a3018', c2: '#86603a', gap: '#4a3018', planks: 1, dir: 'v', seed: 5, ring: 2.5 }, 200],
    oakH:    ['wood', { c1: '#4a3018', c2: '#86603a', gap: '#4a3018', planks: 1, dir: 'h', seed: 6, ring: 2.5 }, 200],
    mahog:   ['wood', { c1: '#2a0e0a', c2: '#5c2416', gap: '#2a0e0a', planks: 1, dir: 'v', seed: 8, ring: 3.5 }, 200],
    mahogH:  ['wood', { c1: '#2a0e0a', c2: '#5c2416', gap: '#2a0e0a', planks: 1, dir: 'h', seed: 9, ring: 3.5 }, 200],
    pine:    ['wood', { c1: '#5a4026', c2: '#9a7448', gap: '#5a4026', planks: 1, dir: 'v', seed: 11, ring: 2 }, 200],
    pineH:   ['wood', { c1: '#5a4026', c2: '#9a7448', gap: '#5a4026', planks: 1, dir: 'h', seed: 12, ring: 2 }, 200],
    floorW:  ['wood', { c1: '#3a2212', c2: '#6c4626', gap: '#3a2212', planks: 1, dir: 'v', seed: 21, ring: 2.4 }, 128],
    floorO:  ['wood', { c1: '#4a3220', c2: '#8a6640', gap: '#4a3220', planks: 1, dir: 'v', seed: 22, ring: 2.2 }, 128],
    stoneW:  ['stone', { c1: '#3a3640', c2: '#6c6672', mortar: '#1e1a22', rows: 4, cols: 3, seed: 31, irregular: 1 }, 300],
    flag:    ['noise', { c1: '#3a3840', c2: '#5e5a66', scale: 5, oct: 4, seed: 33, contrast: 1.3 }, 200],
    marbleW: ['noise', { c1: '#a8a2a8', c2: '#e6e0e0', scale: 4, oct: 5, seed: 35, contrast: 1.6 }, 220],
    marbleG: ['noise', { c1: '#0c1612', c2: '#3e4e46', scale: 4, oct: 5, seed: 37, contrast: 1.7 }, 220],
    marbleB: ['noise', { c1: '#0c0a0e', c2: '#2e2832', scale: 4, oct: 5, seed: 36, contrast: 1.6 }, 220],
    plasterW: ['plaster', { c1: '#8a8690', c2: '#a8a4ac', seed: 41, stain: 0.3 }, 300],
    plasterG: ['plaster', { c1: '#4a4650', c2: '#5e5a64', seed: 42, stain: 0.5 }, 300],
    linen:   ['fabric', { c1: '#c8c2b8', c2: '#f2eee6', threads: 48, seed: 51 }, 60],
    velvet:  ['fabric', { c1: '#4a0c18', c2: '#7a1a2a', threads: 40, seed: 52 }, 80],
    velvetB: ['fabric', { c1: '#1a1c3a', c2: '#2e3260', threads: 40, seed: 53 }, 80],
    velvetG: ['fabric', { c1: '#1a2a1e', c2: '#2e4a34', threads: 40, seed: 54 }, 80],
    brass:   ['metal', { c1: '#6a4a1e', c2: '#d8b46a', seed: 61 }, 120],
    iron:    ['metal', { c1: '#202024', c2: '#55555e', seed: 62 }, 120],
    paper:   ['paper', { c1: '#cfc4a8', c2: '#efe6d0', seed: 71 }, 120],
    grain:   ['noise', { c1: '#000000', c2: '#ffffff', scale: 32, oct: 2, seed: 77, contrast: 1.2 }, 96],
    mottle:  ['noise', { c1: '#000000', c2: '#ffffff', scale: 3, oct: 4, seed: 79, contrast: 1.4 }, 420]
  };
  // 壁纸预设
  function paperTex(c1, c2, line, seed) { return ['wallpaper', { c1: c1, c2: c2, line: line || null, seed: seed || 53 }, 150]; }

  /* ================================================================
   * 3. 墙面：壁纸、护墙板、线脚、壁柱
   * ================================================================ */
  function paperWall(g, q, x, y, w, h, o) {
    g.beginPath(); g.rect(x, y, w, h);
    texFill(g, q, o.c1, paperTex(o.c1, o.c2, o.line, o.seed));
    if (q.tex <= 0) {
      // 低画质：用竖向条纹暗示壁纸
      g.save(); g.globalAlpha = 0.18; g.fillStyle = o.c2;
      for (var sx = x + 30; sx < x + w; sx += 75) g.fillRect(sx, y, 14, h);
      g.restore();
    } else if (q.tex >= 2 && o.age) {
      g.save(); g.globalCompositeOperation = 'overlay'; g.beginPath(); g.rect(x, y, w, h);
      texFill(g, q, '#808080', TX.mottle, 0, 0, 1, 1, o.age); g.restore();
    }
    // 上暗下亮的基础明暗
    g.fillStyle = K.lin(g, 0, y, 0, y + h, [[0, lo(0.35)], [0.35, lo(0.05)], [1, lo(0.12)]]);
    g.fillRect(x, y, w, h);
  }
  // 灰泥墙
  function plasterWall(g, q, x, y, w, h, o) {
    g.beginPath(); g.rect(x, y, w, h);
    texFill(g, q, o.col, o.t || TX.plasterW);
    if (o.tint) { g.save(); g.globalCompositeOperation = 'multiply'; rect(g, x, y, w, h, o.tint); g.restore(); }
    g.fillStyle = K.lin(g, 0, y, 0, y + h, [[0, lo(0.3)], [0.4, lo(0.04)], [1, lo(0.1)]]);
    g.fillRect(x, y, w, h);
  }
  // 护墙板：segs 为不被遮挡的墙段 [[x0,x1],...]；在每段内均分面板
  function wainscot(g, q, segs, top, base, o) {
    o = o || {};
    var t = o.t || TX.walnut, col = o.col || '#3e2414', pw = o.pw || 150;
    var railH = 22, skirt = o.skirt || 40;
    for (var i = 0; i < segs.length; i++) {
      var x0 = segs[i][0], x1 = segs[i][1], w = x1 - x0;
      g.beginPath(); g.rect(x0, top, w, base - top); texFill(g, q, col, t);
      g.fillStyle = K.lin(g, 0, top, 0, base, [hi(0.04), lo(0.2)]); g.fillRect(x0, top, w, base - top);
      // 面板
      var n = Math.max(1, Math.round(w / pw)), m = 18, cw = (w - m) / n;
      var py0 = top + railH + 16, py1 = base - skirt - 14;
      if (py1 - py0 > 30 && w > 50) {
        for (var j = 0; j < n; j++) {
          var px = x0 + m + j * cw, pww = cw - m;
          if (pww < 20) continue;
          if (q.model >= 1) {
            groove(g, px, py0, pww, py1 - py0, 4, 0.45);
            g.beginPath(); g.rect(px + 6, py0 + 6, pww - 12, py1 - py0 - 12); texFill(g, q, K.shade(col, 0.06), t, 37 * j, 0);
            bevel(g, px + 6, py0 + 6, pww - 12, py1 - py0 - 12, Math.min(12, pww * 0.12), 0.14, 0.34);
          } else {
            g.strokeStyle = lo(0.4); g.lineWidth = 3; g.strokeRect(px, py0, pww, py1 - py0);
            g.strokeStyle = hi(0.08); g.lineWidth = 1.5; g.strokeRect(px + 3, py0 + 3, pww - 6, py1 - py0 - 6);
          }
        }
      }
      // 顶部扶手线（chair rail）
      bands(g, x0, top - 4, w, [[2, lo(0.5)], [3, hi(0.32)], [7, K.shade(col, 0.18)], [3, K.shade(col, -0.25)], [5, K.shade(col, 0.05)], [2, hi(0.18)], [4, K.shade(col, -0.35)]]);
      if (q.light >= 1) { g.fillStyle = K.lin(g, 0, top + 22, 0, top + 40, [lo(0.35), lo(0)]); g.fillRect(x0, top + 22, w, 18); }
      // 踢脚
      bands(g, x0, base - skirt, w, [[3, hi(0.25)], [4, K.shade(col, 0.1)], [3, lo(0.5)], [skirt - 10, K.shade(col, -0.22)]]);
    }
  }
  // 顶部檐口（墙与天花板交界）
  function cornice(g, q, x, y, w, col, o) {
    o = o || {};
    var hh = o.h || 46;
    var yy = bands(g, x, y, w, [[3, lo(0.6)], [6, K.shade(col, 0.25)], [4, K.shade(col, -0.2)], [10, K.shade(col, 0.1)], [3, hi(0.3)], [8, K.shade(col, -0.1)], [4, K.shade(col, 0.2)], [hh - 38, K.shade(col, -0.3)]]);
    if (q.model >= 2 && o.dentil !== false) {
      // 齿饰
      for (var dx = x + 6; dx < x + w; dx += 22) { rect(g, dx, y + 23, 11, 9, K.shade(col, 0.18)); rect(g, dx + 11, y + 23, 2, 9, lo(0.4)); }
    }
    if (q.light >= 1) { g.fillStyle = K.lin(g, 0, yy, 0, yy + 30, [lo(0.4), lo(0)]); g.fillRect(x, yy, w, 30); }
    return yy;
  }
  // 壁柱
  function pilaster(g, q, x, y, w, h, col, t) {
    g.beginPath(); g.rect(x, y, w, h); texFill(g, q, col, t);
    g.fillStyle = cylGrad(g, x, w, '#808080'); g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.55; g.fillRect(x, y, w, h); g.restore();
    if (q.model >= 1) {
      // 凹槽（flutes）
      var n = Math.max(2, Math.floor(w / 14));
      for (var i = 1; i < n; i++) { var fx = x + w * i / n; rect(g, fx - 2, y + 40, 3, h - 80, lo(0.3)); rect(g, fx + 1, y + 40, 1.5, h - 80, hi(0.1)); }
    }
    // 柱头 / 柱础
    bands(g, x - 8, y, w + 16, [[4, hi(0.25)], [10, K.shade(col, 0.15)], [4, lo(0.4)], [8, K.shade(col, 0.05)], [3, lo(0.5)]]);
    bands(g, x - 8, y + h - 26, w + 16, [[3, hi(0.2)], [8, K.shade(col, 0.08)], [3, lo(0.4)], [12, K.shade(col, -0.15)]]);
    if (q.light >= 1) { g.fillStyle = K.lin(g, x + w, 0, x + w + 24, 0, [lo(KX < 0 ? 0.35 : 0.1), lo(0)]); g.fillRect(x + w, y, 24, h); }
  }
  // 天花板条带（后墙顶以上）：深色木梁向消失点汇聚
  function ceilingStrip(g, q, R, o) {
    o = o || {};
    var top = R.top, col = o.col || '#24160e';
    if (top <= 0) return;
    rect(g, 0, 0, W, top, K.shade(col, -0.2));
    if (o.t) { g.beginPath(); g.rect(0, 0, W, top); texFill(g, q, col, o.t, 0, 0, 1, 1, 0.6); }
    // 横梁（平行于后墙）
    var n = M(q, 1, 2, 3);
    for (var i = 1; i <= n; i++) {
      var d = 1 + i * 0.5, y = R.py(top, d);
      if (y < 0) break;
      rect(g, 0, y - 10 * d, W, 12 * d, K.shade(col, 0.08)); rect(g, 0, y + 2 * d, W, 3 * d, lo(0.5));
    }
    // 纵梁（汇聚）
    var step = o.step || 240;
    for (var X = -step * 4; X <= W + step * 4; X += step) {
      var p0 = [X, top], dx = X - R.vx, dy = top - R.vy, t = -top / dy, p1 = [X + dx * t, 0];
      var w0 = 16, w1 = 16 * (1 + t);
      fillP(g, [p0[0] - w0 / 2, p0[1], p0[0] + w0 / 2, p0[1], p1[0] + w1 / 2, 0, p1[0] - w1 / 2, 0], K.shade(col, 0.12));
      fillP(g, [p0[0] + w0 / 2, p0[1], p0[0] + w0 / 2 + 3, p0[1], p1[0] + w1 / 2 + 6, 0, p1[0] + w1 / 2, 0], lo(0.45));
    }
    g.fillStyle = K.lin(g, 0, 0, 0, top, [lo(0.55), lo(0.15)]); g.fillRect(0, 0, W, top);
  }

  /* ================================================================
   * 4. 地面
   * ================================================================ */
  // 透视木地板：木板朝消失点汇聚，逐板做仿射纹理映射
  function plankFloor(g, q, R, o) {
    o = o || {};
    var vx = R.vx, base = R.base, dB = R.dB, pw = o.pw || 70, rnd = K.rng(o.seed || 7);
    var far = o.far || '#2c1a0e', near = o.near || '#5a3a20', t = o.t || TX.floorW;
    K.poly(g, [0, base, W, base, W, H, 0, H]);
    g.fillStyle = K.lin(g, 0, base, 0, H, [far, near]); g.fill();
    var pat = null, N = 0;
    if (q.tex > 0) { N = K.tileSize(q, t[2]); pat = g.createPattern(K.tex(t[0], t[1], N), 'repeat'); }
    var Lz = (o.len || 7) * pw / R.f, zF = 1 / dB;
    for (var X = -pw; X < W + pw; X += pw) {
      var a0 = X, a1 = X + pw, f0 = vx + (a0 - vx) * dB, f1 = vx + (a1 - vx) * dB;
      if (f1 < -50 && a1 < 0) continue;
      if (f0 > W + 50 && a0 > W) continue;
      var pts = [a0, base, a1, base, f1, H, f0, H];
      if (pat) {
        g.save(); K.poly(g, pts); g.clip();
        var wf = f1 - f0, bx = f0 - a0, by = H - base, rep = 2 + rnd() * 1.5;
        g.globalAlpha = 0.95;
        g.transform(wf / N, 0, bx / (N * rep), by / (N * rep), a0, base);
        g.fillStyle = pat; g.fillRect(0, -N, N, N * (rep + 2));
        g.restore();
      }
      var tone = rnd.range(-1, 1);
      fillP(g, pts, tone > 0 ? hi(tone * 0.05) : lo(-tone * 0.16));
      // 端头接缝（错缝）
      if (q.model >= 1) {
        var z = 1 - rnd() * Lz;
        while (z > zF) {
          var d = 1 / z, y = R.yAt(d), xa = vx + (a0 - vx) * d, xb = vx + (a1 - vx) * d;
          rect(g, xa, y - 0.8 * d, xb - xa, 1.4 * d, lo(0.55));
          rect(g, xa, y + 0.6 * d, xb - xa, 0.8 * d, hi(0.06));
          z -= Lz * (0.8 + rnd() * 0.4);
        }
      }
    }
    // 板缝
    for (var X2 = -pw; X2 < W + 2 * pw; X2 += pw) {
      var fx = vx + (X2 - vx) * dB, s = KX <= 0 ? 1 : -1;
      fillP(g, [X2 - 0.7, base, X2 + 0.7, base, fx + 0.7 * dB, H, fx - 0.7 * dB, H], lo(0.6));
      if (q.model >= 1) fillP(g, [X2 + 0.7 * s, base, X2 + 1.4 * s, base, fx + 1.4 * dB * s, H, fx + 0.7 * dB * s, H], hi(0.07));
    }
    // 远处暗、近处略亮
    K.poly(g, [0, base, W, base, W, H, 0, H]);
    g.fillStyle = K.lin(g, 0, base, 0, H, [[0, lo(0.45)], [0.25, lo(0.12)], [1, lo(0)]]); g.fill();
  }
  // 透视方砖/石板地面。o: { tile, cols:[c1,c2] 棋盘或 null, t, mortar, seed, checker }
  function tileFloor(g, q, R, o) {
    o = o || {};
    var vx = R.vx, base = R.base, dB = R.dB, ts = o.tile || 110, rnd = K.rng(o.seed || 9);
    var zF = 1 / dB, dz = ts / R.f;
    K.poly(g, [0, base, W, base, W, H, 0, H]); g.fillStyle = o.mortar || '#141018'; g.fill();
    var gap = o.gap === undefined ? 2.2 : o.gap;
    var rows = [], z = 1;
    while (z > zF - dz) { rows.push(z); z -= dz; }
    for (var r = 0; r < rows.length; r++) {
      var dA = 1 / rows[r], dBn = rows[r] - dz > 0.05 ? 1 / (rows[r] - dz) : dB * 2;
      var yA = R.yAt(dA), yB = R.yAt(dBn);
      if (yA > H) break;
      var off = o.stagger ? (r % 2) * ts * 0.5 : 0;
      for (var X = -ts * 2 - off; X < W + ts * 2; X += ts) {
        var ga = gap * dA * 0.5, gb = gap * dBn * 0.5;
        var x0a = vx + (X - vx) * dA, x1a = vx + (X + ts - vx) * dA, x0b = vx + (X - vx) * dBn, x1b = vx + (X + ts - vx) * dBn;
        if (Math.max(x1a, x1b) < 0 || Math.min(x0a, x0b) > W) continue;
        var pts = [x0a + ga, yA + ga, x1a - ga, yA + ga, x1b - gb, yB - gb, x0b + gb, yB - gb];
        var ci = Math.round(X / ts + (o.stagger ? 0 : r)) & 1;
        var col = o.cols ? o.cols[ci] : o.col;
        var tv = rnd.range(-1, 1);
        K.poly(g, pts);
        var tt = o.ts ? o.ts[ci] : o.t;
        texFill(g, q, col, tt, x0a * 0.37, yA * 0.53, 1, 1);
        fillP(g, pts, tv > 0 ? hi(tv * (o.var || 0.05)) : lo(-tv * (o.var || 0.05) * 2.4));
        if (q.model >= 1 && o.bevel !== false) {
          // 砖面上缘受光、下缘暗
          fillP(g, [x0a + ga, yA + ga, x1a - ga, yA + ga, x1a - ga - 2 * dA, yA + ga + 2.5 * dA, x0a + ga + 2 * dA, yA + ga + 2.5 * dA], hi(0.08));
          fillP(g, [x0b + gb, yB - gb, x1b - gb, yB - gb, x1b - gb, yB - gb - 2.5 * dBn, x0b + gb, yB - gb - 2.5 * dBn], lo(0.25));
        }
      }
    }
    K.poly(g, [0, base, W, base, W, H, 0, H]);
    g.fillStyle = K.lin(g, 0, base, 0, H, [[0, lo(0.5)], [0.3, lo(0.12)], [1, lo(0)]]); g.fill();
  }
  // 地面上的四边形（地面坐标：X 为后墙 x，d 为深度缩放）
  function floorQuad(R, X0, X1, d0, d1) {
    var a = R.fp(X0, d0), b = R.fp(X1, d0), c = R.fp(X1, d1), e = R.fp(X0, d1);
    return [a[0], a[1], b[0], b[1], c[0], c[1], e[0], e[1]];
  }
  // 地毯（透视）：o: { col, border, gold, t, fringe, medallion }
  function rug(g, q, R, X0, X1, d0, d1, o) {
    o = o || {};
    var col = o.col || '#5a1220', bc = o.border || '#2a0a10', gold = o.gold || '#b08a48';
    // 毯面深度：用 z 线性插值得到真实透视
    function D(t) { var z0 = 1 / d0, z1 = 1 / d1; return 1 / (z0 + (z1 - z0) * t); }
    function Q(u0, u1, t0, t1) { return floorQuad(R, X0 + (X1 - X0) * u0, X0 + (X1 - X0) * u1, D(t0), D(t1)); }
    var all = Q(0, 1, 0, 1);
    if (q.light >= 1) softPoly(g, all, 0.35, 3, 0.012, R.vx, R.yAt((d0 + d1) / 2));
    K.poly(g, all); texFill(g, q, col, o.t || ['carpet', { c1: K.shade(col, -0.35), c2: col, c3: K.rgba(gold, 0.3), seed: 67 }, 120]);
    // 边框
    var bw = o.bw || 0.07, bt = bw * (X1 - X0) / ((1 / d0 - 1 / d1) * R.f) ;
    bt = clamp(bt, 0.03, 0.2);
    var frame = [Q(0, 1, 0, bt), Q(0, 1, 1 - bt, 1), Q(0, bw, bt, 1 - bt), Q(1 - bw, 1, bt, 1 - bt)];
    for (var i = 0; i < 4; i++) fillP(g, frame[i], K.rgba(bc, 0.85));
    // 金色细线
    var lines = [[bw * 0.35, bt * 0.35], [bw, bt]];
    for (var j = 0; j < lines.length; j++) {
      var u = lines[j][0], v = lines[j][1], qd = Q(u, 1 - u, v, 1 - v);
      K.poly(g, qd); g.lineWidth = 2.2 * Math.sqrt(d0 * d1) / 1.6; g.strokeStyle = K.rgba(gold, 0.55); g.stroke();
    }
    if (q.model >= 1 && o.medallion !== false) {
      // 中央菱形徽章
      var cx = 0.5, cyT = 0.5, pts = [], nn = 28;
      for (var k = 0; k < nn; k++) {
        var a = k / nn * TAU, rr = 0.5 + 0.12 * Math.cos(a * 4);
        var uu = cx + Math.cos(a) * 0.26 * rr, vv = cyT + Math.sin(a) * 0.3 * rr;
        var pp = R.fp(X0 + (X1 - X0) * uu, D(vv)); pts.push(pp[0], pp[1]);
      }
      fillP(g, pts, K.rgba(bc, 0.7));
      K.poly(g, pts); g.lineWidth = 2; g.strokeStyle = K.rgba(gold, 0.5); g.stroke();
      if (q.model >= 2) {
        var p2 = [];
        for (var k2 = 0; k2 < nn; k2++) {
          var a2 = k2 / nn * TAU, r2 = 0.5 + 0.2 * Math.cos(a2 * 4 + PI / 4);
          var pq = R.fp(X0 + (X1 - X0) * (0.5 + Math.cos(a2) * 0.13 * r2), D(0.5 + Math.sin(a2) * 0.15 * r2)); p2.push(pq[0], pq[1]);
        }
        fillP(g, p2, K.rgba(gold, 0.35));
      }
    }
    // 流苏（近端）
    if (o.fringe !== false && q.model >= 1) {
      var n2 = M(q, 0, 40, 80), dn = D(1), dnn = dn * 1.015;
      for (var f = 0; f <= n2; f++) {
        var Xf = X0 + (X1 - X0) * f / n2, pa = R.fp(Xf, dn), pb = R.fp(Xf, dnn);
        seg(g, pa[0], pa[1], pb[0], pb[1] + 5, 1.6, K.rgba('#d8c8a0', 0.6));
      }
    }
    // 绒面边缘的暗与亮
    K.poly(g, all); g.lineWidth = 2; g.strokeStyle = lo(0.4); g.stroke();
  }

  /* ================================================================
   * 5. 门、窗、窗帘、画框
   * ================================================================ */
  // 正面木门（含门框、门楣）。o: { t, col, double, knob:'l'|'r', panels, pediment, glass, plate, open }
  function door(g, q, R, x, y, w, h, o) {
    o = o || {};
    var col = o.col || '#4a2a18', t = o.t || TX.walnut, fw = o.frameW || Math.max(16, w * 0.1);
    var fcol = o.frameCol || K.shade(col, 0.05);
    // 门框阴影（投在墙上）
    if (q.light >= 1) softRect(g, x - fw + (KX < 0 ? 6 : -6), y - fw + 4, w + fw * 2, h + fw, 10, 0.35);
    // 门楣
    if (o.pediment && q.model >= 1) {
      var py = y - fw - 34;
      g.beginPath(); g.moveTo(x - fw - 18, py + 34); g.lineTo(x + w / 2, py - 40); g.lineTo(x + w + fw + 18, py + 34); g.closePath();
      texFill(g, q, fcol, t); fillP(g, [x - fw - 18, py + 34, x + w / 2, py - 40, x + w / 2, py - 26, x - fw + 4, py + 30], hi(0.12));
      fillP(g, [x + w + fw + 18, py + 34, x + w / 2, py - 40, x + w / 2, py - 26, x + w + fw - 4, py + 30], lo(0.3));
      bands(g, x - fw - 22, py + 30, w + fw * 2 + 44, [[3, hi(0.3)], [8, K.shade(fcol, 0.1)], [4, lo(0.45)], [6, K.shade(fcol, -0.1)]]);
    }
    // 门框
    g.beginPath(); g.rect(x - fw, y - fw, w + fw * 2, h + fw); texFill(g, q, fcol, t);
    bevel(g, x - fw, y - fw, w + fw * 2, h + fw, fw * 0.45, 0.2, 0.45);
    if (q.model >= 1) { g.strokeStyle = lo(0.35); g.lineWidth = 2; g.strokeRect(x - fw * 0.55, y - fw * 0.55, w + fw * 1.1, h + fw * 0.55); }
    // 门洞内侧（门樘，透视可见）
    var kd = 0.985, side = (x + w / 2) < R.vx ? 'l' : 'r';
    var ip = R.p(x, y, kd), ip2 = R.p(x + w, y + h, kd);
    rect(g, x, y, w, h, lo(0.9));
    if (side === 'l') fillP(g, [x, y, ip[0], ip[1], ip[0], ip2[1], x, y + h], K.shade(col, -0.35));
    else fillP(g, [x + w, y, x + w, y + h, ip2[0], ip2[1], ip2[0], ip[1]], K.shade(col, -0.35));
    fillP(g, [x, y, x + w, y, ip2[0], ip[1], ip[0], ip[1]], lo(0.6));
    var lx = ip[0], ly = ip[1], lw = ip2[0] - ip[0], lh = ip2[1] - ip[1];
    if (o.open) { o.open(g, lx, ly, lw, lh); return; }
    // 门扇
    var leaves = o.double ? 2 : 1, cw = lw / leaves;
    for (var L = 0; L < leaves; L++) {
      var dx = lx + L * cw;
      g.beginPath(); g.rect(dx, ly, cw, lh); texFill(g, q, col, t, L * 41, 0);
      g.fillStyle = K.lin(g, 0, ly, 0, ly + lh, [hi(0.06), lo(0.18)]); g.fillRect(dx, ly, cw, lh);
      // 面板
      var rows = o.panels || 3, m = cw * 0.14, gapy = lh * 0.045;
      var hs = o.glass ? [0.42, 0.22, 0.36] : rows === 2 ? [0.55, 0.45] : [0.22, 0.4, 0.38];
      var yy = ly + gapy;
      for (var r = 0; r < hs.length; r++) {
        var ph = (lh - gapy * (hs.length + 1)) * hs[r];
        var cols2 = cw > 120 && !o.double ? 2 : 1, pw2 = (cw - m * (cols2 + 1)) / cols2;
        for (var c = 0; c < cols2; c++) {
          var px = dx + m + c * (pw2 + m);
          if (o.glass && r === 0) {
            rect(g, px, yy, pw2, ph, '#1a1e2a');
            g.fillStyle = K.lin(g, px, yy, px + pw2, yy + ph, ['rgba(150,170,210,0.35)', 'rgba(40,50,70,0.2)', 'rgba(120,140,180,0.25)']); g.fillRect(px, yy, pw2, ph);
            groove(g, px, yy, pw2, ph, 3, 0.5);
          } else if (q.model >= 1) {
            groove(g, px, yy, pw2, ph, 3.5, 0.5);
            bevel(g, px + 5, yy + 5, pw2 - 10, ph - 10, Math.min(10, pw2 * 0.14), 0.13, 0.34);
          } else { g.strokeStyle = lo(0.45); g.lineWidth = 3; g.strokeRect(px, yy, pw2, ph); }
        }
        yy += ph + gapy;
      }
      // 合页 / 门把
      var knobLeft = o.double ? L === 1 : o.knob === 'l';
      var kx = knobLeft ? dx + cw * 0.1 : dx + cw * 0.9, ky = ly + lh * 0.52;
      if (q.model >= 1) {
        var hx = knobLeft ? dx + cw - 6 : dx + 2;
        if (!o.double) for (var hgi = 0; hgi < 3; hgi++) { var hy = ly + lh * [0.1, 0.5, 0.88][hgi]; g.fillStyle = metalGrad(g, hx, 0, hx + 5, 0, '#8a6a32'); g.fillRect(hx, hy, 5, 26); }
      }
      // 锁板 + 把手（黄铜）
      g.fillStyle = metalGrad(g, kx - 7, 0, kx + 7, 0, '#a07a3a'); K.rr(g, kx - 7, ky - 34, 14, 66, 6); g.fill();
      ell(g, kx, ky + 20, 2.4, 5, '#120a04');
      g.fillStyle = K.rad(g, kx - 3, ky - 4, 1, 10, ['#fff0c0', '#c9a25a', '#5a3a12']); circle(g, kx, ky - 2, 9, g.fillStyle);
      if (o.double && L === 0) rect(g, dx + cw - 1.5, ly, 3, lh, lo(0.6));
    }
    if (q.light >= 1) K.ao(g, lx, ly, lw, lh, 26, 0.35);
    // 门牌
    if (o.plate) {
      var pxm = lx + lw / 2, pym = ly + lh * 0.18;
      g.fillStyle = metalGrad(g, pxm - 18, pym - 12, pxm + 18, pym + 12, '#b08a48'); K.rr(g, pxm - 18, pym - 13, 36, 26, 4); g.fill();
      g.strokeStyle = lo(0.5); g.lineWidth = 1.2; g.stroke();
      K.text(g, o.plate, pxm, pym + 1, 18, '#2a1806', { weight: 'bold', font: 'Georgia,"Times New Roman",serif' });
    }
  }
  // 暴风雨中的窗外景色（阴天）
  function stormView(g, q, x, y, w, h, o) {
    o = o || {};
    var rnd = K.rng(o.seed || 5), hz = y + h * (o.horizon === undefined ? 0.62 : o.horizon);
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.fillStyle = K.lin(g, 0, y, 0, hz, [[0, '#3a4258'], [0.55, '#6a7288'], [1, '#a4a8b4']]); g.fillRect(x, y, w, hz - y + 1);
    // 云团
    var nc = M(q, 4, 9, 16);
    for (var i = 0; i < nc; i++) {
      var cx = x + rnd() * w, cy = y + rnd() * (hz - y) * 0.8, r = (0.25 + rnd() * 0.4) * Math.max(w, 120);
      K.blob(g, cx, cy, r, rnd() < 0.6 ? '#2a3044' : '#8a90a2', 0.25 + rnd() * 0.3);
    }
    if (q.model >= 1) for (var j = 0; j < 5; j++) { var sy = y + (hz - y) * (0.2 + j * 0.15); rect(g, x, sy, w, 1 + rnd() * 2, 'rgba(200,205,220,0.08)'); }
    if (o.sea !== false) {
      g.fillStyle = K.lin(g, 0, hz, 0, y + h, ['#4a5466', '#2a3240', '#1c222c']); g.fillRect(x, hz, w, y + h - hz);
      rect(g, x, hz - 1, w, 2, 'rgba(210,215,225,0.5)');
      if (q.model >= 1) {
        var nw = M(q, 0, 26, 60);
        for (var k = 0; k < nw; k++) {
          var wy = hz + Math.pow(rnd(), 1.6) * (y + h - hz), wx = x + rnd() * w, wl = 6 + (wy - hz) * 0.6 * rnd();
          rect(g, wx, wy, wl, 1 + (wy - hz) * 0.02, 'rgba(220,226,235,' + (0.12 + rnd() * 0.25) + ')');
        }
      }
      if (o.cliff) {
        g.fillStyle = '#141820';
        g.beginPath(); g.moveTo(x + w * o.cliff, hz + 2); g.lineTo(x + w * (o.cliff + 0.08), hz - h * 0.12); g.lineTo(x + w * (o.cliff + 0.2), hz - h * 0.16);
        g.lineTo(x + w * (o.cliff + 0.28), hz - h * 0.08); g.lineTo(x + w * (o.cliff + 0.36), hz + 2); g.closePath(); g.fill();
      }
    } else {
      // 庭院树影
      g.fillStyle = K.lin(g, 0, hz - 40, 0, y + h, ['#262c34', '#14181e']); g.fillRect(x, hz - 4, w, y + h - hz + 4);
      for (var tI = 0; tI < M(q, 4, 8, 12); tI++) {
        var tx = x + rnd() * w, th = 40 + rnd() * h * 0.45;
        g.fillStyle = 'rgba(16,20,26,0.9)';
        g.beginPath(); g.moveTo(tx - 22 - rnd() * 20, hz + 6); g.quadraticCurveTo(tx - 10, hz - th * 0.6, tx + 8, hz - th); g.quadraticCurveTo(tx + 20, hz - th * 0.5, tx + 30 + rnd() * 20, hz + 6); g.fill();
      }
    }
    g.restore();
  }
  // 正面窗户（墙洞透视、玻璃、窗格、窗台、外景）。o: { cols, rows, arch, view, frameCol, t, bars, broken, sill }
  function windowFront(g, q, R, x, y, w, h, o) {
    o = o || {};
    var col = o.frameCol || '#3a2214', t = o.t || TX.walnut, fw = o.casing || 18;
    var arch = o.arch ? w / 2 : 0;
    function opening(e) {
      g.beginPath();
      if (arch) { g.moveTo(x - e, y + h + e); g.lineTo(x - e, y + arch); g.arc(x + w / 2, y + arch, w / 2 + e, PI, 0); g.lineTo(x + w + e, y + h + e); g.closePath(); }
      else g.rect(x - e, y - e, w + e * 2, h + e * 2);
    }
    // 外框
    if (q.light >= 1) { opening(fw + 10); g.fillStyle = lo(0.25); g.fill(); }
    opening(fw); texFill(g, q, col, t);
    opening(fw); g.fillStyle = K.lin(g, x - fw, 0, x + w + fw, 0, [hi(KX < 0 ? 0.14 : 0.02), lo(0.1), lo(KX < 0 ? 0.3 : 0.1)]); g.fill();
    if (q.model >= 1) { opening(fw * 0.5); g.strokeStyle = lo(0.45); g.lineWidth = 2.5; g.stroke(); opening(fw * 0.75); g.strokeStyle = hi(0.12); g.lineWidth = 1.5; g.stroke(); }
    // 墙厚（洞口内侧）
    opening(0); g.fillStyle = '#1a1416'; g.fill();
    var kd = o.depth || 0.955;
    var a = R.p(x, y, kd), b2 = R.p(x + w, y + h, kd), gx = a[0], gy = a[1], gw = b2[0] - a[0], gh = b2[1] - a[1];
    g.save(); opening(0); g.clip();
    // 内侧墙面
    var reveal = o.revealCol || '#5a5058';
    if (x + w / 2 < R.vx) fillP(g, [x, y - arch, gx, gy - arch, gx, gy + gh, x, y + h], K.shade(reveal, -0.2));
    else fillP(g, [x + w, y - arch, x + w, y + h, gx + gw, gy + gh, gx + gw, gy - arch], K.shade(reveal, -0.2));
    fillP(g, [x - 10, y - 10, x + w + 10, y - 10, gx + gw, gy, gx, gy], K.shade(reveal, -0.45));
    if (y + h > R.vy) fillP(g, [x, y + h, x + w, y + h, gx + gw, gy + gh, gx, gy + gh], K.shade(reveal, 0.15));
    // 外景
    var vy0 = gy - (arch ? arch * kd : 0);
    if (o.view) o.view(g, q, gx, vy0, gw, gh + (gy - vy0));
    else stormView(g, q, gx, vy0, gw, gh + (gy - vy0), { seed: o.seed, horizon: o.horizon, sea: o.sea, cliff: o.cliff });
    // 玻璃：反光
    if (!o.broken) {
      g.fillStyle = K.lin(g, gx, gy, gx + gw, gy + gh, ['rgba(190,205,230,0.16)', 'rgba(120,140,170,0.04)', 'rgba(190,205,230,0.12)']);
      g.fillRect(gx, vy0, gw, gh + gy - vy0);
      if (q.light >= 2) {
        g.save(); g.globalCompositeOperation = 'lighter';
        for (var sI = 0; sI < 2; sI++) {
          var sx = gx + gw * (0.2 + sI * 0.45);
          fillP(g, [sx, vy0 + gh, sx + gw * 0.12, vy0 + gh, sx + gw * 0.45, vy0, sx + gw * 0.33, vy0], 'rgba(200,215,240,0.06)');
        }
        g.restore();
      }
    }
    // 窗格（框条）
    var cols = o.cols || 2, rows = o.rows || 3, mc = o.muntin || '#2a1a10', mw = o.mw || 7;
    var bars = [];
    for (var ci = 1; ci < cols; ci++) bars.push([gx + gw * ci / cols - mw / 2, vy0, mw, gh + gy - vy0]);
    for (var ri = 1; ri < rows; ri++) bars.push([gx, gy + gh * ri / rows - mw / 2, gw, mw]);
    for (var bI = 0; bI < bars.length; bI++) {
      var bb = bars[bI]; rect(g, bb[0], bb[1], bb[2], bb[3], mc);
      if (bb[2] < bb[3]) { rect(g, bb[0] + (KX < 0 ? 0 : bb[2] - 1.5), bb[1], 1.5, bb[3], hi(0.22)); }
      else { rect(g, bb[0], bb[1], bb[2], 1.5, hi(0.25)); rect(g, bb[0], bb[1] + bb[3] - 1.5, bb[2], 1.5, lo(0.5)); }
    }
    if (arch && q.model >= 1) {
      g.beginPath(); g.arc(gx + gw / 2, gy, gw / 2 - 2, PI, 0); stroke(g, mw, mc);
      for (var aI = 1; aI < cols; aI++) { var ang = PI + PI * aI / cols; seg(g, gx + gw / 2, gy, gx + gw / 2 + Math.cos(ang) * gw / 2, gy + Math.sin(ang) * gw / 2, mw * 0.8, mc); }
    }
    // 窗框内缘
    g.strokeStyle = mc; g.lineWidth = mw * 1.4; g.strokeRect(gx, vy0, gw, gh + gy - vy0);
    if (o.bars) { // 铁栏杆
      var nb = o.bars;
      for (var k = 1; k < nb; k++) { var bx2 = x + w * k / nb; g.fillStyle = cylGrad(g, bx2 - 5, 10, '#3a3a42'); g.fillRect(bx2 - 5, y - arch, 10, h + arch); }
      rect(g, x, y + h * 0.3, w, 8, '#2a2a30'); rect(g, x, y + h * 0.3, w, 2, hi(0.2)); rect(g, x, y + h * 0.72, w, 8, '#2a2a30'); rect(g, x, y + h * 0.72, w, 2, hi(0.2));
    }
    if (o.broken) o.broken(g, gx, gy, gw, gh);
    if (q.light >= 1) { g.fillStyle = K.lin(g, 0, y - arch, 0, y - arch + 40, [lo(0.4), lo(0)]); g.fillRect(x, y - arch, w, 40); }
    g.restore();
    // 窗台
    if (o.sill !== false) {
      var sy2 = y + h + fw * 0.4;
      box(g, q, R, x - fw - 14, sy2, w + fw * 2 + 28, 14, 0.97, { col: K.shade(col, 0.1), t: TX.walnutH, edge: true });
      if (q.light >= 1) { g.fillStyle = K.lin(g, 0, sy2 + 14, 0, sy2 + 40, [lo(0.45), lo(0)]); g.fillRect(x - fw - 14, sy2 + 14, w + fw * 2 + 28, 26); }
    }
    return { gx: gx, gy: vy0, gw: gw, gh: gh + gy - vy0 };
  }
  // 窗帘（带褶皱、束带）。side: 'l' 束向左 / 'r' 束向右；tie: 束带高度比例
  function curtain(g, q, x, y, w, h, o) {
    o = o || {};
    var col = o.col || '#5a1020', n = o.folds || M(q, 4, 7, 10), side = o.side || 'l', tie = o.tie === undefined ? 0.58 : o.tie;
    var tw = w * (o.gather || 0.45), ty = y + h * tie, flare = o.flare === undefined ? 0.85 : o.flare;
    function xs(i, yy) {
      var f = i / n;
      if (!tie) return x + w * f;
      if (yy <= ty) { var t = (yy - y) / (ty - y), tt = t * t; var full = x + w * f, g2 = side === 'l' ? x + tw * f : x + w - tw * (1 - f); return lerp(full, g2, tt); }
      var t2 = (yy - ty) / (y + h - ty), gg = side === 'l' ? x + tw * f : x + w - tw * (1 - f), fl = side === 'l' ? x + w * flare * f : x + w - w * flare * (1 - f);
      return lerp(gg, fl, Math.sqrt(t2));
    }
    var steps = 10;
    for (var i = 0; i < n; i++) {
      var pts = [], j;
      for (j = 0; j <= steps; j++) { var yy = y + h * j / steps; pts.push(xs(i, yy), yy); }
      for (j = steps; j >= 0; j--) { var y2 = y + h * j / steps; pts.push(xs(i + 1, y2), y2); }
      K.poly(g, pts);
      if (o.t && q.tex > 0) texFill(g, q, col, o.t); else { g.fillStyle = col; g.fill(); }
      var x0 = xs(i, ty), x1 = xs(i + 1, ty), xt0 = xs(i, y), xt1 = xs(i + 1, y);
      K.poly(g, pts);
      var hl = KX < 0 ? 0.35 : 0.65;
      g.fillStyle = K.lin(g, Math.min(x0, xt0), 0, Math.max(x1, xt1), 0, [[0, lo(0.62)], [hl * 0.7, lo(0.1)], [hl, hi(0.14)], [Math.min(1, hl + 0.25), lo(0.12)], [1, lo(0.6)]]);
      g.fill();
    }
    // 下摆暗、上部暗
    g.fillStyle = K.lin(g, 0, y, 0, y + h, [[0, lo(0.35)], [0.2, lo(0)], [0.85, lo(0)], [1, lo(0.35)]]);
    var full = [x, y]; for (var k = 0; k <= steps; k++) { var y3 = y + h * k / steps; full.push(xs(n, y3), y3); }
    for (var k2 = steps; k2 >= 0; k2--) { var y4 = y + h * k2 / steps; full.push(xs(0, y4), y4); }
    K.poly(g, full); g.fill();
    if (tie && o.tieback !== false) {
      var cx0 = xs(0, ty), cx1 = xs(n, ty);
      var inset = (cx1 - cx0) * 0.12; g.fillStyle = metalGrad(g, cx0, ty - 6, cx0, ty + 6, o.tieCol || '#b08a48'); K.rr(g, cx0 + inset, ty - 5, cx1 - cx0 - inset * 2, 10, 5); g.fill();
      if (q.model >= 1) {
        var tx = side === 'l' ? cx1 + 2 : cx0 - 2;
        g.fillStyle = metalGrad(g, tx - 7, 0, tx + 7, 0, o.tieCol || '#b08a48');
        seg(g, tx, ty, tx, ty + 22, 2, K.shade(o.tieCol || '#b08a48', -0.2)); circle(g, tx, ty + 24, 5, g.fillStyle);
        g.beginPath(); g.moveTo(tx - 3, ty + 26); g.lineTo(tx + 3, ty + 26); g.lineTo(tx + 7, ty + 50); g.lineTo(tx - 7, ty + 50); g.closePath(); g.fill();
        for (var fI = -6; fI <= 6; fI += 2) seg(g, tx + fI, ty + 50, tx + fI * 1.1, ty + 60, 1, K.shade(o.tieCol || '#b08a48', -0.2));
      }
    }
  }
  // 帷幔窗帘杆 + 帷头
  function valance(g, q, x, y, w, col, o) {
    o = o || {};
    var hh = o.h || 54, n = M(q, 3, 4, 5);
    g.fillStyle = metalGrad(g, x, y - 6, x, y + 6, '#a07a3a'); g.fillRect(x - 20, y - 5, w + 40, 10);
    circle(g, x - 24, y, 9, '#b08a48'); circle(g, x + w + 24, y, 9, '#b08a48');
    for (var i = 0; i < n; i++) {
      var sx = x + w * i / n, ex = x + w * (i + 1) / n, mx = (sx + ex) / 2;
      g.beginPath(); g.moveTo(sx - 6, y); g.quadraticCurveTo(mx, y + hh * 1.5, ex + 6, y); g.closePath();
      if (o.t && q.tex > 0) texFill(g, q, col, o.t); else { g.fillStyle = col; g.fill(); }
      g.beginPath(); g.moveTo(sx - 6, y); g.quadraticCurveTo(mx, y + hh * 1.5, ex + 6, y); g.closePath();
      g.fillStyle = K.lin(g, 0, y, 0, y + hh * 0.8, [lo(0.5), hi(0.08), lo(0.35)]); g.fill();
      if (q.model >= 1) { g.beginPath(); g.moveTo(sx, y + 4); g.quadraticCurveTo(mx, y + hh * 1.32, ex, y + 4); stroke(g, 2, K.rgba(o.trim || '#c9a25a', 0.6)); }
    }
  }
  // 画框（鎏金）+ 画心回调
  function frame(g, q, x, y, w, h, paint, o) {
    o = o || {};
    var fw = o.fw || Math.max(14, Math.min(w, h) * 0.08), gold = o.gold || '#a8823e';
    if (q.light >= 1) softRect(g, x - fw + (KX < 0 ? 8 : -8), y - fw + 10, w + fw * 2, h + fw * 2, 12, 0.5);
    g.fillStyle = metalGrad(g, x - fw, y - fw, x + w + fw, y + h + fw, gold); g.fillRect(x - fw, y - fw, w + fw * 2, h + fw * 2);
    bevel(g, x - fw, y - fw, w + fw * 2, h + fw * 2, fw * 0.5, 0.3, 0.5);
    if (q.model >= 1) {
      g.strokeStyle = K.shade(gold, -0.5); g.lineWidth = 2; g.strokeRect(x - fw * 0.5, y - fw * 0.5, w + fw, h + fw);
      if (q.model >= 2) { // 珠饰
        g.fillStyle = K.shade(gold, 0.4);
        for (var bx = x - fw * 0.5; bx < x + w + fw * 0.5; bx += 7) { circle(g, bx, y - fw * 0.5, 1.6, g.fillStyle); circle(g, bx, y + h + fw * 0.5, 1.6, g.fillStyle); }
      }
    }
    rect(g, x - 3, y - 3, w + 6, h + 6, K.shade(gold, -0.6));
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    paint(g, q, x, y, w, h);
    // 画布老化 + 光泽
    g.fillStyle = K.lin(g, x, y, x + w, y + h, ['rgba(255,220,160,0.06)', 'rgba(0,0,0,0.1)', 'rgba(255,220,160,0.04)']); g.fillRect(x, y, w, h);
    if (q.light >= 1) K.ao(g, x, y, w, h, Math.min(w, h) * 0.12, 0.45);
    g.restore();
  }
  // 乌鸦剪影（直立侧身，朝右）。原点在脚下，约 170 高
  var CROW_BODY = 'M-74 -4 L-66 -20 C-52 -34 -38 -44 -28 -52 C-36 -78 -32 -104 -16 -122 C-6 -134 8 -140 20 -143 C28 -157 48 -162 60 -154 C66 -150 70 -146 72 -141 C86 -140 102 -136 114 -129 C102 -125 88 -123 72 -123 C66 -115 60 -110 54 -106 C52 -86 44 -66 30 -50 C22 -42 12 -36 4 -34 L-2 -30 C-10 -27 -16 -22 -22 -16 Z';
  var CROW_WING = 'M-2 -118 C20 -112 28 -84 14 -62 C-4 -42 -36 -24 -70 -10 C-60 -30 -46 -50 -40 -66 C-34 -90 -22 -110 -2 -118 Z';
  function crowShape(g, x, y, s, dir) {
    g.save(); g.translate(x, y); g.scale(s * (dir || 1), s); K.path(g, CROW_BODY); g.restore();
  }
  function crowWing(g, x, y, s, dir) {
    g.save(); g.translate(x, y); g.scale(s * (dir || 1), s); K.path(g, CROW_WING); g.restore();
  }

  /* ================================================================
   * 6. 灯光
   * ================================================================ */
  // 低分辨率光照贴图 → multiply。list 项：
  //   {x,y,r,ry,c,i,q}  椭圆光（q = 生效所需的最低光影质量）
  //   {pts,c,i,fx0,fy0,fx1,fy1,q}  多边形（沿 f0→f1 渐隐）
  //   {lin:[x0,y0,x1,y1], stops, q}  整屏线性渐变（加色）
  function lightMap(g, q, amb, list) {
    var f = q.light >= 2 ? 0.25 : q.light === 1 ? 0.2 : 0.125;
    var lw = Math.max(32, Math.round(W * q.s * f)), lh = Math.max(18, Math.round(H * q.s * f));
    var c = K.canvas(lw, lh), x = c.getContext('2d');
    x.setTransform(lw / W, 0, 0, lh / H, 0, 0);
    x.fillStyle = amb; x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = 'lighter';
    for (var i = 0; i < list.length; i++) {
      var L = list[i];
      if ((L.q || 0) > q.light) continue;
      if (L.lin) { x.fillStyle = K.lin(x, L.lin[0], L.lin[1], L.lin[2], L.lin[3], L.stops); x.fillRect(0, 0, W, H); continue; }
      if (L.pts) {
        K.poly(x, L.pts); x.fillStyle = K.lin(x, L.fx0, L.fy0, L.fx1, L.fy1, [[0, K.rgba(L.c, L.i)], [1, K.rgba(L.c, 0)]]); x.fill();
        continue;
      }
      x.save(); x.translate(L.x, L.y); x.scale(1, (L.ry || L.r) / L.r);
      var a = L.i, fall = L.fall || 0.4;
      x.fillStyle = K.rad(x, 0, 0, 0, L.r, [[0, K.rgba(L.c, a)], [fall, K.rgba(L.c, a * 0.45)], [1, K.rgba(L.c, 0)]]);
      x.fillRect(-L.r, -L.r, L.r * 2, L.r * 2); x.restore();
    }
    g.save(); g.globalCompositeOperation = 'multiply'; g.drawImage(c, 0, 0, W, H); g.restore();
  }
  // 壁灯：铜底座 + 灯臂 + 布灯罩（灯罩内亮）。返回灯泡位置
  function sconce(g, q, x, y, o) {
    o = o || {};
    var sc = o.scale || 1, arms = o.arms || 1;
    g.save(); g.translate(x, y); g.scale(sc, sc);
    g.fillStyle = metalGrad(g, -12, 0, 12, 0, '#8a6a32'); K.rr(g, -10, -6, 20, 46, 8); g.fill();
    if (q.model >= 1) { circle(g, 0, 6, 4, '#c9a25a'); circle(g, 0, 6, 2, '#5a3a12'); }
    for (var a = 0; a < arms; a++) {
      var ax = arms === 1 ? 0 : (a === 0 ? -34 : 34);
      g.beginPath(); g.moveTo(0, 26); g.bezierCurveTo(ax * 0.2, 46, ax, 34, ax, 6); stroke(g, 4, '#9a7a3a');
      g.fillStyle = metalGrad(g, ax - 8, 0, ax + 8, 0, '#a07a3a'); K.rr(g, ax - 7, 0, 14, 8, 3); g.fill();
      if (o.candle) {
        rect(g, ax - 3.5, -26, 7, 26, '#efe6d2'); rect(g, ax - 3.5, -26, 2, 26, hi(0.4));
      } else {
        // 灯罩
        g.beginPath(); g.moveTo(ax - 12, -34); g.lineTo(ax + 12, -34); g.lineTo(ax + 20, -4); g.lineTo(ax - 20, -4); g.closePath();
        g.fillStyle = K.lin(g, ax - 20, 0, ax + 20, 0, [o.shade || '#d8b48a', K.shade(o.shade || '#d8b48a', 0.35), o.shade || '#d8b48a', K.shade(o.shade || '#d8b48a', -0.25)]); g.fill();
        g.fillStyle = K.lin(g, 0, -34, 0, -4, ['rgba(255,240,200,0.0)', 'rgba(255,230,170,0.35)']); g.fill();
        rect(g, ax - 20, -6, 40, 3, K.shade(o.shade || '#d8b48a', -0.3));
      }
    }
    g.restore();
  }
  // 自发光：灯罩光晕/烛火（光照贴图之后调用）
  function sconceGlow(g, q, x, y, o) {
    o = o || {};
    var sc = o.scale || 1, arms = o.arms || 1;
    for (var a = 0; a < arms; a++) {
      var ax = x + (arms === 1 ? 0 : (a === 0 ? -34 : 34)) * sc;
      if (o.candle) K.flame(g, q, ax, y - 26 * sc, 14 * sc, { glow: 5 });
      else {
        g.save(); g.globalCompositeOperation = 'lighter';
        g.beginPath(); g.moveTo(ax - 12 * sc, y - 34 * sc); g.lineTo(ax + 12 * sc, y - 34 * sc); g.lineTo(ax + 20 * sc, y - 4 * sc); g.lineTo(ax - 20 * sc, y - 4 * sc); g.closePath();
        g.fillStyle = 'rgba(255,200,120,0.35)'; g.fill(); g.restore();
        if (q.light >= 1) K.glow(g, ax, y - 18 * sc, 70 * sc, '#ffc070', 0.35);
      }
    }
  }
  // 光柱（窗→地）
  function shaft(g, q, pts, c, a, x0, y0, x1, y1) { if (q.light >= 2) K.shaft(g, pts, c, a, x0, y0, x1, y1); }
  // 收尾：暗角 + 颗粒
  function finish(g, q, o) {
    o = o || {};
    K.vignette(g, W, H, o.vig === undefined ? 0.55 : o.vig, o.inner || 0.4);
    if (q.tex >= 2 && o.grain !== false) {
      g.save(); g.globalCompositeOperation = 'overlay'; g.beginPath(); g.rect(0, 0, W, H);
      texFill(g, q, '#808080', TX.grain, 0, 0, 1, 1, 0.06); g.restore();
    }
  }
  // 地面上的漫反射高光（清漆地板倒映窗/灯）
  function floorSheen(g, q, R, x, w, c, a, y1) {
    if (q.light < 2) return;
    g.save(); g.globalCompositeOperation = 'lighter';
    var y0 = R.base + 2, yy = y1 || H;
    var dB = R.dB, xa = R.vx + (x - R.vx) * ((yy - R.vy) / (R.base - R.vy));
    K.poly(g, [x - w / 2, y0, x + w / 2, y0, xa + w * 0.9, yy, xa - w * 0.9, yy]);
    g.fillStyle = K.lin(g, 0, y0, 0, yy, [[0, K.rgba(c, a)], [0.5, K.rgba(c, a * 0.35)], [1, K.rgba(c, 0)]]); g.fill();
    g.restore(); void dB;
  }
  // 灯光 meta 辅助
  function LT(x, y, r, color, i, flicker, kind) { return { x: x, y: y, r: r, color: color, i: i, flicker: flicker || 0, kind: kind }; }

  var P = DM.HDProps = DM.HDProps || {};
  P.mansion = {
    Room: Room, box: box, boxGeo: boxGeo, door: door, windowFront: windowFront, curtain: curtain, frame: frame,
    plankFloor: plankFloor, tileFloor: tileFloor, rug: rug, paperWall: paperWall, wainscot: wainscot, lightMap: lightMap,
    sconce: sconce, sconceGlow: sconceGlow, stormView: stormView, TX: TX, setKey: setKey
  };

/*@@HALL@@*/
  /* ================================================================
   * 大厅 hall
   * ================================================================ */
  // 青铜乌鸦像（含台座）。cx 中心，by 台座底
  function crowStatue(g, q, R, cx, by) {
    var bronze = '#5e4628', mt = TX.marbleG, mc = '#2a3430';
    var k1 = R.kWall(by);
    box(g, q, R, cx - 140, by - 44, 280, 44, k1, { col: mc, t: mt, topHi: 0.22 });
    box(g, q, R, cx - 96, by - 80, 192, 36, 0.975, { col: mc, t: mt, topHi: 0.22 });
    box(g, q, R, cx - 66, by - 178, 132, 98, 0.975, { col: K.shade(mc, -0.1), t: mt });
    if (q.model >= 1) {
      groove(g, cx - 52, by - 166, 104, 74, 4, 0.45);
      if (q.model >= 2) { // 铜铭牌
        g.fillStyle = metalGrad(g, cx - 30, by - 136, cx + 30, by - 122, '#a8823e'); K.rr(g, cx - 30, by - 138, 60, 18, 3); g.fill();
        g.strokeStyle = lo(0.5); g.lineWidth = 1; g.stroke();
      }
    }
    box(g, q, R, cx - 78, by - 196, 156, 18, 0.975, { col: K.shade(mc, 0.1), t: mt, topHi: 0.3 });
    // 青铜岩座
    var ty = by - 196;
    g.beginPath(); g.moveTo(cx - 64, ty); g.bezierCurveTo(cx - 62, ty - 16, cx - 34, ty - 24, cx - 4, ty - 20); g.bezierCurveTo(cx + 30, ty - 28, cx + 60, ty - 16, cx + 64, ty); g.closePath();
    g.fillStyle = metalGrad(g, cx - 64, ty - 20, cx + 64, ty, bronze); g.fill();
    var fy = ty - 14, sc = 1.06, ox = cx - 18;
    // 腿与爪
    for (var l = 0; l < 2; l++) {
      var lx = ox + (l ? 10 : -4) * sc;
      seg(g, lx, fy - 34 * sc, lx + 2, fy, 5, K.shade(bronze, -0.4));
      seg(g, lx + 2, fy, lx + 16, fy + 2, 3, K.shade(bronze, -0.3)); seg(g, lx + 2, fy, lx - 10, fy + 2, 3, K.shade(bronze, -0.45));
    }
    // 身体
    if (q.light >= 2) { g.save(); K.shadow(g, q, 16, 'rgba(0,0,0,0.5)', KX < 0 ? 12 : -12, 8); }
    crowShape(g, ox, fy, sc, 1);
    g.fillStyle = K.lin(g, ox - 80, fy - 170, ox + 100, fy, [K.shade(bronze, -0.15), K.shade(bronze, -0.5), K.shade(bronze, -0.25), K.shade(bronze, -0.65)]);
    g.fill();
    if (q.light >= 2) g.restore();
    g.save(); crowShape(g, ox, fy, sc, 1); g.clip();
    // 体积明暗：胸前受光
    g.fillStyle = K.rad(g, ox + 40 * sc, fy - 110 * sc, 4, 90 * sc, ['rgba(220,170,100,0.55)', 'rgba(160,110,60,0.15)', 'rgba(0,0,0,0)']); g.fillRect(ox - 120, fy - 200, 260, 220);
    g.fillStyle = K.lin(g, 0, fy - 60 * sc, 0, fy, [lo(0), lo(0.45)]); g.fillRect(ox - 120, fy - 60 * sc, 260, 60 * sc);
    // 铜绿
    if (q.tex >= 1) { g.fillStyle = 'rgba(70,120,100,0.18)'; g.fillRect(ox - 120, fy - 200, 260, 220); }
    // 翅膀
    crowWing(g, ox, fy, sc, 1);
    g.fillStyle = K.lin(g, ox - 60, fy - 120, ox + 20, fy - 10, [K.shade(bronze, -0.3), K.shade(bronze, -0.6)]); g.fill();
    crowWing(g, ox, fy, sc, 1); stroke(g, 2, 'rgba(255,210,150,0.18)');
    if (q.model >= 1) {
      var nf = M(q, 0, 6, 10);
      for (var i = 0; i < nf; i++) {
        var t = i / nf, fx0 = ox + (10 - t * 70) * sc, fy0 = fy + (-96 + t * 70) * sc;
        g.beginPath(); g.moveTo(fx0, fy0); g.quadraticCurveTo(fx0 - 14 * sc, fy0 + 22 * sc, fx0 - 34 * sc, fy0 + 34 * sc); stroke(g, 1.6, 'rgba(0,0,0,0.4)');
        g.beginPath(); g.moveTo(fx0 + 1, fy0 - 2); g.quadraticCurveTo(fx0 - 13 * sc, fy0 + 20 * sc, fx0 - 33 * sc, fy0 + 32 * sc); stroke(g, 1, 'rgba(255,215,160,0.14)');
      }
      // 颈部蓬松羽毛
      for (var j = 0; j < M(q, 0, 5, 9); j++) { var hx = ox + (54 - j * 2) * sc, hy = fy + (-108 + j * 6) * sc; seg(g, hx, hy, hx - 8 * sc, hy + 8 * sc, 1.2, 'rgba(0,0,0,0.35)'); }
    }
    g.restore();
    // 轮廓高光（rim）
    if (q.light >= 1) { crowShape(g, ox, fy, sc, 1); g.save(); g.globalCompositeOperation = 'lighter'; g.lineWidth = 2; g.strokeStyle = 'rgba(255,200,140,0.22)'; g.stroke(); g.restore(); }
    // 喙的高光与红玉眼
    seg(g, ox + 74 * sc, fy - 136 * sc, ox + 108 * sc, fy - 130 * sc, 1.6, 'rgba(255,225,170,0.45)');
    circle(g, ox + 58 * sc, fy - 143 * sc, 3.2, '#c82030'); circle(g, ox + 57 * sc, fy - 144 * sc, 1.1, '#ffd8d8');
  }
  // 铜烛台（大号祭坛式）
  function candlestick(g, q, cx, by, h) {
    var br = '#8a6a32', s = h / 120;
    g.save(); g.translate(cx, by); g.scale(s, s);
    if (q.light >= 1) K.contact(g, 0, 2, 32, 6, 0.6);
    // 底座
    g.beginPath(); g.moveTo(-26, 0); g.bezierCurveTo(-24, -10, -12, -14, -8, -18); g.lineTo(8, -18); g.bezierCurveTo(12, -14, 24, -10, 26, 0); g.closePath();
    g.fillStyle = metalGrad(g, -26, 0, 26, 0, br); g.fill();
    // 柱身（车削）
    var segs = [[-18, -40, 6], [-40, -46, 11], [-46, -66, 5], [-66, -74, 9], [-74, -86, 5]];
    for (var i = 0; i < segs.length; i++) { var r = segs[i][2]; g.fillStyle = metalGrad(g, -r, 0, r, 0, br); K.rr(g, -r, segs[i][1], r * 2, segs[i][0] - segs[i][1], r * 0.6); g.fill(); }
    // 烛盘 + 蜡烛
    ell(g, 0, -86, 16, 4, K.shade(br, 0.2)); g.fillStyle = metalGrad(g, -16, 0, 16, 0, br); g.fillRect(-16, -90, 32, 5);
    g.fillStyle = K.lin(g, -6, 0, 6, 0, ['#cfc2a6', '#f6eedc', '#d8cab0']); g.fillRect(-6, -118, 12, 30);
    ell(g, 0, -118, 6, 2, '#fff8e8'); seg(g, 0, -118, 0, -122, 1.5, '#2a1a0a');
    g.restore();
  }
  // 落地大座钟
  function grandClock(g, q, R, x, y, w, by) {
    var col = '#3a1c0e', t = TX.mahog, k = R.kWall(by) * 0.995;
    var hy = y + 128, ty = by - 92;
    // 投影
    if (q.light >= 2) { g.save(); g.globalAlpha = 0.5; softRect(g, x + (KX < 0 ? 26 : -26), y + 10, w, by - y - 10, 16, 0.6); g.restore(); }
    if (q.light >= 1) K.contact(g, x + w / 2, by, w * 0.75, 10, 0.6);
    // 底座
    box(g, q, R, x + 2, ty, w - 4, by - ty, k, { col: col, t: t });
    if (q.model >= 1) { groove(g, x + 16, ty + 16, w - 32, by - ty - 34, 4, 0.4); }
    bands(g, x - 2, ty - 8, w + 4, [[3, hi(0.3)], [6, K.shade(col, 0.15)], [3, lo(0.5)]]);
    // 钟身
    box(g, q, R, x + 14, hy, w - 28, ty - hy - 8, k, { col: col, t: t, topFace: false });
    // 摆锤窗
    var px = x + 30, pw = w - 60, py = hy + 26, ph = ty - hy - 70;
    rect(g, px, py, pw, ph, '#0e0806');
    g.save(); g.beginPath(); g.rect(px, py, pw, ph); g.clip();
    seg(g, px + pw / 2, py, px + pw / 2, py + ph - 46, 3, '#8a6a32');
    g.fillStyle = K.rad(g, px + pw / 2 - 6, py + ph - 40, 2, 22, ['#fff0b0', '#c9a25a', '#4a3010']); circle(g, px + pw / 2, py + ph - 36, 20, g.fillStyle);
    if (q.model >= 1) { // 重锤
      for (var wI = 0; wI < 2; wI++) { var wx = px + 10 + wI * (pw - 28); g.fillStyle = metalGrad(g, wx, 0, wx + 14, 0, '#9a7a3a'); g.fillRect(wx, py + 20 + wI * 30, 14, 70); seg(g, wx + 7, py, wx + 7, py + 20 + wI * 30, 1.2, '#6a5a3a'); }
    }
    g.fillStyle = K.lin(g, px, py, px + pw, py + ph, ['rgba(200,210,230,0.18)', 'rgba(0,0,0,0)', 'rgba(200,210,230,0.1)']); g.fillRect(px, py, pw, ph);
    g.restore();
    g.strokeStyle = '#8a6a32'; g.lineWidth = 3; g.strokeRect(px, py, pw, ph);
    // 钟头（帽）
    bands(g, x - 6, hy - 8, w + 12, [[3, hi(0.3)], [8, K.shade(col, 0.2)], [3, lo(0.5)]]);
    box(g, q, R, x, y + 22, w, hy - y - 30, k, { col: col, t: t, topFace: false });
    // 断山花 + 顶饰
    g.beginPath(); g.moveTo(x - 8, y + 26); g.quadraticCurveTo(x + w * 0.22, y - 8, x + w * 0.4, y + 4); g.lineTo(x + w * 0.4, y + 22); g.lineTo(x - 8, y + 30); g.closePath();
    texFill(g, q, col, t); g.fillStyle = hi(0.08); g.fill();
    g.beginPath(); g.moveTo(x + w + 8, y + 26); g.quadraticCurveTo(x + w * 0.78, y - 8, x + w * 0.6, y + 4); g.lineTo(x + w * 0.6, y + 22); g.lineTo(x + w + 8, y + 30); g.closePath();
    texFill(g, q, col, t); g.fillStyle = lo(0.2); g.fill();
    g.fillStyle = metalGrad(g, x + w / 2 - 7, 0, x + w / 2 + 7, 0, '#b08a48'); K.rr(g, x + w / 2 - 6, y - 14, 12, 34, 4); g.fill(); circle(g, x + w / 2, y - 18, 7, '#c9a25a');
    // 表盘（拱形）
    var dx = x + w / 2, dy = y + 84, dr = w * 0.33;
    g.fillStyle = metalGrad(g, dx - dr - 8, dy - dr, dx + dr + 8, dy + dr, '#9a7a3a');
    g.beginPath(); g.moveTo(dx - dr - 8, dy + dr + 6); g.lineTo(dx - dr - 8, dy - dr * 0.3); g.arc(dx, dy - dr * 0.3, dr + 8, PI, 0); g.lineTo(dx + dr + 8, dy + dr + 6); g.closePath(); g.fill();
    g.fillStyle = K.rad(g, dx - 8, dy - 8, 2, dr, ['#f4ecd8', '#d8ccb0']); circle(g, dx, dy, dr, g.fillStyle);
    g.beginPath(); g.arc(dx, dy, dr, 0, TAU); stroke(g, 2, '#5a4a2a');
    if (q.model >= 1) {
      // 月相拱
      g.save(); g.beginPath(); g.arc(dx, dy - dr * 0.3, dr + 4, PI, 0); g.lineTo(dx + dr, dy - dr * 0.3); g.arc(dx, dy, dr, 0, PI, true); g.closePath(); g.clip();
      rect(g, dx - dr - 10, dy - dr * 1.4, dr * 2 + 20, dr * 1.2, '#1a2a5a'); circle(g, dx - dr * 0.4, dy - dr * 0.9, dr * 0.28, '#e8d8a8'); g.restore();
      for (var h2 = 0; h2 < 12; h2++) { var a = h2 / 12 * TAU; seg(g, dx + Math.cos(a) * dr * 0.78, dy + Math.sin(a) * dr * 0.78, dx + Math.cos(a) * dr * 0.92, dy + Math.sin(a) * dr * 0.92, h2 % 3 ? 1.5 : 3, '#2a2016'); }
    }
    seg(g, dx, dy, dx + dr * 0.42, dy - dr * 0.38, 2.5, '#1a1008'); seg(g, dx, dy, dx - dr * 0.12, dy - dr * 0.7, 2, '#1a1008'); circle(g, dx, dy, 3, '#1a1008');
    if (q.light >= 2) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,240,210,0.12)'; g.beginPath(); g.arc(dx, dy, dr, PI * 1.05, PI * 1.6); g.lineTo(dx, dy); g.closePath(); g.fill(); g.restore(); }
    // 侧柱
    if (q.model >= 1) for (var c = 0; c < 2; c++) { var cxp = c ? x + w - 14 : x + 6; cyl(g, cxp, y + 34, 8, hy - y - 48, '#6a3a20'); }
  }
  // 吊灯（电烛式 + 水晶）
  function chandelier(g, q, cx, cy, sc, glowOnly) {
    var tiers = [[0, 110 * sc, 24 * sc, M(q, 6, 8, 10)], [-56 * sc, 64 * sc, 15 * sc, M(q, 0, 5, 6)]];
    var bulbs = [];
    for (var t = 0; t < tiers.length; t++) {
      var tr = tiers[t], n = tr[3];
      for (var i = 0; i < n; i++) { var a = PI * 0.04 + i / n * TAU; bulbs.push([cx + Math.cos(a) * tr[1], cy + tr[0] + Math.sin(a) * tr[2] - 30 * sc, Math.sin(a)]); }
    }
    if (glowOnly) {
      if (q.light >= 1) K.glow(g, cx, cy - 30 * sc, 260 * sc, '#ffc070', 0.35);
      for (var b = 0; b < bulbs.length; b++) {
        var B = bulbs[b];
        K.glow(g, B[0], B[1] - 6 * sc, 26 * sc, '#ffd090', 0.55);
        g.fillStyle = K.rad(g, B[0], B[1] - 7 * sc, 0, 6 * sc, ['#fffef0', 'rgba(255,220,150,0.9)', 'rgba(255,180,80,0)']); circle(g, B[0], B[1] - 7 * sc, 6 * sc, g.fillStyle);
      }
      if (q.light >= 2) { // 水晶闪光
        var rnd = K.rng(13);
        g.save(); g.globalCompositeOperation = 'lighter';
        for (var s2 = 0; s2 < 12; s2++) {
          var gx = cx + (rnd() * 2 - 1) * 110 * sc, gy = cy - 10 * sc + rnd() * 60 * sc, L = (2 + rnd() * 4) * sc;
          seg(g, gx - L, gy, gx + L, gy, 1, 'rgba(255,250,230,0.5)'); seg(g, gx, gy - L, gx, gy + L, 1, 'rgba(255,250,230,0.5)');
        }
        g.restore();
      }
      return bulbs;
    }
    // 链条
    for (var ch = 0; ch < cy - 90 * sc; ch += 12 * sc) { K.ellipse(g, cx, ch + 6 * sc, 3.5 * sc, 6 * sc); stroke(g, 2 * sc, ch / 12 % 2 ? '#6a5028' : '#8a6a32'); }
    // 中柱
    g.fillStyle = metalGrad(g, cx - 18 * sc, 0, cx + 18 * sc, 0, '#9a7432');
    g.beginPath(); g.moveTo(cx - 6 * sc, cy - 90 * sc); g.bezierCurveTo(cx - 22 * sc, cy - 60 * sc, cx - 8 * sc, cy - 40 * sc, cx - 16 * sc, cy - 10 * sc);
    g.bezierCurveTo(cx - 20 * sc, cy + 10 * sc, cx - 6 * sc, cy + 22 * sc, cx, cy + 40 * sc); g.bezierCurveTo(cx + 6 * sc, cy + 22 * sc, cx + 20 * sc, cy + 10 * sc, cx + 16 * sc, cy - 10 * sc);
    g.bezierCurveTo(cx + 8 * sc, cy - 40 * sc, cx + 22 * sc, cy - 60 * sc, cx + 6 * sc, cy - 90 * sc); g.closePath(); g.fill();
    // 灯臂（后排先画）
    var order = bulbs.slice().sort(function (a, b) { return a[2] - b[2]; });
    for (var j = 0; j < order.length; j++) {
      var Bj = order[j], back = Bj[2] < 0;
      g.beginPath(); g.moveTo(cx, cy - 4 * sc + (Bj[1] < cy - 50 * sc ? -50 * sc : 0));
      g.bezierCurveTo(cx + (Bj[0] - cx) * 0.3, Bj[1] + 60 * sc, Bj[0], Bj[1] + 40 * sc, Bj[0], Bj[1] + 6 * sc);
      stroke(g, 4 * sc, back ? '#5a4220' : '#a8823e');
      if (!back && q.light >= 1) stroke(g, 1.2 * sc, 'rgba(255,230,170,0.5)');
      g.fillStyle = metalGrad(g, Bj[0] - 9 * sc, 0, Bj[0] + 9 * sc, 0, '#a07a3a'); ell(g, Bj[0], Bj[1] + 6 * sc, 10 * sc, 3.5 * sc, g.fillStyle);
      rect(g, Bj[0] - 3.5 * sc, Bj[1] - 4 * sc, 7 * sc, 10 * sc, '#efe6d2');
      if (q.model >= 1) { // 水晶坠
        for (var d = -1; d <= 1; d += 2) {
          var px = Bj[0] + d * 6 * sc, py = Bj[1] + 18 * sc;
          fillP(g, [px, py, px + 3 * sc, py + 7 * sc, px, py + 14 * sc, px - 3 * sc, py + 7 * sc], 'rgba(220,230,255,0.75)');
        }
      }
    }
    // 下方水晶串
    if (q.model >= 1) {
      for (var k2 = 0; k2 < M(q, 0, 10, 18); k2++) {
        var a2 = k2 / M(q, 1, 10, 18) * TAU, rx = Math.cos(a2) * 70 * sc, ry = Math.sin(a2) * 15 * sc;
        g.beginPath(); g.moveTo(cx + rx, cy + ry - 4 * sc); g.quadraticCurveTo(cx + rx * 0.5, cy + 34 * sc + ry, cx, cy + 40 * sc); stroke(g, 1.2 * sc, 'rgba(200,215,240,0.5)');
      }
      fillP(g, [cx, cy + 40 * sc, cx + 7 * sc, cy + 56 * sc, cx, cy + 76 * sc, cx - 7 * sc, cy + 56 * sc], 'rgba(220,230,255,0.85)');
    }
    return bulbs;
  }
  // 软垫长凳（拉扣丝绒 + 鎏金车削腿）
  function bench(g, q, R, x, y, w, by, o) {
    o = o || {};
    var col = o.col || '#6a1424', k = 0.9, d = R.dAt(by);
    var legH = (by - y) * 0.36, cushH = (by - y) * 0.42, apY = y + cushH, apH = (by - y) - legH - cushH;
    if (q.light >= 1) K.contact(g, x + w / 2, by, w * 0.62, 10 * d / 2, 0.7);
    if (q.light >= 2) { var sh = KX < 0 ? 1 : -1; fillP(g, [x + 14, by, x + w - 14, by, x + w + sh * 70, by + 24, x + 14 + sh * 70, by + 24], lo(0.22)); }
    // 后腿
    var bl = R.p(x + 14, by, k), br = R.p(x + w - 26, by, k);
    cyl(g, bl[0], y + cushH, 10, bl[1] - y - cushH, '#5a4218'); cyl(g, br[0], y + cushH, 10, br[1] - y - cushH, '#5a4218');
    // 前腿（车削）
    var legs = [x + 10, x + w / 2 - 7, x + w - 24];
    for (var i = 0; i < legs.length; i++) {
      var lx = legs[i], ly = apY + apH;
      cyl(g, lx + 2, ly, 10, legH - 6, '#8a6a30');
      ell(g, lx + 7, ly + legH * 0.3, 8, 4, '#a8823e'); ell(g, lx + 7, ly + legH * 0.3 - 1, 6, 2, hi(0.35));
      ell(g, lx + 7, by - 3, 7, 3, '#5a4218');
    }
    // 裙板（木）
    box(g, q, R, x, apY, w, apH, k, { col: '#4a2a16', t: TX.walnutH, edge: false });
    rect(g, x, apY + apH - 3, w, 3, '#8a6a30');
    // 坐垫：鼓起的顶面
    var top = R.p(x, y, k), topR = R.p(x + w, y, k), bulge = 10;
    g.beginPath(); g.moveTo(x, apY); g.lineTo(x, y + 8); g.quadraticCurveTo(x, y - 2, x + 10, y - 3);
    g.quadraticCurveTo(x + w / 2, y - bulge, x + w - 10, y - 3); g.quadraticCurveTo(x + w, y - 2, x + w, y + 8); g.lineTo(x + w, apY); g.closePath();
    texFill(g, q, col, TX.velvet);
    g.beginPath(); g.moveTo(x + 10, y - 3); g.quadraticCurveTo(x + w / 2, y - bulge, x + w - 10, y - 3); g.lineTo(topR[0] - 8, topR[1] - 4); g.quadraticCurveTo(x + w / 2, topR[1] - bulge, top[0] + 8, top[1] - 4); g.closePath();
    texFill(g, q, K.shade(col, 0.1), TX.velvet); g.fillStyle = K.lin(g, 0, top[1] - bulge, 0, y, [lo(0.25), hi(0.18)]); g.fill();
    // 正面明暗：上缘受光、下缘内收变暗
    g.fillStyle = K.lin(g, 0, y - 6, 0, apY, [hi(0.22), hi(0.04), lo(0.15), lo(0.5)]); g.fillRect(x, y - 6, w, apY - y + 6);
    // 左端面（在消失点右侧可见）
    if (x > R.vx) {
      fillP(g, [x, y + 6, top[0], top[1] + 4, top[0], R.p(x, apY, k)[1], x, apY], K.shade(col, -0.25));
    }
    // 拉扣
    if (q.model >= 1) {
      var tufts = M(q, 0, 7, 10);
      for (var j = 0; j < tufts; j++) {
        var tx = x + w * (j + 0.5) / tufts, tyy = y + cushH * 0.5;
        g.beginPath(); g.moveTo(tx - w / tufts * 0.5, tyy - cushH * 0.3); g.lineTo(tx, tyy); g.lineTo(tx - w / tufts * 0.5, tyy + cushH * 0.3); stroke(g, 1.2, lo(0.3));
        g.beginPath(); g.moveTo(tx + w / tufts * 0.5, tyy - cushH * 0.3); g.lineTo(tx, tyy); g.lineTo(tx + w / tufts * 0.5, tyy + cushH * 0.3); stroke(g, 1.2, lo(0.3));
        circle(g, tx, tyy, 3.2, K.shade(col, -0.55)); circle(g, tx - 0.8, tyy - 0.9, 1.2, hi(0.35));
      }
    }
    // 滚边
    g.beginPath(); g.moveTo(x, apY - 2); g.lineTo(x + w, apY - 2); stroke(g, 4, '#8a6a30'); g.beginPath(); g.moveTo(x, apY - 3); g.lineTo(x + w, apY - 3); stroke(g, 1.2, hi(0.4));
  }
  // 油画：人物肖像（明暗法）
  function paintPortrait(g, q, x, y, w, h, o) {
    o = o || {};
    var cx = x + w / 2, rnd = K.rng(o.seed || 3);
    g.fillStyle = K.lin(g, 0, y, 0, y + h, ['#2a2418', '#1c1812', '#120e0a']); g.fillRect(x, y, w, h);
    g.fillStyle = K.rad(g, cx - w * 0.15, y + h * 0.3, 2, w * 0.7, ['rgba(120,96,60,0.55)', 'rgba(60,46,30,0.2)', 'rgba(0,0,0,0)']); g.fillRect(x, y, w, h);
    // 肩与外套
    g.beginPath(); g.moveTo(x - 4, y + h); g.bezierCurveTo(x + w * 0.04, y + h * 0.66, x + w * 0.24, y + h * 0.56, cx, y + h * 0.56);
    g.bezierCurveTo(x + w * 0.76, y + h * 0.56, x + w * 0.96, y + h * 0.66, x + w + 4, y + h); g.closePath();
    g.fillStyle = K.lin(g, x, 0, x + w, 0, ['#2a2620', '#121010', '#060506']); g.fill();
    // 领口
    fillP(g, [cx - w * 0.09, y + h * 0.57, cx + w * 0.09, y + h * 0.57, cx + w * 0.03, y + h * 0.78, cx - w * 0.03, y + h * 0.78], '#c8bca4');
    fillP(g, [cx - w * 0.02, y + h * 0.6, cx + w * 0.02, y + h * 0.6, cx + w * 0.012, y + h * 0.74, cx - w * 0.012, y + h * 0.74], '#3a1010');
    // 脖子与脸
    g.fillStyle = K.lin(g, cx - w * 0.06, 0, cx + w * 0.06, 0, ['#a07858', '#6a4a34']); g.fillRect(cx - w * 0.055, y + h * 0.44, w * 0.11, h * 0.14);
    K.ellipse(g, cx, y + h * 0.36, w * 0.135, h * 0.125);
    g.fillStyle = K.rad(g, cx - w * 0.05, y + h * 0.33, 2, w * 0.2, ['#e0b898', '#b08060', '#5a3c2a']); g.fill();
    // 发与鬓
    g.beginPath(); g.moveTo(cx - w * 0.14, y + h * 0.36); g.bezierCurveTo(cx - w * 0.16, y + h * 0.2, cx + w * 0.14, y + h * 0.18, cx + w * 0.145, y + h * 0.34);
    g.bezierCurveTo(cx + w * 0.1, y + h * 0.27, cx - w * 0.08, y + h * 0.25, cx - w * 0.14, y + h * 0.36); g.fillStyle = '#4a4440'; g.fill();
    // 五官（低对比，油画式）
    g.fillStyle = K.lin(g, cx - w * 0.135, 0, cx + w * 0.135, 0, ['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(30,16,10,0.45)']);
    K.ellipse(g, cx, y + h * 0.36, w * 0.135, h * 0.125); g.fill();
    ell(g, cx - w * 0.048, y + h * 0.352, w * 0.022, h * 0.008, 'rgba(50,30,20,0.45)'); ell(g, cx + w * 0.048, y + h * 0.352, w * 0.022, h * 0.008, 'rgba(50,30,20,0.55)');
    seg(g, cx - w * 0.075, y + h * 0.335, cx - w * 0.025, y + h * 0.332, 1.4, 'rgba(50,40,36,0.5)'); seg(g, cx + w * 0.025, y + h * 0.332, cx + w * 0.075, y + h * 0.335, 1.4, 'rgba(50,40,36,0.5)');
    g.beginPath(); g.moveTo(cx + w * 0.005, y + h * 0.355); g.lineTo(cx + w * 0.02, y + h * 0.395); g.lineTo(cx - w * 0.005, y + h * 0.398); stroke(g, 1.2, 'rgba(70,40,26,0.45)');
    seg(g, cx - w * 0.028, y + h * 0.427, cx + w * 0.03, y + h * 0.427, 1.2, 'rgba(70,34,24,0.5)');
    g.beginPath(); g.moveTo(cx - w * 0.05, y + h * 0.418); g.quadraticCurveTo(cx, y + h * 0.405, cx + w * 0.055, y + h * 0.418); stroke(g, 2.2, 'rgba(90,84,80,0.55)');
    g.fillStyle = 'rgba(40,26,10,0.35)'; g.fillRect(x, y, w, h);
    if (q.model >= 2) { // 龟裂
      g.strokeStyle = 'rgba(0,0,0,0.22)'; g.lineWidth = 0.8;
      for (var i = 0; i < 40; i++) { var px = x + rnd() * w, py = y + rnd() * h; g.beginPath(); g.moveTo(px, py); g.lineTo(px + rnd() * 14 - 7, py + rnd() * 14 - 7); g.lineTo(px + rnd() * 20 - 10, py + rnd() * 20 - 10); g.stroke(); }
    }
  }
  // 油画：风暴中的海崖与塔
  function paintSeascape(g, q, x, y, w, h) {
    g.fillStyle = K.lin(g, 0, y, 0, y + h, ['#2a3040', '#6a6a70', '#8a8478', '#2a2a2c']); g.fillRect(x, y, w, h);
    K.blob(g, x + w * 0.3, y + h * 0.2, w * 0.4, '#1a1e28', 0.6); K.blob(g, x + w * 0.8, y + h * 0.3, w * 0.3, '#c8b890', 0.25);
    g.fillStyle = K.lin(g, 0, y + h * 0.62, 0, y + h, ['#3a4448', '#1a2024']); g.fillRect(x, y + h * 0.62, w, h * 0.38);
    for (var i = 0; i < 12; i++) rect(g, x + (i * 37 % w), y + h * (0.66 + (i % 5) * 0.06), 14 + i % 3 * 6, 1.5, 'rgba(220,220,210,0.35)');
    fillP(g, [x + w * 0.38, y + h, x + w * 0.5, y + h * 0.56, x + w * 0.7, y + h * 0.5, x + w * 0.86, y + h * 0.6, x + w, y + h * 0.58, x + w, y + h], '#15181a');
    rect(g, x + w * 0.68, y + h * 0.2, w * 0.05, h * 0.32, '#121416'); fillP(g, [x + w * 0.67, y + h * 0.2, x + w * 0.705, y + h * 0.12, x + w * 0.74, y + h * 0.2], '#121416');
    rect(g, x + w * 0.695, y + h * 0.25, w * 0.012, h * 0.03, 'rgba(255,220,150,0.8)');
  }
  function drawHall(g, q) {
    setKey(-0.1);
    var R = Room(960, 600, 776, 40, 1500), rnd = K.rng(101);
    var vx = R.vx, vy = R.vy, base = R.base;
    // ---- 天花与墙 ----
    ceilingStrip(g, q, R, { col: '#2a180e', t: TX.walnutH, step: 300 });
    paperWall(g, q, 0, 40, W, base - 40, { c1: '#4a2232', c2: '#5c2c40', seed: 53, age: 0.35 });
    var cb = cornice(g, q, 0, 40, W, '#3a2416');
    // 护墙板
    var wainTop = 606;
    wainscot(g, q, [[0, 44], [326, 652], [1268, 1592], [1878, W]], wainTop, base, { t: TX.walnut, col: '#3e2414', pw: 150 });
    // 墙面装饰框
    if (q.model >= 1) {
      var frames = [[392, 150, 240, 410], [1288, 130, 200, 160]];
      for (var fI = 0; fI < frames.length; fI++) { var F = frames[fI]; g.strokeStyle = K.rgba('#c9a25a', 0.35); g.lineWidth = 3; g.strokeRect(F[0], F[1], F[2], F[3]); g.strokeStyle = lo(0.35); g.lineWidth = 2; g.strokeRect(F[0] + 3, F[1] + 3, F[2], F[3]); }
    }
    // 壁柱
    pilaster(g, q, 334, cb, 44, base - cb, '#3e2414', TX.walnut);
    pilaster(g, q, 1546, cb, 44, base - cb, '#3e2414', TX.walnut);

    // ---- 中央：楼梯间（拱门内） ----
    var ax0 = 700, ax1 = 1220, aSpring = 330, aR = (ax1 - ax0) / 2;
    function archPath(e) { g.beginPath(); g.moveTo(ax0 - e, base); g.lineTo(ax0 - e, aSpring); g.arc(vx, aSpring, aR + e, PI, 0); g.lineTo(ax1 + e, base); g.closePath(); }
    var Hs = 374, kL = 0.74, kB = 0.66, n = 13, eye = base - vy;
    function S3(X, Y, k) { return [vx + (X - vx) * k, vy + (eye - Y) * k]; }
    g.save(); archPath(0); g.clip();
    rect(g, ax0, 0, ax1 - ax0, base, '#2a1e26');
    // 楼梯间后墙
    var bwL = S3(ax0, 1400, kB), bwR = S3(ax1, Hs, kB);
    g.beginPath(); g.rect(bwL[0], 0, bwR[0] - bwL[0], bwR[1]); texFill(g, q, '#4e2a38', paperTex('#4a2434', '#5c2e42', null, 53));
    rect(g, bwL[0], 0, bwR[0] - bwL[0], bwR[1], lo(0.25));
    // 侧墙（透视）
    var lw0 = S3(ax0, 1400, 1), lw1 = S3(ax0, 0, 1);
    fillP(g, [ax0, -400, bwL[0], -400, bwL[0], bwR[1], ax0, base], '#3a1e2a');
    fillP(g, [ax0, -400, bwL[0], -400, bwL[0], bwR[1], ax0, base], K.lin(g, ax0, 0, bwL[0], 0, [lo(0.5), lo(0.15)]));
    fillP(g, [ax1, -400, bwR[0], -400, bwR[0], bwR[1], ax1, base], '#3a1e2a');
    fillP(g, [ax1, -400, bwR[0], -400, bwR[0], bwR[1], ax1, base], K.lin(g, ax1, 0, bwR[0], 0, [lo(0.55), lo(0.2)]));
    void lw0; void lw1;
    // 平台两侧的拱洞（楼梯向两侧继续）
    for (var sI = 0; sI < 2; sI++) {
      var Xs = sI ? ax1 : ax0, pA = S3(Xs, Hs, kL + 0.015), pB = S3(Xs, Hs, kB + 0.012), pT = S3(Xs, Hs + 300, kL + 0.015), pT2 = S3(Xs, Hs + 300, kB + 0.012);
      var mx = (pA[0] + pB[0]) / 2, my = (pT[1] + pT2[1]) / 2;
      g.beginPath(); g.moveTo(pA[0], pA[1]); g.lineTo(pT[0], pT[1]); g.quadraticCurveTo(mx, my - 40, pT2[0], pT2[1]); g.lineTo(pB[0], pB[1]); g.closePath();
      g.fillStyle = K.lin(g, 0, my - 40, 0, pA[1], ['#0c080a', '#1a1214']); g.fill();
    }
    // 高窗（尖拱）
    var wX0 = 868, wX1 = 1052, wB = Hs + 96, wT = Hs + 520;
    var w0 = S3(wX0, wT, kB), w1 = S3(wX1, wB, kB);
    var win = windowFront(g, q, R, w0[0], w0[1], w1[0] - w0[0], w1[1] - w0[1], { arch: true, cols: 3, rows: 4, seed: 21, horizon: 0.72, casing: 12, mw: 4, sill: false, depth: 0.975 });
    // 平台
    var l0 = S3(ax0, Hs, kL), l1 = S3(ax1, Hs, kL), l2 = S3(ax1, Hs, kB), l3 = S3(ax0, Hs, kB);
    fillP(g, [l0[0], l0[1], l1[0], l1[1], l2[0], l2[1], l3[0], l3[1]], '#6a6068');
    // 台阶（由远及近）
    var z0 = 1, zL = 1 / kL;
    var runX0 = 800, runX1 = 1120;
    for (var i = n - 1; i >= 0; i--) {
      var Yb = Hs * i / n, Yt = Hs * (i + 1) / n, ki = 1 / (z0 + (zL - z0) * i / n), kn = 1 / (z0 + (zL - z0) * (i + 1) / n);
      var dark = 0.25 + 0.4 * (i / n);
      if (Yt < eye) {
        var a = S3(ax0 + 8, Yt, ki), b2 = S3(ax1 - 8, Yt, ki), c2 = S3(ax1 - 8, Yt, kn), d2 = S3(ax0 + 8, Yt, kn);
        fillP(g, [a[0], a[1], b2[0], b2[1], c2[0], c2[1], d2[0], d2[1]], '#8a8288');
        var ra = S3(runX0, Yt, ki), rb = S3(runX1, Yt, ki), rc = S3(runX1, Yt, kn), rd = S3(runX0, Yt, kn);
        fillP(g, [ra[0], ra[1], rb[0], rb[1], rc[0], rc[1], rd[0], rd[1]], '#7a1424');
      }
      var r0 = S3(ax0 + 8, Yt, ki), r1 = S3(ax1 - 8, Yb, ki);
      g.beginPath(); g.rect(r0[0], r0[1], r1[0] - r0[0], r1[1] - r0[1]); texFill(g, q, '#6a6268', TX.marbleW, 0, 0, 1, 1); rect(g, r0[0], r0[1], r1[0] - r0[0], r1[1] - r0[1], 'rgba(40,30,40,0.35)');
      var c0 = S3(runX0, Yt, ki), c1 = S3(runX1, Yb, ki);
      g.beginPath(); g.rect(c0[0], c0[1], c1[0] - c0[0], c1[1] - c0[1]); texFill(g, q, '#6a1020', TX.velvet);
      rect(g, r0[0], r0[1], r1[0] - r0[0], r1[1] - r0[1], K.lin(g, 0, r0[1], 0, r1[1], [lo(dark * 0.4), lo(dark)]));
      // 踏步前缘高光 + 铜压条
      rect(g, r0[0], r0[1], r1[0] - r0[0], 2 * ki, hi(0.3));
      if (q.model >= 1) { g.fillStyle = metalGrad(g, 0, c1[1] - 4 * ki, 0, c1[1], '#b08a48'); g.fillRect(c0[0] - 4 * ki, c1[1] - 4 * ki, c1[0] - c0[0] + 8 * ki, 4 * ki); }
    }
    // 光：窗光洒在台阶与平台
    if (q.light >= 1) {
      g.save(); g.globalCompositeOperation = 'lighter';
      fillP(g, [l3[0], l3[1], l2[0], l2[1], l1[0] + 30, l1[1] + 150, l0[0] - 30, l0[1] + 150], K.lin(g, 0, l3[1], 0, l0[1] + 150, ['rgba(150,170,220,0.22)', 'rgba(150,170,220,0)']));
      g.restore();
    }
    // 栏杆（两侧）
    for (var side = 0; side < 2; side++) {
      var Xr = side ? ax1 - 4 : ax0 + 4, rail = 150;
      var nb = M(q, 6, 12, 18);
      for (var bI = 0; bI <= nb; bI++) {
        var tt = bI / nb, zz = z0 + (zL - z0) * tt, kk = 1 / zz, Ys = Hs * tt;
        var pb = S3(Xr, Ys + 8, kk), pt = S3(Xr, Ys + rail, kk), bw = 7 * kk;
        g.fillStyle = cylGrad(g, pb[0] - bw / 2, bw, '#3a2214'); g.fillRect(pb[0] - bw / 2, pt[1], bw, pb[1] - pt[1]);
        if (q.model >= 2) { ell(g, pb[0], pt[1] + (pb[1] - pt[1]) * 0.3, bw * 0.8, 3 * kk, '#4a2c18'); }
      }
      var hA = S3(Xr, rail, 1), hB = S3(Xr, Hs + rail, kL), sA = S3(Xr, 0, 1), sB = S3(Xr, Hs, kL);
      fillP(g, [sA[0] - 6, sA[1] - 24, sB[0] - 5, sB[1] - 22, sB[0] + 5, sB[1] + 2, sA[0] + 6, sA[1]], '#2e1a10');
      seg(g, hA[0], hA[1], hB[0], hB[1], 12, '#3a2012'); seg(g, hA[0], hA[1] - 4, hB[0], hB[1] - 3, 3, 'rgba(255,220,170,0.25)');
      var h2 = S3(Xr, Hs + rail, kB);
      seg(g, hB[0], hB[1], h2[0], h2[1], 9, '#3a2012');
    }
    if (q.light >= 1) { g.fillStyle = K.lin(g, 0, 0, 0, 330, [lo(0.55), lo(0)]); g.fillRect(ax0, 0, ax1 - ax0, 330); }
    g.restore();
    // 拱门框（拱券 + 拱心石 + 墩柱）
    g.beginPath(); g.moveTo(ax0 - 34, base); g.lineTo(ax0 - 34, aSpring); g.arc(vx, aSpring, aR + 34, PI, 0); g.lineTo(ax1 + 34, base); g.lineTo(ax1, base); g.lineTo(ax1, aSpring); g.arc(vx, aSpring, aR, 0, PI, true); g.lineTo(ax0, base); g.closePath();
    texFill(g, q, '#3e2414', TX.walnut);
    g.beginPath(); g.moveTo(ax0 - 34, base); g.lineTo(ax0 - 34, aSpring); g.arc(vx, aSpring, aR + 34, PI, 0); g.lineTo(ax1 + 34, base); g.lineTo(ax1, base); g.lineTo(ax1, aSpring); g.arc(vx, aSpring, aR, 0, PI, true); g.lineTo(ax0, base); g.closePath();
    g.fillStyle = K.lin(g, 0, aSpring - aR - 34, 0, base, [hi(0.1), lo(0.1), lo(0.25)]); g.fill();
    g.beginPath(); g.arc(vx, aSpring, aR + 17, PI, 0); stroke(g, 3, lo(0.45)); g.beginPath(); g.arc(vx, aSpring, aR + 6, PI, 0); stroke(g, 2, hi(0.18));
    seg(g, ax0 - 17, aSpring, ax0 - 17, base - 40, 3, lo(0.4)); seg(g, ax1 + 17, aSpring, ax1 + 17, base - 40, 3, lo(0.4));
    // 拱心石
    fillP(g, [vx - 22, aSpring - aR - 40, vx + 22, aSpring - aR - 40, vx + 15, aSpring - aR + 6, vx - 15, aSpring - aR + 6], '#5a3a22');
    bevel(g, vx - 18, aSpring - aR - 36, 36, 38, 5, 0.2, 0.4);
    // 拱脚柱头
    bands(g, ax0 - 42, aSpring - 6, 50, [[3, hi(0.3)], [9, '#5a3a22'], [4, lo(0.5)]]);
    bands(g, ax1 - 8, aSpring - 6, 50, [[3, hi(0.3)], [9, '#5a3a22'], [4, lo(0.5)]]);
    // 楼梯口立柱 + 柱灯
    for (var nI = 0; nI < 2; nI++) {
      var nx = nI ? ax1 - 30 : ax0 - 10, ny = base + 18;
      if (q.light >= 1) K.contact(g, nx + 20, ny, 40, 8, 0.6);
      box(g, q, R, nx, ny - 200, 40, 200, 0.96, { col: '#3a2012', t: TX.walnut });
      if (q.model >= 1) groove(g, nx + 7, ny - 170, 26, 120, 3, 0.4);
      bands(g, nx - 6, ny - 212, 52, [[3, hi(0.3)], [9, '#4a2a16'], [3, lo(0.5)]]);
      g.fillStyle = metalGrad(g, nx + 8, 0, nx + 32, 0, '#a8823e'); K.rr(g, nx + 10, ny - 252, 20, 42, 6); g.fill();
      g.fillStyle = K.rad(g, nx + 16, ny - 280, 2, 22, ['#fff6e0', '#f0d8b0', '#c8a880']); circle(g, nx + 20, ny - 274, 20, g.fillStyle);
    }

    // ---- 门 ----
    door(g, q, R, 72, 384, 224, base - 384, { double: true, pediment: true, t: TX.walnut, col: '#4a2816' });
    door(g, q, R, 1624, 384, 224, base - 384, { double: true, pediment: true, t: TX.walnut, col: '#4a2816' });

    // ---- 画 ----
    if (q.model >= 1) {
      frame(g, q, 430, 176, 164, 210, function (g2, q2, x, y, w, h) { paintPortrait(g2, q2, x, y, w, h, { seed: 5 }); }, { fw: 16 });
      frame(g, q, 1310, 150, 156, 120, function (g2, q2, x, y, w, h) { paintSeascape(g2, q2, x, y, w, h); }, { fw: 12 });
    }
    // ---- 壁灯 ----
    var sc1 = [612, 420], sc2 = [1500, 372];
    sconce(g, q, sc1[0], sc1[1], { arms: 2, candle: true, scale: 0.9 });
    sconce(g, q, sc2[0], sc2[1], { arms: 2, candle: true, scale: 0.9 });
    sconce(g, q, 30, 300, { arms: 1, candle: true, scale: 0.9 });
    sconce(g, q, 1898, 300, { arms: 1, candle: true, scale: 0.9 });

    // ---- 地面 ----
    tileFloor(g, q, R, { tile: 96, cols: ['#7c7278', '#151116'], ts: [TX.marbleW, TX.marbleB], mortar: '#3a3238', gap: 1.4, seed: 17, var: 0.05 });
    if (q.light >= 1) K.ao(g, 0, base - 2, W, 40, 30, 0.3, 't');
    // 楼梯口反光
    floorSheen(g, q, R, vx, 160, '#b0c0e8', 0.1);
    floorSheen(g, q, R, 710, 40, '#ffd8a0', 0.16); floorSheen(g, q, R, 1210, 40, '#ffd8a0', 0.16);
    floorSheen(g, q, R, 620, 24, '#ffb060', 0.12); floorSheen(g, q, R, 472, 120, '#3a5048', 0.08);
    floorSheen(g, q, R, 1384, 110, '#6a2a18', 0.08);
    floorSheen(g, q, R, 184, 120, '#ffd0a0', 0.05);
    floorSheen(g, q, R, 1736, 120, '#ffd0a0', 0.05);
    // 地毯
    rug(g, q, R, 836, 1084, 1.02, R.dB * 1.1, { col: '#6a1222', border: '#2a0810', gold: '#c9a25a', medallion: false, fringe: false, bw: 0.12 });
    // ---- 家具与陈设 ----
    crowStatue(g, q, R, 472, base + 16);
    candlestick(g, q, 620, base - 30 + 16, 120);
    grandClock(g, q, R, 1322, 302, 124, base + 14);
    bench(g, q, R, 1424, 812, 352, 936, { col: '#6a1424' });
    // 楼梯口两侧的花瓶（高画质）
    if (q.model >= 2) {
      for (var vI = 0; vI < 2; vI++) {
        var vxp = vI ? 1292 : 628, vyp = base + 6;
        void vxp; void vyp;
      }
    }
    // ---- 吊灯 ----
    chandelier(g, q, 960, 118, 1);

    // ---- 光照 ----
    var Lm = [
      { lin: [0, 0, 0, H], stops: [[0, 'rgba(60,40,50,0.0)'], [0.5, 'rgba(70,60,70,0.25)'], [1, 'rgba(30,25,40,0.1)']] },
      { x: 960, y: 140, r: 1000, ry: 760, c: '#ffcf96', i: 0.55, fall: 0.35 },
      { x: 960, y: 920, r: 760, ry: 220, c: '#ffc888', i: 0.32, q: 1 },
      { x: 960, y: 260, r: 300, ry: 420, c: '#a8b8e0', i: 0.55 },
      { x: 960, y: 520, r: 260, ry: 300, c: '#8898c8', i: 0.3, q: 1 },
      { x: sc1[0], y: sc1[1] - 20, r: 230, ry: 330, c: '#ffb870', i: 0.45, q: 1 },
      { x: sc2[0], y: sc2[1] - 20, r: 230, ry: 330, c: '#ffb870', i: 0.45, q: 1 },
      { x: 30, y: 280, r: 200, ry: 300, c: '#ffb870', i: 0.35, q: 1 },
      { x: 1898, y: 280, r: 200, ry: 300, c: '#ffb870', i: 0.35, q: 1 },
      { x: 620, y: 640, r: 160, c: '#ffb060', i: 0.4, q: 1 },
      { x: 690, y: 520, r: 140, c: '#ffd8a0', i: 0.35, q: 1 }, { x: 1210, y: 520, r: 140, c: '#ffd8a0', i: 0.35, q: 1 },
      { x: 300, y: 980, r: 520, ry: 200, c: '#806878', i: 0.15, q: 2 }, { x: 1620, y: 980, r: 520, ry: 200, c: '#806878', i: 0.15, q: 2 }
    ];
    lightMap(g, q, '#463e54', Lm);
    // ---- 自发光 ----
    shaft(g, q, [win.gx, win.gy + 40, win.gx + win.gw, win.gy + 40, 1180, 900, 760, 900], '#b8c8f0', 0.09, 0, win.gy, 0, 900);
    if (q.light >= 2) K.motes(g, K.rng(31), 60, 800, 220, 320, 500, '#d0dcff', 0.35);
    sconceGlow(g, q, sc1[0], sc1[1], { arms: 2, candle: true, scale: 0.9 });
    sconceGlow(g, q, sc2[0], sc2[1], { arms: 2, candle: true, scale: 0.9 });
    sconceGlow(g, q, 30, 300, { arms: 1, candle: true, scale: 0.9 });
    sconceGlow(g, q, 1898, 300, { arms: 1, candle: true, scale: 0.9 });
    K.flame(g, q, 620, base - 30 + 16 - 122, 16, { glow: 5 });
    for (var gI = 0; gI < 2; gI++) { var gx2 = gI ? 1210 : 710; K.glow(g, gx2, base + 18 - 274, 70, '#ffd8a0', 0.5); }
    chandelier(g, q, 960, 118, 1, true);
    if (q.light >= 2) {
      // 黄铜/青铜高光
      g.save(); g.globalCompositeOperation = 'lighter';
      K.glow(g, 1384, 386, 40, '#fff0d0', 0.12);
      g.restore();
    }
    finish(g, q, { vig: 0.5 });
    void rnd;
  }

  DM.HDBG.def('hall', {
    draw: function (g, q) { drawHall(g, q); },
    lights: [
      LT(960, 120, 300, '#ffcf96', 0.7, 0.05, 'lamp'),
      LT(960, 260, 220, '#b0c0e8', 0.45, 0, 'window'),
      LT(612, 396, 110, '#ffb060', 0.55, 0.35, 'candle'), LT(1500, 348, 110, '#ffb060', 0.55, 0.35, 'candle'),
      LT(30, 276, 90, '#ffb060', 0.45, 0.35, 'candle'), LT(1898, 276, 90, '#ffb060', 0.45, 0.35, 'candle'),
      LT(620, 646, 80, '#ffb060', 0.5, 0.45, 'candle'),
      LT(710, 520, 80, '#ffd8a0', 0.45, 0.04, 'lamp'), LT(1210, 520, 80, '#ffd8a0', 0.45, 0.04, 'lamp')
    ],
    key: { x: -0.1, color: '#ffd4a0', amb: '#3a3048', rim: 0.45 },
    outdoor: false
  });


  /* ================================================================
   * 共用家具：壁炉、烛台、餐桌、椅子
   * ================================================================ */
  // 壁炉（石材 + 炉膛 + 柴火）；火焰在 fireGlow 中画（光照之后）
  function fireplace(g, q, R, x, y, w, h, o) {
    o = o || {};
    var by = y + h, stone = o.stone || '#6a6066', t = o.t || TX.marbleW, k = R.kWall(by + 30);
    var fx = x + w * 0.2, fw = w * 0.6, fy = y + h * 0.36, fh = by - fy;
    // 炉床（地面石板）
    box(g, q, R, x - 30, by, w + 60, 26, R.kWall(by + 34) * 1.0, { col: K.shade(stone, -0.1), t: t, topHi: 0.18 });
    // 壁炉主体
    if (q.light >= 1) softRect(g, x + (KX < 0 ? 10 : -10), y + 10, w, h, 14, 0.45);
    box(g, q, R, x, y + 40, w, h - 40, k, { col: stone, t: t });
    // 炉膛
    var archR = fw / 2;
    g.beginPath(); g.moveTo(fx, by); g.lineTo(fx, fy + archR * 0.5); g.quadraticCurveTo(fx, fy, fx + archR, fy); g.quadraticCurveTo(fx + fw, fy, fx + fw, fy + archR * 0.5); g.lineTo(fx + fw, by); g.closePath();
    g.fillStyle = '#0c0806'; g.fill();
    g.save(); g.clip();
    // 炉膛内壁（砖）
    var ib = R.p(fx, by, 0.93), ib2 = R.p(fx + fw, fy, 0.93);
    g.beginPath(); g.rect(ib[0], ib2[1], ib2[0] - ib[0], ib[1] - ib2[1]);
    texFill(g, q, '#3a1e16', ['brick', { c1: '#2a1410', c2: '#5a2a1e', mortar: '#140a08', seed: 7 }, 90]);
    rect(g, fx, fy, fw, fh, 'rgba(10,6,4,0.55)');
    fillP(g, [fx, fy, ib[0], ib2[1], ib[0], ib[1], fx, by], 'rgba(20,10,6,0.7)');
    fillP(g, [fx + fw, fy, ib2[0], ib2[1], ib2[0], ib[1], fx + fw, by], 'rgba(10,6,4,0.8)');
    // 柴架与木柴
    var lg = by - 18;
    for (var i = 0; i < 3; i++) {
      var lx = fx + fw * (0.18 + i * 0.22), ly = lg - (i === 1 ? 26 : 8);
      g.save(); g.translate(lx + 40, ly); g.rotate(i === 1 ? -0.06 : i ? 0.12 : -0.14);
      g.fillStyle = K.lin(g, 0, -12, 0, 12, ['#3a2618', '#1a0e08', '#0a0604']); K.rr(g, -50, -12, 100, 24, 11); g.fill();
      ell(g, 50, 0, 6, 11, '#5a3a22'); ell(g, 50, 0, 3, 6, '#2a1608');
      g.restore();
    }
    g.fillStyle = metalGrad(g, fx + 20, 0, fx + 30, 0, '#2a2a30'); g.fillRect(fx + fw * 0.12, lg - 30, 9, 30); g.fillRect(fx + fw * 0.85, lg - 30, 9, 30);
    g.restore();
    // 炉口边框 + 拱心
    g.beginPath(); g.moveTo(fx - 16, by); g.lineTo(fx - 16, fy + archR * 0.5); g.quadraticCurveTo(fx - 16, fy - 16, fx + archR, fy - 16); g.quadraticCurveTo(fx + fw + 16, fy - 16, fx + fw + 16, fy + archR * 0.5); g.lineTo(fx + fw + 16, by);
    g.lineTo(fx + fw, by); g.lineTo(fx + fw, fy + archR * 0.5); g.quadraticCurveTo(fx + fw, fy, fx + archR, fy); g.quadraticCurveTo(fx, fy, fx, fy + archR * 0.5); g.lineTo(fx, by); g.closePath();
    texFill(g, q, K.shade(stone, 0.1), t); g.fillStyle = hi(0.1); g.fill();
    // 壁柱（两侧）
    if (q.model >= 1) for (var c = 0; c < 2; c++) {
      var px = c ? x + w - 40 : x + 14;
      g.beginPath(); g.rect(px, y + 60, 26, h - 70); texFill(g, q, K.shade(stone, 0.12), t);
      rect(g, px, y + 60, 26, h - 70, cylGrad(g, px, 26, 'rgba(128,128,128,0.0)')); bevel(g, px, y + 60, 26, h - 70, 5, 0.18, 0.35);
    }
    // 壁炉台（台面）
    box(g, q, R, x - 22, y + 18, w + 44, 24, 0.965, { col: K.shade(stone, 0.12), t: t, topHi: 0.25 });
    bands(g, x - 8, y + 42, w + 16, [[3, lo(0.5)], [6, K.shade(stone, -0.05)], [2, hi(0.2)]]);
    // 炉膛口的热光（底色）
    g.save(); g.globalCompositeOperation = 'lighter';
    g.fillStyle = K.rad(g, fx + fw / 2, by - 20, 4, fw * 0.6, ['rgba(255,140,50,0.45)', 'rgba(200,70,20,0.15)', 'rgba(0,0,0,0)']); g.fillRect(fx - 40, fy - 40, fw + 80, fh + 60);
    g.restore();
    return { fx: fx, fw: fw, fy: fy, by: by, mantel: y + 18 };
  }
  // 一条火舌（加色混合）
  function tongue(g, x, by, w, h, lean, a) {
    g.beginPath(); g.moveTo(x - w, by);
    g.bezierCurveTo(x - w * 1.1, by - h * 0.45, x - w * 0.2 + lean * 0.3, by - h * 0.6, x + lean, by - h);
    g.bezierCurveTo(x + w * 0.3 + lean * 0.4, by - h * 0.55, x + w * 1.1, by - h * 0.4, x + w, by); g.closePath();
    g.fillStyle = K.lin(g, 0, by - h, 0, by, [[0, 'rgba(255,90,20,0)'], [0.35, 'rgba(255,120,30,' + (a * 0.6) + ')'], [0.75, 'rgba(255,190,80,' + a + ')'], [1, 'rgba(255,240,180,' + a + ')']]);
    g.fill();
  }
  function fireGlow(g, q, F, seed) {
    var rnd = K.rng(seed || 3), cx = F.fx + F.fw / 2, by = F.by - 24;
    if (q.light >= 1) K.glow(g, cx, by - 30, F.fw * 0.95, '#ff8a30', 0.32);
    g.save(); g.globalCompositeOperation = 'lighter';
    var n = M(q, 5, 9, 14);
    for (var i = 0; i < n; i++) {
      var u = (i + 0.5) / n, fx = F.fx + F.fw * (0.16 + 0.68 * u) + (rnd() - 0.5) * 10;
      var mid = 1 - Math.abs(u - 0.5) * 1.6, fh = 26 + mid * 80 * (0.6 + rnd() * 0.6), fw = 8 + rnd() * 10;
      tongue(g, fx, by, fw, fh, (rnd() - 0.5) * 22, 0.55);
      tongue(g, fx, by, fw * 0.5, fh * 0.6, (rnd() - 0.5) * 8, 0.7);
    }
    g.fillStyle = K.rad(g, cx, by - 4, 2, F.fw * 0.36, ['rgba(255,240,190,0.7)', 'rgba(255,160,60,0.35)', 'rgba(255,90,20,0)']);
    g.fillRect(cx - F.fw * 0.4, by - F.fw * 0.36, F.fw * 0.8, F.fw * 0.5);
    for (var j = 0; j < M(q, 6, 14, 24); j++) circle(g, F.fx + F.fw * (0.15 + rnd() * 0.7), F.by - 8 - rnd() * 16, 1.2 + rnd() * 2.2, 'rgba(255,' + (120 + (rnd() * 100 | 0)) + ',40,0.8)');
    if (q.light >= 2) for (var k = 0; k < 8; k++) circle(g, cx + (rnd() - 0.5) * F.fw * 0.6, by - 60 - rnd() * 90, 1 + rnd(), 'rgba(255,170,80,0.6)');
    g.restore();
  }
  // 多臂烛台（银/铜）。cx 中心，by 底座底，h 总高（含蜡烛）
  function candelabra(g, q, cx, by, h, o) {
    o = o || {};
    var s = h / 160, col = o.col || '#b0a890', arms = o.arms || 5;
    var tips = [];
    g.save(); g.translate(cx, by); g.scale(s, s);
    if (q.light >= 1) K.contact(g, 0, 0, 34, 6, 0.6);
    g.beginPath(); g.moveTo(-24, 0); g.bezierCurveTo(-22, -10, -8, -12, -6, -20); g.lineTo(6, -20); g.bezierCurveTo(8, -12, 22, -10, 24, 0); g.closePath();
    g.fillStyle = metalGrad(g, -24, 0, 24, 0, col); g.fill();
    g.fillStyle = metalGrad(g, -6, 0, 6, 0, col); g.fillRect(-5, -80, 10, 62);
    ell(g, 0, -50, 9, 5, K.shade(col, 0.2)); ell(g, 0, -80, 8, 4, K.shade(col, 0.1));
    var spread = [-56, -30, 0, 30, 56].slice(0, arms);
    if (arms === 3) spread = [-46, 0, 46];
    for (var i = 0; i < spread.length; i++) {
      var ax = spread[i], ay = ax === 0 ? -112 : (Math.abs(ax) > 40 ? -96 : -104);
      if (ax !== 0) { g.beginPath(); g.moveTo(0, -78); g.bezierCurveTo(ax * 0.3, -60, ax, -66, ax, ay + 8); stroke(g, 4.5, K.shade(col, -0.2)); g.beginPath(); g.moveTo(0, -79); g.bezierCurveTo(ax * 0.3, -61, ax, -67, ax, ay + 7); stroke(g, 1.4, hi(0.4)); }
      else { g.fillStyle = metalGrad(g, -4, 0, 4, 0, col); g.fillRect(-4, -110, 8, 32); }
      g.fillStyle = metalGrad(g, ax - 8, 0, ax + 8, 0, col); K.rr(g, ax - 7, ay - 2, 14, 10, 3); g.fill(); ell(g, ax, ay + 8, 10, 3, K.shade(col, -0.1));
      g.fillStyle = K.lin(g, ax - 4, 0, ax + 4, 0, ['#d0c4a8', '#f8f0e0', '#d8cab0']); g.fillRect(ax - 4, ay - 34, 8, 32);
      seg(g, ax, ay - 34, ax, ay - 38, 1.2, '#2a1a0a');
      tips.push([cx + ax * s, by + (ay - 38) * s]);
    }
    g.restore();
    return tips;
  }
  function candleFlames(g, q, tips, sz) { for (var i = 0; i < tips.length; i++) K.flame(g, q, tips[i][0], tips[i][1] + 2, sz || 14, { glow: 4.5, a: 0.4 }); }
  // 餐椅（只露出靠背；放在桌子后侧）
  function chairBack(g, q, x, y, w, h, o) {
    o = o || {};
    var wood = o.wood || '#3a1c10', up = o.up || '#6a1424';
    if (q.light >= 1) softRect(g, x + 4, y + 8, w, h, 6, 0.35);
    // 靠背框（顶部弧形）
    g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + 18); g.quadraticCurveTo(x + w / 2, y - 14, x + w, y + 18); g.lineTo(x + w, y + h); g.closePath();
    texFill(g, q, wood, TX.mahog); g.fillStyle = K.lin(g, x, 0, x + w, 0, [hi(0.1), lo(0.1), lo(0.35)]); g.fill();
    // 软包
    g.beginPath(); g.moveTo(x + 8, y + h); g.lineTo(x + 8, y + 24); g.quadraticCurveTo(x + w / 2, y + 0, x + w - 8, y + 24); g.lineTo(x + w - 8, y + h); g.closePath();
    texFill(g, q, up, TX.velvet); g.fillStyle = K.rad(g, x + w * 0.4, y + h * 0.35, 2, w, [hi(0.16), lo(0.35)]); g.fill();
    if (q.model >= 1) { g.strokeStyle = '#8a6a30'; g.lineWidth = 1.6; g.stroke(); circle(g, x + w / 2, y - 3, 4, '#8a6a30'); }
  }
  // 铺桌布的长桌。x,w 正面；ty 桌面前缘；by 桌腿落地；k 桌面背缘缩放
  function clothTable(g, q, R, x, ty, w, by, k, o) {
    o = o || {};
    var drop = o.drop || (by - ty) * 0.42, cloth = o.cloth || '#d6d0c6';
    var tl = R.p(x, ty, k), tr = R.p(x + w, ty, k);
    // 桌腿（布下露出）
    var legs = [x + 30, x + w * 0.33, x + w * 0.66, x + w - 44];
    if (q.light >= 1) { K.contact(g, x + w / 2, by, w * 0.55, 18, 0.55); }
    for (var i = 0; i < legs.length; i++) {
      cyl(g, legs[i], ty + drop - 4, 16, by - ty - drop + 4, '#3a1c10');
      if (q.model >= 1) { ell(g, legs[i] + 8, ty + drop + (by - ty - drop) * 0.35, 11, 5, '#4a2414'); ell(g, legs[i] + 8, by - 4, 10, 4, '#2a1208'); }
    }
    // 桌布顶面
    K.poly(g, [x - 8, ty, x + w + 8, ty, tr[0] + 6, tr[1], tl[0] - 6, tl[1]]); texFill(g, q, cloth, TX.linen);
    K.poly(g, [x - 8, ty, x + w + 8, ty, tr[0] + 6, tr[1], tl[0] - 6, tl[1]]); g.fillStyle = K.lin(g, 0, tl[1], 0, ty, [lo(0.12), hi(0.08)]); g.fill();
    // 端头垂布（透视侧面）
    if (x > R.vx) fillP(g, [x - 8, ty, tl[0] - 6, tl[1], tl[0] - 6, tl[1] + drop * k, x - 8, ty + drop], K.shade(cloth, -0.3));
    if (x + w < R.vx) fillP(g, [x + w + 8, ty, tr[0] + 6, tr[1], tr[0] + 6, tr[1] + drop * k, x + w + 8, ty + drop], K.shade(cloth, -0.3));
    if (x < R.vx && x + w > R.vx) {
      fillP(g, [x - 8, ty, tl[0] - 6, tl[1], tl[0] - 6, tl[1] + drop * k, x - 8, ty + drop], K.shade(cloth, KX < 0 ? -0.1 : -0.35));
      fillP(g, [x + w + 8, ty, tr[0] + 6, tr[1], tr[0] + 6, tr[1] + drop * k, x + w + 8, ty + drop], K.shade(cloth, KX < 0 ? -0.35 : -0.1));
    }
    // 正面垂布 + 褶皱
    var n = M(q, 6, 12, 20), rnd = K.rng(o.seed || 41);
    g.beginPath(); g.moveTo(x - 8, ty);
    g.lineTo(x + w + 8, ty); g.lineTo(x + w + 8, ty + drop);
    for (var j = n; j >= 0; j--) { var fx = x - 8 + (w + 16) * j / n; g.lineTo(fx, ty + drop + (j % 2 ? 5 : 0) + rnd() * 3); }
    g.closePath(); texFill(g, q, cloth, TX.linen);
    g.save(); g.clip();
    for (var f = 0; f < n; f++) {
      var x0 = x - 8 + (w + 16) * f / n, ww = (w + 16) / n;
      var gr = K.lin(g, x0, 0, x0 + ww, 0, [[0, lo(0.2)], [0.35, hi(0.08)], [0.6, lo(0.02)], [1, lo(0.22)]]);
      g.fillStyle = gr; g.fillRect(x0, ty + drop * 0.12, ww, drop);
      g.fillStyle = K.lin(g, 0, ty, 0, ty + drop * 0.4, [hi(0.12), hi(0)]); g.fillRect(x0, ty, ww, drop * 0.4);
    }
    g.fillStyle = K.lin(g, 0, ty, 0, ty + drop, [hi(0.12), lo(0.08), lo(0.3)]); g.fillRect(x - 10, ty, w + 20, drop + 10);
    g.restore();
    rect(g, x - 8, ty, w + 16, 2.5, hi(0.35));
    if (q.model >= 2) { // 蕾丝边
      for (var lI = 0; lI < (w + 16) / 14; lI++) { var lx = x - 8 + lI * 14; g.beginPath(); g.arc(lx + 7, ty + drop - 2, 6, 0, PI); stroke(g, 1.2, 'rgba(255,250,240,0.55)'); }
    }
    return { tl: tl, tr: tr };
  }
  // 桌面摆设（盘子、酒杯、餐巾）
  function placeSettings(g, q, R, x, ty, w, k, n) {
    for (var i = 0; i < n; i++) {
      var u = (i + 0.5) / n, X = x + w * u;
      var p = R.p(X, ty, k + (1 - k) * 0.72);
      ell(g, p[0], p[1], 26, 6, '#efece6'); ell(g, p[0], p[1], 20, 4.5, '#d8d4cc'); ell(g, p[0], p[1] - 0.6, 13, 2.6, '#f4f2ee');
      if (q.model >= 2) {
        // 酒杯
        var gx = p[0] + 30, gy = p[1] - 4;
        seg(g, gx, gy, gx, gy - 14, 1.4, 'rgba(220,230,240,0.7)'); ell(g, gx, gy, 5, 1.5, 'rgba(220,230,240,0.6)');
        g.beginPath(); g.moveTo(gx - 6, gy - 28); g.quadraticCurveTo(gx - 6, gy - 14, gx, gy - 14); g.quadraticCurveTo(gx + 6, gy - 14, gx + 6, gy - 28); stroke(g, 1.2, 'rgba(220,230,240,0.6)');
        ell(g, gx, gy - 20, 4.5, 1.6, 'rgba(120,10,24,0.8)');
        // 刀叉
        seg(g, p[0] - 32, p[1] - 3, p[0] - 30, p[1] + 5, 1.6, '#c8c8d0'); seg(g, p[0] + 32, p[1] - 3, p[0] + 34, p[1] + 5, 1.6, '#c8c8d0');
      }
    }
  }
  // 油画：月下枯枝上的乌鸦
  function paintCrow(g, q, x, y, w, h) {
    var rnd = K.rng(9);
    g.fillStyle = K.lin(g, 0, y, 0, y + h, ['#1a2034', '#3a4058', '#5a5260', '#2a2028']); g.fillRect(x, y, w, h);
    // 月亮 + 光晕
    var mx = x + w * 0.56, my = y + h * 0.3, mr = h * 0.15;
    g.fillStyle = K.rad(g, mx, my, mr, mr * 5, ['rgba(230,210,160,0.55)', 'rgba(140,130,130,0.15)', 'rgba(0,0,0,0)']); g.fillRect(x, y, w, h);
    g.fillStyle = K.rad(g, mx - mr * 0.3, my - mr * 0.3, 1, mr, ['#f6ecd0', '#d8c69a']); circle(g, mx, my, mr, g.fillStyle);
    ell(g, mx + mr * 0.25, my + mr * 0.1, mr * 0.25, mr * 0.18, 'rgba(160,140,100,0.4)');
    // 云
    for (var i = 0; i < M(q, 3, 6, 9); i++) K.blob(g, x + (i % 2 ? 0.75 + rnd() * 0.25 : rnd() * 0.3) * w, y + h * (0.08 + rnd() * 0.3), w * (0.1 + rnd() * 0.15), '#10121e', 0.55);
    // 远山与地面
    fillP(g, [x, y + h, x, y + h * 0.78, x + w * 0.2, y + h * 0.72, x + w * 0.45, y + h * 0.8, x + w * 0.7, y + h * 0.74, x + w, y + h * 0.82, x + w, y + h], '#0a080e');
    // 枯枝
    g.lineCap = 'round';
    g.beginPath(); g.moveTo(x - 4, y + h * 0.86); g.bezierCurveTo(x + w * 0.2, y + h * 0.78, x + w * 0.3, y + h * 0.66, x + w * 0.5, y + h * 0.62); stroke(g, 9, '#08060a');
    g.beginPath(); g.moveTo(x + w * 0.32, y + h * 0.68); g.quadraticCurveTo(x + w * 0.36, y + h * 0.5, x + w * 0.3, y + h * 0.38); stroke(g, 4, '#08060a');
    g.beginPath(); g.moveTo(x + w * 0.45, y + h * 0.63); g.quadraticCurveTo(x + w * 0.6, y + h * 0.58, x + w * 0.66, y + h * 0.48); stroke(g, 3, '#08060a');
    g.beginPath(); g.moveTo(x + w * 0.2, y + h * 0.78); g.quadraticCurveTo(x + w * 0.14, y + h * 0.62, x + w * 0.18, y + h * 0.5); stroke(g, 3, '#08060a');
    // 乌鸦
    crowShape(g, x + w * 0.42, y + h * 0.63, h / 260, 1); g.fillStyle = '#050407'; g.fill();
    circle(g, x + w * 0.42 + 58 * h / 260, y + h * 0.63 - 143 * h / 260, 1.6, '#c03040');
    // 远处的飞鸦
    for (var j = 0; j < M(q, 2, 4, 6); j++) {
      var bx = x + w * (0.55 + rnd() * 0.35), by = y + h * (0.1 + rnd() * 0.3), bs = 5 + rnd() * 6;
      g.beginPath(); g.moveTo(bx - bs, by - bs * 0.3); g.quadraticCurveTo(bx - bs * 0.4, by - bs * 0.6, bx, by); g.quadraticCurveTo(bx + bs * 0.4, by - bs * 0.6, bx + bs, by - bs * 0.3); stroke(g, 1.6, '#06050a');
    }
    // 月光边缘
    g.beginPath(); g.moveTo(x + w * 0.36, y + h * 0.67); g.bezierCurveTo(x + w * 0.4, y + h * 0.645, x + w * 0.46, y + h * 0.63, x + w * 0.5, y + h * 0.62); stroke(g, 1.2, 'rgba(220,200,150,0.35)');
  }
  // 16mm 放映机（侧面朝左），放在三脚台上
  function projector(g, q, R, x, y, w, h, by) {
    var cx = x + w / 2;
    // 台子
    if (q.light >= 1) K.contact(g, cx, by, 70, 10, 0.55);
    var ty = y + h - 4;
    for (var l = -1; l <= 1; l++) seg(g, cx, ty + 20, cx + l * 46, by, 5, '#2a2a30');
    box(g, q, R, cx - 56, ty, 112, 16, 0.94, { col: '#3a2416', t: TX.walnutH });
    cyl(g, cx - 5, ty + 16, 10, 30, '#3a3a42');
    // 机身
    var bx = x + w * 0.18, bw = w * 0.62, bh = h * 0.36, byy = ty - bh;
    box(g, q, R, bx, byy, bw, bh, 0.95, { col: '#2e3034', t: TX.iron, frontLo: 0.4 });
    rect(g, bx + 8, byy + 10, bw * 0.4, bh * 0.4, '#1a1a1e'); rect(g, bx + 8, byy + 10, bw * 0.4, 2, hi(0.2));
    // 镜头（朝左）
    g.fillStyle = metalGrad(g, 0, byy + bh * 0.3, 0, byy + bh * 0.75, '#4a4a52'); g.fillRect(bx - 34, byy + bh * 0.3, 34, bh * 0.45);
    ell(g, bx - 34, byy + bh * 0.525, 5, bh * 0.25, '#0c0e14'); ell(g, bx - 35, byy + bh * 0.48, 2, bh * 0.08, 'rgba(160,190,230,0.6)');
    // 片盘臂 + 两个片盘
    var reels = [[x + w * 0.3, byy - h * 0.34], [x + w * 0.78, byy - h * 0.3]];
    seg(g, bx + bw * 0.25, byy, reels[0][0], reels[0][1], 5, '#3a3a42'); seg(g, bx + bw * 0.8, byy, reels[1][0], reels[1][1], 5, '#3a3a42');
    for (var r = 0; r < 2; r++) {
      var rx = reels[r][0], ry = reels[r][1], rr = h * 0.27;
      circle(g, rx, ry, rr, '#2a2c30'); g.beginPath(); g.arc(rx, ry, rr, 0, TAU); stroke(g, 2.5, '#5a5c64');
      if (q.model >= 1) for (var sp = 0; sp < 3; sp++) { var a = sp / 3 * TAU + r; fillP(g, [rx + Math.cos(a) * rr * 0.25, ry + Math.sin(a) * rr * 0.25, rx + Math.cos(a + 0.5) * rr * 0.85, ry + Math.sin(a + 0.5) * rr * 0.85, rx + Math.cos(a - 0.5) * rr * 0.85, ry + Math.sin(a - 0.5) * rr * 0.85], '#0e0e12'); }
      circle(g, rx, ry, rr * 0.18, '#7a7c84'); circle(g, rx - 2, ry - 2, rr * 0.06, hi(0.6));
      if (q.light >= 2) { g.beginPath(); g.arc(rx, ry, rr - 3, PI * 1.1, PI * 1.5); stroke(g, 1.5, 'rgba(220,230,250,0.35)'); }
    }
    // 胶片路径
    g.beginPath(); g.moveTo(reels[0][0] + 6, reels[0][1] + h * 0.27); g.lineTo(bx + 10, byy + 6); stroke(g, 1.5, '#5a4a3a');
    g.beginPath(); g.moveTo(reels[1][0] - 6, reels[1][1] + h * 0.27); g.lineTo(bx + bw - 10, byy + 6); stroke(g, 1.5, '#5a4a3a');
    return { lens: [bx - 38, byy + bh * 0.52] };
  }
  // 留声机（喇叭朝左上）放在矮柜上
  function gramophone(g, q, R, x, y, w, h, by) {
    var cab = y + h * 0.42;
    if (q.light >= 1) K.contact(g, x + w / 2, by, w * 0.6, 10, 0.6);
    box(g, q, R, x + 6, cab + 22, w - 12, by - cab - 22, R.kWall(by) * 0.99, { col: '#4a2614', t: TX.mahog });
    if (q.model >= 1) { groove(g, x + 18, cab + 36, w / 2 - 24, by - cab - 52, 3, 0.4); groove(g, x + w / 2 + 6, cab + 36, w / 2 - 24, by - cab - 52, 3, 0.4); }
    // 唱机箱
    var bx = x + w * 0.2, bw = w * 0.6;
    box(g, q, R, bx, cab - 6, bw, 28, 0.94, { col: '#5a2e16', t: TX.mahogH });
    var tt = R.p(bx + bw / 2, cab - 6, 0.97);
    ell(g, tt[0], tt[1], bw * 0.36, 4, '#121014'); ell(g, tt[0], tt[1], bw * 0.12, 1.5, '#8a1a20');
    rect(g, bx + bw - 10, cab, 6, 10, '#8a6a32');
    // 唱臂 + 喇叭颈
    g.beginPath(); g.moveTo(bx + bw * 0.82, cab - 6); g.quadraticCurveTo(bx + bw * 0.86, cab - 30, bx + bw * 0.62, cab - 34); stroke(g, 5, '#9a7a3a');
    // 喇叭（铜）
    var hx = bx + bw * 0.6, hy = cab - 34, mx = x - 2, my = y - 4, rr = w * 0.3;
    g.beginPath(); g.moveTo(hx, hy - 3); g.quadraticCurveTo(hx - 20, hy - 6, mx + rr * 0.6, my + rr * 1.2); g.lineTo(mx - rr * 0.2, my + rr * 0.6);
    g.quadraticCurveTo(hx - 30, hy - 24, hx, hy + 3); g.closePath();
    g.fillStyle = metalGrad(g, mx, my, hx, hy, '#b08a48'); g.fill();
    g.save(); g.translate(mx + rr * 0.2, my + rr * 0.9); g.rotate(-0.75);
    K.ellipse(g, 0, 0, rr * 0.75, rr * 0.38); g.fillStyle = metalGrad(g, -rr, 0, rr, 0, '#c9a25a'); g.fill();
    K.ellipse(g, 0, 0, rr * 0.6, rr * 0.28); g.fillStyle = K.rad(g, 0, 0, 2, rr * 0.6, ['#1a1008', '#5a3a16', '#a8823e']); g.fill();
    if (q.model >= 1) for (var p = 0; p < 6; p++) { var a = p / 6 * PI - PI / 2; seg(g, Math.cos(a) * rr * 0.1, Math.sin(a) * rr * 0.05, Math.cos(a) * rr * 0.6, Math.sin(a) * rr * 0.28, 1, 'rgba(0,0,0,0.3)'); }
    g.restore();
  }
  // 拉下式投影幕
  function pullScreen(g, q, x, y, w, h) {
    if (q.light >= 1) softRect(g, x + 10, y + 16, w - 20, h - 10, 10, 0.3);
    g.fillStyle = metalGrad(g, 0, y, 0, y + 18, '#3a3a42'); K.rr(g, x - 10, y, w + 20, 18, 8); g.fill();
    ell(g, x - 10, y + 9, 5, 9, '#2a2a30'); ell(g, x + w + 10, y + 9, 5, 9, '#2a2a30');
    var sx = x + 8, sw = w - 16, sy = y + 18, sh = h - 36;
    g.beginPath(); g.rect(sx, sy, sw, sh); texFill(g, q, '#cfcac4', TX.linen);
    g.fillStyle = K.lin(g, sx, 0, sx + sw, 0, [lo(0.12), hi(0.06), lo(0.02), lo(0.15)]); g.fillRect(sx, sy, sw, sh);
    g.fillStyle = K.lin(g, 0, sy, 0, sy + sh, [lo(0.2), lo(0), lo(0.08)]); g.fillRect(sx, sy, sw, sh);
    if (q.model >= 1) { rect(g, sx, sy, 6, sh, 'rgba(20,20,24,0.6)'); rect(g, sx + sw - 6, sy, 6, sh, 'rgba(20,20,24,0.6)'); }
    g.fillStyle = metalGrad(g, 0, sy + sh, 0, sy + sh + 10, '#3a3a42'); g.fillRect(sx - 4, sy + sh, sw + 8, 10);
    seg(g, sx + sw / 2, sy + sh + 10, sx + sw / 2, sy + sh + 34, 1.5, '#8a8a8a'); circle(g, sx + sw / 2, sy + sh + 36, 4, '#c9a25a');
  }

  /* ================================================================
   * 餐厅 dining
   * ================================================================ */
  function drawDining(g, q) {
    setKey(-0.45);
    var R = Room(960, 540, 760, 24, 1400);
    ceilingStrip(g, q, R, { col: '#22140c', t: TX.walnutH, step: 280 });
    paperWall(g, q, 0, 24, W, R.base - 24, { c1: '#4c1a22', c2: '#62242c', seed: 57, age: 0.3, line: 'rgba(200,150,90,0.25)' });
    var cb = cornice(g, q, 0, 24, W, '#3a2214');
    var wt = 598;
    wainscot(g, q, [[0, W]], wt, R.base, { t: TX.walnut, col: '#3a2012', pw: 160 });
    // 壁柱分隔
    if (q.model >= 1) { pilaster(g, q, 1210, cb, 40, R.base - cb, '#3a2012', TX.walnut); pilaster(g, q, 1612, cb, 40, R.base - cb, '#3a2012', TX.walnut); }
    // 投影幕
    pullScreen(g, q, 480, 84, 240, 272);
    // 乌鸦油画
    frame(g, q, 800, 120, 320, 216, paintCrow, { fw: 22 });
    // 窗 + 窗帘
    windowFront(g, q, R, 1330, 170, 204, 330, { cols: 2, rows: 4, arch: false, seed: 9, horizon: 0.6 });
    curtain(g, q, 1250, 132, 130, 480, { col: '#5a0e1c', side: 'l', t: TX.velvet, tie: 0.62, gather: 0.55 });
    curtain(g, q, 1484, 132, 130, 480, { col: '#5a0e1c', side: 'r', t: TX.velvet, tie: 0.62, gather: 0.55 });
    valance(g, q, 1250, 132, 364, '#5a0e1c', { t: TX.velvet });
    // 壁炉
    var F = fireplace(g, q, R, 70, 352, 324, 396, { stone: '#5e5660' });
    // 壁炉台摆设
    if (q.model >= 1) {
      var mt = F.mantel;
      candlestick(g, q, 108, mt, 70); candlestick(g, q, 356, mt, 70);
      // 座钟
      box(g, q, R, 200, mt - 58, 64, 58, 0.97, { col: '#2a1408', t: TX.mahog });
      circle(g, 232, mt - 32, 18, '#e8dcc0'); g.beginPath(); g.arc(232, mt - 32, 18, 0, TAU); stroke(g, 2.5, '#b08a48');
      seg(g, 232, mt - 32, 240, mt - 40, 1.6, '#1a1008'); seg(g, 232, mt - 32, 230, mt - 46, 1.4, '#1a1008');
      if (q.model >= 2) { g.fillStyle = K.lin(g, 140, 0, 170, 0, ['#2a3a5a', '#5a7aa0', '#2a3a5a']); K.rr(g, 150, mt - 46, 22, 46, 8); g.fill(); g.fillStyle = K.lin(g, 290, 0, 316, 0, ['#2a3a5a', '#5a7aa0', '#2a3a5a']); K.rr(g, 292, mt - 46, 22, 46, 8); g.fill(); }
    }
    // 炉上方：镜子
    if (q.model >= 1) {
      frame(g, q, 120, 150, 224, 170, function (g2, q2, x, y, w, h) {
        g2.fillStyle = K.lin(g2, x, y, x, y + h, ['#5a4a50', '#6a3a40', '#4a2a2c']); g2.fillRect(x, y, w, h);
        // 镜中倒影：对面墙的窗与烛光
        rect(g2, x + w * 0.62, y + h * 0.12, w * 0.2, h * 0.5, '#6a7488'); rect(g2, x + w * 0.715, y + h * 0.12, 3, h * 0.5, '#3a2a24');
        K.blob(g2, x + w * 0.3, y + h * 0.62, w * 0.22, '#ffb070', 0.35); K.blob(g2, x + w * 0.15, y + h * 0.9, w * 0.3, '#2a1010', 0.6);
        g2.fillStyle = 'rgba(180,190,210,0.12)'; g2.fillRect(x, y, w, h);
        if (q2.light >= 1) { g2.save(); g2.globalCompositeOperation = 'lighter'; fillP(g2, [x + w * 0.1, y + h, x + w * 0.3, y + h, x + w * 0.7, y, x + w * 0.5, y], 'rgba(200,210,230,0.1)'); g2.restore(); }
      }, { fw: 14 });
    }
    // 壁灯
    var sA = [762, 430], sB = [1180, 430], sC = [1760, 400];
    sconce(g, q, sA[0], sA[1], { arms: 2, candle: true, scale: 0.85 });
    sconce(g, q, sB[0], sB[1], { arms: 2, candle: true, scale: 0.85 });
    sconce(g, q, sC[0], sC[1], { arms: 1, scale: 0.9 });
    // 地面 + 地毯
    plankFloor(g, q, R, { pw: 64, seed: 23, far: '#24140a', near: '#4a2e18', t: TX.floorW });
    if (q.light >= 1) K.ao(g, 0, R.base - 2, W, 40, 30, 0.35, 't');
    floorSheen(g, q, R, 1432, 200, '#a8b8e0', 0.1);
    rug(g, q, R, 470, 1450, 1.05, 1.6, { col: '#5a1420', border: '#22080c', gold: '#b08a48', medallion: false });
    // 放映机（窗右侧）
    var pj = projector(g, q, R, 1616, 512, 176, 128, 800);
    // 桌后的椅背
    var ty = 690, tk = 0.74, chairs = [520, 700, 1150, 1330];
    if (q.model >= 1) chairs = [470, 640, 1180, 1350];
    for (var c = 0; c < chairs.length; c++) chairBack(g, q, chairs[c], 548, 84, 120, {});
    // 长桌
    var T = clothTable(g, q, R, 420, ty, 1080, 848, tk, { drop: 66, seed: 43 });
    if (q.model >= 1) placeSettings(g, q, R, 420, ty, 1080, tk, M(q, 0, 4, 6));
    // 桌上的烛台
    var tips = candelabra(g, q, 960, 664, 172, { col: '#b8b0a0' });
    var tipsL = [], tipsR = [];
    if (q.model >= 2) { tipsL = candelabra(g, q, 610, 668, 110, { arms: 3, col: '#b8b0a0' }); tipsR = candelabra(g, q, 1310, 668, 110, { arms: 3, col: '#b8b0a0' }); }
    // 端头椅（侧面）
    // 留声机
    gramophone(g, q, R, 1680, 664, 176, 160, 824);
    void T;

    // ---- 光照 ----
    var fxc = F.fx + F.fw / 2;
    var Lm = [
      { lin: [0, 0, W, 0], stops: [[0, 'rgba(120,60,30,0.25)'], [0.45, 'rgba(60,40,40,0.1)'], [1, 'rgba(60,70,100,0.2)']] },
      { x: fxc, y: 640, r: 760, ry: 520, c: '#ff9a50', i: 0.6, fall: 0.3 },
      { x: fxc, y: 800, r: 420, ry: 160, c: '#ffa060', i: 0.4, q: 1 },
      { x: 960, y: 560, r: 640, ry: 420, c: '#ffcf90', i: 0.55, fall: 0.3 },
      { x: 960, y: 700, r: 520, ry: 140, c: '#ffe0b0', i: 0.35, q: 1 },
      { x: 1432, y: 330, r: 360, ry: 420, c: '#a0b0d8', i: 0.45 },
      { pts: [1330, 520, 1534, 520, 1700, 1080, 1180, 1080], c: '#8898c8', i: 0.25, fx0: 0, fy0: 520, fx1: 0, fy1: 1080, q: 1 },
      { x: sA[0], y: sA[1] - 20, r: 200, ry: 300, c: '#ffb870', i: 0.4, q: 1 },
      { x: sB[0], y: sB[1] - 20, r: 200, ry: 300, c: '#ffb870', i: 0.4, q: 1 },
      { x: 600, y: 220, r: 200, ry: 180, c: '#ffd8b0', i: 0.15, q: 2 },
      { x: 1760, y: 400, r: 300, ry: 420, c: '#ffc080', i: 0.5 }, { x: 1740, y: 780, r: 260, ry: 120, c: '#ffc080', i: 0.25, q: 1 }
    ];
    if (q.model >= 2) { Lm.push({ x: 610, y: 600, r: 220, c: '#ffc080', i: 0.25, q: 1 }); Lm.push({ x: 1310, y: 600, r: 220, c: '#ffc080', i: 0.25, q: 1 }); }
    lightMap(g, q, '#3e3448', Lm);
    // ---- 自发光 ----
    fireGlow(g, q, F, 7);
    shaft(g, q, [1340, 180, 1524, 180, 1760, 1000, 1150, 1000], '#b8c8f0', 0.07, 0, 180, 0, 1000);
    if (q.light >= 2) K.motes(g, K.rng(41), 50, 1200, 300, 420, 600, '#d0dcff', 0.3);
    candleFlames(g, q, tips, 15);
    candleFlames(g, q, tipsL, 12); candleFlames(g, q, tipsR, 12);
    if (q.model >= 1) { K.flame(g, q, 108, F.mantel - 72, 10, { glow: 4 }); K.flame(g, q, 356, F.mantel - 72, 10, { glow: 4 }); }
    sconceGlow(g, q, sA[0], sA[1], { arms: 2, candle: true, scale: 0.85 });
    sconceGlow(g, q, sB[0], sB[1], { arms: 2, candle: true, scale: 0.85 });
    sconceGlow(g, q, sC[0], sC[1], { arms: 1, scale: 0.9 });
    if (q.light >= 2) {
      g.save(); g.globalCompositeOperation = 'lighter';
      K.glow(g, pj.lens[0], pj.lens[1], 18, '#c0d0ff', 0.25);
      g.restore();
    }
    finish(g, q, { vig: 0.55 });
  }
  DM.HDBG.def('dining', {
    draw: function (g, q) { drawDining(g, q); },
    lights: [
      LT(232, 650, 260, '#ff9a48', 0.75, 0.5, 'fire'),
      LT(960, 520, 200, '#ffc070', 0.65, 0.35, 'candle'),
      LT(1432, 330, 220, '#a8b8e0', 0.45, 0, 'window'),
      LT(762, 404, 90, '#ffb060', 0.5, 0.35, 'candle'), LT(1180, 404, 90, '#ffb060', 0.5, 0.35, 'candle'),
      LT(1760, 382, 120, '#ffc070', 0.5, 0.04, 'lamp')
    ],
    key: { x: -0.45, color: '#ffc890', amb: '#342a40', rim: 0.5 },
    outdoor: false
  });


  /*@@ROOMS@@*/
})(typeof window !== 'undefined' ? window : globalThis);
