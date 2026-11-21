/* ======================================================================
 * DARK MOOD HD 角色生成器 —— 立绘（640x896 半身）+ Q 版小人（128x256 全身）
 * ----------------------------------------------------------------------
 * 通用、数据驱动、与具体游戏无关：新作只需 DM.HDChar.def(id, 配置) 即可。
 * 所有尺寸都相对头部几何（r = 头顶到下巴的高度）计算，同一套部件既画立绘也画小人。
 *
 * 渲染管线（每个部件组在一张临时图层上完成，再合成到主画布）：
 *   底色填充 → 形状内阴影/渐变/纹理（裁剪或 source-atop）→ 内部线 → 外轮廓（destination-over）
 *   层次：后发 → 背部配件 → 颈/服装/颈部配件 → 脸（五官、表情特效）→ 前发 → 头部配件/眼镜/面具 → 手与道具
 * 画质：model 0/1/2 = 发束数、睫毛、褶皱、配件细节；tex 0/1/2 = 纯色 / 织物与发丝纹理；
 *       light 0/1/2 = 单阴影色 / +柔和渐变 / +高光、轮廓光、暖色透光阴影边
 *
 * ---------------------------- 配置格式 ----------------------------
 * DM.HDChar.def('id', {
 *   base: 'otherId',          // 继承另一个角色的配置后再覆盖（深合并；数组整体替换）
 *   sex: 'm' | 'f',           // 影响脸宽、眼型高度、颈宽、肩宽
 *   age: 21,                  // <13 儿童比例（大头、窄肩）；>=13 <18 少年；>=50 起出现年龄纹；>=58 老年
 *   height: 174,              // 身高 cm：立绘上下位置、小人缩放
 *   build: 0,                 // 体格 -1 瘦小 … 0 普通 … 1 魁梧（肩宽、颈粗）
 *   skin: '#f1d2b8',
 *   face: 'f'|'soft'|'m'|'sharp'|'square'|'round'|'long'|'child'|'old',   // 脸型（默认按性别/年龄）
 *   head: { w: 1, h: 1 },     // 头部宽高微调
 *   lines: 0..3,              // 年龄纹强度（默认按 age）
 *   blush: 0..1,              // 常态腮红
 *   hair: { style: 'long_straight', color: '#15151c',
 *           // 以下均可选，覆盖发型预设（见 HAIR 表）：
 *           vol, w, hl(发际线高), cap:'smooth'|'tufts'|'buzz'|'swept'|'thin',
 *           bangs:{k:'spiky'|'messy'|'blunt'|'swept'|'parted'|'short'|'none', n:[低,中,高], len, part, irr, spread},
 *           side:{k:'lock'|'blunt'|'sideburn'|'ragged'|'none', len, w, out},
 *           back:{k:'none'|'short'|'long'|'wavy'|'bob'|'ragged'|'spiky', len, w},
 *           extras:[{k:'twin_tails'|'braids'|'bun'|'ponytail'|'low_tail'|'ahoge'|'ribbon'|'tie', ...}],
 *           grey: 0..1 (白发丝比例), hl2: 高光色 },
 *   eyes: { shape: 'round'|'sharp'|'narrow'|'lazy'|'big_calm'|'cold'|'stern'|'half'|'fox'|'cat'|'small'|'jolly'
 *                  |'dreamy'|'proud'|'kind'|'gentle'|'tired'|'big'|'squint'|'mask', color: '#3a5a8a',
 *           size: 1, gap: 1, lash: '#颜色', ...任意 EYE 参数覆盖 },
 *   brows: { shape: 'normal'|'thin'|'thick'|'straight'|'sharp'|'soft'|'bushy'|'short', color, t: 粗细倍率 },
 *   mouth: { w: 1 },  nose: 'small'|'male'|'button'|'long',
 *   marks: ['scar_brow','scar_cheek','scar_lip','burn','mole','stubble','mustache','beard_short','beard_full',
 *           'goatee','metal_tooth','freckles','bandage','eye_bags'],     // 脸部特征（字符串或 {k, c, side}）
 *   outfit: { k: 'coat'|'suit'|'suit_vest'|'labcoat'|'trench'|'tailcoat'|'butler'|'chef'|'smock'|'sailor_cardigan'
 *                |'sailor'|'blazer'|'cardigan'|'sweater'|'turtleneck'|'dress'|'tshirt'|'work'|'kimono'|'haori'|'miko'
 *                |'police'|'parka'|'robe'|'jacket'|'fisher'|'nurse'|'maid'|'coat_over_sailor'|'shirt' …,
 *             c: 主色, c2: 内搭色, c3: 点缀色（领带/丝带/腰带）, tie: 'tie'|'bow'|'ribbon'|'none', ...预设参数 },
 *   acc: [ 'glasses_round', {k:'top_hat', c:'#222', tilt:-0.2}, {k:'scarf', c:'#a08060'}, ... ],   // 配件（见 ACC 表）
 *   hold: { k: 'notebook'|'doll'|'book'|'cane'|'cards'|'camera'|'phone'|'lantern'|'gohei'|'clipboard'|'fan', c, glove:'#fff', side:1 },
 *   mask: 'crow' | 'moth' | 'fox' | 'cloth' | {k, c, glow},  // 面具（DM.HDChar.parts.mask 可扩展）；crow/moth 时不画五官
 *   hood: { c: '#0a0a10' },   // 兜帽（与 robe/面具搭配）
 *   pose: { think: 'chin' | 'arms' | null },  // think 表情时的手势
 *   expr: { smile: { eye:{mode:'happy'} }, normal: {...} },   // 按表情覆盖 EXPR 表（eye/brow/mouth/blush/fx）
 *   glow: { c: '#ff3050' },   // 面具眼洞发光色（判官）
 *   sprite: { legs:'pants'|'skirt'|'long_skirt'|'shorts'|'dress'|'robe'|'hakama', legC, shoe, sock, coat: 0..1 }
 * });
 * 未注册的 id：若 DM.CHARS[id].visual 存在则据其自动推导，否则画中性的剪影占位，不抛异常。
 * 扩展：DM.HDChar.parts.{hair,bangs,sides,backs,extras,outfit,acc,mask,eyes,brows,face,expr,mouth}
 * ====================================================================== */
(function (root) {
  'use strict';
  var DM = root.DM = root.DM || {};
  var K = DM.HK;
  if (!K) return;
  var HC = DM.HDChar = DM.HDChar || {};
  if (!HC.cast) HC.cast = {};
  if (!HC.def) HC.def = function (id, o) { this.cast[id] = o; };
  var PW = K.PW || 640, PH = K.PH || 896, SW = K.SW || 128, SH = K.SH || 256;
  var PI = Math.PI;

  var HAIR = {}, BANGS = {}, SIDES = {}, BACKS = {}, HEXTRA = {}, OUTFIT = {}, ACC = {}, MASK = {},
    EYE = {}, BROW = {}, FACE = {}, EXPR = {}, MOUTH = {};
  HC.parts = { hair: HAIR, bangs: BANGS, sides: SIDES, backs: BACKS, extras: HEXTRA, outfit: OUTFIT, acc: ACC,
    mask: MASK, eyes: EYE, brows: BROW, face: FACE, expr: EXPR, mouth: MOUTH };

  /* ====================== 基础工具 ====================== */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function isArr(o) { return Object.prototype.toString.call(o) === '[object Array]'; }
  function isObj(o) { return !!o && typeof o === 'object' && !isArr(o); }
  function merge(a, b) {
    var out = {}, k;
    if (isObj(a)) for (k in a) if (a.hasOwnProperty(k)) out[k] = a[k];
    if (isObj(b)) for (k in b) if (b.hasOwnProperty(k)) out[k] = (isObj(b[k]) && isObj(out[k])) ? merge(out[k], b[k]) : b[k];
    return out;
  }
  function lum(c) { var x = K.rgb(c); return (0.299 * x[0] + 0.587 * x[1] + 0.114 * x[2]) / 255; }
  function A(c, a) { return K.rgba(c, a); }
  function pickN(v, C) { return isArr(v) ? v[clamp(C.m, 0, v.length - 1)] : v; }
  function bz(a, b, c, d, t) { var m = 1 - t; return m * m * m * a + 3 * m * m * t * b + 3 * m * t * t * c + t * t * t * d; }
  function bzd(a, b, c, d, t) { var m = 1 - t; return 3 * m * m * (b - a) + 6 * m * t * (c - b) + 3 * t * t * (d - c); }
  function smooth01(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }

  /* ====================== 路径 ====================== */
  // 命令数组：['M',x,y,'L',x,y,'Q',qx,qy,x,y,'C',x1,y1,x2,y2,x,y,'Z']；实际 X = ox + sx*x（sx=-1 时左右镜像）
  function P(g, a, ox, sx, cont) {
    ox = ox || 0; sx = sx === undefined ? 1 : sx;
    if (!cont) g.beginPath();
    var i = 0, n = a.length, c;
    while (i < n) {
      c = a[i++];
      if (c === 'M') { g.moveTo(ox + sx * a[i], a[i + 1]); i += 2; }
      else if (c === 'L') { g.lineTo(ox + sx * a[i], a[i + 1]); i += 2; }
      else if (c === 'Q') { g.quadraticCurveTo(ox + sx * a[i], a[i + 1], ox + sx * a[i + 2], a[i + 3]); i += 4; }
      else if (c === 'C') { g.bezierCurveTo(ox + sx * a[i], a[i + 1], ox + sx * a[i + 2], a[i + 3], ox + sx * a[i + 4], a[i + 5]); i += 6; }
      else if (c === 'Z') g.closePath();
    }
  }
  // 左右对称闭合形状：st=[dx,y] 起点（通常在中线上），segs 为左半边各段（dx=距中线距离）：
  // [x,y] 直线 / [qx,qy,x,y] 二次 / [x1,y1,x2,y2,x,y] 三次；末点应回到中线。右半边自动镜像反向。
  function sym(g, cx, st, segs, cont) {
    if (!cont) g.beginPath();
    g.moveTo(cx - st[0], st[1]);
    var i, s, e = [st];
    for (i = 0; i < segs.length; i++) {
      s = segs[i];
      if (s.length === 2) g.lineTo(cx - s[0], s[1]);
      else if (s.length === 4) g.quadraticCurveTo(cx - s[0], s[1], cx - s[2], s[3]);
      else g.bezierCurveTo(cx - s[0], s[1], cx - s[2], s[3], cx - s[4], s[5]);
      e.push([s[s.length - 2], s[s.length - 1]]);
    }
    var last = e[e.length - 1];
    if (last[0] !== 0) g.lineTo(cx + last[0], last[1]);
    for (i = segs.length - 1; i >= 0; i--) {
      s = segs[i]; var p = e[i];
      if (s.length === 2) g.lineTo(cx + p[0], p[1]);
      else if (s.length === 4) g.quadraticCurveTo(cx + s[0], s[1], cx + p[0], p[1]);
      else g.bezierCurveTo(cx + s[2], s[3], cx + s[0], s[1], cx + p[0], p[1]);
    }
    g.closePath();
  }
  // 平滑曲线（Catmull-Rom）：pts=[x,y,k,...]，k=1 平滑点，0 尖角
  function spline(g, pts, closed, cont) {
    var n = pts.length / 3, i;
    if (!cont) g.beginPath();
    function I(i) { return closed ? ((i % n) + n) % n : clamp(i, 0, n - 1); }
    function X(i) { return pts[I(i) * 3]; }
    function Y(i) { return pts[I(i) * 3 + 1]; }
    function S(i) { return pts[I(i) * 3 + 2]; }
    g.moveTo(X(0), Y(0));
    var segs = closed ? n : n - 1, ten = 0.19;
    for (i = 0; i < segs; i++) {
      var t0 = S(i) ? ten : 0, t1 = S(i + 1) ? ten : 0;
      g.bezierCurveTo(X(i) + (X(i + 1) - X(i - 1)) * t0, Y(i) + (Y(i + 1) - Y(i - 1)) * t0,
        X(i + 1) - (X(i + 2) - X(i)) * t1, Y(i + 1) - (Y(i + 2) - Y(i)) * t1, X(i + 1), Y(i + 1));
    }
    if (closed) g.closePath();
  }
  // 中点二次平滑折线：pts=[x,y,...]
  function smoothPoly(g, pts, closed, cont) {
    var n = pts.length / 2, i;
    if (!cont) g.beginPath();
    if (closed) {
      g.moveTo((pts[0] + pts[2 * n - 2]) / 2, (pts[1] + pts[2 * n - 1]) / 2);
      for (i = 0; i < n; i++) {
        var j = (i + 1) % n;
        g.quadraticCurveTo(pts[2 * i], pts[2 * i + 1], (pts[2 * i] + pts[2 * j]) / 2, (pts[2 * i + 1] + pts[2 * j + 1]) / 2);
      }
      g.closePath();
    } else {
      g.moveTo(pts[0], pts[1]);
      for (i = 1; i < n - 1; i++) g.quadraticCurveTo(pts[2 * i], pts[2 * i + 1], (pts[2 * i] + pts[2 * i + 2]) / 2, (pts[2 * i + 1] + pts[2 * i + 3]) / 2);
      g.lineTo(pts[2 * n - 2], pts[2 * n - 1]);
    }
  }
  function ell(g, cx, cy, rx, ry, rot, cont) {
    if (!cont) g.beginPath();
    rx = Math.abs(rx); ry = Math.abs(ry);
    if (g.ellipse) { g.moveTo(cx + rx * Math.cos(rot || 0), cy + rx * Math.sin(rot || 0)); g.ellipse(cx, cy, rx, ry, rot || 0, 0, PI * 2); }
    else { g.save(); g.translate(cx, cy); g.rotate(rot || 0); g.scale(1, ry / (rx || 1)); g.moveTo(rx, 0); g.arc(0, 0, rx, 0, PI * 2); g.restore(); }
  }
  function circ(g, x, y, r, cont) { if (!cont) g.beginPath(); g.moveTo(x + r, y); g.arc(x, y, r, 0, PI * 2); }
  function rrect(g, x, y, w, h, r) { K.rr(g, x, y, w, h, r); }
  // 发束（锥形弯曲片）：根部 (x0,y0) 宽 w，尖端 (x1,y1)，bend = 中线沿法线（左手侧）的偏移
  function lock(x0, y0, x1, y1, w, bend, w1) { return { x0: x0, y0: y0, x1: x1, y1: y1, w: w, b: bend || 0, w1: w1 || 0 }; }
  function lockPts(L) {
    var dx = L.x1 - L.x0, dy = L.y1 - L.y0, len = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
    var hw = L.w / 2, b = L.b, tw = L.w1 / 2;
    return {
      l0x: L.x0 + nx * hw, l0y: L.y0 + ny * hw, r0x: L.x0 - nx * hw, r0y: L.y0 - ny * hw,
      l1x: L.x0 + nx * (hw + b * 0.8) + ux * len * 0.36, l1y: L.y0 + ny * (hw + b * 0.8) + uy * len * 0.36,
      l2x: L.x0 + nx * (b * 0.9 + hw * 0.5) + ux * len * 0.76, l2y: L.y0 + ny * (b * 0.9 + hw * 0.5) + uy * len * 0.76,
      r1x: L.x0 + nx * (-hw + b * 0.8) + ux * len * 0.36, r1y: L.y0 + ny * (-hw + b * 0.8) + uy * len * 0.36,
      r2x: L.x0 + nx * (b * 0.9 - hw * 0.5) + ux * len * 0.76, r2y: L.y0 + ny * (b * 0.9 - hw * 0.5) + uy * len * 0.76,
      tlx: L.x1 + nx * tw, tly: L.y1 + ny * tw, trx: L.x1 - nx * tw, try_: L.y1 - ny * tw,
      nx: nx, ny: ny, ux: ux, uy: uy, len: len
    };
  }
  function lockPath(g, L, cont) {
    var p = lockPts(L);
    if (!cont) g.beginPath();
    g.moveTo(p.l0x, p.l0y);
    g.bezierCurveTo(p.l1x, p.l1y, p.l2x, p.l2y, p.tlx, p.tly);
    if (L.w1) g.lineTo(p.trx, p.try_);
    g.bezierCurveTo(p.r2x, p.r2y, p.r1x, p.r1y, p.r0x, p.r0y);
    g.closePath();
  }
  // 子段三次曲线（t0..1）
  function subCubic(x0, y0, x1, y1, x2, y2, x3, y3, t0) {
    var ax = lerp(x0, x1, t0), ay = lerp(y0, y1, t0), bx = lerp(x1, x2, t0), by = lerp(y1, y2, t0), cx_ = lerp(x2, x3, t0), cy_ = lerp(y2, y3, t0);
    var dx = lerp(ax, bx, t0), dy = lerp(ay, by, t0), ex = lerp(bx, cx_, t0), ey = lerp(by, cy_, t0);
    return [lerp(dx, ex, t0), lerp(dy, ey, t0), ex, ey, cx_, cy_, x3, y3];
  }
  // 发束两侧的描线（从 t0 开始，根部不描）
  function lockEdges(g, L, t0) {
    var p = lockPts(L), s;
    g.beginPath();
    s = subCubic(p.l0x, p.l0y, p.l1x, p.l1y, p.l2x, p.l2y, p.tlx, p.tly, t0);
    g.moveTo(s[0], s[1]); g.bezierCurveTo(s[2], s[3], s[4], s[5], s[6], s[7]);
    s = subCubic(p.r0x, p.r0y, p.r1x, p.r1y, p.r2x, p.r2y, p.trx, p.try_, t0);
    g.moveTo(s[0], s[1]); g.bezierCurveTo(s[2], s[3], s[4], s[5], s[6], s[7]);
  }
  // 发束中线上 t 处的点（u: -1..1 横向位置）
  function lockAt(L, t, u) {
    var p = lockPts(L);
    var lx = bz(p.l0x, p.l1x, p.l2x, p.tlx, t), ly = bz(p.l0y, p.l1y, p.l2y, p.tly, t);
    var rx = bz(p.r0x, p.r1x, p.r2x, p.trx, t), ry = bz(p.r0y, p.r1y, p.r2y, p.try_, t);
    var k = (1 - u) / 2;
    return [lerp(lx, rx, k), lerp(ly, ry, k)];
  }

  /* ====================== 图层 ====================== */
  function mkC(g, W, H, q, lw) {
    q = q || { s: 1, model: 2, tex: 2, light: 2 };
    return { g: g, W: W, H: H, q: q, s: q.s || 1, m: q.model | 0, t: q.tex | 0, l: q.light | 0, lw: lw || 1, L: null, Lg: null };
  }
  function lbegin(C) {
    if (!C.L) { C.L = K.canvas(C.W * C.s, C.H * C.s); C.Lg = C.L.getContext('2d'); }
    var g = C.Lg;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    g.clearRect(0, 0, C.L.width, C.L.height);
    g.setTransform(C.L.width / C.W, 0, 0, C.L.height / C.H, 0, 0);
    g.lineJoin = 'round'; g.lineCap = 'round';
    K.noShadow(g);
    return g;
  }
  function lend(C, a) {
    var g = C.g;
    g.save(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = a === undefined ? 1 : a;
    g.drawImage(C.L, 0, 0, C.W, C.H);
    g.restore();
  }
  // 部件：底色/纹理 → 形状内阴影 → 内线 → 外轮廓（destination-over：只出现在剪影外侧）
  function piece(C, g, o) {
    o.f(g);
    if (o.tex && C.t > 0) K.fillTex(g, C.q, o.tex[0], o.tex[1], o.tex[2], o.tex[3] || 0, o.tex[4] || 0);
    else { g.fillStyle = o.fill; g.fill(); }
    if (o.sh) { g.save(); o.f(g); g.clip(); o.sh(g); g.restore(); }
    if (o.ln && o.lw) { (o.e || o.f)(g); g.strokeStyle = o.ln; g.lineWidth = o.lw; g.stroke(); }
    if (o.ow) { g.save(); g.globalCompositeOperation = 'destination-over'; o.f(g); g.strokeStyle = o.oln || o.ln; g.lineWidth = o.ow * 2; g.stroke(); g.restore(); }
  }
  function strokeW(g, col, w) { g.strokeStyle = col; g.lineWidth = w; g.stroke(); }
  function fillC(g, col) { g.fillStyle = col; g.fill(); }

  /* ====================== 调色 ====================== */
  var palCache = {};
  // 通用材质色阶：b 底色 s 阴影 d 深阴影 l 亮部 ln 线色
  function pal(c) {
    c = c || '#808080';
    var key = 'p' + c; if (palCache[key]) return palCache[key];
    var L = lum(c), p = { b: c };
    if (L > 0.8) {
      p.s = K.mix(c, '#8890b4', 0.3); p.d = K.mix(c, '#5a6088', 0.52); p.l = '#ffffff'; p.ln = K.mix(c, '#383a58', 0.74);
    } else if (L < 0.13) {
      p.s = K.mix(c, '#000000', 0.45); p.d = K.mix(c, '#000000', 0.72); p.l = K.mix(c, '#9aa2c8', 0.2); p.ln = K.mix(c, '#000000', 0.66);
    } else {
      p.s = K.mix(K.shade(c, -0.3), '#30306a', 0.14); p.d = K.mix(K.shade(c, -0.52), '#1c1c40', 0.18);
      p.l = K.mix(K.shade(c, 0.24), '#fff2dc', 0.12); p.ln = K.mix(K.shade(c, -0.64), '#1a0c18', 0.3);
    }
    p.m = K.mix(p.b, p.s, 0.5);
    return (palCache[key] = p);
  }
  function skinPal(c) {
    c = c || '#f1d2b8';
    var key = 'k' + c; if (palCache[key]) return palCache[key];
    var p = { b: c };
    p.s = K.mix(K.mix(c, '#e0707a', 0.26), '#402040', 0.08);
    p.d = K.mix(c, '#a04a5a', 0.42);
    p.warm = K.mix(c, '#ff6248', 0.32);
    p.hl = K.mix(c, '#ffffff', 0.62);
    p.blush = '#ff7c88';
    p.ln = K.mix(K.shade(c, -0.6), '#5a1424', 0.36);
    p.lip = K.mix(c, '#d0506a', 0.32);
    p.mouth = '#5c1a28'; p.tongue = '#e06a78';
    return (palCache[key] = p);
  }
  function hairPal(c, hl2) {
    c = c || '#3a3030';
    var key = 'h' + c + (hl2 || ''); if (palCache[key]) return palCache[key];
    var L = lum(c), p = {};
    if (L < 0.12) {
      p.b = K.mix(c, '#363c56', 0.3); p.s = K.mix(c, '#000000', 0.12); p.d = K.mix(c, '#000000', 0.42);
      p.h = K.mix(p.b, '#a8b8e4', 0.42); p.ln = K.mix(c, '#000000', 0.5);
    } else if (L > 0.74) {
      p.b = c; p.s = K.mix(c, '#9890b8', 0.36); p.d = K.mix(c, '#686088', 0.58); p.h = '#ffffff'; p.ln = K.mix(c, '#463c5c', 0.7);
    } else {
      p.b = c; p.s = K.mix(K.shade(c, -0.3), '#2a2050', 0.15); p.d = K.mix(K.shade(c, -0.55), '#140c28', 0.2);
      p.h = K.mix(K.shade(c, 0.4), '#fff4e4', 0.22); p.ln = K.mix(K.shade(c, -0.66), '#180810', 0.32);
    }
    if (hl2) p.h = hl2;
    p.m = K.mix(p.b, p.s, 0.55);
    return (palCache[key] = p);
  }
  function eyePal(c) {
    c = c || '#4a3a30';
    var key = 'e' + c; if (palCache[key]) return palCache[key];
    var L = lum(c), b = L < 0.17 ? K.mix(c, '#6a5848', 0.38) : c, p = { b: b };
    p.d = K.mix(K.shade(b, -0.62), '#100818', 0.2);
    p.l = K.mix(K.shade(b, 0.55), '#ffffff', 0.08);
    p.ring = K.mix(K.shade(b, -0.72), '#000000', 0.2);
    p.pu = K.mix(K.shade(b, -0.86), '#000000', 0.3);
    return (palCache[key] = p);
  }
  // 织物纹理：返回 piece 的 tex 参数
  var CLOTH = {
    cotton: ['fabric', { threads: 20, seed: 13 }, 34, 0.05, 0.05],
    shirt: ['fabric', { threads: 24, seed: 17 }, 30, 0.035, 0.035],
    wool: ['noise', { scale: 12, oct: 3, seed: 7, contrast: 1.3 }, 44, 0.07, 0.05],
    tweed: ['fabric', { threads: 12, seed: 21 }, 34, 0.1, 0.07],
    knit: ['fabric', { threads: 8, seed: 31 }, 26, 0.12, 0.07],
    denim: ['fabric', { threads: 22, seed: 41 }, 30, 0.12, 0.09],
    leather: ['noise', { scale: 16, oct: 2, seed: 5, contrast: 1.6 }, 56, 0.06, 0.06],
    canvas: ['fabric', { threads: 14, seed: 51 }, 30, 0.08, 0.07],
    silk: null
  };
  function clothTex(c, kind) {
    var d = CLOTH[kind || 'cotton'];
    if (!d) return null;
    var o = {}, k;
    for (k in d[1]) o[k] = d[1][k];
    var L = lum(c);
    o.c1 = K.shade(c, -d[3] * (L < 0.15 ? 2.2 : 1)); o.c2 = K.shade(c, d[4] * (L < 0.15 ? 1.6 : 1));
    return [d[0], o, d[2]];
  }
