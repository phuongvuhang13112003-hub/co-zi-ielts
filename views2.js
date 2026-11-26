// ===== Tests, runners, games, stamps, shop, tutor, settings, boot =====
let TIMER = null;
function startTimer(sec, el, onEnd) {
  let left = sec; clearInterval(TIMER);
  const paint = () => { const e = $(el); if (e) { e.textContent = mmss(left); e.parentNode.classList.toggle('warn', left <= 60); } };
  paint(); TIMER = setInterval(() => { left--; paint(); if (left <= 0) { clearInterval(TIMER); onEnd && onEnd(); } }, 1000);
  onLeave(() => clearInterval(TIMER));
}
function pickMode(modes, cb) {
  const info = { practice: [tx('Luyện tập', 'Practice'), tx('Không giới hạn giờ, xem đáp án và giải thích ngay.', 'No time limit, instant answers and explanations.')], rush: ['Rush', tx('Đua với đồng hồ, chuỗi đúng nhân điểm thưởng.', 'Race the clock; streaks multiply rewards.')], timed: [tx('Tính giờ chuẩn', 'Standard timed'), tx('Giờ như thi thật, chấm điểm khi nộp bài.', 'Real exam timing, scored at the end.')] };
  window.__pm = cb;
  modal('<h2>' + tx('Chọn chế độ', 'Choose a mode') + '</h2><div class="modes">' + modes.map(m => '<button class="modeb" data-act="pm" data-arg="' + m + '"><b>' + info[m][0] + '</b><span>' + info[m][1] + '</span></button>').join('') + '</div>');
}
ACT.pm = m => { closeModal(); const cb = window.__pm; window.__pm = null; cb && cb(m); };

// ---------- Tests hub ----------
let TLV = 'all';
VIEWS.tests = (tab = 'skills', lf) => {
  if (lf) TLV = lf; const okL = x => TLV === 'all' || x.lvl === TLV;
  const tabs = [['skills', 'IELTS 4 kỹ năng', 'IELTS skills'], ['mock', 'Mock test', 'Mock tests'], ['other', 'Đổi gió', 'Other exams'], ['ai', 'Đề AI', 'AI tests']];
  const res = (k, id) => { const h = S.hist.find(x => x.t && x.k === k && x.id === id); return h ? '<b class="ok small">' + esc(h.s) + '</b>' : ''; };
  let body = '';
  if (tab === 'skills') {
    body = '<button class="card tile wide" data-act="nav" data-arg="placement"><span class="eyebrow">' + tx('Bắt đầu từ đây', 'Start here') + '</span><b>' + tx('Kiểm tra đầu vào 4 kỹ năng', 'Placement test – all 4 skills') + '</b><span class="muted small">' + (S.placement ? tx('Lần gần nhất: ', 'Last: ') + S.placement.d + ' · ' + S.placement.level : tx('Khoảng 45 phút, làm từng phần cũng được', 'About 45 min, can be done in parts')) + '</span></button>' +
      '<div class="chips lvf">' + ['all', ...LV].map(l => '<button class="chipb' + (TLV === l ? ' on' : '') + '" data-act="goArg" data-arg="tests|skills|' + l + '">' + (l === 'all' ? tx('Tất cả cấp độ', 'All levels') : l) + '</button>').join('') + '</div>' + '<details class="card fold" open><summary><h2>Reading <small class="muted">(' + C.R.filter(okL).length + ')</small></h2></summary><div class="ulist">' + C.R.filter(okL).map(r => '<button class="urow" data-act="startR" data-arg="' + r.id + '"><span>' + esc(r.title) + '</span><span class="muted small">' + r.q.length + tx(' câu', ' questions') + '</span>' + lvBadge(r.lvl) + '</button>').join('') + '</div></details>' +
      '<details class="card fold"><summary><h2>Listening <small class="muted">(' + C.L.filter(okL).length + ')</small></h2></summary><div class="ulist">' + C.L.filter(okL).map(l => '<button class="urow" data-act="startL" data-arg="' + l.id + '"><span>' + esc(l.title) + '</span><span class="muted small">' + esc(l.type) + '</span>' + lvBadge(l.lvl) + '</button>').join('') + '</div></details>' +
      '<details class="card fold"><summary><h2>Writing <small class="muted">(' + C.W.filter(okL).length + ')</small></h2></summary><div class="ulist">' + C.W.filter(okL).slice().sort((a, b) => a.task - b.task).map(w => '<button class="urow" data-act="startW" data-arg="' + w.id + '"><span>Task ' + w.task + ' · ' + esc(w.title) + '</span><span class="muted small">' + esc(w.type || (w.chart ? ({ bar: 'Bar chart', line: 'Line graph', table: 'Table', process: 'Process' })[w.chart.type] : '')) + '</span>' + lvBadge(w.lvl) + '</button>').join('') + '</div></details>' +
      '<details class="card fold"><summary><h2>Speaking <small class="muted">(' + C.S.p2.length + tx(' thẻ Part 2, ', ' cue cards, ') + C.S.p1.length + tx(' bộ Part 1', ' Part 1 sets') + ')</small></h2></summary><div class="ulist">' + C.S.p2.map((c, i) => '<button class="urow" data-act="startS" data-arg="' + i + '"><span>' + esc(c.t) + '</span><span class="muted small">Part 1 · 2 · 3</span>' + lvBadge('B2') + '</button>').join('') + '</div></details>';
  } else if (tab === 'mock') {
    body = '<p class="muted">' + tx('Đề mock gồm 4 phần như thi thật (rút gọn). Làm từng phần, kết quả cộng dồn thành band tổng.', 'Each mock has all 4 sections (shortened). Do them one by one; results combine into an overall band.') + '</p><div class="grid2">' + C.M.map(m => { const r = S.mock[m.id] || {}; const n = ['L', 'R', 'W', 'S'].filter(k => r[k]).length; return '<button class="card tile" data-act="goArg" data-arg="mock|' + m.id + '"><span class="eyebrow">' + esc(m.lvl) + '</span><b>' + esc(m.title) + '</b><span class="muted small">' + n + '/4 ' + tx('phần đã làm', 'sections done') + '</span>' + bar(n / 4 * 100) + '</button>'; }).join('') + '</div>';
  } else if (tab === 'other') {
    body = '<div class="grid2">' + Object.entries(C.X).map(([k, x]) => '<button class="card tile" data-act="startX" data-arg="' + k + '"><span class="eyebrow">' + (k === 'toeic' ? 'TOEIC' : 'Cambridge') + '</span><b>' + esc(x.title) + '</b><span class="muted small">' + x.q.length + tx(' câu', ' questions') + '</span></button>').join('') + '</div><p class="muted small">' + tx('Muốn thêm TOEFL, TOEIC hay Cambridge? Vào tab "Đề AI" để tạo đề mới không giới hạn.', 'Want more TOEFL, TOEIC or Cambridge? Use the AI tests tab.') + '</p>';
  } else {
    const mine = LIB.items.filter(x => x.type !== 'vocab' && x.type !== 'mine');
    body = '<section class="card"><h2>' + tx('Tạo đề mới bằng AI', 'Generate a new test') + '</h2>' + (AI.ok() ? '<form id="genf" class="stackf"><label>' + tx('Loại đề', 'Test type') + '<select name="t"><option value="ielts-r">IELTS Reading</option><option value="ielts-l">IELTS Listening</option><option value="toefl-r">TOEFL Reading</option><option value="toeic5">TOEIC Part 5</option><option value="cam-uoe">Cambridge B2/C1 Use of English</option><option value="ielts-v">' + tx('Câu hỏi từ vựng theo chủ đề', 'Topic vocabulary quiz') + '</option></select></label><label>' + tx('Chủ đề (tuỳ chọn)', 'Topic (optional)') + '<input name="topic" maxlength="80" placeholder="' + tx('VD: năng lượng tái tạo', 'e.g. renewable energy') + '"></label><label>' + tx('Cấp độ', 'Level') + '<select name="l">' + LV.map(l => '<option' + (l === S.level ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label><button class="btn">' + ICON.spark + tx('Tạo đề', 'Generate') + '</button></form><div id="genout"></div>' : noAI()) + '</section>' +
      (mine.length ? '<section class="card"><h2>' + tx('Đề AI đã lưu', 'Saved AI tests') + '</h2><div class="ulist">' + mine.slice().reverse().map(x => '<div class="urow"><button class="link" data-act="openGen" data-arg="' + x.id + '">' + esc(x.title) + '</button><span class="muted small">' + esc(x.kind || x.type) + ' · ' + esc(x.created) + '</span><button class="iconbtn sm" data-act="delGen" data-arg="' + x.id + '" aria-label="delete">' + ICON.x + '</button></div>').join('') + '</div></section>' : '');
  }
  page(head(tx('Luyện thi', 'Practice tests'), tx('IELTS là chính, thêm TOEIC/TOEFL/Cambridge để đổi gió', 'Mostly IELTS, with TOEIC/TOEFL/Cambridge for variety')) + '<div class="tabs">' + tabs.map(t => '<button class="tab' + (t[0] === tab ? ' on' : '') + '" data-act="goArg" data-arg="tests|' + t[0] + '">' + tx(t[1], t[2]) + '</button>').join('') + '</div>' + body);
  const gf = $('#genf'); if (gf) gf.addEventListener('submit', e => { e.preventDefault(); genTest(new FormData(gf)); });
};
ACT.startR = id => pickMode(['practice', 'timed'], m => go('reading', id, m));
ACT.startL = id => pickMode(['practice', 'timed'], m => go('listening', id, m));
ACT.startW = id => pickMode(['practice', 'timed'], m => go('writing', id, m));
ACT.startS = i => go('speaking', String(i));
ACT.startX = k => pickMode(['practice', 'rush', 'timed'], m => runQuiz({ title: C.X[k].title, qs: shuffle(C.X[k].q.map((q, i) => normQ(q, 'q:x:' + k + ':' + i))), mode: m, kind: 'other', back: () => go('tests', 'other') }));
ACT.delGen = id => { LIB.items = LIB.items.filter(x => x.id !== id); saveLib(); go('tests', 'ai'); };
ACT.openGen = id => {
  const x = LIB.items.find(y => y.id === id); if (!x) return;
  if (x.type === 'reading') pickMode(['practice', 'timed'], m => go('reading', 'ai:' + id, m));
  else if (x.type === 'listening') pickMode(['practice', 'timed'], m => go('listening', 'ai:' + id, m));
  else pickMode(['practice', 'rush', 'timed'], m => runQuiz({ title: x.title, qs: x.data.q.map((q, i) => Object.assign({}, q, { key: 'q:ai:' + id + ':' + i, keep: true })), mode: m, kind: 'ai', back: () => go('tests', 'ai') }));
};
async function genTest(d) {
  const t = d.get('t'), topic = String(d.get('topic') || '').trim() || 'a typical topic for this exam', l = d.get('l'); const out = $('#genout');
  const qfmt = '"q":[{"k":"mcq","p":"question","o":["A","B","C","D"],"a":0,"e":"explanation"}' + (t.includes('-r') ? ',{"k":"tfng","p":"statement","o":["TRUE","FALSE","NOT GIVEN"],"a":2,"e":"…"},{"k":"gap","p":"sentence with ______ (NO MORE THAN TWO WORDS)","a":["answer","alt spelling"],"e":"…"}' : '') + ']';
  const spec = {
    'ielts-r': ['reading', 'IELTS Reading', 'Write an ORIGINAL IELTS Academic Reading passage (' + (l === 'B1' ? '330' : '480') + ' words, 5 paragraphs separated by \\n\\n) on ' + topic + ', CEFR ' + l + ', then 8 questions mixing mcq, tfng (TRUE/FALSE/NOT GIVEN) and gap (answers taken word-for-word from the passage). JSON {"title":"","text":"",' + qfmt + '}'],
    'toefl-r': ['reading', 'TOEFL Reading', 'Write an ORIGINAL TOEFL iBT-style academic reading passage (~420 words, paragraphs separated by \\n\\n) on ' + topic + ', CEFR ' + l + ', then 8 four-option mcq questions (factual, inference, vocabulary-in-context, purpose). JSON {"title":"","text":"",' + qfmt + '}'],
    'ielts-l': ['listening', 'IELTS Listening', 'Write an ORIGINAL IELTS Listening script (Section ' + (l === 'A2' || l === 'B1' ? '1, a conversation between a woman (W) and a man (M) in an everyday situation' : '3 or 4, an academic discussion or lecture') + ') on ' + topic + ', 12-16 lines, CEFR ' + l + ', then 6 questions (gap for form/notes completion with exact words from the script, or mcq). JSON {"title":"","lines":[["W","text"],["M","text"]],' + qfmt + '}'],
    'toeic5': ['quiz', 'TOEIC Part 5', 'Write 10 ORIGINAL TOEIC Part 5 incomplete-sentence questions (business context' + (topic !== 'a typical topic for this exam' ? ', theme: ' + topic : '') + '), 4 options each, testing grammar, word forms and vocabulary. JSON {"title":"",' + qfmt + '}'],
    'cam-uoe': ['quiz', 'Cambridge Use of English', 'Write 10 ORIGINAL Cambridge ' + (l === 'C1' ? 'C1 Advanced' : 'B2 First') + ' Use of English questions on ' + topic + ': mix multiple-choice cloze (mcq, 4 options) and word formation (k "gap", prompt shows the base word in CAPITALS in brackets). JSON {"title":"",' + qfmt + '}'],
    'ielts-v': ['quiz', tx('Từ vựng', 'Vocabulary'), 'Write 10 ORIGINAL IELTS vocabulary questions on ' + topic + ', CEFR ' + l + ': collocations, synonyms/paraphrase, word choice in context, academic word forms; 4 options each. JSON {"title":"",' + qfmt + '}']
  }[t];
  out.innerHTML = '<p class="muted pulse">' + tx('AI đang ra đề… (khoảng 30–60 giây)', 'Writing your test… (30–60 s)') + '</p>';
  try {
    const r = await AI.json(spec[2] + ' Make questions fair, unambiguous, in the real exam style, with exactly one correct answer. The explanation "e" should quote the evidence. ' + langLine(), 'complex');
    const q = (r.q || []).map(x => Object.assign({ k: 'mcq' }, x)).map(x => { if (x.k === 'gap' && typeof x.a === 'string') x.a = [x.a]; return x; }).filter(validQ);
    if (q.length < 4 || (spec[0] === 'reading' && !r.text) || (spec[0] === 'listening' && !Array.isArray(r.lines))) throw 0;
    const id = uid(); const data = { title: r.title || spec[1], text: r.text, lines: (r.lines || []).filter(x => Array.isArray(x) && x[1]).map(x => [x[0] === 'W' ? 'W' : 'M', String(x[1])]), q };
    LIB.items.push({ id, type: spec[0], kind: spec[1], title: spec[1] + ' · ' + (r.title || topic), created: today(), data }); saveLib();
    go('tests', 'ai'); toast(tx('Đã tạo đề mới!', 'New test ready!'));
  } catch (e) { out.innerHTML = '<p class="bad">' + tx('Chưa tạo được đề, thử lại nhé.', 'Could not create the test, try again.') + '</p>'; }
}
const getReading = id => { if (id.startsWith('ai:')) { const x = LIB.items.find(y => y.id === id.slice(3)); return x && { id, title: x.data.title, text: x.data.text, q: x.data.q, lvl: 'AI', ai: x.id }; } return C.R.find(r => r.id === id); };
const getListening = id => { if (id.startsWith('ai:')) { const x = LIB.items.find(y => y.id === id.slice(3)); return x && { id, title: x.data.title, lines: x.data.lines, q: x.data.q, lvl: 'AI', ai: x.id }; } return C.L.find(r => r.id === id); };
const qKey = (kind, item, i) => item.ai ? 'q:ai:' + item.ai + ':' + i : 'q:' + kind + ':' + item.id + ':' + i;

// Shared question-list renderer for reading/listening
function qList(items) {
  let n = 0;
  return items.map((it, pi) => '<div class="qgroup">' + (items.length > 1 ? '<h3>' + tx('Phần ', 'Part ') + (pi + 1) + ' · ' + esc(it.title) + '</h3>' : '') + it.q.map((q, qi) => { n++; const name = 'q' + pi + '_' + qi; return '<div class="lq" id="' + name + '"><p><b>' + n + '.</b> ' + esc(q.p) + '</p>' + (q.k === 'gap' ? '<input class="gapin" name="' + name + '" autocomplete="off" autocapitalize="off" spellcheck="false">' : '<div class="ropts">' + q.o.map((o, j) => '<label><input type="radio" name="' + name + '" value="' + j + '"><span>' + esc(o) + '</span></label>').join('') + '</div>') + '<div class="lfb"></div></div>'; }).join('') + '</div>').join('');
}
function gradeList(items, kind, form) {
  const fd = new FormData(form); let ok = 0, total = 0;
  items.forEach((it, pi) => it.q.forEach((q, qi) => {
    total++; const name = 'q' + pi + '_' + qi; const v = fd.get(name); const box = $('#' + name);
    const good = q.k === 'gap' ? accepted(q).includes(norm(v)) : v != null && +v === q.a;
    if (good) ok++;
    srsTouch(qKey(kind, it, qi), good, it.ai ? Object.assign({}, q, { keep: true, ctx: { title: it.title, text: it.text || (it.lines || []).map(x => x[1]).join('\n') } }) : null);
    box.classList.add(good ? 'ok' : 'bad');
    box.querySelector('.lfb').innerHTML = '<p class="small">' + (good ? '<b class="ok">' + tx('Đúng', 'Correct') + '</b>' : '<b class="bad">' + tx('Sai', 'Wrong') + '</b> · ' + tx('Đáp án: ', 'Answer: ') + esc(q.k === 'gap' ? (Array.isArray(q.a) ? q.a[0] : q.a) : q.o[q.a])) + ' – ' + esc(q.e || '') + '</p>';
    $$('input', box).forEach(x => x.disabled = true);
  }));
  return { ok, total, pct: Math.round(ok / total * 100) };
}
function resultBanner(r, b, label) { return '<section class="card result"><div class="ring" style="--p:' + r.pct + '"><b>' + r.ok + '/' + r.total + '</b></div><div><h2>' + label + '</h2><p>' + (b != null ? tx('Band ước tính: ', 'Estimated band: ') + '<b class="bigb">' + b.toFixed(1) + '</b>' : '') + '</p><p class="small muted">' + tx('Quy đổi theo thang 40 câu của IELTS – bài ngắn nên chỉ mang tính tham khảo. Câu sai đã vào lịch ôn tập.', 'Converted to the 40-question IELTS scale – short test, so it is a rough guide. Mistakes were added to review.') + '</p></div></section>'; }

// ---------- Reading ----------
VIEWS.reading = (ids, mode = 'practice', ctxKey) => {
  const items = String(ids).split(',').map(getReading).filter(Boolean); if (!items.length) return go('tests');
  const ctx = ctxKey ? JSON.parse(decodeURIComponent(ctxKey)) : null;
  const backTo = ctx && ctx.mock ? 'mock|' + ctx.mock : 'tests|skills';
  page('<div class="phead"><button class="iconbtn" data-act="goArg" data-arg="' + backTo + '">' + ICON.back + '</button><div><h1>Reading</h1><p class="muted">' + modeName(mode) + ' · ' + items.length + ' ' + tx('đoạn', 'passage(s)') + '</p></div>' + (mode === 'timed' ? '<span class="timer big">' + ICON.clock + '<b id="rt"></b></span>' : '') + '</div>' +
    '<div class="split"><div class="card passage">' + (items.length > 1 ? '<div class="tabs sm">' + items.map((it, i) => '<button class="tab' + (i ? '' : ' on') + '" data-act="rTab" data-arg="' + i + '">' + tx('Đoạn ', 'Passage ') + (i + 1) + '</button>').join('') + '</div>' : '') + items.map((it, i) => '<article class="ptext" data-p="' + i + '"' + (i ? ' hidden' : '') + '><h2>' + esc(it.title) + '</h2>' + esc(it.text).split(/\n+/).map((p, k) => '<p><span class="pl">' + 'ABCDEFGHIJ'[k] + '</span>' + p + '</p>').join('') + '</article>').join('') + '</div>' +
    '<form class="card qpane" id="rform">' + qList(items) + '<button class="btn wide">' + tx('Nộp bài', 'Submit') + '</button></form></div>');
  const form = $('#rform'); let done = false;
  const submit = () => {
    if (done) return; done = true; clearInterval(TIMER);
    const r = gradeList(items, 'r', form); const b = r.total >= 6 ? ratioBand(r.ok / r.total) : null;
    if (mode === 'timed' && b != null) pushBand('R', b);
    reward(r.ok * 3 + 10, r.pct >= 90 ? 1 : 0); markActive(); logHist('reading', items.map(x => x.title).join(' + '), b != null ? 'Band ' + b : r.pct + '%');
    form.querySelector('button.btn').remove();
    form.insertAdjacentHTML('afterbegin', resultBanner(r, b, 'Reading'));
    if (ctx && ctx.mock) { const m = S.mock[ctx.mock] || (S.mock[ctx.mock] = {}); m.R = { b, pct: r.pct, d: today() }; save(); form.insertAdjacentHTML('beforeend', '<button class="btn wide" data-act="goArg" data-arg="mock|' + ctx.mock + '">' + tx('Về đề mock', 'Back to mock') + '</button>'); }
    if (ctx && ctx.place) { const p = S.pd || (S.pd = {}); p.R = b != null ? b : ratioBand(r.ok / r.total); save(); form.insertAdjacentHTML('beforeend', '<button class="btn wide" data-act="nav" data-arg="placement">' + tx('Tiếp tục bài kiểm tra đầu vào', 'Continue placement test') + '</button>'); }
    form.scrollIntoView({ behavior: 'smooth' });
  };
  form.addEventListener('submit', e => { e.preventDefault(); submit(); });
  if (mode === 'timed') startTimer(items.length * 20 * 60, '#rt', () => { toast(tx('Hết giờ!', 'Time is up!')); submit(); });
};
ACT.rTab = i => { $$('.passage .tab').forEach((b, j) => b.classList.toggle('on', j === +i)); $$('.ptext').forEach((a, j) => a.hidden = j !== +i); };

// ---------- Listening ----------
VIEWS.listening = (ids, mode = 'practice', ctxKey) => {
  const items = String(ids).split(',').map(getListening).filter(Boolean); if (!items.length) return go('tests');
  const ctx = ctxKey ? JSON.parse(decodeURIComponent(ctxKey)) : null;
  const backTo = ctx && ctx.mock ? 'mock|' + ctx.mock : 'tests|skills';
  const can = Voice.canSpeak();
  page('<div class="phead"><button class="iconbtn" data-act="goArg" data-arg="' + backTo + '">' + ICON.back + '</button><div><h1>Listening</h1><p class="muted">' + modeName(mode) + (mode === 'timed' ? ' · ' + tx('mỗi phần chỉ nghe 1 lần, như thi thật', 'each part plays once, like the real test') : '') + '</p></div></div>' +
    (can ? '' : '<p class="note">' + tx('Trình duyệt này không đọc được âm thanh. Bạn có thể xem transcript để luyện như bài đọc (mở trên Chrome máy tính để nghe).', 'This browser cannot play speech. You can read the transcript instead (open in desktop Chrome to listen).') + '</p>') +
    '<div class="card players">' + items.map((it, i) => '<div class="player"><b>' + tx('Phần ', 'Part ') + (i + 1) + ' · ' + esc(it.title) + '</b><div class="row">' + (can ? '<button class="btn sm" data-act="lPlay" data-arg="' + i + '">' + ICON.play + tx('Nghe', 'Play') + '</button><button class="btn ghost sm" data-act="lStop">' + ICON.stop + '</button>' : '') + (mode === 'practice' && can ? '<select class="rate" id="rate"><option value="0.85">0.85×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option></select>' : '') + (mode === 'practice' || !can ? '<button class="link" data-act="lScript" data-arg="' + i + '">' + tx('Transcript', 'Transcript') + '</button>' : '') + '</div><div class="script" id="scr' + i + '" hidden>' + it.lines.map(l => '<p><b>' + (l[0] === 'W' ? 'Woman' : 'Man') + ':</b> ' + esc(l[1]) + '</p>').join('') + '</div></div>').join('') + '<p class="small muted" id="lstat"></p></div>' +
    '<form class="card qpane" id="lform">' + qList(items) + '<button class="btn wide">' + tx('Nộp bài', 'Submit') + '</button></form>');
  const played = {};
  ACT.lPlay = async i => {
    if (mode === 'timed' && played[i]) { toast(tx('Thi thật chỉ được nghe một lần.', 'Only one play in the real test.')); return; }
    played[i] = true; const r = $('#rate'); Voice.rate = r ? +r.value : 1; $('#lstat').textContent = tx('Đang phát phần ', 'Playing part ') + (+i + 1) + '…';
    if (mode === 'timed') $$('[data-act=lPlay]')[i].disabled = true;
    try { await Voice.lines(items[i].lines); $('#lstat').textContent = tx('Đã phát xong.', 'Finished.'); } catch (e) { const s = $('#lstat'); if (s) s.textContent = tx('Đã dừng.', 'Stopped.'); }
  };
  const form = $('#lform'); let done = false;
  form.addEventListener('submit', e => {
    e.preventDefault(); if (done) return; done = true; Voice.stop();
    const r = gradeList(items, 'l', form); const b = r.total >= 6 ? ratioBand(r.ok / r.total) : null;
    if (mode === 'timed' && b != null) pushBand('L', b);
    reward(r.ok * 3 + 10, r.pct >= 90 ? 1 : 0); markActive(); logHist('listening', items.map(x => x.title).join(' + '), b != null ? 'Band ' + b : r.pct + '%');
    form.querySelector('button.btn').remove(); $$('.script').forEach(s => s.hidden = false);
    form.insertAdjacentHTML('afterbegin', resultBanner(r, b, 'Listening'));
    if (ctx && ctx.mock) { const m = S.mock[ctx.mock] || (S.mock[ctx.mock] = {}); m.L = { b, pct: r.pct, d: today() }; save(); form.insertAdjacentHTML('beforeend', '<button class="btn wide" data-act="goArg" data-arg="mock|' + ctx.mock + '">' + tx('Về đề mock', 'Back to mock') + '</button>'); }
    if (ctx && ctx.place) { const p = S.pd || (S.pd = {}); p.L = b != null ? b : ratioBand(r.ok / r.total); save(); form.insertAdjacentHTML('beforeend', '<button class="btn wide" data-act="nav" data-arg="placement">' + tx('Tiếp tục bài kiểm tra đầu vào', 'Continue placement test') + '</button>'); }
  });
};
ACT.lStop = () => Voice.stop();
ACT.lScript = i => { const s = $('#scr' + i); s.hidden = !s.hidden; };

// ---------- Writing ----------
const WCRIT = { 1: ['TA', 'Task Achievement'], 2: ['TR', 'Task Response'] };
VIEWS.writing = (id, mode = 'practice', ctxKey) => {
  const ctx = ctxKey ? JSON.parse(decodeURIComponent(ctxKey)) : {};
  const w = ctx.place ? { id: 'place', task: 2, title: 'Placement', prompt: C.W.find(x => x.id === 'w2a').prompt.replace('Write at least 250 words.', 'Write 120–180 words.'), min: 120 } : C.W.find(x => x.id === id);
  if (!w) return go('tests');
  const min = w.min || (w.task === 1 ? 150 : 250); const dk = 'draft_' + PID + '_' + w.id;
  const backTo = ctx.mock ? 'mock|' + ctx.mock : ctx.place ? 'placement' : 'tests|skills';
  page('<div class="phead"><button class="iconbtn" data-act="goArg" data-arg="' + backTo + '">' + ICON.back + '</button><div><h1>Writing Task ' + w.task + '</h1><p class="muted">' + esc(w.title) + ' · ' + modeName(mode) + '</p></div>' + (mode === 'timed' ? '<span class="timer big">' + ICON.clock + '<b id="wt"></b></span>' : '') + '</div>' +
    '<section class="card"><p class="prompt">' + esc(w.prompt) + '</p>' + (w.chart ? chartSVG(w.chart) : '') + (mode === 'practice' ? '<details class="tips"><summary>' + tx('Gợi ý dàn ý', 'Outline tips') + '</summary>' + (w.task === 1 ? '<ol><li>' + tx('Mở bài: paraphrase đề (1 câu).', 'Intro: paraphrase the task (1 sentence).') + '</li><li>' + tx('Overview: 2 đặc điểm nổi bật nhất, không số liệu.', 'Overview: 2 main features, no numbers.') + '</li><li>' + tx('Thân bài 1 & 2: nhóm số liệu, so sánh (twice as…, considerably higher…).', 'Body 1 & 2: group data and compare.') + '</li></ol>' : '<ol><li>' + tx('Mở bài: paraphrase đề + nêu quan điểm rõ ràng.', 'Intro: paraphrase + clear position.') + '</li><li>' + tx('Thân bài 1: lý do 1 + giải thích + ví dụ.', 'Body 1: reason + explanation + example.') + '</li><li>' + tx('Thân bài 2: lý do 2 (hoặc quan điểm còn lại) + ví dụ.', 'Body 2: reason 2 or the other view.') + '</li><li>' + tx('Kết bài: nhắc lại quan điểm bằng cách diễn đạt khác.', 'Conclusion: restate your view in new words.') + '</li></ol>') + '</details>' : '') + '</section>' +
    '<section class="card"><textarea id="essay" class="essay" placeholder="' + tx('Viết bài ở đây… (không dùng từ điển, dịch máy)', 'Write here… (no dictionary or translator)') + '" spellcheck="false"></textarea><div class="row between"><span class="muted small" id="wcount">0 ' + tx('từ', 'words') + '</span><button class="btn" id="wsub">' + (AI.ok() ? ICON.spark + tx('Nộp & chấm bằng AI', 'Submit for AI marking') : tx('Nộp bài', 'Submit')) + '</button></div></section><div id="wres"></div>');
  const ta = $('#essay'); ta.value = Store.local(dk) || '';
  const upd = () => { const n = wc(ta.value); $('#wcount').textContent = n + ' ' + tx('từ', 'words') + ' / ' + min; $('#wcount').classList.toggle('bad', n < min); Store.local(dk, ta.value); };
  ta.addEventListener('input', upd); upd();
  if (mode === 'timed') startTimer((w.task === 1 ? 20 : 40) * 60 * (ctx.place ? 0.5 : 1), '#wt', () => { toast(tx('Hết giờ – bài sẽ được nộp.', 'Time is up – submitting.')); grade(); });
  let busy = false;
  async function grade() {
    if (busy) return; const text = ta.value.trim(); const n = wc(text);
    if (n < 30) { toast(tx('Bài quá ngắn để chấm (tối thiểu 30 từ).', 'Too short to mark (30 words minimum).')); return; }
    busy = true; clearInterval(TIMER); $('#wsub').disabled = true; const out = $('#wres');
    if (!AI.ok()) { out.innerHTML = selfCheck(w.task, text, ctx, w); markActive(); logHist('writing', w.title, n + ' words'); return; }
    out.innerHTML = '<section class="card"><p class="pulse">' + tx('Giám khảo AI đang chấm bài… (20–40 giây)', 'The AI examiner is marking… (20–40 s)') + '</p></section>';
    const k = WCRIT[w.task][0];
    try {
      const r = await AI.json('You are an experienced, strict IELTS Writing examiner. Mark this IELTS Academic Writing Task ' + w.task + ' response using the public IELTS band descriptors (' + WCRIT[w.task][1] + ', Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy). Be calibrated and honest; do not inflate. The word count is ' + n + ' (minimum ' + min + ')' + (n < min ? ' – apply the under-length penalty' : '') + '.' + (ctx.place ? ' This is a short placement task (120–180 words requested); estimate the band the writer would likely get on a full task.' : '') + '\nTask: ' + w.prompt + (w.chart ? '\nChart data: ' + JSON.stringify(w.chart) : '') + '\nResponse:\n"""' + text.slice(0, 6000) + '"""\nReturn JSON {"overall":0,"' + k + '":0,"CC":0,"LR":0,"GRA":0,"summary":"2-3 sentences","strengths":["",""],"errors":[{"original":"exact words from the response","correction":"","why":""}],"upgrades":[{"basic":"","better":""}],"model":"the writer\'s introduction (or weakest paragraph) rewritten at band 7.5, keeping their ideas","next":["","",""]}. Up to 8 errors and 5 upgrades. Bands are numbers in 0.5 steps. ' + langLine(), 'complex');
      const ov = roundBand(+r.overall || 0);
      if (!ctx.place && !ctx.mock && mode === 'timed') pushBand('W', ov);
      if (!ctx.place && !ctx.mock && mode === 'practice') pushBand('W', ov);
      S.writings.unshift({ d: today(), id: w.id, task: w.task, band: ov, text: text.slice(0, 2500) }); S.writings = S.writings.slice(0, 15);
      reward(25, ov >= 7 ? 2 : 1, 'Writing'); markActive(); logHist('writing', 'Task ' + w.task + ' · ' + w.title, 'Band ' + ov);
      Store.local(dk, '');
      out.innerHTML = writeFeedback(r, k, ov);
      if (ctx.mock) { const m = S.mock[ctx.mock] || (S.mock[ctx.mock] = {}); m['W' + w.task] = ov; if (m.W1 != null && m.W2 != null) { m.W = { b: roundBand((m.W1 + 2 * m.W2) / 3), d: today() }; pushBand('W', m.W.b); } save(); out.insertAdjacentHTML('beforeend', '<div class="actions">' + (w.task === 1 ? '<button class="btn" data-act="mockW2" data-arg="' + ctx.mock + '">' + tx('Sang Task 2', 'Go to Task 2') + '</button>' : '') + '<button class="btn ghost" data-act="goArg" data-arg="mock|' + ctx.mock + '">' + tx('Về đề mock', 'Back to mock') + '</button></div>'); }
      if (ctx.place) { S.pd = S.pd || {}; S.pd.W = ov; save(); out.insertAdjacentHTML('beforeend', '<button class="btn wide" data-act="nav" data-arg="placement">' + tx('Tiếp tục bài kiểm tra đầu vào', 'Continue placement test') + '</button>'); }
    } catch (e) { out.innerHTML = '<section class="card"><p class="bad">' + tx('Chưa chấm được. Bài vẫn được lưu nháp – thử lại nhé.', 'Marking failed. Your draft is saved – try again.') + '</p></section>'; $('#wsub').disabled = false; busy = false; }
  }
  $('#wsub').addEventListener('click', grade);
};
ACT.mockW2 = id => { const m = C.M.find(x => x.id === id); go('writing', m.W[1], 'timed', encodeURIComponent(JSON.stringify({ mock: id }))); };
function writeFeedback(r, k, ov) {
  const crit = [[k, k === 'TA' ? 'Task Achievement' : 'Task Response'], ['CC', 'Coherence & Cohesion'], ['LR', 'Lexical Resource'], ['GRA', 'Grammar Range & Accuracy']];
  const L = a => Array.isArray(a) ? a : [];
  return '<section class="card result"><div class="ring" style="--p:' + (ov / 9 * 100) + '"><b>' + ov.toFixed(1) + '</b></div><div><h2>' + tx('Band ước tính', 'Estimated band') + '</h2><p>' + esc(r.summary || '') + '</p></div></section>' +
    '<section class="card"><div class="bands">' + crit.map(c => '<div class="bandrow"><span>' + c[1] + '</span>' + bar((+r[c[0]] || 0) / 9 * 100) + '<b>' + (+r[c[0]] || 0).toFixed(1) + '</b></div>').join('') + '</div></section>' +
    (L(r.strengths).length ? '<section class="card"><h2>' + tx('Điểm mạnh', 'Strengths') + '</h2><ul>' + L(r.strengths).map(s => '<li>' + esc(s) + '</li>').join('') + '</ul></section>' : '') +
    (L(r.errors).length ? '<section class="card"><h2>' + tx('Lỗi cần sửa', 'Errors to fix') + '</h2>' + L(r.errors).map(e => '<div class="fix"><p><s class="bad">' + esc(e.original) + '</s> → <b class="ok">' + esc(e.correction) + '</b></p><p class="small muted">' + esc(e.why) + '</p></div>').join('') + '</section>' : '') +
    (L(r.upgrades).length ? '<section class="card"><h2>' + tx('Nâng cấp từ vựng', 'Vocabulary upgrades') + '</h2><div class="paras">' + L(r.upgrades).map(u => '<div class="para"><span>' + esc(u.basic) + '</span><span class="arrow">→</span><b>' + esc(u.better) + '</b></div>').join('') + '</div></section>' : '') +
    (r.model ? '<section class="card"><h2>' + tx('Đoạn mẫu viết lại (band 7.5)', 'Model rewrite (band 7.5)') + '</h2><p class="model">' + esc(r.model) + '</p></section>' : '') +
    (L(r.next).length ? '<section class="card"><h2>' + tx('Bước tiếp theo', 'Next steps') + '</h2><ol>' + L(r.next).map(s => '<li>' + esc(s) + '</li>').join('') + '</ol></section>' : '') +
    '<p class="small muted center">' + tx('Điểm do AI ước tính dựa trên tiêu chí công khai của IELTS, có thể lệch so với giám khảo thật.', 'AI estimate based on public IELTS descriptors; a real examiner may differ.') + '</p>';
}
function selfCheck(task) {
  const items = task === 1 ? [tx('Có câu overview nêu 2 xu hướng chính?', 'Is there an overview with 2 main trends?'), tx('Có số liệu cụ thể và so sánh?', 'Specific data and comparisons?'), tx('Không đưa ý kiến cá nhân?', 'No personal opinion?'), tx('Đủ 150 từ?', 'At least 150 words?')] : [tx('Mở bài nêu rõ quan điểm?', 'Clear position in the intro?'), tx('Mỗi đoạn thân bài có 1 ý chính + ví dụ?', 'One main idea + example per body paragraph?'), tx('Dùng từ nối đa dạng (however, as a result…)?', 'Varied linking words?'), tx('Có ít nhất 3 cấu trúc câu phức?', 'At least 3 complex structures?'), tx('Đủ 250 từ?', 'At least 250 words?')];
  return '<section class="card"><h2>' + tx('Tự kiểm tra', 'Self-check') + '</h2><p class="muted">' + tx('Không có AI ở đây nên bạn tự chấm theo danh sách. Mở trang trong Claude để được chấm điểm chi tiết.', 'No AI here, so check yourself. Open in Claude for detailed marking.') + '</p>' + items.map(i => '<label class="chk"><input type="checkbox"><span>' + i + '</span></label>').join('') + '</section>';
}

// ---------- Speaking ----------
VIEWS.speaking = (idx, ctxKey) => {
  const ctx = ctxKey ? JSON.parse(decodeURIComponent(ctxKey)) : {};
  const i = +idx || 0; const cue = C.S.p2[i % C.S.p2.length]; const p1 = C.S.p1[ctx.p1 != null ? ctx.p1 : i % C.S.p1.length];
  const steps = ctx.place ? [{ part: 1, q: p1.q[0] }, { part: 1, q: p1.q[1] }, { part: 3, q: cue.p3[0] }] :
    [...p1.q.map(q => ({ part: 1, q })), { part: 2, q: cue.t, b: cue.b }, ...cue.p3.map(q => ({ part: 3, q }))];
  const answers = steps.map(() => ''); let k = 0;
  const backTo = ctx.mock ? 'mock|' + ctx.mock : ctx.place ? 'placement' : 'tests|skills';
  function render() {
    const s = steps[k];
    page('<div class="phead"><button class="iconbtn" data-act="goArg" data-arg="' + backTo + '">' + ICON.back + '</button><div><h1>Speaking · Part ' + s.part + '</h1><p class="muted">' + (k + 1) + '/' + steps.length + (s.part === 1 ? ' · ' + esc(p1.t) : '') + '</p></div>' + (s.part === 2 ? '<span class="timer big">' + ICON.clock + '<b id="st"></b></span>' : '') + '</div>' + bar(k / steps.length * 100) +
      '<section class="card"><div class="row between"><p class="prompt">' + esc(s.q) + '</p>' + (Voice.canSpeak() ? '<button class="iconbtn" data-act="say" data-arg="' + esc(s.q) + '" aria-label="listen">' + ICON.speak + '</button>' : '') + '</div>' + (s.b ? '<p class="muted">' + tx('Bạn nên nói về:', 'You should say:') + '</p><ul>' + s.b.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul><p class="small muted" id="phase">' + tx('1 phút chuẩn bị, sau đó nói tối đa 2 phút.', '1 minute to prepare, then speak for up to 2 minutes.') + '</p>' : '') + '</section>' +
      (window.recUI ? recUI(k) : '') + '<section class="card"><label class="small muted" for="sans">' + (Voice.canListen() ? tx('Bấm micro và nói – lời nói sẽ được chuyển thành chữ. Hoặc gõ câu trả lời.', 'Tap the mic and speak, or type your answer.') : tx('Gõ câu trả lời như bạn sẽ nói (trên điện thoại có thể dùng nút micro của bàn phím).', 'Type your answer as you would say it (on a phone, try your keyboard\'s mic).')) + '</label><textarea id="sans" class="essay short"></textarea><p class="small muted" id="dictPartial"></p><div class="row between">' + (Voice.canListen() ? '<button class="btn alt mic" data-act="mic">' + ICON.mic + tx('Nói', 'Speak') + '</button>' : '<span></span>') + '<div class="row">' + (k ? '<button class="btn ghost" data-act="sPrev">' + tx('Câu trước', 'Back') + '</button>' : '') + '<button class="btn" data-act="sNext">' + (k + 1 < steps.length ? tx('Câu tiếp', 'Next') : (AI.ok() ? tx('Chấm điểm', 'Get feedback') : tx('Hoàn thành', 'Finish'))) + '</button></div></div></section><div id="sres"></div>');
    const ta = $('#sans'); ta.value = answers[k]; ta.addEventListener('input', () => answers[k] = ta.value);
    if (s.part === 2) startTimer(60, '#st', () => { const ph = $('#phase'); if (ph) ph.textContent = tx('Bắt đầu nói! (2 phút)', 'Start speaking! (2 minutes)'); startTimer(120, '#st', () => toast(tx('Hết 2 phút.', '2 minutes are up.'))); });
  }
  ACT.mic = (a, btn) => Voice.listen($('#sans'), btn);
  ACT.sPrev = () => { k--; render(); };
  ACT.sNext = async () => {
    if (k + 1 < steps.length) { k++; render(); return; }
    const out = $('#sres'); const filled = steps.map((s, j) => ({ part: s.part, q: s.q, a: answers[j].trim() })).filter(x => x.a);
    if (!filled.length) { toast(tx('Bạn chưa trả lời câu nào.', 'No answers yet.')); return; }
    if (!AI.ok()) { offlineSpeak(filled, out, ctx); return; }
    $('[data-act=sNext]').disabled = true; out.innerHTML = '<section class="card"><p class="pulse">' + tx('Giám khảo AI đang nghe lại câu trả lời…', 'The AI examiner is reviewing…') + '</p></section>';
    try {
      const r = await AI.json('You are an experienced IELTS Speaking examiner. Below are a candidate\'s answers, transcribed by speech-to-text or typed. Assess Fluency & Coherence, Lexical Resource and Grammatical Range & Accuracy using the public IELTS descriptors. You cannot hear pronunciation, so give no pronunciation band; instead note words that are often mispronounced by Vietnamese speakers in their answers. Short answers lose fluency marks. Be calibrated, do not inflate.\n' + filled.map(x => 'Part ' + x.part + ' Q: ' + x.q + '\nA: ' + x.a).join('\n\n') + '\nReturn JSON {"overall":0,"FC":0,"LR":0,"GRA":0,"summary":"","errors":[{"original":"","correction":"","why":""}],"better":[{"q":"","sample":"a natural band-7.5 answer the candidate could give, using their ideas"}],"pron":["word – tip"],"tips":["","",""]}. Up to 6 errors, 2 sample answers. ' + langLine(), 'complex');
      const ov = roundBand(((+r.FC || 0) + (+r.LR || 0) + (+r.GRA || 0)) / 3 || +r.overall || 0);
      if (!ctx.place && !ctx.mock) pushBand('S', ov);
      reward(25, 1, 'Speaking'); markActive(); logHist('speaking', cue.t.slice(0, 40), 'Band ' + ov);
      const L = a => Array.isArray(a) ? a : [];
      out.innerHTML = '<section class="card result"><div class="ring" style="--p:' + (ov / 9 * 100) + '"><b>' + ov.toFixed(1) + '</b></div><div><h2>' + tx('Band ước tính (chưa tính phát âm)', 'Estimated band (pronunciation not assessed)') + '</h2><p>' + esc(r.summary || '') + '</p></div></section><section class="card"><div class="bands">' + [['FC', 'Fluency & Coherence'], ['LR', 'Lexical Resource'], ['GRA', 'Grammar']].map(c => '<div class="bandrow"><span>' + c[1] + '</span>' + bar((+r[c[0]] || 0) / 9 * 100) + '<b>' + (+r[c[0]] || 0).toFixed(1) + '</b></div>').join('') + '</div></section>' +
        (L(r.errors).length ? '<section class="card"><h2>' + tx('Lỗi cần sửa', 'Errors to fix') + '</h2>' + L(r.errors).map(e => '<div class="fix"><p><s class="bad">' + esc(e.original) + '</s> → <b class="ok">' + esc(e.correction) + '</b></p><p class="small muted">' + esc(e.why) + '</p></div>').join('') + '</section>' : '') +
        (L(r.better).length ? '<section class="card"><h2>' + tx('Câu trả lời mẫu', 'Sample answers') + '</h2>' + L(r.better).map(b => '<div class="fix"><p class="small muted">' + esc(b.q) + '</p><p class="model">' + esc(b.sample) + '</p><button class="link" data-act="say" data-arg="' + esc(b.sample) + '">' + tx('Nghe mẫu', 'Listen') + '</button></div>').join('') + '</section>' : '') +
        (L(r.pron).length ? '<section class="card"><h2>' + tx('Lưu ý phát âm', 'Pronunciation notes') + '</h2><ul>' + L(r.pron).map(p => '<li>' + esc(p) + '</li>').join('') + '</ul></section>' : '') +
        (L(r.tips).length ? '<section class="card"><h2>' + tx('Mẹo', 'Tips') + '</h2><ol>' + L(r.tips).map(p => '<li>' + esc(p) + '</li>').join('') + '</ol></section>' : '');
      if (ctx.mock) { const m = S.mock[ctx.mock] || (S.mock[ctx.mock] = {}); m.S = { b: ov, d: today() }; pushBand('S', ov); save(); out.insertAdjacentHTML('beforeend', '<button class="btn wide" data-act="goArg" data-arg="mock|' + ctx.mock + '">' + tx('Về đề mock', 'Back to mock') + '</button>'); }
      if (ctx.place) { S.pd = S.pd || {}; S.pd.S = ov; save(); out.insertAdjacentHTML('beforeend', '<button class="btn wide" data-act="nav" data-arg="placement">' + tx('Xem kết quả kiểm tra đầu vào', 'See placement results') + '</button>'); }
    } catch (e) { out.innerHTML = ''; $('[data-act=sNext]').disabled = false; }
  };
  render();
};

// ---------- Placement ----------
VIEWS.placement = () => {
  const pd = S.pd || {};
  const steps = [['G', tx('Ngữ pháp & từ vựng', 'Grammar & vocabulary'), tx('16 câu · 12 phút', '16 questions · 12 min'), 'plG'], ['R', 'Reading', tx('1 đoạn · 7 câu · 20 phút', '1 passage · 7 questions · 20 min'), 'plR'], ['L', 'Listening', tx('1 phần · 6 câu', '1 part · 6 questions'), 'plL'], ['W', 'Writing', tx('120–180 từ · 20 phút', '120–180 words · 20 min'), 'plW'], ['S', 'Speaking', tx('3 câu hỏi', '3 questions'), 'plS']];
  const ready = pd.G != null;
  page(head(tx('Kiểm tra đầu vào', 'Placement test'), tx('Làm theo thứ tự hoặc từng phần. Không tra từ điển để kết quả chính xác.', 'Do the parts in any order. No dictionary for an honest result.'), 'tests') +
    '<div class="steps">' + steps.map((s, i) => '<div class="card step' + (pd[s[0]] != null ? ' done' : '') + '"><span class="snum">' + (pd[s[0]] != null ? ICON.check : i + 1) + '</span><div><b>' + s[1] + '</b><p class="muted small">' + s[2] + (pd[s[0]] != null ? ' · ' + (s[0] === 'G' ? pd.G + '%' : 'Band ' + pd[s[0]]) : '') + '</p></div><button class="btn sm' + (pd[s[0]] != null ? ' ghost' : '') + '" data-act="' + s[3] + '">' + (pd[s[0]] != null ? tx('Làm lại', 'Redo') : tx('Bắt đầu', 'Start')) + '</button></div>').join('') + '</div>' +
    (!AI.ok() ? noAI() : '') +
    (ready ? '<div class="actions"><button class="btn gold" data-act="plDone">' + tx('Xem kết quả & lộ trình', 'See results & study path') + '</button></div>' : ''));
};
ACT.plG = () => runQuiz({ title: tx('Đầu vào · Ngữ pháp & từ vựng', 'Placement · Grammar & vocab'), qs: C.PL.map((q, i) => normQ(q, 'q:p:' + i)), mode: 'timed', time: 12 * 60, kind: 'placement', back: () => go('placement'), onFinish: r => { S.pd = S.pd || {}; S.pd.G = r.pct; save(); } });
ACT.plR = () => go('reading', 'r3', 'timed', encodeURIComponent(JSON.stringify({ place: 1 })));
ACT.plL = () => go('listening', 'l1', 'timed', encodeURIComponent(JSON.stringify({ place: 1 })));
ACT.plW = () => go('writing', 'place', 'timed', encodeURIComponent(JSON.stringify({ place: 1 })));
ACT.plS = () => go('speaking', '0', encodeURIComponent(JSON.stringify({ place: 1 })));
ACT.plDone = () => {
  const pd = S.pd; const g = pd.G; const lvl = g < 40 ? 'A2' : g < 65 ? 'B1' : g < 85 ? 'B2' : 'C1';
  S.level = lvl; S.placement = { d: today(), level: lvl, G: g, R: pd.R, L: pd.L, W: pd.W, S: pd.S };
  ['R', 'L', 'W', 'S'].forEach(k => pd[k] != null && pushBand(k, pd[k])); save(); reward(40, 3, tx('hoàn thành kiểm tra đầu vào', 'placement done'));
  const skills = [['L', 'Listening'], ['R', 'Reading'], ['W', 'Writing'], ['S', 'Speaking']].filter(x => pd[x[0]] != null).sort((a, b) => pd[a[0]] - pd[b[0]]);
  const weakest = skills[0];
  const path = { A2: [tx('Tuần 1–4: ngữ pháp A2–B1 (thì, so sánh, câu điều kiện) + từ vựng đời sống, giáo dục.', 'Weeks 1–4: A2–B1 grammar + daily life & education vocab.'), tx('Tuần 5–8: bắt đầu Reading/Listening B1 dạng luyện tập, viết đoạn văn ngắn.', 'Weeks 5–8: B1 reading/listening practice, short paragraphs.'), tx('Tuần 9+: chuyển sang B2, làm mock test mỗi 2 tuần.', 'Week 9+: move to B2, a mock every 2 weeks.')], B1: [tx('Tuần 1–3: củng cố ngữ pháp B1–B2 (bị động, mệnh đề quan hệ, liên từ).', 'Weeks 1–3: B1–B2 grammar (passive, relative clauses, linking).'), tx('Tuần 4–8: từ vựng B2 theo chủ đề IELTS + Writing Task 2 mỗi tuần.', 'Weeks 4–8: B2 topic vocab + one Task 2 per week.'), tx('Tuần 9+: mock test 2 tuần/lần, ôn lỗi sai hằng ngày.', 'Week 9+: mock every 2 weeks, daily review.')], B2: [tx('Tuần 1–4: cấu trúc C1 (đảo ngữ, danh từ hóa, hedging) + từ vựng chuyên sâu.', 'Weeks 1–4: C1 structures + specialised vocab.'), tx('Tuần 5–8: luyện đề tính giờ chuẩn, Writing 2 bài/tuần.', 'Weeks 5–8: timed tests, 2 essays per week.'), tx('Tuần 9+: mock test mỗi tuần, tập trung kỹ năng yếu nhất.', 'Week 9+: weekly mocks, focus on the weakest skill.')], C1: [tx('Tập trung đề tính giờ, từ vựng học thuật và chuyên ngành.', 'Focus on timed tests and academic/specialised vocabulary.'), tx('Writing/Speaking: nhắm band 7.5+ – sửa lỗi nhỏ, tăng độ tự nhiên.', 'Writing/Speaking: aim for 7.5+ – polish accuracy and naturalness.'), tx('Mock test mỗi tuần.', 'Weekly mock tests.')] }[lvl];
  modal('<div class="center">' + mascot(90, Object.assign({}, S.eq, { hat: 'grad' })) + '<p class="eyebrow">' + tx('Kết quả đầu vào', 'Placement result') + '</p><h2>' + tx('Trình độ hiện tại: ', 'Current level: ') + lvBadge(lvl) + '</h2></div><div class="bands">' + skills.map(([k, n]) => '<div class="bandrow"><span>' + n + '</span>' + bar(pd[k] / 9 * 100) + '<b>' + (+pd[k]).toFixed(1) + '</b></div>').join('') + '<div class="bandrow"><span>' + tx('Ngữ pháp & từ vựng', 'Grammar & vocab') + '</span>' + bar(g) + '<b>' + g + '%</b></div></div>' + (weakest ? '<p>' + tx('Kỹ năng cần ưu tiên: ', 'Priority skill: ') + '<b class="red">' + weakest[1] + '</b></p>' : '') + '<h3>' + tx('Lộ trình gợi ý', 'Suggested path') + '</h3><ol>' + path.map(p => '<li>' + p + '</li>').join('') + '</ol><p class="small muted">' + tx('Mỗi ngày: 15 phút ôn tập + 1 bài học mới. Hỏi Gia sư AI nếu muốn lộ trình chi tiết theo tuần.', 'Daily: 15 min review + one new lesson. Ask the AI tutor for a week-by-week plan.') + '</p><button class="btn wide" data-act="nav" data-arg="home">' + tx('Bắt đầu học', 'Start learning') + '</button>');
};

// ---------- Mock ----------
VIEWS.mock = id => {
  const m = C.M.find(x => x.id === id); if (!m) return go('tests', 'mock'); const r = S.mock[id] || {};
  const c = s => encodeURIComponent(JSON.stringify({ mock: id }));
  const done = ['L', 'R', 'W', 'S'].filter(k => r[k] && r[k].b != null);
  const ov = done.length === 4 ? roundBand(done.reduce((a, k) => a + r[k].b, 0) / 4) : null;
  const sec = [['L', 'Listening', tx('2 phần · nghe 1 lần', '2 parts · one play'), 'mL'], ['R', 'Reading', tx('2 đoạn · 40 phút', '2 passages · 40 min'), 'mR'], ['W', 'Writing', tx('Task 1 (20\') + Task 2 (40\')', 'Task 1 (20\') + Task 2 (40\')'), 'mW'], ['S', 'Speaking', 'Part 1 · 2 · 3', 'mS']];
  page(head(esc(m.title), esc(m.lvl) + (ov != null ? ' · ' + tx('Band tổng ', 'Overall ') + ov.toFixed(1) : ''), 'tests', 'mock') +
    '<div class="steps">' + sec.map(s => '<div class="card step' + (r[s[0]] ? ' done' : '') + '"><span class="snum">' + (r[s[0]] ? ICON.check : s[0]) + '</span><div><b>' + s[1] + '</b><p class="muted small">' + s[2] + (r[s[0]] && r[s[0]].b != null ? ' · Band ' + r[s[0]].b : '') + '</p></div><button class="btn sm' + (r[s[0]] ? ' ghost' : '') + '" data-act="' + s[3] + '" data-arg="' + id + '">' + (r[s[0]] ? tx('Làm lại', 'Redo') : tx('Bắt đầu', 'Start')) + '</button></div>').join('') + '</div>' +
    (ov != null ? '<section class="card result"><div class="ring" style="--p:' + (ov / 9 * 100) + '"><b>' + ov.toFixed(1) + '</b></div><div><h2>' + tx('Band tổng ước tính', 'Estimated overall band') + '</h2><p class="muted small">' + tx('Đề rút gọn – dùng để theo dõi tiến bộ, không thay thế đề thật.', 'Shortened test – for tracking progress, not a replacement for the real exam.') + '</p></div></section>' : ''));
  if (ov != null && !(S.stamps['m:' + id])) earnStamp('m:' + id, 100, m.title, 'star');
};
ACT.mL = id => go('listening', C.M.find(x => x.id === id).L.join(','), 'timed', encodeURIComponent(JSON.stringify({ mock: id })));
ACT.mR = id => go('reading', C.M.find(x => x.id === id).R.join(','), 'timed', encodeURIComponent(JSON.stringify({ mock: id })));
ACT.mW = id => go('writing', C.M.find(x => x.id === id).W[0], 'timed', encodeURIComponent(JSON.stringify({ mock: id })));
ACT.mS = id => { const m = C.M.find(x => x.id === id); go('speaking', String(m.S.p2), encodeURIComponent(JSON.stringify({ mock: id, p1: m.S.p1 }))); };

// ---------- Games ----------
let GDECK = null;
function deckWords(key) {
  if (key.startsWith('idioms:')) { const T = (window.IDIOMS || []).find(x => x.id === key.slice(7)); return T ? idiomWords(T) : []; }
  if (key.startsWith('dict:')) { const [, l, p, q] = key.split(':'); return dictPage(l, +p, q || '').filter(x => DICT[l] && DICT[l][x.w]).map(x => dictWord(l, x.w)); }
  if (key.startsWith('lit:')) { const it = (window.LIT || []).find(x => x.id === key.slice(4)); return it ? it.vocab.map((v, i) => ({ w: v[0], pos: v[1], vi: v[2], def: v[2], ex: v[3] || it.title, col: '', syn: '', key: 'lv:' + it.id + '|' + i })) : []; }
  if (key === 'srs') { const ws = []; Object.keys(S.srs).filter(k => k.startsWith('v:')).forEach(k => { const [sk, w] = k.slice(2).split('|'); const sub = subByKey(sk); const o = sub && wordsOf(sub).find(x => x.w === w); if (o) ws.push(o); }); return ws; }
  const sub = subByKey(key); return sub ? wordsOf(sub) : [];
}
VIEWS.games = () => {
  const subs = allSubs(); if (!GDECK) GDECK = (subs.find(x => x.s.lvl === S.level) || subs[0]).key;
  const learned = deckWords('srs').length;
  page(head(tx('Trò chơi', 'Games'), tx('Chơi để nhớ từ – mỗi lượt đều được xu và tự vào lịch ôn tập', 'Play to remember – every round earns coins and feeds your review'), null) +
    '<section class="card"><label>' + tx('Bộ từ', 'Word deck') + '<select id="deck">' + (learned >= 6 ? '<option value="srs"' + (GDECK === 'srs' ? ' selected' : '') + '>' + tx('Từ mình đang ôn (', 'My review words (') + learned + ')</option>' : '') + '<optgroup label="' + tx('Từ vựng theo chủ đề', 'Topic vocabulary') + '">' + subs.map(x => '<option value="' + esc(x.key) + '"' + (x.key === GDECK ? ' selected' : '') + '>' + esc(pick(x.tp.t)) + ' › ' + esc(pick(x.s.t)) + ' (' + x.s.lvl + ')</option>').join('') + '</optgroup><optgroup label="Idioms">' + (window.IDIOMS || []).map(T => '<option value="idioms:' + T.id + '"' + ('idioms:' + T.id === GDECK ? ' selected' : '') + '>Idioms › ' + esc(pick(T.th)) + '</option>').join('') + '</optgroup></select></label></section>' +
    '<div class="grid2 games">' + [['flash', 'Flashcard', tx('Lật thẻ, tự đánh giá nhớ hay chưa', 'Flip cards and rate yourself')], ['match', tx('Nối từ', 'Match'), tx('Nối từ với nghĩa thật nhanh', 'Pair words with meanings fast')], ['cross', tx('Ô chữ', 'Crossword'), tx('Giải ô chữ từ nghĩa tiếng Việt', 'Solve a crossword from clues')], ['scramble', tx('Xếp chữ', 'Word scramble'), tx('Sắp xếp lại các chữ cái', 'Unscramble the letters')]].map(g => '<button class="card tile game" data-act="playG" data-arg="' + g[0] + '"><b>' + g[1] + '</b><span class="muted small">' + g[2] + '</span></button>').join('') + '</div>');
  $('#deck').addEventListener('change', e => GDECK = e.target.value);
};
ACT.playG = g => go(g, GDECK);
const gameHead = (title, key) => '<div class="phead"><button class="iconbtn" data-act="nav" data-arg="games">' + ICON.back + '</button><div><h1>' + title + '</h1><p class="muted">' + esc(key === 'srs' ? tx('Từ đang ôn', 'Review words') : key.startsWith('idioms:') ? 'Idioms · ' + pick(((window.IDIOMS || []).find(x => x.id === key.slice(7)) || { th: [''] }).th) : key.startsWith('dict:') ? tx('Từ điển ', 'Dictionary ') + key.split(':')[1] : pick((subByKey(key) || { s: { t: [''] } }).s.t)) + '</p></div></div>';

VIEWS.flash = key => {
  const deck = shuffle(deckWords(key)).slice(0, 15); let i = 0, flip = false, known = 0;
  if (!deck.length) return go('games');
  const draw = () => {
    if (i >= deck.length) { reward(deck.length + known, 0, 'Flashcard'); markActive(); page(gameHead('Flashcard', key) + '<section class="card center">' + mascot(100, Object.assign({}, S.eq, { acc: 'star' })) + '<h2>' + tx('Xong bộ thẻ!', 'Deck done!') + '</h2><p>' + known + '/' + deck.length + tx(' thẻ đã nhớ', ' remembered') + '</p><div class="actions"><button class="btn" data-act="goArg" data-arg="flash|' + esc(key) + '">' + tx('Chơi lại', 'Again') + '</button><button class="btn ghost" data-act="nav" data-arg="games">' + tx('Trò khác', 'Other games') + '</button></div></section>'); return; }
    const w = deck[i];
    page(gameHead('Flashcard', key) + bar(i / deck.length * 100) + '<div class="flashwrap"><button class="flash' + (flip ? ' flipped' : '') + '" data-act="fFlip"><div class="face front"><h2>' + esc(w.w) + '</h2><p class="muted">' + esc(w.pos) + '</p><p class="small muted">' + tx('Chạm để lật', 'Tap to flip') + '</p></div><div class="face back"><p class="vi">' + esc(w.vi) + '</p><p class="small">' + esc(w.def) + '</p><p class="ex">' + esc(w.ex) + '</p>' + (w.col ? '<p class="small"><b class="red">' + esc(w.col) + '</b></p>' : '') + '</div></button></div><div class="actions center"><button class="iconbtn" data-act="say" data-arg="' + esc(w.w) + '">' + ICON.speak + '</button><button class="btn ghost" data-act="fRate" data-arg="0">' + tx('Chưa nhớ', 'Not yet') + '</button><button class="btn" data-act="fRate" data-arg="1">' + tx('Nhớ rồi', 'Got it') + '</button></div>');
  };
  ACT.fFlip = () => { flip = !flip; $('.flash').classList.toggle('flipped', flip); };
  ACT.fRate = v => { srsTouch(deck[i].key, v === '1'); if (v === '1') known++; save(); i++; flip = false; draw(); };
  const kh = e => { if (e.key === ' ' && $('.flash')) { e.preventDefault(); ACT.fFlip(); } }; document.addEventListener('keydown', kh); onLeave(() => document.removeEventListener('keydown', kh));
  draw();
};

VIEWS.match = key => {
  const deck = take(deckWords(key), 6); if (deck.length < 3) return go('games');
  const L = shuffle(deck), R = shuffle(deck); let sel = null, miss = 0, left = deck.length; const t0 = Date.now();
  page(gameHead(tx('Nối từ', 'Match'), key) + '<p class="muted">' + tx('Chọn một từ bên trái rồi chọn nghĩa đúng bên phải.', 'Pick a word on the left, then its meaning on the right.') + '</p><div class="match"><div>' + L.map(w => '<button class="mt" data-act="mL" data-arg="' + esc(w.w) + '">' + esc(w.w) + '</button>').join('') + '</div><div>' + R.map(w => '<button class="mt r" data-act="mR" data-arg="' + esc(w.w) + '">' + esc(LANG === 'en' ? w.def : w.vi) + '</button>').join('') + '</div></div><p class="muted small center" id="mstat"></p>');
  ACT.mL = (w, el) => { $$('.mt:not(.r)').forEach(b => b.classList.remove('sel')); el.classList.add('sel'); sel = w; };
  ACT.mR = (w, el) => {
    if (!sel) return; const lb = $$('.mt:not(.r)').find(b => b.dataset.arg === sel); const word = deck.find(x => x.w === sel);
    if (w === sel) { lb.classList.add('gone'); el.classList.add('gone'); srsTouch(word.key, true); left--; sel = null; if (!left) { const sec = Math.round((Date.now() - t0) / 1000); const c = Math.max(6, 24 - miss * 3 - Math.floor(sec / 8)); reward(c, 0, tx('Nối từ', 'Match')); markActive(); $('#mstat').innerHTML = tx('Hoàn thành trong ', 'Done in ') + sec + 's · ' + miss + tx(' lần sai', ' misses') + ' · <button class="link" data-act="goArg" data-arg="match|' + esc(key) + '">' + tx('Chơi lại', 'Play again') + '</button>'; } }
    else { miss++; srsTouch(word.key, false); el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 400); }
  };
};

function buildCross(words) {
  const N = 23, G = Array.from({ length: N }, () => Array(N).fill(null)), placed = [];
  const get = (r, c) => (r < 0 || c < 0 || r >= N || c >= N) ? null : G[r][c];
  const fits = (a, r0, c0, dir) => {
    const dr = dir === 'D' ? 1 : 0, dc = dir === 'A' ? 1 : 0; let hits = 0;
    if (r0 < 0 || c0 < 0 || r0 + dr * (a.length - 1) >= N || c0 + dc * (a.length - 1) >= N) return -1;
    if (get(r0 - dr, c0 - dc) || get(r0 + dr * a.length, c0 + dc * a.length)) return -1;
    for (let j = 0; j < a.length; j++) {
      const r = r0 + dr * j, c = c0 + dc * j, cell = G[r][c];
      if (cell) { if (cell !== a[j]) return -1; hits++; }
      else if ((dir === 'A' && (get(r - 1, c) || get(r + 1, c))) || (dir === 'D' && (get(r, c - 1) || get(r, c + 1)))) return -1;
    }
    return hits;
  };
  const put = (w, r0, c0, dir) => { for (let j = 0; j < w.a.length; j++) G[r0 + (dir === 'D' ? j : 0)][c0 + (dir === 'A' ? j : 0)] = w.a[j]; placed.push(Object.assign({}, w, { r: r0, c: c0, dir })); };
  const ws = words.slice().sort((x, y) => y.a.length - x.a.length);
  put(ws[0], 11, Math.floor((N - ws[0].a.length) / 2), 'A');
  ws.slice(1).forEach(w => {
    let best = null;
    placed.forEach(p => { for (let j = 0; j < p.a.length; j++) for (let k = 0; k < w.a.length; k++) if (p.a[j] === w.a[k]) {
      const pr = p.r + (p.dir === 'D' ? j : 0), pc = p.c + (p.dir === 'A' ? j : 0), dir = p.dir === 'A' ? 'D' : 'A';
      const r0 = dir === 'D' ? pr - k : pr, c0 = dir === 'A' ? pc - k : pc; const h = fits(w.a, r0, c0, dir);
      if (h > 0 && (!best || h > best.h || (h === best.h && Math.random() < .3))) best = { r0, c0, dir, h };
    } });
    if (best) put(w, best.r0, best.c0, best.dir);
  });
  let r1 = N, c1 = N, r2 = 0, c2 = 0; placed.forEach(p => { r1 = Math.min(r1, p.r); c1 = Math.min(c1, p.c); r2 = Math.max(r2, p.r + (p.dir === 'D' ? p.a.length - 1 : 0)); c2 = Math.max(c2, p.c + (p.dir === 'A' ? p.a.length - 1 : 0)); });
  placed.forEach(p => { p.r -= r1; p.c -= c1; });
  const starts = {}; let num = 0; placed.slice().sort((a, b) => a.r - b.r || a.c - b.c).forEach(p => { const k = p.r + ',' + p.c; if (!starts[k]) starts[k] = ++num; p.n = starts[k]; });
  return { rows: r2 - r1 + 1, cols: c2 - c1 + 1, placed, starts };
}
VIEWS.cross = key => {
  const pool = shuffle(deckWords(key).filter(w => /^[a-zA-Z]{3,11}$/.test(w.w))).slice(0, 9);
  if (pool.length < 3) { toast(tx('Bộ từ này ít từ đơn – chọn bộ khác nhé.', 'Not enough single words – pick another deck.')); return go('games'); }
  const cw = buildCross(pool.map(w => ({ a: w.w.toUpperCase(), clue: LANG === 'en' ? w.def : w.vi + ' (' + w.pos + ')', w })));
  const cell = {}; cw.placed.forEach(p => { for (let j = 0; j < p.a.length; j++) { const r = p.r + (p.dir === 'D' ? j : 0), c = p.c + (p.dir === 'A' ? j : 0); cell[r + ',' + c] = p.a[j]; } });
  let grid = ''; for (let r = 0; r < cw.rows; r++) for (let c = 0; c < cw.cols; c++) { const k = r + ',' + c; grid += cell[k] ? '<div class="cc">' + (cw.starts[k] ? '<i>' + cw.starts[k] + '</i>' : '') + '<input maxlength="1" data-k="' + k + '" data-r="' + r + '" data-c="' + c + '" autocomplete="off" autocapitalize="characters"></div>' : '<div class="cc empty"></div>'; }
  const clues = d => cw.placed.filter(p => p.dir === d).sort((a, b) => a.n - b.n).map(p => '<li><b>' + p.n + '.</b> ' + esc(p.clue) + ' <span class="muted">(' + p.a.length + ')</span></li>').join('');
  page(gameHead(tx('Ô chữ', 'Crossword'), key) + '<div class="crosswrap"><div class="cw" style="grid-template-columns:repeat(' + cw.cols + ',minmax(0,1fr));max-width:' + (cw.cols * 38) + 'px">' + grid + '</div><div class="card clues"><h3>' + tx('Hàng ngang', 'Across') + '</h3><ol>' + clues('A') + '</ol><h3>' + tx('Hàng dọc', 'Down') + '</h3><ol>' + clues('D') + '</ol><div class="row"><button class="btn" data-act="cwCheck">' + tx('Kiểm tra', 'Check') + '</button><button class="btn ghost sm" data-act="cwHint">' + tx('Gợi ý 1 chữ (−2 xu)', 'Hint (−2 coins)') + '</button></div><p id="cwmsg" class="small"></p></div></div>');
  let dir = 'A'; const inputs = $$('.cw input');
  inputs.forEach(inp => {
    inp.addEventListener('focus', () => inp.select());
    inp.addEventListener('input', () => { inp.value = inp.value.toUpperCase().replace(/[^A-Z]/g, ''); inp.parentNode.classList.remove('bad', 'ok'); if (!inp.value) return; const r = +inp.dataset.r, c = +inp.dataset.c; const nx = $('.cw input[data-k="' + (dir === 'A' ? r + ',' + (c + 1) : (r + 1) + ',' + c) + '"]') || $('.cw input[data-k="' + (dir === 'A' ? (r + 1) + ',' + c : r + ',' + (c + 1)) + '"]'); if (nx) { if (!$('.cw input[data-k="' + (dir === 'A' ? r + ',' + (c + 1) : (r + 1) + ',' + c) + '"]')) dir = dir === 'A' ? 'D' : 'A'; nx.focus(); } });
    inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !inp.value) { const r = +inp.dataset.r, c = +inp.dataset.c; const pv = $('.cw input[data-k="' + (dir === 'A' ? r + ',' + (c - 1) : (r - 1) + ',' + c) + '"]'); if (pv) pv.focus(); } });
    inp.addEventListener('click', () => { const r = +inp.dataset.r, c = +inp.dataset.c; const ac = $('.cw input[data-k="' + r + ',' + (c + 1) + '"]') || $('.cw input[data-k="' + r + ',' + (c - 1) + '"]'); const dn = $('.cw input[data-k="' + (r + 1) + ',' + c + '"]') || $('.cw input[data-k="' + (r - 1) + ',' + c + '"]'); dir = ac && dn ? (dir === 'A' ? 'D' : 'A') : ac ? 'A' : 'D'; });
  });
  let solved = false;
  ACT.cwCheck = () => {
    let all = true; inputs.forEach(i => { const ok = i.value === cell[i.dataset.k]; i.parentNode.classList.toggle('ok', ok && !!i.value); i.parentNode.classList.toggle('bad', !!i.value && !ok); if (!ok) all = false; });
    if (all && !solved) { solved = true; cw.placed.forEach(p => srsTouch(p.w.key, true)); reward(20 + cw.placed.length * 2, 1, tx('Ô chữ', 'Crossword')); markActive(); $('#cwmsg').innerHTML = '<b class="ok">' + tx('Giải xong ô chữ!', 'Crossword solved!') + '</b> <button class="link" data-act="goArg" data-arg="cross|' + esc(key) + '">' + tx('Ô chữ mới', 'New puzzle') + '</button>'; }
    else if (!all) $('#cwmsg').textContent = tx('Còn ô sai hoặc trống.', 'Some cells are wrong or empty.');
  };
  ACT.cwHint = () => { if (S.coins < 2) return toast(tx('Không đủ xu.', 'Not enough coins.')); const e = inputs.filter(i => i.value !== cell[i.dataset.k]); if (!e.length) return; const i = e[Math.random() * e.length | 0]; i.value = cell[i.dataset.k]; i.parentNode.classList.add('ok'); S.coins -= 2; save(); paintWallet(); };
};

VIEWS.scramble = key => {
  const deck = shuffle(deckWords(key).filter(w => /^[a-zA-Z]{3,12}$/.test(w.w))).slice(0, 8); if (deck.length < 2) { toast(tx('Bộ này ít từ đơn – chọn bộ khác nhé.', 'Pick another deck.')); return go('games'); }
  let i = 0, ok = 0;
  const draw = () => {
    if (i >= deck.length) { reward(ok * 3 + 5, 0, tx('Xếp chữ', 'Scramble')); markActive(); page(gameHead(tx('Xếp chữ', 'Scramble'), key) + '<section class="card center"><h2>' + ok + '/' + deck.length + '</h2><div class="actions"><button class="btn" data-act="goArg" data-arg="scramble|' + esc(key) + '">' + tx('Chơi lại', 'Again') + '</button><button class="btn ghost" data-act="nav" data-arg="games">' + tx('Trò khác', 'Other games') + '</button></div></section>'); return; }
    const w = deck[i]; let letters = w.w.toUpperCase().split(''); let sh = shuffle(letters); let tries = 0; while (sh.join('') === letters.join('') && tries++ < 5) sh = shuffle(letters);
    page(gameHead(tx('Xếp chữ', 'Scramble'), key) + bar(i / deck.length * 100) + '<section class="card center"><p class="muted">' + esc(LANG === 'en' ? w.def : w.vi) + '</p><div class="tiles">' + sh.map(l => '<span>' + esc(l) + '</span>').join('') + '</div><form id="scf" class="gapf"><input id="scin" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn">OK</button></form><p id="scfb"></p></section>');
    $('#scin').focus();
    $('#scf').addEventListener('submit', e => { e.preventDefault(); const g = norm($('#scin').value) === w.w.toLowerCase(); srsTouch(w.key, g); if (g) ok++; $('#scfb').innerHTML = (g ? '<b class="ok">' + tx('Đúng!', 'Correct!') + '</b>' : '<b class="bad">' + esc(w.w) + '</b>') + ' – ' + esc(w.ex); $('#scin').disabled = true; setTimeout(() => { i++; draw(); }, g ? 900 : 2200); });
  };
  draw();
};

// ---------- Stamp album ----------
const ALBUMS = { rose: '#f7c6d2', sky: '#c6e2f7', sage: '#cfe5c6', butter: '#f9e7a8', lilac: '#dccff5', cocoa: '#c9a99a' };
VIEWS.stamps = () => {
  const subs = allSubs(); const total = subs.length + LV.length + C.M.length + CUP.length + (window.LIT || []).length; const got = Object.keys(S.stamps).length;
  const sec = (title, list) => '<section class="album-page"><h2>' + title + '</h2><div class="stampgrid">' + list.map(([k, label, icon]) => { const st = S.stamps[k]; return '<button class="stampcell" data-act="stampView" data-arg="' + esc(k) + '" title="' + esc(label) + '">' + stampSVG(label, icon, st ? st.d : '', st ? st.s : 0, !!st) + '</button>'; }).join('') + '</div></section>';
  page(head(tx('Album tem', 'Stamp album'), got + '/' + total + tx(' tem · đạt ≥ 80% bài kiểm tra chủ đề để nhận tem', ' stamps · score ≥ 80% on a topic test to collect one')) +
    '<div class="album" style="--album:' + (ALBUMS[S.eq.album] || ALBUMS.rose) + '">' + '<section class="album-page cup"><h2>' + tx('Bộ tem đặc biệt · Cúp Sân cỏ', 'Special series · Pitch Cup') + '</h2><p class="small muted">' + tx('10 tem mở khóa bằng thành tích học – sưu tầm đủ để giành Cú ăn ba!', '10 stamps unlocked by study milestones – collect them all for the treble!') + '</p><div class="stampgrid">' + CUP.map(c => { const k = 'c:' + c[0], st = S.stamps[k]; return '<button class="stampcell" data-act="stampView" data-arg="' + k + '">' + stampSVG(pick([c[1], c[2]]), c[3], st ? st.d : '', st ? st.s : 0, !!st) + '</button>'; }).join('') + '</div></section>' +
    C.T.map(tp => sec(esc(pick(tp.t)), subs.filter(x => x.tp.id === tp.id).map(x => ['t:' + x.key, pick(x.s.t), tp.icon]))).join('') +
    (subs.some(x => x.ai) ? sec(esc(pick(AI_TOPIC.t)), subs.filter(x => x.ai).map(x => ['t:' + x.key, pick(x.s.t), 'star'])) : '') +
    sec(tx('Ngữ pháp', 'Grammar'), LV.map(l => ['g:' + l, 'Grammar ' + l, 'pen'])) +
    sec(tx('Văn & nhạc', 'Stories & songs'), (window.LIT || []).map(x => ['l:' + x.id, x.title, x.kind === 'carol' ? 'star' : 'book'])) +
    sec('Mock tests', C.M.map(m => ['m:' + m.id, m.title, 'star'])) + '</div>');
};
ACT.stampView = k => {
  const st = S.stamps[k];
  if (!st) { const cup = CUP.find(c => 'c:' + c[0] === k); const how = cup ? tx('Điều kiện: ', 'To unlock: ') + pick([cup[4], cup[5]]) : k.startsWith('t:') ? tx('Mở chủ đề và đạt từ 80% ở "Kiểm tra lấy tem".', 'Open the topic and score 80%+ on its stamp test.') : k.startsWith('l:') ? tx('Vào Văn & nhạc, mở bài này và đạt từ 80% ở "Kiểm tra lấy tem".', 'Open it in Stories & songs and score 80%+ on its stamp test.') : k.startsWith('g:') ? tx('Vào Học › Ngữ pháp và làm "Kiểm tra lấy tem" của cấp độ này.', 'Go to Learn › Grammar and take this level\'s stamp test.') : tx('Hoàn thành cả 4 phần của đề mock.', 'Finish all 4 sections of the mock.'); modal('<div class="center"><p>' + how + '</p>' + (k.startsWith('t:') ? '<button class="btn" data-act="goArg" data-arg="sub|' + esc(k.slice(2)) + '">' + tx('Đến chủ đề', 'Go to topic') + '</button>' : '') + '<button class="btn ghost" data-act="closeModal">OK</button></div>'); return; }
  modal('<div class="center"><div class="bigstamp">' + stampSVG(st.label, st.icon, st.d, st.s, true) + '</div><p>' + esc(st.label) + '</p><p class="muted small">' + tx('Nhận ngày ', 'Collected ') + esc(st.d) + ' · ' + st.s + '%</p><button class="btn" data-act="closeModal">OK</button></div>');
};

// ---------- Shop ----------
const SHOP = [
  ['skin', 'dau', 0, 'c'], ['skin', 'matcha', 120, 'c'], ['skin', 'sky', 120, 'c'], ['skin', 'lav', 150, 'c'], ['skin', 'peach', 150, 'c'], ['skin', 'mint', 150, 'c'], ['skin', 'cacao', 4, 'g'], ['skin', 'pitch', 1000, 'c'], ['skin', 'xmas', 1200, 'c'],
  ['pat', 'none', 0, 'c'], ['pat', 'dots', 60, 'c'], ['pat', 'grid', 60, 'c'], ['pat', 'hearts', 90, 'c'], ['pat', 'stars', 90, 'c'], ['pat', 'clouds', 2, 'g'], ['pat', 'pitch', 200, 'c'], ['pat', 'snow', 150, 'c'],
  ['hat', 'none', 0, 'c'], ['hat', 'bow', 80, 'c'], ['hat', 'beret', 100, 'c'], ['hat', 'cap', 100, 'c'], ['hat', 'flower', 120, 'c'], ['hat', 'grad', 3, 'g'], ['hat', 'crown', 6, 'g'], ['hat', 'band', 150, 'c'], ['hat', 'santa', 250, 'c'],
  ['acc', 'none', 0, 'c'], ['acc', 'blush', 50, 'c'], ['acc', 'glasses', 80, 'c'], ['acc', 'scarf', 90, 'c'], ['acc', 'headphones', 120, 'c'], ['acc', 'star', 2, 'g'], ['acc', 'kit', 300, 'c'], ['acc', 'ball', 3, 'g'], ['acc', 'xscarf', 180, 'c'],
  ['sp', 'cat', 0, 'c'], ['sp', 'tiger', 0, 'c'], ['sp', 'goat', 0, 'c'], ['sp', 'bunny', 120, 'c'], ['sp', 'panda', 150, 'c'], ['sp', 'butterfly', 300, 'c'],
  ['album', 'rose', 0, 'c'], ['album', 'sky', 40, 'c'], ['album', 'sage', 40, 'c'], ['album', 'butter', 40, 'c'], ['album', 'lilac', 40, 'c'], ['album', 'cocoa', 1, 'g']
];
const SHOPN = { cat: ['Mèo hồng', 'Pink cat'], tiger: ['Hổ con', 'Tiger cub'], goat: ['Dê con', 'Little goat'], bunny: ['Thỏ trắng', 'Bunny'], panda: ['Gấu trúc', 'Panda'], butterfly: ['Bướm cầu vồng', 'Rainbow butterfly'], none: ['Không', 'None'], dots: ['Chấm bi', 'Polka dots'], grid: ['Giấy kẻ ô', 'Grid paper'], hearts: ['Trái tim', 'Hearts'], stars: ['Ngôi sao', 'Stars'], clouds: ['Mây', 'Clouds'], bow: ['Nơ hồng', 'Pink bow'], beret: ['Mũ nồi', 'Beret'], cap: ['Mũ lưỡi trai', 'Cap'], flower: ['Hoa cài', 'Flower'], grad: ['Mũ tốt nghiệp', 'Grad cap'], crown: ['Vương miện', 'Crown'], blush: ['Má hồng', 'Blush'], glasses: ['Kính tròn', 'Round glasses'], scarf: ['Khăn len', 'Scarf'], headphones: ['Tai nghe', 'Headphones'], star: ['Ngôi sao', 'Star'], rose: ['Hồng', 'Rose'], sky: ['Xanh trời', 'Sky'], sage: ['Xanh lá', 'Sage'], butter: ['Vàng bơ', 'Butter'], lilac: ['Tím nhạt', 'Lilac'], cocoa: ['Nâu cacao', 'Cocoa'], pitch: ['Sân cỏ kẻ sọc', 'Pitch stripes'], band: ['Băng đô thể thao', 'Sweatband'], kit: ['Áo đấu xanh trời', 'Sky-blue kit'], ball: ['Quả bóng', 'Football'], snow: ['Bông tuyết', 'Snowflakes'], santa: ['Mũ ông già Noel', 'Santa hat'], xscarf: ['Khăn len Noel', 'Christmas scarf'] };
VIEWS.shop = (tab = 'sp') => {
  const tabs = [['sp', 'Linh vật', 'Mascots'], ['skin', 'Giao diện', 'Themes'], ['pat', 'Họa tiết nền', 'Patterns'], ['hat', 'Mũ', 'Hats'], ['acc', 'Phụ kiện', 'Accessories'], ['album', 'Bìa album tem', 'Album covers']];
  const prev = (c, id) => c === 'skin' ? '<span class="skinprev" data-skin="' + id + '"><i></i><i></i><i></i></span>' : c === 'pat' ? '<span class="patprev" data-pat="' + id + '"></span>' : c === 'album' ? '<span class="albprev" style="background:' + ALBUMS[id] + '"></span>' : c === 'sp' ? mascot(84, { sp: id, hat: 'none', acc: 'none' }) : mascot(70, Object.assign({}, S.eq, c === 'hat' ? { hat: id } : { acc: id }));
  page(head(tx('Cửa hàng', 'Shop'), tx('Đổi xu & kim cương lấy đồ trang trí cho góc học của riêng bạn', 'Spend coins & gems to decorate your own corner')) + '<div class="tabs">' + tabs.map(t => '<button class="tab' + (t[0] === tab ? ' on' : '') + '" data-act="goArg" data-arg="shop|' + t[0] + '">' + tx(t[1], t[2]) + '</button>').join('') + '</div>' +
    '<div class="shopgrid">' + SHOP.filter(x => x[0] === tab).map(([c, id, price, cur]) => { const k = c + ':' + id, own = S.owned.includes(k) || price === 0, on = S.eq[c] === id; const sp = ['skin:pitch', 'pat:pitch', 'hat:band', 'acc:kit', 'acc:ball'].includes(k) ? 'pitch' : ['skin:xmas', 'pat:snow', 'hat:santa', 'acc:xscarf'].includes(k) ? 'xmas' : ''; return '<div class="card item' + (on ? ' on' : '') + (sp ? ' special ' + sp : '') + '">' + (sp ? '<span class="sptag">' + (sp === 'xmas' ? tx('Bộ Giáng sinh', 'Christmas set') : tx('Bộ Sân cỏ', 'Pitch set')) + '</span>' : '') + prev(c, id) + '<b>' + esc(pick(c === 'skin' ? SKINS[id] : SHOPN[id])) + '</b>' + (on ? '<span class="tag">' + tx('Đang dùng', 'In use') + '</span>' : own ? '<button class="btn sm ghost" data-act="equip" data-arg="' + k + '">' + tx('Dùng', 'Use') + '</button>' : '<button class="btn sm" data-act="buy" data-arg="' + k + '">' + (cur === 'g' ? ICON.gem : ICON.coin) + price + '</button>') + '</div>'; }).join('') + '</div>');
};
ACT.buy = k => {
  const [c, id] = k.split(':'); const it = SHOP.find(x => x[0] === c && x[1] === id); const [, , price, cur] = it;
  if (cur === 'g' ? S.gems < price : S.coins < price) { toast(tx('Chưa đủ ' + (cur === 'g' ? 'kim cương' : 'xu') + ' – học thêm chút nữa nhé!', 'Not enough ' + (cur === 'g' ? 'gems' : 'coins') + ' yet!')); return; }
  if (cur === 'g') S.gems -= price; else S.coins -= price; S.owned.push(k); ACT.equip(k); toast(tx('Đã mua!', 'Bought!'), 'gold');
};
ACT.equip = k => { const [c, id] = k.split(':'); S.eq[c] = id; save(); applySkin(); go('shop', c); };

// ---------- AI tutor ----------
let CHAT = [];
VIEWS.tutor = () => {
  const sugg = [tx('Lập lộ trình học IELTS 12 tuần cho mình', 'Make me a 12-week IELTS plan'), tx('Phân biệt affect và effect', 'Affect vs effect'), tx('Cho mình 8 collocation về environment kèm ví dụ', '8 environment collocations with examples'), tx('Luyện Speaking Part 1 với mình nhé', 'Practise Speaking Part 1 with me'), tx('Sửa câu: I am agree with this opinion.', 'Fix: I am agree with this opinion.')];
  page(head(tx('Gia sư AI', 'AI tutor'), tx('Hỏi bất cứ điều gì về tiếng Anh & IELTS – giải thích bằng tiếng Việt', 'Ask anything about English & IELTS')) +
    (AI.ok() ? '<section class="card chat"><div id="msgs" class="msgs">' + (CHAT.length ? CHAT.map(m => '<div class="msg ' + m.role + '"></div>').join('') : '<div class="msg assistant"></div>') + '</div><div class="chips">' + sugg.map(s => '<button class="chipb" data-act="tSug">' + esc(s) + '</button>').join('') + '</div><form id="chatf" class="chatf"><textarea id="chatin" rows="2" placeholder="' + tx('Nhập câu hỏi…', 'Type your question…') + '"></textarea><button class="btn">' + tx('Gửi', 'Send') + '</button></form></section>' : '<section class="card">' + noAI() + '</section>'));
  if (!AI.ok()) return;
  const box = $('#msgs'); const nodes = $$('.msg', box);
  if (CHAT.length) CHAT.forEach((m, i) => nodes[i].textContent = m.content); else nodes[0].textContent = tx('Chào ' + S.name + '! Mình là gia sư IELTS của bạn. Bạn muốn hỏi gì hôm nay?', 'Hi ' + S.name + '! I\'m your IELTS tutor. What would you like to work on?');
  box.scrollTop = box.scrollHeight;
  const send = async text => {
    text = text.trim(); if (!text) return; CHAT.push({ role: 'user', content: text });
    const u = document.createElement('div'); u.className = 'msg user'; u.textContent = text; box.appendChild(u);
    const a = document.createElement('div'); a.className = 'msg assistant pulse'; a.textContent = '…'; box.appendChild(a); box.scrollTop = box.scrollHeight;
    const sys = 'You are a warm, encouraging IELTS tutor for ' + S.name + ', a Vietnamese learner at CEFR ' + S.level + (overall() ? ' (current estimated IELTS band ' + overall() + ')' : '') + (S.examDate ? ', exam date ' + S.examDate : '') + '. ' + (LANG === 'en' ? 'Reply in simple English.' : 'Trả lời bằng tiếng Việt, ví dụ bằng tiếng Anh.') + ' Be concise and practical, give examples, and gently correct any English mistakes the learner makes. Plain text, short lists allowed, no markdown headings.';
    const msgs = CHAT.slice(-12).map((m, i, arr) => ({ role: m.role, content: i === 0 ? sys + '\n\n' + m.content : m.content }));
    if (msgs[0].role !== 'user') msgs.shift();
    try { const t = await AI.text(msgs, t => { a.classList.remove('pulse'); a.textContent = t; box.scrollTop = box.scrollHeight; }); CHAT.push({ role: 'assistant', content: t }); markActive(); }
    catch (e) { a.textContent = tx('Xin lỗi, có lỗi xảy ra.', 'Sorry, something went wrong.'); CHAT.pop(); }
  };
  ACT.tSug = (x, el) => send(el.textContent);
  $('#chatf').addEventListener('submit', e => { e.preventDefault(); const v = $('#chatin').value; $('#chatin').value = ''; send(v); });
  $('#chatin').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#chatf').requestSubmit(); } });
};

// ---------- Settings ----------
VIEWS.settings = () => {
  const p = PROFILES.list.find(x => x.id === PID);
  page(head(tx('Tài khoản', 'Account'), esc(S.name)) +
    '<form id="setf" class="card stackf"><label>' + tx('Tên hiển thị', 'Display name') + '<input name="name" value="' + esc(S.name) + '" maxlength="20"></label><label>' + tx('Ngôn ngữ giải thích', 'Explanation language') + '<select name="lang"><option value="vi"' + (LANG === 'vi' ? ' selected' : '') + '>Tiếng Việt</option><option value="en"' + (LANG === 'en' ? ' selected' : '') + '>English</option></select></label><label>' + tx('Ngày thi IELTS', 'IELTS exam date') + '<input type="date" name="exam" value="' + esc(S.examDate) + '"></label><label>' + tx('Trình độ hiện tại', 'Current level') + '<select name="lvl">' + LV.map(l => '<option' + (l === S.level ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label><label>' + tx('Mục tiêu ôn mỗi ngày (câu)', 'Daily review goal') + '<select name="goal">' + [10, 15, 20, 30].map(n => '<option' + (n === S.goal ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label><label class="chk"><input type="checkbox" name="fx"' + (S.fx !== false ? ' checked' : '') + '><span>' + tx('Hiệu ứng tuyết rơi & đèn nháy (theme Giáng sinh)', 'Snow & fairy-light effects (Christmas theme)') + '</span></label><label>' + tx('Mã PIN mới (để trống nếu giữ nguyên, gõ 0000 để bỏ PIN)', 'New PIN (blank = keep, 0000 = remove)') + '<input name="pin" inputmode="numeric" maxlength="4" pattern="[0-9]{4}"></label><button class="btn">' + tx('Lưu', 'Save') + '</button></form>' +
    '<section class="card"><h2>' + tx('Dữ liệu', 'Data') + '</h2><p class="muted small">' + (Store.mode === 'cloud' ? tx('Đang lưu riêng tư trong tài khoản Claude – mở trên máy tính hay điện thoại đều thấy tiến độ.', 'Saved privately in your Claude account – syncs across your devices.') : tx('Đang lưu trên trình duyệt này. Hãy sao lưu thường xuyên.', 'Saved in this browser only. Back up regularly.')) + '</p><div class="row"><button class="btn ghost sm" data-act="exportData">' + tx('Sao chép bản sao lưu', 'Copy backup') + '</button><button class="btn ghost sm" data-act="importData">' + tx('Khôi phục từ bản sao lưu', 'Restore backup') + '</button></div></section>' +
    '<section class="card"><div class="row"><button class="btn alt" data-act="switchP">' + tx('Đổi người học', 'Switch learner') + '</button><button class="btn ghost bad" data-act="delP">' + tx('Xoá tài khoản này', 'Delete this account') + '</button></div></section>');
  $('#setf').addEventListener('submit', e => {
    e.preventDefault(); const d = new FormData(e.target);
    const nm = String(d.get('name')).trim() || S.name; S.name = nm; p.name = nm;
    LANG = d.get('lang'); S.lang = LANG; S.examDate = d.get('exam') || ''; S.level = d.get('lvl'); S.goal = +d.get('goal'); S.fx = d.get('fx') === 'on'; applySkin();
    const pin = String(d.get('pin') || ''); if (/^\d{4}$/.test(pin)) p.pin = pin === '0000' ? '' : hashStr('cozy' + pin);
    Store.set('profiles', PROFILES); save(); toast(tx('Đã lưu.', 'Saved.')); rerender();
  });
};
ACT.switchP = () => { Store.local('last', ''); go('profiles'); };
ACT.delP = () => modal('<div class="center"><p>' + tx('Xoá vĩnh viễn tài khoản "' + esc(S.name) + '" cùng toàn bộ tiến độ, tem và đồ đã mua? Không thể hoàn tác.', 'Permanently delete "' + esc(S.name) + '" with all progress, stamps and items? This cannot be undone.') + '</p><button class="btn bad" data-act="delP2">' + tx('Xoá vĩnh viễn', 'Delete permanently') + '</button><button class="btn ghost" data-act="closeModal">' + tx('Huỷ', 'Cancel') + '</button></div>');
ACT.delP2 = async () => { const id = PID; PROFILES.list = PROFILES.list.filter(x => x.id !== id); Store.set('profiles', PROFILES); await Store.del('p_' + id); await Store.del('lib_' + id); S = null; PID = null; Store.local('last', ''); go('profiles'); };
ACT.exportData = async () => { const data = JSON.stringify({ app: 'cozy-ielts', v: 1, state: S, lib: LIB }); try { await navigator.clipboard.writeText(data); toast(tx('Đã sao chép – dán vào ghi chú để cất giữ.', 'Copied – paste it somewhere safe.')); } catch (e) { modal('<p>' + tx('Sao chép đoạn này:', 'Copy this:') + '</p><textarea class="essay short" readonly>' + esc(data) + '</textarea><button class="btn" data-act="closeModal">OK</button>'); } };
ACT.importData = () => { modal('<form id="impf"><p>' + tx('Dán bản sao lưu vào đây (sẽ ghi đè tiến độ của tài khoản hiện tại):', 'Paste a backup (overwrites this account):') + '</p><textarea id="impin" class="essay short"></textarea><button class="btn">' + tx('Khôi phục', 'Restore') + '</button></form>'); $('#impf').addEventListener('submit', e => { e.preventDefault(); try { const d = JSON.parse($('#impin').value); if (d.app !== 'cozy-ielts' || !d.state) throw 0; const nm = S.name; S = Object.assign(newState(nm), d.state, { name: nm }); LIB = d.lib && Array.isArray(d.lib.items) ? d.lib : { items: [] }; save(); saveLib(); closeModal(); applySkin(); go('home'); toast(tx('Đã khôi phục.', 'Restored.')); } catch (err) { toast(tx('Bản sao lưu không hợp lệ.', 'Invalid backup.')); } }); };

// ---------- Boot ----------
(async () => {
  page('<div class="loading">' + mascot(90, { hat: 'none', acc: 'blush' }) + '<p class="pulse">' + tx('Đang mở Cozy IELTS…', 'Opening Cozy IELTS…') + '</p></div>');
  await Promise.all([Store.init(), AI.init(), Voice.init()]);
  PROFILES = (await Store.get('profiles')) || { list: [] }; if (!Array.isArray(PROFILES.list)) PROFILES = { list: [] };
  const last = Store.local('last'); const lp = PROFILES.list.find(x => x.id === last);
  if (lp && !lp.pin) enterProfile(lp.id); else go('profiles');
})();
