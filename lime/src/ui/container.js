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

lime.ui.Container.prototype.update = function(opt_pass){
    if(!opt_pass){
        var l = this.children_.length;
        var pos = new goog.math.Coordinate(this.GAP,0);
        for(var i=0;i<l;i++){
            var child = this.children_[i];
            var p2 = child.getPosition();;
            if(!goog.math.Coordinate.equals(pos,p2)){
                child.setPosition(pos.clone());
            }
            pos.x+=child.getSize().width+this.GAP;
        }
    }
    
    lime.Node.prototype.update.apply(this, arguments);
}
