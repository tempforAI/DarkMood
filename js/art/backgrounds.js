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

  // 透视地板：木板（沿 x 分条、向消失点汇聚）
  function floorBoards(b, y0, cols, bw, seed, vpy) {
    vpy = vpy || VPY;
    bw = bw || 22;
    var H = b.h;
    b.pat(0, y0, b.w, H - y0, function (x, y) {
      var u = VPX + (x + 0.5 - VPX) * (y0 - vpy) / (y + 0.5 - vpy);
      var k = Math.floor(u / bw), f = u / bw - k;
      var depth = (y - y0) / (H - y0);
      var r = hsh(k, 7, seed);
      var idx = 2 + (r < 0.33 ? 0 : r < 0.66 ? 1 : 0);
      // 木纹
      var gv = Math.sin(u * 0.9 + k * 3.1 + Math.sin(y * 0.15 + k) * 2) * 0.5 + 0.5;
      if (gv > 0.86 && bay(x, y) < 10) idx -= 1;
      // 拼缝
      var seamW = 0.05 + depth * 0.02;
      if (f < seamW) return cols[0];
      // 横向接缝（交错）
      var row = Math.floor(Math.log((y + 1 - vpy) / (y0 - vpy)) * 9 + hsh(k, 3, seed) * 3);
      var rowPrev = Math.floor(Math.log((y - vpy) / (y0 - vpy)) * 9 + hsh(k, 3, seed) * 3);
      if (row !== rowPrev && y > y0 + 1) return cols[1];
      if (f > 0.92 - depth * 0.05) idx -= 1;
      if (depth < 0.12 && bay(x, y) < 6) idx -= 1;
      return cols[Math.max(1, Math.min(cols.length - 1, idx))];
    });
    b.hl(0, y0, b.w, cols[0]);
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
  // 竖向木板墙
  function plankWall(b, x0, y0, w, h, cols, pw, seed) {
    pw = pw || 14;
    b.pat(x0, y0, w, h, function (x, y) {
      var k = Math.floor((x - x0) / pw), f = (x - x0) - k * pw;
      if (f === 0) return cols[0];
      var r = hsh(k, 5, seed), idx = r < 0.35 ? 1 : r < 0.8 ? 2 : 3;
      var gr = Math.sin((y + k * 37) * 0.08 + Math.sin(x * 0.7 + k) * 1.5);
      if (gr > 0.92) idx = Math.max(1, idx - 1);
      if (f === 1) idx = Math.min(cols.length - 1, idx + 1);
      if (f === pw - 1) idx = Math.max(1, idx - 1);
      if (hsh(x, y, seed + 9) < 0.015) idx = 0;
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
