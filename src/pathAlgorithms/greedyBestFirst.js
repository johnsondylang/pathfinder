import {PriorityQueue} from './PriorityQueue.js';

/**
 * applies the greedy best-first algorithm
 * 
 * @param {pathfinder-grid} grid - the pathfinder grid to search 
 */
export async function greedyBestFirst(grid) {
    
    // all cells that have still need to be evaluated
    // the last item in each sub array is the open cell where the other cells are the path it took to get there
    let openPaths = new PriorityQueue();
    openPaths.enqueue([grid.startCell], 0);

    //
    while(openPaths.length > 0) {

        // use the lowest priority cell
        const currentPath = openPaths.dequeueLow().item;        
        const currentCell = currentPath[currentPath.length - 1];

        // gets all the connected cells to the current cell
        const adjacentCells = grid.getAdjacentCells(currentCell, {ignoreBlocked:true, ignoreChecked:true});

        for (const cell of adjacentCells) {
            
            // check if on the end cell
            if (cell.column == grid.endCell.column && cell.row == grid.endCell.row) {
                // return the path that led to the find
                return currentPath.concat([grid.endCell])                    
            }
            
            // calculate heuristic as the estimated shortest path to end node.
            // this case simple count of the possible cells ignoring possibility of blocked cells
            const heuristic = (Math.abs(cell.row - grid.endCell.row)) + (Math.abs(cell.column - grid.endCell.column));

            await grid.highlightCheckedCell(cell);
            openPaths.enqueue(currentPath.concat(cell), heuristic);
        }
    }


}