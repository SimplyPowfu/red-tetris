// Initialize JSDOM
require('jsdom-global')('<!doctype html><html><body></body></html>', {
	url: 'http://localhost',
});

// Polyfills for React 17+ (Must be before React is required anywhere)
global.requestAnimationFrame = function(callback) {
	return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function(id) {
	clearTimeout(id);
};
require('babel-polyfill') // for async/await