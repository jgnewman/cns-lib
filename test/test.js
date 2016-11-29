var assert = require('assert');
var CNS_ = require('../index');

describe('Cream & Sugar Library', function () {

  it('should handle conditions', function () {
    assert.equal(CNS_.qualify(true, function(){ return 1 }), 1);
    assert.equal(CNS_.qualify(false, function(){ return 1 }), undefined);
    assert.equal(CNS_.qualify(true, function(){ return 1 }, function(){ return 2 }), 1);
    assert.equal(CNS_.qualify(false, function(){ return 1 }, function(){ return 2 }), 2);
  });

  it('should handle equality testing', function () {
    assert.equal(CNS_.eql('0', 0), false);
    assert.equal(CNS_.eql(NaN, NaN), true);
    assert.equal(CNS_.eql(0, function () {}), false);
    assert.equal(CNS_.eql({a: [1, 2, {e: 'f'}], b: {c: 'd'}}, {a: [1, 2, {e: 'f'}], b: {c: 'd'}}), true);
  });

  it('should pattern match against identifiers', function () {
    assert.equal(CNS_.match([1],    [['Identifier', 'x']]), true);
    assert.equal(CNS_.match([1, 2], [['Identifier', 'x']]), false);
  });

  it('should pattern match against special values', function () {
    assert.equal(CNS_.match([true],  [['Special', 'true']]), true);
    assert.equal(CNS_.match([false], [['Special', 'true']]), false);
    assert.equal(CNS_.match([NaN],   [['Special', 'NaN']]), true);
  });

  it('should pattern match against numbers', function () {
    assert.equal(CNS_.match([1, 2], [['Number', '1'], ['Number', '2']]), true);
  });

  it('should pattern match against arrays', function () {
    assert.equal(CNS_.match([[1, 2]], [['Arr', [1, 2]]]), true);
    assert.equal(CNS_.match([[1, 2]], [['Arr', [1, 'x']]]), true);
    assert.equal(CNS_.match([[1, 2]], [['Arr', [1]]]), false);
    assert.equal(CNS_.match([[NaN]],  [['Arr', ['NaN']]]), true);
    assert.equal(CNS_.match([[300]],  [['Arr', ['NaN']]]), false);
  });

  it('should pattern match against tuples', function () {
    assert.equal(CNS_.match([CNS_.tuple([1, 2])], [['Tuple', [1, 'x']]]), true);
    assert.equal(CNS_.match([CNS_.tuple([1, 2])], [['Tuple', [1]]]), false);
    assert.equal(CNS_.match([[1, 2]], [['Tuple', [1, 'x']]]), false);
  });

  it('should pattern match against HeadTails and LeadLasts', function () {
    assert.equal(CNS_.match([[1, 2]], [['HeadTail', ['a', 'b']]]), true);
    assert.equal(CNS_.match([1, 2],   [['HeadTail', ['a', 'b']]]), false);
    assert.equal(CNS_.match([[1, 2]], [['LeadLast', ['a', 'b']]]), true);
    assert.equal(CNS_.match([1, 2],   [['LeadLast', ['a', 'b']]]), false);
  });

  it('should pattern match against keys', function () {
    assert.equal(CNS_.match([{x:1,y:2}], [['Keys', ['x', 'y']]]), true);
  });

  it('should pattern match against objects', function () {
    assert.equal(CNS_.match([{x:1,y:2}], [['Obj', ['x:1', 'y:2']]]), true);
    assert.equal(CNS_.match([{x:1,y:2}], [['Obj', ['x:1']]]), true);
    assert.equal(CNS_.match([{x:1}], [['Obj', ['x:1', 'y:a']]]), true);
    assert.equal(CNS_.match([{x:1}], [['Obj', ['x:y']]]), true);
    assert.equal(CNS_.match([{[Symbol.for('FOO')]:1}], [['Obj', ['Symbol.for("FOO"):1']]]), true);
    assert.equal(CNS_.match([{x:Symbol.for('FOO')}], [['Obj', ['x:Symbol.for("FOO")']]]), true);
  });

  it('should convert arguments to arrays', function () {
    const args = (function (x, y) { return arguments }(1, 2));
    assert.deepEqual(CNS_.args(args), [1, 2]);
    assert.equal(Array.isArray(CNS_.args(args)), true);
  });

  it('should retrieve elements from collections', function () {
    assert.equal(CNS_.get(2, ['a', 'b', 'c']), 'c');
    assert.equal(CNS_.get('foo', {foo: 'bar', baz: 'quux'}), 'bar');
    assert.equal(CNS_.get(0, CNS_.tuple([1, 2, 3])), 1);
  });

  it('should instantiate classes', function () {
    function Foo (name) { this.name = name }
    const foo = CNS_.create(Foo, 'John');
    assert.equal(foo.constructor, Foo);
    assert.equal(foo.name, 'John');
  });

  it('should intelligently assess types', function () {
    assert.equal(CNS_.dataType('foo'), 'string');
    assert.equal(CNS_.dataType(0), 'number');
    assert.equal(CNS_.dataType(NaN), 'nan');
    assert.equal(CNS_.dataType(function () {}), 'function');
    assert.equal(CNS_.dataType([]), 'array');
    assert.equal(CNS_.dataType({}), 'object');
    assert.equal(CNS_.dataType(/a/), 'regexp');
    assert.equal(CNS_.dataType(new Date()), 'date');
    assert.equal(CNS_.dataType(null), 'null');
    assert.equal(CNS_.dataType(CNS_.tuple([0])), 'tuple');
  });

  it('should correctly abstract instanceof', function () {
    assert.equal(CNS_.instanceof({}, Object), true);
  });

  it('should retrieve the head of a list', function () {
    assert.equal(CNS_.head([1, 2, 3]), 1);
  });

  it('should retrieve the tail of a list', function () {
    assert.deepEqual(CNS_.tail([1, 2, 3]), [2, 3]);
  });

  it('should retrieve the lead of a list', function () {
    assert.deepEqual(CNS_.lead([1, 2, 3]), [1, 2]);
  });

  it('should retrieve the last of a list', function () {
    assert.equal(CNS_.last([1, 2, 3]), 3);
  });

  it('should choose a random number from a list', function () {
    const choice = CNS_.random([1, 2, 3, 4]);
    assert.equal(typeof choice, 'number');
    assert.equal(choice, parseInt(choice));
    assert.ok(choice < 5 && choice > 0);
  });

  it('should execute a function', function () {
    assert.equal(CNS_.apply(function () { return 1 }), 1);
  });

  it('should update a collection to a new collection', function () {
    assert.deepEqual(CNS_.update(1, 4, [1, 2, 3]), [1, 4, 3]);
    assert.deepEqual(CNS_.update('foo', 'baz', {foo: 'bar'}), {foo: 'baz'});
  });

  it('should update update the existing function when updating a function', function () {
    function foo() {}
    assert.equal(CNS_.update('foo', 'bar', foo), foo);
  });

  it('should remove an item from a collection', function () {
    assert.deepEqual(CNS_.remove(1, [1, 2, 3]), [1, 3]);
    assert.deepEqual(CNS_.remove('foo', {foo: 'bar', baz: 'quux'}), {baz: 'quux'});
  });

  it('should guard against bad arities', function () {
    const fn = CNS_.aritize(function () {}, 2);
    assert.doesNotThrow(function () { fn(1, 2) });
    assert.throws(function () { fn() });
    assert.throws(function () { fn(1) });
    assert.throws(function () { fn(1, 2, 3) });
  });

  it('should convert tuples to objects', function () {
    assert.deepEqual(CNS_.tupleToObject(CNS_.tuple(['a', 'b'])), {0: 'a', 1: 'b'});
    assert.throws(function () { CNS_.tupleToObject(['a', 'b']) });
    assert.deepEqual(CNS_.tupleToObject(CNS_.tuple(['a', 'b']), function (item) { return item }), {a: 'a', b: 'b'});
  });

  it('should convert tuples to arrays', function () {
    const converted = CNS_.tupleToArray(CNS_.tuple(['a', 'b']));
    assert.deepEqual(converted, ['a', 'b']);
    assert.equal(converted.CNS_isTuple_, undefined);
    assert.throws(function () { CNS_.tupleToArray(['a', 'b']) });
  });

  it('should convert arrays to tuples', function () {
    const converted = CNS_.arrayToTuple(['a', 'b']);
    assert.deepEqual(converted, CNS_.tuple(['a', 'b']));
    assert.equal(converted.CNS_isTuple_, CNS_);
    assert.throws(function () { CNS_.arrayToTuple(CNS_.tuple(['a', 'b'])) });
  });

  it('should throw an error when told to die', function () {
    assert.throws(function () { CNS_.die('Foo') });
  });

  it('should create a range', function () {
    const range = CNS_.range(1, 10);
    assert.equal(range.length, 10);
  });

  it('should shortcut functions on the console object', function () {
    assert.doesNotThrow(function () { CNS_.log('') });
    assert.doesNotThrow(function () { CNS_.warn('') });
    assert.doesNotThrow(function () { CNS_.debug('') });
  });

  it('should set config options', function () {
    CNS_.lang('foo.bar', 'baz');
    assert.equal(CNS_.config.foo.bar, 'baz');
  });

  it('should retrieve config options', function () {
    assert.equal(CNS_.getConfig('use.react'), true);
  });

  it('should bind and lazify values', function () {
    const context = {};
    assert.equal(CNS_.lazify(context, this)(), context);
    assert.equal(CNS_.lazify(function () { return this }, context)(), context);
  });

  it('should dangerously mutate objects', function () {
    const mutable = {foo: 'bar'};
    const mutated = CNS_.dangerouslyMutate('foo', 'baz', mutable);
    assert.equal(mutated, mutable);
    assert.equal(mutated.foo, 'baz');
  });

  it('should create caching functions', function () {
    const fn = CNS_.cache(function (x) { return x });
    assert.equal(fn(4), 4);
    assert.equal(fn(6), 4);
  });

  it('should decache cached functions', function () {
    const fn = CNS_.cache(function (x) { return x });
    fn(4);
    CNS_.decache(fn);
    assert.equal(fn(6), 6);
  });

});
