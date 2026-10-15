import React from "react";

export function GuessGameApp() {
  return (
    <div className="w-full h-full bg-slate-900 overflow-hidden flex flex-col">
      <iframe
        src="/games/guess-number/index.html"
        title="Guess the Number Game"
        className="w-full h-full border-0"
        /* Allows game inputs and scripts to execute safely */
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
}
export default GuessGameApp;
