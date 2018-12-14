'use strict';

// Определим константу с папками
const dirs = {
  source: 'src',  // папка с исходниками (путь от корня проекта)
  build: 'dist',  // папка с результатом работы (путь от корня проекта)
};

// Определим необходимые инструменты
const gulp = require('gulp');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const objectFitImages = require('postcss-object-fit-images');
const del = require('del');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const cheerio = require('gulp-cheerio');
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const cleanCSS = require('gulp-cleancss');
const wait = require('gulp-wait');
const htmlbeautify = require('gulp-html-beautify');
const fileinclude = require('gulp-file-include');

// Перечисление и настройки плагинов postCSS, которыми обрабатываются стилевые файлы
let postCssPlugins = [
  autoprefixer({                                           // автопрефиксер
    browsers: ['last 2 version']
  }),
  mqpacker({                                               // объединение медиавыражений с последующей их сортировкой
    sort: true
  }),
  objectFitImages(),                                       // возможность применять object-fit
];

// Изображения, которые нужно копировать
let images = [
  dirs.source + '/img/**/*.*',
  dirs.source + '/blocks/**/img/*.*',
  '!' + dirs.source + '/svg/*',
];

// Cписок обрабатываемых файлов в указанной последовательности
let jsList = [
  './node_modules/jquery/dist/jquery.min.js',
  './node_modules/bootstrap/dist/js/bootstrap.min.js',
  './node_modules/svg4everybody/dist/svg4everybody.min.js',
  './node_modules/object-fit-images/dist/ofi.min.js'
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
    .pipe(sass())                                          // компилируем
    .pipe(postcss(postCssPlugins))                         // делаем постпроцессинг
    .pipe(sourcemaps.write('/'))                           // записываем карту кода как отдельный файл
    .pipe(gulp.dest(dirs.build + '/css/'))                 // записываем CSS-файл
    .pipe(browserSync.stream({match: '**/*.css'}))         // укажем browserSync необходимость обновить страницы в браузере
    .pipe(rename('style.min.css'))                         // переименовываем (сейчас запишем рядом то же самое, но минимизированное)
    .pipe(cleanCSS())                                      // сжимаем и оптимизируем
    .pipe(gulp.dest(dirs.build + '/css/'));                // записываем CSS-файл
});

// Обработка HTML
gulp.task('html', function() {
  return gulp.src(dirs.source + '/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(htmlbeautify())
    .pipe(gulp.dest(dirs.build));
});

// Копирование изображений
gulp.task('copy:img', function (callback) {
  if(images.length) {
    return gulp.src(images)
      .pipe(rename({dirname: ''}))
      .pipe(gulp.dest(dirs.build + '/img'));
  }
  else {
    console.log('Изображения не обрабатываются.');
    callback();
  }
});

// Копирование favicon
gulp.task('copy:favicon', function () {
  return gulp.src([
      dirs.source + '/favicon/*.*',
    ])
    .pipe(gulp.dest(dirs.build + '/img/favicon/'));
});

// Копирование шрифтов
gulp.task('copy:fonts', function () {
  return gulp.src([
      dirs.source + '/fonts/**/*.*',
    ])
    .pipe(gulp.dest(dirs.build + '/fonts'));
});

// Копирование js
gulp.task('copy:js', function () {
  return gulp.src([
      dirs.source + '/js/**/*.*',
    ])
    .pipe(gulp.dest(dirs.build + '/js'));
});

// Копирование css
gulp.task('copy:css', function () {
  return gulp.src([
      dirs.source + '/css/*.css',
    ])
    .pipe(gulp.dest(dirs.build + '/css'));
});

// Ручная оптимизация изображений
// Использование: folder=src/img npm start img:opt
const folder = process.env.folder;
gulp.task('img:opt', function (callback) {
  if(folder){
    return gulp.src(folder + '/*.{jpg,jpeg,gif,png,svg}')
      .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
      }))
      .pipe(gulp.dest(folder));
  }
  else {
    console.log('Не указана папка с картинками. Пример вызова команды: folder=src/blocks/test-block/img npm start img:opt');
    callback();
  }
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
      .pipe(rename('sprite.svg'))
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

// Конкатенация и сжатие Javascript
gulp.task('js', function (callback) {
  if(jsList.length) {
    return gulp.src(jsList)
      .pipe(plumber({ errorHandler: onError }))             // не останавливаем автоматику при ошибках
      .pipe(concat('vendor.min.js'))                        // конкатенируем все файлы в один с указанным именем
      // .pipe(uglify())
      .pipe(gulp.dest(dirs.build + '/js'));                 // записываем
  }
  else {
    console.log('Javascript не обрабатывается');
    callback();
  }
});

// Сборка всего
gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('sprite:svg', 'copy:favicon'),
  gulp.parallel('style', 'js', 'copy:img', 'copy:fonts', 'copy:js', 'copy:css'),
  'html'
));

// Локальный сервер, слежение
gulp.task('serve', gulp.series('build', function() {
  browserSync.init({
    server: dirs.build,
    startPath: 'index.html',
    open: true,
    port: 3000,
  });
  // Слежение за стилями
  gulp.watch([
    dirs.source + '/scss/style.scss',
    dirs.source + '/scss/variables.scss',
    dirs.source + '/scss/fonts.scss',
    dirs.source + '/scss/base.scss',
    dirs.source + '/blocks/**/*.scss',
  ], gulp.series('style'));
  // Слежение за html
  gulp.watch([
    dirs.source + '/**/*.html',
  ], gulp.series('html', reload));
  // Слежение за изображениями
  if(images.length) {
    gulp.watch(images, gulp.series('copy:img', reload));
  }
  // Слежение за шрифтами
  gulp.watch(dirs.source + '/fonts/**/*.*', gulp.series('copy:fonts', reload));
  // Слежение за SVG (спрайты)
  gulp.watch('*.svg', {cwd: spriteSvgPath}, gulp.series('sprite:svg', reload));
  // Слежение за JS
  gulp.watch(dirs.source + '/js/**/*.*', gulp.series('copy:js', reload));
  // Слежение за файлами css, которые не нужно компилировать
  gulp.watch(dirs.source + '/css/*.css', gulp.series('copy:css', reload));
}));


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

let onError = function(err) {
  notify.onError({
    title: 'Error in ' + err.plugin,
  })(err);
  this.emit('end');
};

// Задача по умолчанию
gulp.task('default',
  gulp.series('serve')
);