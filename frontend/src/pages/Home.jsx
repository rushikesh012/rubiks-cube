import { useEffect } from "react";
import Cube from "../components/Cube/Cube";
import { bindCubeKeyboardControls } from "../components/Cube/CubeControls";
import Timer from "../components/Timer/Timer";
import Navbar from "../components/UI/Navbar";
import StatsPanel from "../components/UI/StatsPanel";
import { useCubeStore } from "../store/useCubeStore";
import { useTimerStore } from "../store/useTimerStore";

const MOVE_MATRIX = [
  { left: "L", middle: ["F", "F'", "F2"], right: "R" },
  { left: "L'", middle: ["U", "U'", "U2"], right: "R'" },
  { left: "L2", middle: ["D", "D'", "D2"], right: "R2" },
];
const BACK_ROW = [null, "B", "B'", "B2", null];

function AllMovesMatrix({ onMove, compact = false }) {
  const sizeClass = compact
    ? "h-9 rounded-md px-1 text-[15px] font-extrabold"
    : "h-10 rounded-md px-2 text-[16px] font-extrabold";

  const colorClassByFace = (token) => {
    const face = token[0];
    if (face === "L") return "border-amber-300/70 bg-amber-500/20 text-amber-100";
    if (face === "R") return "border-rose-400/55 bg-rose-500/15 text-rose-100";
    if (face === "U") return "border-slate-300/55 bg-slate-200/10 text-slate-100";
    if (face === "D") return "border-yellow-400/55 bg-yellow-500/15 text-yellow-100";
    if (face === "F") return "border-emerald-400/55 bg-emerald-500/15 text-emerald-100";
    if (face === "B") return "border-blue-400/55 bg-blue-500/15 text-blue-100";
    return "border-slate-700 bg-slate-800/85 text-slate-100";
  };

  const labelWithArrow = (token) => {
    const FACE = { L: "L", R: "R", U: "U", D: "D", F: "F", B: "B" };
    const ARROW = {
      L: "⬇️",
      "L'": "⬆️",
      L2: "↕️",
      R: "⬆️",
      "R'": "⬇️",
      R2: "↕️",
      U: "⬅️",
      "U'": "➡️",
      U2: "↔️",
      D: "➡️",
      "D'": "⬅️",
      D2: "↔️",
      F: "⤵️",
      "F'": "⤴️",
      F2: "🔃",
      B: "⤴️",
      "B'": "⤵️",
      B2: "🔄",
    };
    return `${FACE[token[0]] ?? token[0]}${ARROW[token] ?? ""}`;
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/40 px-2 py-2">
      <p className="mb-2 font-display text-[10px] uppercase tracking-[0.22em] text-slate-400">All Moves</p>
      <div className="space-y-1.5">
        {MOVE_MATRIX.map((row) => (
          <div key={`${row.left}-${row.right}`} className="grid grid-cols-5 gap-1.5">
            {[row.left, ...row.middle, row.right].map((token) => (
              <button
                key={token}
                type="button"
                onClick={() => onMove(token)}
                className={`${sizeClass} border ${colorClassByFace(token)}`}
              >
                {labelWithArrow(token)}
              </button>
            ))}
          </div>
        ))}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {BACK_ROW.map((token, idx) =>
            token ? (
              <button
                key={token}
                type="button"
                onClick={() => onMove(token)}
                className={`${sizeClass} border ${colorClassByFace(token)}`}
              >
                {labelWithArrow(token)}
              </button>
            ) : (
              <div key={`blank-${idx}`} className={`${sizeClass} border border-transparent`} />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const queueAlgorithm = useCubeStore((state) => state.queueAlgorithm);
  const viewFaceMap = useCubeStore((state) => state.viewFaceMap);
  const generateAndApplyScramble = useCubeStore((state) => state.generateAndApplyScramble);
  const resetCubeModel = useCubeStore((state) => state.resetCubeModel);
  const visualResetNonce = useCubeStore((state) => state.visualResetNonce);

  const running = useTimerStore((state) => state.running);
  const startTimer = useTimerStore((state) => state.startTimer);
  const stopTimer = useTimerStore((state) => state.stopTimer);
  const resetTimer = useTimerStore((state) => state.resetTimer);

  const toggleTimer = () => {
    if (running) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  const queueViewMove = (token) => {
    const semanticKey = {
      L: "left",
      R: "right",
      U: "up",
      D: "down",
      F: "front",
      B: "back",
    }[token[0]];

    if (!semanticKey) return;
    const mappedFace = viewFaceMap[semanticKey] ?? token[0];
    const suffix = token.slice(1);
    queueAlgorithm(`${mappedFace}${suffix}`);
  };

  useEffect(() => {
    const unbind = bindCubeKeyboardControls({
      onMoves: (moves) => queueAlgorithm(moves.join(" ")),
      onToggleTimer: toggleTimer,
      onGenerateScramble: () => {
        resetCubeModel();
        resetTimer();
        generateAndApplyScramble();
      },
    });

    return unbind;
  }, [generateAndApplyScramble, queueAlgorithm, resetCubeModel, resetTimer, running, startTimer, stopTimer]);

  useEffect(() => {
    if (!useCubeStore.getState().scramble) {
      generateAndApplyScramble();
    }
  }, [generateAndApplyScramble]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-3 px-3 py-3 sm:px-6 sm:py-6 xl:h-[100dvh] xl:overflow-hidden">
      <div className="grid grid-cols-[1fr_190px] gap-2 xl:hidden">
        <Navbar verticalButtons />
        <Timer
          compact
          className="h-full"
          showControls
          vertical
          onStart={startTimer}
          onStop={stopTimer}
          onReset={resetTimer}
          isRunning={running}
        />
      </div>
      <div className="hidden xl:grid xl:grid-cols-[1fr_260px] xl:gap-3">
        <Navbar desktop />
        <Timer
          compact
          className="h-full"
          showControls
          onStart={startTimer}
          onStop={stopTimer}
          onReset={resetTimer}
          isRunning={running}
        />
      </div>

      <main className="flex-1 min-h-0">
        <div className="space-y-2 xl:hidden">
          <div className="glass rounded-2xl px-2 py-2">
            <div>
              <Cube key={visualResetNonce} />
            </div>

            <AllMovesMatrix onMove={queueViewMove} compact />
          </div>
          <StatsPanel />
        </div>

        <section className="hidden xl:grid xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start xl:gap-4">
          <div className="w-full">
            <Cube key={visualResetNonce} />
          </div>

          <div className="space-y-4 xl:min-h-0 xl:overflow-hidden">
            <AllMovesMatrix onMove={queueViewMove} />
            <div className="xl:min-h-0 xl:overflow-auto">
              <StatsPanel />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
