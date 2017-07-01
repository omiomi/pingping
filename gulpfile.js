/*!
 ** gulp
 ** $ npm install gulp-ruby-sass gulp-autoprefixer gulp-cssnano gulp-jshint gulp-concat gulp-uglify gulp-imagemin gulp-notify gulp-rename gulp-livereload gulp-cache del --save-dev
 **/

//load plugins
var gulp = require('gulp'),
	sass = require('gulp-ruby-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss = require('gulp-minify-css'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	notify = require('gulp-notify'),
	cache = require('gulp-cache'),
	livereload = require('gulp-livereload'),
	del = require('del');

// style
gulp.task('styles',function(){
  return sass('src/styles/main.scss',{
	  style: 'expanded'})
	  .pipe(autoprefixer('last 2 version'))
	  .pipe(gulp.dest('dist/styles'))
	  .pipe(rename({
		  suffix: '.min'
	  }))
	  .pipe(cssnano())
	  .pipe(gulp.dest('dist/styles'))
	  .pipe(notify({
		  message: 'Styles task complete '
	  }));
});


// Script 
gulp.task('scripts',function(){
  return gulp.src('src/scripts/**/*.js')
    .pipe(jshint('.jshintrc'))
	.pipe(jshint.reporter('default'))
	.pipe(concat(main.js))
	.pipe(gulp.dest('dist/scripts'))
	.pipe(rename({
		suffix:'.min'
	}))
	.pipe(uglify())
	.pipe(gulp.dest('dist/scripts'))
	.pipe(notify({
		message:"Scripts task complete"
	}));
});

// Images
gulp.task('images',function(){
  return gulp.src('src/images/**/*')
    .pipe(cache(imagemin({
		optimizationLevel:3,
		progressive:true,
		interlaced:true
	})))
	.pipe(gulp.dest('dist/images'))
	.pipe(notify({
		message: "Images task complete"
	}))
});

// Clean
gulp.task('clean',function(){
	return del(['dist/styles','dist/scripts','dist/images']);
});

// Default task
gulp.task('default',['clean'],function(){
  gulp.start('styles','scripts','images');
});

// Watch
gulp.task('watch',function(){

	// Watch .scss files
	gulp.watch('src/styles/**/*.scss',['styles']);

	// Watch .js files
	gulp.watch('src/scripts/**/*.js',['scripts']);
	
	// Watch images files
	gulp.watch('src/images/**/*',['images']);
	
	// Create liveReload server
	livereload.listen();
	
	// Watch anys files in dist/, reload on change
	gulp.watch(['dist/**'].on('change',livereload.changed);
})；

// 添加git tag
var runSequence = require('run-sequence');
var bump = require('gulp-bump');
var gutil = require('gulp-util');
var git = require('gulp-git');
var fs = require('fs');


gulp.task('bump-version', function () {
  return gulp.src(['./bower.json', './package.json'])
    .pipe(bump({type: "patch"}).on('error', gutil.log))
    .pipe(gulp.dest('./'));
});

gulp.task('commit-changes', function () {
  return gulp.src('.')
   .pipe(git.commit('[Prerelease] Bumped version number', {args: '-a'}));
});

gulp.task('push-changes', function (cb) {
  git.push('origin', 'master', cb);
});

gulp.task('create-new-tag', function (cb) {
  var version = getPackageJsonVersion();
  git.tag(version, 'Created Tag for version: ' + version, function (error) {
    if ( error) {
	  return cb(error);
	 }
    git.push('origin', 'master', {args: '--tags'}, cb);
  });
  function getPackageJsonVersion () {
    return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
  };
});

gulp.task('release', function (callback) {
  runSequence(
    'bump-version',
	'commit-changes',
	'push-changes',
	'create-new-tag',
     function (error) {
	   if (error) {
		  console.log(error.message);
		} else {
		  console.log('RELEASE FINISHED SUCCESSFULLY');
	    }
	   callback(error);
	});
});





