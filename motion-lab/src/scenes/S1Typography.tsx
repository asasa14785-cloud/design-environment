import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Letters, glassText, mono, prog, ease, clamp01, DISPLAY} from '../lib/kit';

/** Scene 1 – Motion Typography: word pops → slam → depth-echo tunnel of type → zoom through the letters. */
export const S1Typography: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const zoom = prog(t, 6.3, 7.5, ease.in);
  const scale = Math.exp(zoom * 4.2);
  const words = ['WHAT', 'IF', 'AI', 'COULD'];
  const flow = (t * 0.8) % 1;
  const echoes = t > 3.2 ? [0, 1, 2, 3, 4, 5, 6, 7] : [];
  const echoIn = prog(t, 3.2, 4.2);
  const chroma = Math.exp(-Math.max(0, t - 2.1) * 7) * 16 + (t > 4.2 ? Math.abs(Math.sin(t * 9)) * 1.2 * (t % 0.9 < 0.1 ? 6 : 0.6) : 0);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          transform: `scale(${scale})`,
          opacity: 1 - prog(t, 7.1, 7.45),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          position: 'relative',
        }}
      >
        {/* intro row */}
        <div style={{display: 'flex', gap: 34, marginBottom: 8}}>
          {words.map((w, i) => {
            const p = spring({frame: frame - (0.85 + i * 0.16) * fps, fps, config: {damping: 11, stiffness: 160}});
            return (
              <span
                key={w}
                style={{
                  ...mono(54, {letterSpacing: '0.34em', color: '#e8f0ff', fontWeight: 500}),
                  transform: `scale(${0.5 + 0.5 * p}) translateY(${(1 - p) * 40}px)`,
                  opacity: clamp01(p),
                  textShadow: '0 0 30px rgba(107,227,255,0.55)',
                }}
              >
                {w}
              </span>
            );
          })}
        </div>

        <div style={{position: 'relative', height: 270, display: 'flex', alignItems: 'center'}}>
          <Letters text="THINK" delay={1.55} stagger={0.05} style={{...glassText(270)}} />
        </div>

        {/* DEEPER? with echo tunnel behind */}
        <div style={{position: 'relative', height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 1300}}>
          {echoes.map((k) => {
            const kk = k + flow;
            const sc = Math.pow(0.8, kk + 0.4);
            return (
              <div
                key={k}
                style={{
                  position: 'absolute',
                  transform: `scale(${sc}) translateY(${-kk * 8}px)`,
                  opacity: echoIn * (1 - kk / 8) * 0.55,
                  fontFamily: DISPLAY,
                  fontWeight: 700,
                  fontSize: 270,
                  letterSpacing: '-0.035em',
                  lineHeight: 0.95,
                  color: 'transparent',
                  WebkitTextStroke: '2px rgba(130,170,255,0.9)',
                  whiteSpace: 'nowrap',
                }}
              >
                DEEPER?
              </div>
            );
          })}
          {/* chromatic split copies */}
          {[
            {c: 'rgba(0,255,255,0.8)', dx: -chroma},
            {c: 'rgba(255,40,140,0.8)', dx: chroma},
          ].map((o, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                transform: `translateX(${o.dx}px)`,
                mixBlendMode: 'screen',
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 270,
                letterSpacing: '-0.035em',
                lineHeight: 0.95,
                color: o.c,
                opacity: clamp01(prog(t, 2.1, 2.3)) * 0.8,
                whiteSpace: 'nowrap',
              }}
            >
              <Letters text="DEEPER?" delay={2.1} stagger={0.055} from="down" />
            </div>
          ))}
          <Letters text="DEEPER?" delay={2.1} stagger={0.055} from="down" style={{...glassText(270, true), position: 'relative'}} />
        </div>
      </div>

      {/* scanning light line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 3,
          left: `${prog(t, 4.0, 5.6, ease.inOut) * 120 - 10}%`,
          background: 'linear-gradient(180deg, transparent, rgba(160,200,255,0.9), transparent)',
          boxShadow: '0 0 60px 20px rgba(100,150,255,0.35)',
          opacity: t > 4 && t < 5.7 ? 1 : 0,
        }}
      />
    </AbsoluteFill>
  );
};
