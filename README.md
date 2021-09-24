# LMS Canvas Rivet Web Bundle

When this library is added to a project it allows access to a bundle of rivet UI components and add-ons:
* rivet-bundle
* rivet-clearable-input
* rivet-collapsible
* rivet-icons

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
<link rel="stylesheet" type="text/css" href="/jsrivet/rivet-bundle.min.css" />
<script type="text/javascript" src="/jsrivet/rivet-bundle.min.js"></script>

```