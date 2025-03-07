import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useContext } from 'react';
import { AppContext } from '../AppContext';
import { ILine, root_id } from '../Wrapper';
import { section_color } from '../util/colors';

const TreeCanvas3D = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { state } = useContext(AppContext);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const updateTimeoutRef = useRef<NodeJS.Timeout>();

    const updateScene = useCallback(() => {
        if (!sceneRef.current) return;

        // Clear existing objects but preserve lights
        const lights = sceneRef.current.children.filter((child) => child instanceof THREE.Light);
        sceneRef.current.children.forEach((object) => {
            if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
                object.geometry.dispose();
                if (object.material instanceof THREE.Material) {
                    object.material.dispose();
                }
                sceneRef.current?.remove(object);
            }
        });

        // Add lights back if they were removed
        if (lights.length === 0) {
            const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
            sceneRef.current.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
            directionalLight.position.set(1, 1, 1);
            sceneRef.current.add(directionalLight);
        }

        // Render root node
        const rootLine = state.designLines[root_id];
        console.log('Root node:', {
            z: rootLine.z,
            points: rootLine.points,
            radius: rootLine.radius,
        });
        const rootGeometry = new THREE.SphereGeometry(rootLine.radius * 2, 32, 32);
        const rootMaterial = new THREE.MeshPhongMaterial({ color: 'red' });
        const rootMesh = new THREE.Mesh(rootGeometry, rootMaterial);
        rootMesh.position.set(rootLine.points[2], rootLine.points[3], rootLine.z ?? 0);
        sceneRef.current.add(rootMesh);

        // Render all other lines
        Object.values(state.designLines).forEach((line: ILine) => {
            if (line.id === root_id) return;

            // Get the parent line to access its z-coordinate
            const parentLine = state.designLines[line.pid];
            if (!parentLine) return;

            console.log(`Line ${line.id}:`, {
                z: line.z,
                parentZ: parentLine.z,
                points: line.points,
                parentPoints: parentLine.points,
            });
            const points = [
                new THREE.Vector3(line.points[0], line.points[1], parentLine.z ?? 0),
                new THREE.Vector3(line.points[2], line.points[3], line.z ?? 0),
            ];

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: section_color[line.tid],
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
            console.log('Scene bounds:', { center, size });

            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = cameraRef.current.fov * (Math.PI / 180);
            const cameraZ = Math.abs(maxDim / Math.sin(fov / 2));

            cameraRef.current.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
            controlsRef.current.target.copy(center);
            controlsRef.current.update();
        }
    }, [state.designLines]);

    // Update scene when state changes
    useEffect(() => {
        // Clear any pending updates
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }

        // Debounce the update
        updateTimeoutRef.current = setTimeout(updateScene, 50);
    }, [state.designLines, updateScene]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0xf0f0f0);

        // Initialize camera
        const camera = new THREE.PerspectiveCamera(
            75,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            1, // Increased near plane
            5000, // Increased far plane to handle large z values
        );
        cameraRef.current = camera;
        // Position camera at a better initial position based on the model scale
        camera.position.set(1000, 1000, 1000);
        camera.lookAt(0, 0, 0);

        // Initialize renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current = renderer;
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
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
