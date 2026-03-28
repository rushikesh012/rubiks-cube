# Deploy Guide

## Vercel (Recommended)

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

## Netlify

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/dist`

## Manual Build

```bash
cd frontend
npm install
npm run build
```

Deploy the generated `frontend/dist` folder.
