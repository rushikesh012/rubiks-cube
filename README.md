# Rubik Cube

Production-style 3D Rubik Cube trainer built with React + Three.js.

## Features

- Real 3D 3x3 cube (27 cubelets)
- Smooth animated face turns
- Mouse + touch interaction
- Keyboard move support
- Scramble + auto-solve controls
- Timer with Start/Stop/Reset
- Session stats (best, Ao5, Ao12, history)
- Mobile + desktop responsive layouts

## Tech Stack

- React (Vite)
- Tailwind CSS
- @react-three/fiber + drei
- Zustand
- cubejs

## Project Structure

```text
rubiks-cube-app/
  frontend/
    src/
      components/
      store/
      utils/
      pages/
```

## Local Setup

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:5173`

## Build

```bash
cd frontend
npm run build
npm run preview
```

## Controls

- `Space`: Start/Stop timer
- `N`: New scramble
- Face keys: `R L U D F B`
- `Shift + Face`: prime move
- `Alt + Face`: double move
- Drag cube face: perform move
- Drag around cube: orbit view

## Deployment

See [DEPLOY.md](./DEPLOY.md)

## Repo

GitHub: `https://github.com/rushikesh012/rubiks-cube.git`
