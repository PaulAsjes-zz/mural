/*! mural - v0.0.1 - 2014-09-25
* https://github.com/PaulAsjes/mural
* Copyright (c) 2014 Paul Asjes; Licensed MIT */
// CSS support detection. Taken from here: http://www.sitepoint.com/detect-css3-property-browser-support/
var Detect = (function() {

	var	props = "transition,transform,webkitTransition,webkitTransform,msTransform".split(","),
		CSSprefix = "Webkit,Moz,O,ms,Khtml".split(","),
		d = document.createElement("detect"),
		test = [],
		p, pty;

	// test prefixed code
	function testPrefixes(prop) {
		var	Uprop = prop.charAt(0).toUpperCase() + prop.substr(1),
			All = (prop + ' ' + CSSprefix.join(Uprop + ' ') + Uprop).split(' ');

		for (var n = 0; n < All.length; n++) {
			if (d.style[All[n]] === "") return true;
		}

        return false;
	}

	for (p in props) {
		pty = props[p];
		test[pty] = testPrefixes(pty);
	}

	return test;
}());

Detect.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
var Item = function(el, settings) {
    "use-strict";

	var moving = false,
        $ = window.jQuery,
        element = el,
		$element = $(element),
		halfWidth = $element.width() / 2,
		halfHeight = $element.height() / 2,
        animationType = settings.animationType,
        activeClass = settings.activeCSS,
        draggable = settings.draggable;

    function onDragStart(e) {
        $element.css("z-index", 10);
        if (activeClass) $element.addClass(activeClass);
        moving = true;
        e.preventDefault();
    }

    function onDragEnd() {
        if (moving) {
            $element.trigger(Item.DRAG_END);
        }
        moving = false;
        $element.css("z-index", 1);
        if (activeClass) $element.removeClass(activeClass);
    }

    function onMove(e) {
        if (!moving) {
            return;
        }

        var x = e.pageX;
        var y = e.pageY;

        if (e.touches) {
            x = e.touches[0].pageX;
            y = e.touches[0].pageY;
        }

        setPosition(x, y);
    }

    function setPosition(x, y) {
        // this might not be needed
        var offset = $element.parent().offset();

        var dx = (x - halfWidth);
        var dy = (y - halfHeight);

        switch (animationType) {
            // these are the same as we're not actually animating
            case "velocity":
            case "jquery":
                $element.offset({left: dx, top: dy});
                break;

            default:
            case "css":
                if (!Detect.transform || !Detect.webkitTransform) {
                    animationType = "jquery";
                    return setPosition(x, y);
                }
                dx -= offset.left;
                dy -= offset.top;
                var transform = "translate(" + dx + "px, " + dy + "px)";

                $element.css("-webkit-transform", transform);
                $element.css("transform", transform);
                break;
        }
    }

    if (draggable) {
        element.addEventListener("touchstart", onDragStart);
        element.addEventListener("touchend", onDragEnd);
        element.addEventListener("touchmove", onMove);

        element.addEventListener("mousedown", onDragStart);
        window.document.addEventListener("mouseup", onDragEnd);
        window.document.addEventListener("mousemove", onMove);
    }

    this.getElement = function() {
        return element;
    };

    this.getJQElement = function() {
        return $element;
    };
};

Item.DRAG_END = "dragend";
Item.DRAG_START = "dragstart";
(function ($) {
    "use strict";

    var noop = function() {},
        settings = {},
        items = [];

    // Collection method.
    $.fn.mural = function (options) {
        settings = $.extend({}, $.fn.mural.defaults, options);

        settings.container = this;

        // evaluate animation type and gracefully fallback in case the selected type isn't supported
        settings.animationType = autoDetectAnimation(settings.animationType);

        var order = null;
        if ($.isPlainObject(settings.order)) {
            if (settings.order.data) {
                order = settings.order.data.map(function(id) {
                    return $("[" + settings.order.attribute + "|=" + id).get(0);
                });
            }
        }

        var $items = order || $(settings.itemSelector);

        for (var i = 0; i < $items.length; i++) {
            var item = new Item($items[i], settings);
            items.push(item);
            item.getJQElement().bind(Item.DRAG_END, onDrop).css("position", "absolute");
        }

        settings.container = this;
        settings.containerOffset = this.offset();

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

    /**
     * Auto detect which animation type to use in the following order:
     * 1. Velocity
     * 2. CSS
     * 3. jQuery
     */
    function autoDetectAnimation(type) {
        switch (type) {
            case "jquery":
                return "jquery";

            case "css":
                if (!!(Detect.transform && Detect.webkitTransform && Detect.msTransform)) {
                    return "jquery";
                }
                return "css";

            default:
            case "velocity":
                if ($.Velocity !== undefined) {
                   return "velocity";
                }
                return autoDetectAnimation("css");
        }
    }

    // TODO: Fix how drop works when only there is only one column
    function onDrop(e) {
        var $current = $(e.currentTarget);

        var hasMatch = false;

        var elementArray = items.map(function(el) {
            return el.getElement();
        });

        for (var i = 0; i < items.length; i++) {
            if (e.currentTarget !== items[i].getElement()) {
                if (overlaps($current[0], items[i].getElement(), false, settings.containerOffset)) {
                    var midpoint = {};
                    var o = $current.offset();
                    midpoint.x = ($current.width() / 2) + o.left;
                    midpoint.y = ($current.height() / 2) + o.top;

                    var orientation = getPosInRelation(midpoint, items[i].getJQElement());

                    var dragged = elementArray.indexOf($current[0]);
                    var dropped = elementArray.indexOf(items[i].getElement());

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
        var mx = pos.x - settings.containerOffset.left,
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
        itemSelector: ".mural-item",
        speed: 500,
        wgap: 50,
        hgap: 50,
        maxColumns: Infinity,
        minColumns: 1,
        shrinkOnResize: true,
        onReshuffle: noop, // this should return the item order
        animationType: "auto", // options should be css, jquery, velocity or auto
        centered: true,
        activeCSS: "",
        order: null,
        draggable: true
    };

    function drawItems(items) {
        var w = settings.container.width();

        var iw = parseInt(items[0].getJQElement().css("width"), 10);

        settings.containerOffset = settings.container.offset();

        var maxwidth = iw + settings.wgap + (settings.wgap / items.length);
        var columns = Math.floor(w / maxwidth);

        if (columns > settings.maxColumns) {
            columns = settings.maxColumns;
        } else if (columns < 1) {
            columns = 1;
        }

        if (columns > items.length) {
            columns = items.length;
        }

        for (var i = 0; i < items.length; i++) {
            var row = Math.floor(i / columns);
            var column = i % columns;

            var $item = items[i].getJQElement();
            var width = $item.width();
            var height = $item.height();

            var wgap = width + settings.wgap;
            var hgap = height + settings.hgap;

            $item[0].newT = settings.containerOffset.top + (row * hgap);

            var adjustment = 0;
            if (settings.centered) {
                var totalwidth = (columns * width) + (settings.wgap * (columns - 1));
                adjustment = (w - totalwidth) / 2;
            }
            $item[0].newL = Math.round(settings.containerOffset.left + adjustment + (column * wgap));

            if ($item[0].newT < 0) $item[0].newT = 0;
            if ($item[0].newL < 0) $item[0].newL = 0;
        }

        animateItems(items);
    }

    function animateItems(items) {
        for (var i = 0; i < items.length; i++) {
            var $item = items[i].getJQElement();
            var o = $item.position();
            var parentOffset = $item.parent().offset();

            // Only animate if there is a change in position
            if (o.top !== $item[0].newT || o.left !== $item[0].newL) {

                switch (settings.animationType) {
                    case "jquery":
                        $item.stop(true, false);
                        $item.animate({"top": $item[0].newT, "left": $item[0].newL}, settings.speed);
                        break;

                    case "velocity":
                        $item.velocity({"top": $item[0].newT, "left": $item[0].newL}, settings.speed);
                        break;

                    default:
                    case "css":
                        $item[0].newL -= parentOffset.left;
                        $item[0].newT -= parentOffset.top;
                        var transform = "translate(" + $item[0].newL + "px, " + $item[0].newT + "px)";
                        $item.css("-webkit-transition", "-webkit-transform " + (settings.speed / 1000) + "s");
                        $item.css("-webkit-transform", transform);
                        $item.css("transform", transform);

                        // remove animate after complete
                        (function(index) {
                            setTimeout(function() {
                                items[index].getJQElement().css("-webkit-transition", "");
                            }, settings.speed);
                        })(i);
                        break;
                }
            }
        }

        if (settings.onReshuffle) {
            setTimeout(function() {
                settings.onReshuffle.call(this, items.map(function(el) {
                    return el.getElement();
                }));
            }, settings.speed);
        }
    }

    // Custom selector.
    $.expr[':'].mural = function (elem) {
        // Is this element awesome?
        return $(elem).text().indexOf('awesome') !== -1;
    };
}(jQuery));
// collision detection between two elements
var overlaps = (function(window) {
    "use-strict";

    var $ = window.jQuery;
    function getPositions(elem)
    {
        var pos, width, height;
        pos = $(elem).position();
        width = $(elem).width();
        height = $(elem).height();
        return [[ pos.left, pos.left + width], [pos.top, pos.top + height]];
    }

    function getMousePositions(point, offset)
    {
        var p1,
            p2,
            left = offset.left || 0,
            top = offset.top || 0;

        p1 = point.x - left;
        p2 = point.y - top;

        return [[p1, p1 + 1], [p2, p2 + 1]];
    }

    function comparePositions(p1, p2)
    {
        var r1, r2;
        r1 = p1[0] < p2[0] ? p1 : p2;
        r2 = p1[0] < p2[0] ? p2 : p1;
        return r1[1] > r2[0] || r1[0] === r2[0];
    }

    return function (a, b, useMouseCoords, offset)
    {
        var pos1,
            pos2;
        if (useMouseCoords)
        {
            pos1 = getMousePositions(a, offset);
            pos2 = getPositions(b);

            return comparePositions(pos1[0], pos2[0]) && comparePositions(pos1[1], pos2[1]);
        }
        else
        {
            pos1 = getPositions(a);
            pos2 = getPositions(b);
            return comparePositions(pos1[0], pos2[0]) && comparePositions(pos1[1], pos2[1]);
        }
    };
})(window);