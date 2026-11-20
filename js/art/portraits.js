/* DARK MOOD 像素美术 —— 立绘（80x112 半身像）与小人（16x32）
 * 参数化「部件组合」：头型 → 后发 → 身体/服装 → 脸 → 五官（随表情） → 前发 → 配饰 → 特效
 * 每个图层单独描边（选择性深色轮廓），再按顺序合成。
 */
(function (root) {
  var DM = root.DM = root.DM || {};
  var P = DM.Pal, X = DM.Px, C = P.c;
  var W = 80, H = 112, CX = 39.5;
  var R = DM.ArtPortraits = {};

  function L() { return new X.Buf(W, H); }
  function mx(x) { return 79 - x; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ================= 角色配置（在 characters.js 的 visual 基础上细化） ================= */
  // head: f / m / square / round / child / old / long
  // eye: 见 EYES；brow: 眉粗细；body: 肩宽；smileClosed: 笑时眯眼
  var CFG = {
    ritsu: { head: 'm', eye: 'sharp', brow: 2, sh: 31, neck: 5, lash: '#141018' },
    shio: { head: 'f', eye: 'round', brow: 1, sh: 27, neck: 4, smileClosed: 1, blush: 1 },
    genzou: { head: 'square', eye: 'narrow', brow: 2, sh: 35, neck: 7, browCol: '#2a2626', wrinkles: 1 },
    kyosuke: { head: 'm', eye: 'lazy', brow: 1, sh: 31, neck: 5, smileClosed: 1 },
    hina: { head: 'f', eye: 'big_calm', brow: 1, sh: 25, neck: 4, top: 18, blush: 1 },
    shizuka: { head: 'f', eye: 'glasses_cold', brow: 1, sh: 28, neck: 4, faceLen: 42, wrinkles: 0 },
    fuwa: { head: 'square', eye: 'stern', brow: 2, sh: 39, neck: 8, top: 15 },
    kiryu: { head: 'm', eye: 'half_lidded', brow: 1, sh: 31, neck: 5 },
    kuga: { head: 'm', eye: 'smiling_narrow', brow: 1, sh: 31, neck: 5, wrinkles: 1 },
    shiori: { head: 'f', eye: 'cat', brow: 1, sh: 27, neck: 4 },
    usami: { head: 'long', eye: 'glasses_round', brow: 1, sh: 35, neck: 5, top: 14 },
    kurata: { head: 'round', eye: 'jolly', brow: 2, sh: 37, neck: 7, smileClosed: 1, top: 19 },
    mio: { head: 'f', eye: 'dreamy', brow: 1, sh: 27, neck: 4, blush: 1 },
    kotone: { head: 'f', eye: 'proud', brow: 1, sh: 24, neck: 4, top: 19, blush: 1 },
    kurokawa: { head: 'old', eye: 'old_kind', brow: 1, sh: 27, neck: 4, top: 18, wrinkles: 2, smileClosed: 1 },
    judge: { head: 'm', eye: 'mask', brow: 0, sh: 33, neck: 6 },
    chizuru: { head: 'f', eye: 'gentle', brow: 1, sh: 27, neck: 4, blush: 1, smileClosed: 1 },
    genji: { head: 'square', eye: 'gentle_tired', brow: 2, sh: 34, neck: 7, wrinkles: 1, smileClosed: 1 },
    shuji: { head: 'm', eye: 'tired_kind', brow: 2, sh: 32, neck: 6, wrinkles: 1 },
    young_ritsu: { head: 'child', eye: 'big_curious', brow: 1, sh: 23, neck: 4, child: 1 },
    young_sayo: { head: 'child', eye: 'big_round', brow: 1, sh: 21, neck: 4, child: 1, smileClosed: 1, blush: 1 },
    boatman: { head: 'old', eye: 'squint', brow: 2, sh: 32, neck: 6, wrinkles: 2 }
  };

  /* 眼型参数：w 宽，h 眼裂高，T 上睫毛厚，ar 弧度，tilt 外眼角上挑，irx/iry 虹膜半径，
   * hl 高光，flick 外眼角睫毛延伸，low 下睫毛长度，crease 双眼皮线，closed 默认闭眼类型 */
  var EYES = {
    sharp: { w: 8, h: 5, T: 2, ar: 1, tilt: 1, irx: 2.5, iry: 2.9, hl: 1, flick: 1, low: 2, crease: 0, pw: 1 },
    round: { w: 8, h: 7, T: 2, ar: 1.4, tilt: 0, irx: 2.8, iry: 3.7, hl: 2, flick: 1, low: 3, crease: 1, pw: 2 },
    narrow: { w: 8, h: 4, T: 2, ar: 0.6, tilt: 0, irx: 2.2, iry: 2.4, hl: 1, flick: 0, low: 2, crease: 0, pw: 1, bags: 1 },
    lazy: { w: 8, h: 5, T: 2, ar: 0.6, tilt: -1, irx: 2.6, iry: 3.0, hl: 1, flick: 1, low: 2, crease: 1, pw: 1, drop: 1 },
    big_calm: { w: 8, h: 7, T: 2, ar: 1.2, tilt: 0, irx: 3.0, iry: 3.8, hl: 1, flick: 1, low: 3, crease: 1, pw: 2, dull: 1, drop: 1 },
    glasses_cold: { w: 8, h: 5, T: 2, ar: 0.8, tilt: 1, irx: 2.4, iry: 2.8, hl: 1, flick: 1, low: 2, crease: 1, pw: 1 },
    stern: { w: 8, h: 4, T: 2, ar: 0.4, tilt: 0, irx: 2.0, iry: 2.3, hl: 1, flick: 0, low: 2, crease: 0, pw: 1, bags: 1 },
    half_lidded: { w: 8, h: 5, T: 2, ar: 0.4, tilt: 0, irx: 2.6, iry: 3.2, hl: 1, flick: 1, low: 2, crease: 1, pw: 1, drop: 1 },
    smiling_narrow: { w: 8, h: 4, T: 1, ar: 0.8, tilt: 0, irx: 2.2, iry: 2.5, hl: 1, flick: 1, low: 0, crease: 0, pw: 1, closed: 'happy' },
    cat: { w: 8, h: 6, T: 2, ar: 1, tilt: 2, irx: 2.6, iry: 3.3, hl: 1, flick: 2, low: 2, crease: 1, pw: 1, slit: 1 },
    glasses_round: { w: 7, h: 5, T: 1, ar: 1, tilt: 0, irx: 2.2, iry: 2.6, hl: 1, flick: 0, low: 2, crease: 0, pw: 1 },
    jolly: { w: 7, h: 3, T: 2, ar: 1, tilt: 0, irx: 2.0, iry: 2.3, hl: 1, flick: 0, low: 0, crease: 0, pw: 1, bags: 0 },
    dreamy: { w: 8, h: 7, T: 2, ar: 1.2, tilt: -1, irx: 2.9, iry: 3.7, hl: 2, flick: 1, low: 3, crease: 1, pw: 1, drop: 2, soft: 1 },
    proud: { w: 8, h: 6, T: 2, ar: 1.2, tilt: 2, irx: 2.7, iry: 3.4, hl: 2, flick: 2, low: 2, crease: 1, pw: 1 },
    old_kind: { w: 7, h: 3, T: 1, ar: 0.8, tilt: -1, irx: 2.0, iry: 2.2, hl: 1, flick: 0, low: 0, crease: 0, pw: 1, bags: 1 },
    gentle: { w: 8, h: 7, T: 2, ar: 1.4, tilt: -1, irx: 2.9, iry: 3.6, hl: 2, flick: 1, low: 3, crease: 1, pw: 2 },
    gentle_tired: { w: 7, h: 3, T: 2, ar: 0.8, tilt: -1, irx: 2.1, iry: 2.4, hl: 1, flick: 0, low: 2, crease: 0, pw: 1, bags: 1 },
    tired_kind: { w: 8, h: 5, T: 2, ar: 0.8, tilt: -1, irx: 2.4, iry: 2.8, hl: 1, flick: 0, low: 2, crease: 1, pw: 1, bags: 1 },
    big_curious: { w: 9, h: 8, T: 2, ar: 1.4, tilt: 0, irx: 3.0, iry: 3.9, hl: 2, flick: 0, low: 2, crease: 0, pw: 2 },
    big_round: { w: 9, h: 8, T: 2, ar: 1.6, tilt: 0, irx: 3.0, iry: 4.0, hl: 2, flick: 1, low: 3, crease: 0, pw: 2 },
    squint: { w: 7, h: 2, T: 2, ar: 0.6, tilt: 0, irx: 1.8, iry: 1.8, hl: 0, flick: 0, low: 0, crease: 0, pw: 1, bags: 1 }
  };

  /* 表情 → 眼睛修饰 */
  var EXM = {
    normal: {},
    smile: { raise: 1.6 },
    sad: { drop: 1, outDrop: 1.6, lookY: 0.6, tear: 1 },
    angry: { inDrop: 2.6, iris: 0.86 },
    surprise: { drop: -1, iris: 0.8, hAdd: 1 },
    think: { lookX: 1.3, lookY: -0.5, drop: 0.6 },
    shock: { drop: -1, hAdd: 1, iris: 0.42, noHL: 1 },
    dark: { drop: 1.4, iris: 0.72, noHL: 1, dark: 1 }
  };

  /* ================= 几何 ================= */
  function geom(cfg) {
    var g = {};
    var child = cfg.head === 'child';
    g.child = child;
    g.top = cfg.top || (child ? 27 : 16);
    g.hw = { f: 15, m: 15, square: 16, round: 17, child: 16, old: 14, long: 15 }[cfg.head] || 15;
    var len = cfg.faceLen || { f: 39, m: 41, square: 42, round: 40, child: 37, old: 41, long: 43 }[cfg.head] || 41;
    g.chin = g.top + len;
    g.eyeY = g.top + (child ? 22 : cfg.head === 'long' ? 22 : 20);
    g.crown = child ? 15 : 12;
    var jawStart = { f: 25, m: 26, square: 29, round: 26, child: 25, old: 26, long: 28 }[cfg.head] || 26;
    g.jaw = g.top + jawStart;
    g.chinHW = { f: 3, m: 4, square: 7, round: 7, child: 5, old: 4, long: 4.5 }[cfg.head] || 4;
    g.jawExp = { f: 1.25, m: 1.35, square: 2.2, round: 2.0, child: 1.6, old: 1.3, long: 1.4 }[cfg.head] || 1.3;
    g.noseY = g.eyeY + (child ? 8 : 9) + (cfg.head === 'long' ? 1 : 0);
    g.mouthY = g.eyeY + (child ? 12 : cfg.head === 'f' ? 13 : 14) + (cfg.head === 'long' ? 1 : 0) + (cfg.head === 'square' ? 1 : 0);
    g.neckHW = cfg.neck || 5;
    g.shY = g.chin + (child ? 5 : 6);
    g.shHW = cfg.sh || 30;
    g.shDrop = child ? 9 : 12;
    var ew = EYES[cfg.eye] ? EYES[cfg.eye].w : 8;
    g.eyeW = ew;
    g.inL = 35; g.inR = 44;            // 两眼内眼角
    return g;
  }
  function faceHW(g, y) {
    var r = y - g.top;
    if (r < 0 || y > g.chin) return -1;
    if (r < g.crown) { var q = (g.crown - r) / g.crown; return g.hw * Math.sqrt(1 - q * q); }
    if (y < g.jaw) return g.hw;
    var t = (y - g.jaw) / (g.chin - g.jaw);
    return g.hw - (g.hw - g.chinHW) * Math.pow(t, g.jawExp);
  }
  function torsoHW(g, y) {
    if (y < g.shY) return -1;
    var t = (y - g.shY) / g.shDrop;
    if (t < 1) return g.neckHW + 1 + (g.shHW - g.neckHW - 1) * (1 - Math.pow(1 - t, 2.4));
    return g.shHW + (y - g.shY - g.shDrop) * 0.07;
  }

  /* ================= 颜色 ================= */
  function skinPal(hex) {
    var b = C(hex);
    return {
      hi: P.mix(b, '#fff8f0', 0.4), base: b, sh: P.mix(P.mix(b, '#b05a66', 0.34), '#000000', 0.04),
      sh2: P.mix(b, '#6e3048', 0.55), line: P.mix(b, '#3a1424', 0.78),
      blush: P.mix(b, '#ff6a7a', 0.38), mouth: P.mix(b, '#5a1828', 0.72), inner: C('#5a1420'),
      tongue: C('#d0607a'), teeth: C('#f6f2f4')
    };
  }
  function hairPal(hex) {
    var a = P.hexRGB(hex), l = P.rgb2hsl(a[0], a[1], a[2])[2];
    if (l < 0.2) {
      // 黑发：基色略提亮并带蓝紫光泽，阴影压到近黑
      var base = P.mix(C(hex), C('#34344e'), 0.42);
      return { base: base, sh: P.mix(C(hex), C('#0a0a12'), 0.15), sh2: P.mix(C(hex), C('#000000'), 0.5),
        hi: P.mix(base, C('#6c6c98'), 0.55), hi2: P.mix(base, C('#a4a4cc'), 0.7), line: C('#050408') };
    }
    if (l > 0.72) {
      // 浅色发（白金/银）：阴影加深并偏紫，避免一片白
      var b2 = C(hex);
      return { base: b2, hi: P.mix(b2, C('#ffffff'), 0.5), hi2: C('#ffffff'), sh: P.mix(b2, C('#8a7a98'), 0.42),
        sh2: P.mix(b2, C('#5a4a6a'), 0.58), line: P.mix(b2, C('#2a2032'), 0.8) };
    }
    return P.ramp(hex);
  }

  /* ================= 发丝绘制 ================= */
  // 二次贝塞尔中线，宽度 w0→w1；逐行记录跨度，右缘画阴影、尖端加深
  function strand(b, x0, y0, x1, y1, x2, y2, w0, w1, hr, opt) {
    opt = opt || {};
    var len = Math.hypot(x1 - x0, y1 - y0) + Math.hypot(x2 - x1, y2 - y1);
    var rows = {}, N = Math.ceil(len * 3) + 10, i;
    for (i = 0; i <= N; i++) {
      var t = i / N, it = 1 - t;
      var x = it * it * x0 + 2 * it * t * x1 + t * t * x2;
      var y = it * it * y0 + 2 * it * t * y1 + t * t * y2;
      var hw = (w0 + (w1 - w0) * Math.pow(t, opt.taper || 1)) / 2;
      var yy = Math.floor(y);
      var a = x - hw, c = x + hw;
      var rr = rows[yy];
      if (!rr) rows[yy] = [a, c, t];
      else { if (a < rr[0]) rr[0] = a; if (c > rr[1]) rr[1] = c; if (t > rr[2]) rr[2] = t; }
    }
    var base = opt.base || hr.base, sh = opt.sh || hr.sh, sh2 = opt.sh2 || hr.sh2;
    var edgeFrom = opt.edgeFrom === undefined ? 0.3 : opt.edgeFrom;
    for (var k in rows) {
      var y3 = +k, s = rows[k];
      var xa = Math.round(s[0]), xb = Math.round(s[1]);
      if (xb <= xa) xb = xa + 1;
      var t = s[2], tip = t > (opt.tipAt || 0.8), wd = xb - xa;
      for (var xx = xa; xx < xb; xx++) {
        var col = tip ? sh : base;
        var edgeR = !opt.edgeLeft && xx === xb - 1, edgeL = opt.edgeLeft && xx === xa;
        if ((edgeR || edgeL) && wd >= 2 && t > edgeFrom && !opt.noEdge) col = tip ? sh2 : sh;
        if (opt.hl && xx === (opt.edgeLeft ? xb - 2 : xa + 1) && wd >= 4 && t > 0.15 && t < 0.5) col = hr.hi;
        b.px(xx, y3, col);
      }
    }
  }
  // 头顶光环高光（只覆盖 base 色像素）：断续弧线，左侧（受光侧）更粗更长
  function ringHL(b, hr, cy, half, depth) {
    var x0 = Math.round(CX - half), x1 = Math.round(CX + half);
    for (var x = x0; x <= x1; x++) {
      var d = (x + 0.5 - CX) / half;
      var y = Math.round(cy + d * d * depth * 1.6 - (1 - d * d) * 0.6);
      // 断口：中间与右侧各断一下
      var u = (x - x0) / (x1 - x0);
      if ((u > 0.36 && u < 0.42) || (u > 0.7 && u < 0.76) || u > 0.94) continue;
      var thick = u < 0.36 ? 2 : 1;
      for (var k = 0; k < thick; k++) {
        if (y + k < 0 || y + k >= H) continue;
        var i = (y + k) * W + x;
        var c = b.d[i];
        if (c === hr.base) b.d[i] = (k === 0 && u > 0.1 && u < 0.3) ? hr.hi2 : hr.hi;
        else if (c === hr.sh) b.d[i] = hr.base;
      }
    }
  }
  function cap(b, g, hr, rx, ry, cy, clipY) {
    // 头顶发团：只覆盖到发际线附近，额前由刘海发束决定形状
    clipY = Math.min(clipY, g.top + 11);
    b.clip(0, 0, W, clipY);
    b.ellipse(CX, cy, rx, ry, hr.base);
    b.clip();
  }

  /* 刘海发梢之间过窄（≤2px）的缝隙用发影色填上，避免碎线 */
  function closeGaps(f, g, hr) {
    var d = f.d;
    for (var y = g.top + 4; y < g.eyeY + 2; y++) for (var x = 2; x < W - 2; x++) {
      var i = y * W + x;
      if (d[i] || !d[i - W]) continue;
      var l = d[i - 1] || d[i - 2], r = d[i + 1] || d[i + 2];
      if (l && r && (d[i - 1] || d[i + 1])) d[i] = hr.sh;
      else if (d[i - 1] && d[i + 1]) d[i] = hr.sh;
    }
  }

  /* ================= 发型 ================= */
  // 每个函数：(back, front, g, hr, cfg) 画后发与前发
  var HAIR = {};

  HAIR.short_messy = function (bk, f, g, hr) {
    var T = g.top, E = g.eyeY, Lx = CX - g.hw, Rx = CX + g.hw;
    cap(f, g, hr, g.hw + 3, 18.5, T + 14.5, E - 2);
    // 头顶翘毛
    strand(f, CX - 4, T + 2, CX - 8, T - 3, CX - 13, T - 7, 7, 0, hr, { edgeFrom: 0 });
    strand(f, CX + 5, T + 1, CX + 10, T - 3, CX + 15, T - 5, 6, 0, hr, { edgeFrom: 0 });
    strand(f, CX + 1, T + 1, CX + 1, T - 5, CX - 2, T - 8, 5, 0, hr, { edgeFrom: 0 });
    // 鬓角：短，向外翘
    strand(f, Lx + 4, T + 7, Lx - 2, E - 3, Lx - 3, E + 6, 8, 0, hr, { edgeLeft: 1 });
    strand(f, Lx + 2, E - 6, Lx - 3, E - 1, Lx - 6, E + 2, 5, 0, hr, { edgeLeft: 1 });
    strand(f, Lx + 5, T + 12, Lx + 2, E + 1, Lx + 1, E + 8, 5, 0, hr);
    strand(f, Rx - 4, T + 7, Rx + 2, E - 3, Rx + 3, E + 6, 8, 0, hr);
    strand(f, Rx - 2, E - 6, Rx + 3, E - 1, Rx + 6, E + 1, 5, 0, hr);
    strand(f, Rx - 5, T + 12, Rx - 2, E + 1, Rx - 1, E + 7, 5, 0, hr);
    // 刘海（参差）
    var B = [[Lx + 4, Lx + 1, E + 1, 8], [Lx + 10, Lx + 8, E - 3, 8], [CX - 4, CX - 7, E - 4, 8], [CX + 1, CX + 1, E + 2, 5],
      [CX + 6, CX + 9, E - 4, 8], [Rx - 8, Rx - 5, E - 2, 7], [Rx - 3, Rx + 1, E + 1, 7]];
    for (var i = 0; i < B.length; i++) {
      var s = B[i];
      strand(f, s[0], T + 3, (s[0] + s[1]) / 2 + (i % 2 ? 2 : -2), (T + s[2]) / 2, s[1], s[2] - 1, s[3], 0, hr);
    }
    ringHL(f, hr, T + 4, g.hw - 2, 3);
  };

  HAIR.long_straight = function (bk, f, g, hr) {
    var T = g.top, E = g.eyeY, Lx = CX - g.hw, Rx = CX + g.hw, hb = { base: hr.sh, sh: hr.sh2, sh2: hr.line, hi: hr.base, hi2: hr.hi };
    // 后发：直到底部
    bk.ellipse(CX, T + 16, g.hw + 5, 20, hr.sh);
    bk.poly([Lx - 5, T + 14, Rx + 5, T + 14, Rx + 9, 112, Lx - 9, 112], hr.sh);
    for (var x = Lx - 6; x < Rx + 7; x += 4) strand(bk, x + 2, T + 30, x + 1, 80, x - 1 + (x > CX ? 2 : 0), 112, 3, 1, hb);
    cap(f, g, hr, g.hw + 4, 19.5, T + 15.5, E);
    // 侧发：从太阳穴垂到胸前
    strand(f, Lx + 2, T + 9, Lx - 4, E + 14, Lx - 3, 98, 8, 1, hr, { edgeLeft: 1, tipAt: 0.9, taper: 1.6 });
    strand(f, Lx + 5, T + 12, Lx, E + 16, Lx + 1, 86, 5, 0, hr, { tipAt: 0.9 });
    strand(f, Rx - 2, T + 9, Rx + 4, E + 14, Rx + 3, 98, 8, 1, hr, { tipAt: 0.9, taper: 1.6 });
    strand(f, Rx - 5, T + 12, Rx, E + 16, Rx - 1, 86, 5, 0, hr, { tipAt: 0.9 });
    // 刘海：略向左分，眉间一缕
    var B = [[Lx + 3, Lx + 2, E + 2, 8], [Lx + 9, Lx + 7, E - 3, 8], [CX - 4, CX - 6, E - 4, 8], [CX + 1, CX - 1, E + 1, 5],
      [CX + 6, CX + 5, E - 4, 8], [Rx - 8, Rx - 6, E - 3, 8], [Rx - 3, Rx, E + 2, 7]];
    for (var i = 0; i < B.length; i++) {
      var s = B[i];
      strand(f, s[0] + 1, T + 3, s[0], (T + s[2]) / 2, s[1], s[2] - 1, s[3], 0, hr);
    }
    ringHL(f, hr, T + 5, g.hw - 1, 3);
  };

  HAIR.long_ribbon = function (bk, f, g, hr, cfg) {
    var T = g.top, E = g.eyeY, Lx = CX - g.hw, Rx = CX + g.hw, hb = { base: hr.sh, sh: hr.sh2, sh2: hr.line, hi: hr.base, hi2: hr.hi };
    bk.ellipse(CX, T + 16, g.hw + 5, 20, hr.sh);
    bk.poly([Lx - 5, T + 14, Rx + 5, T + 14, Rx + 11, 112, Lx - 11, 112], hr.sh);
    for (var x = Lx - 8; x < Rx + 9; x += 4) strand(bk, x + 2, T + 30, x, 84, x + (x > CX ? 2 : -1), 112, 3, 1, hb);
    cap(f, g, hr, g.hw + 4, 19.5, T + 15.5, E);
    strand(f, Lx + 2, T + 9, Lx - 5, E + 16, Lx - 3, 100, 8, 1, hr, { edgeLeft: 1, tipAt: 0.9, taper: 1.6 });
    strand(f, Rx - 2, T + 9, Rx + 5, E + 16, Rx + 3, 100, 8, 1, hr, { tipAt: 0.9, taper: 1.6 });
    strand(f, Lx + 5, T + 12, Lx + 1, E + 10, Lx + 2, E + 18, 5, 0, hr);
    strand(f, Rx - 5, T + 12, Rx - 1, E + 10, Rx - 2, E + 18, 5, 0, hr);
    // 中分柔和刘海
    var B = [[Lx + 3, Lx + 1, E + 1, 8], [Lx + 9, Lx + 6, E - 3, 8], [CX - 3, CX - 7, E - 5, 8], [CX + 2, CX + 6, E - 5, 8],
      [Rx - 9, Rx - 6, E - 3, 8], [Rx - 3, Rx - 1, E + 1, 8]];
    for (var i = 0; i < B.length; i++) {
      var s = B[i];
      strand(f, s[0], T + 2, (s[0] + s[1]) / 2, (T + s[2]) / 2, s[1], s[2] - 1, s[3], 0, hr);
    }
    ringHL(f, hr, T + 5, g.hw - 1, 3);
  };

  // 背头：贴着头型、梳痕向后，鬓角短
  function sweptBack(f, g, hr, o) {
    var T = g.top, E = g.eyeY;
    var grey = o.grey ? P.mix(hr.base, C(o.grey), 0.55) : 0;
    for (var y = T - 5; y < E + 1; y++) for (var x = 0; x < W; x++) {
      var dx = (x + 0.5 - CX) / (g.hw + o.vol), dy = (y + 0.5 - (T + 14)) / (17 + o.vol);
      if (dx * dx + dy * dy > 1) continue;
      var sx = x + 0.5 - CX, u = Math.abs(sx) / g.hw;
      var hl = T + 5 + Math.pow(u, 4) * 9 + (Math.abs(sx) < 2 ? 1 : 0);
      if (u > 0.88) hl = E - 1 - (u > 1 ? 2 : 0);
      if (y > hl) continue;
      var c = hr.base;
      var k = Math.floor(sx + (sx > 0 ? -1 : 1) * (T + 6 - y) * 0.45);
      if (((k % 4) + 4) % 4 === 0 && y > T - 2) c = hr.sh;
      if (sx > g.hw * 0.5 && ((k % 4) + 4) % 4 === 1) c = hr.sh;
      if (o.part && Math.abs(sx - o.part) < 0.6 && y < T + 6) c = hr.line;
      if (grey && u > 0.8) c = (c === hr.sh) ? P.mix(grey, C('#000000'), 0.25) : grey;
      if (y >= hl - 0.5 && u < 0.88) c = P.mix(c, hr.sh, 0.5);
      f.px(x, y, c);
    }
    ringHL(f, hr, T + 1, g.hw - 3, 2);
  }
  HAIR.slicked_back = function (bk, f, g, hr) { sweptBack(f, g, hr, { vol: 2.2, grey: '#a8a6ae' }); };
  HAIR.grey_slick = function (bk, f, g, hr) { sweptBack(f, g, hr, { vol: 1.6, part: -6 }); };

  HAIR.wavy_medium = function (bk, f, g, hr) {
    var T = g.top, E = g.eyeY, Lx = CX - g.hw, Rx = CX + g.hw, hb = { base: hr.sh, sh: hr.sh2, sh2: hr.line };
    // 后发：到后颈
    bk.ellipse(CX, T + 16, g.hw + 5, 20, hr.sh);
    for (var x = Lx - 3; x <= Rx + 3; x += 5) strand(bk, x, T + 24, x + (x < CX ? -3 : 3), E + 8, x + (x < CX ? -1 : 1), E + 14, 6, 0, hb);
    cap(f, g, hr, g.hw + 4.5, 19.5, T + 15, E);
    // 侧边波浪：盖住耳朵上半，末端外翘
    strand(f, Lx + 3, T + 7, Lx - 5, E - 1, Lx - 3, E + 7, 9, 0, hr, { edgeLeft: 1 });
    strand(f, Lx - 1, E - 1, Lx - 5, E + 5, Lx - 8, E + 8, 5, 0, hr, { edgeLeft: 1 });
    strand(f, Lx + 4, T + 12, Lx + 1, E + 2, Lx + 2, E + 6, 5, 0, hr);
    strand(f, Rx - 3, T + 7, Rx + 5, E - 1, Rx + 3, E + 6, 9, 0, hr);
    strand(f, Rx + 1, E - 1, Rx + 5, E + 4, Rx + 8, E + 7, 5, 0, hr);
    strand(f, Rx - 4, T + 12, Rx - 1, E + 2, Rx - 2, E + 5, 5, 0, hr);
    // 中分卷曲刘海
    var B = [[CX - 2, Lx + 2, E - 1, 10, -6], [CX - 6, Lx + 6, E - 3, 8, -2], [CX - 1, CX - 6, E - 4, 7, 2],
      [CX + 2, Rx - 2, E - 1, 10, 6], [CX + 6, Rx - 6, E - 3, 8, 2], [CX + 1, CX + 6, E - 4, 7, -2]];
    for (var i = 0; i < B.length; i++) {
      var s = B[i];
      strand(f, s[0], T + 1, s[0] + s[4] * 2, T + 12, s[1], s[2] - 1, s[3], 0, hr, s[4] < 0 ? { edgeLeft: 1 } : null);
    }
    ringHL(f, hr, T + 4, g.hw, 3);
  };

  HAIR.hime_cut = function (bk, f, g, hr) {
    var T = g.top, E = g.eyeY, Lx = CX - g.hw, Rx = CX + g.hw, hb = { base: hr.sh, sh: hr.sh2, sh2: hr.line };
    bk.ellipse(CX, T + 16, g.hw + 5, 20, hr.sh);
    bk.poly([Lx - 5, T + 14, Rx + 5, T + 14, Rx + 9, 112, Lx - 9, 112], hr.sh);
    for (var x = Lx - 6; x < Rx + 7; x += 3) bk.vl(x, T + 34, 112, hr.sh2);
    cap(f, g, hr, g.hw + 4, 19.5, T + 15.5, E);
    // 齐刘海（平直，下缘略参差）
    f.rect(Lx - 1, T + 2, g.hw * 2 + 2, E - 6 - T - 2, hr.base);
    var by = E - 6;
    for (var x2 = Math.round(Lx); x2 < Math.round(Rx); x2++) {
      if (x2 % 4 === 1) f.px(x2, by, hr.base);
      if ((x2 + 2) % 5 === 0) f.px(x2, by - 1, hr.sh);
      f.px(x2, by - 1, (x2 % 4 === 1) ? hr.base : hr.sh);
    }
    for (var x3 = Math.round(Lx) + 2; x3 < Rx - 1; x3 += 5) f.vl(x3, T + 9, by - T - 9, hr.sh);
    // 公主切侧发：垂直切齐到下巴
    var sy = g.chin + 1;
    f.rect(Lx - 3, T + 8, 7, sy - T - 8, hr.base);
    f.rect(Rx - 4, T + 8, 7, sy - T - 8, hr.base);
    f.vl(Lx + 3, E, sy - E, hr.sh); f.vl(Lx - 1, E + 4, sy - E - 4, hr.sh);
    f.vl(Rx - 4, E, sy - E, hr.sh); f.vl(Rx, E + 4, sy - E - 4, hr.sh);
    f.hl(Lx - 3, sy - 1, 7, hr.sh); f.hl(Rx - 4, sy - 1, 7, hr.sh);
    ringHL(f, hr, T + 5, g.hw, 3);
  };

  HAIR.bun = function (bk, f, g, hr) {
    var T = g.top, E = g.eyeY, Lx = CX - g.hw, Rx = CX + g.hw;
    // 发髻（头顶偏后）
    f.ellipse(CX + 3, T - 3, 8, 6.5, hr.base);
    f.ring(CX + 3, T - 3, 8, 6.5, hr.sh);
    f.line(CX - 2, T - 6, CX + 7, T - 1, hr.sh);
    f.line(CX, T - 8, CX + 9, T - 4, hr.sh);
    f.px(CX - 1, T - 6, hr.hi); f.px(CX, T - 7, hr.hi); f.px(CX + 1, T - 7, hr.hi);
    cap(f, g, hr, g.hw + 2.5, 18, T + 15, E - 2);
    // 向后梳的发际线 + 一侧斜刘海
    strand(f, CX - 6, T + 1, Lx + 2, T + 6, Lx - 1, E + 1, 8, 2, hr, { edgeLeft: 1 });
    strand(f, CX + 8, T + 1, Rx, T + 5, Rx + 1, E + 2, 8, 2, hr);
    strand(f, CX + 2, T + 1, CX - 8, T + 6, Lx + 3, E - 3, 6, 0, hr);
    strand(f, Lx + 2, E - 4, Lx - 1, E + 4, Lx + 1, E + 12, 2, 0, hr);
    for (var i = -3; i <= 3; i++) f.line(CX + i * 4, T + 4, CX + i * 3, T - 1, hr.sh);
    // 灰发丝
    var grey = P.mix(hr.base, '#b0a8a8', 0.55);
    f.line(CX + 4, T + 4, CX + 8, T - 1, grey); f.line(Rx - 2, T + 6, Rx, E, grey);
    ringHL(f, hr, T + 1, g.hw - 3, 2);
  };

  HAIR.buzz = function (bk, f, g, hr, cfg, sk) {
    var T = g.top, E = g.eyeY, Lx = CX - g.hw, Rx = CX + g.hw;
    var mixc = P.mix(hr.base, sk.base, 0.45);
    for (var y = T - 2; y < E - 1; y++) for (var x = 0; x < W; x++) {
      var dx = (x + 0.5 - CX) / (g.hw + 1.2), dy = (y + 0.5 - (T + 15)) / 17.2;
      if (dx * dx + dy * dy > 1) continue;
      var u = Math.abs(x + 0.5 - CX) / g.hw;
      var hl = T + 6 + Math.pow(u, 5) * 14;          // 发际线：额头中央高，太阳穴处下降
      if (u > 0.86) hl = E - 3;                        // 鬓角
      if (y > hl) continue;
      var bb = X.bayer(x, y), c = hr.base;
      if (y >= hl - 0.5) c = mixc;
      else if (y < T + 5 && x < CX + 3 && (bb === 0 || bb === 10)) c = hr.hi;
      else if (x > CX + 7 && bb < 6) c = hr.sh;
      else if (bb === 7 || bb === 13) c = hr.sh;
      f.px(x, y, c);
    }
  };

  HAIR.long_tied = function (bk, f, g, hr) {
    var T = g.top, E = g.eyeY, Lx = CX - g.hw, Rx = CX + g.hw;
    cap(f, g, hr, g.hw + 3.5, 19, T + 15, E);
    // 侧发到下颌
    strand(f, Lx + 2, T + 8, Lx - 3, E + 2, Lx - 1, E + 8, 8, 0, hr, { edgeLeft: 1 });
    strand(f, Rx - 2, T + 8, Rx + 3, E + 1, Rx + 1, E + 5, 8, 0, hr);
    bk.ellipse(CX, T + 16, g.hw + 4, 19, hr.sh);
    // 偏分刘海，长的一缕遮住右眼一角
    var B = [[CX - 8, Lx + 1, E - 1, 9], [CX - 3, Lx + 7, E - 3, 8], [CX + 2, CX - 3, E - 4, 7], [CX + 5, CX + 7, E - 3, 8], [CX + 9, Rx - 3, E + 1, 8], [Rx - 3, Rx, E + 2, 7]];
    for (var i = 0; i < B.length; i++) {
      var s = B[i];
      strand(f, s[0], T + 1, (s[0] + s[1]) / 2 + 3, T + 10, s[1], s[2] - 1, s[3], 0, hr);
    }
    // 低马尾：从颈后绕到左肩前（画面右侧）
    strand(f, Rx - 1, E + 8, Rx + 7, g.chin + 10, Rx + 3, 102, 7, 1, hr, { tipAt: 0.85 });
    f.rect(Rx - 1, E + 10, 5, 3, '#6a2a2a');
    f.hl(Rx - 1, E + 10, 5, '#8a3a36');
    ringHL(f, hr, T + 4, g.hw - 1, 3);
  };

  HAIR.side_part_grey = function (bk, f, g, hr) {
    var T = g.top, E = g.eyeY, Lx = CX - g.hw, Rx = CX + g.hw;
    cap(f, g, hr, g.hw + 3, 18.5, T + 15, E - 3);
    // 侧分（分缝在画面左侧），大波浪扫向右侧
    strand(f, CX - 6, T, CX + 4, T + 2, Rx + 1, E - 4, 11, 4, hr);
    strand(f, CX - 5, T + 2, CX + 2, T + 6, Rx - 4, E - 5, 8, 0, hr);
    strand(f, CX - 7, T + 1, Lx + 2, T + 4, Lx - 1, E - 3, 7, 2, hr, { edgeLeft: 1 });
    strand(f, Lx + 1, T + 8, Lx - 1, E, Lx + 1, E + 5, 4, 1, hr);
    strand(f, Rx - 1, T + 8, Rx + 1, E, Rx - 1, E + 5, 4, 1, hr);
    f.line(CX - 6, T - 2, CX - 6, T + 3, P.mix(hr.sh, '#e8c8b0', 0.3));
    var dk = P.mix(hr.base, '#3a3a44', 0.4);
    f.line(CX - 2, T + 4, Rx - 6, E - 6, dk);
    ringHL(f, hr, T + 1, g.hw - 3, 3);
  };

  HAIR.bob_asym = function (bk, f, g, hr) {
    var T = g.top, E = g.eyeY, Lx = CX - g.hw, Rx = CX + g.hw, hb = { base: hr.sh, sh: hr.sh2, sh2: hr.line };
    bk.ellipse(CX, T + 18, g.hw + 6, 21, hr.sh);
    bk.poly([Lx - 6, T + 16, Rx + 6, T + 16, Rx + 4, g.chin - 4, Lx - 4, g.chin + 4], hr.sh);
    cap(f, g, hr, g.hw + 5, 20, T + 15, E);
    // 左侧（画面左）长、尖向前；右侧短到耳下
    strand(f, Lx + 4, T + 6, Lx - 7, E + 10, Lx + 4, g.chin + 6, 12, 1, hr, { edgeLeft: 1 });
    strand(f, Rx - 3, T + 6, Rx + 6, E + 2, Rx + 2, E + 9, 10, 1, hr);
    // 斜刘海：从右上扫向左下，遮住左眼一部分
    var B = [[Rx - 2, Rx - 1, E - 4, 8], [Rx - 8, CX + 4, E - 4, 9], [CX + 2, CX - 4, E - 3, 9], [CX - 3, Lx + 7, E - 1, 9], [Lx + 8, Lx + 2, E + 4, 9]];
    for (var i = 0; i < B.length; i++) {
      var s = B[i];
      strand(f, s[0] + 2, T + 1, (s[0] + s[1]) / 2 + 3, T + 8, s[1], s[2] - 1, s[3], 0, hr);
    }
    ringHL(f, hr, T + 4, g.hw, 3);
  };

  HAIR.neat_short = function (bk, f, g, hr) {
    var T = g.top, E = g.eyeY, Lx = CX - g.hw, Rx = CX + g.hw;
    cap(f, g, hr, g.hw + 2.5, 18, T + 15, E - 3);
    strand(f, Lx + 2, T + 6, Lx - 1, E - 4, Lx + 1, E + 4, 5, 2, hr, { edgeLeft: 1 });
    strand(f, Rx - 2, T + 6, Rx + 1, E - 4, Rx - 1, E + 4, 5, 2, hr);
    var B = [[CX + 8, Lx + 3, E - 5, 10], [CX + 3, CX - 6, E - 4, 9], [CX + 10, CX + 2, E - 5, 8], [Rx - 2, Rx - 5, E - 5, 8]];
    for (var i = 0; i < B.length; i++) {
      var s = B[i];
      strand(f, s[0], T, (s[0] + s[1]) / 2, T + 4, s[1], s[2] - 1, s[3], 0, hr);
    }
    ringHL(f, hr, T + 1, g.hw - 2, 2);
  };

  HAIR.short_neat = function (bk, f, g, hr) {
    var T = g.top, E = g.eyeY, Lx = CX - g.hw, Rx = CX + g.hw;
    cap(f, g, hr, g.hw + 3, 18.5, T + 15, E - 3);
    strand(f, Lx + 2, T + 6, Lx - 1, E - 3, Lx + 1, E + 5, 6, 2, hr, { edgeLeft: 1 });
    strand(f, Rx - 2, T + 6, Rx + 1, E - 3, Rx - 1, E + 5, 6, 2, hr);
    var B = [[CX - 5, Lx + 2, E - 4, 9], [CX, CX - 7, E - 3, 9], [CX + 5, CX + 2, E - 4, 9], [CX + 9, Rx - 3, E - 2, 8], [Rx - 2, Rx, E - 3, 6]];
    for (var i = 0; i < B.length; i++) {
      var s = B[i];
      strand(f, s[0], T, (s[0] + s[1]) / 2 + 1, T + 6, s[1], s[2] - 1, s[3], 0, hr);
    }
    ringHL(f, hr, T + 2, g.hw - 2, 2);
  };

  HAIR.cropped_grey = function (bk, f, g, hr) {
    var T = g.top, E = g.eyeY, Lx = CX - g.hw, Rx = CX + g.hw;
    cap(f, g, hr, g.hw + 2.5, 18, T + 15, E - 4);
    // 短而乱的刘海尖
    for (var i = 0; i < 8; i++) {
      var x = Lx + 2 + i * 4;
      strand(f, x, T + 2, x + (i % 2 ? 1 : -1), T + 6, x + (i % 3 - 1) * 2, T + 9 + (i % 3) * 2, 5, 0, hr);
    }
    strand(f, Lx + 2, T + 6, Lx - 1, E - 4, Lx + 1, E + 2, 5, 1, hr, { edgeLeft: 1 });
    strand(f, Rx - 2, T + 6, Rx + 1, E - 4, Rx - 1, E + 2, 5, 1, hr);
    f.speckle(Lx, T - 2, g.hw * 2, 12, P.mix(hr.base, '#a8a8a8', 0.5), 0.08, X.rng('genji-hair'), true);
    ringHL(f, hr, T + 1, g.hw - 3, 2);
  };

  HAIR.loose_wavy_long = function (bk, f, g, hr) {
    var T = g.top, E = g.eyeY, Lx = CX - g.hw, Rx = CX + g.hw, hb = { base: hr.sh, sh: hr.sh2, sh2: hr.line };
    // 后发：宽大波浪
    bk.ellipse(CX, T + 17, g.hw + 7, 22, hr.sh);
    var pts = [];
    for (var y = T + 16; y <= 112; y += 2) pts.push(Lx - 8 - Math.sin(y / 6) * 3 - (y - T) * 0.05, y);
    for (var y2 = 112; y2 >= T + 16; y2 -= 2) pts.push(Rx + 8 + Math.sin(y2 / 6 + 1) * 3 + (y2 - T) * 0.05, y2);
    bk.poly(pts, hr.sh);
    for (var x = Lx - 8; x < Rx + 9; x += 5) strand(bk, x, T + 30, x - 4, 76, x + 2, 112, 3, 1, hb);
    cap(f, g, hr, g.hw + 5, 20, T + 15, E);
    // 波浪侧发垂于胸前
    strand(f, Lx + 2, T + 9, Lx - 8, E + 12, Lx - 1, 94, 9, 2, hr, { edgeLeft: 1, tipAt: 0.88 });
    strand(f, Lx - 2, E + 20, Lx - 7, E + 34, Lx - 2, 104, 6, 0, hr, { edgeLeft: 1 });
    strand(f, Rx - 2, T + 9, Rx + 8, E + 12, Rx + 1, 94, 9, 2, hr, { tipAt: 0.88 });
    strand(f, Rx + 2, E + 20, Rx + 7, E + 34, Rx + 2, 104, 6, 0, hr);
    // 柔软凌乱刘海
    var B = [[Lx + 4, Lx + 1, E + 2, 8, -3], [Lx + 10, Lx + 9, E - 3, 8, 3], [CX - 3, CX - 2, E - 4, 8, -3], [CX + 2, CX + 4, E + 1, 5, 3],
      [CX + 7, CX + 8, E - 3, 8, -2], [Rx - 6, Rx - 4, E - 2, 8, 3], [Rx - 2, Rx + 1, E + 3, 6, -2]];
    for (var i = 0; i < B.length; i++) {
      var s = B[i];
      strand(f, s[0], T + 2, s[0] + s[4], (T + s[2]) / 2, s[1], s[2] - 1, s[3], 0, hr);
    }
    ringHL(f, hr, T + 5, g.hw, 3);
  };

  HAIR.twin_tails = function (bk, f, g, hr) {
    var T = g.top, E = g.eyeY, Lx = CX - g.hw, Rx = CX + g.hw, hb = { base: hr.base, sh: hr.sh, sh2: hr.sh2 };
    // 双马尾（在身体后面，从头侧伸出）
    strand(bk, Lx + 2, T + 6, Lx - 18, T + 30, Lx - 10, 110, 12, 4, hb, { edgeLeft: 1, tipAt: 0.85 });
    strand(bk, Lx - 3, T + 30, Lx - 16, T + 56, Lx - 14, 106, 6, 0, { base: hr.sh, sh: hr.sh2, sh2: hr.line });
    strand(bk, Rx - 2, T + 6, Rx + 18, T + 30, Rx + 10, 110, 12, 4, hb, { tipAt: 0.85 });
    strand(bk, Rx + 3, T + 30, Rx + 16, T + 56, Rx + 14, 106, 6, 0, { base: hr.sh, sh: hr.sh2, sh2: hr.line });
    bk.ellipse(CX, T + 16, g.hw + 3, 19, hr.sh);
    cap(f, g, hr, g.hw + 4, 19.5, T + 15.5, E);
    strand(f, Lx + 2, T + 9, Lx - 2, E + 6, Lx, g.chin - 4, 6, 1, hr, { edgeLeft: 1 });
    strand(f, Rx - 2, T + 9, Rx + 2, E + 6, Rx, g.chin - 4, 6, 1, hr);
    var B = [[Lx + 3, Lx + 2, E + 1, 8], [Lx + 9, Lx + 8, E - 3, 8], [CX - 3, CX - 3, E - 2, 7], [CX + 3, CX + 2, E - 4, 7],
      [Rx - 9, Rx - 8, E - 2, 8], [Rx - 3, Rx - 2, E, 8]];
    for (var i = 0; i < B.length; i++) {
      var s = B[i];
      strand(f, s[0], T + 2, s[0] + (i % 2 ? 1 : -1), (T + s[2]) / 2, s[1], s[2] - 1, s[3], 0, hr);
    }
    ringHL(f, hr, T + 5, g.hw - 1, 3);
  };

  HAIR.twin_braids = function (bk, f, g, hr) {
    var T = g.top, E = g.eyeY, Lx = CX - g.hw, Rx = CX + g.hw;
    cap(f, g, hr, g.hw + 3.5, 19, T + 15, E);
    // 麻花辫：垂在肩前
    function braid(x0, y0, dir) {
      var y = y0, x = x0;
      for (var k = 0; k < 9; k++) {
        f.ellipse(x + 0.5, y + 2.5, 3.6, 3.2, hr.base);
        f.line(x - 2, y + 1, x + 2, y + 4, hr.sh);
        f.px(x - 1, y, hr.hi);
        y += 4; x += dir * (k < 4 ? 0.5 : 0.2);
      }
      f.rect(x - 1, y + 1, 4, 2, '#d04050');
      strand(f, x + 0.5, y + 3, x, y + 6, x + 0.5, y + 9, 5, 2, hr);
    }
    braid(Lx - 1, E + 4, -1);
    braid(Rx - 1, E + 4, 1);
    strand(f, Lx + 2, T + 8, Lx - 2, E, Lx - 1, E + 6, 7, 3, hr, { edgeLeft: 1 });
    strand(f, Rx - 2, T + 8, Rx + 2, E, Rx + 1, E + 6, 7, 3, hr);
    var B = [[Lx + 4, Lx + 3, E - 2, 9], [CX - 4, CX - 6, E - 3, 9], [CX + 2, CX + 1, E - 4, 8], [Rx - 6, Rx - 5, E - 3, 9], [Rx - 2, Rx, E - 1, 7]];
    for (var i = 0; i < B.length; i++) {
      var s = B[i];
      strand(f, s[0], T + 3, s[0], (T + s[2]) / 2, s[1], s[2] - 1, s[3], 0, hr);
    }
    ringHL(f, hr, T + 5, g.hw - 1, 3);
  };

  HAIR.bandana = function (bk, f, g, hr) {
    var T = g.top, E = g.eyeY, Lx = CX - g.hw, Rx = CX + g.hw;
    strand(f, Lx + 2, T + 8, Lx - 1, E - 4, Lx + 1, E + 2, 5, 1, hr, { edgeLeft: 1 });
    strand(f, Rx - 2, T + 8, Rx + 1, E - 4, Rx - 1, E + 2, 5, 1, hr);
    // 刘海从帽檐下露出一点
    for (var i = 0; i < 7; i++) {
      var x = Lx + 4 + i * 4;
      strand(f, x, T + 4, x - 1, T + 7, x - 2, T + 10 + (i % 2), 4, 0, hr);
    }
  };

  HAIR.cap = function (bk, f, g, hr) {
    var T = g.top, E = g.eyeY, Lx = CX - g.hw, Rx = CX + g.hw;
    var gr = { base: C('#9a9aa0'), sh: C('#6a6a74'), sh2: C('#4a4a54'), hi: C('#c8c8cc') };
    strand(f, Lx + 2, T + 9, Lx - 2, E - 3, Lx, E + 3, 5, 1, gr, { edgeLeft: 1 });
    strand(f, Lx + 1, T + 11, Lx - 3, E - 4, Lx - 4, E - 1, 3, 0, gr, { edgeLeft: 1 });
    strand(f, Rx - 2, T + 9, Rx + 2, E - 3, Rx, E + 3, 5, 1, gr);
    strand(f, Rx - 1, T + 11, Rx + 3, E - 4, Rx + 4, E - 1, 3, 0, gr);
  };

  HAIR.hood = function () { /* 由面具/兜帽代码绘制 */ };

  /* ================= 眼睛 ================= */
  function eyePal(cfg, vis, sk) {
    var ic = C(vis.eyeColor || '#404050');
    var lash = C(cfg.lash || P.hex(P.mix(P.ramp(vis.hairColor || '#202020').line, '#120a10', 0.5)));
    return {
      K: lash, K2: P.mix(lash, sk.sh2, 0.45),
      W: C('#f4f2f8'), w: C('#c4bed6'),
      D: P.mix(ic, '#0a0610', 0.45), I: ic, L: P.mix(ic, '#e8f0ff', 0.4),
      P: P.mix(ic, '#05030a', 0.75), H: C('#ffffff'), H2: P.mix(ic, '#ffffff', 0.65),
      T: C('#a8d8ff'), crease: sk.sh
    };
  }

  function drawEye(b, side, g, e, x, ep, sk) {
    var w = e.w, inner = side < 0 ? g.inL : g.inR;
    var by = g.eyeY + (x.y || 0);
    var h = e.h + (x.hAdd || 0);
    function ax(u) { return side < 0 ? inner - (w - 1) + u : inner + (w - 1) - u; }
    var m = (w - 1) * 0.58;
    var drop = (e.drop || 0) * (x.keepDrop ? 1 : (x.drop < 0 ? 0 : 1)) + (x.drop || 0);
    function topOff(u) {
      var d = (u - m) / ((w - 1) * 0.58);
      var off = e.ar * d * d;
      off -= (e.tilt || 0) * (1 - u / (w - 1));
      off += drop;
      var ui = u / (w - 1);
      off += (x.inDrop || 0) * ui * ui;
      off += (x.outDrop || 0) * (1 - ui) * (1 - ui);
      return Math.round(off);
    }
    function botOff(u) {
      var r = h - 1;
      if (u === 0 || u === w - 1) r -= 1;
      if (x.raise) { var d = (u - (w - 1) / 2) / ((w - 1) / 2); r -= Math.round(x.raise * (1 - d * d * 0.7)); }
      return r;
    }
    // 闭眼
    var closed = x.closed || (e.closed && !x.open ? e.closed : null);
    if (closed) {
      for (var u = -1; u <= w - 1; u++) {
        var d2 = (u - (w - 1) / 2) / ((w - 1) / 2);
        var yy;
        if (closed === 'happy') yy = by + Math.round(h * 0.55 + d2 * d2 * 2.2) - 1;
        else if (closed === 'line') yy = by + Math.round(h * 0.5);
        else yy = by + Math.round(h * 0.4 - d2 * d2 * 1.6) + 1;
        if (u < 0) { if (closed === 'happy') b.px(ax(0) + (side < 0 ? -1 : 1), yy + 1, ep.K2); continue; }
        b.px(ax(u), yy, ep.K);
        if (e.T > 1 && Math.abs(d2) < 0.7) b.px(ax(u), yy + (closed === 'happy' ? -1 : 1), ep.K);
      }
      return;
    }
    var irx = e.irx * (x.iris || 1), iry = e.iry * (x.iris || 1);
    var lookX = x.lookX || 0, lookY = x.lookY || 0;
    var icx = ax((w - 1) / 2) + 0.5 + (side < 0 ? 0.35 : -0.35) + lookX;
    var icy = by + h / 2 + 0.6 + lookY;
    if (x.iris && x.iris < 0.6) icy = by + h / 2 + 0.2;
    var tops = [], bots = [];
    for (var u2 = 0; u2 < w; u2++) {
      var ty = by + topOff(u2), bt = by + botOff(u2), px = ax(u2);
      tops[u2] = ty; bots[u2] = bt;
      for (var yy2 = ty; yy2 <= bt; yy2++) {
        var col = (yy2 === ty) ? ep.w : ep.W;
        var dx = (px + 0.5 - icx) / irx, dy = (yy2 + 0.5 - icy) / iry;
        if (dx * dx + dy * dy <= 1) {
          var r = (yy2 + 0.5 - (icy - iry)) / (iry * 2);
          col = r < 0.3 ? ep.D : r > 0.72 ? ep.L : ep.I;
          if (yy2 === ty) col = ep.D;
          if (e.dull && r > 0.72) col = ep.I;
        }
        b.px(px, yy2, col);
      }
    }
    // 瞳孔
    var pw = x.iris && x.iris < 0.6 ? 1 : e.pw || 1;
    var pcx = Math.floor(icx - pw / 2 + 0.01), pcy = Math.round(icy - 1.2);
    if (e.slit && !(x.iris < 0.6)) { b.pxOn(pcx, pcy - 1, ep.P); b.pxOn(pcx, pcy, ep.P); b.pxOn(pcx, pcy + 1, ep.P); }
    else for (var py = pcy; py < pcy + (iry > 2.6 ? 2 : 1); py++) for (var pq = 0; pq < pw; pq++) {
      var pi = py * W + pcx + pq;
      if (py >= tops[0] - 3 && b.d[pi] && b.d[pi] !== ep.W && b.d[pi] !== ep.w) b.d[pi] = ep.P;
    }
    if (x.iris && x.iris < 0.6) { b.px(Math.floor(icx - 0.5), Math.round(icy - 0.5), ep.P); b.px(Math.floor(icx - 0.5), Math.round(icy - 1.5), ep.D); }
    // 高光（固定在左上）
    if (!x.noHL && e.hl) {
      var hx = Math.round(icx - irx + 0.6), hy = Math.round(icy - iry + 1.2);
      var hlcol = e.dull ? ep.H2 : ep.H;
      for (var a = 0; a < e.hl; a++) for (var c2 = 0; c2 < e.hl; c2++) {
        var hy2 = hy + a, hx2 = hx + c2, idx = hy2 * W + hx2;
        if (b.d[idx] && b.d[idx] !== ep.W && b.d[idx] !== ep.w && b.d[idx] !== ep.K) b.d[idx] = hlcol;
      }
      if (e.hl >= 2 && !e.dull) { var sx = Math.round(icx + irx - 2), sy = Math.round(icy + iry - 2.5); var si = sy * W + sx; if (b.d[si] === ep.L || b.d[si] === ep.I) b.d[si] = ep.H2; }
    }
    if (x.dark) {
      // 阴影中的眼：只剩一点诡异的光
      var gx = Math.round(icx - 0.5), gy = Math.round(icy - 0.5);
      b.px(gx, gy, P.mix(ep.I, '#ff4060', 0.5));
    }
    // 上睫毛
    for (var u3 = -(e.flick || 0); u3 < w; u3++) {
      var uu = clamp(u3, 0, w - 1);
      var ty3 = tops[uu];
      var T = e.T;
      if (u3 === w - 1) T = Math.max(1, T - 1);
      if (u3 < 0) { b.px(ax(0) + (side < 0 ? u3 : -u3), ty3 - 1 - u3 * -1 + 1, ep.K); continue; }
      for (var k = 1; k <= T; k++) b.px(ax(u3), ty3 - k, ep.K);
    }
    // 外眼角向下的一点
    b.px(ax(0) + (side < 0 ? -1 : 1), tops[0] + 0, ep.K2);
    // 双眼皮线
    if (e.crease && !x.inDrop) for (var u4 = 1; u4 < w - 2; u4++) b.px(ax(u4), tops[u4] - e.T - 2, ep.crease);
    // 下睫毛
    for (var u5 = 0; u5 < (e.low || 0); u5++) b.px(ax(u5), bots[u5] + 1, ep.K2);
    if (e.low) b.px(ax(0), bots[0], ep.K2);
    // 眼袋/皱纹
    if (e.bags) for (var u6 = 1; u6 < w - 2; u6++) b.px(ax(u6), bots[u6] + 2, sk.sh);
    // 泪光
    if (x.tear) {
      for (var u7 = 1; u7 < w - 1; u7++) { var ii = bots[u7] * W + ax(u7); if (b.d[ii]) b.d[ii] = ep.T; }
      b.px(ax(w - 2), bots[w - 2] + 1, ep.T);
    }
  }

  /* ================= 眉毛 ================= */
  var BROW = {
    normal: [1, 0, 1], smile: [1, -1, 0], sad: [1, 0, -2], angry: [-1, 1, 3], surprise: [-1, -3, -2],
    think: [1, 0, 1], shock: [0, -2, -3], dark: [0, 1, 2]
  };
  function drawBrows(b, g, cfg, e, expr, col) {
    var th = cfg.brow || 1;
    var by = g.eyeY - (e.T || 2) - 2 + (e.drop ? 1 : 0);
    if (cfg.head === 'child') by -= 1;
    var w = Math.max(7, g.eyeW);
    for (var s = -1; s <= 1; s += 2) {
      var pts = BROW[expr] || BROW.normal;
      if (expr === 'think' && s > 0) pts = [-1, -2, -1];
      var inner = s < 0 ? g.inL + 1 : g.inR - 1;
      for (var u = 0; u < w; u++) {
        var t = u / (w - 1);
        var oy = t < 0.5 ? pts[0] + (pts[1] - pts[0]) * t * 2 : pts[1] + (pts[2] - pts[1]) * (t - 0.5) * 2;
        var x = s < 0 ? inner - (w - 1) + u : inner + (w - 1) - u;
        var y = by + Math.round(oy);
        var tt = th;
        if (th === 1 && u > 1 && u < w - 1) tt = (u > w * 0.5 ? 2 : 1);
        if (th === 1 && (cfg.head === 'f' || cfg.head === 'child')) tt = 1;
        if (u === 0) tt = 1;
        for (var k = 0; k < tt; k++) b.px(x, y + k, col);
      }
    }
  }

  /* ================= 嘴 ================= */
  var MOUTH = {
    normal: ['MM'],
    normal_m: ['MMMM'],
    smile: ['M..M', '.MM.'],
    smile_open: ['MMMMMM', 'MRRRRM', '.MUUM.', '..MM..'],
    smile_open_f: ['MMMM', 'MRRM', '.MM.'],
    sad: ['.MM.', 'M..M'],
    angry: ['MMMMMM', 'MTTTTM', 'MRRRRM', '.MMMM.'],
    surprise: ['.MM.', 'MRRM', 'MRRM', '.MM.'],
    think: ['.MMM', 'M...'],
    shock: ['..MM..', '.MRRM.', 'MRRRRM', 'MRUURM', '.MMMM.'],
    dark: ['M......M', '.MTTTTM.', '..MRRM..', '...MM...']
  };
  function drawMouth(b, g, cfg, expr, sk) {
    var key = expr;
    if (expr === 'normal' && (cfg.head !== 'f' && cfg.head !== 'child')) key = 'normal_m';
    if (expr === 'smile' && cfg.smileClosed) key = (cfg.head === 'f' || cfg.head === 'child') ? 'smile_open_f' : 'smile_open';
    var rows = MOUTH[key] || MOUTH.normal;
    var w = rows[0].length;
    var x0 = Math.round(CX - w / 2), y0 = g.mouthY;
    if (expr === 'think') x0 += 1;
    var map = { M: sk.mouth, R: sk.inner, T: sk.teeth, U: sk.tongue };
    X.stamp(b, x0, y0, rows, map);
    if (key === 'normal' || key === 'normal_m') b.px(x0 + 1, y0 + 1, sk.sh);
  }

  /* ================= 头部（皮肤） ================= */
  function drawHead(hd, g, cfg, sk) {
    for (var y = g.top; y <= g.chin; y++) {
      var hw = faceHW(g, y);
      if (hw <= 0) continue;
      var xa = Math.round(CX - hw), xb = Math.round(CX + hw);
      hd.rect(xa, y, xb - xa, 1, sk.base);
      // 右侧阴影（光从左上来）
      var sw = y > g.jaw ? 3 : 2;
      hd.rect(xb - sw, y, sw, 1, sk.sh);
      if (y > g.jaw + (g.chin - g.jaw) * 0.6) hd.rect(xa, y, 1, 1, sk.sh);
    }
    // 下巴底部阴影
    var hw2 = faceHW(g, g.chin);
    hd.rect(Math.round(CX - hw2), g.chin, Math.round(hw2 * 2), 1, sk.sh);
    // 耳朵
    var ey = g.eyeY + 2;
    var lx = Math.round(CX - g.hw) - 2, rx = Math.round(CX + g.hw);
    hd.rect(lx, ey, 2, 7, sk.base); hd.px(lx, ey, 0); hd.px(lx + 1, ey + 3, sk.sh); hd.px(lx + 1, ey + 4, sk.sh);
    hd.rect(rx, ey, 2, 7, sk.sh); hd.px(rx + 1, ey, 0); hd.px(rx, ey + 3, sk.sh2); hd.px(rx, ey + 4, sk.sh2);
    // 脸颊高光
    hd.px(Math.round(CX - g.hw) + 3, g.eyeY + 8, sk.hi);
  }

  /* ================= 身体与服装 ================= */
  function torsoFill(b, g, col, extra) {
    extra = extra || 0;
    for (var y = g.shY; y < H; y++) {
      var hw = torsoHW(g, y) + extra;
      if (hw <= 0) continue;
      b.rect(Math.round(CX - hw), y, Math.round(hw * 2), 1, col);
    }
  }
  function neck(b, g, sk, cfg) {
    var nw = g.neckHW;
    b.rect(Math.round(CX - nw), g.chin - 8, nw * 2, g.shY - g.chin + 14, sk.base);
    b.rect(Math.round(CX + nw) - 2, g.chin - 8, 2, g.shY - g.chin + 14, sk.sh);
    b.rect(Math.round(CX - nw), g.chin + 1, nw * 2, 3, sk.sh);
    b.rect(Math.round(CX - nw) + 2, g.chin + 1, nw * 2 - 4, 1, sk.sh2);
  }
  // 通用衣物阴影：只改基色像素
  function shadeCloth(b, g, cr, opt) {
    opt = opt || {};
    var base = cr.base;
    for (var y = g.shY; y < H; y++) {
      var hw = torsoHW(g, y);
      var xr = Math.round(CX + hw), xl = Math.round(CX - hw);
      for (var x = 0; x < W; x++) {
        var i = y * W + x;
        if (b.d[i] !== base) continue;
        var up = y > 0 ? b.d[i - W] : 0;
        if (x >= xr - 4) b.d[i] = cr.sh;
        else if (!up && x < CX) b.d[i] = cr.hi;
        else if (!up) b.d[i] = cr.base;
        // 手臂与躯干之间的褶线
        var fold = Math.round(g.shHW - 7 + (y - g.shY) * 0.05);
        if (y > g.shY + g.shDrop + 4 && (x === Math.round(CX - fold) || x === Math.round(CX + fold))) b.d[i] = (x < CX ? cr.sh : cr.sh2);
        if (y > g.shY + g.shDrop + 4 && x === Math.round(CX + fold) + 1) b.d[i] = cr.sh;
      }
    }
    // 颈下投影
    if (!opt.noNeckShadow) for (var y2 = g.shY; y2 < g.shY + 3; y2++) for (var x2 = Math.round(CX - g.neckHW - 4); x2 < Math.round(CX + g.neckHW + 4); x2++) {
      var j = y2 * W + x2;
      if (b.d[j] === cr.base || b.d[j] === cr.hi) b.d[j] = cr.sh;
    }
  }
  function vShape(b, g, topHW, depth, col, yOff) {
    var y0 = g.shY - 4 + (yOff || 0);
    b.poly([CX - topHW, y0, CX + topHW, y0, CX + 0.5, g.shY + depth, CX - 0.5, g.shY + depth], col);
  }
  function lapel(b, g, side, o) {
    // side -1: 画面左；o: {top, depth, width, col, edge, notch}
    var s = side, y0 = g.shY - 3;
    var ix0 = CX + s * o.top, iy1 = g.shY + o.depth;
    var pts = [ix0, y0, CX + s * (o.top + o.width), y0 + 4, CX + s * (o.top + o.width + 3), g.shY + o.depth * 0.45, CX + s * 1.5, iy1 + 6, CX + s * 0.5, iy1];
    b.poly(pts, o.col);
    b.line(ix0, y0, CX + s * 0.5, iy1, o.edge);
    b.line(CX + s * (o.top + o.width + 3), g.shY + o.depth * 0.45, CX + s * 1.5, iy1 + 6, o.edge2 || o.edge);
    if (o.notch) {
      var nx = CX + s * (o.top + o.width + 1), ny = y0 + 6;
      b.poly([nx, ny, nx + s * 3, ny + 1, nx + s * 1, ny + 3], o.notchCol || o.edge);
    }
  }
  function shirtCollar(b, g, col, sh, hw, len) {
    hw = hw || 6; len = len || 7;
    var y0 = g.shY - 4;
    b.poly([CX - hw - 1, y0, CX - 1, y0 + len, CX - hw + 2, y0 + len - 1, CX - hw - 2, y0 + 3], col);
    b.poly([CX + hw + 1, y0, CX + 1, y0 + len, CX + hw - 2, y0 + len - 1, CX + hw + 2, y0 + 3], col);
    b.line(CX - hw - 1, y0 + 2, CX - 1, y0 + len, sh);
    b.line(CX + hw + 1, y0 + 2, CX + 1, y0 + len, sh);
  }
  function tie(b, g, tr, y0, len) {
    b.rect(CX - 2, y0, 4, 3, tr.base); b.px(CX - 2, y0, tr.hi); b.px(CX + 1, y0 + 2, tr.sh);
    b.poly([CX - 2, y0 + 3, CX + 2, y0 + 3, CX + 3, y0 + len - 2, CX, y0 + len, CX - 3, y0 + len - 2], tr.base);
    b.line(CX + 1, y0 + 4, CX + 2, y0 + len - 2, tr.sh);
    b.line(CX - 1, y0 + 4, CX - 2, y0 + len - 3, tr.hi);
  }
  function bowtie(b, cx, y, tr) {
    b.poly([cx - 5, y - 2, cx, y, cx - 5, y + 3], tr.base);
    b.poly([cx + 5, y - 2, cx, y, cx + 5, y + 3], tr.base);
    b.rect(cx - 1, y - 1, 2, 3, tr.hi);
    b.px(cx - 4, y + 1, tr.sh); b.px(cx + 3, y + 1, tr.sh);
  }
  function buttons(b, x, ys, col, hi) {
    for (var i = 0; i < ys.length; i++) { b.px(x, ys[i], col); if (hi) b.px(x - 1, ys[i] - 1, hi); }
  }

  var OUTFIT = {};

  // 外套（律）
  OUTFIT.coat = function (b, g, o, sk) {
    torsoFill(b, g, o.c.base);
    // 立领在颈后
    b.rect(CX - g.neckHW - 3, g.shY - 5, g.neckHW * 2 + 6, 6, o.c.sh);
    neck(b, g, sk);
    vShape(b, g, 7, 26, o.i.base);
    b.poly([CX - 2, g.shY + 4, CX + 2, g.shY + 4, CX + 1, g.shY + 26, CX - 1, g.shY + 26], o.i.sh);
    shirtCollar(b, g, o.i.hi, o.i.sh, 6, 8);
    b.px(CX - 0.5, g.shY + 8, o.i.sh2); b.px(CX - 0.5, g.shY + 14, o.i.sh2);
    lapel(b, g, -1, { top: 7, depth: 30, width: 6, col: o.c.hi, edge: o.c.sh2, notch: 1, notchCol: o.c.line });
    lapel(b, g, 1, { top: 7, depth: 30, width: 6, col: o.c.base, edge: o.c.sh2, notch: 1, notchCol: o.c.line });
    shadeCloth(b, g, o.c);
    // 前襟线与纽扣
    b.vl(CX - 1, g.shY + 36, H, o.c.sh2);
    buttons(b, CX - 4, [g.shY + 40, g.shY + 48], o.c.line, o.c.hi);
  };

  // 水手服 + 开襟毛衣（汐）
  OUTFIT.sailor_cardigan = function (b, g, o, sk) {
    torsoFill(b, g, o.c.base);
    neck(b, g, sk);
    vShape(b, g, 6, 24, '#f2f0f4');
    b.rect(CX - 4, g.shY + 20, 8, H, '#ecebf0');
    b.vl(CX - 4, g.shY + 20, H, o.c.sh2); b.vl(CX + 3, g.shY + 20, H, o.c.sh2);
    var navy = P.ramp('#28304e');
    // 水手领
    for (var s = -1; s <= 1; s += 2) {
      var pts = [CX + s * 6, g.shY - 4, CX + s * 21, g.shY + 1, CX + s * 20, g.shY + 7, CX + s * 1.5, g.shY + 25];
      b.poly(pts, navy.base);
      b.line(CX + s * 19, g.shY + 4, CX + s * 3, g.shY + 21, '#e8e8f0');
      b.line(CX + s * 6, g.shY - 3, CX + s * 1, g.shY + 21, navy.hi);
    }
    shadeCloth(b, g, o.c);
    // 红色领巾
    var red = P.ramp(o.inner);
    b.poly([CX - 4, g.shY + 18, CX + 4, g.shY + 18, CX + 3, g.shY + 23, CX - 3, g.shY + 23], red.base);
    b.poly([CX - 3, g.shY + 23, CX, g.shY + 23, CX - 4, g.shY + 34, CX - 6, g.shY + 32], red.base);
    b.poly([CX, g.shY + 23, CX + 3, g.shY + 23, CX + 6, g.shY + 32, CX + 4, g.shY + 34], red.sh);
    b.hl(CX - 3, g.shY + 18, 6, red.hi);
    // 毛衣纽扣与针织纹
    buttons(b, CX - 6, [g.shY + 28, g.shY + 36, g.shY + 44], o.c.line, o.c.hi);
    for (var y = g.shY + 22; y < H; y += 3) { b.pxOn(CX + 10, y, o.c.sh); b.pxOn(CX - 12, y + 1, o.c.sh); b.pxOn(CX + 18, y + 1, o.c.sh); }
  };

  OUTFIT.suit_vest = function (b, g, o, sk) {
    torsoFill(b, g, o.c.base);
    neck(b, g, sk);
    vShape(b, g, 7, 32, o.c.sh2);
    // 马甲
    var vest = P.ramp(P.hex(P.mix(o.c.base, '#5a4630', 0.5)));
    vShape(b, g, 6, 30, vest.base);
    vShape(b, g, 5, 14, o.i.base);
    shirtCollar(b, g, o.i.hi, o.i.sh, 6, 7);
    tie(b, g, P.ramp('#6a1a24'), g.shY - 1, 16);
    buttons(b, CX, [g.shY + 18, g.shY + 23, g.shY + 28], vest.line, vest.hi);
    // 金表链
    var gold = P.ramp('#c9a25a');
    for (var i = 0; i < 9; i++) b.px(CX + 1 + i, g.shY + 21 + Math.round(Math.sin(i / 8 * Math.PI) * 3), i % 2 ? gold.base : gold.hi);
    lapel(b, g, -1, { top: 7, depth: 32, width: 7, col: o.c.hi, edge: o.c.line, notch: 1, notchCol: o.c.line });
    lapel(b, g, 1, { top: 7, depth: 32, width: 7, col: o.c.base, edge: o.c.line, notch: 1, notchCol: o.c.line });
    shadeCloth(b, g, o.c);
    b.rect(CX + 14, g.shY + 16, 7, 2, '#e8e0d0');
  };

  OUTFIT.white_suit = function (b, g, o, sk) {
    torsoFill(b, g, o.c.base);
    neck(b, g, sk);
    vShape(b, g, 8, 30, o.i.base);
    // 敞开的红衬衫领
    shirtCollar(b, g, o.i.hi, o.i.sh, 8, 9);
    b.poly([CX - 3, g.shY - 3, CX + 3, g.shY - 3, CX, g.shY + 6], sk.base);
    b.px(CX, g.shY + 5, sk.sh);
    lapel(b, g, -1, { top: 8, depth: 30, width: 7, col: o.c.hi, edge: o.c.sh2, notch: 1, notchCol: o.c.sh2 });
    lapel(b, g, 1, { top: 8, depth: 30, width: 7, col: o.c.base, edge: o.c.sh2, notch: 1, notchCol: o.c.sh2 });
    shadeCloth(b, g, o.c);
    // 胸袋方巾
    b.rect(CX + 15, g.shY + 17, 7, 1, o.c.sh);
    b.poly([CX + 16, g.shY + 17, CX + 18, g.shY + 13, CX + 20, g.shY + 17], o.i.base);
    buttons(b, CX + 1, [g.shY + 36], o.c.sh2);
  };

  OUTFIT.black_dress = function (b, g, o, sk) {
    torsoFill(b, g, o.c.base, -2);
    neck(b, g, sk);
    shadeCloth(b, g, o.c, {});
    // 圆白领
    var wc = P.ramp('#f4f2f6');
    var col = ['....WWWWWW..', '..WHWWWWWWW.', '.WHWWWWWWWWW', 'WWWWWWWWWWWS', 'WWWWWWWWWWS.', '.SWWWWWWWS..', '..SSSSSSS...'];
    X.stamp(b, CX - 12.5, g.shY - 3, col, { W: wc.base, H: wc.hi, S: wc.sh });
    X.stamp(b, CX + 0.5, g.shY - 3, col, { W: wc.base, H: wc.base, S: wc.sh }, true);
    b.rect(CX - 3, g.shY - 5, 6, 5, sk.base);
    b.rect(CX - g.neckHW, g.shY - 5, g.neckHW * 2, 2, sk.sh);
    b.vl(CX - 0.5, g.shY - 1, 6, wc.sh);
    // 胸前荷叶边
    for (var y = g.shY + 8; y < g.shY + 30; y += 3) { b.px(CX - 1, y, o.c.hi); b.px(CX, y + 1, o.c.hi); }
    // 乌鸦羽毛护符
    var fy = g.shY + 9;
    b.line(CX - 3, g.shY + 2, CX - 0.5, fy, '#8a8090');
    b.line(CX + 3, g.shY + 2, CX + 0.5, fy, '#8a8090');
    b.poly([CX - 1, fy, CX + 2, fy, CX + 1, fy + 10, CX - 1, fy + 8], '#0c0a12');
    b.line(CX, fy + 1, CX, fy + 9, '#3a3450');
    b.px(CX - 1, fy + 2, '#4a4a6a');
  };

  OUTFIT.labcoat = function (b, g, o, sk) {
    torsoFill(b, g, o.c.base);
    neck(b, g, sk);
    vShape(b, g, 7, 28, o.i.base);
    // 高领内衫
    b.rect(CX - g.neckHW - 1, g.shY - 5, g.neckHW * 2 + 2, 5, o.i.base);
    b.hl(CX - g.neckHW - 1, g.shY - 5, g.neckHW * 2 + 2, o.i.hi);
    // 珍珠项链
    for (var i = -6; i <= 6; i += 2) b.px(CX + i, g.shY + 4 + Math.round((36 - i * i) / -10 + 3.6), '#f6f2ea');
    for (var j = -6; j <= 6; j += 2) b.px(CX + j + 1, g.shY + 5 + Math.round((36 - j * j) / -10 + 3.6), '#a8a0a0');
    lapel(b, g, -1, { top: 7, depth: 28, width: 6, col: o.c.hi, edge: o.c.sh2, notch: 1, notchCol: o.c.sh2 });
    lapel(b, g, 1, { top: 7, depth: 28, width: 6, col: o.c.base, edge: o.c.sh2, notch: 1, notchCol: o.c.sh2 });
    shadeCloth(b, g, o.c);
    b.vl(CX, g.shY + 30, H, o.c.sh2);
    // 胸袋与笔
    b.rect(CX + 12, g.shY + 20, 9, 1, o.c.sh2); b.vl(CX + 12, g.shY + 20, 8, o.c.sh); b.vl(CX + 20, g.shY + 20, 8, o.c.sh);
    b.vl(CX + 15, g.shY + 16, 5, '#2a3a5a'); b.vl(CX + 17, g.shY + 17, 4, '#8a2030');
  };

  OUTFIT.trench_open = function (b, g, o, sk) {
    torsoFill(b, g, o.c.base);
    neck(b, g, sk);
    vShape(b, g, 9, 40, o.i.base);
    b.rect(CX - 9, g.shY + 30, 18, H, o.i.base);
    shirtCollar(b, g, o.i.hi, o.i.sh, 7, 7);
    // 松开的领带
    var tr = P.ramp('#5a2420');
    b.poly([CX - 2, g.shY + 2, CX + 2, g.shY + 2, CX + 3, g.shY + 6, CX - 1, g.shY + 6], tr.base);
    b.poly([CX - 1, g.shY + 6, CX + 3, g.shY + 6, CX + 4, g.shY + 26, CX + 1, g.shY + 28, CX - 1, g.shY + 25], tr.base);
    b.line(CX + 2, g.shY + 7, CX + 3, g.shY + 25, tr.sh);
    // 大翻领
    lapel(b, g, -1, { top: 9, depth: 38, width: 9, col: o.c.hi, edge: o.c.sh2, notch: 1, notchCol: o.c.line });
    lapel(b, g, 1, { top: 9, depth: 38, width: 9, col: o.c.base, edge: o.c.sh2, notch: 1, notchCol: o.c.line });
    b.vl(CX - 9, g.shY + 38, H, o.c.sh2); b.vl(CX + 8, g.shY + 38, H, o.c.sh2);
    shadeCloth(b, g, o.c);
    // 肩章
    for (var s = -1; s <= 1; s += 2) {
      var x0 = CX + s * (g.shHW - 9);
      b.line(x0 - 6, g.shY + 7, x0 + 4, g.shY + 10, o.c.sh2);
      b.line(x0 - 6, g.shY + 9, x0 + 4, g.shY + 12, o.c.sh2);
      b.px(x0 + s * 2, g.shY + 9, o.c.hi);
    }
  };

  OUTFIT.jacket_scarf = function (b, g, o, sk) {
    torsoFill(b, g, o.c.base);
    neck(b, g, sk);
    vShape(b, g, 8, 34, '#2c2a30');
    lapel(b, g, -1, { top: 8, depth: 34, width: 6, col: o.c.hi, edge: o.c.line, notch: 1, notchCol: o.c.line });
    lapel(b, g, 1, { top: 8, depth: 34, width: 6, col: o.c.base, edge: o.c.line, notch: 1, notchCol: o.c.line });
    shadeCloth(b, g, o.c);
    // 围巾：绕颈，一端垂在胸前
    var sc = P.ramp(o.inner);
    b.ellipse(CX, g.shY - 1, g.neckHW + 7, 5, sc.base);
    b.line(CX - g.neckHW - 5, g.shY - 2, CX + g.neckHW + 5, g.shY + 1, sc.sh);
    b.line(CX - g.neckHW - 4, g.shY + 1, CX + g.neckHW + 3, g.shY + 3, sc.sh);
    b.poly([CX - 7, g.shY + 2, CX - 1, g.shY + 2, CX - 2, g.shY + 30, CX - 8, g.shY + 30], sc.base);
    b.vl(CX - 2, g.shY + 3, 27, sc.sh);
    for (var y = g.shY + 6; y < g.shY + 30; y += 4) b.hl(CX - 7, y, 5, sc.hi);
    for (var k = 0; k < 5; k++) b.vl(CX - 8 + k, g.shY + 30, 2 + (k % 2), sc.sh);
    // 相机
    var cy = g.shY + 26;
    b.line(CX - 6, g.shY + 3, CX + 6, cy, '#151418');
    b.rect(CX + 4, cy, 14, 9, '#1a1a1e');
    b.rect(CX + 4, cy, 14, 2, '#8a8a92');
    b.rect(CX + 6, cy - 2, 4, 2, '#2a2a30');
    b.ellipse(CX + 11.5, cy + 5, 3.5, 3.5, '#3a3a44');
    b.ellipse(CX + 11.5, cy + 5, 2, 2, '#101014');
    b.px(CX + 10, cy + 4, '#8aa0c0');
  };

  OUTFIT.suit_tie = function (b, g, o, sk, cfg, vis) {
    torsoFill(b, g, o.c.base);
    neck(b, g, sk);
    vShape(b, g, 7, 30, o.i.base);
    shirtCollar(b, g, o.i.hi, o.i.sh, 6, 7);
    tie(b, g, P.ramp(cfg.tie || '#5a2030'), g.shY - 1, 30);
    lapel(b, g, -1, { top: 7, depth: 30, width: 6, col: o.c.hi, edge: o.c.line, notch: 1, notchCol: o.c.line });
    lapel(b, g, 1, { top: 7, depth: 30, width: 6, col: o.c.base, edge: o.c.line, notch: 1, notchCol: o.c.line });
    shadeCloth(b, g, o.c);
    buttons(b, CX, [g.shY + 38], o.c.line, o.c.hi);
    if (/lawyer_badge/.test(vis.accessory || '')) {
      // 律师徽章（向日葵）
      var bx = CX + 13, by = g.shY + 10;
      b.px(bx, by - 1, '#e6c070'); b.px(bx - 1, by, '#e6c070'); b.px(bx + 1, by, '#c9a25a'); b.px(bx, by + 1, '#a8853a'); b.px(bx, by, '#6a4a20');
    }
  };

  OUTFIT.tailcoat = function (b, g, o, sk) {
    torsoFill(b, g, o.c.base);
    neck(b, g, sk);
    vShape(b, g, 7, 30, o.i.base);
    shirtCollar(b, g, '#f4eefa', o.i.sh, 6, 6);
    bowtie(b, CX, g.shY + 2, P.ramp('#1a0e20'));
    b.px(CX - 0.5, g.shY + 10, o.i.sh2); b.px(CX - 0.5, g.shY + 16, o.i.sh2);
    var sat = P.ramp(P.hex(P.mix(o.c.base, '#9070b0', 0.45)));
    lapel(b, g, -1, { top: 7, depth: 30, width: 6, col: sat.hi, edge: o.c.line });
    lapel(b, g, 1, { top: 7, depth: 30, width: 6, col: sat.base, edge: o.c.line });
    shadeCloth(b, g, o.c);
    // 亮片
    var rng = X.rng('sequins');
    for (var i = 0; i < 26; i++) {
      var x = rng.int(4, 75), y = rng.int(g.shY + 8, 110);
      var c = b.get(x, y);
      if (c === o.c.base || c === o.c.sh || c === o.c.hi) { b.px(x, y, i % 3 ? '#e8c870' : '#f8f0ff'); }
    }
    b.px(CX + 14, g.shY + 14, '#ffe090'); b.px(CX + 13, g.shY + 14, '#c9a25a'); b.px(CX + 14, g.shY + 13, '#c9a25a');
  };

  OUTFIT.cardigan_shirt = function (b, g, o, sk) {
    torsoFill(b, g, o.c.base);
    neck(b, g, sk);
    vShape(b, g, 7, 30, o.i.base);
    shirtCollar(b, g, o.i.hi, o.i.sh, 6, 7);
    tie(b, g, P.ramp('#6a5038'), g.shY - 1, 28);
    // 针织V领边
    b.line(CX - 7, g.shY - 3, CX - 0.5, g.shY + 30, o.c.sh2);
    b.line(CX + 7, g.shY - 3, CX + 0.5, g.shY + 30, o.c.sh2);
    b.line(CX - 8, g.shY - 3, CX - 1.5, g.shY + 31, o.c.hi);
    shadeCloth(b, g, o.c);
    buttons(b, CX - 1, [g.shY + 34, g.shY + 40], o.c.line, o.c.hi);
    for (var y = g.shY + 10; y < H; y += 2) { b.pxOn(CX - 18, y, o.c.sh); b.pxOn(CX + 18, y, o.c.sh); }
    // 胸袋里的制图笔与工具钳
    b.vl(CX + 12, g.shY + 14, 6, '#2a2a30'); b.px(CX + 12, g.shY + 14, '#c0c0c8');
    b.rect(CX + 14, g.shY + 15, 3, 5, '#a8a8b0'); b.px(CX + 15, g.shY + 15, '#e0e0e8');
    b.hl(CX + 10, g.shY + 19, 9, o.c.sh2);
  };

  OUTFIT.chef = function (b, g, o, sk) {
    torsoFill(b, g, o.c.base);
    neck(b, g, sk);
    // 立领
    b.rect(CX - g.neckHW - 2, g.shY - 4, g.neckHW * 2 + 4, 5, o.c.base);
    b.hl(CX - g.neckHW - 2, g.shY - 4, g.neckHW * 2 + 4, o.c.hi);
    // 红色领巾
    var red = P.ramp(o.inner);
    b.rect(CX - g.neckHW - 1, g.shY - 2, g.neckHW * 2 + 2, 3, red.base);
    b.poly([CX - 2, g.shY, CX + 4, g.shY, CX + 6, g.shY + 8, CX + 2, g.shY + 9], red.base);
    b.line(CX + 3, g.shY + 1, CX + 5, g.shY + 8, red.sh);
    b.hl(CX - g.neckHW - 1, g.shY - 2, g.neckHW * 2 + 2, red.hi);
    shadeCloth(b, g, o.c);
    // 双排扣与斜襟
    b.line(CX - 12, g.shY + 3, CX + 10, g.shY + 30, o.c.sh);
    b.line(CX + 10, g.shY + 30, CX + 10, H, o.c.sh);
    var ys = [g.shY + 14, g.shY + 24, g.shY + 34];
    for (var i = 0; i < ys.length; i++) {
      b.rect(CX - 9, ys[i], 2, 2, '#c8c8d0'); b.px(CX - 9, ys[i], '#ffffff');
      b.rect(CX + 13, ys[i], 2, 2, '#c8c8d0'); b.px(CX + 13, ys[i], '#ffffff');
    }
  };

  OUTFIT.smock = function (b, g, o, sk) {
    torsoFill(b, g, o.c.base, 1);
    neck(b, g, sk);
    // 内衬衫领
    var inr = P.ramp(o.inner);
    shirtCollar(b, g, inr.hi, inr.sh, 7, 6);
    b.rect(CX - 3, g.shY - 5, 6, 5, sk.base);
    shadeCloth(b, g, o.c);
    // 罩衫褶皱
    for (var k = -2; k <= 2; k++) b.line(CX + k * 7, g.shY + 6, CX + k * 9, H, o.c.sh);
    b.line(CX - 9, g.shY - 3, CX - 3, g.shY + 3, o.c.sh2); b.line(CX + 9, g.shY - 3, CX + 3, g.shY + 3, o.c.sh2);
    // 颜料斑点
    var cols = ['#4a7ab8', '#b84a50', '#e0c050', '#a8c8e8', '#5a9a6a', '#8a4ab0'];
    var rng = X.rng('mio-paint');
    for (var i = 0; i < 14; i++) {
      var x = rng.int(12, 68), y = rng.int(g.shY + 8, 108), c = cols[i % cols.length];
      if (b.get(x, y)) { b.pxOn(x, y, c); if (i % 2) b.pxOn(x + 1, y, c); if (i % 3 === 0) b.pxOn(x, y + 1, c); }
    }
  };

  OUTFIT.school_blazer = function (b, g, o, sk) {
    torsoFill(b, g, o.c.base);
    neck(b, g, sk);
    vShape(b, g, 6, 24, o.i.base);
    shirtCollar(b, g, '#ffffff', '#c8c8d8', 6, 6);
    // 领结丝带
    var rb = P.ramp('#b0203c');
    b.poly([CX - 6, g.shY - 1, CX, g.shY + 2, CX - 6, g.shY + 5], rb.base);
    b.poly([CX + 6, g.shY - 1, CX, g.shY + 2, CX + 6, g.shY + 5], rb.base);
    b.poly([CX - 2, g.shY + 3, CX, g.shY + 3, CX - 3, g.shY + 11, CX - 5, g.shY + 10], rb.sh);
    b.poly([CX, g.shY + 3, CX + 2, g.shY + 3, CX + 5, g.shY + 10, CX + 3, g.shY + 11], rb.sh);
    b.rect(CX - 1, g.shY + 1, 2, 3, rb.hi);
    lapel(b, g, -1, { top: 6, depth: 24, width: 5, col: o.c.hi, edge: o.c.line });
    lapel(b, g, 1, { top: 6, depth: 24, width: 5, col: o.c.base, edge: o.c.line });
    shadeCloth(b, g, o.c);
    // 校徽
    b.rect(CX - 15, g.shY + 16, 5, 5, '#c9a25a'); b.px(CX - 13, g.shY + 18, '#2a2c48'); b.hl(CX - 15, g.shY + 16, 5, '#e6c88a');
    buttons(b, CX + 1, [g.shY + 30], '#c9a25a');
    // 琴盒背带
    b.thick(CX - 17, g.shY + 2, CX + 18, H - 2, 2, '#4a2a1a');
    b.line(CX - 17, g.shY + 1, CX + 18, H - 3, '#6a3e26');
  };

  OUTFIT.butler = function (b, g, o, sk) {
    torsoFill(b, g, o.c.base);
    neck(b, g, sk);
    vShape(b, g, 7, 32, '#4a4850');
    vShape(b, g, 6, 16, '#f8f8f8');
    // 翼领与黑领结
    b.poly([CX - 6, g.shY - 3, CX - 1, g.shY + 1, CX - 5, g.shY + 2], '#ffffff');
    b.poly([CX + 6, g.shY - 3, CX + 1, g.shY + 1, CX + 5, g.shY + 2], '#ffffff');
    bowtie(b, CX, g.shY + 1, P.ramp('#141414'));
    buttons(b, CX, [g.shY + 18, g.shY + 23, g.shY + 28], '#2a2830', '#8a8890');
    lapel(b, g, -1, { top: 7, depth: 32, width: 5, col: P.mix(o.c.base, '#4a4a58', 0.4), edge: '#000000' });
    lapel(b, g, 1, { top: 7, depth: 32, width: 5, col: P.mix(o.c.base, '#4a4a58', 0.25), edge: '#000000' });
    shadeCloth(b, g, o.c);
    // 怀表链
    for (var i = 0; i < 7; i++) b.px(CX - 2 - i, g.shY + 22 + Math.round(Math.sin(i / 6 * Math.PI) * 2), i % 2 ? '#a8a8b0' : '#e0e0e8');
  };

  OUTFIT.black_robe = function (b, g, o) {
    torsoFill(b, g, o.c.base, 2);
    var red = P.ramp(o.inner);
    // 前襟开口露出暗红内衬
    vShape(b, g, 7, 40, red.sh);
    vShape(b, g, 5, 34, '#120408');
    b.line(CX - 7, g.shY - 4, CX - 0.5, g.shY + 40, red.base); b.line(CX + 7, g.shY - 4, CX + 0.5, g.shY + 40, red.sh);
    shadeCloth(b, g, o.c, { noNeckShadow: 1 });
    // 披肩（短斗篷）
    for (var y = g.shY + 2; y < g.shY + 26; y++) {
      var hw = torsoHW(g, y) + 3 - Math.max(0, y - g.shY - 18) * 0.5;
      var t = (y - g.shY) / 26;
      for (var x = Math.round(CX - hw); x < Math.round(CX + hw); x++) {
        if (Math.abs(x + 0.5 - CX) < 8 - t * 2) continue;
        var edge = y === g.shY + 25 || Math.abs(x + 0.5 - CX) > hw - 1.5;
        b.px(x, y, edge ? o.c.sh2 : (x < CX - 6 && y < g.shY + 8 ? o.c.hi : o.c.base));
      }
    }
    for (var k = -3; k <= 3; k++) if (k) b.line(CX + k * 7, g.shY + 8, CX + k * 9.5, g.shY + 25, o.c.sh2);
    // 长袍褶皱
    for (var k2 = -2; k2 <= 2; k2++) if (k2) b.line(CX + k2 * 12, g.shY + 28, CX + k2 * 14, H, o.c.sh2);
    // 乌鸦扣
    b.circle(CX, g.shY + 6, 4, '#7a5a28'); b.circle(CX, g.shY + 6, 3, '#c9a25a'); b.px(CX - 1.5, g.shY + 4, '#f0d890');
    b.px(CX - 0.5, g.shY + 6, '#2a1a08'); b.px(CX + 0.5, g.shY + 6, '#2a1a08'); b.px(CX + 1.5, g.shY + 5, '#2a1a08');
    b.line(CX - 4, g.shY + 6, CX - 10, g.shY + 4, '#8a1020'); b.line(CX + 4, g.shY + 6, CX + 10, g.shY + 4, '#8a1020');
  };

  OUTFIT.white_dress = function (b, g, o, sk) {
    torsoFill(b, g, o.c.base, -2);
    neck(b, g, sk);
    // 方领口露出锁骨
    b.poly([CX - 9, g.shY - 2, CX + 9, g.shY - 2, CX + 7, g.shY + 6, CX - 7, g.shY + 6], sk.base);
    b.hl(CX - 6, g.shY + 2, 4, sk.sh); b.hl(CX + 2, g.shY + 2, 4, sk.sh);
    b.rect(CX - 9, g.shY - 2, 18, 1, sk.sh);
    var tr = P.ramp(o.inner);
    b.line(CX - 9, g.shY - 1, CX - 7, g.shY + 6, tr.base); b.line(CX + 8, g.shY - 1, CX + 6, g.shY + 6, tr.base);
    b.hl(CX - 7, g.shY + 6, 14, tr.base);
    // 胸前小蝴蝶结
    bowtie(b, CX, g.shY + 8, tr);
    shadeCloth(b, g, o.c, { noNeckShadow: 1 });
    // 泡泡袖
    for (var s = -1; s <= 1; s += 2) {
      var sx = CX + s * (g.shHW - 3);
      b.ellipse(sx, g.shY + 16, 6, 7, o.c.base);
      b.line(sx - 4, g.shY + 22, sx + 4, g.shY + 22, tr.base);
      b.px(sx - s * 2, g.shY + 12, o.c.hi);
      b.line(sx + s * 4, g.shY + 12, sx + s * 4, g.shY + 20, o.c.sh);
    }
    for (var k = -1; k <= 1; k++) b.line(CX + k * 6, g.shY + 14, CX + k * 8, H, o.c.sh);
  };

  OUTFIT.work_clothes = function (b, g, o, sk) {
    torsoFill(b, g, o.c.base);
    neck(b, g, sk);
    vShape(b, g, 7, 18, o.i.base);
    shirtCollar(b, g, o.c.hi, o.c.sh2, 9, 9);
    shadeCloth(b, g, o.c);
    // 毛巾挂颈
    var tw = { base: C('#ece8de'), sh: C('#c4bcae'), hi: C('#fffcf4') };
    b.ellipse(CX, g.shY - 2, g.neckHW + 6, 4.5, tw.base);
    b.hl(Math.round(CX - g.neckHW - 4), g.shY - 5, (g.neckHW + 4) * 2, tw.sh);
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      var tx = s2 < 0 ? CX - g.neckHW - 7 : CX + g.neckHW + 1, tl = s2 < 0 ? 28 : 24;
      b.rect(tx, g.shY - 1, 6, tl, tw.base);
      b.vl(tx + 5, g.shY - 1, tl, tw.sh); b.vl(tx, g.shY, tl - 1, tw.hi);
      b.hl(tx, g.shY + tl - 5, 6, '#6a8ab0'); b.hl(tx, g.shY + tl - 3, 6, '#6a8ab0');
      b.px(tx, g.shY + tl - 1, 0); b.px(tx + 5, g.shY + tl - 1, 0);
      b.line(tx + 2, g.shY + 4, tx + 3, g.shY + tl - 7, tw.sh);
    }
    // 口袋盖
    b.hl(CX - 20, g.shY + 30, 10, o.c.sh2); b.hl(CX + 10, g.shY + 30, 10, o.c.sh2);
    b.hl(CX - 20, g.shY + 31, 10, o.c.sh); b.hl(CX + 10, g.shY + 31, 10, o.c.sh);
    b.px(CX - 15, g.shY + 32, o.c.hi); b.px(CX + 15, g.shY + 32, o.c.hi);
    buttons(b, CX, [g.shY + 30, g.shY + 40], o.c.line, o.c.hi);
  };

  OUTFIT.tshirt_shorts = function (b, g, o, sk) {
    torsoFill(b, g, o.c.base);
    neck(b, g, sk);
    // 圆领
    b.ellipse(CX, g.shY - 1, g.neckHW + 2.5, 4, sk.base);
    b.ring(CX, g.shY - 1, g.neckHW + 3.5, 5, o.i.base, 2);
    b.rect(CX - g.neckHW, g.shY - 5, g.neckHW * 2, 3, sk.base);
    shadeCloth(b, g, o.c);
    // 短袖口与手臂
    for (var s = -1; s <= 1; s += 2) {
      var ax = Math.round(CX + s * (g.shHW - 3));
      b.rect(ax - 3, g.shY + 22, 7, 2, o.i.base);
      b.rect(ax - 3, g.shY + 24, 7, H, sk.base);
      b.vl(s < 0 ? ax - 3 : ax + 3, g.shY + 24, H, sk.sh);
      b.vl(s < 0 ? ax + 3 : ax - 3, g.shY + 24, H, sk.sh);
    }
    // 胸前小图案（星星）
    var st = '#f0d060';
    b.px(CX + 8, g.shY + 15, st); b.px(CX + 7, g.shY + 16, st); b.px(CX + 8, g.shY + 16, st); b.px(CX + 9, g.shY + 16, st); b.px(CX + 8, g.shY + 17, st);
  };

  OUTFIT.summer_dress = function (b, g, o, sk) {
    torsoFill(b, g, sk.base);
    neck(b, g, sk);
    // 吊带连衣裙
    var y0 = g.shY + 8;
    for (var y = y0; y < H; y++) {
      var hw = torsoHW(g, y) - 4;
      b.rect(Math.round(CX - hw), y, Math.round(hw * 2), 1, o.c.base);
    }
    b.hl(Math.round(CX - torsoHW(g, y0) + 4), y0, Math.round((torsoHW(g, y0) - 4) * 2), o.c.hi);
    var wc = P.ramp('#ffffff');
    b.rect(CX - 8, y0, 16, 2, wc.base);
    for (var s = -1; s <= 1; s += 2) {
      b.line(CX + s * 6, y0, CX + s * 9, g.shY + 1, o.c.sh);
      b.line(CX + s * 7, y0, CX + s * 10, g.shY + 1, o.c.base);
      var ax = Math.round(CX + s * (g.shHW - 2));
      b.vl(s < 0 ? ax - 2 : ax + 1, g.shY + 10, H, sk.sh);
    }
    for (var k = -1; k <= 1; k++) b.line(CX + k * 5, y0 + 6, CX + k * 7, H, o.c.sh);
    b.hl(Math.round(CX - g.shHW + 6), y0 - 6, 3, sk.hi);
    // 白色小花
    var rng = X.rng('sayo');
    for (var i = 0; i < 8; i++) { var fx = rng.int(CX - 12, CX + 12), fy = rng.int(y0 + 5, 108); b.pxOn(fx, fy, '#ffffff'); }
  };

  OUTFIT.fisher_jacket = function (b, g, o, sk) {
    torsoFill(b, g, o.c.base, 1);
    neck(b, g, sk);
    // 高领毛衣
    var sw = P.ramp(o.inner);
    b.rect(CX - g.neckHW - 2, g.shY - 6, g.neckHW * 2 + 4, 8, sw.base);
    for (var x = CX - g.neckHW - 2; x < CX + g.neckHW + 2; x += 2) b.vl(x, g.shY - 6, 8, sw.sh);
    vShape(b, g, 6, 20, sw.base);
    // 厚领
    lapel(b, g, -1, { top: 6, depth: 22, width: 8, col: o.c.hi, edge: o.c.line });
    lapel(b, g, 1, { top: 6, depth: 22, width: 8, col: o.c.base, edge: o.c.line });
    shadeCloth(b, g, o.c);
    b.vl(CX + 2, g.shY + 20, H, o.c.sh2);
    for (var y = g.shY + 26; y < H; y += 7) { b.rect(CX + 4, y, 2, 2, '#c8a860'); }
  };

  /* ================= 配饰 ================= */
  function glassesRound(a, g, glint) {
    var col = '#3a2e28';
    for (var s = -1; s <= 1; s += 2) {
      var cx = s < 0 ? g.inL - 2.5 : g.inR + 3.5, cy = g.eyeY + 2;
      if (glint) a.ellipse(cx, cy, 5, 4.5, '#e8eef8');
      a.ring(cx, cy, 5.5, 5, col);
      a.px(Math.round(cx - 3), Math.round(cy - 2), '#f0f4ff');
      a.px(Math.round(cx - 2), Math.round(cy - 3), '#f0f4ff');
    }
    a.hl(g.inL + 1, g.eyeY + 1, g.inR - g.inL - 1, col);
    a.hl(Math.round(CX - g.hw) - 1, g.eyeY + 1, 3, col);
    a.hl(Math.round(CX + g.hw) - 2, g.eyeY + 1, 3, col);
  }
  function glassesRect(a, g, glint) {
    var col = '#4a3a44';
    for (var s = -1; s <= 1; s += 2) {
      var x0 = s < 0 ? g.inL - 9 : g.inR - 1, y0 = g.eyeY - 1;
      if (glint) { a.rect(x0 + 1, y0 + 1, 9, 6, '#dfe8f8'); a.line(x0 + 2, y0 + 5, x0 + 6, y0 + 1, '#ffffff'); }
      a.hl(x0, y0, 11, col); a.hl(x0 + 1, y0 + 7, 9, P.mix(C(col), C('#d8c0b0'), 0.5));
      a.vl(x0, y0, 7, col); a.vl(x0 + 10, y0, 7, col);
      a.px(x0 + 2, y0 + 1, '#e8f0ff'); a.px(x0 + 3, y0 + 1, '#ffffff');
    }
    a.hl(g.inL + 2, g.eyeY, g.inR - g.inL - 3, col);
  }

  /* ================= 角色绘制主流程 ================= */
  var partCache = {};

  function buildParts(id) {
    var ch = (DM.CHARS && DM.CHARS[id]) || null;
    var vis = ch ? ch.visual : { hair: 'short_neat', hairColor: '#303038', skin: '#d8c0b0', eyes: 'tired_kind', eyeColor: '#404050', outfit: 'suit_tie', outfitColor: '#303040', inner: '#d0d0d0' };
    var cfg = CFG[id] || { head: 'm', eye: EYES[vis.eyes] ? vis.eyes : 'tired_kind', brow: 1, sh: 30, neck: 5, unknown: !ch };
    if (!EYES[cfg.eye] && cfg.eye !== 'mask') cfg.eye = 'tired_kind';
    var g = geom(cfg);
    var sk = skinPal(vis.skin || '#e8c8b0');
    var hr = hairPal(vis.hairColor || '#303030');
    var o = { c: P.ramp(vis.outfitColor || '#303040'), i: P.ramp(vis.inner || '#d0d0d0'), inner: vis.inner || '#d0d0d0' };
    var acc = vis.accessory || '';
    var parts = { id: id, vis: vis, cfg: cfg, g: g, sk: sk, hr: hr, o: o, acc: acc };

    var back = L(), body = L(), head = L(), front = L(), top = L();
    if (cfg.unknown) {
      // 未知角色：剪影
      torsoFill(body, g, '#1c1a24');
      head.ellipse(CX, g.top + 20, 17, 22, '#1c1a24');
      head.rect(36, g.eyeY + 2, 2, 2, '#4a4458'); head.rect(42, g.eyeY + 2, 2, 2, '#4a4458');
      parts.layers = { back: back, body: body, head: head, front: front, top: top };
      parts.silhouette = 1;
      return parts;
    }
    // 后层装饰（琴盒）
    if (/violin_case/.test(acc)) {
      var cb = P.ramp('#3a2418');
      back.poly([6, 50, 18, 46, 22, 112, 4, 112], cb.base);
      back.ellipse(12, 52, 7, 6, cb.base);
      back.vl(9, 50, 62, cb.hi); back.vl(19, 52, 60, cb.sh);
      back.rect(8, 70, 12, 2, '#c9a25a');
    }
    // 发型
    var hs = HAIR[vis.hair] ? vis.hair : 'short_neat';
    HAIR[hs](back, front, g, hr, cfg, sk);
    closeGaps(front, g, hr);
    // 身体
    var of = OUTFIT[vis.outfit] || OUTFIT.suit_tie;
    of(body, g, o, sk, cfg, vis);
    // 头
    if (vis.eyes === 'mask') { buildJudge(parts, back, body, head, front, top); }
    else {
      drawHead(head, g, cfg, sk);
      // 前发在额头投下阴影
      for (var y = g.top; y < g.chin; y++) for (var x = 0; x < W; x++) {
        var i = y * W + x;
        if (!head.d[i] || front.d[i]) continue;
        if ((y > 0 && front.d[i - W]) || (y > 1 && front.d[i - 2 * W] && !front.d[i - W]) || (x > 0 && front.d[i - 1] && y > g.eyeY - 2) || (x < W - 1 && front.d[i + 1] && y > g.eyeY - 2)) {
          if (head.d[i] === sk.base || head.d[i] === sk.hi) head.d[i] = sk.sh;
        }
      }
      // 年龄/特征
      if (cfg.wrinkles > 1) {
        // 法令纹与额纹（老人）
        head.line(CX - 4, g.noseY + 1, CX - 6, g.mouthY + 1, sk.sh);
        head.line(CX + 4, g.noseY + 1, CX + 6, g.mouthY + 1, sk.sh);
        head.hl(CX - 4, g.top + 9, 8, sk.sh); head.hl(CX - 3, g.top + 12, 6, sk.sh);
      }
      if (/stubble/.test(acc)) {
        head.map(0, g.mouthY - 3, W, g.chin - g.mouthY + 4, function (c, x, y) {
          var bb = X.bayer(x, y), side = Math.abs(x + 0.5 - CX);
          var edge = faceHW(g, y) - side;
          var nearJaw = edge < 3.5 || y > g.chin - 3;
          var lip = y === g.mouthY - 2 && side < 4;
          if (!(nearJaw || lip) || (y < g.mouthY - 2)) return c;
          if ((c === sk.base || c === sk.sh) && (bb === 0 || bb === 9 || bb === 6)) return P.mix(c, hr.base, 0.3);
          return c;
        });
      }
    }
    parts.layers = { back: back, body: body, head: head, front: front, top: top };
    // 配饰（上层）
    drawAccessories(parts, top, front, head, body);
    return parts;
  }

  function drawAccessories(p, a, front, head, body) {
    var g = p.g, acc = p.acc, vis = p.vis, sk = p.sk, hr = p.hr, id = p.id;
    if (/mustache/.test(acc)) {
      var mc = P.ramp('#2e2a28');
      var my = g.mouthY - 2;
      head.poly([CX - 7, my + 2, CX - 1, my - 0.5, CX + 1, my - 0.5, CX + 7, my + 2, CX + 6, my + 3, CX + 1, my + 1.5, CX - 1, my + 1.5, CX - 6, my + 3], mc.base);
      head.hl(CX - 4, my, 3, mc.hi);
    }
    if (/beard_short/.test(acc)) {
      var bc = P.ramp(vis.hairColor);
      var by = g.mouthY - 2;
      for (var y = by; y <= g.chin + 1; y++) {
        var hw = faceHW(p.g, Math.min(y, g.chin));
        if (hw < 0) continue;
        var xa = Math.round(CX - hw), xb = Math.round(CX + hw);
        for (var x = xa; x < xb; x++) {
          var inMouth = y >= g.mouthY - 1 && y <= g.mouthY + 3 && Math.abs(x + 0.5 - CX) < 4;
          var edge = Math.abs(x + 0.5 - CX) > hw - 5 || y > g.mouthY + 3 || y < g.mouthY;
          if (inMouth) continue;
          if (edge || y === by) head.px(x, y, X.bayer(x, y) < 3 ? bc.hi : (x > CX + 4 ? bc.sh : bc.base));
        }
      }
      // 鬓角连到胡子
      head.rect(Math.round(CX - g.hw), g.eyeY + 3, 2, by - g.eyeY - 3, bc.base);
      head.rect(Math.round(CX + g.hw) - 2, g.eyeY + 3, 2, by - g.eyeY - 3, bc.sh);
      p.beardMouth = 1;
    }
    if (/beard_white/.test(acc)) {
      var wb = P.ramp('#d8d4cc');
      var by2 = g.mouthY - 3;
      for (var y2 = by2; y2 <= g.chin + 7; y2++) {
        var hw2 = y2 <= g.chin ? faceHW(g, y2) : Math.max(1, faceHW(g, g.chin) - (y2 - g.chin) * 0.9);
        if (y2 < g.mouthY + 2) hw2 = Math.min(hw2, 15);
        var xa2 = Math.round(CX - hw2), xb2 = Math.round(CX + hw2);
        for (var x2 = xa2; x2 < xb2; x2++) {
          var inM = y2 >= g.mouthY - 1 && y2 <= g.mouthY + 2 && Math.abs(x2 + 0.5 - CX) < 3;
          if (inM) continue;
          var side = Math.abs(x2 + 0.5 - CX);
          if (y2 < g.mouthY - 1 && side < 2) continue;
          a.px(x2, y2, (x2 > CX + hw2 - 3) ? wb.sh : (x2 < CX - hw2 + 2 ? wb.hi : wb.base));
        }
      }
      for (var k = -3; k <= 3; k++) a.line(CX + k * 3, g.mouthY + 4, CX + k * 3.4, g.chin + 4, wb.sh);
      p.beardMouth = 2;
    }
    if (/scar_brow/.test(acc)) {
      var scy = g.eyeY - 7;
      p.scar = [[g.inL - 3, scy], [g.inL - 2, scy + 1], [g.inL - 2, scy + 2], [g.inL - 1, scy + 3], [g.inL - 1, scy + 4], [g.inL - 4, scy - 1]];
    }
    if (/earring/.test(acc)) {
      var ex = Math.round(CX + g.hw) + 1, ey = g.eyeY + 9;
      a.px(ex, ey, '#e8c870'); a.px(ex, ey + 1, '#f8f0c0'); a.px(ex, ey + 2, '#a88030');
    }
    if (/pencil_ear/.test(acc)) {
      var px0 = Math.round(CX + g.hw) + 1, py0 = g.eyeY + 1;
      a.thick(px0 - 3, py0 - 6, px0 + 3, py0 + 5, 2, '#e8c040');
      a.line(px0 - 3, py0 - 6, px0 + 3, py0 + 5, '#c89820');
      a.px(px0 + 3, py0 + 6, '#3a3030'); a.px(px0 - 4, py0 - 7, '#e88090');
    }
    if (/beret/.test(acc)) {
      var bt = P.ramp('#2e3e5e');
      a.ellipse(CX - 3, g.top - 1, g.hw + 4, 6.5, bt.base);
      a.ellipse(CX - 5, g.top - 2, g.hw, 4, bt.hi);
      a.ellipse(CX - 4, g.top - 1.5, g.hw - 1, 3.5, bt.base);
      a.hl(Math.round(CX - g.hw - 5), g.top + 3, g.hw * 2 + 6, bt.sh);
      a.rect(CX - 2, g.top - 9, 2, 3, bt.sh2);
    }
    if (/top_hat_small/.test(acc)) {
      var th = P.ramp('#24142e');
      var hx = CX + 7, hy = g.top - 4;
      a.poly([hx - 11, hy + 3, hx + 11, hy - 1, hx + 11, hy + 1, hx - 11, hy + 5], th.base);
      a.poly([hx - 6, hy + 2, hx + 6, hy, hx + 5, hy - 12, hx - 6, hy - 10], th.base);
      a.poly([hx - 6, hy + 2, hx + 6, hy, hx + 6, hy - 2, hx - 6, hy], '#9a2a50');
      a.line(hx - 5, hy - 9, hx - 5, hy, th.hi);
      a.line(hx + 4, hy - 11, hx + 5, hy - 1, th.sh2);
      a.px(hx + 3, hy - 1, '#e8c870');
    }
    if (/straw_hat/.test(acc)) {
      var sh = P.ramp('#e0c070');
      var sy = g.top + 1;
      a.ellipse(CX, sy + 3, g.hw + 13, 6, sh.base);
      a.ellipse(CX, sy + 2, g.hw + 11, 4, sh.hi);
      a.ellipse(CX, sy - 3, g.hw - 1, 9, sh.base);
      a.clip(0, sy - 2, W, 5); a.ellipse(CX, sy - 3, g.hw - 1, 9, '#c83040'); a.clip();
      a.hl(Math.round(CX - g.hw + 3), sy - 2, g.hw * 2 - 6, '#e05060');
      for (var x3 = Math.round(CX - g.hw - 12); x3 < CX + g.hw + 12; x3 += 3) a.pxOn(x3, sy + 4, sh.sh);
      for (var x4 = Math.round(CX - g.hw + 2); x4 < CX + g.hw - 2; x4 += 3) a.pxOn(x4, sy - 7, sh.sh);
      a.hl(Math.round(CX - g.hw - 10), sy + 6, g.hw * 2 + 20, sh.sh);
    }
    if (vis.hair === 'bandana') {
      // 厨师帽
      var ct = { base: C('#f4f4f6'), hi: C('#ffffff'), sh: C('#cfd0dc'), sh2: C('#a8a8bc') };
      var cy = g.top + 3, bw = g.hw * 2 - 1;
      a.ellipse(CX - 9, cy - 5, 9.5, 8, ct.base);
      a.ellipse(CX + 9, cy - 5, 9.5, 8, ct.base);
      a.ellipse(CX, cy - 10, 11.5, 10, ct.base);
      a.clip(Math.round(CX + 9), 0, 30, cy + 1); a.ellipse(CX + 10, cy - 5, 8.5, 7, ct.sh); a.ellipse(CX + 4, cy - 12, 7, 7, ct.sh); a.clip();
      a.ellipse(CX + 8, cy - 6, 6, 5.5, ct.base); a.ellipse(CX - 2, cy - 12, 8, 7, ct.base);
      a.ellipse(CX - 4, cy - 14, 4, 3, ct.hi); a.ellipse(CX - 12, cy - 7, 3, 2.5, ct.hi);
      a.line(CX - 7, cy, CX - 5, cy - 9, ct.sh); a.line(CX + 6, cy, CX + 4, cy - 13, ct.sh); a.line(CX - 1, cy, CX - 1, cy - 7, ct.sh);
      a.rect(Math.round(CX - bw / 2), cy, bw, 7, ct.base);
      a.hl(Math.round(CX - bw / 2), cy, bw, ct.sh); a.hl(Math.round(CX - bw / 2), cy + 6, bw, ct.sh);
      a.rect(Math.round(CX + bw / 2) - 5, cy + 1, 5, 5, ct.sh);
      a.hl(Math.round(CX - bw / 2) + 1, cy + 1, 8, ct.hi);
    }
    if (vis.hair === 'cap') {
      var cp = P.ramp('#3a4450');
      var cy2 = g.top + 1;
      a.ellipse(CX, cy2 + 4, g.hw + 3, 12, cp.base);
      a.clip(0, 0, W, cy2 + 10); a.ellipse(CX, cy2 + 4, g.hw + 3, 12, cp.base); a.clip();
      a.map(0, 0, W, cy2 + 10, function (c, x, y) { return y > cy2 + 9 ? 0 : c; });
      a.poly([CX - g.hw - 1, cy2 + 8, CX + g.hw + 1, cy2 + 8, CX + g.hw - 2, cy2 + 12, CX - g.hw + 2, cy2 + 12], cp.sh2);
      a.hl(Math.round(CX - g.hw - 2), cy2 + 7, g.hw * 2 + 4, cp.sh);
      a.line(CX - 8, cy2 - 6, CX - 10, cy2 + 6, cp.hi); a.line(CX + 2, cy2 - 7, CX + 2, cy2 + 6, cp.sh);
      a.rect(CX - 1, cy2 - 8, 2, 2, cp.hi);
    }
    if (/white_ribbon/.test(acc)) {
      var rr = P.ramp('#f8f6fa');
      var rx = CX + g.hw - 1, ry = g.top + 2;
      a.poly([rx - 7, ry - 4, rx, ry, rx - 7, ry + 4], rr.base);
      a.poly([rx + 7, ry - 5, rx, ry, rx + 6, ry + 4], rr.base);
      a.line(rx - 6, ry - 3, rx - 6, ry + 3, rr.sh); a.line(rx + 6, ry - 4, rx + 5, ry + 3, rr.sh);
      a.rect(rx - 1, ry - 1, 3, 3, rr.hi);
      a.line(rx - 1, ry + 2, rx - 4, ry + 10, rr.base); a.line(rx + 1, ry + 2, rx + 3, ry + 11, rr.sh);
    }
    if (vis.hair === 'twin_tails') {
      var rb = P.ramp('#b0203c');
      for (var s = -1; s <= 1; s += 2) {
        var bx = CX + s * (g.hw + 2), by3 = g.top + 5;
        a.poly([bx, by3, bx + s * 7, by3 - 5, bx + s * 7, by3 + 3], rb.base);
        a.poly([bx, by3, bx - s * 2, by3 - 7, bx + s * 3, by3 - 6], rb.base);
        a.rect(bx - 1, by3 - 1, 3, 3, rb.hi);
        a.line(bx + s * 6, by3 - 4, bx + s * 6, by3 + 2, rb.sh);
      }
    }
    if (/glasses/.test(acc) && p.cfg.eye === 'glasses_round') p.glasses = 'round';
    if (/glasses/.test(acc) && p.cfg.eye === 'glasses_cold') p.glasses = 'rect';
    if (/red_notebook/.test(acc)) {
      var nb = P.ramp('#a01c30');
      var nx = 14, ny = 93;
      body.rect(nx, ny, 12, 17, nb.base);
      body.hl(nx, ny, 12, nb.hi);
      body.vl(nx, ny, 17, nb.sh2); body.vl(nx + 1, ny + 1, 16, nb.sh);
      body.vl(nx + 12, ny + 1, 16, '#ece4d4'); body.vl(nx + 13, ny + 2, 15, '#c8c0b0');
      body.rect(nx + 4, ny + 4, 5, 1, '#e8c870'); body.rect(nx + 4, ny + 6, 4, 1, '#c09848');
      X.stamp(body, nx + 8, ny + 6, ['.WW...', 'WWWW..', 'WWWWW.', 'WSWSWW', 'WWWWWS', '.WWWWS', '..WWS.'], { W: '#f4f4f8', S: '#c4c4d4' });
    }
    if (/doll/.test(acc)) {
      // 人偶「千代」：黑色娃娃头、白脸、红和服
      var dx = 55, dy = 93;
      var kim = P.ramp('#a02030');
      body.poly([dx - 9, 112, dx - 7, dy + 6, dx + 8, dy + 6, dx + 10, 112], kim.base);
      body.line(dx - 6, dy + 7, dx + 9, 111, kim.sh); body.line(dx + 2, dy + 7, dx - 6, 111, kim.hi);
      body.rect(dx - 7, dy + 12, 16, 3, '#e0b050'); body.hl(dx - 7, dy + 12, 16, '#f0d080');
      body.ellipse(dx + 0.5, dy + 1, 5.5, 5, '#f8f0ea');
      body.clip(0, 0, W, dy); body.ellipse(dx + 0.5, dy + 1, 6.5, 6.5, '#141018'); body.clip();
      body.rect(dx - 6, dy - 1, 2, 7, '#141018'); body.rect(dx + 5, dy - 1, 2, 7, '#141018');
      body.hl(dx - 4, dy, 9, '#141018');
      body.px(dx - 3, dy - 4, '#3a3450'); body.px(dx - 2, dy - 4, '#3a3450');
      body.px(dx - 2, dy + 2, '#141018'); body.px(dx + 3, dy + 2, '#141018'); body.px(dx + 0, dy + 4, '#c04050'); body.px(dx + 1, dy + 4, '#c04050');
      body.px(dx - 3, dy + 3, '#f0c0c0'); body.px(dx + 4, dy + 3, '#f0c0c0');
      // 雏的手
      X.stamp(body, dx - 13, dy + 12, ['.SSSS..', 'SBBBBBS', 'BBSBSBB', 'BBBBBBS', '.SBBBS.'], { B: sk.base, S: sk.sh });
      body.rect(dx - 24, dy + 11, 12, 9, p.o.c.base); body.vl(dx - 13, dy + 11, 9, p.o.c.sh);
    }
    if (/towel_neck/.test(acc)) { /* 已在服装中绘制 */ }
  }

  /* 判官：兜帽 + 乌鸦面具 */
  function buildJudge(p, back, body, head, front, top) {
    var g = p.g;
    var hood = P.ramp('#141018');
    // 兜帽外形（后）
    back.ellipse(CX, g.top + 16, g.hw + 9, 24, hood.sh);
    back.poly([CX - g.hw - 9, g.top + 18, CX + g.hw + 9, g.top + 18, CX + g.hw + 14, g.shY + 10, CX - g.hw - 14, g.shY + 10], hood.sh);
    // 面具：亮黑漆面，额头鳞状羽纹，长而弯的乌鸦喙
    var mk = { base: C('#1a1820'), hi: C('#34324a'), hi2: C('#58587a'), sh: C('#0a090e'), gold: C('#9a7a40'), gold2: C('#d8b060') };
    head.ellipse(CX, g.top + 20, g.hw - 1, 19, mk.base);
    head.ellipse(CX - 4, g.top + 12, 7, 6, mk.hi);
    head.ellipse(CX - 3, g.top + 13, 6, 5, mk.base);
    // 羽鳞
    for (var ry = 0; ry < 3; ry++) for (var rx = -3; rx <= 3; rx++) {
      var fx = CX + rx * 4 + (ry % 2) * 2, fy = g.top + 5 + ry * 4;
      if (Math.abs(fx - CX) > g.hw - 4 - ry) continue;
      head.px(fx - 1, fy, mk.hi); head.px(fx, fy + 1, mk.hi); head.px(fx + 1, fy, mk.hi);
      if (rx < 0) head.px(fx, fy + 1, mk.hi2);
    }
    // 金边眉线
    head.line(CX - 13, g.eyeY - 4, CX - 3, g.eyeY - 1, mk.gold); head.line(CX - 12, g.eyeY - 5, CX - 4, g.eyeY - 2, mk.gold2);
    head.line(CX + 13, g.eyeY - 4, CX + 3, g.eyeY - 1, mk.gold); head.line(CX + 12, g.eyeY - 5, CX + 4, g.eyeY - 2, mk.gold);
    // 鸟喙：宽基部 → 尖端微钩
    var by = g.eyeY - 1, tipY = g.chin + 16;
    head.poly([CX - 7, by, CX + 7, by, CX + 4, by + 10, CX + 2, tipY - 4, CX + 0.5, tipY, CX - 1, tipY - 2, CX - 4, by + 10], mk.base);
    head.poly([CX - 7, by, CX - 0.5, by - 2, CX - 0.5, tipY - 1, CX - 1, tipY - 2, CX - 4, by + 10], C('#24222e'));
    head.line(CX - 0.5, by, CX - 0.5, tipY - 2, mk.hi2);
    head.line(CX - 5, by + 2, CX - 2, tipY - 6, mk.hi);
    head.line(CX + 5, by + 2, CX + 2, tipY - 5, mk.sh);
    head.px(CX - 1, by + 1, C('#8a8ab0')); head.px(CX - 1, by + 2, C('#8a8ab0'));
    head.px(CX - 3, by + 9, mk.sh); head.px(CX + 2, by + 9, mk.sh);
    head.hl(CX - 3, by + 14, 6, mk.sh);
    head.px(CX + 1, tipY - 1, mk.sh); head.px(CX, tipY, mk.base);
    // 兜帽前沿（前层）
    var T = g.top - 6;
    front.clip(0, 0, W, g.chin + 12);
    front.ellipse(CX, T + 24, g.hw + 8, 27, hood.base);
    front.clip();
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var dx = (x + 0.5 - CX) / (g.hw - 0.5), dy = (y + 0.5 - (g.top + 22)) / 22;
      if (dx * dx + dy * dy < 1 && y > g.top - 1) front.d[y * W + x] = 0;
    }
    front.map(0, 0, W, H, function (c, x, y) {
      var dx = (x + 0.5 - CX) / (g.hw + 0.5), dy = (y + 0.5 - (g.top + 22)) / 23;
      var r = dx * dx + dy * dy;
      if (r < 1.25) return hood.sh2;
      var ox = (x + 0.5 - CX) / (g.hw + 8), oy = (y + 0.5 - (g.top + 18)) / 27;
      var ro = ox * ox + oy * oy;
      if (ro > 0.8 && ro < 0.92 && x < CX && y < g.top + 26) return hood.hi;
      return c;
    });
    p.judge = 1;
  }

  /* ================= 表情层 ================= */
  function drawFeatures(p, expr, head, top, fx) {
    var g = p.g, cfg = p.cfg, sk = p.sk, vis = p.vis;
    if (p.judge) { drawJudgeEyes(p, expr, head); return; }
    var e = EYES[cfg.eye];
    var x = {};
    var m = EXM[expr] || EXM.normal;
    for (var k in m) x[k] = m[k];
    if (expr === 'smile' && cfg.smileClosed) { x = { closed: 'happy' }; }
    if (cfg.eye === 'smiling_narrow') {
      if (expr === 'surprise' || expr === 'shock' || expr === 'angry' || expr === 'dark') { x.open = 1; }
      else if (expr === 'sad' || expr === 'think') x.closed = 'calm';
    }
    if (cfg.eye === 'squint' && (expr === 'smile')) x = { closed: 'happy' };
    var ep = eyePal(cfg, vis, sk);
    // 脸红
    if ((cfg.blush && (expr === 'smile' || expr === 'surprise' || expr === 'sad')) || (cfg.head === 'child' && expr !== 'dark' && expr !== 'shock')) {
      var by = g.eyeY + e.h + 3;
      for (var s = -1; s <= 1; s += 2) {
        var bx = s < 0 ? g.inL - 6 : g.inR + 2;
        for (var i = 0; i < 4; i++) head.px(bx + i, by + (i % 2), sk.blush);
        if (expr === 'smile') head.px(bx + 1, by - 1, sk.blush);
      }
    }
    drawEye(head, -1, g, e, x, ep, sk);
    drawEye(head, 1, g, e, x, ep, sk);
    // 鼻
    head.px(40, g.noseY, sk.sh);
    if (cfg.head !== 'f' && cfg.head !== 'child') head.px(40, g.noseY - 1, sk.sh);
    head.px(39, g.noseY - 2, sk.hi);
    // 嘴
    if (p.beardMouth !== 2) drawMouth(head, g, cfg, expr, sk);
    else drawMouth(top, g, cfg, expr, sk);
    // 叼着的东西
    if (/toothpick/.test(p.acc) && expr !== 'surprise' && expr !== 'shock' && expr !== 'angry') {
      head.line(CX + 2, g.mouthY, CX + 7, g.mouthY + 2, '#d8b880');
      head.px(CX + 7, g.mouthY + 2, '#f0d8a8');
    }
    if (/cigarette/.test(p.acc) && (expr === 'normal' || expr === 'think' || expr === 'dark')) {
      fx.hl(CX + 2, g.mouthY + 1, 4, '#f2f0ea'); fx.hl(CX + 3, g.mouthY + 2, 3, '#c8c4bc');
      fx.px(CX + 6, g.mouthY + 1, '#ff7040'); fx.px(CX + 6, g.mouthY + 2, '#a03020');
    }
    // 眉
    var bcol = cfg.browCol ? C(cfg.browCol) : P.mix(p.hr.sh, '#100810', 0.3);
    var hrgb = P.hexRGB(vis.hairColor || '#303030');
    if (P.rgb2hsl(hrgb[0], hrgb[1], hrgb[2])[2] > 0.45) bcol = P.mix(p.hr.sh2, '#4a3040', 0.35);
    if (cfg.head === 'old' || vis.hair === 'side_part_grey' || vis.hair === 'grey_slick') bcol = P.mix(p.hr.base, '#303038', 0.3);
    var browLayer = cfg.browsOver ? top : head;
    if (cfg.browsOver) bcol = P.mix(p.hr.line, '#000000', 0.2);
    drawBrows(browLayer, g, cfg, e, expr, bcol);
    if (p.scar) for (var q = 0; q < p.scar.length; q++) head.px(p.scar[q][0], p.scar[q][1], P.mix(sk.base, '#ffe0e0', 0.5));
    // 眼镜
    if (p.glasses === 'round') glassesRound(fx, g, expr === 'dark');
    if (p.glasses === 'rect') glassesRect(fx, g, expr === 'dark');
    // 特效
    if (expr === 'shock') {
      // 额头阴影线与冷汗
      for (var gx = 0; gx < 5; gx++) {
        var lx = Math.round(CX - 8 + gx * 4);
        for (var gy = g.top + 8; gy < g.eyeY - 4; gy++) if (gy % 2 === 0 || gx % 2) head.pxOn(lx, gy, P.mix(sk.base, '#4a3a8a', 0.55));
      }
      sweat(top, Math.round(CX + g.hw) - 1, g.eyeY - 7);
      sweat(top, Math.round(CX - g.hw) - 1, g.eyeY + 4, 1);
    }
    if (expr === 'surprise') sweat(top, Math.round(CX + g.hw), g.eyeY - 6, 1);
    if (expr === 'angry') {
      // 青筋
      var vx = Math.round(CX + g.hw) - 6, vy = g.top + 8;
      var vc = '#c03040';
      top.px(vx, vy, vc); top.px(vx + 1, vy - 1, vc); top.px(vx + 3, vy - 1, vc); top.px(vx + 4, vy, vc);
      top.px(vx, vy + 2, vc); top.px(vx + 1, vy + 3, vc); top.px(vx + 3, vy + 3, vc); top.px(vx + 4, vy + 2, vc);
    }
    if (expr === 'dark') {
      // 上半脸阴影
      var shade = C('#2a1430');
      head.map(0, g.top, W, g.eyeY + e.h + 3 - g.top, function (c, xx, yy) {
        var t = (yy - g.top) / (g.eyeY + e.h + 3 - g.top);
        var lv = t < 0.7 ? 0.62 : 0.62 - (t - 0.7) * 1.6;
        if (lv < 0.15 && X.bayer(xx, yy) > 8) return c;
        if (c === ep.H2 || P.unpack(c)[0] > 200 && P.unpack(c)[2] < 120) return c;
        return P.mix(c, shade, Math.round(lv * 10) / 10);
      });
      // 眼中残留的光
      var e2 = EYES[cfg.eye];
      for (var s2 = -1; s2 <= 1; s2 += 2) {
        var cx = s2 < 0 ? g.inL - (e2.w - 1) / 2 + 0.35 : g.inR + (e2.w - 1) / 2 - 0.35;
        head.px(Math.round(cx), g.eyeY + Math.round(e2.h / 2) + 1, '#ff5a70');
      }
    }
  }
  function sweat(b, x, y, small) {
    var c1 = '#bfe4ff', c2 = '#6aa0d8', o = '#2a3a6a';
    if (small) { b.px(x, y, c1); b.px(x, y + 1, c2); b.px(x - 1, y + 1, o); b.px(x + 1, y + 1, o); b.px(x, y + 2, o); b.px(x, y - 1, o); return; }
    b.px(x, y - 1, o); b.px(x, y, c1); b.px(x - 1, y + 1, c1); b.px(x, y + 1, c1); b.px(x + 1, y + 1, c2);
    b.px(x - 1, y + 2, c2); b.px(x, y + 2, c2); b.px(x + 1, y + 2, c2);
    b.px(x - 2, y + 1, o); b.px(x - 1, y, o); b.px(x + 1, y, o); b.px(x + 2, y + 1, o); b.px(x + 2, y + 2, o); b.px(x - 2, y + 2, o);
    b.px(x - 1, y + 3, o); b.px(x, y + 3, o); b.px(x + 1, y + 3, o);
  }
  function drawJudgeEyes(p, expr, head) {
    var g = p.g;
    var lv = { normal: 1, smile: 1, sad: 0.6, angry: 1.4, surprise: 1.1, think: 0.8, shock: 1.2, dark: 1.6 }[expr] || 1;
    var core = lv > 1.3 ? C('#fff0f0') : lv > 0.9 ? C('#ffb0b8') : C('#ff6070');
    var mid = lv > 0.7 ? C('#ff3050') : C('#c01830');
    var outer = C('#6a0818');
    for (var s = -1; s <= 1; s += 2) {
      var x0 = s < 0 ? g.inL - 7 : g.inR;
      var ey = g.eyeY;
      // 斜眼孔
      var rows = expr === 'surprise' || expr === 'shock' ? ['.OOOOO..', 'OMMMMMO.', 'OMCCCMO.', '.OMMMO..'] :
        expr === 'sad' ? ['......OO', '...OOMMO', '.OOMCMO.', 'OMMMO...'] :
          ['OO......', 'OMMOO...', '.OMCMMO.', '..OOMMMO'];
      X.stamp(head, x0, ey, rows, { O: outer, M: mid, C: core }, s > 0);
      if (lv > 1.2) {
        head.px(s < 0 ? x0 - 1 : x0 + 8, ey + 1, outer);
        head.px(s < 0 ? x0 + 3 : x0 + 4, ey - 1, outer);
      }
    }
  }

  /* 思考：手托下巴 */
  function drawHand(p, a) {
    var g = p.g;
    var gloved = /white_gloves/.test(p.acc);
    var hs = gloved ? { base: C('#f4f4f8'), sh: C('#c8c8d8'), sh2: C('#9a9ab0') } : { base: p.sk.base, sh: p.sk.sh, sh2: p.sk.sh2 };
    var hx = Math.round(CX + 3), hy = g.chin - 3;
    var slv = p.o.c;
    if (p.vis.outfit === 'summer_dress' || p.vis.outfit === 'tshirt_shorts') slv = { base: p.sk.base, sh: p.sk.sh, hi: p.sk.hi, sh2: p.sk.sh2 };
    // 前臂（儿童更细）
    var ch = g.child;
    var aw = ch ? 6 : 8, ab = ch ? 11 : 14;
    a.poly([hx + 2, hy + 8, hx + 2 + aw, hy + 6, hx + 6 + ab, H, hx + 6, H], slv.base);
    a.line(hx + 2 + aw, hy + 7, hx + 6 + ab, H - 1, slv.sh);
    a.line(hx + 3, hy + 9, hx + 7, H - 1, slv.hi || slv.base);
    if (slv.base === p.sk.base && !ch) a.line(hx + 4, hy + 12, hx + 9, H - 1, p.sk.sh);
    // 手
    var rows = [
      '..BBBB...',
      '.BBBBBB..',
      'BBBBBBBS.',
      'BSBBSBBS.',
      'BBBBBBBBS',
      '.BBSBBBBS',
      '..BBBBBS.',
      '...SSSS..'];
    X.stamp(a, hx, hy, rows, { B: hs.base, S: hs.sh });
    a.line(hx + 1, hy + 2, hx + 1, hy - 3, hs.base);
    a.line(hx + 2, hy + 2, hx + 2, hy - 3, hs.sh);
  }

  /* ================= 合成 ================= */
  var softCache = new Map();
  function softLine(line, under) {
    var key = line * 4096 + (under & 0xfff);
    var m = softCache.get(line);
    if (!m) { m = new Map(); softCache.set(line, m); }
    var r = m.get(under);
    if (r === undefined) { r = P.mix(line, under, 0.3); m.set(under, r); }
    return r;
  }
  function compose(p, expr) {
    var out = L();
    var Ls = p.layers;
    var head = Ls.head.clone(), top = Ls.top.clone(), fx = L();
    if (!p.silhouette) drawFeatures(p, expr, head, top, fx);
    var extra = L();
    if (expr === 'think' && !p.silhouette && !p.judge) drawHand(p, extra);
    var order = [Ls.back, Ls.body, head, Ls.front, top, extra];
    for (var i = 0; i < order.length; i++) {
      var lay = order[i];
      // 选择性描边：外轮廓用深色，压在下层像素上的内部线条用较柔和的色
      var ol = lay.outlineLayer(P.outlineOf), od = ol.d, dd = out.d;
      for (var k = 0; k < od.length; k++) {
        var c = od[k];
        if (!c) continue;
        dd[k] = dd[k] ? softLine(c, dd[k]) : c;
      }
      out.blit(lay, 0, 0);
      if (lay === top) out.blit(fx, 0, 0);
    }
    if (p.judge && (expr === 'angry' || expr === 'dark')) {
      // 眼孔红光溢出
      out.glow(CX - 5, p.g.eyeY + 2, 9, 6, '#ff2040', 0.35, 3);
      out.glow(CX + 5, p.g.eyeY + 2, 9, 6, '#ff2040', 0.35, 3);
    }
    return out;
  }

  R.portrait = function (id, expr) {
    var p = partCache[id] || (partCache[id] = buildParts(id));
    if (DM.EXPRS && DM.EXPRS.indexOf(expr) < 0) expr = 'normal';
    return compose(p, expr || 'normal');
  };
  R.parts = function (id) { return partCache[id] || (partCache[id] = buildParts(id)); };

  /* ================= 小人 16x32 ================= */
  R.sprite = function (id) {
    var ch = DM.CHARS && DM.CHARS[id];
    var b = new X.Buf(16, 32);
    if (!ch) {
      b.ellipse(8, 6, 4, 4.5, '#1c1a24'); b.rect(4, 11, 8, 14, '#1c1a24'); b.rect(5, 25, 2, 6, '#1c1a24'); b.rect(9, 25, 2, 6, '#1c1a24');
      b.outline('#05040a');
      return b;
    }
    var v = ch.visual, cfg = CFG[id] || {};
    var hr = P.ramp(v.hairColor || '#303030'), sk = skinPal(v.skin || '#e8c8b0'), oc = P.ramp(v.outfitColor || '#303040'), ic = P.ramp(v.inner || '#d0d0d0');
    var child = cfg.head === 'child';
    var small = child || id === 'kotone' || id === 'kurokawa' || id === 'hina';
    var tall = id === 'usami' || id === 'fuwa';
    var top = child ? 7 : small ? 4 : tall ? 1 : 2;
    var hx = 8, headR = child ? 4 : 3.6;
    var hy = top + 4;
    var bodyTop = hy + 5, legTop = child ? 24 : 22, foot = 31;
    var shw = child ? 3 : (tall || id === 'kurata' || id === 'genzou') ? 5 : 4;
    var hs = v.hair, acc = v.accessory || '', of = v.outfit;
    var bk = new X.Buf(16, 32), bd = new X.Buf(16, 32), hd = new X.Buf(16, 32);
    // 后发
    if (/long|hime/.test(hs)) { bk.rect(hx - 5, hy - 2, 10, 13 + (hs === 'long_ribbon' ? 3 : 0), hr.sh); }
    if (hs === 'loose_wavy_long') bk.rect(hx - 5, hy - 2, 10, 12, hr.sh);
    if (hs === 'twin_tails') { bk.rect(hx - 7, hy - 2, 3, 12, hr.base); bk.rect(hx + 4, hy - 2, 3, 12, hr.base); bk.px(hx - 6, hy + 10, hr.sh); bk.px(hx + 5, hy + 10, hr.sh); }
    if (hs === 'bob_asym' || hs === 'wavy_medium') bk.rect(hx - 5, hy - 2, 10, 8, hr.sh);
    if (hs === 'hood') { bk.ellipse(hx, hy, 6, 6, '#141018'); }
    if (/violin_case/.test(acc)) { bk.rect(1, bodyTop - 1, 3, 13, '#3a2418'); bk.px(2, bodyTop - 2, '#3a2418'); }
    // 身体
    var long = /labcoat|trench|robe|coat|white_dress|summer_dress|black_dress|tailcoat|smock/.test(of);
    var skirt = /dress|sailor|school_blazer/.test(of) && !/robe/.test(of);
    bd.rect(hx - shw, bodyTop, shw * 2, legTop - bodyTop, oc.base);
    bd.rect(hx - shw - 1, bodyTop + 1, 1, 7, oc.sh); bd.rect(hx + shw, bodyTop + 1, 1, 7, oc.sh);
    bd.px(hx - shw - 1, bodyTop + 8, sk.base); bd.px(hx + shw, bodyTop + 8, sk.base);
    bd.vl(hx + shw - 1, bodyTop, legTop - bodyTop, oc.sh);
    // 内衬
    if (!/robe|dress|smock|tshirt|chef|fisher/.test(of)) { bd.rect(hx - 1, bodyTop, 2, 4, ic.base); }
    if (/suit_tie|suit_vest/.test(of)) bd.vl(hx, bodyTop + 1, 4, '#6a1a24');
    if (of === 'sailor_cardigan') { bd.rect(hx - 3, bodyTop, 6, 2, '#28304e'); bd.rect(hx - 1, bodyTop + 1, 2, 2, ic.base); }
    if (of === 'chef') { bd.rect(hx - 1, bodyTop, 3, 1, ic.base); bd.px(hx - 2, bodyTop + 3, '#c8c8d0'); bd.px(hx - 2, bodyTop + 6, '#c8c8d0'); }
    if (of === 'black_dress') bd.rect(hx - 2, bodyTop, 4, 1, '#ffffff');
    if (of === 'jacket_scarf') bd.rect(hx - 2, bodyTop, 4, 2, ic.base);
    if (/towel/.test(acc)) bd.rect(hx - 2, bodyTop, 4, 1, '#e8e4dc');
    // 腿/裙
    var legC = /suit|coat|trench|jacket|butler|tailcoat|work|fisher|cardigan_shirt/.test(of) ? oc.sh2 : (of === 'chef' ? '#3a3a40' : of === 'tshirt_shorts' ? '#3a4a6a' : sk.base);
    if (of === 'labcoat') legC = '#3a4050';
    if (of === 'smock') legC = '#4a4a5a';
    if (long && !skirt) {
      bd.rect(hx - shw, legTop, shw * 2, of === 'black_robe' ? 9 : 5, oc.base); bd.vl(hx + shw - 1, legTop, 5, oc.sh); bd.vl(hx, legTop, 5, oc.sh);
    }
    if (skirt) {
      var sc = of === 'sailor_cardigan' ? '#28304e' : of === 'school_blazer' ? '#3a3050' : oc.base;
      bd.rect(hx - shw - 1, legTop - 1, shw * 2 + 2, 5, sc); bd.vl(hx + shw, legTop - 1, 5, P.adj(P.hex(C(sc)), -0.1));
    }
    if (of !== 'black_robe') {
      var lt = skirt || long ? legTop + 4 : legTop;
      bd.rect(hx - 3, lt, 2, foot - lt, legC); bd.rect(hx + 1, lt, 2, foot - lt, legC);
      bd.vl(hx + 2, lt, foot - lt, P.mix(C(legC), '#000000', 0.25));
      var shoe = /young/.test(id) ? '#c04040' : '#1a1418';
      if (id === 'chizuru' || id === 'hina') shoe = id === 'chizuru' ? '#e8e0e0' : '#1a1418';
      bd.rect(hx - 4, foot - 1, 3, 2, shoe); bd.rect(hx + 1, foot - 1, 3, 2, shoe);
    }
    // 头
    hd.ellipse(hx, hy, headR, headR + 0.6, sk.base);
    hd.vl(hx + 2, hy - 2, 5, sk.sh);
    hd.rect(hx - 1, hy + 4, 2, 2, sk.sh);
    // 头发
    if (hs !== 'hood') {
      var bald = hs === 'buzz';
      hd.clip(0, 0, 16, hy - (bald ? 1 : 0)); hd.ellipse(hx, hy, headR + 0.8, headR + 1.2, bald ? P.mix(hr.base, sk.base, 0.3) : hr.base); hd.clip();
      if (!bald && hs !== 'bandana' && hs !== 'cap') {
        hd.rect(hx - 4, hy - 1, 2, hs.indexOf('long') >= 0 || hs === 'hime_cut' ? 6 : 3, hr.base);
        hd.rect(hx + 2, hy - 1, 2, hs.indexOf('long') >= 0 || hs === 'hime_cut' ? 6 : 3, hr.base);
        if (hs === 'hime_cut') hd.hl(hx - 3, hy - 1, 6, hr.base);
        else { hd.px(hx - 2, hy - 1, hr.base); hd.px(hx + 1, hy - 1, hr.base); }
      }
      hd.px(hx - 2, hy - 4, hr.hi); hd.px(hx - 1, hy - 4, hr.hi);
    }
    // 眼
    var eyeC = v.eyes === 'mask' ? '#ff3050' : '#1a1420';
    if (v.eyes !== 'mask') { hd.px(hx - 2, hy + 1, eyeC); hd.px(hx + 1, hy + 1, eyeC); }
    // 特征配饰
    if (hs === 'hood') {
      hd.ellipse(hx, hy, headR + 1.5, headR + 1.8, '#141018');
      hd.ellipse(hx, hy + 1, headR - 0.5, headR - 0.5, '#24202c');
      hd.px(hx - 2, hy, '#ff3050'); hd.px(hx + 1, hy, '#ff3050');
      hd.rect(hx - 1, hy + 2, 2, 3, '#3a3848'); hd.px(hx, hy + 5, '#3a3848');
    }
    if (hs === 'bandana') { hd.rect(hx - 4, hy - 6, 8, 4, '#f4f4f6'); hd.rect(hx - 3, hy - 8, 6, 2, '#f4f4f6'); hd.hl(hx - 4, hy - 3, 8, '#c8c8d0'); hd.px(hx - 2, hy + 3, hr.base); hd.hl(hx - 2, hy + 4, 4, hr.base); }
    if (hs === 'cap') { hd.rect(hx - 4, hy - 5, 8, 3, '#3a4450'); hd.hl(hx - 5, hy - 2, 9, '#28303a'); hd.rect(hx - 3, hy + 3, 6, 2, '#d8d4cc'); }
    if (/beret/.test(acc)) { hd.rect(hx - 4, hy - 6, 7, 2, '#2e3e5e'); hd.px(hx - 1, hy - 7, '#2e3e5e'); }
    if (/top_hat/.test(acc)) { hd.rect(hx - 1, hy - 9, 5, 4, '#24142e'); hd.hl(hx - 2, hy - 5, 7, '#24142e'); hd.hl(hx - 1, hy - 6, 5, '#9a2a50'); }
    if (/straw_hat/.test(acc)) { hd.hl(hx - 6, hy - 3, 12, '#e0c070'); hd.rect(hx - 3, hy - 6, 6, 3, '#e0c070'); hd.hl(hx - 3, hy - 4, 6, '#c83040'); }
    if (/white_ribbon/.test(acc)) { hd.px(hx + 3, hy - 4, '#ffffff'); hd.px(hx + 4, hy - 3, '#ffffff'); hd.px(hx + 4, hy - 5, '#ffffff'); }
    if (hs === 'twin_tails') { hd.px(hx - 4, hy - 3, '#b0203c'); hd.px(hx + 3, hy - 3, '#b0203c'); }
    if (hs === 'bun') hd.ellipse(hx + 1, hy - 5, 2.2, 1.8, hr.base);
    if (/glasses/.test(acc)) { hd.hl(hx - 3, hy + 1, 6, '#2a2420'); hd.px(hx - 2, hy + 1, '#d8e0f0'); hd.px(hx + 1, hy + 1, '#d8e0f0'); }
    if (/beard|mustache/.test(acc) && !/beard_white/.test(acc)) hd.hl(hx - 2, hy + 3, 4, hr.base);
    if (/beard_white/.test(acc)) hd.rect(hx - 3, hy + 3, 6, 2, '#d8d4cc');
    if (hs === 'twin_braids') { bd.rect(hx - 5, bodyTop, 2, 6, hr.base); bd.rect(hx + 3, bodyTop, 2, 6, hr.base); bd.px(hx - 5, bodyTop + 6, '#d04050'); bd.px(hx + 4, bodyTop + 6, '#d04050'); }
    if (hs === 'long_tied') bd.rect(hx + 2, bodyTop, 2, 5, hr.base);
    // 手持物
    if (/red_notebook/.test(acc)) { bd.rect(hx - 6, bodyTop + 6, 3, 4, '#b01c30'); bd.px(hx - 5, bodyTop + 7, '#e8c870'); bd.px(hx - 6, bodyTop + 9, '#f4f4f8'); }
    if (/cane/.test(acc)) { bd.vl(hx + shw + 2, bodyTop + 6, foot - bodyTop - 6, '#4a2a18'); bd.hl(hx + shw + 1, bodyTop + 6, 2, '#c9a25a'); }
    if (/violin_case/.test(acc)) { bd.line(hx - 3, bodyTop, hx + 3, legTop - 1, '#4a2a1a'); }
    if (/camera/.test(acc)) { bd.rect(hx, bodyTop + 4, 3, 2, '#1a1a1e'); bd.px(hx + 1, bodyTop + 4, '#8aa0c0'); }
    if (/doll/.test(acc)) { bd.rect(hx + 2, bodyTop + 5, 3, 4, '#a02030'); bd.rect(hx + 2, bodyTop + 3, 3, 2, '#141018'); bd.px(hx + 3, bodyTop + 4, '#f8f0ea'); }
    if (/white_gloves/.test(acc)) { bd.px(hx - shw - 1, bodyTop + 8, '#f4f4f8'); bd.px(hx + shw, bodyTop + 8, '#f4f4f8'); }
    b.blit(bk.outlineLayer('#07060c'), 0, 0); b.blit(bk, 0, 0);
    b.blit(bd.outlineLayer('#07060c'), 0, 0); b.blit(bd, 0, 0);
    b.blit(hd.outlineLayer(P.outlineOf), 0, 0); b.blit(hd, 0, 0);
    return b;
  };

  R.CFG = CFG;
  R.EYES = EYES;
  if (typeof module !== 'undefined' && module.exports) module.exports = R;
})(typeof window !== 'undefined' ? window : globalThis);
