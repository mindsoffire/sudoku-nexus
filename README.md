# 🌌 Sudoku Nexus // Next-Gen Space Sudoku SPA

An immersive, high-fidelity Sudoku Single-Page Application (SPA) featuring dynamic space-themed visuals, synthesized audio, and a smart educational hint engine.

✨ **Play it live on your local machine**: Run `node server.js` and visit `http://localhost:8877`

---

## 🚀 Features

### 1. 💫 Cosmological Visuals
- **Interactive Nebula Canvas**: An HTML5 Canvas renders slow-drifting nebulae and twinkling starfields behind the UI.
- **Victory Supernova**: Successfully aligning the grid triggers a physics-based particle explosion from the center of the board.

### 2. 🎵 Synthesized Audio (Web Audio API)
- The app synthesizes all audio effects natively using browser oscillators—no static sound files or external assets required.
- Play clean sound effects for board navigation, note toggles, errors, grid sweeps, and victory chords.
- Audio feedback can be toggled on/off in the settings.

### 3. 🧠 Smart Hint Engine
- Checks the grid layout for logical strategies and walks you through them step-by-step:
  - **Naked Single**: Identifies if a cell has only one possible candidate remaining.
  - **Hidden Single**: Scans rows, columns, or 3x3 box sectors to locate cells where a specific digit has only one place it can go.
  - **Telemetry Log**: Explains the logic in real-time.

### 4. 📝 Pencil Notes & Auto-Notes
- Input temporary candidates in Note mode (press <kbd>N</kbd>).
- Use **Auto-Notes** to instantly calculate and fill in all valid pencil markings for the entire grid.

### 5. 💾 Telemetry Recovery (Auto-Save)
- Progress, mistakes, timers, score, and notes are saved to `localStorage` automatically.
- Refreshing the browser preserves your active game session.
- Tracks clearing statistics, success ratios, and best times for all 4 difficulties.

---

## 🛠️ Codebase Structure

- **[index.html](index.html)**: Semantic markup, layout structure, and native `<dialog>` overlays.
- **[styles.css](styles.css)**: Glassmorphism tokens, keyframe animations, layouts, and multiple themes (Solar Nebula, Cyberpunk Grid, Solarized Amber, Stellar Light).
- **[game.js](game.js)**: Core game loop, unique backtracking solver, procedural puzzle generator, synthesized audio controller, and canvas animator.
- **[server.js](server.js)**: Zero-dependency Node.js HTTP dev server.

---

## 💻 Running Locally

To run the game locally:
1. Ensure you have Node.js installed.
2. Open your terminal in this directory and execute:
   ```bash
   node server.js
   ```
3. Open your browser and navigate to `http://localhost:8877`

---

## 🌐 Publishing to Free Hosting Servers

You can host this static project online for free using any of these simple methods:

### Option A: GitHub Pages (Recommended)
This hosts your site directly from a GitHub repository for free:
1. Create a new public repository on GitHub (e.g., `sudoku-nexus`).
2. Initialize git in this folder, commit your files, and push them to your repository:
   ```bash
   git init
   -b main
   git add .
   git commit -m "Initialize Sudoku Nexus"
   git remote add origin https://github.com/YOUR_USERNAME/sudoku-nexus.git
   git push -u origin main
   ```
3. On GitHub, go to your repository's **Settings** tab.
4. Select **Pages** from the left-side menu.
5. Under **Build and deployment**, set the source to **Deploy from a branch**, choose the `main` branch, and click **Save**.
6. Within a few minutes, your site will be live at `https://YOUR_USERNAME.github.io/sudoku-nexus/`

### Option B: Netlify (Drag & Drop or Git Integration)
1. Go to [Netlify](https://www.netlify.com/) and log in (or create a free account).
2. Go to the **Sites** tab.
3. Drag and drop this project folder directly into the **"Drag and drop your site folder here"** upload box.
4. Your site will deploy instantly to a randomized `.netlify.app` URL which you can customize for free in your site settings!

### Option C: Vercel (Git Integration)
1. Connect your project to GitHub.
2. Log in to [Vercel](https://vercel.com/) and click **Add New** > **Project**.
3. Import your GitHub repository.
4. Keep the default build settings (leave build command and output directory blank as this is a pure static HTML app).
5. Click **Deploy** and your site will be live on a `.vercel.app` subdomain.
