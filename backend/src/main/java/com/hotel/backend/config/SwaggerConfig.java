package com.hotel.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI(){
        return new OpenAPI()
                .info(new Info()
                        .title("Hotel Management")
                        .version("1.0.0")
                        .description("Hotel Management System")
                        .contact(new Contact()
                                .name("Izzatbek")
                                .email("abdusharipovizzat03@gmail.com")
                        ));
    }
}
