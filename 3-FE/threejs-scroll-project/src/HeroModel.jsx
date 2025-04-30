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
    camera.position.set(0, 1, 1.7);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true, // 🌟 Allow background transparency if needed
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x242424);

    canvasRef.current.style.touchAction = "pan-y"; // 🌟 Allow vertical scrolling on touch

    scene.add(new THREE.AmbientLight(0xffffff, 1));

    const loader = new GLTFLoader();
    loader.load(
      "/laptop.glb",
      (gltf) => {
        scene.add(gltf.scene);
      },
      undefined,
      (error) => console.error("Error loading the model:", error)
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

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
          setTimeout(() => setFadeIn(true), 500);
        } else {
          setFadeIn(false);
          setTimeout(() => setShowText(false), 500);
        }
      },
      { threshold: 0.3 }
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
        overflow: "auto", // 🌟 Allow scrolling
        WebkitOverflowScrolling: "touch", // 🌟 Smooth scroll on iOS
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          touchAction: "pan-y", // 🌟 Critical for touch devices!
        }}
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
            padding: "0 1rem",
            lineHeight: 1.1,
          }}
        >
          WEB DEVELOPMENT
        </div>
      )}
    </div>
  );
};

export default HeroModel;
