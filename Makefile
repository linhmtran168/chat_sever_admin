test-server:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		test/server/*.js

test-server-w:
	@NODE_ENV=test ./node_modules/.bin/mocha -w \
		test/server/*.js

run-production:
	@NODE_ENV=production forever /home/linhtm/sites/ogorinAdmin start -l forever_ogorinAdmin.log -o logs/out.log -e logs/err.log -a app.js 

restart:
	@NODE_ENV=production forever restart Cqrx

.PHONY: test-server test-server-w run-production
