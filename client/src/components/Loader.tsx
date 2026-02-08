import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  onComplete: () => void;
}

const morphTexts = ['Discipline', 'Commit', 'Advance', 'Budding Mariners'];

export default function Loader({ onComplete }: LoaderProps) {
  const completedRef = useRef(false);
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Gooey morph animation
  useEffect(() => {
    const morphTime = 1.2;
    const cooldownTime = 0.5;

    let textIndex = morphTexts.length - 1;
    let time = new Date();
    let morph = 0;
    let cooldown = cooldownTime;
    let animationId: number;

    const setMorph = (fraction: number) => {
      if (text1Ref.current && text2Ref.current) {
        text2Ref.current.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
        text2Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

        const f = 1 - fraction;
        text1Ref.current.style.filter = `blur(${Math.min(8 / f - 8, 100)}px)`;
        text1Ref.current.style.opacity = `${Math.pow(f, 0.4) * 100}%`;
      }
    };

    const doCooldown = () => {
      morph = 0;
      if (text1Ref.current && text2Ref.current) {
        text2Ref.current.style.filter = '';
        text2Ref.current.style.opacity = '100%';
        text1Ref.current.style.filter = '';
        text1Ref.current.style.opacity = '0%';
      }
    };

    const doMorph = () => {
      morph -= cooldown;
      cooldown = 0;
      let fraction = morph / morphTime;

      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }

      setMorph(fraction);
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const newTime = new Date();
      const shouldIncrementIndex = cooldown > 0;
      const dt = (newTime.getTime() - time.getTime()) / 1000;
      time = newTime;

      cooldown -= dt;

      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          textIndex = (textIndex + 1) % morphTexts.length;
          if (text1Ref.current && text2Ref.current) {
            text1Ref.current.textContent = morphTexts[textIndex % morphTexts.length];
            text2Ref.current.textContent = morphTexts[(textIndex + 1) % morphTexts.length];
          }
        }
        doMorph();
      } else {
        doCooldown();
      }
    };

    // Initialize texts
    if (text1Ref.current && text2Ref.current) {
      text1Ref.current.textContent = morphTexts[morphTexts.length - 1];
      text2Ref.current.textContent = morphTexts[0];
    }

    setIsReady(true);
    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Complete timer
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, 4000); // Increased duration slightly to accommodate longer text

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundColor: '#0a0a0a',
        zIndex: 99999,
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Subtle glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, transparent 60%)', // Adjusted to yellow-400
          filter: 'blur(80px)',
        }}
      />

      {/* SVG Filter for gooey effect */}
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter id="gooey-filter">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>

      <div className="relative z-10 flex flex-col items-center px-4 w-full max-w-4xl">
        {/* Gooey Morphing Text */}
        <motion.div
          className="relative h-24 md:h-32 flex items-center justify-center w-full"
          style={{ filter: 'url(#gooey-filter)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isReady ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <span
            ref={text1Ref}
            className="absolute text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-center w-full"
            style={{
              fontFamily: '"Space Grotesk", system-ui, sans-serif',
              color: '#fbbf24', // yellow-400
            }}
          />
          <span
            ref={text2Ref}
            className="absolute text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-center w-full"
            style={{
              fontFamily: '"Space Grotesk", system-ui, sans-serif',
              color: '#fbbf24', // yellow-400
            }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="mt-6 text-neutral-500 text-base md:text-lg tracking-wide text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Budding Mariners • Academy
        </motion.p>

        {/* Progress bar */}
        <motion.div
          className="mt-10 w-64 h-[2px] bg-neutral-800 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: '#fbbf24' }} // yellow-400
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3.2, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
