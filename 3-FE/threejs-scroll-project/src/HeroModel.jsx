import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const HeroModel = () => {
  const canvasRef = useRef(null);
  const [showText, setShowText] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 1.7); // Set the camera position

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x242424);

    // Add some light to the scene
    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    // Load the 3D model
    const loader = new GLTFLoader();
    loader.load(
      "/laptop.glb", // Use the path relative to the public folder
      (gltf) => {
        scene.add(gltf.scene); // Add the model to the scene
      },
      undefined,
      (error) => {
        console.error("Error loading the model:", error);
      }
    );

    // Set up camera controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false; // 🔒 Disable zoom
    controls.enablePan = false;
    controls.enableRotate = false;
    controls.autoRotate = true; // ✅ Enables continuous rotation
    controls.autoRotateSpeed = 2.0;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      controls.dispose(); // Clean up controls
      renderer.dispose(); // Clean up renderer
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // When section is visible
          setShowText(true);
          setTimeout(() => {
            setFadeIn(true);
          }, 500); // delay text fade-in
        } else {
          // When section is not visible
          setFadeIn(false);
          setTimeout(() => {
            setShowText(false);
          }, 500);
        }
      },
      {
        threshold: 0.3, // Trigger when at least 30% of the section is visible
      }
    );
  
    const section = document.getElementById("hero-model-container");
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
        overflow: "hidden",
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
            fontSize: window.innerWidth < 600 ? "2rem" : "4rem", // Smaller font on mobile
            fontWeight: "bold",
            zIndex: 1,
            pointerEvents: "none",
            textAlign: "center",
            opacity: fadeIn ? 1 : 0,
            transition: "opacity 1s ease-in-out", // smooth fade
            textShadow:
              "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
          }}
        >
          WEB DEVELOPMENT
        </div>
      )}
    </div>
  );
};

export default HeroModel;
