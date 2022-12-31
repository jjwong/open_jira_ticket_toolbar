/* eslint-env node */
/*eslint max-lines-per-function: ["error", 30]*/
module.exports = function (config) {
  config.set({
    // To debug, run `npm run karma-debug` and press the "Debug" button in the browser window
    browsers: ["ChromeHeadless"],
    frameworks: ["jasmine"],
    files: [
      "js/main.js",
      "js/jasmine/spec/MainSpec.js",
      { pattern: "js/jasmine/spec/*.js", included: true },
    ],
    autoWatch: false,
    singleRun: true,
    colors: true,
    sourceMaps: false,
    exclude: [],
    preprocessors: {
      "js/**/*.js": ["coverage"],
    },
    reporters: ["dots", "coverage"],
    coverageReporter: {
      reporters: [
        { type: "text-summary" },
        { type: "html", dir: "coverage/" },
        { type: "lcov", dir: "coverage/" },
        { type: "lcovonly", dir: "coverage/" },
      ],
      check: {
        global: {
          functions: 0,
          statements: 0,
          branches: 0,
          lines: 0,
        },
      },
    },
  });
};
