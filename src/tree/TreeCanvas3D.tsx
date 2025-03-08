import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useContext } from 'react';
import { AppContext } from '../AppContext';
import { ILine, root_id } from '../Wrapper';

const parseColor = (color: string) => {
    if (color.startsWith('rgba')) {
        const [r, g, b, a] = color.match(/[\d.]+/g) || [];
        return {
            color: new THREE.Color(`rgb(${r}, ${g}, ${b})`),
            opacity: parseFloat(a),
        };
    }
    return {
        color: new THREE.Color(color),
        opacity: 1,
    };
};

const TreeCanvas3D = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { state } = useContext(AppContext);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const updateTimeoutRef = useRef<NodeJS.Timeout>();
    const Z_SCALE = 5; // Scale factor for z-coordinates

    const updateScene = useCallback(() => {
        if (!sceneRef.current) return;

        // Clear ALL existing objects including lights
        while (sceneRef.current.children.length > 0) {
            const object = sceneRef.current.children[0];
            if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
                object.geometry.dispose();
                if (object.material instanceof THREE.Material) {
                    object.material.dispose();
                }
            }
            sceneRef.current.remove(object);
        }

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        sceneRef.current.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(1, 1, 1);
        sceneRef.current.add(directionalLight);

        // Render root node
        const rootLine = state.designLines[root_id];
        const rootGeometry = new THREE.SphereGeometry(rootLine.radius * 2, 32, 32);
        const rootMaterial = new THREE.MeshPhongMaterial({
            color: 'red',
            transparent: true,
            opacity: 0.8,
        });
        const rootMesh = new THREE.Mesh(rootGeometry, rootMaterial);
        rootMesh.position.set(rootLine.points[2], rootLine.points[3], (rootLine.z ?? 0) * Z_SCALE);
        sceneRef.current.add(rootMesh);

        // Render all other lines
        Object.values(state.designLines).forEach((line: ILine) => {
            if (line.id === root_id) return;

            // Skip invisible lines immediately
            if (!state.section3DVisibility[line.tid]) return;

            // Get the parent line to access its z-coordinate
            const parentLine = state.designLines[line.pid];
            if (!parentLine) return;

            const points = [
                new THREE.Vector3(line.points[0], line.points[1], (parentLine.z ?? 0) * Z_SCALE),
                new THREE.Vector3(line.points[2], line.points[3], (line.z ?? 0) * Z_SCALE),
            ];

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const { color } = parseColor(state.sectionColors[line.tid]);
            const material = new THREE.LineBasicMaterial({
                color: color,
                linewidth: 2,
            });
            const lineMesh = new THREE.Line(geometry, material);
            sceneRef.current?.add(lineMesh);
        });

        // Center camera on the model
        if (cameraRef.current && controlsRef.current) {
            const box = new THREE.Box3().setFromObject(sceneRef.current);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            // Calculate camera distance based on the largest dimension
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = cameraRef.current.fov * (Math.PI / 180);
            const cameraZ = Math.abs(maxDim / Math.sin(fov / 2));

            // Position camera at a better angle to see the 3D structure
            cameraRef.current.position.set(
                center.x + cameraZ * 0.5,
                center.y + cameraZ * 0.5,
                center.z + cameraZ * 0.5,
            );
            controlsRef.current.target.copy(center);
            controlsRef.current.update();
        }

        // Force a re-render
        if (rendererRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current!);
        }
    }, [state.designLines, state.sectionColors, state.section3DVisibility]);

    // Update scene when state changes
    useEffect(() => {
        // Clear any pending updates
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }

        // Debounce the update
        updateTimeoutRef.current = setTimeout(updateScene, 50);
    }, [state.designLines, state.sectionColors, state.section3DVisibility, updateScene]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0xf0f0f0);

        // Sort transparent objects
        scene.traverse((object) => {
            if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
                object.renderOrder = object.material.opacity === 0 ? -1 : 0;
            }
        });

        // Initialize camera with a wider field of view
        const camera = new THREE.PerspectiveCamera(
            60, // Reduced FOV for less perspective distortion
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            1,
            10000, // Increased far plane
        );
        cameraRef.current = camera;

        // Initial camera position will be set by the updateScene function
        camera.lookAt(0, 0, 0);

        // Initialize renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        rendererRef.current = renderer;
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.sortObjects = true;
        renderer.setClearColor(0xf0f0f0, 1);
        containerRef.current.appendChild(renderer.domElement);

        // Add orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controlsRef.current = controls;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 100; // Add minimum zoom distance
        controls.maxDistance = 5000; // Add maximum zoom distance
        controls.target.set(0, 0, 0);
        controls.update();

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Handle window resize
        const handleResize = () => {
            if (!containerRef.current || !camera || !renderer) return;
            camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            containerRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default TreeCanvas3D;
