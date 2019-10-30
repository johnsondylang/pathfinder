
/**
 * Minimal implementatin of a PriorityQueue
 */
export class PriorityQueue {
    constructor() {
        this.items = [];
    }

    /**
     * gets the number of items in the queue
     * @returns {Number}
     */
    get length() {
        return this.items.length;
    }

    /**
     * Adds item into the queue at the given priority
     * @param {Object} item - object to be placed in the queue
     * @param {Number} priority - priority level for the item to be placed in queue
     */
    enqueue(item, priority) {

        const queueItem = {
            item: item,
            priority: priority
        }

        for (const [index, value] of this.items.entries()) {
            if (priority < value.priority) {                
                this.items.splice(index, 0, queueItem);
                return
            }
        }

        this.items.push(queueItem);
    }

    /**
     * Removes the items with the highest priority from the queue
     */
    dequeueHigh() {
        return this.items.pop();
    } 

    /**
     * Remove the iems with the lowest priority from the queue
     */
    dequeueLow() {
        return this.items.shift();
    }


}