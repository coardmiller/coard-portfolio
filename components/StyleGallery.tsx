import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { looks } from '../data/looks';

const formatCount = (n: number) => n.toString().padStart(2, '0');

const supportsWebGL = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

const loadTexture = (src: string, anisotropy: number): Promise<THREE.Texture> =>
  new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      src,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = anisotropy;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        resolve(texture);
      },
      undefined,
      reject
    );
  });

const StyleGallery: React.FC<{ animationClass: string }> = ({ animationClass }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [use3d, setUse3d] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !supportsWebGL()) {
      setUse3d(false);
      setReady(true);
      return;
    }

    const mount = mountRef.current;
    if (!mount) return;

    let cancelled = false;
    let frame = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    const disposables: Array<{ dispose: () => void }> = [];

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
    camera.position.set(0, 0.12, 7.4);

    const cards: THREE.Mesh[] = [];
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let dragging = false;
    let lastX = 0;
    let velocity = 0;
    let current = 0;
    let lastReported = 0;

    const onResize = () => {
      if (!renderer || !mount) return;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const layout = (i: number, t: number) => {
      const d = i - t;
      const ad = Math.abs(d);
      const slot = 3.15;
      return {
        x: d * slot * (0.62 + Math.min(ad, 3) * 0.06),
        y: ad < 0.8 ? (0.8 - ad) * 0.18 : 0,
        z: -ad * 1.35,
        rotY: -Math.sign(d || 1) * Math.min(ad, 1.8) * 0.38,
        rotX: -0.04 - Math.min(ad, 2) * 0.02,
      };
    };

    const goTo = (value: number, snap = false) => {
      const max = looks.length - 1;
      const next = THREE.MathUtils.clamp(value, 0, max);
      targetRef.current = snap ? Math.round(next) : next;
    };

    let cleanupExtras: () => void = () => undefined;
    let wheelSnap: ReturnType<typeof setTimeout> | undefined;

    const init = async () => {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.touchAction = 'none';
      renderer.domElement.style.cursor = 'grab';

      onResize();

      const anisotropy = renderer.capabilities.getMaxAnisotropy();
      const textures = await Promise.all(looks.map((look) => loadTexture(look.src, anisotropy)));
      if (cancelled) {
        textures.forEach((texture) => texture.dispose());
        renderer.dispose();
        renderer = null;
        return;
      }

      mount.appendChild(renderer.domElement);
      onResize();

      const paper = new THREE.MeshBasicMaterial({ color: 0xe6ddd0 });
      disposables.push(paper);

      textures.forEach((texture, i) => {
        disposables.push(texture);
        const image = texture.image as HTMLImageElement;
        const aspect = image.width / image.height;
        const height = 3.15;
        const width = height * aspect;
        const geo = new THREE.BoxGeometry(width, height, 0.035);
        disposables.push(geo);
        const front = new THREE.MeshBasicMaterial({ map: texture });
        const back = new THREE.MeshBasicMaterial({ color: 0xf3eee6 });
        disposables.push(front, back);
        const mesh = new THREE.Mesh(geo, [paper, paper, paper, paper, front, back]);
        mesh.userData.index = i;
        const pose = layout(i, 0);
        mesh.position.set(pose.x, pose.y, pose.z);
        mesh.rotation.set(pose.rotX, pose.rotY, 0);
        scene.add(mesh);
        cards.push(mesh);
      });

      const reportIndex = (value: number) => {
        const snapped = THREE.MathUtils.clamp(Math.round(value), 0, looks.length - 1);
        if (snapped !== lastReported) {
          lastReported = snapped;
          setIndex(snapped);
        }
      };

      const animate = () => {
        frame = requestAnimationFrame(animate);
        if (!renderer) return;

        const target = targetRef.current;
        current += (target - current) * 0.12;

        pointer.x += (pointer.targetX - pointer.x) * 0.08;
        pointer.y += (pointer.targetY - pointer.y) * 0.08;

        const time = performance.now() * 0.001;
        cards.forEach((card, i) => {
          const pose = layout(i, current);
          const lift = i === Math.round(current) ? Math.sin(time * 0.7) * 0.015 : 0;
          card.position.x += (pose.x - card.position.x) * 0.16;
          card.position.y += (pose.y + lift - card.position.y) * 0.16;
          card.position.z += (pose.z - card.position.z) * 0.16;
          card.rotation.x += (pose.rotX + pointer.y * 0.08 - card.rotation.x) * 0.16;
          card.rotation.y += (pose.rotY + pointer.x * 0.12 - card.rotation.y) * 0.16;
          const dim = THREE.MathUtils.clamp(1 - Math.abs(i - current) * 0.22, 0.55, 1);
          const front = (card.material as THREE.Material[])[4] as THREE.MeshBasicMaterial;
          front.color.setRGB(dim, dim, dim);
        });

        camera.position.x += (pointer.x * 0.28 - camera.position.x) * 0.08;
        camera.position.y += (0.12 + pointer.y * 0.18 - camera.position.y) * 0.08;
        camera.lookAt(0, 0.05, 0);
        renderer.render(scene, camera);
        reportIndex(current);
      };
      animate();
      setReady(true);

      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      let pointerStartX = 0;
      let pointerStartY = 0;

      const toNDC = (event: PointerEvent) => {
        const rect = renderer!.domElement.getBoundingClientRect();
        ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      };

      const onPointerDown = (event: PointerEvent) => {
        dragging = true;
        lastX = event.clientX;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
        velocity = 0;
        renderer!.domElement.style.cursor = 'grabbing';
        renderer!.domElement.setPointerCapture(event.pointerId);
      };

      const onPointerMove = (event: PointerEvent) => {
        const rect = renderer!.domElement.getBoundingClientRect();
        pointer.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        pointer.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        if (!dragging) return;
        const dx = event.clientX - lastX;
        lastX = event.clientX;
        velocity = dx;
        goTo(targetRef.current - dx * 0.0045);
      };

      const onPointerUp = (event: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        renderer!.domElement.style.cursor = 'grab';
        const moved =
          Math.abs(event.clientX - pointerStartX) + Math.abs(event.clientY - pointerStartY);
        if (moved < 8) {
          toNDC(event);
          raycaster.setFromCamera(ndc, camera);
          const hit = raycaster.intersectObjects(cards)[0];
          if (hit) {
            goTo(hit.object.userData.index as number, true);
            return;
          }
        }
        const flick = Math.abs(velocity) > 6 ? -Math.sign(velocity) * 0.7 : 0;
        goTo(targetRef.current + flick, true);
      };

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
        goTo(targetRef.current + delta * 0.0032);
        if (wheelSnap) window.clearTimeout(wheelSnap);
        wheelSnap = setTimeout(() => {
          goTo(targetRef.current, true);
        }, 140);
      };

      const onKey = (event: KeyboardEvent) => {
        if (event.key === 'ArrowRight') goTo(Math.round(targetRef.current) + 1, true);
        if (event.key === 'ArrowLeft') goTo(Math.round(targetRef.current) - 1, true);
      };

      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerup', onPointerUp);
      renderer.domElement.addEventListener('pointercancel', onPointerUp);
      renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('keydown', onKey);
      window.addEventListener('resize', onResize);

      cleanupExtras = () => {
        if (wheelSnap) window.clearTimeout(wheelSnap);
        renderer?.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer?.domElement.removeEventListener('pointermove', onPointerMove);
        renderer?.domElement.removeEventListener('pointerup', onPointerUp);
        renderer?.domElement.removeEventListener('pointercancel', onPointerUp);
        renderer?.domElement.removeEventListener('wheel', onWheel);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('resize', onResize);
      };
    };

    void init().catch(() => {
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentElement === mount) {
          mount.removeChild(renderer.domElement);
        }
        renderer = null;
      }
      if (!cancelled) {
        setUse3d(false);
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      cleanupExtras();
      cards.forEach((card) => scene.remove(card));
      disposables.forEach((item) => item.dispose());
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentElement === mount) {
          mount.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (use3d) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        setIndex((i) => Math.min(looks.length - 1, i + 1));
      }
      if (event.key === 'ArrowLeft') {
        setIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [use3d]);

  const look = looks[index];
  const step = (dir: number) => {
    const next = Math.min(looks.length - 1, Math.max(0, index + dir));
    targetRef.current = next;
    setIndex(next);
  };

  return (
    <main className={`relative z-10 ${animationClass}`}>
      <div className="pt-24 md:pt-28 px-4 md:px-6">
        <div className="flex items-end justify-between gap-6 mb-4 md:mb-6">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500 mb-3">
              Personal looks
            </p>
            <h1 className="text-2xl md:text-4xl font-light leading-[1.15] tracking-tight text-black dark:text-gray-100 max-w-xl">
              English country ivy. Grain, weather, clothes that hold up.
            </h1>
          </div>
          <p className="hidden md:block font-sans text-[10px] uppercase tracking-[0.18em] text-gray-400 dark:text-gray-600 pb-1 text-right">
            Looks {formatCount(looks.length)}
            <span className="block mt-2 opacity-60">Drag or scroll</span>
          </p>
        </div>
      </div>

      <div
        ref={mountRef}
        className="relative w-full h-[min(72vh,760px)] select-none"
        aria-label="Look gallery"
      >
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500">
              Loading looks
            </span>
          </div>
        )}

        {!use3d && ready && (
          <div className="absolute inset-0 flex items-center justify-center px-4 md:px-6">
            <img
              src={look.src}
              alt={look.alt}
              className="max-h-full max-w-full object-contain cursor-ew-resize"
              draggable={false}
              onClick={(event) => {
                const mid = event.currentTarget.getBoundingClientRect().left + event.currentTarget.width / 2;
                step(event.clientX > mid ? 1 : -1);
              }}
            />
          </div>
        )}
      </div>

      <div className="px-4 md:px-6 pt-6 pb-16 flex items-start justify-between gap-6">
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-2">
            {look.date}
          </p>
          <p className="text-sm md:text-base font-light tracking-tight text-black dark:text-gray-100 max-w-md">
            {look.caption}
          </p>
        </div>
        <div className="flex items-center gap-4 font-sans text-[10px] uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500 pt-1">
          <button
            type="button"
            onClick={() => step(-1)}
            className="hover:text-black dark:hover:text-white transition-colors disabled:opacity-20"
            disabled={index === 0}
            aria-label="Previous look"
          >
            Prev
          </button>
          <span className="tabular-nums">
            {formatCount(index + 1)} / {formatCount(looks.length)}
          </span>
          <button
            type="button"
            onClick={() => step(1)}
            className="hover:text-black dark:hover:text-white transition-colors disabled:opacity-20"
            disabled={index === looks.length - 1}
            aria-label="Next look"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
};

export default StyleGallery;
