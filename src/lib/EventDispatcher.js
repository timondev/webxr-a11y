/**
 * @private
 * @class EventDispatcher
 */
class EventDispatcher {
  constructor () {
    this._listeners = {}
    this.stats = {
      fired: 0,
      handled: 0
    }
  }

  /**
   * Add an event listener
   * @param {String} eventName Name of the event to listen
   * @param {Function} listener Callback to trigger when the event is fired
   */
  addEventListener (eventName, listener) {
    const listeners = this._listeners
    if (listeners[eventName] === undefined) {
      listeners[eventName] = []
    }

    if (listeners[eventName].indexOf(listener) === -1) {
      listeners[eventName].push(listener)
    }
  }

  /**
   * Check if an event listener is already added to the list of listeners
   * @param {String} eventName Name of the event to check
   * @param {Function} listener Callback for the specified event
   */
  hasEventListener (eventName, listener) {
    return (
      this._listeners[eventName] !== undefined &&
      this._listeners[eventName].indexOf(listener) !== -1
    )
  }

  /**
   * Remove an event listener
   * @param {String} eventName Name of the event to remove
   * @param {Function} listener Callback for the specified event
   */
  removeEventListener (eventName, listener) {
    const listenerArray = this._listeners[eventName]
    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener)
      if (index !== -1) {
        listenerArray.splice(index, 1)
      }
    }
  }

  /**
   * Dispatch an event
   * @param {String} eventName Name of the event to dispatch
   * @param {Data} data to eit
   */
  dispatchEvent (eventName, data) {
    this.stats.fired++

    const listenerArray = this._listeners[eventName]
    if (listenerArray !== undefined) {
      const array = listenerArray.slice(0)

      for (let i = 0; i < array.length; i++) {
        array[i].call(this, data)
      }
    }
  }

  /**
   * Reset stats counters
   */
  resetCounters () {
    this.stats.fired = this.stats.handled = 0
  }
}

export { EventDispatcher }
