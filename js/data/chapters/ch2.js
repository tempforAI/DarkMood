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
      desc: '酒窖两道楼梯门上方 2.4 米处，挂在钉子上的「东楼梯」「西楼梯」铜牌。墙上积灰留下的干净轮廓，和现在挂着的牌子大小对不上（「东」字牌略宽一些）——两块牌子像是被取下来，换了位置。铜牌边缘沾着白色粉末。' },
    ch2_crate: { name: '空酒箱', icon: 'generic',
      desc: '酒窖里，西翼那道楼梯门的正下方放着一个空酒箱。箱面上有新鲜的鞋底蹭痕，沾着白色粉末。白天它还和别的空箱一起，整整齐齐地摞在酒架旁边。' },
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
` /*SCRIPT_END*/
});
