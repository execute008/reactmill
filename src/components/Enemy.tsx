import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';


export type EnemyType = { id: number; position: THREE.Vector3; lives: number };

interface EnemyProps {
  position: THREE.Vector3;
  playerPosition: THREE.Vector3;
  onRemove: () => void;
  speed: number;
  lives: number; // Add lives property
}

const Enemy: React.FC<EnemyProps> = ({ position, playerPosition, onRemove, speed, lives }) => {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (ref.current) {
      ref.current.position.copy(position);

      //move *speed towards player
      const direction = playerPosition.clone().sub(ref.current.position).normalize();
      ref.current.position.add(direction.multiplyScalar(speed));
      position.copy(ref.current.position);

      if (ref.current.position.y < -5) {
        onRemove(); // Entfernen, wenn unterhalb des sichtbaren Bereichs
      }
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={lives === 3 ? "red" : lives === 2 ? "orange" : "yellow"} /> // Optional color based on lives
    </mesh>
  );
};

export default Enemy;