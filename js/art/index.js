/* DARK MOOD 像素美术 —— 对外接口 DM.Art
 *   getBackground(id, variant) -> 480x270 canvas
 *   getPortrait(charId, expr)  -> 80x112 canvas（透明背景）
 *   getSprite(charId)          -> 16x32 canvas（透明背景）
 *   getIcon(iconId)            -> 16x16 canvas（透明背景）
 *   getMap()                   -> 480x270 canvas
 * 全部结果缓存；未知 id 返回占位图，不抛异常；生成是确定性的。
 */
(function (root) {
  var DM = root.DM = root.DM || {};
  var X = DM.Px;
  var cache = {};

  function memo(key, make, fallback) {
    var c = cache[key];
    if (c) return c;
    try { c = make(); }
    catch (err) {
      if (root.console) console.warn('[DM.Art] 生成失败 ' + key + ': ' + (err && err.message));
      try { c = fallback(); } catch (e2) { c = blank(8, 8); }
    }
    cache[key] = c;
    return c;
  }
  function blank(w, h) {
    var cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    return cv;
  }
  function greyRoom() {
    var b = new X.Buf(480, 270);
    b.vgrad(0, 0, 480, 180, ['#2a2733', '#36323f', '#2a2733']);
    b.vgrad(0, 180, 480, 90, ['#1e1b25', '#141219']);
    b.hl(0, 180, 480, '#4a4555');
    return b.toCanvas();
  }

  DM.Art = {
    getBackground: function (id, variant) {
      var v = variant ? String(variant) : '';
      return memo('bg:' + id + ':' + v, function () {
        if (id === 'map') return DM.ArtBG.map().toCanvas();
        return DM.ArtBG.draw(String(id), v).toCanvas();
      }, greyRoom);
    },
    getPortrait: function (charId, expr) {
      var e = DM.EXPRS && DM.EXPRS.indexOf(expr) >= 0 ? expr : 'normal';
      return memo('pt:' + charId + ':' + e, function () {
        return DM.ArtPortraits.portrait(String(charId), e).toCanvas();
      }, function () { return blank(80, 112); });
    },
    getSprite: function (charId) {
      return memo('sp:' + charId, function () {
        return DM.ArtPortraits.sprite(String(charId)).toCanvas();
      }, function () { return blank(16, 32); });
    },
    getIcon: function (iconId) {
      return memo('ic:' + iconId, function () {
        return DM.ArtIcons.draw(String(iconId)).toCanvas();
      }, function () { return blank(16, 16); });
    },
    getMap: function () {
      return DM.Art.getBackground('map');
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
