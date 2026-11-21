/* 本作配置 —— 引擎（js/engine/*）在两部作品之间完全相同，作品差异都写在这里 */
(function (root) {
  var DM = root.DM = root.DM || {};
  DM.GAME = {
    id: 'darkmood1',
    storage: 'darkmood_',              // localStorage 键前缀（保持与旧版存档兼容）
    title: 'DARK MOOD',
    subtitle: '宵鸦岛审判',
    version: 'v2.0',
    footer: '程序化高清美术与合成音乐　·　原创作品',
    titleBg: 'title', titleWeather: 'fog', titleBgm: 'title',
    mapTitle: '宵鸦岛',
    hpName: '信念',
    judgeId: 'judge',                  // 审判中「广播」发言者（背后显示红色光晕）
    trialBg: 'judgment',               // 审判全景使用的背景
    chapters: ['prologue', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6'],
    chapterNames: {
      prologue: '序章 鸦啼之岛', ch1: '第一章 笼中之鸦', ch2: '第二章 镜中之鸦', ch3: '第三章 塔上之鸦',
      ch4: '第四章 无面之鸦', ch5: '第五章 啄心之鸦', ch6: '终章 审判之鸦'
    },
    // 审判席位顺序（全景镜头按此平移）
    seats: ['ritsu', 'shio', 'genzou', 'kyosuke', 'hina', 'shizuka', 'fuwa', 'kiryu', 'kuga', 'shiori', 'usami', 'kurata', 'mio', 'kotone'],
    // 室外背景（像素画风下用于判断是否显示雨雪雾；高清画风由背景自己声明）
    outdoor: ['ferry', 'dock', 'courtyard', 'balcony', 'shrine', 'beach', 'title', 'map'],
    // 侦探手账·人物
    cast: ['ritsu', 'shio', 'genzou', 'kyosuke', 'hina', 'shizuka', 'fuwa', 'kiryu', 'kuga', 'shiori', 'usami', 'kurata', 'mio', 'kotone', 'kurokawa'],
    noBond: ['ritsu', 'kurokawa'],
    // 章节序号 >= n 时显示状态
    fates: {
      genzou: [2, '死亡'], mio: [2, '鸦笼'], kyosuke: [3, '死亡'], kotone: [3, '鸦笼'], kuga: [4, '死亡'], shiori: [4, '鸦笼'],
      shio: [5, '死亡'], hina: [5, '鸦笼'], shizuka: [6, '死亡'], fuwa: [6, '鸦笼'], kurokawa: [1, '离岛']
    },
    fateOverride: function (id, chIdx) { if (id === 'shio' && chIdx >= 6) return '？？？'; return null; },
    rules: {
      title: '判官的规则',
      lines: ['一、七天后渡船才会回来。',
        '二、每当有乌鸦坠落，全员须在指定时刻到审判厅集合，指认凶手。',
        '三、多数票指认正确：凶手被关入鸦笼，交给七天后到来的警察。',
        '四、指认错误：真凶将独自乘第七天的船离开，其余所有人永远留在这座岛上。',
        '五、第七天，判官将公开「九年前的真相」。']
    },
    verses: {
      title: '七鸦之歌',
      lines: ['一只乌鸦锁进笼，月光照不到它的胸。', '两只乌鸦争一面镜，镜中谁是真的影。', '三只乌鸦飞上塔，脚下没有回家的沙。',
        '四只乌鸦烧去脸，灰烬里面埋着谁的名。', '五只乌鸦自啄心，罪人原来是自己。', '六只乌鸦围成圈，审判之火点燃天。',
        '七只乌鸦只剩一只，它在雾里唱着歌——等那个说谎的孩子。'],
      shownFrom: 0   // 从第几章起全部显示（0=始终）
    },
    trialNotes: ['审判没有失败。答错会扣除「信念」，信念耗尽时会自动恢复。',
      '连续答错会出现提示，再答错会高亮正确的证据或选项。',
      '证言交锋：先选择证据，再点击发言中与之矛盾的橙色字句。可随时暂停、前后翻看发言。',
      '但在某些关键时刻，你的选择会改变结局。'],
    about: '《DARK MOOD：宵鸦岛审判》\n\n' +
      '1999 年夏，孤岛宵鸦岛。九年前的「少年侦探」七濑律，收到一封署名为死者的邀请函。\n' +
      '七只乌鸦将依次坠落——每一个凶手都怀着复仇的理由。\n\n' +
      '本格推理 × 审判冒险。所有线索都会在审判前呈现给你；请与律一起找出真相。\n' +
      '审判中的小游戏没有失败；但关键时刻的选择，会把故事引向不同的结局。\n\n' +
      '游戏中的所有画面与音乐均由程序实时生成。存档保存在本浏览器中。\n' +
      '本作为原创作品，人物、地点、事件均属虚构。',
    credits: {
      cast: ['ritsu', 'shio', 'genzou', 'kyosuke', 'hina', 'shizuka', 'fuwa', 'kiryu', 'kuga', 'shiori', 'usami', 'kurata', 'mio', 'kotone', 'kurokawa'],
      also: ['鹭宫 千鹤', '乌丸 源治', '七濑 修司'],
      closingTitle: '七只乌鸦飞走了',
      closing: '雾散了。<br>那个孩子，说出了真相。'
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = DM;
})(typeof window !== 'undefined' ? window : globalThis);
