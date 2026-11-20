/* DARK MOOD 像素美术 —— 基础绘制工具
 * 所有图像先画进整数像素缓冲（Buf，Uint32 每像素一色，无抗锯齿），
 * 最后一次性 putImageData 到 canvas。不读回 canvas 像素。
 */
(function (root) {
  var DM = root.DM = root.DM || {};
  var P = DM.Pal;
  var X = DM.Px = {};
  var C = P.c;

  /* ---------- 确定性随机数 ---------- */
  X.hash = function (s) {
    var h = 2166136261 >>> 0;
    s = String(s);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  };
  X.rng = function (seed) {
    var a = (typeof seed === 'number' ? seed : X.hash(seed)) >>> 0;
    function r() {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    r.int = function (lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); };
    r.pick = function (arr) { return arr[Math.floor(r() * arr.length)]; };
    r.chance = function (p) { return r() < p; };
    r.range = function (lo, hi) { return lo + r() * (hi - lo); };
    return r;
  };

  /* 4x4 Bayer 有序抖动阈值（0..15） */
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  X.BAYER = BAYER;
  function bayer(x, y) { return BAYER[((y & 3) << 2) | (x & 3)]; }
  X.bayer = bayer;

  /* ---------- 像素缓冲 ---------- */
  function Buf(w, h) {
    this.w = w; this.h = h;
    this.d = new Uint32Array(w * h);
    this.cx0 = 0; this.cy0 = 0; this.cx1 = w; this.cy1 = h;
  }
  X.Buf = Buf;
  var B = Buf.prototype;

  /* 裁剪：clip(x,y,w,h) 与当前裁剪区求交并压栈；clip() 弹出上一层 */
  B.clip = function (x, y, w, h) {
    this._cs = this._cs || [];
    if (x === undefined) {
      var p = this._cs.pop();
      if (p) { this.cx0 = p[0]; this.cy0 = p[1]; this.cx1 = p[2]; this.cy1 = p[3]; }
      else { this.cx0 = 0; this.cy0 = 0; this.cx1 = this.w; this.cy1 = this.h; }
      return this;
    }
    this._cs.push([this.cx0, this.cy0, this.cx1, this.cy1]);
    this.cx0 = Math.max(this.cx0, Math.floor(x)); this.cy0 = Math.max(this.cy0, Math.floor(y));
    this.cx1 = Math.min(this.cx1, Math.floor(x + w)); this.cy1 = Math.min(this.cy1, Math.floor(y + h));
    return this;
  };
  B.get = function (x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.d[y * this.w + x];
  };
  B.px = function (x, y, c) {
    x = Math.floor(x); y = Math.floor(y);
    if (x < this.cx0 || y < this.cy0 || x >= this.cx1 || y >= this.cy1) return;
    this.d[y * this.w + x] = C(c);
  };
  /* 只在已有像素上绘制（用于在已画好的形状内部加细节） */
  B.pxOn = function (x, y, c) {
    x = Math.floor(x); y = Math.floor(y);
    if (x < this.cx0 || y < this.cy0 || x >= this.cx1 || y >= this.cy1) return;
    var i = y * this.w + x;
    if (this.d[i]) this.d[i] = C(c);
  };
  B.rect = function (x, y, w, h, c) {
    c = C(c);
    var x0 = Math.max(this.cx0, Math.floor(x)), y0 = Math.max(this.cy0, Math.floor(y));
    var x1 = Math.min(this.cx1, Math.floor(x + w)), y1 = Math.min(this.cy1, Math.floor(y + h));
    var d = this.d, W = this.w;
    for (var yy = y0; yy < y1; yy++) {
      var o = yy * W;
      for (var xx = x0; xx < x1; xx++) d[o + xx] = c;
    }
    return this;
  };
  B.fill = function (c) { this.d.fill(C(c)); return this; };
  B.hl = function (x, y, w, c) { return this.rect(x, y, w, 1, c); };
  B.vl = function (x, y, h, c) { return this.rect(x, y, 1, h, c); };
  B.frame = function (x, y, w, h, c) {
    this.rect(x, y, w, 1, c); this.rect(x, y + h - 1, w, 1, c);
    this.rect(x, y, 1, h, c); this.rect(x + w - 1, y, 1, h, c);
    return this;
  };
  /* 立体边框：左上亮、右下暗 */
  B.bevel = function (x, y, w, h, hi, lo) {
    this.rect(x, y, w, 1, hi); this.rect(x, y, 1, h, hi);
    this.rect(x, y + h - 1, w, 1, lo); this.rect(x + w - 1, y, 1, h, lo);
    return this;
  };
  B.line = function (x0, y0, x1, y1, c) {
    c = C(c);
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1, err = dx + dy;
    for (var n = 0; n < 4000; n++) {
      this.px(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      var e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return this;
  };
  /* 粗线（方笔刷） */
  B.thick = function (x0, y0, x1, y1, t, c) {
    var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (var i = 0; i <= n; i++) {
      var x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n);
      this.rect(x - (t >> 1), y - (t >> 1), t, t, c);
    }
    return this;
  };
  /* 扫描线多边形填充（偶奇规则，像素中心采样） */
  B.poly = function (pts, c) {
    c = C(c);
    var n = pts.length / 2, ymin = 1e9, ymax = -1e9, i;
    for (i = 0; i < n; i++) { var py = pts[i * 2 + 1]; if (py < ymin) ymin = py; if (py > ymax) ymax = py; }
    var y0 = Math.max(this.cy0, Math.floor(ymin)), y1 = Math.min(this.cy1 - 1, Math.ceil(ymax));
    var xs = [];
    for (var y = y0; y <= y1; y++) {
      var sy = y + 0.5; xs.length = 0;
      for (i = 0; i < n; i++) {
        var ax = pts[i * 2], ay = pts[i * 2 + 1], j = (i + 1) % n, bx = pts[j * 2], by = pts[j * 2 + 1];
        if ((ay <= sy && by > sy) || (by <= sy && ay > sy)) xs.push(ax + (sy - ay) * (bx - ax) / (by - ay));
      }
      xs.sort(function (a, b) { return a - b; });
      for (var k = 0; k + 1 < xs.length; k += 2) {
        var xa = Math.round(xs[k]), xb = Math.round(xs[k + 1]);
        if (xb > xa) this.rect(xa, y, xb - xa, 1, c);
      }
    }
    return this;
  };
  /* 填充椭圆（cx, cy 可为小数；例如 39.5 表示以 39|40 之间为中心） */
  B.ellipse = function (cx, cy, rx, ry, c) {
    c = C(c);
    var y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry);
    for (var y = y0; y <= y1; y++) {
      var t = (y + 0.5 - cy) / ry;
      if (t <= -1 || t >= 1) continue;
      var dx = rx * Math.sqrt(1 - t * t);
      var xa = Math.round(cx - dx), xb = Math.round(cx + dx);
      if (xb > xa) this.rect(xa, y, xb - xa, 1, c);
    }
    return this;
  };
  B.circle = function (cx, cy, r, c) { return this.ellipse(cx, cy, r, r, c); };
  /* 椭圆环 */
  B.ring = function (cx, cy, rx, ry, c, th) {
    th = th || 1;
    c = C(c);
    var x0 = Math.floor(cx - rx - 1), x1 = Math.ceil(cx + rx + 1), y0 = Math.floor(cy - ry - 1), y1 = Math.ceil(cy + ry + 1);
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
      var dx = (x + 0.5 - cx), dy = (y + 0.5 - cy);
      var o = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
      var irx = rx - th, iry = ry - th;
      var inr = irx > 0 && iry > 0 ? (dx * dx) / (irx * irx) + (dy * dy) / (iry * iry) : 2;
      if (o <= 1 && inr > 1) this.px(x, y, c);
    }
    return this;
  };
  /* 有序抖动：t∈[0,1] 时 c2 的比例 */
  B.dither = function (x, y, w, h, c1, c2, t) {
    c1 = c1 === null ? null : C(c1); c2 = C(c2);
    var th = Math.round(t * 16);
    var x0 = Math.max(this.cx0, x | 0), y0 = Math.max(this.cy0, y | 0), x1 = Math.min(this.cx1, (x + w) | 0), y1 = Math.min(this.cy1, (y + h) | 0);
    var d = this.d, W = this.w;
    for (var yy = y0; yy < y1; yy++) for (var xx = x0; xx < x1; xx++) {
      if (BAYER[((yy & 3) << 2) | (xx & 3)] < th) d[yy * W + xx] = c2;
      else if (c1 !== null) d[yy * W + xx] = c1;
    }
    return this;
  };
  /* 抖动渐变：沿 y（或 x）在颜色列表间过渡 */
  B.vgrad = function (x, y, w, h, cols, horiz) {
    var cs = cols.map(C), n = cs.length;
    var x0 = Math.max(this.cx0, x | 0), y0 = Math.max(this.cy0, y | 0), x1 = Math.min(this.cx1, (x + w) | 0), y1 = Math.min(this.cy1, (y + h) | 0);
    var d = this.d, W = this.w, L = horiz ? w : h;
    for (var yy = y0; yy < y1; yy++) for (var xx = x0; xx < x1; xx++) {
      var p = horiz ? xx - x : yy - y;
      var t = L > 1 ? p / (L - 1) * (n - 1) : 0;
      var i = Math.floor(t); if (i >= n - 1) { i = n - 2; }
      if (i < 0) i = 0;
      var f = t - i;
      d[yy * W + xx] = (BAYER[((yy & 3) << 2) | (xx & 3)] + 0.5) / 16 < f ? cs[Math.min(n - 1, i + 1)] : cs[i];
    }
    return this;
  };
  /* 对矩形区域内每个非透明像素应用函数 fn(c, x, y) -> c */
  B.map = function (x, y, w, h, fn) {
    var x0 = Math.max(this.cx0, x | 0), y0 = Math.max(this.cy0, y | 0), x1 = Math.min(this.cx1, (x + w) | 0), y1 = Math.min(this.cy1, (y + h) | 0);
    var d = this.d, W = this.w;
    for (var yy = y0; yy < y1; yy++) for (var xx = x0; xx < x1; xx++) {
      var i = yy * W + xx;
      if (d[i]) d[i] = fn(d[i], xx, yy);
    }
    return this;
  };
  /* 按比例 t 把区域内颜色与 col 混合（带抖动：level 为 0..1 的强度） */
  B.tint = function (x, y, w, h, col, t, dith) {
    var colI = C(col);
    var th = dith === undefined ? 16 : Math.round(dith * 16);
    return this.map(x, y, w, h, function (c, xx, yy) {
      if (BAYER[((yy & 3) << 2) | (xx & 3)] >= th) return c;
      return P.mix(c, colI, t);
    });
  };
  /* 径向光（或阴影）：在半径内按距离分级、抖动地混合颜色 */
  B.glow = function (cx, cy, rx, ry, col, strength, levels) {
    var colI = C(col);
    levels = levels || 4;
    strength = strength === undefined ? 0.5 : strength;
    var x0 = Math.floor(cx - rx), y0 = Math.floor(cy - ry);
    return this.map(x0, y0, Math.ceil(rx * 2) + 1, Math.ceil(ry * 2) + 1, function (c, x, y) {
      var dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, dd = dx * dx + dy * dy;
      if (dd >= 1) return c;
      var a = (1 - Math.sqrt(dd)) * levels + (BAYER[((y & 3) << 2) | (x & 3)] + 0.5) / 16 - 0.5;
      var lv = Math.floor(a);
      if (lv <= 0) return c;
      if (lv > levels) lv = levels;
      return P.mix(c, colI, Math.round(strength * lv / levels * 100) / 100);
    });
  };
  /* ---------- 快速混色（按通道位运算：25%/50%/75%） ---------- */
  function mixQ(c, k, q) {
    // q: 1=25% k, 2=50% k, 3=75% k（小端字节序）
    var a = c & 0xffffff, b = k & 0xffffff, r;
    if (q === 2) r = ((a & 0xfefefe) >>> 1) + ((b & 0xfefefe) >>> 1);
    else if (q === 1) r = ((a & 0xfefefe) >>> 1) + ((a & 0xfcfcfc) >>> 2) + ((b & 0xfcfcfc) >>> 2);
    else r = ((b & 0xfefefe) >>> 1) + ((b & 0xfcfcfc) >>> 2) + ((a & 0xfcfcfc) >>> 2);
    return (0xff000000 | r) >>> 0;
  }
  X.mixQ = function (c, k, q) {
    if (!P.LE) return P.mix(c, k, q / 4);
    return mixQ(c, k, q);
  };
  /* 区域整体与 col 按 q/4 混合；dith<1 时用有序抖动只处理部分像素 */
  B.wash = function (x, y, w, h, col, q, dith) {
    col = C(col);
    var th = dith === undefined ? 16 : Math.round(dith * 16);
    var x0 = Math.max(this.cx0, x | 0), y0 = Math.max(this.cy0, y | 0), x1 = Math.min(this.cx1, (x + w) | 0), y1 = Math.min(this.cy1, (y + h) | 0);
    var d = this.d, W = this.w, f = X.mixQ;
    for (var yy = y0; yy < y1; yy++) for (var xx = x0; xx < x1; xx++) {
      var i = yy * W + xx;
      if (!d[i]) continue;
      if (BAYER[((yy & 3) << 2) | (xx & 3)] >= th) continue;
      d[i] = f(d[i], col, q);
    }
    return this;
  };
  /* 快速径向光：中心 q=maxQ，向外逐级（带抖动）减弱 */
  B.light = function (cx, cy, rx, ry, col, maxQ) {
    col = C(col); maxQ = maxQ || 2;
    var x0 = Math.max(this.cx0, Math.floor(cx - rx)), y0 = Math.max(this.cy0, Math.floor(cy - ry));
    var x1 = Math.min(this.cx1, Math.ceil(cx + rx)), y1 = Math.min(this.cy1, Math.ceil(cy + ry));
    var d = this.d, W = this.w, f = X.mixQ;
    for (var yy = y0; yy < y1; yy++) for (var xx = x0; xx < x1; xx++) {
      var i = yy * W + xx;
      if (!d[i]) continue;
      var dx = (xx + 0.5 - cx) / rx, dy = (yy + 0.5 - cy) / ry, dd = dx * dx + dy * dy;
      if (dd >= 1) continue;
      var a = (1 - Math.sqrt(dd)) * (maxQ + 0.6) + (BAYER[((yy & 3) << 2) | (xx & 3)] + 0.5) / 16 - 0.5;
      var q = Math.floor(a);
      if (q <= 0) continue;
      if (q > maxQ) q = maxQ;
      d[i] = f(d[i], col, q);
    }
    return this;
  };
  /* 暗角：边缘逐渐压暗 */
  B.vignette = function (col, strength, band) {
    col = C(col || '#05040a'); band = band || 70; strength = strength || 2;
    var W = this.w, H = this.h, d = this.d, f = X.mixQ;
    var yTop = Math.ceil(band / 1.5), yBot = H - Math.ceil(band / 1.3);
    for (var y = 0; y < H; y++) {
      var full = y < yTop || y >= yBot;
      var ey = Math.min(y * 1.5, (H - 1 - y) * 1.3);
      for (var x = 0; x < W; x++) {
        if (!full && x === band) { x = W - band - 1; continue; }
        var e = Math.min(x, W - 1 - x, ey);
        if (e >= band) continue;
        var a = (1 - e / band) * (strength + 0.5) + (BAYER[((y & 3) << 2) | (x & 3)] + 0.5) / 16 - 0.6;
        var q = Math.floor(a);
        if (q <= 0) continue;
        var i = y * W + x;
        if (d[i]) d[i] = f(d[i], col, Math.min(3, q));
      }
    }
    return this;
  };
  /* 逐像素图案：fn(x, y) 返回颜色整数（0 = 不画） */
  B.pat = function (x, y, w, h, fn) {
    var x0 = Math.max(this.cx0, x | 0), y0 = Math.max(this.cy0, y | 0), x1 = Math.min(this.cx1, (x + w) | 0), y1 = Math.min(this.cy1, (y + h) | 0);
    var d = this.d, W = this.w;
    for (var yy = y0; yy < y1; yy++) for (var xx = x0; xx < x1; xx++) {
      var c = fn(xx, yy);
      if (c) d[yy * W + xx] = c;
    }
    return this;
  };

  /* 撒点噪声 */
  B.speckle = function (x, y, w, h, c, density, rng, onlyOn) {
    c = C(c);
    var n = Math.round(w * h * density);
    for (var i = 0; i < n; i++) {
      var px = x + Math.floor(rng() * w), py = y + Math.floor(rng() * h);
      if (onlyOn) this.pxOn(px, py, c); else this.px(px, py, c);
    }
    return this;
  };
  /* 把另一个缓冲叠加上来（跳过透明） */
  B.blit = function (src, dx, dy, flip) {
    dx = dx | 0; dy = dy | 0;
    for (var y = 0; y < src.h; y++) {
      var ty = y + dy;
      if (ty < this.cy0 || ty >= this.cy1) continue;
      for (var x = 0; x < src.w; x++) {
        var c = src.d[y * src.w + (flip ? src.w - 1 - x : x)];
        if (!c) continue;
        var tx = x + dx;
        if (tx < this.cx0 || tx >= this.cx1) continue;
        this.d[ty * this.w + tx] = c;
      }
    }
    return this;
  };
  B.flipX = function () {
    var d = this.d, W = this.w;
    for (var y = 0; y < this.h; y++) {
      var o = y * W;
      for (var x = 0; x < (W >> 1); x++) { var t = d[o + x]; d[o + x] = d[o + W - 1 - x]; d[o + W - 1 - x] = t; }
    }
    return this;
  };
  B.clone = function () { var b = new Buf(this.w, this.h); b.d.set(this.d); return b; };
  /* 透明图层的外轮廓：colFn(邻接色) -> 轮廓色；返回新 Buf（只含轮廓像素） */
  B.outlineLayer = function (colFn, diag) {
    var W = this.w, H = this.h, d = this.d, o = new Buf(W, H), od = o.d;
    colFn = colFn || P.outlineOf;
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var i = y * W + x;
      if (d[i]) continue;
      var n = 0;
      if (x > 0 && d[i - 1]) n = d[i - 1];
      else if (x < W - 1 && d[i + 1]) n = d[i + 1];
      else if (y > 0 && d[i - W]) n = d[i - W];
      else if (y < H - 1 && d[i + W]) n = d[i + W];
      else if (diag) {
        if (x > 0 && y > 0 && d[i - W - 1]) n = d[i - W - 1];
        else if (x < W - 1 && y > 0 && d[i - W + 1]) n = d[i - W + 1];
        else if (x > 0 && y < H - 1 && d[i + W - 1]) n = d[i + W - 1];
        else if (x < W - 1 && y < H - 1 && d[i + W + 1]) n = d[i + W + 1];
      }
      if (n) od[i] = typeof colFn === 'function' ? colFn(n) : C(colFn);
    }
    return o;
  };
  /* 原地描边 */
  B.outline = function (colFn, diag) {
    var o = this.outlineLayer(colFn, diag);
    this.blit(o, 0, 0);
    return this;
  };
  /* 区域内透明像素数（调试用） */
  B.toCanvas = function () {
    var cv = document.createElement('canvas');
    cv.width = this.w; cv.height = this.h;
    var ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    var id = ctx.createImageData(this.w, this.h);
    id.data.set(new Uint8ClampedArray(this.d.buffer, this.d.byteOffset, this.d.length * 4));
    ctx.putImageData(id, 0, 0);
    return cv;
  };

  /* ---------- 像素字（数字 3x5，少量汉字 7x7） ---------- */
  var DIG = {
    '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111',
    '4': '101101111001001', '5': '111100111001111', '6': '111100111101111', '7': '111001010010010',
    '8': '111101111101111', '9': '111101111001111', 'I': '111010010010111', 'V': '101101101101010',
    'X': '101101010101101'
  };
  var HAN = {
    '西': ['1111111', '0010100', '1111111', '1010101', '1011001', '1000001', '1111111'],
    '东': ['0001000', '1111111', '0101000', '1111110', '0011000', '0101010', '1001001'],
    '东b': ['0010000', '1111111', '0100100', '1111111', '0001000', '0101010', '1001001'],
    // 大号（铜牌用，9x9 / 9x10）
    '西L': ['111111111', '000101000', '011111110', '010101010', '010101010', '010100110', '011000010', '010000010', '011111110'],
    '东L': ['000100000', '111111111', '001010000', '010010000', '111111110', '000010000', '010010010', '100010001', '000010000', '001110000']
  };
  X.text = function (b, x, y, s, c) {
    s = String(s);
    for (var k = 0; k < s.length; k++) {
      var g = DIG[s[k]];
      if (!g) { x += 2; continue; }
      for (var i = 0; i < 15; i++) if (g[i] === '1') b.px(x + (i % 3), y + Math.floor(i / 3), c);
      x += 4;
    }
  };
  X.han = function (b, x, y, ch, c) {
    var g = HAN[ch];
    if (!g) return;
    for (var r = 0; r < g.length; r++) for (var q = 0; q < g[r].length; q++) if (g[r][q] === '1') b.px(x + q, y + r, c);
  };
  /* 字符画模板：rows 为字符串数组，map 为 字符->颜色 */
  X.stamp = function (b, x, y, rows, map, flip) {
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r], L = row.length;
      for (var q = 0; q < L; q++) {
        var ch = row[flip ? L - 1 - q : q];
        var col = map[ch];
        if (col) b.px(x + q, y + r, col);
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = X;
})(typeof window !== 'undefined' ? window : globalThis);
