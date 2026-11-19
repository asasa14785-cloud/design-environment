import React from 'react';
import {Composition} from 'remotion';
import {DeepSeekAd} from './DeepSeekAd';
import {Lab} from './Lab';
import {DURATION, FPS} from './lib/timing';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="DeepSeekAd" component={DeepSeekAd} width={1920} height={1080} fps={FPS} durationInFrames={DURATION} />
    <Composition id="Lab" component={Lab} width={960} height={540} fps={FPS} durationInFrames={180} />
  </>
);
