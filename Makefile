LIMEPY=python bin/lime.py

CLOSURE=$(shell find closure -name "*.js")
LIME=$(shell find lime/src)
DEMO_GAMES_DEPS=$(CLOSURE) $(LIME) lime/css/lime.css.soy.js

ifeq ($(debug), true)
	BUILD_FLAGS=-m
endif

soy: css demos

css: lime/css/lime.css.soy.js

demos: lime/demos/tests/assets/monster.plist.soy.js lime/demos/tests/assets/spinner/spinner.zwoptex.soy.js

%.soy.js: %.soy
	$(LIMEPY) gensoy $<

%.json.js: %.json
	$(LIMEPY) gensoy $<

demo-games: roundball zlizer pong

roundball: lime/demos/roundball/compiled/roundball.js lime/demos/roundball/compiled/roundball.manifest
zlizer: lime/demos/zlizer/compiled/zlizer.js lime/demos/zlizer/compiled/zlizer.manifest
pong: lime/demos/pong/compiled/pong.js lime/demos/pong/compiled/pong.manifest


lime/demos/roundball/compiled/roundball.js: $(DEMO_GAMES_DEPS) lime/demos/roundball/*.js
	$(LIMEPY) build rb -a -o $@ $(BUILD_FLAGS)

lime/demos/zlizer/compiled/zlizer.js: $(DEMO_GAMES_DEPS) lime/demos/zlizer/*.js
	$(LIMEPY) build zlizer -a -o $@ $(BUILD_FLAGS)

lime/demos/pong/compiled/pong.js: $(DEMO_GAMES_DEPS) lime/demos/pong/*.js
	$(LIMEPY) build pong -o $@ $(BUILD_FLAGS)

%.manifest: .FORCE
	sed -i "" -e "s/\(# Updated on: \).*/\1$$(date '+%Y-%m-%d %H:%M:%S')/" $@
	
.FORCE:
	
ROUNDBALL_ASSETS = $(shell find lime/demos/roundball/assets -type f)
ZLIZER_ASSETS = $(shell find lime/demos/zlizer/assets -type f)
	
ifdef EJECTA_ROUNDBALL

ejecta-roundball: $(EJECTA_ROUNDBALL)/App/index.js | ejecta-roundball-assets

$(EJECTA_ROUNDBALL)/App/index.js: $(DEMO_GAMES_DEPS) lime/demos/roundball/*.js
	$(LIMEPY) build rb -m -o $@
	echo "\nrb.start(document.getElementById('canvas'));" >> $@
	cd $(EJECTA_ROUNDBALL); \
	xcodebuild  VALID_ARCHS=i386 -configuration Debug clean  build  -sdk iphonesimulator -scheme Ejecta

ejecta-roundball-assets: $(patsubst lime/demos/roundball/%, $(EJECTA_ROUNDBALL)/App/%, $(ROUNDBALL_ASSETS))

$(EJECTA_ROUNDBALL)/App/assets/%: lime/demos/roundball/assets/%
	mkdir -p $(EJECTA_ROUNDBALL)/App/assets
	cp $< $@

endif

ifdef EJECTA_ZLIZER

ejecta-zlizer: $(EJECTA_ZLIZER)/App/index.js | ejecta-zlizer-assets

$(EJECTA_ZLIZER)/App/index.js: $(DEMO_GAMES_DEPS) lime/demos/zlizer/*.js
	$(LIMEPY) build zlizer -m -o $@
	echo "\nzlizer.start(document.getElementById('canvas'));" >> $@
	cd $(EJECTA_ZLIZER); \
	xcodebuild  VALID_ARCHS=i386 -configuration Debug clean  build  -sdk iphonesimulator -scheme Ejecta

ejecta-zlizer-assets: $(patsubst lime/demos/zlizer/%, $(EJECTA_ZLIZER)/App/%, $(ZLIZER_ASSETRS))

$(EJECTA_ZLIZER)/App/assets/%: lime/demos/zlizer/assets/%
	mkdir -p $(EJECTA_ZLIZER)/App/assets
	cp $< $@

endif

ifdef COCOON_ROUNDBALL

TEMPDIR:=$(shell mktemp -u -d -t roundball-cocoonjs)

cocoon-roundball: $(COCOON_ROUNDBALL)

$(COCOON_ROUNDBALL):  $(DEMO_GAMES_DEPS) lime/demos/roundball/*.js $(ROUNDBALL_ASSSETS) lime/templates/cocoonjs/index.html
	mkdir  $(TEMPDIR)
	$(LIMEPY) build rb -m -o $(TEMPDIR)/index.js
	cp lime/templates/cocoonjs/index.html $(TEMPDIR)
	sed -i "" -e "s/{init}/rb.start(canvas);/" $(TEMPDIR)/index.html
	cp -rf lime/demos/roundball/assets $(TEMPDIR)
	cd $(TEMPDIR); zip -r roundball.zip . -x ".*"
	cp -rf $(TEMPDIR)/roundball.zip $(COCOON_ROUNDBALL)
	rm -r $(TEMPDIR)

endif

ifdef COCOON_ZLIZER

TEMPDIR:=$(shell mktemp -u -d -t zlizer-cocoonjs)

cocoon-zlizer: $(COCOON_ZLIZER)

$(COCOON_ZLIZER):  $(DEMO_GAMES_DEPS) lime/demos/zlizer/*.js $(ZLIZER_ASSSETS) lime/templates/cocoonjs/index.html
	mkdir  $(TEMPDIR)
	$(LIMEPY) build zlizer -m -o $(TEMPDIR)/index.js
	cp lime/templates/cocoonjs/index.html $(TEMPDIR)
	sed -i "" -e "s/{init}/zlizer.start(canvas);/" $(TEMPDIR)/index.html
	cp -rf lime/demos/zlizer/assets $(TEMPDIR)
	cd $(TEMPDIR); zip -r zlizer.zip . -x ".*"
	cp -rf $(TEMPDIR)/zlizer.zip $(COCOON_ZLIZER)
	rm -r $(TEMPDIR)

endif