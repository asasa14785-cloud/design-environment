import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Glass, Letters, glassText, mono, prog, ease, DISPLAY, C} from '../lib/kit';

/** Scene 6 – finale: glass slab refracting the hero crystal, wordmark, tagline, CTA. */
export const S6Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const slab = spring({frame: frame - 0.1 * fps, fps, config: {damping: 14, stiffness: 90}});
  const cta = spring({frame: frame - 3.2 * fps, fps, config: {damping: 12, stiffness: 140}});
  const float = Math.sin(t * 1.4) * 8;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Glass
        radius={64}
        sheen={prog(t, 0.3, 3.2, ease.inOut)}
        style={{width: 1380, height: 520, transform: `translateY(${float}px) scale(${0.7 + 0.3 * slab}) rotateX(${(1 - slab) * 20}deg)`, opacity: slab, position: 'relative'}}
      >
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20}}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 34}}>
            <Letters text="DeepSeek" delay={0.8} stagger={0.055} style={glassText(190)} />
            <Letters text="V4" delay={1.3} stagger={0.1} style={glassText(190, true)} />
          </div>
          <div style={{fontFamily: DISPLAY, fontWeight: 500, fontSize: 64, color: '#fff', letterSpacing: '-0.01em', opacity: prog(t, 2.1, 2.7), transform: `translateY(${(1 - prog(t, 2.1, 2.8)) * 30}px)`}}>
            Think <span style={{color: C.cyan}}>deeper.</span>
          </div>
        </div>
      </Glass>

      <div style={{position: 'absolute', bottom: 120, transform: `scale(${0.6 + 0.4 * cta}) translateY(${(1 - cta) * 30}px)`, opacity: cta}}>
        <Glass radius={999} sheen={prog(t, 3.2, 5, ease.inOut)} style={{padding: '18px 46px', background: 'linear-gradient(135deg, rgba(77,107,254,0.7), rgba(107,227,255,0.3))'}}>
          <span style={mono(30, {color: '#fff', letterSpacing: '0.12em'})}>deepseek.com</span>
        </Glass>
      </div>
      <div style={{position: 'absolute', bottom: 48, ...mono(16, {opacity: prog(t, 4, 4.8) * 0.7, letterSpacing: '0.24em'})}}>
        Fan-made concept film · Remotion · Three.js · GSAP · Piper TTS
      </div>
    </AbsoluteFill>
  );
};
