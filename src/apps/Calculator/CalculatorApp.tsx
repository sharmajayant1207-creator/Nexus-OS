import React, { useState, useEffect } from "react";
import {
  Calculator as CalcIcon,
  Delete,
  History,
  Trash2,
  Binary,
  Sparkles,
} from "lucide-react";

interface HistoryItem {
  id: string;
  equation: string;
  result: string;
  timestamp: string;
}

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [mode, setMode] = useState<"standard" | "scientific">("standard");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleNum = (num: string) => {
    if (display === "0" || isDone) {
      setDisplay(num);
      setIsDone(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOp = (op: string) => {
    if (isDone) {
      setEquation(display + " " + op + " ");
      setDisplay("0");
      setIsDone(false);
      return;
    }
    setEquation(display + " " + op + " ");
    setDisplay("0");
    setIsDone(false);
  };

  const handleScientificFunc = (funcName: string) => {
    try {
      const val = parseFloat(display);
      let res = 0;
      switch (funcName) {
        case "sin":
          res = Math.sin((val * Math.PI) / 180); // DEG
          break;
        case "cos":
          res = Math.cos((val * Math.PI) / 180);
          break;
        case "tan":
          res = Math.tan((val * Math.PI) / 180);
          break;
        case "sqrt":
          res = Math.sqrt(val);
          break;
        case "sqr":
          res = Math.pow(val, 2);
          break;
        case "log":
          res = Math.log10(val);
          break;
        case "ln":
          res = Math.log(val);
          break;
        case "inv":
          res = 1 / val;
          break;
        default:
          return;
      }
      const formatted = String(Number(res.toFixed(8)));
      setDisplay(formatted);
      setIsDone(true);
      addHistory(`${funcName}(${display})`, formatted);
    } catch {
      setDisplay("Error");
      setIsDone(true);
    }
  };

  const handleConstant = (constName: string) => {
    if (constName === "π") {
      setDisplay(String(Number(Math.PI.toFixed(8))));
    } else if (constName === "e") {
      setDisplay(String(Number(Math.E.toFixed(8))));
    }
    setIsDone(false);
  };

  const handleClear = () => {
    setDisplay("0");
    setEquation("");
    setIsDone(false);
  };

  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  const addHistory = (eq: string, res: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      equation: eq,
      result: res,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 19)]);
  };

  const handleEqual = () => {
    if (!equation) return;
    try {
      const full = equation + display;
      const sanitized = full
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/\^/g, "**");

      // Safe evaluation
      const rawRes = Function(`'use strict'; return (${sanitized})`)();
      const resultStr = String(Number(rawRes.toFixed(8)));

      setDisplay(resultStr);
      setEquation(full + " =");
      setIsDone(true);
      addHistory(full, resultStr);
    } catch {
      setDisplay("Error");
      setIsDone(true);
    }
  };

  // Keyboard listener support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName))
        return;

      if (e.key >= "0" && e.key <= "9") handleNum(e.key);
      else if (e.key === ".") handleNum(".");
      else if (e.key === "+") handleOp("+");
      else if (e.key === "-") handleOp("-");
      else if (e.key === "*") handleOp("×");
      else if (e.key === "/") {
        e.preventDefault();
        handleOp("÷");
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleEqual();
      } else if (e.key === "Backspace") handleDelete();
      else if (e.key === "Escape") handleClear();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [display, equation, isDone]);

  return (
    <div className="flex flex-col h-full bg-[#0b0f17] text-slate-100 select-none font-sans p-4 space-y-3 overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 shrink-0">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <CalcIcon className="w-4 h-4" />
          <span>NEXUS CALCULATOR</span>
        </div>

        {/* Standard / Scientific Toggle & History Drawer Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setMode((m) => (m === "standard" ? "scientific" : "standard"))
            }
            className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 cursor-pointer transition-colors"
          >
            {mode === "standard" ? "SCI MODE" : "STD MODE"}
          </button>
          <button
            onClick={() => setShowHistory((s) => !s)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              showHistory
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Calculation History"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Screen Display */}
      <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-end text-right font-mono min-h-21.25 shadow-inner shrink-0">
        <div className="text-xs text-slate-400 h-5 overflow-hidden">
          {equation}
        </div>
        <div className="text-2xl font-bold text-slate-100 truncate tracking-wide">
          {display}
        </div>
      </div>

      {/* Main Body Grid / History Sidebar */}
      {showHistory ? (
        <div className="flex-1 bg-slate-950/80 rounded-2xl border border-slate-800 p-3 flex flex-col justify-between min-h-0 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" /> Calculation History
            </span>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
            {history.length > 0 ? (
              history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setDisplay(item.result);
                    setIsDone(true);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-amber-500/40 text-right cursor-pointer transition-all"
                >
                  <div className="text-[10px] text-slate-400 font-mono">
                    {item.equation}
                  </div>
                  <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                    {item.result}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic text-center my-auto">
                No past calculations recorded.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {/* Scientific Operations Bar (shown in scientific mode) */}
          {mode === "scientific" && (
            <div className="grid grid-cols-5 gap-1.5 shrink-0">
              {["sin", "cos", "tan", "sqrt", "sqr", "log", "ln", "inv"].map(
                (f) => (
                  <button
                    key={f}
                    onClick={() => handleScientificFunc(f)}
                    className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/20 font-mono text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {f}
                  </button>
                ),
              )}
              <button
                onClick={() => handleConstant("π")}
                className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/20 font-mono text-xs font-semibold cursor-pointer transition-colors"
              >
                π
              </button>
              <button
                onClick={() => handleConstant("e")}
                className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/20 font-mono text-xs font-semibold cursor-pointer transition-colors"
              >
                e
              </button>
            </div>
          )}

          {/* Keypad Grid */}
          <div className="grid grid-cols-4 gap-2 flex-1">
            <button
              onClick={handleClear}
              className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-sm cursor-pointer transition-colors"
            >
              C
            </button>
            <button
              onClick={handleDelete}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
            >
              <Delete className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOp("%")}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 font-bold text-sm cursor-pointer transition-colors"
            >
              %
            </button>
            <button
              onClick={() => handleOp("÷")}
              className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-base cursor-pointer transition-colors"
            >
              ÷
            </button>

            {["7", "8", "9"].map((n) => (
              <button
                key={n}
                onClick={() => handleNum(n)}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-800 font-bold text-base cursor-pointer transition-colors"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => handleOp("×")}
              className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-base cursor-pointer transition-colors"
            >
              ×
            </button>

            {["4", "5", "6"].map((n) => (
              <button
                key={n}
                onClick={() => handleNum(n)}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-800 font-bold text-base cursor-pointer transition-colors"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => handleOp("-")}
              className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-base cursor-pointer transition-colors"
            >
              -
            </button>

            {["1", "2", "3"].map((n) => (
              <button
                key={n}
                onClick={() => handleNum(n)}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-800 font-bold text-base cursor-pointer transition-colors"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => handleOp("+")}
              className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-base cursor-pointer transition-colors"
            >
              +
            </button>

            <button
              onClick={() => handleNum("0")}
              className="col-span-2 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-800 font-bold text-base cursor-pointer transition-colors"
            >
              0
            </button>
            <button
              onClick={() => handleNum(".")}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-800 font-bold text-base cursor-pointer transition-colors"
            >
              .
            </button>
            <button
              onClick={handleEqual}
              className="p-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-base cursor-pointer transition-all shadow-lg active:scale-95"
            >
              =
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
