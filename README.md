# BoundObject.js

Two way binding of Object properties and DOM nodes. `BoundObject.someProperty` changes? So does the associated nodes `textContent`. A target node's `textContent` changes? So does the associated Object property.

Currently only supports `textContent` changes on the node. Attributues should be possible. As well as working with templates.

## Example

```js
var target = document.querySelector('#fun');
var myModel = new BoundObject({
  'fun': target
});

// Will set bound node's textContent as well
myModel.set('fun', 'Hello');


// Will set node's textContent on bound property
target.textContent = 'World!';

// stick other properties
var testTarget = document.querySelector('#test');
myModel.test = 'neato';

// value of `myModel.test` will be pushed to `testTarget` node
myModel.stick('test', testTarget);
```

To get a better idea of how it works, read through `tests/boundobject.spec.js`. Run the test with `npm test`.


## Why?

At [Ecquire](http://ecquire.com) we use [MutationObserver's](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver?redirectlocale=en-US&redirectslug=DOM%2FMutationObserver) in place of `setInterval` to check when/where we should inject our HTML.

It's a cool API and seemed like an appropriate solution to binding JavaScript Object properties to DOM nodes.


## Note

This has not been used in any production code and is more of a concept at this point. Ideas and contributions are more than welcome.
