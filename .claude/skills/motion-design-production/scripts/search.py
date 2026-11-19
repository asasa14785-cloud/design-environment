#!/usr/bin/env python3
"""Search the motion library.

  python3 .claude/skills/motion-design-production/scripts/search.py "glass launch film" [--tech remotion] [--style liquid-glass]
        [--motion spring-physics] [--ad ai-model-or-tool-launch] [--method three-3d-scene] [--min-chars 800] [-n 10] [--show]

Free-text terms are matched against title + full prompt text; facet flags filter on the derived tags in resources/motion-index/index.json.
--show prints the first ~1500 chars of each matching prompt.
"""
import argparse, json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..'))
idx = json.load(open(os.path.join(ROOT, 'resources/motion-index/index.json')))
ap = argparse.ArgumentParser()
ap.add_argument('query', nargs='?', default='')
ap.add_argument('--tech'); ap.add_argument('--style'); ap.add_argument('--motion'); ap.add_argument('--ad'); ap.add_argument('--method'); ap.add_argument('--audio')
ap.add_argument('--stack'); ap.add_argument('--min-chars', type=int, default=0)
ap.add_argument('-n', type=int, default=10); ap.add_argument('--show', action='store_true')
a = ap.parse_args()
terms = [t.lower() for t in re.findall(r'\w[\w.\-]*', a.query)]
flt = {'tech': a.tech, 'style': a.style, 'motion': a.motion, 'ad_type': a.ad, 'scene_method': a.method, 'audio': a.audio}
res = []
for r in idx:
    if r['prompt_chars'] < a.min_chars: continue
    if a.stack and a.stack.lower() not in (r['stack'] or '').lower(): continue
    if any(v and v not in r['tags'][k] for k, v in flt.items()): continue
    text = r['title'].lower()
    body = ''
    if r['prompt_file']:
        body = open(os.path.join(ROOT, r['prompt_file']), encoding='utf-8', errors='ignore').read().lower()
    score = sum(3 * text.count(t) + min(body.count(t), 6) for t in terms)
    if terms and score == 0: continue
    res.append((score + min(r['prompt_chars'], 4000) / 4000, r, body))
res.sort(key=lambda x: -x[0])
for s, r, body in res[:a.n]:
    print(f"[{s:5.1f}] {r['slug']} | {r['title']} | {r['size']} | {r['stack'] or '-'}")
    print(f"        tech={','.join(r['tags']['tech'])} style={','.join(r['tags']['style'])}")
    print(f"        {r['prompt_file'] or r['skill_url']}  chars={r['prompt_chars']}  video={r['video_url']}")
    if a.show and body:
        print('        ---\n' + body[:1500].replace('\n', '\n        ') + '\n        ---')
print(f'{len(res)} matches')
