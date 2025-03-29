package com.dreamfinalproject.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class Blogin002Repository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ค้นหาบทบาทและ user_id สำหรับ user จากตาราง users_info
    public String[] findUser(String username, String password, String role) {
        String sql = "SELECT Role, user_id FROM users_info WHERE (Email = ? OR Phone_number = ?) AND Password = ? AND Role = ?";
        try {
            return jdbcTemplate.queryForObject(sql, new Object[]{username, username, password, role},
                    (rs, rowNum) -> new String[]{rs.getString("Role"), rs.getString("user_id")});
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    // ค้นหาบทบาทและ officer_id สำหรับ officer จากตาราง officer_info
    public String[] findOfficerRole(String username, String password, String role) {
        String sql = "SELECT Role, officer_id FROM officer_info WHERE (Email = ? OR Phone_number = ?) AND Password = ? AND Role = ?";
        try {
            return jdbcTemplate.queryForObject(sql, new Object[]{username, username, password, role},
                    (rs, rowNum) -> new String[]{rs.getString("Role"), rs.getString("officer_id")});
        } catch (EmptyResultDataAccessException e) {
            return null; // หากไม่พบข้อมูลที่ตรงกับคำค้นหา
        }
    }
}
