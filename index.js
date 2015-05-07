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
    gutil = require('gulp-util'),
    gm = require('gm'),
    async = require('async'),
    mkdirp = require('mkdirp');

var platforms = require('./platforms.json');

module.exports = function(src) {

    function generate(dest, done) {
        async.each(Object.keys(platforms), function(platform, nextPlatform) {
            var root = path.join(dest, platform);

            async.each(platforms[platform], function(icon, nextIcon) {
                var dest = path.join(root, icon.file);

                mkdir(path.dirname(dest));

                if(fs.existsSync(path.dirname(dest))) {
                    gm(src).resize(icon.dimension, icon.dimension).write(dest, nextIcon);
                }
                else {
                    nextIcon();
                }
            }, nextPlatform);
        }, done);
    }

    function mkdir(dir) {
        if(!fs.existsSync(dir)) {
            mkdirp.sync(dir);
        }

        return dir;
    }

    return through.obj(function(file, enc, cb) {
        // Change the working directory
        process.env.PWD = file.path;

        cb();
    }, function(cb) {
        if(!fs.existsSync(src)) {
            return cb(new gutil.PluginError('gulp-cordova-icon', 'The icon file could not be found.'));
        }

        // TODO check if the icon is an image

        generate(path.join(process.env.PWD, 'res'), cb);
    });
};
