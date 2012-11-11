test-server:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		test/server/*.js

test-server-w:
	@NODE_ENV=test ./node_modules/.bin/mocha -w \
		test/server/*.js

run-production:
	@NODE_ENV=production forever -w ---watchDirectory /home/linhtm/sites/ogorinAdmin start -l forever.log -o logs/out.log -e logs/err.log  app.js

restart:
	@NODE_ENV=production forever restart UJYJ

.PHONY: test-server test-server-w run-production
