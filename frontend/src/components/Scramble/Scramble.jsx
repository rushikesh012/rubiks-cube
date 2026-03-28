import { useMemo } from "react";
import { useCubeStore } from "../../store/useCubeStore";
import { parseMoveString } from "../../utils/moveParser";

export default function Scramble() {
  const scramble = useCubeStore((state) => state.scramble);
  const queueAlgorithm = useCubeStore((state) => state.queueAlgorithm);

  const tokens = useMemo(() => parseMoveString(scramble), [scramble]);

  return (
    <div className="glass animate-fade-up rounded-2xl px-5 py-4">
      <p className="font-display text-xs uppercase tracking-[0.26em] text-slate-400">Scramble</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm sm:text-base">
        {tokens.length > 0 ? (
          tokens.map((token, idx) => (
            <button
              key={`${token}-${idx}`}
              type="button"
              onClick={() => queueAlgorithm(token)}
              className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-1 font-mono text-slate-100 transition hover:border-cyan-400/70 hover:text-cyan-300"
              title="Queue this move"
            >
              {token}
            </button>
          ))
        ) : (
          <span className="text-slate-500">Generate a scramble to begin.</span>
        )}
      </div>
    </div>
  );
}
