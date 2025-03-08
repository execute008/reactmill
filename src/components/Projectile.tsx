import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ProjectileProps {
  position: THREE.Vector3;
  onRemove: () => void;
}

const Projectile: React.FC<ProjectileProps> = ({ position, onRemove }) => {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (ref.current) {
      ref.current.position.copy(position);
      ref.current.position.y += 0.1;
      position.y += 0.1; // Aktualisieren Sie die Position des Projektils
      if (ref.current.position.y > 10) {
        onRemove();
      }
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color="yellow" />
    </mesh>
  );
};

export default Projectile;