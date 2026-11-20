/* 探索 / 搜证模式 + 地图 + 自由时间选择 */
(function () {
  'use strict';
  var DM = window.DM, Core = DM.Core, St = DM.State, R = DM.Render, UI = DM.UI, I = DM.Interp;
  var el = Core.el;
  var X = DM.Explore = {};

  function frame() { var st = St.s.stack; var f = st[st.length - 1]; return f && f.kind === 'explore' ? f : null; }
  function defOf(f) { var p = I.progs[f.prog]; return p && p.def.explore ? p.def.explore[f.id] : null; }
  function placeInfo(def, id) {
    var c = def.custom && def.custom[id];
    if (c) return { bg: c.bg, variant: c.variant || null, name: c.name, area: c.area || (DM.LOCS[c.bg] || {}).area, filter: c.filter };
    var l = DM.LOCS[id] || { name: id, area: null };
    return { bg: id, variant: null, name: l.name, area: l.area };
  }
  X.placeName = function () { var f = frame(); if (!f) return ''; var d = defOf(f); return d ? placeInfo(d, f.place).name : ''; };

  function needDone(def) {
    var need = (def.done && def.done.need) || [];
    var got = 0;
    need.forEach(function (n) { if (n.indexOf('flag:') === 0 ? St.flag(n.slice(5)) : St.hasEv(n)) got++; });
    return { got: got, total: need.length, ok: got >= need.length };
  }

  X.open = function () {
    var f = frame(); if (!f) return;
    var def = defOf(f); if (!def) return;
    I.resume = { type: 'explore' };
    UI.showDialog(false); UI.caption('');
    var info = placeInfo(def, f.place);
    var s = St.s.scene;
    R.setTrial(false); s.trial = false;
    R.setBg(info.bg, info.variant); s.bg = info.bg; s.variant = info.variant;
    if (def.filter || info.filter) { R.setFilter(info.filter || def.filter); s.filter = info.filter || def.filter; }
    if (def.weather) { R.setWeather(def.weather); s.weather = def.weather; }
    R.clearStage(); s.stage = [];
    var people = (def.people && def.people[f.place]) || [];
    R.setSprites(people.map(function (p) { return { id: p.char, x: p.x || 240 }; }));
    build(f, def, info, people);
    I.autosave({ type: 'explore' });
  };

  function build(f, def, info, people) {
    var L = UI.layers.explore;
    Core.clear(L); L.classList.remove('hidden');
    var top = el('div', 'topbar', L);
    el('span', 'mode', top, def.mode === 'investigate' ? '搜查' : '自由行动');
    el('span', 'place', top, info.name);
    var nd = needDone(def);
    if (def.mode === 'investigate' && nd.total) el('span', 'prog', top, '线索 ' + nd.got + ' / ' + nd.total);
    el('span', 'sp', top);
    function btn(label, fn, cls) { var b = el('button', 'btn small' + (cls ? ' ' + cls : ''), top, label); b.addEventListener('click', function (e) { e.stopPropagation(); DM.Audio.se('select'); fn(); }); return b; }
    if (def.places.length > 1) btn('移动', function () { openMap(f, def); });
    btn('手账', function () { DM.Menus.openNotebook(); });
    btn('菜单', function () { DM.Menus.openSystem(); });
    if (nd.ok && def.done) btn(def.mode === 'investigate' ? '结束搜查' : '继续剧情', function () { finish(f, def); }, 'gold');

    // 调查点
    var spots = (def.spots && def.spots[f.place]) || [];
    var anchors = (DM.LOCS[info.bg] || {}).anchors || {};
    spots.forEach(function (sp) {
      var x, y;
      if (sp.anchor && anchors[sp.anchor]) { var a = anchors[sp.anchor]; x = a[0] + a[2] / 2; y = a[1] + a[3] / 2; }
      else { x = sp.x || 240; y = sp.y || 135; }
      var key = f.id + ':' + f.place + ':' + (sp.anchor || (x + ',' + y));
      var b = el('button', 'spot' + (St.s.visited[key] ? ' seen' : ''), L);
      b.style.left = (x * 2) + 'px'; b.style.top = (y * 2) + 'px';
      el('span', 'lb', b, sp.label);
      b.addEventListener('click', function (e) {
        e.stopPropagation(); DM.Audio.se('select');
        St.s.visited[key] = true;
        runLabel(f, sp.run);
      });
    });
    // 人物
    people.forEach(function (p) {
      var key = f.id + ':' + p.char;
      var b = el('button', 'person' + (St.s.talked[key] ? ' talked' : ''), L);
      var x = (p.x || 240);
      b.style.left = ((x - 16) * 2) + 'px'; b.style.top = ((236 - 64) * 2) + 'px';
      b.style.width = '64px'; b.style.height = '128px';
      var lb = el('span', 'lb', b, Core.charName(p.char)); lb.style.borderColor = Core.charColor(p.char);
      b.addEventListener('click', function (e) {
        e.stopPropagation(); DM.Audio.se('select');
        St.s.talked[key] = true;
        runLabel(f, p.run);
      });
    });
    var hint = el('div', 'hint', L, spots.length || people.length ? '点击 ◆ 调查，点击人物交谈' : '这里似乎没有需要调查的东西');
    if (nd.ok && def.done && def.done.prompt) hint.textContent = def.done.prompt;
  }

  function runLabel(f, label) {
    var L = UI.layers.explore;
    L.classList.add('hidden'); Core.clear(L);
    R.setSprites([]);
    if (!I.jump(label, f.prog)) { X.open(); return; }
    I.run();
  }

  function finish(f, def) {
    UI.layers.explore.classList.add('hidden'); Core.clear(UI.layers.explore);
    R.setSprites([]);
    St.s.stack.pop();
    I.jump(def.done.run, f.prog);
    I.run();
  }

  // ---------- 地图 ----------
  function openMap(f, def) {
    var L = UI.layers.explore;
    var ov = el('div', '', L); ov.id = 'mapov';
    ov.addEventListener('click', function (e) { e.stopPropagation(); });
    var mc = Core.canvasFrom(Core.art.map()); ov.appendChild(mc);
    el('div', 'title', ov, '宵鸦岛');
    var close = el('button', 'btn small close', ov, '关闭');
    close.addEventListener('click', function (e) { e.stopPropagation(); ov.remove(); });
    // 按区域分组
    var groups = {}, order = [];
    def.places.forEach(function (p) {
      var info = placeInfo(def, p);
      var area = info.area && DM.AREAS[info.area] ? info.area : '_misc';
      if (!groups[area]) { groups[area] = []; order.push(area); }
      groups[area].push({ id: p, name: info.name });
    });
    var curArea = placeInfo(def, f.place).area;
    order.forEach(function (area, idx) {
      var pos = area === '_misc' ? [240, 250 - idx * 16] : DM.AREAS[area].map;
      var name = area === '_misc' ? '其他' : DM.AREAS[area].name;
      var n = el('button', 'node' + (area === curArea ? ' cur' : ''), ov, name + (groups[area].length > 1 ? ' ▾' : ''));
      n.style.left = (pos[0] * 2) + 'px'; n.style.top = (pos[1] * 2) + 'px';
      n.addEventListener('click', function (e) {
        e.stopPropagation(); DM.Audio.se('select');
        var list = groups[area];
        if (list.length === 1) { go(list[0].id); return; }
        var old = ov.querySelector('.rooms'); if (old) old.remove();
        var rm = el('div', 'rooms', ov);
        var lx = Math.min(pos[0] * 2 + 20, 960 - 230), ly = Math.min(pos[1] * 2 + 18, 540 - list.length * 40 - 20);
        rm.style.left = lx + 'px'; rm.style.top = Math.max(50, ly) + 'px';
        list.forEach(function (pl) {
          var b = el('button', 'btn small' + (pl.id === f.place ? ' gold' : ''), rm, pl.name);
          b.addEventListener('click', function (ev) { ev.stopPropagation(); go(pl.id); });
        });
      });
    });
    function go(id) { DM.Audio.se('door'); f.place = id; X.open(); }
  }

  // ---------- 自由时间 ----------
  var F = DM.Freetime = {};
  F.available = function () {
    var d = DM.freetimeDef; if (!d || !d.events) return [];
    var out = [];
    Object.keys(d.events).forEach(function (c) {
      var idx = St.s.ft[c] || 0, ev = d.events[c][idx];
      if (ev && ev.chapters.indexOf(St.s.chapter) >= 0) out.push({ char: c, ev: ev, idx: idx });
    });
    return out;
  };
  F.open = function () {
    var st = St.s.stack, f = st[st.length - 1];
    if (!f || f.kind !== 'freetime') return;
    I.resume = { type: 'freetime' };
    I.autosave({ type: 'freetime' });
    UI.showDialog(false);
    var L = UI.layers.game;
    Core.clear(L); L.classList.remove('hidden');
    R.setDim(0.6);
    var p = el('div', 'g-panel', L);
    var pr = el('div', 'g-prompt', p);
    pr.innerHTML = '<b>自由时间</b>　还可以和某人共度 ' + f.remaining + ' 次时光。要去找谁呢？';
    var grid = el('div', 'pick-grid', p);
    F.available().forEach(function (a) {
      var card = el('div', 'pick-card', grid);
      card.appendChild(Core.canvasFrom(Core.art.portrait(a.char, 'smile')));
      el('div', 'nm', card, Core.charName(a.char));
      var hearts = el('div', 'hearts', card, '♥'.repeat(St.s.bonds[a.char] || 0) + '♡'.repeat(Math.max(0, 3 - (St.s.bonds[a.char] || 0))));
      hearts.style.fontSize = '13px';
      if (a.ev.place && DM.LOCS[a.ev.place]) { var pl = el('div', '', card, DM.LOCS[a.ev.place].name); pl.style.cssText = 'font-size:12px;color:#8d8698'; }
      card.addEventListener('click', function (e) {
        e.stopPropagation(); DM.Audio.se('ok');
        St.s.ft[a.char] = a.idx + 1;
        close();
        if (!I.jump(a.ev.label, 'ft')) return;
        I.run();
      });
    });
    var foot = el('div', 'g-foot', p);
    var skip = el('button', 'btn', foot, '不了，独自待一会儿');
    skip.addEventListener('click', function (e) {
      e.stopPropagation(); DM.Audio.se('select'); close();
      var fr = St.s.stack.pop();
      St.s.prog = fr.prog; St.s.ip = fr.ip; St.s.scene = fr.scene; I.applyScene(fr.scene);
      I.run();
    });
    function close() { L.classList.add('hidden'); Core.clear(L); R.setDim(0); }
  };
})();
