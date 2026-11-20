/* DARK MOOD 像素美术 —— 背景（480x270）与宵鸦岛地图
 * 室内：正面单点透视（后墙 + 地板），消失点约 (240,150)，墙脚线 y≈180–196；
 * 每个场景的物件都画在 js/data/locations.js 的锚点矩形内。
 * 不画雨/夜色（引擎叠加）；室外为阴天。
 */
(function (root) {
  var DM = root.DM = root.DM || {};
  var P = DM.Pal, X = DM.Px, C = P.c;
  var BG = DM.ArtBG = {};
  var S = {};                 // 场景函数表
  var G = {};
  for (var k in P.G) G[k] = C(P.G[k]);
  var WD = [G.wd0, G.wd1, G.wd2, G.wd3, G.wd4, G.wd5, G.wd6, G.wd7];
  var ST = [G.st0, G.st1, G.st2, G.st3, G.st4, G.st5, G.st6, G.st7];
  var VPX = 240, VPY = 150;
  var BAY = X.BAYER;
  function bay(x, y) { return BAY[((y & 3) << 2) | (x & 3)]; }
  function hsh(x, y, s) { var h = (x * 374761393 + y * 668265263 + (s || 0) * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
  function mix(a, b, t) { return P.mix(a, b, t); }
  function rmp(hex) { var r = P.ramp(hex); return [r.line, r.sh2, r.sh, r.base, r.hi, r.hi2]; }

  /* ======================= 通用构件 ======================= */

  // 透视地板：木板（沿 x 分条、向消失点汇聚）；逐行预计算透视比例与横缝
  function floorBoards(b, y0, cols, bw, seed, vpy) {
    vpy = vpy || VPY;
    bw = bw || 22;
    var H = b.h, W = b.w, d = b.d, nc = cols.length;
    var prevRow = 0;
    for (var y = y0; y < H; y++) {
      var sc = (y0 - vpy) / (y + 0.5 - vpy), depth = (y - y0) / (H - y0);
      var lg = Math.log((y + 1 - vpy) / (y0 - vpy)) * 9, lgp = Math.log((y - vpy) / (y0 - vpy)) * 9;
      var seamW = 0.05 + depth * 0.02, hiF = 0.92 - depth * 0.05;
      var o = y * W;
      for (var x = 0; x < W; x++) {
        var u = VPX + (x + 0.5 - VPX) * sc;
        var ub = u / bw, k = Math.floor(ub), f = ub - k;
        if (f < seamW) { d[o + x] = cols[0]; continue; }
        var hk = hsh(k, 3, seed) * 3;
        if (Math.floor(lg + hk) !== Math.floor(lgp + hk) && y > y0 + 1) { d[o + x] = cols[1]; continue; }
        var r = hsh(k, 7, seed);
        var idx = r < 0.33 ? 2 : r < 0.66 ? 3 : 2;
        var bb = BAY[((y & 3) << 2) | (x & 3)];
        // 木纹：按木板与纵向位置的整数图案
        var g2 = ((Math.floor(u * 1.7) + k * 13 + (y >> 1)) % 29);
        if (g2 === 0 && bb < 10) idx -= 1;
        if (f > hiF) idx -= 1;
        if (depth < 0.12 && bb < 6) idx -= 1;
        d[o + x] = cols[idx < 1 ? 1 : idx >= nc ? nc - 1 : idx];
      }
    }
    b.hl(0, y0, W, cols[0]);
  }
  // 透视石板地
  function floorStone(b, y0, cols, tw, seed) {
    var H = b.h;
    b.pat(0, y0, b.w, H - y0, function (x, y) {
      var u = VPX + (x + 0.5 - VPX) * (y0 - VPY) / (y + 0.5 - VPY);
      var v = Math.log((y + 0.5 - VPY) / (y0 - VPY)) * 7;
      var row = Math.floor(v), off = (row & 1) * 0.5;
      var k = Math.floor(u / tw + off), fu = u / tw + off - k, fv = v - row;
      if (fu < 0.04 || fv < 0.08) return cols[0];
      var r = hsh(k, row, seed);
      var idx = r < 0.3 ? 1 : r < 0.75 ? 2 : 3;
      if (fv < 0.2 && bay(x, y) < 8) idx = Math.min(cols.length - 1, idx + 1);
      if (fu > 0.94 && bay(x, y) < 8) idx = Math.max(1, idx - 1);
      if (hsh(x, y, seed) < 0.04) idx = Math.max(1, idx - 1);
      return cols[idx];
    });
  }
  // 透视棋盘地砖
  function floorChecker(b, y0, c1, c2, tw) {
    var H = b.h;
    b.pat(0, y0, b.w, H - y0, function (x, y) {
      var u = VPX + (x + 0.5 - VPX) * (y0 - VPY) / (y + 0.5 - VPY);
      var v = Math.log((y + 0.5 - VPY) / (y0 - VPY)) * 6;
      var k = Math.floor(u / tw) + Math.floor(v);
      return (k & 1) ? c1 : c2;
    });
  }
  // 透视地毯（梯形）
  function runner(b, xa, xb, y0, y1, cols, border) {
    var pts = [];
    function xat(x, y) { return VPX + (x - VPX) * (y - VPY) / (y0 - VPY); }
    b.pat(0, y0, b.w, y1 - y0, function (x, y) {
      var l = xat(xa, y + 0.5), r = xat(xb, y + 0.5);
      if (x + 0.5 < l || x + 0.5 > r) return 0;
      var u = (x + 0.5 - l) / (r - l);
      var e = Math.min(u, 1 - u) * (xb - xa);
      if (e < 2) return cols[0];
      if (e < 5) return border || cols[3];
      if (e < 6) return cols[0];
      var vv = Math.log((y + 0.5 - VPY) / (y0 - VPY)) * 10;
      var m = Math.abs(((u * 6) % 1) - 0.5) + Math.abs((vv % 1) - 0.5);
      if (m < 0.18) return cols[3];
      if (m > 0.78 && bay(x, y) < 8) return cols[1];
      return cols[2];
    });
  }
  // 墙纸（花纹）
  function wallpaper(b, x0, y0, w, h, base, motif, style, shadeTop) {
    var c0 = base, c1 = motif;
    b.pat(x0, y0, w, h, function (x, y) {
      var lx = ((x - x0) % 16 + 16) % 16, ly = ((y - y0) % 22 + 22) % 22;
      var on = false;
      if (style === 'stripe') on = lx === 0 || lx === 1 || (lx === 8 && (ly % 4) < 2);
      else {
        var dx = Math.abs(lx - 8), dy = Math.abs(ly - 11);
        on = (dx + dy * 0.75 === 7) || (dx === 0 && dy < 3) || (dy === 0 && dx < 2) || (dx === 1 && dy === 4) ||
          (lx === 0 && ly === 0) || (dx === 2 && dy === 5);
      }
      return on ? c1 : c0;
    });
    if (shadeTop) b.wash(x0, y0, w, shadeTop, G.ink, 1, 0.6);
  }
  // 护墙板（腰线以下的木板）
  function wainscot(b, x0, y0, w, h, cols, pw) {
    pw = pw || 40;
    b.rect(x0, y0, w, h, cols[2]);
    b.hl(x0, y0, w, cols[4]); b.hl(x0, y0 + 1, w, cols[3]); b.hl(x0, y0 + 3, w, cols[1]); b.hl(x0, y0 + 4, w, cols[0]);
    var n = Math.max(1, Math.round(w / pw));
    var ww = w / n;
    for (var i = 0; i < n; i++) {
      var px = Math.round(x0 + i * ww + 5), py = y0 + 9, pw2 = Math.round(ww - 10), ph = h - 18;
      if (pw2 < 6 || ph < 6) continue;
      b.rect(px, py, pw2, ph, cols[3]);
      b.hl(px, py, pw2, cols[1]); b.vl(px, py, ph, cols[1]);
      b.hl(px, py + ph - 1, pw2, cols[4]); b.vl(px + pw2 - 1, py, ph, cols[4]);
      b.rect(px + 3, py + 3, pw2 - 6, ph - 6, cols[2]);
      b.hl(px + 3, py + 3, pw2 - 6, cols[4]);
    }
    b.rect(x0, y0 + h - 7, w, 7, cols[1]); b.hl(x0, y0 + h - 7, w, cols[3]); b.hl(x0, y0 + h - 1, w, cols[0]);
  }
  // 天花板 + 檐口线脚，带透视梁
  function ceiling(b, h, cols, beams) {
    b.vgrad(0, 0, b.w, h, [cols[0], cols[1]]);
    if (beams) for (var i = -8; i <= 8; i++) {
      var xb = VPX + i * 34;
      var xt = VPX + (xb - VPX) * (0 - VPY) / (h - VPY);
      b.thick(xt, 0, xb, h, 3, cols[0]);
      b.line(xt + 2, 0, xb + 2, h, cols[2]);
    }
    // 檐口
    b.rect(0, h, b.w, 6, cols[2]); b.hl(0, h, b.w, cols[3]); b.hl(0, h + 5, b.w, cols[0]);
    for (var x = 2; x < b.w; x += 6) b.rect(x, h + 2, 3, 2, cols[3]);
    b.hl(0, h + 6, b.w, cols[0]);
  }
  // 石墙
  function stoneWall(b, x0, y0, w, h, cols, bw, bh, seed) {
    bw = bw || 26; bh = bh || 13;
    b.pat(x0, y0, w, h, function (x, y) {
      var ry = Math.floor((y - y0) / bh), off = (ry & 1) * (bw >> 1) + (hsh(ry, 1, seed) * 6 | 0);
      var rx = Math.floor((x - x0 + off) / bw);
      var fx = (x - x0 + off) - rx * bw, fy = (y - y0) - ry * bh;
      if (fy === 0 || fx === 0) return cols[0];
      var r = hsh(rx, ry, seed);
      var idx = r < 0.25 ? 1 : r < 0.7 ? 2 : 3;
      if (fy === 1 || fx === 1) idx = Math.min(4, idx + 1);
      if (fy === bh - 1 || fx === bw - 1) idx = Math.max(1, idx - 1);
      var n = hsh(x, y, seed);
      if (n < 0.06) idx = Math.max(1, idx - 1); else if (n > 0.97) idx = Math.min(4, idx + 1);
      return cols[idx];
    });
  }
  // 竖向木板墙（整数木纹图案）
  function plankWall(b, x0, y0, w, h, cols, pw, seed) {
    pw = pw || 14;
    var nc = cols.length;
    b.pat(x0, y0, w, h, function (x, y) {
      var k = Math.floor((x - x0) / pw), f = (x - x0) - k * pw;
      if (f === 0) return cols[0];
      var r = hsh(k, 5, seed), idx = r < 0.35 ? 1 : r < 0.8 ? 2 : 3;
      var g = (y + k * 37 + ((f * 5) >> 2) * 3 + ((y >> 3) & 1) * f) % 31;
      if (g === 0 || g === 1 && (f & 1)) idx = Math.max(1, idx - 1);
      if (f === 1) idx = Math.min(nc - 1, idx + 1);
      if (f === pw - 1) idx = Math.max(1, idx - 1);
      if (((x * 7 + y * 13 + seed) % 97) === 0) idx = 0;
      return cols[idx];
    });
  }
  // 阴天云层
  function sky(b, x0, y0, w, h, seed, cols) {
    cols = cols || [G.sky1, G.sky2, G.sky3, G.sky4, G.sky5];
    b.vgrad(x0, y0, w, h, cols.slice(0, 4));
    var rng = X.rng('sky' + seed);
    b.clip(x0, y0, w, h);
    for (var i = 0; i < 26; i++) {
      var cy = y0 + rng() * h * 0.95, cx = x0 + rng() * w, rx = 30 + rng() * 80, ry = 3 + rng() * 7;
      var t = (cy - y0) / h;
      var ci = Math.min(cols.length - 1, Math.max(0, Math.floor(t * 3.2 + (rng() < 0.5 ? 0 : 1))));
      // 云团：上缘亮、下缘暗
      b.ellipse(cx, cy, rx, ry, cols[ci]);
      b.ellipse(cx + rx * 0.2, cy - ry * 0.4, rx * 0.6, ry * 0.6, cols[Math.min(cols.length - 1, ci + 1)]);
      b.ellipse(cx - rx * 0.1, cy + ry * 0.55, rx * 0.8, ry * 0.35, cols[Math.max(0, ci - 1)]);
    }
    // 抖动过渡带
    for (var j = 0; j < 6; j++) {
      var yy = y0 + Math.round(h * (0.15 + j * 0.14));
      b.dither(x0, yy, w, 2, null, cols[Math.min(cols.length - 1, j % 4 + 1)], 0.25);
    }
    b.clip();
  }
  // 海面：从地平线到 y1
  function sea(b, y0, y1, seed, cols) {
    cols = cols || [G.sea0, G.sea1, G.sea2, G.sea3, G.sea4, G.sea5];
    b.vgrad(0, y0, b.w, y1 - y0, [cols[3], cols[2], cols[1], cols[1], cols[0]]);
    var rng = X.rng('sea' + seed);
    var n = Math.round((y1 - y0) * 7);
    for (var i = 0; i < n; i++) {
      var y = y0 + Math.floor(Math.pow(rng(), 1.4) * (y1 - y0));
      var depth = (y - y0) / (y1 - y0);
      var x = Math.floor(rng() * b.w), len = 2 + Math.floor(rng() * (4 + depth * 14));
      b.hl(x, y, len, depth < 0.3 ? cols[4] : cols[3]);
      if (depth > 0.3 && rng() < 0.5) b.hl(x + 1, y - 1, Math.max(1, len - 3), cols[4]);
      if (depth > 0.5 && rng() < 0.3) b.hl(x + 2, y + 1, Math.max(1, len - 2), cols[0]);
    }
    b.hl(0, y0, b.w, cols[4]);
  }
  // 窗户：view(b) 画窗外景；o.curtain 窗帘色
  function window_(b, x, y, w, h, o) {
    o = o || {};
    var fr = o.frame || rmp('#4a2e20');
    // 外框
    b.rect(x - 4, y - 4, w + 8, h + 8, fr[1]);
    b.rect(x - 3, y - 3, w + 6, h + 6, fr[3]);
    b.hl(x - 3, y - 3, w + 6, fr[4]); b.vl(x - 3, y - 3, h + 6, fr[4]);
    b.hl(x - 3, y + h + 2, w + 6, fr[1]);
    // 窗外
    b.clip(x, y, w, h);
    if (o.view) o.view(b, x, y, w, h); else sky(b, x, y, w, h, o.seed || 1);
    b.clip();
    // 玻璃反光
    b.clip(x, y, w, h);
    for (var i = 0; i < 3; i++) {
      var sx = x + w * (0.15 + i * 0.32);
      b.wash(Math.round(sx), y, 1, h, '#c8d0e8', 1);
    }
    for (var k = -h; k < w; k += 28) b.line(x + k, y + h, x + k + h * 0.6, y, mix(o.glass || G.sky5, '#ffffff', 0.25));
    b.clip();
    // 窗棂
    var mul = o.mullion || fr[2];
    var nx = o.cols || 2, ny = o.rows || 3;
    for (var cx = 1; cx < nx; cx++) { var mxp = Math.round(x + w * cx / nx); b.rect(mxp - 1, y, 3, h, mul); b.vl(mxp - 1, y, h, fr[4]); }
    for (var cy = 1; cy < ny; cy++) { var myp = Math.round(y + h * cy / ny); b.rect(x, myp - 1, w, 2, mul); b.hl(x, myp - 1, w, fr[4]); }
    if (o.arch) {
      // 拱顶
      b.ellipse(x + w / 2, y + 1, w / 2 + 4, 8, fr[1]);
      b.ellipse(x + w / 2, y + 2, w / 2 + 3, 7, fr[3]);
    }
    // 窗台
    b.rect(x - 7, y + h + 4, w + 14, 4, fr[3]); b.hl(x - 7, y + h + 4, w + 14, fr[5]); b.hl(x - 6, y + h + 8, w + 12, fr[0]);
    if (o.curtain) curtains(b, x - 6, y - 10, w + 12, h + 22, o.curtain, o.tie);
  }
  function curtains(b, x, y, w, h, hex, tie) {
    var c = rmp(hex);
    // 帘杆
    b.rect(x - 6, y - 3, w + 12, 3, G.gd1); b.hl(x - 6, y - 3, w + 12, G.gd3);
    b.rect(x - 8, y - 4, 3, 5, G.gd2); b.rect(x + w + 5, y - 4, 3, 5, G.gd2);
    var cw = Math.round(w * 0.24);
    for (var s = 0; s < 2; s++) {
      var x0 = s ? x + w - cw : x;
      for (var yy = y; yy < y + h; yy++) {
        var t = (yy - y) / h;
        // 束起：中部收窄
        var pinch = tie ? Math.max(0, 1 - Math.abs(t - 0.55) * 3) * cw * 0.45 : 0;
        var xa = s ? x0 + Math.round(pinch) : x0, xb = s ? x0 + cw : x0 + cw - Math.round(pinch);
        for (var xx = xa; xx < xb; xx++) {
          var u = (xx - x0) / cw;
          var f = Math.sin(u * Math.PI * 4 + (s ? 1 : 0)) ;
          var idx = f > 0.55 ? 4 : f > -0.2 ? 3 : f > -0.75 ? 2 : 1;
          if (xx === xa || xx === xb - 1) idx = 1;
          b.px(xx, yy, c[idx]);
        }
      }
      if (tie) { var ty = Math.round(y + h * 0.55); b.rect(s ? x0 + cw * 0.3 : x0 + 1, ty, Math.round(cw * 0.6), 3, G.gd2); b.hl(s ? x0 + cw * 0.3 : x0 + 1, ty, Math.round(cw * 0.6), G.gd4); }
      b.hl(x0, y, cw, c[4]);
    }
    // 帘头
    b.rect(x - 4, y, w + 8, 7, c[2]);
    for (var k = 0; k < w + 8; k += 8) { b.ellipse(x - 4 + k + 4, y + 7, 4, 2.5, c[2]); b.px(x - 4 + k + 4, y + 8, c[1]); }
    b.hl(x - 4, y + 1, w + 8, c[4]); b.hl(x - 4, y + 4, w + 8, c[3]);
  }
  // 门
  function door(b, x, y, w, h, o) {
    o = o || {};
    var c = o.cols || rmp('#5a3424');
    var tr = o.trim || rmp('#3a2418');
    b.rect(x - 4, y - 5, w + 8, h + 5, tr[2]);
    b.hl(x - 4, y - 5, w + 8, tr[4]); b.vl(x - 4, y - 5, h + 5, tr[4]); b.vl(x + w + 3, y - 5, h + 5, tr[1]);
    b.rect(x - 6, y - 8, w + 12, 4, tr[3]); b.hl(x - 6, y - 8, w + 12, tr[5]); b.hl(x - 6, y - 5, w + 12, tr[0]);
    b.rect(x, y, w, h, c[3]);
    b.vl(x, y, h, c[4]); b.vl(x + w - 1, y, h, c[1]); b.hl(x, y, w, c[1]);
    // 镶板
    var pn = o.panels || 2, mg = Math.max(4, Math.round(w * 0.14));
    var ph = Math.round((h - mg * (pn + 1)) / pn);
    for (var i = 0; i < pn; i++) {
      var py = y + mg + i * (ph + mg), pw = w - mg * 2;
      if (o.split) {
        var hw = Math.round((pw - mg) / 2);
        panel(b, x + mg, py, hw, ph, c); panel(b, x + mg * 2 + hw, py, pw - hw - mg, ph, c);
      } else panel(b, x + mg, py, pw, ph, c);
    }
    // 门把与锁孔
    var kx = o.knobLeft ? x + 6 : x + w - 8, ky = y + Math.round(h * 0.52);
    b.rect(kx, ky, 3, 3, G.gd2); b.px(kx, ky, G.gd4); b.px(kx + 2, ky + 2, G.gd0);
    b.rect(kx - 1, ky - 3, 5, 12, mix(c[2], G.gd1, 0.4)); b.rect(kx, ky, 3, 3, G.gd3); b.px(kx, ky, G.gd5);
    b.px(kx + 1, ky + 6, G.ink); b.px(kx + 1, ky + 7, G.ink);
    // 门牌
    if (o.plate) {
      var px = x + Math.round(w / 2) - 5, py2 = y + mg - 2;
      b.rect(px, py2 - 8, 11, 8, G.gd2); b.hl(px, py2 - 8, 11, G.gd4); b.hl(px, py2 - 1, 11, G.gd0);
    }
    // 门下阴影
    b.hl(x, y + h - 1, w, c[0]);
  }
  function panel(b, x, y, w, h, c) {
    b.rect(x, y, w, h, c[2]);
    b.hl(x, y, w, c[1]); b.vl(x, y, h, c[1]);
    b.hl(x, y + h - 1, w, c[4]); b.vl(x + w - 1, y, h, c[4]);
    b.rect(x + 2, y + 2, w - 4, h - 4, c[3]);
    b.hl(x + 2, y + 2, w - 4, c[4]);
  }
  // 画框（金边）
  function picFrame(b, x, y, w, h, inner) {
    b.rect(x, y, w, h, G.gd1);
    b.rect(x + 1, y + 1, w - 2, h - 2, G.gd2);
    b.hl(x + 1, y + 1, w - 2, G.gd4); b.vl(x + 1, y + 1, h - 2, G.gd4);
    b.hl(x + 2, y + h - 2, w - 3, G.gd0); b.vl(x + w - 2, y + 2, h - 3, G.gd0);
    for (var i = x + 3; i < x + w - 3; i += 3) { b.px(i, y + 2, G.gd5); b.px(i + 1, y + h - 3, G.gd3); }
    b.rect(x + 4, y + 4, w - 8, h - 8, G.ink);
    b.clip(x + 5, y + 5, w - 10, h - 10);
    if (inner) inner(b, x + 5, y + 5, w - 10, h - 10);
    b.clip();
  }
  // 乌鸦剪影（朝右，大小 s）
  function crow(b, x, y, s, col, wing) {
    col = col || G.ink;
    var k = s / 10;
    b.ellipse(x, y, 5 * k, 3 * k, col);                      // 身体
    b.ellipse(x + 5 * k, y - 2.5 * k, 2.4 * k, 2.2 * k, col); // 头
    b.poly([x + 7 * k, y - 3 * k, x + 10.5 * k, y - 2 * k, x + 7 * k, y - 1.2 * k], col); // 喙
    b.poly([x - 4 * k, y - 1 * k, x - 10 * k, y + 1.5 * k, x - 9 * k, y + 3 * k, x - 3 * k, y + 2 * k], col); // 尾
    if (wing === 'up') b.poly([x - 2 * k, y - 1 * k, x + 2 * k, y - 1 * k, x - 4 * k, y - 9 * k], col);
    else if (wing === 'spread') { b.poly([x - 1 * k, y - 1 * k, x + 2 * k, y, x - 7 * k, y - 8 * k, x - 9 * k, y - 6 * k], col); b.poly([x, y + 1 * k, x + 3 * k, y, x - 3 * k, y + 9 * k], col); }
    b.thick(x + 0.5 * k, y + 2.5 * k, x + 0.5 * k, y + 5 * k, Math.max(1, Math.round(k * 0.7)), col);
  }
  // 飞行的乌鸦（小）
  function flyingCrow(b, x, y, s, col, ph) {
    col = col || G.ink;
    var up = ph ? -1 : 1;
    b.hl(x - 1, y, 3, col);
    for (var i = 1; i <= s; i++) { b.px(x - 1 - i, y - Math.round(i * 0.6 * up), col); b.px(x + 1 + i, y - Math.round(i * 0.6 * up), col); if (i < s - 1) { b.px(x - 1 - i, y - Math.round(i * 0.6 * up) + 1, col); b.px(x + 1 + i, y - Math.round(i * 0.6 * up) + 1, col); } }
    b.px(x + 2, y - 1, col);
  }
  // 蜡烛（含火焰与光晕）
  function candle(b, x, y, h, glow) {
    b.rect(x, y, 2, h, '#e8e0d0'); b.vl(x + 1, y, h, '#b8ac98'); b.px(x, y, '#fff8e8');
    b.px(x, y - 1, G.cl2); b.px(x + 1, y - 1, G.cl3); b.px(x, y - 2, G.cl1); b.px(x, y - 3, G.cl0); b.px(x + 1, y - 2, G.cl2);
    if (glow !== false) b.light(x + 1, y - 2, glow || 14, glow || 14, G.cl1, 2);
    b.px(x, y - 1, G.cl1); b.px(x, y - 2, G.cl0); b.px(x, y - 3, '#ffffff');
  }
  // 壁灯
  function sconce(b, x, y) {
    b.rect(x - 1, y, 3, 8, G.gd1); b.rect(x - 4, y + 7, 9, 2, G.gd2); b.hl(x - 4, y + 7, 9, G.gd4);
    candle(b, x - 3, y + 2, 5, 20); candle(b, x + 2, y + 2, 5, false);
  }
  // 书架
  function bookshelf(b, x, y, w, h, seed, o) {
    o = o || {};
    var wd = o.cols || rmp('#4a2c1c');
    var rng = X.rng('books' + seed);
    b.rect(x, y, w, h, wd[2]);
    b.rect(x - 2, y - 4, w + 4, 5, wd[3]); b.hl(x - 2, y - 4, w + 4, wd[5]); b.hl(x - 2, y, w + 4, wd[0]);
    var shelfH = o.shelfH || 26, n = Math.floor((h - 6) / shelfH);
    var bookCols = o.books || ['#6a1a26', '#2a3a5a', '#3a4a2a', '#5a4a2a', '#4a2a4a', '#7a5a30', '#2a2a30', '#8a3020', '#3a5a5a'];
    for (var s = 0; s < n; s++) {
      var sy = y + 3 + s * shelfH, sb = sy + shelfH - 4;
      b.rect(x + 3, sy, w - 6, shelfH - 4, wd[0]);
      var bx = x + 4;
      while (bx < x + w - 5) {
        if (rng() < 0.07) { bx += 3 + Math.floor(rng() * 5); continue; }
        var bw = 2 + Math.floor(rng() * 3), bh = shelfH - 8 - Math.floor(rng() * 7);
        if (bx + bw > x + w - 4) break;
        var bc = rmp(bookCols[Math.floor(rng() * bookCols.length)]);
        var lean = rng() < 0.06;
        if (lean && bx + 6 < x + w - 4) {
          b.thick(bx, sb - 1, bx + 4, sb - bh + 2, 2, bc[3]); bx += 6; continue;
        }
        b.rect(bx, sb - bh, bw, bh, bc[3]);
        b.vl(bx, sb - bh, bh, bc[4]); if (bw > 2) b.vl(bx + bw - 1, sb - bh, bh, bc[2]);
        if (rng() < 0.6) b.hl(bx, sb - bh + 2 + Math.floor(rng() * 3), bw, G.gd2);
        if (rng() < 0.3) b.hl(bx, sb - 4, bw, G.gd2);
        bx += bw;
      }
      // 层板
      b.rect(x + 2, sb, w - 4, 3, wd[3]); b.hl(x + 2, sb, w - 4, wd[5]); b.hl(x + 2, sb + 2, w - 4, wd[1]);
    }
    b.vl(x, y, h, wd[4]); b.vl(x + 1, y, h, wd[3]); b.vl(x + w - 1, y, h, wd[0]); b.vl(x + w - 2, y, h, wd[1]);
    b.rect(x - 1, y + h - 4, w + 2, 4, wd[3]); b.hl(x - 1, y + h - 4, w + 2, wd[4]); b.hl(x - 1, y + h - 1, w + 2, wd[0]);
  }
  // 地上的接触阴影
  function floorShadow(b, x, y, w, h) { b.wash(x, y, w, h, G.ink, 2, 0.9); b.wash(x - 3, y + 1, w + 6, Math.max(1, h - 2), G.ink, 1, 0.6); }
  // 地毯（透视矩形）
  function rug(b, x0, x1, y0, y1, hex, borderHex) {
    var c = rmp(hex), bd = borderHex ? C(borderHex) : c[4];
    runner(b, x0, x1, y0, y1, c, bd);
  }
  function tableTop(b, x, y, w, d, c) {
    // 桌面（略俯视）+ 前沿
    b.rect(x, y, w, d, c[3]); b.hl(x, y, w, c[4]); b.hl(x, y + d - 1, w, c[2]);
  }

  /* ======================= 室内通用房间 ======================= */
  function room(b, o) {
    var fy = o.floorY || 186, ch = o.ceil === undefined ? 18 : o.ceil;
    var wall = o.wall || ['#2a2033', '#33283f'];
    // 墙
    if (o.wallStyle === 'stone') stoneWall(b, 0, ch, b.w, fy - ch, o.stoneCols || [G.st0, G.st1, G.st2, G.st3, G.st4], 26, 13, o.seed || 1);
    else if (o.wallStyle === 'planks') plankWall(b, 0, ch, b.w, fy - ch, o.plankCols || [WD[0], WD[2], WD[3], WD[4], WD[5]], 14, o.seed || 1);
    else if (o.wallStyle === 'plaster') {
      b.vgrad(0, ch, b.w, fy - ch, o.plasterCols || ['#4a4552', '#5a5462', '#544e5c']);
      var rng = X.rng('pl' + o.seed);
      for (var i = 0; i < 40; i++) b.ellipse(rng() * 480, ch + rng() * (fy - ch), 6 + rng() * 20, 3 + rng() * 10, mix(C(o.plasterCols ? o.plasterCols[1] : '#5a5462'), '#2a2430', 0.15 + rng() * 0.1));
      b.speckle(0, ch, 480, fy - ch, mix(C(o.plasterCols ? o.plasterCols[1] : '#5a5462'), '#000000', 0.25), 0.01, rng);
    }
    else wallpaper(b, 0, ch, b.w, fy - ch, C(wall[0]), C(wall[1]), o.wallStyle, 0);
    if (o.wainscot !== false && o.wallStyle !== 'stone') wainscot(b, 0, fy - (o.wainH || 52), b.w, o.wainH || 52, o.wainCols || rmp('#3e2618'), o.panelW || 44);
    else { b.rect(0, fy - 5, b.w, 5, ST[1]); b.hl(0, fy - 5, b.w, ST[3]); }
    // 天花板
    if (ch > 0) ceiling(b, ch, o.ceilCols || [WD[0], WD[1], WD[3], WD[4]], o.beams !== false);
    // 地板
    if (o.floor === 'stone') floorStone(b, fy, o.floorCols || [G.st0, G.st1, G.st2, G.st3, G.st4], 30, o.seed || 1);
    else if (o.floor === 'checker') floorChecker(b, fy, C(o.floorCols[0]), C(o.floorCols[1]), 30);
    else floorBoards(b, fy, o.floorCols || [WD[0], WD[1], WD[2], WD[3], WD[4]], 22, o.seed || 1);
    // 墙脚阴影
    b.wash(0, fy - 3, b.w, 3, G.ink, 1);
    b.wash(0, fy + 1, b.w, 4, G.ink, 1, 0.5);
    return fy;
  }
  function finish(b, strength) { b.vignette('#05040a', strength === undefined ? 2 : strength, 90); }

  /* ======================= 场景 ======================= */
  S.black = function (b) { b.fill('#000000'); };
  S.white = function (b) { b.fill('#ffffff'); };
  S.__unknown = function (b) {
    b.vgrad(0, 0, 480, 186, ['#24212c', '#2e2a36', '#26232e']);
    floorStone(b, 186, [G.st0, G.st1, G.st2, G.st2, G.st3], 30, 3);
    finish(b);
  };

  /* ---------- 大厅 ---------- */
  S.hall = function (b) {
    var fy = room(b, { floorY: 194, ceil: 0, wall: ['#2c1e2a', '#382636'], wainH: 60, floor: 'checker', floorCols: ['#1a1620', '#3a3240'], seed: 11 });
    // 高墙上部：拱形壁龛与立柱
    for (var i = 0; i < 6; i++) {
      var px = 8 + i * 94;
      b.rect(px, 0, 10, fy - 60, '#3a2e3a'); b.vl(px, 0, fy - 60, '#5a4858'); b.vl(px + 9, 0, fy - 60, '#1e1622');
      b.rect(px - 2, fy - 64, 14, 6, '#4a3a48'); b.hl(px - 2, fy - 64, 14, '#6a5868');
    }
    // 楼梯：中央，向上收窄到平台
    var sx0 = 176, sx1 = 304, top = 64, bot = fy;
    b.rect(150, 40, 180, 30, '#2a1e1a');               // 平台后方阴影
    b.rect(120, top - 4, 240, 8, WD[3]); b.hl(120, top - 4, 240, WD[5]); b.hl(120, top + 3, 240, WD[1]);  // 平台栏
    for (var bx = 124; bx < 356; bx += 7) { b.rect(bx, top - 22, 2, 18, WD[4]); b.px(bx, top - 22, WD[6]); }
    b.rect(120, top - 25, 240, 4, WD[3]); b.hl(120, top - 25, 240, WD[6]);
    var steps = 14;
    for (var s = 0; s < steps; s++) {
      var t0 = s / steps, t1 = (s + 1) / steps;
      var ya = Math.round(bot - (bot - top) * t1), yb = Math.round(bot - (bot - top) * t0);
      var inset = Math.round(16 * t1);
      var xa = sx0 + inset - 18 + 18 * (1 - t1) * 0 , xb = sx1 - inset;
      b.rect(sx0 + inset, ya, (sx1 - inset) - (sx0 + inset), yb - ya, s % 2 ? G.red2 : G.red1);
      b.hl(sx0 + inset, ya, (sx1 - inset) - (sx0 + inset), G.red3);
      b.hl(sx0 + inset, yb - 1, (sx1 - inset) - (sx0 + inset), G.red0);
      // 台阶边缘石
      b.rect(sx0 + inset - 6, ya, 6, yb - ya, WD[2]); b.rect(sx1 - inset, ya, 6, yb - ya, WD[2]);
      b.hl(sx0 + inset - 6, ya, 6, WD[4]); b.hl(sx1 - inset, ya, 6, WD[4]);
    }
    // 扶手
    b.thick(sx0 - 8, bot - 30, sx0 + 10, top - 2, 3, WD[3]); b.line(sx0 - 8, bot - 31, sx0 + 10, top - 3, WD[6]);
    b.thick(sx1 + 8, bot - 30, sx1 - 10, top - 2, 3, WD[3]); b.line(sx1 + 8, bot - 31, sx1 - 10, top - 3, WD[6]);
    for (var k = 0; k < 9; k++) {
      var t = k / 8;
      var lx = Math.round(sx0 - 6 + 16 * t), ly = Math.round(bot - 30 - (bot - 30 - top) * t);
      b.rect(lx, ly, 2, Math.round(26 - t * 6), WD[4]);
      var rx = Math.round(sx1 + 6 - 16 * t);
      b.rect(rx - 1, ly, 2, Math.round(26 - t * 6), WD[4]);
    }
    b.rect(sx0 - 12, bot - 40, 8, 40, WD[3]); b.rect(sx0 - 13, bot - 44, 10, 5, WD[5]); b.ellipse(sx0 - 8, bot - 47, 4, 3, G.gd2);
    b.rect(sx1 + 4, bot - 40, 8, 40, WD[3]); b.rect(sx1 + 3, bot - 44, 10, 5, WD[5]); b.ellipse(sx1 + 8, bot - 47, 4, 3, G.gd2);
    // 楼梯平台上方的大窗
    window_(b, 206, 6, 68, 34, { cols: 3, rows: 2, seed: 4, frame: rmp('#3a2418') });
    // 东西两扇门
    door(b, 22, 100, 48, fy - 100, { cols: rmp('#4a2a1c'), panels: 3, split: 1 });
    door(b, 410, 100, 48, fy - 100, { cols: rmp('#4a2a1c'), panels: 3, split: 1, knobLeft: 1 });
    // 乌鸦铜像（台座 + 铜像）
    var cx = 118;
    b.rect(cx - 16, 160, 32, fy - 160, '#3a3440'); b.hl(cx - 16, 160, 32, '#6a6270'); b.vl(cx + 15, 160, fy - 160, '#1e1a24');
    b.rect(cx - 19, 156, 38, 5, '#4a4452'); b.hl(cx - 19, 156, 38, '#7a7282');
    var bronze = rmp('#6a5030');
    crow(b, cx - 2, 138, 26, bronze[2], 'up');
    crow(b, cx - 2, 137, 24, bronze[3], 'up');
    b.line(cx - 10, 133, cx + 4, 131, bronze[4]); b.px(cx + 12, 131, '#ff4050');
    b.rect(cx - 6, 150, 14, 6, bronze[1]);
    // 铜烛台
    b.rect(150, 176, 10, 3, G.gd1); b.rect(154, 160, 3, 17, G.gd2); b.vl(154, 160, 17, G.gd4); b.rect(150, 158, 11, 2, G.gd3);
    candle(b, 154, 152, 6, 22);
    // 座钟
    grandClock(b, 332, 80, 30, fy - 80);
    // 吊灯
    chandelier(b, 240, 0, 60);
    // 红地毯
    runner(b, 186, 294, fy, 270, [G.red0, G.red1, G.red2, G.gd2], G.gd2);
    // 光：吊灯光晕 + 壁灯
    b.light(240, 30, 120, 70, G.cl1, 1);
    sconce(b, 90, 88); sconce(b, 390, 88);
    floorShadow(b, 330, fy - 2, 34, 3);
    // 小沙发（座钟与东门前；剧本把宇佐见的工具包放在 (392,222)）
    var so = rmp('#5a1a2a');
    b.rect(364, 202, 72, 13, so[3]); b.ellipse(400, 202, 36, 4, so[3]); b.hl(366, 199, 68, so[4]);
    for (var bt = 0; bt < 4; bt++) { b.px(374 + bt * 17, 207, so[1]); b.px(375 + bt * 17, 207, so[4]); }
    b.rect(362, 214, 76, 9, so[4]); b.hl(362, 214, 76, so[5]); b.hl(362, 222, 76, so[2]); b.vl(400, 215, 7, so[2]);
    b.rect(362, 223, 76, 6, so[2]); b.hl(362, 228, 76, so[1]);
    b.rect(356, 206, 9, 22, so[3]); b.ellipse(360, 206, 5, 3, so[4]); b.vl(356, 206, 22, so[4]);
    b.rect(435, 206, 9, 22, so[2]); b.ellipse(439, 206, 5, 3, so[3]); b.vl(443, 206, 22, so[1]);
    b.rect(360, 229, 3, 5, WD[2]); b.rect(437, 229, 3, 5, WD[2]); b.rect(398, 229, 3, 4, WD[1]);
    b.px(360, 233, G.gd2); b.px(437, 233, G.gd2);
    floorShadow(b, 354, 233, 92, 3);
    finish(b);
  };
  function grandClock(b, x, y, w, h) {
    var c = rmp('#4a2818');
    b.rect(x, y + 10, w, h - 10, c[3]);
    b.ellipse(x + w / 2, y + 12, w / 2 + 2, 12, c[3]);
    b.clip(0, 0, 480, y + 12); b.ellipse(x + w / 2, y + 12, w / 2 + 2, 12, c[3]); b.ellipse(x + w / 2, y + 12, w / 2, 10, c[4]); b.clip();
    b.vl(x, y + 10, h - 10, c[4]); b.vl(x + w - 1, y + 10, h - 10, c[1]);
    // 钟面
    var fx = x + w / 2, fyy = y + 18;
    b.circle(fx, fyy, 11, G.gd1); b.circle(fx, fyy, 10, '#e8dcc0'); b.circle(fx, fyy, 8.5, '#f4ead4');
    for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; b.px(Math.round(fx - 0.5 + Math.sin(a) * 8), Math.round(fyy - 0.5 - Math.cos(a) * 8), G.ink); }
    b.line(fx - 0.5, fyy - 0.5, fx - 0.5, fyy - 6, G.ink); b.line(fx - 0.5, fyy - 0.5, fx + 3, fyy + 2, G.ink);
    // 钟摆窗
    b.rect(x + 6, y + 36, w - 12, h - 58, '#1a1016');
    b.rect(x + 5, y + 35, w - 10, 1, G.gd2);
    b.vl(Math.round(x + w / 2), y + 37, h - 72, G.gd2);
    b.circle(x + w / 2, y + h - 30, 4, G.gd3); b.px(x + w / 2 - 2, y + h - 32, G.gd5);
    b.vl(x + 8, y + 38, 20, G.gd1); b.vl(x + w - 9, y + 38, 26, G.gd1);
    b.rect(x - 2, y + h - 14, w + 4, 14, c[2]); b.hl(x - 2, y + h - 14, w + 4, c[4]);
    b.rect(x - 2, y + 30, w + 4, 4, c[4]); b.hl(x - 2, y + 30, w + 4, c[5]);
  }
  function chandelier(b, cx, y, w) {
    b.vl(cx, y, 14, G.gd1);
    var ry = y + 24;
    b.ellipse(cx, ry, w / 2, 5, G.gd1);
    b.ellipse(cx, ry - 1, w / 2 - 1, 3.5, G.gd2);
    b.hl(cx - w / 2 + 3, ry - 3, w - 6, G.gd4);
    for (var i = 0; i < 7; i++) {
      var x = Math.round(cx - w / 2 + 4 + i * (w - 8) / 6);
      b.line(cx, y + 14, x, ry - 2, G.gd2);
      candle(b, x - 1, ry - 9, 6, false);
      b.px(x, ry + 6, '#c8d8f0'); b.px(x, ry + 8, '#a8b8d0');
    }
    b.ellipse(cx, ry + 6, 6, 4, G.gd2); b.px(cx - 1, ry + 10, G.gd4); b.px(cx, ry + 12, '#c8d8f0');
    b.light(cx, ry - 4, w * 0.8, 24, G.cl1, 2);
  }


  /* ---------- 餐厅 ---------- */
  function fireplace(b, x, y, w, h, o) {
    o = o || {};
    var st = o.cols || [G.st1, G.st2, G.st3, G.st4, G.st5, G.st6];
    // 壁炉台
    b.rect(x, y, w, 7, st[3]); b.hl(x, y, w, st[5]); b.hl(x, y + 6, w, st[0]);
    b.rect(x + 3, y + 7, w - 6, 4, st[2]);
    b.rect(x + 4, y + 11, w - 8, h - 11, st[2]);
    stoneWall(b, x + 4, y + 11, w - 8, h - 11, [st[0], st[1], st[2], st[3], st[4]], 12, 7, 5);
    // 炉口
    var ox = x + 12, oy = y + 26, ow = w - 24, oh = h - 26;
    b.rect(ox, oy, ow, oh, '#0c0808');
    b.ellipse(ox + ow / 2, oy, ow / 2, 8, '#0c0808');
    b.ellipse(ox + ow / 2, oy, ow / 2 + 2, 10, st[1]);
    b.ellipse(ox + ow / 2, oy, ow / 2, 8, '#0c0808');
    b.rect(ox, oy, ow, oh, '#0c0808');
    b.vl(ox - 1, oy, oh, st[4]); b.vl(ox + ow, oy, oh, st[0]);
    // 炉膛内壁砖
    for (var yy = oy + 4; yy < y + h - 6; yy += 5) b.hl(ox + 3, yy, ow - 6, '#1e1210');
    if (o.fire !== false) {
      var fx = ox + ow / 2, fb = y + h - 4;
      // 柴与火
      b.rect(fx - 14, fb - 4, 28, 4, '#2a1810'); b.hl(fx - 14, fb - 4, 28, '#4a2a18');
      var fl = [[-10, 10], [-5, 16], [0, 20], [5, 15], [10, 9]];
      for (var i = 0; i < fl.length; i++) {
        var fxx = fx + fl[i][0], hh = fl[i][1];
        b.poly([fxx - 4, fb - 3, fxx + 4, fb - 3, fxx + 1, fb - 3 - hh], G.cl3);
        b.poly([fxx - 2.5, fb - 3, fxx + 2.5, fb - 3, fxx + 0.5, fb - 3 - hh * 0.7], G.cl2);
        b.poly([fxx - 1, fb - 3, fxx + 1.5, fb - 3, fxx + 0.5, fb - 3 - hh * 0.4], G.cl0);
      }
      b.light(fx, fb - 10, 70, 40, G.cl2, 2);
    } else {
      b.rect(ox + ow / 2 - 12, y + h - 7, 24, 3, '#2a2220'); b.speckle(ox + 4, y + h - 8, ow - 8, 5, '#4a3a34', 0.2, X.rng('ash'));
    }
    // 炉前
    b.rect(x - 2, y + h - 3, w + 4, 3, st[3]); b.hl(x - 2, y + h - 3, w + 4, st[5]);
    // 架上摆设
    if (o.mantle !== false) {
      candle(b, x + 8, y - 10, 10, 16); candle(b, x + w - 10, y - 10, 10, 16);
      b.rect(x + w / 2 - 6, y - 12, 12, 12, G.gd1); b.circle(x + w / 2, y - 6, 4, '#e8dcc0'); b.px(x + w / 2, y - 7, G.ink);
    }
  }
  S.dining = function (b) {
    var fy = room(b, { floorY: 186, wall: ['#2a1620', '#341c28'], wainCols: rmp('#3a2014'), seed: 21 });
    fireplace(b, 16, 92, 84, 92);
    // 投影幕（拉下的白幕）
    b.rect(116, 18, 68, 5, '#2a2a30'); b.hl(116, 18, 68, '#5a5a62'); b.rect(114, 19, 3, 3, G.gd2); b.rect(183, 19, 3, 3, G.gd2);
    b.vgrad(122, 23, 56, 62, ['#d8d4dc', '#c4c0cc', '#b4b0bc']);
    b.vl(122, 23, 62, '#e8e4ec'); b.vl(177, 23, 62, '#9a96a4');
    b.rect(120, 84, 60, 3, '#3a3a42'); b.rect(148, 87, 4, 5, '#3a3a42'); b.vl(150, 92, 4, '#8a8a92');
    // 乌鸦油画
    picFrame(b, 198, 28, 84, 58, function (bb, x, y, w, h) {
      bb.vgrad(x, y, w, h, ['#1a1a2a', '#2a2a3a', '#3a3040', '#2a2030']);
      bb.circle(x + w - 18, y + 12, 7, '#c8b890'); bb.circle(x + w - 16, y + 11, 6, '#2a2a3a');
      bb.poly([x, y + h, x, y + h - 12, x + 20, y + h - 18, x + 40, y + h - 10, x + w, y + h - 16, x + w, y + h], '#120c14');
      bb.thick(x + 6, y + h - 12, x + 40, y + h - 30, 2, '#120c14'); bb.line(x + 22, y + h - 20, x + 30, y + h - 34, '#120c14');
      crow(bb, x + 34, y + h - 34, 13, '#06040a');
      bb.px(x + 38, y + h - 37, '#d04050');
      flyingCrow(bb, x + 52, y + 14, 3, '#0a0810'); flyingCrow(bb, x + 60, y + 20, 2, '#0a0810', 1);
    });
    // 窗
    window_(b, 330, 40, 56, 84, { cols: 2, rows: 4, curtain: '#5a1420', tie: 1, seed: 7, arch: 1 });
    b.light(358, 186, 50, 14, '#8a90b0', 1);
    // 椅背（桌后）
    for (var i = 0; i < 6; i++) {
      var cx = 122 + i * 46;
      if (cx > 216 && cx < 262) continue;
      b.rect(cx, 122, 22, 32, WD[2]); b.rect(cx + 3, 126, 16, 22, G.red1); b.hl(cx + 3, 126, 16, G.red3);
      b.ellipse(cx + 11, 122, 12, 4, WD[3]); b.hl(cx + 2, 119, 18, WD[5]);
      b.vl(cx, 122, 32, WD[4]);
    }
    // 长桌 + 白桌布
    var tc = rmp('#e6e0d4');
    b.rect(100, 152, 280, 8, tc[4]); b.hl(100, 152, 280, tc[5]);
    b.rect(100, 160, 280, 38, tc[3]);
    for (var x = 104; x < 380; x += 12) { b.vl(x, 162, 34, tc[2]); b.vl(x + 1, 166, 26, tc[4]); }
    for (var x2 = 100; x2 < 380; x2 += 8) b.ellipse(x2 + 4, 198, 4, 2, tc[3]);
    b.hl(100, 160, 280, tc[2]);
    b.rect(104, 200, 6, 10, WD[2]); b.rect(370, 200, 6, 10, WD[2]);
    floorShadow(b, 98, 200, 284, 12);
    // 桌上：盘子、酒杯
    for (var j = 0; j < 6; j++) {
      var px = 118 + j * 46;
      if (px > 216 && px < 262) continue;
      b.ellipse(px + 4, 154, 8, 2, '#f8f4f0'); b.ellipse(px + 4, 154, 5, 1.2, '#d8d0d0');
      b.rect(px + 16, 146, 3, 5, '#a8b8d0'); b.px(px + 17, 151, '#a8b8d0'); b.hl(px + 15, 152, 5, '#c8d0e0'); b.px(px + 16, 147, '#ffffff'); b.rect(px + 16, 148, 3, 2, '#7a1a2a');
    }
    // 烛台（五枝）
    var cc = 240;
    b.rect(cc - 6, 152, 12, 3, G.gd1); b.rect(cc - 1, 134, 3, 18, G.gd2); b.vl(cc - 1, 134, 18, G.gd4);
    b.hl(cc - 14, 136, 29, G.gd2); b.hl(cc - 14, 137, 29, G.gd1);
    for (var k = -2; k <= 2; k++) {
      var kx = cc + k * 7;
      b.vl(kx, 130 + Math.abs(k), 7 - Math.abs(k), G.gd2); b.rect(kx - 1, 129 + Math.abs(k), 3, 2, G.gd3);
      candle(b, kx - 1 + (k > 0 ? 1 : 0), 122 + Math.abs(k), 7, false);
    }
    b.light(cc, 122, 60, 40, G.cl1, 2);
    // 放映机（三脚架上）
    b.line(426, 160, 412, 204, '#2a2a30'); b.line(426, 160, 440, 204, '#2a2a30'); b.line(426, 160, 426, 204, '#3a3a42');
    b.rect(408, 140, 32, 18, '#26262c'); b.hl(408, 140, 32, '#5a5a64'); b.vl(408, 140, 18, '#4a4a52');
    b.circle(414, 134, 7, '#1a1a1e'); b.circle(414, 134, 5, '#3a3a42'); b.circle(414, 134, 1.5, '#8a8a92');
    b.circle(432, 132, 7, '#1a1a1e'); b.circle(432, 132, 5, '#3a3a42'); b.circle(432, 132, 1.5, '#8a8a92');
    b.rect(398, 145, 10, 7, '#3a3a42'); b.rect(396, 146, 3, 5, '#8aa0c0');
    b.rect(434, 150, 6, 4, '#8a2020'); b.px(436, 151, '#ff6040');
    // 留声机（矮柜上）
    var gc = rmp('#4a2a18');
    b.rect(420, 188, 44, 18, gc[3]); b.hl(420, 188, 44, gc[5]); b.rect(424, 192, 36, 10, gc[2]); b.hl(424, 192, 36, gc[1]);
    b.rect(422, 206, 3, 6, gc[1]); b.rect(459, 206, 3, 6, gc[1]);
    b.rect(424, 183, 30, 5, gc[3]); b.ellipse(439, 183, 14, 2.5, '#141014');
    b.thick(448, 182, 440, 172, 2, G.gd2);
    b.poly([440, 174, 430, 160, 444, 156, 456, 164], G.gd3);
    b.poly([430, 160, 444, 156, 452, 158, 436, 166], G.gd4);
    b.ellipse(443, 160, 9, 6, G.gd2); b.ellipse(443, 160, 6, 4, '#2a1a10');
    floorShadow(b, 418, 210, 48, 3);
    finish(b);
  };

  /* ---------- 交谊厅 ---------- */
  function uprightPiano(b, x, y, w, h) {
    var c = rmp('#1e1418');
    b.rect(x, y, w, h - 12, c[3]); b.hl(x, y, w, c[5]); b.rect(x - 2, y - 3, w + 4, 4, c[4]); b.hl(x - 2, y - 3, w + 4, c[5]);
    b.rect(x + 6, y + 8, w - 12, 22, c[2]); b.rect(x + 10, y + 12, w - 20, 14, c[1]);
    for (var i = x + 14; i < x + w - 14; i += 10) b.vl(i, y + 13, 12, c[3]);
    // 谱架上的乐谱
    b.rect(x + w / 2 - 14, y + 14, 12, 14, '#e8e0cc'); b.rect(x + w / 2 + 2, y + 14, 12, 14, '#ddd4c0');
    for (var l = 0; l < 4; l++) { b.hl(x + w / 2 - 13, y + 17 + l * 3, 10, '#8a8070'); b.hl(x + w / 2 + 3, y + 17 + l * 3, 10, '#8a8070'); }
    // 键盘
    var ky = y + 36;
    b.rect(x - 4, ky, w + 8, 4, c[4]);
    b.rect(x, ky + 4, w, 8, '#f0ece4');
    for (var k = x; k < x + w; k += 3) b.vl(k, ky + 4, 8, '#b8b0a8');
    for (var k2 = x + 2; k2 < x + w - 2; k2 += 3) if ((k2 / 3 | 0) % 7 !== 2 && (k2 / 3 | 0) % 7 !== 6) b.rect(k2, ky + 4, 2, 5, '#141014');
    b.rect(x - 4, ky + 12, w + 8, 3, c[2]); b.hl(x - 4, ky + 12, w + 8, c[4]);
    b.rect(x + 2, ky + 15, w - 4, h - 12 - 51, c[3]);
    b.rect(x - 2, y + h - 14, 6, 14, c[2]); b.rect(x + w - 4, y + h - 14, 6, 14, c[2]);
    b.rect(x + w / 2 - 6, y + h - 6, 3, 4, G.gd2); b.rect(x + w / 2 + 3, y + h - 6, 3, 4, G.gd2);
    // 烛台
    b.rect(x + 4, y - 5, 6, 2, G.gd2); candle(b, x + 6, y - 12, 7, 16);
    floorShadow(b, x - 4, y + h - 2, w + 8, 3);
  }
  S.lounge = function (b) {
    var fy = room(b, { floorY: 188, wall: ['#14231f', '#1b2d28'], wainCols: rmp('#3a2416'), seed: 31 });
    uprightPiano(b, 18, 110, 104, 80);
    // 内线电话
    b.rect(137, 90, 18, 26, '#2a1a12'); b.hl(137, 90, 18, '#5a3a24'); b.vl(137, 90, 26, '#4a2e1e');
    b.rect(140, 94, 12, 8, '#141014'); b.rect(141, 95, 4, 6, '#3a3a40'); b.rect(147, 95, 4, 6, '#3a3a40');
    b.rect(139, 103, 14, 4, '#1a1a1e'); b.hl(139, 103, 14, '#4a4a52');
    b.circle(146, 111, 3, G.gd2); b.px(145, 110, G.gd4);
    b.line(154, 106, 158, 128, '#141014'); b.line(158, 128, 152, 140, '#141014');
    // 窗
    window_(b, 200, 40, 78, 76, { cols: 3, rows: 3, curtain: '#2a4a3a', tie: 1, seed: 9 });
    b.light(240, 190, 70, 16, '#8a90b0', 1);
    // 书架
    bookshelf(b, 382, 48, 88, 118, 5);
    b.rect(380, 166, 92, 22, WD[2]); b.hl(380, 166, 92, WD[4]); b.rect(386, 170, 38, 14, WD[3]); b.rect(428, 170, 38, 14, WD[3]);
    b.px(404, 177, G.gd3); b.px(446, 177, G.gd3);
    // 角落的道具箱
    b.rect(300, 168, 34, 20, '#2a1a3a'); b.hl(300, 168, 34, '#5a3a6a'); b.frame(302, 170, 30, 16, G.gd1); b.px(316, 177, G.gd4);
    // 沙发（正面）
    var sc = rmp('#5a1a24');
    b.rect(150, 162, 180, 26, sc[3]);
    for (var t = 0; t < 6; t++) for (var r = 0; r < 2; r++) { var tx = 162 + t * 30 + (r ? 15 : 0), ty = 168 + r * 10; if (tx < 324) { b.px(tx, ty, sc[1]); b.px(tx + 1, ty, sc[4]); } }
    b.ellipse(240, 162, 90, 5, sc[3]); b.hl(152, 160, 176, sc[5]);
    b.rect(150, 188, 180, 14, sc[4]); b.hl(150, 188, 180, sc[5]); b.hl(150, 201, 180, sc[2]);
    b.vl(209, 189, 12, sc[2]); b.vl(270, 189, 12, sc[2]);
    b.rect(150, 202, 180, 12, sc[2]); b.hl(150, 213, 180, sc[1]);
    b.rect(142, 170, 16, 42, sc[3]); b.ellipse(150, 170, 8, 5, sc[4]); b.vl(142, 170, 42, sc[4]);
    b.rect(322, 170, 16, 42, sc[2]); b.ellipse(330, 170, 8, 5, sc[3]); b.vl(337, 170, 42, sc[1]);
    for (var lx = 150; lx < 330; lx += 60) b.rect(lx, 214, 4, 5, WD[1]);
    b.rect(334, 214, 4, 5, WD[1]);
    floorShadow(b, 142, 216, 198, 4);
    // 牌桌
    var tx0 = 350, ty0 = 176;
    b.rect(tx0 + 6, ty0 + 10, 4, 34, WD[2]); b.rect(tx0 + 66, ty0 + 10, 4, 34, WD[2]);
    b.ellipse(tx0 + 38, ty0 + 6, 44, 9, WD[2]); b.ellipse(tx0 + 38, ty0 + 5, 42, 8, '#1e4a32'); b.ellipse(tx0 + 38, ty0 + 4, 36, 6, '#28583c');
    b.hl(tx0 - 4, ty0 + 10, 84, WD[1]); b.rect(tx0 - 4, ty0 + 10, 84, 4, WD[3]); b.hl(tx0 - 4, ty0 + 10, 84, WD[5]);
    var cards = [[tx0 + 20, ty0 + 2], [tx0 + 26, ty0 + 4], [tx0 + 48, ty0 + 1], [tx0 + 56, ty0 + 5]];
    for (var c = 0; c < cards.length; c++) { b.rect(cards[c][0], cards[c][1], 6, 3, '#f0ece4'); b.px(cards[c][0] + 1, cards[c][1] + 1, c % 2 ? '#c02030' : '#141014'); }
    b.rect(tx0 + 36, ty0, 4, 3, '#c02030'); b.rect(tx0 + 35, ty0 - 1, 6, 1, '#e8e0d0');
    floorShadow(b, tx0 - 2, ty0 + 42, 80, 4);
    sconce(b, 170, 80); sconce(b, 312, 80);
    finish(b);
  };

  /* ---------- 厨房 ---------- */
  S.kitchen = function (b) {
    var fy = 192;
    // 白瓷砖墙（昏暗）
    b.pat(0, 14, 480, fy - 14, function (x, y) {
      var row = Math.floor((y - 14) / 8), off = (row & 1) * 8;
      var fx = (x + off) % 16, fyy = (y - 14) % 8;
      if (fyy === 0 || fx === 0) return C('#6a6670');
      var r = hsh(Math.floor((x + off) / 16), row, 4);
      if (fyy === 1 && fx < 8) return C('#a8a4ae');
      return r < 0.2 ? C('#8a8692') : r < 0.85 ? C('#94909c') : C('#7e7a86');
    });
    b.wash(0, 14, 480, 60, '#2a2430', 1);
    b.rect(0, 120, 480, 4, WD[3]); b.hl(0, 120, 480, WD[5]);
    ceiling(b, 14, [WD[0], WD[1], WD[2], WD[3]], true);
    floorChecker(b, fy, C('#2a2630'), C('#4a4450'), 26);
    b.hl(0, fy, 480, '#1a1620');
    // 大炉灶
    var sx = 18, sy = 112;
    b.rect(sx + 10, 14, 84, 30, '#2a2a2e'); b.poly([sx + 2, 44, sx + 102, 44, sx + 94, 30, sx + 10, 30], '#34343a'); b.hl(sx + 2, 44, 100, '#5a5a62');
    b.rect(sx + 46, 0, 12, 16, '#26262a');
    b.rect(sx, sy, 100, fy - sy, '#1c1c20'); b.hl(sx, sy, 100, '#4a4a52'); b.rect(sx, sy + 1, 100, 6, '#2a2a30');
    for (var i = 0; i < 3; i++) { b.ellipse(sx + 18 + i * 32, sy + 3, 11, 2.5, '#0c0c10'); b.ring(sx + 18 + i * 32, sy + 3, 11, 2.5, '#4a4a52'); }
    b.rect(sx + 6, sy + 16, 40, 30, '#141418'); b.frame(sx + 6, sy + 16, 40, 30, '#5a5a62'); b.rect(sx + 22, sy + 24, 8, 2, G.gd2);
    b.rect(sx + 54, sy + 16, 40, 30, '#141418'); b.frame(sx + 54, sy + 16, 40, 30, '#5a5a62'); b.rect(sx + 70, sy + 24, 8, 2, G.gd2);
    b.rect(sx + 6, sy + 52, 88, 20, '#141418'); b.frame(sx + 6, sy + 52, 88, 20, '#4a4a52');
    b.rect(sx + 30, sy + 58, 40, 8, '#2a0c08'); for (var g = 0; g < 6; g++) b.vl(sx + 32 + g * 7, sy + 58, 8, '#141418');
    b.wash(sx + 30, sy + 58, 40, 8, G.cl3, 2); b.light(sx + 50, sy + 62, 40, 16, G.cl3, 1);
    // 锅
    b.rect(sx + 10, sy - 12, 18, 12, '#5a4a40'); b.hl(sx + 10, sy - 12, 18, '#8a7a6a'); b.rect(sx + 8, sy - 13, 22, 2, '#6a5a50');
    b.rect(sx + 60, sy - 8, 22, 8, '#3a3a40'); b.hl(sx + 60, sy - 8, 22, '#6a6a72'); b.rect(sx + 82, sy - 6, 10, 2, '#2a2a30');
    // 刀架（8 把刀）
    var kx = 138, ky = 68;
    b.rect(kx, ky, 62, 8, WD[3]); b.hl(kx, ky, 62, WD[5]); b.hl(kx, ky + 7, 62, WD[1]);
    for (var n = 0; n < 8; n++) {
      var x = kx + 4 + n * 7.5 | 0, len = 12 + (n % 3) * 3;
      b.rect(x, ky - 6, 3, 7, WD[1]); b.px(x + 1, ky - 5, G.gd3);
      b.rect(x, ky + 8, 3, len, '#b8bcc8'); b.vl(x, ky + 8, len, '#e8ecf4'); b.vl(x + 2, ky + 8, len, '#7a7e8a');
      b.px(x + 2, ky + 8 + len, '#7a7e8a');
    }
    // 传声管
    b.rect(218, 0, 4, 82, '#8a6a30'); b.vl(218, 0, 82, '#c9a25a'); b.vl(221, 0, 82, '#5a4220');
    b.ellipse(220, 88, 7, 9, '#9a7a3a'); b.ellipse(220, 88, 5, 7, '#2a1a0a'); b.ring(220, 88, 7, 9, '#c9a25a');
    b.rect(226, 84, 3, 4, '#c9a25a'); b.rect(219, 80, 3, 3, '#e6c88a');
    // 水槽
    b.rect(222, 128, 60, 12, '#c8c4cc'); b.hl(222, 128, 60, '#ecebf0'); b.rect(226, 131, 52, 6, '#7a7682');
    b.rect(224, 140, 56, 18, WD[2]); b.rect(228, 143, 22, 13, WD[3]); b.rect(254, 143, 22, 13, WD[3]);
    b.rect(250, 116, 3, 12, '#9a9aa2'); b.rect(250, 116, 10, 3, '#9a9aa2'); b.vl(258, 119, 4, '#9a9aa2'); b.px(258, 124, '#a8c8f0');
    b.rect(232, 100, 44, 3, WD[3]); for (var p2 = 0; p2 < 4; p2++) { b.rect(236 + p2 * 10, 92, 7, 8, ['#e8e4dc', '#6a8aa0', '#e8e4dc', '#a87a5a'][p2]); b.hl(236 + p2 * 10, 92, 7, '#ffffff'); }
    // 地窖门
    door(b, 304, 92, 54, fy - 92, { cols: rmp('#3a2416'), panels: 1 });
    b.rect(304, 104, 54, 4, '#2a2a2e'); b.rect(304, 160, 54, 4, '#2a2a2e'); b.hl(304, 104, 54, '#5a5a62'); b.hl(304, 160, 54, '#5a5a62');
    for (var rv = 308; rv < 356; rv += 10) { b.px(rv, 105, '#8a8a92'); b.px(rv, 161, '#8a8a92'); }
    // 食品柜
    var pc = rmp('#4a3020');
    b.rect(382, 60, 80, fy - 60, pc[2]); b.rect(380, 56, 84, 5, pc[4]); b.hl(380, 56, 84, pc[5]);
    var rng = X.rng('pantry');
    for (var sh = 0; sh < 4; sh++) {
      var yy = 66 + sh * 30;
      b.rect(386, yy, 72, 26, pc[0]);
      var jx = 388;
      while (jx < 452) {
        var jw = 6 + Math.floor(rng() * 8), jh = 10 + Math.floor(rng() * 12);
        if (jx + jw > 456) break;
        var kind = rng();
        if (kind < 0.45) { var jc = rmp(rng.pick(['#8a4a2a', '#6a7a3a', '#a07a3a', '#5a3a5a', '#3a5a6a'])); b.rect(jx, yy + 26 - jh, jw, jh, jc[3]); b.rect(jx, yy + 26 - jh - 2, jw, 2, '#c8c0b0'); b.vl(jx, yy + 26 - jh, jh, jc[4]); b.px(jx + 1, yy + 26 - jh + 1, '#ffffff'); }
        else if (kind < 0.75) { b.ellipse(jx + jw / 2, yy + 26 - jh / 2, jw / 2, jh / 2, '#a89070'); b.hl(jx + 1, yy + 26 - jh + 2, jw - 2, '#7a6040'); }
        else { b.rect(jx, yy + 26 - jh, jw, jh, '#e8dcc4'); b.hl(jx, yy + 26 - jh, jw, '#fff8e8'); b.hl(jx, yy + 26 - jh + 3, jw, '#c04030'); }
        jx += jw + 1 + Math.floor(rng() * 3);
      }
      b.rect(384, yy + 26, 76, 3, pc[3]); b.hl(384, yy + 26, 76, pc[5]);
    }
    b.rect(386, 186, 72, 6, pc[1]);
    // 吊灯（裸灯泡）
    b.vl(240, 14, 22, '#2a2a2e'); b.ellipse(240, 38, 8, 4, '#3a3a42'); b.circle(240, 42, 3, '#fff0c0');
    b.light(240, 60, 150, 90, G.cl1, 1);
    // 工作台
    var tc = rmp('#7a5a38');
    b.rect(150, 172, 140, 7, tc[3]); b.hl(150, 172, 140, tc[5]); b.hl(150, 178, 140, tc[1]);
    b.rect(154, 179, 6, 42, tc[2]); b.rect(280, 179, 6, 42, tc[2]); b.rect(160, 200, 120, 4, tc[1]);
    b.rect(176, 166, 30, 6, '#c8a878'); b.hl(176, 166, 30, '#e8c898');
    b.circle(220, 167, 5, '#c04030'); b.px(219, 165, '#f08070'); b.circle(232, 168, 4, '#e8c050'); b.rect(244, 164, 16, 8, '#8aa058'); b.hl(244, 164, 16, '#b0c878');
    b.ellipse(268, 168, 10, 4, '#d8d4dc'); b.ellipse(268, 167, 8, 2, '#f4f2f8');
    floorShadow(b, 150, 220, 140, 3);
    finish(b);
  };

  /* ---------- 音乐室 ---------- */
  S.music = function (b) {
    var fy = room(b, { floorY: 188, wall: ['#1a1e2e', '#222840'], wainCols: rmp('#2e2018'), seed: 41 });
    // 拱窗
    window_(b, 180, 32, 78, 64, { cols: 3, rows: 2, arch: 1, curtain: '#3a2a5a', tie: 1, seed: 12 });
    b.light(219, 190, 60, 14, '#8a90b0', 1);
    // 三角钢琴（侧面）
    var pc = rmp('#16121a');
    var px = 18, py = 112;
    b.poly([px, py + 30, px + 70, py + 24, px + 96, py + 30, px + 112, py + 36, px + 112, py + 52, px, py + 52], pc[3]);
    b.poly([px + 2, py + 28, px + 86, py - 6, px + 92, py - 2, px + 10, py + 30], pc[4]);   // 琴盖撑起
    b.line(px + 60, py + 10, px + 62, py + 28, pc[5]);
    b.hl(px, py + 30, 112, pc[5]);
    b.rect(px + 100, py + 30, 14, 8, '#f0ece4'); for (var k = px + 100; k < px + 114; k += 2) b.px(k, py + 30, '#141014');
    b.rect(px + 2, py + 52, 6, 28, pc[2]); b.rect(px + 92, py + 52, 6, 28, pc[2]); b.rect(px + 50, py + 52, 5, 24, pc[1]);
    b.rect(px + 1, py + 79, 8, 2, G.gd2); b.rect(px + 91, py + 79, 8, 2, G.gd2);
    b.rect(px + 104, py + 56, 26, 6, pc[3]); b.hl(px + 104, py + 56, 26, pc[5]); b.rect(px + 106, py + 62, 3, 18, pc[2]); b.rect(px + 125, py + 62, 3, 18, pc[2]);
    floorShadow(b, px - 2, py + 78, 132, 4);
    // 谱架
    var sx = 216;
    b.vl(sx, 130, 52, '#2a2a30'); b.vl(sx + 1, 130, 52, '#5a5a62');
    b.line(sx, 182, sx - 12, 190, '#2a2a30'); b.line(sx, 182, sx + 12, 190, '#2a2a30'); b.line(sx, 182, sx, 190, '#2a2a30');
    b.poly([sx - 15, 120, sx + 16, 120, sx + 14, 136, sx - 13, 136], '#2a2a30');
    b.rect(sx - 12, 118, 12, 16, '#e8e0cc'); b.rect(sx + 1, 118, 12, 16, '#ddd4c0');
    for (var l = 0; l < 4; l++) { b.hl(sx - 11, 121 + l * 3, 10, '#7a7060'); b.hl(sx + 2, 121 + l * 3, 10, '#7a7060'); }
    // 磁带录音机（矮柜上）
    var cc = rmp('#3a2418');
    b.rect(320, 152, 64, 36, cc[3]); b.hl(320, 152, 64, cc[5]); b.rect(324, 158, 26, 26, cc[2]); b.rect(354, 158, 26, 26, cc[2]);
    b.px(348, 170, G.gd3); b.px(356, 170, G.gd3);
    b.rect(328, 132, 52, 20, '#2a2a30'); b.hl(328, 132, 52, '#6a6a72'); b.rect(330, 135, 22, 14, '#141418');
    b.circle(335, 142, 3, '#3a3a42'); b.circle(346, 142, 3, '#3a3a42'); b.rect(333, 140, 16, 4, '#5a4a3a');
    for (var bt = 0; bt < 5; bt++) b.rect(356 + bt * 4, 136, 3, 4, '#8a8a92');
    b.rect(356, 143, 20, 6, '#1a1a1e'); for (var gx = 357; gx < 376; gx += 2) b.vl(gx, 143, 6, '#3a3a42');
    b.px(377, 135, '#ff4040');
    // 唱片架
    var rc = rmp('#4a2e1c');
    b.rect(382, 88, 80, 82, rc[2]); b.rect(380, 84, 84, 5, rc[4]); b.hl(380, 84, 84, rc[5]);
    var rng = X.rng('rec');
    for (var sh = 0; sh < 3; sh++) {
      var yy = 92 + sh * 26;
      b.rect(385, yy, 74, 22, rc[0]);
      for (var x = 386; x < 457; x += 2 + (rng() < 0.3 ? 1 : 0)) {
        var col = rmp(rng.pick(['#8a2a2a', '#2a4a7a', '#d8c8a0', '#3a3a3a', '#6a4a8a', '#c87a30', '#2a6a5a']));
        b.vl(x, yy + 2, 20, col[3]); b.vl(x + 1, yy + 2, 20, col[2]);
      }
      b.rect(384, yy + 22, 76, 3, rc[3]); b.hl(384, yy + 22, 76, rc[5]);
    }
    b.rect(386, 166, 72, 4, rc[1]);
    // 唱片封套靠在架前
    b.rect(392, 150, 20, 18, '#d8c8a0'); b.circle(402, 159, 6, '#141014'); b.circle(402, 159, 2, '#c03030');
    // 小提琴盒（地上，侧放）
    var vc = rmp('#3a2418');
    b.poly([252, 202, 262, 190, 280, 192, 292, 188, 314, 190, 320, 198, 314, 208, 292, 210, 280, 206, 262, 210], vc[3]);
    b.poly([254, 200, 263, 191, 280, 193, 292, 189, 313, 191, 318, 197, 296, 199, 260, 201], vc[4]);
    b.line(255, 201, 318, 198, vc[1]); b.hl(262, 191, 18, vc[5]);
    b.rect(282, 197, 8, 3, G.gd2); b.px(282, 197, G.gd4); b.px(270, 199, G.gd3); b.px(304, 198, G.gd3);
    b.thick(270, 196, 296, 195, 1, vc[2]);
    floorShadow(b, 250, 208, 72, 4);
    sconce(b, 150, 84); sconce(b, 300, 84);
    finish(b);
  };

  /* ---------- 地下酒窖 ---------- */
  // 铜牌：挂在钉子上的黄铜牌，刻大号汉字（凹刻 + 高光），左右各一道小装饰
  function brassPlate(b, x, y, w, h, ch, nailY) {
    var cx = x + w / 2;
    nailY = nailY === undefined ? y - 6 : nailY;
    b.line(cx, nailY + 1, x + 4, y, '#4a3a24'); b.line(cx, nailY + 1, x + w - 5, y, '#4a3a24');
    b.rect(Math.round(cx) - 1, nailY, 3, 2, '#2a2a2a'); b.px(Math.round(cx) - 1, nailY, '#7a7a82');
    b.rect(x, y, w, h, G.gd0);
    b.rect(x + 1, y + 1, w - 2, h - 2, G.gd2);
    b.hl(x + 1, y + 1, w - 2, G.gd4); b.vl(x + 1, y + 1, h - 2, G.gd4);
    b.hl(x + 2, y + h - 2, w - 3, G.gd1); b.vl(x + w - 2, y + 2, h - 3, G.gd1);
    b.frame(x + 3, y + 3, w - 6, h - 6, G.gd1);
    b.px(x + 3, y + 3, G.gd4);
    // 两侧铆钉
    b.px(x + 6, Math.round(y + h / 2) - 1, G.gd5); b.px(x + 6, Math.round(y + h / 2), G.gd0);
    b.px(x + w - 7, Math.round(y + h / 2) - 1, G.gd5); b.px(x + w - 7, Math.round(y + h / 2), G.gd0);
    var gl = ch + 'L', gw = 9, gh = ch === '东' ? 10 : 9;
    var gx = Math.round(cx - gw / 2), gy = Math.round(y + (h - gh) / 2);
    X.han(b, gx + 1, gy + 1, gl, G.gd4);
    X.han(b, gx, gy, gl, '#2a1c08');
  }
  // 墙上挂牌留下的干净印子（灰尘轮廓）
  function plateGhost(b, x, y, w, h) {
    b.wash(x, y, w, h, '#8a8496', 1);
    b.hl(x, y - 1, w, '#141218'); b.hl(x, y + h, w, '#141218'); b.vl(x - 1, y, h, '#141218'); b.vl(x + w, y, h, '#141218');
  }
  function stairDoor(b, x, y, w, h, side) {
    // 石拱门洞，里面楼梯向上
    var st = [G.st0, G.st1, G.st2, G.st3, G.st4, G.st5];
    b.rect(x, y + 14, w, h - 14, st[2]);
    b.ellipse(x + w / 2, y + 16, w / 2, 16, st[2]);
    var ix = x + 12, iw = w - 24, iy = y + 22;
    b.rect(ix, iy, iw, y + h - iy, '#0a080c');
    b.ellipse(ix + iw / 2, iy, iw / 2, 12, '#0a080c');
    // 台阶（向远处升高）
    for (var s = 0; s < 9; s++) {
      var sy = y + h - 4 - s * 11, sh = 4;
      var sw = iw - s * 3;
      var sx = side < 0 ? ix + s * 3 : ix;
      b.rect(sx, sy, sw, sh, mix(st[3], '#0a080c', s * 0.1)); b.hl(sx, sy, sw, mix(st[4], '#0a080c', s * 0.1));
      b.rect(sx, sy + sh, sw, 7, mix(st[1], '#0a080c', s * 0.1));
    }
    // 拱石
    for (var a = 0; a <= 10; a++) {
      var t = Math.PI * a / 10;
      var ax = ix + iw / 2 - Math.cos(t) * (iw / 2 + 5), ay = iy - Math.sin(t) * 14;
      b.rect(Math.round(ax) - 2, Math.round(ay) - 2, 5, 5, a % 2 ? st[3] : st[4]); b.px(Math.round(ax) - 2, Math.round(ay) - 2, st[5]);
    }
    b.vl(ix - 1, iy, y + h - iy, st[4]); b.vl(ix + iw, iy, y + h - iy, st[0]);
    // 半开的木门
    var dx = side < 0 ? ix + iw - 10 : ix;
    b.rect(dx, iy - 6, 10, y + h - iy + 6, WD[3]); b.vl(dx + (side < 0 ? 0 : 9), iy - 6, y + h - iy + 6, WD[5]);
    b.hl(dx, iy + 10, 10, '#2a2a2e'); b.hl(dx, y + h - 20, 10, '#2a2a2e');
  }
  S.cellar = function (b, v) {
    var fy = 196;
    stoneWall(b, 0, 0, 480, fy, [G.st0, G.st1, G.st2, G.st3, G.st4], 24, 12, 51);
    // 拱顶
    for (var i = 0; i < 3; i++) {
      var cx = 80 + i * 160;
      b.clip(0, 0, 480, 20);
      b.ellipse(cx, -40, 88, 58, G.st1);
      b.ellipse(cx, -42, 84, 56, G.st0);
      b.clip();
    }
    b.wash(0, 0, 480, 30, G.ink, 2, 0.8);
    floorStone(b, fy, [G.st0, G.st1, G.st2, G.st3, G.st3], 34, 52);
    b.wash(0, fy, 480, 6, G.ink, 2, 0.7);
    stairDoor(b, 18, 40, 100, 152, -1);
    stairDoor(b, 362, 40, 100, 152, 1);
    // 铜牌：西牌 40 宽、东牌 46 宽（尺寸不同 —— swapped 变体中的线索）
    var WP = [48, 22, 40, 14], EP = [389, 22, 46, 14];
    plateGhost(b, WP[0], WP[1], WP[2], WP[3]); plateGhost(b, EP[0], EP[1], EP[2], EP[3]);
    if (v === 'swapped') {
      // 「东」牌挂到了西楼梯门上（略高、比印子宽），「西」牌挂到东楼梯门上（比印子窄）
      brassPlate(b, 45, 19, 46, 14, '东', WP[1] - 6);
      brassPlate(b, 392, 22, 40, 14, '西', EP[1] - 6);
    } else {
      brassPlate(b, WP[0], WP[1], WP[2], WP[3], '西');
      brassPlate(b, EP[0], EP[1], EP[2], EP[3], '东');
    }
    // 酒架（菱形格 + 瓶底）
    var rx = 150, ry = 60, rw = 180, rh = 108;
    var wc = rmp('#4a2e1a');
    b.rect(rx, ry, rw, rh, '#120c0a');
    for (var y = 0; y < rh; y++) for (var x = 0; x < rw; x++) {
      var u = (x + y) % 18, v = (x - y + 360) % 18;
      if (u < 2 || v < 2) b.px(rx + x, ry + y, (u < 1 || v < 1) ? wc[4] : wc[2]);
    }
    for (var cy = ry + 9; cy < ry + rh - 4; cy += 9) for (var cx2 = rx + ((cy - ry) / 9 % 2 ? 9 : 0) + 4; cx2 < rx + rw - 4; cx2 += 18) {
      if (hsh(cx2, cy, 5) < 0.18) continue;
      var bc = hsh(cx2, cy, 6) < 0.5 ? '#1e3a24' : '#3a1420';
      b.circle(cx2 + 0.5, cy + 0.5, 3.5, bc); b.circle(cx2 + 0.5, cy + 0.5, 1.5, '#0a0608'); b.px(cx2 - 1, cy - 1, '#6a8a6a');
    }
    b.rect(rx - 4, ry - 6, rw + 8, 6, wc[3]); b.hl(rx - 4, ry - 6, rw + 8, wc[5]);
    b.rect(rx - 4, ry, 5, rh + 26, wc[2]); b.rect(rx + rw - 1, ry, 5, rh + 26, wc[2]); b.rect(rx + rw / 2 - 2, ry, 4, rh, wc[2]);
    b.rect(rx - 4, ry + rh, rw + 8, 5, wc[3]); b.hl(rx - 4, ry + rh, rw + 8, wc[5]);
    // 地上的酒桶
    b.ellipse(176, 186, 18, 14, '#3a2416'); b.rect(160, 176, 32, 20, '#3a2416'); b.vl(166, 174, 22, '#2a2a2e'); b.vl(186, 174, 22, '#2a2a2e'); b.vl(162, 176, 20, '#5a3a24');
    b.ellipse(304, 186, 18, 14, '#3a2416'); b.rect(288, 176, 32, 20, '#3a2416'); b.vl(294, 174, 22, '#2a2a2e'); b.vl(314, 174, 22, '#2a2a2e');
    // 吊灯笼
    b.vl(240, 0, 26, '#2a2a2e');
    b.rect(233, 28, 14, 3, '#2a2a2e'); b.rect(234, 31, 12, 14, '#ffd27a'); b.frame(234, 31, 12, 14, '#2a2a2e'); b.vl(240, 31, 14, '#2a2a2e');
    b.rect(233, 45, 14, 2, '#2a2a2e'); b.px(239, 37, '#ffffff');
    b.light(240, 50, 150, 110, G.cl1, 2);
    // 木箱
    var cr = rmp('#6a4a2a');
    b.rect(58, 200, 48, 28, cr[3]); b.hl(58, 200, 48, cr[5]); b.frame(58, 200, 48, 28, cr[1]);
    b.line(59, 201, 104, 226, cr[2]); b.hl(60, 213, 44, cr[2]);
    b.rect(62, 196, 40, 4, cr[4]); b.hl(62, 196, 40, cr[5]);
    floorShadow(b, 56, 227, 52, 3);
    finish(b, 3);
  };

  /* ---------- 走廊（东翼；西翼为镜像） ---------- */
  function corridor(b) {
    var fy = room(b, { floorY: 192, wall: ['#2a1c26', '#33222e'], wainCols: rmp('#3a2216'), seed: 61 });
    window_(b, 20, 50, 88, 96, { cols: 2, rows: 3, curtain: '#4a1828', tie: 1, seed: 3, view: function (bb, x, y, w, h) {
      sky(bb, x, y, w, h * 0.62, 31); sea(bb, Math.round(y + h * 0.62), y + h, 6);
    } });
    b.light(64, 200, 60, 16, '#8a96b8', 1);
    picFrame(b, 130, 60, 40, 36, function (bb, x, y, w, h) {
      bb.vgrad(x, y, w, h, ['#3a2a30', '#2a1e24']);
      bb.ellipse(x + w / 2, y + h * 0.42, 8, 10, '#c8a890'); bb.ellipse(x + w / 2, y + h * 0.3, 9, 7, '#2a1a14');
      bb.rect(x + w / 2 - 10, y + h * 0.66, 20, h, '#3a2a40');
    });
    var doors = [196, 292, 394];
    for (var i = 0; i < 3; i++) door(b, doors[i] + 2, 86, 42, fy - 86, { cols: rmp('#4a2a1c'), panels: 2, plate: 1 });
    sconce(b, 270, 88); sconce(b, 368, 88); sconce(b, 182, 88);
    runner(b, 110, 390, fy, 270, [G.red0, G.red1, G.red2, G.gd2], G.gd1);
    finish(b);
  }
  function doorNumbers(b, xs) {
    for (var i = 0; i < xs.length; i++) {
      var x = xs[i][0] + 23 - 5, y = 86 + 6 - 2 - 8;
      b.rect(x + 1, y + 1, 9, 6, G.gd3);
      X.text(b, x + 4, y + 1, xs[i][1], G.gd0);
    }
  }
  S.east_corridor = function (b) { corridor(b); doorNumbers(b, [[198, '1'], [294, '3'], [396, '5']]); };
  S.west_corridor = function (b) { corridor(b); b.flipX(); doorNumbers(b, [[480 - 198 - 46, '1'], [480 - 294 - 46, '3'], [480 - 396 - 46, '5']]); };

  /* ---------- 客房（东翼；西翼为镜像；burnt 为烧毁版） ---------- */
  function guestRoom(b, burnt) {
    var fy = room(b, { floorY: 192, wall: burnt ? ['#1e1a1c', '#262022'] : ['#2a2234', '#342a40'], wainCols: burnt ? rmp('#22160e') : rmp('#40281a'), seed: 71 });
    door(b, 20, 82, 48, fy - 82, { cols: rmp(burnt ? '#2a1a12' : '#4a2a1c'), panels: 2 });
    // 电灯开关（门右侧）
    b.rect(79, 119, 8, 12, '#d8d0c0'); b.frame(79, 119, 8, 12, '#8a8070'); b.rect(82, 122, 2, 5, '#3a3030'); b.px(82, 122, '#6a6060');
    // 书桌 + 椅子
    var dc = rmp('#5a3420');
    b.rect(100, 146, 88, 6, dc[3]); b.hl(100, 146, 88, dc[5]); b.hl(100, 151, 88, dc[1]);
    b.rect(102, 152, 84, 14, dc[2]); b.rect(106, 155, 36, 8, dc[3]); b.rect(146, 155, 36, 8, dc[3]); b.px(124, 158, G.gd3); b.px(164, 158, G.gd3);
    b.rect(102, 166, 5, fy - 166, dc[2]); b.rect(181, 166, 5, fy - 166, dc[2]);
    // 台灯、墨水瓶、书
    b.rect(170, 142, 10, 3, G.gd1); b.vl(175, 130, 12, G.gd2); b.poly([167, 132, 183, 132, 179, 122, 171, 122], '#5a2a30'); b.hl(167, 132, 16, '#7a3a40');
    if (!burnt) b.light(175, 136, 26, 16, G.cl1, 1);
    b.rect(118, 140, 18, 6, '#6a1a26'); b.hl(118, 140, 18, '#8a3040'); b.rect(140, 142, 4, 4, '#1a1a2a');
    // 椅子
    b.rect(126, 154, 30, 4, dc[3]); b.rect(128, 158, 4, fy - 156, dc[2]); b.rect(150, 158, 4, fy - 156, dc[2]);
    b.rect(126, 168, 30, 5, dc[4]); b.hl(126, 168, 30, dc[5]);
    floorShadow(b, 100, fy - 2, 88, 4);
    // 穿衣镜（立式）
    var mx = 210, my = 58, mw = 38, mh = 116;
    b.rect(mx - 2, my - 2, mw + 4, mh + 4, dc[1]);
    b.rect(mx, my, mw, mh, dc[3]); b.ellipse(mx + mw / 2, my + 2, mw / 2 + 2, 8, dc[3]);
    b.rect(mx + 4, my + 6, mw - 8, mh - 12, '#3a3e52');
    b.vgrad(mx + 4, my + 6, mw - 8, mh - 12, ['#4a5068', '#3a3e52', '#2a2c3c']);
    b.line(mx + 8, my + mh - 10, mx + mw - 8, my + 14, '#6a7090'); b.line(mx + 12, my + mh - 10, mx + mw - 6, my + 24, '#5a6080');
    b.vl(mx + 6, my + 8, mh - 16, '#8a90b0');
    b.rect(mx + 4, my + mh - 6, mw - 8, 2, dc[1]);
    b.rect(mx + 6, my + mh + 2, 3, fy - my - mh - 2, dc[2]); b.rect(mx + mw - 9, my + mh + 2, 3, fy - my - mh - 2, dc[2]);
    b.rect(mx - 2, fy - 4, 12, 3, dc[2]); b.rect(mx + mw - 10, fy - 4, 12, 3, dc[2]);
    // 窗
    window_(b, 270, 40, 64, 56, { cols: 2, rows: 2, curtain: burnt ? '#2a1a1a' : '#4a2a50', tie: 1, seed: 8 });
    // 衣柜
    var wc = rmp('#4a2a1a');
    b.rect(422, 60, 46, 132, wc[3]); b.rect(420, 56, 50, 6, wc[4]); b.hl(420, 56, 50, wc[5]);
    b.vl(445, 62, 92, wc[1]); panel(b, 426, 66, 16, 80, wc); panel(b, 448, 66, 16, 80, wc);
    b.px(443, 104, G.gd3); b.px(447, 104, G.gd3);
    // 床（床头在左）
    var bc = rmp('#5a3020');
    if (!burnt) {
      b.rect(296, 138, 12, 76, bc[3]); b.ellipse(302, 138, 7, 5, bc[4]); b.vl(296, 138, 76, bc[5]);
      b.rect(306, 160, 160, 22, '#e8e4ec'); b.hl(306, 160, 160, '#ffffff');
      b.rect(306, 168, 160, 26, '#6a2a3a');
      b.ellipse(326, 160, 16, 6, '#f4f2f6'); b.ellipse(326, 159, 14, 4, '#ffffff');
      b.rect(346, 164, 120, 30, '#7a3044'); b.hl(346, 164, 120, '#9a4a5a');
      for (var q = 352; q < 466; q += 16) b.vl(q, 166, 26, '#6a2a3a');
      b.rect(306, 194, 162, 8, '#5a2030'); b.hl(306, 194, 162, '#7a3044');
      for (var f2 = 306; f2 < 466; f2 += 6) b.px(f2 + 3, 202, '#5a2030');
      b.rect(462, 168, 8, 46, bc[3]); b.vl(469, 168, 46, bc[1]);
      b.rect(300, 202, 6, 14, bc[2]); b.rect(462, 202, 6, 14, bc[2]);
      floorShadow(b, 296, 214, 176, 4);
    } else {
      // 烧塌的床：焦黑床架、塌陷的床垫、露出的弹簧
      var ash = [C('#0c0a0a'), C('#1c1816'), C('#2e2824'), C('#4a423c'), C('#6a625a')];
      b.poly([296, 150, 306, 140, 308, 214, 296, 214], ash[1]); b.vl(297, 150, 64, ash[3]);
      b.poly([300, 144, 304, 136, 308, 146], ash[1]);
      b.poly([306, 200, 336, 186, 372, 196, 410, 184, 446, 196, 468, 206, 468, 216, 306, 216], ash[1]);
      b.poly([312, 196, 340, 184, 372, 192, 408, 180, 444, 192, 440, 198, 404, 192, 372, 200, 338, 192, 316, 200], ash[2]);
      for (var sp = 0; sp < 9; sp++) { var sx2 = 324 + sp * 14, sy2 = 190 + (sp % 3) * 2; b.ring(sx2, sy2, 3, 2, ash[4]); b.px(sx2 - 2, sy2 - 1, '#8a8a92'); }
      b.thick(306, 178, 380, 196, 2, ash[1]); b.thick(380, 196, 468, 186, 2, ash[1]);
      b.thick(462, 168, 466, 214, 3, ash[1]); b.vl(463, 168, 46, ash[3]);
      for (var e = 0; e < 60; e++) { var ex = 308 + hsh(e, 1, 9) * 156, ey = 184 + hsh(e, 2, 9) * 30; b.px(ex, ey, e % 7 === 0 ? '#c05020' : e % 3 ? ash[3] : ash[4]); }
      b.px(402, 194, '#f08030'); b.px(352, 198, '#e06020'); b.px(430, 200, '#c05020');
      // 水桶泼过的积水
      b.ellipse(330, 236, 30, 5, '#141a22'); b.hl(312, 235, 18, '#3a4a5a'); b.ellipse(420, 246, 40, 6, '#141a22'); b.hl(400, 244, 22, '#3a4a5a');
      b.rect(250, 214, 12, 14, '#3a3a42'); b.hl(250, 214, 12, '#6a6a72'); b.ellipse(256, 214, 6, 2, '#1a1a20');
    }
    if (burnt) {
      // 墙面熏黑：从床升起的火舌状煤烟
      var dd = b.d, f = X.mixQ, blk = C('#060404');
      for (var yy = 0; yy < 216; yy++) for (var xx = 220; xx < 480; xx++) {
        var cx2 = 384 + Math.sin(yy * 0.045) * 22 + Math.sin(yy * 0.13 + 1) * 8;
        var wid = 46 + (216 - yy) * 0.55;
        var dx = Math.abs(xx - cx2) / wid;
        var tongue = Math.sin(xx * 0.09 + yy * 0.02) * 0.12;
        var sAmt = (1 - dx + tongue) * 3.2 - (yy < 40 ? (40 - yy) * 0.02 : 0) + (BAY[((yy & 3) << 2) | (xx & 3)] + 0.5) / 16 - 0.5;
        var q = Math.floor(sAmt);
        if (q <= 0) continue;
        var ii = yy * 480 + xx;
        dd[ii] = f(dd[ii], blk, q > 3 ? 3 : q);
      }
      b.wash(0, 0, 480, 270, '#2a2422', 1);
      for (var c2 = 0; c2 < 26; c2++) { var cx3 = 300 + hsh(c2, 5, 4) * 170, cy3 = 142 + hsh(c2, 6, 4) * 46; b.line(cx3, cy3, cx3 + 4 - hsh(c2, 7, 4) * 8, cy3 + 5, '#0a0606'); if (c2 % 4 === 0) b.px(cx3 + 1, cy3 + 2, '#6a2a14'); }
      // 窗：玻璃碎裂，窗帘烧剩残片
      b.rect(274, 44, 56, 48, '#0e0c10');
      b.clip(274, 44, 56, 48); sky(b, 274, 44, 56, 48, 8); b.wash(274, 44, 56, 48, '#0a0a10', 2); b.clip();
      for (var t2 = 0; t2 < 8; t2++) b.poly([274 + t2 * 7, 44, 281 + t2 * 7, 44, 277 + t2 * 7, 44 + 6 + (t2 % 3) * 5], '#5a6070');
      b.poly([274, 92, 290, 92, 280, 82], '#5a6070'); b.poly([314, 92, 330, 92, 324, 84], '#5a6070');
      b.vl(302, 44, 48, '#2a1a12');
      b.rect(262, 30, 14, 40, '#0a0606'); b.poly([262, 70, 276, 70, 270, 84], '#1a1010'); b.rect(328, 30, 14, 28, '#0a0606'); b.poly([328, 58, 342, 58, 334, 68], '#1a1010');
      b.wash(420, 56, 52, 140, '#060404', 2);
      b.speckle(240, 190, 240, 50, '#0a0808', 0.12, X.rng('burnt-floor'));
      b.speckle(240, 196, 240, 40, '#5a4a40', 0.03, X.rng('burnt-floor2'));
    }
    finish(b, burnt ? 3 : 2);
  }
  S.east_room = function (b, v) { guestRoom(b, v === 'burnt'); };
  S.west_room = function (b) { guestRoom(b, false); b.flipX(); };

  /* ---------- 医务室 ---------- */
  function speakingTube(b, x, y, w, h) {
    b.rect(x + w / 2 - 2, y - 40, 4, 40 + h / 2, '#8a6a30'); b.vl(x + w / 2 - 2, y - 40, 40 + h / 2, '#c9a25a'); b.vl(x + w / 2 + 1, y - 40, 40 + h / 2, '#5a4220');
    b.ellipse(x + w / 2, y + h - 6, w / 2 - 1, 6, '#9a7a3a'); b.ellipse(x + w / 2, y + h - 6, w / 2 - 3, 4, '#1a1008'); b.ring(x + w / 2, y + h - 6, w / 2 - 1, 6, '#e6c88a');
    b.px(x + w / 2 + 3, y + h - 12, '#e6c88a');
  }
  S.infirmary = function (b) {
    var fy = room(b, { floorY: 192, wallStyle: 'plaster', plasterCols: ['#5a5864', '#66646e', '#5e5c68'], wainCols: rmp('#4a4a54'), floor: 'checker', floorCols: ['#3a3a44', '#55555f'], seed: 81 });
    door(b, 20, 82, 48, fy - 82, { cols: rmp('#5a5a60'), panels: 2 });
    b.rect(36, 100, 16, 16, '#f0f0f4'); b.rect(42, 102, 4, 12, '#c02030'); b.rect(38, 106, 12, 4, '#c02030');
    // 药品柜（玻璃门）
    var sc = rmp('#d8d8dc');
    b.rect(86, 48, 92, 138, sc[3]); b.rect(84, 44, 96, 6, sc[4]); b.hl(84, 44, 96, sc[5]);
    var rng = X.rng('meds');
    for (var r = 0; r < 4; r++) {
      var y0 = 54 + r * 30;
      b.rect(90, y0, 84, 26, '#3a4048');
      for (var x = 92; x < 170;) {
        var w = 4 + Math.floor(rng() * 5), h = 8 + Math.floor(rng() * 12);
        var col = rng.pick(['#8a4a2a', '#e8e8f0', '#4a7a9a', '#c8b060', '#6a8a6a', '#a04040']);
        b.rect(x, y0 + 26 - h, w, h, col); b.rect(x + 1, y0 + 26 - h - 2, w - 2, 2, '#e0e0e8'); b.vl(x, y0 + 26 - h, h, '#ffffff');
        x += w + 1 + Math.floor(rng() * 3);
      }
      b.rect(88, y0 + 26, 88, 3, sc[2]); b.hl(88, y0 + 26, 88, sc[5]);
    }
    b.wash(90, 54, 84, 120, '#a8c0d8', 1, 0.5);
    b.vl(131, 50, 124, sc[1]); b.line(96, 170, 126, 60, '#e8f0ff'); b.line(138, 170, 168, 60, '#e8f0ff');
    b.rect(88, 174, 88, 12, sc[2]); b.px(128, 180, '#6a6a70'); b.px(134, 180, '#6a6a70');
    // 书桌
    var dc = rmp('#6a5040');
    b.rect(190, 150, 90, 6, dc[3]); b.hl(190, 150, 90, dc[5]); b.rect(192, 156, 30, fy - 156, dc[2]); b.rect(194, 160, 26, 12, dc[3]); b.rect(194, 174, 26, 12, dc[3]);
    b.rect(274, 156, 4, fy - 156, dc[2]);
    b.rect(232, 142, 24, 8, '#f0f0f4'); b.line(234, 144, 252, 144, '#8a8a9a'); b.line(234, 146, 248, 146, '#8a8a9a'); b.rect(258, 140, 3, 10, '#2a2a3a');
    b.rect(204, 138, 14, 12, '#3a5a7a'); b.hl(204, 138, 14, '#5a7a9a');
    // 窗
    window_(b, 320, 40, 76, 62, { cols: 2, rows: 2, curtain: '#c8c8d4', seed: 13 });
    // 传声管（床头）
    speakingTube(b, 292, 96, 16, 22);
    // 床头柜
    var nc = rmp('#d8d8dc');
    b.rect(252, 170, 30, 22, nc[3]); b.hl(252, 170, 30, nc[5]); b.rect(255, 176, 24, 6, nc[2]); b.px(267, 179, '#6a6a70');
    b.rect(254, 192, 3, 8, nc[1]); b.rect(277, 192, 3, 8, nc[1]);
    b.rect(260, 162, 6, 8, '#e8e0d0'); b.rect(259, 160, 8, 2, '#c8c0b0'); b.rect(270, 164, 4, 6, '#a0c0e0');
    // 病床（铁架）
    var ir = '#e8e8ee';
    b.rect(292, 134, 3, 80, ir); b.rect(306, 134, 3, 80, ir); b.hl(292, 134, 17, ir); for (var bx = 295; bx < 306; bx += 3) b.vl(bx, 138, 22, '#b8b8c4');
    b.rect(306, 166, 158, 14, '#f4f4f8'); b.hl(306, 166, 158, '#ffffff');
    b.ellipse(322, 166, 13, 5, '#ffffff');
    b.rect(330, 168, 134, 22, '#c8d0dc'); b.hl(330, 168, 134, '#dde4ee');
    for (var q = 338; q < 464; q += 18) b.vl(q, 170, 18, '#b0b8c8');
    b.rect(306, 190, 160, 8, '#9aa2b0');
    b.rect(462, 160, 3, 54, ir); b.rect(458, 160, 3, 54, '#b8b8c4');
    b.rect(310, 198, 3, 16, ir); b.rect(452, 198, 3, 16, ir);
    floorShadow(b, 290, 212, 178, 4);
    b.vl(240, 0, 18, '#2a2a2e'); b.ellipse(240, 22, 12, 5, '#d8d8e0'); b.light(240, 40, 160, 90, '#fff4e0', 1);
    finish(b);
  };

  /* ---------- 佣人通道 ---------- */
  S.service_nook = function (b) {
    var fy = room(b, { floorY: 190, wallStyle: 'plaster', plasterCols: ['#3e3a40', '#48434a', '#423e44'], wainCols: rmp('#3a2a20'), wainH: 40, ceil: 12, seed: 91 });
    // 拐角：右侧通道向里延伸
    var cx = 362;
    b.poly([cx, 18, 470, 4, 470, 270, cx, 220], '#121016');
    b.poly([cx + 12, 40, 470, 34, 470, 200, cx + 12, 196], '#1a171e');
    b.poly([cx, 18, cx + 12, 40, cx + 12, 196, cx, 220], '#2a262e');
    b.vl(cx, 18, 202, '#4a4550'); b.vl(cx + 12, 40, 156, '#0a080c');
    floorStone(b, 196, [G.st0, G.st0, G.st1, G.st1, G.st2], 30, 92);
    b.poly([cx + 12, 196, 470, 200, 470, 270, cx, 270], '#16141a');
    b.rect(440, 60, 30, 136, '#0a080c');
    b.vl(cx + 30, 44, 152, '#221e26');
    b.light(cx + 50, 120, 50, 80, '#2a2440', 1);
    // 搁架 + 茶具
    var sc = rmp('#4a3222');
    b.rect(40, 72, 90, 116, sc[2]); b.rect(38, 68, 94, 5, sc[4]); b.hl(38, 68, 94, sc[5]);
    for (var r = 0; r < 4; r++) {
      var y0 = 76 + r * 28;
      b.rect(44, y0, 82, 24, sc[0]);
      if (r < 3) for (var c = 0; c < 4; c++) {
        var x = 48 + c * 20;
        if (r === 0) { b.ellipse(x + 6, y0 + 20, 6, 2, '#e8e4ec'); b.rect(x + 2, y0 + 14, 9, 6, '#f0eef4'); b.hl(x + 2, y0 + 14, 9, '#ffffff'); b.px(x + 11, y0 + 16, '#e8e4ec'); b.px(x + 5, y0 + 17, '#4a6aa0'); }
        else if (r === 1) { for (var pl = 0; pl < 4; pl++) b.ellipse(x + 7, y0 + 21 - pl * 2, 8, 2, pl % 2 ? '#e8e4ec' : '#d0ccd8'); }
        else { b.rect(x + 2, y0 + 8, 10, 16, ['#6a3a2a', '#3a5a3a', '#8a7a4a', '#4a4a6a'][c]); b.rect(x + 3, y0 + 6, 8, 2, '#c8c0b0'); }
      }
      b.rect(42, y0 + 24, 86, 3, sc[3]); b.hl(42, y0 + 24, 86, sc[5]);
    }
    // 传声管
    speakingTube(b, 210, 90, 18, 24);
    // 小桌 + 茶壶
    var tc = rmp('#5a3a24');
    b.rect(236, 172, 68, 5, tc[3]); b.hl(236, 172, 68, tc[5]); b.rect(240, 177, 4, fy - 177 + 6, tc[2]); b.rect(296, 177, 4, fy - 177 + 6, tc[2]);
    b.ellipse(270, 162, 13, 10, '#e8e4ec'); b.ellipse(270, 158, 12, 6, '#f8f6fa'); b.ellipse(270, 153, 5, 2, '#d0ccd8'); b.rect(268, 149, 4, 3, '#e8e4ec');
    b.thick(257, 160, 252, 154, 2, '#e8e4ec'); b.ring(284, 162, 4, 5, '#d0ccd8', 2);
    b.hl(262, 160, 16, '#4a6aa0'); b.px(264, 156, '#ffffff');
    b.ellipse(294, 169, 6, 2, '#e8e4ec'); b.rect(290, 164, 8, 5, '#f0eef4');
    floorShadow(b, 236, fy + 4, 68, 3);
    b.vl(170, 0, 30, '#2a2a2e'); b.circle(170, 33, 3, '#ffe8b0'); b.light(170, 40, 120, 80, G.cl1, 1);
    finish(b, 3);
  };


  /* ---------- 鸦之塔通用：弧形石墙 ---------- */
  function towerWall(b, fy, seed, cols) {
    cols = cols || [G.st0, G.st1, G.st2, G.st3, G.st4];
    stoneWall(b, 0, 0, 480, fy, cols, 22, 11, seed);
    // 弧面明暗：两侧更暗
    b.pat(0, 0, 480, fy, function (x, y) { return 0; });
    for (var x = 0; x < 120; x += 1) {
      var q = x < 40 ? 3 : x < 80 ? 2 : 1;
      var dith = x < 40 ? 1 : (x % 40) / 40;
      b.wash(x, 0, 1, fy, G.ink, q, 1 - (x % 40) / 60);
      b.wash(479 - x, 0, 1, fy, G.ink, q, 1 - (x % 40) / 60);
    }
  }
  function ironDoor(b, x, y, w, h, o) {
    o = o || {};
    door(b, x, y, w, h, { cols: o.cols || rmp('#3e2616'), panels: 1, knobLeft: o.knobLeft });
    // 铁箍
    for (var i = 0; i < 3; i++) {
      var yy = y + 12 + i * Math.round((h - 24) / 2);
      b.rect(x, yy, w, 4, '#26262a'); b.hl(x, yy, w, '#5a5a62');
      for (var rx = x + 4; rx < x + w - 2; rx += 8) b.px(rx, yy + 2, '#8a8a92');
    }
  }
  function slitWindow(b, x, y, w, h) {
    b.rect(x - 3, y - 3, w + 6, h + 6, G.st1);
    b.ellipse(x + w / 2, y, w / 2 + 3, 5, G.st1);
    b.clip(x, y - 4, w, h + 4); b.vgrad(x, y - 4, w, h + 4, [G.sky2, G.sky3, G.sky4]); b.clip();
    b.ellipse(x + w / 2, y, w / 2, 4, G.sky2);
    b.rect(x - 4, y + h, w + 8, 3, G.st3); b.hl(x - 4, y + h, w + 8, G.st5);
    b.light(x + w / 2, y + h / 2, 30, h, '#8a90b0', 1);
  }

  /* ---------- 鸦之塔·一楼 ---------- */
  S.tower_stairs = function (b) {
    var fy = 212;
    towerWall(b, fy, 101);
    floorStone(b, fy, [G.st0, G.st1, G.st2, G.st2, G.st3], 30, 102);
    slitWindow(b, 104, 40, 10, 50); slitWindow(b, 352, 30, 10, 46);
    ironDoor(b, 20, 92, 56, fy - 92);
    // 螺旋楼梯
    var cx = 240, cyB = 252;
    var stp = 28;
    var steps = [];
    for (var i = 0; i < stp; i++) {
      var a = i * 0.52 + 0.4, y = cyB - i * 9.2;
      steps.push({ a: a, y: y, x: cx + Math.cos(a) * 66, front: Math.sin(a) > -0.15, i: i });
    }
    // 背面台阶（被柱子挡住的部分先画）
    function drawStep(s, dark) {
      var w = 34 + Math.abs(Math.sin(s.a)) * 22, h = 6;
      var x0 = Math.round(Math.min(cx, s.x) - (s.x < cx ? 6 : 0)), x1 = Math.round(Math.max(cx, s.x) + (s.x > cx ? 6 : 0));
      if (x1 - x0 < 8) { x0 -= 6; x1 += 6; }
      var c = dark ? [G.st0, G.st1, G.st2] : [G.st1, G.st3, G.st5];
      b.rect(x0, Math.round(s.y), x1 - x0, h, c[1]); b.hl(x0, Math.round(s.y), x1 - x0, c[2]); b.hl(x0, Math.round(s.y) + h - 1, x1 - x0, c[0]);
      b.rect(x0, Math.round(s.y) + h, x1 - x0, 3, c[0]);
    }
    for (var j = 0; j < steps.length; j++) if (!steps[j].front && steps[j].y > 8) drawStep(steps[j], true);
    // 中柱
    b.rect(cx - 9, 0, 18, cyB + 4, G.st2); b.vl(cx - 9, 0, cyB + 4, G.st4); b.vl(cx - 8, 0, cyB + 4, G.st3); b.vl(cx + 8, 0, cyB + 4, G.st0); b.vl(cx + 6, 0, cyB + 4, G.st1);
    for (var j2 = 0; j2 < steps.length; j2++) if (steps[j2].front && steps[j2].y > 8) drawStep(steps[j2], false);
    // 扶手（外沿螺旋线）
    var prev = null;
    for (var t = 0; t <= stp * 0.52; t += 0.04) {
      var hx = cx + Math.cos(t + 0.4) * 76, hy = cyB - 22 - t / 0.52 * 9.2;
      if (Math.sin(t + 0.4) > -0.15 && hy > 4) { b.rect(Math.round(hx), Math.round(hy), 2, 2, WD[4]); b.px(Math.round(hx), Math.round(hy), WD[6]); }
    }
    for (var k = 0; k < steps.length; k += 2) {
      var s2 = steps[k];
      if (!s2.front || s2.y < 20) continue;
      var bx = cx + Math.cos(s2.a) * 74;
      b.vl(Math.round(bx), Math.round(s2.y) - 20, 20, WD[2]);
    }
    // 重锤井：竖井外壳与开口
    var wx = 382, wy = 0;
    b.rect(wx - 4, 0, 48, 192, WD[1]); b.vl(wx - 4, 0, 192, WD[3]); b.vl(wx + 43, 0, 192, WD[0]);
    b.rect(wx + 2, 42, 36, 96, '#08060a');
    b.frame(wx + 1, 41, 38, 98, WD[3]);
    b.vl(wx + 12, 42, 70, '#5a5a62'); b.vl(wx + 13, 42, 70, '#2a2a30');
    b.vl(wx + 27, 42, 40, '#5a5a62'); b.vl(wx + 28, 42, 40, '#2a2a30');
    b.rect(wx + 6, 110, 14, 22, '#3a3a42'); b.hl(wx + 6, 110, 14, '#7a7a82'); b.vl(wx + 6, 110, 22, '#5a5a62'); b.px(wx + 12, 108, '#7a7a82');
    b.rect(wx + 22, 80, 12, 18, '#3a3a42'); b.hl(wx + 22, 80, 12, '#7a7a82'); b.vl(wx + 22, 80, 18, '#5a5a62');
    for (var bar = wx + 4; bar < wx + 38; bar += 6) b.vl(bar, 42, 96, '#2a2a30');
    // 检修口（重锤井底）
    b.rect(380, 148, 40, 40, '#2a2a30'); b.frame(380, 148, 40, 40, '#5a5a62'); b.rect(384, 152, 32, 32, '#3a3a42');
    b.hl(384, 152, 32, '#6a6a72'); b.rect(410, 166, 4, 6, '#8a8a92'); b.px(386, 154, '#8a8a92'); b.px(413, 154, '#8a8a92'); b.px(386, 181, '#8a8a92'); b.px(413, 181, '#8a8a92');
    b.rect(376, 188, 48, 4, WD[2]);
    // 椅子（守夜用）
    var cc = rmp('#5a3a22');
    b.rect(94, 172, 30, 4, cc[3]); b.rect(94, 150, 4, 22, cc[2]); b.rect(120, 150, 4, 22, cc[2]); b.rect(94, 150, 30, 4, cc[3]); b.rect(94, 158, 30, 3, cc[2]);
    b.rect(94, 176, 30, 5, cc[4]); b.hl(94, 176, 30, cc[5]);
    b.rect(95, 181, 3, 32, cc[2]); b.rect(120, 181, 3, 32, cc[2]); b.rect(100, 184, 3, 26, cc[1]); b.rect(115, 184, 3, 26, cc[1]);
    floorShadow(b, 92, 210, 36, 4);
    // 壁挂灯笼
    b.rect(140, 96, 3, 10, '#2a2a2e'); b.rect(134, 106, 14, 14, '#ffd27a'); b.frame(134, 106, 14, 14, '#2a2a2e');
    b.light(141, 113, 80, 70, G.cl1, 2);
    finish(b, 3);
  };

  /* ---------- 鸦之塔·藏书室 ---------- */
  S.library = function (b) {
    var fy = 196;
    towerWall(b, fy, 111, [G.wd0, G.wd1, G.wd2, G.wd3, G.wd4]);
    floorBoards(b, fy, [WD[0], WD[1], WD[2], WD[3], WD[3]], 20, 112);
    bookshelf(b, 18, 40, 80, fy - 40, 21, { shelfH: 25 });
    bookshelf(b, 100, 40, 80, fy - 40, 22, { shelfH: 25 });
    // 梯子
    b.thick(170, 60, 186, fy, 2, WD[4]); b.thick(184, 56, 200, fy, 2, WD[4]);
    for (var r = 0; r < 9; r++) { var t = r / 9; b.hl(Math.round(171 + t * 15), Math.round(70 + t * 120), 15, WD[5]); }
    // 封死的固定窗（菱形铅格）
    window_(b, 360, 50, 54, 76, { cols: 1, rows: 1, seed: 21 });
    b.clip(360, 50, 54, 76);
    for (var k = -80; k < 140; k += 10) { b.line(360 + k, 50, 360 + k + 76, 126, '#3a3a42'); b.line(360 + k, 126, 360 + k + 76, 50, '#3a3a42'); }
    b.clip();
    for (var n = 0; n < 4; n++) { b.rect(362 + n * 14, 48, 3, 3, '#8a8a92'); b.rect(362 + n * 14, 125, 3, 3, '#8a8a92'); }
    // 渡廊门
    door(b, 428, 90, 42, fy - 90, { cols: rmp('#4a2c1a'), panels: 2, knobLeft: 1 });
    // 大书桌 + 图纸
    var dc = rmp('#4a2a18');
    b.rect(214, 154, 126, 7, dc[3]); b.hl(214, 154, 126, dc[5]); b.hl(214, 160, 126, dc[1]);
    b.rect(218, 161, 38, fy - 161 + 2, dc[2]); b.rect(298, 161, 38, fy - 161 + 2, dc[2]);
    panel(b, 222, 165, 30, 12, dc); panel(b, 222, 180, 30, 12, dc); panel(b, 302, 165, 30, 12, dc); panel(b, 302, 180, 30, 12, dc);
    b.rect(240, 140, 60, 14, '#2e4a7a'); b.hl(240, 140, 60, '#4a6aa0'); b.hl(240, 153, 60, '#1e3050');
    for (var gl = 0; gl < 6; gl++) b.hl(244 + gl * 2, 143 + gl, 30 - gl * 3, '#a8c0e8');
    b.rect(252, 144, 20, 6, '#1e3050'); b.frame(252, 144, 20, 6, '#a8c0e8'); b.line(276, 142, 292, 150, '#a8c0e8');
    b.rect(296, 136, 10, 4, '#d8d0b8'); b.ellipse(296, 138, 2, 2, '#c8c0a8'); b.rect(306, 147, 18, 4, '#d8d0b8'); b.ellipse(324, 149, 2, 2, '#c8c0a8');
    // 台灯
    b.rect(222, 150, 10, 3, G.gd1); b.vl(227, 136, 14, G.gd2); b.poly([218, 138, 236, 138, 232, 130, 222, 130], '#1e4a30'); b.hl(218, 138, 18, '#3a6a48');
    b.light(227, 146, 60, 22, G.cl1, 2);
    floorShadow(b, 214, fy, 126, 4);
    // 地球仪
    b.rect(352, 186, 18, 4, WD[2]); b.vl(361, 170, 16, WD[3]); b.circle(361, 166, 9, '#3a5a4a'); b.ring(361, 166, 10, 10, G.gd2); b.ellipse(358, 163, 4, 3, '#7a6a40'); b.px(357, 160, '#8aa090');
    finish(b, 3);
  };

  /* ---------- 鸦之塔·书斋 ---------- */
  S.study = function (b) {
    var fy = room(b, { floorY: 194, wall: ['#2a1c18', '#33221d'], wainCols: rmp('#3a2214'), ceil: 18, ceilCols: [WD[0], WD[1], WD[2], WD[3]], seed: 121 });
    // 天花板活板门（被锈钉钉死）
    b.rect(198, 1, 60, 14, WD[2]); b.frame(198, 1, 60, 14, WD[0]); b.hl(199, 2, 58, WD[4]);
    for (var p = 0; p < 4; p++) b.vl(212 + p * 12, 2, 12, WD[1]);
    var nails = [[201, 4], [254, 4], [201, 12], [254, 12], [228, 3], [228, 12]];
    for (var n = 0; n < nails.length; n++) { b.px(nails[n][0], nails[n][1], '#8a5a3a'); b.px(nails[n][0] + 1, nails[n][1], '#5a3a2a'); }
    b.rect(222, 6, 12, 4, '#2a2a2e'); b.px(223, 7, '#6a6a72');
    // 天花板铁钩
    b.vl(196, 18, 6, '#3a3a42'); b.px(195, 24, '#3a3a42'); b.px(195, 25, '#5a5a62'); b.px(196, 26, '#5a5a62'); b.px(197, 25, '#5a5a62');
    // 橡木厚门 + 门闩
    ironDoor(b, 20, 82, 50, fy - 82, { cols: rmp('#4a2c18') });
    b.rect(56, 138, 12, 5, '#3a3a42'); b.hl(56, 138, 12, '#8a8a92'); b.rect(58, 136, 3, 3, '#6a6a72'); b.px(58, 136, '#9a9aa2');
    b.rect(68, 137, 4, 7, '#2a2a30'); b.vl(68, 137, 7, '#6a6a72');
    // 书桌
    var dc = rmp('#4a2814');
    b.rect(106, 152, 112, 7, dc[3]); b.hl(106, 152, 112, dc[5]); b.hl(106, 158, 112, dc[1]);
    b.rect(110, 159, 104, 32, dc[2]); panel(b, 114, 163, 30, 12, dc); panel(b, 114, 177, 30, 12, dc); panel(b, 180, 163, 30, 12, dc); panel(b, 180, 177, 30, 12, dc);
    b.rect(148, 163, 28, 26, dc[1]);
    floorShadow(b, 106, fy - 2, 112, 4);
    // 台灯
    b.rect(152, 148, 16, 4, G.gd1); b.hl(152, 148, 16, G.gd3); b.vl(159, 130, 18, G.gd2); b.vl(160, 130, 18, G.gd1);
    b.poly([150, 132, 170, 132, 166, 120, 154, 120], '#7a5a2a'); b.hl(150, 132, 20, '#a8803a'); b.hl(154, 120, 12, '#c8a050');
    b.light(160, 140, 48, 26, G.cl1, 2);
    // 罩着黑丝绒布的鸟笼
    b.rect(186, 144, 24, 8, G.gd1); b.hl(186, 144, 24, G.gd3); b.hl(186, 151, 24, G.gd0);
    b.poly([188, 146, 208, 146, 207, 126, 198, 114, 189, 126], '#0e0a12');
    b.ellipse(198, 124, 10, 12, '#0e0a12');
    b.line(193, 118, 190, 144, '#2a2236'); b.line(201, 116, 205, 144, '#1a1422'); b.line(197, 115, 197, 144, '#221c2c');
    b.px(192, 121, '#3a3048'); b.px(191, 126, '#3a3048');
    b.ring(198, 111, 3, 3, G.gd3); b.px(197, 109, G.gd5);
    // 书与墨水
    b.rect(118, 146, 22, 6, '#3a1a20'); b.hl(118, 146, 22, '#5a2a30'); b.rect(122, 143, 16, 3, '#2a3a4a');
    b.rect(176, 147, 5, 5, '#141420'); b.px(177, 147, '#4a4a6a');
    // 壁炉
    fireplace(b, 238, 100, 68, 84, { mantle: false });
    b.rect(246, 92, 10, 8, G.gd1); b.rect(286, 92, 12, 8, '#e8e0d0');
    // 窗（朝中庭）
    window_(b, 330, 50, 66, 84, { cols: 2, rows: 3, curtain: '#3a1418', tie: 1, seed: 33 });
    b.light(363, 200, 60, 16, '#8a90b0', 1);
    // 地毯（窗前）
    rug(b, 300, 440, 196, 236, '#4a1a20', '#9a7a40');
    // 检修小门（重锤井）
    b.rect(430, 168, 30, 26, WD[1]); b.frame(430, 168, 30, 26, '#3a3a42'); b.rect(433, 171, 24, 20, '#2a2a30'); b.hl(433, 171, 24, '#5a5a62');
    b.rect(452, 178, 3, 5, '#8a8a92'); b.px(434, 172, '#8a8a92'); b.px(456, 172, '#8a8a92');
    finish(b, 2);
  };

  /* ---------- 鸦之塔·机械室 ---------- */
  function gear(b, cx, cy, r, teeth, cols, rot) {
    rot = rot || 0;
    b.pat(Math.floor(cx - r - 3), Math.floor(cy - r - 3), Math.ceil(r * 2 + 7), Math.ceil(r * 2 + 7), function (x, y) {
      var dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.sqrt(dx * dx + dy * dy);
      var a = Math.atan2(dy, dx) + rot;
      var tooth = Math.cos(a * teeth) > 0.2 ? 3 : 0;
      if (d > r + tooth) return 0;
      if (d > r - 3) return d > r + tooth - 1 ? cols[1] : (dy < 0 ? cols[3] : cols[2]);
      if (d < r * 0.22) return d < 2 ? cols[0] : cols[3];
      // 辐条
      var sp = Math.abs(Math.sin(a * 3));
      if (d < r * 0.35 || sp < 0.12) return (dx + dy < 0) ? cols[3] : cols[2];
      return 0;
    });
    b.ring(cx, cy, r - 2, r - 2, cols[1]);
  }
  S.clockroom = function (b) {
    var fy = 206;
    towerWall(b, fy, 131);
    floorBoards(b, fy, [WD[0], WD[1], WD[2], WD[2], WD[3]], 24, 132);
    // 钟面背面（圆窗透光）
    b.circle(60, 70, 34, G.st1); b.circle(60, 70, 30, '#c8c0a8'); b.circle(60, 70, 28, '#e0d8c0');
    for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; b.rect(Math.round(60 + Math.sin(a) * 24) - 1, Math.round(70 - Math.cos(a) * 24) - 1, 2, 2, '#4a4040'); }
    b.thick(60, 70, 60, 50, 2, '#2a2420'); b.thick(60, 70, 74, 76, 2, '#2a2420');
    b.light(60, 70, 50, 50, '#e8e0c8', 1);
    // 大齿轮组
    var ironC = [C('#141418'), C('#2a2a30'), C('#4a4a52'), C('#6a6a74')];
    var brassC = [C('#2a1e0c'), C('#5a4220'), C('#8a6a30'), C('#c9a25a')];
    b.rect(98, 40, 4, 140, '#2a2a30'); b.rect(290, 40, 4, 140, '#2a2a30'); b.rect(98, 40, 196, 4, '#2a2a30'); b.rect(98, 176, 196, 4, '#2a2a30');
    b.hl(98, 40, 196, '#5a5a62');
    gear(b, 150, 100, 42, 18, ironC, 0.1);
    gear(b, 224, 72, 26, 12, brassC, 0.3);
    gear(b, 250, 130, 32, 14, ironC, 0.2);
    gear(b, 200, 150, 16, 8, brassC, 0);
    gear(b, 270, 64, 12, 7, brassC, 0.5);
    b.thick(150, 100, 250, 130, 3, '#3a3a42');
    // 打钟拉杆
    b.thick(270, 64, 330, 40, 2, '#3a3a42'); b.thick(250, 130, 340, 60, 2, '#3a3a42'); b.thick(260, 150, 410, 70, 2, '#3a3a42');
    // 三口钟
    var bells = [[340, 22, 22], [380, 18, 30], [424, 26, 20]];
    for (var k = 0; k < 3; k++) {
      var bx = bells[k][0], by = bells[k][1], bw = bells[k][2];
      b.rect(bx - 2, by - 6, 4, 6, '#2a2a30');
      b.poly([bx - bw * 0.35, by, bx + bw * 0.35, by, bx + bw * 0.5, by + bw * 1.2, bx - bw * 0.5, by + bw * 1.2], brassC[2]);
      b.ellipse(bx, by + 1, bw * 0.35, 4, brassC[2]);
      b.ellipse(bx, by + bw * 1.2, bw * 0.62, 4, brassC[1]);
      b.ellipse(bx, by + bw * 1.2 + 1, bw * 0.5, 2.5, '#140c04');
      b.line(bx - bw * 0.25, by + 3, bx - bw * 0.4, by + bw * 1.1, brassC[3]); b.line(bx - bw * 0.2, by + 3, bx - bw * 0.33, by + bw * 1.1, '#f0d890');
      b.hl(Math.round(bx - bw * 0.45), Math.round(by + bw * 0.9), Math.round(bw * 0.9), brassC[1]);
    }
    b.rect(318, 12, 124, 5, WD[2]); b.hl(318, 12, 124, WD[4]);
    // 钉鼓（打点滚筒）
    b.rect(118, 166, 80, 30, '#2a2a30'); b.rect(120, 168, 76, 26, brassC[2]); b.hl(120, 168, 76, brassC[3]); b.hl(120, 193, 76, brassC[1]);
    for (var px = 124; px < 194; px += 6) for (var py = 171; py < 191; py += 5) if (hsh(px, py, 7) < 0.4) { b.px(px, py, '#e8e8f0'); b.px(px, py + 1, '#5a5a62'); }
    b.rect(112, 172, 6, 18, '#3a3a42'); b.rect(198, 172, 6, 18, '#3a3a42');
    floorShadow(b, 112, fy - 2, 96, 4);
    // 地板活板门（钉死）
    b.rect(208, 208, 56, 14, WD[2]); b.frame(208, 208, 56, 14, WD[0]); b.hl(209, 209, 54, WD[4]);
    b.vl(222, 209, 12, WD[1]); b.vl(236, 209, 12, WD[1]); b.vl(250, 209, 12, WD[1]);
    var nl = [[211, 210], [260, 210], [211, 219], [260, 219], [236, 214]];
    for (var q = 0; q < nl.length; q++) { b.px(nl[q][0], nl[q][1], '#8a5a3a'); b.px(nl[q][0] + 1, nl[q][1], '#5a3a2a'); }
    // 通往瞭望台的门（门闩在内侧）
    ironDoor(b, 408, 94, 52, fy - 94, { knobLeft: 1 });
    b.rect(412, 146, 14, 5, '#3a3a42'); b.hl(412, 146, 14, '#8a8a92'); b.rect(424, 145, 4, 7, '#2a2a30');
    b.light(434, 92, 40, 10, '#a8a8c0', 1);
    b.vl(240, 0, 10, '#2a2a2e'); b.rect(234, 10, 12, 10, '#ffd27a'); b.frame(234, 10, 12, 10, '#2a2a2e'); b.light(240, 20, 130, 90, G.cl1, 1);
    finish(b, 3);
  };

  /* ---------- 审判厅 ---------- */
  S.judgment = function (b) {
    // 圆形石厅：后墙为弧形柱廊
    stoneWall(b, 0, 0, 480, 140, [G.st0, G.st1, G.st2, G.st3, G.st4], 20, 10, 141);
    b.wash(0, 0, 480, 140, '#1a0c18', 1);
    // 柱子
    for (var i = 0; i < 9; i++) {
      var t = (i - 4) / 4, x = 240 + Math.sin(t * 1.25) * 236, w = Math.round(14 * Math.cos(t * 1.1) + 6);
      if (x > 170 && x < 310) continue;
      b.rect(Math.round(x - w / 2), 0, w, 140, G.st3); b.vl(Math.round(x - w / 2), 0, 140, G.st5); b.vl(Math.round(x + w / 2) - 1, 0, 140, G.st1);
      b.rect(Math.round(x - w / 2) - 2, 128, w + 4, 8, G.st4); b.hl(Math.round(x - w / 2) - 2, 128, w + 4, G.st6);
    }
    // 彩色玻璃窗（圆窗 + 乌鸦）
    var gx = 240, gy = 58, gr = 46;
    b.circle(gx, gy, gr + 6, G.st1); b.circle(gx, gy, gr + 3, G.st4); b.circle(gx, gy, gr, '#140a14');
    var glass = ['#5a1424', '#7a1a30', '#2a2a6a', '#3a4a8a', '#8a6a20', '#4a1a5a', '#a03040', '#2a5a5a'];
    b.pat(gx - gr, gy - gr, gr * 2, gr * 2, function (x, y) {
      var dx = x + 0.5 - gx, dy = y + 0.5 - gy, d = Math.sqrt(dx * dx + dy * dy);
      if (d > gr - 1) return 0;
      var a = Math.atan2(dy, dx), seg = Math.floor((a + Math.PI) / (Math.PI / 8)), ring = d < gr * 0.42 ? 0 : d < gr * 0.72 ? 1 : 2;
      var fa = ((a + Math.PI) / (Math.PI / 8)) % 1;
      if (fa < 0.06 && ring > 0) return C('#0a060a');
      if (Math.abs(d - gr * 0.42) < 0.8 || Math.abs(d - gr * 0.72) < 0.8) return C('#0a060a');
      var c = C(glass[(seg * 3 + ring * 5) % glass.length]);
      if (ring === 0) c = C(dy < 0 ? '#c8a040' : '#a07820');
      if (bay(x, y) < 3 && dy < 0) c = P.mix(c, C('#ffffff'), 0.25);
      return c;
    });
    crow(b, gx - 2, gy + 4, 22, '#0a060a', 'spread');
    b.px(gx + 9, gy - 2, '#ff3050');
    b.light(gx, gy, 70, 70, '#c04060', 1);
    // 彩色光斑落在地上
    // 地面
    var fy = 140;
    floorStone(b, fy, [G.st0, G.st1, G.st2, G.st3, G.st4], 26, 142);
    b.wash(0, fy, 480, 6, G.ink, 2);
    b.light(240, 160, 90, 26, '#b03050', 1);
    // 地面乌鸦徽章（椭圆）
    var ex = 240, ey = 154;
    b.ellipse(ex, ey, 28, 13, G.gd1); b.ellipse(ex, ey, 26, 11.5, '#1a1218'); b.ring(ex, ey, 22, 9.5, G.gd2);
    for (var r = 0; r < 12; r++) { var aa = r / 12 * Math.PI * 2; b.px(Math.round(ex + Math.cos(aa) * 24), Math.round(ey + Math.sin(aa) * 10.5), G.gd4); }
    b.clip(ex - 24, ey - 11, 48, 22);
    var bb2 = new X.Buf(40, 30); crow(bb2, 20, 18, 20, G.gd3, 'spread');
    for (var yy = 0; yy < 30; yy++) for (var xx = 0; xx < 40; xx++) { var c2 = bb2.d[yy * 40 + xx]; if (c2) b.px(ex - 20 + xx, ey - 9 + Math.round(yy * 0.6), c2); }
    b.clip();
    // 下行楼梯（左）
    b.rect(18, 122, 56, 86, '#0a080c');
    for (var s2 = 0; s2 < 7; s2++) { var sy = 126 + s2 * 12; b.rect(18 + s2 * 3, sy, 56 - s2 * 3, 4, mix(G.st3, G.ink, s2 * 0.12)); b.hl(18 + s2 * 3, sy, 56 - s2 * 3, mix(G.st5, G.ink, s2 * 0.12)); }
    b.rect(14, 118, 64, 5, G.st4); b.hl(14, 118, 64, G.st6); b.vl(14, 118, 90, G.st3); b.vl(77, 118, 90, G.st1);
    b.rect(16, 206, 62, 4, G.st3);
    // 暗门（右墙，石缝）
    b.rect(424, 82, 38, 116, G.st2); b.vl(424, 82, 116, '#0a080c'); b.vl(461, 82, 116, '#0a080c'); b.hl(424, 82, 38, '#0a080c');
    b.px(456, 138, G.st5); b.px(456, 139, G.st0);
    b.vl(425, 82, 116, G.st4);
    // 环形证言台
    var pods = [];
    for (var k = 0; k < 14; k++) {
      var aa2 = k / 14 * Math.PI * 2 + Math.PI / 14;
      var px = 240 + Math.cos(aa2) * 196, py = 204 + Math.sin(aa2) * 30;
      pods.push([px, py, Math.sin(aa2)]);
    }
    pods.sort(function (p1, p2) { return p1[1] - p2[1]; });
    for (var m = 0; m < pods.length; m++) {
      var pp = pods[m], sc = 0.75 + (pp[2] + 1) * 0.18;
      var w = Math.round(26 * sc), h = Math.round(30 * sc), x0 = Math.round(pp[0] - w / 2), y0 = Math.round(pp[1] - h + 10);
      if (y0 + h > 268) h = 268 - y0;
      var wc = rmp('#3a2014');
      b.rect(x0, y0 + 4, w, h - 4, wc[2]); b.vl(x0, y0 + 4, h - 4, wc[4]); b.vl(x0 + w - 1, y0 + 4, h - 4, wc[0]);
      b.rect(x0 - 2, y0, w + 4, 5, wc[3]); b.hl(x0 - 2, y0, w + 4, wc[5]); b.hl(x0 - 2, y0 + 4, w + 4, wc[1]);
      b.rect(x0 + 3, y0 + 8, w - 6, Math.max(2, h - 14), wc[1]);
      b.ellipse(pp[0], y0 + 13, 3 * sc, 3 * sc, G.gd2); crow(b, pp[0], y0 + 13, 5 * sc, G.gd0);
      floorShadow(b, x0 - 1, y0 + h, w + 2, 3);
    }
    // 火盆照明
    for (var f = 0; f < 2; f++) {
      var fx = f ? 386 : 94, fyy = 112;
      b.rect(fx - 2, fyy, 4, 28, '#2a2a30'); b.poly([fx - 10, fyy, fx + 10, fyy, fx + 6, fyy + 6, fx - 6, fyy + 6], '#3a3a42');
      b.poly([fx - 7, fyy, fx + 7, fyy, fx, fyy - 16], G.cl3); b.poly([fx - 4, fyy, fx + 4, fyy, fx, fyy - 10], G.cl1); b.px(fx, fyy - 4, G.cl0);
      b.light(fx, fyy - 4, 70, 60, G.cl2, 2);
    }
    finish(b, 3);
  };

  /* ---------- 鸦笼（地下牢） ---------- */
  S.cells = function (b) {
    var fy = 226;
    stoneWall(b, 0, 0, 480, fy, [G.st0, G.st0, G.st1, G.st2, G.st3], 22, 11, 151);
    floorStone(b, fy, [G.st0, G.st0, G.st1, G.st1, G.st2], 30, 152);
    for (var c = 0; c < 3; c++) {
      var x = 16 + c * 152, w = 144;
      // 牢房内部（更暗的后墙与草垫）
      b.rect(x + 6, 64, w - 12, 160, '#0e0c12');
      stoneWall(b, x + 6, 64, w - 12, 140, [G.ink, G.st0, G.st0, G.st1, G.st1], 18, 9, 160 + c);
      b.rect(x + 6, 204, w - 12, 20, G.st0);
      b.rect(x + 20, 196, 60, 10, '#3a3020'); b.hl(x + 20, 196, 60, '#5a4a30'); b.speckle(x + 20, 196, 60, 10, '#6a5a38', 0.2, X.rng('straw' + c));
      b.rect(x + w - 40, 190, 18, 14, '#2a2a30'); b.hl(x + w - 40, 190, 18, '#4a4a52');
      b.rect(x + 50, 80, 20, 14, '#0a080c'); for (var g2 = x + 52; g2 < x + 70; g2 += 4) b.vl(g2, 80, 14, '#3a3a42');
      // 铁栏
      b.rect(x, 58, w, 6, '#26262c'); b.hl(x, 58, w, '#5a5a64'); b.rect(x, 216, w, 6, '#26262c'); b.hl(x, 216, w, '#5a5a64');
      for (var bx = x + 4; bx < x + w - 2; bx += 9) { b.rect(bx, 64, 3, 152, '#2a2a32'); b.vl(bx, 64, 152, '#6a6a74'); b.vl(bx + 2, 64, 152, '#141418'); }
      b.rect(x, 130, w, 4, '#26262c'); b.hl(x, 130, w, '#5a5a64');
      // 锁
      b.rect(x + w - 26, 126, 10, 12, '#3a3a42'); b.frame(x + w - 26, 126, 10, 12, '#6a6a74'); b.px(x + w - 21, 131, '#0a080c'); b.px(x + w - 21, 132, '#0a080c');
      b.rect(x - 2, 52, 6, 172, '#1e1e24'); b.rect(x + w - 4, 52, 6, 172, '#1e1e24');
      // 编号乌鸦
      b.rect(x + w / 2 - 10, 42, 20, 12, G.gd1); b.rect(x + w / 2 - 9, 43, 18, 10, G.gd2); X.text(b, x + w / 2 - 1, 45, String(c + 1), G.gd0);
    }
    // 吊灯
    b.vl(240, 0, 12, '#2a2a2e'); b.rect(232, 12, 16, 3, '#2a2a2e'); b.rect(233, 15, 14, 14, '#ffc860'); b.frame(233, 15, 14, 14, '#2a2a2e'); b.vl(240, 15, 14, '#2a2a2e');
    b.rect(232, 29, 16, 3, '#2a2a2e');
    b.light(240, 30, 200, 140, G.cl1, 2);
    finish(b, 3);
  };

  /* ---------- 旧园丁小屋（past：九年前有人住） ---------- */
  S.hut = function (b, v) {
    var past = v === 'past';
    var fy = 196;
    plankWall(b, 0, 0, 480, fy, past ? [WD[1], WD[3], WD[4], WD[5], WD[6]] : [WD[0], WD[1], WD[2], WD[3], WD[3]], 16, 171);
    b.rect(0, 0, 480, 14, WD[1]); b.hl(0, 14, 480, WD[0]);
    for (var bm = 30; bm < 480; bm += 110) { b.rect(bm, 0, 10, fy, WD[2]); b.vl(bm, 0, fy, WD[4]); b.vl(bm + 9, 0, fy, WD[0]); }
    floorBoards(b, fy, past ? [WD[1], WD[2], WD[3], WD[4], WD[5]] : [WD[0], WD[1], WD[1], WD[2], WD[3]], 18, 172);
    // 工具墙
    var tl = [[24, 'rake'], [40, 'shovel'], [58, 'shears'], [76, 'hoe']];
    b.rect(18, 90, 72, 4, WD[3]); b.hl(18, 90, 72, WD[5]);
    for (var i = 0; i < tl.length; i++) {
      var tx = tl[i][0], k = tl[i][1];
      if (!past && k === 'shears') continue;
      b.rect(tx, 86, 2, 4, '#2a2a30');
      if (k === 'rake') { b.vl(tx, 92, 70, WD[5]); b.hl(tx - 6, 160, 13, '#5a5a62'); for (var r = -6; r <= 6; r += 3) b.vl(tx + r, 160, 5, '#5a5a62'); }
      if (k === 'shovel') { b.vl(tx, 92, 54, WD[5]); b.rect(tx - 2, 92, 5, 3, WD[4]); b.poly([tx - 5, 146, tx + 6, 146, tx + 5, 170, tx + 0.5, 176, tx - 4, 170], '#6a6a72'); b.vl(tx - 4, 148, 22, '#9a9aa2'); }
      if (k === 'shears') { b.thick(tx - 3, 94, tx + 2, 130, 2, '#6a3a20'); b.thick(tx + 5, 94, tx, 130, 2, '#6a3a20'); b.poly([tx - 1, 128, tx + 3, 128, tx + 2, 160, tx, 162], '#9a9aa2'); b.line(tx + 3, 128, tx + 5, 158, '#c8c8d0'); }
      if (k === 'hoe') { b.vl(tx, 92, 80, WD[5]); b.rect(tx - 4, 170, 10, 6, '#5a5a62'); }
    }
    if (!past) { b.line(56, 96, 62, 150, '#3a3a40'); b.px(60, 152, '#3a3a40'); }
    // 小火炉
    b.rect(110, 150, 44, 46, '#26262a'); b.hl(110, 150, 44, '#5a5a62'); b.rect(116, 160, 32, 24, '#141418'); b.frame(116, 160, 32, 24, '#4a4a52');
    b.rect(126, 18, 10, 132, '#2a2a2e'); b.vl(126, 18, 132, '#4a4a52');
    b.rect(104, 192, 56, 4, '#3a3a40');
    if (past) { b.rect(120, 168, 24, 12, '#2a0c08'); b.wash(120, 168, 24, 12, G.cl3, 2); b.light(132, 174, 50, 30, G.cl2, 2); b.rect(116, 142, 14, 8, '#5a4a40'); b.hl(116, 142, 14, '#8a7a6a'); }
    // 相框
    picFrame(b, 182, 60, 40, 30, function (bb, x, y, w, h) {
      bb.vgrad(x, y, w, h, ['#c8b898', '#a89878']);
      bb.ellipse(x + 9, y + 9, 3, 3.5, '#5a4a3a'); bb.rect(x + 6, y + 12, 7, 10, '#5a4a3a');
      bb.ellipse(x + 20, y + 12, 2.5, 3, '#5a4a3a'); bb.rect(x + 18, y + 15, 5, 7, '#7a6a4a');
      if (!past) { bb.wash(x, y, w, h, '#4a4040', 1); }
    });
    if (!past) { b.line(184, 62, 220, 88, '#d8d8e0'); b.line(200, 62, 186, 88, '#a8a8b0'); }
    // 窗
    window_(b, 234, 40, 56, 44, { cols: 2, rows: 2, seed: 41, frame: rmp('#3a2416'), curtain: past ? '#8a6a4a' : null, tie: 1 });
    if (!past) {
      b.rect(236, 42, 24, 20, '#1a1820'); b.line(236, 42, 258, 62, '#8a8a9a'); b.line(250, 42, 238, 58, '#6a6a7a');
      b.thick(234, 70, 290, 76, 2, WD[2]);
    }
    // 床
    var bc = rmp('#4a3020');
    b.rect(298, 150, 8, 60, bc[3]); b.rect(444, 164, 8, 46, bc[3]);
    if (past) {
      b.rect(306, 168, 140, 16, '#d8d0c0'); b.hl(306, 168, 140, '#f0e8d8');
      b.rect(330, 172, 116, 22, '#6a7a8a'); b.hl(330, 172, 116, '#8a9aaa'); for (var q = 340; q < 446; q += 14) b.vl(q, 174, 18, '#5a6a7a');
      b.ellipse(320, 170, 12, 5, '#f4eee4');
    } else {
      b.rect(306, 178, 140, 14, '#4a4238'); b.hl(306, 178, 140, '#5a5248');
      b.poly([320, 178, 360, 174, 420, 180, 430, 190, 330, 192], '#3a342e');
      b.speckle(306, 176, 140, 18, '#2a2620', 0.08, X.rng('mould'));
    }
    b.rect(306, 192, 140, 8, bc[2]); b.hl(306, 192, 140, bc[4]);
    b.rect(300, 200, 5, 12, bc[1]); b.rect(442, 200, 5, 12, bc[1]);
    floorShadow(b, 296, 210, 160, 4);
    // 木箱（架上）
    b.rect(376, 136, 72, 4, WD[3]); b.hl(376, 136, 72, WD[5]);
    var cr = rmp('#6a4a2a');
    b.rect(384, 92, 56, 44, cr[3]); b.hl(384, 92, 56, cr[5]); b.frame(384, 92, 56, 44, cr[1]); b.hl(385, 112, 54, cr[2]);
    b.rect(408, 108, 8, 8, '#3a3a42'); b.px(411, 111, G.gd3);
    if (!past) b.rect(384, 88, 56, 4, cr[2]);
    // 时代感：破败 vs 整洁
    if (!past) {
      // 蛛网、灰尘、破板
      b.line(0, 16, 30, 46, '#8a8a92'); b.line(0, 30, 24, 16, '#8a8a92'); b.line(0, 24, 18, 40, '#6a6a72'); b.line(10, 16, 4, 36, '#6a6a72');
      b.line(480, 16, 452, 44, '#8a8a92'); b.line(466, 16, 476, 40, '#6a6a72');
      b.speckle(0, 0, 480, fy, '#141010', 0.02, X.rng('dust'));
      b.rect(196, 140, 22, 6, '#0e0a08'); b.line(196, 140, 218, 146, WD[3]);
      b.wash(0, 0, 480, 270, '#1a1a20', 1);
      b.light(262, 120, 120, 120, '#7a80a0', 1);
    } else {
      // 桌上的茶杯与花
      b.rect(170, 176, 48, 4, WD[4]); b.hl(170, 176, 48, WD[6]); b.rect(174, 180, 3, 16, WD[3]); b.rect(212, 180, 3, 16, WD[3]);
      b.rect(178, 170, 6, 6, '#e8e4dc'); b.rect(198, 166, 6, 10, '#6a8aa0'); b.circle(201, 162, 3, '#e8c050'); b.px(199, 160, '#f0d070');
      b.light(250, 100, 160, 100, G.cl1, 1);
    }
    finish(b, past ? 2 : 3);
  };

  /* ---------- 船屋 ---------- */
  S.boathouse = function (b) {
    var fy = 168;
    plankWall(b, 0, 0, 480, fy, [WD[0], WD[1], WD[2], WD[3], WD[3]], 14, 181);
    b.rect(0, 0, 480, 10, WD[0]);
    for (var bm = 0; bm < 480; bm += 120) { b.rect(bm + 2, 0, 8, fy, WD[2]); b.vl(bm + 2, 0, fy, WD[4]); }
    b.thick(0, 30, 480, 30, 4, WD[1]);
    // 后墙的水门（通向海）
    b.rect(330, 60, 10, 0, WD[0]);
    // 地板（两侧栈板）+ 中间水道
    floorBoards(b, fy, [WD[0], WD[1], WD[2], WD[3], WD[3]], 18, 182);
    b.poly([150, fy, 330, fy, 380, 270, 100, 270], G.sea1);
    b.pat(100, fy, 280, 270 - fy, function (x, y) {
      var l = 150 - (y - fy) * 50 / (270 - fy), r = 330 + (y - fy) * 50 / (270 - fy);
      if (x < l || x > r) return 0;
      var w = Math.sin(x * 0.2 + y * 0.9) + Math.sin(x * 0.07 - y * 0.4);
      if (w > 1.5) return G.sea4; if (w > 1.0 && bay(x, y) < 8) return G.sea3; if (w < -1.4) return G.sea0;
      return y < fy + 20 ? G.sea2 : G.sea1;
    });
    b.line(150, fy, 100, 270, WD[0]); b.line(330, fy, 380, 270, WD[0]);
    b.line(149, fy, 99, 270, WD[4]); b.line(331, fy, 381, 270, WD[4]);
    // 工作台
    var wc = rmp('#5a3a22');
    b.rect(182, 116, 116, 6, wc[3]); b.hl(182, 116, 116, wc[5]); b.rect(186, 122, 4, 32, wc[2]); b.rect(290, 122, 4, 32, wc[2]); b.rect(186, 140, 108, 3, wc[2]);
    b.rect(196, 106, 18, 10, '#6a6a72'); b.hl(196, 106, 18, '#9a9aa2'); b.rect(222, 110, 26, 6, '#7a5a3a'); b.rect(258, 104, 6, 12, '#3a5a3a'); b.rect(270, 112, 20, 4, '#8a8a92');
    b.thick(232, 86, 244, 106, 2, WD[5]); b.rect(238, 84, 10, 6, '#5a5a62');
    // 绳索（挂在左墙）
    b.rect(30, 84, 4, 4, '#3a3a40'); b.rect(70, 90, 4, 4, '#3a3a40');
    b.ring(42, 112, 14, 22, '#a08858', 3); b.ring(42, 112, 11, 19, '#7a6a40'); b.ring(64, 122, 12, 18, '#a08858', 3);
    b.line(32, 88, 42, 92, '#a08858'); b.line(72, 94, 64, 104, '#a08858');
    b.line(56, 132, 52, 160, '#a08858'); b.line(57, 132, 54, 162, '#7a6a40');
    // 潮汐表
    b.rect(382, 66, 60, 60, '#d8d0b8'); b.frame(380, 64, 64, 64, WD[3]); b.hl(382, 66, 60, '#f0e8d0');
    b.rect(386, 70, 52, 6, '#2a3a5a');
    for (var r = 0; r < 6; r++) { b.hl(388, 82 + r * 7, 20, '#6a6050'); b.hl(412, 82 + r * 7, 22, '#6a6050'); }
    var pts = []; for (var xx = 0; xx < 48; xx++) b.px(390 + xx, Math.round(112 + Math.sin(xx / 7) * 5), '#3a5a8a');
    b.rect(410, 58, 4, 6, '#3a3a40');
    // 船桨（靠在架上）
    b.rect(342, 156, 108, 3, WD[2]); b.rect(344, 159, 3, 9, WD[1]); b.rect(444, 159, 3, 9, WD[1]);
    for (var o = 0; o < 2; o++) {
      var oy = 148 + o * 6;
      b.thick(346, oy, 420, oy + 2, 2, WD[5]); b.poly([418, oy - 3, 448, oy - 2, 450, oy + 3, 420, oy + 5], WD[4]); b.hl(422, oy - 2, 24, WD[6]);
    }
    // 划艇
    var bx = 150, by = 182;
    b.poly([bx, by + 8, bx + 190, by + 4, bx + 178, by + 30, bx + 22, by + 32], WD[3]);
    b.poly([bx + 6, by + 6, bx + 184, by + 3, bx + 182, by + 9, bx + 8, by + 12], WD[2]);
    b.poly([bx + 10, by + 8, bx + 180, by + 5, bx + 176, by + 8, bx + 14, by + 11], '#2a1a10');
    b.hl(bx + 4, by + 7, 186, WD[6]);
    for (var pl = 0; pl < 3; pl++) b.line(bx + 10 + pl * 4, by + 16 + pl * 5, bx + 180 - pl * 4, by + 12 + pl * 5, WD[2]);
    b.rect(bx + 60, by + 2, 6, 8, WD[4]); b.rect(bx + 120, by + 1, 6, 8, WD[4]);
    b.poly([bx + 20, by + 32, bx + 178, by + 30, bx + 172, by + 36, bx + 30, by + 37], G.sea0);
    b.line(bx + 190, by + 4, bx + 230, by - 10, '#a08858');
    // 煤油罐
    for (var kk = 0; kk < 2; kk++) {
      var kx = 28 + kk * 20, ky = 196 + kk * 10;
      b.rect(kx, ky, 18, 26, '#8a2a20'); b.hl(kx, ky, 18, '#b04030'); b.vl(kx, ky, 26, '#a03a28'); b.vl(kx + 17, ky, 26, '#5a1a14');
      b.rect(kx + 3, ky - 4, 5, 4, '#6a6a72'); b.rect(kx + 10, ky - 3, 6, 2, '#4a4a52'); b.rect(kx + 3, ky + 10, 12, 8, '#d8c060'); b.hl(kx + 4, ky + 13, 10, '#5a1a14');
      floorShadow(b, kx - 1, ky + 26, 20, 3);
    }
    // 光：门缝与吊灯
    b.vl(240, 10, 18, '#2a2a2e'); b.rect(235, 28, 10, 10, '#ffd27a'); b.frame(235, 28, 10, 10, '#2a2a2e');
    b.light(240, 40, 180, 120, G.cl1, 1);
    finish(b, 3);
  };


  /* ======================= 室外通用 ======================= */
  // 多边形岩石：抖动网格 Voronoi 岩块，上左面受光、裂缝压暗
  function rock(b, pts, cols, seed, light, cw, chh) {
    var minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9, i;
    for (i = 0; i < pts.length; i += 2) { minx = Math.min(minx, pts[i]); maxx = Math.max(maxx, pts[i]); miny = Math.min(miny, pts[i + 1]); maxy = Math.max(maxy, pts[i + 1]); }
    minx = Math.max(0, Math.floor(minx)); miny = Math.max(0, Math.floor(miny)); maxx = Math.min(b.w - 1, Math.ceil(maxx)); maxy = Math.min(b.h - 1, Math.ceil(maxy));
    var mw = maxx - minx + 1, mh = maxy - miny + 1;
    if (mw <= 0 || mh <= 0) return;
    var m = new X.Buf(mw, mh), sp = [];
    for (i = 0; i < pts.length; i += 2) sp.push(pts[i] - minx, pts[i + 1] - miny);
    m.poly(sp, 1);
    var md = m.d, nc = cols.length, CW = cw || 22, CH = chh || 15;
    // 预计算网格点（含一圈外扩）
    var gx0 = Math.floor(minx / CW) - 1, gy0 = Math.floor(miny / CH) - 1;
    var gw = Math.floor(maxx / CW) + 2 - gx0, gh = Math.floor(maxy / CH) + 2 - gy0;
    var cxs = new Float32Array(gw * gh), cys = new Float32Array(gw * gh), sh = new Uint8Array(gw * gh);
    for (var yy = 0; yy < gh; yy++) for (var xx = 0; xx < gw; xx++) {
      var gi = yy * gw + xx, ax = gx0 + xx, ay = gy0 + yy;
      cxs[gi] = (ax + 0.15 + hsh(ax, ay, seed) * 0.7) * CW; cys[gi] = (ay + 0.15 + hsh(ax, ay, seed + 1) * 0.7) * CH;
      var r = hsh(ax * 7919 + ay * 104729, 3, seed); sh[gi] = r < 0.3 ? 1 : r < 0.8 ? 2 : 3;
    }
    var iCW = 1 / CW, iCH = 1 / CH;
    b.pat(minx, miny, mw, mh, function (x, y) {
      var lx = x - minx, ly = y - miny, k = ly * mw + lx;
      if (!md[k]) return 0;
      var rt = lx < mw - 1 ? md[k + 1] : 0;
      if (!rt) return cols[0];
      var gx = Math.floor(x * iCW) - gx0, gy = Math.floor(y * iCH) - gy0;
      var d1 = 9, d2 = 9, best = 0, fx = 0, fy = 0, px0 = x + 0.5, py0 = y + 0.5;
      for (var j = -1; j <= 1; j++) {
        var row = (gy + j) * gw;
        for (var q = -1; q <= 1; q++) {
          var gi2 = row + gx + q;
          var dx = (px0 - cxs[gi2]) * iCW, dy = (py0 - cys[gi2]) * iCH, d = dx * dx + dy * dy;
          if (d < d1) { d2 = d1; d1 = d; best = gi2; fx = dx; fy = dy; } else if (d < d2) d2 = d;
        }
      }
      var edge = Math.sqrt(d2) - Math.sqrt(d1);
      if (edge < 0.07) return cols[0];
      var idx = sh[best];
      var face = fx * 0.8 + fy;
      if (face < -0.32) idx = Math.min(nc - 1, idx + 1);
      else if (face > 0.38) idx = Math.max(1, idx - 1);
      var bb = BAY[((y & 3) << 2) | (x & 3)];
      if (edge < 0.15) { if (face > 0) idx = Math.max(1, idx - 1); else if (face < -0.1 && bb < 8) idx = Math.min(nc - 1, idx + 1); }
      if (light !== false) { var up = ly > 0 ? md[k - mw] : 0, lf = lx > 0 ? md[k - 1] : 0; if (!up || !lf) idx = Math.min(nc - 1, idx + 1); }
      return cols[idx];
    });
  }
  // 远处森林剪影
  function forest(b, x0, x1, yb, hgt, col, seed, col2) {
    var rng = X.rng('forest' + seed);
    b.rect(x0, yb - Math.round(hgt * 0.35), x1 - x0, Math.round(hgt * 0.35) + 2, col);
    for (var x = x0 - 6; x < x1 + 6; x += 4 + Math.floor(rng() * 5)) {
      var h = hgt * (0.55 + rng() * 0.45), w = 5 + rng() * 6;
      b.poly([x - w, yb, x + w, yb, x + 0.5, yb - h], col);
      if (col2 && rng() < 0.5) b.line(x, yb - h + 2, x - w * 0.6, yb - 2, col2);
    }
  }
  // 宅邸剪影（哥特式）
  function mansion(b, x, y, sc, col, winCol, lit) {
    function R(a, c, w, h) { b.rect(Math.round(x + a * sc), Math.round(y + c * sc), Math.max(1, Math.round(w * sc)), Math.max(1, Math.round(h * sc)), col); }
    function T(a, c, w, h) { b.poly([x + a * sc, y + c * sc, x + (a + w) * sc, y + c * sc, x + (a + w / 2) * sc, y + (c - h) * sc], col); }
    R(0, 0, 100, 30); T(-2, 0, 104, 14);
    R(-30, 8, 34, 22); T(-32, 8, 38, 12); R(96, 8, 34, 22); T(94, 8, 38, 12);
    R(40, -26, 20, 30); T(38, -26, 24, 16);
    R(14, -18, 4, 10); R(82, -18, 4, 10);
    if (winCol) {
      for (var i = 0; i < 9; i++) for (var r = 0; r < 2; r++) {
        var wx = Math.round(x + (6 + i * 10.5) * sc), wy = Math.round(y + (6 + r * 11) * sc);
        b.rect(wx, wy, Math.max(1, Math.round(3 * sc)), Math.max(1, Math.round(5 * sc)), (lit && hsh(i, r, 3) < lit) ? C(G.cl1) : C(winCol));
      }
    }
  }
  // 鸦之塔（立面）：cx 中心，top 顶部瞭望台 y，base 底 y，w 宽
  function crowTower(b, cx, top, base, w, cols, o) {
    o = o || {};
    var x0 = Math.round(cx - w / 2);
    b.rect(x0, top + 14, w, base - top - 14, cols[2]);
    b.vl(x0, top + 14, base - top - 14, cols[3]); b.vl(x0 + 1, top + 14, base - top - 14, cols[3]);
    b.rect(x0 + w - 6, top + 14, 6, base - top - 14, cols[1]);
    // 石砌横缝
    for (var y = top + 20; y < base; y += 7) b.hl(x0 + 2, y, w - 8, cols[1]);
    for (var y2 = top + 20; y2 < base; y2 += 14) for (var xx = x0 + 6 + ((y2 / 7) % 2) * 6; xx < x0 + w - 6; xx += 12) b.vl(xx, y2, 7, cols[1]);
    // 瞭望台（环形栏杆）
    b.rect(x0 - 6, top + 10, w + 12, 5, cols[3]); b.hl(x0 - 6, top + 10, w + 12, cols[4]); b.hl(x0 - 6, top + 14, w + 12, cols[0]);
    for (var bx = x0 - 5; bx < x0 + w + 6; bx += 4) b.vl(bx, top, 10, cols[1]);
    b.hl(x0 - 6, top, w + 12, cols[1]);
    // 尖顶
    if (o.roof !== false) {
      b.poly([x0 + 2, top + 1, x0 + w - 2, top + 1, cx + 0.5, top - (o.roofH || 40)], cols[1]);
      b.poly([x0 + 2, top + 1, cx + 0.5, top + 1, cx + 0.5, top - (o.roofH || 40)], cols[2]);
      b.vl(Math.round(cx), top - (o.roofH || 40) - 8, 8, cols[0]);
      crow(b, cx + 1, top - (o.roofH || 40) - 9, 6, cols[0]);
    }
    return x0;
  }

  /* ---------- 渡船甲板 ---------- */
  S.ferry = function (b) {
    sky(b, 0, 0, 480, 141, 1);
    // 远处的宵鸦岛
    var ic = [C('#1e1e2c'), C('#262636'), C('#2e2e40'), C('#363648'), C('#40405a')];
    b.poly([284, 141, 296, 124, 316, 112, 336, 104, 352, 92, 380, 88, 404, 92, 428, 100, 446, 112, 462, 126, 470, 141], ic[2]);
    b.poly([300, 141, 320, 120, 352, 100, 380, 96, 420, 104, 450, 122, 466, 141], ic[1]);
    forest(b, 300, 340, 116, 12, ic[1], 2);
    mansion(b, 372, 92, 0.32, ic[0], '#3a3a50', 0.2);
    b.rect(426, 70, 6, 26, ic[0]); b.poly([424, 70, 434, 70, 429, 60], ic[0]);
    b.light(380, 110, 100, 30, '#6a6a88', 1);
    sea(b, 141, 200, 1);
    // 远方另一座岛
    b.poly([40, 141, 60, 134, 90, 132, 120, 138, 130, 141], C('#3a3a50'));
    // 驾驶室
    var cc = rmp('#8a8a80');
    b.rect(378, 118, 48, 80, cc[3]); b.rect(374, 110, 56, 9, '#5a2a24'); b.hl(374, 110, 56, '#8a4a40');
    b.vl(378, 118, 80, cc[4]); b.vl(425, 118, 80, cc[1]);
    b.rect(384, 126, 36, 20, '#1e2632'); b.vl(402, 126, 20, cc[2]); b.line(386, 144, 398, 128, '#5a6a80');
    b.rect(388, 152, 22, 46, '#141820'); b.frame(388, 152, 22, 46, cc[1]);
    // 船夫剪影（门内）
    b.ellipse(399, 166, 4, 4.5, '#2a2a30'); b.rect(394, 161, 10, 3, '#2a3440'); b.rect(392, 163, 14, 1, '#2a3440'); b.rect(393, 171, 12, 27, '#1e2830');
    b.vl(414, 96, 22, '#3a3a40'); b.rect(410, 96, 9, 3, '#3a3a40'); b.px(414, 94, '#c03030');
    // 桅杆与绳
    b.rect(60, 30, 4, 170, WD[3]); b.vl(60, 30, 170, WD[5]);
    b.line(62, 34, 0, 150, '#5a5040'); b.line(62, 34, 150, 196, '#5a5040'); b.line(62, 60, 470, 112, '#4a4030');
    // 甲板
    floorBoards(b, 224, [WD[1], WD[2], WD[3], WD[4], WD[5]], 26, 191, 120);
    b.rect(0, 200, 480, 24, C('#c8c4b8'));
    b.pat(0, 200, 480, 24, function (x, y) { return y < 202 ? C('#e8e4d8') : y > 221 ? C('#7a766a') : (x % 7 === 0 ? C('#a8a498') : 0); });
    // 栏杆
    b.rect(0, 196, 480, 5, '#5a5a62'); b.hl(0, 196, 480, '#9a9aa2'); b.hl(0, 200, 480, '#2a2a30');
    for (var px = 6; px < 480; px += 36) { b.rect(px, 196, 4, 30, '#4a4a52'); b.vl(px, 196, 30, '#8a8a92'); }
    b.rect(0, 210, 480, 2, '#5a5a62');
    // 救生圈
    b.ring(140, 212, 11, 11, '#e8e0d0', 5); b.ring(140, 212, 11, 11, '#c03020', 2); for (var a = 0; a < 4; a++) { var aa = a * Math.PI / 2 + 0.6; b.rect(Math.round(140 + Math.cos(aa) * 8) - 2, Math.round(212 + Math.sin(aa) * 8) - 2, 4, 4, '#c03020'); }
    b.wash(0, 224, 480, 46, G.ink, 1);
    finish(b, 1);
  };

  /* ---------- 码头 ---------- */
  S.dock = function (b) {
    sky(b, 0, 0, 480, 130, 2);
    // 山丘与宅邸
    var hc = [C('#1a1c26'), C('#20222e'), C('#272a38'), C('#2e3242'), C('#363a4c')];
    b.poly([0, 100, 60, 78, 140, 66, 200, 54, 280, 50, 360, 58, 420, 70, 480, 82, 480, 200, 0, 200], hc[1]);
    forest(b, 0, 190, 90, 26, hc[0], 3, hc[2]);
    forest(b, 300, 480, 84, 24, hc[0], 4, hc[2]);
    mansion(b, 196, 36, 0.62, hc[0], '#2a2a3a', 0.25);
    b.rect(330, 6, 16, 52, hc[0]); b.poly([326, 6, 350, 6, 338, -20], hc[0]); b.rect(328, 4, 20, 3, hc[0]);
    b.circle(338, 18, 5, '#3a3a4a');
    // 悬崖
    rock(b, [0, 120, 30, 108, 80, 104, 120, 110, 150, 118, 160, 176, 0, 176], [G.st0, G.st1, G.st2, G.st3, G.st4], 21);
    rock(b, [300, 96, 360, 70, 420, 64, 480, 60, 480, 200, 330, 200, 310, 150], [G.st0, G.st1, G.st2, G.st3, G.st4], 22, true, 16, 30);
    // 通往宅邸的小路与铁栅门
    b.poly([214, 180, 266, 180, 256, 120, 224, 120], C('#3a3640'));
    b.rect(196, 96, 14, 86, G.st3); b.hl(196, 96, 14, G.st5); b.rect(194, 92, 18, 5, G.st4); b.ellipse(203, 89, 6, 4, G.st4);
    b.rect(270, 96, 14, 86, G.st3); b.hl(270, 96, 14, G.st5); b.rect(268, 92, 18, 5, G.st4); b.ellipse(277, 89, 6, 4, G.st4);
    b.vl(209, 96, 86, G.st1); b.vl(283, 96, 86, G.st1);
    var ir = C('#1a1a20');
    b.hl(210, 108, 60, ir); b.hl(210, 170, 60, ir); b.hl(210, 140, 60, ir);
    for (var gx = 212; gx < 270; gx += 5) { b.vl(gx, 100, 80, ir); b.poly([gx - 1, 101, gx + 2, 101, gx + 0.5, 96], ir); }
    b.ellipse(240, 108, 24, 10, ir); b.ellipse(240, 108, 22, 8, C('#3a3640'));
    for (var gx2 = 218; gx2 < 264; gx2 += 5) b.vl(gx2, 101, 8, ir);
    b.circle(240, 124, 6, C('#2a2a30')); crow(b, 240, 124, 9, C('#4a4a52'));
    // 右侧石阶
    for (var st = 0; st < 12; st++) {
      var sy = 186 - st * 9, sx = 380 + st * 3, sw = 80 - st * 3;
      b.rect(sx, sy, sw, 4, G.st4); b.hl(sx, sy, sw, G.st6); b.rect(sx, sy + 4, sw, 5, G.st2);
    }
    b.thick(376, 190, 410, 80, 2, '#2a2a30'); for (var pp = 0; pp < 6; pp++) b.vl(Math.round(378 + pp * 6), Math.round(184 - pp * 20), 10, '#2a2a30');
    // 船屋（左）
    var wc = [WD[0], WD[1], WD[2], WD[3], WD[4]];
    plankWall(b, 10, 80, 110, 112, wc, 10, 23);
    b.poly([4, 84, 126, 84, 116, 62, 14, 62], C('#2a2028')); b.hl(4, 84, 122, C('#4a3a40'));
    b.rect(20, 100, 86, 92, WD[1]); b.frame(20, 100, 86, 92, WD[0]);
    for (var dp = 22; dp < 104; dp += 9) b.vl(dp, 102, 88, WD[2]);
    b.line(20, 100, 106, 192, WD[3]); b.line(106, 100, 20, 192, WD[3]);
    b.rect(60, 140, 6, 6, '#3a3a42'); b.px(62, 142, '#8a8a92');
    // 海（左下）
    b.clip(0, 176, 160, 94);
    sea(b, 176, 270, 3);
    b.clip();
    // 石岸
    b.pat(140, 180, 340, 90, function (x, y) {
      var u = (x - 140) / 340;
      if (y < 180 + (1 - u) * 20) return 0;
      var k = Math.floor((x + (Math.floor(y / 9) % 2) * 9) / 18), f = (x + (Math.floor(y / 9) % 2) * 9) % 18;
      if (y % 9 === 0 || f === 0) return G.st1;
      var r = hsh(k, Math.floor(y / 9), 5);
      return r < 0.3 ? G.st2 : r < 0.8 ? G.st3 : G.st4;
    });
    // 木栈桥
    b.poly([196, 196, 284, 196, 330, 270, 150, 270], WD[3]);
    for (var pl = 0; pl < 14; pl++) {
      var t0 = pl / 14, yy = Math.round(196 + Math.pow(t0, 1.2) * 74);
      var l = 196 - (yy - 196) * 46 / 74, r = 284 + (yy - 196) * 46 / 74;
      b.hl(Math.round(l), yy, Math.round(r - l), WD[1]); b.hl(Math.round(l), yy + 1, Math.round(r - l), WD[5]);
    }
    b.line(196, 196, 150, 270, WD[0]); b.line(284, 196, 330, 270, WD[0]);
    b.rect(190, 194, 100, 4, WD[2]);
    // 系船柱
    b.rect(344, 206, 16, 14, '#26262c'); b.ellipse(352, 206, 10, 4, '#3a3a42'); b.ellipse(352, 205, 8, 3, '#5a5a62'); b.vl(345, 206, 14, '#4a4a52');
    b.ellipse(352, 220, 10, 3, '#16161a');
    b.line(352, 210, 300, 236, '#8a7a50'); b.line(352, 211, 300, 237, '#5a4a30');
    b.light(240, 120, 200, 60, '#8a8aa8', 1);
    finish(b, 1);
  };

  /* ---------- 中庭（past：九年前，温室完好） ---------- */
  S.courtyard = function (b, v) {
    var past = v === 'past';
    sky(b, 0, 0, 480, 150, past ? 5 : 3);
    // 两侧宅邸墙
    var mw = [C('#1e1a24'), C('#26222e'), C('#2e2a38'), C('#38344a'), C('#464058')];
    b.rect(0, 70, 180, 110, mw[1]); b.rect(300, 76, 180, 104, mw[1]);
    b.poly([0, 70, 180, 70, 180, 60, 0, 60], mw[0]); b.poly([300, 76, 480, 76, 480, 66, 300, 66], mw[0]);
    for (var i = 0; i < 6; i++) {
      var wx = 12 + i * 28; b.rect(wx, 84, 12, 22, mw[0]); b.rect(wx + 1, 85, 10, 20, past ? (i % 3 === 1 ? C(G.cl1) : C('#3a3a50')) : C('#2a2a3a')); b.vl(wx + 6, 85, 20, mw[0]);
      b.rect(wx, 124, 12, 22, mw[0]); b.rect(wx + 1, 125, 10, 20, C('#2a2a3a'));
      var wx2 = 312 + i * 28; b.rect(wx2, 90, 12, 22, mw[0]); b.rect(wx2 + 1, 91, 10, 20, C('#2a2a3a')); b.vl(wx2 + 6, 91, 20, mw[0]);
    }
    // 鸦之塔
    var tc = [C('#26222e'), C('#322d3c'), C('#3e384a'), C('#4c465a'), C('#5e5870')];
    crowTower(b, 236, 12, 176, 76, tc, { roofH: 40 });
    // 钟面
    b.circle(236, 50, 23, tc[0]); b.circle(236, 50, 21, G.gd1); b.circle(236, 50, 19, '#d8ccb0'); b.circle(236, 50, 17, '#e8dcc0');
    for (var h = 0; h < 12; h++) { var a = h / 12 * Math.PI * 2; b.rect(Math.round(236 + Math.sin(a) * 15) - 1, Math.round(50 - Math.cos(a) * 15) - 1, 2, 2, '#2a2420'); }
    b.thick(236, 50, 236, 37, 2, '#1a1410'); b.thick(236, 50, 245, 55, 2, '#1a1410'); b.circle(236, 50, 2, G.gd2);
    // 书斋窗（三楼）
    b.rect(222, 96, 28, 30, tc[0]); b.ellipse(236, 97, 14, 6, tc[0]);
    b.rect(225, 99, 22, 25, past ? C('#3a3448') : C('#4a3a30')); b.vl(236, 99, 25, tc[0]); b.hl(225, 110, 22, tc[0]);
    if (!past) b.rect(226, 100, 9, 9, C('#6a5040'));
    b.rect(220, 126, 32, 3, tc[4]);
    b.rect(226, 140, 20, 22, tc[0]); b.rect(228, 142, 16, 18, C('#2a2a3a'));
    // 飞鸦祭缆索：从左上方斜拉到塔顶
    b.line(0, 3, 199, 19, '#0c0a10'); b.line(0, 4, 199, 20, '#16141c');
    b.ring(200, 20, 3, 3, '#1a1820');
    // 地面：石板 + 草
    var fy = 176;
    floorStone(b, fy, [C('#1e2022'), C('#2a2e2e'), C('#343a38'), C('#3e4442'), C('#48504c')], 28, 171);
    b.pat(0, fy, 480, 94, function (x, y) { var n = Math.sin(x * 0.05) + Math.sin(y * 0.3 + x * 0.02); return (n > 1.1 && bay(x, y) < 10) ? G.gr3 : (n > 0.8 && bay(x, y) < 5 ? G.gr2 : 0); });
    // 塔基与灌木
    b.rect(190, 168, 92, 10, tc[1]); b.hl(190, 168, 92, tc[3]);
    for (var bsh = 0; bsh < 8; bsh++) { var bx = 10 + bsh * 22 + (bsh > 3 ? 280 : 0); b.ellipse(bx, 176, 14, 9, G.gr1); b.ellipse(bx - 2, 173, 10, 6, G.gr2); b.px(bx - 4, 170, G.gr4); }
    // 喷泉
    var fc = [G.st1, G.st2, G.st3, G.st4, G.st5];
    b.ellipse(96, 206, 44, 12, fc[1]); b.ellipse(96, 204, 42, 10, fc[3]); b.ellipse(96, 205, 36, 7, past ? G.sea3 : C('#2a3a34'));
    b.hl(56, 210, 80, fc[0]); b.rect(54, 205, 84, 10, fc[2]); b.ellipse(96, 215, 42, 6, fc[1]); b.ellipse(96, 205, 36, 7, past ? G.sea3 : C('#2a3a34'));
    b.ellipse(96, 203, 30, 4, past ? G.sea4 : C('#344a40'));
    b.rect(92, 178, 8, 26, fc[2]); b.vl(92, 178, 26, fc[4]); b.ellipse(96, 182, 14, 4, fc[3]); b.ellipse(96, 181, 12, 2.5, fc[2]);
    crow(b, 96, 172, 9, fc[1], 'up');
    if (past) { b.vl(96, 160, 10, '#a8c8e0'); b.px(95, 162, '#ffffff'); }
    // 画架
    var ec = rmp('#6a4a2a');
    b.thick(156, 228, 164, 180, 2, ec[3]); b.thick(176, 228, 168, 180, 2, ec[3]); b.thick(166, 228, 166, 186, 1, ec[2]);
    b.rect(152, 180, 28, 24, '#e8e0d0'); b.frame(152, 180, 28, 24, ec[2]);
    b.rect(154, 182, 24, 20, '#2a3050'); b.circle(170, 187, 3, '#d8e0f0'); b.rect(160, 192, 6, 10, '#141020'); b.poly([159, 192, 167, 192, 163, 186], '#141020');
    b.rect(152, 204, 28, 3, ec[3]);
    // 温室
    var gx = 340, gy = 118;
    var frame = C('#2a2a30');
    if (past) {
      b.poly([gx, gy + 30, gx + 66, gy, gx + 132, gy + 30, gx + 132, gy + 80, gx, gy + 80], C('#5a7a8a'));
      b.pat(gx, gy, 132, 80, function (x, y) { var t = (x - gx + (gy + 80 - y)) % 12; return (b.get(x, y) === C('#5a7a8a')) ? (t < 2 ? C('#a8c8d8') : (bay(x, y) < 4 ? C('#7a9aaa') : 0)) : 0; });
      b.light(gx + 66, gy + 40, 70, 40, '#c8e0f0', 1);
    } else {
      b.poly([gx, gy + 30, gx + 66, gy, gx + 132, gy + 30, gx + 132, gy + 80, gx, gy + 80], C('#1e2428'));
      b.pat(gx, gy, 132, 80, function (x, y) { return (b.get(x, y) === C('#1e2428') && hsh(Math.floor((x - gx) / 11), Math.floor((y - gy) / 12), 9) < 0.3) ? C('#4a5a62') : 0; });
      // 藤蔓
      for (var vn = 0; vn < 14; vn++) { var vx = gx + 6 + vn * 9, vy = gy + 80; b.line(vx, vy, vx + (vn % 3) - 1, vy - 10 - (vn * 7 % 22), G.gr3); b.px(vx + 1, vy - 8, G.gr4); }
    }
    for (var fxx = gx; fxx <= gx + 132; fxx += 11) { var top = gy + 30 - (66 - Math.abs(fxx - gx - 66)) * 30 / 66; b.vl(fxx, Math.round(top), Math.round(gy + 80 - top), frame); }
    b.line(gx, gy + 30, gx + 66, gy, frame); b.line(gx + 66, gy, gx + 132, gy + 30, frame); b.hl(gx, gy + 30, 133, frame); b.hl(gx, gy + 55, 133, frame);
    b.rect(gx - 2, gy + 80, 136, 4, G.st2); b.hl(gx - 2, gy + 80, 136, G.st4);
    if (!past) { b.line(gx + 40, gy + 12, gx + 30, gy + 30, C('#0e1214')); b.poly([gx + 52, gy + 6, gx + 74, gy + 4, gx + 64, gy + 22], C('#0e1214')); }
    // 长椅
    var bc = rmp('#4a3020');
    b.rect(302, 206, 72, 5, bc[3]); b.hl(302, 206, 72, bc[5]); b.rect(302, 196, 72, 4, bc[3]); b.rect(302, 201, 72, 3, bc[2]);
    b.rect(304, 211, 4, 16, '#2a2a30'); b.rect(368, 211, 4, 16, '#2a2a30'); b.rect(304, 196, 3, 16, '#2a2a30'); b.rect(369, 196, 3, 16, '#2a2a30');
    floorShadow(b, 300, 226, 76, 3);
    if (past) b.light(240, 80, 240, 140, '#c8c0d8', 1);
    finish(b, 1);
  };

  /* ---------- 瞭望台（past：九年前腐朽的木栏杆、夜空） ---------- */
  S.balcony = function (b, v) {
    var past = v === 'past';
    if (past) {
      b.vgrad(0, 0, 480, 160, ['#05060e', '#0a0c1a', '#121628', '#1a2034']);
      var rng = X.rng('stars');
      for (var i = 0; i < 160; i++) { var sx = rng() * 480, sy = rng() * 150; b.px(sx, sy, rng() < 0.2 ? '#ffffff' : '#8a8aa8'); }
      // 鸦之星
      var cx = 300, cy = 40;
      b.px(cx, cy, '#ffffff'); b.hl(cx - 3, cy, 7, '#d8e0ff'); b.vl(cx, cy - 3, 7, '#d8e0ff'); b.px(cx - 1, cy - 1, '#a8b0e0'); b.px(cx + 1, cy + 1, '#a8b0e0');
      b.light(cx, cy, 14, 14, '#a8b8ff', 1);
      sea(b, 150, 196, 7, [C('#04060c'), C('#080c18'), C('#0c1422'), C('#121c2e'), C('#1c2a40'), C('#2a3a54')]);
    } else {
      sky(b, 0, 0, 480, 150, 6);
      sea(b, 150, 196, 8);
    }
    // 远处神社所在的山丘
    var hc = past ? [C('#06080e'), C('#0c1018'), C('#121824')] : [C('#1e2230'), C('#262a3a'), C('#2e3446')];
    b.poly([60, 160, 110, 120, 150, 104, 180, 100, 210, 108, 250, 130, 300, 160], hc[1]);
    forest(b, 96, 260, 128, 14, hc[0], 8);
    b.rect(170, 92, 14, 10, hc[0]); b.poly([166, 94, 188, 94, 177, 86], hc[0]);
    // 缆索（从画面上方斜拉到铁环）
    b.line(240, 0, 414, 50, past ? '#2a2a30' : '#0c0a10'); b.line(241, 0, 415, 50, past ? '#1a1a20' : '#1e1c24');
    // 铁环（装在外伸的铁臂上）
    b.rect(424, 50, 52, 5, '#26262c'); b.hl(424, 50, 52, '#5a5a62');
    b.ring(416, 52, 12, 12, '#3a3a42', 3); b.ring(416, 52, 12, 12, '#6a6a74', 1);
    b.px(408, 44, '#9a9aa2'); b.rect(426, 48, 6, 9, '#3a3a42');
    if (!past) b.rect(412, 46, 8, 4, '#4a3a2a');
    // 左侧塔顶小屋与门
    var tw = [G.st1, G.st2, G.st3, G.st4, G.st5];
    stoneWall(b, 0, 60, 80, 140, tw, 16, 8, 191);
    b.poly([0, 60, 84, 60, 70, 40, 0, 40], C('#1e1a24'));
    door(b, 20, 82, 44, 100, { cols: rmp('#3e2616'), panels: 2 });
    // 地面
    floorStone(b, 200, [G.st0, G.st1, G.st2, G.st3, G.st4], 30, 192);
    // 栏杆
    if (!past) {
      var ir = '#1a1a20';
      b.rect(0, 178, 480, 4, ir); b.hl(0, 178, 480, '#5a5a64'); b.rect(0, 204, 480, 4, ir); b.hl(0, 204, 480, '#4a4a54');
      for (var x = 2; x < 480; x += 8) { b.vl(x, 182, 22, ir); b.vl(x + 1, 182, 22, '#3a3a44'); }
      for (var x2 = 0; x2 < 480; x2 += 64) { b.rect(x2, 172, 6, 38, '#24242a'); b.hl(x2, 172, 6, '#6a6a74'); b.ellipse(x2 + 3, 171, 4, 3, '#3a3a42'); }
    } else {
      // 腐朽的木栏杆，中间一段断裂
      var wc = [C('#1a120c'), C('#2a1e14'), C('#3a2a1c'), C('#4a3624')];
      for (var x3 = 0; x3 < 480; x3 += 10) {
        if (x3 > 220 && x3 < 290) continue;
        b.rect(x3, 184, 4, 22, wc[2]); b.vl(x3, 184, 22, wc[3]);
      }
      b.rect(0, 180, 222, 5, wc[2]); b.hl(0, 180, 222, wc[3]); b.rect(290, 180, 190, 5, wc[2]); b.hl(290, 180, 190, wc[3]);
      b.rect(0, 204, 480, 4, wc[1]);
      // 断口
      b.poly([222, 180, 236, 182, 230, 186, 222, 185], wc[2]); b.line(236, 182, 244, 192, wc[2]); b.line(237, 182, 246, 196, wc[1]);
      b.poly([290, 180, 280, 183, 284, 186, 290, 185], wc[2]); b.line(280, 183, 272, 194, wc[1]);
      b.px(244, 193, '#6a5a50'); b.px(246, 196, '#8a8a92'); b.px(272, 195, '#8a8a92');
      for (var sp = 0; sp < 30; sp++) b.px(hsh(sp, 1, 3) * 480, 184 + hsh(sp, 2, 3) * 22, '#0a0806');
      b.wash(0, 0, 480, 270, '#0a0c1a', 1);
    }
    finish(b, past ? 2 : 1);
  };

  /* ---------- 鸦天狗神社 ---------- */
  S.shrine = function (b) {
    sky(b, 0, 0, 480, 120, 9);
    forest(b, 0, 480, 120, 56, C('#141c1a'), 10, C('#1e2a26'));
    forest(b, 0, 480, 140, 40, C('#0e1412'), 11);
    // 地面：砂砾
    b.pat(0, 150, 480, 120, function (x, y) { var r = hsh(x, y, 4); return r < 0.2 ? C('#3a3832') : r < 0.85 ? C('#4a4840') : C('#5a5850'); });
    b.wash(0, 150, 480, 8, G.ink, 2, 0.7);
    // 拜殿
    var wc = rmp('#5a3a28');
    b.rect(210, 98, 172, 70, wc[2]);
    for (var px = 214; px < 380; px += 14) { b.vl(px, 98, 70, wc[1]); }
    b.rect(240, 112, 112, 52, C('#1a1210'));
    for (var lx = 242; lx < 352; lx += 6) b.vl(lx, 112, 52, wc[3]);
    for (var ly = 114; ly < 164; ly += 6) b.hl(240, ly, 112, wc[3]);
    b.rect(276, 100, 40, 12, C('#e8e0d0')); b.rect(278, 102, 36, 8, C('#c8b890'));
    // 屋顶（曲线唐破风）
    var rc = [C('#121418'), C('#1e2228'), C('#2a3038'), C('#3a424c')];
    b.poly([190, 100, 402, 100, 380, 70, 212, 70], rc[1]);
    b.poly([196, 100, 396, 100, 392, 104, 200, 104], rc[2]);
    b.poly([212, 70, 380, 70, 340, 50, 252, 50], rc[2]);
    for (var t = 0; t < 30; t++) { var xx = 200 + t * 6.5; b.vl(Math.round(xx), 72, 28, rc[0]); }
    b.hl(190, 100, 212, rc[3]); b.hl(212, 70, 168, rc[3]);
    b.rect(250, 46, 92, 5, rc[0]); b.poly([246, 46, 256, 46, 250, 40], rc[0]); b.poly([336, 46, 346, 46, 342, 40], rc[0]);
    b.ellipse(296, 60, 10, 7, rc[0]); b.circle(296, 60, 5, G.gd1); crow(b, 296, 60, 6, G.gd3);
    // 注连绳
    b.thick(236, 110, 356, 110, 3, C('#c8b080')); for (var sz = 250; sz < 350; sz += 20) { b.poly([sz, 112, sz + 6, 112, sz + 3, 124], C('#f0f0f0')); }
    // 台阶与赛钱箱
    b.rect(256, 164, 80, 6, G.st3); b.hl(256, 164, 80, G.st5); b.rect(250, 170, 92, 6, G.st2); b.hl(250, 170, 92, G.st4);
    b.rect(282, 152, 28, 12, wc[1]); for (var sb = 284; sb < 308; sb += 3) b.vl(sb, 153, 4, wc[3]);
    floorShadow(b, 196, 168, 200, 6);
    // 缆索起点（滑轮柱）
    b.rect(174, 30, 6, 130, WD[2]); b.vl(174, 30, 130, WD[4]);
    b.rect(160, 34, 34, 5, WD[3]); b.hl(160, 34, 34, WD[5]);
    b.circle(177, 24, 9, C('#3a3a42')); b.circle(177, 24, 7, C('#5a5a62')); b.circle(177, 24, 2, C('#1a1a20')); b.ring(177, 24, 9, 9, C('#1a1a20'));
    b.line(177, 15, 480, 4, '#0c0a10'); b.line(177, 16, 480, 5, '#1e1c24');
    b.line(177, 33, 166, 120, '#2a2420');
    // 鸟居
    var tr = [C('#3a0c0c'), C('#5a1410'), C('#7a2418'), C('#9a3420'), C('#b04a30')];
    b.rect(38, 64, 10, 126, tr[2]); b.vl(38, 64, 126, tr[3]); b.vl(47, 64, 126, tr[1]);
    b.rect(108, 64, 10, 126, tr[2]); b.vl(108, 64, 126, tr[3]); b.vl(117, 64, 126, tr[1]);
    b.rect(30, 74, 96, 7, tr[2]); b.hl(30, 74, 96, tr[3]); b.hl(30, 80, 96, tr[0]);
    b.poly([20, 46, 136, 46, 132, 56, 24, 56], tr[2]); b.hl(24, 47, 108, tr[4]);
    b.poly([16, 38, 140, 38, 136, 46, 20, 46], C('#1a1214'));
    b.rect(74, 56, 8, 18, tr[1]); b.rect(70, 58, 16, 12, C('#2a2020')); b.rect(72, 60, 12, 8, C('#c8b080'));
    b.rect(36, 186, 14, 6, G.st3); b.rect(106, 186, 14, 6, G.st3);
    b.speckle(38, 64, 80, 126, C('#3a2a24'), 0.03, X.rng('torii-wear'), true);
    // 仓库（白墙土藏）
    b.rect(404, 112, 64, 82, C('#b8b0a4')); b.vl(404, 112, 82, C('#d8d0c4')); b.vl(467, 112, 82, C('#8a8278'));
    b.rect(404, 172, 64, 22, C('#3a3438')); for (var ky = 174; ky < 194; ky += 5) b.hl(404, ky, 64, C('#5a5458'));
    b.poly([396, 114, 476, 114, 466, 96, 406, 96], rc[1]); b.hl(396, 114, 80, rc[3]);
    b.rect(424, 132, 24, 40, C('#2a2420')); b.frame(424, 132, 24, 40, C('#1a1414')); b.rect(434, 148, 4, 6, G.gd2);
    b.speckle(404, 112, 64, 60, C('#8a8278'), 0.04, X.rng('kura'));
    // 石阶（前景左下，向下）
    for (var st = 0; st < 7; st++) {
      var sy = 192 + st * 11, sx = 60 - st * 4, sw = 116 + st * 8;
      b.rect(sx, sy, sw, 5, G.st4); b.hl(sx, sy, sw, G.st6); b.rect(sx, sy + 5, sw, 6, G.st2);
    }
    // 池塘
    b.ellipse(350, 210, 54, 18, G.st2); b.ellipse(350, 210, 50, 15, C('#141e22')); b.ellipse(346, 207, 40, 10, C('#1e2c30'));
    b.hl(320, 204, 20, C('#4a5a62')); b.hl(352, 212, 16, C('#3a4a52'));
    for (var rk = 0; rk < 7; rk++) { var a = rk / 7 * Math.PI * 2; b.ellipse(350 + Math.cos(a) * 52, 210 + Math.sin(a) * 17, 6, 4, G.st3); b.px(348 + Math.cos(a) * 52, 208 + Math.sin(a) * 17, G.st5); }
    // 石灯笼
    b.rect(160, 160, 12, 30, G.st3); b.rect(156, 150, 20, 10, G.st4); b.rect(160, 152, 12, 6, C('#2a2420')); b.poly([152, 150, 180, 150, 166, 140], G.st4);
    finish(b, 1);
  };

  /* ---------- 北侧海滩（tracks：一行脚印与手杖孔） ---------- */
  S.beach = function (b, v) {
    sky(b, 0, 0, 480, 120, 11);
    // 悬崖（后方与右侧）
    var rc = [C('#1a1a22'), C('#24242e'), C('#2e2e3a'), C('#3a3a48'), C('#4a4a5a')];
    rock(b, [0, 96, 40, 90, 100, 100, 160, 96, 220, 104, 296, 92, 296, 170, 0, 170], rc, 31, true, 16, 34);
    rock(b, [296, 30, 340, 20, 380, 36, 440, 34, 480, 40, 480, 168, 296, 168], rc, 32, true, 14, 40);
    // 塔顶（越过悬崖露出）
    var tc = [C('#1e1a24'), C('#2a2532'), C('#363040'), C('#443e50'), C('#544e62')];
    b.clip(0, 0, 480, 38);
    crowTower(b, 408, 14, 60, 30, tc, { roofH: 18 });
    b.clip();
    b.line(0, 0, 394, 14, '#0c0a10');
    // 左侧石阶
    for (var st = 0; st < 9; st++) {
      var sy = 100 + st * 9, sx = 2 + st * 2;
      b.rect(sx, sy, 54 - st, 4, G.st4); b.hl(sx, sy, 54 - st, G.st6); b.rect(sx, sy + 4, 54 - st, 5, G.st2);
    }
    // 沙滩
    var sd = [C('#4a4436'), C('#5a5442'), C('#6a634e'), C('#7a725a'), C('#8a8268')];
    b.pat(0, 166, 480, 52, function (x, y) {
      var t = (y - 166) / 52;
      var n = Math.sin(x * 0.08 + y * 0.5) * 0.3 + hsh(x, y, 6) * 0.6;
      var idx = Math.floor(3.2 - t * 1.8 + n);
      return sd[Math.max(0, Math.min(4, idx))];
    });
    b.wash(0, 166, 480, 4, G.ink, 2, 0.6);
    // 岩石
    rock(b, [16, 216, 22, 196, 40, 186, 60, 190, 78, 204, 76, 220], [G.st0, G.st1, G.st2, G.st3, G.st4], 33);
    rock(b, [430, 206, 444, 194, 466, 196, 474, 212], [G.st0, G.st1, G.st2, G.st3, G.st4], 34);
    // 湿沙与水线
    b.pat(0, 206, 480, 22, function (x, y) {
      var edge = 214 + Math.sin(x * 0.05) * 3 + Math.sin(x * 0.13) * 1.5;
      if (y < edge - 6) return 0;
      if (y < edge) return bay(x, y) < 8 ? C('#4a4638') : C('#3e3a30');
      if (y < edge + 2) return C('#c8ccd0');
      return 0;
    });
    // 海（前景）
    b.pat(0, 216, 480, 54, function (x, y) {
      var edge = 216 + Math.sin(x * 0.05) * 3 + Math.sin(x * 0.13) * 1.5;
      if (y < edge + 2) return 0;
      var w = Math.sin(x * 0.11 + y * 0.6) + Math.sin(x * 0.03 - y * 0.25);
      if (y < edge + 4) return C('#8a98a8');
      if (w > 1.5) return G.sea4; if (w > 1.0 && bay(x, y) < 8) return G.sea3; if (w < -1.3) return G.sea0;
      return y < 236 ? G.sea2 : G.sea1;
    });
    if (v === 'tracks') {
      // 从石阶走向水线的脚印 + 右侧手杖孔
      var n = 13;
      for (var i = 0; i < n; i++) {
        var t = i / (n - 1);
        var x = 64 + t * 236, y = 172 + t * 38;
        var side = i % 2 ? 1 : -1;
        var fx = Math.round(x), fyy = Math.round(y + side * 2);
        var sc = 1 + t * 0.6;
        b.ellipse(fx, fyy, 3.2 * sc, 1.6 * sc, C('#2e2a20')); b.ellipse(fx + 0.5, fyy + 0.3, 2 * sc, 1 * sc, C('#24201a'));
        b.ellipse(fx - 4 * sc, fyy + 0.4, 1.5 * sc, 1.2 * sc, C('#2e2a20'));
        b.hl(fx - 3, fyy - Math.round(1.6 * sc), 5, C('#9a9278'));
        if (i % 2 === 0) { var cx = Math.round(x + 7 + t * 3), cy = Math.round(y - 4); b.rect(cx, cy, 2, 2, C('#1a160f')); b.hl(cx, cy - 1, 2, C('#9a9278')); }
      }
    }
    b.light(200, 60, 240, 80, '#8a8aa8', 1);
    finish(b, 1);
  };

  /* ---------- 海蚀洞 ---------- */
  S.seacave = function (b) {
    var rc = [C('#0a0a10'), C('#14141c'), C('#1c1c26'), C('#262632'), C('#323240')];
    // 洞壁
    rock(b, [0, 0, 480, 0, 480, 270, 0, 270], rc, 41, false, 46, 30);
    // 洞口：外面的天与海，只画在洞口形状内
    var mouth = [184, 100, 188, 66, 202, 38, 224, 24, 250, 21, 274, 30, 290, 50, 297, 78, 298, 100];
    var out = new X.Buf(480, 270);
    sky(out, 176, 14, 128, 62, 13);
    sea(out, 76, 104, 14);
    var mk = new X.Buf(480, 270); mk.poly(mouth, 1);
    b.pat(176, 14, 128, 92, function (x, y) { var k = y * 480 + x; return mk.d[k] ? out.d[k] : 0; });
    // 洞口边缘（亮边）
    for (var e = 0; e < mouth.length - 2; e += 2) b.line(mouth[e], mouth[e + 1], mouth[e + 2], mouth[e + 3], rc[4]);
    b.hl(184, 100, 115, C('#5a6a80'));
    // 洞口边缘高光与外光
    b.light(242, 64, 120, 110, '#6a7a98', 2);
    // 钟乳石
    var rng = X.rng('stal');
    for (var i = 0; i < 26; i++) {
      var x = rng() * 480, len = 8 + rng() * 28, w = 3 + rng() * 6;
      if (x > 176 && x < 304) len *= 0.4;
      b.poly([x - w, 0, x + w, 0, x + 0.5, len], rc[2]);
      b.line(x - w * 0.4, 1, x, len - 2, rc[4]);
      b.px(x, len, '#6a7a98');
    }
    // 右侧岩缝通道
    b.poly([404, 58, 428, 54, 448, 84, 456, 150, 466, 200, 412, 200, 410, 140], rc[0]);
    b.poly([416, 70, 430, 64, 440, 100, 446, 194, 424, 194, 418, 120], C('#030305'));
    b.line(429, 56, 452, 198, rc[4]); b.line(428, 58, 450, 198, rc[3]);
    b.light(436, 130, 30, 70, '#2a2a40', 1);
    // 岩架 + 毛毯
    rock(b, [12, 150, 40, 144, 100, 146, 146, 150, 150, 168, 140, 186, 20, 186, 10, 170], [rc[1], rc[2], rc[3], rc[4], C('#42425a')], 43);
    var bl = rmp('#6a4a3a');
    b.poly([36, 147, 100, 143, 104, 151, 98, 156, 40, 156], bl[3]); b.poly([40, 151, 102, 148, 104, 154, 42, 156], bl[2]);
    for (var k = 42; k < 100; k += 7) b.vl(k, 146, 9, bl[1]);
    b.hl(38, 146, 60, bl[4]); b.rect(84, 140, 14, 6, bl[4]); b.hl(84, 140, 14, bl[5]);
    b.rect(110, 141, 8, 5, '#c8c0b0'); b.px(111, 141, '#ffffff'); b.rect(124, 143, 6, 3, '#e8e0d0'); b.px(132, 145, '#d8a060');
    // 潮池
    b.ellipse(240, 204, 92, 24, rc[0]);
    b.ellipse(240, 204, 88, 21, G.sea1); b.ellipse(236, 200, 70, 14, G.sea2);
    b.hl(196, 196, 30, G.sea4); b.hl(252, 206, 24, G.sea3); b.hl(214, 211, 14, G.sea3);
    b.light(240, 200, 90, 24, '#5a7a9a', 1);
    // 地面岩石
    rock(b, [0, 186, 160, 186, 150, 214, 0, 232], rc, 44);
    rock(b, [330, 200, 480, 196, 480, 270, 320, 270], rc, 45);
    rock(b, [0, 232, 150, 216, 340, 234, 320, 270, 0, 270], rc, 46);
    // 湿润反光
    var r2 = X.rng('wet');
    for (var j = 0; j < 90; j++) { var wx = r2() * 480, wy = r2() * 270; if (b.get(wx | 0, wy | 0) === rc[3] || b.get(wx | 0, wy | 0) === rc[4]) b.hl(wx, wy, 2, '#5a6a88'); }
    finish(b, 3);
  };

  /* ---------- 标题 ---------- */
  S.title = function (b) {
    b.vgrad(0, 0, 480, 270, ['#05050c', '#0a0a16', '#120e20', '#1c1426', '#24182a']);
    var rng = X.rng('title-stars');
    for (var i = 0; i < 120; i++) b.px(rng() * 480, rng() * 170, rng() < 0.15 ? '#c8c8e0' : '#4a4a68');
    // 日蚀的月亮：黑盘 + 金色光环
    var cx = 300, cy = 82, r = 34;
    b.light(cx, cy, r * 3.2, r * 3.2, '#3a2a18', 2);
    b.light(cx, cy, r * 2, r * 2, '#8a6a30', 2);
    b.pat(cx - r - 14, cy - r - 14, (r + 14) * 2, (r + 14) * 2, function (x, y) {
      var dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.sqrt(dx * dx + dy * dy);
      var a = Math.atan2(dy, dx);
      var ray = 3 + Math.abs(Math.sin(a * 7)) * 5 + Math.abs(Math.sin(a * 13 + 1)) * 3;
      if (d < r) return 0;
      if (d < r + 1.5) return C('#fff4d0');
      if (d < r + 3) return C('#f0d080');
      if (d < r + ray && bay(x, y) < 12 - (d - r) * 1.2) return C('#c9a25a');
      if (d < r + ray + 3 && bay(x, y) < 3) return C('#8a6a30');
      return 0;
    });
    b.circle(cx, cy, r, '#030306');
    b.ring(cx, cy, r, r, '#1a1410');
    // 云
    b.ellipse(120, 120, 120, 8, '#1a1424'); b.ellipse(380, 140, 140, 6, '#1a1424'); b.ellipse(200, 150, 90, 5, '#20182a');
    // 地平线：海与岛
    b.rect(0, 200, 480, 70, '#06060c');
    for (var w = 0; w < 50; w++) b.hl(rng() * 480, 202 + rng() * 60, 3 + rng() * 10, rng() < 0.3 ? '#2a2a3a' : '#141420');
    b.light(cx, 210, 80, 30, '#6a5028', 1);
    // 月蚀馆与鸦之塔剪影
    var sil = C('#020204');
    b.poly([0, 205, 40, 196, 90, 180, 140, 172, 200, 168, 260, 166, 330, 172, 380, 186, 440, 196, 480, 202, 480, 210, 0, 210], sil);
    mansion(b, 150, 148, 1.0, sil, '#3a2a10', 0.35);
    var tx = 330;
    b.rect(tx - 13, 70, 26, 110, sil); b.rect(tx - 17, 66, 34, 5, sil);
    for (var bx = tx - 16; bx < tx + 17; bx += 3) b.vl(bx, 58, 8, sil); b.hl(tx - 17, 57, 34, sil);
    b.poly([tx - 12, 58, tx + 12, 58, tx, 20], sil); b.vl(tx, 10, 10, sil); crow(b, tx + 1, 9, 6, sil);
    b.circle(tx, 92, 7, '#1a1408'); b.circle(tx, 92, 6, '#3a2a14'); b.line(tx, 92, tx, 87, sil); b.line(tx, 92, tx + 3, 94, sil);
    b.rect(tx - 4, 112, 8, 12, '#4a3418');
    // 乌鸦群
    var crows = [[80, 60, 5, 0], [110, 44, 4, 1], [140, 70, 3, 0], [180, 36, 6, 1], [200, 58, 3, 0], [400, 50, 5, 1], [430, 76, 4, 0], [250, 30, 3, 1], [372, 110, 3, 0], [60, 96, 3, 1], [452, 30, 3, 0]];
    for (var c = 0; c < crows.length; c++) flyingCrow(b, crows[c][0], crows[c][1], crows[c][2], '#000000', crows[c][3]);
    crow(b, 360, 98, 14, '#000000', 'spread');
    finish(b, 1);
  };


  /* ---------- 宵鸦岛地图 ---------- */
  S.__map = function (b) {
    var A = DM.AREAS || {};
    function node(k, dx, dy) { var a = A[k] && A[k].map; return a ? [a[0] + (dx || 0), a[1] + (dy || 0)] : [240, 135]; }
    // 海
    var seaC = [C('#0a1020'), C('#0e1528'), C('#121a30'), C('#1a2440'), C('#26345a')];
    b.vgrad(0, 0, 480, 270, [seaC[2], seaC[1], seaC[1], seaC[0]]);
    b.pat(0, 0, 480, 270, function (x, y) {
      if ((y % 10) === 0 && Math.sin(x * 0.4 + y) > 0.6) return seaC[3];
      if ((y % 10) === 5 && Math.sin(x * 0.4 + y * 2 + 2) > 0.75) return seaC[2];
      return 0;
    });
    // 岛轮廓：按地理关键点（北岸悬崖、塔下海滩、东侧海蚀洞、西南码头）再加细碎抖动
    var key = [60, 150, 52, 112, 62, 72, 82, 42, 110, 20, 150, 12, 198, 18, 246, 30, 286, 48, 318, 50, 340, 38, 362, 24, 400, 18, 424, 26,
      442, 50, 454, 82, 448, 104, 444, 120, 454, 142, 442, 172, 412, 200, 372, 218, 330, 228, 280, 234, 230, 238, 178, 240, 132, 240, 106, 232,
      82, 218, 66, 192];
    var cx = 252, cy = 128, pts = [];
    var nk = key.length / 2;
    for (var i = 0; i < nk; i++) {
      var x0 = key[i * 2], y0 = key[i * 2 + 1], x1 = key[((i + 1) % nk) * 2], y1 = key[((i + 1) % nk) * 2 + 1];
      for (var sgi = 0; sgi < 4; sgi++) {
        var u = sgi / 4, jit = sgi ? (hsh(i, sgi, 77) - 0.5) * 6 : 0;
        var nx = -(y1 - y0), ny = x1 - x0, nl = Math.sqrt(nx * nx + ny * ny) || 1;
        pts.push(x0 + (x1 - x0) * u + nx / nl * jit, y0 + (y1 - y0) * u + ny / nl * jit);
      }
    }
    // 浅滩
    var shoal = [];
    for (var j = 0; j < pts.length; j += 2) shoal.push(cx + (pts[j] - cx) * 1.05, cy + (pts[j + 1] - cy) * 1.07);
    b.poly(shoal, seaC[3]);
    var land = new X.Buf(480, 270);
    land.poly(pts, 1);
    var L = land.d;
    var gr = [C('#141e18'), C('#1a281f'), C('#223226'), C('#2a3c2c'), C('#344834'), C('#4a5a40')];
    b.pat(0, 0, 480, 270, function (x, y) {
      var k = y * 480 + x;
      if (!L[k]) return 0;
      var e = 0;
      if (!L[k - 1] || !L[k + 1] || !L[k - 480] || !L[k + 480]) return C('#c9b88a');
      if (!L[k - 2] || !L[k + 2] || !L[k - 960] || !L[k + 960]) e = 1;
      var n = hsh(x >> 4, y >> 4, 3) * 1.4 + hsh(x >> 3, y >> 3, 5) * 0.6 + (bay(x, y) / 16) * 0.5;
      var idx = n > 1.55 ? 3 : n > 0.8 ? 2 : 1;
      if (e) return C('#6a5e48');
      return gr[idx];
    });
    // 森林符号
    var rng = X.rng('mapforest');
    for (var t = 0; t < 420; t++) {
      var x = 40 + rng() * 420, y = 10 + rng() * 240;
      if (!land.get(x | 0, y | 0) || !land.get((x | 0) + 4, (y | 0) + 4) || !land.get((x | 0) - 4, (y | 0) - 4)) continue;
      var near = false;
      for (var kk in A) { var p = A[kk].map; if (Math.abs(p[0] - x) < 24 && Math.abs(p[1] - y) < 18) near = true; }
      if (near) continue;
      b.poly([x - 2.5, y + 2, x + 2.5, y + 2, x + 0.5, y - 4], gr[0]);
      b.px(x, y - 2, gr[4]); b.px(x - 1, y, gr[3]);
    }
    // 山丘（神社）等高线
    var sh = node('shrine');
    for (var c = 0; c < 4; c++) b.ring(sh[0] + 6, sh[1] + 10, 34 - c * 7, 20 - c * 4, c % 2 ? C('#5a5a40') : C('#4a4a34'));
    // 北侧悬崖阴影线
    for (var q = 0; q < pts.length; q += 2) {
      var px = pts[q], py = pts[q + 1];
      if (py < 60 && px > 270 && px < 350) { b.line(px, py, px + 1, py + 6, C('#6a6a74')); b.line(px + 2, py + 1, px + 3, py + 5, C('#3a3a40')); }
    }
    // 道路
    var road = C('#8a7a58'), road2 = C('#5a4e38');
    function path(a1, a2, bend) {
      var x0 = a1[0], y0 = a1[1], x1 = a2[0], y1 = a2[1];
      var mx = (x0 + x1) / 2 + bend, my = (y0 + y1) / 2 - bend * 0.5;
      for (var s = 0; s <= 40; s++) {
        var u = s / 40, iu = 1 - u;
        var xx = iu * iu * x0 + 2 * iu * u * mx + u * u * x1, yy = iu * iu * y0 + 2 * iu * u * my + u * u * y1;
        if (s % 3 !== 2) { b.rect(Math.round(xx), Math.round(yy), 2, 1, road); b.px(Math.round(xx), Math.round(yy) + 1, road2); }
      }
    }
    path(node('pier'), node('mansion'), 10); path(node('mansion'), node('courtyard'), 0); path(node('courtyard'), node('tower'), 4);
    path(node('mansion'), node('judgment'), -8); path(node('judgment'), node('shrine'), 6); path(node('tower'), node('beach'), -10);
    path(node('mansion'), node('hut'), -12); path(node('hut'), node('seacave'), 8);
    // 飞鸦祭缆索：神社 → 塔顶
    var s0 = node('shrine', 10, -4), t0 = node('tower', 0, -6);
    for (var cs = 0; cs <= 60; cs++) { var u2 = cs / 60; if (cs % 2 === 0) b.px(Math.round(s0[0] + (t0[0] - s0[0]) * u2), Math.round(s0[1] + (t0[1] - s0[1]) * u2 + Math.sin(u2 * Math.PI) * 6), C('#c8b080')); }
    // 地标
    var ink = C('#0a0a10'), stone = C('#8a8494'), stone2 = C('#5a5464'), roof = C('#3a2a3a'), gold = C('#c9a25a');
    // 码头
    var pr = node('pier');
    b.rect(pr[0] - 12, pr[1] + 4, 6, 18, C('#7a5a38')); b.rect(pr[0] - 22, pr[1] + 18, 26, 4, C('#7a5a38'));
    b.rect(pr[0] + 4, pr[1] - 4, 12, 9, roof); b.rect(pr[0] + 5, pr[1] - 3, 10, 7, C('#5a4030'));
    // 月蚀馆（主楼 + 东西翼）
    var mn = node('mansion');
    b.rect(mn[0] - 34, mn[1] - 8, 68, 16, stone2); b.rect(mn[0] - 34, mn[1] - 26, 14, 34, stone2); b.rect(mn[0] + 20, mn[1] - 26, 14, 34, stone2);
    b.rect(mn[0] - 33, mn[1] - 7, 66, 6, stone); b.rect(mn[0] - 33, mn[1] - 25, 12, 6, stone); b.rect(mn[0] + 21, mn[1] - 25, 12, 6, stone);
    b.frame(mn[0] - 34, mn[1] - 8, 68, 16, ink); b.frame(mn[0] - 34, mn[1] - 26, 14, 34, ink); b.frame(mn[0] + 20, mn[1] - 26, 14, 34, ink);
    for (var w = 0; w < 8; w++) b.px(mn[0] - 28 + w * 8, mn[1] + 2, C(G.cl1));
    // 中庭（喷泉与温室）
    var cyd = node('courtyard');
    b.rect(cyd[0] - 14, cyd[1] - 8, 28, 16, C('#3a4038')); b.frame(cyd[0] - 14, cyd[1] - 8, 28, 16, ink);
    b.circle(cyd[0] - 4, cyd[1] + 1, 3, C('#5a7a8a')); b.rect(cyd[0] + 4, cyd[1] - 5, 8, 6, C('#7a9aaa'));
    // 鸦之塔
    var tw = node('tower');
    b.circle(tw[0], tw[1], 7, ink); b.circle(tw[0], tw[1], 6, stone2); b.circle(tw[0], tw[1], 4, stone); b.circle(tw[0], tw[1], 1.5, gold);
    // 审判厅（圆厅）
    var jd = node('judgment');
    b.circle(jd[0], jd[1], 10, ink); b.circle(jd[0], jd[1], 9, stone2); b.ring(jd[0], jd[1], 6, 6, stone); b.circle(jd[0], jd[1], 2, C('#9a2030'));
    // 神社（鸟居 + 拜殿）
    b.rect(sh[0] - 6, sh[1] - 5, 12, 9, roof); b.frame(sh[0] - 6, sh[1] - 5, 12, 9, ink); b.hl(sh[0] - 6, sh[1] - 2, 12, C('#5a3a2a'));
    b.rect(sh[0] - 3, sh[1] + 8, 1, 6, C('#b03020')); b.rect(sh[0] + 3, sh[1] + 8, 1, 6, C('#b03020')); b.hl(sh[0] - 5, sh[1] + 8, 11, C('#b03020')); b.hl(sh[0] - 4, sh[1] + 10, 9, C('#b03020'));
    // 北侧海滩（沙）
    var bc = node('beach');
    b.pat(bc[0] - 34, bc[1] - 20, 68, 26, function (x, y) {
      var k = y * 480 + x; if (!L[k]) return 0;
      var dd = 0; for (var s3 = 1; s3 < 9; s3++) if (!L[k - s3 * 480]) { dd = s3; break; }
      if (!dd) return 0;
      return dd < 3 ? C('#d8c8a0') : (bay(x, y) < 10 ? C('#b8a680') : C('#9a8a68'));
    });
    // 海蚀洞
    var sc2 = node('seacave');
    b.ellipse(sc2[0], sc2[1], 9, 6, C('#2a2a30')); b.ellipse(sc2[0] + 1, sc2[1], 6, 4, ink); b.px(sc2[0] - 6, sc2[1] - 4, C('#6a6a72'));
    // 旧园丁小屋
    var ht = node('hut');
    b.rect(ht[0] - 6, ht[1] - 4, 12, 8, C('#5a4030')); b.poly([ht[0] - 8, ht[1] - 4, ht[0] + 8, ht[1] - 4, ht[0], ht[1] - 10], roof); b.frame(ht[0] - 6, ht[1] - 4, 12, 8, ink);
    // 罗盘
    var rx0 = 448, ry0 = 236;
    b.ring(rx0, ry0, 14, 14, gold); b.ring(rx0, ry0, 11, 11, C('#6a5028'));
    b.poly([rx0 - 3, ry0, rx0 + 3, ry0, rx0 + 0.5, ry0 - 13], gold); b.poly([rx0 - 3, ry0, rx0 + 3, ry0, rx0 + 0.5, ry0 + 13], C('#6a5028'));
    b.poly([rx0, ry0 - 3, rx0, ry0 + 3, rx0 + 13, ry0 + 0.5], C('#6a5028')); b.poly([rx0, ry0 - 3, rx0, ry0 + 3, rx0 - 13, ry0 + 0.5], C('#6a5028'));
    b.px(rx0, ry0, C('#fff0c0'));
    // 外框
    b.frame(2, 2, 476, 266, C('#6a5028')); b.frame(4, 4, 472, 262, C('#2a2014'));
    for (var cr = 0; cr < 4; cr++) { var ccx = cr % 2 ? 470 : 9, ccy = cr > 1 ? 261 : 9; b.rect(ccx - 3, ccy - 3, 6, 6, gold); b.px(ccx - 1, ccy - 1, C('#fff0c0')); }
    // 远处的乌鸦
    flyingCrow(b, 40, 40, 3, C('#05050a')); flyingCrow(b, 58, 30, 2, C('#05050a'), 1); flyingCrow(b, 430, 180, 3, C('#05050a'), 1);
    finish(b, 1);
  };

  BG.draw = function (id, variant) {
    var b = new X.Buf(480, 270);
    var fn = S[id];
    if (!fn) fn = S.__unknown;
    fn(b, variant || '', id);
    return b;
  };
  BG.map = function () { var b = new X.Buf(480, 270); if (S.__map) S.__map(b); else b.fill('#101820'); return b; };
  BG.S = S;
  BG.H = { floorBoards: floorBoards, floorStone: floorStone, wallpaper: wallpaper, wainscot: wainscot, sky: sky, sea: sea, window_: window_, door: door, picFrame: picFrame, crow: crow, flyingCrow: flyingCrow, candle: candle, sconce: sconce, bookshelf: bookshelf, room: room, finish: finish, stoneWall: stoneWall, plankWall: plankWall, curtains: curtains, rug: rug, runner: runner, floorShadow: floorShadow, chandelier: chandelier, grandClock: grandClock, panel: panel, rmp: rmp, hsh: hsh, bay: bay, G: G, WD: WD, ST: ST, mix: mix, ceiling: ceiling, tableTop: tableTop, floorChecker: floorChecker };
})(typeof window !== 'undefined' ? window : globalThis);
