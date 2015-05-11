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
    mkdirp = require('mkdirp'),
    npmi = require('npmi'),
    mime = require('mime-types'),
    Q = require('q'),
    sizeOf = require('image-size'),
    _ = require('lodash');

var platforms = require('./platforms.json'),
    hookDependencies = ['gm', 'async', 'elementtree', 'mkdirp'],
    minSize = _.max(_.flatten(_.map(platforms, _.property('icons'))), 'dimension').dimension;

// export the module
module.exports = function(src) {

    /**
     * Copy the icon to the res subdirectory of the cordova build.
     */
    function copyIcon() {
        var deferred = Q.defer(),
            dest = path.join(process.env.PWD, 'res');

        // Make sure the destination exists
        mkdir(dest);

        // Start copying
        fs.copy(src, path.join(dest, 'icon.png'), function(err) {
            if(err) {
                // Reject if an error occurred
                return deferred.reject(err);
            }

            // Resolve
            deferred.resolve();
        });

        return deferred.promise;
    }

    /**
     * Copy all the hooks in the `hooks` directory to the `hooks` directory
     * of the cordova project.
     */
    function copyHooks() {
        var deferred = Q.defer(),
            src = path.join(__dirname, 'hooks'),
            dest = path.join(process.env.PWD, 'hooks');

        // Copy the platforms.json file that describes the icons
        fs.copySync(path.join(__dirname, 'platforms.json'), path.join(dest, 'platforms.json'));

        // Copy all the hooks from the hooks directory
        fs.copy(src, dest, function(err) {
            if(err) {
                // Stop execution if an error occurred
                return deferred.reject(err);
            }

            // Mak all the scripts executable in the cordova project
            fs.readdirSync(src).forEach(function(hook) {
                var hookPath = path.join(dest, hook);

                fs.readdirSync(hookPath).forEach(function(script) {
                    var scriptPath = path.join(hookPath, script);

                    fs.chmodSync(scriptPath, '755');
                });
            });

            deferred.resolve();
        });

        return deferred.promise;
    }

    /**
     * Install all the dependencies that are used by the hooks.
     */
    function installHookDependencies() {
        var deferred = Q.defer();

        async.each(hookDependencies, function(pkg, next) {
            npmi({name: pkg, path: path.join(process.env.PWD, 'hooks')}, next);
        }, function(err) {
            if(err) {
                return deferred.reject(err);
            }

            deferred.resolve();
        });

        return deferred.promise;
    }

    /**
     * Conditional mkdir. If the file does not exist, it will create the directory, otherwise
     * it will not create the directory.
     */
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
            // If the image icon does not exist, throw an error
            return cb(new gutil.PluginError('gulp-cordova-icon', 'The icon file could not be found.'));
        }

        if(mime.lookup(src) !== 'image/png') {
            // If the image icon is not a png file, throw an error
            return cb(new gutil.PluginError('gulp-cordova-icon', 'You can only provide a .png image icon.'));
        }

        // Calculate the size of the image
        var size = sizeOf(src);

        if(size.width !== size.height) {
            // Test if the image is a square
            return cb(new gutil.PluginError('gulp-cordova-icon', 'Please provide a square image.'));
        }

        if(size.width < minSize) {
            // Test if the image size is large enough
            return cb(new gutil.PluginError('gulp-cordova-icon', 'The icon should have at least a dimension of ' + minSize + ' pixels.'));
        }

        // Execute all the steps
        Q.all([
            copyIcon(),
            copyHooks(),
            installHookDependencies()
        ]).then(function() {
            cb();
        }).catch(function(err) {
            cb(err);
        });
    });
};
