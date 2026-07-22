/**
 * SUDOKU NEXUS // Core Game Engine
 * Features: Backtracking solver, procedural grid generator, sound synthesizer,
 * HTML5 canvas background animator, smart hint engine, local storage, history.
 */

// --- Sound FX Synthesizer (Web Audio API) ---
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }
  
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  
  playTone(freq, type, duration, volume = 0.1, rampType = 'exponential') {
    if (!this.enabled) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      if (rampType === 'exponential') {
        gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + duration);
      } else {
        gain.gain.linearRampToValueAtTime(0.00001, this.ctx.currentTime + duration);
      }
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context blocked or failed to play tone:", e);
    }
  }
  
  playClick() { 
    this.playTone(800, 'sine', 0.05, 0.02); 
  }
  
  playNoteToggle() {
    this.playTone(1100, 'sine', 0.08, 0.015);
  }
  
  playInputSuccess() { 
    this.playTone(523.25, 'sine', 0.12, 0.06); // C5
  }
  
  playAction() {
    this.playTone(700, 'triangle', 0.08, 0.04);
  }

  playError() {
    if (!this.enabled) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(70, this.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {}
  }
  
  playGridSweep() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    // Play quick ascending laser-like sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.00001, now + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.4);
  }

  playWin() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major scale arpeggio
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.6, 0.08);
      }, idx * 100);
    });
  }
}

const sfx = new SoundFX();


// --- Starfield & Nebula Canvas Background Animator ---
class BackgroundAnimator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.nebulae = [];
    this.particles = [];
    this.animationId = null;
    this.lastTime = 0;
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    this.initStars(120);
    this.initNebulae();
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  initStars(count) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        direction: Math.random() > 0.5 ? 1 : -1
      });
    }
  }
  
  initNebulae() {
    // Large slow drifting light blobs
    this.nebulae = [
      {
        x: this.canvas.width * 0.25,
        y: this.canvas.height * 0.3,
        radius: Math.min(this.canvas.width, this.canvas.height) * 0.4,
        color: 'hsla(190, 100%, 50%, 0.04)',
        angle: 0,
        speed: 0.0005
      },
      {
        x: this.canvas.width * 0.75,
        y: this.canvas.height * 0.7,
        radius: Math.min(this.canvas.width, this.canvas.height) * 0.5,
        color: 'hsla(280, 100%, 65%, 0.035)',
        angle: Math.PI,
        speed: 0.0003
      }
    ];
  }
  
  createWinExplosion() {
    this.particles = [];
    const colors = ['#00e5ff', '#ba68c8', '#ffeb3b', '#ff1744', '#00e676'];
    const count = 150;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.015 + 0.008,
        gravity: 0.05
      });
    }
  }
  
  update(time) {
    const delta = time - this.lastTime;
    this.lastTime = time;
    
    // Clear canvas with deep space gradient matching CSS
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 10,
      this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height)
    );
    // Read theme colors dynamically if possible, else fallback
    const theme = document.documentElement.getAttribute('data-theme') || 'nebula';
    let spaceColor = 'rgb(10, 12, 22)';
    if (theme === 'cyberpunk') spaceColor = 'rgb(12, 2, 15)';
    else if (theme === 'solarized') spaceColor = 'rgb(18, 12, 8)';
    else if (theme === 'minimalist') spaceColor = 'rgb(240, 242, 246)';
    
    this.ctx.fillStyle = spaceColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 1. Draw Nebulae (Drifting Glow Blobs)
    if (theme !== 'minimalist') {
      this.nebulae.forEach(neb => {
        neb.angle += neb.speed;
        // Float around in a slow circle
        const ox = Math.cos(neb.angle) * 30;
        const oy = Math.sin(neb.angle) * 30;
        
        const g = this.ctx.createRadialGradient(
          neb.x + ox, neb.y + oy, 0,
          neb.x + ox, neb.y + oy, neb.radius
        );
        g.addColorStop(0, neb.color);
        g.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = g;
        this.ctx.beginPath();
        this.ctx.arc(neb.x + ox, neb.y + oy, neb.radius, 0, Math.PI * 2);
        this.ctx.fill();
      });
    }
    
    // 2. Draw & Twinkle Stars
    const starColor = theme === 'minimalist' ? 'rgba(0,0,0,' : 'rgba(255,255,255,';
    this.stars.forEach(star => {
      star.alpha += star.twinkleSpeed * star.direction;
      if (star.alpha >= 1) {
        star.alpha = 1;
        star.direction = -1;
      } else if (star.alpha <= 0.1) {
        star.alpha = 0.1;
        star.direction = 1;
      }
      
      this.ctx.fillStyle = starColor + star.alpha + ')';
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    // 3. Draw & Animate Particles (Confetti)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity; // Gravity pull
      p.alpha -= p.decay;
      
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0; // Reset
    
    this.animationId = requestAnimationFrame(t => this.update(t));
  }
  
  start() {
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(t => this.update(t));
  }
}


// --- Flat Optimized Backtracking Solver ---

function isValidFlat(board, idx, val) {
  const r = Math.floor(idx / 9);
  const c = idx % 9;
  const boxRow = Math.floor(r / 3) * 3;
  const boxCol = Math.floor(c / 3) * 3;
  
  for (let i = 0; i < 9; i++) {
    // Row check
    if (board[r * 9 + i] === val) return false;
    // Column check
    if (board[i * 9 + c] === val) return false;
    // Box check
    const bIdx = (boxRow + Math.floor(i / 3)) * 9 + (boxCol + (i % 3));
    if (board[bIdx] === val) return false;
  }
  return true;
}

function solveBacktrack(board) {
  for (let i = 0; i < 81; i++) {
    if (board[i] === 0) {
      for (let val = 1; val <= 9; val++) {
        if (isValidFlat(board, i, val)) {
          board[i] = val;
          if (solveBacktrack(board)) return true;
          board[i] = 0;
        }
      }
      return false;
    }
  }
  return true;
}

// Counts solutions up to limit. Stops early if solutions >= limit.
function countSolutionsFlat(board, solutions = { count: 0 }, limit = 2) {
  for (let i = 0; i < 81; i++) {
    if (board[i] === 0) {
      for (let val = 1; val <= 9; val++) {
        if (isValidFlat(board, i, val)) {
          board[i] = val;
          countSolutionsFlat(board, solutions, limit);
          board[i] = 0;
          if (solutions.count >= limit) return solutions.count;
        }
      }
      return solutions.count;
    }
  }
  solutions.count++;
  return solutions.count;
}

// Procedural Generator
function generateSudoku(difficulty) {
  let board = new Array(81).fill(0);
  
  // 1. Fill diagonal 3x3 boxes (mutually independent)
  for (let box = 0; box < 9; box += 4) {
    let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    const br = Math.floor(box / 3) * 3;
    const bc = (box % 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        board[(br + r) * 9 + (bc + c)] = nums.pop();
      }
    }
  }
  
  // 2. Solve the rest of the board to establish target mapping
  solveBacktrack(board);
  const solvedState = [...board];
  
  // 3. Define target clue limits based on difficulty
  let targetClues = 32;
  if (difficulty === 'easy') targetClues = 38;
  else if (difficulty === 'hard') targetClues = 26;
  else if (difficulty === 'expert') targetClues = 21;
  
  // Create randomized index access order
  let indices = Array.from({ length: 81 }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  let currentClues = 81;
  let attempts = 0;
  
  // Try to remove nodes, checking for unique solution each time
  for (let idx of indices) {
    if (currentClues <= targetClues || attempts > 60) break;
    
    const originalVal = board[idx];
    board[idx] = 0;
    
    let solCount = { count: 0 };
    countSolutionsFlat([...board], solCount, 2);
    
    if (solCount.count === 1) {
      currentClues--;
    } else {
      board[idx] = originalVal; // Restore cell
      attempts++; // Count unsuccessful removals
    }
  }
  
  return {
    initial: board,
    solution: solvedState
  };
}


// --- Main Game State Manager ---
class SudokuGame {
  constructor() {
    this.initialBoard = new Array(81).fill(0);
    this.solutionBoard = new Array(81).fill(0);
    this.currentBoard = new Array(81).fill(0);
    this.notesBoard = Array.from({ length: 81 }, () => new Array(10).fill(false));
    
    this.selectedCellIdx = null;
    this.difficulty = 'medium';
    this.mistakesCount = 0;
    this.maxMistakes = 3;
    this.score = 0;
    this.hintsUsed = 0;
    
    // Timer
    this.timerSeconds = 0;
    this.timerInterval = null;
    this.timerActive = true;
    
    // History (for Undo support)
    this.history = [];
    
    // Settings Config
    this.config = {
      theme: 'nebula',
      sound: true,
      highlightPeer: true,
      highlightSame: true,
      highlightConflicts: true,
      timer: true
    };
    
    // Initialization
    this.animator = new BackgroundAnimator('bg-canvas');
    this.animator.start();
    
    this.loadStats();
    this.loadSettings();
    this.loadSavedGame();
    this.bindEvents();
    
    if (this.currentBoard.some(v => v !== 0)) {
      // Game loaded from storage
      this.renderBoard();
      this.updateUIValues();
      if (this.config.timer) this.startTimer();
    } else {
      // Trigger new game modal on launch
      setTimeout(() => {
        const dialog = document.getElementById('new-game-dialog');
        dialog.showModal();
      }, 300);
    }
  }
  
  // --- Local Storage Management ---
  loadStats() {
    const raw = localStorage.getItem('sudoku_stats');
    this.stats = raw ? JSON.parse(raw) : {
      easy: { played: 0, won: 0, bestTime: null },
      medium: { played: 0, won: 0, bestTime: null },
      hard: { played: 0, won: 0, bestTime: null },
      expert: { played: 0, won: 0, bestTime: null }
    };
  }
  
  saveStats() {
    localStorage.setItem('sudoku_stats', JSON.stringify(this.stats));
  }
  
  loadSettings() {
    const raw = localStorage.getItem('sudoku_settings');
    if (raw) {
      this.config = { ...this.config, ...JSON.parse(raw) };
    }
    
    // Sync DOM settings inputs
    document.getElementById('setting-theme').value = this.config.theme;
    document.getElementById('setting-sound').checked = this.config.sound;
    document.getElementById('setting-highlight-peer').checked = this.config.highlightPeer;
    document.getElementById('setting-highlight-same').checked = this.config.highlightSame;
    document.getElementById('setting-highlight-conflicts').checked = this.config.highlightConflicts;
    document.getElementById('setting-timer').checked = this.config.timer;
    
    sfx.enabled = this.config.sound;
    document.documentElement.setAttribute('data-theme', this.config.theme);
  }
  
  saveSettings() {
    localStorage.setItem('sudoku_settings', JSON.stringify(this.config));
    sfx.enabled = this.config.sound;
    document.documentElement.setAttribute('data-theme', this.config.theme);
    
    // Toggle timer visibility
    const timerRow = document.getElementById('display-timer').parentElement;
    if (this.config.timer) {
      timerRow.style.display = 'flex';
      this.startTimer();
    } else {
      timerRow.style.display = 'none';
      this.stopTimer();
    }
  }
  
  loadSavedGame() {
    const raw = localStorage.getItem('sudoku_current_game');
    if (raw) {
      const data = JSON.parse(raw);
      this.initialBoard = data.initial;
      this.solutionBoard = data.solution;
      this.currentBoard = data.current;
      this.notesBoard = data.notes;
      this.difficulty = data.difficulty;
      this.mistakesCount = data.mistakes;
      this.score = data.score;
      this.timerSeconds = data.timerSeconds;
      this.hintsUsed = data.hintsUsed || 0;
      this.history = data.history || [];
    }
  }
  
  saveCurrentGame() {
    const data = {
      initial: this.initialBoard,
      solution: this.solutionBoard,
      current: this.currentBoard,
      notes: this.notesBoard,
      difficulty: this.difficulty,
      mistakes: this.mistakesCount,
      score: this.score,
      timerSeconds: this.timerSeconds,
      hintsUsed: this.hintsUsed,
      history: this.history
    };
    localStorage.setItem('sudoku_current_game', JSON.stringify(data));
  }
  
  clearSavedGame() {
    localStorage.removeItem('sudoku_current_game');
  }

  // --- Game Controls ---
  initNewGame(diff) {
    this.difficulty = diff;
    this.selectedCellIdx = null;
    this.mistakesCount = 0;
    this.score = 0;
    this.timerSeconds = 0;
    this.hintsUsed = 0;
    this.history = [];
    this.notesBoard = Array.from({ length: 81 }, () => new Array(10).fill(false));
    
    // Clear and build the procedural puzzle
    const puzzle = generateSudoku(diff);
    this.initialBoard = puzzle.initial;
    this.currentBoard = [...puzzle.initial];
    this.solutionBoard = puzzle.solution;
    
    // Record statistic increment
    if (this.stats[diff]) {
      this.stats[diff].played++;
      this.saveStats();
    }
    
    this.saveCurrentGame();
    this.renderBoard();
    this.updateUIValues();
    
    document.getElementById('hint-output').textContent = "Select a cell and tap \"Hint\" to query the solver AI.";
    
    if (this.config.timer) {
      this.startTimer();
    }
    
    sfx.playGridSweep();
  }
  
  restartPuzzle() {
    this.selectedCellIdx = null;
    this.mistakesCount = 0;
    this.score = 0;
    this.timerSeconds = 0;
    this.hintsUsed = 0;
    this.history = [];
    this.currentBoard = [...this.initialBoard];
    this.notesBoard = Array.from({ length: 81 }, () => new Array(10).fill(false));
    
    this.saveCurrentGame();
    this.renderBoard();
    this.updateUIValues();
    
    if (this.config.timer) this.startTimer();
    sfx.playAction();
  }
  
  // --- Timer ---
  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this.updateTimerDisplay();
      if (this.timerSeconds % 10 === 0) {
        this.saveCurrentGame(); // Auto-save state every 10s
      }
    }, 1000);
  }
  
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
  
  updateTimerDisplay() {
    const mins = Math.floor(this.timerSeconds / 60).toString().padStart(2, '0');
    const secs = (this.timerSeconds % 60).toString().padStart(2, '0');
    document.getElementById('display-timer').textContent = `${mins}:${secs}`;
  }
  
  // --- UI Update Controls ---
  updateUIValues() {
    document.getElementById('display-difficulty').textContent = this.difficulty.toUpperCase();
    document.getElementById('display-mistakes').textContent = `${this.maxMistakes - this.mistakesCount} / ${this.maxMistakes} SHIELDS`;
    document.getElementById('display-score').textContent = this.score.toString().padStart(5, '0');
    this.updateTimerDisplay();
  }
  
  renderBoard() {
    const boardEl = document.getElementById('sudoku-board');
    boardEl.innerHTML = ''; // Clear
    
    for (let i = 0; i < 81; i++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('tabindex', '0');
      cell.setAttribute('data-index', i);
      cell.id = `cell-${i}`;
      
      const val = this.currentBoard[i];
      const isGiven = this.initialBoard[i] !== 0;
      
      // Values element
      const valEl = document.createElement('span');
      valEl.classList.add('cell-value');
      cell.appendChild(valEl);
      
      if (isGiven) {
        cell.classList.add('given');
        valEl.textContent = val;
      } else if (val !== 0) {
        cell.classList.add('user');
        valEl.textContent = val;
        
        // Error validation
        if (this.config.highlightConflicts && val !== this.solutionBoard[i]) {
          cell.classList.add('error');
        }
      } else {
        // Render Pencil Marks
        const notesGrid = document.createElement('div');
        notesGrid.classList.add('cell-notes');
        
        for (let n = 1; n <= 9; n++) {
          const noteEl = document.createElement('span');
          noteEl.classList.add('cell-note');
          noteEl.textContent = n;
          if (this.notesBoard[i][n]) {
            noteEl.classList.add('active');
          }
          notesGrid.appendChild(noteEl);
        }
        cell.appendChild(notesGrid);
      }
      
      boardEl.appendChild(cell);
    }
    
    this.updateBoardHighlights();
  }
  
  updateBoardHighlights() {
    // Clear dynamic states
    const cells = document.querySelectorAll('.cell');
    cells.forEach(c => {
      c.classList.remove('selected', 'peer', 'same-number');
    });
    
    if (this.selectedCellIdx === null) return;
    
    const selCell = document.getElementById(`cell-${this.selectedCellIdx}`);
    if (selCell) selCell.classList.add('selected');
    
    const selectedVal = this.currentBoard[this.selectedCellIdx];
    const selR = Math.floor(this.selectedCellIdx / 9);
    const selC = this.selectedCellIdx % 9;
    const selBoxR = Math.floor(selR / 3) * 3;
    const selBoxC = Math.floor(selC / 3) * 3;
    
    cells.forEach(cell => {
      const idx = parseInt(cell.getAttribute('data-index'));
      if (idx === this.selectedCellIdx) return;
      
      const val = this.currentBoard[idx];
      const r = Math.floor(idx / 9);
      const c = idx % 9;
      const boxR = Math.floor(r / 3) * 3;
      const boxC = Math.floor(c / 3) * 3;
      
      // 1. Same row/col/box coordinates highlight
      if (this.config.highlightPeer) {
        if (r === selR || c === selC || (boxR === selBoxR && boxC === selBoxC)) {
          cell.classList.add('peer');
        }
      }
      
      // 2. Same value highlight
      if (this.config.highlightSame && selectedVal !== 0 && val === selectedVal) {
        cell.classList.add('same-number');
      }
    });
  }
  
  // --- Game Inputs & Calculations ---
  selectCell(idx) {
    if (idx < 0 || idx >= 81) return;
    this.selectedCellIdx = idx;
    this.updateBoardHighlights();
  }
  
  inputNumber(num) {
    if (this.selectedCellIdx === null) return;
    
    // Ignore input if it's a structural given node
    if (this.initialBoard[this.selectedCellIdx] !== 0) return;
    
    const isNotesMode = document.getElementById('btn-notes').classList.contains('active');
    
    if (isNotesMode) {
      // Undo History Setup
      this.pushHistoryState(this.selectedCellIdx);
      
      // Toggle note status
      const currentNoteState = this.notesBoard[this.selectedCellIdx][num];
      this.notesBoard[this.selectedCellIdx][num] = !currentNoteState;
      this.currentBoard[this.selectedCellIdx] = 0; // Clear cell value if toggling note
      
      sfx.playNoteToggle();
      this.renderCell(this.selectedCellIdx);
      this.saveCurrentGame();
    } else {
      // Direct placement mode
      const prevVal = this.currentBoard[this.selectedCellIdx];
      if (prevVal === num) return; // Unchanged
      
      this.pushHistoryState(this.selectedCellIdx);
      this.currentBoard[this.selectedCellIdx] = num;
      
      // Clear notes on number finalization
      this.notesBoard[this.selectedCellIdx].fill(false);
      
      if (num === this.solutionBoard[this.selectedCellIdx]) {
        // Correct value
        sfx.playInputSuccess();
        this.score += 100;
        
        // Clean notes in related row, column, and box
        this.cleanRelatedNotes(this.selectedCellIdx, num);
        
        // Check for completed structural sectors
        this.checkCompletedSectors(this.selectedCellIdx);
      } else {
        // Anomaly / Error
        sfx.playError();
        if (this.config.highlightConflicts) {
          this.mistakesCount++;
          this.score = Math.max(0, this.score - 50);
          this.updateUIValues();
          
          if (this.mistakesCount >= this.maxMistakes) {
            this.handleGameOver();
            return;
          }
        }
      }
      
      this.renderCell(this.selectedCellIdx);
      this.updateBoardHighlights();
      this.saveCurrentGame();
      this.checkGameWin();
    }
  }
  
  eraseCell() {
    if (this.selectedCellIdx === null) return;
    if (this.initialBoard[this.selectedCellIdx] !== 0) return; // Cannot delete given
    
    const prevVal = this.currentBoard[this.selectedCellIdx];
    const notesActive = this.notesBoard[this.selectedCellIdx].some(n => n);
    
    if (prevVal === 0 && !notesActive) return; // Already empty
    
    this.pushHistoryState(this.selectedCellIdx);
    
    this.currentBoard[this.selectedCellIdx] = 0;
    this.notesBoard[this.selectedCellIdx].fill(false);
    
    sfx.playAction();
    this.renderCell(this.selectedCellIdx);
    this.updateBoardHighlights();
    this.saveCurrentGame();
  }
  
  renderCell(idx) {
    const cellEl = document.getElementById(`cell-${idx}`);
    if (!cellEl) return;
    
    // Completely recreate cell contents to avoid UI synchronization errors
    cellEl.className = 'cell';
    cellEl.innerHTML = '';
    
    const val = this.currentBoard[idx];
    const isGiven = this.initialBoard[idx] !== 0;
    
    const valEl = document.createElement('span');
    valEl.classList.add('cell-value');
    cellEl.appendChild(valEl);
    
    if (isGiven) {
      cellEl.classList.add('given');
      valEl.textContent = val;
    } else if (val !== 0) {
      cellEl.classList.add('user');
      valEl.textContent = val;
      
      if (this.config.highlightConflicts && val !== this.solutionBoard[idx]) {
        cellEl.classList.add('error');
      }
    } else {
      const notesGrid = document.createElement('div');
      notesGrid.classList.add('cell-notes');
      
      for (let n = 1; n <= 9; n++) {
        const noteEl = document.createElement('span');
        noteEl.classList.add('cell-note');
        noteEl.textContent = n;
        if (this.notesBoard[idx][n]) {
          noteEl.classList.add('active');
        }
        notesGrid.appendChild(noteEl);
      }
      cellEl.appendChild(notesGrid);
    }
  }
  
  // Clean notes in the same row, col, and box for a newly placed number
  cleanRelatedNotes(idx, num) {
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    const boxRow = Math.floor(r / 3) * 3;
    const boxCol = Math.floor(c / 3) * 3;
    
    for (let i = 0; i < 9; i++) {
      // Row
      const rIdx = r * 9 + i;
      if (this.notesBoard[rIdx][num]) {
        this.notesBoard[rIdx][num] = false;
        this.renderCell(rIdx);
      }
      // Col
      const cIdx = i * 9 + c;
      if (this.notesBoard[cIdx][num]) {
        this.notesBoard[cIdx][num] = false;
        this.renderCell(cIdx);
      }
      // Box
      const bIdx = (boxRow + Math.floor(i / 3)) * 9 + (boxCol + (i % 3));
      if (this.notesBoard[bIdx][num]) {
        this.notesBoard[bIdx][num] = false;
        this.renderCell(bIdx);
      }
    }
  }
  
  // Checks if a row, column, or box has been completed on entry
  checkCompletedSectors(idx) {
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    const boxRow = Math.floor(r / 3) * 3;
    const boxCol = Math.floor(c / 3) * 3;
    
    // Check Row
    let rowComplete = true;
    for (let i = 0; i < 9; i++) {
      const idxToCheck = r * 9 + i;
      if (this.currentBoard[idxToCheck] !== this.solutionBoard[idxToCheck]) {
        rowComplete = false; break;
      }
    }
    if (rowComplete) this.triggerSectorSweep('row', r);
    
    // Check Col
    let colComplete = true;
    for (let i = 0; i < 9; i++) {
      const idxToCheck = i * 9 + c;
      if (this.currentBoard[idxToCheck] !== this.solutionBoard[idxToCheck]) {
        colComplete = false; break;
      }
    }
    if (colComplete) this.triggerSectorSweep('col', c);
    
    // Check Box
    let boxComplete = true;
    for (let i = 0; i < 9; i++) {
      const idxToCheck = (boxRow + Math.floor(i / 3)) * 9 + (boxCol + (i % 3));
      if (this.currentBoard[idxToCheck] !== this.solutionBoard[idxToCheck]) {
        boxComplete = false; break;
      }
    }
    if (boxComplete) this.triggerSectorSweep('box', { r: boxRow, c: boxCol });
  }
  
  triggerSectorSweep(type, identifier) {
    const cellsToSweep = [];
    
    if (type === 'row') {
      for (let i = 0; i < 9; i++) cellsToSweep.push(identifier * 9 + i);
    } else if (type === 'col') {
      for (let i = 0; i < 9; i++) cellsToSweep.push(i * 9 + identifier);
    } else if (type === 'box') {
      for (let i = 0; i < 9; i++) {
        cellsToSweep.push((identifier.r + Math.floor(i / 3)) * 9 + (identifier.c + (i % 3)));
      }
    }
    
    cellsToSweep.forEach(idx => {
      const cellEl = document.getElementById(`cell-${idx}`);
      if (cellEl) {
        cellEl.classList.add('completed-sweep');
        setTimeout(() => cellEl.classList.remove('completed-sweep'), 600);
      }
    });
    
    sfx.playGridSweep();
  }
  
  // --- Undo Mechanics ---
  pushHistoryState(cellIdx) {
    // Deep copy notes of targeted cell
    const cellNotesCopy = [...this.notesBoard[cellIdx]];
    this.history.push({
      idx: cellIdx,
      val: this.currentBoard[cellIdx],
      notes: cellNotesCopy
    });
    // Cap undo history at 50 elements
    if (this.history.length > 50) this.history.shift();
  }
  
  undoAction() {
    if (this.history.length === 0) return;
    
    const lastState = this.history.pop();
    this.currentBoard[lastState.idx] = lastState.val;
    this.notesBoard[lastState.idx] = lastState.notes;
    
    sfx.playAction();
    this.renderCell(lastState.idx);
    this.selectCell(lastState.idx);
    this.saveCurrentGame();
  }
  
  // --- Auto-Notes (Calculates all candidates for all cells) ---
  calculateAutoNotes() {
    let notesAdded = false;
    this.pushHistoryState(0); // Marker undo representation for bulk action
    
    for (let i = 0; i < 81; i++) {
      if (this.currentBoard[i] === 0) {
        this.notesBoard[i].fill(false);
        for (let val = 1; val <= 9; val++) {
          if (isValidFlat(this.currentBoard, i, val)) {
            this.notesBoard[i][val] = true;
            notesAdded = true;
          }
        }
        this.renderCell(i);
      }
    }
    
    if (notesAdded) {
      sfx.playClick();
      this.saveCurrentGame();
    }
  }
  
  // --- Smart Hint Engine ---
  getSmartHint() {
    if (this.selectedCellIdx === null) {
      document.getElementById('hint-output').innerHTML = "<strong>Alert:</strong> Please select an empty cell coordinates first.";
      sfx.playError();
      return;
    }
    
    const idx = this.selectedCellIdx;
    
    // Cell is already mapped
    if (this.currentBoard[idx] !== 0) {
      if (this.currentBoard[idx] === this.solutionBoard[idx]) {
        document.getElementById('hint-output').innerHTML = "This cell value is currently aligned and correct.";
      } else {
        document.getElementById('hint-output').innerHTML = "Conflict: The current value in this node is anomalous.";
      }
      return;
    }
    
    this.hintsUsed++;
    
    // Find candidates for selected node
    const candidates = [];
    for (let val = 1; val <= 9; val++) {
      if (isValidFlat(this.currentBoard, idx, val)) {
        candidates.push(val);
      }
    }
    
    const correctVal = this.solutionBoard[idx];
    
    // Rule 1: Naked Single (Selected cell only has 1 possible digit)
    if (candidates.length === 1) {
      document.getElementById('hint-output').innerHTML = `
        <strong>Naked Single:</strong> Node has only one valid candidate that avoids local conflicts. 
        <br><span style='color:var(--accent-color); font-weight:700'>Placement: ${correctVal}</span>
      `;
      this.inputNumber(correctVal);
      return;
    }
    
    // Rule 2: Hidden Single (Row, Col, or Box has only one spot for the correct number)
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    const boxRow = Math.floor(r / 3) * 3;
    const boxCol = Math.floor(c / 3) * 3;
    
    // Check Row
    let rowUnique = true;
    for (let i = 0; i < 9; i++) {
      const idxToCheck = r * 9 + i;
      if (idxToCheck !== idx && this.currentBoard[idxToCheck] === 0) {
        if (isValidFlat(this.currentBoard, idxToCheck, correctVal)) {
          rowUnique = false;
        }
      }
    }
    if (rowUnique) {
      document.getElementById('hint-output').innerHTML = `
        <strong>Hidden Single:</strong> In this row, this is the only node that can house this value.
        <br><span style='color:var(--accent-color); font-weight:700'>Placement: ${correctVal}</span>
      `;
      this.inputNumber(correctVal);
      return;
    }
    
    // Check Column
    let colUnique = true;
    for (let i = 0; i < 9; i++) {
      const idxToCheck = i * 9 + c;
      if (idxToCheck !== idx && this.currentBoard[idxToCheck] === 0) {
        if (isValidFlat(this.currentBoard, idxToCheck, correctVal)) {
          colUnique = false;
        }
      }
    }
    if (colUnique) {
      document.getElementById('hint-output').innerHTML = `
        <strong>Hidden Single:</strong> In this column, this is the only node that can house this value.
        <br><span style='color:var(--accent-color); font-weight:700'>Placement: ${correctVal}</span>
      `;
      this.inputNumber(correctVal);
      return;
    }
    
    // Check Box
    let boxUnique = true;
    for (let i = 0; i < 9; i++) {
      const idxToCheck = (boxRow + Math.floor(i / 3)) * 9 + (boxCol + (i % 3));
      if (idxToCheck !== idx && this.currentBoard[idxToCheck] === 0) {
        if (isValidFlat(this.currentBoard, idxToCheck, correctVal)) {
          boxUnique = false;
        }
      }
    }
    if (boxUnique) {
      document.getElementById('hint-output').innerHTML = `
        <strong>Hidden Single:</strong> In this 3x3 sector, this is the only node that can house this value.
        <br><span style='color:var(--accent-color); font-weight:700'>Placement: ${correctVal}</span>
      `;
      this.inputNumber(correctVal);
      return;
    }
    
    // Fallback: Reveal correct coordinate value directly
    document.getElementById('hint-output').innerHTML = `
      <strong>Neural Scan Hint:</strong> Neural telemetry suggests this digit placement.
      <br><span style='color:var(--accent-color); font-weight:700'>Placement: ${correctVal}</span>
    `;
    this.inputNumber(correctVal);
  }
  
  // --- Game Over / Victory Handling ---
  handleGameOver() {
    this.stopTimer();
    this.clearSavedGame();
    sfx.playError();
    
    const dialog = document.getElementById('game-over-dialog');
    dialog.showModal();
  }
  
  checkGameWin() {
    // Verify that all cells match the solution board
    for (let i = 0; i < 81; i++) {
      if (this.currentBoard[i] !== this.solutionBoard[i]) return;
    }
    
    // Victory!
    this.stopTimer();
    this.clearSavedGame();
    sfx.playWin();
    this.animator.createWinExplosion();
    
    // Update stats
    if (this.stats[this.difficulty]) {
      this.stats[this.difficulty].won++;
      
      const currentTime = this.timerSeconds;
      const bestTime = this.stats[this.difficulty].bestTime;
      if (bestTime === null || currentTime < bestTime) {
        this.stats[this.difficulty].bestTime = currentTime;
      }
      
      this.saveStats();
    }
    
    // Populate Victory Dialog
    document.getElementById('win-difficulty').textContent = this.difficulty.toUpperCase();
    
    const mins = Math.floor(this.timerSeconds / 60).toString().padStart(2, '0');
    const secs = (this.timerSeconds % 60).toString().padStart(2, '0');
    document.getElementById('win-time').textContent = `${mins}:${secs}`;
    document.getElementById('win-mistakes').textContent = `${this.mistakesCount} / ${this.maxMistakes}`;
    document.getElementById('win-hints').textContent = this.hintsUsed;
    
    // Calculate final score with time bonuses
    const timeBonus = Math.max(0, 1000 - this.timerSeconds);
    const finalScore = this.score + timeBonus - (this.hintsUsed * 150);
    document.getElementById('win-score').textContent = Math.max(100, finalScore).toString().padStart(5, '0');
    
    const dialog = document.getElementById('win-dialog');
    dialog.showModal();
  }
  
  // --- Events Binding ---
  bindEvents() {
    // 1. Board Clicks / Keyboard Selection
    document.getElementById('sudoku-board').addEventListener('click', (e) => {
      const cell = e.target.closest('.cell');
      if (cell) {
        const idx = parseInt(cell.getAttribute('data-index'));
        this.selectCell(idx);
        sfx.playClick();
      }
    });
    
    // 2. Keyboard Nav & Inputs
    window.addEventListener('keydown', (e) => {
      // Block keys if settings or other dialog modals are active
      const modals = document.querySelectorAll('dialog[open]');
      if (modals.length > 0) return;
      
      if (this.selectedCellIdx === null) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          this.selectCell(40); // Select center cell first if none
          e.preventDefault();
        }
        return;
      }
      
      const idx = this.selectedCellIdx;
      
      switch (e.key) {
        // Navigations
        case 'ArrowUp':
          this.selectCell(idx - 9 >= 0 ? idx - 9 : idx + 72);
          e.preventDefault();
          break;
        case 'ArrowDown':
          this.selectCell(idx + 9 < 81 ? idx + 9 : idx - 72);
          e.preventDefault();
          break;
        case 'ArrowLeft':
          this.selectCell(idx % 9 > 0 ? idx - 1 : idx + 8);
          e.preventDefault();
          break;
        case 'ArrowRight':
          this.selectCell(idx % 9 < 8 ? idx + 1 : idx - 8);
          e.preventDefault();
          break;
          
        // Numbers Inputs
        case '1': case '2': case '3': case '4': case '5':
        case '6': case '7': case '8': case '9':
          this.inputNumber(parseInt(e.key));
          break;
          
        // Erasures
        case 'Backspace':
        case 'Delete':
          this.eraseCell();
          e.preventDefault();
          break;
          
        // Keyboard Shortcuts
        case 'n': case 'N':
          this.toggleNotesMode();
          break;
        case 'u': case 'U':
          this.undoAction();
          break;
        case 'h': case 'H':
          this.getSmartHint();
          break;
        case 'z': case 'Z':
          if (e.ctrlKey || e.metaKey) {
            this.undoAction();
            e.preventDefault();
          }
          break;
      }
    });
    
    // 3. Control Actions Buttons
    document.getElementById('btn-undo').addEventListener('click', () => this.undoAction());
    document.getElementById('btn-erase').addEventListener('click', () => this.eraseCell());
    document.getElementById('btn-notes').addEventListener('click', () => this.toggleNotesMode());
    document.getElementById('btn-auto-notes').addEventListener('click', () => this.calculateAutoNotes());
    document.getElementById('btn-hint').addEventListener('click', () => this.getSmartHint());
    
    // Numpad input
    document.querySelectorAll('.btn-num').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = parseInt(e.target.getAttribute('data-num'));
        this.inputNumber(val);
      });
    });
    
    // 4. Header & Dialog Control Modals
    const newGameDialog = document.getElementById('new-game-dialog');
    document.getElementById('btn-new-game').addEventListener('click', () => {
      newGameDialog.showModal();
      sfx.playClick();
    });
    
    // Difficulty choices
    document.querySelectorAll('.btn-diff').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const diffBtn = e.target.closest('.btn-diff');
        const diff = diffBtn.getAttribute('data-diff');
        newGameDialog.close();
        this.initNewGame(diff);
      });
    });
    
    // Settings Settings Modal open/close
    const settingsDialog = document.getElementById('settings-dialog');
    document.getElementById('btn-settings-menu').addEventListener('click', () => {
      settingsDialog.showModal();
      sfx.playClick();
    });
    
    settingsDialog.addEventListener('submit', (e) => {
      // Gather form inputs
      this.config.theme = document.getElementById('setting-theme').value;
      this.config.sound = document.getElementById('setting-sound').checked;
      this.config.highlightPeer = document.getElementById('setting-highlight-peer').checked;
      this.config.highlightSame = document.getElementById('setting-highlight-same').checked;
      this.config.highlightConflicts = document.getElementById('setting-highlight-conflicts').checked;
      this.config.timer = document.getElementById('setting-timer').checked;
      
      this.saveSettings();
      this.renderBoard();
      sfx.playClick();
    });
    
    // Stats Modal open/close
    const statsDialog = document.getElementById('stats-dialog');
    document.getElementById('btn-stats-menu').addEventListener('click', () => {
      this.populateStatsDialog();
      statsDialog.showModal();
      sfx.playClick();
    });
    
    document.getElementById('btn-close-stats').addEventListener('click', () => {
      statsDialog.close();
      sfx.playClick();
    });
    
    document.getElementById('btn-reset-stats').addEventListener('click', () => {
      if (confirm("System Diagnostics: Wipe all neural score history records?")) {
        localStorage.removeItem('sudoku_stats');
        this.loadStats();
        this.populateStatsDialog();
        sfx.playError();
      }
    });
    
    // Fail Modals actions
    document.getElementById('btn-restart-failed').addEventListener('click', () => {
      document.getElementById('game-over-dialog').close();
      this.restartPuzzle();
    });
    document.getElementById('btn-new-failed').addEventListener('click', () => {
      document.getElementById('game-over-dialog').close();
      newGameDialog.showModal();
    });
    
    // Win Modal actions
    document.getElementById('btn-win-new').addEventListener('click', () => {
      document.getElementById('win-dialog').close();
      newGameDialog.showModal();
    });
  }
  
  toggleNotesMode() {
    const btn = document.getElementById('btn-notes');
    const text = document.getElementById('notes-status-text');
    const active = btn.classList.toggle('active');
    text.textContent = active ? 'ON' : 'OFF';
    sfx.playClick();
  }
  
  // Utility: Parse time formats
  formatTime(secs) {
    if (secs === null) return '--:--';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
  
  populateStatsDialog() {
    let totalPlayed = 0;
    let totalWon = 0;
    
    const difficulties = ['easy', 'medium', 'hard', 'expert'];
    difficulties.forEach(diff => {
      const item = this.stats[diff];
      totalPlayed += item.played;
      totalWon += item.won;
      
      document.getElementById(`best-${diff}`).textContent = this.formatTime(item.bestTime);
      document.getElementById(`count-${diff}`).textContent = item.won;
    });
    
    document.getElementById('stat-completed').textContent = totalWon;
    const winRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;
    document.getElementById('stat-win-rate').textContent = `${winRate}%`;
  }
}

// Instantiate game on page load
window.addEventListener('DOMContentLoaded', () => {
  window.sudokuApp = new SudokuGame();
});
