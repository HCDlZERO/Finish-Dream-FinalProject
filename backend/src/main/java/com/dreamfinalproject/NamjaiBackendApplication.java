package com.dreamfinalproject;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling  // ✅ เปิดระบบ Scheduled Task
@SpringBootApplication
public class NamjaiBackendApplication implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(NamjaiBackendApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("✅ Spring Boot Application is running and connected to SQL Server.");
    }
}
