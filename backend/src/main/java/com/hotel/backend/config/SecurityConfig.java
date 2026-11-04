package com.hotel.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final CorsConfig corsConfig;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http){
        http
                .cors(cors->cors.configurationSource(corsConfig.corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(
                        auth->auth
                                .requestMatchers(
                                        "/auth/**",
                                        "/swagger-ui.html",
                                        "/swagger-ui/**",
                                        "/api-docs/**"
                                ).permitAll()
                                .requestMatchers(HttpMethod.GET,"/rooms","/rooms/**").permitAll()
                                .requestMatchers(HttpMethod.POST,"/rooms","/rooms/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT,"/rooms","/rooms/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE,"/rooms","/rooms/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.GET, "/bookings").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PATCH, "/bookings/*/status", "/bookings/*/confirm", "/bookings/*/check-in", "/bookings/*/check-out").hasRole("ADMIN")
                                .requestMatchers("/bookings", "/bookings/**").authenticated()
                                .requestMatchers(HttpMethod.GET, "/users/me").authenticated()
                                .requestMatchers("/users", "/users/**").hasRole("ADMIN")
                                .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(session->session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }
}
