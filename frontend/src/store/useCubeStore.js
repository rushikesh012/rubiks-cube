import { create } from "zustand";
import Cube from "cubejs";
import { generateScramble } from "../utils/scramble";

const FACE_DEFINITIONS = {
  R: { axis: "x", layer: 1, direction: -1 },
  L: { axis: "x", layer: -1, direction: 1 },
  U: { axis: "y", layer: 1, direction: -1 },
  D: { axis: "y", layer: -1, direction: 1 },
  F: { axis: "z", layer: 1, direction: -1 },
  B: { axis: "z", layer: -1, direction: 1 },
};

const expandMoveToken = (token) => {
  const face = token[0];
  const suffix = token.slice(1);

  if (!FACE_DEFINITIONS[face]) {
    return [];
  }

  if (suffix === "2") {
    return [face, face];
  }

  if (suffix === "'") {
    return [`${face}'`];
  }

  return [face];
};

export const getMoveDefinition = (move) => {
  const token = move.trim();
  const face = token[0];
  const base = FACE_DEFINITIONS[face];
  if (!base) return null;

  const suffix = token.slice(1);
  const turns = suffix === "2" ? 2 : 1;
  const direction = suffix === "'" ? -base.direction : base.direction;
  return { ...base, turns, direction };
};

export const useCubeStore = create((set, get) => ({
  cubeModel: new Cube(),
  scramble: "",
  moveQueue: [],
  isAnimatingMove: false,
  visualResetNonce: 0,
  viewFaceMap: {
    left: "L",
    right: "R",
    up: "U",
    down: "D",
    front: "F",
    back: "B",
  },

  setAnimatingMove: (isAnimatingMove) => set({ isAnimatingMove }),
  setViewFaceMap: (viewFaceMap) => set({ viewFaceMap }),

  enqueueMoves: (moves) => {
    if (!moves.length) return;
    set((state) => ({ moveQueue: [...state.moveQueue, ...moves] }));
  },

  dequeueMove: () => {
    const { moveQueue } = get();
    if (!moveQueue.length) return null;

    const [current, ...rest] = moveQueue;
    set({ moveQueue: rest });
    return current;
  },

  performMoveOnModel: (move) => {
    const { cubeModel } = get();
    cubeModel.move(move);
  },

  resetCubeModel: () => {
    set((state) => ({
      cubeModel: new Cube(),
      moveQueue: [],
      isAnimatingMove: false,
      visualResetNonce: state.visualResetNonce + 1,
    }));
  },

  setScramble: (scramble) => set({ scramble }),

  generateAndApplyScramble: () => {
    const scramble = generateScramble();
    const tokens = scramble.split(" ").flatMap(expandMoveToken);
    set({
      scramble,
      cubeModel: new Cube(),
      moveQueue: tokens,
      isAnimatingMove: false,
    });
    return scramble;
  },

  queueAlgorithm: (algorithm) => {
    const tokens = algorithm
      .trim()
      .split(/\s+/)
      .flatMap(expandMoveToken)
      .filter(Boolean);

    get().enqueueMoves(tokens);
  },

  solveCurrent: () => {
    try {
      Cube.initSolver();
      const { cubeModel } = get();
      return cubeModel.solve();
    } catch {
      return "";
    }
  },
}));
