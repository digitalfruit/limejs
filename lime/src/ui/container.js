goog.provide('lime.ui.Container');

goog.require('lime.Layer');

/**
 * @constructor
 */
lime.ui.Container = function(){
   goog.base(this);

   this.GAP = 10;

   this.toAdd_ = [];
   this.toRemove_ = [];
   
   this.setDirection(lime.ui.Container.Direction.HORIZONTAL);

};
goog.inherits(lime.ui.Container, lime.Layer);
/*
lime.ui.Container.prototype.appendChild = function(child,opt_pos,opt_animate){
    lime.Node.prototype.appendChild.apply(this, arguments);
    
   /* child.domElement.style['display'] = 'none';
    goog.array.insert(this.toAdd_,child);*/
/*};


lime.ui.Container.prototype.removeChild = function(child,opt_animate){
    lime.Node.prototype.appendChild.apply(this, arguments);
    
   /* child.domElement.style['display'] = 'none';
    goog.array.insert(this.toAdd_,child);*/
    
//}

/**
 * Directions of the scroller.
 * @enum number
 */
lime.ui.Container.Direction = {
  HORIZONTAL: 0,
  VERTICAL: 1
};

/**
 * Returns the direction of the scroller (horizontal/vertical)
 * @return {lime.ui.Scroller.Direction} Scroll direction.
 */
lime.ui.Container.prototype.getDirection = function() {
    return this.direction_;
};

/**
 * Set the direction of the scroller (horizontal/vertical)
 * @param {lime.ui.Scroller.Direction} direction Direction.
 * @return {lime.ui.Scroller} object itself.
 */
lime.ui.Container.prototype.setDirection = function(direction) {
    this.direction_ = direction;
    return this;
};

lime.ui.Container.prototype.updateChildrenPositions = function(){
    var l = this.children_.length;
    var pos = new goog.math.Coordinate(0,0);
    for(var i=0;i<l;i++){
        var child = this.children_[i];
        var p2 = child.getPosition();;
        if(!goog.math.Coordinate.equals(pos,p2)){
            child.setPosition(pos.clone());
        }
        if(this.getDirection()==lime.ui.Container.Direction.HORIZONTAL)
        pos.x+=child.getSize().width+this.GAP;
        else pos.y+=child.getSize().height+this.GAP;
    }
    return this;
}

lime.ui.Container.prototype.update = function(opt_pass){
    if(!opt_pass){
        this.updateChildrenPositions();
    }
    
    lime.Node.prototype.update.apply(this, arguments);
}
