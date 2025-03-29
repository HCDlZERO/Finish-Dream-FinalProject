package com.dreamfinalproject.controller;

import com.dreamfinalproject.dto.Blogin002RequestDTO;
import com.dreamfinalproject.dto.Blogin002ResponseDTO;
import com.dreamfinalproject.service.Blogin002Service;
import com.dreamfinalproject.service.Blogin002ServiceImpl;
import com.dreamfinalproject.service.TokenService;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/login")
public class Blogin002Controller {

    @Autowired
    private Blogin002ServiceImpl blogin002Service;

    @PostMapping("/authenticate")
    public ResponseEntity<Blogin002ResponseDTO> login(@RequestBody Blogin002RequestDTO loginRequest) {
        try {
            Blogin002ResponseDTO response = blogin002Service.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }


    @PostMapping("/someProtectedEndpoint")
    public ResponseEntity<String> someProtectedEndpoint(@RequestHeader("Authorization") String token) {
        if (isUserAuthorized(token, "Head Officer")) {
            return ResponseEntity.ok("You have access.");
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You do not have permission.");
        }
    }

    // ตรวจสอบสิทธิ์ของผู้ใช้
    private boolean isUserAuthorized(String token, String requiredRole) {
        Claims claims = new TokenService().validateToken(token);
        String role = claims.get("role", String.class);
        return requiredRole.equals(role);
    }
}
