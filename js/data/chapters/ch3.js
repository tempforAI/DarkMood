/* 第三章「塔上之鸦」—— 飞鸦
 * 8/15 日常（白天）→ 22:00 不破与律搜查全塔 → 夜（柊 22:30 离开「去冲澡」，00:30 湿发归来）
 * → 8/16 06:00 汐发现瞭望台上的手 → 搜查 → 审判（被害者：久我莲　凶手：柊诗织）
 */
DM.registerChapter({
  id: 'ch3',
  title: '第三章',
  name: '塔上之鸦',
  next: 'ch4',
  start: 'ch3_start',

  evidence: {
    ch3_body: { name: '久我的尸体', icon: 'body',
      desc: '瞭望台东侧栏杆边，一只手从铁栏间垂在外面。死因是勒颈窒息，颈部勒痕带着细密的人字形编织纹路。皮鞋里和裤脚沾着潮湿的沙子；两侧腋下有绳子勒过的擦痕；灰色毛呢外套的肩背沾着黑色油脂；左肩和侧脸有死后跌落造成的擦伤。御堂推定死亡时间：昨晚 23:00～01:00。' },
    ch3_guard: { name: '不破的证词', icon: 'testimony',
      desc: '22:00～06:00 坐在塔一楼门内，椅子顶着门，没有任何人经过。凌晨三点左右打了十分钟左右的盹，但有人推门他一定会醒。二楼藏书室通往楼梯的门，被他用铁丝缠死，早上原封未动。零点前后听见楼上「咣」的一声闷响，以为是钟楼的机械。' },
    ch3_balcony_door: { name: '瞭望台的门', icon: 'door',
      desc: '通往瞭望台的门，门闩在四楼机械室内侧。昨晚 22:00 不破和律亲手闩上；今早依旧闩着，门闩上的灰没有被碰过。从瞭望台一侧无法打开。' },
    ch3_footprints: { name: '沙滩上的脚印', icon: 'footprint',
      desc: '从本馆石阶下到沙滩的一行皮鞋脚印，每一步旁边都有一个手杖戳出的小圆孔。只有去程，没有回程。脚印一直延伸到涨潮冲刷过的湿沙边缘，在那里消失；再往外，沙面被潮水抹得平平整整。沙滩两头都是峭壁，整片沙滩上再没有别的足迹。' },
    ch3_tide: { name: '潮汐表', icon: 'clock',
      desc: '船屋墙上的潮汐表。8月15日夜：低潮 23:10。8月16日：高潮 05:20。仓田说，低潮时北侧海滩的水线要比涨潮时远出三十多米。' },
    ch3_note: { name: '给久我的字条', icon: 'note',
      desc: '久我外套内袋里的字条，歪歪扭扭的印刷体，像是故意用不顺手的那只手写的：「我知道是谁陷害了你。我有船，今晚送你离开这座岛。23:00，北侧海滩，水线处。只身前来，什么都别带。」' },
    ch3_boat: { name: '船屋的划艇', icon: 'boat',
      desc: '船屋的旧划艇。船底积着海水和湿沙，桨架是湿的。系船的位置和昨天下午不同：昨天船头朝里、拴在左边第二根桩上，今天船头朝外、拴在第一根桩上。座板的缝里夹着一片银色亮片。' },
    ch3_cable: { name: '缆索', icon: 'cable',
      desc: '从神社斜拉到塔顶的新钢缆。它从瞭望台的头顶斜穿而过，终点是东侧栏杆外的铁环；铁环前约一米有一圈止挡铁箍，位置正好在瞭望台地面的上方。止挡上有一道新的撞痕；止挡附近的缆索上挂着几缕灰色毛呢纤维。' },
    ch3_trolley: { name: '飞鸦车', icon: 'generic',
      desc: '神社仓库里的「飞鸦车」：带两个滑轮的木制滑车，下方有一只铁吊钩，车尾拴着回收绳。滑轮新上过油，黑色的油脂和久我外套上沾的一模一样。吊钩上残留着一截新麻绳。' },
    ch3_knot: { name: '绳结残段', icon: 'rope',
      desc: '飞鸦车吊钩上那截麻绳。一头牢牢系在钩上，另一头留着一串弯弯曲曲的折痕——正是柊在交谊厅教律打过的「快速解脱结」散开后的形状。绳上蹭着一点白色的蜡。' },
    ch3_cane: { name: '久我的手杖', icon: 'generic',
      desc: '久我从不离身的黑檀手杖，落在神社拜殿后面的草丛里。杖尖上还嵌着几粒海滩的细沙。' },
    ch3_shrine_marks: { name: '神社的拖痕', icon: 'footprint',
      desc: '缆索起点的木平台前，碎石上有一道宽宽的拖痕，从拜殿背后一直拖到平台下的手摇绞盘旁。' },
    ch3_bath: { name: '汐的证词', icon: 'testimony',
      desc: '汐：00:40 去一楼大浴室刷牙时，浴室的地面、瓷砖墙和挂着的浴巾全是干的，看不出一点有人刚洗过澡的痕迹。柊十分钟前才说自己「洗得太久了」。' },
    ch3_cord: { name: '柊的丝编绳', icon: 'rope',
      desc: '柊的道具箱里那根红色丝编绳不见了。昨天下午律被它绑过手腕，腕上留下过一道人字形的压痕——与久我颈部勒痕的编织纹路一模一样。' },
    ch3_sequin: { name: '银色亮片', icon: 'sequin',
      desc: '神社缆索平台下的碎石间捡到的一片银色亮片，和划艇座板缝里的那一片一模一样。' }
  },

  explore: {
    ch3_day: {
      title: '8月15日 午后·自由行动',
      mode: 'free',
      start: 'hall',
      places: ['hall', 'dining', 'lounge', 'kitchen', 'courtyard', 'tower_stairs', 'shrine', 'beach', 'boathouse', 'dock'],
      spots: {
        hall: [
          { anchor: 'clock', label: '座钟', run: 'ch3_d_clock' },
          { anchor: 'crow_statue', label: '乌鸦铜像', run: 'ch3_d_statue' }
        ],
        dining: [
          { anchor: 'projector', label: '放映机', run: 'ch3_d_projector' },
          { anchor: 'window', label: '窗外', run: 'ch3_d_dwindow' }
        ],
        lounge: [
          { anchor: 'sofa', label: '沙发', run: 'ch3_d_sofa' },
          { anchor: 'phone', label: '内线电话', run: 'ch3_d_phone' }
        ],
        kitchen: [
          { anchor: 'pantry', label: '食品柜', run: 'ch3_d_pantry' },
          { anchor: 'knife_rack', label: '刀架', run: 'ch3_d_knives' }
        ],
        courtyard: [
          { anchor: 'cable', label: '天上的黑线', run: 'ch3_d_cable' },
          { anchor: 'greenhouse', label: '温室废墟', run: 'ch3_d_greenhouse' }
        ],
        tower_stairs: [
          { anchor: 'chair', label: '木椅', run: 'ch3_d_chair' },
          { anchor: 'spiral', label: '螺旋楼梯', run: 'ch3_d_spiral' }
        ],
        shrine: [
          { anchor: 'torii', label: '鸟居', run: 'ch3_d_torii' },
          { anchor: 'cable_anchor', label: '缆索平台', run: 'ch3_d_platform' },
          { anchor: 'storehouse', label: '仓库', run: 'ch3_d_storehouse' },
          { anchor: 'steps', label: '山脚的海湾', run: 'ch3_d_cove' }
        ],
        beach: [
          { anchor: 'tower_top', label: '塔顶', run: 'ch3_d_towertop' },
          { anchor: 'waterline', label: '水线', run: 'ch3_d_waterline' },
          { anchor: 'stairs_down', label: '石阶', run: 'ch3_d_bstairs' }
        ],
        boathouse: [
          { anchor: 'tide_table', label: '潮汐表', run: 'ch3_d_tide' },
          { anchor: 'kerosene', label: '煤油罐', run: 'ch3_d_kerosene' },
          { anchor: 'ropes', label: '绳索', run: 'ch3_d_ropes' }
        ],
        dock: [
          { anchor: 'sea', label: '海面', run: 'ch3_d_sea' },
          { anchor: 'gate', label: '铁栅门', run: 'ch3_d_gate' }
        ]
      },
      people: {
        hall: [ { char: 'hina', run: 'ch3_p_hina', x: 236 } ],
        dining: [ { char: 'shizuka', run: 'ch3_p_shizuka', x: 300 } ],
        lounge: [ { char: 'shiori', run: 'ch3_p_shiori', x: 380 }, { char: 'shio', run: 'ch3_p_shio', x: 230 } ],
        courtyard: [ { char: 'usami', run: 'ch3_p_usami', x: 120 } ],
        tower_stairs: [ { char: 'fuwa', run: 'ch3_p_fuwa', x: 110 } ],
        shrine: [ { char: 'kiryu', run: 'ch3_p_kiryu', x: 300 } ],
        boathouse: [ { char: 'kurata', run: 'ch3_p_kurata', x: 260 } ],
        dock: [ { char: 'kuga', run: 'ch3_p_kuga', x: 240 } ]
      },
      done: { need: ['flag:ch3_d_fuwa', 'flag:ch3_d_kiryu', 'flag:ch3_d_shiori', 'flag:ch3_d_kuga', 'flag:ch3_d_kurata', 'flag:ch3_d_usami'],
              run: 'ch3_day_end', prompt: '岛上新开放的地方都走过了。去度过傍晚前的时光吗？' }
    },

    ch3_inv: {
      title: '搜查开始',
      mode: 'investigate',
      start: 'balcony',
      places: ['balcony', 'clockroom', 'tower_stairs', 'courtyard', 'beach_t', 'boathouse', 'shrine', 'lounge', 'kitchen', 'kuga_room'],
      custom: {
        beach_t: { bg: 'beach', variant: 'tracks', name: '北侧海滩（脚印）', area: 'beach' },
        kuga_room: { bg: 'east_room', name: '久我的房间', area: 'mansion' }
      },
      spots: {
        balcony: [
          { anchor: 'railing', label: '久我的尸体', run: 'ch3_i_body' },
          { x: 330, y: 200, label: '外套内袋', run: 'ch3_i_pocket' },
          { anchor: 'ring', label: '铁环与止挡', run: 'ch3_i_ring' },
          { anchor: 'view', label: '远方的山丘', run: 'ch3_i_view' }
        ],
        clockroom: [
          { anchor: 'balcony_door', label: '瞭望台的门', run: 'ch3_i_bdoor' },
          { anchor: 'gears', label: '齿轮', run: 'ch3_i_gears' },
          { anchor: 'floor_hatch', label: '地板的活板门', run: 'ch3_i_hatch' }
        ],
        tower_stairs: [
          { anchor: 'chair', label: '顶门的椅子', run: 'ch3_i_chair' },
          { anchor: 'spiral', label: '螺旋楼梯', run: 'ch3_i_spiral' }
        ],
        courtyard: [
          { anchor: 'cable', label: '缆索', run: 'ch3_i_ccable' },
          { anchor: 'tower', label: '鸦之塔', run: 'ch3_i_ctower' }
        ],
        beach_t: [
          { anchor: 'footprints', label: '脚印', run: 'ch3_i_footprints' },
          { anchor: 'waterline', label: '湿沙的边缘', run: 'ch3_i_waterline' },
          { anchor: 'cliff', label: '塔下的悬崖', run: 'ch3_i_cliff' },
          { anchor: 'rocks', label: '礁石', run: 'ch3_i_rocks' }
        ],
        boathouse: [
          { anchor: 'rowboat', label: '划艇', run: 'ch3_i_boat' },
          { anchor: 'tide_table', label: '潮汐表', run: 'ch3_i_tide' },
          { anchor: 'ropes', label: '麻绳', run: 'ch3_i_ropes' },
          { anchor: 'kerosene', label: '煤油罐', run: 'ch3_i_kerosene' }
        ],
        shrine: [
          { anchor: 'storehouse', label: '仓库', run: 'ch3_i_storehouse' },
          { anchor: 'hall', label: '拜殿', run: 'ch3_i_hall' },
          { anchor: 'cable_anchor', label: '缆索平台', run: 'ch3_i_platform' },
          { x: 214, y: 74, label: '碎石间的反光', run: 'ch3_i_sequin' },
          { anchor: 'steps', label: '石阶与海湾', run: 'ch3_i_cove' }
        ],
        lounge: [
          { anchor: 'card_table', label: '柊的道具箱', run: 'ch3_i_propbox' },
          { anchor: 'window', label: '窗户', run: 'ch3_i_lwindow' }
        ],
        kitchen: [
          { anchor: 'pantry', label: '食品柜', run: 'ch3_i_pantry' }
        ],
        kuga_room: [
          { anchor: 'wardrobe', label: '衣柜', run: 'ch3_i_wardrobe' },
          { anchor: 'desk', label: '书桌', run: 'ch3_i_desk' },
          { anchor: 'bed', label: '床', run: 'ch3_i_bed' }
        ]
      },
      people: {
        balcony: [ { char: 'shizuka', run: 'ch3_q_shizuka', x: 150 } ],
        tower_stairs: [ { char: 'fuwa', run: 'ch3_q_fuwa', x: 110 } ],
        courtyard: [ { char: 'kiryu', run: 'ch3_q_kiryu', x: 330 } ],
        shrine: [ { char: 'usami', run: 'ch3_q_usami', x: 120 } ],
        lounge: [ { char: 'shio', run: 'ch3_q_shio', x: 160 }, { char: 'shiori', run: 'ch3_q_shiori', x: 380 }, { char: 'hina', run: 'ch3_q_hina', x: 260 } ],
        kitchen: [ { char: 'kurata', run: 'ch3_q_kurata', x: 250 } ]
      },
      done: { need: ['ch3_body', 'ch3_guard', 'ch3_balcony_door', 'ch3_footprints', 'ch3_tide', 'ch3_note', 'ch3_boat',
                     'ch3_cable', 'ch3_trolley', 'ch3_knot', 'ch3_cane', 'ch3_shrine_marks', 'ch3_bath', 'ch3_cord', 'ch3_sequin'],
              run: 'ch3_trial', prompt: '线索都齐了。前往审判厅吗？' }
    }
  },

  games: {
    ch3_g1: {
      type: 'debate', title: '证言交锋',
      ammo: ['ch3_guard', 'ch3_balcony_door', 'ch3_body', 'ch3_note', 'ch3_tide'],
      lines: [
        { who: 'kiryu', expr: 'smile', text: '十点到六点，能上塔的只有守门的人。不破，你是{趁打盹的借口}上去的吧？' },
        { who: 'fuwa', expr: 'angry', text: '放屁。椅子{顶着门}，谁推门我都会醒。' },
        { who: 'usami', expr: 'think', text: '瞭望台的门{从机械室内侧闩着}。能闩上它的，只有待在塔里面的人。' },
        { who: 'shizuka', text: '勒痕很新。久我是{在塔上}被人勒死的，这一点不必争。' },
        { who: 'kurata', expr: 'shock', text: '要、要不然……就是{鸦天狗}把他抓上去的……' }
      ],
      answer: { line: 3, weak: 0, ammo: 'ch3_body' },
      hint: '久我的皮鞋里、裤脚上，沾着什么？他死前去过哪里？'
    },
    ch3_g2: {
      type: 'logic', title: '推理回廊',
      questions: [
        { q: '沙滩上的脚印，在哪里消失了？', opts: ['石阶下面', '塔下的悬崖边', '涨潮冲刷过的湿沙边缘'], a: 2 },
        { q: '昨晚 23:00 前后，海水在哪里？', opts: ['退得比今早远三十多米', '和今早一样高', '淹到了石阶脚下'], a: 0 },
        { q: '那么，脚印原本一直通到哪里？', opts: ['礁石背后', '昨晚的水线', '悬崖的岩缝'], a: 1 },
        { q: '久我站在水线处，怎样才能不留回程的脚印离开？', opts: ['被人背走', '沿着水线游泳', '坐上一条船'], a: 2 },
        { q: '凶手自己为什么也没有在沙滩上留下脚印？', opts: ['凶手是从海上来的', '凶手倒着走路', '凶手穿了久我的鞋'], a: 0 }
      ],
      hint: '对照潮汐表：23:10 是低潮。字条约的地点，是「水线处」。'
    },
    ch3_g3: {
      type: 'debate', title: '证言交锋',
      ammo: ['ch3_cane', 'ch3_boat', 'ch3_guard', 'ch3_footprints', 'ch3_tide'],
      lines: [
        { who: 'fuwa', text: '就算有船，从码头上岸再进塔，也得{经过我守着的门}。' },
        { who: 'kurata', expr: 'think', text: '这岛四面都是峭壁，船能靠岸的地方，{只有码头}一处嘛！' },
        { who: 'kiryu', expr: 'smile', text: '那就简单了。凶手{在船上勒死了他}，再变个戏法把人塞上塔。' },
        { who: 'usami', expr: 'think', text: '塔下面是三十多米的悬崖，海路{没法直接通到塔顶}。' }
      ],
      answer: { line: 1, weak: 0, ammo: 'ch3_cane' },
      hint: '久我片刻不离身的手杖，是在哪里找到的？桐生说过，那座山脚下有什么？'
    },
    ch3_g4: {
      type: 'keyword',
      prompt: '从神社通往塔顶、不经过任何一扇门的「路」——',
      answer: '缆索',
      decoys: '楼梯船桥崖钟铁',
      hint: '飞鸦祭的稻草乌鸦，是顺着什么「飞」到塔顶的？'
    },
    ch3_g5: {
      type: 'present',
      prompt: '证明昨晚真有「东西」顺着缆索滑到了塔顶的证据是——',
      answer: 'ch3_cable',
      hint: '塔顶铁环前的止挡、附近的那段钢缆上，留下了什么？'
    },
    ch3_g6: {
      type: 'debate', title: '证言交锋',
      ammo: ['ch3_knot', 'ch3_trolley', 'ch3_cable', 'ch3_body', 'ch3_shrine_marks'],
      lines: [
        { who: 'kiryu', text: '今早我们抬头看的时候，缆索上空荡荡的，{什么都没挂着}。' },
        { who: 'usami', expr: 'think', text: '可滑车撞上止挡就停住了。被挂在钩子上的遗体，{会一直吊在缆索上}才对。' },
        { who: 'shiori', expr: 'smile', text: '女士们先生们～能让尸体自己飞的魔术，我可{没听说过}呢～' },
        { who: 'fuwa', text: '滑车今早{好端端地在仓库里}。' }
      ],
      answer: { line: 1, weak: 0, ammo: 'ch3_knot' },
      hint: '吊钩上那截麻绳，是什么结散开后的样子？那种结有什么特点？'
    },
    ch3_g7: {
      type: 'pick',
      prompt: '能在黑夜里，打出那样一个「算好时机才松开」的结的人是？',
      options: ['kiryu', 'usami', 'fuwa', 'kurata', 'shiori'],
      answer: 'shiori',
      hint: '昨天下午，是谁在交谊厅教律打这种结？绳上那点白蜡，又是谁的东西？'
    },
    ch3_g8: {
      type: 'rebuttal', who: 'shiori',
      blades: ['浴室的地面和浴巾都是干的', '客房里只有洗脸台', '十一点的钟敲了十一下'],
      lines: [
        { expr: 'smile', text: '侦探君，那个结我当着大家的面教过你哦～会打的人{可不止我一个}！' },
        { expr: 'normal', text: '再说了，十点半到零点半，我{一直在大浴室洗澡}～' },
        { expr: 'angry', text: '你们都看见了吧？我回来的时候，{头发还是湿的}呢！' }
      ],
      answer: { line: 1, weak: 0, blade: 0 },
      hint: '汐半夜去大浴室刷牙时，看到了什么？'
    },
    ch3_g9: {
      type: 'present',
      prompt: '能对上久我颈部那道人字形勒痕的「凶器」是——',
      answer: 'ch3_cord',
      hint: '那种人字形的编织纹路，律昨天在自己的手腕上也见过。'
    },
    ch3_g10: {
      type: 'present',
      prompt: '证明柊昨晚坐过那条划艇、到过神社缆索平台的证据是——',
      answer: 'ch3_sequin',
      hint: '划艇座板的缝里、神社的碎石间，都捡到过同一样东西。柊走到哪里都会掉落它。'
    },
    ch3_g11: {
      type: 'reconstruct',
      panels: [
        { text: '晚餐时，凶手把一张字条塞给久我：「我有船，今晚【？】。」', opts: ['带你去找判官', '送你离开这座岛', '把钢笔还给你'], a: 1 },
        { text: '22:30，凶手以【？】为借口离开交谊厅，到船屋划出了划艇。', opts: ['去冲个澡', '去守塔', '去厨房找吃的'], a: 0 },
        { text: '23:00，久我拄着手杖走到【？】，留下一行只有去程的脚印，上了船。', opts: ['码头的栈桥', '塔下的悬崖', '北侧海滩的水线'], a: 2 },
        { text: '船绕到【？】。凶手带久我登上石阶，在拜殿后面用红色丝编绳勒死了他。', opts: ['神社湾', '海蚀洞', '码头'], a: 0 },
        { text: '凶手把遗体拖到缆索平台，用麻绳兜住腋下，挂上【？】的吊钩。', opts: ['塔钟的重锤', '飞鸦车', '船锚'], a: 1 },
        { text: '绳结的尾巴系在回收绳上。滑车撞上塔顶止挡时绳子绷直，【？】整个散开。', opts: ['快速解脱结', '死结', '船上的缆绳'], a: 0 },
        { text: '遗体落在瞭望台上。凶手拉回空滑车，趁着【？】把船划回船屋。', opts: ['天亮', '涨潮', '雨停'], a: 1 },
        { text: '00:30，凶手湿着头发回到交谊厅：「【？】」', opts: ['外面好冷啊～', '我迷路了～', '水好烫，洗得太久了～'], a: 2 }
      ]
    },
    ch3_g12: {
      type: 'vote',
      options: ['fuwa', 'kiryu', 'usami', 'kurata', 'shizuka', 'shiori'],
      answer: 'shiori'
    }
  },

  script: String.raw`

# ch3_start
@title 第三章|塔上之鸦
@bgm stop
@poem 三只乌鸦飞上塔，\n脚下没有回家的沙。
@bg hall
@filter none
@weather none
@caption 8月15日 11:40 月蚀馆·大厅
@bgm calm
: 审判厅的石门在身后合上之后，谁也没有说话。
: 雨停了。高窗外的云层裂开一道缝，漏下一点灰白的光，照在大厅的地毯上。
> 真白琴音被关进鸦笼，是一个小时前的事。
> 她把那把小提琴放进我手里，说：「这把琴，是用谎言买来的。」
> 琴现在躺在我房间的床上。我不知道该拿它怎么办。
> 第一只乌鸦，澪。第二只乌鸦，琴音。
> 宅邸里活着、又没被关起来的人，只剩下十个。
@show shio[normal] C
shio: ……律君。
ritsu: 嗯。
shio[sad]: 琴音酱最后，一直背对着我们呢。
ritsu: 她不想让人看见她的脸。……换作是我，大概也一样。
shio[think]: 嗯～可是啊，律君。
shio: 背对着别人的人，其实最希望有人绕到她前面去看一看哦。
ritsu: ……这是哪本少女漫画里的台词？
shio[smile]: 是汐酱的人生哲学～
: 她笑了一下，可那笑容很快就淡了。她转过头，望着通往中庭的门。
: 门外，鸦之塔的尖顶刺进低低的云里。
shio[normal]: 判官说，「第三只乌鸦，将飞上塔顶」。
shio: 律君，乌鸦……真的会飞上去吗？
ritsu: 乌鸦会不会飞，我不知道。
ritsu: 但人不会。人要上塔，就只能走楼梯。
shio[smile]: 好可靠～不愧是侦探先生。
> ……可靠吗。
> 前两次，我都是在乌鸦落地之后，才赶到现场的。
@hide
@se clock
: 大厅的座钟发出一阵齿轮的咔嗒声。快到正午了。

@bg dining
@caption 8月15日 12:00 餐厅
@bgm daily
: 午饭是仓田做的冷素面，玻璃碗里浮着冰块和细细的葱丝。
: 长桌边空出了四把椅子。谁也没有去动那几把椅子。
@show kurata[smile] C
kurata: 来来来，吃面吃面！天再塌下来，肚子也得填饱嘛！
kurata: 今天的汤底是昆布加木鱼花，熬了一上午哩！
kurata[sad]: ……虽说桌边的人，一天比一天少了。
@hide
@se bell
: 远处，鸦之塔的钟敲响了。
@show hina[normal] C
hina: ……一、二、三……
: 雏抱着人偶，嘴唇轻轻地动。一直数到十二，她才把视线从窗外收回来。
hina: 十二下。今天，一下也没有少。
@hide
@se phone
@wait 400
: 钟声的余音还没散尽，天花板角落那只蒙着灰的旧喇叭，「滋」地响了一声。
@bgm judge
judge: 正午好，诸位。
judge: 第二只乌鸦已经入笼。镜子碎了，影子也散了。
judge: 那么，下一首歌。
judge: 三只乌鸦飞上塔，脚下没有回家的沙。
judge: 今夜，第三只乌鸦将飞上塔顶。
judge: 它不需要楼梯，也不需要门。
judge: 诸位，请好好看着那座塔。
judge: ——对了。通往鸦天狗神社、北侧海滩、船屋的门，我已经替诸位打开了。
judge: 这座岛，是很美的。请在最后的日子里，好好看一看。
@se phone
: 喇叭里传出一声干涩的「咔」，便再也没有声音了。
@bgm tension
@show kuga[shock] C
: 啪嗒一声，久我的筷子掉在了桌上。
kuga: 飞、飞上塔顶……
kuga: 诸位，这是预告。这是不折不扣的杀人预告！
@show kiryu[smile] R
kiryu: 不需要楼梯，也不需要门。哈，好一个飞鸦祭。
@show fuwa[angry] L
fuwa: 管它飞不飞。
: 不破把嘴里的牙签换到另一边，站了起来。
fuwa: 今晚十点起，我坐在塔一楼的门里面。坐一整夜。
fuwa: 谁也别想上去。人也好，乌鸦也好。
fuwa: 十点整，我先把塔从上到下搜一遍。……小鬼。
ritsu: 我？
fuwa: 你跟我来，做个见证。省得明天又有人说是我搞鬼。
ritsu: ……好。
kuga[angry]: 不破先生守着塔，那么谁来守着我们？
kuga: 昨天我差一点就被当成凶手关进那座笼子。
kuga: 这座岛上的每一个人，都在等着把我送进去——我看得出来！
@show shizuka[normal] C
shizuka: 久我先生。被害妄想的话，我这里有药。
kuga[angry]: 御堂医生！我是认真的！
kuga: 我要求离开这座岛。从法律上讲，这已经构成非法拘禁——
@show kiryu[smile] R
kiryu: 那你打算起诉谁？乌鸦？
kuga[shock]: 你……！
@hide
: 久我的手杖在地板上敲了两下，像要说什么，最终却只是重重地坐了回去。
@show shio[smile] L
shio: 那个～我们这边已经商量好了哦！
shio: 今晚，我、雏酱，还有仓田先生，一起睡在交谊厅～
@show kurata[smile] R
kurata: 对对！人多胆壮嘛！咱连被子都扛过去了！
kurata: 真要有什么东西半夜飞进来，咱拿平底锅拍它！
@show hina[normal] C
hina: ……我也，一起。千代也一起。
ritsu: 那我也去交谊厅。
shio[surprise]: 诶，律君也来？
ritsu: 十点要和不破先生搜塔。搜完以后，我回交谊厅守着。
shio[smile]: 嘿嘿～律君守夜的话，汐酱就能安心睡大觉啦～
ritsu: 你本来就睡得很安心吧。
@hide
@bgm calm
: 午饭草草结束。人们各自散开，像是谁也不想在别人的视线里多待一秒。
> 下午还有时间。判官说打开了神社、海滩和船屋。
> 「飞上塔顶」——如果真有什么东西要飞，它一定会从这座岛的某个地方起飞。
> 去看一看吧。在乌鸦落地之前。
@unlock shrine
@unlock beach
@unlock boathouse
@explore ch3_day

# ch3_day_end
@bg courtyard
@caption 8月15日 16:30 中庭
@bgm calm
: 下午的风从海上吹过来，带着潮水的腥味。
: 天空中那根黑色的细线，在风里轻轻颤动，发出几乎听不见的嗡鸣。
@show shio[normal] C
shio: 走了一圈，律君有什么发现吗～？
ritsu: 神社、缆索、滑车、船、潮水、绳结。
ritsu: 东西很多。但它们之间是怎么连起来的，我还不知道。
shio[think]: 嗯……就像还没拼好的拼图？
ritsu: 更像是一副散落在地上的扑克牌。还不知道哪一张是鬼牌。
shio[smile]: 那汐酱就是红心 A～
ritsu: 为什么？
shio: 因为最可爱呀～
ritsu: ……
@hide
> 离晚饭还有一段时间。去找谁说说话吧。
@freetime 2
@goto ch3_evening

`
  + String.raw`

// ================= 日常·人物 =================

# ch3_p_shiori
@if ch3_d_shiori -> ch3_p_shiori2
@bgm daily
@show shiori[smile] C
shiori: 女士们先生们～！欢迎光临，柊诗织的午后特别公演～！
: 交谊厅的牌桌被推到了一边。柊站在地毯中央，燕尾服上的亮片在灰白的天光里一闪一闪。
: 沙发上坐着汐和仓田，像两个被拉来凑数的观众。
shiori: 观众太少了呀……侦探君，你来得正好！请上台～
ritsu: 我只是路过。
shiori: 路过的人，就是今天的幸运观众哦～把双手伸出来！
@show shio[smile] L
shio: 律君，加油～
ritsu: ……你们早就串通好了吧。
@hide shio
: 柊从道具箱里抽出一根绳子。那是一根筷子粗细的红色丝编绳，在她指间闪着暗红的光泽。
shiori: 这是我的宝贝，真丝编的，结实又顺滑。来，双手并拢～
: 她把绳子在律的手腕上绕了三圈，打了两个结，又用力一勒。
ritsu: ……挺紧的。
shiori: 当然啦，绑不紧的话，就不叫逃脱术了～
: 接着，她把另一根绳子递给仓田，自己把双手背到身后。
shiori: 仓田先生，请把我的手绑起来。用力一点也没关系哦～
@show kurata[smile] R
kurata: 嘿嘿，那咱可不客气啦！咱捆过的叉烧，可从来没有逃掉过的！
: 仓田使出浑身力气，在她手腕上打了一个又一个死结。
shiori: 好～那么，请数到五。
kurata: 一、二、三——
@se select
: 「四」字还没出口，柊已经把一根松开的绳子轻轻搭在了仓田的肩膀上。
kurata[shock]: 哈啊！？
@show shio[surprise] L
shio: 好快！完全没看清！
shiori: 女士们先生们～掌声在哪里～？
: 仓田和汐拼命鼓掌。律低头看了看自己被绑着的双手。
ritsu: ……我的呢？
shiori[smile]: 侦探君的，要自己想办法解开哦～
ritsu: 这不是逃脱术，这是绑架吧。
shiori: 哈哈，开玩笑的～
: 柊的指尖在律手腕上一挑，三圈绳子像蛇一样滑落下来。
: 律揉着手腕。皮肤上留下一道淡红的压痕，压痕里排着细密的「人」字形纹路——是丝绳的编织纹。
> 印得真清楚。连每一股丝线的走向都看得出来。
@hide
@show shiori[normal] C
shiori: 侦探君，我告诉你逃脱术的秘密吧。
shiori: 关键不在于「解开」。关键在于，让观众相信你解不开。
shiori: ……这是我师父的口头禅。
ritsu: 你的师父？
shiori: 月岛幻斋。很有名的哦，「水牢的月岛」。
shiori: 九年前我十七岁，就是跟着师父来这座岛，在寿宴上表演的。
shiori[sad]: 三年前，他在台上表演水箱逃脱，锁卡住了。……再也没出来。
: 她说得很轻，像是在说一个别人的故事。随即，她又扬起了嘴角。
shiori[smile]: 好啦，不说这个！下一个节目，是教学时间～
: 柊从道具箱里拿出一根普通的白棉绳，又拿出一小块白色的东西，在绳子上来回擦了几下。
ritsu: 那是什么？
shiori: 魔术师的秘密武器～蜡块。擦一擦，绳子就会滑得像丝绸一样。
shiori: 侦探君，我教你打一种结。叫做「快速解脱结」。
: 她在吊灯的铜钩上搭上绳子，挂上一只鼓鼓的小沙袋，手指翻飞，绕了两个圈，留出一截尾巴。
shiori: 看好了。这个结啊，受力的时候稳稳的，沙袋再重也不会掉。
shiori: 可是只要一扯尾巴——
@se select
: 她轻轻一拉绳尾。结像被施了魔法一样整个散开，沙袋「噗」地掉在了沙发上。
kurata[shock]: 哇！吓死咱了！
shiori: 来，侦探君试试～
: 律照着她的手势，绕了一圈，又绕一圈，把尾巴从环里穿过去。挂上沙袋，绳子纹丝不动。
: 他扯了一下尾巴。结哗地散开，沙袋又掉了下来。
shiori: 满分～！侦探君很有天分嘛，要不要来当我的助手？
ritsu: 我已经有一个助手了。一个就够头疼了。
@show shio[angry] L
shio: 喂～！
@hide shio
: 律看着手里的绳子。刚才打结的那一段，留下了一串弯弯曲曲的折痕，像一条扭动的小蛇。
> 结散开了，形状却还留在绳子上。
ritsu: 舞台上，这种结用在什么地方？
shiori[smile]: 用处可多啦。比如「飞人」。
shiori: 演员腰上挂着钢丝，后台用滑轮和配重——一袋沙子，比演员稍微重一点点。
shiori: 沙袋一落，演员就飞起来了。到了该落地的时候，后台一扯绳尾，演员就「啪」地降落～
shiori: 我十几岁就开始在后台吊威亚了。一个人吊起一个大男人，小意思～
ritsu: ……听起来像物理课。
shiori: 魔术就是物理课呀，侦探君。只不过，我们不让观众看黑板。
@set ch3_d_shiori
@note shiori 会表演绳索逃脱。教律打「快速解脱结」：受力时稳固，一扯尾巴就整个散开。用蜡块擦绳子。
@note shiori 精通舞台「飞人」：滑轮与配重。「一个人吊起一个大男人，小意思」。师父月岛幻斋三年前在水箱逃脱中溺亡。
@hide
: 柊把红绳和白绳一起卷好，丢回交谊厅角落的道具箱里。燕尾服上掉下几片亮片，落在地毯上。
@return

# ch3_p_shiori2
@show shiori[smile] C
shiori: 侦探君，快速解脱结还记得吗？
ritsu: 绕两圈，尾巴穿过去。受力时稳，一扯就散。
shiori: 满分～记住了哦，说不定哪天能救你一命。
shiori[normal]: ……也说不定，能要谁的命呢。
ritsu: 什么？
shiori[smile]: 魔术师的台词啦，台词～
@return

# ch3_p_shio
@show shio[smile] C
shio: 律君～今晚交谊厅的「睡衣派对」，你要带什么零食来？
ritsu: 我是去守夜的，不是去开派对的。
shio: 守夜也会饿的嘛～我已经跟仓田先生预订了布丁哦！
shio[think]: 啊，对了。这里的客房只有洗脸台，想洗澡要去一楼的大浴室呢。
shio: 大浴室晚上冷飕飕的，汐酱今晚就刷个牙算啦～
ritsu: 这种情报不用特地告诉我。
shio[smile]: 侦探先生不是说，什么情报都可能有用吗～
: 汐笑嘻嘻地翻开红色笔记本，在上面画了一只布丁，又画了一只乌鸦。
ritsu: 那本本子里，除了点心以外还写了什么？
shio[surprise]: 诶？……秘、密～
: 她把笔记本合上，抱在胸前。白手套的指尖，在红色的封皮上按得有点紧。
@set ch3_d_shio
@return

# ch3_p_hina
@show hina[normal] C
: 雏坐在大厅楼梯的第三级台阶上，抱着人偶千代，望着座钟的钟摆。
hina: 七濑先生。
ritsu: 在数钟声？
hina: 是的。塔上的钟，和这座钟，差了七秒。塔上的快。
ritsu: ……你连这个都知道。
hina: 数得多了，就知道了。
hina[sad]: 姐姐以前告诉我，八月飞鸦祭的晚上，鸦天狗会顺着神社的那根线，飞到塔上。
hina: 然后，审判有罪的人。
ritsu: 那只是传说。
hina: ……嗯。可是，判官说「它不需要楼梯」。
: 她把千代抱得更紧了一点。
hina: 今晚我和汐小姐、仓田先生一起睡交谊厅。七濑先生也来吗？
ritsu: 嗯。我会在。
hina[smile]: ……那就好。千代说，那样就不怕了。
@set ch3_d_hina
@return

# ch3_p_shizuka
@show shizuka[normal] C
: 御堂医生一个人坐在餐厅的长桌尽头，面前一杯凉透的红茶。
shizuka: 七濑君。来找我问话？
ritsu: 只是想听听医生对现在这种情况的看法。
shizuka: 看法？这座岛上没有好人。只有还没被审判的人。
shizuka[think]: 久我先生刚才来要了止痛药。他的腰，比他自己说的还糟。
shizuka: 椎间盘突出。别说搬东西，上下楼梯都得扶着扶手，一步一步挪。
shizuka: 他说想离开这座岛。就算有船，他那个腰，连桨都划不了。
ritsu: 医生今晚呢？
shizuka: 锁门，吃一粒安眠药，睡觉。我不需要人陪。
shizuka[dark]: 七濑君。如果明天早上我没有下楼，记得叫醒我。
shizuka: ……开玩笑的。我很少开玩笑，所以你应该笑一下。
ritsu: ……哈。
shizuka: 太勉强了。算了。
@set ch3_d_shizuka
@return

# ch3_p_usami
@if ch3_d_usami -> ch3_p_usami2
@show usami[think] C
: 宇佐见站在喷泉边，仰着头，一手扶着圆眼镜，一手拿着制图笔在本子上比划。
usami: 啊，七濑先生。您也在看那根缆索？
ritsu: 很难不看。它就挂在天上。
usami: 钢丝绳，直径大约十二毫米。去年修复飞鸦祭的时候换上的新缆。
usami: 起点在神社的平台，终点在塔顶。全长我估算约三百米，高差二十米出头。
usami: 坡度足够了。滑车挂上去，不用推，自己就会一路滑下去。
ritsu: 终点是在塔顶的哪里？
usami: 瞭望台。缆索从西边过来，从瞭望台的头顶斜穿过去，系在东侧栏杆外的铁环上。
usami: 铁环前面大约一米，有一圈止挡铁箍，防止滑车直接撞坏铁环。
usami[normal]: 所以滑车最后停住的地方，正好在瞭望台地面的上空。
ritsu: ……你很清楚。
usami: 结构是我的专业。这根缆，吊起一辆小汽车都没问题。
usami: 区区一只稻草乌鸦，实在是大材小用了。
ritsu: 那么，吊起一个人呢？
usami[surprise]: ……
usami: 绰绰有余。……七濑先生，您这个问题，让人不太舒服。
ritsu: 抱歉。职业病。
usami[sad]: 塔顶的栏杆，是九年前换的。是我父亲换的。
usami: 他晚年总是说……算了。和今天的事无关。
: 宇佐见合上本子，制图笔在指间转了一圈，插回了胸前的口袋。
@set ch3_d_usami
@note usami 缆索：钢丝绳约12毫米，全长约三百米，高差二十余米。从瞭望台头顶斜穿而过，终点在东侧栏杆外的铁环，环前一米有止挡铁箍。
@return

# ch3_p_usami2
@show usami[normal] C
usami: 滑车停住的位置，在瞭望台地面的上空。这一点请您记住，我是从图纸上确认过的。
usami[think]: ……我为什么要特地强调这个呢。大概是职业病吧。
@return

# ch3_p_fuwa
@if ch3_d_fuwa -> ch3_p_fuwa2
@show fuwa[normal] C
: 不破把一把木椅拖到塔一楼的门内，比划着角度。
fuwa: 小鬼。来得正好。
fuwa: 今晚我就坐这儿。椅背顶着门。谁从外面推门，椅子一动，我就醒。
ritsu: 塔还有别的入口吗？
fuwa: 二楼藏书室，有一道门通本馆的渡廊。
fuwa: 我会用铁丝把藏书室通楼梯的那道门缠死。明早你来看，缠没缠动，一眼就知道。
fuwa: 剩下的就是窗。二楼是封死的，三楼书斋离地十二米，墙光得像镜子。
fuwa: 四楼往外，就是瞭望台。门闩在机械室里面。我亲手闩。
ritsu: 那么，能上塔的路，只剩这扇门和这把椅子。
fuwa: 还有我。
: 他把牙签从嘴角拿下来，在指间捏断了。
fuwa: 十点整，从顶上搜到底。一个老鼠洞也不放过。你给我看清楚了。
ritsu: ……不破先生，为什么要找我做见证？
fuwa: 因为你是侦探。
fuwa: 侦探说的话，大家会信。……九年前就是这样。
: 不破没有再说下去。他把椅子放好，背对着律，看着那扇厚重的门。
@set ch3_d_fuwa
@note fuwa 今晚22:00起坐在塔一楼门内守夜，椅背顶门。22:00与律一起搜查全塔，用铁丝缠死藏书室通楼梯的门，亲手闩上瞭望台的门。
@return

# ch3_p_fuwa2
@show fuwa[normal] C
fuwa: 十点。别迟到。
@return

# ch3_p_kiryu
@if ch3_d_kiryu -> ch3_p_kiryu2
@bgm island
@show kiryu[smile] C
: 桐生靠在神社的鸟居上，叼着烟，相机挂在胸前。
kiryu: 哟，名侦探。你也来朝拜鸦天狗了？
ritsu: 来看看判官说的「很美的岛」。
kiryu: 美？这座神社，是岛民审判罪人的地方。美得很。
kiryu: 知道飞鸦祭吗？我那本《宵鸦岛怪谈考》里，写了整整一章。
ritsu: 稻草乌鸦顺着缆索飞到塔顶。
kiryu: 只答对一半。乌鸦是鸦天狗的化身。它从神社飞下去，落在塔顶，就是「宣判」。
kiryu: 当年的岛民相信，飞鸦落下的那一夜，岛上的罪人会自己死掉。
kiryu[normal]: 喏，看那边。
: 他用烟头指了指拜殿旁边。一座高出地面一人多的木平台，平台的柱子上，钢缆斜斜地伸向远方的塔。
kiryu: 那就是起点。神社在岛中央的山顶，比塔顶还高二十多米。所以乌鸦不用推，自己就会滑下去。
kiryu: 鹭宫家今年把缆索换成了新钢缆。大概是想把祭典重新办起来，给度假酒店招揽客人。
kiryu: 「来宵鸦岛，看乌鸦飞！」——哈，多好的宣传语。
ritsu: 乌鸦是怎么挂到缆索上的？
kiryu: 用「飞鸦车」。走，带你看看。
@se door
: 桐生熟门熟路地推开了仓库的木门。里面一股霉味和桐油味。
: 一辆木制的小滑车靠墙放着，顶上嵌着两个铁滑轮，底下垂着一只铁吊钩。吊钩上挂着一只半人高的稻草乌鸦，翅膀张开，眼睛是两颗红玻璃珠。
kiryu: 滑轮卡在缆索上，乌鸦挂在钩子上。从平台上一放，「嗖」地一下，就到塔顶了。
kiryu: 到了塔顶，滑车撞上止挡停住。然后，用这个——
: 他踢了踢滑车尾巴上拴着的一大卷绳子。绳子上每隔一段，就系着一条褪色的红布。
kiryu: 回收绳。一头拴在平台的桩子上，一头拴在滑车尾巴。滑车下去的时候绳子跟着放出去。
kiryu: 长度和缆索一样长，每十米一条红布做记号。祭典结束，再从神社这边一把一把地把滑车拉回来。
ritsu: 平台边上那台机器呢？
kiryu: 手摇绞盘。乌鸦扎得结实，加上滑车，好几十斤重，得用绞盘吊上平台挂到缆上。
kiryu: 以前要两个壮汉摇。现在嘛……这座岛上已经没有壮汉了。
: 桐生把烟头在仓库门边的石头上摁灭，随手丢在了屋檐下。
kiryu[smile]: 名侦探，你想到了什么？
ritsu: 想到一个人不需要楼梯，也能飞上塔。
kiryu: 哈！这句话我记下了。说不定明天就能用上。
kiryu[normal]: 对了，从这里往下看。
: 神社石阶的尽头，山脚下有一小片被岩壁围起来的海湾，海水泛着暗绿的光。
kiryu: 神社湾。以前祭典的时候，别的岛的渔民就是划着船，从那里上岸，爬石阶上来看飞鸦的。
kiryu: 这座岛到处是峭壁，能靠船的地方，除了码头，也就那儿了。
@set ch3_d_kiryu
@note kiryu 熟知飞鸦祭：神社比塔顶高二十多米，滑车自己会滑下。回收绳与缆索一样长，每十米一条红布记号。平台边有手摇绞盘。
@note kiryu 山脚下的「神社湾」：除了码头之外，唯一能靠船的地方。
@return

# ch3_p_kiryu2
@show kiryu[smile] C
kiryu: 还不走？小心鸦天狗把你当罪人。
kiryu[normal]: ……要说罪人，我这种人排第一个。《恶魔园丁》可是我写的。
@return

# ch3_p_kurata
@if ch3_d_kurata -> ch3_p_kurata2
@bgm daily
@show kurata[smile] C
: 船屋里，仓田正蹲在一堆渔具前翻找着什么。
kurata: 哟，小哥！来得正好，帮咱看看这钓竿还能不能用？
ritsu: 仓田先生要钓鱼？
kurata: 这几天冰箱里的东西少得可怕呀！咱想钓点鱼加个菜。
kurata[angry]: 而且啊，昨晚厨房又被偷了！两个饭团，一罐沙丁鱼！
kurata: 也不知道是哪个馋嘴的家伙，半夜摸进来偷吃，还把罐头盒子带走了！
ritsu: 连垃圾都带走了？
kurata: 可不是嘛！吃得干干净净，一点痕迹不留。这馋鬼还挺讲究的哩。
@hide
: 律环顾船屋。墙上挂着成捆的绳子，角落里是一只铁皮煤油罐。水面上漂着一条旧划艇。
@show kurata[normal] C
kurata: 这条划艇还能浮着，算是奇迹哩。船头朝里，拴在左边第二根桩子上。
kurata: 咱刚才看了看，桨也还在。可惜啊，要划到对岸，没个两天两夜下不来。
kurata: 台风天里，这就是一口漂着的棺材。
ritsu: 墙上那张是什么表？
kurata: 潮汐表。九年前咱在这儿干活的时候就挂着了，每年都会有人换新的。
kurata: 看看……今晚低潮是二十三点十分，明天早上高潮是五点二十。
kurata: 北边那片沙滩啊，退潮的时候水线能退出去三十多米，涨潮时又一直淹到沙滩中间。
kurata: 退潮的晚上去捡贝壳，可好玩哩。……咱年轻时候常去。
@set ch3_d_kurata
@note kurata 划艇：船头朝里，拴在左边第二根桩子上。潮汐表：今晚低潮23:10，明早高潮05:20。北侧海滩低潮时水线能退出三十多米。
kurata[sad]: ……小哥，咱说。
kurata: 九年前，咱也在这座岛上。那时候的事，咱……
kurata: ……算了算了！今晚咱也睡交谊厅，到时候给你们做夜宵！
@return

# ch3_p_kurata2
@show kurata[smile] C
kurata: 晚上的布丁，咱多做了两个！汐小姐预订的！
kurata: 小哥要是想吃，得跟她猜拳哦！
@return

# ch3_p_kuga
@if ch3_d_kuga -> ch3_p_kuga2
@bgm tension
@show kuga[normal] C
: 久我一个人站在码头尽头，拄着手杖，望着灰色的海面。
kuga: ……啊，七濑先生。
kuga: 您是来监视我的吗？还是来看看，下一只乌鸦长什么样子？
ritsu: 只是来看海。
kuga: 海。是啊，海。只要有一条船，这片海一天就能渡过去。
kuga: 七濑先生，船屋那条划艇，能划到对岸吗？
ritsu: 仓田先生说，台风天里，那是一口漂着的棺材。
kuga[sad]: ……况且我这腰，别说划桨，连上船都要人扶。
kuga[angry]: 您知道吗？昨天在审判厅，所有人看我的眼神。
kuga: 「他是律师，他替人安排顶罪，他什么都干得出来」——
kuga: 是，我做过一些在法律上……有灰色地带的工作。
kuga: 可我没有杀人！我只是一个按照委托人的意思处理事务的人！
ritsu: 判官的信里写着：「你出卖了你的委托人——不止一次。」
kuga[shock]: ……
kuga: 那是……那是诽谤。毫无证据的诽谤。
: 他的手杖在木栈桥上打滑，发出一声尖响。
kuga[normal]: 七濑先生。我是个讲道理的人。所以我把话说在前面。
kuga: 如果有谁能带我离开这座岛，我愿意付任何代价。
kuga: 任何代价。请您……如果听到了什么消息，务必告诉我。
@set ch3_d_kuga
@note kuga 一心想离开这座岛。「如果有谁能带我离开这座岛，我愿意付任何代价。」腰伤严重，划不了船。
@return

# ch3_p_kuga2
@show kuga[normal] C
kuga: 七濑先生。您相信这座岛上，还有好人吗？
kuga[sad]: ……我不相信。所以我只相信船。
@return
`
  + String.raw`

// ================= 日常·调查点 =================

# ch3_d_clock
: 大厅的座钟。黄铜钟摆不紧不慢地摇着。
> 雏说，塔上的钟比它快七秒。在这座岛上，连时间都不肯统一口径。
@return

# ch3_d_statue
: 乌鸦铜像张着翅膀，低头俯视着大厅。脚边立着一只擦得锃亮的铜烛台。
> 每次经过这里，都觉得它在数我们还剩几个人。
@return

# ch3_d_projector
: 餐厅角落的放映机，蒙着一块白布。序章那晚，判官就是从这台机器里第一次出现的。
> 中午的广播没有用放映机，而是走的天花板上那些旧喇叭。判官的手，伸得比我想的还要远。
@return

# ch3_d_dwindow
: 从餐厅的窗户望出去，能看见鸦之塔的上半截，和一根从左边斜拉过来的黑线。
: 黑线的另一头，消失在岛中央那座长满松树的山丘上。
> 判官说「请好好看着那座塔」。那么，也该好好看看，这根线是从哪里来的。
@return

# ch3_d_sofa
: 交谊厅的沙发。坐垫的缝隙里，卡着几片小小的银色亮片。
@show shiori[smile] C
shiori: 啊，那个是我的～这件燕尾服啊，亮片掉得像下雪一样。
shiori: 我走到哪儿掉到哪儿，像童话里一路撒面包屑的小孩～
shiori: 侦探君要是想找我，跟着亮片走就行了哦～
@return

# ch3_d_phone
: 墙上的内线电话。拿起听筒，只有一片沙沙的电流声。
> 只能打到馆内的几个房间。打不到岛外，也打不到判官那里。
@return

# ch3_d_pantry
: 食品柜的门上贴着一张纸，用粗大的毛笔字写着：
@letter 偷吃饭团的家伙！\n咱知道你是谁！（其实不知道）\n想吃就说一声，咱给你做！\n——仓田
> ……这大概是这座岛上最温柔的一封恐吓信。
@return

# ch3_d_knives
: 刀架上整整齐齐插着七把刀。空着的那一格，是插在玄藏先生胸口、后来作为证物收起来的那一把。
> 仓田先生每天早晚都会数一遍。自从那件事以后，他再也没让刀离开过视线。
@return

# ch3_d_cable
: 律仰起头。那根黑色的钢缆从岛中央的山丘斜拉下来，越过中庭的上空，一直连到鸦之塔的顶上。
: 风吹过，钢缆发出几乎听不见的嗡鸣，像是很远的地方有人在拉一根低音弦。
> 从中庭看上去，它像是天空上的一道裂缝。
@return

# ch3_d_greenhouse
: 温室只剩下锈蚀的铁骨架。玻璃早就碎光了，地上长满了杂草。
: 九年前，鹭宫千鹤就是死在这里。
> 每次站在这里，左手掌心的旧疤，都会隐隐地发痒。
> ……大概是天气的缘故。
@return

# ch3_d_chair
: 一把结实的橡木椅，被不破搬到了门边。椅背的高度，正好卡在门把手下方。
> 从外面推门，门板会先撞上椅背。坐在上面的人，不可能感觉不到。
@return

# ch3_d_spiral
: 螺旋楼梯一圈一圈地盘上去，消失在昏暗里。二楼藏书室、三楼书斋、四楼机械室，再往上就是瞭望台。
> 想上塔顶，就得走过这道楼梯的每一级台阶。至少，对人来说是这样。
@return

# ch3_d_torii
: 鸟居的朱漆剥落得斑斑驳驳，横梁上停着两只乌鸦。律走近时，它们一齐飞了起来，朝着塔的方向。
> 连乌鸦都知道路。
@return

# ch3_d_platform
: 拜殿旁的木平台，高出地面一人多。钢缆就从平台的立柱上出发，斜斜地伸向远方的塔。
: 平台下面，是一台锈迹斑斑的手摇绞盘，绞盘的铁钩垂在平台边上。地上铺着细碎的白色碎石。
: 从这里望过去，塔顶只有拇指那么大。钢缆一路往下，在灰色的天空里划出一条笔直的线。
> 稻草乌鸦从这里出发，几十秒后就能落到塔上。……如果挂上去的，不是稻草乌鸦呢？
@return

# ch3_d_storehouse
: 仓库里，那辆「飞鸦车」靠墙放着。两个铁滑轮，一只铁吊钩，钩上挂着张开翅膀的稻草乌鸦。
: 车尾拴着一大卷回收绳，每隔一段系着一条褪色的红布。
: 滑轮的轴上积着一层干掉的旧油泥，转起来吱吱作响。
> 九年没用过了。轮子已经快转不动了。
@return

# ch3_d_cove
: 神社的石阶一路往下，通向山脚一小片被岩壁环抱的海湾。湾里的水很平静，泛着暗绿的光。
: 石阶是整块的岩石凿成的，被几百年的脚步磨得光滑。
> 神社湾。从海上来，能直接走上神社的路。
@return

# ch3_d_towertop
: 从海滩抬头，鸦之塔就立在头顶的悬崖边上，高得让人脖子发酸。
: 塔顶的瞭望台上，那根钢缆从西边斜穿过来，越过瞭望台的头顶，系在东侧栏杆外的铁环上。
> 缆索的终点，悬在瞭望台的上空。
@return

# ch3_d_waterline
: 午后正在涨潮。海浪一层一层地舔上来，把沙滩下半截的沙子抹得平平整整。
: 律蹲下来，在湿沙上按了一个手印。下一个浪头涌上来，手印就不见了。
> 潮水是这座岛上最好的清洁工。
@return

# ch3_d_bstairs
: 从本馆侧门下来的一道石阶，又陡又窄，是下到北侧海滩的唯一的路。
: 沙滩两头都被黑色的峭壁截断。除了这道石阶，就只有大海。
> 一片只有一个出口的沙滩。
@return

# ch3_d_tide
: 墙上钉着一张泛黄的潮汐表，八月的那一栏被人用红笔圈了出来。
: 8月15日，低潮 23:10。8月16日，高潮 05:20。
> 今夜的海，会在十一点退到最远的地方。
@return

# ch3_d_kerosene
: 墙角的铁皮煤油罐。拧开盖子闻一闻，满满一罐，几乎溢到了罐口。
> 船屋的煤油，大概是给码头的信号灯用的。
@return

# ch3_d_ropes
: 墙上挂着成捆的绳子。旧的是发黑的棕绳，新的是去年刚买的麻绳，还带着一股草腥味。
> 绑船、挂网、拖东西……在海边，绳子永远不嫌多。
@return

# ch3_d_sea
: 灰色的海面一直延伸到天边，看不到一点陆地的影子。
: 渡船还要四天才会回来。
> 序章那天，黑川先生就是在那艘船尾，朝我们挥手的。
@return

# ch3_d_gate
: 码头的铁栅门。锈蚀的铰链在风里吱呀作响。
> 关得住人，关不住海风。
@return
`
  + String.raw`

// ================= 晚餐 → 搜塔 → 夜 → 黎明 =================

# ch3_evening
@bg dining
@filter night
@caption 8月15日 19:00 餐厅
@bgm calm
: 晚饭是仓田的炖鱼和味噌汤。他下午真的钓上来两条黑鲷，得意得像是打了一场胜仗。
@show kurata[smile] C
kurata: 怎么样怎么样！咱的手艺加上咱的运气，天下无敌哩！
@hide
: 饭桌上难得有了一点笑声。只有久我一个人坐在桌角，筷子几乎没有动过。
@show shiori[smile] C
shiori: 女士们先生们～饭后的小节目！
: 柊捏起一枚硬币，在指间翻了几个跟头，啪地一合掌——再张开时，手心空空如也。
shiori: 硬币去哪儿了呢～？……久我先生，您外套的口袋里，好像有什么东西哦？
@show kuga[surprise] R
kuga: 我的口袋？
: 久我狐疑地把手伸进外套口袋，摸出了一枚硬币。
kuga: ……这……
shiori: 掌声～！
: 众人稀稀拉拉地鼓了掌。久我勉强扯出一个笑，把硬币放在桌上。
@hide
> 柊小姐什么时候碰过他的外套？我一直坐在对面，完全没有看见。
> 魔术师的手，比侦探的眼睛快。
: 过了一会儿，律无意间又看了久我一眼。
: 久我低着头，把一张折得很小的纸片摊在膝盖上，看了很久。
: 他的脸色先是一白，接着，慢慢地，竟然平静下来了。他把纸片塞进外套内侧的口袋，按了按。
@show kuga[smile] C
kuga: ……仓田先生，这鱼很好吃。能再给我添一碗汤吗？
@show kurata[surprise] R
kurata: 哦、哦！当然！
@hide
> 中午还在嚷着「非法拘禁」的人，此刻却像是放下了一块大石头。
> 他刚才看的，是什么？
@show kuga[normal] C
: 晚饭一结束，久我就撑着手杖站了起来。
kuga: 诸位，我先回房了。今晚我会锁好门，不管是谁来敲，我都不会开。
kuga: 晚安。……祝诸位，都能平安地看到明天的太阳。
@hide
: 他拄着手杖，一步一步地挪出了餐厅。手杖敲在地板上的声音，慢慢远去。
@show kiryu[smile] C
kiryu: 啧。那家伙今晚倒是挺镇定的嘛。
kiryu: 我回房间写稿了。要是今晚真有乌鸦飞，我得第一个写下来。
@show usami[normal] R
usami: 我也回房间。图纸还有一部分没有整理完。
@show shizuka[normal] L
shizuka: 我锁门睡觉。诸位晚安。
@hide
@show shiori[smile] C
shiori: 交谊厅的睡衣派对，我也要参加～！人多才热闹嘛！
@show shio[smile] L
shio: 欢迎欢迎～柊小姐来的话，还能看魔术！
@hide
> 交谊厅过夜的人：汐、雏、仓田先生、柊小姐，还有搜完塔之后的我。
> 不破先生在塔里。久我先生、桐生先生、宇佐见先生、御堂医生，各自锁在自己房间。
@goto ch3_tower_search

# ch3_tower_search
@bg tower_stairs
@filter night
@caption 8月15日 21:58 鸦之塔·一楼
@bgm mystery
@se footsteps
: 塔里冷得像地窖。不破提着一盏手电筒，在门口等着。
@show fuwa[normal] C
fuwa: 来了。
fuwa: 从上往下搜。我在前，你在后。你看见什么不对劲，就喊。
ritsu: 明白。
@hide
@bg library
@caption 22:02 鸦之塔·二楼 藏书室
: 藏书室里堆满了发霉的书和图纸。通往本馆的渡廊门关着，固定窗封得死死的。
: 书架后面、桌子底下、窗帘后面，两个人一处一处照过去。没有人。
@show fuwa[normal] C
fuwa: 渡廊那头，谁都能进来。所以——
: 不破从大衣口袋里掏出一卷铁丝，把藏书室通往螺旋楼梯的那道门的把手，和楼梯边的铁扶手缠在一起，一圈又一圈。
fuwa: 这样，就只能从楼梯这边拆。拆了，明早一看就知道。
@hide
@bg study
@caption 22:06 鸦之塔·三楼 书斋
: 书斋的门，第一晚被不破撞坏之后，就再也闩不上了。屋里残留着淡淡的焦味。
: 壁炉、书桌、鸟笼、墙角的检修小门。天花板的活板门，锈钉依旧钉得死死的。
> 这里是玄藏先生死去的地方。现在，只剩下一屋子的寂静。
@bg clockroom
@caption 22:10 鸦之塔·四楼 机械室
@se clock
: 机械室里，齿轮咔嗒咔嗒地咬合着，三口铜钟沉默地垂在头顶。
: 齿轮的缝隙、钟的下面、重锤井口，都照过了。连一只老鼠都没有。
@show fuwa[normal] C
fuwa: 最后是瞭望台。
@hide
@bg balcony
@caption 22:13 鸦之塔·瞭望台
@weather none
@se wave
: 推开门，夜风扑面而来。环形的瞭望台空荡荡的，新铁栏杆在手电光里泛着冷光。
: 远处，海浪拍打着悬崖。月亮从云缝里露出半张脸。
: 律抬起头。那根钢缆从西边的夜空里斜斜地伸过来，在他头顶两米多高的地方掠过，越过整个瞭望台。
: 它的终点，是东侧栏杆外面的一只铁环。铁环前约一米，有一圈粗粗的铁箍——止挡。
> 宇佐见先生说得没错。止挡的位置，正好悬在瞭望台的地面上方。
> 如果有一只稻草乌鸦飞到这里停住，它会正好挂在我们头顶上。
@show fuwa[normal] C
fuwa: 看什么？
ritsu: 缆索。
fuwa: 一根钢缆。人总不能顺着它爬过来吧。
ritsu: 从神社爬三百米的钢缆？那得是马戏团。
fuwa: 哼。这岛上可没有马戏团。
@hide
: 律最后看了一眼空荡荡的瞭望台，地板、栏杆、头顶的缆索。什么都没有。
@bg clockroom
@caption 22:16 鸦之塔·四楼 机械室
@se door
: 两人退回机械室。不破关上通往瞭望台的门，把粗大的铁门闩「哐」地一声推到底。
@show fuwa[normal] C
fuwa: 看清楚了？门闩在里面。瞭望台那边，没有把手，没有锁孔。
ritsu: 看清楚了。
fuwa: 那就行了。
@hide
@bg tower_stairs
@caption 22:20 鸦之塔·一楼
: 下到一楼，不破把那把橡木椅推到门后，椅背卡在门把手下面，然后一屁股坐了上去。
@show fuwa[normal] C
fuwa: 塔里没人。从现在开始，到明早六点，也不会有人。
fuwa: 你回去吧，小鬼。……我出去的时候，你从外面把门带上。
ritsu: 不破先生。一整夜，不会困吗？
fuwa: 当刑警的时候，蹲过三天三夜的点。
fuwa: 坐在椅子上，算是享福。
@hide
@se door
: 律从外面关上了门。门内传来椅子挪动的声音，然后，什么声音都没有了。
@goto ch3_lounge_night

# ch3_lounge_night
@bg lounge
@filter night
@caption 8月15日 22:25 交谊厅
@bgm calm
: 交谊厅里亮着一盏台灯。地毯上铺开了被褥，仓田的鼾声已经开始酝酿了。
@show shio[smile] C
shio: 律君，欢迎回来～塔里有鸦天狗吗？
ritsu: 没有。只有灰尘和一根钢缆。
shio: 布丁给你留了一个哦～
ritsu: ……谢谢。
@hide
: 律在靠窗的扶手椅上坐下。墙上的挂钟指着十点二十八分。
@show shiori[smile] C
: 柊伸了个懒腰，从沙发上站了起来，把一条毛巾搭在肩上。
shiori: 女士们先生们～我去冲个澡哦。大浴室的热水，可不能浪费～
@show shio[surprise] L
shio: 诶～这么晚还洗澡？
shiori: 魔术师要时刻保持美丽嘛～谢幕之前，可不能蓬头垢面的。
shiori: 你们先睡吧～不用等我～
@hide
@se door
: 柊挥了挥手，走出了交谊厅。燕尾服的下摆一晃，消失在走廊的黑暗里。
> 十点半。
@wait 600
@caption 8月15日 23:00 交谊厅
@se bell
: 远处，塔上的钟敲响了。
@show hina[normal] C
hina: ……九、十、十一。
hina: 十一下。没有少。
ritsu: 还没睡？
hina: 钟声响的时候，我会醒。……千代说，七濑先生也没睡。
ritsu: 千代很敏锐。
hina[smile]: ……嗯。
@hide
: 雏抱着人偶，重新闭上了眼睛。仓田的鼾声像远处的雷。
@show shio[normal] C
: 汐裹着毛毯，坐到了律旁边的地毯上。台灯的光照着她半边脸。
shio: 律君。
ritsu: 嗯。
shio: 澪小姐最后问你的那句话……你还记得吗？
ritsu: 「你当年的推理，真的是对的吗？」
shio[sad]: 嗯。
shio: 律君，如果……我是说如果哦。如果九年前的推理错了，你会怎么办？
: 律没有马上回答。窗外的风，吹得玻璃轻轻作响。
ritsu: ……我不知道。
ritsu: 我记得那次推理的每一步。脚印、剪刀、发带。每一步都对得上。
ritsu: 可是那天晚上的风，是冷是热，我一点也想不起来。
shio[normal]: ……
shio[smile]: 律君，你知道吗？
shio: 「我不知道」，是我认识你一年以来，你说过的最诚实的一句话哦～
ritsu: ……你这是在夸我吗？
shio: 当然是在夸你啦，侦探先生～
: 她把头靠在扶手椅的边上，轻轻地哼起了一段旋律。那首歌——七鸦之歌。
: 律闭上了眼睛。歌声和风声混在一起，分不清哪一个更远。
@hide
@wait 600
@caption 8月16日 00:00 交谊厅
@se bell
: 塔上的钟敲了十二下。雏在梦里动了动嘴唇。
@wait 600
@caption 8月16日 00:30 交谊厅
@se door
: 门开了。柊走了进来，肩上搭着毛巾，头发湿漉漉地贴在额头上。
@show shiori[smile] C
shiori: 呼～水好烫，洗得太久了～
@show shio[surprise] L
shio: 柊小姐，你洗了两个小时？
shiori: 女人的澡就是这么长的嘛～泡着泡着就睡着了，差点变成煮鸡蛋～
: 她用毛巾胡乱擦着头发，钻进了沙发上的毛毯里。几片亮片从她的衣服上掉下来，落在地毯上。
@hide
> 零点半。两个小时。……泡澡泡到睡着，也不是没有可能。
@wait 400
@caption 8月16日 00:40 交谊厅
@show shio[normal] C
shio: 我去刷个牙～马上回来～
@hide
@se door
: 汐拿着牙刷杯出去了。大约十分钟后，她回来了。
@show shio[think] C
: 她在门口停了一下，看了看沙发上已经裹成一团的柊，歪了歪头。
ritsu: 怎么了？
shio[smile]: ……嗯？没什么～晚安，律君。
@hide
: 台灯熄灭了。交谊厅沉入黑暗。窗外，风停了。只有远处的海，一下一下地呼吸着。
@fade out
@wait 800
@goto ch3_dawn

# ch3_dawn
@bg lounge
@filter none
@fade in
@caption 8月16日 05:58 交谊厅
@bgm stop
: 律在扶手椅上醒来。脖子僵得像一根木头。
: 窗外的天是灰白色的，海上起了薄雾。地毯上，汐的毛毯掀开着，人不在。
> 汐……？
@se scream
: 中庭的方向，传来一声尖叫。
shio{汐的声音}[shock]: 律君——！！
@bgm horror
@se footsteps
@bg courtyard
@weather fog
@caption 8月16日 06:00 中庭
: 律冲进中庭。汐站在喷泉边，脸色惨白，一只手捂着嘴，另一只手指着天上。
@show shio[shock] C
shio: 律君……塔、塔上……
@hide
: 律抬起头。
: 晨雾里，鸦之塔的顶端浮在灰白色的天空中。瞭望台东侧的栏杆边——
: 有一只手。
: 一只苍白的人手，从铁栏杆的缝隙间伸出来，软软地垂在半空中，一动也不动。
@se heartbeat
@shake
> ……那是什么。
> 昨晚十点，那里明明什么都没有。我亲眼看过。我亲手——
ritsu: 不破先生！
@se footsteps
@bg tower_stairs
@caption 06:02 鸦之塔·一楼
@se knock
: 律用力拍打塔门。门内传来椅子被拖开的刺耳声响，门开了一条缝。
@show fuwa[surprise] C
fuwa: 小鬼？怎么了？
ritsu: 塔顶！瞭望台上有人！
fuwa[shock]: ……什么？
fuwa: 不可能。一整夜，没有一个人从这扇门进来！
ritsu: 上去看了再说！
@hide
@se footsteps
: 三个人冲上螺旋楼梯。二楼，藏书室的门把手上，铁丝还缠得好好的，一圈也没有松。三楼书斋，空无一人。
@bg clockroom
@caption 06:04 鸦之塔·四楼 机械室
: 机械室里，齿轮照旧咔嗒作响。通往瞭望台的门——门闩好好地插着，和昨晚不破推上去的时候一模一样。
@show fuwa[shock] C
fuwa: 闩着的……
fuwa: 昨晚是我亲手闩上的。你也看着的。
ritsu: ……开门。
@hide
@se door
: 不破拉开门闩，推开了门。
@bg balcony
@filter none
@weather fog
@caption 8月16日 06:05 鸦之塔·瞭望台
@bgm horror
@se wave
: 晨雾从海上漫过来，在瞭望台上缓缓流动。
: 东侧的栏杆边，一个穿灰色毛呢外套的男人，侧身蜷倒在地上。他的右臂从铁栏杆的缝隙间伸了出去，垂在塔外。
: 头发散乱，脸色青紫，脖子上一道深深的勒痕。
: 久我莲。
@show shio[shock] L
shio: 久、久我先生……
@show fuwa[shock] R
fuwa: ……混账。
fuwa: 我守了一夜！一整夜！一只苍蝇都没飞进来！
@hide
: 律走近一步，蹲了下来。
> 久我先生的身边，没有他的手杖。
> 那根拄着才能走路、片刻不离身的手杖，不见了。
: 律抬起头。那根钢缆从雾中伸过来，越过头顶，系在栏杆外的铁环上。在灰白的晨雾里，它轻轻地颤着。
@se footsteps
: 楼梯上传来纷乱的脚步声。其他人陆续赶了上来。
@show kiryu[shock] C
kiryu: ……喂喂，真的假的。
kiryu: 三只乌鸦飞上塔……
kiryu[dark]: 脚下没有回家的沙。
@show kurata[shock] R
kurata: 鸦、鸦天狗……真的是鸦天狗……！
@show hina[shock] L
hina: ……
: 雏紧紧地抱着千代，把脸埋进了人偶的头发里。
@hide
@show shizuka[normal] C
shizuka: 都让开。让我看看。
: 御堂医生披着白大褂，戴上手套，在尸体旁跪了下来。
@hide
@se phone
@wait 500
: 就在这时，塔下远远地，本馆的旧喇叭响了。判官的声音被晨风吹散，又一字一字地送上塔顶。
judge: 早安，诸位。
judge: 第三只乌鸦，已经飞上了塔。
judge: 审判，于上午十点开始。请诸位好好调查——它是怎样飞上去的。
@se phone
@bgm investigate
@hide
@show fuwa[angry] C
fuwa: ……小鬼。
fuwa: 你是见证人。你看见了，我闩的门，我守的塔。
fuwa: 可现在，第一个被怀疑的，就是我。
ritsu: ……我知道。
ritsu: 所以，我要查清楚。这只乌鸦，到底是怎么飞上来的。
@hide
> 判官说，它不需要楼梯，也不需要门。
> 那么——它用的是什么？
@explore ch3_inv
`
  + String.raw`

// ================= 搜查 =================

# ch3_i_body
@if has:ch3_body -> ch3_i_body2
@show shizuka[normal] C
shizuka: 七濑君。你来得正好，听着。
shizuka: 死因是勒颈窒息。颈部这道勒痕，很深，很新。
: 律俯下身。久我颈部的勒痕不是一道光滑的线——痕迹里排着细密的、「人」字形的纹路。
ritsu: 这个纹路……像是编织的绳子。
shizuka: 对。不是麻绳，也不是电线。是一种编得很细、很密的绳子。
> 人字形的纹路。……在哪里见过。
shizuka[think]: 死亡时间，大约是昨晚十一点到凌晨一点之间。尸僵和尸斑都对得上。
shizuka: 还有几样东西，你自己看。
: 律看向久我的脚。黑色的皮鞋里灌满了潮湿的细沙，西装裤的裤脚上也沾着一圈沙子，还没有干透。
> 沙子。塔顶上，哪来的沙子？
shizuka: 两边腋下，有绳子勒过的擦痕。像是有人用绳子兜着他的胳肢窝，把他吊起来过。
shizuka: 外套的肩膀和后背，沾着黑色的油污。闻一闻，是机油一类的东西。
shizuka: 左肩和左脸颊的擦伤，没有生活反应。是死后才撞出来的。
ritsu: 死后撞的？
shizuka: 像是从一人多高的地方摔下来，侧着身子砸在地上。
shizuka[dark]: 一个人勒死之后，又摔了一跤。七濑君，你觉得这像什么？
ritsu: ……像是从天上掉下来的。
@get ch3_body
@set ch3_saw_body
@return

# ch3_i_body2
: 久我侧身倒在东侧栏杆边，右臂从栏杆缝隙间垂在塔外。鞋里的湿沙，腋下的擦痕，外套上的黑油。
> 他死前，去过有沙子的地方。死后，又从高处落下来。
@return

# ch3_i_pocket
@if has:ch3_note -> ch3_i_pocket2
: 律小心地翻开久我外套的前襟。内侧口袋里，有一张折得很小的纸。
> 昨晚的晚饭桌上，他盯着看了很久、然后塞进内袋的那张纸。
@letter 我知道是谁陷害了你。\n我有船，今晚送你离开这座岛。\n23:00，北侧海滩，水线处。\n只身前来，什么都别带。
: 字迹歪歪扭扭，一笔一画都在发抖，像是用不顺手的那只手写的。
> 「我有船」。
> 对于一个愿意为离开这座岛付出任何代价的人来说，没有比这更好的诱饵了。
@get ch3_note
@return

# ch3_i_pocket2
> 23:00，北侧海滩，水线处。他按照字条，去了海边。
@return

# ch3_i_ring
@if has:ch3_cable -> ch3_i_ring2
: 律走到东侧栏杆边，扶着栏杆，小心地探出身子。
: 钢缆从头顶斜穿过瞭望台，系在栏杆外的铁环上。铁环前约一米的止挡铁箍上，有一道新鲜的、发亮的撞痕。
: 止挡附近的一段缆索上，缠着几缕灰色的纤维。律伸手摘下一缕，搓了搓——是毛呢。
> 和久我先生外套的料子一样。
: 止挡的正下方，正好是久我倒下的地方。
> 昨晚十点，这根缆索上什么都没有。止挡上的这道撞痕，我昨晚也没看见。
> 在那之后，有什么东西顺着缆索滑下来，狠狠地撞在了这里。
@get ch3_cable
@return

# ch3_i_ring2
: 止挡铁箍上的撞痕，缆索上的毛呢纤维。止挡的正下方，就是久我倒下的地方。
@return

# ch3_i_view
: 律望向西边。雾正在散去。缆索在灰白的天空里划出一条笔直的线，一直延伸到岛中央的山丘上。
: 山顶的松林里，隐约露出鸟居的一角朱红。
> 鸦天狗神社。这根线的起点。
@return

# ch3_q_shizuka
@show shizuka[normal] C
shizuka: 死亡推定是十一点到一点。再精确，我做不到。
shizuka[think]: 我昨晚吃了药，锁门睡了。没有人能证明。
shizuka: 你要怀疑我也无所谓。不过，我连他的手杖都提不动那么远。
@return

# ch3_i_bdoor
@if has:ch3_balcony_door -> ch3_i_bdoor2
: 律蹲下来，仔细看机械室这一侧的门闩。
: 铁门闩上积着一层薄薄的灰。只有闩头的地方，有不破刚才拉开时留下的一道指痕。
: 律推开门，看了看门的另一面。瞭望台那一侧光秃秃的，没有把手，没有锁孔，连一条能塞进细线的缝都没有。
> 这扇门，从昨晚十点到今早六点，一直闩着。从外面，无论如何都打不开。
> 所以凶手没有走这扇门。久我先生，也不是从这扇门走出去的。
@get ch3_balcony_door
@return

# ch3_i_bdoor2
> 门闩上的灰没有动过。这扇门，整夜都没有开过。
@return

# ch3_i_gears
: 齿轮缓慢地转动。报时的重锤静静地挂在井口上方。
> 第一晚，这座钟只敲了八下。昨晚，雏说它一下也没少。这一次，钟不是诡计的一部分。
@return

# ch3_i_hatch
: 地板上那块通往三楼书斋的活板门，锈钉依旧钉得死死的，钉头上的锈没有一点刮痕。
@return

# ch3_i_chair
: 那把橡木椅还歪在门边。椅腿在石地上划出两道新的白痕——是今早律拍门时，不破拖开椅子留下的。
: 除此以外，地面上没有别的拖痕。
> 昨晚，没有人从这扇门推进来过。
@return

# ch3_i_spiral
: 律在二楼停下，看着藏书室门把手上的铁丝。一圈一圈，缠得结结实实，铁丝的拧头上还有不破的指纹油印。
> 原封未动。渡廊那条路，也是死的。
@return

# ch3_q_fuwa
@if has:ch3_guard -> ch3_q_fuwa2
@show fuwa[angry] C
fuwa: 我知道你要问什么。
fuwa: 十点到六点，我坐在这把椅子上。没有人从这扇门进来，也没有人出去。
ritsu: 一次都没有离开过？
fuwa: 没有。
: 不破咬着牙签，沉默了片刻。
fuwa[normal]: ……三点左右，我打了个盹。十分钟上下。
fuwa: 但椅子顶着门。谁推门，椅子一动，我就会醒。我当了十五年刑警，这点本事还有。
ritsu: 夜里，有没有听到什么声音？
fuwa[think]: ……零点前后，楼上「咣」地响了一声。闷闷的。
fuwa: 我以为是钟。快十二点了，机械室的齿轮总要折腾一阵。
fuwa: 我上去看了看？……没有。我没有离开这扇门。
fuwa[angry]: 现在想想，那一声，大概就是……
: 不破把牙签狠狠地咬断了。
@get ch3_guard
@return

# ch3_q_fuwa2
@show fuwa[normal] C
fuwa: 零点前后，楼上「咣」地一声。我坐在这儿，什么都没做。
fuwa[sad]: ……守了一整夜，守住了一具尸体。真是笑话。
@return

# ch3_i_ccable
: 从中庭仰望，钢缆从山丘那边斜拉过来，越过中庭的上空，一直连到塔顶。
: 缆索上空空荡荡的，什么也没有挂着。
> 今早汐看见的那只手，就垂在瞭望台的东侧。从中庭，正好能看见那一角。
@return

# ch3_i_ctower
: 塔顶的东侧栏杆边，那只手已经看不见了——御堂医生让人把尸体挪了个姿势，盖上了毛毯。
: 塔身光滑，四面没有任何梯子或绳索的痕迹。
@return

# ch3_q_kiryu
@if ch3_q_kiryu_done -> ch3_q_kiryu2
@show kiryu[smile] C
: 桐生靠在喷泉边，抽着今天的第三根烟。
kiryu: 名侦探。来问我的不在场证明？没有。我一个人在房间里写稿。
kiryu: 不过，我倒是有一条你可能用得上的情报。
ritsu: 说说看。
kiryu: 零点前几分钟，我在房间窗口抽烟。天上传来一阵「嗡——」的声音。
kiryu: 很长，很低，像是风刮过电线。然后，远远地，「咣」的一声。
ritsu: 你没有出去看？
kiryu[normal]: 出去看？在一个每天都死人的岛上，半夜听见怪声就跑出去？
kiryu: 我是记者，不是傻子。
kiryu[smile]: 怎么样，这条情报值钱吧？还是说——你现在开始怀疑我了？
kiryu: 最懂飞鸦祭的人，半夜独自醒着，还听见了怪声。换我是你，我也会怀疑。
ritsu: 你说话的方式，像是很想被怀疑。
kiryu: 被怀疑的人才有素材写嘛。
@set ch3_q_kiryu_done
@note kiryu 零点前几分钟在房间窗口抽烟，听见天上一阵「嗡——」的低鸣，然后远远地「咣」一声。没有不在场证明。
@return

# ch3_q_kiryu2
@show kiryu[smile] C
kiryu: 「嗡——」然后「咣」。我就听见这么多。剩下的，交给名侦探吧。
@return

# ch3_i_footprints
@if has:ch3_footprints -> ch3_i_footprints2
@bgm mystery
: 律从石阶上走下来，在最后一级台阶上停住了。
: 沙滩上，一行脚印从石阶脚下出发，笔直地朝大海延伸过去。
: 皮鞋的鞋印。每一步的右侧，都有一个小小的圆孔——手杖戳出来的。
> 久我先生的脚印。拄着手杖，一步一步，走向大海。
: 律沿着脚印旁边走，不去踩到它们。脚印一直延伸到沙滩中间，延伸到潮水刚刚退去的湿沙边缘——
: 然后，消失了。
: 再往外，沙面被潮水抹得平平整整，像一张刚熨过的白布。
: 律回过头。整片沙滩上，只有这一行脚印。只有去的，没有回的。
: 沙滩两头是黑色的峭壁，除了身后那道石阶，没有别的路。
> 三只乌鸦飞上塔，脚下没有回家的沙。
> ……童谣说的，就是这个。
@get ch3_footprints
@return

# ch3_i_footprints2
> 一行只有去程的脚印，消失在涨潮冲刷过的湿沙边缘。
@return

# ch3_i_waterline
: 湿沙的边缘，散落着被冲上来的海藻和贝壳碎片，排成一条弯弯曲曲的线——今早涨潮时，海水到过的最高位置。
: 此刻，潮水又开始退了，海浪在十几米外的地方翻着白沫。
> 今早五点二十分，海水涨到这里。那么，昨晚十一点呢？
@return

# ch3_i_cliff
: 塔下的悬崖，三十多米高，崖壁上长满了湿滑的青苔和白色的鸟粪。
: 律仔细看了一遍。青苔完好，没有一点刮擦的痕迹，没有绳子磨过的白印。
> 如果有人把一个成年男人从这面悬崖上吊上去，崖壁不可能这么干净。
@return

# ch3_i_rocks
: 沙滩一角的礁石，被海水泡得发黑，长满了藤壶。礁石后面没有洞穴，也没有藏人的地方。
@return

# ch3_i_boat
@if has:ch3_boat -> ch3_i_boat2
: 律走到那条旧划艇旁边，蹲了下来。
: 昨天下午，仓田先生说过：船头朝里，拴在左边第二根桩子上。
: 可现在，船头朝着船屋的门口，缆绳拴在第一根桩子上。
> 有人动过这条船。
: 船底积着一层海水，水里沉着湿漉漉的细沙。桨架摸上去是湿的，两支桨的握柄上还挂着水珠。
> 昨天下午，船底是干的。这条船，昨晚出过海。
: 律把手伸进船舱，沿着座板摸过去。座板和船帮之间的缝隙里，有个小东西闪了一下。
: 他用指甲把它抠了出来。是一片小小的、圆圆的银色亮片。
@get ch3_boat
@return

# ch3_i_boat2
> 位置变了，船底有湿沙，桨是湿的。座板缝里还有一片银色亮片。这条船，昨晚出过海。
@return

# ch3_i_tide
@if has:ch3_tide -> ch3_i_tide2
: 潮汐表。8月15日，低潮 23:10。8月16日，高潮 05:20。
> 仓田先生说，低潮的时候，北侧海滩的水线会退出去三十多米。
> 字条上约的时间是 23:00。那正是海水退到最远的时候。
@get ch3_tide
@return

# ch3_i_tide2
> 低潮 23:10，高潮 05:20。
@return

# ch3_i_ropes
: 墙上挂着的那几捆新麻绳里，有一捆的绳头是新切开的，切口还很整齐，麻丝一点也没有起毛。
> 有人从这里割走了一截。昨天下午，每一捆的绳头都是用胶布缠好的。
@return

# ch3_i_kerosene
: 墙角的煤油罐，还是满满一罐。
> 和这件事无关……吧。
@return

# ch3_i_storehouse
@if has:ch3_knot -> ch3_i_storehouse2
: 仓库的门虚掩着。律推开门。
: 飞鸦车靠墙放着，和昨天下午一样。可是——稻草乌鸦被摘了下来，丢在角落里。
: 律蹲下来，转了转滑轮。滑轮顺滑地转了好几圈，一点声音也没有。
> 昨天下午，这对滑轮还积着干掉的油泥，一转就吱吱响。
: 轴上抹着一层新鲜的黑色油脂。律用指尖蘸了一点，搓开——黑亮、黏稠，带着一股机油味。
> 和久我先生外套上的油污一样。
@get ch3_trolley
: 吊钩上，挂着一截新麻绳。一头在钩上打了个死结，牢牢系着；另一头垂下来，大约一米长。
: 律把垂下来的那一头托在手心里。
: 绳子上留着一串弯弯曲曲的折痕，像一条扭动的小蛇。
> ……这个形状。
> 昨天下午在交谊厅，我亲手打过，亲手扯开过。快速解脱结散开之后，绳子上留下的就是这样的折痕。
: 绳子的表面还蹭着一点白色的东西。律用指甲刮了刮——是蜡。
@get ch3_knot
: 仓库门外的屋檐下，扔着一个烟头。
> 桐生先生的牌子。……昨天下午，他给我讲飞鸦祭的时候，亲手把它摁灭在这里的。
> 屋檐下淋不到雨，所以它还是干的。不能当成昨晚的证据。
@return

# ch3_i_storehouse2
> 新上的油、吊钩上的麻绳、绳上快速解脱结的折痕和白蜡。昨晚，有人用过这辆飞鸦车。
@return

# ch3_i_hall
@if has:ch3_cane -> ch3_i_hall2
: 律绕到拜殿的背后。屋檐下的木回廊积着厚厚的灰，灰上有一片被蹭乱的痕迹。
: 回廊下的草丛里，有个黑色的东西。
: 律拨开湿漉漉的草叶——一根黑檀木手杖。银色的杖头，刻着一个「久」字。
> 久我先生的手杖。
: 杖尖上，嵌着几粒细细的白沙。
> 海滩的沙子。他拄着这根手杖走到了水线——然后，这根手杖出现在了岛中央的山顶上。
@get ch3_cane
@return

# ch3_i_hall2
> 久我先生的手杖，在神社拜殿的背后。他来过这里。
@return

# ch3_i_platform
@if has:ch3_shrine_marks -> ch3_i_platform2
: 缆索平台前的碎石地上，有一道宽宽的拖痕。
: 拖痕从拜殿背后的方向过来，一路压乱了碎石，一直拖到平台下面那台手摇绞盘的旁边。
: 绞盘的铁钩上，挂着几根灰色的纤维。
> 像是有人拖着一个很重的东西，从拜殿后面拖到了这里。
@get ch3_shrine_marks
@return

# ch3_i_platform2
> 从拜殿背后，一路拖到绞盘旁边的痕迹。
@return

# ch3_i_sequin
@if has:ch3_sequin -> ch3_i_sequin2
: 平台底下的碎石之间，有什么东西反射着晨光，一闪一闪。
: 律弯腰把它捡起来。一片小小的、圆圆的银色亮片。
: 他从口袋里掏出在划艇里找到的那一片，放在一起对比。大小、形状、颜色，一模一样。
@get ch3_sequin
@return

# ch3_i_sequin2
> 划艇里的亮片，和平台下的亮片，一模一样。
@return

# ch3_i_cove
: 律顺着石阶往下走了一段。山脚的神社湾风平浪静，海水泛着暗绿的光。
: 湾边的礁石上，有一道新鲜的白色刮痕，像是有什么东西的底部在上面蹭过。
: 石阶是整块的岩石，被海水打湿了，留不下任何脚印。
> 从海上来的船，可以靠在这里。然后，沿着这道石阶走上神社——一个脚印都不会留下。
@return

# ch3_q_usami
@if ch3_q_usami_done -> ch3_q_usami2
@show usami[think] C
: 宇佐见站在缆索平台边，正用制图笔在本子上飞快地计算着什么。
usami: 七濑先生。……您是不是在想，我为什么一大早跑到这里来。
ritsu: 正在想。
usami: 我想确认一件事：这根缆索，能不能把一个人送到塔顶。
usami: 结论是——能。全长三百米，高差二十余米，挂上一个成年男人，大约半分钟就能滑到。
usami: 撞上止挡的时候，冲击力相当大。止挡上的撞痕，完全符合。
ritsu: 你算得很快。
usami[sad]: 所以我知道，我会被怀疑。懂结构的人，最先被怀疑。恭介先生那件事的时候也是这样。
usami[think]: 不过，七濑先生，有一点我想不通。
usami: 滑车撞上止挡，就会停住。挂在吊钩上的东西，应该一直吊在缆索上才对。
usami: 可今早，缆索上空空荡荡，遗体却躺在瞭望台的地面上。
usami: 它是怎么从吊钩上「掉」下来的？……这不是结构力学能回答的问题。
@set ch3_q_usami_done
@return

# ch3_q_usami2
@show usami[normal] C
usami: 滑车撞上止挡就会停住。遗体是怎么脱钩的……我还是想不通。
@return

# ch3_i_propbox
@if has:ch3_cord -> ch3_i_propbox2
: 交谊厅角落，柊的道具箱敞着盖子。扑克牌、硬币、彩色丝巾、白棉绳、小蜡块……
: 律在里面翻了一遍。
> 没有。那根红色的丝编绳，不见了。
: 昨天下午，柊把它卷好，亲手放回了这只箱子。
: 律低头看了看自己的手腕。昨天被那根红绳绑过的地方，压痕早已消退。
> 可我记得那道压痕。细密的「人」字形纹路，连每一股丝线的走向都看得清清楚楚。
> 和久我先生脖子上的勒痕，一模一样。
@get ch3_cord
@return

# ch3_i_propbox2
> 红色的丝编绳不见了。人字形的编织纹路，和勒痕一模一样。
@return

# ch3_i_lwindow
: 交谊厅的窗户朝着中庭。今早的雾已经散了，能看见塔顶的一角。
> 昨晚这扇窗外，什么也看不见。那条缆索在夜里，是一根看不见的线。
@return

# ch3_q_shio
@if has:ch3_bath -> ch3_q_shio2
@show shio[normal] C
shio: 律君……
shio[sad]: 早上我睡不着，想去中庭透透气。一抬头，就看见了……
ritsu: 嗯。你没事吧？
shio[smile]: ……没事啦。汐酱可是侦探助手哦。
shio[think]: 那个，律君。有件事，我从昨晚就一直有点在意。
shio: 我十二点四十分去大浴室刷牙的时候啊……
shio: 浴室的地面是干的。墙上的瓷砖也是干的。挂着的浴巾，也叠得整整齐齐、干干的。
ritsu: ……干的？
shio: 嗯。完全不像是有人刚洗过两个小时澡的样子。
shio: 可是柊小姐十分钟前才回来，说「水好烫，洗得太久了」。
shio[sad]: 我当时以为，是我想多了……
ritsu: 你没有想多。
@get ch3_bath
@return

# ch3_q_shio2
@show shio[normal] C
shio: 浴室是干的。地面、瓷砖、浴巾，全都是。
shio[sad]: ……律君，我是不是不该说出来？
ritsu: 说出来是对的。
@return

# ch3_q_shiori
@show shiori[smile] C
shiori: 侦探君，早安～……虽然一点也不「安」呢。
shiori: 我昨晚一直在交谊厅睡觉哦。洗完澡回来，倒头就睡。
ritsu: 你的红色丝编绳，不在道具箱里。
shiori[surprise]: 诶？……大概是落在房间里了吧～我回头找找。
shiori[smile]: 侦探君该不会在怀疑我吧？我昨晚十点半到零点半，可是在洗澡哦～
: 她笑着，用指尖绕着还有点潮湿的发梢。燕尾服上，有一处亮片脱落后留下的小小线头。
@return

# ch3_q_hina
@show hina[normal] C
hina: 七濑先生。昨晚的钟，每一下都敲了。
hina: 十一点，十一下。十二点，十二下。三点，三下。五点，五下。我都数了。
hina[sad]: 鸦天狗是不需要钟的。……姐姐说过，它来的时候，没有声音。
ritsu: 柊小姐回来的时候，你醒着吗？
hina: 醒着。零点半。头发是湿的。毛巾也是湿的。
hina: ……可是，她身上没有香皂的味道。
ritsu: ……
hina: 是海的味道。
@set ch3_q_hina_done
@return

# ch3_i_pantry
: 食品柜门上那张「恐吓信」下面，又多了一行字：
@letter 又少了！三个饭团！\n咱昨晚整夜都在交谊厅睡觉！\n不是咱！——仓田
@return

# ch3_q_kurata
@show kurata[sad] C
kurata: 小哥……久我先生他，真的是鸦天狗……
ritsu: 仓田先生，船屋的划艇，昨天下午是什么样子？
kurata[think]: 划艇？船头朝里，拴在左边第二根桩子上啊。咱亲眼看的。
ritsu: 今早，它船头朝外，拴在第一根桩子上。船底有湿沙。
kurata[shock]: 什、什么！？那是有人半夜划出去过！？
kurata: 可、可是咱一整夜都在交谊厅啊！小哥你也看见的！
ritsu: 我知道。我只是确认一下。
kurata[sad]: ……还有啊，厨房又少了三个饭团。这个时候说这个，好像不太对，可是……
@return

# ch3_i_wardrobe
: 衣柜里，久我的皮箱已经收拾好了。衬衫、领带、文件夹、一小瓶止痛药——叠得整整齐齐。
: 可是皮箱就这样留在了衣柜里。
> 「只身前来，什么都别带。」……他照做了。连止痛药都没带。
@return

# ch3_i_desk
: 书桌上，压着一封被揉皱又展平的信。判官的黑框信封。
@letter 你出卖了你的委托人——不止一次。
: 信纸的背面，用钢笔写着几行潦草的字：「三年前　月岛　水箱　——不可能有人知道」
: 最后几个字被墨水狠狠地涂掉了。
> 三年前。月岛。水箱。……我在哪里听到过这个名字。
@return

# ch3_i_bed
: 床铺整整齐齐，被子没有掀开过。枕头上没有压痕。
> 他昨晚，根本就没有睡。
@return
`
  + String.raw`

// ================= 审判（上） =================

# ch3_trial
@bg judgment
@weather none
@filter none
@trial on
@bgm trial
@caption 8月16日 10:00 审判厅
: 石造的圆厅里，十四座证言台围成一圈。其中五座，已经空了。
: 玄藏、恭介、久我——死去的人。澪、琴音——鸦笼里的人。
@se gavel
judge: 诸位，第三次审判，开始。
judge: 规则，想必不用我再重复了。
judge: 指认正确，凶手入笼。指认错误，凶手独自乘船离去，其余所有人，永远留在这座岛上。
judge: 那么——请告诉我。第三只乌鸦，是怎样飞上塔的？
@se phone
> 七个小时前，我站在那个瞭望台上，亲眼确认过那里什么都没有。
> 那扇门是我看着闩上的。那座塔是我看着封住的。
> 所以，这一次的谜，我必须亲手解开。
shizuka: 先说结论。死者久我莲，死因是勒颈窒息。死亡推定时间，昨晚十一点到凌晨一点。
shizuka: 遗体在瞭望台东侧栏杆边。勒痕新鲜，带有细密的编织纹路。
kiryu: 那么问题就很简单了。昨晚十点到今早六点，那座塔是封死的。
kiryu: 唯一待在塔里的人，就是守门的那一位。
fuwa: ……
kurata: 不、不破先生？可、可是不破先生是守塔的人啊……
kiryu: 守塔的人，最方便上塔。这不是常识吗？
kiryu: 何况他自己也承认了，凌晨三点「打了个盹」。多方便的借口。
fuwa: 你说什么？
usami: 桐生先生的说法，在逻辑上是成立的。门闩在机械室内侧，只有塔里的人才能闩上。
usami: 不破先生打开门闩、杀人、再闩上——这样一切都说得通。
fuwa: 我为什么要杀久我？
kiryu: 九年前的案子里，你们都是一伙的。谁知道你们之间有什么账没算清。
shiori: 哎呀呀～守卫变成了凶手，这可是推理小说里的经典桥段呢～
> 所有人都在看着不破先生。
> 可是，久我先生的遗体上，有一样东西，塔顶上不可能有。
@game ch3_g1
@shout ritsu 不对！
ritsu: 御堂医生说，久我是「在塔上」被勒死的。可是，遗体上留着一样塔顶没有的东西。
ritsu: 久我先生的皮鞋里，灌满了潮湿的细沙。裤脚上，也沾着一圈沙子。
shizuka: ……我确实看到了。还没干透的沙子。
ritsu: 鸦之塔是石头造的。从一楼到瞭望台，没有一粒沙子。
ritsu: 这些沙子，是他死前不久，在某个有沙子、而且潮湿的地方沾上的。
kurata: 有沙子的地方……那、那就是海滩嘛！
ritsu: 对。北侧海滩。就在鸦之塔的悬崖下面。
ritsu: 我去看过了。沙滩上，有一行脚印。皮鞋的鞋印，每一步旁边都有一个小圆孔。
usami: 手杖……那是久我先生的脚印。
ritsu: 他昨晚，自己走下了石阶，走到了海边。
kiryu: 那又怎样？不破在海边勒死他，再把他扛上塔，不就行了。
fuwa: 你这家伙……！
shizuka: 扛着一具尸体上塔，也得从那扇门进。不破先生守的就是那扇门。逻辑上是个圈。
kiryu: ……哼。
ritsu: 问题不在这里。问题在于——那行脚印，只有去的，没有回的。
@se heartbeat
hina: ……没有回来的脚印。
hina: 「三只乌鸦飞上塔，脚下没有回家的沙」。
kurata: 童、童谣里唱的就是这个！
kurata: 久我先生走到海边，然后，就被鸦天狗抓走了！抓到塔顶上去了！
hina: ……姐姐说过。鸦天狗来的时候，没有声音。
shio: 雏酱……
> 鸦天狗不会留下脚印。凶手也没有留下脚印。
> 可是，人不会飞。那么，一定还有别的「路」。
> 脚印消失的地方、消失的时间——把它们和潮水放在一起想。
@game ch3_g2
@bgm debate
ritsu: 整理一下。
ritsu: 今早我看到的脚印，一直延伸到涨潮冲刷过的湿沙边缘，在那里消失。再往外，沙子被潮水抹平了。
ritsu: 船屋的潮汐表上写着：昨晚低潮 23:10，今早高潮 05:20。
ritsu: 也就是说，昨晚十一点，海水退到了比今早远三十多米的地方。
ritsu: 久我先生的脚印，本来一直通到昨晚的水线。只不过后半段，被今早涨上来的潮水抹掉了。
kurata: 对对，退潮的时候，水线能退出去好远哩！咱年轻时候常去捡贝壳！
ritsu: 而久我先生外套的内袋里，有一张字条。
@letter 我知道是谁陷害了你。\n我有船，今晚送你离开这座岛。\n23:00，北侧海滩，水线处。\n只身前来，什么都别带。
@se gavel
usami: 23:00……水线处……
shizuka: 正好是潮水退到最远的时候。
ritsu: 有人用这张字条，把久我先生约到了海边。
ritsu: 他走到水线，上了一条船。所以，他没有回程的脚印。
ritsu: 凶手是从海上来的，在潮水会淹没的湿沙上等着他。所以，凶手也没有留下脚印。
ritsu: 几个小时后，涨潮了。水线附近的一切痕迹，都被冲得干干净净。
kiryu: ……船。
kiryu: 这座岛上，有船吗？
ritsu: 有一条。船屋的旧划艇。
ritsu: 昨天下午，仓田先生告诉过我它的样子：船头朝里，拴在左边第二根桩子上。
kurata: 没错！咱亲眼看的！
ritsu: 今早，它船头朝外，拴在第一根桩子上。船底积着海水和湿沙，桨架还是湿的。
kurata: 那、那条船昨晚出过海……！
fuwa: 有人划船去海滩接走了久我。这一点我认。
fuwa: 可船是在海上的。久我是在塔顶上被发现的。
fuwa: 从海上到塔顶，中间隔着三十米的悬崖，还有我守着的那扇门。
> 船，把久我先生带去了哪里？
> 答案，在久我先生「留下」的东西里。
@game ch3_g3
@shout ritsu 不对！
ritsu: 仓田先生，你说船能靠岸的地方，只有码头。
kurata: 是、是啊……这岛四面都是峭壁……
ritsu: 那么，久我先生的手杖，是怎么跑到那里去的？
ritsu: 他那根离开了就走不了路的黑檀手杖，掉在了鸦天狗神社，拜殿背后的草丛里。
@se shout
kurata: 神、神社！？
shizuka: 他那个腰，不拄手杖，连十米都走不了。
ritsu: 杖尖上还嵌着海滩的细沙。他拄着这根手杖走到了水线，然后，手杖出现在了岛中央的山顶上。
usami: 可是，从海滩到神社，要穿过整个宅邸的后山……
ritsu: 不用走陆路。
ritsu: 桐生先生，昨天下午，你在神社告诉过我一件事。
kiryu: ……
kiryu: 「神社湾」。
kiryu: 山脚下有一片小海湾。以前祭典的时候，渔民就是划着船，从那里上岸，爬石阶上神社的。
kiryu: 「能靠船的地方，除了码头，也就那儿了」。……是我说的。
ritsu: 凶手划船从北侧海滩接走久我先生，绕到神社湾，带他走上石阶。石阶是整块的岩石，留不下脚印。
ritsu: 然后，在拜殿背后，勒死了他。
ritsu: 缆索平台前的碎石上，有一道拖痕。从拜殿背后，一直拖到平台下的绞盘旁边。
@bgm tension
fuwa: 慢着。
fuwa: 就算他死在神社。神社在岛中央，塔在北边的悬崖上。中间隔着三百米。
fuwa: 尸体是怎么从神社到塔顶的？我守的门，一整夜没开过！
hina: ……飞过去的。
hina: 鸦天狗，从神社飞到塔上。……就像飞鸦祭一样。
kurata: 雏、雏小姐，别说这么吓人的……
ritsu: 不。雏说得对。
ritsu: 遗体，是「飞」过去的。
@se heartbeat
> 从神社到塔顶，不经过楼梯，不经过任何一扇门。
> 判官说，「它不需要楼梯，也不需要门」。
> 那条路，从昨天下午开始，就一直挂在我们所有人的头顶上。
@game ch3_g4
@shout ritsu 就是这个！
@bgm truth
ritsu: 缆索。
ritsu: 飞鸦祭的缆索。从神社的平台出发，一直拉到鸦之塔的瞭望台。
kurata: 缆、缆索！？可那是给稻草乌鸦用的啊！
kiryu: ……哈。
kiryu: 「乌鸦从神社飞下去，落在塔顶，就是宣判」。
kiryu: 原来如此。今年的飞鸦祭，挂上去的不是稻草乌鸦。
fuwa: 证据。光凭嘴说，谁都会。
> 证明昨晚确实有「东西」顺着缆索滑下去的证据——就在塔顶，那根缆索的终点。
@game ch3_g5
@shout ritsu 就是这个！
ritsu: 缆索的终点，是瞭望台东侧栏杆外的铁环。铁环前一米，有一圈止挡。
ritsu: 止挡上，有一道新鲜的撞痕。昨晚十点我和不破先生上去的时候，还没有。
ritsu: 止挡附近的钢缆上，挂着几缕灰色的毛呢纤维。和久我先生外套的料子一样。
ritsu: 而止挡的正下方——正好就是久我先生倒下的地方。
usami: 我证实。缆索从瞭望台的头顶斜穿过去，止挡悬在瞭望台地面的上空。
usami: 今早我在神社算过了。三百米，高差二十余米。挂上一个成年男人，半分钟就能滑到塔顶。
fuwa: ……零点前后，楼上「咣」的一声。
fuwa: 我以为是钟。……原来是那个。
kiryu: 我在房间窗口抽烟的时候，天上「嗡——」了一阵，然后远远地「咣」的一声。
kiryu: 滑车在钢缆上跑的声音。……原来我听到的，是一场葬礼。
ritsu: 遗体是用神社仓库里的「飞鸦车」送下去的。
ritsu: 飞鸦车的滑轮上，新抹了黑色的油脂。和久我先生外套肩背上的油污一样。
ritsu: 久我先生的腋下有绳子勒过的擦痕——他被人用绳子兜住腋下，挂在了滑车的吊钩上。
shizuka: 左肩和脸颊的死后擦伤，也说得通了。
shizuka: 从一人多高的地方，侧着身子摔在瞭望台上。
shio: 好、好厉害……就像真的乌鸦一样，飞上了塔……
@bgm tension
fuwa: 好。尸体是从缆索上过来的。我守的门，没有被骗过。
fuwa: 那么，是谁干的？
fuwa: 最懂飞鸦祭的人，是谁？给我们讲解滑车、讲解回收绳、讲解神社湾的人，是谁？
kiryu: ……又是我？
kurata: 桐、桐生先生，昨晚零点你还醒着……
kiryu: 醒着就是凶手？那这座岛上的失眠症患者都该进笼子。
kiryu: 再说，如果是我干的，我会大张旗鼓地把手法讲给名侦探听吗？
kiryu: 要怀疑，不如怀疑那位一大早就跑去神社计算张力的建筑师先生。
usami: ……我只是想确认它在物理上是否可行。
kiryu: 确认得真快啊。连「半分钟」都算出来了。
usami: 那是因为——
shiori: 哎呀呀，女士们先生们，吵架可不好看哦～
shiori: 再说了，就算真有人把尸体挂上了缆索……
shiori: 它也不会自己「掉」到瞭望台上来吧？
> 柊小姐说到了要害。宇佐见先生今早，也想不通这一点。
> 滑车撞上止挡就停了。那么，挂在吊钩上的遗体，为什么会落在瞭望台上？
@goto ch3_trial2
`
  + String.raw`

// ================= 审判（下） =================

# ch3_trial2
@bgm debate
usami: 柊小姐说得对。这正是我今早想不通的地方。
usami: 滑车是靠滑轮卡在缆索上的。撞上止挡，它就停住，不会再往前。
usami: 挂在吊钩上的东西，会一直吊在那里，晃来晃去，直到有人去把它取下来。
kiryu: 可今早缆索上什么都没有。滑车也好端端地在神社的仓库里。
fuwa: 难不成，有人站在瞭望台上，把尸体从钩子上摘下来，再把滑车推回去？
fuwa: 那就又绕回来了。瞭望台的门，是闩着的。
> 没有人摘。遗体是自己「落」下来的。
> 让它在正确的时刻落下的东西，就挂在飞鸦车的吊钩上。
@game ch3_g6
@shout ritsu 不对！
@bgm truth
ritsu: 宇佐见先生。遗体不会一直吊在缆索上。因为吊着它的那个结，是会自己散开的。
usami: 自己……散开？
ritsu: 飞鸦车的吊钩上，残留着一截新麻绳。一头牢牢系在钩上，另一头留着一串弯弯曲曲的折痕。
ritsu: 那是「快速解脱结」散开之后的形状。
ritsu: 受力的时候稳稳当当，挂多重的东西都不会松。可只要一扯尾巴，整个结就会散开。
kurata: 快、快速解脱结……那不是……
ritsu: 凶手用麻绳的一头系住吊钩，另一头兜过久我先生的腋下，用快速解脱结扣成一个圈。
ritsu: 然后，把结的尾巴，系在了回收绳上。
kiryu: 回收绳……
kiryu: 和缆索一样长，每十米一条红布。滑车下去的时候，跟着放出去……
ritsu: 凶手把回收绳的另一头拴在平台的桩子上，留出的长度，正好够滑车滑到塔顶的止挡。
ritsu: 有红布做记号，量出这个长度并不难。
ritsu: 滑车载着遗体滑下去，回收绳一圈一圈地放出去。
ritsu: 就在滑车撞上止挡的那一瞬间，回收绳也放到了头，「啪」地绷直——
@se crash
ritsu: 尾巴被扯紧，快速解脱结整个散开。麻绳的圈松开，遗体从一人多高的地方落下来，摔在瞭望台上。
ritsu: 他的右臂，正好从栏杆的缝隙间滑了出去。今早汐在中庭看见的，就是那只手。
@se heartbeat
shio: ……
ritsu: 结散开以后，麻绳还系在吊钩上，尾巴还连着回收绳。
ritsu: 凶手在神社这边，拉回回收绳，空的滑车就沿着缆索被拉了回来。放回仓库，一切恢复原样。
usami: ……所以缆索上什么都没留下。
usami: 止挡的撞痕、回收绳的长度、结的强度……全都被计算好了。
usami: 这不是结构力学。这是……
ritsu: 舞台机关。
ritsu: 昨晚在瞭望台上，我对不破先生说：从神社爬三百米的钢缆，那得是马戏团。
fuwa: 我说，这座岛上没有马戏团。
ritsu: 是的。这座岛上没有马戏团。
ritsu: 但是，有一位演员。
@se gavel
> 一个人从绞盘吊起一个成年男人。打一个算好时机才松开的结。在绳子上擦蜡，让它滑得像丝绸。
> 这些事，昨天下午，有人一边说「女士们先生们」，一边在交谊厅里亲手演示过。
@game ch3_g7
@bgm tension
ritsu: 柊诗织小姐。
ritsu: 能打出那个结的人，是你。
shiori: ……
shiori: 哎呀。
shiori: 哎呀呀呀～侦探君，你这是在开什么玩笑嘛～
ritsu: 吊钩上的麻绳，蹭着白色的蜡。你昨天在交谊厅，用一块蜡擦过绳子，说那是「魔术师的秘密武器」。
ritsu: 你还说过，你十几岁就在后台吊威亚，「一个人吊起一个大男人，小意思」。
shiori: 是我说的呀。那又怎么样？
shiori: 那个结，我当着大家的面教给你了。仓田先生、汐酱也都在旁边看着。
kurata: 咱、咱只看了个热闹……
shiori: 蜡块就在道具箱里，谁都能拿。会吊威亚的人，这世上多得是。
shiori: 侦探君，你要指控一位女士，可得拿出更像样的东西来哦～
> 她的笑容，一点也没有乱。
> 可是她昨晚的「不在场证明」里，有一个汐亲眼看到的破绽。
@game ch3_g8
@shout ritsu 不对！
ritsu: 柊小姐。你说，你十点半到零点半，一直在大浴室洗澡。
ritsu: 可是，零点四十分，汐去大浴室刷牙的时候——
shio: ……浴室的地面，是干的。
shio: 墙上的瓷砖，也是干的。挂着的浴巾，叠得整整齐齐，也是干的。
shio: 完全不像是有人刚刚洗了两个小时澡的样子……
@se shout
shiori: ……
ritsu: 这座宅邸的客房里，只有洗脸台。想洗澡，只能去一楼的大浴室。
ritsu: 你没有在那里洗澡。那两个小时，你在别的地方。
hina: ……柊小姐回来的时候，身上没有香皂的味道。
hina: 是海的味道。
shiori: ……
shiori: 好啦好啦，我投降～我没洗澡，行了吧？
shiori: 我睡不着，出去吹了吹海风。头发是被海风吹湿的。说了谎，是我不对～
shiori: 可是啊，侦探君。散步可不犯法哦。
shiori: 你说我勒死了久我先生。那么，勒死他的绳子又在哪里呢？
shiori: 拿不出凶器，就只是一个精彩的故事而已。
> 凶器。那道带着人字形纹路的勒痕。
> 我见过一模一样的纹路。不是在别人的脖子上——是在我自己的手腕上。
@game ch3_g9
@shout ritsu 就是这个！
ritsu: 你的红色丝编绳。
ritsu: 昨天下午你用它绑我的手腕，绑了三圈。解开之后，我的手腕上留下一道压痕。
ritsu: 压痕里，排着细密的「人」字形纹路。丝绳的编织纹，连每一股丝线的走向都清清楚楚。
ritsu: 久我先生颈部的勒痕上，是一模一样的纹路。
shizuka: ……编得很细、很密的绳子。我验尸时说过。
ritsu: 那根红绳，你亲手放回了交谊厅的道具箱。今早，它不见了。
shiori: ……
shiori: 那又怎样？
shiori: 道具箱就放在交谊厅的角落里，盖子都不锁。谁都能偷走我的红绳！
shiori: 结我教过别人，蜡块谁都能拿，红绳谁都能偷！
shiori: 侦探君，你能证明的，只是凶手用了我的东西而已！
shiori: 你能证明，昨晚坐在那条船上、站在神社那个平台上的人，是我吗！？
> 坐在那条船上、站在那个平台上的人。
> 她自己说过——「跟着亮片走就行了」。
@game ch3_g10
@shout ritsu 就是这个！
@bgm truth
ritsu: 银色的亮片。
ritsu: 一片，夹在船屋那条划艇的座板缝里。一片，掉在神社缆索平台下的碎石间。
ritsu: 两片，一模一样。
@update ch3_sequin 神社缆索平台下的碎石间捡到的银色亮片，和划艇座板缝里那一片一模一样——与柊的燕尾服上缀着的亮片完全相同。她的燕尾服上，有一处亮片脱落后留下的线头。
ritsu: 柊小姐，你昨天在交谊厅说过。你的燕尾服，亮片掉得像下雪一样。
ritsu: 「我走到哪儿掉到哪儿，像童话里一路撒面包屑的小孩」。
ritsu: 「要是想找我，跟着亮片走就行了」。
ritsu: 我跟着亮片走了。它们从船屋的划艇，一路通到了神社的平台。
@se heartbeat
shiori: ……
: 柊低下头，看了看自己的燕尾服。前襟上，有一处小小的线头，空荡荡地翘着。
ritsu: 还有一件事。
ritsu: 昨晚的晚饭桌上，你变了一个硬币的魔术。硬币从你的手里，消失在了久我先生的外套口袋里。
ritsu: 那之后，久我先生就从口袋里摸出了那张字条。
ritsu: 在众目睽睽之下，把字条放进他的口袋——那才是你昨晚真正的魔术。
kiryu: ……妈的。我也在那张桌子上。
kiryu: 我们所有人，都在给那个魔术鼓掌。
shiori: ……
shiori: 侦探君。
shiori: 你啊……真的很适合当我的助手呢。
> 最后一张牌，翻开了。
> 把整场「飞人」表演，从头到尾，再演一遍吧。
@game ch3_g11
@bgm truth
ritsu: 昨晚的晚饭桌上，柊小姐用一枚硬币做掩护，把一张字条放进了久我先生的外套口袋。
ritsu: 「我有船，今晚送你离开这座岛。23:00，北侧海滩，水线处」。用不顺手的那只手写的歪扭字迹。
ritsu: 一心想逃离这座岛的久我先生，上钩了。
ritsu: 22:30，她说「去冲个澡」，离开交谊厅，穿上深色的雨衣，从船屋划出那条划艇。
ritsu: 她沿着海岸划到北侧海滩，在潮水退到最远的水线附近等着。她只在会被潮水淹没的湿沙上走动。
ritsu: 23:00，久我先生拄着手杖，从石阶一步一步走到水线，上了船。
ritsu: 他在沙滩上，留下了一行只有去程的脚印。
ritsu: 船绕到了神社湾。「涨潮之前，先去神社躲一躲」——她大概是这么说的。
ritsu: 她带着久我先生走上整块岩石凿成的石阶，在拜殿的背后，用那根红色丝编绳，从背后勒死了他。
ritsu: 手杖滚进了拜殿后面的草丛。
ritsu: 她把遗体拖到缆索平台下，用绞盘吊起来，用从船屋割来的新麻绳兜住腋下，挂上了飞鸦车的吊钩。
ritsu: 结，是快速解脱结。结的尾巴，系在量好长度的回收绳上。
ritsu: 23:50 前后，她松开了飞鸦车。
ritsu: 桐生先生听到的「嗡——」，是滑车在钢缆上奔跑的声音。
ritsu: 不破先生听到的「咣」，是滑车撞上止挡的声音。
ritsu: 同一瞬间，回收绳绷直，结散开，遗体落在了瞭望台上。
ritsu: 她拉回空滑车，放回仓库，把船划回船屋。涨上来的潮水，抹去了水线附近的一切痕迹。
ritsu: 00:30，她湿着头发回到交谊厅，笑着说——「水好烫，洗得太久了」。
ritsu: 不破先生守住的那扇门，从来没有被打开过。
ritsu: 第三只乌鸦，没有走楼梯，也没有走门。它从神社的山顶，沿着飞鸦祭的缆索，「飞」上了塔。
ritsu: 这就是这场「飞人」魔术的全部机关。
ritsu: ……我说得对吗，柊诗织小姐。
@se gavel
judge: 那么，投票吧。
judge: 第三只乌鸦，是被谁送上塔的？
@game ch3_g12
@bgm stop
@se gavel
judge: 投票结束。
judge: ……正确。
@goto ch3_confess
`
  + String.raw`

// ================= 自白 → 判官广播 → 章末 =================

# ch3_confess
@bgm sad
: 审判厅里，没有一个人说话。
: 柊诗织慢慢地站直了身子。她理了理燕尾服的前襟，摘下那顶小小的礼帽，按在胸前。
shiori: ……女士们，先生们。
shiori: 感谢各位，看到了最后。
shiori[smile]: 侦探君，满分哦。连硬币那一手都被你看穿了，我这个魔术师，可真是没面子呢。
ritsu: ……为什么。
shiori[normal]: 为什么？
shiori: 侦探君，你还记得吗？昨天我跟你说过，我的师父，三年前在水箱里没出来。
ritsu: 月岛幻斋。「水牢的月岛」。
shiori: 嗯。
@flashback on
@bg black
@bgm sad
shiori: 那天的节目，叫「月下水牢」。师父被铐住手脚，倒吊着沉进装满水的玻璃水箱，外面再挂上一把大锁。
shiori: 他会在水里解开手铐，打开那把锁，在第三分钟的时候，从水里升起来，向观众鞠躬。
shiori: 演了几百场，从来没有失手过。
shiori: 可是那天，到了第三分钟，他没有升起来。
shiori: 我拿着备用钥匙冲上台。钥匙……插不进去。
shiori: 锁被人换了。和排练时用的那一把，长得一模一样，可是钥匙插不进去。
shiori: 我隔着玻璃，看着他。他也看着我。
shiori: 观众还在鼓掌。他们以为，这也是表演的一部分。
@flashback off
@trial on
shiori[sad]: 警察说，是意外。锁生锈卡住了，是常有的事。
shiori: 我信了三年。
shiori: ……直到来这座岛的第一个晚上，我在枕头底下，发现了一封信。
@letter 柊诗织：\n你的师父月岛幻斋，并非死于意外。\n三年前，律师久我莲受鹭宫玄藏之托，买通舞台工作人员，换掉了水箱的锁。\n理由是：月岛想用九年前那件「道具」，向鹭宫玄藏勒索。\n汇款记录与工作人员的证词附后。\n三只乌鸦飞上塔，脚下没有回家的沙。\n——判官
shiori: 汇款记录是真的。工作人员的证词也是真的。久我的签名，我认得出来。
shiori[dark]: 那个人啊，在船上一直在跟我谈价钱。
shiori: 「到了对岸，要多少钱都可以。我是律师，我会处理好一切的」。
shiori: 我问他：「你还记得月岛幻斋吗？」
shiori: 他想了好一会儿，说：「月岛？……那个魔术师？那是一场不幸的意外。」
shiori: 他连回头看我的脸都没有。
@se heartbeat
shiori[sad]: 判官在信里要我按照童谣布置现场。「飞上塔」。
shiori: 我想，好啊。那就让他飞吧。
shiori: 师父说过，最好的魔术，是让观众亲眼看见「不可能」。
shiori: 他一辈子都想让人飞起来。在台上，用滑轮，用配重，用一根看不见的钢丝。
shiori: 所以我想……用他教我的东西，再变最后一场。
shiori[smile]: 女士们先生们……
shiori: 今晚的「飞人」表演，到此谢幕。
@se gavel
: 她深深地鞠了一躬。礼帽从她手里滑落，滚到了证言台的边上。
@bgm stop
fuwa: ……
fuwa: 我守了一夜的塔。
shiori[normal]: 嗯。你守得很好哦，不破先生。门一次也没有开。
shiori: 是我绕过去了。……对不起，让你被怀疑了。
fuwa: ……哼。
ritsu: 柊小姐。还有一件事。
ritsu: 你的师父，想用「九年前的那件道具」勒索玄藏。
ritsu: 那件道具，是什么？
: 柊抬起头，看着律。她的笑容第一次完全消失了。
shiori: ……侦探君。你真的想知道吗？
ritsu: ……
shiori: 九年前，我十七岁。跟着师父来这座岛，在寿宴上表演。
shiori: 那天夜里很晚了，师父把我叫醒，让我帮他搬一只箱子。
shiori: 箱子里，是一双旧长靴。还有一副石膏模子。
@se heartbeat
@bgm horror
: 律觉得，审判厅里的温度，忽然降了下去。
shiori: 我抱着那只箱子，跟着师父，在黑漆漆的院子里走了好久。
shiori: 第二天早上，温室外面的泥地上，就出现了一行「园丁的脚印」。
shiori: 师父说，那是「给大人们变的一个戏法」。
shiori[sad]: 我那时候什么都不懂。还以为自己在帮一场了不起的魔术搬道具。
@shake
> ……长靴。
> 温室外，一行园丁的长靴脚印。
> 那是我九年前推理的第一步。是我在所有大人面前，第一个指出来的线索。
> 「看，这是园丁的长靴留下的脚印」——
> 我记得那句话。我记得自己说那句话时，大人们赞许的眼神。
> 我记得那一步的每一个细节。
> 可是，那一行脚印……是被人「搬」过去的？
@se heartbeat
kiryu: ……喂。喂，等一下。
kiryu: 园丁的脚印是伪造的？那、那我写的……
: 桐生的声音在发抖，后半句没有说出来。
: 不破的牙签掉在了地上。御堂医生的手指，紧紧扣住了证言台的边缘。仓田的脸，白得像一张纸。
shiori: 侦探君。
shiori: 你九年前看到的第一个线索，是我亲手搬过去的。
shiori[sad]: ……对不起呀。
ritsu: ……
> 左手掌心的旧疤，在发烫。
> 我说不出话来。
: 汐站在律的身边，一动不动。她低着头，戴着白手套的双手，紧紧地攥在了一起。
@wait 800
fuwa: ……七濑。
ritsu: ……！
: 律回过头。不破第一次这样叫他的名字。
fuwa: 不管九年前怎么样。今天，是你把我从笼子门口拉回来的。
fuwa: 这个人情，我记着。
fuwa: ……先把她送下去吧。
shiori[smile]: 不用押着我哦。魔术师退场，自己会走。
shiori: 侦探君，下次见面的时候，我再给你变个新魔术～
: 柊捡起礼帽，戴回头上，朝着通往地下鸦笼的楼梯走去。燕尾服上的亮片，一路闪着微弱的光。
@bgm judge
: 汐站在律的身后，把右手悄悄插进了开衫的口袋。
@se phone
@wait 300
judge: 第三只乌鸦，入笼。
judge: 飞上塔的乌鸦，终于落了地。
judge: 诸位，你们越来越接近了。……接近那个夜晚。
judge: 那么，下一首歌。
@bgm stop
@poem 四只乌鸦烧去脸，\n灰烬里面埋着谁的名。
judge: 下一只乌鸦，将失去它的脸。
judge: 到那时，请诸位好好想一想——灰烬里的那个名字，究竟是谁的。
@se phone
@trial off
: 喇叭里的声音消失了。审判厅里，只剩下石墙的回音。
@goto ch3_end

# ch3_end
@bg judgment
@filter dark
@caption 8月16日 11:30 审判厅·出口
@bgm sad
: 人们一个接一个地，沿着石阶走下鸦笼。没有人回头。
: 律站在原地，看着自己的左手。
> 长靴。石膏模子。给大人们变的一个戏法。
> 九年前的那天早上，父亲牵着我的手，说：「律，我们来玩侦探游戏吧。」
> 那场游戏里的每一个线索，都是我自己找到的。……是吗？
@show shio[normal] C
shio: ……律君。
ritsu: ……汐。
: 汐从开衫里拿出了那本红色的笔记本。她把它捧在胸前，看了很久，然后递到了律的面前。
shio[smile]: 律君，这个，替我保管一下。
ritsu: ……你的笔记本？
ritsu: 怎么了？
shio: 没什么～
shio: 就是……突然觉得，放在律君那里，比较安心。
ritsu: 里面写的不是点心店的地址吗？
shio[smile]: 嘿嘿～还有汐酱的秘密哦。不许偷看～
shio[normal]: ……不过呢。
shio: 如果哪天，律君真的很想看的话——
: 她顿了一下，像是要说什么，最后却只是笑了笑。
shio[smile]: ……算啦～到时候再说！
: 律接过笔记本。红色的封皮被她的手套捂得微微发热，比想象中要沉。
shio: 走吧，律君。大家在下面等着呢。
@hide
: 汐转过身，朝石阶走去。走到一半，她停下来，回头看了一眼审判厅中央那枚乌鸦徽章。
: 然后，她哼起了那首歌。很轻，很轻。
: 一只乌鸦锁进笼，月光照不到它的胸——
> 我把笔记本放进外套的内袋，贴着父亲那封「给二十一岁的律」的信。
> 两样都没有打开。两样都很沉。
> 第三只乌鸦落地了。可我心里，有什么东西，正在一点一点地往下坠。
@fade out
@chapterend
`
});
