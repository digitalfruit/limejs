goog.provide('lime.Director');


goog.require('lime.CoverNode');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.math.Box');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.math.Vec2');
goog.require('goog.style');
goog.require('lime');
goog.require('lime.Node');
goog.require('lime.events.EventDispatcher');
goog.require('lime.helper.PauseScene');
goog.require('lime.scheduleManager');
goog.require('lime.transitions.Transition');


/**
 * Director object. Base object for every game.
 * @param {Element} parentElement Parent element for director.
 * @param {number=} opt_width Optionaly define what height and width the director should have.
 * @param {number=} opt_height Optionaly define what height and width the director should have.
 * @constructor
 * @extends lime.Node
 */
lime.Director = function(parentElement, opt_width, opt_height) {
    lime.Node.call(this);

    // Unlike other nodes Director is always in the DOM as
    // it requires parentNode in the constructor
    this.inTree_ = true;

    this.setAnchorPoint(0, 0);
    // todo: maybe easier if director just positions itselt
    // to the center of the screen

    /**
     * Array of Scene instances. Last one is the active scene.
     * @type {Array.<lime.Scene>}
     * @private
     */
    this.sceneStack_ = [];

    /**
     * Array of CoverNode instances.
     * @type {Array.<lime.CoverNode>}
     * @private
     */
    this.coverStack_ = [];

    this.domClassName = goog.getCssName('lime-director');
    this.createDomElement();
    parentElement.appendChild(this.domElement);



    if (goog.userAgent.WEBKIT && goog.userAgent.MOBILE) {
    //todo: Not pretty solution. Cover layers may not be needed at all.
    this.coverElementBelow = document.createElement('div');
    goog.dom.classes.add(this.coverElementBelow,
        goog.getCssName('lime-cover-below'));
    goog.dom.insertSiblingBefore(this.coverElementBelow, this.domElement);

    this.coverElementAbove = document.createElement('div');
    goog.dom.classes.add(this.coverElementAbove,
        goog.getCssName('lime-cover-above'));
    goog.dom.insertSiblingAfter(this.coverElementAbove, this.domElement);
    }

    if (parentElement.style['position'] != 'absolute') {
        parentElement.style['position'] = 'relative';
    }
    parentElement.style['overflow'] = 'hidden';

    if (parentElement == document.body) {
        goog.style.installStyles('html,body{margin:0;padding:0;height:100%;}');

        var meta = document.createElement('meta');
        meta.name = 'viewport';
        var content = 'width=device-width,initial-scale=1.0,minimum-scale=1,' +
            'maximum-scale=1.0,user-scalable=no';
        if ((/android/i).test(navigator.userAgent)) {
            content += ',target-densityDpi=device-dpi';
        }

        meta.content = content;
        document.getElementsByTagName('head').item(0).appendChild(meta);
        
        
        //todo: look for a less hacky solution
        if(goog.userAgent.MOBILE && !goog.global['navigator'].standalone){
            var that = this;
            setTimeout(
                function(){window.scrollTo(0, 0);that.invalidateSize_()}
            ,100);
        }
    }

    var width, parentSize = goog.style.getSize(parentElement);

    this.setSize(new goog.math.Size(
        width = arguments[1] || parentSize.width || lime.Director.DEFAULT_WIDTH,
        arguments[2] || parentSize.height * width / parentSize.width || lime.Director.DEFAULT_HEIGHT
    ));

    // --define goog.debug=false
    this.setDisplayFPS(goog.DEBUG);
    this.setPaused(false);


    var vsm = new goog.dom.ViewportSizeMonitor();
    goog.events.listen(vsm, goog.events.EventType.RESIZE,
        this.invalidateSize_, false, this);
    goog.events.listen(goog.global, 'orientationchange',
        this.invalidateSize_, false, this);


    lime.scheduleManager.schedule(this.step_, this);


    this.eventDispatcher = new lime.events.EventDispatcher(this);

    goog.events.listen(this, ['touchmove','touchstart'],
        function(e) {e.event.preventDefault();}, false, this);

    // todo: check if all those are really neccessary as Event code
    // is much more mature now
    goog.events.listen(this, ['mouseup', 'touchend', 'mouseout', 'touchcancel'],
        function() {},false);


    this.invalidateSize_();
    
    if(goog.DEBUG){
        goog.events.listen(goog.global,'keyup',this.keyUpHandler_,false,this);
    }

};
goog.inherits(lime.Director, lime.Node);


/**
 * Milliseconds between recalculating FPS value
 * @const
 * @type {number}
 */
lime.Director.FPS_INTERVAL = 100;

/**
 * Default width of the Director
 * @const
 * @type {number}
 */
lime.Director.DEFAULT_WIDTH = 400;


/**
 * Default height of the Director
 * @const
 * @type {number}
 */
lime.Director.DEFAULT_HEIGHT = 400;


/**
 * Returns true if director is paused? On paused state
 * the update timer doesn't fire.
 * @return {boolean} If director is paused.
 */
lime.Director.prototype.isPaused = function() {
    return this.isPaused_;
};


/**
 * Pauses or resumes the director
 * @param {boolean} value Pause or resume.
 * @return {lime.Director} The director object itself.
 */
lime.Director.prototype.setPaused = function(value) {
    this.isPaused_ = value;
    lime.scheduleManager.changeDirectorActivity(this, !value);
    if (this.isPaused_) {
        var pauseClass = this.pauseClassFactory || lime.helper.PauseScene;
        this.pauseScene = new pauseClass();
        this.pushScene(this.pauseScene);
    }
    else if (this.pauseScene) {
        this.popScene();
        delete this.pauseScene;
    }
    return this;
};


/**
 * Returns true if FPS counter is displayed
 * @return {boolean} FPS is displayed.
 */
lime.Director.prototype.isDisplayFPS = function() {
    return this.displayFPS_;
};

/**
 * Show or hide FPS counter
 * @param {boolean} value Display FPS?
 * @return {lime.Director} The director object itself.
 */
lime.Director.prototype.setDisplayFPS = function(value) {
    if (this.displayFPS_ && !value) {
        goog.dom.removeNode(this.fpsElement_);
    }
    else if (!this.displayFPS_ && value) {
        this.frames_ = 0;
        this.accumDt_ = 0;

        this.fpsElement_ = goog.dom.createDom('div');
        goog.dom.classes.add(this.fpsElement_, goog.getCssName('lime-fps'));
        this.domElement.parentNode.appendChild(this.fpsElement_);
    }

    this.displayFPS_ = value;
    return this;
};


/**
 * Get current active scene
 * @return {lime.Scene} Currently active scene.
 */
lime.Director.prototype.getCurrentScene = function() {
    return this.sceneStack_.length ?
        this.sceneStack_[this.sceneStack_.length - 1] : null;
};

/** @inheritDoc */
lime.Director.prototype.getDirector = function() {
     return this;
};

/** @inheritDoc */
lime.Director.prototype.getScene = function() {
    return null;
};

/**
 * Timeline function.
 * @param {number} delta Milliseconds since last step.
 * @private
 */
lime.Director.prototype.step_ = function(delta) {
    if (this.isDisplayFPS()) {

        this.frames_++;
        this.accumDt_ += delta;
        if (this.accumDt_ > lime.Director.FPS_INTERVAL) {
            this.fps = ((1000 * this.frames_) / this.accumDt_);
            goog.dom.setTextContent(this.fpsElement_, this.fps.toFixed(2));
            this.frames_ = 0;
            this.accumDt_ = 0;
        }
    }
    lime.updateDirtyObjects();
};


/**
 * Replace current scene with new scene
 * @param {lime.Scene} scene New scene.
 * @param {function(lime.Scene,lime.Scene,boolean=)=} opt_transition Transition played.
 * @param {number=} opt_duration Duration of transition.
 */
lime.Director.prototype.replaceScene = function(scene, opt_transition,
        opt_duration) {

    scene.setSize(this.getSize().clone());

    var transitionclass = opt_transition || lime.transitions.Transition;

    var outgoing = null;
    if (this.sceneStack_.length)
        outgoing = this.sceneStack_[this.sceneStack_.length - 1];



    var removelist = [];
    var i = this.sceneStack_.length;
    while (--i >= 0) {
        this.sceneStack_[i].wasRemovedFromTree();
        removelist.push(this.sceneStack_[i].domElement);
        this.sceneStack_[i].parent_ = null;
    }
    this.sceneStack_.length = 0;

    this.sceneStack_.push(scene);
    scene.domElement.style['display']='none';
    this.domElement.appendChild(scene.domElement);
    scene.parent_ = this;
    scene.wasAddedToTree();

    var transition = new transitionclass(outgoing, scene);
        
    goog.events.listenOnce(transition,'end',function() {
            var i = removelist.length;
            while (--i >= 0) {
                goog.dom.removeNode(removelist[i]);
            }
            removelist.length = 0;
            
        },false,this);

    if (goog.isDef(opt_duration)) {
        transition.setDuration(opt_duration);
    }

    transition.start();
    return transition;

};

/** @inheritDoc */
lime.Director.prototype.updateLayout = function() {
   // debugger;
    this.dirty_ &= ~lime.Dirty.LAYOUT;
};

/**
 * Push scene to the top of scene stack
 * @param {lime.Scene} scene New scene.
 * @param {function(lime.Scene,lime.Scene,boolean=)=} opt_transition Transition played.
 * @param {number=} opt_duration Duration of transition.
 * @return Transition object if opt_transition is defined
 */
lime.Director.prototype.pushScene = function(scene, opt_transition, opt_duration) {
    var transition, outgoing;

    scene.setSize(this.getSize().clone());

    if (goog.isDef(opt_transition) && this.sceneStack_.length) {
        outgoing = this.sceneStack_[this.sceneStack_.length - 1];
        transition = new opt_transition(outgoing, scene);

        if (goog.isDef(opt_duration)) {
            transition.setDuration(opt_duration);
        }
        scene.domElement.style['display'] = 'none';
    }
    this.sceneStack_.push(scene);
    this.domElement.appendChild(scene.domElement);
    scene.parent_ = this;
    scene.wasAddedToTree();

    if (transition) {
        transition.start();
        return transition;
    }
};


/**
 * Remove current scene from the stack
 * @param {function(lime.Scene,lime.Scene,boolean=)=} opt_transition Transition played.
 * @param {number=} opt_duration Duration of transition.
 * @return Transition object if opt_transition is defined
 */
lime.Director.prototype.popScene = function(opt_transition, opt_duration) {
    var transition, 
      outgoing = this.getCurrentScene();
      
    if (goog.isNull(outgoing)) return;
    
    var popOutgoing = function() {
        outgoing.wasRemovedFromTree();
        outgoing.parent_ = null;
        goog.dom.removeNode(outgoing.domElement);
        this.sceneStack_.pop();
        outgoing = null; // GC
    };
    // Transitions require an existing incoming scene
    if (goog.isDef(opt_transition) && (this.sceneStack_.length > 1)) {
        transition = new opt_transition(outgoing, this.sceneStack_[this.sceneStack_.length - 2]);
      
        if (goog.isDef(opt_duration)) {
            transition.setDuration(opt_duration);
        }
        goog.events.listenOnce(transition, 'end', popOutgoing, false, this);
    } else {
        popOutgoing.call(this);
    }
    if (transition) {
        transition.start();
        return transition;
    }
};


/**
 * Add CoverNode object to the viewport
 * @param {lime.CoverNode} cover Covernode.
 * @param {boolean} opt_addAboveDirector Cover is added above director object.
 */
lime.Director.prototype.addCover = function(cover, opt_addAboveDirector) {
    //mobile safari performes much better with this hack. needs investigation.
    if (goog.userAgent.WEBKIT && goog.userAgent.MOBILE) {
        if (opt_addAboveDirector) {
            this.coverElementAbove.appendChild(cover.domElement);
        }
        else {
            this.coverElementBelow.appendChild(cover.domElement);
        }

    }
    else {
        if (opt_addAboveDirector) {
             goog.dom.insertSiblingAfter(cover.domElement, this.domElement);
        }
        else {
             goog.dom.insertSiblingBefore(cover.domElement, this.domElement);
        }
    }
    cover.director = this;
    this.coverStack_.push(cover);
};

/**
 * Remove CoverNode object from the viewport
 * @param {lime.CoverNode} cover Cover to remove.
 */
lime.Director.prototype.removeCover = function(cover) {
    goog.array.remove(this.coverStack_, cover);
    goog.dom.removeNode(cover.domElement);
};


/**
 * Return bounds of director,
 * @param {goog.math.Box} box Edges.
 * @return {goog.math.Box} new bounds.
 */
lime.Director.prototype.getBounds = function(box) {
    //todo:This should basically be same as boundingbox on lime.node
    var position = this.getPosition(),
        scale = this.getScale();
    return new goog.math.Box(
        box.top - position.y / scale.y,
        box.right - position.x / scale.x,
        box.bottom - position.y / scale.y,
        box.left - position.x / scale.x
    );
};

/**
 * @inheritDoc
 */
lime.Director.prototype.screenToLocal = function(c) {
    var coord = c.clone();
    coord.x -= this.domOffset.x + this.position_.x;
    coord.y -= this.domOffset.y + this.position_.y;

    coord.x /= this.scale_.x;
    coord.y /= this.scale_.y;
    return coord;
};

/**
 * @inheritDoc
 */
lime.Director.prototype.localToScreen = function(c) {
    var coord = c.clone();
    coord.x *= this.scale_.x;
    coord.y *= this.scale_.y;

    coord.x += this.domOffset.x + this.position_.x;
    coord.y += this.domOffset.y + this.position_.y;

    return coord;
};


/**
 * @inheritDoc
 */
lime.Director.prototype.update = function() {
    lime.Node.prototype.update.call(this);

    var i = this.coverStack_.length;
    while (--i >= 0) {
        this.coverStack_[i].update();
    }
};


/**
 * Update dimensions based on viewport dimension changes
 * @private
 */
lime.Director.prototype.invalidateSize_ = function() {

    var stageSize = goog.style.getSize(this.domElement.parentNode);

    if (this.domElement.parentNode == document.body) {
        window.scrollTo(0, 0);
        if (goog.isNumber(window.innerHeight)) {
            stageSize.height = window.innerHeight;
        }
    }

    var realSize = this.getSize().clone().scaleToFit(stageSize);

    var scale = realSize.width / this.getSize().width;
    this.setScale(scale);

    if (stageSize.aspectRatio() < realSize.aspectRatio()) {
        this.setPosition(0, (stageSize.height - realSize.height) / 2);
    }
    else {
        this.setPosition((stageSize.width - realSize.width) / 2, 0);
    }

    this.updateDomOffset_();
    
    // overflow hidden is for hiding away unused edges of document
    // height addition is because scroll(0,0) doesn't work any more if the
    // document has no edge @tonis todo:look for less hacky solution(iframe?).
    if(goog.userAgent.MOBILE && this.domElement.parentNode==document.body){
        if(this.overflowStyle_) goog.style.uninstallStyles(this.overflowStyle_);
        this.overflowStyle_ = goog.style.installStyles(
            'html{height:'+(stageSize.height+120)+'px;overflow:hidden;}');
    }

};

/**
 * Add support for adding game to Springboard as a
 * web application on iOS devices
 */
lime.Director.prototype.makeMobileWebAppCapable = function() {

    var meta = document.createElement('meta');
    meta.name = 'apple-mobile-web-app-capable';
    meta.content = 'yes';
    document.getElementsByTagName('head').item(0).appendChild(meta);

    meta = document.createElement('meta');
    meta.name = 'apple-mobile-web-app-status-bar-style';
    meta.content = 'black';
    document.getElementsByTagName('head').item(0).appendChild(meta);

    var visited = false;
    if (goog.isDef(localStorage)) {
        visited = localStorage.getItem('_lime_visited');
    }

    var ios = (/(ipod|iphone|ipad)/i).test(navigator.userAgent);
    if (ios && !window.navigator.standalone && COMPILED && !visited && this.domElement.parentNode==document.body) {
        alert('Please install this page as a web app by ' +
            'clicking Share + Add to home screen.');
        if (goog.isDef(localStorage)) {
           localStorage.setItem('_lime_visited', true);
        }
    }

};

/**
 * Updates the cached value of directors parentelement position in the viewport
 * @private
 */
lime.Director.prototype.updateDomOffset_ = function() {
    this.domOffset = goog.style.getPageOffset(this.domElement.parentNode);
};

/**
 * @private
 */
lime.Director.prototype.keyUpHandler_ = function(e){
   if(e.altKey && String.fromCharCode(e.keyCode).toLowerCase()=='d'){
       if(this.debugModeOn_){
           goog.style.uninstallStyles(this.debugModeOn_);
           this.debugModeOn_ = null;
       }
       else {
           this.debugModeOn_ = goog.style.installStyles('.lime-scene div,.lime-scene img,'+
            '.lime-scene canvas{border: 1px solid #c00;}');
       }
       e.stopPropagation();
       e.preventDefault();
   }
}

/**
 * @inheritDoc
 */
lime.Director.prototype.hitTest = function(e) {
    if (e && e.screenPosition)
    e.position = this.screenToLocal(e.screenPosition);
    return true;
};
