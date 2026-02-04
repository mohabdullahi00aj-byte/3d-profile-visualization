import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import * as TWEEN from '@tweenjs/tween.js';
import { getNetWorthColor, formatNetWorth } from '../utils/googleSheets.js';

export function DataVisualization({ data, layout }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const objectsRef = useRef([]);
  const targetsRef = useRef({
    table: [],
    sphere: [],
    helix: [],
    grid: [],
    tetrahedron: [],
  });

  // Initialize Three.js scene - exactly like official periodic table
  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    // Clear container
    containerRef.current.innerHTML = '';

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera - exactly like official example
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 3000;
    cameraRef.current = camera;

    // Renderer - exactly like official example
    const renderer = new CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // TrackballControls - EXACTLY like official Three.js periodic table
    const controls = new TrackballControls(camera, renderer.domElement);
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener('change', render);
    controlsRef.current = controls;

    // Render function - exactly like official example
    function render() {
      renderer.render(scene, camera);
    }

    // Create objects
    const objects = [];
    const table = [];
    const sphere = [];
    const helix = [];
    const grid = [];
    const tetrahedron = [];

    const visualData = data.slice(0, 200);

    visualData.forEach((person, i) => {
      // Create element - exactly like official example
      const element = document.createElement('div');
      element.className = 'element';
      element.style.width = '120px';
      element.style.height = '160px';
      element.style.boxShadow = '0px 0px 12px rgba(0,255,255,0.5)';
      element.style.border = '1px solid rgba(127,255,255,0.25)';
      element.style.fontFamily = 'Helvetica, sans-serif';
      element.style.textAlign = 'center';
      element.style.lineHeight = 'normal';
      element.style.cursor = 'default';
      element.style.backgroundColor = getNetWorthColor(person.netWorth);

      // Profile image
      if (person.photo && person.photo.trim() !== '') {
        const profileImage = document.createElement('img');
        profileImage.src = person.photo;
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
        profileImage.onerror = () => {
          profileImage.style.display = 'none';
        };
        element.appendChild(profileImage);
      }

      // Number
      const number = document.createElement('div');
      number.className = 'number';
      number.textContent = String(i + 1);
      number.style.position = 'absolute';
      number.style.top = '8px';
      number.style.right = '8px';
      number.style.fontSize = '10px';
      number.style.color = 'rgba(255,255,255,0.5)';
      number.style.fontWeight = 'bold';
      number.style.fontFamily = 'monospace';
      element.appendChild(number);

      // Name
      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = person.name;
      name.style.position = 'absolute';
      name.style.top = '52px';
      name.style.width = '100%';
      name.style.fontSize = '16px';
      name.style.fontWeight = 'bold';
      name.style.color = 'rgba(255,255,255,0.95)';
      name.style.padding = '0 4px';
      name.style.overflow = 'hidden';
      name.style.textOverflow = 'ellipsis';
      name.style.whiteSpace = 'nowrap';
      element.appendChild(name);

      // Occupation
      const occupation = document.createElement('div');
      occupation.className = 'occupation';
      occupation.textContent = person.occupation;
      occupation.style.position = 'absolute';
      occupation.style.top = '75px';
      occupation.style.width = '100%';
      occupation.style.fontSize = '11px';
      occupation.style.color = 'rgba(255,255,255,0.75)';
      occupation.style.padding = '0 4px';
      occupation.style.overflow = 'hidden';
      occupation.style.textOverflow = 'ellipsis';
      occupation.style.whiteSpace = 'nowrap';
      element.appendChild(occupation);

      // Age
      const age = document.createElement('div');
      age.className = 'age';
      age.textContent = `Age: ${person.age}`;
      age.style.position = 'absolute';
      age.style.top = '95px';
      age.style.width = '100%';
      age.style.fontSize = '10px';
      age.style.color = 'rgba(255,255,255,0.7)';
      element.appendChild(age);

      // Net Worth
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

      // CSS3D Object
      const objectCSS = new CSS3DObject(element);
      objectCSS.position.x = Math.random() * 4000 - 2000;
      objectCSS.position.y = Math.random() * 4000 - 2000;
      objectCSS.position.z = Math.random() * 4000 - 2000;
      scene.add(objectCSS);
      objects.push(objectCSS);

      // Layout positions - exactly like official example
      // Table
      const tableObject = new THREE.Object3D();
      tableObject.position.x = (i % 20) * 200 - 1900;
      tableObject.position.y = -(Math.floor(i / 20) % 10) * 200 + 900;
      tableObject.position.z = 0;
      table.push(tableObject);

      // Sphere
      const phi = Math.acos(-1 + (2 * i) / visualData.length);
      const theta = Math.sqrt(visualData.length * Math.PI) * phi;
      const sphereObject = new THREE.Object3D();
      sphereObject.position.setFromSphericalCoords(800, phi, theta);
      sphere.push(sphereObject);

      // Helix
      const helixObject = new THREE.Object3D();
      const helixIndex = i % 2;
      const theta2 = i * 0.175 + Math.PI * helixIndex;
      const y = -(i * 8) + 800;
      helixObject.position.setFromCylindricalCoords(400, theta2, y);
      helix.push(helixObject);

      // Grid
      const gridObject = new THREE.Object3D();
      gridObject.position.x = ((i % 5) - 2) * 250;
      gridObject.position.y = (-(Math.floor(i / 5) % 10) + 4.5) * 220;
      gridObject.position.z = (Math.floor(i / 50) - 2) * 180;
      grid.push(gridObject);

      // Tetrahedron
      const tetrahedronObject = new THREE.Object3D();
      const faceIndex = Math.floor(i / 50);
      const itemInFace = i % 50;
      const scale = 800;
      const height = scale * 0.8;
      const baseRadius = scale * 0.7;
      
      const vertices = [
        new THREE.Vector3(0, height, 0),
        new THREE.Vector3(-baseRadius, -height * 0.3, baseRadius * 0.6),
        new THREE.Vector3(baseRadius, -height * 0.3, baseRadius * 0.6),
        new THREE.Vector3(0, -height * 0.3, -baseRadius * 1.2)
      ];
      
      const faces = [
        [0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 2, 3]
      ];
      
      if (faceIndex < 4) {
        const face = faces[faceIndex];
        const v1 = vertices[face[0]];
        const v2 = vertices[face[1]];
        const v3 = vertices[face[2]];
        
        const gridSize = Math.ceil(Math.sqrt(50));
        const row = Math.floor(itemInFace / gridSize);
        const col = itemInFace % gridSize;
        const maxColsInRow = Math.max(1, gridSize - Math.floor(row * 0.8));
        
        if (col < maxColsInRow) {
          const u = (row + 0.5) / gridSize;
          const v = (col + 0.5) / maxColsInRow;
          const w = 1 - u - v;
          const total = Math.max(0.1, u + v + w);
          const normalizedU = Math.max(0, u / total);
          const normalizedV = Math.max(0, v / total);
          const normalizedW = Math.max(0, w / total);
          
          tetrahedronObject.position.x = v1.x * normalizedW + v2.x * normalizedU + v3.x * normalizedV;
          tetrahedronObject.position.y = v1.y * normalizedW + v2.y * normalizedU + v3.y * normalizedV;
          tetrahedronObject.position.z = v1.z * normalizedW + v2.z * normalizedU + v3.z * normalizedV;
        } else {
          const centerX = (v1.x + v2.x + v3.x) / 3;
          const centerY = (v1.y + v2.y + v3.y) / 3;
          const centerZ = (v1.z + v2.z + v3.z) / 3;
          const spread = 80;
          tetrahedronObject.position.x = centerX + (Math.random() - 0.5) * spread;
          tetrahedronObject.position.y = centerY + (Math.random() - 0.5) * spread;
          tetrahedronObject.position.z = centerZ + (Math.random() - 0.5) * spread;
        }
      }
      tetrahedron.push(tetrahedronObject);
    });

    objectsRef.current = objects;
    targetsRef.current = { table, sphere, helix, grid, tetrahedron };

    // Animation loop - EXACTLY like official Three.js periodic table
    function animate() {
      requestAnimationFrame(animate);
      TWEEN.update();
      controls.update();
    }
    animate();

    // Window resize - exactly like official example
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      render();
    }
    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (controls) {
        controls.removeEventListener('change', render);
        controls.dispose();
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [data]);

  // Transform function - EXACTLY like official Three.js periodic table
  useEffect(() => {
    const targets = targetsRef.current[layout];
    const objects = objectsRef.current;

    if (objects.length === 0 || targets.length === 0) return;

    // Transform function exactly like official example
    function transform(targets, duration) {
      TWEEN.removeAll();

      for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        const target = targets[i];

        if (target) {
          new TWEEN.Tween(object.position)
            .to({
              x: target.position.x,
              y: target.position.y,
              z: target.position.z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

          new TWEEN.Tween(object.rotation)
            .to({
              x: target.rotation.x,
              y: target.rotation.y,
              z: target.rotation.z
            }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
      }

      new TWEEN.Tween({})
        .to({}, duration * 2)
        .onUpdate(() => {
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
        })
        .start();
    }

    // Start transformation
    transform(targets, 2000);
  }, [layout]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'radial-gradient(circle, #1a1a2e 0%, #0f0f1e 100%)',
      }}
    />
  );
}