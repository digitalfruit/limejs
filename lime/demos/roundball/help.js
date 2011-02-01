goog.provide('rb.Help');

goog.require('lime.Label');
goog.require('lime.RoundedRect');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('rb.Button');

/**
 * Help scene
 * @constructor
 * @extends lime.Scene
 */
rb.Help = function() {
    lime.Scene.call(this);


    var btn = new rb.Button('Back').setPosition(360, 870).setSize(300, 90);
    goog.events.listen(btn, 'click', function() {rb.loadMenu()});
    this.appendChild(btn);

    var contents = new lime.RoundedRect().setRadius(30).setFill('#fff').setSize(700, 560).setPosition(360, 420);
    this.appendChild(contents);

    var img1 = new lime.Sprite().setFill('assets/helper1.jpg').setPosition(-160, 30).setScale(.9);
    contents.appendChild(img1);

    var img2 = new lime.Sprite().setFill('assets/helper2.jpg').setPosition(160, 30).setScale(.9);
    contents.appendChild(img2);

    var txt1 = new lime.Label().setFontSize(18).setSize(280, 100).setPosition(-160, -170).setAlign('left');
    txt1.setText('Switch two neighbour balls to match up three, four or five same colored balls in a row.  Doing so will clear them and give you points.');
    contents.appendChild(txt1);

    var txt2 = new lime.Label().setFontSize(18).setSize(280, 100).setPosition(160, -170).setAlign('left');
    txt2.setText('You get extra points for making more than one match at once.');
    contents.appendChild(txt2);

    var txt3 = new lime.Label().setFontSize(18).setSize(550, 40).setPosition(0, 220).setAlign('center');
    txt3.setText('When there are no possible moves on the screen, the game ends.');
    contents.appendChild(txt3);
};
goog.inherits(rb.Help, lime.Scene);
