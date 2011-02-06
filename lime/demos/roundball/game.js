goog.provide('rb.Game');

goog.require('rb.Progress');

/**
 * Game scene for Roundball game.
 * @constructor
 * @extends lime.Scene
 */
rb.Game = function(size) {
    lime.Scene.call(this);

    this.points = 0;

    //empty layer for contents
    var layer = new lime.Layer();
    this.appendChild(layer);

    //make board
    this.board = new rb.Board(size, size, this).setPosition(25, 174);
    
    if(rb.isBrokenChrome()) this.board.setRenderer(lime.Renderer.CANVAS);

    // static background bubbles for baord. try dfkit.Renderer.CANVAS for this one as it is quite static
    var back = new lime.RoundedRect().setSize(690, 690).setAnchorPoint(0, 0).setPosition(17, 166).setRadius(30);
    for (var c = 0; c < this.board.cols; c++) {
        for (var r = 0; r < this.board.rows; r++) {
            var b = new lime.Sprite().setFill('assets/shadow.png').setAnchorPoint(0, 0).
                setSize(this.board.GAP * .94, this.board.GAP * .94).
                setPosition(11 + c * this.board.GAP, 11 + r * this.board.GAP);
            b.qualityRenderer = true; // no jagged edges on moz for this one
            back.appendChild(b);
        }
    }
    layer.appendChild(back);
    layer.appendChild(this.board);

    // graphical lines for visual effect
    var line = new lime.Sprite().setSize(670, 2).setFill('#295081').setPosition(720 * .5, 148);
    layer.appendChild(line);
    line = new lime.Sprite().setSize(670, 2).setFill('#295081').setPosition(720 * .5, 885);
    layer.appendChild(line);

    // label for score message
    var score_lbl = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#4f96ed').setFontSize(24).
        setPosition(30, 22).setText('Score:').setAnchorPoint(0, 0).setFontWeight(700);
    layer.appendChild(score_lbl);

    // score message label
    this.score = new lime.Label().setFontColor('#fff').setFontSize(92).setText(0).setPosition(30, 40)
        .setAnchorPoint(0, 0).setFontWeight(700);
    layer.appendChild(this.score);

    // Menu button
    this.btn_menu = new rb.Button('Menu').setSize(140, 70).setPosition(100, 945);
    goog.events.listen(this.btn_menu, 'click', function() {
        rb.loadMenu();
    });
    this.appendChild(this.btn_menu);

    // Hint button
    this.btn_hint = new rb.Button('Hint').setSize(140, 70).setPosition(640, 945).setOpacity(0);
    goog.events.listen(this.btn_hint, 'click', function() {
        if (this.hint)
        this.board.showHint();
    },false, this);
    this.appendChild(this.btn_hint);


    this.maxTime = 30;
    this.curTime = 30;

    // if timed mode
    if (rb.usemode == rb.Mode.TIMED) {
        this.time_lbl = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#4f96ed')
            .setFontSize(24).setPosition(680, 22).setText('Time left:').setAnchorPoint(1, 0)
            .setFontWeight(700).setSize(300, 30).setAlign('right');
        layer.appendChild(this.time_lbl);

        // time left progressbar
        this.time_left = new rb.Progress().setPosition(356, 90);
        layer.appendChild(this.time_left);

        //decrease time on every second
        lime.scheduleManager.scheduleWithDelay(this.decreaseTime, this, 1000);
     }

     // update score when points have changed
     lime.scheduleManager.scheduleWithDelay(this.updateScore, this, 100);

     // show lime logo
     rb.builtWithLime(this);
};
goog.inherits(rb.Game, lime.Scene);

/**
 * Subtract one second from left time in timed mode
 */
rb.Game.prototype.decreaseTime = function() {
    this.curTime--;
    if (this.curTime < 1) {
        this.endGame();
    }
    // update progressbar
    this.time_left.setProgress(this.curTime / this.maxTime);
};

/**
 * Increase value of score label when points have changed
 */
rb.Game.prototype.updateScore = function() {
    var curscore = parseInt(this.score.getText(), 10);
    if (curscore < this.points) {
        this.score.setText(curscore + 1);
    }
};

/**
 * Register new hint from board object. Activate button
 * if no action soon
 * @param {rb.Gem} hint Hint gem.
 */
rb.Game.prototype.setHint = function(hint) {
    this.hint = hint;
    if (!goog.isDef(hint)) {
        return this.endGame();
    }
    else {
        lime.scheduleManager.callAfter(this.showHint, this, 3500);
    }
};

/**
 * Hide hint button
 */
rb.Game.prototype.clearHint = function() {
    lime.scheduleManager.unschedule(this.showHint, this);
    this.btn_hint.runAction(new lime.animation.FadeTo(0));
    delete this.hint;
};

/**
 * Show hint button
 */
rb.Game.prototype.showHint = function() {
    this.btn_hint.runAction(new lime.animation.FadeTo(1));
};

/**
 * Update points
 * @param {number} p Points to add to current score.
 */
rb.Game.prototype.setScore = function(p) {
    this.points += p;
    this.curTime += p;
    if (this.curTime > this.maxTime) this.curTime = this.maxTime;
    if (this.time_left)
    this.time_left.setProgress(this.curTime / this.maxTime);
};

/**
 * Show game-over dialog
 */
rb.Game.prototype.endGame = function() {

   //unregister the event listeners and schedulers
   goog.events.unlisten(this.board, ['mousedown', 'touchstart'], this.board.pressHandler_);
   lime.scheduleManager.unschedule(this.updateScore, this);
   lime.scheduleManager.unschedule(this.decreaseTime, this);

    var dialog = new lime.RoundedRect().setFill(0, 0, 0, .7).setSize(500, 480).setPosition(360, 260).
        setAnchorPoint(.5, 0).setRadius(20);
    this.appendChild(dialog);

    var title = new lime.Label().setText(this.curTime < 1 ? 'No more time!' : 'No more moves!').
        setFontColor('#ddd').setFontSize(40).setPosition(0, 70);
    dialog.appendChild(title);

    var score_lbl = new lime.Label().setText('Your score:').setFontSize(24).setFontColor('#ccc').setPosition(0, 145);
    dialog.appendChild(score_lbl);

    var score = new lime.Label().setText(this.points).setFontSize(150).setFontColor('#fff').
        setPosition(0, 240).setFontWeight(700);
    dialog.appendChild(score);

    var btn = new rb.Button().setText('TRY AGAIN').setSize(200, 90).setPosition(-110, 400);
    dialog.appendChild(btn);
    goog.events.listen(btn, lime.Button.Event.CLICK, function() {
         rb.newgame(this.board.cols);
    },false, this);


    var btn = new rb.Button().setText('MAIN MENU').setSize(200, 90).setPosition(110, 400);
    dialog.appendChild(btn);
    goog.events.listen(btn, lime.Button.Event.CLICK, function() {
        rb.loadMenu();
    });
};
