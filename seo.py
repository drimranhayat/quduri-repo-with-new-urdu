"""SEO generator: static, crawlable pages + robots.txt + sitemap.xml + manifest.
Called from build.py after the app is built. Set SITE below if the URL changes."""
import html, json, datetime, pathlib

SITE = 'https://drimranhayat.github.io/quduri-repo-with-new-urdu/'
NAME = 'الحیات علوم اسلامیہ (مطالعہ فقہ اسلامی: القدوری)'
DESC = ('الحیات علوم اسلامیہ — مطالعہ فقہ اسلامی: مختصر القدوري (کتاب الطہارۃ، الصلاۃ، الزکاۃ، الصوم، الحج) مکمل عربی متن اعراب کے ساتھ، اردو ترجمہ، مفردات، '
        'سوال جواب اور MCQs — فقہ حنفی سیکھنے کے لیے۔ Mukhtasar al-Quduri Arabic text with tashkeel, Urdu translation, '
        'vocabulary, Q&A and quizzes — Hanafi fiqh.')
KEYWORDS = ('مختصر القدوری, القدوری, فقہ حنفی, کتاب الطہارۃ, کتاب الصلاۃ, کتاب الزکاۃ, کتاب الصوم, کتاب الحج, اردو ترجمہ, '
            'Mukhtasar al-Quduri, Quduri, Hanafi fiqh, Quduri Urdu translation, Quduri with tashkeel, Quduri MCQs')


def head_meta(title, desc, url):
    t, d = html.escape(title, True), html.escape(desc, True)
    return (f'<title>{t}</title>\n<meta name="description" content="{d}">\n'
            f'<meta name="keywords" content="{html.escape(KEYWORDS, True)}">\n'
            f'<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">\n'
            f'<link rel="canonical" href="{url}">\n<meta name="theme-color" content="#0b4a6f">\n'
            f'<link rel="manifest" href="{SITE}manifest.webmanifest">\n<link rel="icon" href="{SITE}icon.svg" type="image/svg+xml">\n'
            f'<meta property="og:type" content="website"><meta property="og:site_name" content="{html.escape(NAME, True)}">\n'
            f'<meta property="og:title" content="{t}"><meta property="og:description" content="{d}">\n'
            f'<meta property="og:url" content="{url}"><meta property="og:locale" content="ur_PK">\n'
            f'<meta property="og:image" content="{SITE}og.svg">\n'
            f'<meta name="twitter:card" content="summary"><meta name="twitter:title" content="{t}"><meta name="twitter:description" content="{d}">\n')


def jsonld(extra):
    base = {'@context': 'https://schema.org', '@type': 'Book', 'name': NAME, 'inLanguage': ['ar', 'ur'],
            'author': {'@type': 'Person', 'name': 'أبو الحسين أحمد بن محمد القدوري'},
            'about': 'Hanafi fiqh', 'url': SITE, 'educationalUse': 'Self-study', 'learningResourceType': 'Textbook'}
    base.update(extra)
    return '<script type="application/ld+json">' + json.dumps(base, ensure_ascii=False) + '</script>\n'


def run(root, kitabs, strip):
    docs = root / 'docs'
    today = datetime.date.today().isoformat()
    (docs / 'icon.svg').write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="20" fill="#0b4a6f"/>'
        '<text x="48" y="64" font-size="52" text-anchor="middle" fill="#fff" font-family="serif">ق</text></svg>', encoding='utf-8')
    (docs / 'og.svg').write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#0b4a6f"/>'
        '<text x="600" y="320" font-size="120" text-anchor="middle" fill="#fff" font-family="serif">الحیات علوم اسلامیہ</text>'
        '<text x="600" y="390" font-size="54" text-anchor="middle" fill="#fff" font-family="serif">مطالعہ فقہ اسلامی: القدوری</text><text x="600" y="480" font-size="40" text-anchor="middle" fill="#bfe3f5" font-family="sans-serif">Arabic · Urdu · Vocabulary · Q&amp;A · MCQs</text></svg>', encoding='utf-8')
    (docs / 'manifest.webmanifest').write_text(json.dumps({
        'name': NAME, 'short_name': 'الحیات', 'lang': 'ur', 'dir': 'rtl', 'start_url': './', 'display': 'standalone',
        'background_color': '#0b4a6f', 'theme_color': '#0b4a6f',
        'icons': [{'src': 'icon.svg', 'sizes': 'any', 'type': 'image/svg+xml', 'purpose': 'any maskable'}]},
        ensure_ascii=False, indent=1), encoding='utf-8')

    urls = [SITE]
    for k in kitabs:
        title = strip(k['title'])
        d = f'{title} — مختصر القدوری کا عربی متن، اردو ترجمہ، مفردات، سوال جواب اور MCQs۔ {NAME} {title} with Urdu translation.'
        body = []
        for b in k['babs']:
            body.append(f'<h2>{html.escape(strip(b["t"]))}</h2>')
            for it in b['items']:
                tx = html.escape(strip(it[1]) if False else it[1])
                if it[0] == 'f': body.append(f'<h3>{tx}</h3>')
                elif it[0] in ('m', 'q', 'l'): body.append(f'<p>{tx}</p>')
        page = ('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">'
                '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
                + head_meta(f'{title} · {NAME}', d, f'{SITE}k{k["n"]}/')
                + jsonld({'name': f'{NAME} — {title}', 'url': f'{SITE}k{k["n"]}/'})
                + '<style>body{font-family:Amiri,"Noto Naskh Arabic",serif;max-width:46rem;margin:auto;padding:1rem;line-height:2.2;font-size:1.25rem}'
                  'a.app{display:block;text-align:center;background:#0b4a6f;color:#fff;padding:.7rem;border-radius:12px;text-decoration:none;margin:1rem 0}'
                  'h1,h2,h3{line-height:1.6}h2{color:#0b4a6f}</style></head><body>'
                f'<nav><a href="{SITE}">← {NAME}</a></nav><h1>{html.escape(title)}</h1>'
                f'<a class="app" href="{SITE}#k{k["n"]}">تعلیمی ایپ میں کھولیں: اردو ترجمہ · مفردات · سوال جواب · MCQs</a>'
                + ''.join(body) + f'<a class="app" href="{SITE}#k{k["n"]}">تعلیمی ایپ میں کھولیں</a></body></html>')
        d_ = docs / f'k{k["n"]}'; d_.mkdir(exist_ok=True)
        (d_ / 'index.html').write_text(page, encoding='utf-8')
        urls.append(f'{SITE}k{k["n"]}/')

    (docs / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + ''.join(f'<url><loc>{u}</loc><lastmod>{today}</lastmod><changefreq>monthly</changefreq><priority>{"1.0" if u == SITE else "0.8"}</priority></url>\n' for u in urls)
        + '</urlset>\n', encoding='utf-8')
    (docs / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {SITE}sitemap.xml\n', encoding='utf-8')
    return head_meta(NAME + ' · عربی متن، اردو ترجمہ، مفردات، سوال جواب، MCQs', DESC, SITE) + jsonld({})
