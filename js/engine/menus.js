/* 菜单：标题画面、系统菜单、存读档、设置、侦探手账、对话记录、章节选择、片尾 */
(function () {
  'use strict';
  var DM = window.DM, Core = DM.Core, St = DM.State, R = DM.Render, UI = DM.UI, I = DM.Interp;
  var el = Core.el;
  var M = DM.Menus = {};
  var stack = [];

  function layer() { return UI.layers.menu; }
  function panel(title) {
    var L = layer(); L.classList.remove('hidden');
    var p = el('div', 'panel', L);
    p.addEventListener('click', function (e) { e.stopPropagation(); });
    var hd = el('div', 'hd', p);
    el('h2', '', hd, title);
    var tools = el('div', 'tabs', hd);
    el('div', 'sp', hd);
    var x = el('button', 'btn small', hd, '关闭 ✕');
    x.addEventListener('click', function () { DM.Audio.se('select'); M.closeTop(); });
    var bd = el('div', 'bd', p);
    stack.push(p);
    return { p: p, hd: hd, tools: tools, bd: bd };
  }
  M.closeTop = function () {
    var p = stack.pop();
    if (p && p.parentNode) p.parentNode.removeChild(p);
    if (!stack.length) layer().classList.add('hidden');
  };
  M.closeAll = function () { while (stack.length) M.closeTop(); };

  // ---------- 系统菜单 ----------
  M.openSystem = function () {
    if (!St.s) return;
    var P = panel('菜单');
    P.p.style.left = '300px'; P.p.style.right = '300px';
    var box = el('div', '', P.bd); box.style.cssText = 'display:flex;flex-direction:column;gap:10px;padding:10px 30px';
    [['存档', M.openSave], ['读档', M.openLoad], ['侦探手账', M.openNotebook], ['对话记录', M.openLog], ['设置', M.openSettings],
     ['回到标题', function () { confirmBox('回到标题画面？未保存的进度会丢失（自动存档仍在）。', M.toTitle); }]].forEach(function (it) {
      var b = el('button', 'btn', box, it[0]);
      b.addEventListener('click', function () { DM.Audio.se('select'); it[1](); });
    });
  };

  function confirmBox(text, yes) {
    var P = panel('确认');
    P.p.style.cssText += ';left:240px;right:240px;top:170px;bottom:170px';
    el('p', '', P.bd, text).style.fontSize = '19px';
    var f = el('div', 'g-foot', P.bd);
    var y = el('button', 'btn gold', f, '确定');
    var n = el('button', 'btn', f, '取消');
    y.addEventListener('click', function () { M.closeTop(); yes(); });
    n.addEventListener('click', function () { M.closeTop(); });
  }

  // ---------- 存读档 ----------
  function slotInfo(d) {
    if (!d) return null;
    var m = d.meta || {};
    return (St.CHAPTER_NAMES[m.chapter] || m.chapter || '') + (m.place ? '　' + m.place : '') + (m.caption ? '　' + m.caption : '');
  }
  M.openSave = function () {
    if (!I.resume || !St.s) return;
    var P = panel('存档');
    var list = el('div', 'save-list', P.bd);
    for (var i = 1; i <= St.SLOTS; i++) (function (i) {
      var d = St.read(i);
      var row = el('div', 'save-slot' + (d ? '' : ' empty'), list);
      el('div', 'no', row, 'No.' + i);
      var info = el('div', 'info', row);
      el('div', '', info, d ? slotInfo(d) : '—— 空 ——');
      if (d) el('div', 's', info, St.fmtTime(d.time) + '　游戏时间 ' + St.fmtPlay(d.s.playMs || 0));
      row.addEventListener('click', function () {
        function doSave() {
          St.s.scene.stage = R.stageSnapshot();
          var ok = St.write(i, St.snapshot(I.resume, { chapter: St.s.chapter, caption: St.s.scene.caption, place: DM.Explore.placeName() }));
          DM.Audio.se(ok ? 'ok' : 'ng');
          M.closeTop(); if (ok) M.openSave();
        }
        if (d) confirmBox('覆盖 No.' + i + ' 的存档？', doSave); else doSave();
      });
    })(i);
  };
  M.openLoad = function () {
    var P = panel('读档');
    var list = el('div', 'save-list', P.bd);
    ['auto'].concat([1, 2, 3, 4, 5, 6, 7, 8, 9]).forEach(function (k) {
      var d = St.read(k);
      var row = el('div', 'save-slot' + (d ? '' : ' empty'), list);
      el('div', 'no', row, k === 'auto' ? '自动' : 'No.' + k);
      var info = el('div', 'info', row);
      el('div', '', info, d ? slotInfo(d) : '—— 空 ——');
      if (d) el('div', 's', info, St.fmtTime(d.time) + '　游戏时间 ' + St.fmtPlay(d.s.playMs || 0));
      if (d) row.addEventListener('click', function () {
        DM.Audio.se('ok');
        M.closeAll();
        UI.layers.title.classList.add('hidden');
        I.loadSnapshot(d).catch(function (e) { console.error(e); alert('读档失败：' + e.message); M.toTitle(); });
      });
    });
  };

  // ---------- 设置 ----------
  M.openSettings = function () {
    var P = panel('设置'), S = St.settings;
    function row(label) { var r = el('div', 'set-row', P.bd); el('label', '', r, label); return el('div', 'opts', r); }
    function opts(label, key, values) {
      var o = row(label);
      values.forEach(function (v) {
        var b = el('button', 'btn small' + (S[key] === v[0] ? ' on' : ''), o, v[1]);
        b.addEventListener('click', function () {
          S[key] = v[0]; St.saveSettings(); DM.Audio.se('select');
          Array.prototype.forEach.call(o.children, function (x) { x.classList.remove('on'); }); b.classList.add('on');
        });
      });
    }
    function slider(label, key) {
      var o = row(label);
      var r = el('input', '', o); r.type = 'range'; r.min = 0; r.max = 100; r.value = Math.round(S[key] * 100);
      r.addEventListener('input', function () { S[key] = r.value / 100; DM.Audio.setVolume(key, S[key]); });
      r.addEventListener('change', function () { St.saveSettings(); DM.Audio.se('select'); });
    }
    opts('文字速度', 'textSpeed', [[0, '慢'], [1, '中'], [2, '快'], [3, '瞬间']]);
    opts('自动播放间隔', 'autoDelay', [[0, '短'], [1, '中'], [2, '长']]);
    slider('音乐音量', 'bgm');
    slider('音效音量', 'se');
    opts('审判难度', 'difficulty', [['easy', '轻松（答错1次即提示）'], ['normal', '标准']]);
    opts('画面震动', 'shake', [[true, '开'], [false, '关']]);
    opts('雨滴粒子', 'particles', [[true, '多'], [false, '少（省电）']]);
    var tip = el('p', '', P.bd);
    tip.style.cssText = 'color:#8d8698;font-size:15px;line-height:1.8;margin-top:16px';
    tip.textContent = '操作：点击 / 空格 / 回车 推进对话　按住 Ctrl 快进　A 自动　L 记录　Esc 或右键 打开菜单。\n审判中：数字键选择证据，←→ 切换发言。审判没有失败，答错只会扣除「信念」并获得提示。';
    tip.style.whiteSpace = 'pre-wrap';
  };

  // ---------- 对话记录 ----------
  M.openLog = function () {
    var P = panel('对话记录');
    UI.log.slice(-200).forEach(function (l) {
      var it = el('div', 'log-item' + (l.kind === 'think' ? ' think' : ''), P.bd);
      if (l.name) { var w = el('span', 'who', it, l.name); if (l.who) w.style.color = Core.charColor(l.who); }
      it.appendChild(document.createTextNode(l.text));
    });
    setTimeout(function () { P.bd.scrollTop = P.bd.scrollHeight; }, 0);
  };

  // ---------- 侦探手账 ----------
  var FATE = { // 章节序号 >= n 时显示状态
    genzou: [2, '死亡'], mio: [2, '鸦笼'], kyosuke: [3, '死亡'], kotone: [3, '鸦笼'], kuga: [4, '死亡'], shiori: [4, '鸦笼'],
    shio: [5, '死亡'], hina: [5, '鸦笼'], shizuka: [6, '死亡'], fuwa: [6, '鸦笼'], kurokawa: [1, '离岛']
  };
  var CAST = ['ritsu', 'shio', 'genzou', 'kyosuke', 'hina', 'shizuka', 'fuwa', 'kiryu', 'kuga', 'shiori', 'usami', 'kurata', 'mio', 'kotone', 'kurokawa'];
  M.openNotebook = function (tab) {
    if (!St.s) return;
    var P = panel('侦探手账');
    var tabs = {};
    [['ev', '证据'], ['ch', '人物'], ['ru', '规则与童谣']].forEach(function (t) {
      var b = el('button', 'btn small', P.tools, t[1]);
      b.addEventListener('click', function () { DM.Audio.se('select'); show(t[0]); });
      tabs[t[0]] = b;
    });
    function show(k) {
      Object.keys(tabs).forEach(function (x) { tabs[x].classList.toggle('on', x === k); });
      Core.clear(P.bd);
      if (k === 'ev') evidence(P.bd); else if (k === 'ch') chars(P.bd); else rules(P.bd);
    }
    show(tab || 'ev');
  };
  function evidence(bd) {
    var wrap = el('div', 'ev-wrap', bd);
    var list = el('div', 'ev-list', wrap), det = el('div', 'ev-detail', wrap);
    var order = St.CHAPTER_ORDER.slice().reverse();
    var cur = St.s.chapter, first = null, rows = [];
    order.forEach(function (ch) {
      var def = DM.chapters[ch]; if (!def || !def.evidence) return;
      var ids = Object.keys(def.evidence).filter(St.hasEv);
      if (!ids.length) return;
      var h = el('div', '', list, St.CHAPTER_NAMES[ch] || ch);
      h.style.cssText = 'font-size:13px;color:' + (ch === cur ? '#d6b25e' : '#8d8698') + ';margin:8px 0 2px;letter-spacing:2px';
      ids.forEach(function (id) {
        var ev = def.evidence[id];
        var r = el('div', 'ev-item', list);
        r.appendChild(Core.canvasFrom(Core.art.icon(ev.icon)));
        el('span', 'nm', r, ev.name);
        function sel() {
          rows.forEach(function (x) { x.classList.toggle('sel', x === r); });
          Core.clear(det);
          det.appendChild(Core.canvasFrom(Core.art.icon(ev.icon)));
          el('h3', '', det, ev.name);
          el('p', '', det, St.s.evUpd[id] || ev.desc);
        }
        r.addEventListener('click', function () { DM.Audio.se('select'); sel(); });
        rows.push(r);
        if (!first) first = sel;
      });
    });
    if (first) first(); else el('p', '', det, '还没有收集到证据。');
  }
  function chars(bd) {
    var chIdx = Math.max(0, St.CHAPTER_ORDER.indexOf(St.s.chapter));
    var grid = el('div', 'chars-grid', bd), info = el('div', 'char-info', bd);
    var cards = [];
    CAST.forEach(function (id, i) {
      var c = DM.CHARS[id];
      if (id === 'kurokawa' && chIdx < 0) return;
      var f = FATE[id], status = f && chIdx >= f[0] ? f[1] : '';
      if (id === 'shio' && chIdx >= 6) status = '？？？';
      var card = el('div', 'char-card' + (status === '死亡' ? ' dead' : ''), grid);
      card.appendChild(Core.canvasFrom(Core.art.portrait(id, 'normal')));
      el('div', 'nm', card, c.name);
      if (status) el('div', 'st', card, status);
      card.addEventListener('click', function () { DM.Audio.se('select'); sel(); });
      function sel() {
        cards.forEach(function (x) { x.classList.toggle('sel', x === card); });
        Core.clear(info);
        var h = el('div', '', info); h.innerHTML = '';
        var t = el('b', '', h, c.name + '　'); t.style.color = c.color;
        h.appendChild(document.createTextNode(c.title + (c.age ? '　' + c.age + '岁' : '')));
        var bond = St.s.bonds[id] || 0;
        if (id !== 'ritsu' && id !== 'kurokawa') { var hs = el('span', 'hearts', h, '　' + '♥'.repeat(bond)); hs.title = '羁绊'; }
        el('div', '', info, c.desc);
        var notes = St.s.notes[id];
        if (notes && notes.length) { var ul = el('ul', 'notes', info); notes.forEach(function (n) { el('li', '', ul, n); }); }
      }
      cards.push(card);
      if (i === 0) sel();
    });
  }
  function rules(bd) {
    var r = el('div', 'rules', bd);
    el('p', '', r, '【判官的规则】').style.color = '#d6b25e';
    ['一、七天后渡船才会回来。',
     '二、每当有乌鸦坠落，全员须在指定时刻到审判厅集合，指认凶手。',
     '三、多数票指认正确：凶手被关入鸦笼，交给七天后到来的警察。',
     '四、指认错误：真凶将独自乘第七天的船离开，其余所有人永远留在这座岛上。',
     '五、第七天，判官将公开「九年前的真相」。'].forEach(function (t) { el('p', '', r, t); });
    el('p', '', r, '【七鸦之歌】').style.cssText = 'color:#d6b25e;margin-top:22px';
    var verses = ['一只乌鸦锁进笼，月光照不到它的胸。', '两只乌鸦争一面镜，镜中谁是真的影。', '三只乌鸦飞上塔，脚下没有回家的沙。',
      '四只乌鸦烧去脸，灰烬里面埋着谁的名。', '五只乌鸦自啄心，罪人原来是自己。', '六只乌鸦围成圈，审判之火点燃天。',
      '七只乌鸦只剩一只，它在雾里唱着歌——等那个说谎的孩子。'];
    var shown = St.CHAPTER_ORDER.indexOf(St.s.chapter) >= 0 ? 7 : 0;
    verses.forEach(function (v, i) { el('p', 'verse' + (i < shown ? '' : ' locked'), r, i < shown ? v : '……'); });
    el('p', '', r, '【审判须知】').style.cssText = 'color:#d6b25e;margin-top:22px';
    ['审判没有失败。答错会扣除「信念」，信念耗尽时会自动恢复。',
     '连续答错会出现提示，再答错会高亮正确的证据或选项。',
     '证言交锋：先选择证据，再点击发言中与之矛盾的橙色字句。可随时暂停、前后翻看发言。'].forEach(function (t) { el('p', '', r, t); });
  }

  // ---------- 标题画面 ----------
  M.toTitle = function () {
    I.stop(); M.closeAll(); UI.resetAll();
    R.setTrial(false); R.clearStage(); R.setSprites([]); R.setDim(0);
    R.setBg('title'); R.setFilter('none'); R.setWeather('fog'); R.setFlashback(false);
    DM.Audio.bgm('title');
    St.s = null;
    var L = UI.layers.title; Core.clear(L); L.classList.remove('hidden');
    var logo = el('div', 'logo', L);
    el('div', 'en', logo, 'DARK MOOD');
    el('div', 'zh', logo, '宵鸦岛审判');
    var menu = el('div', 'menu', L);
    function b(t, fn, dis) { var x = el('button', 'btn', menu, t); if (dis) x.disabled = true; x.addEventListener('click', function (e) { e.stopPropagation(); DM.Audio.init(); DM.Audio.se('ok'); fn(); }); return x; }
    var latest = St.latest();
    if (latest) b('继续游戏', function () { L.classList.add('hidden'); I.loadSnapshot(latest); });
    b('新的游戏', function () { L.classList.add('hidden'); I.startChapter('prologue').catch(fail); });
    b('读取存档', function () { St.s = St.s || St.fresh(); M.openLoad(); });
    b('章节选择', chapterSelect, St.progress.reached.length < 2);
    b('设置', function () { St.s = St.s || null; M.openSettings(); });
    b('关于', about);
    el('div', 'foot', L, 'v1.0　程序化像素美术与芯片音乐　·　原创作品');
    L.addEventListener('click', function () { DM.Audio.init(); });
  };
  function fail(e) { console.error(e); alert('无法开始：' + e.message); M.toTitle(); }

  function chapterSelect() {
    var P = panel('章节选择');
    var list = el('div', 'save-list', P.bd);
    St.CHAPTER_ORDER.forEach(function (ch) {
      var ok = St.progress.reached.indexOf(ch) >= 0;
      var row = el('div', 'save-slot' + (ok ? '' : ' empty'), list);
      el('div', 'info', row, ok ? St.CHAPTER_NAMES[ch] : '？？？');
      if (ok) row.addEventListener('click', function () {
        DM.Audio.se('ok'); M.closeAll(); UI.layers.title.classList.add('hidden');
        I.startChapter(ch).catch(fail);
      });
    });
  }
  function about() {
    var P = panel('关于');
    var t = el('div', '', P.bd);
    t.style.cssText = 'font-size:18px;line-height:1.9;white-space:pre-wrap;color:#d8d1c0';
    t.textContent = '《DARK MOOD：宵鸦岛审判》\n\n' +
      '1999 年夏，孤岛宵鸦岛。九年前的「少年侦探」七濑律，收到一封署名为死者的邀请函。\n' +
      '七只乌鸦将依次坠落——每一个凶手都怀着复仇的理由。\n\n' +
      '本格推理 × 审判冒险。所有线索都会在审判前呈现给你；请与律一起找出真相。\n' +
      '审判中的小游戏没有失败，放轻松享受推理。\n\n' +
      '游戏中的所有画面与音乐均由程序实时生成。存档保存在本浏览器中。\n' +
      '本作为原创作品，人物、地点、事件均属虚构。';
  }

  // ---------- 片尾 ----------
  M.credits = function () {
    I.stop(); UI.resetAll();
    DM.Audio.bgm('ending');
    var L = UI.layers.title; Core.clear(L); L.classList.remove('hidden');
    var c = el('div', 'credits', L);
    var roll = el('div', 'roll', c);
    roll.innerHTML = '<h1>DARK MOOD</h1><div>宵鸦岛审判</div>' +
      '<h3>登场人物</h3>' + ['ritsu', 'shio', 'genzou', 'kyosuke', 'hina', 'shizuka', 'fuwa', 'kiryu', 'kuga', 'shiori', 'usami', 'kurata', 'mio', 'kotone', 'kurokawa']
        .map(function (id) { return DM.CHARS[id].name + '　……　' + DM.CHARS[id].title; }).join('<br>') +
      '<h3>以及</h3>鹭宫 千鹤<br>乌丸 源治<br>七濑 修司' +
      '<h3>七只乌鸦飞走了</h3>雾散了。<br>那个孩子，说出了真相。' +
      '<h3>— 完 —</h3><div style="height:200px"></div>谢谢游玩。';
    var t = setTimeout(M.toTitle, 50000);
    c.addEventListener('click', function () { if (c._clicks = (c._clicks || 0) + 1, c._clicks >= 2) { clearTimeout(t); M.toTitle(); } });
  };
})();
