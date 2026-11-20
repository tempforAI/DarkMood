/* 角色注册表 —— 所有剧本中出现的角色 id 必须在此定义 */
(function (root) {
  var DM = root.DM = root.DM || {};

  // 表情列表（立绘生成器为每个角色生成这些表情）
  DM.EXPRS = ['normal', 'smile', 'sad', 'angry', 'surprise', 'think', 'shock', 'dark'];

  // visual 字段供像素立绘生成器参考：发型/发色/肤色/服装/配饰
  DM.CHARS = {
    ritsu: {
      name: '七濑 律', color: '#8fb8ff', title: '侦探', age: 21, height: 174,
      visual: { hair: 'short_messy', hairColor: '#2a2f3a', skin: '#f1d2b8', eyes: 'sharp', eyeColor: '#3a5a8a',
        outfit: 'coat', outfitColor: '#2d3550', inner: '#d8d8e0', accessory: 'scar_left_palm' },
      desc: '主人公。九年前以十二岁之龄破解「白鹭馆事件」，被媒体誉为「少年侦探」。冷静、内省，记得那次推理的每一步，却记不清那晚的风。左掌有一道旧伤疤。'
    },
    shio: {
      name: '雨宫 汐', color: '#ff9fb5', title: '侦探助手', age: 19, height: 160,
      visual: { hair: 'long_straight', hairColor: '#15151c', skin: '#f6dcc8', eyes: 'round', eyeColor: '#7a3040',
        outfit: 'sailor_cardigan', outfitColor: '#c9c3b5', inner: '#8a2a3a', accessory: 'white_gloves,red_notebook' },
      desc: '律的助手，一年前主动上门应聘。开朗、爱捉弄人、嗜甜。总戴着白手套，随身带着红色笔记本。'
    },
    genzou: {
      name: '鹭宫 玄藏', color: '#c9a25a', title: '鹭宫集团会长', age: 49, height: 178,
      visual: { hair: 'slicked_back', hairColor: '#3a3a3a', skin: '#e2bfa0', eyes: 'narrow', eyeColor: '#2a2a2a',
        outfit: 'suit_vest', outfitColor: '#3b2a20', inner: '#e8e0d0', accessory: 'mustache,gold_watch' },
      desc: '鹭宫家现任家主，九年前死者千鹤的叔父。专横多疑。'
    },
    kyosuke: {
      name: '鹭宫 恭介', color: '#e8e8e8', title: '鹭宫家继承人', age: 24, height: 176,
      visual: { hair: 'wavy_medium', hairColor: '#8a6a40', skin: '#f0d0b0', eyes: 'lazy', eyeColor: '#5a4030',
        outfit: 'white_suit', outfitColor: '#ececec', inner: '#c04050', accessory: 'earring' },
      desc: '玄藏之子。轻浮、嗜酒、胆小，白西装是他的标志。'
    },
    hina: {
      name: '鹭宫 雏', color: '#c8a8ff', title: '千鹤的妹妹', age: 14, height: 148,
      visual: { hair: 'hime_cut', hairColor: '#1c1820', skin: '#f8e4d6', eyes: 'big_calm', eyeColor: '#4a3a6a',
        outfit: 'black_dress', outfitColor: '#24202c', inner: '#ffffff', accessory: 'doll,crow_feather_charm' },
      desc: '九年前死者千鹤的亲妹妹，当年五岁。寡言、礼貌，有数钟声的习惯，总抱着名叫「千代」的人偶。'
    },
    shizuka: {
      name: '御堂 静香', color: '#9fe0d0', title: '医生', age: 52, height: 165,
      visual: { hair: 'bun', hairColor: '#4a4040', skin: '#efd6c0', eyes: 'glasses_cold', eyeColor: '#3a3a3a',
        outfit: 'labcoat', outfitColor: '#f4f4f4', inner: '#506070', accessory: 'glasses,pearl_necklace' },
      desc: '御堂综合医院院长，鹭宫家多年的家庭医生。冷静、理性。'
    },
    fuwa: {
      name: '不破 刚', color: '#d08060', title: '前刑警', age: 38, height: 186,
      visual: { hair: 'buzz', hairColor: '#202020', skin: '#d8a888', eyes: 'stern', eyeColor: '#202020',
        outfit: 'trench_open', outfitColor: '#6a5a40', inner: '#30343a', accessory: 'stubble,toothpick,scar_brow' },
      desc: '前县警搜查一课刑警，九年前逮捕了园丁。现为保安。粗犷寡言，有用微型录音机记录口供的习惯。'
    },
    kiryu: {
      name: '桐生 冬马', color: '#a0a0b0', title: '自由记者', age: 31, height: 172,
      visual: { hair: 'long_tied', hairColor: '#3a3028', skin: '#e8c8a8', eyes: 'half_lidded', eyeColor: '#403830',
        outfit: 'jacket_scarf', outfitColor: '#4a4a52', inner: '#a8a090', accessory: 'camera,cigarette' },
      desc: '自由撰稿人。九年前写下《恶魔园丁》系列报道而成名，著有《宵鸦岛怪谈考》。说话尖刻。'
    },
    kuga: {
      name: '久我 莲', color: '#b0c0e0', title: '律师', age: 45, height: 170,
      visual: { hair: 'side_part_grey', hairColor: '#7a7a80', skin: '#ecd0b8', eyes: 'smiling_narrow', eyeColor: '#404050',
        outfit: 'suit_tie', outfitColor: '#2a3040', inner: '#f0f0f0', accessory: 'cane,lawyer_badge' },
      desc: '鹭宫家的顾问律师，九年前担任园丁的国选辩护人。彬彬有礼，腰伤需拄手杖。'
    },
    shiori: {
      name: '柊 诗织', color: '#e0a0ff', title: '魔术师', age: 26, height: 166,
      visual: { hair: 'bob_asym', hairColor: '#5a2a70', skin: '#f6dccc', eyes: 'cat', eyeColor: '#8a40a0',
        outfit: 'tailcoat', outfitColor: '#2a1a34', inner: '#e0d0f0', accessory: 'top_hat_small,cards,sequins' },
      desc: '舞台魔术师，艺名「希尔维亚」。夸张、爱演、擅长绳结与机关。九年前作为魔术师月岛幻斋的少女助手到过此岛。'
    },
    usami: {
      name: '宇佐见 京', color: '#90c890', title: '建筑师', age: 30, height: 185,
      visual: { hair: 'neat_short', hairColor: '#2c2418', skin: '#eed2b8', eyes: 'glasses_round', eyeColor: '#304030',
        outfit: 'cardigan_shirt', outfitColor: '#5a6a50', inner: '#e8e8e0', accessory: 'glasses,pencil_ear,multitool' },
      desc: '建筑师，去年受鹭宫家委托重建西翼。父亲是鸦之塔的修缮负责人。高个、说话一板一眼。'
    },
    kurata: {
      name: '仓田 豪', color: '#ffb060', title: '厨师', age: 46, height: 172,
      visual: { hair: 'bandana', hairColor: '#3a2a1a', skin: '#e0b090', eyes: 'jolly', eyeColor: '#3a2a1a',
        outfit: 'chef', outfitColor: '#f2f2f2', inner: '#c84030', accessory: 'beard_short,round_face' },
      desc: '九年前在月蚀馆担任主厨，如今经营一家小食堂。豪爽爱笑，是众人的开心果。'
    },
    mio: {
      name: '千早 澪', color: '#80c8e8', title: '画家', age: 22, height: 158,
      visual: { hair: 'loose_wavy_long', hairColor: '#5a4a68', skin: '#f6e0d0', eyes: 'dreamy', eyeColor: '#506080',
        outfit: 'smock', outfitColor: '#d8d0c0', inner: '#506878', accessory: 'paint_stains,beret' },
      desc: '画家，岛上出身。千鹤儿时最好的朋友。说话轻柔、恍惚，常画乌鸦。'
    },
    kotone: {
      name: '真白 琴音', color: '#f0f0ff', title: '小提琴家', age: 17, height: 150,
      visual: { hair: 'twin_tails', hairColor: '#e8e0d8', skin: '#fbe8dc', eyes: 'proud', eyeColor: '#6a5aa0',
        outfit: 'school_blazer', outfitColor: '#2a2c48', inner: '#ffffff', accessory: 'violin_case,ribbon' },
      desc: '被称为神童的少女小提琴家。高傲冷淡，嘴硬心软。母亲曾是月蚀馆的女佣。'
    },
    kurokawa: {
      name: '黑川 正嗣', color: '#909090', title: '管家', age: 63, height: 158,
      visual: { hair: 'grey_slick', hairColor: '#a8a8a8', skin: '#e4c8b0', eyes: 'old_kind', eyeColor: '#303030',
        outfit: 'butler', outfitColor: '#1a1a1a', inner: '#ffffff', accessory: 'monocle_none,white_gloves' },
      desc: '月蚀馆的老管家，瘦小的老人。迎接客人后随渡船离开。'
    },
    judge: {
      name: '判官', color: '#ff4060', title: '？？？', age: 0, height: 0,
      visual: { hair: 'hood', hairColor: '#0a0a0a', skin: '#000000', eyes: 'mask', eyeColor: '#ff3050',
        outfit: 'black_robe', outfitColor: '#0a0a10', inner: '#300010', accessory: 'crow_mask' },
      desc: '戴乌鸦面具、以变声器说话的神秘人。'
    },
    chizuru: {
      name: '鹭宫 千鹤', color: '#ffe0f0', title: '九年前的死者', age: 17, height: 162,
      visual: { hair: 'long_ribbon', hairColor: '#201a20', skin: '#fbe8dc', eyes: 'gentle', eyeColor: '#6a4050',
        outfit: 'white_dress', outfitColor: '#f8f4f0', inner: '#d0a0b0', accessory: 'white_ribbon' },
      desc: '鹭宫家长孙女，九年前在宅邸中死去，年仅十七岁。'
    },
    genji: {
      name: '乌丸 源治', color: '#a09070', title: '园丁', age: 45, height: 170,
      visual: { hair: 'cropped_grey', hairColor: '#4a4840', skin: '#c89870', eyes: 'gentle_tired', eyeColor: '#2a2a20',
        outfit: 'work_clothes', outfitColor: '#5a5038', inner: '#a09070', accessory: 'towel_neck' },
      desc: '九年前月蚀馆的园丁，被认定为杀害千鹤的凶手。'
    },
    shuji: {
      name: '七濑 修司', color: '#7088a8', title: '律的父亲', age: 44, height: 176,
      visual: { hair: 'short_neat', hairColor: '#2a2a2a', skin: '#e8c8a8', eyes: 'tired_kind', eyeColor: '#303040',
        outfit: 'suit_tie', outfitColor: '#3a4048', inner: '#e8e8e8', accessory: 'police_badge' },
      desc: '律的父亲，县警警部。两年前去世。'
    },
    young_ritsu: {
      name: '律（12岁）', color: '#8fb8ff', title: '九年前', age: 12, height: 145,
      visual: { hair: 'short_messy', hairColor: '#2a2f3a', skin: '#f6dcc8', eyes: 'big_curious', eyeColor: '#3a5a8a',
        outfit: 'tshirt_shorts', outfitColor: '#4a78b0', inner: '#ffffff', accessory: 'child' },
      desc: '九年前的律。'
    },
    young_sayo: {
      name: '小夜（10岁）', color: '#ff9fb5', title: '九年前', age: 10, height: 135,
      visual: { hair: 'twin_braids', hairColor: '#15151c', skin: '#f6dcc8', eyes: 'big_round', eyeColor: '#7a3040',
        outfit: 'summer_dress', outfitColor: '#e8d070', inner: '#ffffff', accessory: 'child,straw_hat' },
      desc: '园丁的女儿。'
    },
    boatman: {
      name: '船夫', color: '#a0b0a0', title: '渡船船夫', age: 60, height: 165,
      visual: { hair: 'cap', hairColor: '#606060', skin: '#c09070', eyes: 'squint', eyeColor: '#202020',
        outfit: 'fisher_jacket', outfitColor: '#3a5060', inner: '#806050', accessory: 'beard_white' },
      desc: '往返宵鸦岛的渡船船夫。'
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = DM;
})(typeof window !== 'undefined' ? window : globalThis);
