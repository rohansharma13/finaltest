import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
    camera.position.set(0, 1.3, 30);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const light = new THREE.AmbientLight(0xffffff, 2);
    scene.add(light);

    const meshParts = []; // To store mesh info for animation

    const loader = new GLTFLoader();
    loader.load(
      "/seo2.glb",
      (gltf) => {
        const model = gltf.scene;
        model.rotation.set(0, 1.3, 0);
        scene.add(model);

        // Traverse and prepare each mesh for disassemble/assemble
        model.traverse((child) => {
          if (child.isMesh) {
            const initialPosition = child.position.clone(); // Save original position

            // Offset the mesh parts to a scattered position
            child.position.x += (Math.random() - 0.5) * 10;
            child.position.y += (Math.random() - 0.5) * 10;
            child.position.z += (Math.random() - 0.5) * 10;

            // Store info for GSAP animation
            meshParts.push({ mesh: child, initialPosition });
          }
        });

        // Animate each part back to its original position on scroll

        meshParts.forEach(({ mesh, initialPosition }) => {
          gsap.to(mesh.position, {
            x: initialPosition.x,
            y: initialPosition.y,
            z: initialPosition.z,
            ease: "power2.out",
            scrollTrigger: {
              trigger: canvasRef.current,
              start: "top bottom",
              end: "+=150%", // Much longer scroll distance = slower
              scrub: true,
            },
          });
        });
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
      ScrollTrigger.getAll().forEach((st) => st.kill()); // Clean up scroll triggers
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowText(true);
          setTimeout(() => setFadeIn(true), 100);
        } else {
          setFadeIn(false);
          setTimeout(() => setShowText(false), 500);
        }
      },
      { threshold: 0.5 }
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
          SMOOTH SCROLL
        </div>
      )}
    </div>
  );
};

export default SEO;
