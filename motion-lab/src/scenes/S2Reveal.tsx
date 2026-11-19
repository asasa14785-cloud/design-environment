import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Letters, glassText, Glass, mono, prog, ease, DISPLAY, C} from '../lib/kit';
import {camZ} from '../lib/camera';

/** Scene 2 – Three.js dive: glass wordmark over the live 3D crystal tunnel + depth HUD. */
export const S2Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const gt = t + 7.5;
  const depth = Math.round(-camZ(gt) * 12 + 84);
  const exit = prog(t, 6.7, 7.4, ease.in);

  return (
    <AbsoluteFill style={{transform: `translateX(${-exit * 140}px)`, opacity: 1 - exit}}>
      {/* corner brackets draw in */}
      {[
        {l: 70, t: 70, r: 0},
        {l: 1850, t: 70, r: 90},
        {l: 1850, t: 1010, r: 180},
        {l: 70, t: 1010, r: 270},
      ].map((b, i) => (
        <svg key={i} width={70} height={70} style={{position: 'absolute', left: b.l - (b.l > 900 ? 70 : 0), top: b.t - (b.t > 500 ? 70 : 0), transform: `rotate(${b.r}deg)`, opacity: 0.8}}>
          <path d="M2 68 V2 H68" fill="none" stroke="rgba(180,205,255,0.85)" strokeWidth={3} strokeDasharray={140} strokeDashoffset={140 * (1 - prog(t, 0.2 + i * 0.1, 1.0))} />
        </svg>
      ))}

      <div style={{position: 'absolute', left: 130, top: 330}}>
        <Glass radius={999} sheen={prog(t, 0.2, 2.4, ease.inOut)} style={{display: 'inline-block', padding: '12px 30px', opacity: prog(t, 0.2, 0.7)}}>
          <span style={mono(26, {color: '#dfe9ff'})}>● Introducing</span>
        </Glass>
        <div style={{marginTop: 26, display: 'flex', alignItems: 'baseline', gap: 36}}>
          <Letters text="DeepSeek" delay={0.8} stagger={0.06} style={glassText(210)} />
          <Letters text="V4" delay={1.35} stagger={0.1} style={glassText(210, true)} />
        </div>
        <div style={{marginTop: 28, fontFamily: DISPLAY, fontWeight: 500, fontSize: 56, color: 'rgba(235,242,255,0.92)', letterSpacing: '-0.01em', opacity: prog(t, 2.5, 3.1), transform: `translateY(${(1 - prog(t, 2.5, 3.2)) * 30}px)`}}>
          Reasoning you can <span style={{color: C.cyan}}>see through.</span>
        </div>
        <div style={{height: 3, marginTop: 34, width: 760 * prog(t, 3.0, 4.4, ease.inOut), background: 'linear-gradient(90deg, #4d6bfe, #6be3ff, transparent)', borderRadius: 3}} />
      </div>

      {/* depth HUD */}
      <Glass radius={22} sheen={prog(t, 1, 5, ease.inOut)} style={{position: 'absolute', left: 130, bottom: 120, padding: '18px 30px', opacity: prog(t, 3.2, 3.8), minWidth: 360}}>
        <div style={mono(20)}>Depth</div>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: '#fff', letterSpacing: '-0.02em'}}>
          {String(depth).padStart(4, '0')}
          <span style={{...mono(24), marginLeft: 12}}>m</span>
        </div>
      </Glass>
    </AbsoluteFill>
  );
};
