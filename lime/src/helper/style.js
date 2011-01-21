goog.provide('lime.style');
goog.provide('lime.style.Transform');

goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.userAgent');

(function() {

var prefix = goog.userAgent.WEBKIT ? 'Webkit' :
             goog.userAgent.GECKO ? 'Moz' :
             goog.userAgent.OPERA ? 'O' :
             goog.userAgent.IE ? 'ms' : '';

var testDivStyle = goog.dom.createDom('div').style;

lime.style.transformProperty = '-' + prefix.toLowerCase() + '-transform';

lime.style.tryProperty = function(name) {
    return testDivStyle[name] !== undefined ? name : false;
};

lime.style.getCSSproperty = function(name) {
    return lime.style.tryProperty(name) ?
        name : lime.style.tryProperty(prefix + name);
};

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
    }
})();

// There are classes like CSSMatrix in some browsers.
// Maybe this would make more sense.

lime.style.Transform = function(opt_precision) {
    this.values = [];
    this.precision = 1;
    if (this.opt_precision) {
        this.setPrecision(opt_precision);
    }
};

lime.style.Transform.prototype.scale = function(sx, sy) {
    //if(sx!=1 && sy!=1)
    this.values.push('scale(' + sx + ',' + sy + ')');
    return this;
};

lime.style.Transform.prototype.rotate = function(angle, opt_unit) {
    var rot_str = 'rotate(' + angle + (opt_unit ? opt_unit : 'deg') + ')';
    if (angle != 0)
        this.values.push(rot_str);
    return this;
};
(function(){
    
// android doesn't scale when translate3d has been used    
var ios = (/(ipod|iphone|ipad)/i).test(navigator.userAgent);
    
lime.style.Transform.prototype.translate = function(tx, ty, opt_tz) {
    
    var p = 1 / this.precision;
    var val = 'translate';
    if (ios) val += '3d';
    val += '(' + (tx * p) + 'px,' + (ty * p) + 'px';
    if (ios) val += ',' + ((opt_tz ? opt_tz : 0) * p) + 'px';
    this.values.push(val + ')');
    return this;
};
})();
lime.style.Transform.prototype.setPrecision = function(p) {return this;
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

lime.style.Transform.prototype.toString = function() {
    if (this.precision != 1) {
        this.setPrecision(1);
    }
    return this.values.join(' ');
};

lime.style.setTransform = (function() {
    var stylename = lime.style.getCSSproperty('Transform');
    return function(el, transform) {
        var value = transform.toString();
        if (value != el.transform_cache_) {
            el.style[stylename] = el.transform_cache_ = value;
            //console.log('transform'+stylename+el.style[stylename]);
        }
    }
})();

lime.style.setTransformOrigin = (function() {
    var stylename = lime.style.getCSSproperty('TransformOrigin');
    return function(el, ox, oy, opt_isPerc) {
        var unit = opt_isPerc ? '%' : 'px';
        var value = ox + unit + ' ' + oy + unit;
        if (value != el.transform_origin_cache_) {
            el.style[stylename] = el.transform_origin_cache_ = value;
        }
    }
})();


var stylename = lime.style.getCSSproperty('Transition');
lime.style.isTransitionsSupported = !!stylename;

var clearProp = function(str, prop) {
    if (!str.length) return str;
    var proplist = str.split('),');
    for(var i=0;i<proplist.length-1;i++){
        proplist[i]+=')';
    }
    
    proplist = goog.array.filter(proplist, function(part) {
               return part.indexOf(prop) == -1;
   });
    return proplist.join(',');
};

lime.style.setTransition = function(el, property, time, ease) {
    if (!stylename) return;
    var curvalue = clearProp(el.style[stylename], property);
    if (curvalue.length) curvalue += ', ';
    //console.log(time+'s cubic-bezier('+ease[1]+','+ease[2]+','+ease[3]+','+ease[4]+')');
    curvalue += property + ' ' + time + 's cubic-bezier('+ease[1]+','+ease[2]+','+ease[3]+','+ease[4]+')';
    el.style[stylename] = curvalue;
};

lime.style.clearTransition = function(el, property) {
    if (!stylename || !el) return;
    el.style[stylename] = clearProp(el.style[stylename], property);
    
   // console.log('clear',el.style[stylename],property);
};

lime.style.setSize = function(el, w, h) {
    if (el.width_cache_ != w || el.height_cache_ != h) {
        el.width_cache_ = w;
        el.height_cache_ = h;
        return goog.style.setSize(el, w, h);
    }
}

})();
