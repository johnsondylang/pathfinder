import {PriorityQueue} from './PriorityQueue.js';


export async function bestFirst(grid) {
     
    // the queue will store the paths taken as Arrays
    let priorityQueue = new PriorityQueue();
    
    // the first 'path' that will be searched is the start node by itself
    priorityQueue.enqueue(grid.startCell, 0);

    // 
    let index = 0;
    while (priorityQueue.length > 0) {
        // remove the last path out of the queue 
        let dequeueItem = priorityQueue.dequeue(); 
        let lastCell = dequeueItem.item;
        let lastPriority = dequeueItem.priority;
        
        // gets all the adjacent cells. That is, the cells above, below, to the left and right of the last cell
        // ignore cells that have already been checked as that would create a path already in queue
        // ignore cells that are 'blocked' as those are considered walls or obsticals to go around
        const adjacentCells = grid.getAdjacentCells(lastCell, {ignoreBlocked:true, ignoreChecked:true})
        
        // create a new path for each valid adjacent cell by extending the last path with that cell
        // adding that new path into the queue
        for (const cell of adjacentCells) {
            // if the cell is the endCell, we have found the optimal path
            if (cell.column == grid.endCell.column && cell.row == grid.endCell.row) {
                // return the path that led to the find
                //await grid._highlightPath(lastPath.concat([grid.endCell]));
                return                    
            }

            // add the checked flag to the cell, use the wait for animations
            if (index % grid.speedLevel === 0) {
                const speedMult = 10*(1/grid.speedLevel);
                await grid.wait(100*speedMult);
            } 
            
            cell.checked = true;
            index += 1;

            // create the new path by adding the adjacent cell to the old path
            //const newPath = lastPath.concat([cell]);
            // push that new path into the queue
            priorityQueue.enqueue(cell, lastPriority + 1); 
        };
    }
}