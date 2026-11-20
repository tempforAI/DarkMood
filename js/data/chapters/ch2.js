/* 第二章「镜中之鸦」—— 镜像之翼
 * 8/14 下午 日常 → 22:05 恭介之死 → 搜查 → 8/15 上午 审判
 * 被害者：鹭宫恭介　凶手：真白琴音
 */
DM.registerChapter({
  id: 'ch2',
  title: '第二章',
  name: '镜中之鸦',
  next: 'ch3',
  start: 'ch2_start',

  evidence: {
    ch2_body: { name: '恭介的尸体', icon: 'body',
      desc: '西翼3号室，穿着白西装倒在罩着黑布的穿衣镜前。后脑有钝器击打的伤，但死因是勒颈窒息。御堂：「死后一小时上下，大约在九点到十点之间。」' },
    ch2_mark: { name: '勒痕', icon: 'rope',
      desc: '恭介颈部一道极细的勒痕，皮肤上压出细密的螺旋状纹路——「像是缠着金属丝的细弦」。不是光滑的尼龙线或绳子。' },
    ch2_bookend: { name: '乌鸦铜书挡', icon: 'generic',
      desc: '西3桌上那对乌鸦铜书挡中的一只，掉在死者脚边，沉甸甸的。底部沾着血迹和几根头发。另一只还立在桌上。' },
    ch2_mirror: { name: '罩着黑布的镜子', icon: 'cloth',
      desc: '西3的穿衣镜被一块黑布罩住，黑布上插着一根乌鸦羽毛；死者胸口放着另一根。「两只乌鸦争一面镜」——童谣的见立。' },
    ch2_luggage: { name: '西3里的行李', icon: 'generic',
      desc: '西3的衣柜里挂着恭介的衣服，墙边立着他的三只行李箱，床头柜上有半瓶威士忌。桌上放着西3的新钥匙，钥匙牌上是一笔一画的工程字「西-3」。' },
    ch2_kurata: { name: '仓田的证词', icon: 'testimony',
      desc: '22:05 端着红酒从厨房下到酒窖，照例走挂着「东楼梯」铜牌的楼梯上楼。走廊很暗，月光从右手边的窗户照进来。从楼梯口数第三扇门开着缝，亮着床头灯。推门时伸手去摸开关——开关在左手边，没按着。恭介倒在蒙着黑布的镜子前。他吓得原路逃回。' },
    ch2_east3: { name: '东3号室', icon: 'door',
      desc: '恭介原本的房间。22:14 众人赶到时空无一人：床铺整齐、没有睡过的痕迹；衣柜空了，行李不见了。桌上的一对乌鸦铜书挡都好好地立着，镜子也没有罩布。' },
    ch2_hina: { name: '雏的证词', icon: 'testimony',
      desc: '「十点的钟响以前，我就坐在大厅的楼梯上了，一直到十点半。这段时间没有人从大厅进出东翼和西翼——除了大家一起跑去东翼的那一次，和七濑先生、不破先生去西翼的那一次。」' },
    ch2_pen: { name: '久我的钢笔', icon: 'generic',
      desc: '掉在西翼仆人楼梯的台阶上（从西翼走廊往下第五级）。银色笔身，笔帽上刻着「R.K.」。久我说晚饭后在交谊厅牌桌上记完备忘，就找不到了。' },
    ch2_note: { name: '给久我的字条', icon: 'note',
      desc: '塞在久我房门缝里的字条：「22:00 鸦之塔藏书室。关于千鹤小姐的遗嘱，有话要说。」没有署名。字是一笔一画、粗细完全一致的工程字（制图字体）。' },
    ch2_kuga_back: { name: '久我的腰伤', icon: 'testimony',
      desc: '御堂：「久我先生是腰椎间盘突出。十公斤以上的东西都不能提，登岛那天他的行李也是别人替他提的。扛着一个成年男人上下楼梯？他会先瘫在台阶上。」' },
    ch2_blueprint: { name: '宅邸图纸', icon: 'blueprint',
      desc: '宇佐见给的平面图复印件。西翼按东翼左右镜像重建，房间号相同，从仆人楼梯那头起依次是1号到6号。从仆人楼梯上来、往大厅方向走：东翼走廊的窗在左手，西翼在右手。推门进客房：东翼的电灯开关在右手，西翼在左手。地下酒窖由两道仆人楼梯连接两翼。' },
    ch2_plates: { name: '楼梯铜牌', icon: 'plate',
      desc: '酒窖两道楼梯门上方 2.4 米处，挂在钉子上的「东楼梯」「西楼梯」铜牌。墙上积灰留下的干净轮廓，和现在挂着的牌子大小对不上（「东」字牌略宽一些）——两块牌子像是被取下来，换了位置。现在左边的门上挂着「东楼梯」，右边的门上挂着「西楼梯」。铜牌边缘沾着白色粉末。' },
    ch2_crate: { name: '空酒箱', icon: 'generic',
      desc: '酒窖里，左边那道楼梯门的正下方放着一个空酒箱。箱面上有新鲜的鞋底蹭痕，沾着白色粉末。白天它还和别的空箱一起，整整齐齐地摞在酒架旁边。' },
    ch2_rosin: { name: '白色粉末', icon: 'sand',
      desc: '铜牌边缘和空酒箱上的白色细粉。不是灰尘，也不是面粉，捻起来有点黏。凑近闻，有一股淡淡的、像松林一样的气味……在哪里闻到过？' },
    ch2_alibi: { name: '十点前后的行踪', icon: 'testimony',
      desc: '22:00–22:12 交谊厅里：律、汐、不破、桐生、柊、宇佐见、御堂、琴音（22:00 进来）。仓田在厨房和酒窖，雏在大厅楼梯。22:15–22:30 搜索时，不破下令两三人一组行动。整段时间里行踪没有任何人知道的，只有久我。' },
    ch2_usami_move: { name: '宇佐见的证词', icon: 'testimony',
      desc: '「晚上九点，恭介先生求我把他秘密换到西翼——那边没人住，门锁是新的。我帮他把行李搬进西3，把钥匙给了他。他让我对谁都别说。」' },
    ch2_template: { name: '宇佐见的制图模板', icon: 'blueprint',
      desc: '宇佐见工具包里的制图字模尺不见了。工具包平时随手放在大厅沙发上，谁都碰得到。照着字模描出来的字，每一笔的粗细都完全一样。' },
    ch2_string_pack: { name: '空的琴弦纸袋', icon: 'violin',
      desc: '琴音琴盒夹层里的备用弦纸袋：D、A、E 三袋还封着，只有 G 弦的纸袋被撕开、空了。今天下午她说过：「备用弦每种一根，来岛上之前刚补齐，一根都还没拆。」现在她却说「来岛上之前就用掉了」。' },
    ch2_violin: { name: '琴音的小提琴', icon: 'violin',
      desc: '琴音的小提琴。G 弦崭新发亮，没有一点松香积垢——今天下午，这根弦上还积着一层白白的松香。新换的弦会被不断拉长，所以一拉就走音。' }
  },

  explore: {
    // ---------- 日常（8/14 下午） ----------
    ch2_day: {
      title: '自由行动',
      mode: 'free',
      start: 'hall',
      places: ['hall', 'lounge', 'dining', 'kitchen', 'cellar', 'music', 'east_corridor', 'west_corridor', 'courtyard'],
      weather: 'rain',
      spots: {
        hall: [
          { x: 112, y: 214, label: '沙发上的工具包', run: 'ch2_d_toolbag' },
          { anchor: 'clock', label: '大座钟', run: 'ch2_d_clock' },
          { anchor: 'west_door', label: '通往西翼的门', run: 'ch2_d_westdoor' },
          { anchor: 'crow_statue', label: '乌鸦铜像', run: 'ch2_d_statue' }
        ],
        lounge: [
          { anchor: 'card_table', label: '牌桌', run: 'ch2_d_cardtable' },
          { anchor: 'phone', label: '内线电话', run: 'ch2_d_phone' }
        ],
        dining: [
          { anchor: 'projector', label: '放映机', run: 'ch2_d_projector' },
          { anchor: 'painting', label: '乌鸦油画', run: 'ch2_d_painting' }
        ],
        kitchen: [
          { anchor: 'pantry', label: '食品柜', run: 'ch2_d_pantry' },
          { anchor: 'cellar_door', label: '通往酒窖的门', run: 'ch2_d_cellardoor' }
        ],
        cellar: [
          { anchor: 'west_plate', label: '左边门上的铜牌', run: 'ch2_d_plate' },
          { anchor: 'east_plate', label: '右边门上的铜牌', run: 'ch2_d_plate' },
          { anchor: 'wine_rack', label: '酒架', run: 'ch2_d_rack' },
          { anchor: 'crate', label: '空酒箱', run: 'ch2_d_crates' },
          { anchor: 'lantern', label: '煤油灯', run: 'ch2_d_lantern' }
        ],
        music: [
          { anchor: 'violin_case', label: '琴盒', run: 'ch2_d_case' },
          { anchor: 'window', label: '窗户', run: 'ch2_d_musicwin' },
          { anchor: 'stand', label: '谱架', run: 'ch2_d_stand' }
        ],
        east_corridor: [
          { anchor: 'door3', label: '东3号室', run: 'ch2_d_east3' },
          { anchor: 'window', label: '走廊的窗', run: 'ch2_d_ewin' }
        ],
        west_corridor: [
          { anchor: 'door3', label: '西3号室', run: 'ch2_d_west3' },
          { anchor: 'window', label: '走廊的窗', run: 'ch2_d_wwin' },
          { anchor: 'painting', label: '走廊的画', run: 'ch2_d_wpainting' }
        ],
        courtyard: [
          { anchor: 'tower', label: '鸦之塔', run: 'ch2_d_tower' },
          { anchor: 'greenhouse', label: '温室废墟', run: 'ch2_d_greenhouse' }
        ]
      },
      people: {
        hall: [ { char: 'usami', run: 'ch2_d_usami', x: 250 }, { char: 'hina', run: 'ch2_d_hina', x: 210 } ],
        lounge: [ { char: 'kyosuke', run: 'ch2_d_kyosuke', x: 230 }, { char: 'kuga', run: 'ch2_d_kuga', x: 330 },
                  { char: 'shiori', run: 'ch2_d_shiori', x: 120 } ],
        dining: [ { char: 'shizuka', run: 'ch2_d_shizuka', x: 300 } ],
        kitchen: [ { char: 'kurata', run: 'ch2_d_kurata', x: 180 } ],
        music: [ { char: 'kotone', run: 'ch2_d_kotone', x: 220 } ],
        east_corridor: [ { char: 'fuwa', run: 'ch2_d_fuwa', x: 330 }, { char: 'shio', run: 'ch2_d_shio', x: 160 } ],
        courtyard: [ { char: 'kiryu', run: 'ch2_d_kiryu', x: 330 } ]
      },
      done: {
        need: ['flag:ch2_d_usami', 'flag:ch2_d_kurata', 'flag:ch2_d_kotone', 'flag:ch2_d_shizuka',
               'flag:ch2_d_hina', 'flag:ch2_d_kyosuke'],
        run: 'ch2_day_end',
        prompt: '天色暗下来了。要结束自由行动吗？'
      }
    },

    // ---------- 搜查（8/14 深夜） ----------
    ch2_inv: {
      title: '搜查开始',
      mode: 'investigate',
      start: 'w3',
      places: ['w3', 'west_corridor', 'cellar', 'kitchen', 'e3', 'east_corridor', 'hall', 'lounge', 'music', 'library'],
      custom: {
        w3: { bg: 'west_room', name: '西翼3号室（案发现场）', area: 'mansion' },
        e3: { bg: 'east_room', name: '东翼3号室（恭介原来的房间）', area: 'mansion' }
      },
      filter: 'night',
      spots: {
        w3: [
          { x: 250, y: 200, label: '恭介的尸体', run: 'ch2_i_body' },
          { x: 214, y: 214, label: '颈部', run: 'ch2_i_neck' },
          { anchor: 'mirror', label: '罩着黑布的镜子', run: 'ch2_i_mirror' },
          { anchor: 'desk', label: '桌子', run: 'ch2_i_desk' },
          { anchor: 'wardrobe', label: '衣柜与行李', run: 'ch2_i_wardrobe' },
          { anchor: 'switch', label: '电灯开关', run: 'ch2_i_wswitch' },
          { anchor: 'bed', label: '床头柜', run: 'ch2_i_wbed' },
          { anchor: 'window', label: '窗户', run: 'ch2_i_wwindow' }
        ],
        west_corridor: [
          { anchor: 'floor', label: '仆人楼梯口', run: 'ch2_i_wstair' },
          { anchor: 'window', label: '走廊的窗', run: 'ch2_i_wcwin' },
          { anchor: 'door5', label: '西5号室', run: 'ch2_i_wdoor5' }
        ],
        cellar: [
          { anchor: 'west_plate', label: '左边门上的铜牌', run: 'ch2_i_plates' },
          { anchor: 'east_plate', label: '右边门上的铜牌', run: 'ch2_i_plates' },
          { anchor: 'crate', label: '空酒箱', run: 'ch2_i_crate' },
          { anchor: 'wine_rack', label: '酒架', run: 'ch2_i_rack' },
          { anchor: 'floor', label: '地面', run: 'ch2_i_cfloor' },
          { anchor: 'lantern', label: '煤油灯', run: 'ch2_i_clantern' }
        ],
        kitchen: [
          { anchor: 'table', label: '托盘', run: 'ch2_i_tray' },
          { anchor: 'pantry', label: '食品柜', run: 'ch2_i_pantry' }
        ],
        e3: [
          { anchor: 'door', label: '房门', run: 'ch2_i_e3door' },
          { anchor: 'desk', label: '桌子', run: 'ch2_i_e3desk' },
          { anchor: 'switch', label: '电灯开关', run: 'ch2_i_e3switch' },
          { anchor: 'mirror', label: '镜子', run: 'ch2_i_e3mirror' },
          { anchor: 'wardrobe', label: '衣柜', run: 'ch2_i_e3wardrobe' }
        ],
        east_corridor: [
          { anchor: 'window', label: '走廊的窗', run: 'ch2_i_ecwin' },
          { anchor: 'floor', label: '仆人楼梯口', run: 'ch2_i_estair' }
        ],
        hall: [
          { anchor: 'west_door', label: '通往西翼的门', run: 'ch2_i_hdoors' },
          { anchor: 'east_door', label: '通往东翼的门', run: 'ch2_i_hdoors' },
          { anchor: 'clock', label: '大座钟', run: 'ch2_i_hclock' }
        ],
        lounge: [
          { anchor: 'card_table', label: '牌桌', run: 'ch2_i_cardtable' }
        ],
        music: [
          { anchor: 'window', label: '窗户', run: 'ch2_i_musicwin' },
          { anchor: 'stand', label: '谱架', run: 'ch2_i_stand' }
        ],
        library: [
          { anchor: 'desk', label: '书桌', run: 'ch2_i_libdesk' },
          { anchor: 'bridge_door', label: '渡廊的门', run: 'ch2_i_libbridge' },
          { anchor: 'blueprints', label: '旧图纸', run: 'ch2_i_libplans' }
        ]
      },
      people: {
        w3: [ { char: 'shizuka', run: 'ch2_i_shizuka', x: 330 }, { char: 'fuwa', run: 'ch2_i_fuwa', x: 400 } ],
        west_corridor: [ { char: 'usami', run: 'ch2_i_usami', x: 300 } ],
        kitchen: [ { char: 'kurata', run: 'ch2_i_kurata', x: 200 } ],
        hall: [ { char: 'hina', run: 'ch2_i_hina', x: 240 } ],
        lounge: [ { char: 'kuga', run: 'ch2_i_kuga', x: 330 }, { char: 'shio', run: 'ch2_i_shio', x: 220 },
                  { char: 'kiryu', run: 'ch2_i_kiryu', x: 120 } ],
        music: [ { char: 'kotone', run: 'ch2_i_kotone', x: 220 }, { char: 'shiori', run: 'ch2_i_shiori', x: 360 } ]
      },
      done: {
        need: ['ch2_body', 'ch2_mark', 'ch2_bookend', 'ch2_mirror', 'ch2_luggage', 'ch2_kurata', 'ch2_east3',
               'ch2_hina', 'ch2_pen', 'ch2_note', 'ch2_kuga_back', 'ch2_plates', 'ch2_crate', 'ch2_rosin',
               'ch2_string_pack', 'ch2_alibi'],
        run: 'ch2_inv_end',
        prompt: '证据已经齐了。天亮之后就是审判。结束搜查吗？'
      }
    }
  },

  games: {
    // 1. 尸体被搬走了？
    ch2_g1: { type: 'logic', title: '推理回廊', questions: [
      { q: '仓田在东3看见尸体，是几点左右？', opts: ['晚上九点半', '十点零八分左右', '十点半'], a: 1 },
      { q: '十点十四分众人赶到东3，尸体不见了。照这个说法，尸体是什么时候被搬走的？',
        opts: ['仓田离开之后、众人赶到之前的几分钟', '九点到十点之间', '十点半以后'], a: 0 },
      { q: '东翼到西翼，最近的路是穿过大厅。搬运者为什么没有走大厅？',
        opts: ['大厅的灯太亮', '雏一直坐在大厅的楼梯上', '大厅的门上了锁'], a: 1 },
      { q: '那么，剩下能连接两翼的路是？', opts: ['中庭的屋檐下', '鸦之塔的渡廊', '地下酒窖的仆人通道'], a: 2 },
      { q: '十点到十点一刻，不在交谊厅的人是？', opts: ['汐、琴音、久我', '仓田、雏、久我', '不破、宇佐见、仓田'], a: 1 },
      { q: '其中，行踪没有任何人能证明的是？', opts: ['仓田', '雏', '久我'], a: 2 }
    ], hint: '看看「十点前后的行踪」和「雏的证词」。仓田在奔跑报信，雏坐在大厅的楼梯上——那么还剩谁？' },

    // 2. 围攻久我
    ch2_g2: { type: 'debate', title: '证言交锋',
      ammo: ['ch2_pen', 'ch2_note', 'ch2_kuga_back', 'ch2_hina', 'ch2_alibi'],
      lines: [
        { who: 'fuwa', expr: 'angry', text: '你的钢笔{掉在西楼梯的台阶上}。解释一下。' },
        { who: 'kuga', expr: 'shock', text: '我、我是被人约去藏书室的！我在那里{等了半个多钟头}！' },
        { who: 'kiryu', expr: 'smile', text: '一个人{把尸体扛下酒窖}，再扛上西翼——六分钟，够了。' },
        { who: 'shiori', expr: 'smile', text: '律师先生看着斯斯文文的，说不定{力气大得很}哦～' },
        { who: 'fuwa', text: '酒窖里没人看着。这条路，{谁都走得通}。' }
      ],
      answer: { line: 2, weak: 0, ammo: 'ch2_kuga_back' },
      hint: '恭介少说也有六十公斤。久我先生的身体，扛得动吗？御堂医生说过什么？' },

    // 3. 仓田看见的房间
    ch2_g3: { type: 'debate', title: '证言交锋',
      ammo: ['ch2_blueprint', 'ch2_east3', 'ch2_mirror', 'ch2_luggage', 'ch2_bookend'],
      lines: [
        { who: 'shiori', expr: 'smile', text: '女士们先生们，这就是传说中的{人体瞬间移动}～' },
        { who: 'hina', text: '也许……是{乌鸦}把他带走了。' },
        { who: 'kiryu', text: '要不就是仓田先生{看花了眼}。偷喝了恭介的酒吧？' },
        { who: 'kurata', expr: 'angry', text: '我一滴都没喝！少爷就倒在镜子前，我{看得清清楚楚}！' },
        { who: 'kurata', expr: 'angry', text: '我走的是东楼梯，从楼梯口数第三扇门——那{肯定是东3}！' }
      ],
      answer: { line: 4, weak: 0, ammo: 'ch2_blueprint' },
      hint: '仓田说月光从右手边照进来、开关在左手边。图纸上，东翼和西翼分别是什么格局？' },

    // 4. 走错的楼梯
    ch2_g4: { type: 'present', prompt: '让仓田走上了「错误的楼梯」的证据是——', answer: 'ch2_plates',
      hint: '酒窖里又黑又绕，仓田只认一样东西来分辨东西两翼。那样东西出了什么问题？' },

    // 5. 知道恭介在西3的人
    ch2_g5: { type: 'pick', prompt: '事先知道恭介已经搬进西3的人是——', options: ['kuga', 'kurata', 'usami', 'kiryu', 'hina'],
      answer: 'usami', hint: '西翼的门锁是新的，钥匙一直由谁保管？西3钥匙牌上的工程字，是谁的手笔？' },

    // 6. 围攻宇佐见
    ch2_g6: { type: 'debate', title: '证言交锋',
      ammo: ['ch2_crate', 'ch2_plates', 'ch2_template', 'ch2_note', 'ch2_blueprint'],
      lines: [
        { who: 'kiryu', expr: 'smile', text: '字条是工程字，模板又{说丢就丢}了。真巧啊，建筑师先生。' },
        { who: 'kuga', expr: 'angry', text: '而且只有他{知道恭介少爷在西3}！' },
        { who: 'fuwa', text: '铜牌挂在两米四的高处。{矮个子根本够不着}。' },
        { who: 'kurata', expr: 'surprise', text: '宇佐见先生一米八几，{伸手就能换}……' }
      ],
      answer: { line: 2, weak: 0, ammo: 'ch2_crate' },
      hint: '够不着的人，会怎么办？西楼梯门下面，多了一样白天没有的东西。' },

    // 7. 白色粉末
    ch2_g7: { type: 'keyword', prompt: '铜牌和酒箱上的白色粉末，带着松林的气味。它是——', answer: '松香',
      decoys: '灰面粉石膏盐糖', hint: '下午在音乐室，有人一边擦琴一边抱怨「这东西沾得到处都是」。' },

    // 8. 琴音的反击
    ch2_g8: { type: 'debate', title: '证言交锋',
      ammo: ['ch2_mark', 'ch2_bookend', 'ch2_rosin', 'ch2_string_pack', 'ch2_mirror'],
      lines: [
        { who: 'kotone', expr: 'angry', text: '松香？音乐室里就有一整盒，{谁都拿得到}。' },
        { who: 'shiori', text: '而且琴音酱这么小小的一只，{勒得动一个大男人}吗？' },
        { who: 'kotone', expr: 'angry', text: '再说了——你倒是告诉我，我{用什么}勒死他？' },
        { who: 'kiryu', text: '小提琴家的手指倒是挺有劲的。不过凶器嘛……{谁知道呢}。' }
      ],
      answer: { line: 2, weak: 0, ammo: 'ch2_mark' },
      hint: '恭介脖子上的勒痕，有一种很特别的纹路。什么东西会留下那种纹路？' },

    // 9. 一对一对峙
    ch2_g9: { type: 'rebuttal', who: 'kotone',
      blades: ['换上的是新弦', '琴弦全是钢做的', '松香谁都买得到'],
      lines: [
        { expr: 'angry', text: '缠着金属丝的弦？哼，那又怎么样。' },
        { expr: 'angry', text: '你自己看——我的琴弦{一根都没少}！' },
        { expr: 'normal', text: '四根弦{好好地}绷在琴上。你倒是说说，我拿什么勒的？' }
      ],
      answer: { line: 1, weak: 0, blade: 0 },
      hint: '琴上四根弦都在，不代表其中没有一根是「新来的」。琴盒里的备用弦，少了哪一根？' },

    // 10. 什么时候换的弦
    ch2_g10: { type: 'present', prompt: '琴音说，这根 G 弦是「来岛上之前」换的。推翻这句话的证据是——',
      answer: 'ch2_string_pack', hint: '今天下午，她自己说过备用弦是什么状态？' },

    // 11. 真相重演
    ch2_g11: { type: 'reconstruct', panels: [
      { text: '下午，凶手从宇佐见放在大厅沙发上的工具包里偷走【？】，描出一张约久我去藏书室的字条。', opts: ['钥匙', '制图字模尺', '工具钳'], a: 1 },
      { text: '晚饭后，凶手又从交谊厅的牌桌上拿走了【？】。', opts: ['仓田的托盘', '不破的录音机', '久我的钢笔'], a: 2 },
      { text: '九点，凶手从音乐室的窗口看见宇佐见帮恭介搬家，听见了「【？】」。', opts: ['三号室', '五号室', '鸦之塔'], a: 0 },
      { text: '九点半，凶手以【？】为借口敲开西3的门，用乌鸦铜书挡砸倒恭介，再用 G 弦从背后勒死了他。', opts: ['替他父亲送一封信', '送红酒', '检查门锁'], a: 0 },
      { text: '凶手把穿衣镜罩上黑布，插上一根乌鸦羽毛，在死者胸口放上另一根——【？】。', opts: ['一只乌鸦锁进笼', '两只乌鸦争一面镜', '三只乌鸦飞上塔'], a: 1 },
      { text: '九点五十分，凶手在酒窖踩着【？】互换了两块铜牌，把钢笔丢在西楼梯的台阶上。', opts: ['空酒箱', '梯子', '仓田的肩膀'], a: 0 },
      { text: '凶手回到房间换上【？】，十点钟若无其事地走进交谊厅。', opts: ['新的衣服', '新的 G 弦', '新的松香'], a: 1 },
      { text: '十点零五分，仓田走上挂着「东」字牌的楼梯——其实来到了【？】，在西3看见了尸体。', opts: ['西翼', '东翼', '鸦之塔'], a: 0 }
    ] },

    // 12. 投票
    ch2_g12: { type: 'vote', options: ['kuga', 'usami', 'kurata', 'kotone', 'hina', 'kiryu'], answer: 'kotone' }
  },

  script: String.raw`
# ch2_start
@bgm stop
@fade out
@title 第二章|镜中之鸦
@poem 两只乌鸦争一面镜，镜中谁是真的影。
@bg dining
@weather rain
@fade in
@bgm sad
@caption 8月14日 13:00 餐厅
: 午饭摆上了桌，却几乎没有人动筷子。
: 长桌的主位空着。昨天这个时候，鹭宫玄藏还坐在那里，用叉子敲着盘子骂人。
: 现在，那把椅子的扶手上，还搭着他没来得及带走的餐巾。
kurata[smile]: 来来来，都吃一点！人是铁饭是钢，一顿不吃饿得慌嘛！
kurata[smile]: 今天是蛤蜊乌冬，汤头熬了足足三个钟头哩。
: 没有人回答。窗外的雨下得很密，像一层灰色的纱。
kiryu: 仓田先生，你这碗面是给活人吃的，还是给死人上供的？
kurata[sad]: ……桐生先生，嘴上积点德吧。
kyosuke[angry]: 吵死了！都给我闭嘴！
: 鹭宫恭介抓着一瓶白兰地，对着瓶口灌了一大口。白西装皱巴巴的，领口溅着酒渍。
kyosuke[shock]: 你们不觉得奇怪吗？一个个坐在这里吃面？
kyosuke[shock]: 我爸死了！被人一刀捅死了！下一个……下一个轮到谁？
kuga: 恭介少爷，请您冷静。审判已经结束，凶手也已经收押——
kyosuke[angry]: 收押？那个判官还在！「第二只乌鸦」！你耳朵聋了吗！
: 他把酒瓶重重砸在桌上，一张脸一张脸地扫过去。
kyosuke[dark]: ……谁都别想骗我。你们每个人的枕头底下，都有一封信。
kyosuke[dark]: 我的信上写着什么，你们心里都有数吧？
: 一瞬间，餐厅里只剩下雨声。
> 坐在桌角的真白琴音，握着叉子的手停住了。
> ——只停了一秒。
fuwa: 喝够了就回房睡觉。
kyosuke[angry]: 你算什么东西！你不过是我爸雇来的保安！
fuwa: 你爸死了。现在没人雇我。
: 不破咬着牙签，眼皮都没抬。恭介张了张嘴，抓起酒瓶，摇摇晃晃地走了出去。
shizuka: ……急性焦虑。再这么喝下去，他会先死于酒精中毒。
kiryu[smile]: 那倒省了判官的事。
shio[angry]: 桐生先生！
: 汐的声音难得地尖。桐生耸耸肩，点上一支烟，不说话了。
@show shio[sad] C
shio[sad]: ……律君也是，一口都没吃哦。
ritsu: 我不饿。
shio: 骗人～ 从早上的审判到现在，律君连水都没喝一口。
> 审判。我指认了澪。凶手是她——这一点没有错。
> 让我吃不下饭的，是另一件事。
> 「律君……你当年的推理，真的是对的吗？」
> 那句话像一根鱼刺，卡在喉咙里，咽不下去，也吐不出来。
shio[smile]: 呐，至少把这个吃了吧？仓田先生特制的焦糖布丁～
ritsu: 那是你的那份。
shio[smile]: 所以说，是我分给你的呀。很珍贵的哦，侦探先生。
: 汐用戴着白手套的手指，把布丁碟推到律的面前。
ritsu: ……谢谢。
ritsu: 吃完我想去一趟鸦笼。
shio[surprise]: 去看澪小姐？
ritsu: 审判的时候，有些话没来得及问。
shio[think]: ……嗯。那我在上面等你。律君一个人去比较好吧？
> 她总是知道什么时候该走开。
> 有时候我会想，她是不是比我自己更清楚我在想什么。
@hide

@bg cells
@bgm calm
@caption 8月14日 14:00 鸦笼
: 审判厅地下。石阶湿漉漉的，墙上的煤油灯一晃一晃。
: 三间铁栅牢房，只有最左边那一间有人。
mio: ……律君。你来了呀。
: 千早澪抱着膝盖坐在草垫上。指尖缠着御堂医生包扎的纱布——那是从壁炉里抢出日记时留下的烫伤。
mio[smile]: 这里很安静呢……听得见雨声，听不见钟声。
mio: 我还以为，会更难受一点的。
ritsu: 需要什么吗？毯子，或者画具。
mio[think]: 画具……嗯。如果可以的话，一支铅笔就好。
mio: 我想把千鹤画下来。趁我还记得她的脸。
ritsu: 我去跟不破先生说。
: 沉默。铁栅之间的距离，大概只有一臂长。
ritsu: 澪小姐。审判最后，你问我的那句话。
mio: 「你当年的推理，真的是对的吗？」……是那句吗？
ritsu: 你为什么要那么问？
mio[sad]: ……因为那天晚上，我看见了呀。玄藏叔叔从温室那边走出来，袖口上全是泥。
mio[sad]: 九年了，我一直告诉自己那没什么。是我看错了，是我记错了。
mio: 可是，如果园丁是凶手……玄藏叔叔那时候，在温室做什么呢？
> 我答不上来。
> 十二岁的我，根本不知道有这件事。——不，是没有人告诉过我。
mio: 千鹤的日记，我只抢出来几页。边上都烧卷了。
mio[think]: 最后那几页里……写到了一个小男孩，和一个小女孩。
ritsu: 小男孩和小女孩？
mio[think]: 嗯……那年夏天，她好像很喜欢那两个孩子。写他们总是偷偷地……
: 澪的话停在了一半。她看着律，看了很久很久。
mio[sad]: ……还是算了。
ritsu: 澪小姐？
mio: 有些事，别人说出来，和自己想起来，是不一样的。
mio[smile]: 律君自己想起来的时候……会比较好吧。
ritsu: 我不明白。
mio[smile]: 嗯。现在还不明白，也没关系。
: 澪把脸埋进膝盖里。煤油灯的火苗跳了一下。
mio: ……律君。那个判官，好像什么都知道呢。
mio: 九年前的事，比我们任何一个人，都知道得清楚。
mio[sad]: 小心一点哦。下一只乌鸦……已经在镜子里了。
: 律走上石阶的时候，背后传来很轻的、断断续续的哼唱声。
: 是澪。她在哼一首没有歌词的曲子，不成调，像在哄一个看不见的孩子睡觉。

@bg judgment
@caption 8月14日 14:20 审判厅
: 审判厅的石阶上，汐抱着膝盖坐着，在等他。
: 她在哼歌。那段旋律，律已经听过很多遍了。——在船上，在判官的影片里。
ritsu: 汐。
shio[surprise]: 啊，律君！
ritsu: 那首歌……别再哼了。
shio[sad]: ……抱歉。不知不觉就……这首歌的调子，太容易记住了嘛。
ritsu: 正因为容易记住，才让人不舒服。
shio[smile]: 嗯。那我改哼别的～ 律君想听什么？
ritsu: 什么都不用。
shio[smile]: 好冷淡～
: 汐站起来，拍了拍裙子上的灰。白手套在灰色的天光里白得刺眼。
shio[think]: 澪小姐……说了什么吗？
ritsu: 说了一半。
shio: 一半？
ritsu: 另一半，她说要我自己想起来。
shio[think]: ……是吗。
: 汐没有追问。她把红色笔记本抱在胸前，望着远处鸦之塔的钟面。
shio[smile]: 那，回去吧。仓田先生说下午要烤玛德琳蛋糕哦～
@hide

@bg hall
@bgm daily
@caption 8月14日 15:00 月蚀馆·大厅
: 回到本馆的时候，大厅的角落里有两个人在说话。
: 是恭介和宇佐见。恭介抓着宇佐见的袖子，压低了声音，说得又快又急。
: 宇佐见一脸为难，扶了扶圆眼镜，最后像是叹了口气，点了点头。
: 恭介看见律，像被烫了一下似的松开手，头也不回地往交谊厅去了。
> ……什么事？
@show usami[normal] C
usami: 啊，七濑先生。您回来了。
ritsu: 恭介先生找你？
usami[think]: 嗯……问了一些房子的事。没什么要紧的。
> 他推眼镜的手指，比平时快了一点。
usami: 对了，我正好在整理图纸。您要是有空，待会儿可以来看看。
usami[smile]: 出了昨天那种事，我想……把这座宅子的结构讲清楚，也许能派上用场。
@hide
> 下午还很长。雨没有停的意思。
> 与其坐在房间里胡思乱想，不如到处走走——和每个人说说话。
> 判官说，第二只乌鸦会坠落。它会落在谁的头上？
@explore ch2_day
`
  + String.raw`
// ====================================================================
//  日常：自由行动 —— 人物
// ====================================================================

# ch2_d_usami
@bg hall
@show usami[smile] C
@if ch2_d_usami -> ch2_d_usami2
usami[smile]: 七濑先生，来得正好。请看。
: 宇佐见在大厅的长桌上摊开一张大大的蓝图，用乌鸦铜像旁边的两本书压住了边角。
usami: 月蚀馆的平面图。本馆在中间，东翼在右，西翼在左。
usami: 去年我受鹭宫家委托，重建了九年前烧毁的西翼。
usami[smile]: 设计要求只有一条：「和东翼一模一样」。
ritsu: 一模一样？
usami: 是的。但不是复制——是镜像。
: 他把一面小圆镜立在图纸中间的本馆位置上。镜子里，东翼的线条翻转过来，和西翼严丝合缝地重叠。
usami: 以大厅为轴，左右对称。房间号也一样：东1到东6，西1到西6。
usami: 从走廊尽头的仆人楼梯那一头起，第一扇门是1号，往大厅方向依次到6号。
usami[think]: 镜像的意思是——所有东西的左右都是反的。
usami: 比如说，从仆人楼梯上来，面朝大厅的方向走。东翼走廊的窗户在左手边，朝着海。
usami: 换到西翼，同样从仆人楼梯上来，窗户就在右手边。
usami: 客房也一样。推门进去，东翼的电灯开关在门的右手边；西翼的，在左手边。
ritsu: 床、衣柜、镜子，也都反过来？
usami[smile]: 全部。连走廊上挂的画，我都请画师照原画反着临摹了一幅。
usami[smile]: 对称这种东西，差一厘米就不叫对称了。
> 宇佐见说起建筑的时候，整个人都亮了起来。和平时那个一板一眼的人判若两人。
ritsu: 两翼之间，除了大厅还有别的路吗？
usami: 有。地下。
: 宇佐见的笔尖沿着图纸下方的虚线滑过去。
usami: 厨房下面是酒窖，也是以前佣人用的通道。酒窖两头各有一道楼梯，分别通到东翼、西翼走廊的尽头。
usami: 送餐、送酒、收衣服，佣人都走这条路，不用穿过大厅惊扰客人。
usami[think]: 酒窖里没有窗，酒架又多，第一次下去的人很容易迷路。
usami: 所以两道楼梯门上面各钉了一块铜牌，「东楼梯」「西楼梯」。挂得很高，大概两米四。
ritsu: 为什么挂那么高？
usami[smile]: 老规矩。以前的佣人推着酒车进出，挂低了会被撞掉。
usami: 牌子只是挂在钉子上的，可以取下来擦。我去年检修的时候擦过一次，积灰积得厉害。
: 宇佐见从胸前口袋里抽出制图笔，在图纸的角落写下一行小字：「酒窖·仆人通道」。
: 每一笔都横平竖直，粗细一致，像印刷出来的一样。
ritsu: 你的字……
usami[smile]: 工程字。画图的人都这么写，为了不让施工方看错。
usami: 我练了十年，现在不用模板也写得差不多。不过正式的图纸，还是用这个。
: 他从脚边的工具包里抽出一把半透明的塑料尺。尺子上镂空刻着一排排数字、字母和常用的汉字。
usami: 制图用的字模尺。笔尖沿着镂空描一圈，字就出来了，谁描都一样。
usami[smile]: 我一般就把工具包放在那边的沙发上。反正这座岛上，也没人对字模尺感兴趣。
> 工具包敞着口，扔在大厅的沙发上。工具钳、卷尺、制图笔、字模尺……谁都能伸手拿到。
usami: 这张是复印件，您拿着吧。也许比我用嘴说更清楚。
@get ch2_blueprint
ritsu: 西翼现在没有人住？
usami: 还没有正式启用。门锁全是新的，钥匙都在我这里——验收还没做完。
: 宇佐见拍了拍腰间。一串新钥匙叮当作响，每一把上都拴着一块小木牌，上面是他的工程字：「西-1」「西-2」……
usami[think]: ……所以，西翼是这座宅子里最安全的地方。至少锁是可靠的。
> 他说这句话的时候，眼神往交谊厅的方向飘了一下。
ritsu: 宇佐见先生。昨天你在藏书室找的东西，找到了吗？
usami[shock]: ……！
usami[sad]: 那件事……等我自己弄清楚了，再告诉您。
usami: 家父生前……修过那座塔。仅此而已。
@set ch2_d_usami
@note usami 用工程字写标注；制图字模尺放在大厅沙发上的工具包里。西翼的钥匙全在他手上，钥匙牌是他手写的。
@hide
@return

# ch2_d_usami2
usami: 镜像的建筑，最怕的是人。
usami[think]: 房子是对称的，人的习惯却不是。住惯了东翼的人走进西翼，第一件事就是摸错开关。
usami[smile]: 去年验收的时候，工头在西翼摸了三次墙，才找到电灯。
@hide
@return

# ch2_d_hina
@bg hall
@show hina[normal] C
@if ch2_d_hina -> ch2_d_hina2
: 鹭宫雏坐在大楼梯的第七级台阶上，怀里抱着人偶「千代」，安静地看着对面的大座钟。
hina: ……七濑先生。
ritsu: 在这里做什么？
hina: 看钟。
hina: 这里能看见钟，也能看见大厅的每一扇门。谁去东翼，谁去西翼，谁上二楼。
hina[think]: 姐姐以前也喜欢坐在这里。……妈妈说的。我不太记得了。
ritsu: 你不怕吗？这种时候，一个人坐在这里。
hina: 一个人坐在房间里，更怕。
hina: 坐在这里的话，谁走过来，我都能看见。
: 雏把人偶的头发理了理。千代穿着和她一样的黑裙子。
hina: 澪姐姐……以前给我画过一张画。画的是我和千代。
hina[sad]: 她进笼子之前，说要把那张画重新画一遍。……还能画吗？
ritsu: 我去问问。
hina: 谢谢您。
hina: ……七濑先生。厨房的点心，今天早上又少了。
ritsu: 又？
hina: 仓田先生以为是我偷吃的。不是我。
hina[think]: 夜里有人在厨房走动。我听见过脚步声。很轻……像个老人。
> 像个老人？
hina: 也许是千代听错了。
: 三点的钟声从远处的塔上传来。雏的嘴唇无声地动着，一下，两下，三下。
hina: ……三下。对的。
@set ch2_d_hina
@note hina 喜欢坐在大厅楼梯上看座钟——从那里能看见大厅的每一扇门。
@hide
@return

# ch2_d_hina2
hina: 我会一直坐在这里的。到晚上也是。
hina[think]: 十点的钟，我想在这里数。
@hide
@return

# ch2_d_kyosuke
@bg lounge
@show kyosuke[angry] C
@if ch2_d_kyosuke -> ch2_d_kyosuke2
: 恭介瘫在交谊厅的沙发上，脚边已经倒了两只空酒瓶。
kyosuke[surprise]: ……哟，侦探小弟。
kyosuke[smile]: 来得好，来得好。我正想找你呢。
kyosuke: 你是侦探吧？挺厉害的那种？九年前把那个园丁揪出来的那种？
ritsu: ……
kyosuke[smile]: 我雇你。保护我。要多少钱都行——现在鹭宫家的钱都是我的了，哈哈！
ritsu: 我不做保镖。
kyosuke[angry]: 那你是来干什么的？看热闹吗！
kyosuke[shock]: 你知道吗，判官知道我住哪间房。东3。我的信就是从东3的枕头底下翻出来的！
kyosuke[shock]: 谁都知道我住东3！晚上谁来敲门，我都不知道该不该开！
kyosuke[dark]: ……我才不要在那间屋子里睡。打死我也不要。
kuga: 少爷，馆里已经没有空的客房了。
: 坐在牌桌旁的久我律师开了口。他双手交叠搭在手杖上，语气温和得像在念合同条款。
kyosuke[angry]: 那就给我找！你不是很会「处理」吗？
kyosuke[angry]: 两年前那件事，你不是跟我拍着胸脯说「处理干净了」吗！
kyosuke[shock]: 那判官为什么会知道！为什么信上写着「让别人替你坐牢」！
kuga[angry]: 少爷！
: 久我的声音第一次变得严厉。
kuga: ……此处不是说话的地方。请您慎言。
: 恭介咬着牙，抓起酒瓶灌了一口，呛得直咳嗽。
> 「碾碎了一个女孩的人生，又让别人替你坐牢。」——序章那天，判官宣读的罪状。
> 两年前。处理干净了。……他说的是什么？
: 门口有个小小的影子一闪而过。白色的双马尾，琴盒的一角。
> 琴音？
: 等律回头时，走廊上已经没有人了。
kyosuke[sad]: ……侦探小弟。你说，判官下一个要杀的，是我吧？
ritsu: 判官没有亲手杀过人。至少到现在为止。
kyosuke[shock]: 那更可怕啊！那就是说，这屋子里随便哪个人都——
: 他没说完，用手捂住了脸。
kyosuke[sad]: ……我爸再混账，好歹是我爸。
@set ch2_d_kyosuke
@note kyosuke 害怕判官知道自己住在东3，说「打死也不要在那间屋子里睡」。对久我说「两年前那件事你说处理干净了」。
@hide
@return

# ch2_d_kyosuke2
kyosuke[dark]: 别看我。我在想事情。
kyosuke: ……空房间。没人住的、锁是新的那种。嘿嘿。
: 他自言自语着，又往杯子里倒满了酒。
@hide
@return

# ch2_d_kuga
@bg lounge
@show kuga[normal] C
@if ch2_d_kuga -> ch2_d_kuga2
kuga[smile]: 七濑先生。方才让您见笑了。
kuga: 恭介少爷受了很大的刺激，言语难免失当。还请您不要放在心上。
ritsu: 两年前的事，是什么？
kuga[smile]: 律师有保密义务，这一点想必令尊也教过您。
> 滴水不漏。
: 久我拿出一本黑皮记事本，用一支银色的钢笔在上面写着什么。笔帽上刻着两个花体字母：R.K.
kuga: 这支笔吗？家母在我通过司法考试那年送的。用了二十多年了。
kuga[smile]: 人上了年纪，就舍不得旧东西。
: 他想换个坐姿，手杖在地毯上一滑，整个人僵住了，额头上冒出冷汗。
kuga[shock]: ……失礼。老毛病了。
ritsu: 腰？
kuga: 椎间盘突出。阴雨天尤其要命。
kuga[sad]: 登岛那天，连行李箱都是仓田先生替我提上来的。真是不中用。
kuga: 这座岛上楼梯太多了。塔、石阶、酒窖……对我来说每一级都是刑罚。
@set ch2_d_kuga
@note kuga 腰椎间盘突出，拄手杖。常用一支刻着「R.K.」的银色钢笔。
@hide
@return

# ch2_d_kuga2
kuga: 我只想平安地等到渡船来。仅此而已。
kuga[think]: ……不过，这座岛上的人，似乎都不太欢迎律师呢。
@hide
@return

# ch2_d_shiori
@bg lounge
@show shiori[smile] C
@if ch2_d_shiori -> ch2_d_shiori2
shiori[smile]: 女士们先生们～ 啊，只有侦探君一位观众吗？也罢也罢。
: 柊诗织坐在钢琴凳上，手里把玩着一面巴掌大的化妆镜。衣服上的亮片一闪一闪。
shiori[smile]: 来，看好了。这里有一张红心皇后——
: 她把扑克牌举在镜子前。镜子里映出一张红心皇后。
shiori: 现在，我把牌翻过去。镜子里还剩什么？
ritsu: 牌背。
shiori[smile]: 答错～
: 镜子里的红心皇后还在。可她手里的牌，已经变成了一张黑桃A。
ritsu: ……镜子后面贴了一张一模一样的牌。
shiori[angry]: 啊——拆穿魔术师的人最讨厌了！
shiori[smile]: 不过侦探君说对了一半。这个魔术的关键，不是镜子，是观众的眼睛。
shiori: 人的眼睛啊，只认得「长得一样」的东西。
shiori[think]: 只要两样东西长得一模一样，没人会去分哪个是镜子里的、哪个是真的。
shiori[smile]: 一模一样的房间、一模一样的走廊……谁分得出来呢？
> 一模一样的房间。
: 柊的目光越过律的肩膀，落在牌桌旁的久我身上。只有一瞬间，那双猫一样的眼睛里什么笑意都没有。
: 下一秒，她又笑起来，把镜子收进了袖口。
shiori[smile]: 今天的表演到此结束～ 门票是一块蛋糕，记得交给我哦。
@set ch2_d_shiori
@hide
@return

# ch2_d_shiori2
shiori[smile]: 侦探君，要不要学个简单的？「消失的硬币」，三分钟包教包会～
shiori: ……不要？好伤心。
@hide
@return

# ch2_d_shizuka
@bg dining
@show shizuka[normal] C
@if ch2_d_shizuka -> ch2_d_shizuka2
: 御堂静香一个人坐在餐厅里，面前一杯黑咖啡已经凉了。
shizuka: 七濑君。有事？
ritsu: 澪小姐的手，没事吧？
shizuka: 二度烫伤。不会留疤，大概。
shizuka[think]: 你关心凶手，倒是比关心自己多。
ritsu: 我自己有什么好关心的？
shizuka: 你的脸色。从审判结束到现在，像一张没冲洗好的底片。
> 刻薄，但没说错。
ritsu: 医生，这座岛上的人，身体有什么需要注意的吗？
shizuka: 你是问，谁杀得了人，谁杀不了？
ritsu: ……差不多。
shizuka: 坦率。我喜欢。
shizuka: 久我先生是腰椎间盘突出，压迫神经。十公斤以上的东西都不能提，弯腰捡支笔都费劲。
shizuka: 恭介君是急性焦虑加酒精，手抖得连火柴都划不着。
shizuka[think]: 雏小姐营养不良，太瘦。琴音小姐个子小，可是拉琴的人手劲不小。
shizuka: 至于我，五十二岁，每晚靠一粒安眠胶囊才睡得着。
shizuka: 满意了吗？
ritsu: 谢谢。很有用。
shizuka: ……七濑君。
shizuka[sad]: 判官念罪状的时候，念到我那一句——「你篡改了死亡的时刻」。
shizuka: 你那时候在看我。
> 我没有回答。
shizuka: 喝完这杯就回房了。下午我需要睡一会儿。
@set ch2_d_shizuka
@note shizuka 「久我先生是腰椎间盘突出，十公斤以上的东西都不能提。」每晚睡前吃一粒安眠胶囊。
@hide
@return

# ch2_d_shizuka2
shizuka: 还有事？没事的话，让一个上年纪的人安静地喝完咖啡。
@hide
@return

# ch2_d_kurata
@bg kitchen
@show kurata[smile] C
@if ch2_d_kurata -> ch2_d_kurata2
kurata[smile]: 哟，小哥！来得正是时候，玛德琳刚出炉！
: 厨房里飘着黄油和柠檬皮的香气。仓田豪系着围裙，把烤盘从烤箱里抽出来，烫得直甩手。
kurata[smile]: 尝一个尝一个。贝壳形状的，可爱吧？我老婆说我长这张脸烤这种点心，就跟熊在绣花一样。
ritsu: ……很好吃。
kurata[smile]: 是吧！这才是人该过的日子嘛。吃饱了，才有力气害怕。
: 他笑得很响，可笑声停下来以后，厨房里显得格外安静。
kurata[sad]: ……不过啊，小哥。最近怪事太多了。
kurata: 我昨晚明明数过的，冰柜里的火腿还剩一整条。今天早上一看，少了半条。
kurata[think]: 饭团也是。前天少了三个，昨天少了两个。
ritsu: 有人偷吃？
kurata[angry]: 可不是嘛！要是饿了，跟我说一声啊，我给他做热乎的！偷偷摸摸的算什么？
kurata[think]: 雏小姐说不是她。我看那孩子也不像撒谎的样子……
> 序章那天夜里，厨房的饭团就少过。这座宅子里，有一个半夜才出来觅食的人？
ritsu: 仓田先生晚上一般什么时候收工？
kurata[smile]: 十点。十点钟我还有最后一件活儿——送夜宵。
kurata: 每天晚上十点，我会端着托盘，走酒窖的仆人通道，给要夜宵、要酒的客人送到房间去。
kurata[smile]: 九年前我在这儿当主厨的时候，就是这么干的。老规矩了，到现在身体还记着。
ritsu: 为什么不走大厅？
kurata: 端着托盘穿过大厅，碰上客人多难看。仆人有仆人的路嘛。
kurata[think]: 酒窖那地方黑灯瞎火的，酒架跟迷宫似的，绕两个弯就分不清东南西北了。
kurata[smile]: 不过不要紧，我就认那两块铜牌。「东楼梯」「西楼梯」，抬头一看就知道往哪儿走。
kurata: 东翼的客人要东西，就上东楼梯，出来就是东翼走廊的尽头。数门牌就行了。
ritsu: 九年前……
: 律只是随口提了一句。仓田的手却猛地一抖，一只玛德琳掉在了地上。
kurata[shock]: ……啊，糟了糟了，浪费了。
kurata[sad]: 九年前的事……小哥，我就是个厨子。主人让我做什么，我就做什么。
kurata: ……就是这样。
> 「那杯茶里放了什么，你心里清楚。」——判官给他的罪状。
> 他弯腰捡点心的背影，看起来比刚才老了好几岁。
@set ch2_d_kurata
@note kurata 每晚十点走酒窖的仆人通道给客人送夜宵和酒，「九年前就这么干」。酒窖像迷宫，他只认楼梯门上的两块铜牌。
@hide
@return

# ch2_d_kurata2
kurata[smile]: 小哥，晚饭想吃啥？今晚做汉堡肉，大家都需要吃点肉打打气！
kurata[think]: ……顺便，你要是看见谁半夜往厨房摸，帮我说一声啊。
@hide
@return

# ch2_d_kotone
@bg music
@bgm calm
@show kotone[angry] C
@if ch2_d_kotone -> ch2_d_kotone2
: 音乐室里传出小提琴的声音。很快的一段乐句，一遍又一遍，每一遍都比上一遍更锋利。
: 律推开门。琴声停了。
kotone[angry]: ……敲门。基本礼仪都不懂吗，侦探。
ritsu: 抱歉。琴声太好听了，忘了。
kotone[surprise]: ……
kotone[angry]: 拍马屁也没用。出去。
: 真白琴音只有一米五，站在谱架后面，几乎被谱架挡住了半张脸。可她瞪人的样子，像一只竖起毛的猫。
: 她从琴盒里拿出一块琥珀色的小方块，在弓毛上来回擦着。白色的细粉簌簌地落下来。
ritsu: 那是？
kotone: 松香。连这个都不知道？
kotone: 弓毛要擦上松香，才咬得住弦。不然拉出来的声音就像猫在哭。
kotone[angry]: 就是这粉烦死了。沾得到处都是——琴上、袖子上、手上、桌上。洗都洗不掉。
: 律凑近了些。一股淡淡的、像松林一样的气味。
> 松脂的味道。
: 琴音的小提琴上，四根弦在窗光里发着暗暗的光。最粗的那根缠着细细的银丝，在弓擦过的地方，积着一层白白的松香粉。
ritsu: 四根弦不一样？
kotone: 当然不一样。从粗到细是 G、D、A、E。
kotone: 最细的 E 弦是钢弦，一根光溜溜的钢丝。最粗的 G 弦是缠绕弦——芯外面密密地缠着一圈银丝，声音才够低、够厚。
kotone[think]: 你摸一下就知道了。G 弦摸起来是一圈一圈的，像弹簧。
ritsu: 不会断吗？
kotone[angry]: 会断。所以备用弦每种都带一根。
: 她拍了拍琴盒的夹层。里面插着四只扁扁的纸袋，每只上面印着一个字母。
kotone: 来岛上之前刚补齐的，一根都还没拆。这次来岛上，一根弦都没断过。
kotone[angry]: ……要是断了，你就等着听我发火吧。
ritsu: 新弦换上就能用吗？
kotone: 新弦会被拉长，换上头一两天一直走音，拉几句就得重新调一次。烦得要命。
kotone: 所以演出前三天，我从来不换弦。
> 谱架上摊着一份手抄的乐谱。页角用铅笔写着一个小小的「遥」字，字迹不是琴音的。
ritsu: 这份乐谱……
kotone[angry]: 别碰！
: 琴音一把把乐谱合上，动作快得几乎要撕破纸页。
kotone[sad]: ……那是我姐姐抄的。
: 她没有再说下去。窗外的雨声填满了沉默。
ritsu: 刚才在交谊厅门口的，是你吧。
kotone[shock]: ……！
kotone[angry]: 我只是路过。那个醉鬼吵死了，隔着走廊都听得见。
kotone[dark]: 「处理干净了」……有钱人说话，真是轻巧啊。
ritsu: 你认识恭介先生？
kotone[angry]: 不认识。也不想认识。
kotone[angry]: 出去，侦探。我要练琴了。
@set ch2_d_kotone
@note kotone 小提琴的 G 弦是缠着银丝的缠绕弦，E 弦是光滑的钢弦。备用弦每种一根，「一根都还没拆」。新弦换上后会不停走音。松香粉「沾得到处都是」。
@bgm daily
@hide
@return

# ch2_d_kotone2
kotone[angry]: 又来了？你很闲吗？
kotone[think]: ……那个醉鬼，今天晚上住哪儿，你知道吗？
ritsu: 东3吧。
kotone: 哼。没什么。问问而已。
@hide
@return

# ch2_d_fuwa
@bg east_corridor
@show fuwa[normal] C
@if ch2_d_fuwa -> ch2_d_fuwa2
: 不破刚靠在东翼走廊的墙上，叼着牙签，手里摆弄着一只巴掌大的黑色机器。
fuwa: 小鬼。
ritsu: 那是什么？
fuwa: 录音机。微型的。
fuwa: 当刑警时的习惯。口供要录下来。人会改口，磁带不会。
: 他按下播放键。沙沙的杂音里，是今天早上审判时澪的声音：「……我把日记带给他看……」
: 不破啪地关掉了。
fuwa: 每个人说的话，我都录着。你也是。
ritsu: 包括我？
fuwa: 包括你。
fuwa[think]: ……九年前，那个园丁的口供，我也录过。
ritsu: ……
fuwa: 别那么看我。没什么好说的。
: 东3的门里传出摔东西的声音，接着是恭介含混的骂声。
fuwa: 那小子把门反锁了。敲门不开，就隔着门骂人。
fuwa[angry]: 再这么喝，不用判官动手。
ritsu: 你在巡逻？
fuwa: 算是。判官说了第二只乌鸦。我不打算再让人死在我眼皮底下。
fuwa[dark]: ……上一次，我就站在书斋门外。
@set ch2_d_fuwa
@note fuwa 随身带着微型录音机，「当刑警时的习惯，口供要录下来」。
@hide
@return

# ch2_d_fuwa2
fuwa: 有事说事。没事别在走廊晃。
@hide
@return

# ch2_d_shio
@bg east_corridor
@show shio[smile] C
@if ch2_d_shio -> ch2_d_shio2
shio[smile]: 律君～ 抓到了！
: 汐从东5的门口探出半个身子，手里捏着一块玛德琳。
shio[smile]: 仓田先生刚烤好的。我已经吃了四个了，这是第五个～
ritsu: 你会胖的。
shio[angry]: 失礼！我是长身体！
ritsu: 十九岁了还长？
shio[smile]: 长心眼～
: 她咬了一口，眯起眼睛，满足得像只猫。
shio[think]: ……律君。澪小姐说的那一半，是什么？
ritsu: 千鹤的日记里，写到了一个小男孩和一个小女孩。
shio: ……
: 汐咀嚼的动作停了一下。很短，短得像是错觉。
shio[smile]: 是千鹤小姐的弟弟妹妹吗？
ritsu: 千鹤只有雏一个妹妹。那时候雏才五岁。
shio[think]: 那就是……客人家的孩子吧。
shio[smile]: 嗯，十七岁的女孩子，被小孩子缠着，会很开心的哦。我懂～
ritsu: 你懂？
shio[smile]: 我以前也缠着别人嘛。像跟屁虫一样～
: 汐翻开红色笔记本，在某一页上写了几个字，又很快合上了。
shio: 呐，律君。
shio[sad]: 你会一直当侦探吗？就算……就算有一天，你发现自己错了？
ritsu: ……
ritsu: 发现自己错了，才更要当下去吧。
ritsu: 不然，谁来纠正那个错误？
: 汐看着他，没有说话。走廊的窗外，雨打在玻璃上，一道一道往下淌。
shio[smile]: ……嗯。律君就是这样的人呢。
shio[smile]: 那，这块给你。最后一个了，很珍贵的～
@set ch2_d_shio
@hide
@return

# ch2_d_shio2
shio[smile]: 律君晚上要早点睡哦。眼睛下面的黑眼圈，都能装硬币了～
@hide
@return

# ch2_d_kiryu
@bg courtyard
@show kiryu[normal] C
@if ch2_d_kiryu -> ch2_d_kiryu2
: 桐生冬马站在中庭的屋檐下抽烟。烟雾被雨压得很低，贴着地面散开。
kiryu[smile]: 哟，名侦探。审判辛苦了。
kiryu: 第一只乌鸦进了笼子。你又一次把人送进了监狱。感觉怎么样？
ritsu: 她杀了人。
kiryu[smile]: 是啊。九年前那位园丁，也「杀了人」。
> 这个人每一句话，都往最痛的地方戳。而且，他自己清楚得很。
kiryu: 第二句童谣，「两只乌鸦争一面镜，镜中谁是真的影」。知道是什么意思吗？
ritsu: 你知道？
kiryu[smile]: 我写过一本《宵鸦岛怪谈考》，好歹算半个专家。
kiryu: 岛上的老人说，鸦天狗审判罪人的时候，会拿出一面镜子，让罪人照。
kiryu: 可罪人在镜子里看见的，偏偏是别人的脸。
kiryu[think]: 于是两个人就吵起来——镜子里那个才是罪人，不是我。
kiryu: 吵到最后，鸦天狗把两个都带走了。一个死，一个关进笼子。
kiryu[smile]: 很有教育意义吧？推卸责任的人，下场都一样。
ritsu: 一个死，一个关进笼子……
kiryu: 当然，这只是传说。民俗学的东西，十个老人有十一种说法。
: 桐生把烟头按灭在长椅的铁扶手上。
kiryu[dark]: ……不过，判官很喜欢照着传说办事。昨天的鸟笼，你也看见了。
kiryu: 今晚要是有人死在镜子前面，我可一点都不会惊讶。
@set ch2_d_kiryu
@note kiryu 讲第二句童谣的传说：鸦天狗让罪人照镜子，镜中却是别人的脸——「一个死，一个关进笼子」。
@hide
@return

# ch2_d_kiryu2
kiryu: 名侦探，借个火？……不抽烟啊。无趣的人生。
@hide
@return

// ====================================================================
//  日常：自由行动 —— 调查点
// ====================================================================

# ch2_d_toolbag
@bg hall
: 大厅沙发上扔着一只帆布工具包，敞着口。是宇佐见的。
: 工具钳、卷尺、几支制图笔、一把三角尺，还有一把半透明的塑料尺，上面镂空刻着一排排的数字和字。
> 制图用的字模尺。照着镂空描，谁描出来的字都一样。
> 这么重要的东西，就这样扔在大厅里。建筑师大概觉得，没有人会对它感兴趣。
@return

# ch2_d_clock
@bg hall
: 大座钟的钟摆慢慢地左右摇晃。黄铜钟面上，罗马数字已经有些发黑。
: 钟的走时和鸦之塔的钟分秒不差——雏说，她每天都会对一次。
@return

# ch2_d_westdoor
@bg hall
: 通往西翼的门。门框是新刷的漆，和大厅里发黑的老木头比起来，新得有点扎眼。
: 门没有锁。门后的走廊里没有灯，安静得像是没有人住过——事实上也确实没有。
@return

# ch2_d_statue
@bg hall
: 乌鸦铜像展开双翼，黑亮的眼珠盯着大厅的门口。
: 底座上刻着一行褪色的字：「鸦见罪，罪无所遁」。
> 就算真有鸦天狗，它看了九年，也什么都没说。
@return

# ch2_d_cardtable
@bg lounge
: 牌桌上散着几张扑克牌，一个烟灰缸，还有一副没下完的国际象棋。
: 白方的国王被逼在角落里，只差一步就要被将死。不知道是谁下的。
@return

# ch2_d_phone
@bg lounge
: 墙上的内线电话。拿起听筒，只有嘟——嘟——的忙音。
: 不破说过，宅邸里的内线早就坏了。能用的只有对外的那一部，而那一部在无线电室，和电台一起被砸烂了。
@return

# ch2_d_projector
@bg dining
: 序章那天晚上，就是这台放映机自己转了起来，放出了戴乌鸦面具的判官。
: 胶片已经被不破收走了。机器上落了薄薄一层灰。
@return

# ch2_d_painting
@bg dining
: 壁炉上方的油画，画着一群乌鸦落在一座塔上。最高处的那一只，回头看着画外的人。
> 七只。不多不少。
@return

# ch2_d_pantry
@bg kitchen
: 食品柜里，罐头、面粉、腌菜排得整整齐齐。只有放火腿的那一格空了一半，切口歪歪扭扭的，像是用小刀胡乱割下来的。
> 不是厨师的刀法。
@return

# ch2_d_cellardoor
@bg kitchen
: 厨房角落的一扇木门，推开是一道往下的石阶。凉飕飕的空气从下面涌上来，带着酒和霉的味道。
: 这就是仆人通道的入口。仓田每晚十点就从这里下去。
@return

# ch2_d_plate
@bg cellar
: 酒窖两头各有一道往上的楼梯，楼梯口是一扇窄窄的木门。
: 两扇门的门楣上方，高高地挂着两块巴掌大的铜牌，一块刻着「东楼梯」，一块刻着「西楼梯」。
: 铜牌挂在钉子上，离地大概两米四。律踮起脚伸直了手，指尖离牌子还差一大截。
> 够不着。宇佐见那样的个子，大概伸手就能摘下来。
> 煤油灯的光照不到那么高的地方，只有铜牌自己反着一点暗暗的光。
@return

# ch2_d_rack
@bg cellar
: 酒架一排接一排，从地面一直顶到拱形的天花板。窄窄的通道在酒架之间拐来拐去。
: 从厨房的楼梯下来，绕过两排酒架，再回头时，已经说不清楼梯在哪个方向了。
> 宇佐见说得没错。没有窗，没有阳光，地下的方向感是靠不住的。
@return

# ch2_d_crates
@bg cellar
: 酒架旁边整整齐齐地摞着一堆空酒箱，木板钉的，四四方方。最上面那只落着一层灰。
@return

# ch2_d_lantern
@bg cellar
: 拱顶上吊着一盏煤油灯。火苗很小，只照得亮正下方的一圈地面。
: 仓田说，酒窖里只点这一盏，再多就浪费煤油了。
@return

# ch2_d_case
@bg music
: 琴音的琴盒。深蓝色的绒布衬里，夹层里插着四只备用弦的纸袋，G、D、A、E，封口都还好好的。
: 角落里滚着一块用了一半的松香，琴盒的绒布上沾满了白色的粉末。
> 她说得没错，这粉真是沾得到处都是。
@return

# ch2_d_musicwin
@bg music
: 窗外隔着一小片天井，对面就是西翼走廊的窗户。
: 西翼没有人住，那排窗户黑洞洞的。要是对面亮起一盏灯，从这里应该看得一清二楚。
@return

# ch2_d_stand
@bg music
: 谱架上的乐谱已经被琴音收走了。只剩下一支铅笔，笔杆上全是牙印。
> 看来她练琴遇到不顺的地方，会咬铅笔。
@return

# ch2_d_east3
@bg east_corridor
: 东3号室。恭介的房间。门缝底下透出一线灯光，里面传来含混的自言自语。
: 律敲了敲门。
kyosuke{门里的声音}[angry]: 滚！谁都别进来！
> ……看来他还活着。而且精神不错。
@return

# ch2_d_ewin
@bg east_corridor
: 东翼走廊的窗户朝着海。从走廊尽头的仆人楼梯口往大厅方向看，窗户在左手边。
: 雨水把玻璃外的海模糊成一片铅灰色。
@return

# ch2_d_west3
@bg west_corridor
: 西3号室。门上的黄铜门牌和东翼一模一样，只是新得发亮。
: 转了转门把——锁着。宇佐见说钥匙都在他那里。
@return

# ch2_d_wwin
@bg west_corridor
: 西翼走廊。和东翼一模一样的地毯，一模一样的壁灯，一模一样的窗。
: 只是从仆人楼梯口往大厅方向看，窗户在右手边。
> 闭上眼睛转一圈再睁开，大概谁也说不清自己站在哪一翼。
@return

# ch2_d_wpainting
@bg west_corridor
: 走廊墙上挂着一幅画：海边的悬崖，悬崖上的塔。
: 和东翼走廊那幅一模一样——不，是左右相反。连画家的签名都是反着写的。
> 宇佐见先生，对称这件事，你是认真的啊。
@return

# ch2_d_tower
@bg courtyard
: 鸦之塔的钟面在雨雾里泛着灰白的光。三楼书斋的窗户关着，黑丝绒一样暗。
: 塔顶和远处山丘上的神社之间，一条细细的黑线斜斜地拉着——飞鸦祭的缆索。
@return

# ch2_d_greenhouse
@bg courtyard
: 温室只剩下锈蚀的铁骨架，玻璃早就碎光了。野草从地砖的缝里长出来，有半人高。
: 九年前，鹭宫千鹤死在这里。
> 我对这里的记忆，只有第二天早上的样子。泥地上的长靴脚印，沾着血的修枝剪。
> 还有父亲的声音。「律，我们来玩侦探游戏吧。」
@return
`
  + String.raw`
// ====================================================================
//  傍晚 → 晚餐 → 交谊厅
// ====================================================================

# ch2_day_end
@bg east_corridor
@bgm calm
@caption 8月14日 17:30 东翼走廊
: 天色一点一点暗下去。雨小了些，云层的缝隙里透出一抹暗红色的光。
> 离晚饭还有一点时间。
> 与其一个人待着，不如找个人说说话。
@freetime 2
@goto ch2_dinner

# ch2_dinner
@bg dining
@filter none
@bgm daily
@caption 8月14日 19:00 餐厅
: 晚饭是仓田拿手的汉堡肉，配土豆泥和满满一锅蔬菜汤。
: 也许是肉的香味起了作用，这一顿比中午热闹了一点。
kurata[smile]: 多吃点多吃点！汉堡肉要趁热，凉了就跟鞋垫似的！
shio[smile]: 好吃～ 仓田先生，请务必收我当徒弟！
kurata[smile]: 汐小姐只会吃不会做吧？
shio[angry]: 被看穿了！
: 几个人笑了出来。连御堂的嘴角都动了一下。
: 只有恭介，面前的盘子一口没动，倒是红酒已经喝掉了大半瓶。
kyosuke[angry]: ……这什么破酒。酸得要死。
kyosuke[angry]: 仓田！
kurata[surprise]: 在、在！
kyosuke: 酒窖里最贵的那瓶。今晚十点，送到我房间来！
kurata[smile]: 好嘞～ 十点整，老规矩，从酒窖给您送上去！
kyosuke[dark]: 敲三下门。不是三下，我不开。
kyosuke: 别的什么人敲门，我也不开！谁来都不开！
kurata[sad]: ……知道了知道了。
: 恭介打了个酒嗝，又往杯子里倒酒。
: 坐在他对面的宇佐见低着头切肉，一刀一刀，切得过分整齐。
> 下午恭介拉着宇佐见在说什么？
: 律的视线往桌子另一头移过去。
: 琴音握着刀叉，没有吃东西。她在看恭介。那双眼睛里没有恐惧，也没有厌恶。
: 什么都没有。像在看一面墙。
kiryu: 恭介少爷，喝慢一点。你可是今晚的头号候选人。
kyosuke[shock]: 你、你说什么！
kiryu[smile]: 第二只乌鸦嘛。我只是说说而已。
fuwa: 桐生。
kiryu[smile]: 好好好，闭嘴就是了。
@hide

@bg lounge
@bgm calm
@caption 8月14日 20:00 交谊厅
: 饭后，大部分人都聚到了交谊厅。不破的意思很简单：人多的地方，安全。
fuwa: 十点前都待在这里。要走，跟我说一声。
kyosuke[angry]: 凭什么听你的！我回房了！谁都别来烦我！
: 恭介抱着一瓶酒，摔门而去。
: 久我在牌桌旁坐下，摊开黑皮记事本，用那支银色钢笔写着什么。写完，他把笔搁在牌桌上，揉着腰站起来。
kuga: 失礼，我去倒杯水。阴雨天，腰实在是……
: 牌桌旁一下子围了好几个人。桐生和柊在下没下完的国际象棋，琴音坐在旁边的扶手椅上翻乐谱，雏抱着人偶在一旁看棋。
: 律和汐在窗边玩扑克。汐的牌技烂得出奇，连输了五局。
shio[angry]: 律君作弊！一定是作弊！
ritsu: 你的表情把手牌全写在脸上了。
shio[surprise]: 诶？真的吗？
ritsu: 现在你在想「他怎么知道我有两张K」。
shio[shock]: 呜哇——！
@caption 8月14日 20:40 交谊厅
kuga: 诸位，我先告辞了。腰疼得厉害，想早点躺下。
fuwa: 锁好门。
kuga[smile]: 那是自然。
: 久我拄着手杖，慢慢地走了出去。牌桌上已经没有那支钢笔了——律当时并没有注意到。
@caption 8月14日 20:50 交谊厅
kotone: ……这里太吵了。我去音乐室练琴。
fuwa: 一个人？
kotone[angry]: 音乐室就在隔壁走廊。有事我会叫的——叫得比谁都大声。
: 琴音拎着琴盒出去了。差不多同时，宇佐见也站了起来。
usami: 我去收拾一下工具。有些东西还摊在大厅里。
fuwa: 快去快回。
@caption 8月14日 21:00 交谊厅
@se bell
: 远处传来塔钟的声音。雏的嘴唇无声地动着。
hina: ……七、八、九。九下。
shiori[smile]: 雏酱数得真认真。昨天的事以后，大家都跟着你一起数了呢。
hina: ……嗯。
: 隔着走廊，隐隐约约传来小提琴声。是琴音。一段很慢的曲子，像是什么人在很远的地方唱歌。
shizuka: ……拉得很好。
kiryu: 天才少女嘛。就是脾气差了点。
@caption 8月14日 21:20 交谊厅
: 宇佐见回来了。额头上有一层薄汗，开衫的袖口沾着灰。
usami: 抱歉，耽搁了一会儿。
ritsu: 工具收拾得这么累？
usami[surprise]: ……顺便检查了几扇窗。雨大，怕漏水。
: 他在角落里坐下，拿起一本书，却好半天都没有翻页。
@caption 8月14日 21:30 交谊厅
shiori[think]: ……咦，琴声停了呢。
kiryu: 天才也要休息的。
: 雨不知什么时候停了。窗外的云散开一道口子，露出半个苍白的月亮。
shio[smile]: 律君，你看！月亮出来了～
: 汐把脸贴在玻璃上。月光照着她的侧脸，把白手套照得发蓝。
shio[smile]: 这座岛上，好久没见到月亮了呢。
ritsu: 两天而已。
shio[smile]: 两天也很久嘛。
@caption 8月14日 21:50 交谊厅
kurata[smile]: 好啦，我得去干活了。十点给少爷送酒，晚了他又要嚷嚷。
kurata: 各位要夜宵的话，回头跟我说一声啊！
: 仓田哼着不成调的小曲走了。
@caption 8月14日 21:55 交谊厅
hina: ……我去大厅了。
fuwa: 一个人？
hina: 就在楼梯上。我想在那里数十点的钟。……从这里，您也看得见我的。
: 雏抱着千代出去了。从交谊厅敞开的门望出去，能看见她在大楼梯上坐下的小小背影。
@caption 8月14日 22:00 交谊厅
@se bell
: 十点的钟声响起。
: 钟声还没敲完，琴音拎着琴盒走了进来，在钢琴旁边坐下。
kotone: ……音乐室太冷了。
: 她打开琴盒，取出小提琴，夹在下巴下面开始调音。
: 拨一下弦，拧一下弦轴，再拨一下。最粗的那根弦的声音，怎么都对不准。
kotone[angry]: ……啧。
shiori[smile]: 琴音酱，今晚的琴不太听话呢～
kotone[angry]: 雨天受潮。别管我。
: 她拧了一下弦轴，拉了两小节，又停下来重新调。
> 拉了几句又要调。下午她说过什么来着……
shizuka: 恭介君那边，没问题吧。
fuwa: 九点半我去敲过一次门。没应。
fuwa: 门里没动静。大概醉倒了。
kiryu: 醉倒了倒好，省得半夜鬼哭狼嚎。
@caption 8月14日 22:12 交谊厅
@bgm stop
@se footsteps
: 走廊里传来一阵沉重的、跌跌撞撞的脚步声。
@se door
@shake
kurata[shock]: 不、不好了！！
: 仓田撞开交谊厅的门，脸色惨白，围裙歪在一边。他手里还死死攥着那只托盘，托盘上的酒瓶一滴都没洒。
kurata[shock]: 恭介少爷……恭介少爷死了！死在他房间里了！
@bgm horror
fuwa[angry]: 什么！
kurata[shock]: 我、我照老规矩从酒窖上去，门开着一条缝，灯亮着……
kurata[shock]: 少爷就倒在镜子前面！一动不动！镜子上还蒙着黑布……！
fuwa: 走！
@hide

@bg hall
@caption 8月14日 22:13 大厅
: 众人冲过大厅。雏从楼梯上站了起来，怀里紧紧抱着人偶。
hina[shock]: ……发生什么事了？
shio: 雏酱待在这里！不要动！
@bg east_corridor
@filter night
@caption 8月14日 22:14 东翼走廊
: 东翼走廊。壁灯昏黄。东3号室的门——关着。
kurata[surprise]: 怎、怎么关上了……刚才明明开着一条缝……
: 不破一把推开门。
@se door
@bg east_room
@caption 8月14日 22:14 东翼3号室
@bgm mystery
: 房间里一片漆黑。不破摸到门右手边的开关，按亮了灯。
: ——什么都没有。
: 床铺得整整齐齐，没有睡过的痕迹。镜子好好地立在那里，没有黑布。地板上没有血，没有人。
: 衣柜的门半开着，里面空空荡荡。恭介那几只大行李箱，也不见了。
kurata[shock]: 怎么会……！
kurata[shock]: 我看见了！我明明看见了！少爷就倒在这面镜子前面！
kiryu: 仓田先生，你确定没喝多？
kurata[angry]: 我一滴都没喝！我端着酒，看得清清楚楚！
fuwa: ……恭介人呢。
shiori[surprise]: 行李也不见了……难道他自己跑了？
shizuka: 跑去哪里？这是一座岛。
> 床铺整齐，行李消失。像是住在这里的人，从来没有存在过一样。
> 仓田先生不像在说谎。他手里的托盘还在抖。
> 那么——尸体去了哪里？
fuwa: 分头找。两三个人一组，谁都不许单独行动。
fuwa: 我和小鬼查东翼所有房间，然后是一楼。
fuwa: 桐生、柊、宇佐见，你们查二楼。每一间都敲开。
fuwa: 医生，你带着汐和琴音，陪仓田回交谊厅。他这个样子，走不了路了。
shizuka: 明白。
: 宇佐见站在门口，脸色比仓田还白。他张了张嘴，最后什么也没说。
@hide

@bg east_corridor
@caption 8月14日 22:15 东翼走廊
@bgm tension
: 律和不破一间一间地敲开东翼的房门。东1，东2，东4，东5，东6。
: 空的。全是空的。每个房间的主人都在交谊厅或者二楼，此刻正在找人。
@bg hall
@caption 8月14日 22:22 大厅
: 一楼的餐厅、厨房、音乐室，也没有。
: 雏还坐在楼梯上。她看着律和不破从东翼的门里出来，轻轻摇了摇头——没有人经过。
: 二楼传来脚步声。桐生、柊和宇佐见从楼梯上下来。
kiryu: 二楼没人。……不对，有一个人不在。
kiryu[think]: 久我律师的房间，敲门没人应。门没锁，里面是空的。床上没躺过，手杖也不在。
fuwa: 久我？
shiori[think]: 他八点四十就说腰疼回房了呀……
> 恭介不见了。久我也不见了。
> 还剩下哪里没有找过？
ritsu: ……西翼。
fuwa: 西翼没人住。
ritsu: 所以才要去看。
: 宇佐见猛地抬起头，看着律。眼镜后面的眼睛里，有什么东西在剧烈地动摇。
@bg west_corridor
@caption 8月14日 22:28 西翼走廊
@bgm horror
: 西翼走廊没有开灯。只有窗外的月光斜斜地照进来，在地毯上铺出一格一格的白。
: 走廊尽头，仆人楼梯的那扇小门半开着。
: 而走廊中间——西3号室的门，开着一条缝。门缝里透出昏黄的光。
fuwa: ……退后。
: 不破推开了门。
@se door
@bg west_room
@caption 8月14日 22:30 西翼3号室
@se heartbeat
: 床头灯亮着。
: 房间的另一边，一面穿衣镜被黑布严严实实地罩住了。黑布上，插着一根乌鸦的羽毛。
: 镜子前面，倒着一个穿白西装的男人。
@flash white
@shake
: 鹭宫恭介。他侧躺在地上，脸朝着被蒙住的镜子，眼睛睁着。胸口放着另一根黑色的羽毛。
fuwa[angry]: ……可恶！
: 律伸手去摸门边的开关。手指在门框右边摸了个空——开关在左手边。
: 灯亮了。白色的光把房间里的一切都照得清清楚楚。
> 两只乌鸦。一面镜子。
> 「两只乌鸦争一面镜，镜中谁是真的影。」
fuwa: 别碰任何东西。……小鬼，去叫人。不，你留下。我去。
fuwa: 你给我盯着这间屋子。谁来都不许进。
: 不破的脚步声冲出走廊。律一个人站在门口，看着那面被蒙住的镜子。
> 东3里什么都没有。西3里却有一具尸体。
> 尸体从东翼，移到了西翼？
@hide

@caption 8月14日 22:35 西翼走廊
@bg west_corridor
: 众人赶到的时候，走廊里挤满了人。仓田被御堂扶着，一看见房间里面，腿一软就跪了下去。
kurata[shock]: 少爷……是、是少爷……就是这样……我看见的就是这样……
: 就在这时，大厅那边传来了手杖敲在地上的声音。
: 笃，笃，笃。
@show kuga[surprise] C
kuga[surprise]: ……诸位，这是怎么了？出了什么事？
: 久我莲从走廊口探进头来，手里拄着手杖，西装上带着夜里的潮气。
fuwa[angry]: 久我。你去哪儿了？
kuga[shock]: 我……我在鸦之塔的藏书室。有人约我在那里见面，可是等了半个多钟头，谁都没来……
kuga[shock]: 刚才从渡廊回来，听见楼下吵吵嚷嚷的……
: 他的视线越过人群，落在西3的门里。脸上的血色一下子褪尽了。
kuga[shock]: 恭……恭介少爷……？
: 所有人都看着他。没有一个人说话。
@hide
@bg west_room
@caption 8月14日 22:45 西翼3号室
@bgm investigate
shizuka: 让开。我来看。
: 御堂静香在尸体旁边跪下，手指按上恭介的颈侧，又翻开他的眼睑。
shizuka: ……死了。体温已经开始下降，下颌有一点僵硬。
shizuka: 死后一小时上下。九点到十点之间。不会比这更精确了。
shizuka[think]: 后脑有钝器伤，但不是致命伤。致命的是这个——颈部的勒痕。
shizuka: 先被打倒，再被勒死。
: 窗外，月亮又躲进了云里。远处的海浪声一阵一阵地涌上来。
fuwa: 天亮之前，把能查的全查清楚。
fuwa[dark]: ……判官又要开审判了。这次，别再让我们指错人。
> 仓田先生在东3看见了尸体。可我们赶到东3时，那里什么都没有。
> 二十分钟后，尸体出现在西3。
> 一具尸体，是怎么穿过这座宅子的？
@explore ch2_inv
`
  + String.raw`
// ====================================================================
//  搜查：西3（案发现场）
// ====================================================================

# ch2_i_body
@bg west_room
: 鹭宫恭介侧躺在穿衣镜前，脸朝着被黑布蒙住的镜面。白西装的后背皱成一团，皮鞋还穿在脚上。
: 后脑的头发被血黏成一绺一绺的。睁着的眼睛里，凝固着一种惊讶的表情——像是到死都没弄明白发生了什么。
> 没有抵抗的痕迹。指甲干干净净，西装的扣子一颗没掉。
> 先被人从背后打倒，失去意识，再被勒死。
: 衬衫的胸口有一大片干掉的红酒渍。领口歪着，酒气还没散尽。
@get ch2_body
@return

# ch2_i_neck
@bg west_room
: 律蹲下身，借着灯光凑近恭介的脖子。
: 一道极细的勒痕，细得像是用铅笔画上去的，深深地陷进皮肉里，绕了脖子整整一圈。
: 勒痕里面，皮肤上压出了一排细密的、斜斜的纹路。一圈挨着一圈，像拧紧的弹簧。
> 螺旋状的纹路……
> 不是绳子。绳子会留下编织的纹，而且勒痕会宽得多。
> 也不是钓鱼线那种光溜溜的尼龙线。那样的线，只会留下一道平滑的痕。
> 像是一根很细的芯，外面密密地缠着一圈金属丝——
@get ch2_mark
@return

# ch2_i_mirror
@bg west_room
: 穿衣镜被一块黑布从上到下罩住，四角用图钉钉在镜框背面，罩得严严实实。
: 黑布正中插着一根乌鸦羽毛，羽轴穿过布料，卡在布和镜面之间。
: 恭介的胸口，放着另一根。
> 两只乌鸦争一面镜。
> 判官的童谣。凶手照着它布置了现场——和昨天的鸟笼一样。
: 律掀起黑布的一角。镜子里映出他自己的脸，和身后那张被黑布遮住一半的床。
> 镜子里的房间，是左右相反的。
@get ch2_mirror
@return

# ch2_i_desk
@bg west_room
: 书桌上原本立着一对乌鸦形状的铜书挡。现在只剩一只。
: 另一只滚落在尸体的脚边，律把它翻过来——底座沾着已经发黑的血，还缠着几根头发。
> 沉甸甸的，至少两公斤。从背后砸下去，足够让人昏倒。
> 凶器是这个房间里原有的东西。凶手是空着手来的？还是……临时起意？
: 桌上还放着一把新钥匙，拴着一块小木牌。木牌上是横平竖直的工程字：「西-3」。
> 这个字体……
@get ch2_bookend
@return

# ch2_i_wardrobe
@bg west_room
: 衣柜的门开着。里面挂着几件白西装、几件衬衫，下面塞着两双皮鞋。
: 墙边立着三只大行李箱，其中一只敞着口，衣服乱七八糟地堆在里面。
: 床头柜上，半瓶威士忌，一只杯子。
> 东3消失的行李，全在这里。
> 不只是尸体——恭介的「生活」，整个搬进了西3。
@get ch2_luggage
@return

# ch2_i_wswitch
@bg west_room
: 门边的电灯开关。推门进来，开关在左手边。
: 刚才律伸手往右边去摸，摸了个空。
> 东翼的房间，开关在右手边。宇佐见说过，西翼的一切都是反过来的。
> 住惯了东翼的人，在这里第一下准会摸错。
@return

# ch2_i_wbed
@bg west_room
: 床头灯亮着，是罩着布灯罩的那种，光线昏黄。
: 床单上有人躺过的皱痕，枕头底下压着一个黑框信封——判官的信。
: 信纸只有一行字：「你碾碎了一个女孩的人生，又让别人替你坐牢。」
> 恭介把它带到了这里。逃到哪里，都甩不掉。
@return

# ch2_i_wwindow
@bg west_room
: 窗户从里面扣着插销，窗框上积着一层新家具的木屑灰，没有被碰过的痕迹。
: 窗外是黑沉沉的海。月亮在云后面若隐若现。
> 凶手是从门进出的。
@return

# ch2_i_shizuka
@bg west_room
@show shizuka[normal] C
@if ch2_i_shizuka_done -> ch2_i_shizuka2
shizuka: 七濑君。看完了？
ritsu: 死因是勒颈？
shizuka: 是。舌骨没断，勒的东西很细，力道集中在一条线上。
shizuka: 后脑的伤让他失去了意识，倒下之后被人从背后勒住。不需要多大的力气——对方根本没法挣扎。
ritsu: 死亡时间，能再精确一点吗？
shizuka[think]: 我刚才说了，九点到十点之间。体温、尸僵都只能说到这个程度。
shizuka: 再精确，就是算命了。
ritsu: 医生。下午你说过，久我先生——
shizuka: 腰椎间盘突出。
: 御堂摘下手套，看了一眼走廊上那个拄着手杖的身影。
shizuka: 你想问他能不能搬尸体，是吧。
shizuka: 恭介君少说也有六十五公斤。久我先生十公斤以上的东西都不能提，登岛那天他的行李也是仓田先生替他拎的。
shizuka[dark]: 扛着一个成年男人，下酒窖的楼梯，再爬上西翼的楼梯？
shizuka: 他会先瘫在台阶上。到时候躺在那里的就是两个人了。
@get ch2_kuga_back
@set ch2_i_shizuka_done
@hide
@return

# ch2_i_shizuka2
shizuka: 遗体我会让人盖好。现场你们随便看，别动他的位置。
@hide
@return

# ch2_i_fuwa
@bg west_room
@show fuwa[angry] C
fuwa: 小鬼。看出什么了。
ritsu: 你呢？
fuwa: 简单。仓田十点零五分在东3看见尸体。我们十点十四分到，没了。十点半，在西3。
fuwa: 有人把尸体搬过来了。走大厅？雏在楼梯上坐着。那就只剩酒窖。
fuwa[dark]: 这段时间里，人全在交谊厅。只有一个人不在。
: 不破的视线穿过门口，落在走廊上的久我身上。
fuwa: 我们在西翼走廊尽头发现的那支钢笔，你也看见了。
: 不破从胸前口袋里掏出那台微型录音机，在掌心里转了一圈。
fuwa: 天亮之前，我会录下每个人的口供。谁改口，我都知道。
@hide
@return

// ====================================================================
//  搜查：西翼走廊
// ====================================================================

# ch2_i_wstair
@bg west_corridor
: 西翼走廊的尽头，一扇窄窄的木门。门后是往下的石阶，通向地下酒窖——西翼的仆人楼梯。
: 刚才和不破发现尸体之后，就是在这里看到的。
: 往下数第五级台阶上，躺着一支银色的钢笔。笔帽上刻着两个花体字母：R.K.
> 久我莲。Kuga Ren。
> 下午在交谊厅，他用的就是这支笔。「家母送的，用了二十多年」。
: 台阶上积着薄薄的灰，脚印杂乱，看不出是谁的。往下望，石阶拐了个弯，消失在黑暗里。
@get ch2_pen
@return

# ch2_i_wcwin
@bg west_corridor
: 律站在仆人楼梯口，面朝大厅的方向。
: 月光从右手边的窗户照进来，在地毯上铺出一格一格的白。
> 从仆人楼梯上来，西翼的窗在右手边。
> 东翼正好相反。
@return

# ch2_i_wdoor5
@bg west_corridor
: 西5号室。门锁着，门把手上蒙着一层灰，没有被碰过的痕迹。
: 西1、西2、西4、西6也一样。西翼六个房间里，只有西3的锁被打开过。
@return

# ch2_i_usami
@bg west_corridor
@show usami[shock] C
@if ch2_i_usami_done -> ch2_i_usami2
: 宇佐见站在西翼走廊里，背靠着墙，像是要把自己嵌进墙纸里。
usami[shock]: ……七濑先生。
ritsu: 你在这里做什么？
usami[sad]: 检查……门锁。西翼的锁是我装的。我想确认有没有被撬过。
ritsu: 有吗？
usami: ……没有。只有西3是开着的。其他的都锁得好好的。
: 他腰间的那串钥匙轻轻响了一声。律的视线落了上去。
: 一块块小木牌上，是熟悉的工程字：「西-1」「西-2」「西-4」「西-5」「西-6」。
> 少了一把。
ritsu: 「西-3」的钥匙呢？
usami[shock]: ……！
usami[sad]: 那、那个……我也不知道。也许是掉在哪里了……
> 西3的钥匙，就放在西3的桌上。
> 宇佐见先生，你在隐瞒什么？
usami[sad]: 七濑先生，我……
: 他张了张嘴，最后摇了摇头。
usami: ……对不起。我现在什么都不能说。
@set ch2_i_usami_done
@note usami 西翼的钥匙串上，唯独少了「西-3」。被问起时含糊其辞。
@hide
@return

# ch2_i_usami2
usami[sad]: 求您了，七濑先生。让我……再想一想。
@hide
@return

// ====================================================================
//  搜查：地下酒窖
// ====================================================================

# ch2_i_plates
@bg cellar
@if has:ch2_plates -> ch2_i_plates2
: 两道楼梯门上方，铜牌在煤油灯的余光里泛着暗暗的光。
: 现在，左边那扇门上挂着「东楼梯」，右边那扇门上挂着「西楼梯」。
> 从厨房下来绕了两道弯，我已经说不清哪边才是真正的东了。仓田先生说得对，这里只能认牌子。
: 律从酒架旁的那堆空箱子里搬来一只，垫在脚下，凑近了右边门上的「西楼梯」。
: 铜牌后面的墙上，积灰留下了一块干净的长方形——牌子挂了一年，挡住了灰。
: 可那块干净的轮廓，比现在挂在上面的牌子宽了一圈。牌子两边，各露出一道细细的、没有积灰的白边。
: 再去看左边的「东楼梯」。牌子的边缘压在积灰上，把灰蹭得一塌糊涂——它比墙上的轮廓宽。
> 「东」字的牌子略宽，「西」字的略窄。
> 两块牌子，像是被人取下来，挂到了对方的位置上。
: 律用手指在铜牌的边缘抹了一下。指尖沾上了一层白色的细粉。
> 灰尘是灰色的。这是……白色的。
> 是谁？为什么要动这两块挂在两米多高的牌子？
@get ch2_plates
@return

# ch2_i_plates2
: 左边「东楼梯」，右边「西楼梯」。
> 真正挂反了吗？这道门后面，到底通向哪一翼？
@return

# ch2_i_crate
@bg cellar
: 左边那道楼梯门的正下方，孤零零地放着一只空酒箱。
: 白天它不在这里。那时所有的空箱子都整整齐齐地摞在酒架旁边，最上面一只落着灰。
: 箱面的灰上，印着两个新鲜的鞋底蹭痕。不大，前掌窄窄的。
> 有人站在上面过。
> 站在门下面，垫高——为了够到什么？
: 蹭痕的周围，散着一些白色的细粉。和铜牌边缘的那种一样。
: 律捻起一点，凑到鼻子底下。没有灰尘的土腥味，反而有一股淡淡的、清清凉凉的气味。
> 像松林。……在哪里闻到过？
@get ch2_crate
@get ch2_rosin
@return

# ch2_i_rack
@bg cellar
: 酒架上，红酒、白兰地、威士忌排得满满当当。最里面那一格的标签发黄，是几十年前的年份。
: 有一格空了——仓田今晚拿走的那瓶「最贵的」。
@return

# ch2_i_cfloor
@bg cellar
: 酒窖的石板地上积着灰，脚印一层叠一层。仓田每天都要上上下下好几趟，根本分不出谁是谁。
: 不过，地上没有拖拽的痕迹。如果有人拖着一具尸体走过，灰上总该留下点什么。
> ……扛着走的话，倒是不会留下痕迹。
@return

# ch2_i_clantern
@bg cellar
: 拱顶上那盏煤油灯，火苗缩成小小的一点。灯光照不到楼梯门的上方。
> 晚上十点，这么暗的光线下，谁会抬头仔细看那两块牌子的边缘？
> 只会看上面的字。
@return

// ====================================================================
//  搜查：厨房
// ====================================================================

# ch2_i_kurata
@bg kitchen
@show kurata[shock] C
@if has:ch2_kurata -> ch2_i_kurata2
: 仓田瘫坐在厨房的凳子上，手里捧着一杯热水，杯子在手里不停地晃。
kurata[sad]: ……小哥。
ritsu: 仓田先生，能再把当时的事说一遍吗？一点一点，越细越好。
kurata[sad]: 好……好。
kurata: 十点钟，我把红酒和两块三明治放上托盘，从这扇门下了酒窖。
kurata: 酒窖里黑，我就跟平时一样，往挂着「东楼梯」牌子的那扇门走。
ritsu: 你确定是「东楼梯」？
kurata[angry]: 确定！牌子上明明白白写着「东」字！我天天走，错不了！
kurata: 上了楼梯，推开小门，就是走廊的尽头。走廊里没开灯，黑乎乎的。
ritsu: 什么都看不见？
kurata[think]: 也不是……有月亮。雨停了嘛。月光从窗户照进来，地毯上一格一格的白。
ritsu: 窗户在哪边？
kurata[think]: 哪边……我端着托盘，往前走……
kurata: ……右边。对，月光是从右手边照过来的，把我的影子打在左边墙上。
> 右手边。
kurata: 我从楼梯口开始数门。一、二、三。第三扇，东3。
kurata: 门开着一条缝，里头亮着昏黄的灯。我敲了三下，没人应。我就推开门——
kurata[sad]: 屋里只有床头灯亮着，暗得很。我想开大灯，伸手往墙上摸。
ritsu: 往哪边摸？
kurata[think]: 往……左边。摸着了一下，手一抖，没按下去。
kurata[shock]: 然后我就看见了。少爷倒在镜子前面，镜子罩着黑布，一动不动……
kurata[shock]: 我吓得魂都没了，转身就跑。原路下楼梯，穿过酒窖，跑回厨房，跑到交谊厅……
ritsu: 托盘一直拿在手里？
kurata[sad]: ……吓傻了，忘了放下。酒一滴都没洒，你说怪不怪。
> 月光从右边。开关在左边。
> ……东翼的开关，在哪边来着？
@get ch2_kurata
@note kurata 22:05 走「东楼梯」上楼，月光从右手边照进来，房间的开关在左手边。
@hide
@return

# ch2_i_kurata2
kurata[sad]: 小哥……我真的看见了。我没疯。
kurata[sad]: 可东3里怎么就什么都没有了呢……
@hide
@return

# ch2_i_tray
@bg kitchen
: 厨房桌上放着仓田那只托盘。一瓶没开封的红酒，两块用油纸包着的火腿三明治。
: 酒瓶上的标签是几十年前的年份。仓田说，那是酒窖里最贵的一瓶。
> 恭介到死都没喝上。
@return

# ch2_i_pantry
@bg kitchen
: 食品柜里，下午还剩半条的火腿，现在只剩一小截了。面包也少了一整条。
> 今晚又有人来过。这一次，在命案发生的同一个晚上。
> 那个人，看见了什么吗？
@return

// ====================================================================
//  搜查：东3 / 东翼走廊
// ====================================================================

# ch2_i_e3door
@bg east_room
: 东3号室。恭介原本的房间。
: 门没有锁。房间里整整齐齐——床单铺得没有一丝褶皱，枕头摆得端端正正，连拖鞋都并排放在床边。
> 太整齐了。下午隔着门骂人、摔东西的恭介，不像是会把房间收拾成这样的人。
: 地板上没有血迹，没有拖拽的痕迹，也没有酒渍。
@get ch2_east3
@return

# ch2_i_e3desk
@bg east_room
: 书桌上立着一对乌鸦铜书挡，一左一右，夹着几本没人看的旧书。
: 两只都在。底座干干净净。
> 西3的那对书挡，一只沾着血掉在地上。这里的两只，一只都没少。
@return

# ch2_i_e3switch
@bg east_room
: 门边的电灯开关。推门进来，在右手边。
: 刚才不破进门时，手一伸就按到了。
> 和西3正好相反。
@return

# ch2_i_e3mirror
@bg east_room
: 穿衣镜好好地立在墙边，没有黑布，没有羽毛。
: 镜子里，律看见了自己的脸。眼睛下面一片青黑，像好几天没睡过觉。
> 仓田先生说，他看见恭介倒在「这面」镜子前。
> 一模一样的镜子。一模一样的房间。
@return

# ch2_i_e3wardrobe
@bg east_room
: 衣柜里空空荡荡，只剩几只衣架。角落里滚着一枚金色的袖扣。
> 恭介的。走得很匆忙，掉了一枚都没发觉。
@return

# ch2_i_ecwin
@bg east_corridor
: 律走到东翼走廊尽头的仆人楼梯口，转过身，面朝大厅。
: 窗户在左手边。窗外的海黑得看不见边。
> 东翼，窗在左。西翼，窗在右。
@return

# ch2_i_estair
@bg east_corridor
: 东翼的仆人楼梯。小门关着，推开是往下的石阶。
: 台阶上的灰里，脚印杂乱。仓田每天都走，分不出新旧。
: 这里没有掉落任何东西。
@return

// ====================================================================
//  搜查：大厅
// ====================================================================

# ch2_i_hina
@bg hall
@show hina[sad] C
@if has:ch2_hina -> ch2_i_hina2
: 雏还坐在大楼梯上。人偶千代被她抱得紧紧的，裙摆都皱了。
hina: ……七濑先生。恭介哥哥，真的死了吗？
ritsu: ……嗯。
hina[sad]: 是吗。
: 她低下头，把脸贴在人偶的头发上。
ritsu: 雏。今晚你一直坐在这里？
hina: 十点的钟响之前，我就坐在这里了。一直到你们从西翼回来。
ritsu: 这段时间，有人从大厅进出东翼或者西翼吗？
hina[think]: ……没有。
hina: 只有两次。一次是仓田先生喊完以后，大家一起跑去东翼。一次是七濑先生和不破先生去西翼。
hina: 桐生先生他们上二楼又下来，也是从我身边过去的。
ritsu: 有没有人扛着、拖着什么东西？
hina: 没有。我一直看着门。……我很确定。
hina[sad]: 千代也看着呢。
@get ch2_hina
@hide
@return

# ch2_i_hina2
hina: 十点那次的钟，我数了。十下。
hina[think]: ……今晚的钟，没有少。
@hide
@return

# ch2_i_hdoors
@bg hall
: 大厅的两侧，一扇门通往东翼，一扇门通往西翼。
: 雏坐的那级台阶，正好能把两扇门都收进眼底。
> 有人坐在这里看着，就没人能扛着一具尸体从大厅穿过去。
@return

# ch2_i_hclock
@bg hall
: 大座钟的指针指向深夜。钟摆一下一下地摆着，好像什么事都没有发生。
@return

// ====================================================================
//  搜查：交谊厅
// ====================================================================

# ch2_i_kuga
@bg lounge
@show kuga[shock] C
@if has:ch2_note -> ch2_i_kuga2
: 久我坐在沙发上，双手紧紧握着手杖，指节发白。
kuga[shock]: 七濑先生……您也觉得是我吗？
ritsu: 我想先听你说。十点前后，你在哪里？
kuga: 鸦之塔的藏书室。我说过了。
kuga[sad]: 八点四十回房的时候，门缝里塞着这个。
: 久我从西装内袋里抽出一张对折的纸，递了过来。
@letter 22:00 鸦之塔藏书室。\n关于千鹤小姐的遗嘱，有话要说。
: 没有署名。字是一笔一画的，每一笔都一样粗细，横平竖直，像是印刷出来的。
> 工程字。
kuga: 千鹤小姐的遗产问题……那是鹭宫家最敏感的事。作为顾问律师，我不能不去。
kuga[sad]: 我九点五十五分从二楼的渡廊过去，在藏书室点了一支蜡烛，等到十点半。谁也没来。
ritsu: 有人能证明吗？
kuga[shock]: ……没有。
ritsu: 你的钢笔，掉在西翼仆人楼梯的台阶上。
kuga[shock]: 我知道！不破先生拿给我看了！
kuga: 那支笔，我晚饭后在交谊厅的牌桌上写完备忘，起身去倒水——回来就找不到了。我以为是掉在哪里了……
kuga[dark]: 七濑先生。这是陷害。
kuga[dark]: 有人把我引到塔上，让我没有不在场证明，再把我的笔丢在那里。
kuga: 就像……就像有人早就写好了剧本。
@get ch2_note
@hide
@return

# ch2_i_kuga2
kuga[sad]: 我这副身子，连自己的行李都提不动……怎么可能去搬一具尸体呢。
kuga[dark]: ……可是没人会信的。我太清楚了。法庭上，有时候真相是最没用的东西。
@hide
@return

# ch2_i_shio
@bg lounge
@show shio[sad] C
@if has:ch2_alibi -> ch2_i_shio2
shio[sad]: 律君……
: 汐抱着红色笔记本坐在窗边。月光照在她的白手套上。
shio: 我把大家十点前后在哪里，都记下来了。……怕之后有人记错。
ritsu: 给我看看。
: 汐翻开笔记本。字迹圆圆的，一行一行，写得很认真。
shio: 十点到十点十二分，交谊厅里有：律君、我、不破先生、桐生先生、柊小姐、宇佐见先生、御堂医生。
shio: 琴音酱是十点钟声响的时候进来的。
shio: 仓田先生九点五十去厨房准备夜宵。雏酱九点五十五去了大厅楼梯。
shio[think]: 十点十二分以后，大家都跑去了东3。然后不破先生让大家分组——
shio: 律君和不破先生一组，桐生先生、柊小姐、宇佐见先生一组，我和御堂医生、琴音酱陪着仓田先生。
shio: 每一组都没有人落单。雏酱一直在楼梯上，大家来来去去都从她身边过。
shio[sad]: 所以……从头到尾，谁都不知道在哪里的，只有久我先生一个人。
ritsu: ……谢谢。你记得很仔细。
shio[smile]: 助手嘛。这点用处还是有的～
: 她笑了笑，可那个笑容很快就淡了下去。
shio[sad]: 律君。恭介先生下午还在说，他好害怕。
shio[sad]: 我们谁都没有帮他。
@get ch2_alibi
@hide
@return

# ch2_i_shio2
shio: 律君，要喝点热的吗？我去厨房……啊，不行，不许单独行动。
shio[smile]: 那就忍着吧～ 天亮了我给你泡可可。
@hide
@return

# ch2_i_kiryu
@bg lounge
@show kiryu[normal] C
kiryu: 名侦探。答案很明显吧。
kiryu: 被约到塔上、没人作证、钢笔掉在楼梯上——那位律师先生，简直就是把「我是凶手」写在脸上。
kiryu[smile]: 再加上恭介少爷信上那句「让别人替你坐牢」……我猜，替人坐牢的那件事，安排的人就是他吧。
ritsu: 你知道两年前的事？
kiryu[smile]: 我是记者。一点风声而已。
kiryu[think]: ……不过嘛，太明显的答案，往往是给观众看的。
kiryu: 九年前，所有线索也都明明白白地指着那个园丁。你说是吧，名侦探？
> 我没有理他。
> 可那句话，像一根针，扎进了心里最软的地方。
@hide
@return

# ch2_i_cardtable
@bg lounge
: 牌桌上，没下完的国际象棋还摆在那里。旁边是久我饭后用过的黑皮记事本——钢笔不在。
: 晚饭后，这张桌子旁边坐过很多人。桐生、柊、琴音、雏……谁伸手拿走一支笔，都没人会注意。
@return

// ====================================================================
//  搜查：音乐室
// ====================================================================

# ch2_i_kotone
@bg music
@show kotone[angry] C
@if has:ch2_string_pack -> ch2_i_kotone2
: 琴音回到了音乐室，抱着小提琴坐在窗边。
: 她拨了一下最粗的那根弦，皱眉，拧了拧弦轴，再拨一下。
kotone[angry]: ……干嘛。审问吗，侦探。
ritsu: 只是问问。九点到十点，你在哪里？
kotone: 九点在这里练琴。九点半左右，手冷了，回房间待了一会儿。十点去了交谊厅。你们都看见了。
ritsu: 回房间的路上，有没有看见什么人？
kotone[angry]: 没有。走廊里连个鬼都没有。
: 她又拨了一下弦。声音还是偏低。
ritsu: 你的琴，今晚一直在走音。
kotone[angry]: 下雨，受潮。木头的乐器就是这样。
> 下午她说过——新弦会被拉长，换上头一两天一直走音。
ritsu: 能让我看看你的备用弦吗？
kotone[surprise]: ……哈？你有病吗？
kotone[angry]: 看就看。反正你什么也看不懂。
: 琴音粗暴地掀开琴盒的夹层。四只扁扁的纸袋，G、D、A、E。
: D、A、E 三只都还封着口。只有 G 弦的那一只，封口被撕开了，里面是空的。
ritsu: G 弦的备用弦呢？
kotone[angry]: ……用掉了。来岛上之前就用掉了，还没补。
> 下午，她明明说过——「来岛上之前刚补齐的，一根都还没拆」。
kotone[angry]: 看够了吧。出去。
@get ch2_string_pack
@hide
@return

# ch2_i_kotone2
kotone[angry]: 你还想看什么？我的谱子？我的鞋？
kotone[sad]: ……那个醉鬼死了，又不是什么坏事。
: 她说完，自己也像是吓了一跳，扭过头去不再看律。
@hide
@return

# ch2_i_shiori
@bg music
@show shiori[think] C
shiori[think]: 侦探君。这是一场很漂亮的「人体移位」呢。
shiori: 舞台上的瞬间移动，常用的手法有两种。
shiori[smile]: 一种是「替身」——一开始你看见的就不是本人。另一种是「双子箱」——两个一模一样的箱子，观众以为是同一个。
ritsu: 你觉得是哪一种？
shiori[smile]: 魔术师从来不揭穿别人的魔术哦～
: 她笑着，可目光却越过律的肩膀，飘向交谊厅的方向——久我坐着的地方。
shiori[dark]: ……不过，如果凶手是那位律师先生的话。
shiori[dark]: 我倒是一点都不会难过。
> 柊小姐和久我先生之间，有什么过节吗？
@hide
@return

# ch2_i_musicwin
@bg music
: 音乐室的窗户，隔着天井正对着西翼走廊的窗。
: 现在，对面的走廊里亮着灯，人影来来去去——不破他们在西3。
> 从这里看西翼，一清二楚。
> 九点钟的时候，如果西翼走廊里亮过灯……
@return

# ch2_i_stand
@bg music
: 谱架上摊着那份手抄的乐谱。页角那个铅笔写的「遥」字，被谁用指尖摩挲过很多遍，已经有些模糊了。
@return

// ====================================================================
//  搜查：鸦之塔·藏书室
// ====================================================================

# ch2_i_libdesk
@bg library
: 藏书室的书桌上，立着一支烧掉了一半的蜡烛。蜡油沿着烛台淌下来，凝成一层层的泪。
: 桌前的椅子被拉开，对着楼梯的那扇门。像是有人坐在这里，一直盯着门口，等人进来。
> 久我先生说，他在这里等到十点半。蜡烛烧掉的长度，和半个多钟头差不多。
> 但蜡烛只能说明有人点过它，说明不了点蜡烛的人一直坐在这里。
@return

# ch2_i_libbridge
@bg library
: 通往本馆二楼渡廊的门。久我就是从这里来、从这里回去的。
: 渡廊不经过大厅。从二楼的客房走过来，雏是看不见的。
@return

# ch2_i_libplans
@bg library
: 靠墙的图纸柜里，一个抽屉被拉开过。标签上写着「鸦之塔 修缮图 1990」。
: 抽屉里是空的。
> 昨天，宇佐见在这里找的东西……就是这个吗？
> 和今晚的事有关吗？——不，大概无关。可他确实在隐瞒什么。
@return

# ch2_inv_end
@bg west_corridor
@filter night
@bgm mystery
@caption 8月15日 05:40 西翼走廊
: 窗外的天开始泛白。雨又下起来了，细细的，没有声音。
: 律站在西翼走廊的尽头，看着那扇通往酒窖的小门。
> 仓田先生在「东3」看见了尸体。
> 东3什么都没有。西3里，恭介倒在蒙着黑布的镜子前。
> 久我先生被约到塔上，钢笔掉在西翼的楼梯上，没有人能证明他在哪里。
> 一切都指向一个人。——指得太整齐了。
> 「太明显的答案，往往是给观众看的。」桐生的话在耳边打转。
> 九年前，所有的线索也是这么整齐地排在我面前。
@set ch2_inv_done
@se bell
: 六点的钟声响了。紧接着，宅邸各处的旧喇叭里，传出一阵刺耳的杂音。
@bgm judge
judge: ——第二只乌鸦，已经坠落。
judge: 诸位，上午九点，审判厅。
judge: 镜子里的，是真的影子吗？请好好地，看清楚。
@bgm stop
> 好好地看清楚。
> ……我会的。
@goto ch2_trial
` /*SCRIPT_END*/
});
