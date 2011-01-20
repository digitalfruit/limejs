
// pg - "Pot Game"
goog.provide('test.scroll')


goog.require('lime');
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Sprite');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.RotateBy');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.Spawn')
goog.require('lime.animation.Sequence')
goog.require('lime.animation.Delay')
goog.require('lime.animation.FadeTo')



test.WIDTH = 800;
test.HEIGHT = 600;


test.start = function(){ 
	
	//director
	test.director = new lime.Director(document.body,test.WIDTH,test.HEIGHT);
	test.director.makeMobileWebAppCapable();
	
	var gamescene = new lime.Scene;
	
	var layer = new lime.Sprite().setAnchorPoint(0,0);
	layer.setPosition(200,100);
	gamescene.appendChild(layer);
	
	var back = new lime.Sprite().setFill('#ccc').setSize(500,130).setAnchorPoint(0,0.5);
	layer.appendChild(back);
	var mask = new lime.Sprite().setFill('#ccc').setSize(500,130).setAnchorPoint(0,0.5);
	layer.appendChild(mask);
	back.setMask(mask);
	
	var moving = new lime.Layer();
	back.appendChild(moving);

    var box = new lime.Sprite().setFill('#00c').setSize(120,100);
    moving.appendChild(box);
    
	goog.events.listen(moving,['mousedown','touchstart'],function(e){
	    var x = e.position.x,
            y =moving.getPosition().y;
            var p = moving.getPosition().clone();
            console.log('aa');
        var oldx = posx = moving.getPosition().x;
        var ismove = 1,vx = 0;
        var LOW = 60,HIGH = 440;
        lime.animation.actionManager.stopAll(moving);
            moving.setPosition(p);
        var step = function(){
            if(ismove){
                vx = (posx-oldx);
                oldx = posx;
            }
            vx*=.95;
            /*if(Math.abs(vx)>0.5){
                var pos = moving.getPosition();
                pos.x+=vx;
                moving.setPosition(pos);
            }
            else if(!ismove) lime.scheduleManager.unschedule(step,moving);    */
        };
        
        
        lime.scheduleManager.schedule(step,moving);    
            
        e.swallow(['touchmove', 'mousemove'], function(e) {
            var pos = e.position.clone();
                pos.x -= x;
                pos.y = y;
                pos = moving.localToNode(pos, moving.getParent());
                if(pos.x<LOW){
                    var diff = LOW-pos.x;
                    if(diff>200) diff=200;
                    pos.x = LOW-diff/2;
                }
                if(pos.x>HIGH) {
                    var diff = pos.x-HIGH;
                    if(diff>200) diff=200;
                    pos.x = HIGH+diff/2;
                }
                posx = pos.x;
                moving.setPosition(pos);
        });
        
        e.swallow(['touchend','mouseup','touchend'],function(e){
            var pos = e.position.clone();
                pos.x -= x;
                pos.y = y;
                pos = moving.localToNode(pos, moving.getParent());
                
                var oldx = pos.x;
                lime.scheduleManager.unschedule(step,moving);
                
                var k = Math.log(0.5/Math.abs(vx))/Math.log(0.95);
                var duration = k/30;
                var endpos = (Math.abs(vx)*(Math.pow(0.95,k)-1))/(0.95-1)*(vx>0?1:-1);
                console.log(vx,duration,endpos,k);
                pos.x+=endpos;
                ismove = 0;
                if(vx!=0){
                
                var diff = endpos;
                
                if(pos.x<LOW){
                    diff = LOW-(pos.x-endpos);
                    pos.x = LOW;
                }
                if(pos.x>HIGH) {
                    diff = HIGH-(pos.x-endpos);
                    pos.x = HIGH;
                }
                //console.log(diff,endpos);
                duration*=(diff/endpos);
                }
                if(oldx<LOW){
                    pos.x = LOW;
                    duration=.3;
                }
                if(oldx>HIGH) {
                    pos.x = HIGH;
                    duration=.3;
                }
                if(Math.abs(duration)<10)
               moving.runAction(new lime.animation.MoveTo(pos.x,pos.y).setDuration(duration).setEasing(lime.animation.getEasingFunction(.19,.6,.35,.97)).enableOptimizations());
                
                
                
        });
	    
	},false,this);
	
	test.director.replaceScene(gamescene);
	

}

goog.exportSymbol('test.start', test.start);
