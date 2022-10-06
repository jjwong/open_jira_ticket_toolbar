/* eslint-env node */
module.exports = function (config) {
	config.set({
		// To debug, run `npm run karma-debug` and press the "Debug" button in the browser window
		browsers: [ 'ChromeHeadless' ],
		frameworks: [ 'jasmine' ],
		files: [
			'js/popup.js',
			'js/jasmine/spec/PopupSpec.js'
		],
		autoWatch: false,
		singleRun: true,
		exclude: [],
		preprocessors: {
			'js/*.js': [ 'coverage' ]
		},
		reporters: [ 'dots', 'coverage' ],
		coverageReporter: {
			reporters: [
				{ type: 'text-summary' },
				{ type: 'html', dir:'coverage/' },
				{ type: 'lcovonly', dir: 'coverage/' },
			],
			check: { global: {
				functions: 0,
				statements: 0,
				branches: 0,
				lines: 0
			} }
		}
	});
};