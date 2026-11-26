// ===== Learn › Word swaps (verbs, adjectives, synonyms, word families) =====
const swSyns = g => g[3].split(',').map(x => x.trim()).filter(Boolean);
const swHL = (s, w) => s.replace(new RegExp('\\b(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w{0,3})', 'i'), '«$1»');
function swapQ(i, type) {
  const g = SWAP[i]; if (!g) return null; const same = SWAP.filter((x, j) => j !== i && x[1] === g[1]);
  if (type === 'rev') { const s = pick2(swSyns(g)); const o = shuffle([g[0]].concat(shuffle(same).slice(0, 3).map(x => x[0]))); return { k: 'mcq', p: tx('"' + s + '" gần nghĩa nhất với từ nào?', 'Which word is closest in meaning to "' + s + '"?'), o, a: o.indexOf(g[0]), e: g[0] + ' ≈ ' + g[3] + '. ' + g[5], key: 'sw:' + i, tag: g[1] === 'v' ? tx('Động từ', 'Verb') : tx('Tính từ', 'Adjective') }; }
  const right = pick2(swSyns(g)); const wrong = shuffle(same.flatMap(swSyns)).filter((x, j, a) => a.indexOf(x) === j && !swSyns(g).includes(x)).slice(0, 3); const o = shuffle([right].concat(wrong));
  return { k: 'mcq', p: tx('Từ nào thay được cho từ trong «» mà giữ nguyên nghĩa? — ', 'Which word can replace the word in «» without changing the meaning? — ') + swHL(g[4], g[0].split(' ')[0]), o, a: o.indexOf(right), e: g[0] + ' → ' + g[3] + '. ' + g[5], key: 'sw:' + i, tag: g[1] === 'v' ? tx('Động từ', 'Verb') : tx('Tính từ', 'Adjective') };
}
const pick2 = a => a[Math.random() * a.length | 0];
function famQ(i) {
  const f = WFAM[i]; if (!f) return null; const forms = [...new Set(f.slice(0, 4).flatMap(x => x.split('/').map(y => y.trim())).filter(x => x && x !== '—' && !x.includes('(')))];
  if (!forms.includes(f[5])) forms.push(f[5]); const o = shuffle([f[5]].concat(shuffle(forms.filter(x => x !== f[5])).slice(0, 3)));
  return { k: 'mcq', p: tx('Chọn dạng từ đúng: ', 'Choose the correct word form: ') + f[4], o, a: o.indexOf(f[5]), e: 'V: ' + f[0] + ' · N: ' + f[1] + ' · Adj: ' + f[2] + ' · Adv: ' + f[3], key: 'wf:' + i, tag: 'Word family' };
}
function topicSynQ() { // verbs & adjectives from topic lessons
  const ws = allSubs().filter(x => !x.ai).flatMap(wordsOf).filter(w => /^(v|adj)/.test(w.pos) && firstSyn(w) && firstSyn(w) !== '—');
  const w = pick2(ws); const others = shuffle(ws.filter(x => x.pos === w.pos && x.w !== w.w)).slice(0, 3);
  const q = vocabQ(w, [w].concat(others), 'syn'); return q;
}
const _qfk = qFromKey;
qFromKey = function (key, it, wantNew) {
  if (key && key.startsWith('sw:')) return swapQ(+key.slice(3), wantNew ? 'rev' : (Math.random() < .7 ? 'syn' : 'rev'));
  if (key && key.startsWith('wf:')) return famQ(+key.slice(3));
  return _qfk(key, it, wantNew);
};
VIEWS.swap = (tab = 'v') => {
  const list = tab === 'fam' ? null : SWAP.map((g, i) => [g, i]).filter(x => x[0][1] === tab);
  page(head(tx('Học', 'Learn'), tx('Động từ & tính từ là "chìa khóa" để paraphrase. Mỗi từ quen thuộc có 3 từ thay thế + ghi chú sắc thái; thêm bảng họ từ (word family) để đổi loại từ.', 'Verbs and adjectives are the key to paraphrasing.')) + learnTabs('swap') +
    '<div class="chips lvf"><button class="chipb' + (tab === 'v' ? ' on' : '') + '" data-act="goArg" data-arg="swap|v">' + tx('Động từ', 'Verbs') + ' (' + SWAP.filter(g => g[1] === 'v').length + ')</button><button class="chipb' + (tab === 'adj' ? ' on' : '') + '" data-act="goArg" data-arg="swap|adj">' + tx('Tính từ cốt lõi', 'Core adjectives') + ' (' + SWAP.filter(g => g[1] === 'adj').length + ')</button><button class="chipb" data-act="goArg" data-arg="adjbank">' + tx('Kho tính từ', 'Adjective bank') + ' (' + (window.ADJBANK || []).reduce((a, x) => a + x.w.length, 0) + ')</button><button class="chipb' + (tab === 'fam' ? ' on' : '') + '" data-act="goArg" data-arg="swap|fam">' + tx('Họ từ', 'Word families') + ' (' + WFAM.length + ')</button></div>' +
    '<div class="actions"><button class="btn" data-act="swapQuiz" data-arg="' + tab + '">' + tx('Luyện đổi từ', 'Practise') + '</button><button class="btn alt" data-act="swapQuiz" data-arg="mix">' + tx('Trộn: động từ + tính từ + từ trong các chủ đề', 'Mix incl. topic words') + '</button>' + (tab !== 'fam' ? '<button class="btn ghost" data-act="goArg" data-arg="flash|swap:' + tab + '">Flashcard</button><button class="btn ghost" data-act="goArg" data-arg="match|swap:' + tab + '">' + tx('Nối từ', 'Match') + '</button>' : '') + '</div>' +
    (list ? '<div class="words">' + list.map(([g, i]) => { const it = S.srs['sw:' + i]; return '<article class="card word"><div class="wh"><h3>' + esc(g[0]) + ' <small class="muted">' + g[1] + '</small></h3><button class="iconbtn" data-act="say" data-arg="' + esc(g[0] + ', ' + g[3] + '. ' + g[4]) + '">' + ICON.speak + '</button></div><p class="vi">' + esc(g[2]) + '</p><p class="small"><b class="red">→ </b><b>' + esc(g[3]) + '</b></p><p class="ex">' + esc(g[4]) + '</p><p class="small muted">' + esc(g[5]) + '</p>' + (it ? '<span class="srsdot b' + it.b + '"></span>' : '') + '</article>'; }).join('') + '</div>'
      : '<section class="card"><div class="scroll"><table class="dtable"><thead><tr><th>Verb</th><th>Noun</th><th>Adjective</th><th>Adverb</th></tr></thead><tbody>' + WFAM.map(f => '<tr><td>' + esc(f[0]) + '</td><td>' + esc(f[1]) + '</td><td>' + esc(f[2]) + '</td><td>' + esc(f[3]) + '</td></tr>').join('') + '</tbody></table></div></section>'));
};
ACT.swapQuiz = t => {
  let qs;
  if (t === 'fam') qs = shuffle(WFAM.map((_, i) => famQ(i))).slice(0, 12);
  else if (t === 'mix') qs = shuffle(shuffle(SWAP.map((_, i) => i)).slice(0, 8).map(i => swapQ(i, Math.random() < .6 ? 'syn' : 'rev')).concat(shuffle(WFAM.map((_, i) => i)).slice(0, 3).map(famQ), [1, 2, 3, 4].map(topicSynQ)));
  else qs = shuffle(SWAP.map((g, i) => [g, i]).filter(x => x[0][1] === t)).slice(0, 12).map(([, i]) => swapQ(i, Math.random() < .65 ? 'syn' : 'rev'));
  runQuiz({ title: tx('Đổi từ', 'Word swaps'), qs, mode: 'practice', kind: 'swap', back: () => go('swap', t === 'mix' ? 'v' : t) });
};
const _dw = deckWords;
deckWords = function (key) {
  if (key && key.startsWith('swap:')) { const p = key.slice(5); return SWAP.map((g, i) => [g, i]).filter(x => x[0][1] === p).map(([g, i]) => ({ w: g[0], pos: g[1], vi: g[2] + ' → ' + g[3], def: g[3], ex: g[4], col: '', syn: g[3], key: 'sw:' + i })); }
  return _dw(key);
};

// ----- Adjective bank (shades of meaning) -----
const ajItem = k => { const [g, i] = k.split('|'); const G = (window.ADJBANK || []).find(x => x.id === g); return G && G.w[+i] ? [G, G.w[+i], +i] : null; };
function ajQ(key, type) {
  const r = ajItem(key.slice(3)); if (!r) return null; const [G, w, i] = r; const others = shuffle(G.w.filter((_, j) => j !== i)).slice(0, 3);
  const all = (window.ADJBANK || []).flatMap(x => x.w);
  if (type === 'shade') { const o = shuffle([w[0]].concat(others.map(x => x[0]))); return { k: 'mcq', p: tx('Tính từ nào đúng sắc thái: "' + w[1] + '" – ' + w[2] + '?', 'Which adjective means "' + w[1] + '" – ' + w[2] + '?'), o, a: o.indexOf(w[0]), e: w[0] + ': ' + w[2] + '. ' + w[3], key, tag: pick(G.g) }; }
  if (type === 'cloze') { const re = new RegExp('\\b' + w[0].replace(/[-]/g, '.') + '\\b', 'i'); if (re.test(w[3])) { const o = shuffle([w[0]].concat(others.map(x => x[0]))); return { k: 'mcq', p: tx('Điền tính từ hợp nhất: ', 'Best adjective: ') + w[3].replace(re, '_____'), o, a: o.indexOf(w[0]), e: w[0] + ' = ' + w[1] + ' (' + w[2] + ')', key, tag: pick(G.g) }; } }
  const wr = shuffle(all.filter(x => x[0] !== w[0] && x[1] !== w[1])).slice(0, 1).concat(others).slice(0, 3); const o = shuffle([w[1]].concat(wr.map(x => x[1])));
  return { k: 'mcq', p: tx('"' + w[0] + '" nghĩa là gì?', 'What does "' + w[0] + '" mean?'), o, a: o.indexOf(w[1]), e: w[0] + ': ' + w[2] + '. ' + w[3], key, tag: pick(G.g) };
}
const _qfk2 = qFromKey;
qFromKey = function (key, it, wantNew) { if (key && key.startsWith('aj:')) return ajQ(key, wantNew ? pick2(['shade', 'cloze']) : pick2(['mean', 'shade', 'cloze'])); return _qfk2(key, it, wantNew); };
VIEWS.adjbank = (gid) => {
  const B = window.ADJBANK || []; const G = B.find(x => x.id === gid) || B[0]; const total = B.reduce((a, x) => a + x.w.length, 0);
  page(head(tx('Học', 'Learn'), total + tx(' tính từ chia theo ' + B.length + ' nhóm sắc thái – mỗi từ có nghĩa, điểm khác biệt với từ gần nghĩa và câu ví dụ.', ' adjectives in ' + B.length + ' groups of meaning.')) + learnTabs('swap') +
    '<div class="chips lvf"><button class="chipb" data-act="goArg" data-arg="swap|v">' + tx('Động từ', 'Verbs') + '</button><button class="chipb" data-act="goArg" data-arg="swap|adj">' + tx('Tính từ cốt lõi', 'Core adjectives') + '</button><button class="chipb on" data-act="goArg" data-arg="adjbank">' + tx('Kho tính từ (' + total + ')', 'Adjective bank (' + total + ')') + '</button><button class="chipb" data-act="goArg" data-arg="swap|fam">' + tx('Họ từ', 'Word families') + '</button></div>' +
    '<div class="chips lvf">' + B.map(x => '<button class="chipb' + (x === G ? ' on' : '') + '" data-act="goArg" data-arg="adjbank|' + x.id + '">' + esc(pick(x.g)) + ' <small>' + x.w.length + '</small></button>').join('') + '</div>' +
    '<div class="actions"><button class="btn" data-act="adjQuiz" data-arg="' + G.id + '">' + tx('Luyện nhóm này', 'Practise this group') + '</button><button class="btn alt" data-act="adjQuiz" data-arg="*">' + tx('Trộn mọi nhóm', 'Mix all groups') + '</button><button class="btn ghost" data-act="goArg" data-arg="flash|adj:' + G.id + '">Flashcard</button><button class="btn ghost" data-act="goArg" data-arg="match|adj:' + G.id + '">' + tx('Nối từ', 'Match') + '</button></div>' +
    '<section class="card"><h2>' + esc(pick(G.g)) + '</h2>' + G.w.map((w, i) => { const it = S.srs['aj:' + G.id + '|' + i]; return '<div class="idiom"><div class="row between"><b>' + esc(w[0]) + ' <span class="vi">' + esc(w[1]) + '</span></b><button class="iconbtn sm" data-act="say" data-arg="' + esc(w[0] + '. ' + w[3]) + '">' + ICON.speak + '</button></div>' + (w[2] ? '<span class="small muted">' + esc(w[2]) + '</span>' : '') + '<em>' + esc(w[3]) + '</em>' + (it ? '<span class="small muted">' + tx('Mức nhớ ', 'Memory ') + it.b + '/7</span>' : '') + '</div>'; }).join('') + '</section>');
};
ACT.adjQuiz = gid => {
  const B = window.ADJBANK; const keys = gid === '*' ? shuffle(B.flatMap(G => G.w.map((_, i) => 'aj:' + G.id + '|' + i))).slice(0, 15) : shuffle(B.find(x => x.id === gid).w.map((_, i) => 'aj:' + gid + '|' + i));
  runQuiz({ title: tx('Kho tính từ', 'Adjective bank'), qs: keys.map(k => ajQ(k, pick2(['mean', 'shade', 'cloze', 'shade']))), mode: 'practice', kind: 'adj', back: () => go('adjbank', gid === '*' ? undefined : gid) });
};
const _dw2 = deckWords;
deckWords = function (key) {
  if (key && key.startsWith('adj:')) { const G = (window.ADJBANK || []).find(x => x.id === key.slice(4)); return G ? G.w.map((w, i) => ({ w: w[0], pos: 'adj', vi: w[1], def: w[1], ex: w[3], col: '', syn: '', key: 'aj:' + G.id + '|' + i })) : []; }
  return _dw2(key);
};
