goog.provide('zlizer.dialogs');

zlizer.dialogs.blank = function() {
    var dialog = new lime.RoundedRect().setFill(255, 255, 255, .6).
        setRadius(40).setSize(680, 550).setPosition(0, 270).setAnchorPoint(.5, 0).setOpacity(0);
    return dialog;
};

zlizer.dialogs.box1 = function() {
    var b = zlizer.dialogs.blank();

    var txt = new lime.Label().setText('Tutorial').setFontSize(40).setPosition(0, 70);
    b.appendChild(txt);

    var descr = new lime.Label().setText('Divide and add bubbles with different numeric values to get them to equal magical value before they fall to the ground.').setSize(450, 50).setPosition(0, 130).setFontSize(24).setFontColor('#333');
    b.appendChild(descr);

    var tutorial1 = new lime.Sprite().setFill('assets/dialog_tutorial1.jpg').setPosition(-150, 400).setScale(.9);
    b.appendChild(tutorial1);

    var tutorial2 = new lime.Sprite().setFill('assets/dialog_tutorial2.jpg').setPosition(150, 400).setScale(.9);
    b.appendChild(tutorial2);


    var hint1 = new lime.Label().setFontSize(22).setFontColor('#80c010').setText('Draw line around bubbles to add their values together').setSize(250, 50).setPosition(-150, 250);
    b.appendChild(hint1);

    var hint1 = new lime.Label().setFontSize(22).setFontColor('#80c010').setText('Draw line through a bubble to split it into two.').setSize(250, 50).setPosition(150, 250);
    b.appendChild(hint1);


    return b;
};

zlizer.dialogs.box2 = function() {
    var b = zlizer.dialogs.blank();

    var txt = new lime.Label().setText('Tutorial').setFontSize(40).setPosition(0, 70);
    b.appendChild(txt);

    var descr = new lime.Label().setText('If you are using mouse or trackpad you may find it easier to hold down key Z for making a selection instead of pressing on mouse.').setSize(450, 50).setPosition(0, 130).setFontSize(24).setFontColor('#333');
    b.appendChild(descr);

    var tutorial1 = new lime.Sprite().setFill('assets/dialog_keyz.jpg').setPosition(0, 360);
    b.appendChild(tutorial1);


    return b;
};

zlizer.dialogs.box3 = function(game) {
    var b = zlizer.dialogs.blank();

    var txt = new lime.Label().setText('Level #' + game.level).setFontSize(40).setPosition(0, 70);
      b.appendChild(txt);

      var descr = new lime.Label().setText('This is your magic number for this level:').setSize(450, 50).setPosition(0, 130).setFontSize(24).setFontColor('#333');
      b.appendChild(descr);

      var tutorial1 = new lime.Sprite().setFill('assets/dialog_number.jpg').setPosition(0, 320);
      b.appendChild(tutorial1);

      var magic = new lime.Label(game.magic).setFontSize(60).setPosition(0, 320).setFontColor('#fff');

    b.appendChild(magic);
    return b;
};

zlizer.dialogs.appear = function(b,callback) {
    var appear = new lime.animation.FadeTo(1).setDuration(.3);
    b.runAction(appear);
    if (callback) goog.events.listen(appear, lime.animation.Event.STOP, callback);
};

zlizer.dialogs.hide = function(b,callback) {
    var hide = new lime.animation.Sequence(new lime.animation.Delay().setDuration(5), new lime.animation.FadeTo(0).setDuration(.3));
    b.runAction(hide);
    if (callback) goog.events.listen(hide, lime.animation.Event.STOP, callback);
};

