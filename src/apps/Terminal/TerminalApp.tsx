import React, { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon } from "lucide-react";
import { useOSStore } from "../../store/useOSStore";
import { useWindowStore } from "../../store/useWindowStore";
import { useVFSStore } from "../../store/useVFSStore";
import { useThemeStore } from "../../store/useThemeStore";

interface HistoryLine {
  id: string;
  command?: string;
  output?: string | React.ReactNode;
  isError?: boolean;
}

export const TerminalApp: React.FC = () => {
  const { userName } = useOSStore();
  const { windows, closeWindow } = useWindowStore();
  const { nodes } = useVFSStore();
  const { themeMode, toggleThemeMode } = useThemeStore();

  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState<HistoryLine[]>([
    {
      id: "init-1",
      output: (
        <div className="text-emerald-400 font-mono space-y-1 mb-2">
          <div>Nexus OS Kernel Shell [v2.4.0-release]</div>
          <div>
            Type <span className="text-cyan-300 font-bold">help</span> to list
            available commands.
          </div>
        </div>
      ),
    },
  ]);

  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new output
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Focus input on click anywhere
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    // Add to command history for Up/Down arrow navigation
    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const parts = trimmed.split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    let outputNode: React.ReactNode = null;
    let isErr = false;

    switch (cmd) {
      case "help":
        outputNode = (
          <div className="space-y-1 text-slate-300">
            <div className="text-cyan-400 font-bold mb-1">
              Available Nexus CLI Commands:
            </div>
            <div>
              <span className="text-emerald-400 font-bold w-24 inline-block">
                help
              </span>{" "}
              Show this command reference
            </div>
            <div>
              <span className="text-emerald-400 font-bold w-24 inline-block">
                ls [path]
              </span>{" "}
              List files in Virtual File System
            </div>
            <div>
              <span className="text-emerald-400 font-bold w-24 inline-block">
                cat &lt;file&gt;
              </span>{" "}
              Print content of VFS text file
            </div>
            <div>
              <span className="text-emerald-400 font-bold w-24 inline-block">
                clear
              </span>{" "}
              Clear terminal screen
            </div>
            <div>
              <span className="text-emerald-400 font-bold w-24 inline-block">
                whoami
              </span>{" "}
              Print active user profile
            </div>
            <div>
              <span className="text-emerald-400 font-bold w-24 inline-block">
                date
              </span>{" "}
              Display current system time
            </div>
            <div>
              <span className="text-emerald-400 font-bold w-24 inline-block">
                neofetch
              </span>{" "}
              Display Nexus OS system telemetry banner
            </div>
            <div>
              <span className="text-emerald-400 font-bold w-24 inline-block">
                ps
              </span>{" "}
              List running window processes
            </div>
            <div>
              <span className="text-emerald-400 font-bold w-24 inline-block">
                kill &lt;id&gt;
              </span>{" "}
              Terminate process by App ID or PID
            </div>
            <div>
              <span className="text-emerald-400 font-bold w-24 inline-block">
                theme
              </span>{" "}
              Toggle Dark / Light mode
            </div>
            <div>
              <span className="text-emerald-400 font-bold w-24 inline-block">
                ping [host]
              </span>{" "}
              Run network latency test
            </div>
            <div>
              <span className="text-emerald-400 font-bold w-24 inline-block">
                echo [txt]
              </span>{" "}
              Print input text
            </div>
          </div>
        );
        break;

      case "clear":
        setHistory([]);
        setInputVal("");
        return;

      case "whoami":
        outputNode = (
          <span className="text-cyan-300 font-bold">
            {userName || "Jayant Sharma"}
          </span>
        );
        break;

      case "date":
        outputNode = (
          <span className="text-amber-300">{new Date().toString()}</span>
        );
        break;

      case "echo":
        outputNode = <span className="text-slate-200">{args.join(" ")}</span>;
        break;

      case "ls": {
        const fileList = Object.values(nodes).filter(
          (n) => n.parentId === "desktop" || n.parentId === "root",
        );
        outputNode = (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-1">
            {fileList.map((f) => (
              <span
                key={f.id}
                className={
                  f.type === "folder"
                    ? "text-cyan-400 font-bold"
                    : "text-slate-200"
                }
              >
                {f.type === "folder" ? `📁 ${f.name}/` : `📄 ${f.name}`}
              </span>
            ))}
          </div>
        );
        break;
      }

      case "cat": {
        if (!args[0]) {
          outputNode = "Usage: cat <filename>";
          isErr = true;
          break;
        }
        const targetName = args[0].toLowerCase();
        const foundFile = Object.values(nodes).find(
          (n) =>
            n.name.toLowerCase() === targetName ||
            n.name.toLowerCase() === `${targetName}.txt`,
        );
        if (foundFile && foundFile.content) {
          outputNode = (
            <pre className="whitespace-pre-wrap text-slate-200">
              {foundFile.content}
            </pre>
          );
        } else if (foundFile) {
          outputNode = `[File ${foundFile.name} is empty or binary]`;
        } else {
          outputNode = `cat: ${args[0]}: No such file in VFS`;
          isErr = true;
        }
        break;
      }

      case "ps": {
        outputNode = (
          <div className="space-y-1">
            <div className="text-slate-400 font-bold border-b border-slate-800 pb-1 flex justify-between">
              <span>PID</span>
              <span>APP TITLE</span>
              <span>APP ID</span>
            </div>
            {windows.length === 0 ? (
              <div className="text-slate-500 italic">
                No running window processes.
              </div>
            ) : (
              windows.map((w, idx) => (
                <div key={w.id} className="flex justify-between text-slate-200">
                  <span className="text-cyan-400">{1000 + idx * 42}</span>
                  <span className="font-semibold">{w.title}</span>
                  <span className="text-slate-400">{w.appId}</span>
                </div>
              ))
            )}
          </div>
        );
        break;
      }

      case "kill": {
        if (!args[0]) {
          outputNode = "Usage: kill <appId | windowId>";
          isErr = true;
          break;
        }
        const target = args[0].toLowerCase();
        const targetWin = windows.find(
          (w) =>
            w.id.toLowerCase() === target || w.appId.toLowerCase() === target,
        );
        if (targetWin) {
          closeWindow(targetWin.id);
          outputNode = `Terminated process '${targetWin.title}' (${targetWin.id})`;
        } else {
          outputNode = `kill: ${args[0]}: Process not found`;
          isErr = true;
        }
        break;
      }

      case "theme": {
        toggleThemeMode();
        outputNode = `Theme mode switched to ${themeMode === "dark" ? "Light" : "Dark"}.`;
        break;
      }

      case "ping": {
        const host = args[0] || "nexus.os.local";
        outputNode = (
          <div className="space-y-0.5 text-emerald-400 font-mono">
            <div>PING {host} (127.0.0.1): 56 data bytes</div>
            <div>64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.42 ms</div>
            <div>64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.38 ms</div>
            <div>--- {host} ping statistics ---</div>
            <div>
              2 packets transmitted, 2 packets received, 0.0% packet loss
            </div>
          </div>
        );
        break;
      }

      case "neofetch":
        outputNode = (
          <div className="flex gap-4 py-2 items-center">
            <pre className="text-cyan-400 font-bold leading-tight text-[10px]">
              {`   /\_/\  
  ( o.o ) 
   > ^ <  
 NEXUS OS `}
            </pre>
            <div className="space-y-1 text-slate-200 font-mono text-xs border-l border-slate-800 pl-4">
              <div>
                <span className="text-cyan-400 font-bold">
                  {userName}@nexus-os
                </span>
              </div>
              <div className="text-slate-600">------------------</div>
              <div>
                <span className="text-slate-400">OS:</span> Nexus Web OS v2.4
              </div>
              <div>
                <span className="text-slate-400">Kernel:</span> WebKit/Blink V8
                JS
              </div>
              <div>
                <span className="text-slate-400">Shell:</span> nexus-sh 1.0
              </div>
              <div>
                <span className="text-slate-400">Uptime:</span> Live Browser
                Session
              </div>
              <div>
                <span className="text-slate-400">WM:</span> Nexus Desktop
                Manager
              </div>
            </div>
          </div>
        );
        break;

      default:
        outputNode = `command not found: ${cmd}. Type 'help' for commands.`;
        isErr = true;
        break;
    }

    setHistory((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        command: trimmed,
        output: outputNode,
        isError: isErr,
      },
    ]);

    setInputVal("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(inputVal);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx =
        historyIndex + 1 < cmdHistory.length ? historyIndex + 1 : historyIndex;
      setHistoryIndex(nextIdx);
      setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx] || "");
      } else {
        setHistoryIndex(-1);
        setInputVal("");
      }
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className="flex-1 w-full h-full bg-[#0a0e14] text-slate-200 font-mono text-xs p-4 flex flex-col overflow-y-auto select-text cursor-text"
    >
      {/* Top Console Title Bar */}
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800/80 text-slate-400 select-none">
        <TerminalIcon className="w-4 h-4 text-cyan-400" />
        <span className="font-bold text-[11px] text-slate-300">
          nexus-sh — {userName || "Jayant Sharma"}@nexus-os
        </span>
      </div>

      {/* Console History Output */}
      <div className="space-y-3">
        {history.map((item) => (
          <div key={item.id} className="space-y-1">
            {item.command !== undefined && (
              <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                <span className="text-emerald-400">nexus@os:~$</span>
                <span>{item.command}</span>
              </div>
            )}
            {item.output && (
              <div
                className={`pl-2 ${item.isError ? "text-rose-400" : "text-slate-200"}`}
              >
                {item.output}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Prompt Row */}
      <div className="flex items-center gap-2 mt-2 pt-2">
        <span className="text-emerald-400 font-bold shrink-0">nexus@os:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none border-none text-slate-100 font-mono text-xs caret-cyan-400"
          autoFocus
          spellCheck={false}
        />
      </div>

      <div ref={bottomRef} />
    </div>
  );
};
