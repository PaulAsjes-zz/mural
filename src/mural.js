/*
 * Mural
 *
 *
 * Copyright (c) 2014 Paul Asjes
 * Licensed under the MIT license.
 */

(function ($) {
  "use strict";

  var noop = function() {},
      settings = {},
      containerOffset;

  // Collection method.
  $.fn.mural = function (options) {
    settings = $.extend({}, $.fn.mural.defaults, options);

    var $items = $(settings.itemSelector);

    var items = [];
    for (var i = 0; i < $items.length; i++) {
      items.push(new Item($items[i]));
    }

    containerOffset = this.offset();

    var delay;
    $(window).resize(function() {
      clearTimeout(delay);
      delay = setTimeout(function() {
        drawItems(items);
      }, 150);
    });

    drawItems(items);

    return this;
  };

  // Static method default options.
  $.fn.mural.defaults = {
    cols: 5,
    itemSelector: ".mural-item",
    speed: 500,
    wgap: 50,
    hgap: 50,
    maxColumns: 5,
    shrinkOnResize: true,
    onReshuffle: noop
  };

  function drawItems(items) {
    var w = $(window).width();

    var columns = Math.floor(w / 200);
    if (columns > settings.maxColumns && $(window).height() > 400) {
      columns = settings.maxColumns;
    } else if (columns < 1) {
      columns = 1;
    }

    var offset = (w/2) - ((columns / 2) * 200);

    for (var i = 0; i < items.length; i++) {
      var row = Math.floor(i / columns);
      var column = i % columns;

      var $item = items[i].getElement();
      var width = $item.width();
      var height = $item.height();

      var wgap = width + settings.wgap;
      var hgap = height + settings.hgap;

      $item[0].newT = containerOffset.top + (row * hgap);
      $item[0].newL = Math.round(offset + containerOffset.left + (column * wgap));

      if ($item[0].newT < 0) $item[0].newT = 0;
      if ($item[0].newL < 0) $item[0].newL = 0;

      animateItems(items);
    }
  }

  function animateItems(items) {
    for (var i = 0; i < items.length; i++) {
      var $item = items[i].getElement();
      $item.stop(true, false);
      var o = $item.position();

      // Only animate if there is a change in position
      if (o.top !== $item[0].newT || o.left !== $item[0].newL) {
        var t = (i * 60 > 900) ? 900 : i * 60;
        $item.animate({"top": $item[0].newT, "left": $item[0].newL}, 100 + t);
      }
    }
  }

  // Static method.
  $.mural = function (options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.awesome.options, options);
    // Return something awesome.
    return 'awesome' + options.punctuation;
  };

  // Custom selector.
  $.expr[':'].mural = function (elem) {
    // Is this element awesome?
    return $(elem).text().indexOf('awesome') !== -1;
  };

}(jQuery));
