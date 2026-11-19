import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Glass, mono, useGsapTimeline, prog, ease, DISPLAY, MONO, C} from '../lib/kit';

const CHIP_T = [2.1, 2.8, 3.5, 4.2, 4.9, 5.6];
const FINAL_T = 6.4;
const STEPS = [
  ['01', 'Assume √2 = p/q in lowest terms'],
  ['02', 'Square both sides → 2q² = p²'],
  ['03', 'p² is even, so p is even'],
  ['04', 'Write p = 2k → q² = 2k²'],
  ['05', 'Then q is even as well'],
  ['06', 'Contradiction: not lowest terms'],
];
const STREAM = [
  '› parse claim … √2 ∉ ℚ',
  '› strategy: proof by contradiction',
  '› assume √2 = p/q, gcd(p,q) = 1',
  '› 2q² = p²  ⇒  p even',
  '› p = 2k  ⇒  q² = 2k²  ⇒  q even',
  '› gcd ≥ 2  —  contradiction ✓',
];

const typed = (s: string, t: number, start: number, cps = 46) => s.slice(0, Math.max(0, Math.floor((t - start) * cps)));

/** Scene 3 – GSAP: a frame-seeked master timeline drives 3D glass cards, stagger, SVG path draw and exit. */
export const S3GsapUI: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const root = useGsapTimeline((tl) => {
    tl.from('.panel', {y: 160, rotationX: -32, opacity: 0, scale: 0.9, transformPerspective: 1400, duration: 1.0, ease: 'expo.out'}, 0.1);
    tl.from('.bubble', {x: -60, opacity: 0, scale: 0.9, duration: 0.6, ease: 'back.out(2.2)'}, 0.95);
    tl.fromTo('.spine', {strokeDashoffset: 760}, {strokeDashoffset: 0, duration: 4.2, ease: 'none'}, 2.0);
    CHIP_T.forEach((ct, i) => {
      tl.from(`.chip-${i}`, {x: 260, rotationY: -40, opacity: 0, scale: 0.85, transformPerspective: 1200, duration: 0.75, ease: 'expo.out'}, ct);
      tl.from(`.node-${i}`, {scale: 0, duration: 0.5, ease: 'back.out(4)', transformOrigin: '50% 50%'}, ct + 0.05);
      tl.from(`.chipnum-${i}`, {scale: 0.2, rotation: -90, duration: 0.6, ease: 'elastic.out(1,0.5)'}, ct + 0.1);
    });
    tl.from('.final', {y: 90, scale: 0.7, opacity: 0, rotationX: 40, transformPerspective: 1200, duration: 0.8, ease: 'back.out(1.7)'}, FINAL_T);
    tl.from('.tick', {scale: 0, rotation: -180, duration: 0.7, ease: 'elastic.out(1,0.45)'}, FINAL_T + 0.2);
    // exit
    tl.to('.panel', {x: -420, rotationY: 25, opacity: 0, duration: 0.5, ease: 'power3.in'}, 6.95);
    tl.to('.chips > *', {x: 420, opacity: 0, rotationY: 30, stagger: 0.035, duration: 0.45, ease: 'power3.in'}, 6.9);
  });

  const sheen = prog(t, 0, 7, ease.inOut);

  return (
    <AbsoluteFill ref={root} style={{perspective: 1800}}>
      {/* left reasoning chat */}
      <Glass className="panel" radius={40} sheen={sheen} style={{position: 'absolute', left: 120, top: 170, width: 800, height: 740}}>
        <div style={{padding: '30px 40px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            {['#ff6b6b', '#ffd36b', '#6bffb0'].map((c) => (
              <span key={c} style={{width: 14, height: 14, borderRadius: 14, background: c, opacity: 0.9}} />
            ))}
            <span style={{...mono(20), marginLeft: 20}}>DeepSeek V4 · Reasoning</span>
          </div>
          <div style={{height: 1, background: 'rgba(255,255,255,0.18)', margin: '24px 0'}} />
          <div className="bubble" style={{alignSelf: 'flex-end', marginLeft: 'auto', width: 'fit-content', padding: '16px 28px', borderRadius: 26, background: 'linear-gradient(135deg, rgba(77,107,254,0.85), rgba(107,160,255,0.65))', fontFamily: DISPLAY, fontWeight: 500, fontSize: 34, color: '#fff'}}>
            {typed('Prove that √2 is irrational.', t, 1.05, 36)}
            <span style={{opacity: Math.floor(t * 3) % 2 ? 0 : 1}}>{t < 2 ? '▍' : ''}</span>
          </div>
          <div style={{marginTop: 34, ...mono(18, {color: C.cyan})}}>
            ◐ thinking{'.'.repeat(1 + (Math.floor(t * 4) % 3))}
          </div>
          <div style={{marginTop: 18, fontFamily: MONO, fontSize: 25, lineHeight: 1.75, color: 'rgba(220,232,255,0.88)', minHeight: 330}}>
            {STREAM.map((s, i) => (
              <div key={i} style={{opacity: t > CHIP_T[i] + 0.1 ? 1 : 0, color: i === 5 ? C.mint : undefined}}>
                {typed(s, t, CHIP_T[i] + 0.1, 60)}
              </div>
            ))}
          </div>
          <div style={{height: 6, borderRadius: 6, background: 'rgba(255,255,255,0.12)', marginTop: 8, overflow: 'hidden'}}>
            <div style={{height: '100%', width: `${prog(t, 2, 6.4, ease.inOut) * 100}%`, background: 'linear-gradient(90deg,#4d6bfe,#6be3ff)', boxShadow: '0 0 20px #4d6bfe'}} />
          </div>
        </div>
      </Glass>

      {/* spine + nodes */}
      <svg width={80} height={900} style={{position: 'absolute', left: 940, top: 100, overflow: 'visible'}}>
        <path className="spine" d="M40 70 V 710" stroke="url(#sp)" strokeWidth={3} strokeDasharray={760} fill="none" strokeLinecap="round" />
        <defs>
          <linearGradient id="sp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6be3ff" />
            <stop offset="1" stopColor="#9b7bff" />
          </linearGradient>
        </defs>
        {CHIP_T.map((_, i) => (
          <circle key={i} className={`node-${i}`} cx={40} cy={70 + i * 128} r={11} fill="#0a1030" stroke="#6be3ff" strokeWidth={3} />
        ))}
      </svg>

      {/* right chips */}
      <div className="chips">
        {STEPS.map(([n, label], i) => (
          <Glass key={i} className={`chip-${i}`} radius={26} sheen={(sheen * 1.4 + i * 0.12) % 1} style={{position: 'absolute', left: 1030, top: 150 + i * 128, width: 770, height: 104}}>
            <div style={{display: 'flex', alignItems: 'center', height: 104, padding: '0 30px', gap: 26}}>
              <span className={`chipnum-${i}`} style={{width: 52, height: 52, borderRadius: 52, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#4d6bfe,#6be3ff)', fontFamily: MONO, fontWeight: 500, fontSize: 22, color: '#04102e'}}>
                {n}
              </span>
              <span style={{fontFamily: DISPLAY, fontWeight: 500, fontSize: 34, color: '#f1f5ff', letterSpacing: '-0.01em'}}>{label}</span>
            </div>
          </Glass>
        ))}
      </div>

      <Glass className="final" radius={30} sheen={(sheen * 2) % 1} style={{position: 'absolute', left: 1030, top: 930, width: 770, height: 112, background: 'linear-gradient(135deg, rgba(125,255,196,0.28), rgba(77,107,254,0.18))'}}>
        <div style={{display: 'flex', alignItems: 'center', height: 112, padding: '0 34px', gap: 24}}>
          <span className="tick" style={{width: 58, height: 58, borderRadius: 58, background: C.mint, display: 'grid', placeItems: 'center', color: '#032a1a', fontSize: 34, fontWeight: 700, boxShadow: '0 0 40px rgba(125,255,196,0.7)'}}>✓</span>
          <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, color: '#fff'}}>√2 is irrational. ∎</span>
        </div>
      </Glass>
    </AbsoluteFill>
  );
};
