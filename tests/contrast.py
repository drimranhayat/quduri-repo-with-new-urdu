import json, sys
from playwright.sync_api import sync_playwright
import pathlib
URL = sys.argv[1] if len(sys.argv) > 1 else (pathlib.Path(__file__).resolve().parent.parent / 'docs' / 'index.html').as_uri()

JS = r"""
() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true });
  const toRGBA = (str) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = str; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const over = (top, bot) => { const a = top[3] + bot[3] * (1 - top[3]); if (a === 0) return [0, 0, 0, 0]; return [(top[0] * top[3] + bot[0] * bot[3] * (1 - top[3])) / a, (top[1] * top[3] + bot[1] * bot[3] * (1 - top[3])) / a, (top[2] * top[3] + bot[2] * bot[3] * (1 - top[3])) / a, a]; };
  const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
  const cr = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05); };
  const root = getComputedStyle(document.documentElement).colorScheme.includes('dark') ? [13, 18, 23, 1] : [255, 255, 255, 1];
  const bgOptions = (el) => {
    // returns list of possible opaque backgrounds (gradients produce several)
    let layers = [];
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const cs = getComputedStyle(e);
      const bi = cs.backgroundImage;
      let stops = null;
      if (bi && bi.includes('gradient')) stops = (bi.match(/(rgba?\([^)]*\)|color\([^)]*\))/g) || []).map(toRGBA);
      const bc = toRGBA(cs.backgroundColor);
      layers.push({ bc, stops });
      if (!stops && bc[3] >= 1) break;
      if (stops && stops.every(s => s[3] >= 1)) break;
    }
    // composite bottom-up; branch over gradient stops
    let opts = [root];
    for (let i = layers.length - 1; i >= 0; i--) {
      const L = layers[i]; const next = [];
      for (const o of opts) {
        let base = o; if (L.bc[3] > 0) base = over(L.bc, o);
        if (L.stops) { for (const s of L.stops) next.push(over(s, base)); } else next.push(base);
      }
      opts = next;
    }
    return opts;
  };
  const opac = (el) => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity); return o; };
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  let n;
  while ((n = walker.nextNode())) {
    const t = n.textContent.trim(); if (!t) continue;
    const el = n.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (el.closest('[hidden]')) continue;
    // skip content-visibility skipped / offscreen far? keep all rendered
    let fg = toRGBA(cs.color); const op = opac(el);
    const bgs = bgOptions(el);
    let worst = 99, wb = null, wf = null;
    for (const bg of bgs) {
      const f = over([fg[0], fg[1], fg[2], fg[3] * op], bg); const c = cr(f, bg);
      if (c < worst) { worst = c; wb = bg; wf = f; }
    }
    const fs = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700;
    const large = fs >= 24 || (fs >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    if (worst < need) {
      const cls = (el.className && el.className.baseVal === undefined ? String(el.className) : '').split(/\s+/).filter(Boolean).slice(0, 3).join('.');
      const par = el.parentElement ? (el.parentElement.tagName.toLowerCase() + '.' + String(el.parentElement.className || '').split(/\s+/).filter(Boolean).slice(0, 2).join('.')) : '';
      out.push({ sel: par + ' > ' + el.tagName.toLowerCase() + '.' + cls, txt: t.slice(0, 24), ratio: Math.round(worst * 100) / 100, need, fg: wf.map(Math.round).join(','), bg: wb.map(Math.round).join(','), fs: Math.round(fs) });
    }
  }
  return out;
}
"""

def collect(pg, label, acc):
    for f in pg.evaluate(JS):
        key = (f['sel'], f['fg'], f['bg'])
        d = acc.setdefault(key, dict(f, where=set(), n=0)); d['where'].add(label); d['n'] += 1

def run():
    acc = {}
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        for theme in ('light', 'dark'):
            for (w, h, vp) in ((400, 850, 'm'), (1280, 850, 'd')):
                ctx = b.new_context(viewport={'width': w, 'height': h}, color_scheme=theme)
                pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
                pg.goto(URL); pg.wait_for_timeout(400)
                pg.evaluate(f"document.documentElement.setAttribute('data-theme','{theme}')"); pg.wait_for_timeout(300)
                tag = lambda s: f'{theme}/{vp}/{s}'
                collect(pg, tag('home'), acc)
                for k in range(1, 6):
                    pg.evaluate(f"location.hash='#k{k}-vvo'"); pg.wait_for_timeout(200)
                    pg.evaluate("location.hash='#k%d'" % k); pg.wait_for_timeout(300)
                    pg.evaluate("document.querySelector('[data-v=ar]')?.click()"); pg.wait_for_timeout(200)
                    collect(pg, tag(f'k{k}-ar'), acc)
                    # memory mode
                    pg.evaluate("document.querySelector('.dock [data-v=mem]')?.click()"); pg.wait_for_timeout(200)
                    collect(pg, tag(f'k{k}-mem'), acc)
                    pg.evaluate("document.querySelector('.dock [data-v=read]')?.click()")
                    pg.evaluate("document.querySelector('[data-v=ur]').click()"); pg.wait_for_timeout(200)
                    pg.evaluate("document.querySelector('.ur-d summary, .ar-d summary')?.click()")
                    collect(pg, tag(f'k{k}-ur'), acc)
                    pg.evaluate("document.querySelector('[data-v=vo]').click()"); pg.wait_for_timeout(200)
                    pg.evaluate("document.querySelector('[data-a=vdone]')?.click()")
                    collect(pg, tag(f'k{k}-vo'), acc)
                    pg.evaluate("document.querySelector('[data-a=vtest]')?.click()"); pg.wait_for_timeout(150)
                    pg.evaluate("document.querySelector('.vtest .mo')?.click()"); pg.wait_for_timeout(150)
                    collect(pg, tag(f'k{k}-vtest'), acc)
                    pg.evaluate("document.querySelector('[data-a=vend]')?.click()")
                    pg.evaluate("document.querySelector('[data-v=qa]').click()"); pg.wait_for_timeout(200)
                    pg.evaluate("document.querySelectorAll('.qa-i').forEach((d,i)=>{if(i<2)d.open=true})")
                    collect(pg, tag(f'k{k}-qa'), acc)
                    pg.evaluate("document.querySelector('[data-v=mc]').click()"); pg.wait_for_timeout(200)
                    pg.evaluate("document.querySelectorAll('.mcq')[0]?.querySelectorAll('.mo')[0]?.click()")
                    pg.evaluate("document.querySelectorAll('.mcq')[1]?.querySelectorAll('.mo')[1]?.click()"); pg.wait_for_timeout(150)
                    collect(pg, tag(f'k{k}-mc'), acc)
                    pg.evaluate("document.querySelector('[data-v=ar]').click()")
                # overlays on k1
                pg.evaluate("location.hash='#k1'"); pg.wait_for_timeout(300)
                for name, js in (('settings', "document.querySelector('[data-a=set]')?.click()"), ('toc', "document.querySelector('.bpt')?.click()"), ('search', "document.querySelector('[data-a=search]')?.click()"), ('cards', "document.querySelector('[data-a=cards]')?.click()"), ('quiz', "document.querySelector('[data-a=kquiz]')?.click()")):
                    pg.evaluate(js); pg.wait_for_timeout(350)
                    if name == 'search':
                        pg.keyboard.type('الماء'); pg.wait_for_timeout(500)
                    collect(pg, tag(name), acc)
                    pg.keyboard.press('Escape'); pg.evaluate("document.querySelectorAll('.scrim,.pop,.fc').forEach(e=>e.remove())")
                if errs: print('JS errors', theme, vp, errs[:2])
                ctx.close()
    res = sorted(acc.values(), key=lambda d: d['ratio'])
    for d in res:
        print(f"{d['ratio']:>5} (need {d['need']}) fs{d['fs']} fg[{d['fg']}] bg[{d['bg']}] {d['sel']} «{d['txt']}» n={d['n']} in {sorted(d['where'])[:3]}")
    print('TOTAL distinct failures:', len(res))

run()
