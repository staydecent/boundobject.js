/* globals describe it expect __html__ */

describe('BoundObject', function () {
  let BoundObject = window.BoundObject
  let myModel

  // for sanity

  it('should expose the templates to __html__', function () {
    document.body.innerHTML = __html__['tests/helper.html']
    expect(document.getElementById('fun')).toBeDefined()
  })

  // actual tests

  it('should initialize with bindings', function () {
    const target = document.querySelector('#fun')
    myModel = new BoundObject({
      'fun': target
    }, true)

    expect(target.textContent).toBe('Initialized?')
  })

  it('should stick property value to node', function () {
    const target = document.querySelector('#test')
    myModel.test = 'neato'
    myModel.stick('test', target)
    expect(target.textContent).toBe('neato')
  })

  it('should match property when node changes', function (done) {
    const target = document.querySelector('#test')

    target.textContent = '2 way binding,'

    const intId = setInterval(() => {
      if (myModel.hasFired('test')) {
        expect(myModel.test).toBe('2 way binding,')
        clearInterval(intId)
        done()
      }
    }, 100)
  })

  it('should set property value on node', function () {
    const target = document.querySelector('#fun')
    myModel.set('fun', 'for everyone!')
    expect(target.textContent).toBe('for everyone!')
  })

  it('should not match property on node change', function () {
    const target = document.querySelector('#test')
    myModel.unstick('test', target)
    target.textContent = 'myModel will not see this.'
    expect(myModel.get('test')).not.toEqual('myModel will not see this.')
  })

  it('should not set property value on node', function () {
    const target = document.querySelector('#fun')
    myModel.unstick('fun') // will unset all bindings, 'fun' in this case
    myModel.set('fun', 'dom will not see this')
    expect(target.textContent).not.toEqual('dom will not see this')
  })
})
