/* --- STATE --- */
let boardState = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = 1;
let gameActive = true;
let config = { p1: "X", p2: "O", theme: "light" };
const availableAvatars = ["X", "O", "🐶", "🐱", "🚀", "⭐", "🔥", "💀"];
let tempP1 = "X"; let tempP2 = "O";

/* --- ELEMENTS --- */
const statusDisplay = document.getElementById('status');
const cells = document.querySelectorAll('.cell');
const modal = document.getElementById('settingsModal');
const p1Grid = document.getElementById('p1-avatar-grid');
const p2Grid = document.getElementById('p2-avatar-grid');
const confettiContainer = document.getElementById('confetti-container');

const winningConditions = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

/* --- GAME LOGIC --- */
function handleCellClick(e) {
    const idx = parseInt(e.target.getAttribute('data-index'));
    if (boardState[idx] !== "" || !gameActive) return;
    
    boardState[idx] = currentPlayer === 1 ? config.p1 : config.p2;
    e.target.innerHTML = boardState[idx];
    e.target.classList.add('taken');
    
    checkResult();
}

function checkResult() {
    let win = false;
    let line = [];
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            win = true; line = condition; break;
        }
    }

    if (win) {
        statusDisplay.innerHTML = `🎉 Player ${currentPlayer} Wins!`;
        gameActive = false;
        line.forEach(i => document.querySelector(`[data-index='${i}']`).classList.add('win'));
        triggerConfetti();
        return;
    }

    if (!boardState.includes("")) {
        statusDisplay.innerHTML = "It's a Draw! 🤝";
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 1 ? 2 : 1;
    statusDisplay.innerHTML = `Player ${currentPlayer}'s Turn (${currentPlayer === 1 ? config.p1 : config.p2})`;
}

function restartGame() {
    gameActive = true; currentPlayer = 1; boardState.fill("");
    statusDisplay.innerHTML = `Player 1's Turn (${config.p1})`;
    cells.forEach(c => { c.innerHTML = ""; c.classList.remove('taken', 'win'); });
    confettiContainer.innerHTML = '';
}

/* --- SETTINGS & AVATAR GRID --- */
function openSettings() {
    tempP1 = config.p1; tempP2 = config.p2;
    renderAvatarGrids();
    modal.style.display = 'flex';
}

function renderAvatarGrids() {
    const draw = (grid, current, other, isP1) => {
        grid.innerHTML = '';
        availableAvatars.forEach(av => {
            const el = document.createElement('div');
            el.className = `avatar-option ${av === current ? 'selected' : ''} ${av === other ? 'disabled' : ''}`;
            el.innerText = av;
            if (av !== other) {
                el.onclick = () => { isP1 ? tempP1 = av : tempP2 = av; renderAvatarGrids(); };
            }
            grid.appendChild(el);
        });
    };
    draw(p1Grid, tempP1, tempP2, true);
    draw(p2Grid, tempP2, tempP1, false);
}

function changeTheme() { document.body.setAttribute('data-theme', document.getElementById('themeSelect').value); }

function saveSettings() {
    config.p1 = tempP1; config.p2 = tempP2;
    config.theme = document.getElementById('themeSelect').value;
    modal.style.display = 'none';
    restartGame();
}

cells.forEach(c => c.addEventListener('click', handleCellClick));

/* --- TUTORIAL LOGIC --- */
let tutorialStep = 0;
const tutorialOverlay = document.getElementById('tutorialOverlay');
const tooltip = document.getElementById('tooltip');
const tooltipText = document.getElementById('tooltipText');

const tutorialSteps = [
    { el: 'game-title', text: "Welcome! Let's get started." },
    { el: 'board', text: "Click squares to place your mark." },
    { el: 'status', text: "Track turns and winners here." },
    { el: 'top-controls', text: "Customize themes and avatars here." },
    { el: 'bottom-controls', text: "Reset the game anytime here." }
];

function startTutorial() {
    tutorialStep = 0;
    tutorialOverlay.style.display = 'block';
    tooltip.style.display = 'block'; // Make sure tooltip is visible
    showStep();
}

function showStep() {
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    if (tutorialStep >= tutorialSteps.length) { endTutorial(); return; }

    const step = tutorialSteps[tutorialStep];
    const target = document.getElementById(step.el);
    target.classList.add('highlight');
    
    const rect = target.getBoundingClientRect();
    tooltipText.innerText = step.text;

    // Positioning Logic
    if (step.el === 'board') {
        // Position to the RIGHT of the board
        tooltip.style.top = (rect.top + (rect.height / 2) - 60) + "px";
        tooltip.style.left = (rect.right + 30) + "px";

        // Mobile fallback
        if (window.innerWidth < rect.right + 300) {
            tooltip.style.left = (window.innerWidth / 2 - 130) + "px";
            tooltip.style.top = (rect.bottom + 20) + "px";
        }
    } else {
        // Standard center-bottom positioning
        tooltip.style.top = (rect.bottom + 20) + "px";
        tooltip.style.left = (rect.left + (rect.width / 2) - 130) + "px";
        if (rect.bottom > window.innerHeight - 180) tooltip.style.top = (rect.top - 180) + "px";
    }

    if (parseInt(tooltip.style.left) < 10) tooltip.style.left = "10px";
}

function nextTutorialStep() { tutorialStep++; showStep(); }
function endTutorial() { 
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    tutorialOverlay.style.display = 'none';
    tooltip.style.display = 'none'; // Hide tooltip 
}

/* --- WIN EFFECTS --- */
function triggerConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    for (let i = 0; i < 100; i++) {
        const c = document.createElement('div');
        c.className = 'confetti-piece';
        c.style.left = Math.random() * 100 + 'vw';
        c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        c.style.animation = `confettiFall ${Math.random() * 2 + 2}s linear ${Math.random() * 2}s forwards`;
        confettiContainer.appendChild(c);
        setTimeout(() => c.remove(), 5000); 
    }
}