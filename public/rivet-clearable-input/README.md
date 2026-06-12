# rivet-clearable-input
An enhancement for Rivet's input component.  It allows for a text input to be cleared by having a clickable "x" show up in the input control.

## Getting started
The Rivet clearable input add-on requires the use of the core Rivet CSS. You can find out more about how to get started
in [the Rivet documentation](https://rivet.iu.edu/components/). Once you are using Rivet, you can download the Rivet
clearable input source files and include them in your project.

### 1. Include the CCS and JavaScript in your page
Note: Assuming Thymeleaf templating
```html
<link rel="stylesheet" type="text/css" th:href="@{/jsrivet/rivet-clearable-input/rivet-clearable-input.css}" />
<script type="text/javascript" th:src="@{/jsrivet/rivet-clearable-input/rivet-clearable-input.js}"></script>
```

### 2. Add the markup to your HTML
The Rivet clearable input markup needs a css class added to any existing rivet input elements. To use it, add the following
class: `rvt-clearable-input`.  Additionally, you'll need to wrap the input element in a div that has a class of
`rvt-clearable-input-group`.  That is necessary for the proper placement of the "clear" button.  
Example markup below:
```html
<div class="rvt-p-left-sm">
    <label for="search" class="rvt-sr-only">Search</label>
    <div class="rvt-input-group">
        <div class="rvt-clearable-input-group">
            <input class="rvt-input-group__input rvt-clearable-input" type="text" id="search" 
                    placeholder="Enter name or username"/>
        </div>
        <div class="rvt-input-group__append">
            <button class="rvt-button rvt-button--secondary">Search</button>
        </div>
    </div>
</div>
```

### 3. Initialize the add-on
Lastly, you'll need to initialize somewhere right before the closing `</body>` tag of you page.  Chances are, it'll be right after you initialize rivet itself.

```html
<script>
  ClearableInput.init();
</script>
```

## JavaScript API
The Rivet clearable input's `.init()` method must be called somewhere in your document after the `rivet-clearable-input.js`
script is included. The `init()` method attaches several event listeners to the document that listen for things like
text input and clicks.

### Methods

| Method| Description|
|--------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ClearableInput.init()` | Initializes the clearable input component |
| `ClearableInput.clearInput()` | Fires the event to clear the input |

### Custom events
The clearable input component emits a custom event when the "x" is clicked. You can listen for this event in your own
scripts and respond to them as needed.

|Event|Description|
|----|------|
|`inputCleared`|Emitted when the "x" is clicked. The id of the input element is also passed along via the custom event's 
`detail` property and is available to use in your scripts as `event.detail.name()`|

#### Custom event example
```js
// Listen for a custom "inputCleared" event
document.addEventListener('inputCleared', event => {
      console.debug(`Custom reset event triggered from: ${event.detail.name()}`);
}, false);
```
