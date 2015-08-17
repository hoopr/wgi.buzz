jQuery(document).ready(function ($) {
  function sizeBoxes() {
    $(".title, .back").height($(".front img").height());
  }

  $(window).load(function () {
    sizeBoxes();
  });

  $(window).resize(function () {
    sizeBoxes();
  });

  $('.title').on('click', function () {
    $(this).parent().find('.slider').toggleClass('closed');
  });

});
