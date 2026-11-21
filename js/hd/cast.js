/* DARK MOOD 第一部《宵鸦岛审判》角色 HD 配置（格式见 js/hd/chars.js 顶部注释）
 * 每个角色：发型轮廓 + 主色一眼可辨；身高决定立绘高度与小人缩放；表情可按角色覆盖。
 */
(function (root) {
  'use strict';
  var DM = root.DM = root.DM || {};
  var HC = DM.HDChar;
  if (!HC || !HC.def) return;
  var D = function (id, o) { HC.def(id, o); };

  // 主人公：短乱黑发、锐利蓝眼、深藏青大衣 + 浅灰衬衫 + 松开的领带
  D('ritsu', {
    sex: 'm', age: 21, height: 174, skin: '#f1d2b8', face: 'sharp',
    hair: { style: 'short_messy', color: '#2a2f3a' },
    eyes: { shape: 'sharp', color: '#3a5a8a' }, brows: { shape: 'sharp' },
    outfit: { k: 'coat', c: '#2d3550', c2: '#d8d8e0', c3: '#1c2236' },
    pose: { think: 'chin' },
    expr: { smile: { mouth: 'smirk', eye: { open: 0.9, lowUp: 0.08 } } }
  });
  // 助手：长直黑发、红褐圆眼、米色开衫 + 水手服、白手套、红色笔记本
  D('shio', {
    sex: 'f', age: 19, height: 160, skin: '#f6dcc8', blush: 0.22,
    hair: { style: 'long_straight', color: '#15151c' },
    eyes: { shape: 'round', color: '#8a3444' }, brows: { shape: 'thin' },
    outfit: { k: 'sailor_cardigan', c: '#c9c3b5', c2: '#8a2a3a', collarC: '#28304e' },
    acc: [{ k: 'gloves', c: '#fbfbfd' }],
    hold: { k: 'notebook', c: '#b02838', side: 1 },
    expr: { smile: { eye: { mode: 'happy' }, mouth: 'smile', blush: 0.4 } }
  });
  // 会长：灰白背头、八字胡、窄眼、棕色三件套 + 金表链、方脸、体格壮
  D('genzou', {
    sex: 'm', age: 49, height: 178, build: 0.5, skin: '#e2bfa0', face: 'square',
    hair: { style: 'slicked_back', color: '#3a3a3a', grey: 0.7, greyC: '#c8c8cc' },
    eyes: { shape: 'narrow', color: '#2a2a2a' }, brows: { shape: 'thick' },
    marks: ['mustache'], facialHair: '#4a4646',
    outfit: { k: 'suit_vest', c: '#3b2a20', c2: '#e8e0d0', c3: '#6a1a24' },
    acc: ['watch_chain'],
    expr: { smile: { mouth: 'smirk', eye: { open: 0.85 } } }
  });
  // 继承人：栗色微卷中发、慵懒眼、白西装 + 红衬衫、耳环
  D('kyosuke', {
    sex: 'm', age: 24, height: 176, skin: '#f0d0b0',
    hair: { style: 'wavy_medium', color: '#8a6a40', side: { k: 'lock', len: 0.35, w: 0.14 } }, ears: true,
    eyes: { shape: 'lazy', color: '#6a4a30' }, brows: { shape: 'soft' },
    outfit: { k: 'white_suit', c: '#ececec', c2: '#c04050' },
    acc: [{ k: 'earring', side: -1, c: '#e0c060' }],
    expr: { smile: { mouth: 'grin' } }
  });
  // 千鹤之妹：姬发式、失神的紫眼、黑色连衣裙 + 白蕾丝圆领、抱人偶「千代」、乌鸦羽毛护身符
  D('hina', {
    sex: 'f', age: 14, height: 148, skin: '#f8e4d6',
    hair: { style: 'hime_cut', color: '#1c1820' },
    eyes: { shape: 'big_calm', color: '#5a4a7a' }, brows: { shape: 'soft' },
    outfit: { k: 'black_dress', c: '#24202c', c2: '#ffffff' },
    acc: ['crow_feather_charm'],
    hold: { k: 'doll', c: '#a82838' },
    expr: { smile: { mouth: 'smile_closed', eye: { open: 0.8, lowUp: 0.1 } }, normal: { mouth: 'neutral' } }
  });
  // 医生：盘发（掺白）、冷淡的眼、方框眼镜（反光）、白大褂 + 蓝灰高领、珍珠项链
  D('shizuka', {
    sex: 'f', age: 52, height: 165, skin: '#efd6c0', face: 'soft', lines: 1,
    hair: { style: 'bun', color: '#4a4040', grey: 0.4 },
    eyes: { shape: 'cold', color: '#3a3a40' }, brows: { shape: 'thin' },
    outfit: { k: 'labcoat', c: '#f4f4f4', c2: '#506070' },
    acc: [{ k: 'glasses', shape: 'rect', c: '#5a4a50', glare: ['dark', 'angry'] }, 'pearl_necklace'],
    expr: { smile: { mouth: 'smirk', eye: { open: 0.85 } } }
  });
  // 前刑警：寸头、胡茬、眉骨疤、叼牙签、卡其色风衣、魁梧
  D('fuwa', {
    sex: 'm', age: 38, height: 186, build: 1, skin: '#d8a888', face: 'square',
    hair: { style: 'buzz', color: '#202020' },
    eyes: { shape: 'stern', color: '#3a3020' }, brows: { shape: 'thick' },
    marks: ['stubble', { k: 'scar_brow', side: 1 }],
    outfit: { k: 'trench', c: '#6a5a40', c2: '#30343a' },
    acc: ['toothpick'],
    expr: { smile: { mouth: 'smirk', eye: { open: 0.9 } } }
  });
  // 记者：低马尾长发（搭在肩前）、半睁眼、灰色外套 + 深色高领 + 长围巾、相机、香烟
  D('kiryu', {
    sex: 'm', age: 31, height: 172, skin: '#e8c8a8',
    hair: { style: 'long_tied', color: '#3a3028' },
    eyes: { shape: 'half', color: '#4a4034' }, brows: { shape: 'straight', t: 0.9 },
    marks: ['stubble'],
    outfit: { k: 'jacket_scarf', c: '#4a4a52', c2: '#38383e' },
    acc: [{ k: 'scarf', c: '#a8a090' }, 'camera', 'cigarette'],
    expr: { smile: { mouth: 'smirk', eye: { open: 0.85 } }, normal: { mouth: 'side' } }
  });
  // 律师：灰色侧分、眯眯眼的职业微笑、藏青西装、律师徽章、手杖
  D('kuga', {
    sex: 'm', age: 45, height: 170, skin: '#ecd0b8',
    hair: { style: 'side_part_grey', color: '#7a7a80' },
    eyes: { shape: 'fox', color: '#404050' }, brows: { shape: 'soft' },
    outfit: { k: 'suit', c: '#2a3040', c2: '#f0f0f0', c3: '#6a2a3a', stripe: '#c8a860' },
    acc: ['lawyer_badge'],
    hold: { k: 'cane', c: '#3a2418' },
    pose: { think: 'chin' },
    expr: {
      normal: { eye: { mode: 'happy' }, mouth: 'smile_closed' },
      smile: { eye: { mode: 'happy' }, mouth: 'smile' },
      think: { eye: { mode: 'happy' } }
    }
  });
  // 魔术师：紫色不对称波波头、猫眼、紫黑燕尾服（亮片）、小礼帽、扑克牌
  D('shiori', {
    sex: 'f', age: 26, height: 166, skin: '#f6dccc',
    hair: { style: 'bob_asym', color: '#5a2a70' },
    eyes: { shape: 'cat', color: '#9a48b0' }, brows: { shape: 'sharp', t: 0.85 },
    outfit: { k: 'tailcoat', c: '#2a1a34', c2: '#e0d0f0', c3: '#5a2a70', lapC: '#1a0e22', trim: '#c8a0e8' },
    acc: [{ k: 'top_hat', c: '#1e1626', band: '#9a50c0', x: -0.4, tilt: -0.32 }, 'sequins'],
    hold: { k: 'cards' },
    expr: { smile: { mouth: 'grin', eye: { open: 0.8, lowUp: 0.15 } }, normal: { mouth: 'smirk' } }
  });
  // 建筑师：整齐短发、圆眼镜、耳夹铅笔、灰绿开衫 + 衬衫、长脸、高个
  D('usami', {
    sex: 'm', age: 30, height: 185, skin: '#eed2b8', face: 'long',
    hair: { style: 'neat_short', color: '#2c2418' },
    eyes: { shape: 'small', color: '#3a5040' }, brows: { shape: 'straight', t: 0.85 },
    outfit: { k: 'cardigan', c: '#5a6a50', c2: '#e8e8e0', tie: 'tie', c3: '#2a3a30' },
    acc: [{ k: 'glasses', shape: 'round', c: '#3a3020' }, 'pencil_ear'],
    pose: { think: 'chin' }
  });
  // 厨师：圆脸、短胡子、橙色头巾、白色厨师服 + 红领巾、笑眯眯
  D('kurata', {
    sex: 'm', age: 46, height: 172, build: 0.8, skin: '#e0b090', face: 'round',
    hair: { style: 'bandana', color: '#3a2a1a' },
    eyes: { shape: 'jolly', color: '#3a2a1a' }, brows: { shape: 'thick' },
    marks: ['beard_short'],
    outfit: { k: 'chef', c: '#f2f2f2', c2: '#c84030' },
    acc: [{ k: 'bandana', c: '#e89038', dotC: '#fff4e0' }],
    expr: { normal: { mouth: 'smile_closed' }, smile: { eye: { mode: 'happy' }, mouth: 'grin' } }
  });
  // 画家：灰紫色长卷发、恍惚的眼、贝雷帽、米色罩衫（颜料渍）+ 蓝灰高领
  D('mio', {
    sex: 'f', age: 22, height: 158, skin: '#f6e0d0', blush: 0.15,
    hair: { style: 'loose_wavy_long', color: '#5a4a68' },
    eyes: { shape: 'dreamy', color: '#506080' }, brows: { shape: 'soft' },
    outfit: { k: 'smock', c: '#d8d0c0', c2: '#506878' },
    acc: [{ k: 'beret', c: '#3e5a78', side: 1 }, 'paint'],
    expr: { smile: { mouth: 'smile_closed', eye: { open: 0.75, lowUp: 0.12 } } }
  });
  // 小提琴家：白金双马尾 + 深红蝴蝶结、傲气上挑眼、藏青制服外套 + 红丝带、背琴盒、个子小
  D('kotone', {
    sex: 'f', age: 17, height: 150, skin: '#fbe8dc',
    hair: { style: 'twin_tails', color: '#e8e0d8', extras: [{ k: 'twin_tails', len: 1.25, bow: '#a82040' }] },
    eyes: { shape: 'proud', color: '#6a5aa0' }, brows: { shape: 'sharp', t: 0.8 },
    outfit: { k: 'blazer', c: '#2a2c48', c2: '#ffffff', c3: '#b02840' },
    acc: [{ k: 'violin_case', c: '#3a2028', side: -1 }, { k: 'violin_strap', side: -1 }],
    expr: { smile: { mouth: 'smirk', eye: { open: 0.85 }, blush: 0.3 }, normal: { mouth: 'neutral' }, angry: { blush: 0.3 } }
  });
  // 老管家：灰白背头、和善的眼与皱纹、燕尾服、白手套、金属牙冠（笑时可见）、瘦小
  D('kurokawa', {
    sex: 'm', age: 63, height: 158, build: -0.6, skin: '#e4c8b0', face: 'old',
    hair: { style: 'grey_slick', color: '#a8a8a8' },
    eyes: { shape: 'kind', color: '#383028' }, brows: { shape: 'bushy', color: '#8a8a8a', t: 0.8 },
    marks: ['metal_tooth'],
    outfit: { k: 'butler', c: '#1a1a1a' },
    acc: [{ k: 'gloves', c: '#fbfbfd' }],
    expr: { normal: { mouth: 'smile_closed' }, smile: { eye: { mode: 'happy' }, mouth: 'grin' } }
  });
  // 判官前的汐：自己剪的参差短发、黑大衣罩着水手服、只有右手戴白手套（手里拿着乌鸦面具）
  D('sayo', {
    base: 'shio',
    hair: { style: 'short_ragged', color: '#15151c' },
    outfit: { k: 'coat_over_sailor', c: '#1a1620', c2: '#8a2a3a', collarC: '#22283e' },
    acc: [],
    hold: { k: 'crow_mask', glove: '#fbfbfd', side: -1 },
    blush: 0.05,
    expr: { normal: { eye: { open: 0.86 } }, smile: { eye: { mode: null, open: 0.8, lowUp: 0.12 }, mouth: 'smile_closed', blush: 0.1 } }
  });
  // 判官：黑色兜帽长袍 + 乌鸦喙面具，眼洞发红光（表情只改变发光强度）
  D('judge', {
    sex: 'f', age: 19, height: 168, build: 0.4, skin: '#d8c8c0',
    hair: { style: 'none' },
    hood: { c: '#0c0b12' },
    mask: { k: 'crow', c: '#16161c' },
    glow: { c: '#ff3050' },
    outfit: { k: 'robe', c: '#0c0b12', c2: '#380818' }
  });
  // 九年前的死者：长黑发、白色连衣裙、白丝带、温柔的眼
  D('chizuru', {
    sex: 'f', age: 17, height: 162, skin: '#fbe8dc', blush: 0.2,
    hair: { style: 'long_straight', color: '#201a20', bangs: { k: 'spiky', len: 0.5, part: -0.1 } },
    eyes: { shape: 'gentle', color: '#7a4a5a' }, brows: { shape: 'soft' },
    outfit: { k: 'white_dress', c: '#f8f4f0', c2: '#d0a0b0' },
    acc: ['white_ribbon'],
    expr: { smile: { eye: { mode: 'happy' }, mouth: 'smile' } }
  });
  // 园丁：短发掺白、疲惫温和的眼、晒黑的皮肤、胡茬、工作外套、脖子上搭毛巾
  D('genji', {
    sex: 'm', age: 45, height: 170, build: 0.4, skin: '#c89870', face: 'square',
    hair: { style: 'cropped', color: '#4a4840', grey: 0.35 },
    eyes: { shape: 'tired', color: '#3a3428' }, brows: { shape: 'thick' },
    marks: ['stubble'],
    outfit: { k: 'work', c: '#5a5038', c2: '#a09070' },
    acc: ['towel'],
    expr: { smile: { eye: { mode: 'happy' }, mouth: 'smile_closed' } }
  });
  // 律的父亲：短整齐黑发（微白）、疲惫和善的眼、灰色西装
  D('shuji', {
    sex: 'm', age: 44, height: 176, skin: '#e8c8a8',
    hair: { style: 'short_neat', color: '#2a2a2a', grey: 0.2 },
    eyes: { shape: 'tired', color: '#303040' }, brows: { shape: 'straight' },
    outfit: { k: 'suit', c: '#3a4048', c2: '#e8e8e8', c3: '#2a3a5a' },
    expr: { smile: { mouth: 'smile_closed', eye: { open: 0.8, lowUp: 0.12 } } }
  });
  // 12 岁的律：圆脸大眼、蓬乱短发、蓝色 T 恤
  D('young_ritsu', {
    base: 'ritsu', age: 12, height: 145, skin: '#f6dcc8', face: 'child',
    hair: { style: 'child_short', color: '#2a2f3a' },
    eyes: { shape: 'big', color: '#3a5a8a' }, brows: { shape: 'normal' },
    outfit: { k: 'tshirt', c: '#4a78b0', c2: '#ffffff', print: 1 },
    pose: {}, expr: {}
  });
  // 10 岁的小夜：双麻花辫、草帽、黄色背带连衣裙 + 白衬衫
  D('young_sayo', {
    base: 'shio', age: 10, height: 135, skin: '#f6dcc8', face: 'child', blush: 0.3,
    hair: { style: 'twin_braids', color: '#15151c', tieC: '#c03040' },
    eyes: { shape: 'big', color: '#8a3444' }, brows: { shape: 'soft' },
    outfit: { k: 'summer_dress', c: '#e8d070', c2: '#ffffff' },
    acc: [{ k: 'straw_hat', c: '#e8d090', band: '#c03040' }],
    hold: null,
    expr: { smile: { eye: { mode: 'happy' }, mouth: 'smile' } }
  });
  // 渡船船夫：鸭舌帽、白色络腮胡、眯眼、晒黑、蓝灰工作夹克 + 毛衣
  D('boatman', {
    sex: 'm', age: 60, height: 165, skin: '#c09070', face: 'old',
    hair: { style: 'cap', color: '#808080' },
    eyes: { shape: 'squint', color: '#2a2a20' }, brows: { shape: 'bushy', color: '#d0ccc4' },
    marks: [{ k: 'beard_full', c: '#e8e4dc' }, { k: 'mustache', c: '#e8e4dc' }],
    outfit: { k: 'fisher', c: '#3a5060', c2: '#806050' },
    acc: [{ k: 'cap', c: '#4a5a6a' }],
    expr: { smile: { eye: { mode: 'happy' }, mouth: 'smile_closed' } }
  });
})(typeof window !== 'undefined' ? window : globalThis);
