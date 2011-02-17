goog.provide('lime.parser.ZWOPTEX');

goog.require('goog.dom.xml');
goog.require('goog.math.Rect');

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
        dict[i] = new  goog.math.Rect(parseInt(d2['x'].firstChild.nodeValue,10),parseInt(d2['y'].firstChild.nodeValue,10),
            parseInt(d2['width'].firstChild.nodeValue,10),parseInt(d2['height'].firstChild.nodeValue,10));
    }
    
    return dict;
};

})();