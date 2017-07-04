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

let concat = require('gulp-concat'); // 合并
let uglify = require('gulp-uglify'); // 压缩
let rename = require('gulp-rename'); // 重命名
let jshint = require('gulp-jshint'); // 验证

let sass = require('gulp-sass');  // sass -> css
let prefixer = require('gulp-autoprefixer');  // 增加前缀
let minify = require('gulp-minify-css');  // css 压缩
let notify = require('gulp-notify');  // 打印提醒语句

let imagemin = require('gulp-imagemin');
let cache = require('gulp-cache');  // 减少重复压缩

let babel = require('gulp-babel');

//图片压缩
gulp.task('images', function() { 
  gulp.src('src/images/*')
   .pipe(cache(imagemin({
	  optimizationLevel: 3, progressive: true, interlaced: true })))
	.pipe(gulp.dest('dist/images/'));
});

// 编译Sass
gulp.task('css', function() {
  gulp.src('src/sass/*.scss')  // 目标 sass 文件
   .pipe(sass())  // sass -> css
   .pipe(prefixer('last 2 versions'))  // 参数配置参考 <https://github.com/ai/browserslist>
   .pipe(minify())  // 压缩
   .pipe(gulp.dest('dist/css'))  // 目标目录
   .pipe(notify({
	   message: 'done'}))
   .pipe(concat('all.min.css'))  // 
   .pipe(gulp.dest('dist/css'));  // 目标目录
});

//js es6转换 压缩 重命名
gulp.task('scripts', function () {
  gulp.src('src/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(concat('all.js'))
    .pipe(gulp.dest( 'dist/js'))
    .pipe(uglify())
    .pipe(rename({
		stuffix: '.min'
	}))
    .pipe(gulp.dest('dist/js'));
});

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





