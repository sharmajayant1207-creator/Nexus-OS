import { useOSStore } from "../store/useOSStore";
import { useWindowStore } from "../store/useWindowStore";
import { useVFSStore } from "../store/useVFSStore";
import { useThemeStore } from "../store/useThemeStore";

/**
 * Nexus AI Command Engine
 * Zero-dependency keyword and intent matcher function for Nexus OS intelligence.
 */
export function executeNexusAICommand(userPrompt: string): string {
  const prompt = userPrompt.trim().toLowerCase();

  if (!prompt) {
    return "Please enter a command or prompt for Nexus AI.";
  }
  // Inside executeNexusAICommand function:

  if (
    prompt.includes("guess") ||
    prompt.includes("play guess game") ||
    prompt.includes("open guess number")
  ) {
    // Use useWindowStore instead of useOSStore!
    useWindowStore.getState().openApp("guess-number");
    return "Opening Guess The Number game for you now! 🎮";
  }
  // --- Category A: Application Launcher (All Core Apps & Close All) ---
  if (
    prompt.includes("close all") ||
    prompt.includes("clear desktop") ||
    prompt.includes("close windows")
  ) {
    useWindowStore.getState().closeAllWindowProcesses();
    return "Closed all active window processes.";
  }

  if (
    prompt.includes("explorer") ||
    prompt.includes("files") ||
    prompt.includes("file manager") ||
    prompt.includes("open files")
  ) {
    useWindowStore.getState().openApp("explorer");
    return "Opened File Explorer.";
  }

  if (
    prompt.includes("browser") ||
    prompt.includes("web") ||
    prompt.includes("internet") ||
    prompt.includes("open browser")
  ) {
    useWindowStore.getState().openApp("browser");
    return "Opened Web Browser.";
  }

  if (
    prompt.includes("notes") ||
    prompt.includes("notepad") ||
    prompt.includes("text editor") ||
    prompt.includes("open notes")
  ) {
    useWindowStore.getState().openApp("notes");
    return "Opened Notes & Notepad.";
  }

  if (
    prompt.includes("gallery") ||
    prompt.includes("photos") ||
    prompt.includes("photo viewer") ||
    prompt.includes("open gallery")
  ) {
    useWindowStore.getState().openApp("gallery");
    return "Opened Photo Gallery.";
  }

  if (
    prompt.includes("music") ||
    prompt.includes("player") ||
    prompt.includes("music player") ||
    prompt.includes("open music")
  ) {
    useWindowStore.getState().openApp("music");
    return "Opened Music Player.";
  }

  if (
    prompt.includes("calculator") ||
    prompt.includes("calc") ||
    prompt.includes("open calculator")
  ) {
    useWindowStore.getState().openApp("calculator");
    return "Opened Calculator.";
  }

  if (
    prompt.includes("settings") ||
    prompt.includes("preferences") ||
    prompt.includes("open settings") ||
    prompt.includes("config")
  ) {
    useWindowStore.getState().openApp("settings");
    return "Opened System Settings.";
  }

  if (
    prompt.includes("weather") ||
    prompt.includes("forecast") ||
    prompt.includes("open weather") ||
    prompt.includes("temperature") ||
    prompt.includes("rain")
  ) {
    useWindowStore.getState().openApp("weather");
    return "Opened Weather Radar. Current Forecast: 22°C (72°F) - Partly Cloudy with 15% chance of rain.";
  }

  if (
    prompt.includes("terminal") ||
    prompt.includes("console") ||
    prompt.includes("cli") ||
    prompt.includes("open terminal")
  ) {
    useWindowStore.getState().openApp("terminal");
    return "Opened Terminal Console.";
  }

  if (
    prompt.includes("sysmon") ||
    prompt.includes("system monitor") ||
    prompt.includes("monitor")
  ) {
    useWindowStore.getState().openApp("sysmon");
    return "Opened System Monitor.";
  }

  // --- Category B: Theme & Personalization Engine ---
  if (
    prompt.includes("dark mode") ||
    prompt.includes("dark theme") ||
    prompt.includes("night mode")
  ) {
    useThemeStore.getState().setThemeMode("dark");
    useOSStore.getState().setThemeMode("dark");
    return "Switched system theme to Dark Mode.";
  }

  if (
    prompt.includes("light mode") ||
    prompt.includes("light theme") ||
    prompt.includes("day mode")
  ) {
    useThemeStore.getState().setThemeMode("light");
    useOSStore.getState().setThemeMode("light");
    return "Switched system theme to Light Mode.";
  }

  if (
    prompt.includes("brightness to max") ||
    prompt.includes("full brightness") ||
    prompt.includes("max brightness")
  ) {
    useOSStore.getState().setBrightness(100);
    return "Display brightness set to 100%.";
  }

  if (
    prompt.includes("dim screen") ||
    prompt.includes("low brightness") ||
    prompt.includes("dim brightness")
  ) {
    useOSStore.getState().setBrightness(30);
    return "Display brightness dimmed to 30%.";
  }

  const brightnessMatch = prompt.match(/brightness\s*(?:to|at|=)?\s*(\d+)/i);
  if (brightnessMatch) {
    const val = parseInt(brightnessMatch[1], 10);
    if (!isNaN(val)) {
      useOSStore.getState().setBrightness(val);
      return `Display brightness set to ${Math.min(100, Math.max(10, val))}%.`;
    }
  }

  // --- Category C: Audio & Media Controls ---
  if (
    prompt.includes("mute") ||
    prompt.includes("silence") ||
    prompt.includes("mute sound")
  ) {
    useOSStore.getState().setVolume(0);
    return "Audio system muted (volume set to 0%).";
  }

  if (
    prompt.includes("max volume") ||
    prompt.includes("volume 100") ||
    prompt.includes("full volume")
  ) {
    useOSStore.getState().setVolume(100);
    return "Audio volume set to 100%.";
  }

  if (prompt.includes("half volume") || prompt.includes("volume 50")) {
    useOSStore.getState().setVolume(50);
    return "Audio volume set to 50%.";
  }

  const volumeMatch = prompt.match(/volume\s*(?:to|at|=)?\s*(\d+)/i);
  if (volumeMatch) {
    const val = parseInt(volumeMatch[1], 10);
    if (!isNaN(val)) {
      useOSStore.getState().setVolume(val);
      return `Audio volume set to ${Math.min(100, Math.max(0, val))}%.`;
    }
  }

  // --- Category D: System Power & Security Controls ---
  if (
    prompt.includes("lock screen") ||
    prompt.includes("lock pc") ||
    prompt.includes("lock system") ||
    prompt === "lock"
  ) {
    useOSStore.getState().lockSystem();
    return "System locked securely.";
  }

  if (
    prompt.includes("sleep mode") ||
    prompt.includes("go to sleep") ||
    prompt === "sleep"
  ) {
    useOSStore.getState().sleep();
    return "Entering sleep mode... Press any key or move mouse to wake.";
  }

  if (prompt.includes("restart") || prompt.includes("reboot")) {
    useOSStore.getState().reboot();
    return "Rebooting Nexus OS kernel...";
  }

  // --- Category E: VFS File & Directory Actions ---
  if (
    prompt.includes("create note") ||
    prompt.includes("new document") ||
    prompt.includes("new note")
  ) {
    const vfs = useVFSStore.getState();
    const newFile = vfs.createFile(
      "documents",
      "AI_Note.txt",
      `# AI Note\nCreated by Nexus AI Assistant on ${new Date().toLocaleString()}\n\nTask summary and quick notes.`,
      "txt",
      "FileText",
    );
    useWindowStore.getState().openApp("notes", "AI_Note.txt", "FileText", {
      nodeId: newFile.id,
      content: newFile.content,
      title: newFile.name,
    });
    return `Created note '${newFile.name}' in /Documents and launched Notes app.`;
  }

  if (prompt.includes("new folder") || prompt.includes("create folder")) {
    const vfs = useVFSStore.getState();
    const newFolder = vfs.createFolder("desktop", "New Work Folder");
    return `Created directory '${newFolder.name}' on /Desktop.`;
  }

  // --- Category F: Real-Time System Diagnostics & Info ---
  if (
    prompt.includes("status") ||
    prompt.includes("battery") ||
    prompt.includes("system info") ||
    prompt.includes("diagnostics") ||
    prompt.includes("info")
  ) {
    const os = useOSStore.getState();
    const windows = useWindowStore.getState().windows;
    const theme = useThemeStore.getState().themeMode;
    return `📊 System Diagnostics:\n- Theme: ${theme.toUpperCase()}\n- Volume: ${os.isMuted ? "Muted" : `${os.volume}%`}\n- Brightness: ${os.brightness}%\n- Active Apps: ${windows.length} running\n- Battery & Power: 100% (AC Adapter Connected)\n- Security: Hardware Biometric & Enclave Intact`;
  }

  if (
    prompt.includes("time") ||
    prompt.includes("date") ||
    prompt.includes("clock")
  ) {
    const now = new Date();
    const formattedDate = now.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `🕒 Current System Clock:\n${formattedDate} at ${formattedTime}`;
  }

  // --- Category H: Quick Math & Conversions ---
  if (
    prompt.includes("calculate") ||
    prompt.includes("add") ||
    prompt.includes("multiply") ||
    prompt.includes("divide") ||
    /^[\d\s\+\-\*\/\(\)\.]+$/.test(prompt.replace("calculate", "").trim())
  ) {
    const expression = prompt
      .replace("calculate", "")
      .replace(/what is/g, "")
      .replace("?", "")
      .trim();

    try {
      if (expression && /^[\d\s\+\-\*\/\(\)\.]+$/.test(expression)) {
        // eslint-disable-next-line no-eval
        const result = Function(`"use strict"; return (${expression})`)();
        if (typeof result === "number" && !isNaN(result)) {
          return `🔢 Calculation Result: ${expression} = ${result}`;
        }
      }
    } catch {
      // Proceed to fallback if math evaluation fails
    }
  }

  // --- Fallback Logic ---
  if (
    prompt.includes("hello") ||
    prompt.includes("hi") ||
    prompt.includes("hey") ||
    prompt.includes("nexus") ||
    prompt.includes("who are you")
  ) {
    return `👋 Hello! I am Nexus AI, your built-in OS intelligence copilot. Ask me to launch applications, switch dark/light themes, adjust volume/brightness, create notes, check system diagnostics, or calculate math expressions. How can I assist you today?`;
  }

  return `🤖 Unrecognized command '${userPrompt}'. Here are example actions you can try:\n• "Open Weather" or "Open Calculator"\n• "Switch to Dark Mode" or "Brightness 80"\n• "Mute Sound" or "Volume 50"\n• "Create Note" or "New Folder"\n• "System Status" or "Check Time"\n• "Lock Screen" or "Calculate 120 * 4"`;
}
