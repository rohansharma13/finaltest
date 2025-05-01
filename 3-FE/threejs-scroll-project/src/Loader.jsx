import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const Loader = ({ onModelLoaded }) => {
  const canvasRef = useRef(null);
  const ringRefs = useRef([]);
  const loadingTextRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 5, 20);

    const camera = new THREE.PerspectiveCamera(
      window.innerWidth < 768 ? 90 : 75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 6);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    const loader = new GLTFLoader();

    loader.load(
      "/loading.glb",
      (gltf) => {
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.scale.set(2, 2, 2);
        model.rotation.set(Math.PI / 2, 0, Math.PI);

        ringRefs.current = [];

        model.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(0xcccccc),
              metalness: 1,
              roughness: 2,
              transmission: 2,
              thickness: 2.0,
              transparent: true,
              opacity: 0.12,
              emissive: new THREE.Color(0xb0b0b0),
              emissiveIntensity: 3,
              ior: 1.2,
              clearcoat: 1,
              clearcoatRoughness: 0.05,
            });

            ringRefs.current.push(child);
          }
        });

        scene.add(model);

        let frame = 0;
        const maxFrames = 120;
        const startZ = camera.position.z;
        const endZ = 0.01;

        const zoomIn = () => {
          if (frame <= maxFrames) {
            frame++;
            const progress = frame / maxFrames;
            const eased = Math.pow(progress, 2);
            camera.position.z = startZ + (endZ - startZ) * eased;

            ringRefs.current.forEach((ring) => {
              if (ring.material && ring.material.opacity !== undefined) {
                ring.material.opacity = Math.max(0, 0.12 * (1 - progress));
              }
            });

            if (loadingTextRef.current) {
              loadingTextRef.current.style.transform = `translate(-50%, -50%) scale(${
                1 + progress
              })`;

              loadingTextRef.current.style.opacity = `${1 - progress}`;
            }

            requestAnimationFrame(zoomIn);
          }
        };

        setTimeout(() => {
          zoomIn();
        }, 3000);

        if (onModelLoaded) onModelLoaded();
      },
      undefined,
      (error) => {
        console.error("Error loading GLB model:", error);
      }
    );

    const animate = () => {
      requestAnimationFrame(animate);

      ringRefs.current.forEach((ring, index) => {
        ring.rotation.x = 0;
        ring.rotation.y += 0.01 * (index % 3 === 0 ? -1 : 1);
        ring.rotation.z = 0;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.fov = width < 768 ? 90 : 75;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();

      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
  }, [onModelLoaded]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1000,
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
      <div
        ref={loadingTextRef}
        style={{
          position: "absolute",
          top: "55%",
          left: "50%",
          right: "30%",
          transform: "translate(-50%, -50%)",
          color: "white",
          fontSize: "clamp(1rem, 4vw, 2rem)",
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: "0 1rem",
        }}
      >
        LOADING...
      </div>
    </div>
  );
};

export default Loader;
