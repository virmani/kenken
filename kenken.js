// KenKen Puzzle Generator and Solver
class KenKenPuzzle {
    constructor(size) {
        this.size = size;
        this.grid = [];
        this.cages = [];
        this.solution = [];
        this.userGrid = [];
        this.init();
    }

    init() {
        // Initialize empty grids
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.userGrid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.solution = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.cages = [];
    }

    // Generate a valid Latin square as the solution
    generateSolution() {
        this.solution = Array(this.size).fill().map(() => Array(this.size).fill(0));
        
        if (this.fillGrid(0, 0)) {
            // Copy solution to grid for cage generation
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    this.grid[i][j] = this.solution[i][j];
                }
            }
            return true;
        }
        return false;
    }

    // Recursive backtracking to fill the grid
    fillGrid(row, col) {
        if (row === this.size) return true;
        if (col === this.size) return this.fillGrid(row + 1, 0);

        const numbers = this.shuffleArray([...Array(this.size)].map((_, i) => i + 1));
        
        for (const num of numbers) {
            if (this.isValidPlacement(row, col, num)) {
                this.solution[row][col] = num;
                if (this.fillGrid(row, col + 1)) return true;
                this.solution[row][col] = 0;
            }
        }
        return false;
    }

    // Check if number placement is valid (Latin square rules)
    isValidPlacement(row, col, num) {
        // Check row
        for (let j = 0; j < this.size; j++) {
            if (j !== col && this.solution[row][j] === num) return false;
        }
        
        // Check column
        for (let i = 0; i < this.size; i++) {
            if (i !== row && this.solution[i][col] === num) return false;
        }
        
        return true;
    }

    // Generate cages with mathematical constraints
    generateCages(operators = ['+', '-', '*', '/'], difficulty = 'medium') {
        const visited = Array(this.size).fill().map(() => Array(this.size).fill(false));
        const cages = [];
        let cageId = 0;

        // Determine cage size limits based on difficulty
        const cageSizeLimits = {
            easy: { min: 1, max: 3, singleCellChance: 0.4 },
            medium: { min: 1, max: 4, singleCellChance: 0.2 },
            hard: { min: 1, max: 5, singleCellChance: 0.1 }
        };

        const limits = cageSizeLimits[difficulty];

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (!visited[i][j]) {
                    const cage = this.generateCage(i, j, visited, limits, operators);
                    if (cage) {
                        cage.id = cageId++;
                        cages.push(cage);
                    }
                }
            }
        }

        this.cages = cages;
        return cages;
    }

    // Generate a single cage starting from a cell
    generateCage(startRow, startCol, visited, limits, operators) {
        const cells = [{row: startRow, col: startCol}];
        visited[startRow][startCol] = true;

        // Decide cage size
        const shouldBeSingleCell = Math.random() < limits.singleCellChance;
        const maxSize = shouldBeSingleCell ? 1 : 
                       Math.floor(Math.random() * (limits.max - limits.min + 1)) + limits.min;

        // Grow the cage
        while (cells.length < maxSize && cells.length < this.size) {
            const possibleCells = this.getAdjacentCells(cells, visited);
            if (possibleCells.length === 0) break;

            const nextCell = possibleCells[Math.floor(Math.random() * possibleCells.length)];
            cells.push(nextCell);
            visited[nextCell.row][nextCell.col] = true;
        }

        // Calculate constraint
        const values = cells.map(cell => this.solution[cell.row][cell.col]);
        const constraint = this.calculateConstraint(values, operators);

        return {
            cells: cells,
            constraint: constraint,
            values: values
        };
    }

    // Get adjacent unvisited cells
    getAdjacentCells(cage, visited) {
        const adjacent = [];
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

        for (const cell of cage) {
            for (const [dr, dc] of directions) {
                const newRow = cell.row + dr;
                const newCol = cell.col + dc;

                if (newRow >= 0 && newRow < this.size && 
                    newCol >= 0 && newCol < this.size && 
                    !visited[newRow][newCol]) {
                    
                    const exists = adjacent.some(c => c.row === newRow && c.col === newCol);
                    if (!exists) {
                        adjacent.push({row: newRow, col: newCol});
                    }
                }
            }
        }

        return adjacent;
    }

    // Calculate the mathematical constraint for a cage
    calculateConstraint(values, operators) {
        if (values.length === 1) {
            return { target: values[0], operator: null };
        }

        // Try different operators and pick a valid one
        const validOperators = [];
        
        for (const op of operators) {
            let result = this.calculateWithOperator(values, op);
            if (result !== null && result > 0 && result === Math.floor(result)) {
                validOperators.push({ target: result, operator: op });
            }
        }

        if (validOperators.length === 0) {
            // Fallback to addition
            const sum = values.reduce((a, b) => a + b, 0);
            return { target: sum, operator: '+' };
        }

        return validOperators[Math.floor(Math.random() * validOperators.length)];
    }

    // Calculate result with specific operator
    calculateWithOperator(values, operator) {
        // Handle single-cell cages (no operator)
        if (operator === null) {
            return values.length === 1 ? values[0] : null;
        }
        
        switch (operator) {
            case '+':
                return values.reduce((a, b) => a + b, 0);
            
            case '-':
                if (values.length !== 2) return null;
                return Math.abs(values[0] - values[1]);
            
            case '*':
                return values.reduce((a, b) => a * b, 1);
            
            case '/':
                if (values.length !== 2) return null;
                const max = Math.max(...values);
                const min = Math.min(...values);
                return min !== 0 && max % min === 0 ? max / min : null;
            
            default:
                return null;
        }
    }

    // Validate current user input
    validateSolution() {
        // Check if grid is complete
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.userGrid[i][j] === 0) return false;
            }
        }

        // Check Latin square constraints
        if (!this.isValidLatinSquare()) return false;

        // Check cage constraints
        if (!this.validateCages()) return false;

        return true;
    }

    // Check if user grid forms a valid Latin square
    isValidLatinSquare() {
        // Check rows
        for (let i = 0; i < this.size; i++) {
            const row = this.userGrid[i];
            const unique = new Set(row);
            if (unique.size !== this.size || unique.has(0)) return false;
        }

        // Check columns
        for (let j = 0; j < this.size; j++) {
            const col = this.userGrid.map(row => row[j]);
            const unique = new Set(col);
            if (unique.size !== this.size || unique.has(0)) return false;
        }

        return true;
    }

    // Validate all cage constraints
    validateCages() {
        for (const cage of this.cages) {
            if (!this.validateCage(cage)) return false;
        }
        return true;
    }

    // Validate a single cage constraint
    validateCage(cage) {
        const values = cage.cells.map(cell => this.userGrid[cell.row][cell.col]);
        
        if (values.includes(0)) return false; // Incomplete

        const calculated = this.calculateWithOperator(values, cage.constraint.operator);
        return calculated === cage.constraint.target;
    }

    // Get possible values for a cell
    getPossibleValues(row, col) {
        const possible = [];
        
        for (let num = 1; num <= this.size; num++) {
            if (this.isValidUserPlacement(row, col, num)) {
                possible.push(num);
            }
        }
        
        return possible;
    }

    // Check if user placement is valid
    isValidUserPlacement(row, col, num) {
        // Temporarily place the number
        const original = this.userGrid[row][col];
        this.userGrid[row][col] = num;

        // Check row constraint
        const rowValid = this.checkRowConstraint(row, col, num);
        
        // Check column constraint
        const colValid = this.checkColumnConstraint(row, col, num);

        // Restore original value
        this.userGrid[row][col] = original;

        return rowValid && colValid;
    }

    // Check row constraint
    checkRowConstraint(row, col, num) {
        for (let j = 0; j < this.size; j++) {
            if (j !== col && this.userGrid[row][j] === num) {
                return false;
            }
        }
        return true;
    }

    // Check column constraint
    checkColumnConstraint(row, col, num) {
        for (let i = 0; i < this.size; i++) {
            if (i !== row && this.userGrid[i][col] === num) {
                return false;
            }
        }
        return true;
    }

    // Get a hint for the user
    getHint() {
        const emptyCells = [];
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.userGrid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }

        if (emptyCells.length === 0) return null;

        // Find a cell with the fewest possible values
        let bestCell = null;
        let minPossible = this.size + 1;

        for (const cell of emptyCells) {
            const possible = this.getPossibleValues(cell.row, cell.col);
            if (possible.length < minPossible && possible.length > 0) {
                minPossible = possible.length;
                bestCell = {
                    row: cell.row,
                    col: cell.col,
                    value: this.solution[cell.row][cell.col]
                };
            }
        }

        return bestCell;
    }

    // Utility function to shuffle array
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Generate a complete puzzle
    generate(operators = ['+', '-', '*', '/'], difficulty = 'medium') {
        this.init();
        
        // Generate solution
        if (!this.generateSolution()) {
            throw new Error('Failed to generate solution');
        }

        // Generate cages
        this.generateCages(operators, difficulty);

        return {
            size: this.size,
            cages: this.cages,
            solution: this.solution
        };
    }
} 