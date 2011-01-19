(function(callback){

    var webappCache = window.applicationCache;

    if(webappCache){
        
        var WIDTH = 200,
            HEIGHT = 100;
        
        var scripts = document.getElementsByTagName('script');
        var script = scripts[scripts.length-1];
        var el = document.createElement('div');
        var parent = script.parentNode;
        if(parent.style.position!='absolute' && parent.style.position!='relative'){
            parent.style.cssText = 'relative';
        }
        var pwidth = parent.innerWidth;
        var pheight = parent.innerHeight;
        el.style.cssText = 'border:1px solid #000;width:'+WIDTH+'px;height:'+HEIGHT+'px;position:absolute;top:'+(pwidth-WIDTH)*.5+'px;left:'+(pheight-HEIGHT)*.5+'px';
        script.parentNode.insertBefore(el,script);
        script.parentNode.removeChild(script);
        
        webappCache.addEventListener('updateready', function(){
            webappCache.swapCache();
            callback();
        }, false);
        
        webappCache.addEventListener('cached', function(){
           callback(); 
        });
        
        
    }

})(function(){alert('done')});
