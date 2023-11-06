# Scroll-To-Top web component

## How to use

The below example assumes it's being used in a thymeleaf file.  
Keep in mind that the path to the js could be slightly different from application to application.

```
<script type="text/javascript" defer th:src="@{/jsrivet/scrolltotop/scrolltotop.js}"></script>
```

The component assumes that it will have access to rivet's css file. The default path is `/app/jsrivet/rivet.min.css`.

```
<scroll-to-top></scroll-to-top>
```

If the app has a different path for the css file, override it by including the `rivetpath` attribute:

```
<scroll-to-top rivetpath="/alternate_path/jsrivet"></scroll-to-top>
```