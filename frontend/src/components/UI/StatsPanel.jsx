import { useMemo } from "react";
import { useTimerStore } from "../../store/useTimerStore";
import { formatTime } from "../Timer/Timer";

export default function StatsPanel() {
  const history = useTimerStore((state) => state.history);
  const clearHistory = useTimerStore((state) => state.clearHistory);
  const getStats = useTimerStore((state) => state.getStats);
  const { best, ao5, ao12 } = getStats();

  const recent = useMemo(() => [...history].reverse().slice(0, 10), [history]);

  return (
    <div className="glass animate-fade-up rounded-2xl px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-xs uppercase tracking-[0.26em] text-slate-400">Stats</p>
        <button
          type="button"
          onClick={clearHistory}
          className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-rose-400 hover:text-rose-300"
        >
          Clear
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-2">
          <p className="text-[10px] uppercase text-slate-400">Best</p>
          <p className="font-mono text-sm text-cyan-300">{best ? formatTime(best) : "--"}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-2">
          <p className="text-[10px] uppercase text-slate-400">Ao5</p>
          <p className="font-mono text-sm text-cyan-300">{ao5 ? formatTime(ao5) : "--"}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-2">
          <p className="text-[10px] uppercase text-slate-400">Ao12</p>
          <p className="font-mono text-sm text-cyan-300">{ao12 ? formatTime(ao12) : "--"}</p>
        </div>
      </div>

      <div className="mt-3 max-h-60 space-y-2 overflow-auto pr-1">
        {recent.length ? (
          recent.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2"
            >
              <span className="text-xs text-slate-400">#{history.length - idx}</span>
              <span className="font-mono text-sm text-slate-100">{formatTime(item.timeMs)}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No solves yet.</p>
        )}
      </div>
    </div>
  );
}
