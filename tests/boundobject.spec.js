
describe("BoundObject", function() {

  var BoundObject = window.BoundObject;
  var myModel;

  // for sanity
  
  it('should expose the templates to __html__', function() {
    document.body.innerHTML = __html__['tests/helper.html'];
    expect(document.getElementById('fun')).toBeDefined();
  });


  // actual tests

  it("should initialize with bindings", function() {
    runs(function() { 
      var target = document.querySelector('#fun');
      myModel = new BoundObject({
        'fun': target
      }, true);

      expect(target.textContent).toBe('Initialized?');
    });
  });

  it("should stick property value to node", function() {
    runs(function() {
      var target = document.querySelector('#test');
      myModel.test = 'neato';
      myModel.stick('test', target);
      expect(target.textContent).toBe('neato');
    });
  });

  it("should match property when node changes", function() {
    var target = document.querySelector('#test');
    var domFired = false;

    runs(function() {
      target.textContent = "2 way binding,";
    });

    waitsFor(function() {
      if (myModel.hasFired('test')) {
        return true;
      }
    });

    runs(function() {
      expect(myModel.test).toBe("2 way binding,");
    });
  });

  it("should set property value on node", function() {
    runs(function() {
      var target = document.querySelector('#fun');
      myModel.set('fun', 'for everyone!');
      expect(target.textContent).toBe('for everyone!');
    });
  });

  // it("should not match property on node change", function() {
  //   runs(function() {

  //   });
  // });

});