"""Rebuild the reader from locally retained, cited classical source extracts.
Run after build.py. No network access; quoted text must be a literal source substring.
"""
from pathlib import Path
from lxml import html, etree
import json,re,html as h,hashlib,copy
R=Path(__file__).parent
E=lambda s:h.escape(str(s),quote=True)
P=json.loads((R/'classical-pages.json').read_text())
rows=json.loads((R/'content.json').read_text())
# Unmodified earlier translations and exercises retain their original provenance.
if not (R/'audit/reader-baseline.json').exists():
 (R/'audit/reader-baseline.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
base=json.loads((R/'audit/reader-baseline.json').read_text())
byid={d['id']:d for d in base}
bank=json.loads((R/'learning-content.json').read_text())
from card_titles import TITLES

def normmap(s):
 out=[];idx=[]
 for i,c in enumerate(s):
  if '\u064b'<=c<='\u065f' or c in '\u0670\u0640':continue
  c={'أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ى':'ي'}.get(c,c)
  if c.isspace():
   if out and out[-1]==' ':continue
   c=' '
  out.append(c);idx.append(i)
 return ''.join(out),idx

def cut(key,start=None,end=None):
 s=P[key]['text'];a=0;b=len(s);n,ix=normmap(s)
 if start:
  needle=normmap(start)[0];v=n.find(needle)
  assert v>=0,(key,start)
  a=ix[v]
 if end:
  needle=normmap(end)[0];v=n.find(needle,next((j for j,z in enumerate(ix) if z>=a),0))
  assert v>=0,(key,end)
  b=ix[v]
 text=s[a:b].strip();assert text and text in s
 return {'key':key,'text':text,'citation':P[key]['citation']['markdown'],'sha256':hashlib.sha256(text.encode()).hexdigest()}

def citation(q):
 label,url=re.fullmatch(r'\[(.*)\]\((.*)\)',q['citation']).groups()
 return f'<a class="book-cite" href="{E(url)}" target="_blank" rel="noopener" lang="ar" dir="rtl">{E(label)}</a>'

primary={
'65050':[('1681:5827',None,None)],'66304':[('1681:13',None,'تابعه عبد الله')],
'10840':[('1681:11',None,None)],'10841':[('1727:5994',None,None)],'10843':[('1681:14',None,None)],
'65051':[('117359:712','٧٨٨ -',None)],'65231':[('1681:7426',None,None)],'4217':[('1681:7427',None,None)],
'4947':[('1681:10847',None,None)],'3272':[('711:446',None,None)],
'66529':[('117359:3905','٤٦٠٧ -',None),('117359:3906',None,None)],
'65005':[('1363:2486','٢٨٥٥ -',None),('1363:2487',None,'١١ - باب')],
'4792':[('1681:4269',None,None)],'4725':[('1681:10854',None,None)],'6078':[('711:4033',None,None)],
'65121':[('1681:42',None,None)],'5518':[('1681:135',None,None)],'4233':[('1681:150',None,None)],
'6820':[('1363:2481','٢٨٤٨ -','٢٨٤٩ -')],'3686':[('1681:5357',None,None)],'65043':[('1681:200',None,None)],
'65077':[('117359:3070','٣٦٤٦ -',None),('117359:3071',None,'٣٦٤٧ -')],
'10849':[('711:8976',None,None)],'6982':[('711:8',None,None),('711:9',None,None)],'5913':[('1681:7490',None,None)],
'10113':[('711:2181',None,None)],'5907':[('711:2158',None,None)],'3772':[('1681:139',None,None)],
'65285':[('711:376',None,None)],'10851':[('1727:1804',None,None)],'10119':[('711:2226',None,None)],
'65059':[('711:2210',None,None)],'5795':[('1681:78',None,None)],'6389':[('1681:5481',None,None)],
'11282':[('1681:1831',None,None)],'3373':[('711:8146',None,None)],'3506':[('1727:2284',None,None)],
'3395':[('98138:2143','٣٠٢٩ -','٦٤ - باب')],'4801':[('711:8207',None,None)],'66272':[('711:7902',None,None)]}
# Each tuple specifies an exact, deliberately bounded excerpt, not an invented reconstruction.
commentaries={
'65050':[('18103:5073','(أنزل)،','* * *')],
'66304':[('18103:119',None,'(تابعه عبد الله)')],
'10840':[('122406:4145','وقوله في صفة نزول الوحي','وقال لنا الوزير')],
'10841':[('1711:3360','[٢٣٣٤]','[٢٣٣٥]')],
'10843':[('13252:755','ولمسلم: فإذا ذهب','ورواه الترمذاي')],
'65051':[('131521:2524','[٧٨٨]',None),('131521:2525',None,'وأخرج الحاكم')],
'65231':[('13252:14223','الشرح:',None)],
'4217':[('18103:6318','(تابع)؛',None),('18103:6319',None,'* * *')],
'4947':[('18103:8573','(أبى)؛','* * *')],
'3272':[('132524:362','(٥٠) ومن باب',None)],
'66529':[('131521:11852','(تمسكوا بها)','[٤٦٠٨]')],
'65005':[('1337:1927','• قوله:',None)],
'4792':[('1711:2584','[١٧١٨]','باب بيان خير الشهود')],
'4725':[('1711:1981',None,'(باب')],
'6078':[('1711:2055','[١٤٠١]','[١٤٠٢]')],
'65121':[('18103:217','(بما يطيقون)','والسر في ذلك')],
'5518':[('18103:421','(يفقهه)','قال التوربشتي')],
'4233':[('122406:4094','هذا بديع',None),('122406:4095','لا تنبت ولا تمسك ماء.','وقوله:')],
'6820':[('131521:9818','(امرأ سمع منا حديثا فحفظه)','(فرب حامل فقه)')],
'3686':[('16946:1468','قوله:',None),('16946:1469',None,None)],
'65043':[('1711:69','الثانية تعظيم','ولكن')],
'65077':[('131521:9785','(قال: كنت أكتب',None),('131521:9786',None,'(فنهتني)')],
'10849':[('13252:1633',None,None)],
'6982':[('1711:65',None,'(باب تغليظ')],
'5913':[('18103:6358','(خيركم)',None),('18103:6359',None,'(أو علمه)')],
'10113':[('1711:1260','[٧٩٨]',None),('1711:1261',None,'(باب')],
'5907':[('18103:6365','قال الطيبي:','وقال: السين')],
'3772':[('18103:430',None,None)],
'65285':[('122406:414','ذلك نسخ،',None)],
'10851':[('122406:1458','وقوله: " اقرؤوا الزهراوين','قال أبو عبيد:')],
'10119':[('132524:1055','وقوله: إن الله يرفع',None)],
'65059':[('122406:1463','وقوله لأبي',None)],
'5795':[('16946:74','معنى هذا الكلام:','يقول:')],
'6389':[('122406:4137','وقول عائشة:',None)],
'11282':[('13252:5019','وقد ثبتت العلة','وقال أبو بكر')],
'3373':[('1711:3717','[١٠١٧]',None),('1711:3718',None,None)],
'3506':[('1711:1515',None,None),('1711:1516',None,'قوله')],
'3395':[('9810:3656','قوله:',None)],
'4801':[('1711:3738','[٢٦٩٩]',None),('1711:3739',None,'فينبغي أن')],
'66272':[('122406:4501','وقوله: " لا ينبغي','فمن دعا على أخيه')]}

# These are editorial summaries of the cited extracts; they are never printed as quotations.
summaries=[
('وحی کے نزول سے مراد نبوت کا آغاز ہے۔ اس روایت کے ادوار کو جمع کرنے سے عمرِ نبوی ﷺ تریسٹھ برس بنتی ہے۔','The commentary identifies the beginning of revelation and explains the lifespan indicated by the reported periods.'),
('سورۂ مدثر کی یہ آیات وقفۂ وحی کے بعد نازل ہوئیں۔ اس واقعے کو پہلی وحی کے واقعے سے الگ سمجھنا چاہیے۔','These verses of al-Muddaththir followed the pause in revelation; the passage distinguishes this from the first revelation.'),
('قاضی عیاض صلصلۂ جرس کو آواز کی کیفیت سے متعلق بیان کرتے ہیں۔ «یفصم» کے معنی اس کیفیت کے دور ہونے اور ختم ہونے کے ہیں۔','Qadi Iyad explains the description of the sound and the meaning of the revelation ceasing.'),
('امام نووی کے مطابق «تربد» کا مطلب چہرے کا رنگ بدلنا ہے۔ وہ اس کیفیت اور دوسری روایت میں مذکور سرخی کے درمیان ممکنہ تطبیق بھی بیان کرتے ہیں۔','Al-Nawawi explains the change of colour and discusses how it relates to another report describing redness.'),
('ابن الملقن متعلقہ روایات جمع کرتے ہیں: پہلے وحی کو توجہ سے سننا تھا، پھر اللہ کے وعدے کے مطابق اسے پڑھنا تھا۔','Ibn al-Mulaqqin brings together the reports about listening first and then reciting as promised by Allah.'),
('ابن رسلان «فصل السورة» کی وضاحت سورت کے ختم ہونے سے کرتے ہیں۔ بسم اللہ نازل ہونے سے ایک سورت کے اختتام اور دوسری کے آغاز کا علم ہوتا تھا۔','Ibn Raslan explains the separation as the ending of a surah, made known by the descent of the basmalah.'),
('ابن الملقن اس مقام پر انبیائے سابقین کی نشانیوں اور قرآن کے معجزہ ہونے کا ذکر کرتے ہیں۔','Ibn al-Mulaqqin discusses earlier prophetic signs and the Quran as a miracle.'),
('شارح «تابع» سے مراد وفات کے قریب وحی کا پہلے سے زیادہ تسلسل سے نازل ہونا بیان کرتے ہیں۔','The commentator explains the increased succession of revelation near the end of the Prophet’s life.'),
('شارح «اباء» کی وضاحت دعوت قبول نہ کرنے یا حکم کی تعمیل سے انکار کے طور پر کرتے ہیں۔ وہ نافرمان مسلمان کے بارے میں بھی الگ وضاحت دیتے ہیں، اس لیے اس روایت سے ہر گناہگار کے کفر کا حکم نہیں نکالا جاتا۔','The commentator distinguishes refusal of the invitation from disobedience and discusses the sinful believer separately.'),
('قرطبی «امت» سے ان لوگوں کو مراد لیتے ہیں جن کی طرف رسول اللہ ﷺ مبعوث ہوئے اور جن پر حجت لازم ہوئی۔ وہ اسی مقام پر دعوت نہ پہنچنے کی صورت بھی الگ بیان کرتے ہیں۔','Al-Qurtubi explains the addressed community and separately discusses those not reached by the prophetic invitation.'),
('ابن رسلان سنت کو مضبوطی سے تھامنے کی وضاحت کرتے ہیں۔ وہ نئی باتوں میں ایسی صورت جو اصلِ شرعی سے خالی ہو اور ایسی صورت جو اصولِ شرع پر قائم ہو، دونوں میں فرق بھی بیان کرتے ہیں۔','Ibn Raslan explains adherence to the Sunnah and distinguishes unsupported innovations from matters grounded in established principles.'),
('سندی کے مطابق رسول اللہ ﷺ کی حرام کردہ چیز کے حکم کو قبول کرنا بھی اسی طرح لازم ہے جیسے اللہ تعالیٰ کے حکم کو قبول کرنا۔','Al-Sindi explains the obligation to accept the Prophet’s prohibition.'),
('امام نووی «رد» کے معنی مردود اور ناقابلِ اعتبار بیان کرتے ہیں۔ دوسری روایت میں خود نئی بات نکالنے اور پہلے سے موجود خلافِ شرع کام کرنے، دونوں کی تردید شامل ہے۔','Al-Nawawi explains rejection and the significance of the second wording concerning an act already introduced by someone else.'),
('امام نووی اس حدیث کو اہم اسلامی قواعد میں شمار کرتے ہیں۔ کسی مامور کام کے بعض اجزا سے عاجزی ہو تو استطاعت کے مطابق باقی کام کیا جائے۔','Al-Nawawi identifies an important rule: inability to perform part of a commanded act does not remove what remains possible.'),
('امام نووی کے مطابق یہاں مذمت سنت سے اعراض کی ہے۔ عجز یا کسی جائز سبب سے ایک مخصوص عمل نہ کرنا اس کے برابر نہیں ہے۔','Al-Nawawi distinguishes turning away from the Sunnah from leaving a particular act for a valid reason.'),
('شارح استطاعت کی وضاحت ایسے عمل سے کرتے ہیں جس پر دوام ممکن ہو۔ یہ وضاحت عمل پر قائم رہنے کی اہمیت ظاہر کرتی ہے۔','The commentary relates capacity to sustaining an act, rather than taking on so much that it is abandoned.'),
('«فقہ» کے لغوی معنی سمجھ کے ہیں۔ شارح اسے دینی علوم کی سمجھ سے متعلق بیان کرتے ہیں اور سمجھ و توفیق کو اللہ کی عطا قرار دیتے ہیں۔','The commentator explains fiqh as understanding and relates its scope to religious knowledge.'),
('قاضی عیاض تین مثالوں میں فرق کرتے ہیں: خود سمجھ کر دوسروں کو فائدہ پہنچانا، علم محفوظ کر کے آگے پہنچانا، اور ہدایت کو قبول ہی نہ کرنا۔','Qadi Iyad distinguishes understanding and teaching, preserving and transmitting, and failing to receive guidance.'),
('ابن رسلان اسی مضمون کی روایت کی شرح میں سنی ہوئی بات کو محفوظ رکھنے اور آگے پہنچانے کی فضیلت بیان کرتے ہیں۔ علم رکھنے والے کو اپنے سے کم درجے کے شخص سے بھی فائدہ حاصل کرنے میں جھجک نہیں ہونی چاہیے۔','In his commentary on a parallel report, Ibn Raslan emphasizes retention and transmission and learning even from someone of a lower scholarly rank.'),
('خطابی تبلیغ کے حکم اور بنی اسرائیل کی روایت بیان کرنے کی اجازت میں فرق کرتے ہیں۔ وہ نبی ﷺ کی طرف بات منسوب کرنے میں قابلِ اعتماد سند کی ضرورت بھی بیان کرتے ہیں۔','Al-Khattabi distinguishes the command to convey from permission to report Israelite accounts and stresses reliable transmission from the Prophet.'),
('امام نووی رسول اللہ ﷺ پر جھوٹ باندھنے کی حرمت کو نہایت سنگین قرار دیتے ہیں۔','Al-Nawawi stresses the grave prohibition of falsely attributing statements to the Prophet.'),
('ابن رسلان لکھنے کے ساتھ ضبط، استاد سے تصحیح اور یاد رکھنے کی اہمیت بیان کرتے ہیں۔ صرف کتابیں جمع کرنا کافی نہیں ہے۔','Ibn Raslan emphasizes checking written material with the teacher and retaining it, rather than merely accumulating books.'),
('ابن الملقن کتابت سے منع کرنے اور اجازت دینے کی روایات میں ایک سے زیادہ توجیہات بیان کرتے ہیں۔ ان میں قرآن کے ساتھ اختلاط کا اندیشہ اور اس کے دور ہونے کی صورت بھی شامل ہے۔','Ibn al-Mulaqqin records alternative explanations reconciling the prohibition and permission to write, including concern about mixing material with the Quran.'),
('امام نووی معلوم یا غالب گمان کے مطابق جھوٹی روایت نقل کرنے کی سنگینی واضح کرتے ہیں۔ وہ «یُریٰ» اور «کاذبین» کی قراءتوں کی وضاحت بھی کرتے ہیں۔','Al-Nawawi explains the readings and the warning about transmitting what is known or strongly suspected to be false.'),
('شارح اس فضیلت کو قرآن سیکھنے اور سکھانے سے متعلق بیان کرتے ہیں۔ وہ واضح کرتے ہیں کہ اس سے ہر جہت سے مطلق افضلیت لازم نہیں آتی۔','The commentator explains the excellence of learning and teaching the Quran without treating it as an unrestricted ranking in every respect.'),
('امام نووی ماہر قاری اور مشقت کے ساتھ پڑھنے والے دونوں کا اجر بیان کرتے ہیں۔ دو اجر ہونے سے یہ لازم نہیں آتا کہ مشقت والا قاری ماہر سے افضل ہے۔','Al-Nawawi explains both rewards and states that the two rewards do not make the struggling reader superior to the proficient one.'),
('شارح قرآن کے یاد رہنے کی مثال باندھے ہوئے اونٹوں سے دیتے ہیں۔ اس نعمت کی حفاظت کے لیے مسلسل تلاوت اور یاد دہانی ضروری ہے۔','The commentary explains the comparison with tethered camels and the need for regular revision.'),
('یہاں حسد سے مراد غبطہ، یعنی دوسرے کی نعمت چھننے کی خواہش کے بغیر ویسی بھلائی کی آرزو، بیان کی گئی ہے۔ مال کے خرچ میں «حق» کی قید بھی اہم ہے۔','The commentary explains emulation rather than wishing another person’s blessing removed, and notes the condition of spending rightly.'),
('قاضی عیاض اس مقام پر نسخ اور تخصیص کی مختلف توجیہات نقل کرتے ہیں اور اپنی رائے بھی بیان کرتے ہیں۔ اس اختلاف کو ایک ہی متفقہ قول کے طور پر پیش نہیں کیا گیا۔','Qadi Iyad records different explanations concerning abrogation and specification and sets out his own position; the positions are kept distinct.'),
('قاضی عیاض «زہراوین» کے معنی روشن کرنے والی دو سورتیں بیان کرتے ہیں۔ وہ ان کے قیامت میں آنے کی تفسیر میں اجر و جزا سے متعلق قول بھی نقل کرتے ہیں۔','Qadi Iyad explains the name of the two surahs and reports an interpretation relating their appearance to the reward for recitation.'),
('قرطبی کے مطابق قرآن کی وجہ سے عزت علم، توجہ اور عمل کے ساتھ متعلق ہے؛ اسے چھوڑنے، اس سے بے علمی اور اس پر عمل نہ کرنے کی صورت بھی الگ بیان کرتے ہیں۔','Al-Qurtubi connects honour through the Quran with attention, knowledge and action, and explains the contrasting neglect.'),
('قاضی عیاض اس واقعے میں استاد کے سوال کرنے، درست جواب پر شاگرد کی حوصلہ افزائی اور اس کی علمی صلاحیت نمایاں کرنے کا پہلو بیان کرتے ہیں۔','Qadi Iyad draws attention to questioning students and encouraging a sound answer.'),
('خطابی کے مطابق حدیث عبادت میں اعتدال اور نفس پر ناقابلِ برداشت بوجھ نہ ڈالنے کی تعلیم دیتی ہے۔','Al-Khattabi explains moderation in worship and avoiding an overwhelming burden.'),
('قاضی عیاض آسان اور نرم طریقہ اختیار کرنے کی وضاحت کرتے ہیں، مگر ناجائز کام اختیار کرنا اس میں شامل نہیں ہے۔','Qadi Iyad explains choosing the gentler course while excluding what is unlawful.'),
('ابن الملقن روایت میں مذکور عدمِ مداومت کی علت لوگوں پر فرض ہو جانے کا اندیشہ بیان کرتے ہیں۔','Ibn al-Mulaqqin explains the stated concern that an act might become obligatory for the community.'),
('امام نووی کے مطابق خیر یا گمراہی کی دعوت کا اثر بعد میں عمل کرنے والوں تک پہنچتا ہے۔ یہ بات صرف پہلی بار کوئی کام شروع کرنے والے تک محدود نہیں ہے۔','Al-Nawawi explains continuing responsibility for guidance or misguidance, including promoting something already practised.'),
('امام نووی صدقے میں پہل کرنے کے واقعے کو حدیث کا سبب بیان کرتے ہیں۔ وہ اچھی سنت اور مذموم نئی باتوں کے بارے میں اپنا تفصیلی موقف بھی نقل کرتے ہیں۔','Al-Nawawi relates the saying to the first donation and sets out his interpretation of good practices and blameworthy innovations.'),
('سندی غلو کی وضاحت دین میں تشدد اور حد سے بڑھنے سے کرتے ہیں۔ وہ اس لفظ کی دوسری توجیہات بھی نقل کرتے ہیں۔','Al-Sindi explains excess as over-severity and passing the limit, and records additional explanations of the term.'),
('امام نووی ضرورت مند کی مدد، علم سیکھنے اور قرآن کے اجتماعی مطالعے کی فضیلت بیان کرتے ہیں۔ نسب اچھے عمل کی کمی پوری نہیں کرتا۔','Al-Nawawi discusses practical help, learning and collective Quran study, and explains that lineage cannot compensate for deficient deeds.'),
('قاضی عیاض کثرتِ لعنت کو اہلِ ایمان کے رحیمانہ اخلاق کے خلاف بیان کرتے ہیں اور اسی ضمن میں رحمت والی اس روایت کا ذکر کرتے ہیں۔','Qadi Iyad contrasts habitual cursing with the merciful character of believers and cites this narration in that discussion.')]

records={}
for d,(ur,en) in zip(base,summaries):
 id=d['id'];ps=[cut(*x) for x in primary[id]];cs=[cut(*x) for x in commentaries[id]]
 records[id]={'id':id,'primary':ps,'commentary':cs,'summaryUr':ur,'summaryEn':en,
 'summaryType':'Editorial summary of the cited classical extract; not a quotation',
 'translationProvenance':{'publisher':'HadeethEnc.com','snapshot':'2026-10-17','scope':'Existing English and Urdu translations of the meaning retained unchanged; not classical quotations'},
 'reviewScope':'Literal extraction checked against the retrieved digital transcription, not a printed-page facsimile or independent specialist authentication.'}
(R/'classical-content.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
print('Prepared',len(records),'classical source records')

# Replace only the reader presentation; preserve every established route and lesson ID.
for d in base:
 id=d['id'];rec=records[id];p=R/'hadith'/f'{d["slug"]}.html'
 old=html.fromstring((R/'audit/reader-html'/p.name).read_text());head=old.find('head')
 # Canonical metadata is maintained by configure_seo.py after this rebuild.
 # The supplied deployment's metadata is retained elsewhere; set all deployment URLs in configure_seo.py.
 for name in ['reader.css']:
  head.append(html.Element('link',rel='stylesheet',href='../assets/'+name+'?v=20261024'))
 settings=old.xpath('//dialog[@id="settings"]')[0]
 outline=old.xpath('//dialog[@id="outline"]')[0]
 notes=old.xpath('//details[@data-stage="note"]/div')[0]
 qa=old.xpath('//details[@data-stage="question"]/div')[0]
 quiz=old.xpath('//details[@data-stage="quiz"]/div')[0]
 # Legacy web-publisher quotations remain in the audit archive, never relabelled as classical quotations.
 for container in [qa,quiz]:
  for e in list(container.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," source-evidence ") or contains(concat(" ",normalize-space(@class)," ")," learning-credit ")]')):
   if e.getparent() is not None:e.getparent().remove(e)
  for e in list(container.xpath('.//*[contains(@class,"learning-intro")]')):
   e.text='Editorial learning questions. Read the hadith and the cited commentary alongside these exercises.'
 def serial(e):return html.tostring(e,encoding='unicode',method='html')
 def reference_list(items):return ''.join('<li>'+citation(q)+'</li>' for q in items)
 def passages(items,kind):
  return ''.join('<section class="source-extract"><p class="extract-label">'+kind+'</p><blockquote lang="ar" dir="rtl">'+E(q['text'])+'</blockquote><p>'+citation(q)+'</p></section>' for q in items)
 sectionrows=[a for a in base if a['section']==d['section']]
 sidebar=''.join('<a '+('aria-current="page" ' if a['id']==id else '')+'href="'+a['slug']+'.html"><span>'+f'{a["number"]:02d}'+'</span><span>'+E(a['title'])+'</span><span data-card-status="'+a['id']+'"></span></a>' for a in sectionrows)
 prev=base[d['number']-2] if d['number']>1 else None
 nxt=base[d['number']] if d['number']<40 else None
 prevlink='<a href="'+prev['slug']+'.html" rel="prev">← Previous <small>'+E(prev['title'])+'</small></a>' if prev else '<span class="nav-boundary">First hadith</span>'
 nextlink='<a href="'+nxt['slug']+'.html" rel="next">Next → <small>'+E(nxt['title'])+'</small></a>' if nxt else '<a href="../library.html">Finish · Library →</a>'
 # A quotation copied directly from the collection; chain and narrator wording remain intact.
 direct='\n\n'.join(q['text'] for q in rec['primary'])
 en=d['en'];ur=d['ur'];arTitle,urTitle=TITLES[d['number']-1]
 body=f'''<body data-single="true" data-reader="true"><a class="skip" href="#reader">Skip to lesson</a>
<header class="lesson-site-header"><a class="lesson-brand" href="../index.html"><span aria-hidden="true">ح</span><b>Al-Hayat<small>Centre for Islamic Studies</small></b></a><nav aria-label="Site navigation"><a href="../library.html">Library</a><a href="../library.html?view=saved#reader">Saved</a><a href="../sources.html">Sources</a><button id="theme" class="theme-btn" aria-label="Switch theme">☾</button></nav></header>
<main class="lesson-layout"><aside class="lesson-sidebar" aria-label="Section lessons"><a class="back-course" href="../index.html">← Course home</a><p class="eyebrow">SECTION {d['section']} OF 5</p><h2>{E(d['sectionTitle'])}</h2><p class="sidebar-meta">Eight lessons · Read at your pace</p><nav>{sidebar}</nav><a class="all-lessons" href="../library.html?section={d['section']}#reader">Browse this section →</a><button class="button" data-dialog="outline">All forty hadith</button></aside>
<div class="lesson-main" id="reader"><nav class="lesson-breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Home</a><span>›</span><a href="../library.html">Revelation &amp; Sunnah</a><span>›</span><span>Hadith {d['number']:02d}</span></nav>
<header class="lesson-heading"><div class="lesson-position"><span>HADITH {d['number']:02d} / 40</span><span>Section {d['section']} · Lesson {(d['number']-1)%8+1} of 8</span></div><h1>{E(d['title'])}</h1><p class="lesson-title-ar" lang="ar" dir="rtl">{E(arTitle)}</p><p class="lesson-title-ur" lang="ur" dir="rtl">{E(urTitle)}</p><div class="lesson-tools"><label>Translation <select id="translation-choice"><option value="ur">اردو</option><option value="en">English</option><option value="both">اردو + English</option><option value="none">Arabic only</option></select></label><button data-save="{id}" aria-pressed="false">☆ Save</button><button data-dialog="settings">Reading settings</button><button id="memorize" aria-pressed="false">Memorize</button><button data-copy="{id}">Copy</button><button id="native-share">Share</button></div></header>
<nav class="lesson-tabs js-only" role="tablist" aria-label="Lesson activities"><button role="tab" id="tab-read" aria-controls="panel-read" aria-selected="true" tabindex="0" data-tab="read"><b>Read</b><span lang="ur">حدیث</span></button><button role="tab" id="tab-understand" aria-controls="panel-understand" aria-selected="false" tabindex="-1" data-tab="understand"><b>Understand</b><span lang="ur">تشریح</span></button><button role="tab" id="tab-practice" aria-controls="panel-practice" aria-selected="false" tabindex="-1" data-tab="practice"><b>Practice</b><span lang="ur">مشق</span></button><button role="tab" id="tab-notes" aria-controls="panel-notes" aria-selected="false" tabindex="-1" data-tab="notes"><b>Notes</b><span lang="ur">میرے نوٹس</span></button></nav>
<article class="hadith-card lesson-content" id="hadith-{id}" data-id="{id}">
<section id="panel-read" role="tabpanel" aria-labelledby="tab-read" class="lesson-panel" tabindex="0"><div class="panel-heading"><h2>Read the hadith</h2><span class="text-badge">Arabic source text</span></div><p class="reading-description">Text from the cited collection, including its chain where present. Page divisions and wording follow the linked digital edition.</p><div class="language-ar arabic primary-narration" lang="ar" dir="rtl">{E(direct)}</div><div class="compact-citations">{''.join(citation(q) for q in rec['primary'])}</div><button class="button reveal-button js-only" data-reveal="{id}" aria-expanded="false">Reveal translations</button>
<div class="translation language-ur" data-translation="ur"><p class="extract-label">URDU · TRANSLATION OF THE MEANING</p><p class="urdu" lang="ur" dir="rtl">{E(ur)}</p></div><div class="translation language-en" data-translation="en"><p class="extract-label">ENGLISH · TRANSLATION OF THE MEANING</p><p class="en-text" lang="en" dir="ltr">{E(en)}</p></div>
<details class="source-register" id="lesson-sources"><summary>References &amp; text provenance <span lang="ur">حوالہ جات</span></summary><div><h3>Hadith collection</h3><ul>{reference_list(rec['primary'])}</ul><h3>Classical commentary</h3><ul>{reference_list(rec['commentary'])}</ul><p>Quotations are literal extracts from the cited digital transcriptions. Volume/page details belong to those editions. Printed facsimile verification and independent specialist sign-off are not claimed.</p><p>English and Urdu translations of the meaning are retained from HadeethEnc.com, snapshot 17 October 2026. They omit the full chain and may follow a shorter or parallel wording. They are not quotations from the classical commentators. <a href="{E(d['source'])}" target="_blank" rel="noopener">Translation record</a>.</p><p>Commentary excerpts are selected passages, not the complete commentary or an exhaustive account of every scholarly view. Editorial summaries and exercises are separate from transmitted text.</p></div></details><button class="button next-activity js-only" data-tab-open="understand">Open classical explanation →</button></section>
<section id="panel-understand" role="tabpanel" aria-labelledby="tab-understand" class="lesson-panel" tabindex="0"><div class="panel-heading"><h2>Understand the hadith</h2><span class="text-badge">Classical commentary</span></div><p class="reading-description">The Arabic below is quoted from the books. The summaries are editorial renderings of the cited extract.</p><div class="summary-ur" lang="ur" dir="rtl"><h3>شرح کا خلاصہ</h3><p>{E(rec['summaryUr'])}</p>{''.join(citation(q) for q in rec['commentary'])}</div><details class="english-summary"><summary>English summary</summary><p>{E(rec['summaryEn'])}</p>{''.join(citation(q) for q in rec['commentary'])}</details>{passages(rec['commentary'],'CLASSICAL ARABIC · QUOTED EXTRACT')}<button class="button next-activity js-only" data-tab-open="practice">Start practice →</button></section>
<section id="panel-practice" role="tabpanel" aria-labelledby="tab-practice" class="lesson-panel" tabindex="0"><div class="panel-heading"><h2>Practice &amp; revision</h2><span class="text-badge">{len(bank[id]['qa'])} Q&amp;A · {len(bank[id]['mcq'])} MCQs</span></div><p class="reading-description">These are editorial teaching exercises, not hadith wording or quotations from the commentators. <button class="inline-button" data-tab-open="read">Read the source</button> or <button class="inline-button" data-tab-open="understand">return to the commentary</button>.</p><details class="practice-group"><summary>Short questions &amp; answers · {len(bank[id]['qa'])}</summary>{serial(qa)}</details><div class="practice-quiz"><h3>Check your understanding</h3>{serial(quiz)}</div></section>
<section id="panel-notes" role="tabpanel" aria-labelledby="tab-notes" class="lesson-panel" tabindex="0"><div class="panel-heading"><h2>My notes</h2><span class="text-badge">Private to this browser</span></div><p class="reading-description">Record your understanding, questions or a practical reflection. Your own words remain separate from the source text.</p>{serial(notes)}</section>
<div class="lesson-completion"><label><input type="checkbox" data-read="{id}"> Mark as read <span lang="ur">مطالعہ مکمل</span></label><span data-card-status="{id}"></span></div></article><nav class="desktop-lesson-nav" aria-label="Previous and next hadith">{prevlink}<button data-dialog="outline">Contents · {d['number']} / 40</button>{nextlink}</nav><footer class="lesson-footer">Al-Hayat Centre for Islamic Studies · Prepared by Dr. Imran Hayat<br><a href="../sources.html">Sources and editorial policy</a></footer></div></main>
<nav class="lesson-bottom-nav" aria-label="Lesson navigation">{prevlink}<button data-dialog="outline"><b>{d['number']:02d} / 40</b><small>Contents</small></button>{nextlink}</nav>{serial(settings)}{serial(outline)}<div id="toast" role="status" aria-live="polite" hidden></div>
<script src="../assets/navigation.js" defer></script><script src="../assets/entries/{id}.js" defer></script><script src="../assets/app.js" defer></script><script src="../assets/learning.js" defer></script><script src="../assets/reader.js" defer></script></body>'''
 page='<!doctype html><html lang="en">'+serial(head)+body+'</html>'
 p.write_text(page)
 # Copy and search use the new source transcription; existing translations remain attributed.
 rd=copy.deepcopy(d);rd['ar']=direct;rd['source']=re.search(r'\]\((.*?)\)',rec['primary'][0]['citation']).group(1);rd['primary']=rd['source'];rd['ref']=' · '.join(re.search(r'\[(.*?)\]',q['citation']).group(1) for q in rec['primary']);rd['explanation']=rec['summaryEn'];rd['explanationUr']=rec['summaryUr'];rd['publisher']='Classical collection; translations separately attributed';rd['classical']=rec
 js=lambda v:json.dumps(v,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
 (R/'assets/entries'/f'{id}.js').write_text('window.HADITH_DATA=window.HADITH_DATA.map(d=>d.id==='+js(id)+'?'+js(rd)+':d);window.LEARNING_DATA='+js({id:bank[id]})+';')

# Extend the collection bibliography with per-lesson book references.
sources=html.fromstring((R/'audit/sources-baseline.html').read_text());main=sources.xpath('//main')[0]
for e in main.xpath('./h1'):e.text='Sources, editions & editorial policy'
intro=html.fragment_fromstring('<section class="classical-register"><h2>Classical hadith collections and commentaries</h2><p>Each lesson now displays Arabic extracted directly from its cited collection and literal Arabic commentary extracts. Shamela supplies the digital access links. The links below identify the volume/page of the digital edition used. An edition difference is not silently merged into another narration.</p><p>Existing English/Urdu translations and editorial exercises retain their provenance; they are not attributed to classical scholars. New summaries are explicitly editorial. The previous publisher explanations are retained in the audit files, not used as the new classical commentary.</p>'+''.join('<details><summary>'+f'{d["number"]:02d} · '+E(d['title'])+'</summary><h3>Hadith</h3><ul>'+reference_list(records[d['id']]['primary'])+'</ul><h3>Commentary</h3><ul>'+reference_list(records[d['id']]['commentary'])+'</ul><a href="hadith/'+d['slug']+'.html#understand">Open lesson →</a></details>' for d in base)+'</section>')
main.insert(1,intro)
# Retain the historical register as provenance, but do not make it the current book bibliography.
for node in main.xpath('./h2'):
 if node.text=='Complete reference register':node.text='Earlier translation record register'
(R/'sources.html').write_text('<!doctype html>'+html.tostring(sources,encoding='unicode',method='html'))
print('Rebuilt 40 focused readers and the classical reference register.')
