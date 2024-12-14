package com.dreamfinalproject.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@Repository
public class Bregister001Repository {

    @Autowired
    private DataSource dataSource; // Inject DataSource จาก Spring Configuration

    public boolean MemberRegister(String firstName, String lastName, String email, String phoneNumber, String role, String numberId, String password, String confirmPassword) {
        // ตรวจสอบว่า password กับ confirmPassword ตรงกันหรือไม่
        if (!password.equals(confirmPassword)) {
            System.out.println("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
            return false;
        }

        String sql = "SELECT * FROM Members WHERE First_name = ? AND Last_name = ? AND Number_id = ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            // กำหนดค่าพารามิเตอร์ใน SQL Query
            preparedStatement.setString(1, firstName);
            preparedStatement.setString(2, lastName);
            preparedStatement.setString(3, numberId);

            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                if (resultSet.next()) {
                    saveToUsersInfo(firstName, lastName, email, phoneNumber, role, numberId, password); // เก็บข้อมูลลง UsersInfo
                    return true;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean OfficerRegister(String firstName, String lastName, String email, String phoneNumber, String role, String numberId, String password, String confirmPassword) {
        // ตรวจสอบว่า password กับ confirmPassword ตรงกันหรือไม่
        if (!password.equals(confirmPassword)) {
            System.out.println("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
            return false;
        }

        String sql = "SELECT * FROM Officers WHERE First_name = ? AND Last_name = ? AND Number_id = ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            // กำหนดค่าพารามิเตอร์ใน SQL Query
            preparedStatement.setString(1, firstName);
            preparedStatement.setString(2, lastName);
            preparedStatement.setString(3, numberId);

            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                if (resultSet.next()) {
                    saveToUsersInfo(firstName, lastName, email, phoneNumber, role, numberId, password); // เก็บข้อมูลลง UsersInfo
                    return true;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private void saveToUsersInfo(String firstName, String lastName, String email, String phoneNumber, String role, String numberId, String password) {
        // คำสั่ง SQL สำหรับการแทรกข้อมูล โดยไม่รวมคอลัมน์ id
        String sql = "INSERT INTO users_info (First_name, Last_name, Email, Phone_number, Role, Number_id, Password) VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            // กำหนดค่าพารามิเตอร์ใน SQL Query
            preparedStatement.setString(1, firstName);
            preparedStatement.setString(2, lastName);
            preparedStatement.setString(3, email);
            preparedStatement.setString(4, phoneNumber);
            preparedStatement.setString(5, role);
            preparedStatement.setString(6, numberId);
            preparedStatement.setString(7, password);  // เก็บรหัสผ่านลงในฐานข้อมูล

            // แทรกข้อมูลลงในตาราง
            preparedStatement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
