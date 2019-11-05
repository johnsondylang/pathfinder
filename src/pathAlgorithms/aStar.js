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

    // Loops until there are no more open paths or finds the end
    while(openPaths.length > 0) {

        // each path is added to the priority queue with a priority of the estimated cost of reaching the end.
        // thus, removing the lowest priority path we are checking the path with the lowest estimated cost of finish
        const currentPath = openPaths.dequeueLow().item;        
        const currentCell = currentPath[currentPath.length - 1];

        // get all the cells around the current cell
        const adjacentCells = grid.getAdjacentCells(currentCell, {ignoreBlocked:true, ignoreChecked:true});
        
        // used as the g(n) in the path estimation function f(n) = g(n) + h(n)
        // represents the path length from the start node to the current node
        const gn = currentPath.length;

        // check all the adjacent cells
        for (const cell of adjacentCells) {
            
            // check if on the end cell
            if (cell.column == grid.endCell.column && cell.row == grid.endCell.row) {
                // return the path that led to the find
                return currentPath.concat([grid.endCell])                    
            }
            
            // calculate h(n) as the estimated distance to the end node from the current node ignoring possibility of blocked cells
            const hn = (Math.abs(cell.row - grid.endCell.row)) + (Math.abs(cell.column - grid.endCell.column));
            
            // calculate f(n), the estimated cost of reaching the end using the current path
            // sum of the actual cost to reach the current node ( g(n) ) and the estimated cost of reaching the end ( (hn) )
            const fn = gn + hn;

            await grid.highlightCheckedCell(cell);

            // add the current path into the priority queue using the estimated cost function as the priority
            openPaths.enqueue(currentPath.concat(cell), fn);
        }
    }


}