var assert   = require('assert'),
    Hawkejs  = require('../index.js'),
    hawkejs,
    test_id = 0;

describe('HTMLElement', function() {

	before(function() {
		hawkejs = new Hawkejs();
		hawkejs.addViewDirectory(__dirname + '/templates');
	});

	describe('#className', function() {
		it('gets the current class attribute', function() {
			var el = Hawkejs.Hawkejs.createElement('div');
			el.classList.add('a');
			el.classList.add('b');

			assert.strictEqual(el.outerHTML, '<div class="a b"></div>');
		});
	});

	describe('#id', function() {
		it('get/set the id of the element', function() {

			var el = Hawkejs.Hawkejs.createElement('div');

			el.id = 'test';

			assert.strictEqual(el.outerHTML, '<div id="test"></div>');
		});
	});

	describe('#name', function() {
		it('get/set the name of the element', function() {

			var el = Hawkejs.Hawkejs.createElement('div');

			el.name = 'test';

			assert.strictEqual(el.outerHTML, '<div name="test"></div>');
		});
	});

	describe('#tabIndex', function() {
		it('get/set the tabindex of the element', function() {

			var el = Hawkejs.Hawkejs.createElement('div');

			el.tabIndex = 1;

			assert.strictEqual(el.outerHTML, '<div tabindex="1"></div>');
		});
	});

	describe('#value', function() {
		it('gets/sets the value of the element, depending on the type', function() {

			var input = Hawkejs.Hawkejs.createElement('input'),
			    area = Hawkejs.Hawkejs.createElement('textarea'),
			    div = Hawkejs.Hawkejs.createElement('div');

			input.value = 'test';
			div.value = 'test';

			assert.strictEqual(input.value, 'test');
			assert.strictEqual(div.value, 'test');

			assert.strictEqual(area.value, '');
			area.innerHTML = 'html';
			assert.strictEqual(area.value, 'html');

			area.value = 'test';
			assert.strictEqual(area.value, 'test');

			// Setting a textarea's value breaks the link with the innerText
			assert.strictEqual(area.innerHTML, 'html');

			assert.strictEqual(input.outerHTML, '<input value="test">');
			assert.strictEqual(area.outerHTML, '<textarea>html</textarea>');
			assert.strictEqual(div.outerHTML, '<div></div>');
		});
	});

	describe('#style', function() {
		it('should set the style attribute', function() {

			var div = Hawkejs.Hawkejs.createElement('div', false);
			div.style.setProperty('display', 'none');

			assert.strictEqual(div.outerHTML, '<div style="display:none;"></div>');
		});
	});

	describe('#innerText', function() {
		it('gets/sets the innerText of an element', function() {

			var div = Hawkejs.Hawkejs.createElement('div');

			div.append('a');
			div.append(Hawkejs.Hawkejs.createElement('br'));
			div.append('@');
			div.append(Hawkejs.Hawkejs.createElement('br'));
			div.append('€');
			div.append(Hawkejs.Hawkejs.createElement('br'));

			assert.strictEqual(div.outerHTML, '<div>a<br>@<br>&#8364;<br></div>');
			assert.strictEqual(div.innerText, 'a\n@\n€\n');
		});
	});

	describe('#textContent', function() {
		it('gets/sets the textContent of an element', function() {

			var div = Hawkejs.Hawkejs.createElement('div');

			div.append('a');
			div.append(Hawkejs.Hawkejs.createElement('br'));
			div.append('@');
			div.append(Hawkejs.Hawkejs.createElement('br'));
			div.append('€');
			div.append(Hawkejs.Hawkejs.createElement('br'));

			assert.strictEqual(div.outerHTML, '<div>a<br>@<br>&#8364;<br></div>');
			assert.strictEqual(div.textContent, 'a@€');
		});
	});

	describe('#insertAdjacentHTML(position, html)', function() {
		it('should insert html at a specific position', function() {

			var div = Hawkejs.Hawkejs.createElement('div');

			div.append(Hawkejs.Hawkejs.createElement('br'));
			div.insertAdjacentHTML('afterBegin', '<i></i>');
			div.insertAdjacentHTML('beforeEnd', '<b></b>');

			assert.strictEqual(div.outerHTML, '<div><i></i><br><b></b></div>');
		});
	});

	describe('#hasAttribute(name)', function() {
		it('checks if the given attribute is present on the element', function() {

			var div = Hawkejs.Hawkejs.createElement('div');

			assert.strictEqual(div.hasAttribute('id'), false);
			div.id = 'test';
			assert.strictEqual(div.hasAttribute('id'), true);

			assert.strictEqual(div.outerHTML, '<div id="test"></div>');

			div.removeAttribute('id');
			assert.strictEqual(div.outerHTML, '<div></div>');
		});
	});

	describe('#dataset', function() {
		it('is an object with all the data attributes', function() {

			var div = Hawkejs.Hawkejs.createElement('div');

			assert.strictEqual(div.dataset.alpha, undefined);
			div.dataset.alpha = '1';
			assert.strictEqual(div.dataset.alpha, '1');

			assert.strictEqual(div.hasAttribute('data-alpha'), true);
			assert.strictEqual(div.getAttribute('data-alpha'), '1');

			assert.strictEqual(div.outerHTML, '<div data-alpha="1"></div>');

			div.removeAttribute('data-alpha');
			assert.strictEqual(div.dataset.alpha, undefined);

			assert.strictEqual(div.outerHTML, '<div></div>');

			// Setting to undefined results in an "undefined" string
			div.dataset.alpha = undefined;
			assert.strictEqual(div.dataset.alpha, 'undefined');
		});
	});

	describe('#outerHTML', function() {
		it('should prevent catastrophic recursive serialization', function(done) {
			let renderer = hawkejs.render('nested_test', function doneTest(err, result) {

				if (err) {
					throw err;
				}

				result = result.replace(/[\n\t]/g, '');

				assert.strictEqual(renderer.last._render_count, 1, 'The HTML elements were serialized more than expected!');
				assert.strictEqual(result, `<div class="a"><div class="b"><div class="c"><div class="d"><div class="e"><div class="f"><div class="g"><div class="h"><div class="i"><div class="j"><div class="k"><div class="l"><div class="m"><div class="n"><div class="o"><div class="p"><div class="q"><div class="r"><div class="s"><div class="t"><div class="u"></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div>`);
				done();
			});
		});

		it('should correctly render style contents', function(done) {
			let renderer = hawkejs.render('404', function doneTest(err, result) {

				if (err) {
					throw err;
				}

				assert.strictEqual(result, "<style type=\"text/css\">\nbody {\n\tfont-family: sans-serif;\n\tfont-size: 15px;\n\tfont-weight: normal;\n\tmargin: 0;\n\tcolor: #4C4C4C;\n\tbackground-color: #EDEDED;\n}\ndiv {\n\twidth: 100vw;\n}\nh1 {\n\ttext-align: center;\n\tpadding-top: 50vh;\n}\np {\n\ttext-align: center;\n}\n</style>\n<div>\n\t<h1>404: Not found</h1>\n\t<p></p>\n</div>");
				done();
			});
		});

		it('should correctly serialize Hawkejs.RESULT entries', function(done) {
			var HtmlResolver = function HtmlResolver(value) {
				this.value = value;
			};

			HtmlResolver.prototype.renderHawkejsContent = function() {
				var pledge = new __Protoblast.Classes.Pledge();

				let element = Hawkejs.Hawkejs.createElement('x-text');
				element.innerHTML = this.value;

				this[Hawkejs.RESULT] = element;

				pledge.resolve(element);

				return pledge;
			}

			Hawkejs.Renderer.setCommand(function resolveToHtml(value) {
				return new HtmlResolver(value);
			});

			var renderer = hawkejs.render('generic_rhc', {}, function _done(err, html) {

				if (err) {
					throw err;
				}

				assert.strictEqual(html, '<x-text>hi</x-text>\n<div>\n\t<x-text>nested</x-text>\n</div>');
				done();
			});
		});
	});

	// HTML Element Extensions!

	describe('#setIndexInParent(index)', function() {
		it('moved the element to the given index', function() {

			var div = Hawkejs.Hawkejs.createElement('div');

			let i = Hawkejs.Hawkejs.createElement('i'),
			    a = Hawkejs.Hawkejs.createElement('a'),
			    b = Hawkejs.Hawkejs.createElement('b');

			div.append(i);
			div.append(a);
			div.append(b);

			a.setIndexInParent(0);
			i.setIndexInParent(2);

			assert.strictEqual(div.innerHTML, '<a></a><b></b><i></i>');

			a.setIndexInParent(0);
			assert.strictEqual(div.innerHTML, '<a></a><b></b><i></i>');
		});
	});
});