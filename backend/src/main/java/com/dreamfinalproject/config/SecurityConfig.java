package com.dreamfinalproject.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.context.annotation.Bean;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // ✅ ปิด CSRF แบบใหม่
                .authorizeHttpRequests(requests ->
                        requests.anyRequest().permitAll() // ✅ ใช้ lambda style แทน method deprecated
                );
        return http.build();
    }
}
