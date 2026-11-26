// ===== Shell, router, profiles, home, learn, quiz engine, review =====
const ACT = {}, VIEWS = {};
let CLEAN = [], CUR = { view: 'profiles', args: [] }, QZ = null;
const onLeave = fn => CLEAN.push(fn);
const page = html => { $('#main').innerHTML = html; };
function go(view, ...args) {
  CLEAN.forEach(f => { try { f(); } catch (e) {} }); CLEAN = []; QZ = null; Voice.stop();
  CUR = { view, args }; try { window.scrollTo(0, 0); } catch (e) {}
  closeModal(); VIEWS[view](...args); paintNav();
}
const rerender = () => go(CUR.view, ...CUR.args);
document.addEventListener('click', e => {
  if (e.target.id === 'modal') { closeModal(); return; }
  const el = e.target.closest('[data-act]'); if (!el) return;
  const f = ACT[el.dataset.act]; if (f) { e.preventDefault(); f(el.dataset.arg, el, e); }
});
ACT.nav = v => go(v);
ACT.closeModal = closeModal;
ACT.lang = () => { LANG = LANG === 'vi' ? 'en' : 'vi'; if (S) { S.lang = LANG; save(); } document.documentElement.lang = LANG; $('#langBtn').textContent = LANG.toUpperCase(); rerender(); };
ACT.say = (t) => Voice.say(t);
ACT.more = () => modal('<div class="sheet">' + NAV.slice(4).map(n => (NAVSEC[n[0]] ? '<p class="navsec">' + tx(NAVSEC[n[0]][0], NAVSEC[n[0]][1]) + '</p>' : '') + '<button class="sheetbtn" data-act="nav" data-arg="' + n[0] + '">' + ICON[n[1]] + '<span>' + tx(n[2], n[3]) + '</span></button>').join('') + '</div>');

const NAV = [['home', 'home', 'Trang chủ', 'Home'], ['learn', 'learn', 'Học', 'Learn'], ['review', 'review', 'Ôn tập', 'Review'], ['tests', 'test', 'Luyện thi', 'Practice tests'], ['explore', 'explore', 'Khám phá', 'Explore'], ['games', 'game', 'Trò chơi', 'Games'], ['stamps', 'stamp', 'Album tem', 'Stamp album'], ['shop', 'shop', 'Cửa hàng', 'Shop'], ['tutor', 'chat', 'Gia sư AI', 'AI tutor'], ['settings', 'user', 'Tài khoản', 'Account']];
const NAVSEC = { explore: ['Mở rộng', 'More to explore'], stamps: ['Phần thưởng', 'Rewards'], tutor: ['Hỗ trợ', 'Help'] };
function paintNav() {
  const v = CUR.view, grp = { topic: 'learn', sub: 'learn', unit: 'learn', reading: 'tests', listening: 'tests', writing: 'tests', speaking: 'tests', mock: 'tests', placement: 'tests', litItem: 'lit', swap: 'learn', adjbank: 'learn', mine: 'learn', dict: 'learn', idioms: 'learn', flash: 'games', match: 'games', cross: 'games', scramble: 'games' }[v] || v;
  $('#side').innerHTML = NAV.map(n => (NAVSEC[n[0]] ? '<p class="navsec">' + tx(NAVSEC[n[0]][0], NAVSEC[n[0]][1]) + '</p>' : '') + '<button class="navb' + (grp === n[0] ? ' on' : '') + '" data-act="nav" data-arg="' + n[0] + '">' + ICON[n[1]] + '<span>' + tx(n[2], n[3]) + '</span>' + (n[0] === 'review' && S ? dueBadge() : '') + '</button>').join('');
  $('#bottom').innerHTML = NAV.slice(0, 4).map(n => '<button class="navb' + (grp === n[0] ? ' on' : '') + '" data-act="nav" data-arg="' + n[0] + '">' + ICON[n[1]] + '<span>' + tx(n[2], n[3]) + '</span>' + (n[0] === 'review' && S ? dueBadge() : '') + '</button>').join('') + '<button class="navb' + (NAV.slice(4).some(n => n[0] === grp) ? ' on' : '') + '" data-act="more">' + ICON.more + '<span>' + tx('Thêm', 'More') + '</span></button>';
  paintWallet();
  if (S) { const p = PROFILES.list.find(x => x.id === PID); $('#pchip').innerHTML = '<span class="pav sm" style="--pc:' + esc(p ? p.color : '#f4a3b8') + '">' + esc((S.name || '?')[0].toUpperCase()) + '</span>'; }
  $('#langBtn').textContent = LANG.toUpperCase();
}
const dueBadge = () => { const n = dueKeys().length; return n ? '<em class="nb">' + (n > 99 ? '99+' : n) + '</em>' : ''; };
function applySkin() { document.body.dataset.skin = S ? S.eq.skin : 'dau'; document.body.dataset.pat = S ? S.eq.pat : 'none'; document.documentElement.lang = LANG; fxUpdate(); }
const head = (title, sub, backView, backArg) => '<div class="phead">' + (backView ? '<button class="iconbtn" data-act="' + (backArg != null ? 'goArg' : 'nav') + '" data-arg="' + esc(backArg != null ? backView + '|' + backArg : backView) + '" aria-label="back">' + ICON.back + '</button>' : '') + '<div><h1>' + title + '</h1>' + (sub ? '<p class="muted">' + sub + '</p>' : '') + '</div></div>';
ACT.goArg = a => { const [v, ...r] = a.split('|'); go(v, ...r); };

// ---------- Profiles ----------
const PCOLORS = ['#F4A3B8', '#9CC9F0', '#A8D5A2', '#C3B1EC', '#FFBE98', '#93DCCB', '#FFD66B'];
VIEWS.profiles = (mode) => {
  document.body.classList.add('noshell'); S = null; applySkin();
  const list = PROFILES.list;
  const form = '<form id="newp" class="card newp"><h2>' + tx('Tạo tài khoản mới', 'Create a new account') + '</h2><label>' + tx('Tên', 'Name') + '<input name="n" maxlength="20" required placeholder="' + tx('VD: Sơn', 'e.g. Son') + '"></label><div class="swatches">' + PCOLORS.map((c, i) => '<label class="sw"><input type="radio" name="c" value="' + c + '"' + (i === list.length % PCOLORS.length ? ' checked' : '') + '><i style="background:' + c + '"></i></label>').join('') + '</div><label>' + tx('Mã PIN 4 số (không bắt buộc – để hai người không vào nhầm)', '4-digit PIN (optional – keeps accounts apart)') + '<input name="pin" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="••••"></label><button class="btn">' + tx('Tạo và bắt đầu', 'Create and start') + '</button></form>';
  page('<div class="pick"><div class="pick-head">' + mascot(110, { hat: 'none', acc: 'blush' }) + '<h1>Cozy IELTS</h1><p class="muted">' + tx('Hôm nay ai học nè?', 'Who is studying today?') + '</p></div>' +
    (list.length ? '<div class="pgrid">' + list.map(p => '<button class="pcard" data-act="openProfile" data-arg="' + esc(p.id) + '"><span class="pav" style="--pc:' + esc(p.color) + '">' + esc(p.name[0].toUpperCase()) + '</span><b>' + esc(p.name) + '</b><small class="muted">' + (p.pin ? tx('Có mã PIN', 'PIN protected') : tx('Không khóa', 'No PIN')) + '</small></button>').join('') + (list.length < 6 && mode !== 'new' ? '<button class="pcard add" data-act="newProfile"><span class="pav plus">+</span><b>' + tx('Thêm người học', 'Add learner') + '</b></button>' : '') + '</div>' : '') +
    ((!list.length || mode === 'new') ? form : '') +
    '<p class="small muted center">' + (Store.mode === 'cloud' ? tx('Dữ liệu lưu riêng tư trong tài khoản Claude của bạn.', 'Data is saved privately in your Claude account.') : tx('Dữ liệu đang lưu trên trình duyệt này.', 'Data is saved in this browser.')) + '</p></div>');
  const f = $('#newp');
  if (f) f.addEventListener('submit', e => {
    e.preventDefault(); const d = new FormData(f); const name = String(d.get('n')).trim(); if (!name) return;
    const pin = String(d.get('pin') || '').trim();
    const p = { id: uid(), name, color: d.get('c') || PCOLORS[0], pin: pin ? hashStr('cozy' + pin) : '' };
    PROFILES.list.push(p); Store.set('profiles', PROFILES); enterProfile(p.id, true);
  });
};
ACT.newProfile = () => go('profiles', 'new');
ACT.openProfile = id => {
  const p = PROFILES.list.find(x => x.id === id); if (!p) return;
  if (!p.pin) return enterProfile(id);
  modal('<form id="pinf" class="center"><h2>' + esc(p.name) + '</h2><p class="muted">' + tx('Nhập mã PIN', 'Enter PIN') + '</p><input id="pinin" class="pinin" inputmode="numeric" maxlength="4" autocomplete="off"><p id="pinerr" class="bad small"></p><button class="btn">' + tx('Vào học', 'Enter') + '</button></form>');
  $('#pinin').focus();
  $('#pinf').addEventListener('submit', e => { e.preventDefault(); if (hashStr('cozy' + $('#pinin').value) === p.pin) { closeModal(); enterProfile(id); } else $('#pinerr').textContent = tx('Sai mã PIN rồi.', 'Wrong PIN.'); });
};
async function enterProfile(id, isNew) {
  const p = PROFILES.list.find(x => x.id === id); PID = id;
  page('<div class="loading">' + mascot(90) + '<p>' + tx('Đang mở góc học của ', 'Opening the study corner of ') + esc(p.name) + '…</p></div>');
  const got = isNew ? null : await Store.get('p_' + id);
  const base = newState(p.name);
  S = got ? Object.assign(base, got, { eq: Object.assign(base.eq, got.eq || {}), bh: Object.assign(base.bh, got.bh || {}), streak: Object.assign(base.streak, got.streak || {}) }) : base;
  S.name = p.name;
  LIB = (isNew ? null : await Store.get('lib_' + id)) || { items: [] };
  LANG = S.lang || 'vi'; applySkin(); document.body.classList.remove('noshell');
  Store.local('last', id); if (isNew) save();
  go('home'); setTimeout(checkCup, 1500);
  if (isNew) setTimeout(() => modal('<div class="center">' + mascot(100) + '<h2>' + tx('Chào ', 'Hi ') + esc(S.name) + '!</h2><p>' + tx('Bắt đầu bằng bài kiểm tra đầu vào để mình biết trình độ của bạn và gợi ý bài học phù hợp nhé.', 'Start with the placement test so the app can suggest the right lessons.') + '</p><button class="btn" data-act="nav" data-arg="placement">' + tx('Làm bài kiểm tra đầu vào', 'Take the placement test') + '</button><button class="btn ghost" data-act="closeModal">' + tx('Để sau', 'Later') + '</button></div>'), 300);
}

// ---------- Home ----------
VIEWS.home = () => {
  const due = dueKeys().length, ob = overall();
  const dleft = S.examDate ? daysBetween(today(), S.examDate) : null;
  const nextU = C.G.find(u => u.lvl === S.level && !((S.gram[u.id] || {}).best >= 80)) || C.G.find(u => !((S.gram[u.id] || {}).best >= 80));
  const nextS = allSubs().find(x => !x.ai && x.s.lvl === S.level && !S.stamps['t:' + x.key]) || allSubs().find(x => !S.stamps['t:' + x.key]);
  const stamps = Object.entries(S.stamps).sort((a, b) => (b[1].d > a[1].d ? 1 : -1)).slice(0, 4);
  const sk = [['L', 'Listening'], ['R', 'Reading'], ['W', 'Writing'], ['S', 'Speaking']];
  page('<section class="hero card"><div class="hero-t"><p class="eyebrow">' + tx('Chào ', 'Hello ') + esc(S.name) + '</p><h1>' + (due ? tx('Hôm nay có ' + due + ' mục cần ôn', due + ' items to review today') : tx('Bạn đã ôn xong hôm nay!', 'All caught up for today!')) + '</h1><p class="muted">' + tx('Trình độ hiện tại: ', 'Current level: ') + lvBadge(S.level) + (dleft != null ? ' · ' + (dleft >= 0 ? tx('còn ' + dleft + ' ngày đến kỳ thi', dleft + ' days to the exam') : tx('kỳ thi đã qua', 'exam date passed')) : '') + '</p><div class="row">' + (due ? '<button class="btn" data-act="nav" data-arg="review">' + ICON.review + tx('Ôn ngay', 'Review now') + '</button>' : '<button class="btn" data-act="nav" data-arg="learn">' + ICON.learn + tx('Học bài mới', 'Learn something new') + '</button>') + (!S.placement ? '<button class="btn ghost" data-act="nav" data-arg="placement">' + tx('Kiểm tra đầu vào', 'Placement test') + '</button>' : '') + '</div></div><div class="hero-m">' + mascot(150) + '</div></section>' +
    '<section class="grid3"><div class="card stat">' + ICON.fire + '<b>' + S.streak.n + '</b><span>' + tx('ngày liên tiếp', 'day streak') + '</span></div><div class="card stat">' + ICON.coin + '<b>' + S.coins + '</b><span>' + tx('xu', 'coins') + '</span></div><div class="card stat">' + ICON.stamp + '<b>' + Object.keys(S.stamps).length + '</b><span>' + tx('tem đã sưu tầm', 'stamps') + '</span></div></section>' +
    '<section class="card"><div class="cardh"><h2>' + tx('Band ước tính', 'Estimated band') + '</h2><span class="bigband">' + (ob != null ? ob.toFixed(1) : '–') + '</span></div><div class="bands">' + sk.map(([k, n]) => { const b = band(k); return '<div class="bandrow"><span>' + n + '</span>' + bar(b ? b / 9 * 100 : 0, 'k' + k) + '<b>' + (b != null ? b.toFixed(1) : '–') + '</b></div>'; }).join('') + '</div><p class="small muted">' + tx('Ước tính từ 3 bài gần nhất của mỗi kỹ năng – chỉ để tham khảo, không phải điểm chính thức.', 'Based on your last 3 results per skill – a guide, not an official score.') + '</p></section>' +
    '<section class="grid2">' + (nextU ? '<button class="card tile" data-act="goArg" data-arg="unit|' + nextU.id + '"><span class="eyebrow">' + tx('Ngữ pháp tiếp theo', 'Next grammar') + '</span><b>' + esc(pick(nextU.t)) + '</b>' + lvBadge(nextU.lvl) + '</button>' : '') + (nextS ? '<button class="card tile" data-act="goArg" data-arg="sub|' + esc(nextS.key) + '"><span class="eyebrow">' + tx('Chủ đề từ vựng gợi ý', 'Suggested vocabulary') + '</span><b>' + esc(pick(nextS.s.t)) + '</b>' + lvBadge(nextS.s.lvl) + '</button>' : '') +
    '<button class="card tile" data-act="nav" data-arg="tests"><span class="eyebrow">' + tx('Luyện đề', 'Practice tests') + '</span><b>' + tx('IELTS mock test & 4 kỹ năng', 'IELTS mocks & 4 skills') + '</b></button><button class="card tile" data-act="nav" data-arg="games"><span class="eyebrow">' + tx('Thư giãn mà vẫn học', 'Learn while playing') + '</span><b>' + tx('Flashcard · Nối từ · Ô chữ', 'Flashcards · Match · Crossword') + '</b></button></section>' +
    (stamps.length ? '<section class="card"><div class="cardh"><h2>' + tx('Tem mới nhất', 'Latest stamps') + '</h2><button class="link" data-act="nav" data-arg="stamps">' + tx('Xem album', 'Open album') + '</button></div><div class="stamprow">' + stamps.map(([k, v]) => '<div class="stampmini">' + stampSVG(v.label, v.icon, v.d, v.s, true) + '</div>').join('') + '</div></section>' : '') +
    (S.hist.length ? '<section class="card"><h2>' + tx('Hoạt động gần đây', 'Recent activity') + '</h2><ul class="hist">' + S.hist.slice(0, 6).map(h => '<li><span class="muted">' + esc(h.d.slice(5)) + '</span><span>' + esc(h.t) + '</span><b>' + esc(h.s) + '</b></li>').join('') + '</ul></section>' : ''));
};

// ---------- Learn ----------
VIEWS.learn = (tab = 'vocab') => {
  const tabs = [['vocab', 'Từ vựng chủ đề', 'Topic vocabulary'], ['dict', 'Từ điển A1–C2', 'A1–C2 word lists'], ['idioms', 'Idioms', 'Idioms'], ['grammar', 'Ngữ pháp', 'Grammar'], ['swap', 'Đổi từ & tính từ', 'Word swaps & adjectives'], ['mine', 'Kho của tôi (tự thêm)', 'My library'], ['para', 'Cấu trúc tương đương', 'Paraphrasing'], ['ai', 'Tạo bài bằng AI', 'Make with AI']];
  if (tab === 'dict') return go('dict');
  if (tab === 'idioms') return go('idioms');
  if (tab === 'swap') return go('swap');
  if (tab === 'mine') return go('mine');
  let body = '';
  if (tab === 'vocab') {
    const subs = allSubs();
    const SEC = [[tx('IELTS theo chủ đề', 'IELTS topics'), ['daily', 'education', 'environment', 'technology', 'health', 'work', 'society', 'culture', 'travel']], [tx('Học thuật & chuyên ngành', 'Academic & specialised'), ['science', 'academic', 'bioeco', 'sat']], [tx('Khám phá Việt Nam & thế giới', 'Explore Vietnam & the world'), ['wonders', 'vnnature', 'vnhistory']]];
    const known = SEC.flatMap(x => x[1]); SEC[0][1] = SEC[0][1].concat(C.T.map(t => t.id).filter(id => !known.includes(id)));
    const tile = tp => { const my = subs.filter(x => x.tp.id === tp.id); const got = my.filter(x => S.stamps['t:' + x.key]).length; return '<button class="card ttile" data-act="goArg" data-arg="topic|' + tp.id + '"><svg viewBox="0 0 48 48" class="tart" fill="none" stroke="' + STAMP_INK[tp.icon] + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ART[tp.icon] + '</svg><b>' + esc(pick(tp.t)) + '</b><span class="muted small">' + my.length + tx(' chủ đề nhỏ · ', ' subtopics · ') + got + tx(' tem', ' stamps') + '</span>' + bar(got / my.length * 100) + '</button>'; };
    body = SEC.map(sec => { const tps = sec[1].map(id => C.T.find(t => t.id === id)).filter(Boolean); return tps.length ? '<h2 class="sech">' + sec[0] + '</h2><div class="tgrid">' + tps.map(tile).join('') + '</div>' : ''; }).join('') + (subs.some(x => x.ai) ? '<h2 class="sech">' + tx('Của tôi', 'Mine') + '</h2>' : '') + '<div class="tgrid">' + [].map(tp => { const my = subs.filter(x => x.tp.id === tp.id); const got = my.filter(x => S.stamps['t:' + x.key]).length; return '<button class="card ttile" data-act="goArg" data-arg="topic|' + tp.id + '"><svg viewBox="0 0 48 48" class="tart" fill="none" stroke="' + STAMP_INK[tp.icon] + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ART[tp.icon] + '</svg><b>' + esc(pick(tp.t)) + '</b><span class="muted small">' + my.length + tx(' chủ đề nhỏ · ', ' subtopics · ') + got + tx(' tem', ' stamps') + '</span>' + bar(got / my.length * 100) + '</button>'; }).join('') +
      (subs.some(x => x.ai) ? '<button class="card ttile" data-act="goArg" data-arg="topic|ai"><svg viewBox="0 0 48 48" class="tart" fill="none" stroke="' + STAMP_INK.star + '" stroke-width="2">' + ART.star + '</svg><b>' + esc(pick(AI_TOPIC.t)) + '</b><span class="muted small">' + subs.filter(x => x.ai).length + tx(' bài', ' lessons') + '</span></button>' : '') + '</div>';
  } else if (tab === 'grammar') {
    body = LV.map(l => '<section class="card"><div class="cardh"><h2>' + lvBadge(l) + ' ' + tx('Ngữ pháp cấp độ ', 'Grammar level ') + l + '</h2><button class="btn sm' + (S.stamps['g:' + l] ? ' ghost' : '') + '" data-act="gramLevel" data-arg="' + l + '">' + ICON.stamp + tx('Kiểm tra lấy tem', 'Stamp test') + '</button></div><div class="ulist">' + C.G.filter(u => u.lvl === l).map(u => { const b = (S.gram[u.id] || {}).best; return '<button class="urow" data-act="goArg" data-arg="unit|' + u.id + '"><span>' + esc(pick(u.t)) + '</span><span class="muted small">' + esc(u.f.slice(0, 60)) + (u.f.length > 60 ? '…' : '') + '</span>' + (b != null ? '<b class="' + (b >= 80 ? 'ok' : '') + '">' + b + '%</b>' : '<b class="muted">–</b>') + '</button>'; }).join('') + '</div></section>').join('');
  } else if (tab === 'para') {
    body = '<section class="card"><div class="cardh"><h2>' + tx('Ngân hàng diễn đạt tương đương', 'Paraphrase bank') + '</h2><button class="btn sm" data-act="paraQuiz">' + tx('Luyện tập', 'Practise') + '</button></div><p class="muted">' + tx('Paraphrase là kỹ năng then chốt cho mở bài Writing và mọi dạng Reading/Listening. Học thuộc cặp này và tập tự viết lại.', 'Paraphrasing is key for Writing intros and for spotting answers in Reading/Listening.') + '</p><div class="paras">' + C.P.map(p => '<div class="para"><span>' + esc(p[0]) + '</span><span class="arrow">→</span><b>' + esc(p[1]) + '</b></div>').join('') + '</div></section>' +
      '<section class="card"><h2>' + tx('Cấu trúc tương đương theo bài ngữ pháp', 'Equivalent structures by grammar unit') + '</h2><div class="paras">' + C.G.flatMap(u => u.eq.map(e => '<div class="para"><span class="muted small">' + esc(pick(u.t)) + '</span><b>' + esc(e) + '</b></div>')).join('') + '</div></section>';
  } else {
    body = '<section class="card"><h2>' + tx('Tạo bài học từ vựng theo chủ đề bất kỳ', 'Create a vocabulary lesson on any topic') + '</h2><p class="muted">' + tx('Gõ chủ đề lớn hay chuyên ngành hẹp – ví dụ "Sinh thái học linh trưởng", "Kinh tế tuần hoàn", "Phỏng vấn xin học bổng". AI sẽ soạn từ vựng, collocations, từ đồng nghĩa và idioms; bài được lưu vào album và có tem riêng.', 'Type a broad topic or a narrow field. AI writes the words, collocations, synonyms and idioms; the lesson is saved and earns its own stamp.') + '</p>' + (AI.ok() ? '<form id="aiform" class="stackf"><label>' + tx('Chủ đề', 'Topic') + '<input name="t" required maxlength="80" placeholder="' + tx('VD: Bảo tồn linh trưởng', 'e.g. Primate conservation') + '"></label><label>' + tx('Cấp độ', 'Level') + '<select name="l">' + LV.map(l => '<option' + (l === S.level ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label><label>' + tx('Số từ', 'Words') + '<select name="n"><option>8</option><option selected>10</option><option>12</option></select></label><button class="btn">' + ICON.spark + tx('Soạn bài', 'Create lesson') + '</button></form><div id="aiout"></div>' : noAI()) + '</section>';
  }
  page(head(tx('Học', 'Learn'), tx('Từ dễ đến khó, từ chủ đề lớn đến chuyên ngành', 'From easy to hard, broad to specialised')) + learnTabs(tab) + body);
  const f = $('#aiform');
  if (f) f.addEventListener('submit', async e => {
    e.preventDefault(); const d = new FormData(f); const out = $('#aiout'); const btn = f.querySelector('button'); btn.disabled = true;
    out.innerHTML = '<p class="muted pulse">' + tx('AI đang soạn bài… (khoảng 20–40 giây)', 'Writing your lesson… (20–40 s)') + '</p>';
    try {
      const r = await AI.json('You are an expert IELTS vocabulary teacher for Vietnamese learners. Create a vocabulary lesson on the topic: "' + d.get('t') + '" at CEFR level ' + d.get('l') + '. If the topic is a specialised field, choose the terminology a student or researcher in that field actually needs, plus words useful for IELTS. Give exactly ' + d.get('n') + ' items. Return JSON: {"title_vi":"Vietnamese title","title_en":"English title","words":[{"w":"word or phrase","pos":"n/v/adj/adv/phr v/phr","vi":"Vietnamese meaning","def":"short English definition","ex":"natural example sentence containing the exact word","col":"2 common collocations separated by /","syn":"1-2 synonyms separated by comma"}],"idioms":[{"i":"idiom","vi":"Vietnamese meaning","ex":"example"}]} with 2 idioms.', 'complex');
      if (!r || !Array.isArray(r.words) || r.words.length < 4) throw new Error('bad');
      const id = uid();
      const data = { id, lvl: d.get('l'), t: [r.title_vi || d.get('t'), r.title_en || d.get('t')], w: r.words.filter(x => x && x.w).map(x => [String(x.w), String(x.pos || ''), String(x.vi || ''), String(x.def || ''), String(x.ex || ''), String(x.col || ''), String(x.syn || '')]), i: (r.idioms || []).filter(x => x && x.i).map(x => [String(x.i), String(x.vi || ''), String(x.ex || '')]) };
      LIB.items.push({ id, type: 'vocab', created: today(), data }); saveLib();
      go('sub', 'ai/' + id);
    } catch (err) { out.innerHTML = '<p class="bad">' + tx('Chưa tạo được bài, thử lại nhé.', 'Could not create the lesson, try again.') + '</p>'; btn.disabled = false; }
  });
};
const noAI = () => '' ||  '<p class="note">' + tx('Tính năng AI chỉ hoạt động khi mở trang trong Claude và đã cho phép. Các bài có sẵn vẫn dùng bình thường.', 'AI features work when this page is opened in Claude with permission. Built-in lessons still work.') + '</p>';

VIEWS.topic = id => {
  const tp = id === 'ai' ? AI_TOPIC : C.T.find(x => x.id === id);
  const subs = allSubs().filter(x => x.tp.id === id);
  page(head(esc(pick(tp.t)), tx('Chọn chủ đề nhỏ – đạt ≥ 80% bài kiểm tra để nhận tem', 'Pick a subtopic – score ≥ 80% on its test to earn the stamp'), 'learn') +
    '<div class="sgrid">' + subs.map(x => { const st = S.stamps['t:' + x.key]; const b = (S.topic[x.key] || {}).best; return '<button class="card stile' + (x.s.L ? ' ex' : '') + '" data-act="goArg" data-arg="sub|' + esc(x.key) + '">' + (x.s.L ? '<div class="exthumb">' + EXART(x.s.L.img) + (st ? '<span class="exst">' + stampSVG(pick(x.s.t), x.tp.icon, st.d, st.s, true) + '</span>' : '') + '</div>' : '<div class="stampmini">' + stampSVG(pick(x.s.t), x.tp.icon, st ? st.d : '', st ? st.s : 0, !!st) + '</div>') + '<div><b>' + esc(pick(x.s.t)) + '</b><p class="muted small">' + lvBadge(x.s.lvl) + ' ' + x.s.w.length + tx(' từ', ' words') + (b != null ? ' · ' + tx('cao nhất ', 'best ') + b + '%' : '') + '</p></div></button>'; }).join('') + '</div>');
};

VIEWS.sub = key => {
  const sub = subByKey(key); if (!sub) return go('learn');
  const ws = wordsOf(sub); const st = S.stamps['t:' + key];
  page(head(esc(pick(sub.s.t)), lvBadge(sub.s.lvl) + ' ' + esc(pick(sub.tp.t)), 'topic', sub.tp.id) +
    (sub.s.L ? lessonHTML(sub) : '') +
    '<div class="actions"><button class="btn" data-act="subQuiz" data-arg="' + esc(key) + '|practice">' + tx('Luyện tập', 'Practice') + '</button>' + (sub.s.L ? '<button class="btn alt" data-act="subKnow" data-arg="' + esc(key) + '">' + tx('Câu hỏi kiến thức', 'Knowledge quiz') + '</button>' : '') + '<button class="btn alt" data-act="subQuiz" data-arg="' + esc(key) + '|rush">Rush</button><button class="btn gold" data-act="subQuiz" data-arg="' + esc(key) + '|test">' + ICON.stamp + (st ? tx('Thi lại (đã có tem)', 'Retake (stamp earned)') : tx('Kiểm tra lấy tem', 'Stamp test')) + '</button><button class="btn ghost" data-act="goArg" data-arg="flash|' + esc(key) + '">Flashcard</button><button class="btn ghost" data-act="goArg" data-arg="match|' + esc(key) + '">' + tx('Nối từ', 'Match') + '</button><button class="btn ghost" data-act="goArg" data-arg="cross|' + esc(key) + '">' + tx('Ô chữ', 'Crossword') + '</button></div>' +
    '<div class="words">' + ws.map(w => { const it = S.srs[w.key]; return '<article class="card word"><div class="wh"><h3>' + esc(w.w) + ' <small class="muted">' + esc(w.pos) + '</small></h3><button class="iconbtn" data-act="say" data-arg="' + esc(w.w + '. ' + w.ex) + '" aria-label="listen">' + ICON.speak + '</button></div><p class="vi">' + esc(w.vi) + '</p><p class="muted small">' + esc(w.def) + '</p><p class="ex">' + esc(w.ex) + '</p>' + (w.col ? '<p class="small"><b class="red">Collocations:</b> ' + esc(w.col) + '</p>' : '') + (w.syn ? '<p class="small"><b>Synonyms:</b> ' + esc(w.syn) + '</p>' : '') + (it ? '<span class="srsdot b' + it.b + '" title="' + tx('Mức nhớ ', 'Memory level ') + it.b + '/7"></span>' : '') + '</article>'; }).join('') + '</div>' +
    (sub.s.i && sub.s.i.length ? '<section class="card"><h2>Idioms</h2>' + sub.s.i.map(i => '<div class="idiom"><b>' + esc(i[0]) + '</b><span>' + esc(i[1]) + '</span><em>' + esc(i[2]) + '</em></div>').join('') + '</section>' : '') +
    (sub.ai ? '<p class="center"><button class="link bad" data-act="delAI" data-arg="' + esc(key.slice(3)) + '">' + tx('Xoá bài này', 'Delete this lesson') + '</button></p>' : ''));
};
ACT.delAI = id => { modal('<div class="center"><p>' + tx('Xoá bài học này?', 'Delete this lesson?') + '</p><button class="btn bad" data-act="delAI2" data-arg="' + esc(id) + '">' + tx('Xoá', 'Delete') + '</button><button class="btn ghost" data-act="closeModal">' + tx('Huỷ', 'Cancel') + '</button></div>'); };
ACT.delAI2 = id => { LIB.items = LIB.items.filter(x => x.id !== id); saveLib(); go('learn', 'vocab'); };
ACT.subQuiz = a => {
  const [key, m] = a.split('|'); const sub = subByKey(key); const ws = wordsOf(sub);
  let pool = ws; if (pool.length < 5) pool = pool.concat(allSubs()[0].s.w.map(x => wordObj(allSubs()[0], x)));
  let qs = shuffle(ws).slice(0, sub.s.L ? 5 : 10).map(w => vocabQ(w, pool));
  if (sub.s.L) qs = shuffle(qs.concat(take(sub.s.L.q.map((_, i) => qFromKey('k:' + key + '|' + i)), 5)));
  runQuiz({ title: pick(sub.s.t), qs, mode: m === 'test' ? 'timed' : m, time: qs.length * 30, kind: 'vocab', back: () => go('sub', key),
    onFinish: r => { const t = S.topic[key] || (S.topic[key] = { best: 0, n: 0 }); t.n++; t.best = Math.max(t.best, r.pct); save(); if (m === 'test') earnStamp('t:' + key, r.pct, pick(sub.s.t), sub.tp.icon); } });
};

VIEWS.unit = id => {
  const u = C.G.find(x => x.id === id); if (!u) return go('learn', 'grammar');
  const b = (S.gram[id] || {}).best;
  const f = esc(u.f).replace(/\|/g, '<i class="sep">|</i>').replace(/\b(V\d?|S|O|N|V-ing|to V|had|would|will|be|have|has|were|that)\b/g, '<b class="red">$1</b>');
  page(head(esc(pick(u.t)), lvBadge(u.lvl) + (b != null ? ' · ' + tx('cao nhất ', 'best ') + b + '%' : ''), 'learn', 'grammar') +
    '<section class="card"><p class="eyebrow">' + tx('Công thức', 'Formula') + '</p><p class="formula">' + f + '</p><p>' + esc(pick(u.x)) + '</p></section>' +
    '<section class="grid2"><div class="card"><h2>' + tx('Ví dụ', 'Examples') + '</h2><ul class="exl">' + u.ex.map(e => '<li><button class="iconbtn sm" data-act="say" data-arg="' + esc(e) + '">' + ICON.speak + '</button>' + esc(e) + '</li>').join('') + '</ul></div><div class="card"><h2>' + tx('Cấu trúc tương đương', 'Equivalent structures') + '</h2><ul class="exl">' + u.eq.map(e => '<li>' + esc(e) + '</li>').join('') + '</ul></div></section>' +
    '<div class="actions"><button class="btn" data-act="unitQuiz" data-arg="' + id + '|practice">' + tx('Luyện tập', 'Practice') + '</button><button class="btn alt" data-act="unitQuiz" data-arg="' + id + '|rush">Rush</button><button class="btn ghost" data-act="unitQuiz" data-arg="' + id + '|timed">' + tx('Tính giờ', 'Timed') + '</button>' + (AI.ok() ? '<button class="btn ghost" data-act="unitAI" data-arg="' + id + '">' + ICON.spark + tx('Thêm 6 câu mới bằng AI', '6 more AI questions') + '</button>' : '') + '</div>');
};
ACT.unitQuiz = a => { const [id, m] = a.split('|'); const u = C.G.find(x => x.id === id); runQuiz({ title: pick(u.t), qs: shuffle(u.q.map((_, i) => gramQ(u, i))), mode: m, kind: 'grammar', back: () => go('unit', id), onFinish: r => { const g = S.gram[id] || (S.gram[id] = { best: 0 }); g.best = Math.max(g.best, r.pct); save(); } }); };
ACT.unitAI = async id => {
  const u = C.G.find(x => x.id === id); toast(tx('AI đang soạn câu hỏi…', 'Writing questions…'));
  try {
    const r = await AI.json('Write 6 new IELTS-style multiple-choice grammar questions (4 options each) testing this structure: "' + u.t[1] + '" (' + u.f + '), CEFR ' + u.lvl + '. Use varied, realistic contexts (education, environment, work, travel…). Return JSON {"q":[{"p":"sentence with ___ gap","o":["","","",""],"a":0,"e":"short explanation"}]}. ' + langLine());
    const qs = (r.q || []).filter(validMCQ).map((q, i) => ({ k: 'mcq', p: q.p, o: q.o, a: q.a, e: q.e, key: 'g:' + id + ':' + (i % u.q.length), keep: false, tag: 'AI' }));
    if (!qs.length) throw 0;
    runQuiz({ title: pick(u.t) + ' · AI', qs, mode: 'practice', kind: 'grammar', back: () => go('unit', id) });
  } catch (e) {}
};
const validMCQ = q => q && typeof q.p === 'string' && Array.isArray(q.o) && q.o.length >= 3 && Number.isInteger(q.a) && q.a >= 0 && q.a < q.o.length;
const validQ = q => q && typeof q.p === 'string' && (q.k === 'gap' ? (Array.isArray(q.a) ? q.a.length : typeof q.a === 'string') : validMCQ(q));
ACT.gramLevel = l => {
  const us = C.G.filter(u => u.lvl === l); const qs = take(us.flatMap(u => u.q.map((_, i) => gramQ(u, i))), 12);
  runQuiz({ title: tx('Kiểm tra ngữ pháp ', 'Grammar test ') + l, qs, mode: 'timed', time: 12 * 35, kind: 'grammar', back: () => go('learn', 'grammar'), onFinish: r => earnStamp('g:' + l, r.pct, 'Grammar ' + l, 'pen') });
};
ACT.paraQuiz = () => {
  const qs = take(C.P, 8).map(p => { const o = shuffle([p[1], ...take(C.P.filter(x => x !== p), 3).map(x => x[1])]); return { k: 'mcq', p: tx('Cách diễn đạt tương đương với: "', 'Equivalent of: "') + p[0] + '"', o, a: o.indexOf(p[1]), e: p[0] + ' → ' + p[1] }; });
  runQuiz({ title: tx('Cấu trúc tương đương', 'Paraphrasing'), qs, mode: 'practice', kind: 'para', back: () => go('learn', 'para') });
};

// ---------- Quiz engine ----------
const modeName = m => ({ practice: tx('Luyện tập', 'Practice'), rush: 'Rush', timed: tx('Tính giờ chuẩn', 'Standard timed') }[m] || m);
const accepted = q => (Array.isArray(q.a) ? q.a : [q.a]).concat(q.alt || []).map(norm);
const ctxBox = c => '<details class="ctx"><summary>' + tx('Xem lại đoạn văn: ', 'Passage: ') + esc(c.title || '') + '</summary><div class="ptext">' + esc(c.text).split(/\n+/).map(p => '<p>' + p + '</p>').join('') + '</div></details>';
function runQuiz(cfg) {
  const qs = cfg.qs.filter(Boolean); if (!qs.length) { toast(tx('Chưa có câu hỏi.', 'No questions yet.')); return; }
  const mode = cfg.mode || 'practice';
  let i = 0, combo = 0, bestCombo = 0, locked = false, done = false; const ans = [];
  let left = mode === 'rush' ? Math.max(30, qs.length * 8) : mode === 'timed' ? (cfg.time || qs.length * 45) : 0, tm = null;
  CLEAN.forEach(f => f()); CLEAN = [];
  if (left) { tm = setInterval(() => { left--; const el = $('#qtime'); if (el) { el.textContent = mmss(left); el.parentNode.classList.toggle('warn', left <= 15); } if (left <= 0) finish(); }, 1000); onLeave(() => clearInterval(tm)); }
  const mult = () => mode === 'rush' ? Math.min(5, 1 + Math.floor(combo / 3)) : 1;
  function render() {
    const q = qs[i];
    page('<div class="qwrap"><div class="qtop"><button class="iconbtn" data-act="quizQuit" aria-label="quit">' + ICON.x + '</button><div class="qmeta"><b>' + esc(cfg.title) + '</b><span class="muted small">' + (i + 1) + '/' + qs.length + ' · ' + modeName(mode) + (q.newCtx || q.tag === 'AI' ? ' · ' + tx('ngữ cảnh mới', 'new context') : '') + '</span></div>' + (left ? '<span class="timer">' + ICON.clock + '<b id="qtime">' + mmss(left) + '</b></span>' : '') + (mode === 'rush' ? '<span class="combo">x' + mult() + '</span>' : '') + '</div>' + bar(i / qs.length * 100) + (q.ctx ? ctxBox(q.ctx) : '') +
      '<div class="qcard"><p class="qp">' + esc(q.p) + '</p>' + (q.k === 'gap' ? '<form class="gapf" id="gapf"><input id="gapin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + tx('Gõ đáp án…', 'Type the answer…') + '"><button class="btn">' + tx('Trả lời', 'Answer') + '</button></form>' : '<div class="opts">' + q.o.map((o, j) => '<button class="opt" data-act="qAns" data-arg="' + j + '"><span class="ol">' + 'ABCDEF'[j] + '</span><span>' + esc(o) + '</span></button>').join('') + '</div>') + '<div id="fb"></div></div></div>');
    const gf = $('#gapf'); if (gf) { $('#gapin').focus(); gf.addEventListener('submit', e => { e.preventDefault(); answer($('#gapin').value); }); }
  }
  function answer(g) {
    if (locked || done) return; locked = true; const q = qs[i];
    const ok = q.k === 'gap' ? accepted(q).includes(norm(g)) : g === q.a;
    ans.push({ q, g, ok }); srsTouch(q.key, ok, q);
    combo = ok ? combo + 1 : 0; bestCombo = Math.max(bestCombo, combo);
    if (q.k !== 'gap') { $$('.opt').forEach((b, j) => { if (mode === 'practice' || mode === 'rush') { if (j === q.a) b.classList.add('ok'); if (j === g && !ok) b.classList.add('bad'); } else if (j === g) b.classList.add('sel'); b.disabled = true; }); }
    else { const inp = $('#gapin'); inp.disabled = true; if (mode !== 'timed') inp.classList.add(ok ? 'ok' : 'bad'); }
    if (mode === 'practice') {
      $('#fb').innerHTML = '<div class="fb ' + (ok ? 'ok' : 'bad') + '"><b>' + (ok ? tx('Chính xác!', 'Correct!') : tx('Chưa đúng.', 'Not quite.') + (q.k === 'gap' ? ' ' + tx('Đáp án: ', 'Answer: ') + esc((Array.isArray(q.a) ? q.a[0] : q.a)) : '')) + '</b><p>' + esc(q.e || '') + '</p><div id="why"></div><div class="row"><button class="btn" data-act="qNext">' + (i + 1 < qs.length ? tx('Câu tiếp', 'Next') : tx('Xem kết quả', 'See results')) + '</button>' + (AI.ok() ? '<button class="btn ghost sm" data-act="qWhy">' + ICON.spark + tx('Hỏi AI kỹ hơn', 'Ask AI') + '</button>' : '') + '</div></div>';
      const nb = $('[data-act=qNext]'); nb && nb.focus();
    } else setTimeout(next, mode === 'rush' ? 380 : 160);
  }
  function next() { if (done) return; i++; locked = false; if (i >= qs.length) finish(); else render(); }
  function finish() {
    if (done) return; done = true; clearInterval(tm);
    for (let j = ans.length; j < qs.length; j++) { ans.push({ q: qs[j], g: null, ok: false }); }
    const okN = ans.filter(a => a.ok).length, n = qs.length, pct = Math.round(okN / n * 100);
    const coins = okN * (mode === 'practice' ? 2 : 3) + (mode === 'rush' ? bestCombo * 2 : 0) + 10;
    reward(coins, pct === 100 && n >= 5 ? 1 : 0); markActive(); logHist(cfg.kind || 'quiz', cfg.title, pct + '%');
    if (pct === 100 && n >= 10) { S.stats = S.stats || { correct: 0, perfect: 0 }; S.stats.perfect++; save(); }
    const res = { pct, okN, n, ans }; if (cfg.onFinish) cfg.onFinish(res);
    const wrong = ans.filter(a => !a.ok);
    page('<div class="qwrap"><section class="card result"><div class="ring" style="--p:' + pct + '"><b>' + pct + '%</b></div><div><h1>' + (pct >= 90 ? tx('Xuất sắc!', 'Excellent!') : pct >= 70 ? tx('Làm tốt lắm!', 'Well done!') : pct >= 50 ? tx('Khá rồi, cố thêm chút!', 'Good effort!') : tx('Không sao, ôn lại là nhớ!', 'Keep going – review helps!')) + '</h1><p class="muted">' + okN + '/' + n + tx(' câu đúng', ' correct') + (mode === 'rush' ? ' · combo ' + bestCombo : '') + ' · +' + coins + tx(' xu', ' coins') + '</p><p class="small muted">' + tx('Câu sai đã được thêm vào lịch ôn tập ngày mai.', 'Wrong answers were added to tomorrow\'s review.') + '</p></div></section>' +
      (wrong.length ? '<section class="card"><h2>' + tx('Xem lại câu sai', 'Review mistakes') + '</h2>' + wrong.map(a => '<div class="wrongq"><p><b>' + esc(a.q.p) + '</b></p><p class="small"><span class="bad">' + tx('Bạn chọn: ', 'Your answer: ') + esc(a.g == null ? tx('(bỏ trống)', '(blank)') : a.q.k === 'gap' ? a.g : a.q.o[a.g]) + '</span> · <span class="ok">' + tx('Đúng: ', 'Correct: ') + esc(a.q.k === 'gap' ? (Array.isArray(a.q.a) ? a.q.a[0] : a.q.a) : a.q.o[a.q.a]) + '</span></p><p class="small muted">' + esc(a.q.e || '') + '</p></div>').join('') + '</section>' : '') +
      '<div class="actions">' + (wrong.length ? '<button class="btn" data-act="qRetry">' + tx('Làm lại câu sai', 'Retry mistakes') + '</button>' : '') + '<button class="btn ghost" data-act="qAgain">' + tx('Làm lại từ đầu', 'Start again') + '</button><button class="btn ghost" data-act="qBack">' + tx('Quay lại', 'Back') + '</button></div></div>');
    QZ = { retry: () => runQuiz(Object.assign({}, cfg, { qs: wrong.map(a => a.q), mode: 'practice', onFinish: null, title: cfg.title + ' · ' + tx('câu sai', 'mistakes') })), again: () => runQuiz(cfg), back: () => (cfg.back ? cfg.back() : go('home')) };
  }
  QZ = {
    answer, next, back: () => (cfg.back ? cfg.back() : go('home')),
    quit: () => { if (ans.length && !done) { modal('<div class="center"><p>' + tx('Dừng bài và xem kết quả phần đã làm?', 'Stop and see results so far?') + '</p><button class="btn" data-act="qStop">' + tx('Dừng & chấm', 'Stop & score') + '</button><button class="btn ghost" data-act="qLeave">' + tx('Thoát không lưu', 'Leave without saving') + '</button></div>'); } else QZ.back(); },
    stop: () => { closeModal(); qs.length = ans.length || 1; finish(); },
    why: async () => { const q = qs[i], a = ans[ans.length - 1], box = $('#why'); box.innerHTML = '<p class="muted pulse">…</p>';
      const p = 'You are a kind IELTS tutor for a Vietnamese learner at level ' + S.level + '. Question: ' + q.p + (q.o ? '\nOptions: ' + q.o.map((o, j) => 'ABCDEF'[j] + ') ' + o).join(' ') + '\nCorrect: ' + q.o[q.a] + '\nLearner chose: ' + (a.g == null ? 'nothing' : q.o[a.g]) : '\nCorrect: ' + q.a + '\nLearner wrote: ' + a.g) + (q.ctx ? '\nPassage: ' + q.ctx.text.slice(0, 2500) : '') + '\nExplain in at most 120 words why the correct answer is right' + (a.ok ? '' : ' and why the learner\'s choice is wrong') + ', then give one memory tip and one extra example. Plain text, no markdown. ' + langLine();
      try { await AI.text(p, t => { box.innerHTML = '<p class="aitext"></p>'; box.firstChild.textContent = t; }); } catch (e) { box.innerHTML = ''; } }
  };
  render();
}
ACT.qAns = j => QZ && QZ.answer && QZ.answer(+j);
ACT.qNext = () => QZ && QZ.next();
ACT.qWhy = () => QZ && QZ.why();
ACT.quizQuit = () => QZ && QZ.quit();
ACT.qStop = () => QZ && QZ.stop();
ACT.qLeave = () => { closeModal(); QZ && QZ.back(); };
ACT.qRetry = () => QZ && QZ.retry();
ACT.qAgain = () => QZ && QZ.again();
ACT.qBack = () => QZ && QZ.back();
document.addEventListener('keydown', e => {
  if (!QZ || !QZ.answer || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  const k = e.key.toUpperCase(); const j = 'ABCDEF'.indexOf(k);
  if (j >= 0 && $$('.opt')[j] && !$$('.opt')[j].disabled) QZ.answer(j);
  else if (e.key === 'Enter' && $('[data-act=qNext]')) QZ.next();
});

// ---------- Daily review ----------
VIEWS.review = () => {
  const due = dueKeys(); const kinds = { v: 0, g: 0, q: 0 }; due.forEach(k => kinds[k[0]] !== undefined && kinds[k[0]]++);
  const weak = Object.keys(S.srs).filter(k => S.srs[k].w > 0).sort((a, b) => S.srs[b].w - S.srs[a].w);
  const doneToday = S.daily.d === today();
  page(head(tx('Ôn tập hằng ngày', 'Daily review'), tx('Lặp lại ngắt quãng: câu sai quay lại sau 1 ngày, câu đúng giãn dần 2 → 4 → 7 → 15 → 30 ngày.', 'Spaced repetition: mistakes return tomorrow, correct items space out 2 → 4 → 7 → 15 → 30 days.')) +
    '<section class="card"><div class="grid3 mini"><div class="stat"><b>' + kinds.v + '</b><span>' + tx('từ vựng', 'words') + '</span></div><div class="stat"><b>' + kinds.g + '</b><span>' + tx('ngữ pháp', 'grammar') + '</span></div><div class="stat"><b>' + kinds.q + '</b><span>' + tx('câu đọc/nghe/đề', 'test items') + '</span></div></div>' +
    (doneToday ? '<p class="ok center">' + tx('Hôm nay bạn đã hoàn thành ôn tập. Có thể ôn thêm nếu muốn.', 'You finished today\'s review. Extra practice is welcome.') + '</p>' : '') +
    '<form id="revf" class="stackf"><fieldset class="seg"><legend>' + tx('Cách ôn', 'Review style') + '</legend><label><input type="radio" name="m" value="mix" checked><span><b>' + tx('Trộn', 'Mix') + '</b><small>' + tx('Câu sai nhiều lần sẽ được hỏi trong ngữ cảnh khác', 'Repeated mistakes come back in a new context') + '</small></span></label><label><input type="radio" name="m" value="same"><span><b>' + tx('Y chang câu cũ', 'Exact repeat') + '</b><small>' + tx('Làm lại đúng câu từng sai', 'Redo the exact question you missed') + '</small></span></label><label><input type="radio" name="m" value="new"><span><b>' + tx('Ngữ cảnh mới', 'New context') + '</b><small>' + (AI.ok() ? tx('AI viết câu mới dùng lại từ/cấu trúc đã học', 'AI writes fresh sentences with what you learned') : tx('Đổi dạng câu hỏi (bật AI để có câu hoàn toàn mới)', 'Changes the question type (AI gives brand-new sentences)')) + '</small></span></label></fieldset><label>' + tx('Số câu', 'Questions') + '<select name="n">' + [10, 15, 20, 30].map(n => '<option' + (n === S.goal ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label><button class="btn"' + (!due.length && !weak.length ? ' disabled' : '') + '>' + (due.length ? tx('Bắt đầu ôn ', 'Start review ') + '(' + Math.min(due.length, S.goal) + ')' : tx('Ôn thêm các mục hay sai', 'Practise weak items')) + '</button></form>' +
    (!due.length && !weak.length ? '<p class="muted center">' + tx('Chưa có gì để ôn. Hãy học một chủ đề hoặc làm bài kiểm tra – mọi câu bạn làm sẽ tự vào lịch ôn.', 'Nothing to review yet. Learn a topic or take a test – everything you answer is scheduled automatically.') + '</p>' : '') + '</section>');
  $('#revf').addEventListener('submit', async e => {
    e.preventDefault(); const d = new FormData(e.target); const m = d.get('m'); const n = +d.get('n'); S.goal = n; save();
    const keys = (due.length ? due : weak).slice(0, n); await ensureDictFor(keys);
    let qs = keys.map(k => { const it = S.srs[k]; const wantNew = m === 'new' || (m === 'mix' && it.w >= 2 && Math.random() < 0.6); return qFromKey(k, it, m === 'same' ? false : wantNew); }).filter(Boolean);
    if (m === 'new' && AI.ok()) {
      const items = keys.filter(k => k[0] === 'v' || k[0] === 'g').slice(0, 15).map(k => { if (k[0] === 'v') { const q = qFromKey(k, null, false); const [sk, w] = k.slice(2).split('|'); const sub = subByKey(sk); const wo = sub && wordsOf(sub).find(x => x.w === w); return wo ? { id: k, type: 'word', word: wo.w, meaning: wo.def, example: wo.ex } : null; } const u = C.G.find(x => x.id === k.split(':')[1]); return u ? { id: k, type: 'grammar', structure: u.t[1] + ': ' + u.f, example: u.ex[0] } : null; }).filter(Boolean);
      if (items.length) {
        page('<div class="loading">' + mascot(90) + '<p class="pulse">' + tx('AI đang viết câu hỏi trong ngữ cảnh mới…', 'AI is writing new-context questions…') + '</p></div>');
        try {
          const r = await AI.json('You are an IELTS tutor. For EACH item below write ONE new multiple-choice question (4 options) that tests the SAME word or grammar structure in a completely NEW context or topic, different from the example given. Level ' + S.level + '. For words, the gap must be filled by the target word (options are 4 different words/phrases). Return JSON {"questions":[{"id":"copy the item id","p":"question, use ______ for the gap","o":["","","",""],"a":0,"e":"short explanation"}]}. ' + langLine() + '\nItems: ' + JSON.stringify(items));
          const map = {}; (r.questions || []).filter(validMCQ).forEach(q => { map[q.id] = { k: 'mcq', p: q.p, o: q.o.slice(0, 4), a: q.a, e: q.e, key: q.id, tag: 'AI' }; });
          qs = qs.map(q => map[q.key] || q);
        } catch (err) {}
      }
    }
    runQuiz({ title: tx('Ôn tập hằng ngày', 'Daily review'), qs: shuffle(qs), mode: 'practice', kind: 'review', back: () => go('review'),
      onFinish: () => { if (S.daily.d !== today()) { S.daily = { d: today(), bonus: true }; reward(20, 0, tx('hoàn thành ôn tập', 'review done')); } } });
  });
};

// ---------- Level dictionary ----------
function dictPage(l, p, q) { const all = levelList(l); const qq = String(q || '').toLowerCase(); const list = qq ? all.filter(x => x.w.toLowerCase().includes(qq)) : all; return list.slice(p * 50, p * 50 + 50); }
const LGROUPS = [['g_vocab', 'Từ vựng', 'Vocabulary', [['vocab', 'Theo chủ đề', 'By topic'], ['dict', 'Từ điển A1–C2', 'A1–C2 lists'], ['idioms', 'Idioms', 'Idioms'], ['swap', 'Đổi từ & tính từ', 'Word swaps & adjectives']]], ['g_gram', 'Ngữ pháp', 'Grammar', [['grammar', 'Ngữ pháp A1–C2', 'Grammar A1–C2'], ['para', 'Cấu trúc tương đương', 'Paraphrasing']]], ['g_mine', 'Của tôi', 'Mine', [['mine', 'Kho tự thêm', 'My library'], ['ai', 'Tạo bài bằng AI', 'Make with AI']]]];
const learnTabs = cur => { const G = LGROUPS.find(g => g[3].some(t => t[0] === cur)) || LGROUPS[0];
  return '<div class="tabs">' + LGROUPS.map(g => '<button class="tab' + (g === G ? ' on' : '') + '" data-act="goArg" data-arg="learn|' + g[3][0][0] + '">' + tx(g[1], g[2]) + '</button>').join('') + '</div><div class="chips lvf subtabs">' + G[3].map(t => '<button class="chipb' + (t[0] === cur ? ' on' : '') + '" data-act="goArg" data-arg="learn|' + t[0] + '">' + tx(t[1], t[2]) + '</button>').join('') + '</div>'; };
VIEWS.dict = (l = 'B1', pg = '0', q = '') => {
  const all = levelList(l), qq = String(q || '').toLowerCase(); const list = qq ? all.filter(x => x.w.toLowerCase().includes(qq)) : all;
  const n = Math.max(1, Math.ceil(list.length / 50)), p = Math.min(+pg || 0, n - 1), items = list.slice(p * 50, p * 50 + 50);
  const counts = LV.map(x => levelList(x).length);
  page(head(tx('Học', 'Learn'), tx('Hơn 9.700 từ chia theo cấp độ A1–C2', '9,700+ words by CEFR level A1–C2')) + learnTabs('dict') +
    '<div class="chips lvf">' + LV.map((x, i) => '<button class="chipb' + (x === l ? ' on' : '') + '" data-act="goArg" data-arg="dict|' + x + '|0">' + x + ' <span class="muted">' + counts[i] + '</span></button>').join('') + '</div>' +
    '<section class="card"><form id="dsf" class="gapf"><input id="dsq" value="' + esc(q) + '" placeholder="' + tx('Tìm từ trong cấp ', 'Search level ') + l + '…" autocapitalize="off"><button class="btn">' + tx('Tìm', 'Search') + '</button></form>' +
    '<div class="row between dhead"><span class="muted small">' + tx('Trang ', 'Page ') + (p + 1) + '/' + n + ' · ' + list.length + tx(' từ', ' words') + ' · <span id="dmeant"></span></span><div class="row">' + (p > 0 ? '<button class="btn ghost sm" data-act="goArg" data-arg="dict|' + l + '|' + (p - 1) + '|' + esc(q) + '">‹</button>' : '') + (p < n - 1 ? '<button class="btn ghost sm" data-act="goArg" data-arg="dict|' + l + '|' + (p + 1) + '|' + esc(q) + '">›</button>' : '') + '</div></div>' +
    '<div class="actions">' + (AI.ok() ? '<button class="btn" id="dtrans">' + ICON.spark + tx('Dịch nghĩa trang này', 'Translate this page') + '</button>' : '') + '<button class="btn alt" data-act="dictQuiz" data-arg="' + l + '|' + p + '|' + esc(q) + '">' + tx('Kiểm tra trang này', 'Quiz this page') + '</button><button class="btn ghost" data-act="goArg" data-arg="flash|dict:' + l + ':' + p + ':' + esc(q) + '">Flashcard</button><button class="btn ghost" data-act="goArg" data-arg="match|dict:' + l + ':' + p + ':' + esc(q) + '">' + tx('Nối từ', 'Match') + '</button></div>' +
    '<div class="dlist" id="dlist">' + items.map(x => '<div class="drow" data-w="' + esc(x.w) + '"><button class="iconbtn sm" data-act="say" data-arg="' + esc(x.w) + '">' + ICON.speak + '</button><b>' + esc(x.w) + '</b><span class="muted small">' + esc(x.p) + '</span><span class="dvi"></span><span class="dex muted small"></span></div>').join('') + '</div></section>' +
    '<p class="small muted">' + tx('Danh sách từ: ', 'Word lists: ') + 'CEFR-J Wordlist v1.5 (Tono Laboratory, TUFS) · Octanove Vocabulary Profile C1/C2 (Octanove Labs, CC BY-SA 4.0). ' + tx('Nghĩa tiếng Việt do AI dịch và lưu lại cho lần sau.', 'Vietnamese meanings are AI-translated and saved.') + '</p>');
  $('#dsf').addEventListener('submit', e => { e.preventDefault(); go('dict', l, '0', $('#dsq').value.trim()); });
  const paint = () => { if (CUR.view !== 'dict') return; let c = 0; $$('#dlist .drow').forEach(r => { const m = DICT[l] && DICT[l][r.dataset.w]; if (m) { c++; r.querySelector('.dvi').textContent = m[0]; r.querySelector('.dex').textContent = m[1] || ''; } }); const dm = $('#dmeant'); if (dm) dm.textContent = c + '/' + items.length + tx(' từ đã có nghĩa', ' with meanings'); };
  Promise.all([...new Set(items.map(x => chunkOf(x.i)))].map(c => loadDict(l, c))).then(paint);
  const tb = $('#dtrans');
  if (tb) tb.addEventListener('click', async () => {
    const todo = items.filter(x => !(DICT[l] && DICT[l][x.w])); if (!todo.length) { toast(tx('Trang này đã có đủ nghĩa.', 'All meanings are already here.')); return; }
    tb.disabled = true; tb.classList.add('pulse');
    try {
      const r = await AI.json('Translate these English words (CEFR ' + l + ') for a Vietnamese learner. For each give the most common meaning for the given part of speech in Vietnamese (max 6 words) and one short natural English example sentence (max 12 words) using the word. Return JSON {"items":[{"w":"word exactly as given","vi":"","ex":""}]}.\nWords: ' + JSON.stringify(todo.map(x => [x.w, x.p])));
      DICT[l] = DICT[l] || {}; (r.items || []).forEach(it => { if (it && it.w && it.vi) DICT[l][String(it.w)] = [String(it.vi).slice(0, 60), String(it.ex || '').slice(0, 140)]; });
      [...new Set(items.map(x => chunkOf(x.i)))].forEach(c => saveDictChunk(l, c)); paint(); toast(tx('Đã dịch và lưu nghĩa.', 'Translated and saved.'));
    } catch (e) {}
    tb.disabled = false; tb.classList.remove('pulse');
  });
};
ACT.dictQuiz = a => {
  const [l, p, q] = a.split('|'); const ws = dictPage(l, +p, q).filter(x => DICT[l] && DICT[l][x.w]).map(x => dictWord(l, x.w));
  if (ws.length < 4) { toast(tx('Cần ít nhất 4 từ đã có nghĩa – bấm "Dịch nghĩa trang này" trước.', 'Need at least 4 words with meanings – translate first.')); return; }
  runQuiz({ title: tx('Từ điển ', 'Word list ') + l, qs: shuffle(ws).slice(0, 15).map(w => vocabQ(w, ws, Math.random() < .5 ? 'mean' : 'rev')), mode: 'practice', kind: 'vocab', back: () => go('dict', l, p, q) });
};

// ---------- Idioms ----------
VIEWS.idioms = (th) => {
  const I = window.IDIOMS || []; const T = I.find(x => x.id === th) || I[0];
  const total = I.reduce((a, x) => a + x.i.length, 0) + allSubs().reduce((a, x) => a + ((x.s.i || []).length), 0);
  page(head(tx('Học', 'Learn'), total + tx(' idioms (kho theo chủ đề + idioms trong từng bài từ vựng)', ' idioms (themed bank + idioms inside vocabulary topics)')) + learnTabs('idioms') +
    '<div class="chips lvf">' + I.map(x => '<button class="chipb' + (x === T ? ' on' : '') + '" data-act="goArg" data-arg="idioms|' + x.id + '">' + esc(pick(x.th)) + '</button>').join('') + '</div>' +
    '<div class="actions"><button class="btn" data-act="idiomQuiz" data-arg="' + T.id + '">' + tx('Luyện tập', 'Practice') + '</button><button class="btn ghost" data-act="goArg" data-arg="flash|idioms:' + T.id + '">Flashcard</button><button class="btn ghost" data-act="goArg" data-arg="match|idioms:' + T.id + '">' + tx('Nối nghĩa', 'Match') + '</button></div>' +
    '<section class="card">' + T.i.map((x, i) => { const it = S.srs['i:' + T.id + '|' + i]; return '<div class="idiom"><div class="row between"><b>' + esc(x[0]) + '</b><button class="iconbtn sm" data-act="say" data-arg="' + esc(x[0] + '. ' + x[2]) + '">' + ICON.speak + '</button></div><span class="vi">' + esc(x[1]) + '</span><em>' + esc(x[2]) + '</em>' + (it ? '<span class="small muted">' + tx('Mức nhớ ', 'Memory ') + it.b + '/7</span>' : '') + '</div>'; }).join('') + '</section>');
};
ACT.idiomQuiz = th => { const T = window.IDIOMS.find(x => x.id === th); runQuiz({ title: 'Idioms · ' + pick(T.th), qs: shuffle(T.i.map((_, i) => idiomQ(T, i, Math.random() < .4))), mode: 'practice', kind: 'idioms', back: () => go('idioms', th) }); };

// ---------- Explore (lessons with illustrations) ----------
const EXPLORE_IDS = ['wonders', 'vnnature', 'vnhistory'];
function lessonHTML(sub) {
  const L = sub.s.L; const ws = sub.s.w.map(w => w[0]).sort((a, b) => b.length - a.length);
  let en = esc(L.en); ws.forEach(w => { const re = new RegExp('\\b(' + esc(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w{0,3})\\b', 'i'); en = en.replace(re, '<b class="hl">$1</b>'); });
  return '<section class="card lesson"><figure class="exfig">' + EXART(L.img) + '<figcaption>' + esc(L.cap) + '</figcaption></figure><h2>' + tx('Bài giảng', 'Lesson') + '</h2><p class="lead">' + esc(L.intro) + '</p></section>' +
    '<section class="placecards">' + L.cards.map(c => '<article class="card place"><h3>' + esc(c[0]) + '</h3><p class="muted small">' + esc(c[1]) + '</p><p>' + esc(c[2]) + '</p><p class="ex small">' + esc(c[3]) + ' <button class="iconbtn sm" data-act="say" data-arg="' + esc(c[3]) + '" aria-label="listen">' + ICON.speak + '</button></p></article>').join('') + '</section>' +
    '<section class="card"><div class="cardh"><h2>' + tx('Bài đọc tiếng Anh', 'English reading') + '</h2><button class="btn ghost sm" data-act="say" data-arg="' + esc(L.en) + '">' + ICON.speak + tx('Nghe', 'Listen') + '</button></div><p class="enread">' + en + '</p><p class="small muted">' + tx('Từ in đậm có trong danh sách từ vựng bên dưới.', 'Bold words are in the word list below.') + '</p></section>' +
    '<section class="card dyk"><h2>' + ICON.spark + ' ' + tx('Bạn có biết?', 'Did you know?') + '</h2><ul>' + L.facts.map(f => '<li>' + esc(f) + '</li>').join('') + '</ul></section>';
}
ACT.subKnow = key => { const sub = subByKey(key); runQuiz({ title: pick(sub.s.t) + ' · ' + tx('kiến thức', 'knowledge'), qs: shuffle(sub.s.L.q.map((_, i) => qFromKey('k:' + key + '|' + i))), mode: 'practice', kind: 'knowledge', back: () => go('sub', key) }); };
VIEWS.explore = () => {
  const tps = EXPLORE_IDS.map(id => C.T.find(t => t.id === id)).filter(Boolean);
  const desc = { wonders: ['Kỳ quan, danh thắng và di sản văn hóa – thiên nhiên – phi vật thể trên khắp thế giới.', 'Wonders, landmarks and heritage around the world.'], vnnature: ['Địa hình, khí hậu, sông hồ, biển đảo, hang động, rừng và động vật quý hiếm của Việt Nam.', "Vietnam's landforms, climate, rivers, seas, caves, forests and wildlife."], vnhistory: ['Lịch sử, các triều đại, danh nhân, tôn giáo – tín ngưỡng và di tích từ Hà Nội, Huế đến Sài Gòn.', 'History, dynasties, great figures, beliefs and landmarks from Hanoi to Saigon.'] };
  page(head(tx('Khám phá', 'Explore'), tx('Học tiếng Anh qua kiến thức thế giới và Việt Nam – có bài giảng, tranh minh họa, "Bạn có biết?" và tem riêng', 'Learn English through world and Vietnamese knowledge')) +
    '<div class="exgrid">' + tps.map(tp => { const subs = allSubs().filter(x => x.tp.id === tp.id); const got = subs.filter(x => S.stamps['t:' + x.key]).length; return '<button class="card extile" data-act="goArg" data-arg="topic|' + tp.id + '">' + EXART(subs[0].s.L.img) + '<div class="extxt"><b>' + esc(pick(tp.t)) + '</b><p class="muted small">' + esc(pick(desc[tp.id])) + '</p><span class="small">' + subs.length + tx(' bài · ', ' lessons · ') + got + tx(' tem', ' stamps') + '</span>' + bar(got / subs.length * 100) + '</div></button>'; }).join('') + '</div>');
};
