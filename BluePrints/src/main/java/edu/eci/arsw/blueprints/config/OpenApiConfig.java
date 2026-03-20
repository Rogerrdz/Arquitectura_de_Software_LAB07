package edu.eci.arsw.blueprints.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI api() {
        return new OpenAPI()
                .info(new Info()
                        .title("ARSW Blueprints API")
                        .version("v1")
                        .description("Blueprints Laboratory REST API (Java 21 / Spring Boot 3.3.x)")
                        .contact(new Contact()
                                .name("ARSW Lab")
                                .email("arsw@escuelaing.edu.co")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8081")
                                .description("Local development server")
                ));
    }
}
