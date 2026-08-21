import React from "react";
import type { NormalizedWeatherCondition } from "../../utils/weatherNormalizer";
import {
  AnimatedSun,
  AnimatedPartlyCloudy,
  AnimatedCloud,
  AnimatedRain,
  AnimatedHeavyRain,
  AnimatedThunderstorm,
  AnimatedFog,
  AnimatedHaze,
  AnimatedSnow,
  AnimatedMoon,
  AnimatedPartlyCloudyNight,
  AnimatedCloudNight,
  AnimatedRainNight,
  AnimatedThunderstormNight,
  AnimatedWeatherDefault,
} from "../ui/animated-weather-icons";

export interface AnimatedWeatherIconProps {
  condition: NormalizedWeatherCondition;
  isDay?: boolean;
  size?: number;
  className?: string;
  ariaLabel?: string;
}

export const AnimatedWeatherIcon: React.FC<AnimatedWeatherIconProps> = ({
  condition,
  isDay = true,
  size = 48,
  className = "",
  ariaLabel,
}) => {
  const label = ariaLabel || `Weather condition: ${condition} (${isDay ? "day" : "night"})`;

  if (!isDay) {
    switch (condition) {
      case "clear":
        return <AnimatedMoon size={size} className={className} />;
      case "partly_cloudy":
        return <AnimatedPartlyCloudyNight size={size} className={className} />;
      case "cloudy":
        return <AnimatedCloudNight size={size} className={className} />;
      case "rain":
        return <AnimatedRainNight size={size} className={className} />;
      case "heavy_rain":
        return <AnimatedRainNight size={size} className={className} />;
      case "thunderstorm":
        return <AnimatedThunderstormNight size={size} className={className} />;
      case "fog":
        return <AnimatedFog size={size} className={className} />;
      case "haze":
        return <AnimatedHaze size={size} className={className} />;
      case "snow":
        return <AnimatedSnow size={size} className={className} />;
      case "unknown":
      default:
        return <AnimatedMoon size={size} className={className} />;
    }
  }

  switch (condition) {
    case "clear":
      return <AnimatedSun size={size} className={className} />;
    case "partly_cloudy":
      return <AnimatedPartlyCloudy size={size} className={className} />;
    case "cloudy":
      return <AnimatedCloud size={size} className={className} />;
    case "rain":
      return <AnimatedRain size={size} className={className} />;
    case "heavy_rain":
      return <AnimatedHeavyRain size={size} className={className} />;
    case "thunderstorm":
      return <AnimatedThunderstorm size={size} className={className} />;
    case "fog":
      return <AnimatedFog size={size} className={className} />;
    case "haze":
      return <AnimatedHaze size={size} className={className} />;
    case "snow":
      return <AnimatedSnow size={size} className={className} />;
    case "unknown":
    default:
      return <AnimatedWeatherDefault size={size} className={className} />;
  }
};
