var has_within_event = Symbol('has_within_event'),
    has_html_event = Symbol('has_html_event'),
    has_focus = Symbol('has_focus'),
    ProtoEl,
    Element,
    m_proto;

if (typeof HTMLElement == 'undefined') {
	Element = Hawkejs.HTMLElement;
	ProtoEl = Hawkejs.HTMLElement.prototype;
	m_proto = __Protoblast.modifyPrototype;

	if (!m_proto) {
		__Protoblast.modifyPrototype = true;
	}
} else {
	Element = 'Element';
	ProtoEl = Blast.Collection.Element.prototype;
}

/**
 * The the index of this element inside its parent
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.3
 * @version  1.2.3
 *
 * @return   {Number}
 */
Blast.definePrototype(Element, 'getIndexInParent', function getIndexInParent() {

	var i;

	if (!this.parentElement) {
		return -1;
	}

	for (i = 0; i < this.parentElement.children.length; i++) {
		if (this.parentElement.children[i] == this) {
			return i;
		}
	}

	return -1;
});

/**
 * Get the sibling of the given index
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.3
 * @version  1.3.1
 *
 * @param    {Number}   index
 *
 * @return   {HTMLElement}
 */
Blast.definePrototype(Element, 'getSiblingByIndex', function getSiblingByIndex(index) {
	return this.parentElement.children[index];
});

/**
 * Insert the new node after the given reference node
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.3
 * @version  1.3.1
 *
 * @param    {HTMLElement}   new_node
 * @param    {HTMLElement}   reference_node
 *
 * @return   {HTMLElement}
 */
Blast.definePrototype(Element, 'insertAfter', function insertAfter(new_node, reference_node) {

	if (reference_node) {
		reference_node = reference_node.nextSibling;
	}

	if (!reference_node) {
		return this.append(new_node);
	}

	return this.insertBefore(new_node, reference_node);
});

/**
 * Move this element after the reference node
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.3
 * @version  1.2.3
 *
 * @param    {HTMLElement}   reference_node
 *
 * @return   {HTMLElement}
 */
Blast.definePrototype(Element, 'moveAfterElement', function moveAfterElement(reference_node) {
	return this.parentElement.insertAfter(this, reference_node);
});

/**
 * Move this element before the reference node
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.3
 * @version  1.2.3
 *
 * @param    {HTMLElement}   reference_node
 *
 * @return   {HTMLElement}
 */
Blast.definePrototype(Element, 'moveBeforeElement', function moveBeforeElement(reference_node) {
	return this.parentElement.insertBefore(this, reference_node);
});

/**
 * Move this element to the given index in it's parent
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.3
 * @version  1.2.3
 *
 * @param    {Number}   index
 *
 * @return   {HTMLElement}
 */
Blast.definePrototype(Element, 'setIndexInParent', function setIndexInParent(index) {

	var existing,
	    current;

	if (index < 0) {
		return;
	}

	// Get the current index
	current = this.getIndexInParent();

	// Get the element at the new index
	existing = this.getSiblingByIndex(index);

	if (index > current) {
		return this.moveAfterElement(existing);
	} else {
		return this.moveBeforeElement(existing);
	}
});

/**
 * Move this element by the given amount
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.3
 * @version  1.2.3
 *
 * @param    {Number}   direction
 *
 * @return   {HTMLElement}
 */
Blast.definePrototype(Element, 'incrementIndexInParent', function incrementIndexInParent(direction) {
	var new_index;

	if (!direction) {
		return;
	}

	new_index = this.getIndexInParent() + direction;

	if (new_index < 0) {
		new_index = 0;
	}

	return this.setIndexInParent(new_index);
});

/**
 * Transfer styles to another element
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.3
 * @version  1.2.3
 *
 * @param    {HTMLElement}   target
 * @param    {Array}         properties
 *
 * @return   {HTMLElement}
 */
Blast.definePrototype(Element, 'transferStylesTo', function transferStylesTo(target, properties) {

	var styles = window.getComputedStyle(this),
	    i;

	if (!properties) {
		properties = styles;
	}

	for (i = 0; i < properties.length; i++) {
		key = properties[i];
		target.style[key] = styles[key];
	}
});

/**
 * Can this element be focused?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.4
 * @version  1.2.4
 *
 * @return   {Boolean}
 */
Blast.definePrototype(Element, 'isFocusable', function isFocusable() {

	// Any tabindex value means this element can be focused
	if (this.hasAttribute('tabindex') || this.hasAttribute('contentEditable')) {
		return true;
	}

	switch (this.nodeName) {
		case 'A':
		case 'AREA':
			return this.hasAttribute('href');

		case 'INPUT':
		case 'SELECT':
		case 'TEXTAREA':
		case 'BUTTON':
			return !this.hasAttribute('disabled');

		case 'IFRAME':
		case 'BODY':
		case 'EMBED':
		case 'OBJECT':
			return true;
	}

	return false;
});

/**
 * Can this element be tabbed to?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.4
 * @version  1.2.4
 *
 * @return   {Boolean}
 */
Blast.definePrototype(Element, 'isTabbable', function isTabbable() {

	var tabindex;

	if (!ProtoEl.isFocusable.call(this)) {
		return false;
	}

	tabindex = this.getAttribute('tabindex');

	if (tabindex && tabindex[0] == '-') {
		return false;
	}

	return true;
});

/**
 * Force changing focus to this element.
 * (Prevents scrolling by default)
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.4
 * @version  1.2.4
 *
 * @param    {Object}   options
 */
Blast.definePrototype(Element, 'forceFocus', function forceFocus(options) {

	var prevent_scroll,
	    x,
	    y;

	if (!ProtoEl.isFocusable.call(this)) {
		this.setAttribute('tabindex', '-1');
	}

	if (!options || options.preventScroll) {
		prevent_scroll = true;
		x = window.scrollX;
		y = window.scrollY;
	}

	this.focus();

	if (prevent_scroll) {
		window.scrollTo(x, y);
	}
});

/**
 * Query for tabbable elements
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.2.8
 * @version  1.2.8
 *
 * @return   {Array}
 */
Blast.definePrototype(Element, 'queryTabbableElements', function queryTabbableElements(query) {

	var elements,
	    results = [],
	    element,
	    i;

	if (query) {
		elements = this.querySelectorAll(query);
	} else {
		// Get all tabbable elements
		elements = this.querySelectorAll('a, area, input, select, textarea, button, iframe, body, embed, object, [contenteditable], [tabindex]');
	}

	for (i = 0; i < elements.length; i++) {
		element = elements[i];

		if (element.isTabbable()) {
			results.push(element);
		}
	}

	return results;
});

/**
 * Query parents
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    2.0.0
 * @version  2.0.0
 *
 * @param    {String}   query
 *
 * @return   {HTMLElement}
 */
Blast.definePrototype(Element, 'queryParents', function queryParents(query) {

	var current = this.parentElement;

	while (current) {
		if (current.matches(query)) {
			return current;
		}

		current = current.parentElement;
	}

});

/**
 * Add focus-within & focus-without events:
 * focus-within fires once when the element or any of its children gets focus.
 * focus-without fires when all of them lose focus.
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.3.0
 * @version  1.3.0
 */
Blast.definePrototype(Element, 'enableFocusWithinEvent', function enableFocusWithinEvent() {

	var that = this;

	if (this[has_within_event]) {
		return;
	}

	// Listen for focusin event: when this or any child gets focus
	this.addEventListener('focusin', function onFocusin(e) {

		if (!that[has_focus]) {
			that[has_focus] = true;
			Hawkejs.Element.Element.prototype.emit.call(this, 'focus-within');
		}

	});

	// Listen for focusout event
	this.addEventListener('focusout', function onFocusout(e) {

		// Don't react to children
		if (that.contains(e.relatedTarget)) {
			return;
		}

		that[has_focus] = false;
		Hawkejs.Element.Element.prototype.emit.call(this, 'focus-without');
	});
});

/**
 * Add html-change event:
 * will fire after focus-without if the content has changed
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.3.0
 * @version  1.3.0
 */
Blast.definePrototype(Element, 'enableHtmlChangeEvent', function enableHtmlChangeEvent() {

	var that = this,
	    old_html;

	if (this[has_html_event]) {
		return;
	}

	this.enableFocusWithinEvent();

	// Get the initial HTML contents
	old_html = this.innerHTML;

	this.addEventListener('focus-within', function onWithin() {
		old_html = that.innerHTML;
	});

	this.addEventListener('focus-without', function onWithout() {

		if (that.innerHTML != old_html) {
			Hawkejs.Element.Element.prototype.emit.call(this, 'html-change');
		}
	});
});

if (m_proto === false) {
	__Protoblast.modifyPrototype = false;
}