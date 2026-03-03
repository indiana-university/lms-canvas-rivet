/**
 * Register a new Datatable feature for filters
 * datatablesSettings - Settings coming from datatables
 * opts - Hash of custom properties passed in via the 'layout'
 **/
DataTable.feature.register('lmsFilters', function (datatablesSettings, opts) {
    // Initialize a container div for all the filters
    let container = $('<div></div>');
    container.innerHTML = '<em>Loading filters...</em>';

    // We have to use an async function here because we might need to fetch data before we can build the filters
    (async () => {
        // Define defaults for the component
        let options = Object.assign({
            includeClearFilters: false,
            containerClass: 'undefined',
            descSortOrderFilterNames: []
       }, opts);

        let tableId = datatablesSettings.sTableId;

        if (options.containerClass && options.containerClass !== "undefined") {
            container.addClass(options.containerClass);
        }

        // Array to track individual filters so we can find them to reset later
        let filterIds = []

        // Make sure the filter names are all lowercase for easier matching later
        options.descSortOrderFilterNames = options.descSortOrderFilterNames.map(field => field.toLowerCase());

        // Loop through all the column definitions, looking for any with the filtering enabled
        for (const colDef of datatablesSettings.aoColumns) {
            if (colDef.lmsFilters && typeof colDef.lmsFilters !== "undefined") {
                // Get the unique name and id for the filter
                let filterName = datatablesSettings.aoColumns[colDef.idx].sTitle;
                let filterId = "filter-" + generateItemId(filterName);

                // Track individual filters so we can find them to reset later
                filterIds.push({filterId: filterId, colIndex: colDef.idx});

                // Merge some custom values with any options defined in the column definition
                let params = Object.assign(colDef.lmsFilters,
                    { colIndex: colDef.idx, filterName: filterName, filterId: filterId, tableId: tableId, delimiter: colDef.delimiter });

                let sortDropdownOrder = options.descSortOrderFilterNames.includes(filterName.toLowerCase()) ? 'desc' : 'asc';

                // Add the filter to the container div
                let filter = await buildLmsFilter(datatablesSettings, params, sortDropdownOrder);
                if (filter) {
                    container.append(filter);
                }
            }
        }

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
    })();

    return container;
});

/**
 * Fetch data from the provided URL using AJAX
 * url - The URL to fetch data from
 * Returns a promise that resolves with the fetched data or rejects with an error
 **/
function fetchData(url) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            dataType: "json"
        }).done(function(data) {
            resolve(data);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", textStatus, errorThrown);
            reject(new Error(`Failed to fetch data from ${url}: ${textStatus} ${errorThrown}`));
        });
    });
}

/**
 * Build a filter
 * datatablesSettings - Settings coming from datatables
 * options - Options used to create this instance of the filter
 * sortDropdownOrder - either 'asc' (ascending) or 'desc' (descending)
 **/
async function buildLmsFilter(datatablesSettings, options, sortDropdownOrder) {
    let column = datatablesSettings.api.columns(options.colIndex);

    let filterId = options.filterId;
    let filterName = options.filterName;
    let colIdx = options.colIndex;
    let tableId = options.tableId;
    let defaultValue = options.defaultValue;

    let delimiter = options.delimiter;
    console.debug("Building filter for column: ", filterName);

    let columnData; // = new $.fn.dataTable.Api([]).unique();
    if (options.fetchUrl) {
        // If a fetchUrl is provided, we need to fetch the data before building the filter
        try {
            columnData = await fetchData(options.fetchUrl);
        } catch (error) {
            console.error("Error fetching filter data:", error);
            return;
        }
    } else if (options.staticOptions) {
        columnData = options.staticOptions;
    } else {
        columnData = column.data().eq(0).unique();
    }

    let filterOptions = splitDelimitedData(columnData, delimiter);

    if (sortDropdownOrder === 'desc') {
        // Special sort function so that it's case-insensitive (sort by displayText)
        filterOptions = filterOptions.sort((a,b) => b.displayText.localeCompare(a.displayText));
    } else {
        // Special sort function so that it's case-insensitive (sort by displayText)
        filterOptions = filterOptions.sort((a,b) => a.displayText.localeCompare(b.displayText));
    }

    let serverSide = Boolean(options.fetchUrl) || Boolean(options.serverSide);
    let optionsHtml = '';

    // Build the selectable option for each filter item
    filterOptions.forEach(item => {
        let itemId = generateItemId(item.optionValue);
        let key = filterId + "-" + itemId;
        let escapedValue = DataTable.util.escapeHtml(item.optionValue);
        let escapedDisplay = DataTable.util.escapeHtml(item.displayText);
        let isChecked = ''
        if (defaultValue === item.optionValue) {
            isChecked = 'checked'
        }

        // If we split on a delimiter, we can't use an exact match on the column data
        let exactMatch = delimiter ? false : true;

        optionsHtml +=
            `<li>
                <div class="rvt-checkbox">
                    <input type="checkbox" id="${key}" name="${filterId}-checkboxes" class="filter-input prevent-submit" value="${escapedValue}" ${isChecked} data-text="${escapedDisplay}" onchange="filterCheckboxChange(this, ${colIdx}, '${filterId}', '${tableId}', ${exactMatch}, ${serverSide})"/>
                    <label for="${key}" class="rvt-m-right-sm rvt-text-nobr">${escapedDisplay}</label>
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
 * Function to split delimited data. Returns array of objects with optionValue and displayText.
 * Handles both raw string data and objects that already have optionValue/displayText fields.
 *
 * columnData - The data to split (can be strings or objects with optionValue/displayText)
 * delimiter - The delimiter to split on (optional)
 * Returns an array of unique objects with structure: { optionValue: string, displayText: string }
 */
function splitDelimitedData(columnData, delimiter) {
    const mySet = new Set();  // use a set to remove duplicates
    const items = toArray(columnData);

    items.forEach(item => {
        // Handle objects that already have optionValue/displayText structure
        if (typeof item === 'object' && item !== null && item.optionValue !== undefined) {
            // Item is already an object with the right structure
            // If it has a delimiter, split the optionValue
            if (delimiter && typeof item.optionValue === 'string') {
                let splitValues = item.optionValue.split(delimiter);
                splitValues.forEach(function(subValue) {
                    subValue = subValue.replace("\n", "").trim();
                    if (subValue.length > 0) {
                        mySet.add(JSON.stringify({
                            optionValue: subValue,
                            displayText: item.displayText || subValue
                        }));
                    }
                });
            } else {
                // No delimiter, just add the object as-is
                mySet.add(JSON.stringify(item));
            }
        } else {
            // Item is a string, convert it to object format
            const stringValue = String(item);
            if (delimiter) {
                // Split the item by the delimiter
                let splitItem = stringValue.split(delimiter);
                splitItem.forEach(function(subItem) {
                    // Remove line breaks
                    subItem = subItem.replace("\n", "");
                    // Remove any leading/trailing whitespace
                    subItem = subItem.trim();
                    // Check if the item is not empty
                    if (subItem.length > 0) {
                        mySet.add(JSON.stringify({
                            optionValue: subItem,
                            displayText: subItem
                        }));
                    }
                });
            } else {
                // No delimiter, just convert string to object
                mySet.add(JSON.stringify({
                    optionValue: stringValue,
                    displayText: stringValue
                }));
            }
        }
    });

    // Convert Set of JSON strings back to array of objects
    return Array.from(mySet).map(jsonStr => JSON.parse(jsonStr));
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
 * exactMatch - Boolean indicating whether to use exact match (wrap values with ^ and $)
 * serverSide - Boolean indicating whether the datatable is using server-side processing (if true, we need to trigger the search on change instead of relying on datatables' built in search delay)
 **/
function filterCheckboxChange(element, colIdx, filterIdPrefix, tableId, exactMatch, serverSide) {
    let values = [];
    // Get all checked values
    $('input[type="checkbox"][name="' + element.name + '"].filter-input:checked').each(function() {
        values.push(DataTable.util.escapeRegex(htmlDecode($(this).val())));
    });

    let regExpStr;
    let regex = true;
    if (serverSide && exactMatch) {
        regExpStr = values.map(function(val) { return val }).join("+");
        regex = false;
    } else if (exactMatch) {
        // Escape things, and use exact match (wrapped with ^ and $)
        regExpStr = values.map(function(val) { return "^" + val + "$" }).join("|");
    } else {
        regExpStr = values.map(function(val) { return val }).join("|");
    }

    // Search for all selected values in the appropriate column
    let tableInstance = lookupTableInstance(tableId);
    tableInstance.column(colIdx).search(regExpStr, regex, false).draw();
    computeAndDisplayActiveFilters(filterIdPrefix, tableInstance);
}

/**
 * Decode any html characters in the value so that the original content can be searched on
 * value - String to decode
 **/
function htmlDecode(value) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    return textarea.value;
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

/**
 * Convert the provided data to an array, if it isn't one already
 * This is necessary because the data could come in different formats depending on how the column data is defined (array, jQuery object, DataTables API object, etc.)
 * data - The data to convert to an array
 * Returns an array of data items
 **/
function toArray(data) {
    if (Array.isArray(data)) {
        return data;
    } else if (data && typeof data.toArray === 'function') {
        // DataTables API objects have a toArray() method
        return data.toArray();
    } else if (data && typeof data.each === 'function') {
        // jQuery or DataTables objects with .each() method
        const arr = [];
        data.each(function(item) {
            arr.push(item);
        });
        return arr;
    } else {
        console.warn("Unable to convert data to array:", data);
        return [];
    }
}

/**
 * Generate an item ID from an item name
 * item - The item name
 * Returns a sanitized item ID
 */
function generateItemId(item) {
    return item.replace(/\W/g,'_').toLowerCase();
}

/**
 * Support Node.js/CommonJS environment (for testing)
 * This allows Jest tests to import the utility functions
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toArray,
        splitDelimitedData,
        htmlDecode,
        generateItemId,
        fetchData,
        clearFilter,
        clearAllFilters,
        filterCheckboxChange
    };
}
