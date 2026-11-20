/* DARK MOOD 像素美术 —— 证据图标（16x16，透明背景）
 * 每个图标画在 1..14 的内区，再自动加 1px 深色外轮廓。
 */
(function (root) {
  var DM = root.DM = root.DM || {};
  var P = DM.Pal, X = DM.Px, C = P.c;
  var I = DM.ArtIcons = {};
  var D = {};

  // 常用色
  var K = {
    ink: '#0a0810', w0: '#ffffff', w1: '#e8e4ee', w2: '#b8b2c4', w3: '#7a7488',
    st0: '#3a3a44', st1: '#6a6a76', st2: '#9a9aa6', st3: '#c8c8d4',
    g0: '#6a4a1c', g1: '#a07a30', g2: '#c9a25a', g3: '#f0d890',
    wd0: '#3a2214', wd1: '#5a3820', wd2: '#7a5030', wd3: '#a07048',
    r0: '#4a0c16', r1: '#7a1426', r2: '#b02a3a', r3: '#e05060',
    b0: '#1a2a4a', b1: '#2e4a7a', b2: '#4a70b0', b3: '#8ab0e8',
    pp: '#e8dcc0', pp2: '#c8b890', pp3: '#9a8a68',
    fl0: '#b4501e', fl1: '#f08a30', fl2: '#ffc860', fl3: '#fff4c8',
    gr0: '#1e3a24', gr1: '#2e5a3a', gr2: '#4a8a5a', sk: '#e8c8a8', sk2: '#c8987a'
  };

  D.knife = function (b) {
    b.poly([14, 1, 15, 2, 7, 10, 5, 8], K.st3);
    b.line(14, 2, 6, 10, K.st1); b.px(13, 2, K.w0); b.px(12, 3, K.w0);
    b.line(4, 8, 7, 11, K.g1); b.px(5, 9, K.g2);
    b.thick(4, 11, 2, 13, 2, K.wd1); b.line(5, 11, 2, 14, K.wd0); b.px(3, 11, K.wd2);
  };
  D.key = function (b) {
    b.ring(4.5, 4.5, 3.6, 3.6, K.g2, 2); b.px(3, 3, K.g3); b.px(2, 4, K.g3);
    b.thick(7, 7, 13, 13, 2, K.g1); b.line(7, 7, 13, 13, K.g2);
    b.rect(10, 12, 2, 3, K.g1); b.rect(12, 10, 3, 2, K.g1); b.px(9, 13, K.g1);
  };
  D.note = function (b) {
    b.poly([3, 1, 11, 1, 13, 3, 13, 14, 3, 14], K.pp); b.poly([11, 1, 13, 3, 11, 3], K.pp2);
    for (var y = 4; y < 13; y += 2) b.hl(5, y, y === 12 ? 4 : 7, K.pp3);
    b.vl(3, 1, 14, K.w0); b.hl(4, 14, 9, K.pp2);
  };
  D.letter = function (b) {
    b.rect(1, 4, 14, 10, K.pp); b.hl(1, 13, 14, K.pp2); b.vl(14, 4, 10, K.pp2);
    b.line(1, 4, 8, 9, K.pp3); b.line(14, 4, 8, 9, K.pp3); b.line(1, 13, 6, 8, K.pp2); b.line(14, 13, 10, 8, K.pp2);
    b.circle(8, 9.5, 2.2, K.r2); b.px(7, 9, K.r3); b.px(8, 10, K.r1);
  };
  D.rope = function (b) {
    b.ring(7.5, 7, 6, 5, '#a08858', 2); b.ring(7.5, 7, 3.4, 2.6, '#a08858', 2);
    for (var a = 0; a < 16; a++) { var t = a / 16 * Math.PI * 2; b.px(Math.round(7.5 + Math.cos(t) * 5.2), Math.round(7 + Math.sin(t) * 4.2), a % 2 ? '#c8b080' : '#6a5a38'); }
    b.thick(12, 10, 14, 14, 2, '#a08858'); b.px(14, 14, '#6a5a38');
  };
  D.string = function (b) {
    b.ring(7.5, 7.5, 6, 6, '#a8c0d8'); b.ring(7.5, 7.5, 4, 4, '#c8dcf0'); b.ring(7.5, 7.5, 2, 2, '#a8c0d8');
    b.line(12, 11, 15, 15, '#c8dcf0'); b.px(5, 3, K.w0); b.px(10, 4, K.w0);
  };
  D.feather = function (b) {
    b.poly([13, 1, 15, 2, 9, 10, 4, 14, 2, 13, 6, 8], '#1a1622');
    b.poly([13, 1, 14, 3, 6, 11, 5, 10], '#2a2638');
    b.line(14, 2, 3, 13, '#4a4a6a'); b.line(3, 13, 1, 15, '#4a4a6a');
    b.px(11, 4, '#6a6a9a'); b.px(9, 6, '#5a5a8a'); b.px(12, 2, '#8a8ab8');
    b.px(8, 9, '#0a0810'); b.px(6, 11, '#0a0810');
  };
  D.bottle = function (b) {
    b.rect(6, 1, 4, 3, K.wd2); b.hl(6, 1, 4, K.wd3);
    b.rect(6, 4, 4, 3, '#1e4a2e'); b.poly([4, 7, 12, 7, 12, 14, 4, 14], '#1e4a2e'); b.rect(5, 6, 6, 2, '#1e4a2e');
    b.vl(5, 7, 7, '#3a7a50'); b.vl(11, 7, 7, '#0e2a18'); b.px(5, 8, '#8ad0a0');
    b.rect(5, 9, 6, 4, K.pp); b.hl(5, 10, 6, K.r2); b.hl(5, 12, 6, K.pp2);
  };
  D.pill = function (b) {
    b.thick(3, 10, 8, 5, 4, K.r2); b.thick(8, 5, 11, 2, 4, '#f0ecf4'); b.line(3, 10, 8, 5, K.r3); b.px(9, 3, K.w0);
    b.line(5, 11, 10, 6, K.r1);
    b.circle(11.5, 11.5, 3, '#f4f2f8'); b.hl(9, 11, 6, '#c8c4d0'); b.px(10, 10, K.w0);
  };
  D.photo = function (b) {
    b.rect(1, 2, 14, 12, '#f0ece4'); b.rect(2, 3, 12, 8, '#4a5a6a');
    b.rect(2, 3, 12, 3, '#8a9aaa'); b.poly([2, 11, 6, 6, 9, 9, 11, 7, 14, 11], '#2a3a2a');
    b.circle(5.5, 7, 1.5, '#e8c8a8'); b.rect(5, 8, 2, 3, '#7a3a3a'); b.circle(9.5, 7.5, 1.2, '#e8c8a8'); b.rect(9, 9, 2, 2, '#e8d070');
    b.hl(1, 13, 14, '#c8c4bc'); b.vl(14, 2, 12, '#c8c4bc');
  };
  D.book = function (b) {
    b.rect(3, 1, 10, 14, K.b1); b.rect(3, 1, 2, 14, K.b0); b.hl(5, 1, 8, K.b2);
    b.rect(12, 2, 2, 12, K.pp); b.vl(13, 2, 12, K.pp2);
    b.rect(6, 4, 5, 3, K.g2); b.px(6, 4, K.g3); b.hl(3, 10, 2, K.g1); b.hl(3, 12, 2, K.g1);
  };
  D.diary = function (b) {
    b.rect(2, 1, 11, 14, K.r1); b.rect(2, 1, 2, 14, K.r0); b.hl(4, 1, 9, K.r2);
    b.rect(12, 2, 2, 12, K.pp); b.vl(13, 2, 12, K.pp2);
    b.rect(10, 6, 4, 3, K.g1); b.px(13, 7, K.g2);
    b.rect(6, 3, 4, 2, '#f0d8e0'); b.px(7, 4, K.r2); b.px(8, 3, K.r2);
    // 烧焦的角
    b.poly([2, 11, 6, 15, 2, 15], '#1a1414'); b.px(5, 13, '#3a2a24'); b.px(6, 14, '#8a3018'); b.px(3, 10, '#3a2a24');
  };
  D.clock = function (b) {
    b.rect(7, 0, 2, 2, K.g1); b.ring(8, 1, 1.6, 1.6, K.g2);
    b.circle(8, 9, 6, K.g1); b.circle(8, 9, 5, '#f0e8d4'); b.ring(8, 9, 6, 6, K.g2);
    for (var i = 0; i < 4; i++) { var a = i * Math.PI / 2; b.px(Math.round(7.5 + Math.sin(a) * 4), Math.round(8.5 - Math.cos(a) * 4), K.ink); }
    b.line(8, 9, 8, 5, K.ink); b.line(8, 9, 11, 10, K.r2); b.px(6, 6, K.w0);
  };
  D.bell = function (b) {
    b.rect(7, 1, 2, 2, K.g1);
    b.poly([5, 3, 11, 3, 13, 12, 3, 12], K.g2); b.ellipse(8, 4, 3, 1.5, K.g2);
    b.rect(2, 11, 12, 2, K.g1); b.hl(2, 11, 12, K.g2);
    b.line(5, 4, 4, 11, K.g3); b.vl(6, 4, 6, K.g3); b.line(11, 4, 12, 11, K.g0);
    b.rect(7, 13, 2, 2, K.g0);
  };
  D.cloth = function (b) {
    b.poly([2, 3, 13, 2, 14, 12, 10, 14, 6, 13, 1, 14], '#16121e');
    b.line(5, 3, 4, 13, '#2a2438'); b.line(9, 2, 9, 13, '#2a2438'); b.line(12, 3, 13, 11, '#2a2438');
    b.line(6, 3, 5, 12, '#3e3654'); b.line(10, 3, 10, 12, '#3e3654');
    b.hl(2, 3, 11, '#4a4262');
  };
  D.paint = function (b) {
    b.poly([3, 3, 10, 3, 12, 10, 5, 10], '#d8d8e0'); b.rect(10, 5, 3, 3, '#2a2a30');
    b.hl(3, 3, 7, K.w0); b.line(5, 10, 3, 3, '#8a8a92');
    b.rect(5, 5, 5, 3, '#5a7ab8'); b.px(5, 5, '#a8c8f0');
    b.poly([1, 11, 9, 11, 14, 14, 3, 15], '#8ab4e0'); b.hl(4, 12, 6, '#d8e8ff'); b.px(12, 13, '#5a7ab8');
  };
  D.shoe = function (b) {
    b.poly([3, 2, 8, 2, 8, 9, 13, 10, 15, 12, 15, 14, 2, 14], '#3a2a20');
    b.rect(2, 13, 14, 2, '#1a1410'); b.vl(4, 3, 9, '#5a4030'); b.line(8, 9, 13, 10, '#5a4030');
    b.px(6, 5, '#8a6a4a'); b.px(6, 7, '#8a6a4a'); b.hl(3, 2, 5, '#5a4030');
  };
  D.footprint = function (b) {
    b.ellipse(5, 10, 2.6, 4, '#4a3a2a'); b.ellipse(5, 4.5, 2, 1.6, '#4a3a2a');
    b.ellipse(11, 6, 2.6, 4, '#4a3a2a'); b.ellipse(11, 1.5, 2, 1.4, '#4a3a2a');
    b.ellipse(5, 10, 1.4, 2.6, '#2a2018'); b.ellipse(11, 6, 1.4, 2.6, '#2a2018');
    b.px(13, 12, '#2a2018'); b.px(13, 13, '#4a3a2a');
  };
  D.tape = function (b) {
    b.rect(1, 3, 14, 10, '#2a2a30'); b.hl(1, 3, 14, '#5a5a62'); b.rect(3, 5, 10, 4, K.pp);
    b.rect(4, 6, 8, 2, '#3a3a40'); b.circle(5, 7, 1.3, '#141418'); b.circle(11, 7, 1.3, '#141418');
    b.poly([4, 13, 12, 13, 11, 10, 5, 10], '#3a3a42'); b.px(6, 11, '#8a8a92'); b.px(10, 11, '#8a8a92');
    b.hl(3, 5, 10, K.r2);
  };
  D.recorder = function (b) {
    b.rect(3, 1, 10, 14, '#3a3a42'); b.vl(3, 1, 14, '#6a6a74'); b.hl(3, 1, 10, '#6a6a74');
    b.rect(5, 3, 6, 5, '#141418'); b.circle(6.5, 5.5, 1, '#5a5a62'); b.circle(9.5, 5.5, 1, '#5a5a62');
    for (var i = 0; i < 3; i++) b.rect(5 + i * 2, 10, 1, 2, i === 0 ? K.r2 : '#9a9aa6');
    b.px(11, 10, K.r3); for (var y = 12; y < 15; y++) b.hl(5, y, 6, y % 2 ? '#2a2a30' : '#4a4a52');
  };
  D.ring = function (b) {
    b.ring(8, 9.5, 5.5, 4.5, K.g2, 2); b.ring(8, 9.5, 5.5, 4.5, K.g1, 1);
    b.px(4, 8, K.g3); b.px(5, 6, K.g3);
    b.poly([5, 4, 11, 4, 8, 1], '#c8e0ff'); b.poly([5, 4, 11, 4, 8, 7], '#6a9ad8'); b.px(7, 3, K.w0);
  };
  D.hairpin = function (b) {
    b.thick(2, 13, 12, 3, 2, '#2a2a32'); b.line(3, 14, 13, 4, '#5a5a66');
    b.circle(12, 3.5, 2.6, K.r2); b.px(11, 2, K.r3); b.circle(14, 6, 1.5, K.r2); b.circle(9.5, 2, 1.4, K.r2);
  };
  D.candle = function (b) {
    b.rect(6, 6, 4, 8, '#ece4d4'); b.vl(9, 6, 8, '#b8ac98'); b.vl(6, 6, 8, K.w0);
    b.ellipse(8, 14, 5, 1.5, K.g1); b.hl(3, 14, 10, K.g2);
    b.px(8, 5, K.ink); b.poly([6.5, 5, 9.5, 5, 8, 0], K.fl1); b.poly([7.3, 5, 8.7, 5, 8, 2], K.fl3);
    b.px(6, 7, '#f4ecdc'); b.px(9, 8, '#d8ccb8');
  };
  D.fire = function (b) {
    b.poly([3, 14, 13, 14, 14, 9, 11, 3, 10, 7, 8, 1, 6, 6, 4, 4, 2, 9], K.fl0);
    b.poly([5, 14, 12, 14, 12, 10, 10, 6, 9, 9, 8, 4, 6, 9, 5, 7, 4, 10], K.fl1);
    b.poly([6, 14, 10, 14, 10, 11, 8, 7, 6, 11], K.fl2); b.poly([7, 14, 9, 14, 8, 10], K.fl3);
  };
  D.map = function (b) {
    b.poly([1, 3, 5, 1, 10, 3, 15, 1, 15, 13, 10, 15, 5, 13, 1, 15], K.pp);
    b.line(5, 1, 5, 13, K.pp3); b.line(10, 3, 10, 15, K.pp3);
    b.poly([2, 4, 4, 3, 4, 12, 2, 13], K.pp2); b.poly([11, 4, 14, 3, 14, 12, 11, 13], K.pp2);
    b.line(3, 10, 7, 7, K.r2); b.line(7, 7, 9, 9, K.r2); b.line(9, 9, 12, 5, K.r2);
    b.px(12, 4, K.r1); b.px(11, 5, K.r1); b.px(13, 5, K.r1); b.px(12, 6, K.r1);
  };
  D.blueprint = function (b) {
    b.rect(1, 3, 12, 11, K.b1); b.hl(1, 3, 12, K.b2);
    b.frame(2, 5, 7, 7, K.b3); b.hl(2, 8, 4, K.b3); b.vl(6, 5, 4, K.b3); b.px(4, 10, K.b3);
    b.line(9, 6, 11, 12, K.b3);
    b.rect(12, 2, 3, 13, '#3a5a90'); b.ellipse(13.5, 2.5, 1.5, 1.5, K.b2); b.ellipse(13.5, 14, 1.5, 1.2, K.b0);
  };
  D.plate = function (b) {
    b.line(8, 1, 3, 5, '#5a4a30'); b.line(8, 1, 13, 5, '#5a4a30'); b.rect(7, 0, 2, 2, '#3a3a3a');
    b.rect(1, 5, 14, 9, K.g1); b.rect(2, 6, 12, 7, K.g2); b.hl(2, 6, 12, K.g3); b.vl(2, 6, 7, K.g3);
    X.han(b, 5, 7, '西', K.g0);
  };
  D.glass = function (b) {
    b.poly([3, 1, 13, 1, 12, 6, 8, 8, 4, 6], '#c8d8f0');
    b.poly([4, 3, 12, 3, 11, 6, 8, 7, 5, 6], K.r1); b.hl(4, 3, 8, K.r2);
    b.vl(8, 8, 5, '#c8d8f0'); b.ellipse(8, 13.5, 4, 1.5, '#c8d8f0'); b.px(4, 2, K.w0); b.px(4, 4, K.w0);
  };
  D.cup = function (b) {
    b.ellipse(8, 13, 7, 2, '#d8d4e0'); b.ellipse(8, 13, 5, 1.2, '#f4f2f8');
    b.poly([2, 5, 12, 5, 11, 11, 3, 11], '#f4f2f8'); b.ellipse(7, 5, 5, 1.6, '#6a3a20'); b.ring(7, 5, 5, 1.6, '#d8d4e0');
    b.ring(13, 8, 2, 2.2, '#d8d4e0', 1.4); b.vl(3, 6, 4, K.w0); b.hl(4, 8, 6, '#4a6aa0');
    b.px(6, 2, '#c8c4d0'); b.px(8, 1, '#c8c4d0'); b.px(7, 3, '#a8a4b0');
  };
  D.violin = function (b) {
    b.ellipse(6, 11, 4.2, 3.6, '#8a4a20'); b.ellipse(8.5, 7.2, 3.2, 2.8, '#8a4a20'); b.rect(5, 8, 5, 3, '#8a4a20');
    b.thick(9, 6, 14, 1, 2, '#2a1a10'); b.rect(13, 0, 2, 3, '#4a2a18');
    b.line(5, 13, 12, 3, '#e8e0d0'); b.px(5, 10, '#2a1a10'); b.px(8, 11, '#2a1a10');
    b.px(4, 9, '#c87a40'); b.px(7, 6, '#c87a40'); b.rect(4, 13, 3, 1, '#2a1a10');
  };
  D.card = function (b) {
    b.rect(5, 1, 9, 12, '#f4f2f8'); b.frame(5, 1, 9, 12, '#c8c4d0'); b.px(9, 6, K.ink); b.poly([8, 7, 11, 7, 9.5, 4], K.ink);
    b.rect(2, 4, 9, 11, '#f4f2f8'); b.frame(2, 4, 9, 11, '#c8c4d0');
    b.px(6, 7, K.r2); b.px(5, 8, K.r2); b.px(7, 8, K.r2); b.px(6, 9, K.r2); b.px(5, 7, K.r2); b.px(7, 7, K.r2); b.px(6, 10, K.r2);
    b.px(3, 5, K.r2); b.px(9, 13, K.r2);
  };
  D.lamp = function (b) {
    b.poly([3, 6, 13, 6, 11, 1, 5, 1], '#7a5a2a'); b.hl(3, 6, 10, '#a8803a'); b.hl(5, 1, 6, '#c8a050');
    b.rect(7, 6, 2, 6, K.g1); b.rect(4, 12, 8, 2, K.g1); b.hl(4, 12, 8, K.g2);
    b.poly([5, 7, 11, 7, 13, 13, 3, 13], '#ffe8a0'); b.rect(7, 6, 2, 6, K.g1); b.rect(4, 12, 8, 2, K.g1);
    b.line(3, 14, 13, 14, K.g0);
  };
  D.window = function (b) {
    b.rect(2, 1, 12, 14, K.wd1); b.rect(3, 2, 10, 12, '#5a6a8a'); b.rect(3, 2, 10, 5, '#7a8aa8');
    b.vl(8, 2, 12, K.wd2); b.hl(3, 8, 10, K.wd2); b.line(4, 6, 6, 3, '#c8d8f0'); b.line(9, 12, 11, 9, '#a8b8d0');
    b.rect(1, 14, 14, 2, K.wd2);
  };
  D.door = function (b) {
    b.rect(3, 1, 10, 14, K.wd1); b.rect(2, 0, 12, 1, K.wd0);
    b.frame(4, 2, 8, 5, K.wd0); b.frame(4, 8, 8, 6, K.wd0); b.vl(3, 1, 14, K.wd2);
    b.rect(10, 8, 2, 2, K.g2); b.px(10, 8, K.g3);
    b.rect(12, 6, 2, 1, '#8a8a92');
  };
  D.cage = function (b) {
    b.ring(8, 2, 1.5, 1.5, K.g2);
    b.ellipse(8, 7, 6, 5, K.g1); b.ellipse(8, 7, 5, 4, '#1a1622'); b.rect(3, 7, 11, 6, '#1a1622');
    for (var x = 3; x < 14; x += 2) b.vl(x, 4, 9, K.g2);
    b.rect(2, 12, 13, 2, K.g1); b.hl(2, 12, 13, K.g2);
    b.poly([6, 9, 10, 9, 11, 11, 6, 11], '#0a0810'); b.px(10, 9, '#3a3a5a');
  };
  D.sand = function (b) {
    b.poly([1, 14, 4, 9, 8, 6, 12, 9, 15, 14], '#b8a478'); b.poly([3, 14, 6, 10, 9, 8, 13, 14], '#d8c898');
    b.speckle(2, 8, 13, 6, '#8a7a58', 0.25, X.rng('sandicon'), true); b.px(8, 7, '#f0e4c0');
    b.px(4, 4, '#d8c898'); b.px(10, 3, '#d8c898'); b.px(7, 2, '#b8a478');
  };
  D.boat = function (b) {
    b.poly([1, 7, 15, 7, 13, 12, 3, 12], K.wd2); b.hl(1, 7, 14, K.wd3); b.hl(2, 9, 12, K.wd1);
    b.poly([3, 8, 13, 8, 12, 9, 4, 9], K.wd0);
    b.thick(4, 3, 12, 10, 1, K.wd3); b.rect(11, 9, 3, 2, K.wd1);
    b.hl(0, 13, 16, '#4a6a8a'); b.hl(2, 14, 4, '#8aa8c8'); b.hl(10, 14, 5, '#8aa8c8');
  };
  D.cable = function (b) {
    b.circle(5, 5, 4, '#5a5a62'); b.circle(5, 5, 2.5, '#9a9aa6'); b.circle(5, 5, 1, '#2a2a30'); b.ring(5, 5, 4, 4, '#2a2a30');
    b.line(2, 9, 15, 15, '#2a2a30'); b.line(2, 8, 15, 14, '#8a8a92'); b.line(8, 2, 15, 10, '#2a2a30');
    b.px(4, 3, K.w0);
  };
  D.wax = function (b) {
    b.ellipse(8, 12, 6, 2.5, '#e8dcc4'); b.ellipse(8, 11.5, 5, 1.8, '#f8f0e0');
    b.circle(5, 6, 2, '#e8dcc4'); b.circle(10, 4, 1.5, '#e8dcc4'); b.circle(12, 8, 1.2, '#d8ccb4');
    b.px(4, 5, K.w0); b.px(9, 3, K.w0); b.vl(8, 8, 3, '#e8dcc4'); b.px(8, 7, '#f8f0e0');
  };
  D.sequin = function (b) {
    var pts = [[4, 4, '#e8c870'], [10, 3, '#c8a0f0'], [7, 9, '#f0d890'], [12, 10, '#a8c8f0'], [3, 12, '#e8a0c8']];
    for (var i = 0; i < pts.length; i++) { b.circle(pts[i][0] + 0.5, pts[i][1] + 0.5, 2, pts[i][2]); b.px(pts[i][0] - 1, pts[i][1] - 1, K.w0); b.px(pts[i][0], pts[i][1], '#5a4a6a'); }
    b.px(14, 2, K.w0); b.px(14, 1, '#e8e0ff'); b.px(13, 2, '#e8e0ff'); b.px(15, 2, '#e8e0ff'); b.px(14, 3, '#e8e0ff');
  };
  D.tooth = function (b) {
    b.poly([3, 3, 6, 1, 10, 1, 13, 3, 13, 7, 11, 9, 11, 14, 9, 14, 8, 10, 7, 14, 5, 14, 5, 9, 3, 7], '#f4f0e8');
    b.vl(12, 3, 4, '#c8c0b0'); b.vl(10, 9, 5, '#c8c0b0'); b.px(5, 3, K.w0); b.px(4, 4, K.w0);
    b.rect(5, 1, 7, 4, '#b8bcc8'); b.hl(5, 1, 6, '#e8ecf4'); b.vl(11, 2, 3, '#7a7e8a');
  };
  D.doll = function (b) {
    b.circle(8, 5, 4, '#f8f0ea'); b.clip(0, 0, 16, 5); b.circle(8, 4.5, 4.6, '#141018'); b.clip();
    b.rect(3, 3, 2, 5, '#141018'); b.rect(11, 3, 2, 5, '#141018'); b.hl(5, 4, 6, '#141018');
    b.px(6, 6, '#141018'); b.px(9, 6, '#141018'); b.px(7, 8, '#c04050');
    b.poly([3, 15, 5, 9, 11, 9, 13, 15], '#a02030'); b.rect(4, 11, 9, 2, '#e0b050'); b.line(6, 9, 9, 14, '#c03040');
  };
  D.testimony = function (b) {
    b.rect(1, 2, 14, 9, '#e8e4f0'); b.poly([4, 10, 9, 10, 3, 15], '#e8e4f0');
    b.hl(1, 10, 14, '#b8b2c4'); b.vl(14, 2, 9, '#b8b2c4');
    b.hl(3, 4, 10, '#5a5070'); b.hl(3, 6, 8, '#5a5070'); b.hl(3, 8, 6, '#5a5070');
  };
  D.body = function (b) {
    var c = '#e8e4f0';
    b.ring(8, 3, 2.4, 2.4, c); b.line(8, 6, 8, 10, c); b.line(7, 6, 7, 10, c);
    b.line(6, 7, 2, 9, c); b.line(9, 7, 13, 5, c); b.line(7, 10, 4, 14, c); b.line(8, 10, 12, 14, c);
    b.px(2, 10, c); b.px(14, 5, c);
  };
  D.generic = function (b) {
    b.ring(6.5, 6.5, 5, 5, K.g2, 2); b.circle(6.5, 6.5, 3.2, '#8aa8d8'); b.px(5, 4, K.w0); b.px(4, 5, K.w0);
    b.thick(10, 10, 14, 14, 2, K.wd1); b.line(10, 10, 14, 14, K.wd2);
  };

  I.draw = function (id) {
    var lay = new X.Buf(16, 16);
    var fn = D[id];
    if (!fn) {
      // 未知：问号卡片
      lay.rect(3, 1, 10, 14, '#3a3448'); lay.hl(3, 1, 10, '#5a5070');
      X.stamp(lay, 5, 3, ['.###.', '#...#', '...#.', '..#..', '..#..', '.....', '..#..'], { '#': '#e8dcc0' });
    } else fn(lay);
    lay.clip();
    var out = new X.Buf(16, 16);
    out.blit(lay.outlineLayer(function () { return C('#07060c'); }), 0, 0);
    out.blit(lay, 0, 0);
    return out;
  };
  I.ids = Object.keys(D);
  if (typeof module !== 'undefined' && module.exports) module.exports = I;
})(typeof window !== 'undefined' ? window : globalThis);
