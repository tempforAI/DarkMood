/* 核心工具：舞台缩放、DOM 辅助、计时 */
(function () {
  'use strict';
  var DM = window.DM = window.DM || {};
  var Core = DM.Core = {};

  Core.W = 960; Core.H = 540;     // UI 逻辑尺寸
  Core.CW = 480; Core.CH = 270;   // 画布像素尺寸
  Core.scale = 1;
  Core.offX = 0; Core.offY = 0;

  Core.$ = function (sel, root) { return (root || document).querySelector(sel); };
  Core.el = function (tag, cls, parent, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };
  Core.clear = function (node) { while (node.firstChild) node.removeChild(node.firstChild); };

  Core.fit = function () {
    var stage = document.getElementById('stage');
    var w = window.innerWidth, h = window.innerHeight;
    var s = Math.min(w / Core.W, h / Core.H);
    Core.scale = s;
    Core.offX = Math.round((w - Core.W * s) / 2);
    Core.offY = Math.round((h - Core.H * s) / 2);
    stage.style.transform = 'translate(' + Core.offX + 'px,' + Core.offY + 'px) scale(' + s + ')';
  };

  // 客户端坐标 -> 逻辑坐标（960x540）
  Core.toLocal = function (cx, cy) {
    return { x: (cx - Core.offX) / Core.scale, y: (cy - Core.offY) / Core.scale };
  };

  Core.wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  Core.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  Core.easeOut = function (t) { return 1 - (1 - t) * (1 - t) * (1 - t); };

  Core.hash = function (s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  Core.rng = function (seed) {
    var a = seed >>> 0 || 1;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };
  Core.shuffle = function (arr, rnd) {
    rnd = rnd || Math.random;
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  };

  // 把一个小画布以整数倍放大绘制到新画布（用于 DOM 中显示像素图）
  Core.canvasFrom = function (src, scale, cls) {
    var c = document.createElement('canvas');
    c.width = src ? src.width : 16; c.height = src ? src.height : 16;
    if (src) c.getContext('2d').drawImage(src, 0, 0);
    if (cls) c.className = cls;
    return c;
  };

  // 美术接口的安全包装（美术模块缺失时返回占位图）
  var ph = {};
  function placeholder(w, h, color) {
    var k = w + 'x' + h + color;
    if (ph[k]) return ph[k];
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d'); g.fillStyle = color; g.fillRect(0, 0, w, h);
    return (ph[k] = c);
  }
  Core.art = {
    bg: function (id, v) {
      try { if (DM.Art && DM.Art.getBackground) return DM.Art.getBackground(id, v); } catch (e) { console.warn(e); }
      return placeholder(480, 270, id === 'white' ? '#fff' : '#101018');
    },
    portrait: function (id, ex) {
      try { if (DM.Art && DM.Art.getPortrait) return DM.Art.getPortrait(id, ex || 'normal'); } catch (e) { console.warn(e); }
      return placeholder(80, 112, '#333');
    },
    sprite: function (id) {
      try { if (DM.Art && DM.Art.getSprite) return DM.Art.getSprite(id); } catch (e) { console.warn(e); }
      return placeholder(16, 32, '#555');
    },
    icon: function (id) {
      try { if (DM.Art && DM.Art.getIcon) return DM.Art.getIcon(id); } catch (e) { console.warn(e); }
      return placeholder(16, 16, '#777');
    },
    map: function () {
      try { if (DM.Art && DM.Art.getMap) return DM.Art.getMap(); } catch (e) { console.warn(e); }
      return placeholder(480, 270, '#0b1a2a');
    }
  };

  Core.charName = function (id) { var c = DM.CHARS[id]; return c ? c.name : id; };
  Core.charColor = function (id) { var c = DM.CHARS[id]; return c ? c.color : '#ccc'; };
})();
