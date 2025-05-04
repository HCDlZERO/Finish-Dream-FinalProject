package com.dreamfinalproject.controller;

import com.dreamfinalproject.dto.OTP007RequestDTO;
import com.dreamfinalproject.dto.OTP007ResponseDTO;
import com.dreamfinalproject.service.OTP007Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/otp007")
public class OTP007Controller {

    @Autowired
    private OTP007Service otp007Service;

    // 1. ขอ OTP
    @PostMapping("/request")
    public ResponseEntity<OTP007ResponseDTO> requestOtp(@RequestBody OTP007RequestDTO requestDTO) {
        return otp007Service.sendOtp(requestDTO.getEmail());
    }

    // 2. ยืนยัน OTP
    @PostMapping("/verify")
    public ResponseEntity<OTP007ResponseDTO> verifyOtp(@RequestBody OTP007RequestDTO requestDTO) {
        return otp007Service.verifyOtp(requestDTO.getEmail(), requestDTO.getOtpCode());
    }

    // 3. รีเซ็ตรหัสผ่าน
    @PostMapping("/reset-password")
    public ResponseEntity<OTP007ResponseDTO> resetPassword(@RequestBody OTP007RequestDTO requestDTO) {
        return otp007Service.resetPassword(requestDTO.getEmail(), requestDTO.getNewPassword());
    }
}
