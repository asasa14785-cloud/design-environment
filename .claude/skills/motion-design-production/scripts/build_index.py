#!/usr/bin/env python3
"""Build a faceted, searchable index of the awesome-opus-5-5-motion-design library.

Reads  resources/awesome-opus-5-5-motion-design/data/videos.json (+ prompts/*.md)
Writes resources/motion-index/{index.json, by-*.md, ANALYSIS.md}

Facets: motion type, visual style, technique/stack, ad type, scene-execution method, audio approach.
Tags are derived by regex over title + prompt + stack + categories (heuristic, but transparent).
Run:  python3 .claude/skills/motion-design-production/scripts/build_index.py
"""
import json, os, re, collections, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..'))
LIB = os.path.join(ROOT, 'resources/awesome-opus-5-5-motion-design')
OUT = os.path.join(ROOT, 'resources/motion-index')
os.makedirs(OUT, exist_ok=True)
videos = json.load(open(os.path.join(LIB, 'data/videos.json')))

FACETS = {
    'motion': {
        'kinetic-typography': r'kinetic|typograph|wordmark|lettering|letter[- ]by[- ]letter|headline',
        'spring-physics': r'\bspring|overshoot|bounce|elastic|damping',
        'mask-reveal': r'\bmask|clip-path|reveal|wipe',
        'morph-shape-to-shape': r'morph|metamorph|shape.{0,20}(turns|becomes)|squash|stretch|goo\b',
        'camera-move': r'camera|dolly|push[- ]in|zoom|orbit|pan\b|fly[- ]?through',
        'transitions': r'transition|iris|whip|crossfade|match[- ]cut|flood',
        'particles-generative': r'particle|swarm|flow field|generative|boids|noise',
        'audio-reactive-beat-sync': r'\bbpm\b|beat|audio[- ]reactive|on the beat|sync',
        'path-drawing-line': r'stroke-dash|draw(s|ing)? (on|in)|line draw|handwrit|hand-drawn|path',
        'loop': r'\bloop|seamless',
        '3d-object-motion': r'three\.js|3d |webgl|rotat|extrud|isometric',
        'counter-data-motion': r'count(er|ing)|chart|graph|bar |statistic|number',
        'cursor-ui-demo': r'cursor|click|drag|scroll|tap|screen[- ]studio',
    },
    'style': {
        'liquid-glass': r'liquid glass|glassmorph|glass|frosted|backdrop',
        'apple-keynote': r'apple|keynote|cupertino|ios \d+',
        'dark-neon': r'neon|cyber|glow|synthwave|dark mode|#0a0a0a|black bg',
        'minimal-editorial': r'minimal|editorial|swiss|whitespace|off-white|monochrome',
        'brutalist-poster': r'brutal|poster|street|raw|acid',
        'retro-crt-pixel': r'crt|pixel|8-bit|16-bit|vhs|terminal|retro|scanline',
        'hand-drawn-paper': r'hand[- ]drawn|crayon|paper|sketch|whiteboard|marker|doodle|storybook',
        'flat-mograph': r'flat|vector|solid colou?r|kurzgesagt|geometric',
        'isometric-2.5d': r'isometric|2\.5d',
        'cinematic-3d': r'cinematic|film grain|depth of field|bloom|volumetric|photoreal',
        'halftone-risograph': r'halftone|riso|engrav|woodcut|ink',
        'claymorphism-soft-3d': r'clay|soft 3d|pastel',
    },
    'tech': {
        'remotion': r'remotion',
        'hyperframes': r'hyperframes|hyperframe',
        'gsap': r'gsap|greensock',
        'three.js': r'three\.js|threejs|r3f|react-three',
        'webgl-shader': r'webgl|glsl|shader|fragment',
        'canvas2d': r'canvas',
        'svg': r'\bsvg\b|stroke-dash',
        'css-html': r'\bhtml\b|css|keyframes',
        'web-audio-synth': r'web audio|audiocontext|oscillator|synthes',
        'playwright-puppeteer-capture': r'playwright|puppeteer|headless',
        'ffmpeg': r'ffmpeg',
        'python-manim-blender': r'manim|blender|python',
        'tts-voiceover': r'elevenlabs|tts|voice[- ]?over|whisper|kokoro|edge-tts|voice',
        'lottie-rive': r'lottie|rive\b',
    },
    'ad_type': {
        'product-launch-film': r'launch|introducing|keynote|reveal|teaser|announce',
        'app-promo-phone-ui': r'\bapp\b|phone|iphone|mobile|ios|android',
        'saas-feature-explainer': r'saas|feature|dashboard|workflow|walkthrough|product demo',
        'brand-identity-bumper': r'bumper|identity|logo|brand|sting|intro|outro',
        'ai-model-or-tool-launch': r'\bai\b|model|llm|agent|claude|gpt|prompt',
        'data-story-infographic': r'chart|data|infographic|stats|number|revenue|growth',
        'explainer-educational': r'explain|how .* works|diagram|tutorial|science|history',
        'music-video-lyric-visualizer': r'lyric|music video|visuali[sz]er|song|album',
        'social-short-vertical': r'vertical|1080x1920|9:16|reel|tiktok|shorts',
        'event-trailer-cinematic': r'trailer|cinematic|title sequence|movie|film',
    },
    'scene_method': {
        'dom-css-timeline': r'\bhtml\b|css|keyframes|dom',
        'canvas-procedural': r'canvas|procedural|particles',
        'svg-path-and-morph': r'\bsvg\b|stroke-dash|path',
        'three-3d-scene': r'three\.js|3d scene|webgl|r3f',
        'remotion-sequence-spring': r'remotion|useCurrentFrame|spring\(|sequence',
        'gsap-master-timeline': r'gsap|timeline',
        'frame-by-frame-capture-ffmpeg': r'playwright|puppeteer|screenshot|ffmpeg|frame[- ]by[- ]frame|deterministic',
        'beat-grid-structure': r'\bbpm\b|beats?\b|bars?\b',
        'storyboard-first': r'storyboard|beat sheet|wireframe|contact sheet|shot list',
        'voiceover-and-captions': r'voice|caption|subtitle|narrat|whisper',
        'real-assets-photos-stock': r'pexels|unsplash|pixabay|stock|photo|mixkit',
    },
    'audio': {
        'music-bed-bpm-synced': r'\bbpm\b|mixkit|pixabay|royalty|suno|track',
        'sfx-whoosh-hit': r'sfx|whoosh|impact|riser|foley|sound effect|hit',
        'synth-in-code': r'web audio|oscillator|synthes|procedural audio|code[- ]synth',
        'voiceover-tts': r'elevenlabs|tts|voice|narrat|kokoro|edge-tts|whisper',
        'silent': r'^$',
    },
}


def tags_for(v):
    text = ' '.join([v.get('title') or '', v.get('prompt') or '', v.get('stack') or '', ' '.join(v.get('categories') or [])]).lower()
    res = {}
    for facet, d in FACETS.items():
        hit = [k for k, rx in d.items() if k != 'silent' and re.search(rx, text)]
        if facet == 'audio' and not hit:
            hit = ['silent']
        res[facet] = hit
    return res


rows = []
for v in videos:
    slug = v['slug']
    ppath = f'prompts/{slug}.md'
    has_prompt = os.path.exists(os.path.join(LIB, ppath))
    rows.append({
        'slug': slug, 'title': v['title'], 'creator': v['creator'], 'posted': v.get('posted'),
        'size': f"{v['width']}x{v['height']}", 'categories': v.get('categories') or [],
        'stack': v.get('stack'), 'effort': v.get('effort'),
        'prompt_file': f'resources/awesome-opus-5-5-motion-design/{ppath}' if has_prompt else None,
        'skill_url': v.get('skill_url'), 'post_url': v.get('post_url'),
        'video_url': v.get('video_url'), 'poster_url': v.get('poster_url'),
        'prompt_chars': len(v.get('prompt') or ''),
        'tags': tags_for(v),
    })
json.dump(rows, open(os.path.join(OUT, 'index.json'), 'w'), ensure_ascii=False, indent=1)


def line(r):
    p = r['prompt_file'] or (r['skill_url'] or 'no-prompt')
    return f"- `{r['slug']}` — {r['title']} · {r['size']} · {r['stack'] or '—'} · {p}"


def write_group(name, key_fn, title):
    groups = collections.defaultdict(list)
    for r in rows:
        for k in key_fn(r) or ['(none)']:
            groups[k].append(r)
    with open(os.path.join(OUT, f'{name}.md'), 'w') as f:
        f.write(f'# Index by {title}\n\nGenerated by build_index.py. Paths are relative to the repo root. Videos are external links (see index.json video_url).\n\n')
        f.write('## Contents\n' + '\n'.join(f'- {k} ({len(v)})' for k, v in sorted(groups.items(), key=lambda x: -len(x[1]))) + '\n\n')
        for k, v in sorted(groups.items(), key=lambda x: -len(x[1])):
            f.write(f'## {k} ({len(v)})\n' + '\n'.join(line(r) for r in v) + '\n\n')


write_group('by-category', lambda r: r['categories'], 'category')
write_group('by-stack', lambda r: [r['stack']] if r['stack'] else [], 'declared stack')
for facet, title in (('motion', 'motion type'), ('style', 'visual style'), ('tech', 'technique'), ('ad_type', 'ad type'), ('scene_method', 'scene execution method'), ('audio', 'audio approach')):
    write_group(f'by-{facet.replace("_", "-")}', lambda r, f=facet: r['tags'][f], title)

# ---- stats for ANALYSIS.md ----
st = {}
for facet in FACETS:
    c = collections.Counter(t for r in rows for t in r['tags'][facet])
    st[facet] = c.most_common()
with open(os.path.join(OUT, 'stats.json'), 'w') as f:
    json.dump({'total': len(rows), 'with_prompt_file': sum(1 for r in rows if r['prompt_file']), 'facets': st}, f, indent=1)
print('indexed', len(rows), 'entries;', sum(1 for r in rows if r['prompt_file']), 'prompt files')
for facet, c in st.items():
    print(facet, c[:8])
