package com.dreamfinalproject.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class Blogin002Repository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public String findUserRole(String username, String password, String role) {
        String sql = "SELECT Role FROM users_info WHERE (Email = ? OR Phone_number = ?) AND Password = ? AND Role = ?";
        try {
            return jdbcTemplate.queryForObject(sql, new Object[]{username, username, password, role}, String.class);
        } catch (Exception e) {
            throw new RuntimeException("Invalid username or password or role");
        }
    }
}
