# Стартовый проект с gulp

<table>
  <thead>
    <tr>
      <th>Команда</th>
      <th>Результат</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td width="22%"><code>npm i</code></td>
      <td>Установить зависимости</td>
    </tr>
    <tr>
      <td><code>gulp</code></td>
      <td>Запустить сборку, сервер и слежение за файлами</td>
    </tr>
    <tr>
      <td><code>gulp ЗАДАЧА</code></td>
      <td>Запустить задачу с названием ЗАДАЧА (список задач в <code>gulpfile.js</code>)</td>
    </tr>
  </tbody>
</table>



## Как начать новый проект

1. Клонировать этот репозиторий в новую папку (`git clone https://github.com/Tamtamlg/start-gulp new-project`) и зайти в неё (`cd new-project`).
2. Стереть историю разработки этого репозитория (`rm -rf .git`), инициировать новый (`git init`), создать удалённый репозиторий и привязать его (`git remote add origin АДРЕС`).
3. Отредактировать `README.md`, `package.json` (название проекта, автор, лицензия, сторонние пакеты и пр.)
4. Установить зависимости (`npm i`).
5. Запустить сервер разработки (команда `gulp`).

*Если репозиторий уже создан, вместо пунктов 1 и 2 просто копируем в него файлы из `https://github.com/Tamtamlg/start-gulp`



## Назначение папок

```bash
dist/                               # Папка сборки, здесь работает сервер автообновлений.
src/                                # Исходные файлы.
  blocks/                           # - блоки проекта.
  blocks/scripts/scripts.html       # - файл для подключения скриптов.
  css/                              # - файлы css, которые не нужно компилировать.
  favicon/                          # - фавиконки.
  fonts/                            # - шрифты проекта.
  img/                              # - картинки.
  js/                               # - js-файлы.
  scss/                             # - стили scss.
  svg/                              # - файлы для svg-спрайта.
  index.html                        # - главная страница проекта.
```


## Разметка

HTML обрабатывается "gulp-file-include".
Блок вставляется в разметку так: `@@include('blocks/header/header.html')`, можно использовать json для передачи параметров ` @@include('slider__item/slider__item.html', {"img": "img/slider-2.jpg"})`. Параметры из json вставляются так: `<img src="@@img" alt="">`



## Стили

Используется SCSS.
`src/scss/style.scss` - Файл-диспетчер подключений стилей (содержит только импорты).
`src/scss/base.scss` - Базовые глобальные стили.
`src/scss/variables.scss` - Переменные.
`src/scss/fonts.scss` - Шрифты.



## SVG

Используется SVG-спрайт.
В спрайт попадают все .svg из папки `src/svg/`
Пример использования:
```bash
  <svg class="svg" width="100px" height="30px">
    <use xlink:href="img/sprite.svg#logo"></use>
  </svg>
```
где `logo` - название файла, который хотим получить из спрайта


## Модульная сетка (flexbox)

По умолчанию используется Bootstrap v.4.1.3



## Блоки

Каждый блок лежит в `src/blocks/` в своей папке. Каждый блок — папка и одноимённые scss- и html-файл. (Допускается папка img с картинками для блока)
Содержимое блока:

```bash
demo-block/               # Папка блока.
  demo-block.html         # Разметка.
  demo-block.scss         # Стилевой файл блока.
  img                     # Папка с картинками.
```


## Подключение блоков

Добавление нового блока: в консоли `node block.js имя-блока`. Будут созданы папка блока, .scss и .html файлы, а также папка img, добавлен импорт стилей.





##
Создано на основе [проекта](https://github.com/nicothin/NTH-start-project)