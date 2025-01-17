## 2.0.0 (WIP)

* Code rewrite
* Templates are now built with a virtual dom

## 1.3.3 (WIP)

* Fix `BlockBuffer#push()` not returning the index of the pushed line
* Backport element attribute serialization fix from 2.0.0
* Allow using simple expressions in templates, without print
* Methods can now be called from within hawkejs expressions

## 1.3.2 (2019-02-18)

* Fix using OR & AND operators in expressions
* Fix adding multiple operators
* Added `HelperCollection` class: helper classes are now only initialized when they're needed
* `BlockBuffer` is no longer a descendant of Array, but has a `lines` array property
* Calling multiple `start()` for the same block with `content: push` on will do as expected
* Fix undrying elements that are not included in the dom
* Call the `retained` method of a custom-element when it's being rendered in a view

## 1.3.1 (2019-01-12)

* Attempt to register the server-side render during scene initialization
* `CustomElement#emit(name, options)` now takes an option object as second argument
* Add `HTMLElement#append()` method
* Add `HTMLElement#insertAdjacentHTML()` method
* Fix `HTMLElement#value` property
* Fix `HTMLElement#innerText` and `HTMLElement#textContent` properties
* Fix `data-` attributes not being removed when changing `dataset` property
* Add `HTMLElement#children` property & fix `#getSiblingByIndex()` and `#insertAfter()`

## 1.3.0 (2018-12-06)

* Add support for native v1 custom-element implementation
* Add `Expression.isTruthy()` method to check if a variable is truthy
* Add `Element#createElement(tag_name)` to create any element with a hawkejs_id
* The basic `HTMLElement` instances can now also be revived when they have a `hawkejs_id`
* Use Protoblast's `Request` class for `Scene#fetch` & `Scene#openUrl`
* Add `Element#enableFocusWithinEvent` & `Element#enableHtmlChangeEvent`
* Fix server-side HTMLElement `value` property implementation
* Add `ViewRender#getBlockByName()` and `ViewRender#active_block`
* Add `trim` expression, to trim away whitespace on left and/or right side
* Make `print` expression smarter
* Don't add the "result" html when json-ifying Placeholder instances
* If `version_info` is available, add it as a GET parameter to stylesheet & template requests
* Use `Blast.fetch` for getting the templates on the client-side
* Make `Scene#serverResponse()` work without an actual XHR instance
* Add server-side `Element#insertAdjacentElement()` and fix `appendChild` and `insertBefore` from not adding the same element twice
* Add server-side `Element#hidden` property support
* Allow calling `CustomElement#setAssignedProperty` with only a function argument
* The on-assigned-data method callbacks will no longer replace the value if it returns a thennable

## 1.2.9 (2018-10-18)

* Fix `CustomElement#setAssignedProperty` with custom setters not having their value set
* Forward some errors to `Scene#handleError(err)`, if it is set
* Only remove custom elements from the browser store a few seconds after it has been introduced
* Don't print whitespaces after code blocks ending with a dash, like `<% -%>`
* Add new, additional template syntax: `{% %}`
* Prevent `CustomElement#attributeChangedCallback()` from firing twice
* Add `Helper#createElement(name)` method
* Emit `opening_url` event when executing `Scene#openUrl()`
* Handle hawkejs-client script loading before the `_initHawkejs` object is present
* Fix `Scene#disableStyle()` to also work on Firefox
* Make `Scene#serverResponse()` callback with an error if response status >= 500

## 1.2.8 (2018-08-27)

* Calling `CustomElement#setAttribute` method will now add itself as a constitutor
* Add `Node` class, let `Element` inherit from it
* Add `Element#queryTabbableElements`
* `hawkejs_init` will now emit with the revived variables, `hawkejs_initing` will emit with the dried variables
* Recursively perform `getContent` on finished blocks & on HTMLElement childnodes
* Fix `setAssignedProperty` replacing the wrong value when a setter is given
* Allow element with class `js-he-unlink` to prevent a custom `js-he-link` from being fired when clicking on it
* Allow disabling moving browser focus by passing `move_browser_focus: false` to `Scene#openUrl`

## 1.2.7 (2018-07-14)

* Upgrade FormData polyfill which fixes some IE11 issues

## 1.2.6 (2018-07-12)

* Fix `Scene#serialize_form(form)` so it correctly serialize checkboxes
* Make `Scene#fetch()` accept with FormData
* Fix exporting the Hawkejs namespace
* `Hawkejs#compile()` now accepts a single string with a template source again

## 1.2.5 (2018-07-04)

* Set `nodeName` and `tagName` in the correct case when using `Hawkejs#createElement`

## 1.2.4 (2018-07-01)

* Add `HTMLElement#isFocusable()` and `HTMLElement#isTabbable()` methods
* Add `HTMLElement#forceFocus()` to force setting focus to an element
* Change focus to the first created block on a page after an AJAX browse
* Use new `RURL` class from `protoblast` version 0.5.7

## 1.2.3 (2018-06-18)

* Emit `hawkejs_scene` event on the Blast object when the scene is being made
* Emit `hawkejs_init` event with the new instance and non-undried init objects
* The temp file created for the client file will now have a 'hawkejs_' prefix and a '.js' suffix
* When manually adding helper files you can now pass the `make_commonjs` option, which will wrap it in a function with `Hawkejs, Blast` arguments
* `JSON-dry` can now directly undry an object, no need to stringify it first
* You can add a `interceptOpenUrl` method on the `Scene` class to intercept open urls
* Add client-side connection checking
* Add `use strict` to all helpers
* Add `module.exports` headers to helpers automatically
* Added `HTMLElement#hasAttribute` method
* Added `HTMLElement#insertBefore` method
* Also wait for objects that have a `whenFinishedOrTimeout` method
* `isVisible` fix: `overflow: auto` also makes a view context
* Custom elements are now stored in the `Hawkejs.Element` namespace
* Allow the use of custom default prefixes in custom elements, instead of "he"
* Helpers are now stored in the `Hawkejs.Helper` namespace
* Prefer "partial" over "element", so added methods like 'ViewRender#print_partial'

## 1.2.2 (2018-01-05)

* Make sure `registerRender` doesn't fail when there is no url
* Fix `Hawkejs.removeClasses` and `Hawkejs.addClasses` so it doesn't crash on a class_name with only whitespace
* Use `decodeURI` when using a `x-history-url` as new url
* Put every class under the `Hawkejs` namespace
* Custom element instances created during a client side render will no longer be re-created when finally inserted into the DOM
* `ViewRender#getId(prefix)` now accepts a prefix, which starts a new number sequence
* Added `Hawkejs.elementHasBeenRegistered(name)`
* `Hawkejs#getSource` will no longer cache template when debugging
* Fix `Hawkejs#load` using `browser` property instead of `client`
* Add dataset polyfill for ancient browsers
* Fix `getFirstAvailableInternalSource` on the client not returning an object
* Use `useragent#lookup` for faster parsing of useragents
* The `Scene#generalView` property is created even before the document is ready
* Custom elements now have a `hawkejs_view` property, so a ViewRender instance can always be accessed
* Custom elements also have a `hawkejs_helpers` property
* Hawkejs block elements are now identified by the 'x-hawkejs' class instead of tag name
* `isVisible` should now work correctly, even in nested scrolls. When no padding is given, it'll even do an occlusion check

## 1.2.1 (2017-08-27)

* Add `Hawkejs.addAttributes(element, attributes)`
* `Scene#fetch` and `Scene#openUrl` will no longer try to parse empty "json" responses. (This happened on Firefox, not on chrome)
* Cookies will use the `secure` flag by default when on a secure page
* Fix memory leak in history implementation
* The 'scene_start' cookie will be set on the url's pathname, not just path (which includes queries)
* `x-history-url` header value will be encoded using `encodeURI`
* The `_initHawkejs` json variable will now escape "</script>" tags

## 1.2.0 (2017-08-11)

* Creating a Helper instance without a view on the server side will no longer throw an error
* `Scene#serverResponse` will now callback with the `ViewRender` instance
* When a dialog is closed by clicking on the wrapper "dialog_close" event will be emitted on the ViewRender instance
* Catch errors made by `Scene#fetch` during `xhr#send`
* `style` calls can now be full urls
* Added `Scene#render` method, which applies the render results to the current scene (`Hawkejs#render` will only render them, without applying)
* Make `js-he-form`s use the `method` attribute, instead of `type`
* The `get` option can now also be a `FormData` instance
* `add_class` calls will now also work in blocks that have been turned into a dialog
* Forms and links with `js-he-close-dialog` as a CSS class will close the parent dialog after their successful request
* `Scene#render` now returns the created ViewRender instance
* Fix: `ViewRender#beginRender` now actually waits for the emitted 'begin' events to finish. This used to cause race conditions.
* Setting a pagetitle can now be done with an object supporting `getContent` and `toHawkejsString`
* Fix `Scene#scrollTo` not working at all
* Don't scroll to anything when an openUrl call results in a dialog being made.
* Add `ViewRender#showDialog` which can add dialogs from the server side
* Call `Scene#ajaxify` after emitting the created events (so clicks can be prevented)
* Strip HTML tags before setting the page title element
* Dialog wrappers will now use z-index of 998, 9000 less than before
* The client-side `doExtensions` method will now also `changeMain` block when extending
* Client-side extensions will now also work when extending a dialog
* Hawkejs elements now can also have a "data-entry-template", indicating which templated was the original entry point
* Bump version to 1.2.0, as there are too many breaking changes
* Also remove `h_diversion` and `htop` from history urls
* When using `Scene#scrollTo` without any parameters, just scroll to the top immediately
* Add `Hawkejs#delayReady` which is intended to be used in "onclick" attributes
* Fix some isVisible handling
* Fix the `Helper#parseURL` method
* Add simple code to get rid of dialogs when using back button (needs rework)
* Added another attempt to fix scrollTo
* The default `scrollTo` duration can be overwritten by exposing `default_scrollto_duration`

## 1.1.3 (2017-04-17)

* Add `Templates#name` property
* Add `assigns` property to `ViewRender#toJson()`
* Add `Hawkejs.removeClasses`
* `className`s set in `assign()` options will remain on the block,
  `className`s set in a `start()` call will be removed when a new `start()` is issued
* `querySelectorAll` results don't have a `forEach` method in Edge, so fix that
* Fix race condition in `Hawkejs#createClientFile`
* Fix `Hawkejs#require` not honouring path property on the client side
* Add dialog css as style element
* Bundle client-side template requests

## 1.1.2 (2017-01-21)

* Added `add_class` method to add CSS classnames to a Hawkejs element
* `Element#reload` will now render the correct theme of template
* Elements with the `data-update-request` attribute will only get the
  click/change listener once
* CustomElements will be registered once all the Hawkejs code has executed
* Fixed calling of `CustomElement#undried`
* Renamed CustomElements `attachments` to `assigned_data`
* `CustomElement#attach` is now `CustomElement#assignData`
* Added `CustomElement#emit` to emit a custom browser event
* Added `CustomElement#connectedCallback` functionality
* Scene view helpers will be created before scripts are requested
* `Scene#appears` now also accepts elements and array of elements
* History url can also be changed on initial page load with exposed `redirected_to`
* Input elements with `data-update-location` will `openUrl` on change
* Make `wheel` and `click` listeners passive

## 1.1.1 (2016-10-04)

* Stylesheet theme support
* Client files: remove code between "//HAWKEJS START CUT" and "//HAWKEJS END CUT"
* Client files can now be non-commonjs formatted (using `is_commonjs` set to false)
* Client files no longer use the entire file path as an identifier

## 1.1.0 (2016-06-27)

* Improve template error reporting
* Integrate custom elements
* Work with HTMLElements

## 1.0.0

* Complete rewrite
* Remove DOM-style rendering from the server
* Live-data binding

## 0.1.1 (2014-06-10)

* Add custom 'x-hawkejs-request' header to GETs and POST requests
* Add Mozilla's localforage library
* Expose the ejs renderer via hawkejs.ejs
* Upgrade the History library to version 4.0.9
* Add LZ-String and use it to compresses History API payloads that are too big
  for certain browsers (IE & Firefox).
  This slows down the browser, an asynchronous web-worker solution should be
  sought after next.
* If it is given, use the 'X-History-Url' response header as the url to
  register with the HTML5 History API.
* Emit viewready event after render or pageload
* Upgrade DOMSpot to 0.1.0
* Don't use the History API on forms that have the 'data-no-history' attribute
* Update History.js to version v4.1.0, fixes some Firefox security errors

## 0.1.0 (2014-03-12)

* Submit POSTs as JSON instead of urlencoded strings
* Use TJ Holowaychuk's querystring code to convert a form to an object.
  This makes it perfectly compatible to express, where the same code is used.

## 0.0.15 (2014-03-11)

* Add events for created 'implementations'. Still need to add them for destroyed
  ones, too.
* Revert to jQuery 1.8 on the server side
* Add DOMSpot for ClientSide usage

## 0.0.14 (2014-02-28)

* Upgrade ejs from 0.8.3 to 0.8.5, an upgrade that needed some tweaking.
* Also upgrade cheerio, entities and jquery

## 0.0.13 (2014-02-18)

* Don't thrown an error when _EjsRender returns an empty string after render,
  sometimes that's just what needs to happen.
* Fix the History API implementation.
  Some functions were modified in a way nothing happened anymore on pressing the
  back & next buttons.
  The 'historyChange' event is also emitted after the state has been applied.

## 0.0.12 (2014-02-16)

* Add getObjectPath function, which takes an object and a string and uses that
  string as a path to look for in the object

## 0.0.11 (2014-02-05)

* Add uneval function. Right now it only correctly uneval's functions,
  but more is to come.
* Script tag names are no longer prefixed with 'hawkejs' because it messed up
  encoding of chars like '<'. To not have the scripts run too soon,
  jQuery's .parseHTML is used.
* Replace hawkejs.µ with hawkejs.utils, as it caused encoding problems.
* Add a new jQuery converter setting for json-dry strings
* Hawkejs event listener now allows you to pass an array of queries or strings
* Add hawkejs.downloadAjax function, which allows the user to POST data to the
  server and download the file, as if via AJAX. Even allows callback functions
  (for when download begins) if the server supports it.
  Inspired by this stackoverflow question:
  http://stackoverflow.com/questions/1106377/detect-when-browser-receives-file-download
* Add formify function, which turns an object into key-value pairs fitted for
  form submission

## 0.0.10 (2014-01-21)

* Many new functions & helpers
* Partial rewrite of the script & asset helpers
* Expose vendor folder for client side
* The expands() helper now accepts an array of string
* Add serial drones
* Allow links to have no content text
* Improve url matching & add greedy matching
* Make sure links created by add_link have unique ids
* Emit events when a script is added
* Make ejsrender return more data if requested
* Add order & treeify functions
* Add json-dry functions (json with support for dates & regexes)
* Add pr() function for debugging

## 0.0.9 (2013-10-15)

* Use cheerio 0.12.2 because of a bug in 0.12.3

## 0.0.2 (2013-01-21)

* client side rendering produces the same html code as the server

## 0.0.1 (2013-01-21)

* first push to npm after +/- 31 hours of development