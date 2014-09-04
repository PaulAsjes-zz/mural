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
            var item = new Item($items[i], i, settings.animationType);
            items.push(item);
            item.getJQElement().bind(Item.DRAG_END, onDrop);
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

    /* IE detection. Gist: https://gist.github.com/julianshapiro/9098609 */
    var IE = (function() {
        if (document.documentMode) {
            return document.documentMode;
        } else {
            for (var i = 10; i > 4; i--) {
                var div = document.createElement("div");

                div.innerHTML = "<!--[if IE " + i + "]><span></span><![endif]-->";

                if (div.getElementsByTagName("span").length) {
                    div = null;

                    return i;
                }
            }
        }

        return undefined;
    })();

    function onDrop(e) {
        var $current = $(e.currentTarget);

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

                    console.log($current.html());
                    console.log(dragged, dropped);

                    var n = 0;
                    if (dragged < dropped) {
                        if (orientation === "left") n = -1;
                    } else {
                        if (orientation === "right") n = 1;
                    }

                    items.splice(dropped + n, 0, items.splice(dragged, 1).shift());
                    elementArray.splice(dropped + n, 0, elementArray.splice(dragged, 1).shift());

                    hasMatch = true;
                    break;
                }
            }
        }

        var debug = elementArray.map(function(el) {
           return el.innerHTML;
        });

        console.log(debug);

        if (!hasMatch) {
            var pos = elementArray.indexOf($current[0]);

            if (isItemAtTop($current, items[0].getJQElement())) {
                items.splice(0, 0, items.splice(pos, 1).shift());
            } else if (isItemAtBottom($current, items[items.length - 1].getJQElement())) {
                items.splice(items.length, 0, items.splice(pos, 1).shift());
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
        onReshuffle: noop,
        animationType: "css" // options should be css, jquery, velocity or auto
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
            var o = $item.position();

            // Only animate if there is a change in position
            if (o.top !== $item[0].newT || o.left !== $item[0].newL) {
                var t = (i * 60 > 900) ? 900 : i * 60;

                switch (settings.animationType) {
                    case "jquery":
                        $item.stop(true, false);
                        $item.animate({"top": $item[0].newT, "left": $item[0].newL}, 100 + t);
                        break;

                    case "velocity":
                        // TODO: graceful fallback to CSS or jquery if velocity is not found
                        break;

                    case "auto":
                        /* TODO: auto detect which animation type to use in the following order:
                        * 1. Velocity
                        * 2. CSS
                        * 3. jQuery
                        */
                        break;

                    default:
                    case "css":
                        // TODO: graceful fallback to jquery if browser can't handle CSS transitions. Throw error if CSS classes are not present

                        if (IE !== undefined && IE < 10) {
                            // fall back to jQuery
                            settings.animationType = "jquery";
                            animateItems(items);
                            return;
                        }

                        var transform = "translate(" + $item[0].newL + "px, " + $item[0].newT + "px)";
                        $item.addClass("animate");
                        $item.css("-webkit-transform", transform);
                        $item.css("transform", transform);

                        // remove animate after complete
                        (function(index) {
                            setTimeout(function() {
                                items[index].getJQElement().removeClass("animate");
                            }, settings.speed);
                        })(i);
                        break;
                }
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