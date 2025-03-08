import React, { useState, useEffect, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import tw from "tailwind-styled-components";
import Player from "./Player";
import Enemy, { EnemyType } from "./Enemy";
import Projectile from "./Projectile";
import "../extendThree";
import Explosion from "./Explosion";

const ScoreContainer = tw.div`
  absolute top-5 left-5 bg-teal-950 p-3 rounded-3xl shadow-teal-400 shadow-inner text-teal-300 uppercase font-black text-4xl
`;

const Game: React.FC = () => {
  const [projectiles, setProjectiles] = useState<
    { id: number; position: THREE.Vector3 }[]
  >([]);
  const [enemies, setEnemies] = useState<
    EnemyType[]
  >([]);
  const [score, setScore] = useState(0);
  const [explosions, setExplosions] = useState<{ id: number; position: any }[]>(
    []
  );
  const playerRef = useRef<THREE.Vector3>(new THREE.Vector3(0, -3, 0));
  const shootIntervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const checkCollisions = useCallback(() => {
    setProjectiles((currentProjectiles) => {
      setEnemies((currentEnemies) => {
        const newEnemies = [...currentEnemies];

        currentProjectiles.forEach((projectile) => {
          currentEnemies.forEach((enemy, index) => {
            const distance = projectile.position.distanceTo(enemy.position);
            if (distance < 1) {
              removeProjectile(projectile.id);
              if (enemy.lives > 1) {
                newEnemies[index] = { ...enemy, lives: enemy.lives - 1 };
              } else {
                setScore((prev) => prev + 10);
                removeEnemy(enemy)
              }
            }
          });
        });

        return newEnemies;
      });
      return currentProjectiles.filter(
        (projectile) => !projectile.position.equals(new THREE.Vector3(0, 0, 0))
      );
    });
  }, []);

  const addExplosion = (position: THREE.Vector3): void => {
    setExplosions((prev) => [...prev, { id: Math.random(), position }]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < random; i++) {
        addEnemy();
      }
    }, calculateSpawnInterval());
    return () => clearInterval(interval);
  }, [score]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkCollisions();
    }, 100); // Überprüft Kollisionen alle 100ms
    return () => clearInterval(interval);
  }, [checkCollisions]);

  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    const disableScroll = () => {
      document.body.style.overflow = "hidden";
      document.addEventListener("touchmove", preventDefault, {
        passive: false,
      });
      document.addEventListener("touchstart", preventDefault, {
        passive: false,
      });
      document.addEventListener("scroll", preventDefault, { passive: false });
    };

    const enableScroll = () => {
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", preventDefault);
      document.removeEventListener("touchstart", preventDefault);
      document.removeEventListener("scroll", preventDefault);
    };

    disableScroll();

    return () => {
      enableScroll();
    };
  }, []);

  useEffect(() => {
    if (shootIntervalRef.current) {
      clearInterval(shootIntervalRef.current);
      startShooting();
    }
  }, [score]);

  const handleShoot = (position: THREE.Vector3) => {
    setProjectiles((prev) => [
      ...prev,
      { id: Math.random(), position: position.clone() },
    ]);
  };

  const removeProjectile = (id: number) => {
    setProjectiles((prev) => prev.filter((projectile) => projectile.id !== id));
  };

  const addEnemy = () => {
    if (canvasRef.current) {
      const canvasWidth = canvasRef.current.clientWidth;
      const canvasHeight = canvasRef.current.clientHeight;
      const visibleWidth = (canvasWidth / window.innerWidth) * 10 - 5;
      const visibleHeight = (canvasHeight / window.innerHeight) * 10 - 5;
      const x = Math.random() * (visibleWidth) - 0.4 * visibleWidth;
      const y = (Math.random() * 0.5 + 0.5) * 20;
      const z = Math.random() * (visibleHeight) - 0.4 * visibleHeight;
      setEnemies((prev) => [
        ...prev,
        { id: Math.random(), position: new THREE.Vector3(x, y, z), lives: 3 },
      ]);
    }
  };

  const removeEnemy = (enemy: EnemyType) => {
    addExplosion(enemy.position);
    setEnemies((prev) => prev.filter((e) => e.id !== enemy.id ));
  };

  const calculateSpeed = () => {
    return 0.01 + Math.log(score + 1) / 100;
  };

  const calculateSpawnInterval = () => {
    return 2000 / (1 + Math.log(score + 1) / 5);
  };

  const calculateFireRate = () => {
    const fireRate = Math.max(300, 500 - Math.log(score + 1) * 50);
    console.log(`Fire rate: ${fireRate}ms`);
    return fireRate;
  };

  const startShooting = () => {
    const fireRate = calculateFireRate();
    shootIntervalRef.current = window.setInterval(() => {
      handleShoot(playerRef.current.clone());
    }, fireRate);
  };

  const stopShooting = () => {
    if (shootIntervalRef.current) {
      clearInterval(shootIntervalRef.current);
      shootIntervalRef.current = null;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const x = (e.clientX / window.innerWidth) * 10 - 5;
    const z = (e.clientY / window.innerHeight) * 10 - 5;
    playerRef.current.x = x;
    playerRef.current.z = -z;
    startShooting();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (shootIntervalRef.current) {
      const x = (e.clientX / window.innerWidth) * 10 - 5;
      const z = (e.clientY / window.innerHeight) * 10 - 5;
      playerRef.current.x = x;
      playerRef.current.z = -z;
    }
  };

  const handlePointerUp = () => {
    stopShooting();
  };

  return (
    <>
      <Canvas
        ref={canvasRef}
        className="h-screen bg-black"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        camera={{ fov: 105, position: [0, -10, 0] }}
      >
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Player position={playerRef.current} />
        {enemies.map((enemy) => (
          <Enemy
            key={enemy.id}
            position={enemy.position}
            playerPosition={playerRef.current}
            onRemove={() => removeEnemy(enemy)}
            speed={calculateSpeed()}
            lives={enemy.lives}
          />
        ))}
        {projectiles.map((projectile) => (
          <Projectile
            key={projectile.id}
            position={projectile.position}
            onRemove={() => removeProjectile(projectile.id)}
          />
        ))}
        {explosions.map((explosion) => (
          <Explosion key={explosion.id} position={explosion.position} />
        ))}
      </Canvas>
      <ScoreContainer>Score: {score}</ScoreContainer>
    </>
  );
};

export default Game;
