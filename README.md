# LMS Canvas Rivet Web Bundle

When this library is added to a project it allows access to a bundle of rivet UI components and add-ons:

| Library               | Directory             | Files                                                                                                                                                          |
|-----------------------|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Datatables Extensions | datatables-ext        | <ul><li>datatables-ally.css</li><li>datatables-ally.js</li><li>datatables-filters.js</li></ul>                                                                 |
| rivet-clearable-input | rivet-clearable-input | <ul><li>rivet-clearable-input.min.js</li><li>rivet-clearable-input.min.css</li></ul>                                                                           |
| rivet-core            | rivet-core            | <ul><li>rivet.css</li><li>rivet.min.css</li><li>rivet.min.js</li><li>rivet-esm.js</li><li>rivet-iife.js</li><li>rivet-umd.js</li></ul>                         |
| rivet-icons           | rivet-icons           | <ul><li>rivet-icon-element.css</li><li>rivet-icon-element.js</li><li>rivet-icons.js</li><li>rivet-icons.json</li><li>`<icon-name>`.js</li></ul>                |
| rivet-stickers        | rivet-stickers        | <ul><li>rivet-sticker-element.css</li><li>rivet-sticker-element.js</li><li>rivet-stickers.js</li><li>rivet-stickers.json</li><li>`<sticker-name>`.js</li></ul> |
| scrolltotop           | scrolltotop           | <ul><li>scrolltotop.js</li></ul>                                                                                                                               |

## Installation
### From Maven
Add the following as a dependency in your pom.xml
```xml
<dependency>
    <groupId>edu.iu.uits.lms</groupId>
    <artifactId>lms-canvas-rivet</artifactId>
    <version><!-- latest version --></version>
</dependency>
```

You can find the latest version in [Maven Central](https://search.maven.org/search?q=g:edu.iu.uits.lms%20AND%20a:lms-canvas-rivet).

## Setup Examples
### Add Resource Handler to a Java configuration class
```java
// example class
@Configuration
@EnableWebMvc
public class ApplicationConfig implements WebMvcConfigurer {

   @Override
   public void addResourceHandlers(ResourceHandlerRegistry registry) {
      registry.addResourceHandler("/jsrivet/**").addResourceLocations("classpath:/META-INF/resources/jsrivet/").resourceChain(true);
   }

}
```

### Ignore jsrivet artifacts in your security setup
```java
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
   @Override
    public void configure(WebSecurity web) throws Exception {
        web.ignoring().antMatchers("/jsrivet/**");
    }
}
```

### Link to whatever css and js files you need
```html
<link rel="stylesheet" type="text/css" href="/jsrivet/rivet.min.css" />
<script type="text/javascript" src="/jsrivet/rivet.min.js"></script>

```

## Upgrading from rivet-uits (1.x) to rivet-core (2.x)
At the very least, the js/css artifacts are referenced slightly differently:

| Old file             | New file      |
|----------------------|---------------|
| rivet-bundle.min.css | rivet.min.css |
| rivet-bundle.min.js  | rivet.min.js  |

Beyond that, consult the specific rivet docs to find out more.

## Upgrading to 5.2.8.0
With the introduction of the new `rivet-stickers` (0.3.0) and changes to `rivet-icons` (3.0.0), we decided to add 
directories for organizational purposes.  Now, each component will be inside their own directory.  The table at the top 
of this README should mention those specific details.

## Release Upgrades
For upgrading the rivet version in this service:

package.json: Change the version of the "rivet-core" and check for the latest tag release for "rivet-icons" at https://github.com/indiana-university/rivet-icons
pom.xml: Make sure the SNAPSHOT version matches the rivet-core version to be released

## Scroll to top component
If you want to use the bundled scroll to top component in a tool, you will need the following css, js, and html markup
in the tool to make it function. The html assumes the tool will have Rivet 2 and Rivet Icons. 

```
<link rel="stylesheet" type="text/css" th:href="@{/app/jsrivet/rivet.min.css}" />
<link rel="stylesheet" type="text/css" th:href="@{/app/jsrivet/rivet-icons.css}"/>
<link rel="stylesheet" type="text/css" th:href="@{/app/jsrivet/scrolltotop/scrolltotop.css}"/>

<!-- Scroll to top button -->
<button id="scroll-to-top-button" class="rvt-button rvt-button--secondary" onclick="topFunction();" title="Back to top">
    <span class="rvt-m-right-xxs">Back to Top</span>
    <rvt-icon name="arrow-up"></rvt-icon>
</button>

<script type="text/javascript" th:src="@{/app/jsrivet/rivet.min.js}"></script>
<script defer th:src="@{/app/jsrivet/rivet-icons.js}"></script>
<script type="module" th:src="@{/app/jsrivet/rivet-icon-element.js}"></script>
<script type="text/javascript" th:src="@{/app/jsrivet/scrolltotop/scrolltotop.js}"></script>
```

## Datatables Extensions
See the [README.md](public/datatables-ext/README.md) in the source for details.