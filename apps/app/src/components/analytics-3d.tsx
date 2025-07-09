"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Analytics3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const barsRef = useRef<THREE.Mesh[]>([]);
  const originalHeights = useRef<number[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera setup (fixed position)
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create 3 bars with heights 1.5, 2, 2.8 - all white
    const barHeights = [1.5, 2, 2.8];
    const barPositions = [-2, 0, 2];

    originalHeights.current = [...barHeights];

    barHeights.forEach((height, index) => {
      const geometry = new THREE.BoxGeometry(0.8, height, 0.8);
      const material = new THREE.MeshLambertMaterial({
        color: 0xffffff, // White color
        transparent: true,
        opacity: 0.9,
      });

      const bar = new THREE.Mesh(geometry, material);
      bar.position.set(barPositions[index], height / 2, 0);
      bar.castShadow = true;
      bar.userData = {
        originalHeight: height,
        originalY: height / 2,
        index,
        isHovered: false,
        rotationSpeed: 0,
      };

      scene.add(bar);
      barsRef.current.push(bar);
    });

    // Mouse interaction
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let hoveredBar: THREE.Mesh | null = null;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(barsRef.current);

      // Reset previous hovered bar
      if (hoveredBar && !intersects.find((i) => i.object === hoveredBar)) {
        hoveredBar.userData.isHovered = false;
        hoveredBar.userData.rotationSpeed = 0;
        hoveredBar = null;
        renderer.domElement.style.cursor = "default";
      }

      // Handle new hover
      if (intersects.length > 0) {
        const bar = intersects[0].object as THREE.Mesh;
        if (bar !== hoveredBar) {
          hoveredBar = bar;
          bar.userData.isHovered = true;
          bar.userData.rotationSpeed = 0.05; // Rotation speed on hover
          renderer.domElement.style.cursor = "pointer";
        }
      }
    };

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(barsRef.current);

      if (intersects.length > 0) {
        const bar = intersects[0].object as THREE.Mesh;
        const index = bar.userData.index;

        // Console log for demo
        console.log(
          `Clicked bar ${index + 1} - Height: ${originalHeights.current[index]} - Analytics data: ${Math.round(Math.random() * 1000)} views`,
        );
      }
    };

    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("click", handleClick);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Only rotate bars that are being hovered
      for (const bar of barsRef.current) {
        if (bar.userData.isHovered && bar.userData.rotationSpeed > 0) {
          bar.rotation.y += bar.userData.rotationSpeed;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;

      camera.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight,
      );
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("mousemove", handleMouseMove);
      renderer.domElement.removeEventListener("click", handleClick);

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      // Dispose of Three.js objects
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: "100vh" }}
    />
  );
}
