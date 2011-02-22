goog.provide('lime.parser.ZWOPTEX');

goog.require('goog.dom.xml');
goog.require('goog.math.Rect');
goog.require('goog.math.Vec2');
goog.require('goog.math.Size');

(function(){



function makeDict(element){
    var ob = {};
    var keys = findNodes(element,'key');
    for(var i=0;i<keys.length;i++){
        ob[keys[i].firstChild.nodeValue] = goog.dom.getNextElementSibling(keys[i]);
    }
    return ob;
};

function findNodes(element,tag){
    var ar = [];
    for(var i=0;i<element.childNodes.length;i++){
        if(element.childNodes[i].nodeName==tag){
            ar.push(element.childNodes[i]);
        }
    }
    return ar;
}


lime.parser.ZWOPTEX = function(data){
    var dict = {};
    var doc = goog.dom.xml.loadXml(data);
    
    var root = findNodes(findNodes(doc,'plist')[1],'dict')[0];
    
    var d0 = makeDict(root);
    var d1 = makeDict(d0['frames']);
    
    for(var i in d1){
        var d2 = makeDict(d1[i]);
        d2.getValue = function(v){
            return parseFloat(d2[v].firstChild.nodeValue)
        }
        dict[i] = [new  goog.math.Rect(d2.getValue('x'),d2.getValue('y'),d2.getValue('width'),d2.getValue('height')),
            new goog.math.Vec2(d2.getValue('offsetX'),d2.getValue('offsetY')),
            new goog.math.Size(d2.getValue('originalWidth'),d2.getValue('originalHeight'))
            ];
    }
    
    return dict;
};

})();