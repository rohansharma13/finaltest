import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";

const PreHeroModel = ({ onTextAnimationComplete }) => {
  const canvasRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 5);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true, // allow transparent background if needed
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);

    scene.add(new THREE.AmbientLight(0xffffff, 1));

    const loader = new GLTFLoader();
    loader.load(
      "/oldcomputer.glb",
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.8, 0.8, 0.8);
        model.position.set(0, -2, 0);
        scene.add(model);
      },
      undefined,
      (error) => console.error("Error loading model:", error)
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
    const tl = gsap.timeline({
      onComplete: () => {
        if (onTextAnimationComplete) onTextAnimationComplete();
      },
    });

    tl.fromTo(
      textRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 2,
        ease: "power3.inOut",
        delay: 0.7,
      }
    );

    return () => tl.kill();
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "auto", // allow scrolling
        WebkitOverflowScrolling: "touch", // smooth scrolling on iOS
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          touchAction: "pan-y", // very important for mobile touch scroll
        }}
      />

      <div
        ref={textRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "white",
          fontSize: window.innerWidth < 600 ? "2rem" : "4rem",
          fontWeight: "bold",
          zIndex: 11,
          textAlign: "center",
          opacity: 0,
          pointerEvents: "none",
          textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
          padding: "0 1rem",
          lineHeight: 1.1,
        }}
      >
       KHAALAS MEDIA
      </div>
    </div>
  );
};

export default PreHeroModel;
