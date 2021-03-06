import {LitElement, html, css} from '/node_modules/lit-element/lit-element.js';

import './grid-cell.js'

// Imports the pathfinding algorithm functions
import {aStar} from './pathAlgorithms/aStar.js';
import {breadthFirst} from './pathAlgorithms/breadthFirst.js';
import {depthFirst} from './pathAlgorithms/depthFirst.js';
import {dijkstras} from './pathAlgorithms/dijkstras.js';
import {greedyBestFirst} from './pathAlgorithms/greedyBestFirst.js';
// imports the maze generating algorithm functions
import {recursiveDivision} from './mazeAlgorithms/recursiveDivision.js';
import {recursiveBacktracking} from './mazeAlgorithms/recursiveBacktracking.js';

export class PathfinderGrid extends LitElement {

    static get properties() {
        return {            
            columns: {type: Number},
            rows: {type: Number},     
            speedLevel: {type: String}, 
            allowDiagonalSearch: {type: Boolean, reflect: true}     
        }
    }

    constructor() {
        super();

        /**
         * All the available pathfinding algorithms currently implemented
        */
        this.SUPPORTED_PATH_ALGORITHMS = {
            "A Star": aStar,
            "Breadth First": breadthFirst,
            "Depth First": depthFirst,
            "Dijkstras": dijkstras,    
            "Greedy Best-First": greedyBestFirst,    
        }

        this.SUPPORTED_MAZE_ALGORITHMS = {
            "Recursive Backtracking": recursiveBacktracking,
            "Recursive Division": recursiveDivision,
        }

        this.speedLevel = "Normal";
        this.columns = 0;
        this.rows = 0;
        //
        this.startCell;
        this.endCell;
        
        this.allowDiagonalSearch = false;

        // 
        this.eventHandler = {
            "setBlocked": false,
            "removeBlocked": false,
            "moveStart": false,
            "moveEnd": false,
            "runningAlgorithm": false,
            "cellsChecked": 0,
        }
    }

    static get styles() {
        return [
            css`          
                :host {
                    display: flex;
                    flex-basis: 0;
                    justify-content: center;
                    align-items: center;        
                    height:100%;  
                    width:100%;  
                    border: 2px solid rgba(40, 167, 232, .3);               
                }     
                .board {
                    display: grid;
                    height: 100%;
                    width: 100%;
                    grid-gap: 1px;                    
                    background-color: rgba(40, 167, 232, .3);                    
                }               
            `
        ]
    }

    render() {
        const cells = [];
        for(let i = 0; i < this.rows; i++) {      
            for(let j = 0; j < this.columns; j++) {                
                cells.push(
                    html`
                        <grid-cell 
                            row=${i} 
                            column=${j} 
                            .start=${false} 
                            .end=${false} 
                            .checked=${false} 
                            .blocked=${false} 
                            .inShortestPath=${false}
                        ></grid-cell>`
                    )
            }
        }

        return html` 
            <style>
                .board {
                    grid-template-columns: repeat(${this.columns}, auto);
                }
            </style>
            <div class="board">
                ${cells}
            </div>
        `
    }   

    firstUpdated() {

        // sets the event handler props to enable mouseover events and toggles 'blocked' prop if appropriate
        this.addEventListener('cell-mousedown', this._handleCellMousedown);
        // uses the event handler props to add functionality of dragging start and end cells as well as creating 'walls' by dragging 
        this.addEventListener('cell-mouseover', this._handleCellMouseover);
        // sets all event hanlder props to false to block any functionality on mouseover
        this.addEventListener('mouseup', this._resetEventHandler);

        this._setInitialStartEnd();

    }

    /**
     * runs the given pathfinding algorithm to find the optimal path, highlighting along the way
     * @param {string} algorithmName: Name of the algorithm to run
     */
    async findPath(algorithmName) {
        
        // do not run a new algorithm while another is running
        if (this.eventHandler.runningAlgorithm) return;          

        // increments this everytime a cell is checked to track the number of checks an algorithm performs
        this.eventHandler.cellsChecked = 0;
        
        if (this.SUPPORTED_PATH_ALGORITHMS.hasOwnProperty(algorithmName)) {
            // need to clear all checked cells from previous runs
            this.clearPath();
            // get the specified algorithm from the supported algorithms
            const pathfinderFunction = this.SUPPORTED_PATH_ALGORITHMS[algorithmName];
            
            // set the running Algorithm paramater in the eventHandler object
            // this will block mouse click and mouseover events from altering grid while running algorithm
            this.eventHandler.runningAlgorithm = true;
            // dispatch custom event 
            this._dispatchAlgorithmStart();

            // run the function
            let path = await pathfinderFunction(this);

            // handle case pathfinder function returns undefined, 
            // could happend if no possible path
            if (!path) {
                path = [];
            }

            //highlight the found path
            await this._highlightPath(path);

            // dispacth algorithm end event
            this._dispatchAlgorithmEnd(algorithmName, path.length);
        } else {
            // the way this was intended to be coded, should not ever hit this. Add here just in case
            throw new Error(`You have tried to run an un-supported algrithm: ${algorithmName}`);
        }
    
    }

    async generateMaze(algorithmName) {
        // do not run a new algorithm while another is running
        if (this.eventHandler.runningAlgorithm) return;          

        if (this.SUPPORTED_MAZE_ALGORITHMS.hasOwnProperty(algorithmName)) {
            // ensure the runningAlgorithm flag is set in the eventHandler
            this.eventHandler.runningAlgorithm = true;
            // dispatch custom event 
            this._dispatchAlgorithmStart();
            // clear board to see the maze generating
            this.clearPath();
            this.clearBlocks();

            // get and run the algorithm function from the supported maze constant
            const mazeAlgorithm = this.SUPPORTED_MAZE_ALGORITHMS[algorithmName];
            await mazeAlgorithm(this);

            // remove the eventHandler flags when maze has been generated
            this.eventHandler.runningAlgorithm = false;

            this._dispatchAlgorithmEnd();
        } else {
            // the way this was intended to be coded, should not ever hit this. Add here just in case
            throw new Error(`You have tried to run an un-supported algrithm: ${algorithmName}`);
        }

    }

    /**
     * Resets the grid to its inital state
     */
    resetGrid() {
        
        const modifiedCells = this.shadowRoot.querySelectorAll("[checked], [blocked], [inShortestPath]");
        Array.from(modifiedCells).forEach(cell => {
            cell.resetDefaults();
        });

        this._setInitialStartEnd();
    }

    /**
     * Clears the blocked cells from the grid
     */
    clearBlocks() {
        const modifiedCells = this.shadowRoot.querySelectorAll("[blocked]");
        Array.from(modifiedCells).forEach(cell => {
            cell.blocked = false;
        });
    }

    /**
     * resets to default all checked and inShortestPath cells
     */
    clearPath() {
        const modifiedCells = this.shadowRoot.querySelectorAll("[checked], [inShortestPath]");
        Array.from(modifiedCells).forEach(cell => {
            cell.checked = false;
            cell.inShortestPath = false;
        });
    }

    /**
     * Resizes the grid to the passed in number of columns and rows
     * @param {Number} columns 
     * @param {Number} rows 
     */
    async resizeGrid(columns, rows) {      
            
        this.startCell.start = false;
        this.endCell.end = false;

        this.columns = columns;
        this.rows = rows;    
        
        await this.updateComplete;

        this.resetGrid();
    }

    /**
     * Returns an HTML element for a grid-cell at the given column, row
     * @param {Number} column
     * @param {Number} row
     * @return {HTMLElement}
     */
    getCell(column, row) {
        return this.shadowRoot.querySelector(`[column="${column}"][row="${row}"]`);
    }
    

    /**
     * returns an array of cells from an array of positions
     * @param {Array<{}>} cellPositions - an array of the column, row coordinates of the cells to return
     * @param {Number} cellPositions.column - The column of the cell to return.
     * @param {Number} cellPositions.row - The row of the cell to return.
     */
    getCells(cellPositions) {
        // build a selector to mat
        const selectors = cellPositions.map(item=> `[column="${item.column}"][row="${item.row}"]`);

        const cells = this.shadowRoot.querySelectorAll(selectors.join(', '));
        return Array.from(cells ? cells : []);
    }

    /**
     * Gets all adjacent grid-cells (this is, the cell above, below, right and left) to the passed in grid-cell 
     * @param {grid-cell} cell
     * @param {Boolean} [ignoreChecked=false] set to ignore cells that have the blocked attribute
     * @param {Boolean} [ignoreBlocked=false] set to ignore cells that have the checked attribute
     * @return {Array<grid-cell>}
     */
    getAdjacentCells(cell, {ignoreBlocked, ignoreChecked}={}) {
        
        // set x,y (column, row) based on the passed in cell
        let directionVectors = [
            // right
            [cell.column + 1, cell.row],
            // down
            [cell.column, cell.row + 1],
            // left
            [cell.column - 1, cell.row],
            // up
            [cell.column, cell.row - 1],
        ]
        // add diagonal vectors if perameter set
        if (this.allowDiagonalSearch) {            
            directionVectors = directionVectors.concat([
                // diagonal left / down
                [cell.column - 1, cell.row + 1],
                // diagonal left / up
                [cell.column - 1, cell.row - 1],
                // diagonal right / down
                [cell.column + 1, cell.row + 1],
                // diagonal right / up
                [cell.column + 1, cell.row - 1]
            ]);
        }

        let adjacentCells = [];
        for (const vector of directionVectors) {
            // set of conditions that 
            const excludeConditions = [
                // if vector's row value is off the grid 
                (vector[0] < 0),
                (vector[1] >= this.rows),
                // if vector's column value is off the grid
                (vector[1] < 0),
                (vector[0] >= this.columns),               
            ];

            // do not add the cell if any of the exclude conditions are true
            if (excludeConditions.some(cond => cond)) continue;

            // get the cell
            const cell = this.getCell(vector[0], vector[1]);

            // apply the optional exclude checks 
            if (ignoreBlocked && cell.blocked) continue;
            if (ignoreChecked && cell.checked) continue;
            if (cell.isSameNode(this.startCell)) continue

            adjacentCells.push(cell);
        };

        return adjacentCells;
    }

    /**
     * Highlights a cell according to the speedLevel setting.
     * @param {grid-cell} cell - the grid-cell to highlight
     */
    async highlightCheckedCell(cell) {
        cell.checked = true;
        switch (this.speedLevel) {
            case "Very Slow":
                await this.wait(500);
                break;
            case "Slow": 
                await this.wait(250);  
                break;              
            case "Normal":
                await this.wait(25);
                await cell.performUpdate();
                break;
            case "Fast":
                if (this.eventHandler.cellsChecked % 10 === 0) {
                    await this.wait(10);
                }
                break;
            case "Very Fast": 
                if (this.eventHandler.cellsChecked % 50 === 0) {
                    await this.wait(0);                    
                }
                break;
            case "ludicrous Speed Go!":
                break;
        }

        this.eventHandler.cellsChecked += 1;
    }

    /**
     * blocks a cell
     * @param {<grid-cell>} cell 
     */
    async blockCell(cell) {
        
        if (cell.row == this.startCell.row && cell.column == this.startCell.column) return;
        if (cell.row == this.endCell.row && cell.column == this.endCell.column) return;
        
        cell.blocked = true;
        for (let i = 0; i < arguments.length; i++) {
            cell = arguments[i];
            if (cell.row == this.startCell.row && cell.column == this.startCell.column) return;
            if (cell.row == this.endCell.row && cell.column == this.endCell.column) return;
            cell.blocked = true;
        }

        await this.wait(10);
    }

    /**
     * fills the entire grid, except for start / end , with blocks
     */
    async fillBlocks() {
        const gridCells = this.shadowRoot.querySelectorAll("grid-cell");
        Array.from(gridCells).forEach(cell => {            
            if (cell.isSameNode(this.startCell) || cell.isSameNode(this.endCell)) return;
            cell.blocked = true;
        });
    }

    /**
     * Highlights the shortest path  
     * @param {Array<cell-list>} cellList
     */
    async _highlightPath(cellList) {
        // return if cellList is undefined or empty array
        if (!cellList) return;
        // highlight cells in the path by setting the 'inShortestPath property to true
        for (const cell of cellList) {            
            await this.wait(0);
            cell.inShortestPath = true;
        }
      
    }

    /** 
     * Handles the event of cell-mousedown
     * sets the eventHandler properties depending. 
     * That is, sets the 'moveStart', 'moveEnd' or 'setBlocked' values depending on if this cell is start,end or neither
     * @param {Event} CustomEvent emitted by grid-cell on mousedown
     */
    _handleCellMousedown(event) {
        
        // prevent all events in the case that an algorithm is currently running
        if (this.eventHandler.runningAlgorithm) return;

        // custom event emitted by grid-cell contains a reference to itself in the detail of the event
        const cell = event.detail.element;
            
        // the event handler for on mouseover decides what to do depening on the values of eventHandler props
        // ex: if moveStart = true, than it move the start position
        // ex: if the setBlocked prop is true, than toggles the cells blocked property

        // if the cell is the start cell, ensure the moveStart prop is true
        this.eventHandler.moveStart = cell.start;
        // if the cell is the end Cell, ensure the moveEnd prop is true
        this.eventHandler.moveEnd = cell.end;
        // if the cell is neither the start nor end, set prop 'setBlocked' or 'removeBlocked to true and toggle cells blocked prop
        if (!(cell.start || cell.end)) {
            // if the user clicks an unblocked cell, need to add block and set the 'setBlocked' flag in eventHandler to allow for add on drag
            // if the user clicks a blocked cell, need to remove the block and set the 'removeBlocked' flag in eventHnalder to allow for remove on drag
            if (cell.blocked) {            
                this.eventHandler.setBlocked = false;
                this.eventHandler.removeBlocked = true; 
            } else {
                this.eventHandler.setBlocked = true;
                this.eventHandler.removeBlocked = false; 
            }
            cell.blocked = !cell.blocked;            
        } else {
            // ensure the value is false, two values should never be true
            // could happend when user moves mouse out of grid whild dragging, easy to lose track of mouse down state
            this.eventHandler.setBlocked = false;
            this.eventHandler.removeBlocked = false;
        }        
    }

    /**
     * Handles the event of cell-moseover
     * Will take action according to the prop values in this.eventHandler
     * @param {Event} CustomEvent emitted by grid-cell on mouseover
     */
   _handleCellMouseover(event)  {
        // prevent all events in the case that an algorithm is currently running
        if (this.eventHandler.runningAlgorithm) return;

        // custom event emitted by grid-cell contains a reference to itself in the detail of the event
        const cell = event.detail.element;
        // decide what action to take, if any, depening on value set in eventHandler
        if (this.eventHandler.setBlocked) {
            // can not block cells that are the start or end cells
            if (cell.start || cell.end) return;
            // adds the blocked prop of the cell allows user to create 'wall' by holding and dragging mouse
            cell.blocked = true;
        } else if (this.eventHandler.removeBlocked) {
            // remove the blocked of the cell, allows user to remove walls by holding and dragging mouse
            cell.blocked = false;
        } else if (this.eventHandler.moveStart) {
            // can not set blocked or end cells as start
            if (cell.blocked || cell.end) return;
            // changes the start cell. Allows user to hold and drag the start cell to a new position
            this._moveStart(cell);
        } else if (this.eventHandler.moveEnd) {
            // can not set blocked or start cells as end
            if (cell.blocked || cell.start) return;
            // changes the end cell. Allows user to hold and drag the end cell to a new position
            this._moveEnd(cell);
        }
    }

    /**
     * Resets props to default values of false. Essentially removes functionality of mouseover event
     */ 
    _resetEventHandler() {
        for (let key in this.eventHandler) {
            // do not reset the running algorithm prop
            if (key === "runningAlgorithm") continue;
            this.eventHandler[key] = false;
        }
    }
   
    /**
     * Moves the start cell to the passed in grid-cell
     * @param {grid-cell} newCell 
     */
    _moveStart(newCell) {
        this.startCell.start = false;
        this.startCell = newCell;
        this.startCell.start = true;
    }

    /**
     * Moves the end cell to the passed grid-cell
     * @param {grid-cell} newCell 
     */
    _moveEnd(newCell) {
        this.endCell.end = false;
        this.endCell = newCell;
        this.endCell.end = true;
    }

    /**
     * Sets the inital start and end cell positions
     */
    _setInitialStartEnd() {

        // set the inital coords to a nice looking spot in the middle-ish of the grid
        const startEndRow = Math.floor(this.rows / 2);
        const startColumn = Math.floor(this.columns / 4);
        const endColumn = Math.floor(this.columns - (this.columns / 4));
        
        // remove previous start and end if there
        if (this.startCell) this.startCell.start = false;
        if (this.endCell) this.endCell.end = false;

        // set the start and end cells based on the calculated column/row values above
        this.startCell = this.shadowRoot.querySelector(`[column="${startColumn}"][row="${startEndRow}"]`);
        this.endCell = this.shadowRoot.querySelector(`[column="${endColumn}"][row="${startEndRow}"]`);

        // set the start and end cells as start and end
        if (this.startCell) this.startCell.start = true;
        if (this.endCell) this.endCell.end = true;
    }

    /**
     * Dispatchs custom event when an algorthm starts running
     */
    _dispatchAlgorithmStart(algorithmName) {
        // custom event to handle 
        const e = new CustomEvent("algorithmStart", {            
            detail: {
                element:algorithmName,
            },
            bubbles: true, 
            composed: true 
        });

        // dispatch the custom event to parent element (the datatable)
        this.dispatchEvent(e);
    }

        /**
     * Dispatchs custom event when an algorthm starts running
     */
    _dispatchAlgorithmEnd(algorithmName, solutionLength) {
        // custom event to handle 
        const e = new CustomEvent("algorithmEnd", {            
            detail: {
                algorithm:algorithmName,
                cellsChecked:this.eventHandler.cellsChecked,
                solutionLength:solutionLength
            },
            bubbles: true, 
            composed: true 
        });

        // end the algorithm 
        this.eventHandler.runningAlgorithm = false;
        this.eventHandler.cellsChecked = 0;
        
        // dispatch the custom event to parent element (the datatable)
        this.dispatchEvent(e);
    }

    // basic helper function to 'await' on a setTimeout
    async wait(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
}


window.customElements.define("pathfinder-grid", PathfinderGrid);