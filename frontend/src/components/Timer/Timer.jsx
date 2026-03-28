import { useEffect } from "react";
import { useTimerStore } from "../../store/useTimerStore";

const formatTime = (ms) => {
  if (ms <= 0) return "0.000";
  const totalSeconds = ms / 1000;
  if (totalSeconds < 60) {
    return totalSeconds.toFixed(3);
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(3).padStart(6, "0");
  return `${minutes}:${seconds}`;
};

export default function Timer({
  compact = false,
  className = "",
  showControls = false,
  onStart,
  onStop,
  onReset,
  isRunning = false,
  vertical = false,
}) {
  const running = useTimerStore((state) => state.running);
  const currentTimeMs = useTimerStore((state) => state.currentTimeMs);
  const tick = useTimerStore((state) => state.tick);

  const runStart = () => (onStart ?? useTimerStore.getState().startTimer)();
  const runStop = () => (onStop ?? useTimerStore.getState().stopTimer)();
  const runReset = () => (onReset ?? useTimerStore.getState().resetTimer)();

  const vibrate = (duration = 12) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(duration);
    }
  };

  const createPressHandlers = (action) => {
    let touchHandled = false;

    return {
      onTouchEnd: (event) => {
        event.preventDefault();
        event.stopPropagation();
        touchHandled = true;
        vibrate();
        action();
        setTimeout(() => {
          touchHandled = false;
        }, 120);
      },
      onClick: (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (touchHandled) return;
        vibrate();
        action();
      },
    };
  };

  const startPress = createPressHandlers(runStart);
  const stopPress = createPressHandlers(runStop);
  const resetPress = createPressHandlers(runReset);

  useEffect(() => {
    if (!running) return undefined;

    let frame = 0;
    const loop = () => {
      tick();
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running, tick]);

  const btnFx = "transition active:scale-[0.98] active:ring-2";

  if (compact) {
    if (vertical) {
      return (
        <div className={`glass animate-fade-up w-full rounded-2xl px-3 py-3 text-center ${className}`}>
          <p className="font-display text-[11px] uppercase tracking-[0.24em] text-slate-400">Timer</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-cyan-300">{formatTime(currentTimeMs)}</p>
          <div className="mt-2 flex flex-col gap-1">
            <button
              type="button"
              {...startPress}
              className={`rounded-md bg-emerald-500/20 px-2 py-1.5 text-[11px] font-semibold text-emerald-300 active:ring-emerald-300/70 ${btnFx}`}
            >
              Start
            </button>
            <button
              type="button"
              {...stopPress}
              className={`rounded-md bg-rose-500/20 px-2 py-1.5 text-[11px] font-semibold text-rose-300 active:ring-rose-300/70 ${btnFx}`}
            >
              Stop
            </button>
            <button
              type="button"
              {...resetPress}
              className={`rounded-md bg-slate-600/30 px-2 py-1.5 text-[11px] font-semibold text-slate-200 active:ring-slate-300/70 ${btnFx}`}
            >
              Reset
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`glass animate-fade-up w-full rounded-2xl px-4 py-4 text-left ${className}`}>
        <div className="flex items-center justify-between">
          <p className="font-display text-[11px] uppercase tracking-[0.24em] text-slate-400">Timer</p>
          <p className="font-mono text-2xl font-semibold text-cyan-300 sm:text-4xl">{formatTime(currentTimeMs)}</p>
        </div>
        {showControls ? (
          <div className="mt-2 flex flex-col gap-1">
            <button
              type="button"
              {...startPress}
              className={`rounded-md bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-300 active:ring-emerald-300/70 ${btnFx}`}
            >
              Start
            </button>
            <button
              type="button"
              {...stopPress}
              className={`rounded-md bg-rose-500/20 px-2 py-1 text-[10px] font-semibold text-rose-300 active:ring-rose-300/70 ${btnFx}`}
            >
              Stop
            </button>
            <button
              type="button"
              {...resetPress}
              className={`rounded-md bg-slate-600/30 px-2 py-1 text-[10px] font-semibold text-slate-200 active:ring-slate-300/70 ${btnFx}`}
            >
              Reset
            </button>
            <span className={`text-[10px] ${isRunning ? "text-emerald-300" : "text-slate-500"}`}>
              {isRunning ? "Running" : "Idle"}
            </span>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`glass animate-fade-up rounded-2xl px-6 py-7 text-center ${className}`}>
      <p className="font-display text-xs uppercase tracking-[0.26em] text-slate-400">Timer</p>
      <p className="mt-3 font-mono text-5xl font-semibold text-cyan-300 sm:text-6xl">{formatTime(currentTimeMs)}</p>
      <p className="mt-4 text-xs text-slate-400">Press <kbd className="rounded bg-slate-800 px-2 py-1">Space</kbd> to start/stop</p>
    </div>
  );
}

export { formatTime };
