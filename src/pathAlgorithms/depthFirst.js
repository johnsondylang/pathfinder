
/**
 * Applies the depth-first search 
 * @param {pathfinder-grid} grid - The pathfinder grid to search  
 * @param {Array<grid-cell>} alternateStart - Path to use as the start instead of the grid.startCell. Used to recurse back from dead ends
 */
export async function depthFirst(grid, alternateStart) {
     
    // the queue will store the paths taken as Arrays
    let stack = [];

    // if an alternate path was provided, will use that as the inital path to explore
    let start = alternateStart ? alternateStart : [grid.startCell];
    
    // the first 'path' that will be searched is the start node by itself
    stack.push(start);

    // go until the stack is empty or start node is found
    while (stack.length > 0) {
        // remove the last path out of the queue 
        let lastPath = stack.pop(); 
        // get the last cell in that path, which will be the starting point for the next search
        let lastCell = lastPath[lastPath.length-1];
                    
        // gets all the adjacent cells. That is, the cells above, below, to the left and right of the last cell
        // ignore cells that have already been checked as that would create a path already in queue
        // ignore cells that are 'blocked' as those are considered walls or obsticals to go around
        const adjacentCells = grid.getAdjacentCells(lastCell, {ignoreBlocked:true, ignoreChecked:true})
        
        // Search hits a dead end when there are no adjacentCells to explore and the stack is empty
        if (adjacentCells.length === 0 && stack.length === 0) {
            // remove the last cell (this is the dead end) from the last path explored
            lastPath.pop();
            
            // if there are no cells left in the lastPath than there is nothing left to search - there are no valid paths to the end
            if (lastPath.length === 0) return [];
            
            // recursively call the depthFirst search again to backtrack to last cell with valid branch
            return await depthFirst(grid, lastPath);
        }

        // create a new path for each valid adjacent cell by extending the last path with that cell
        // adding that new path into the queue
        for (const cell of adjacentCells) {
            // if the cell is the endCell, we have found the optimal path
            if (cell.column == grid.endCell.column && cell.row == grid.endCell.row) {
                // return the path that led to the find
                return lastPath.concat([grid.endCell]);                
            }

            // highlight the newly checked cell, using await to since the highlight function takes into account speed levels to process render
            await grid.highlightCheckedCell(cell);

            // create the new path by adding the adjacent cell to the old path
            const newPath = lastPath.concat([cell]);
            // push that new path into the queue
            stack.push(newPath); 

            // do not evaluate all the adjacent cells in depth first.
            // break here to coninue exploring in one direction
            break;
        };
    }
}