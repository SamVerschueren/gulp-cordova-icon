#!/usr/bin/env node
'use strict';

// module dependencies
var path = require('path'),
    fs = require('fs'),
    gm = require('gm'),
    async = require('async');

// variables
var platforms = require('../platforms.json'),
    pkg = require('../../package.json'),
    platform = platforms[process.env.CORDOVA_PLATFORMS];

if(!platform) {
    // Exit if the platform could not be found
    return 0;
}

/**
 * Generates all the icons for the platform that is being build.
 *
 * @param  {Function} done Called when all the icons are generated.
 */
function generate(done) {
    var root = path.join(process.env.PWD, 'platforms', process.env.CORDOVA_PLATFORMS, platform.root.replace('{appName}', pkg.name));

    async.each(platform.icons, function(icon, next) {
        var dest = path.join(root, icon.file);

        if(fs.existsSync(path.dirname(dest))) {
            gm(path.join(__dirname, '../res/icon.png')).resize(icon.dimension, icon.dimension).write(dest, next);
        }
        else {
            next();
        }
    }, done);
}

// Start generating
return generate(function() {
    // Just exit, regarding of what happened
    return 0;
});
