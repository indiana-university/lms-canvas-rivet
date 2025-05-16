
/**
 * Register a new Datatable feature for filters
 * datatablesSettings - Settings coming from datatables
 * opts - Hash of custom properties passed in via the 'layout'
 **/
DataTable.feature.register('lmsFilters', function (datatablesSettings, opts) {
    // Define defaults for the component
    let options = Object.assign({
        includeClearFilters: false,
        containerClass: 'undefined',

        // Filter names are the string after "filter-"  but before -dropdown-filter in the
        // data-rvt-dropdown attribute of the div tag.
        // For instance, filter-date-dropdown-filter would be a filter name of 'date'
        descSortOrderFilterNames: []
   }, opts);

    let tableId = datatablesSettings.sTableId;

    // Initialize a container div for all the filters
    let container = $('<div></div>');
    if (options.containerClass && options.containerClass !== "undefined") {
        container.addClass(options.containerClass);
    }

    // Array to track individual filters so we can find them to reset later
    let filterIds = []

    // Make sure the filter names are all lowercase for easier matching later
    options.descSortOrderFilterNames = options.descSortOrderFilterNames.map(field => field.toLowerCase());

    // Loop through all the column definitions, looking for any with the filtering enabled
    datatablesSettings.aoColumns.forEach(function(colDef) {
        if (colDef.lmsFilters && typeof colDef.lmsFilters !== "undefined") {
            // Get the unique name and id for the filter
            let filterName = datatablesSettings.aoColumns[colDef.idx].sTitle;
            let filterId = "filter-" + filterName.replace(/\W/g,'_').toLowerCase();

            // Track individual filters so we can find them to reset later
            filterIds.push({filterId: filterId, colIndex: colDef.idx});

            // Merge some custom values with any options defined in the column definition
            let params = Object.assign(colDef.lmsFilters,
                { colIndex: colDef.idx, filterName: filterName, filterId: filterId, tableId: tableId });

            let sortDropdownOrder = options.descSortOrderFilterNames.includes(filterName.toLowerCase()) ? 'desc' : 'asc';

            // Add the filter to the container div
            let filter = buildLmsFilter(datatablesSettings, params, sortDropdownOrder);
            container.append(filter);
        }
    });

    // Optionally include a button to clear all the filters
    if (options.includeClearFilters) {
        // Stringify and base64 encode the values for easier passing to the onclick handler
        let base64Json = btoa(JSON.stringify(filterIds));
        let clearFilter = `
            <div class="rvt-p-top-xs rvt-m-right-sm-md-up">
                <button id="clear-filters" type="button" class="rvt-button rvt-button--secondary" onclick="clearAllFilters('${base64Json}', '${tableId}')">Clear Filters</button>
            </div>
        `;

        container.append(clearFilter);
    }

    let scriptTrigger =
        `<script>
            $( document ).ready(function() {
                $('input.filter-input:checked').trigger('change');
            });
        </script>`;
    container.append(scriptTrigger);

    return container;
});

/**
 * Build a filter
 * datatablesSettings - Settings coming from datatables
 * options - Options used to create this instance of the filter
 * sortDropdownOrder - either 'asc' (ascending) or 'desc' (descending)
 **/
function buildLmsFilter(datatablesSettings, options, sortDropdownOrder) {
    let column = datatablesSettings.api.columns(options.colIndex);

    let filterId = options.filterId;
    let filterName = options.filterName;
    let colIdx = options.colIndex;
    let tableId = options.tableId;
    let defaultValue = options.defaultValue;

    let filterOptions;

    if (sortDropdownOrder === 'desc') {
        // Special sort function so that it's case-insensitive
        filterOptions = column.data().eq(0).unique().sort((a,b) => b.localeCompare(a));
    } else {
        // Special sort function so that it's case-insensitive
        filterOptions = column.data().eq(0).unique().sort((a,b) => a.localeCompare(b));
    }

    let optionsHtml = '';

    // Build the selectable option for each filter item
    filterOptions.each(function(item) {
        let itemId = item.replace(/\W/g,'_').toLowerCase();
        let key = filterId + "-" + itemId;
        let escapedItem = DataTable.util.escapeHtml(item);
        let isChecked = ''
        if (defaultValue === item) {
            isChecked = 'checked'
        }

        optionsHtml +=
            `<li>
                <div class="rvt-checkbox">
                    <input type="checkbox" id="${key}" name="${filterId}-checkboxes" class="filter-input prevent-submit" value="${escapedItem}" ${isChecked} data-text="${escapedItem}" onchange="filterCheckboxChange(this, ${colIdx}, '${filterId}', '${tableId}')"/>
                    <label for="${key}" class="rvt-m-right-sm rvt-text-nobr">${item}</label>
                </div>
            </li>`;
    });

    let container =
        `<div class="rvt-dropdown rvt-p-top-xs rvt-m-right-sm-md-up" role="region" aria-label="Controls for filtering by ${filterName}" data-rvt-dropdown="${filterId}-dropdown-filter">
              <div id="${filterId}-selected-text" class="rvt-sr-only" aria-live="polite"></div>
              <button id="${filterId}-button" type="button" class="rvt-button rvt-button--secondary transparencyOverride"
                    data-rvt-dropdown-toggle="${filterId}-filter-options" aria-describedby="${filterId}-sr-filters-active">
                  <span class="rvt-dropdown__toggle-text">Filter By ${filterName} <span aria-hidden="true" id="${filterId}-filters-active"></span></span>
                  <svg aria-hidden="true" fill="currentColor" width="16" height="16" viewBox="0 0 16 16"><path d="m15.146 6.263-1.292-1.526L8 9.69 2.146 4.737.854 6.263 8 12.31l7.146-6.047Z"></path></svg>
                  <span hidden id="${filterId}-sr-filters-active"></span>
              </button>
              <div id="${filterId}-dropdown" class="rvt-dropdown__menu" data-rvt-dropdown-menu="${filterId}-filter-options" hidden>
                  <button id="${filterId}-remove-filters" type="button" aria-describedby="${filterId}-filter-count" class="rvt-button rvt-button--secondary" onclick="clearFilter('${filterId}-checkboxes', ${colIdx}, '${filterId}', '${tableId}')">Remove ${filterName} Filters</button>
                  <span id="${filterId}-filter-count" class="rvt-sr-only">No filters currently selected</span>
                  <div id="${filterId}-division">
                      <fieldset class="rvt-fieldset rvt-p-left-sm">
                          <legend class="rvt-text-bold rvt-p-tb-xs">${filterName}</legend>
                          <ul class="rvt-list-plain">
                              ${optionsHtml}
                          </ul>
                      </fieldset>
                  </div>
              </div>
          </div>`;

    return container;
}

/**
 * Clear the specified filter's selected values
 * checkboxName - Element name for all the checkboxes to be cleared
 * colIdx - Column index (zero based) of the data being filtered
 * filterIdPrefix - Prefix used in all the filter related controls
 * tableId - ID for the table element
 **/
function clearFilter(checkboxName, colIdx, filterIdPrefix, tableId) {
    $('input[type="checkbox"][name="' + checkboxName + '"].filter-input:checked').prop('checked', false);
    let tableInstance = lookupTableInstance(tableId);
    tableInstance.column(colIdx).search('', true, false).draw();
    computeAndDisplayActiveFilters(filterIdPrefix, tableInstance);
}

/**
 * Clear all filters
 * encodedData - Base64 encoded, string-ified json data
 * tableId - ID for the table element
 **/
function clearAllFilters(encodedData, tableId) {
    // Clear filters
    $('input[type="checkbox"].filter-input:checked').prop('checked', false);

    let jsonData = JSON.parse(atob(encodedData));

    let tableInstance = lookupTableInstance(tableId);

    // Loops through each filter identified by the json
    jsonData.forEach(function(filterItem) {
        //filterIds.push({filterId: filterId, colIndex: colDef.idx});
        tableInstance.column(filterItem.colIndex).search('', true, false).draw();
        computeAndDisplayActiveFilters(filterItem.filterId, tableInstance);
    });
}

/**
 * Event handler for when a filter checkbox changes
 * element - Dom element where the event originated
 * colIdx - Column index (zero based) of the data being filtered
 * filterIdPrefix - Prefix used in all the filter related controls
 * tableId - ID for the table element
 **/
function filterCheckboxChange(element, colIdx, filterIdPrefix, tableId) {
    let values = [];
    // Get all checked values
    $('input[type="checkbox"][name="' + element.name + '"].filter-input:checked').each(function() {
        values.push(DataTable.util.escapeRegex(htmlDecode($(this).val())));
    });

    // Escape things, and use exact match (wrapped with ^ and $)
    let regExpStr = values.map(function(val) { return "^" + val + "$" }).join("|");

    // Search for all selected values in the appropriate column
    let tableInstance = lookupTableInstance(tableId);
    tableInstance.column(colIdx).search(regExpStr, true, false).draw();
    computeAndDisplayActiveFilters(filterIdPrefix, tableInstance);
}

/**
 * Decode any html characters in the value so that the original content can be searched on
 * value - String to decode
 **/
function htmlDecode(value) {
  return $("<textarea/>").html(value).text();
}

/**
 * Update descriptive text when a filter has items (un)checked
 * filterIdPrefix - Prefix used in all the filter related controls
 * tableInstance - Instance of the DataTable
 **/
function computeAndDisplayActiveFilters(filterIdPrefix, tableInstance) {
    let checkedFilters = $('input[type="checkbox"][name="' + filterIdPrefix + '-checkboxes"].filter-input:checked');
    let numberOfChecked = checkedFilters.length
    let newContent = ""
    // VoiceOver has issues with dynamic text descriptions. The old text is still read after the message is cleared.
    // When this is a space instead of an empty string, VoiceOver seems to clear out the old text
    let newSrContent = " "
    let filterCountText = "No filters currently selected"
    let filterInfoText = "No filters selected"

    if (numberOfChecked !== 0) {
        newContent = "(" + numberOfChecked + ")"
        newSrContent = numberOfChecked + " selected"

        let filterValues = [];
        checkedFilters.each(function( c ) {
            filterValues.push($(this).data("text"));
        });

        filterInfoText = "Selected filters: " + filterValues.join();

        let fv = numberOfChecked === 1 ? 'filter' : 'filters';
        filterCountText = numberOfChecked + ' ' + fv + ' currently selected';
    }

    $("#" + filterIdPrefix + "-selected-text").html(filterInfoText);

    //${filterId}-filters-active
    $("#" + filterIdPrefix + "-filters-active").html(newContent)
    $("#" + filterIdPrefix + "-sr-filters-active").html(newSrContent)

    //${filterId}-filter-count
    $("#" + filterIdPrefix + "-filter-count").html(filterCountText)

    tableInstance.trigger('filter-update');
}

/**
 * Look up the DataTable instance based on the ID of the table element
 * tableId - ID for the table element
 **/
function lookupTableInstance(tableId) {
    return $(`#${tableId}`).DataTable();
}
