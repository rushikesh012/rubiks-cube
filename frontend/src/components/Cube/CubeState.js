import * as THREE from "three";

const STICKER_COLORS = {
  U: "#ffffff",
  D: "#ffea00",
  F: "#22c55e",
  B: "#2563eb",
  R: "#ef4444",
  L: "#ff7a00",
  X: "#334155",
};

const FACE_ORDER = ["R", "L", "U", "D", "F", "B"];

const createFaceMaterials = (x, y, z) => {
  const colors = {
    R: x === 1 ? STICKER_COLORS.R : STICKER_COLORS.X,
    L: x === -1 ? STICKER_COLORS.L : STICKER_COLORS.X,
    U: y === 1 ? STICKER_COLORS.U : STICKER_COLORS.X,
    D: y === -1 ? STICKER_COLORS.D : STICKER_COLORS.X,
    F: z === 1 ? STICKER_COLORS.F : STICKER_COLORS.X,
    B: z === -1 ? STICKER_COLORS.B : STICKER_COLORS.X,
  };

  return FACE_ORDER.map(
    (face) =>
      new THREE.MeshStandardMaterial({
        color: colors[face],
        roughness: 0.32,
        metalness: 0.12,
        emissive: "#0f172a",
        emissiveIntensity: 0.08,
      })
  );
};

export const createCubelets = (rootGroup) => {
  const cubelets = [];
  const geometry = new THREE.BoxGeometry(0.92, 0.92, 0.92);

  for (let x = -1; x <= 1; x += 1) {
    for (let y = -1; y <= 1; y += 1) {
      for (let z = -1; z <= 1; z += 1) {
        const mesh = new THREE.Mesh(geometry, createFaceMaterials(x, y, z));
        mesh.position.set(x, y, z);
        mesh.userData.coord = new THREE.Vector3(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        rootGroup.add(mesh);
        cubelets.push(mesh);
      }
    }
  }

  return cubelets;
};

export const collectLayerCubelets = (cubelets, axis, layer) => {
  return cubelets.filter((cubelet) => {
    const coordinate = cubelet.userData.coord?.[axis] ?? cubelet.position[axis];
    return Math.round(coordinate) === layer;
  });
};

export const snapCubeletCoordinates = (cubelets) => {
  cubelets.forEach((cubelet) => {
    cubelet.position.x = Math.round(cubelet.position.x);
    cubelet.position.y = Math.round(cubelet.position.y);
    cubelet.position.z = Math.round(cubelet.position.z);

    cubelet.rotation.x = Math.round(cubelet.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
    cubelet.rotation.y = Math.round(cubelet.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
    cubelet.rotation.z = Math.round(cubelet.rotation.z / (Math.PI / 2)) * (Math.PI / 2);

    cubelet.userData.coord = new THREE.Vector3(
      cubelet.position.x,
      cubelet.position.y,
      cubelet.position.z
    );
  });
};
