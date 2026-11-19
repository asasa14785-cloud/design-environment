import {interpolate, Easing} from 'remotion';

// Camera dives through the "depth tunnel" along -Z. Keyframes land on scene boundaries.
const KEYS: [number, number][] = [
  [0, 7],
  [7.5, -3],
  [15, -13],
  [22.5, -21],
  [28, -25],
  [30, -26.5],
  [33, -43],
  [37.5, -50],
  [45, -52.5],
];

export const camZ = (t: number) =>
  interpolate(
    t,
    KEYS.map((k) => k[0]),
    KEYS.map((k) => k[1]),
    {easing: Easing.inOut(Easing.sin), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

// the tunnel's centre line (objects & camera follow it)
export const pathX = (z: number) => Math.sin(z * 0.11) * 2.4;
export const pathY = (z: number) => Math.cos(z * 0.083) * 1.3;

export const camFov = (t: number) =>
  interpolate(t, [0, 29.9, 30.1, 31.2, 33.5, 37.5], [52, 52, 92, 70, 58, 46], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
