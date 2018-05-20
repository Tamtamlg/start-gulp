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



$(function () {

  // скрипты тут


});

