import re
import json, re, pathlib, sys

root = pathlib.Path(__file__).parent
order = sorted((p.stem for p in (root / 'data').glob('k*.txt')), key=lambda x: (int(re.match(r'k(\d+)', x).group(1)), x))

kitabs = []
for name in order:
    plain = [l for l in (root / 'data_plain' / f'{name}.txt').read_text(encoding='utf-8').splitlines() if l.strip()]
    urdu = [l.strip() for l in (root / 'ur' / f'{name}.txt').read_text(encoding='utf-8').splitlines() if l.strip()]
    assert len(plain) == len(urdu), (name, len(plain), len(urdu))
    vows = [l.strip() for l in (root / 'data' / f'{name}.txt').read_text(encoding='utf-8').splitlines() if l.strip()]
    assert len(vows) == len(plain), name
    for line, ur in zip(vows, urdu):
        if line.startswith('@kitab'):
            n, title = [x.strip() for x in line[6:].split('|', 1)]
            kitabs.append({'n': int(n), 'title': title, 'tu': ur.split('|', 1)[1].strip(), 'babs': []})
        elif line.startswith('@bab'):
            title = line[4:].split('|', 1)[1].strip()
            kitabs[-1]['babs'].append({'t': title, 'tu': ur.split('|', 1)[1].strip(), 'ed': not re.sub('[\u064B-\u0652\u0670]', '', title).startswith('باب'), 'items': []})
        elif line.startswith('~ '):
            kitabs[-1]['babs'][-1]['items'].append(['f', line[2:].strip(), None, ur[2:].strip()])
        elif line.startswith('# '):
            kitabs[-1]['babs'][-1]['items'].append(['l', line[2:].strip(), None, ur[2:].strip()])
        elif line.startswith('> '):
            kitabs[-1]['babs'][-1]['items'].append(['q', line[2:].strip(), None, ur[2:].strip()])
        else:
            kitabs[-1]['babs'][-1]['items'].append(['m', line, None, ur])

# colour worlds: (light k, k-h, soft, deep, bg) | (dark k, k-h, soft, deep, bg)
W = {
    0: (('#34506f', '#34506f', '#e4ebf3', '#162a40', '#f2f5f8'), ('#8fb0d6', '#2a4566', '#1c2937', '#0c1722', '#0d1217')),
    1: (('#0369a1', '#0369a1', '#dceff9', '#053a58', '#eef6fb'), ('#5bbcf0', '#0a5f8f', '#12293a', '#08202f', '#0a141b')),
    2: (('#15803d', '#15803d', '#dff3e6', '#0a4a24', '#eff8f2'), ('#5fd08c', '#146b36', '#11291b', '#08200f', '#0a150e')),
    3: (('#a16207', '#a16207', '#f8ecc8', '#523003', '#fbf6e8'), ('#f0bd4a', '#86520a', '#2b2106', '#221a05', '#16120a')),
    4: (('#6d3fc0', '#6d3fc0', '#e9e1f8', '#38206b', '#f4f0fb'), ('#b69cf5', '#5a35a0', '#231a3a', '#17102b', '#110d1c')),
    5: (('#b0173f', '#b0173f', '#f9dfe6', '#5e0b22', '#fbeff2'), ('#fb7f9a', '#8f1433', '#301018', '#240a12', '#170a0f')),
}

EXTRA = {
    6: (('#0f766e', '#0f766e', '#d9f2ef', '#073f3a', '#eef8f7'), ('#4fd6c8', '#0d6b63', '#0f2b29', '#071f1d', '#0a1514')),
    7: (('#c2410c', '#c2410c', '#fbe3d6', '#6a2406', '#fcf1ea'), ('#ff9d6b', '#9a3412', '#32190d', '#241108', '#18100b')),
    8: (('#4338ca', '#4338ca', '#e8e9fb', '#231d71', '#f1f1fc'), ('#9fa5ff', '#3d36a8', '#1c1d3b', '#12122c', '#0e0e1b')),
    9: (('#4d7c0f', '#4d7c0f', '#e6f1d3', '#26400a', '#f4f9ec'), ('#a3d94f', '#3e6a0c', '#1d2a0d', '#141d08', '#0e140a')),
    10: (('#a21caf', '#a21caf', '#f8e8fa', '#560d5d', '#fbf0fc'), ('#e58bf2', '#82188d', '#2d1030', '#210a24', '#170b19')),
    11: (('#475569', '#475569', '#e3e8ee', '#1f2937', '#f3f5f8'), ('#a9b8cc', '#3b4859', '#1e252e', '#141a21', '#0e1216')),
}
def _lum(h):
    r, g, bl = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    f = lambda v: v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4
    return .2126 * f(r) + .7152 * f(g) + .0722 * f(bl)
def _cr(a, c):
    la, lc = _lum(a), _lum(c); return (max(la, lc) + .05) / (min(la, lc) + .05)
def _dk(h, t, against):
    r, g, bl = [int(h[i:i + 2], 16) for i in (1, 3, 5)]
    for _ in range(90):
        c = '#%02x%02x%02x' % (r, g, bl)
        if all(_cr(c, a) >= t for a in against): return c
        r, g, bl = int(r * .97), int(g * .97), int(bl * .97)
    return c
def _fix(world):
    (lk, lh, ls, ld, lb), (dk, dh, ds, dd, db) = world
    lk = _dk(lk, 5.6, ['#ffffff', ls, lb]); lh = _dk(lh, 6.8, ['#ffffff'])
    dh = _dk(dh, 6.8, ['#ffffff'])
    return ((lk, lh, ls, ld, lb), (dk, dh, ds, dd, db))
W.update(EXTRA)
W = {i: _fix(w) for i, w in W.items()}
NK = len(order) and max(int(re.match(r'k(\d+)', x).group(1)) for x in order)
def widx(n): return n if n <= 11 else ((n - 1) % 11) + 1
def kv(t, dark=False):
    return f'--k:{t[0]};--k-h:{t[1]};--k-soft:{t[2]};--k-deep:{t[3]};--k-bg:{t[4]};--k-ink:{t[0] if dark else t[3]};--on-k:{"#0b141b" if dark else "#ffffff"};'
light = '\n'.join(f'.k{i}{{{kv(W[widx(i)][0])}}}' for i in range(1, NK + 1)) + '\n.k0{' + kv(W[0][0]) + '}'
dmedia = '\n  '.join(f':root:not([data-theme="light"]) .k{i}{{{kv(W[widx(i) if i else 0][1], True)}}}' for i in range(0, NK + 1))
dattr = '\n'.join(f':root[data-theme="dark"] .k{i}{{{kv(W[widx(i) if i else 0][1], True)}}}' for i in range(0, NK + 1))
dark = ('--bg:#0d1217;--surface:#151c23;--surface-2:#1b242d;--ink:#e6ecf1;--muted:#9aa8b5;--line:#27323c;'
        '--shadow:0 1px 2px rgba(0,0,0,.4),0 10px 28px rgba(0,0,0,.35);--ay:#f0c46a;--ay-bg:#2b2410;--ha:#b7c5d3;--ha-bg:#1f2a34;'
        '--im-h:#a3c0ff;--im-y:#62d08e;--im-m:#f3ae52;--im-z:#c7a0ff;'
        '--c-ar:#c3c4ff;--c-ar-bg:#1d1e40;--c-ur:#6ee7b0;--c-ur-bg:#0f2e22;--c-no:#ff9db9;--c-no-bg:#3a1320;--vc-a:#4fd6a0;--vc-o:#f5a742;--vc-q:#b69cf5;--r-must:#ff8a80;--r-sun:#5fd08c;--r-ok:#7db8f5;--r-mak:#f5b25a;--r-bad:#e48bd0;--r-num:#55d0e0;')


PATS = {
 1: "<path d='M0 20Q16 8 32 20T64 20M0 44Q16 32 32 44T64 44' fill='none' stroke='%23fff' stroke-opacity='.16' stroke-width='1.4'/>",
 2: "<path d='M6 62V32a26 26 0 0 1 52 0v30M18 62V34a14 14 0 0 1 28 0v28' fill='none' stroke='%23fff' stroke-opacity='.15' stroke-width='1.3'/>",
 3: "<g fill='none' stroke='%23fff' stroke-opacity='.16' stroke-width='1.3'><circle cx='20' cy='20' r='14'/><circle cx='20' cy='20' r='9'/><circle cx='50' cy='46' r='10'/><circle cx='50' cy='46' r='5'/></g>",
 4: "<g fill='none' stroke='%23fff' stroke-opacity='.17' stroke-width='1.3'><path d='M30 8a22 22 0 1 0 24 32a18 18 0 1 1-24-32z'/><path d='M54 10l1.8 4.6 4.9.2-3.8 3 1.3 4.8-4.2-2.7-4.2 2.7 1.3-4.8-3.8-3 4.9-.2z'/></g>",
 5: "<path d='M32 8l22 12v24L32 56 10 44V20zM10 20l22 12 22-12M32 32v24' fill='none' stroke='%23fff' stroke-opacity='.16' stroke-width='1.3'/>",
}
def pat(i):
    svg = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E" + PATS[i].replace('<','%3C').replace('>','%3E') + "%3C/svg%3E\")"
    return f'.k{i} .hero::before{{background-image:{svg}}}.tile.k{i}::before{{background-image:{svg}}}'
patcss = '\n'.join(pat(i).replace('.k' + str(i) + ' ', '.k' + str(n) + ' ').replace('.tile.k' + str(i) + '::', '.tile.k' + str(n) + '::') for n in range(1, NK + 1) for i in [((n - 1) % 5) + 1])
import base64
_fp = root / 'fonts' / 'jameel-noori-subset.woff2'
jn_face = ''
if _fp.exists():
    jn_face = "@font-face{font-family:'Jameel Noori Nastaleeq';src:url(data:font/woff2;base64," + base64.b64encode(_fp.read_bytes()).decode() + ") format('woff2');font-display:swap}\n"

css = (root / 'src' / 'style.css').read_text(encoding='utf-8')
css = jn_face + (css.replace('/*KLIGHT*/', light).replace('/*KDARKMEDIA*/', dmedia).replace('/*KDARKATTR*/', dattr).replace('/*DARK*/', dark).replace('/*PAT*/', patcss))
js = (root / 'src' / 'app.js').read_text(encoding='utf-8')
data = json.dumps(kitabs, ensure_ascii=False, separators=(',', ':'))
js = js.replace('/*VOCAB*/', (root / 'src' / 'vocab.json').read_text(encoding='utf-8')).replace('/*DATA*/', data).replace('/*PLAN*/', (root / 'src' / 'plan.json').read_text(encoding='utf-8'))

QAJSON = []
for f in sorted((root / 'qa').glob('qa*.txt')):
    for l in f.read_text(encoding='utf-8').splitlines():
        if l.strip():
            p = l.split('|'); assert len(p) == 4, (f, l)
            QAJSON.append({'k': int(p[0]), 'n': int(p[1]), 'q': p[2].strip(), 'a': p[3].strip()})
MCJSON = []
for f in sorted((root / 'qa').glob('mcq*.txt')):
    for l in f.read_text(encoding='utf-8').splitlines():
        if l.strip():
            p = l.split('|'); assert len(p) == 7 and len(set(p[3:])) == 4, (f, l)
            MCJSON.append({'k': int(p[0]), 'n': int(p[1]), 'q': p[2].strip(), 'o': [x.strip() for x in p[3:]]})
js = js.replace('/*QA*/', json.dumps(QAJSON, ensure_ascii=False, separators=(',', ':'))).replace('/*MCQ*/', json.dumps(MCJSON, ensure_ascii=False, separators=(',', ':')))
print('QA', len(QAJSON), 'MCQ', len(MCJSON))

fonts = ('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700'
         '&family=Noto+Nastaliq+Urdu:wght@400;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap')
frag = (f'<title>الحیات علوم اسلامیہ (مطالعہ فقہ اسلامی: القدوری)</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
        f'<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        f'<link rel="stylesheet" href="{fonts}">\n<style>\n{css}\n</style>\n'
        f'<div id="app" class="k0" dir="rtl" lang="ar"></div>\n<script>\n{js}\n</script>\n')
import seo
(root / 'docs').mkdir(exist_ok=True)
_strip = lambda s: re.sub('[\u064B-\u065F\u0670\u06D6-\u06ED]', '', s)
seo_head = seo.run(root, kitabs, _strip)
frag_seo = frag.replace('<title>مختصر القدوري</title>\n', '', 1)
test = ('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' + seo_head +
        '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>'
        + frag_seo + '<noscript><h1>مختصر القدوري</h1><p>' + seo.DESC + '</p>' + ''.join('<a href="k%d/">%s</a> ' % (k['n'], _strip(k['title'])) for k in kitabs) + '</noscript></body></html>')
(root / 'docs' / 'index.html').write_text(test, encoding='utf-8')
(root / 'index.html').write_text(test, encoding='utf-8')

tot = 0
for k in kitabs:
    m = sum(1 for b in k['babs'] for it in b['items'] if it[0] == 'm')
    tot += m
    print(k['n'], k['title'], 'babs', len(k['babs']), 'masail', m)
print('total masail', tot, '| html bytes', len(frag.encode('utf-8')))
