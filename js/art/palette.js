/* DARK MOOD 像素美术 —— 调色板与颜色工具
 * 颜色在绘制层内部统一用 32 位整数（与 ImageData 的 Uint32 视图同字节序，含 alpha）。
 * 0 表示透明。
 */
(function (root) {
  var DM = root.DM = root.DM || {};
  var P = DM.Pal = {};

  var LE = new Uint8Array(new Uint32Array([0x0a0b0c0d]).buffer)[0] === 0x0d;
  P.LE = LE;

  function pack(r, g, b, a) {
    if (a === undefined) a = 255;
    r = r < 0 ? 0 : r > 255 ? 255 : r | 0;
    g = g < 0 ? 0 : g > 255 ? 255 : g | 0;
    b = b < 0 ? 0 : b > 255 ? 255 : b | 0;
    return LE ? (((a << 24) | (b << 16) | (g << 8) | r) >>> 0) : (((r << 24) | (g << 16) | (b << 8) | a) >>> 0);
  }
  function unpack(c) {
    if (LE) return [c & 255, (c >>> 8) & 255, (c >>> 16) & 255, (c >>> 24) & 255];
    return [(c >>> 24) & 255, (c >>> 16) & 255, (c >>> 8) & 255, c & 255];
  }
  P.pack = pack;
  P.unpack = unpack;

  var hexCache = {};
  function hexRGB(hex) {
    var h = hex.charAt(0) === '#' ? hex.slice(1) : hex;
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) n = 0x808080;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  P.hexRGB = hexRGB;
  /* 任意颜色描述 -> 整数 */
  P.c = function (v) {
    if (typeof v === 'number') return v;
    if (!v) return 0;
    var c = hexCache[v];
    if (c === undefined) { var a = hexRGB(v); c = hexCache[v] = pack(a[0], a[1], a[2], 255); }
    return c;
  };
  P.hex = function (c) {
    var a = unpack(P.c(c));
    return '#' + ((1 << 24) | (a[0] << 16) | (a[1] << 8) | a[2]).toString(16).slice(1);
  };

  /* ---------- HSL ---------- */
  function rgb2hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
    if (d > 1e-6) {
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return [h, s, l];
  }
  function hue2(p, q, t) {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  function hsl2rgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    s = s < 0 ? 0 : s > 1 ? 1 : s; l = l < 0 ? 0 : l > 1 ? 1 : l;
    if (s === 0) return [l * 255, l * 255, l * 255];
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    return [hue2(p, q, h + 1 / 3) * 255, hue2(p, q, h) * 255, hue2(p, q, h - 1 / 3) * 255];
  }
  P.rgb2hsl = rgb2hsl;
  P.hsl2rgb = hsl2rgb;

  function hueToward(h, target, amt) {
    var d = ((target - h + 540) % 360) - 180;
    if (Math.abs(d) < amt) return target;
    return h + (d > 0 ? amt : -amt);
  }

  /* 色相偏移的明暗：shift>0 变亮（偏暖黄），shift<0 变暗（偏蓝紫） */
  var adjCache = {};
  P.adj = function (v, dl, opt) {
    var key = v + '|' + dl + '|' + (opt || '');
    var r = adjCache[key];
    if (r !== undefined) return r;
    var c = P.c(v), a = unpack(c), hsl = rgb2hsl(a[0], a[1], a[2]);
    var h = hsl[0], s = hsl[1], l = hsl[2];
    var grey = s < 0.06;
    if (dl < 0) {
      var k = -dl;
      if (grey) { h = 255; s = Math.min(0.18, s + k * 0.45); }
      else { h = hueToward(h, 262, 70 * k); s = Math.min(1, s + 0.25 * k); }
      l = l - k * (l < 0.2 ? 0.55 : 1) * (opt === 'deep' ? 1.2 : 1);
      if (l < 0.03) l = 0.03;
    } else if (dl > 0) {
      if (grey) { h = 45; s = Math.min(0.12, s + dl * 0.15); }
      else { h = hueToward(h, 48, 40 * dl); s = Math.max(0, s - 0.08 * dl); }
      l = l + dl * (l < 0.2 ? 1.25 : 1);
      if (l > 0.97) l = 0.97;
    }
    var o = hsl2rgb(h, s, l);
    r = adjCache[key] = pack(o[0], o[1], o[2], 255);
    return r;
  };

  /* 材质色阶：hi2/hi/base/sh/sh2/line */
  var rampCache = {};
  P.ramp = function (hex) {
    if (rampCache[hex]) return rampCache[hex];
    var a = hexRGB(hex), l = rgb2hsl(a[0], a[1], a[2])[2];
    var dark = l < 0.22;
    var r = {
      hi2: P.adj(hex, dark ? 0.26 : 0.2),
      hi: P.adj(hex, dark ? 0.13 : 0.1),
      base: P.c(hex),
      sh: P.adj(hex, dark ? -0.06 : -0.12),
      sh2: P.adj(hex, dark ? -0.12 : -0.24),
      line: P.adj(hex, dark ? -0.2 : -0.42)
    };
    if (dark) {
      // 黑色材质：把阴影压成接近黑的冷色，避免与基色重叠
      r.sh = P.mix(r.base, P.c('#05040a'), 0.35);
      r.sh2 = P.mix(r.base, P.c('#05040a'), 0.6);
      r.line = P.c('#050409');
    }
    rampCache[hex] = r;
    return r;
  };

  var mixCache = new Map();
  P.mix = function (c1, c2, t) {
    if (typeof c1 !== 'number') c1 = P.c(c1);
    if (typeof c2 !== 'number') c2 = P.c(c2);
    var k2 = c2 * 1024 + Math.round(t * 1000);
    var m = mixCache.get(k2);
    if (!m) { m = new Map(); mixCache.set(k2, m); }
    var r = m.get(c1);
    if (r !== undefined) return r;
    var a = unpack(c1), b = unpack(c2);
    r = pack(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, 255);
    m.set(c1, r);
    return r;
  };
  /* 轮廓色：邻接像素压暗并偏冷 */
  var olCache = {};
  P.outlineOf = function (c) {
    var r = olCache[c];
    if (r !== undefined) return r;
    var a = unpack(c);
    var o = pack(a[0] * 0.28 + 10, a[1] * 0.24 + 6, a[2] * 0.3 + 16, 255);
    olCache[c] = o;
    return o;
  };

  /* ---------- 全局主色（哥特、阴郁） ---------- */
  P.G = {
    ink: '#07060c', black: '#0b0a12',
    night0: '#0d1020', night1: '#141a30', night2: '#1d2541', night3: '#2a3456',
    pur0: '#140f20', pur1: '#1e1630', pur2: '#2b2042', pur3: '#3c2e56', pur4: '#54436f', pur5: '#6f5f8a',
    st0: '#1a1822', st1: '#26232f', st2: '#36323f', st3: '#4a4555', st4: '#625b6e', st5: '#7e7689', st6: '#9c94a6', st7: '#bdb5c4',
    wd0: '#170e0b', wd1: '#24150f', wd2: '#341f15', wd3: '#46291b', wd4: '#5c3723', wd5: '#76492e', wd6: '#93603c', wd7: '#b27d52',
    red0: '#2a0710', red1: '#470b18', red2: '#7a1426', red3: '#9c2333', red4: '#be3e45',
    gd0: '#3a2a14', gd1: '#6a5028', gd2: '#9a7a40', gd3: '#c9a25a', gd4: '#e4c88a', gd5: '#f7ebc4',
    sky0: '#2c2b40', sky1: '#3b3a52', sky2: '#4c4a63', sky3: '#5f5b75', sky4: '#747088', sky5: '#8c879c', sky6: '#a8a2b4',
    sea0: '#0c1420', sea1: '#13202f', sea2: '#1b2d40', sea3: '#264055', sea4: '#38566c', sea5: '#5a7a8c',
    gr0: '#0c1410', gr1: '#132019', gr2: '#1b2d21', gr3: '#273e2c', gr4: '#37533a', gr5: '#4c6a48',
    sd0: '#3d362f', sd1: '#544a3e', sd2: '#6e6250', sd3: '#8a7c64', sd4: '#a6987c', sd5: '#c2b597',
    cl0: '#fff2c8', cl1: '#ffd77e', cl2: '#ffb44c', cl3: '#e8822e', cl4: '#b4501e',
    wh0: '#f4f1f7', wh1: '#dcd7e2', wh2: '#bab3c4', wh3: '#958da2',
    glassA: '#3d4a66', glassB: '#56668a', glassC: '#7d8db0',
    blood: '#5a0a12', ash0: '#151214', ash1: '#221d1f', ash2: '#332b2b', ash3: '#4a3f3b'
  };
  P.g = function (name) { return P.c(P.G[name] || name); };

  if (typeof module !== 'undefined' && module.exports) module.exports = P;
})(typeof window !== 'undefined' ? window : globalThis);
