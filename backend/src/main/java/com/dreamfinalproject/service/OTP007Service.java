package com.dreamfinalproject.service;


import com.dreamfinalproject.dto.OTP007ResponseDTO;
import org.springframework.http.ResponseEntity;

public interface OTP007Service {
    ResponseEntity<OTP007ResponseDTO> sendOtp(String email);
    ResponseEntity<OTP007ResponseDTO> verifyOtp(String email, String otpCode);
    ResponseEntity<OTP007ResponseDTO> resetPassword(String email, String newPassword);
}

