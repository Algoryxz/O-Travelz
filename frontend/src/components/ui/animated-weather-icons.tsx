import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface AnimatedIconProps {
  size?: number;
  className?: string;
  color?: string;
}

// 1. Sun Icon — Living Solar micro-scene: rotating rays + breathing core
export const AnimatedSun: React.FC<AnimatedIconProps> = ({ size = 48, className = "" }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      data-testid="animated-weather-icon-sun"
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Animated Sun"
    >
      {/* Rotating Sun Rays */}
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={shouldReduceMotion ? {} : { rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      >
        <g stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round">
          {/* 8 radiating rays */}
          <line x1="24" y1="4" x2="24" y2="9" />
          <line x1="24" y1="39" x2="24" y2="44" />
          <line x1="4" y1="24" x2="9" y2="24" />
          <line x1="39" y1="24" x2="44" y2="24" />
          <line x1="9.86" y1="9.86" x2="13.39" y2="13.39" />
          <line x1="34.61" y1="34.61" x2="38.14" y2="38.14" />
          <line x1="9.86" y1="38.14" x2="13.39" y2="34.61" />
          <line x1="34.61" y1="13.39" x2="38.14" y2="9.86" />
        </g>
      </motion.svg>

      {/* Breathing Sun Core with warm gradient */}
      <motion.div
        animate={shouldReduceMotion ? {} : { scale: [1, 1.08, 1], opacity: [0.95, 1, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-1/2 h-1/2 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 shadow-[0_0_16px_rgba(245,158,11,0.6)]"
      />
    </div>
  );
};

// 2. Partly Cloudy Icon — Sun rotating behind a floating cloud
export const AnimatedPartlyCloudy: React.FC<AnimatedIconProps> = ({ size = 48, className = "" }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      data-testid="animated-weather-icon-partly-cloudy"
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Animated Partly Cloudy"
    >
      {/* Sun peaking behind cloud */}
      <motion.div
        animate={shouldReduceMotion ? {} : { rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        className="absolute top-1 right-1.5 w-6 h-6"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <circle cx="12" cy="12" r="6" fill="#F59E0B" />
          <g stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="2" x2="12" y2="4.5" />
            <line x1="12" y1="19.5" x2="12" y2="22" />
            <line x1="2" y1="12" x2="4.5" y2="12" />
            <line x1="19.5" y1="12" x2="22" y2="12" />
          </g>
        </svg>
      </motion.div>

      {/* Floating Cloud */}
      <motion.svg
        width={size * 0.85}
        height={size * 0.85}
        viewBox="0 0 36 36"
        fill="none"
        animate={shouldReduceMotion ? {} : { y: [-1.5, 1.5, -1.5], x: [-1, 1, -1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 drop-shadow-md"
      >
        <path
          d="M10 24C7.79 24 6 22.21 6 20C6 17.96 7.53 16.28 9.53 16.03C10.15 12.63 13.11 10 16.7 10C20.69 10 23.95 13.06 24.32 17C26.39 17.27 28 19.04 28 21.2C28 23.63 26.03 25.6 23.6 25.6H10.5"
          fill="url(#partlyCloudGrad)"
          stroke="#38BDF8"
          strokeWidth="1.5"
        />
        <defs>
          <linearGradient id="partlyCloudGrad" x1="6" y1="10" x2="28" y2="25.6" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" stopOpacity="0.8" />
            <stop offset="1" stopColor="#0F766E" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </motion.svg>
    </div>
  );
};

// 3. Cloudy Icon — Living Drifting Cloud
export const AnimatedCloud: React.FC<AnimatedIconProps> = ({ size = 48, className = "" }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      data-testid="animated-weather-icon-cloud"
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Animated Cloud"
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        animate={shouldReduceMotion ? {} : { y: [-2, 2, -2], x: [-2, 2, -2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M14 32C10.69 32 8 29.31 8 26C8 22.94 10.3 20.42 13.3 20.04C14.23 14.94 18.66 11 24 11C29.99 11 34.88 15.59 35.48 21.5C38.58 21.91 41 24.56 41 27.8C41 31.45 38.05 34.4 34.4 34.4H14.5"
          fill="url(#cloudGrad)"
          stroke="#94A3B8"
          strokeWidth="2"
        />
        <defs>
          <linearGradient id="cloudGrad" x1="8" y1="11" x2="41" y2="34.4" gradientUnits="userSpaceOnUse">
            <stop stopColor="#64748B" />
            <stop offset="1" stopColor="#334155" />
          </linearGradient>
        </defs>
      </motion.svg>
    </div>
  );
};

// 4. Rain Icon — Cloud with falling staggered raindrops
export const AnimatedRain: React.FC<AnimatedIconProps> = ({ size = 48, className = "" }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      data-testid="animated-weather-icon-rain"
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Animated Rain"
    >
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="overflow-visible">
        {/* Cloud Body */}
        <motion.path
          d="M14 24C11.24 24 9 21.76 9 19C9 16.45 10.91 14.35 13.42 14.04C14.19 9.79 17.89 6.5 22.33 6.5C27.32 6.5 31.4 10.33 31.9 15.25C34.49 15.59 36.5 17.8 36.5 20.5C36.5 23.54 34.04 26 31 26H14.5"
          fill="#1E293B"
          stroke="#38BDF8"
          strokeWidth="1.8"
          animate={shouldReduceMotion ? {} : { y: [-1, 1, -1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Falling Raindrops */}
        {[
          { x: 16, delay: 0 },
          { x: 23, delay: 0.4 },
          { x: 30, delay: 0.2 },
        ].map((drop, i) => (
          <motion.line
            key={i}
            x1={drop.x}
            y1="28"
            x2={drop.x - 3}
            y2="37"
            stroke="#06B6D4"
            strokeWidth="2.2"
            strokeLinecap="round"
            initial={{ opacity: 0, y: 0 }}
            animate={
              shouldReduceMotion
                ? { opacity: 0.8 }
                : {
                    opacity: [0, 1, 0],
                    y: [0, 8],
                  }
            }
            transition={{
              duration: 1.1,
              repeat: Infinity,
              delay: drop.delay,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

// 5. Heavy Rain Icon — Dark storm cloud with fast torrential rain lines
export const AnimatedHeavyRain: React.FC<AnimatedIconProps> = ({ size = 48, className = "" }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      data-testid="animated-weather-icon-heavy-rain"
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Animated Heavy Rain"
    >
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="overflow-visible">
        {/* Darker Storm Cloud */}
        <motion.path
          d="M13 24C10.24 24 8 21.76 8 19C8 16.45 9.91 14.35 12.42 14.04C13.19 9.79 16.89 6.5 21.33 6.5C26.32 6.5 30.4 10.33 30.9 15.25C33.49 15.59 35.5 17.8 35.5 20.5C35.5 23.54 33.04 26 30 26H13.5"
          fill="#0F172A"
          stroke="#0284C7"
          strokeWidth="2"
        />

        {/* 5 Fast Staggered Downpour Streams */}
        {[
          { x: 13, delay: 0 },
          { x: 18, delay: 0.25 },
          { x: 23, delay: 0.1 },
          { x: 28, delay: 0.35 },
          { x: 33, delay: 0.15 },
        ].map((drop, i) => (
          <motion.line
            key={i}
            x1={drop.x}
            y1="27"
            x2={drop.x - 4}
            y2="39"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ opacity: 0, y: 0 }}
            animate={
              shouldReduceMotion
                ? { opacity: 0.9 }
                : {
                    opacity: [0, 1, 1, 0],
                    y: [0, 10],
                  }
            }
            transition={{
              duration: 0.7,
              repeat: Infinity,
              delay: drop.delay,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

// 6. Thunderstorm Icon — Storm cloud with randomly flashing lightning bolt & rain
export const AnimatedThunderstorm: React.FC<AnimatedIconProps> = ({ size = 48, className = "" }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      data-testid="animated-weather-icon-thunderstorm"
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Animated Thunderstorm"
    >
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="overflow-visible">
        {/* Dark Purple-Slate Cloud */}
        <path
          d="M13 23C10.24 23 8 20.76 8 18C8 15.45 9.91 13.35 12.42 13.04C13.19 8.79 16.89 5.5 21.33 5.5C26.32 5.5 30.4 9.33 30.9 14.25C33.49 14.59 35.5 16.8 35.5 19.5C35.5 22.54 33.04 25 30 25H13.5"
          fill="#1E1338"
          stroke="#A855F7"
          strokeWidth="2"
        />

        {/* Flashing Lightning Bolt */}
        <motion.path
          d="M24 21L19 31H24L22 41L30 29H25L27 21H24Z"
          fill="#FACC15"
          stroke="#EAB308"
          strokeWidth="1.5"
          strokeLinejoin="round"
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : {
                  opacity: [0.1, 1, 0.2, 1, 0.1, 0.1, 0.9, 0.1],
                  scale: [0.95, 1.05, 0.95, 1.05, 1, 1, 1.02, 1],
                }
          }
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Background Rain Lines */}
        <line x1="12" y1="27" x2="9" y2="35" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="33" y1="27" x2="30" y2="35" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </svg>
    </div>
  );
};

// 7. Fog / Mist Icon — Horizontal floating bars with breathing opacity
export const AnimatedFog: React.FC<AnimatedIconProps> = ({ size = 48, className = "" }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      data-testid="animated-weather-icon-fog"
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Animated Fog"
    >
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        {[
          { y: 14, x1: 10, x2: 38, delay: 0, dur: 3.5 },
          { y: 22, x1: 6, x2: 42, delay: 0.8, dur: 4.2 },
          { y: 30, x1: 12, x2: 36, delay: 0.4, dur: 3.8 },
          { y: 37, x1: 16, x2: 32, delay: 1.2, dur: 4.0 },
        ].map((bar, i) => (
          <motion.line
            key={i}
            x1={bar.x1}
            y1={bar.y}
            x2={bar.x2}
            y2={bar.y}
            stroke="#94A3B8"
            strokeWidth="3"
            strokeLinecap="round"
            animate={
              shouldReduceMotion
                ? { opacity: 0.8 }
                : {
                    x: [-3, 3, -3],
                    opacity: [0.4, 0.9, 0.4],
                  }
            }
            transition={{
              duration: bar.dur,
              repeat: Infinity,
              delay: bar.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

// 8. Haze Icon — Atmospheric warm particles and floating dust lines
export const AnimatedHaze: React.FC<AnimatedIconProps> = ({ size = 48, className = "" }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      data-testid="animated-weather-icon-haze"
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Animated Haze"
    >
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        {/* Dim Sun Disk */}
        <circle cx="24" cy="18" r="8" fill="#D97706" opacity="0.75" />
        {[
          { y: 26, x1: 8, x2: 40, delay: 0 },
          { y: 32, x1: 12, x2: 36, delay: 0.5 },
          { y: 38, x1: 16, x2: 32, delay: 1.0 },
        ].map((bar, i) => (
          <motion.line
            key={i}
            x1={bar.x1}
            y1={bar.y}
            x2={bar.x2}
            y2={bar.y}
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={
              shouldReduceMotion
                ? { opacity: 0.7 }
                : {
                    x: [-2, 2, -2],
                    opacity: [0.5, 0.9, 0.5],
                  }
            }
            transition={{ duration: 4, repeat: Infinity, delay: bar.delay, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </div>
  );
};

// 9. Snow Icon — Cloud with drifting and rotating snowflakes
export const AnimatedSnow: React.FC<AnimatedIconProps> = ({ size = 48, className = "" }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      data-testid="animated-weather-icon-snow"
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Animated Snow"
    >
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="overflow-visible">
        {/* Cloud Body */}
        <path
          d="M14 22C11.24 22 9 19.76 9 17C9 14.45 10.91 12.35 13.42 12.04C14.19 7.79 17.89 4.5 22.33 4.5C27.32 4.5 31.4 8.33 31.9 13.25C34.49 13.59 36.5 15.8 36.5 18.5C36.5 21.54 34.04 24 31 24H14.5"
          fill="#1E293B"
          stroke="#E0F2FE"
          strokeWidth="1.8"
        />

        {/* 3 Drifting Snowflakes */}
        {[
          { cx: 16, cy: 30, delay: 0 },
          { cx: 24, cy: 35, delay: 0.6 },
          { cx: 32, cy: 31, delay: 0.3 },
        ].map((flake, i) => (
          <motion.g
            key={i}
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: [-2, 4, -2],
                    rotate: 360,
                    opacity: [0.6, 1, 0.6],
                  }
            }
            transition={{
              duration: 3.5,
              repeat: Infinity,
              delay: flake.delay,
              ease: "easeInOut",
            }}
          >
            <circle cx={flake.cx} cy={flake.cy} r="2.5" fill="#E0F2FE" />
          </motion.g>
        ))}
      </svg>
    </div>
  );
};

// 10. Default / Unknown Fallback Icon
export const AnimatedWeatherDefault: React.FC<AnimatedIconProps> = ({ size = 48, className = "" }) => {
  return (
    <div
      data-testid="animated-weather-icon-default"
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Default Weather"
    >
      <div className="w-8 h-8 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-black text-xs">
        🌤️
      </div>
    </div>
  );
};
