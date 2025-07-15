let boardState = Array(10).fill().map(() => Array(10).fill(null));
let puntos = 0;

function startGame() {
  document.getElementById('startBtn').style.display = 'none';
  document.getElementById('game-area').classList.remove('hidden');
  drawBoard();
  showPieces();
}

function drawBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  for (let i = 0; i < 100; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    board.appendChild(cell);
  }
}

function showPieces() {
  const pieces = document.getElementById('pieces');
  pieces.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const shape = generateShape();
    const piece = document.createElement('div');
    piece.className = 'piece';
    piece.draggable = true;
    piece.dataset.shape = JSON.stringify(shape);
    piece.ondragstart = drag;
    shape.forEach(val => {
      const block = document.createElement('div');
      block.className = 'block';
      if (val === 1) block.classList.add(`color${Math.floor(Math.random() * 5) + 1}`);
      piece.appendChild(block);
    });
    pieces.appendChild(piece);
  }
}

function generateShape() {
  const shapes = [
    [1,1,1,0,0,0,0,0,0],
    [1,0,0,1,0,0,1,0,0],
    [1,1,0,0,1,0,0,0,0],
    [1,1,1,1,0,0,0,0,0],
    [1,1,0,1,1,0,0,0,0],
  ];
  return shapes[Math.floor(Math.random() * shapes.length)];
}

function allowDrop(ev) { ev.preventDefault(); }
function drag(ev) { ev.dataTransfer.setData("text", ev.target.dataset.shape); }
function drop(ev) {
  ev.preventDefault();
  const shape = JSON.parse(ev.dataTransfer.getData("text"));
  const board = document.getElementById('board');
  const rect = board.getBoundingClientRect();
  const x = Math.floor((ev.clientX - rect.left) / (rect.width / 10));
  const y = Math.floor((ev.clientY - rect.top) / (rect.height / 10));

  if (canPlace(shape, x, y)) {
    placeBlock(shape, x, y);
    ev.target.closest('.piece').remove();
    document.getElementById("snd-place").play();
  }
}

function canPlace(shape, x, y) {
  let index = 0;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (shape[index] === 1) {
        const boardX = x + col;
        const boardY = y + row;
        if (boardX >= 10 || boardY >= 10 || boardState[boardY][boardX]) return false;
      }
      index++;
    }
  }
  return true;
}

function placeBlock(shape, x, y) {
  const board = document.getElementById('board');
  let index = 0;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (shape[index] === 1) {
        const boardX = x + col;
        const boardY = y + row;
        boardState[boardY][boardX] = true;
        const boardIndex = boardY * 10 + boardX;
        const cell = board.children[boardIndex];
        cell.style.backgroundColor = "#ba68c8";
      }
      index++;
    }
  }
  checkCompletedLines();
}

function checkCompletedLines() {
  const board = document.getElementById('board');
  let linesCleared = 0;

  for (let y = 0; y < 10; y++) {
    if (boardState[y].every(cell => cell)) {
      linesCleared++;
      boardState[y] = Array(10).fill(null);
      for (let x = 0; x < 10; x++) {
        const index = y * 10 + x;
        const cell = board.children[index];
        cell.style.backgroundColor = "#fff";
      }
    }
  }

  for (let x = 0; x < 10; x++) {
    let full = true;
    for (let y = 0; y < 10; y++) {
      if (!boardState[y][x]) { full = false; break; }
    }
    if (full) {
      linesCleared++;
      for (let y = 0; y < 10; y++) {
        boardState[y][x] = null;
        const index = y * 10 + x;
        const cell = board.children[index];
        cell.style.backgroundColor = "#fff";
      }
    }
  }

  if (linesCleared > 0) {
    document.getElementById("snd-clear").play();
    showMessage("¡Línea eliminada!");
    puntos += linesCleared * 10;
    document.getElementById('score').innerText = `Puntos: ${puntos}`;
  }
  setTimeout(checkGameOver, 200);
}

function checkGameOver() {
  const pieces = document.querySelectorAll('.piece');
  if (pieces.length === 0) { showPieces(); return; }

  for (const piece of pieces) {
    const shape = JSON.parse(piece.dataset.shape);
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        if (canPlace(shape, x, y)) return;
      }
    }
  }

  alert("¡Juego terminado! Puntos: " + puntos);
  document.getElementById("snd-lose").play();
  setTimeout(() => location.reload(), 2000);
}

function showMessage(text) {
  const msg = document.getElementById("message");
  msg.textContent = text;
  msg.classList.add("show");
  setTimeout(() => msg.classList.remove("show"), 1500);
}
