import React, {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig, random} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {camZ, pathX, pathY, camFov} from './lib/camera';
import {BEAT} from './lib/timing';

const Env: React.FC = () => {
  const {gl, scene} = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.background = new THREE.Color('#04060f');
    scene.fog = new THREE.FogExp2('#04060f', 0.028);
  }, [gl, scene]);
  return null;
};

const glassMat = (color: string, opacity = 0.32) =>
  new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.05,
    roughness: 0.04,
    transparent: true,
    opacity,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 2.6,
    side: THREE.DoubleSide,
    iridescence: 0.8,
    iridescenceIOR: 1.4,
    emissive: new THREE.Color('#2b49d6'),
    emissiveIntensity: 0.55,
  });

const Rig: React.FC<{t: number}> = ({t}) => {
  const {camera} = useThree();
  const z = camZ(t);
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(pathX(z) + Math.sin(t * 0.7) * 0.35, pathY(z) + Math.cos(t * 0.5) * 0.2, z);
  cam.up.set(Math.sin(t * 0.35) * 0.08, 1, 0);
  cam.lookAt(pathX(z - 12), pathY(z - 12), z - 12);
  cam.fov = camFov(t);
  cam.updateProjectionMatrix();
  return null;
};

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const beatPhase = t >= 7.5 && t < 37.5 ? (t % BEAT) / BEAT : 1;
  const pulse = Math.exp(-beatPhase * 5) * (t >= 15 ? 1 : 0.5);

  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({color: '#6aa0ff', toneMapped: false}), []);
  const ringMat2 = useMemo(() => new THREE.MeshBasicMaterial({color: '#9b7bff', toneMapped: false}), []);
  const paneMat = useMemo(() => glassMat('#5a7dff', 0.15), []);
  const crystalMat = useMemo(() => glassMat('#a9c4ff', 0.4), []);
  const heroMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#5f7dff',
        metalness: 0.15,
        roughness: 0.05,
        transparent: true,
        opacity: 0.5,
        clearcoat: 1,
        envMapIntensity: 1.7,
        iridescence: 1,
        iridescenceIOR: 1.6,
        emissive: new THREE.Color('#3555f0'),
        emissiveIntensity: 0.4,
        flatShading: true,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const coreMat = useMemo(() => new THREE.MeshBasicMaterial({color: '#cfe0ff', toneMapped: false}), []);
  const edgeMat = useMemo(() => new THREE.LineBasicMaterial({color: '#8fd0ff', transparent: true, opacity: 0.55, toneMapped: false}), []);

  const rings = useMemo(
    () =>
      Array.from({length: 16}, (_, i) => {
        const z = -4 - i * 5.6;
        return {z, r: 4.6 + random('r' + i) * 3, tube: 0.025 + random('t' + i) * 0.03, spin: (random('s' + i) - 0.5) * 0.5, alt: i % 3 === 0};
      }),
    [],
  );
  const panes = useMemo(
    () =>
      Array.from({length: 22}, (_, i) => {
        const z = -2 - i * 3.9;
        const side = i % 2 ? 1 : -1;
        const w = 2.4 + random('pw' + i) * 2.6;
        const h = 1.4 + random('ph' + i) * 1.8;
        return {
          edges: new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, 0.05)),
          z,
          x: pathX(z) + side * (2.2 + random('px' + i) * 3),
          y: pathY(z) + (random('py' + i) - 0.5) * 4.2,
          w,
          h,
          ry: side * (0.5 + random('pr' + i) * 0.7),
          rx: (random('prx' + i) - 0.5) * 0.5,
          drift: (random('pd' + i) - 0.5) * 0.4,
        };
      }),
    [],
  );
  const crystals = useMemo(
    () =>
      Array.from({length: 70}, (_, i) => {
        const z = 2 - i * 0.95;
        const a = random('ca' + i) * Math.PI * 2;
        const rad = 1.5 + random('cr' + i) * 5.5;
        return {
          z,
          x: pathX(z) + Math.cos(a) * rad,
          y: pathY(z) + Math.sin(a) * rad * 0.7,
          s: 0.12 + random('cs' + i) * 0.38,
          sp: 0.2 + random('cp' + i) * 0.8,
          kind: i % 3,
        };
      }),
    [],
  );
  const dust = useMemo(() => {
    const n = 1600;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const z = 8 - random('dz' + i) * 75;
      const a = random('da' + i) * Math.PI * 2;
      const rad = 0.8 + random('dr' + i) * 7;
      pos[i * 3] = pathX(z) + Math.cos(a) * rad;
      pos[i * 3 + 1] = pathY(z) + Math.sin(a) * rad * 0.8;
      pos[i * 3 + 2] = z;
    }
    return pos;
  }, []);

  const hero1Z = -31;
  const hero2Z = -63;

  return (
    <>
      <Env />
      <Rig t={t} />
      <ambientLight intensity={0.35} />
      <pointLight position={[pathX(camZ(t)) + 3, 3, camZ(t) - 4]} intensity={90} color="#4d6bfe" distance={30} />
      <pointLight position={[pathX(camZ(t)) - 4, -2, camZ(t) - 8]} intensity={70} color="#b06bff" distance={30} />
      <pointLight position={[0, 4, camZ(t) - 2]} intensity={30} color="#6be3ff" distance={25} />

      {rings.map((r, i) => (
        <mesh
          key={'ring' + i}
          position={[pathX(r.z), pathY(r.z), r.z]}
          rotation={[0, 0, t * r.spin + i]}
          scale={1 + pulse * 0.05}
          material={r.alt ? ringMat2 : ringMat}
        >
          <torusGeometry args={[r.r, r.tube * (1 + pulse * 1.6), 8, 96]} />
        </mesh>
      ))}

      {panes.map((p, i) => (
        <mesh
          key={'pane' + i}
          position={[p.x, p.y + Math.sin(t * 0.6 + i) * 0.15, p.z]}
          rotation={[p.rx, p.ry + t * p.drift * 0.4, 0]}
          material={paneMat}
        >
          <boxGeometry args={[p.w, p.h, 0.05]} />
          <lineSegments geometry={p.edges} material={edgeMat} />
        </mesh>
      ))}

      {crystals.map((c, i) => (
        <mesh
          key={'c' + i}
          position={[c.x, c.y + Math.sin(t * c.sp + i) * 0.2, c.z]}
          rotation={[t * c.sp, t * c.sp * 0.7 + i, 0]}
          scale={c.s * (1 + pulse * 0.25)}
          material={crystalMat}
        >
          {c.kind === 0 ? <octahedronGeometry args={[1, 0]} /> : c.kind === 1 ? <tetrahedronGeometry args={[1, 0]} /> : <icosahedronGeometry args={[1, 0]} />}
        </mesh>
      ))}

      {/* Hero crystal #1 – seen during the 3D reveal */}
      <group position={[pathX(hero1Z) + 4.6, pathY(hero1Z) - 0.2, hero1Z]} rotation={[t * 0.25, t * 0.4, 0.3]} scale={3.2 + pulse * 0.15}>
        <mesh material={heroMat}>
          <icosahedronGeometry args={[1, 0]} />
        </mesh>
        <mesh scale={0.2} material={coreMat}>
          <icosahedronGeometry args={[1, 1]} />
        </mesh>
        <mesh scale={1.55}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#6aa0ff" wireframe transparent opacity={0.28} toneMapped={false} />
        </mesh>
      </group>

      {/* Hero crystal #2 – finale */}
      <group position={[pathX(hero2Z), pathY(hero2Z), hero2Z]} rotation={[t * 0.15, t * 0.3, 0]} scale={4.2}>
        <mesh material={heroMat}>
          <octahedronGeometry args={[1, 0]} />
        </mesh>
        <mesh scale={0.18} material={coreMat}>
          <icosahedronGeometry args={[1, 1]} />
        </mesh>
        <mesh scale={1.35}>
          <octahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#9b7bff" wireframe transparent opacity={0.22} toneMapped={false} />
        </mesh>
      </group>

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#cfe0ff" size={0.045} sizeAttenuation transparent opacity={0.75} depthWrite={false} />
      </points>
    </>
  );
};

export const World3D: React.FC<{width: number; height: number}> = ({width, height}) => (
  <ThreeCanvas width={width} height={height} camera={{fov: 52, position: [0, 0, 7], near: 0.1, far: 120}} gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15}}>
    <Scene />
  </ThreeCanvas>
);
