import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const TIMER_STORAGE_KEY = "rubiks-timer-session-v1";
const createSolveId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `solve-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const averageOf = (times, windowSize) => {
  if (times.length < windowSize) {
    return null;
  }

  const values = times.slice(-windowSize).map((item) => item.timeMs);
  const sorted = [...values].sort((a, b) => a - b);
  sorted.shift();
  sorted.pop();
  const total = sorted.reduce((acc, value) => acc + value, 0);
  return total / sorted.length;
};

export const useTimerStore = create(
  persist(
    (set, get) => ({
      running: false,
      startTime: null,
      currentTimeMs: 0,
      history: [],
      isSpaceDown: false,

      setSpaceDown: (value) => set({ isSpaceDown: value }),

      tick: () => {
        const { running, startTime } = get();
        if (!running || startTime == null) return;
        set({ currentTimeMs: performance.now() - startTime });
      },

      startTimer: () => {
        const now = performance.now();
        set({ running: true, startTime: now, currentTimeMs: 0 });
      },

      stopTimer: () => {
        const { running, startTime, history } = get();
        if (!running || startTime == null) return;

        const timeMs = performance.now() - startTime;
        const nextHistory = [
          ...history,
          {
            id: createSolveId(),
            timeMs,
            createdAt: Date.now(),
          },
        ];

        set({
          running: false,
          startTime: null,
          currentTimeMs: timeMs,
          history: nextHistory,
        });
      },

      resetTimer: () => set({ running: false, startTime: null, currentTimeMs: 0 }),

      clearHistory: () => set({ history: [] }),

      getStats: () => {
        const { history } = get();
        if (history.length === 0) {
          return { best: null, ao5: null, ao12: null };
        }

        const best = history.reduce(
          (min, item) => (item.timeMs < min ? item.timeMs : min),
          Number.POSITIVE_INFINITY
        );

        return {
          best,
          ao5: averageOf(history, 5),
          ao12: averageOf(history, 12),
        };
      },
    }),
    {
      name: TIMER_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ history: state.history }),
    }
  )
);
