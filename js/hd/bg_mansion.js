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
  // 釉面方砖纹理（注册到 kit 的生成器表，名字带前缀避免冲突）
  if (K.GEN && !K.GEN.mansionTile) K.GEN.mansionTile = function (N, o) {
    var c = K.canvas(N, N), x = c.getContext('2d'), cols = o.cols || 4, rows = o.rows || 4;
    var gw = Math.max(1, N * (o.grout || 0.018)), tw = N / cols, th = N / rows, r = K.rng(o.seed || 1);
    x.fillStyle = o.gc || '#6a665e'; x.fillRect(0, 0, N, N);
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
      var off = o.stagger && (j % 2) ? tw / 2 : 0, base = K.mix(o.c1, o.c2, r()), tx0 = i * tw + off, ty = j * th;
      for (var d = 0; d < 2; d++) {
        var tx = tx0 - d * N; if (tx + tw < 0 || tx > N) continue;
        var gr = x.createLinearGradient(tx, ty, tx + tw, ty + th);
        gr.addColorStop(0, K.shade(base, 0.12)); gr.addColorStop(0.5, base); gr.addColorStop(1, K.shade(base, -0.12));
        x.fillStyle = gr; x.fillRect(tx + gw / 2, ty + gw / 2, tw - gw, th - gw);
        x.fillStyle = 'rgba(255,255,255,0.25)'; x.fillRect(tx + gw / 2, ty + gw / 2, tw - gw, Math.max(1, N / 160));
        x.fillStyle = 'rgba(0,0,0,0.15)'; x.fillRect(tx + gw / 2, ty + th - gw / 2 - Math.max(1, N / 160), tw - gw, Math.max(1, N / 160));
      }
    }
    return c;
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
    var t = o.t === undefined ? TX.walnut : o.t, col = o.col || '#3e2414', pw = o.pw || 150;
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
    var col = o.col || '#4a2a18', t = o.t === undefined ? TX.walnut : o.t, fw = o.frameW || Math.max(16, w * 0.1);
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
      // 庭院：远处树林（柔和树冠）+ 柏树
      g.fillStyle = K.lin(g, 0, hz - 20, 0, y + h, ['#262c34', '#14181e']); g.fillRect(x, hz - 4, w, y + h - hz + 4);
      var nb = M(q, 8, 16, 26);
      for (var tI = 0; tI < nb; tI++) { var tx = x + rnd() * w, tr = 10 + rnd() * h * 0.1; K.blob(g, tx, hz - rnd() * h * 0.06, tr * 1.7, '#151a20', 0.95); }
      for (var cI = 0; cI < M(q, 0, 1, 2); cI++) { var cx2 = x + w * (0.2 + cI * 0.5 + rnd() * 0.1), ch = h * (0.18 + rnd() * 0.1); K.ellipse(g, cx2, hz - ch * 0.45, 6 + rnd() * 4, ch * 0.55); g.fillStyle = '#141820'; g.fill(); }
    }
    g.restore();
  }
  // 正面窗户（墙洞透视、玻璃、窗格、窗台、外景）。o: { cols, rows, arch, view, frameCol, t, bars, broken, sill }
  function windowFront(g, q, R, x, y, w, h, o) {
    o = o || {};
    var col = o.frameCol || '#3a2214', t = o.t === undefined ? TX.walnut : o.t, fw = o.casing || 18;
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
    var reveal = o.revealCol || '#5a5058', springY = gy + arch * kd;
    if (x + w / 2 < R.vx) fillP(g, [x, y, gx, gy, gx, gy + gh, x, y + h], K.shade(reveal, -0.2));
    else fillP(g, [x + w, y, x + w, y + h, gx + gw, gy + gh, gx + gw, gy], K.shade(reveal, -0.2));
    if (!arch) fillP(g, [x - 10, y - 10, x + w + 10, y - 10, gx + gw, gy, gx, gy], K.shade(reveal, -0.45));
    if (y + h > R.vy) fillP(g, [x, y + h, x + w, y + h, gx + gw, gy + gh, gx, gy + gh], K.shade(reveal, 0.15));
    // 外景
    var vy0 = gy;
    if (o.view) o.view(g, q, gx, vy0, gw, gh);
    else stormView(g, q, gx, vy0, gw, gh, { seed: o.seed, horizon: o.horizon, sea: o.sea, cliff: o.cliff });
    // 玻璃：反光
    if (!o.broken) {
      g.fillStyle = K.lin(g, gx, gy, gx + gw, gy + gh, ['rgba(190,205,230,0.16)', 'rgba(120,140,170,0.04)', 'rgba(190,205,230,0.12)']);
      g.fillRect(gx, vy0, gw, gh);
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
    var rTop = arch ? springY : gy, rH = gy + gh - rTop;
    for (var ci = 1; ci < cols; ci++) bars.push([gx + gw * ci / cols - mw / 2, gy, mw, gh]);
    for (var ri = arch ? 0 : 1; ri < rows; ri++) bars.push([gx, rTop + rH * ri / rows - mw / 2, gw, mw]);
    for (var bI = 0; bI < bars.length; bI++) {
      var bb = bars[bI]; rect(g, bb[0], bb[1], bb[2], bb[3], mc);
      if (bb[2] < bb[3]) { rect(g, bb[0] + (KX < 0 ? 0 : bb[2] - 1.5), bb[1], 1.5, bb[3], hi(0.22)); }
      else { rect(g, bb[0], bb[1], bb[2], 1.5, hi(0.25)); rect(g, bb[0], bb[1] + bb[3] - 1.5, bb[2], 1.5, lo(0.5)); }
    }
    if (arch && q.model >= 1) {
      g.beginPath(); g.arc(gx + gw / 2, springY, gw * 0.22, PI, 0); stroke(g, mw * 0.8, mc);
      for (var aI = 1; aI < cols + 1; aI++) { var ang = PI + PI * aI / (cols + 1); seg(g, gx + gw / 2 + Math.cos(ang) * gw * 0.22, springY + Math.sin(ang) * gw * 0.22, gx + gw / 2 + Math.cos(ang) * gw / 2, springY + Math.sin(ang) * gw / 2, mw * 0.7, mc); }
    }
    // 窗框内缘
    g.beginPath();
    if (arch) { g.moveTo(gx, gy + gh); g.lineTo(gx, springY); g.arc(gx + gw / 2, springY, gw / 2, PI, 0); g.lineTo(gx + gw, gy + gh); g.closePath(); }
    else g.rect(gx, gy, gw, gh);
    g.strokeStyle = mc; g.lineWidth = mw * 1.4; g.stroke();
    if (o.bars) { // 铁栏杆
      var nb = o.bars;
      for (var k = 1; k < nb; k++) { var bx2 = x + w * k / nb; g.fillStyle = cylGrad(g, bx2 - 5, 10, '#3a3a42'); g.fillRect(bx2 - 5, y, 10, h); }
      rect(g, x, y + h * 0.3, w, 8, '#2a2a30'); rect(g, x, y + h * 0.3, w, 2, hi(0.2)); rect(g, x, y + h * 0.72, w, 8, '#2a2a30'); rect(g, x, y + h * 0.72, w, 2, hi(0.2));
    }
    if (o.broken) o.broken(g, gx, gy, gw, gh);
    if (q.light >= 1) { g.fillStyle = K.lin(g, 0, y, 0, y + 40, [lo(0.4), lo(0)]); g.fillRect(x, y, w, 40); }
    g.restore();
    // 窗台
    if (o.sill !== false) {
      var sy2 = y + h + fw * 0.4;
      box(g, q, R, x - fw - 14, sy2, w + fw * 2 + 28, 14, 0.97, { col: K.shade(col, 0.1), t: t ? TX.walnutH : null, edge: true });
      if (q.light >= 1) { g.fillStyle = K.lin(g, 0, sy2 + 14, 0, sy2 + 40, [lo(0.45), lo(0)]); g.fillRect(x - fw - 14, sy2 + 14, w + fw * 2 + 28, 26); }
    }
    return { gx: gx, gy: gy, gw: gw, gh: gh };
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
      var inset = (cx1 - cx0) * 0.14; g.beginPath(); g.moveTo(cx0 + inset, ty - 4); g.quadraticCurveTo((cx0 + cx1) / 2, ty + 8, cx1 - inset, ty - 4); stroke(g, 6, K.shade(o.tieCol || '#b08a48', -0.15)); g.beginPath(); g.moveTo(cx0 + inset, ty - 6); g.quadraticCurveTo((cx0 + cx1) / 2, ty + 5, cx1 - inset, ty - 6); stroke(g, 2, K.shade(o.tieCol || '#b08a48', 0.3)); g.fillStyle = metalGrad(g, cx0, ty - 6, cx0, ty + 6, o.tieCol || '#b08a48');
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
    g.fillStyle = K.rad(g, cx - w * 0.06, y + h * 0.32, 2, w * 0.2, ['#d8b49a', '#a07a62', '#4a3226']); g.fill();
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


  /* ================================================================
   * 共用家具 II：书架、钢琴、沙发、灯、传声管……
   * ================================================================ */
  var BOOK_COLS = ['#5a1a1a', '#2a3a2a', '#3a2a1a', '#1e2a40', '#6a4a2a', '#4a1a2a', '#2a2a30', '#7a5a3a', '#3a1010', '#283828', '#4a3a20', '#20283a'];
  // 一排书。返回实际宽度
  function bookRow(g, q, x, by, w, hMax, rnd, o) {
    o = o || {};
    var bx = x;
    while (bx < x + w - 6) {
      var bw = (o.thin ? 4 : 9) + rnd() * (o.thin ? 3 : 12), bh = hMax * (0.6 + rnd() * 0.36);
      if (q.model >= 1 && rnd() < 0.06) { bx += 8 + rnd() * 26; continue; }
      if (bx + bw > x + w - 2) break;
      var c = o.cols ? rnd.pick(o.cols) : rnd.pick(BOOK_COLS);
      if (q.model >= 2 && rnd() < 0.05 && bx + bh * 0.6 < x + w) {
        // 斜靠的书
        g.save(); g.translate(bx, by); g.rotate(-0.35); g.fillStyle = cylGrad(g, 0, bw, c); g.fillRect(0, -bh, bw, bh); g.restore();
        bx += bh * 0.36 + bw; continue;
      }
      g.fillStyle = cylGrad(g, bx, bw, c); g.fillRect(bx, by - bh, bw, bh);
      if (q.model >= 1 && bw > 6) {
        var gc = rnd() < 0.6 ? 'rgba(220,180,100,0.55)' : 'rgba(0,0,0,0.35)';
        rect(g, bx + 1, by - bh + bh * 0.12, bw - 2, 1.6, gc); rect(g, bx + 1, by - bh * 0.18, bw - 2, 1.6, gc);
        if (q.model >= 2 && bw > 10) rect(g, bx + 2, by - bh * 0.6, bw - 4, bh * 0.12, 'rgba(0,0,0,0.25)');
      }
      rect(g, bx, by - bh, bw, 1.5, hi(0.12));
      bx += bw + 0.6;
    }
    return bx - x;
  }
  // 书架（靠墙）
  function bookshelf(g, q, R, x, y, w, by, o) {
    o = o || {};
    var col = o.col || '#3a2012', t = o.t || TX.walnut, k = R.kWall(by), rows = o.rows || 5, rnd = K.rng(o.seed || 5);
    if (q.light >= 1) K.contact(g, x + w / 2, by, w * 0.62, 12, 0.6);
    box(g, q, R, x, y + 24, w, by - y - 24, k, { col: col, t: t });
    var ix = x + 16, iw = w - 32, iy = y + 40, ih = by - y - 80;
    rect(g, ix, iy, iw, ih, '#140c08');
    var sh = ih / rows;
    for (var r = 0; r < rows; r++) {
      var sy = iy + r * sh, fl = sy + sh - 6;
      if (o.fill) o.fill(g, q, ix, sy, iw, sh - 6, r, rnd);
      else bookRow(g, q, ix + 4, fl, iw - 8, sh - 18, rnd, o);
      if (q.light >= 1) { g.fillStyle = K.lin(g, 0, sy, 0, sy + 30, [lo(0.6), lo(0)]); g.fillRect(ix, sy, iw, 30); }
      g.beginPath(); g.rect(ix, fl, iw, 7); texFill(g, q, K.shade(col, 0.08), TX.walnutH); rect(g, ix, fl, iw, 1.5, hi(0.3)); rect(g, ix, fl + 6, iw, 1.5, lo(0.5));
    }
    if (q.light >= 1) K.ao(g, ix, iy, iw, ih, 22, 0.5, 'lr');
    // 顶冠
    box(g, q, R, x - 8, y, w + 16, 26, 0.985, { col: K.shade(col, 0.1), t: t });
    bands(g, x - 8, y + 26, w + 16, [[3, lo(0.5)], [4, K.shade(col, 0.05)]]);
    rect(g, x, by - 40, w, 40, K.shade(col, -0.15));
  }
  // 立式钢琴（黑漆）
  function uprightPiano(g, q, R, x, y, w, by, o) {
    o = o || {};
    var col = o.col || '#221a1a', k = R.kWall(by);
    var kbY = y + (by - y) * 0.5, kbH = 22, kd = 0.74;
    if (q.light >= 1) K.contact(g, x + w / 2, by + 8, w * 0.62, 14, 0.7);
    // 上部琴身
    box(g, q, R, x, y + 16, w, kbY - y - 16, k, { col: col, frontLo: 0.35 });
    box(g, q, R, x - 6, y, w + 12, 18, k * 0.995, { col: K.shade(col, 0.08), topHi: 0.25 });
    // 前板（雕花/镂空）
    var px = x + 30, pw = w - 60, py = y + 40, ph = kbY - y - 70;
    rect(g, px, py, pw, ph, K.shade(col, 0.04)); groove(g, px, py, pw, ph, 4, 0.5);
    if (q.model >= 1) {
      g.fillStyle = 'rgba(160,120,60,0.25)';
      for (var i = 0; i < 3; i++) { var cx = px + pw * (i + 0.5) / 3; K.ellipse(g, cx, py + ph / 2, pw / 8, ph * 0.32); g.strokeStyle = 'rgba(180,140,70,0.35)'; g.lineWidth = 2; g.stroke(); }
    }
    // 漆面高光
    if (q.light >= 1) { g.save(); g.globalCompositeOperation = 'lighter'; fillP(g, [x + w * 0.1, y + 18, x + w * 0.22, y + 18, x + w * 0.12, kbY, x, kbY], 'rgba(200,210,230,0.06)'); g.restore(); }
    // 琴键台
    var kb = box(g, q, R, x + 10, kbY, w - 20, kbH, kd, { col: col, topFace: false });
    var a = [x + 18, kbY], b2 = [x + w - 18, kbY], c2 = R.p(x + w - 18, kbY, kd + (1 - kd) * 0.2), d2 = R.p(x + 18, kbY, kd + (1 - kd) * 0.2);
    // 键盘顶面
    fillP(g, [a[0], a[1], b2[0], b2[1], c2[0], c2[1], d2[0], d2[1]], '#e8e2d4');
    var nk = M(q, 26, 40, 52);
    for (var j = 1; j < nk; j++) { var u = j / nk; seg(g, lerp(a[0], b2[0], u), a[1], lerp(d2[0], c2[0], u), d2[1], 0.8, 'rgba(60,50,40,0.5)'); }
    if (q.model >= 1) {
      var pat = [1, 1, 0, 1, 1, 1, 0];
      for (var j2 = 0; j2 < nk - 1; j2++) {
        if (!pat[j2 % 7]) continue;
        var u0 = (j2 + 0.7) / nk, u1 = (j2 + 1.3) / nk, mid = 0.45;
        var p0 = lerp(a[0], b2[0], u0), p1 = lerp(a[0], b2[0], u1), q0 = lerp(d2[0], c2[0], u0), q1 = lerp(d2[0], c2[0], u1), ym = lerp(d2[1], a[1], mid);
        fillP(g, [q0, d2[1], q1, d2[1], lerp(q1, p1, mid), ym, lerp(q0, p0, mid), ym], '#161214');
      }
    }
    rect(g, x + 10, kbY + 2, w - 20, kbH - 2, K.shade(col, 0.05)); rect(g, x + 10, kbY, w - 20, 2, hi(0.3));
    void kb;
    // 下部琴身 + 腿
    box(g, q, R, x + 6, kbY + kbH, w - 12, by - kbY - kbH, k, { col: K.shade(col, -0.05), frontLo: 0.4, topFace: false });
    groove(g, x + 40, kbY + kbH + 24, w - 80, by - kbY - kbH - 60, 4, 0.5);
    for (var l = 0; l < 2; l++) { var lx = l ? x + w - 34 : x + 18; cyl(g, lx, kbY + kbH, 16, by - kbY - kbH + 4, '#1a1416'); }
    // 踏板
    for (var p = 0; p < 2; p++) { g.fillStyle = metalGrad(g, x + w / 2 - 22 + p * 30, 0, x + w / 2 - 8 + p * 30, 0, '#b08a48'); K.rr(g, x + w / 2 - 22 + p * 30, by - 14, 14, 8, 3); g.fill(); }
  }
  // 三角钢琴（侧面，琴盖撑开；键盘在右端）
  function grandPiano(g, q, R, x, y, w, by) {
    var col = '#141014', bodyTop = y + (by - y) * 0.42, bodyBot = bodyTop + 66, k = 0.8;
    if (q.light >= 1) K.contact(g, x + w * 0.5, by + 6, w * 0.55, 16, 0.7);
    if (q.light >= 2) { var sh = KX < 0 ? 1 : -1; fillP(g, [x + 20, by + 4, x + w - 40, by + 4, x + w - 40 + sh * 120, by + 30, x + 20 + sh * 120, by + 30], lo(0.22)); }
    // 腿（三条）+ 踏板琴架
    var legs = [[x + 26, 1], [x + w - 86, 1], [x + w * 0.35, 0.82]];
    for (var i = 0; i < legs.length; i++) {
      var lx = legs[i][0], sc = legs[i][1], lb = R.py(by, sc) + (1 - sc) * 30;
      g.fillStyle = cylGrad(g, lx, 22 * sc, col); g.beginPath(); g.moveTo(lx, bodyBot); g.lineTo(lx + 22 * sc, bodyBot); g.lineTo(lx + 18 * sc, lb); g.lineTo(lx + 4 * sc, lb); g.closePath(); g.fill();
      g.fillStyle = metalGrad(g, lx, 0, lx + 22 * sc, 0, '#b08a48'); K.rr(g, lx + 2, lb - 6, 18 * sc, 8, 3); g.fill();
    }
    var lyX = x + w - 180;
    rect(g, lyX, bodyBot, 12, by - bodyBot - 30, '#120e10'); rect(g, lyX + 34, bodyBot, 12, by - bodyBot - 30, '#120e10');
    rect(g, lyX - 8, by - 34, 62, 10, '#1a1416');
    for (var p = 0; p < 3; p++) { g.fillStyle = metalGrad(g, 0, by - 26, 0, by - 18, '#c9a25a'); g.fillRect(lyX - 4 + p * 20, by - 26, 12, 7); }
    // 琴身侧面（曲线尾部在左）
    g.beginPath(); g.moveTo(x + w, bodyTop); g.lineTo(x + w * 0.42, bodyTop);
    g.bezierCurveTo(x + w * 0.2, bodyTop, x + w * 0.12, bodyTop - 6, x, bodyTop + 6);
    g.lineTo(x, bodyBot - 4); g.bezierCurveTo(x + w * 0.12, bodyBot + 4, x + w * 0.2, bodyBot, x + w * 0.42, bodyBot);
    g.lineTo(x + w, bodyBot); g.closePath();
    g.fillStyle = K.lin(g, 0, bodyTop, 0, bodyBot, [K.shade(col, 0.15), col, K.shade(col, -0.4)]); g.fill();
    if (q.light >= 1) { rect(g, x + w * 0.2, bodyTop + 6, w * 0.75, 2, 'rgba(200,210,235,0.25)'); }
    // 琴身顶面（可见：因为在视平线以下）
    var tb = R.p(x + w, bodyTop, k), tf = R.p(x, bodyTop, k);
    g.beginPath(); g.moveTo(x + w, bodyTop); g.lineTo(tb[0], tb[1]); g.bezierCurveTo(tb[0] - w * 0.5, tb[1] - 10, tf[0] + 40, tf[1] - 26, tf[0], tf[1] + 4);
    g.lineTo(x, bodyTop + 6); g.bezierCurveTo(x + w * 0.12, bodyTop - 6, x + w * 0.2, bodyTop, x + w * 0.42, bodyTop); g.closePath();
    g.fillStyle = '#2a1c14'; g.fill();
    if (q.model >= 1) { // 琴弦与金色铁板
      g.save(); g.clip();
      g.fillStyle = 'rgba(176,138,72,0.55)'; g.fillRect(x, tb[1] - 40, w, 60);
      for (var sI = 0; sI < M(q, 0, 20, 40); sI++) { var sx = x + w * 0.1 + sI * (w * 0.8 / M(q, 1, 20, 40)); seg(g, sx, bodyTop, sx + 30, tb[1] - 20, 0.7, 'rgba(230,220,200,0.45)'); }
      g.restore();
    }
    // 琴盖（撑开，铰链在远侧长边）
    var hingeL = R.p(x + 10, bodyTop, k + 0.03), hingeR = R.p(x + w - 40, bodyTop, k + 0.03);
    var lift = 170;
    g.beginPath(); g.moveTo(hingeR[0], hingeR[1]); g.lineTo(hingeL[0], hingeL[1]);
    g.bezierCurveTo(hingeL[0] + 20, hingeL[1] - lift * 0.4, hingeL[0] + w * 0.15, hingeL[1] - lift * 0.9, hingeL[0] + w * 0.38, hingeL[1] - lift);
    g.lineTo(hingeR[0] - 10, hingeR[1] - lift * 0.86); g.closePath();
    g.fillStyle = K.lin(g, 0, hingeL[1] - lift, 0, hingeL[1], ['#2a2428', '#161214', '#0a080a']); g.fill();
    if (q.light >= 1) { g.save(); g.globalCompositeOperation = 'lighter'; seg(g, hingeL[0] + 20, hingeL[1] - lift * 0.5, hingeL[0] + w * 0.38, hingeL[1] - lift + 4, 3, 'rgba(200,210,235,0.18)'); g.restore(); }
    // 支杆
    seg(g, x + w * 0.45, bodyTop + 2, x + w * 0.5, hingeL[1] - lift * 0.82, 3, '#1a1416');
    // 键盘端（右）+ 谱架
    box(g, q, R, x + w - 6, bodyTop + 10, 40, 44, 0.86, { col: col });
    var kx0 = x + w - 4, kx1 = R.px(x + w - 4, 0.86);
    fillP(g, [kx0, bodyTop + 10, x + w + 34, bodyTop + 10, R.px(x + w + 34, 0.9), R.py(bodyTop + 10, 0.9), R.px(kx0, 0.9), R.py(bodyTop + 10, 0.9)], '#e8e2d4');
    void kx1;
    fillP(g, [x + w - 60, bodyTop + 2, x + w - 10, bodyTop + 2, x + w - 30, bodyTop - 60, x + w - 74, bodyTop - 58], '#1a1416');
    if (q.model >= 1) { fillP(g, [x + w - 64, bodyTop - 6, x + w - 18, bodyTop - 6, x + w - 34, bodyTop - 56, x + w - 74, bodyTop - 54], '#e4dccb'); for (var lI = 0; lI < 5; lI++) seg(g, x + w - 66 + lI * 2, bodyTop - 14 - lI * 9, x + w - 24 + lI * 1, bodyTop - 14 - lI * 9, 0.8, 'rgba(40,30,30,0.5)'); }
    rect(g, x + w - 6, bodyTop + 50, 40, 4, hi(0.2));
  }
  // 切斯特菲尔德皮沙发（正面）
  function sofa(g, q, R, x, y, w, by, o) {
    o = o || {};
    var col = o.col || '#5a1a14', t = o.t || null, d = R.dAt(by), k = 0.86;
    var H = by - y, armW = w * 0.09, seatY = y + H * 0.42, frontY = y + H * 0.56, legH = H * 0.08;
    if (q.light >= 1) K.contact(g, x + w / 2, by, w * 0.56, 14 * d / 1.5, 0.75);
    if (q.light >= 2) { var sh = KX < 0 ? 1 : -1; fillP(g, [x + 20, by, x + w - 20, by, x + w + sh * 110, by + 34, x + 20 + sh * 110, by + 34], lo(0.25)); }
    // 腿
    for (var i = 0; i < 4; i++) { var lx = x + 14 + (w - 40) * i / 3; ell(g, lx + 6, by - legH * 0.4, 9, legH * 0.6, '#2a160a'); }
    function leather(path, x0, y0, x1, y1, lit) {
      path(); texFill(g, q, col, t);
      path(); g.fillStyle = K.lin(g, x0, y0, x1, y1, lit || [hi(0.12), lo(0.08), lo(0.45)]); g.fill();
    }
    // 靠背
    leather(function () { K.rr(g, x + armW * 0.5, y, w - armW, seatY - y + 30, 22); }, 0, y, 0, seatY + 30, [hi(0.16), lo(0.05), lo(0.5)]);
    if (q.model >= 1) { // 拉扣（菱形格）
      var cols = M(q, 0, 9, 13), rows = 2;
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols - (r % 2); c++) {
        var bx = x + armW + 26 + (w - armW * 2 - 52) * (c + (r % 2) * 0.5) / (cols - 1), byy = y + 30 + r * (seatY - y - 40) / 2;
        circle(g, bx, byy, 3.2, K.shade(col, -0.6)); circle(g, bx - 1, byy - 1, 1.2, hi(0.3));
        if (q.model >= 2) { seg(g, bx - 12, byy - 10, bx, byy, 1, lo(0.3)); seg(g, bx + 12, byy - 10, bx, byy, 1, lo(0.3)); seg(g, bx, byy, bx, byy + 14, 1, lo(0.25)); }
      }
    }
    // 坐垫顶面
    var st = R.p(x + armW, frontY, k), st2 = R.p(x + w - armW, frontY, k);
    leather(function () { K.poly(g, [x + armW, frontY, x + w - armW, frontY, st2[0], st2[1], st[0], st[1]]); }, 0, st[1], 0, frontY, [lo(0.3), hi(0.1)]);
    var nc = 3;
    for (var cI = 1; cI < nc; cI++) { var ux = x + armW + (w - armW * 2) * cI / nc; seg(g, ux, frontY, R.px(ux, k), st[1], 2, lo(0.45)); }
    // 坐垫正面
    leather(function () { K.rr(g, x + armW - 4, frontY - 6, w - armW * 2 + 8, (by - legH) - frontY + 6, 14); }, 0, frontY, 0, by - legH, [hi(0.18), lo(0.1), lo(0.55)]);
    for (var cJ = 1; cJ < nc; cJ++) { var ux2 = x + armW + (w - armW * 2) * cJ / nc; seg(g, ux2, frontY - 4, ux2, frontY + 36, 2, lo(0.4)); }
    // 扶手（卷边）
    for (var a = 0; a < 2; a++) {
      var ax = a ? x + w - armW : x, ay = y + H * 0.28;
      leather(function () { K.rr(g, ax, ay, armW, by - legH - ay, 16); }, ax, 0, ax + armW, 0, a ? [lo(0.15), hi(0.08), lo(0.55)] : [hi(0.1), lo(0.05), lo(0.5)]);
      K.ellipse(g, ax + armW / 2, ay + 8, armW * 0.62, 18); texFill(g, q, col, t);
      K.ellipse(g, ax + armW / 2, ay + 8, armW * 0.62, 18); g.fillStyle = K.rad(g, ax + armW * 0.4, ay + 2, 2, armW * 0.7, [hi(0.25), lo(0.35)]); g.fill();
      if (q.model >= 1) for (var f = 0; f < 6; f++) { seg(g, ax + armW * 0.5, ay + 10, ax + armW * (0.1 + f * 0.16), ay + 26, 1, lo(0.3)); }
      if (q.model >= 2) { g.fillStyle = '#8a6a30'; for (var n = 0; n < 10; n++) circle(g, ax + 4 + (armW - 8) * n / 9, by - legH - 6, 1.6, '#a8823e'); }
    }
    // 皮面高光
    if (q.light >= 2) {
      g.save(); g.globalCompositeOperation = 'lighter';
      g.fillStyle = 'rgba(255,220,190,0.08)'; K.rr(g, x + armW + 10, frontY - 2, w - armW * 2 - 20, 6, 3); g.fill();
      K.glow(g, x + armW * 0.4, y + H * 0.3, 30, '#ffe0c0', 0.12); K.glow(g, x + w - armW * 0.6, y + H * 0.3, 30, '#ffe0c0', 0.08);
      g.restore();
    }
  }
  // 落地灯 / 台灯（灯罩发光在 lampGlow 中画）
  function floorLamp(g, q, x, by, h, o) {
    o = o || {};
    var shadeC = o.shade || '#d8b88a', top = by - h;
    if (q.light >= 1) K.contact(g, x, by, 34, 7, 0.6);
    ell(g, x, by - 4, 26, 7, '#3a2a14'); g.fillStyle = metalGrad(g, x - 26, 0, x + 26, 0, '#8a6a30'); K.ellipse(g, x, by - 6, 24, 6); g.fill();
    g.fillStyle = metalGrad(g, x - 4, 0, x + 4, 0, '#9a7a3a'); g.fillRect(x - 3.5, top + 40, 7, h - 44);
    if (q.model >= 1) { ell(g, x, top + h * 0.5, 7, 3, '#b08a48'); ell(g, x, top + h * 0.8, 6, 3, '#b08a48'); }
    lampShade(g, q, x, top, o.w || 90, o.h || 66, shadeC);
  }
  function lampShade(g, q, x, top, w, h, c) {
    g.beginPath(); g.moveTo(x - w * 0.32, top); g.lineTo(x + w * 0.32, top); g.lineTo(x + w * 0.5, top + h); g.lineTo(x - w * 0.5, top + h); g.closePath();
    g.fillStyle = K.lin(g, x - w / 2, 0, x + w / 2, 0, [K.shade(c, -0.3), K.shade(c, 0.2), c, K.shade(c, -0.35)]); g.fill();
    if (q.model >= 1) for (var i = 1; i < 7; i++) { var u = i / 7; seg(g, x - w * 0.32 + w * 0.64 * u, top, x - w * 0.5 + w * u, top + h, 0.8, 'rgba(0,0,0,0.12)'); }
    rect(g, x - w * 0.5, top + h - 3, w, 3, K.shade(c, -0.35)); rect(g, x - w * 0.32, top, w * 0.64, 2, K.shade(c, -0.2));
  }
  function lampGlow(g, q, x, top, w, h, a) {
    g.save(); g.globalCompositeOperation = 'lighter';
    g.beginPath(); g.moveTo(x - w * 0.32, top); g.lineTo(x + w * 0.32, top); g.lineTo(x + w * 0.5, top + h); g.lineTo(x - w * 0.5, top + h); g.closePath();
    g.fillStyle = K.lin(g, 0, top, 0, top + h, ['rgba(255,200,120,' + (a * 0.5) + ')', 'rgba(255,215,150,' + a + ')']); g.fill();
    g.fillStyle = K.rad(g, x, top + h, 2, w * 0.5, ['rgba(255,245,210,0.8)', 'rgba(255,200,120,0)']); K.ellipse(g, x, top + h, w * 0.5, 7); g.fill();
    g.restore();
    if (q.light >= 1) K.glow(g, x, top + h * 0.6, w * 1.4, '#ffc070', 0.3);
  }
  function tableLamp(g, q, x, by, h, o) {
    o = o || {};
    var top = by - h;
    ell(g, x, by - 3, 16, 4, '#3a2a14');
    g.fillStyle = K.rad(g, x - 6, by - h * 0.32, 2, 20, [o.base || '#8a5a3a', K.shade(o.base || '#8a5a3a', -0.5)]); K.ellipse(g, x, by - h * 0.3, 15, h * 0.24); g.fill();
    g.fillStyle = metalGrad(g, x - 3, 0, x + 3, 0, '#9a7a3a'); g.fillRect(x - 2.5, top + h * 0.35, 5, h * 0.2);
    lampShade(g, q, x, top, o.w || 64, h * 0.4, o.shade || '#d8b88a');
  }
  // 传声管（铜管 + 喇叭口 + 哨盖）
  function speakingTube(g, q, x, y, w, h) {
    var cx = x + w / 2, my = y + h * 0.62, mr = w * 0.42;
    g.fillStyle = cylGrad(g, cx - 7, 14, '#9a7432'); g.fillRect(cx - 7, -10, 14, my - mr + 10);
    if (q.model >= 1) for (var cI = 0; cI < 3; cI++) { var cy = 60 + cI * ((my - 80) / 3); rect(g, cx - 11, cy, 22, 6, '#6a4a1a'); rect(g, cx - 11, cy, 22, 1.5, hi(0.3)); }
    // 弯头
    g.beginPath(); g.moveTo(cx - 7, my - mr - 6); g.quadraticCurveTo(cx - 8, my - mr + 6, cx - mr * 0.8, my - mr * 0.4); g.lineTo(cx + mr * 0.8, my - mr * 0.4); g.quadraticCurveTo(cx + 8, my - mr + 6, cx + 7, my - mr - 6); g.closePath();
    g.fillStyle = metalGrad(g, cx - mr, 0, cx + mr, 0, '#a8823e'); g.fill();
    // 喇叭口（朝前）
    g.fillStyle = metalGrad(g, cx - mr, 0, cx + mr, 0, '#b8924a'); circle(g, cx, my, mr, g.fillStyle);
    g.beginPath(); g.arc(cx, my, mr, 0, TAU); stroke(g, 2.5, '#e6c88a');
    g.fillStyle = K.rad(g, cx, my, 1, mr * 0.75, ['#050302', '#1a1008', '#5a3a16']); circle(g, cx, my, mr * 0.72, g.fillStyle);
    // 哨盖（铰链挂在侧面）
    g.save(); g.translate(cx + mr * 0.9, my + mr * 0.2); g.rotate(0.5);
    g.fillStyle = metalGrad(g, -6, 0, 6, 0, '#a8823e'); K.ellipse(g, 0, mr * 0.55, 6, mr * 0.6); g.fill();
    g.restore();
    if (q.light >= 2) { g.save(); g.globalCompositeOperation = 'lighter'; g.beginPath(); g.arc(cx, my, mr - 2, PI * 1.1, PI * 1.6); stroke(g, 2, 'rgba(255,240,200,0.5)'); g.restore(); }
    if (q.light >= 1) K.contact(g, cx + (KX < 0 ? 6 : -6), my + mr + 6, mr * 1.1, 6, 0.35);
  }
  // 墙挂内线电话（米色机身 + 竖挂听筒 + 卷线）
  function wallPhone(g, q, x, y, w, h) {
    if (q.light >= 1) softRect(g, x + (KX < 0 ? 6 : -6), y + 6, w, h * 0.8, 8, 0.45);
    var bh = h * 0.78;
    g.fillStyle = K.lin(g, x, y, x + w, y + bh, ['#ece2cc', '#d0c4a8', '#a89a7e']); K.rr(g, x, y, w, bh, 9); g.fill();
    g.strokeStyle = lo(0.3); g.lineWidth = 1.4; g.stroke();
    rect(g, x + 3, y + 3, w - 6, 2, hi(0.4));
    // 扬声器格栅
    for (var i = 0; i < 5; i++) { K.rr(g, x + w * 0.56, y + 12 + i * 7, w * 0.34, 3, 1.5); g.fillStyle = 'rgba(60,50,40,0.55)'; g.fill(); }
    // 按键
    for (var b2 = 0; b2 < 4; b2++) {
      var by = y + bh * 0.52 + b2 * 9;
      g.fillStyle = K.lin(g, 0, by, 0, by + 6, ['#f8f2e4', '#b8ac92']); K.rr(g, x + w * 0.58, by, w * 0.3, 6, 2); g.fill();
      rect(g, x + w * 0.62, by + 2.4, w * 0.12, 1.2, 'rgba(90,40,30,0.6)');
    }
    // 听筒（竖挂在左侧）
    var hx = x + w * 0.08, hw = w * 0.4, hy0 = y + 6, hy1 = y + bh - 6;
    g.beginPath(); g.moveTo(hx + hw * 0.25, hy0); g.quadraticCurveTo(hx - 2, hy0, hx, hy0 + 18); g.lineTo(hx + hw * 0.25, hy0 + 26);
    g.lineTo(hx + hw * 0.25, hy1 - 26); g.lineTo(hx, hy1 - 18); g.quadraticCurveTo(hx - 2, hy1, hx + hw * 0.25, hy1);
    g.lineTo(hx + hw, hy1); g.quadraticCurveTo(hx + hw + 4, hy1 - 12, hx + hw * 0.75, hy1 - 22); g.lineTo(hx + hw * 0.75, hy0 + 22); g.quadraticCurveTo(hx + hw + 4, hy0 + 12, hx + hw, hy0); g.closePath();
    g.fillStyle = K.lin(g, hx, 0, hx + hw, 0, ['#b8aa8e', '#f4ead6', '#d8ccb2', '#9a8c70']); g.fill();
    g.strokeStyle = lo(0.35); g.lineWidth = 1.2; g.stroke();
    // 卷线
    g.beginPath(); g.moveTo(hx + hw * 0.4, hy1);
    for (var c = 0; c < 10; c++) { var cy = hy1 + 6 + c * 6; g.bezierCurveTo(hx - 4, cy - 2, hx - 4, cy + 4, hx + hw * 0.4, cy + 3); }
    stroke(g, 1.6, '#c8b898');
    if (q.light >= 2) { g.save(); g.globalCompositeOperation = 'lighter'; seg(g, hx + hw * 0.55, hy0 + 26, hx + hw * 0.55, hy1 - 26, 1.5, 'rgba(255,250,235,0.35)'); g.restore(); }
  }
  // 牌桌（绿呢圆桌 + 椅子 + 扑克）
  function cardTable(g, q, R, x, y, w, by) {
    var cx = x + w / 2, ty = y + 36, rx = w * 0.36, ry = rx * 0.22;
    if (q.light >= 1) K.contact(g, cx, by, rx * 1.1, 16, 0.6);
    // 后侧椅子
    chairBack(g, q, cx - 50, y - 30, 100, 90, { up: '#2a4a32' });
    // 桌脚（中柱 + 三爪）
    g.fillStyle = cylGrad(g, cx - 14, 28, '#3a1c10'); g.fillRect(cx - 14, ty + 30, 28, by - ty - 50);
    for (var f = -1; f <= 1; f++) { g.beginPath(); g.moveTo(cx, by - 30); g.quadraticCurveTo(cx + f * 40, by - 26, cx + f * 70, by - 2); stroke(g, 10, '#2e160c'); }
    // 桌面
    K.ellipse(g, cx, ty + 10, rx + 6, ry + 6); g.fillStyle = '#2e160c'; g.fill();
    g.fillStyle = K.lin(g, 0, ty, 0, ty + 34, ['#4a2414', '#2a1208']); g.fillRect(cx - rx - 6, ty, (rx + 6) * 2, 24);
    K.ellipse(g, cx, ty + 24, rx + 6, ry + 6); g.fillStyle = '#2a1208'; g.fill();
    K.ellipse(g, cx, ty, rx + 6, ry + 6); g.fillStyle = '#4a2414'; g.fill();
    K.ellipse(g, cx, ty, rx - 4, ry - 2); texFill(g, q, '#1e4a2a', ['fabric', { c1: '#14341c', c2: '#24583a', threads: 70, seed: 55 }, 60]);
    K.ellipse(g, cx, ty, rx - 4, ry - 2); g.fillStyle = K.rad(g, cx, ty - 4, 4, rx, [hi(0.12), lo(0.3)]); g.fill();
    // 扑克牌与筹码
    if (q.model >= 1) {
      var rnd = K.rng(19);
      for (var i = 0; i < M(q, 0, 6, 11); i++) {
        var px = cx + (rnd() - 0.5) * rx * 1.2, py = ty + (rnd() - 0.5) * ry * 1.1, a = rnd() * 0.8 - 0.4;
        g.save(); g.translate(px, py); g.scale(1, 0.32); g.rotate(a);
        rect(g, -12, -17, 24, 34, '#f4f0e6'); g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 1; g.strokeRect(-12, -17, 24, 34);
        rect(g, -6, -9, 4, 6, rnd() < 0.5 ? '#b01828' : '#141414');
        g.restore();
      }
      for (var c = 0; c < M(q, 0, 3, 6); c++) { var chx = cx + rx * 0.5 - c * 10, chy = ty + ry * 0.3; for (var st = 0; st < 4; st++) { ell(g, chx, chy - st * 3, 7, 2.4, ['#a01a22', '#e8e0d0', '#1a3a6a'][c % 3]); } }
    }
    // 前方椅子（侧身）
    var chx2 = x + w - 70;
    g.fillStyle = '#3a1c10'; g.fillRect(chx2, by - 80, 8, 80); g.fillRect(chx2 + 52, by - 80, 8, 80);
    box(g, q, R, chx2 - 4, by - 96, 68, 18, 0.9, { col: '#2a4a32', t: TX.velvetG });
    g.fillStyle = '#3a1c10'; g.fillRect(chx2 + 52, by - 210, 10, 120);
    g.beginPath(); g.moveTo(chx2 + 50, by - 205); g.quadraticCurveTo(chx2 + 70, by - 220, chx2 + 64, by - 100); stroke(g, 6, '#4a2414');
  }

  /* ================================================================
   * 交谊厅 lounge
   * ================================================================ */
  function drawLounge(g, q) {
    setKey(0.1);
    var R = Room(960, 548, 768, 30, 1400);
    ceilingStrip(g, q, R, { col: '#20160e', t: TX.walnutH, step: 280 });
    paperWall(g, q, 0, 30, W, R.base - 30, { c1: '#1c3024', c2: '#284232', seed: 59, age: 0.3 });
    var cb = cornice(g, q, 0, 30, W, '#3a2414');
    wainscot(g, q, [[0, W]], 612, R.base, { t: TX.walnut, col: '#3a2214', pw: 170 });
    if (q.model >= 1) { pilaster(g, q, 700, cb, 40, R.base - cb, '#3a2214', TX.walnut); pilaster(g, q, 1300, cb, 40, R.base - cb, '#3a2214', TX.walnut); }
    // 窗
    windowFront(g, q, R, 814, 168, 284, 300, { cols: 3, rows: 3, seed: 13, horizon: 0.66 });
    curtain(g, q, 752, 128, 120, 470, { col: '#1e3a28', side: 'l', t: TX.velvetG, tie: 0.6, gather: 0.55 });
    curtain(g, q, 1040, 128, 120, 470, { col: '#1e3a28', side: 'r', t: TX.velvetG, tie: 0.6, gather: 0.55 });
    valance(g, q, 752, 128, 408, '#1e3a28', { t: TX.velvetG });
    // 画（钢琴上方）
    if (q.model >= 1) {
      frame(g, q, 150, 170, 260, 170, paintSeascape, { fw: 16 });
      frame(g, q, 1360, 200, 120, 150, function (g2, q2, x, y, w, h) { paintPortrait(g2, q2, x, y, w, h, { seed: 9 }); }, { fw: 12 });
    }
    // 内线电话
    wallPhone(g, q, 548, 356, 72, 112);
    // 壁灯
    var sA = [1360, 430];
    sconce(g, q, 640, 300, { scale: 0.85 });
    // 书架
    bookshelf(g, q, R, 1524, 186, 360, R.base + 10, { rows: 5, seed: 31 });
    // 地面
    plankFloor(g, q, R, { pw: 64, seed: 27, far: '#2a1a0e', near: '#5a3c22', t: TX.floorO });
    if (q.light >= 1) K.ao(g, 0, R.base - 2, W, 40, 30, 0.35, 't');
    floorSheen(g, q, R, 956, 240, '#a8b8e0', 0.12);
    rug(g, q, R, 560, 1360, 1.05, 1.95, { col: '#3a1c18', border: '#14100c', gold: '#a8823e' });
    // 钢琴
    uprightPiano(g, q, R, 70, 440, 420, R.base + 8);
    tableLamp(g, q, 420, 446, 86, { shade: '#e0c090', base: '#3a5a4a' });
    if (q.model >= 1) { // 琴上乐谱与花瓶
      rect(g, 150, 426, 70, 20, '#e8e0cc'); rect(g, 154, 424, 64, 3, '#d8cfb8');
      g.fillStyle = K.lin(g, 270, 0, 300, 0, ['#2a3a5a', '#6a8ab0', '#2a3a5a']); K.rr(g, 272, 400, 26, 46, 10); g.fill();
      for (var fl = 0; fl < 4; fl++) circle(g, 278 + fl * 6, 394 - (fl % 2) * 10, 7, ['#a01a2a', '#e8d8c0', '#c03040', '#f0e0d0'][fl]);
    }
    // 牌桌
    cardTable(g, q, R, 1360, 676, 384, 880);
    // 落地灯（沙发右侧）
    floorLamp(g, q, 1350, 846, 380, { shade: '#d8b88a' });
    // 沙发
    sofa(g, q, R, 604, 646, 712, 880, { col: '#5a1e16' });
    // ---- 光照 ----
    var Lm = [
      { lin: [0, 0, W, 0], stops: [[0, 'rgba(90,60,40,0.18)'], [0.5, 'rgba(70,80,100,0.15)'], [1, 'rgba(80,60,40,0.2)']] },
      { x: 956, y: 330, r: 560, ry: 520, c: '#a8b8e0', i: 0.55, fall: 0.35 },
      { pts: [814, 470, 1098, 470, 1300, 1080, 640, 1080], c: '#90a0d0', i: 0.3, fx0: 0, fy0: 470, fx1: 0, fy1: 1080, q: 1 },
      { x: 1350, y: 520, r: 480, ry: 520, c: '#ffc080', i: 0.55, fall: 0.3 },
      { x: 1350, y: 860, r: 360, ry: 140, c: '#ffc080', i: 0.35, q: 1 },
      { x: 420, y: 400, r: 380, ry: 340, c: '#ffc080', i: 0.5 },
      { x: 640, y: 290, r: 200, ry: 280, c: '#ffc080', i: 0.4, q: 1 },
      { x: 1700, y: 400, r: 300, ry: 400, c: '#ffb878', i: 0.2, q: 2 }
    ];
    lightMap(g, q, '#3c3a48', Lm);
    shaft(g, q, [824, 180, 1088, 180, 1320, 1000, 640, 1000], '#b8c8f0', 0.07, 0, 180, 0, 1000);
    if (q.light >= 2) K.motes(g, K.rng(43), 50, 760, 260, 420, 640, '#d0dcff', 0.3);
    lampGlow(g, q, 1350, 466, 90, 66, 0.6);
    lampGlow(g, q, 420, 360, 64, 34, 0.55);
    sconceGlow(g, q, 640, 300, { scale: 0.85 });
    finish(g, q, { vig: 0.5 });
    void sA;
  }
  DM.HDBG.def('lounge', {
    draw: function (g, q) { drawLounge(g, q); },
    lights: [
      LT(956, 320, 240, '#a8b8e0', 0.5, 0, 'window'),
      LT(1350, 500, 150, '#ffc070', 0.6, 0.03, 'lamp'),
      LT(420, 380, 110, '#ffc070', 0.55, 0.03, 'lamp'),
      LT(640, 280, 90, '#ffc070', 0.45, 0.03, 'lamp')
    ],
    key: { x: 0.1, color: '#e8d8c0', amb: '#2e3440', rim: 0.45 },
    outdoor: false
  });

  /* ================================================================
   * 厨房 kitchen
   * ================================================================ */
  var TILE_W = ['mansionTile', { c1: '#c8c4bc', c2: '#dedad2', gc: '#8a867e', rows: 4, cols: 4, seed: 81, stagger: 0 }, 120];
  // 刀架：8 把刀（全套）
  function knifeRack(g, q, x, y, w, h) {
    if (q.light >= 1) softRect(g, x + (KX < 0 ? 5 : -5), y + 6, w, 30, 6, 0.4);
    g.beginPath(); g.rect(x, y, w, 28); texFill(g, q, '#4a2c16', TX.walnutH);
    bevel(g, x, y, w, 28, 4, 0.2, 0.4);
    var kinds = [[0.58, 34, 'cleaver'], [0.9, 16, 'chef'], [0.95, 13, 'bread'], [0.8, 14, 'chef'], [0.7, 12, 'slicer'], [0.55, 10, 'utility'], [0.45, 9, 'paring'], [0.38, 8, 'paring']];
    var step = (w - 20) / kinds.length;
    for (var i = 0; i < kinds.length; i++) {
      var kx = x + 12 + step * i + step / 2, bl = (h - 40) * kinds[i][0], bw = kinds[i][1], hy = y + 4, hl = 30;
      // 刀柄（在架上方）
      g.fillStyle = cylGrad(g, kx - 5, 10, '#2a1a10'); K.rr(g, kx - 5, hy - hl + 6, 10, hl, 4); g.fill();
      if (q.model >= 1) { circle(g, kx, hy - hl + 14, 1.6, '#c8c0b0'); circle(g, kx, hy - 4, 1.6, '#c8c0b0'); }
      // 刀刃（在架下方）
      var by0 = y + 26;
      g.beginPath();
      if (kinds[i][2] === 'cleaver') { g.rect(kx - bw / 2, by0, bw, bl); }
      else { g.moveTo(kx - 3, by0); g.lineTo(kx - 3 + 0, by0 + bl * 0.9); g.quadraticCurveTo(kx + bw * 0.4, by0 + bl, kx + bw - 3, by0 + bl * 0.4); g.lineTo(kx + bw - 4, by0); g.closePath(); }
      g.fillStyle = K.lin(g, kx - bw / 2, 0, kx + bw, 0, ['#5a5e66', '#c8ccd4', '#8a8e98', '#e8ecf4', '#6a6e78']); g.fill();
      g.strokeStyle = 'rgba(20,20,30,0.5)'; g.lineWidth = 1; g.stroke();
      if (kinds[i][2] === 'bread' && q.model >= 1) for (var s = 0; s < 10; s++) seg(g, kx + bw - 4, by0 + 6 + s * bl * 0.08, kx + bw - 7, by0 + 9 + s * bl * 0.08, 0.8, 'rgba(40,40,50,0.6)');
      if (kinds[i][2] === 'cleaver') circle(g, kx, by0 + 10, 3, '#2a2a30');
      if (q.light >= 2) { g.save(); g.globalCompositeOperation = 'lighter'; seg(g, kx + 1, by0 + 4, kx + 1, by0 + bl * 0.8, 1.2, 'rgba(230,240,255,0.35)'); g.restore(); }
    }
  }
  // 铸铁炉灶 + 铜罩
  function range(g, q, R, x, y, w, by) {
    var k = R.kWall(by), topY = y + 150, iron = '#22201e';
    if (q.light >= 1) K.contact(g, x + w / 2, by + 6, w * 0.6, 12, 0.7);
    // 后挡板（瓷砖已在墙上），上方的铜罩
    var hy = y - 140;
    g.beginPath(); g.moveTo(x - 10, hy + 120); g.lineTo(x + w + 10, hy + 120); g.lineTo(x + w - 50, hy); g.lineTo(x + 50, hy); g.closePath();
    g.fillStyle = metalGrad(g, x - 10, 0, x + w + 10, 0, '#9a5a32'); g.fill();
    g.fillStyle = K.lin(g, 0, hy, 0, hy + 120, [lo(0.3), hi(0.05), lo(0.15)]); g.fill();
    if (q.model >= 1) for (var rv = 0; rv < 12; rv++) circle(g, x + 4 + rv * (w - 8) / 11, hy + 114, 2, '#e8b080');
    g.fillStyle = metalGrad(g, x - 14, 0, x + w + 14, 0, '#7a4a2a'); g.fillRect(x - 14, hy + 118, w + 28, 12);
    g.fillStyle = metalGrad(g, x + 70, 0, x + w - 70, 0, '#8a5232'); g.fillRect(x + 70, hy - 160, w - 140, 162);
    // 挂锅
    if (q.model >= 1) {
      var pans = M(q, 0, 3, 5);
      for (var p = 0; p < pans; p++) {
        var px = x + 40 + p * (w - 80) / Math.max(1, pans - 1), py = hy + 150, pr = 24 + (p % 2) * 8;
        seg(g, px, hy + 130, px, py - pr, 2, '#3a3a40');
        g.fillStyle = metalGrad(g, px - pr, 0, px + pr, 0, p % 2 ? '#a86a3a' : '#3a3a40'); circle(g, px, py, pr, g.fillStyle);
        circle(g, px, py, pr * 0.72, K.shade(p % 2 ? '#a86a3a' : '#3a3a40', -0.3));
      }
    }
    // 后栏 + 保温架
    rect(g, x + 10, topY - 76, w - 20, 10, '#2a2826'); rect(g, x + 10, topY - 76, w - 20, 2, hi(0.25));
    for (var b = 0; b < 6; b++) rect(g, x + 20 + b * (w - 40) / 5, topY - 66, 5, 66, '#1a1816');
    // 炉身
    var body = box(g, q, R, x, topY, w, by - topY, k * 0.98, { col: iron, t: TX.iron, frontLo: 0.4, topFace: false });
    void body;
    var tp = R.p(x, topY, 0.93), tp2 = R.p(x + w, topY, 0.93);
    fillP(g, [x - 6, topY, x + w + 6, topY, tp2[0] + 6, tp2[1], tp[0] - 6, tp[1]], '#141210');
    // 灶眼
    for (var e = 0; e < 3; e++) {
      var ex = x + w * (0.2 + e * 0.3), ey = (topY + tp[1]) / 2;
      ell(g, ex, ey, 38, 6, '#2e2c2a'); ell(g, ex, ey, 30, 4.5, '#0e0c0a'); ell(g, ex, ey - 1, 18, 2.4, '#3a3634');
    }
    // 锅具（灶上）
    g.fillStyle = metalGrad(g, x + w * 0.2 - 40, 0, x + w * 0.2 + 40, 0, '#a86a3a'); g.fillRect(x + w * 0.2 - 38, topY - 52, 76, 52);
    ell(g, x + w * 0.2, topY - 52, 38, 7, '#7a4a2a'); ell(g, x + w * 0.2, topY - 54, 30, 5, '#c88a5a');
    g.fillStyle = metalGrad(g, x + w * 0.8 - 30, 0, x + w * 0.8 + 30, 0, '#4a4a52'); K.rr(g, x + w * 0.8 - 30, topY - 40, 60, 40, 8); g.fill();
    seg(g, x + w * 0.8 + 30, topY - 30, x + w * 0.8 + 56, topY - 36, 4, '#2a2a30');
    // 炉门（铜把手）
    var dy = topY + 30, dh = by - topY - 70;
    for (var d = 0; d < 3; d++) {
      var dx = x + 16 + d * (w - 32) / 3, dw = (w - 32) / 3 - 12;
      rect(g, dx, dy, dw, dh, '#1a1816'); groove(g, dx, dy, dw, dh, 3, 0.55);
      g.fillStyle = metalGrad(g, 0, dy + 10, 0, dy + 18, '#c9a25a'); g.fillRect(dx + 10, dy + 10, dw - 20, 7);
      if (d === 1) { // 火门：看得到火光
        for (var gI = 0; gI < 5; gI++) rect(g, dx + 14 + gI * (dw - 28) / 4, dy + dh * 0.5, 5, dh * 0.3, '#3a1206');
      }
    }
    rect(g, x, by - 20, w, 20, '#141210');
    g.fillStyle = metalGrad(g, 0, topY + 10, 0, topY + 18, '#c9a25a'); g.fillRect(x - 8, topY + 12, w + 16, 6);
  }
  // 水槽（瓷）+ 台柜 + 龙头
  function sink(g, q, R, x, y, w, by) {
    var top = y + 140, k = R.kWall(by);
    // 台柜
    box(g, q, R, x - 20, top + 20, w + 40, by - top - 20, k, { col: '#4a3a2a', t: TX.oak, topFace: false });
    for (var d = 0; d < 2; d++) { var dx = x - 6 + d * (w + 12) / 2; groove(g, dx, top + 76, (w + 12) / 2 - 14, by - top - 110, 3, 0.45); circle(g, dx + ((w + 12) / 2 - 14) * (d ? 0.15 : 0.85), top + 120, 4, '#b08a48'); }
    // 台面
    box(g, q, R, x - 26, top, w + 52, 22, k * 0.985, { col: '#6a5a48', t: TX.oakH, topHi: 0.2 });
    // 水槽前挡（白瓷）
    var sx = x + 16, sw = w - 32;
    g.fillStyle = K.lin(g, 0, top - 6, 0, top + 60, ['#f2efe8', '#d6d2ca', '#b8b4ac']); K.rr(g, sx, top - 8, sw, 64, 6); g.fill();
    g.strokeStyle = lo(0.25); g.lineWidth = 1.5; g.stroke();
    var bt = R.p(sx + 8, top - 8, 0.94), bt2 = R.p(sx + sw - 8, top - 8, 0.94);
    fillP(g, [sx + 6, top - 8, sx + sw - 6, top - 8, bt2[0], bt2[1], bt[0], bt[1]], '#8a8680');
    // 龙头（铜，鹅颈）
    var fx = x + w / 2, fy = top - 30;
    g.beginPath(); g.moveTo(fx - 4, fy + 22); g.lineTo(fx - 4, fy - 50); g.quadraticCurveTo(fx - 4, fy - 74, fx + 22, fy - 74); g.quadraticCurveTo(fx + 44, fy - 74, fx + 44, fy - 50); g.lineTo(fx + 44, fy - 36);
    stroke(g, 8, '#a8823e'); g.beginPath(); g.moveTo(fx - 6, fy + 22); g.lineTo(fx - 6, fy - 50); g.quadraticCurveTo(fx - 6, fy - 72, fx + 20, fy - 72); stroke(g, 2, 'rgba(255,240,200,0.5)');
    for (var t = -1; t <= 1; t += 2) { g.fillStyle = metalGrad(g, fx + t * 34 - 8, 0, fx + t * 34 + 8, 0, '#b08a48'); g.fillRect(fx + t * 34 - 4, fy + 4, 8, 18); circle(g, fx + t * 34, fy + 2, 8, '#c9a25a'); }
  }
  // 厚木门（铁条 + 环把手），通往地窖
  function plankDoor(g, q, R, x, y, w, by, o) {
    o = o || {};
    door(g, q, R, x, y, w, by - y, {
      t: TX.oak, col: '#4a3420', frameW: 22, frameCol: '#5a5258',
      open: function (g2, lx, ly, lw, lh) {
        g2.beginPath(); g2.rect(lx, ly, lw, lh); texFill(g2, q, '#5a3c22', TX.oak);
        var n = 5; for (var i = 1; i < n; i++) { rect(g2, lx + lw * i / n - 1.5, ly, 3, lh, lo(0.55)); rect(g2, lx + lw * i / n + 1.5, ly, 1.5, lh, hi(0.08)); }
        g2.fillStyle = K.lin(g2, 0, ly, 0, ly + lh, [hi(0.04), lo(0.25)]); g2.fillRect(lx, ly, lw, lh);
        var straps = [0.16, 0.5, 0.84];
        for (var s2 = 0; s2 < 3; s2++) {
          var sy = ly + lh * straps[s2];
          g2.fillStyle = metalGrad(g2, 0, sy - 9, 0, sy + 9, '#3a3a40'); g2.fillRect(lx + 4, sy - 9, lw * 0.82, 18);
          for (var rv = 0; rv < 5; rv++) circle(g2, lx + 18 + rv * lw * 0.17, sy, 2.6, '#6a6a72');
        }
        var rx = lx + lw * 0.84, ry = ly + lh * 0.55;
        circle(g2, rx, ry, 10, '#2a2a30'); g2.beginPath(); g2.arc(rx, ry + 18, 16, 0, TAU); stroke(g2, 4.5, '#4a4a52');
        g2.beginPath(); g2.arc(rx, ry + 18, 16, PI * 1.1, PI * 1.6); stroke(g2, 1.5, 'rgba(255,255,255,0.3)');
        if (q.light >= 1) K.ao(g2, lx, ly, lw, lh, 24, 0.4);
      }
    });
  }
  // 食品储藏室（开放式凹室 + 搁架）
  function pantry(g, q, R, x, y, w, by) {
    var kd = 0.86;
    // 门框
    g.beginPath(); g.rect(x - 18, y - 18, w + 36, by - y + 18); texFill(g, q, '#5a4630', TX.pine); bevel(g, x - 18, y - 18, w + 36, by - y + 18, 8, 0.2, 0.4);
    // 凹室内部
    var a = R.p(x, y, kd), b2 = R.p(x + w, by, kd);
    rect(g, x, y, w, by - y, '#1a120c');
    g.beginPath(); g.rect(a[0], a[1], b2[0] - a[0], b2[1] - a[1]); texFill(g, q, '#6a6050', TX.plasterW); rect(g, a[0], a[1], b2[0] - a[0], b2[1] - a[1], lo(0.45));
    fillP(g, [x, y, a[0], a[1], a[0], b2[1], x, by], '#2a2018');
    fillP(g, [x + w, y, x + w, by, b2[0], b2[1], b2[0], a[1]], '#3a2c20');
    fillP(g, [x, y, x + w, y, b2[0], a[1], a[0], a[1]], '#140e0a');
    fillP(g, [x, by, x + w, by, b2[0], b2[1], a[0], b2[1]], '#3a2e24');
    // 搁架
    var rnd = K.rng(61), rows = 4;
    for (var r = 0; r < rows; r++) {
      var sy = y + 70 + r * ((by - y - 150) / rows), s0 = R.p(x, sy, kd);
      fillP(g, [x, sy, x + w, sy, b2[0], s0[1], a[0], s0[1]], '#6a5038'); rect(g, x, sy, w, 8, '#5a4028'); rect(g, x, sy, w, 2, hi(0.25));
      if (q.light >= 1) { g.fillStyle = K.lin(g, 0, sy + 8, 0, sy + 30, [lo(0.4), lo(0)]); g.fillRect(x, sy + 8, w, 22); }
      // 瓶罐
      var jx = a[0] + 6;
      while (jx < b2[0] - 20) {
        var jw = 18 + rnd() * 18, jh = 24 + rnd() * 40, jc = rnd.pick(['#7a3a1a', '#a8862a', '#4a6a2a', '#8a2a2a', '#d8c8a0', '#3a4a6a', '#6a4a2a']);
        var jy = s0[1] - 1;
        if (rnd() < 0.5) { // 玻璃罐
          g.fillStyle = cylGrad(g, jx, jw, jc); g.fillRect(jx, jy - jh, jw, jh); rect(g, jx - 1, jy - jh - 6, jw + 2, 7, '#c8b890');
          rect(g, jx + 3, jy - jh * 0.6, jw - 6, jh * 0.3, 'rgba(240,230,210,0.6)');
        } else { // 瓶子
          g.fillStyle = cylGrad(g, jx, jw * 0.7, jc); K.rr(g, jx, jy - jh, jw * 0.7, jh, 4); g.fill(); rect(g, jx + jw * 0.25, jy - jh - 14, jw * 0.2, 16, K.shade(jc, -0.3));
        }
        jx += jw + 4 + rnd() * 6;
      }
    }
    // 地上的米袋
    if (q.model >= 1) for (var bI = 0; bI < 2; bI++) {
      var bx = x + 20 + bI * 110, bh = 90 - bI * 16;
      g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx - 8, by - bh * 0.6, bx + 10, by - bh); g.lineTo(bx + 80, by - bh + 6); g.quadraticCurveTo(bx + 96, by - bh * 0.5, bx + 88, by); g.closePath();
      texFill(g, q, '#a89870', ['fabric', { c1: '#7a6a48', c2: '#b8a880', threads: 30, seed: 63 }, 50]); g.fillStyle = K.lin(g, bx, 0, bx + 90, 0, [hi(0.1), lo(0.35)]); g.fill();
      K.text(g, '米', bx + 44, by - bh * 0.45, 22, 'rgba(120,30,20,0.7)', { weight: 'bold' });
    }
    // 挂着的蒜
    if (q.model >= 2) for (var gI = 0; gI < 5; gI++) { var gx = x + w - 40, gy = y + 20 + gI * 18; circle(g, gx + (gI % 2) * 8, gy, 8, '#e8e0cc'); }
    if (q.light >= 1) K.ao(g, x, y, w, by - y, 40, 0.5);
  }

  function drawKitchen(g, q) {
    setKey(0.05);
    var R = Room(960, 548, 768, 60, 1300);
    ceilingStrip(g, q, R, { col: '#2a1e14', t: TX.oakH, step: 260 });
    // 上墙灰泥 + 下墙白瓷砖
    plasterWall(g, q, 0, 60, W, 260, { col: '#8a8070', t: ['plaster', { c1: '#7a7262', c2: '#9a927e', seed: 43, stain: 0.6 }, 300] });
    bands(g, 0, 60, W, [[4, lo(0.5)], [10, '#5a4630'], [3, hi(0.2)], [6, '#4a3624']]);
    g.beginPath(); g.rect(0, 320, W, R.base - 320); texFill(g, q, '#c4c0b8', TILE_W);
    if (q.tex <= 0) { g.strokeStyle = 'rgba(80,76,70,0.5)'; g.lineWidth = 1.5; for (var ty = 320; ty < R.base; ty += 25) { g.beginPath(); g.moveTo(0, ty); g.lineTo(W, ty); g.stroke(); } }
    g.fillStyle = K.lin(g, 0, 320, 0, R.base, [lo(0.1), lo(0.25)]); g.fillRect(0, 320, W, R.base - 320);
    bands(g, 0, 314, W, [[3, hi(0.25)], [8, '#5a4630'], [3, lo(0.5)]]);
    // 小高窗（水槽上方）
    windowFront(g, q, R, 940, 140, 176, 150, { cols: 2, rows: 2, seed: 15, horizon: 0.7, sea: false, casing: 12, sill: true });
    // 炉灶
    range(g, q, R, 70, 432, 404, R.base + 6);
    // 刀架
    knifeRack(g, q, 552, 276, 248, 108);
    // 传声管
    speakingTube(g, q, 848, 316, 64, 84);
    // 水槽
    sink(g, q, R, 900, 472, 216, R.base + 6);
    // 碗碟架（墙上）
    if (q.model >= 1) {
      g.beginPath(); g.rect(1130, 330, 50, 120); texFill(g, q, '#5a4630', TX.pine);
      for (var pl = 0; pl < 5; pl++) { ell(g, 1155, 350 + pl * 20, 22, 6, '#e8e4dc'); ell(g, 1155, 350 + pl * 20, 16, 3.5, '#c8c4bc'); }
    }
    // 地窖门
    plankDoor(g, q, R, 1214, 372, 222, R.base);
    if (q.model >= 1) { // 门边挂的提灯钩
      seg(g, 1470, 420, 1490, 420, 4, '#2a2a30'); seg(g, 1490, 420, 1490, 440, 3, '#2a2a30');
    }
    // 储藏室
    pantry(g, q, R, 1536, 250, 304, R.base);
    // 地面
    tileFloor(g, q, R, { tile: 92, cols: ['#8a4c34', '#6a3a28'], ts: [TX.flag, TX.flag], mortar: '#2a1a14', gap: 2.4, seed: 19, var: 0.08 });
    if (q.light >= 1) K.ao(g, 0, R.base - 2, W, 40, 30, 0.35, 't');
    // 工作台
    var tx = 604, tw = 552, tty = 722, tby = 888, tk = 0.8;
    if (q.light >= 1) K.contact(g, tx + tw / 2, tby, tw * 0.55, 18, 0.6);
    var legs = [tx + 14, tx + tw - 40];
    var bl = R.p(tx + 14, tby, tk), br = R.p(tx + tw - 40, tby, tk);
    cyl(g, bl[0], tty + 40, 22, bl[1] - tty - 40, '#4a3420'); cyl(g, br[0], tty + 40, 22, br[1] - tty - 40, '#4a3420');
    for (var l = 0; l < 2; l++) cyl(g, legs[l], tty + 30, 26, tby - tty - 30, '#5a4028');
    box(g, q, R, tx, tty, tw, 34, tk, { col: '#7a5a38', t: TX.pineH, topHi: 0.2 });
    rect(g, tx + 26, tby - 60, tw - 52, 12, '#4a3420');
    // 台面上的东西
    var tp = function (u, v) { return R.p(tx + tw * u, tty, 1 - (1 - tk) * v); };
    var cbp = tp(0.3, 0.5);
    fillP(g, [cbp[0] - 90, cbp[1] + 10, cbp[0] + 70, cbp[1] + 10, cbp[0] + 60, cbp[1] - 10, cbp[0] - 80, cbp[1] - 10], '#a87a48');
    rect(g, cbp[0] - 90, cbp[1] + 10, 160, 6, '#7a5430');
    if (q.model >= 1) {
      // 洋葱、胡萝卜
      for (var v = 0; v < 3; v++) { var on = tp(0.18 + v * 0.05, 0.4); g.fillStyle = K.rad(g, on[0] - 4, on[1] - 18, 2, 14, ['#e8c890', '#a86a30']); circle(g, on[0], on[1] - 12, 13, g.fillStyle); }
      for (var c = 0; c < 3; c++) { var cr = tp(0.36 + c * 0.03, 0.55); g.save(); g.translate(cr[0], cr[1] - 4); g.rotate(-0.2 + c * 0.1); fillP(g, [0, -5, 46, -1, 46, 1, 0, 5], '#d06a20'); g.restore(); }
      // 碗
      var bw = tp(0.62, 0.5); g.fillStyle = K.lin(g, 0, bw[1] - 30, 0, bw[1], ['#e8e4dc', '#a8a49c']);
      g.beginPath(); g.moveTo(bw[0] - 44, bw[1] - 30); g.quadraticCurveTo(bw[0] - 40, bw[1] + 4, bw[0], bw[1] + 4); g.quadraticCurveTo(bw[0] + 40, bw[1] + 4, bw[0] + 44, bw[1] - 30); g.closePath(); g.fill();
      ell(g, bw[0], bw[1] - 30, 44, 8, '#f4f0ea'); ell(g, bw[0], bw[1] - 29, 38, 6, '#c8c0b0');
      // 面包
      var br2 = tp(0.82, 0.45); g.fillStyle = K.rad(g, br2[0] - 6, br2[1] - 20, 4, 40, ['#d8a060', '#8a5420']); K.ellipse(g, br2[0], br2[1] - 14, 44, 18); g.fill();
      for (var sl = 0; sl < 4; sl++) seg(g, br2[0] - 26 + sl * 16, br2[1] - 26, br2[0] - 20 + sl * 16, br2[1] - 6, 2, 'rgba(90,50,20,0.5)');
    }
    // 吊灯（工作台上方）
    var lx = 700, ly = 196;
    seg(g, lx, 0, lx, ly - 30, 2, '#2a2a2e');
    g.beginPath(); g.moveTo(lx - 12, ly - 34); g.lineTo(lx + 12, ly - 34); g.lineTo(lx + 64, ly + 10); g.lineTo(lx - 64, ly + 10); g.closePath();
    g.fillStyle = K.lin(g, lx - 64, 0, lx + 64, 0, ['#2a3a30', '#5a7a68', '#2a3a30']); g.fill();
    ell(g, lx, ly + 10, 64, 8, '#1a2a20');
    // ---- 光照 ----
    var Lm = [
      { lin: [0, 0, 0, H], stops: [[0, 'rgba(60,50,40,0.1)'], [1, 'rgba(40,30,30,0.1)']] },
      { x: lx + 100, y: 500, r: 800, ry: 580, c: '#ffd8a0', i: 0.6, fall: 0.3 },
      { x: lx + 160, y: 820, r: 520, ry: 180, c: '#ffd8a0', i: 0.35, q: 1 },
      { x: 1028, y: 240, r: 320, ry: 300, c: '#a8b8d8', i: 0.45 },
      { x: 272, y: 700, r: 300, ry: 200, c: '#ff9a50', i: 0.4, q: 1 },
      { x: 1690, y: 500, r: 300, ry: 400, c: '#c8b8a0', i: 0.2, q: 1 }
    ];
    lightMap(g, q, '#4a4650', Lm);
    // 自发光：炉火、灯泡
    g.save(); g.globalCompositeOperation = 'lighter';
    var fdx = 70 + 16 + (404 - 32) / 3, fdw = (404 - 32) / 3 - 12, fdy = 432 + 150 + 30, fdh = R.base + 6 - 432 - 150 - 70;
    g.fillStyle = K.lin(g, 0, fdy + fdh * 0.5, 0, fdy + fdh * 0.8, ['rgba(255,120,40,0.3)', 'rgba(255,200,90,0.8)']); g.fillRect(fdx + 12, fdy + fdh * 0.5, fdw - 24, fdh * 0.3);
    g.restore();
    if (q.light >= 1) K.glow(g, fdx + fdw / 2, fdy + fdh * 0.65, 120, '#ff8a3a', 0.3);
    if (q.light >= 1) K.glow(g, lx, ly + 14, 160, '#ffd090', 0.4);
    g.fillStyle = K.rad(g, lx, ly + 10, 2, 30, ['#fffbe8', 'rgba(255,220,150,0)']); circle(g, lx, ly + 12, 30, g.fillStyle);
    shaft(g, q, [948, 150, 1108, 150, 1180, 900, 820, 900], '#c0d0f0', 0.06, 0, 150, 0, 900);
    if (q.light >= 2) K.motes(g, K.rng(47), 40, 860, 200, 300, 500, '#e0e8ff', 0.3);
    finish(g, q, { vig: 0.5 });
  }
  DM.HDBG.def('kitchen', {
    draw: function (g, q) { drawKitchen(g, q); },
    lights: [
      LT(700, 210, 260, '#ffd8a0', 0.65, 0.04, 'lamp'),
      LT(1028, 220, 160, '#a8b8d8', 0.4, 0, 'window'),
      LT(272, 680, 140, '#ff8a3a', 0.5, 0.45, 'fire')
    ],
    key: { x: 0.05, color: '#ffe0b8', amb: '#3a3840', rim: 0.4 },
    outdoor: false
  });

  /* ================================================================
   * 音乐室 music
   * ================================================================ */
  function musicStand(g, q, x, y, w, by) {
    var cx = x + w / 2;
    if (q.light >= 1) K.contact(g, cx, by, 46, 7, 0.55);
    for (var f = -1; f <= 1; f++) seg(g, cx, by - 46, cx + f * 46, by, 3, '#1a1a1e');
    seg(g, cx, by - 46, cx, y + 80, 5, '#1e1e24'); seg(g, cx - 1, by - 46, cx - 1, y + 80, 1.2, hi(0.25));
    // 谱架面（斜）
    fillP(g, [x, y + 20, x + w, y + 20, x + w - 6, y + 96, x + 6, y + 96], '#1a1a1e');
    if (q.model >= 1) for (var i = 0; i < 6; i++) seg(g, x + 10 + i * (w - 20) / 5, y + 24, x + 12 + i * (w - 24) / 5, y + 92, 2, '#2a2a30');
    rect(g, x + 4, y + 94, w - 8, 6, '#2a2a30');
    // 乐谱
    g.save(); g.translate(x + w / 2, y + 60); g.rotate(-0.03);
    rect(g, -w * 0.48, -52, w * 0.48, 84, '#ece4d0'); rect(g, 0, -50, w * 0.48, 82, '#e4dcc6');
    for (var s = 0; s < M(q, 3, 5, 7); s++) for (var l = 0; l < 5; l++) { seg(g, -w * 0.45, -40 + s * 12 + l * 1.6, -4, -40 + s * 12 + l * 1.6, 0.5, 'rgba(40,30,30,0.5)'); seg(g, 4, -38 + s * 12 + l * 1.6, w * 0.45, -38 + s * 12 + l * 1.6, 0.5, 'rgba(40,30,30,0.5)'); }
    if (q.model >= 2) { var rnd = K.rng(5); for (var n = 0; n < 40; n++) circle(g, -w * 0.44 + rnd() * w * 0.88, -40 + Math.floor(rnd() * 6) * 12 + rnd() * 6, 1.2, 'rgba(20,16,16,0.7)'); }
    g.restore();
  }
  function cassetteDeck(g, q, R, x, y, w, by) {
    // 矮柜
    var top = y + 92, k = R.kWall(by);
    if (q.light >= 1) K.contact(g, x + w / 2, by, w * 0.62, 10, 0.6);
    box(g, q, R, x - 20, top, w + 40, by - top, k, { col: '#3a2014', t: TX.walnut });
    for (var d = 0; d < 2; d++) { groove(g, x - 8 + d * (w + 16) / 2, top + 22, (w + 16) / 2 - 12, by - top - 50, 3, 0.45); circle(g, x + (w + 16) / 2 * (d + 0.5) - 8, top + 50, 3.5, '#b08a48'); }
    // 卡座
    var dy = top - 64, dh = 64;
    box(g, q, R, x + 8, dy, w - 16, dh, 0.97, { col: '#2a2a2e', frontLo: 0.3 });
    rect(g, x + 8, dy + 2, w - 16, 2, hi(0.3));
    // 双卡带仓
    for (var c = 0; c < 2; c++) {
      var cx = x + 22 + c * 70, cw = 62;
      rect(g, cx, dy + 10, cw, 34, '#121216'); g.strokeStyle = '#4a4a52'; g.lineWidth = 1.5; g.strokeRect(cx, dy + 10, cw, 34);
      rect(g, cx + 6, dy + 16, cw - 12, 20, '#3a3028'); circle(g, cx + 18, dy + 26, 5, '#d8d0c0'); circle(g, cx + cw - 18, dy + 26, 5, '#d8d0c0');
      rect(g, cx + 6, dy + 16, cw - 12, 4, 'rgba(255,255,255,0.15)');
    }
    // VU 表 + 按钮
    var mx = x + w - 70;
    rect(g, mx, dy + 10, 48, 18, '#1a1206'); g.fillStyle = 'rgba(255,170,60,0.85)'; g.fillRect(mx + 3, dy + 13, 18, 12); g.fillRect(mx + 26, dy + 13, 18, 12);
    seg(g, mx + 12, dy + 25, mx + 16, dy + 15, 1, '#1a1206'); seg(g, mx + 35, dy + 25, mx + 38, dy + 16, 1, '#1a1206');
    for (var b = 0; b < 6; b++) { rect(g, x + 22 + b * 22, dy + 50, 16, 7, '#c8c8d0'); rect(g, x + 22 + b * 22, dy + 50, 16, 2, hi(0.4)); }
    circle(g, x + w - 30, dy + 46, 9, '#8a8a92'); circle(g, x + w - 32, dy + 44, 3, hi(0.4));
    circle(g, x + w - 60, dy + 50, 2.5, '#ff4020');
    // 磁带盒
    if (q.model >= 1) for (var t = 0; t < 3; t++) { rect(g, x + w + 4 + t * 3, dy + 30 - t * 2, 46, 30, ['#e8e0d0', '#2a3a6a', '#a01a22'][t]); rect(g, x + w + 4 + t * 3, dy + 30 - t * 2, 46, 2, hi(0.3)); }
    return { led: [x + w - 60, dy + 50], vu: [mx + 24, dy + 19] };
  }
  function recordShelf(g, q, R, x, y, w, by) {
    bookshelf(g, q, R, x, y, w, by, {
      rows: 4, seed: 71, col: '#2e1a10',
      fill: function (g2, q2, ix, sy, iw, sh, r, rnd) {
        var bx = ix + 4, fl = sy + sh;
        if (r === 1 && q2.model >= 1) { // 正面展示的唱片封套
          for (var c = 0; c < 2; c++) {
            var cx = ix + 20 + c * (iw / 2), cs = Math.min(sh - 10, iw / 2 - 30);
            g2.save(); g2.translate(cx, fl); g2.rotate(-0.08);
            rect(g2, 0, -cs, cs, cs, ['#a8402a', '#1e2a4a'][c]);
            g2.fillStyle = K.rad(g2, cs / 2, -cs / 2, 2, cs / 2, [c ? 'rgba(220,200,150,0.8)' : 'rgba(20,20,20,0.8)', 'rgba(0,0,0,0)']); g2.fillRect(0, -cs, cs, cs);
            if (c === 0) { circle(g2, cs * 0.5, -cs * 0.5, cs * 0.3, '#121212'); circle(g2, cs * 0.5, -cs * 0.5, cs * 0.08, '#e8d8a0'); }
            else K.text(g2, 'Bach', cs * 0.5, -cs * 0.28, 14, '#e8dcc0', { font: 'Georgia,serif' });
            g2.restore();
          }
          return;
        }
        while (bx < ix + iw - 6) {
          var bw = 3 + rnd() * 3, bh = sh - 6 - rnd() * 6;
          var c2 = rnd.pick(['#1a1a1e', '#e8e0d0', '#5a1a1a', '#2a3a5a', '#3a3a2a', '#8a6a3a', '#141414', '#c8c0b0']);
          rect(g2, bx, fl - bh, bw, bh, c2); rect(g2, bx + bw - 0.6, fl - bh, 0.6, bh, lo(0.4));
          bx += bw + 0.3;
        }
      }
    });
  }
  function violinCase(g, q, x, y, w, h) {
    var cx = x + w / 2, cy = y + h * 0.66, L = w * 0.94, B = w * 0.3, sy = 0.36;
    function outline(sc) {
      var l = L * sc, b = B * sc;
      g.beginPath(); g.moveTo(-l / 2, 0); g.bezierCurveTo(-l / 2, -b / 2, -l * 0.3, -b / 2, -l * 0.1, -b * 0.4); g.lineTo(l * 0.42, -b * 0.22);
      g.quadraticCurveTo(l / 2, 0, l * 0.42, b * 0.22); g.lineTo(-l * 0.1, b * 0.4); g.bezierCurveTo(-l * 0.3, b / 2, -l / 2, b / 2, -l / 2, 0); g.closePath();
    }
    if (q.light >= 1) K.contact(g, cx, cy + 14, w * 0.55, 14, 0.75);
    // 盒盖（铰链在远侧，竖起，内衬朝向镜头）
    g.save(); g.translate(cx, cy - B / 2 * sy); g.scale(1, -0.62); g.translate(0, -B / 2);
    outline(1); g.fillStyle = '#16161a'; g.fill(); outline(0.9); texFill(g, q, '#5a1020', TX.velvet); outline(0.9); g.fillStyle = K.lin(g, 0, -B / 2, 0, B / 2, [lo(0.5), lo(0.15)]); g.fill();
    g.restore();
    // 盒身侧壁（挤出）
    for (var e = 5; e >= 1; e--) { g.save(); g.translate(cx, cy + e * 4); g.scale(1, sy); outline(1); g.fillStyle = e > 1 ? '#121216' : '#1e1e24'; g.fill(); g.restore(); }
    g.save(); g.translate(cx, cy); g.scale(1, sy);
    outline(1); g.fillStyle = K.lin(g, 0, -B / 2, 0, B / 2, ['#3a3a42', '#1a1a1e']); g.fill();
    outline(0.9); texFill(g, q, '#6a1424', TX.velvet); outline(0.9); g.fillStyle = K.rad(g, 0, 0, 4, L * 0.5, [hi(0.08), lo(0.35)]); g.fill();
    // 小提琴（琴身朝左）
    g.save(); g.translate(-L * 0.06, 0);
    var vl = L * 0.36, vb = B * 0.36;
    g.beginPath(); g.moveTo(-vl, 0); g.bezierCurveTo(-vl, -vb * 1.2, -vl * 0.5, -vb * 1.25, -vl * 0.38, -vb * 0.7); g.bezierCurveTo(-vl * 0.3, -vb * 0.9, -vl * 0.08, -vb * 0.9, 0, -vb * 0.62);
    g.bezierCurveTo(vl * 0.08, -vb * 1.1, vl * 0.36, -vb * 1.1, vl * 0.38, 0); g.bezierCurveTo(vl * 0.36, vb * 1.1, vl * 0.08, vb * 1.1, 0, vb * 0.62);
    g.bezierCurveTo(-vl * 0.08, vb * 0.9, -vl * 0.3, vb * 0.9, -vl * 0.38, vb * 0.7); g.bezierCurveTo(-vl * 0.5, vb * 1.25, -vl, vb * 1.2, -vl, 0); g.closePath();
    g.fillStyle = K.rad(g, -vl * 0.4, -vb * 0.3, 4, vl, ['#e09a48', '#a8501a', '#4a1a08']); g.fill();
    g.strokeStyle = '#2a1006'; g.lineWidth = 2; g.stroke();
    rect(g, vl * 0.38, -vb * 0.16, vl * 0.62, vb * 0.32, '#1a1008'); g.beginPath(); g.arc(vl * 1.05, 0, vb * 0.3, 0, TAU); g.fillStyle = '#3a1a08'; g.fill();
    for (var st = -1.5; st <= 1.5; st += 1) seg(g, -vl * 0.8, st * vb * 0.08, vl * 0.98, st * vb * 0.05, 1.4, 'rgba(235,230,215,0.8)');
    rect(g, -vl * 0.42, -vb * 0.36, 5, vb * 0.72, '#e8d8b0');
    if (q.light >= 2) { g.beginPath(); g.ellipse ? g.ellipse(-vl * 0.6, -vb * 0.4, vl * 0.15, vb * 0.3, 0, 0, TAU) : g.arc(-vl * 0.6, -vb * 0.4, vb * 0.3, 0, TAU); g.fillStyle = 'rgba(255,230,180,0.25)'; g.fill(); }
    g.restore();
    // 琴弓
    seg(g, -L * 0.42, B * 0.3, L * 0.4, B * 0.18, 4, '#3a1a0a'); seg(g, -L * 0.42, B * 0.36, L * 0.38, B * 0.24, 2, 'rgba(240,235,220,0.75)');
    g.restore();
    // 黄铜搭扣
    g.fillStyle = metalGrad(g, cx - 40, 0, cx - 28, 0, '#c9a25a'); g.fillRect(cx - 40, cy + B / 2 * sy - 4, 12, 10); g.fillRect(cx + 60, cy + B * 0.3 * sy - 2, 12, 10);
    // 松香盒
    if (q.model >= 1) { ell(g, x + w * 0.9, cy + 26, 14, 6, '#c89a40'); ell(g, x + w * 0.9, cy + 24, 10, 4, '#f0d080'); }
  }
  function drawMusic(g, q) {
    setKey(-0.15);
    var R = Room(960, 540, 768, 26, 1400);
    ceilingStrip(g, q, R, { col: '#1a1620', t: TX.walnutH, step: 280 });
    paperWall(g, q, 0, 26, W, R.base - 26, { c1: '#1c2242', c2: '#283258', seed: 61, age: 0.3, line: 'rgba(200,170,110,0.2)' });
    var cb = cornice(g, q, 0, 26, W, '#3a2a20');
    wainscot(g, q, [[0, W]], 606, R.base, { t: TX.walnut, col: '#2e1c12', pw: 170 });
    if (q.model >= 1) { pilaster(g, q, 600, cb, 40, R.base - cb, '#2e1c12', TX.walnut); pilaster(g, q, 1170, cb, 40, R.base - cb, '#2e1c12', TX.walnut); }
    // 拱窗
    windowFront(g, q, R, 744, 122, 264, 288, { arch: true, cols: 3, rows: 3, seed: 17, horizon: 0.62 });
    curtain(g, q, 670, 96, 118, 490, { col: '#4a1222', side: 'l', t: TX.velvet, tie: 0.64, gather: 0.55, tieCol: '#c9a25a' });
    curtain(g, q, 964, 96, 118, 490, { col: '#4a1222', side: 'r', t: TX.velvet, tie: 0.64, gather: 0.55, tieCol: '#c9a25a' });
    valance(g, q, 670, 96, 412, '#4a1222', { t: TX.velvet });
    // 墙上：作曲家肖像 + 壁灯
    if (q.model >= 1) {
      frame(g, q, 210, 150, 150, 190, function (g2, q2, x, y, w, h) { paintPortrait(g2, q2, x, y, w, h, { seed: 17 }); }, { fw: 14 });
      frame(g, q, 1270, 190, 180, 130, paintSeascape, { fw: 12 });
    }
    sconce(g, q, 470, 330, { arms: 2, candle: true, scale: 0.85 });
    // 唱片架
    recordShelf(g, q, R, 1524, 346, 330, R.base + 8);
    if (q.model >= 1) { // 唱片架顶上的留声机/花瓶
      g.fillStyle = K.lin(g, 1620, 0, 1660, 0, ['#4a3a6a', '#8a7ab0', '#4a3a6a']); K.rr(g, 1624, 296, 34, 50, 12); g.fill();
      for (var fl = 0; fl < 3; fl++) circle(g, 1632 + fl * 9, 290 - fl % 2 * 8, 8, ['#e8e0f0', '#c03040', '#f0e8d8'][fl]);
    }
    // 落地灯（唱片架旁）
    // 地面
    plankFloor(g, q, R, { pw: 58, seed: 31, far: '#24160c', near: '#4e3220', t: TX.floorW });
    if (q.light >= 1) K.ao(g, 0, R.base - 2, W, 40, 30, 0.35, 't');
    floorSheen(g, q, R, 876, 240, '#a8b8e0', 0.12);
    rug(g, q, R, 640, 1380, 1.04, 1.7, { col: '#1e2448', border: '#0e1024', gold: '#a8823e' });
    // 卡座
    var cd = cassetteDeck(g, q, R, 1310, 520, 210, R.base + 8);
    floorLamp(g, q, 1480, R.base + 30, 400, { shade: '#d8c8a0' });
    // 谱架
    musicStand(g, q, 800, 476, 128, 760);
    // 三角钢琴
    grandPiano(g, q, R, 64, 440, 440, R.base + 10);
    // 琴凳
    box(g, q, R, 540, 690, 96, 26, 0.9, { col: '#141014', topHi: 0.2 });
    rect(g, 548, 716, 8, 70, '#141014'); rect(g, 620, 716, 8, 70, '#141014');
    // 琴盒
    violinCase(g, q, 1004, 748, 272, 98);
    // ---- 光照 ----
    var Lm = [
      { lin: [0, 0, W, 0], stops: [[0, 'rgba(60,60,90,0.15)'], [0.45, 'rgba(70,80,110,0.2)'], [1, 'rgba(90,70,60,0.15)']] },
      { x: 876, y: 300, r: 640, ry: 560, c: '#a8b8e8', i: 0.6, fall: 0.3 },
      { pts: [744, 400, 1008, 400, 1260, 1080, 520, 1080], c: '#90a0d8', i: 0.32, fx0: 0, fy0: 400, fx1: 0, fy1: 1080, q: 1 },
      { x: 1480, y: 420, r: 420, ry: 460, c: '#ffc080', i: 0.5, fall: 0.3 },
      { x: 1480, y: 800, r: 300, ry: 120, c: '#ffc080', i: 0.3, q: 1 },
      { x: 470, y: 310, r: 240, ry: 300, c: '#ffb870', i: 0.4, q: 1 },
      { x: 300, y: 620, r: 300, ry: 200, c: '#8090c0', i: 0.15, q: 2 }
    ];
    lightMap(g, q, '#363a50', Lm);
    shaft(g, q, [754, 240, 998, 240, 1240, 1000, 560, 1000], '#c0d0f8', 0.08, 0, 240, 0, 1000);
    if (q.light >= 2) K.motes(g, K.rng(53), 60, 700, 260, 400, 600, '#d8e0ff', 0.32);
    lampGlow(g, q, 1480, R.base + 30 - 400, 90, 66, 0.6);
    sconceGlow(g, q, 470, 330, { arms: 2, candle: true, scale: 0.85 });
    g.save(); g.globalCompositeOperation = 'lighter'; K.glow(g, cd.led[0], cd.led[1], 10, '#ff4020', 0.5); K.glow(g, cd.vu[0], cd.vu[1], 30, '#ffaa40', 0.25); g.restore();
    finish(g, q, { vig: 0.5 });
  }
  DM.HDBG.def('music', {
    draw: function (g, q) { drawMusic(g, q); },
    lights: [
      LT(876, 300, 260, '#a8b8e8', 0.55, 0, 'window'),
      LT(1480, 400, 150, '#ffc070', 0.55, 0.03, 'lamp'),
      LT(470, 304, 90, '#ffb060', 0.5, 0.35, 'candle'),
      LT(1394, 554, 40, '#ffaa40', 0.4, 0.02, 'screen')
    ],
    key: { x: -0.15, color: '#c8d0f0', amb: '#2a2e44', rim: 0.55 },
    outdoor: false
  });


  /* ================================================================
   * 地下酒窖 cellar（+ swapped：两块铜牌互换）
   * ================================================================ */
  var CELLAR_STONE = ['stone', { c1: '#3a3438', c2: '#6a6064', mortar: '#1a1618', rows: 5, cols: 3, seed: 91, irregular: 1, mortarW: 0.04 }, 260];
  // 楼梯拱洞：台阶向深处升起。side -1 西（左），1 东（右）
  function stairArch(g, q, R, x, w, spring, base, side, o) {
    o = o || {};
    var r = w / 2, cx = x + r, top = spring - r;
    function hole(e) { g.beginPath(); g.moveTo(x - e, base); g.lineTo(x - e, spring); g.arc(cx, spring, r + e, PI, 0); g.lineTo(x + w + e, base); g.closePath(); }
    // 拱石（voussoirs）
    hole(46); texFill(g, q, '#5a5258', CELLAR_STONE, 0, 0, 1, 1);
    hole(46); g.fillStyle = K.lin(g, 0, top - 46, 0, base, [hi(0.08), lo(0.15)]); g.fill();
    if (q.model >= 1) {
      var nv = 11;
      for (var i = 0; i <= nv; i++) {
        var a = PI + PI * i / nv, ix = cx + Math.cos(a) * r, iy = spring + Math.sin(a) * r, ox = cx + Math.cos(a) * (r + 46), oy = spring + Math.sin(a) * (r + 46);
        seg(g, ix, iy, ox, oy, 3, lo(0.55)); seg(g, ix + 2, iy + 1, ox + 2, oy + 1, 1, hi(0.12));
      }
      for (var j = 0; j < 6; j++) { var yy = spring + j * (base - spring) / 6; seg(g, x - 46, yy, x, yy, 3, lo(0.5)); seg(g, x + w, yy, x + w + 46, yy, 3, lo(0.5)); }
    }
    // 洞内
    g.save(); hole(0); g.clip();
    rect(g, x, top, w, base - top, '#141016');
    var Hs = 640, n = 12, eye = base - R.vy, kTop = 0.6;
    var sx0 = x + 18, sx1 = x + w - 18, svx = cx + side * w * 0.18;
    function S(X, Y, k) { return [svx + (X - svx) * k, R.vy + (eye - Y) * k]; }
    // 楼梯井侧墙
    var a0 = S(sx0, 900, 1), a1 = S(sx0, 900, kTop), b0 = S(sx1, 900, 1), b1 = S(sx1, 900, kTop), f0 = S(sx0, 0, 1), f1 = S(sx0, Hs, kTop), f2 = S(sx1, 0, 1), f3 = S(sx1, Hs, kTop);
    fillP(g, [a0[0], a0[1], a1[0], a1[1], f1[0], f1[1], f0[0], f0[1]], '#1e1a1e');
    fillP(g, [b0[0], b0[1], b1[0], b1[1], f3[0], f3[1], f2[0], f2[1]], '#161216');
    // 台阶
    for (var s = n - 1; s >= 0; s--) {
      var Yb = Hs * s / n, Yt = Hs * (s + 1) / n, ks = 1 / (1 + (1 / kTop - 1) * s / n), kn = 1 / (1 + (1 / kTop - 1) * (s + 1) / n);
      var fade = s / n;
      if (Yt < eye) { var t0 = S(sx0, Yt, ks), t1 = S(sx1, Yt, ks), t2 = S(sx1, Yt, kn), t3 = S(sx0, Yt, kn); fillP(g, [t0[0], t0[1], t1[0], t1[1], t2[0], t2[1], t3[0], t3[1]], K.mix('#7a7276', '#141016', fade * 0.75)); }
      var r0 = S(sx0, Yt, ks), r1 = S(sx1, Yb, ks);
      rect(g, r0[0], r0[1], r1[0] - r0[0], r1[1] - r0[1], K.mix('#5a5458', '#141016', fade * 0.7));
      rect(g, r0[0], r0[1], r1[0] - r0[0], 2, K.mix('#8a8288', '#08060a', fade));
    }
    // 楼上漏下的微光
    var tl = S(cx, Hs + 260, kTop);
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = K.rad(g, tl[0], tl[1], 4, w * 0.75, ['rgba(150,160,200,0.5)', 'rgba(70,70,100,0.18)', 'rgba(0,0,0,0)']); g.fillRect(x, top, w, base - top); g.restore();
    if (o.inside) o.inside(g, S, Hs, n, kTop, sx0, sx1);
    g.fillStyle = K.lin(g, 0, top, 0, top + r, [lo(0.6), lo(0)]); g.fillRect(x, top, w, r);
    g.restore();
    // 半开的木门（贴在洞口内侧）
    var dw = w * 0.16, dx = side < 0 ? x + w - dw : x;
    g.beginPath(); g.rect(dx, spring - 10, dw, base - spring + 10); texFill(g, q, '#3a2818', TX.oak);
    rect(g, dx, spring - 10, dw, base - spring + 10, K.lin(g, dx, 0, dx + dw, 0, side < 0 ? [lo(0.2), lo(0.6)] : [lo(0.6), lo(0.2)]));
    for (var st = 0; st < 2; st++) rect(g, dx, spring + 40 + st * (base - spring - 120), dw, 14, '#2a2a30');
    return { cx: cx, top: top };
  }
  // 铜牌（挂在钉子上）
  function brassPlate(g, q, x, y, w, h, txt, o) {
    o = o || {};
    var cx = x + w / 2, ny = y - 30;
    // 挂绳
    seg(g, cx, ny, x + 14, y + 4, 2, '#3a2c1a'); seg(g, cx, ny, x + w - 14, y + 4, 2, '#3a2c1a');
    circle(g, cx, ny, 4, '#2a2a2e'); circle(g, cx - 1, ny - 1, 1.5, '#8a8a92');
    if (q.light >= 1) softRect(g, x + (KX < 0 ? 6 : -4), y + 6, w, h, 6, 0.55);
    g.fillStyle = metalGrad(g, x, y, x + w * 0.3, y + h * 1.4, '#a8823e'); K.rr(g, x, y, w, h, 4); g.fill();
    bevel(g, x, y, w, h, 4, 0.3, 0.5);
    g.strokeStyle = '#4a3410'; g.lineWidth = 1.5; K.rr(g, x + 7, y + 7, w - 14, h - 14, 2); g.stroke();
    circle(g, x + 12, y + h / 2, 3, '#e8c880'); circle(g, x + w - 12, y + h / 2, 3, '#e8c880');
    K.text(g, txt, cx + 1, y + h / 2 + 2, h * 0.52, 'rgba(255,230,170,0.35)', { weight: 'bold' });
    K.text(g, txt, cx, y + h / 2 + 1, h * 0.52, '#2a1806', { weight: 'bold' });
    if (o.rosin) { // 松香粉
      var rnd = K.rng(o.rosin);
      for (var i = 0; i < 40; i++) { var px = x + (rnd() < 0.5 ? rnd() * 14 : w - rnd() * 14), py = y + rnd() * h; circle(g, px, py, 0.8 + rnd() * 1.4, 'rgba(240,240,232,' + (0.4 + rnd() * 0.4) + ')'); }
      for (var j = 0; j < 20; j++) circle(g, x + rnd() * w, y + h - rnd() * 4, 0.8 + rnd(), 'rgba(240,240,232,0.6)');
    }
    if (q.light >= 2) { g.save(); g.globalCompositeOperation = 'lighter'; rect(g, x + 6, y + 3, w - 12, 2, 'rgba(255,240,200,0.35)'); g.restore(); }
  }
  // 灰尘轮廓（挂牌留下的干净印子）
  function plateGhost(g, x, y, w, h) {
    g.save();
    g.fillStyle = 'rgba(30,26,24,0.55)'; g.fillRect(x - 26, y - 22, w + 52, h + 44);   // 周围积灰（暗）
    g.fillStyle = K.rad(g, x + w / 2, y + h / 2, 10, w * 0.9, ['rgba(0,0,0,0)', 'rgba(0,0,0,0.25)']); g.fillRect(x - 40, y - 40, w + 80, h + 80);
    g.fillStyle = 'rgba(150,140,140,0.55)'; g.fillRect(x, y, w, h);                     // 干净的印子（亮）
    g.strokeStyle = 'rgba(20,16,14,0.7)'; g.lineWidth = 2; g.strokeRect(x - 1, y - 1, w + 2, h + 2);
    g.restore();
  }
  // 酒架（菱格 + 酒瓶）
  function wineRack(g, q, R, x, y, w, by) {
    var k = R.kWall(by), rnd = K.rng(93), h = by - y - 20;
    if (q.light >= 1) softRect(g, x + 10, y + 10, w, h, 14, 0.45);
    box(g, q, R, x, y, w, h + 20, k, { col: '#3a2416', t: TX.oak });
    var ix = x + 18, iy = y + 22, iw = w - 36, ih = h - 30;
    rect(g, ix, iy, iw, ih, '#0c0806');
    var cell = M(q, 76, 64, 56);
    g.save(); g.beginPath(); g.rect(ix, iy, iw, ih); g.clip();
    // 酒瓶（瓶底朝外）
    for (var cy2 = iy + cell / 2; cy2 < iy + ih + cell; cy2 += cell / 2) {
      var row = Math.round((cy2 - iy) / (cell / 2));
      for (var cx2 = ix + (row % 2 ? cell / 2 : 0); cx2 < ix + iw + cell; cx2 += cell) {
        var n = 3;
        for (var b = 0; b < n; b++) {
          if (rnd() < 0.12) continue;
          var bx = cx2 + (b - 1) * cell * 0.22, by2 = cy2 + cell * 0.12 - (b % 2) * cell * 0.12, br = cell * 0.13;
          var bc = rnd() < 0.55 ? '#14301c' : rnd() < 0.5 ? '#3a1018' : '#2a2416';
          circle(g, bx, by2, br, bc); circle(g, bx, by2, br * 0.55, K.shade(bc, -0.5));
          if (q.light >= 1) { g.beginPath(); g.arc(bx, by2, br * 0.8, PI * 1.1, PI * 1.5); stroke(g, 1.4, 'rgba(200,230,200,0.35)'); }
          if (q.tex >= 1 && rnd() < 0.3) circle(g, bx + br * 0.3, by2 - br * 0.3, br * 0.35, 'rgba(120,110,100,0.25)');
        }
      }
    }
    // 菱格木条
    g.strokeStyle = '#4a2e1a'; g.lineWidth = 7;
    for (var d = -ih; d < iw + ih; d += cell) {
      g.beginPath(); g.moveTo(ix + d, iy); g.lineTo(ix + d + ih, iy + ih); g.stroke();
      g.beginPath(); g.moveTo(ix + d + ih, iy); g.lineTo(ix + d, iy + ih); g.stroke();
    }
    g.strokeStyle = 'rgba(255,220,170,0.15)'; g.lineWidth = 1.5;
    for (var d2 = -ih; d2 < iw + ih; d2 += cell) { g.beginPath(); g.moveTo(ix + d2 - 3, iy); g.lineTo(ix + d2 + ih - 3, iy + ih); g.stroke(); }
    g.restore();
    if (q.light >= 1) K.ao(g, ix, iy, iw, ih, 30, 0.55);
    // 立柱
    for (var p = 0; p < 3; p++) { var px = x + (w - 22) * p / 2; g.beginPath(); g.rect(px, y, 22, h + 20); texFill(g, q, '#4a2e1a', TX.oak); rect(g, px, y, 22, h + 20, cylGrad(g, px, 22, 'rgba(128,128,128,0)')); bevel(g, px, y, 22, h + 20, 4, 0.15, 0.4); }
    box(g, q, R, x - 10, y - 18, w + 20, 20, 0.985, { col: '#4a2e1a', t: TX.oakH });
    // 蛛网
    if (q.model >= 2) {
      g.strokeStyle = 'rgba(220,220,230,0.18)'; g.lineWidth = 0.8;
      for (var wI = 0; wI < 6; wI++) { g.beginPath(); g.moveTo(x + 22, y + 2); g.lineTo(x + 22 + Math.cos(wI * 0.3) * 70, y + 2 + Math.sin(wI * 0.3) * 70); g.stroke(); }
      for (var wr = 1; wr < 4; wr++) { g.beginPath(); g.arc(x + 22, y + 2, wr * 18, 0, PI / 2); g.stroke(); }
    }
  }
  // 酒桶（侧卧，桶底朝前）
  function barrel(g, q, cx, by, r) {
    if (q.light >= 1) K.contact(g, cx, by, r * 1.1, 10, 0.65);
    g.fillStyle = K.lin(g, cx - r, 0, cx + r, 0, ['#2a1a0e', '#6a4428', '#3a2414']); g.fillRect(cx - r, by - r * 2, r * 2, r * 2 - 4);
    K.ellipse(g, cx, by - r, r * 0.98, r * 0.98); texFill(g, q, '#5a3a22', TX.oakH);
    K.ellipse(g, cx, by - r, r * 0.98, r * 0.98); g.fillStyle = K.rad(g, cx - r * 0.3, by - r * 1.3, 2, r, [hi(0.1), lo(0.35)]); g.fill();
    for (var i = -2; i <= 2; i++) seg(g, cx + i * r * 0.36, by - r * 1.9, cx + i * r * 0.36, by - r * 0.1, 1.2, lo(0.4));
    g.beginPath(); g.arc(cx, by - r, r * 0.98, 0, TAU); stroke(g, 6, '#2a2a30'); g.beginPath(); g.arc(cx, by - r, r * 0.8, 0, TAU); stroke(g, 3, '#2a2a30');
    circle(g, cx, by - r * 0.55, r * 0.08, '#2a1808');
    rect(g, cx - r * 0.7, by - 6, 12, 6, '#2a1a0e'); rect(g, cx + r * 0.7 - 12, by - 6, 12, 6, '#2a1a0e');
  }
  // 空酒箱
  function crate(g, q, R, x, y, w, by, o) {
    o = o || {};
    var k = 0.86, hgt = by - y;
    if (q.light >= 1) K.contact(g, x + w / 2, by, w * 0.6, 12, 0.7);
    var b = box(g, q, R, x, y, w, hgt, k, { col: '#7a5a36', t: TX.pineH, topFace: false });
    // 箱口：看得见内部（空）
    var t0 = R.p(x, y, k), t1 = R.p(x + w, y, k);
    fillP(g, [x, y, x + w, y, t1[0], t1[1], t0[0], t0[1]], '#3a2818');
    fillP(g, [x + 8, y - 1, x + w - 8, y - 1, t1[0] - 6, t1[1] + 3, t0[0] + 6, t0[1] + 3], '#1a1008');
    rect(g, x, y, w, 8, '#8a6a42'); rect(g, x, y, w, 2, hi(0.3));
    for (var i = 1; i < 3; i++) rect(g, x, y + hgt * i / 3, w, 2.5, lo(0.45));
    rect(g, x, y, 6, hgt, lo(0.3)); rect(g, x + w - 6, y, 6, hgt, lo(0.3));
    K.text(g, 'BORDEAUX', x + w / 2, y + hgt * 0.55, 15, 'rgba(30,18,10,0.6)', { font: 'Georgia,serif', weight: 'bold' });
    if (q.model >= 1) K.text(g, '1979', x + w / 2, y + hgt * 0.78, 12, 'rgba(30,18,10,0.5)', { font: 'Georgia,serif' });
    if (o.scuff) { // 新鲜蹭痕 + 松香粉
      var rnd = K.rng(o.scuff);
      g.save(); g.beginPath(); g.rect(x, y, w, 10); g.clip(); g.restore();
      for (var s = 0; s < 6; s++) seg(g, x + 20 + rnd() * (w - 40), y + 1, x + 30 + rnd() * (w - 40), y + 6 + rnd() * 4, 1.6, 'rgba(230,200,160,0.7)');
      for (var j = 0; j < 50; j++) circle(g, x + 10 + rnd() * (w - 20), y + rnd() * 9, 0.8 + rnd() * 1.4, 'rgba(240,240,232,' + (0.4 + rnd() * 0.4) + ')');
      for (var p2 = 0; p2 < 12; p2++) circle(g, x + 30 + rnd() * (w - 60), by + 2 + rnd() * 8, 0.8 + rnd(), 'rgba(240,240,232,0.4)');
    }
    void b;
  }
  // 吊挂提灯
  function lantern(g, q, cx, top, h) {
    var s = h / 88;
    for (var c = 0; c < top; c += 10) { K.ellipse(g, cx, c + 5, 3, 5); stroke(g, 1.6, c / 10 % 2 ? '#2a2a2e' : '#3a3a40'); }
    g.save(); g.translate(cx, top); g.scale(s, s);
    fillP(g, [-22, 14, 22, 14, 12, 0, -12, 0], '#1e1e22'); circle(g, 0, -2, 5, '#2a2a2e');
    rect(g, -20, 14, 40, 56, 'rgba(255,200,110,0.9)');
    g.fillStyle = K.rad(g, 0, 44, 2, 30, ['#fff4c8', '#ffc060', '#c06a20']); g.fillRect(-18, 16, 36, 52);
    for (var b = -1; b <= 1; b++) rect(g, b * 19 - 2, 14, 4, 56, '#1a1a1e');
    rect(g, -24, 68, 48, 6, '#1a1a1e'); fillP(g, [-16, 74, 16, 74, 8, 84, -8, 84], '#1a1a1e');
    g.restore();
  }
  function drawCellar(g, q, v) {
    setKey(0);
    var swapped = v === 'swapped';
    var R = Room(960, 520, 792, 54, 1200);
    // 拱顶（筒拱，轴线平行于后墙）
    rect(g, 0, 0, W, 60, '#1a1618');
    g.beginPath(); g.rect(0, 0, W, 60); texFill(g, q, '#2a2428', CELLAR_STONE, 0, 0, 1, 0.5, 0.7);
    for (var X = -600; X <= W + 600; X += 320) {
      var p0 = [X, 54], dx = X - R.vx, t = -54 / (54 - R.vy);
      fillP(g, [X - 14, 54, X + 14, 54, X + 14 + dx * t * 1.4, 0, X - 14 + dx * t * 1.4, 0], '#3a3236');
      seg(g, X + 14, 54, X + 14 + dx * t * 1.4, 0, 3, lo(0.5)); void p0;
    }
    g.fillStyle = K.lin(g, 0, 0, 0, 60, [lo(0.7), lo(0.2)]); g.fillRect(0, 0, W, 60);
    // 后墙（石）
    g.beginPath(); g.rect(0, 54, W, R.base - 54); texFill(g, q, '#4a4246', CELLAR_STONE);
    if (q.tex >= 2) { g.save(); g.globalCompositeOperation = 'overlay'; g.beginPath(); g.rect(0, 54, W, R.base - 54); texFill(g, q, '#808080', TX.mottle, 0, 0, 1, 1, 0.5); g.restore(); }
    g.fillStyle = K.lin(g, 0, 54, 0, R.base, [lo(0.45), lo(0.05), lo(0.2)]); g.fillRect(0, 54, W, R.base - 54);
    rect(g, 0, 54, W, 8, lo(0.5));
    // 湿痕
    if (q.model >= 1) { var rnd = K.rng(97); for (var wI = 0; wI < M(q, 0, 6, 10); wI++) { var wx = rnd() * W, ww = 30 + rnd() * 60; g.fillStyle = K.lin(g, 0, 60, 0, 60 + 200 + rnd() * 200, ['rgba(10,14,10,0.35)', 'rgba(10,14,10,0)']); g.fillRect(wx, 60, ww, 400); } }
    // 两端楼梯
    var WP = [182, 92, 172, 48], EP = [1546, 92, 196, 48];   // 西牌窄、东牌宽
    stairArch(g, q, R, 100, 340, 340, R.base, -1, {
      inside: function (g2, S) {
        if (swapped) { // 掉在西楼梯台阶上的钢笔
          var p = S(250, 108, 0.94);
          g2.save(); g2.translate(p[0], p[1] - 2); g2.rotate(-0.12);
          rect(g2, -24, -3, 48, 6, '#141418'); rect(g2, 14, -3, 10, 6, '#b08a48'); rect(g2, -10, -4.5, 22, 1.5, '#d8b860'); rect(g2, -24, -3, 48, 1.5, 'rgba(255,255,255,0.25)');
          g2.restore();
        }
      }
    });
    stairArch(g, q, R, 1480, 340, 340, R.base, 1);
    // 铜牌与灰尘轮廓
    plateGhost(g, WP[0], WP[1], WP[2], WP[3]); plateGhost(g, EP[0], EP[1], EP[2], EP[3]);
    if (swapped) {
      // 「东楼梯」挂到了左（西）门：比印子宽、略高；「西楼梯」挂到右（东）门：比印子窄，两边露出干净的印子
      brassPlate(g, q, WP[0] + WP[2] / 2 - EP[2] / 2, WP[1] - 7, EP[2], EP[3], '东楼梯', { rosin: 5 });
      brassPlate(g, q, EP[0] + EP[2] / 2 - WP[2] / 2, EP[1] + 2, WP[2], WP[3], '西楼梯', { rosin: 7 });
    } else {
      brassPlate(g, q, WP[0], WP[1], WP[2], WP[3], '西楼梯');
      brassPlate(g, q, EP[0], EP[1], EP[2], EP[3], '东楼梯');
    }
    // 酒架
    wineRack(g, q, R, 596, 238, 728, R.base);
    // 地面（石板）
    tileFloor(g, q, R, { tile: 120, col: '#4a4448', t: TX.flag, mortar: '#141012', gap: 4, seed: 23, var: 0.12, stagger: true });
    if (q.light >= 1) K.ao(g, 0, R.base - 2, W, 50, 40, 0.5, 't');
    // 积水反光
    if (q.light >= 2) { g.save(); g.globalCompositeOperation = 'lighter'; K.pool(g, 1300, 930, 160, 22, '#ffb060', 0.12); K.pool(g, 700, 1000, 120, 16, '#8090c0', 0.08); g.restore(); }
    // 酒桶
    if (q.model >= 1) { barrel(g, q, 1390, R.base + 60, 64); barrel(g, q, 520, R.base + 40, 54); }
    if (q.model >= 2) barrel(g, q, 1500, R.base + 74, 50);
    // 空酒箱（西楼梯门下）
    crate(g, q, R, 232, 808, 196, 924, { scuff: swapped ? 3 : 0 });
    // 吊灯笼
    lantern(g, q, 960, 104, 88);
    // ---- 光照 ----
    var Lm = [
      { x: 960, y: 220, r: 1150, ry: 820, c: '#ffb868', i: 0.75, fall: 0.3 },
      { x: 960, y: 880, r: 760, ry: 240, c: '#ffb060', i: 0.4, q: 1 },
      { x: 270, y: 420, r: 300, ry: 420, c: '#9aa0c8', i: 0.35 },
      { x: 1650, y: 420, r: 300, ry: 420, c: '#9aa0c8', i: 0.35 },
      { x: 270, y: 116, r: 220, ry: 120, c: '#ffc070', i: 0.45, q: 1 }, { x: 1650, y: 116, r: 220, ry: 120, c: '#ffc070', i: 0.45, q: 1 },
      { x: 330, y: 860, r: 260, ry: 120, c: '#ffb060', i: 0.25, q: 1 }
    ];
    lightMap(g, q, '#3a3440', Lm);
    if (q.light >= 1) K.glow(g, 960, 150, 220, '#ffb050', 0.4);
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = K.rad(g, 960, 148, 2, 26, ['rgba(255,250,220,0.9)', 'rgba(255,190,90,0)']); g.fillRect(930, 118, 60, 60); g.restore();
    if (q.light >= 2) K.motes(g, K.rng(59), 50, 760, 160, 400, 500, '#ffd8a0', 0.3);
    finish(g, q, { vig: 0.62 });
  }
  DM.HDBG.def('cellar', {
    draw: function (g, q, v) { drawCellar(g, q, v); },
    lights: [
      LT(960, 150, 300, '#ffb060', 0.75, 0.25, 'lamp'),
      LT(270, 380, 160, '#8890b8', 0.25, 0, 'glow'), LT(1650, 380, 160, '#8890b8', 0.25, 0, 'glow')
    ],
    key: { x: 0, color: '#ffc080', amb: '#241e28', rim: 0.35 },
    outdoor: false
  });

  /* ================================================================
   * 东翼走廊 / 西翼走廊（镜像）
   * ================================================================ */
  // 东翼走廊：后墙=客房门一侧（门 1/3/5），左侧墙=走廊尽头的高窗（朝海）
  function drawCorridor(g, q, fresh) {
    setKey(-0.7);
    var R = Room(1060, 540, 780, 150, 1300), base = R.base, top = R.top, xc = 472;
    var paper = fresh ? { c1: '#4a2c3a', c2: '#5c3848', seed: 63, age: 0, line: 'rgba(210,180,130,0.2)' } : { c1: '#3e2430', c2: '#4e2e3c', seed: 63, age: 0.5, line: 'rgba(190,160,110,0.15)' };
    var wood = fresh ? TX.oak : TX.walnut, woodC = fresh ? '#5a3a22' : '#3a2214';
    // 天花板（梁向消失点汇聚）
    rect(g, 0, 0, W, top, fresh ? '#4a3a2c' : '#3a2c22');
    g.beginPath(); g.rect(0, 0, W, top); texFill(g, q, '#3a2a1e', fresh ? TX.oakH : TX.walnutH, 0, 0, 1, 1, 0.45);
    for (var bI = 0; bI < 7; bI++) {
      var bx = 560 + bI * 240, dx = bx - R.vx, t = -top / (top - R.vy);
      fillP(g, [bx - 10, top, bx + 10, top, bx + 10 + dx * t, 0, bx - 10 + dx * t, 0], K.shade(woodC, -0.1));
      seg(g, bx + 10, top, bx + 10 + dx * t, 0, 3, lo(0.4));
    }
    g.fillStyle = K.lin(g, 0, 0, 0, top, [lo(0.5), lo(0.1)]); g.fillRect(0, 0, W, top);
    // 后墙
    paperWall(g, q, xc, top, W - xc, base - top, paper);
    cornice(g, q, xc, top, W - xc, woodC, { h: 40, dentil: false });
    wainscot(g, q, [[xc, W]], 620, base, { t: wood, col: woodC, pw: 160 });
    // 左侧墙（透视）+ 高窗
    var dB = R.dB;
    function L(d, Y) { return [R.vx + (xc - R.vx) * d, R.vy + (base - Y - R.vy) * d]; }   // Y = 距地高度（后墙像素）
    var ceilY = base - top, far = L(1, ceilY), near = L(3, ceilY), fb = L(1, 0), nb = L(3, 0);
    K.poly(g, [far[0], far[1], near[0], near[1], nb[0], nb[1], fb[0], fb[1]]);
    texFill(g, q, paper.c1, paperTex(paper.c1, paper.c2, paper.line, paper.seed));
    fillP(g, [far[0], far[1], near[0], near[1], nb[0], nb[1], fb[0], fb[1]], K.lin(g, xc, 0, 0, 0, [lo(0.25), lo(0.55)]));
    // 护墙板（侧墙）
    var w0 = L(1, 160), w1 = L(3, 160);
    fillP(g, [w0[0], w0[1], w1[0], w1[1], nb[0], nb[1], fb[0], fb[1]], K.shade(woodC, -0.25));
    seg(g, w0[0], w0[1], w1[0], w1[1], 4, K.shade(woodC, 0.2));
    // 窗（侧墙上，深度 1.05~1.7）
    var wa = 1.05, wb = 1.7, sill = 176, wtop = 520;
    var A = L(wa, wtop), Bp = L(wb, wtop), C = L(wb, sill), D = L(wa, sill);
    var winPts = [A[0], A[1], Bp[0], Bp[1], C[0], C[1], D[0], D[1]];
    // 窗套
    var A2 = L(wa - 0.04, wtop + 26), B2 = L(wb + 0.07, wtop + 26), C2 = L(wb + 0.07, sill - 30), D2 = L(wa - 0.04, sill - 30);
    K.poly(g, [A2[0], A2[1], B2[0], B2[1], C2[0], C2[1], D2[0], D2[1]]); texFill(g, q, woodC, wood);
    fillP(g, [A2[0], A2[1], B2[0], B2[1], C2[0], C2[1], D2[0], D2[1]], lo(0.25));
    // 窗外（用仿射近似：先在矩形里画再裁剪）
    g.save(); K.poly(g, winPts); g.clip();
    stormView(g, q, Bp[0], Bp[1], D[0] - Bp[0], C[1] - Bp[1], { seed: 31, horizon: 0.6 });
    g.fillStyle = K.lin(g, Bp[0], 0, D[0], 0, ['rgba(190,205,230,0.12)', 'rgba(120,140,170,0.04)']); g.fillRect(Bp[0], Bp[1], D[0] - Bp[0], C[1] - Bp[1]);
    g.restore();
    // 窗格
    var mc = '#2a1a10';
    for (var c = 1; c < 3; c++) { var dd = wa + (wb - wa) * c / 3, p1 = L(dd, wtop), p2 = L(dd, sill); seg(g, p1[0], p1[1], p2[0], p2[1], 6 * dd, mc); }
    for (var r = 1; r < 4; r++) { var hh = sill + (wtop - sill) * r / 4, p3 = L(wa, hh), p4 = L(wb, hh); seg(g, p3[0], p3[1], p4[0], p4[1], 5, mc); }
    K.poly(g, winPts); g.lineWidth = 9; g.strokeStyle = mc; g.stroke();
    // 窗帘（侧墙，近端）
    if (q.model >= 1) {
      var cu0 = L(wb + 0.02, wtop + 40), cu1 = L(wb + 0.28, wtop + 40), cu2 = L(wb + 0.28, 0), cu3 = L(wb + 0.02, 0);
      K.poly(g, [cu0[0], cu0[1], cu1[0], cu1[1], cu2[0], cu2[1], cu3[0], cu3[1]]); texFill(g, q, '#4a1424', TX.velvet);
      var nf = M(q, 0, 4, 6);
      for (var f = 0; f < nf; f++) { var fd = wb + 0.02 + 0.26 * (f + 0.5) / nf, fa = L(fd, wtop + 40), fb2 = L(fd, 0); seg(g, fa[0], fa[1], fb2[0], fb2[1], 8 * fd, lo(0.35)); seg(g, fa[0] + 6, fa[1], fb2[0] + 6, fb2[1], 3 * fd, hi(0.08)); }
    }
    // 墙角线
    seg(g, xc, top, xc, base, 3, lo(0.5));
    // 画（后墙左侧）
    frame(g, q, 528, 248, 144, 128, function (g2, q2, x, y, w, h) { paintPortrait(g2, q2, x, y, w, h, { seed: 21 }); }, { fw: 14 });
    // 门 1/3/5
    var doors = [[790, 1], [1174, 3], [1582, 5]], plates = [];
    for (var di = 0; di < 3; di++) {
      var dx0 = doors[di][0];
      door(g, q, R, dx0, 352, 172, base - 352, { t: wood, col: fresh ? '#5a3820' : '#4a2a18', knob: 'r', panels: 3, frameW: 18 });
      plates.push([dx0 + 86, 352 + (base - 352) * 0.17]);
      // 门牌底板（文字之后单独画，以便镜像时不反转）
      g.fillStyle = metalGrad(g, dx0 + 68, 0, dx0 + 104, 0, '#b08a48'); K.rr(g, dx0 + 68, plates[di][1] - 15, 36, 30, 4); g.fill();
      g.strokeStyle = lo(0.5); g.lineWidth = 1.2; g.stroke();
    }
    // 吊灯（玻璃灯罩）
    var pl = [1272, 96];
    seg(g, pl[0], 0, pl[0], pl[1] - 24, 2, '#2a2a2e');
    g.fillStyle = metalGrad(g, pl[0] - 10, 0, pl[0] + 10, 0, '#9a7a3a'); K.rr(g, pl[0] - 9, pl[1] - 30, 18, 10, 3); g.fill();
    g.fillStyle = K.rad(g, pl[0] - 6, pl[1] - 6, 2, 30, ['#fff6e0', '#f0d8b0', '#b89a70']); K.ellipse(g, pl[0], pl[1], 26, 22); g.fill();
    // 壁灯
    var sx = [1076, 1468];
    for (var sI = 0; sI < sx.length; sI++) sconce(g, q, sx[sI], 420, { scale: 0.8, shade: fresh ? '#e8d0a8' : '#d8b48a' });
    // 地面
    plankFloor(g, q, R, { pw: 60, seed: fresh ? 37 : 35, far: fresh ? '#3a2614' : '#2a1a0e', near: fresh ? '#6a4a2c' : '#4e3220', t: fresh ? TX.floorO : TX.floorW });
    if (q.light >= 1) K.ao(g, xc, base - 2, W - xc, 40, 30, 0.4, 't');
    // 侧墙与地面的交线
    seg(g, fb[0], fb[1], nb[0], nb[1], 3, lo(0.5));
    // 长走廊地毯（平行于后墙）
    var rq = floorQuad(R, -800, 3000, 1.18, 1.62);
    K.poly(g, rq); texFill(g, q, '#5a1420', ['carpet', { c1: '#3a0c16', c2: '#5c1624', c3: 'rgba(201,162,90,0.3)', seed: 67 }, 120]);
    var re = floorQuad(R, -800, 3000, 1.2, 1.6); K.poly(g, re); g.lineWidth = 3; g.strokeStyle = 'rgba(200,160,90,0.45)'; g.stroke();
    if (q.light >= 1) softPoly(g, floorQuad(R, -800, 3000, 1.62, 1.66), 0.3, 2, 0.005, R.vx, 900);
    // 窗光落在地上
    var fl0 = R.fp(xc, wa), fl1 = R.fp(xc, wb);
    var patch = [fl0[0], fl0[1], fl1[0], fl1[1], fl1[0] + 520, fl1[1] + 40, fl0[0] + 360, fl0[1] + 18];
    // ---- 光照 ----
    var Lm = [
      { lin: [0, 0, W, 0], stops: [[0, 'rgba(110,120,160,0.35)'], [0.4, 'rgba(60,60,80,0.1)'], [1, 'rgba(50,40,40,0.15)']] },
      { x: 260, y: 380, r: 640, ry: 620, c: '#a8b8e0', i: 0.6, fall: 0.3 },
      { pts: patch, c: '#a0b0e0', i: 0.45, fx0: fl0[0], fy0: fl0[1], fx1: fl0[0] + 560, fy1: fl0[1] + 40, q: 1 },
      { x: sx[0], y: 400, r: 260, ry: 360, c: '#ffc080', i: 0.5 }, { x: sx[1], y: 400, r: 260, ry: 360, c: '#ffc080', i: 0.5 },
      { x: sx[0], y: 860, r: 300, ry: 110, c: '#ffc080', i: 0.2, q: 1 }, { x: sx[1], y: 860, r: 300, ry: 110, c: '#ffc080', i: 0.2, q: 1 },
      { x: 1820, y: 500, r: 300, ry: 400, c: '#806070', i: 0.12, q: 2 },
      { x: pl[0], y: 120, r: 520, ry: 380, c: '#ffd8a0', i: 0.4 }, { x: pl[0], y: 880, r: 520, ry: 160, c: '#ffd0a0', i: 0.2, q: 1 }
    ];
    lightMap(g, q, fresh ? '#46404e' : '#3e3848', Lm);
    shaft(g, q, [A[0], A[1], D[0], D[1], fl0[0] + 360, fl0[1] + 18, fl1[0] + 520, fl1[1] + 40, Bp[0], Bp[1]], '#b8c8f0', 0.08, 200, 300, 700, 900);
    if (q.light >= 2) K.motes(g, K.rng(61), 50, 200, 300, 500, 500, '#d8e0ff', 0.3);
    for (var gI = 0; gI < sx.length; gI++) sconceGlow(g, q, sx[gI], 420, { scale: 0.8 });
    if (q.light >= 1) K.glow(g, pl[0], pl[1], 110, '#ffd090', 0.35);
    finish(g, q, { vig: 0.55 });
    return plates;
  }
  function corridorPlates(g, q, plates, nums, mirror) {
    for (var i = 0; i < plates.length; i++) {
      var x = mirror ? W - plates[i][0] : plates[i][0];
      K.text(g, nums[i], x, plates[i][1] + 1, 19, '#2a1806', { weight: 'bold', font: 'Georgia,"Times New Roman",serif' });
    }
  }
  DM.HDBG.def('east_corridor', {
    draw: function (g, q) { var pl = drawCorridor(g, q, false); corridorPlates(g, q, pl, ['1', '3', '5'], false); },
    lights: [LT(260, 380, 260, '#a8b8e0', 0.5, 0, 'window'), LT(1076, 400, 110, '#ffc070', 0.5, 0.03, 'lamp'), LT(1468, 400, 110, '#ffc070', 0.5, 0.03, 'lamp'), LT(1272, 96, 120, '#ffd8a0', 0.45, 0.02, 'lamp')],
    key: { x: -0.7, color: '#c0ccf0', amb: '#2c2a3a', rim: 0.6 },
    outdoor: false
  });
  DM.HDBG.def('west_corridor', {
    draw: function (g, q) {
      g.save(); g.translate(W, 0); g.scale(-1, 1); var pl = drawCorridor(g, q, true); g.restore();
      corridorPlates(g, q, pl, ['1', '3', '5'], true);
    },
    lights: [LT(W - 260, 380, 260, '#a8b8e0', 0.5, 0, 'window'), LT(W - 1076, 400, 110, '#ffc070', 0.5, 0.03, 'lamp'), LT(W - 1468, 400, 110, '#ffc070', 0.5, 0.03, 'lamp'), LT(W - 1272, 96, 120, '#ffd8a0', 0.45, 0.02, 'lamp')],
    key: { x: 0.7, color: '#c0ccf0', amb: '#2e2c3c', rim: 0.6 },
    outdoor: false
  });


  /* ================================================================
   * 客房 east_room（+ burnt）/ west_room（左右镜像、新装修）
   * ================================================================ */
  function lightSwitch(g, q, x, y, w, h, burnt) {
    if (q.light >= 1) softRect(g, x + (KX < 0 ? 4 : -4), y + 4, w, h, 4, 0.45);
    g.fillStyle = burnt ? '#2a2420' : metalGrad(g, x, y, x + w, y + h, '#b08a48'); K.rr(g, x, y, w, h, 3); g.fill();
    bevel(g, x, y, w, h, 2.5, 0.3, 0.5);
    circle(g, x + w / 2, y + 6, 1.6, '#4a3410'); circle(g, x + w / 2, y + h - 6, 1.6, '#4a3410');
    // 拨动开关（象牙色）
    var cx = x + w / 2, cy = y + h / 2;
    ell(g, cx, cy, 6, 6, burnt ? '#141010' : '#3a2a10');
    g.fillStyle = burnt ? '#3a3430' : K.lin(g, cx - 4, 0, cx + 4, 0, ['#c8bea8', '#f6efe0', '#bcb29a']); K.rr(g, cx - 3.5, cy - 14, 7, 15, 3); g.fill();
  }
  function wardrobe(g, q, R, x, y, w, by, o) {
    o = o || {};
    var col = o.col || '#3e2414', t = o.t || TX.walnut, k = R.kWall(by) * 0.995;
    if (q.light >= 1) K.contact(g, x + w / 2, by, w * 0.6, 10, 0.6);
    box(g, q, R, x, y + 30, w, by - y - 30, k, { col: col, t: t });
    box(g, q, R, x - 10, y, w + 20, 32, k * 0.99, { col: K.shade(col, 0.1), t: t });
    bands(g, x - 10, y + 32, w + 20, [[3, lo(0.5)], [5, K.shade(col, 0.05)], [2, hi(0.15)]]);
    var dh = (by - y) * 0.68, dw = (w - 30) / 2;
    for (var d = 0; d < 2; d++) {
      var dx = x + 10 + d * (dw + 10);
      groove(g, dx, y + 50, dw, dh, 3, 0.45);
      if (q.model >= 1) { bevel(g, dx + 12, y + 66, dw - 24, dh * 0.42, 7, 0.12, 0.3); bevel(g, dx + 12, y + 74 + dh * 0.45, dw - 24, dh * 0.42, 7, 0.12, 0.3); }
      var hx = d ? dx + 8 : dx + dw - 12;
      g.fillStyle = metalGrad(g, hx, 0, hx + 5, 0, '#b08a48'); K.rr(g, hx, y + 50 + dh * 0.45, 5, 30, 2); g.fill();
    }
    groove(g, x + 10, y + 64 + dh, w - 20, by - y - dh - 90, 3, 0.4);
    if (o.open) { // 烧毁版：一扇门半开
      fillP(g, [x + 10, y + 50, x - 40, y + 70, x - 40, y + 50 + dh + 10, x + 10, y + 50 + dh], '#1a120c');
    }
  }
  function cheval(g, q, R, x, y, w, by, o) {
    o = o || {};
    var col = o.col || '#3e2414', t = o.t || TX.walnut;
    if (q.light >= 1) K.contact(g, x + w / 2, by, w * 0.7, 9, 0.6);
    // 立柱 + 脚
    for (var s2 = 0; s2 < 2; s2++) {
      var px = s2 ? x + w - 16 : x;
      g.beginPath(); g.rect(px, y + 30, 16, by - y - 34); texFill(g, q, col, t); rect(g, px, y + 30, 16, by - y - 34, cylGrad(g, px, 16, 'rgba(128,128,128,0)'));
      g.fillStyle = cylGrad(g, px, 16, K.shade(col, 0.1)); g.fillRect(px, y + 30, 16, by - y - 34);
      ell(g, px + 8, y + 28, 9, 6, '#b08a48');
      g.beginPath(); g.moveTo(px - 26, by); g.quadraticCurveTo(px + 8, by - 30, px + 42, by); stroke(g, 8, K.shade(col, -0.1));
    }
    // 镜框（拱顶）
    var mx = x + 20, mw = w - 40, my = y + 20, mh = by - y - 110;
    function mpath(e) { g.beginPath(); g.moveTo(mx - e, my + mh + e); g.lineTo(mx - e, my + mw / 2); g.arc(mx + mw / 2, my + mw / 2, mw / 2 + e, PI, 0); g.lineTo(mx + mw + e, my + mh + e); g.closePath(); }
    mpath(10); texFill(g, q, col, t); mpath(10); g.fillStyle = K.lin(g, mx - 10, 0, mx + mw + 10, 0, [hi(0.12), lo(0.1), lo(0.35)]); g.fill();
    mpath(0); g.fillStyle = '#20222a'; g.fill();
    g.save(); mpath(0); g.clip();
    if (o.glass) o.glass(g, mx, my, mw, mh);
    else {
      // 倒影：昏暗的房间、窗光
      g.fillStyle = K.lin(g, 0, my, 0, my + mh, ['#3a3440', '#4a3a44', '#2a2028', '#3a2a22']); g.fillRect(mx, my, mw, mh);
      rect(g, mx + mw * 0.1, my + mh * 0.2, mw * 0.3, mh * 0.25, 'rgba(150,165,200,0.55)'); rect(g, mx + mw * 0.24, my + mh * 0.2, 3, mh * 0.25, 'rgba(40,30,30,0.6)');
      rect(g, mx, my + mh * 0.7, mw, mh * 0.3, 'rgba(60,30,30,0.5)');
      K.blob(g, mx + mw * 0.8, my + mh * 0.55, mw * 0.4, '#ffb070', 0.2);
    }
    if (q.light >= 1) { g.save(); g.globalCompositeOperation = 'lighter'; fillP(g, [mx + mw * 0.15, my + mh, mx + mw * 0.4, my + mh, mx + mw * 0.85, my, mx + mw * 0.6, my], 'rgba(200,215,240,0.1)'); fillP(g, [mx + mw * 0.5, my + mh, mx + mw * 0.58, my + mh, mx + mw, my + mh * 0.3, mx + mw, my + mh * 0.15], 'rgba(200,215,240,0.06)'); g.restore(); }
    if (o.crack) o.crack(g, mx, my, mw, mh);
    g.restore();
    mpath(0); g.lineWidth = 3; g.strokeStyle = lo(0.5); g.stroke();
    if (q.model >= 1) { circle(g, x + 8, my + mh * 0.45, 7, '#b08a48'); circle(g, x + w - 8, my + mh * 0.45, 7, '#b08a48'); }
  }
  // 洗脸架（大理石台面 + 瓷盆 + 水壶）
  function washstand(g, q, R, x, y, w, by, burnt) {
    var k = R.kWall(by), top = y;
    if (q.light >= 1) K.contact(g, x + w / 2, by, w * 0.6, 8, 0.55);
    for (var l = 0; l < 2; l++) cyl(g, l ? x + w - 14 : x + 4, top + 18, 10, by - top - 18, burnt ? '#1a1410' : '#4a2c18');
    rect(g, x + 8, by - 60, w - 16, 8, burnt ? '#1a1410' : '#4a2c18');
    box(g, q, R, x, top, w, 18, k, { col: burnt ? '#3a3634' : '#bab4b0', t: TX.marbleW, topHi: 0.25 });
    if (burnt) { fillP(g, [x, top, x + w, top, x + w, top + 18, x, top + 18], 'rgba(10,8,6,0.6)'); return; }
    // 瓷盆
    var bx = x + w * 0.45, bt = top - 2;
    g.fillStyle = K.lin(g, 0, bt - 22, 0, bt, ['#f4f2ee', '#c8c4be']); g.beginPath(); g.moveTo(bx - 40, bt - 20); g.quadraticCurveTo(bx - 36, bt, bx, bt); g.quadraticCurveTo(bx + 36, bt, bx + 40, bt - 20); g.closePath(); g.fill();
    ell(g, bx, bt - 20, 40, 7, '#f8f6f2'); ell(g, bx, bt - 19, 33, 5, '#bcc6d4');
    if (q.model >= 1) { g.beginPath(); g.arc(bx, bt - 12, 30, 0.2, PI - 0.2); stroke(g, 1.2, 'rgba(60,90,150,0.5)'); }
    // 水壶
    var jx = x + w * 0.82, jb = top - 2;
    g.fillStyle = K.lin(g, jx - 14, 0, jx + 14, 0, ['#c8c4be', '#f6f4f0', '#b8b4ae']);
    g.beginPath(); g.moveTo(jx - 10, jb); g.bezierCurveTo(jx - 18, jb - 20, jx - 6, jb - 36, jx - 8, jb - 48); g.lineTo(jx + 6, jb - 50); g.bezierCurveTo(jx + 6, jb - 36, jx + 18, jb - 20, jx + 10, jb); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(jx + 8, jb - 44); g.quadraticCurveTo(jx + 26, jb - 36, jx + 12, jb - 16); stroke(g, 3, '#d8d4ce');
    if (q.model >= 1) { rect(g, x + 8, top - 12, 30, 10, '#e8e2d8'); rect(g, x + 8, top - 12, 30, 2, hi(0.4)); }
  }
  // 床（床头在右端）。burnt：烧塌
  function guestBed(g, q, R, x, w, by, o) {
    o = o || {};
    var k = 0.775, matY = by - 162, legH = 22, frameC = o.burnt ? '#2a2420' : (o.frameC || '#3e2414'), t = o.burnt ? null : (o.t || TX.walnut);
    var quilt = o.quilt || '#5a2034';
    var x1 = x + w;
    var hbF = [x1, by - 352], hbB = R.p(x1, by - 352, k), hbFB = [x1, by], hbBB = R.p(x1, by, k);
    if (q.light >= 1) K.contact(g, x + w / 2, by + 4, w * 0.56, 16, 0.65);
    if (q.light >= 2 && !o.burnt) { var sh = KX < 0 ? 1 : -1; fillP(g, [x + 20, by, x1 - 20, by, x1 - 20 + sh * 90, by + 34, x + 20 + sh * 90, by + 34], lo(0.22)); }
    // 床头板（右端，内侧面可见）：木框 + 软包
    var hbTop = o.burnt ? 80 : 0;
    function hbPath(inset) {
      var f0 = R.p(x1, by - 352 + hbTop + inset, 1 - (1 - k) * (inset / 60)), b0 = R.p(x1, by - 352 + hbTop + inset, k + (1 - k) * (inset / 60));
      var f1 = R.p(x1, by - 40 - inset, 1 - (1 - k) * (inset / 60)), b1 = R.p(x1, by - 40 - inset, k + (1 - k) * (inset / 60));
      g.beginPath(); g.moveTo(f0[0], f0[1]); g.quadraticCurveTo((f0[0] + b0[0]) / 2, Math.min(f0[1], b0[1]) - (o.burnt ? 0 : 36), b0[0], b0[1]); g.lineTo(b1[0], b1[1]); g.lineTo(f1[0], f1[1]); g.closePath();
    }
    hbPath(0); texFill(g, q, frameC, t); hbPath(0); g.fillStyle = K.lin(g, hbB[0], 0, hbF[0], 0, [lo(0.35), hi(0.04)]); g.fill();
    if (!o.burnt) {
      hbPath(16); texFill(g, q, quilt, TX.velvet); hbPath(16); g.fillStyle = K.lin(g, hbB[0], 0, hbF[0], 0, [lo(0.4), hi(0.12)]); g.fill();
      if (q.model >= 1) for (var ti = 0; ti < 3; ti++) for (var tj = 0; tj < 3; tj++) { var tp = R.p(x1, by - 300 + tj * 70, 1 - (1 - k) * (0.25 + ti * 0.25)); circle(g, tp[0], tp[1], 3, K.shade(quilt, -0.5)); }
      hbPath(0); g.lineWidth = 3; g.strokeStyle = K.shade(frameC, 0.25); g.stroke();
      g.fillStyle = cylGrad(g, x1 - 10, 20, frameC); g.fillRect(x1 - 10, by - 372, 20, 372); circle(g, x1, by - 378, 12, '#b08a48');
    } else {
      var rb = K.rng(11); g.beginPath(); g.moveTo(hbF[0], hbF[1] + hbTop);
      for (var j = 1; j <= 10; j++) { var u = j / 10, px = lerp(hbF[0], hbB[0], u), py = lerp(hbF[1] + hbTop, hbB[1] + hbTop * k, u) + (j % 2 ? 26 : 0) * rb(); g.lineTo(px, py); }
      stroke(g, 3, '#5a3a24');
    }
    // 床垫顶面
    var mt0 = R.p(x, matY, k), mt1 = R.p(x1, matY, k);
    if (!o.burnt) {
      // 床单（白）露在床头
      K.poly(g, [x, matY, x1, matY, mt1[0], mt1[1], mt0[0], mt0[1]]); texFill(g, q, quilt, ['fabric', { c1: K.shade(quilt, -0.3), c2: quilt, threads: 50, seed: 57 }, 70]);
      K.poly(g, [x, matY, x1, matY, mt1[0], mt1[1], mt0[0], mt0[1]]); g.fillStyle = K.lin(g, 0, mt0[1], 0, matY, [lo(0.25), hi(0.1)]); g.fill();
      // 翻折的白被单 + 枕头（右端）
      var sx0 = x1 - 300, st0 = R.p(sx0, matY, k), st1 = R.p(sx0 + 40, matY, k);
      fillP(g, [sx0, matY - 2, x1, matY - 2, mt1[0], mt1[1] - 2, st0[0], st0[1] - 2], '#e8e4dc');
      fillP(g, [sx0, matY - 2, sx0 + 40, matY - 2, st1[0], st1[1], st0[0], st0[1]], K.lin(g, sx0, 0, sx0 + 40, 0, ['#c8c2b8', '#f4f0e8']));
      for (var pI = 0; pI < 2; pI++) {
        var pk = 1 - (1 - k) * (0.28 + pI * 0.45), pc = R.p(x1 - 120, matY - 14, pk);
        g.fillStyle = K.rad(g, pc[0] - 30, pc[1] - 16, 4, 110, ['#ffffff', '#e4e0d8', '#a8a49c']);
        K.rr(g, pc[0] - 92, pc[1] - 30, 180, 46, 20); g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 1.5; g.stroke();
      }
      // 正面垂下的床罩 + 褶皱
      g.beginPath(); g.moveTo(x - 6, matY); g.lineTo(x1 + 2, matY); g.lineTo(x1 + 2, by - legH);
      var nf = M(q, 6, 10, 16), rnd = K.rng(17);
      for (var f = nf; f >= 0; f--) g.lineTo(x - 6 + (w + 8) * f / nf, by - legH + (f % 2 ? 4 : 0) + rnd() * 3);
      g.closePath(); texFill(g, q, quilt, ['fabric', { c1: K.shade(quilt, -0.3), c2: quilt, threads: 50, seed: 57 }, 70]);
      g.save(); g.clip();
      for (var f2 = 0; f2 < nf; f2++) { var fx = x - 6 + (w + 8) * f2 / nf, fw = (w + 8) / nf; g.fillStyle = K.lin(g, fx, 0, fx + fw, 0, [[0, lo(0.25)], [0.4, hi(0.06)], [0.7, lo(0.05)], [1, lo(0.25)]]); g.fillRect(fx, matY + 20, fw, by); }
      g.fillStyle = K.lin(g, 0, matY, 0, by, [hi(0.12), lo(0.05), lo(0.45)]); g.fillRect(x - 10, matY, w + 20, by - matY);
      g.restore();
      rect(g, x - 6, matY, w + 8, 3, hi(0.25));
      if (q.model >= 1) { rect(g, x - 6, matY + 24, w + 8, 4, K.rgba('#c9a25a', 0.35)); }
      // 床腿
      cyl(g, x + 6, by - legH, 16, legH, frameC); cyl(g, x1 - 26, by - legH, 16, legH, frameC);
    } else {
      // 烧塌：焦黑床架、下陷的床垫、弹簧、尸体轮廓（盖着焦布）
      var sag = 46, rnd2 = K.rng(23);
      g.beginPath(); g.moveTo(x, matY + 30); g.quadraticCurveTo(x + w * 0.5, matY + 30 + sag, x1, matY + 10); g.lineTo(mt1[0], mt1[1] + 10); g.quadraticCurveTo((mt0[0] + mt1[0]) / 2, mt0[1] + sag * 0.6, mt0[0], mt0[1] + 30); g.closePath();
      g.fillStyle = '#3a3430'; g.fill();
      if (q.tex >= 1) { g.save(); g.clip(); for (var a = 0; a < 80; a++) circle(g, x + rnd2() * w, mt0[1] + rnd2() * (matY - mt0[1] + 70), 2 + rnd2() * 8, rnd2() < 0.5 ? 'rgba(70,64,58,0.5)' : 'rgba(8,6,6,0.6)'); g.restore(); }
      // 尸体轮廓（侧卧，面朝墙）
      var bx0 = x + w * 0.42, by0 = matY + 16;
      g.beginPath(); g.moveTo(bx0, by0 + 26); g.bezierCurveTo(bx0 + 40, by0 - 6, bx0 + 160, by0 - 18, bx0 + 240, by0 - 8);
      g.bezierCurveTo(bx0 + 290, by0 - 30, bx0 + 340, by0 - 34, bx0 + 360, by0 - 10); g.bezierCurveTo(bx0 + 370, by0 + 10, bx0 + 330, by0 + 22, bx0 + 300, by0 + 18); g.lineTo(bx0 + 40, by0 + 34); g.closePath();
      g.fillStyle = K.lin(g, 0, by0 - 30, 0, by0 + 30, ['#4a403a', '#141010']); g.fill();
      g.beginPath(); g.moveTo(bx0 + 20, by0 + 20); g.bezierCurveTo(bx0 + 120, by0, bx0 + 220, by0 - 6, bx0 + 300, by0 - 4); stroke(g, 1.5, 'rgba(120,100,80,0.3)');
      // 弹簧
      for (var sp = 0; sp < M(q, 5, 9, 14); sp++) { var sx2 = x + 30 + sp * (w * 0.4 / M(q, 5, 9, 14)), sy2 = matY + 34 + Math.sin(sp) * 6; for (var c = 0; c < 3; c++) { K.ellipse(g, sx2, sy2 - c * 6, 9, 3); stroke(g, 1.4, '#6a6060'); } }
      // 焦黑的侧板（断裂）
      fillP(g, [x - 4, matY + 34, x + w * 0.45, matY + 70, x + w * 0.5, matY + 60, x1, matY + 26, x1, by - 40, x + w * 0.5, by - 16, x - 4, by - 30], '#24201c');
      seg(g, x - 4, matY + 34, x + w * 0.45, matY + 70, 2, 'rgba(150,140,130,0.5)'); seg(g, x + w * 0.5, matY + 60, x1, matY + 26, 2, 'rgba(150,140,130,0.5)');
      for (var cI = 0; cI < M(q, 10, 24, 40); cI++) { var cx3 = x + rnd2() * w, cy3 = matY + 40 + rnd2() * (by - matY - 70); seg(g, cx3, cy3, cx3 + 10 + rnd2() * 16, cy3 + rnd2() * 4, 1.5, rnd2() < 0.2 ? 'rgba(140,60,20,0.6)' : 'rgba(60,50,46,0.6)'); }
      // 余烬
      g.save(); g.globalCompositeOperation = 'lighter';
      for (var e = 0; e < M(q, 4, 10, 16); e++) circle(g, x + rnd2() * w, matY + 30 + rnd2() * 60, 1 + rnd2() * 1.6, 'rgba(255,120,40,0.7)');
      g.restore();
      cyl(g, x + 6, by - 40, 14, 40, '#100c0a'); cyl(g, x1 - 26, by - 40, 14, 40, '#100c0a');
    }
    // 床尾板（左端外侧面）
    var fbH = o.burnt ? 150 : 230, ft = R.p(x, by - fbH, k), fbb = R.p(x, by, k);
    g.beginPath(); g.moveTo(x, by - fbH); g.lineTo(ft[0], ft[1]); g.lineTo(fbb[0], fbb[1]); g.lineTo(x, by); g.closePath();
    texFill(g, q, frameC, t); g.fillStyle = K.lin(g, ft[0], 0, x, 0, [lo(0.1), lo(0.4)]); g.fill();
    g.beginPath(); g.moveTo(x, by - fbH); g.lineTo(ft[0], ft[1]); stroke(g, 6, K.shade(frameC, 0.15));
    cyl(g, x - 8, by - fbH - 14, 16, fbH + 14, frameC); circle(g, x, by - fbH - 18, 10, o.burnt ? '#1a1410' : '#b08a48');
  }
  // 书桌 + 椅子 + 台灯 + 乌鸦书挡
  function writingDesk(g, q, R, x, w, ty, by, o) {
    o = o || {};
    var col = o.burnt ? '#1e1814' : (o.col || '#4a2a16'), t = o.burnt ? null : (o.t || TX.walnut), k = R.kWall(by);
    if (q.light >= 1) K.contact(g, x + w / 2, by, w * 0.55, 10, 0.6);
    // 桌腿
    for (var l = 0; l < 2; l++) cyl(g, l ? x + w - 22 : x + 6, ty + 40, 16, by - ty - 40, col);
    box(g, q, R, x, ty, w, 40, k, { col: col, t: o.burnt ? null : (o.tH || TX.walnutH), topHi: 0.2 });
    for (var d = 0; d < 2; d++) { groove(g, x + 20 + d * (w / 2), ty + 8, w / 2 - 40, 24, 2.5, 0.45); circle(g, x + w / 4 + d * (w / 2), ty + 20, 3, o.burnt ? '#2a2420' : '#b08a48'); }
    var top = ty - 2;
    if (!o.burnt) {
      // 书 + 乌鸦书挡
      var bx = x + 40;
      for (var b2 = 0; b2 < 2; b2++) {
        var cx = bx + b2 * 150;
        g.fillStyle = metalGrad(g, cx - 14, 0, cx + 14, 0, '#6a4e2a'); g.fillRect(cx - 14, top - 10, 28, 10);
        crowShape(g, cx + (b2 ? 8 : -8), top - 10, 0.32, b2 ? -1 : 1); g.fillStyle = metalGrad(g, cx - 30, 0, cx + 30, 0, '#5a4226'); g.fill();
      }
      bookRow(g, q, bx + 18, top, 112, 60, K.rng(29), {});
      // 墨水瓶、纸
      fillP(g, [x + 230, top, x + 330, top, x + 320, top - 6, x + 240, top - 6], '#e8e0cc');
      g.fillStyle = cylGrad(g, x + 250, 14, '#1a1a2a'); g.fillRect(x + 250, top - 18, 14, 16);
      // 台灯
      tableLamp(g, q, x + w - 50, top, 110, { shade: o.shade || '#2a5a3a', base: '#8a6a30', w: 60 });
    } else {
      // 烧过：倒下的台灯、灰
      seg(g, x + w - 80, top - 6, x + w - 10, top - 14, 6, '#2a2420');
      for (var a = 0; a < 20; a++) circle(g, x + 20 + a * 16, top - 2, 2 + (a % 3), 'rgba(60,56,52,0.6)');
    }
    // 椅子（背对镜头，拉开）
    var cx2 = x + w * 0.42, cy = ty + 30, cw = 110;
    var chairC = o.burnt ? '#1a1410' : col;
    for (var cl = 0; cl < 2; cl++) cyl(g, cx2 + cl * (cw - 14), cy + 90, 12, by + 40 - cy - 90, chairC);
    box(g, q, R, cx2 - 6, cy + 76, cw + 12, 18, 0.9, { col: o.burnt ? '#2a2420' : (o.up || '#5a2034'), t: o.burnt ? null : TX.velvet });
    g.beginPath(); g.moveTo(cx2, cy + 80); g.lineTo(cx2, cy - 40); g.quadraticCurveTo(cx2 + cw / 2, cy - 64, cx2 + cw, cy - 40); g.lineTo(cx2 + cw, cy + 80); g.lineTo(cx2 + cw - 14, cy + 80); g.lineTo(cx2 + cw - 14, cy - 30); g.quadraticCurveTo(cx2 + cw / 2, cy - 48, cx2 + 14, cy - 30); g.lineTo(cx2 + 14, cy + 80); g.closePath();
    texFill(g, q, chairC, t); g.fillStyle = K.lin(g, cx2, 0, cx2 + cw, 0, [hi(0.1), lo(0.3)]); g.fill();
    if (q.model >= 1) { rect(g, cx2 + cw / 2 - 12, cy - 36, 24, 112, chairC); rect(g, cx2 + cw / 2 - 12, cy - 36, 24, 112, lo(0.25)); }
    return { lamp: [x + w - 50, top - 110] };
  }
  function guestRoom(g, q, o) {
    o = o || {};
    var burnt = !!o.burnt, fresh = !!o.fresh;
    setKey(0.3);
    var R = Room(960, 540, 776, 40, 1400);
    var paper = fresh ? { c1: '#56384a', c2: '#684456', seed: 65, age: 0, line: 'rgba(220,190,140,0.22)' } : { c1: '#4a3040', c2: '#5a3a4c', seed: 65, age: 0.45, line: 'rgba(200,170,120,0.18)' };
    if (burnt) paper = { c1: '#3a302e', c2: '#443836', seed: 65, age: 0.8, line: null };
    var wood = fresh ? TX.oak : TX.walnut, woodC = burnt ? '#1e1612' : (fresh ? '#5a3a22' : '#3e2414');
    ceilingStrip(g, q, R, { col: burnt ? '#0e0c0c' : '#2a1c14', t: fresh ? TX.oakH : TX.walnutH, step: 280 });
    paperWall(g, q, 0, 40, W, R.base - 40, paper);
    var cb = cornice(g, q, 0, 40, W, woodC, { h: 40 });
    wainscot(g, q, [[0, W]], 616, R.base, { t: burnt ? null : wood, col: woodC, pw: 160 });
    void cb;
    if (burnt) {
      // 熏黑的墙：从床升起的焰形煤烟（只作用于墙面，家具之后再画）
      var rb = K.rng(51);
      for (var i = 0; i < M(q, 6, 10, 16); i++) {
        var cx = 1300 + rb() * 520, w0 = 140 + rb() * 200;
        g.beginPath(); g.moveTo(cx - w0, R.base); g.bezierCurveTo(cx - w0 * 0.8, 500, cx - w0 * 0.3 + rb() * 60, 300, cx + rb() * 80 - 40, 0); g.bezierCurveTo(cx + w0 * 0.3, 300, cx + w0 * 0.9, 500, cx + w0, R.base); g.closePath();
        g.fillStyle = K.lin(g, 0, 0, 0, R.base, ['rgba(6,4,4,0.45)', 'rgba(10,6,4,0.28)', 'rgba(20,10,6,0.15)']); g.fill();
      }
      g.fillStyle = K.rad(g, 1500, 640, 40, 760, ['rgba(4,3,3,0.55)', 'rgba(8,6,5,0.25)', 'rgba(0,0,0,0)']); g.fillRect(0, 0, W, R.base);
      // 窗口上方的熏痕
      g.fillStyle = K.lin(g, 0, 60, 0, 200, ['rgba(4,3,3,0.6)', 'rgba(4,3,3,0)']); g.fillRect(1000, 40, 420, 200);
      // 卷起剥落的壁纸
      for (var p2 = 0; p2 < M(q, 2, 5, 8); p2++) {
        var px = 1150 + rb() * 650, py = 160 + rb() * 280;
        g.beginPath(); g.moveTo(px, py); g.lineTo(px + 46, py); g.quadraticCurveTo(px + 52, py + 50, px + 30 + rb() * 20, py + 80); g.quadraticCurveTo(px + 10, py + 60, px, py); g.closePath();
        g.fillStyle = K.lin(g, px, 0, px + 50, 0, ['#4a3c34', '#2a221e']); g.fill(); seg(g, px + 46, py, px + 36, py + 78, 1.5, 'rgba(120,100,80,0.4)');
      }
      // 墙面龟裂
      g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 1.5;
      for (var ck = 0; ck < M(q, 2, 4, 7); ck++) { var kx = 1200 + rb() * 600, ky = 100 + rb() * 300; g.beginPath(); g.moveTo(kx, ky); for (var kk = 0; kk < 5; kk++) { kx += rb() * 30 - 10; ky += 20 + rb() * 20; g.lineTo(kx, ky); } g.stroke(); }
    }
    // 门（左）+ 开关（门右侧）
    door(g, q, R, 78, 334, 196, R.base - 334, { t: burnt ? null : wood, col: burnt ? '#1e1410' : (fresh ? '#5a3820' : '#4a2a18'), knob: 'r', panels: 3, frameW: 18 });
    lightSwitch(g, q, 316, 476, 32, 50, burnt);
    // 窗
    var view = burnt ? null : undefined;
    windowFront(g, q, R, 1090, 166, 236, 214, {
      cols: 2, rows: 2, seed: fresh ? 37 : 33, horizon: 0.62, view: view,
      broken: burnt ? function (g2, gx, gy, gw, gh) {
        var rb = K.rng(41); g2.fillStyle = 'rgba(10,10,14,0.35)'; g2.fillRect(gx, gy, gw, gh);
        for (var i = 0; i < 9; i++) { var sx = gx + rb() * gw, sw = 10 + rb() * 30, top = rb() < 0.5; fillP(g2, top ? [sx, gy, sx + sw, gy, sx + sw * 0.4, gy + 20 + rb() * 50] : [sx, gy + gh, sx + sw, gy + gh, sx + sw * 0.6, gy + gh - 20 - rb() * 40], 'rgba(170,185,210,0.35)'); }
      } : null
    });
    if (!burnt) {
      curtain(g, q, 1040, 124, 96, 330, { col: fresh ? '#6a2a44' : '#5a2034', side: 'l', t: TX.velvet, tie: 0.62, gather: 0.55 });
      curtain(g, q, 1280, 124, 96, 330, { col: fresh ? '#6a2a44' : '#5a2034', side: 'r', t: TX.velvet, tie: 0.62, gather: 0.55 });
      valance(g, q, 1040, 124, 336, fresh ? '#6a2a44' : '#5a2034', { t: TX.velvet, h: 40 });
    } else { // 烧剩的窗帘残片
      g.fillStyle = '#120e0c';
      fillP(g, [1040, 124, 1100, 124, 1094, 220, 1080, 260, 1066, 230, 1050, 300, 1040, 250], '#140f0d');
      fillP(g, [1310, 124, 1376, 124, 1376, 200, 1360, 240, 1344, 210, 1330, 260, 1316, 220], '#140f0d');
      seg(g, 1020, 124, 1400, 124, 6, '#2a2420');
    }
    // 画（门与镜子之间）
    if (q.model >= 1 && !burnt) frame(g, q, 432, 236, 230, 150, paintSeascape, { fw: 12 });
    if (burnt) { rect(g, 420, 224, 254, 174, '#2a2420'); rect(g, 432, 236, 230, 150, '#0e0b0a'); g.strokeStyle = 'rgba(120,100,70,0.35)'; g.lineWidth = 2; g.strokeRect(426, 230, 242, 162); }
    // 衣柜
    wardrobe(g, q, R, 1684, 236, 192, R.base + 6, { col: burnt ? '#141010' : (fresh ? '#5a3a22' : '#3e2414'), t: burnt ? null : wood, open: burnt });
    // 洗脸架
    washstand(g, q, R, 1024, 616, 140, R.base + 6, burnt);
    // 穿衣镜
    cheval(g, q, R, 836, 230, 160, R.base + 10, {
      col: burnt ? '#141010' : (fresh ? '#5a3a22' : '#3e2414'), t: burnt ? null : wood,
      glass: burnt ? function (g2, mx, my, mw, mh) { g2.fillStyle = K.lin(g2, 0, my, 0, my + mh, ['#1a1818', '#2a2624', '#141210']); g2.fillRect(mx, my, mw, mh); } : null,
      crack: burnt ? function (g2, mx, my, mw, mh) { var cx = mx + mw * 0.6, cy = my + mh * 0.4; g2.strokeStyle = 'rgba(200,200,210,0.4)'; g2.lineWidth = 1.2; for (var i = 0; i < 9; i++) { var a = i / 9 * TAU; g2.beginPath(); g2.moveTo(cx, cy); g2.lineTo(cx + Math.cos(a) * mw * 0.7, cy + Math.sin(a) * mh * 0.4); g2.stroke(); } } : null
    });
    // 地面
    plankFloor(g, q, R, { pw: 62, seed: fresh ? 41 : 39, far: burnt ? '#141010' : (fresh ? '#3a2614' : '#2a1a0e'), near: burnt ? '#2a2420' : (fresh ? '#6a4a2c' : '#4e3220'), t: fresh ? TX.floorO : TX.floorW });
    if (q.light >= 1) K.ao(g, 0, R.base - 2, W, 40, 30, 0.4, 't');
    if (burnt) {
      // 地面：灰、积水、水桶
      var rf = K.rng(53);
      for (var a2 = 0; a2 < M(q, 30, 70, 120); a2++) { var ax = 900 + rf() * 1000, ay = 800 + rf() * 260; circle(g, ax, ay, 2 + rf() * 6, rf() < 0.5 ? 'rgba(110,100,92,0.45)' : 'rgba(8,6,6,0.5)'); }
      g.fillStyle = 'rgba(30,40,56,0.5)'; K.ellipse(g, 1320, 960, 170, 26); g.fill(); K.ellipse(g, 760, 1010, 130, 18); g.fill();
      if (q.light >= 1) { g.save(); g.globalCompositeOperation = 'lighter'; K.pool(g, 1320, 958, 140, 18, '#8aa0c8', 0.18); K.pool(g, 760, 1008, 100, 12, '#8aa0c8', 0.12); g.restore(); }
      // 铁皮水桶（倒放）
      if (q.light >= 1) K.contact(g, 690, 1000, 70, 10, 0.6);
      g.save(); g.translate(690, 972); g.rotate(-0.2);
      g.fillStyle = metalGrad(g, -40, 0, 40, 0, '#6a6a72'); g.beginPath(); g.moveTo(-34, -30); g.lineTo(34, -30); g.lineTo(28, 30); g.lineTo(-28, 30); g.closePath(); g.fill();
      for (var bb = -1; bb <= 1; bb++) rect(g, -32, bb * 18 - 1, 64, 2, 'rgba(0,0,0,0.3)');
      ell(g, 0, -30, 34, 8, '#2a2a30'); g.beginPath(); g.arc(0, -30, 36, PI, 0); stroke(g, 2.5, '#4a4a52');
      g.restore();
    }
    if (!burnt) rug(g, q, R, 380, 1180, 1.06, 1.6, { col: fresh ? '#4a2a3e' : '#3e2232', border: '#1a0e14', gold: '#a8823e', medallion: true });
    // 书桌
    var dk = writingDesk(g, q, R, 402, 352, 618, R.base + 14, { burnt: burnt, col: fresh ? '#5a3a22' : '#4a2a16', t: wood, tH: fresh ? TX.oakH : TX.walnutH, up: fresh ? '#6a2a44' : '#5a2034' });
    // 床
    guestBed(g, q, R, 1188, 680, 876, { burnt: burnt, frameC: fresh ? '#5a3a22' : '#3e2414', t: wood, quilt: fresh ? '#6a2a44' : '#5a2034' });
    // 天花吊灯
    var cl = [640, 40];
    if (!burnt) {
      seg(g, cl[0], 0, cl[0], 64, 2, '#2a2a2e');
      g.fillStyle = K.rad(g, cl[0] - 6, 84, 2, 34, ['#fff6e0', '#e8d0a8', '#a88c68']); K.ellipse(g, cl[0], 86, 30, 22); g.fill();
      g.fillStyle = metalGrad(g, cl[0] - 12, 0, cl[0] + 12, 0, '#9a7a3a'); g.fillRect(cl[0] - 12, 60, 24, 8);
    }
    // ---- 光照 ----
    var Lm;
    if (!burnt) {
      Lm = [
        { lin: [0, 0, W, 0], stops: [[0, 'rgba(90,60,40,0.2)'], [0.6, 'rgba(70,70,100,0.15)'], [1, 'rgba(60,60,80,0.2)']] },
        { x: 1208, y: 280, r: 520, ry: 480, c: '#a8b8e0', i: 0.55, fall: 0.3 },
        { pts: [1090, 400, 1326, 400, 1600, 1080, 900, 1080], c: '#90a0d0', i: 0.25, fx0: 0, fy0: 400, fx1: 0, fy1: 1080, q: 1 },
        { x: dk.lamp[0], y: dk.lamp[1] + 40, r: 420, ry: 380, c: '#ffc080', i: 0.55, fall: 0.3 },
        { x: dk.lamp[0], y: 640, r: 260, ry: 80, c: '#ffd090', i: 0.35, q: 1 },
        { x: cl[0], y: 160, r: 700, ry: 520, c: '#ffd8a8', i: 0.4 },
        { x: 960, y: 900, r: 700, ry: 200, c: '#ffd0a0', i: 0.18, q: 1 }
      ];
      lightMap(g, q, fresh ? '#443e4e' : '#3a3444', Lm);
      shaft(g, q, [1100, 176, 1316, 176, 1560, 1000, 940, 1000], '#c0d0f8', 0.07, 0, 176, 0, 1000);
      if (q.light >= 2) K.motes(g, K.rng(67), 40, 1000, 250, 400, 500, '#d8e0ff', 0.3);
      lampGlow(g, q, dk.lamp[0], dk.lamp[1], 60, 44, 0.55);
      if (q.light >= 1) K.glow(g, cl[0], 86, 120, '#ffd8a0', 0.35);
    } else {
      Lm = [
        { lin: [0, 0, W, 0], stops: [[0, 'rgba(50,50,60,0.1)'], [1, 'rgba(70,80,100,0.15)']] },
        { x: 1208, y: 320, r: 900, ry: 700, c: '#a0b0d0', i: 0.6, fall: 0.3 },
        { pts: [1090, 400, 1326, 400, 1640, 1080, 860, 1080], c: '#8898c0', i: 0.35, fx0: 0, fy0: 400, fx1: 0, fy1: 1080, q: 1 },
        { x: 400, y: 600, r: 600, ry: 400, c: '#605860', i: 0.2 }
      ];
      lightMap(g, q, '#4a4852', Lm);
      shaft(g, q, [1100, 176, 1316, 176, 1600, 1000, 900, 1000], '#c8d4f0', 0.1, 0, 176, 0, 1000);
      // 烟雾
      if (q.light >= 1) { for (var sI = 0; sI < M(q, 3, 5, 8); sI++) K.blob(g, 900 + sI * 160, 200 + (sI % 3) * 90, 260, '#6a6a74', 0.08); }
      if (q.light >= 2) K.motes(g, K.rng(71), 90, 900, 150, 800, 700, '#c8ccd8', 0.35);
    }
    finish(g, q, { vig: burnt ? 0.65 : 0.5 });
  }
  function roomLights(mirror, burnt) {
    var L = burnt ? [LT(1208, 280, 260, '#a0b0d0', 0.5, 0, 'window')] :
      [LT(1208, 280, 220, '#a8b8e0', 0.45, 0, 'window'), LT(678, 528, 120, '#ffc070', 0.55, 0.03, 'lamp'), LT(640, 86, 140, '#ffd8a0', 0.45, 0.02, 'lamp')];
    if (mirror) for (var i = 0; i < L.length; i++) L[i] = LT(W - L[i].x, L[i].y, L[i].r, L[i].color, L[i].i, L[i].flicker, L[i].kind);
    return L;
  }
  DM.HDBG.def('east_room', {
    draw: function (g, q, v) { guestRoom(g, q, { burnt: v === 'burnt' }); },
    lights: function (v) { return roomLights(false, v === 'burnt'); },
    key: function (v) { return v === 'burnt' ? { x: 0.3, color: '#b8c4dc', amb: '#26242c', rim: 0.5 } : { x: 0.3, color: '#e8dcc8', amb: '#302a3a', rim: 0.45 }; },
    outdoor: false
  });
  DM.HDBG.def('west_room', {
    draw: function (g, q) { g.save(); g.translate(W, 0); g.scale(-1, 1); guestRoom(g, q, { fresh: true }); g.restore(); },
    lights: function () { return roomLights(true, false); },
    key: { x: -0.3, color: '#e8dcc8', amb: '#342e3e', rim: 0.45 },
    outdoor: false
  });

  /* ================================================================
   * 医务室 infirmary
   * ================================================================ */
  function medCabinet(g, q, R, x, y, w, by) {
    var col = '#d8d4cc', k = R.kWall(by);
    if (q.light >= 1) K.contact(g, x + w / 2, by, w * 0.6, 10, 0.55);
    box(g, q, R, x, y + 20, w, by - y - 20, k, { col: col, frontLo: 0.25 });
    box(g, q, R, x - 8, y, w + 16, 24, k * 0.99, { col: K.shade(col, 0.05) });
    var gy = y + 40, gh = (by - y) * 0.64, gx = x + 14, gw = w - 28;
    rect(g, gx, gy, gw, gh, '#3a4048');
    var rows = 4, rnd = K.rng(83), sh = gh / rows;
    for (var r = 0; r < rows; r++) {
      var sy = gy + r * sh, fl = sy + sh - 5;
      if (q.light >= 1) { g.fillStyle = K.lin(g, 0, sy, 0, sy + 24, [lo(0.4), lo(0)]); g.fillRect(gx, sy, gw, 24); }
      var bx = gx + 8;
      while (bx < gx + gw - 30) {
        if (r === 1 && bx > gx + gw * 0.55 && bx < gx + gw * 0.55 + 20 && q.model >= 1) {
          // 三联胶囊罐盒（一个空位）
          var bw2 = 96; rect(g, bx, fl - 34, bw2, 34, '#e8e0d0'); rect(g, bx, fl - 34, bw2, 3, hi(0.4));
          for (var t = 0; t < 3; t++) { var tx = bx + 6 + t * 30; if (t === 2) { rect(g, tx, fl - 30, 24, 26, '#7a7468'); continue; } g.fillStyle = metalGrad(g, tx, 0, tx + 24, 0, '#a8a8b0'); K.rr(g, tx, fl - 44, 24, 40, 4); g.fill(); rect(g, tx + 3, fl - 32, 18, 10, '#f0e8d8'); }
          bx += bw2 + 8; continue;
        }
        var bw = 14 + rnd() * 20, bh = 24 + rnd() * (sh - 40), c = rnd.pick(['#6a3a1a', '#e8e8f0', '#3a5a7a', '#c8b060', '#5a7a5a', '#8a2a2a', '#d8d0c0']);
        if (rnd() < 0.3) { rect(g, bx, fl - bh * 0.6, bw * 1.6, bh * 0.6, c); rect(g, bx, fl - bh * 0.6, bw * 1.6, 2, hi(0.3)); bx += bw * 1.6 + 4; continue; }
        g.fillStyle = cylGrad(g, bx, bw, c); K.rr(g, bx, fl - bh, bw, bh, 3); g.fill();
        rect(g, bx + bw * 0.2, fl - bh - 6, bw * 0.6, 7, '#e0e0e8'); rect(g, bx + 2, fl - bh * 0.6, bw - 4, bh * 0.25, 'rgba(245,240,230,0.7)');
        bx += bw + 3 + rnd() * 4;
      }
      rect(g, gx, fl, gw, 5, '#c8c4bc'); rect(g, gx, fl, gw, 1.5, hi(0.4));
    }
    // 玻璃门
    g.save(); g.globalAlpha = 0.9;
    g.fillStyle = K.lin(g, gx, gy, gx + gw, gy + gh, ['rgba(180,200,220,0.18)', 'rgba(120,140,160,0.06)', 'rgba(180,200,220,0.14)']); g.fillRect(gx, gy, gw, gh);
    g.restore();
    rect(g, gx + gw / 2 - 3, gy, 6, gh, col); g.strokeStyle = col; g.lineWidth = 8; g.strokeRect(gx, gy, gw, gh);
    if (q.light >= 1) { g.save(); g.globalCompositeOperation = 'lighter'; fillP(g, [gx + 20, gy + gh, gx + 60, gy + gh, gx + gw * 0.4, gy, gx + gw * 0.3, gy], 'rgba(220,230,250,0.08)'); fillP(g, [gx + gw * 0.6, gy + gh, gx + gw * 0.66, gy + gh, gx + gw, gy + gh * 0.4, gx + gw, gy + gh * 0.3], 'rgba(220,230,250,0.06)'); g.restore(); }
    circle(g, gx + gw / 2 - 12, gy + gh / 2, 3, '#8a8a92'); circle(g, gx + gw / 2 + 12, gy + gh / 2, 3, '#8a8a92');
    // 下柜抽屉
    var dy = gy + gh + 16;
    for (var d = 0; d < 2; d++) { groove(g, x + 14, dy + d * ((by - dy - 20) / 2), w - 28, (by - dy - 20) / 2 - 8, 2.5, 0.35); rect(g, x + w / 2 - 16, dy + d * ((by - dy - 20) / 2) + 20, 32, 5, '#8a8a92'); }
  }
  function ironBed(g, q, R, x, w, by) {
    var k = 0.76, matY = by - 160, iron = '#d8d8dc';
    var x1 = x + w;
    if (q.light >= 1) K.contact(g, x + w / 2, by + 4, w * 0.56, 16, 0.6);
    // 床头（左端，铁栏，外侧面可见——在消失点右侧时可见的是左端外侧）
    var hT = by - 330, h0 = [x, hT], h1 = R.p(x, hT, k), h2 = R.p(x, by, k);
    g.beginPath(); g.moveTo(x, hT); g.lineTo(h1[0], h1[1]); stroke(g, 8, iron);
    for (var i = 0; i <= 6; i++) { var u = i / 6, px = lerp(x, h1[0], u), pt = lerp(hT, h1[1], u), pb = lerp(by, h2[1], u); seg(g, px, pt, px, pb, i % 6 ? 4 : 8, i % 6 ? '#b8b8c0' : iron); }
    // 床垫顶面
    var m0 = R.p(x, matY, k), m1 = R.p(x1, matY, k);
    fillP(g, [x, matY, x1, matY, m1[0], m1[1], m0[0], m0[1]], '#e8e8ee');
    // 毯子（下半部）
    var bl0 = x + w * 0.3, b0 = R.p(bl0, matY, k);
    K.poly(g, [bl0, matY - 2, x1, matY - 2, m1[0], m1[1] - 2, b0[0], b0[1] - 2]); texFill(g, q, '#8a96a8', ['fabric', { c1: '#6a7488', c2: '#9aa6b8', threads: 40, seed: 87 }, 60]);
    fillP(g, [bl0, matY - 2, bl0 + 30, matY - 2, R.px(bl0 + 30, k), b0[1] - 2, b0[0], b0[1] - 2], '#f2f2f6');
    // 枕头（左端）
    var pc = R.p(x + 92, matY - 14, 1 - (1 - k) * 0.5);
    g.fillStyle = K.rad(g, pc[0] - 30, pc[1] - 16, 4, 110, ['#ffffff', '#e4e4ea', '#a8a8b2']); K.rr(g, pc[0] - 80, pc[1] - 30, 170, 44, 20); g.fill();
    // 正面：床单垂下
    g.beginPath(); g.moveTo(x - 4, matY); g.lineTo(x1 + 4, matY); g.lineTo(x1 + 4, matY + 70); g.lineTo(x - 4, matY + 70); g.closePath();
    texFill(g, q, '#e4e4ea', TX.linen); g.fillStyle = K.lin(g, 0, matY, 0, matY + 70, [hi(0.12), lo(0.25)]); g.fill();
    K.poly(g, [bl0, matY, x1 + 4, matY, x1 + 4, matY + 74, bl0, matY + 74]); texFill(g, q, '#8a96a8', ['fabric', { c1: '#6a7488', c2: '#9aa6b8', threads: 40, seed: 87 }, 60]);
    K.poly(g, [bl0, matY, x1 + 4, matY, x1 + 4, matY + 74, bl0, matY + 74]); g.fillStyle = K.lin(g, 0, matY, 0, matY + 74, [hi(0.1), lo(0.3)]); g.fill();
    for (var f = 0; f < M(q, 3, 6, 9); f++) { var fx = bl0 + 30 + f * (x1 - bl0 - 40) / M(q, 3, 6, 9); seg(g, fx, matY + 20, fx + 4, matY + 74, 3, lo(0.18)); }
    // 铁床架
    rect(g, x, matY + 70, w, 10, iron); rect(g, x, matY + 70, w, 2, hi(0.5));
    seg(g, x + 4, matY + 80, x + 4, by, 7, iron); seg(g, x1 - 4, matY + 80, x1 - 4, by, 7, iron);
    for (var c = 0; c < 2; c++) { var cx = c ? x1 - 4 : x + 4; ell(g, cx, by, 9, 4, '#2a2a30'); }
    // 床尾（右端）
    var fT = by - 240, f1 = R.p(x1, fT, k);
    seg(g, x1, fT, f1[0], f1[1], 7, iron); seg(g, x1, fT, x1, by, 7, iron);
    for (var j = 1; j <= 4; j++) { var uu = j / 5, ppx = lerp(x1, f1[0], uu); seg(g, ppx, lerp(fT, f1[1], uu), ppx, lerp(matY, R.py(matY, k), uu), 3, '#b8b8c0'); }
    circle(g, x1, fT - 6, 7, iron); circle(g, x, hT - 6, 8, iron);
  }
  function drawInfirmary(g, q) {
    setKey(0.4);
    var R = Room(960, 540, 790, 40, 1400);
    ceilingStrip(g, q, R, { col: '#5a5a5c', step: 300 });
    plasterWall(g, q, 0, 40, W, R.base - 40, { col: '#9aa49c', t: ['plaster', { c1: '#88948c', c2: '#a8b2aa', seed: 89, stain: 0.35 }, 300] });
    bands(g, 0, 40, W, [[3, lo(0.4)], [12, '#c8c8c4'], [3, hi(0.3)], [6, '#a8a8a4'], [10, lo(0.2)]]);
    // 下半墙（米白漆木护墙）
    wainscot(g, q, [[0, W]], 600, R.base, { t: null, col: '#c4bca8', pw: 180 });
    // 门（白漆 + 磨砂玻璃）+ 红十字
    door(g, q, R, 80, 334, 196, R.base - 334, { col: '#d0ccc4', t: null, glass: true, knob: 'r', frameW: 18, frameCol: '#c8c4bc' });
    if (q.model >= 1) { rect(g, 160, 270, 40, 40, '#f4f4f6'); rect(g, 175, 276, 10, 28, '#c02030'); rect(g, 166, 285, 28, 10, '#c02030'); g.strokeStyle = lo(0.3); g.lineWidth = 1; g.strokeRect(160, 270, 40, 40); }
    // 药品柜
    medCabinet(g, q, R, 344, 196, 368, R.base + 6);
    // 窗（铁栏）+ 白窗帘
    windowFront(g, q, R, 1290, 168, 286, 236, { cols: 2, rows: 2, seed: 43, horizon: 0.64, sea: false, bars: 6, frameCol: '#c8c4bc', t: null, muntin: '#a8a49c', revealCol: '#8a948c' });
    curtain(g, q, 1240, 132, 80, 320, { col: '#d8dce0', side: 'l', tie: 0.6, gather: 0.6, tieback: true, tieCol: '#a8a8b0' });
    curtain(g, q, 1546, 132, 80, 320, { col: '#d8dce0', side: 'r', tie: 0.6, gather: 0.6, tieCol: '#a8a8b0' });
    seg(g, 1220, 132, 1646, 132, 5, '#9a9aa2');
    // 窗插销
    rect(g, 1426, 300, 26, 10, '#6a6a72');
    // 传声管（床头附近）
    speakingTube(g, q, 1170, 388, 60, 84);
    // 地面（亚麻油毡棋盘格）
    tileFloor(g, q, R, { tile: 88, cols: ['#9a9aa0', '#6a6a74'], mortar: '#4a4a50', gap: 1, seed: 29, var: 0.04 });
    if (q.light >= 1) K.ao(g, 0, R.base - 2, W, 40, 30, 0.35, 't');
    floorSheen(g, q, R, 1433, 220, '#c0d0f0', 0.12);
    // 书桌 + 白大褂椅子
    var dx = 766, dw = 348, dty = 628, dby = R.base + 6;
    if (q.light >= 1) K.contact(g, dx + dw / 2, dby, dw * 0.55, 10, 0.55);
    rect(g, dx + 8, dty + 30, 120, dby - dty - 30, '#5a4a3a'); groove(g, dx + 16, dty + 40, 104, 50, 2.5, 0.4); groove(g, dx + 16, dty + 98, 104, 50, 2.5, 0.4);
    cyl(g, dx + dw - 22, dty + 30, 14, dby - dty - 30, '#5a4a3a');
    box(g, q, R, dx, dty, dw, 30, R.kWall(dby), { col: '#6a5440', t: TX.oakH, topHi: 0.2 });
    if (q.model >= 1) {
      fillP(g, [dx + 140, dty, dx + 250, dty, dx + 240, dty - 6, dx + 150, dty - 6], '#f0ece4'); fillP(g, [dx + 150, dty - 1, dx + 240, dty - 1, dx + 236, dty - 5, dx + 158, dty - 5], '#e4ded2');
      g.fillStyle = cylGrad(g, dx + 100, 30, '#5a2a1a'); g.fillRect(dx + 100, dty - 30, 30, 30);
      g.beginPath(); g.moveTo(dx + 60, dty - 2); g.quadraticCurveTo(dx + 40, dty - 30, dx + 70, dty - 34); stroke(g, 3, '#2a2a30'); circle(g, dx + 72, dty - 34, 6, '#a8a8b0');
    }
    // 台灯（鹅颈）
    var lx = dx + dw - 70;
    ell(g, lx, dty - 3, 22, 5, '#2a3a2a'); g.beginPath(); g.moveTo(lx, dty - 4); g.quadraticCurveTo(lx - 10, dty - 80, lx + 30, dty - 96); stroke(g, 4, '#3a4a3a');
    g.beginPath(); g.moveTo(lx + 10, dty - 108); g.lineTo(lx + 50, dty - 108); g.lineTo(lx + 62, dty - 82); g.lineTo(lx - 2, dty - 82); g.closePath(); g.fillStyle = K.lin(g, lx, 0, lx + 62, 0, ['#2a4a32', '#4a7a5a', '#2a4a32']); g.fill();
    // 椅子 + 白大褂
    var cx = dx + 150, cy = dty + 20;
    for (var cl = 0; cl < 2; cl++) cyl(g, cx + cl * 96, cy + 70, 12, dby + 34 - cy - 70, '#4a3a2c');
    box(g, q, R, cx - 6, cy + 56, 118, 16, 0.9, { col: '#4a3a2c' });
    rect(g, cx, cy - 70, 12, 130, '#4a3a2c'); rect(g, cx + 96, cy - 70, 12, 130, '#4a3a2c'); rect(g, cx, cy - 74, 108, 24, '#5a4a3a');
    g.beginPath(); g.moveTo(cx - 10, cy - 66); g.lineTo(cx + 118, cy - 66); g.lineTo(cx + 124, cy + 20); g.quadraticCurveTo(cx + 110, cy + 120, cx + 96, cy + 150); g.lineTo(cx + 10, cy + 150); g.quadraticCurveTo(cx - 6, cy + 100, cx - 14, cy + 20); g.closePath();
    texFill(g, q, '#e8eaee', TX.linen); g.fillStyle = K.lin(g, cx - 14, 0, cx + 124, 0, [hi(0.1), lo(0.05), lo(0.3)]); g.fill();
    seg(g, cx + 54, cy - 60, cx + 52, cy + 146, 1.5, lo(0.25)); seg(g, cx + 20, cy - 62, cx + 46, cy + 10, 1.5, lo(0.2)); seg(g, cx + 88, cy - 62, cx + 60, cy + 10, 1.5, lo(0.2));
    // 床头柜（白铁）
    box(g, q, R, 1008, 690, 120, 120, 0.9, { col: '#d0d0d4' });
    groove(g, 1018, 702, 100, 36, 2.5, 0.35); rect(g, 1052, 716, 32, 5, '#8a8a92'); groove(g, 1018, 746, 100, 56, 2.5, 0.35);
    cyl(g, 1012, 810, 8, 20, '#a8a8b0'); cyl(g, 1116, 810, 8, 20, '#a8a8b0');
    // 柜上：药罐 + 水杯
    g.fillStyle = metalGrad(g, 1030, 0, 1056, 0, '#a8a8b0'); K.rr(g, 1030, 650, 26, 40, 4); g.fill(); rect(g, 1033, 662, 20, 10, '#f0e8d8');
    g.fillStyle = K.lin(g, 1076, 0, 1100, 0, ['rgba(200,220,240,0.35)', 'rgba(240,250,255,0.6)', 'rgba(200,220,240,0.3)']); g.fillRect(1076, 654, 24, 36); rect(g, 1076, 672, 24, 18, 'rgba(170,200,230,0.35)');
    // 病床
    ironBed(g, q, R, 1166, 700, 878);
    // 吊灯（搪瓷）
    var pl = [940, 150];
    seg(g, pl[0], 0, pl[0], pl[1] - 30, 2, '#2a2a2e');
    g.beginPath(); g.moveTo(pl[0] - 14, pl[1] - 30); g.lineTo(pl[0] + 14, pl[1] - 30); g.lineTo(pl[0] + 60, pl[1] + 8); g.lineTo(pl[0] - 60, pl[1] + 8); g.closePath();
    g.fillStyle = K.lin(g, pl[0] - 60, 0, pl[0] + 60, 0, ['#a8acb0', '#f0f2f4', '#a8acb0']); g.fill(); ell(g, pl[0], pl[1] + 8, 60, 7, '#e8eaee');
    // ---- 光照 ----
    var Lm = [
      { lin: [0, 0, W, 0], stops: [[0, 'rgba(80,90,90,0.2)'], [1, 'rgba(90,100,120,0.25)']] },
      { x: pl[0], y: 360, r: 900, ry: 640, c: '#fff0dc', i: 0.55, fall: 0.3 },
      { x: pl[0], y: 860, r: 600, ry: 190, c: '#fff0dc', i: 0.3, q: 1 },
      { x: 1433, y: 290, r: 520, ry: 440, c: '#b8c8e8', i: 0.55 },
      { pts: [1290, 404, 1576, 404, 1800, 1080, 1120, 1080], c: '#a0b0d8', i: 0.22, fx0: 0, fy0: 404, fx1: 0, fy1: 1080, q: 1 },
      { x: lx + 30, y: 560, r: 300, ry: 220, c: '#ffe0b0', i: 0.35, q: 1 }
    ];
    lightMap(g, q, '#4a4c54', Lm);
    shaft(g, q, [1300, 178, 1566, 178, 1760, 1000, 1150, 1000], '#d0dcf8', 0.07, 0, 178, 0, 1000);
    if (q.light >= 2) K.motes(g, K.rng(73), 40, 1200, 260, 400, 500, '#e0e8ff', 0.3);
    if (q.light >= 1) { K.glow(g, pl[0], pl[1] + 10, 160, '#fff0d8', 0.4); K.glow(g, lx + 30, dty - 80, 60, '#ffe0b0', 0.4); }
    g.fillStyle = K.rad(g, pl[0], pl[1] + 10, 2, 26, ['#ffffff', 'rgba(255,240,220,0)']); circle(g, pl[0], pl[1] + 10, 26, g.fillStyle);
    finish(g, q, { vig: 0.45 });
  }
  DM.HDBG.def('infirmary', {
    draw: function (g, q) { drawInfirmary(g, q); },
    lights: [LT(940, 160, 280, '#fff0dc', 0.6, 0.02, 'lamp'), LT(1433, 290, 220, '#b8c8e8', 0.45, 0, 'window'), LT(1110, 530, 70, '#ffe0b0', 0.45, 0.02, 'lamp')],
    key: { x: 0.4, color: '#e8ecf4', amb: '#363a44', rim: 0.4 },
    outdoor: false
  });

  /* ================================================================
   * 佣人通道 service_nook
   * ================================================================ */
  function teaShelf(g, q, R, x, y, w, by) {
    var k = R.kWall(by), rnd = K.rng(95);
    if (q.light >= 1) K.contact(g, x + w / 2, by, w * 0.6, 10, 0.6);
    box(g, q, R, x, y + 20, w, by - y - 20, k, { col: '#4a3222', t: TX.pine });
    box(g, q, R, x - 8, y, w + 16, 22, k * 0.99, { col: '#5a3e28', t: TX.pineH });
    var ix = x + 14, iw = w - 28, iy = y + 34, ih = (by - y) * 0.62, rows = 3, sh = ih / rows;
    rect(g, ix, iy, iw, ih, '#1a120c');
    for (var r = 0; r < rows; r++) {
      var fl = iy + (r + 1) * sh - 6;
      if (q.light >= 1) { g.fillStyle = K.lin(g, 0, iy + r * sh, 0, iy + r * sh + 26, [lo(0.5), lo(0)]); g.fillRect(ix, iy + r * sh, iw, 26); }
      var n = 4;
      for (var c = 0; c < n; c++) {
        var cx = ix + iw * (c + 0.5) / n;
        if (r === 0) { // 茶杯 + 碟
          ell(g, cx, fl - 3, 24, 5, '#e8e4dc'); g.fillStyle = K.lin(g, cx - 16, 0, cx + 16, 0, ['#c8c4bc', '#f6f4f0', '#b8b4ac']);
          g.beginPath(); g.moveTo(cx - 17, fl - 30); g.quadraticCurveTo(cx - 16, fl - 6, cx, fl - 6); g.quadraticCurveTo(cx + 16, fl - 6, cx + 17, fl - 30); g.closePath(); g.fill();
          ell(g, cx, fl - 30, 17, 4, '#f8f6f2'); g.beginPath(); g.arc(cx + 19, fl - 20, 6, -PI / 2, PI / 2); stroke(g, 3, '#e0dcd4');
          if (q.model >= 1) seg(g, cx - 14, fl - 22, cx + 14, fl - 22, 1.5, 'rgba(60,90,160,0.6)');
        } else if (r === 1) { // 叠起的盘子
          for (var p = 0; p < 5; p++) ell(g, cx, fl - 3 - p * 5, 30, 6, p % 2 ? '#e8e4dc' : '#d4d0c8');
        } else { // 茶叶罐
          var cc = ['#6a2a1a', '#2a4a3a', '#8a7a3a', '#3a3a5a'][c];
          g.fillStyle = cylGrad(g, cx - 18, 36, cc); g.fillRect(cx - 18, fl - 54, 36, 54); g.fillStyle = metalGrad(g, cx - 19, 0, cx + 19, 0, '#a8a8b0'); g.fillRect(cx - 19, fl - 60, 38, 8);
          rect(g, cx - 12, fl - 40, 24, 16, 'rgba(240,230,200,0.7)');
        }
      }
      rect(g, ix, fl, iw, 6, '#5a3e28'); rect(g, ix, fl, iw, 1.5, hi(0.3));
    }
    // 下柜
    var dy = iy + ih + 12;
    groove(g, x + 14, dy, w / 2 - 20, by - dy - 30, 3, 0.45); groove(g, x + w / 2 + 6, dy, w / 2 - 20, by - dy - 30, 3, 0.45);
    circle(g, x + w / 2 - 14, dy + 40, 4, '#8a6a30'); circle(g, x + w / 2 + 14, dy + 40, 4, '#8a6a30');
    void rnd;
  }
  function drawNook(g, q) {
    setKey(-0.2);
    var R = Room(880, 540, 776, 70, 1300), xc = 1440;
    ceilingStrip(g, q, R, { col: '#2a2420', step: 280 });
    plasterWall(g, q, 0, 70, xc, R.base - 70, { col: '#6a6058', t: ['plaster', { c1: '#5a5048', c2: '#7a7066', seed: 97, stain: 0.7 }, 300] });
    bands(g, 0, 70, xc, [[3, lo(0.5)], [8, '#4a3a2a'], [2, hi(0.2)]]);
    wainscot(g, q, [[0, xc]], 600, R.base, { t: TX.pine, col: '#3a2a1e', pw: 150 });
    // 右侧：拐进深处的暗通道（只看得到通道右墙、地面和天花）
    var XR = 1990, dC = (xc - R.vx) / (XR - R.vx);   // 右墙在拐角处被遮住的深度
    function PR(Y, d) { return [R.vx + (XR - R.vx) * d, R.vy + (R.base - Y - R.vy) * d]; }
    var hTop = R.base - 70;
    rect(g, xc, 70, W - xc, R.base - 70, '#0e0c0e');
    var rA = PR(hTop, 1), rB = PR(hTop, dC), rC = PR(0, dC), rD = PR(0, 1);
    K.poly(g, [rA[0], rA[1], rB[0], rB[1], rC[0], rC[1], rD[0], rD[1]]); texFill(g, q, '#4a4038', ['plaster', { c1: '#4a4038', c2: '#5e544a', seed: 98, stain: 0.7 }, 300]);
    fillP(g, [rA[0], rA[1], rB[0], rB[1], rC[0], rC[1], rD[0], rD[1]], K.lin(g, W, 0, xc, 0, [lo(0.25), lo(0.75)]));
    var wA = PR(170, 1), wB = PR(170, dC);
    fillP(g, [wA[0], wA[1], wB[0], wB[1], rC[0], rC[1], rD[0], rD[1]], 'rgba(40,28,20,0.7)'); seg(g, wA[0], wA[1], wB[0], wB[1], 3, 'rgba(120,90,60,0.4)');
    fillP(g, [xc, R.base, W + 80, R.base, rC[0], rC[1]], '#1e1814');
    fillP(g, [xc, 70, W + 80, 70, rB[0], rB[1]], '#141012');
    // 通道右墙上的门（门缝透光）
    var d0 = 0.66, d1 = 0.8, dt0 = PR(450, d0), db0 = PR(0, d0), dt1 = PR(450, d1), db1 = PR(0, d1);
    fillP(g, [dt0[0], dt0[1], dt1[0], dt1[1], db1[0], db1[1], db0[0], db0[1]], '#2a1e16');
    fillP(g, [dt0[0], dt0[1], dt1[0], dt1[1], db1[0], db1[1], db0[0], db0[1]], K.lin(g, dt1[0], 0, dt0[0], 0, [lo(0.3), lo(0.7)]));
    seg(g, dt0[0] + 2, dt0[1] + 4, db0[0] + 2, db0[1] - 2, 2.5, 'rgba(255,180,100,0.65)');
    var dl = [dt0[0], dt0[1]], dr = [db1[0], db1[1]];
    void dl; void dr;
    // 拐角（墙边）
    rect(g, xc - 6, 70, 12, R.base - 70, '#5a4e44'); rect(g, xc - 6, 70, 3, R.base - 70, hi(0.2)); rect(g, xc + 3, 70, 3, R.base - 70, lo(0.5));
    // 墙上的日历（1999 年 8 月）与挂钩上的围裙
    if (q.model >= 1) {
      if (q.light >= 1) softRect(g, 1146, 306, 120, 150, 6, 0.4);
      rect(g, 1140, 300, 120, 150, '#e8e2d2'); rect(g, 1140, 300, 120, 34, '#8a1a22');
      K.text(g, '1999', 1200, 318, 18, '#f4ece0', { font: 'Georgia,serif', weight: 'bold' });
      K.text(g, '8', 1170, 360, 26, '#2a2420', { font: 'Georgia,serif', weight: 'bold' });
      for (var cr = 0; cr < 4; cr++) for (var cc = 0; cc < 7; cc++) rect(g, 1148 + cc * 15, 384 + cr * 14, 10, 8, cc === 0 ? 'rgba(160,30,30,0.5)' : 'rgba(60,50,40,0.35)');
      circle(g, 1200, 296, 3, '#2a2a2e');
      seg(g, 560, 300, 560, 312, 4, '#2a2a2e');
      g.beginPath(); g.moveTo(540, 312); g.lineTo(580, 312); g.quadraticCurveTo(596, 420, 588, 520); g.lineTo(532, 520); g.quadraticCurveTo(524, 420, 540, 312); g.closePath();
      texFill(g, q, '#d8d4cc', TX.linen); g.fillStyle = K.lin(g, 530, 0, 594, 0, [hi(0.1), lo(0.3)]); g.fill();
    }
    if (q.model >= 2) { seg(g, 1400, 776, 1360, 380, 5, '#6a4a2a'); g.beginPath(); g.moveTo(1384, 700); g.lineTo(1430, 790); g.lineTo(1370, 790); g.closePath(); g.fillStyle = '#8a7a50'; g.fill(); }
    // 搁架 + 茶具
    teaShelf(g, q, R, 164, 286, 352, R.base + 6);
    // 传声管
    speakingTube(g, q, 842, 364, 68, 92);
    // 地面
    plankFloor(g, q, R, { pw: 70, seed: 47, far: '#1e1610', near: '#3e2c1e', t: TX.floorO });
    if (q.light >= 1) K.ao(g, 0, R.base - 2, xc, 40, 30, 0.45, 't');
    // 小桌 + 茶壶
    var tx = 960, tw = 240, tty = 706, tby = 830;
    if (q.light >= 1) K.contact(g, tx + tw / 2, tby, tw * 0.55, 10, 0.65);
    var bl = R.p(tx + 14, tby, 0.86), br = R.p(tx + tw - 26, tby, 0.86);
    cyl(g, bl[0], tty + 20, 10, bl[1] - tty - 20, '#3a2618'); cyl(g, br[0], tty + 20, 10, br[1] - tty - 20, '#3a2618');
    cyl(g, tx + 8, tty + 20, 12, tby - tty - 20, '#4a3020'); cyl(g, tx + tw - 20, tty + 20, 12, tby - tty - 20, '#4a3020');
    box(g, q, R, tx, tty, tw, 22, 0.86, { col: '#5a3a24', t: TX.pineH, topHi: 0.2 });
    // 托盘
    var tp = R.p(tx + tw / 2, tty, 0.93);
    ell(g, tp[0], tp[1], 100, 12, '#8a6a3a'); ell(g, tp[0], tp[1] - 1, 92, 9, '#a8823e');
    // 茶壶（白瓷青花）
    var px = tp[0] - 10, pb = tp[1] - 2;
    g.fillStyle = K.rad(g, px - 14, pb - 36, 4, 46, ['#ffffff', '#e8e6e0', '#a8a49c']); K.ellipse(g, px, pb - 26, 40, 30); g.fill();
    if (q.model >= 1) { g.beginPath(); g.arc(px, pb - 26, 30, 0.3, PI - 0.3); stroke(g, 2, 'rgba(50,80,160,0.6)'); circle(g, px - 10, pb - 30, 5, 'rgba(50,80,160,0.5)'); circle(g, px + 12, pb - 22, 4, 'rgba(50,80,160,0.5)'); }
    ell(g, px, pb - 54, 22, 6, '#e8e6e0'); g.fillStyle = K.rad(g, px - 2, pb - 62, 1, 9, ['#ffffff', '#c8c4bc']); circle(g, px, pb - 60, 7, g.fillStyle);
    g.beginPath(); g.moveTo(px + 36, pb - 30); g.quadraticCurveTo(px + 60, pb - 36, px + 66, pb - 56); stroke(g, 7, '#e0ded8');
    g.beginPath(); g.moveTo(px - 36, pb - 40); g.bezierCurveTo(px - 66, pb - 44, px - 66, pb - 10, px - 34, pb - 14); stroke(g, 5, '#d8d6d0');
    // 茶杯
    for (var c = 0; c < 2; c++) { var ccx = tp[0] + 56 + c * 36, ccy = tp[1] + 2 - c * 6; ell(g, ccx, ccy, 16, 4, '#e8e4dc'); g.fillStyle = K.lin(g, ccx - 11, 0, ccx + 11, 0, ['#c8c4bc', '#f6f4f0', '#b8b4ac']); g.fillRect(ccx - 11, ccy - 18, 22, 16); ell(g, ccx, ccy - 18, 11, 3, '#6a3a1a'); }
    // 茶叶罐
    g.fillStyle = cylGrad(g, tx + 22, 30, '#2a4a3a'); g.fillRect(tx + 22, tty - 44, 30, 44); g.fillStyle = metalGrad(g, tx + 21, 0, tx + 53, 0, '#a8a8b0'); g.fillRect(tx + 21, tty - 50, 32, 8);
    // 煤气小炉 / 水壶（墙边）
    if (q.model >= 1) {
      box(g, q, R, 600, 690, 140, 86, R.kWall(R.base + 6), { col: '#3a3a40', t: TX.iron });
      g.fillStyle = metalGrad(g, 620, 0, 700, 0, '#8a8a92'); K.ellipse(g, 660, 660, 40, 30); g.fill(); ell(g, 660, 632, 16, 5, '#5a5a62');
      g.beginPath(); g.moveTo(696, 650); g.quadraticCurveTo(716, 640, 722, 622); stroke(g, 6, '#7a7a82');
    }
    // 灯泡（简易灯罩）
    var lb = [600, 170];
    seg(g, lb[0], 0, lb[0], lb[1] - 24, 2, '#1a1a1e');
    g.beginPath(); g.moveTo(lb[0] - 10, lb[1] - 24); g.lineTo(lb[0] + 10, lb[1] - 24); g.lineTo(lb[0] + 48, lb[1]); g.lineTo(lb[0] - 48, lb[1]); g.closePath(); g.fillStyle = K.lin(g, lb[0] - 48, 0, lb[0] + 48, 0, ['#2a2a30', '#5a5a62', '#2a2a30']); g.fill();
    // ---- 光照 ----
    var Lm = [
      { x: lb[0], y: 360, r: 900, ry: 700, c: '#ffc888', i: 0.6, fall: 0.28 },
      { x: lb[0] + 200, y: 860, r: 600, ry: 200, c: '#ffc080', i: 0.25, q: 1 },
      { x: 1080, y: 650, r: 300, ry: 200, c: '#ffd0a0', i: 0.2, q: 1 },
      { x: db0[0], y: (dt0[1] + db0[1]) / 2, r: 160, ry: 240, c: '#ffb070', i: 0.3, q: 1 },
      { x: 1700, y: 600, r: 300, ry: 300, c: '#605048', i: 0.25 }
    ];
    lightMap(g, q, '#34303a', Lm);
    // 门缝的光
    g.save(); g.globalCompositeOperation = 'lighter';
    seg(g, dt0[0] + 2, dt0[1] + 4, db0[0] + 2, db0[1] - 2, 3, 'rgba(255,190,110,0.6)');
    fillP(g, [db0[0], db0[1], db1[0], db1[1], db1[0] - 70, db1[1] + 14, db0[0] - 60, db0[1] + 10], 'rgba(255,170,90,0.12)');
    if (q.light >= 1) K.glow(g, db0[0], (dt0[1] + db0[1]) / 2, 90, '#ffb070', 0.2);
    g.restore();
    if (q.light >= 1) K.glow(g, lb[0], lb[1] + 4, 150, '#ffc070', 0.4);
    g.fillStyle = K.rad(g, lb[0], lb[1] + 6, 1, 16, ['#fffbe8', 'rgba(255,210,140,0)']); circle(g, lb[0], lb[1] + 6, 16, g.fillStyle);
    if (q.light >= 2) K.motes(g, K.rng(79), 30, 400, 200, 500, 500, '#ffe0b0', 0.25);
    finish(g, q, { vig: 0.65 });
  }
  DM.HDBG.def('service_nook', {
    draw: function (g, q) { drawNook(g, q); },
    lights: [LT(600, 180, 260, '#ffc070', 0.6, 0.04, 'lamp'), LT(1600, 560, 70, '#ffb070', 0.3, 0.05, 'glow')],
    key: { x: -0.2, color: '#ffd0a0', amb: '#26222a', rim: 0.35 },
    outdoor: false
  });


  /*@@ROOMS@@*/
})(typeof window !== 'undefined' ? window : globalThis);
