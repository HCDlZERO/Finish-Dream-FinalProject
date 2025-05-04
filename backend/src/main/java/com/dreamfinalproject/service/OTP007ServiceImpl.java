package com.dreamfinalproject.service;

import com.dreamfinalproject.dto.OTP007ResponseDTO;
import com.dreamfinalproject.repository.OTP007Repository;
import com.dreamfinalproject.repository.OTP007UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OTP007ServiceImpl implements OTP007Service {

    @Autowired
    private OTP007Repository otp007Repository;

    @Autowired
    private OTP007UserRepository otp007UserRepository;

    @Autowired
    private EmailService emailService;  // ✅ เพิ่มอันนี้

    @Override
    public ResponseEntity<OTP007ResponseDTO> sendOtp(String email) {
        String otpCode = generateOtp();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(5);

        otp007Repository.saveOtp(email, otpCode, now, expiresAt);
        emailService.sendOtpEmail(email, otpCode); // ✅ เรียกส่งอีเมล

        return ResponseEntity.ok(new OTP007ResponseDTO("OTP has been sent.", true));
    }

    @Override
    public ResponseEntity<OTP007ResponseDTO> verifyOtp(String email, String otpCode) {
        var token = otp007Repository.findLatestOtpByEmail(email);
        if (token == null) {
            return ResponseEntity.badRequest().body(new OTP007ResponseDTO("No OTP found.", false));
        }
        if (token.isVerified()) {
            return ResponseEntity.badRequest().body(new OTP007ResponseDTO("OTP already used.", false));
        }
        if (!token.getOtpCode().equals(otpCode)) {
            return ResponseEntity.badRequest().body(new OTP007ResponseDTO("Incorrect OTP.", false));
        }
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(new OTP007ResponseDTO("OTP expired.", false));
        }

        otp007Repository.markOtpVerified(email);
        return ResponseEntity.ok(new OTP007ResponseDTO("OTP verified.", true));
    }

    @Override
    public ResponseEntity<OTP007ResponseDTO> resetPassword(String email, String newPassword) {
        var token = otp007Repository.findLatestOtpByEmail(email);
        if (token == null || !token.isVerified()) {
            return ResponseEntity.badRequest().body(new OTP007ResponseDTO("OTP not verified.", false));
        }

        boolean updated = otp007UserRepository.updatePasswordByEmail(email, newPassword);
        if (!updated) {
            return ResponseEntity.badRequest().body(new OTP007ResponseDTO("Failed to update password.", false));
        }

        return ResponseEntity.ok(new OTP007ResponseDTO("Password has been reset.", true));
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }
}
