function Item(element) {
	var moving = false,
		$element = $(element),
		halfWidth = $element.width() / 2,
		halfHeight = $element.height() / 2;

    $element.bind("touchstart", onDragStart);
    $element.bind("touchend", onDragEnd);
    $element.bind("touchmove", onMove);

    $element.bind("mousedown", onDragStart);
    $element.bind("mouseup", onDragEnd);
    $element.bind("mousemove", onMove);

    function onDragStart(e) {
    	$element.addClass("active");
    	moving = true;
    	e.preventDefault();
    }

    function onDragEnd() {
    	moving = false;
    	$element.removeClass("active");

    }

    function onMove(e) {
    	if (!moving)
    		return;

    	var x = e.pageX;
    	var y = e.pageY;

    	if (e.touches) {
    		x = e.touches[0].pageX;
    		y = e.touches[0].pageY;
    	}

    	setPosition(x, y);
    }

    function setPosition(x, y) {
    	var dx = x - halfWidth;
    	var dy = y - halfHeight;
    	var transform = "translate(" + dx + "px, " + dy + "px)";

    	$element.css("-webkit-transform", transform);
    	$element.css("transform", transform);

    }

    this.getElement = function() {
    	return $element;
    };
}