// ===== Progress tracking, level monitoring & smart study path =====
ICON.progress = sv('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>');
NAV.splice(4, 0, ['progress', 'progress', 'Tiến độ', 'Progress']);
const LVN = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };
const bandToCefr = b => b == null ? null : b < 4 ? 'A2' : b < 5.5 ? 'B1' : b < 7 ? 'B2' : b < 8.5 ? 'C1' : 'C2';
const cefrOk = l => (l = String(l || '').slice(0, 2), LVN[l] != null ? l : null);
function lvlOfKey(key) {
  try {
    if (key.startsWith('v:') || key.startsWith('k:')) { const s = subByKey(key.slice(2).split('|')[0]); return s && cefrOk(s.s.lvl); }
    if (key.startsWith('g:')) { const u = C.G.find(x => x.id === key.split(':')[1]); return u && cefrOk(u.lvl); }
    if (key.startsWith('d:')) return cefrOk(key.slice(2, 4));
    if (key.startsWith('lq:') || key.startsWith('lv:')) { const it = (window.LIT || []).find(x => x.id === key.slice(3).split('|')[0]); return it && cefrOk(it.lvl); }
    if (key.startsWith('q:r:')) { const r = C.R.find(x => x.id === key.split(':')[2]); return r && cefrOk(r.lvl); }
    if (key.startsWith('q:l:')) { const r = C.L.find(x => x.id === key.split(':')[2]); return r && cefrOk(r.lvl); }
  } catch (e) {}
  return null;
}
const trk = () => { S.trk = S.trk || { days: {}, bands: {}, checks: [] }; return S.trk; };
function trkDay(d) { const T = trk(); const o = T.days[d] || (T.days[d] = { n: 0, ok: 0, lv: {} }); const ks = Object.keys(T.days).sort(); if (ks.length > 150) ks.slice(0, ks.length - 150).forEach(k => delete T.days[k]); return o; }
// record every answered question (quizzes, review, tests) by day and CEFR level
const _srsTouch = srsTouch;
srsTouch = function (key, ok, q) {
  _srsTouch(key, ok, q); if (!S) return;
  const o = trkDay(today()); o.n++; if (ok) o.ok++;
  const l = key ? lvlOfKey(key) : null; if (l) { const a = o.lv[l] || (o.lv[l] = [0, 0]); a[0]++; if (ok) a[1]++; }
};
// daily snapshot of skill bands
const _pushBand = pushBand;
pushBand = function (sk, b) { _pushBand(sk, b); if (!S || b == null || isNaN(b)) return; const T = trk(); T.bands[today()] = { L: band('L'), R: band('R'), W: band('W'), S: band('S'), o: overall() }; const ks = Object.keys(T.bands).sort(); if (ks.length > 60) ks.slice(0, ks.length - 60).forEach(k => delete T.bands[k]); save(); };

function sumDays(from, to) { // inclusive day offsets back from today: from=0 today
  const T = trk(); let n = 0, ok = 0; const lv = {};
  for (let i = from; i <= to; i++) { const d = T.days[addDays(today(), -i)]; if (!d) continue; n += d.n; ok += d.ok; Object.entries(d.lv).forEach(([l, a]) => { const x = lv[l] || (lv[l] = [0, 0]); x[0] += a[0]; x[1] += a[1]; }); }
  return { n, ok, acc: n ? Math.round(ok / n * 100) : null, lv };
}
function estimate() {
  const r = sumDays(0, 20); let est = null;
  LV.forEach(l => { const a = r.lv[l]; if (a && a[0] >= 8 && a[1] / a[0] >= .7) { const lower = LV.slice(0, LVN[l]).every(x => !r.lv[x] || r.lv[x][0] < 5 || r.lv[x][1] / r.lv[x][0] >= .6); if (lower) est = l; } });
  const ch = trk().checks.slice(-1)[0]; const chk = ch && daysBetween(ch.d, today()) <= 21 ? ch.lvl : null;
  const bnd = bandToCefr(overall());
  const votes = [est, chk, bnd].filter(Boolean); if (!votes.length) return { lvl: null, est, chk, bnd };
  const avg = Math.floor(votes.reduce((a, l) => a + LVN[l], 0) / votes.length + .25); return { lvl: LV[avg], est, chk, bnd };
}
function alerts() {
  const out = []; const last = S.streak.last; const idle = last ? daysBetween(last, today()) : null;
  if (idle != null && idle >= 3) out.push(['idle', tx('Bạn đã nghỉ ' + idle + ' ngày. Từ vựng bắt đầu rơi rụng sau khoảng 3–4 ngày không ôn – quay lại với 10 phút ôn tập trước nhé.', 'You have been away for ' + idle + ' days. Start again with 10 minutes of review.')]);
  const a7 = sumDays(0, 6), a21 = sumDays(7, 27);
  if (a7.n >= 20 && a21.n >= 20 && a21.acc - a7.acc >= 10) out.push(['drop', tx('Độ chính xác 7 ngày qua là ' + a7.acc + '%, giảm ' + (a21.acc - a7.acc) + ' điểm so với 3 tuần trước đó (' + a21.acc + '%).', 'Accuracy this week is ' + a7.acc + '%, down ' + (a21.acc - a7.acc) + ' points from the previous 3 weeks (' + a21.acc + '%).')]);
  ['L', 'R', 'W', 'S'].forEach(k => { const h = S.bh[k]; if (h.length >= 3) { const best = Math.max(...h.slice(0, -1)), cur = h[h.length - 1]; if (best - cur >= 1) out.push(['band', tx('Kỹ năng ' + k + ': bài gần nhất ' + cur + ', thấp hơn mức tốt nhất gần đây (' + best + ') 1 band trở lên.', k + ': latest ' + cur + ', at least 1 band below your recent best (' + best + ').')]); } });
  const cur = sumDays(0, 13).lv[S.level]; if (cur && cur[0] >= 10 && cur[1] / cur[0] < .55) out.push(['level', tx('Ở cấp ' + S.level + ' bạn chỉ đúng ' + Math.round(cur[1] / cur[0] * 100) + '% trong 2 tuần qua – nên củng cố lại nền tảng.', 'At ' + S.level + ' you got only ' + Math.round(cur[1] / cur[0] * 100) + '% right in the last 2 weeks.')]);
  const e = estimate(); if (e.lvl && LVN[e.lvl] < LVN[S.level]) out.push(['below', tx('Ước tính trình độ hiện tại là ' + e.lvl + ', thấp hơn cấp đang học (' + S.level + ').', 'Your estimated level is ' + e.lvl + ', below your study level (' + S.level + ').')]);
  const due = dueKeys().length; if (due > 60) out.push(['backlog', tx('Có ' + due + ' mục ôn tập tồn đọng – hãy chia nhỏ, mỗi ngày ôn 30–40 mục.', due + ' review items are waiting – do 30–40 a day.')]);
  const ch = trk().checks.slice(-1)[0]; if (!ch || daysBetween(ch.d, today()) >= 7) out.push(['check', tx(ch ? 'Đã ' + daysBetween(ch.d, today()) + ' ngày chưa kiểm tra trình độ – làm bài nhanh 18 câu (khoảng 6 phút) nhé.' : 'Chưa có bài kiểm tra trình độ định kỳ nào – làm thử 18 câu (khoảng 6 phút).', 'Take the 6-minute level check.')]);
  return out;
}
// ---- smart weekly plan ----
function weakSkill() { const b = ['L', 'R', 'W', 'S'].map(k => [k, band(k)]); const none = b.find(x => x[1] == null); if (none) return none[0]; return b.sort((a, c) => a[1] - c[1])[0][0]; }
function makePlan() {
  const al = alerts().map(a => a[0]); const e = estimate();
  const recover = al.includes('below') || al.includes('level') || al.includes('drop');
  const tgt = recover ? (e.lvl && LVN[e.lvl] < LVN[S.level] ? e.lvl : LV[Math.max(0, LVN[S.level] - 1)]) : S.level;
  const r21 = sumDays(0, 20).lv;
  const weakLv = LV.filter(l => r21[l] && r21[l][0] >= 5 && r21[l][1] / r21[l][0] < .65);
  const gramList = C.G.filter(u => (u.lvl === tgt || weakLv.includes(u.lvl)) && !((S.gram[u.id] || {}).best >= 80)).concat(C.G.filter(u => u.lvl === S.level && !((S.gram[u.id] || {}).best >= 80)));
  const subList = allSubs().filter(x => !x.ai && cefrOk(x.s.lvl) === tgt && !S.stamps['t:' + x.key]).concat(allSubs().filter(x => !x.ai && !S.stamps['t:' + x.key]));
  const leech = Object.keys(S.srs).filter(k => S.srs[k].w >= 2 && S.srs[k].b < 3).length;
  const ws = weakSkill(); const skName = { L: 'Listening', R: 'Reading', W: 'Writing', S: 'Speaking' };
  const dleft = S.examDate ? daysBetween(today(), S.examDate) : null; const mockDays = dleft != null && dleft <= 60 ? [2, 5] : [5];
  const skillDays = { 0: ws, 1: 'R', 2: ws, 3: 'L', 4: ws, 5: 'W', 6: 'S' };
  const days = []; let gi = 0, si = 0;
  for (let i = 0; i < 7; i++) {
    const t = [['review', tx('Ôn tập hằng ngày' + (i === 0 && leech ? ' (ưu tiên ' + leech + ' mục hay sai)' : ''), 'Daily review'), 'nav|review', 10]];
    const sub = subList[si++ % Math.max(1, subList.length)]; if (sub) t.push(['vocab', tx('Từ vựng: ', 'Vocabulary: ') + pick(sub.s.t) + ' (' + sub.s.lvl + ')', 'goArg|sub|' + sub.key, 10]);
    if (i % 2 === 0 || recover) { const u = gramList[gi++ % Math.max(1, gramList.length)]; if (u) t.push(['gram', tx('Ngữ pháp: ', 'Grammar: ') + pick(u.t) + ' (' + u.lvl + ')', 'goArg|unit|' + u.id, 10]); }
    if (mockDays.includes(i)) t.push(['mock', tx('Làm 1 đề mock (có thể chia 2 buổi)', 'One mock test (can split into 2 sessions)'), 'goArg|tests|mock', 60]);
    else { const k = skillDays[i]; t.push(['skill', tx('Luyện ', 'Practise ') + skName[k] + (k === ws ? tx(' (kỹ năng yếu nhất)', ' (weakest skill)') : ''), 'goArg|tests|skills', k === 'W' ? 40 : 20]); }
    if (i === 6) t.push(['check', tx('Kiểm tra trình độ nhanh', 'Quick level check'), 'levelCheck|', 6]);
    days.push({ d: addDays(today(), i), t });
  }
  return { tgt, recover, ws, days, made: today() };
}
VIEWS.progress = () => {
  const T = trk(); const e = estimate(); const al = alerts();
  if (!S.plan || daysBetween(S.plan.made, today()) >= 7) { S.plan = makePlan(); save(); }
  const P = S.plan;
  // charts: last 4 weeks accuracy, band history
  const wk = [3, 2, 1, 0].map(w => sumDays(w * 7, w * 7 + 6));
  const accChart = wk.some(x => x.n) ? chartSVG({ type: 'line', unit: '%', cats: [tx('3 tuần trước', '3 wks ago'), tx('2 tuần trước', '2 wks ago'), tx('Tuần trước', 'Last wk'), tx('Tuần này', 'This wk')], series: [[tx('Độ chính xác', 'Accuracy'), wk.map(x => x.acc || 0)]] }) : '<p class="muted small">' + tx('Chưa có dữ liệu – làm vài bài luyện tập là biểu đồ sẽ hiện.', 'No data yet.') + '</p>';
  const bks = Object.keys(T.bands).sort().slice(-8);
  const bandChart = bks.length >= 2 ? chartSVG({ type: 'line', unit: '', cats: bks.map(d => d.slice(8) + '/' + d.slice(5, 7)), series: [['Listening', bks.map(d => T.bands[d].L || 0)], ['Reading', bks.map(d => T.bands[d].R || 0)], ['Writing', bks.map(d => T.bands[d].W || 0)], ['Speaking', bks.map(d => T.bands[d].S || 0)]] }) : '';
  const lvRows = LV.map(l => { const a = sumDays(0, 20).lv[l]; return '<div class="bandrow"><span>' + lvBadge(l) + (a ? ' <small class="muted">' + a[0] + tx(' câu', ' q') + '</small>' : '') + '</span>' + bar(a ? a[1] / a[0] * 100 : 0) + '<b>' + (a ? Math.round(a[1] / a[0] * 100) + '%' : '–') + '</b></div>'; }).join('');
  const t7 = sumDays(0, 6);
  page(head(tx('Tiến độ & lộ trình', 'Progress & study path'), tx('Mọi câu trả lời, band và bài kiểm tra trình độ đều được lưu theo từng tài khoản và theo ngày.', 'Every answer, band and level check is saved per account and per day.')) +
    '<section class="grid3"><div class="card stat"><b>' + lvBadge(S.level) + '</b><span>' + tx('cấp đang học', 'study level') + '</span></div><div class="card stat"><b>' + (e.lvl ? lvBadge(e.lvl) : '–') + '</b><span>' + tx('trình độ ước tính', 'estimated level') + '</span></div><div class="card stat"><b>' + (t7.acc != null ? t7.acc + '%' : '–') + '</b><span>' + tx('đúng trong 7 ngày (' + t7.n + ' câu)', 'correct, 7 days (' + t7.n + ' q)') + '</span></div></section>' +
    '<p class="small muted">' + tx('Ước tính kết hợp: độ chính xác theo cấp độ (21 ngày) ', 'Combines: accuracy by level (21 days) ') + (e.est ? '→ ' + e.est : '–') + tx(' · bài kiểm tra trình độ gần nhất ', ' · latest level check ') + (e.chk ? '→ ' + e.chk : '–') + tx(' · band IELTS ước tính ', ' · estimated band ') + (e.bnd ? '→ ' + e.bnd : '–') + '.</p>' +
    (al.length ? '<section class="card warnbox"><h2>' + tx('Cần chú ý', 'Heads-up') + '</h2><ul>' + al.map(a => '<li>' + esc(a[1]) + '</li>').join('') + '</ul>' + (e.lvl && e.lvl !== S.level ? '<button class="btn alt" data-act="setLevel" data-arg="' + e.lvl + '">' + tx('Chuyển cấp đang học sang ' + e.lvl, 'Switch study level to ' + e.lvl) + '</button>' : '') + '<button class="btn" data-act="levelCheck">' + tx('Kiểm tra trình độ nhanh (18 câu)', 'Quick level check (18 q)') + '</button></section>' : '<section class="card"><p>' + tx('Mọi thứ đang ổn định. Giữ nhịp nhé!', 'All steady – keep going!') + '</p><button class="btn ghost" data-act="levelCheck">' + tx('Kiểm tra trình độ nhanh', 'Quick level check') + '</button></section>') +
    '<section class="card"><div class="cardh"><h2>' + tx('Lộ trình 7 ngày', '7-day path') + '</h2><button class="btn ghost sm" data-act="replan">' + tx('Tạo lại', 'Rebuild') + '</button></div><p class="small muted">' + (P.recover ? tx('Chế độ CỦNG CỐ: tạm học ở cấp ' + P.tgt + ' và ôn kỹ các mục hay sai, khi độ chính xác ≥ 70% sẽ quay lại cấp ' + S.level + '.', 'Recovery mode: working at ' + P.tgt + ' until accuracy is back above 70%.') : tx('Cấp mục tiêu ' + P.tgt + ' · tập trung kỹ năng yếu nhất: ' + P.ws + '.', 'Target ' + P.tgt + ' · focus skill: ' + P.ws + '.')) + tx(' Lộ trình tự làm mới mỗi tuần hoặc khi bạn bấm Tạo lại.', ' The path refreshes weekly.') + '</p>' +
    P.days.map((d, i) => { const dn = S.planDone || {}; const mins = d.t.reduce((a, x) => a + x[3], 0); return '<div class="planday' + (d.d === today() ? ' today' : '') + '"><div class="row between"><b>' + (d.d === today() ? tx('Hôm nay', 'Today') : d.d.slice(8) + '/' + d.d.slice(5, 7)) + '</b><span class="small muted">~' + mins + tx(' phút', ' min') + '</span></div>' + d.t.map((x, j) => { const id = d.d + ':' + j; const [act, ...arg] = x[2].split('|'); return '<div class="planitem' + (dn[id] ? ' done' : '') + '"><button class="chk" data-act="planTick" data-arg="' + id + '" aria-label="done">' + (dn[id] ? '✓' : '') + '</button><button class="link" data-act="' + act + '" data-arg="' + esc(arg.join('|')) + '">' + esc(x[1]) + '</button></div>'; }).join('') + '</div>'; }).join('') +
    (AI.ok() ? '<div id="aiadv"></div><button class="btn ghost sm" data-act="aiAdvice">' + ICON.spark + tx('Nhờ AI nhận xét tiến độ', 'Ask AI for advice') + '</button>' : '') + '</section>' +
    '<section class="card"><h2>' + tx('Độ chính xác theo cấp độ (21 ngày)', 'Accuracy by level (21 days)') + '</h2><div class="bands">' + lvRows + '</div></section>' +
    '<section class="card"><h2>' + tx('Độ chính xác 4 tuần gần nhất', 'Accuracy, last 4 weeks') + '</h2>' + accChart + '</section>' +
    (bandChart ? '<section class="card"><h2>' + tx('Diễn biến band', 'Band history') + '</h2>' + bandChart + '</section>' : '') +
    (T.checks.length ? '<section class="card"><h2>' + tx('Các lần kiểm tra trình độ', 'Level checks') + '</h2><ul class="hist">' + T.checks.slice(-8).reverse().map(c => '<li><span class="muted">' + c.d.slice(5) + '</span><span>' + lvBadge(c.lvl) + '</span><b>' + c.pct + '%</b></li>').join('') + '</ul></section>' : ''));
};
ACT.replan = () => { S.plan = makePlan(); save(); go('progress'); };
ACT.planTick = id => { S.planDone = S.planDone || {}; if (S.planDone[id]) delete S.planDone[id]; else { S.planDone[id] = 1; reward(2, 0); } const ks = Object.keys(S.planDone).sort(); if (ks.length > 80) ks.slice(0, ks.length - 80).forEach(k => delete S.planDone[k]); save(); go('progress'); };
ACT.setLevel = l => { modal('<div class="center"><p>' + tx('Chuyển cấp đang học từ ' + S.level + ' sang ' + l + '? Gợi ý bài học, ôn tập và lộ trình sẽ theo cấp mới. Bạn có thể đổi lại bất cứ lúc nào trong Tài khoản.', 'Switch study level from ' + S.level + ' to ' + l + '?') + '</p><button class="btn" data-act="setLevel2" data-arg="' + l + '">' + tx('Chuyển', 'Switch') + '</button><button class="btn ghost" data-act="closeModal">' + tx('Để sau', 'Later') + '</button></div>'); };
ACT.setLevel2 = l => { S.level = l; S.plan = makePlan(); save(); closeModal(); toast(tx('Đã chuyển sang ' + l, 'Now studying at ' + l)); go('progress'); };
ACT.levelCheck = () => {
  const qs = [];
  LV.forEach(l => {
    const units = shuffle(C.G.filter(u => u.lvl === l)); const subs = shuffle(allSubs().filter(x => !x.ai && cefrOk(x.s.lvl) === l));
    const g = units.slice(0, subs.length ? 2 : 3).map(u => { const q = gramQ(u, Math.random() * u.q.length | 0); q.lv = l; return q; });
    const v = subs.slice(0, 1).map(s => { const ws = wordsOf(s); const q = vocabQ(shuffle(ws)[0], ws, Math.random() < .5 ? 'mean' : 'cloze'); q.lv = l; return q; });
    qs.push(...g, ...v);
  });
  runQuiz({ title: tx('Kiểm tra trình độ nhanh', 'Quick level check'), qs, mode: 'timed', time: qs.length * 25, kind: 'check', back: () => go('progress'),
    onFinish: r => {
      const by = {}; r.ans.forEach(a => { const l = a.q.lv; if (!l) return; const x = by[l] || (by[l] = [0, 0]); x[0]++; if (a.ok) x[1]++; });
      let lvl = 'A1'; LV.forEach(l => { const x = by[l]; if (x && x[1] / x[0] >= .66 && LV.slice(0, LVN[l]).every(y => !by[y] || by[y][1] / by[y][0] >= .5)) lvl = l; });
      trk().checks.push({ d: today(), lvl, pct: r.pct }); trk().checks = trk().checks.slice(-30); S.plan = null; save();
      setTimeout(() => modal('<div class="center"><p class="eyebrow">' + tx('Kết quả kiểm tra trình độ', 'Level check result') + '</p><h2>' + lvBadge(lvl) + '</h2><p class="small">' + LV.map(l => by[l] ? l + ' ' + by[l][1] + '/' + by[l][0] : '').filter(Boolean).join(' · ') + '</p>' + (lvl !== S.level ? '<p>' + tx('Cấp đang học: ' + S.level + '.', 'Study level: ' + S.level + '.') + '</p><button class="btn" data-act="setLevel2" data-arg="' + lvl + '">' + tx('Chuyển sang ' + lvl, 'Switch to ' + lvl) + '</button>' : '') + '<button class="btn ghost" data-act="closeModal">OK</button></div>'), 300);
    } });
};
ACT.aiAdvice = async () => {
  const box = $('#aiadv'); box.innerHTML = '<p class="muted pulse">…</p>'; const e = estimate(); const wk = [0, 1, 2, 3].map(w => sumDays(w * 7, w * 7 + 6).acc);
  const p = 'You are a warm, practical IELTS coach for a Vietnamese learner. Data: study level ' + S.level + '; estimated level ' + (e.lvl || 'unknown') + '; skill bands L ' + band('L') + ', R ' + band('R') + ', W ' + band('W') + ', S ' + band('S') + '; weekly accuracy (this week first) ' + wk.join(', ') + '%; streak ' + S.streak.n + ' days; review items due ' + dueKeys().length + '; exam ' + (S.examDate ? 'on ' + S.examDate : 'date not set') + '; alerts: ' + alerts().map(a => a[0]).join(', ') + '. In under 150 words: say honestly how they are doing, name the single most important thing to fix this week, and give 3 concrete daily actions. Plain text, no markdown. ' + langLine();
  try { await AI.text(p, t => { box.innerHTML = '<p class="aitext"></p>'; box.firstChild.textContent = t; }); } catch (err) { box.innerHTML = ''; }
};
// home: progress card above other content
const _home = VIEWS.home;
VIEWS.home = () => {
  _home(); const al = alerts().filter(a => a[0] !== 'check'); const e = estimate();
  const card = document.createElement('section'); card.className = 'card' + (al.length ? ' warnbox' : '');
  card.innerHTML = '<div class="cardh"><h2>' + ICON.progress + ' ' + tx('Theo dõi trình độ', 'Level tracking') + '</h2><button class="link" data-act="nav" data-arg="progress">' + tx('Xem lộ trình', 'Open path') + '</button></div>' + (al.length ? '<p>' + esc(al[0][1]) + (al.length > 1 ? tx(' (+' + (al.length - 1) + ' lưu ý khác)', ' (+' + (al.length - 1) + ' more)') : '') + '</p>' : '<p class="muted">' + tx('Cấp đang học ' + S.level + (e.lvl ? ' · ước tính ' + e.lvl : '') + ' · ổn định.', 'Study level ' + S.level + (e.lvl ? ' · estimated ' + e.lvl : '') + ' · steady.') + '</p>');
  const hero = $('.hero'); hero && hero.after(card);
};

// final menu order
(function () { const order = ['home', 'learn', 'review', 'tests', 'progress', 'explore', 'lit', 'games', 'stamps', 'shop', 'tutor', 'settings']; NAV.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0])); })();
