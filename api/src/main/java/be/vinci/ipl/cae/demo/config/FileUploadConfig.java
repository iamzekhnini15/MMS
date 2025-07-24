package be.vinci.ipl.cae.demo.config;

import java.io.File;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration pour servir les fichiers statiques uploadés.
 */
@Configuration
public class FileUploadConfig implements WebMvcConfigurer {

  @Value("${file.upload.dir:uploads}")
  private String uploadDir;

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // Créer le dossier uploads s'il n'existe pas
    File uploadDirectory = new File(uploadDir);
    if (!uploadDirectory.exists()) {
      uploadDirectory.mkdirs();
    }

    // Exposer les fichiers uploadés via l'URL /uploads/**
    registry.addResourceHandler("/uploads/**")
        .addResourceLocations("file:" + uploadDirectory.getAbsolutePath() + "/");
  }
}
