"""Sanity checks: line alignment of data / data_plain / ur, QA and MCQ format and coverage."""
import pathlib, re, sys
r = pathlib.Path(__file__).resolve().parent.parent
ok = True
for f in sorted((r / 'data').glob('*.txt')):
    n = [len((r / d / f.name).read_text(encoding='utf-8').splitlines()) for d in ('data', 'data_plain', 'ur')]
    if len(set(n)) != 1: ok = False; print('MISALIGNED', f.name, n)
for f in (r / 'qa').glob('qa*.txt'):
    for l in f.read_text(encoding='utf-8').splitlines():
        if l.strip() and len(l.split('|')) != 4: ok = False; print('BAD QA', f.name, l[:40])
for f in (r / 'qa').glob('mcq*.txt'):
    for l in f.read_text(encoding='utf-8').splitlines():
        p = l.split('|')
        if l.strip() and (len(p) != 7 or len(set(p[3:])) != 4): ok = False; print('BAD MCQ', f.name, l[:40])
print('OK' if ok else 'FAILED'); sys.exit(0 if ok else 1)
