/**
 * O-Travelz Centralized Weather Normalization & Adaptive Visual Configuration Layer
 * 
 * Normalizes Open-Meteo WMO weather codes and heterogeneous provider condition strings
 * into deterministic NormalizedWeatherCondition keys and condition-specific visual themes.
 */

export type NormalizedWeatherCondition =
  | "clear"
  | "partly_cloudy"
  | "cloudy"
  | "rain"
  | "heavy_rain"
  | "thunderstorm"
  | "fog"
  | "haze"
  | "snow"
  | "unknown";

export interface WeatherVisualTheme {
  condition: NormalizedWeatherCondition;
  displayName: string;
  accentColor: string;       // Primary hex accent (e.g. #F59E0B)
  secondaryAccent: string;   // Secondary accent (e.g. #D97706)
  cardBorderClass: string;   // Tailwind border class
  cardBgGradient: string;    // Subtle dark surface gradient
  badgeBg: string;           // Badge background style
  badgeText: string;         // Badge text style
  glowColor: string;         // Radial glow color
  defaultAdvice: string;     // Default curated travel advice
  iconType: "sun" | "partly_cloudy" | "cloud" | "rain" | "heavy_rain" | "thunderstorm" | "fog" | "haze" | "snow" | "unknown";
  ariaLabel: string;
}

/**
 * Maps WMO code or condition string to deterministic NormalizedWeatherCondition
 */
export function normalizeWeatherCondition(
  condition?: string | null,
  conditionCode?: number | null,
  status?: string | null
): NormalizedWeatherCondition {
  if (status === "unavailable") {
    return "unknown";
  }

  // 1. Try WMO weather code if provided
  if (conditionCode != null && !Number.isNaN(conditionCode)) {
    if (conditionCode === 0 || conditionCode === 1) return "clear";
    if (conditionCode === 2) return "partly_cloudy";
    if (conditionCode === 3) return "cloudy";
    if (conditionCode === 45 || conditionCode === 48) return "fog";
    if (conditionCode >= 51 && conditionCode <= 55) return "rain";
    if (conditionCode === 56 || conditionCode === 57) return "snow";
    if (conditionCode === 61 || conditionCode === 63) return "rain";
    if (conditionCode === 65) return "heavy_rain";
    if (conditionCode === 66 || conditionCode === 67) return "rain";
    if (conditionCode >= 71 && conditionCode <= 77) return "snow";
    if (conditionCode === 80 || conditionCode === 81) return "rain";
    if (conditionCode === 82) return "heavy_rain";
    if (conditionCode === 85 || conditionCode === 86) return "snow";
    if (conditionCode >= 95 && conditionCode <= 99) return "thunderstorm";
  }

  // 2. Normalize text string
  if (!condition || typeof condition !== "string") {
    return "unknown";
  }

  const text = condition.trim().toLowerCase();
  if (!text || text === "unknown" || text === "unavailable" || text === "n/a") {
    return "unknown";
  }

  // Thunderstorm / Lightning
  if (text.includes("thunder") || text.includes("lightning") || text.includes("storm") || text.includes("squall")) {
    return "thunderstorm";
  }

  // Heavy Rain / Monsoon / Downpour
  if (
    text.includes("heavy rain") ||
    text.includes("torrential") ||
    text.includes("downpour") ||
    text.includes("violent rain") ||
    text.includes("monsoon") ||
    text.includes("heavy shower")
  ) {
    return "heavy_rain";
  }

  // Regular Rain / Drizzle / Showers
  if (
    text.includes("rain") ||
    text.includes("drizzle") ||
    text.includes("shower") ||
    text.includes("precipitation")
  ) {
    return "rain";
  }

  // Snow / Sleet / Hail
  if (text.includes("snow") || text.includes("blizzard") || text.includes("sleet") || text.includes("hail") || text.includes("flurries")) {
    return "snow";
  }

  // Fog / Mist
  if (text.includes("fog") || text.includes("mist")) {
    return "fog";
  }

  // Haze / Smoke / Dust
  if (text.includes("haze") || text.includes("hazy") || text.includes("smoke") || text.includes("dust") || text.includes("smog")) {
    return "haze";
  }

  // Cloudy / Overcast
  if (text.includes("overcast") || text === "cloudy" || text.includes("mostly cloudy")) {
    return "cloudy";
  }

  // Partly Cloudy / Scattered
  if (text.includes("partly") || text.includes("scattered") || text.includes("broken") || text.includes("few clouds")) {
    return "partly_cloudy";
  }

  // Clear / Sunny / Pleasant
  if (text.includes("clear") || text.includes("sun") || text.includes("fine") || text.includes("pleasant") || text.includes("fair")) {
    return "clear";
  }

  return "unknown";
}

/**
 * Returns complete visual styling tokens for a given normalized weather condition
 */
export function getWeatherVisualTheme(condition: NormalizedWeatherCondition): WeatherVisualTheme {
  switch (condition) {
    case "clear":
      return {
        condition: "clear",
        displayName: "Clear & Sunny",
        accentColor: "#F59E0B",
        secondaryAccent: "#D97706",
        cardBorderClass: "border-amber-500/30 hover:border-amber-500/50",
        cardBgGradient: "from-[#171e2e] via-[#111827] to-[#1a1c24]",
        badgeBg: "bg-amber-500/15 border border-amber-500/30",
        badgeText: "text-amber-300",
        glowColor: "rgba(245, 158, 11, 0.15)",
        defaultAdvice: "Ideal weather for outdoor temple heritage walks and beach exploration.",
        iconType: "sun",
        ariaLabel: "Clear and sunny weather condition",
      };

    case "partly_cloudy":
      return {
        condition: "partly_cloudy",
        displayName: "Partly Cloudy",
        accentColor: "#38BDF8",
        secondaryAccent: "#14B8A6",
        cardBorderClass: "border-sky-500/30 hover:border-sky-500/50",
        cardBgGradient: "from-[#0f1d2a] via-[#111827] to-[#0f2428]",
        badgeBg: "bg-sky-500/15 border border-sky-500/30",
        badgeText: "text-sky-300",
        glowColor: "rgba(56, 189, 248, 0.15)",
        defaultAdvice: "Pleasant diffused sunlight, great for sightseeing and scenic photography.",
        iconType: "partly_cloudy",
        ariaLabel: "Partly cloudy weather condition",
      };

    case "cloudy":
      return {
        condition: "cloudy",
        displayName: "Cloudy & Overcast",
        accentColor: "#94A3B8",
        secondaryAccent: "#64748B",
        cardBorderClass: "border-slate-500/30 hover:border-slate-500/50",
        cardBgGradient: "from-[#151c28] via-[#111827] to-[#172033]",
        badgeBg: "bg-slate-500/15 border border-slate-500/30",
        badgeText: "text-slate-300",
        glowColor: "rgba(148, 163, 184, 0.12)",
        defaultAdvice: "Cool overcast skies. Comfortable for full-day travel circuits.",
        iconType: "cloud",
        ariaLabel: "Cloudy overcast weather condition",
      };

    case "rain":
      return {
        condition: "rain",
        displayName: "Rain & Showers",
        accentColor: "#06B6D4",
        secondaryAccent: "#0284C7",
        cardBorderClass: "border-cyan-500/30 hover:border-cyan-500/50",
        cardBgGradient: "from-[#08222b] via-[#111827] to-[#0d2633]",
        badgeBg: "bg-cyan-500/15 border border-cyan-500/30",
        badgeText: "text-cyan-300",
        glowColor: "rgba(6, 182, 212, 0.18)",
        defaultAdvice: "Rain showers active; carry an umbrella and check indoor museum options.",
        iconType: "rain",
        ariaLabel: "Rain and showers weather condition",
      };

    case "heavy_rain":
      return {
        condition: "heavy_rain",
        displayName: "Heavy Rain",
        accentColor: "#3B82F6",
        secondaryAccent: "#1D4ED8",
        cardBorderClass: "border-blue-600/40 hover:border-blue-500/60",
        cardBgGradient: "from-[#081a33] via-[#0b1220] to-[#0c1f3d]",
        badgeBg: "bg-blue-600/20 border border-blue-500/40",
        badgeText: "text-blue-300 font-bold",
        glowColor: "rgba(59, 130, 246, 0.22)",
        defaultAdvice: "Heavy rainfall in region; plan indoor activities and avoid slippery ghats.",
        iconType: "heavy_rain",
        ariaLabel: "Heavy rainfall weather condition",
      };

    case "thunderstorm":
      return {
        condition: "thunderstorm",
        displayName: "Thunderstorm",
        accentColor: "#A855F7",
        secondaryAccent: "#7E22CE",
        cardBorderClass: "border-purple-500/40 hover:border-purple-400/60",
        cardBgGradient: "from-[#1d1033] via-[#0b1220] to-[#250d38]",
        badgeBg: "bg-purple-500/20 border border-purple-500/40",
        badgeText: "text-purple-300 font-bold",
        glowColor: "rgba(168, 85, 247, 0.25)",
        defaultAdvice: "Active thunderstorm advisory; stay indoors during electrical storms.",
        iconType: "thunderstorm",
        ariaLabel: "Thunderstorm weather condition",
      };

    case "fog":
      return {
        condition: "fog",
        displayName: "Fog & Mist",
        accentColor: "#CBD5E1",
        secondaryAccent: "#94A3B8",
        cardBorderClass: "border-slate-400/30 hover:border-slate-400/50",
        cardBgGradient: "from-[#141d2b] via-[#111827] to-[#192436]",
        badgeBg: "bg-slate-400/15 border border-slate-400/30",
        badgeText: "text-slate-200",
        glowColor: "rgba(203, 213, 225, 0.12)",
        defaultAdvice: "Reduced visibility on morning highways and lake shores. Drive safely.",
        iconType: "fog",
        ariaLabel: "Fog and mist weather condition",
      };

    case "haze":
      return {
        condition: "haze",
        displayName: "Haze & Dust",
        accentColor: "#F97316",
        secondaryAccent: "#EA580C",
        cardBorderClass: "border-orange-500/30 hover:border-orange-500/50",
        cardBgGradient: "from-[#1f1712] via-[#111827] to-[#1c1613]",
        badgeBg: "bg-orange-500/15 border border-orange-500/30",
        badgeText: "text-orange-300",
        glowColor: "rgba(249, 115, 22, 0.15)",
        defaultAdvice: "Atmospheric haze present; stay hydrated and keep shades handy.",
        iconType: "haze",
        ariaLabel: "Hazy atmospheric weather condition",
      };

    case "snow":
      return {
        condition: "snow",
        displayName: "Cool / Frost",
        accentColor: "#E0F2FE",
        secondaryAccent: "#38BDF8",
        cardBorderClass: "border-sky-300/30 hover:border-sky-300/50",
        cardBgGradient: "from-[#0f2438] via-[#111827] to-[#122b40]",
        badgeBg: "bg-sky-300/15 border border-sky-300/30",
        badgeText: "text-sky-200",
        glowColor: "rgba(224, 242, 254, 0.15)",
        defaultAdvice: "Crisp cold conditions; dress warmly for high-elevation highland visits.",
        iconType: "snow",
        ariaLabel: "Cold or frosty weather condition",
      };

    case "unknown":
    default:
      return {
        condition: "unknown",
        displayName: "Live Forecast",
        accentColor: "#14B8A6",
        secondaryAccent: "#0D9488",
        cardBorderClass: "border-[#263244] hover:border-[#334155]",
        cardBgGradient: "from-[#111827] via-[#0b1220] to-[#172235]",
        badgeBg: "bg-teal-500/15 border border-teal-500/30",
        badgeText: "text-teal-300",
        glowColor: "rgba(20, 184, 166, 0.1)",
        defaultAdvice: "Check real-time regional updates for optimal travel scheduling.",
        iconType: "unknown",
        ariaLabel: "Live weather forecast status",
      };
  }
}
