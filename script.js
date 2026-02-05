/* --- GAME STATE VARIABLES --- */
// Represents the 3x3 grid. Index 0 is top-left, 8 is bottom-right.
let boardState = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = 1;
let gameActive = true;

// Configuration object for customizable features
let config = {
    p1: "X",      // Player 1 marker
    p2: "O",      // Player 2 marker
    theme: "light" // Current theme
};

/* --- DOM ELEMENT REFERENCES --- */
const statusDisplay = document.getElementById('status');
const cells = document.querySelectorAll('.cell');
const modal = document.getElementById('settingsModal');

/* --- WINNING LOGIC --- */
// Array of all possible winning index combinations
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

/* --- CORE GAME FUNCTIONS --- */

/**
 * Handles clicks on grid cells.
 * Checks if cell is empty and game is active.
 */
function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // Return if cell is already taken or game is over
    if (boardState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

/**
 * Updates the internal state and the UI when a cell is played.
 */
function handleCellPlayed(clickedCell, clickedCellIndex) {
    // Update internal data
    boardState[clickedCellIndex] = currentPlayer === 1 ? config.p1 : config.p2;
    // Update visual UI
    clickedCell.innerHTML = currentPlayer === 1 ? config.p1 : config.p2;
    clickedCell.classList.add('taken');
}

/**
 * Checks for Win, Draw, or Next Turn conditions.
 */
function handleResultValidation() {
    let roundWon = false;
    let winningLine = [];

    // Check all winning conditions
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

    // Scenario 1: Someone won
    if (roundWon) {
        statusDisplay.innerHTML = `🎉 Player ${currentPlayer} Wins!`;
        gameActive = false;
        highlightWin(winningLine);
        return;
    }

    // Scenario 2: Draw (No empty strings left in boardState)
    let roundDraw = !boardState.includes("");
    if (roundDraw) {
        statusDisplay.innerHTML = "It's a Draw! 🤝";
        gameActive = false;
        return;
    }

    // Scenario 3: Next Turn
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    statusDisplay.innerHTML = `Player ${currentPlayer}'s Turn (${currentPlayer === 1 ? config.p1 : config.p2})`;
}

/**
 * Adds a CSS class to the winning cells for visual emphasis.
 */
function highlightWin(indices) {
    indices.forEach(index => {
        document.querySelector(`[data-index='${index}']`).classList.add('win');
    });
}

/**
 * Resets the game state and UI to initial conditions.
 */
function restartGame() {
    gameActive = true;
    currentPlayer = 1;
    boardState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = `Player 1's Turn (${config.p1})`;
    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('taken', 'win');
    });
}

/* --- CUSTOMIZATION / SETTINGS FUNCTIONS --- */

function openSettings() { 
    modal.style.display = 'flex'; 
}

// Live preview of theme change
function changeTheme() {
    const theme = document.getElementById('themeSelect').value;
    document.body.setAttribute('data-theme', theme);
}

// Saves avatar choices and restarts game to apply them
function saveSettings() {
    config.p1 = document.getElementById('p1Avatar').value || "X";
    config.p2 = document.getElementById('p2Avatar').value || "O";
    config.theme = document.getElementById('themeSelect').value;
    
    modal.style.display = 'none';
    restartGame(); 
}

// Attach event listeners to all cells
cells.forEach(cell => cell.addEventListener('click', handleCellClick));


/* --- TUTORIAL LOGIC --- */

let tutorialStep = 0;
const tutorialOverlay = document.getElementById('tutorialOverlay');
const tooltip = document.getElementById('tooltip');
const tooltipText = document.getElementById('tooltipText');

// Definitions of tutorial steps
const tutorialSteps = [
    { el: 'game-title', text: "Welcome to Tic-Tac-Toe! Let's learn how to play." },
    { el: 'board', text: "This is the game board. Click a square to place your mark." },
    { el: 'status', text: "This tells you whose turn it is or who won." },
    { el: 'controls-area', text: "Use these buttons to Restart or Customize the game." }
];

function startTutorial() {
    tutorialStep = 0;
    tutorialOverlay.style.display = 'block';
    showStep();
}

function showStep() {
    // Remove highlight from previous step
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    
    if (tutorialStep >= tutorialSteps.length) {
        endTutorial();
        return;
    }

    const step = tutorialSteps[tutorialStep];
    const target = document.getElementById(step.el);
    
    // Add highlight class to target element
    target.classList.add('highlight');
    
    // Position Tooltip dynamically
    const rect = target.getBoundingClientRect();
    tooltip.style.top = (rect.bottom + 10) + "px";
    tooltip.style.left = (rect.left + (rect.width/2) - 125) + "px"; // Center it
    
    // Mobile safe positioning adjustment
    if(rect.bottom > window.innerHeight - 150) {
            tooltip.style.top = (rect.top - 120) + "px";
    }
    // Prevent tooltip from going off the left edge
    if(parseInt(tooltip.style.left) < 0) tooltip.style.left = "10px";

    tooltipText.innerText = step.text;
}

function nextTutorialStep() {
    tutorialStep++;
    showStep();
}

function endTutorial() {
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    tutorialOverlay.style.display = 'none';
}