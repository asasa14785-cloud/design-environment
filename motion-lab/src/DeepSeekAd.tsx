import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {World3D} from './World3D';
import {S1Typography} from './scenes/S1Typography';
import {S2Reveal} from './scenes/S2Reveal';
import {S3GsapUI} from './scenes/S3GsapUI';
import {S4Capabilities} from './scenes/S4Capabilities';
import {S5Drop} from './scenes/S5Drop';
import {S6Finale} from './scenes/S6Finale';
import {SCENE, SCENE_LEN, sec} from './lib/timing';
import {mono, prog, ease} from './lib/kit';

/** Wide glass sheet that sweeps across and hides the scene swap. */
const GlassWipe: React.FC<{at: number; t: number}> = ({at, t}) => {
  const p = prog(t, at - 0.5, at + 0.5, ease.inOut);
  if (t < at - 0.55 || t > at + 0.55) return null;
  const x = -150 + p * 260; // percent
  return (
    <div style={{position: 'absolute', top: -100, bottom: -100, width: '150%', left: `${x}%`, transform: 'skewX(-14deg)', backdropFilter: 'blur(38px) brightness(1.5) saturate(1.5)', background: 'linear-gradient(90deg, rgba(190,215,255,0.0) 0%, rgba(160,195,255,0.55) 8%, rgba(110,150,255,0.35) 60%, rgba(255,255,255,0.0) 100%)', borderLeft: '6px solid rgba(255,255,255,0.9)', boxShadow: '-40px 0 120px rgba(120,170,255,0.8)'}} />
  );
};

const Hud: React.FC<{t: number}> = ({t}) => {
  const fmt = (s: number) => `00:${String(Math.floor(s)).padStart(2, '0')}`;
  return (
    <>
      <div style={{position: 'absolute', left: 70, top: 56, ...mono(18, {opacity: 0.8})}}>DeepSeek V4 · concept film</div>
      <div style={{position: 'absolute', right: 70, top: 56, ...mono(18, {opacity: 0.8})}}>{fmt(t)} / 00:45</div>
      <div style={{position: 'absolute', left: 70, right: 70, bottom: 36, height: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 3}}>
        <div style={{width: `${(t / 45) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#4d6bfe,#6be3ff)', borderRadius: 3, boxShadow: '0 0 14px #4d6bfe'}} />
      </div>
    </>
  );
};

export const DeepSeekAd: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;
  const fadeIn = 1 - prog(t, 0, 0.9, ease.out);
  const fadeOut = prog(t, 44.1, 44.95, ease.inOut);
  const flash = (t > 7.2 && t < 8.2 ? prog(t, 7.2, 7.5) * (1 - prog(t, 7.5, 8.2)) : 0) * 0.95 + (t >= 37.4 && t < 38 ? (1 - prog(t, 37.5, 38)) * 0.6 : 0);

  return (
    <AbsoluteFill style={{background: '#04060f'}}>
      <World3D width={width} height={height} />
      <Sequence from={sec(SCENE.s1)} durationInFrames={SCENE_LEN} layout="none"><S1Typography /></Sequence>
      <Sequence from={sec(SCENE.s2)} durationInFrames={SCENE_LEN} layout="none"><S2Reveal /></Sequence>
      <Sequence from={sec(SCENE.s3)} durationInFrames={SCENE_LEN} layout="none"><S3GsapUI /></Sequence>
      <Sequence from={sec(SCENE.s4)} durationInFrames={SCENE_LEN} layout="none"><S4Capabilities /></Sequence>
      <Sequence from={sec(SCENE.s5)} durationInFrames={SCENE_LEN} layout="none"><S5Drop /></Sequence>
      <Sequence from={sec(SCENE.s6)} durationInFrames={SCENE_LEN} layout="none"><S6Finale /></Sequence>

      <GlassWipe at={15} t={t} />
      <GlassWipe at={22.5} t={t} />
      <GlassWipe at={37.5} t={t} />

      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(2,3,10,0.7) 100%)', pointerEvents: 'none'}} />
      <Hud t={t} />
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
      <AbsoluteFill style={{background: '#000', opacity: Math.max(fadeIn, fadeOut)}} />
      <Audio src={staticFile('audio/soundtrack.wav')} />
    </AbsoluteFill>
  );
};
