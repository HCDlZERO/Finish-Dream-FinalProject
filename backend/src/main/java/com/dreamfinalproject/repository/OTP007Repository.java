package com.dreamfinalproject.repository;

import com.dreamfinalproject.model.OTP007Token;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDateTime;

@Repository
public class OTP007Repository {

    @Autowired
    private DataSource dataSource;

    public void saveOtp(String email, String otpCode, LocalDateTime createdAt, LocalDateTime expiresAt) {
        String sql = "INSERT INTO otp007_tokens (email, otp_code, created_at, expires_at, is_verified) VALUES (?, ?, ?, ?, 0)";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            ps.setString(2, otpCode);
            ps.setTimestamp(3, Timestamp.valueOf(createdAt));
            ps.setTimestamp(4, Timestamp.valueOf(expiresAt));
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public OTP007Token findLatestOtpByEmail(String email) {
        String sql = "SELECT TOP 1 * FROM otp007_tokens WHERE email = ? ORDER BY created_at DESC";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return new OTP007Token(
                        rs.getString("email"),
                        rs.getString("otp_code"),
                        rs.getTimestamp("created_at").toLocalDateTime(),
                        rs.getTimestamp("expires_at").toLocalDateTime(),
                        rs.getBoolean("is_verified")
                );
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public void markOtpVerified(String email) {
        String sql = "UPDATE otp007_tokens SET is_verified = 1 WHERE email = ? AND is_verified = 0";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
