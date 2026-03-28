import { parseMoveString } from "../../utils/moveParser";

const FACE_KEYS = ["R", "L", "U", "D", "F", "B"];

export const bindCubeKeyboardControls = ({ onMoves, onToggleTimer, onGenerateScramble }) => {
  const down = new Set();

  const onKeyDown = (event) => {
    const key = event.key.toUpperCase();

    if (key === " ") {
      event.preventDefault();
      if (down.has("SPACE")) return;
      down.add("SPACE");
      onToggleTimer?.();
      return;
    }

    if (key === "ENTER") {
      const input = document.activeElement;
      if (input?.dataset?.algInput === "true") {
        const tokens = parseMoveString(input.value);
        if (tokens.length) {
          onMoves(tokens);
          input.value = "";
        }
      }
      return;
    }

    if (key === "N") {
      onGenerateScramble?.();
      return;
    }

    if (!FACE_KEYS.includes(key)) return;

    let move = key;
    if (event.shiftKey) {
      move = `${key}'`;
    } else if (event.altKey) {
      move = `${key}2`;
    }

    onMoves([move]);
  };

  const onKeyUp = (event) => {
    if (event.key === " ") {
      down.delete("SPACE");
    }
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  return () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  };
};
