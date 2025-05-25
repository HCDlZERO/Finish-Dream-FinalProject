package com.dreamfinalproject.controller;

import com.dreamfinalproject.dto.RegisterRequest;
import com.dreamfinalproject.dto.RegisterResponseDTO;
import com.dreamfinalproject.service.Bregister001Service;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bregister001")
@Validated
public class Bregister001Controller {

    @Autowired
    private Bregister001Service bregister001Service;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDTO> register(@Valid @RequestBody RegisterRequest request) {

        // 🔐 เช็คว่ารหัสผ่านตรงกันหรือไม่
        if (!request.isPasswordMatch()) {
            return ResponseEntity.badRequest()
                    .body(new RegisterResponseDTO("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน", false));
        }

        // 🔄 เรียก service
        RegisterResponseDTO result = bregister001Service.register(request);

        // ✅ ป้องกัน null ด้วย fallback response ที่เหมาะสม
        if (result == null) {
            return ResponseEntity
                    .internalServerError()
                    .body(new RegisterResponseDTO("เกิดข้อผิดพลาดจากระบบ", false));
        }

        // 🟢 ส่งผลลัพธ์กลับตาม success flag
        return result.isSuccess()
                ? ResponseEntity.ok(result)
                : ResponseEntity.badRequest().body(result);
    }
}
