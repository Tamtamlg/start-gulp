'use strict';

svg4everybody();

/**
 * lazy loading
 */
document.addEventListener("DOMContentLoaded", function() {
  var lazyImages = [].slice.call(document.querySelectorAll(".lazy"));
  var lazyBgs = [].slice.call(document.querySelectorAll(".lazy-bg"));

  if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype) {
    let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.srcset = lazyImage.dataset.srcset;
          lazyImage.classList.remove("lazy");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });
    let lazyBgObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          let lazyBg = entry.target;
          lazyBg.classList.add("lazy-bg--loaded");
          lazyBgObserver.unobserve(lazyBg);
        }
      });
    });

    lazyImages.forEach(function(lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
    lazyBgs.forEach(function(lazyBg) {
      lazyBgObserver.observe(lazyBg);
    });
  } else {
    lazyImages.forEach(function(lazyImage) {
      lazyImage.src = lazyImage.dataset.src;
      lazyImage.srcset = lazyImage.dataset.srcset;
    });
    lazyBgs.forEach(function(lazyBg) {
      lazyBg.classList.add("lazy-bg--loaded");
    });
  }
});


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

