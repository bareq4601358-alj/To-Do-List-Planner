# To-do list / planner

A small **React + TypeScript + Vite** app for managing tasks with a **week strip** so it feels like a light calendar planner. Data is stored in **localStorage**, so your list persists in this browser until you clear site data.

## Live site (GitHub Pages)

Your site URL (project Pages):

**https://bareq4601358-alj.github.io/To-Do-List-Planner/**

This repo uses **Deploy from a branch**: the built app lives on the **`gh-pages`** branch (only static files — not your TypeScript on `main`).

### One-time GitHub setup

1. Repo → **Settings** → **Pages**.
2. **Build and deployment** → **Source**: **Deploy from a branch**.
3. **Branch**: choose **`gh-pages`** → folder **`/ (root)`** → **Save**.  
   (If `gh-pages` is not listed yet, run **`npm run deploy`** locally once — see below — then refresh the Pages settings.)

### Publish or update the live site

On your computer, in this project folder (with `origin` pointing at your GitHub repo):

```bash
npm install
npm run deploy
```

That runs a production build and pushes the contents of **`dist/`** to the **`gh-pages`** branch. After ~1 minute, reload the live URL above (hard refresh if needed: Cmd+Shift+R).

Whenever you change the app and want the website updated, commit/push to **`main`** as usual, then run **`npm run deploy`** again.

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

Output is in `dist/`. Production builds use base path `/To-Do-List-Planner/` so assets work on GitHub Pages (see `vite.config.ts`).

## Put it on GitHub

```bash
git init
git add .
git commit -m "Initial to-do list app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Tech

- [Vite](https://vite.dev/)
- [React 19](https://react.dev/)
- [gh-pages](https://github.com/tschaub/gh-pages) for branch deploys
