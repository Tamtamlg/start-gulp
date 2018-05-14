/*global $, window, objectFitImages, document*/
'use strict';

/**
 * preloader
 */
$(window).on('load', function () {
  var preloader = $('#page-preloader');
  var spinner = preloader.find('.spinner');
  spinner.fadeOut();
  preloader.delay(350).fadeOut('slow');
});

function formValidate() {
  $.validate({
    modules: 'security',
    scrollToTopOnError: false
  });
}

/**
 * disable hover
 */
function disablePointerEvents() {
  var body = document.body,
    timer;

  window.addEventListener('scroll', function () {
    clearTimeout(timer);
    if (!body.classList.contains('disable-hover')) {
      body.classList.add('disable-hover')
    }

    timer = setTimeout(function () {
      body.classList.remove('disable-hover')
    }, 500);
  }, false);
}

/**
 * document.ready
 */
$(function () {

  disablePointerEvents()
  svg4everybody();
  formValidate();
  objectFitImages('img', {
    watchMQ: true
  });

});