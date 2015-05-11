# gulp-cordova-icon

> Add an icon to your cordova project.

## Installation (not yet available)

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

When the project is build for a platform, the icon provided will be used as application icon. It will generate all the different sizes
of the icon and places them in the correct location.

## API

### icon(file)

#### file

*Required*  
Type: `string`

The path to the `png` icon that will be used as application icon.

## Related

See [`gulp-cordova`](https://github.com/SamVerschueren/gulp-cordova) for the full list of available packages.

## Contributors

- Sam Verschueren [<sam.verschueren@gmail.com>]

## License

MIT © Sam Verschueren
