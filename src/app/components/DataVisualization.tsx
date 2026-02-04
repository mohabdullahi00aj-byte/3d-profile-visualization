import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { PersonData, getNetWorthColor, formatNetWorth } from '@/app/utils/googleSheets';

interface DataVisualizationProps {
  data: PersonData[];
  layout: 'table' | 'sphere' | 'helix' | 'grid' | 'tetrahedron';
}

export function DataVisualization({ data, layout }: DataVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<CSS3DRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<TrackballControls | null>(null);
  const objectsRef = useRef<CSS3DObject[]>([]);
  const targetsRef = useRef<{
    table: THREE.Object3D[];
    sphere: THREE.Object3D[];
    helix: THREE.Object3D[];
    grid: THREE.Object3D[];
    tetrahedron: THREE.Object3D[];
  }>({
    table: [],
    sphere: [],
    helix: [],
    grid: [],
    tetrahedron: [],
  });

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

    // Initialize TrackballControls exactly like the sample code
    const controls = new TrackballControls(camera, renderer.domElement);
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    
    // Render function exactly like sample code
    const render = () => {
      renderer.render(scene, camera);
    };
    
    // Add change event listener exactly like sample code
    controls.addEventListener('change', render);
    controlsRef.current = controls;

    // Create objects for each data item
    const objects: CSS3DObject[] = [];
    const table: THREE.Object3D[] = [];
    const sphere: THREE.Object3D[] = [];
    const helix: THREE.Object3D[] = [];
    const grid: THREE.Object3D[] = [];
    const tetrahedron: THREE.Object3D[] = [];

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
      element.style.position = 'relative';
      element.style.overflow = 'hidden';

      // Profile image (if available from CSV Photo column)
      const photoUrl = person.photo || ''; // Get photo URL from person data
      
      if (photoUrl && photoUrl.trim() !== '') {
        const profileImage = document.createElement('img');
        profileImage.src = photoUrl;
        profileImage.style.position = 'absolute';
        profileImage.style.top = '6px';
        profileImage.style.left = '6px';
        profileImage.style.width = '36px';
        profileImage.style.height = '36px';
        profileImage.style.borderRadius = '3px';
        profileImage.style.objectFit = 'cover';
        profileImage.style.border = '2px solid rgba(255,255,255,0.8)';
        profileImage.style.backgroundColor = 'rgba(0,0,0,0.1)';
        profileImage.style.zIndex = '10';
        
        // Handle image load errors gracefully
        profileImage.onerror = () => {
          profileImage.style.display = 'none';
        };
        
        element.appendChild(profileImage);
      }

      const number = document.createElement('div');
      number.className = 'number';
      number.textContent = String(i + 1);
      number.style.position = 'absolute';
      number.style.top = '8px';
      number.style.right = '8px';
      number.style.fontSize = '10px';
      number.style.color = 'rgba(255,255,255,0.5)';
      number.style.fontWeight = 'bold';
      element.appendChild(number);

      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = person.name;
      name.style.position = 'absolute';
      name.style.top = '52px'; // Moved down to accommodate profile image
      name.style.width = '100%';
      name.style.fontSize = '16px'; // Slightly smaller to fit better
      name.style.fontWeight = 'bold';
      name.style.color = 'rgba(255,255,255,0.95)';
      name.style.padding = '0 4px';
      name.style.overflow = 'hidden';
      name.style.textOverflow = 'ellipsis';
      name.style.whiteSpace = 'nowrap';
      element.appendChild(name);

      const occupation = document.createElement('div');
      occupation.className = 'occupation';
      occupation.textContent = person.occupation;
      occupation.style.position = 'absolute';
      occupation.style.top = '75px'; // Adjusted position
      occupation.style.width = '100%';
      occupation.style.fontSize = '11px';
      occupation.style.color = 'rgba(255,255,255,0.75)';
      occupation.style.padding = '0 4px';
      occupation.style.overflow = 'hidden';
      occupation.style.textOverflow = 'ellipsis';
      occupation.style.whiteSpace = 'nowrap';
      element.appendChild(occupation);

      const age = document.createElement('div');
      age.className = 'age';
      age.textContent = `Age: ${person.age}`;
      age.style.position = 'absolute';
      age.style.top = '95px'; // Adjusted position
      age.style.width = '100%';
      age.style.fontSize = '10px';
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

      // Tetrahedron layout (4-face pyramid) - LARGE and BOLD design
      const tetrahedronObject = new THREE.Object3D();
      
      // Calculate which face this item belongs to (4 faces total)
      const faceIndex = Math.floor(i / 50); // 50 items per face (200/4)
      const itemInFace = i % 50;
      
      // Large tetrahedron vertices - BIGGER and more visible
      const scale = 800; // Much larger scale for bold appearance
      const height = scale * 0.8; // 640 units height
      const baseRadius = scale * 0.7; // 560 units base radius
      
      const vertices = [
        new THREE.Vector3(0, height, 0),                           // Top apex - high up
        new THREE.Vector3(-baseRadius, -height * 0.3, baseRadius * 0.6),  // Base vertex 1
        new THREE.Vector3(baseRadius, -height * 0.3, baseRadius * 0.6),   // Base vertex 2
        new THREE.Vector3(0, -height * 0.3, -baseRadius * 1.2)           // Base vertex 3 - further back
      ];
      
      // Define the 4 triangular faces - WIDE and FLAT
      const faces = [
        [0, 1, 2], // Front face (apex to base edge 1-2)
        [0, 2, 3], // Right face (apex to base edge 2-3)
        [0, 3, 1], // Left face (apex to base edge 3-1)
        [1, 2, 3]  // Bottom face (base triangle)
      ];
      
      if (faceIndex < 4) {
        const face = faces[faceIndex];
        const v1 = vertices[face[0]];
        const v2 = vertices[face[1]];
        const v3 = vertices[face[2]];
        
        // Simple grid distribution for clear, spread-out arrangement
        const gridSize = Math.ceil(Math.sqrt(50)); // ~7x7 grid
        const row = Math.floor(itemInFace / gridSize);
        const col = itemInFace % gridSize;
        
        // Create triangular mask - only show items in triangular area
        const maxColsInRow = Math.max(1, gridSize - Math.floor(row * 0.8));
        
        if (col < maxColsInRow) {
          // Barycentric coordinates for positioning on triangular face
          const u = (row + 0.5) / gridSize;
          const v = (col + 0.5) / maxColsInRow;
          const w = 1 - u - v;
          
          // Ensure valid coordinates
          const total = Math.max(0.1, u + v + w);
          const normalizedU = Math.max(0, u / total);
          const normalizedV = Math.max(0, v / total);
          const normalizedW = Math.max(0, w / total);
          
          // Position on face with NO shrinking - use full face area
          tetrahedronObject.position.x = v1.x * normalizedW + v2.x * normalizedU + v3.x * normalizedV;
          tetrahedronObject.position.y = v1.y * normalizedW + v2.y * normalizedU + v3.y * normalizedV;
          tetrahedronObject.position.z = v1.z * normalizedW + v2.z * normalizedU + v3.z * normalizedV;
        } else {
          // Place extra items near face center with slight spread
          const centerX = (v1.x + v2.x + v3.x) / 3;
          const centerY = (v1.y + v2.y + v3.y) / 3;
          const centerZ = (v1.z + v2.z + v3.z) / 3;
          
          // Small random spread to avoid exact overlap
          const spread = 80;
          const offsetX = (Math.random() - 0.5) * spread;
          const offsetY = (Math.random() - 0.5) * spread;
          const offsetZ = (Math.random() - 0.5) * spread;
          
          tetrahedronObject.position.x = centerX + offsetX;
          tetrahedronObject.position.y = centerY + offsetY;
          tetrahedronObject.position.z = centerZ + offsetZ;
        }
      }
      
      tetrahedron.push(tetrahedronObject);
    });

    objectsRef.current = objects;
    targetsRef.current = { table, sphere, helix, grid, tetrahedron };

    // Animation loop exactly like the sample code
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
    };

    animate();

    // Handle window resize exactly like sample code
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      render(); // Call render after resize like sample code
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [data]); // Remove currentRotation dependency

  // Transform to layout
  useEffect(() => {
    const targets = targetsRef.current[layout];
    const objects = objectsRef.current;

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

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'radial-gradient(circle, #1a1a2e 0%, #0f0f1e 100%)',
      }}
    />
  );
}
