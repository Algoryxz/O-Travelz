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
        className={`relative overflow-hidden rounded-2xl p-6 bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs ${className}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-[#F2EEE7]" />
            <div className="space-y-2">
              <div className="w-32 h-3 bg-[#F2EEE7] rounded-full" />
              <div className="w-20 h-7 bg-[#F2EEE7] rounded-lg" />
              <div className="w-48 h-3 bg-[#F2EEE7] rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-24 h-14 rounded-xl bg-[#F2EEE7]" />
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
        className={`relative overflow-hidden rounded-2xl p-6 bg-[#FFFFFF] border border-[#FDBA74] shadow-xs ${className}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[#C2410C]">
            <AlertCircle size={24} className="shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-[#12161E]">Weather Data Temporarily Unavailable</h4>
              <p className="text-xs text-[#70798B] mt-0.5">
                Could not load live meteorological observation for {locationName}.
              </p>
            </div>
          </div>
          {onRefresh && (
            <button
              type="button"
              data-testid="weather-retry-btn"
              onClick={onRefresh}
              className="px-3.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F2EEE7] text-[#12161E] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-[#E5DFD5]"
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
      className={`relative overflow-hidden rounded-2xl p-6 sm:p-7 bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs transition-all duration-300 ${className}`}
    >
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Weather Icon + Location + Condition */}
        <div className="flex items-center gap-5">
          {/* Animated Weather Icon Container */}
          <div
            data-testid="weather-icon-container"
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-center shrink-0 shadow-xs p-2"
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
                className="text-[11px] sm:text-xs font-bold font-mono uppercase tracking-wider text-[#70798B]"
              >
                LOCAL WEATHER · {locationName.toUpperCase()}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#70798B] font-mono border border-[#E5DFD5]">
                FORECAST
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F2] text-[#B87B22] border border-[#E5DFD5] font-mono">
                {provider}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-serif font-bold text-[#12161E] tracking-tight">
                {temperature}
              </span>
              <span className="text-sm font-semibold text-[#3D4654]">
                {conditionDisplay}
              </span>
              {feelsLike && (
                <span className="text-xs text-[#70798B] font-mono">
                  (Feels like {feelsLike})
                </span>
              )}
            </div>

            {advice && (
              <p className="text-xs text-[#3D4654] max-w-md leading-relaxed">
                {advice}
              </p>
            )}
          </div>
        </div>

        {/* Right: Meteorological Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {currentObs?.humidity_pct != null && (
            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-0.5">
              <div className="flex items-center gap-1.5 text-[#70798B] text-[11px]">
                <Droplets size={13} className="text-[#1B5E6B]" />
                <span>Humidity</span>
              </div>
              <div className="text-sm font-bold text-[#12161E] font-mono">
                {currentObs.humidity_pct}%
              </div>
            </div>
          )}

          {currentObs?.wind_speed_kmh != null && (
            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-0.5">
              <div className="flex items-center gap-1.5 text-[#70798B] text-[11px]">
                <Wind size={13} className="text-[#1B5E6B]" />
                <span>Wind Speed</span>
              </div>
              <div className="text-sm font-bold text-[#12161E] font-mono">
                {Math.round(currentObs.wind_speed_kmh)} km/h
              </div>
            </div>
          )}

          {currentObs?.precipitation_probability_pct != null && (
            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-0.5">
              <div className="flex items-center gap-1.5 text-[#70798B] text-[11px]">
                <CloudRain size={13} className="text-[#1B5E6B]" />
                <span>Precipitation</span>
              </div>
              <div className="text-sm font-bold text-[#12161E] font-mono">
                {currentObs.precipitation_probability_pct}%
              </div>
            </div>
          )}

          {currentObs?.precipitation_mm != null && currentObs?.precipitation_probability_pct == null && (
            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-0.5">
              <div className="flex items-center gap-1.5 text-[#70798B] text-[11px]">
                <CloudRain size={13} className="text-[#1B5E6B]" />
                <span>Precipitation</span>
              </div>
              <div className="text-sm font-bold text-[#12161E] font-mono">
                {currentObs.precipitation_mm.toFixed(1)} mm
              </div>
            </div>
          )}

          {currentObs?.cloud_cover_pct != null && (
            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-0.5">
              <div className="flex items-center gap-1.5 text-[#70798B] text-[11px]">
                <Thermometer size={13} className="text-[#B87B22]" />
                <span>Cloud Cover</span>
              </div>
              <div className="text-sm font-bold text-[#12161E] font-mono">
                {currentObs.cloud_cover_pct}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
