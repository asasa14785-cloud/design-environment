# Analysis of `awesome-opus-5-5-motion-design`

Cloned to `resources/awesome-opus-5-5-motion-design` (HEAD `89e3bf7`). Analysis date: 2026-11-19 (sandbox clock).

## What is actually inside the repo
| Item | Reality |
|---|---|
| `data/videos.json` | 468 entries: slug, title, creator, post_url, motionvideo_url, poster_url, **video_url (external MP4)**, width/height, posted, model, categories, stack (124 have it, 344 null), effort, iterations, `prompt` (full text), `skill_url` |
| `prompts/*.md` | 463 prompt files (5 entries have no prompt; 6 point to agent skills instead) |
| `README.md` | 268 KB gallery table of the same 468 works (README says 468; the commit message says 448/445 – the data has 468/463) |
| Source code / videos / audio | **NOT in the repo.** Videos and posters are external URLs on `assets.motionvideo.xyz`; no project source is included. |
| Custom `.claude` skills | none inside the repo (6 external skill URLs below) |

Only *one* GitHub URL appears inside prompt text (`johnheibel/pdoomvideo`); other links are t.co/x.com/product sites. So there is little to clone beyond the 6 skill repos.

## Declared stacks (124 entries declare one)
Remotion ≈ 22 (incl. variants), HTML ≈ 16 (+ Playwright/ffmpeg variants ≈ 20), HyperFrames ≈ 14, Canvas ≈ 14, Three.js ≈ 12 (incl. combos with HyperFrames/GSAP/WebGL), JavaScript+Playwright+FFmpeg, GSAP ≈ 5, WebGL/WebGL2 ≈ 5, SVG combos, Python+ffmpeg, Manim+edge-tts, Blender, OpenEdit, fframes (Rust+SVG). `effort`: max 24, medium 7, high 7.
Prompt-text mentions (substring counts over 468 prompts): canvas 41, playwright 32, ffmpeg 35, mixkit 22, remotion 15, three.js 10, webgl 8, hyperframes 7, gsap 7, web audio 7, `60fps` 41, `1080` 39, spring 28, motion blur 21, easing 23, sound 70, music 63, bpm 41, beat 51, sfx 11, whoosh 9, TTS 4.

## Categories (multi-label)
kinetic-type 221, product-ui 184, music 111, shapes 94, diagrams 78, characters 75, particles 63, charts 49, phone 33, photos 30, code 29.

## Six external agent skills referenced (not downloaded; fetch only if needed)
| Entry | Repo |
|---|---|
| lexnlin-6161a6 Cinetic skill launch film | https://github.com/Leonxlnx/cinetic |
| buildfastwithai-53234e generative film (music + SFX) | https://github.com/buildfastwithai/buildfast-skills/tree/main/generative-film-skill |
| anthonyriera-9b1b2a product launch film | https://github.com/Rieranthony/product-film-skill |
| jake11moran-a269c4 animated agent session story (HyperFrames) | https://github.com/heygen-com/hyperframes-community-skills/tree/master/skills/session-story |
| hanifproduktif-baade0 storybook animation | https://github.com/buildwithhanif/claude-animation-skill |
| superalesha-3b3cf8 hand-drawn canvas animation | https://github.com/alesha-pro/tools/tree/main/skills/hand-drawn-canvas-animation |

## Reusable production methods extracted
1. **Beat-grid film structure** (`beamnxw-375dbf`, `thejohnnyhuy-5fe10f`, `twoclipping-221cab`): fix BPM, count beats, "something happens on every beat"; continuous take where each object morphs into the next scene; explicit **Banned** list; Apple-keynote + iOS-26 liquid glass; screen-studio style camera zoom with scaled cursor.
2. **Structured prompts** (`rossaxbt-3085b7`): `<inputs>` (ask the user for missing assets; defaults given), `<script>` (VO template), `<voice>` (TTS pipeline: multiple takes, regenerate bad lines, shorten pauses >0.28 s → 0.2 s, loudness leveling, Whisper word alignment), `<direction>` (size/fps/style).
3. **Strict design systems** (`techhalla-94fbea`): exact palette hex, 3 typefaces with tracking numbers, locked copy order, mono "prompt crumbs", loop frame0==frameN, print-misregister on impact frames.
4. **Repo-first brand film** (`daniel-haida-8691d4`, Remotion): inspect real tokens/screenshots/wordmark first, new independent composition, reuse infra (easings, asset loading, QA), "must feel expensive" constraint set.
5. **Wireframe → skin** (`archiveexplorer-3d5cdc`, HyperFrames): beats as one-liners → 3 headline options → wireframe still per beat → lock timing → apply DESIGN.md → split-view render.
6. **Programmatic music video** (`okazaky-ec5fed`, Three.js): Suno → Demucs stems → Whisper alignment → 1 lyric line = 1 scene → storyboard (3D subject / camera / main word) → parallel sub-agents per scene → **16-frame contact sheet QA** → headless-Chrome 60 fps render → loudness normalise −14 LUFS.
7. **"Every frame is code"** (`btcup99-b318a9`): HyperFrames + Three.js camera, even typing sounds synthesised in code; no video-gen models.
8. **Explainer style catalogue** (`nft_chen-ba901b`): shadow puppet, isometric 2.5D, scale comparison, whiteboard, WebGL glyph evolution, exploded view, pixel art, picture-book, 3Blue1Brown math, old-map, Kurzgesagt, flat MG – each a one-line style recipe reusable for diagrams.

## Techniques this repo's own production added (see `motion-lab/`)
Frame-seeked GSAP master timeline, persistent Three.js world with DOM glass overlays, Canvas2D deterministic particles, SVG path draw, numpy-synthesised music bed on a 128-BPM bar grid, Mixkit SFX, Piper neural TTS, ducking.

## Index facets
`resources/motion-index/by-motion.md`, `by-style.md`, `by-tech.md`, `by-ad-type.md`, `by-scene-method.md`, `by-audio.md`, `by-category.md`, `by-stack.md`, `index.json`, `stats.json`. Tags are **regex heuristics** over title+prompt (e.g. "number" ⇒ counter-data-motion is over-inclusive); always read the prompt before relying on a tag.
