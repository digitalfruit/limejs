goog.provide('rb.MultiMove');

goog.require('lime.animation.MoveBy');

/**
 * Object for moving lot of elements together.
 * Done as a specific test. No real effect unless very big board (and first animation)
 */
rb.MultiMove = function() {
    this.requests_ = {};
    this.numReq_ = 0;
};

/**
 * Add target node with its delta
 * @param {lime.Node} node Node to move.
 * @param {goog.math.Vec2} delta Offset to move.
 */
rb.MultiMove.prototype.addNode = function(node,delta) {
    var key = delta.x + '_' + delta.y;
    if (!goog.isDef(this.requests_[key])) {
        this.requests_[key] = [];
    }
    this.requests_[key].push([node, delta]);
    this.numReq_++;
};

/**
 * Return number of actions
 * @return {number} NUmber of actions.
 */
rb.MultiMove.prototype.getNumActions = function() {
    return this.numReq_;
};

/**
 * Play the animation
 */
rb.MultiMove.prototype.play = function(opt_static) {
    var action, longest_action, longest_duration = 0;
    for (var i in this.requests_) {
        var req = this.requests_[i];
        action = new lime.animation.MoveBy(req[0][1]).setSpeed(.3).enableOptimizations();
        if (longest_duration < action.getDuration()) {
            longest_action = action;
            longest_duration = action.getDuration();
        }
        if (!opt_static && req.length > 15) {
            var layer = new lime.Layer().setRenderer(lime.Renderer.CANVAS);
            var oldparent = req[0][0].getParent();
            var grandparent = oldparent.getParent();
            for (var j = 0; j < req.length; j++) {
                var node = req[j][0];
                node.getParent().removeChild(node);
                layer.appendChild(req[j][0]);
            }
            grandparent.appendChild(layer);
            goog.events.listen(action, lime.animation.Event.STOP, function() {
                var parent = this.getParent();
                parent.removeChild(this);
                var pos = this.getPosition();
                var i = this.children_.length - 1;
                while (i >= 0) {
                    var n = this.children_[i];
                    this.removeChild(n);
                    n.setRenderer(lime.Renderer.DOM);
                    grandparent.layers[n.c].appendChild(n);
                   var pp = (goog.math.Coordinate.sum(pos, n.getPosition()));
                    n.setPosition(goog.math.Coordinate.sum(pos, n.getPosition()));
                    i--;
                }
            },false, layer);
            layer.runAction(action);
        }
        else {
            for (var j = 0; j < req.length; j++) {
                action.addTarget(req[j][0]);
            }
            action.play();
        }
    }
    return longest_action;
};
