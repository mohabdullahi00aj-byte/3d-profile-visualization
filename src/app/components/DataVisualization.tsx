import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { PersonData, getNetWorthColor, formatNetWorth } from '@/app/utils/googleSheets';

interface DataVisualizationProps {
  data: PersonData[];
  layout: 'table' | 'sphere' | 'helix' | 'grid';
}

export function DataVisualization({ data, layout }: DataVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<CSS3DRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const objectsRef = useRef<CSS3DObject[]>([]);
  const targetsRef = useRef<{
    table: THREE.Object3D[];
    sphere: THREE.Object3D[];
    helix: THREE.Object3D[];
    grid: THREE.Object3D[];
  }>({
    table: [],
    sphere: [],
    helix: [],
    grid: [],
  });
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [cameraDistance, setCameraDistance] = useState(3000);
  const [isGridLayout, setIsGridLayout] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    
    console.log('Initializing visualization with', data.length, 'items');

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    camera.position.z = 3000;
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create objects for each data item
    const objects: CSS3DObject[] = [];
    const table: THREE.Object3D[] = [];
    const sphere: THREE.Object3D[] = [];
    const helix: THREE.Object3D[] = [];
    const grid: THREE.Object3D[] = [];

    // Take up to 200 items for visualization
    const visualData = data.slice(0, 200);

    visualData.forEach((person, i) => {
      const element = document.createElement('div');
      element.className = 'element';
      element.style.width = '120px';
      element.style.height = '160px';
      element.style.boxShadow = '0px 0px 12px rgba(0,255,255,0.5)';
      element.style.border = '1px solid rgba(127,255,255,0.25)';
      element.style.textAlign = 'center';
      element.style.cursor = 'default';
      element.style.backgroundColor = getNetWorthColor(person.netWorth);

      const number = document.createElement('div');
      number.className = 'number';
      number.textContent = String(i + 1);
      number.style.position = 'absolute';
      number.style.top = '20px';
      number.style.right = '20px';
      number.style.fontSize = '12px';
      number.style.color = 'rgba(255,255,255,0.5)';
      element.appendChild(number);

      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = person.name;
      name.style.position = 'absolute';
      name.style.top = '40px';
      name.style.width = '100%';
      name.style.fontSize = '18px';
      name.style.fontWeight = 'bold';
      name.style.color = 'rgba(255,255,255,0.95)';
      element.appendChild(name);

      const occupation = document.createElement('div');
      occupation.className = 'occupation';
      occupation.textContent = person.occupation;
      occupation.style.position = 'absolute';
      occupation.style.top = '70px';
      occupation.style.width = '100%';
      occupation.style.fontSize = '12px';
      occupation.style.color = 'rgba(255,255,255,0.75)';
      element.appendChild(occupation);

      const age = document.createElement('div');
      age.className = 'age';
      age.textContent = `Age: ${person.age}`;
      age.style.position = 'absolute';
      age.style.top = '95px';
      age.style.width = '100%';
      age.style.fontSize = '11px';
      age.style.color = 'rgba(255,255,255,0.7)';
      element.appendChild(age);

      const netWorth = document.createElement('div');
      netWorth.className = 'net-worth';
      netWorth.textContent = formatNetWorth(person.netWorth);
      netWorth.style.position = 'absolute';
      netWorth.style.bottom = '20px';
      netWorth.style.width = '100%';
      netWorth.style.fontSize = '16px';
      netWorth.style.fontWeight = 'bold';
      netWorth.style.color = 'rgba(255,255,255,1)';
      element.appendChild(netWorth);

      const objectCSS = new CSS3DObject(element);
      objectCSS.position.x = Math.random() * 4000 - 2000;
      objectCSS.position.y = Math.random() * 4000 - 2000;
      objectCSS.position.z = Math.random() * 4000 - 2000;
      scene.add(objectCSS);

      objects.push(objectCSS);

      // Table layout (20x10)
      const tableObject = new THREE.Object3D();
      tableObject.position.x = (i % 20) * 200 - 1900;
      tableObject.position.y = -(Math.floor(i / 20) % 10) * 200 + 900;
      tableObject.position.z = 0;
      table.push(tableObject);

      // Sphere layout
      const phi = Math.acos(-1 + (2 * i) / visualData.length);
      const theta = Math.sqrt(visualData.length * Math.PI) * phi;
      const sphereObject = new THREE.Object3D();
      sphereObject.position.setFromSphericalCoords(800, phi, theta);
      sphere.push(sphereObject);

      // Double Helix layout
      const helixObject = new THREE.Object3D();
      const helixIndex = i % 2; // 0 or 1 for double helix
      const theta2 = i * 0.175 + Math.PI * helixIndex;
      const y = -(i * 8) + 800;
      helixObject.position.setFromCylindricalCoords(400, theta2, y);
      helix.push(helixObject);

      // Grid layout (5x4x10) - FIXED spacing to match Image C
      const gridObject = new THREE.Object3D();
      // Tighter spacing for compact layered appearance
      gridObject.position.x = ((i % 5) - 2) * 250;        // Reduced from 300
      gridObject.position.y = (-(Math.floor(i / 5) % 10) + 4.5) * 220;  // Reduced from 300
      gridObject.position.z = (Math.floor(i / 50) - 2) * 180;  // Much tighter Z spacing
      grid.push(gridObject);
    });

    objectsRef.current = objects;
    targetsRef.current = { table, sphere, helix, grid };

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      render();
    };

    const render = () => {
      if (!cameraRef.current || !rendererRef.current || !sceneRef.current) return;

      if (isGridLayout) {
        // GRID LAYOUT: Fixed camera position - no rotation allowed
        // Matches Image C with angled view and layered appearance
        camera.position.set(1200, 800, 1600);
        camera.lookAt(0, 0, 0);
      } else {
        // OTHER LAYOUTS: Controlled horizontal rotation only
        const horizontalRotation = mouseX * 0.0005; // Very low sensitivity
        const radius = cameraDistance;
        
        // Camera orbits horizontally around the scene center
        camera.position.x = Math.sin(horizontalRotation) * radius;
        camera.position.z = Math.cos(horizontalRotation) * radius;
        
        // Keep camera height FIXED to prevent table tilting
        camera.position.y = 0;
        
        // Always look at scene center for stable perspective
        camera.lookAt(scene.position);
      }
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [data, mouseX, mouseY]);

  // Transform to layout
  useEffect(() => {
    const targets = targetsRef.current[layout];
    const objects = objectsRef.current;

    // Set grid layout flag for camera control
    setIsGridLayout(layout === 'grid');

    // Set optimal camera distance for each layout type
    let optimalDistance;
    switch (layout) {
      case 'table':
        optimalDistance = 3000; // Good distance for table view
        break;
      case 'sphere':
        optimalDistance = 2500; // Closer for sphere
        break;
      case 'helix':
        optimalDistance = 2800; // Good for helix
        break;
      case 'grid':
        optimalDistance = 2000; // Not used for grid (fixed position)
        break;
      default:
        optimalDistance = 3000;
    }
    setCameraDistance(optimalDistance);

    const duration = 2000;
    const startTime = Date.now();

    const initialPositions = objects.map((obj) => ({
      x: obj.position.x,
      y: obj.position.y,
      z: obj.position.z,
    }));

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      objects.forEach((obj, i) => {
        if (targets[i]) {
          obj.position.x = initialPositions[i].x + (targets[i].position.x - initialPositions[i].x) * eased;
          obj.position.y = initialPositions[i].y + (targets[i].position.y - initialPositions[i].y) * eased;
          obj.position.z = initialPositions[i].z + (targets[i].position.z - initialPositions[i].z) * eased;
        }
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [layout]);

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    // Only allow mouse rotation for non-grid layouts
    if (isGridLayout) {
      return; // Grid layout has locked camera - no mouse interaction
    }
    
    // Controlled horizontal rotation only - prevents perspective distortion
    const normalizedX = ((event.clientX / window.innerWidth) - 0.5) * 2;
    
    // Only track horizontal movement, ignore vertical to prevent tilting
    // Clamp rotation to reasonable range (-1 to 1)
    setMouseX(Math.max(-1, Math.min(1, normalizedX)));
    // mouseY is not updated - no vertical rotation
  };

  const handleWheel = (event: React.WheelEvent) => {
    // Smooth zoom control with mouse wheel
    event.preventDefault();
    
    if (isGridLayout) {
      // Grid layout: Allow zoom but with different range
      const zoomSpeed = 50;
      const minDistance = 1000; // Closer for grid
      const maxDistance = 3000; // Not too far for grid
      
      setCameraDistance(prevDistance => {
        const newDistance = prevDistance + (event.deltaY > 0 ? zoomSpeed : -zoomSpeed);
        return Math.max(minDistance, Math.min(maxDistance, newDistance));
      });
    } else {
      // Other layouts: Normal zoom
      const zoomSpeed = 100;
      const minDistance = 1500; // Closest zoom
      const maxDistance = 5000; // Farthest zoom
      
      setCameraDistance(prevDistance => {
        const newDistance = prevDistance + (event.deltaY > 0 ? zoomSpeed : -zoomSpeed);
        return Math.max(minDistance, Math.min(maxDistance, newDistance));
      });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'radial-gradient(circle, #1a1a2e 0%, #0f0f1e 100%)',
      }}
    />
  );
}
