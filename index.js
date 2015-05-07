'use strict';

/**
 * This plugin can be used to add an icon to your cordova project
 *
 * @author Sam Verschueren      <sam.verschueren@gmail.com>
 * @since  1 May 2015
 */

// module dependencies
var path = require('path'),
    fs = require('fs-extra'),
    through = require('through2'),
    gutil = require('gulp-util');

module.exports = function(icon) {

    return through.obj(function(file, enc, cb) {
        // Change the working directory
        process.env.PWD = file.path;

        cb();
    }, function(cb) {
        if(!fs.existsSync(icon)) {
            return cb(new gutil.PluginError('gulp-cordova-icon', 'The icon file could not be found.'));
        }

        // TODO check if it is an image

        var dest = path.join(process.env.PWD, 'res');

        if(!fs.existsSync(dest)) {
            // If the 'res' directory does not exist, create it
            fs.mkdirSync(dest);
        }

        // Copy the icon to the res folder
        fs.copy(icon, path.join(dest, 'icon.png'), function(err) {
            if(err) {
                // Return an error if an error occurred
                return cb(new gutil.PluginError('gulp-cordova-icon', err));
            }

            cb();
        });
    });
};
