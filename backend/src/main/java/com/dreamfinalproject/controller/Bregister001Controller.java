package com.dreamfinalproject.controller;

import com.dreamfinalproject.dto.RegisterRequest;
import com.dreamfinalproject.dto.RegisterResponseDTO;
import com.dreamfinalproject.service.Bregister001Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bregister001")
@Validated
public class Bregister001Controller {

    @Autowired
    private Bregister001Service bregister001Service;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDTO> register(@Valid @RequestBody RegisterRequest request) {
        // ตรวจสอบว่ารหัสผ่านและการยืนยันรหัสผ่านตรงกันหรือไม่
        if (!request.isPasswordMatch()) {
            RegisterResponseDTO errorResponse = new RegisterResponseDTO("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน", false);
            return ResponseEntity.badRequest().body(errorResponse);
        }

        // เรียกใช้บริการเพื่อจัดการกับการลงทะเบียน
        RegisterResponseDTO result = bregister001Service.register(request);
        if (result.isSuccess()) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }
}
