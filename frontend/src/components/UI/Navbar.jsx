import { useCubeStore } from "../../store/useCubeStore";
import { useTimerStore } from "../../store/useTimerStore";

export default function Navbar({ verticalButtons = false, desktop = false }) {
  const generateAndApplyScramble = useCubeStore((state) => state.generateAndApplyScramble);
  const queueAlgorithm = useCubeStore((state) => state.queueAlgorithm);
  const resetCubeModel = useCubeStore((state) => state.resetCubeModel);
  const solveCurrent = useCubeStore((state) => state.solveCurrent);
  const resetTimer = useTimerStore((state) => state.resetTimer);

  const onNewScramble = () => {
    resetCubeModel();
    resetTimer();
    generateAndApplyScramble();
  };

  const onReset = () => {
    resetCubeModel();
    resetTimer();
  };

  const onSolve = () => {
    const solution = solveCurrent();
    if (solution) {
      queueAlgorithm(solution);
    }
  };

  return (
    <nav className={`glass rounded-2xl ${desktop ? "flex items-center justify-between px-5 py-4" : "flex flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"}`}>
      <div>
        <p className="font-display text-base font-semibold tracking-wide text-slate-100 sm:text-lg">
          Rubik Cube
        </p>
        {desktop ? <p className="mt-1 text-xs text-slate-400">Keyboard: `N` scramble, `Space` start/stop</p> : null}
      </div>

      <div className={verticalButtons ? "flex w-full flex-col gap-2 sm:w-auto" : "grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:items-center"}>
        <button
          type="button"
          onClick={onNewScramble}
          className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
        >
          Scramble
        </button>
        <button
          type="button"
          onClick={onSolve}
          className="rounded-lg border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20"
        >
          Auto Solve
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
        >
          Reset
        </button>
      </div>
    </nav>
  );
}
