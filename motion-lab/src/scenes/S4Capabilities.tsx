import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, random} from 'remotion';
import {Glass, Letters, glassText, mono, prog, ease, DISPLAY, MONO, C, clamp01} from '../lib/kit';

const WORDS = ['REASON', 'CODE', 'CREATE', 'OPEN'];
const START = [0.5, 1.9, 3.3, 4.7];
const END = [1.9, 3.3, 4.7, 7.0];

const Canvas2D: React.FC<{t: number; local: number}> = ({t, local}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    const W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const n = 900;
    const grow = prog(local, 0, 1.2, ease.out);
    for (let i = 0; i < n; i++) {
      const arm = i % 3;
      const r0 = Math.pow(random('r' + i), 0.7);
      const a = r0 * 9 + arm * 2.094 + t * (0.5 + (1 - r0) * 0.8);
      const r = r0 * W * 0.46 * grow;
      const x = W / 2 + Math.cos(a) * r;
      const y = H / 2 + Math.sin(a) * r * 0.78;
      const s = 1 + random('s' + i) * 2.6;
      const hue = 215 + r0 * 80 + arm * 12;
      ctx.fillStyle = `hsla(${hue},95%,${60 + (1 - r0) * 25}%,${0.35 + (1 - r0) * 0.6})`;
      ctx.beginPath();
      ctx.arc(x, y, s, 0, 6.283);
      ctx.fill();
    }
    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 90);
    g.addColorStop(0, 'rgba(210,225,255,0.95)');
    g.addColorStop(1, 'rgba(77,107,254,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  });
  return <canvas ref={ref} width={680} height={560} style={{position: 'absolute', inset: 0, margin: 'auto'}} />;
};

const NODES: [number, number][] = [[340, 70], [170, 210], [510, 210], [90, 380], [250, 380], [430, 380], [590, 380]];
const EDGES: [number, number][] = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];

const Reason: React.FC<{l: number}> = ({l}) => (
  <svg width={680} height={560} viewBox="0 0 680 500">
    {EDGES.map(([a, b], i) => {
      const [x1, y1] = NODES[a], [x2, y2] = NODES[b];
      const len = Math.hypot(x2 - x1, y2 - y1);
      const p = prog(l, 0.1 + i * 0.12, 0.6 + i * 0.12);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6be3ff" strokeWidth={4} strokeDasharray={len} strokeDashoffset={len * (1 - p)} strokeLinecap="round" />;
    })}
    {NODES.map(([x, y], i) => {
      const p = prog(l, i * 0.1, i * 0.1 + 0.45);
      const pulse = 1 + 0.15 * Math.sin(l * 6 + i);
      return (
        <g key={i} transform={`translate(${x} ${y}) scale(${p * pulse})`}>
          <circle r={34} fill="rgba(77,107,254,0.35)" stroke="#9fb4ff" strokeWidth={3} />
          <circle r={12} fill={i === 0 ? '#7dffc4' : '#fff'} />
        </g>
      );
    })}
  </svg>
);

const CODE = [
  [['def ', '#c792ff'], ['think', '#6be3ff'], ['(problem):', '#e6edff']],
  [['  steps = ', '#e6edff'], ['plan', '#6be3ff'], ['(problem)', '#e6edff']],
  [['  for ', '#c792ff'], ['s ', '#e6edff'], ['in ', '#c792ff'], ['steps:', '#e6edff']],
  [['    verify', '#6be3ff'], ['(s)  ', '#e6edff'], ['# ✓', '#7dffc4']],
  [['  return ', '#c792ff'], ['answer(steps)', '#e6edff']],
];
const Code: React.FC<{l: number}> = ({l}) => {
  let budget = Math.floor(l * 62);
  return (
    <div style={{fontFamily: MONO, fontSize: 31, lineHeight: 1.9, padding: '10px 40px', whiteSpace: 'pre'}}>
      {CODE.map((line, i) => (
        <div key={i}>
          {line.map(([txt, col], j) => {
            const s = (txt as string).slice(0, Math.max(0, budget));
            budget -= (txt as string).length;
            return <span key={j} style={{color: col as string}}>{s}</span>;
          })}
        </div>
      ))}
      <span style={{color: C.cyan, opacity: Math.floor(l * 3) % 2}}>▍</span>
    </div>
  );
};

const Open: React.FC<{l: number}> = ({l}) => (
  <svg width={680} height={560} viewBox="-340 -280 680 560">
    {[0, 1, 2, 3].map((i) => {
      const p = (l * 0.5 + i * 0.25) % 1;
      return <circle key={i} r={40 + p * 260} fill="none" stroke="#6be3ff" strokeWidth={3} opacity={(1 - p) * 0.8} />;
    })}
    {Array.from({length: 18}).map((_, i) => {
      const a = (i / 18) * 6.283 + l * 0.4;
      const R = 150 + (i % 3) * 55;
      const p = prog(l, i * 0.035, i * 0.035 + 0.5);
      return (
        <g key={i}>
          <line x1={0} y1={0} x2={Math.cos(a) * R * p} y2={Math.sin(a) * R * p} stroke="rgba(160,190,255,0.5)" strokeWidth={2} />
          <circle cx={Math.cos(a) * R * p} cy={Math.sin(a) * R * p} r={9} fill={i % 2 ? '#fff' : '#9b7bff'} />
        </g>
      );
    })}
    <circle r={52} fill="rgba(77,107,254,0.5)" stroke="#fff" strokeWidth={3} />
    <text textAnchor="middle" y={12} fontFamily={DISPLAY} fontWeight={700} fontSize={36} fill="#fff">V4</text>
  </svg>
);

/** Scene 4 – kinetic words + four micro-visuals: SVG graph, typed code, Canvas2D galaxy, SVG network. */
export const S4Capabilities: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const exit = prog(t, 6.8, 7.4, ease.in);
  const idx = WORDS.findIndex((_, i) => t >= START[i] - 0.05 && t < END[i]);
  const cur = Math.max(0, idx);
  const local = t - START[cur];
  const swap = prog(local, 0, 0.45);

  return (
    <AbsoluteFill style={{opacity: 1 - exit, transform: `scale(${1 + exit * 0.08})`}}>
      {/* progress index */}
      <div style={{position: 'absolute', left: 130, top: 150, display: 'flex', gap: 14}}>
        {WORDS.map((w, i) => (
          <Glass key={w} radius={999} sheen={0.5} style={{padding: '10px 24px', opacity: t >= START[i] - 0.05 ? 1 : 0.35, background: cur === i ? 'linear-gradient(135deg, rgba(77,107,254,0.7), rgba(107,227,255,0.35))' : undefined}}>
            <span style={mono(20, {color: '#fff'})}>0{i + 1} {w}</span>
          </Glass>
        ))}
      </div>

      {WORDS.map((w, i) => {
        if (t < START[i] - 0.05 || t >= END[i]) return null;
        const out = i < 3 ? prog(t, END[i] - 0.3, END[i], ease.in) : 0;
        return (
          <div key={w} style={{position: 'absolute', left: 120, top: 330, opacity: 1 - out, transform: `translateY(${-out * 120}px)`}}>
            <Letters text={w} delay={START[i]} stagger={0.04} style={glassText(w.length > 5 ? 250 : 290, i === 3)} />
            {i === 3 && (
              <div style={{marginTop: 20, fontFamily: DISPLAY, fontWeight: 500, fontSize: 70, color: '#fff', letterSpacing: '-0.02em', opacity: prog(t, 5.7, 6.3), transform: `translateY(${(1 - prog(t, 5.7, 6.3)) * 30}px)`}}>
                to <span style={{color: C.cyan}}>everyone.</span>
              </div>
            )}
          </div>
        );
      })}

      <Glass radius={48} sheen={prog(local, 0, 1.4)} style={{position: 'absolute', left: 1030, top: 190, width: 770, height: 700, transform: `scale(${0.96 + 0.04 * swap}) rotateY(${(1 - swap) * -12}deg)`}}>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: clamp01(swap * 1.4)}}>
          <div style={{position: 'relative', width: 680, height: 560}}>
            {cur === 0 && <Reason l={local} />}
            {cur === 1 && <Code l={local} />}
            {cur === 2 && <Canvas2D t={t} local={local} />}
            {cur === 3 && <Open l={local} />}
          </div>
        </div>
        <div style={{position: 'absolute', left: 36, bottom: 26, ...mono(18)}}>{['svg · graph', 'live · code', 'canvas · particles', 'svg · network'][cur]}</div>
      </Glass>
    </AbsoluteFill>
  );
};
