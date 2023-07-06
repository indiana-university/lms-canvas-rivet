# LMS Canvas Rivet Web Bundle

When this library is added to a project it allows access to a bundle of rivet UI components and add-ons:

| Library               | Files                                                                                                          |
|-----------------------|----------------------------------------------------------------------------------------------------------------|
| rivet-core            | <ul><li>rivet.min.js</li><li>rivet-esm.js</li><li>rivet-iife.js</li><li>rivet.min.css</li></ul>                |
| rivet-clearable-input | <ul><li>rivet-clearable-input.min.js</li><li>rivet-clearable-input.min.css</li></ul>                           |
| rivet-collapsible     | <ul><li>rivet-collapsible.min.js</li><li>rivet-collapsible.min.css</li></ul>                                   |
| rivet-icons           | <ul><li>rivet-icons.svg</li><li>rivet-icon-element.js</li><li>rivet-icons.css</li><li>rivet.icons.js</li></ul> |
| rivet-switch          | <ul><li>rivet-switch.min.js</li><li>rivet-switch.min.css</li></ul>                                             |

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

## Release Upgrades
For upgrading the rivet version in this service:

package.json: Change the version of the "rivet-core" and check for the latest tag release for "rivet-icons" at https://github.com/indiana-university/rivet-icons
pom.xml: Make sure the SNAPSHOT version matches the rivet-core version to be released