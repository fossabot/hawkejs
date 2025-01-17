var Obj = Bound.Object;

/**
 * Base Hawkejs Expression class
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  2.0.0
 */
var Expression = Fn.inherits(null, 'Hawkejs.Expression', function Expression(view) {
	this.view = view;

	if (view.expression_chain) {
		this.parent = view.expression_chain[view.expression_chain.length - 1];
	}
});

/**
 * The type name
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 */
Expression.prepareStaticProperty(function type_name() {
	return Bound.String.underscore(this.name);
});

/**
 * The closing tag name
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 */
Expression.prepareStaticProperty(function close_name() {
	return '/' + this.type_name;
});

/**
 * Get or create a certain expression class
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 */
Expression.setStatic(function getClass(parent, name) {

	if (arguments.length == 1) {
		name = parent;
		parent = 'Hawkejs.Expression';
	} else {
		parent = 'Hawkejs.Expression.' + parent;
	}

	if (!Classes.Hawkejs.Expression[name]) {
		Fn.inherits(parent, Fn.create(name, function ExpressionConstructor(view) {
			ExpressionConstructor.wrapper.super.call(this, view);
		}));
	}

	return Classes.Hawkejs.Expression[name];
});

/**
 * Do the given pieces match this expression?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 *
 * @param    {Object}   options
 *
 * @return   {Boolean}
 */
Expression.setStatic(function matches(options) {
	return this.type_name == options.type;
});

/**
 * Parse the given line if it matches
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 *
 * @param    {Object}   options
 *
 * @return   {Boolean|Object}
 */
Expression.setStatic(function parse(options) {

	var result;

	if (!this.matches(options)) {
		return false;
	}

	if (options.close) {
		result = this.toCloseCode(options);

		if (typeof result == 'string') {
			result = {
				name  : this.type_name,
				code  : result,
				close : true
			};
		}
	} else {
		result = this.toCode(options);

		if (typeof result == 'string') {
			result = {
				name  : this.type_name,
				code  : result
			};
		}
	}

	result.class = this;

	return result;
});

/**
 * Parse an expression and return the value
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.3.3
 * @version  1.3.3
 *
 * @param    {ViewRender}  view
 * @param    {Array}       tokens   An array of tokens
 * @param    {Object}      vars     An object of variables
 */
Expression.setStatic(function parseExpression(view, tokens, vars) {
	var instance = new this(view);
	return instance.parseExpression(tokens, vars);
});

/**
 * Return opening code for use in the template
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 *
 * @param    {Object}   options
 *
 * @return   {Object}
 */
Expression.setStatic(function toCode(options) {

	var code,
	    args;

	code = '<% (__render.startExpression("' + this.name + '", ';

	if (this.parseArguments) {
		args = this.parseArguments(options);
	} else {
		args = 'null';
	}

	if (args && typeof args == 'object') {
		code += JSON.stringify(args);
	} else {
		code += args;
	}

	code += ', vars, function subtemplate(vars, _$expression) { -%>';

	return code;
});

/**
 * Return closing code for use in the template
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 *
 * @param    {Object}   options
 *
 * @return   {Object}
 */
Expression.setStatic(function toCloseCode(options) {
	return '<% }).close()) /* ' + this.close_name + ' */ -%>';
});

/**
 * It has been closed
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 */
Expression.setMethod(function close() {
	this.execute();
});

/**
 * Break out
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 */
Expression.setMethod(function breakOut(name) {

	// Indicate this has been broken out of
	this.break = true;

});

/**
 * Branch to a specific subkeyword
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 *
 * @param    {String}  name
 * @param    {Array}   pieces
 */
Expression.setMethod(function branch(name, pieces, fnc) {

	if (this.break) {
		return;
	}

	if (!this.branches) {
		this.branches = {};
	}

	this.branches[name] = {
		pieces: pieces,
		fnc   : fnc
	};

	if (this['onBranch_' + name]) {
		this['onBranch_' + name](pieces, fnc);
	}

	return this;
});

/**
 * Parse expression
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 *
 * @param    {Array}   tokens   An array of tokens
 * @param    {Object}  vars     An object of variables
 */
Expression.setMethod(function parseExpression(tokens, vars) {

	var have_a_value,
	    have_b_value,
	    did_operator,
	    operator,
	    result,
	    token,
	    op,
	    a,
	    b,
	    c,
	    i;

	for (i = 0; i < tokens.length; i++) {
		token = tokens[i];
		did_operator = false;

		if (token.keyword == 'not') {
			if (tokens[i+1]) {
				// Invert the (probably falsy) invert of THIS not keyword
				// Because of this not-not works as expected
				tokens[i+1].invert = !token.invert;
			}

			continue;
		}

		if (token.keyword == 'or') {
			if (this.isTruthy(result)) {
				return result;
			}

			// An OR "collapses" the values we're looking for
			// (The second variable after an OR is not the "b" value,
			// but an alternative A value)
			have_a_value = false;

			continue;
		}

		if (token.keyword == 'and') {
			if (!this.isTruthy(result)) {
				return result;
			}

			have_a_value = false;

			continue;
		}

		if (!have_a_value) {
			have_a_value = true;
			have_b_value = false;
			operator = null;
			a = this.getTokenValue(token, vars);

			if (token.invert) {
				a = !this.isTruthy(a);
			} else if (token.invert === false) {
				a = !!this.isTruthy(a);
			}

			result = a;
		} else if (!operator) {

			if (token.variable) {
				throw new SyntaxError('Unexpected token: variable `' + token.variable.join('.') + '`');
			}

			operator = token;
			op = operator.keyword;
		} else {
			b = this.getTokenValue(token, vars);
			have_b_value = true;

			if (token.invert) {
				b = !this.isTruthy(b);
			} else if (token.invert === false) {
				b = !!this.isTruthy(b);
			}
		}

		if (op == 'empty') {
			if (typeof a == 'string') {
				result = Blast.Bound.String.isEmptyWhitespace(a);
			} else {
				result = Blast.Bound.Object.isEmpty(a);
			}
			did_operator = true;
		} else if (op == 'emptyhtml') {
			if (typeof a == 'string') {
				result = Blast.Bound.String.isEmptyWhitespaceHTML(a);
			} else {
				result = Blast.Bound.Object.isEmpty(a);
			}
			did_operator = true;
		} else if (!have_b_value) {
			continue;
		}

		if (did_operator) {
			// Already did operator code
		} else if (op == 'eq') {
			result = a == b;
		} else if (op == 'starts with') {
			result = a.indexOf(b) == 0;
		} else if (op == 'gt') {
			result = a > b;
		} else if (op == 'ge') {
			result = a >= b;
		} else if (op == 'lt') {
			result = a < b;
		} else if (op == 'le') {
			result = a <= b;
		} else if (op == 'plus') {
			result = a + b;
		} else if (op == 'minus') {
			result = a - b;
		} else if (op == 'multiply') {
			result = a * b;
		} else if (op == 'divide') {
			result = a / b;
		} else if (op) {
			throw new Error('Unknown operator "' + op +'"');
		} else {
			result = a;
		}

		if (operator.invert) {
			result = !this.isTruthy(result);
		}

		// The operator has been executed,
		// the result becomes the "A" value
		// and we're waiting for a new operator & "B" value
		a = result;
		operator = false;
		have_b_value = false;
	}

	return result;
});

/**
 * Get token value
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.3.3
 *
 * @param    {Object}  token
 * @param    {Object}  vars     An object of variables
 */
Expression.setMethod(function getTokenValue(token, vars) {

	if (!token) {
		return;
	}

	if (typeof token.value != 'undefined') {
		return token.value;
	}

	if (token.variable) {
		let res = this.getTokenValuePart(token.variable, vars);
		return res;
	}

	if (token.call) {
		return this.callPathWithArgs(token.call, token.arguments, vars);
	}

	if (Array.isArray(token)) {
		return this.parseExpression(token, vars);
	}
});

/**
 * Get token value as an array
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.3.3
 * @version  1.3.3
 *
 * @param    {Object}  tokens
 * @param    {Object}  vars     An object of variables
 */
Expression.setMethod(function getTokenValuesArray(tokens, vars) {

	var result = [],
	    groups = [],
	    current,
	    token,
	    i;

	for (i = 0; i < tokens.length; i++) {
		token = tokens[i];

		if (!current) {
			current = [];
			groups.push(current);
		}

		if (token.keyword == 'comma') {
			current = null;
			continue;
		}

		current.push(token);
	}

	for (i = 0; i < groups.length; i++) {
		result.push(this.getTokenValue(groups[i], vars));
	}

	return result;
});

/**
 * Call the given variable with the given arguments
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.3.3
 * @version  1.3.3
 *
 * @param    {Array}   path
 * @param    {Array}   args
 */
Expression.setMethod(function callPathWithArgs(path, args, vars) {

	var options = [vars, this.view.helpers, this.view, Blast.Globals],
	    context,
	    result,
	    temp,
	    fnc,
	    i;

	if (path.length == 1) {
		for (i = 0; i < options.length; i++) {
			if (typeof options[i][path[0]] == 'function') {
				context = options[i];
				fnc = context[path[0]];
				break;
			}
		}
	} else {
		let class_path = path.slice(0, -1),
		    name = path[path.length - 1];

		for (i = 0; i < options.length; i++) {
			temp = Blast.Bound.Object.path(options[i], class_path);

			if (temp && typeof temp[name] == 'function') {
				context = temp;
				fnc = context[name];
			}
		}
	}

	if (!context || !fnc) {
		throw new Error('Unable to call path "' + path.join('.') + '"');
	}

	args = this.getTokenValuesArray(args, vars);

	result = fnc.apply(context, args);

	return result;
});

/**
 * Get token part
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 *
 * @param    {Object}  token
 * @param    {Object}  vars     An object of variables
 */
Expression.setMethod(function getTokenValuePart(obj, vars) {

	var result,
	    i;

	if (obj && obj.type) {
		result = obj.value;
	} else if (Array.isArray(obj)) {
		if (Array.isArray(obj[0])) {
			for (i = 0; i < obj.length; i++) {
				result = this.getTokenValuePart(obj[i], vars);

				if (result) {
					break;
				}
			}
		} else {
			result = Obj.path(vars, obj);
		}
	}

	return result;
});

/**
 * Is the given variable truthy?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.3.0
 * @version  1.3.0
 *
 * @param    {Mixed}   variable
 *
 * @return   {Boolean}
 */
Expression.setMethod(function isTruthy(variable) {

	var result = false;

	if (variable) {
		if (variable === true || variable.length) {
			result = true;
		} else if (typeof variable == 'object') {
			if (Array.isArray(variable) || typeof variable.length == 'number') {
				// Only truthy if array has values
				result = variable.length > 0;
			} else if (!Obj.isPlainObject(variable) || !Obj.isEmpty(variable)) {
				result = true;
			}
		} else {
			result = true;
		}
	}

	return result;
});

/**
 * Some flow keywords
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 */
var Subkeyword = Expression.getClass('Subkeyword');

/**
 * Do the given pieces match this expression?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 *
 * @param    {Object}
 */
Subkeyword.setStatic(function matches(options) {

	switch (options.type) {
		case 'multiple':
		case 'single':
		case 'none':
		case 'else':
		case 'all':
			return true;
	}

	return false;
});

/**
 * Return opening code for use in the template
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 *
 * @param    {Object}   options
 *
 * @return   {Object}
 */
Subkeyword.setStatic(function toCode(options) {

	var result,
	    name,
	    code;

	name = options.type;

	if (options.current.name == 'with' || options.current.name == 'while') {
		code = '<% _$expression';
	} else {
		code = '<% })';
	}

	code += '.branch("' + options.type + '", null, function subtemplate(vars) {';

	code += ' -%>';

	result = {
		name : name,
		code : code
	};

	return result;
});

/**
 * Return closing opening code for use in the template
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 *
 * @param    {Object}   options
 *
 * @return   {Object}
 */
Subkeyword.setStatic(function toCloseCode(options) {
	var code = '<% }) /* /' + options.type + ' */ ';

	code += '; if (_$expression.break) return; -%>'

	return code;
});

/**
 * The "Macro" expression
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 */
var Macro = Expression.getClass('Macro');

/**
 * Parse the given line if it matches
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 *
 * @param    {Object}   options
 *
 * @return   {Object}
 */
Macro.setStatic(function toCode(options) {

	var tokens = options.tokens,
	    code,
	    name,
	    args,
	    arg,
	    i;

	name = tokens.getVariable(1)[0];

	code = '<% if (!vars._$macros) { vars._$macros = {} };';
	code += 'vars._$macros[' + JSON.stringify(name) + '] = function(vars) {';

	args = tokens.getArguments();

	if (args && args.length) {
		for (i = 0; i < args.length; i++) {
			arg = args[i];

			code += 'if (vars[' + JSON.stringify(arg.name) + '] == null) ';
			code += 'vars[' + JSON.stringify(arg.name) + '] = ' + arg.value + ';';
		}
	}

	code += '%>';

	return code;
});

/**
 * Return code for use in the template
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 *
 * @param    {Object}   options
 *
 * @return   {Object}
 */
Macro.setStatic(function toCloseCode(options) {
	return '<% } -%>';
});

/**
 * The "Break" expression
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 */
var Break = Expression.getClass('Break');

/**
 * Parse the given line if it matches
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 *
 * @param    {Object}   options
 *
 * @return   {Object}
 */
Break.setStatic(function toCode(options) {

	var result,
	    named,
	    code;

	code = '<% ';

	named = options.tokens.current;

	if (named) {
		named = named.value;

		if (named) {
			code += '_$expression.breakOut("' + named + '");';
		} else {
			code += '_$expression.breakOut()';
		}
	}

	code += ' return %>';

	result = {
		name : 'break',
		code : code,
		void : true
	};

	return result;
});

/**
 * The "Trim" expression
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.3.0
 * @version  1.3.0
 */
var Trim = Expression.getClass('Trim');

/**
 * Parse the given line if it matches
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.3.0
 * @version  1.3.0
 *
 * @param    {Object}   options
 *
 * @return   {Object}
 */
Trim.setStatic(function toCode(options) {

	var code = '<% this.current_block.',
	    left,
	    right;

	if (options.tokens.hasValue('blank')) {
		code += 'trimBlankElements(';
	} else {
		code += 'trim(';

		left = options.tokens.hasValue('left');
		right = options.tokens.hasValue('right');

		if (left || right) {
			code += left + ', ' + right;
		}
	}

	code += ') %>';

	return {
		name : 'trim',
		code : code,
		void : true
	};
});

/**
 * The "Print" expression
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 */
var Print = Expression.getClass('Print');

/**
 * Do the given pieces match this expression?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 *
 * @param    {Object}
 */
Print.setStatic(function matches(options) {
	return (options.type == '=' || options.type == 'print');
});

/**
 * Parse the given line if it matches
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.3.0
 *
 * @param    {Object}   options
 *
 * @return   {Object}
 */
Print.setStatic(function toCode(options) {

	var var_name,
	    tokens = options.tokens,
	    result,
	    param,
	    paths,
	    args,
	    arg,
	    i;

	result = '<% ';

	if (tokens.current.value == 'macro') {
		tokens.next();
		tokens.next();

		param = tokens.getVariable()[0].join('.');

		args = tokens.getArguments();

		if (args && args.length) {
			var_name = '_$macro_' + Date.now();
			result += var_name + ' = Object.create(vars);';

			for (i = 0; i < args.length; i++) {
				arg = args[i];
				result += var_name + '[' + JSON.stringify(arg.name) + ']';
				result += ' = ' + arg.value + ';';
			}
		} else {
			var_name = 'vars';
		}

		result += 'vars._$macros[' + JSON.stringify(param) + '](' + var_name + ')';
	} else {
		args = options.tokens.getExpression();

		if (args) {
			result += '(__render.startExpression("Print", ';

			if (typeof args == 'object') {
				result += JSON.stringify(args);
			} else {
				result += args;
			}

			result += ', vars).close())';
		}
	}

	result += ' %>';

	return {
		name : 'print',
		code : result,
		void : true
	};
});

/**
 * Parse the given line if it matches
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.3.0
 * @version  1.3.0
 */
Print.setMethod(function execute() {

	var value = this.parseExpression(this.options, this.vars);

	if (value != null) {
		this.view.print(value);
	}
});

/**
 * The "With" expression
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 */
var With = Expression.getClass('With');

/**
 * Parse arguments
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 *
 * @param    {Object}   options
 *
 * @return   {String}
 */
With.setStatic(function parseArguments(options) {

	var tokens = options.tokens,
	    result = {};

	// Get the variable to use
	result.variable = tokens.getVariable();

	// Go to the AS keyword
	tokens.goTo('as');
	tokens.next();

	result.as = tokens.getVariable(1)[0];

	if (tokens.goTo('where')) {
		tokens.next();
		result.where = tokens.getVariable(1);

		if (result.where) {
			result.where = result.where.slice(1);
		}
	}

	return result;
});

/**
 * Execute the code
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  2.0.0
 *
 * @param    {String}  name
 * @param    {Array}   pieces
 */
With.setMethod(function execute() {

	var variable,
	    is_array,
	    target,
	    length,
	    paths,
	    vars,
	    name,
	    temp,
	    i;

	// Get the possible paths
	paths = this.options.variable;

	for (i = 0; i < paths.length; i++) {
		// Get the variable
		variable = Blast.Bound.Object.path(this.vars, paths[i]);

		if (variable) {
			if (length = variable.length) {
				is_array = true;
				break;
			}

			if (length == null && typeof variable == 'object') {
				length = Bound.Object.size(variable);

				if (length) {
					break;
				}
			}
		}
	}

	// Get the keys of the variable (be it an array or object)
	this.keys = Object.keys(variable);

	// Do we need to filter the variable?
	if (this.options.where && length) {
		target = [];

		for (i = 0; i < this.keys.length; i++) {
			temp = Blast.Bound.Object.path(variable[this.keys[i]], this.options.where);

			if (temp) {
				if (!Array.isArray(temp) || temp.length) {
					target.push(variable[this.keys[i]]);
				}
			}
		}

		variable = target;
	}

	if (this.constructor.type_name == 'while' && (!variable || !this.keys.length)) {
		return;
	}

	this.variable = variable;

	// Initialize the contents
	this.fnc.call(this.view, this.vars, this);
});

/**
 * Prepare iteration vars
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  2.0.0
 */
With.setMethod(function prepareVars() {

	var vars = Object.create(this.vars);

	vars._$each_as = this.options.as;
	vars._$each_var = this.variable;
	vars._$each_keys = this.keys;

	return vars;
});

/**
 * On the none branch
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  2.0.0
 *
 * @param    {Object}     options
 * @param    {Function}   fnc
 */
With.setMethod(function onBranch_none(options, fnc) {

	if (!this.variable || !this.keys.length) {
		fnc.call(this.view, this.vars);
	}

});

/**
 * On the all branch
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  2.0.0
 *
 * @param    {Object}     options
 * @param    {Function}   fnc
 */
With.setMethod(function onBranch_all(options, fnc) {

	var vars;

	if (!this.variable || !this.keys.length) {
		return;
	}

	vars = this.prepareVars();

	fnc.call(this.view, vars, this);
});

/**
 * On the "single" branch
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  2.0.0
 *
 * @param    {Object}     options
 * @param    {Function}   fnc
 */
With.setMethod(function onBranch_single(options, fnc) {

	var vars;

	if (!this.variable || this.keys.length != 1) {
		return;
	}

	vars = Object.create(this.vars);
	vars[this.options.as] = this.variable[this.keys[0]];

	fnc.call(this.view, vars, this);
});

/**
 * On the "multiple" branch
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  2.0.0
 *
 * @param    {Object}     options
 * @param    {Function}   fnc
 */
With.setMethod(function onBranch_multiple(options, fnc) {

	var vars;

	if (this.variable && this.keys.length > 1) {
		vars = this.prepareVars();
		fnc.call(this.view, vars, this);
	}
});

/**
 * The "While" expression
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 */
var While = Expression.getClass('With', 'While');

/**
 * The "Each" expression
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 */
var Each = Expression.getClass('Each');

/**
 * Execute the code
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  2.0.0
 *
 * @param    {String}  name
 * @param    {Array}   pieces
 */
Each.setMethod(function execute() {

	var base_vars,
	    variable,
	    as_name,
	    vars,
	    keys,
	    i;

	if (this.options && this.options.variable) {
		variable = Blast.Bound.Object.path(this.vars, this.options.variable)
		as_name = this.options.as;
		keys = Object.keys(variable);
	} else if (this.vars._$each_var != null) {
		variable = this.vars._$each_var;
		as_name = this.vars._$each_as;
		keys = this.vars._$each_keys;
	} else if (this.parent && this.parent.constructor.name == 'With') {
		base_vars = this.parent.prepareVars();
		variable = base_vars._$each_var;
		as_name = base_vars._$each_as;
		keys = base_vars._$each_keys;
	}

	if (variable && keys.length) {
		for (i = 0; i < keys.length; i++) {
			vars = Object.create(this.vars);
			vars[as_name] = variable[keys[i]];
			this.fnc.call(this.view, vars);
		}
	} else if (this.branches && this.branches.else) {
		this.branches.else.fnc.call(this.view, this.vars);
	}

	return this;
});

/**
 * The "If" expression
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 */
var If = Expression.getClass('If');

/**
 * Parse arguments
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 *
 * @param    {Object}   options
 *
 * @return   {String}
 */
If.setStatic(function parseArguments(options) {

	var result;

	result = options.tokens.getExpression();

	return result;
});

/**
 * Execute the code
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.3.0
 *
 * @param    {String}  name
 * @param    {Array}   pieces
 */
If.setMethod(function execute() {

	var variable = this.parseExpression(this.options, this.vars);

	if (this.isTruthy(variable)) {
		this.fnc.call(this.view, this.vars);
	} else if (this.branches && this.branches.else) {
		this.branches.else.fnc.call(this.view, this.vars);
	}

	return this;
});

/**
 * The "Block" expression
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 */
var Block = Expression.getClass('Block');

/**
 * Parse the given line if it matches
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 *
 * @param    {Array}   pieces
 *
 * @return   {String}
 */
Block.setStatic(function toCode(options) {

	var result,
	    pieces = options.source.split(' ');

	options.pieces = pieces;
	options.block = pieces[1];

	result = '<% start(' + options.block + ') -%>';

	return result;
});

/**
 * Return closing code for use in the template
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.9
 * @version  1.2.9
 *
 * @param    {Object}   options
 *
 * @return   {Object}
 */
Block.setStatic(function toCloseCode(options) {
	return '<% end(' + options.current.options.block + ') -%>';
});