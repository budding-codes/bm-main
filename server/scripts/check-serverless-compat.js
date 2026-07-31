/**
 * Guards against the failure mode that took the production API down:
 * a dependency that can only be loaded as an ES module.
 *
 * Serverless runtimes commonly start Node with `--no-experimental-require-module`,
 * so `require()` of an ES module throws `ERR_REQUIRE_ESM` at import time. Locally
 * that flag is off by default, which is why such a dependency installs, passes
 * every test and only fails once deployed — where it takes down the entire
 * function, including CORS preflights, before any of our code runs.
 *
 * This script re-runs itself with the same flags the deployed runtime uses and
 * loads the whole application graph. Run it before deploying:
 *   npm run check:serverless
 */
const { spawnSync } = require('child_process');

const RUNTIME_FLAGS = ['--no-experimental-require-module', '--no-experimental-detect-module'];
const RELAUNCH_MARKER = 'BM_SERVERLESS_COMPAT_CHILD';

if (!process.env[RELAUNCH_MARKER]) {
	const result = spawnSync(process.execPath, [...RUNTIME_FLAGS, __filename], {
		stdio: 'inherit',
		env: { ...process.env, [RELAUNCH_MARKER]: '1' }
	});

	process.exit(result.status === null ? 1 : result.status);
}

console.log(`Loading the application under ${RUNTIME_FLAGS.join(' ')} (Node ${process.version})`);
console.log(`require() of ES modules is ${process.features.require_module ? 'ENABLED' : 'DISABLED'}, matching the deployed runtime.\n`);

const checks = [
	['api/index.js (serverless entrypoint)', () => require('../api/index')],
	['src/app.js', () => require('../src/app')],
	['src/routes', () => require('../src/routes')],
	['src/content/renderer', () => require('../src/content/renderer')],
	['src/services/blogService', () => require('../src/services/blogService')],
	['src/services/mediaService', () => require('../src/services/mediaService')],
	['src/services/cloudinaryService', () => require('../src/services/cloudinaryService')]
];

let failed = 0;

for (const [label, load] of checks) {
	try {
		load();
		console.log(`  PASS  ${label}`);
	} catch (error) {
		failed += 1;
		console.log(`  FAIL  ${label}`);
		console.log(`        ${error.code || error.name}: ${error.message.split('\n')[0]}`);
	}
}

// Rendering exercises the content pipeline end to end, which is where the ESM-only
// packages were reached from.
try {
	const { renderContent } = require('../src/content/renderer');
	const result = renderContent({
		type: 'doc',
		content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Compatibility check' }] }]
	});

	if (result.contentHtml === '<p>Compatibility check</p>') {
		console.log('  PASS  renderContent produces sanitised HTML');
	} else {
		failed += 1;
		console.log(`  FAIL  renderContent returned unexpected HTML: ${result.contentHtml}`);
	}
} catch (error) {
	failed += 1;
	console.log('  FAIL  renderContent');
	console.log(`        ${error.code || error.name}: ${error.message.split('\n')[0]}`);
}

console.log(failed === 0
	? '\nAll modules load under the deployed runtime.'
	: `\n${failed} check(s) failed. These would fail every request in production.`);

process.exit(failed === 0 ? 0 : 1);
