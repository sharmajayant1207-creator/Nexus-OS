export type ThemeMode = "light" | "dark";

export interface AccentColorPreset {
  id: string;
  name: string;
  hex: string;
  hoverHex: string;
  lightHex: string;
  rgb: string;
}

export const ACCENT_PRESETS: AccentColorPreset[] = [
  {
    id: "cyan",
    name: "Quantum Cyan",
    hex: "#06b6d4",
    hoverHex: "#0891b2",
    lightHex: "#cffafe",
    rgb: "6, 182, 212",
  },
  {
    id: "indigo",
    name: "Neon Indigo",
    hex: "#6366f1",
    hoverHex: "#4f46e5",
    lightHex: "#e0e7ff",
    rgb: "99, 102, 241",
  },
  {
    id: "purple",
    name: "Cyber Purple",
    hex: "#a855f7",
    hoverHex: "#9333ea",
    lightHex: "#f3e8ff",
    rgb: "168, 85, 247",
  },
  {
    id: "emerald",
    name: "Bio Emerald",
    hex: "#10b981",
    hoverHex: "#059669",
    lightHex: "#d1fae5",
    rgb: "16, 185, 129",
  },
  {
    id: "amber",
    name: "Solar Amber",
    hex: "#f59e0b",
    hoverHex: "#d97706",
    lightHex: "#fef3c7",
    rgb: "245, 158, 11",
  },
  {
    id: "rose",
    name: "Plasma Rose",
    hex: "#f43f5e",
    hoverHex: "#e11d48",
    lightHex: "#ffe4e6",
    rgb: "244, 63, 94",
  },
];

export const THEME_VARIABLES = {
  dark: {
    "--bg-primary": "#0b0f17",
    "--bg-secondary": "#0f172a",
    "--bg-tertiary": "#1e293b",
    "--text-primary": "#f8fafc",
    "--text-secondary": "#94a3b8",
    "--text-muted": "#64748b",
    "--glass-bg": "rgba(15, 23, 42, 0.85)",
    "--glass-border": "rgba(51, 65, 85, 0.5)",
    "--window-shadow": "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
    "--taskbar-bg": "rgba(11, 15, 23, 0.88)",
    "--startmenu-bg": "rgba(15, 23, 42, 0.95)",
    "--card-bg": "rgba(15, 23, 42, 0.9)",
    "--card-border": "rgba(30, 41, 59, 0.8)",
    "--input-bg": "#020617",
  },
  light: {
    "--bg-primary": "#f8fafc",
    "--bg-secondary": "#f1f5f9",
    "--bg-tertiary": "#e2e8f0",
    "--text-primary": "#0f172a",
    "--text-secondary": "#475569",
    "--text-muted": "#94a3b8",
    "--glass-bg": "rgba(255, 255, 255, 0.85)",
    "--glass-border": "rgba(203, 213, 225, 0.8)",
    "--window-shadow": "0 20px 40px -10px rgba(0, 0, 0, 0.15)",
    "--taskbar-bg": "rgba(248, 250, 252, 0.9)",
    "--startmenu-bg": "rgba(255, 255, 255, 0.98)",
    "--card-bg": "rgba(255, 255, 255, 0.95)",
    "--card-border": "rgba(226, 232, 240, 0.9)",
    "--input-bg": "#ffffff",
  },
};

// Convert hex to RGB values
function hexToRgb(hex: string): string {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `${r}, ${g}, ${b}`;
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
  return "6, 182, 212";
}

export function applyTheme(mode: ThemeMode, accentKeyOrHex: string) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // 1. Set mode class & attributes
  if (mode === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
    root.setAttribute("data-theme", "dark");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  }

  // 2. Set theme color variables
  const vars = THEME_VARIABLES[mode];
  Object.entries(vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
  // 3. Resolve Accent Color
  const preset = ACCENT_PRESETS.find(
    (p) => p.id === accentKeyOrHex || p.hex === accentKeyOrHex,
  );

  let accentHex = preset ? preset.hex : accentKeyOrHex;
  let hoverHex = preset ? preset.hoverHex : accentHex;
  let lightHex = preset ? preset.lightHex : "#cffafe";
  let rgb = preset ? preset.rgb : hexToRgb(accentHex);

  if (
    !accentHex ||
    typeof accentHex !== "string" ||
    !accentHex.startsWith("#")
  ) {
    accentHex = "#06b6d4";
    hoverHex = "#0891b2";
    rgb = "6, 182, 212";
  }

  root.style.setProperty("--accent-color", accentHex);
  root.style.setProperty("--accent-hover", hoverHex);
  root.style.setProperty("--accent-light", lightHex);
  root.style.setProperty("--accent-rgb", rgb);
}
