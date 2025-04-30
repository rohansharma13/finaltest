import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const SEO = () => {
  const canvasRef = useRef(null);
  const [showText, setShowText] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.3, 30); // Default camera position

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
      "/seo2.glb", // Use the path relative to the public folder
      (gltf) => {
        const model = gltf.scene;
        model.rotation.set(0, 1.3, 0); // Faces front
        scene.add(model);
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

    // IMPORTANT: Allow touch scroll to work
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.touchAction = "pan-y"; // allow vertical touch scroll
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
          setTimeout(() => setFadeIn(true), 100); // fade in slightly quicker
        } else {
          setFadeIn(false);
          setTimeout(() => setShowText(false), 500); // fade out after transition
        }
      },
      { threshold: 0.5 }
    );
  
    const section = canvasRef.current?.parentElement; // Observe the section holding the canvas
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
          SEO
        </div>
      )}
    </div>
  );
};

export default SEO;
