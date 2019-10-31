import {LitElement, html, css} from 'https://unpkg.com/@polymer/lit-element/lit-element.js?module';


class SidePanel extends LitElement {

    static get properties() {
        return {            
            algorithms: {type: Array },    
            collapsed: {type: Boolean},
            cellsChecked: {type: Number},
            solutionLength: {type: Number},
            algorithmInfo: {type: String},
            diagonalSearch: {type: Boolean},
            disabled: {type: Boolean}
        }
    }

    constructor() {
        super();
        this.algorithms = [];
        this.collapsed = false;
        this.diagonalSearch = false;
        this.disabled = false;
    }

    static get styles() {
        return [
            css`
                .side-panel {
                    display: flex;
                    flex-direction: column;
                    background: #F8F9FA;
                    width:225px;
                    height: 100%;
                    padding-top: 10px;
                }
                .side-panel[collapsed] {
                    width: 45px;
                }                 
                
                #open-close-btn-container {
                    display: flex;
                    justify-content:center;
                    width: -webkit-fill-available;
                    height: 45px;
                }

                #open-btn {
                    display: none;
                }
                #open-btn[collapsed] {
                    display: block;
                }
                #open-btn:hover {
                    cursor: pointer;
                }

                #close-btn {
                    margin-left: auto;
                    margin-right: 10px;
                    opacity: .1;
                }
                #close-btn:hover {
                    opacity: 1;
                    cursor: pointer;
                }
                #close-btn[collapsed] {
                    display:none;
                }

                .control-btn {
                    display: flex;
                    flex-direction: column;
                    margin:10px;
                }
                .control-btn[collapsed] {
                    display: none;
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
                    border-color: rgb(40, 167, 232)
                }     
                select:disabled {
                    cursor: unset;
                    opacity: .2;
                }         
                label {
                    font-weight: 400;
                    color: #6c757d;
                }
                .run-stats-container {
                    height: 200px;
                    margin: 10px;
                }
                .run-stats-container[collapsed] {
                    display: none;
                }
                #run-stats {
                    border: 1px solid #6c757d;;
                    height:100%;
                    border-radius: .2rem;
                    background: white;
                    color: #6c757d;
                    font-weight: 400;
                    padding: 10px;                    
                }
                #run-stats div {
                    display: inline-block;
                    margin-bottom: 10px;                    
                }
                #run-stats .stat-values {
                    display: inline-block;
                    color: #28A7E8;
                }
            `
        ]
    }

    render() {
        return html`
            <link href="node_modules/@fortawesome/fontawesome-free/css/all.css" rel="stylesheet">
            <div ?collapsed=${this.collapsed} class="side-panel">                
                
                <div id="open-close-btn-container">
                    <a ?collapsed=${this.collapsed} id="open-btn">
                        <i class="fas fa-bars"></i>
                    </a>
                    <a ?collapsed=${this.collapsed} id="close-btn">
                        <i class="far fa-times-circle"></i>
                    </a>
                </div>

                <div ?collapsed=${this.collapsed} class="control-btn">
                    <label>Algorithm: </label>
                    <select id="algorithm-select" ?disabled=${this.disabled}>                
                        ${this.algorithms.map(item => {
                            return html`<option value=${item}>${item}</option>`
                        })}                                                                      
                    </select>
                </div>
                <div ?collapsed=${this.collapsed} class="control-btn">
                    <div>
                        <input id="diagonal-search-checkbox" type="checkbox" ?disabled=${this.disabled} .checked=${this.diagonalSearch}>
                        <label>Diagonal Search</label>
                    </div>
                </div>
                <div ?collapsed=${this.collapsed} class="control-btn">
                    <label>Maze Generator: </label>
                    <select id="algorithm" ?disabled=${this.disabled}>                
                        <option>Coming Soon!</option>                                            
                    </select>
                </div>
                
                <div ?collapsed=${this.collapsed} class="run-stats-container">
                    <label>Run Stats:</label>
                    <div id="run-stats">
                        <div>Optimal Solution: <div class="stat-values"></div></div>
                        <div>Solution Length: <div class="stat-values">${this.solutionLength ? this.solutionLength : ''}</div> </div>                        
                        <div>Cells Checked: <div class="stat-values">${this.cellsChecked ? this.cellsChecked : ''}</div></div>
                        <div>Algorithm Info: <div class="stat-values">${this.algorithmInfo ? this.algorithmInfo : ''}</div></div>
                    </div>
                </div>

            </div>
        `
    }

    connectedCallback() {
        super.connectedCallback();
        this._applyMediaQuery();
    }

    firstUpdated() {
        window.addEventListener('resize', this._applyMediaQuery.bind(this));

        const openButton = this.shadowRoot.querySelector("#open-btn");
        const closeButton = this.shadowRoot.querySelector("#close-btn");
        const diagonalSearchCheckbox = this.shadowRoot.querySelector("#diagonal-search-checkbox");


        openButton.addEventListener("click", event => {
            this.collapsed = false;
        });

        closeButton.addEventListener("click", event => {
            this.collapsed = true;
        });

        diagonalSearchCheckbox.addEventListener("click", event => {

            const e = new CustomEvent("diagonalSearchChanged", {            
                detail: {
                    newValue: !this.diagonalSearch,
                    oldValue: this.diagonalSearch
                },
                bubbles: true, 
                composed: true 
            });
            this.diagonalSearch = !this.diagonalSearch;
            this.dispatchEvent(e);
        });

    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('resize', this._applyMediaQuery);
    }

    selectedAlgorithm() {
        const algorithmSelect = this.shadowRoot.querySelector("#algorithm-select");
        return algorithmSelect.value;
    }

    _applyMediaQuery() {
        if (window.matchMedia('(max-width:750px)').matches) {
            this.collapsed = true;
        } else {
            this.collapsed = false;
        }
    }

}

window.customElements.define('side-panel', SidePanel);