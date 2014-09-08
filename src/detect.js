// CSS support detection. Taken from here: http://www.sitepoint.com/detect-css3-property-browser-support/
var Detect = (function() {

	var	props = "transition,transform,webkitTransition,webkitTransform".split(","),
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

/* IE detection. Gist: https://gist.github.com/julianshapiro/9098609 */
Detect.IE = (function() {
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