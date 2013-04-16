goog.provide('lime.style');
goog.provide('lime.style.Transform');

goog.require('goog.dom');
goog.require('goog.style');
goog.require('lime.userAgent');

(function() {

var prefix = goog.userAgent.WEBKIT ? 'Webkit' :
             goog.userAgent.GECKO ? 'Moz' :
             goog.userAgent.OPERA ? 'O' :
             goog.userAgent.IE ? 'ms' : '';

var testDivStyle = goog.dom.createDom('div').style;

lime.style.transformProperty = '-' + prefix.toLowerCase() + '-transform';

/**
 * Try if a CSS style property with given name exists
 * @param {string} name Property name.
 * @return {boolean|string} If property exists.
 */
lime.style.tryProperty = function(name) {
    return testDivStyle[name] !== undefined ? name : false;
};

/**
 * Get the name of actual CSS property from general(unprefixed) name
 * @param {string} name Unprefixed name.
 * @return {string} Actual valid property name.
 */
lime.style.getCSSproperty = function(name) {
    var name_lower = name.charAt(0).toLowerCase() + name.substr(1),
        prefix_name = prefix + name;
    return lime.style.tryProperty(name) ?
        name : (lime.style.tryProperty(name_lower)  ?
                name_lower : lime.style.tryProperty(prefix_name) ?
                prefix_name : undefined );
};

})();

/**
 * Set border radius of a DOM element
 * @param {Element} el Element to change.
 * @param {Array.<number>} values Radius values.
 * @param {Array.<number>=} opt_vertical Vertical radius values.
 * @param {boolean=} opt_isPerc If values are given in percentages.
 */
lime.style.setBorderRadius = (function() {
    var stylename = lime.style.getCSSproperty('BorderRadius');
    var out = function(values, unit) {
        return (goog.isArray(values) ? values.join(unit + ' ') : values) + unit;
    };
    return function(el, values, opt_vertical, opt_isPerc) {
        var unit = opt_isPerc ? '%' : 'px';
        var vertical = goog.isDef(opt_vertical) ? opt_vertical : values;
        var value = out(values, unit) + '/' + out(vertical, unit);
        if (value != el.border_radius_cache_) {
            el.style[stylename] = el.border_radius_cache_ = value;
        }
    };
})();

// There are classes like CSSMatrix in some browsers.
// Maybe this would make more sense.

/**
 * Object representing CSS Transform.
 * @constructor
 * @param {number=} opt_precision Default precision.
 */
lime.style.Transform = function(opt_precision) {
    this.values = [];
    this.precision = 1;
    this.enable3D_ = true;
    if (this.opt_precision) {
        this.setPrecision(/** @type {number} */ (opt_precision));
    }
};

/**
 * Sets 3D enabling flag for css hardware acceleration (on by default)
 * @param {Boolean} value
 * @return {lime.style.Transform} object itself.
 */
lime.style.Transform.prototype.set3DAllowed = function(value) {
    this.enable3D_ = value;
    return this;
};

/**
 * Scale current transform object
 * @param {number} sx X-axis scale factor.
 * @param {number} sy y-axis scale factor.
 * @return {lime.style.Transform} object itself.
 */
lime.style.Transform.prototype.scale = function(sx, sy) {
    //if(sx!=1 && sy!=1)
    this.values.push('scale(' + sx + ',' + sy + ')');
    return this;
};

/**
 * Rotate current transform object
 * @param {number} angle Angle to rotate.
 * @param {string=} opt_unit Units. Defaults to degrees.
 * @return {lime.style.Transform} object itself.
 */
lime.style.Transform.prototype.rotate = function(angle, opt_unit) {
    var rot_str;

    if (this.enable3D_ && (lime.userAgent.IOS || lime.userAgent.PLAYBOOK)) {
        rot_str = 'rotate3d(0, 0, 1, ' + angle + (opt_unit ? opt_unit : 'deg') + ')';
    } else {
        rot_str = 'rotate(' + angle + (opt_unit ? opt_unit : 'deg') + ')';
    }
    if (angle != 0)
        this.values.push(rot_str);

    return this;
};

/**
 * Translate(move) current transform object
 * @param {number} tx Offset in x-axis.
 * @param {number} ty Offset in y-axis.
 * @param {number=} opt_tz Offset in z-axis.
 * @return {lime.style.Transform} object itself.
 */
lime.style.Transform.prototype.translate = function(tx, ty, opt_tz) {

    var p = 1 / this.precision;
    var val = 'translate';

    if (this.enable3D_ && (lime.userAgent.IOS || lime.userAgent.PLAYBOOK)) {
        val += '3d';
    }
    val += '(' + (tx * p) + 'px,' + (ty * p) + 'px';
    if (this.enable3D_ && (lime.userAgent.IOS || lime.userAgent.PLAYBOOK)) {
        val += ',' + ((opt_tz ? opt_tz : 0) * p) + 'px';
    }
    this.values.push(val + ')');
    
    return this;
};

/**
 * Set the current precision of transform. This is handled as a
 * state machine so it's added when called not when done.
 * @param {number} p Precision(Lowest value to make a difference).
 * @return {lime.style.Transform} object itself.
 */
lime.style.Transform.prototype.setPrecision = function(p) {
    if (this.precision != 1) {
        var opposite = 1 / this.precision;
        this.scale(opposite, opposite);
        this.precision = 1;
    }
    if (p != 1) {
        this.scale(p, p);
        this.precision = p;
    }
    return this;
};

/**
 * Return CSS transform string from the object
 * @return {string} CSS value string.
 */
lime.style.Transform.prototype.toString = function() {
    if (this.precision != 1) {
        this.setPrecision(1);
    }
    return this.values.join(' ');
};

/**
 * Set transform to a DOM element.
 * @param {Element} el Element to change.
 * @param {lime.style.Transform} transform Transform.
 */
lime.style.setTransform = (function() {
    var stylename = lime.style.getCSSproperty('Transform');
    return function(el, transform) {
        var value = transform.toString();
        
        if (value != el.transform_cache_) {
            el.style[stylename] = el.transform_cache_ = value;
        }
        lime.transformSet_=1;
        
    };
})();

/**
 * Set transform origin point for a DOM element.
 * @param {Element} el Element to change.
 * @param {number} ox X Offset.
 * @param {number} oy Y Offset.
 * @param {boolean=} opt_isPerc If unit is percentage.
 */
lime.style.setTransformOrigin = (function() {
    var stylename = lime.style.getCSSproperty('TransformOrigin');
    return function(el, ox, oy, opt_isPerc) {
        var unit = opt_isPerc ? '%' : 'px';
        var value = ox + unit + ' ' + oy + unit;
        if (value != el.transform_origin_cache_) {
            el.style[stylename] = el.transform_origin_cache_ = value;
        }
    };
})();

(function(){
var stylename = lime.style.getCSSproperty('Transition');
lime.style.isTransitionsSupported = !!stylename && !goog.userAgent.OPERA;
// Opera's CSS3 transitions seem to be unstable atm. No shorthand plus
// doesn't work if the duration property has not been previously set inside
// CSS style sheet @tonis

var clearProp = function(str, prop) {
    if (!str.length) return str;
    var proplist = str.split('),');
    for (var i = 0; i < proplist.length - 1; i++) {
        proplist[i] += ')';
    }

    proplist = goog.array.filter(proplist, function(part) {
               return part.indexOf(prop) == -1;
   });
    return proplist.join(',');
};

/**
 * Activate transition rule for a property
 * @param {Element} el Element to change.
 * @param {string} property Transition property name.
 * @param {number} time Transition duration.
 * @param {lime.animation.EasingFunction} ease Easing function.
 */
lime.style.setTransition = function(el, property, time, ease) {
    if (!stylename) return;
    var curvalue = clearProp(el.style[stylename], property);
    if (curvalue.length) curvalue += ', ';
    //console.log(time+'s cubic-bezier('+ease[1]+',
    //'+ease[2]+','+ease[3]+','+ease[4]+')');
    curvalue += property + ' ' + time + 's cubic-bezier(' + ease[1] +
        ',' + ease[2] + ',' + ease[3] + ',' + ease[4] + ')';
    el.style[stylename] = curvalue;
};

/**
 * Clear previously set transition rule.
 * @param {Element} el Element to change.
 * @param {string} property Transition property name.
 */
lime.style.clearTransition = function(el, property) {
    if (!stylename || !el) return;
    el.style[stylename] = clearProp(el.style[stylename], property);

   // console.log('clear',el.style[stylename],property);
};

/**
 * Change size of a DOM element. Has cache built in for speed boost.
 * @param {Element} el Element to change.
 * @param {number} w New width.
 * @param {number} h New height.
 */
lime.style.setSize = function(el, w, h) {
    if (el.width_cache_ != w || el.height_cache_ != h) {
        el.width_cache_ = w;
        el.height_cache_ = h;
        return goog.style.setSize(el, w, h);
    }
    return undefined;
};
})();
