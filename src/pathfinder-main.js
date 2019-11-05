//import {LitElement, html, css} from 'https://unpkg.com/@polymer/lit-element/lit-element.js?module';
import {LitElement, html, css} from '/node_modules/lit-element/lit-element.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@vaadin/vaadin-icons/vaadin-icons.js';

import './pathfinder-grid.js';
import './pathfinder-sidepanel.js';

class PathfinderMain extends LitElement {

    static get properties() {
        return {
            runningAlgorithm: {type: Boolean}
        }
    }

    constructor() {
        super();
        this.runningAlgorithm = false;
    }

    static get styles() {
        return [
            css`         
                .main-container {
                    display: flex;
                    flex-basis:0;
                    flex-direction: row;
                    height:100%;
                }
                .main-panel {
                    background:white;
                    display: flex;
                    flex-basis:0;
                    flex-direction: column;
                    flex-grow: 1;
                    width: 100%;
                }
                .control-bar {
                    display:flex;
                    flex-basis:1;
                    flex-direction: row;
                    height:40px;                     
                    align-items: center; 
                    margin-right:5px;
                    margin-left: 10px;
                }
                iron-icon {
                    color: #2C3E50;
                }
                iron-icon:hover {
                    color: black;
                    cursor: pointer;
                }
                iron-icon[runningAlgorithm] {
                    cursor:not-allowed;
                }
                .btn-group {
                    display: flex;
                    flex-basis:0;
                    margin-left: auto;
                }
                .grid-container {
                    flex-grow:1; 
                    margin-left:10px; 
                    margin-right:10px; 
                    margin-top:2px; 
                    margin-bottom:10px;
                }
                select {
                    padding: .25rem .5rem;
                    font-size: .875rem;
                    line-height: 1.5;
                    border-radius: .2rem;
                    color: #6c757d;
                    border-color: #6c757d;
                    font-weight: 400;
                    background-color: white;
                    border: 1px solid #6c757d;
                }
                select:hover {
                    cursor: pointer;
                }
                select:disabled {
                    cursor: unset;
                    opacity: .2;
                }
                .btn-group {
                    font-size: .875rem;
                    line-height: 1.5;
                    border-radius: .2rem;
                    color: #6c757d;
                    border-color: #6c757d;
                    font-weight: 400;
                    margin-right:5px;
                    height: 28px;
                }
                .btn-group button {
                    padding: .25rem .5rem;
                    font-size: .875rem;
                    line-height: 1.5;
                    color: #6c757d;
                    font-weight: 400;
                    background-color: white;
                    border:none;
                    border-radius: .2rem;        
                    border: 1px solid #6c757d;
                }
                .btn-group button:not(:last-child) {
                   border-right: none; /* Prevent double borders */
                   border-top-right-radius: 0;
                   border-bottom-right-radius: 0;
                }
                .btn-group button:last-child{
                    border-top-left-radius: 0;
                    border-bottom-left-radius: 0;
                }
            
                .btn-group button:hover {
                    cursor:pointer;
                    background-color: #6c757d;
                    color: white;
                }
                .btn-group button:disabled {
                    cursor: unset;
                    opacity: .2;
                }
            `
        ]
    }

    render() {
        return html`
            <div class="main-container">
                <side-panel></side-panel>
                <div class="main-panel">
                    <div class="control-bar">
                        <iron-icon id="play-pause-btn" ?runningAlgorithm=${this.runningAlgorithm} icon="vaadin:${this.runningAlgorithm ? "ellipsis-circle-o" : "play-circle-o"}"></iron-icon>
                        <select style="margin-left:10px;" id="speed-select">                
                            <option value="Very Slow">Very Slow</option>
                            <option value="Slow">Slow</option>
                            <option value="Normal" selected>Normal</option>
                            <option value="Fast">Fast</option>
                            <option value="Very Fast">Very Fast</option>                       
                            <option value="ludicrous Speed Go!">ludicrous Speed Go!</option>
                        </select>
                        <div class="btn-group">
                            <button ?disabled=${this.runningAlgorithm} id="clear-walls-btn">Clear</button>
                            <button ?disabled=${this.runningAlgorithm} id="reset-btn">Reset</button>
                        </div>
                        <!-- There is a bug with resizing after production build. Keep display:none here until that is fixed -->
                        <select style="display:none" ?disabled=${this.runningAlgorithm} id="size-select">                
                            <option value="20x30">Small</option>
                            <option value="30x40">Medium</option>
                            <option value="35x40">Large</option>
                            <option value="50x60">Very Large</option>                       
                        </select>
                    </div>
                    <div class="grid-container">
                        <pathfinder-grid rows=20 columns=30></pathfinder-grid>
                    </div>
                </div>
            </div>
        `
    }

    firstUpdated() {

        const shadow = this.shadowRoot;
        // save references to dom object for the grid and side panel
        this.grid = shadow.querySelector('pathfinder-grid');
        this.sidePanel = this.shadowRoot.querySelector("side-panel");
        // use the grids supported algorithm list directly as the options for the side panels algorithm select
        // the value of this select will be used as input to call the findPath function
        this.sidePanel.pathAlgorithms = Object.keys(this.grid.SUPPORTED_PATH_ALGORITHMS);
        this.sidePanel.mazeAlgorithms = Object.keys(this.grid.SUPPORTED_MAZE_ALGORITHMS);

        // get the buttons and selects
        const playPauseButton = shadow.querySelector("#play-pause-btn");
        const sizeSelect = shadow.querySelector("#size-select");
        const clearWallsBtn = shadow.querySelector("#clear-walls-btn");
        const resetButton = shadow.querySelector("#reset-btn");
        const speedSelect = shadow.querySelector("#speed-select");

        // listen for the pathfinder-grids custom events for the start and stop of an algorithm visualization
        // will use this event to set the runningAlgorithm property
        this.grid.addEventListener("algorithmStart", event => {
            this.runningAlgorithm = true;
            this.sidePanel.disabled = true;
        });
        this.grid.addEventListener("algorithmEnd", event => {
            this.runningAlgorithm = false;
            this.sidePanel.disabled = false;
            this.sidePanel.solutionLength = event.detail.solutionLength;
            this.sidePanel.cellsChecked = event.detail.cellsChecked;
            this.sidePanel.algorithmInfo = event.detail.algorithm;
        });

        // add event listener for when the diagonal search checkbox is changed
        this.sidePanel.addEventListener("diagonalSearchChanged", event => {
            const value = event.detail.newValue;
            // set the grids allowDiagonalSearch property based on the sidepanels checkbox state
            this.grid.allowDiagonalSearch = value;
        }); 

        // add event listener for when the maze generator is selected
        this.sidePanel.addEventListener("mazeAlgorithmChange", event => {
            const value = event.detail.value;
            this.grid.generateMaze(value);
        });

        // add buttons callbacks
        playPauseButton.addEventListener('click', event => {
            if (this.runningAlgorithm) {
                // TODO: Implement pause functionality
            } else {
                const algorithmName = this.sidePanel.selectedPathAlgorithm();
                this.grid.findPath(algorithmName);
            }            
        });

        sizeSelect.addEventListener('change', event => {
            const [row, column] = event.target.value.split('x');            
            this.grid.resizeGrid(parseInt(column), parseInt(row));
        });

        clearWallsBtn.addEventListener('click', event => {
            this.grid.clearBlocks();
            this.grid.clearPath();
        });
        
        resetButton.addEventListener('click', event => {
            this.grid.resetGrid();
            this.sidePanel.solutionLength = '';
            this.sidePanel.cellsChecked = '';
            this.sidePanel.algorithmInfo = '';
        });

        speedSelect.addEventListener('click', event => {
            const value = event.target.value;
            this.grid.speedLevel = value;
        });

    }
}

window.customElements.define('pathfinder-main', PathfinderMain);