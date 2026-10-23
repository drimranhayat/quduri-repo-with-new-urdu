(function () {
'use strict';
const D = /*DATA*/;
const PLAN = /*PLAN*/;
const VOC = /*VOCAB*/;
const QA = /*QA*/;
const MCQ = /*MCQ*/;
const KEY = 'quduri-matn-v1';
const app = document.getElementById('app');
const jump = y => window.scrollTo({ top: y, behavior: 'instant' });
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ad = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const strip = s => s.replace(/[\u064B-\u0652\u0670\u0640]/g, '');
const norm = s => s.replace(/[ً-ْٰـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
const FS = [0.85, 1, 1.15, 1.3, 1.5];
const P = [0.25, 0.45, 0.7];
const IM = { h: ['أبو حنيفة', 'ح'], y: ['أبو يوسف', 'ي'], m: ['محمد', 'م'], z: ['زفر', 'ز'] };
const STOP = new Set(['في', 'من', 'على', 'الى', 'إلى', 'عن', 'ما', 'لا', 'أو', 'ثم', 'إن', 'إذا', 'لم', 'أن', 'كل', 'هو', 'التي', 'الذي', 'قد', 'لو', 'بعد', 'قبل', 'ذلك', 'مع', 'هذا', 'حتى', 'إلا', 'قال', 'عند', 'وهو', 'كان', 'ولا']);
const RC = { must: 'واجب / فرض', sun: 'سنة / مستحب / أفضل', ok: 'جائز / مباح', mak: 'مكروه', bad: 'ممنوع / مفسد / ناقض' };
const rn = w => norm(w).replace(/[^ء-ي]/g, '');
const RW = {}; const NUMS = new Set();
Object.entries({ must: 'فرض واجب واجبة يجب تجب وجب لزمه لزم يلزمه تلزمه يلزم تلزم افترض فرضا واجبا', sun: 'سنة مسنون يستحب مستحب أفضل أولى ينبغي يندب مندوب سنن', mak: 'يكره تكره مكروه كره مكروها يكرهه', ok: 'جاز يجوز تجوز جائز يباح مباح جازت', bad: 'يفسد تفسد أفسد فسد فسدت ينقض تنقض نقض يبطل تبطل بطل بطلت' }).forEach(([c, l]) => l.split(' ').forEach(w => { RW[rn(w)] = c; }));
'واحد واحدة اثنان اثنين اثنتين اثنتي ثلاث ثلاثة ثلاثا أربع أربعة أربعا خمس خمسة خمسا ست ستة ستا سبع سبعة سبعا ثمان ثمانية تسع تسعة عشر عشرة عشرا عشرين ثلاثين أربعين خمسين ستين سبعين ثمانين تسعين مائة مئة مائتين مئتين ألف نصف ثلث ثلثا ثلثي ربع ركعتين مرتين مرة'.split(' ').forEach(w => NUMS.add(rn(w)));
const NEGBAD = new Set(['يجوز', 'تجوز', 'يصح', 'تصح', 'يحل', 'تحل', 'يجزئ', 'تجزئ', 'يجزئه', 'تجزئه', 'يجزيه', 'تجزيه', 'يقبل', 'تقبل', 'يجز', 'تجز', 'يجزئهما'].map(rn));
const NEGOK = new Set(['يكره', 'تكره', 'يفسد', 'تفسد', 'ينقض', 'تنقض', 'يبطل', 'تبطل', 'يجب', 'تجب', 'يلزم', 'تلزم', 'يلزمه', 'تلزمه', 'يجبر'].map(rn));
const META = [
  null,
  { du: 'وضو، غسل، پانی اور کنویں؛ پھر تیمم، موزوں پر مسح، حیض اور نجاستیں۔', en: 'Kitab al-Tahara · Purification', d: 'الوضوء والغسل والمياه والآبار، ثم التيمم والمسح على الخفين والحيض والأنجاس.' },
  { du: 'اوقات، اذان، شرائط اور نماز کا طریقہ؛ پھر سہو، تلاوت، سفر، جمعہ، عیدین اور جنازہ۔', en: 'Kitab al-Salat · Prayer', d: 'المواقيت والأذان والشروط وصفة الصلاة، ثم السهو والتلاوة والسفر والجمعة والعيدين والجنائز.' },
  { du: 'وجوب کی شرائط؛ مویشی، سونا چاندی، سامانِ تجارت اور پیداوار کی زکوٰۃ؛ مصارفِ زکوٰۃ اور صدقۂ فطر۔', en: 'Kitab al-Zakat · Obligatory charity', d: 'شروط الوجوب وزكاة الأنعام والنقدين والعروض والزروع، ومصارف الزكاة وصدقة الفطر.' },
  { du: 'چاند دیکھنا اور روزہ توڑنے والی چیزیں؛ پھر قضا، کفارہ، عذر اور اعتکاف۔', en: 'Kitab al-Sawm · Fasting', d: 'رؤية الهلال وما يفسد الصوم، ثم القضاء والكفارة والأعذار، وباب الاعتكاف.' },
  { du: 'مواقیت، احرام اور مناسک؛ قران و تمتع؛ احرام کی جنایات، احصار اور ہدی۔', en: 'Kitab al-Hajj · Pilgrimage', d: 'المواقيت والإحرام والمناسك، ثم القران والتمتع، وجنايات المحرم والإحصار والهدي.' },
  { du: "بیع کا انعقاد اور لزوم؛ خیارِ شرط، رؤیت اور عیب؛ بیعِ فاسد، اقالہ، مرابحہ، ربا، سلم اور صرف۔", en: "Kitab al-Buyu · Sales", d: "انعقاد البيع ولزومه، الخيارات، البيع الفاسد، الإقالة، المرابحة، الربا، السلم والصرف." },
  { du: "رہن کا انعقاد، قبضہ، ضمان اور راہن و مرتہن کے تصرفات۔", en: "Kitab al-Rahn · Pledge", d: "انعقاد الرهن وقبضه وضمانه، وتصرفات الراهن والمرتهن." },
  { du: "حجر کے اسباب؛ سفیہ، بلوغ اور مقروض کا حجر۔", en: "Kitab al-Hajr · Interdiction", d: "أسباب الحجر، السفيه، البلوغ، الحجر بسبب الدين." },
  { du: "اقرار کے احکام؛ مجہول، استثناء، حمل، مریض اور نسب کا اقرار۔", en: "Kitab al-Iqrar · Acknowledgement", d: "أحكام الإقرار بالمال، والاستثناء، وإقرار المريض والنسب." },
  { du: "اجارہ کی شرائط، اجرت، اجیر، حبس اور فسخ کے اسباب۔", en: "Kitab al-Ijarah · Lease", d: "أحكام الإجارة وشروطها والأجرة والأجير وفسخها." },
  { du: "شفعہ؛ شفعاء کی ترتیب، طلب، خصومت اور مبطلات۔", en: "Kitab al-Shufah · Pre-emption", d: "من تجب له الشفعة وطلبها والخصومة وما يسقطها." },
  { du: "شرکت کی اقسام؛ املاک، مفاوضہ، عنان، صنائع اور وجوہ۔", en: "Kitab al-Sharikah · Partnership", d: "أنواع الشركة: الأملاك والمفاوضة والعنان والصنائع والوجوه." },
  { du: "مضاربت؛ شرائط، مضارب کا تصرف، عزل اور مال کی ہلاکت۔", en: "Kitab al-Mudarabah · Profit-sharing", d: "شروط المضاربة وتصرف المضارب والعزل والهلاك." },
  { du: "وکالت؛ جواز، اہلیت، عقود کے حقوق، عزل، بیع و شراء اور خصومت۔", en: "Kitab al-Wakalah · Agency", d: "شروط الوكالة وحقوق العقد وعزل الوكيل وحدود تصرفه." },
  { du: "کفالت؛ جان کی اور مال کی کفالت اور اس کے احکام۔", en: "Kitab al-Kafalah · Suretyship", d: "الكفالة بالنفس وبالمال وأحكامها." },
  { du: "حوالہ؛ شرائط، توی اور اختلاف کے احکام۔", en: "Kitab al-Hawalah · Transfer of Debt", d: "أحكام الحوالة والتوى والاختلاف." },
  { du: "صلح؛ اقسام، دین پر صلح، وکالت اور ترکے میں صلح۔", en: "Kitab al-Sulh · Settlement", d: "أقسام الصلح وأحكامه والصلح عن الدين والتركة." },
  { du: "ہبہ کا انعقاد، قبضہ، رجوع کے موانع، عمریٰ، رقبیٰ اور صدقہ۔", en: "Kitab al-Hibah · Gift", d: "انعقاد الهبة والقبض والرجوع والعمرى والصدقة." },
  { du: "وقف کی شرائط، ملکیت کا زوال، تعمیر، مسجد اور سبیل۔", en: "Kitab al-Waqf · Endowment", d: "أحكام الوقف وزوال الملك والعمارة والمسجد." },
  { du: "غصب کا ضمان، مغصوب کا بدلنا، زوائد اور منافع۔", en: "Kitab al-Ghasb · Usurpation", d: "ضمان المغصوب وتغيره وزوائده ومنافعه." },
  { du: "امانت کی حفاظت، ضمان، ملانا، زیادتی اور متعدد مودِع۔", en: "Kitab al-Wadiah · Deposit", d: "أحكام الوديعة والحفظ والخلط والتعدي." },
  { du: "عاریت کے صیغے، رجوع، ضمان، تصرف اور واپسی کا خرچ۔", en: "Kitab al-Ariyah · Loan for Use", d: "أحكام العارية والرجوع والضمان." },
  { du: "لقیط اور لقطہ؛ نسب، نفقہ، اعلان اور صدقہ۔", en: "Kitab al-Laqit · Foundling", d: "أحكام اللقيط واللقطة." },
  { du: "خنثیٰ؛ جنس کی پہچان، علامات، نماز اور میراث۔", en: "Kitab al-Khuntha · Intersex", d: "أحكام الخنثى وعلاماته وميراثه." },
  { du: "مفقود؛ مال کی حفاظت، بیوی اور موت کا حکم۔", en: "Kitab al-Mafqud · The Missing Person", d: "أحكام المفقود في ماله وزوجته وموته." },
  { du: "بھگوڑے غلام کو لوٹانے کا انعام اور احکام۔", en: "Kitab al-Ibaq · The Runaway Slave", d: "أحكام رد الآبق والجعل." },
  { du: "بنجر زمین کو آباد کرنا، ملکیت اور کنویں، چشمے اور نہر کا حریم۔", en: "Kitab Ihya al-Mawat · Revival of Barren Land", d: "أحكام إحياء الموات وحريم البئر والعين والنهر." },
  { du: "مأذون غلام؛ اجازت، حدود، قرضے، پابندی اور مالک سے لین دین۔", en: "Kitab al-Ma'dhun · Authorised Slave Trader", d: "أحكام المأذون في التجارة وديونه والحجر عليه." },
  { du: "مزارعت اور مساقات؛ شرائط، فساد اور اجرتِ مثل۔", en: "Kitab al-Muzara'ah · Sharecropping", d: "أحكام المزارعة والمساقاة." },
  { du: "نکاح؛ انعقاد، ولایت، کفاءت، مہر، رقیق، فاسد نکاح، عیوب، اختلافِ دین، ارتداد اور قسم۔", en: "Kitab al-Nikah · Marriage", d: "أحكام النكاح: العقد والمحرمات والولاية والكفاءة والمهر والفرق والقسم." },
  { du: "رضاع؛ مدت، حرمت، لبنِ فحل، دودھ کی آمیزش اور گواہی۔", en: "Kitab al-Rada' · Fosterage", d: "أحكام الرضاع والمدة والتحريم." },
  { du: "طلاق؛ اقسام، صریح و کنایہ، تعلیق، تفویض، رجعت اور حلالہ۔", en: "Kitab al-Talaq · Divorce", d: "أنواع الطلاق وصريحه وكناياته وتعليقه والرجعة والتحليل." },
  { du: "ایلاء اور خلع؛ حکم، فیء، قسم اور بدلِ خلع۔", en: "Kitab al-Ila' · Vow of Abstinence", d: "أحكام الإيلاء والخلع والمبارأة." },
  { du: "ظہار، لعان اور عدت؛ کفارہ، لعان کا طریقہ، عدت کی اقسام، سوگ اور ثبوتِ نسب۔", en: "Kitab al-Zihar · Zihar, Li'an & Iddah", d: "أحكام الظهار وكفارته واللعان والعدة والنسب." },
  { du: "نفقات اور حضانت؛ بیوی، اولاد، رشتہ دار، غلام اور پرورش کی ترتیب۔", en: "Kitab al-Nafaqat · Maintenance & Custody", d: "أحكام النفقات والحضانة." },
  { du: "عتاق؛ الفاظ، سعایہ، تدبیر اور استیلاد۔", en: "Kitab al-Itaq · Manumission", d: "أحكام العتق والتدبير والاستيلاد." },
  { du: "مکاتب؛ کتابت، عجز، موت، فاسد کتابت اور ام ولد و مدبر کی کتابت۔", en: "Kitab al-Mukatab · Contract Manumission", d: "أحكام الكتابة." },
  { du: "ولاء؛ ولاءِ عتاقہ، ولاءِ موالات، عصبہ اور عورتوں کی ولاء۔", en: "Kitab al-Wala' · Patronage", d: "أحكام الولاء." },
  { du: "جنایات؛ قتل کی اقسام، قصاص، اطراف، صلح اور اجتماعِ قاتلین۔", en: "Kitab al-Jinayat · Homicide & Qisas", d: "أنواع القتل والقصاص." },
  { du: "دیات؛ دیت کی مقداریں، اعضا و شجاج، ضمان، قسامہ اور عاقلہ۔", en: "Kitab al-Diyat · Blood Money", d: "أحكام الدية والأروش والقسامة والمعاقل." },
  { du: "حدود؛ زنا، شراب، قذف اور تعزیر۔", en: "Kitab al-Hudud · Prescribed Punishments", d: "أحكام حد الزنا والشرب والقذف والتعزير." },
  { du: "سرقہ؛ نصاب، حرز، ہاتھ کاٹنا اور ڈاکہ زنی۔", en: "Kitab al-Sariqah · Theft", d: "أحكام السرقة وقطع الطريق." },
  { du: "اشربہ؛ حرام و حلال مشروبات اور شراب کا سرکہ۔", en: "Kitab al-Ashribah · Beverages", d: "أحكام الأشربة المحرمة والمباحة." },
  { du: "شکار اور ذبائح؛ شکاری جانور، تیر، شرائطِ ذبح، حلال و حرام جانور۔", en: "Kitab al-Sayd wal-Dhaba'ih · Hunting & Slaughter", d: "أحكام الصيد والذبائح وما يحل أكله." },
  { du: "اضحیہ؛ وجوب، وقت، جانور کے عیوب اور گوشت کے احکام۔", en: "Kitab al-Udhiyah · Sacrifice", d: "أحكام الأضحية." },
  { du: "ایمان؛ قسم کی اقسام، الفاظ، کفارہ، نذر اور حنث کے مسائل۔", en: "Kitab al-Aiman · Oaths", d: "أحكام اليمين والكفارة والنذر." },
  { du: "دعویٰ؛ مدعی، قسم، تعارضِ بینات، تحالف اور نسب کے دعوے۔", en: "Kitab al-Da'wa · Claims", d: "أحكام الدعوى والبينات والتحالف." }
];

/* ---------- state ---------- */
let S = { view: 'ar', vf: 'all', mq: {}, mf: 'all', cb: {}, cp: {}, vm: {}, uf: 'jn', ufSet: 0, tk: true, srs: {}, bm: {}, fs: 1, mode: 'read', lvl: 1, theme: 'auto', khilaf: false, last: null, rc: true, day: { d: 0, n: 0 }, st: { last: 0, n: 0 } };
try { const r = localStorage.getItem(KEY); if (r) Object.assign(S, JSON.parse(r)); } catch (e) {}
if (!S.ufSet) S.uf = 'jn';
const sd = s => S.tk ? s : strip(s);
const T = s => esc(sd(s));
const dw = x => S.tk ? x.w : x.bare;
const today = () => { const d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 6e4) / 864e5); };
if (S.learned) { Object.keys(S.learned).forEach(id => { if (!S.srs[id]) S.srs[id] = { b: 1, d: today() }; }); delete S.learned; }
const INT = [0, 1, 3, 7, 16, 35], GOAL = 10;
const isL = id => !!S.srs[id] && S.srs[id].b >= 1;
const isDue = id => !!S.srs[id] && S.srs[id].d <= today();
function grade(id, g) {
  const t = today(), c = S.srs[id] || { b: 0, d: t };
  if (g === 0) { c.b = 0; c.d = t; }
  else if (g === 1) { c.b = Math.max(1, c.b); c.d = t + 1; }
  else { c.b = Math.min(5, c.b + 1); c.d = t + INT[c.b]; }
  S.srs[id] = c;
  if (g > 0) {
    if (S.day.d !== t) S.day = { d: t, n: 0 };
    S.day.n++;
    if (S.st.last !== t) { S.st = { last: t, n: S.st.last === t - 1 ? S.st.n + 1 : 1 }; }
  }
  save();
}
const doneToday = () => S.day.d === today() ? S.day.n : 0;
const streak = () => { const t = today(); return (S.st.last === t || S.st.last === t - 1) ? S.st.n : 0; };
let saveT = 0;
const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }, 150); };
let cur = 0, revealed = false, io = null, fc = null, qz = null;

/* ---------- text analysis ---------- */
function analyze(text) {
  const raw = text.split(/\s+/).filter(Boolean);
  let inAy = false, inHa = false;
  const out = [];
  for (const w0 of raw) {
    const o = { w: w0, bare: strip(w0), ay: false, ha: false, im: null, gap: false };
    if (w0 === '…') { o.gap = true; out.push(o); continue; }
    if (w0.includes('﴿')) inAy = true;
    if (w0.startsWith('[')) inHa = true;
    o.ay = inAy; o.ha = inHa;
    if (w0.includes('﴾')) inAy = false;
    if (/\]\W*$/.test(w0)) inHa = false;
    o.w = w0.replace(/^\[/, '').replace(/\]([^\]]*)$/, '$1');
    o.bare = strip(o.w);
    out.push(o);
  }
  for (let i = 0; i < out.length; i++) {
    const b = out[i].bare.replace(/[:،.]/g, '').replace(/^و/, '');
    if ((b === 'أبو' || b === 'أبي') && out[i + 1]) {
      const n = out[i + 1].bare.replace(/[:،.]/g, '');
      if (n === 'حنيفة') { out[i].im = out[i + 1].im = 'h'; i++; continue; }
      if (n === 'يوسف') { out[i].im = out[i + 1].im = 'y'; i++; continue; }
    }
    if (b === 'محمد') out[i].im = 'm';
    else if (b === 'زفر') out[i].im = 'z';
  }
  return out;
}
function tagRules(t, k) {
  const core = x => rn(x.w).replace(/^[وف]/, '');
  for (let i = 0; i < t.length; i++) {
    const x = t[i]; if (x.gap || x.ay || x.ha || x.im) continue;
    const c = core(x), c2 = c.replace(/^ال/, '');
    const prev = i ? t[i - 1] : null, pc = prev ? core(prev) : '';
    if ((pc === 'لا' || pc === 'لم') && !prev.ay) {
      if (NEGBAD.has(c)) { x.r = prev.r = 'bad'; prev.rp = 1; continue; }
      if (NEGOK.has(c)) { x.r = prev.r = 'ok'; prev.rp = 1; continue; }
    }
    if (pc === 'لا' && c === rn('بأس')) { x.r = prev.r = 'ok'; prev.rp = 1; continue; }
    const r = RW[c] || RW[c2];
    if (r && !(k === 3 && /^سنه$/.test(c2))) { x.r = r; continue; }
    const raw = rn(x.w);
    for (let j = 0; j <= 4 && j < raw.length - 1; j++) {
      if (NUMS.has(raw.slice(j))) {
        const pre = raw.slice(0, j);
        if (j === 0 || /^(?:و|ف|ب|ل|ك|ال|وال|بال|لل|وب|ول|فال|فب)$/.test(pre)) { x.n = 1; break; }
      }
    }
  }
}
function prep(m) {
  const t = analyze(m.text); m.t = t; tagRules(t, m.k);
  const cuts = [0];
  for (let i = 1; i < t.length; i++) {
    const b = t[i].bare.replace(/[:،.]/g, '').replace(/^و/, '');
    if (b === 'قال' && t[i + 1] && t[i + 1].im) cuts.push(i);
  }
  cuts.push(t.length);
  m.segs = [];
  for (let i = 0; i < cuts.length - 1; i++) m.segs.push([cuts[i], cuts[i + 1]]);
  m.term = null; m.ts = 0;
  const first = t[0] ? t[0].bare.replace(/^و/, '') : '';
  if (first !== 'قال') {
    for (let k = 0; k < 3 && k < m.segs[0][1] - 1; k++) {
      if (t[k].im) break;
      if (t[k].bare.endsWith(':')) { m.term = t.slice(0, k + 1).map(x => x.w).join(' ').replace(/:$/, ''); m.ts = k + 1; break; }
    }
  }
  m.imams = Array.from(new Set(t.filter(x => x.im).map(x => x.im)));
  m.khilaf = m.imams.length > 0;
  m.nt = norm(m.text);
}
let nK = 0;
D.forEach((K, ki) => {
  K.n = ki + 1; K.ms = []; let mi = 0;
  const pl = PLAN[K.n];
  K.babs.forEach((B, bi) => {
    B.id = 'k' + K.n + '-b' + bi; B.ms = []; B.k = K.n; B.i = bi; B.map = pl.maps[bi] || ''; B.fs = []; B.rc = { must: 0, sun: 0, ok: 0, mak: 0, bad: 0, n: 0 };
    B.items.forEach(it => {
      if (it[0] === 'm') {
        mi++;
        const m = { id: 'k' + K.n + '-m' + mi, k: K.n, no: mi, bi, text: it[1], ur: it[3] };
        prep(m); it[2] = m; K.ms.push(m); B.ms.push(m);
        m.t.forEach(x => { if (x.r && !x.rp) B.rc[x.r]++; if (x.n) B.rc.n++; });
      } else if (it[0] === 'f') { it[2] = B.id + '-f' + B.fs.length; B.fs.push({ id: it[2], t: it[1] }); }
    });
    B.pages = []; {
      let st = 0, cnt = 0;
      B.items.forEach((it, x) => {
        const pv = B.items[x - 1];
        if (x > st && ((it[0] === 'f' && cnt >= 4) || (it[0] === 'm' && cnt >= 8 && pv && pv[0] === 'm'))) { B.pages.push([st, x]); st = x; cnt = 0; }
        if (it[0] === 'm') cnt++;
      });
      B.pages.push([st, B.items.length]);
      const cm = r => B.items.slice(r[0], r[1]).filter(i => i[0] === 'm').length, L = B.pages.length;
      if (L > 1 && cm(B.pages[L - 1]) < 2) { const last = B.pages.pop(); B.pages[L - 2][1] = last[1]; }
    }
    B.fpi = {}; B.pages.forEach((r, pi) => { for (let x = r[0]; x < r[1]; x++) { const it = B.items[x]; if (it[0] === 'm') it[2].pi = pi; else if (it[0] === 'f') B.fpi[it[2]] = pi; } });
  });
  K.parts = pl.parts.map((p, pi) => ({ id: 'k' + K.n + '-p' + pi, i: pi, t: p.t, d: p.d, bs: p.b.map(i => K.babs[i]) }));
  K.parts.forEach(p => p.bs.forEach(B => { B.part = p; }));
  K.flat = []; K.babs.forEach(B => B.pages.forEach((r, pi) => K.flat.push([B.i, pi])));
  K.kh = K.ms.filter(m => m.khilaf).length;
  nK += K.ms.length;
});
const allM = []; D.forEach(K => K.ms.forEach(m => allM.push(m)));
const byId = {}; allM.forEach(m => { byId[m.id] = m; });

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mask(m) {
  const r = rng(hash(m.id) + S.lvl * 7919), p = P[S.lvl];
  return m.t.map((x, i) => {
    const v = r();
    if (i <= m.ts || x.gap || x.im) return false;
    const b = x.w.replace(/[^ء-ي]/g, '').replace(/^[وف]/, '');
    if (b.length < 3 || STOP.has(b)) return false;
    return v < ((x.r || x.n) ? Math.min(.95, p * 2.1 + .1) : p);
  });
}

/* ---------- icons ---------- */
const ic = (d, f) => '<svg viewBox="0 0 24 24" fill="' + (f || 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
const I = {
  search: ic('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  theme: ic('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>'),
  check: ic('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  bm: ic('<path d="M6 4h12v17l-6-4-6 4z"/>'),
  eye: ic('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  gear: ic('<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>'),
  menu: ic('<path d="M4 6h16M4 12h16M4 18h16"/>'),
  list: ic('<path d="M4 6h16M4 12h16M4 18h10"/>'),
  cards: ic('<rect x="3" y="7" width="14" height="12" rx="2"/><path d="M7 4h12a2 2 0 0 1 2 2v9"/>'),
  quiz: ic('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8M12 17h.01"/>'),
  close: ic('<path d="M6 6l12 12M18 6 6 18"/>'),
  star: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="7" y="7" width="18" height="18"/><rect x="7" y="7" width="18" height="18" transform="rotate(45 16 16)"/></svg>'
};

/* ---------- rendering pieces ---------- */
function piece(m, x, i) {
  if (x.gap) return '<span class="gap" title="موضع ناقص في نسخة الشاملة، يُراجع على المطبوع">…</span>';
  const w = esc(dw(x));
  if (m.mk && m.mk[i]) return '<button class="bl" data-a="blank" data-w="' + w + '" style="--n:' + rn(x.w).length + '" aria-label="كلمة مخفية، اضغط لإظهارها"></button>';
  if (x.im) return '<span class="im ' + x.im + '">' + w + '</span>';
  if (x.r) return '<span class="r ' + x.r + '" title="' + RC[x.r] + '">' + w + '</span>';
  if (x.n) return '<span class="nm">' + w + '</span>';
  return w;
}
function segHtml(m, from, to) {
  let html = '', cur2 = '';
  for (let i = from; i < to; i++) {
    const x = m.t[i];
    const c = x.ay ? 'ay' : x.ha ? 'ha' : '';
    if (c !== cur2) { if (cur2) html += '</span>'; if (c) html += '<span class="' + c + '">'; cur2 = c; }
    html += piece(m, x, i) + ' ';
  }
  if (cur2) html += '</span>';
  return html;
}
const shuf = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const learnedIn = K => K.ms.reduce((a, m) => a + (isL(m.id) ? 1 : 0), 0);
const findBab = id => { const m = /^k(\d)-b(\d+)$/.exec(id); return m ? D[m[1] - 1].babs[+m[2]] : null; };

function mHtml(m, mode) {
  m.mk = (mode === 'mem' && !revealed) ? mask(m) : null;
  const done = isL(m.id), bm = !!S.bm[m.id];
  let h = '<article class="m' + (done ? ' done' : '') + '" id="' + m.id + '" data-id="' + m.id + '"><div class="m-h"><span class="num">' + ad(m.no) + '</span>';
  if (m.term) h += '<span class="term">' + T(m.term) + '</span>';
  if (m.imams.length) h += '<span class="ims">' + m.imams.map(k => '<span class="imc ' + k + '" title="' + IM[k][0] + '">' + IM[k][1] + '</span>').join('') + '</span>';
  h += '<span class="sp"></span>';
  h += '<button class="act bm" data-a="bm" aria-pressed="' + bm + '" aria-label="حفظ للمراجعة لاحقًا">' + I.bm + '</button>';
  h += '<button class="act" data-a="ok" aria-pressed="' + done + '" aria-label="أتقنت هذه المسألة">' + I.check + '</button></div>';
  h += '<div class="mt">' + segHtml(m, m.ts, m.segs[0][1]) + '</div>';
  for (let s = 1; s < m.segs.length; s++) h += '<div class="dis"><div class="mt">' + segHtml(m, m.segs[s][0], m.segs[s][1]) + '</div></div>';
  if (m.ur) h += '<details class="ur-d"><summary>اردو</summary><div class="ut">' + urFmt(m.ur) + '</div></details>';
  return h + '</article>';
}
const RK = ['must', 'sun', 'ok', 'mak', 'bad'];
function rcChips(B) {
  return RK.filter(c => B.rc[c]).map(c => '<span class="rcc ' + c + '"><i></i>' + RC[c].split(' / ')[0] + ' <b>' + ad(B.rc[c]) + '</b></span>').join('') + (B.rc.n ? '<span class="rcc num"><i></i>أعداد <b>' + ad(B.rc.n) + '</b></span>' : '');
}
function fasStrip(B) {
  if (B.fs.length < 3) return '';
  return '<ol class="route" aria-label="مسار الباب">' + B.fs.map((f, i) => '<li><a href="#' + f.id + '"><b>' + ad(i + 1) + '</b><span>' + T(f.t) + '</span></a></li>').join('') + '</ol>';
}
function ovHtml(B) {
  const l = B.ms.filter(m => isL(m.id)).length;
  return '<div class="ov"><p class="map"><span>في هذا الباب</span>' + T(B.map) + '</p>' + fasStrip(B) +
    '<div class="ovm"><div class="rcs">' + rcChips(B) + '</div><div class="ova"><span class="cnt">' + ad(l) + ' / ' + ad(B.ms.length) + ' أُتقنت</span>' +
    '<button class="mini" data-a="babcards" data-b="' + B.id + '">بطاقات الباب</button><button class="mini fill" data-a="quiz" data-b="' + B.id + '">اختبر نفسك</button></div></div></div>';
}
function babHtml(K, B, mode, filt, pi) {
  if (filt && !B.ms.some(m => m.khilaf)) return '';
  let h = '<section class="bab" id="' + B.id + '"><div class="bab-h"><span class="bno">' + ad(B.i + 1) + '</span><h2>' + T(B.t) + '</h2>' + (B.ed ? '<span class="tag">عنوان تنظيمي</span>' : '') + '<span class="meta">' + ad(B.ms.length) + ' مسألة</span><span class="sp"></span><button class="mini" data-a="babok" data-b="' + B.id + '">أتقنت الباب</button></div>';
  if (!filt && !(pi > 0)) h += ovHtml(B);
  const rg = filt ? [0, B.items.length] : B.pages[pi || 0];
  for (const it of B.items.slice(rg[0], rg[1])) {
    if (it[0] === 'm') { if (!filt || it[2].khilaf) h += mHtml(it[2], mode); }
    else if (filt) continue;
    else if (it[0] === 'f') h += '<h3 class="fasl" id="' + it[2] + '">' + T(it[1]) + '</h3>';
    else if (it[0] === 'l') h += '<div class="lbl">' + T(it[1]) + '</div>';
    else if (it[0] === 'q') h += '<div class="ayah-q">' + T(it[1]) + '</div>';
  }
  return h + '</section>';
}
function partHtml(K, P) {
  const n = P.bs.reduce((a, B) => a + B.ms.length, 0), l = P.bs.reduce((a, B) => a + B.ms.filter(m => isL(m.id)).length, 0);
  return '<div class="part" id="' + P.id + '"><span class="pn">الجزء ' + ad(P.i + 1) + ' من ' + ad(K.parts.length) + '</span><h2>' + T(P.t) + '</h2><p>' + T(P.d) + '</p><div class="pb" title="أُتقنت ' + ad(l) + ' من ' + ad(n) + '"><b style="width:' + (n ? Math.round(l / n * 100) : 0) + '%"></b></div></div>';
}
function legendHtml() {
  return '<div class="lgm"><b>الرموز:</b>' + Object.keys(IM).map(k => '<span style="display:inline-flex;align-items:center;gap:6px"><span class="imc ' + k + '">' + IM[k][1] + '</span>' + IM[k][0] + '</span>').join('') +
    '<span class="vsep"></span>' + RK.map(c => '<span class="mt lgr"><span class="r ' + c + '">' + RC[c].split(' / ')[0] + '</span></span>').join('') + '<span class="mt lgr"><span class="nm">عدد</span></span></div>';
}
function babsHtml(K) {
  const mode = S.mode, filt = S.khilaf;
  let h = legendHtml();
  if (mode === 'mem') h += '<div class="mode-hint"><b>وضع الحفظ</b><span>تُخفى الأحكام والأعداد أولًا لأنها موضع الاسترجاع. اضغط الفراغ لتظهر الكلمة.</span><button data-a="reveal">' + (revealed ? 'أعد الإخفاء' : 'أظهر الكل') + '</button></div>';
  if (filt) h += '<div class="mode-hint"><b>مسائل الخلاف فقط</b><span>' + ad(K.kh) + ' مسألة فيها قول لأحد الأئمة</span><button data-a="khoff">عرض الكل</button></div>';
  let body = '';
  if (!filt) {
    const only = K.babs[curBab(K)], P = K.parts.find(p => p.bs.includes(only));
    const pi = curPg(K);
    body = (P && P.bs[0] === only && pi === 0 ? partHtml(K, P) : '') + babHtml(K, only, mode, filt, pi);
  } else K.parts.forEach(P => {
    const bh = P.bs.map(B => babHtml(K, B, mode, filt)).join('');
    if (bh) body += partHtml(K, P) + bh;
  });
  return h + (body || '<div class="empty">لا توجد مسائل خلاف في هذا الكتاب.</div>');
}
function kmapHtml(K) {
  return '<details class="kmap kmapd"><summary>خريطة الكتاب · الأجزاء والأبواب</summary><div class="pcards">' + K.parts.map(P => {
    const ms = P.bs.reduce((a, B) => a.concat(B.ms), []);
    return '<div class="pcard"><a class="ph" href="#' + P.id + '"><span class="pn2">' + ad(P.i + 1) + '</span><div><h3>' + T(P.t) + '</h3><p>' + T(P.d) + '</p></div></a><ul>' +
      P.bs.map(B => '<li><a href="#' + B.id + '"><span>' + T(B.t) + '</span><small>' + ad(B.ms.length) + '</small></a></li>').join('') + '</ul><div class="pgl"><div class="pgb"><b style="width:' + (ms.length ? Math.round(ms.filter(m => isL(m.id)).length / ms.length * 100) : 0) + '%"></b></div><small>' + ad(ms.filter(m => isL(m.id)).length) + ' / ' + ad(ms.length) + '</small></div></div>';
  }).join('') + '</div></details>';
}

function topHtml() {
  return '<header class="top"><div class="gutter"><div class="wrap"><button class="ibtn" data-a="menu" aria-label="مینیو کھولیں" aria-haspopup="dialog">' + I.menu + '</button><a class="brand" href="#home">' + I.star + '<span class="bn"><b>الحیات علوم اسلامیہ</b><small>مطالعہ فقہ اسلامی: القدوری</small></span></a><span class="sp"></span>' +
    '<button class="ibtn" data-a="search" aria-label="بحث في المتن">' + I.search + '</button>' +
    '<button class="ibtn" data-a="theme" aria-label="تبديل المظهر">' + I.theme + '</button></div></div></header>';
}
function railHtml(n) {
  return '<nav class="rail" aria-label="كتب المتن">' + D.map(K => '<a class="pill k' + K.n + '" href="#k' + K.n + '"' + (K.n === n ? ' aria-current="true"' : '') + '><i></i>' + T(K.title) + '</a>').join('') + '</nav>';
}
function tocHtml(K) {
  return '<div class="toc"><h5>فهرس ' + T(K.title) + '</h5>' + K.parts.map(P => '<a class="tp" href="#' + P.id + '"><span class="pn3">' + ad(P.i + 1) + '</span><span>' + T(P.t) + '</span></a>' +
    P.bs.map(B => '<a href="#' + B.id + '" data-b="' + B.id + '" class="' + (B.ed ? 'ed' : '') + '"><span>' + T(B.t) + '</span><small>' + ad(B.ms.length) + '</small></a>' +
      (B.fs.length > 1 ? B.fs.map(f => '<a class="sb" href="#' + f.id + '"><span>' + T(f.t) + '</span></a>').join('') : '')).join('')).join('') + '</div>';
}
function dockHtml() {
  return '<div class="dock" role="toolbar" aria-label="أدوات الدراسة">' +
    '<button class="tbtn idx" data-a="toc" aria-label="فهرس الأبواب">' + I.list + '<span>الفهرس</span></button>' +
    '<div class="seg"><button data-a="mode" data-v="read" aria-pressed="' + (S.mode === 'read') + '">قراءة</button><button data-a="mode" data-v="mem" aria-pressed="' + (S.mode === 'mem') + '">حفظ</button></div>' +
    '<button class="tbtn" data-a="cards" aria-label="مراجعة بالبطاقات">' + I.cards + '<span>مراجعة</span></button>' +
    '<button class="tbtn" data-a="kquiz" aria-label="اختبار">' + I.quiz + '<span>اختبار</span></button>' +
    '<button class="tbtn" data-a="set" aria-label="الإعدادات">' + I.gear + '</button></div>';
}

/* ---------- views ---------- */
function applyTheme() { const r = document.documentElement; if (S.theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', S.theme); r.setAttribute('data-rc', S.rc ? 'on' : 'off'); }
function applyUf() { document.documentElement.dataset.uf = S.uf; }
function applyFs() { document.documentElement.style.setProperty('--fs', (1.3 * FS[S.fs]).toFixed(3) + 'rem'); }
function closeOverlays() { $$('.scrim,.pop,.fc').forEach(e => e.remove()); fc = null; qz = null; }
function nextBab() { for (const K of D) for (const B of K.babs) if (B.ms.some(m => !isL(m.id))) return B; return null; }
function ringSvg(p, c) { const C = 2 * Math.PI * 18; return '<svg class="ring" viewBox="0 0 44 44" role="img" aria-label="' + ad(Math.round(p * 100)) + '٪"><circle class="tr" cx="22" cy="22" r="18"/><circle class="pg" cx="22" cy="22" r="18" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - Math.min(1, p))).toFixed(1) + '"/><text x="22" y="23">' + (c || ad(Math.round(p * 100)) + '٪') + '</text></svg>'; }

function planHtml() {
  const due = allM.filter(m => isDue(m.id)).length, nb = nextBab(), dn = doneToday(), sk = streak();
  const K = nb ? D[nb.k - 1] : null, pc = Math.min(100, Math.round(dn / GOAL * 100));
  return '<h2 class="sec-t">آج کا منصوبہ</h2><div class="plan2">' +
    '<div class="pl-top2"><div class="goal2"><div class="pgb"><b style="width:' + pc + '%"></b></div><span class="urt">آج کا ہدف: <b>' + ad(dn) + ' / ' + ad(GOAL) + '</b> کارڈ</span></div>' +
    '<div class="strk2"><b>' + ad(sk) + '</b><span class="urt">مسلسل دن</span></div></div>' +
    '<div class="pl-cards">' +
    '<div class="pc c1"><span class="pi">' + I.cards + '</span><h3 class="urt">دہرائی</h3><p class="urt">' + (due ? ad(due) + ' مسائل دہرانے کے منتظر ہیں' : 'ابھی کوئی مسئلہ باقی نہیں') + '</p><button class="pb" data-a="rev">' + (due ? 'دہرائی شروع کریں' : 'آزاد مشق') + '</button></div>' +
    (nb ? '<div class="pc c2"><span class="pi">' + I.list + '</span><h3 class="urt">نیا سبق</h3><p>' + T(K.title) + ' · ' + T(nb.t) + '</p><a class="pb" href="#' + nb.id + '">باب کھولیں</a></div>' +
      '<div class="pc c3"><span class="pi">' + I.quiz + '</span><h3 class="urt">اپنا امتحان لیں</h3><p class="urt">اسی باب سے فوری سوالات</p><button class="pb" data-a="quiz" data-b="' + nb.id + '">آزمائش شروع کریں</button></div>'
      : '<div class="pc c2"><span class="pi">' + I.star + '</span><h3 class="urt">ماشاء اللہ!</h3><p class="urt">آپ نے پورا متن یاد کر لیا — دہرائی جاری رکھیں۔</p><button class="pb" data-a="allquiz">جامع آزمائش</button></div>') +
    '</div></div>';
}
function routeHtml() {
  let h = '<h2 class="sec-t">مسار التعلم</h2><p class="sec-d">ہر کتاب کے لیے پانچ مراحل: پڑھیں ← سمجھیں ← اصطلاحات ← یاد کریں ← آزمائیں۔ نیچے سے کسی بھی مرحلے پر براہِ راست جائیں۔</p><div class="route">';
  D.forEach(K => {
    const l = learnedIn(K), tm = K.ms.length, nv = VOC.filter(v => v.k === K.n), mv = nv.filter(v => S.vm[vk(v)]).length, st = mqStat(K), nq = QA.filter(v => v.k === K.n).length;
    const steps = [['ar', 'المتن', ad(l) + '/' + ad(tm), tm ? l / tm : 0], ['ur', 'اردو', 'ترجمہ', 0], ['vo', 'مفردات', ad(mv) + '/' + ad(nv.length), nv.length ? mv / nv.length : 0], ['qa', 'سوال جواب', ad(nq) + ' سوال', 0], ['mc', 'MCQs', ad(st.a) + '/' + ad(st.n), st.n ? st.a / st.n : 0]];
    const tot = (steps[0][3] + steps[2][3] + steps[4][3]) / 3;
    h += '<div class="rk k' + K.n + '"><a class="rk-h" href="#k' + K.n + '"><h3>' + T(K.title) + '</h3><span class="rk-p">' + ad(Math.round(tot * 100)) + '٪</span></a><div class="pgb"><b style="width:' + Math.round(tot * 100) + '%"></b></div><div class="rk-s">' +
      steps.map((x, i) => '<a href="#k' + K.n + '-v' + x[0] + '"><i>' + ad(i + 1) + '</i><span class="rl">' + x[1] + '</span><small>' + x[2] + '</small>' + (x[3] >= 1 ? '<em>✓</em>' : '') + '</a>').join('') + '</div></div>';
  });
  return h + '</div>';
}
function home() {
  cur = 0; closeOverlays(); app.className = 'k0';
  const totB = D.reduce((a, K) => a + K.babs.length, 0);
  let h = topHtml();
  let cta = '<a class="cta p" href="#k1"><b>تعلم شروع کریں</b><small>کتاب الطہارۃ سے آغاز</small></a>';
  if (S.last && S.last.b) {
    const K = D[S.last.k - 1], B = K && K.babs.find(b => b.id === S.last.b);
    if (B) cta = '<a class="cta p" href="#' + B.id + '"><small>جہاں چھوڑا تھا وہیں سے جاری رکھیں</small><b>' + T(K.title) + ' · ' + T(B.t) + '</b></a>';
  }
  const stats = [[D.length, 'کتابیں'], [totB, 'ابواب'], [nK, 'مسائل'], [VOC.length, 'مفردات'], [QA.length, 'سوال جواب'], [MCQ.length, 'MCQs']];
  h += '<section class="hero land"><div class="gutter"><div class="wrap hero-g"><div class="hero-t"><div class="eyebrow">الحیات علوم اسلامیہ · مطالعہ فقہ اسلامی</div><h1>مختصر القدوري</h1>' +
    '<p class="sub">متن أبي الحسين القدوري (ت ٤٢٨ هـ) في الفقه الحنفي: عربی متن اعراب کے ساتھ، اردو ترجمہ، مفردات، سوال جواب اور MCQs — پڑھیں، سمجھیں، یاد کریں اور آزمائیں۔</p>' +
    '<div class="ctas">' + cta + '<button class="cta s" data-a="search"><b>متن میں تلاش</b></button><button class="cta s" data-a="allquiz"><b>جامع آزمائش</b></button></div></div>' +
    '<div class="hstats" aria-label="مواد کا خلاصہ">' + stats.map(x => '<div class="hs"><b>' + ad(x[0]) + '</b><span>' + x[1] + '</span></div>').join('') + '</div></div></div></section>';
  h += '<div class="gutter"><div class="wrap">';
  const GROUPS = [['عبادات', 'طہارت، نماز، زکوٰۃ، روزہ، حج', 1, 5], ['مالی معاملات', 'خرید و فروخت، رہن، اجارہ، شرکت، مضاربت، وکالت، کفالت، صلح', 6, 17],
    ['امانات و عاریت اور متفرق', 'ہبہ، وقف، غصب، ودیعت، عاریت، لقطہ اور دیگر ابواب', 18, 29], ['نکاح و خاندان', 'نکاح، رضاعت، طلاق، ظہار، نفقہ، عتق، مکاتب، ولاء', 30, 38],
    ['جنایات و حدود', 'قتل، دیت، حدود، چوری، اشربہ', 39, 43], ['ذبائح، قسمیں اور دعویٰ', 'شکار و ذبیحہ، قربانی، قسمیں، دعویٰ', 44, 47],
    ['قضا و شہادت', 'گواہی، آدابِ قاضی، تقسیم', 48, 52], ['سیر، حظر اور وصایا', 'اکراہ، سیر، بغاوت، حظر و اباحت، وصایا', 53, 55], ['میراث', 'فرائض', 56, 99]];
  const lastK = S.last && S.last.k, tile = K => {
    const l = learnedIn(K), pc = K.ms.length ? l / K.ms.length : 0;
    return '<a class="tile k' + K.n + '" href="#k' + K.n + '"><span class="no urt">کتاب ' + ad(K.n) + ' · <span class="en">' + esc(META[K.n].en) + '</span></span><h3>' + T(K.title) + '</h3><p class="urt">' + esc(META[K.n].du) + '</p>' +
      '<div class="ft"><span class="urt">' + ad(K.parts.length) + ' حصے · ' + ad(K.babs.length) + ' ابواب · ' + ad(K.ms.length) + ' مسائل</span>' + ringSvg(pc) + '</div></a>';
  };
  h += '<h2 class="sec-t">اپنی کتاب منتخب کریں</h2>';
  const gl = GROUPS.map((g, gi) => ({ g, gi, ks: D.filter(K => K.n >= g[2] && K.n <= g[3]) })).filter(x => x.ks.length);
  h += '<nav class="gchips" aria-label="گروہ">' + gl.map(x => '<button data-a="gj" data-g="' + x.gi + '">' + x.g[0] + '<b>' + ad(x.ks.length) + '</b></button>').join('') + '</nav>';
  gl.forEach((x, i) => {
    const hasLast = lastK && x.ks.some(K => K.n === lastK), done = x.ks.reduce((a, K) => a + learnedIn(K), 0), tot = x.ks.reduce((a, K) => a + K.ms.length, 0);
    h += '<details class="grp" id="g' + x.gi + '"' + (i === 0 || hasLast ? ' open' : '') + '><summary><span class="gt"><b class="urt">' + x.g[0] + '</b><small class="urt">' + x.g[1] + '</small></span><span class="gc urt">' + ad(x.ks.length) + ' کتابیں · ' + ad(done) + '/' + ad(tot) + '</span></summary><div class="tiles">' + x.ks.map(tile).join('') + '</div></details>';
  });
  h += routeHtml();
  h += planHtml();
  h += '<h2 class="sec-t">سیکھنے کا طریقہ</h2><div class="steps3">' +
    '<div class="st3"><span class="n">۱</span><h4 class="urt">سمجھ کر پڑھیں</h4><p class="urt">پہلے «اس باب میں» کا خلاصہ دیکھیں، پھر مسائل ایک ایک کر کے پڑھیں۔ رنگوں سے حکم اور ائمہ کی رائے پہچانیں۔</p></div>' +
    '<div class="st3"><span class="n">۲</span><h4 class="urt">خود یاد کریں</h4><p class="urt">«حفظ» موڈ میں احکام اور اعداد چھپ جاتے ہیں؛ خود یاد کرنے کی کوشش ہی معلومات کو پکا کرتی ہے۔</p></div>' +
    '<div class="st3"><span class="n">۳</span><h4 class="urt">دہرائیں اور آزمائیں</h4><p class="urt">سوال جواب اور MCQs حل کریں؛ غلط جوابات خود بخود دہرائی میں آ جاتے ہیں۔</p></div></div>' +
    '<h2 class="sec-t">متن کے رنگ</h2><div class="legend">' + Object.keys(IM).map(k => '<span class="lg"><span class="imc ' + k + '">' + IM[k][1] + '</span>' + IM[k][0] + '</span>').join('') + RK.map(c => '<span class="lg mt"><span class="r ' + c + '">' + RC[c].split(' / ')[0] + '</span><small>' + RC[c].split(' / ').slice(1).join(' · ') + '</small></span>').join('') + '<span class="lg mt"><span class="nm">عدد</span><small>الأعداد والنصب</small></span></div>' +
    '<p class="note urt">عربی متن «مختصر القدوری» کے شاملہ لائبریری والے نسخے سے ہے؛ اجزاء، «اس باب میں» کارڈ اور تنظیمی عنوانات سیکھنے کی سہولت کے لیے شامل کیے گئے ہیں۔ احکام کی رنگ بندی خودکار ہے، دلیل لینے سے پہلے اصل مسئلہ دیکھ لیں۔ اعراب، اردو ترجمہ، مفردات، سوال جواب اور MCQs مصنوعی ذہانت کی مدد سے تیار ہوئے ہیں اور کسی مستند عالم سے نظرِ ثانی کے محتاج ہیں۔ آپ کی پیش رفت صرف اسی براؤزر میں محفوظ رہتی ہے۔</p></div></div>';
  app.innerHTML = h; jump(0); document.title = 'الحیات علوم اسلامیہ (مطالعہ فقہ اسلامی: القدوری)';
}

function kitab(n, anchor) {
  vq = null; const K = D[n - 1]; cur = n; closeOverlays(); app.className = 'k' + n; revealed = false;
  const l = learnedIn(K), pc = K.ms.length ? Math.round(l / K.ms.length * 100) : 0;
  let h = topHtml();
  h += '<section class="hero kit"><div class="gutter"><div class="wrap">' + railHtml(n) + '<div class="eyebrow urt">کتاب ' + ad(n) + ' از ' + ad(D.length) + ' · <span class="en">' + esc(META[n].en) + '</span></div><h1>' + T(K.title) + '</h1><p class="sub urt">' + esc(META[n].du) + '</p>' +
    '<div class="chips urt"><span class="chip">' + ad(K.parts.length) + ' حصے</span><span class="chip">' + ad(K.babs.length) + ' ابواب</span><span class="chip">' + ad(K.ms.length) + ' مسائل</span><span class="chip">' + ad(K.kh) + ' اختلافی</span><span class="chip" id="prtxt">یاد: ' + ad(l) + ' / ' + ad(K.ms.length) + '</span></div><div class="bar"><b id="prbar" style="width:' + pc + '%"></b></div></div></div></section>';
  h += '<div class="gutter"><div class="wrap">' + tabsHtml(K) + '</div></div>';
  h += '<div class="gutter"><div class="wrap" id="kmapw">' + (S.view === 'ar' ? kmapHtml(K) : '') + '</div></div>';
  h += '<div class="gutter"><div class="wrap cols"><aside class="side" id="side">' + tocHtml(K) + '</aside><main id="babs" style="min-width:0">' + mainHtml(K) + '</main></div></div>' + dockHtml();
  if (S.view === 'ar') { S.last = { k: n, b: K.babs[curBab(K)].id }; save(); }
  app.innerHTML = h; app.dataset.v = S.view; document.title = strip(K.title) + ' · الحیات علوم اسلامیہ';
  observe(); goAnchor(anchor, true);
}

/* ---------- Urdu + vocabulary tabs ---------- */
const VIEWS = [['ar', 'ع', 'المتن', 'پڑھیں'], ['ur', 'ا', 'اردو', 'سمجھیں'], ['vo', 'م', 'مفردات', 'اصطلاحات'], ['qa', 'س', 'سوال جواب', 'یاد کریں'], ['mc', 'خ', 'MCQs', 'آزمائیں']];
function mqStat(K) {
  const rows = MCQ.filter(r => r.k === K.n); let a = 0, c = 0;
  rows.forEach(r => { const v = S.mq[mqKey(r)]; if (v !== undefined) { a++; c += v; } });
  return { n: rows.length, a, c };
}
function tabsHtml(K) {
  const nv = VOC.filter(v => v.k === K.n).length, nq = QA.filter(v => v.k === K.n).length, st = mqStat(K);
  const sub = { ar: ad(K.ms.length) + ' مسئلہ', ur: 'مکمل ترجمہ', vo: ad(VOC.filter(v => v.k === K.n && S.vm[vk(v)]).length) + '/' + ad(nv), qa: ad(nq) + ' سوال', mc: ad(st.a) + '/' + ad(st.n) };
  return '<div class="vtabs" role="tablist" aria-label="مراحل التعلم">' + VIEWS.map((v, i) =>
    '<button role="tab" class="vt t' + v[0] + '" data-a="view" data-v="' + v[0] + '" aria-selected="' + (S.view === v[0]) + '"><b>' + ad(i + 1) + '</b><span>' + v[2] + '</span><small>' + sub[v[0]] + '</small></button>').join('') + '</div>';
}
function mqKey(r) { return r.k + '-' + r.n + '-' + hash(r.q).toString(36); }
function nextHtml(K) {
  const i = VIEWS.findIndex(v => v[0] === S.view), nx = VIEWS[i + 1];
  if (nx) return '<div class="nextstep"><span>اگلا مرحلہ</span><button data-a="view" data-v="' + nx[0] + '"><b>' + ad(i + 2) + '</b> ' + nx[2] + ' — ' + nx[3] + ' ←</button></div>';
  const NK = D[K.n];
  return '<div class="nextstep"><span>مبارک! یہ کتاب مکمل ہوئی</span>' + (NK ? '<a class="btnl" href="#k' + NK.n + '">اگلی کتاب: ' + T(NK.title) + ' ←</a>' : '<a class="btnl" href="#home">مرکزی صفحہ ←</a>') + '</div>';
}
function curBab(K) {
  let i = S.cb[K.n];
  if (!(i >= 0 && i < K.babs.length)) { i = 0; if (S.last && S.last.k === K.n) { const j = K.babs.findIndex(b => b.id === S.last.b); if (j >= 0) i = j; } }
  return i;
}
function curPg(K) { const B = K.babs[curBab(K)], p = S.cp[K.n]; return (p >= 0 && p < B.pages.length && S.cb[K.n] === B.i) ? p : 0; }
function flatIdx(K) { const b = curBab(K), p = curPg(K); return K.flat.findIndex(f => f[0] === b && f[1] === p); }
function pageNos(K) {
  const B = K.babs[curBab(K)], rg = B.pages[curPg(K)], set = new Set();
  B.items.slice(rg[0], rg[1]).forEach(it => { if (it[0] === 'm') set.add(it[2].no); });
  return set;
}
const PAGED = ['ar', 'ur', 'qa', 'mc'];
const isPaged = () => PAGED.includes(S.view) && !(S.view === 'ar' && S.khilaf);
const babName = (B) => S.view === 'ar' ? T(B.t) : esc(B.tu);
function pagerHtml(K) {
  const fi = flatIdx(K), B = K.babs[curBab(K)], np = B.pages.length;
  return '<div class="bpg" data-p="' + B.i + '-' + curPg(K) + '"><button class="bpb" data-a="bab" data-d="-1" aria-label="پچھلا"' + (fi === 0 ? ' disabled' : '') + '>→</button>' +
    '<button class="bpt" data-a="toc" aria-label="ابواب کی فہرست"><small>باب ' + ad(B.i + 1) + ' / ' + ad(K.babs.length) + (np > 1 ? ' · حصہ ' + ad(curPg(K) + 1) + ' / ' + ad(np) : '') + ' ▾</small><b' + (S.view === 'ar' ? '' : ' class="urt"') + '>' + babName(B) + '</b></button>' +
    '<button class="bpb" data-a="bab" data-d="1" aria-label="اگلا"' + (fi === K.flat.length - 1 ? ' disabled' : '') + '>←</button>' +
    '<span class="bpp"><b style="width:' + Math.round((fi + 1) / K.flat.length * 100) + '%"></b></span></div>';
}
function babNavHtml(K) {
  const fi = flatIdx(K), ar = S.view === 'ar', cb = curBab(K);
  const card = (f, dir, i) => {
    if (!f) return '<span style="flex:1"></span>';
    const B = K.babs[f[0]], same = f[0] === cb, np = B.pages.length;
    const lbl = dir < 0 ? (ar ? 'السابق' : 'پچھلا') : (ar ? 'التالي' : 'اگلا');
    const sub = (same ? (ar ? ' حصہ ' : ' حصہ ') : (ar ? ' باب ' : ' باب ')) + (same ? ad(f[1] + 1) : ad(B.i + 1) + (np > 1 ? (' · حصہ ' + ad(f[1] + 1)) : ''));
    return '<button class="' + (dir < 0 ? 'pv' : 'nx') + '" data-a="bab" data-i="' + i + '"><small>' + (dir < 0 ? '→ ' : '') + lbl + sub + (dir > 0 ? ' ←' : '') + '</small><b' + (ar ? '' : ' class="urt"') + '>' + babName(B) + '</b></button>';
  };
  return '<nav class="bab-nav" aria-label="ابواب">' + card(K.flat[fi - 1], -1, fi - 1) + card(K.flat[fi + 1], 1, fi + 1) + '</nav>';
}
function renderMain() { const K = D[cur - 1]; $('#babs').innerHTML = mainHtml(K); observe(); }
function showPage(fi, quiet) {
  const K = D[cur - 1]; fi = Math.max(0, Math.min(K.flat.length - 1, fi)); const [bi, pi] = K.flat[fi];
  S.cb[K.n] = bi; S.cp[K.n] = pi; S.last = { k: K.n, b: K.babs[bi].id }; save();
  renderMain();
  if (S.view === 'ar') { try { history.replaceState(null, '', '#' + K.babs[bi].id); } catch (e) {} }
  setOn(K.babs[bi].id);
  if (!quiet) { const t = $('#babs'); jump(Math.max(0, t.getBoundingClientRect().top + window.scrollY - 62)); }
}
function mainHtml(K) {
  const pg = isPaged(), last = !pg || flatIdx(K) === K.flat.length - 1;
  return (pg ? pagerHtml(K) : '') + (S.view === 'ur' ? urHtml(K) : S.view === 'vo' ? voHtml(K) : S.view === 'qa' ? qaHtml(K) : S.view === 'mc' ? mcHtml(K) : babsHtml(K)) + (pg ? babNavHtml(K) : '') + (last ? nextHtml(K) : '');
}
const URG = /(^|[\s(\[«،؛:])(جائز نہیں|ناجائز|حرام|باطل|فاسد|کافی نہیں|درست نہیں|واجب نہیں|لازم نہیں|فرض|واجب|سنتِ مؤکدہ|سنت|مستحب|مکروہ|جائز|تین|چار|پانچ|سات|آٹھ|دس|پندرہ|بیس|تیس|چالیس|ساٹھ|سو|ہزار)(?=[\s)\]»،؛:.]|$)/g;
const URI = [['امام ابو حنیفہ رحمہ اللہ', 'h'], ['امام ابو حنیفہ', 'h'], ['امام ابو یوسف', 'y'], ['امام محمد', 'm'], ['امام زفر', 'z'], ['ابو حنیفہ', 'h'], ['ابو یوسف', 'y'], ['زفر', 'z']];
function urFmt(t) {
  let h = esc(t);
  h = h.replace(/\[([^\]]*)\]/g, '<span class="ha">$1</span>');
  h = h.replace(URG, (a, pre, w) => {
    let c = 'ok';
    if (/^(جائز نہیں|ناجائز|حرام|باطل|فاسد|کافی نہیں|درست نہیں)$/.test(w)) c = 'bad';
    else if (/^(فرض|واجب)$/.test(w)) c = 'must';
    else if (/^(سنت|مستحب|سنتِ مؤکدہ)$/.test(w)) c = 'sun';
    else if (w === 'مکروہ') c = 'mak';
    else if (/^(واجب نہیں|لازم نہیں|جائز)$/.test(w)) c = 'ok';
    else return pre + '<span class="nm">' + w + '</span>';
    return pre + '<span class="r ' + c + '">' + w + '</span>';
  });
  URI.forEach(([n, k]) => { h = h.split(n).join('<span class="im ' + k + '">' + n + '</span>'); });
  return h;
}
function urHtml(K) {
  let h = '<div class="urnote"><b>اردو ترجمہ</b><span>یہ ترجمہ آسان فہم اردو میں ہے؛ احکام کے الفاظ رنگ سے نمایاں ہیں۔ عربی متن دیکھنے کے لیے ہر مسئلے کے نیچے «عربی» پر دبائیں۔</span></div>';
  h += legendHtmlUr();
  K.parts.forEach(P => {
    P.bs.forEach(B => {
      if (B !== K.babs[curBab(K)]) return;
      h += '<section class="bab ur" id="' + B.id + '"><div class="bab-h"><span class="bno">' + ad(B.i + 1) + '</span><h2 class="urt">' + esc(B.tu) + '</h2><span class="meta">' + ad(B.ms.length) + ' مسئلے</span></div>';
      const rg = B.pages[curPg(K)];
      for (const it of B.items.slice(rg[0], rg[1])) {
        if (it[0] === 'm') {
          const m = it[2];
          h += '<article class="m ur" id="' + m.id + '"><div class="m-h"><span class="num">' + ad(m.no) + '</span>' +
            (m.imams.length ? '<span class="ims">' + m.imams.map(k => '<span class="imc ' + k + '" title="' + IM[k][0] + '">' + IM[k][1] + '</span>').join('') + '</span>' : '') +
            '<span class="sp"></span></div><div class="ut">' + urFmt(m.ur) + '</div>' +
            '<details class="ar-d"><summary>عربی</summary><div class="mt">' + esc(sd(m.text).replace(/[\[\]]/g, '')) + '</div></details></article>';
        } else if (it[0] === 'f') h += '<h3 class="fasl urt" id="' + it[2] + '">' + esc(it[3]) + '</h3>';
        else if (it[0] === 'l') h += '<div class="lbl urt">' + esc(it[3]) + '</div>';
        else if (it[0] === 'q') h += '<div class="ayah-q urt">' + esc(it[3]) + '</div>';
      }
      h += '</section>';
    });
  });
  return h;
}
function legendHtmlUr() {
  return '<div class="lgm"><b>رنگ:</b>' + Object.keys(IM).map(k => '<span style="display:inline-flex;align-items:center;gap:6px"><span class="imc ' + k + '">' + IM[k][1] + '</span>' + IM[k][0] + '</span>').join('') +
    '<span class="vsep"></span><span class="ut lgr"><span class="r must">فرض / واجب</span></span><span class="ut lgr"><span class="r sun">سنت / مستحب</span></span><span class="ut lgr"><span class="r ok">جائز</span></span><span class="ut lgr"><span class="r mak">مکروہ</span></span><span class="ut lgr"><span class="r bad">ناجائز / باطل</span></span><span class="ut lgr"><span class="nm">عدد</span></span></div>';
}
const VC = { ص: ['t', 'اصطلاح'], ع: ['a', 'عمل'], ش: ['o', 'شے'], م: ['q', 'مقدار'] };
let vq = null;
function vk(v) { return v.k + '-' + hash(v.t).toString(36); }
function vPool(K) { const a = VOC.filter(x => x.k === K.n); return a.length >= 6 ? a : VOC; }
function vqOpts(v, pool) {
  const others = shufS(pool.filter(x => x.u !== v.u), hash(v.t) + 3).slice(0, 3).map(x => x.u);
  return shufS([v.u].concat(others), hash(v.t) + 11);
}
function vqHtml(K) {
  const L = vq.list;
  if (vq.i >= L.length) {
    const pc = Math.round(vq.ok / L.length * 100);
    return '<div class="vres"><b>' + ad(vq.ok) + ' / ' + ad(L.length) + '</b><p class="urt">' + (pc >= 80 ? 'ماشاء اللہ! آپ کو یہ مفردات اچھی طرح یاد ہیں۔' : pc >= 50 ? 'اچھی کوشش! غلط الفاظ بطاقوں میں دوبارہ دیکھیں۔' : 'کوئی بات نہیں، بطاقے پڑھ کر دوبارہ آزمائیں۔') + '</p><div class="qtools"><button class="mini go" data-a="vtest">دوبارہ ٹیسٹ</button><button class="mini" data-a="vend">بطاقوں پر واپس</button></div></div>';
  }
  const v = L[vq.i], opts = vqOpts(v, vPool(K));
  let h = '<div class="vtest"><div class="pgb"><b style="width:' + Math.round(vq.i / L.length * 100) + '%"></b></div><small>سوال ' + ad(vq.i + 1) + ' / ' + ad(L.length) + '</small>';
  h += '<div class="vq-t"><span class="vcat">اس لفظ کا مطلب؟</span><h3 class="vt-ar">' + esc(sd(v.t)) + '</h3></div><div class="mopts">';
  opts.forEach((o, i) => {
    let cls = 'mo'; if (vq.sel !== null) cls += o === v.u ? ' right' : (i === vq.sel ? ' wrong' : ' dim');
    h += '<button class="' + cls + '" data-a="vopt" data-o="' + i + '"' + (vq.sel !== null ? ' disabled' : '') + '><i>' + ['ا', 'ب', 'ج', 'د'][i] + '</i><span class="urt">' + esc(o) + '</span></button>';
  });
  h += '</div>';
  if (vq.sel !== null) h += '<div class="mfb ' + (opts[vq.sel] === v.u ? 'g' : 'b') + '"><span class="urt">' + esc(v.n) + '</span></div><div class="qtools"><button class="mini go" data-a="vnext">' + (vq.i + 1 >= L.length ? 'نتیجہ دیکھیں' : 'اگلا ←') + '</button></div>';
  return h + '<div class="qtools"><button class="mini" data-a="vend">ٹیسٹ ختم کریں</button></div></div>';
}
const vexC = {};
function vEx(v) {
  const k = vk(v); if (k in vexC) return vexC[k];
  const base = norm(strip(v.t).split(' / ')[0]).trim();
  const terms = [base]; if (base.startsWith('ال') && base.length > 4) terms.push(base.slice(2));
  base.split(/[\s\/،()]+/).filter(w => w.length >= 4).sort((a, b) => b.length - a.length).forEach(w => { terms.push(w); if (w.startsWith('ال') && w.length > 5) terms.push(w.slice(2)); });
  let res = null;
  const pool = allM.filter(m => m.k === v.k).concat(allM.filter(m => m.k !== v.k));
  outer: for (const t of terms) {
    if (t.length < 3) continue;
    for (const m of pool) {
      const { ns, idx } = nmap(m.text), i = ns.indexOf(t);
      if (i < 0) continue;
      const a = idx[i], z = idx[Math.min(i + t.length, idx.length) - 1] + 1;
      let from = Math.max(0, a - 70), to = Math.min(m.text.length, z + 80);
      if (from > 0) { const sp = m.text.indexOf(' ', from); if (sp > -1 && sp < a) from = sp + 1; }
      if (to < m.text.length) { const sp = m.text.lastIndexOf(' ', to); if (sp > z) to = sp; }
      res = { m, pre: m.text.slice(from, a), mid: m.text.slice(a, z), post: m.text.slice(z, to), l: from > 0, r: to < m.text.length };
      break outer;
    }
  }
  return (vexC[k] = res);
}
const clean = t => t.replace(/[\[\]]/g, '');
function voHtml(K) {
  const all = VOC.filter(v => v.k === K.n), f = S.vf;
  const mastered = all.filter(v => S.vm[vk(v)]).length, pc = all.length ? Math.round(mastered / all.length * 100) : 0;
  let h = '<div class="urnote vo"><b>مفردات و مفاہیم</b><span>ہر اصطلاح ایک بطاقہ ہے۔ جو لفظ یاد ہو اسے «یاد ہے» کر دیں، پھر ٹیسٹ سے اپنا امتحان لیں۔</span></div>';
  h += '<div class="mcs vms"><div class="mcs-t"><b>' + ad(mastered) + '</b><span>یاد ہیں</span></div><div class="mcs-t"><b>' + ad(all.length - mastered) + '</b><span>باقی</span></div><div class="mcs-t"><b>' + ad(pc) + '٪</b><span>مہارت</span></div><div class="mcs-b"><div class="pgb"><b style="width:' + pc + '%"></b></div></div></div>';
  if (vq) return h + vqHtml(K);
  h += '<div class="qtools"><button class="mini go" data-a="vtest">ٹیسٹ شروع کریں (' + ad(Math.min(10, Math.max(all.length - mastered, 1))) + ' سوال)</button><button class="mini" data-a="vmreset">مہارت ری سیٹ</button></div>';
  const fl = [['all', 'سب', all.length], ['new', 'باقی', all.length - mastered]].concat(['t', 'a', 'o', 'q'].map(c => { const e = Object.values(VC).find(x => x[0] === c); return [c, e[1], all.filter(v => VC[v.c][0] === c).length]; })).filter(x => x[2]);
  h += '<div class="vfil" role="group" aria-label="تصفية">' + fl.map(x => '<button class="vfb c' + x[0] + '" data-a="vf" data-v="' + x[0] + '" aria-pressed="' + (f === x[0]) + '">' + x[1] + ' <b>' + ad(x[2]) + '</b></button>').join('') + '</div>';
  const list = all.filter(v => f === 'all' || (f === 'new' ? !S.vm[vk(v)] : VC[v.c][0] === f));
  h += '<div class="vgrid">' + list.map((v, ix) => {
    const c = VC[v.c], k = vk(v), d = S.vm[k], ex = vEx(v);
    return '<article class="vc c' + c[0] + (d ? ' done' : '') + '"><div class="vh"><span class="vcat">' + c[1] + '</span><span class="vno">' + ad(ix + 1) + '</span>' + (d ? '<span class="vok">✓</span>' : '') + '</div>' +
      '<div class="vb ar"><i>عربی لفظ</i><h3 class="vt-ar">' + esc(sd(v.t)) + '</h3></div>' +
      '<div class="vb ur"><i>اردو مفہوم</i><p class="vu">' + esc(v.u) + '</p></div>' +
      '<div class="vb no"><i>یاد رکھیں</i><p class="vnote">' + esc(v.n) + '</p></div>' +
      (ex ? '<div class="vb ex"><i>متن سے مثال</i><p class="vex">' + (ex.l ? '… ' : '') + esc(sd(clean(ex.pre))) + '<mark>' + esc(sd(clean(ex.mid))) + '</mark>' + esc(sd(clean(ex.post))) + (ex.r ? ' …' : '') + '</p><a class="vxl" href="#k' + ex.m.k + '-m' + ex.m.no + '">مسئلہ ' + ad(ex.m.no) + ' متن میں ←</a></div>' : '') +
      '<div class="vbt">' + (ex ? '' : '<button class="vgo" data-a="vgo" data-q="' + esc(strip(v.t).split(' / ')[0]) + '">متن میں تلاش ←</button>') + '<button class="vgo vdo" data-a="vdone" data-key="' + k + '">' + (d ? 'دوبارہ پڑھوں' : 'یاد ہے ✓') + '</button></div></article>';
  }).join('') + '</div>';
  return h;
}

/* ---------- Q&A and MCQ ---------- */
function bOf(k, n) { const m = byId['k' + k + '-m' + n]; return m ? D[k - 1].babs[m.bi] : null; }
function groupByBab(K, rows) {
  const g = new Map();
  rows.forEach(r => { const B = bOf(K.n, r.n); if (!B) return; if (!g.has(B)) g.set(B, []); g.get(B).push(r); });
  return Array.from(g.entries()).sort((a, b) => a[0].i - b[0].i);
}
function qaHtml(K) {
  const rows = QA.filter(r => r.k === K.n).sort((a, b) => a.n - b.n);
  let h = '<div class="urnote qa"><b>مختصر سوال جواب</b><span>' + ad(rows.length) + ' سوالات جو کتاب کے ہر مسئلے کو ڈھانپتے ہیں۔ پہلے خود جواب سوچیں، پھر سوال پر دبا کر جواب دیکھیں۔</span></div>';
  h += '<div class="qtools"><button class="mini" data-a="qall" data-v="1">سب کھولیں</button><button class="mini" data-a="qall" data-v="0">سب بند کریں</button></div>';
  let anyQ = false;
  groupByBab(K, rows).forEach(([B, rs0]) => {
    if (B !== K.babs[curBab(K)]) return;
    const nos = pageNos(K), rs = rs0.filter(r => nos.has(r.n)); if (!rs.length) return; anyQ = true;
    h += '<section class="bab qab" id="' + B.id + '"><div class="bab-h"><span class="bno">' + ad(B.i + 1) + '</span><h2 class="urt">' + esc(B.tu) + '</h2><span class="meta">' + ad(rs.length) + ' سوال</span></div>';
    rs.forEach((r, i) => {
      h += '<details class="qa-i"><summary><span class="qn">' + ad(i + 1) + '</span><span class="qq urt">' + esc(r.q) + '</span></summary><div class="qaa"><div class="ut">' + urFmt(r.a) + '</div><a class="qlink" href="#k' + K.n + '-m' + r.n + '" data-ar="1">مسئلہ ' + ad(r.n) + ' متن میں ←</a></div></details>';
    });
    h += '</section>';
  });
  if (!anyQ) h += '<div class="empty">اس باب کے لیے سوالات نہیں ہیں — اگلے باب پر جائیں۔</div>';
  return h;
}
function shufS(arr, seed) { const r = rng(seed), a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function bestQA(r) {
  const rows = QA.filter(x => x.k === r.k && x.n === r.n); if (!rows.length) return null; if (rows.length === 1) return rows[0];
  const w = t => new Set(t.split(/[\s،۔؟:؛()]+/).filter(x => x.length > 2)), base = w(r.q + ' ' + r.o[0]);
  let best = rows[0], bs = -1;
  rows.forEach(x => { const xs = w(x.q + ' ' + x.a); let sc = 0; base.forEach(t => { if (xs.has(t)) sc++; }); if (sc > bs) { bs = sc; best = x; } });
  return best;
}
function mcExplain(r, v, key) {
  const m = byId['k' + r.k + '-m' + r.n], qa = bestQA(r);
  let h = '<div class="mfb ' + (v ? 'g' : 'b') + '"><div class="mv"><span class="mvi">' + (v ? '✓' : '✗') + '</span><b class="urt">' + (v ? 'ماشاء اللہ! آپ کا جواب درست ہے' : 'آپ کا جواب درست نہیں') + '</b></div>';
  if (!v) h += '<p class="mrt urt"><i>درست جواب:</i> ' + esc(r.o[0]) + '</p>';
  if (qa) h += '<div class="mex"><i>وضاحت</i><div class="ut">' + urFmt(qa.a) + '</div></div>';
  if (m) h += '<details class="mfull"><summary>مکمل مسئلہ اردو میں</summary><div class="ut">' + urFmt(m.ur) + '</div></details><details class="mfull"><summary>عربی متن</summary><div class="mt">' + esc(sd(m.text).replace(/[\[\]]/g, '')) + '</div></details>';
  return h + '<div class="mact"><a class="qlink" href="#k' + r.k + '-m' + r.n + '">مسئلہ ' + ad(r.n) + ' متن میں ←</a><button class="mini go" data-a="mnext" data-key="' + key + '">اگلا سوال ↓</button></div></div>';
}
function mcCard(r, idx) {
  const key = mqKey(r), v = S.mq[key], ord = shufS([0, 1, 2, 3], hash(key));
  let h = '<article class="mcq' + (v === undefined ? '' : v ? ' ok' : ' no') + '" id="mc-' + key + '"><div class="mcq-h"><span class="qn">' + ad(idx) + '</span><p class="qq urt">' + esc(r.q) + '</p></div><div class="mopts">';
  ord.forEach((oi, pos) => {
    const chosen = v !== undefined && S.mqc && S.mqc[key] === oi;
    let cls = 'mo', tag = ''; if (v !== undefined) { if (oi === 0) { cls += ' right'; tag = '<em class="mtag">✓ درست جواب</em>'; } else if (chosen) { cls += ' wrong'; tag = '<em class="mtag">✗ آپ کا جواب</em>'; } else cls += ' dim'; }
    h += '<button class="' + cls + '" data-a="mcq" data-key="' + key + '" data-o="' + oi + '"' + (v !== undefined ? ' disabled' : '') + '><i>' + ['ا', 'ب', 'ج', 'د'][pos] + '</i><span class="urt">' + esc(r.o[oi]) + '</span>' + tag + '</button>';
  });
  h += '</div>';
  if (v !== undefined) h += mcExplain(r, v, key);
  return h + '</article>';
}
function mcScore(K) {
  const st = mqStat(K), pc = st.n ? Math.round(st.a / st.n * 100) : 0, acc = st.a ? Math.round(st.c / st.a * 100) : 0;
  return '<div class="mcs" id="mcs"><div class="mcs-t"><b>' + ad(st.c) + '</b><span>صحیح</span></div><div class="mcs-t"><b>' + ad(st.a - st.c) + '</b><span>غلط</span></div><div class="mcs-t"><b>' + ad(st.n - st.a) + '</b><span>باقی</span></div>' +
    '<div class="mcs-b"><div class="pgb"><b style="width:' + pc + '%"></b></div><small>' + ad(st.a) + ' / ' + ad(st.n) + ' حل کیے · درستی ' + ad(acc) + '٪</small></div></div>';
}
function mcHtml(K) {
  const rows = MCQ.filter(r => r.k === K.n).sort((a, b) => a.n - b.n);
  let h = '<div class="urnote mc"><b>معروضی سوالات (MCQs)</b><span>' + ad(rows.length) + ' سوالات؛ ہر جواب فوراً چیک ہوتا ہے اور نتیجہ محفوظ رہتا ہے۔ غلط جوابات کو الگ فلٹر کر کے دوبارہ حل کریں۔</span></div>';
  h += mcScore(K);
  h += '<div class="vfil" role="group">' + [['all', 'سب'], ['todo', 'باقی'], ['wrong', 'غلط']].map(x => '<button class="vfb" data-a="mf" data-v="' + x[0] + '" aria-pressed="' + (S.mf === x[0]) + '">' + x[1] + '</button>').join('') + '<span class="sp"></span><button class="vfb" data-a="mqreset">ری سیٹ</button></div>';
  let any = false, idx = 0;
  groupByBab(K, rows).forEach(([B, rs]) => {
    if (B !== K.babs[curBab(K)]) return;
    const nos = pageNos(K);
    const keep = rs.filter(r => nos.has(r.n)).filter(r => { const v = S.mq[mqKey(r)]; return S.mf === 'all' || (S.mf === 'todo' && v === undefined) || (S.mf === 'wrong' && v === 0); });
    if (!keep.length) return; any = true;
    h += '<section class="bab qab"><div class="bab-h"><span class="bno">' + ad(B.i + 1) + '</span><h2 class="urt">' + esc(B.tu) + '</h2><span class="meta">' + ad(keep.length) + ' سوال</span></div>';
    keep.forEach(r => { idx++; h += mcCard(r, idx); });
    h += '</section>';
  });
  if (!any) h += '<div class="empty">' + (rows.some(r => pageNos(K).has(r.n) && bOf(K.n, r.n) === K.babs[curBab(K)]) ? 'اس فلٹر میں کوئی سوال نہیں — شاباش!' : 'اس باب کے لیے MCQs نہیں ہیں — اگلے باب پر جائیں۔') + '</div>';
  return h;
}
function updTabs() { const K = D[cur - 1], t = $('.vtabs'); if (K && t) t.outerHTML = tabsHtml(K); }
function goAnchor(a, instant) {
  if (!a) { jump(0); return; }
  const el = document.getElementById('k' + cur + '-' + a.replace(/^k\d-/, '')) || document.getElementById(a);
  if (!el) return;
  el.scrollIntoView({ behavior: instant ? 'instant' : 'smooth', block: 'start' });
  if (el.classList.contains('m')) { el.classList.add('hit'); setTimeout(() => el.classList.remove('hit'), 2200); }
}
function observe() {
  if (io) io.disconnect();
  if (!('IntersectionObserver' in window)) return;
  io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) setOn(en.target.id); }), { rootMargin: '-15% 0px -75% 0px' });
  $$('.bab').forEach(b => io.observe(b));
}
function setOn(id) {
  $$('.toc a[data-b]').forEach(a => { const on = a.dataset.b === id; a.classList.toggle('on', on); if (on) { const sd = $('#side'); if (sd && sd.offsetParent && sd.scrollHeight > sd.clientHeight) { const r = a.getBoundingClientRect(), sr = sd.getBoundingClientRect(); if (r.top < sr.top || r.bottom > sr.bottom) a.scrollIntoView({ block: 'nearest' }); } } });
  S.last = { k: cur, b: id }; save();
}
function refresh() {
  const y = window.scrollY, K = D[cur - 1];
  $('#babs').innerHTML = mainHtml(K);
  const kw = $('#kmapw'); if (kw) kw.innerHTML = S.view === 'ar' ? kmapHtml(K) : '';
  $$('.dock .seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === S.mode)));
  observe(); jump(y);
}
function updProgress() {
  const K = D[cur - 1]; if (!K) return;
  const l = learnedIn(K), pc = K.ms.length ? Math.round(l / K.ms.length * 100) : 0;
  const t = $('#prtxt'), b = $('#prbar'); if (t) t.textContent = 'یاد: ' + ad(l) + ' / ' + ad(K.ms.length); if (b) b.style.width = pc + '%';
  const kw = $('#kmapw'); if (kw) kw.innerHTML = kmapHtml(K);
  K.babs.forEach(B => { const c = document.querySelector('#' + B.id + ' .cnt'); if (c) c.textContent = ad(B.ms.filter(m => isL(m.id)).length) + ' / ' + ad(B.ms.length) + ' أُتقنت'; });
  K.parts.forEach(P => { const el = document.getElementById(P.id); if (el) el.outerHTML = partHtml(K, P); });
}

/* ---------- overlays ---------- */
function sheet(inner) {
  closeOverlays();
  const sc = document.createElement('div'); sc.className = 'scrim'; sc.innerHTML = '<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>' + inner + '</div>';
  sc.addEventListener('click', e => { if (e.target === sc) closeOverlays(); });
  app.appendChild(sc); return sc;
}
const TABN = [['ar', 'المتن'], ['ur', 'اردو'], ['vo', 'مفردات'], ['qa', 'سوال جواب'], ['mc', 'MCQs']];
function menuHtml() {
  let h = '<div class="dr-h"><b>مینیو</b><button class="dr-x" data-a="mclose" aria-label="بند کریں">✕</button></div><div data-close>';
  h += '<a class="dr-home' + (cur === 0 ? ' on' : '') + '" href="#home"><span>🏠</span> مرکزی صفحہ</a>';
  h += '</div><div class="dr-q">' +
    '<button data-a="search"><span>🔍</span>متن میں تلاش</button><button data-a="rev"><span>🔁</span>دہرائی</button>' +
    '<button data-a="allquiz"><span>❓</span>جامع آزمائش</button><button data-a="mset"><span>⚙</span>ترتیبات</button>' +
    '<button data-a="theme"><span>◐</span>روشن / تاریک</button></div>';
  h += '<h4 class="dr-t">کتابیں اور موضوعات</h4><div data-close>';
  D.forEach(K => {
    const l = learnedIn(K), pc = K.ms.length ? Math.round(l / K.ms.length * 100) : 0, cb = curBab(K);
    h += '<details class="mk k' + K.n + '"' + (cur === K.n ? ' open' : '') + '><summary><i></i><span>' + T(K.title) + '</span><small>' + ad(pc) + '٪</small></summary>';
    h += '<div class="mk-tabs">' + TABN.map(t => '<a href="#k' + K.n + '-v' + t[0] + '"' + (cur === K.n && S.view === t[0] ? ' class="on"' : '') + '>' + t[1] + '</a>').join('') + '</div>';
    h += '<div class="mk-babs">' + K.babs.map(B => '<a href="#' + B.id + '"' + (cur === K.n && cb === B.i ? ' class="on"' : '') + '><b>' + ad(B.i + 1) + '</b><span>' + (S.view === 'ar' || S.view === 'vo' || cur !== K.n ? T(B.t) : esc(B.tu)) + '</span></a>').join('') + '</div></details>';
  });
  return h + '</div>';
}
function openMenu() {
  if ($('.scrim.dr')) { closeOverlays(); return; }
  closeOverlays();
  const sc = document.createElement('div'); sc.className = 'scrim dr';
  sc.innerHTML = '<aside class="drawer" role="dialog" aria-modal="true" aria-label="مینیو">' + menuHtml() + '</aside>';
  sc.addEventListener('click', e => { if (e.target === sc) closeOverlays(); });
  app.appendChild(sc);
  const on = sc.querySelector('.mk[open] .mk-babs a.on'); if (on) { const bx = on.parentElement; bx.scrollTop = Math.max(0, on.offsetTop - bx.clientHeight / 2); }
}
function openToc() { sheet('<div data-close>' + tocHtml(D[cur - 1]) + '</div>'); }
function openSettings() {
  const ex = $('.pop'); if (ex) { ex.remove(); return; }
  const p = document.createElement('div'); p.className = 'pop'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'الإعدادات');
  p.innerHTML = '<div class="row"><span>حجم الخط</span><div class="seg"><button data-a="fs" data-v="-1" aria-label="تصغير الخط">أ−</button><button data-a="fs" data-v="1" aria-label="تكبير الخط">أ+</button></div></div>' +
    '<div class="row"><span>مستوى الإخفاء في الحفظ</span><div class="seg">' + [0, 1, 2].map(i => '<button data-a="lvl" data-v="' + i + '" aria-pressed="' + (S.lvl === i) + '">' + ad(i + 1) + '</button>').join('') + '</div></div>' +
    '<div class="row"><span>التشكيل (الإعراب)</span><button class="sw" data-a="tk" aria-pressed="' + S.tk + '" aria-label="إظهار التشكيل"></button></div>' +
    '<div class="row"><span>تلوين الأحكام والأعداد</span><button class="sw" data-a="rc" aria-pressed="' + S.rc + '" aria-label="تلوين الأحكام والأعداد"></button></div>' +
    '<div class="row"><span>مسائل الخلاف فقط</span><button class="sw" data-a="kh" aria-pressed="' + S.khilaf + '" aria-label="مسائل الخلاف فقط"></button></div>' +
    '<div class="row"><span>خط الأردية</span><div class="seg">' + [['jn', 'جمیل نوری'], ['noto', 'نوتو نستعلیق']].map(x => '<button data-a="uf" data-v="' + x[0] + '" aria-pressed="' + (S.uf === x[0]) + '">' + x[1] + '</button>').join('') + '</div></div>' +
    '<div class="row"><span>المظهر</span><div class="seg">' + [['auto', 'تلقائي'], ['light', 'فاتح'], ['dark', 'داكن']].map(x => '<button data-a="th" data-v="' + x[0] + '" aria-pressed="' + (S.theme === x[0]) + '">' + x[1] + '</button>').join('') + '</div></div>' +
    '<div class="row"><span>مسح التقدم والعلامات</span><button class="mini" style="border:1.5px solid var(--line);padding:4px 12px;border-radius:99px" data-a="reset">مسح</button></div>';
  app.appendChild(p);
}
function nmap(str) { let ns = '', idx = []; for (let i = 0; i < str.length; i++) { const c = str[i]; if (/[\u064B-\u0652\u0670\u0640]/.test(c)) continue; ns += norm(c); idx.push(i); } return { ns, idx }; }
function hl(orig, toks) {
  const { ns, idx } = nmap(orig), r = [];
  toks.forEach(t => { let i = ns.indexOf(t); while (i >= 0) { r.push([i, i + t.length]); i = ns.indexOf(t, i + t.length); } });
  r.sort((a, b) => a[0] - b[0]);
  let out = '', p = 0;
  r.forEach(([a, b]) => { if (a < p) return; const s0 = idx[a]; let e0 = b >= idx.length ? orig.length : idx[b]; if (s0 < p) return; out += esc(orig.slice(p, s0)) + '<mark>' + esc(orig.slice(s0, e0)) + '</mark>'; p = e0; });
  return out + esc(orig.slice(p));
}
function openSearch(pre) {
  const sc = sheet('<h3>البحث في المتن</h3><div class="sq"><input id="q" type="search" placeholder="اكتب كلمة أو أكثر…" autocomplete="off" aria-label="بحث"><button class="tbtn" style="height:auto;padding:0 14px;border-radius:14px;background:var(--k-soft);color:var(--k);font-weight:600" data-a="bmlist">المحفوظة (' + ad(Object.keys(S.bm).length) + ')</button></div><div class="res" id="res" data-close><div class="empty">ابحث بكلمة من المسألة، أو باسم إمام، أو بمصطلح مثل «النفاس».</div></div>');
  const q = $('#q', sc), res = $('#res', sc); q.focus();
  let t = 0;
  if (pre) setTimeout(() => { q.value = pre; q.dispatchEvent(new Event('input')); }, 0);
  q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => {
    const toks = norm(q.value.trim()).split(/\s+/).filter(Boolean);
    if (!toks.length) { res.innerHTML = '<div class="empty">ابحث بكلمة من المسألة، أو باسم إمام، أو بمصطلح مثل «النفاس».</div>'; return; }
    const out = [];
    allM.forEach(m => { let ok = true, sc2 = 0; for (const x of toks) { const i = m.nt.indexOf(x); if (i < 0) { ok = false; break; } sc2 += 1 / (1 + i / 200); } if (ok) out.push([sc2, m]); });
    out.sort((a, b) => b[0] - a[0]);
    res.innerHTML = out.length ? out.slice(0, 50).map(([, m]) => resItem(m, toks)).join('') + (out.length > 50 ? '<div class="empty">وغيرها… ضيّق البحث لتظهر نتائج أدق.</div>' : '') : '<div class="empty">لا نتائج. جرّب كلمة أقصر.</div>';
  }, 120); });
}
function resItem(m, toks) {
  const K = D[m.k - 1], B = K.babs[m.bi];
  const mp = m.mp || (m.mp = nmap(m.text).idx);
  let i = toks ? m.nt.indexOf(toks[0]) : 0; if (i < 0) i = 0;
  const si = Math.max(0, i - 60), ei = Math.min(mp.length, si + 190);
  const s0 = mp[si] || 0, e0 = ei >= mp.length ? m.text.length : mp[ei];
  const piece2 = sd(m.text.slice(s0, e0));
  return '<a class="k' + m.k + '" href="#' + m.id + '"><small>' + T(K.title) + ' · ' + T(B.t) + ' · مسألة ' + ad(m.no) + '</small><p>' + (s0 ? '… ' : '') + (toks ? hl(piece2, toks) : esc(piece2)) + (e0 < m.text.length ? ' …' : '') + '</p></a>';
}
function bmList(sc) {
  const res = $('#res', sc), all = allM.filter(m => S.bm[m.id]);
  res.innerHTML = all.length ? all.map(m => resItem(m, null)).join('') : '<div class="empty">لم تحفظ مسائل بعد. اضغط على أيقونة العلامة في أي مسألة.</div>';
}

/* ---------- review cards (spaced repetition) ---------- */
function buildDeck(scope, id) {
  if (scope === 'b') return { deck: findBab(id).ms.slice(), nw: new Set(findBab(id).ms.filter(m => !S.srs[m.id]).map(m => m.id)), title: findBab(id).t };
  const pool = scope === 'k' ? D[id - 1].ms : allM;
  const due = shuf(pool.filter(m => isDue(m.id))).slice(0, 25);
  const fresh = pool.filter(m => !S.srs[m.id]).slice(0, scope === 'k' ? 10 : 6);
  let deck = due.concat(fresh), free = false;
  if (!deck.length) { deck = shuf(pool.slice()).slice(0, 10); free = true; }
  else shuf(deck);
  return { deck, nw: new Set(fresh.map(m => m.id)), free, title: scope === 'k' ? D[id - 1].title : 'مراجعة مختلطة' };
}
function openCards(scope, id) {
  const d = buildDeck(scope, id);
  closeOverlays(); fc = { deck: d.deck, nw: d.nw, free: d.free, title: d.title, flip: false, total: d.deck.length, done: 0 };
  const el = document.createElement('div'); el.className = 'fc'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'بطاقات المراجعة');
  app.appendChild(el); drawCard();
}
function drawCard() {
  const el = $('.fc'); if (!el || !fc) return;
  const dn = doneToday();
  const top = '<div class="fc-top"><button class="ibtn" data-a="fcclose" aria-label="إغلاق">' + I.close + '</button><div class="bar"><b style="width:' + Math.round(fc.done / Math.max(1, fc.total) * 100) + '%"></b></div><span>' + ad(fc.done) + '/' + ad(fc.total) + '</span></div>';
  if (!fc.deck.length) {
    el.className = 'fc k' + (cur || 0);
    el.innerHTML = top + '<div class="fc-card"><div class="fc-done"><h3>أحسنت</h3><p>' + T(fc.title) + ': أنهيت ' + ad(fc.total) + ' بطاقة.<br>بطاقات اليوم ' + ad(dn) + ' من ' + ad(GOAL) + (streak() ? ' · ' + ad(streak()) + ' يوم متتابع' : '') + '</p><div class="fc-btns"><button class="ok" data-a="fcquiz">اختبر نفسك الآن</button><button class="no" data-a="fcclose">رجوع</button></div></div></div>';
    return;
  }
  const m = fc.deck[0], B = D[m.k - 1].babs[m.bi];
  el.className = 'fc k' + m.k;
  const isNew = fc.nw.has(m.id), c = S.srs[m.id];
  const head = '<div class="q"><span>' + T(D[m.k - 1].title) + ' · ' + T(B.t) + ' · مسألة ' + ad(m.no) + '</span><em class="bdg ' + (isNew ? 'nw' : 'rv2') + '">' + (isNew ? 'جديدة' : c && c.d < today() ? 'متأخرة' : 'مراجعة') + '</em></div>';
  const n = Math.min(m.t.length, m.ts + 5);
  let body;
  m.mk = null;
  if (!fc.flip) body = '<div class="mt">' + segHtml(m, m.ts, n) + '<span class="fade">…</span></div><div class="tap">أكمل المسألة بصوتك أو في ذهنك، ثم اقلب البطاقة</div>';
  else body = '<div class="mt">' + segHtml(m, m.ts, m.segs[0][1]) + '</div>' + m.segs.slice(1).map(s => '<div class="dis"><div class="mt">' + segHtml(m, s[0], s[1]) + '</div></div>').join('');
  el.innerHTML = top + '<div class="fc-card"><div class="card" data-a="flip" tabindex="0" role="button" aria-label="اقلب البطاقة">' + head + body + '</div></div><div class="fc-act">' +
    (fc.flip ? '<button class="no" data-a="g0">نسيتها</button><button class="mid" data-a="g1">بصعوبة</button><button class="ok" data-a="g2">أتقنتها</button>' : '<button class="ok" data-a="flip">أظهر المسألة</button>') + '</div>';
}

/* ---------- self-test quizzes (auto-generated from the text) ---------- */
const PRE = /^(?:و|ف|ب|ل|ك|ال|وال|بال|لل|وب|ول|فال|فب)$/;
const FRAC = new Set(['نصف', 'ثلث', 'ثلثا', 'ثلثي', 'ربع'].map(rn)), TIMES = new Set(['ركعتين', 'مرتين', 'مرة'].map(rn));
const grp = r => FRAC.has(r) ? 'f' : TIMES.has(r) ? 't' : 'c';
let numPool = null;
function numParts(raw) {
  for (let j = 0; j <= 9 && j < raw.length - 1; j++) {
    const core = raw.slice(j), r = rn(core);
    if (NUMS.has(r) && (j === 0 || PRE.test(rn(raw.slice(0, j))))) {
      const lead = raw.slice(0, j), mm = /^(.*?[ء-ْ])([^ء-ْ]*)$/.exec(core);
      return { pre: lead, w: mm ? mm[1] : core, tail: mm ? mm[2] : '', r };
    }
  }
  return null;
}
function getPool() {
  if (numPool) return numPool;
  numPool = new Map();
  allM.forEach(m => m.t.forEach(x => { if (x.n) { const p = numParts(x.w); if (p && !numPool.has(p.r)) numPool.set(p.r, sd(p.w)); } }));
  return numPool;
}
function snippet(m, a, b, blank) {
  const from = Math.max(m.ts, a - 9), to = Math.min(m.t.length, b + 9);
  let out = (from > m.ts ? '… ' : '');
  for (let i = from; i < to; i++) {
    if (i >= a && i <= b) { if (i === a) out += blank + ' '; continue; }
    const x = m.t[i]; out += (x.im ? '<span class="im ' + x.im + '">' + esc(dw(x)) + '</span>' : esc(dw(x))) + ' ';
  }
  return out + (to < m.t.length ? '…' : '');
}
function qWho(m) {
  if (m.segs.length < 2) return null;
  const si = 1 + Math.floor(Math.random() * (m.segs.length - 1)), [a, b] = m.segs[si];
  const ims = Array.from(new Set(m.t.slice(a, b).filter(x => x.im).map(x => x.im)));
  if (ims.length !== 1) return null;
  let txt = '', prevBlank = false;
  for (let i = a; i < b; i++) { const x = m.t[i]; if (x.im) { if (!prevBlank) txt += '<span class="blank">﹍﹍﹍</span> '; prevBlank = true; } else { txt += esc(dw(x)) + ' '; prevBlank = false; } }
  const head = m.t.slice(m.segs[0][0], Math.min(m.segs[0][1], m.segs[0][0] + 22)).map(x => dw(x)).join(' ');
  return { type: 'who', m, label: 'من صاحب هذا القول؟', ctx: head + ' …', text: txt, opts: ['h', 'y', 'm', 'z'].map(k => ({ v: k, h: '<span class="imc ' + k + '">' + IM[k][1] + '</span>' + IM[k][0] })), ans: ims[0] };
}
function qNum(m) {
  const ix = []; m.t.forEach((x, i) => { if (x.n && !x.ay && !x.ha && i >= m.ts) ix.push(i); });
  if (!ix.length) return null;
  const i = ix[Math.floor(Math.random() * ix.length)], p = numParts(m.t[i].w); if (!p) return null;
  const pool = getPool(), g = grp(p.r), ends = p.w.endsWith('ة');
  let cands = Array.from(pool.entries()).filter(([r, w]) => r !== p.r && grp(r) === g);
  const same = cands.filter(([r, w]) => w.endsWith('ة') === ends);
  if (same.length >= 3) cands = same;
  const picks = shuf(cands).slice(0, 3).map(([, w]) => w);
  if (picks.length < 2) return null;
  const ans = sd(p.w);
  return { type: 'num', m, label: 'أكمل بالعدد الصحيح', text: snippet(m, i, i, (p.pre ? esc(sd(p.pre)) : '') + '<span class="blank">﹍﹍﹍</span>' + esc(sd(p.tail))), opts: shuf([ans].concat(picks)).map(w => ({ v: w, h: esc(w) })), ans };
}
function qRule(m) {
  const ix = []; m.t.forEach((x, i) => { if (x.r && !x.rp && i >= m.ts) ix.push(i); });
  if (!ix.length) return null;
  const i = ix[Math.floor(Math.random() * ix.length)], x = m.t[i], a = x.r && m.t[i - 1] && m.t[i - 1].rp ? i - 1 : i;
  return { type: 'rule', m, label: 'ما حكم الكلمة المحجوبة؟', text: snippet(m, a, i, '<span class="blank">﹍﹍﹍</span>'), opts: RK.map(c => ({ v: c, h: '<span class="r ' + c + '">' + RC[c] + '</span>' })), ans: x.r };
}
function genQuiz(ms, N) {
  const by = { who: [], num: [], rule: [] };
  shuf(ms.slice()).forEach(m => { [qWho, qNum, qRule].forEach(f => { const q = f(m); if (q) by[q.type].push(q); }); });
  const out = [], seen = {};
  for (let pass = 0; pass < 2 && out.length < N; pass++) {
    let more = true;
    while (out.length < N && more) {
      more = false;
      for (const t of ['who', 'rule', 'num']) {
        const q = by[t].find(q => !(pass === 0 && seen[q.m.id]) && !out.includes(q));
        if (q && out.length < N) { out.push(q); seen[q.m.id] = 1; more = true; }
      }
    }
  }
  return shuf(out);
}
function openQuiz(scope, id) {
  let ms, title, k = 0;
  if (scope === 'b') { const B = findBab(id); ms = B.ms; title = B.t; k = B.k; }
  else if (scope === 'k') { ms = D[id - 1].ms; title = D[id - 1].title; k = id; }
  else { ms = allM; title = 'اختبار شامل'; }
  let qs = genQuiz(ms, scope === 'b' ? 8 : 12), note = '';
  if (qs.length < 4 && scope === 'b') { const B = findBab(id), pm = B.part.bs.reduce((a, x) => a.concat(x.ms), []); qs = genQuiz(pm, 8); note = 'وُسّع الاختبار ليشمل الجزء كله لقلة مسائل الباب.'; title = B.part.t; }
  if (!qs.length) { sheet('<h3>لا أسئلة بعد</h3><p>لا تحتوي هذه المسائل على أقوال أئمة أو أحكام أو أعداد يمكن توليد أسئلة منها.</p>'); return; }
  closeOverlays(); qz = { qs, i: 0, score: 0, wrong: [], title, note, scope, id, picked: null };
  const el = document.createElement('div'); el.className = 'fc qz k' + (k || qs[0].m.k); el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'اختبار');
  app.appendChild(el); drawQ();
}
function drawQ() {
  const el = $('.qz'); if (!el || !qz) return;
  const top = '<div class="fc-top"><button class="ibtn" data-a="fcclose" aria-label="إغلاق">' + I.close + '</button><div class="bar"><b style="width:' + Math.round(qz.i / qz.qs.length * 100) + '%"></b></div><span>' + ad(Math.min(qz.i + 1, qz.qs.length)) + '/' + ad(qz.qs.length) + '</span></div>';
  if (qz.i >= qz.qs.length) {
    const pc = qz.score / qz.qs.length, msg = pc === 1 ? 'ممتاز، أتقنت هذه الأسئلة' : pc >= .7 ? 'جيد، راجع ما أخطأت فيه' : 'الخطأ بداية الحفظ، وقد أُضيفت هذه المسائل إلى مراجعتك';
    el.className = 'fc qz k' + qz.qs[0].m.k;
    el.innerHTML = top + '<div class="fc-card"><div class="fc-done"><h3>' + ad(qz.score) + ' من ' + ad(qz.qs.length) + '</h3><p>' + msg + '</p>' +
      (qz.wrong.length ? '<div class="qres" data-close>' + qz.wrong.map(m => '<a href="#' + m.id + '">' + T(D[m.k - 1].babs[m.bi].t) + ' · مسألة ' + ad(m.no) + '</a>').join('') + '</div>' : '') +
      '<div class="fc-btns">' + (qz.wrong.length ? '<button class="ok" data-a="qwrong">راجع الأخطاء بالبطاقات</button>' : '') + '<button class="' + (qz.wrong.length ? 'no' : 'ok') + '" data-a="qretry">اختبار جديد</button><button class="no" data-a="fcclose">رجوع</button></div></div></div>';
    return;
  }
  const q = qz.qs[qz.i], m = q.m;
  el.className = 'fc qz k' + m.k;
  const picked = qz.picked;
  let h = top + '<div class="fc-card"><div class="card"><div class="q"><span>' + T(D[m.k - 1].babs[m.bi].t) + ' · مسألة ' + ad(m.no) + '</span><em class="bdg nw">' + q.label + '</em></div>';
  if (q.ctx) h += '<div class="qctx">' + esc(q.ctx) + '</div>';
  h += '<div class="mt qtx">' + q.text + '</div><div class="opts' + (q.type === 'rule' ? ' col' : '') + '">';
  q.opts.forEach(o => {
    let c = 'opt';
    if (picked !== null) { if (o.v === q.ans) c += ' right'; else if (o.v === picked) c += ' wrong'; else c += ' dim'; }
    h += '<button class="' + c + '" data-a="opt" data-v="' + esc(String(o.v)) + '"' + (picked !== null ? ' disabled' : '') + '>' + o.h + '</button>';
  });
  h += '</div>';
  if (picked !== null) { m.mk = null; h += '<div class="expl"><b>' + (picked === q.ans ? 'أصبت' : 'الصواب مبيّن بالأخضر') + '</b><div class="mt">' + segHtml(m, m.ts, m.segs[0][1]) + m.segs.slice(1).map(s => '<div class="dis"><div class="mt">' + segHtml(m, s[0], s[1]) + '</div></div>').join('') + '</div></div>'; }
  h += '</div></div><div class="fc-act">' + (picked !== null ? '<button class="ok" data-a="qnext">' + (qz.i + 1 >= qz.qs.length ? 'النتيجة' : 'التالي') + '</button>' : '') + '</div>';
  el.innerHTML = h;
}

/* ---------- events ---------- */
function afterClose() { closeOverlays(); if (cur) { updProgress(); refresh(); } else home(); }
app.addEventListener('click', e => {
  const b = e.target.closest('[data-a]');
  if (!b) { if (e.target.closest('[data-close] a')) closeOverlays(); return; }
  const a = b.dataset.a, v = b.dataset.v;
  if (!['set', 'bab', 'uf', 'fs', 'lvl', 'kh', 'th', 'reset', 'rc', 'tk'].includes(a) && !b.closest('.pop')) { const p = $('.pop'); if (p) p.remove(); }
  switch (a) {
    case 'blank': { const s = document.createElement('span'); s.className = 'rv'; s.textContent = b.dataset.w; b.replaceWith(s); break; }
    case 'ok': { const art = b.closest('.m'), id = art.dataset.id; if (isL(id)) delete S.srs[id]; else S.srs[id] = { b: 1, d: today() + 1 }; save(); art.classList.toggle('done', isL(id)); b.setAttribute('aria-pressed', String(isL(id))); updProgress(); break; }
    case 'bm': { const id = b.closest('.m').dataset.id; if (S.bm[id]) delete S.bm[id]; else S.bm[id] = 1; save(); b.setAttribute('aria-pressed', String(!!S.bm[id])); break; }
    case 'babok': { const B = findBab(b.dataset.b), all = B.ms.every(m => isL(m.id)); B.ms.forEach(m => { if (all) delete S.srs[m.id]; else if (!isL(m.id)) S.srs[m.id] = { b: 1, d: today() + 1 }; const art = document.getElementById(m.id); if (art) { art.classList.toggle('done', !all); const ok = $('[data-a="ok"]', art); if (ok) ok.setAttribute('aria-pressed', String(!all)); } }); save(); updProgress(); break; }
    case 'view': S.view = v; save(); try { history.replaceState(null, '', '#k' + cur + (v === 'ar' ? '' : '-v' + v)); } catch (e) {} { const y0 = 0; cur && kitab(cur); jump($('.vtabs') ? $('.vtabs').getBoundingClientRect().top + window.scrollY - 70 : y0); } break;
    case 'qall': $$('.qa-i').forEach(d => { d.open = v === '1'; }); break;
    case 'mf': S.mf = v; save(); refresh(); break;
    case 'mqreset': if (b.dataset.sure) { const K = D[cur - 1]; MCQ.filter(r => r.k === K.n).forEach(r => { delete S.mq[mqKey(r)]; if (S.mqc) delete S.mqc[mqKey(r)]; }); save(); refresh(); updTabs(); } else { b.dataset.sure = '1'; b.textContent = 'تأكيد؟ دوبارہ دبائیں'; } break;
    case 'mcq': {
      const key = b.dataset.key, o = +b.dataset.o; if (S.mq[key] !== undefined) break;
      S.mq[key] = o === 0 ? 1 : 0; (S.mqc = S.mqc || {})[key] = o; save();
      const r = MCQ.find(x => mqKey(x) === key), card = document.getElementById('mc-' + key);
      if (card && r) { card.outerHTML = mcCard(r, +(card.querySelector('.qn').textContent.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))) || 0); }
      const K = D[cur - 1], sc = $('#mcs'); if (sc) sc.outerHTML = mcScore(K); updTabs(); { const nc = document.getElementById('mc-' + key), fb = nc && nc.querySelector('.mfb'); if (fb) { const bt = fb.getBoundingClientRect().bottom; if (bt > innerHeight - 90) window.scrollBy({ top: bt - innerHeight + 110, behavior: 'smooth' }); } } break;
    }
    case 'vdone': { const k = b.dataset.key; if (S.vm[k]) delete S.vm[k]; else S.vm[k] = 1; save(); refresh(); updTabs(); break; }
    case 'vmreset': if (b.dataset.sure) { VOC.filter(x => x.k === D[cur - 1].n).forEach(x => delete S.vm[vk(x)]); save(); refresh(); updTabs(); } else { b.dataset.sure = '1'; b.textContent = 'تأكيد؟ دوبارہ دبائیں'; } break;
    case 'vtest': { const K = D[cur - 1], all = VOC.filter(x => x.k === K.n); let pool = all.filter(x => !S.vm[vk(x)]); if (!pool.length) pool = all; vq = { list: shufS(pool, Date.now() % 100000).slice(0, 10), i: 0, ok: 0, sel: null }; refresh(); break; }
    case 'vopt': { const K = D[cur - 1], v = vq.list[vq.i], o = +b.dataset.o; if (vq.sel !== null) break; const opts = vqOpts(v, vPool(K)); vq.sel = o; if (opts[o] === v.u) { vq.ok++; S.vm[vk(v)] = 1; save(); } refresh(); break; }
    case 'vnext': vq.i++; vq.sel = null; refresh(); updTabs(); break;
    case 'vend': vq = null; refresh(); updTabs(); break;
    case 'bab': { const K = D[cur - 1]; showPage(b.dataset.i !== undefined ? +b.dataset.i : flatIdx(K) + (+b.dataset.d)); break; }
    case 'mnext': {
      const cur0 = document.getElementById('mc-' + b.dataset.key); let nx = cur0 && cur0.nextElementSibling;
      while (nx && !nx.classList.contains('mcq')) nx = nx.nextElementSibling;
      const tgt = nx || $('.bab-nav') || $('.nextstep'); if (tgt) tgt.scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;
    }
    case 'vf': S.vf = v; save(); refresh(); break;
    case 'vgo': openSearch(b.dataset.q); break;
    case 'mode': S.mode = v; revealed = false; save(); refresh(); break;
    case 'reveal': revealed = !revealed; refresh(); break;
    case 'khoff': S.khilaf = false; save(); refresh(); break;
    case 'toc': openToc(); break;
    case 'menu': openMenu(); break;
    case 'mclose': closeOverlays(); break;
    case 'mset': closeOverlays(); openSettings(); break;
    case 'set': openSettings(); break;
    case 'uf': S.uf = v; S.ufSet = 1; applyUf(); save(); $$('.pop [data-a="uf"]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === S.uf))); break;
    case 'fs': S.fs = Math.max(0, Math.min(FS.length - 1, S.fs + (+v))); applyFs(); save(); break;
    case 'lvl': S.lvl = +v; save(); $$('.pop [data-a="lvl"]').forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.v === S.lvl))); if (S.mode === 'mem') refresh(); break;
    case 'tk': { S.tk = !S.tk; save(); const y = window.scrollY; cur ? kitab(cur) : home(); jump(y); openSettings(); break; }
    case 'rc': S.rc = !S.rc; applyTheme(); save(); b.setAttribute('aria-pressed', String(S.rc)); break;
    case 'kh': S.khilaf = !S.khilaf; save(); b.setAttribute('aria-pressed', String(S.khilaf)); refresh(); break;
    case 'th': S.theme = v; applyTheme(); save(); $$('.pop [data-a="th"]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === S.theme))); break;
    case 'gj': { const d = document.getElementById('g' + b.dataset.g); if (d) { d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'start' }); } break; }
    case 'theme': S.theme = S.theme === 'auto' ? 'dark' : S.theme === 'dark' ? 'light' : 'auto'; applyTheme(); save(); break;
    case 'reset': if (b.dataset.sure) { S.srs = {}; S.bm = {}; S.last = null; S.day = { d: 0, n: 0 }; S.st = { last: 0, n: 0 }; save(); const p = $('.pop'); if (p) p.remove(); cur ? kitab(cur) : home(); } else { b.dataset.sure = '1'; b.textContent = 'تأكيد المسح'; } break;
    case 'search': openSearch(); break;
    case 'bmlist': bmList(b.closest('.scrim')); break;
    case 'cards': openCards('k', cur); break;
    case 'rev': openCards('all'); break;
    case 'babcards': openCards('b', b.dataset.b); break;
    case 'fcclose': afterClose(); break;
    case 'flip': if (fc) { fc.flip = !fc.flip; drawCard(); } break;
    case 'g0': case 'g1': case 'g2': { const m = fc.deck.shift(), g = +a[1]; grade(m.id, g); if (g === 0) fc.deck.push(m); else fc.done++; fc.flip = false; drawCard(); break; }
    case 'fcquiz': { const m = fc.deck.length ? null : null; const k = cur; closeOverlays(); k ? openQuiz('k', k) : openQuiz('all'); break; }
    case 'quiz': openQuiz('b', b.dataset.b); break;
    case 'kquiz': openQuiz('k', cur); break;
    case 'allquiz': openQuiz('all'); break;
    case 'opt': { if (!qz || qz.picked !== null) break; const q = qz.qs[qz.i]; qz.picked = v; if (v === q.ans) qz.score++; else { qz.wrong.push(q.m); const c = S.srs[q.m.id]; S.srs[q.m.id] = { b: 0, d: today() }; save(); } drawQ(); const ex = $('.qz .expl'); if (ex) ex.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); break; }
    case 'qnext': qz.i++; qz.picked = null; drawQ(); break;
    case 'qretry': { const s = qz.scope, id = qz.id; openQuiz(s, id); break; }
    case 'qwrong': { const ms = Array.from(new Set(qz.wrong)); closeOverlays(); fc = { deck: ms, nw: new Set(), title: 'مراجعة الأخطاء', flip: false, total: ms.length, done: 0 }; const el = document.createElement('div'); el.className = 'fc'; app.appendChild(el); drawCard(); break; }
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if ($('.fc')) afterClose(); else closeOverlays(); }
  if (fc && (e.key === ' ' || e.key === 'Enter') && !e.target.closest('button')) { e.preventDefault(); fc.flip = !fc.flip; drawCard(); }
});

/* ---------- routing ---------- */
function route() {
  const h = location.hash.slice(1), m = h.match(/^k([1-9]\d?)(?:-((?:[bm]\d+(?:-f\d+)?)|p\d+|v(?:ar|ur|vo|qa|mc)))?$/);
  if (!m || !D[+m[1] - 1]) { home(); return; }
  const n = +m[1];
  if (m[2] && m[2][0] !== 'v') {
    const K = D[n - 1], x = m[2]; let bi = -1, pi = 0, q;
    if ((q = x.match(/^b(\d+)(?:-(f\d+))?$/))) { bi = +q[1]; if (q[2] && K.babs[bi]) pi = K.babs[bi].fpi['k' + n + '-b' + bi + '-' + q[2]] || 0; }
    else if ((q = x.match(/^m(\d+)$/))) { const mm = byId['k' + n + '-m' + q[1]]; if (mm) { bi = mm.bi; pi = mm.pi || 0; } }
    else if ((q = x.match(/^p(\d+)$/))) { const P = K.parts[+q[1]]; if (P) bi = P.bs[0].i; }
    if (bi >= 0 && bi < K.babs.length) { S.cb[n] = bi; S.cp[n] = pi; S.last = { k: n, b: K.babs[bi].id }; save(); }
  }
  if (m[2] && m[2][0] === 'v') { S.view = m[2].slice(1); save(); kitab(n); return; }
  if (m[2] && /^m\d+$/.test(m[2]) && (S.view === 'vo' || S.view === 'qa' || S.view === 'mc')) { S.view = 'ar'; cur = 0; }
  if (cur === n && app.querySelector('#babs') && app.dataset.v === S.view) {
    closeOverlays();
    if (isPaged()) { const K = D[n - 1], pg = $('#babs .bpg'); if (!pg || pg.dataset.p !== curBab(K) + '-' + curPg(K)) renderMain(); }
    goAnchor(m[2] ? 'k' + n + '-' + m[2] : null, true);
  }
  else kitab(n, m[2] ? 'k' + n + '-' + m[2] : null);
}
window.addEventListener('hashchange', route);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('.scrim')) closeOverlays(); });
document.documentElement.lang = 'ar'; document.documentElement.dir = 'rtl';
applyTheme(); applyFs(); applyUf(); route();
})();
