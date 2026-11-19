// Single source of truth for timing. 128 BPM, 24 bars = 45.0s exactly.
export const FPS = 30;
export const DURATION_S = 45;
export const DURATION = DURATION_S * FPS; // 1350
export const BPM = 128;
export const BEAT = 60 / BPM; // 0.46875s
export const BAR = BEAT * 4; // 1.875s

// scene boundaries land on bar lines (4 bars = 7.5s)
export const SCENE = {
  s1: 0,
  s2: 7.5,
  s3: 15,
  s4: 22.5,
  s5: 30,
  s6: 37.5,
  end: 45,
};
export const sec = (s: number) => Math.round(s * FPS);
export const SCENE_LEN = sec(7.5);
