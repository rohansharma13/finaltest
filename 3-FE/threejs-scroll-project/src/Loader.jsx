import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const Loader = () => {
  const canvasRef = useRef(null); // Reference for the canvas to render 3D model

  useEffect(() => {
    // Set up basic 3D scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10; // Adjust camera position

    // Create the renderer and append it to the canvas
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Set up a basic light source
    const light = new THREE.AmbientLight(0x404040, 2); // Ambient light
    scene.add(light);

    // Add directional light for better visibility
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);
        
    // Load 3D model using GLTFLoader
    const loader = new GLTFLoader();
    loader.load(
        "/loadings.glb", 
        (gltf) => {
          console.log("3D model loaded successfully");
          const model = gltf.scene;
          scene.add(model);
        },
        undefined,
        (error) => {
          console.error("Error loading model:", error);
        }
      );
      

    // Animation loop to render the scene
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resizing
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%",
        height: "100%",
      }}
    >
      {/* Canvas for 3D model */}
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          top: "60%",
          left: "50%",
          transform: "translateX(-50%)",
          color: "white",
          fontSize: "2rem",
        }}
      >
        Loading...
      </div>
    </div>
  );
};

export default Loader;
