package com.dreamfinalproject.dto;

public class Blogin002ResponseDTO {
    private String username;
    private String role;
    private String token;
    private Integer id; // เพิ่มฟิลด์ id สำหรับ user_id หรือ officer_id

    public Blogin002ResponseDTO(String username, String role, String token, Integer id) {
        this.username = username;
        this.role = role;
        this.token = token;
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Integer getId() {
        return id; // คืนค่า id ที่เป็น user_id หรือ officer_id
    }

    public void setId(Integer id) {
        this.id = id; // กำหนดค่า id
    }
}
