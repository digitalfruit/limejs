LIMEPY=python bin/lime.py

soy: css demos

css: lime/css/lime.css.soy.js

demos: lime/demos/tests/assets/monster.plist.soy.js lime/demos/tests/assets/spinner/spinner.zwoptex.soy.js

%.soy.js: %.soy
	$(LIMEPY) gensoy $<

%.json.js: %.json
	$(LIMEPY) gensoy $<

