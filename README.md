# Mural

Customisable tiled presentation jQuery plugin. Items will automatically realign to appropriate columns based on browser size. Drag and drop to change order.

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/PaulAsjes/mural/master/dist/jquery.mural.min.js
[max]: https://raw.github.com/PaulAsjes/mural/master/dist/jquery.mural.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/jquery.mural.min.js"></script>
<script>
jQuery(function($) {
  $("#container").mural({
  	// options...
  	itemSelector: ".mural-item",
  	speed: 250
  });
});
</script>
```

## Documentation

# Options
```itemSelector``` ```String``` Class selector, identify which HTML elements Mural should effect.
```speed``` ```Number``` Speed at which animations progress in milliseconds. Defaults to 500.
```wgap``` ```Number``` Horizontal gap between items in pixels. Defaults to 50.
```hgap``` ```Number``` Vertical gap between items in pixels. Defaults to 50.
```maxColumns``` ```Number``` Maximum amount of columns Mural will render. Defaults to infinity.
```minColumns``` ```Number``` Minimum amount of columns Mural will render. Defaults to 1.
```onReshuffle``` ```Function``` Callback function when items have reshuffled. Returns the list of HTML elements in the order displayed on screen.
```animationType``` ```String``` Choose what animation library to use. Options include "jQuery" for the standard jQuery animation library, "CSS" for CSS3 transitions and "velocity" for the Velocity animation library. Default is "auto" which attempts to automatically select the animation type dependant on available libraries. Mural will gracefully degrade to using jQuery if either Velocity or CSS is specified yet unavailable.
```centered``` ```Boolean``` Whether the items will be rendered in the centre of the parent div. Defaults to true.
```activeCSS``` ```String``` CSS class to be assigned to the items when dragging. Useful if you want some effects like box shadowing when highlighted.
```order``` ```Object``` Custom order of the items. Use "onReshuffle" to save the item order and "order" to specify which order should be rendered. See the examples on how to use "order".
```draggable``` ```Boolean``` Whether the item can be dragged and dropped or not. Defaults to true.

## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_
