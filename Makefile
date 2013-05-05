
build: components index.js accordion-tree.css leaf.js branch.js
	@component build --dev

leaf.js: leaf.html
	@minstache < $< > $@

branch.js: branch.html
	@minstache < $< > $@

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: clean
