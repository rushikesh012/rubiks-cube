import { useCallback, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useCubeStore, getMoveDefinition } from "../../store/useCubeStore";
import { createCubelets, collectLayerCubelets, snapCubeletCoordinates } from "./CubeState";

const MOVE_DURATION = 0.16;
const DESKTOP_DRAG_THRESHOLD = 14;
const TOUCH_DRAG_THRESHOLD = 8;
const FACE_NORMALS = {
  R: new THREE.Vector3(1, 0, 0),
  L: new THREE.Vector3(-1, 0, 0),
  U: new THREE.Vector3(0, 1, 0),
  D: new THREE.Vector3(0, -1, 0),
  F: new THREE.Vector3(0, 0, 1),
  B: new THREE.Vector3(0, 0, -1),
};
const OPPOSITE_FACE = { R: "L", L: "R", U: "D", D: "U", F: "B", B: "F" };

const faceFromNormal = (normal) => {
  const absX = Math.abs(normal.x);
  const absY = Math.abs(normal.y);
  const absZ = Math.abs(normal.z);

  if (absX >= absY && absX >= absZ) return normal.x > 0 ? "R" : "L";
  if (absY >= absX && absY >= absZ) return normal.y > 0 ? "U" : "D";
  return normal.z > 0 ? "F" : "B";
};

const axisVectorFor = (axis) => {
  if (axis === "x") return new THREE.Vector3(1, 0, 0);
  if (axis === "y") return new THREE.Vector3(0, 1, 0);
  return new THREE.Vector3(0, 0, 1);
};

const projectToPixels = (point, camera, rect) => {
  const p = point.clone().project(camera);
  return new THREE.Vector2(
    ((p.x + 1) * 0.5) * rect.width,
    ((1 - p.y) * 0.5) * rect.height
  );
};

const deriveMoveFromDrag = (face, dx, dy, worldPoint, camera, rect) => {
  const drag = new THREE.Vector2(dx, dy);
  const candidates = [face, `${face}'`];
  let best = candidates[0];
  let bestScore = -Infinity;

  candidates.forEach((token) => {
    const def = getMoveDefinition(token);
    if (!def) return;

    const axis = axisVectorFor(def.axis);
    const q = new THREE.Quaternion().setFromAxisAngle(axis, def.direction * 0.22);
    const movedPoint = worldPoint.clone().applyQuaternion(q);

    const a = projectToPixels(worldPoint, camera, rect);
    const b = projectToPixels(movedPoint, camera, rect);
    const motion = b.sub(a);
    const score = motion.dot(drag);

    if (score > bestScore) {
      bestScore = score;
      best = token;
    }
  });

  return best;
};

function CubeCore() {
  const { scene, gl, camera } = useThree();
  const rootRef = useRef(new THREE.Group());
  const pivotRef = useRef(new THREE.Group());
  const controlsRef = useRef(null);
  const cubeletsRef = useRef([]);
  const animationRef = useRef(null);

  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const dragStateRef = useRef({ active: false, startX: 0, startY: 0, face: null, worldPoint: null });

  const dequeueMove = useCubeStore((state) => state.dequeueMove);
  const queueAlgorithm = useCubeStore((state) => state.queueAlgorithm);
  const performMoveOnModel = useCubeStore((state) => state.performMoveOnModel);
  const setAnimatingMove = useCubeStore((state) => state.setAnimatingMove);
  const setViewFaceMap = useCubeStore((state) => state.setViewFaceMap);

  const updateViewFaceMap = useCallback(() => {
    const nearestFace = (vector) => {
      let bestFace = "F";
      let bestDot = -Infinity;
      Object.entries(FACE_NORMALS).forEach(([face, normal]) => {
        const dot = normal.dot(vector);
        if (dot > bestDot) {
          bestDot = dot;
          bestFace = face;
        }
      });
      return bestFace;
    };

    const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
    const upVector = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion).normalize();
    const frontVector = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-1).normalize();

    const rightFace = nearestFace(rightVector);
    const upFace = nearestFace(upVector);
    const frontFace = nearestFace(frontVector);

    const nextMap = {
      right: rightFace,
      left: OPPOSITE_FACE[rightFace],
      up: upFace,
      down: OPPOSITE_FACE[upFace],
      front: frontFace,
      back: OPPOSITE_FACE[frontFace],
    };

    const prevMap = useCubeStore.getState().viewFaceMap;
    const isSame =
      prevMap.left === nextMap.left &&
      prevMap.right === nextMap.right &&
      prevMap.up === nextMap.up &&
      prevMap.down === nextMap.down &&
      prevMap.front === nextMap.front &&
      prevMap.back === nextMap.back;

    if (!isSame) {
      setViewFaceMap(nextMap);
    }
  }, [camera, setViewFaceMap]);

  useEffect(() => {
    scene.add(rootRef.current);
    scene.add(pivotRef.current);
    cubeletsRef.current = createCubelets(rootRef.current);
    updateViewFaceMap();

    return () => {
      scene.remove(rootRef.current);
      scene.remove(pivotRef.current);
      cubeletsRef.current.forEach((mesh) => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => mat.dispose());
        } else {
          mesh.material.dispose();
        }
      });
      cubeletsRef.current = [];
    };
  }, [scene, updateViewFaceMap]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.style.touchAction = "none";

    const setPointerFromEvent = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (event) => {
      if (animationRef.current) return;

      setPointerFromEvent(event);
      raycasterRef.current.setFromCamera(pointerRef.current, camera);
      const intersections = raycasterRef.current.intersectObjects(cubeletsRef.current, false);
      if (!intersections.length) return;

      const intersection = intersections[0];
      const worldNormal = intersection.face.normal
        .clone()
        .transformDirection(intersection.object.matrixWorld);

      dragStateRef.current = {
        active: true,
        startX: event.clientX,
        startY: event.clientY,
        face: faceFromNormal(worldNormal),
        worldPoint: intersection.point.clone(),
      };

      if (controlsRef.current && event.pointerType !== "touch") {
        controlsRef.current.enabled = false;
      }
    };

    const onPointerUp = (event) => {
      const drag = dragStateRef.current;
      if (!drag.active) return;

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      const distance = Math.hypot(dx, dy);
      const threshold = event.pointerType === "touch" ? TOUCH_DRAG_THRESHOLD : DESKTOP_DRAG_THRESHOLD;
      const rect = canvas.getBoundingClientRect();
      const move =
        distance >= threshold && drag.worldPoint
          ? deriveMoveFromDrag(drag.face, dx, dy, drag.worldPoint, camera, rect)
          : null;

      if (move) {
        queueAlgorithm(move);
      }

      dragStateRef.current = { active: false, startX: 0, startY: 0, face: null, worldPoint: null };
      if (controlsRef.current && event.pointerType !== "touch") {
        controlsRef.current.enabled = true;
      }
    };

    const onPointerCancel = () => {
      dragStateRef.current = { active: false, startX: 0, startY: 0, face: null, worldPoint: null };
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    window.addEventListener("blur", onPointerCancel);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      window.removeEventListener("blur", onPointerCancel);
    };
  }, [camera, gl, queueAlgorithm]);

  const startMove = useCallback(
    (token) => {
      const move = getMoveDefinition(token);
      if (!move) return;

      const layerCubelets = collectLayerCubelets(cubeletsRef.current, move.axis, move.layer);
      if (!layerCubelets.length) return;

      pivotRef.current.rotation.set(0, 0, 0);
      layerCubelets.forEach((cubelet) => pivotRef.current.attach(cubelet));

      animationRef.current = {
        move,
        token,
        elapsed: 0,
        cubelets: layerCubelets,
      };
      setAnimatingMove(true);
    },
    [setAnimatingMove]
  );

  const finishMove = useCallback(() => {
    const animation = animationRef.current;
    if (!animation) return;

    animation.cubelets.forEach((cubelet) => rootRef.current.attach(cubelet));
    snapCubeletCoordinates(cubeletsRef.current);

    pivotRef.current.rotation.set(0, 0, 0);
    performMoveOnModel(animation.token);
    animationRef.current = null;
    setAnimatingMove(false);
  }, [performMoveOnModel, setAnimatingMove]);

  useFrame((_, delta) => {
    const active = animationRef.current;

    if (!active) {
      const nextMove = useCubeStore.getState().moveQueue.length ? dequeueMove() : null;
      if (nextMove) startMove(nextMove);
      return;
    }

    active.elapsed += delta;
    const progress = Math.min(active.elapsed / MOVE_DURATION, 1);
    const eased = 1 - (1 - progress) * (1 - progress);
    const angle = active.move.direction * active.move.turns * (Math.PI / 2) * eased;

    pivotRef.current.rotation.set(
      active.move.axis === "x" ? angle : 0,
      active.move.axis === "y" ? angle : 0,
      active.move.axis === "z" ? angle : 0
    );

    if (progress >= 1) {
      finishMove();
    }
  });

  return (
    <>
      <ambientLight intensity={1.1} />
      <hemisphereLight args={["#dbeafe", "#0f172a", 0.95]} />
      <directionalLight position={[6, 8, 4]} intensity={1.8} />
      <pointLight position={[-4, 2, -5]} intensity={0.9} color="#93c5fd" />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0.08}
        maxPolarAngle={Math.PI - 0.08}
        rotateSpeed={0.72}
        onChange={updateViewFaceMap}
      />
    </>
  );
}

export default function Cube() {
  const glOptions = useMemo(
    () => ({ antialias: true, powerPreference: "high-performance" }),
    []
  );

  return (
    <div className="glass touch-none h-[270px] w-full overflow-hidden rounded-2xl md:h-[500px] xl:h-[560px]">
      <Canvas
        dpr={[1, 1.5]}
        gl={glOptions}
        camera={{ position: [6, 5, 6], fov: 38 }}
        frameloop="always"
        onCreated={({ gl: renderer }) => {
          renderer.outputColorSpace = THREE.SRGBColorSpace;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.45;
        }}
      >
        <CubeCore />
      </Canvas>
    </div>
  );
}
