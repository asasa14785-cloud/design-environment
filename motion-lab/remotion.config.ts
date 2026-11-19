import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
// Software WebGL (no GPU in this sandbox) — required for Three.js rendering
Config.setChromiumOpenGlRenderer('swangle');
Config.setConcurrency(2);
