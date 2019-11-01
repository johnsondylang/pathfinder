//import {LitElement, html, css} from 'https://unpkg.com/@polymer/lit-element/lit-element.js?module';
import {LitElement, html, css} from 'lit-element';


class GridCell extends LitElement {

    static get properties() {
        return {
            row: {type: Number},
            column: {type: Number},
            checked: {type: Boolean, reflect:true},            
            blocked: {type: Boolean, reflect:true},
            start: {type: Boolean, reflect:true},
            end: {type: Boolean, reflect:true},
            inShortestPath: {type: Boolean, reflect:true}
        }
    }

    constructor() {
        super();
        this.row = 0;
        this.column = 0;
        this.checked = false;
        this.blocked = false;
        this.start = false;
        this.end = false;
        this.inShortestPath = false;
    }

    static get styles() {
        return [
            css`        
                @keyframes block {
                    0% {
                        transform: scale(1.3);                        
                    }
                    75% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1.0);   
                    }
                }         
                @keyframes check {
                    0% {
                        background: #2A7B9B;
                        transform: scale(1.3);  
                    }
                    50% {
                        background: #2A7B9B;
                        transform: scale(1.1);
                    }
                    100% {
                        opacity:.8;                     
                    }
                }     
                @keyframes path {
                    0% {
                        transform: scale(.1);  
                        background: #D0FF14;
                        border-radius: 10px;
                    }
                    50% {
                        transform: scale(1.5);
                        background: #D0FF14;
                        border-radius: 5px;
                    }                   
                }              
                div {
                    background: white;
                    font-size: 30px;
                    text-align: center;
                    height:100%;
                    width:100%;              
                }                   
                div[checked] {
                    animation-name: check;
                    animation-duration: 0.5s; 
                    animation-timing-function: ease-out; 
                    animation-delay: 0s;
                    animation-direction: alternate;
                    animation-iteration-count: 1;
                    animation-fill-mode: none;
                    animation-play-state: running;                     
                    background: #28A7E8;
                    opacity:.6
                }    
                div[inShortestPath] {   
                    opacity:1;
                    animation-name: path;
                    animation-duration: 0.75s; 
                    animation-timing-function: ease-out; 
                    animation-delay: 0s;
                    animation-direction: alternate;
                    animation-iteration-count: 1;
                    animation-fill-mode: none;
                    animation-play-state: running;                     
                    background: #FFFF31;                    
                }   
                div[blocked] {
                    opacity:1;
                    animation-name: block;
                    animation-duration: 0.01s; 
                    animation-timing-function: ease-out; 
                    animation-delay: 0s;
                    animation-direction: alternate;
                    animation-iteration-count: 1;
                    animation-fill-mode: none;
                    animation-play-state: running; 
                    background-color:gray;
                }                 
                div[start] {
                    opacity:1;
                    background: #75FF33;
                }                                   
                div[end] {
                    opacity:1;
                    background: #FF5733;
                }                                              
            `
        ]
    }

    render() {
        return html`
            <div 
                ?checked=${this.checked} 
                ?blocked=${this.blocked} 
                ?start=${this.start}
                ?inShortestPath=${this.inShortestPath} 
                ?end=${this.end}
            >            
            </div>`
    } 

    firstUpdated() {
       
        this.addEventListener('mousedown', event => {
            this._dispachCustomEvent(event, 'cell-mousedown');
        });

        //
        this.addEventListener('mouseover', event => {
            // only fires the event if the mouse button is pressed
            if (event.buttons === 1) {
                this._dispachCustomEvent(event, 'cell-mouseover');
            }            
        });
    }

    /**
     * Implement this to allow for other elements to call await performUpdate on cell for better rendering of path search
     */
    async performUpdate() {
        await new Promise((resolve) => requestAnimationFrame(() => resolve()));
        super.performUpdate();
    }

    /**
     * Resets the cell to the defaults
     */
    resetDefaults() {
        this.checked = false;
        this.blocked = false;
        this.start = false;
        this.inShortestPath = false;
        this.end = false;
    }

    //
    _dispachCustomEvent(event, customEventName) {
        // do not want the default functionality
        event.preventDefault();
        
        // stop mousedown event from progigating to stop from triggering other custom events
        event.stopPropagation();

        // custom event to handle 
        const e = new CustomEvent(customEventName, {            
            detail: {
                element:this,
            },
            bubbles: true, 
            composed: true 
        });

        // dispatch the custom event to parent element (the datatable)
        this.dispatchEvent(e);
    }
    
}


window.customElements.define("grid-cell", GridCell);