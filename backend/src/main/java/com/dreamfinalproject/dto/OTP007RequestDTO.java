package com.dreamfinalproject.dto;

public class OTP007RequestDTO {
    private String email;
    private String otpCode;        // optional: ใช้ตอน verify
    private String newPassword;    // optional: ใช้ตอน reset password

    // Constructors
    public OTP007RequestDTO() {
    }

    public OTP007RequestDTO(String email, String otpCode, String newPassword) {
        this.email = email;
        this.otpCode = otpCode;
        this.newPassword = newPassword;
    }

    // Getters and Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtpCode() {
        return otpCode;
    }

    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
