#!/usr/bin/env node
'use strict';

/**
 * This hook is ran before the build proces and generates all the icons
 * for the platform that is being build.
 *
 * @author Sam Verschueren
 * @since  7 May 2015
 */

// module dependencies
var path = require('path'),
    fs = require('fs'),
    gm = require('gm'),
    async = require('async'),
    mkdirp = require('mkdirp'),
    et = require('elementtree');

// variables
var platforms = require('../platforms.json'),
    platform = platforms[process.env.CORDOVA_PLATFORMS];

if(!platform) {
    // Exit if the platform could not be found
    return 0;
}

/**
 * Loads the project name from the config.xml file.
 *
 * @param {Function} callback Called when the name is retrieved.
 */
function loadProjectName(callback) {
    try {
        var contents = fs.readFileSync(path.join(__dirname, '../../config.xml'), 'utf-8');
        if(contents) {
            //Windows is the BOM. Skip the Byte Order Mark.
            contents = contents.substring(contents.indexOf('<'));
        }

        var doc = new et.ElementTree(et.XML(contents)),
            root = doc.getroot();

        if(root.tag !== 'widget') {
            throw new Error('config.xml has incorrect root node name (expected "widget", was "' + root.tag + '")');
        }

        var tag = root.find('./name');

        if(!tag) {
            throw new Error('config.xml has no name tag.');
        }

        callback(tag.text);
    }
    catch (e) {
        console.error('Could not loading config.xml');
        throw e;
    }
}

/**
 * This method will update the config.xml file for the target platform. It will
 * add the icon tags to the config file.
 */
function updateConfig(target, callback) {
    try {
        var contents = fs.readFileSync(path.join(__dirname, '../../config.xml'), 'utf-8');
        if(contents) {
            //Windows is the BOM. Skip the Byte Order Mark.
            contents = contents.substring(contents.indexOf('<'));
        }

        var doc = new et.ElementTree(et.XML(contents)),
            root = doc.getroot();

        if(root.tag !== 'widget') {
            throw new Error('config.xml has incorrect root node name (expected "widget", was "' + root.tag + '")');
        }

        var platformElement = doc.find('./platform/[@name="' + target + '"]');

        if(platformElement) {            
            // Find all the child icon elements
            var icons = platformElement.findall('./icon');
            
            // Remove all the icons in the platform element
            icons.forEach(function(icon) {
                platformElement.remove(icon);    
            });
        }
        else {
            // Create a new element if no element was found
            platformElement = new et.Element('platform');
            platformElement.attrib.name = target;
            
            // Only append the element if it does not yet exist
            doc.getroot().append(platformElement);
        }

        // Add all the icons
        for(var i=0; i<platforms[target].icons.length; i++) {
            var iconElement = new et.Element('icon');
            iconElement.attrib.src = 'res/' + target + '/' + platforms[target].icons[i].file;

            platformElement.append(iconElement);
        }

        // Write the file
        fs.writeFileSync(path.join(__dirname, '../../config.xml'), doc.write({indent: 4}), 'utf-8');
        
        callback();
    }
    catch (e) {
        console.error('Could not loading config.xml');
        throw e;
    }
}

/**
 * Generates all the icons for the platform that is being build.
 *
 * @param  {Function} done Called when all the icons are generated.
 */
function generate(done) {
    loadProjectName(function(name) {
        var root;

        if(platform.xml === true) {
            // This is a platform that uses config.xml to set the icons
            root = path.join(process.env.PWD, 'res', process.env.CORDOVA_PLATFORMS);
        }
        else {
            // This means we should overwrite the items at the platform root
            root = path.join(process.env.PWD, 'platforms', process.env.CORDOVA_PLATFORMS, platform.root.replace('{appName}', name));
        }
        
        // Default, the icon is a PNG image
        var source = path.join(__dirname, '../../res/icon.png');

        if(!fs.existsSync(source)) {
            // If the PNG image does not exist, it means it is an SVG image
            source = path.join(__dirname, '../../res/icon.svg');
        }

        async.each(platform.icons, function(icon, next) {
            var dest = path.join(root, icon.file);

            if(!fs.existsSync(path.dirname(dest))) {
                mkdirp.sync(path.dirname(dest));
            }

            gm(source).density(icon.dimension, icon.dimension).write(dest, next);
        }, function(err) {
            if(err) {
                return done(err);
            }

            if(!platform.xml) {
                return done();
            }

            updateConfig(process.env.CORDOVA_PLATFORMS, done);
        });
    });
}

// Start generating
return generate(function() {
    // Just exit, regarding of what happened
    return 0;
});
