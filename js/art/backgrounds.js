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
    // 小提琴盒（地上）
    var vc = rmp('#2a1a12');
    b.poly([252, 200, 262, 192, 276, 194, 288, 190, 312, 192, 318, 198, 312, 206, 288, 208, 276, 204, 262, 208], vc[3]);
    b.poly([254, 199, 263, 193, 276, 195, 288, 191, 311, 193, 316, 197], vc[4]);
    b.hl(262, 200, 50, vc[2]);
    b.rect(282, 198, 8, 3, G.gd2); b.px(272, 199, G.gd3); b.px(300, 199, G.gd3);
    floorShadow(b, 252, 206, 68, 3);
    sconce(b, 150, 84); sconce(b, 300, 84);
    finish(b);
  };

  /* ---------- 地下酒窖 ---------- */
  function brassPlate(b, x, y, w, h, ch) {
    b.line(x + w / 2, y - 6, x + 6, y, '#5a4a30'); b.line(x + w / 2, y - 6, x + w - 6, y, '#5a4a30');
    b.rect(x + w / 2 - 1, y - 7, 2, 2, '#2a2a2a');
    b.rect(x, y, w, h, G.gd1); b.rect(x + 1, y + 1, w - 2, h - 2, G.gd2); b.hl(x + 1, y + 1, w - 2, G.gd4); b.vl(x + 1, y + 1, h - 2, G.gd4);
    b.hl(x + 2, y + h - 2, w - 3, G.gd0);
    b.px(x + 3, y + 3, G.gd5); b.px(x + w - 4, y + h - 4, G.gd0);
    var gx = Math.round(x + w / 2 - 3.5), gy = Math.round(y + h / 2 - 3.5);
    X.han(b, gx + 1, gy + 1, ch, G.gd4);
    X.han(b, gx, gy, ch, G.gd0);
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
  S.cellar = function (b) {
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
    brassPlate(b, 50, 23, 36, 13, '西');
    brassPlate(b, 394, 23, 36, 13, '东');
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
    b.light(175, 136, 26, 16, G.cl1, 1);
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
      // 烧塌的床：焦黑的框与坍塌的床垫
      var ash = [G.ash0, G.ash1, G.ash2, G.ash3];
      b.poly([298, 150, 306, 146, 306, 214, 298, 214], ash[1]);
      b.poly([306, 196, 340, 182, 400, 192, 440, 186, 468, 200, 468, 214, 306, 214], ash[0]);
      b.poly([316, 192, 350, 178, 380, 186, 420, 180, 452, 192, 440, 198, 380, 196, 330, 200], ash[2]);
      for (var e = 0; e < 40; e++) { var ex = 310 + hsh(e, 1, 9) * 150, ey = 182 + hsh(e, 2, 9) * 20; b.px(ex, ey, e % 5 ? ash[3] : '#8a3018'); }
      b.thick(306, 176, 468, 188, 2, ash[1]); b.thick(462, 170, 466, 214, 3, ash[1]);
      b.line(330, 186, 352, 206, ash[0]); b.line(400, 184, 380, 210, ash[0]);
      b.px(402, 194, '#c05020'); b.px(352, 196, '#c05020');
      floorShadow(b, 296, 212, 176, 4);
    }
    if (burnt) {
      // 墙面熏黑：从床向上扩散的煤烟
      b.pat(0, 0, 480, fy, function (x, y) {
        var dx = (x - 380) / 150, dy = (y - 200) / 190;
        var r = dx * dx + dy * dy;
        if (r > 1) return 0;
        var t = (1 - r) * 3 + (bay(x, y) + 0.5) / 16 - 0.4;
        return 0;
      });
      b.light(380, 140, 170, 150, '#080606', 3);
      b.light(300, 120, 90, 120, '#120c0c', 2);
      b.wash(0, 0, 480, 270, '#1a1414', 1);
      // 焦痕与碎玻璃
      for (var s = 0; s < 18; s++) { var sx = 268 + hsh(s, 3, 2) * 68, sy = 40 + hsh(s, 4, 2) * 56; b.line(sx, sy, sx + 3, sy + 4, '#c8d0e0'); }
      b.rect(274, 44, 56, 48, '#0e0c10');
      for (var t2 = 0; t2 < 8; t2++) b.poly([274 + t2 * 7, 44, 281 + t2 * 7, 44, 277 + t2 * 7, 44 + 6 + (t2 % 3) * 5], '#5a6070');
      b.speckle(290, 196, 180, 40, '#0a0808', 0.15, X.rng('burnt-floor'));
      b.speckle(290, 200, 180, 30, '#3a2a24', 0.05, X.rng('burnt-floor2'));
      b.wash(290, 194, 190, 30, '#0a0808', 2, 0.7);
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
