var assert   = require('assert'),
    Hawkejs  = require('../index.js'),
    Fn       = __Protoblast.Bound.Function,
    hawkejs,
    Test;

describe('Helper', function() {

	before(function() {
		hawkejs = new Hawkejs();
		hawkejs.addViewDirectory(__dirname + '/templates');
	});

	describe('inheritance', function() {
		it('registers new classes', function(done) {

			Test = Fn.inherits('Hawkejs.Helper', function Test(renderer) {
				Test.super.call(this, renderer);
			});

			Test.setMethod(function saySomething() {
				this.print('something');
			});

			setTimeout(function() {

				assert.strictEqual(Hawkejs.Helper.Test, Test);

				done();
			}, 4);
		});
	});

	describe('HelperCollection', function() {
		it('creates helper instances on the fly', function(done) {

			var renderer = new Hawkejs.Renderer(hawkejs);

			assert.strictEqual(renderer.helpers.Test.constructor, Test);
			done();
		});
	});

	describe('methods', function() {
		it('should allow the use of methods in templates', function(done) {

			var code = `<%= Test.saySomething() %>`;

			var compiled = hawkejs.compile('Test_test_1', code);

			hawkejs.render(compiled, {}, function rendered(err, res) {

				if (err) {
					throw err;
				}

				res = res.trim();

				assert.strictEqual(res, 'something');
				done();
			});

		});
	});
});