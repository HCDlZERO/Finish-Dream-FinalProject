package com.dreamfinalproject.controller;

import com.dreamfinalproject.dto.RegisterRequest;
import com.dreamfinalproject.service.Bregister001Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid; // ต้อง import

@RestController
@RequestMapping("/api/bregister001")
@Validated
public class Bregister001Controller {

    @Autowired
    private Bregister001Service bregister001Service;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        // ตรวจสอบว่ารหัสผ่านและการยืนยันรหัสผ่านตรงกันหรือไม่
        if (!request.isPasswordMatch()) {
            return ResponseEntity.badRequest().body("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
        }

        // เรียกใช้บริการเพื่อจัดการกับการลงทะเบียน
        String result = bregister001Service.register(request);
        if (result.contains("สำเร็จ")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }
}
