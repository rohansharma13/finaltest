import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";

const ProductPhotography = () => {
  const canvasRef = useRef(null);
  const [showText, setShowText] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const partsRef = useRef([]); // To store parts info

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.3, 7);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const light = new THREE.AmbientLight(0xffffff, 2);
    scene.add(light);

    const loader = new GLTFLoader();
    loader.load(
      "/photography.glb",
      (gltf) => {
        const model = gltf.scene;
        model.rotation.set(0, Math.PI / 2, 0);
        scene.add(model);

        // Initialize parts
        const parts = [];
        model.traverse((child) => {
          if (child.isMesh) {
            parts.push({
              mesh: child,
              originalPosition: child.position.clone(),
              originalScale: child.scale.clone(),
            });

            // Scatter: move them out of view at start
            child.position.set(
              (Math.random() - 0.5) * 10,
              (Math.random() - 0.5) * 10,
              (Math.random() - 0.5) * 10
            );
            child.scale.set(0.1, 0.1, 0.1);
          }
        });

        partsRef.current = parts;
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.touchAction = "pan-y";
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowText(true);
          setTimeout(() => {
            setFadeIn(true);
          }, 500);

          // Animate assembly
          partsRef.current.forEach(({ mesh, originalPosition, originalScale }) => {
            gsap.to(mesh.position, {
              x: originalPosition.x,
              y: originalPosition.y,
              z: originalPosition.z,
              duration: 1.5,
              ease: "power2.out",
            });
            gsap.to(mesh.scale, {
              x: originalScale.x,
              y: originalScale.y,
              z: originalScale.z,
              duration: 1.5,
              ease: "power2.out",
            });
          });
        } else {
          setFadeIn(false);
          setTimeout(() => {
            setShowText(false);
          }, 500);

          // Optionally disassemble again
          partsRef.current.forEach(({ mesh }) => {
            gsap.to(mesh.position, {
              x: (Math.random() - 0.5) * 10,
              y: (Math.random() - 0.5) * 10,
              z: (Math.random() - 0.5) * 10,
              duration: 1.5,
              ease: "power2.in",
            });
            gsap.to(mesh.scale, {
              x: 0.1,
              y: 0.1,
              z: 0.1,
              duration: 1.5,
              ease: "power2.in",
            });
          });
        }
      },
      {
        threshold: 0.3,
      }
    );

    const section = canvasRef.current?.parentElement;
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  return (
    <div
      id="hero-model-container"
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "auto",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />

      {showText && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: window.innerWidth < 600 ? "2rem" : "4rem",
            fontWeight: "bold",
            zIndex: 1,
            pointerEvents: "none",
            textAlign: "center",
            opacity: fadeIn ? 1 : 0,
            transition: "opacity 1s ease-in-out",
            textShadow:
              "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
          }}
        >
          TEXT STYLES
        </div>
      )}
    </div>
  );
};

export default ProductPhotography;
