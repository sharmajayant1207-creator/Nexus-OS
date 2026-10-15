import React, { useState, useEffect } from "react";
import {
  CloudSun,
  Search,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  MapPin,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface CitySearchResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  time: string;
}

interface DailyForecast {
  date: string;
  dayName: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
}

const DEFAULT_CITY: CitySearchResult = {
  id: 5391959,
  name: "San Francisco",
  latitude: 37.7749,
  longitude: -122.4194,
  country: "United States",
  admin1: "California",
};

// Map WMO Weather Codes to text & Lucide Icon
const getWeatherDetails = (code: number) => {
  if (code === 0) {
    return {
      label: "Clear Sky",
      icon: Sun,
      iconColor: "text-amber-300",
      bgGradient: "from-amber-500/20 via-sky-900/30 to-indigo-950/40",
      borderColor: "border-amber-400/40",
    };
  }
  if ([1, 2, 3].includes(code)) {
    return {
      label: "Partly Cloudy",
      icon: CloudSun,
      iconColor: "text-sky-300",
      bgGradient: "from-sky-500/20 via-slate-900/40 to-indigo-950/40",
      borderColor: "border-sky-400/40",
    };
  }
  if ([45, 48].includes(code)) {
    return {
      label: "Foggy & Misty",
      icon: Cloud,
      iconColor: "text-slate-300",
      bgGradient: "from-slate-600/20 via-slate-900/40 to-slate-950/40",
      borderColor: "border-slate-500/40",
    };
  }
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return {
      label: "Rain & Showers",
      icon: CloudRain,
      iconColor: "text-cyan-300",
      bgGradient: "from-cyan-600/20 via-blue-900/40 to-slate-950/40",
      borderColor: "border-cyan-400/40",
    };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      label: "Snow Fall",
      icon: Snowflake,
      iconColor: "text-cyan-200",
      bgGradient: "from-sky-400/20 via-slate-900/40 to-indigo-950/40",
      borderColor: "border-cyan-300/40",
    };
  }
  if ([95, 96, 99].includes(code)) {
    return {
      label: "Thunderstorm",
      icon: CloudLightning,
      iconColor: "text-purple-300",
      bgGradient: "from-purple-600/20 via-indigo-900/40 to-slate-950/40",
      borderColor: "border-purple-400/40",
    };
  }
  return {
    label: "Overcast",
    icon: Cloud,
    iconColor: "text-sky-300",
    bgGradient: "from-sky-500/20 via-slate-900/40 to-indigo-950/40",
    borderColor: "border-sky-400/40",
  };
};

export const WeatherApp: React.FC = () => {
  const [selectedCity, setSelectedCity] =
    useState<CitySearchResult>(DEFAULT_CITY);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CitySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [unit, setUnit] = useState<"C" | "F">("F");
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch Open-Meteo Weather Forecast for Selected Coordinates
  const fetchWeather = async (city: CitySearchResult) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch weather data");
      const data = await res.json();

      if (data.current) {
        setCurrent({
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          weatherCode: data.current.weather_code,
          time: data.current.time,
        });
      }

      if (data.daily && data.daily.time) {
        const forecast: DailyForecast[] = data.daily.time
          .slice(0, 5)
          .map((dateStr: string, idx: number) => {
            const date = new Date(dateStr + "T00:00:00");
            const dayName = date.toLocaleDateString([], { weekday: "short" });
            return {
              date: dateStr,
              dayName: idx === 0 ? "Today" : dayName,
              weatherCode: data.daily.weather_code[idx],
              tempMax: data.daily.temperature_2m_max[idx],
              tempMin: data.daily.temperature_2m_min[idx],
            };
          });
        setDailyForecast(forecast);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Could not fetch live weather. Check network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity]);

  // Geocoding Search handler
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setShowSearchResults(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          searchQuery.trim(),
        )}&count=5&language=en&format=json`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setSearchResults(data.results);
        } else {
          setSearchResults([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectCity = (city: CitySearchResult) => {
    setSelectedCity(city);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  // Convert temperature helper
  const formatTemp = (celsius: number) => {
    if (unit === "F") {
      const fahrenheit = (celsius * 9) / 5 + 32;
      return `${Math.round(fahrenheit)}°`;
    }
    return `${Math.round(celsius)}°`;
  };

  const weatherMeta = current
    ? getWeatherDetails(current.weatherCode)
    : getWeatherDetails(0);
  const ConditionIcon = weatherMeta.icon;

  return (
    <div className="flex flex-col h-full bg-[#0b0f17] text-slate-100 font-sans p-4 space-y-4 overflow-y-auto custom-scrollbar select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-sky-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono">
            LIVE WEATHER RADAR
          </h2>
        </div>

        {/* Unit Toggle °C / °F */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            <button
              onClick={() => setUnit("C")}
              className={`px-2.5 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                unit === "C"
                  ? "bg-sky-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setUnit("F")}
              className={`px-2.5 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                unit === "F"
                  ? "bg-sky-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              °F
            </button>
          </div>

          <button
            onClick={() => fetchWeather(selectedCity)}
            className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-100 cursor-pointer transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* City Search Bar */}
      <div className="relative z-50">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!e.target.value) setShowSearchResults(false);
            }}
            placeholder="Search global city (e.g. Tokyo, London, Paris)..."
            className="w-full pl-9 pr-20 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-400 shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold cursor-pointer transition-colors"
          >
            Search
          </button>
        </form>

        {/* Search Results Dropdown */}
        {showSearchResults && (
          <div className="absolute left-0 right-0 top-12 bg-slate-950/95 border border-slate-800 rounded-2xl p-2 shadow-2xl backdrop-blur-xl space-y-1 max-h-48 overflow-y-auto custom-scrollbar z-100">
            {isSearching ? (
              <p className="text-xs text-slate-400 p-2 text-center">
                Searching locations...
              </p>
            ) : searchResults.length > 0 ? (
              searchResults.map((city) => (
                <button
                  key={city.id}
                  onClick={() => selectCity(city)}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-900 transition-colors flex items-center justify-between text-xs cursor-pointer"
                >
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    {city.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {city.admin1 ? `${city.admin1}, ` : ""}
                    {city.country || ""}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-xs text-slate-500 p-2 text-center">
                No city results found.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Main Glassmorphic Weather Hero Card */}
      {isLoading ? (
        <div className="p-12 rounded-3xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">
            Fetching live weather telemetry...
          </p>
        </div>
      ) : errorMsg ? (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2 text-rose-300">
          <AlertCircle className="w-6 h-6 mx-auto" />
          <p className="text-xs font-semibold">{errorMsg}</p>
        </div>
      ) : (
        current && (
          <div
            className={`p-6 rounded-3xl bg-linear-to-br ${weatherMeta.bgGradient} border ${weatherMeta.borderColor} shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden backdrop-blur-xl`}
          >
            <div className="space-y-1.5 text-center md:text-left z-10">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <h1 className="text-2xl font-black text-slate-100 tracking-tight">
                  {selectedCity.name}
                </h1>
              </div>
              <p className="text-xs text-sky-300 font-medium">
                {selectedCity.admin1 ? `${selectedCity.admin1}, ` : ""}
                {selectedCity.country || ""} • {weatherMeta.label}
              </p>
              <div className="text-5xl font-extrabold text-slate-100 font-mono pt-3 tracking-tight">
                {formatTemp(current.temperature)}
                <span className="text-2xl text-sky-400 ml-1">°{unit}</span>
              </div>
            </div>

            <div className="flex flex-col items-center z-10">
              <div className="p-4 rounded-3xl bg-slate-950/40 border border-white/10 shadow-2xl backdrop-blur">
                <ConditionIcon
                  className={`w-16 h-16 ${weatherMeta.iconColor} animate-pulse`}
                />
              </div>
              <span className="text-xs font-bold text-slate-200 mt-2 tracking-wide font-mono">
                {weatherMeta.label}
              </span>
            </div>
          </div>
        )
      )}

      {/* Metrics Grid */}
      {current && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center gap-3 shadow-inner">
            <Wind className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 font-mono">
                Wind Speed
              </div>
              <div className="text-xs font-bold text-slate-200 font-mono">
                {current.windSpeed} km/h
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center gap-3 shadow-inner">
            <Droplets className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 font-mono">
                Humidity
              </div>
              <div className="text-xs font-bold text-slate-200 font-mono">
                {current.humidity}%
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center gap-3 col-span-2 sm:col-span-1 shadow-inner">
            <Thermometer className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 font-mono">
                Condition Code
              </div>
              <div className="text-xs font-bold text-slate-200 font-mono">
                WMO {current.weatherCode}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5-Day Forecast Cards */}
      {dailyForecast.length > 0 && (
        <div className="space-y-2 pt-1">
          <h3 className="text-xs font-bold uppercase text-slate-400 font-mono">
            5-Day Forecast
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {dailyForecast.map((day, idx) => {
              const dayMeta = getWeatherDetails(day.weatherCode);
              const DayIcon = dayMeta.icon;

              return (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col items-center justify-between text-center space-y-2 shadow-inner"
                >
                  <span className="text-[11px] font-bold text-slate-300 font-mono">
                    {day.dayName}
                  </span>
                  <DayIcon className={`w-6 h-6 ${dayMeta.iconColor}`} />
                  <div className="text-xs font-mono">
                    <span className="font-bold text-slate-100">
                      {formatTemp(day.tempMax)}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1.5">
                      {formatTemp(day.tempMin)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
