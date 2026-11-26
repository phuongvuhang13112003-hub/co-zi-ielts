// ===== Kho của tôi: learners add their own topics, words, grammar, collocations, idioms, paraphrases – with duplicate checking =====
const MK = { topic: ['Chủ đề', 'Topic'], word: ['Từ vựng', 'Word'], gram: ['Ngữ pháp', 'Grammar'], col: ['Collocation', 'Collocation'], idiom: ['Idiom', 'Idiom'], para: ['Paraphrase', 'Paraphrase'] };
const nz = s => String(s || '').toLowerCase().normalize('NFC').replace(/[“”"'’.,!?;:()\[\]…]/g, ' ').replace(/\s+/g, ' ').trim().replace(/^(to|a|an|the|be) /, '');
function lev(a, b) { if (Math.abs(a.length - b.length) > 2) return 9; const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }
const myTopics = () => (LIB.items || []).filter(x => x.type === 'vocab');
const myItems = k => (LIB.items || []).filter(x => x.type === 'mine' && (!k || x.kind === k));
let MIDX = null;
function mineIndex() { // everything already in the app, normalised, with where it lives
  if (MIDX) return MIDX; const out = []; const add = (kind, raw, where, link) => { const n = nz(raw); if (n) out.push({ kind, n, raw, where, link }); };
  C.T.forEach(tp => { add('topic', tp.t[0], tx('Chủ đề lớn', 'Topic'), 'topic|' + tp.id); add('topic', tp.t[1], tx('Chủ đề lớn', 'Topic'), 'topic|' + tp.id);
    tp.subs.forEach(s => { const key = tp.id + '/' + s.id, wh = pick(tp.t) + ' › ' + pick(s.t); add('topic', s.t[0], wh, 'sub|' + key); add('topic', s.t[1], wh, 'sub|' + key);
      s.w.forEach(w => { add('word', w[0], wh, 'sub|' + key); String(w[5] || '').split(/[\/;,]/).forEach(c => c.trim().includes(' ') && add('col', c, wh + ' (collocation của "' + w[0] + '")', 'sub|' + key)); });
      (s.i || []).forEach(i => add('idiom', i[0], wh, 'sub|' + key)); }); });
  (window.IDIOMS || []).forEach(T => T.i.forEach(i => add('idiom', i[0], 'Idioms › ' + pick(T.th), 'idioms|' + T.id)));
  C.G.forEach(u => { add('gram', u.t[0], tx('Ngữ pháp ', 'Grammar ') + u.lvl, 'unit|' + u.id); add('gram', u.t[1], tx('Ngữ pháp ', 'Grammar ') + u.lvl, 'unit|' + u.id); if (u.f) add('gram', u.f, tx('Công thức – ', 'Formula – ') + pick(u.t), 'unit|' + u.id); });
  C.P.forEach(p => { add('para', p[0], tx('Cấu trúc tương đương', 'Paraphrasing'), 'learn|para'); });
  (window.SWAP || []).forEach(g => { add('word', g[0], tx('Đổi từ', 'Word swaps'), 'swap|' + g[1]); g[3].split(',').forEach(x => add('word', x.trim(), tx('Đổi từ (từ thay thế của "', 'Word swaps (for "') + g[0] + '")', 'swap|' + g[1])); });
  (window.ADJBANK || []).forEach(G => G.w.forEach(w => add('word', w[0], tx('Kho tính từ › ', 'Adjective bank › ') + pick(G.g), 'adjbank|' + G.id)));
  (window.LIT || []).forEach(it => it.vocab.forEach(v => add('word', v[0], tx('Văn & nhạc › ', 'Stories › ') + it.title, 'litItem|' + it.id)));
  LV.forEach(l => levelList(l).forEach(x => add('word', x.w, tx('Từ điển CEFR cấp ', 'CEFR list ') + l, 'dict|' + l + '|0|' + x.w)));
  return (MIDX = out);
}
function findDup(kind, raw) {
  const n = nz(raw); if (n.length < 2) return [];
  const kinds = kind === 'word' ? ['word', 'idiom', 'col'] : kind === 'col' ? ['col', 'word', 'idiom'] : kind === 'idiom' ? ['idiom', 'col', 'word'] : [kind];
  const res = []; const mine = [];
  myTopics().forEach(t => { const d = t.data; if (kind === 'topic') { [d.t[0], d.t[1]].forEach(x => mine.push({ kind: 'topic', n: nz(x), raw: x, where: tx('Kho của tôi', 'My library'), link: 'sub|ai/' + t.id, own: 1 })); } d.w.forEach(w => mine.push({ kind: 'word', n: nz(w[0]), raw: w[0], where: tx('Kho của tôi › ', 'My library › ') + pick(d.t), link: 'sub|ai/' + t.id, own: 1 })); (d.i || []).forEach(i => mine.push({ kind: 'idiom', n: nz(i[0]), raw: i[0], where: tx('Kho của tôi', 'My library'), link: 'sub|ai/' + t.id, own: 1 })); });
  myItems().forEach(x => mine.push({ kind: x.kind, n: nz(x.a), raw: x.a, where: tx('Kho của tôi › ', 'My library › ') + pick(MK[x.kind]), link: 'mine|' + x.kind, own: 1, id: x.id }));
  mine.concat(mineIndex()).forEach(e => {
    if (!kinds.includes(e.kind)) return; let score = 0;
    if (e.n === n) score = 3;
    else if (n.length >= 4 && e.n.length >= 4 && lev(e.n, n) <= (n.length >= 8 ? 2 : 1)) score = 2;
    else if ((n.includes(' ') || e.n.includes(' ')) && n.length >= 5 && e.n.length >= 5 && (e.n.includes(n) || n.includes(e.n))) score = 1;
    else if (kind === 'topic' || kind === 'gram') { const a = new Set(n.split(' ').filter(x => x.length > 2)), b = e.n.split(' ').filter(x => x.length > 2); const common = b.filter(x => a.has(x)).length; if (a.size && common / Math.max(a.size, b.length) >= .6) score = 1; }
    if (score) res.push(Object.assign({ score }, e));
  });
  const seen = new Set(); return res.sort((a, b) => b.score - a.score || (b.own || 0) - (a.own || 0)).filter(r => { const k = r.where + r.raw; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 6);
}
const dupHTML = r => !r.length ? '<p class="small ok">' + ICON.spark + ' ' + tx('Chưa có trong app – thêm được!', 'Not in the app yet – go ahead!') + '</p>' :
  '<div class="dupbox"><b>' + (r[0].score === 3 ? tx('Đã có sẵn:', 'Already exists:') : tx('Có mục gần giống:', 'Similar items found:')) + '</b><ul>' + r.map(x => '<li><span class="tag' + (x.score === 3 ? ' bad' : '') + '">' + (x.score === 3 ? tx('trùng', 'same') : x.score === 2 ? tx('gần giống', 'close') : tx('liên quan', 'related')) + '</span> <b>' + esc(x.raw) + '</b> · <button class="link" data-act="goArg" data-arg="' + esc(x.link) + '">' + esc(x.where) + '</button></li>').join('') + '</ul></div>';
const FIELDS = {
  topic: [['a', 'Tên chủ đề (tiếng Việt)', 'Topic name (Vietnamese)'], ['b', 'Tên tiếng Anh', 'English name'], ['lvl', 'Cấp độ', 'Level', 'lvl']],
  word: [['tp', 'Thêm vào chủ đề', 'Add to topic', 'tp'], ['a', 'Từ / cụm từ', 'Word / phrase'], ['pos', 'Loại từ', 'Part of speech', 'pos'], ['vi', 'Nghĩa tiếng Việt', 'Vietnamese meaning'], ['def', 'Định nghĩa tiếng Anh (tuỳ chọn)', 'English definition (optional)'], ['ex', 'Câu ví dụ', 'Example sentence'], ['col', 'Collocations (cách nhau bằng dấu phẩy)', 'Collocations'], ['syn', 'Từ đồng nghĩa', 'Synonyms']],
  gram: [['a', 'Tên cấu trúc', 'Structure name'], ['f', 'Công thức', 'Formula'], ['vi', 'Cách dùng (tiếng Việt)', 'Usage'], ['ex', 'Câu ví dụ', 'Example']],
  col: [['a', 'Collocation', 'Collocation'], ['vi', 'Nghĩa', 'Meaning'], ['ex', 'Câu ví dụ', 'Example']],
  idiom: [['a', 'Idiom', 'Idiom'], ['vi', 'Nghĩa', 'Meaning'], ['ex', 'Câu ví dụ', 'Example']],
  para: [['a', 'Cách nói gốc', 'Original'], ['vi', 'Cách nói tương đương', 'Equivalent'], ['ex', 'Ghi chú / ví dụ', 'Note / example']]
};
VIEWS.mine = (kind = 'word') => {
  const tps = myTopics(); const F = FIELDS[kind];
  const field = f => { const lab = tx(f[1], f[2]); if (f[3] === 'lvl') return '<label>' + lab + '<select name="lvl">' + LV.map(l => '<option' + (l === S.level ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label>';
    if (f[3] === 'pos') return '<label>' + lab + '<select name="pos">' + ['n', 'v', 'adj', 'adv', 'phr v', 'phr', 'prep', 'conj'].map(p => '<option' + (p === 'adj' ? ' selected' : '') + '>' + p + '</option>').join('') + '</select></label>';
    if (f[3] === 'tp') return '<label>' + lab + '<select name="tp">' + tps.map(t => '<option value="' + t.id + '">' + esc(pick(t.data.t)) + ' (' + t.data.w.length + ')</option>').join('') + '<option value="__new">' + tx('+ Chủ đề mới "Từ tự thêm"', '+ New topic "My words"') + '</option></select></label>';
    return '<label>' + lab + '<input name="' + f[0] + '" autocomplete="off"' + (f[0] === 'a' || f[0] === 'vi' && kind !== 'word' ? ' required' : '') + '></label>'; };
  const list = kind === 'topic' ? tps.map(t => '<div class="idiom"><div class="row between"><button class="link" data-act="goArg" data-arg="sub|ai/' + t.id + '"><b>' + esc(pick(t.data.t)) + '</b></button><span class="small muted">' + t.data.lvl + ' · ' + t.data.w.length + tx(' từ', ' words') + (t.data.user ? '' : ' · AI') + '</span></div></div>').join('')
    : kind === 'word' ? tps.filter(t => t.data.user || t.data.w.some(w => w[7] === 'me')).map(t => '<h3>' + esc(pick(t.data.t)) + '</h3>' + t.data.w.map((w, i) => w[7] === 'me' || t.data.user ? '<div class="idiom"><div class="row between"><b>' + esc(w[0]) + ' <small class="muted">' + esc(w[1]) + '</small></b><button class="iconbtn sm" data-act="mineDelW" data-arg="' + t.id + '|' + i + '" aria-label="delete">' + ICON.x + '</button></div><span class="vi">' + esc(w[2]) + '</span>' + (w[4] ? '<em>' + esc(w[4]) + '</em>' : '') + '</div>' : '').join('')).join('')
      : myItems(kind).map(x => '<div class="idiom"><div class="row between"><b>' + esc(x.a) + (x.f ? ' <small class="muted">' + esc(x.f) + '</small>' : '') + '</b><button class="iconbtn sm" data-act="mineDel" data-arg="' + x.id + '" aria-label="delete">' + ICON.x + '</button></div><span class="vi">' + esc(x.vi || '') + '</span>' + (x.ex ? '<em>' + esc(x.ex) + '</em>' : '') + '</div>').join('');
  const cnt = k => k === 'topic' ? tps.length : k === 'word' ? tps.reduce((a, t) => a + t.data.w.filter(w => w[7] === 'me' || t.data.user).length, 0) : myItems(k).length;
  page(head(tx('Học', 'Learn'), tx('Tự thêm nội dung của riêng bạn. App rà soát ngay khi bạn gõ để báo mục đã có sẵn hoặc gần giống, tránh trùng lặp. Mục tự thêm được đưa vào luyện tập, ôn tập và trò chơi như nội dung có sẵn.', 'Add your own content. The app checks as you type for existing or similar items. Your items join practice, review and games.')) + learnTabs('mine') +
    '<div class="chips lvf">' + Object.keys(MK).map(k => '<button class="chipb' + (k === kind ? ' on' : '') + '" data-act="goArg" data-arg="mine|' + k + '">' + tx(MK[k][0], MK[k][1]) + ' <small>' + cnt(k) + '</small></button>').join('') + '</div>' +
    '<section class="card"><h2>' + tx('Thêm ', 'Add ') + tx(MK[kind][0], MK[kind][1]).toLowerCase() + '</h2><form id="minef" class="mineform">' + F.map(field).join('') + '<div id="dupout" class="full"></div><div class="full row"><button class="btn" id="mineadd">' + tx('Thêm', 'Add') + '</button>' + (kind !== 'topic' && kind !== 'word' && myItems(kind).length >= 2 ? '<button type="button" class="btn alt" data-act="mineQuiz" data-arg="' + kind + '">' + tx('Luyện mục của tôi', 'Practise mine') + '</button><button type="button" class="btn ghost" data-act="goArg" data-arg="flash|mine:' + kind + '">Flashcard</button>' : '') + '<button type="button" class="btn ghost" data-act="mineAudit">' + tx('Rà soát toàn bộ kho', 'Audit my library') + '</button></div></form></section>' +
    (list ? '<section class="card"><h2>' + tx('Đã thêm', 'Added') + '</h2>' + list + '</section>' : ''));
  const f = $('#minef'), out = $('#dupout'); let tm = null, last = [];
  const check = () => { const v = f.a.value.trim(), v2 = f.b ? f.b.value.trim() : ''; if (!v && !v2) { out.innerHTML = ''; last = []; return; } last = findDup(kind, v || v2); if (kind === 'topic' && v2 && v) last = last.concat(findDup('topic', v2)).slice(0, 6);
    if (kind === 'para') { const p = C.P.find(x => nz(x[0]) === nz(v)); if (p) last.unshift({ score: 3, raw: p[0] + ' → ' + p[1], where: tx('Cấu trúc tương đương', 'Paraphrasing'), link: 'learn|para' }); }
    out.innerHTML = dupHTML(last); const own = last.some(x => x.own && x.score === 3); $('#mineadd').textContent = own ? tx('Đã có trong kho của bạn', 'Already in your library') : last.some(x => x.score === 3) ? tx('Vẫn thêm (bổ sung ví dụ riêng)', 'Add anyway') : tx('Thêm', 'Add'); $('#mineadd').disabled = own; };
  f.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(check, 250); });
  f.addEventListener('submit', e => { e.preventDefault(); check(); if (last.some(x => x.own && x.score === 3)) return; const d = Object.fromEntries(new FormData(f)); ACT.mineSave(kind, d); });
};
ACT.mineSave = (kind, d) => {
  const t = s => String(s || '').trim().slice(0, 300);
  if (kind === 'topic') { if (!t(d.a) && !t(d.b)) return; const id = uid(); LIB.items.push({ id, type: 'vocab', created: today(), data: { id, user: true, lvl: d.lvl, t: [t(d.a) || t(d.b), t(d.b) || t(d.a)], w: [], i: [] } }); saveLib(); MIDX = null; toast(tx('Đã tạo chủ đề – thêm từ vào nhé!', 'Topic created!')); return go('mine', 'word'); }
  if (kind === 'word') {
    if (!t(d.a) || !t(d.vi)) { toast(tx('Cần có từ và nghĩa.', 'Word and meaning are required.')); return; }
    let tp = myTopics().find(x => x.id === d.tp); if (!tp) { const id = uid(); tp = { id, type: 'vocab', created: today(), data: { id, user: true, lvl: S.level, t: ['Từ tự thêm', 'My words'], w: [], i: [] } }; LIB.items.push(tp); }
    tp.data.w.push([t(d.a), t(d.pos), t(d.vi), t(d.def) || t(d.vi), t(d.ex), t(d.col), t(d.syn), 'me']); saveLib(); toast(tx('Đã thêm "' + t(d.a) + '"', 'Added "' + t(d.a) + '"')); return go('mine', 'word');
  }
  if (!t(d.a)) return; LIB.items.push({ id: uid(), type: 'mine', kind, a: t(d.a), f: t(d.f), vi: t(d.vi), ex: t(d.ex), created: today() }); saveLib(); toast(tx('Đã thêm!', 'Added!')); go('mine', kind);
};
ACT.mineDel = id => { LIB.items = LIB.items.filter(x => x.id !== id); saveLib(); rerender(); };
ACT.mineDelW = a => { const [id, i] = a.split('|'); const tp = myTopics().find(x => x.id === id); if (tp) { tp.data.w.splice(+i, 1); saveLib(); } rerender(); };
ACT.mineAudit = () => {
  const rows = [];
  myTopics().forEach(tp => tp.data.w.forEach(w => { if (!(tp.data.user || w[7] === 'me')) return; const r = findDup('word', w[0]).filter(x => x.score === 3 && !(x.own && x.link === 'sub|ai/' + tp.id)); if (r.length) rows.push([w[0], pick(MK.word), r]); }));
  myItems().forEach(x => { const r = findDup(x.kind, x.a).filter(y => y.score >= 2 && y.id !== x.id); if (r.length) rows.push([x.a, pick(MK[x.kind]), r]); });
  const seenW = {}; myTopics().forEach(tp => tp.data.w.forEach(w => { const n = nz(w[0]); (seenW[n] = seenW[n] || []).push(pick(tp.data.t)); }));
  const inner = Object.entries(seenW).filter(x => x[1].length > 1);
  modal('<div><h2>' + tx('Rà soát kho của tôi', 'Library audit') + '</h2>' + (!rows.length && !inner.length ? '<p class="ok">' + tx('Không có mục nào trùng. Gọn gàng!', 'No duplicates found.') + '</p>' : '') +
    (inner.length ? '<p><b>' + tx('Từ lặp lại giữa các chủ đề của bạn:', 'Words repeated across your topics:') + '</b></p><ul>' + inner.map(x => '<li><b>' + esc(x[0]) + '</b> – ' + x[1].map(esc).join(', ') + '</li>').join('') + '</ul>' : '') +
    (rows.length ? '<p><b>' + tx('Mục bạn thêm đã có sẵn trong app:', 'Your items that already exist in the app:') + '</b></p><ul>' + rows.map(r => '<li><b>' + esc(r[0]) + '</b> (' + esc(r[1]) + ') → ' + r[2].slice(0, 2).map(x => esc(x.where)).join('; ') + '</li>').join('') + '</ul><p class="small muted">' + tx('Không sao nếu bạn cố ý giữ (ví dụ để có câu ví dụ riêng) – còn không thì xoá bớt cho gọn.', 'Keep them if you added your own examples; otherwise delete to stay tidy.') + '</p>' : '') +
    '<button class="btn" data-act="closeModal">OK</button></div>');
};
function mineQ(x) { const pool = myItems(x.kind).filter(y => y.id !== x.id && y.vi); let wrong = shuffle(pool).slice(0, 3).map(y => y.vi);
  if (wrong.length < 3) wrong = wrong.concat(shuffle((window.IDIOMS || []).flatMap(T => T.i.map(i => i[1]))).slice(0, 3 - wrong.length));
  const o = shuffle([x.vi].concat(wrong)); return { k: 'mcq', p: x.kind === 'para' ? tx('Cách nói tương đương của: "', 'Equivalent of: "') + x.a + '"' : '"' + x.a + '"' + (x.f ? ' (' + x.f + ')' : '') + tx(' – nghĩa / cách dùng?', ' – meaning / use?'), o, a: o.indexOf(x.vi), e: x.ex || '', key: 'my:' + x.id, tag: tx('Kho của tôi', 'My library') }; }
ACT.mineQuiz = k => runQuiz({ title: tx('Kho của tôi', 'My library') + ' · ' + pick(MK[k]), qs: shuffle(myItems(k).filter(x => x.vi)).slice(0, 15).map(mineQ), mode: 'practice', kind: 'mine', back: () => go('mine', k) });
const _qfk3 = qFromKey;
qFromKey = function (key, it, wantNew) { if (key && key.startsWith('my:')) { const x = myItems().find(y => y.id === key.slice(3)); return x && x.vi ? mineQ(x) : null; } return _qfk3(key, it, wantNew); };
const _dw3 = deckWords;
deckWords = function (key) { if (key && key.startsWith('mine:')) return myItems(key.slice(5)).filter(x => x.vi).map(x => ({ w: x.a, pos: pick(MK[x.kind]), vi: x.vi, def: x.vi, ex: x.ex || '', col: '', syn: '', key: 'my:' + x.id })); return _dw3(key); };
