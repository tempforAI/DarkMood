/* 序章「鸦啼之岛」 —— 1999 年 8 月 12 日 */
DM.registerChapter({
  id: 'prologue',
  title: '序章',
  name: '鸦啼之岛',
  next: 'ch1',
  start: 'prologue_start',

  evidence: {
    prologue_invite: { name: '邀请函', icon: 'letter',
      desc: '署名「鹭宫千鹤」——九年前的死者。给律的那封写着：「致解开我死亡之谜的小侦探：请再来一次。这一次，请找到真正的答案。」附有 8 月 12 日的船票。其他客人也都收到了同一署名、内容各不相同的信。' },
    prologue_timer: { name: '放映机定时器', icon: 'clock',
      desc: '餐厅放映机的电源插在一只机械定时器上，刻度盘拨在 21:00。只要事先装好胶片、拨好时间，不需要任何人在场，放映机就会自己启动。' },
    prologue_film: { name: '判官影片', icon: 'tape',
      desc: '戴乌鸦面具的「判官」唱出七鸦之歌，宣读了十四个人的罪状和五条规则。影片称会长为「坐在主位上的鹭宫玄藏」，称恭介为「被父亲赶到末席的鹭宫恭介」——而座次是会长今晚入席时才亲手改定的。' },
    prologue_radio: { name: '被砸毁的电台', icon: 'generic',
      desc: '无线电室里唯一的电台被砸得粉碎，真空管全碎，天线被剪断。碎片上积着薄灰，不像是刚刚才砸的。岛上与外界的联系就此断绝。' },
    prologue_letter: { name: '「说谎的孩子」', icon: 'letter',
      desc: '律的枕头下压着的一封信。黑色信封，里面只有一张卡片，写着四个字：「说谎的孩子」。其他人的枕下也各有一封，写着与影片相同的罪状。' }
  },

  explore: {
    prologue_tour: {
      title: '月蚀馆·自由行动',
      mode: 'free',
      start: 'hall',
      places: ['hall', 'dining', 'lounge', 'kitchen', 'east_corridor', 'courtyard'],
      spots: {
        hall: [
          { anchor: 'clock', label: '大座钟', run: 'prologue_s_clock' },
          { anchor: 'crow_statue', label: '乌鸦铜像', run: 'prologue_s_crow' },
          { anchor: 'staircase', label: '大楼梯', run: 'prologue_s_stairs' }
        ],
        dining: [
          { anchor: 'projector', label: '放映机', run: 'prologue_s_projector' },
          { anchor: 'painting', label: '乌鸦油画', run: 'prologue_s_painting' },
          { anchor: 'table', label: '长餐桌', run: 'prologue_s_table' }
        ],
        lounge: [
          { anchor: 'phone', label: '内线电话', run: 'prologue_s_phone' },
          { anchor: 'piano', label: '钢琴', run: 'prologue_s_piano' },
          { anchor: 'bookshelf', label: '书架', run: 'prologue_s_books' }
        ],
        kitchen: [
          { anchor: 'knife_rack', label: '刀架', run: 'prologue_s_knives' },
          { anchor: 'tube', label: '传声管', run: 'prologue_s_tube' },
          { anchor: 'cellar_door', label: '酒窖的门', run: 'prologue_s_cellar' }
        ],
        east_corridor: [
          { anchor: 'window', label: '走廊的窗', run: 'prologue_s_ewindow' },
          { anchor: 'door5', label: '东5号室', run: 'prologue_s_door5' }
        ],
        courtyard: [
          { anchor: 'cable', label: '天上的黑线', run: 'prologue_s_cable' },
          { anchor: 'greenhouse', label: '温室的废墟', run: 'prologue_s_greenhouse' },
          { anchor: 'tower', label: '鸦之塔', run: 'prologue_s_tower' }
        ]
      },
      people: {
        hall: [
          { char: 'hina', run: 'prologue_t_hina', x: 330 },
          { char: 'kurokawa', run: 'prologue_t_kurokawa', x: 230 },
          { char: 'genzou', run: 'prologue_t_genzou', x: 120 }
        ],
        dining: [ { char: 'shizuka', run: 'prologue_t_shizuka', x: 300 } ],
        lounge: [
          { char: 'shiori', run: 'prologue_t_shiori', x: 380 },
          { char: 'kyosuke', run: 'prologue_t_kyosuke', x: 230 },
          { char: 'kuga', run: 'prologue_t_kuga', x: 110 }
        ],
        kitchen: [ { char: 'kurata', run: 'prologue_t_kurata', x: 260 } ],
        east_corridor: [
          { char: 'usami', run: 'prologue_t_usami', x: 250 },
          { char: 'fuwa', run: 'prologue_t_fuwa', x: 400 }
        ],
        courtyard: [
          { char: 'mio', run: 'prologue_t_mio', x: 166 },
          { char: 'kiryu', run: 'prologue_t_kiryu', x: 330 },
          { char: 'shio', run: 'prologue_t_shio', x: 250 },
          { char: 'kotone', run: 'prologue_t_kotone', x: 80 }
        ]
      },
      done: {
        need: ['flag:prologue_met_usami', 'flag:prologue_met_kiryu', 'flag:prologue_met_hina',
               'flag:prologue_met_kurata', 'flag:prologue_met_shiori', 'flag:prologue_met_mio'],
        run: 'prologue_tour_end',
        prompt: '快到五点了。去码头送黑川先生吗？'
      }
    }
  },

  games: {
    prologue_g1: {
      type: 'debate', title: '证言交锋（练习）',
      ammo: ['prologue_invite', 'prologue_timer', 'prologue_film'],
      lines: [
        { who: 'genzou', expr: 'angry', text: '这是外人的恶作剧！有人{偷偷溜进餐厅}，躲在暗处开了放映机！' },
        { who: 'kyosuke', expr: 'shock', text: '对、对啊……说不定那家伙{现在还躲在宅子里}……' },
        { who: 'kiryu', expr: 'normal', text: '放映机就在餐厅角落。刚才这一个钟头，可谁也没靠近过它。' },
        { who: 'genzou', expr: 'angry', text: '那就是趁我们不注意摸进来的！一个{手脚利索的贼}！' }
      ],
      answer: { line: 0, weak: 0, ammo: 'prologue_timer' },
      hint: '放映机为什么偏偏在九点整转起来？看看它的电源插在什么东西上。',
      wrong: '……不对。这件证据说明不了那一点。'
    },
    prologue_g2: {
      type: 'present',
      prompt: '能说明判官对「今晚的我们」了如指掌的证据是——',
      answer: 'prologue_film',
      hint: '影片里是怎么称呼会长和恭介先生的？那个座次，是什么时候定下来的？'
    }
  },

  script: String.raw`
# prologue_start
@bg black
@bgm stop
@wait 800
@poem ……风。
@poem 有什么东西从很高的地方落下来。是羽毛吗？黑色的，一片，又一片。
@poem 一只手伸了过来。白色的袖口，被风吹得鼓起来。
chizuru{少女的声音}: 律君。
chizuru{少女的声音}: 不要往下看。
@se wave
@flash white
@wait 600
@bg ferry
@bgm island
@weather none
@caption 1999年8月12日 14:20 渡船甲板
@se wave
: 船身猛地一沉，又被浪托起来。
> ……又是那个梦。
> 每年夏天都会做的梦。醒来时，只记得羽毛和一只手。
: 律靠在甲板的栏杆上，额头抵着发烫的铁管。海风里有柴油和咸鱼的味道。
: 船尾的方向，有人在哼歌。
: 一段很简单的旋律，像摇篮曲。缓慢地升上去，又缓慢地落下来，最后一个音拖得很长，像在等谁回答。
@show shio[smile] C
shio: ……嗯～哼哼～……
ritsu: 汐。
shio[surprise]: 哇！律君醒了？
shio[smile]: 你在栏杆上睡着了哦。我还在想要不要把你推下去，看看名侦探会不会游泳～
ritsu: 那首歌是？
shio[normal]: 嗯？
ritsu: 你刚才哼的。我好像在哪里听过。
shio[smile]: 随便哼哼的～大概是哪里听来的广告歌吧。
shio[smile]: 律君居然对我的歌声有兴趣，真稀奇。要不要我从头唱一遍？收费的哦。
ritsu: ……不用了。
> 雨宫汐。我的助手。一年前的春天，她自己找上门来，说想在侦探事务所打工。
> 事务所一个月接不到三件委托，付不起像样的工资。她却一直没走。
: 汐穿着米色的开衫，下面是水手领的连衣裙。八月的海上，她手上依然戴着一双雪白的手套。
> 我问过她为什么一年四季都戴手套。她说：「淑女的秘密～」
> 我就没再问了。侦探也有不该问的事。
shio[normal]: 律君，邀请函还在吧？再给我看一眼。
ritsu: 你已经看了二十遍了。
shio[smile]: 二十一遍。律君上个月刚满二十一岁，凑个整数嘛。
: 律从外套内袋里取出那只奶白色的信封。邮戳是本岛的港町，寄件人一栏写着——
@letter 致解开我死亡之谜的小侦探：\n\n请再来一次。\n这一次，请找到真正的答案。\n\n　　　　　　　　　　鹭宫千鹤\n\n（附：8月12日 宵鸦岛渡船船票一张）
@get prologue_invite
shio[think]: 鹭宫千鹤。九年前，在宵鸦岛的月蚀馆里被杀死的女孩。
shio[think]: 死人寄来的信……而且只写给「小侦探」。
ritsu: 恶作剧的可能性最大。
shio[smile]: 可是律君还是来了。
ritsu: 是你坚持要来的。
shio[smile]: 嗯，是我坚持的～
shio[normal]: 因为啊，要是不来，律君会一直想着这封信的。吃饭的时候想，睡觉的时候也想。
shio[normal]: 那还不如来看看。看看到底是谁，想让「白鹭馆事件」的少年侦探再回去一次。
> 白鹭馆事件。
> 报纸是这么叫的。月蚀馆的主人姓鹭宫，又是白鹭一样的少女死在了温室里。
: 风把信纸的一角吹得哗哗作响。律把它折好，放回内袋。
@flashback on
@bg courtyard past
@caption 1990年8月14日 清晨（回忆）
> 九年前，我十二岁。父亲带我来岛上做客，参加鹭宫家老家主的七十大寿。
> 寿宴的那个夜里，鹭宫千鹤死在了温室。
> 第二天早上，我在温室外的泥地上找到了园丁长靴的脚印。
> 在园丁小屋的工具架后面，找到了沾血的修枝剪。
> 在园丁的枕头底下，找到了千鹤小姐的白色发带。
> 然后我想起来了——那天夜里十一点左右，我看见园丁站在温室附近。
> 园丁乌丸源治被逮捕。我在法庭上作了证。
> 两年后，他在狱中上吊死了。
@flashback off
@bg ferry
@caption 1999年8月12日 14:35 渡船甲板
ritsu: 我记得那次推理的每一步。
ritsu: 脚印在哪里，剪刀在哪里，发带在哪里。证据怎样一件接一件地连起来。
shio[normal]: ……嗯。
ritsu: 可是那天晚上的风是什么样的，我想不起来。
ritsu: 冷不冷，有没有月亮，那晚我穿着什么衣服……全都想不起来。
shio[think]: 九年前的事嘛，记不清也很正常。
ritsu: 也许吧。
: 律下意识地握紧左手。掌心有一道笔直的旧疤，从食指根一直划到手腕。
shio[normal]: 又在摸那道疤了。
ritsu: 小时候骑车摔的。
shio[smile]: 律君每次都这么说。
shio[think]: 骑车摔跤，会摔出这么直的一道伤口吗？
ritsu: ……摔在了铁丝网上吧。不记得了。
: 汐没有再追问。她低头翻开随身带着的红色笔记本，用铅笔写了几个字，又合上。
shio[smile]: 对了。律君口袋里，还有另一封信吧？
ritsu: ……你怎么知道。
shio[smile]: 助手的直觉～左边内袋鼓出来两层，一层是邀请函，另一层呢？
: 律没有回答。他隔着外套按了按那封信。
: 牛皮纸信封，边角已经磨得发白。上面是父亲端正的字迹：「给二十一岁的律」。
> 父亲两年前死了。在车站，从月台上掉了下去。
> 警察说是事故。也有人说不是。
> 他留下这封信，嘱咐等我二十一岁再拆。上个月，我满了二十一岁。
shio[normal]: 还没拆？
ritsu: 还没。
shio[smile]: 律君是胆小鬼～
ritsu: 也许是。
shio[normal]: ……
shio[smile]: 好啦，不欺负你了。去船舱那边看看吧？其他客人好像都到齐了。
shio[smile]: 我数过了，算上我们一共十四个人。侦探先生，这种时候应该先观察嫌疑人哦～
ritsu: 还没出事呢，哪来的嫌疑人。
shio[smile]: 迟早会有的嘛。
@hide
@caption 14:45 渡船·船舱前
: 船舱前的长椅上坐满了人。有人在抽烟，有人在晕船，有人一言不发地望着海。
: 最显眼的是一个穿深棕色马甲的中年男人。他背着手站在船头，嗓门大得盖过了引擎声。
genzou[angry]: 船夫！还有多久！
boatman: 快了快了。看见那个岛了吧，长着一根黑柱子的那个。
: 远处的海面上浮着一座墨绿色的岛。岛的北端，悬崖上立着一座细长的塔，塔顶插进低垂的云里。
genzou[angry]: 我问的是还要多久！
boatman: 半个钟头。
genzou[normal]: 哼。
genzou[think]: ……七濑？
: 男人眯起眼睛打量着律，像在估一块地皮的价钱。
genzou[normal]: 七濑修司的儿子。没错吧。
ritsu: 鹭宫会长。好久不见。
genzou[normal]: 你老子的葬礼，我送过花圈。
genzou[angry]: 你也收到了那封信？用千鹤的名字写的那种下作东西？
ritsu: 收到了。
genzou[angry]: 哪个混账干的，我倒要看看！这座岛是我鹭宫家的地，在我的地盘上装神弄鬼——
genzou[angry]: 船夫！你说，是谁雇你今天开船的？
boatman: 主人。
genzou[angry]: 什么主人？我就是这座岛的主人！
boatman: 给我钱的那位主人。信和钱都是寄来的，我也没见过。
boatman: 主人吩咐了：今天把客人送上岛，七天以后再来接。
genzou[shock]: 七天？
boatman: 七天。一天不多，一天不少。
genzou[angry]: 混账！
: 鹭宫玄藏。鹭宫集团的会长，九年前死者千鹤的叔父。老家主去世后，宵鸦岛和整个鹭宫家都落进了他手里。
@note genzou 鹭宫集团会长。专横、嗓门大。收到了以千鹤名义寄来的信，对此暴跳如雷。打算把宵鸦岛改建成度假酒店。
kyosuke[smile]: 老爸，别对着船夫吼了嘛。人家也就是个开船的。
: 长椅上歪着一个穿白西装的年轻人。领口敞着，手里握着一只银色小酒壶。
kyosuke[smile]: 哟。你就是那个……少年侦探？
kyosuke[smile]: 我是鹭宫恭介。那个吼来吼去的大叔的儿子。你好你好，侦探小弟。
ritsu: ……我比你小不了几岁吧。
kyosuke[smile]: 侦探小弟就是侦探小弟嘛。来一口？威士忌。
ritsu: 不了。
kyosuke[normal]: 啧，没意思。
genzou[angry]: 恭介！大白天的又喝！
kyosuke[sad]: 晕船嘛……喝点就不晕了……
@note kyosuke 玄藏之子。白西装，随身带酒壶，叫律「侦探小弟」。
: 恭介身边坐着一个黑裙子的小女孩。她怀里抱着一只穿和服的人偶，坐得笔直，像一尊瓷器。
hina[normal]: 初次见面。我是鹭宫雏。
hina[normal]: 这是千代。
: 她把人偶往前举了举，让人偶也「鞠了一躬」。
ritsu: 七濑律。
hina[normal]: 我知道。七濑先生。
hina[normal]: 是您找出了杀害姐姐的凶手。
ritsu: ……
hina[normal]: 谢谢您。
: 少女的声音没有起伏。律却觉得喉咙里堵了一下。
> 鹭宫雏。千鹤的亲妹妹。九年前，她才五岁。
@note hina 千鹤的妹妹，14岁。说话简短有礼，抱着人偶「千代」。称律「七濑先生」。
@hide
: 船舱另一侧，一位戴细框眼镜的女士正在看一本厚厚的医学期刊，仿佛周围的一切都与她无关。
shizuka[normal]: ……七濑君。
shizuka[normal]: 你长高了。上次见你，你还在发烧说胡话。
ritsu: 御堂医生。
shizuka[normal]: 九年前那天晚上，是我给你打的退烧针。你大概不记得了。
ritsu: ……不记得了。
shizuka[normal]: 不记得也好。
: 她翻过一页期刊，不再说话。
> 御堂静香。御堂综合医院的院长，鹭宫家多年的家庭医生。九年前，是她检查了千鹤的遗体。
@note shizuka 医生、院长。冷静、言简意赅。称律「七濑君」。九年前检查过千鹤的遗体，还给发烧的律打过针。
@hide
: 栏杆边站着一个高大的男人，风衣敞着，嘴里叼着一根牙签。眉骨上有一道旧疤。
fuwa[normal]: ……小鬼。
ritsu: 不破刑警。
fuwa[normal]: 早不是刑警了。保安。
fuwa[normal]: 七濑警部的儿子。长这么大了。
ritsu: 您也收到了信？
fuwa[normal]: 嗯。说岛上缺个保安。钱给得不少。
fuwa[dark]: 署名是个死人。
: 他把牙签换到嘴角另一边，又转过身去看海。
> 不破刚。九年前县警搜查一课的刑警，是他逮捕了园丁。
> 父亲说过，不破是课里最能干的年轻人。后来不知道为什么被调去了乡下。
@note fuwa 前刑警，现为保安。叼牙签，短句。叫律「小鬼」。九年前逮捕了园丁。
@hide
kiryu[smile]: 哟，这不是名侦探嘛。
: 一个扎着长发的男人倚在舱门口，一边点烟一边冲律举了举相机。
kiryu[smile]: 桐生冬马，自由记者。九年前我给你拍过照片，登在《周刊真相》上——「十二岁的名侦探」，标题还是我起的。
ritsu: ……我记得那篇报道。
kiryu[smile]: 记得最好。那之后我写了《恶魔园丁》，连载了十二期，托你的福，吃了好几年。
kiryu[normal]: 这次的信上说，九年前的事件「有新的证据」。记者嘛，闻到味儿就得来。
kiryu[dark]: 你呢，名侦探？是来确认自己没错的？
ritsu: 我是被助手拖来的。
kiryu[smile]: 哈。
@note kiryu 自由记者，写了《恶魔园丁》系列报道。抽烟、尖刻，叫律「名侦探」。
@hide
: 舱内的长椅上，一个拄着手杖的男人正艰难地挪动身体，想换个坐姿。他的西装上别着一枚律师徽章。
kuga[smile]: 啊，失礼了，失礼了。腰不太好，海上又颠。
kuga[smile]: 久我莲，律师。鹭宫家的法律事务，一向由敝人处理。
kuga[normal]: 七濑君的大名如雷贯耳。九年前那件案子，敝人也算是……参与者之一吧。
ritsu: 参与者？
kuga[normal]: 园丁的国选辩护人，就是敝人。
kuga[sad]: 很遗憾，未能为当事人争取到更好的结果。证据确凿，又有目击证言，从程序上讲……
kuga[smile]: 哎呀，旧事不提了。这次是来谈遗嘱事宜的，与那件事无关，无关。
@note kuga 律师，拄手杖，腰不好。九年前担任园丁的辩护人。说话满口法律用语。
@hide
: 晕船最厉害的是一个高个子男人。他戴着圆眼镜，脸色发青，却还在笔记本上画着什么。
usami[normal]: 啊……七濑先生。宇佐见京，建筑师。
usami[normal]: 失礼，我在画月蚀馆屋顶的排水坡度……一想别的事就不晕了。
ritsu: 你是去工作的？
usami[smile]: 嗯。去年西翼的重建是我设计的。信上说酒店开业前要做最后的验收。
usami[think]: 署名虽然……有点奇怪，但设计费是实打实汇过来的。
@note usami 建筑师，185cm，圆眼镜，一板一眼。去年设计重建了月蚀馆西翼。
@hide
kurata[smile]: 哈哈哈！小哥，你脸色比这位建筑师先生还难看啊！
: 一个胖墩墩的男人拍着律的肩膀，笑声像打雷。他戴着一顶褪色的头巾，手里提着一只沉甸甸的帆布包。
kurata[smile]: 仓田豪！开小食堂的。九年前我在月蚀馆当过主厨，小哥你那时候还吃过我做的咖喱饭呢！
ritsu: ……抱歉，不太记得了。
kurata[smile]: 哎呀，伤心！我的咖喱饭可是一吃难忘的哦，不信你问……呃，问谁好呢，哈哈！
kurata[normal]: 信上说，请我去给酒店开业做试菜。包里全是我的宝贝菜刀，一把都不能少。
@note kurata 厨师，九年前是月蚀馆主厨。豪爽爱笑，叫律「小哥」。
@hide
: 船尾的阴影里，一个少女独自坐在琴盒上。她个子很小，银白色的双马尾被风吹得乱飘，正用一块绒布擦着琴弦。
kotone[normal]: ……看什么看。
ritsu: 没什么。
kotone[angry]: 你就是那个侦探？
kotone[normal]: 真白琴音。拉小提琴的。别来跟我搭话，我在调整心情。
shio[smile]: 好可爱～几岁啦？
kotone[angry]: 十七！不许摸头！
: 她抱着琴盒挪到了长椅另一头。
@note kotone 小提琴家，17岁，个子小。高傲冷淡，称律「侦探」。母亲曾是月蚀馆的女佣。
@hide
: 最后一个人站在船头的另一边，正对着越来越近的岛。她穿着沾满颜料的罩衫，长发随风飘散，手里握着一支炭笔，在速写本上画着那座塔。
mio[normal]: ……律君。
: 律愣了一下。很少有人这样叫他。
mio[smile]: 果然是律君。那年夏天，你晒得好黑。
ritsu: 你是……
mio[smile]: 千早澪。岛上渔家的女儿。九年前，我常来月蚀馆帮忙。
mio[sad]: 千鹤……是我最好的朋友。
: 她低下头，继续在速写本上画塔。塔顶上停着一只乌鸦，炭笔一点一点把它涂黑。
mio[normal]: 宵鸦岛的乌鸦，比别的地方都大。
mio[normal]: 我小时候以为，它们是从塔里飞出来的。
@note mio 画家，22岁，岛上出身。千鹤儿时最好的朋友。说话轻柔缓慢，称律「律君」。
@hide
@show shio[think] C
shio[think]: 十三个人，加上律君，十四个。
shio[think]: 会长、会长的儿子、千鹤小姐的妹妹、医生、前刑警、记者、律师、建筑师、厨师、画家、小提琴家……
shio[smile]: ……还有我。
shio[normal]: 律君发现了吗？每一个人，好像都和九年前那件事有点关系。
ritsu: 你也有关系？
shio[smile]: 我和侦探先生有关系呀～
ritsu: ……
: 汐笑着跑开了。律回过头，岛已经近在眼前。
: 码头的石阶上，站着一个穿黑色燕尾服的瘦小老人。
@hide
@bg dock
@bgm calm
@caption 15:20 宵鸦岛·码头
@se wave
: 渡船靠岸时，船底擦过礁石，发出一声长长的呻吟。
: 码头的石板被海水泡得发黑，缝隙里长着青苔。尽头是一道锈迹斑斑的铁栅门，门后的石阶一直通往山坡上的宅邸。
: 黑衣老人站在铁栅门前，深深地鞠了一躬。他个子很矮，比汐还矮一点，白手套干干净净。
kurokawa[normal]: 欢迎各位来到宵鸦岛。
kurokawa[normal]: 鄙人黑川，是这座岛的看管人。这几天，由我负责为各位安排起居。
genzou[shock]: ……黑川？
genzou[angry]: 你这老东西还活着？我不是早就把你辞退了吗！
kurokawa[smile]: 承蒙会长还记得。
: 老人笑了。嘴角咧开时，左边的臼齿上闪过一点金属的光——是一颗银色的牙冠。
kurokawa[normal]: 离开鹭宫家以后，鄙人四处打零工。去年工程开工，承蒙工程队不嫌弃，雇鄙人看管这座岛。
kurokawa[normal]: 毕竟这座宅子的每一扇门、每一把钥匙，鄙人都熟悉。
genzou[angry]: 那封信呢？是你寄的？
kurokawa[normal]: 不是。鄙人也只是收到吩咐的人。
kurokawa[normal]: 主人的信和汇款都是寄来的。吩咐鄙人备好七天的食材、打扫房间、迎接各位。
kurokawa[normal]: 鄙人今天傍晚五点，就随这条船回本岛去了。
genzou[angry]: 主人主人，到底谁是主人！
kurokawa[normal]: ……
: 黑川没有回答，只是又鞠了一躬。
: 他从燕尾服口袋里摸出一包香烟。蓝色的烟盒，上面印着一只衔着橄榄枝的金色鸽子——老牌子的「和平」。
kurokawa[normal]: 失礼了。人老了，离不开这个。
: 他用一只旧打火机点上烟，深深吸了一口。烟雾被海风吹散，有一股甜腻的焦味。
kiryu[smile]: 和平啊。现在还抽这个的，也就老爷子们了。
kurokawa[smile]: 是。抽了四十年，换不了口味了。
@note kurokawa 月蚀馆的老管家，现为岛上看管人。瘦小，臼齿上有一颗银色牙冠，抽「和平」牌香烟。说傍晚五点随渡船离开。
kurokawa[normal]: 那么，请各位随鄙人来。行李请放在门边，稍后鄙人送到各位房间。
: 铁栅门吱呀一声被推开了。
@bg hall
@bgm mystery
@caption 15:40 月蚀馆·大厅
: 大厅比想象中更暗。高高的天花板上吊着一盏蒙尘的水晶吊灯，楼梯铺着褪色的红地毯。
: 正对大门的墙边立着一座大座钟，钟摆缓慢地左右摇晃。另一侧，一尊乌鸦铜像展开双翼，黑亮的眼珠盯着每一个走进门的人。
kurokawa[normal]: 东翼是客房。各位的房间号已经写在钥匙牌上。
kurokawa[normal]: 西翼去年重建完毕，还没有正式启用。本馆二楼有渡廊通往鸦之塔，塔里年久失修，请各位不要随意上去。
kurokawa[normal]: 晚餐七点在餐厅开始。食材都已备齐，仓田先生——
kurata[smile]: 我来我来！既然主人请我来试菜，今晚就让大家尝尝仓田的手艺！
kurokawa[smile]: 有劳了。
: 黑川依次分发钥匙。律拿到的是「东6」，汐是隔壁的「东5」。
shio[smile]: 律君就住在我隔壁呢。半夜要是害怕，可以敲墙哦～
ritsu: 我不会害怕。
shio[smile]: 我是说我害怕的时候～
kurokawa[normal]: 离五点还有一些时间。各位可以随意在馆内走走，熟悉一下环境。
@show shio[normal] C
shio[normal]: 律君，我们分头行动吧？侦探的第一步是——
ritsu: 熟悉现场。
shio[smile]: 还有，和每一个人打招呼。好好看看他们的脸～
shio[smile]: 我先去中庭了！
@hide
> 先在馆里转一转吧。宅子的格局，还有住在这里的人们。
> 尤其是那些和九年前有关的人……建筑师、记者、厨师、魔术师、画家，还有千鹤小姐的妹妹。
@explore prologue_tour

# prologue_s_clock
: 一座比律还高的大座钟。表盘上的罗马数字已经褪色，钟摆沉稳地摆动着。
> 走得很准。和我的手表分秒不差。
@if prologue_met_hina -> prologue_s_clock2
@return

# prologue_s_clock2
> 雏说，她数的不是这座钟，而是塔上的钟。
@return

# prologue_s_crow
: 一尊半人高的乌鸦铜像，双翼展开，喙尖微微张开，像要发出一声啼叫。
: 底座上刻着一行字：「鸦天狗审判罪人」。
> ……真是好客的装饰。
@return

# prologue_s_stairs
: 铺着红地毯的大楼梯通往二楼。楼梯平台的墙上挂着一幅巨大的家族肖像，画框上蒙着一块白布。
> 白布下面，大概是鹭宫家的全家福。九年前，那上面应该也有千鹤小姐。
@return

# prologue_s_projector
: 餐厅角落里，一台老式的十六毫米放映机架在三脚台上，镜头正对着墙上卷起的幕布。
: 机身上的灰被擦掉过。胶片盘已经装好了。
> 放映机……今晚有什么节目吗？
: 电源线没有直接插在墙上，而是先接进了一个白色的小盒子。
> 那是什么？
@return

# prologue_s_painting
: 壁炉上方挂着一幅巨大的油画：暮色中的鸦之塔，成百上千只乌鸦绕着塔顶盘旋。
: 画布右下角的签名已经模糊，只能辨认出一个年份：1972。
> 每一只乌鸦都画了眼睛。每一双眼睛，都朝着画外。
@return

# prologue_s_table
: 一张能坐二十人的长餐桌。桌上已经摆好了十四套餐具，每个座位前都立着一张手写的名牌。
: 主位空着。会长的名牌被放在了长桌中段，恭介的就在他旁边。
> 名牌的字很端正，大概是黑川先生写的。
@return

# prologue_s_phone
: 墙上挂着一部黑色的内线电话，旁边贴着一张泛黄的号码表：大厅、厨房、东翼、西翼、塔……
: 拿起听筒，只有电流的嗡嗡声。
> 只能打馆内。和外面联系，得靠别的东西。
@return

# prologue_s_piano
: 一架黑色的立式钢琴，琴盖上落着薄灰。随手按下一个键，声音有点走调。
> 九年前的寿宴上，大概有人在这里弹过琴吧。
@return

# prologue_s_books
: 书架上大半是洋书和旧杂志。中间夹着一本薄薄的册子：《宵鸦岛怪谈考》，作者——桐生冬马。
> 那个记者还写过这种书。
@return

# prologue_s_knives
: 墙上的磁铁刀架空着。仓田正在把自己带来的刀一把一把吸上去。
@if prologue_met_kurata -> prologue_s_knives2
@return

# prologue_s_knives2
: 八把刀排成一列，从长到短，刀刃闪着冷光。
> 仓田先生说这是他的「宝贝」。看得出来，每一把都被精心磨过。
@return

# prologue_s_tube
: 墙上伸出一根黄铜管子，管口装着一个小盖子。
> 传声管。旧式宅邸里用来向厨房吩咐事情的东西。对着它说话，声音会顺着管子传到另一头。
@return

# prologue_s_cellar
: 一扇厚重的木门，门后是向下的石阶，凉气从门缝里往外冒。
> 酒窖。听说还连着东翼和西翼——仆人们以前走的通道。
@return

# prologue_s_ewindow
: 走廊左手边是一排窗户，窗外就是海。浪拍打着北边的悬崖，白沫一阵一阵地涌起。
> 东翼的窗朝海。客房在右手边，一共六间。
@return

# prologue_s_door5
: 东5号室。汐的房间。门上的钥匙牌在风里轻轻晃动。
> 她说她怕黑。我认识她一年，从没见她怕过什么。
@return

# prologue_s_cable
: 抬头望去，阴沉的天空里横着一条细细的黑线。它从岛中央的山丘上斜斜拉下来，一直连到鸦之塔的塔顶。
@if prologue_met_kiryu -> prologue_s_cable2
> 那是什么？电线？
@return

# prologue_s_cable2
> 飞鸦祭的缆索。稻草乌鸦沿着它从神社「飞」到塔顶……桐生说，那是鸦天狗降临宣判的意思。
@return

# prologue_s_greenhouse
: 中庭东侧是一片废墟。生锈的铁骨架歪歪斜斜地立着，玻璃早就碎光了，里面长满了齐腰高的野草。
> ……温室。
> 九年前，千鹤小姐就死在这里。
: 律站在废墟前，等着自己想起些什么。
: 什么也没有想起来。只有风穿过铁架的声音。
@return

# prologue_s_tower
: 鸦之塔从中庭北侧拔地而起，四层，黑色的石墙被雨水冲出一道道白痕。
: 三楼有一扇窗朝着中庭，四楼是巨大的钟面。指针指着四点过一点。
> 塔顶的瞭望台……从这里看不清。
@return
