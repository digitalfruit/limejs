/*
 * Copyright 2008 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Utility functions and classes for Soy.
//
// The top portion of this file contains utilities for Soy users:
//   + soy.StringBuilder: Compatible with the 'stringbuilder' code style.
//   + soy.renderElement: Render template and set as innerHTML of an element.
//   + soy.renderAsFragment: Render template and return as HTML fragment.
//
// The bottom portion of this file contains utilities that should only be called
// by Soy-generated JS code. Please do not use these functions directly from
// your hand-writen code. Their names all start with '$$'.

goog.provide('soy');
goog.provide('soy.StringBuilder');

goog.require('goog.dom');
goog.require('goog.format');
goog.require('goog.i18n.BidiFormatter');
goog.require('goog.i18n.bidi');
goog.require('goog.string');
goog.require('goog.string.StringBuffer');


// -----------------------------------------------------------------------------
// StringBuilder (compatible with the 'stringbuilder' code style).


/**
 * Utility class to facilitate much faster string concatenation in IE,
 * using Array.join() rather than the '+' operator.  For other browsers
 * we simply use the '+' operator.
 *
 * @param {Object} var_args Initial items to append,
 *     e.g., new soy.StringBuilder('foo', 'bar').
 * @constructor
 */
soy.StringBuilder = goog.string.StringBuffer;


// -----------------------------------------------------------------------------
// Public utilities.


/**
 * Helper function to render a Soy template and then set the output string as
 * the innerHTML of an element. It is recommended to use this helper function
 * instead of directly setting innerHTML in your hand-written code, so that it
 * will be easier to audit the code for cross-site scripting vulnerabilities.
 *
 * @param {Element} element The element whose content we are rendering.
 * @param {Function} template The Soy template defining the element's content.
 * @param {Object=} opt_templateData The data for the template.
 */
soy.renderElement = function(element, template, opt_templateData) {
  element.innerHTML = template(opt_templateData);
};


/**
 * Helper function to render a Soy template into a single node or a document
 * fragment. If the rendered HTML string represents a single node, then that
 * node is returned. Otherwise a document fragment is returned containing the
 * rendered nodes.
 *
 * @param {Function} template The Soy template defining the element's content.
 * @param {Object=} opt_templateData The data for the template.
 * @return {Node} The resulting node or document fragment.
 */
soy.renderAsFragment = function(template, opt_templateData) {
  return goog.dom.htmlToDocumentFragment(template(opt_templateData));
};


// -----------------------------------------------------------------------------
// Below are private utilities to be used by Soy-generated code only.


/**
 * Builds an augmented data object to be passed when a template calls another,
 * and needs to pass both original data and additional params. The returned
 * object will contain both the original data and the additional params. If the
 * same key appears in both, then the value from the additional params will be
 * visible, while the value from the original data will be hidden. The original
 * data object will be used, but not modified.
 *
 * @param {!Object} origData The original data to pass.
 * @param {Object} additionalParams The additional params to pass.
 * @return {Object} An augmented data object containing both the original data
 *     and the additional params.
 */
soy.$$augmentData = function(origData, additionalParams) {

  // Create a new object whose '__proto__' field is set to origData.
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = origData;
  var newData = new tempCtor();

  // Add the additional params to the new object.
  for (var key in additionalParams) {
    newData[key] = additionalParams[key];
  }

  return newData;
};


/**
 * Escapes HTML special characters in a string. Escapes double quote '"' in
 * addition to '&', '<', and '>' so that a string can be included in an HTML
 * tag attribute value within double quotes.
 *
 * @param {*} str The string to be escaped. Can be other types, but the value
 *     will be coerced to a string.
 * @return {string} An escaped copy of the string.
*/
soy.$$escapeHtml = function(str) {
  return goog.string.htmlEscape(String(str));
};


/**
 * Escapes characters in the string to make it a valid content for a JS string literal.
 *
 * @param {*} s The string to be escaped. Can be other types, but the value
 *     will be coerced to a string.
 * @return {string} An escaped copy of the string.
*/
soy.$$escapeJs = function(s) {
  s = String(s);
  var sb = [];
  for (var i = 0; i < s.length; i++) {
    sb[i] = goog.string.escapeChar(s.charAt(i));
  }
  return sb.join('');
};


/**
 * Escapes a string so that it can be safely included in a URI
 *
 * @param {*} str The string to be escaped. Can be other types, but the value
 *     will be coerced to a string.
 * @return {string} An escaped copy of the string.
*/
soy.$$escapeUri = function(str) {
  return goog.string.urlEncode(String(str));
};


/**
 * Inserts word breaks ('wbr' tags) into a HTML string at a given interval. The
 * counter is reset if a space is encountered. Word breaks aren't inserted into
 * HTML tags or entities. Entites count towards the character count; HTML tags
 * do not.
 *
 * @param {*} str The HTML string to insert word breaks into. Can be other
 *     types, but the value will be coerced to a string.
 * @param {number} maxCharsBetweenWordBreaks Maximum number of non-space
 *     characters to allow before adding a word break.
 * @return {string} The string including word breaks.
 */
soy.$$insertWordBreaks = function(str, maxCharsBetweenWordBreaks) {
  return goog.format.insertWordBreaks(String(str), maxCharsBetweenWordBreaks);
};


/**
 * Converts \r\n, \r, and \n to <br>s
 * @param {*} str The string in which to convert newlines.
 * @return {string} A copy of {@code str} with converted newlines.
 */
soy.$$changeNewlineToBr = function(str) {
  return goog.string.newLineToBr(String(str), false);
};


/**
 * Cache of bidi formatter by context directionality, so we don't keep on
 * creating new objects.
 * @type {Object}
 * @private
 */
soy.$$bidiFormatterCache_ = {};


/**
 * Returns cached bidi formatter for bidiGlobalDir, or creates a new one.
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @return {goog.i18n.BidiFormatter} A formatter for bidiGlobalDir.
 * @private
 */
soy.$$bidiFormatterInstance_ = function(bidiGlobalDir) {
  return soy.$$bidiFormatterCache_[bidiGlobalDir] ||
         (soy.$$bidiFormatterCache_[bidiGlobalDir] =
             new goog.i18n.BidiFormatter(bidiGlobalDir));
};


/**
 * Estimate the overall directionality of text. If opt_isHtml, makes sure to
 * ignore the LTR nature of the mark-up and escapes in text, making the logic
 * suitable for HTML and HTML-escaped text.
 * @param {string} text The text whose directionality is to be estimated.
 * @param {boolean=} opt_isHtml Whether text is HTML/HTML-escaped.
 *     Default: false.
 * @return {number} 1 if text is LTR, -1 if it is RTL, and 0 if it is neutral.
 */
soy.$$bidiTextDir = function(text, opt_isHtml) {
  if (!text) {
    return 0;
  }
  return goog.i18n.bidi.detectRtlDirectionality(text, opt_isHtml) ? -1 : 1;
};


/**
 * Returns "dir=ltr" or "dir=rtl", depending on text's estimated
 * directionality, if it is not the same as bidiGlobalDir.
 * Otherwise, returns the empty string.
 * If opt_isHtml, makes sure to ignore the LTR nature of the mark-up and escapes
 * in text, making the logic suitable for HTML and HTML-escaped text.
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @param {string} text The text whose directionality is to be estimated.
 * @param {boolean=} opt_isHtml Whether text is HTML/HTML-escaped.
 *     Default: false.
 * @return {string} "dir=rtl" for RTL text in non-RTL context; "dir=ltr" for LTR
 *     text in non-LTR context; else, the empty string.
 */
soy.$$bidiDirAttr = function(bidiGlobalDir, text, opt_isHtml) {
  var formatter = soy.$$bidiFormatterInstance_(bidiGlobalDir);
  return formatter.dirAttr(text, opt_isHtml);
};


/**
 * Returns a Unicode BiDi mark matching bidiGlobalDir (LRM or RLM) if the
 * directionality or the exit directionality of text are opposite to
 * bidiGlobalDir. Otherwise returns the empty string.
 * If opt_isHtml, makes sure to ignore the LTR nature of the mark-up and escapes
 * in text, making the logic suitable for HTML and HTML-escaped text.
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @param {string} text The text whose directionality is to be estimated.
 * @param {boolean=} opt_isHtml Whether text is HTML/HTML-escaped.
 *     Default: false.
 * @return {string} A Unicode bidi mark matching bidiGlobalDir, or
 *     the empty string when text's overall and exit directionalities both match
 *     bidiGlobalDir.
 */
soy.$$bidiMarkAfter = function(bidiGlobalDir, text, opt_isHtml) {
  var formatter = soy.$$bidiFormatterInstance_(bidiGlobalDir);
  return formatter.markAfter(text, opt_isHtml);
};


/**
 * Returns str wrapped in a <span dir=ltr|rtl> according to its directionality -
 * but only if that is neither neutral nor the same as the global context.
 * Otherwise, returns str unchanged.
 * Always treats str as HTML/HTML-escaped, i.e. ignores mark-up and escapes when
 * estimating str's directionality.
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @param {*} str The string to be wrapped. Can be other types, but the value
 *     will be coerced to a string.
 * @return {string} The wrapped string.
 */
soy.$$bidiSpanWrap = function(bidiGlobalDir, str) {
  var formatter = soy.$$bidiFormatterInstance_(bidiGlobalDir);
  return formatter.spanWrap(str + '', true);
};


/**
 * Returns str wrapped in Unicode BiDi formatting characters according to its
 * directionality, i.e. either LRE or RLE at the beginning and PDF at the end -
 * but only if str's directionality is neither neutral nor the same as the
 * global context. Otherwise, returns str unchanged.
 * Always treats str as HTML/HTML-escaped, i.e. ignores mark-up and escapes when
 * estimating str's directionality.
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @param {*} str The string to be wrapped. Can be other types, but the value
 *     will be coerced to a string.
 * @return {string} The wrapped string.
 */
soy.$$bidiUnicodeWrap = function(bidiGlobalDir, str) {
  var formatter = soy.$$bidiFormatterInstance_(bidiGlobalDir);
  return formatter.unicodeWrap(str + '', true);
};
