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


/**
 * select
 */
$(function () {
  var selectItem = $('.select .dropdown-item');
  selectItem.click(function() {
    $(this).closest('.select').find('.select__input').val($(this).text());
  });
});


$(function () {

  // скрипты тут


});

