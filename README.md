# gulp-cordova-icon

> Generates all the icons for your Cordova build automatically

## Installation

```bash
npm install --save-dev gulp-cordova-icon
```

This library depends on [GraphicsMagick](http://www.graphicsmagick.org/) or [ImageMagick](http://www.imagemagick.org/), so be sure to install
one of those.

## Usage

```JavaScript
var gulp = require('gulp'),
    create = require('gulp-cordova-create'),
    icon = require('gulp-cordova-icon'),
    android = require('gulp-cordova-android');

gulp.task('build', function() {
    return gulp.src('dist')
        .pipe(create())
        .pipe(icon('res/my-icon.png'))
        .pipe(android())
        .pipe(gulp.dest('build'));
});
```

When the project is build for a platform, the icon provided will be used as application icon. It will generate all the different sizes of the icon and puts them in the correct location.

### Icons

The plugin accepts two icon formats, `png` and `svg`. When providing an `svg` image icon, the size of the icon does not matter. If you provide a `png` icon, the size of the icon should be
at least the size of the largest image that should be generated. This depends on the platform you are building for. If the image is to small, the plugin will throw an error indicating
that you should upload a larger icon.

## API

### icon(file)

#### file

*Required*  
Type: `string`

The path to the `png` or `svg` icon that will be used as application icon.

## Related

See [`gulp-cordova`](https://github.com/SamVerschueren/gulp-cordova) for the full list of available packages.

## Contributors

- Sam Verschueren [<sam.verschueren@gmail.com>]

## License

MIT © Sam Verschueren
