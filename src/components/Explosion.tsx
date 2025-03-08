import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const Explosion = ({ position }: { position: THREE.Vector3 }) => {
  const { scene } = useThree();
  const particleSystemRef = useRef<THREE.Points>();
  const velocitiesRef = useRef<Array<THREE.Vector3>>([]);

  useEffect(() => {
    const particles = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const velocities = [];
    const color = new THREE.Color();

    for (let i = 0; i < particles; i++) {
      positions.push((Math.random() * 2 - 1) * 0.5);
      positions.push((Math.random() * 2 - 1) * 0.5);
      positions.push((Math.random() * 2 - 1) * 0.5);

      color.setHSL(i / particles, 1.0, 0.5);
      colors.push(color.r, color.g, color.b);

      // Initialgeschwindigkeit für jedes Partikel zufällig setzen
      const velocity = new THREE.Vector3(
        (Math.random() * 2 - 1) * 0.5,
        (Math.random() * 2 - 1) * 0.5,
        (Math.random() * 2 - 1) * 0.5
      );
      velocities.push(velocity);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: 0.05, vertexColors: true });
    const particleSystem = new THREE.Points(geometry, material);

    particleSystem.position.copy(position);
    particleSystemRef.current = particleSystem;
    velocitiesRef.current = velocities;
    scene.add(particleSystem);

    setTimeout(() => {
      scene.remove(particleSystem);
    }, 1000);
  }, [position, scene]);

  useFrame(() => {
    if (particleSystemRef.current) {
      const positions = particleSystemRef.current.geometry.attributes.position.array;
      const velocities = velocitiesRef.current;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i / 3].x;
        positions[i + 1] += velocities[i / 3].y;
        positions[i + 2] += velocities[i / 3].z;

        // Optional: Verlangsamung der Partikel
        velocities[i / 3].multiplyScalar(0.95);
      }

      particleSystemRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return null;
};

export default Explosion;