var assert   = require('assert'),
    Hawkejs  = require('../index.js'),
    hawkejs,
    test_id = 0;

describe('Expressions', function() {

	before(function() {
		hawkejs = new Hawkejs();
	});

	describe('If', function() {
		var tests = [
			['{% if true %}TRUE{% /if %}', 'TRUE'],
			['{% if false %}TRUE{% else %}ELSE{% /if %}', 'ELSE'],
			['{% if "a" eq "a" %}TRUE{% else %}ELSE{% /if %}', 'TRUE'],
			['{% if "a" eq "b" %}TRUE{% else %}ELSE{% /if %}', 'ELSE'],
			['{% if "a" eq "b" %}TRUE{% /if %}', ''],
			['{% if empty_arr %}TRUE{% /if %}', ''],
			['{% if empty_arr %}TRUE{% else %}ELSE{% /if %}', 'ELSE'],
			['{% if non.existing.variable.path %}TRUE{% else %}ELSE{% /if %}', 'ELSE'],
			['{% if 1 eq 1 %}eq{% /if %}', 'eq'],
			['{% if 2 gt 1 %}gt{% /if %}', 'gt'],
			['{% if 2 lt 1 %}lt{% /if %}', ''],
			['{% if empty_arr %}WRONG{% else %}ELSE{% /if %}', 'ELSE'],
			['{% if full_arr %}TRUE{% /if %}', 'TRUE'],
			['{% if empty_obj %}WRONG{% else %}ELSE{% /if %}', 'ELSE'],
			['{% if "" %}WRONG{% /if %}',    ''],
			['{% if 0 %}WRONG{% /if %}',     ''],
			['{% if false %}WRONG{% /if %}', ''],
			['{% if "a" %}TRUE{% /if %}',    'TRUE'],
			['{% if 1 %}TRUE{% /if %}',      'TRUE'],
			['{% if none.existing.variable %}WRONG{% /if %}', ''],
			['{% if "" emptyhtml %}TRUE{% /if %}', 'TRUE'],
			['{% if "<p></p>" emptyhtml %}TRUE{% /if %}', 'TRUE'],
			['{% if "<p>a</p>" emptyhtml %}WRONG{% /if %}', ''],
			// @TODO: ['{% if 1 emptyhtml %}WRONG{% /if %}', ''],
		];

		createTests(tests);
	});

	describe('Else', function() {
		var tests = [
			['{% if false %}WRONG{% else %}ELSE{% /if %}', 'ELSE'],
			['{% if 0 %}WRONG{% else %}ELSE{% /if %}',     'ELSE'],
			['{% if none.existing.variable %}WRONG{% else %}ELSE{% /if %}', 'ELSE']
		];

		createTests(tests);
	});

	describe('Not', function() {

		var tests = [
			['{% if not true %}1{% else %}0{% /if %}',    '0'],
			['{% if not false %}1{% else %}0{% /if %}',   '1'],
			['{% if (not false) %}1{% else %}0{% /if %}', '1'],
			['{% if 1 not eq 0 %}TRUE{% /if %}',          'TRUE'],
			['{% if 1 not gt 0 %}WRONG{% else %}ELSE{% /if %}', 'ELSE']
		];

		createTests(tests);
	});

	describe('Break', function() {

		var tests = [
			['{% if true %}1{% break %}WRONG{% else %}0{% /if %}', '1'],
			['{% if false %}WRONG{% break %}WRONG{% else %}ELSE{% break %}WRONG{% /if %}', 'ELSE'],
			['{% if true %}1{% if true %}1{% break %}WRONG{% /if %}1{% /if %}', '111'],
		];

		createTests(tests);
	});

	describe('Trim', function() {

		var tests = [
			['Bla bla {% trim %} bla bla',        'Bla blabla bla'],
			['Bla bla\t{% trim %}\nbla bla',      'Bla blabla bla'],
			['Bla bla {% trim left %}\tbla bla',  'Bla bla\tbla bla'],
			['Bla bla {% trim right %}\tbla bla', 'Bla bla bla bla'],
			['Bla bla\t\t{% trim right %} {%= bla %}\n bla bla', 'Bla bla\t\tbla bla'],
			['<p></p>{% trim blank %}',            ''],
			[' <p> </p>{% trim blank %}',          ''],
			[' <p id="p"> </p >{% trim blank %}',  ''],
			['TEST<p></p>{% trim blank %}',        'TEST<p></p>'],
		];

		createTests(tests);
	});

	describe('Print', function() {
		var tests = [
			['Test: {%= test.name %}',              'Test: testname'],
			['One: {%= test.one %}',                'One: 1'],
			['Four: {%= test.two.three.four %}',    'Four: 4'],
			['Nothing: {%= that.does.not.exist %}', 'Nothing: '],
			['Nothing: {%= nope.nope %}{% trim %}', 'Nothing:'],
			['Literal: {%= "literal" %}',           'Literal: literal'],
			['Sum: {%= 1 + 1 %}',                   'Sum: 2'],
			['Minus: {%= 1 - 1 %}',                 'Minus: 0'],
		];

		createTests(tests);
	});
});

function createTests(tests) {
	for (let i = 0; i < tests.length; i++) {
		let code = tests[i][0],
		    title = tests[i][0].replace(/\n/g, '\\n').replace(/\t/g, '\\t'),
		    result = tests[i][1];

		it(title, function(next) {
			test_id++;

			var compiled = hawkejs.compile('test_' + test_id, code),
			    vars;

			vars = {
				empty_arr : [],
				full_arr  : [0],
				empty_obj : {},
				test      : {
					name  : 'testname',
					one   : 1,
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