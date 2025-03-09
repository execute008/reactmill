import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerProps {
  position: THREE.Vector3;
}

const Player: React.FC<PlayerProps> = ({ position }) => {
  const ref = React.useRef<THREE.Mesh>(null!);

  useFrame(() => {
    ref.current.position.copy(position);
  });

  return (
    <mesh ref={ref} position={position}>
      <coneGeometry args={[0.5, 1, 4]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
};

export default Player;