/*!
 * Bound Object - 2 way binding concept
 * Adrian unger, http://staydecent.ca
 * MIT Licensed
 *
 * http://github.com/staydecent/boundobject.js
*/

(function(window, MicroEvent) {
  "use strict";

  // shim shim shim
  window.MutationObserver = (function(){
    return  window.MutationObserver       ||
            window.webkitMutationObserver ||
            undefined;
  })();

  // initialize any bindings
  var BoundObject = function(bindings, debug) {
    var self = this,
        properties = Object.keys(bindings),
        propertiesLength = properties.length,
        property;

    if (debug !== undefined) {
      this.debug = true;
    } else if (!this.hasOwnProperty('debug') || this.debug !== true) {
      this.debug = false;
    } 

    // sync changes to object property
    this.bind('change', function(property, text) {
      if (self.debug) {
        console.debug('on:change', property, text);
      }

      self[property] = text;
    });
    
    // stick any bindings
    for (var i = 0; i < propertiesLength; i++) {
      property = properties[i];
      this.stick(property, bindings[property]);
    }
  };

  // accepts an array of MutationRecords
  // see: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#MutationRecord
  BoundObject.prototype.handleMutations = function(mutations, property, self) {
    mutations.forEach(function(mutation) {
      var oldValue = mutation.removedNodes[0].data,
          newValue = mutation.addedNodes[0].data;

      if (oldValue !== newValue) {
        self.trigger('change', property, mutation.addedNodes[0].data);
      }
    });
  };
  
  // Stick a DOM element and BoundObject property together
  BoundObject.prototype.stick = function(property, target) {
    var self = this;

    if (this.debug) {
      console.debug('stick()', property, target);
    }
    
    // create an observer instance
    var observer = new MutationObserver(function(mutations) { 
      self.handleMutations(mutations, property, self); 
    });
 
    // start observing the target node
    observer.observe(target, {
      attributes: false,
      characterData: true, // needed
      childList: true,     // children, includes text
      subtree: false,      // descendants
    });
    
    // so we can lookup targets by property
    self._bindings = self._bindings || {};
    self._bindings[property] = target;
    
    // so we can lookup observers by property
    self._observers = self._observers || {};
    self._observers[property] = observer;

    // push property value to node or vice-versa
    if (self.hasOwnProperty(property)) {
      self.set(property, self[property]);
    } else {
      self[property] = target.textContent;
    }
    
    return self;
  };

  // remove the binding and disconnect the observer
  BoundObject.prototype.unstick = function(property) {
    var observer,
        propertiesToRemove = [],
        propertiesLength;

    // if property was passed, remove it
    // otherwise, remove all bindings
    if (property !== undefined) {
      propertiesToRemove.push(property);
    } else {
      propertiesToRemove = Object.keys(this._bindings);
    }
      
    propertiesLength = propertiesToRemove.length;
      
    for (var i = 0; i < propertiesLength; i++) {
      property = propertiesToRemove[i];
      
      if (this._bindings.hasOwnProperty(property)) {
        delete this._bindings[property];
      }
      
      if (this._observers.hasOwnProperty(property)) {
        observer = this._observers[property];
        
        // handle the queue before disconnecting
        this.handleMutations(observer.takeRecords(), property, this);

        observer.disconnect();
        delete this._observers[property];
      }
    }
  };

  // set the BoundObject property, updating the bound node
  BoundObject.prototype.set = function(property, text) {
    var target;

    if (this._bindings.hasOwnProperty(property)) {
      target = this._bindings[property];
    }
    
    if (target !== undefined) {
      target.textContent = text;
    } else if (this.debug) {
      console.debug('No target!', this._bindings, this._bindings.hasOwnProperty(property), Object.keys(this._bindings));
    }
    
    this[property] = text;
    
    return text;
  };

  // for consistency
  BoundObject.prototype.get = function(property) {
    return this[property];
  };

  // how do we know our events have fired?
  BoundObject.prototype.hasFired = function(property) {
    var self = this;
    var observer = this._observers[property];
    var target = this._bindings[property];
    var records = observer.takeRecords();
    var recLen = records.length;
    var fired = true;

    for (var i = 0; i < recLen; i++) {
      var rec = records[i];
      if (rec.target === target) {
        fired = false;
      }
    }

    // none of the mutationRecords matched our target!
    // but we need to return records to the queue first.
    self.handleMutations(records, property, self); 

    return fired;
  };

  MicroEvent.mixin(BoundObject);
  window.BoundObject = BoundObject;

})(window, MicroEvent);


// observe this!
// -------------

// myModel.unstick(); // will unset all bindings, 'fun' in this case
// myModel.set('fun', 'dom will not see this');