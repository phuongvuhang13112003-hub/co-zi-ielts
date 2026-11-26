// ===== Văn & nhạc: fables, original fairy tales, classics, carols (public domain) + song-title study (no lyrics) =====
ICON.lit = sv('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>');
NAV.splice(5, 0, ['lit', 'lit', 'Văn & nhạc', 'Stories & songs']);
const LITK = [['fable', 'Ngụ ngôn Aesop', 'Aesop fables'], ['tale', 'Truyện gốc của Disney', 'Tales behind Disney'], ['classic', 'Sách kinh điển', 'Classic books'], ['carol', 'Bài hát cổ điển', 'Traditional songs'], ['songs', 'Học qua tên bài hát', 'Learn from song titles']];
const litTabs = cur => '<div class="tabs">' + LITK.map(k => '<button class="tab' + (k[0] === cur ? ' on' : '') + '" data-act="goArg" data-arg="lit|' + k[0] + '">' + tx(k[1], k[2]) + '</button>').join('') + '</div>';
const litQ = (it, i) => { const q = it.q[i]; return { k: 'mcq', p: q[0], o: q[1], a: q[2], e: q[3], key: 'lq:' + it.id + '|' + i, tag: it.title }; };
const litVocabQ = (it, i, pool) => { const v = it.vocab[i]; const others = shuffle(pool.filter(x => x[0] !== v[0])).slice(0, 3); const o = shuffle([v].concat(others)); return { k: 'mcq', p: tx('Nghĩa của "', 'Meaning of "') + v[0] + '" (' + it.title + ')?', o: o.map(x => x[2]), a: o.indexOf(v), e: v[0] + ' = ' + v[2] + (v[3] ? ' · ' + v[3] : ''), key: 'lv:' + it.id + '|' + i, tag: it.title }; };
const litPool = () => (window.LIT || []).flatMap(x => x.vocab);
window.litFromKey = (key, wantNew) => {
  const [id, ix] = key.slice(3).split('|'); const it = (window.LIT || []).find(x => x.id === id); if (!it) return null;
  if (key.startsWith('lq:')) { if (wantNew && it.vocab.length) return litVocabQ(it, Math.random() * it.vocab.length | 0, litPool()); return litQ(it, +ix); }
  if (key.startsWith('lv:')) return litVocabQ(it, +ix, litPool());
  return null;
};
VIEWS.lit = (tab = 'fable') => {
  const L = window.LIT || [];
  const sub = tx('Học từ vựng và ngữ pháp qua truyện ngụ ngôn, truyện cổ tích gốc, sách kinh điển và bài hát. Văn bản đều thuộc phạm vi công cộng hoặc được kể lại; bài hát hiện đại chỉ phân tích tên bài & chủ đề (không chép lời).', 'Learn vocabulary and grammar through fables, original fairy tales, classics and songs. Texts are public domain or retold; modern songs are studied by title and theme only (no lyrics).');
  if (tab === 'songs') {
    const arts = [...new Set((window.SONGS || []).map(s => s[0]))];
    page(head(tx('Văn & nhạc', 'Stories & songs'), sub) + litTabs('songs') +
      '<section class="card"><p class="small muted">' + tx('Lời bài hát có bản quyền nên app không chép lại. Hãy nghe bài trên Spotify/YouTube, rồi dùng thẻ dưới đây để học từ khóa, ngữ pháp trong tên bài và chủ đề. Mẹo: nghe kèm lời trên trang có bản quyền (Spotify, Apple Music hiển thị lời) và ghi lại 3 cụm từ mới mỗi bài.', 'Lyrics are copyrighted, so they are not reproduced. Listen on Spotify/YouTube, then use these cards to study key words, title grammar and theme.') + '</p><div class="actions"><button class="btn" data-act="songQuiz">' + tx('Đố vui tên bài hát', 'Song-title quiz') + '</button></div></section>' +
      arts.map(a => '<section class="card"><h2>' + ICON.lit + ' ' + esc(a) + '</h2>' + SONGS.filter(s => s[0] === a).map(s => '<div class="idiom"><div class="row between"><b>' + esc(s[1]) + '</b><span class="small muted">' + esc(s[3]) + ' · ' + esc(s[2]) + ' · ' + s[4] + '</span></div><span class="vi">' + esc(s[5]) + '</span><em>' + esc(s[6]) + '</em><span class="small">' + tx('Từ khóa: ', 'Key words: ') + s[7].map(esc).join(' · ') + '</span></div>').join('') + '</section>').join(''));
    return;
  }
  const items = L.filter(x => x.kind === tab);
  page(head(tx('Văn & nhạc', 'Stories & songs'), sub) + litTabs(tab) +
    '<div class="exgrid">' + items.map(it => { const st = S.stamps['l:' + it.id]; return '<button class="card extile littile" data-act="goArg" data-arg="litItem|' + it.id + '"><div class="extxt"><b>' + esc(it.title) + '</b><p class="muted small">' + esc(it.by) + ' · ' + esc(it.year) + ' · ' + it.lvl + '</p><p class="small">' + esc(it.vi.slice(0, 120)) + (it.vi.length > 120 ? '…' : '') + '</p>' + (st ? '<span class="small ok">' + ICON.stamp + ' ' + st.s + '%</span>' : '') + '</div></button>'; }).join('') + '</div>');
};
VIEWS.litItem = id => {
  const it = (window.LIT || []).find(x => x.id === id); if (!it) return go('lit');
  const body = esc(it.text).replace(/\n/g, '<br>');
  page(head(esc(it.title), esc(it.by) + ' · ' + esc(it.year) + ' · ' + it.lvl, 'lit', it.kind) +
    (it.quote ? '<section class="card"><p class="eyebrow">' + tx('Câu văn gốc nổi tiếng (phạm vi công cộng)', 'Famous original line (public domain)') + '</p><blockquote class="enread">“' + esc(it.quote) + '”</blockquote><button class="btn ghost sm" data-act="say" data-arg="' + esc(it.quote) + '">' + ICON.speak + tx('Nghe', 'Listen') + '</button></section>' : '') +
    '<section class="card"><div class="cardh"><h2>' + (it.kind === 'carol' ? tx('Lời bài hát', 'Lyrics') : it.kind === 'classic' ? tx('Tóm tắt (viết lại)', 'Adapted summary') : tx('Truyện', 'Story')) + '</h2><button class="btn ghost sm" data-act="say" data-arg="' + esc(it.text.replace(/\n/g, ' ')) + '">' + ICON.speak + tx('Nghe', 'Listen') + '</button></div><p class="enread">' + body + '</p><p class="small muted">' + esc(it.vi) + '</p>' + (it.moral ? '<p><b>' + tx('Bài học: ', 'Moral: ') + '</b>' + esc(it.moral) + '</p>' : '') + '</section>' +
    '<section class="card"><h2>' + tx('Từ vựng', 'Vocabulary') + '</h2>' + it.vocab.map(v => '<div class="idiom"><div class="row between"><b>' + esc(v[0]) + ' <span class="small muted">(' + esc(v[1]) + ')</span></b><button class="iconbtn sm" data-act="say" data-arg="' + esc(v[0]) + '">' + ICON.speak + '</button></div><span class="vi">' + esc(v[2]) + '</span>' + (v[3] ? '<em>' + esc(v[3]) + '</em>' : '') + '</div>').join('') + '</section>' +
    '<section class="card"><h2>' + tx('Phân tích ngữ pháp', 'Grammar analysis') + '</h2>' + it.gram.map(g => '<div class="idiom"><b>' + esc(g[0]) + '</b><span>' + esc(g[1]) + '</span><em>' + esc(g[2]) + '</em></div>').join('') + '</section>' +
    (it.facts ? '<section class="card dyk"><h2>' + ICON.spark + ' ' + tx('Bạn có biết?', 'Did you know?') + '</h2><ul>' + it.facts.map(f => '<li>' + esc(f) + '</li>').join('') + '</ul></section>' : '') +
    '<div class="actions"><button class="btn" data-act="litQuiz" data-arg="' + it.id + '">' + tx('Kiểm tra lấy tem', 'Stamp test') + '</button><button class="btn ghost" data-act="goArg" data-arg="flash|lit:' + it.id + '">Flashcard</button></div>');
};
ACT.litQuiz = id => {
  const it = LIT.find(x => x.id === id); const pool = litPool();
  const qs = shuffle(it.q.map((_, i) => litQ(it, i)).concat(it.vocab.map((_, i) => litVocabQ(it, i, pool))));
  runQuiz({ title: it.title, qs, mode: 'practice', kind: 'lit', back: () => go('litItem', id), onFinish: r => earnStamp('l:' + id, r.pct, it.title, it.kind === 'carol' ? 'star' : 'book') });
};
ACT.songQuiz = () => {
  const S2 = shuffle((window.SONGS || []).slice()).slice(0, 10), all = window.SONGS;
  const qs = S2.map(s => { const wrong = shuffle(all.filter(x => x[0] !== s[0]).map(x => x[0]).filter((v, i, a) => a.indexOf(v) === i)).slice(0, 3); const o = shuffle([s[0]].concat(wrong)); return { k: 'mcq', p: tx('Bài "', 'Who performs "') + s[1] + tx('" (' + s[2] + ') của nghệ sĩ nào? Gợi ý: ', '" (' + s[2] + ')? Hint: ') + s[5], o, a: o.indexOf(s[0]), e: s[6], key: null }; });
  runQuiz({ title: tx('Đố vui bài hát', 'Song quiz'), qs, mode: 'practice', kind: 'lit', back: () => go('lit', 'songs') });
};

// ===== Expand any vocabulary lesson to 30+ words with the in-app AI (saved, then reviewed like built-in words) =====
const EXT = { loaded: {}, idx: null };
const extK = key => 'ext_' + key.replace(/\//g, '~');
async function extIndex() { if (!EXT.idx) { const d = await Store.get('ext_idx'); EXT.idx = (d && d.k) || []; } return EXT.idx; }
async function loadExt(key) {
  if (EXT.loaded[key]) return; EXT.loaded[key] = true;
  const d = await Store.get(extK(key)); const sub = subByKey(key);
  if (d && d.w && sub) { const have = new Set(sub.s.w.map(w => w[0].toLowerCase())); d.w.forEach(w => { if (!have.has(w[0].toLowerCase())) { sub.s.w.push(w); have.add(w[0].toLowerCase()); } }); }
}
async function ensureExtAll() { const ix = await extIndex(); await Promise.all(ix.map(loadExt)); }
const wrapAsync = name => { const orig = VIEWS[name]; VIEWS[name] = (...a) => { if (EXT.all) return orig(...a); page('<p class="muted pulse center">…</p>'); ensureExtAll().catch(() => {}).then(() => { EXT.all = true; if (CUR.view === name) VIEWS[name](...a); }); }; };
['sub', 'review', 'games', 'flash', 'match', 'cross', 'scramble'].forEach(n => VIEWS[n] && wrapAsync(n));
const _origSub = VIEWS.sub;
VIEWS.sub = key => {
  _origSub(key);
  const sub = subByKey(key); if (!sub || !EXT.all) return; const n = sub.s.w.length;
  if (n < 30) { const box = document.createElement('section'); box.className = 'card'; box.innerHTML = '<p>' + tx('Bài này có ' + n + ' từ. ', 'This lesson has ' + n + ' words. ') + (AI.ok() ? tx('Bấm để AI bổ sung thêm ' + (30 - n) + ' từ cùng chủ đề, cùng cấp độ (có nghĩa, ví dụ, collocation, từ đồng nghĩa). Từ mới được lưu lại và vào lịch ôn tập như từ có sẵn.', 'Let the AI add ' + (30 - n) + ' more words on this topic and level.') + '</p><button class="btn alt" data-act="extend" data-arg="' + esc(key) + '">' + ICON.spark + tx('Mở rộng lên 30 từ', 'Expand to 30 words') + '</button>' : tx('Bạn có thể tự bổ sung từ cho chủ đề này ở Học › Của tôi › Kho tự thêm (app sẽ báo nếu từ đã có).', 'Add your own words in Learn › Mine › My library.') + '</p>'); const acts = $('.actions'); acts && acts.after(box); }
};
ACT.extend = async (key, btn) => {
  const sub = subByKey(key); if (!sub) return; const need = 30 - sub.s.w.length; if (need <= 0) return;
  btn.disabled = true; btn.textContent = tx('AI đang soạn…', 'AI is writing…');
  const have = sub.s.w.map(w => w[0]);
  const p = 'You are writing an English vocabulary list for Vietnamese IELTS learners. Topic: "' + sub.s.t[1] + '" (part of "' + sub.tp.t[1] + '"), CEFR level ' + sub.s.lvl + '. Existing words (do NOT repeat): ' + have.join(', ') + '.\nGive exactly ' + (need + 2) + ' NEW useful words or short phrases for this topic and level. At least 60% must be verbs and adjectives (the parts of speech learners most need for paraphrasing), each with real, interchangeable synonyms. Return a JSON array; each item is an array of 7 strings: [word, part of speech (n/v/adj/adv/phr), Vietnamese meaning (short), simple English definition, one natural example sentence that contains the word, 1-2 common collocations, 1-2 synonyms]. Accurate meanings only.';
  try {
    const r = await AI.json(p); const arr = (Array.isArray(r) ? r : (r.words || r.items || [])).filter(x => Array.isArray(x) && x.length >= 5 && x.every(y => typeof y === 'string') && x[0].trim());
    const seen = new Set(have.map(x => x.toLowerCase())); const add = [];
    arr.forEach(x => { const w = x[0].trim(); if (!seen.has(w.toLowerCase()) && add.length < need) { seen.add(w.toLowerCase()); add.push([w, x[1] || '', x[2] || '', x[3] || '', x[4] || '', x[5] || '', x[6] || '']); } });
    if (!add.length) throw { code: 'empty' };
    const old = (await Store.get(extK(key))) || { w: [] }; old.w = (old.w || []).concat(add); await Store.set(extK(key), old);
    const ix = await extIndex(); if (!ix.includes(key)) { ix.push(key); Store.set('ext_idx', { k: ix }); }
    sub.s.w.push(...add); toast(tx('Đã thêm ' + add.length + ' từ mới!', 'Added ' + add.length + ' words!')); go('sub', key);
  } catch (e) { btn.disabled = false; btn.textContent = tx('Thử lại', 'Try again'); }
};
