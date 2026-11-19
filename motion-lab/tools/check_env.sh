#!/bin/bash
# Verifies the motion production toolchain. Run: bash motion-lab/tools/check_env.sh
cd "$(dirname "$0")/.." || exit 1
ok(){ echo "  [OK]   $1"; }; bad(){ echo "  [MISS] $1"; }
echo "== Runtime"; node -v >/dev/null 2>&1 && ok "node $(node -v) / npm $(npm -v)" || bad node
echo "== npm packages (motion-lab)"
for p in remotion @remotion/cli @remotion/three @remotion/google-fonts three @react-three/fiber gsap; do
  v=$(node -p "require('./node_modules/$p/package.json').version" 2>/dev/null) && ok "$p $v" || bad "$p"
done
for p in hyperframes puppeteer playwright; do [ -d node_modules/$p ] && ok "$p (installed)" || echo "  [n/a]  $p not installed (not needed unless the task requires it)"; done
echo "== FFmpeg (Remotion bundled)"; npx --no-install remotion ffmpeg -version 2>&1 | head -1
echo "== Browser"; CH=$(ls node_modules/.remotion/chrome-headless-shell/linux64/*/chrome-headless-shell 2>/dev/null | head -1)
[ -n "$CH" ] && { missing=$(ldd "$CH" | grep -c "not found"); [ "$missing" = 0 ] && ok "chrome-headless-shell, libs OK" || bad "chrome libs missing: sudo apt-get install -y libnss3 libnspr4"; } || bad "chrome-headless-shell (run: npx remotion browser ensure)"
echo "== Audio tooling"; export PATH=$PATH:$HOME/.local/bin
command -v piper >/dev/null && ok "piper $(pip show piper-tts 2>/dev/null | grep ^Version)" || bad piper
python3 -c "import numpy,scipy;print('  [OK]   numpy',numpy.__version__,'scipy',scipy.__version__)" 2>/dev/null || bad "numpy/scipy"
[ -f tools/voices/ryan.onnx ] && ok "voice model ryan.onnx" || bad "voice model (see tools/gen_vo.sh header)"
echo "== Library"; [ -f ../resources/motion-index/index.json ] && ok "motion index present" || bad "run build_index.py"
