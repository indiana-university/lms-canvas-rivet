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
            // cell in the table. The label should be the visual table header and the description should be the sorting instructions

            let sortBy = header.text().trim();
            let currentSort = header.attr("aria-sort");
            let direction = currentSort != null && currentSort == 'ascending' ? "descending" : "ascending";

            let description=`Activate to sort by ${sortBy} ${direction}`;

            // We are replacing the wonky th that currently uses tabindex and role=button with an actual button. Remove the tabindex and role
            let headerSpan = $(header.find("span.dt-column-title")[0]);
            headerSpan.removeAttr("role");

            let sortButton = headerSpan.find("button")[0];
            $(sortButton).attr("aria-description", description);

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
function labelCheckboxes(options) {
    $("th.rowCheckbox").each( function() {
        // need to add a label pointing to a suitable location
        let targetLabel = $(this).closest('tr').find(`${options.checkLabelTargetSelector}`)[0];
        let inputCheckbox = $(this).find('input[type=checkbox]')[0];
        $(inputCheckbox).attr("aria-labelledby", targetLabel.id);
        $(inputCheckbox).removeAttr("aria-label");
    });
}

/**
 * Make the search box more accessible
 **/
function addDescriptiveLabels() {
    // Add SR search instructions
    $('div.search-wrapper').find('input[type=search]').attr('aria-describedby','searchText');
}

/**
 * Make accessibility changes
 * options - Config options map
 **/
function applyAccessibilityOverrides(options) {
    // add more descriptive labels to the form elements with implicit labels
    addDescriptiveLabels();
    // add meaningful labels to the checkboxes
    labelCheckboxes(options);
}

/**
 * Add a listener for datatables preInit
 **/
$(document).on('preInit.dt', function(e, settings) {
    let tableId = settings.sTableId;
    $(`#${tableId}`).on( 'draw.dt', function (e, settings) {
        // after the table is drawn (on init, sort, search, etc) we need to apply the table header accessibility fixes again
        fixTableHeaders(settings);
    });
});

/**
 * Add a listener for datatables init
 **/
$(document).on('init.dt', function(e, settings) {
    let options = settings.oInit.lmsAlly;
    applyAccessibilityOverrides(options);
});