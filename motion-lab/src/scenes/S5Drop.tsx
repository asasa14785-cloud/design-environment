import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, random, spring} from 'remotion';
import {glassText, Glass, mono, prog, ease, DISPLAY, clamp01} from '../lib/kit';
import {BAR} from '../lib/timing';

const SLAMS = [
  {text: 'FASTER.', at: 0, size: 340},
  {text: 'SHARPER.', at: BAR, size: 340},
  {text: 'BUILT IN THE OPEN', at: BAR * 2, size: 150},
  {text: 'DEEPER.', at: BAR * 3, size: 380},
];

const Warp: React.FC<{t: number; boost: number}> = ({t, boost}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    const W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';
    for (let i = 0; i < 260; i++) {
      const a = random('a' + i) * 6.283;
      const sp = 0.25 + random('v' + i) * 0.7;
      const ph = random('p' + i);
      const p = (ph + t * sp * (0.8 + boost * 1.5)) % 1;
      const r0 = Math.pow(p, 2.2) * 1250 + 40;
      const len = 20 + p * p * (160 + boost * 420);
      const x1 = W / 2 + Math.cos(a) * r0, y1 = H / 2 + Math.sin(a) * r0 * 0.6;
      const x2 = W / 2 + Math.cos(a) * (r0 + len), y2 = H / 2 + Math.sin(a) * (r0 + len) * 0.6;
      ctx.strokeStyle = `hsla(${210 + random('h' + i) * 60},100%,${70 + p * 25}%,${p * 0.85})`;
      ctx.lineWidth = 1 + p * 4;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  });
  return <canvas ref={ref} width={1920} height={1080} style={{position: 'absolute', inset: 0}} />;
};

/** Scene 5 – the drop: beat-locked slams, chromatic split, shockwaves, Canvas2D warp, camera shake. */
export const S5Drop: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const slamIdx = SLAMS.reduce((acc, s, i) => (t >= s.at - 0.001 ? i : acc), 0);
  const s = SLAMS[slamIdx];
  const sl = t - s.at;
  const hitDecay = Math.exp(-sl * 7);
  const p = spring({frame: frame - s.at * fps, fps, config: {damping: 9, stiffness: 190, mass: 0.7}});
  const flash = t < 0.5 ? Math.exp(-t * 7) : 0;
  const shakeX = (random('sx' + Math.floor(t * 60)) - 0.5) * 22 * hitDecay;
  const shakeY = (random('sy' + Math.floor(t * 60)) - 0.5) * 22 * hitDecay;
  const exit = prog(t, 7.0, 7.45, ease.in);
  const last = slamIdx === 3;
  const chroma = hitDecay * 26;
  const word = (color: string | undefined, dx: number, blend?: boolean) => (
    <div
      style={{
        position: 'absolute',
        transform: `translateX(${dx}px)`,
        mixBlendMode: blend ? 'screen' : undefined,
        fontFamily: DISPLAY,
        fontWeight: 700,
        fontSize: s.size,
        letterSpacing: '-0.04em',
        lineHeight: 0.95,
        whiteSpace: 'nowrap',
        color,
      }}
    >
      {s.text}
    </div>
  );

  return (
    <AbsoluteFill style={{opacity: 1 - exit}}>
      <Warp t={t} boost={Math.max(hitDecay, last ? 0.5 : 0)} />
      {/* shockwave rings on each slam */}
      {SLAMS.map((sl2, i) => {
        const k = prog(t, sl2.at, sl2.at + 0.9, ease.out);
        return (
          <svg key={i} width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: t >= sl2.at ? 1 - k : 0}}>
            <circle cx={960} cy={540} r={60 + k * 1300} fill="none" stroke="rgba(150,190,255,0.9)" strokeWidth={14 * (1 - k) + 1} />
          </svg>
        );
      })}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translate(${shakeX}px, ${shakeY}px) scale(${0.65 + 0.35 * p + (last ? sl * 0.012 : 0)})`}}>
        <div style={{position: 'relative', display: 'grid', placeItems: 'center', height: s.size, width: 1700}}>
          {word('rgba(0,255,255,0.85)', -chroma, true)}
          {word('rgba(255,40,140,0.85)', chroma, true)}
          <div style={{...glassText(s.size, last), position: 'absolute'}}>{s.text}</div>
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 130, top: 130, opacity: 0.9}}>
        <Glass radius={999} sheen={(t * 0.4) % 1} style={{padding: '10px 26px'}}>
          <span style={mono(22, {color: '#fff'})}>128 BPM · beat {Math.floor(t / (60 / 128)) + 1}</span>
        </Glass>
      </div>
      <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash * 0.85, mixBlendMode: 'screen'}} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle, transparent 40%, rgba(2,4,12,0.55))', opacity: clamp01(1)}} />
    </AbsoluteFill>
  );
};
