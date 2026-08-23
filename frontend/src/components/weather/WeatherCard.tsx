import React from "react";
import type { WeatherResponse } from "../../types/api";
import {
  normalizeWeatherCondition,
  getWeatherVisualTheme,
} from "../../utils/weatherNormalizer";
import { AnimatedWeatherIcon } from "./AnimatedWeatherIcon";
import { Droplets, Wind, Thermometer, CloudRain, RefreshCw, AlertCircle } from "lucide-react";

export interface WeatherCardProps {
  locationName: string;
  weather: WeatherResponse | null;
  isLoading: boolean;
  error: unknown | null;
  onRefresh?: () => void;
  className?: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  locationName,
  weather,
  isLoading,
  error,
  onRefresh,
  className = "",
}) => {
  const currentObs = weather?.current;
  const rawCondition = currentObs?.condition;
  const conditionCode = currentObs?.condition_code;
  const status = currentObs?.status;
  const isDay = currentObs?.is_day === 0 ? false : true;

  const normalizedCondition = normalizeWeatherCondition(rawCondition, conditionCode, status);
  const theme = getWeatherVisualTheme(normalizedCondition, isDay);

  // Loading skeleton state
  if (isLoading && !weather) {
    return (
      <div
        data-testid="weather-banner-loading"
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-[#111827] border border-[#263244] shadow-xl ${className}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#172235]" />
            <div className="space-y-2">
              <div className="w-32 h-3 bg-[#172235] rounded-full" />
              <div className="w-20 h-7 bg-[#172235] rounded-lg" />
              <div className="w-48 h-3 bg-[#172235] rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-24 h-14 rounded-2xl bg-[#172235]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error / Unavailable state
  if ((error && !weather) || status === "unavailable") {
    return (
      <div
        data-testid="weather-banner-error"
        className={`relative overflow-hidden rounded-3xl p-6 bg-[#111827] border border-rose-500/30 shadow-xl ${className}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-rose-400">
            <AlertCircle size={24} className="shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Weather Data Temporarily Unavailable</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Could not load live meteorological observation for {locationName}.
              </p>
            </div>
          </div>
          {onRefresh && (
            <button
              type="button"
              data-testid="weather-retry-btn"
              onClick={onRefresh}
              className="px-3.5 py-1.5 rounded-xl bg-[#172235] hover:bg-slate-800 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const hasValidTemp = currentObs?.temperature_c != null && !Number.isNaN(currentObs.temperature_c);
  const temperature = hasValidTemp ? `${Math.round(currentObs.temperature_c!)}°C` : "—°C";
  const feelsLike = currentObs?.apparent_temperature_c != null ? `${Math.round(currentObs.apparent_temperature_c)}°C` : null;
  const conditionDisplay = !isDay && (currentObs?.condition === "Clear" || currentObs?.condition === "Clear sky")
    ? "Clear Night"
    : !isDay && (currentObs?.condition === "Mostly Clear" || currentObs?.condition === "Mainly clear")
    ? "Partly Cloudy Night"
    : (currentObs?.condition || theme.displayName);
  const provider = currentObs?.provider || "Open-Meteo";
  const advice = currentObs?.advice || theme.defaultAdvice;

  return (
    <div
      data-testid="weather-banner-section"
      className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-[#111827] border ${theme.cardBorderClass} shadow-lg transition-all duration-300 ${className}`}
    >
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Weather Icon + Location + Condition */}
        <div className="flex items-center gap-5">
          {/* Animated Weather Icon Container */}
          <div
            data-testid="weather-icon-container"
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#0B1220]/80 backdrop-blur-md border border-[#263244] flex items-center justify-center shrink-0 shadow-lg p-2"
          >
            <AnimatedWeatherIcon
              condition={normalizedCondition}
              isDay={isDay}
              size={48}
              ariaLabel={theme.ariaLabel}
            />
          </div>


          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                data-testid="weather-banner-heading"
                className="text-[11px] sm:text-xs font-black font-mono uppercase tracking-wider text-slate-300"
              >
                LOCAL WEATHER · {locationName.toUpperCase()}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#172235] text-slate-300 font-mono border border-[#334155]">
                FORECAST
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${theme.badgeBg} ${theme.badgeText}`}>
                {provider}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span
                data-testid="weather-temperature"
                className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight"
              >
                {temperature}
              </span>
              <span
                data-testid="weather-condition-label"
                className="text-sm sm:text-base font-semibold text-slate-200"
              >
                {conditionDisplay}
              </span>
              {feelsLike && (
                <span className="text-xs text-slate-400 font-medium">
                  (Feels like {feelsLike})
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300/90 max-w-md leading-relaxed pt-0.5">
              {advice}
            </p>
          </div>
        </div>

        {/* Right: Live Meteorological Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
          {/* Metric 1: Humidity */}
          {currentObs?.humidity_pct != null && (
            <div className="p-3 rounded-2xl bg-[#0B1220]/70 backdrop-blur-md border border-[#263244] flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                <Droplets size={12} className="text-cyan-400" />
                <span>Humidity</span>
              </div>
              <span className="text-sm font-bold text-white mt-0.5 font-mono">
                {currentObs.humidity_pct}%
              </span>
            </div>
          )}

          {/* Metric 2: Wind Speed */}
          {currentObs?.wind_speed_kmh != null && (
            <div className="p-3 rounded-2xl bg-[#0B1220]/70 backdrop-blur-md border border-[#263244] flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                <Wind size={12} className="text-teal-400" />
                <span>Wind</span>
              </div>
              <span className="text-sm font-bold text-white mt-0.5 font-mono">
                {Math.round(currentObs.wind_speed_kmh)} km/h
              </span>
            </div>
          )}

          {/* Metric 3: Rain Probability */}
          {currentObs?.precipitation_probability_pct != null && (
            <div className="p-3 rounded-2xl bg-[#0B1220]/70 backdrop-blur-md border border-[#263244] flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                <CloudRain size={12} className="text-sky-400" />
                <span>Rain Chance</span>
              </div>
              <span className="text-sm font-bold text-white mt-0.5 font-mono">
                {currentObs.precipitation_probability_pct}%
              </span>
            </div>
          )}

          {/* Metric 4: Refresh Action */}
          {onRefresh && (
            <button
              type="button"
              data-testid="weather-refresh-btn"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-3 rounded-2xl bg-[#0B1220]/70 hover:bg-[#172235] backdrop-blur-md border border-[#263244] hover:border-slate-500 transition-colors flex flex-col justify-center items-center cursor-pointer group"
              title="Refresh live weather"
            >
              <RefreshCw
                size={14}
                className={`text-slate-400 group-hover:text-teal-400 transition-transform ${
                  isLoading ? "animate-spin text-teal-400" : ""
                }`}
              />
              <span className="text-[10px] text-slate-400 group-hover:text-white mt-0.5 font-semibold">
                {isLoading ? "Updating..." : "Refresh"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
