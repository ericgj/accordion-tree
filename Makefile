
build: components index.js builder.js accordion-tree.css leaf.js branch.js
	@component build --dev

leaf.js: leaf.html
	@minstache < $< > $@

branch.js: branch.html
	@minstache < $< > $@

components: component.json
	@component install --dev

clean:
	rm -fr build components 

.PHONY: clean
