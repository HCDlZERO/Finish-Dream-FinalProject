package com.dreamfinalproject.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.Valid;


public class RegisterRequest {

    @NotEmpty(message = "ชื่อไม่สามารถเว้นว่างได้")
    private String firstName;

    @NotEmpty(message = "นามสกุลไม่สามารถเว้นว่างได้")
    private String lastName;

    @Email(message = "รูปแบบอีเมลไม่ถูกต้อง")
    @NotEmpty(message = "อีเมลไม่สามารถเว้นว่างได้")
    private String email;

    @NotEmpty(message = "รหัสผ่านไม่สามารถเว้นว่างได้")
    private String password;

    @NotEmpty(message = "การยืนยันรหัสผ่านไม่สามารถเว้นว่างได้")
    private String confirmPassword;

    @Pattern(regexp = "^\\+?[0-9]{10,13}$", message = "หมายเลขโทรศัพท์ไม่ถูกต้อง")
    private String phoneNumber;

    @NotEmpty(message = "บทบาทไม่สามารถเว้นว่างได้")
    private String role;

    @NotEmpty(message = "หมายเลขบัตรประจำตัวไม่สามารถเว้นว่างได้")
    private String numberId;

    // Default Constructor
    public RegisterRequest() {
    }

    // ตัวสร้าง, Getter และ Setter
    public RegisterRequest(String firstName, String lastName, String email, String password,
                           String confirmPassword, String phoneNumber, String role, String numberId) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.numberId = numberId;
    }

    // Getter และ Setter
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getNumberId() {
        return numberId;
    }

    public void setNumberId(String numberId) {
        this.numberId = numberId;
    }

    // ตรวจสอบว่ารหัสผ่านและการยืนยันรหัสผ่านตรงกันหรือไม่
    public boolean isPasswordMatch() {
        return this.password.equals(this.confirmPassword);
    }
}