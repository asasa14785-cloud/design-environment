#!/usr/bin/env python3
"""Builds the 45s soundtrack for the DeepSeek V4 concept ad.
- Music: procedurally synthesized (numpy/scipy) @128 BPM, 24 bars = 45.0s exactly
- SFX: Mixkit free sound effects (Mixkit License) + synthesized glass pings
- Voice: Piper neural TTS (open-source, en_US-ryan-high)
Output: public/audio/soundtrack.wav
"""
import os, subprocess, json
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 44100
DUR = 45.0
N = int(SR * DUR)
BPM = 128
BEAT = 60 / BPM
BAR = BEAT * 4
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RAW = os.path.join(ROOT, 'public/audio/raw')
REMOTION = os.path.join(ROOT, 'node_modules/.bin/remotion')
rng = np.random.default_rng(7)

def T(n=N): return np.arange(n) / SR

def add(buf, x, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= buf.shape[1] or i + len(x) <= 0: return
    j = min(buf.shape[1], i + len(x))
    seg = x[:j - i] * gain
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    buf[0, i:j] += seg * l * 1.414
    buf[1, i:j] += seg * r * 1.414

def lp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), 'low'); return signal.lfilter(b, a, x)
def hp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), 'high'); return signal.lfilter(b, a, x)
def bp(x, f1, f2, order=2):
    b, a = signal.butter(order, [f1 / (SR / 2), f2 / (SR / 2)], 'band'); return signal.lfilter(b, a, x)

def load_audio(path):
    tmp = '/tmp/_dec.wav'
    subprocess.run([REMOTION, 'ffmpeg', '-y', '-v', 'error', '-i', path, '-ar', str(SR), '-ac', '1', tmp], check=True, cwd=ROOT)
    sr, d = wavfile.read(tmp); d = d.astype(np.float32) / 32768
    pk = np.max(np.abs(d)) or 1
    return d / pk

def load_voice(path):
    sr, d = wavfile.read(path); d = d.astype(np.float32) / 32768
    if sr != SR: d = signal.resample_poly(d, SR, sr)
    d = d / (np.max(np.abs(d)) or 1)
    return d

stereo = lambda: np.zeros((2, N), dtype=np.float64)
music = stereo()
duck_env = np.zeros(N)

CH = [
    ([220.0, 261.63, 329.63], 55.0),     # Am
    ([174.61, 220.0, 261.63], 43.65),    # F
    ([261.63, 329.63, 392.0], 65.41),    # C
    ([196.0, 246.94, 293.66], 49.0),     # G
]

def saw_pad(freqs, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    out = np.zeros(n)
    for f in freqs:
        for det in (-0.004, 0.0, 0.004):
            ff = f * (1 + det)
            for h in range(1, 7):
                out += np.sin(2 * np.pi * ff * h * t + rng.uniform(0, 6.28)) / h
    return out / 12

def env_ar(n, a, r):
    e = np.ones(n); na = int(a * SR); nr = int(r * SR)
    e[:na] = np.linspace(0, 1, na) ** 2
    e[-nr:] = np.linspace(1, 0, nr) ** 2
    return e

def section_gain(t):
    if t < 7.5: return 0.45 + 0.25 * (t / 7.5)
    return 0.75

for bar in range(24):
    t0 = bar * BAR
    tones, root = CH[bar % 4]
    p = saw_pad(tones, BAR + 0.6)
    p = lp(p, 900 + 1800 * min(1, bar / 12))
    p *= env_ar(len(p), 0.35, 0.5)
    add(music, p, t0, 0.5 * section_gain(t0), pan=0)

def riser(t0, dur, f0, f1, gain):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    blk = 2048
    for i in range(0, n, blk):
        fc = f0 * (f1 / f0) ** (i / n)
        seg = noise[i:i + blk + 512]
        s = bp(seg, fc * 0.7, min(fc * 1.4, 20000), 2)[:blk]
        m = min(len(s), n - i)
        out[i:i + m] = s[:m]
    out *= (np.linspace(0, 1, n) ** 2.2)
    add(music, out, t0, gain)

riser(26.25, 3.75, 300, 9000, 0.9)
riser(3.0, 4.5, 200, 3000, 0.35)

def kick(gain=1.0):
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    k = np.sin(ph) * np.exp(-t * 7.5)
    click = np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 400) * 0.3
    return (k + click) * gain

def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR); t = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 7000) * np.exp(-t * (18 if open_ else 80))
    return x * 0.5

def clap():
    n = int(0.3 * SR); t = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 1200, 3800)
    e = np.exp(-t * 22)
    for d in (0.0, 0.012, 0.024):
        e = e + np.where(t > d, np.exp(-(t - d) * 90), 0) * 0.8
    return x * e * 0.6

def pluck(f, dur=0.35):
    n = int(dur * SR); t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t + 1) * np.exp(-t * 12)
         + 0.2 * signal.sawtooth(2 * np.pi * f * t)) * np.exp(-t * 9)
    return x * 0.35

def bass_note(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.15 * signal.sawtooth(2 * np.pi * f * t)
    return lp(x, 400) * np.exp(-t * 2.2) * 0.8

kick_times = []
for b in range(96):
    t = b * BEAT
    if 7.5 <= t < 15: kick_times.append((t, 0.55))
    elif 15 <= t < 28.125: kick_times.append((t, 0.9))
    elif 30 <= t < 37.5: kick_times.append((t, 1.0))
kick_times += [(30.0, 1.3), (37.5, 1.0), (7.5, 1.0)]
for t, g in kick_times:
    add(music, kick(g), t, 0.9)
    i = int(t * SR); m = min(int(0.35 * SR), N - i)
    if m > 0:
        duck_env[i:i + m] = np.maximum(duck_env[i:i + m], np.exp(-np.arange(m) / SR * 9))

for b in range(96 * 2):
    t = b * BEAT / 2
    off = (b % 2 == 1)
    if (15 <= t < 28.125 or 30 <= t < 37.5) and off: add(music, hat(True), t, 0.5, pan=0.3)
    elif (22.5 <= t < 28.125 or 30 <= t < 37.5) and not off: add(music, hat(), t, 0.25, pan=-0.3)
for b in range(96):
    t = b * BEAT
    if (b % 4 in (1, 3)) and (22.5 <= t < 28.125 or 30 <= t < 37.5): add(music, clap(), t, 0.8)
for b in range(96 * 2):
    t = b * BEAT / 2
    if 15 <= t < 28.125 or 30 <= t < 37.5:
        bar = int(t // BAR); root = CH[bar % 4][1]
        add(music, bass_note(root * (2 if b % 2 else 1), BEAT / 2 * 1.6), t, 0.6)
for s in range(int((37.5 - 22.5) / (BEAT / 4))):
    t = 22.5 + s * BEAT / 4
    if 28.125 <= t < 30: continue
    bar = int(t // BAR); tones, _ = CH[bar % 4]
    pat = [0, 1, 2, 1, 2, 1, 0, 2]
    f = tones[pat[s % 8]] * 2
    add(music, pluck(f), t, 0.5, pan=-0.4 + 0.8 * ((s % 8) / 7))

def boom():
    n = int(2.5 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (38 + 60 * np.exp(-t * 3)) * t) * np.exp(-t * 1.6)
add(music, boom(), 30.0, 0.9); add(music, boom(), 7.5, 0.5); add(music, boom(), 37.5, 0.7)
music *= (1 - 0.38 * duck_env)

# ---------- SFX ----------
sfx = stereo()
mk = lambda i: load_audio(os.path.join(RAW, f'mixkit-{i}.mp3'))
whoosh_a, whoosh_b, whoosh_c = mk(1489), mk(1491), mk(1485)
imp_a, imp_b, imp_c = mk(1143), mk(2150), mk(2180)
ui = [mk(i) for i in (1106, 1108, 2310, 2320, 2344)]
long_w = mk(1714); w2350 = mk(2350)

for tb, w in ((7.5, whoosh_a), (15, whoosh_b), (22.5, whoosh_a), (37.5, w2350)):
    add(sfx, w, tb - 0.45, 0.55)
add(sfx, long_w, 28.0, 0.6)
add(sfx, imp_a, 30.0, 0.9); add(sfx, imp_c, 7.5, 0.55); add(sfx, imp_c, 37.5, 0.5)
add(sfx, imp_b, 22.5, 0.5)

def glass_ping(f, dur=1.4):
    n = int(dur * SR); t = np.arange(n) / SR
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.5 * np.exp(-t * 6)
    x = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 3.2) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 5)
    return x * 0.5

for t, f in ((1.0, 1318.5), (2.1, 1568.0), (3.3, 1760.0)):
    add(sfx, glass_ping(f), t, 0.35, pan=-0.3)
for k, t in enumerate((4.6, 5.3, 6.0)):
    add(sfx, ui[k % len(ui)], t, 0.4, pan=0.2)
add(sfx, glass_ping(1046.5, 2.2), 8.6, 0.45)
for k, t in enumerate((16.0, 17.1, 17.8, 18.5, 19.2, 19.9, 20.6, 21.4)):
    add(sfx, ui[k % len(ui)], t, 0.38, pan=-0.5 + 0.2 * (k % 6))
    add(sfx, glass_ping([1318.5, 1568, 1760, 2093][k % 4], 0.9), t + 0.02, 0.18)
for k, t in enumerate((23.0, 24.4, 25.8, 27.2)):
    add(sfx, glass_ping([880, 1108.7, 1318.5, 1760][k], 1.6), t, 0.42)
    add(sfx, whoosh_c, t - 0.12, 0.35)
for t in (30.0, 31.875, 33.75, 35.625):
    add(sfx, imp_b, t, 0.55)
add(sfx, glass_ping(1568, 3.0), 38.7, 0.5); add(sfx, glass_ping(2093, 3.0), 38.9, 0.35)

# ---------- voice ----------
VO_T = [0.75, 8.35, 15.95, 23.45, 30.5, 38.35]
voice = stereo()
vo_env = np.zeros(N)
vo_info = []
for k, t0 in enumerate(VO_T):
    v = load_voice(os.path.join(HERE, 'vo', f'line{k+1}.wav'))
    v = hp(v, 80)
    v = np.tanh(v * 1.6) * 0.75
    add(voice, v, t0, 1.0)
    i = int(t0 * SR); e = np.zeros(N); e[i:i + len(v)] = 1
    vo_env = np.maximum(vo_env, e)
    vo_info.append({'line': k + 1, 'start': t0, 'dur': round(len(v) / SR, 2)})
w = int(0.25 * SR)
vo_env = np.convolve(vo_env, np.hanning(w) / np.hanning(w).sum(), mode='same')
music *= (1 - 0.45 * vo_env)
sfx *= (1 - 0.3 * vo_env)

mix = music * 0.62 + sfx * 0.85 + voice * 1.15
fade_in = np.minimum(1, T() / 0.6)
fade_out = np.minimum(1, (DUR - T()) / 2.2)
mix *= fade_in * fade_out
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix = mix / np.max(np.abs(mix)) * 0.89
out = (mix.T * 32767).astype(np.int16)
os.makedirs(os.path.join(ROOT, 'public/audio'), exist_ok=True)
wavfile.write(os.path.join(ROOT, 'public/audio/soundtrack.wav'), SR, out)
json.dump(vo_info, open(os.path.join(HERE, 'vo_timing.json'), 'w'), indent=1)
print('OK soundtrack', out.shape, 'peak', int(np.abs(out).max()), vo_info)
