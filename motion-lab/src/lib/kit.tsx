import React, {CSSProperties, ReactNode, useLayoutEffect, useRef} from 'react';
import {spring, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {loadFont as loadGrotesk} from '@remotion/google-fonts/SpaceGrotesk';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import gsap from 'gsap';

export const DISPLAY = loadGrotesk('normal', {weights: ['500', '700'], subsets: ['latin']}).fontFamily;
export const MONO = loadMono('normal', {weights: ['400', '500'], subsets: ['latin']}).fontFamily;

export const C = {
  bg: '#04060f',
  blue: '#4d6bfe',
  cyan: '#6be3ff',
  violet: '#9b7bff',
  mint: '#7dffc4',
  white: '#f4f7ff',
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
};
export const prog = (t: number, a: number, b: number, e = ease.out) =>
  interpolate(t, [a, b], [0, 1], {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

export const glassSurface: CSSProperties = {
  background:
    'linear-gradient(135deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.06) 40%, rgba(120,150,255,0.07) 100%)',
  backdropFilter: 'blur(26px) saturate(1.7) brightness(1.08)',
  WebkitBackdropFilter: 'blur(26px) saturate(1.7) brightness(1.08)',
  border: '1.5px solid rgba(255,255,255,0.30)',
  boxShadow:
    'inset 0 1.5px 0 rgba(255,255,255,0.55), inset 0 -1.5px 0 rgba(255,255,255,0.10), inset 0 0 40px rgba(140,170,255,0.10), 0 40px 90px rgba(0,0,20,0.55)',
};

/** Liquid-glass panel with a moving specular sheen. sheen: 0..1 position of the highlight. */
export const Glass: React.FC<{
  style?: CSSProperties;
  radius?: number;
  sheen?: number;
  children?: ReactNode;
  className?: string;
}> = ({style, radius = 32, sheen = 0.5, children, className}) => (
  <div className={className} style={{position: 'relative', borderRadius: radius, overflow: 'hidden', ...glassSurface, ...style}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(115deg, transparent ${sheen * 140 - 40}%, rgba(255,255,255,0.22) ${sheen * 140 - 25}%, transparent ${sheen * 140 - 5}%)`,
        pointerEvents: 'none',
      }}
    />
    <div style={{position: 'relative', width: '100%', height: '100%'}}>{children}</div>
  </div>
);

export const glassText = (size: number, accent = false): CSSProperties => ({
  fontFamily: DISPLAY,
  fontWeight: 700,
  fontSize: size,
  lineHeight: 0.95,
  letterSpacing: '-0.035em',
  color: 'transparent',
  backgroundImage: accent
    ? 'linear-gradient(180deg, #ffffff 0%, #9fb4ff 40%, #4d6bfe 75%, #b9c8ff 100%)'
    : 'linear-gradient(180deg, #ffffff 0%, rgba(205,222,255,0.62) 48%, rgba(255,255,255,0.92) 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextStroke: `${Math.max(1.5, size / 90)}px rgba(255,255,255,0.55)`,
  filter: `drop-shadow(0 ${size / 18}px ${size / 7}px rgba(77,107,254,0.55))`,
  whiteSpace: 'nowrap',
});

/** Per-letter spring reveal. delay in seconds (relative to current Sequence). */
export const Letters: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  from?: 'up' | 'down';
  style?: CSSProperties;
  blur?: number;
}> = ({text, delay = 0, stagger = 0.045, from = 'up', style, blur = 14}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <span style={{display: 'inline-block', whiteSpace: 'nowrap'}}>
      {text.split('').map((ch, i) => {
        const p = spring({
          frame: frame - (delay + i * stagger) * fps,
          fps,
          config: {damping: 13, stiffness: 110, mass: 0.9},
        });
        const dir = from === 'up' ? 1 : -1;
        return (
          <span
            key={i}
            style={{
              ...style,
              display: 'inline-block',
              transform: `translateY(${(1 - p) * 90 * dir}px) rotate(${(1 - p) * 6 * dir}deg) scale(${0.7 + 0.3 * p})`,
              opacity: clamp01(p * 1.6),
              filter: `${(style?.filter as string) ?? ''} blur(${(1 - clamp01(p)) * blur}px)`,
              whiteSpace: 'pre',
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};

/** Drives a paused GSAP timeline by the Remotion frame (frame-accurate seek). */
export function useGsapTimeline(build: (tl: gsap.core.Timeline, fps: number) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({paused: true});
      build(tl, fps);
      tlRef.current = tl;
    }, ref);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useLayoutEffect(() => {
    tlRef.current?.time(frame / fps, false);
  });
  return ref;
}

export const mono = (size: number, extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: MONO,
  fontSize: size,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'rgba(225,235,255,0.75)',
  ...extra,
});
