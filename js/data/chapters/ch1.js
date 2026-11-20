/* 第一章「笼中之鸦」 —— 1999 年 8 月 13 日～14 日 */
DM.registerChapter({
  id: 'ch1',
  title: '第一章',
  name: '笼中之鸦',
  next: 'ch2',
  start: 'ch1_start',

  evidence: {
    ch1_autopsy: { name: '御堂的验尸', icon: 'body',
      desc: '胸口单刀刺伤，刺穿心脏，几乎当场死亡。21:20 检查时尸体尚温，「死后不到一小时」。胸口伤处周围的血已经开始凝固。仅凭这些，无法区分死于 20:40 还是 21:01。' },
    ch1_knife: { name: '厨刀', icon: 'knife',
      desc: '插在死者胸口的一把细长厨刀。刀柄是黑檀木的，刻着一个「仓」字。' },
    ch1_cage: { name: '鸟笼与黑布', icon: 'cage',
      desc: '书斋里装饰用的古董鸟笼。笼门开着，里面放着一根乌鸦羽毛。原本罩着鸟笼的黑丝绒布，被盖在了死者的胸口上。——「一只乌鸦锁进笼，月光照不到它的胸」。' },
    ch1_bolt: { name: '门闩', icon: 'door',
      desc: '书斋橡木门内侧的插销式门闩，破门时确实插着。门闩把手的颈部有一圈新的细磨痕，像是被极细的线勒过、拉过。' },
    ch1_window: { name: '书斋的窗户', icon: 'window',
      desc: '朝中庭的窗户大开着，窗帘被雨打湿。窗外是光滑的石墙，离地约 12 米，没有任何可以落脚的地方。窗户插销上有一道新的划痕。' },
    ch1_lamp: { name: '台灯', icon: 'lamp',
      desc: '书桌上的黄铜台灯摔在地上，灯罩和灯泡都碎了。细长的灯颈上有一道细细的勒痕。' },
    ch1_hook: { name: '天花板的铁钩', icon: 'generic',
      desc: '天花板上用来挂鸟笼的旧铁钩，锈迹斑斑。钩子内侧却有一道新的、发亮的摩擦痕，像有什么东西在上面被拖过。' },
    ch1_hatch: { name: '重锤井检修门', icon: 'door',
      desc: '书斋墙角一扇约 20 厘米见方的小铁门，通往钟的重锤井。门虚掩着，门缝的铰链上挂着一丝极细的透明纤维。' },
    ch1_line: { name: '透明细线', icon: 'string',
      desc: '在塔一楼重锤井底的检修口里找到。一团极细的透明尼龙线，缠绕在报时重锤的钢索上，线上有几个已经散开的活结的折痕。' },
    ch1_trapdoor: { name: '天花板活板门', icon: 'door',
      desc: '书斋天花板上通往四楼机械室的活板门。被几根锈钉钉死，钉帽上的锈完好无损，没有被动过的痕迹。' },
    ch1_bells: { name: '雏的证词：八声钟', icon: 'testimony',
      desc: '雏在交谊厅数了九点的钟声：「九点的钟，只敲了八下。」她说自己从不数错。' },
    ch1_scream: { name: '惨叫与碎裂声', icon: 'testimony',
      desc: '21:00 钟声响起后不久，律、汐、澪在中庭听到塔上传来尖锐的「惨叫」和东西碎裂的声音，看到书斋的窗户猛地打开、灯灭了。澪说：「是玄藏先生的声音！」' },
    ch1_kyosuke: { name: '恭介的证词', icon: 'testimony',
      desc: '20:30 左右，恭介到书斋门口找父亲要钱，隔着门吵了一架。父亲在门里吼了一声「滚！」——会长那时还活着。恭介之后独自回了房间。' },
    ch1_usami: { name: '宇佐见的证词', icon: 'testimony',
      desc: '16:00 从会长那里拿到钥匙，独自检查书斋，17:00 锁门，亲手把唯一的钥匙还给会长。会长把钥匙挂在怀表链上，直到 20:15 进塔为止都带在身上——书斋在那之前一直锁着。宇佐见 20:30 前后走渡廊进入藏书室，隐约听见楼上有人吵架，之后一直在那里翻旧图纸。' },
    ch1_libwin: { name: '藏书室的窗户', icon: 'window',
      desc: '藏书室（书斋正下方）的窗户是封死的固定窗，玻璃嵌在石框里，根本打不开。' },
    ch1_threadbox: { name: '柊的道具箱', icon: 'card',
      desc: '交谊厅牌桌角落里柊的黑色道具箱。装「幻线」的格子里本该有三卷，现在只剩两卷。' },
    ch1_paint: { name: '门把手上的颜料', icon: 'paint',
      desc: '书斋门内侧的把手背面，沾着一点未干的油画颜料，蓝里透白——澪自己调的「月光蓝」。破门之后，澪一直坐在门外的楼梯上，没有进过房间。' },
    ch1_diary: { name: '烧焦的日记封面', icon: 'diary',
      desc: '壁炉灰里的布面封面残片，绣着「千鹤」二字，边缘烧焦卷曲。和澪白天给律看过的那本日记一模一样。里面的纸页几乎烧光了，只剩装订线上残留的几页碎边。' },
    ch1_mio_burn: { name: '澪指尖的烫伤', icon: 'testimony',
      desc: '澪右手的食指、中指指尖有新的烫伤，起了水泡。她说是「松节油打翻在提灯上，火苗窜了一下」。' },
    ch1_brandy: { name: '会长的白兰地', icon: 'bottle',
      desc: '书桌上的白兰地酒瓶和半杯酒。御堂闻过、用试纸验过：没有异味，没有药物反应。会长不是被下药后杀害的。' }
  },

  explore: {
    ch1_day: {
      title: '8月13日·自由行动',
      mode: 'free',
      start: 'dining',
      places: ['dining', 'hall', 'lounge', 'kitchen', 'courtyard', 'tower_stairs', 'library'],
      spots: {
        hall: [ { anchor: 'clock', label: '大座钟', run: 'ch1_ds_clock' } ],
        dining: [ { anchor: 'projector', label: '放映机', run: 'ch1_ds_projector' } ],
        lounge: [
          { anchor: 'card_table', label: '柊的道具箱', run: 'ch1_ds_propbox' },
          { anchor: 'piano', label: '钢琴', run: 'ch1_ds_piano' }
        ],
        kitchen: [
          { anchor: 'knife_rack', label: '刀架', run: 'ch1_ds_knives' },
          { anchor: 'pantry', label: '食品柜', run: 'ch1_ds_pantry' }
        ],
        courtyard: [
          { anchor: 'easel', label: '画架', run: 'ch1_ds_easel' },
          { anchor: 'study_window', label: '三楼的窗户', run: 'ch1_ds_studywin' }
        ],
        tower_stairs: [
          { anchor: 'weights', label: '重锤井', run: 'ch1_ds_weights' },
          { anchor: 'shaft_hatch', label: '检修口', run: 'ch1_ds_shafthatch' },
          { anchor: 'spiral', label: '螺旋楼梯', run: 'ch1_ds_spiral' }
        ],
        library: [
          { anchor: 'window', label: '窗户', run: 'ch1_ds_libwin' },
          { anchor: 'shelves', label: '书架', run: 'ch1_ds_libshelves' },
          { anchor: 'bridge_door', label: '渡廊的门', run: 'ch1_ds_bridge' }
        ]
      },
      people: {
        dining: [
          { char: 'genzou', run: 'ch1_dt_genzou', x: 200 },
          { char: 'kyosuke', run: 'ch1_dt_kyosuke', x: 330 }
        ],
        hall: [
          { char: 'hina', run: 'ch1_dt_hina', x: 300 },
          { char: 'fuwa', run: 'ch1_dt_fuwa', x: 110 }
        ],
        lounge: [
          { char: 'shiori', run: 'ch1_dt_shiori', x: 380 },
          { char: 'kotone', run: 'ch1_dt_kotone', x: 70 },
          { char: 'kuga', run: 'ch1_dt_kuga', x: 220 }
        ],
        kitchen: [
          { char: 'kurata', run: 'ch1_dt_kurata', x: 270 },
          { char: 'shio', run: 'ch1_dt_shio', x: 170 }
        ],
        courtyard: [ { char: 'mio', run: 'ch1_dt_mio', x: 150 } ],
        tower_stairs: [ { char: 'usami', run: 'ch1_dt_usami', x: 300 } ],
        library: [
          { char: 'kiryu', run: 'ch1_dt_kiryu', x: 200 },
          { char: 'shizuka', run: 'ch1_dt_shizuka', x: 320 }
        ]
      },
      done: {
        need: ['flag:ch1_d_usami', 'flag:ch1_d_mio', 'flag:ch1_d_shiori',
               'flag:ch1_d_kurata', 'flag:ch1_d_hina', 'flag:ch1_d_shio'],
        run: 'ch1_day_end',
        prompt: '已经过了中午。结束自由行动吗？'
      }
    },

    ch1_inv: {
      title: '搜查开始',
      mode: 'investigate',
      start: 'study',
      places: ['study', 'tower_stairs', 'library', 'clockroom', 'courtyard', 'lounge', 'kitchen', 'hall'],
      filter: 'night',
      weather: 'rain',
      spots: {
        study: [
          { anchor: 'body', label: '会长的遗体', run: 'ch1_i_body' },
          { anchor: 'birdcage', label: '鸟笼', run: 'ch1_i_cage' },
          { anchor: 'bolt', label: '门闩', run: 'ch1_i_bolt' },
          { anchor: 'door', label: '橡木门', run: 'ch1_i_door' },
          { anchor: 'window', label: '窗户', run: 'ch1_i_window' },
          { anchor: 'lamp', label: '台灯', run: 'ch1_i_lamp' },
          { x: 198, y: 64, label: '天花板的铁钩', run: 'ch1_i_hook' },
          { anchor: 'hatch', label: '墙角的小门', run: 'ch1_i_hatch' },
          { anchor: 'trapdoor', label: '活板门', run: 'ch1_i_trapdoor' },
          { anchor: 'fireplace', label: '壁炉', run: 'ch1_i_fireplace' },
          { anchor: 'desk', label: '书桌', run: 'ch1_i_desk' }
        ],
        tower_stairs: [
          { anchor: 'shaft_hatch', label: '重锤井检修口', run: 'ch1_i_shaft' },
          { anchor: 'weights', label: '重锤', run: 'ch1_i_weights' },
          { anchor: 'door', label: '塔的入口', run: 'ch1_i_towerdoor' },
          { anchor: 'spiral', label: '螺旋楼梯', run: 'ch1_i_spiral' }
        ],
        library: [
          { anchor: 'window', label: '窗户', run: 'ch1_i_libwin' },
          { anchor: 'blueprints', label: '摊开的图纸', run: 'ch1_i_blueprints' },
          { anchor: 'bridge_door', label: '渡廊的门', run: 'ch1_i_bridge' },
          { anchor: 'shelves', label: '书架', run: 'ch1_i_libshelves' }
        ],
        clockroom: [
          { anchor: 'gears', label: '齿轮', run: 'ch1_i_gears' },
          { anchor: 'drum', label: '鼓轮', run: 'ch1_i_drum' },
          { anchor: 'balcony_door', label: '瞭望台的门', run: 'ch1_i_balconydoor' },
          { anchor: 'floor_hatch', label: '地板的活板门', run: 'ch1_i_floorhatch' }
        ],
        courtyard: [
          { anchor: 'study_window', label: '书斋的窗下', run: 'ch1_i_ground' },
          { anchor: 'easel', label: '澪的画架', run: 'ch1_i_easel' },
          { anchor: 'fountain', label: '喷泉', run: 'ch1_i_fountain' },
          { anchor: 'greenhouse', label: '温室的废墟', run: 'ch1_i_greenhouse' }
        ],
        lounge: [
          { anchor: 'card_table', label: '柊的道具箱', run: 'ch1_i_propbox' },
          { anchor: 'phone', label: '内线电话', run: 'ch1_i_phone' },
          { anchor: 'window', label: '窗外的钟面', run: 'ch1_i_loungewin' }
        ],
        kitchen: [
          { anchor: 'knife_rack', label: '刀架', run: 'ch1_i_knives' },
          { anchor: 'pantry', label: '食品柜', run: 'ch1_i_pantry' },
          { anchor: 'tube', label: '传声管', run: 'ch1_i_tube' }
        ],
        hall: [
          { anchor: 'clock', label: '大座钟', run: 'ch1_i_hallclock' },
          { anchor: 'crow_statue', label: '乌鸦铜像', run: 'ch1_i_crow' }
        ]
      },
      people: {
        study: [ { char: 'shizuka', run: 'ch1_it_shizuka', x: 250 } ],
        tower_stairs: [ { char: 'fuwa', run: 'ch1_it_fuwa', x: 120 } ],
        library: [ { char: 'usami', run: 'ch1_it_usami', x: 200 } ],
        courtyard: [ { char: 'mio', run: 'ch1_it_mio', x: 150 } ],
        lounge: [
          { char: 'hina', run: 'ch1_it_hina', x: 320 },
          { char: 'shiori', run: 'ch1_it_shiori', x: 400 },
          { char: 'kotone', run: 'ch1_it_kotone', x: 80 },
          { char: 'kuga', run: 'ch1_it_kuga', x: 200 }
        ],
        kitchen: [ { char: 'kurata', run: 'ch1_it_kurata', x: 260 } ],
        hall: [
          { char: 'kyosuke', run: 'ch1_it_kyosuke', x: 200 },
          { char: 'kiryu', run: 'ch1_it_kiryu', x: 380 },
          { char: 'shio', run: 'ch1_it_shio', x: 100 }
        ]
      },
      done: {
        need: ['ch1_autopsy', 'ch1_knife', 'ch1_cage', 'ch1_bolt', 'ch1_window', 'ch1_lamp', 'ch1_hook',
               'ch1_hatch', 'ch1_line', 'ch1_trapdoor', 'ch1_bells', 'ch1_scream', 'ch1_kyosuke',
               'ch1_usami', 'ch1_libwin', 'ch1_threadbox', 'ch1_paint', 'ch1_diary', 'ch1_mio_burn',
               'flag:ch1_i_ground_done'],
        run: 'ch1_inv_end',
        prompt: '该查的都查过了。天亮之后，就是审判。结束搜查吗？'
      }
    }
  },

  games: {
    ch1_g1: {
      type: 'debate', title: '证言交锋',
      ammo: ['ch1_window', 'ch1_bolt', 'ch1_knife', 'ch1_kyosuke', 'ch1_brandy'],
      lines: [
        { who: 'fuwa', expr: 'angry', text: '恭介吵完架，回头杀了会长，然后从{窗户}逃走。就这么简单。' },
        { who: 'kiryu', expr: 'normal', text: '门从里面闩着。不走窗，难道穿墙？' },
        { who: 'kyosuke', expr: 'shock', text: '我、我吵完就{回房间}了！一步都没出来过！' },
        { who: 'kuga', expr: 'think', text: '从法律上讲，{动机}与{机会}俱全啊……' }
      ],
      answer: { line: 0, weak: 0, ammo: 'ch1_window' },
      hint: '书斋在三楼。窗外的墙和地面是什么样子？',
      wrong: '……不，这件证据推翻不了那句话。'
    },
    ch1_g2: {
      type: 'debate', title: '证言交锋',
      ammo: ['ch1_libwin', 'ch1_window', 'ch1_usami', 'ch1_trapdoor', 'ch1_hatch'],
      lines: [
        { who: 'kyosuke', expr: 'angry', text: '宇佐见！你那时候就在{楼下的藏书室}！比谁都近！' },
        { who: 'kiryu', expr: 'smile', text: '从藏书室的{窗户}翻出去，沿外墙爬上三楼——不过一层楼。' },
        { who: 'usami', expr: 'shock', text: '我、我只是在藏书室{看图纸}……' },
        { who: 'kiryu', expr: 'normal', text: '杀完人，再顺原路{爬回藏书室}，装作刚听见动静。' }
      ],
      answer: { line: 1, weak: 0, ammo: 'ch1_libwin' },
      hint: '藏书室的窗户，是能打开的窗吗？',
      wrong: '……不对。要攻击的是那条「路线」本身。'
    },
    ch1_g3: {
      type: 'present',
      prompt: '证明门闩不是被人用手插上，而是被「线」拉上的证据是——',
      answer: 'ch1_bolt',
      hint: '门闩的把手上，留着什么不自然的痕迹？'
    },
    ch1_g4: {
      type: 'debate', title: '证言交锋',
      ammo: ['ch1_line', 'ch1_threadbox', 'ch1_hatch', 'ch1_hook', 'ch1_bells'],
      lines: [
        { who: 'kiryu', expr: 'dark', text: '魔术师的线，魔术师的机关。不是你，{还能有谁}？' },
        { who: 'shiori', expr: 'angry', text: '九点钟我在交谊厅{当着大家的面}变魔术！谁都看见了！' },
        { who: 'kuga', expr: 'think', text: '那么结论只有一个：有共犯。拉线的人，必须{在门外}拉。' },
        { who: 'fuwa', expr: 'normal', text: '九点前后在塔里、又{没有不在场证明}的人，可不少。' }
      ],
      answer: { line: 2, weak: 0, ammo: 'ch1_line' },
      hint: '那根线最后是在哪里找到的？它的另一端系在什么东西上？',
      wrong: '……这句话本身没有错。真正的破绽在别处。'
    },
    ch1_g5: {
      type: 'keyword',
      prompt: '在九点整拉动幻线的「力量」，来自——',
      answer: '重锤',
      decoys: '钟齿轮鸦窗绳人风',
      hint: '钟楼里，有什么东西会在敲钟时一截一截地往下落？'
    },
    ch1_g6: {
      type: 'logic', title: '推理回廊',
      questions: [
        { q: '昨晚九点，鸦之塔的钟敲了几下？', opts: ['九下', '八下', '十下'], a: 1 },
        { q: '少了一下，意味着什么？', opts: ['钟本来就坏了', '报时重锤被额外的负荷拖住了', '雏数错了'], a: 1 },
        { q: '那么，九点那声「惨叫」其实是？', opts: ['会长临死前的惨叫', '生锈的铁钩被细线硬拽的摩擦声', '乌鸦的叫声'], a: 1 },
        { q: '台灯摔碎、窗户打开，为什么几乎同时发生？', opts: ['凶手两只手同时动了', '同一根线依次拉动了它们', '风把它们吹倒了'], a: 1 },
        { q: '天花板铁钩上新的摩擦痕说明了什么？', opts: ['它被当成了改变线方向的滑轮', '有人在上面吊过重物', '鸟笼刚被取下来'], a: 0 },
        { q: '结论：会长真正被杀的时刻是？', opts: ['九点整', '九点以前', '九点以后'], a: 1 }
      ],
      hint: '机关是「钟」启动的。钟声响起之前，凶手早就可以离开了。'
    },
    ch1_g7: {
      type: 'debate', title: '证言交锋',
      ammo: ['ch1_paint', 'ch1_scream', 'ch1_autopsy', 'ch1_kyosuke', 'ch1_knife'],
      lines: [
        { who: 'kiryu', expr: 'normal', text: '八点半到九点，我在{房间写稿}。信不信由你们。' },
        { who: 'kyosuke', expr: 'sad', text: '我吵完架就{回了房间}！没人看见，可我没杀人！' },
        { who: 'mio', expr: 'normal', text: '我从八点起，就{一直}在中庭画画……律君也看到了。' },
        { who: 'shio', expr: 'normal', text: '律君和我，是{八点五十分}左右才到中庭的哦。' }
      ],
      answer: { line: 2, weak: 0, ammo: 'ch1_paint' },
      hint: '书斋的门内侧，留下了谁的「颜色」？',
      wrong: '……不对。和这件证据矛盾的，是另一个人的话。'
    },
    ch1_g8: {
      type: 'rebuttal', who: 'mio',
      blades: ['书斋在会长进去之前一直锁着', '油画颜料一两个小时就会干透', '书斋的门是从里面闩上的'],
      lines: [
        { expr: 'normal', text: '那块颜料啊……是我{晚饭前}去书斋送素描时蹭上的。' },
        { expr: 'sad', text: '会长说想看看我画的塔，所以我{亲手}送过去了。' },
        { expr: 'normal', text: '律君……这有什么{奇怪}的呢？' }
      ],
      answer: { line: 0, weak: 0, blade: 0 },
      hint: '宇佐见先生说过：书斋的钥匙从五点起在谁身上？会长进塔之前，书斋是什么状态？',
      wrong: '……刀刃偏了。她的话里，哪个时间点站不住脚？'
    },
    ch1_g9: {
      type: 'present',
      prompt: '只有澪一个人拥有的东西——它的残骸，就在书斋的壁炉里。',
      answer: 'ch1_diary',
      hint: '白天，澪在中庭给律看过一样东西。她说那是千鹤寄放在她那里的。'
    },
    ch1_g10: {
      type: 'present',
      prompt: '证明澪曾经把手伸进燃烧的壁炉的证据是——',
      answer: 'ch1_mio_burn',
      hint: '从火里抢出东西的人，手上会留下什么？'
    },
    ch1_g11: {
      type: 'reconstruct', title: '真相重演',
      panels: [
        { text: '晚饭之前，凶手从交谊厅柊的道具箱里偷走了一卷【？】，又在帮仓田洗菜时偷走了一把厨刀。', opts: ['幻线', '钓鱼线', '麻绳'], a: 0 },
        { text: '晚上 8 点 35 分，凶手以【？】为借口，敲开了书斋的门。', opts: ['送夜宵', '千鹤的日记', '借钥匙'], a: 1 },
        { text: '会长读完日记，脸色大变，把它扔进了【？】。凶手用厨刀刺中了他的胸口。', opts: ['窗外', '鸟笼', '壁炉'], a: 2 },
        { text: '凶手打开墙角的【？】，把幻线的一端系在报时重锤的钢索上。', opts: ['检修小门', '活板门', '窗户'], a: 0 },
        { text: '幻线绕过天花板的【？】，依次用活结套住门闩、台灯和窗户插销。', opts: ['吊灯', '铁钩', '书架'], a: 1 },
        { text: '凶手把鸟笼的黑布盖在死者的【？】上，又在笼中放进一根乌鸦羽毛。', opts: ['胸口', '脸', '手'], a: 0 },
        { text: '凶手握着门内侧的把手离开，把手上留下了【？】。', opts: ['血迹', '指纹', '月光蓝颜料'], a: 2 },
        { text: '九点，钟声响起。重锤拉动幻线：门闩插上、台灯坠落、窗户打开——第九声钟【？】。', opts: ['格外响亮', '没有响起', '响了两次'], a: 1 }
      ]
    },
    ch1_g12: {
      type: 'vote',
      options: ['kyosuke', 'usami', 'fuwa', 'shiori', 'kiryu', 'mio'],
      answer: 'mio'
    }
  },

  script: String.raw`
# ch1_start
@bg black
@title 第一章|笼中之鸦
@wait 400
@bg dining
@bgm daily
@weather none
@caption 8月13日 07:30 餐厅
: 雨在天亮前停了。窗外的天空是湿漉漉的灰色，乌鸦在屋檐上来回踱步。
: 早餐的长桌边坐满了人，却没有谁在说话。昨晚的影片像一层看不见的灰，落在每个人的盘子里。
kurata[smile]: 来来来，味噌汤还热着！吃饱了才有力气害怕，哈哈……
kurata[sad]: ……哈哈。
: 没有人笑。仓田挠了挠头巾，悻悻地回了厨房。
fuwa[normal]: 我搜过了。
: 不破站在窗边，牙签在嘴里转了半圈。他的裤脚上沾满了泥。
fuwa[normal]: 天亮就出去了。宅子、塔、神社、海滩、旧园丁小屋。
fuwa[normal]: 没人。
genzou[angry]: 没人？那影片是鬼放的？
fuwa[normal]: 东边还有个海蚀洞。涨潮的时候进不去。下午退潮再看。
fuwa[normal]: 至少，找得到的地方没人。
kiryu[smile]: 「找得到的地方」。真是让人安心的说法。
genzou[angry]: 哼！
genzou[normal]: 听好了。从今晚起，我搬进鸦之塔三楼的书斋。
kyosuke[surprise]: 塔、塔里？老爸你疯了？那里九年没人住过……
genzou[angry]: 正因为没人住过！
genzou[normal]: 整座宅子，只有那间书斋有一扇橡木厚门，门里有门闩。窗户在三楼，离地十几米。
genzou[normal]: 钥匙只有一把，在我身上。谁也别想半夜摸进来。
: 会长从马甲口袋里掏出一把黄铜钥匙，在众人面前晃了晃，又挂回怀表链上。
kuga[smile]: 会长的安全意识，敝人深感钦佩。只是那座塔年久失修……
genzou[angry]: 所以要检查！宇佐见！
usami[surprise]: 是、是！
genzou[normal]: 你是建筑师。下午四点到我这儿拿钥匙，把书斋从里到外给我查一遍。门、窗、墙、天花板，一寸也别放过。
genzou[normal]: 五点之前查完，锁好门，钥匙还我。
usami[normal]: 明白。书斋的结构我大致了解……我会仔细检查的。
: 宇佐见推了推圆眼镜。不知是不是错觉，他的手指在微微发抖。
hina[normal]: 叔父大人。
genzou[normal]: 什么事。
hina[normal]: 今天是八月十三日。
hina[normal]: 是姐姐的忌日。
: 会长手里的咖啡杯停在了半空。
genzou[normal]: ……我知道。
genzou[angry]: 吃饭！
: 他把杯子往托盘上一放，起身离开了餐厅。雏低下头，把人偶放在膝盖上，继续一小口一小口地喝汤。
kyosuke[sad]: 老爸……那件事你还没答应我呢……
kyosuke[sad]: ……啧。
@show shio[smile] C
shio[smile]: 律君，今天怎么安排？
ritsu: 到处看看。
shio[smile]: 好～那我先去厨房！仓田先生说今天有新做的甜点！
ritsu: 你是来吃东西的吗。
shio[smile]: 助手也要补充能量嘛～律君也要好好跟大家聊聊哦。
@hide
> 判官说「七只乌鸦将依次坠落」。
> 如果那不只是恐吓……今天，就是千鹤小姐的忌日。
> 去看看大家在做什么吧。尤其是要去塔里检查的宇佐见先生。
@explore ch1_day

# ch1_ds_clock
: 大座钟的指针指着十一点过一刻。钟摆不紧不慢地摆着。
> 雏说她数的是塔上的钟。这座座钟只走不响。
@return

# ch1_ds_projector
: 放映机已经被罩上了一块白布。电源线从定时器上拔了下来，盘在三脚架脚边。
> 昨晚之后，谁也不想再碰它。
@return

# ch1_ds_propbox
: 牌桌角落里放着柊的黑色道具箱，描着金边，箱盖半开。
: 里面分成许多小格子：一卷卷绳子、金属扣环、丝绸手帕、一副副扑克，还有三只小小的透明线轴。
@if ch1_d_shiori -> ch1_ds_propbox2
> 魔术师的全部家当，就这么摊在交谊厅里。
@return

# ch1_ds_propbox2
> 那三只透明线轴，就是她说的「幻线」。一格三卷，整整齐齐。
> 箱子就这样敞着放在角落……谁都能伸手拿到。
@return

# ch1_ds_piano
: 钢琴的琴盖开着，谱架上放着一本旧乐谱。有人试着调过音，声音比昨天准了一些。
@return

# ch1_ds_knives
: 墙上的磁铁刀架上，八把刀从长到短排成一列，刀刃擦得锃亮。
@if ch1_d_kurata -> ch1_ds_knives2
@return

# ch1_ds_knives2
> 仓田先生说，一把都不能少。中午的时候，八把都在。
@return

# ch1_ds_pantry
: 食品柜里堆满了米袋、罐头、腌菜坛子和成箱的矿泉水。足够十几个人吃上一阵子。
: 中间一层放着一只大盘子，上面盖着湿布，布下面是一排排饭团——中间缺了一大块。
@return

# ch1_ds_easel
: 屋檐下支着一副画架。画布上已经打好了底：灰紫色的天空，一座黑色的塔。
: 旁边的小桌上放着调色盘、一排颜料管、一瓶松节油和一盏提灯。
@if ch1_d_mio -> ch1_ds_easel2
@return

# ch1_ds_easel2
: 调色盘的一角，调好了一小团蓝白色的颜料。像是月光落在水面上的颜色。
> 「月光蓝」。她说只有她调得出来。
@return

# ch1_ds_studywin
: 抬头看去，塔的三楼有一扇窗朝着中庭。窗框是旧的，玻璃擦得很干净。
: 窗下的外墙是光滑的黑色石块，雨水在上面冲出一道道白痕。窗下是一片泥地花坛，杂草被雨打得东倒西歪。
> 从下面爬上去？除非长了翅膀。
@return

# ch1_ds_weights
: 墙角立着一根粗大的方形竖井，铁皮包边。从井口往上看，黑洞洞的，一直通到塔顶。
: 竖井里垂着两根钢索，钢索下面各挂着一块铁铸的重锤。一块在井的半腰，另一块高高地吊在上面，几乎看不见。
@if ch1_d_usami -> ch1_ds_weights2
@return

# ch1_ds_weights2
> 宇佐见先生说过：走时的重锤一直在慢慢下降，报时的重锤平时不动，只在敲钟时一截一截地往下落。
@return

# ch1_ds_shafthatch
: 竖井底部有一扇小小的检修口，铁门上挂着一把生锈的搭扣，没有上锁。
: 打开往里看，井底积着厚厚的灰，还有几片干枯的乌鸦羽毛。
@return

# ch1_ds_spiral
: 石砌的螺旋楼梯一圈圈地往上盘，每一级台阶中间都被磨出了凹痕。
: 二楼的位置有一扇关着的门——那是藏书室通往楼梯的门。再往上是三楼的书斋，然后是四楼的机械室。
> 上塔只有两条路：从中庭进一楼走这道楼梯，或者从本馆二楼走渡廊进藏书室。
@return

# ch1_ds_libwin
: 藏书室的窗户比别处的小，玻璃厚得发绿，直接嵌在石框里。没有把手，没有插销，没有合页。
> 封死的固定窗。只能透光，打不开。
@return

# ch1_ds_libshelves
: 书架一直顶到天花板，塞满了皮面精装的洋书、旧账簿和一捆捆用麻绳扎着的图纸。
: 有一格的灰尘被抹掉了一块，像是最近有人抽出过什么东西。
@return

# ch1_ds_bridge
: 藏书室的一侧是通往本馆二楼的渡廊。一条细长的、有顶的石廊，从宅子悬空架到塔上。
> 从宅子里，不经过中庭也能进塔——走这条路。
@return

# ch1_dt_usami
@if ch1_d_usami -> ch1_dt_usami2
: 宇佐见站在塔一楼的竖井前，手里拿着手电筒，正往井里照。
usami[surprise]: 啊，七濑先生。吓我一跳。
usami[normal]: 下午要检查书斋，我想先把塔的结构摸清楚。会长那个脾气……漏了什么可不得了。
ritsu: 这根竖井是？
usami[smile]: 啊，您问到点子上了！这是塔钟的重锤井。
usami[normal]: 塔钟是重锤驱动的。钟的机芯在四楼机械室，重锤挂在钢索上，沿着这根竖井从四楼一直垂到一楼。
usami[normal]: 一共两块重锤。一块是「走时重锤」，一直在慢慢下降，带动指针。
usami[normal]: 另一块是「报时重锤」。它平时一动不动，只在整点敲钟的时候，每敲一下，就往下落一截。
ritsu: 敲九下，就落九截。
usami[smile]: 正是！每天要有人上去把它重新绞上来。九年前这活儿是园丁干的，现在嘛……
usami[normal]: 竖井经过每一层楼。这里有检修口，三楼书斋的墙角也有一扇检修小门，二十厘米见方，手能伸进去给钢索上油。
ritsu: 书斋里还有什么特别的？
usami[think]: 我记得……天花板有一道通往四楼的活板门，很多年前就用钉子钉死了。
usami[normal]: 天花板上还有一个铁钩，挂着一只装饰用的古董鸟笼，罩着黑丝绒布。门闩是插销式的——门锁早就坏了，所以会长只能靠门闩。
usami[think]: 父亲以前负责过这座塔的修缮，他的笔记里……
usami[shock]: ……啊，没、没什么。是我自己查的资料。
: 他慌忙推了推眼镜，把手电筒的光移开了。
> 他刚才说了「父亲」。
@set ch1_d_usami
@note usami 讲解塔钟：报时重锤平时不动，敲钟时每一声落一截；重锤井从四楼通到一楼，书斋墙角有 20cm 的检修小门。提到「父亲的笔记」时慌忙改口。
@return

# ch1_dt_usami2
usami[normal]: 四点我去拿钥匙，五点前把门锁好还给会长。
usami[think]: 检查的时候我一个人就够了。人多了……反而碍事。
@return

# ch1_dt_mio
@if ch1_d_mio -> ch1_dt_mio2
: 澪坐在画架前，没有在画。她膝上放着一本旧本子，布面的封皮洗得发白，角上绣着两个小小的字：「千鹤」。
mio[normal]: ……律君。
ritsu: 那是？
mio[sad]: 千鹤的日记。
mio[normal]: 她去世前一个月，寄放在我这里的。她说：「澪，帮我收着。等我长大了再还给我。」
mio[sad]: ……她没有长大。
mio[normal]: 九年了，我一直没敢打开。
: 澪的手指在绣字上轻轻抚过，一遍又一遍。
mio[normal]: 今天是她的忌日。我想……也许今天，可以打开了。
ritsu: 你一直带在身边？
mio[smile]: 嗯。去哪里都带着。
mio[normal]: 你看，这是我调的颜色。
: 她把调色盘递过来。一角调着一小团蓝白色的颜料，在阴天里也像在发光。
mio[smile]: 我叫它「月光蓝」。白色里加一点钴蓝，再加一点点群青……比例只有我知道。
mio[normal]: 今晚要是放晴，我想用它画月光下的塔。
@set ch1_d_mio
@note mio 带着千鹤的日记（布面封皮绣着「千鹤」），说九年来一直没敢打开。调了一种蓝白色的颜料「月光蓝」，「比例只有我知道」。
@return

# ch1_dt_mio2
mio[normal]: 律君，你相信人死了以后，会变成乌鸦吗？
mio[sad]: 岛上的老人都这么说。我小时候不信。现在……有点信了。
@return

# ch1_dt_shiori
@if ch1_d_shiori -> ch1_dt_shiori2
shiori[smile]: 女士们先生们～下午场的魔术秀，现在开演！
shiori[sad]: ……观众又只有侦探君一个。这座岛上的人都太不懂得享受了。
: 柊抬起手，一张红心皇后从牌堆里浮了起来，在半空中转了个圈，落进了律的上衣口袋。
ritsu: 幻线。
shiori[smile]: 哎呀，又被拆穿了～不过，这次我可要好好介绍一下。
: 她打开牌桌角落里的黑色道具箱，取出一只透明的小线轴。
shiori[smile]: 极细的透明尼龙线，比头发还细，舞台灯一照就看不见。比钓鱼线还结实哦～
shiori[smile]: 一卷五十米。拉一只鸟笼、开一扇窗，都没问题。
shiori[normal]: 秘诀在打结。幻线打的活结，套上去稳稳的，拉到一定角度，「咻」地就自己滑开了。
shiori[smile]: 表演结束，线一收，什么痕迹都不留～这就是魔术！
ritsu: 这箱子一直放在这里？
shiori[normal]: 是啊。箱子太重了，懒得搬上楼。
shiori[smile]: 放心吧，除了我，谁会对一箱子绳子感兴趣呢？
@set ch1_d_shiori
@note shiori 展示「幻线」：比头发还细的透明尼龙线，一卷五十米。「幻线打的活结，拉到一定角度就会自己滑开。」道具箱就敞着放在交谊厅牌桌角落。
@return

# ch1_dt_shiori2
shiori[smile]: 侦探君，那张红心皇后送你了。
shiori[smile]: 送给喜欢的女孩子吧。比如……那位白手套小姐？
@return

# ch1_dt_kurata
@if ch1_d_kurata -> ch1_dt_kurata2
kurata[smile]: 哟，小哥！来得正好，你看！
: 仓田指着墙上的刀架，挺起胸膛。
kurata[smile]: 剁骨刀、主厨刀、切片刀、出刃、柳刃、菜切、小刀、削皮刀！八把，全都齐的！
kurata[smile]: 每天早上我都数一遍。厨子的刀，跟武士的刀一样，少一把都不行！
ritsu: 刀柄上刻着字？
kurata[smile]: 「仓」！我的名字。丢了也找得回来，哈哈！
kurata[angry]: 不过啊——你听我说，小哥，这事儿太气人了！
kurata[angry]: 昨晚我给大家捏了二十个饭团，放在食品柜里当今天的早饭。今早一看，少了五个！
kurata[angry]: 五个！连盘子边的腌萝卜都被拿走了！
ritsu: 半夜有人饿了吧。
kurata[normal]: 我问了一圈，谁都说没拿。恭介少爷说他只拿了酒，不破先生说他天没亮就出门了……
kurata[think]: 难道岛上真有老鼠？还是会捏饭团的老鼠？
kurata[smile]: ……算了算了！今晚我再多捏几个！
@set ch1_d_kurata
@note kurata 中午展示一套八把的刀具，「全都齐的！」刀柄上刻着「仓」字。抱怨昨晚放在食品柜的饭团少了五个，没人承认拿过。
@return

# ch1_dt_kurata2
kurata[smile]: 晚饭是炖牛肉！小哥，七点准时来啊！
kurata[normal]: 傍晚我一个人忙不过来，澪小姐说会来帮我洗菜。好姑娘啊。
@return

# ch1_dt_shio
@if ch1_d_shio -> ch1_dt_shio2
: 汐坐在厨房的长桌边，面前摆着一只空了的玻璃碗，正在舔勺子。
shio[smile]: 律君！仓田先生的抹茶冻，超——好吃！
ritsu: 这是第几碗了？
shio[smile]: 第二碗……第三碗？助手不记这种小事～
kurata[smile]: 第四碗！小姑娘，再吃下去牙要坏掉啦！
shio[smile]: 不会的哦～
: 汐把勺子往嘴里一含，然后张开嘴，「啊——」地给大家看她的牙齿。
shio[smile]: 我从小到大，一颗蛀牙都没有哦～牙医都说没见过这么好的牙！
kurata[surprise]: 哇，真的，白白净净的！
shio[smile]: 所以甜食多少都没关系～
ritsu: 这个逻辑不对吧。
shio[smile]: 律君就是爱较真。来，分你一口～
: 她把最后一勺递到律嘴边。律犹豫了一下，还是吃了。很甜，有一点苦。
@set ch1_d_shio
@note shio 一边吃甜点一边炫耀：「我从小到大一颗蛀牙都没有哦～」
@return

# ch1_dt_shio2
shio[smile]: 律君，等会儿陪我去中庭散步吧？
shio[normal]: ……我想看看那座塔。
@return

# ch1_dt_hina
@if ch1_d_hina -> ch1_dt_hina2
: 雏坐在大厅的楼梯上，抱着人偶，仰头望着高窗外的塔。
hina[normal]: 七濑先生。
hina[normal]: 快到十二点了。
@se bell
: 塔钟敲响了。雏闭上眼睛，嘴唇无声地动着。
: 钟声一共响了十二下。
hina[normal]: 十二。
hina[normal]: 鸦之塔的钟，每个整点都会敲。我每次都数。
hina[normal]: 昨晚九点，放映机响之前，是九下。今天早上七点，是七下。
ritsu: 从来没有错过？
hina[normal]: 从来没有。
hina[normal]: 钟也没有错过。
hina[think]: 姐姐说，钟是这座岛上唯一不会说谎的东西。
: 她把人偶的头轻轻转向窗外，让人偶也能看见塔。
hina[normal]: 今晚我会在交谊厅数。柊小姐说要变魔术，真白小姐说要拉琴。
hina[normal]: 七濑先生，也来吗？
@set ch1_d_hina
@note hina 「鸦之塔的钟，每个整点都会敲。我每次都数。」从未数错过。今晚会在交谊厅一边看魔术一边数钟声。
@return

# ch1_dt_hina2
hina[normal]: 千代说，七濑先生的眼睛很像姐姐。
hina[normal]: ……总是在看很远的地方。
@return

# ch1_dt_fuwa
@if ch1_d_fuwa -> ch1_dt_fuwa2
: 不破靠在大厅门边，用一截铅笔头在一本卷了边的小本子上写着什么。
fuwa[normal]: ……八月十三日，十一点二十。海蚀洞，涨潮，未进入。
ritsu: 还在做搜查记录？
fuwa[normal]: 老习惯。
fuwa[normal]: 人会忘。写下来的东西不会。
ritsu: 也会被撕掉。
fuwa[dark]: ……你小子，跟你老子一样，嘴不饶人。
@set ch1_d_fuwa
@return

# ch1_dt_fuwa2
fuwa[normal]: 下午退潮，我再去海蚀洞看看。
@return

# ch1_dt_genzou
@if ch1_d_genzou -> ch1_dt_genzou2
: 会长独自坐在餐厅的主位上，面前放着一瓶白兰地，酒已经下去了三分之一。
genzou[angry]: 七濑。又是你。
genzou[normal]: 想问九年前的事？我告诉你，那天晚上我一直在大厅陪客人，一百多个人都能作证。
genzou[normal]: 千鹤死的时候，是十一点半。御堂验过的。园丁也是你亲手抓出来的。
genzou[dark]: 那个影片说我……「亲手熄灭」……
genzou[angry]: 胡说八道！统统是胡说八道！
: 他一把抓起酒瓶，又倒了满满一杯。
@set ch1_d_genzou
@return

# ch1_dt_genzou2
genzou[angry]: 滚！别在我眼前晃！
@return

# ch1_dt_kyosuke
@if ch1_d_kyosuke -> ch1_dt_kyosuke2
kyosuke[sad]: 侦探小弟……你说老爸是不是疯了，要住进那种鬼地方。
kyosuke[normal]: 不过也好。他躲进塔里，就没人天天骂我了。
kyosuke[sad]: 就是……那件事他还没答应我。
ritsu: 什么事？
kyosuke[shock]: 没、没什么！一点小钱的事！
kyosuke[smile]: 今晚我再去跟他说。他喝了酒，心情好的时候，说不定会松口。
@set ch1_d_kyosuke
@return

# ch1_dt_kyosuke2
kyosuke[smile]: 你说，判官会不会是我老爸的哪个仇人？他的仇人可多了，哈哈……
kyosuke[sad]: ……哈。
@return

# ch1_dt_kotone
@if ch1_d_kotone -> ch1_dt_kotone2
: 琴音站在窗边调音。琴弦被她拧了一圈又一圈，音还是飘的。
kotone[angry]: 湿气。全是湿气。这种地方根本不该放乐器。
kotone[normal]: ……侦探。你那个罪状，什么意思？
ritsu: 我也想知道。
kotone[normal]: 我的是「琴弦是用谎言买来的」。
kotone[angry]: 我的琴是我一个音一个音练出来的。谁也没资格这么说。
kotone[sad]: ……谁也没有。
@set ch1_d_kotone
@return

# ch1_dt_kotone2
kotone[normal]: 今晚我在这儿拉琴。不是拉给你们听的，是琴需要拉。
@return

# ch1_dt_kuga
@if ch1_d_kuga -> ch1_dt_kuga2
kuga[smile]: 七濑君。昨晚那些「罪状」，敝人越想越觉得有构成名誉毁损之嫌。
kuga[normal]: 等回到本岛，敝人一定要追究到底。证据、证人、程序，一样都不能少。
kuga[sad]: 只是……「出卖了你的委托人」……这种说法实在是……
: 他用手杖的尖端敲了敲地毯，没有说完。
@set ch1_d_kuga
@return

# ch1_dt_kuga2
kuga[smile]: 无论如何，敝人建议各位，今晚都待在人多的地方。这是最基本的风险管理。
@return

# ch1_dt_kiryu
@if ch1_d_kiryu -> ch1_dt_kiryu2
: 桐生坐在藏书室的书桌边，翻着一本发黄的账簿，烟灰缸里堆满了烟头。
kiryu[smile]: 哟，名侦探。这地方是个宝库啊。鹭宫家百年的账，全在这儿。
kiryu[normal]: 九年前我来采访，这间屋子是锁着的。现在随便进。
ritsu: 你在找什么？
kiryu[smile]: 记者的本能。说不定能找到「新的证据」嘛。
kiryu[dark]: 判官说我「把一个无辜的人钉上了十字架」。你说好笑不好笑？
kiryu[dark]: 那个十字架，是你和你老子亲手递给我的，名侦探。
@set ch1_d_kiryu
@return

# ch1_dt_kiryu2
kiryu[normal]: 这扇窗打不开，烟散不出去。也只有这点不好。
@return

# ch1_dt_shizuka
@if ch1_d_shizuka -> ch1_dt_shizuka2
: 御堂从书架上抽出一本厚厚的德文医学书，掸了掸灰。
shizuka[normal]: 鹭宫老先生是个读书人。这里的医学书，比我医院的图书室还全。
shizuka[normal]: 七濑君。你昨晚睡着了吗？
ritsu: 不太好。
shizuka[normal]: 我也是。
shizuka[normal]: 我每晚睡前吃一粒安眠药。昨晚吃了，还是没睡着。
@set ch1_d_shizuka
@return

# ch1_dt_shizuka2
shizuka[normal]: 「篡改了死亡的时刻」……
shizuka[normal]: 医生写下的时间，就是法律上的时间。仅此而已。
@return

# ch1_day_end
@bg courtyard
@bgm calm
@caption 8月13日 13:30 中庭
: 午饭后，汐拉着律到中庭散步。
: 云层薄了一些，偶尔漏下一缕淡淡的阳光，照在湿漉漉的石板上。喷泉早就干了，池底积着落叶和雨水。
@show shio[smile] C
shio[smile]: 律君，你看。今天的乌鸦好像特别多。
ritsu: 忌日嘛。
shio[think]: 乌鸦也知道忌日吗？
ritsu: ……不知道。随口说的。
shio[smile]: 律君难得说这种不讲逻辑的话～我要记下来。
: 她翻开红色笔记本，煞有介事地写了几笔。然后，她停下了脚步。
: 汐仰着头，望着鸦之塔的塔顶。
: 塔顶的瞭望台被一圈黑色的铁栏杆围着。一条细细的缆索从山丘那边斜拉过来，系在栏杆外侧的铁环上。
shio[normal]: ……
ritsu: 汐？
shio[normal]: 那个栏杆，是新的呢。
ritsu: 嗯？
shio[normal]: 塔那么旧，栏杆却是新的。黑漆亮亮的。
ritsu: 大概修过吧。
shio[normal]: 嗯。大概修过吧。
: 汐又看了一会儿，久到律以为她不会再开口了。
shio[smile]: ——律君，九年前，你上去过吗？
ritsu: 塔顶？
ritsu: ……不记得了。应该没有吧。那里是禁止进入的。
shio[smile]: 嗯～律君是乖孩子嘛。
: 她笑着转过身，白手套在身后背成一个结。
shio[smile]: 走吧走吧！下午还有好多时间，律君想和谁聊聊？
@hide
> 下午还有些时间。去找人聊聊吧。
@freetime 2
@bg hall
@bgm mystery
@caption 17:00 大厅
: 五点。塔钟敲响了五下。雏坐在楼梯上，嘴唇无声地数着。
: 宇佐见从渡廊那边快步走来，额头上冒着汗，手里捏着那把黄铜钥匙。会长正坐在大厅的沙发上等他。
usami[normal]: 会长，书斋检查完了。
genzou[normal]: 说。
usami[normal]: 门是橡木的，很结实，门闩完好。窗户的插销也没问题，外墙光滑，没法攀爬。
usami[normal]: 天花板的活板门用钉子钉得很死，墙角的检修小门只有二十厘米，人钻不过去。
usami[normal]: 我检查的时候只有我一个人，门一直关着。出来以后，我锁好了门。
: 宇佐见双手把钥匙递了过去。会长接过钥匙，「咔」地一声扣回怀表链上，拍了拍马甲口袋。
genzou[normal]: 很好。从现在起，这把钥匙一刻也不会离开我。
genzou[dark]: 谁想动我，先得撞开那扇门。
> 钥匙，回到了会长身上。
@bg kitchen
@caption 18:20 厨房
: 晚饭前，律路过厨房门口。里面热气腾腾，炖锅咕嘟咕嘟地响着。
: 澪站在水槽前，挽着袖子洗萝卜。她的罩衫上沾着几点颜料，手指冻得发红。
kurata[smile]: 哟，小哥！来帮忙？不帮忙就别挡道！
kurata[smile]: 澪小姐可真是好姑娘，主动来帮我洗菜。哪像某位少爷——
kyosuke[normal]: 冰块，冰块。我就拿点冰块。
: 恭介从冰柜里抓了一把冰，丢进杯子，摇摇晃晃地出去了。
mio[smile]: ……律君。晚饭是炖牛肉哦。
ritsu: 仓田先生说过了。
mio[normal]: 洗完这些，我就回去准备画具。今晚要是能放晴就好了。
: 她低下头，继续洗那只萝卜。水哗哗地流着。
: 墙上的刀架上，刀刃在灯下排成一列。律没有数。
> 那时候，我没有数。
@fade out
@wait 400
@bg dining
@fade in
@caption 19:00 餐厅
: 晚饭时，云层渐渐散开了。窗外的天空露出一块深蓝，一颗星星孤零零地亮着。
: 炖牛肉的香味飘满了餐厅。可是仓田从厨房出来的时候，脸色白得像他的围裙。
kurata[shock]: 少、少了一把！
genzou[angry]: 什么少了？
kurata[shock]: 刀！我的柳刃！最细最长的那把！
kurata[sad]: 六点我数过，八把都在。刚才要切肉，一摸——空了一格！
fuwa[normal]: 六点到七点之间。
fuwa[normal]: 那段时间，谁进过厨房。
kurata[think]: 呃……澪小姐来帮我洗过菜，从六点一刻洗到差不多六点三刻……
kurata[think]: 恭介少爷来要过冰块。桐生先生来倒过咖啡。
kurata[sad]: 还有……六点半左右我下酒窖去拿红酒，去了好几分钟，那时候厨房里没人看着……
kyosuke[shock]: 我、我就拿了冰块！拿完就走了！
kiryu[smile]: 我倒的是咖啡，不是刀。
mio[normal]: ……我一直在水槽边洗菜。没有注意。
genzou[angry]: 仓田！你这个蠢货，连自己的刀都看不住！
kurata[sad]: 对、对不起，会长……
genzou[angry]: 九年前你就是这样！让你办一点小事都——
: 会长突然住了口。仓田的脸色更白了。
genzou[angry]: ……哼。
fuwa[normal]: 刀丢了。都小心。晚上锁门。
fuwa[normal]: 海蚀洞，潮没退下去，没进去。明天再说。
: 餐桌上的气氛凝固了。只有刀叉碰撞的声音，和雏小口吹凉汤的声音。
@wait 300
: 七点五十五分，澪轻轻放下了餐巾，站起身。
mio[normal]: 我先失陪了。云散开了，我想去中庭画画。
mio[smile]: ……律君。
ritsu: 嗯？
mio[smile]: 今晚九点前后，来中庭看月亮吧。云要散了，从中庭看塔，会很美的。
shio[smile]: 我也要去！
mio[smile]: 嗯，一起来。
: 澪微微一笑，走出了餐厅。
@caption 20:00 餐厅
@se bell
: 塔钟响了。雏放下勺子。
hina[normal]: 一、二、三、四、五、六、七、八。
hina[normal]: 八点。
@caption 20:12 餐厅
: 八点十分过后，会长推开椅子站了起来。
genzou[normal]: 仓田，白兰地。
kurata[normal]: 是、是。
: 仓田捧来一瓶新开的白兰地和一只酒杯。会长一手一样，挺着胸往外走。
genzou[normal]: 我进塔了。
genzou[angry]: 明早七点之前，谁敢来敲我的门，我就让他滚出这座岛！
kyosuke[sad]: 老爸，那件事……
genzou[angry]: 闭嘴！
: 门「砰」地关上了。透过餐厅的窗户，律看见会长的身影穿过中庭，走进了塔底的门。那时是八点一刻。
@caption 20:20 交谊厅
@bg lounge
@bgm calm
: 晚饭后，大部分人聚到了交谊厅。没有人想一个人待着。
: 柊在牌桌边摆开了她的道具，琴音在窗边调音，雏抱着人偶坐在钢琴凳上。御堂和久我坐在沙发两头，仓田端来一壶热茶。
: 不破说要去本馆正门的门廊抽烟。桐生说要回房间写稿。宇佐见说要去藏书室查点资料，走向了二楼的渡廊。
kyosuke[angry]: ……不行，我还是得去说。
kyosuke[sad]: 我去找老头子。他喝了酒，说不定会松口。
: 八点二十五分，恭介灌了一口威士忌，晃晃悠悠地出去了。
shiori[smile]: 女士们先生们～今晚的特别节目，现在开始！
: 扑克牌在空中飞舞，丝绸手帕变成了一朵纸花。琴音拉起了一段慢板，琴声在潮湿的空气里有点发闷。
: 雏一边看魔术，一边不时地抬头望向窗外——窗外看得见塔的钟面。
kuga[smile]: 柊小姐的手法，敝人看了三遍都没看出破绽。佩服，佩服。
shizuka[normal]: 你只看了两遍。第三遍你在打瞌睡。
kuga[sad]: ……御堂医生还是一如既往地严格。
kurata[smile]: 来来来，热茶！喝了暖和！今晚谁也别一个人回房间啊，人多胆子大！
hina[normal]: 仓田先生。现在是八点三十二分。
kurata[surprise]: 诶？哦、哦，谢谢……
hina[normal]: 下一次钟声，是九点。九下。
: 雏把人偶放在钢琴盖上，让它也面朝着窗外。
kotone[angry]: 你能不能别老报时？我在数拍子。
hina[normal]: 对不起。
kotone[normal]: ……算了。你数你的，我拉我的。
@show shio[smile] C
shio[smile]: 律君律君，快到九点了哦！
ritsu: 才八点四十五。
shio[smile]: 去中庭要走好一会儿嘛！澪小姐等着呢，月亮也等着呢～
@hide
: 律被汐拽着站了起来。交谊厅里，柊正在把一枚硬币变进琴音的琴盒，琴音气得跺脚。
@bg courtyard
@filter night
@bgm island
@caption 20:50 中庭
: 中庭里很安静。雨后的空气凉丝丝的，石板路上的水洼映着天光。
: 云层裂开了一道缝。月亮从缝里露出来，清冷的光落在鸦之塔上。
: 塔的三楼，书斋的窗户里亮着一盏暖黄色的灯。
: 澪坐在屋檐下的画架前。提灯放在脚边，她正用细笔在画布上点着什么。
mio[smile]: ……你们来了。
shio[smile]: 哇——！
: 画布上，月光下的黑色石塔静静矗立，钟面泛着淡淡的银光。三楼那扇窗里，透着一点暖黄。
shio[smile]: 好漂亮！和真的一模一样！
mio[smile]: 还没画完呢。月光的颜色最难。
: 澪的罩衫上、手指上沾满了颜料。那团蓝白色的「月光蓝」在调色盘上闪着微光。
ritsu: 你一直在这里画？
mio[normal]: 嗯。八点就来了。
mio[normal]: 恭介先生八点半前后进了一次塔，很快就出来了。脸色很难看。
mio[sad]: 好像和会长吵架了……
: 她垂下眼睛，又在画布上添了一笔。
shio[smile]: 律君律君，你看月亮！
: 汐指着天空。一只乌鸦从月亮前飞过，翅膀的影子划过塔顶。
> 很安静。安静得能听见远处的海浪。
> 澪在画画，汐在看月亮。塔上的窗户亮着灯。
> 好像什么都不会发生。
@caption 21:00 中庭
@bgm stop
@se bell
: 塔钟响了。
: 沉重的钟声从头顶压下来，一声，又一声。中庭的石墙把声音来回反弹，嗡嗡作响。
> 我没有数。
> 我在看月亮，看塔，看那扇亮着灯的窗户。
@se bell
: 钟声还在响。
@se glass
@flash white
: ——塔上传来一声清脆的碎裂声。
: 三楼的灯，灭了。
@se crash
: 紧接着，书斋的窗户「砰」地一声猛地向外打开。窗帘像一面白旗，被风卷出了窗外，疯狂地翻飞。
@se scream
@shake
: 然后是一声惨叫。
: 尖锐、扭曲、拖得很长，像是有人被生生撕开喉咙——在夜空里划出一道裂口，又戛然而止。
@bgm horror
: 钟声停了。
shio[shock]: 律、律君……！
mio[shock]: ……是玄藏先生的声音！
mio[shock]: 是玄藏先生！
ritsu: ——走！
@bg tower_stairs
@caption 21:02 鸦之塔·一楼
@se footsteps
: 塔底的门没有锁。律一把推开，冲上了螺旋楼梯。
: 石阶又窄又陡，一圈，又一圈。汐的脚步声紧跟在后面，再后面是澪急促的喘息。
: 二楼。一扇关着的门。
: 三楼——
@bg black
@caption 21:04 鸦之塔·三楼 书斋门外
@se knock
ritsu: 会长！鹭宫会长！
: 律用拳头砸门。橡木门纹丝不动。
@se knock
ritsu: 会长！能听见吗！
: 没有回答。门缝底下一片漆黑。
: 律抓住把手往里推。门只晃了一下，就被什么东西死死地卡住了。
ritsu: ……闩着。从里面。
mio[shock]: 怎么会……怎么会……
: 澪靠着石墙滑坐在台阶上，双手捂着嘴。
@se door
: 楼下传来开门声。有人跑上楼来，脚步声又急又乱。
usami[shock]: 七、七濑先生！发生什么事了？我在藏书室，听到上面——
ritsu: 门从里面闩上了。会长没有回应。
usami[shock]: 门闩……那扇门，从外面是打不开的……
ritsu: 汐！去叫不破先生！还有御堂医生！
shio[shock]: 嗯！
: 汐转身冲下了楼梯。白色的裙摆在黑暗中一闪就不见了。
: 律又砸了几下门。宇佐见站在他身后，嘴唇发抖，一句话也说不出来。
: 台阶上，澪抱着膝盖，把脸埋在了臂弯里。
@caption 21:08 书斋门外
@se footsteps
: 不破第一个冲了上来。他的风衣上还带着烟味，手里握着一支手电筒。
: 汐跟在他后面，上气不接下气。再往下，楼梯上传来更多人的脚步声和叫喊声。
fuwa[angry]: 让开！
: 不破抓住把手试了一下，二话不说，退后一步，用肩膀狠狠撞了上去。
@se crash
@shake
: 门板发出一声闷响。没开。
fuwa[angry]: ……再来！
@se crash
@shake
: 第二下。门框的木屑簌簌地往下掉。
@se crash
@shake
@flash white
: 第三下。门闩的插座连着螺丝一起从门框上被硬生生扯了下来，门「轰」地向里撞开。
@bg study
@filter night
@caption 21:12 鸦之塔·书斋
fuwa[angry]: 都别进来！
: 不破的手电光扫过黑漆漆的房间。
: 冷风从大开的窗户灌进来，窗帘被雨前的风吹得啪啪作响。
: 地上，台灯的玻璃灯罩碎成了一片片，在手电光里闪烁。
: 光束移向窗边——
@se heartbeat
: 鹭宫玄藏仰面倒在窗下。
: 他的胸口盖着一块黑色的丝绒布。布的中央高高地凸起一截黑色的木柄。
: 天花板的铁钩上，吊着那只古董鸟笼。笼门大开着，里面静静地躺着一根乌鸦的羽毛。
@poem 一只乌鸦锁进笼，月光照不到它的胸。
> ……童谣。
> 判官说，七只乌鸦将依次坠落。
fuwa[normal]: ……小鬼，进来。别碰东西。
: 律跨过门槛。不破跪在会长身边，手指按上他的脖子，停了很久。
fuwa[dark]: 死了。
: 律回头看了一眼门。门闩的插销还插在插座里——插座连着螺丝，一起被撞了下来。
> 门闩确实是闩上的。
@se footsteps
: 楼梯上挤满了人。仓田、恭介、柊、琴音……每一张脸都在手电光的边缘若隐若现。
kyosuke[shock]: 老、老爸……？
kyosuke[shock]: 老爸——！
fuwa[angry]: 别进来！保护现场！
: 恭介被仓田一把拉住，瘫软在楼梯上。
: 汐蹲在楼梯拐角，紧紧搂着澪的肩膀。澪一动不动地坐在台阶上，望着敞开的门，像一尊石像。
@caption 21:20 书斋
: 御堂提着她的出诊包赶到了。她面无表情地跨过门槛，在尸体旁跪下，戴上了手套。
shizuka[normal]: 手电，照这里。
: 她掀开黑布的一角看了看，又放了回去。
shizuka[normal]: 单刀。从正面刺入，刺穿心脏。几乎是当场死亡。
shizuka[normal]: 体温还很高。死后……不到一个小时。
shizuka[normal]: 更精确的，我说不了。
@se thunder
@weather rain
: 窗外打了一个闷雷。雨点开始落下来，斜斜地打进敞开的窗户，打湿了窗帘。
@bgm judge
@se phone
: ——就在这时，塔里不知什么地方，响起了「滋滋」的电流声。
: 是广播喇叭。挂在楼梯口墙上，一只锈迹斑斑的旧喇叭。
judge: 晚上好，各位。
judge: 一只乌鸦锁进笼，月光照不到它的胸。
judge: 第一只乌鸦，已经坠落。
judge: 明天上午十点，审判厅。所有人必须到场。
judge: 找出凶手吧。在那之前——请好好睡觉。
@se phone
: 滋的一声，喇叭沉默了。只剩下雨声。
kiryu[dark]: ……好好睡觉，是吧。
: 不知什么时候，桐生也站在了楼梯口，嘴里叼着没点着的烟。
kuga[shock]: 审、审判……按照那个规则，如果我们指认错了……
kotone[shock]: 所有人都要永远留在这里……？
fuwa[angry]: 都闭嘴。
@bgm tension
fuwa[normal]: 现场我来守。谁也不许碰这间屋子里的东西。
fuwa[normal]: 小鬼。
ritsu: 嗯。
fuwa[normal]: 你查。
fuwa[normal]: 你老子当年怎么查的，你就怎么查。
> ……父亲。
: 律握紧了左手。掌心的旧疤隐隐发烫。
@show shio[normal] C
shio[normal]: 律君。我也帮忙。
shio[sad]: 澪小姐不肯进屋，说要在中庭待着……我刚才陪她下去了。仓田先生拿了毯子给她。
shio[normal]: 其他人都去交谊厅和大厅了。大家都在等律君问话。
ritsu: 好。
shio[smile]: ……侦探的时间，到了哦。
@hide
> 先整理一下我自己看到的事。
> 九点，钟声响起。塔上传来碎裂声，灯灭了，窗户猛地打开。然后是那声惨叫。澪说，那是会长的声音。
@get ch1_scream
> 门从里面闩着。窗外是十二米高的光滑石墙。
> 凶手是怎么离开这个房间的？
@explore ch1_inv

// ================= 搜查：书斋 =================
# ch1_i_body
@if has:ch1_autopsy -> ch1_i_body2
: 鹭宫玄藏仰面躺在窗下，眼睛半睁着，嘴巴微张，像是想说什么。
: 黑丝绒布盖在他的胸口，布中央凸起一截黑檀木的刀柄。
shizuka[normal]: 七濑君。要看就看仔细。
: 御堂掀开黑布。刀深深地没入胸口，只剩刀柄露在外面。伤口周围的衬衫被血浸透，血已经有些发暗、发黏。
shizuka[normal]: 单刀，从正面刺入，刺穿心脏。几乎是当场死亡。没有第二处伤口。
shizuka[normal]: 双手没有抵抗伤。他是在毫无防备的时候，被人从正面一刀刺中的。
ritsu: 死亡时间呢？
shizuka[normal]: 我九点二十检查的时候，体温还很高。死后不到一个小时。
shizuka[normal]: 你看伤口周围，血已经开始凝固了。
ritsu: 那能说明什么？
shizuka[normal]: 能说明他不是一分钟前死的。至于是二十分钟，还是四十分钟……
shizuka[normal]: 我分不出来。没有设备，谁也分不出来。
@get ch1_autopsy
: 刀柄是黑檀木的。柄尾刻着一个小小的「仓」字。
> 仓田先生的刀。晚饭前丢的那把柳刃。
@get ch1_knife
: 会长的怀表链从马甲口袋里垂下来。链子末端，那把黄铜钥匙还好好地挂着。
> 唯一的钥匙，还在他身上。
@return

# ch1_i_body2
: 会长的遗体还躺在窗下。雨点从窗外斜斜地飘进来，落在他的鞋尖上。
> 毫无防备，从正面一刀。他是让凶手走到自己面前的。
@return

# ch1_it_shizuka
@if !has:ch1_autopsy -> ch1_i_body
shizuka[normal]: 我能说的都说了。死后不到一小时，单刀刺穿心脏。
shizuka[normal]: 你们都觉得九点那声惨叫就是他死的时候吧。
ritsu: 难道不是？
shizuka[normal]: 我没这么说。我只是说，从尸体上，看不出区别。
shizuka[think]: 只是有一点……被人一刀刺穿心脏，很难再发出那么长、那么响的惨叫。
shizuka[normal]: 当然，人体总有例外。
@return

# ch1_i_cage
: 鸟笼挂在天花板的铁钩上，黄铜的笼条已经发黑。笼门大敞着。
: 笼底躺着一根乌鸦羽毛，又黑又亮，像是刚从鸟身上拔下来的。
: 原本罩着鸟笼的那块黑丝绒布，此刻正盖在会长的胸口上。
> 一只乌鸦锁进笼，月光照不到它的胸。
> 打开的笼子、笼中的羽毛、遮住胸口的黑布……凶手照着童谣，把现场布置成了这个样子。
> 布置这些，需要时间。
@get ch1_cage
@return

# ch1_i_bolt
: 门闩是一根黄铜插销，装在门的内侧。插座被不破撞了下来，连着螺丝一起，还套在插销上。
> 插销是推到底的。破门的时候，门的确闩着。
: 律用手电凑近照着插销的把手。那是一个小小的球形握柄，下面是细细的颈。
: 颈上有一圈极细的、新的磨痕。黄铜被磨出了一道亮线，像是有一根细线绕在上面，被用力拉过。
> 用手插门闩，不会留下这种痕迹。
@get ch1_bolt
@return

# ch1_i_door
@if ch1_i_door_seen -> ch1_i_door2
: 厚重的橡木门向内敞着，门框上被撞出了一道裂口。外侧的把手是铸铁的，内侧也是。
> 门没有被撬过的痕迹。锁早就坏了，平时只靠门闩。
> ……门的内侧太暗了。得再仔细照一照。
@set ch1_i_door_seen
@return

# ch1_i_door2
@if has:ch1_paint -> ch1_i_door3
: 律蹲下来，把手电筒贴近门的内侧，一寸一寸地照。
: 内侧把手的背面——握住它时，手指正好会碰到的地方——有一点颜色。
: 蓝里透白。像月光落在水面上。
: 律用指尖碰了一下。还是软的，没干。
> 油画颜料。
> 这个颜色……我今天中午见过。调色盘的一角，那团「月光蓝」。
> 破门以后，进过这间屋子的只有不破先生、我和御堂医生。不破先生是用肩膀撞的门。
> 澪呢？她一直坐在门外的楼梯上，汐搂着她。她没有进来过。
> 那么，这点颜料是什么时候、怎么沾到门「里面」的把手上的？
@get ch1_paint
@return

# ch1_i_door3
> 内侧把手背面的月光蓝。门里面的人，握着它开过门。
@return

# ch1_i_window
: 窗户大敞着，两扇窗扇被风推得紧贴在外墙上。窗帘湿透了，沉甸甸地垂着。
: 窗户的插销是一根铁栓，原本插在窗框的孔里。插销的握柄上，有一道新的划痕，铁锈被刮掉了一小条。
: 律探出身去。雨打在脸上。
: 窗外是光滑的黑色石墙，没有窗台，没有排水管，没有藤蔓。往下看，十二米外的中庭只是一片模糊的黑暗。
> 没有任何能落脚、能抓手的地方。
> 下面的地面……从这里看不清。得下去看看。
@get ch1_window
@return

# ch1_i_lamp
: 黄铜台灯摔在地上，灯罩碎成了好几片，灯泡只剩下一截灯丝。
: 奇怪的是，它落在离书桌一米多远的地方，倒向窗户那一边。
> 碰倒的东西，会落在桌子旁边。这盏灯却像是被什么东西拽着飞了出去。
: 律捡起灯座看了看。细长的灯颈上，有一道细细的勒痕，和门闩把手上的痕迹很像。
@get ch1_lamp
@return

# ch1_i_hook
: 律搬来书桌前的椅子，站上去，用手电照着天花板。
: 鸟笼挂在一只老旧的铁钩上。钩子锈得发红，表面坑坑洼洼。
: 可是钩子弯曲的内侧，却有一道新的、发亮的摩擦痕。锈被磨掉了，露出底下灰白的铁。
> 鸟笼的提环挂在钩子的根部，蹭不到那个位置。
> 有别的什么东西，在这只钩子上被拖过。很细，力气却不小。
@get ch1_hook
@return

# ch1_i_hatch
: 墙角的石墙上嵌着一扇小铁门，二十厘米见方。门是虚掩着的，留着一条缝。
> 宇佐见先生说过的检修小门。里面就是重锤井。
: 律打开小门，用手电往里照。黑洞洞的竖井里垂着两根钢索，一直往下，看不到底。冷风从井底往上冒。
: 关门时，手电光在铰链上一闪。
: 铰链的缝里，挂着一丝透明的纤维。细得几乎看不见，只有在光线下才会反出一点亮。
> ……线。
> 只有一丝。其余的部分，去了哪里？
@get ch1_hatch
@return

# ch1_i_trapdoor
: 天花板正中有一道方形的活板门，通往四楼的机械室。
: 律站在椅子上仔细看。四个角各钉着一根粗大的铁钉，钉帽锈得和木板长在了一起。
: 钉帽周围的锈层完好无损，木板上没有新的撬痕。
> 这道门，很多年没有人打开过了。
@get ch1_trapdoor
@return

# ch1_i_fireplace
@if has:ch1_diary -> ch1_i_fireplace2
: 壁炉里的火已经快熄了，只剩一层暗红的余烬。会长大概是嫌塔里潮，进来就生了火。
: 律用火钳拨了拨灰烬。
: 灰里埋着一块焦黑的布片。拨出来，抖掉灰——是一块布面的书封，边缘烧得卷了起来。
: 封面的一角，绣着两个小小的字。
@se heartbeat
: 「千鹤」。
> ……这是澪的日记。
> 千鹤小姐寄放在她那里的日记。她今天中午还抱在膝上，说九年来一直没敢打开。
> 为什么会在会长的壁炉里？
: 书页几乎全烧光了，只剩装订线上几片焦黄的碎边，看不出写了什么。
@get ch1_diary
@return

# ch1_i_fireplace2
> 千鹤小姐的日记，被扔进了火里。是会长自己扔的吗？还是……
@return

# ch1_i_desk
: 书桌上放着一瓶白兰地，下去了三分之一。旁边是一只酒杯，还剩半杯。
: 几张信纸散在桌上，都是空白的。原本放台灯的位置，留着一圈没有灰的圆印。
@if has:ch1_brandy -> ch1_i_desk2
shizuka[normal]: 酒我闻过了。只有酒味。
shizuka[normal]: 出诊包里有简易试纸，常见的安眠药、毒物，都没有反应。
shizuka[normal]: 他不是被下了药之后才被杀的。他死的时候，是清醒的。
@get ch1_brandy
@return

# ch1_i_desk2
> 清醒地、毫无防备地，被人从正面刺中。
@return

// ================= 搜查：塔一楼 / 藏书室 / 机械室 =================
# ch1_i_shaft
@if has:ch1_line -> ch1_i_shaft2
: 一楼墙角，重锤井底部的检修口。生锈的搭扣挂着，没有上锁。
: 律蹲下来打开铁门，手电光照进井底。
: 走时重锤挂在半腰。报时重锤却已经垂到了离井底不到一米的地方——没人上弦，它一天天往下落，今晚又落了一截。
: 报时重锤的钢索上，缠着什么东西。
: 律把手伸进去，小心地解下来。是一团线——极细、透明，在手电光里几乎看不见，只有转动时才闪出一点光。
: 线团乱成一团，上面还留着几个小小的折痕，像是打过结、又散开了。
> 透明的尼龙线。比头发还细。
> 书斋检修门铰链上的那一丝纤维……就是它。
> 这团线从三楼的书斋，顺着重锤井，一路被拖到了这里。缠在报时重锤的钢索上。
@get ch1_line
@return

# ch1_i_shaft2
> 线缠在报时重锤的钢索上。不是被人拉走的——是被重锤带下来的。
@return

# ch1_i_weights
: 竖井里垂着两根钢索。一根挂着走时重锤，一根挂着报时重锤。
> 宇佐见先生说：报时重锤平时不动，只在敲钟时一截一截地往下落。
> 九点，敲了九下……它就落了九截。
@return

# ch1_i_towerdoor
: 塔一楼的门朝着中庭，木门上没有锁，只有一个旧门环。
: 从门口望出去，雨幕中能看见屋檐下澪的画架，还有那盏昏黄的提灯。
> 从中庭进塔，就得从画架前面经过。
> 澪说，八点半前后她看见恭介先生进了塔，很快又出来了。
@return

# ch1_i_spiral
: 螺旋楼梯湿漉漉的，台阶上留着一片杂乱的泥脚印——刚才十几个人上上下下踩出来的，已经分不清谁是谁了。
: 二楼那扇通往藏书室的门敞着。宇佐见就是从那里跑上来的。
@return

# ch1_it_fuwa
@if ch1_i_fuwa_talked -> ch1_it_fuwa2
: 不破搬了一把椅子坐在塔一楼的门内，手电筒搁在膝上。
fuwa[normal]: 现场我守着。有屁快放。
ritsu: 八点半到九点，您在哪里？
fuwa[normal]: 本馆正门的门廊。抽烟。
fuwa[normal]: 一个人。没人作证。
fuwa[normal]: 门廊在宅子正面，看不见中庭，也看不见塔门。九点过后听见汐那丫头在大厅喊，才跑过来。
: 不破从风衣口袋里摸出那本卷边的小本子，舔了舔铅笔头。
fuwa[normal]: 你查到什么，一样一样说。我记。
ritsu: ……你不信我的记性？
fuwa[normal]: 我谁的记性都不信。
fuwa[dark]: 包括我自己的。
@set ch1_i_fuwa_talked
@return

# ch1_it_fuwa2
fuwa[normal]: 塔门没锁。谁都能从中庭进来。
fuwa[normal]: 还有一条路——本馆二楼的渡廊，进藏书室，开门上楼梯。
@return

# ch1_i_libwin
: 藏书室的窗户嵌在厚厚的石墙里。玻璃发绿，四边用灰浆封死在石框中。
: 律用手推了推。纹丝不动。没有把手，没有合页，没有插销。
> 封死的固定窗。别说人，连只猫都钻不出去。
> 这里在书斋正下方。如果有人想从藏书室爬上书斋——窗户这条路，是走不通的。
@get ch1_libwin
@return

# ch1_i_blueprints
: 书桌上摊着一大叠泛黄的图纸，被几本厚书压着角。是鸦之塔的结构图：剖面、立面、钟的机械……
: 图纸右下角的签章已经褪色，只看得清「……工务店」和年份「1983」。
: 抽屉被拉开了一半，里面的东西翻得乱七八糟，像是有人急着找什么。
> 宇佐见先生说他在「查资料」。
> 他在找的，真的是酒店改建用的图纸吗？
@return

# ch1_i_bridge
: 藏书室通往本馆二楼的渡廊。细长的石廊，两侧是窗，窗外是雨夜的中庭。
> 从宅子里进塔，不必经过中庭——走这里，谁也看不见。
@return

# ch1_it_usami
@if has:ch1_usami -> ch1_it_usami2
: 宇佐见坐在藏书室的书桌边，双手捧着一杯早就凉了的茶。听到脚步声，他像被烫了一下似的站了起来。
usami[shock]: 七濑先生……！
ritsu: 能说说今晚的事吗？
usami[normal]: 嗯、嗯。我按顺序说。
usami[normal]: 下午四点，我从会长手里拿到钥匙，一个人进书斋检查。门、窗、墙、天花板……都没问题。
usami[normal]: 五点，我锁上门，在大厅亲手把钥匙还给了会长。七濑先生当时也在吧？
ritsu: 在。会长把它挂在了怀表链上。
usami[normal]: 对。晚饭的时候，会长还把钥匙拿出来晃给大家看。
usami[normal]: 所以，在会长八点一刻进塔之前，书斋一直是锁着的。钥匙只有那一把，谁也进不去。
@get ch1_usami
ritsu: 晚饭后呢？
usami[normal]: 我……八点半前后，走渡廊进了这里。
usami[normal]: 刚进门的时候，隐约听见楼上有人吵架。好像是恭介先生的声音，还有会长吼了一声什么。
usami[normal]: 之后我就一直在这里看图纸，直到九点……听到上面「哗啦」一声，还有那声惨叫，我就打开通往楼梯的门跑了上去。
ritsu: 你在看什么图纸？
usami[shock]: ……
usami[normal]: 是……酒店改建要用的。塔的旧结构图。
usami[normal]: 会长说想把塔改成观景台。我想先确认一下承重。
: 他推眼镜的手指又在发抖了。
> 那叠图纸上的签章是 1983 年的「工务店」。
> 他说了「父亲」，又慌忙改口……他在隐瞒什么。
@return

# ch1_it_usami2
usami[normal]: 我……我真的一直在这里。可是没有人能证明。
usami[sad]: 偏偏就在书斋的正下方。我知道这有多可疑……
@return

# ch1_i_gears
: 四楼机械室里，巨大的铸铁齿轮一层叠着一层，在手电光里投下交错的影子。空气里有一股机油和铁锈的味道。
: 齿轮组分成两套：一套带动指针，一套带动钟锤。报时的那一套连着一只扇叶状的调速器，旁边是一个刻着缺口的圆盘。
> 钟锤每敲一下，重锤就落一截，带动齿轮转一格。
> 如果有什么东西拖住了重锤……齿轮就转不动，钟锤也就举不起来了吧。
@return

# ch1_i_drum
: 报时那一套齿轮的下方，是一只缠着钢索的鼓轮。钢索从鼓轮上放下来，穿过地板上的孔，垂进重锤井。
: 鼓轮上的钢索已经所剩无几。
> 没人上弦。再过几天，这只钟就要哑了。
@return

# ch1_i_balconydoor
: 通往瞭望台的门，门闩从机械室这一侧插得好好的。闩上积着一层灰，没有被碰过的痕迹。
> 没有人从瞭望台进出过。
@return

# ch1_i_floorhatch
: 机械室的地板上，正对着书斋天花板的地方，有一块方形的木板。
: 木板上压着一只沉重的旧工具箱，工具箱和木板上落满了厚厚的灰，灰上连一个指印都没有。
> 从上面看也一样。活板门很多年没人碰过了。
@return

// ================= 搜查：中庭 / 交谊厅 / 厨房 / 大厅 =================
# ch1_i_ground
: 律打着手电，走到塔下，站在书斋窗户的正下方。
: 窗下是一片花坛。白天下过雨，泥土松软得像揉过的面团，手指一按就是一个坑。
: 雨是九点二十分才开始下的，下得不大。泥地上的每一道痕迹都还清清楚楚——几片落叶，一只乌鸦的爪印，还有从窗口飘落下来的几片碎玻璃。
: 没有脚印。没有梯子压出的坑。没有绳子拖过的痕迹。
> 九点过后要是有人从窗口逃下来，或者搭梯子爬上去，这片泥地不可能这么干净。
@if has:ch1_window -> ch1_i_ground2
@get ch1_window
# ch1_i_ground2
@update ch1_window 窗户大开，窗帘被雨打湿。窗外是光滑的石墙，离地约 12 米，没有任何落脚处。窗户插销上有一道新划痕。窗下的花坛泥地松软，却没有脚印、没有梯子的压痕，什么都没有。
@set ch1_i_ground_done
@return

# ch1_i_easel
: 屋檐下，澪的画架还立着。画布上，月光下的鸦之塔已经快完成了——钟面泛着银光，三楼的窗户里透着一点暖黄。
: 小桌上摆着调色盘、一排颜料管和画笔。调色盘的一角，那团「月光蓝」已经用掉了大半。
: 一瓶松节油立在桌角，瓶盖拧得紧紧的。瓶身干干净净，没有一滴洒出来的痕迹。
: 脚边的提灯还亮着。灯罩的玻璃擦得透亮，没有被火燎过的黑印，也闻不到松节油烧焦的味道。
@set ch1_i_easel_seen
@if has:ch1_mio_burn -> ch1_i_easel_upd
@return

# ch1_i_easel_upd
> 「松节油打翻在提灯上」……可是瓶子和灯，都干干净净的。
@update ch1_mio_burn 澪右手的食指、中指指尖有新的烫伤，起了水泡。她说是「松节油打翻在提灯上，火苗窜了一下」——可是画架旁的松节油瓶盖拧得很紧，瓶身和提灯都干干净净，没有打翻、燎烧过的痕迹。
@return

# ch1_i_fountain
: 干涸的喷泉边，雨水在池底积了浅浅一层。
: 从这里能看见整个中庭：塔门、书斋的窗户、屋檐下的画架、通往本馆的回廊。
> 九点的时候，我、汐、澪三个人，就在这片中庭里。
> 我们亲眼看见窗户打开、灯灭了。亲耳听见那声惨叫。
@return

# ch1_it_mio
@if has:ch1_mio_burn -> ch1_it_mio2
: 澪裹着仓田拿来的毛毯，坐在屋檐下的画架旁。雨从屋檐上流成一道水帘，把她和中庭隔开了。
mio[sad]: ……律君。
ritsu: 不进屋吗？会着凉的。
mio[normal]: 我想在这里待一会儿。画还没画完。
: 她的右手搭在膝盖上。食指和中指的指尖红肿着，鼓起了几个透明的水泡。
ritsu: 你的手怎么了？
mio[surprise]: ……这个？
mio[normal]: 刚才画画的时候，松节油打翻在提灯上，火苗窜了一下。不要紧的。
@get ch1_mio_burn
@if ch1_i_easel_seen -> ch1_it_mio_upd
@goto ch1_it_mio_cont

# ch1_it_mio_upd
@update ch1_mio_burn 澪右手的食指、中指指尖有新的烫伤，起了水泡。她说是「松节油打翻在提灯上，火苗窜了一下」——可是画架旁的松节油瓶盖拧得很紧，瓶身和提灯都干干净净，没有打翻、燎烧过的痕迹。
@goto ch1_it_mio_cont

# ch1_it_mio_cont
mio[normal]: 律君，那声惨叫……你也听见了吧。
mio[sad]: 是玄藏先生的声音。我小时候常听他吼人……我不会听错的。
ritsu: 你一直在这里画画？
mio[normal]: 嗯。八点就来了。
mio[normal]: 八点半前后，恭介先生进了塔，没几分钟就出来了，脸色铁青地回了宅子。
mio[normal]: 之后就没有人进出了。直到你们来。
@if has:ch1_diary -> ch1_it_mio_diary
@return

# ch1_it_mio2
mio[normal]: 雨越下越大了呢。
mio[sad]: 月亮又被遮住了。今晚的画，画不完了。
@if has:ch1_diary -> ch1_it_mio_diary
@return

# ch1_it_mio_diary
@if ch1_i_mio_diary_asked -> ch1_it_mio_diary2
ritsu: 澪。千鹤小姐的日记……在书斋的壁炉里。
mio[shock]: ……
: 澪的肩膀轻轻一颤。毛毯从她肩头滑了下来。
mio[sad]: ……是吗。烧掉了吗。
mio[normal]: 晚饭前，我把日记给了会长。
mio[normal]: 他说……想看看千鹤写了什么。我想，他是千鹤的叔叔，也许有权利看。
mio[sad]: 我不该给他的。
: 她把毛毯拉回肩上，再也没有抬头。
@set ch1_i_mio_diary_asked
@return

# ch1_it_mio_diary2
mio[sad]: 我不该把日记给他的……
@return

# ch1_i_propbox
@if has:ch1_threadbox -> ch1_i_propbox2
: 牌桌角落，柊的黑色道具箱。箱盖半开着，和白天一样。
: 律一格一格地看过去。绳子、扣环、手帕、扑克……
: 中间那一格，白天放着三只透明的线轴。
: 现在只剩两只。
> 「幻线」。少了一卷。
> 重锤井底的那团透明细线……
@get ch1_threadbox
@return

# ch1_i_propbox2
> 箱子敞着放在这里。白天、晚饭前，谁都可能伸手拿走一卷。
@return

# ch1_i_phone
: 内线电话的听筒挂在墙上。号码表上写着「塔」的那一格，旁边用铅笔打了个问号。
kurata[sad]: ……那个啊，九点多我想打去塔里问问，可是一直没人接。塔里的分机，早就坏了吧。
@return

# ch1_it_hina
@if has:ch1_bells -> ch1_it_hina2
: 雏坐在钢琴凳上，人偶放在膝头。她看起来和白天没有任何不同，只是脸色更白了一点。
hina[normal]: 七濑先生。
hina[normal]: 叔父大人，死了吗。
ritsu: ……嗯。
hina[normal]: 是吗。
: 她低下头，摸了摸人偶的头发。
ritsu: 九点的时候，你在这里数钟声？
hina[normal]: 是的。
hina[normal]: 七濑先生。九点的钟，只敲了八下。
@se heartbeat
ritsu: ……八下？
hina[normal]: 一、二、三、四、五、六、七、八。然后就没有了。
hina[normal]: 我等了很久。第九下没有来。
kotone[angry]: 我当时就说了，你数错了。我在拉琴，琴声把钟声盖住了一下而已。
hina[normal]: 我不会数错。
hina[normal]: 姐姐说过，钟是这座岛上唯一不会说谎的东西。
hina[think]: ……可是今晚，钟说谎了。
@get ch1_bells
@return

# ch1_it_hina2
hina[normal]: 八下。我确定。
hina[normal]: 千代也听到了。千代这次，没有数错。
@return

# ch1_it_shiori
@if has:ch1_threadbox -> ch1_it_shiori_box
shiori[sad]: 侦探君……今晚的魔术秀，大概是我演过最糟糕的一场了。
shiori[normal]: 八点多到现在，我一直在这里。变扑克、变硬币，琴音小妹妹拉琴，雏小妹妹数钟，医生和律师先生当观众。
shiori[normal]: 九点的时候我正在变「消失的戒指」。然后汐小姐就冲进来了。
@return

# ch1_it_shiori_box
shiori[shock]: 幻线少了一卷？！
: 柊扑到道具箱前，把格子翻了个底朝天。
shiori[shock]: 真、真的……昨晚睡前我还数过，三卷，一卷都没少！
shiori[angry]: 是谁！是谁偷了魔术师的东西！
shiori[sad]: ……侦探君，你那个眼神是什么意思？我可是一整晚都在这里变魔术哦！大家都看着呢！
@return

# ch1_it_kotone
kotone[normal]: 我一直在这里拉琴。从八点二十左右到汐冲进来。
kotone[angry]: 这种湿度，弦一直在跑音。我拉得烦死了。
kotone[normal]: ……那孩子说钟只敲了八下。我当时以为她数错了。
kotone[think]: 现在想想，最后几下钟声，我也没听清。好像……有什么别的声音混在里面。
@return

# ch1_it_kuga
kuga[sad]: 七濑君，敝人这一晚可是一步都没离开过这张沙发。腰不好，想离开也离不开啊。
kuga[normal]: 柊小姐、真白小姐、雏小姐、御堂医生、仓田先生，都可以作证。
kuga[think]: 从法律上讲，这就是完美的不在场证明。
kuga[normal]: 至于没有不在场证明的人嘛……敝人就不便多言了。
@return

# ch1_i_knives
: 厨房墙上的磁铁刀架。八格，空了一格——从长往短数，第五格。
kurata[sad]: 就是那一格……柳刃。最细最长、最快的那把。
kurata[sad]: 小哥，插在会长胸口上的……是我的刀吧。
ritsu: 刀柄上刻着「仓」字。
kurata[shock]: ……
kurata[sad]: 中午还在的。六点我数过，也在。七点要切肉的时候……就没了。
@if has:ch1_knife -> ch1_i_knives_upd
@return

# ch1_i_knives_upd
@update ch1_knife 插在死者胸口的细长厨刀，黑檀木刀柄刻着「仓」字。是仓田刀具套组中的柳刃——中午和 18:00 都还在，19:00 发现不见了。18:00–19:00 之间进过厨房的有：澪（帮忙洗菜）、恭介（拿冰块）、桐生（倒咖啡）；18:30 左右仓田下酒窖时，厨房无人看管。
@return

# ch1_i_pantry
: 食品柜的门半开着。中间那层的大盘子上，湿布被掀开了一角。
kurata[angry]: 又来了！晚饭后我新捏的饭团，又少了三个！
kurata[sad]: 刚才大家都跑去塔那边的时候……厨房里一个人都没有……
kurata[think]: 这岛上的老鼠，难道真会开柜门？
@return

# ch1_it_kurata
kurata[sad]: 小哥……我的刀，杀了人啊……
kurata[normal]: 我一整晚都在交谊厅，端茶倒水。大家都看见了。
kurata[sad]: 可是……可是刀是从我厨房里丢的。是我没看好……
kurata[sad]: 会长说得对。我啊，九年前也是这样……
: 仓田的话说到一半，突然咽了回去。他用力搓了搓脸。
kurata[smile]: ……哈哈，不说了不说了！小哥，我给你泡杯热茶！
@return

# ch1_i_greenhouse
: 温室的铁骨架在雨里黑沉沉地立着，像一具巨大的鸟的骨骼。
: 律站在废墟前。雨水顺着锈蚀的铁条往下滴，滴进齐腰高的野草里。
> 九年前，千鹤小姐死在这里。
> 我在这片泥地上，找到了园丁的脚印。
: 一阵风吹过，铁架发出呜呜的声音。律忽然觉得，有什么东西从很高的地方落了下来。
: 他抬起头。只有雨，只有黑暗中的鸦之塔。
> ……和今晚的事无关。
> 至少，现在无关。
@return

# ch1_i_loungewin
: 交谊厅的窗户正对着鸦之塔。雨幕后面，塔的钟面隐约泛着白光。
hina[normal]: 九点的时候，我就是从这扇窗看着钟面数的。
hina[normal]: 指针指到十二，钟就开始响。我一下一下数。数到八，就没有了。
hina[normal]: 指针已经走过去了。可是第九下，一直没有来。
> 从这里看得清钟面。她不是凭感觉在数。
@return

# ch1_i_tube
: 墙上伸出的黄铜传声管。律打开管口的小盖子，里面黑洞洞的，传来一股霉味。
kurata[normal]: 那个啊，以前是老家主用来吩咐厨房的，通到二楼的书房。
kurata[smile]: 现在嘛，只能听见老鼠在里面跑，哈哈。
> 和塔不相通。跟这件案子没关系。
@return

# ch1_i_crow
: 大厅的乌鸦铜像，在吊灯昏黄的光里张着翅膀。底座上刻着「鸦天狗审判罪人」。
: 铜像的脚下，不知是谁放了一根黑色的羽毛。
kiryu[smile]: 别看我，名侦探。不是我放的。
kiryu[normal]: 这座岛上的乌鸦羽毛，比烟头还好找。
> 书斋鸟笼里的那根羽毛，也不需要特别准备。中庭里随手就能捡到。
@return

# ch1_i_libshelves
: 书架上那一格的灰尘，白天就被抹掉了一块。现在旁边又空出了一格，几捆用麻绳扎着的图纸被抽了出来，堆在书桌上。
: 律抽出一本夹在缝里的薄册子。是一本手写的工作日志，封面写着「鸦之塔 修缮记录」。最后几页被撕掉了，撕口已经发黄——不是最近撕的。
> 很多年前，有人不想让这几页留下来。
> 宇佐见先生在找的，也许就是和这本日志有关的东西。
@return

# ch1_i_hallclock
: 大厅的座钟指着十点过一刻。钟摆沉稳地摆动着。
> 这座钟和我的手表，和塔上的钟，分秒不差。
> 九点就是九点。时间本身没有问题。
@return

# ch1_it_kyosuke
@if has:ch1_kyosuke -> ch1_it_kyosuke2
: 恭介瘫坐在大厅的楼梯上，酒壶空了，攥在手里。白西装的膝盖上蹭满了塔里的泥。
kyosuke[shock]: 不、不是我！我没杀老爸！
ritsu: 我还什么都没问。
kyosuke[sad]: 你们都那么看我……我知道……
ritsu: 八点半，你去了书斋？
kyosuke[sad]: ……去了。我去要钱。
kyosuke[sad]: 我在门外敲门，他不开。我就隔着门求他，求了好几分钟。
kyosuke[angry]: 然后他在门里吼了一声「滚！」——就一个字！
kyosuke[sad]: 我气得踢了一脚门，就回房间了。一个人。一直待到外面吵起来。
ritsu: 那时候会长还活着。
kyosuke[shock]: 活、活着！他吼得那么大声，怎么可能是死的！
@get ch1_kyosuke
kyosuke[sad]: 侦探小弟……没人能证明我在房间里。我完了，对吧？
@return

# ch1_it_kyosuke2
kyosuke[sad]: 「滚」……那是老爸跟我说的最后一个字。
kyosuke[sad]: 哈……哈哈……真像他。
@return

# ch1_it_kiryu
kiryu[normal]: 我？在房间写稿。东翼，我自己的房间。
kiryu[smile]: 没人作证。记者写稿的时候，最讨厌别人在旁边。
kiryu[normal]: 九点过后听见外面乱成一锅粥，才出来看热闹。
kiryu[dark]: 名侦探，你可以把我写进嫌疑人名单。我习惯了被人怀疑——这一行干久了，谁都觉得你在算计什么。
@return

# ch1_it_shio
@show shio[think] C
shio[think]: 律君，我一直在想……
shio[normal]: 九点那时候，钟一直在响，然后是那声惨叫。我被吓坏了，根本没数钟声。
shio[think]: 不过雏妹妹好像说了什么，关于钟的。在交谊厅的时候，我听见真白小姐说她「数错了」。
shio[smile]: 去问问看吧？
shio[normal]: 还有……澪小姐的手，好像受伤了。我搂着她的时候，她一直把右手藏在毯子里。
@hide
@return

// ================= 搜查结束 =================
# ch1_inv_end
@bg study
@filter night
@weather rain
@bgm calm
@caption 8月14日 01:30 书斋门外
: 夜深了。会长的遗体被抬到了楼下，用床单盖着。书斋里只剩下雨声和风声。
: 律坐在书斋门口的台阶上，把侦探手账摊在膝上，一页一页地翻。
> 门从里面闩着。门闩把手上有线的磨痕。
> 台灯被拽飞，窗户被拉开，天花板的铁钩被线磨得发亮。墙角的检修门里挂着一丝透明的纤维。
> 线去了重锤井底，缠在报时重锤的钢索上。九点的钟只敲了八下。
> ……还有门内侧把手上的「月光蓝」，壁炉里千鹤小姐的日记，和那双烫伤的手指。
: 律合上手账，闭上眼睛。
> 我知道答案在哪里。
> 我只是……不想走到那里去。
@se footsteps
@show shio[normal] C
shio[normal]: 律君。热茶，仓田先生泡的。
: 汐在他身边坐下，把一只冒着热气的杯子塞进他手里。白手套贴着杯壁，暖暖的。
shio[normal]: 想明白了吗？
ritsu: 大概。
shio[sad]: ……是个很难过的答案吗？
ritsu: 嗯。
shio[normal]: 那就别一个人想了。明天，在大家面前，一件一件地说出来吧。
shio[smile]: 律君不是一个人哦。还有助手呢。
ritsu: ……汐。
shio[smile]: 嗯？
ritsu: 九年前，我推理的时候……是什么心情？
: 汐没有马上回答。雨声填满了沉默。
shio[normal]: 那时候我不在呀，律君。
shio[smile]: 不过——我猜，一定和现在不一样。
@hide
@fade out
@wait 600
@bg courtyard
@filter none
@weather fog
@fade in
@bgm mystery
@caption 8月14日 09:40 前往审判厅
: 天亮了。雨停了，岛上起了雾。
: 审判厅在宅邸西侧的小丘上，是一座低矮的石砌圆厅。据说，岛民古时在这里审判罪人。
: 十三个人沉默地走在雾里。没有人并肩，每个人之间都隔着几步的距离。
: 澪走在最后。她的右手缠上了绷带，左手抱着一只用布包好的画框。
@bg judgment
@weather none
@caption 8月14日 10:00 审判厅
: 圆厅里冷得像井底。头顶的彩色玻璃窗上，拼着一只展翅的乌鸦，把晨光染成暗红色、暗紫色。
: 十四座石砌的证言台环形排列，围着地面中央的乌鸦徽章。其中一座台子上，放着一束白色的菊花。
kurata[sad]: ……那是会长的位置吧。
kiryu[dark]: 判官真是周到。
: 众人各自走上一座证言台。律站在自己的台前，手按在冰冷的石面上。
@trial on
@bgm judge
@se phone
judge: 早上好，各位。准时到场，值得称赞。
judge: 第一只乌鸦，鹭宫玄藏，已经坠落。
judge: 现在开始审判。你们要在这里讨论、争辩，最后投票，指认杀害他的凶手。
judge: 多数票指认正确，凶手入笼，交给七天后到来的警察。
judge: 指认错误——真凶将独自乘船离开。其余所有人，永远留在这座岛上。
judge: 那么，请开始吧。说谎的孩子，这一次，你能找到真正的答案吗？
@se phone
@bgm trial
: 【审判须知】审判由讨论与「推理游戏」交替进行。
: 【审判须知】辩论中会出现被高亮的「弱点」。从侦探手账中选出与之矛盾的证据射向它，或者在对峙中挥出正确的「反驳之刃」。
: 【审判须知】答错不会失败，审判也绝不会就此结束。只会扣掉一点「信念」——信念归零时，同伴会鼓励你，信念也会恢复。
: 【审判须知】连续答错两次，会出现提示；再答错，正确的选项会被标出来。
: 【审判须知】手账里的每一件证据，都是在搜查中亲手找到的。答案，一定就在那里面。
shio[smile]: 简单来说——律君只要相信自己找到的证据就好～
shio[normal]: 我会一直在旁边的。
fuwa[normal]: ……谁来开头。
kiryu[smile]: 那还用说？这儿有现成的名侦探。
kiryu[dark]: 九年前在法庭上作证的那个。
ritsu: ……我来吧。
ritsu: 先确认一下事实。御堂医生，请说一下验尸的结果。
shizuka[normal]: 单刀刺穿心脏，几乎当场死亡。九点二十分检查时，体温很高，死后不到一小时。
shizuka[normal]: 伤口周围的血已经开始凝固。凶器是仓田先生的柳刃。会长喝的白兰地里没有药。
shizuka[normal]: 我能说的就这些。
kuga[normal]: 那么，死亡时间就很明确了。
kuga[normal]: 九点过后那一声惨叫。七濑君、雨宫小姐、千早小姐三位都亲耳听见了，还看见窗户打开、灯灭。
kuga[smile]: 三名证人、一致的证言。从证据法的角度来说，非常有力。
mio[sad]: ……是玄藏先生的声音。我不会听错的。
fuwa[normal]: 九点。那时候没有不在场证明的人——恭介、宇佐见、桐生，还有我。
fuwa[normal]: 交谊厅那伙人一直在一起。七濑、汐、澪在中庭。
fuwa[angry]: 恭介。八点半你在书斋门口吵过架。
kyosuke[shock]: 我、我只是去要钱！
kuga[think]: 会长过世，鹭宫家的财产在法律上首先由长子继承……这一点也不得不考虑啊。
kyosuke[shock]: 久我！你、你是我家的律师吧！
kuga[smile]: 敝人只是在陈述法律上的一般原则，绝无指控少爷的意思。
kiryu[normal]: 动机这东西，在这屋子里可不稀罕。
kiryu[dark]: 判官的影片里说，会长「亲手熄灭了白鹭的生命」。要是真有人信了这句话呢？
kiryu[dark]: 为九年前的千鹤报仇——想这么干的人，这屋子里有几个？
hina[normal]: ……
shizuka[normal]: 那种来路不明的影片，你也信？
kiryu[smile]: 我是记者，医生。我什么都不信，所以什么都要查。
fuwa[normal]: 扯远了。
fuwa[normal]: 动机先放一边。我只信看得见的东西——谁在什么时候，在什么地方。
fuwa[angry]: 吵完架，回头又去了一趟。杀了人，从窗户跑了。
> 窗户……不破先生认定凶手是从窗户逃走的。
> 可是，我亲眼看过那扇窗外面的样子。
@bgm debate
@game ch1_g1
@bgm trial
@shout ritsu 不对！
ritsu: 凶手不可能从窗户逃走。
ritsu: 书斋在三楼，窗外是十二米高的光滑石墙。没有窗台，没有排水管，什么都抓不住。
ritsu: 而且窗下是花坛。白天下过雨，泥土软得一按一个坑。可是那片泥地上，没有脚印，没有梯子的压痕，什么都没有。
ritsu: 雨是九点二十分才开始下的，下得很小。要是有人九点从窗口逃下来，痕迹不可能被冲掉。
fuwa[normal]: ……绳子呢？
ritsu: 绳子垂下来，落地的时候人还是要踩在泥地上。
fuwa[normal]: ……哼。
kyosuke[smile]: 对、对吧！我就说不是我！
kiryu[normal]: 别高兴得太早，少爷。窗户走不通，你的嫌疑也没洗干净。
kiryu[normal]: 不过……这么说的话，凶手是怎么离开那间屋子的？门可是闩着的。
kyosuke[angry]: 我知道了！宇佐见！
usami[shock]: 诶？我？
kyosuke[angry]: 那时候你就在楼下的藏书室！就在书斋正下方！
kyosuke[angry]: 你是建筑师，你最清楚那座塔的构造！
usami[shock]: 我、我只是在看图纸……
kiryu[smile]: 有意思。我来替少爷把故事讲完整吧。
> 宇佐见先生在书斋正下方的藏书室……桐生打算怎么把他和书斋连起来？
> 仔细听。那条「路线」，我昨晚走过一遍。
@bgm debate
@game ch1_g2
@bgm trial
@shout ritsu 那条路走不通！
ritsu: 藏书室的窗户是封死的固定窗。玻璃嵌在石框里，四边用灰浆封住，没有把手，没有合页。
ritsu: 别说人，连一只猫都钻不出去。从藏书室翻窗爬上书斋，是不可能的。
usami[surprise]: 对、对！那扇窗打不开的！我比谁都清楚！
kiryu[smile]: 哈。那就算了。
kiryu[dark]: 不过建筑师先生，你到底在藏书室「看」什么图纸？大半夜的。
usami[shock]: ……
usami[normal]: 是……酒店改建用的。塔的旧结构图。会长想把塔改成观景台……
ritsu: 那叠图纸上的签章，是 1983 年的某家「工务店」。
usami[shock]: ……！
usami[sad]: ……七濑先生，请让我以后再说。
usami[sad]: 那和会长的死没有关系。我发誓。
> 他在隐瞒什么。
> 不过，至少他没法从窗户上下书斋。这一点是确定的。
fuwa[normal]: 窗户走不通。藏书室走不通。
fuwa[normal]: 那就只剩一个问题。
fuwa[angry]: 门从里面闩着。凶手，是怎么出去的？
@bgm tension
shiori[shock]: 密、密室……？真正的密室杀人……
kurata[sad]: 难道真的是……鸦天狗？
hina[normal]: 岛上的老人说，鸦天狗审判罪人的时候，不需要开门。
kotone[angry]: 别说这种吓人的话！
kuga[think]: 也有可能是会长自己闩上的门……被刺之后，挣扎着去闩门，再走回窗边倒下……
shizuka[normal]: 不可能。刺穿心脏，几乎当场死亡。他走不了那么远。
kuga[sad]: ……是吗。
> 门闩是插上的。这一点不会错。
> 可是，「是谁的手」插上的，就是另一回事了。
> 那件证据能说明一切。
@game ch1_g3
@shout ritsu 请看这个！
ritsu: 门闩把手的颈部，有一圈新的细磨痕。黄铜被磨出了一道亮线。
ritsu: 用手推门闩，不会留下这种痕迹。这是一根很细的线绕在把手上，被用力拉扯过留下的。
ritsu: 门闩不是被人的手插上的——是被「线」拉上的。
kiryu[surprise]: 线？从外面拉门闩？老掉牙的推理小说手法啊。
ritsu: 老掉牙，但是有效。
kiryu[normal]: 不过名侦探，那扇橡木门可是严丝合缝的。门板下缘贴着门槛，连张纸都塞不进去。
kiryu[smile]: 线从哪里穿出去？门缝？钥匙孔？还是你要说，凶手把线吞进肚子里了？
ritsu: 线没有从门穿出去。这一点，等一下再说。
ritsu: 而且，同样的勒痕不只出现在门闩上。摔碎的台灯，灯颈上也有一道。窗户的插销上，有新的划痕。
ritsu: 天花板挂鸟笼的铁钩，内侧被磨得发亮。
usami[think]: ……台灯、窗户、铁钩……都被同一根线……？
kuga[normal]: 那么，那根线在哪里？七濑君，证据法上，「推测」可不能代替「物证」。
ritsu: 书斋墙角有一扇检修小门，通往钟的重锤井。门是虚掩的，铰链上挂着一丝透明的纤维。
ritsu: 我顺着重锤井下到塔的一楼，打开井底的检修口——找到了这个。
: 律从证言台上举起一只小小的证物袋。袋子里那团东西细得几乎看不见，只有转动时，才在彩色玻璃透进来的光里闪了一下。
@se heartbeat
shiori[shock]: ……那是……
shiori[shock]: 那是我的幻线！
kotone[surprise]: 你的？
ritsu: 交谊厅里柊小姐的道具箱，装幻线的格子里原本有三卷——昨天中午我亲眼看到的。昨晚我再去看的时候，只剩两卷了。
shiori[shock]: 不、不是我拿的！是被偷了！前天晚上睡前我还数过——
kiryu[dark]: 魔术师的线。魔术师的绳结。魔术师的机关。
kiryu[dark]: 密室魔术，女士们先生们。这不是你的拿手好戏吗？
shiori[angry]: 我说了不是我！
fuwa[normal]: 线是你的。会这种把戏的，也是你。
kuga[think]: 可是，柊小姐那时候一直在交谊厅……敝人可以作证……
> 所有人的视线都集中在柊小姐身上。
> 可是……那根线是在哪里找到的？它缠在什么东西上？
> 搞清楚这一点，「谁在拉线」这个问题，答案就完全不同了。
@bgm debate
@game ch1_g4
@bgm trial
@shout ritsu 不对！
ritsu: 拉线的人，不需要在门外。
ritsu: 因为那根线，根本没有穿过门缝。它是从墙角的检修小门，进了重锤井。
ritsu: 我在井底找到它的时候，它缠在报时重锤的钢索上。
kuga[surprise]: 重锤的……钢索？
ritsu: 线的一端系在那根钢索上。拉动它的，不是人的手。
shiori[surprise]: ……诶？
shiori[smile]: 你、你们听见了吧！我就说不是我！九点钟我在交谊厅，当着大家的面变「消失的戒指」！
ritsu: 嗯。柊小姐说的是真话。
ritsu: 而这句真话，恰恰证明了一件事——九点钟拉动这根线的，不需要任何人在场。
kyosuke[surprise]: 不需要人……那是什么在拉？
> 线的一端，系在报时重锤的钢索上。
> 那么，在九点整拉动它的「力量」，究竟是什么？
@game ch1_g5
@shout ritsu 是重锤！
ritsu: 钟楼里的报时重锤。
ritsu: 宇佐见先生，你昨天跟我讲过它的原理。能请你再说一遍吗？
usami[surprise]: 啊……是、是的！
usami[normal]: 塔钟的报时重锤，平时一动不动。到了整点，钟每敲一下，它就沿着竖井往下落一截。
usami[think]: 敲九下，就落九截……
usami[shock]: ……原来如此！
usami[shock]: 如果把线系在报时重锤的钢索上，一到九点，钟一响——重锤一截一截往下落，就会一下一下地拉紧那根线！
usami[normal]: 而且是在固定的时刻，以固定的节奏。比任何人的手都准！
shiori[surprise]: 用钟来拉线……这、这比我的魔术还像魔术……
kiryu[think]: ……「九点的钟」本身，就是机关的开关。
ritsu: 没错。接下来，我们把昨晚九点发生的事情，一件一件重新排一遍。
@bgm debate
@game ch1_g6
@bgm truth
ritsu: 整理一下。
ritsu: 第一。雏说，九点的钟只敲了八下。
hina[normal]: 是的。八下。
kotone[normal]: ……我当时说她数错了。可是现在想来，最后几下钟声，确实混着别的声音。
ritsu: 敲到第九下的时候，报时重锤被线和它拴着的东西死死拖住了。机芯举不起钟锤，第九声就没有敲响。
ritsu: 第二。那声「惨叫」。
ritsu: 线从重锤井出来，绕过天花板上那只生锈的铁钩，把铁钩当成滑轮改变方向。被重锤硬拽的时候，生锈的铁钩和线剧烈摩擦——
ritsu: 发出了一声又尖又长、像人在惨叫一样的声音。
shizuka[normal]: 我说过。被一刀刺穿心脏的人，很难再发出那么长、那么响的惨叫。
mio[sad]: ……
ritsu: 第三。台灯和窗户。
ritsu: 线依次用活结套住了门闩的把手、台灯的灯颈、窗户的插销。重锤一落，最先拉紧的是门闩——门闩被拉上，活结滑脱。
ritsu: 接着是台灯，被拽下书桌，飞出一米多远摔碎——书斋的灯灭了。最后是窗户插销被拉开，窗户被风推开，窗帘翻了出去。
shiori[think]: 幻线打的活结……拉到一定角度，就会自己滑开……
shiori[shock]: ……是我教的。我白天跟侦探君讲过的，就是这个……
ritsu: 最后，所有的活结都滑脱了。线的一头还拴在钢索上，被下落的重锤拖进竖井，一路拖到井底。只在检修门的铰链上，留下了一丝纤维。
ritsu: 门闩闩上了，灯灭了，窗户开了，惨叫响了。
ritsu: 那一刻，书斋里——没有任何活着的人。
@se heartbeat
fuwa[shock]: ……
kuga[shock]: 那、那么……
ritsu: 九点那声惨叫，不是会长死去的时刻。是机关启动的时刻。
ritsu: 会长，在九点以前就已经死了。
@bgm tension
kyosuke[shock]: 九点以前……？
kyosuke[shock]: 那、那我八点半在门外听到的「滚」……
ritsu: 那时候会长还活着。你的证词，就是时间的上限。
usami[normal]: 我也……八点半前后刚进藏书室时，听见楼上有人吵。会长的声音。
usami[think]: 那之后……楼上很安静。我以为会长消了气，睡下了。
kiryu[normal]: 那么，所有人九点钟的不在场证明——统统作废了。
fuwa[normal]: 不对。交谊厅那伙人，八点一刻起就一直在一起。九点前也一样。
fuwa[normal]: 柊、真白、雏、久我、御堂、仓田。还有七濑、汐——到八点四十五都在交谊厅。
ritsu: 嗯。而且，凶手要布置这个机关、按童谣摆好现场，至少需要十分钟。
ritsu: 那么，时间的范围是——
ritsu: 八点半，恭介先生在门外听到会长吼「滚」，会长还活着。到九点，机关启动。
ritsu: 凶手是在八点半到九点之间，进了书斋。
fuwa[normal]: 这半个钟头里，一个人待着、没人作证的——
fuwa[normal]: 恭介。宇佐见。桐生。我。
kyosuke[sad]: 又、又是我……
fuwa[normal]: 还有一件事。塔门朝着中庭。从中庭进塔，就得经过澪的画架。
fuwa[normal]: 澪一直在中庭。她只看见恭介进过塔。
fuwa[angry]: 也就是说——凶手要么是恭介，要么是从渡廊进塔、谁也看不见的宇佐见。
usami[shock]: 不、不是我！
kyosuke[shock]: 也不是我！
kiryu[smile]: 啧啧，又绕回来了。
mio[normal]: ……对不起。我只看见了恭介先生。
> 澪一直在中庭——她的证言，像一根柱子，撑起了整个推论。
> 可是，真的是「一直」吗？
> 我手里，有一件让这根柱子站不住的东西。
@bgm debate
@game ch1_g7
@bgm tension
@shout ritsu 那不是真的！
ritsu: 澪。你说你从八点起就「一直」在中庭。
ritsu: 那么，书斋门内侧的把手上，为什么会沾着你的颜料？
mio[surprise]: ……
ritsu: 内侧把手的背面——握着它开门时，手指会碰到的地方——沾着一点蓝白色的油画颜料。昨晚我去看的时候，还没干。
ritsu: 那个颜色，是你自己调的「月光蓝」。你说过，比例只有你知道。
@se heartbeat
kotone[shock]: 内侧……把手？
shio[shock]: 可是……破门以后，澪小姐一直坐在楼梯上，我一直搂着她。她没有进过那个房间。
ritsu: 嗯。破门以后进过书斋的，只有不破先生、御堂医生和我。
ritsu: 也就是说，那点颜料，是在破门之前——在门还关着、还闩着之前——沾上去的。
ritsu: 有人带着沾满月光蓝的手，在书斋里面，握住门把手，打开了门。
@bgm trial
mio[normal]: ……律君。
mio[smile]: 你这么一说，我想起来了。
mio[normal]: 那块颜料啊，我知道是怎么回事。
@show mio[normal] C
> 澪的声音还是那么轻，那么慢。像是在讲一个和自己无关的故事。
> 可是，她的话里一定有站不住的地方。
@bgm debate
@game ch1_g8
@bgm tension
@shout ritsu 那是不可能的！
ritsu: 晚饭前，没有人能进书斋。
ritsu: 宇佐见先生，请再说一遍昨天下午的事。
usami[normal]: ……四点，我从会长手里拿到钥匙。一个人检查书斋，门一直关着。
usami[normal]: 五点，我锁上门，在大厅把唯一的那把钥匙还给了会长。会长把它扣在怀表链上——七濑先生也看见了。
usami[normal]: 晚饭的时候，会长还特意把钥匙拿出来晃给大家看。之后，他带着钥匙进了塔。
ritsu: 也就是说，从五点到八点一刻会长进塔为止，书斋一直锁着。谁也进不去。
ritsu: 你「晚饭前去书斋送素描」——这件事不可能发生。
mio[sad]: ……
kuga[shock]: 那、那就是说……千早小姐是在会长进塔之后，进的书斋……
kyosuke[shock]: 澪……？是你？
mio[normal]: ……
mio[normal]: 颜料这种东西……谁都可能沾到的。
mio[normal]: 我在中庭画了一晚上的画，律君和汐也凑过来看了好久。调色盘就摆在那里。
mio[sad]: 也许是有人碰了我的调色盘，再去开的那扇门。
shio[surprise]: 我、我只看了画哦！没碰调色盘！
kiryu[think]: ……说是这么说，颜料确实不算决定性的证据。手一抹、鞋一蹭，转几道手都有可能。
> 颜料还不够。
> 可是，书斋里还有一样东西——它不像颜料那样「谁都可能沾到」。
> 那是只属于她一个人的东西。
@game ch1_g9
@shout ritsu 请看这个！
ritsu: 书斋的壁炉里，有一块烧焦的布面封皮。上面绣着两个字——「千鹤」。
@se heartbeat
hina[surprise]: ……姐姐的……？
ritsu: 千鹤小姐的日记。她生前寄放在澪那里，澪九年来一直带在身边。
ritsu: 昨天中午，她在中庭给我看过。她说，今天是忌日，也许可以打开了。
ritsu: 这本日记，为什么会在会长的壁炉里？
mio[sad]: ……
mio[normal]: 我……昨晚在中庭跟律君说过的。
mio[normal]: 晚饭前，我把日记交给了会长。他说想看看千鹤写了些什么。
mio[normal]: 他带着日记进了塔，看完，自己把它扔进了火里。
mio[sad]: 我不该给他的……仅此而已。
kiryu[normal]: ……说得通。会长揣着日记进塔，看了，不高兴，一把火烧了。
fuwa[normal]: 晚饭前交的。谁看见了？
mio[normal]: ……没有人。
kuga[think]: 没有人看见交接，也就没有人能否认交接……从证据法的角度说，这是个灰色地带啊。
> 她早就准备好了这个说法。昨晚在中庭，她也是这么说的。
> 可是有一件事，她解释不了。
> 那本日记被扔进火里的时候——她就在旁边。她的手，记得那团火。
@game ch1_g10
@shout ritsu 这就是证据！
ritsu: 澪。你右手的食指和中指，指尖有新的烫伤。
: 澪下意识地把缠着绷带的右手藏到了身后。
ritsu: 你说，是松节油打翻在提灯上，火苗窜了一下。
ritsu: 可是昨晚我看过你的画架。松节油的瓶盖拧得紧紧的，瓶身干干净净。提灯的灯罩透亮，没有一点被火燎过的黑印。
ritsu: 那里没有打翻过任何东西。
ritsu: 你的手指，是从燃烧的壁炉里，抢出什么东西的时候烫伤的。
ritsu: 书斋在会长进塔之前一直锁着。会长进塔后生了火，日记被扔进那团火里——只有那时候在书斋里的人，才可能把手伸进去。
ritsu: 你那时候，就在那里。
@bgm stop
@se heartbeat
: 审判厅里一片死寂。
: 澪低着头，看着自己缠着绷带的手。很久，很久。
mio[normal]: ……
mio[smile]: ……律君。
mio[smile]: 你真厉害。
mio[sad]: 和九年前一样。
: 她抬起头，笑了。那是一个很安静的笑，像雨后的中庭。
mio[normal]: 只抢出来了几页。
mio[normal]: 剩下的，都烧掉了。
@bgm sad
shiori[shock]: ……真的，是她……？
kyosuke[shock]: 澪……你、你为什么……
kurata[sad]: 澪小姐……
fuwa[normal]: ……七濑。从头讲一遍。
fuwa[normal]: 让所有人都听清楚。
ritsu: ……好。
@bgm truth
@game ch1_g11
ritsu: 这就是昨晚发生的全部。
ritsu: 昨天下午，凶手从柊小姐敞着的道具箱里，拿走了一卷幻线。傍晚，她来厨房帮仓田先生洗菜，趁仓田先生下酒窖的那几分钟，拿走了那把柳刃。
ritsu: 晚饭时，她邀请我九点前后去中庭看月亮。七点五十五分，她先离席，在中庭支起画架，开始画画。
ritsu: 八点一刻，会长进塔。八点半，恭介先生在门外吵完架离开——这一幕，她在画架前看得清清楚楚。
ritsu: 八点三十五分，她敲响书斋的门。「玄藏叔叔，我带来了千鹤的日记。」
ritsu: 会长想知道日记里有没有写到自己。他拉开门闩，让她进来了。
ritsu: 会长读了日记，脸色大变，把它扔进了壁炉。就在那一刻，她用柳刃刺中了会长的胸口。会长倒在窗边，几乎当场死去。
ritsu: 她把手伸进火里，抢出了日记——只剩几页。指尖被烫伤了。
ritsu: 然后，她打开墙角的检修小门，把幻线系在报时重锤的钢索上。让线绕过天花板的铁钩，依次用活结套住门闩、台灯和窗户的插销，调好松紧和顺序。
ritsu: 她按照童谣打开鸟笼，放进一根乌鸦的羽毛，把鸟笼的黑布盖在会长胸口。月光照不到它的胸——也遮住了胸口已经开始凝固的血。
ritsu: 她握着门内侧的把手离开。手上未干的月光蓝，留在了把手背面。门，并没有闩上。
ritsu: 八点五十分，她回到画架前。我和汐来了。
ritsu: 九点，钟声响起。重锤一截截落下，拉紧了幻线——门闩插上，台灯坠落，窗户打开。生锈的铁钩发出惨叫一样的声音，第九声钟没有响起。
ritsu: 「是玄藏先生的声音！」——她在那一刻喊出了这句话。把会长的死，钉在了九点。
ritsu: 而替她证明这一切的证人……是我。
@se heartbeat
> 九点，我在中庭。我看见了窗户打开，听见了惨叫，看见她一直在画架前。
> 我的证词，是她最坚固的不在场证明。
> 她挑选了我。因为所有人都会相信「少年侦探」说的话。
ritsu: ……凶手，就是你。千早澪。
mio[sad]: ……嗯。
shio[sad]: ……律君。
: 汐在旁边的证言台上，轻轻叫了他一声。律没有回头。
kiryu[dark]: 少年侦探的证词，九年后又被人拿来用了一次。
kiryu[dark]: 你这张嘴啊，名侦探，还真是值钱。
shio[angry]: 桐生先生！
ritsu: ……他说得没错。
@bgm judge
@se phone
judge: 讨论结束。
judge: 那么，投票吧。指认杀害鹭宫玄藏的凶手。
@game ch1_g12
@se gavel
judge: 投票结果：全票。
judge: 被指认的凶手，千早澪。
judge: ——正确。
@se phone
@bgm sad
: 喇叭沉默了。没有人说话。
: 澪从证言台上走下来，站在地面中央的乌鸦徽章上。她把那只用布包着的画框放在脚边，解开了布。
: 是昨晚那幅画。月光下的鸦之塔，三楼的窗户里透着一点暖黄。
mio[normal]: 画完了。今天早上，画完的。
mio[smile]: 律君，你说，好看吗？
ritsu: ……很好看。
mio[smile]: 嗯。千鹤也会这么说的。
mio[normal]: ……前天晚上，影片放完以后，我的枕头下面有两封信。
mio[normal]: 一封写着「你那晚看见了，却选择了遗忘」。
mio[normal]: 另一封……很长。
: 澪从罩衫的口袋里取出一只折得很小的黑色信封，递给了最近的不破。不破展开信纸，看了一眼，又递给了律。
@letter 千早澪小姐：\n\n千鹤是被鹭宫玄藏杀死的。\n九年前那个夜晚，你看见他从温室走出来——你只是选择了忘记。\n园丁是无辜的。\n那个孩子的推理，是错的。\n\n鸦之塔的钟每敲一下，重锤就落下一截。魔术师的线，比钓鱼线还结实。\n九点的钟声，会替你作证。\n请让那只乌鸦，锁进笼中。\n\n　　　　　　　　　　判官
@se heartbeat
> ……那个孩子的推理，是错的。
: 律的手指捏紧了信纸。纸边在他手里微微发抖。
mio[normal]: 那天晚上……九年前的那个晚上。我十三岁，来宅子里帮忙端盘子。
mio[normal]: 很晚的时候，我去中庭倒垃圾，看见玄藏叔叔从温室那边走过来。
mio[normal]: 他的袖口上，全是泥。
mio[sad]: 他看见了我，对我笑了一下。我也对他笑了一下。然后，我就回厨房了。
mio[sad]: 第二天，大家说千鹤死在温室里。说是园丁杀的。说是小侦探找到了证据。
mio[sad]: 我想……大人们都这么说，那一定是对的。
mio[sad]: 我就把那天晚上看见的东西，忘掉了。
mio[normal]: 九年。一次都没有想起来过。
mio[normal]: 直到看见这封信。
: 她低头看着自己缠着绷带的手。
mio[normal]: 昨天下午……我终于打开了千鹤的日记。
mio[sad]: 最后几页，她写着：「叔叔看我的眼神好可怕。」
mio[sad]: 「他总是问起爷爷的遗嘱。」
hina[shock]: ……！
mio[normal]: 我想问他。只是想问问他。
mio[normal]: 所以，我把日记带给他看……
mio[normal]: 我敲门说，「玄藏叔叔，我带来了千鹤的日记。」他马上就开了门。
mio[normal]: 他一页一页地翻，翻到最后，脸一下子变得像死人一样白。
mio[dark]: 然后，他把日记扔进了火里。
mio[dark]: 什么都没说。一句话都没说。就像扔掉一张废纸一样。
@bgm stop
mio[dark]: ……那一刻我就知道了。信上写的，全是真的。
@wait 600
@bgm sad
mio[sad]: 我把手伸进火里，只抢出来这几页。
: 澪从口袋里取出几页焦黄卷曲的纸，小心翼翼地捧在掌心，像捧着一只受伤的小鸟。她没有给任何人看。
mio[sad]: 千鹤把日记托付给我，我却让它被烧掉了。
mio[sad]: 她死的那天晚上，我看见了，却选择了遗忘。
mio[sad]: 我一直在辜负她。
mio[normal]: 所以，至少这一次……
kyosuke[angry]: 胡、胡说八道！老爸怎么可能……那是判官编出来的！是挑拨！
kyosuke[sad]: ……对吧？对吧，久我？
kuga[shock]: ……
: 久我张了张嘴，什么也没说出来。他握着手杖的指节泛白。
hina[normal]: ……
: 雏紧紧地抱着人偶。她的脸上没有表情，只是嘴唇在轻轻地动，像在数着什么。
kiryu[dark]: 判官的信……「那个孩子的推理是错的」。
kiryu[dark]: 名侦探。你怎么说？
ritsu: ……
mio[normal]: 律君。
: 澪走到律的证言台前。她比律矮了一个头，仰起脸看着他，眼神很平静，像在看一幅画。
mio[normal]: 对不起。我利用了你。
mio[normal]: 九年前，所有人都相信了少年侦探的话。所以我想，这一次，大家也会相信你。
mio[sad]: 你在中庭的证词，就是我的不在场证明。
ritsu: ……
mio[normal]: 最后，我能问你一件事吗？
@bgm stop
mio[normal]: 律君……
mio[sad]: 你当年的推理，真的是对的吗？
@se heartbeat
@wait 800
> 我张开嘴。
> 「当然。」——前天晚上，我对汐这样说过。毫不犹豫。
> 可是现在，那两个字卡在喉咙里，怎么也出不来。
> 长靴的脚印。沾血的修枝剪。枕头下的发带。十一点，站在温室附近的园丁。
> 每一步我都记得。
> 那晚的风，我却一点也想不起来。
ritsu: ……我……
: 律没能说下去。
: 澪看了他很久，然后轻轻地笑了。像是得到了答案。
mio[smile]: ……嗯。谢谢你，律君。
hina[normal]: 澪小姐。
: 雏走下证言台，抱着人偶，站到了澪的面前。
hina[normal]: 姐姐的日记……那几页，写了什么？
mio[sad]: ……
mio[normal]: 雏酱。现在还不行。
mio[normal]: 等我想好了怎么说……再给你看。好吗？
hina[normal]: ……好。
hina[normal]: 我等。我很会等。
: 雏低下头，把人偶的脸埋进了自己的胸口。她的肩膀在轻轻地发抖，却没有发出一点声音。
@bgm sad
@bg cells
@trial off
@caption 8月14日 11:20 鸦笼
: 审判厅的地下，石阶尽头是三间铁栅牢房——「鸦笼」。
: 不破打开最左边那间的铁门。澪自己走了进去，在冰冷的石床边坐下，把那幅画靠在墙上，让画面朝着铁栅外。
fuwa[normal]: 钥匙串我拿着。谁要来看她，找我。
kuga[normal]: 由前刑警先生保管钥匙，敝人没有异议。
fuwa[normal]: 七天后，交给警察。
mio[normal]: 嗯。
kurata[sad]: 澪小姐……我晚点给你送饭来。你爱吃什么？
mio[smile]: ……仓田叔叔的咖喱饭。小时候吃过一次。
kurata[sad]: ……好，好。咖喱饭。
: 仓田转过身，用袖子使劲擦了擦眼睛。
@se door
: 铁门锁上的声音，在地底回荡了很久。
@bg judgment
@caption 8月14日 11:30 审判厅
: 众人一个接一个地走出审判厅。没有人说话。
: 律最后一个离开证言台。汐站在他身后，一言不发地等着他。
: 她把右手轻轻地伸进了开衫的口袋。
@bgm judge
@se phone
judge: 第一只乌鸦，入笼。
judge: 很好，说谎的孩子。这一次，你没有说谎。
judge: 那么——第二只乌鸦，正在镜子前面等着你。
@se phone
@poem 两只乌鸦争一面镜，镜中谁是真的影。
@bgm calm
@bg east_room
@caption 8月14日 12:00 东翼·东6号室
: 律回到房间，关上门，靠着门坐了下来。
: 窗外的雾正在散去。海面上有一道淡淡的光。
> 「那个孩子的推理，是错的。」
> 判官这么写。澪这么问。
> 我回答不了。
> 九年来，我第一次回答不了。
: 律从外套内袋里取出那只牛皮纸信封。「给二十一岁的律」。父亲端正的字迹。
: 他把信封翻过来，手指搭上封口。
: 停了很久。
: 然后，他又把它放回了内袋。
> ……还不是时候。
> 至少，在我能回答那个问题之前。
: 律摊开左手。掌心那道笔直的旧疤，在窗外透进来的光里，泛着淡淡的白。
> 骑车摔的。
> ……真的吗？
@fade out
@wait 600
@chapterend
`
});
