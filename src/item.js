function Item(element, id) {
	var moving = false,
        $ = window.jQuery,
		$element = $(element),
		halfWidth = $element.width() / 2,
		halfHeight = $element.height() / 2;

    function onDragStart(e) {
        $element.addClass("active");
        moving = true;
        e.preventDefault();
    }

    function onDragEnd() {
        if (moving) {
            $element.trigger(Item.DRAG_END, id);
        }
        moving = false;
        $element.removeClass("active");
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
        var offset = {left: parseInt($element.css("left"), 10), top: parseInt($element.css("top"), 10)};
        var dx = (x - halfWidth) - offset.left;
        var dy = (y - halfHeight) - offset.top;

        var transform = "translate(" + dx + "px, " + dy + "px)";

        $element.css("-webkit-transform", transform);
        $element.css("transform", transform);

    }

    $element.bind("touchstart", onDragStart);
    $element.bind("touchend", onDragEnd);
    $element.bind("touchmove", onMove);

    $element.bind("mousedown", onDragStart);
    window.document.addEventListener("mouseup", onDragEnd);
    window.document.addEventListener("mousemove", onMove);

    this.getElement = function() {
        return element;
    };

    this.getJQElement = function() {
        return $element;
    };
}

Item.DRAG_END = "dragend";
Item.DRAG_START = "dragstart";