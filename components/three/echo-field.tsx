"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * A field of points rippling outward from the centre — the brand name rendered
 * as a physical phenomenon. All displacement happens in the vertex shader, so
 * the CPU only ever updates two uniforms per frame.
 */

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform vec2  uPointer;
  uniform float uIntensity;

  attribute float aSeed;

  varying float vGlow;
  varying float vFade;

  void main() {
    vec3 pos = position;
    float dist = length(pos.xz);

    // Primary echo pulse travelling outward, plus a finer second harmonic.
    float pulse   = sin(dist * 1.9 - uTime * 1.25) * 0.34;
    float harmony = sin(dist * 4.6 - uTime * 2.05) * 0.09;

    // A softer ripple that follows the cursor and decays with distance.
    vec2  pointer = uPointer * 7.0;
    float pDist   = length(pos.xz - pointer);
    float pRipple = sin(pDist * 2.6 - uTime * 2.6) * 0.30 * exp(-pDist * 0.30);

    float lift = (pulse + harmony + pRipple) * uIntensity;
    pos.y += lift;

    // Breathe the seed in so the grid never reads as a perfect lattice.
    pos.y += sin(uTime * 0.5 + aSeed * 6.28) * 0.02;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // Crests glow; troughs recede.
    vGlow = smoothstep(-0.15, 0.42, lift);
    // Fade the far edge of the field into the background.
    vFade = 1.0 - smoothstep(6.0, 15.0, dist);

    gl_PointSize = (2.4 + vGlow * 3.4) * (14.0 / -mv.z);
  }
`;

const FRAGMENT = /* glsl */ `
  precision mediump float;

  uniform vec3 uBase;
  uniform vec3 uAccent;

  varying float vGlow;
  varying float vFade;

  void main() {
    // Round the square point sprite into a soft disc.
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.1, d);

    vec3 color = mix(uBase, uAccent, vGlow);
    gl_FragColor = vec4(color, alpha * vFade * (0.18 + vGlow * 0.82));
  }
`;

function WaveField({ reduced }: { reduced: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef(new THREE.Vector2(0, 0));

  const { positions, seeds, count } = useMemo(() => {
    const SIZE = 30; // grid resolution per axis
    const SPREAD = 15;
    const total = SIZE * SIZE;
    const positions = new Float32Array(total * 3);
    const seeds = new Float32Array(total);

    let i = 0;
    for (let x = 0; x < SIZE; x++) {
      for (let z = 0; z < SIZE; z++) {
        const px = (x / (SIZE - 1) - 0.5) * SPREAD * 2;
        const pz = (z / (SIZE - 1) - 0.5) * SPREAD * 2;
        positions[i * 3] = px;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = pz;
        seeds[i] = Math.random();
        i++;
      }
    }
    return { positions, seeds, count: total };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: 1 },
      uBase: { value: new THREE.Color("#303030") },
      uAccent: { value: new THREE.Color("#5b7cff") },
    }),
    []
  );

  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    // Frozen but still rendered: the field reads as a still image.
    if (!reduced) mat.uniforms.uTime.value += delta;

    // Ease the pointer so the ripple trails the cursor instead of snapping.
    pointer.current.lerp(state.pointer, 0.045);
    mat.uniforms.uPointer.value.copy(pointer.current);
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-aSeed"
          args={[seeds, 1]}
          count={count}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function EchoField({ className }: { className?: string }) {
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Stop rendering entirely once the hero scrolls away — no wasted GPU.
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 4.2, 11], fov: 42 }}
        dpr={[1, 1.75]}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none" }}
      >
        <WaveField reduced={reduced} />
      </Canvas>
    </div>
  );
}
