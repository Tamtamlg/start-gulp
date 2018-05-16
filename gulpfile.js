'use strict';

// Определим константу с папками
const dirs = {
  source: 'source',  // папка с исходниками (путь от корня проекта)
  build: 'build', // папка с результатом работы (путь от корня проекта)
};

// Определим необходимые инструменты
const gulp = require('gulp');
const fileinclude = require('gulp-file-include');
const gulpSequence = require('gulp-sequence');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const replace = require('gulp-replace');
const del = require('del');
const browserSync = require('browser-sync').create();
const ghPages = require('gulp-gh-pages');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const cheerio = require('gulp-cheerio');
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const gcmq = require('gulp-group-css-media-queries');
const merge = require('merge-stream');
const wait = require('gulp-wait');
const htmlbeautify = require('gulp-html-beautify');
const csscomb = require('gulp-csscomb');
const cached = require('gulp-cached');
const sassPartialsImported = require('gulp-sass-partials-imported');


// Изображения, которые нужно копировать
let images = [
  dirs.source + '/img/*.*',
  dirs.source + '/includes/**/img/*.*'
];

// Компиляция и обработка стилей
gulp.task('style', function () {
  return gulp.src(dirs.source + '/scss/style.scss')        // какой файл компилировать
    .pipe(plumber({                                        // при ошибках не останавливаем автоматику сборки
      errorHandler: function(err) {
        notify.onError({
          title: 'Styles compilation error',
          message: err.message
        })(err);
        this.emit('end');
      }
    }))
    .pipe(wait(100))
    .pipe(sourcemaps.init())                               // инициируем карту кода
    .pipe(cached('sassfiles'))
		.pipe(sassPartialsImported(dirs.source + '/scss'))
		.pipe(sass({ includePaths: dirs.source + '/scss' }))
    // .pipe(sass())                                          // компилируем
    .pipe(sourcemaps.write('/'))                           // записываем карту кода как отдельный файл
    .pipe(gulp.dest(dirs.build + '/css/'))                 // записываем CSS-файл
    .pipe(csscomb('csscomb.json'))                         // csscomb          
    .pipe(browserSync.stream({match: '**/*.css'}))         // укажем browserSync необходимость обновить страницы в браузере
    .pipe(gulp.dest(dirs.build + '/css/'));                // записываем CSS-файл
});


// обработка HTML
gulp.task('html', function() {
  gulp.src(dirs.source + '/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(htmlbeautify())
    .pipe(gulp.dest(dirs.build));
});

// Копирование изображений
gulp.task('copy:img', function () {
  if(images.length) {
    return gulp.src(images)
      .pipe(imagemin())
      .pipe(rename({dirname: ''}))
      .pipe(gulp.dest(dirs.build + '/img'));
  }
  else {
    console.log('Изображения не обрабатываются.');
    callback();
  }
});


// Копирование шрифтов
gulp.task('copy:fonts', function () {
  return gulp.src([
      dirs.source + '/fonts/**.*',
    ])
    .pipe(gulp.dest(dirs.build + '/fonts'));
});

// Копирование js
gulp.task('copy:js', function () {
  return gulp.src([
      dirs.source + '/js/**.*',
    ])
    .pipe(gulp.dest(dirs.build + '/js'));
});


// Сборка SVG-спрайта
let spriteSvgPath = dirs.source + '/svg/';
gulp.task('sprite:svg', function (callback) {
  if(fileExist(spriteSvgPath) !== false) {
    return gulp.src(spriteSvgPath + '*.svg')
      .pipe(svgmin(function (file) {
        return {
          plugins: [{
            cleanupIDs: {
              minify: true
            }
          }]
        }
      }))
      .pipe(svgstore({ inlineSvg: true }))
      .pipe(cheerio({
        run: function($) {
          $('svg').attr('style',  'display:none');
        },
        parserOptions: {
          xmlMode: true
        }
      }))
      .pipe(rename('sprite-svg.svg'))
      .pipe(gulp.dest(dirs.build + '/img/'));
  }
  else {
    console.log('SVG-спрайт: нет папки ' + spriteSvgPath);
    callback();
  }
});


// Очистка перед сборкой
gulp.task('clean', function () {
  return del([
    dirs.build + '/**/*',
    '!' + dirs.build + '/readme.md'
  ]);
});


// Сборка всего
gulp.task('build', function (callback) {
  gulpSequence(
    'clean',
    ['sprite:svg'],
    ['style', 'copy:img', 'copy:fonts', 'copy:js'],
    'html',
    callback
  );
});

// Задача по умолчанию
gulp.task('default', ['serve']);

// Локальный сервер, слежение
gulp.task('serve', ['build'], function() {
  browserSync.init({
    server: dirs.build,
    startPath: 'index.html',
    open: false,
    port: 3000,
  });
  // Слежение за стилями
  gulp.watch([
    dirs.source + '/scss/style.scss',
    dirs.source + '/scss/variables.scss',
    dirs.source + '/includes/**/*.scss',
  ], ['style']);
  // Слежение за html
  gulp.watch([
    dirs.source + '/*.html',
  ], ['watch:html']);
  // Слежение за изображениями
  if(images.length) {
    gulp.watch(images, ['watch:img']);
  }
  // Слежение за шрифтами
  gulp.watch(dirs.source + '/fonts/*.{ttf,woff,woff2,eot,svg}', ['watch:fonts']);
  // Слежение за SVG (спрайты)
  gulp.watch('*.svg', {cwd: spriteSvgPath}, ['watch:sprite:svg']);

});

// Браузерсинк с 3-м галпом — такой браузерсинк...
gulp.task('watch:html', ['html'], reload);
gulp.task('watch:img', ['copy:img'], reload);
gulp.task('watch:fonts', ['copy:fonts'], reload);
gulp.task('watch:sprite:svg', ['sprite:svg'], reload);

// Отправка в GH pages (ветку gh-pages репозитория)
gulp.task('deploy', function() {
  return gulp.src(dirs.build + '/**/*')
    .pipe(ghPages());
});

// Перезагрузка браузера
function reload (done) {
  browserSync.reload();
  done();
}

// Проверка существования файла/папки
function fileExist(path) {
  const fs = require('fs');
  try {
    fs.statSync(path);
  } catch(err) {
    return !(err && err.code === 'ENOENT');
  }
}

var onError = function(err) {
  notify.onError({
    title: 'Error in ' + err.plugin,
  })(err);
  this.emit('end');
};
