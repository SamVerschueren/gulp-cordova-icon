'use strict';
var path = require('path');
var fs = require('fs-extra');
var through = require('through2');
var gutil = require('gulp-util');
var mkdirp = require('mkdirp');
var npmi = require('npmi');
var mime = require('mime-types');
var Promise = require('pinkie-promise');
var pify = require('pify');
var sizeOf = require('image-size');
var _ = require('lodash');
var memFsEditor = require('mem-fs-editor').create(require('mem-fs').create());
var platforms = require('./platforms.json');

var hookDependencies = ['gm', 'pify', 'pinkie-promise', 'elementtree', 'mkdirp'];
var minSize = _.max(_.flatten(_.map(platforms, _.property('icons'))), 'dimension').dimension;
var errorHandlingStrategies = ['lenient', 'warn', 'throw'];

// export the module
module.exports = function (src, options) {
	options = options || {};
	options.errorHandlingStrategy = errorHandlingStrategies.indexOf(options.errorHandlingStrategy) === -1 ? errorHandlingStrategies[0] : options.errorHandlingStrategy;

	// Determine the type of the image provided
	var mimetype = mime.lookup(src);
	var isPNG = mimetype.indexOf('image/png') === 0;
	var isSVG = mimetype.indexOf('image/svg') === 0;

	/**
	 * Copy the icon to the res subdirectory of the cordova build.
	 */
	function copyIcon() {
		var dest = path.join(process.env.PWD, 'res');

		// Make sure the destination exists
		mkdir(dest);

		return pify(fs.copy.bind(fs), Promise)(src, path.join(dest, 'icon.' + mime.extension(mimetype)));
	}

	/**
	 * Copy all the hooks in the `hooks` directory to the `hooks` directory
	 * of the cordova project.
	 */
	function copyHooks() {
		var src = path.join(__dirname, 'hooks');
		var dest = path.join(process.env.PWD, 'hooks');

		return pify(fs.copy.bind(fs), Promise)(path.join(__dirname, 'platforms.json'), path.join(dest, 'platforms.json'))
			.then(function () {
				memFsEditor.copyTpl(src, dest, options);

				return pify(memFsEditor.commit.bind(memFsEditor))();
			})
			.then(function () {
				// Make all the scripts executable in the Cordova project
				fs.readdirSync(src).forEach(function (hook) {
					var hookPath = path.join(dest, hook);

					fs.readdirSync(hookPath).forEach(function (script) {
						fs.chmodSync(path.join(hookPath, script), '755');
					});
				});
			});
	}

	/**
	 * Install all the dependencies that are used by the hooks.
	 */
	function installHookDependencies() {
		return Promise.all(hookDependencies.map(function (dependency) {
			return pify(npmi, Promise)({name: dependency, path: path.join(process.env.PWD, 'hooks')});
		}));
	}

	/**
	 * Conditional mkdir. If the file does not exist, it will create the directory, otherwise
	 * it will not create the directory.
	 */
	function mkdir(dir) {
		if (!fs.existsSync(dir)) {
			mkdirp.sync(dir);
		}

		return dir;
	}

	return through.obj(function (file, enc, cb) {
		// Change the working directory
		process.env.PWD = file.path;

		this.push(file);

		if (!fs.existsSync(src)) {
			// If the image icon does not exist, throw an error
			return cb(new gutil.PluginError('gulp-cordova-icon', 'The icon file could not be found.'));
		}

		if (!isPNG && !isSVG) {
			// If the image icon is not a png file, throw an error
			return cb(new gutil.PluginError('gulp-cordova-icon', 'You can only provide a .png or .svg image icon.'));
		}

		// Calculate the size of the image
		var size = sizeOf(src);

		if (size.width !== size.height) {
			// Test if the image is a square
			return cb(new gutil.PluginError('gulp-cordova-icon', 'Please provide a square image.'));
		}

		if (isPNG && size.width < minSize) {
			// Test if the image size is large enough if a PNG is provided
			return cb(new gutil.PluginError('gulp-cordova-icon', 'The icon should have at least a dimension of ' + minSize + ' pixels.'));
		}

		// Execute all the steps
		Promise.all([
			copyIcon(),
			copyHooks(),
			installHookDependencies()
		]).then(function () {
			cb();
		}).catch(cb);
	});
};
