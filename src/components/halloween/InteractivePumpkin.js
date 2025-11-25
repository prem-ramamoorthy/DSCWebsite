import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import styles from './InteractivePumpkin.module.css';

function InteractivePumpkin({
  position = { top: '60%', left: '85%' },
  size = 'medium',
}) {
  const [isExploding, setIsExploding] = useState(false);
  const [burstBats, setBurstBats] = useState([]);
  const burstBatsRef = useRef([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile for performance optimization
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const handleClick = () => {
    if (isExploding) return; // Prevent multiple clicks

    setIsExploding(true);

    // Generate burst bats (fewer on mobile for performance)
    const batCount = isMobile ? 10 : 15;
    const timestamp = Date.now();
    const bats = Array.from({ length: batCount }, (_, i) => ({
      id: `burst-${timestamp}-${i}`,
      angle: (Math.PI * 2 * i) / batCount,
      distance: isMobile
        ? Math.random() * 200 + 150
        : Math.random() * 300 + 200,
      duration: isMobile ? Math.random() * 1.5 + 1.5 : Math.random() * 2 + 2,
      rotation: Math.random() * 360,
    }));

    setBurstBats(bats);

    // Animate burst bats with GSAP
    setTimeout(() => {
      bats.forEach((bat, index) => {
        const batElement = burstBatsRef.current[index];
        if (!batElement) return;

        const endX = Math.cos(bat.angle) * bat.distance;
        const endY = Math.sin(bat.angle) * bat.distance;

        // Create burst animation timeline
        const tl = gsap.timeline({
          onComplete: () => {
            if (index === bats.length - 1) {
              // Last bat animation complete
              setTimeout(() => {
                setIsExploding(false);
                setBurstBats([]);
              }, 200);
            }
          },
        });

        tl.fromTo(
          batElement,
          {
            x: 0,
            y: 0,
            scale: 0.3,
            rotation: 0,
            opacity: 1,
            force3D: true,
          },
          {
            x: endX,
            y: endY,
            scale: 0.8,
            rotation: bat.rotation,
            opacity: 0,
            duration: bat.duration,
            ease: 'power2.out',
            force3D: true,
          }
        );

        // Wing flapping during burst
        const wings = batElement.querySelectorAll(`.${styles.burstBatWing}`);
        wings.forEach((wing, wingIndex) => {
          gsap.to(wing, {
            scaleX: wingIndex === 0 ? 0.7 : 1.3,
            duration: 0.1,
            repeat: Math.floor(bat.duration / 0.2),
            yoyo: true,
            ease: 'sine.inOut',
            force3D: true,
          });
        });
      });
    }, 50);
  };

  return (
    <>
      <div
        className={`${styles.pumpkinContainer} ${styles[size]} ${
          isExploding ? styles.exploding : ''
        }`}
        style={{
          position: 'absolute',
          top: position.top,
          left: position.left,
          zIndex: 2,
        }}
        onClick={handleClick}
      >
        {/* Pumpkin glow */}
        <div className={styles.pumpkinGlow} />

        {/* Pumpkin body */}
        <div className={styles.pumpkin}>
          <div className={styles.pumpkinSegment} />
          <div className={styles.pumpkinSegment} />
          <div className={styles.pumpkinSegment} />
          <div className={styles.pumpkinSegment} />
          <div className={styles.pumpkinSegment} />

          {/* Stem */}
          <div className={styles.stem} />

          {/* Face */}
          <div className={styles.face}>
            <div className={styles.eye} data-eye="left" />
            <div className={styles.eye} data-eye="right" />
            <div className={styles.nose} />
            <div className={styles.mouth}>
              <div className={styles.tooth} />
              <div className={styles.tooth} />
              <div className={styles.tooth} />
            </div>
          </div>
        </div>
      </div>

      {/* Burst bats */}
      {isExploding && (
        <div className={styles.burstContainer}>
          {burstBats.map((bat, index) => (
            <div
              key={bat.id}
              ref={(el) => {
                burstBatsRef.current[index] = el;
              }}
              className={styles.burstBat}
              style={{
                left: position.left,
                top: position.top,
              }}
            >
              <div className={styles.burstBatBody}>
                <div className={styles.burstBatWing} />
                <div className={styles.burstBatWing} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default InteractivePumpkin;
