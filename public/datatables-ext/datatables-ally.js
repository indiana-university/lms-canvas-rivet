/**
 * Datatable isn't as accessible as we want, so we need to fiddle with a bunch of stuff to improve the experience!
 **/

/**
 * Make the sortable table headers more accessible
 * datatablesSettings - Settings coming from datatables
 **/
function fixTableHeaders(datatablesSettings) {
    datatablesSettings.api.columns().every( function() {
        let col = this;
        // Fiddle only with the sortable headers
        if (col.orderable()) {
            let header = $(col.header());
            header.addClass('sorting');
            header.removeAttr("aria-label tabindex");

            // DT uses aria-label for its extra description on the sort headers. However, this means it is read on every
            // cell in the table. The label should be the visual table header

            // We are replacing the wonky th that currently uses tabindex and role=button with an actual button. Remove the tabindex and role
            let headerSpan = $(header.find("span.dt-column-title")[0]);
            headerSpan.removeAttr("role");

            // also remove the tabindex on the sorting arrows
            $(header.find("span.dt-column-order")[0]).removeAttr("tabindex role aria-label");

            // Add SR text to indicate current sort order. Currently, only JAWS reads the aria-sort attribute, NVDA and VoiceOver do not.
            let sortButton = headerSpan.find("button")[0];
            let currentSort = header.attr("aria-sort");
            if (currentSort) {
                $(sortButton).attr("aria-description", `Sorted ${currentSort}`);
            } else {
                $(sortButton).removeAttr("aria-description");
            }

            // DT uses an event handler on the th instead of a button, so we have to manually handle the sorting events to trigger the SR message
            header.on( "keypress", function(event) {
                if (event.key === "Enter") {
                    sortingNotify($(this));
                }
            });

            header.click(function() {
                sortingNotify($(this));
            });

        }
    });

}

/**
 * Add SR notification of the sorting change
 * sortHeader - header element (jquery object)
 **/
function sortingNotify(sortHeader) {
    let sortBy = sortHeader.text().trim();
    let currentSort = sortHeader.attr("aria-sort");
    let direction = currentSort != null && currentSort == 'ascending' ? "descending" : "ascending";
    $("#sortingAnnc").text("Sorting by " + sortBy + " " + direction);
}

/**
 * Make the row selection checkboxes more accessible
 * options - Config options map
 **/
function labelCheckboxes(options, tableId) {
    $(`#${tableId} .rowCheckbox`).each( function() {
        // need to add a label pointing to a suitable location
        let targetLabel = $(this).closest('tr').find(`${options.checkLabelTargetSelector}`)[0];
        let inputCheckbox = $(this).find('input[type=checkbox]')[0];
        $(inputCheckbox).attr("aria-labelledby", targetLabel.id);
        $(inputCheckbox).removeAttr("aria-label");
        $(inputCheckbox).addClass("prevent-submit");
    });
}

/**
 * Make the search box more accessible
 **/
function addDescriptiveLabels() {
    // Add SR search instructions if the searchText element exists. It should be a hidden span or something similar
    if ($('#searchText')) {
        $('div.search-wrapper').find('input[type=search]').attr('aria-describedby','searchText');
    }
}

/**
 * Make accessibility changes
 * options - Config options map
 **/
function applyAccessibilityOverrides(settings) {
    let options = settings.oInit.lmsAlly;
    let tableId = settings.sTableId;

    // add more descriptive labels to the form elements with implicit labels
    addDescriptiveLabels();
    fixTableHeaders(settings);
    // add meaningful labels to the checkboxes
    labelCheckboxes(options, tableId);

}

// In FF, pressing enter on a checkbox will submit the form. We need to prevent the enter key
// from submitting on checkboxes. Keyboard users will use spacebar to check a checkbox.
// Pressing "enter" will not submit the form when the checkbox has the "prevent-submit" class
$(document).on("keypress", ":input.prevent-submit:checkbox", function(event) {
  return event.key != 'Enter';
});

/**
 * Add a listener for datatables preInit
 **/
$(document).on('preInit.dt', function(e, settings) {
    let options = settings.oInit.lmsAlly;
    let tableId = settings.sTableId;
    $(`#${tableId}`).on( 'draw.dt', function (e, settings) {
        // after the table is drawn (on init, sort, search, etc) we need to apply the table accessibility fixes again
        applyAccessibilityOverrides(settings);
    });
});
