package com.dreamfinalproject.service;

import com.dreamfinalproject.util.TokenUtil;
import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class TokenService {

    private static final String SECRET_KEY = "your-secret-key"; // ใช้ key ที่ปลอดภัย

    // สร้าง JWT Token
    public String generateToken(String subject, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);

        return TokenUtil.generateToken(subject, claims);
    }

    // ตรวจสอบ JWT Token
    public Claims validateToken(String token) {
        return TokenUtil.parseClaims(token, SECRET_KEY);
    }
}