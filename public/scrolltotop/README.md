# Scroll-To-Top web component

## How to use

The below example assumes it's being used in a thymeleaf file.  
Keep in mind that the path to the js could be slightly different from application to application.

```
<script type="text/javascript" defer th:src="@{/jsrivet/scrolltotop/scrolltotop.js}"></script>
```

The component assumes that it will have access to rivet's css file. The default path is `/app/jsrivet/rivet.min.css`.
Will also need to specify a "focusid" for page focus after activating the scroll to top button. Recommend using a h1 tag
at the top of the page.

```
<h1 id="main-header">Cool Title at Top of Page</h1>
<scroll-to-top focusid="main-header"></scroll-to-top>
```

If the app has a different path for the css file, override it by including the `rivetpath` attribute:

```
<scroll-to-top rivetpath="/alternate_path/jsrivet" focusid="main-header"></scroll-to-top>
```