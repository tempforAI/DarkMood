/* HD 美术脚本清单（按顺序注入；缺失的文件会被跳过） */
(function (root) {
  var DM = root.DM = root.DM || {};
  DM.HD_FILES = [
    'js/hd/kit.js',
    'js/hd/provider.js',
    'js/hd/chars.js',        // 角色生成器（立绘 + 小人）
    'js/hd/cast.js',         // 本作角色配置
    'js/hd/bg_mansion.js',   // 月蚀馆室内
    'js/hd/bg_tower.js',     // 鸦之塔、审判厅、标题
    'js/hd/bg_outdoor.js',   // 户外、码头、小屋、地图
    'js/hd/icons.js'         // 证据图标
  ];
  DM.PX_FILES = [
    'js/art/palette.js', 'js/art/pixel.js', 'js/art/portraits.js', 'js/art/backgrounds.js', 'js/art/icons.js', 'js/art/index.js'
  ];
})(typeof window !== 'undefined' ? window : globalThis);
