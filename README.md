# gulp-cordova-icon

> Generates all the icons for your Cordova build automatically

## Installation

```bash
npm install --save-dev gulp-cordova-icon
```

This library depends on [GraphicsMagick](http://www.graphicsmagick.org/) or [ImageMagick](http://www.imagemagick.org/), so be sure to install
one of those.

## Usage

```javascript
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

## API

### icon(file [, options])

#### file

*Required*
Type: `string`

The path to the `png` or `svg` icon that will be used as application icon.

#### options

Type: `object`

##### errorHandlingStrategy

Type: `string`
Defaults to : `lenient`

The error handling strategy of the process. This field has 3 possible values:
* `lenient`, the default one : any encountered error is silently discarded and the build continues
* `warn` : any encountered error is logged as a warning on the console
* `throw` : any encountered error is thrown and interrupts the Gulp stream

## Related

See [`gulp-cordova`](https://github.com/SamVerschueren/gulp-cordova) for the full list of available packages.

## Contributors

- Sam Verschueren [<sam.verschueren@gmail.com>]
- Vincent Vieira [<vincent.vieira@supinfo.com>]

## License

MIT © Sam Verschueren
