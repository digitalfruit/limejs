LIMEPY=python bin/lime.py

CLOSURE=$(shell find closure -name "*.js")
LIME=$(shell find lime/src)
DEMO_GAMES_DEPS=$(CLOSURE) $(LIME) lime/css/lime.css.soy.js

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


lime/demos/roundball/compiled/roundball.js: $(DEMO_GAMES_DEPS)
	$(LIMEPY) build rb -a -o $@

lime/demos/zlizer/compiled/zlizer.js: $(DEMO_GAMES_DEPS)
	$(LIMEPY) build zlizer -a -o $@

lime/demos/pong/compiled/pong.js: $(DEMO_GAMES_DEPS)
	$(LIMEPY) build pong -o $@

%.manifest: .FORCE
	sed -i "" -e "s/\(# Updated on: \).*/\1$$(date '+%Y-%m-%d %H:%M:%S')/" $@
	
.FORCE:


