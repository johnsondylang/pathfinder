
/**
 * Applies the recursive division algorithm to generate a maze
 * Algorithm works by recursively bisecting the grid horizontally or vertically, then bisecting the two new sub girds created
 *  1. Bisect the grid with, either horizontally or vertically. Add a single opening through the wall.
 *  2. Bisect the sub grids created by the previous bisection.
 *  3. Repeat, recursively, until the sub grids are too small to bisect.
 *  Note: It is important to not add bisecting wall that blocks the opening of other walls
 * 
 * @param {PathfinderGrid} grid - the pathfinder grid to create the maze on 
 * @param {Object} [subGrid] - Description of the outline of the sub grid within the main grid to bisect -- inables recursion
 * @param {Array<Object>=[]} [borderPassages] - remebers the column,row position of all wall openings to ensure they dont get blocked by subsequent wall
 * @param {Number} borderPassages.column - the column of the wall opening
 * @param {Number} borderPassages.row - the row of the wall opening
 * @param {String} [orientation] - forced orientation of the bisection, if none will randomly choose
 */
export async function recursiveDivision(grid, subGrid, borderPassages, orientation) {

    // minimum size of grid openings
    const minRowSpan = 2; 
    const minColSpan = 2;

    // define the corners of the grid to bisect
    const startRow = subGrid ? subGrid.startRow : 0;
    const startColumn = subGrid ? subGrid.startColumn : 0;
    const endRow = subGrid ? subGrid.endRow : grid.rows - 1;
    const endColumn = subGrid ? subGrid.endColumn : grid.columns - 1;

    // define the size of the grid
    const rowSpan = endRow - startRow;
    const colSpan = endColumn - startColumn;

    // set borderPassages default
    borderPassages = borderPassages ? borderPassages : [];

    // exit if subGrid is under the minimum size
    if (rowSpan < minRowSpan || colSpan
         < minColSpan) return;

    // use the provided orientation else, choose random
    const bisectOrientation = orientation ? orientation : chooseOrientation();
    // Array<GridCell> - all cells in the wall that should be blocked
    let blockCellPositions = [];
    // index of the bisection (row or column depending on orientation)
    let bisectIndex;

    if (bisectOrientation == 'horizontal') {
        // choose the row to bisect - will not allow blocking of other openings or being directily ajacent to another wall
        bisectIndex = chooseBisectRow(startRow, startColumn, endRow, endColumn, borderPassages);
        
        // if there is no possible index, attempt to force a check in the other orientation
        // if this pass is a forced orientation, return without bisecting
        if (bisectIndex === -1) {
            if (orientation == "horizontal") {
                return;
            }
            return await recursiveDivision(grid, subGrid, borderPassages, "vertical");
        } 

        // choose open position at random
        const openPosition = Math.floor(Math.random() * colSpan) + startColumn;
        borderPassages.push({column: openPosition, row: bisectIndex});
        // get all the cells coordinates in the wall
        for (let column = startColumn; column <= endColumn; column ++) {
            if (column == openPosition) continue;
            blockCellPositions.push({
                row: bisectIndex,
                column: column
            });
        }
    } else {
        // choose the row to bisect - will not allow blocking of other openings or being directily ajacent to another wall
        bisectIndex = chooseBisectColumn(startRow, startColumn, endRow, endColumn, borderPassages);

        // if there is no possible index, attempt to force a check in the other orientation
        // if this pass is a forced orientation, return without bisecting
        if (bisectIndex === -1) {
            if (orientation === "vertical") return;
            return await recursiveDivision(grid, subGrid, borderPassages, "horizontal");
        }

        // choose open position at random
        const openPosition = Math.floor(Math.random() * rowSpan) + startRow;
        borderPassages.push({column: bisectIndex, row: openPosition});

        // get all wall grid coordinates
        for (let row = startRow; row <= endRow; row ++) {
            if (row == openPosition) continue;
            blockCellPositions.push({
                row: row,
                column: bisectIndex
            });
        }        
    }

    // display the wall
    try {
        const cells = grid.getCells(blockCellPositions)
        await grid.blockCell(...cells);        
    } catch (error) {
        debugger;
    }


    // get the subgrids from the bisections and continue the recursion
    const nextSubGrids = createSubGrids(startRow, startColumn, endRow, endColumn, bisectIndex, bisectOrientation);
    nextSubGrids.forEach(async item => {
        await recursiveDivision(grid, item, borderPassages);
    });
}

/**
 * Randomly choose an orientation
 * @returns {String} orientation - vertical or horizontal
 */
function chooseOrientation() {
    
    if (Math.random() > .5) {
        return "vertical";
    } else {
        return 'horizontal';
    }
}

/**
 * Chooses a row index to bisect
 * Will not allow for blocking of ajacent wall openings or allow walls directly next to another
 * @param {Number} startRow 
 * @param {Number} startColumn 
 * @param {Number} endRow 
 * @param {Number} endColumn 
 * @param {Array<Object>} borderPassages 
 * @returns {Number} the index to bisect, -1 if none valid
 */
function chooseBisectRow(startRow, startColumn, endRow, endColumn, borderPassages) {
    
    // create a list of all row indexes for columns that border the potential bisection
    const passageRows = borderPassages.map(item => {
        if (item.column == startColumn - 1 || item.column == endColumn + 1) {
            return item.row;
        }
    });

    // compile all possible values to bisect
    // use the list of openings to make sure do not block
    const possibleIndexes = [];
    for (let i = startRow + 1; i < endRow; i++) {
        if (!passageRows.includes(i)) {
            possibleIndexes.push(i);
        }
    }

    // if no possible values, return -1
    if (possibleIndexes.length === 0) return -1;
    // pick a random index in possible values
    return possibleIndexes[Math.floor(Math.random() * (possibleIndexes.length-1) )];
}

/**
 * Chooses a column index to bisect
 * Will not allow for blocking of ajacent wall openings or allow walls directly next to another
 * @param {Number} startRow 
 * @param {Number} startColumn 
 * @param {Number} endRow 
 * @param {Number} endColumn 
 * @param {Array<Object>} borderPassages 
 * @returns {Number} the index to bisect, -1 if none valid
 */
function chooseBisectColumn(startRow, startColumn, endRow, endColumn, borderPassages) {

    // create an array of openings for adjacent walls
    const passageColumns = borderPassages.map(item => {
        if (item.row === startRow - 1 || item.row === endRow + 1) {
            return item.column;
        }
    });

    // complie the list of possible indexes insuring not to block adjacent openings
    let possibleIndexes = [];
    for (let i = startColumn + 1; i < endColumn; i++) {
        if (!passageColumns.includes(i)) {
            possibleIndexes.push(i);
        }
    }

    // return -1 if no valid bisect indexes
    if (possibleIndexes.length === 0) return -1;
    // pick a random value from possible values
    return possibleIndexes[Math.floor(Math.random() * (possibleIndexes.length-1) )];

}

/**
 * creates the subgrids created by a bisection
 * @param {Number} startRow 
 * @param {Number} startColumn 
 * @param {Number} endRow 
 * @param {Number} endColumn 
 * @param {Number} bisectIndex 
 * @param {String} orientation 
 * @returns {Array<object>} The subgrids
 */
function createSubGrids(startRow, startColumn, endRow, endColumn, bisectIndex, orientation) {
    
    let nextSubGrids = []
    if (orientation === "horizontal") {
        // top sub grid
        nextSubGrids.push({
            startRow: startRow,
            startColumn: startColumn,
            endRow: bisectIndex - 1,
            endColumn: endColumn,
        });
        // bottom sub grid
        nextSubGrids.push({
            startRow: bisectIndex + 1,
            startColumn: startColumn,
            endRow: endRow,
            endColumn: endColumn,
        });
    } else {
        // left sub grid
        nextSubGrids.push({
            startRow: startRow,
            startColumn: startColumn,
            endRow: endRow,
            endColumn: bisectIndex - 1,
        });

        // right sub grid
        nextSubGrids.push({
            startRow: startRow,
            startColumn: bisectIndex + 1,
            endRow: endRow,
            endColumn: endColumn,
        });
    }

    return nextSubGrids;
}