package edu.iu.uits.lms.rivet;

import org.springframework.boot.actuate.info.Info;
import org.springframework.boot.actuate.info.InfoContributor;
import org.springframework.stereotype.Component;

/**
 * This class makes the library's version information available via the /actuator/info endpoint
 * The configuration is manually included into spring boot's auto configuration process via the META-INF/spring.factories file
 */
@Component
public class RivetInfoContributor implements InfoContributor {

   @Override
   public void contribute(Info.Builder builder) {
      Package pkg = this.getClass().getPackage();
      String version =  pkg != null ? pkg.getImplementationVersion() : null;
      builder.withDetail("rivet-service", version);
   }

}
