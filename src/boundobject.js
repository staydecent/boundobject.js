'use strict'

// shim shim shim
window.MutationObserver = (() =>
  window.MutationObserver || window.webkitMutationObserver || undefined
)()

window.BoundObject = BoundObject

// initialize any bindings
function BoundObject (bindings, debug) {
  let properties = Object.keys(bindings)
  let propertiesLength = properties.length
  let property

  if (debug !== undefined) {
    this.debug = true
  } else if (!this.hasOwnProperty('debug') || this.debug !== true) {
    this.debug = false
  }

  // stick any bindings
  for (let i = 0; i < propertiesLength; i++) {
    property = properties[i]
    this.stick(property, bindings[property])
  }
}

// accepts an array of MutationRecords
// see: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#MutationRecord
BoundObject.prototype.handleMutations = function (mutations, property, self) {
  mutations.forEach(function (mutation) {
    if (!mutation.removedNodes || !mutation.removedNodes.length) return
    if (!mutation.addedNodes || !mutation.addedNodes.length) return

    let oldValue = mutation.removedNodes[0].data
    let newValue = mutation.addedNodes[0].data

    if (oldValue !== newValue) {
      if (self.debug) {
        console.debug('handleMutations()', property, self[property], mutation.addedNodes[0].data)
      }
      self[property] = mutation.addedNodes[0].data
    }
  })
}

// handle change events for form controls
BoundObject.prototype.handleChange = function (ev, property, target, self) {
  self.debug && console.debug('handleChange', self[property], target.value)
  self.set(property, target.value)
}

// Stick a DOM element and BoundObject property together
BoundObject.prototype.stick = function (property, target, attr = 'textContent') {
  let self = this

  self.debug && console.debug('stick()', property, target)

  self._bindings = self._bindings || {}
  self._bindings[property] = self._bindings[property] || []
  self._bindings[property].push([target, attr])

  // Bind event listener or create observer
  if (target.tagName === 'INPUT') {
    let listener = (ev) => self.handleChange(ev, property, target, self)
    target.addEventListener('change', listener, false)
    self._listeners = self._listeners || {}
    self._listeners[property] = self._listeners[property] || []
    self._listeners[property].push([target, listener])
  } else {
    // create an observer instance
    let observer = new window.MutationObserver(function (mutations) {
      self.handleMutations(mutations, property, self)
    })

    // start observing the target node
    observer.observe(target, {
      attributes: false,
      characterData: true,  // needed
      childList: true,      // children, includes text
      subtree: false        // descendants
    })

    self._observers = self._observers || {}
    self._observers[property] = observer
  }

  // push property value to node or vice-versa
  if (self.hasOwnProperty(property)) {
    self.set(property, self[property])
  } else {
    self[property] = target[attr]
  }

  return self
}

// remove the binding and disconnect the observer
BoundObject.prototype.unstick = function (property, targetToMatch, attrToMatch = 'textContent') {
  // Remove all, or target specific bindings of this property
  if (!targetToMatch) {
    this._bindings[property] = []

    if (this._listeners && this._listeners[property]) {
      this._listeners[property].forEach(([target, listener]) =>
        target.removeEventListener('change', listener)
      )
      this._listeners[property] = []
    }
  } else {
    const bindings = this._bindings[property]
    if (bindings && bindings.length) {
      for (var x = 0; x < bindings.length; x++) {
        let [target, attr] = bindings[x]

        if (target === targetToMatch && attr === attrToMatch) {
          this._bindings[property].splice(x, 1)
        }
      }
    }

    if (this._listeners) {
      const listeners = this._listeners[property]
      if (listeners && listeners.length) {
        for (var y = 0; y < listeners.length; y++) {
          let target = listeners[y][0]

          if (target === targetToMatch) {
            this._listeners[property].splice(y, 1)
          }
        }
      }
    }
  }

  // Remove observers of this property
  if (this._observers.hasOwnProperty(property)) {
    let observer = this._observers[property]

    // handle the queue before disconnecting
    this.handleMutations(observer.takeRecords(), property, this)

    observer.disconnect()
    observer = null

    delete this._observers[property]
  }
}

// set the BoundObject property, updating the bound node
BoundObject.prototype.set = function (property, text) {
  this[property] = text

  if (!this._bindings.hasOwnProperty(property)) {
    if (this.debug) {
      console.debug('No target!', this._bindings, this._bindings.hasOwnProperty(property), Object.keys(this._bindings))
    }
  } else {
    const bindings = this._bindings[property]
    for (var x = 0; x < bindings.length; x++) {
      let [target, attr] = bindings[x]
      target[attr] = text
    }
  }

  return text
}

// for consistency
BoundObject.prototype.get = function (property) {
  return this[property]
}

// how do we know our events have fired?
BoundObject.prototype.hasFired = function (property) {
  let self = this
  let observer = this._observers[property]
  let pair = this._bindings[property]
  let target = pair[0]
  let records = observer.takeRecords()
  let recLen = records.length
  let fired = true

  for (let i = 0; i < recLen; i++) {
    let rec = records[i]
    if (rec.target === target) {
      fired = false
    }
  }

  // none of the mutationRecords matched our target!
  // but we need to return records to the queue first.
  self.handleMutations(records, property, self)

  return fired
}
