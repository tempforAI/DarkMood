/* 结局注册表 —— @ending <id> 引用这里的条目
 * type: 'BE'（坏结局）| 'HE'（好结局）；trueEnd: true 表示真结局
 * no: 结局编号（结局一览中的顺序）；hint: 未达成时在结局一览中显示的提示
 *
 * 分歧点一览（剧本位置）：
 *   be_ch1      ch1  投票前 @choice（ch1_name_mio / ch1_be_silence）
 *   be_ch2      ch2  围攻久我、ch2_g2 之前 @choice（ch2_trial_doubt / ch2_be_mirror）
 *   be_ch4      ch4  章末东6号室 @choice（ch4_go_on / ch4_be_ashes）
 *   be_ch5      ch5  不破搬出律的证词时 @choice（ch5_doubt_self / ch5_be_heart）
 *   be_ch6_lie  ch6  最终投票 ch6_g13 之前 @choice（ch6_admit / ch6_be_lie）
 *   be_ch6_fire ch6  ch6_g15 之前 @if !has:ch6_genji_letter（可选证据：小屋木箱的暗格，须调查两次）
 *   he_ch6      ch6  尾声末（默认）
 *   te_ch6      ch6  尾声末：has 笔记本 + 照片 + 源治的信，且 bond:shio>=3（汐的三个自由时间事件全部看过）
 */
(function (root) {
  var DM = root.DM = root.DM || {};
  DM.ENDINGS = {
    be_ch1: {
      no: 1, type: 'BE', title: '沉默的笼子',
      desc: '律在投票前收回了自己的推理。无辜的恭介被关进鸦笼，澪抱着她的画，独自走上了跳板。',
      hint: '第一章的投票之前，你选择了相信什么？'
    },
    be_ch2: {
      no: 2, type: 'BE', title: '镜中的替罪羊',
      desc: '律顺着整整齐齐的线索点了头。久我入笼，琴音的复仇，一丝不差地照着她的计划完成了。',
      hint: '第二章的审判上，所有人都指向同一个人。你也指向他了吗？'
    },
    be_ch4: {
      no: 3, type: 'BE', title: '灰烬里的名字',
      desc: '律合上了汐的笔记本。三个疑点再也无人追查，最后一夜的审判厅在雾中独自燃烧。',
      hint: '第四章的最后，失去了她的你，还愿意继续追查吗？'
    },
    be_ch5: {
      no: 4, type: 'BE', title: '自啄之心',
      desc: '律相信了自己的耳朵。御堂之死被判为自杀，凶手走出了审判厅——罪人，原来是自己。',
      hint: '第五章，当你自己的证词挡在推理前面的时候……'
    },
    be_ch6_lie: {
      no: 5, type: 'BE', title: '说谎的孩子',
      desc: '律拒绝承认九年前的谎言。审判之火围成了圈，说谎的孩子到最后，也没有说出真相。',
      hint: '终章，判官要你亲口说出那一句话。'
    },
    be_ch6_fire: {
      no: 6, type: 'BE', title: '审判之火',
      desc: '律找不到能让她放下打火机的那句话。那封信，一直静静地躺在小屋木箱的暗格里。',
      hint: '终章的搜查里，有一样东西，要再看一次才找得到。'
    },
    he_ch6: {
      no: 7, type: 'HE', title: '雾散之后',
      desc: '律推翻了自己的推理，小夜放下了打火机。雾散了，那个孩子说出了真相。',
      hint: '在最后的审判里，找到能让她放下打火机的那句话。'
    },
    te_ch6: {
      no: 8, type: 'HE', trueEnd: true, title: '乌鸦飞走的早晨',
      desc: '三年后的八月，两个孩子终于一起看见了鸦之星。而一封来自雪国的信，正在路上。',
      hint: '也许，你还不够了解汐。——在她还在的日子里，多陪陪她吧。'
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = DM;
})(typeof window !== 'undefined' ? window : globalThis);
