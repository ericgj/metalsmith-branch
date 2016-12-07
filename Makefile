node_modules: package.json
	@npm install

test: node_modules
	@"./node_modules/.bin/mocha" -R spec

.PHONY: test
