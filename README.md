# gulp-cordova-icon

> Generates all the icons for your Cordova build automatically

## Installation

```
npm install --save-dev gulp-cordova-icon
```

This library depends on [GraphicsMagick](http://www.graphicsmagick.org/) or [ImageMagick](http://www.imagemagick.org/), so be sure to install
one of those.

## Usage

```javascript
const create = require('gulp-cordova-create'),
const icon = require('gulp-cordova-icon'),
const android = require('gulp-cordova-android');

gulp.task('build', () => {
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

Type: `string`

The path to the `png` or `svg` icon that will be used as application icon.

#### options

Type: `object`

##### errorHandlingStrategy

Type: `string`  
Default: `lenient`

The error handling strategy of the process. This field has 3 possible values:
* `lenient` (default): any encountered error is silently discarded and the build continues
* `warn`: any encountered error is logged as a warning on the console
* `throw`: any encountered error is thrown and interrupts the Gulp stream

##### imageMagick

Type: `boolean`  
Default: `false`

Use ImageMagick instead of GraphicsMagick.

## Related

See [`gulp-cordova`](https://github.com/SamVerschueren/gulp-cordova) for the full list of available packages.

## License

MIT © Sam Verschueren
