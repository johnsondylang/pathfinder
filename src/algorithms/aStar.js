import {PriorityQueue} from './PriorityQueue.js';

/**
 * applies the A* algorithm
 * @param {pathfinder-grid} grid - the pathfinder grid to search 
 */
export async function aStar(grid) {
    
    // all cells that have still need to be evaluated
    // the last item in each sub array is the open cell where the other cells are the path it took to get there
    let openPaths = new PriorityQueue();
    openPaths.enqueue([grid.startCell], 0);

    //
    while(openPaths.length > 0) {

        // use the lowest priority cell
        const currentPath = openPaths.dequeueLow().item;        
        const currentCell = currentPath[currentPath.length - 1];

        const adjacentCells = grid.getAdjacentCells(currentCell, {ignoreBlocked:true, ignoreChecked:true});
        // calculate f(n)
        const gn = currentPath.length;

        for (const cell of adjacentCells) {
            
            // check if on the end cell
            if (cell.column == grid.endCell.column && cell.row == grid.endCell.row) {
                // return the path that led to the find
                return currentPath.concat([grid.endCell])                    
            }
            
            // calculate h(n)
            const hn = (Math.abs(cell.row - grid.endCell.row)) + (Math.abs(cell.column - grid.endCell.column));
            // calculate f(n)
            const fn = gn + hn;

            await grid.highlightCheckedCell(cell);
            openPaths.enqueue(currentPath.concat(cell), fn);
        }
    }


}