import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, Audio, staticFile} from 'remotion';
import gsap from 'gsap';
import {Letters, glassText, Glass, mono, useGsapTimeline, C} from './lib/kit';
import {World3D} from './World3D';

/** Tiny pipeline check: (1) motion typography, (2) Three.js 3D, (3) GSAP transitions → one video. */
const LabType: React.FC = () => (
  <AbsoluteFill style={{background: '#04060f', alignItems: 'center', justifyContent: 'center'}}>
    <Letters text="TYPOGRAPHY" delay={0.1} style={glassText(120)} />
  </AbsoluteFill>
);

const Lab3D: React.FC = () => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill>
      <World3D width={width} height={height} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 60}}>
        <span style={mono(26)}>three.js · webgl</span>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const LabGsap: React.FC = () => {
  const ref = useGsapTimeline((tl) => {
    tl.from('.c', {y: 120, rotationX: -50, opacity: 0, stagger: 0.18, duration: 0.8, ease: 'expo.out', transformPerspective: 800});
    tl.to('.c', {x: (i: number) => (i - 1) * 40, rotation: (i: number) => (i - 1) * 8, duration: 0.6, ease: 'power2.inOut'}, 1.2);
  });
  void gsap;
  return (
    <AbsoluteFill ref={ref} style={{background: 'linear-gradient(135deg,#0a1030,#04060f)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 30}}>
      {[0, 1, 2].map((i) => (
        <Glass key={i} className="c" radius={30} style={{width: 220, height: 280}}>
          <div style={{...mono(22, {color: C.cyan}), padding: 24}}>gsap {i + 1}</div>
        </Glass>
      ))}
    </AbsoluteFill>
  );
};

export const Lab: React.FC = () => {
  useCurrentFrame();
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={60}><LabType /></Sequence>
      <Sequence from={60} durationInFrames={60}><Lab3D /></Sequence>
      <Sequence from={120} durationInFrames={60}><LabGsap /></Sequence>
      <Audio src={staticFile('audio/soundtrack.wav')} endAt={180} />
    </AbsoluteFill>
  );
};
