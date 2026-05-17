import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./SpeedGauge.css";

const SpeedGauge = ({ speed, maxSpeed = 500, isLoading = false }) => {
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const needleRef = useRef(null);
  const glowRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const currentSpeedRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.z = 9;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const background = new THREE.Mesh(
      new THREE.CircleGeometry(3.6, 64),
      new THREE.MeshBasicMaterial({ color: 0x0b1119 })
    );
    scene.add(background);

    const segmentGroup = new THREE.Group();
    const colors = [
      0x19f5c3, 0x3df57a, 0x75f54a, 0xbaf53a,
      0xf5f54a, 0xf5c542, 0xf59b3a, 0xf56b3a,
      0xf53a3a, 0xf53a6d, 0xf53aa5, 0xf53ae6
    ];
    const startAngle = -Math.PI * 0.75;
    const endAngle = Math.PI * 0.75;
    const arc = (endAngle - startAngle) / colors.length;

    colors.forEach((color, index) => {
      const geometry = new THREE.RingGeometry(2.6, 3.2, 32, 1, startAngle + arc * index, arc * 0.9);
      const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 });
      const mesh = new THREE.Mesh(geometry, material);
      segmentGroup.add(mesh);
    });

    scene.add(segmentGroup);

    const center = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 32),
      new THREE.MeshBasicMaterial({ color: 0x10f0d7 })
    );
    scene.add(center);

    const needle = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 2.4, 0.1),
      new THREE.MeshBasicMaterial({ color: 0x10f0d7 })
    );
    needle.position.y = 0.9;
    needleRef.current = needle;
    scene.add(needle);

    const glow = new THREE.Mesh(
      new THREE.RingGeometry(0.8, 1.4, 64),
      new THREE.MeshBasicMaterial({ color: 0x1ad4c7, transparent: true, opacity: 0.2 })
    );
    glowRef.current = glow;
    scene.add(glow);

    const animate = () => {
      const target = Math.min(speed, maxSpeed);
      const current = currentSpeedRef.current;
      const next = current + (target - current) * 0.06;
      currentSpeedRef.current = next;

      const angle = startAngle + (next / maxSpeed) * (endAngle - startAngle);
      needle.rotation.z = angle;

      if (glowRef.current) {
        glowRef.current.material.opacity = isLoading
          ? 0.25 + Math.sin(Date.now() * 0.005) * 0.1
          : 0.2;
      }

      segmentGroup.rotation.z += 0.0008;
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const onResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      renderer.setSize(newWidth, newHeight);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", onResize);

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;

    return () => {
      window.removeEventListener("resize", onResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.domElement.remove();
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [speed, maxSpeed, isLoading]);

  return <div className="speed-gauge" ref={containerRef} />;
};

export default SpeedGauge;
