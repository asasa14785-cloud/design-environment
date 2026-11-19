#!/bin/bash
export PATH=$PATH:$HOME/.local/bin
cd "$(dirname "$0")"
i=1
while IFS= read -r line; do
  echo "$line" | piper -m voices/ryan.onnx -c voices/ryan.onnx.json --length-scale 0.95 --sentence-silence 0.25 -f vo/line$i.wav >/dev/null 2>&1
  i=$((i+1))
done < vo_lines.txt
echo VODONE
