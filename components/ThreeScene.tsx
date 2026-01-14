
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Voxel } from '../types';
import { BLOCK_COLORS } from '../constants';

interface ThreeSceneProps {
  voxels: Voxel[];
  dimensions: { width: number, height: number, depth: number };
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ voxels, dimensions }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvas2DRef = useRef<HTMLCanvasElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [use2DMode, setUse2DMode] = useState(false);
  const frameIdRef = useRef<number | null>(null);

  // --- 2D BLUEPRINT ENGINE ---
  // This serves as the primary view when WebGL is blocked or unsupported
  useEffect(() => {
    if (use2DMode && canvas2DRef.current && voxels.length > 0) {
      const canvas = canvas2DRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let rotation = 0;
      
      const render2D = () => {
        const w = canvas.width;
        const h = canvas.height;
        
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        // Grid lines for "Blueprint" aesthetic
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
        ctx.lineWidth = 1;
        for (let i = 0; i < w; i += 40) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
        }
        for (let i = 0; i < h; i += 40) {
          ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
        }

        let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
        voxels.forEach(v => {
          minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
          minZ = Math.min(minZ, v.z); maxZ = Math.max(maxZ, v.z);
        });

        const centerX = (minX + maxX) / 2;
        const centerZ = (minZ + maxZ) / 2;
        const baseScale = Math.min(w, h) / (Math.max(maxX - minX, maxZ - minZ) + 15) * 0.7;

        ctx.save();
        ctx.translate(w / 2, h / 2);
        
        // Sort voxels for depth (Painter's Algorithm)
        // We calculate a 'depth' based on the current rotation
        const sorted = [...voxels].sort((a, b) => {
          if (a.y !== b.y) return a.y - b.y;
          const depthA = a.x * Math.sin(rotation) + a.z * Math.cos(rotation);
          const depthB = b.x * Math.sin(rotation) + b.z * Math.cos(rotation);
          return depthA - depthB;
        });

        sorted.forEach(v => {
          // Simple Isometric projection
          const rotX = (v.x - centerX) * Math.cos(rotation) - (v.z - centerZ) * Math.sin(rotation);
          const rotZ = (v.x - centerX) * Math.sin(rotation) + (v.z - centerZ) * Math.cos(rotation);
          
          const screenX = rotX * baseScale;
          const screenY = (rotZ * 0.5 - v.y * 0.8) * baseScale;
          
          const size = baseScale * 0.9;
          
          ctx.fillStyle = v.color || '#cccccc';
          ctx.beginPath();
          ctx.rect(screenX - size/2, screenY - size/2, size, size);
          ctx.fill();
          
          // Outline
          ctx.strokeStyle = 'rgba(0,0,0,0.1)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        });

        ctx.restore();
      };

      const handleResize = () => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        render2D();
      };

      window.addEventListener('resize', handleResize);
      handleResize();
      
      let animId: number;
      const animate = () => {
        rotation += 0.01;
        render2D();
        animId = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animId);
      };
    }
  }, [use2DMode, voxels]);

  // --- 3D RENDERER ---
  useEffect(() => {
    if (!containerRef.current || voxels.length === 0) {
      setIsInitializing(false);
      return;
    }

    setIsInitializing(true);
    setUse2DMode(false);

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let controls: OrbitControls;

    const startThreeJS = () => {
      try {
        const testCanvas = document.createElement('canvas');
        const gl = testCanvas.getContext('webgl', { failIfMajorPerformanceCaveat: false }) || 
                   testCanvas.getContext('experimental-webgl');
        
        if (!gl) throw new Error("WebGL Context Creation Denied");

        const width = containerRef.current!.clientWidth;
        const height = containerRef.current!.clientHeight;

        renderer = new THREE.WebGLRenderer({ 
          antialias: false, 
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        containerRef.current!.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f172a);
        
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
        
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        const box = new THREE.Box3();
        voxels.forEach(v => box.expandByPoint(new THREE.Vector3(v.x, v.y, v.z)));
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z, 10);
        
        camera.position.set(center.x + maxDim * 2, center.y + maxDim * 1.5, center.z + maxDim * 2);
        controls.target.copy(center);
        controls.update();

        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(50, 100, 50);
        scene.add(dirLight);

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const groups: Record<string, Voxel[]> = {};
        voxels.forEach(v => {
          const id = v.blockId || 'minecraft:stone';
          if (!groups[id]) groups[id] = [];
          groups[id].push(v);
        });

        Object.entries(groups).forEach(([blockId, blockVoxels]) => {
          const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(BLOCK_COLORS[blockId] || '#cccccc'),
            roughness: 0.9
          });
          const im = new THREE.InstancedMesh(geometry, material, blockVoxels.length);
          const dummy = new THREE.Object3D();
          blockVoxels.forEach((v, i) => {
            dummy.position.set(v.x, v.y, v.z);
            dummy.updateMatrix();
            im.setMatrixAt(i, dummy.matrix);
          });
          scene.add(im);
        });

        const animate = () => {
          frameIdRef.current = requestAnimationFrame(animate);
          controls.update();
          renderer!.render(scene, camera);
        };
        animate();
        setIsInitializing(false);
      } catch (e) {
        console.error("WebGL Fail, enabling Blueprint Mode:", e);
        setUse2DMode(true);
        setIsInitializing(false);
      }
    };

    const timer = setTimeout(startThreeJS, 100);

    return () => {
      clearTimeout(timer);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        if (renderer.domElement && containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
        }
      }
    };
  }, [voxels]);

  return (
    <div className="w-full h-full relative bg-slate-900 overflow-hidden rounded-3xl border border-slate-800">
      <div ref={containerRef} className={`w-full h-full ${use2DMode ? 'hidden' : 'block'}`} />
      
      {use2DMode && (
        <canvas ref={canvas2DRef} className="w-full h-full block" />
      )}

      {isInitializing && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em] animate-pulse">Initializing Voxel Engine</p>
        </div>
      )}

      {use2DMode && !isInitializing && (
        <div className="absolute top-6 left-6 flex items-center gap-2 bg-slate-950/80 border border-emerald-500/20 px-4 py-2 rounded-full backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Blueprint Mode Active</span>
        </div>
      )}

      {(!voxels || voxels.length === 0) && !isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center opacity-30">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Model Generation Required</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeScene;
