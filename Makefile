install:
	npm ci
lint:
	npx eslint .
server:
	npx webpack serve --mode development
build:
	npx webpack