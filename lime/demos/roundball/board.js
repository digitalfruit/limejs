goog.provide('rb.Board');

goog.require('goog.events');
goog.require('lime.Sprite');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.Spawn');
goog.require('rb.Gem');
goog.require('rb.MultiMove');

/**
 * Board object. Manages the square area with bubbles.
 * @param {number} rows Number of rows on board.
 * @param {number} cols Number of cols on board.
 * @param {lime.Game} game
 * @constructor
 * @extends lime.Sprite
 */
rb.Board = function(rows,cols,game) {
    lime.Sprite.call(this);

    this.game = game;

    /**
     * @const
     * @type {number}
     */
    this.SIZE = 690;

    this.rows = rows;
    this.cols = cols;
    this.gems = new Array(cols);

    this.setSize(this.SIZE, this.SIZE).setAnchorPoint(0, 0);

    // mask out edges so bubbles flowing in won't be over game controls.
    this.maskSprite = new lime.Sprite().setSize(this.SIZE, this.SIZE).setFill(100, 0, 0, .1).setAnchorPoint(0, 0);
    this.appendChild(this.maskSprite);
    this.setMask(this.maskSprite);

    // space that one bubble takes
    this.GAP = Math.round(this.SIZE / cols);

    // we will keep every column in own layer so they can be animated together
    this.layers = [];
    for (var i = 0; i < cols; i++) {
        this.layers[i] = new lime.Layer();
        this.appendChild(this.layers[i]);
    }

    // load in first bubbles
    this.fillGems();

    // start moving (but give some time to laod)
    lime.scheduleManager.callAfter(this.moveGems, this, 700);

    // register listener
    goog.events.listen(this, ['mousedown', 'touchstart'], this.pressHandler_);

};
goog.inherits(rb.Board, lime.Sprite);


/**
 * Fill the board so that all columns have max amount
 * of bubbles again. Poistion out of screen so they can be animated in
 */
rb.Board.prototype.fillGems = function() {
    for (var c = 0; c < this.cols; c++) {
        if (!this.gems[c]) this.gems[c] = [];
        var i = 0;
        for (var r = this.gems[c].length; r < this.rows; r++) {
            i++;
            var gem = rb.Gem.random();
            gem.r = r;
            gem.c = c;
            gem.setPosition((c + .5) * this.GAP, (-i + .5) * this.GAP);
            gem.setSize(this.GAP, this.GAP);
            this.gems[c].push(gem);
            this.layers[c].appendChild(gem);
        }
    }
};

/**
 * Animate all the bubbles that are not in their correct position
 * to the board. Same function is used in the beginning and also when
 * some bubbles have been removed
 * @return {boolean} If something was moved or not.
 */
rb.Board.prototype.moveGems = function(opt_static) {
    // multimove is a custom helper object that puts bubbles in their own
    // owen layer before moving. everything works same way without it and
    // even without any performance change on 90% of devices.
    var g, pos, mm = new rb.MultiMove();
    this.isMoving_ = 1;

    for (var c = 0; c < this.cols; c++) {
        for (var r = 0; r < this.rows; r++) {
            g = this.gems[c][r];
            g.r = r;
            g.c = c;
            pos = new goog.math.Coordinate((c + .5) * this.GAP, this.getSize().height - (r + .5) * this.GAP);
            if (!goog.math.Coordinate.equals(pos, g.getPosition())) {
                mm.addNode(g, goog.math.Coordinate.difference(pos, g.getPosition()));
            }
        }
    }
    var action = mm.play(opt_static);

    if (action) {
        // check if new solutions have appeared after move
        goog.events.listen(action, lime.animation.Event.STOP, function() {
        this.isMoving_ = 0;
        this.checkSolutions();
        },false, this);
    }
    else {
        this.isMoving_ = 0;
    }
    return action || false;
};


/**
 * Check if current bubble layout contains and solutions
 * and remove the elements if it does
 * @return {boolen} If there were some solutions.
 */
rb.Board.prototype.checkSolutions = function() {
    var solutions = this.getSolutions();
    if (!solutions.length) {
        // no solutions - but is there any possibilities at all?
        this.getHint();
        return false;
    }
    else this.game.clearHint();

    var action = new lime.animation.Spawn(
        new lime.animation.ScaleTo(0),
        new lime.animation.FadeTo(0).setDuration(.8)
    ).enableOptimizations();

    goog.array.removeDuplicates(solutions);

    // also count the indexes, this gives more points
    var indexes = [];

    for (var i = 0; i < solutions.length; i++) {
        action.addTarget(solutions[i]);
        // remove form array but not yet form display list
        goog.array.remove(this.gems[solutions[i].c], solutions[i]);
        goog.array.insert(indexes, solutions[i].index);
    }

    // actual score = bubbles * colors
    this.game.setScore(solutions.length * indexes.length);

    goog.events.listen(action, lime.animation.Event.STOP, function() {
        //remove objects after they have faded
        goog.array.forEach(solutions, function(g) {
            g.parent_.removeChild(g);
        },this);
        this.isMoving_ = 0;
        // move other bubbles to place.
        this.moveGems();

    },false, this);

    // fill the gaps
    this.fillGems();
    this.isMoving_ = 1;
    action.play();

    return true;
};


/**
 * Return possible solutions for current board layout.
 * @return {Array.<lime.Gem>} Array of solutions.
 */
rb.Board.prototype.getSolutions = function() {
    var r, c, g, group, res = [];

    //todo: this can be done with one loop

    //check rows
    for (r = 0; r < this.rows; r++) {
        i = -1;
        group = [];
        for (c = 0; c < this.cols; c++) {
            g = this.gems[c][r];
            if (g.index == i) {
                group.push(g);
            }

            if (g.index != i || c == (this.cols - 1)) {
                if (group.length >= 3) {
                    goog.array.insertArrayAt(res, group);
                }
                group = [g];
            }
            i = g.index;
        }
    }

    //check cols
    for (c = 0; c < this.cols; c++) {
        i = -1;
        group = [];
        for (r = 0; r < this.rows; r++) {
            g = this.gems[c][r];
            if (g.index == i) {
                group.push(g);
            }

            if (g.index != i || r == (this.rows - 1)) {
                if (group.length >= 3) {
                    goog.array.insertArrayAt(res, group);
                }
                group = [g];
            }
            i = g.index;
        }
    }
    return res;

};

/**
 * Handle presses on the board
 * @param {lime.Event} e Event.
 */
rb.Board.prototype.pressHandler_ = function(e) {
    // no touching allowed when still moving
    if (this.isMoving_) return;

    var pos = e.position;

    // get the cell and row value for the touch
    var c = Math.floor(pos.x / this.GAP),
        r = this.rows - Math.ceil(pos.y / this.GAP);

    // flick from one cell to another is also supported
    if (e.type == 'mousedown' || e.type == 'touchstart') {
        e.swallow(['mouseup', 'touchend'], rb.Board.prototype.pressHandler_);
    }

    var g = this.gems[c][r];

    // no-op if already selected
    if (g == this.selectedGem) return;

    g.select();


    if (this.selectedGem) {
        // if not nearb then act as first touch
        if (!this.checkNearbyGem(this.selectedGem, g)) {
            this.selectedGem.deselect();
            this.selectedGem = g;
        }
        else {
            // try to swap
            this.swapGems(this.selectedGem, g)
            delete this.selectedGem;
        }
    }
    else {
        this.selectedGem = g;
    }


};

/**
 * Returns true if two gems are positined next to each other.
 * @param {rb.Gem} g1 First.
 * @param {rb.Gem} g2 Second.
 * @return {boolean} Nearby or not.
 */
rb.Board.prototype.checkNearbyGem = function(g1,g2) {
    return g1.r == g2.r && Math.abs(g1.c - g2.c) == 1 || g1.c == g2.c && Math.abs(g1.r - g2.r) == 1;
};

/**
 * Swap positions of two bubbles.
 * @param {rb.Gem} g1 First.
 * @param {rb.Gem} g2 Second.
 * @param {boolean=} opt_last Last action. Don't swap back in any case.
 */
rb.Board.prototype.swapGems = function(g1,g2,opt_last) {
    this.swap(g1, g2);
    var p1 = g1.getPosition();
    var p2 = g2.getPosition();


    var action = this.moveGems(true);
    if (!opt_last && !this.getSolutions().length) {
        goog.events.listen(action, lime.animation.Event.STOP, function() {
            this.swapGems(g1, g2, true);
        },false, this);
    }else {
        g1.deselect();
        g2.deselect();
    }

    delete this.selectedGem;
};

/**
 * Swap two object in bubbles array
 * @param {rb.Gem} g1 First.
 * @param {rb.Gem} g2 Second.
 */
rb.Board.prototype.swap = function(g1,g2) {
    var tempc = g1.c, tempr = g1.r;
    g1.c = g2.c;
    g1.r = g2.r;
    g2.c = tempc;
    g2.r = tempr;
    this.gems[g1.c][g1.r] = g1;
    this.gems[g2.c][g2.r] = g2;
};

/**
 * Animate current hint bubble.
 */
rb.Board.prototype.showHint = function() {
    if (this.hint)
    this.hint.runAction(
        new lime.animation.Sequence(
            new lime.animation.ScaleTo(1.3).setDuration(.4),
            new lime.animation.ScaleTo(1).setDuration(.4)
        )
    );
};

/**
 * Return best hint for current board state.
 * Best hint is a bubble the wen swapping with another
 * make most combinations
 */
rb.Board.prototype.getHint = function() {
    var maxhint, hintvalue = 0;
    for (var c = 0; c < this.cols; c++) {
        for (var r = this.rows - 1; r >= 0; r--) {
            var first = this.gems[c][r];
            for (var i = 0; i < 2; i++) {
                var cc = c;
                var rr = r;
                if (i == 0) {cc++}
                else rr--;
                if (cc >= this.cols || rr < 0) continue;
                var second = this.gems[cc][rr];

                this.swap(first, second);

                var sol = this.getSolutions().length;
                if (sol > hintvalue) {
                    hintvalue = sol;
                    maxhint = first;
                }
                this.swap(first, second);
            }
        }
    }
    this.hint = maxhint;
    //send also to game object
    this.game.setHint(this.hint);


    return maxhint;
};

// this is for repositioning gems when board size changes
// this will eventually be replaced with AutoResize masks.
/*
rb.Board.prototype.setSize = function(){
    lime.Sprite.prototype.setSize.apply(this,arguments);

    var size = this.getSize();
    var newgap = size.width/this.cols;
    for(var c=0;c<this.cols;c++){
        for(var r=0;r<this.rows;r++){
            var pos = this.gems[c][r].getPosition();
            pos.x *= newgap/this.GAP;
            pos.y *= newgap/this.GAP;

        }
    }

}*/
