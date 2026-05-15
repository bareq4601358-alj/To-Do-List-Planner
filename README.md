# To-do list / planner

A small **React + TypeScript + Vite** app for managing tasks with a **week strip** so it feels like a light calendar planner. Data is stored in **localStorage**, so your list persists in this browser until you clear site data.

## Features

- **Week view**: jump weeks, go to today, pick a day to see that day’s tasks
- **Inbox**: tasks without a date; new tasks go on the selected day or into the inbox
- Check items off, delete, and set **due date** per task (moves items between days and inbox)
- Filter: All, Active, Done (within the current day or inbox)
- **Clear done in view** removes completed tasks only for what you’re looking at
- Responsive layout and keyboard-friendly controls
- Light / dark styling follows your system preference

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

Output is in `dist/`.

## Put it on GitHub

1. Create a new repository on GitHub (empty, no README if you are pushing this folder as the first commit).
2. In this project folder:

   ```bash
   git init
   git add .
   git commit -m "Initial to-do list app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

3. Optional — **GitHub Pages**: after the repo exists, use **Actions → Pages** or **Settings → Pages** and deploy the `dist` folder from the `main` branch (or use a workflow that runs `npm ci && npm run build`). If your site is served from `https://username.github.io/repo-name/`, set `base` in `vite.config.ts` to `'/repo-name/'` before building so assets load correctly.

## Tech

- [Vite](https://vite.dev/)
- [React 19](https://react.dev/)
