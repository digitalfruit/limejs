goog.provide('lime.customNodes.CoverLens');


goog.require('goog.math.Coordinate');
goog.require('goog.style');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Node');


lime.customNodes.CoverLens = function() {
    lime.CoverNode.call(this);

    this.center_ = new goog.math.Coordinate(0, 0);
    this.outerRadius = 80;
    this.innerRadius = 40;
    this.outerAlpha = 0.83;
    this.offset = new goog.math.Coordinate(0, 70);

};
goog.inherits(lime.customNodes.CoverLens, lime.CoverNode);

/*
Object.defineProperty(lime.Node.prototype, 'center', {
   get: function() {return this.center_;},
   set: function(value) {
        lime.setObjectDirty(goog.bind(this.update,this));
        this.center_ = value;
   }
});
*/
lime.customNodes.CoverLens.prototype.getCenter = function() {
    return this.center_;
};

lime.customNodes.CoverLens.prototype.setCenter = function(value) {
    lime.setObjectDirty(goog.bind(this.update, this));
    this.center_ = value;
};

lime.customNodes.CoverLens.prototype.update = function() {
    if (!this.director) return;


    var style = this.baseElement.style,
        dsize = this.director.getSize(),
        dscale = this.director.getScale(),
        quality = this.getQuality(),
        size = this.getSize();

    if (arguments[0]) {
        this.center = new goog.math.Coordinate(
            dsize.width / 2, dsize.height / 2
        );

        size = this.size_ = goog.style.getSize(
            this.director.baseElement.parentNode);

        style['width'] = 2 * size.width + 'px';
        style['height'] = 2 * size.height + 'px';

        this.baseElement.width =
            (2 * size.width / dscale.x) * quality;
        this.baseElement.height =
            (2 * size.height / dscale.y) * quality;

        this.setNeedsRedraw();
    }
    var center = this.director.localToScreen(this.getCenter());
    style['-webkit-transform'] = 'translate3d(' +
        (-size.width + center.x) + 'px,' +
        (-size.height + center.y) + 'px,0px)';

    style['MozTransform'] = 'translate(' +
        (-size.width + center.x) + 'px,' +
        (-size.height + center.y) + 'px)';

};


lime.customNodes.CoverLens.prototype.drawInRect = function(box) {
    var w = 0.5 * (box.right - box.left);
    var h = 0.5 * (box.bottom - box.top);

    var ctx = this.context;

//    ctx.clearRect(box.left,box.top,w,h);
     // set up gradient
    var grad = ctx.createRadialGradient(
        box.left + w - this.offset.x, box.top + h - this.offset.y,
        this.innerRadius,
        box.left + w - this.offset.x, box.top + h - this.offset.y,
         this.outerRadius
    );

    var stops = {0: 'rgba(0,0,0,0)', 1: 'rgba(0,0,0,' + this.outerAlpha + ')'};

    for (var position in stops) {
        var color = stops[position];
        grad.addColorStop(position, color);
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(box.left, box.top);
    ctx.lineTo(box.left, box.bottom);
    ctx.lineTo(box.right, box.bottom);
    ctx.lineTo(box.right, box.top);
    ctx.closePath();
    ctx.fill();
};
