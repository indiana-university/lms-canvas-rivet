# Datatables extensions

## How to use

The below examples assume they are being used in a thymeleaf file.  
Keep in mind that the path to the css/js could be slightly different from application to application.

### Advanced Filters

If you want to use the filters feature, include on your page/layout:

```
<script type="text/javascript" th:src="@{/app/jsrivet/datatables-ext/datatables-filters.js}"></script>
```

Important bits in the configuration below would be anywhere you see `lmsFilters`.
The main piece is including it in a layout, along with any of the global configurations.

Global config options:

| Setting                               | Default Value | Description                                                                                                                                                                                                                                                                                                                                  |
|---------------------------------------|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `containerClass` (optional)           |               | CSS class(es) to be added to the wrapper around all filter buttons                                                                                                                                                                                                                                                                           |
| `descSortOrderFilterNames` (optional) | []            | This is an array of strings that define which filter dropdowns should be sorted in decending order. Filter names are the string after "filter-"  but before "-dropdown-filter" in the data-rvt-dropdown attribute of the div tag. For instance, filter-date-dropdown-filter would be a filter name of 'date' so the value should be ['date'] |
| `includeClearFilters` (optional)      | `false`       | Boolean indicating of a "Clear Filters" button should be included                                                                                                                                                                                                                                                                            |

Column Definition options:

| Setting                   | Default Value | Description                                                    |
|---------------------------|---------------|----------------------------------------------------------------|
| `defaultValue` (optional) |               | Filter's initial value (single value)                          |
| `delimiter` (optional)    |               | Delimiter used for a list of values that you want to filter on |

If you don't need to set a default (preselected) value, then simply having `lmsFilters: true` is sufficient to enable a filter for the column.

Not specific to this feature, for the target columns, a 0 based index is common, but I like using a css class selector, 
as it makes it more obvious which column is being configured!  Just have to make sure to add that class over on the `th` in the markup.

If you have a scenario where you want to filter on multiple values in a column, you can do that by specifying a delimiter.
For example, if you have a column that contains multiple roles (e.g. "Instructor, TA"), you can set the delimiter to ", " (comma space).
Then if you select "Instructor" from the filter dropdown, it will match any row that contains "Instructor" in that column, even if there are other roles listed as well.
Using <br> is a useful delimiter if the column data is visible, as it will display as a column with line breaks.
```
$('#appTable').DataTable({
    ...
    columnDefs: [
        {
            targets: [0],
            orderable: false,
            // Get the column indexes containing the data that will be used for the checkbox value and name
            render: DataTable.render.select('.' + $('th.colResultId').index(), '.' + $('th.colCheckboxName').index())
        },
        { targets: ['.colFilename', '.colToolId', '.colDeploymentId'], className: 'limited-column-width' },
        { targets: ['.colNotes'], orderable: false },
        {
            // Enabling filters for these columns
            targets: ['.colUploader', '.colDate', '.colFilename','.colTool', '.colSisCourseId'],
            lmsFilters: true
        },
        {
            targets: ['.colResultId', '.colBatch', '.colToolId', 'colCheckboxName'], visible: false
        },
        {
            targets: ['.colArchived'], visible: false,
            lmsFilters: {
                defaultValue: 'false'
            }
        },
        {
            targets: ['.colRoles'],
            delimiter: '<br>'
        }
    ],
    layout: {
        top1Start: {
            // Configuration for the filters
            lmsFilters: {
                containerClass: 'rvt-flex-md-up rvt-p-bottom-sm rvt-wrap',
                includeClearFilters: true
            }
        },
    },
    ...
});

```

### Accessibility Enhancements

If you want to use the accessibility enhancements, include on your page/layout:

```
<link rel="stylesheet" type="text/css" th:href="@{/app/jsrivet/datatables-ext/datatables-ally.css}"/>
<script type="text/javascript" th:src="@{/app/jsrivet/datatables-ext/datatables-ally.js}"></script>
```

Most things will happen automatically, but you do need to give a hint for row selection checkboxes. It's simply a css
selector for an element (in the same row) where labeling information can be found.
Add to the datatable configuration:

```
$('#appTable').DataTable({
    ...
    lmsAlly: {
        checkLabelTargetSelector: 'span.chkLabelDesc'
    }
    ...
});
```

The value of `checkLabelTargetSelector` represents the css selector that holds the desired label details.