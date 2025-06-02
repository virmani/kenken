// KenKen Game Application
class KenKenApp {
    constructor() {
        this.puzzle = null;
        this.selectedCell = null;
        this.startTime = null;
        this.timer = null;
        this.gameCompleted = false;
        
        this.initializeElements();
        this.bindEvents();
        this.setDefaultSettings();
        this.generateNewGame();
    }

    initializeElements() {
        this.gridSizeSelect = document.getElementById('grid-size');
        this.difficultySelect = document.getElementById('difficulty');
        this.operatorCheckboxes = document.querySelectorAll('.operator-checkboxes input[type="checkbox"]');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.howToPlayBtn = document.getElementById('how-to-play-btn');
        this.resetPuzzleBtn = document.getElementById('reset-puzzle-btn');
        this.puzzleGrid = document.getElementById('puzzle-grid');
        this.numberPad = document.getElementById('number-pad');
        this.timerDiv = document.getElementById('timer');
        this.winModal = document.getElementById('win-modal');
        this.finalTimeSpan = document.getElementById('final-time');
        this.newGameModalBtn = document.getElementById('new-game-modal-btn');
        this.howToPlayModal = document.getElementById('how-to-play-modal');
        this.closeHowToPlayBtn = document.getElementById('close-how-to-play-btn');
        this.refreshAppBtn = document.getElementById('refresh-app-btn');
    }

    bindEvents() {
        this.newGameBtn.addEventListener('click', () => this.generateNewGame());
        this.newGameModalBtn.addEventListener('click', () => this.closeModalAndGenerateNew());
        this.howToPlayBtn.addEventListener('click', () => this.showHowToPlay());
        this.resetPuzzleBtn.addEventListener('click', () => this.resetPuzzle());
        this.closeHowToPlayBtn.addEventListener('click', () => this.closeHowToPlay());
        this.refreshAppBtn.addEventListener('click', () => this.refreshApp());
        
        // Close number pad when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.numberPad.contains(e.target) && 
                !e.target.classList.contains('cage') &&
                !e.target.closest('.cage')) {
                this.hideNumberPad();
            }
        });

        // Close modals when clicking outside
        this.howToPlayModal.addEventListener('click', (e) => {
            if (e.target === this.howToPlayModal) {
                this.closeHowToPlay();
            }
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    setDefaultSettings() {
        // Set default grid size to 3x3
        this.gridSizeSelect.value = '3';
        
        // Set default difficulty to easy
        this.difficultySelect.value = 'easy';
        
        // Enable +, -, * operators by default
        this.operatorCheckboxes.forEach(checkbox => {
            if (['*', '+', '-'].includes(checkbox.value)) {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
        });
    }

    generateNewGame() {
        try {
            // Get settings
            const size = parseInt(this.gridSizeSelect.value);
            const difficulty = this.difficultySelect.value;
            const operators = Array.from(this.operatorCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            if (operators.length === 0) {
                alert('Please select at least one operator!');
                return;
            }

            // Generate puzzle
            this.puzzle = new KenKenPuzzle(size);
            const puzzleData = this.puzzle.generate(operators, difficulty);
            
            // Render puzzle
            this.renderPuzzle();
            this.startTimer();
            this.gameCompleted = false;
            
        } catch (error) {
            console.error('Error generating puzzle:', error);
        }
    }

    renderPuzzle() {
        if (!this.puzzle) return;

        const size = this.puzzle.size;
        this.puzzleGrid.innerHTML = '';
        this.puzzleGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        
        // Add grid size class for responsive styling
        this.puzzleGrid.className = `puzzle-grid grid-${size}x${size}`;

        // Create cage colors
        const cageColors = this.generateCageColors(this.puzzle.cages.length);

        // Create cells
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const cell = document.createElement('div');
                cell.className = 'cage';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                // Find which cage this cell belongs to
                const cageIndex = this.puzzle.cages.findIndex(cage => 
                    cage.cells.some(c => c.row === i && c.col === j)
                );
                
                if (cageIndex !== -1) {
                    const cage = this.puzzle.cages[cageIndex];
                    cell.dataset.cageId = cageIndex;
                    cell.style.backgroundColor = cageColors[cageIndex];
                    
                    // Add cage borders
                    this.addCageBorders(cell, i, j, cageIndex);
                    
                    // Add cage label to the first cell (top-left)
                    const isFirstCell = cage.cells[0].row === i && cage.cells[0].col === j;
                    if (isFirstCell) {
                        const label = document.createElement('div');
                        label.className = 'cage-label';
                        const operatorSymbol = this.getOperatorSymbol(cage.constraint.operator);
                        label.textContent = `${cage.constraint.target}${operatorSymbol}`;
                        cell.appendChild(label);
                    }
                }

                cell.addEventListener('click', () => this.handleCellClick(i, j));
                this.puzzleGrid.appendChild(cell);
            }
        }
    }

    addCageBorders(cell, row, col, cageIndex) {
        const size = this.puzzle.size;
        
        // Check each direction to see if we need a border
        const directions = [
            { name: 'top', dr: -1, dc: 0, style: 'border-top' },
            { name: 'right', dr: 0, dc: 1, style: 'border-right' },
            { name: 'bottom', dr: 1, dc: 0, style: 'border-bottom' },
            { name: 'left', dr: 0, dc: -1, style: 'border-left' }
        ];

        directions.forEach(dir => {
            const newRow = row + dir.dr;
            const newCol = col + dir.dc;
            
            // If we're at the edge of the grid, add border
            if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) {
                cell.style[dir.style] = '3px solid #333';
                return;
            }
            
            // Find the cage of the neighboring cell
            const neighborCageIndex = this.puzzle.cages.findIndex(cage => 
                cage.cells.some(c => c.row === newRow && c.col === newCol)
            );
            
            // If neighbor is in a different cage, add border
            if (neighborCageIndex !== cageIndex) {
                cell.style[dir.style] = '3px solid #333';
            } else {
                cell.style[dir.style] = 'none';
            }
        });
    }

    generateCageColors(count) {
        const colors = [
            '#FFE5B4', '#E5F3FF', '#E5FFE5', '#FFE5E5', '#F0E5FF',
            '#FFFACD', '#E0FFFF', '#F0FFF0', '#FFF0F5', '#F5F0FF',
            '#FFEFD5', '#F0F8FF', '#F5FFFA', '#FDF5E6', '#F8F8FF',
            '#FFFFF0', '#F0FFFF', '#FFFAF0', '#FFF5EE', '#F5F5DC'
        ];
        
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(colors[i % colors.length]);
        }
        return result;
    }

    getOperatorSymbol(operator) {
        switch (operator) {
            case '+': return '+';
            case '-': return '−';
            case '*': return '×';
            case '/': return '÷';
            default: return '';
        }
    }

    handleCellClick(row, col) {
        if (this.gameCompleted) return;

        // Clear previous selection
        document.querySelectorAll('.cage.selected').forEach(cell => {
            cell.classList.remove('selected');
        });

        // Select new cell
        const cell = this.getCellElement(row, col);
        cell.classList.add('selected');
        this.selectedCell = { row, col };

        // Show number pad
        this.showNumberPad(row, col);
    }

    showNumberPad(row, col) {
        const possibleValues = this.puzzle.getPossibleValues(row, col);
        
        this.numberPad.innerHTML = '';
        
        // Add number buttons
        for (let i = 1; i <= this.puzzle.size; i++) {
            const btn = document.createElement('button');
            btn.className = 'number-btn';
            btn.textContent = i;
            btn.disabled = !possibleValues.includes(i);
            btn.addEventListener('click', () => this.placeNumber(row, col, i));
            this.numberPad.appendChild(btn);
        }

        // Add clear button
        const clearBtn = document.createElement('button');
        clearBtn.className = 'number-btn clear';
        clearBtn.textContent = 'Clear';
        clearBtn.addEventListener('click', () => this.placeNumber(row, col, 0));
        this.numberPad.appendChild(clearBtn);

        // Add clear cage button
        const clearCageBtn = document.createElement('button');
        clearCageBtn.className = 'number-btn clear';
        clearCageBtn.textContent = 'Clear Cage';
        clearCageBtn.addEventListener('click', () => this.clearCage(row, col));
        this.numberPad.appendChild(clearCageBtn);

        this.numberPad.classList.remove('hidden');
        
        // Disable control buttons to prevent accidental clicks
        this.disableControlButtons();
    }

    hideNumberPad() {
        this.numberPad.classList.add('hidden');
        document.querySelectorAll('.cage.selected').forEach(cell => {
            cell.classList.remove('selected');
        });
        this.selectedCell = null;
        
        // Re-enable control buttons
        this.enableControlButtons();
    }

    placeNumber(row, col, num) {
        this.puzzle.userGrid[row][col] = num;
        this.updateCellDisplay(row, col);
        this.hideNumberPad();
        
        // Check for completion
        this.checkCompletion();
        
        // Update visual feedback
        this.updateVisualFeedback();
    }

    updateCellDisplay(row, col) {
        const cell = this.getCellElement(row, col);
        const value = this.puzzle.userGrid[row][col];
        
        // Remove existing user input
        const existingInput = cell.querySelector('.user-input');
        if (existingInput) {
            existingInput.remove();
        }

        if (value > 0) {
            const input = document.createElement('div');
            input.className = 'user-input';
            input.textContent = value;
            cell.appendChild(input);
        }
    }

    updateVisualFeedback() {
        // Clear previous feedback
        document.querySelectorAll('.cage').forEach(cell => {
            cell.classList.remove('error', 'correct');
            // Reset any custom background colors for errors
            cell.style.boxShadow = '';
        });

        // Check each cage
        for (let i = 0; i < this.puzzle.cages.length; i++) {
            const cage = this.puzzle.cages[i];
            const isComplete = cage.cells.every(cell => 
                this.puzzle.userGrid[cell.row][cell.col] > 0
            );
            
            if (isComplete) {
                const values = cage.cells.map(cell => this.puzzle.userGrid[cell.row][cell.col]);
                const calculated = this.puzzle.calculateWithOperator(values, cage.constraint.operator);
                const isValid = calculated === cage.constraint.target;
                const className = isValid ? 'correct' : 'error';
                
                cage.cells.forEach(cell => {
                    const cellElement = this.getCellElement(cell.row, cell.col);
                    cellElement.classList.add(className);
                    
                    // Add additional visual emphasis for errors
                    if (!isValid) {
                        cellElement.style.boxShadow = 'inset 0 0 0 2px #f44336';
                    } else {
                        cellElement.style.boxShadow = 'inset 0 0 0 2px #4CAF50';
                    }
                });
            }
        }
    }

    getCellElement(row, col) {
        return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    checkCompletion() {
        if (this.puzzle.validateSolution()) {
            this.gameCompleted = true;
            this.stopTimer();
            this.showWinModal();
        }
    }

    isPuzzleComplete() {
        for (let i = 0; i < this.puzzle.size; i++) {
            for (let j = 0; j < this.puzzle.size; j++) {
                if (this.puzzle.userGrid[i][j] === 0) return false;
            }
        }
        return true;
    }

    startTimer() {
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.timerDiv.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    showWinModal() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.finalTimeSpan.textContent = timeStr;
        this.winModal.classList.remove('hidden');
    }

    closeModalAndGenerateNew() {
        this.winModal.classList.add('hidden');
        this.generateNewGame();
    }

    showHowToPlay() {
        this.howToPlayModal.classList.remove('hidden');
    }

    closeHowToPlay() {
        this.howToPlayModal.classList.add('hidden');
    }

    handleKeyDown(e) {
        // Close help modal with ESC key
        if (e.key === 'Escape' && !this.howToPlayModal.classList.contains('hidden')) {
            this.closeHowToPlay();
            return;
        }

        if (!this.selectedCell || this.gameCompleted) return;

        const { row, col } = this.selectedCell;
        
        if (e.key >= '1' && e.key <= '9') {
            const num = parseInt(e.key);
            if (num <= this.puzzle.size) {
                const possibleValues = this.puzzle.getPossibleValues(row, col);
                if (possibleValues.includes(num)) {
                    this.placeNumber(row, col, num);
                }
            }
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
            this.placeNumber(row, col, 0);
        } else if (e.key === 'Escape') {
            this.hideNumberPad();
        }
    }

    refreshApp() {
        // Show loading state
        this.refreshAppBtn.textContent = '↻ Refreshing...';
        this.refreshAppBtn.disabled = true;
        
        // Unregister service worker and force refresh
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                Promise.all(registrations.map(registration => registration.unregister()))
                    .then(() => {
                        // Clear caches
                        if ('caches' in window) {
                            caches.keys().then(cacheNames => {
                                Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
                                    .then(() => {
                                        // Force reload
                                        window.location.reload(true);
                                    });
                            });
                        } else {
                            window.location.reload(true);
                        }
                    });
            });
        } else {
            // Fallback for browsers without service worker support
            window.location.reload(true);
        }
    }

    disableControlButtons() {
        // Disable buttons
        this.newGameBtn.disabled = true;
        this.howToPlayBtn.disabled = true;
        this.resetPuzzleBtn.disabled = true;
        this.refreshAppBtn.disabled = true;
        
        // Disable form controls
        this.gridSizeSelect.disabled = true;
        this.difficultySelect.disabled = true;
        this.operatorCheckboxes.forEach(checkbox => {
            checkbox.disabled = true;
        });
    }

    enableControlButtons() {
        // Enable buttons
        this.newGameBtn.disabled = false;
        this.howToPlayBtn.disabled = false;
        this.resetPuzzleBtn.disabled = false;
        this.refreshAppBtn.disabled = false;
        
        // Enable form controls
        this.gridSizeSelect.disabled = false;
        this.difficultySelect.disabled = false;
        this.operatorCheckboxes.forEach(checkbox => {
            checkbox.disabled = false;
        });
    }

    clearCage(row, col) {
        // Find all cages that contain this cell
        const cagesToClear = this.puzzle.cages.filter(cage => 
            cage.cells.some(cell => cell.row === row && cell.col === col)
        );

        // Clear all cells in these cages
        cagesToClear.forEach(cage => {
            cage.cells.forEach(cell => {
                this.puzzle.userGrid[cell.row][cell.col] = 0;
                this.updateCellDisplay(cell.row, cell.col);
            });
        });

        this.hideNumberPad();
        
        // Update visual feedback
        this.updateVisualFeedback();
    }

    resetPuzzle() {
        if (!this.puzzle) return;

        // Clear all user inputs
        for (let i = 0; i < this.puzzle.size; i++) {
            for (let j = 0; j < this.puzzle.size; j++) {
                this.puzzle.userGrid[i][j] = 0;
                this.updateCellDisplay(i, j);
            }
        }

        // Hide number pad if it's open
        this.hideNumberPad();
        
        // Reset game state
        this.gameCompleted = false;
        
        // Restart timer
        this.startTimer();
        
        // Update visual feedback to clear any error/correct indicators
        this.updateVisualFeedback();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KenKenApp();
});

// PWA Install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button or banner
    console.log('PWA install prompt available');
});

window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
}); 