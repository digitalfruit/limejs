goog.provide('lime.parser.ZWOPTEX2');

goog.require('goog.dom.xml');
goog.require('goog.math.Rect');
goog.require('goog.math.Vec2');
goog.require('goog.math.Size');
goog.require('goog.json');

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


lime.parser.ZWOPTEX2 = function(data){
    var dict = {};
    var doc = goog.dom.xml.loadXml(data);
    
    var root = findNodes(findNodes(doc,'plist')[1],'dict')[0];
    
    var d0 = makeDict(root);
    var d1 = makeDict(d0['frames']);
    var parse = function(v){
        return goog.json.parse(this[v].firstChild.nodeValue.replace(/\{/g,'[').replace(/\}/g,']'));
    }
    
    for(var i in d1){
        var d2 = makeDict(d1[i]);
        d2.getValue = parse;
        var tr = d2.getValue('textureRect'), ss = d2.getValue('spriteSourceSize'),
            scr = d2.getValue('spriteColorRect');
      
        dict[i] = [new  goog.math.Rect(tr[0][0],tr[0][1],tr[1][0],tr[1][1]),
            new goog.math.Vec2(scr[0][0],scr[0][1]),
            new goog.math.Size(ss[0],ss[1])
            ];
    }
    
    return dict;
};

})();