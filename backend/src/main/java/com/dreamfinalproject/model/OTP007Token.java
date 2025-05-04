package com.dreamfinalproject.model;

import java.time.LocalDateTime;

public class OTP007Token {
    private String email;
    private String otpCode;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean verified;

    public OTP007Token(String email, String otpCode, LocalDateTime createdAt, LocalDateTime expiresAt, boolean verified) {
        this.email = email;
        this.otpCode = otpCode;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.verified = verified;
    }

    public String getEmail() { return email; }
    public String getOtpCode() { return otpCode; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public boolean isVerified() { return verified; }
}
