/* DARK MOOD HD 背景 —— 鸦之塔（一楼 / 藏书室 / 书斋 / 机械室 / 瞭望台）、审判厅、鸦笼、标题
 * 设计坐标 1920x1080；锚点 = locations.js 的 480x270 坐标 ×4。
 * 光照做法：先画「固有色 + 形体明暗」，再乘一张低分辨率光照图（环境色 + 各光源衰减 + 投影），
 * 最后叠加泛光 / 高光 / 体积光。q.light 决定光照图的层次，q.tex 决定纹理，q.model 决定物件与细节数量。
 * 只用 ES5 + Canvas 2D 基础 API。
 */
(function (root) {
  'use strict';
  var DM = root.DM = root.DM || {};
  var K = DM.HK;
  if (!K || !DM.HDBG) return;
  var W = 1920, H = 1080, PI = Math.PI, TAU = PI * 2;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function byM(q, a, b, c) { return K.byModel(q, a, b, c); }

  /* 共用纹理预设：同一组参数 + 同一 units 的贴图只生成一次（贴图生成是主要耗时） */
  var OAK_V = { c1: '#2a180c', c2: '#5e3c20', planks: 4, dir: 'v', seed: 88, gap: '#3e2616', ring: 2 };
  var OAK_H = { c1: '#2a180c', c2: '#5e3c20', planks: 4, dir: 'h', seed: 88, gap: '#3e2616', ring: 2 };
  var OAK_U = 256;
  // 用共用木纹填当前路径，然后叠一层色调（tint = [color, alpha]）
  function oakFill(g, q, fallback, horiz, ox, oy, tint) {
    if (q.tex > 0) {
      g.save(); K.fillTex(g, q, 'wood', horiz ? OAK_H : OAK_V, OAK_U, ox || 0, oy || 0); g.restore();
      if (tint) { g.save(); g.globalCompositeOperation = tint[2] || 'source-over'; g.fillStyle = K.rgba(tint[0], tint[1]); g.fill(); g.restore(); }
    } else { g.fillStyle = fallback; g.fill(); }
  }
  // 柔边体积光：多层内缩的多边形叠加
  function softShaft(g, pts, color, a, x0, y0, x1, y1, layers) {
    layers = layers || 5;
    var cx = 0, cy = 0, n = pts.length / 2, i, k;
    for (i = 0; i < pts.length; i += 2) { cx += pts[i]; cy += pts[i + 1]; }
    cx /= n; cy /= n;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (k = 0; k < layers; k++) {
      var f = 1 - k / layers * 0.75, pp = [];
      for (i = 0; i < pts.length; i += 2) pp.push(cx + (pts[i] - cx) * f, pts[i + 1] + (cy - pts[i + 1]) * (1 - f) * 0.15);
      K.poly(g, pp);
      g.fillStyle = K.lin(g, x0, y0, x1, y1, [[0, K.rgba(color, a / layers)], [0.6, K.rgba(color, a / layers * 0.5)], [1, K.rgba(color, 0)]]);
      g.fill();
    }
    g.restore();
  }
  function dust(g, rnd, n, x, y, w, h, color, a) {
    g.save(); g.globalCompositeOperation = 'lighter';
    for (var i = 0; i < n; i++) {
      var px = x + rnd() * w, py = y + rnd() * h, r = 0.6 + rnd() * 1.3;
      g.fillStyle = K.rgba(color, a * (0.25 + rnd() * 0.75));
      g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill();
    }
    g.restore();
  }

  /* =================================================================
   * 光照图：低分辨率画布，乘到画面上
   * ================================================================= */
  function lightMap(q, amb) {
    var k = Math.min(q.s, 1) / 4;
    var w = Math.max(32, Math.round(W * k)), h = Math.max(18, Math.round(H * k));
    var c = K.canvas(w, h), x = c.getContext('2d');
    x.setTransform(w / W, 0, 0, h / H, 0, 0);
    x.fillStyle = amb; x.fillRect(0, 0, W, H);
    return { c: c, g: x, amb: amb };
  }
  // 点光源（sy<1 压扁成椭圆，用来模拟地面上的光池）
  function lmLight(L, x, y, r, color, a, sy, rot) {
    var g = L.g; g.save(); g.globalCompositeOperation = 'lighter';
    g.translate(x, y); if (rot) g.rotate(rot); if (sy) g.scale(1, sy);
    g.fillStyle = K.rad(g, 0, 0, 0, r, [[0, K.rgba(color, a)], [0.12, K.rgba(color, a * 0.8)], [0.35, K.rgba(color, a * 0.42)],
      [0.65, K.rgba(color, a * 0.14)], [1, K.rgba(color, 0)]]);
    g.fillRect(-r, -r, 2 * r, 2 * r); g.restore();
  }
  // 线性光（窗光从一侧照进来）
  function lmLinear(L, pts, color, a, x0, y0, x1, y1) {
    var g = L.g; g.save(); g.globalCompositeOperation = 'lighter';
    K.poly(g, pts); g.fillStyle = K.lin(g, x0, y0, x1, y1, [[0, K.rgba(color, a)], [1, K.rgba(color, 0)]]); g.fill(); g.restore();
  }
  // 投影 / 遮挡：把区域往环境色拉回
  function lmShade(L, a, fn) {
    var g = L.g; g.save(); g.fillStyle = K.rgba(L.amb, a); fn(g); g.fill(); g.restore();
  }
  function lmDark(L, a, fn) { var g = L.g; g.save(); g.fillStyle = 'rgba(0,0,0,' + a + ')'; fn(g); g.fill(); g.restore(); }
  function applyLM(g, L) {
    g.save(); g.globalCompositeOperation = 'multiply'; g.drawImage(L.c, 0, 0, W, H); g.restore();
  }

  /* =================================================================
   * 圆塔房间：后墙是一段弧面（两侧离镜头更近）
   * ================================================================= */
  function TRoom(o) {
    var R = { hy: o.hy, top0: o.top0, bot0: o.bot0, c: o.c || 0.07 };
    R.m = function (x) { var u = (x - 960) / 960; return 1 + R.c * u * u; };
    R.top = function (x) { return R.hy + (R.top0 - R.hy) * R.m(x); };
    R.bot = function (x) { return R.hy + (R.bot0 - R.hy) * R.m(x); };
    R.wy = function (x, t) { return R.hy + (lerp(R.top0, R.bot0, t) - R.hy) * R.m(x); };
    // 墙面上「设计高度」y0（以中心处为准）的点在 x 处的 y
    R.wy0 = function (x, y0) { return R.hy + (y0 - R.hy) * R.m(x); };
    // 地面平面：X 为后墙中心深度处的横向坐标，s>=1 为向前的深度倍率
    R.fp = function (X, s) { return [960 + X * s, R.hy + (R.bot0 - R.hy) * s]; };
    R.sAt = function (y) { return (y - R.hy) / (R.bot0 - R.hy); };
    return R;
  }
  // 沿墙面画一块（x0..x1, 设计高度 y0..y1）的多边形
  function wallPath(g, R, x0, x1, y0, y1, n) {
    n = n || 6; g.beginPath();
    for (var i = 0; i <= n; i++) { var x = lerp(x0, x1, i / n); if (i) g.lineTo(x, R.wy0(x, y0)); else g.moveTo(x, R.wy0(x, y0)); }
    for (var j = n; j >= 0; j--) { var x2 = lerp(x0, x1, j / n); g.lineTo(x2, R.wy0(x2, y1)); }
    g.closePath();
  }
  function wallLine(g, R, x0, x1, y0, n) {
    n = n || 8; g.beginPath();
    for (var i = 0; i <= n; i++) { var x = lerp(x0, x1, i / n); if (i) g.lineTo(x, R.wy0(x, y0)); else g.moveTo(x, R.wy0(x, y0)); }
  }
  // 墙面区域（天花线与地脚线之间）
  function wallRegion(g, R) {
    var n = 24; g.beginPath();
    for (var i = 0; i <= n; i++) { var x = W * i / n; if (i) g.lineTo(x, R.top(x)); else g.moveTo(x, R.top(x)); }
    for (var j = n; j >= 0; j--) { var x2 = W * j / n; g.lineTo(x2, R.bot(x2)); }
    g.closePath();
  }
  function floorRegion(g, R) {
    var n = 24; g.beginPath(); g.moveTo(0, H);
    for (var i = 0; i <= n; i++) { var x = W * i / n; g.lineTo(x, R.bot(x)); }
    g.lineTo(W, H); g.closePath();
  }
  function ceilRegion(g, R) {
    var n = 24; g.beginPath(); g.moveTo(0, 0);
    for (var i = 0; i <= n; i++) { var x = W * i / n; g.lineTo(x, R.top(x)); }
    g.lineTo(W, 0); g.closePath();
  }

  // 透视木地板：每条木板单独 clip + 斜切贴图，让木纹沿透视方向汇聚
  function woodFloor(g, q, R, o) {
    var n = o.boards || byM(q, 18, 26, 34), sNear = R.sAt(H), xs = [];
    var span = o.span || 2400, x0 = 960 - span / 2;
    for (var i = 0; i <= n; i++) xs.push(x0 + span * i / n);
    var rnd = K.rng(o.seed || 7);
    floorRegion(g, R); g.fillStyle = o.base; g.fill();
    for (var b = 0; b < n; b++) {
      var Xa = xs[b] - 960, Xb = xs[b + 1] - 960;
      var fa = R.fp(Xa, R.m(960 + Xa)), fb = R.fp(Xb, R.m(960 + Xb)), na = R.fp(Xa, sNear), nb = R.fp(Xb, sNear);
      fa[1] = R.bot(fa[0]); fb[1] = R.bot(fb[0]);
      g.save();
      K.poly(g, [fa[0], fa[1], fb[0], fb[1], nb[0], nb[1], na[0], na[1]]); g.clip();
      var tone = rnd();
      if (q.tex > 0) {
        var cx = (fa[0] + fb[0]) / 2, cy = fa[1], ncx = (na[0] + nb[0]) / 2, k = (ncx - cx) / (H - cy);
        g.save(); g.translate(cx, cy); g.transform(1, 0, k, 1, 0, 0);
        K.poly(g, [-400, -40, 400, -40, 400, H, -400, H]);
        K.fillTex(g, q, 'wood', OAK_V, OAK_U, -150 + tone * 300, -tone * 900);
        g.restore();
      }
      K.poly(g, [fa[0], fa[1], fb[0], fb[1], nb[0], nb[1], na[0], na[1]]);
      g.fillStyle = tone < 0.5 ? 'rgba(0,0,0,' + ((0.5 - tone) * 0.35).toFixed(3) + ')' : 'rgba(255,225,190,' + ((tone - 0.5) * 0.12).toFixed(3) + ')';
      g.fill();
      g.restore();
      // 缝
      g.strokeStyle = o.gap || 'rgba(12,6,3,0.75)'; g.lineWidth = 2.2;
      g.beginPath(); g.moveTo(fa[0], fa[1]); g.lineTo(na[0], na[1]); g.stroke();
      if (q.light > 0) { g.strokeStyle = 'rgba(255,220,180,0.06)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(fa[0] + 2, fa[1]); g.lineTo(na[0] + 3, na[1]); g.stroke(); }
    }
    // 端头接缝（错缝）
    if (q.model > 0) {
      g.strokeStyle = o.gap || 'rgba(12,6,3,0.7)'; g.lineWidth = 1.8;
      var rows = byM(q, 0, 6, 9);
      for (var r = 0; r < rows; r++) {
        for (var b2 = (r % 2); b2 < n; b2 += 2) {
          var sj = lerp(R.m(xs[b2]), sNear, Math.pow((r + 0.3 + rnd() * 0.5) / rows, 1.5));
          var A = R.fp(xs[b2] - 960, sj), B = R.fp(xs[b2 + 1] - 960, sj);
          if (A[1] < R.bot(A[0]) + 2) continue;
          g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke();
        }
      }
    }
    // 远处压暗、近处微微反光
    floorRegion(g, R);
    g.fillStyle = K.lin(g, 0, R.bot0, 0, H, [[0, 'rgba(0,0,0,0.35)'], [0.4, 'rgba(0,0,0,0.05)'], [1, 'rgba(20,10,0,0.25)']]);
    g.fill();
  }

  // 透视地面上的多边形：pts 为 [X, s, X, s, ...]
  function floorPoly(g, R, pts) {
    g.beginPath();
    for (var i = 0; i < pts.length; i += 2) { var p = R.fp(pts[i], pts[i + 1]); if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }
    g.closePath();
  }

  /* =================================================================
   * 通用物件
   * ================================================================= */
  // 金属渐变（黄铜 / 铁）：沿方向的多段反光
  function brassGrad(g, x0, y0, x1, y1, dark) {
    return K.lin(g, x0, y0, x1, y1, dark ? [[0, '#3a2a12'], [0.3, '#8a6a32'], [0.45, '#d8b870'], [0.6, '#7a5a28'], [1, '#2a1c0a']]
      : [[0, '#5a4220'], [0.25, '#b08a44'], [0.42, '#f4dc98'], [0.58, '#a07a38'], [1, '#3a2810']]);
  }
  function ironGrad(g, x0, y0, x1, y1) {
    return K.lin(g, x0, y0, x1, y1, [[0, '#2a2a30'], [0.3, '#5a5a64'], [0.45, '#8a8a94'], [0.6, '#44444c'], [1, '#141418']]);
  }
  // 铆钉 / 钉头
  function rivet(g, q, x, y, r, rust) {
    g.beginPath(); g.arc(x, y, r, 0, TAU);
    g.fillStyle = K.rad(g, x - r * 0.35, y - r * 0.35, 0, r * 1.2, rust ? [[0, '#c07a48'], [0.5, '#6a3a1e'], [1, '#2a1408']] : [[0, '#9a9aa4'], [0.5, '#3e3e46'], [1, '#141418']]);
    g.fill();
  }
  // 小火焰（壁灯、烛台用；不加光晕）
  function flameShape(g, x, y, h, a) {
    var w = h * 0.36;
    g.beginPath(); g.moveTo(x, y - h); g.bezierCurveTo(x + w, y - h * 0.45, x + w * 0.8, y, x, y); g.bezierCurveTo(x - w * 0.8, y, x - w, y - h * 0.45, x, y - h);
    g.fillStyle = K.lin(g, x, y - h, x, y, [[0, 'rgba(255,220,140,' + (0.85 * (a || 1)) + ')'], [0.5, 'rgba(255,170,60,' + (0.95 * (a || 1)) + ')'], [1, 'rgba(200,70,20,' + (0.9 * (a || 1)) + ')']]);
    g.fill();
    K.ellipse(g, x, y - h * 0.3, w * 0.38, h * 0.24); g.fillStyle = 'rgba(255,252,235,0.95)'; g.fill();
  }

  // 石块墙（平面）：逐块着色，砂浆、上缘受光、下缘阴影；可叠加岩石颗粒纹理
  function blockWall(g, q, x, y, w, h, o) {
    var rnd = K.rng(o.seed || 1), bh = o.bh || 60, bw = o.bw || 120, m = o.mortarW || 3;
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.fillStyle = o.mortar || '#1e1c22'; g.fillRect(x, y, w, h);
    var rows = Math.ceil(h / bh) + 1;
    for (var r = 0; r < rows; r++) {
      var yy = y + r * bh, xx = x - (r % 2 ? bw * 0.5 : 0) - rnd() * bw * 0.3;
      while (xx < x + w) {
        var ww = bw * (0.65 + rnd() * 0.7), t = rnd();
        var c = K.mix(o.c1, o.c2, t);
        g.fillStyle = c;
        if (q.model >= 2) { K.rr(g, xx + m, yy + m, ww - 2 * m, bh - 2 * m, 5); g.fill(); }
        else g.fillRect(xx + m, yy + m, ww - 2 * m, bh - 2 * m);
        if (q.model > 0) {
          g.fillStyle = 'rgba(255,240,220,0.10)'; g.fillRect(xx + m, yy + m, ww - 2 * m, 3);
          g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(xx + m, yy + bh - m - 4, ww - 2 * m, 4);
          if (q.model >= 2 && rnd() < 0.3) { // 风化斑
            g.fillStyle = 'rgba(0,0,0,' + (0.06 + rnd() * 0.1).toFixed(3) + ')';
            K.ellipse(g, xx + ww * rnd(), yy + bh * rnd(), 8 + rnd() * 20, 4 + rnd() * 10); g.fill();
          }
        }
        xx += ww;
      }
    }
    if (q.tex > 0) {
      g.beginPath(); g.rect(x, y, w, h);
      g.globalCompositeOperation = 'overlay';
      K.fillTex(g, q, 'rock', { c1: '#303030', c2: '#d0d0d0', seed: o.seed || 37 }, o.grain || 260, 0, 0, 0.55);
      g.globalCompositeOperation = 'source-over';
    }
    g.restore();
  }

  // 天空（阴天、风暴云）：分层柔边云团。o: {top,bot,c0,c1,c2, light:[x,y,color], seed, n}
  function cloudSky(g, q, x, y, w, h, o) {
    K.vgrad(g, x, y, w, h, o.grad);
    var rnd = K.rng(o.seed || 5), n = o.n || byM(q, 26, 60, 110);
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    for (var i = 0; i < n; i++) {
      var t = rnd(), cy = y + h * (0.05 + Math.pow(t, 0.8) * 0.92);
      var cx = x + rnd() * w, r = (40 + rnd() * 140) * (0.5 + t * 0.9) * (o.scale || 1);
      var sq = 0.38 + rnd() * 0.2;
      var lit = o.lit ? clamp(1 - Math.abs(cx - o.lit[0]) / o.lit[2], 0, 1) * clamp(1 - Math.abs(cy - o.lit[1]) / (o.lit[2] * 0.8), 0, 1) : 0;
      var base = K.mix(o.c0, o.c1, rnd() * 0.7 + t * 0.3);
      // 云底暗、云顶亮
      g.save(); g.translate(cx, cy); g.scale(1, sq);
      g.fillStyle = K.rad(g, 0, 0, 0, r, [[0, K.rgba(base, 0.55)], [0.55, K.rgba(base, 0.32)], [1, K.rgba(base, 0)]]);
      g.fillRect(-r, -r, 2 * r, 2 * r);
      if (q.light > 0) {
        var hc = lit > 0 ? K.mix(o.c2, o.lit[3], lit) : o.c2;
        g.fillStyle = K.rad(g, -r * 0.15, -r * 0.45, 0, r * 0.7, [[0, K.rgba(hc, 0.22 + lit * 0.4)], [1, K.rgba(hc, 0)]]);
        g.fillRect(-r, -r, 2 * r, 2 * r);
      }
      g.restore();
    }
    g.restore();
  }

  // 海面：渐变 + 横向波纹 + 反光带
  function seaPlane(g, q, y0, y1, o) {
    K.vgrad(g, 0, y0, W, y1 - y0, o.grad);
    var rnd = K.rng(o.seed || 9), n = byM(q, 60, 160, 320);
    for (var i = 0; i < n; i++) {
      var t = Math.pow(rnd(), 1.6), y = y0 + (y1 - y0) * t, x = rnd() * W, len = (20 + rnd() * 90) * (0.3 + t * 2.2);
      var a = 0.05 + rnd() * 0.12;
      var near = o.glint ? clamp(1 - Math.abs(x - o.glint[0]) / o.glint[1], 0, 1) : 0;
      g.strokeStyle = near > 0.05 && rnd() < near ? K.rgba(o.glintColor || '#c8d0e0', 0.12 + near * 0.35) : (rnd() < 0.5 ? K.rgba(o.hi || '#8a9ab8', a) : 'rgba(0,0,0,' + (a * 1.4).toFixed(3) + ')');
      g.lineWidth = 0.8 + t * 3.2;
      g.beginPath(); g.moveTo(x - len / 2, y); g.quadraticCurveTo(x, y - 1.5 - t * 3, x + len / 2, y); g.stroke();
    }
  }

  // 飞翔的乌鸦剪影
  function flyingCrow(g, x, y, s, color, phase, flip) {
    g.save(); g.translate(x, y); g.scale(flip ? -s : s, s);
    var up = phase || 0; // -1 翅膀向下  1 向上
    g.beginPath();
    g.moveTo(-2, 0);
    g.bezierCurveTo(-10, -6 - up * 10, -22, -10 - up * 16, -34, -6 - up * 22);
    g.bezierCurveTo(-26, -2 - up * 8, -18, 2, -8, 3);
    g.lineTo(-4, 5); g.lineTo(-10, 9); g.lineTo(-2, 8); g.lineTo(4, 5);
    g.bezierCurveTo(14, 2, 24, -2 - up * 6, 34, -8 - up * 18);
    g.bezierCurveTo(24, -10 - up * 12, 12, -6 - up * 8, 6, -2);
    g.lineTo(9, -4); g.lineTo(13, -3); g.lineTo(9, -1);
    g.closePath();
    g.fillStyle = color; g.fill();
    g.restore();
  }
  // 乌鸦侧影（站立 / 展翅），用于徽章、彩窗
  function crowEmblem(g, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s);
    K.path(g, 'M0 -52 C10 -52 16 -46 18 -40 L34 -44 L20 -34 C22 -28 22 -22 20 -16 C40 -30 70 -44 98 -40 C80 -30 70 -20 62 -6 C76 -10 88 -6 96 2 C78 2 64 8 52 18 C40 28 26 34 14 38 L22 60 L10 52 L4 66 L0 50 L-4 66 L-10 52 L-22 60 L-14 38 C-26 34 -40 28 -52 18 C-64 8 -78 2 -96 2 C-88 -6 -76 -10 -62 -6 C-70 -20 -80 -30 -98 -40 C-70 -44 -40 -30 -20 -16 C-22 -22 -22 -28 -18 -36 C-16 -46 -10 -52 0 -52 Z');
    g.restore();
  }

  // 拱形橡木门（带铁条、铆钉）。返回门洞外框
  function oakDoor(g, q, x, y, w, h, o) {
    o = o || {};
    var arch = o.arch === undefined ? w * 0.5 : o.arch;
    function shape(ix, iy, iw, ih, ia) {
      g.beginPath(); g.moveTo(ix, iy + ih); g.lineTo(ix, iy + ia);
      if (ia > 0) g.quadraticCurveTo(ix, iy, ix + iw / 2, iy); else g.lineTo(ix, iy);
      if (ia > 0) g.quadraticCurveTo(ix + iw, iy, ix + iw, iy + ia); else g.lineTo(ix + iw, iy);
      g.lineTo(ix + iw, iy + ih); g.closePath();
    }
    // 门板（竖向木板）
    shape(x, y, w, h, arch);
    oakFill(g, q, o.fill || '#4a2e1a', false, x + (o.texOff || 0), y, o.tint || ['#3a2010', 0.15]);
    // 竖向木板缝
    g.save(); shape(x, y, w, h, arch); g.clip();
    var np = o.planks || 5;
    for (var pi = 1; pi < np; pi++) { var pxx = x + w * pi / np; g.fillStyle = 'rgba(10,5,2,0.75)'; g.fillRect(pxx - 1.5, y, 3, h); g.fillStyle = 'rgba(255,220,180,0.07)'; g.fillRect(pxx + 1.5, y, 2, h); }
    g.restore();
    shape(x, y, w, h, arch);
    g.fillStyle = K.lin(g, x, 0, x + w, 0, [[0, 'rgba(255,230,200,0.08)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.3)']]); g.fill();
    // 铁条
    var straps = o.straps || [0.18, 0.5, 0.82];
    for (var i = 0; i < straps.length; i++) {
      var sy = y + arch * 0.4 + (h - arch * 0.4) * straps[i];
      var len = o.strapLen ? w * o.strapLen : w * 0.92, sx = o.hingeRight ? x + w - len - w * 0.04 : x + w * 0.04;
      g.fillStyle = ironGrad(g, 0, sy - 9, 0, sy + 9);
      g.beginPath(); g.moveTo(sx, sy - 9); g.lineTo(sx + len - 14, sy - 7); g.quadraticCurveTo(sx + len, sy, sx + len - 14, sy + 7); g.lineTo(sx, sy + 9); g.closePath(); g.fill();
      if (q.model > 0) for (var k = 0; k < 5; k++) rivet(g, q, sx + 14 + k * (len - 34) / 4, sy, 3.4);
    }
    // 门框阴影（门嵌在墙里）
    if (q.light > 0) {
      shape(x, y, w, h, arch);
      g.save(); g.clip();
      g.fillStyle = K.lin(g, x, 0, x + 26, 0, ['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']); g.fillRect(x, y, 26, h);
      g.fillStyle = K.lin(g, 0, y, 0, y + 40, ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)']); g.fillRect(x, y, w, 40);
      g.restore();
    }
    return shape;
  }

  // 书架上的一排书（x..x+w，底边 y）
  function bookRow(g, q, x, y, w, maxH, rnd, o) {
    o = o || {};
    var cols = o.cols || ['#5a1a1e', '#2a3a2a', '#3a2a1a', '#1e2638', '#4a3a20', '#6a4a2a', '#2a1a24', '#5a4a3a', '#3a1418', '#22302e'];
    var xx = x;
    while (xx < x + w - 6) {
      var bw = 10 + rnd() * 16, bh = maxH * (0.68 + rnd() * 0.3);
      if (xx + bw > x + w) bw = x + w - xx;
      if (bw < 5) break;
      var lean = 0;
      if (q.model >= 1 && rnd() < 0.05 && xx + bw + 30 < x + w) lean = 0.18;
      var c = rnd.pick(cols);
      g.save(); g.translate(xx, y);
      if (lean) { g.translate(bw, 0); g.rotate(lean); g.translate(-bw, 0); }
      g.fillStyle = K.lin(g, 0, 0, bw, 0, [[0, K.shade(c, -0.35)], [0.3, K.shade(c, 0.12)], [0.55, c], [1, K.shade(c, -0.5)]]);
      g.fillRect(0, -bh, bw, bh);
      if (q.model >= 1) {
        var gb = rnd() < 0.6;
        if (gb) { g.fillStyle = 'rgba(214,178,94,0.55)'; g.fillRect(1, -bh + bh * 0.12, bw - 2, 2.2); g.fillRect(1, -bh * 0.18, bw - 2, 2.2); }
        if (q.model >= 2 && bw > 12 && rnd() < 0.5) { g.fillStyle = 'rgba(214,178,94,0.35)'; g.fillRect(bw * 0.3, -bh * 0.7, bw * 0.4, bh * 0.25); }
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, -bh, bw, 3);
      }
      g.restore();
      xx += bw + (lean ? 26 : 0.5);
      if (q.model >= 2 && rnd() < 0.04) xx += 20 + rnd() * 30; // 空位
    }
  }

  // 画面收尾：胶片颗粒（统一质感）+ 暗角
  function finish(g, q, vig, inner) {
    if (q.tex > 0) {
      g.save(); g.beginPath(); g.rect(0, 0, W, H); g.globalCompositeOperation = 'overlay';
      K.fillTex(g, q, 'noise', { c1: '#3c3c3c', c2: '#c4c4c4', scale: 32, oct: 2, seed: 99, contrast: 1.5 }, 128, 0, 0, q.tex >= 2 ? 0.14 : 0.1);
      g.restore();
    }
    if (vig) K.vignette(g, W, H, vig, inner || 0.45);
  }
  // 全局石材颗粒（overlay），pathFn 为空则整幅
  function stoneGrain(g, q, pathFn, a, units, seed) {
    if (q.tex <= 0) return;
    g.save(); if (pathFn) pathFn(g); else { g.beginPath(); g.rect(0, 0, W, H); }
    g.globalCompositeOperation = 'overlay';
    K.fillTex(g, q, 'noise', { c1: '#383838', c2: '#c8c8c8', scale: 16, oct: 4, seed: seed || 37, contrast: 1.3 }, units || 256, 0, 0, a || 0.6);
    g.restore();
  }

  /* =================================================================
   * 书斋 study
   * ================================================================= */
  var STUDY = TRoom({ hy: 430, top0: 96, bot0: 776, c: 0.06 });

  // 窗帘：outer(y)/inner(y) 两条边界之间画褶皱
  function drapeCurtain(g, q, side, xOut, xIn, top, tieY, bot, seed) {
    function inner(y) {
      if (y < tieY) { var t = (y - top) / (tieY - top); return lerp(xIn, xOut - side * 20, Math.pow(t, 1.6)); }
      var t2 = (y - tieY) / (bot - tieY); return lerp(xOut - side * 20, xOut - side * 70, Math.pow(t2, 0.8));
    }
    function outer(y) { var t = (y - top) / (bot - top); return xOut + side * (8 + t * 20); }
    var n = 14, i, y;
    g.beginPath();
    for (i = 0; i <= n; i++) { y = lerp(top, bot, i / n); if (i) g.lineTo(inner(y), y); else g.moveTo(inner(y), y); }
    // 下摆波浪
    var xa = inner(bot), xb = outer(bot), waves = 4;
    for (i = 1; i <= waves; i++) { var xm = lerp(xa, xb, (i - 0.5) / waves), xe = lerp(xa, xb, i / waves); g.quadraticCurveTo(xm, bot + (i % 2 ? 10 : -4), xe, bot); }
    for (i = n; i >= 0; i--) { y = lerp(top, bot, i / n); g.lineTo(outer(y), y); }
    g.closePath();
    g.save();
    K.matFill(g, q, '#5a1820', 'fabric', { c1: '#3e1016', c2: '#6a2028', threads: 60, seed: 14 }, 96, 0, 0);
    g.clip();
    // 竖向褶皱：沿着收拢形状走
    var nf = byM(q, 4, 6, 9);
    for (var f = 0; f < nf; f++) {
      var fr = (f + 0.5) / nf;
      for (var pass = 0; pass < 2; pass++) {
        g.beginPath();
        for (i = 0; i <= n; i++) {
          y = lerp(top, bot + 10, i / n);
          var x = lerp(outer(y), inner(y), fr) + (pass ? -side * 7 : 0);
          if (i) g.lineTo(x, y); else g.moveTo(x, y);
        }
        var wdt = Math.abs(xIn - xOut) / nf;
        g.strokeStyle = pass ? 'rgba(255,170,160,0.10)' : 'rgba(0,0,0,0.42)';
        g.lineWidth = pass ? wdt * 0.25 : wdt * 0.55; g.stroke();
      }
    }
    // 整体明暗：靠窗一侧受冷光
    g.fillStyle = K.lin(g, xOut, 0, xIn, 0, side < 0 ? ['rgba(0,0,0,0.35)', 'rgba(150,160,200,0.08)'] : ['rgba(0,0,0,0.5)', 'rgba(150,160,200,0.06)']);
    g.fillRect(Math.min(xOut, xIn) - 90, top, Math.abs(xIn - xOut) + 180, bot - top + 20);
    g.restore();
    // 束带（金色绳带绕过收拢处 + 流苏）
    var xi = inner(tieY), xo = outer(tieY), xl = Math.min(xi, xo) - 6, xr = Math.max(xi, xo) + 6;
    g.beginPath(); g.moveTo(xl, tieY - 6); g.quadraticCurveTo((xl + xr) / 2, tieY + 4, xr, tieY - 6);
    g.lineTo(xr, tieY + 6); g.quadraticCurveTo((xl + xr) / 2, tieY + 16, xl, tieY + 6); g.closePath();
    g.fillStyle = K.lin(g, 0, tieY - 6, 0, tieY + 16, ['#e0c070', '#a07a30', '#4a3410']); g.fill();
    if (q.model > 0) {
      var tx = xo + side * 4;
      g.strokeStyle = '#a07a30'; g.lineWidth = 3; g.beginPath(); g.moveTo(tx, tieY + 8); g.quadraticCurveTo(tx + side * 6, tieY + 30, tx, tieY + 52); g.stroke();
      g.fillStyle = K.lin(g, tx - 7, 0, tx + 7, 0, ['#6a4a18', '#e0c070', '#6a4a18']);
      g.beginPath(); g.moveTo(tx - 3, tieY + 50); g.lineTo(tx + 3, tieY + 50); g.lineTo(tx + 8, tieY + 82); g.lineTo(tx - 8, tieY + 82); g.closePath(); g.fill();
      rivet(g, q, tx, tieY + 50, 5);
    }
  }

  function drawStudy(g, q) {
    var R = STUDY;
    // ---- 天花板：橡木板 + 梁，朝消失点汇聚 ----
    ceilRegion(g, R);
    oakFill(g, q, '#3a2414', true, 0, 0, ['#2a1408', 0.2]);
    g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 2;
    for (var cb = -12; cb <= 12; cb++) {
      var cx0 = 960 + cb * 96, ctop = R.top(cx0), kk = (0 - R.hy) / (ctop - R.hy);
      g.beginPath(); g.moveTo(cx0, ctop); g.lineTo(960 + (cx0 - 960) * kk, 0); g.stroke();
    }
    // 两根粗梁（朝消失点）
    for (var bm = 0; bm < 2; bm++) {
      var bx = bm ? 1360 : 470, bw2 = 44, t0 = R.top(bx), k0 = (0 - R.hy) / (t0 - R.hy);
      var pA = [bx - bw2 / 2, t0], pB = [bx + bw2 / 2, t0], pC = [960 + (bx + bw2 / 2 - 960) * k0, 0], pD = [960 + (bx - bw2 / 2 - 960) * k0, 0];
      K.poly(g, [pA[0], pA[1], pB[0], pB[1], pC[0] + 30 * (bm ? 1 : -1), 0, pD[0] - 10 * (bm ? -1 : 1), 0]);
      oakFill(g, q, '#2a1a0e', false, bx, 0, ['#1a0c04', 0.35]);
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fill();
      g.strokeStyle = 'rgba(255,210,160,0.12)'; g.lineWidth = 2; g.beginPath(); g.moveTo(pA[0], pA[1]); g.lineTo(pD[0] - 10 * (bm ? -1 : 1), 0); g.stroke();
    }
    ceilRegion(g, R); g.fillStyle = K.lin(g, 0, 0, 0, 100, ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.35)']); g.fill();
    // 活板门（锚点 784-1040, 0-64）：被锈钉钉死
    (function trapdoor() {
      var nx0 = 792, nx1 = 1032, ny = 0, fy = 60, f0 = 814, f1 = 1010;
      K.poly(g, [nx0 - 14, ny, nx1 + 14, ny, f1 + 12, fy + 8, f0 - 12, fy + 8]); g.fillStyle = '#1a0e06'; g.fill();
      K.poly(g, [nx0 - 14, ny, nx1 + 14, ny, f1 + 12, fy + 8, f0 - 12, fy + 8]); g.strokeStyle = 'rgba(255,210,160,0.18)'; g.lineWidth = 2; g.stroke();
      K.poly(g, [nx0, ny, nx1, ny, f1, fy, f0, fy]);
      oakFill(g, q, '#4a2e18', false, nx0, 0, ['#5a3a20', 0.1]);
      K.poly(g, [nx0, ny, nx1, ny, f1, fy, f0, fy]);
      g.fillStyle = K.lin(g, 0, ny, 0, fy, ['rgba(255,220,180,0.06)', 'rgba(0,0,0,0.3)']); g.fill();
      g.strokeStyle = 'rgba(8,4,2,0.85)'; g.lineWidth = 2.4;
      for (var i = 1; i < 5; i++) { var a = lerp(nx0, nx1, i / 5), b = lerp(f0, f1, i / 5); g.beginPath(); g.moveTo(a, ny); g.lineTo(b, fy); g.stroke(); }
      var bands = [0.25, 0.78];
      for (var j = 0; j < bands.length; j++) {
        var t = bands[j], yA = lerp(ny, fy, t), xa = lerp(nx0, f0, t), xb = lerp(nx1, f1, t);
        g.fillStyle = ironGrad(g, 0, yA - 5, 0, yA + 5); g.fillRect(xa + 6, yA - 4.5, xb - xa - 12, 9);
        if (q.model > 0) { g.fillStyle = 'rgba(150,70,30,0.5)'; g.fillRect(xa + 30, yA + 3, 44, 3); g.fillRect(xb - 96, yA + 2, 54, 3); }
      }
      var nails = [[0.03, 0.18], [0.97, 0.18], [0.03, 0.82], [0.97, 0.82], [0.32, 0.5], [0.68, 0.5], [0.5, 0.12], [0.5, 0.88], [0.15, 0.5], [0.85, 0.5]];
      var nn = byM(q, 6, 8, 10);
      for (var m = 0; m < nn; m++) {
        var tt = nails[m][1], xL = lerp(nx0, f0, tt), xR = lerp(nx1, f1, tt), px = lerp(xL, xR, nails[m][0]), py = lerp(ny, fy, tt);
        if (q.model > 0) { g.fillStyle = 'rgba(130,56,20,0.5)'; K.ellipse(g, px + 1, py + 7, 3.4, 9); g.fill(); }
        rivet(g, q, px, py, 4.6, true);
      }
    })();
    // 天花铁钩（挂鸟笼用，悬在书桌上方）
    if (q.model > 0) {
      var hx = 880;
      g.fillStyle = '#141416'; K.ellipse(g, hx, 84, 13, 4); g.fill();
      g.strokeStyle = '#2a2a30'; g.lineWidth = 6; g.beginPath(); g.moveTo(hx, 84); g.lineTo(hx, 118); g.stroke();
      g.lineWidth = 5; g.beginPath(); g.arc(hx - 9, 120, 9, 0, PI * 0.95); g.stroke();
      if (q.light >= 2) { g.strokeStyle = 'rgba(230,230,240,0.7)'; g.lineWidth = 1.5; g.beginPath(); g.arc(hx - 9, 120, 9, 0.2, 1.3); g.stroke(); }
    }

    // ---- 墙：上部暗红大马士革壁纸，下部橡木护墙板 ----
    wallRegion(g, R);
    K.matFill(g, q, '#5a2a2c', 'wallpaper', { c1: '#4e2226', c2: '#663036', line: 'rgba(120,70,50,0.35)', seed: 53 }, 150, 0, 0);
    // 壁纸的水渍与褪色（手绘斑块，不用大贴图）
    if (q.model > 0) {
      var st = K.rng(17);
      g.save(); wallRegion(g, R); g.clip();
      for (var sI = 0; sI < byM(q, 0, 8, 14); sI++) {
        var sx = st() * W, sy = 150 + st() * 300, sr = 60 + st() * 140;
        g.fillStyle = K.rad(g, sx, sy, 0, sr, [[0, 'rgba(30,14,10,0.18)'], [0.7, 'rgba(30,14,10,0.08)'], [1, 'rgba(30,14,10,0)']]);
        g.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
      }
      // 从檐口往下的水痕
      for (var dI = 0; dI < byM(q, 0, 4, 8); dI++) {
        var dx0 = 120 + st() * 1700, dl = 80 + st() * 200;
        g.fillStyle = K.lin(g, 0, 140, 0, 140 + dl, ['rgba(20,10,8,0.22)', 'rgba(20,10,8,0)']);
        g.fillRect(dx0, 140, 6 + st() * 14, dl);
      }
      g.restore();
    }
    // 檐口
    wallPath(g, R, 0, W, 96, 130, 24); oakFill(g, q, '#3a2414', true, 0, 0, ['#1e0e06', 0.3]);
    wallPath(g, R, 0, W, 122, 130, 24); g.fillStyle = 'rgba(255,220,170,0.22)'; g.fill();
    wallPath(g, R, 0, W, 130, 148, 24); g.fillStyle = K.lin(g, 0, 130, 0, 148, ['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)']); g.fill();
    // 护墙板
    var wTop = 520;
    wallPath(g, R, 0, W, wTop, 790, 24); oakFill(g, q, '#4a2c18', false, 0, 0, ['#2a1408', 0.15]);
    wallPath(g, R, 0, W, wTop - 16, wTop + 4, 24); oakFill(g, q, '#5a3820', true, 0, 0, ['#5a3a20', 0.15]);
    wallPath(g, R, 0, W, wTop - 16, wTop - 12, 24); g.fillStyle = 'rgba(255,225,180,0.3)'; g.fill();
    wallPath(g, R, 0, W, wTop + 4, wTop + 12, 24); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fill();
    var pw = 160;
    for (var p = 0; p * pw < W; p++) {
      var x0 = p * pw + 20, x1 = (p + 1) * pw - 20;
      wallPath(g, R, x0, x1, wTop + 36, 742, 3); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fill();
      if (q.model > 0) {
        wallPath(g, R, x0, x1, wTop + 36, wTop + 42, 3); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fill();
        wallPath(g, R, x0, x0 + 5, wTop + 36, 742, 1); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fill();
        wallPath(g, R, x0, x1, 736, 742, 3); g.fillStyle = 'rgba(255,225,180,0.16)'; g.fill();
        wallPath(g, R, x1 - 5, x1, wTop + 36, 742, 1); g.fillStyle = 'rgba(255,225,180,0.1)'; g.fill();
        wallPath(g, R, x0 + 18, x1 - 18, wTop + 58, 720, 3); g.fillStyle = 'rgba(255,225,180,0.05)'; g.fill();
      }
    }
    wallPath(g, R, 0, W, 752, 790, 24); g.fillStyle = '#26160a'; g.fill();
    wallPath(g, R, 0, W, 752, 756, 24); g.fillStyle = 'rgba(255,220,170,0.2)'; g.fill();

    // ---- 地板 ----
    woodFloor(g, q, R, { base: '#4a2e18', seed: 31 });
    if (q.light > 0) {
      g.save(); floorRegion(g, R); g.clip();
      for (var i2 = 0; i2 < 24; i2++) {
        var xa = W * i2 / 24, xb = W * (i2 + 1) / 24;
        K.poly(g, [xa, R.bot(xa) - 2, xb, R.bot(xb) - 2, xb, R.bot(xb) + 44, xa, R.bot(xa) + 44]);
        g.fillStyle = K.lin(g, 0, R.bot(xa), 0, R.bot(xa) + 44, ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)']); g.fill();
      }
      g.restore();
    }

    // ---- 画框（壁炉上方）----
    if (q.model > 0) {
      var fx = 1004, fyy = 168, fw = 168, fh = 196;
      K.contact(g, fx + fw / 2 + 8, fyy + fh + 18, fw * 0.7, 10, 0.35);
      K.rr(g, fx - 16, fyy - 16, fw + 32, fh + 32, 4); g.fillStyle = brassGrad(g, fx - 16, fyy - 16, fx + fw + 16, fyy + fh + 16, true); g.fill();
      g.strokeStyle = 'rgba(40,24,8,0.8)'; g.lineWidth = 2; g.strokeRect(fx - 8, fyy - 8, fw + 16, fh + 16);
      K.vgrad(g, fx, fyy, fw, fh, ['#3a3a4c', '#5a5462', '#2a2430']);
      K.blob(g, fx + 120, fyy + 60, 60, '#8a7a70', 0.35);
      g.fillStyle = '#1a1420'; K.poly(g, [fx, fyy + fh, fx, fyy + 140, fx + 50, fyy + 128, fx + 110, fyy + 136, fx + fw, fyy + 120, fx + fw, fyy + fh]); g.fill();
      g.fillRect(fx + 112, fyy + 54, 18, 84); K.poly(g, [fx + 108, fyy + 56, fx + 134, fyy + 56, fx + 121, fyy + 30]); g.fill();
      flyingCrow(g, fx + 56, fyy + 60, 0.5, '#100c14', 0.5); flyingCrow(g, fx + 80, fyy + 44, 0.34, '#100c14', -0.3);
      if (q.light > 0) { g.fillStyle = K.lin(g, fx, fyy, fx + fw, fyy + fh, ['rgba(255,240,200,0.12)', 'rgba(255,240,200,0)']); g.fillRect(fx, fyy, fw, fh); }
      g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 3; g.strokeRect(fx, fyy, fw, fh);
    }

    // ---- 门（锚点 64-288 x 312-800）+ 插销 ----
    var dx = 86, dy = 336, dw = 168, dh = R.bot(170) - dy + 4;
    g.fillStyle = K.lin(g, dx - 24, 0, dx + dw + 24, 0, [[0, '#5a5048'], [0.07, '#6e6258'], [0.13, '#3a322c'], [0.87, '#3a322c'], [0.93, '#5a4e44'], [1, '#2a2420']]);
    K.rr(g, dx - 24, dy - 28, dw + 48, dh + 28, 6); g.fill();
    if (q.tex > 0) { K.rr(g, dx - 24, dy - 28, dw + 48, dh + 28, 6); g.globalCompositeOperation = 'overlay'; K.fillTex(g, q, 'stone', { c1: '#555', c2: '#aaa', mortar: '#333', rows: 8, cols: 2, seed: 61, irregular: 1 }, 220, dx, dy, 0.5); g.globalCompositeOperation = 'source-over'; }
    g.fillStyle = '#0c0806'; g.fillRect(dx - 4, dy - 4, dw + 8, dh + 4);
    oakDoor(g, q, dx, dy, dw, dh, { arch: 0, straps: [0.08, 0.5, 0.92], planks: 4, strapLen: 0.72 });
    // 坏掉的旧锁板与门环
    g.fillStyle = ironGrad(g, dx + dw - 46, 0, dx + dw - 14, 0); K.rr(g, dx + dw - 46, dy + 300, 32, 64, 4); g.fill();
    g.fillStyle = '#050405'; K.ellipse(g, dx + dw - 30, dy + 324, 4, 6); g.fill(); g.fillRect(dx + dw - 31.5, dy + 326, 3, 12);
    g.strokeStyle = '#4a4a52'; g.lineWidth = 6; g.beginPath(); g.arc(dx + dw - 30, dy + 386, 16, 0.1, PI - 0.1); g.stroke();
    // 插销式门闩（锚点 232-288, 544-576）：闩座在门上，扣座在门框上
    (function bolt() {
      var by = 560;
      if (q.light > 0) { g.fillStyle = 'rgba(0,0,0,0.45)'; K.rr(g, 216, by - 10, 70, 26, 4); g.fill(); }
      g.fillStyle = ironGrad(g, 0, by - 14, 0, by + 14); K.rr(g, 212, by - 14, 46, 28, 3); g.fill();
      rivet(g, q, 218, by - 8, 2.8); rivet(g, q, 218, by + 8, 2.8); rivet(g, q, 252, by - 8, 2.8); rivet(g, q, 252, by + 8, 2.8);
      g.fillStyle = K.lin(g, 0, by - 6, 0, by + 6, ['#a8a8b2', '#f0f0f8', '#6a6a74', '#2a2a30']); g.fillRect(224, by - 5.5, 60, 11);
      g.fillStyle = K.lin(g, 234, 0, 248, 0, ['#5a5a64', '#d8d8e0', '#3a3a42']); K.rr(g, 235, by - 28, 12, 28, 3); g.fill();
      rivet(g, q, 241, by - 28, 6);
      g.fillStyle = ironGrad(g, 0, by - 13, 0, by + 13); K.rr(g, 266, by - 13, 20, 26, 2); g.fill();
      g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(266, by - 6, 4, 12);
      if (q.light >= 2) { g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(226, by - 4.5, 56, 1.6); }
    })();

    // ---- 壁炉（锚点 944-1232, 384-720）----
    var fpx = 944, fpw = 288, mantY = 396, hearthY = R.bot(1088) - 6;
    (function fireplace() {
      var ox0 = 1004, ox1 = 1172, oy = 482;
      K.rr(g, fpx + 8, mantY + 24, fpw - 16, hearthY - mantY - 24, 2);
      K.matFill(g, q, '#6a625a', 'stone', { c1: '#5a544c', c2: '#7e766c', mortar: '#3e3a34', rows: 5, cols: 2, seed: 61, irregular: 1 }, 256, fpx, mantY);
      K.rr(g, fpx + 8, mantY + 24, fpw - 16, hearthY - mantY - 24, 2);
      g.fillStyle = K.lin(g, fpx, 0, fpx + fpw, 0, [[0, 'rgba(255,230,200,0.10)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.3)']]); g.fill();
      for (var s = 0; s < 2; s++) {
        var cx = s ? ox1 + 2 : fpx + 14, cw = ox0 - fpx - 16;
        g.fillStyle = K.lin(g, cx, 0, cx + cw, 0, [[0, '#6a6058'], [0.3, '#8e8276'], [0.7, '#5a524a'], [1, '#2e2a26']]);
        g.fillRect(cx, mantY + 24, cw, hearthY - mantY - 24);
        if (q.model > 0) { g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(cx + cw * 0.35, mantY + 50, 3, hearthY - mantY - 80); g.fillRect(cx + cw * 0.65, mantY + 50, 3, hearthY - mantY - 80); }
      }
      g.beginPath(); g.moveTo(ox0, hearthY); g.lineTo(ox0, oy + 40); g.quadraticCurveTo(ox0, oy, (ox0 + ox1) / 2, oy); g.quadraticCurveTo(ox1, oy, ox1, oy + 40); g.lineTo(ox1, hearthY); g.closePath();
      g.fillStyle = '#0a0605'; g.fill();
      g.save(); g.clip();
      if (q.tex > 0) { g.beginPath(); g.rect(ox0, oy, ox1 - ox0, hearthY - oy); K.fillTex(g, q, 'brick', { c1: '#3a1c14', c2: '#5e2e1e', mortar: '#1a0c08' }, 128, ox0, oy, 0.8); }
      g.fillStyle = K.lin(g, 0, oy, 0, hearthY, ['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.45)', 'rgba(60,20,5,0.15)']); g.fillRect(ox0, oy, ox1 - ox0, hearthY - oy);
      var ey = hearthY - 22;
      g.fillStyle = K.rad(g, 1088, ey, 0, 100, [[0, 'rgba(255,140,40,0.75)'], [0.5, 'rgba(170,55,10,0.35)'], [1, 'rgba(60,10,0,0)']]); g.fillRect(ox0, oy, ox1 - ox0, hearthY - oy);
      function log(x0, y0, x1, y1, r) {
        g.strokeStyle = '#1a0e08'; g.lineWidth = r * 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
        g.strokeStyle = 'rgba(255,110,30,0.6)'; g.lineWidth = r * 0.6; g.beginPath(); g.moveTo(x0 + 4, y0 + r * 0.6); g.lineTo(x1 - 4, y1 + r * 0.6); g.stroke();
      }
      log(1030, ey + 6, 1140, ey - 4, 11); log(1050, ey - 10, 1150, ey + 8, 9);
      g.fillStyle = '#4a4440'; K.ellipse(g, 1088, ey + 16, 78, 9); g.fill();
      var rr = K.rng(91);
      for (var e = 0; e < byM(q, 8, 18, 30); e++) {
        var exx = 1030 + rr() * 116, eyy = ey + 4 + rr() * 12;
        g.fillStyle = rr() < 0.5 ? 'rgba(255,160,60,0.9)' : 'rgba(210,70,20,0.85)'; K.ellipse(g, exx, eyy, 3 + rr() * 5, 2 + rr() * 2); g.fill();
      }
      flameShape(g, 1072, ey - 2, 50, 0.95); flameShape(g, 1100, ey + 2, 36, 0.9); flameShape(g, 1120, ey, 24, 0.85); flameShape(g, 1052, ey + 2, 20, 0.8);
      if (q.model >= 2) {
        g.save(); g.translate(1040, ey + 13); g.rotate(-0.12);
        g.fillStyle = '#1a1210'; g.fillRect(-26, -8, 42, 12); g.fillStyle = 'rgba(130,44,44,0.6)'; g.fillRect(-22, -6, 18, 7);
        g.restore();
      }
      g.strokeStyle = '#141416'; g.lineWidth = 5;
      g.beginPath(); g.moveTo(1024, hearthY); g.lineTo(1024, ey - 14); g.moveTo(1152, hearthY); g.lineTo(1152, ey - 14); g.stroke();
      rivet(g, q, 1024, ey - 16, 6); rivet(g, q, 1152, ey - 16, 6);
      g.restore();
      g.strokeStyle = 'rgba(255,170,90,0.3)'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(ox0, hearthY); g.lineTo(ox0, oy + 40); g.quadraticCurveTo(ox0, oy, (ox0 + ox1) / 2, oy); g.quadraticCurveTo(ox1, oy, ox1, oy + 40); g.lineTo(ox1, hearthY); g.stroke();
      // 台面
      g.fillStyle = K.lin(g, 0, mantY, 0, mantY + 30, ['#a49a8e', '#7a7066', '#4a443e']);
      K.poly(g, [fpx - 10, mantY + 6, fpx + fpw + 10, mantY + 6, fpx + fpw + 4, mantY + 30, fpx - 4, mantY + 30]); g.fill();
      K.poly(g, [fpx - 4, mantY - 8, fpx + fpw + 4, mantY - 8, fpx + fpw + 10, mantY + 6, fpx - 10, mantY + 6]); g.fillStyle = '#b0a698'; g.fill();
      g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(fpx - 4, mantY + 30, fpw + 8, 6);
      // 炉前石板
      K.poly(g, [fpx - 6, hearthY, fpx + fpw + 6, hearthY, fpx + fpw + 26, hearthY + 26, fpx - 26, hearthY + 26]);
      g.fillStyle = K.lin(g, 0, hearthY, 0, hearthY + 26, ['#6e665c', '#4a443c']); g.fill();
      g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(fpx - 26, hearthY + 26, fpw + 52, 5);
      if (q.model > 0) {
        for (var c2 = 0; c2 < 2; c2++) {
          var chx = c2 ? fpx + fpw - 26 : fpx + 26;
          g.fillStyle = brassGrad(g, chx - 14, 0, chx + 14, 0); K.ellipse(g, chx, mantY - 8, 14, 4); g.fill();
          g.fillRect(chx - 3, mantY - 60, 6, 52); K.ellipse(g, chx, mantY - 60, 9, 3); g.fill();
          g.fillStyle = K.lin(g, chx - 4, 0, chx + 4, 0, ['#fff4e0', '#d8ccb4']); g.fillRect(chx - 4, mantY - 92, 8, 32);
        }
        var ccx = 1088;
        g.fillStyle = K.lin(g, ccx - 30, 0, ccx + 30, 0, ['#3a2210', '#6a4628', '#2a160a']);
        K.poly(g, [ccx - 30, mantY - 8, ccx + 30, mantY - 8, ccx + 26, mantY - 58, ccx, mantY - 74, ccx - 26, mantY - 58]); g.fill();
        g.beginPath(); g.arc(ccx, mantY - 40, 15, 0, TAU); g.fillStyle = '#ece4cc'; g.fill(); g.strokeStyle = brassGrad(g, ccx - 15, 0, ccx + 15, 0); g.lineWidth = 3; g.stroke();
        g.strokeStyle = '#1a1410'; g.lineWidth = 2; g.beginPath(); g.moveTo(ccx, mantY - 40); g.lineTo(ccx, mantY - 50); g.moveTo(ccx, mantY - 40); g.lineTo(ccx + 7, mantY - 37); g.stroke();
        if (q.model >= 2) {
          g.fillStyle = 'rgba(70,34,12,0.92)'; K.rr(g, 1150, mantY - 48, 18, 40, 4); g.fill(); g.fillRect(1155, mantY - 64, 8, 18);
          g.fillStyle = 'rgba(255,220,170,0.35)'; g.fillRect(1153, mantY - 44, 3, 30);
          g.fillStyle = '#4a1a20'; g.fillRect(990, mantY - 36, 44, 28); g.fillStyle = '#6a2a30'; g.fillRect(990, mantY - 36, 44, 4);
        }
      }
    })();

    // ---- 窗（锚点 1304-1600, 184-552）----
    var wx0 = 1336, wx1 = 1568, wy0 = 214, wy1 = 528;
    (function windowStudy() {
      // 石砌窗套 + 深窗洞
      g.fillStyle = K.lin(g, wx0 - 34, 0, wx1 + 34, 0, [[0, '#6a6058'], [0.1, '#4a423c'], [0.9, '#4a423c'], [1, '#2a2622']]);
      K.rr(g, wx0 - 34, wy0 - 36, wx1 - wx0 + 68, wy1 - wy0 + 62, 4); g.fill();
      K.poly(g, [wx0 - 20, wy0 - 22, wx0, wy0, wx0, wy1, wx0 - 20, wy1 + 14]); g.fillStyle = '#7a7066'; g.fill();
      K.poly(g, [wx1 + 20, wy0 - 22, wx1, wy0, wx1, wy1, wx1 + 20, wy1 + 14]); g.fillStyle = '#4a423c'; g.fill();
      K.poly(g, [wx0 - 20, wy0 - 22, wx1 + 20, wy0 - 22, wx1, wy0, wx0, wy0]); g.fillStyle = '#34302a'; g.fill();
      // 窗外：阴天、对面本馆屋顶
      g.save(); g.beginPath(); g.rect(wx0, wy0, wx1 - wx0, wy1 - wy0); g.clip();
      K.vgrad(g, wx0, wy0, wx1 - wx0, wy1 - wy0, ['#727a92', '#959bae', '#b0b3be', '#8a8c96']);
      var cr = K.rng(5);
      for (var i = 0; i < byM(q, 4, 10, 16); i++) K.blob(g, wx0 + cr() * (wx1 - wx0), wy0 + cr() * 200, 40 + cr() * 60, cr() < 0.5 ? '#626a82' : '#c4c6ce', 0.5);
      g.fillStyle = '#464656'; K.poly(g, [wx0, wy1, wx0, 446, wx0 + 60, 420, wx0 + 140, 446, wx0 + 160, 430, wx1, 452, wx1, wy1]); g.fill();
      g.fillStyle = '#383846'; g.fillRect(wx0 + 92, 400, 16, 30); g.fillRect(wx0 + 190, 418, 12, 26);
      g.fillStyle = 'rgba(255,200,120,0.7)'; g.fillRect(wx0 + 40, 470, 8, 10); g.fillRect(wx0 + 120, 478, 8, 10);
      g.restore();
      // 窗框
      var mid = (wx0 + wx1) / 2;
      g.strokeStyle = '#2e1c10'; g.lineWidth = 12; g.strokeRect(wx0 + 4, wy0 + 4, wx1 - wx0 - 8, wy1 - wy0 - 8);
      g.lineWidth = 10; g.beginPath(); g.moveTo(mid, wy0); g.lineTo(mid, wy1); g.stroke();
      g.lineWidth = 5;
      for (var rr2 = 1; rr2 < 4; rr2++) { var yy = lerp(wy0, wy1, rr2 / 4); g.beginPath(); g.moveTo(wx0, yy); g.lineTo(wx1, yy); g.stroke(); }
      for (var cc = 0; cc < 2; cc++) { var xx = lerp(wx0, mid, 0.5) + cc * (mid - wx0); g.beginPath(); g.moveTo(xx, wy0); g.lineTo(xx, wy1); g.stroke(); }
      if (q.light > 0) {
        g.strokeStyle = 'rgba(200,210,235,0.18)'; g.lineWidth = 2; g.strokeRect(wx0 + 10, wy0 + 10, wx1 - wx0 - 20, wy1 - wy0 - 20);
        g.save(); g.beginPath(); g.rect(wx0, wy0, wx1 - wx0, wy1 - wy0); g.clip();
        g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(200,210,230,0.10)';
        K.poly(g, [wx0 + 20, wy0, wx0 + 80, wy0, wx0 - 40, wy1, wx0 - 100, wy1]); g.fill();
        K.poly(g, [mid + 40, wy0, mid + 70, wy0, mid - 20, wy1, mid - 50, wy1]); g.fill();
        g.restore();
      }
      // 窗插销（中梃，黄铜）
      g.fillStyle = brassGrad(g, mid - 10, 0, mid + 10, 0); K.rr(g, mid - 9, 358, 18, 38, 3); g.fill();
      g.fillStyle = '#f0d898'; g.fillRect(mid - 2, 364, 4, 26);
      // 窗台
      g.fillStyle = K.lin(g, 0, wy1 + 2, 0, wy1 + 28, ['#a0968a', '#6a6258']);
      K.poly(g, [wx0 - 42, wy1 + 4, wx1 + 42, wy1 + 4, wx1 + 50, wy1 + 26, wx0 - 50, wy1 + 26]); g.fill();
      g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(wx0 - 50, wy1 + 26, wx1 - wx0 + 100, 6);
      // 窗帘
      drapeCurtain(g, q, -1, wx0 - 86, wx0 + 26, wy0 - 52, 430, R.bot(wx0 - 86) - 8);
      drapeCurtain(g, q, 1, wx1 + 86, wx1 - 26, wy0 - 52, 430, R.bot(wx1 + 86) - 8);
      g.fillStyle = brassGrad(g, 0, wy0 - 64, 0, wy0 - 50); g.fillRect(wx0 - 104, wy0 - 62, wx1 - wx0 + 208, 10);
      rivet(g, q, wx0 - 106, wy0 - 57, 9); rivet(g, q, wx1 + 106, wy0 - 57, 9);
      if (q.model > 0) for (var ri = 0; ri < 10; ri++) { var rx = ri < 5 ? wx0 - 84 + ri * 20 : wx1 + 6 + (ri - 5) * 20; g.strokeStyle = brassGrad(g, rx - 6, 0, rx + 6, 0); g.lineWidth = 2.5; g.beginPath(); g.arc(rx, wy0 - 57, 7, 0, TAU); g.stroke(); }
    })();

    // ---- 重锤井的包箱 + 检修小门（锚点 1712-1848, 664-800）----
    (function shaftBox() {
      var bx0 = 1690, bx1 = 1880;
      g.beginPath(); g.moveTo(bx0, R.top(bx0) - 4); g.lineTo(bx1, R.top(bx1) - 6); g.lineTo(bx1, R.bot(bx1) + 6); g.lineTo(bx0, R.bot(bx0) + 4); g.closePath();
      oakFill(g, q, '#4a2e18', false, bx0, 0, ['#3a2010', 0.1]);
      g.beginPath(); g.moveTo(bx0, R.top(bx0) - 4); g.lineTo(bx1, R.top(bx1) - 6); g.lineTo(bx1, R.bot(bx1) + 6); g.lineTo(bx0, R.bot(bx0) + 4); g.closePath();
      g.fillStyle = K.lin(g, bx0, 0, bx1, 0, ['rgba(255,220,180,0.08)', 'rgba(0,0,0,0.3)']); g.fill();
      // 护板分格
      if (q.model > 0) {
        var rows = [180, 500, 640];
        for (var r = 0; r < rows.length; r++) { g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(bx0, rows[r], bx1 - bx0, 4); g.fillStyle = 'rgba(255,220,170,0.12)'; g.fillRect(bx0, rows[r] + 4, bx1 - bx0, 2); }
        g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(bx0 + 94, R.top(bx0 + 94), 3, R.bot(bx0 + 94) - R.top(bx0 + 94));
      }
      // 侧面
      K.poly(g, [bx0 - 28, R.top(bx0) + 2, bx0, R.top(bx0) - 4, bx0, R.bot(bx0) + 4, bx0 - 28, R.bot(bx0) + 18]);
      oakFill(g, q, '#3a2414', false, bx0 - 28, 0, ['#1a0c04', 0.35]);
      g.fillStyle = 'rgba(255,225,190,0.16)'; g.fillRect(bx0 - 2, R.top(bx0), 3, R.bot(bx0) - R.top(bx0));
      // 检修门
      var hx0 = 1738, hy0 = 690, hs = 86;
      g.fillStyle = '#0a0706'; g.fillRect(hx0 - 6, hy0 - 6, hs + 12, hs + 12);
      g.fillStyle = ironGrad(g, hx0 - 10, hy0 - 10, hx0 + hs + 10, hy0 + hs + 10);
      g.fillRect(hx0 - 10, hy0 - 10, hs + 20, 8); g.fillRect(hx0 - 10, hy0 + hs + 2, hs + 20, 8);
      g.fillRect(hx0 - 10, hy0 - 10, 8, hs + 20); g.fillRect(hx0 + hs + 2, hy0 - 10, 8, hs + 20);
      K.rr(g, hx0, hy0, hs - 5, hs, 2); oakFill(g, q, '#5a3a22', false, hx0, hy0, ['#6a4428', 0.12]);
      K.rr(g, hx0, hy0, hs - 5, hs, 2); g.fillStyle = K.lin(g, hx0, hy0, hx0 + hs, hy0 + hs, ['rgba(255,220,180,0.12)', 'rgba(0,0,0,0.35)']); g.fill();
      g.fillStyle = '#030202'; g.fillRect(hx0 + hs - 5, hy0, 6, hs);
      g.fillStyle = ironGrad(g, 0, 0, 30, 0); g.fillRect(hx0 + 2, hy0 + 12, 22, 7); g.fillRect(hx0 + 2, hy0 + hs - 19, 22, 7);
      g.strokeStyle = '#9a9aa2'; g.lineWidth = 3.5; g.beginPath(); g.arc(hx0 + hs - 22, hy0 + hs / 2 + 4, 7, 0, PI); g.stroke();
      rivet(g, q, hx0 + hs - 22, hy0 + hs / 2, 4);
      for (var r3 = 0; r3 < 4; r3++) rivet(g, q, r3 % 2 ? hx0 + hs + 6 : hx0 - 6, r3 < 2 ? hy0 - 6 : hy0 + hs + 6, 3);
      if (q.model >= 2 && q.light >= 2) {
        g.strokeStyle = 'rgba(230,240,255,0.4)'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(hx0 + hs - 2, hy0 + 30); g.quadraticCurveTo(hx0 + hs + 5, hy0 + 44, hx0 + hs - 1, hy0 + 62); g.stroke();
      }
    })();

    // ---- 窗前地毯（尸体区域：锚点 1264-1704, 768-928）----
    (function rug() {
      var X0 = 262, X1 = 566, s0 = 1.04, s1 = 1.36;
      floorPoly(g, R, [X0 - 8, s0 - 0.006, X1 + 8, s0 - 0.006, X1 + 10, s1 + 0.012, X0 - 10, s1 + 0.012]); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fill();
      floorPoly(g, R, [X0, s0, X1, s0, X1, s1, X0, s1]);
      K.matFill(g, q, '#5a1e24', 'carpet', { c1: '#4a141a', c2: '#6a222a', c3: 'rgba(201,162,90,0.25)', seed: 67 }, 128, 0, 0);
      var bands = [[0.05, 'rgba(30,8,12,0.9)', 6], [0.1, 'rgba(201,162,90,0.6)', 3], [0.13, 'rgba(30,44,66,0.9)', 10], [0.21, 'rgba(201,162,90,0.45)', 3]];
      for (var b = 0; b < (q.model > 0 ? bands.length : 2); b++) {
        var inset = bands[b][0], ix = (X1 - X0) * inset, is = (s1 - s0) * inset * 1.1;
        floorPoly(g, R, [X0 + ix, s0 + is, X1 - ix, s0 + is, X1 - ix, s1 - is, X0 + ix, s1 - is]);
        g.strokeStyle = bands[b][1]; g.lineWidth = bands[b][2]; g.stroke();
      }
      var cX = (X0 + X1) / 2, cS = (s0 + s1) / 2;
      g.beginPath();
      for (var a = 0; a <= 16; a++) {
        var ang = a / 16 * TAU, rx = (a % 2 ? 0.55 : 1) * 86, rs = (a % 2 ? 0.55 : 1) * 0.09;
        var p = R.fp(cX + Math.cos(ang) * rx, cS + Math.sin(ang) * rs);
        if (a) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]);
      }
      g.closePath(); g.fillStyle = 'rgba(30,44,66,0.85)'; g.fill(); g.strokeStyle = 'rgba(201,162,90,0.6)'; g.lineWidth = 2.5; g.stroke();
      if (q.model > 0) {
        g.strokeStyle = 'rgba(220,200,160,0.6)'; g.lineWidth = 1.5;
        for (var f = 0; f <= 36; f++) {
          var Xf = lerp(X0, X1, f / 36), A = R.fp(Xf, s1), B = R.fp(Xf, s1 + 0.025);
          g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1] + 2); g.stroke();
          var C = R.fp(Xf, s0), D = R.fp(Xf, s0 - 0.012);
          g.beginPath(); g.moveTo(C[0], C[1]); g.lineTo(D[0], D[1]); g.stroke();
        }
      }
      floorPoly(g, R, [X0, s0, X1, s0, X1, s1, X0, s1]);
      g.fillStyle = K.lin(g, 0, R.fp(0, s0)[1], 0, R.fp(0, s1)[1], ['rgba(0,0,0,0.25)', 'rgba(255,220,200,0.04)']); g.fill();
    })();

    // ---- 书桌（锚点 424-872, 600-800）+ 台灯 + 鸟笼 ----
    (function desk() {
      var fx0 = 430, fx1 = 866, topF = 616, topB = 586, thick = 22, legY = 806;
      var bx0 = fx0 + 18, bx1 = fx1 - 14;
      if (q.light > 0) K.contact(g, (fx0 + fx1) / 2, legY, 280, 24, 0.65);
      function pedestal(x0, x1) {
        K.rr(g, x0, topF + thick, x1 - x0, legY - topF - thick, 2);
        oakFill(g, q, '#5a3820', true, x0, 0, ['#4a2a14', 0.12]);
        K.rr(g, x0, topF + thick, x1 - x0, legY - topF - thick, 2);
        g.fillStyle = K.lin(g, 0, topF, 0, legY, ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)']); g.fill();
        var nd = 3, dh = (legY - topF - thick - 30) / nd;
        for (var i = 0; i < nd; i++) {
          var y0 = topF + thick + 8 + i * dh;
          g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(x0 + 8, y0, x1 - x0 - 16, dh - 8);
          g.fillStyle = K.lin(g, 0, y0, 0, y0 + dh, ['rgba(140,92,52,0.5)', 'rgba(70,40,20,0.5)']); g.fillRect(x0 + 10, y0 + 2, x1 - x0 - 20, dh - 12);
          g.fillStyle = 'rgba(255,225,180,0.2)'; g.fillRect(x0 + 10, y0 + 2, x1 - x0 - 20, 2);
          var hx = (x0 + x1) / 2, hy = y0 + dh / 2 - 4;
          g.strokeStyle = brassGrad(g, hx - 14, 0, hx + 14, 0); g.lineWidth = 4;
          g.beginPath(); g.arc(hx, hy - 2, 12, 0.15 * PI, 0.85 * PI); g.stroke();
          rivet(g, q, hx - 12, hy, 3); rivet(g, q, hx + 12, hy, 3);
        }
        g.fillStyle = '#1e1008'; g.fillRect(x0 - 4, legY - 14, x1 - x0 + 8, 14);
        g.fillStyle = 'rgba(255,220,170,0.14)'; g.fillRect(x0 - 4, legY - 14, x1 - x0 + 8, 2);
      }
      g.fillStyle = '#0c0604'; g.fillRect(fx0 + 140, topF + thick, fx1 - fx0 - 280, legY - topF - thick - 30);
      g.fillStyle = K.lin(g, 0, topF + thick, 0, legY, ['#2a180c', '#0c0604']); g.fillRect(fx0 + 140, topF + thick, fx1 - fx0 - 280, 44);
      pedestal(fx0 + 6, fx0 + 140); pedestal(fx1 - 140, fx1 - 6);
      K.poly(g, [bx0, topB, bx1, topB, fx1, topF, fx0, topF]);
      oakFill(g, q, '#6a4428', true, fx0, topB, ['#7a4a26', 0.1]);
      K.poly(g, [bx0, topB, bx1, topB, fx1, topF, fx0, topF]);
      g.fillStyle = K.lin(g, 0, topB, 0, topF, ['rgba(0,0,0,0.2)', 'rgba(255,220,180,0.1)']); g.fill();
      if (q.model > 0) {
        K.poly(g, [bx0 + 120, topB + 4, bx1 - 160, topB + 4, fx1 - 170, topF - 4, fx0 + 120, topF - 4]);
        g.fillStyle = '#24382c'; g.fill(); g.strokeStyle = 'rgba(201,162,90,0.55)'; g.lineWidth = 1.5; g.stroke();
      }
      g.fillStyle = K.lin(g, 0, topF, 0, topF + thick, ['#8a5e38', '#5a3820', '#2e180a']); g.fillRect(fx0, topF, fx1 - fx0, thick);
      g.fillStyle = 'rgba(255,230,190,0.4)'; g.fillRect(fx0, topF, fx1 - fx0, 2);
      g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(fx0, topF + thick, fx1 - fx0, 4);
      if (q.model > 0) {
        var books = [['#5a1e22', 120, 22], ['#26384a', 110, 18], ['#4a3420', 126, 20]];
        var by = topF - 6;
        for (var b = 0; b < books.length; b++) {
          var bw = books[b][1], bh = books[b][2], bx = 456 + b * 6;
          g.fillStyle = K.lin(g, 0, by - bh, 0, by, [K.shade(books[b][0], 0.2), books[b][0], K.shade(books[b][0], -0.4)]);
          g.fillRect(bx, by - bh, bw, bh);
          g.fillStyle = '#e0d4b8'; g.fillRect(bx + bw - 6, by - bh + 3, 5, bh - 6);
          g.fillStyle = 'rgba(214,178,94,0.7)'; g.fillRect(bx + 10, by - bh + 4, 2, bh - 8);
          by -= bh;
        }
        g.fillStyle = '#e4dac0'; K.poly(g, [700, topB + 8, 760, topB + 6, 770, topB + 22, 704, topB + 26]); g.fill();
        g.fillStyle = '#101018'; K.rr(g, 588, topF - 24, 18, 18, 3); g.fill(); g.fillStyle = '#5a5a7a'; g.fillRect(591, topF - 22, 3, 12);
        if (q.model >= 2) {
          g.strokeStyle = '#e0d8c8'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(598, topF - 24); g.quadraticCurveTo(586, topF - 70, 566, topF - 96); g.stroke();
          g.fillStyle = 'rgba(236,230,216,0.9)'; g.beginPath(); g.moveTo(566, topF - 96); g.quadraticCurveTo(570, topF - 60, 592, topF - 34); g.quadraticCurveTo(580, topF - 70, 566, topF - 96); g.fill();
        }
      }
      // 台灯（锚点 600-680, 472-600）
      var lx = 640, lyB = topF - 10;
      if (q.light > 0) K.contact(g, lx, lyB + 2, 40, 6, 0.5);
      g.fillStyle = brassGrad(g, lx - 30, 0, lx + 30, 0, true); K.ellipse(g, lx, lyB, 30, 8); g.fill();
      g.fillStyle = brassGrad(g, lx - 20, 0, lx + 20, 0); K.ellipse(g, lx, lyB - 6, 20, 6); g.fill();
      g.fillStyle = brassGrad(g, lx - 4, 0, lx + 4, 0); g.fillRect(lx - 3.5, 520, 7, lyB - 526);
      K.ellipse(g, lx, 556, 7, 4); g.fill();
      K.path(g, 'M-40 46 C-38 22 -24 4 0 2 C24 4 38 22 40 46 Z', lx, 474, 1);
      g.fillStyle = K.lin(g, lx - 40, 0, lx + 40, 0, [[0, '#8a4414'], [0.35, '#f0a848'], [0.5, '#ffe0a0'], [0.7, '#d08230'], [1, '#6a320c']]); g.fill();
      g.fillStyle = 'rgba(255,245,210,0.6)'; K.ellipse(g, lx, 520, 40, 5); g.fill();
      g.fillStyle = brassGrad(g, lx - 6, 0, lx + 6, 0); K.ellipse(g, lx, 476, 6, 4); g.fill();
      if (q.light >= 2) { g.fillStyle = 'rgba(255,255,240,0.6)'; K.ellipse(g, lx - 16, 494, 4, 12, 0.4); g.fill(); }
      // 鸟笼（锚点 736-848, 440-584）
      var cx = 792, cyB = topF - 32, cyT = 462;
      if (q.light > 0) K.contact(g, cx, cyB + 22, 66, 8, 0.6);
      g.fillStyle = brassGrad(g, cx - 54, 0, cx + 54, 0, true); K.ellipse(g, cx, cyB + 14, 54, 9); g.fill();
      g.fillRect(cx - 54, cyB + 2, 108, 12);
      g.fillStyle = brassGrad(g, cx - 50, 0, cx + 50, 0); K.ellipse(g, cx, cyB + 2, 50, 8); g.fill();
      g.strokeStyle = brassGrad(g, cx - 48, 0, cx + 48, 0); g.lineWidth = 2.5;
      for (var bb = -3; bb <= 3; bb++) { g.beginPath(); g.moveTo(cx + bb * 14, cyB + 2); g.lineTo(cx + bb * 14, cyB - 12); g.stroke(); }
      g.beginPath();
      g.moveTo(cx - 6, cyT + 8);
      g.bezierCurveTo(cx - 34, cyT + 12, cx - 50, cyT + 50, cx - 50, cyT + 84);
      g.bezierCurveTo(cx - 52, cyB - 30, cx - 58, cyB - 18, cx - 56, cyB - 8);
      g.quadraticCurveTo(cx - 44, cyB - 2, cx - 34, cyB - 10);
      g.quadraticCurveTo(cx - 20, cyB - 2, cx - 6, cyB - 12);
      g.quadraticCurveTo(cx + 10, cyB - 4, cx + 24, cyB - 13);
      g.quadraticCurveTo(cx + 40, cyB - 2, cx + 56, cyB - 9);
      g.bezierCurveTo(cx + 58, cyB - 24, cx + 52, cyB - 40, cx + 50, cyT + 84);
      g.bezierCurveTo(cx + 50, cyT + 50, cx + 34, cyT + 12, cx + 6, cyT + 8);
      g.closePath();
      g.fillStyle = K.lin(g, cx - 56, 0, cx + 56, 0, [[0, '#2a2232'], [0.2, '#3e3448'], [0.45, '#16101c'], [0.8, '#0a080e'], [1, '#141018']]);
      g.fill();
      g.save(); g.clip();
      var folds = byM(q, 2, 4, 6);
      for (var fo = 0; fo < folds; fo++) {
        var fxx = cx - 40 + fo * 80 / (folds - 1 || 1);
        g.fillStyle = K.lin(g, fxx - 8, 0, fxx + 8, 0, ['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0)']);
        K.poly(g, [fxx - 3, cyT + 40, fxx + 3, cyT + 40, fxx + 12, cyB, fxx - 12, cyB]); g.fill();
        g.fillStyle = 'rgba(150,120,170,0.12)'; K.poly(g, [fxx + 6, cyT + 50, fxx + 9, cyT + 50, fxx + 18, cyB - 6, fxx + 13, cyB - 6]); g.fill();
      }
      // 丝绒朝灯一侧的柔和反光
      if (q.light > 0) { g.fillStyle = K.rad(g, cx - 40, cyT + 60, 0, 70, [[0, 'rgba(210,150,100,0.3)'], [1, 'rgba(210,150,100,0)']]); g.fillRect(cx - 70, cyT, 140, 140); }
      g.restore();
      g.strokeStyle = brassGrad(g, cx - 12, 0, cx + 12, 0); g.lineWidth = 4; g.beginPath(); g.arc(cx, cyT - 2, 10, 0, TAU); g.stroke();
      g.fillStyle = brassGrad(g, cx - 8, 0, cx + 8, 0); K.ellipse(g, cx, cyT + 8, 8, 4); g.fill();
    })();

    // ================= 光照 =================
    var L = lightMap(q, '#6a6078');
    // 台灯：桌面与后墙的暖光
    lmLight(L, 640, 560, 520, '#ffd09a', 0.85, 0.8);
    lmLight(L, 640, 640, 360, '#ffb878', 0.4, 0.4);
    // 炉火：低处的暖橙光
    lmLight(L, 1088, 680, 600, '#ffa868', q.light > 0 ? 0.7 : 0.6, 0.65);
    // 窗光：冷色
    lmLight(L, 1452, 400, 640, '#b8c8e8', 0.6, 0.85);
    if (q.light > 0) {
      lmLight(L, 1470, 860, 400, '#a8b8e0', 0.45, 0.32);
      lmLight(L, 860, 120, 360, '#ffc890', 0.25, 0.5);   // 灯罩上口与炉火照到天花
      lmDark(L, 0.15, function (x) { ceilRegion(x, R); });
      lmDark(L, 0.18, function (x) { x.beginPath(); x.rect(0, 0, 50, H); x.rect(W - 50, 0, 50, H); });
      lmShade(L, 0.75, function (x) { x.beginPath(); x.rect(572, 640, 152, 140); });
      lmDark(L, 0.18, function (x) { x.beginPath(); x.rect(0, 940, W, 140); });
    }
    if (q.light >= 2) {
      // 投影：鸟笼投在后墙（台灯在左 → 影子落右侧）、书桌投在地上、窗棂投在地上
      lmShade(L, 0.5, function (x) { K.ellipse(x, 900, 480, 74, 110, 0.12); });
      lmShade(L, 0.45, function (x) { K.poly(x, [440, 808, 860, 808, 980, 900, 340, 900]); });
      lmShade(L, 0.3, function (x) { x.beginPath(); x.moveTo(1420, 790); x.lineTo(1434, 790); x.lineTo(1404, 960); x.lineTo(1388, 960); x.closePath(); x.rect(1290, 860, 400, 9); });
      lmShade(L, 0.25, function (x) { x.beginPath(); x.rect(60, 300, 240, 520); });
    }
    applyLM(g, L);

    // ---- 光的后效 ----
    if (q.light > 0) {
      K.glow(g, 640, 506, 170, '#ffb860', 0.38);
      K.glow(g, 1088, 690, 220, '#ff8a3a', 0.3);
      K.glow(g, 1452, 370, 280, '#9aa8c8', 0.12);
    }
    if (q.light >= 2) {
      softShaft(g, [1346, 240, 1560, 240, 1600, 950, 1180, 950], '#b0c0e0', 0.10, 1450, 260, 1400, 960, 6);
      dust(g, K.rng(77), byM(q, 12, 24, 36), 1330, 300, 330, 560, '#d8e0f8', 0.5);
      dust(g, K.rng(78), 14, 570, 470, 150, 110, '#ffe0b0', 0.55);
      g.save(); g.globalCompositeOperation = 'lighter';
      g.fillStyle = K.rad(g, 640, 600, 0, 130, [[0, 'rgba(255,200,120,0.25)'], [1, 'rgba(255,200,120,0)']]); g.fillRect(510, 580, 260, 40);
      g.fillStyle = 'rgba(255,230,190,0.12)'; g.fillRect(430, 616, 436, 2);
      g.restore();
    }
    finish(g, q, q.light > 0 ? 0.5 : 0.35, 0.5);
  }

  DM.HDBG.def('study', {
    draw: drawStudy,
    lights: [
      { x: 640, y: 504, r: 200, color: '#ffc070', i: 0.65, flicker: 0.05, kind: 'lamp' },
      { x: 1088, y: 680, r: 230, color: '#ff8a3a', i: 0.6, flicker: 0.45, kind: 'fire' },
      { x: 1452, y: 370, r: 260, color: '#a8b8d8', i: 0.35, flicker: 0, kind: 'window' }
    ],
    key: { x: 0.3, color: '#ffbe86', amb: '#2c2838', rim: 0.5 },
    outdoor: false
  });
  /* =================================================================
   * 鸦之塔·一楼 tower_stairs：圆形塔身 + 中柱螺旋石阶（真 3D 投影）
   * ================================================================= */
  var TS = { D: 430, F: 1000, E: 150, HY: 560, RW: 600 };
  function tsP(x, y, z) { var d = z + TS.D; return [960 + TS.F * x / d, TS.HY - TS.F * (y - TS.E) / d, d]; }
  function tsW(th, y) { return tsP(TS.RW * Math.sin(th), y, TS.RW * Math.cos(th)); }
  // 阶梯坐标：phi=0 朝向镜头，增大时向右 → 后 → 左
  function tsS(r, phi, y) { return tsP(r * Math.sin(phi), y, -r * Math.cos(phi)); }
  function quadPath(g, a, b, c, d) { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath(); }
  function shrinkQuad(pts, px) {
    var cx = 0, cy = 0, i; for (i = 0; i < 4; i++) { cx += pts[i][0]; cy += pts[i][1]; } cx /= 4; cy /= 4;
    var out = [];
    for (i = 0; i < 4; i++) { var dx = pts[i][0] - cx, dy = pts[i][1] - cy, l = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.max(0, 1 - px / l); out.push([cx + dx * k, cy + dy * k]); }
    return out;
  }

  function drawTowerStairs(g, q) {
    var rnd = K.rng(4401), TH = 1.45, i, j;
    // ---- 弧形石墙 ----
    var wallTop = 900;
    g.beginPath();
    for (i = 0; i <= 40; i++) { var th = -TH + 2 * TH * i / 40, p = tsW(th, wallTop); if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }
    for (i = 40; i >= 0; i--) { var th2 = -TH + 2 * TH * i / 40, p2 = tsW(th2, 0); g.lineTo(p2[0], p2[1]); }
    g.closePath(); g.fillStyle = '#2a2622'; g.fill();
    var ch = byM(q, 46, 36, 32), courses = Math.ceil(wallTop / ch);
    for (var c = 0; c < courses; c++) {
      var y0 = c * ch, y1 = y0 + ch, th0 = -TH - rnd() * 0.08;
      while (th0 < TH) {
        var dw = (q.model >= 1 ? 0.06 : 0.09) + rnd() * 0.05, th1 = th0 + dw;
        var A = tsW(th0, y1), B = tsW(th1, y1), C = tsW(th1, y0), D = tsW(th0, y0);
        if (Math.max(A[0], B[0]) > -20 && Math.min(A[0], B[0]) < W + 20 && Math.max(A[1], D[1]) > -40) {
          var sq = shrinkQuad([A, B, C, D], q.model >= 2 ? 3 : 2);
          var t = rnd(), damp = clamp(1 - y0 / 160, 0, 1);
          var col = K.mix(K.mix('#5a544c', '#8a8276', t), '#4a5040', damp * 0.5 * rnd());
          quadPath(g, sq[0], sq[1], sq[2], sq[3]); g.fillStyle = col; g.fill();
          if (q.model > 0) {
            // 上缘受光 / 下缘暗
            quadPath(g, sq[0], sq[1], [lerp(sq[1][0], sq[2][0], 0.12), lerp(sq[1][1], sq[2][1], 0.12)], [lerp(sq[0][0], sq[3][0], 0.12), lerp(sq[0][1], sq[3][1], 0.12)]);
            g.fillStyle = 'rgba(255,240,220,0.12)'; g.fill();
            quadPath(g, [lerp(sq[0][0], sq[3][0], 0.8), lerp(sq[0][1], sq[3][1], 0.8)], [lerp(sq[1][0], sq[2][0], 0.8), lerp(sq[1][1], sq[2][1], 0.8)], sq[2], sq[3]);
            g.fillStyle = 'rgba(0,0,0,0.25)'; g.fill();
          }
        }
        th0 = th1;
      }
    }
    stoneGrain(g, q, null, 0.35, 256, 37);

    // 地脚与墙面的 AO
    function wallBand(y0, y1) {
      g.beginPath();
      for (var k = 0; k <= 30; k++) { var p = tsW(-TH + 2 * TH * k / 30, y1); if (k) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }
      for (var k2 = 30; k2 >= 0; k2--) { var p3 = tsW(-TH + 2 * TH * k2 / 30, y0); g.lineTo(p3[0], p3[1]); }
      g.closePath();
    }
    if (q.light > 0) { wallBand(0, 60); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fill(); wallBand(0, 20); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fill(); }

    // ---- 地面：围绕中柱的同心石板 ----
    g.beginPath(); g.moveTo(0, H);
    for (i = 0; i <= 40; i++) { var pf = tsW(-TH + 2 * TH * i / 40, 0); g.lineTo(pf[0], pf[1]); }
    g.lineTo(W, H); g.closePath();
    g.fillStyle = '#4a443e'; g.fill();
    var rings = [70, 150, 235, 320, 410, 505, 600];
    var fr = K.rng(4402);
    for (var rI = 0; rI < rings.length - 1; rI++) {
      var ra = rings[rI], rb = rings[rI + 1], segs = Math.round(ra / 22) + 6, off = fr() * 0.5;
      for (var sI = 0; sI < segs; sI++) {
        var p0 = (sI + off) / segs * TAU, p1 = (sI + 1 + off) / segs * TAU;
        var quad = [], nn = 3, k;
        for (k = 0; k <= nn; k++) { var ph = lerp(p0, p1, k / nn); quad.push(tsS(rb, ph, 0)); }
        for (k = nn; k >= 0; k--) { var ph2 = lerp(p0, p1, k / nn); quad.push(tsS(ra, ph2, 0)); }
        var vis = false; for (k = 0; k < quad.length; k++) if (quad[k][1] < H + 50 && quad[k][2] > 40) vis = true;
        if (!vis) continue;
        g.beginPath(); for (k = 0; k < quad.length; k++) { if (k) g.lineTo(quad[k][0], quad[k][1]); else g.moveTo(quad[k][0], quad[k][1]); } g.closePath();
        g.fillStyle = K.mix('#4e4840', '#7a7266', fr()); g.fill();
        g.strokeStyle = 'rgba(20,16,12,0.5)'; g.lineWidth = 2.5; g.stroke();
        if (q.model > 0) { g.strokeStyle = 'rgba(255,240,220,0.05)'; g.lineWidth = 1.5; g.save(); g.translate(0, 2); g.stroke(); g.restore(); }
      }
    }
    // 远处压暗
    g.fillStyle = K.lin(g, 0, 700, 0, H, ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.25)']); g.fillRect(0, 700, W, H - 700);
    // 积水（潮湿的塔底）：倒映箭窗的冷光
    if (q.model >= 2) {
      g.save(); g.translate(1380, 930); g.scale(1, 0.22);
      g.beginPath(); g.moveTo(-160, 0); g.bezierCurveTo(-150, -90, 40, -110, 120, -60); g.bezierCurveTo(210, -20, 190, 70, 60, 90); g.bezierCurveTo(-60, 110, -170, 70, -160, 0); g.closePath();
      g.restore();
      g.fillStyle = 'rgba(14,14,20,0.55)'; g.fill();
      if (q.light > 0) { g.save(); g.clip(); g.fillStyle = K.lin(g, 1300, 0, 1460, 0, ['rgba(150,165,200,0)', 'rgba(150,165,200,0.25)', 'rgba(150,165,200,0)']); g.fillRect(1220, 900, 340, 60); g.restore(); }
    }

    // ---- 墙上物件（门、椅、壁灯、箭窗、重锤井）----
    // 箭窗（细长射孔）：θ=+0.42，高 300-430
    (function slit() {
      var thc = 0.36, hw = 0.022, y0 = 290, y1 = 440;
      var a = tsW(thc - hw * 3.2, y1 + 30), b = tsW(thc + hw * 3.2, y1 + 30), cc = tsW(thc + hw * 3.2, y0 - 20), d = tsW(thc - hw * 3.2, y0 - 20);
      quadPath(g, a, b, cc, d); g.fillStyle = '#3a3630'; g.fill();
      // 斜面（窗洞内壁受光）
      var a2 = tsW(thc - hw, y1), b2 = tsW(thc + hw, y1), c2 = tsW(thc + hw, y0), d2 = tsW(thc - hw, y0);
      quadPath(g, a, a2, d2, d); g.fillStyle = '#8a8276'; g.fill();
      quadPath(g, b, b2, c2, cc); g.fillStyle = '#4a443c'; g.fill();
      quadPath(g, d, d2, c2, cc); g.fillStyle = '#9a9286'; g.fill();
      quadPath(g, a2, b2, c2, d2); g.fillStyle = K.lin(g, 0, a2[1], 0, d2[1], ['#9aa4bc', '#c4cad6', '#8a92a8']); g.fill();
    })();
    // 门（左侧，θ≈-1.1）
    var doorPts;
    (function door() {
      var t0 = -1.24, t1 = -0.98, top = 230, arch = 52;
      var bl = tsW(t0, 0), br = tsW(t1, 0), tl = tsW(t0, top - arch), tr = tsW(t1, top - arch), tc = tsW((t0 + t1) / 2, top);
      // 门洞外圈石拱
      var ol = tsW(t0 - 0.05, 0), orr = tsW(t1 + 0.05, 0), otl = tsW(t0 - 0.05, top - arch), otr = tsW(t1 + 0.05, top - arch), otc = tsW((t0 + t1) / 2, top + 30);
      g.beginPath(); g.moveTo(ol[0], ol[1]); g.lineTo(otl[0], otl[1]); g.quadraticCurveTo(otl[0], otc[1], otc[0], otc[1]); g.quadraticCurveTo(otr[0], otc[1], otr[0], otr[1]); g.lineTo(orr[0], orr[1]); g.closePath();
      g.fillStyle = K.lin(g, ol[0], 0, orr[0], 0, ['#8a8276', '#6a6258', '#4a443c']); g.fill();
      // 拱石分缝
      if (q.model > 0) {
        g.strokeStyle = 'rgba(20,16,12,0.6)'; g.lineWidth = 2;
        for (var v = 0; v <= 6; v++) {
          var ang = PI + PI * v / 6, ix = (tl[0] + tr[0]) / 2 + Math.cos(ang) * (tr[0] - tl[0]) / 2, iy = tl[1] + Math.sin(ang) * (tl[1] - tc[1]);
          var ox = (otl[0] + otr[0]) / 2 + Math.cos(ang) * (otr[0] - otl[0]) / 2, oy = otl[1] + Math.sin(ang) * (otl[1] - otc[1]);
          g.beginPath(); g.moveTo(ix, iy); g.lineTo(ox, oy); g.stroke();
        }
      }
      // 门洞内侧厚度（右侧可见）
      g.beginPath(); g.moveTo(br[0], br[1]); g.lineTo(tr[0], tr[1]); g.lineTo(tr[0] - 26, tr[1] + 6); g.lineTo(br[0] - 26, br[1] - 6); g.closePath(); g.fillStyle = '#3a342e'; g.fill();
      // 门板
      var x = tl[0], w = tr[0] - tl[0] - 22, y = tc[1] + 8, h = bl[1] - y;
      oakDoor(g, q, x, y, w, h, { arch: tl[1] - tc[1], straps: [0.1, 0.5, 0.88], planks: 5, strapLen: 0.9 });
      // 门环
      g.strokeStyle = '#3a3a40'; g.lineWidth = 7; g.beginPath(); g.arc(x + w - 34, y + h * 0.55, 18, 0.2, PI - 0.2); g.stroke();
      rivet(g, q, x + w - 34, y + h * 0.55 - 4, 8);
      doorPts = [x, y, w, h];
    })();
    // 壁灯（铁笼油灯），θ=-0.68，高 220
    var lamp = tsW(-0.66, 222);
    (function wallLamp() {
      var lx = lamp[0], ly = lamp[1];
      g.strokeStyle = '#1a1a1e'; g.lineWidth = 6;
      g.beginPath(); g.moveTo(lx - 30, ly - 50); g.quadraticCurveTo(lx - 6, ly - 70, lx, ly - 46); g.stroke();
      g.fillStyle = '#1a1a1e'; K.rr(g, lx - 36, ly - 64, 10, 34, 2); g.fill();
      // 灯笼
      K.poly(g, [lx - 18, ly - 40, lx + 18, ly - 40, lx + 22, ly + 16, lx - 22, ly + 16]);
      g.fillStyle = 'rgba(255,214,140,0.95)'; g.fill();
      flameShape(g, lx, ly + 6, 28, 1);
      g.strokeStyle = '#18181c'; g.lineWidth = 4;
      K.poly(g, [lx - 18, ly - 40, lx + 18, ly - 40, lx + 22, ly + 16, lx - 22, ly + 16]); g.stroke();
      g.beginPath(); g.moveTo(lx, ly - 40); g.lineTo(lx, ly + 16); g.stroke();
      K.poly(g, [lx - 24, ly - 40, lx + 24, ly - 40, lx, ly - 62]); g.fillStyle = '#202024'; g.fill();
      K.poly(g, [lx - 24, ly + 16, lx + 24, ly + 16, lx + 14, ly + 26, lx - 14, ly + 26]); g.fill();
    })();
    // 重锤井：θ≈0.96（右侧墙），开口高 150-470，下方检修口
    (function shaft() {
      var t0 = 0.86, t1 = 1.03;
      // 石砌竖井外框（凸出墙面）
      var fA = tsW(t0 - 0.03, 640), fB = tsW(t1 + 0.03, 640), fC = tsW(t1 + 0.03, 0), fD = tsW(t0 - 0.03, 0);
      quadPath(g, fA, fB, fC, fD); g.fillStyle = '#6a6258'; g.fill();
      if (q.model > 0) {
        for (var k = 0; k < 16; k++) { var yA = k * 40, l1 = tsW(t0 - 0.03, yA), r1 = tsW(t1 + 0.03, yA); g.strokeStyle = 'rgba(20,16,12,0.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(l1[0], l1[1]); g.lineTo(r1[0], r1[1]); g.stroke(); }
      }
      // 开口
      var oA = tsW(t0, 470), oB = tsW(t1, 470), oC = tsW(t1, 150), oD = tsW(t0, 150);
      quadPath(g, oA, oB, oC, oD); g.fillStyle = '#060506'; g.fill();
      g.save(); quadPath(g, oA, oB, oC, oD); g.clip();
      g.fillStyle = K.lin(g, oA[0], 0, oB[0], 0, ['rgba(60,56,52,0.5)', 'rgba(0,0,0,0)', 'rgba(30,28,26,0.4)']); g.fillRect(oA[0], oA[1] - 20, oB[0] - oA[0] + 20, oD[1] - oA[1] + 40);
      // 钢索与重锤
      var cx1 = lerp(oA[0], oB[0], 0.32), cx2 = lerp(oA[0], oB[0], 0.7);
      g.strokeStyle = '#7a7a84'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx1, oA[1] - 10); g.lineTo(cx1, oA[1] + 170); g.stroke();
      g.beginPath(); g.moveTo(cx2, oA[1] - 10); g.lineTo(cx2, oA[1] + 70); g.stroke();
      if (q.light >= 1) { g.strokeStyle = 'rgba(220,220,230,0.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx1 - 1, oA[1]); g.lineTo(cx1 - 1, oA[1] + 170); g.stroke(); }
      function weight(x, y, w, h) {
        g.fillStyle = ironGrad(g, x - w / 2, 0, x + w / 2, 0); K.rr(g, x - w / 2, y, w, h, 6); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x - w / 2 + 3, y + 4, w - 6, 4);
        g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x - w / 2, y + h * 0.33, w, 3); g.fillRect(x - w / 2, y + h * 0.66, w, 3);
        g.strokeStyle = '#4a4a52'; g.lineWidth = 4; g.beginPath(); g.arc(x, y - 6, 7, PI, TAU); g.stroke();
      }
      weight(cx1, oA[1] + 170, 46, 96);
      weight(cx2, oA[1] + 70, 38, 74);
      g.restore();
      // 铁栅
      g.strokeStyle = '#1e1e22'; g.lineWidth = 4;
      for (var bI = 1; bI < 5; bI++) { var tb = lerp(t0, t1, bI / 5), b0 = tsW(tb, 470), b1 = tsW(tb, 150); g.beginPath(); g.moveTo(b0[0], b0[1]); g.lineTo(b1[0], b1[1]); g.stroke(); }
      for (var hI = 0; hI < 3; hI++) { var hy = 150 + hI * 160, h0 = tsW(t0, hy), h1 = tsW(t1, hy); g.lineWidth = 6; g.beginPath(); g.moveTo(h0[0], h0[1]); g.lineTo(h1[0], h1[1]); g.stroke(); }
      g.strokeStyle = 'rgba(160,160,170,0.35)'; g.lineWidth = 1.5;
      for (var bJ = 1; bJ < 5; bJ++) { var tb2 = lerp(t0, t1, bJ / 5), e0 = tsW(tb2, 470), e1 = tsW(tb2, 150); g.beginPath(); g.moveTo(e0[0] - 1.5, e0[1]); g.lineTo(e1[0] - 1.5, e1[1]); g.stroke(); }
      // 检修口（井底，铁框木门）：高 8-118
      var hA = tsW(t0 + 0.005, 116), hB = tsW(t1 - 0.005, 116), hC = tsW(t1 - 0.005, 8), hD = tsW(t0 + 0.005, 8);
      quadPath(g, [hA[0] - 8, hA[1] - 8], [hB[0] + 8, hB[1] - 8], [hC[0] + 8, hC[1] + 4], [hD[0] - 8, hD[1] + 4]);
      g.fillStyle = ironGrad(g, hA[0], hA[1], hB[0], hC[1]); g.fill();
      quadPath(g, hA, hB, hC, hD); oakFill(g, q, '#4a3020', false, hA[0], hA[1], ['#3a2010', 0.15]);
      quadPath(g, hA, hB, hC, hD); g.fillStyle = K.lin(g, hA[0], hA[1], hC[0], hC[1], ['rgba(255,220,180,0.08)', 'rgba(0,0,0,0.35)']); g.fill();
      // 合页与把手、铆钉
      var hw = hB[0] - hA[0], hh = hD[1] - hA[1];
      g.fillStyle = ironGrad(g, 0, 0, 40, 0); g.fillRect(hA[0] + 2, hA[1] + hh * 0.18, hw * 0.4, 8); g.fillRect(hA[0] + 2, hA[1] + hh * 0.74, hw * 0.4, 8);
      g.strokeStyle = '#8a8a92'; g.lineWidth = 4; g.beginPath(); g.arc(hB[0] - 22, hA[1] + hh * 0.52, 9, 0, PI); g.stroke();
      rivet(g, q, hB[0] - 22, hA[1] + hh * 0.5, 4.5);
      for (var rv = 0; rv < 4; rv++) rivet(g, q, rv % 2 ? hB[0] + 3 : hA[0] - 3, rv < 2 ? hA[1] - 3 : hD[1] - 1, 3.5);
    })();
    // 椅子（守夜用的旧木椅），在门右侧
    (function chair() {
      var cx = 440, base = 806, s = 1.0;
      if (q.light > 0) K.contact(g, cx + 6, base + 4, 70, 12, 0.6);
      function leg(x0, y0, x1, y1, w, c) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
      var wood = '#5a3a22', dark = '#2e1c10';
      // 后腿 + 靠背
      leg(cx - 30, base - 12, cx - 34, base - 196, 9, dark); leg(cx + 34, base - 14, cx + 30, base - 196, 9, dark);
      for (var sl = 0; sl < 3; sl++) { var yy = base - 186 + sl * 24; g.fillStyle = K.lin(g, 0, yy, 0, yy + 12, ['#7a5434', wood, dark]); g.fillRect(cx - 34, yy, 64, 12); }
      // 座面
      K.poly(g, [cx - 44, base - 96, cx + 40, base - 96, cx + 52, base - 76, cx - 52, base - 76]);
      oakFill(g, q, wood, true, cx, base, ['#7a5030', 0.15]);
      g.fillStyle = 'rgba(255,225,190,0.12)'; K.poly(g, [cx - 44, base - 96, cx + 40, base - 96, cx + 42, base - 92, cx - 46, base - 92]); g.fill();
      g.fillStyle = K.lin(g, 0, base - 76, 0, base - 66, ['#4a2e18', '#1e1008']); g.fillRect(cx - 52, base - 76, 104, 10);
      // 前腿
      leg(cx - 46, base - 68, cx - 48, base, 10, '#4a2e18'); leg(cx + 46, base - 68, cx + 48, base + 2, 10, '#3a2414');
      leg(cx - 44, base - 26, cx + 44, base - 26, 6, '#2a180c');
      g.strokeStyle = 'rgba(255,220,180,0.18)'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 50, base - 66); g.lineTo(cx - 52, base - 2); g.stroke();
      // 椅子上放着提灯（未点）
      if (q.model >= 2) {
        g.fillStyle = '#26262a'; K.rr(g, cx - 10, base - 132, 26, 36, 3); g.fill();
        g.fillStyle = 'rgba(180,170,140,0.4)'; g.fillRect(cx - 6, base - 126, 18, 24);
        g.strokeStyle = '#26262a'; g.lineWidth = 3; g.beginPath(); g.arc(cx + 3, base - 134, 9, PI, TAU); g.stroke();
      }
      void s;
    })();

    // ---- 螺旋石阶（画家算法：远 → 近，中柱夹在中间）----
    var R0 = 24, R1 = 152, RISE = 19, THK = 26, DPH = PI / 8, PH0 = -0.95, NST = 30;
    var steps = [];
    for (i = 0; i < NST; i++) {
      var ph0 = PH0 + i * DPH, ph1 = ph0 + DPH * 1.02, yt = (i + 1) * RISE;
      var pm = (ph0 + ph1) / 2, zc = -((R0 + R1) / 2) * Math.cos(pm);
      steps.push({ i: i, ph0: ph0, ph1: ph1, y: yt, zc: zc, pm: pm });
    }
    function drawStep(s) {
      var ph0 = s.ph0, ph1 = s.ph1, yt = s.y, yb = yt - THK, n = 4, k, pts;
      // 底面（高于视线时可见）+ 锯齿状的端面
      if (yb > TS.E) {
        pts = [];
        for (k = 0; k <= n; k++) pts.push(tsS(R1 + 4, lerp(ph0, ph1, k / n), yb));
        for (k = n; k >= 0; k--) pts.push(tsS(R0, lerp(ph0, ph1, k / n), yb));
        g.beginPath(); for (k = 0; k < pts.length; k++) { if (k) g.lineTo(pts[k][0], pts[k][1]); else g.moveTo(pts[k][0], pts[k][1]); } g.closePath();
        g.fillStyle = '#4a443c'; g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 1.5; g.stroke();
        if (Math.sin(ph1) < 0) {
          var ea = tsS(R0, ph1, yb), eb = tsS(R1 + 4, ph1, yb), ec = tsS(R1 + 4, ph1, yb + RISE), ed = tsS(R0, ph1, yb + RISE);
          quadPath(g, ea, eb, ec, ed); g.fillStyle = '#5e574e'; g.fill();
          g.strokeStyle = 'rgba(255,240,220,0.12)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(ea[0], ea[1]); g.lineTo(eb[0], eb[1]); g.stroke();
        }
      }
      // 踏步顶面（低于视线时可见）
      if (yt < TS.E) {
        pts = [];
        for (k = 0; k <= n; k++) pts.push(tsS(R1 + 4, lerp(ph0, ph1, k / n), yt));
        for (k = n; k >= 0; k--) pts.push(tsS(R0, lerp(ph0, ph1, k / n), yt));
        g.beginPath(); for (k = 0; k < pts.length; k++) { if (k) g.lineTo(pts[k][0], pts[k][1]); else g.moveTo(pts[k][0], pts[k][1]); } g.closePath();
        g.fillStyle = K.mix('#a0988a', '#b4ac9e', (s.i * 37 % 10) / 10); g.fill();
        // 踏面中间被踩出的磨损（更亮更光滑）
        if (q.model > 0) {
          var w0 = tsS(R0 + 50, lerp(ph0, ph1, 0.2), yt), w1 = tsS(R1 - 20, lerp(ph0, ph1, 0.2), yt), w2 = tsS(R1 - 20, lerp(ph0, ph1, 0.8), yt), w3 = tsS(R0 + 50, lerp(ph0, ph1, 0.8), yt);
          quadPath(g, w0, w1, w2, w3); g.fillStyle = 'rgba(255,245,230,0.08)'; g.fill();
        }
        // 前沿（踏步鼻）高光
        var e0 = tsS(R0, ph0, yt), e1 = tsS(R1 + 4, ph0, yt);
        g.strokeStyle = 'rgba(255,240,220,0.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(e0[0], e0[1]); g.lineTo(e1[0], e1[1]); g.stroke();
      }
      // 踢面（ph0 处，朝 phi 减小方向；sin(phi)>0 时可见）
      if (Math.sin(ph0) > 0.02) {
        var a = tsS(R0, ph0, yt), b = tsS(R1 + 4, ph0, yt), c2 = tsS(R1 + 4, ph0, yt - RISE), d = tsS(R0, ph0, yt - RISE);
        quadPath(g, a, b, c2, d); g.fillStyle = K.lin(g, a[0], 0, b[0], 0, ['#6a6258', '#57504a']); g.fill();
        g.fillStyle = 'rgba(0,0,0,0.25)'; quadPath(g, [lerp(a[0], d[0], 0.7), lerp(a[1], d[1], 0.7)], [lerp(b[0], c2[0], 0.7), lerp(b[1], c2[1], 0.7)], c2, d); g.fill();
      }
      // 外侧弧面（朝向镜头时可见）
      if (Math.cos(s.pm) > R1 / TS.D - 0.1) {
        pts = [];
        for (k = 0; k <= n; k++) pts.push(tsS(R1 + 4, lerp(ph0, ph1, k / n), yt));
        for (k = n; k >= 0; k--) pts.push(tsS(R1 + 4, lerp(ph0, ph1, k / n), yb));
        g.beginPath(); for (k = 0; k < pts.length; k++) { if (k) g.lineTo(pts[k][0], pts[k][1]); else g.moveTo(pts[k][0], pts[k][1]); } g.closePath();
        g.fillStyle = K.lin(g, 0, pts[0][1], 0, pts[pts.length - 1][1], ['#7e766a', '#5a544a']); g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 1.5; g.stroke();
      }
      // 栏杆柱 + 扶手（铁柱、橡木扶手）
      var bp0 = tsS(R1 - 6, s.pm, yt), bp1 = tsS(R1 - 6, s.pm, yt + 92);
      g.strokeStyle = '#1a1a1e'; g.lineWidth = Math.max(2, 900 / bp0[2]); g.beginPath(); g.moveTo(bp0[0], bp0[1]); g.lineTo(bp1[0], bp1[1]); g.stroke();
      if (q.light > 0) { g.strokeStyle = 'rgba(200,190,180,0.25)'; g.lineWidth = Math.max(1, 300 / bp0[2]); g.beginPath(); g.moveTo(bp0[0] - 1.5, bp0[1]); g.lineTo(bp1[0] - 1.5, bp1[1]); g.stroke(); }
      var hr = [], m = 4;
      for (k = 0; k <= m; k++) { var phk = lerp(ph0 - DPH * 0.5, ph1 - DPH * 0.5 + 0.01, k / m); hr.push(tsS(R1 - 6, phk, yt + 92 + (phk - s.pm) / DPH * RISE)); }
      g.strokeStyle = '#4a2c16'; g.lineWidth = Math.max(5, 4200 / bp1[2]);
      g.beginPath(); for (k = 0; k <= m; k++) { if (k) g.lineTo(hr[k][0], hr[k][1]); else g.moveTo(hr[k][0], hr[k][1]); } g.stroke();
      g.strokeStyle = 'rgba(255,210,160,0.25)'; g.lineWidth = Math.max(1.2, 900 / bp1[2]);
      g.beginPath(); for (k = 0; k <= m; k++) { if (k) g.lineTo(hr[k][0], hr[k][1] - g.lineWidth); else g.moveTo(hr[k][0], hr[k][1] - 1); } g.stroke();
    }
    var back = [], front = [];
    for (i = 0; i < steps.length; i++) (steps[i].zc > 0 ? back : front).push(steps[i]);
    function byDepth(a, b) { return b.zc - a.zc || a.i - b.i; }
    back.sort(byDepth); front.sort(byDepth);
    for (i = 0; i < back.length; i++) drawStep(back[i]);
    // 中柱
    (function column() {
      var top = tsP(0, 900, 0), bot = tsP(0, 0, 0), rpx = TS.F * R0 / TS.D;
      g.fillStyle = K.lin(g, 960 - rpx, 0, 960 + rpx, 0, [[0, '#4a443c'], [0.25, '#9a9286'], [0.45, '#857c70'], [0.8, '#4a443c'], [1, '#2a2622']]);
      g.fillRect(960 - rpx, top[1], rpx * 2, bot[1] - top[1]);
      if (q.model > 0) for (var k = 0; k < 30; k++) { var yk = tsP(0, k * 32, 0)[1]; g.fillStyle = 'rgba(20,16,12,0.45)'; g.fillRect(960 - rpx, yk, rpx * 2, 2.5); }
      // 柱础
      var bw = rpx * 1.5;
      g.fillStyle = K.lin(g, 960 - bw, 0, 960 + bw, 0, ['#5a544a', '#9a9286', '#3a342e']);
      K.rr(g, 960 - bw, bot[1] - 26, bw * 2, 30, 4); g.fill();
    })();
    for (i = 0; i < front.length; i++) drawStep(front[i]);

    // ================= 光照 =================
    var L = lightMap(q, '#625c70');
    lmLight(L, lamp[0], lamp[1], 680, '#ffc888', 0.95, 0.85);
    lmLight(L, lamp[0] + 40, 800, 520, '#ffb070', 0.45, 0.4);
    var sl = tsW(0.36, 360);
    lmLight(L, sl[0], sl[1], 420, '#b8c4e0', 0.45, 0.9);
    if (q.light > 0) {
      lmLight(L, 1180, 840, 380, '#aab8dc', 0.45, 0.35);     // 箭窗落在地上的冷光
      lmDark(L, 0.5, function (x) { x.beginPath(); x.rect(0, 0, W, 90); });
      lmDark(L, 0.25, function (x) { x.beginPath(); x.rect(0, 90, W, 120); });
      lmLight(L, 1580, 520, 420, '#8a90a8', 0.25, 1);
    }
    if (q.light >= 2) {
      // 中柱挡住壁灯，在右侧墙上投下一道影子
      lmShade(L, 0.55, function (x) { K.poly(x, [990, 0, 1060, 0, 1210, 720, 1080, 720]); });
      // 楼梯下方
      lmShade(L, 0.4, function (x) { K.ellipse(x, 1100, 760, 200, 50, 0); });
    }
    applyLM(g, L);
    // 上方楼梯井的黑暗
    g.fillStyle = K.lin(g, 0, 0, 0, 260, ['rgba(4,3,6,0.85)', 'rgba(4,3,6,0.35)', 'rgba(4,3,6,0)']); g.fillRect(0, 0, W, 260);
    if (q.light > 0) {
      K.glow(g, lamp[0], lamp[1] - 10, 220, '#ffb050', 0.4);
      K.glow(g, sl[0], sl[1], 160, '#a8b8e0', 0.2);
    }
    if (q.light >= 2) {
      softShaft(g, [sl[0] - 14, sl[1] - 60, sl[0] + 14, sl[1] - 60, 1290, 880, 1060, 880], '#b8c8e8', 0.14, sl[0], sl[1], 1170, 900, 6);
      dust(g, K.rng(81), byM(q, 10, 20, 30), sl[0] - 120, sl[1], 260, 420, '#d8e0f8', 0.45);
    }
    finish(g, q, q.light > 0 ? 0.6 : 0.45, 0.42);
  }

  DM.HDBG.def('tower_stairs', {
    draw: drawTowerStairs,
    lights: [
      { x: 522, y: 450, r: 190, color: '#ffc070', i: 0.7, flicker: 0.35, kind: 'lamp' },
      { x: 1090, y: 420, r: 150, color: '#b0c0e0', i: 0.3, flicker: 0, kind: 'window' }
    ],
    key: { x: -0.55, color: '#ffc890', amb: '#2a2834', rim: 0.45 },
    outdoor: false
  });
})(typeof window !== 'undefined' ? window : globalThis);
