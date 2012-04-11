goog.provide('test.drag1');


goog.require('lime');
goog.require('lime.Circle');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.ColorTo');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.FadeTo');


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

  //director
  test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
  test.director.makeMobileWebAppCapable();


  var gamescene = new lime.Scene;

  var layer = (new lime.Layer).setPosition(50, 50);
  gamescene.appendChild(layer);
  
  test.inspect = new lime.Label().setPosition(200, 20).setText('');
  gamescene.appendChild(test.inspect);

  var drop1 = test.drop1 = makeDroppable().setPosition(350, 50);
  layer.appendChild(drop1);
  var drop2 = test.drop2 = makeDroppable().setPosition(350, 250);
  layer.appendChild(drop2);
  
  var drag1 = makeDraggable().setPosition(50, 50);
  layer.appendChild(drag1);
  var drag2 = makeDraggable().setPosition(50, 200);
  layer.appendChild(drag2);

  // set active scene
  test.director.replaceScene(gamescene);


};

function makeDraggable() {
  var sprite = new lime.Label().setText('draggable').setSize(70, 70).setFill('#f00');
  goog.events.listen(sprite, 'mousedown', function(e){
    var drag = e.startDrag(false, null, sprite); // snaptocenter, bounds, target
    
    // Add drop targets.
    drag.addDropTarget(test.drop1);
    drag.addDropTarget(test.drop2);
    
    // Avoid dragging multiple items together
    e.event.stopPropagation();
    
    // Drop into target and animate
    goog.events.listen(drag, lime.events.Drag.Event.DROP, function(e){
      console.log('item was dropped');
      var dropTarget = e.activeDropTarget;
      dropTarget.runAction(new lime.animation.Sequence(
        new lime.animation.ScaleTo(1.2).setDuration(.3),
        new lime.animation.ScaleTo(1).setDuration(.3)
      ));
      test.inspect.setText('');
      /*
      e.moveEndedCallback = function(){
        console.log('Called after animation has ended');
      }
      */
      
      // If you dont want the default move animation call e.stopPropagation() and do something custom.
    });
    
    // Move back if not dropped on target.
    var lastPosition = sprite.getPosition();
    goog.events.listen(drag, lime.events.Drag.Event.CANCEL, function(){
      sprite.runAction(new lime.animation.MoveTo(lastPosition).setDuration(.5));
      test.inspect.setText('');
    });
    
    // show move position
    goog.events.listen(drag, lime.events.Drag.Event.MOVE, function(){
      var pos = sprite.getPosition();
      test.inspect.setText(Math.round(pos.x) + ' ' + Math.round(pos.y));
    });
    
    // Other events include: START, END, CHANGE
    
  });
  return sprite;
}

function makeDroppable() {
  var sprite = new lime.Label().setText('droppable').setSize(150, 150).setFill('#00f');
  sprite.showDropHighlight = function(){
    this.runAction(new lime.animation.FadeTo(.6).setDuration(.3));
  };
  sprite.hideDropHighlight = function(){
    this.runAction(new lime.animation.FadeTo(1).setDuration(.1));
  };
  
  return sprite; 
}

goog.exportSymbol('test.start', test.start);
