import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';

const Playground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeOfDay, setTimeOfDay] = useState(12); // 0-24
  
  // Refs for scene objects to update in loop without re-renders
  const sceneObjects = useRef<{
    sunLight?: THREE.DirectionalLight;
    ambientLight?: THREE.AmbientLight;
    water?: Water;
    skyColor?: THREE.Color;
    mesh?: THREE.Mesh;
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
  }>({});

  useEffect(() => {
    if (!containerRef.current) return;

    // --- SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xaaccff, 0.005);
    sceneObjects.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(30, 30, 100);
    sceneObjects.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Enable dithering for smoother gradients (fits the 'dithered' request in a high-fidelity way)
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    sceneObjects.current.renderer = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.minDistance = 40.0;
    controls.maxDistance = 200.0;

    // --- WATER ---
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/water/Water_1_M_Normal.jpg', function ( texture ) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: scene.fog !== undefined
      }
    );
    water.rotation.x = - Math.PI / 2;
    water.material.uniforms['size'].value = 4; // Wave size
    scene.add(water);
    sceneObjects.current.water = water;

    // --- WEIRD SHAPE (Metallic Mobius/Torus Knot) ---
    const geometry = new THREE.TorusKnotGeometry(10, 3, 150, 20, 2, 3);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xaaaaaa,
      metalness: 1.0,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      dithering: true
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 15;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    sceneObjects.current.mesh = mesh;

    // --- LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    sceneObjects.current.ambientLight = ambientLight;

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(100, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    scene.add(sunLight);
    sceneObjects.current.sunLight = sunLight;

    // --- ANIMATION LOOP ---
    let animateId: number;
    const animate = () => {
      animateId = requestAnimationFrame(animate);

      // Rotate shape
      const time = performance.now() * 0.001;
      mesh.rotation.x = Math.sin(time * 0.5) * 0.2;
      mesh.rotation.y = time * 0.2;
      mesh.position.y = 15 + Math.sin(time) * 2; // Floating

      // Animate water
      water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      cancelAnimationFrame(animateId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Environment based on Time Slider
  useEffect(() => {
    const { sunLight, ambientLight, scene, water, mesh } = sceneObjects.current;
    if (!sunLight || !scene || !water || !ambientLight) return;

    // Calculate sun position based on 0-24 hour
    // 6am = rise, 12pm = top, 6pm = set
    // Map time to angle. 12 = 90deg (overhead). 
    // angle = (time - 6) * (180 / 12) ?
    // Let's do simple orbital.
    
    const angle = ((timeOfDay - 6) / 24) * Math.PI * 2; 
    const radius = 200;
    const y = Math.sin(angle) * radius;
    const x = Math.cos(angle) * radius;
    const z = 50; // keep slight offset

    sunLight.position.set(x, y, z);
    
    // Update Water sun direction
    water.material.uniforms['sunDirection'].value.copy(sunLight.position).normalize();

    // Day/Night Colors
    const isDay = y > 0;
    const intensity = Math.max(0.1, Math.min(1, y / 100)); // fade light at horizon
    
    sunLight.intensity = isDay ? 1.5 * intensity : 0; // Turn off sun at night
    
    // Night setup (Moon-ish ambient)
    if (!isDay) {
       ambientLight.intensity = 0.8; // Bright moonlit night
       ambientLight.color.setHex(0x111122);
       scene.fog!.color.setHex(0x050510);
       scene.background = new THREE.Color(0x050510);
    } else {
       // Day gradient simulation (simple)
       ambientLight.intensity = 0.4;
       ambientLight.color.setHex(0xffffff);
       // Sky color
       const skyColor = new THREE.Color().setHSL(0.6, 0.5, 0.5 + intensity * 0.4);
       scene.fog!.color.copy(skyColor);
       scene.background = skyColor;
    }

  }, [timeOfDay]);


  return (
    <div className="fixed inset-0 z-0 bg-black animate-in">
      {/* 3D Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* UI Overlay */}
      <div className="absolute bottom-12 left-0 w-full flex flex-col items-center justify-center pointer-events-none px-6">
         <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 pointer-events-auto flex items-center gap-4 w-full max-w-md shadow-2xl">
            <span className="font-sans text-[10px] uppercase tracking-widest text-white w-12 text-right">
              {timeOfDay < 6 || timeOfDay > 20 ? 'Night' : 'Day'}
            </span>
            <input 
              type="range" 
              min="0" 
              max="24" 
              step="0.1" 
              value={timeOfDay} 
              onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
            />
            <span className="font-sans text-[10px] uppercase tabular-nums tracking-widest text-white w-12">
              {Math.floor(timeOfDay).toString().padStart(2, '0')}:00
            </span>
         </div>
      </div>
      
      {/* Overlay Title */}
       <div className="absolute top-32 left-6 md:left-12 pointer-events-none opacity-50 mix-blend-difference text-white">
          <h1 className="font-sans text-xs uppercase tracking-widest">( Playground )</h1>
          <p className="font-sans text-[10px] mt-2 max-w-[200px] leading-relaxed">
             Experimental WebGL sandbox. <br/>
             Three.js r182 (compatible). <br/>
             Drag to rotate. Toggle time.
          </p>
       </div>
    </div>
  );
};

export default Playground;
