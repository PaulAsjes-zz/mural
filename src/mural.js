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
        containerOffset,
        items = [];

  // Collection method.
    $.fn.mural = function (options) {
        settings = $.extend({}, $.fn.mural.defaults, options);

        var $items = $(settings.itemSelector);

        for (var i = 0; i < $items.length; i++) {
            var item = new Item($items[i], i);
            items.push(item);
            item.getJQElement().bind(Item.DRAG_END, {items: $items}, onDrop);
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

    function onDrop(e, id) {
        if (e.currentTarget !== items[id].getElement()) return;
        var $current = items[id].getJQElement();

        var hasMatch = false;

        var elementArray = items.map(function(el) {
            return el.getElement();
        })

        for (var i = 0; i < items.length; i++) {
            if (e.currentTarget !== items[i].getElement()) {
                if (overlaps($current[0], items[i].getElement(), false, containerOffset)) {
                    var midpoint = {};
                    var o = $current.offset();
                    midpoint.x = ($current.width() / 2) + o.left;
                    midpoint.y = ($current.height() / 2) + o.top;

                    var orientation = getPosInRelation(midpoint, items[i].getJQElement());

                    var dragged = elementArray.indexOf($current[0]);
                    var dropped = elementArray.indexOf(items[i].getElement());

                    console.log(dropped);

                    var n = 0;
                    if (dragged < dropped) {
                        if (orientation === "left") n = -1;
                    } else {
                        if (orientation === "right") n = 1;
                    }

                    items.splice(dropped + n, 0, items.splice(dragged, 1).pop());

                    hasMatch = true;
                    break;
                }
            }
        }

        if (!hasMatch) {
            var pos = elementArray.indexOf($current[0]);

            if (isItemAtTop($current, items[0].getJQElement())) {
                items.splice(0, 0, items.splice(pos, 1).pop());
            } else if (isItemAtBottom($current, items[items.length - 1].getJQElement())) {
                items.splice(items.length, 0, items.splice(pos, 1).pop());
            }
        }

        drawItems(items);
    }

    function getPosInRelation(pos, $item)
    {
        var mx = pos.x - containerOffset.left,
            tw = $item.width() / 2,
            tp = $item.position(),
            mp = tp.left + tw;

        return (mx < mp) ? "left" : "right";
    }

    function isItemAtTop($item1, $item2) {
        return $item1.position().top < $item2.position().top;
    }

    function isItemAtBottom($item1, $item2) {
        return $item1.position().top > $item2.position().top;
    }

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

            var $item = items[i].getJQElement();
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
            var $item = items[i].getJQElement();
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