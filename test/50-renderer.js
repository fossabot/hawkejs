var assert   = require('assert'),
    Hawkejs  = require('../index.js'),
    hawkejs;

describe('Renderer', function() {

	before(function() {
		hawkejs = new Hawkejs();
		hawkejs.addViewDirectory(__dirname + '/templates');
	});

	describe('#async(fnc)', function() {
		it('allows you to use an async function inside a template', function(done) {

			var code = `
				<% this.async(function(next) {
					__Protoblast.Globals.setTimeout(function() {
						next(null, 'text');
					}, 5);
				}) %>
			`;

			var compiled = hawkejs.compile('async_test_1', code);

			hawkejs.render(compiled, {}, function rendered(err, res) {

				if (err) {
					throw err;
				}

				res = res.trim();

				assert.strictEqual(res, 'text');
				done();
			});
		});
	});

	describe('#assign(name)', function() {
		it('sets the wanted block content', function(done) {

			hawkejs.render('assign_test', function doneAssignTest(err, result) {

				if (err) {
					throw err;
				}

				assert.strictEqual(result.trim(), `<div>
<he-block data-hid="hserverside-0" data-he-name="main" data-he-template="assign_test">
This is the internally set main
</he-block>
</div>`);

				done();
			});
		});
	});

	describe('#assign_end()', function() {
		it('should claim the siblings', function(done) {
			hawkejs.render('assign_end', function doneAssignTest(err, result) {

				if (err) {
					throw err;
				}

				assert.strictEqual(result.trim(), '<div class="a">\n\t<div class="b">\n\t\t<div class="c">\n\t\t\t<label class="d">\n\t\t\t\t<he-block data-hid="hserverside-0" data-he-name="title">DEFAULT</he-block>\n\t\t\t</label>\n\t\t</div>\n\t</div>\n\t<div class="row">\n\t\t\n\t</div>\n</div>');

				done();
			});
		});
	});

	describe('#expands(template)', function() {
		it('expands into the given template', function(done) {
			hawkejs.render('expand_test', function doneExpandTest(err, result) {

				if (err) {
					throw err;
				}

				assert.strictEqual(result.trim(), `<div class="main">
	<hr>
	<he-block data-hid="hserverside-0" data-he-name="main" data-he-template="expand_test">
This is the main content
</he-block>
</div>`);

				done();
			});
		});
	});

	describe('#start(name, options)', function() {
		it('should add block classes if given', function(done) {

			hawkejs.render('assign_test_class', function doneExpandTest(err, result) {

				if (err) {
					throw err;
				}

				assert.strictEqual(result.trim(), '<div>\n<he-block class="with-class" data-hid="hserverside-0" data-he-name="main" data-he-template="assign_test_class">\nShould have class set\n</he-block>\n</div>');
				done();
			});

		});
	});

	describe('#implement(name)', function() {
		it('should print the given element', function(done) {
			hawkejs.render('implement_test', function doneImplement(err, result) {

				if (err) {
					throw err;
				}

				assert.strictEqual(result, `S: This EJS example can't be more simple.-`);
				done();
			});
		});

		it('should include assignments', function(done) {
			hawkejs.render('implement_blocks', function doneImplement(err, result) {

				if (err) {
					throw err;
				}

				result = result.trim();

				assert.strictEqual(result, `--
»<he-block data-hid="hserverside-0" data-he-name="test" data-he-template="partials/text_block">TEXT_BLOCK PARTIAL</he-block>«`);
				done();
			});
		});

		it('should work on assignments', function(done) {
			hawkejs.render('expand_start_implement_assign', function doneImplement(err, result) {

				if (err) {
					throw err;
				}

				result = result.trim();

				assert.strictEqual(result, `<div class="main">
	<hr>
	<he-block data-hid="hserverside-1" data-he-name="main" data-he-template="expand_start_implement_assign">[<he-block data-hid="hserverside-0" data-he-name="test" data-he-template="partials/text_block">TEXT_BLOCK PARTIAL</he-block>]</he-block>\n</div>`);
				done();
			});
		});
	});

	describe('#include(name)', function() {
		it('should only be executed if in a used block', function(done) {
			hawkejs.render('expand_start_include_assign', function doneImplement(err, result) {

				if (err) {
					throw err;
				}

				result = result.trim();

				assert.strictEqual(result, `<div class="main">
	<hr>
	<he-block data-hid="hserverside-1" data-he-name="main" data-he-template="expand_start_include_assign">[<he-block data-hid="hserverside-0" data-he-name="test"></he-block>]</he-block>\n</div>`);
				done();
			});
		});
	});

	describe('#partial(name)', function() {
		it('should render a partial in a new scope', function(done) {
			hawkejs.render('print_partial', function donePartial(err, result) {

				if (err) {
					throw err;
				}

				result = result.trim();

				assert.strictEqual(result, `<div>
<span>Printing:</span>
<he-block data-hid="hserverside-0" data-he-name="main" data-he-template="print_partial">Printing Main</he-block>
<span>Partial:</span>
<he-block data-hid="hserverside-1" data-he-name="main" data-he-template="partials/partial_with_own_main">Partial Main</he-block>


</div>
<hr>`);
				done();
			});
		});

		it('should allow using scoped blocks with implements', function(done) {
			hawkejs.render('partial_with_implements', function donePartial(err, result) {

				if (err) {
					throw err;
				}

				result = result.trim();

				assert.strictEqual(result, "<b><he-block data-hid=\"hserverside-0\" data-he-name=\"text\" data-he-template=\"partials/create_text_block\">TEXT: bold</he-block></b>\n\n\n<i><he-block data-hid=\"hserverside-1\" data-he-name=\"text\" data-he-template=\"partials/create_text_block\">TEXT: italic</he-block></i>");
				done();
			});
		});
	});

	describe('Template#switchTemplate(name, variables)', function() {
		it('should allow using scoped blocks that switch target blocks', function(done) {
			hawkejs.render('partial_with_switch_template', function donePartial(err, result) {

				if (err) {
					throw err;
				}

				result = result.trim();

				assert.strictEqual(result, '<span><he-block data-hid="hserverside-0" data-he-name="text" data-he-template="partials/switch_bold"><b>bold</b></he-block></span>');
				done();
			});
		});

		it('should allow switching to another template in the start template', function(done) {
			hawkejs.render('partial_with_root_switch_and_implement', function donePartial(err, result) {

				if (err) {
					throw err;
				}

				assert.strictEqual(result, 'This is wrapper text "wrapper"\n<he-block data-hid="hserverside-0" data-he-name="entries" data-he-template="partials/entries">Text: entries</he-block>');
				done();
			});
		});
	});

	describe('#foundation()', function() {
		it('should not wait for placeholders that are waiting for itself', function(done) {

			let renderer = hawkejs.render('implement_with_foundation_extension', function doneImplement(err, result) {

				if (err) {
					throw err;
				}

				assert.strictEqual(__Protoblast.Bound.String.checksum(result), 2911583366);
				done();
			});
		});
	});

	describe('#setTheme(name)', function() {
		it('should set the theme to use for partials', function(done) {

			let renderer = hawkejs.render('implement_blocks', function doneImplement(err, result) {

				if (err) {
					throw err;
				}

				assert.strictEqual(result, `--\n»<he-block data-hid="hserverside-0" data-he-name="test" data-he-template="partials/text_block" data-theme="dark">DARK TEXT_BLOCK PARTIAL</he-block>«`);
				done();
			});

			renderer.setTheme('dark');
		});

		it('should set the theme to use for extensions', function(done) {

			let renderer = hawkejs.render('expand_test', function doneImplement(err, result) {

				if (err) {
					throw err;
				}

				assert.strictEqual(result, `<div class="main dark">\n\t<hr>\n\t<he-block data-hid="hserverside-0" data-he-name="main" data-he-template="expand_test" data-theme="dark">\nThis is the main content\n</he-block>\n</div>`);
				done();
			});

			renderer.setTheme('dark');
		});
	});

	describe('#$0', function() {
		it('is a local property that refers to the current element', function(done) {

			let renderer = hawkejs.render('local_property_test', function doneTest(err, result) {

				if (err) {
					throw err;
				}

				assert.strictEqual(result, `<div class="Alfa">
	Alfa
	<span id="myspan">
		myspan

		<hr>
		<p class="Beta">
			This Beta is in Alfa
		</p>
	</span>
</div>`);
				done();
			});
		});
	});
});

function createTests(tests) {
	for (let i = 0; i < tests.length; i++) {
		let code = tests[i][0],
		    title = tests[i][0].replace(/\n/g, '\\n').replace(/\t/g, '\\t'),
		    result = tests[i][1];

		if (title.length > 74) {
			title = title.slice(0, 72) + '…';
		}

		it(title, function(next) {
			test_id++;

			var compiled = hawkejs.compile('test_' + test_id, code),
			    vars;

			vars = {
				empty_arr : [],
				full_arr  : [0],
				single    : [0],
				numbers   : [0, 1, 2, 3],
				empty_obj : {},
				date      : new Date('2019-03-07'),
				test      : {
					name  : 'testname',
					one   : 1,
					three : 3,
					two   : {
						three: {
							four: 4
						}
					}
				}
			};

			hawkejs.render(compiled, vars, function done(err, res) {

				if (err) {
					return next(err);
				}

				assert.strictEqual(res, result);
				next();
			});
		});
	}
}