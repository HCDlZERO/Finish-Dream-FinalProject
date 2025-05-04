package com.dreamfinalproject.dto;

public class Blogin002RequestDTO {
    private String username; // ใช้ได้ทั้ง email และ phoneNumber
    private String password;
    private String role;

    // Constructor
    public Blogin002RequestDTO() {}

    public Blogin002RequestDTO(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
