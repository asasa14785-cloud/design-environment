---
name: motion-design-production
description: End-to-end production of professional motion-graphics videos / ads as code (Remotion + Three.js/WebGL + GSAP + SVG + Canvas + HyperFrames), driven by the local awesome-opus-5-5-motion-design library (468 works, 463 prompts). Use when the user asks for a motion graphics video, launch film, promo/ad, kinetic typography, animated explainer, product UI film, audio-synced animation, or anything to be rendered to MP4 — including requests in Arabic ("اعمل اعلان", "فيديو موشن جرافيك").
---

# Motion Design Production

Produce a **rendered, inspected MP4** — never stop at "files created". Work in `motion-lab/` (the Remotion project that already exists in this repo; don't touch the root Vite app's `package.json`).

## 0. Ground rules
- If the user gives a **time budget** ("stop at minute 50"): write `date +%s > /tmp/start_ts` first and check `echo $(( ($(date +%s)-$(cat /tmp/start_ts))/60 ))` every few steps. Reserve the last 10 min for render + QA. If the deadline hits, stop and report what's left.
- Do **not** copy library works verbatim. Extract the *technique* (structure, timing logic, constraint set) and invent a new concept, palette, copy and scenes.
- Never claim an asset/tool/feature you didn't verify. Say honestly what is AI-generated (e.g. Piper neural TTS) vs procedurally synthesized vs stock (Mixkit).
- Don't invent factual claims (benchmarks, prices) for real brands; label concept/fan-made work.
- Library videos are **external URLs only** (`video_url`/`poster_url`); the repo has prompts + metadata, not source code or media. Six entries point to external *agent skills* (see `resources/motion-index/ANALYSIS.md`) – fetch them only if needed.

## 1. Search the library (always first)
```bash
python3 .claude/skills/motion-design-production/scripts/search.py "glass launch film" --tech remotion --style liquid-glass -n 8 --show
python3 .claude/skills/motion-design-production/scripts/search.py "kinetic" --motion spring-physics --ad ai-model-or-tool-launch --min-chars 1500
```
Facets (flags): `--tech --style --motion --ad --method --audio --stack`. Browsable indexes: `resources/motion-index/by-{category,stack,motion,style,tech,ad-type,scene-method,audio}.md`; machine index `index.json`. Rebuild with `scripts/build_index.py` (tags are regex heuristics – verify by reading the prompt).
Read 3–5 of the best prompts fully (`prompt_file`). Note: structure blocks (`<inputs> <script> <voice> <direction> <structure>`), constraint lists ("Banned: …"), timing grids, QA steps.

## 2. Distilled techniques from the library (reuse the idea, not the work)
| Idea | Source pattern | How to use |
|---|---|---|
| **Beat grid** | Apple-keynote films: "120 BPM, 54 beats, something happens every beat" | Pick BPM so duration = whole bars (128 BPM → 24 bars = 45.0 s). Scene cuts on bar lines; slams/hits on beats. |
| **One continuous take** | objects morph into next scene (nothing fades) | Prefer morph/zoom-through/wipe transitions over crossfades. |
| **Banned list** | prompts end with "Banned: crossfades, blur-ins, templates" | Write your own Banned list in the storyboard; it focuses taste. |
| **Strict palette + type system** | TechHalla bumper (3 hues, 3 fonts, tracking values) | Lock palette/type/radius tokens before coding. |
| **Wireframe-first** | HyperFrames "9 beats, wireframe then skin" | Storyboard → still per beat → lock timing → skin. |
| **Contact sheet QA** | Three.js lyric video: 16-frame contact sheet | Render stills at scene midpoints and *look* at them before the full render. |
| **Source-of-truth first** | Remotion product films: inspect repo/brand tokens before designing | When a real brand/project exists, read its tokens/screenshots first. |
| **Voice pipeline** | Ora-2 prompt: write script → TTS takes → shorten pauses → align word timings (Whisper) | Piper/other TTS locally; trim pauses; place lines on beats; duck music under voice. |
| **Deterministic frames** | Playwright+ffmpeg / Remotion | Everything is a pure function of the frame number. No `Math.random`, no wall-clock. |
| **Code-synthesised audio** | Web-Audio / numpy | Pad + kick + hats + arp + riser + boom from code; sidechain duck. |

## 3. Choose technique per scene
| Need | Use |
|---|---|
| Text, UI, glass panels, layout | Remotion DOM + CSS (`backdrop-filter` works in headless Chrome) |
| Per-letter kinetic type | `Letters` helper (`motion-lab/src/lib/kit.tsx`) – spring per glyph |
| Staggers, 3D card flips, timelines, elastic/back eases | **GSAP paused timeline seeked per frame** (`useGsapTimeline`) |
| Depth, camera dives, refractive crystals, tunnels | **Three.js via `@remotion/three`** (`ThreeCanvas`), camera = f(frame) |
| Particles, warp, galaxies, big counts | **Canvas 2D** drawn in `useLayoutEffect` from seeded `random()` |
| Line draws, graphs, icons, morphs | **SVG** (`stroke-dashoffset`) |
| Custom shaders/post FX | raw WebGL/GLSL inside ThreeCanvas (`ShaderMaterial`) – software GL is slow, keep small |
| Pure-HTML timeline compositions rendered by Chrome | **HyperFrames** (HeyGen) – only if user wants HTML-first; otherwise Remotion covers it |
Mixing rule: ONE persistent 3D world behind, DOM glass scenes layered above = cheap and looks premium (glass actually refracts the 3D).

## 4. Pipeline (in order)
1. **Brief → concept**: audience, message (≤3 ideas), duration, aspect, platform, language, tone. Pick BPM & bar grid.
2. **Storyboard**: table `scene | time | VO line | visual | technique | transition | sfx/music`. Save to `motion-lab/STORYBOARD.md`.
3. **Assets**: open-license only. Stock SFX: Mixkit (`https://mixkit.co/free-sound-effects/<cat>/` → `assets.mixkit.co/active_storage/sfx/<id>/<id>-preview.mp3`), Pixabay, Freesound (CC0, API key), Kenney. Photos: Pexels/Unsplash. 3D: procedural geometry (no downloads needed). Record licenses in a `CREDITS` note.
4. **Audio** (`motion-lab/tools/`): TTS (`gen_vo.sh`, Piper `en_US-ryan-high`), then `mix_audio.py` → `public/audio/soundtrack.wav` (music + SFX + VO, ducking, soft limiter). Edit timings there + in `src/lib/timing.ts` together.
5. **Code**: `src/lib/{timing,camera,kit}.tsx`, `src/World3D.tsx`, `src/scenes/*`, compose in `src/<Ad>.tsx` with `<Sequence layout="none">`, register in `Root.tsx`.
6. **Preview stills**: `npx remotion still src/index.ts <Comp> out/f300.jpg --frame=300`; read the JPG, fix, repeat (≥1 still per scene).
7. **Render**: background it! `nohup npx remotion render src/index.ts <Comp> out/ad.mp4 --codec=h264 --crf=18 > /tmp/render.log 2>&1 &` then poll `tr '\r' '\n' < /tmp/render.log | tail -1`. (A foreground render can hit the tool timeout.)
8. **QA the final file** (see §6) and fix → re-render only if needed.

## 5. Environment facts (verified on this machine)
- Node 20, npm 10; **Remotion 4.0.545** installed in `motion-lab/` (+ `@remotion/three`, `three`, `@react-three/fiber`, `gsap`, `@remotion/google-fonts`).
- **FFmpeg/ffprobe**: not on PATH – use Remotion's bundled: `npx remotion ffmpeg …`, `npx remotion ffprobe …`.
- Chrome Headless Shell is auto-downloaded by Remotion; it needed system libs `libnss3 libnspr4` (`sudo apt-get install -y libnss3 libnspr4`). Run `bash motion-lab/tools/check_env.sh` to verify everything.
- No GPU: `Config.setChromiumOpenGlRenderer('swangle')` in `remotion.config.ts` (already set). 2 CPU / 2 GB RAM → concurrency 2; 1080p30 with a live 3D scene ≈ 0.5 s/frame ⇒ **~12–15 min for 45 s**. Budget for it; lower the resolution (`--scale=0.667`) if time is short.
- Python: numpy/scipy/piper-tts via `pip install --user --break-system-packages`. Piper voices live in `motion-lab/tools/voices/` (git-ignored size).
- Puppeteer/Playwright not needed (Remotion drives Chrome). HyperFrames not installed (install `npm i hyperframes`-style packages only if a task truly needs it; verify with `npx` before claiming).

## 6. Gotchas learned the hard way
- **`background-clip:text` glass text breaks on children that have `transform/filter`** → apply the gradient style on each per-letter span (`Letters` does this). Otherwise only the outline shows.
- ThreeCanvas children can use `useCurrentFrame()` (context is bridged); mutate `camera` in render from frame; no `useFrame`.
- `MeshPhysicalMaterial.transmission` doubles render cost and goes black over dark backgrounds → use transparent physical glass + emissive + env map (`RoomEnvironment`) + bright inner core + wire edges.
- Seeded randomness only: Remotion `random('seed')`.
- GSAP: build the timeline once in `useLayoutEffect` inside `gsap.context`, then `tl.time(frame/fps, false)` every frame. `.from()` + later `.to()` on the same target is fine.
- `backdrop-filter` blur over a WebGL canvas works; large blur radii are the slowest DOM thing – keep ≤ 40 px.
- Put scene boundaries on bar lines; start VO ≥0.4 s after a scene starts; duck music 45 % under VO.
- Don't let the 3D camera pass through hero objects: offset them laterally ≥ radius + 1.
- `Audio` from `staticFile()`; wav is fine, Remotion encodes AAC.
- Tool step budget: batch independent tool calls; don't re-bundle for every single still (render 3–6 frames per pass).

## 7. Final QA checklist (must run before declaring done)
```bash
cd motion-lab
npx remotion ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,duration,nb_frames -of default=nw=1 out/ad.mp4
npx remotion ffmpeg -i out/ad.mp4 -af volumedetect -vn -f null - 2>&1 | grep -E "mean_volume|max_volume"     # not clipped (>-1 dB), not silent
npx remotion ffmpeg -y -i out/ad.mp4 -vf "fps=1/3,scale=480:-1,tile=5x3" -frames:v 1 out/contact.jpg          # contact sheet → read_file it
npx remotion ffmpeg -i out/ad.mp4 -vf "blackdetect=d=0.3:pic_th=0.98" -an -f null - 2>&1 | grep black_start   # unexpected black frames
```
Check: duration exact, audio stream present, first/last frame intentional, no text clipped, no frozen segments, hits land on beats, nothing flickers. Fix and re-render only the affected comp if needed.

## 8. Deliverables
MP4 in `motion-lab/out/`, storyboard, credits (assets + licenses + what's AI-generated), the exact render command, and an honest list of limitations.
