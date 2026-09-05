"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const RIBBON_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uFreq;
  uniform float uAmp;
  uniform float uPhase;
  uniform vec2  uMouse;

  varying vec2  vUv;
  varying float vWave;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Harmonic wave calculation across the width
    float t = uTime * uSpeed + uPhase;
    float w1 = sin(pos.x * uFreq + t) * uAmp;
    float w2 = sin(pos.x * (uFreq * 1.7) - t * 0.7) * (uAmp * 0.35);
    float w3 = sin(pos.x * 0.45 + t * 1.2) * (uAmp * 0.15);

    // Interactive mouse displacement ripple
    float dx = pos.x - uMouse.x * 12.0;
    float dist = abs(dx);
    float mouseRipple = sin(dist * 0.6 - uTime * 2.5) * exp(-dist * 0.22) * 0.8 * uMouse.y;

    // Taper at extreme edges so ribbon seamlessly blends into darkness
    float normX = abs(pos.x) / 18.0;
    float taper = clamp(1.0 - normX * normX, 0.0, 1.0);

    float lift = (w1 + w2 + w3 + mouseRipple) * taper;
    pos.y += lift;
    vWave = lift;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const RIBBON_FRAGMENT = /* glsl */ `
  precision mediump float;

  uniform vec3  uColor1;
  uniform vec3  uColor2;
  uniform float uOpacity;

  varying vec2  vUv;
  varying float vWave;

  void main() {
    // Soft glowing core with feathered transparent edges
    float distFromCore = abs(vUv.y - 0.5) * 2.0;
    float core = pow(1.0 - distFromCore, 2.8);

    // Horizontal falloff at screen margins
    float edgeX = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);

    // Dynamic gradient color
    vec3 col = mix(uColor1, uColor2, vUv.x);

    // Highlights on wave crests
    float crest = smoothstep(0.4, 1.2, abs(vWave)) * 0.3;
    col += vec3(crest * 0.5, crest * 0.7, crest * 1.0);

    float alpha = core * edgeX * uOpacity;
    gl_FragColor = vec4(col, alpha);
  }
`;

export default function EchoResonance({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    let isDisposed = false;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
    camera.position.set(0, -0.3, 15);

    // 2. WebGL Renderer with Alpha & Antialiasing
    const renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const dom = renderer.domElement;
    dom.style.position = "absolute";
    dom.style.inset = "0";
    dom.style.width = "100%";
    dom.style.height = "100%";
    dom.style.pointerEvents = "none";
    container.appendChild(dom);

    // 3. Resize Handling
    let w = container.clientWidth || window.innerWidth || 1200;
    let h = container.clientHeight || window.innerHeight || 800;

    const resize = () => {
      if (!container || isDisposed) return;
      const rect = container.getBoundingClientRect();
      w = rect.width || window.innerWidth || 1200;
      h = rect.height || window.innerHeight || 800;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    resize();
    const resizeObs = new ResizeObserver(() => resize());
    resizeObs.observe(container);

    // 4. Mouse Tracking & Smooth Lerp
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
      mouse.targetX = (clientX / w) * 2 - 1;
      mouse.targetY = -(clientY / h) * 2 + 1;
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });

    // 5. 6 Airy, Ethereal 3D Wave Ribbons
    // Designed to be light, graceful, and never heavy or overwhelming
    const ribbonsData = [
      {
        baseY: -1.2,
        z: 2.8,
        width: 36,
        height: 1.6,
        speed: 0.7,
        freq: 0.22,
        amp: 1.1,
        phase: 0.0,
        c1: new THREE.Color("#38bdf8"), // Electric Cyan
        c2: new THREE.Color("#6366f1"), // Royal Blue
        opacity: 0.38,
      },
      {
        baseY: -0.4,
        z: 1.2,
        width: 36,
        height: 1.8,
        speed: -0.6,
        freq: 0.18,
        amp: 1.3,
        phase: 1.9,
        c1: new THREE.Color("#6366f1"), // Royal Blue
        c2: new THREE.Color("#a855f7"), // Radiant Purple
        opacity: 0.34,
      },
      {
        baseY: 0.5,
        z: -0.5,
        width: 36,
        height: 1.5,
        speed: 0.8,
        freq: 0.24,
        amp: 1.0,
        phase: 3.4,
        c1: new THREE.Color("#0ea5e9"), // Sky Blue
        c2: new THREE.Color("#818cf8"), // Indigo
        opacity: 0.30,
      },
      {
        baseY: -1.8,
        z: -2.0,
        width: 36,
        height: 2.2,
        speed: -0.5,
        freq: 0.15,
        amp: 1.45,
        phase: 4.8,
        c1: new THREE.Color("#a855f7"), // Violet
        c2: new THREE.Color("#38bdf8"), // Cyan
        opacity: 0.25,
      },
      {
        baseY: 1.2,
        z: -3.5,
        width: 36,
        height: 1.4,
        speed: 0.9,
        freq: 0.28,
        amp: 0.9,
        phase: 2.2,
        c1: new THREE.Color("#c084fc"), // Lavender
        c2: new THREE.Color("#60a5fa"), // Light Blue
        opacity: 0.22,
      },
      {
        baseY: -2.6,
        z: -5.0,
        width: 36,
        height: 2.5,
        speed: 0.4,
        freq: 0.13,
        amp: 1.6,
        phase: 5.7,
        c1: new THREE.Color("#3b82f6"), // Blue
        c2: new THREE.Color("#8b5cf6"), // Deep Violet
        opacity: 0.18,
      },
    ];

    const ribbonMeshes: {
      mesh: THREE.Mesh;
      mat: THREE.ShaderMaterial;
    }[] = [];

    ribbonsData.forEach((data) => {
      // 120 segments along length, 2 across height
      const geom = new THREE.PlaneGeometry(data.width, data.height, 120, 2);
      geom.translate(0, data.baseY, data.z);

      const mat = new THREE.ShaderMaterial({
        vertexShader: RIBBON_VERTEX,
        fragmentShader: RIBBON_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uSpeed: { value: data.speed },
          uFreq: { value: data.freq },
          uAmp: { value: data.amp },
          uPhase: { value: data.phase },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uColor1: { value: data.c1 },
          uColor2: { value: data.c2 },
          uOpacity: { value: data.opacity },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geom, mat);
      scene.add(mesh);
      ribbonMeshes.push({ mesh, mat });
    });

    // 6. Subtle Floating Starlight Particles (Echo Embers)
    const PARTICLE_COUNT = 40;
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleSpeeds = new Float32Array(PARTICLE_COUNT * 2);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 32;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 14;

      particleSpeeds[i * 2] = Math.random() * 0.4 + 0.2; // vertical float speed
      particleSpeeds[i * 2 + 1] = Math.random() * Math.PI * 2; // phase
    }

    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    // Soft round particle texture
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 15);
      grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
      grad.addColorStop(0.3, "rgba(99, 140, 255, 0.7)");
      grad.addColorStop(0.7, "rgba(56, 189, 248, 0.2)");
      grad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.32,
      map: particleTexture,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // 7. Animation Loop with Zero THREE.Clock Deprecations
    let lastTime = performance.now();
    let totalTime = 0;

    const render = (now: number) => {
      if (isDisposed) return;

      const delta = Math.min((now - lastTime) * 0.001, 0.1);
      lastTime = now;
      totalTime += delta;

      // Mouse easing
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Subtle 3D camera parallax
      camera.position.x = mouse.x * 1.2;
      camera.position.y = -0.3 + mouse.y * 0.8;
      camera.lookAt(0, 0, 0);

      // Update ribbons uniforms
      const mouseVec = new THREE.Vector2(mouse.x, mouse.y);
      for (let i = 0; i < ribbonMeshes.length; i++) {
        const u = ribbonMeshes[i].mat.uniforms;
        u.uTime.value = totalTime;
        u.uMouse.value = mouseVec;
      }

      // Update particles
      const pArr = particleGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 3;
        const phase = particleSpeeds[i * 2 + 1];

        pArr[idx + 1] += Math.sin(totalTime * 0.7 + phase) * 0.005;
        pArr[idx] += Math.cos(totalTime * 0.4 + phase) * 0.003;

        if (pArr[idx + 1] > 6) pArr[idx + 1] = -6;
        if (pArr[idx + 1] < -6) pArr[idx + 1] = 6;
      }
      particleGeom.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // 8. Cleanup
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("touchmove", onPointerMove);
      resizeObs.disconnect();

      ribbonMeshes.forEach(({ mesh, mat }) => {
        mesh.geometry.dispose();
        mat.dispose();
      });

      particleGeom.dispose();
      particleMat.dispose();
      particleTexture.dispose();

      renderer.dispose();
      if (dom.parentNode) {
        dom.parentNode.removeChild(dom);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 select-none overflow-hidden ${className || ""}`}
      aria-hidden="true"
    />
  );
}
