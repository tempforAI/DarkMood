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

# prologue_t_hina
@if prologue_met_hina -> prologue_t_hina2
hina[normal]: ……
: 雏坐在楼梯最下面一级，抱着人偶，仰头望着大门上方的高窗。窗外正好能看见鸦之塔的钟面。
ritsu: 在看什么？
hina[normal]: 在等钟。
@se bell
@wait 300
: 远处传来钟声。沉重、缓慢，一声，又一声。
hina[normal]: 一。
hina[normal]: 二。
hina[normal]: 三。
hina[normal]: 四。
: 钟声停了。余音在大厅的天花板下绕了很久。
hina[normal]: 四点。
ritsu: 你每次都数？
hina[normal]: 是的。鸦之塔的钟，每个整点都会敲。敲几点，就响几下。
hina[normal]: 我每次都数。
ritsu: 为什么？
hina[think]: ……姐姐教我的。
hina[normal]: 她说，数着钟声，就不会害怕。
: 她把人偶搂得更紧了一点。
hina[normal]: 千代也会数。不过千代总是数错。
ritsu: 那你呢？
hina[normal]: 我不会数错。
@set prologue_met_hina
@note hina 有数钟声的习惯——「鸦之塔的钟每个整点都会敲，我每次都数。」是千鹤教她的。
@return

# prologue_t_hina2
hina[normal]: 下一次是五点。五下。
hina[normal]: 七濑先生要是有空，可以一起数。
@return

# prologue_t_kurokawa
@if prologue_met_kurokawa -> prologue_t_kurokawa2
kurokawa[normal]: 七濑少爷。
ritsu: 少爷就免了吧。
kurokawa[smile]: 九年前，鄙人就是这么称呼您的。改不过来了。
: 老人又笑了，银色的牙冠一闪。他的手指被烟熏得发黄，指缝里夹着半截「和平」。
ritsu: 黑川先生，九年前那一晚，您也在宅子里吧。
kurokawa[normal]: 是。
ritsu: 您还记得什么吗？
kurokawa[normal]: ……
kurokawa[normal]: 人老了，很多事都记不清了。
kurokawa[normal]: 鄙人只记得，那天夜里风很大。
> 风很大。
> 我想不起来的东西，他说得这么轻松。
kurokawa[normal]: 请您好好休息。这座岛……夜里很吵。乌鸦会叫一整夜。
@set prologue_met_kurokawa
@return

# prologue_t_kurokawa2
kurokawa[normal]: 五点的船。鄙人收拾好就走。
kurokawa[smile]: 七天后，船夫会来接各位的。
@return

# prologue_t_genzou
@if prologue_met_genzou -> prologue_t_genzou2
genzou[angry]: 七濑！你来得正好。
genzou[angry]: 你是侦探，你说说，那封信是谁写的？
ritsu: 现在还什么都不知道。
genzou[angry]: 废物！你老子当年可比你利索！
genzou[normal]: ……哼。我告诉你，这座岛明年就要变成酒店。高尔夫球场、游艇码头，什么都会有。
genzou[normal]: 鸦天狗？童谣？那些发霉的东西，我会一样一样铲平。
genzou[dark]: 谁想用死人来吓唬我，就让他试试看。
@set prologue_met_genzou
@return

# prologue_t_genzou2
genzou[angry]: 还杵在这儿干什么？去查啊！
@return

# prologue_t_shizuka
@if prologue_met_shizuka -> prologue_t_shizuka2
: 御堂在餐桌边慢慢踱步，看着每一张名牌，像在看一份病历。
shizuka[normal]: 七濑君。你看这座次。
shizuka[normal]: 会长坐在长桌中间，不是主位。主位空着。
ritsu: 留给「主人」的？
shizuka[normal]: 或者留给一个死人。
shizuka[normal]: 会长看了一定会发脾气。他这个人，坐不惯别人安排的位子。
@set prologue_met_shizuka
@return

# prologue_t_shizuka2
shizuka[normal]: 我不喜欢这个房间。太多眼睛了。
: 她看的是壁炉上那幅画满乌鸦的油画。
@return

# prologue_t_shiori
@if prologue_met_shiori -> prologue_t_shiori2
: 牌桌边，一个穿燕尾服的女人正对着空气洗牌。她的衣服上缀满了亮片，一动就闪闪发光。
shiori[smile]: 女士们先生们～欢迎光临！
shiori[smile]: 哎呀，观众只有一位？没关系，一位也是观众！
ritsu: ……你是？
shiori[smile]: 柊诗织！艺名「希尔维亚」，魔术师！
shiori[smile]: 你就是侦探君吧？来来来，帮我抽一张牌。
: 律抽出一张。黑桃七。
shiori[smile]: 记住了吗？好，放回去——
: 柊把牌洗了几遍，往桌上一拍，然后张开双手，掌心朝上，慢慢抬起。
@se select
: 一张牌从牌堆顶上浮了起来。
: 它悬在半空，跟着她的手指轻轻旋转。翻过来——黑桃七。
ritsu: ……
shiori[smile]: 怎么样怎么样？吓到了吧？
ritsu: 线。
shiori[surprise]: 诶？
ritsu: 你的两只手之间，有一根很细的线。刚才牌转过来的时候，反了一下光。
shiori[sad]: 哎呀呀……侦探君，你这样会被魔术师讨厌的哦。
shiori[smile]: 不过，答对了！奖励你看看真货～
: 柊从桌角一只描着金边的黑色道具箱里拿出一卷线轴，抽出一截，在指间绷直。不仔细看，几乎什么都看不见。
shiori[smile]: 这叫「幻线」。极细的透明尼龙线，舞台灯一照就消失。
shiori[smile]: 别看它细，比钓鱼线还结实哦～吊起一只鸟笼都没问题。
ritsu: 那个箱子里全是道具？
shiori[smile]: 绳子、扣环、假花、鸽子……鸽子这次没带。魔术师的全部家当！
shiori[normal]: 九年前我也来过这座岛哦。那时候我十七岁，是师父的助手。
shiori[normal]: 师父叫月岛幻斋，在老家主的寿宴上表演了「飞人」。
shiori[sad]: ……三年前，他在水箱逃脱的表演里出了意外。
shiori[smile]: 好啦，不说这个！侦探君，下次可不许再拆穿我了～
@set prologue_met_shiori
@note shiori 魔术师「希尔维亚」。衣服缀亮片，爱说「女士们先生们～」，称律「侦探君」。会用透明的「幻线」让扑克牌浮空，道具箱放在交谊厅牌桌角落。
@return

# prologue_t_shiori2
shiori[smile]: 侦探君，要不要学一个魔术？学会了可以哄女孩子哦～
shiori[smile]: 你家那位白手套的助手小姐，看起来很好哄的样子。
@return

# prologue_t_kyosuke
@if prologue_met_kyosuke -> prologue_t_kyosuke2
kyosuke[smile]: 哟，侦探小弟。这里的酒柜不错哦，老头子藏的好货全在这儿。
kyosuke[normal]: 你说，那个写信的人……到底想干什么？
ritsu: 你害怕？
kyosuke[shock]: 谁、谁害怕了！
kyosuke[sad]: ……就是觉得这宅子阴森森的。九年前的事，我那时候才十五岁，什么都不知道。
kyosuke[smile]: 喝酒喝酒。喝醉了就什么都不怕了。
@set prologue_met_kyosuke
@return

# prologue_t_kyosuke2
kyosuke[smile]: 七天啊……七天够我把这个酒柜喝空了。
@return

# prologue_t_kuga
@if prologue_met_kuga -> prologue_t_kuga2
kuga[smile]: 啊，七濑君。请恕敝人坐着说话，这个腰……
kuga[normal]: 椎间盘的老毛病了。医生说，十公斤以上的东西一概不能提。连自己的行李都得麻烦黑川先生。
kuga[normal]: 说起来，敝人收到的信上，提到了千鹤小姐的「遗嘱」。
ritsu: 遗嘱？
kuga[smile]: 哈哈，具体内容属于保密义务的范围，恕敝人无可奉告。
kuga[think]: 只是……一个十七岁的少女，会立什么遗嘱呢。
@set prologue_met_kuga
@return

# prologue_t_kuga2
kuga[smile]: 无论发生什么，请记住：一切都要讲证据。这是法治的根本。
@return

# prologue_t_kurata
@if prologue_met_kurata -> prologue_t_kurata2
kurata[smile]: 哟，小哥！来参观厨房？
: 仓田已经系上了围裙，正把帆布包里的刀一把把取出来，吸到墙上的磁铁刀架上。
kurata[smile]: 你看你看，我的宝贝们！从剁骨刀到削皮的小刀，一共八把，一把都不能少！
kurata[smile]: 刀是厨子的命根子。少了一把，我就跟少了根手指似的。
ritsu: 九年前，您也在这个厨房？
kurata[normal]: 是啊。老家主的寿宴，一百多号人的菜，全是我一个人张罗的。
kurata[normal]: 那天晚上……
: 他手里的刀停了一下。
kurata[sad]: ……那天晚上真是忙坏了。忙得什么都顾不上。
kurata[smile]: 哎，不说这个！今晚我做鲷鱼饭，再给大家烤个布丁。
kurata[smile]: 还有，明早的饭团我今晚就捏好，放食品柜里。谁饿了半夜来拿，别客气——不过别全拿光啊！
@set prologue_met_kurata
@note kurata 九年前在月蚀馆当主厨。带来一套八把的菜刀，「一把都不能少」。说今晚会把明早的饭团捏好放进食品柜。
@return

# prologue_t_kurata2
kurata[smile]: 小哥，偷吃可不行哦！布丁要等晚饭后才有！
kurata[smile]: ……不过你那个白手套的助手已经来问过三次了，哈哈！
@return

# prologue_t_usami
@if prologue_met_usami -> prologue_t_usami2
: 宇佐见站在东翼走廊中间，一手拿着卷尺，一手拿着制图笔，正在记录什么。
usami[normal]: 啊，七濑先生。您来得正好，我正想找人说说。
usami[smile]: 您注意到了吗？这条走廊，窗在左手边，客房门在右手边。
ritsu: 嗯。窗外是海。
usami[smile]: 西翼也一样——不过是反过来的。
usami[normal]: 宅子荒废的那些年，一场火灾把西翼烧掉了。去年重建的时候，会长要求「和东翼一模一样」。
usami[smile]: 所以我做的是一个完美的镜像。以大厅为轴，左右对称，分毫不差。
usami[normal]: 东翼走廊的窗在左手，西翼走廊的窗在右手。东翼客房的电灯开关在门的右侧，西翼就在左侧。
usami[normal]: 房间号也相同：东1到东6，西1到西6。连地下酒窖的楼梯都是对称的——两道楼梯，一道通东翼，一道通西翼。
ritsu: 走进去会分不清自己在哪边吧。
usami[smile]: 正是！这就是镜像的美妙之处。闭着眼睛走进去，睁开眼——你根本不知道自己在镜子的哪一边。
usami[think]: 当然，如果注意窗户的位置，就能分辨。大多数人不会注意的。
@set prologue_met_usami
@note usami 骄傲地讲解西翼：去年按东翼「镜像」重建，左右完全对称，房间号相同。东翼走廊窗在左、西翼在右；东翼开关在门右侧、西翼在左侧。
@return

# prologue_t_usami2
usami[normal]: 还有那座塔。我父亲以前负责过它的修缮。
usami[think]: ……不过那是很久以前的事了。
@return

# prologue_t_fuwa
@if prologue_met_fuwa -> prologue_t_fuwa2
: 不破在走廊尽头，一扇窗一扇窗地推，确认插销是否牢靠。
fuwa[normal]: 职业病。
fuwa[normal]: 保安得知道哪扇窗能开，哪扇门能锁。
ritsu: 发现了什么？
fuwa[normal]: 窗都是好的。门锁是旧的，一根铁丝就能捅开。
fuwa[dark]: ……小鬼。你真觉得九年前的案子结了？
ritsu: 什么意思？
fuwa[normal]: 没什么意思。
: 他把牙签吐进口袋里的手帕，又叼上一根新的，转身走了。
@set prologue_met_fuwa
@return

# prologue_t_fuwa2
fuwa[normal]: 晚上锁好门。
@return

# prologue_t_mio
@if prologue_met_mio -> prologue_t_mio2
: 澪在中庭的屋檐下支起了画架，正在画布上打底。灰色、紫色，一层一层地铺开，像在画天空的阴影。
mio[normal]: ……律君。
mio[smile]: 你看，从这里看塔，角度最好。钟面、三楼的窗户、塔顶的瞭望台，全都在画框里。
ritsu: 你要画塔？
mio[normal]: 嗯。不过不是现在。
mio[normal]: 我想画夜里的塔。月光照在钟面上，窗户里亮着一点灯……
mio[sad]: 千鹤以前说过，夜里的鸦之塔最好看。像一根点着的蜡烛。
mio[normal]: 这几天都是阴天。要是有一个晚上能放晴就好了。
ritsu: 你和千鹤小姐……
mio[smile]: 我们是在这个中庭认识的。我八岁，她十二岁。她拿温室里的花送给我。
mio[sad]: ……后来温室就没有了。
@set prologue_met_mio
@note mio 想画「夜里的鸦之塔」，在中庭屋檐下架起画架。千鹤说过「夜里的塔最好看，像一根点着的蜡烛」。
@return

# prologue_t_mio2
mio[normal]: 乌鸦又在叫了。
mio[normal]: 律君，你听，它们叫的时候，像不像在数数？
@return

# prologue_t_kiryu
@if prologue_met_kiryu -> prologue_t_kiryu2
: 桐生靠在喷泉边抽烟，对着塔的方向举起相机，咔嚓按了一下。
kiryu[smile]: 名侦探，给你讲个鬼故事？
ritsu: 你在书里写过的那些？
kiryu[smile]: 哟，看过《宵鸦岛怪谈考》？卖得可不怎么样。
kiryu[normal]: 这座岛上的人，从前相信「鸦天狗」。长着乌鸦脑袋的天狗，专门审判罪人。
kiryu[normal]: 每年八月有个「飞鸦祭」。你抬头看——
: 他用烟头指向天空。那条细细的黑线从山丘上斜拉下来，一直连到塔顶。
kiryu[normal]: 那是缆索。山上的神社是起点，塔顶的铁环是终点。
kiryu[normal]: 祭典那天，岛民把稻草扎的乌鸦挂在滑车上，从神社放下去，「嗖」地一下飞到塔顶。意思是鸦天狗降临，要开始审判了。
kiryu[normal]: 渔村废了以后，祭典也没了。鹭宫家今年把缆索换成了新钢缆，大概想重办祭典，招揽游客。
kiryu[dark]: 还有一首童谣。「七鸦之歌」。七只乌鸦，一只接一只地死掉。
ritsu: 怎么唱？
kiryu[normal]: 词我采访到了。调子没有。
kiryu[normal]: 我问遍了岛上剩下的老人，没一个记得旋律。会唱的人，大概都死光了。
> ……调子没有人记得。
@set prologue_met_kiryu
@note kiryu 讲了鸦天狗与飞鸦祭的传说：缆索从神社拉到塔顶铁环，今年换了新钢缆。还提到童谣「七鸦之歌」——「词采访到了，调子没人记得。」
@return

# prologue_t_kiryu2
kiryu[smile]: 七只乌鸦，我们有十四个人。你说，够不够分？
@return

# prologue_t_shio
@if prologue_met_shio -> prologue_t_shio2
: 汐站在中庭中央，仰头望着鸦之塔，望得出神。
ritsu: 汐？
shio[surprise]: ……啊，律君。
shio[normal]: 你说，从塔顶往下看，能看到什么呢？
ritsu: 海吧。还有这个中庭。
shio[think]: 嗯……还有温室。
: 她的视线从塔顶缓缓落下，落在那片锈蚀的铁骨架上，停住了。
shio[smile]: ——好啦！我已经和画家小姐、记者先生打过招呼了。律君呢？
shio[smile]: 偷懒的侦探可是会被扣工资的～
@set prologue_met_shio
@return

# prologue_t_shio2
shio[smile]: 嗯～哼哼～
: 汐又在哼着什么。律还没听清，她就停下了。
shio[smile]: 律君，快去打招呼啦。
@return

# prologue_t_kotone
@if prologue_met_kotone -> prologue_t_kotone2
kotone[angry]: ……又是你。
: 琴音坐在喷泉边，把琴盒抱在膝上，像抱着一只受惊的猫。
kotone[normal]: 这里湿气太重了。琴会走音的。
ritsu: 你是来演出的？
kotone[normal]: 信上说，酒店开业要请我演奏。报酬是平时的三倍。
kotone[think]: ……我妈妈以前在这里当过女佣。九年前。
kotone[normal]: 她去年冬天死了。所以我想来看看，她工作过的地方是什么样子。
kotone[angry]: 就这样。没什么好说的。别同情我。
@set prologue_met_kotone
@return

# prologue_t_kotone2
kotone[normal]: 侦探。你身边那个戴手套的，吵死了。管管她。
@return

# prologue_tour_end
@bg dock
@bgm sad
@caption 17:00 码头
@se wave
: 五点。天色暗得比平时早。云层压得很低，海面是铅灰色的。
: 渡船的引擎已经发动了。黑川提着一只小小的旅行箱，站在船尾。
kurokawa[normal]: 各位，鄙人就此告辞。
kurokawa[normal]: 食品柜和酒窖里的东西，足够各位用上七天。房间的备用钥匙在大厅的钥匙箱里。
genzou[angry]: 黑川！你给我说清楚，主人到底是谁！
kurokawa[smile]: ……七天后，各位自然会知道。
: 老人深深地鞠了一躬。再抬起头时，他咧嘴笑了，臼齿上的银冠在暮色里亮了一下。
boatman: 开船喽——
@se wave
: 船缓缓离开码头。黑川站在船尾，朝岸上挥手。
: 他嘴里叼着一支烟。船越走越远，人影越来越小，只剩下那一点橙红色的火光，在灰色的海面上一明一灭。
shio[normal]: ……走了呢。
ritsu: 嗯。
shio[think]: 七天。
: 汐把手插进开衫的口袋，望着远去的船，很久没有说话。
: 那一点火光终于消失在海平线上。
: 不知哪里传来一声乌鸦的啼叫。接着是第二声、第三声。整座岛的乌鸦都叫了起来。
@fade out
@wait 600
@bg dining
@fade in
@bgm calm
@caption 19:00 月蚀馆·餐厅
: 晚餐七点开始。长桌上点起了一排蜡烛，仓田的鲷鱼饭冒着热气。
: 会长最后一个走进餐厅。他扫了一眼桌上的名牌，脸色立刻沉了下来。
genzou[angry]: 这是谁排的座位？
kurata[normal]: 呃……黑川先生走之前摆好的。
genzou[angry]: 让我坐在中间？主位空着留给谁？给那个「主人」？
: 他一把抓起桌上的名牌，揉成一团，扔进了壁炉。
genzou[angry]: 这是我的宅子。座位我来排！
genzou[normal]: 我坐主位。雏，坐我左边。
hina[normal]: 是，叔父大人。
genzou[angry]: 恭介！你一身酒气，滚到末席去！
kyosuke[sad]: 我……我只喝了一点……
genzou[angry]: 滚！
: 恭介缩着脖子，端着自己的盘子挪到了长桌最远的一端。
genzou[normal]: 其他人随便坐。
: 众人面面相觑，各自找了位子。律和汐坐在长桌中段，对面是澪和琴音。
shizuka[normal]: ……果然。
> 御堂医生下午就说过。会长坐不惯别人安排的位子。
@show shio[smile] C
shio[smile]: 律君律君，布丁！仓田先生的布丁！
ritsu: 那是饭后甜点。
shio[smile]: 甜点就是要先吃才好吃嘛～
kurata[smile]: 哈哈哈！小姑娘有眼光！来，先给你一个！
: 汐戴着白手套捧起布丁，吃得眉开眼笑。
@hide
: 晚餐的气氛并不坏。仓田一刻不停地讲笑话，柊变了两个小魔术，连琴音都被逗得撇了撇嘴。
: 只有会长一直沉着脸，一杯接一杯地喝着白兰地。雏坐在他身边，安静地把鱼刺一根一根挑出来。
: 窗外，雨还没有下。云层里偶尔透出一点暗淡的月光。
@wait 400
@caption 21:00 餐厅
@se bell
: 远处传来塔钟的声音。
hina[normal]: ……一。二。三。
: 雏放下筷子，小声地数着。
hina[normal]: 四。五。六。七。八。
hina[normal]: 九。
: 第九声的余音还没散尽——
@se clock
: 餐厅角落里响起「咔哒」一声。
: 紧接着是机械转动的声音。那台老式放映机自己转了起来，胶片盘吱吱作响，一束白光打在墙上。
kurata[surprise]: 诶？谁开的？
kyosuke[shock]: 不、不是我！
@se thunder
: 幕布「哗」地一声自己落了下来。
@bgm horror
@filter dark
: 白光中出现了一个人影。
: 黑色的兜帽，黑色的长袍。脸上戴着一张乌鸦面具，尖长的喙，眼孔里透着红光。
judge: 晚上好，各位。
: 声音经过了变声器处理，忽高忽低，像金属在刮玻璃。
judge: 欢迎来到宵鸦岛。我是判官。
judge: 首先，请允许我为各位献上一首歌。
@bgm stop
@wait 400
: 影片里响起了旋律。
: 一段很简单的旋律，像摇篮曲。缓慢地升上去，又缓慢地落下来。
@poem 一只乌鸦锁进笼，月光照不到它的胸。\n两只乌鸦争一面镜，镜中谁是真的影。\n三只乌鸦飞上塔，脚下没有回家的沙。\n四只乌鸦烧去脸，灰烬里面埋着谁的名。
@poem 五只乌鸦自啄心，罪人原来是自己。\n六只乌鸦围成圈，审判之火点燃天。\n七只乌鸦只剩一只，它在雾里唱着歌——\n　　等那个说谎的孩子。
@se heartbeat
> ……这个旋律。
> 最后一个音拖得很长，像在等谁回答。
> 是汐在船上哼的那首歌。
: 律转过头。
: 汐坐在他身边，一动不动地盯着幕布。烛光照着她的侧脸，看不出任何表情。
kiryu[shock]: ……七鸦之歌。
kiryu[shock]: 调子……居然还有人会唱调子……
@bgm judge
judge: 七只乌鸦，将依次坠落。
judge: 在那之前，让我宣读各位的罪状。
judge: 坐在主位上的鹭宫玄藏。你在那个夜晚，亲手熄灭了白鹭的生命。
genzou[angry]: 什——
judge: 被父亲赶到末席的鹭宫恭介。你碾碎了一个女孩的人生，又让别人替你坐牢。
kyosuke[shock]: ……！
judge: 御堂静香。你篡改了死亡的时刻。
judge: 不破刚。你用拳头写下了供词。
judge: 桐生冬马。你用文字把一个无辜的人钉上了十字架。
judge: 久我莲。你出卖了你的委托人——不止一次。
judge: 柊诗织。你搬运了伪造的足迹。
judge: 宇佐见京。你知道那道栏杆为什么被换掉，却保持沉默。
judge: 仓田豪。那杯茶里放了什么，你心里清楚。
judge: 千早澪。你那晚看见了，却选择了遗忘。
judge: 真白琴音。你的琴弦，是用谎言买来的。
judge: 鹭宫雏。你什么都不知道——这就是你的罪。
judge: 雨宫汐。你在追逐一个说谎者。
judge: 最后——七濑律。
@se heartbeat
judge: 说谎的孩子。你的推理杀死了一个人。
@shake
: 餐厅里没有人出声。只有放映机的胶片盘在吱吱地转。
judge: 接下来，是这座岛上的规则。
@poem 一、七天后，渡船才会回来。\n二、每当有乌鸦坠落，全员须在指定时刻到审判厅集合，指认凶手。\n三、多数票指认正确：凶手关入鸦笼，交给七天后到来的警察。
@poem 四、指认错误：真凶将独自乘第七天的船离开。其余所有人，永远留在这座岛上。\n五、第七天，判官将公开「九年前的真相」。
judge: 鸦天狗在看着你们。
judge: 那么——祝各位，有一个漫长的夏天。
@se crash
: 胶片「啪」地一声跑到了尽头，白光闪了几下，熄灭了。
@filter none
@bgm tension
genzou[angry]: 开灯！开灯！
@se ok
: 仓田摸到墙边打开了吊灯。昏黄的光重新照亮了餐厅。每一张脸都是白的。
kotone[shock]: 什么……什么罪状……
kuga[sad]: 这、这是诽谤。毫无根据的诽谤……
shiori[shock]: ……伪造的足迹？我、我可不知道什么……
kurata[sad]: ……
: 仓田低着头，双手在围裙上来回地擦，像要擦掉什么看不见的东西。
mio[sad]: ……看见了……却选择了遗忘……
hina[normal]: 七濑先生。
hina[normal]: 「说谎的孩子」，是什么意思？
ritsu: ……
> 我回答不了。
> 心脏跳得很快。不是因为恐惧——是因为别的什么。像是有人用手指，在一道早已愈合的伤口上，轻轻按了一下。
: 律站起身，走向角落里的放映机。
> 先看看这台机器。它为什么会在九点整自己转起来。
: 放映机的电源线没有插在墙上，而是接进了一只白色的小盒子——一只机械定时器。刻度盘上，指针停在「21:00」。
> 下午看到的白色盒子，原来是这个。
> 只要事先装好胶片，拨好时间，到了九点，电源接通，放映机就会自己转起来。
@get prologue_timer
: 胶片盘上的片子已经全部转完了。律把片头抽出来对着灯看——黑色的兜帽，乌鸦的面具，一格一格，一模一样。
@get prologue_film
genzou[angry]: 七濑！你在那儿磨蹭什么！
genzou[angry]: 这是外人的恶作剧！岛上还藏着别人！
genzou[angry]: 黑川那个老东西，还有那个什么「主人」——他们想吓唬我，想把我从自己的岛上赶走！
kiryu[smile]: 外人？会长，这岛上除了我们十四个，就只剩乌鸦了。
genzou[angry]: 那就去找！把宅子翻过来也要找出来！
fuwa[normal]: ……先坐下。
fuwa[normal]: 小鬼。你看出什么了。
ritsu: 有几件事，可以先确认一下。
> 会长认定这是「外人」闯进来搞的恶作剧。
> 这个说法，有什么地方和我刚才看到的东西对不上？
@show shio[smile] C
shio[smile]: 律君，要开始了吗？「侦探的时间」～
shio[normal]: 我来帮你整理一下规则吧，这可是助手的工作。
: 【审判须知·练习】众人的发言中，会有被高亮的「弱点」。
: 从侦探手账里选出一件证据，射向与它矛盾的那个弱点，就能击破对方的说法。
: 选错了也不要紧，只会损失一点「信念」。信念会慢慢恢复，提示也会出现。
shio[smile]: 简单来说，就是「用证据说话」～律君最擅长的事！
@hide
@bgm debate
@game prologue_g1
@bgm tension
@shout ritsu 不对！
ritsu: 放映机不是被人开的。
ritsu: 它的电源接在一只定时器上，指针拨在九点。只要事先装好胶片、调好时间，到了九点就会自己启动。
ritsu: 不需要任何人躲在餐厅里。所以「刚才有人溜进来开了机器」这个说法不成立。
genzou[angry]: ……那、那又怎么样！
genzou[angry]: 那就说明是早就布置好的！一个跟我们毫不相干的疯子，随便编些罪名，录好了片子来吓唬人！
> 跟我们「毫不相干」……真的是这样吗？
> 影片里有一句话，从我听到的那一刻起就一直卡在心里。
@game prologue_g2
@shout ritsu 请看这个！
ritsu: 影片里，判官叫会长「坐在主位上的鹭宫玄藏」，叫恭介先生「被父亲赶到末席的鹭宫恭介」。
ritsu: 可是黑川先生摆好的名牌上，主位是空着的。会长坐在长桌中间，恭介先生就在旁边。
ritsu: 是会长自己，在今晚七点走进餐厅以后，才撕掉名牌、重新排的座位。
kyosuke[shock]: ……对、对啊！我是被老爸当场赶过来的！
genzou[shock]: ……
ritsu: 影片是事先录好的。录的时候，判官就已经知道——会长看到那样的座次一定会发火，一定会自己坐上主位，一定会把恭介先生赶到末席。
shizuka[normal]: 我下午就说过。会长坐不惯别人安排的位子。
shizuka[normal]: 了解会长的人，都猜得到。
ritsu: 判官不是随便找个由头吓唬人的疯子。
ritsu: 判官调查过我们每一个人。性格、过去、九年前那个夜晚……了解得非常仔细。
kiryu[dark]: 了解我们每一个人的家伙……还真是个让人睡不着觉的结论。
genzou[angry]: ……哼！
genzou[angry]: 一派胡言！什么罪状，什么九年前！我不吃这一套！
: 会长把酒杯往桌上重重一放，转身走出了餐厅。雏抱着人偶，默默地跟了上去。
@bgm mystery
fuwa[normal]: ……无线电室。
ritsu: 什么？
fuwa[normal]: 宅子里有一台电台。黑川下午提过。能和本岛联系的，只有那个。
fuwa[normal]: 走。
@bg service_nook
@caption 21:40 佣人通道·无线电室
: 无线电室在本馆一楼拐角的佣人通道尽头，是一间堆满杂物的小屋。
: 不破推开门，手电筒的光照了进去。
@se glass
: 脚下咔嚓一声。是碎玻璃。
: 架子上那台老式电台被砸得粉碎。外壳凹进去一大块，真空管碎了一地，天线被齐根剪断。
fuwa[dark]: ……
ritsu: 修得好吗？
fuwa[normal]: 修不好。
: 不破蹲下来，用手指抹了一下碎片。指尖上沾了一层薄薄的灰。
fuwa[normal]: 有灰。不是今晚砸的。
fuwa[normal]: 至少一两天了。
ritsu: 一两天前……那时候，岛上只有黑川先生。
fuwa[normal]: 嗯。
fuwa[dark]: 也可能还有别人。
@get prologue_radio
> 渡船已经走了。电台被砸了。岛上没有电话线。
> 七天。我们被关在了这座岛上。
@bg dock
@weather rain
@bgm island
@caption 22:00 码头
@se thunder
: 雨下起来了。
: 律和不破站在码头上。海面一片漆黑，什么也看不见。浪一下一下地拍着石阶。
fuwa[normal]: 船不会回来了。七天之内。
fuwa[normal]: 明天天一亮，我把全岛搜一遍。
ritsu: 不破先生。
fuwa[normal]: 嗯。
ritsu: 影片里说，你「用拳头写下了供词」。
fuwa[normal]: ……
: 不破没有回答。雨水顺着他的眉骨往下流，流过那道旧疤。
fuwa[normal]: 回去吧，小鬼。
fuwa[normal]: 锁好门。
@hide
@bg east_room
@filter night
@caption 22:30 东翼·东6号室
: 房间收拾得很干净。床单雪白，枕头蓬松，窗外是黑沉沉的海。
: 律坐在床边，脱下外套。口袋里的两封信沉甸甸的。
: 他掀开被子时，枕头下露出了一角黑色。
@se heartbeat
: 一只黑色的信封。没有署名，没有邮戳。
: 里面只有一张卡片。卡片上只写着四个字。
@letter 说谎的孩子
@get prologue_letter
: 走廊里传来一声尖叫，接着是开门声、脚步声、有人在骂。
: 每一个房间的枕头下面，都放着一封同样的黑色信封。
> 每个人的信上，写的大概都是影片里的罪状。
> 只有我的信，只写了这四个字。
> ……说谎的孩子。
> 我说了什么谎？
: 律把卡片翻过来。背面是空白的。
: 他又把它翻回来，看了很久。
@se knock
: 有人敲门。
shio: 律君……还没睡吧？
@bgm sad
: 汐抱着枕头站在门口，头发披散着，换上了浅色的睡衣。手上依然戴着那双白手套。
shio[sad]: 我的枕头下面也有一封。
shio[smile]: 一个人待着有点……嗯，就是有点。可以借我坐一会儿吗？
ritsu: ……进来吧。
: 汐没有坐椅子，而是爬上了窗台，抱着膝盖坐在那里。窗外是雨，是海，是看不见的黑暗。
shio[normal]: 「你在追逐一个说谎者」。
shio[smile]: 我的罪状。说的是律君吧？
ritsu: 大概。
shio[smile]: 那律君的呢？
: 律把卡片递给她。汐看了一眼，没有说话，又把它还了回来。
ritsu: 汐。
shio[normal]: 嗯？
ritsu: 影片里的那首歌。你在船上哼过。
shio[surprise]: ……诶？
shio[think]: 我哼的是那首吗？……我自己都没注意。
shio[smile]: 也许是在哪里听过吧。摇篮曲嘛，调子都长得差不多～
> 桐生说，岛上已经没有人记得那首歌的调子了。
> 那她是在哪里听到的？
shio[smile]: 律君，你现在的表情好可怕。像在审问犯人。
ritsu: ……抱歉。
shio[smile]: 没关系～侦探先生就是要怀疑所有人嘛。包括助手。
: 她把下巴搁在膝盖上，望着窗外。雨点打在玻璃上，一道一道地往下流。
: 远处，鸦之塔的轮廓在云层下若隐若现。
shio[normal]: ……律君。
shio[normal]: 九年前的推理……你相信它吗？
@bgm stop
@wait 600
ritsu: ……当然。
: 汐转过头来看着他。
: 她笑了笑。那是律从没见过的一种笑——很轻，很远，像隔着一层玻璃。
shio[smile]: 嗯。
shio[smile]: 那就好。
: 她又转回去，望着窗外的雨。
: 然后，她轻轻地哼起了那首歌。
@bgm sad
: 一段很简单的旋律，像摇篮曲。缓慢地升上去，又缓慢地落下来。
: 最后一个音拖得很长，像在等谁回答。
> 我没有回答。
> 我闭上眼睛，听着雨声和歌声，想起了那个总在夏天出现的梦。
> 羽毛。一只手。还有一个声音——
@fade out
@poem 一只乌鸦锁进笼，月光照不到它的胸。
@wait 400
@chapterend
`
});
