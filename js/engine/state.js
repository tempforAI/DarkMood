/* 游戏状态、存档（localStorage）、设置 */
(function () {
  'use strict';
  var DM = window.DM = window.DM || {};
  var St = DM.State = {};

  var KEY_SAVE = 'darkmood_save_', KEY_SET = 'darkmood_settings', KEY_PROG = 'darkmood_progress';
  St.SLOTS = 9;

  St.CHAPTER_ORDER = ['prologue', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6'];
  St.CHAPTER_NAMES = {
    prologue: '序章 鸦啼之岛', ch1: '第一章 笼中之鸦', ch2: '第二章 镜中之鸦', ch3: '第三章 塔上之鸦',
    ch4: '第四章 无面之鸦', ch5: '第五章 啄心之鸦', ch6: '终章 审判之鸦'
  };

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function safeDel(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }

  // ---------- 设置 ----------
  St.settings = {
    textSpeed: 2,      // 0 慢 1 中 2 快 3 瞬间
    autoDelay: 1,      // 0 短 1 中 2 长
    bgm: 0.55, se: 0.7,
    difficulty: 'easy',// easy: 立即提示；normal
    shake: true,
    particles: true
  };
  St.loadSettings = function () {
    var raw = safeGet(KEY_SET);
    if (raw) try { var o = JSON.parse(raw); for (var k in o) if (k in St.settings) St.settings[k] = o[k]; } catch (e) { /* ignore */ }
  };
  St.saveSettings = function () { safeSet(KEY_SET, JSON.stringify(St.settings)); };

  // ---------- 全局进度（章节选择用） ----------
  St.progress = { reached: ['prologue'], cleared: false };
  St.loadProgress = function () {
    var raw = safeGet(KEY_PROG);
    if (raw) try { var o = JSON.parse(raw); if (o && o.reached) St.progress = o; } catch (e) { /* ignore */ }
  };
  St.markReached = function (ch) {
    if (St.progress.reached.indexOf(ch) < 0) { St.progress.reached.push(ch); safeSet(KEY_PROG, JSON.stringify(St.progress)); }
  };
  St.markCleared = function () { St.progress.cleared = true; safeSet(KEY_PROG, JSON.stringify(St.progress)); };

  // ---------- 游戏状态 ----------
  St.s = null;
  St.fresh = function (chapter) {
    return {
      v: 1,
      chapter: chapter || 'prologue',
      prog: chapter || 'prologue', ip: 0,
      stack: [],
      flags: {}, ev: [], evUpd: {}, notes: {}, bonds: {}, ft: {}, unlocked: {}, visited: {}, talked: {},
      hp: 5,
      scene: { bg: 'black', variant: null, filter: 'none', weather: 'none', flashback: false, trial: false, bgm: null, caption: '', stage: [] },
      playMs: 0
    };
  };
  St.newGame = function (chapter) { St.s = St.fresh(chapter); return St.s; };

  St.hasEv = function (id) { return St.s.ev.indexOf(id) >= 0; };
  St.addEv = function (id) { if (!St.hasEv(id)) { St.s.ev.push(id); return true; } return false; };
  St.flag = function (name) { return !!St.s.flags[name]; };

  St.evalCond = function (cond) {
    var neg = false, c = cond.trim();
    if (c.charAt(0) === '!') { neg = true; c = c.slice(1); }
    var r;
    if (c.indexOf('has:') === 0) r = St.hasEv(c.slice(4));
    else {
      var m = /^([a-zA-Z0-9_]+)>=(\d+)$/.exec(c);
      if (m) r = (+St.s.flags[m[1]] || 0) >= +m[2];
      else r = !!St.s.flags[c];
    }
    return neg ? !r : r;
  };

  // ---------- 存读档 ----------
  // resume: {type:'op', prog, ip} | {type:'explore'} | {type:'freetime'}
  St.snapshot = function (resume, meta) {
    var s = JSON.parse(JSON.stringify(St.s));
    return { s: s, resume: resume, meta: meta || {}, time: Date.now() };
  };
  St.write = function (slot, snap) { return safeSet(KEY_SAVE + slot, JSON.stringify(snap)); };
  St.read = function (slot) {
    var raw = safeGet(KEY_SAVE + slot);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  };
  St.remove = function (slot) { safeDel(KEY_SAVE + slot); };
  St.latest = function () {
    var best = null;
    for (var i = 0; i <= St.SLOTS; i++) {
      var k = i === 0 ? 'auto' : i, d = St.read(k);
      if (d && (!best || d.time > best.time)) best = d;
    }
    return best;
  };

  St.fmtTime = function (t) {
    var d = new Date(t), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '/' + p(d.getMonth() + 1) + '/' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  };
  St.fmtPlay = function (ms) {
    var m = Math.floor(ms / 60000), h = Math.floor(m / 60);
    return h + '小时' + (m % 60) + '分';
  };

  St.loadSettings();
  St.loadProgress();
})();
