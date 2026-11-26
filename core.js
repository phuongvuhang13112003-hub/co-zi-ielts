// ===== Core: utils, storage, AI, voice, content index, rewards, art =====
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
let LANG = 'vi';
const tx = (vi, en) => (LANG === 'en' && en != null ? en : vi);
const pick = a => Array.isArray(a) ? (LANG === 'en' && a[1] ? a[1] : a[0]) : (a ?? '');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const take = (a, n) => shuffle(a).slice(0, n);
const fmtD = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const today = () => fmtD(new Date());
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return fmtD(d); };
const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);
const norm = s => String(s || '').toLowerCase().replace(/[’‘]/g, "'").trim().replace(/^[.,!?;:"']+|[.,!?;:"']+$/g, '').replace(/\s+/g, ' ');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const use = n => { try { return (window.claude && window.claude.use) ? Promise.resolve(window.claude.use(n)).catch(() => null) : Promise.resolve(null); } catch (e) { return Promise.resolve(null); } };
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r({ code: 'timeout' }), ms))]);
const wc = s => (String(s).trim().match(/\S+/g) || []).length;
const mmss = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const hashStr = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return (h >>> 0).toString(36); };

// ----- Storage: per-viewer private db, with localStorage fallback -----
const Store = {
  db: null, id: null, mode: 'local', w: {},
  async init() {
    const [db, user] = await Promise.all([use('db'), use('user')]);
    if (db && user) { try { const id = await user.id(); if (id) { this.db = db; this.id = id; this.mode = 'cloud'; } } catch (e) {} }
  },
  ref(k) { return this.db.collection('data/users/' + this.id).doc(k); },
  local(k, v) { try { if (v === undefined) { const x = localStorage.getItem('cozy_' + k); return x ? JSON.parse(x) : null; } localStorage.setItem('cozy_' + k, JSON.stringify(v)); } catch (e) { return null; } },
  async get(k) {
    if (this.mode === 'cloud') {
      try { const s = await withTimeout(this.ref(k).get(), 10000); if (s.exists) return s.data(); return this.local(k); }
      catch (e) { console.warn('db get', e); }
    }
    return this.local(k);
  },
  set(k, v) {
    this.local(k, v);
    if (this.mode !== 'cloud') return;
    const w = this.w[k] || (this.w[k] = { busy: false, next: null });
    w.next = v; if (!w.busy) this.flush(k);
  },
  async flush(k) {
    const w = this.w[k]; if (!w.next) return;
    const v = JSON.parse(JSON.stringify(w.next)); w.next = null; w.busy = true;
    try { await this.ref(k).set(v); }
    catch (e) {
      console.warn('db set', e);
      if (e && (e.code === 'invalid_argument' || e.code === 'revoked' || e.code === 'not_granted')) { this.mode = 'local'; toast(tx('Không lưu được lên tài khoản – đang lưu trên trình duyệt này.', 'Cloud save failed – saving in this browser.')); }
      if (e && e.code === 'quota_exceeded') toast(tx('Bộ nhớ đầy, hãy xoá bớt bài AI cũ.', 'Storage full – delete old AI lessons.'));
    }
    w.busy = false; if (w.next) this.flush(k);
  },
  async del(k) { try { localStorage.removeItem('cozy_' + k); } catch (e) {} if (this.mode === 'cloud') { try { await this.ref(k).delete(); } catch (e) {} } }
};

// ----- AI (Claude) -----
const AI = {
  s: null,
  async init() { this.s = await use('sample'); },
  ok() { return !!this.s; },
  fail(e) {
    if (e && e.code === 'not_granted') { this.s = null; toast(tx('Bạn chưa cho phép dùng AI trên trang này.', 'AI access was not granted.')); }
    else if (e && e.code === 'rate_limited') toast(tx('AI đang bận, thử lại sau ít phút nhé.', 'AI is busy, try again in a few minutes.'));
    else toast(tx('AI gặp lỗi, thử lại nhé.', 'AI error, please try again.'));
  },
  async json(prompt, tier = 'default') {
    if (!this.s) throw { code: 'no_ai' };
    try {
      if (typeof this.s.json === 'function') return await this.s.json(prompt, { modelTier: tier });
      const r = await this.s(prompt + '\n\nReturn ONLY valid JSON.', { modelTier: tier });
      const m = r.text.match(/[\[{][\s\S]*[\]}]/); return JSON.parse(m ? m[0] : r.text);
    } catch (e) { this.fail(e); throw e; }
  },
  async text(input, onText, tier = 'default') {
    if (!this.s) throw { code: 'no_ai' };
    try { const r = await this.s(input, { onText: onText ? (({ text }) => onText(text)) : undefined, cache: false, modelTier: tier }); return r.text; }
    catch (e) { this.fail(e); throw e; }
  }
};
const langLine = () => LANG === 'en' ? 'Write all explanations in clear, simple English.' : 'Viết mọi lời giải thích, nhận xét bằng tiếng Việt dễ hiểu (giữ nguyên ví dụ tiếng Anh).';

// ----- Voice: Claude TTS, fallback to browser speech -----
const Voice = {
  t: null, d: null, target: null, rate: 1, onEnd: null,
  async init() {
    [this.t, this.d] = await Promise.all([use('tts'), use('dictation')]);
    if (this.d) {
      this.d.onFinal(({ text }) => { const el = this.target; if (el) { el.value = (el.value ? el.value.replace(/\s*$/, ' ') : '') + text; el.dispatchEvent(new Event('input')); } const p = $('#dictPartial'); if (p) p.textContent = ''; });
      this.d.onPartial(({ text }) => { const p = $('#dictPartial'); if (p) p.textContent = text; });
      this.d.onState(({ state }) => { $$('.mic').forEach(b => b.classList.toggle('on', state === 'listening')); });
    }
  },
  canSpeak() { return !!this.t || ('speechSynthesis' in window); },
  canListen() { return !!this.d; },
  async lines(lines) {
    const rate = this.rate;
    if (this.t) {
      return this.t.speak(lines.map(([sp, text]) => ({ text, voice: sp === 'W' ? 'airy' : sp === 'X' ? 'glassy' : 'buttery', language: 'en', rate })));
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const vs = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
      return new Promise((res, rej) => {
        let i = 0;
        const next = () => {
          if (i >= lines.length) return res();
          const [sp, text] = lines[i++]; const u = new SpeechSynthesisUtterance(text);
          u.lang = 'en-GB'; u.rate = rate; if (vs.length) u.voice = vs[(sp === 'W' ? 1 : 0) % vs.length]; u.pitch = sp === 'W' ? 1.2 : 0.95;
          u.onend = next; u.onerror = e => (e.error === 'interrupted' || e.error === 'canceled') ? rej({ code: 'viewer_stopped' }) : next();
          speechSynthesis.speak(u);
        };
        next();
      });
    }
    throw { code: 'no_voice' };
  },
  say(text) { return this.lines([['M', text]]).catch(() => {}); },
  stop() { try { this.t && this.t.stop(); } catch (e) {} try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {} },
  listen(el, btn) {
    if (!this.d) return;
    this.target = el;
    if (btn && btn.classList.contains('on')) { this.d.stop().catch(() => {}); return; }
    this.d.start().catch(e => { if (e && e.code === 'not_granted') { this.d = null; $$('.mic').forEach(b => b.remove()); toast(tx('Micro không được phép – hãy gõ câu trả lời.', 'Mic not allowed – please type.')); } });
  }
};

// ----- Content index -----
const C = { G: window.GRAMMAR, P: window.PARAPHRASE, T: window.TOPICS, R: window.READINGS, L: window.LISTENINGS, W: window.WRITING, S: window.SPEAKING, X: window.EXTRA, PL: window.PLACEMENT, M: window.MOCKS };
const LV = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const AI_TOPIC = { id: 'ai', icon: 'star', t: ['Bài học của tôi (AI & tự thêm)', 'My lessons (AI & my own)'] };
function allSubs() {
  const out = [];
  C.T.forEach(tp => tp.subs.forEach(s => out.push({ tp, s, key: tp.id + '/' + s.id })));
  (LIB.items || []).filter(x => x.type === 'vocab').forEach(x => out.push({ tp: AI_TOPIC, s: x.data, key: 'ai/' + x.id, ai: true }));
  return out;
}
const subByKey = k => allSubs().find(x => x.key === k);
const wordObj = (sub, arr) => ({ w: arr[0], pos: arr[1], vi: arr[2], def: arr[3], ex: arr[4], col: arr[5], syn: arr[6], key: 'v:' + sub.key + '|' + arr[0] });
const wordsOf = sub => sub.s.w.map(a => wordObj(sub, a));
const firstSyn = w => String(w.syn || '').split(',')[0].trim();

function blankOut(ex, word) {
  const re = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
  return re.test(ex) ? ex.replace(re, '______') : null;
}
function vocabQ(w, pool, type) {
  const others = shuffle(pool.filter(x => x.w !== w.w));
  const types = ['mean', 'rev', 'cloze', 'syn'];
  type = type || types[Math.random() * types.length | 0];
  let p, right, wrong;
  if (type === 'cloze') { const b = blankOut(w.ex, w.w); if (!b) type = 'rev'; else { p = tx('Điền từ đúng: ', 'Fill the gap: ') + b; right = w.w; wrong = others.map(x => x.w); } }
  if (type === 'syn') { const s = firstSyn(w); const os = others.map(firstSyn).filter(x => x && x !== s); if (!s || os.length < 3) type = 'mean'; else { p = tx('Từ nào gần nghĩa nhất với "', 'Closest in meaning to "') + w.w + '"?'; right = s; wrong = os; } }
  if (type === 'mean') { p = tx('"' + w.w + '" (' + w.pos + ') nghĩa là gì?', 'What does "' + w.w + '" (' + w.pos + ') mean?'); right = LANG === 'en' ? w.def : w.vi; wrong = others.map(x => LANG === 'en' ? x.def : x.vi); }
  if (type === 'rev') { p = tx('Từ nào có nghĩa "' + w.vi + '"?', 'Which word means "' + w.def + '"?'); right = w.w; wrong = others.map(x => x.w); }
  const o = shuffle([right, ...[...new Set(wrong)].filter(x => x !== right).slice(0, 3)]);
  return { k: 'mcq', p, o, a: o.indexOf(right), key: w.key, vt: type, e: w.w + ' (' + w.pos + '): ' + w.vi + ' – ' + w.def + '. VD: ' + w.ex + (w.col ? ' | Collocations: ' + w.col : '') + (w.syn ? ' | Synonyms: ' + w.syn : '') };
}
const gramQ = (u, i) => { const q = u.q[i]; return { k: 'mcq', p: q[0], o: q[1], a: q[2], e: q[3], key: 'g:' + u.id + ':' + i, tag: pick(u.t) }; };
const normQ = (q, key, ctx) => Object.assign({}, q, { key, ctx });

function qFromKey(key, it, wantNew) {
  try {
    if (it && it.q) return Object.assign({}, it.q, { key });
    if (key.startsWith('v:')) {
      const [sk, word] = key.slice(2).split('|'); const sub = subByKey(sk); if (!sub) return null;
      const ws = wordsOf(sub); const w = ws.find(x => x.w === word); if (!w) return null;
      let pool = ws; if (pool.length < 4) pool = pool.concat(allSubs().slice(0, 3).flatMap(wordsOf));
      const types = ['mean', 'rev', 'cloze', 'syn'].filter(t => !wantNew || t !== (it && it.vt));
      return vocabQ(w, pool, types[Math.random() * types.length | 0]);
    }
    if (key.startsWith('d:')) {
      const [l, w] = key.slice(2).split('|'); const m = DICT[l] && DICT[l][w]; if (!m) return null;
      const pool = Object.keys(DICT[l]).filter(x => x !== w).sort(() => Math.random() - .5).slice(0, 12).map(x => dictWord(l, x)).concat([dictWord(l, w)]);
      return vocabQ(dictWord(l, w), pool, wantNew ? 'rev' : (Math.random() < .5 ? 'mean' : 'rev'));
    }
    if (key.startsWith('k:')) {
      const [sk, ix] = key.slice(2).split('|'); const sub = subByKey(sk); const q = sub && sub.s.L && sub.s.L.q[+ix]; if (!q) return null;
      return { k: 'mcq', p: q[0], o: q[1], a: q[2], e: q[3], key, tag: tx('Kiến thức', 'Knowledge') };
    }
    if ((key.startsWith('lq:') || key.startsWith('lv:')) && window.litFromKey) return window.litFromKey(key, wantNew);
    if (key.startsWith('i:')) {
      const [th, ix] = key.slice(2).split('|'); const T = (window.IDIOMS || []).find(x => x.id === th); if (!T) return null;
      return idiomQ(T, +ix, wantNew);
    }
    if (key.startsWith('g:')) {
      const [, uidd, qi] = key.split(':'); const u = C.G.find(x => x.id === uidd); if (!u) return null;
      let i = +qi; if (wantNew) { const alt = u.q.map((_, j) => j).filter(j => j !== i); i = alt[Math.random() * alt.length | 0]; const q = gramQ(u, i); q.key = key; q.newCtx = true; return q; }
      return gramQ(u, i);
    }
    if (key.startsWith('q:')) {
      const parts = key.split(':');
      if (parts[1] === 'r') { const r = C.R.find(x => x.id === parts[2]); return normQ(r.q[+parts[3]], key, { title: r.title, text: r.text }); }
      if (parts[1] === 'l') { const l = C.L.find(x => x.id === parts[2]); return normQ(l.q[+parts[3]], key, { title: l.title, text: l.lines.map(x => x[1]).join('\n') }); }
      if (parts[1] === 'x') { return normQ(C.X[parts[2]].q[+parts[3]], key); }
      if (parts[1] === 'p') { return normQ(C.PL[+parts[2]], key); }
    }
  } catch (e) { console.warn('qFromKey', key, e); }
  return null;
}

// ----- Profile state -----
let PROFILES = { list: [] }, PID = null, S = null, LIB = { items: [] };
const SKINS = { dau: ['Sữa dâu', 'Strawberry milk'], matcha: ['Matcha latte', 'Matcha latte'], sky: ['Bầu trời', 'Sky'], lav: ['Oải hương', 'Lavender'], peach: ['Đào mật', 'Peach'], mint: ['Bạc hà', 'Mint'], cacao: ['Đêm cacao', 'Cocoa night'], pitch: ['Sân cỏ xanh trời', 'Sky-blue pitch'], xmas: ['Giáng sinh ấm áp', 'Cozy Christmas'] };
const newState = (name) => ({ v: 1, name, coins: 60, gems: 3, xp: 0, level: 'B1', placement: null, bh: { L: [], R: [], W: [], S: [] }, examDate: '', goal: 15, streak: { n: 0, last: '' }, daily: { d: '', bonus: false }, srs: {}, topic: {}, gram: {}, stamps: {}, owned: ['skin:dau', 'pat:none', 'hat:none', 'acc:none', 'album:rose'], eq: { sp: 'cat', skin: 'dau', pat: 'none', hat: 'none', acc: 'none', album: 'rose' }, hist: [], mock: {}, lang: 'vi', writings: [] });
let saveT = null;
function save() { if (!S) return; clearTimeout(saveT); saveT = setTimeout(() => Store.set('p_' + PID, S), 700); }
function saveLib() { let s = JSON.stringify(LIB); while (s.length > 200000 && LIB.items.length > 1) { LIB.items.shift(); s = JSON.stringify(LIB); } Store.set('lib_' + PID, LIB); }

// ----- SRS (Leitner) -----
const IV = [1, 1, 2, 4, 7, 15, 30, 60];
function srsTouch(key, ok, q) {
  if (!key || !S) return;
  if (ok) { S.stats = S.stats || { correct: 0, perfect: 0 }; S.stats.correct++; }
  const it = S.srs[key] || (S.srs[key] = { b: 0, d: today(), w: 0, r: 0 });
  if (ok) { it.r++; it.b = Math.min(it.b + 1, 7); it.d = addDays(today(), IV[it.b]); }
  else { it.w++; it.b = 0; it.d = addDays(today(), 1); }
  it.l = today(); if (q && q.vt) it.vt = q.vt;
  if (q && q.keep) it.q = { k: q.k, p: q.p, o: q.o, a: q.a, e: q.e, ctx: q.ctx };
  const keys = Object.keys(S.srs);
  if (keys.length > 1500) { keys.sort((a, b) => (S.srs[b].b - S.srs[a].b)).slice(0, 200).forEach(k => delete S.srs[k]); }
}
const dueKeys = () => Object.keys(S.srs).filter(k => S.srs[k].d <= today()).sort((a, b) => S.srs[a].b - S.srs[b].b || S.srs[b].w - S.srs[a].w);

// ----- Rewards, streak, bands -----
function reward(coins, gems = 0, why = '') {
  S.coins += coins; S.gems += gems; S.xp += coins; save(); paintWallet(); setTimeout(checkCup, 1200);
  if (coins || gems) toast([coins ? '+' + coins + ' ' + tx('xu', 'coins') : '', gems ? '+' + gems + ' ' + tx('kim cương', 'gems') : '', why].filter(Boolean).join(' · '), 'gold');
}
function markActive() {
  const t = today(); if (S.streak.last === t) return;
  S.streak.n = S.streak.last === addDays(t, -1) ? S.streak.n + 1 : 1; S.streak.last = t;
  if (S.streak.n % 7 === 0) reward(30, 2, tx('chuỗi ' + S.streak.n + ' ngày', S.streak.n + '-day streak'));
  save();
}
function logHist(k, title, score) { S.hist.unshift({ d: today(), k, t: title, s: score }); S.hist = S.hist.slice(0, 80); save(); }
const BAND_T = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [0, 2]];
const ratioBand = r => { const s = Math.round(r * 40); return BAND_T.find(x => s >= x[0])[1]; };
const roundBand = x => Math.round(x * 2) / 2;
function pushBand(sk, b) { if (b == null || isNaN(b)) return; S.bh[sk].push(b); S.bh[sk] = S.bh[sk].slice(-5); save(); }
const band = sk => { const a = S.bh[sk]; if (!a.length) return null; const r = a.slice(-3); return roundBand(r.reduce((x, y) => x + y, 0) / r.length); };
const overall = () => { const b = ['L', 'R', 'W', 'S'].map(band).filter(x => x != null); return b.length ? roundBand(b.reduce((a, c) => a + c, 0) / b.length) : null; };

function earnStamp(key, pct, label, icon) {
  if (pct < 80) return false;
  const had = S.stamps[key];
  if (had) { if (pct > had.s) { had.s = pct; save(); } return false; }
  S.stamps[key] = { d: today(), s: pct, label, icon }; reward(0, 3, tx('tem mới', 'new stamp'));
  setTimeout(() => modal('<div class="center"><p class="eyebrow">' + tx('Bạn vừa sưu tầm được tem mới!', 'You collected a new stamp!') + '</p><div class="bigstamp">' + stampSVG(label, icon, today(), pct, true) + '</div><p>' + esc(label) + ' · ' + pct + '%</p><button class="btn" data-act="closeModal">' + tx('Dán vào album', 'Put it in the album') + '</button></div>'), 400);
  return true;
}

// ----- UI helpers -----
function toast(msg, cls = '') { const el = document.createElement('div'); el.className = 'toast ' + cls; el.textContent = msg; $('#toasts').appendChild(el); setTimeout(() => el.classList.add('out'), 2600); setTimeout(() => el.remove(), 3100); }
function modal(html) { $('#modal').innerHTML = '<div class="mbox">' + html + '</div>'; $('#modal').hidden = false; }
function closeModal() { $('#modal').hidden = true; $('#modal').innerHTML = ''; }
function paintWallet() { const w = $('#wallet'); if (w && S) w.innerHTML = '<span class="coin" title="' + tx('Xu', 'Coins') + '">' + ICON.coin + '<b>' + S.coins + '</b></span><span class="gem" title="' + tx('Kim cương', 'Gems') + '">' + ICON.gem + '<b>' + S.gems + '</b></span><span class="fire" title="Streak">' + ICON.fire + '<b>' + S.streak.n + '</b></span>'; }
const lvBadge = l => '<span class="lv lv-' + esc(String(l).slice(0, 2)) + '">' + esc(l) + '</span>';
const bar = (pct, cls = '') => '<div class="pbar ' + cls + '"><i style="width:' + Math.max(0, Math.min(100, pct)) + '%"></i></div>';

// ----- Icons (inline SVG, stroke style) -----
const sv = (d, extra = '') => '<svg viewBox="0 0 24 24" class="ic" aria-hidden="true" ' + extra + '>' + d + '</svg>';
const ICON = {
  home: sv('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>'),
  learn: sv('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/><path d="M9 7h6"/>'),
  review: sv('<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v4h4"/><path d="M12 8v4l3 2"/>'),
  test: sv('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
  game: sv('<rect x="3" y="7" width="18" height="11" rx="5"/><path d="M8 11v3M6.5 12.5h3"/><circle cx="15.5" cy="11.5" r="1"/><circle cx="17.5" cy="14" r="1"/>'),
  stamp: sv('<path d="M5 4h14v16H5z" stroke-dasharray="2 2"/><circle cx="12" cy="11" r="3"/><path d="M8 17h8"/>'),
  shop: sv('<path d="M4 9h16l-1 11H5z"/><path d="M8 9a4 4 0 0 1 8 0"/>'),
  chat: sv('<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8"/>'),
  user: sv('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  more: sv('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'),
  play: sv('<path d="M7 4l13 8-13 8z"/>'), stop: sv('<rect x="6" y="6" width="12" height="12" rx="2"/>'),
  mic: sv('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
  speak: sv('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6"/>'),
  back: sv('<path d="M15 5l-7 7 7 7"/>'), explore: sv('<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>'), check: sv('<path d="M5 12l5 5 9-10"/>'), x: sv('<path d="M6 6l12 12M18 6L6 18"/>'),
  spark: sv('<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>'), clock: sv('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>'),
  coin: '<svg viewBox="0 0 24 24" class="ic fill"><circle cx="12" cy="12" r="9" fill="#FFD66B" stroke="#E3A93B"/><path d="M12 7v10M9.5 9.5h4a1.7 1.7 0 0 1 0 3.4h-3a1.7 1.7 0 0 0 0 3.4h4" stroke="#B9822A" fill="none"/></svg>',
  gem: '<svg viewBox="0 0 24 24" class="ic fill"><path d="M6 4h12l4 6-10 11L2 10z" fill="#BDE6FF" stroke="#7CB8E8"/><path d="M2 10h20M9 4l3 6 3-6M12 10v11" stroke="#7CB8E8" fill="none"/></svg>',
  fire: '<svg viewBox="0 0 24 24" class="ic fill"><path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-7 1 2 2 3 3 3-1-2-1-5 0-7z" fill="#FFB38A" stroke="#F08A5D"/></svg>'
};

// Topic art for stamps (48x48 drawings)
const ART = {
  cup: '<path d="M14 20h18v8a9 9 0 0 1-18 0z" fill="#fff8ee"/><path d="M32 22h3a4 4 0 0 1 0 8h-3"/><path d="M19 12c0 3 3 3 3 6M25 12c0 3 3 3 3 6"/>',
  book: '<path d="M8 14c6-2 11-1 16 2 5-3 10-4 16-2v20c-6-2-11-1-16 2-5-3-10-4-16-2z" fill="#fff8ee"/><path d="M24 16v20"/>',
  leaf: '<path d="M12 36C10 20 22 10 38 10c0 16-10 28-26 26z" fill="#e9f7e4"/><path d="M12 36c8-8 14-14 22-22"/>',
  chip: '<rect x="14" y="14" width="20" height="20" rx="3" fill="#eef5ff"/><rect x="19" y="19" width="10" height="10" rx="1"/><path d="M18 10v4M24 10v4M30 10v4M18 34v4M24 34v4M30 34v4M10 18h4M10 24h4M10 30h4M34 18h4M34 24h4M34 30h4"/>',
  heart: '<path d="M24 37S10 28 10 19a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 9-14 18-14 18z" fill="#ffe8ee"/><path d="M15 21h5l2-4 3 8 2-4h5"/>',
  case: '<rect x="9" y="17" width="30" height="19" rx="3" fill="#fff4e4"/><path d="M19 17v-4h10v4M9 25h30"/>',
  city: '<path d="M8 38V20h9v18M17 38V12h11v26M28 38V22h12v16" fill="#f1efff"/><path d="M21 17h3M21 22h3M21 27h3M11 25h3M32 27h4M32 32h4"/>',
  mask: '<path d="M11 14h26v9a13 13 0 0 1-26 0z" fill="#fff0f6"/><path d="M17 21h4M27 21h4M19 29c3 3 7 3 10 0"/>',
  plane: '<path d="M8 27l30-12-8 22-6-8z" fill="#eaf6ff"/><path d="M24 29l14-14"/>',
  flask: '<path d="M20 10h8M21 10v10L12 36a2 2 0 0 0 2 3h20a2 2 0 0 0 2-3L27 20V10" fill="#f0fbf6"/><path d="M16 30h16"/>',
  star: '<path d="M24 9l4.5 9.5 10.5 1.5-7.6 7.2 1.8 10.3L24 32.6l-9.2 4.9 1.8-10.3L9 20l10.5-1.5z" fill="#fff6d8"/>',
  pen: '<path d="M30 10l8 8-18 18H12v-8z" fill="#fff6ee"/><path d="M26 14l8 8"/>',
  globe: '<circle cx="24" cy="24" r="15" fill="#eaf6ff"/><path d="M9 24h30M24 9c-6 6-6 24 0 30M24 9c6 6 6 24 0 30M12 16h24M12 32h24"/>',
  mountain: '<path d="M6 38l12-20 7 10 6-8 11 18z" fill="#eaf7ea"/><path d="M15 23l3-5 3 5"/><path d="M6 42c6-3 12 3 18 0s12-3 18 0"/>',
  drum: '<ellipse cx="24" cy="18" rx="15" ry="6" fill="#fff4e0"/><path d="M9 18v12c0 4 7 7 15 7s15-3 15-7V18"/><path d="M24 14l1.5 3h3l-2.5 2 1 3-3-2-3 2 1-3-2.5-2h3z"/>',
  ball: '<circle cx="24" cy="24" r="15" fill="#fff"/><path d="M24 17l6 4-2 7h-8l-2-7z" fill="currentColor" opacity=".35"/><path d="M24 9v8M30 21l8-3M28 28l5 7M20 28l-5 7M18 21l-8-3"/>',
  boot: '<path d="M12 14h12v10c6 0 14 3 14 9v3H10z" fill="#eaf4ff"/><path d="M10 32h28M16 36v3M24 36v3M32 36v3"/>',
  trophy: '<path d="M16 10h16v8a8 8 0 0 1-16 0z" fill="#fff4cc"/><path d="M16 13h-5a5 5 0 0 0 6 7M32 13h5a5 5 0 0 1-6 7M24 26v6M17 38h14l-2-6H19z"/>',
  whistle: '<circle cx="20" cy="28" r="9" fill="#eaf4ff"/><path d="M24 20h16v7H28"/><circle cx="20" cy="28" r="3"/>',
  goal: '<path d="M8 36V14h32v22" fill="#f2f8ff"/><path d="M8 20h32M8 26h32M8 32h32M16 14v22M24 14v22M32 14v22" opacity=".6"/><circle cx="30" cy="31" r="4" fill="#fff"/>',
  shirt: '<path d="M17 10l-9 6 4 7 4-2v17h16V21l4 2 4-7-9-6c-1 3-4 5-7 5s-6-2-7-5z" fill="#d9ecfb"/><path d="M20 26h8M20 31h8"/>'
};
const CUP = [['warm', 'Khởi động', 'Warm-up', 'whistle', 'Học 3 ngày liên tiếp', '3-day streak', () => S.streak.n >= 3],
  ['pass', 'Chuyền bóng', 'The pass', 'ball', 'Trả lời đúng 100 câu', '100 correct answers', () => (S.stats || {}).correct >= 100],
  ['first', 'Bàn thắng đầu tiên', 'First goal', 'goal', 'Nhận tem chủ đề đầu tiên', 'Earn your first topic stamp', () => Object.keys(S.stamps).some(k => k.startsWith('t:'))],
  ['clean', 'Giữ sạch lưới', 'Clean sheet', 'shirt', 'Đạt 100% một bài từ 10 câu trở lên', '100% on a 10+ question test', () => (S.stats || {}).perfect >= 1],
  ['assist', 'Kiến tạo', 'Assist king', 'boot', 'Trả lời đúng 500 câu', '500 correct answers', () => (S.stats || {}).correct >= 500],
  ['hat', 'Hat-trick', 'Hat-trick', 'ball', 'Sưu tầm 3 tem chủ đề', '3 topic stamps', () => Object.keys(S.stamps).filter(k => k.startsWith('t:')).length >= 3],
  ['mid', 'Nhạc trưởng tuyến giữa', 'Midfield maestro', 'boot', 'Có tem ngữ pháp B1 và B2', 'Grammar B1 and B2 stamps', () => S.stamps['g:B1'] && S.stamps['g:B2']],
  ['derby', 'Trận cầu lớn', 'Big match', 'whistle', 'Hoàn thành đủ 4 phần một đề mock', 'Finish all 4 parts of a mock', () => Object.keys(S.stamps).some(k => k.startsWith('m:'))],
  ['season', 'Mùa giải bền bỉ', 'Iron season', 'shirt', 'Học 21 ngày liên tiếp', '21-day streak', () => S.streak.n >= 21],
  ['treble', 'Cú ăn ba', 'The treble', 'trophy', '10 tem chủ đề + 1 mock + band tổng từ 6.0', '10 topic stamps + 1 mock + overall band 6.0+', () => Object.keys(S.stamps).filter(k => k.startsWith('t:')).length >= 10 && Object.keys(S.stamps).some(k => k.startsWith('m:')) && (overall() || 0) >= 6]];
const CUPI = ['ball', 'boot', 'trophy', 'whistle', 'goal', 'shirt'];
function checkCup() { if (!S) return; for (const c of CUP) { if (!S.stamps['c:' + c[0]] && c[6]()) { earnStamp('c:' + c[0], 100, pick([c[1], c[2]]), c[3]); break; } } }
const STAMP_INK = { cup: '#d98a6c', book: '#6f8fd6', leaf: '#5fa970', chip: '#6a8fd0', heart: '#e07a93', case: '#c8915a', city: '#8f7ad6', mask: '#d47aa8', plane: '#5aa2d6', flask: '#4fae9a', star: '#d6a73f', pen: '#b97a5a', globe: '#4f8fc9', mountain: '#4f9a6f', drum: '#b9773f', ball: '#1c2c5b', boot: '#3d86c4', trophy: '#c79a2a', whistle: '#1c2c5b', goal: '#3d86c4', shirt: '#1c2c5b' };
let stampN = 0;
function stampSVG(label, icon, date, score, earned) {
  const id = 'sm' + (++stampN); const ink = earned ? (STAMP_INK[icon] || '#c47a8a') : '#b9b0b6';
  const holes = []; for (let x = 6; x <= 114; x += 9) { holes.push([x, 2], [x, 148]); } for (let y = 11; y <= 140; y += 9) { holes.push([2, y], [118, y]); }
  const words = String(label).split(' '); const lines = ['']; words.forEach(w => { if ((lines[lines.length - 1] + ' ' + w).trim().length > 15 && lines.length < 2) lines.push(w); else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim(); });
  const yr = String(date || '').slice(0, 4) || '----';
  return '<svg viewBox="0 0 120 150" class="stampsvg' + (earned ? '' : ' locked') + '" role="img" aria-label="' + esc(label) + '"><defs><mask id="' + id + '"><rect width="120" height="150" fill="#fff"/>' + holes.map(h => '<circle cx="' + h[0] + '" cy="' + h[1] + '" r="3.4" fill="#000"/>').join('') + '</mask></defs>' +
    '<rect width="120" height="150" fill="' + (earned ? '#fffaf1' : '#f4f1f2') + '" mask="url(#' + id + ')"/>' +
    '<rect x="10" y="10" width="100" height="130" fill="' + (earned ? ink + '22' : '#ece7ea') + '" stroke="' + ink + '" stroke-width="1.2"/>' +
    '<rect x="14" y="14" width="92" height="122" fill="none" stroke="' + ink + '" stroke-width=".6" stroke-dasharray="1.5 2"/>' +
    '<text x="18" y="27" font-family="Lora,serif" font-size="11" font-weight="700" fill="' + ink + '">' + (earned ? score : '··') + '</text>' +
    '<text x="102" y="27" text-anchor="end" font-family="Lora,serif" font-size="7" fill="' + ink + '" letter-spacing=".5">VIỆT NAM</text>' +
    '<g transform="translate(36 34)" fill="none" stroke="' + ink + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ART[icon] || ART.star) + '</g>' +
    lines.map((l, i) => '<text x="60" y="' + (104 + i * 11) + '" text-anchor="middle" font-family="Lora,serif" font-size="9.5" font-weight="600" fill="' + (earned ? '#4a3a40' : '#a99fa5') + '">' + esc(l) + '</text>').join('') +
    '<text x="60" y="131" text-anchor="middle" font-family="Lora,serif" font-size="7" fill="' + ink + '">' + (CUPI.includes(icon) ? 'COZY CUP' : 'COZY POST') + ' · ' + esc(yr) + '</text>' +
    (earned ? '<g opacity=".55" transform="rotate(-14 92 116)"><circle cx="92" cy="116" r="17" fill="none" stroke="' + ink + '" stroke-width="1.3"/><circle cx="92" cy="116" r="12" fill="none" stroke="' + ink + '" stroke-width=".6"/><text x="92" y="118.5" text-anchor="middle" font-family="Lora,serif" font-size="6" fill="' + ink + '">' + esc(String(date).slice(5)) + '</text><path d="M66 108q5-3 10 0t10 0M64 115q5-3 10 0t10 0M66 122q5-3 10 0t10 0" stroke="' + ink + '" fill="none" stroke-width="1"/></g>' : '') +
    '</svg>';
}

// Mascot cat with accessories
const HATS = { none: '', beret: '<path d="M30 30c6-12 34-14 42-2-8 4-30 6-42 2z" fill="#e87e8f"/><circle cx="52" cy="20" r="3" fill="#e87e8f"/>', crown: '<path d="M34 30l4-14 8 9 6-12 6 12 8-9 4 14z" fill="#ffd66b" stroke="#e3a93b" stroke-width="1.5"/>', bow: '<path d="M60 26l10-8v14zM60 26l-10-8v14z" fill="#f59fb5"/><circle cx="60" cy="26" r="3" fill="#e57f9c"/>', cap: '<path d="M28 32c2-14 40-16 44 0z" fill="#8fc6ee"/><path d="M60 32h22" stroke="#6eaee0" stroke-width="5" stroke-linecap="round"/>', flower: '<g transform="translate(66 24)"><circle r="5" cx="0" cy="-6" fill="#ffe08a"/><circle r="5" cx="6" cy="0" fill="#ffe08a"/><circle r="5" cx="0" cy="6" fill="#ffe08a"/><circle r="5" cx="-6" cy="0" fill="#ffe08a"/><circle r="4" fill="#f4a3b8"/></g>', grad: '<path d="M26 26l24-10 24 10-24 10z" fill="#4b4453"/><path d="M38 30v8c6 4 18 4 24 0v-8" fill="#4b4453"/><path d="M74 26v12" stroke="#ffd66b" stroke-width="2"/>', santa: '<path d="M26 37C28 18 50 8 68 13l15 15-7 3-7-7c-4 3-8 8-9 13z" fill="#e05a66" stroke="#9b2f3a" stroke-width="1.2"/><path d="M24 37q26-11 52 0" stroke="#fff" stroke-width="8" stroke-linecap="round" fill="none"/><circle cx="81" cy="30" r="6" fill="#fff" stroke="#e6dede"/>', band: '<path d="M23 42q27-12 54 0" fill="none" stroke="#6cabdd" stroke-width="6" stroke-linecap="round"/><path d="M23 42q27-12 54 0" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 4"/>' };
const ACCS = { none: '', glasses: '<g fill="none" stroke="#5b4b55" stroke-width="2"><circle cx="40" cy="56" r="7"/><circle cx="60" cy="56" r="7"/><path d="M47 56h6"/></g>', scarf: '<path d="M26 80c10 8 38 8 48 0v8c-10 6-38 6-48 0z" fill="#9ed9b4"/><path d="M62 86l6 12h-8z" fill="#7cc79a"/>', headphones: '<path d="M24 58a26 26 0 0 1 52 0" fill="none" stroke="#8b7cd6" stroke-width="4"/><rect x="18" y="54" width="10" height="16" rx="5" fill="#b5a8ef"/><rect x="72" y="54" width="10" height="16" rx="5" fill="#b5a8ef"/>', star: '<path d="M78 70l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z" fill="#ffd66b"/>', blush: '<ellipse cx="34" cy="66" rx="6" ry="3.5" fill="#ff9fb5"/><ellipse cx="66" cy="66" rx="6" ry="3.5" fill="#ff9fb5"/>', kit: '<path d="M28 80q22 12 44 0l8 16H20z" fill="#6cabdd" stroke="#1c2c5b" stroke-width="1.5"/><path d="M42 84l8 7 8-7" fill="none" stroke="#1c2c5b" stroke-width="2.5"/><path d="M24 92h52" stroke="#fff" stroke-width="2"/>', xscarf: '<path d="M26 80c10 8 38 8 48 0v8c-10 6-38 6-48 0z" fill="#e05a66"/><path d="M34 84v8M46 86v8M58 86v8M68 83v8" stroke="#fff" stroke-width="3"/><path d="M62 86l6 13h-9z" fill="#7fae86"/><path d="M60 92h7" stroke="#fff" stroke-width="2"/>', ball: '<g transform="translate(84 84)"><circle r="10" fill="#fff" stroke="#1c2c5b" stroke-width="1.5"/><path d="M0-4l4 3-1.5 4.5h-5L-4-1z" fill="#1c2c5b"/></g>' };
let MSN = 0;
const MFACE = (mouth = true) => '<circle cx="40" cy="56" r="3.4" fill="var(--ink)"/><circle cx="60" cy="56" r="3.4" fill="var(--ink)"/><circle cx="41.2" cy="54.8" r="1.1" fill="#fff"/><circle cx="61.2" cy="54.8" r="1.1" fill="#fff"/>' + (mouth ? '<path d="M47 63q3 3 6 0" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/><path d="M50 61v2" stroke="var(--ink)" stroke-width="2"/>' : '');
const SPECIES = {
  cat: () => '<path d="M27 45C23 31 25 22 29 19c6 3 12 8 16 15z" fill="var(--pri)" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round"/><path d="M73 45c4-14 2-23-2-26-6 3-12 8-16 15z" fill="var(--pri)" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round"/><path d="M30 38c-1-7 0-11 1-13 3 2 6 5 8 8zM70 38c1-7 0-11-1-13-3 2-6 5-8 8z" fill="#fff" opacity=".55"/>' +
    '<ellipse cx="50" cy="58" rx="30" ry="27" fill="var(--pri)" stroke="var(--ink)" stroke-width="2"/><ellipse cx="50" cy="67" rx="15" ry="11" fill="#fff" opacity=".7"/>' + MFACE() +
    '<path d="M23 61h-10M23 65l-9 3M77 61h10M77 65l9 3" stroke="var(--ink)" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="33" cy="64" rx="4.5" ry="2.6" fill="#ff8fab" opacity=".45"/><ellipse cx="67" cy="64" rx="4.5" ry="2.6" fill="#ff8fab" opacity=".45"/>',
  tiger: () => '<circle cx="29" cy="37" r="9.5" fill="#F7A94F" stroke="var(--ink)" stroke-width="2"/><circle cx="71" cy="37" r="9.5" fill="#F7A94F" stroke="var(--ink)" stroke-width="2"/><circle cx="29" cy="37" r="4.5" fill="#FFE8CC"/><circle cx="71" cy="37" r="4.5" fill="#FFE8CC"/>' +
    '<ellipse cx="50" cy="58" rx="30" ry="27" fill="#F7A94F" stroke="var(--ink)" stroke-width="2"/>' +
    '<g stroke="#4a3328" stroke-width="2.6" stroke-linecap="round" fill="none"><path d="M50 32v7M43 33.5l1.5 6M57 33.5l-1.5 6M21 52h7M21.5 58h6M79 52h-7M78.5 58h-6"/></g>' +
    '<ellipse cx="50" cy="67" rx="14" ry="10" fill="#FFF7EE"/><ellipse cx="38" cy="48" rx="6" ry="3" fill="#FFF7EE" opacity=".9"/><ellipse cx="62" cy="48" rx="6" ry="3" fill="#FFF7EE" opacity=".9"/>' + MFACE(false) +
    '<path d="M47 61.5h6l-3 3z" fill="#E8798F" stroke="var(--ink)" stroke-width="1" stroke-linejoin="round"/><path d="M50 64.5v1.5M45.5 67q4.5 3.5 9 0" fill="none" stroke="var(--ink)" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="33" cy="63" rx="4" ry="2.4" fill="#ff8f7a" opacity=".45"/><ellipse cx="67" cy="63" rx="4" ry="2.4" fill="#ff8f7a" opacity=".45"/>',
  goat: () => '<path d="M39 35c-6-9-5-19 4-24M61 35c6-9 5-19-4-24" fill="none" stroke="#B98B5E" stroke-width="5.5" stroke-linecap="round"/><path d="M39 35c-6-9-5-19 4-24M61 35c6-9 5-19-4-24" fill="none" stroke="#E4C49B" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="2 3"/>' +
    '<ellipse cx="19" cy="50" rx="13" ry="6.5" transform="rotate(-18 19 50)" fill="#FFF8EE" stroke="var(--ink)" stroke-width="2"/><ellipse cx="81" cy="50" rx="13" ry="6.5" transform="rotate(18 81 50)" fill="#FFF8EE" stroke="var(--ink)" stroke-width="2"/><ellipse cx="20" cy="50" rx="7" ry="2.8" transform="rotate(-18 20 50)" fill="#F6C1CF"/><ellipse cx="80" cy="50" rx="7" ry="2.8" transform="rotate(18 80 50)" fill="#F6C1CF"/>' +
    '<path d="M44 84q6 14 12 0z" fill="#FFF8EE" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round"/>' +
    '<ellipse cx="50" cy="58" rx="27" ry="28" fill="#FFF8EE" stroke="var(--ink)" stroke-width="2"/><path d="M42 33q4-6 8-1 4-5 8 1" fill="#FFF8EE" stroke="var(--ink)" stroke-width="1.6"/>' +
    '<ellipse cx="50" cy="69" rx="12" ry="8.5" fill="#F7DCCB"/>' + MFACE(false) + '<path d="M46.5 65.5q3.5 2.5 7 0M47 63h6" fill="none" stroke="var(--ink)" stroke-width="1.8" stroke-linecap="round"/><path d="M45 71q5 4 10 0" fill="none" stroke="var(--ink)" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="34" cy="64" rx="4.5" ry="2.6" fill="#ff8fab" opacity=".5"/><ellipse cx="66" cy="64" rx="4.5" ry="2.6" fill="#ff8fab" opacity=".5"/>',
  bunny: () => '<ellipse cx="38" cy="22" rx="7.5" ry="19" transform="rotate(-8 38 22)" fill="#fff" stroke="var(--ink)" stroke-width="2"/><ellipse cx="62" cy="22" rx="7.5" ry="19" transform="rotate(8 62 22)" fill="#fff" stroke="var(--ink)" stroke-width="2"/><ellipse cx="38" cy="23" rx="3.5" ry="13" transform="rotate(-8 38 23)" fill="#F9B8CB"/><ellipse cx="62" cy="23" rx="3.5" ry="13" transform="rotate(8 62 23)" fill="#F9B8CB"/>' +
    '<ellipse cx="50" cy="60" rx="29" ry="25" fill="#fff" stroke="var(--ink)" stroke-width="2"/>' + MFACE(false) + '<path d="M48 61.5h4l-2 2z" fill="#E8798F"/><path d="M50 63.5v2M46.5 66q3.5 2.5 7 0" fill="none" stroke="var(--ink)" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="34" cy="64" rx="5" ry="3" fill="#ff8fab" opacity=".55"/><ellipse cx="66" cy="64" rx="5" ry="3" fill="#ff8fab" opacity=".55"/>',
  panda: () => '<circle cx="29" cy="36" r="10" fill="#3b3240"/><circle cx="71" cy="36" r="10" fill="#3b3240"/><ellipse cx="50" cy="58" rx="30" ry="27" fill="#fff" stroke="var(--ink)" stroke-width="2"/>' +
    '<ellipse cx="39" cy="56" rx="7" ry="9" transform="rotate(25 39 56)" fill="#3b3240"/><ellipse cx="61" cy="56" rx="7" ry="9" transform="rotate(-25 61 56)" fill="#3b3240"/><circle cx="40" cy="56" r="3" fill="#fff"/><circle cx="60" cy="56" r="3" fill="#fff"/><circle cx="40.5" cy="56.5" r="1.6" fill="#3b3240"/><circle cx="60.5" cy="56.5" r="1.6" fill="#3b3240"/>' +
    '<ellipse cx="50" cy="64" rx="4" ry="2.6" fill="#3b3240"/><path d="M46.5 68q3.5 2.5 7 0" fill="none" stroke="var(--ink)" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="31" cy="66" rx="4.5" ry="2.6" fill="#ff8fab" opacity=".5"/><ellipse cx="69" cy="66" rx="4.5" ry="2.6" fill="#ff8fab" opacity=".5"/>',
  butterfly: () => { const n = ++MSN, A = 'bfa' + n, B = 'bfb' + n, Bd = 'bfc' + n;
    const UL = 'M47 50C36 24 16 6 7 16c-7 9 0 27 13 34 9 5 19 6 27 4z', LL = 'M47 60c-10 1-24 8-26 19-2 9 6 14 13 11 8-3 12-14 13-24z';
    const wing = (side) => '<g' + (side ? ' transform="translate(100 0) scale(-1 1)"' : '') + '><path d="' + UL + '" fill="url(#' + A + ')" stroke="var(--ink)" stroke-width="1.8" stroke-linejoin="round"/><path d="' + LL + '" fill="url(#' + B + ')" stroke="var(--ink)" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M45 50C36 33 23 20 14 21c-4 6 1 18 11 24 7 4 14 5 20 5z" fill="#fff" opacity=".28"/><path d="M7 16c-7 9 0 27 13 34" fill="none" stroke="#8E7CC3" stroke-width="2.2" opacity=".45" stroke-linecap="round"/>' + '<g fill="none" stroke="#fff" stroke-width="1" opacity=".75" stroke-linecap="round"><path d="M45 50C34 36 22 22 12 18M45 51C32 44 20 40 11 34M45 52c-10 0-20-1-28-4M46 61c-8 3-15 9-20 16M46 62c-4 6-7 13-9 20"/></g>' +
      '<circle cx="15" cy="24" r="3" fill="#fff" opacity=".9"/><circle cx="11" cy="33" r="2" fill="#fff" opacity=".8"/><circle cx="22" cy="15.5" r="1.6" fill="#fff" opacity=".8"/><circle cx="27" cy="84" r="2.4" fill="#fff" opacity=".85"/><circle cx="23" cy="78" r="1.4" fill="#fff" opacity=".8"/>' +
      '<path d="M18 22q4-6 10-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/></g>';
    return '<defs><linearGradient id="' + A + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB3D9"/><stop offset=".45" stop-color="#D3B4FF"/><stop offset="1" stop-color="#9CCBFF"/></linearGradient>' +
      '<radialGradient id="' + B + '" cx=".75" cy=".2" r="1"><stop offset="0" stop-color="#FFF1A8"/><stop offset=".45" stop-color="#FFB8D6"/><stop offset="1" stop-color="#B79CFF"/></radialGradient>' +
      '<linearGradient id="' + Bd + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8E7CC3"/><stop offset="1" stop-color="#5B4B8A"/></linearGradient></defs>' +
      wing(0) + wing(1) +
      '<path d="M45 40C42 30 38 24 33 22M55 40c3-10 7-16 12-18" fill="none" stroke="var(--ink)" stroke-width="1.6" stroke-linecap="round"/><circle cx="32.5" cy="21.5" r="2.6" fill="#FFB3D9" stroke="var(--ink)" stroke-width="1.2"/><circle cx="67.5" cy="21.5" r="2.6" fill="#9CCBFF" stroke="var(--ink)" stroke-width="1.2"/>' +
      '<ellipse cx="50" cy="80" rx="6" ry="12" fill="url(#' + Bd + ')" stroke="var(--ink)" stroke-width="1.6"/><path d="M45 78h10M45.5 83h9" stroke="#C9B8F0" stroke-width="1.4"/>' +
      '<circle cx="50" cy="56" r="19.5" fill="#FFF6FA" stroke="var(--ink)" stroke-width="2"/>' + MFACE(false) + '<path d="M47 63q3 2.6 6 0" fill="none" stroke="var(--ink)" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="36.5" cy="62" rx="3.6" ry="2.2" fill="#ff8fab" opacity=".55"/><ellipse cx="63.5" cy="62" rx="3.6" ry="2.2" fill="#ff8fab" opacity=".55"/>'; }
};
function mascot(size = 96, eqo) {
  const e = eqo || (S ? S.eq : { hat: 'none', acc: 'none' }); const sp = SPECIES[e.sp || (S && S.eq.sp) || 'cat'] || SPECIES.cat;
  return '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '" class="mascot" aria-hidden="true">' + sp() + (ACCS[e.acc] || '') + (HATS[e.hat] || '') + '</svg>';
}

// Simple chart for Writing Task 1
function chartSVG(ch) {
  if (ch.type === 'process') return '<ol class="flow">' + ch.steps.map((s, i) => '<li><span>' + (i + 1) + '</span>' + esc(s) + '</li>').join('') + '</ol>';
  if (ch.type === 'table') return '<div class="scroll"><table class="dtable"><thead><tr><th></th>' + ch.cats.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>' + ch.series.map(r => '<tr><th>' + esc(r[0]) + '</th>' + r[1].map(v => '<td>' + v + esc(ch.unit) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
  const W = 520, H = 280, pad = 40, cols = ['var(--pri)', 'var(--sup)', 'var(--acc)', '#b9a8ef'];
  const max = Math.ceil(Math.max(...ch.series.flatMap(s => s[1])) / 10) * 10 || 10;
  const x0 = pad, y0 = H - 34, cw = (W - pad - 10) / ch.cats.length;
  let g = '';
  for (let v = 0; v <= max; v += max / 5) { const y = y0 - (v / max) * (y0 - 20); g += '<line x1="' + x0 + '" x2="' + (W - 10) + '" y1="' + y + '" y2="' + y + '" stroke="var(--line)"/><text x="' + (x0 - 6) + '" y="' + (y + 4) + '" text-anchor="end" font-size="11" fill="var(--muted)">' + v + ch.unit + '</text>'; }
  if (ch.type === 'bar') {
    const bw = cw / (ch.series.length + 1);
    ch.series.forEach((s, si) => s[1].forEach((v, i) => { const h = (v / max) * (y0 - 20); g += '<rect x="' + (x0 + i * cw + bw * 0.5 + si * bw) + '" y="' + (y0 - h) + '" width="' + (bw - 4) + '" height="' + h + '" rx="3" fill="' + cols[si] + '" stroke="var(--ink)" stroke-width=".6"/>'; }));
  } else {
    ch.series.forEach((s, si) => { const pts = s[1].map((v, i) => [x0 + i * cw + cw / 2, y0 - (v / max) * (y0 - 20)]); g += '<polyline fill="none" stroke="' + cols[si] + '" stroke-width="3" points="' + pts.map(p => p.join(',')).join(' ') + '"/>' + pts.map(p => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.5" fill="' + cols[si] + '" stroke="var(--ink)" stroke-width=".6"/>').join(''); });
  }
  ch.cats.forEach((c, i) => g += '<text x="' + (x0 + i * cw + cw / 2) + '" y="' + (y0 + 18) + '" text-anchor="middle" font-size="12" fill="var(--ink)">' + esc(c) + '</text>');
  const leg = ch.series.map((s, si) => '<span><i style="background:' + cols[si] + '"></i>' + esc(s[0]) + '</span>').join('');
  return '<div class="chart"><svg viewBox="0 0 ' + W + ' ' + H + '">' + g + '</svg><div class="legend">' + leg + '</div></div>';
}

// Christmas effects: snowfall + fairy lights (only with the Christmas theme)
function fxUpdate() {
  const on = S && S.eq.skin === 'xmas' && S.fx !== false;
  let fx = document.getElementById('fx'), li = document.getElementById('lights');
  if (!on) { fx && fx.remove(); li && li.remove(); return; }
  if (!fx) {
    fx = document.createElement('div'); fx.id = 'fx'; fx.setAttribute('aria-hidden', 'true');
    let h = ''; for (let i = 0; i < 40; i++) { const sz = 4 + Math.random() * 7; h += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;width:' + sz.toFixed(1) + 'px;height:' + sz.toFixed(1) + 'px;opacity:' + (0.45 + Math.random() * 0.5).toFixed(2) + ';animation-duration:' + (9 + Math.random() * 12).toFixed(1) + 's;animation-delay:-' + (Math.random() * 20).toFixed(1) + 's;--dx:' + (Math.random() * 80 - 40).toFixed(0) + 'px"></i>'; }
    fx.innerHTML = h; document.body.appendChild(fx);
  }
  if (!li) { const top = document.querySelector('.top'); if (top) { li = document.createElement('div'); li.id = 'lights'; li.setAttribute('aria-hidden', 'true'); li.innerHTML = '<i></i>'.repeat(26); top.appendChild(li); } }
}

// ----- Level dictionary (CEFR-J / Octanove) & idioms -----
const DICT = {}, LW = {}, DLOADED = {};
function levelList(l) { if (!LW[l]) LW[l] = String((window.LEVELWORDS || {})[l] || '').split(';').filter(Boolean).map((x, i) => { const [w, p] = x.split('|'); return { w, p, i }; }); return LW[l]; }
const chunkOf = i => Math.floor(i / 500);
async function loadDict(l, ch) { DICT[l] = DICT[l] || {}; const k = 'dict_' + l + '_' + ch; if (DLOADED[k]) return; DLOADED[k] = true; const d = await Store.get(k); if (d && d.m) Object.assign(DICT[l], d.m); }
function saveDictChunk(l, ch) { const m = {}; levelList(l).forEach(x => { if (chunkOf(x.i) === ch && DICT[l][x.w]) m[x.w] = DICT[l][x.w]; }); Store.set('dict_' + l + '_' + ch, { m }); }
async function ensureDictFor(keys) { const need = new Set(); keys.filter(k => k.startsWith('d:')).forEach(k => { const [l, w] = k.slice(2).split('|'); const it = levelList(l).find(x => x.w === w); if (it) need.add(l + '|' + chunkOf(it.i)); }); await Promise.all([...need].map(x => { const [l, c] = x.split('|'); return loadDict(l, +c); })); }
function dictWord(l, w) { const m = DICT[l][w] || ['', '']; const it = levelList(l).find(x => x.w === w) || { p: '' }; return { w, pos: it.p, vi: m[0], def: m[0], ex: m[1] || '', col: '', syn: '', key: 'd:' + l + '|' + w }; }
function idiomWords(T) { return T.i.map((x, i) => ({ w: x[0], pos: 'idiom', vi: x[1], def: x[1], ex: x[2], col: '', syn: '', key: 'i:' + T.id + '|' + i })); }
function idiomQ(T, ix, alt) {
  const it = T.i[ix]; const others = shuffle(T.i.filter((_, j) => j !== ix)).slice(0, 3);
  if (alt) { const o = shuffle([it[0], ...others.map(x => x[0])]); return { k: 'mcq', p: tx('Thành ngữ nào có nghĩa "', 'Which idiom means "') + it[1] + '"?', o, a: o.indexOf(it[0]), key: 'i:' + T.id + '|' + ix, e: it[0] + ' – ' + it[1] + '. VD: ' + it[2] }; }
  const o = shuffle([it[1], ...others.map(x => x[1])]); return { k: 'mcq', p: tx('"' + it[0] + '" nghĩa là gì?', 'What does "' + it[0] + '" mean?'), o, a: o.indexOf(it[1]), key: 'i:' + T.id + '|' + ix, e: it[0] + ' – ' + it[1] + '. VD: ' + it[2] };
}
