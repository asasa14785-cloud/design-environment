# Project memory

## Layout
- Root Vite + React + Tailwind app (`src/`, `index.html`) – the web app entry (`npm run build`). Don't edit `package.json`/`vite.config.ts` directly for video work.
- `motion-lab/` – Remotion video production project (own `package.json`): Remotion 4, Three.js (`@remotion/three`), GSAP, Google Fonts. Outputs in `motion-lab/out/`.
- `resources/awesome-opus-5-5-motion-design/` – cloned prompt library (468 works / 463 prompts; videos are external links only). Update with `git -C resources/awesome-opus-5-5-motion-design pull`.
- `resources/motion-index/` – faceted index + `ANALYSIS.md` (how the library was analysed).
- `.claude/skills/motion-design-production/` – the production skill (+ `scripts/search.py`, `scripts/build_index.py`).

## Motion-graphics / video / ad requests → ALWAYS use the skill
When the user asks for any motion graphics, promo/ad/launch film, kinetic typography, animated explainer, audio-synced animation, or an MP4 made from code (in any language, incl. Arabic):
1. Read `.claude/skills/motion-design-production/SKILL.md` and follow it.
2. Search the library first: `python3 .claude/skills/motion-design-production/scripts/search.py "<idea>" [--tech …] [--style …] [--motion …] [--ad …] [--method …]` and read the best 3–5 prompts (`--show`). Browse `resources/motion-index/by-*.md` for facets: motion type, visual style, technique, ad type, scene execution method, audio.
3. Reuse techniques, never copy a work verbatim. Storyboard → assets → code → stills → real render → QA (ffprobe, volumedetect, contact sheet) → fix.
4. Work inside `motion-lab/`; reuse `src/lib/{timing,camera,kit}.tsx`, `World3D.tsx`, `tools/{gen_vo.sh,mix_audio.py,check_env.sh}` as starting blocks.
5. Never declare done before a real MP4 has been rendered and inspected. Run renders in the background and poll the log.

## Environment notes
- FFmpeg is only available via Remotion: `npx remotion ffmpeg|ffprobe` (from `motion-lab/`).
- No GPU → `swangle` WebGL; 2 CPUs; ~0.5 s/frame at 1080p with live 3D. Plan time budget accordingly.
- System libs installed for Chrome: `libnss3 libnspr4`. Verify toolchain: `bash motion-lab/tools/check_env.sh`.
- Audio: open-source/free sources only (Mixkit SFX, Piper TTS, code-synthesised music). Be explicit in credits about what is AI-generated.
- If the user sets a deadline, record `date +%s > /tmp/start_ts` at the start and check elapsed minutes regularly.
