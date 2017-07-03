/*!
 ** gulp
 ** $ npm install gulp-ruby-sass gulp-autoprefixer gulp-cssnano gulp-jshint gulp-concat gulp-uglify gulp-imagemin gulp-notify gulp-rename gulp-livereload gulp-cache del --save-dev
 **/

//load plugins
let gulp = require('gulp');
let runSequence = require('run-sequence');
let bump = require('gulp-bump');
let gutil = require('gulp-util');
let git = require('gulp-git');
let fs = require('fs');


gulp.task('bump-version', function () {
  return gulp.src(['./bower.json', './package.json'])
    .pipe(bump({type: "patch"}).on('error', gutil.log))
    .pipe(gulp.dest('./'));
});

gulp.task('commit-changes', function () {
  return gulp.src('.')
   .pipe(git.add());
});

gulp.task('commit-changes', function () {
  return gulp.src('.')
   .pipe(git.commit('[Prerelease] Bumped version number', {args: '-a'}));
});

gulp.task('push-changes', function (cb) {
  git.push('origin', 'master', cb);
});

gulp.task('create-new-tag', function (cb) {
  let version = getPackageJsonVersion();
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





