/*!
 * rivet-clearable-input - @version 0.5.0
 * (c) 2024, The Trustees of Indiana University | BSD-3-Clause License
 * https://github.com/maurercw/rivet-clearable-input
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ClearableInput = {}));
})(this, (function (exports) { 'use strict';

    var CLEARABLE_ATTR = 'data-clearable';

    var CLOSE_ICON = '<span class="rvt-sr-only">Clear input</span>' +
        '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">' +
        '<g fill="currentColor">' +
        '<path d="M8,0a8,8,0,1,0,8,8A8,8,0,0,0,8,0ZM8,14a6,6,0,1,1,6-6A6,6,0,0,1,8,14Z"/>' +
        '<path d="M10.83,5.17a1,1,0,0,0-1.41,0L8,6.59,6.59,5.17A1,1,0,0,0,5.17,6.59L6.59,8,5.17,9.41a1,1,0,1,0,1.41,1.41L8,9.41l1.41,1.41a1,1,0,0,0,1.41-1.41L9.41,8l1.41-1.41A1,1,0,0,0,10.83,5.17Z"/>' +
        '</g>' +
        '</svg>';

    var _fireCustomEvent = function (element, eventName) {
        var event = new CustomEvent(eventName, {
            bubbles: true,
            detail: {
                name: function () {
                    return element.id;
                }
            }
        });
        element.dispatchEvent(event);
    };

    var clearInput = function (element) {
        element.classList.remove('has-data');
        element.value = '';
        element.focus();

        var clearButton = createOrFindButton(element);
        clearButton.setAttribute('hidden', '');

        // VoiceOver won't re-read identical text, so alternate between two strings to force re-announcement.
        var srText = createOrFindSRMsg(element);
        var currText = srText.textContent;
        var input1 = 'Input cleared';
        var input2 = 'Input cleared.';
        srText.textContent = currText === input1 ? input2 : input1;

        _fireCustomEvent(element, 'inputCleared');
    };

    var _handleClick = function (event) {
        var clearButton = event.target;
        if (clearButton.classList.contains('buttonX')) {
            var inputId = clearButton.getAttribute(CLEARABLE_ATTR);
            clearInput(document.getElementById(inputId));
        }
    };

    var _handleInput = function (event) {
        var clearableInput = event.target;
        if (clearableInput.classList.contains('rvt-clearable-input')) {
            var clearButton = createOrFindButton(clearableInput);
            createOrFindSRMsg(clearableInput);

            if (clearableInput.value.length > 0) {
                clearableInput.classList.add('has-data');
                clearButton.removeAttribute('hidden');
            } else {
                clearableInput.classList.remove('has-data');
                clearButton.setAttribute('hidden', '');
            }
        }
    };

    var createOrFindButton = function (inputElement) {
        var newButtonId = 'button_' + inputElement.id;
        var button = document.getElementById(newButtonId);
        if (!button) {
            button = document.createElement('button');
            button.type = 'button';
            button.setAttribute(CLEARABLE_ATTR, inputElement.id);
            button.classList.add('buttonX');
            button.innerHTML = CLOSE_ICON;
            button.id = newButtonId;
            inputElement.parentNode.insertBefore(button, inputElement.nextSibling);
        }
        return button;
    };

    var createOrFindSRMsg = function (inputElement) {
        var srOnlyMsgId = 'sr-alert-' + inputElement.id;
        var srOnlyMsg = document.getElementById(srOnlyMsgId);
        if (!srOnlyMsg) {
            srOnlyMsg = document.createElement('span');
            srOnlyMsg.id = srOnlyMsgId;
            srOnlyMsg.classList.add('rvt-sr-only');
            srOnlyMsg.setAttribute('aria-live', 'polite');
            inputElement.parentNode.insertBefore(srOnlyMsg, inputElement.nextSibling);
        }
        return srOnlyMsg;
    };

    var destroy = function (context) {
        if (context === undefined) {
            context = document;
        }
        context.removeEventListener('click', _handleClick, false);
        context.removeEventListener('input', _handleInput, false);
    };

    var init = function (context) {
        if (context === undefined) {
            context = document;
        }
        context.addEventListener('click', _handleClick, false);
        context.addEventListener('input', _handleInput, false);
    };

    exports.clearInput = clearInput;
    exports.destroy = destroy;
    exports.init = init;

}));