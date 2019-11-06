
const directionVectors = [
    [2, 0],
    [-2, 0],
    [0, 2],
    [0, -2]
]
/**
 * Implements a recusive backtracking algorithm to create a maze on the grid
 * 
 * @param {*} grid 
 */
export async function recursiveBacktracking(grid, backtrackPath) {

    if (!backtrackPath) {
        await grid.fillBlocks();
    } 
    
    const stack = backtrackPath ? backtrackPath : [[grid.startCell]];

    while(stack.length > 0) {

        const lastPath = stack.pop();
        if (lastPath.length == 0) return;
        const currentCell = lastPath[lastPath.length - 1];
        
        let adjacentCell;
        let betweenCell;
        directionVectors.sort(function() {
            return 0.5 - Math.random();
        });
        for (let i = 0; i < directionVectors.length; i++) {
            const vector = directionVectors[i];
            adjacentCell = grid.getCell(currentCell.column + vector[0], currentCell.row + vector[1]);
            // cell is out of range of grid
            if (!adjacentCell) continue;
            //           
            if( (!adjacentCell.blocked && !adjacentCell.end) || adjacentCell.start) {
                adjacentCell = undefined;
            } else {
                betweenCell = grid.getCell(currentCell.column + (vector[0]/2), currentCell.row + (vector[1]/2) );
                break
            }
        } 

        if (adjacentCell) {
            adjacentCell.blocked = false;
            betweenCell.blocked = false;
            stack.push(lastPath.concat([adjacentCell]));
            await grid.wait(10);
        } else {
            lastPath.pop();
            return await recursiveBacktracking(grid, [lastPath]);
        }
    }
}