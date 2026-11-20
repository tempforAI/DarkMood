/* 场所注册表 —— 背景 id、所属区域、地图坐标、可调查锚点
 * 坐标系：画布 480x270（像素）。anchors: { 名称: [x, y, w, h] }
 * 背景生成器需在锚点范围内画出对应物件；剧本中的调查点用 anchor 名称引用。
 */
(function (root) {
  var DM = root.DM = root.DM || {};

  // 地图上的区域（大地图节点）
  DM.AREAS = {
    pier:      { name: '码头',       map: [86, 214] },
    mansion:   { name: '月蚀馆',     map: [228, 150] },
    courtyard: { name: '中庭',       map: [262, 108] },
    tower:     { name: '鸦之塔',     map: [306, 70] },
    judgment:  { name: '审判厅',     map: [168, 96] },
    shrine:    { name: '鸦天狗神社', map: [116, 40] },
    beach:     { name: '北侧海滩',   map: [384, 36] },
    seacave:   { name: '海蚀洞',     map: [430, 112] },
    hut:       { name: '旧园丁小屋', map: [336, 186] }
  };

  DM.LOCS = {
    // ---------- 特殊 ----------
    black:   { name: '', area: null, anchors: {} },
    white:   { name: '', area: null, anchors: {} },
    title:   { name: '', area: null, anchors: {} },
    map:     { name: '宵鸦岛', area: null, anchors: {} },

    // ---------- 码头 ----------
    ferry: { name: '渡船甲板', area: null, anchors: {
      rail: [0, 196, 480, 30], island: [290, 86, 170, 54], boatman: [380, 112, 44, 84], sea: [0, 140, 480, 56] } },
    dock: { name: '码头', area: 'pier', anchors: {
      gate: [196, 84, 88, 96], boathouse_door: [16, 96, 92, 96], pier: [150, 196, 180, 74],
      stairs: [376, 76, 86, 116], sea: [0, 176, 140, 94], bollard: [340, 200, 24, 22] } },
    boathouse: { name: '船屋', area: 'pier', anchors: {
      rowboat: [140, 172, 200, 60], ropes: [24, 84, 70, 80], tide_table: [380, 64, 64, 64],
      oars: [340, 146, 110, 26], kerosene: [24, 182, 44, 52], workbench: [180, 110, 120, 40] } },

    // ---------- 月蚀馆 ----------
    hall: { name: '月蚀馆·大厅', area: 'mansion', anchors: {
      west_door: [16, 92, 60, 104], crow_statue: [96, 108, 44, 86], staircase: [176, 60, 128, 132],
      clock: [330, 78, 32, 114], east_door: [404, 92, 60, 104], chandelier: [208, 0, 64, 40],
      candlestick: [146, 150, 18, 30], carpet: [160, 196, 160, 74] } },
    dining: { name: '餐厅', area: 'mansion', anchors: {
      fireplace: [16, 88, 84, 92], painting: [196, 26, 88, 62], table: [100, 150, 280, 62],
      candelabra: [222, 118, 36, 40], window: [326, 36, 64, 92], projector: [404, 128, 44, 32],
      gramophone: [420, 166, 44, 40], screen: [120, 20, 60, 70] } },
    lounge: { name: '交谊厅', area: 'mansion', anchors: {
      piano: [16, 108, 108, 84], phone: [136, 88, 20, 30], window: [196, 36, 86, 84],
      sofa: [150, 160, 180, 60], card_table: [340, 168, 96, 52], bookshelf: [380, 46, 92, 120] } },
    kitchen: { name: '厨房', area: 'mansion', anchors: {
      stove: [16, 108, 104, 84], knife_rack: [136, 66, 66, 30], tube: [212, 78, 16, 22],
      sink: [220, 118, 64, 40], table: [150, 170, 140, 52], cellar_door: [300, 88, 62, 104],
      pantry: [380, 58, 84, 134] } },
    music: { name: '音乐室', area: 'mansion', anchors: {
      piano: [16, 108, 116, 84], window: [176, 28, 86, 72], stand: [200, 118, 32, 72],
      cassette: [326, 128, 56, 26], records: [380, 86, 84, 84], violin_case: [250, 186, 70, 26] } },
    cellar: { name: '地下酒窖', area: 'mansion', anchors: {
      west_stair: [16, 40, 104, 150], west_plate: [42, 22, 52, 14], wine_rack: [148, 58, 184, 112],
      lantern: [230, 26, 20, 22], east_stair: [360, 40, 104, 150], east_plate: [386, 22, 52, 14],
      crate: [56, 192, 52, 40], floor: [140, 200, 200, 60] } },
    east_corridor: { name: '东翼走廊', area: 'mansion', anchors: {
      window: [16, 46, 96, 104], painting: [128, 58, 44, 40], door1: [196, 82, 46, 108],
      door3: [292, 82, 46, 108], door5: [394, 82, 46, 108], floor: [100, 206, 300, 60] } },
    west_corridor: { name: '西翼走廊', area: 'mansion', anchors: {
      window: [368, 46, 96, 104], painting: [308, 58, 44, 40], door1: [238, 82, 46, 108],
      door3: [142, 82, 46, 108], door5: [40, 82, 46, 108], floor: [80, 206, 300, 60] } },
    east_room: { name: '东翼客房', area: 'mansion', anchors: {
      door: [16, 78, 56, 122], switch: [78, 118, 10, 14], desk: [98, 140, 92, 52],
      mirror: [208, 56, 42, 124], window: [266, 36, 72, 62], bed: [296, 150, 172, 70],
      wardrobe: [420, 58, 50, 96] } },
    west_room: { name: '西翼客房', area: 'mansion', anchors: {
      door: [408, 78, 56, 122], switch: [392, 118, 10, 14], desk: [290, 140, 92, 52],
      mirror: [230, 56, 42, 124], window: [142, 36, 72, 62], bed: [12, 150, 172, 70],
      wardrobe: [10, 58, 50, 96] } },
    infirmary: { name: '医务室', area: 'mansion', anchors: {
      door: [16, 78, 56, 122], shelf: [84, 46, 96, 140], desk: [190, 148, 90, 50],
      tube: [292, 96, 16, 22], window: [316, 36, 84, 70], bed: [290, 146, 178, 74],
      nightstand: [250, 168, 34, 36] } },
    service_nook: { name: '佣人通道', area: 'mansion', anchors: {
      tube: [210, 90, 18, 24], shelf: [40, 70, 90, 120], teapot: [250, 150, 40, 30], corner: [360, 60, 110, 160] } },

    // ---------- 中庭 ----------
    courtyard: { name: '中庭', area: 'courtyard', anchors: {
      cable: [0, 0, 220, 44], tower: [180, 0, 112, 172], clock_face: [212, 26, 48, 48],
      study_window: [222, 96, 28, 30], fountain: [52, 168, 88, 52], easel: [150, 176, 32, 54],
      greenhouse: [336, 116, 136, 84], bench: [300, 202, 76, 28] } },

    // ---------- 鸦之塔 ----------
    tower_stairs: { name: '鸦之塔·一楼', area: 'tower', anchors: {
      door: [16, 86, 64, 124], spiral: [150, 16, 180, 244], shaft_hatch: [378, 146, 44, 44],
      weights: [380, 40, 40, 100], chair: [90, 170, 40, 50] } },
    library: { name: '鸦之塔·藏书室', area: 'tower', anchors: {
      shelves: [16, 36, 166, 156], desk: [214, 150, 126, 50], blueprints: [236, 138, 66, 18],
      window: [356, 46, 62, 84], bridge_door: [424, 86, 50, 114] } },
    study: { name: '鸦之塔·书斋', area: 'tower', anchors: {
      door: [16, 78, 56, 122], bolt: [58, 136, 14, 8], trapdoor: [196, 0, 64, 16],
      desk: [106, 150, 112, 50], lamp: [150, 118, 20, 32], birdcage: [184, 110, 28, 36],
      fireplace: [236, 96, 72, 84], window: [326, 46, 74, 92], hatch: [428, 166, 34, 34],
      body: [316, 192, 110, 40] } },
    clockroom: { name: '鸦之塔·机械室', area: 'tower', anchors: {
      gears: [96, 36, 200, 144], bells: [316, 16, 128, 84], drum: [116, 160, 84, 40],
      floor_hatch: [206, 204, 60, 20], balcony_door: [404, 88, 60, 112] } },
    balcony: { name: '鸦之塔·瞭望台', area: 'tower', anchors: {
      view: [100, 0, 280, 170], ring: [400, 36, 32, 32], cable: [240, 0, 190, 50],
      railing: [0, 178, 480, 32], door: [16, 78, 52, 104] } },

    // ---------- 审判厅 ----------
    judgment: { name: '审判厅', area: 'judgment', anchors: {
      stained_glass: [180, 8, 120, 100], emblem: [214, 128, 52, 52], podiums: [40, 170, 400, 70],
      hidden_door: [420, 80, 44, 120], stairs_down: [16, 120, 60, 90] } },
    cells: { name: '鸦笼（地下牢）', area: 'judgment', anchors: {
      cell1: [16, 58, 144, 172], cell2: [168, 58, 144, 172], cell3: [320, 58, 144, 172], lamp: [226, 10, 28, 28] } },

    // ---------- 户外 ----------
    shrine: { name: '鸦天狗神社', area: 'shrine', anchors: {
      cable_anchor: [156, 16, 44, 44], torii: [26, 36, 104, 154], hall: [196, 48, 200, 120],
      storehouse: [400, 96, 72, 96], steps: [56, 190, 124, 80], pond: [296, 190, 108, 40] } },
    beach: { name: '北侧海滩', area: 'beach', anchors: {
      stairs_down: [0, 96, 64, 84], cliff: [296, 0, 184, 168], tower_top: [376, 0, 64, 40],
      footprints: [96, 168, 210, 40], rocks: [16, 182, 64, 40], waterline: [0, 214, 480, 16],
      sea: [0, 226, 480, 44] } },
    seacave: { name: '海蚀洞', area: 'seacave', anchors: {
      ledge: [16, 146, 128, 40], blanket: [36, 136, 66, 20], pool: [150, 180, 180, 50],
      passage: [400, 56, 72, 144], entrance: [180, 20, 120, 80] } },
    hut: { name: '旧园丁小屋', area: 'hut', anchors: {
      tools: [16, 86, 76, 96], stove: [100, 140, 64, 60], photo: [180, 58, 44, 34],
      window: [230, 36, 64, 52], bed: [296, 150, 156, 62], box: [380, 86, 64, 52] } }
  };

  // 背景变体（剧本中 @bg <id> <variant>）：
  //   east_room:burnt  —— 烧毁的客房（第四章）
  //   balcony:past     —— 九年前、栏杆腐朽的瞭望台
  //   beach:tracks     —— 沙滩上有一行脚印与手杖孔（第三章）
  //   courtyard:past   —— 九年前的中庭，温室完好
  //   hut:past         —— 九年前有人居住的园丁小屋
  //   cellar:swapped   —— 两块铜牌被互换：「东楼梯」挂在左（西）门上，「西楼梯」挂在右（东）门上（第二章夜间）
  DM.BG_VARIANTS = {
    east_room: ['burnt'], balcony: ['past'], beach: ['tracks'], courtyard: ['past'], hut: ['past'], cellar: ['swapped']
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = DM;
})(typeof window !== 'undefined' ? window : globalThis);
