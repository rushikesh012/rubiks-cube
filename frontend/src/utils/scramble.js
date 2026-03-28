const FACES = ["R", "L", "U", "D", "F", "B"];
const MODIFIERS = ["", "'", "2"];
const FACE_AXIS = {
  R: "x",
  L: "x",
  U: "y",
  D: "y",
  F: "z",
  B: "z",
};

export const generateScramble = (length = Math.floor(Math.random() * 6) + 20) => {
  const moves = [];

  while (moves.length < length) {
    const face = FACES[Math.floor(Math.random() * FACES.length)];
    const modifier = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
    const candidate = `${face}${modifier}`;

    const prev = moves[moves.length - 1];
    const prevFace = prev?.[0];
    const prevPrevFace = moves[moves.length - 2]?.[0];

    if (prevFace === face) continue;

    if (
      prevFace &&
      prevPrevFace &&
      FACE_AXIS[prevFace] === FACE_AXIS[face] &&
      FACE_AXIS[prevPrevFace] === FACE_AXIS[face]
    ) {
      continue;
    }

    moves.push(candidate);
  }

  return moves.join(" ");
};
