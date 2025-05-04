package com.dreamfinalproject.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

@Repository
public class OTP007UserRepository {

    @Autowired
    private DataSource dataSource;

    public boolean updatePasswordByEmail(String email, String newPassword) {
        String sql = "UPDATE users_info SET password = ? WHERE email = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, newPassword); // 🔐 ถ้าจะเข้ารหัส ควรใช้ BCrypt ที่นี่
            ps.setString(2, email);
            int rows = ps.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
