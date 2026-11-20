(function (root) {
  var DM = root.DM = root.DM || {};
  var X = DM.Px;
  DM.ArtIcons = { draw: function () { var b = new X.Buf(16, 16); b.rect(4,4,8,8,'#888'); return b; } };
})(typeof window !== 'undefined' ? window : globalThis);
