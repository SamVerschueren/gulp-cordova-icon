#!/usr/bin/env node
'use strict';
var path = require('path');
var fs = require('fs');
<% if (locals.imageMagick) { %>
var gm = require('gm').subClass({imageMagick: true});
<% } else { %>
var gm = require('gm');
<% } %>
var pify = require('pify');
var Promise = require('pinkie-promise');
var mkdirp = require('mkdirp');
var et = require('elementtree');

// variables
var platforms = require('../platforms.json');
var platform = platforms[process.env.CORDOVA_PLATFORMS];

if (!platform) {
	// Exit if the platform could not be found
	<% if (errorHandlingStrategy === 'lenient') { %>
	return 0;
	<% } else { %>
	throw new Error('This platform is not supported by gulp-cordova-icon.');
	<% } %>
}

/**
 * Loads the project name from the config.xml file.
 *
 * @param {Function} callback Called when the name is retrieved.
 */
function loadProjectName(callback) {
	try {
		var contents = fs.readFileSync(path.join(__dirname, '../../config.xml'), 'utf-8');
		if (contents) {
			// Windows is the BOM. Skip the Byte Order Mark.
			contents = contents.substring(contents.indexOf('<'));
		}

		var doc = new et.ElementTree(et.XML(contents));
		var root = doc.getroot();

		if (root.tag !== 'widget') {
			throw new Error('config.xml has incorrect root node name (expected "widget", was "' + root.tag + '")');
		}

		var tag = root.find('./name');

		if (!tag) {
			throw new Error('config.xml has no name tag.');
		}

		return tag.text;
	} catch (e) {
		console.error('Could not loading config.xml');
		throw e;
	}
}

/**
 * This method will update the config.xml file for the target platform. It will
 * add the icon tags to the config file.
 */
function updateConfig(target) {
	try {
		var contents = fs.readFileSync(path.join(__dirname, '../../config.xml'), 'utf-8');
		if (contents) {
			// Windows is the BOM. Skip the Byte Order Mark.
			contents = contents.substring(contents.indexOf('<'));
		}

		var doc = new et.ElementTree(et.XML(contents));
		var root = doc.getroot();

		if (root.tag !== 'widget') {
			throw new Error('config.xml has incorrect root node name (expected "widget", was "' + root.tag + '")');
		}

		var platformElement = doc.find('./platform/[@name="' + target + '"]');

		if (platformElement) {
			platformElement.findall('./icon').forEach(platformElement.remove);
		} else {
			platformElement = new et.Element('platform');
			platformElement.attrib.name = target;

			doc.getroot().append(platformElement);
		}

		// Add all the icons
		for(var i=0; i<platforms[target].icons.length; i++) {
			var iconElement = new et.Element('icon');
			iconElement.attrib.src = 'res/' + target + '/' + platforms[target].icons[i].file;

			platformElement.append(iconElement);
		}

		fs.writeFileSync(path.join(__dirname, '../../config.xml'), doc.write({indent: 4}), 'utf-8');
	} catch (e) {
		console.error('Could not load config.xml');
		throw e;
	}
}

function generate() {
	var projectName = loadProjectName();
	var root;

	if (platform.xml === true) {
		// This is a platform that uses config.xml to set the icons
		root = path.join(process.env.PWD, 'res', process.env.CORDOVA_PLATFORMS);
	} else {
		// This means we should overwrite the items at the platform root
		root = path.join(process.env.PWD, 'platforms', process.env.CORDOVA_PLATFORMS, platform.root.replace('{appName}', projectName));
	}

	// Default, the icon is a PNG image
	var source = path.join(__dirname, '../../res/icon.png');
	var fn = 'resize';

	if (!fs.existsSync(source)) {
		// If the PNG image does not exist, it means it is an SVG image
		source = path.join(__dirname, '../../res/icon.svg');
		fn = 'density';
	}

	return Promise.all(platform.icons.forEach(function (icon) {
		var dest = path.join(root, icon.file);

		if (!fs.existsSync(path.dirname(dest))) {
			mkdirp.sync(path.dirname(dest));
		}

		var image = gm(source)[fn](icon.dimension, icon.dimension);

		return pify(image.write.bind(image), Promise)(dest);
	})).then(function () {
		if (platform.xml) {
			updateConfig(process.env.CORDOVA_PLATFORMS);
		}
	});
}

Promise.resolve()
	.then(generate)
	.catch(function (err) {
		<% if(errorHandlingStrategy === 'warn') { %>
		console.warn(err.message);
		<% } else if(errorHandlingStrategy === 'throw') { %>
		throw err;
		<% } %>
	});
