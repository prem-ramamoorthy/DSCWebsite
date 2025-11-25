import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './FlyingBats.module.css';

function FlyingBats({ count = 5, isHomePage = false }) {
  const [bats, setBats] = useState([]);
  const batsRef = useRef([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile for performance optimization
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    // Generate random bat configurations with varied paths
    // Distribute bats across the full visible height
    const generatedBats = Array.from({ length: count }, (_, index) => ({
      id: `bat-${index}-${Math.random()}`,
      startX: Math.random() * -10 - 5, // Start from -15vw to -5vw (offscreen left)
      startY: Math.random() * 80 + 10, // Distribute from 10vh to 90vh (full viewport)
      duration: isMobile ? Math.random() * 8 + 6 : Math.random() * 10 + 8, // Faster on mobile
      delay: Math.random() * 6,
      size: Math.random() * 0.4 + 0.5, // 0.5-0.9x size
      pathType: Math.floor(Math.random() * 4), // 0-3 for different paths
    }));
    setBats(generatedBats);
  }, [count, isMobile]);

  // GSAP animations for each bat
  useEffect(() => {
    if (bats.length === 0) {
      return undefined;
    }

    const animations = [];

    bats.forEach((bat, index) => {
      const batElement = batsRef.current[index];
      if (!batElement) {
        return;
      }

      // Set initial position
      gsap.set(batElement, {
        x: `${bat.startX}vw`,
        y: `${bat.startY}vh`,
        scale: bat.size,
        force3D: true, // GPU acceleration
      });

      // Get path coordinates based on pathType - using relative offsets from start position
      const paths = [
        // Path 1: Wave pattern
        [
          { x: '+=20vw', y: '-=15vh' },
          { x: '+=20vw', y: '+=25vh' },
          { x: '+=20vw', y: '-=10vh' },
          { x: '+=20vw', y: '+=15vh' },
          { x: '+=30vw', y: '-=5vh' },
        ],
        // Path 2: Zigzag
        [
          { x: '+=15vw', y: '+=20vh' },
          { x: '+=20vw', y: '-=35vh' },
          { x: '+=20vw', y: '+=40vh' },
          { x: '+=20vw', y: '-=25vh' },
          { x: '+=35vw', y: '+=15vh' },
        ],
        // Path 3: Smooth curve
        [
          { x: '+=25vw', y: '+=10vh' },
          { x: '+=25vw', y: '-=30vh' },
          { x: '+=25vw', y: '+=35vh' },
          { x: '+=35vw', y: '-=20vh' },
        ],
        // Path 4: Steep dive
        [
          { x: '+=30vw', y: '-=20vh' },
          { x: '+=20vw', y: '+=45vh' },
          { x: '+=20vw', y: '-=30vh' },
          { x: '+=40vw', y: '+=20vh' },
        ],
      ];

      const pathCoords = paths[bat.pathType];

      // Create motion path animation with GSAP
      const tl = gsap.timeline({
        delay: bat.delay,
        repeat: -1,
        repeatDelay: 2,
      });

      // Animate through path coordinates
      pathCoords.forEach((coord, i) => {
        tl.to(
          batElement,
          {
            x: coord.x,
            y: coord.y,
            duration: bat.duration / pathCoords.length,
            ease: 'sine.inOut',
            force3D: true,
          },
          i === 0 ? 0 : '>'
        );
      });

      // Wing flapping animation (simpler on mobile)
      const leftWing = batElement.querySelector('[data-wing="left"]');
      const rightWing = batElement.querySelector('[data-wing="right"]');

      if (leftWing && rightWing) {
        const flapSpeed = isMobile ? 0.15 : 0.12;

        gsap.to(leftWing, {
          rotateY: -75,
          duration: flapSpeed,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          force3D: true,
        });

        gsap.to(rightWing, {
          rotateY: 75,
          duration: flapSpeed,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          force3D: true,
        });
      }

      animations.push(tl);
    });

    // Cleanup
    return () => {
      animations.forEach((anim) => anim.kill());
    };
  }, [bats, isMobile]);

  return (
    <div
      className={`${styles.batsContainer} ${isHomePage ? styles.homePage : ''}`}
    >
      {bats.map((bat, index) => (
        <div
          key={bat.id}
          ref={(el) => {
            batsRef.current[index] = el;
          }}
          className={styles.bat}
        >
          <div className={styles.batBody}>
            <div className={styles.batWing} data-wing="left" />
            <div className={styles.batHead} />
            <div className={styles.batWing} data-wing="right" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default FlyingBats;
