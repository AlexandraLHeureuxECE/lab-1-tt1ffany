/* --- GAME STATE --- */
let boardState = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = 1;
let gameActive = true;

// Default config
let config = {
    p1: "X",
    p2: "O",
    theme: "light"
};

// Available avatars for the menu
const availableAvatars = ["X", "O", "🐶", "🐱", "🚀", "⭐", "🔥", "💀"];

// Temporary state for the Settings Modal (so we don't save until user clicks Save)
let tempP1 = "X";
let tempP2 = "O";

/* --- DOM ELEMENTS --- */
const statusDisplay = document.getElementById('status');
const cells = document.querySelectorAll('.cell');
const modal = document.getElementById('settingsModal');
const p1Grid = document.getElementById('p1-avatar-grid');
const p2Grid = document.getElementById('p2-avatar-grid');
const confettiContainer = document.getElementById('confetti-container');

/* --- WINNING LOGIC --- */
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

/* --- CORE GAME PLAY --- */
function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (boardState[clickedCellIndex] !== "" || !gameActive) return;

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

function handleCellPlayed(clickedCell, clickedCellIndex) {
    boardState[clickedCellIndex] = currentPlayer === 1 ? config.p1 : config.p2;
    clickedCell.innerHTML = currentPlayer === 1 ? config.p1 : config.p2;
    clickedCell.classList.add('taken');
}

function handleResultValidation() {
    let roundWon = false;
    let winningLine = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = boardState[winCondition[0]];
        let b = boardState[winCondition[1]];
        let c = boardState[winCondition[2]];

        if (a === '' || b === '' || c === '') continue;
        if (a === b && b === c) {
            roundWon = true;
            winningLine = winCondition;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = `🎉 Player ${currentPlayer} Wins!`;
        gameActive = false;
        highlightWin(winningLine);
        triggerConfetti(); // Start the rain!
        return;
    }

    let roundDraw = !boardState.includes("");
    if (roundDraw) {
        statusDisplay.innerHTML = "It's a Draw! 🤝";
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 1 ? 2 : 1;
    statusDisplay.innerHTML = `Player ${currentPlayer}'s Turn (${currentPlayer === 1 ? config.p1 : config.p2})`;
}

function highlightWin(indices) {
    indices.forEach(index => {
        document.querySelector(`[data-index='${index}']`).classList.add('win');
    });
}

function restartGame() {
    gameActive = true;
    currentPlayer = 1;
    boardState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = `Player 1's Turn (${config.p1})`;
    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('taken', 'win');
    });
    // clear confetti if any remains
    confettiContainer.innerHTML = '';
}

/* --- CUSTOMIZATION & AVATAR GRID LOGIC --- */

function openSettings() {
    // Reset temp variables to current actual config
    tempP1 = config.p1;
    tempP2 = config.p2;
    
    renderAvatarGrids(); // Draw the grids
    modal.style.display = 'flex';
}

function renderAvatarGrids() {
    // Helper to generate HTML for a grid
    function createGrid(targetDiv, currentPlayerValue, otherPlayerValue, isPlayer1) {
        targetDiv.innerHTML = ''; // Clear existing
        availableAvatars.forEach(avatar => {
            const el = document.createElement('div');
            el.classList.add('avatar-option');
            el.innerText = avatar;

            // Highlight if selected by THIS player
            if (avatar === currentPlayerValue) {
                el.classList.add('selected');
            }

            // Disable if selected by OTHER player (Validation logic)
            if (avatar === otherPlayerValue) {
                el.classList.add('disabled');
            } else {
                // Add click event only if not disabled
                el.onclick = () => {
                    if (isPlayer1) tempP1 = avatar;
                    else tempP2 = avatar;
                    renderAvatarGrids(); // Re-render both grids to update disabled states
                };
            }
            targetDiv.appendChild(el);
        });
    }

    createGrid(p1Grid, tempP1, tempP2, true);
    createGrid(p2Grid, tempP2, tempP1, false);
}

function changeTheme() {
    const theme = document.getElementById('themeSelect').value;
    document.body.setAttribute('data-theme', theme);
}

function saveSettings() {
    config.p1 = tempP1;
    config.p2 = tempP2;
    config.theme = document.getElementById('themeSelect').value;
    
    modal.style.display = 'none';
    restartGame();
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));

/* --- TUTORIAL LOGIC (Updated for new layout) --- */
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
    showStep();
}

function showStep() {
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    
    if (tutorialStep >= tutorialSteps.length) {
        endTutorial();
        return;
    }

    const step = tutorialSteps[tutorialStep];
    const target = document.getElementById(step.el);
    target.classList.add('highlight');
    
    const rect = target.getBoundingClientRect();
    tooltip.style.top = (rect.bottom + 10) + "px";
    tooltip.style.left = (rect.left + (rect.width/2) - 125) + "px";
    
    if(rect.bottom > window.innerHeight - 150) {
        tooltip.style.top = (rect.top - 120) + "px";
    }
    if(parseInt(tooltip.style.left) < 0) tooltip.style.left = "10px";

    tooltipText.innerText = step.text;
}

function nextTutorialStep() { tutorialStep++; showStep(); }

function endTutorial() {
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    tutorialOverlay.style.display = 'none';
}

/* --- CONFETTI ENGINE --- */
function triggerConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    // Create 100 particles
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti-piece');
        
        // Random properties
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's'; // 2-4 seconds fall
        confetti.style.animationDelay = (Math.random() * 2) + 's'; // Stagger start times
        
        // Add animation styling
        confetti.style.animationName = 'confettiFall';
        confetti.style.animationTimingFunction = 'linear';
        confetti.style.animationFillMode = 'forwards'; // Stay at bottom (or just disappear)

        confettiContainer.appendChild(confetti);

        // Cleanup DOM after animation to prevent memory leaks
        setTimeout(() => {
            confetti.remove();
        }, 5000); 
    }
}