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

// Stick a DOM element and BoundObject property together
BoundObject.prototype.stick = function (property, target) {
  let self = this

  if (this.debug) {
    console.debug('stick()', property, target)
  }

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

  // so we can lookup targets by property
  self._bindings = self._bindings || {}
  self._bindings[property] = target

  // so we can lookup observers by property
  self._observers = self._observers || {}
  self._observers[property] = observer

  // push property value to node or vice-versa
  if (self.hasOwnProperty(property)) {
    self.set(property, self[property])
  } else {
    self[property] = target.textContent
  }

  return self
}

// remove the binding and disconnect the observer
BoundObject.prototype.unstick = function (property) {
  let observer
  let propertiesToRemove = []
  let propertiesLength

  // if property was passed, remove it
  // otherwise, remove all bindings
  if (property !== undefined) {
    propertiesToRemove.push(property)
  } else {
    propertiesToRemove = Object.keys(this._bindings)
  }

  propertiesLength = propertiesToRemove.length

  for (let i = 0; i < propertiesLength; i++) {
    property = propertiesToRemove[i]

    if (this._bindings.hasOwnProperty(property)) {
      delete this._bindings[property]
    }

    if (this._observers.hasOwnProperty(property)) {
      observer = this._observers[property]

      // handle the queue before disconnecting
      this.handleMutations(observer.takeRecords(), property, this)

      observer.disconnect()
      delete this._observers[property]
    }
  }
}

// set the BoundObject property, updating the bound node
BoundObject.prototype.set = function (property, text) {
  let target

  if (this._bindings.hasOwnProperty(property)) {
    target = this._bindings[property]
  }

  if (target !== undefined) {
    target.textContent = text
  } else if (this.debug) {
    console.debug('No target!', this._bindings, this._bindings.hasOwnProperty(property), Object.keys(this._bindings))
  }

  this[property] = text

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
  let target = this._bindings[property]
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
