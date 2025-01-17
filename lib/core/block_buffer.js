/**
 * BlockBuffers are array-like objects
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  2.0.0
 *
 * @param    {Hawkejs.Renderer}   viewRender
 * @param    {String}             name
 * @param    {Object}             options
 */
const BlockBuffer = Fn.inherits('Hawkejs.Base', function BlockBuffer(renderer, name, options) {

	// The parent renderer instance
	this.renderer = renderer;

	// The optional name of this block
	this.name = name || 'nameless-' + Date.now();

	// The template this block was defined in
	this.origin = renderer.current_template;

	// Is this block done?
	this.done = false;

	// Optional options
	this.options = options || {};

	// Element attributes
	this.attributes = this.options.attributes || {};

	// Block counter
	this.block_id = renderer.getId('block');

	// The elements of this buffer
	this.elements = [];

	// The lines of this buffer
	this.lines = [];

	// Other instances that share this name
	this.other_instances = [];
});

BlockBuffer.setDeprecatedProperty('joinBuffer', 'assemble');

/**
 * The rendered HTML
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    2.0.0
 * @version  2.0.0
 *
 * @type     {String}
 */
BlockBuffer.setProperty('html', null);

/**
 * Is this the main block?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    2.0.0
 * @version  2.0.0
 *
 * @type     {Boolean}
 */
BlockBuffer.setProperty(function is_main() {
	return this.name == this.renderer.main_block_name;
});

/**
 * Get the id of the element that should be considered the "root",
 * if it is set at all
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    2.0.0
 * @version  2.0.0
 *
 * @type     {String}
 */
BlockBuffer.setProperty(function scope_id() {
	return this.renderer.scope_id;
});

/**
 * Get the length of this block
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.3.2
 * @version  1.3.2
 *
 * @type     {Number}
 */
BlockBuffer.setProperty(function length() {
	return this.lines.length;
}, function setLength(length) {
	return this.lines.length = length;
});

/**
 * Get the variables used during rendering
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    2.0.0
 * @version  2.0.0
 *
 * @type     {Object}
 */
BlockBuffer.setProperty(function variables() {

	if (this._variables) {
		return this._variables;
	}

	if (this.start_template) {
		return this.start_template.rendered_variables;
	}
}, function setVariables(variables) {
	return this._variables = variables;
});

/**
 * Push a line
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.3.2
 * @version  1.4.0
 *
 * @param    {String|Object}   line
 *
 * @return   {Number}          The index of the pushed line
 */
BlockBuffer.setMethod(function push(line) {

	if (!this.elements.length) {
		return this.lines.push(line);
	}

	let last = this.elements[this.elements.length - 1];

	if (typeof line == 'string') {
		last.insertAdjacentHTML('beforeend', line);
	} else {
		// @TODO: should check more than just renderHawkejsContent
		if (line.nodeName == null && line.renderHawkejsContent && Blast.isBrowser) {
			let placeholder = this.renderer.createElement('he-placeholder');
			placeholder.subject_line = line;
			line = placeholder;
		}

		last.append(line);
	}
});

/**
 * Add an element
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.3.2
 * @version  1.4.0
 *
 * @param    {ElementPlaceholder}   placeholder
 */
BlockBuffer.setMethod(function pushElement(placeholder) {

	var index = this.push(placeholder);

	this.elements.push(placeholder);

	return index;
});

/**
 * Return debugbar info
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.1.3
 * @version  1.2.2
 */
BlockBuffer.setMethod(function toDebugbar() {
	return 'Blockbuffer of "' + this.name + '" in template "' + this.origin.name + '"';
});

/**
 * Return the finished HTML or the current lines joined with an empty string
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.3.2
 */
BlockBuffer.setMethod(function toString() {

	if (this.html != null) {
		return this.html;
	}

	return this.toHTML();
});

/**
 * Return the object to use for JSON
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  2.0.0
 */
BlockBuffer.setMethod(function toJSON() {

	var result = {};

	result.name = this.name;
	result.origin = this.origin;
	result.variables = this.variables;
	result.options = this.options;
	result.block_id = this.block_id;

	if (this.in_scope) {
		result.in_scope = this.in_scope;
	}

	return result;
});

/**
 * Return the HTML content of this block
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    2.0.0
 * @version  2.0.0
 */
BlockBuffer.setMethod(function toHTML() {

	if (this[Hawkejs.SERIALIZING]) {
		return '<!-- Infinite loop detected -->';
	}

	if (!this._assemble_pledge || !this._assemble_pledge._ended) {
		throw new Error('Unable to return HTML of this block: it has not yet been assembled');
	}

	this[Hawkejs.SERIALIZING] = true;

	let html = '',
	    length = this.lines.length,
	    trim_right,
	    trim_left,
	    classname,
	    line,
	    i;

	// Join the buffer array entries into a single string
	for (i = 0; i < length; i++) {
		line = Hawkejs.getTextContent(this.lines[i], this.renderer);

		if (this.has_trim) {

			if (trim_right || this.shouldTrimLeftAt(i)) {

				if (!trim_right) {
					html = Bound.String.trimRight(html);
				}

				line = Bound.String.trimLeft(line);

				if (line) {
					trim_right = false;
				}
			}

			if (trim_right || this.shouldTrimRightAt(i)) {
				line = Bound.String.trimRight(line);
				trim_right = true;
			} else if (trim_right && line) {
				trim_right = false;
			}
		}

		html += line;

		if (this.has_trim_blank && this.trim_blanks[i + 1]) {
			if (Bound.String.isEmptyWhitespaceHTML(html)) {
				html = '';
			}
		}
	}

	this[Hawkejs.SERIALIZING] = false;

	return html;
});

/**
 * Return an array of elements & strings of this block
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    2.0.0
 * @version  2.0.0
 *
 * @return   {Array}
 */
BlockBuffer.setMethod(function toElements() {

	if (!this._assemble_pledge || !this._assemble_pledge._ended) {
		throw new Error('Unable to return HTML of this block: it has not yet been assembled');
	}

	var result = [],
	    length = this.lines.length,
	    line,
	    i;

	for (i = 0; i < length; i++) {
		line = Hawkejs.getElementContent(this.lines[i], this.renderer);

		if (line) {
			if (Array.isArray(line)) {
				let entry,
				    j;

				for (j = 0; j < line.length; j++) {
					entry = line[j];

					if (entry && entry.nodeName) {
						Hawkejs.normalizeChildren(entry);
					}

					result.push(entry);
				}

				continue;
			} else if (line.nodeName) {
				Hawkejs.normalizeChildren(line);
			}
		}

		result.push(line);
	}

	return result;
});

/**
 * Make splice return a new BlockBuffer
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.3.3
 */
BlockBuffer.setMethod(function splice(index, howMany) {

	// Splice this BlockBuffer, get a simple array as a result
	var spliced,
	    result,
	    args,
	    i;

	args = [];

	for (i = 0; i < arguments.length; i++) {
		args.push(arguments[i]);
	}

	spliced = Array.prototype.splice.apply(this.lines, args);

	// Create a new BlockBuffer
	result = new BlockBuffer(this.renderer, this.name + '-splice-' + index);

	result.lines = spliced;

	return result;
});

/**
 * Assemble & get the HTML result
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    2.0.0
 * @version  2.0.0
 *
 * @return   {Pledge}
 */
BlockBuffer.setMethod(function assembleHTML() {

	var that = this,
	    pledge = new Pledge();

	this.assemble().done(function assembled(err) {

		if (err) {
			return pledge.reject(err);
		}

		pledge.resolve(that.toHTML());
	});
});

/**
 * Assemble all blocks, resolve placeholders
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  2.0.0
 *
 * @return   {Pledge}
 */
BlockBuffer.setMethod(function assemble() {

	if (!this._assemble_pledge) {
		let that = this;

		this._assemble_pledge = new Classes.Pledge();

		this._assemble().done(function assembled(err) {

			if (err) {
				return that._assemble_pledge.reject(err);
			}

			if (that.other_instances.length && that.options.content == 'push') {
				let i;

				for (i = 0; i < that.other_instances.length; i++) {
					that.lines.push(that.other_instances[i].lines[0]);
				}
			}

			that._assemble_pledge.resolve(that);
		});
	}

	return this._assemble_pledge;
});

/**
 * Do the actual joining
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  2.0.0
 *
 * @param    {Boolean}  join_others
 *
 * @return   {Pledge}
 */
BlockBuffer.setMethod(function _assemble(join_others) {

	var that = this,
	    tasks,
	    i;

	if (join_others == null) {
		join_others = true;
	}

	if (join_others && this.other_instances.length && this.options.content == 'push') {

		tasks = [];

		tasks.push(function joinMain(next) {
			that._assemble(false).done(next);
		});

		for (i = 0; i < this.other_instances.length; i++) {
			let block = this.other_instances[i];

			tasks.push(function joinOther(next) {

				// Force the "push" option
				block.options.content = 'push';

				block.assemble().done(next);
			});
		}

		return Fn.series(tasks, function joinedAll(err, result) {

			if (err) {
				return;
			}

			return that;
		});
	}

	return Fn.series(this.prepareLineTasks(), function done(err) {

		that.done = true;

		if (err) {
			return;
		}

		if (that.options.content == 'push') {
			let el = that.renderer.createElement('he-block'),
			    i;

			Hawkejs.addClasses(el, that.options.className);

			for (i = 0; i < that.lines.length; i++) {
				el.append(that.lines[i]);
			}

			that.lines = [el];
		}

		return that;
	});
});

/**
 * Prepare the lines of this block
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    2.0.0
 * @version  2.0.0
 *
 * @return   {Array}
 */
BlockBuffer.setMethod(function prepareLineTasks() {

	var that = this,
	    final_tasks = [],
	    pre_tasks = [],
	    tasks = [];

	Hawkejs.recurseLineTasks(this.lines, pre_tasks, tasks, this.renderer);

	let queued_pledge = this.renderer.doQueuedTasks();

	if (queued_pledge) {
		final_tasks.push(queued_pledge);
	}

	if (pre_tasks.length) {
		final_tasks.push(Fn.series(pre_tasks));
	}

	if (tasks.length) {
		final_tasks.push(function doTasks(next) {
			Fn.series(tasks).done(next);
		});
	}

	return final_tasks;
});

/**
 * Activate trim at a specific point
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.3.0
 * @version  1.3.0
 *
 * @param    {Boolean}   left
 * @param    {Boolean}   right
 */
BlockBuffer.setMethod(function trim(left, right) {

	if (arguments.length == 0) {
		left = true;
		right = true;
	}

	if (!this.has_trim) {
		this.has_trim = true;
		this.trims = {};
	}

	this.trims[this.length] = {
		left  : left,
		right : right
	};

	this.push('');
});

/**
 * Trim blank elements before a certain point
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.3.0
 * @version  1.3.0
 */
BlockBuffer.setMethod(function trimBlankElements() {

	if (!this.has_trim_blank) {
		this.has_trim_blank = true;
		this.trim_blanks = {};
	}

	this.trim_blanks[this.length] = true;
	this.push('');
});

/**
 * Should we trim on the left at given index?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.3.0
 * @version  1.3.0
 *
 * @param    {Number}   index
 *
 * @return   {Boolean}
 */
BlockBuffer.setMethod(function shouldTrimLeftAt(index) {

	if (this.has_trim && this.trims[index] && this.trims[index].left) {
		return true;
	}

	return false;
});

/**
 * Should we trim on the right at given index?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.3.0
 * @version  1.3.0
 *
 * @param    {Number}   index
 *
 * @return   {Boolean}
 */
BlockBuffer.setMethod(function shouldTrimRightAt(index) {

	if (this.has_trim && this.trims[index] && this.trims[index].right) {
		return true;
	}

	return false;
});